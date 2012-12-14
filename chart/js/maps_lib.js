  var map = null;
  var chart = null;
  
  var geocoderService = null;
  var elevationService = null;
  var directionsService = null;
  
  var mousemarker = null;
  var markers = [];
  var polyline = null;
  var elevations = null;
  
  var SAMPLES = 100;

// Load the Visualization API and the piechart package.
	google.load("visualization", "1", {packages: ["corechart"]});
  /*
// Set a callback to run when the Google Visualization API is loaded.
	google.setOnLoadCallback(initialize);*/


var layer;
var tableid = '1BkxuadsVWU2llNChXkMh6fVh_E1fiESKCoHKkR8'; //eq faults
	
var layer2;
var tableid2 = '1R9pRsT_coGFBrg1pVZDTeDU5piTTnYpwe4N9vKo'; //eq lines 
//var tableid2 = '1BbqgIlUiI-bUBssNVeC2BppcEbctELxW3rg_PKI'; //eq intensity
	

var layer3;
var tableid3 = '1PI1GfX-19ivoQ5f9hB8cq3DHSoAflaAadJf-Yxw'; //liqefaction

var layer4;
var tableid4 = '1foFjn0Z4ONfA_nnLZXRS6ZjI6933EfC16Gm6bLI'; //landslide
	
var layer5;
var tableid5 = '1NfuiOwKpuYBkOvoQYgi_zTwij9P9d9KVXNI4pmQ'; //benchmarks
	
var layer6;
var tableid6 = '1eafBWKDsz0jdruyJsTBbmwJwLaJF-ifAtfYnLq0'; //flood zones new
//var tableid6 = '1ywWBZ-LtbLPa-sJi39z5H9gGCM5xEbS65leilE8'; //flood zones

