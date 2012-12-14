var map,
infoWindow,
geocoder,
markerClusterer = null,
markers = [],
range_bounds,
panoramioLayer,
markerDataList,
enableIDLEEvent = true,
oldlocation = "",
helper = new google.maps.OverlayView(),
curmarker,
imagePath = "http://www.everydayoffers.co.uk/uploadedimages/",
OfferBaseUrl ="OfferDetail.asp?OfferID=",

HMImage = {},
isClick = false, 

oldOfferType ="-",
oldnational ="-";
 
/**
 * initialize the map, and show markers
 *
 */
function map_initialize() {
	var initLoc = new google.maps.LatLng(54.622978,-2.592773);
    geocoder = new google.maps.Geocoder();
    var myOptions = {
        zoom: 6,
        center: initLoc,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
		mapTypeControl:true,
		minZoom:3
    };
    map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);

	panoramioLayer = new google.maps.panoramio.PanoramioLayer();
	
	range_bounds = new google.maps.LatLngBounds(
		new google.maps.LatLng(49.5,-12.3)
		,new google.maps.LatLng(58.47,4.47)
	);
	//initialize the infowindow	
    /*infoWindow = new google.maps.InfoWindow({
        content: "Not Initialised!",
        maxWidth: 400,
		disableAutoPan:true
    });*/
	infoWindow = $('<div class="infowindow">'
						+'		<div class="close">x</div>'
						+'		<div class="hinweistip-content">'
						+'		</div>'
						+'		 <span class="stem"></span>'
						+'</div>');
			
			infoWindow.hide();
			infoWindow.appendTo("body");
 
	
	helper.setMap(map);
	helper.draw = function () { 
		if (!this.ready) { 
			this.ready = true; 
			google.maps.event.trigger(this, 'ready'); 
		} 	
	}; 
	var filterDiv = document.createElement('DIV');
    var mControl = new FilterControl(filterDiv, map);
    filterDiv.index = 1;
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(filterDiv);
	
    getData();
	$("#btnSubmit").click(function(){
		 getData();
		 makeShareUrl();
	});
	google.maps.event.addListener(map, 'idle', function() {
		getData_ClientFiltering();
	});
	google.maps.event.addListener(map, 'zoom_changed', function () {
		updatePos(false);
	});
	google.maps.event.addListener(map, 'drag', function () {
		updatePos(false);
	});
	google.maps.event.addListener(map, 'idle', function () {
		updatePos(false);
	});
	$("#location").bind('keydown', function (e) {
            var key = e.which;
            if (key == 13) {
				$("#btnSubmit").trigger("click");
				//getData();
                e.preventDefault();
            }
    });
	$("#linkShare").click(function(){
		if($("#sharebox").css("display")=="none"){
			makeShareUrl();
			$("#sharebox").show();
		}
		else{
			$("#sharebox").hide();
		}
	})
	$(".close").bind("click",function(){
		$(this).parent().fadeOut();
	});
}
/**
 * make share url
 *
 */
function makeShareUrl(){
	var OfferType = $("#OfferType").val();
	var location = $("#location").val();
	var national =  $("#national").val();
	var mUrl = document.URL;
    $("#sharelink").val("http://"+$("#curUrl").val()+"?OfferType="+OfferType + "&national="+national +"&location="+encodeURI(location));
}
/**
 * add more button to google map
 *
 */
function FilterControl(controlDiv, map) {
	controlDiv.style.padding = '4px 0';
    var controlUI = document.createElement('DIV');
    controlUI.style.cssText = ' position:relative;height:30px;padding:1px 0;margin:2px 0;cursor:pointer;font-size:13px;color:#000;';
   
   var spMore = $("<span style='border:1px solid #666;padding:1px 2px;cursor:pointer;background:#fff;'>More</span>");

    spMore.appendTo(controlUI);
	$("#divmore").appendTo(controlUI);
	$(controlUI).hover(function(){$("#divmore").show()},
	function(){$("#divmore").hide()});
    controlDiv.appendChild(controlUI);
}
function refreshTooltipPos(targetObj){
	var top1,left1;	
	top1= targetObj.offset().top+40;
	left1= targetObj.offset().left-90;
	mapTooltip.css({
		top:top1,
		left:left1
	});
} 
/*
* update the popup location when click another pin
*/
function updatePos(isNew){
	if(curmarker==null) {return;}
	if(!map.getBounds().contains(curmarker.getPosition())){
		infoWindow.fadeOut();
		return;
	}
	projection = helper.getProjection();
	var position =  projection.fromLatLngToContainerPixel(curmarker.getPosition());//fromLatLngToContainerPixel
	var boxWidth = 320;
    var boxHeight = 90;
	
	var mapWidth = map.getDiv().offsetWidth;
    var mapHeight = map.getDiv().offsetHeight;
	
    var left = 0;
    var top = 0;
    var xStart = position.x - 30;
    var xEnd = position.x + boxWidth
    var yStart = position.y;
    var yEnd = position.y + boxHeight;
	
	var border_width = "";
	var border_color = "";
	var dir_css = {};
	if (xEnd > mapWidth){
        left = position.x  - boxWidth+30;
		dir_css.right = "30px";
		dir_css.left = "auto";
	}
    else{
        left = position.x - 42;
		dir_css.left = "29px";
		dir_css.right = "auto";
		}

    if (yStart-boxHeight-40 <=0){
        top = position.y + boxHeight+20;
		dir_css.top = "-12px";
		dir_css.bottom = "auto";
		dir_css.borderWidth ="0 10px 10px 10px";
		dir_css.borderColor ="transparent transparent #FFC631 transparent";
		}
    else{
        top = position.y-50;
		dir_css.top = "auto";
		dir_css.bottom = "-12px";
		dir_css.borderWidth ="10px 10px 0";
		dir_css.borderColor ="#FFC631 transparent transparent";
	}
	infoWindow.css({top:top,left:left});	
	$(".stem").css(dir_css);
	 
	//infoWindow.css({top:position.y-25,left:position.x});
	if(isNew){
		$(".hinweistip-content").html(curmarker.html);
		infoWindow.fadeIn();
	}
}
function setMore(obj,i) {
	if(obj.checked) {
		switchLayer(true);
	}
	else {
		switchLayer(false);
	}
}

