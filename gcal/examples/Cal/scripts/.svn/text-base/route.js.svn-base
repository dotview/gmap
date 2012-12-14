var directionsDisplay;
var directionsService = new google.maps.DirectionsService();
var map;
var infoWindow;
var polylines = [];
var markers = [];
var dayroutes;
var geocoder;
var searchCount = 0;
var newdayroutes = [];
var nonedayroutes =[];
var icons = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T"];
function initialize() {
    geocoder = new google.maps.Geocoder();
    var myOptions = {
        zoom: 11,
        center: new google.maps.LatLng( - 25.633370000000003, 28.0984),
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
    directionsDisplay = new google.maps.DirectionsRenderer({
        'map': map,
        'preserveViewport': true,
        'draggable': false
    });
    directionsDisplay.setPanel(document.getElementById("directions_panel"));

	$("#btnSubmit").click(function() {
        getRoute();
    });
    infoWindow = new google.maps.InfoWindow({
        content: "Not Initialised!",
        maxWidth: 400
    });
	$("#btnFilter").bind("click",function(e){
					bindOverlay();
			});bindOverlay();
    //getRoute();
}

google.maps.event.addDomListener(window, 'load', initialize);
function bindOverlay(){
			//overlay
			var overlayobj=$("#filterbox").overlay({
				mask: {
					color: '#000',
					loadSpeed: 200,
					opacity: .1,
					zIndex: 10101
				},
				closeOnClick: false,
				closeOnEsc: true,
				zIndex: 10102,
				fixed:false,
				load:true
			});
			
			overlayobj.load();
		}
function showLoading(){
	$("#directions_panel").html("<img src=\"images/progressbar.gif\" />");
}
function getRoute() {
	showLoading();
    $.ajax({
        type: "POST",
        url: "caldata.php",
        cache: true,
        dataType: "json",
        data:   $("form").serialize(),
        success: function(d) {
            if (d.result == 0) {
                $("#directions_panel").html("<p style=\"color:red;\">No calender data return</p>");
            } else {
                dayroutes = d.data.items;
                calcRoute();
            }
        },
        error: function(d) {
            $("#directions_panel").html("<p style=\"color:red;\">Search calender data error</p>");
        }
    })
}
function reset() {
	searchCount = 0;
	newdayroutes = [];
	nonedayroutes =[];
    infoWindow.close();
    for (var j in markers) {
        markers[j].setMap(null);
    }
	markers =[];
    for (var k in polylines) {
        polylines[k].setMap(null);
    }
	polylines=[];
}
var paths=[];
function codeAddress(dayroute,icon,callback) {
	if(dayroute.lat&&dayroute.lng){
		var loc = new google.maps.LatLng(dayroute.lat,dayroute.lng);
		map.setCenter(loc);
                
		dayroute.found = true;
		dayroute.latlng = loc;
		searchCount +=1;
		paths.push(loc);
		var markerhtml  = getPlaceHtml(dayroute,icon,true,true);
		var marker = createMarker(loc, icon,address, markerhtml);
		markers.push(marker); 
				
		if(callback!=null)callback();
		return;
	}
    var address = decodeURI(dayroute.location);
	if(readCookie("gmap_location_"+MakeAddress(address))==null){
    geoSearch(address,function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				var loc = results[0].geometry.location;
                map.setCenter(loc);
				
				dayroute.found = true;
				dayroute.latlng = loc;
				paths.push(loc);
				var markerhtml  = getPlaceHtml(dayroute,icon,true,true);
				var marker = createMarker(loc, icon,address, markerhtml);
                markers.push(marker); 
				
				createCookie("gmap_location_"+MakeAddress(address),loc.lat()+"|"+loc.lng());
            }
			else{
				dayroute.found = false;
			}
			searchCount +=1;
			if(callback!=null)callback();
        })
	}else{
		var strlatlng = readCookie("gmap_location_"+MakeAddress(address));
		var latlng = strlatlng.split("|");
		var loc = new google.maps.LatLng(latlng[0],latlng[1]);
		map.setCenter(loc);
                var markerhtml  = getPlaceHtml(dayroute,icon,true,true);
				var marker = createMarker(loc, icon,address, markerhtml);
                markers.push(marker); 
				dayroute.found = true;
				dayroute.latlng = loc;
				searchCount +=1;paths.push(loc);
				if(callback!=null)callback();
	}
}
var isFound = false;
function calcRoute() {
	 
	for (var i = 0; i < dayroutes.length; i++) {
		codeAddress(dayroutes[i],icons[i],searchDone);
	}
	 
    $("#directions_panel").html(showAppointment(dayroutes));   
	
	$(".icon").click(function(){
		var icon = $(this).attr("id");
		$(".selectedicon").removeClass("selectedicon");
		$(this).addClass("selectedicon");
		for (var j in markers) {
			if("icon"+markers[j].icons==icon){
				 google.maps.event.trigger(markers[j], "click");
			}
		}
	})	
}
 function searchDone(i){
	if(searchCount==dayroutes.length){
		 var polyOptions = {
                strokeColor: '#0000AA',
                strokeOpacity: 0.7,
                strokeWeight: 4,
                path: paths
            }
            var polyline = new google.maps.Polyline(polyOptions);
            polyline.setMap(this.map);
	}
}
function showAppointment(routes) {
    var html = [];
 
    for (var i = 0; i < routes.length; i++) {
		html.push(getPlaceHtml(routes[i],icons[i],false,routes[i].found?false:true));
	}
	
	return html.join("");
    
}
function getPlaceHtml(route,icon,ismarker,updateAddress) {
    var summary = decodeURI(route.summary);
    var apptime = route.start!=null? route.start.dateTime:"";
    var address = decodeURI(route.location);
    var image = "http://maps.gstatic.com/mapfiles/markers2/icon_green" + icon + ".png";
    var markerhtml = '<p style="font-weight:bold;">Time:' + apptime + '</p><p style="font-weight:bold;">summary:' + summary + '</p>' + address + '';
	if(!ismarker){
		var result = '<div id="icon'+icon+'" class="icon"><table id="adp-placemark" class="adp-placemark"><tbody><tr><td><img src="' + image + '"></td><td class="adp-text">' + markerhtml + '</td></tr></tbody></table></div>';
		
		return result;
	}
	else{

		return markerhtml;
	}
}
function geoSearch(address,callback) {
    if (geocoder) {
        geocoder.geocode({
            'address': address
        },callback)
    }
}
function createMarker(point, icon, title, html) {
	var image = "http://maps.gstatic.com/mapfiles/markers2/icon_green" + icon + ".png";
    var marker = new google.maps.Marker({
        map: map,
        draggable: false,
        position: point,
        icon: image,
		title:title
    });
	marker.icons = icon;
    google.maps.event.addListener(marker, 'click', function() {
		infoWindow.setContent(html);
		infoWindow.open(map, marker);
		$(".selectedicon").removeClass("selectedicon");
		$("#icon"+icon).addClass("selectedicon");
		$('div#directions_panel').stop().scrollTo("#icon"+icon,800);
	});
    return marker;
}
function MakeAddress(address){
	address = decodeURI(address);
	address = address.replace(/\"/g,"");
	address = address.replace(/\'/g,"");
	address = address.replace(/\,/g,"");
	address = address.replace(/\;/g,"");
	address = address.replace(/\s/g,"");
 
	return address;
}
function createCookie(name,value,days) {
	if (days) {
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		var expires = "; expires="+date.toGMTString();
	}
	else var expires = "";
	document.cookie = name+"="+value+expires+"; path=/";
}

function readCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}

function deleteCookie(name) {
	createCookie(name,"",-1);
}