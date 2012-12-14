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
	
	/* An InfoBox is like an info window, but it displays
	* under the marker, opens quicker, and has flexible styling.
	* @param {GLatLng} latlng Point to place bar at
	* @param {Map} map The map on which to display this InfoBox.
	* @param {Object} opts Passes configuration options - content,
	*   offsetVertical, offsetHorizontal, className, height, width
	*/
	function InfoBox(opts) {
		google.maps.OverlayView.call(this);
		this.latlng_ = opts.latlng;
		this.map_ = opts.map;
		this.offsetVertical_ = (opts.offsetVertical) ? opts.offsetVertical : -227;
		this.offsetHorizontal_ = (opts.offsetHorizontal) ? opts.offsetHorizontal : -207;
		this.height_ = (opts.height) ? opts.height : 155;
		this.width_ = (opts.width) ? opts.width : 230;
		
		//My add
		this.content_ = opts.content;
		
		var me = this;
		this.boundsChangedListener_ =
		google.maps.event.addListener(this.map_, "bounds_changed", function() {
			return me.panMap.apply(me);
		});
		
		// Once the properties of this OverlayView are initialized, set its map so
		// that we can display it.  This will trigger calls to panes_changed and
		// draw.
		this.setMap(this.map_);
	}
	
	/* InfoBox extends GOverlay class from the Google Maps API
	*/
	InfoBox.prototype = new google.maps.OverlayView();
	
	/* Creates the DIV representing this InfoBox
	*/
	InfoBox.prototype.remove = function() {
		if (this.div_) {
			this.div_.parentNode.removeChild(this.div_);
			this.div_ = null;
		}
	};
	
	/* Redraw the Bar based on the current projection and zoom level
	*/
	InfoBox.prototype.draw = function() {
		// Creates the element if it doesn't exist already.
		this.createElement();
		if (!this.div_) return;
		
		// Calculate the DIV coordinates of two opposite corners of our bounds to
		// get the size and position of our Bar
		var pixPosition = this.getProjection().fromLatLngToDivPixel(this.latlng_);
		if (!pixPosition) return;
		
		// Now position our DIV based on the DIV coordinates of our bounds
		this.div_.style.width = this.width_ + "px";
		this.div_.style.left = (pixPosition.x + this.offsetHorizontal_) + "px";
		this.div_.style.height = this.height_ + "px";
		this.div_.style.top = (pixPosition.y + this.offsetVertical_) + "px";
		this.div_.style.display = 'block';
	};
	
	/* Creates the DIV representing this InfoBox in the floatPane.  If the panes
	* object, retrieved by calling getPanes, is null, remove the element from the
	* DOM.  If the div exists, but its parent is not the floatPane, move the div
	* to the new pane.
	* Called from within draw.  Alternatively, this can be called specifically on
	* a panes_changed event.
	*/
	InfoBox.prototype.createElement = function() {
		var panes = this.getPanes();
		var div = this.div_;
		if (!div) {
			// This does not handle changing panes.  You can set the map to be null and
			// then reset the map to move the div.
			div = this.div_ = document.createElement("div");
			div.style.border = "0px none";
			div.style.position = "absolute";
			//div.style.background = "url('images/bg-ffffff-80.png')";
			div.style.background = "#fff";
			div.style.width = this.width_ + "px";
			div.style.height = "auto";
			div.style.paddingBottom = "10px";
			div.style.fontSize = "12px";

			var contentDiv = document.createElement("div");
			contentDiv.style.paddingLeft = "10px";
			contentDiv.style.paddingRight = "10px";
			contentDiv.style.paddingBottom = "10px";
			contentDiv.style.position = "relative";
			contentDiv.style.top = "-10px";		
			contentDiv.style.fontFamily = "proxima-nova-1";
			contentDiv.style.lineHeight = "125%";
			contentDiv.innerHTML = this.content_;
			
			
			var topDiv = document.createElement("div");
			topDiv.style.textAlign = "center";
			topDiv.style.height = "20px";
			topDiv.style.lineHeight = "20px";
			topDiv.style.overflow = "hidden";
			topDiv.style.position = "relative";
			topDiv.style.width = "45px";
			topDiv.style.top = "-20px";
			topDiv.style.backgroundColor = "#424240";
			topDiv.style.color = "#ffffff";
			topDiv.innerHTML = "<a href='' onClick='return false;' style='color:#ffffff; font-family: proxima-nova-1'>Close</a>";
			
			
			function removeInfoBox(ib) {
				return function() {
					ib.setMap(null);
				};
			}
			
			google.maps.event.addDomListener(topDiv, 'click', removeInfoBox(this));
			
			
			div.appendChild(topDiv);
			div.appendChild(contentDiv);
			div.style.display = 'none';
			panes.floatPane.appendChild(div);
			this.panMap();
		} else if (div.parentNode != panes.floatPane) {
			// The panes have changed.  Move the div.
			div.parentNode.removeChild(div);
			panes.floatPane.appendChild(div);
		} else {
			// The panes have not changed, so no need to create or move the div.
		}
	}
	
	/* Pan the map to fit the InfoBox.
	*/
	InfoBox.prototype.panMap = function() {
		// if we go beyond map, pan map
		var map = this.map_;
		var bounds = map.getBounds();
		if (!bounds) return;
		
		// The position of the infowindow
		var position = this.latlng_;
		
		// The dimension of the infowindow
		var iwWidth = this.width_;
		var iwHeight = this.height_;
		
		// The offset position of the infowindow
		var iwOffsetX = this.offsetHorizontal_;
		var iwOffsetY = this.offsetVertical_;
		
		// Padding on the infowindow
		var padX = 40;
		var padY = 40;
		
		// The degrees per pixel
		var mapDiv = map.getDiv();
		var mapWidth = mapDiv.offsetWidth;
		var mapHeight = mapDiv.offsetHeight;
		var boundsSpan = bounds.toSpan();
		var longSpan = boundsSpan.lng();
		var latSpan = boundsSpan.lat();
		var degPixelX = longSpan / mapWidth;
		var degPixelY = latSpan / mapHeight;
		
		// The bounds of the map
		var mapWestLng = bounds.getSouthWest().lng();
		var mapEastLng = bounds.getNorthEast().lng();
		var mapNorthLat = bounds.getNorthEast().lat();
		var mapSouthLat = bounds.getSouthWest().lat();
		
		// The bounds of the infowindow
		var iwWestLng = position.lng() + (iwOffsetX - padX) * degPixelX;
		var iwEastLng = position.lng() + (iwOffsetX + iwWidth + padX) * degPixelX;
		var iwNorthLat = position.lat() - (iwOffsetY - padY) * degPixelY;
		var iwSouthLat = position.lat() - (iwOffsetY + iwHeight + padY) * degPixelY;
		
		// calculate center shift
		var shiftLng =
		(iwWestLng < mapWestLng ? mapWestLng - iwWestLng : 0) +
		(iwEastLng > mapEastLng ? mapEastLng - iwEastLng : 0);
		var shiftLat =
		(iwNorthLat > mapNorthLat ? mapNorthLat - iwNorthLat : 0) +
		(iwSouthLat < mapSouthLat ? mapSouthLat - iwSouthLat : 0);
		
		// The center of the map
		var center = map.getCenter();
		
		// The new map center
		var centerX = center.lng() - shiftLng;
		var centerY = center.lat() - shiftLat;
		
		// center the map to the new shifted center
		map.setCenter(new google.maps.LatLng(centerY, centerX));
		
		// Remove the listener after panning is complete.
		google.maps.event.removeListener(this.boundsChangedListener_);
		this.boundsChangedListener_ = null;
	};
	
	self.init();
}