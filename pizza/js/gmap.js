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
	var curmarker;
	var destmarkers=[];
	
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
		
		google.maps.event.addListener(map, "click", function(event){
			
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
				
				google.maps.event.addListener(marker, "click", function(event){
					curmarker = this;
					setCircle(this,50000);
					map.setCenter(this.getPosition());
					map.setZoom(9);
				});
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
		google.maps.event.addListener(marker, "mouseover", function(){
			infowindow.setOptions({
				content: this.html_cont
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
		  clickable: false,
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
		  clickable: false,
		  strokeOpacity:0.9,
		  radius: radius
		});
		circle.bindTo('center', marker, 'position');
	}else{
		circle.setRadius(radius);
		circle.bindTo('center', marker, 'position');
	}
}
	 
	var c;
	var setmarker;
	function getDirections(latlng) {
		 if(curmarker==null){
			alert("please click a marker to set this as default marker");
			return;
		 }
			waitOn();
				var request = {
					origin:curmarker.getPosition(),
					destination:latlng,
					travelMode: google.maps.TravelMode.DRIVING
				};
	 
				directionsService.route(request, function(result, status) {
					if (status == google.maps.DirectionsStatus.OK) {
						showRoute(result);
						waitOff();
					}
				});
				
				
		
	}
	
	var colorArray = ["#0000FF", "#9966CC", "#33CC00", "#FF80C0", "#996600", "#00CCFF", "#FF0066", "#66FF66", "#999999"];
	function showRoute(response){
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
					//var marker = createMarker(start_location);
					var marker = new google.maps.Marker({position:end_location, map:map});
					var html_cont = "start address:"+start_address+"<br>destination address:"+end_address+"<br><span style='color:red;'>distance:"+distance+",duration:"+duration+"</span>";
					marker.html_cont = html_cont;
					google.maps.event.addListener(marker, "mouseover", function(){
						infowindow.setContent(this.html_cont);
						infowindow.open(map, marker);
						//setCircle(this,50000);
					});  		 
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