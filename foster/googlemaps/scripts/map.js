var map;
var infoWindow;
var geocoder;
var markerClusterer = null;
var markers = [];

var markerimages =[
"http://street-view.co.il/dev/wp-content/themes/yoo_shelf_wp/layouts/googlemaps/images/bicon.png",
"http://maps.gstatic.com/intl/en_ALL/mapfiles/marker_orange.png",
"http://street-view.co.il/dev/wp-content/themes/yoo_shelf_wp/layouts/googlemaps/images/gicon.png",
"http://maps.gstatic.com/intl/en_ALL/mapfiles/marker_purple.png",
"http://maps.gstatic.com/intl/en_ALL/mapfiles/marker_yellow.png",
"http://street-view.co.il/dev/wp-content/themes/yoo_shelf_wp/layouts/googlemaps/images/ricon.png"
];

var cateindex = 0;
/**
 * initialize the map, and show markers
 *
 */
function map_initialize(mapoption,data) {
	var initLoc;
    
	var options = $.extend({
			zoom:8
		}, mapoption);
		
	options.map_canvas=mapoption.map_canvas;
	
	if(mapoption.latitude && mapoption.longtitude
		&& mapoption.latitude !="" && mapoption.longtitude!=""){
		initLoc = new google.maps.LatLng(mapoption.latitude,mapoption.longtitude);
		options.initLoc = initLoc;
		_init(options,data);
	}else if(mapoption.defaultaddress!="" && (mapoption.latitude == null || mapoption.latitude =="" 
	|| mapoption.longtitude == null || mapoption.longtitude=="")){
		geocoder = new google.maps.Geocoder();
		MapSearch(mapoption.defaultaddress,function(result){
			options.initLoc = result.location;
			_init(options,data);
		});
	}else{
		initLoc = new google.maps.LatLng(54.622978,-2.592773);
		options.initLoc = initLoc;
		_init(options,data);
	}
	
	
    
	 
}
function _init(options,data){
	var myOptions = {
        zoom: options.zoom,
        center: options.initLoc,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
		mapTypeControl:true,
		scrollwheel: false,
		minZoom:3
    };
    map = new google.maps.Map(options.mapcanvas, myOptions);

	//initialize the infowindow	
    infoWindow = new google.maps.InfoWindow({
        content: "Not Initialised!",
        maxWidth: 400,
		disableAutoPan:true
		
    });
	
	
    google.maps.event.addListener(map, 'click', function() {
		infoWindow.close(map, this);
		$(".mouseoverDiv").removeClass("mouseoverDiv");	
	}); 
	google.maps.event.addListener(infoWindow, 'closeclick', function() {
		$(".mouseoverDiv").removeClass("mouseoverDiv");
	}); 
	
    getData(data);
 
}
function clearResult(){
	if (markerClusterer) {
	  markerClusterer.clearMarkers();
	}
	for(var i =0;i<markers.length;i++){
		var catemarkers = markers[i];
		for(var j =0;j<catemarkers.length;j++){
			catemarkers[j].setMap(null);
		}	
	}
	markers = [];
	cateindex = 0;
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
function getData(d) {
	
	var markerDataList=d.data; 
	
	if(markerDataList==null) {
		return;
	}
	
	clearResult();
	var resultData = [];
	
	for (var k = 0; k < markerDataList.length; ++k) {
		
		resultData = [];	
		var cateid= markerDataList[k].category;
		var catename = markerDataList[k].categoryname;
		
		var marerlist = markerDataList[k].list;
		if(marerlist.length==0){continue;}
		
		for (var i = 0; i < marerlist.length; ++i) {
			var latLng = new google.maps.LatLng(marerlist[i].latitude,marerlist[i].longitude)
			 
			resultData.push(marerlist[i]);
			 
		}
		
		
		
		_makeMarkers(cateindex,cateid,resultData);
		_makesideList(cateindex,cateid,catename,markerDataList[k].permalink,resultData);
		cateindex +=1;
	}
	_regEvent();
	
}
function _showloading(){
	$("#loading").show();
	$("#result-title").html('<img src="images/load.gif" id="loading">');
}
 
function _showCategoryMarkers(cateindex){
	for(var i =0;i<markers.length;i++){
		var catemarkers = markers[i];
		var display = cateindex==i? true:false;
		for(var j =0;j<catemarkers.length;j++){
			catemarkers[j].setVisible(display);
		}	
	}
 
}
function _showAllCategoryMarkers(){
	for(var i =0;i<markers.length;i++){
		var catemarkers = markers[i];
		var display = true;
		for(var j =0;j<catemarkers.length;j++){
			catemarkers[j].setVisible(display);
		}	
	}
 
}
/**
 * make the markers 
 *
 
 * @private
 */
function _makeMarkers(cateindex,cateid,data){
	var cateimage = markerimages[cateindex];
	var catemarkers =[];
	for (var i = 0; i < data.length; ++i) {

	  var latLng = new google.maps.LatLng(data[i].latitude,
		  data[i].longitude)
		  var image = new google.maps.MarkerImage(cateimage);
	  	 var companyShadow = new google.maps.MarkerImage('http://street-view.co.il/dev/wp-content/themes/yoo_shelf_wp/layouts/googlemaps/images/blshadow.png',
					new google.maps.Size(41,35),
		  new google.maps.Point(0,0),
		  new google.maps.Point(15,35)
		  );
	  var marker = new google.maps.Marker({  
		   position: latLng,
		   title:data[i].name,
		   //animation: google.maps.Animation.DROP,
		   map:map,
		   icon:image,
		   shadow: companyShadow,
	  });
	
	  marker.cateid = cateid;	
	  marker.mID = data[i].mID;
	  marker.html = "<div style='float:left;padding:4px;width:310px;height:80px;overflow:auto;'>"+  _makeHtml(data[i]) + "</div>";
	   
	  //add click event, hightlight the sidebar item
	  google.maps.event.addListener(marker, 'click', function() {
			infoWindow.setContent(this.html);
			infoWindow.open(map, this);
	   });
      
	   catemarkers.push(marker);
	} 
	markers.push(catemarkers);
	// markerClusterer = new MarkerClusterer(map, markers,{maxZoom:12});
}
 
function _makeHtml(item){
	return " <div style='float:left;margin-left:8px;'>"
	  +"<p><a target='_blank' class='bold' href='"+item.mID+"'>Name:"+ item.name+"</a></p><p>Address:"+ item.address+"</p>"
	  +"</div>";	
}

/**
 * Generate the sidebar html
 *
 * @param {Object} data The markers to be made into list.
 * @private
 */
function _makesideList(cateindex,cateid,catename,permcat,data){
	var html="";
	if(data.length==0){
		return;
	}
	html +='<div class="location-column"><h2 class="schools"><img src="'+markerimages[cateindex]+'" /> '+catename+'</h2><p>';
 
	for (var i = 0; i < data.length; ++i) {
	  if(data[i].name!=""){
	  html +="<a href='#'  class='location' cate='"+cateindex+"' marker='"+i+"' rel='"+data[i].mID+"'><strong>"+data[i].name+"</strong></a><br />";
	  }
	}
	html +="</p></div>";
	
	$("#dataList").append(html);
	
	if((cateindex+1)%3==0){
		//$("#dataList").append('<br class="clear" />	 	');
	}
 									
	$('<li><a href="#" class="schools" ref='+ cateindex +'><span><img src="'+markerimages[cateindex]+'" /> </span>'+ catename +'</a></li>	').appendTo($("#filters"));

}
function _regEvent(){
	
	$("#filters").find("li>a").unbind("click").click(function(){
		infoWindow.close(map, this);
		
		$("#filters .active").removeClass("active");
		$(this).addClass("active");
		if($(this).attr("ref")=="all"){
			_showAllCategoryMarkers();
		}else{
			_showCategoryMarkers($(this).attr("ref"));
		}
	});
		 
	
	//bind click to the div in datalist, trigger marker's click and show infowindow
	$("#dataList").find("a.location").unbind("click").click(function(){
		var cindex = $(this).attr("cate");
		var mindex = $(this).attr("marker");
		$(".selectedDiv").removeClass("selectedDiv");
		$(this).addClass("selectedDiv");
		var marker = markers[cindex][mindex];
		if(marker){
			marker.setVisible(true);
			map.setZoom(13);
			map.setCenter(marker.getPosition());
			google.maps.event.trigger(marker, "click");
		}
	});
	$("#dataList").find("a.location").hover(function(){
		$(".mouseoverDiv").removeClass("mouseoverDiv");
		$(this).addClass("mouseoverDiv");
	},function(){
		$(".mouseoverDiv").removeClass("mouseoverDiv");
	})
}
/**
 * Search the google map by Geocoder
 *
 * @param {String} address.
 */
function MapSearch(address,callback) {
    if (address == "")
        return;
    if (geocoder) {
        geocoder.geocode({ 'address': address}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
				if(results.length>0){
					if(callback){
						callback(results[0].geometry);
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
 