<?
$business_name = $_GET['name'];
$street = $_GET['a'];
$city = $_GET['city'];
$country = $_GET['cntry'];


//$address= 'address='.$the_field('business_street_address').',+Israel&sensor=false'";
$geocode=file_get_contents(str_replace(' ',',',('http://maps.google.com/maps/api/geocode/json?address='.$street.','.$city.',+'.$country.'&sensor=false')));

$output= json_decode($geocode);

$lat = $output->results[0]->geometry->location->lat;
$long = $output->results[0]->geometry->location->lng;

?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html>
	<head>
		<meta name="viewport" content="initial-scale=1.0, user-scalable=no" />
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<style type="text/css">
			body {
				
				
				margin:0;
			}

			#content {

			}
			#bodyContent{width:350px;}
		</style>
<script type="text/javascript" src="http://maps.google.com/maps/api/js?sensor=false"></script>
		<script type="text/javascript">
			function initialize() {
				var latlng = new google.maps.LatLng(<? echo $lat.','.$long; ?>);
				
				var mapOptions = {
					zoom: 15,
					center: latlng,
					scrollwheel: false,
					mapTypeControl: true,
					mapTypeControlOptions: {style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR},
					navigationControl: true,
					navigationControlOptions: {style: google.maps.NavigationControlStyle.SMALL},
					mapTypeId: google.maps.MapTypeId.ROADMAP};
					
				var map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
  
				var contentString = '<div id="content">'+
					'<div id="siteNotice">'+
					'</div>'+
					'<h3 id="firstHeading" class="firstHeading"><?php echo $business_name; ?></h3>'+
					'<div id="bodyContent">'+
					'<p><?php //the_field('business_description'); ?></p>'+
					'</div>'+
					'</div>';
				var infowindow = new google.maps.InfoWindow({
					content: contentString
				});
				
				
								var companyImage = new google.maps.MarkerImage('http://street-view.co.il/wp-content/themes/yoo_shelf_wp/layouts/googlemaps/images/bicon.png',
					new google.maps.Size(30,35),
  new google.maps.Point(0,0),
  new google.maps.Point(15,35)
				);

				var companyShadow = new google.maps.MarkerImage('http://street-view.co.il/wp-content/themes/yoo_shelf_wp/layouts/googlemaps/images/blshadow.png',
					new google.maps.Size(52,35),
  new google.maps.Point(0,0),
  new google.maps.Point(15,35)
  );

				//var companyPos = new google.maps.LatLng(<? echo $lat.','.$long; ?>);

			/*	var companyMarker = new google.maps.Marker({
					position: companyPos,
					map: map,
					animation: google.maps.Animation.DROP,
					icon: companyImage,
					shadow: companyShadow,
					title:"<?php echo $business_name; ?>",
					zIndex: 3});*/
				
				
				google.maps.event.addListener(companyMarker, 'click', function() {
					infowindow.open(map,companyMarker);
				});
			}
			
			function toggleBounce() {

    if (marker.getAnimation() != null) {
      marker.setAnimation(null);
    } else {
      marker.setAnimation(google.maps.Animation.BOUNCE);
      //setTimeout(function(){ marker.setAnimation(null); }, 750);
    }






  }
  
		</script>
	</head>
	<body onload="initialize()">
		<div id="map_canvas" style="width:940px; height:450px"></div>
		
	</body>
	</html>