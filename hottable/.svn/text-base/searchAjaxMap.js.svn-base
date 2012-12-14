function showMapWithAjax(latVal, longVal, ID, set) {
	function initMap() {
		if ($('#noRecord').val() == 1) {
			var zoomVal = 16;
		} else {
			var zoomVal = 12;
		}
		var a = latVal;
		var b = longVal;
		var c = new google.maps.LatLng(a, b);
		var d = {
			zoom: zoomVal,
			center: c,
			panControl: false,
			mapTypeControl: false,
			mapTypeControlOptions: {
				style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
			},
			zoomControl: true,
			zoomControlOptions: {
				style: google.maps.ZoomControlStyle.LARGE,
				position: google.maps.ControlPosition.LEFT_TOP
			},
			mapTypeId: google.maps.MapTypeId.ROADMAP
		};
		map = new google.maps.Map(document.getElementById("map"), d);
		openBubble = new InfoBubble({
				padding: 8,
                borderRadius: 20,
                minWidth: 80,
                arrowSize: 35,
                borderWidth: 2,
                borderColor: '#441161',
                disableAutoPan: false,
				disableAnimation: true,
                arrowPosition:45,
                arrowStyle: 2,
				shadowStyle: 0
		});
		google.maps.event.addListener(openBubble, "closeclick", function() {
			if (idlelistener == null) {
				idlelistener = google.maps.event.addListener(map, 'idle', idleHandler);
			}
			$(".active_restaurant").removeClass("active_restaurant");
		})
		google.maps.event.addListener(map, "click", mapclickHandler);
		idlelistener = google.maps.event.addListener(map, 'idle', idleHandler);
	}

	function idleHandler() {
		var new_bounds = map.getBounds();
		if (oMaxBounds == null) {
			oMaxBounds = new_bounds;
		}
		var old_bounds = new google.maps.LatLngBounds(oMaxBounds.getSouthWest(), oMaxBounds.getNorthEast()); // this way copy the old bounds
		var new_sw = new_bounds.getSouthWest();
		var new_ne = new_bounds.getNorthEast();
		loadAjaxInfo(new_bounds);
		return;
		//extend the old bounds
		if (!oMaxBounds.contains(new_sw) || !oMaxBounds.contains(new_ne)) {
			oMaxBounds.extend(new_sw);
			oMaxBounds.extend(new_ne);
			console.log("idle");
			loadAjaxInfo(oMaxBounds);
		} else if (oMaxBounds == new_bounds) {
			bounds = expandBounds(oMaxBounds, 0.5);
			loadAjaxInfo(bounds);
		}
	}

	function expandBounds(bounds, degree_buffer) {
		return new google.maps.LatLngBounds(
		new google.maps.LatLng(
		bounds.getSouthWest().lat() - degree_buffer, bounds.getSouthWest().lng() - degree_buffer), new google.maps.LatLng(
		bounds.getNorthEast().lat() + degree_buffer, bounds.getNorthEast().lng() + degree_buffer));
	};

	function loadAjaxInfo(bounds) {
		var ne = bounds.getNorthEast();
		var sw = bounds.getSouthWest();
		var ne_lat = ne.lat();
		var ne_lng = ne.lng();
		var sw_lat = sw.lat();
		var sw_lng = sw.lng();
		var searchType = $('#searchType').val();
		var postalVal = $('#postalCode').val();
		postalVal = postalVal != 'address' ? postalVal : '';
		var cuisineVal = $('#cuisine').val();
		cuisineVal = cuisineVal != 'cuisine' ? cuisineVal : '';
		$.ajax({
			//url: '/map.php?postalCode=' + postalVal + '&cusine=' + cuisineVal + '&searchType=' + searchType + '&noRecord=' + noRecord,
			url:'data.txt',
			data: {
				ne_lat: ne_lat,
				ne_lng: ne_lng,
				sw_lat: sw_lat,
				sw_lng: sw_lng
			},
			success: function(data) {
				if ((data == '1' || data == 1)) {
					$("#restData").empty().append('<div class="scroll-pane"><div class="noRecord">no record found</div></div>');
					$('#restData').trigger('update');
				} else {
					//var api = $('.scroll-pane').data('jsp');
					$("#restData").empty().append(data);
					//api.reinitialise();
					$('.scroll-pane').jScrollPane({
						showArrows: true,
						animateScroll: true,
						animateDuration: 200,
						mouseWheelSpeed: 25,
						keyboardSpeed: 50,
						animateSteps: true
					});
					
				}
			}
		});
		
		loadMarkers();
		
		function loadMarkers() {
			$.ajax({
				type: "GET",
				//url: '/markers.php?postalCode=' + postalVal + '&cusine=' + cuisineVal + '&searchType=' + searchType + '&noRecord=' + noRecord,
				url:'map.xml',
				data: {
					ne_lat: ne_lat,
					ne_lng: ne_lng,
					sw_lat: sw_lat,
					sw_lng: sw_lng
				},
				dataType: "xml",
				success: function(xml) {
					removeMarker();
					showOnMap(xml);
				}
			});
		}
	}

	function showOnMap(xml) {
	    var arr = [];
		$(xml).find('marker').each(function() {
			var rID = $(this).find('rID').text();
			//var n = get_markers_index(rID);
			//if(n==-1){
			var name = $(this).find('name').text();
			var address = $(this).find('address').text();
			// create a new LatLng point for the marker
			var lat = $(this).find('lat').text();
			var lng = $(this).find('lng').text();
			var restImage = $(this).find('restImage').text(); //'http://localhost/hottable/wp-content/themes/hot-table/images/yellow_flame.png'
			var h = new google.maps.LatLng(lat, lng);
			var i = new google.maps.MarkerImage(restImage, null, null, null, new google.maps.Size(26, 30));
			var mkr = new google.maps.Marker({
				position: h,
				map: map,
				icon: i,
				title: name
			});
			mkr.rID = rID;
			google.maps.event.addListener(mkr, "click", function(a) {
				selectMarker(mkr);
			});
			markerArray.push(mkr);
			//}else{
			// arr.push(markerArray[n]);
			//}
		});
        //markerArray = arr;
	}
	function getMarkersInBounds(){
		for (var j = 0; j < markerArray.length; j++) {
			if (markerArray[j] && markerArray[j].rID == rID) {
				return j;
			}
		}
	}
	// remove markers that aren't currently visible
	function dropSuperfluousMarkers() {
	  mapBounds = map.getBounds();
	  for (var i = 0, ii = markerArray.length; i < ii; i++)  {
		if (!markers[i]) {continue};
		if (!mapBounds.contains(markers[i].getPosition())) {
		  // remove from the map
		  markers[i].setMap(null);
		  // remove from the markers array
		  markers.splice(i, 1);
		}
	  }
	}
	function get_markers_index(rID) {
		for (var j = 0; j < markerArray.length; j++) {
			if (markerArray[j] && markerArray[j].rID == rID) {
				return j;
			}
		}
		return -1;
	}

	function mapclickHandler() {
		if (openBubble.isOpen() && curID >= 0) {
			openBubble.close();
			if (idlelistener == null) {
				idlelistener = google.maps.event.addListener(map, 'idle', idleHandler);
			}
			$(".abc").removeClass("active_restaurant");
			$(".active_restaurant").removeClass("active_restaurant");
			$("#hoverDiv" + curID).removeClass("active_restaurant");
			curID = -1;
			return false;
		}
	}

	function selectMarker(mkr, content) {
		if (mkr.rID == curID && !openBubble.isOpen()) {
			openBubble.open();
			return;
		}
		if (content == null) {
			var obj = document.getElementById("tooltip" + mkr.rID);
			if (obj == null) {
				return;
			}
			var text = obj.innerHTML;
			//markershtml[h] 
			content = "<div class='infobubbleDiv'><div id='restHeader' class='scroll_hedng1'>" + text + "</div></div>";
			//content = markershtml[mkr.getPosition()];
		}
		google.maps.event.removeListener(idlelistener);
		idlelistener = null;
        map.setCenter(mkr.getPosition());
		openBubble.close();
		openBubble.setContent(content);
		openBubble.open(map, mkr);
		var openID = mkr.rID;
		curID = openID;
		$(".active_restaurant").removeClass("active_restaurant");
		$("#hoverDiv" + openID).addClass("active_restaurant");
		var top = $("#hoverDiv" + openID).position().top;
		$(".scroll-pane").data('jsp').scrollToY(top);
		return false;
	}

	function removeMarker() {
		for (j in markerArray) {
			if (markerArray[j]) {
				markerArray[j].setMap(null)
			}
		}
		markerArray = [];
		markershtml = [];
	}
	return initMap();
}

