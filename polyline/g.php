
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="initial-scale=1.0, user-scalable=no" />
<meta http-equiv="content-type" content="text/html; charset=UTF-8"/>
<title>Google Maps JavaScript API v3 Example: Polyline Complex</title>
<link href="http://code.google.com/apis/maps/documentation/javascript/examples/default.css" rel="stylesheet" type="text/css" />
<script type="text/javascript" src="//maps.googleapis.com/maps/api/js?sensor=false"></script>
<script type="text/javascript">

  var poly;
  var map;

  function initialize() {
    var chicago = new google.maps.LatLng(41.879535, -87.624333);
    var myOptions = {
      zoom: 7,
      center: chicago,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    map = new google.maps.Map(document.getElementById('map_canvas'), myOptions);

    var polyOptions = {
      strokeColor: '#000000',
      strokeOpacity: 0.5,
      strokeWeight: 20,
	  editable:true,
	  geodesic:true
    }
    poly = new google.maps.Polyline(polyOptions);
    poly.setMap(map);

    // Add a listener for the click event
    google.maps.event.addListener(map, 'click', addLatLng);
	  
  }

  /**
   * Handles click events on a map, and adds a new point to the Polyline.
   * @param {MouseEvent} mouseEvent
   */
  function addLatLng(event) {

    var path = poly.getPath();

    // Because path is an MVCArray, we can simply append a new coordinate
    // and it will automatically appear
    path.push(event.latLng);

    // Add a new marker at the new plotted point on the polyline.
  
  }
 
</script>
</head>
<body onload="initialize()">
  <div id="map_canvas"></div>
</body>
</html>
