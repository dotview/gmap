<html> 
<head> 
<meta name="viewport" content="initial-scale=1.0, user-scalable=no" /> 
<meta http-equiv="content-type" content="text/html; charset=UTF-8"/> 
<title>Google Maps JavaScript API v3 Demo -- Direction </title> 
 <link href="/style/common.css" rel="stylesheet" type="text/css" id="Link2">
  <script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.min.js"></script>
<script type="text/javascript" src="http://maps.google.com/maps/api/js?sensor=false"></script> 
<script type="text/javascript"> 
  var directionsDisplay;
  var directionsService = new google.maps.DirectionsService();
  var map;

  function initialize() {
   var lat =  53.4260046;
	var lng =  -7.738773;//
	 var latlng = new google.maps.LatLng(lat,lng);//30.26589239295696, 120.16146411914064
    var myOptions = {
      zoom: 5,
      center: latlng,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
 
    directionsDisplay = new google.maps.DirectionsRenderer({
        'map': map,
        'preserveViewport': true,
        'draggable': true
    });
    directionsDisplay.setPanel(document.getElementById("directions_panel"));
 
    google.maps.event.addListener(directionsDisplay, 'directions_changed',function() {
        currentDirections = directionsDisplay.getDirections();			
		$("#start").val(directionsDisplay.directions.routes[0].legs[0].start_address);
		$("#end").val(directionsDisplay.directions.routes[0].legs[0].end_address);
    });

	$("#routeType").change(function(){
		calcRoute();
	});
	$("#btnRefresh").click(function(){
		calcRoute();
	});
	//calcRoute();
  }
   
  function calcRoute() {
    var start = $.trim($("#start").val());
	start = start=='' ? '' :start;
    var end = $.trim($("#end").val());
	end = end=='' ? '' :end;
	var routeType = $("#routeType").val();
	var travelMode;
	switch(routeType)
	{
		case "DRIVING":
			travelMode = google.maps.DirectionsTravelMode.DRIVING;
			break;
		case "BICYCLING":
			travelMode = google.maps.DirectionsTravelMode.BICYCLING;
			break;
		case "WALKING":
			travelMode = google.maps.DirectionsTravelMode.WALKING;
			break;
		default:
			travelMode = google.maps.DirectionsTravelMode.DRIVING;
			break;			
	}
    var request = {
        origin:start,
        destination:end,
        travelMode: travelMode
    };
	$("#progress").show();
    directionsService.route(request, function(response, status) {
      if (status == google.maps.DirectionsStatus.OK) {
		map.fitBounds(response.routes[0].bounds);
        directionsDisplay.setDirections(response);
		$("#progress").hide();
      }
    });
  }
 
</script> 
  
</head> 
<body onload="initialize()"> 
  <div id="content">
<div id="map_canvas" style="float:left;width:70%;height:90%"></div> 
<div style="float:right;width:30%;height:90%;overflow:auto"> 
<table class="mytab2" style="text-align:left!important;">
<tr style="display:None">
<td>Type:</td>
<td>
<select style="width:300px" iid="routeType">
<option value="DRIVING">开车</option>
<option value="BICYCLING">骑车</option>
<option value="WALKING">步行</option>
</select>
</td></tr>
<tr><td>Start:</td><td><input type="text" placeholder="input post code" style="width:300px" id="start" /></td></tr>
<tr><td>end:</td><td><input type="text" placeholder="input post code" style="width:300px" id="end" /></td></tr>
<tr><td>&nbsp;</td><td><input type="button" class="button" style="cursor:pointer;" id="btnRefresh" value="submit" />
</td></tr>
</table>
<div style="position:absolute;display:none;" id="progress"><img  src="/images/progressbar2.gif" /></div>
<div id="directions_panel" style="width:100%"></div> 
</div> 
</div> 
</body> 
</html> 