/**
 * switch Layer
 *
 */
function switchLayer(checked, layer) {
	if(checked) {
		panoramioLayer.setMap(map);
	}
	else {
		panoramioLayer.setMap(null);
	}
};
 
/**
 * Group the markers into cluster
 *
 * @param {Object} data The markers to be made into cluster.
 * @private
 */
function _makeCulster(data){
	//clear markers
	if (markerClusterer) {
	  markerClusterer.clearMarkers();
	}

	markers = [];

	for (var i = 0; i < data.length; ++i) {
	  var latLng = new google.maps.LatLng(data[i].latitude,
		  data[i].longitude)
	  var marker = new google.maps.Marker({
	   position: latLng,
	   title:data[i].OfferTitle
	  });

	  marker.OfferID = data[i].OfferID;
	  marker.html = "<div style='float:left;padding:4px;width:310px;height:80px;overflow:auto;'>"+  _makeHtml(data[i]) + _checkSameCoord(marker,data)+"</div>";
	   
	  //add click event, hightlight the sidebar item
	  google.maps.event.addListener(marker, 'click', function() {
			//infoWindow.setContent(this.html);
			//infoWindow.open(map, this);
			curmarker = this;
			updatePos(true);
			isClick = true;
			$(".selectedDiv").removeClass("selectedDiv");
			$("div[ref='"+this.OfferID+"']").addClass("selectedDiv");
			if($("div[ref='"+this.OfferID+"']")[0]){
				$('#toolbox').stop().scrollTo("div[ref='"+this.OfferID+"']",800);
			}
	   });
	    google.maps.event.addListener(marker, 'mouseover', function() {
			curmarker = this;
			updatePos(true);
			isClick= false;
		});
		google.maps.event.addListener(marker, 'mouseout', function() {
			if(isClick){return;}
			curmarker = null;
			infoWindow.hide();
		});
	  markers.push(marker);
	} 
	markerClusterer = new MarkerClusterer(map, markers,{maxZoom:12});
}
function _checkSameCoord(marker,data){
	var html ="";
	for (var i = 0; i < data.length; ++i) {
		var latLng = new google.maps.LatLng(data[i].latitude,
		  data[i].longitude);
		if(marker.OfferID != data[i].OfferID && marker.getPosition().equals(latLng)){
			html += "<span style='float:left;width:95%;border:1px solid #999;margin:8px 0;'></span>"
			+ _makeHtml(data[i]);	  
		}  
	}
	return html;
}
function _makeHtml(item){
	return "<img onerror=\"ImgError(this);\" onload=\"imgReSize(this,50,80)\" style='float:left;margin-top:4px' src='"+imagePath+item.OfferImage+"' />"
	  +" <div style='float:left;margin-left:8px;width:230px;'>"
	  +"<p><a target='_blank' class='bold' href='"+OfferBaseUrl+item.OfferID+"'>"+ item.OfferTitle+"</a></p><p>"+ item.CompanyName+"</p><p>"+ item.address+"</p>"
	  +"</div>";	
}
/**
 * Generate the sidebar html
 *
 * @param {Object} data The markers to be made into list.
 * @private
 */
