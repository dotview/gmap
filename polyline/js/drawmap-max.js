jQuery.noConflict();
	
	var ip_city = geoip_city();
	var ip_state = geoip_region();
	var ip_zip = geoip_postal_code();
	var ip_lat = geoip_latitude();
	var ip_lon = geoip_longitude();
	var ip_country = geoip_country_code(); 
	
	function GoogleMaping(){
		/*props*/
		var map;
		var polyline = null ;
		var polygon = null;
		var buffers = new Array();
		var markers = new Array();
		var polyOptions = {
		  strokeColor: '#FF0000',
		  strokeOpacity: 0.8,
		  strokeWeight: 3,
		  editable:false,
				  clickable:false
		};
		
		var polygonOptions ={
				  strokeColor: "#FF0000",
				  strokeOpacity: 0.8,
				  strokeWeight: 3,
				  fillColor: "#FF0000",
				  fillOpacity: 0.5,
				  editable:false,
				  geodesic:false,
				  clickable:false
				};
		var path = new google.maps.MVCArray;		
		var index = 0;
		var self = this;
		var boxpolys = null;
		var routeBoxer = null;
		var distance = 10;
		var routebuffer;
		var cluster;
		var geocoder = new google.maps.Geocoder();
		var range_bounds;
		var oldLatLng;
		var NotInViewPortHint ="The Place you search is not in Ireland viewport!\r\nPlease search again!";

		var svc;

		/*functions*/
		self.init = function(){
			//var lat = jQuery("#lat").val()!="" ? jQuery("#lat").val():53.4260046;
			//var lng = jQuery("#lng").val()!="" ? jQuery("#lng").val():-7.738773;
			var lat = ip_lat ? ip_lat:53.4260046;
			var lng = ip_lon ? ip_lon:-7.738773;
			var latlng = new google.maps.LatLng(lat,lng);
			var defaultZoom = 7;
			range_bounds = new google.maps.LatLngBounds(
				new google.maps.LatLng(50.5,-10.3)
				,new google.maps.LatLng(55.47,-5.47)
			)
			if(!range_bounds.contains(latlng)){
				latlng=range_bounds.getCenter();
			}
			var myOptions = {
			  zoom: defaultZoom,
			  center: latlng,
			  disableDoubleClickZoom:true,
			  mapTypeId: google.maps.MapTypeId.ROADMAP
			};
			map = new google.maps.Map(document.getElementById('map_canvas'), myOptions);
			
			var input = document.getElementById('address');
			var autocomplete = new google.maps.places.Autocomplete(input,"uk");
			autocomplete.bindTo('bounds', map);
			
			svc = new gmaps.ags.GeometryService('http://sampleserver3.arcgisonline.com/arcgis/rest/services/Geometry/GeometryServer');
			//routeBoxer = new RouteBoxer();
			//cluster=new PolyCluster(map);
			
			// Add a move listener to restrict the bounds range
			google.maps.event.addListener(map, 'drag', function(event) {
				checkBounds(); 
			});
			oldLatLng = latlng;
			self.bindEvent();
			jQuery("#buffer").trigger("change");
		}
		self.bindEvent = function(){
			google.maps.event.addListener(map, 'click',  function(e){
				self.addAndDraw(e.latLng,true);
			});
			jQuery("#style").change(function(e){
				self.Draw(true);
			})
			jQuery("#btnClear").click(function(){
				self.clearMap();
			})
			jQuery("#buffer").change(function(e){
				self.calDistance(e);
				self.clearBuffer();
				//self.clearBoxes();
				self.drawBuffer(jQuery("#style").val());
			})
			jQuery("#btnClearLast").click(function(e){
				path.removeAt(index-1);
				self.removeMarker(index-1);
				self.Draw(true);
			})
			jQuery("#btnSearch").bind('click', function(ev) {
				MapSearch(jQuery("#address").val());
			});
			
			jQuery("#address").focus(function(){
				jQuery(this).val("");
			}).click(function(){
				jQuery(this).val("");
			});
		}
		self.addAndDraw = function(latlng,clear){
			if(checkIsInBounds(latlng)){
				if(index>=20){
					alert("maxmum number of markers reached!");
					return false;
				}
				self.addMarker(latlng);
				self.Draw(clear);
				 
			}
		}
		self.Draw = function(clear){
			if(clear){
				self.clearLines();
				self.clearPolygons();
			}
			self.clearBuffer();
			//self.clearBoxes();
			self.showCoords();
			if(jQuery("#style").val()=="line"){
				self.DrawLine();
				self.drawBuffer("line");
			}else if(jQuery("#style").val()=="poly")
			{
				self.DrawPolygon();
				self.drawBuffer("poly");
			}
			
		}
		self.addMarker = function(latlng){
			//coords.push(latlng);
			path.insertAt(path.length, latlng);
			
			var iconindex = (index+1).toString().length<2 ?"0"+(index+1).toString() : (index+1);
			var imagepath = "icons/white"+iconindex + ".png";
			var image = new google.maps.MarkerImage(imagepath,
				  // This marker is 20 pixels wide by 32 pixels tall.
				  new google.maps.Size(27, 27),
				  // The origin for this image is 0,0.
				  new google.maps.Point(0,0),
				  // The anchor for this image is the base of the flagpole at 0,32.
				  new google.maps.Point(15, 27));

			var marker = new google.maps.Marker({
			  position: latlng,
			  title: '#' + path.getLength(),
			  map: map,
			  icon : image,
			  draggable:true
			});
			marker.index = index;
			marker.oldpos = latlng;
			//self.cal(latlng.lat(),latlng.lng());
			//setCircle(10000,marker);
			google.maps.event.addListener(marker, 'dragend',  function(e){		
				if(checkIsInBounds(this.getPosition())){
					path.setAt(this.index, this.getPosition());
					self.Draw();
					oldLatLng = this.getPosition();
					marker.oldpos = this.getPosition();
					//geocodePosition(this.getPosition());
				}else{
					this.setPosition(this.oldpos);
				}
				return false;
			});
			oldLatLng = latlng;
			/*google.maps.event.addListener(marker, 'rightclick',  function(e){
				path.removeAt(this.index);
				self.removeMarker(this.index);
				self.Draw(true);
			});*/
			
			index+=1;
			geocodePosition(latlng);
			markers.push(marker);
		}
		self.DrawLine = function(){		
			if(polyline==null){
				polyline = new google.maps.Polyline(polyOptions);		
			}
			polyline.setPath(new google.maps.MVCArray([path]));		
			polyline.setMap(map);

		}
		self.DrawPolygon = function(){
			if(polygon==null){
				polygon = new google.maps.Polygon(polygonOptions);
			}
			polygon.setMap(map);	
			polygon.setPaths(new google.maps.MVCArray([path]));
		}
		var EARTH_RADIUS_EQUATOR = 6378140.0;
		var RADIAN = 180 / Math.PI;

		function calcLatLong(longitude, lat, distance, bearing) 
		{
			 var b = bearing / RADIAN;
			 var lon = longitude / RADIAN;
			 var lat = lat / RADIAN;
			 var f = 1/298.257;
			 var e = 0.08181922;
				
			 var R = EARTH_RADIUS_EQUATOR * (1 - e * e) / Math.pow( (1 - e*e * Math.pow(Math.sin(lat),2)), 1.5);	
			 var psi = distance/R;
			 var phi = Math.PI/2 - lat;
			 var arccos = Math.cos(psi) * Math.cos(phi) + Math.sin(psi) * Math.sin(phi) * Math.cos(b);
			 var latA = (Math.PI/2 - Math.acos(arccos)) * RADIAN;

			 var arcsin = Math.sin(b) * Math.sin(psi) / Math.sin(phi);
			 var longA = (lon - Math.asin(arcsin)) * RADIAN;

			 return new google.maps.LatLng(latA, longA);
		}

		self.drawBuffer = function(type){
			if(path.getArray().length>1){
			self.clearBuffer();
			
			var poly = polyline;
			if(type=="poly"){
				poly = polygon;
			}
			var params = {
			  geometries: [poly],
			  bufferSpatialReference: 102113,//gmaps.ags.SpatialReference.WEB_MERCATOR,
			  distances: [distance],
			  unit: 9001,
			  unionResults: true, overlayOptions:{strokeColor: "#FF0000",
				  strokeOpacity: 0.8,
				  strokeWeight: 0,
				  fillColor: "#FF0000",
				  fillOpacity: 0.3},
				  polygonOptions:polygonOptions,
				  clickable:false,
				  zIndex:10
			};
			svc.buffer(params, function(results, err) {
			  if (!err) {
				self.clearBuffer();
				var g;
				for (var i = 0, I = results.geometries.length; i < I; i++) {
				  for (var j = 0, J = results.geometries[i].length; j < J; j++) {
					g = results.geometries[i][j];
					g.clickable= false;
					g.setMap(map);
					buffers.push(g);
				  }
				}
			  } else {
				alert(err.message + err.details.join(','));
			  }
			});
		  }
			/*(var npath2 =polygon.GetPointsAtDistance(1000);
			var polygon2 = new google.maps.Polygon(polygonOptions);
			 
			polygon2.setMap(map);	
			polygon2.setPaths(npath2);
			
			 if(path.getArray().length>1){
				self.clearBuffer();
				var npath = path;
				if(type=="poly"){
					//npath.insertAt(npath.length,npath.getAt(0));
				}
				//cluster.setPaths(npath);
				//cluster.setStyle(npath,{fill:0,stroke:1,fillColor:"#000000",strokeColor:"#ff0000",fillAlpha:1/255,strokeAlpha:1/255,weight:40});
					var polys =[];
				var pobj = {};
				path.forEach(function(elem,index){
					pobj = {x:elem.lat(),y:elem.lng()};
					polys.push(pobj);
				});
				polys ={"index": [polys]};
			
			var poly=
			[
			{
			"49723_49737":
			[
			[
			{x:-85.044210,y:45.640600},
			*/
			//routebuffer =new RouteMarker(map,npath,"#ff0000",0.3,distance);
			//var boxes = routeBoxer.box(npath.getArray(), distance);
			//self.drawBoxes(boxes);
			//} 
			
		}
		self.cal = function(lat,lng){
			var polygon2 = new google.maps.Polygon(polygonOptions);
			var ps =new google.maps.MVCArray;	
			var radius  =10000;		
			var degree = -45;
			ps.insertAt(ps.length,calcLatLong(lng, lat, radius, 45+degree));
			ps.insertAt(ps.length,calcLatLong(lng, lat, radius, 135+degree));
			ps.insertAt(ps.length,calcLatLong(lng, lat, radius, -135+degree));
			ps.insertAt(ps.length,calcLatLong(lng, lat, radius, -45+degree));
			ps.insertAt(ps.length,calcLatLong(lng, lat, radius, 45+degree));	 
			polygon2.setMap(map);					 
			polygon2.setPaths(new google.maps.MVCArray([ps])); 
		}
		self.clearBuffer = function(){
			//if(routebuffer)routebuffer.setMap(null);
			for (var i = 0; i < buffers.length; i++) {
			  buffers[i].setMap(null);
			}
			buffers.length = 0;
		}
		function setCircle(radius,setmarker){
			radius = parseInt(radius);
			 
			var	circle = new google.maps.Circle({
				  map: map,
				  fillColor:'#00AAFF',
				  
				  fillOpacity:0.6,
				  strokeColor:'#ccc',
				  strokeOpacity:0.9,
				  radius: radius
				});
				circle.bindTo('center', setmarker, 'position');
			 
		}
		self.drawBoxes = function(boxes) {
			// Draw the array of boxes as polylines on the map
		  boxpolys = new Array(boxes.length);
		  for (var i = 0; i < boxes.length; i++) {
			boxpolys[i] = new google.maps.Rectangle({
			  bounds: boxes[i],
			  fillOpacity: 0.4,
			  fillColor:'#ff0000',
			  strokeOpacity: 0.5,
			  strokeColor: '#ff0000',
			  strokeWeight: 1,
			  map: map
			});
		  }
		}
		// Clear boxes currently on the map
		self.clearBoxes =function() {
		  if (boxpolys != null) {
			for (var i = 0; i < boxpolys.length; i++) {
			  boxpolys[i].setMap(null);
			}
		  }
		  boxpolys = null;
		}
		self.calDistance = function(){
			// Convert the distance to box around the route from miles to km
			//distance = parseFloat(jQuery("#buffer").val()) * 1.609344;
			distance = parseFloat(jQuery("#buffer").val());
		}
		self.removeMarker = function(n){
			if(markers[n])markers[n].setMap(null);
			//if(n>0){
				self.resetMarkerIndex(n);
				markers= markers.slice(0,n).concat(markers.slice(n+1,this.length));
			//}
		}
		self.resetMarkerIndex = function(n){
			var marr = markers.slice(n+1,this.length);
			for (var j=0;j< marr.length;j++) {
				marr[j].index = marr[j].index-1;
			}
			index -=1;
		}
		self.clearMarkers = function(){
			//delete markers
			for (var j=0;j< markers.length;j++) {
				markers[j].setMap(null);
			}
			markers=[];
			markers.length=0;
		}
		//delete all markers and polylines
		self.clearLines = function(){
			if(polyline!=null){
			polyline.setMap(null);
			//polyline = null;
			}
		}
		self.clearPolygons = function(){
			if(polygon!=null){
			polygon.setMap(null);
			//polygon = null;
			}
		}
		self.clearMap= function(){
			index = 0;
			path.clear();
			self.clearBoxes();
			self.clearMarkers();
			self.clearLines();
			self.clearPolygons();
			self.clearBuffer();
			jQuery("#coords").val("");
		}
		
		self.getPath =function(){
			return path;
		}
		self.getNodeCount =function(){
			return index;
		}
		self.showCoords= function(){
			var coords ="";
			var strArr = [];
			path.forEach(function(elem,index){
					var d = elem.lng()+","+elem.lat();
					strArr.push(d);
			});
			jQuery("#coords").val(strArr.join("\n"));
		}
		
		// If the map position is out of range, move it back
		function checkBounds() {
			// Perform the check and return if OK
			if (range_bounds.contains(map.getCenter())) {
			  return;
			}
			// It`s not OK, so find the nearest allowed point and move there
			var C = map.getCenter();
			var X = C.lng();
			var Y = C.lat();

			var AmaxX = range_bounds.getNorthEast().lng();
			var AmaxY = range_bounds.getNorthEast().lat();
			var AminX = range_bounds.getSouthWest().lng();
			var AminY = range_bounds.getSouthWest().lat();

			if (X < AminX) {X = AminX;}
			if (X > AmaxX) {X = AmaxX;}
			if (Y < AminY) {Y = AminY;}
			if (Y > AmaxY) {Y = AmaxY;}
			//alert ("Restricting "+Y+" "+X);
			map.setCenter(new google.maps.LatLng(Y,X));
		}
		function checkIsInBounds(latlng) {
			if (range_bounds.contains(latlng)) {
				return true;
			}else{
				return false;
			}
		}
		function geocodePosition(pos) {
			geocoder.geocode({
				latLng: pos
			}, function(responses) {
				if (responses && responses.length > 0) {
					updateMarkerAddress(responses[0].formatted_address);

				} else {
					updateMarkerAddress('Cannot determine address at this location.');
				}
			});
		}
		function updateMarkerAddress(str) {
			document.getElementById('address').value = str;
		}
		function MapSearch(address) {
			if (address == "")
				return;
			if (geocoder) {
				geocoder.geocode({ 'address': address }, function(results, status) {
					if (status == google.maps.GeocoderStatus.OK) {
						if(checkIsInBounds(results[0].geometry.location)){
							map.fitBounds(results[0].geometry.viewport);
							self.addAndDraw(results[0].geometry.location,true);
						}else{
							alert(NotInViewPortHint);
						}
					} else {
						alert("Can not find the place: " + address + " ");
					}
				});
			}
		}
		return self.init();
	}
  var map;
  function initialize_googlemap() {
   map = new GoogleMaping();
   jQuery("#btnSubmit").click(function(e){
		var c=map.getNodeCount() ;
		if(c<3){
			alert("Please add at least three points!");
			e.preventDefault(); 
			return false;
		}
	});
  }
  
  google.maps.event.addDomListener(window, 'load', initialize_googlemap);