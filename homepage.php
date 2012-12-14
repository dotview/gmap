<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<title>Google map Demos</title>
<link href="style/index.css" rel="stylesheet" type="text/css" />
<link href="style/jquery.lightbox-0.5.css" rel="stylesheet" type="text/css" />
<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.min.js"></script>
<script type="text/javascript" src="js/jquery.lightbox-0.5.pack.js"></script>
<script charset="UTF-8" type="text/javascript">
 $(document).ready(function(){
  	 
	  $('#homecontainer .item-image a').lightBox({
			overlayOpacity:			0.4,		// (integer) Opacity value to overlay; inform: 0.X. Where X are number from 0 to 9
		overlayBgColor:"#666" ,
		imageLoading:			'images/lightbox-ico-loading.gif',		// (string) Path and the name of the loading icon
		imageBtnPrev:			'images/lightbox-btn-prev.gif',			// (string) Path and the name of the prev button image
		imageBtnNext:			'images/lightbox-btn-next.gif',			// (string) Path and the name of the next button image
		imageBtnClose:			'images/lightbox-btn-close.gif',		// (string) Path and the name of the close btn
		imageBlank:				'images/lightbox-blank.gif',
	});
});
</script>

</head>
<body>
    <div id="homecontainer">
	<div id="google_translate_element"></div><script>