function _makesideList(data){
	$("#dataList").empty();
	var html = "";
	if(data.length==0){
		$("#result-title").html("No result Found ");
		$("#dataList").empty();
		return;
	}
	$("#result-title").html("Found "+ data.length +" results");
	for (var i = 0; i < data.length; ++i) {
	  html +="<div class='item' ref='"+ data[i].OfferID +"'>"+ _makeHtml(data[i])+"</div>";
	}
	$("#dataList").html(html);
	
	//bind click to the div in datalist, trigger marker's click and show infowindow
	$("#dataList").find("div.item").click(function(){
		infoWindow.hide();
		$("#mpage").slideUp('slow',function(){
			$("#spage").slideDown();
		});
		
		$("#scontent").html($(this).html());
		/*var OfferID = $(this).attr("ref");
		$(".selectedDiv").removeClass("selectedDiv");
		$(this).addClass("selectedDiv");
		for (var j in markers) {
			if(markers[j].OfferID==OfferID){
				if(!markers[j].getVisible() || !checkInbounds(markers[j].getPosition())){
					map.setZoom(13);
					map.setCenter(markers[j].getPosition());
				}
				
				google.maps.event.trigger(markers[j], "click");
			}
		}*/
	});
	$("#back").click(function(){
		$("#mpage").slideDown('slow');
		$("#spage").slideUp('slow');
	})
	$("#dataList").find("div.item").hover(function(){
		$(".mouseoverDiv").removeClass("mouseoverDiv");
		$(this).addClass("mouseoverDiv");
		enableIDLEEvent = false;
	},function(){
		$(".mouseoverDiv").removeClass("mouseoverDiv");
		enableIDLEEvent = true;
	});
}
function clearResult(){
	if (markerClusterer) {
	  markerClusterer.clearMarkers();
	}

	markers = [];
	$("#loading").hide();

	$("#dataList").empty();
}
function checkInbounds(latLng){
	var bounds = map.getBounds();
	return bounds.contains(latLng);
}
/**
 * filter data in client way,according to the viewport of the google map
 *
 */
function getData_ClientFiltering(){
	if(markerDataList==null || !enableIDLEEvent){ return;}
	var resultData = [];
	var bounds = map.getBounds();
	for (var i = 0; i < markerDataList.length; ++i) {
		var latLng = new google.maps.LatLng(markerDataList[i].latitude,
			markerDataList[i].longitude)
		if(bounds && bounds.contains(latLng)){
			resultData.push(markerDataList[i]);
		}
	}
	_makeCulster(resultData);
	_makesideList(resultData);
	$("#loading").hide();
}
function _showloading(){
	$("#loading").show();
	$("#result-title").html('<img src="images/load.gif" id="loading">');
}
/**
 * Get json data from the server
 *
 */
 
function getData() {
	var OfferType = $("#OfferType").val();
	var location = $("#location").val();
	var national =  $("#national").val();
	
	//set map viewport && oldlocation != location
	if(location!="" ){
		MapSearch(location);
		oldlocation = location;
	}
	if(oldOfferType == OfferType && oldnational==national){ return;}
	
	_showloading();
	
	//get server data
    $.ajax({
        type: "GET",
        //url: "getData.asp",
		url: "data.json",
        cache: true,
        dataType: "json",
        data: {
            OfferType: OfferType,
			national: national		
        },
        success: function(d) {
			markerDataList = d.data;
			oldOfferType = OfferType ;
			oldnational=national;
            if (d.result == 0) {

                $("#result-title").html("No results found"); 
				clearResult();
            } else {
				/*var mData = d.data;
                _makeCulster(mData);
				_makesideList(mData);*/
				getData_ClientFiltering();
				$("#loading").hide();
            }
        },
        error: function(d) {
            alert('search error');
			$("#loading").hide();
			$("#result-title").html("search error");
        }
    });
}
 
/**
 * Search the google map by Geocoder
 *
 * @param {String} address.
 */
function MapSearch(address,callback) {
    if (address == "")
       { return;}
    if (geocoder) {
        geocoder.geocode({ 'address': address ,'region':'uk'}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
				//if(checkIsInBounds(results[0].geometry.location)){
				if(results.length>0){
					map.fitBounds(results[0].geometry.viewport);
					map.setCenter(results[0].geometry.location);
					if(callback){
						callback(results[0].geometry.viewport);
					}
				}else{
					alert("No address is found, please try again!");
				}
            } else {
                alert("Can not find the place: " + address + " ");
            }
        });
    }
}
function checkIsInBounds(latlng) {
	if (range_bounds.contains(latlng)) {
		return true;
	}else{
		return false;
	}
}

function SetMiddle(image, height) {
    if (typeof (image) == 'string'){ image = document.images[image] || document.getElementById(image);}
    var div = image.parentNode;

    if (div.nodeName != "DIV") {

        div = div.parentNode;
    }
    if (image.height > 0 && image.height < height) {
        //var marginTopVal = (height - image.height) / 2;
        //image.style.marginTop = parseInt(marginTopVal) + "px";
    }
    else {
        image.height = height;
        image.style.marginTop = "0px";
    }
}


function imgReSize(imgObj, w, h) {
    HMImage.Resize1(imgObj, w, h); 
	SetMiddle(imgObj, h);
}

function ImgError(image, w, h) {
var width = w==null?"150":w;
var height = h==null?"100":h;

image.src = 'images/null_120.jpg';
//imgReSize(image,w,h);
}


HMImage.Resize1 = function(image, width, height) {
    if (width == null || height == null)
       { return;}
    image.removeAttribute('width');
    image.removeAttribute('height');
    var w = image.width, h = image.height;
    var scalingW = w / width, scalingH = h / height;
    var scaling = w / h;
    if (scalingW >= scalingH) {
        image.width = width;
        image.height = width / scaling;
    }
    else {
        image.height = height;
        image.width = height * scaling;
    }
};