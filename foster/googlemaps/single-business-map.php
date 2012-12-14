<?

//$address= 'address='.$the_field('business_street_address').',+Israel&sensor=false'";
$geocode=file_get_contents(str_replace(' ',',',('http://maps.google.com/maps/api/geocode/json?address='.get_field("street").','.get_field("city").',+Israel&sensor=false')));

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
					zoom: 12,
					center: latlng,
					mapTypeControl: true,
					mapTypeControlOptions: {style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR},
					navigationControl: true,
					navigationControlOptions: {style: google.maps.NavigationControlStyle.SMALL},
					mapTypeId: google.maps.MapTypeId.ROADMAP};
					
				var map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
  
				var contentString = '<div id="content">'+
					'<div id="siteNotice">'+
					'</div>'+
					'<h3 id="firstHeading" class="firstHeading"><?php the_field('business_name'); ?></h3>'+
					'<div id="bodyContent">'+
					'<p><?php the_field('description'); ?></p>'+
					'</div>'+
					'</div>';
				var infowindow = new google.maps.InfoWindow({
					content: contentString
				});
				
				
								var companyImage = new google.maps.MarkerImage('<? echo bloginfo('template_directory').'/layouts/googlemaps/'; ?>images/bicon.png',
					new google.maps.Size(30,35),
  new google.maps.Point(0,0),
  new google.maps.Point(15,35)
				);

				var companyShadow = new google.maps.MarkerImage('<? echo bloginfo('template_directory').'/layouts/googlemaps/'; ?>images/blshadow.png',
					new google.maps.Size(52,35),
  new google.maps.Point(0,0),
  new google.maps.Point(15,35)
  );

				var companyPos = new google.maps.LatLng(<? echo $lat.','.$long; ?>);

				var companyMarker = new google.maps.Marker({
					position: companyPos,
					map: map,
					animation: google.maps.Animation.DROP,
					icon: companyImage,
					shadow: companyShadow,
					title:"<?php the_field('name'); ?>",
					zIndex: 3});
				
				
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
		<div id="map_canvas" style="width:640px; height:350px"></div>
		<div id="details" style="width:640px;margin-top:20px;"></div>
		<div id="details-left" style="width:320px;float:left">
		<table>
		<tr>
		<td width="75px" valign="top"><h5>Business</h5></td>
		<td valign="top"><? the_field("business_category"); ?></td>
		</tr>
		<tr>
		<td width="75px" valign="top"><h5>Address</h5></td>
		<td valign="top"><? the_field("street"); ?>, <? the_field("city"); ?></td>
		</tr>
		</table>
		</div>
		<div id="details-right" style="width:320px;float:right">
		<table>
		<tr>
		<td width="50px" valign="top"><h5>Phone</h5></td>
		<td valign="top"><? the_field("phone"); ?></td>
		</tr>
		<tr>
		<td width="75px" valign="top"><h5>Email</h5></td>
		<td valign="top"><? the_field("email"); ?></td>
		</tr>
		</table>
		</table>
		</div>
		<div id="details-left" style="width:320px;float:left">
		<h5>Business Details</h5>
		<? the_field("description"); ?>
		</div>
		<div id="details-right" style="width:320px;float:right">
		<h5>&nbsp;</h5>
		<img src="<?php bloginfo('template_url');?>/thumbs/timthumb.php?src=<? echo get_field("image"); ?>&w=320&zc=3" alt="<?php the_field('name'); ?>">
		
		</div>
	</body>
</html>