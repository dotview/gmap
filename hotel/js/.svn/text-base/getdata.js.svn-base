
var map;
var hotelMarker = new Array();
//var infoWins = new Array();
var hotels = new Array();
//var infos = new Array();
var overlay = new Array();
var hotelMarker3 = new Array();
var hotelMarker4 = new Array();
var hotelMarker5 = new Array();

function initialize() {
    var myLatlng = new google.maps.LatLng(35.339, 33.52);
    var myOptions = {
        zoom: 9,
        center: myLatlng,
        mapTypeControlOptions: {
            mapTypeIds: [google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.SATELLITE, google.maps.MapTypeId.HYBRID]
        },
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: true,
        navigationControl: true,
        scaleControl: true,
        streetViewControl: false,
        scrollwheel: true
    };
    map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);

    var filterDiv = document.createElement('DIV');
    var mControl = new FilterControl(filterDiv, map);
    filterDiv.index = 1;
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(filterDiv);

setTimeout(filter_data,100);
    //filter_data();
    google.maps.event.addListener(map, 'idle', function () {
        for (var j in overlay) {
            overlay[j].draw();
        }
        //setTimeout(function () { filter_data() }, 10);
    });
}
function FilterControl(controlDiv, map) {
    controlDiv.style.padding = '4px';
    var controlUI = document.createElement('DIV');
    controlUI.style.cssText = ' border:0px solid green;padding:1px;margin:1px;cursor:pointer;font-size:13px;color:#000;background:#fff;';
    //controlUI.innerHTML = "<p><input type='checkbox' id='starHotel5' checked='checked' name='starHotel5'/> <Label for='starHotel5'>5 Star Hotel</Label></p>" +
    //"<p><input type='checkbox' id='starHotel4' name='starHotel4' checked='checked'  /><Label for='starHotel4'>4 Star Hotel</Label></p>" +
    //"<p><input type='checkbox' id='starHotel3' name='starHotel3' checked='checked' /><Label for='starHotel3'>3 Star Hotel</Label></p>";
    var starHotel5 = $("<input type='checkbox' id='starHotel5' checked='checked'  name='starHotel5'/>");
    var starHotel5_for = $("<Label for='starHotel5' style='cursor:pointer;'>5 Star Hotel</Label>");

    starHotel5.attr("checked", "checked");

    starHotel5.appendTo(controlUI);
    starHotel5_for.appendTo(controlUI);
    starHotel5.click(function () {
        for (var i in hotelMarker5) {
            j = hotelMarker5[i];
            if ($(this).attr('checked') == true)
                hotelMarker[j].setMap(map);
            else
                hotelMarker[j].setMap(null);
        }
    });
    var starHotel4 = $("<input type='checkbox' id='starHotel4' checked='checked' name='starHotel4'/>");
    var starHotel4_for = $("<Label for='starHotel4' style='cursor:pointer;'>4 Star Hotel</Label>");
    starHotel4.appendTo(controlUI);
    starHotel4_for.appendTo(controlUI);
    starHotel4.click(function () {
         
        for (var i in hotelMarker4) {
            j = hotelMarker4[i];
            if ($(this).attr('checked') == true)
                hotelMarker[j].setMap(map);
            else
                hotelMarker[j].setMap(null);
        }
    });
    var starHotel3 = $("<input type='checkbox' id='starHotel3' checked='checked' name='starHotel3'/>");
    var starHotel3_for = $("<Label for='starHotel3' style='cursor:pointer;'>3 Star Hotel</Label>");
    starHotel3.appendTo(controlUI);
    starHotel3_for.appendTo(controlUI);
    starHotel3.click(function () {
       
        for (var i in hotelMarker3) {
            j = hotelMarker3[i];
            if ($(this).attr('checked') == true)
                hotelMarker[j].setMap(map);
            else
                hotelMarker[j].setMap(null);
        }
    });
    controlDiv.appendChild(controlUI);
}
function filter_data() {
    if (hotelMarker.length > 0)
        return;
    for (var j in hotelMarker) {
        hotelMarker[j].setMap(null);
    }

    var hotel_Id;
    var hotel_LatLng;
    var hotel_Name;
    var hotel_Star;
    var hotel_StarRating;
    var hotel_DetailUrl;
    var hotel_Thumbnail;
    var hotel_Memo;


    var markerImage = "http://www.gonorthcyprus.com/images/map-marker-hotel.gif";
    var popDiag = $("#markerPopup")


    $.ajax({
        type: "GET",
        url: "data.php",
        cache: false,
        data: {
            'type': 'list',
            'star': 5
        },

        success: function (data) {
            hotels = data.Hotels;

            $.each(hotels, function (i) {
			setTimeout(function(){
                var hotel = hotels[i].split("#");
                //hotel_Id = hotel[0];
                hotel_LatLng = hotel[0];
                hotel_Name = hotel[1];
                hotel_Star = hotel[2];
                hotel_StarRating = hotel[3];
                hotel_DetailUrl = hotel[4];
                hotel_Thumbnail = hotel[5];
                hotel_Memo = hotel[6];

                var latlng = new google.maps.LatLng(hotel_LatLng.split(",")[0], hotel_LatLng.split(",")[1]);
                hotelMarker[i] = new google.maps.Marker({
                    position: latlng,
                    map: map,
                    title: hotel_Name,
                    icon: markerImage,
					animation: google.maps.Animation.DROP
                    //zIndex: -10
                });


                var rate = '';
                if (hotel_StarRating && hotel_StarRating > 0) {
                    rate = '<img alt="' + hotel_StarRating + ' stars" src=\'http://q.bstatic.com/static/img/icons/stars/' + hotel_StarRating + 'sterren-small.png\'>';
                }

                var prophtml = '<div class="hotel" id="b_overlay"><h3>' + rate + hotel_Name + '</h3><p><img alt="" src="' + hotel_Thumbnail + '">' + hotel_Memo + '</p><p>&nbsp;</p></div>'
                //infoWins[i] = new google.maps.InfoWindow({
                //    content: prophtml
                //});
                overlay[i] = new PropertyDetailOverlay(latlng, prophtml, "customBox", map);

                google.maps.event.addListener(hotelMarker[i], 'mouseover', function () {
                    overlay[i].show();
                });
                google.maps.event.addListener(hotelMarker[i], 'mouseout', function () {
                    overlay[i].hide();
                });
                google.maps.event.addListener(hotelMarker[i], 'click', function () {
                    document.location = hotels[i].split("#")[4];
                });
                if (hotel_Star == 3)
                    hotelMarker3.push(i);
                else if (hotel_Star == 4)
                    hotelMarker4.push(i);
                else if (hotel_Star == 5)
                    hotelMarker5.push(i);
                },i*50);
            });
        },
        error: function (d) {
            //alert("fail to search!please try again!");
        },
        dataType: "json"
    });
}

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
    if (div == null)
        return;
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