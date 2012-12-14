function RouteMarker(map,points, color, opacity, widthKm) {
  this.points_ = points;
  this.color_ = color || "#FF0000";
  this.opacity_ = opacity || 0.5;
  this.widthKm_ = widthKm || 1.0;
  this.polyLine_ = null;
  this.cluster = null;
  this.map_ = map;
  this.setMap(map);
}

RouteMarker.prototype = new google.maps.OverlayView();

// Remove the line from the map pane
RouteMarker.prototype.onRemove = function() {
  if(this.polyLine_ != null){
		this.polyLine_.setMap(null);
		this.polyLine_ = null;
  }
  //this.cluster.setVisible(false);
}
// Remove the line from the map pane
RouteMarker.prototype.onAdd = function() {
   
  var swidth = this.map_.getDiv().offsetWidth; 
  var sheight = this.map_.getDiv().offsetHeight; 
  var bnds = this.map_.getBounds();
  var pxDiag = Math.sqrt((swidth*swidth) + (sheight*sheight));
  var mDiagKm = bnds.getNorthEast().distanceFrom(bnds.getSouthWest());// / 1000.0;
  var pxPerKm = pxDiag/mDiagKm;
  var wPx = Math.round(this.widthKm_ * pxPerKm);
  if(this.widthKm_ > mDiagKm){
	//return;//dont plot when width of route more than diagonal of map
	}
  this.polyLine_ = new google.maps.Polyline({
		  strokeColor: this.color_,
		  strokeOpacity: this.opacity_,
		  strokeWeight: wPx,
		  path:this.points_,
		  map:this.map_
		});
	//this.cluster=new PolyCluster(this.map_);
	//this.cluster.setPaths(this.points_);
	//this.cluster.setStyle("index",{fill:0,stroke:1,fillColor:"#000000",strokeColor:"#ff0000",fillAlpha:1/255,strokeAlpha:1/255,weight:40});	
  this.polyLine_.setMap(this.map_);
}
// Copy our data to a new RouteMarker
RouteMarker.prototype.copy = function() {
  return new RouteMarker(this.map_,this.points_, this.color_, this.opacity_, this.widthKm_);
}

// Redraw the line based on the current projection and zoom level
RouteMarker.prototype.draw = function(force) {

  //this.remove();
  //find pixels perkm
  if(this.polyLine_ == null){
	return;
  }
  var swidth = this.map_.getDiv().offsetWidth; 
  var sheight = this.map_.getDiv().offsetHeight; 
  var bnds = this.map_.getBounds();
  var pxDiag = Math.sqrt((swidth*swidth) + (sheight*sheight));
  var mDiagKm = bnds.getNorthEast().distanceFrom(bnds.getSouthWest());// / 1000.0;
  var pxPerKm = pxDiag/mDiagKm;
  var wPx = Math.round(this.widthKm_ * pxPerKm);
  //
  //this.polyLine_.setOptions({strokeWeight:wPx});
  this.polyLine_.Yc.style.strokeWeight =wPx;
  //this.cluster.setStyle(this.points_,{fill:0,stroke:1,fillColor:"#000000",strokeColor:"#ff0000",fillAlpha:1/255,strokeAlpha:1/255,weight:40});
  //this.cluster.setVisible(true);
}



/**
* @param {google.maps.LatLng} newLatLng
* @returns {number}
*/
google.maps.LatLng.prototype.distanceFrom = function(newLatLng) {
   // setup our variables
   var lat1 = this.lat();
   var radianLat1 = lat1 * ( Math.PI  / 180 );
   var lng1 = this.lng();
   var radianLng1 = lng1 * ( Math.PI  / 180 );
   var lat2 = newLatLng.lat();
   var radianLat2 = lat2 * ( Math.PI  / 180 );
   var lng2 = newLatLng.lng();
   var radianLng2 = lng2 * ( Math.PI  / 180 );
   // sort out the radius, MILES or KM?
   var earth_radius = 3959; // (km = 6378.1) OR (miles = 3959) - radius of the earth
 
   // sort our the differences
   var diffLat =  ( radianLat1 - radianLat2 );
   var diffLng =  ( radianLng1 - radianLng2 );
   // put on a wave (hey the earth is round after all)
   var sinLat = Math.sin( diffLat / 2  );
   var sinLng = Math.sin( diffLng / 2  ); 
 
   // maths - borrowed from http://www.opensourceconnections.com/wp-content/uploads/2009/02/clientsidehaversinecalculation.html
   var a = Math.pow(sinLat, 2.0) + Math.cos(radianLat1) * Math.cos(radianLat2) * Math.pow(sinLng, 2.0);
 
   // work out the distance
   var distance = earth_radius * 2 * Math.asin(Math.min(1, Math.sqrt(a)));
 
   // return the distance
   return distance;
}

