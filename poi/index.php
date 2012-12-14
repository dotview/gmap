<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<title>POI Auto Map - Demo</title>
<link rel="stylesheet" type="text/css" href="css/style.css"/>
<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
<script type="text/javascript" src="http://maps.google.com/maps/api/js?sensor=false"></script>
<script src="http://code.jquery.com/jquery.min.js" type="text/javascript"></script>
<script type="text/javascript">
var poiAddress = "Eltham, Victoria, Australia";
var poiHTML = '<h2> Eltham Victoria</h2>';
	var poiZoomLevel = 13;
    </script>
<script src="js/map.js" type="text/javascript"></script>
<style>
h1 {color: #fff; float: left; position: relative; top: -15px; left: 10px}

.description {
	font-family: Helvetica, Arial, sans-serif;
	font-size: 15px;
	font-style: normal;
	font-weight: normal;
	text-transform: normal;
	letter-spacing: normal;
	line-height: 1.3em;
}

html body { width: 100%; height: 100%; padding: 0px; margin: 0px;  font-family: arial; font-size: 10px; color: #333; background-color: #fcfcfc; }

#header-bar { height: 53px;  z-index: 100; line-height: 53px; margin-bottom: 15px; }
#header-bar a.site-loopback { display: block; margin-top: 1px; margin-left: -10px; float: right; background-repeat: no-repeat; background-position: left top; text-indent: -9999px; }
#header-bar .acodecanyon-preview-logo { background-image: url(http://www.codecanyon.net/images/common/preview-logos/codecanyon-loopback.png); width: 203px; height: 52px; }
#header-bar a { text-decoration: none; color: #6e6e6e; margin-left: 100px }
#header-bar a.purchase { margin-left: 25px; border-left: 1px solid #6e6e6e; padding-left: 15px; }
#header-bar a:hover, #header-bar a.activated { color: white; }

</style>
</body>
</head>
<body>
<div id="header-bar">
 </div> 
<div id="container">
	<div id="poiBox">
	  <div id="sidebar">
		<ul id="poiList">
		  <li title="" id="user">Search</li>
		  <li class="" title="bakery" id="bread">Bakery</li>
		  <li class="hidden" title="dentist" id="dentist">Dentist</li>
		  <li class="" title="doctor" id="doctor">Doctors</li>
		  <li class="hidden" title="university" id="university">University</li>
		  <li class="hidden" title="bank" id="bank">Bank</li>
		  <li class="" title="police" id="police">Police</li>
		  <li class="hidden" title="establishment" id="computers" name="computer">Computer Store</li>
		  <li class="hidden" title="gym" id="gym">Fitness</li>
		  <li title="food" id="pizza" name="pizza">Pizza</li>
		  <li class="hidden" title="establishment" id="church" name="catholic">Catholic Churches</li>
		  <li class="hidden" title="db:property" id="property">Property For Sale</li>
		  <li class="hidden" title="db:photo" id="photo">My Photographs</li>
		  <li class="hidden" title="db:playground" id="playground">Playgrounds</li>
		  <li class="hidden" title="db:parking" id="parking">Parking</li>
		  <li class="hidden" title="db:postcode" id="postal">Post Office</li>

		</ul>
	  </div>
	  <div id="map"></div>
	</div>
</div>
<div id="infoDiv"></div>
<script type="text/javascript">
	var londonHTML = '<img src="images/london-bus.jpg" height="80" width="80" style="float: left; margin-right: 20px" /><strong>Carnaby St, <br />London</strong>';
	var newYorkHTML = '<img src="images/newyork.jpg" height="80" width="80" style="float: left; margin-right: 20px" /><strong>New York,<br />New York</strong>';
	var parisHTML = '<img src="images/paris.jpg" height="80" width="80" style="float: left; margin-right: 20px" /><strong>Paris,<br />France</strong>';
	var hollywoodHTML = '<img src="images/newyork.jpg" height="80" width="80" style="float: left; margin-right: 20px" /><strong>Hollywood,<br /></strong>';
</script>
 
</body>
</html>