function googleTranslateElementInit() {
  new google.translate.TranslateElement({
    pageLanguage: 'en'
  }, 'google_translate_element');
}
</script><script src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"></script>
		<div class="item">
			<div class="item-image">
			<a href="images/intro/category.jpg" target="_blank" title="offer demo"><img src="images/intro/category.jpg" /> </a>
			</div>
			<div class="item-content"> 
				<p> The map show markers in all categories, click the category name on the right bottom, you can see the certain category markers. below the map shows the items group by categories, click the item, the maker on the map will show popup infowindow.</p>
				<p>Keywords:Category,color icons, filter, custom icon, V3</p>
				<p>Feel free to see how this demo working. <a class="link" href="foster/"> visit the page </a></p>
			</div>
		 </div>
		 
		<div class="item">
			<div class="item-image">
			<a  href="images/intro/offer.jpg" target="_blank" title="offer demo"><img src="images/intro/offer.jpg" /> </a>
			</div>
			<div class="item-content"> 
				<p>You can search by offer type near the location you input. The markers can be clustered if too many markers showing. On the right of the map, the results are showed by list, when you click the item in the list, the marker will be actived and show detail inforamtion. The same, when you click the marker on the map, you will also navigated to the item in the list.</p>
				<p>Keywords:Cluter markers,location search, filtering, map view, list view </p>
				<p>Feel free to see how this demo working. <a class="link" href="offer/index.html"> visit the page </a></p>
			</div>
		 </div>
		 
		 <div class="item">
			<div class="item-image">
			<a href="images/intro/guider.png" target="_blank" title="offer demo"><img src="images/intro/guider.png" /> </a>
			</div>
			<div class="item-content"> 
				<p>This will show you how to make different routing according to different day, also can be used for different category. you can click the days button on the right top to view certain day routing or pins..</p>
 
				<p>Keywords:day routes, colored routing, switch, full map</p>
				<p>Feel free to see how this demo working. <a class="link" href="guider/index.htm"> visit the page </a></p>
			</div>
		 </div>
		 
		 <div class="item">
			<div class="item-image">
			<a href="images/intro/polygon.png" target="_blank" title="offer demo"><img src="images/intro/polygon.png" /> </a>
			</div>
			<div class="item-content"> 
				<p>Draw polygon and search within the area or search along polyline. you can set the buffer off the polygon/polyline.</p>
 
				<p>Keywords:Polygon,polyline, search along route, buffer, distance off</p>
				<p>Feel free to see how this demo working. <a class="link" href="polyline/index.html"> visit the page </a></p>
			</div>
		 </div>
		 
		 <div class="item">
			<div class="item-image">
			<a href="images/intro/mappin.jpg" target="_blank" title="offer demo"><img src="images/intro/mappin.jpg" /> </a>
			</div>
			<div class="item-content"> 
				<p> When the page first loads, the pins data from server animate like darts being thrown at the map. You can add an pin to the map, or remove a pin from the map. Adding or removing make an ajax call to the server, and the pin fadein or fadeout the map.</p>
				<p>Keywords:animate effect, drop pin, ajax, fadein, fadeout, jquery plugin, multiple instance</p>
				<p>Feel free to see how this demo working. <a class="link" href="mappin/"> visit the page </a></p>
			</div>
		 </div>
	    
		<div class="item">
			<div class="item-image">
			<a href="images/intro/hotel.jpg" target="_blank" title="offer demo"><img src="images/intro/hotel.jpg" /> </a>
			</div>
			<div class="item-content"> 
				<p> When the page first loads, the pins data from server animate like darts being thrown at the map. You can add an pin to the map, or remove a pin from the map. Adding or removing make an ajax call to the server, and the pin fadein or fadeout the map.</p>
				<p>Keywords:animate effect, custom icon, mouse over </p>
				<p>Feel free to see how this demo working. <a class="link" href="hotel/"> visit the page </a></p>
			</div>
		 </div>
		 <div class="item">
			<div class="item-image">
			<a href="images/intro/category2.jpg" target="_blank" title="offer demo"><img src="images/intro/category2.jpg" /> </a>
			</div>
			<div class="item-content"> 
				<p> Use the drop down menu to select individual solutions. Use the zoom and direction arrows to navigate to your area of interest. Click on a flag to view resource details.Select the document type to turn it on and off and be visible on the map:
					HINT: Zoom in for a better view of areas with multiple flags.</p>
				<p>Keywords:Category,color icons, filter, custom icon </p>
				<p>Feel free to see how this demo working. <a class="link" href="google-map/"> visit the page </a></p>
			</div>
		 </div>
		 <div class="item">
			<div class="item-image">
			<a href="images/intro/radius.jpg" target="_blank" title="offer demo"><img src="images/intro/radius.jpg" /> </a>
			</div>
			<div class="item-content"> 
				<p> Search limit area of ireland, input address and then get the coordinates. show radius around the point address  you input .</p>
				<p>Keywords:radius, limit area, search, geocoding, </p>
				<p>Feel free to see how this demo working. <a class="link" href="coordinates/"> visit the page </a></p>
			</div>
		 </div>
		 <div class="item">
			<div class="item-image">
			<a href="images/intro/routeloop.jpg" target="_blank" title="offer demo"><img src="images/intro/routeloop.jpg" /> </a>
			</div>
			<div class="item-content"> 
				<p> Create defferent route according to the distance you set, you can choose the direction you prefer to find the route.  on the right panel, you will see the steps on the route.</p>
				<p>Keywords:route, loop, search, geocoding, </p>
				<p>Feel free to see how this demo working. <a class="link" href="routeloop/"> visit the page </a></p>
			</div>
		 </div>
		 
		 <div class="item">
			<div class="item-image">
			<a href="images/intro/china.jpg" target="_blank" title="offer demo"><img src="images/intro/china.jpg" /> </a>
			</div>
			<div class="item-content"> 
				<p>Based on svg data, we can define a map area as we want. when mouse over the area, this area will highlight, click it and show the deail info or anything you want.</p>
				<p>Using 3rd Party Jquery plugin: <a target="_blank" href="http://davidlynch.org/js/maphilight/docs/">Jquery.map.highlight</a></p>
				<p>Keywords:Map highlight,mouse over</p>
				<p>Feel free to see how this demo working. <a class="link" href="china/index.php"> visit the page </a></p>
			</div>
		 </div>
    </div>
</body>
</html>
