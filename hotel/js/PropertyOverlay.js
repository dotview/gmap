
//text overlays
function PropertyDetailOverlay(pos, txt, cls, map) {
    // Now initialize all properties.
    this.pos = pos;
    this.txt_ = txt;
    this.cls_ = cls;
    this.map_ = map;

    // We define a property to hold the image's
    // div. We'll actually create this div
    // upon receipt of the add() method so we'll
    // leave it null for now.
    this.div_ = null;
    // Explicitly call setMap() on this overlay
    this.setMap(map);
}

PropertyDetailOverlay.prototype = new google.maps.OverlayView();

PropertyDetailOverlay.prototype.draw = function () {
    var overlayProjection = this.getProjection();

    // Retrieve the southwest and northeast coordinates of this overlay
    // in latlngs and convert them to pixels coordinates.
    // We'll use these coordinates to resize the DIV.
    var position = overlayProjection.fromLatLngToDivPixel(this.pos);

    var div = this.div_;

    // Now position our DIV based on the DIV coordinates of our bounds
    var mapWidth = map.getDiv().offsetWidth;
    var mapHeight = map.getDiv().offsetHeight;

    var boxWidth = 250;
    var boxHeight = 40;

    var left = 0;
    var top = 0;
    var xStart = position.x - boxWidth / 2;
    var xEnd = position.x + boxWidth / 2;
    var yStart = position.y;
    var yEnd = position.y + boxHeight;

    if (xStart < 0)
        left = 0;
    else if (xEnd > mapWidth)
        left = mapWidth - boxWidth;
    else
        left = xStart;

    if (yEnd > mapHeight)
        top = mapHeight - 2 * boxHeight;
    else
        top = position.y;

    div.style.left = left + 'px';
    div.style.top = top + 'px';
}

PropertyDetailOverlay.prototype.onAdd = function () {
    // Note: an overlay's receipt of onAdd() indicates that
    // the map's panes are now available for attaching
    // the overlay to the map via the DOM.

    // Create the DIV and set some basic attributes.
    var div = document.createElement('DIV');
    div.style.position = "absolute";
    div.className = this.cls_;

    div.innerHTML = this.txt_;

    // Set the overlay's div_ property to this DIV
    this.div_ = div;
    var overlayProjection = this.getProjection();
    var position = overlayProjection.fromLatLngToDivPixel(this.pos);
    div.style.left = position.x + 'px';
    div.style.top = position.y + 'px';
    // We add an overlay to a map via one of the map's panes.

    var panes = this.getPanes();
    panes.floatPane.appendChild(div);
    this.toggle();
}

//Optional: helper methods for removing and toggling the text overlay.  
PropertyDetailOverlay.prototype.onRemove = function () {
    this.div_.parentNode.removeChild(this.div_);
    this.div_ = null;
}
PropertyDetailOverlay.prototype.hide = function () {
    if (this.div_) {
        this.div_.style.visibility = "hidden";
    }
}

PropertyDetailOverlay.prototype.show = function () {
    if (this.div_) {
        this.draw();
        this.div_.style.visibility = "visible";

    }
}

PropertyDetailOverlay.prototype.toggle = function () {
    if (this.div_) {
        if (this.div_.style.visibility == "hidden") {
            this.show();
        }
        else {
            this.hide();
        }
    }
}

PropertyDetailOverlay.prototype.toggleDOM = function () {
    if (this.getMap()) {
        this.setMap(null);
    }
    else {
        this.setMap(this.map_);
    }
}
      