function viewmap(postalVal, cuisineVal, ID, searchType, noRecord) {
	if (noRecord == 1) {
		$.ajax({
			url: '/checkmap.php?postalCode=' + postalVal + '&cusine=' + cuisineVal + '&noRecord=' + noRecord + '&searchType=' + searchType,
			success: function(data) {
				if (data == 1 || data == '1' || data == 2 || data == '2') {
					var latVal = "43.6711958";
					var longVal = "-79.4056054";
					var set = 0;
					$('#noRecord').val('0');
				} else if (data == '3' || data == 3) {
					var latVal = "43.6711958";
					var longVal = "-79.4056054";
					var set = 0;
				} else {
					var res = data.split("|");
					var latVal = res[0];
					var longVal = res[1];
					var set = 0;
				}
				showMapWithAjax(latVal, longVal, ID, set)
			}
		});
	} else {
		var latVal = "43.6711958";
		var longVal = "-79.4056054";
		var set = 0
		showMapWithAjax(latVal, longVal, ID, set)
	}
}

function MouseOverBounce(id) {
	id = id - 1;
	if (markerArray[id]) {
		markerArray[id].setAnimation(google.maps.Animation.BOUNCE);
	}
	return false;
}

function MouseOutBounce(id) {
	id = id - 1;
	if (markerArray[id]) {
		markerArray[id].setAnimation(null);
	}
	return false;
}