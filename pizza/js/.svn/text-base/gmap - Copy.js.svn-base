var map;
	var geocoder;
	var gmarker;
	var qstr;
	var directionsDisplay;
	var directionsService = new google.maps.DirectionsService();
	var infowindow = new google.maps.InfoWindow();
	var image = "images/phlogo.png";
	var circle;
	var markers = [];
	var polylines =[];
	
    function init() {	
		directionsDisplay = new google.maps.DirectionsRenderer();
		geocoder = new google.maps.Geocoder();
		var bounds = new google.maps.LatLngBounds();
		
		var center = new google.maps.LatLng(30.5, 70.4);
		var mapOptions = {
			zoom: 5,
			center: center,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			zoomControl: true,
			zoomControlOptions: {
				style: google.maps.ZoomControlStyle.SMALL
			},
			mapTypeControl: true,
			mapTypeControlOptions: {
				style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
			}
		};
			
		map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
		
		directionsDisplay.setMap(map);
		
		google.maps.event.addListener(map, "rightclick", function(event){
			waitOn();
			getDirections(event.latLng);
		});	
		
		
		downloadUrl("data/fetchdata.php.xml", function(data){
			var huts = data.documentElement.getElementsByTagName("hut");
			for (var i = 0; i < huts.length; i++) {			
				var a = huts[i];
				var lat = parseFloat(a.getAttribute('lat'));
				var lng = parseFloat(a.getAttribute('lng'));
				var address = a.getAttribute('address');
				var city = a.getAttribute('city');
				var area = a.getAttribute('area');
				var name = a.getAttribute('restaurant_name');
				var latlng = new google.maps.LatLng(lat, lng);
				var marker = new google.maps.Marker({position:latlng, icon:image, map:map});
				var  DineIn= a.getAttribute('DineIn');
				var  Delivery= a.getAttribute('Delivery');
				var  TakeAway=  a.getAttribute('TakeAway');
 
				markers.push(marker);
				
				bounds.extend(latlng);
				createWindow(marker,DineIn);
				//createCircle(marker,500000);
			}
			
			map.fitBounds(bounds);
		});
    }
	
	function createWindow(marker,DineIn){
	if(DineIn==1){DineIn="Dine In/";}else{DineIn="";}
		var html_cont = "<label>Pizza Hut-Pakistan</label><br />"+
						"<label>UAN-111-241-241</label><br /><label>"+DineIn+"Delivery/Take Away</label>";
			
				
		marker.html_cont = html_cont;
		marker.duration = "";
		google.maps.event.addListener(marker, "mouseover", function(){
			infowindow.setOptions({
				content: this.html_cont+this.duration
			});
			infowindow.open(map, marker);
			//setCircle(this,50000);
		});
	}
	function createCircle(marker,radius){
	radius = parseInt(radius);
	 
	var	c = new google.maps.Circle({
		  map: map,
		  fillColor:'#00AAFF',
		  fillOpacity:0.6,
		  strokeColor:'#ccc',
		  strokeOpacity:0.9,
		  radius: radius
		});
		c.bindTo('center', marker, 'position');
	 
}
function setCircle(marker,radius){
	radius = parseInt(radius);
	if (circle == null) {
		circle = new google.maps.Circle({
		  map: map,
		  fillColor:'#00AAFF',
		  fillOpacity:0.6,
		  strokeColor:'#ccc',
		  strokeOpacity:0.9,
		  radius: radius
		});
		circle.bindTo('center', marker, 'position');
	}else{
		circle.setRadius(radius);
		circle.bindTo('center', marker, 'position');
	}
}
	function getDirections2(latlng){
					 
		qstr = getAddress();
		
	
		
		
		if(qstr.indexOf("Please Select")!=-1){
			alert("Error! Make sure you choose a valid address by making a selection in each of the 3 dropdown lists!");
			waitOff();
			return;
		}/*else{
		//ubaid
		
			var html_cont = "<br /><label>You are here</label><br />";
			var marker = new google.maps.Marker({position:latlng,title:"Hello World!"});			
		google.maps.event.addListener(marker, "mouseover", function(){
			infowindow.setOptions({
				content: html_cont
			});
			infowindow.open(map, marker);
		});
		
		//end ubaid
		
		}		
*/		
		var request = {
			origin:latlng,
			destination:qstr,
			travelMode: google.maps.TravelMode.DRIVING
		};
		
		directionsService.route(request, function(result, status) {
			if (status == google.maps.DirectionsStatus.OK) {
				directionsDisplay.setDirections(result);
				waitOff();
			}
		});
	}
	var c;
	var setmarker;
	function getDirections(latlng) {
		if (setmarker == null) {
			setmarker = new google.maps.Marker({position:latlng, map:map,draggable:true,title:"set your location"});
			google.maps.event.addListener(setmarker, "dragend", function(event){
			waitOn();
			getDirections(event.latLng);
		});
		}else{
			setmarker.setPosition(latlng);
		}
		if (c == null) {
			c = new google.maps.Circle({
			  map: map,
			  fillColor:'#00AAFF',
			  fillOpacity:0.3,
			  strokeColor:'#9966CC',
			  strokeOpacity:0.4,
			  radius: 50000 
			});
			c.bindTo('center', setmarker, 'position'); 
		}else{
			c.bindTo('center', setmarker, 'position');
		}
		 
		 for(var j in polylines){
			polylines[j].setMap(null);
		 }
		 polylines =[];
		 
		var flag = false;
	 	for(var i in markers){
			if(c.getBounds().contains(markers[i].getPosition())){
				var request = {
					origin:latlng,
					destination:markers[i].getPosition(),
					travelMode: google.maps.TravelMode.DRIVING
				};
				
				directionsService.route(request, function(result, status) {
					if (status == google.maps.DirectionsStatus.OK) {
						showRoute(markers[i],result);
						waitOff();
					}
				});
				
				flag = true;
			}
		}
		if(!flag){
			alert("No result found around this position!");
			waitOff();
			return;
		}
		
	}
	
	var colorArray = ["#0000FF", "#9966CC", "#33CC00", "#FF80C0", "#996600", "#00CCFF", "#FF0066", "#66FF66", "#999999"];
	function showRoute(marker,response){
			var legs = response.routes[0].legs;
			var color = colorArray[0];
			var iconcolor = colorArray[0];
			var html = [];
			for (var i = 0; i < legs.length; i++) {
				var leg = legs[i];
				var duration = leg.duration.text;
				var distance = leg.distance.text;
				var steps = leg.steps;
				var start_address = leg.start_address;
				var start_location = leg.start_location;
				var end_address = leg.end_address;
				var end_location = leg.end_location;

				//var marker = createMarker(start_location);
				marker.html_cont = marker.html_cont+"<br><span stle='color:red;'>distance:"+distance+",duration:"+duration+"</span>";
				 
				for (var j = 0; j < steps.length; j++) {
					var step = steps[j];
					var instructions = step.instructions;
					var s_duration = step.duration.text;
					var s_distance = step.distance.text;
					var paths = step.path;
					var polyOptions = {
						strokeColor: color,
						strokeOpacity: 0.8,
						strokeWeight: 3,
						path: paths
					}
					var polyline = new google.maps.Polyline(polyOptions);
					 
					polyline.setMap(map);
					polylines.push(polyline);
					
				}
				 
				if (i == legs.length - 1) {
					//var marker = createMarker(end_location, iconcolor,dayindex,i+1);
					 		 
				}
			}
		}
	function getAddress(){
		var cityBox = document.getElementById("city");
		var areaBox = document.getElementById("area");
		var areaAddress = document.getElementById("address").value;
					
		var city = cityBox.options[cityBox.selectedIndex].text;
		var area = areaBox.options[areaBox.selectedIndex].text;
					 
		//qstr = areaAddress + ',' + city + ', Pakistan';
		var digit = areaAddress.split(".", 2);
		var isnum = /^\d+$/.test(digit[0]);
		
		if(isnum == false){
		qstr = areaAddress + ',' + city + ', Pakistan';
		} else {
		qstr = areaAddress;
		}
		return qstr;
	}
	
	function zoomOnSelected(){
	waitOn();
		geocoder.geocode( { 'address': getAddress()}, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				map.setCenter(results[0].geometry.location);
				map.setZoom(15);
				waitOff();
			}
		});
	}
	
	function waitOn(){
		document.getElementById('map_wait').style.visibility = 'visible';
		document.getElementById('map_wait_dialog').style.visibility = 'visible';
	}
	
	function waitOff(){
		document.getElementById('map_wait').style.visibility = 'hidden';
		document.getElementById('map_wait_dialog').style.visibility = 'hidden';
	}