var MapsLib = MapsLib || {};
var MapsLib = 
{
  
  //Setup section - put your Fusion Table details here
  //Using the v1 Fusion Tables API. See https://developers.google.com/fusiontables/docs/v1/migration_guide for more info
  
  //the encrypted Table ID of your Fusion Table (found under File => About)
  //NOTE: numeric IDs will be depricated soon
  fusionTableId:      "1BkxuadsVWU2llNChXkMh6fVh_E1fiESKCoHKkR8",  
  
  //*New Fusion Tables Requirement* API key. found at https://code.google.com/apis/console/      
  googleApiKey:       "AIzaSyBUpLahnLOREvAyUSCesDjsMTDryUakTwQ",        
  
  locationColumn:     "geometry",	//name of the location column in your Fusion Table
  map_centroid:       new google.maps.LatLng(37.617495, -122.150116), //center that your map defaults to
  locationScope:      ", USA",		//geographical area appended to all address searches
  recordName:         "result",		//for showing number of results
  recordNamePlural:   "results", 
  
  searchRadius:       10000000,		//in meters ~ 1/2 mile
  defaultZoom:        9,			//zoom level when map is loaded (bigger is more zoomed in)
  addrMarkerImage:    './images/measure-vertex.png',
  currentPinpoint: null,
  
	initialize: function() 
	  {
		$( "#resultCount" ).html("");
	  
		geocoder = new google.maps.Geocoder();
		
		// Create an array of styles.
		// http://gmaps-samples-v3.googlecode.com/svn/trunk/styledmaps/wizard/index.html
		// http://mapsys.info/34436/styled-maps-using-google-maps-api-version-3/
		var grayStyle = [
		   {
			featureType: "administrative",
			elementType: "all",
			stylers: [
			  { saturation: -100 }
			]
		  },
		  {
			featureType: "landscape",
			elementType: "all",
			stylers: [
			  { saturation: -100 }
			]
		  },
		  {
			featureType: "poi",
			elementType: "geometry",
			stylers: [
			  { saturation: -100 }
			]
		  },
		  {
			featureType: "road",
			elementType: "geometry",
			stylers: [
			  { saturation: -100 }
			]
		  },
		  {
			featureType: "road",
			elementType: "labels.text.stroke",
			stylers: [
					  { color: "#ffffff" }
					]
		  },
		  {
			featureType: "water",
			elementType: "geometry.fill",
			stylers: [
					  { color: "#E1E6FA" }
					]
		  },
		  {
			featureType: "transit",
			elementType: "all",
			stylers: [
			  { saturation: -100 }
			]
		  },
		 ];

		// Create a new StyledMapType object, passing it the array of styles,
		// as well as the name to be displayed on the map type control.
		var grayMap = new google.maps.StyledMapType(grayStyle,
		{name: "Grayscale"});		
		
		var myOptions = 
		{
		  zoom: MapsLib.defaultZoom,
		  center: MapsLib.map_centroid,
		  scaleControl:true,
		  scaleControlOptions: { position: google.maps.ControlPosition.LEFT_TOP },
		  draggableCursor:'default',
		  mapTypeControlOptions: 
		  {
			mapTypeIds: [
			google.maps.MapTypeId.ROADMAP,
			google.maps.MapTypeId.SATELLITE,
			google.maps.MapTypeId.HYBRID,
			google.maps.MapTypeId.TERRAIN,
			'map_style'
			]
		  }
		};
	
		map = new google.maps.Map($("#mapCanvas")[0],myOptions);
		
		chart = new google.visualization.AreaChart(document.getElementById('chart_div'));
		
		geocoderService = new google.maps.Geocoder();
		elevationService = new google.maps.ElevationService();
		directionsService = new google.maps.DirectionsService();
		
		google.maps.event.addListener(map, 'click', function(event) 
			{
			  MapsLib.addMarker(event.latLng, true);
			});
			
		google.visualization.events.addListener(chart, 'onmouseover', function(e) 
		{
		  if (mousemarker == null) 
			  {
				mousemarker = new google.maps.Marker({
				  position: elevations[e.row].location,
				  map: map,
				  icon: "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
				});
			  } 
		  else 
			  {
				mousemarker.setPosition(elevations[e.row].location);
			  }
		});
		
		//Associate the styled map with the MapTypeId and set it to display.
		map.mapTypes.set('map_style', grayMap);
		map.setMapTypeId('map_style');		
		
		layer = new google.maps.FusionTablesLayer({
			query: {
			  select: 'geometry',
			  from: tableid
			},
			styleId: 2,
			map: map
		});
		
		layer2 = new google.maps.FusionTablesLayer({
			query: {
			  select: 'geometry',
			  from: tableid2
			},
			styleId: 2,
			map: null
		});
		
		layer3 = new google.maps.FusionTablesLayer({
			query: {
			  select: 'geometry',
			  from: tableid3
			},
			styleId: 2,
			map: null
		});
	
		layer4 = new google.maps.FusionTablesLayer({
			query: {
			  select: 'geometry',
			  from: tableid4
			},
			styleId: 2,
			map: null
		});

		layer5 = new google.maps.FusionTablesLayer({
			query: {
			  select: 'geometry',
			  from: tableid5
			},
			styleId: 2,
			map: null
		});	
	
		layer6 = new google.maps.FusionTablesLayer({
			query: {
			  select: 'geometry',
			  from: tableid6
			},
			styleId: 2,
			map: null
		});	
	
		MapsLib.searchrecords = null;
		
		//reset filters
		$("#txtSearchAddress").val(MapsLib.convertToPlainString($.address.parameter('address')));
		var loadRadius = MapsLib.convertToPlainString($.address.parameter('radius'));
		if (loadRadius != "") $("#ddlRadius").val(loadRadius);
		else $("#ddlRadius").val(MapsLib.searchRadius);
		//$(":checkbox").attr("checked", "checked");
		$("#cbType1").attr("checked", "checked");
		$("#cbType2").removeAttr('checked');
		$("#cbType3").removeAttr('checked');
		$("#cbType4").removeAttr('checked');
		$("#cbType5").removeAttr('checked');
		$("#cbType6").removeAttr('checked');
		$("#resultCount").hide();
		 
		//run the default search
		//MapsLib.doSearch();
		
	  },
		  
	toggleFT: function() 
	  {
			// # - eqfaults
			if ($("#cbType1").is(':checked')) 
				{ layer.setMap(map); } 
			else 
				{ layer.setMap(null); }
				
			// #2 - eqintensity	
			if ($("#cbType2").is(':checked')) 
				{ layer2.setMap(map); } 
			else 
				{ layer2.setMap(null); }
				
			// #3 - liquefaction
			if ($("#cbType3").is(':checked')) 
				{ layer3.setMap(map); } 
			else 
				{ layer3.setMap(null); }
				
			// #4 - landslide
			if ($("#cbType4").is(':checked')) 
				{ layer4.setMap(map); } 
			else 
				{ layer4.setMap(null); }
				
			// #5 - benchmarks
			if ($("#cbType5").is(':checked')) 
				{ layer5.setMap(map); } 
			else 
				{ layer5.setMap(null); }
				
			// #6 - flood zones
			if ($("#cbType6").is(':checked')) 
				{ layer6.setMap(map); } 
			else 
				{ layer6.setMap(null); }
				
	  },
		 
	doSearch: function(location) 
	  {
		var address = document.getElementById('txtSearchAddress').value;
		geocoderService.geocode({ 'address': address }, function(results, status) 
		{
			document.getElementById('txtSearchAddress').value = "";
			if (status == google.maps.GeocoderStatus.OK) 
			  {
				var latlng = results[0].geometry.location;
				MapsLib.addMarker(latlng, true);
				if (markers.length > 1) 
				{
				  var bounds = new google.maps.LatLngBounds();
				  for (var i in markers) {
					bounds.extend(markers[i].getPosition());
				  }
				  map.fitBounds(bounds);
				} 
				else 
				{
				  map.fitBounds(results[0].geometry.viewport);
				
				}
				
				map.setCenter(latlng);
				map.setZoom(11);
			  }
			else if (status == google.maps.GeocoderStatus.ZERO_RESULTS) {
				alert("Address not found");
			  }
			else {
				alert("Address lookup failed");
			  }
		})
	  },
	  
	  addMarker: function (latlng, doQuery) 
	  {
		if (markers.length < 10) 
		{
			  var marker = new google.maps.Marker({
				position: latlng,
				map: map,
				draggable: true,
				raiseOnDrag: false,
				title: "Drag me to change shape",
				icon: new google.maps.MarkerImage("./images/measure-vertex.png", new google.maps.Size(9, 9), new google.maps.Point(0, 0), new google.maps.Point(5, 5))
			  })
	  
			// When the user mouses over the measure vertex markers, change shape and color to make it obvious they can be moved
			google.maps.event.addListener(marker, "mouseover", function() {
				marker.setIcon(
					new google.maps.MarkerImage(
						"./images/measure-vertex-hover.png",
						new google.maps.Size(15, 15),
						new google.maps.Point(0, 0),
						new google.maps.Point(8, 8)
						));
				});

			// Change back to the default marker when the user mouses out
			google.maps.event.addListener(marker, "mouseout", function() {
				marker.setIcon(
					new google.maps.MarkerImage(
						"./images/measure-vertex.png",
						new google.maps.Size(9, 9),
						new google.maps.Point(0, 0),
						new google.maps.Point(5, 5)
						));
				});
      
			google.maps.event.addListener(marker, 'dragend', function(e)
			{
				MapsLib.updateElevation();
			});
      
			markers.push(marker);
		  
			if (doQuery) 
			  {
				MapsLib.updateElevation();
			  }
		  
			if (markers.length == 10) 
			  {
				document.getElementById('txtSearchAddress').disabled = true;
			  }
		} 
		
		else 
		{
			alert("No more than 10 points can be added");
		}
	  },
  
	submitSearch: function(whereClause, map, location) 
	  {
		//get using all filters
		//MapsLib.searchrecords = new google.maps.FusionTablesLayer({
		//  query: {
		//	from:   MapsLib.fusionTableId,
		//	select: MapsLib.locationColumn,
		//	where:  whereClause
		//  }
		//});
		//MapsLib.searchrecords.setMap(map);
		//MapsLib.displayCount(whereClause);
	  },
  
	clearSearch: function() 
	  {
		if (MapsLib.searchrecords != null)
		  MapsLib.searchrecords.setMap(null);
		if (MapsLib.addrMarker != null)
		  MapsLib.addrMarker.setMap(null);  
		if (MapsLib.searchRadiusCircle2 != null)
		  MapsLib.searchRadiusCircle2.setMap(null);
		if (MapsLib.searchRadiusCircle5 != null)
		  MapsLib.searchRadiusCircle5.setMap(null);
		if (MapsLib.searchRadiusCircle10 != null)
		  MapsLib.searchRadiusCircle10.setMap(null);
	  },
  
	findMe: function() 
	  {
		// Try W3C Geolocation (Preferred)
		var foundLocation;
		
		if(navigator.geolocation) {
		  navigator.geolocation.getCurrentPosition(function(position) {
			foundLocation = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
			MapsLib.addrFromLatLng(foundLocation);
		  }, null);
		}
		else {
		  alert("Sorry, we could not find your location.");
		}
	  },
  
	addrFromLatLng: function(latLngPoint) 
	  {
		geocoder.geocode({'latLng': latLngPoint}, function(results, status) {
		  if (status == google.maps.GeocoderStatus.OK) {
			if (results[1]) {
			  $('#txtSearchAddress').val(results[1].formatted_address);
			  $('.hint').focus();
			  MapsLib.doSearch();
			}
		  } else {
			alert("Geocoder failed due to: " + status);
		  }
		});
	  },
    
	  drawSearchRadiusCircle2: function(point) 
	  {
		  var circleOptions = 
		  {
			strokeColor: "#000000",
			strokeOpacity: .75,
			strokeWeight: 2,
			fillColor: "#FFFF00",
			fillOpacity: 0,
			map: map,
			center: point,
			clickable: false,
			zIndex: -1,
			//radius: parseInt(MapsLib.searchRadius)
			radius: 3218.3, // 2 miles in metres
		  };
		  MapsLib.searchRadiusCircle2 = new google.maps.Circle(circleOptions);
	  },
	  
	  drawSearchRadiusCircle5: function(point) 
	  {
		  var circleOptions = 
		  {
			strokeColor: "#000000",
			strokeOpacity: .75,
			strokeWeight: 2,
			fillColor: "#4b58a6",
			fillOpacity: 0,
			map: map,
			center: point,
			clickable: false,
			zIndex: -1,
			//radius: parseInt(MapsLib.searchRadius)
			radius: 8046.5, // 5 miles in metres
		  };
		  MapsLib.searchRadiusCircle5 = new google.maps.Circle(circleOptions);
	  },
	  
	  
	drawSearchRadiusCircle10: function(point) 
	  {
		  var circleOptions = 
		  {
			strokeColor: "#000000",
			strokeOpacity: .75,
			strokeWeight: 2,
			fillColor: "#4b58a6",
			fillOpacity: 0,
			map: map,
			center: point,
			clickable: false,
			zIndex: -1,
			//radius: parseInt(MapsLib.searchRadius)
			radius: 16093, // 10 miles in metres
		  };
		  MapsLib.searchRadiusCircle10 = new google.maps.Circle(circleOptions);
	  },
  
	query: function(selectColumns, whereClause, callback) 
	  {
		var queryStr = [];
		queryStr.push("SELECT " + selectColumns);
		queryStr.push(" FROM " + MapsLib.fusionTableId);
		queryStr.push(" WHERE " + whereClause);
	  
		var sql = encodeURIComponent(queryStr.join(" "));
		$.ajax({url: "https://www.googleapis.com/fusiontables/v1/query?sql="+sql+"&callback="+callback+"&key="+MapsLib.googleApiKey, dataType: "jsonp"});
	  },
  
	displayCount: function(whereClause) 
	  {
		var selectColumns = "Count()";
		MapsLib.query(selectColumns, whereClause,"MapsLib.displaySearchCount");
	  },
  
	displaySearchCount: function(json) 
	  { 
		var numRows = 0;
		if (json["rows"] != null)
		  numRows = json["rows"][0];
		
		var name = MapsLib.recordNamePlural;
		if (numRows == 1)
		name = MapsLib.recordName;
		$( "#resultCount" ).fadeOut(function() {
			$( "#resultCount" ).html(MapsLib.addCommas(numRows) + " " + name + " found");
		  });
		$( "#resultCount" ).fadeIn();
	  },
  
	addCommas: function(nStr) 
	  {
		nStr += '';
		x = nStr.split('.');
		x1 = x[0];
		x2 = x.length > 1 ? '.' + x[1] : '';
		var rgx = /(\d+)(\d{3})/;
		while (rgx.test(x1)) {
		  x1 = x1.replace(rgx, '$1' + ',' + '$2');
		}
		return x1 + x2;
	  },
  
	//converts a slug or query string in to readable text
	convertToPlainString: function(text) 
	  {
		if (text == undefined) return '';
		return decodeURIComponent(text);
	  },
		  
	  changeMap:function (layerNum)
	  {
		  if (layerNum == 1) {
			update(layer);
		  }
		  if (layerNum == 2) {
			update(layer2);
		  }
		  if (layerNum == 3) {
			update(layer3);
		  }
		  if (layerNum == 4) {
			update(layer4);
		  }
		  if (layerNum == 5) {
			update(layer5);
		  }
		  if (layerNum == 6) {
			update(layer6);
		  }
		},

	  update:function (layer)
	  {
		  var layerMap = layer.getMap();
		  if (layerMap) {
			layer.setMap(null);
		  } else {
			layer.setMap(map);
		  }
		},
		
	
	 plotElevation: function(results) 
	 {
		elevations = results;
		
		var path = [];
		for (var i = 0; i < results.length; i++) 
			{
			  path.push(elevations[i].location);
			}
		
		if (polyline) 
			{
			  polyline.setMap(null);
			}
		
		polyline = new google.maps.Polyline
		(
			{
			  path: path,
			  strokeColor: "#000000",
			  map: map
			}
		);

		//zm http://www.thaicreate.com/tutorial/javascript-number-format-comma.html
		function addCommas(nStr)
		{
			nStr += '';
			x = nStr.split('.');
			x1 = x[0];
			x2 = x.length > 1 ? '.' + x[1] : '';
			var rgx = /(\d+)(\d{3})/;
			while (rgx.test(x1)) 
				{
					x1 = x1.replace(rgx, '$1' + ',' + '$2');
				}
			return x1 + x2;
		}  
		//zm
		document.getElementById("distance").innerHTML = addCommas((polyline.Distance()*3.28084).toFixed(0))+" ft";
		//zm
		document.getElementById("area").innerHTML = addCommas((polyline.Area()*10.7639).toFixed(0))+" ft2";
		
		var distanceTick = google.maps.geometry.spherical.computeLength(path) / results.length;
		var data = new google.visualization.DataTable();
		data.addColumn('number', 'Distance');
		data.addColumn('number', 'Elevation');
		for (var i = 0; i < results.length; i++) 
			{
			  data.addRow([i * distanceTick*3.28084, elevations[i].elevation*3.28084]);
			}

		document.getElementById('chart_div').style.display = 'block';
		chart.draw(data, 
			{
			  width: '98%',
			  height: 120,
			  legend: { position: 'none' },
			  vAxis: { title: 'Elevation (ft)' },
			  //hAxis: { title: 'Distance (ft)' },
			  //tooltip: { trigger: 'none' },
			  tooltip: {showColorCode:false},
			  //bar: { groupWidth: '100%' },
			  //focusTarget: 'category' ,
			  focusBorderColor: '#00ff00'
			});
	 },
	
	// Remove the green rollover marker when the mouse leaves the chart
	clearMouseMarker: function() 
	{
		if (mousemarker != null) 
		{
		  mousemarker.setMap(null);
		  mousemarker = null;
		}
	},
	
	updateElevation: function()
	{
		if (markers.length > 1) 
		{
		  //var travelMode = document.getElementById("mode").value;
			var travelMode = 'direct';
			  if (travelMode != 'direct') 
				  {
					MapsLib.calcRoute(travelMode);
				  } 
			else 
				{
					var latlngs = [];
					for (var i in markers) 
						{
						  latlngs.push(markers[i].getPosition())
						}
						elevationService.getElevationAlongPath(
							{
							  path: latlngs,
							  samples: SAMPLES
							},
						MapsLib.plotElevation);
				}
		}
	},
	
	// Submit a directions request for the path between points and an elevation request for the path once returned
	calcRoute: function(travelMode)
	{
		var origin = markers[0].getPosition();
		var destination = markers[markers.length - 1].getPosition();
		
		var waypoints = [];
		for (var i = 1; i < markers.length - 1; i++) 
		{
		  waypoints.push
		  (
			  {
				location: markers[i].getPosition(),
				stopover: true
			  }
		  );
		}
		
		var request = {
		  origin: origin,
		  destination: destination,
		  waypoints: waypoints
		};
	   
		switch (travelMode) 
		{
		  case "bicycling":
			request.travelMode = google.maps.DirectionsTravelMode.BICYCLING;
			break;
		  case "driving":
			request.travelMode = google.maps.DirectionsTravelMode.DRIVING;
			break;
		  case "walking":
			request.travelMode = google.maps.DirectionsTravelMode.WALKING;
			break;
		}
		
		directionsService.route(request, function(response, status) 
		{
		  if (status == google.maps.DirectionsStatus.OK) {
			elevationService.getElevationAlongPath({
			  path: response.routes[0].overview_path,
			  samples: SAMPLES
			}, MapsLib.plotElevation);
		  } else if (status == google.maps.DirectionsStatus.ZERO_RESULTS) {
			alert("Could not find a route between these points");
		  } else {
			alert("Directions request failed");
		  }
		});
	}
	  
}