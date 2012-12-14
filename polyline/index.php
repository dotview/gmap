<!DOCTYPE html> 
<html> 
<head> 
<meta name="viewport" content="initial-scale=1.0, user-scalable=no" /> 
<meta http-equiv="content-type" content="text/html; charset=UTF-8"/> 
<title>Google Maps JavaScript API v3 Demo Polyline</title> 
 <link href="/style/common.css" rel="stylesheet" type="text/css" id="Link2">
  <script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.min.js"></script>
<script type="text/javascript" src="http://maps.google.com/maps/api/js?sensor=false"></script> 
<style>.highlight{ background:#ff1fff;}</style>
<script type="text/javascript"> 
	function GoogleMaping(){
		var map;
		var polyline = null ;
		var polygon = null;
		var coords = new Array();
		var markers = new Array();
		var polyOptions = {
		  strokeColor: '#000000',
		  strokeOpacity: 1.0,
		  strokeWeight: 3,
		  editable:true
		}
		var self = this;
		
		this.init = function(){
			var chicago = new google.maps.LatLng(30.26589239295696, 120.16146411914064);
			var myOptions = {
			  zoom: 10,
			  center: chicago,
			  disableDoubleClickZoom:true,
			  mapTypeId: google.maps.MapTypeId.ROADMAP
			};
			map = new google.maps.Map(document.getElementById('map_canvas'), myOptions);
			
			polyline = new google.maps.Polyline(polyOptions);
			polyline.setMap(this.map);
			
			this.bindEvent();
		}
		this.bindEvent = function(){
			google.maps.event.addListener(map, 'click',  function(e){
				
				self.DrawLine(e);
			});
		}
		this.DrawLine = function(event){
			if(polygon!=null){
				return;
			}
			coords.push(event.latLng);
			var path = polyline.getPath();
			path.push(event.latLng);
			
			var marker = new google.maps.Marker({
			  position: event.latLng,
			  title: '#' + path.getLength(),
			  map: map
			});
			
			google.maps.event.addListener(marker, 'click',  function(e){
				self.DrawPolygon(e);
			
			});
			markers.push(marker);
		}
		this.DrawPolygon = function(event){
			if(polygon!=null){
				return;
			}
			if(markers.length>0 && event.latLng==markers[0].getPosition()){
				polygon = new google.maps.Polygon({
				  paths: coords,
				  strokeColor: "#FF0000",
				  strokeOpacity: 0.8,
				  strokeWeight: 3,
				  fillColor: "#FF0000",
				  fillOpacity: 0.35,
				  editable:true
				});
				polygon.setMap(map);
				
				this.deleteLines();
			}
		}
		//delete all markers and polylines
		this.deleteLines = function(){
			//delete markers
			for (var j in markers) {
				markers[j].setMap(null);
			}
			this.markers.length=0;
			polyline.setMap(null);
			polyline = null;
		}
		this.deletePolygons = function(){
			
		}
		this.getPath =function(){
			return polygon.getPaths();
		}
		return this.init();
	}
 
   var map;
  function initialize() {
    map = new GoogleMaping();
  }
  function getpath(){
	alert(map.getPath());
  }
</script> 
</head> 
<body onload="initialize()"> 
 <div id="content">
<div id="map_canvas" style="float:left;width:70%;min-height:600px;height:90%;"></div> 
<div style="float:right;width:28%;height:90%;overflow:auto;margin:8px;padding:2px;"> 
 <span id="sLatLng" onclick="getpath();"></span>
 </div> 
 </div> 
</body> 
</html> 