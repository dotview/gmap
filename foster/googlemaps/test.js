var directionDisplay;
var init_marker = null;
var map = null;
var infoWindow = null;
var markers = new Array();

function PropertyMap(){
	var self = this;
	self.longitude = -123.1384448;//Starting lat
	self.latitude = 49.2623299;//Starting long
	self.zoom = 10;//Default zoom
	self.base_url = "/t/get_markers.php";
	self.property_type = 'upcoming';
	
	self.init = function(){
		self.init_map();
		self.init_tabs();
		self.get_markers();
	};
	self.init_map = function(){
		var latlng = new google.maps.LatLng(self.latitude,self.longitude);
		//Set all map options
		var myOptions = {
			scrollwheel: false,
			zoom: self.zoom,
			center: latlng,
			mapTypeControl: false,
			scaleControl: false,
			navigationControl: true,
			navigationControlOptions: {
				style: google.maps.NavigationControlStyle.SMALL
			},
			mapTypeId: google.maps.MapTypeId.ROADMAP
		};
		infowindow = new google.maps.InfoWindow({
			content: "holding..."
		});
		
		//Create the map
		map = new google.maps.Map(document.getElementById('map-canvas'), myOptions);
	};
	self.init_tabs = function(){
		$('#map_tabs a').unbind('click').click(function(){
			$('#map_tabs a.active').removeClass('active');
			var current_tab = $(this).attr('class');
			self.property_type = current_tab;
			$(this).addClass('active');
			self.get_markers();
			return false;
		});
	};
	self.clear_markers = function(){
		$.each(markers, function (index, marker) {
			marker.setMap(null);
		});
	};
	self.get_markers = function(){
		self.clear_markers();
		$.post(self.base_url, {type: self.property_type}, function(raw_markers){
			new_markers = $.parseJSON(raw_markers);
			if(!new_markers) return false;
			if(new_markers.length == 0) return false;
			markers = new Array();
			for (var i = 0; i < new_markers.length; i++) {
				new_marker = new_markers[i];     
				var siteLatLng = new google.maps.LatLng(new_marker.lng, new_marker.lat);       
				var marker = new google.maps.Marker({
                	position: siteLatLng,
	                map: map,
	                title: new_marker.name,
	                zIndex: i,
	                html: new_marker.content
	            });
	
				markers.push(marker);
				google.maps.event.addListener(marker, 'click', function () {
					infowindow.setContent(this.html);
					infowindow.open(map, this);
				});
			}
			self.autoCenter();
		});
	};
	self.autoCenter = function() {
		//  Create a new viewpoint bound
		var bounds = new google.maps.LatLngBounds();
		//  Go through each...
		$.each(markers, function (index, marker) {
			bounds.extend(marker.position);
		});
		//  Fit these bounds to the map
		map.fitBounds(bounds);
	};

	self.init();
}
function googleMap(color,markerURL) {

	/************************************************************************
	/* Defaults to start the map ********************************************/
	var self = this;
	self.marker_url = (markerURL != null) ? markerURL : "";
	self.mapContainer = "map-canvas";//Name of map div container
	self.latitude = -33.9;//Starting lat
	self.longitude = 151.2;//Starting long
	self.zoom = 14;//16//Default zoom
	self.markersArray = new Array();//Houses all of the markers (locations)
	self.bubblesArray = new Array();//Houses all of the marker infowindows
	self.infoWindowArray = new Array();
	if(color != "") {
		self.color = color;
	}
	if(color == "000000") {
		self.color = "";
	}
	if(self.color != "") {
		self.colorPath = "images/" + self.color;
	} else {
		self.colorPath = "";
	}
	self.colorPath = "";
	
	/************************************************************************
	/* Array of locations **************************************************/
	self.schools = new Array();
	self.shops = new Array();
	self.restaurants = new Array();
	self.trails = new Array();
	self.transportation = new Array();
	self.amenities = new Array();
	self.init_marker = null;
	
	/************************************************************************
	/* Array to hold Array of locations *************************************/
	self.markersRef = new Array();
	self.markers = [self.schools,
					self.shops,
					self.restaurants,
					self.trails,
					self.transportation,
					self.amenities];	
	
	/************************************************************************
	/* Array to hold Array of map icons *************************************/
	
	// /thumb/clr/<?php echo $color; ?>/_cms/themes/site/default/images/bg-arrow-overlay-default.png
	
	///thumb/clr/" + self.color + "
	self.markerImages = [self.colorPath + "images/blicon.png",
						 self.colorPath + "images/blicon.png",
						 self.colorPath + "images/blicon.png",
						 self.colorPath + "images/blicon.png",
						 self.colorPath + "images/blicon.png",
						 self.colorPath + "images/blicon.png"];
	
	self.filtersNavigationId = "filters";//The div containing the map filters
	self.is_initialized = false;
	
	self.init = function() {
		if($("#" + self.mapContainer).length > 0) {
			if(self.marker_url.length > 0){
				$.getJSON(self.marker_url, function(data){
					self.latitude = data.lat;
					self.longitude = data.lng;
					self.markers = $.parseJSON(data.markers);
					
					//Set the starting point for the map
					var latlng = new google.maps.LatLng(self.latitude,self.longitude);
			
					//Set all map options
					var myOptions = {
						scrollwheel: false,
						zoom: self.zoom,
						center: latlng,
						mapTypeControl: false,
						scaleControl: false,
						navigationControl: true,
						navigationControlOptions: {
							style: google.maps.NavigationControlStyle.SMALL
						},
						mapTypeId: google.maps.MapTypeId.ROADMAP
					}
			
					//Create the map
					map = new google.maps.Map(document.getElementById(self.mapContainer), myOptions);

					for(i=0; i<self.markers.length; i++) {
						//Build the markers
						self.addMarkers(self.markers[i], self.markerImages[i]);
					}
						
					self.addFilters();
				});
			} else {
			
				//Set all map options
				var myOptions = {
					scrollwheel: false,
					zoom: self.zoom,
					center: property_location,
					mapTypeControl: false,
					scaleControl: false,
					navigationControl: true,
					navigationControlOptions: {
						style: google.maps.NavigationControlStyle.SMALL
					},
					mapTypeId: google.maps.MapTypeId.ROADMAP
				}
			
				//Create the map
				map = new google.maps.Map(document.getElementById(self.mapContainer), myOptions);
				/*
				for(i=0; i<self.markers.length; i++) {
					//Build the markers
					self.addMarkers(self.markers[i], self.markerImages[i]);
				}
						
				self.addFilters();*/
			}
			self.initialize_map();
			$('.location-column .location').unbind('click').click(function(){
				var location_index = $(this).attr('id').replace('location_','');
				self.hideOverlays();
				self.init_marker.setMap(map);
				self.markersArray[location_index].setMap(map);
				jQuery('html, body').animate({scrollTop: (parseInt($('#map-container').offset().top,10) -20)}, 250, function(){
					google.maps.event.trigger(self.markersArray[location_index],'click');
				});
				self.autoCenter();
				return false;
			});
		}
	}

	self.initialize_map = function() {
		directionsDisplay = new google.maps.DirectionsRenderer();
		directionsDisplay.setMap(map);
		directionsDisplay.setPanel(document.getElementById("directionsPanel"));

		self.set_init_point();

		jQuery('#directions_form').unbind('submit').submit(function(){
			self.calcRoute();
			return false;
		});
		jQuery('#get_directions').unbind('click').click(function(){
			self.calcRoute();
			return false;
		});
	}
	
	self.set_init_point = function(){
		self.init_marker = new google.maps.Marker({
			position: property_location, 
			title: property_name,
			content: property_logo + "<p>" + property_description + "</p><br class='clear' />",   
			animation: google.maps.Animation.DROP,
			map: map,
			zIndex: 1000
		}); 
		self.markersArray.push(self.init_marker);
		self.addClickEvent(self.init_marker);
		var initIndex = self.markersArray.length - 1;
		self.markersRef.push(self.init_marker);

		google.maps.event.addDomListener(window, 'load', function(){
			if(!self.is_initialized){
				var infoBoxer = new InfoBox({latlng: self.init_marker.getPosition(), map: map, content: self.init_marker.content,offsetVertical:-165,offsetHorizontal: -215, height: 120});
				self.infoWindowArray.push(infoBoxer);
				self.is_initialized = true;
			}
		});

	}
	
	self.calcRoute = function() {
		var start = document.getElementById("map_start_point").value;
		var request = {
		   origin:start, 
		   destination:property_address,
		   travelMode: google.maps.DirectionsTravelMode.DRIVING
		};
		$('#directions_form .err').remove();
		directionsService.route(request, function(response, status) {
			if (status == google.maps.DirectionsStatus.OK) {
				directionsDisplay.setDirections(response);
				init_marker.setMap(null);
			} else {
				$('#directions_form').prepend("<p class='err'>Please enter a valid street address, city and province to continue.</p>");
			}
		});
	}
	
	//Function to build out markers (Landmarks is an array of locations with Long and Lat)
	self.addMarkers = function(landmarks, icon) {
		//Loop through the markers and add them to the map
		self.markersRef = new Array();
		for(var i = 0; i < landmarks.length; i++) {
			var locationArray = landmarks[i];
			var locationLatLong = new google.maps.LatLng(locationArray[1],locationArray[2]);
			//var locationImage = (locationArray[4].length > 0) ? "<img src='" + locationArray[4] + "' /><br />" : "";
			var marker = new google.maps.Marker({
				position: locationLatLong,
				title: locationArray[0],
				content: locationArray[4] + "<strong>" + locationArray[0] + "</strong><br />" + locationArray[3],
				icon: icon,
				map: map,
				zIndex: i
			});
			
			//console.log(marker.title);
			//console.log(locationArray);
			self.markersArray.push(marker);
			self.markersRef.push(marker);
			self.addClickEvent(marker);
			/*
			google.maps.event.addListener(marker,"click",function(e) {
				self.removeInfoWindows();
				var infoBoxer = new InfoBox({latlng: marker.getPosition(), map: map, content: marker.content});
				self.infoWindowArray.push(infoBoxer);
			});*/

			//self.addMarkerMessage(marker, i);
		}
		
	}
		
	self.addClickEvent = function(marker) {
		google.maps.event.addListener(marker,"click",function(e) {
			self.removeInfoWindows();
			if(marker.title == property_name){
				var infoBoxer = new InfoBox({latlng: init_marker.getPosition(), map: map, content: init_marker.content,offsetVertical:-165,offsetHorizontal: -215, height: 120});
			} else {
				if(marker.content.indexOf('<img') >= 0) {
					var offset_loc = '';
					var has_photo_height = '';
				} else {
					var has_photo_height = 80;
					var offset_loc = -150;
				}
				var infoBoxer = new InfoBox({latlng: marker.getPosition(), map: map, content: marker.content,offsetVertical: offset_loc, height: has_photo_height});
			}
			self.infoWindowArray.push(infoBoxer);
		});
	}
	
	//Function to attach unique messages to the infowindow of each marker
	self.addMarkerMessage = function(marker, i) {
		var bubble = new google.maps.InfoWindow({
			content: marker.content,
			zIndex: i,
			name: i
		});
		
		self.bubblesArray.push(bubble);
		
		google.maps.event.addListener(marker, 'click', function() {
            for (i = 0; i < self.bubblesArray.length; i++) {
                self.bubblesArray[i].close();
            }
			bubble.open(map, marker);
		});
	}
	
	//Function used in the filters navigation to reset all markers to invisible
	self.hideOverlays = function() {
		if(self.markersArray) {
			total = self.markersArray.length -1;
			for (i in self.markersArray) {
				self.markersArray[i].setMap(null);
			}
		}
	}

	//Function used in the filters to show only the chosen locations
	self.showOverlays = function(markersKey) {
		//console.log(self.markers[0]);
		self.hideOverlays();
		self.markersRef = new Array();
		if(markersKey >= 0) {
			
			//self.markers[markersKey].setMap(map);
			for(i=0; i<self.markers[markersKey].length; i++) {
				//console.log(self.markers[markersKey][i]);
				//Build the markers
				self.addMarkers(self.markers[markersKey], self.markerImages[markersKey]);
				//self.markers[markersKey][i].setMap(map);
			}
		//}
			//self.markersArray[markersKey].setMap(map);
		} else {
			if(self.markersArray) {
				for(var i = 0; i<self.markersArray.length; i++) {
					self.markersArray[i].setMap(map);
					self.markersRef.push(self.markersArray[i]);
				}
			}
		}
		self.set_init_point();
		self.removeInfoWindows();
		self.autoCenter();
	}
	
	//Function to remove all infoWindows, particularly when filters are activated
	self.removeInfoWindows = function() {
		if(self.infoWindowArray) {
			for(i in self.infoWindowArray) {
				self.infoWindowArray[i].setMap(null);
			}
		}
	}
	self.autoCenter = function() {
		//  Create a new viewpoint bound
		var bounds = new google.maps.LatLngBounds();
		//  Go through each...
		$.each(self.markersRef, function (index, marker) {
			bounds.extend(marker.position);
		});
		//  Fit these bounds to the map
		map.fitBounds(bounds);
	};

	
	//Function to attach filters/legend to the map functionality
	self.addFilters = function() {
		if($("#" + self.filtersNavigationId + " a").length > 0) {
			$("#" + self.filtersNavigationId + " a").click(function() {
				$("#" + self.filtersNavigationId + " a").removeClass("active");
				$(this).addClass("active");
				return false;
			});
		}
		
		//Trigger the filters
		google.maps.event.addDomListener(document.getElementById("view_all_filter"), 'click', function() {
			self.showOverlays();
		});
		google.maps.event.addDomListener(document.getElementById("schools_filter"), 'click', function() {
			self.showOverlays(0);
		});
		google.maps.event.addDomListener(document.getElementById("shopping_filter"), 'click', function() {
			self.showOverlays(1);
		});
		google.maps.event.addDomListener(document.getElementById("restaurants_filter"), 'click', function() {
			self.showOverlays(2);
		});
		google.maps.event.addDomListener(document.getElementById("trails_filter"), 'click', function() {
			self.showOverlays(3);
		});
		google.maps.event.addDomListener(document.getElementById("transportation_filter"), 'click', function() {
			self.showOverlays(4);
		});
		google.maps.event.addDomListener(document.getElementById("amenities_filter"), 'click', function() {
			self.showOverlays(5);
		});
		$("#transportation_filter").click();
		self.showOverlays(4);
	}	
	 
	
	self.init();
}