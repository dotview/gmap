jQuery.noConflict();
var map;
var setmarker;
var infowindow;
var defaultZoom = 8;
var range_bounds;
var oldLatLng;
var geocoder = new google.maps.Geocoder();
var circle;
var setmarkerImage = "http://maps.google.com/mapfiles/ms/micons/ylw-pushpin.png";
var dragHint = "You will receive alerts<BR> for this location!";
var NotInViewPortHint = "The Place you search is not in Ireland viewport!\r\nPlease search again!";
function initialize_googlemap() {
    var b = jQuery("#lat").val() != "" ? jQuery("#lat").val() : 53.4260046;
    var c = jQuery("#lng").val() != "" ? jQuery("#lng").val() : -7.738773;
    var d = new google.maps.LatLng(b, c);
    range_bounds = new google.maps.LatLngBounds(new google.maps.LatLng(50.5, -10.3), new google.maps.LatLng(55.47, -5.47));
 if (!range_bounds.contains(d)) {
        d = range_bounds.getCenter()
    }
    var e = {
        zoom: defaultZoom,
        center: d,
        navigationControl: true,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        cursor: 'pointer'
    };
    map = new google.maps.Map(document.getElementById("map_canvas"), e);
    var f = document.getElementById('address');
    var g = new google.maps.places.Autocomplete(f, "uk");
    g.bindTo('bounds', map);
    jQuery("#address").focus(function() {
        jQuery(this).val("")
    }).click(function() {
        jQuery(this).val("")
    });
    google.maps.event.addListener(map, 'click', 
    function(a) {
        if (checkIsInBounds(a.latLng)) {
            PleaceMarker(a.latLng)
        }
    });
    google.maps.event.addListener(map, 'drag', 
    function(a) {
        checkBounds()
    });
    oldLatLng = d;
    PleaceMarker(d, true);
    if (jQuery("#buffer").val() != "") {
        setCircle(jQuery("#buffer").val())
    }
}
function checkBounds() {
    if (range_bounds.contains(map.getCenter())) {
        return
    }
    var C = map.getCenter();
    var X = C.lng();
    var Y = C.lat();
    var a = range_bounds.getNorthEast().lng();
    var b = range_bounds.getNorthEast().lat();
    var c = range_bounds.getSouthWest().lng();
    var d = range_bounds.getSouthWest().lat();
    if (X < c) {
        X = c
    }
    if (X > a) {
        X = a
    }
    if (Y < d) {
        Y = d
    }
    if (Y > b) {
        Y = b
    }
    map.setCenter(new google.maps.LatLng(Y, X))
}
function checkIsInBounds(a) {
    if (range_bounds.contains(a)) {
        return true
    } else {
        return false
    }
}
function PleaceMarker(b, c) {
    if (setmarker == null) {
        var d = new google.maps.MarkerImage(setmarkerImage, new google.maps.Size(32, 32), new google.maps.Point(0, 0), new google.maps.Point(10, 32));
        setmarker = new google.maps.Marker({
            position: b,
            map: map,
            title: dragHint,
            draggable: true,
            icon: d,
            cursor: 'pointer'
        })
    }
    oldLatLng = b;
    setmarker.setCursor("pointer");
    setmarker.setPosition(b);
    geocodePosition(b);
    updateMarkerPosition(b);
    google.maps.event.addListener(setmarker, 'click', 
    function(a) {
        ShowInfoWindow(setmarker, dragHint)
    });
    ShowInfoWindow(setmarker, dragHint);
    google.maps.event.addListener(setmarker, 'drag', 
    function() {
        if (checkIsInBounds(setmarker.getPosition())) {
            geocodePosition(setmarker.getPosition());
            updateMarkerPosition(setmarker.getPosition());
            oldLatLng = setmarker.getPosition()
        } else {
            setmarker.setPosition(oldLatLng)
        }
        return false
    })
}
function geocodePosition(b) {
    geocoder.geocode({
        latLng: b
    },
    function(a) {
        if (a && a.length > 0) {
            updateMarkerAddress(a[0].formatted_address)
        } else {
            updateMarkerAddress('Cannot determine address at this location.')
        }
    })
}
function setCircle(a) {
    a = parseInt(a);
    if (circle == null) {
        circle = new google.maps.Circle({
            map: map,
            fillColor: '#00AAFF',
            fillOpacity: 0.6,
            strokeColor: '#ccc',
            strokeOpacity: 0.9,
            radius: a
        });
        circle.bindTo('center', setmarker, 'position')
    } else {
        circle.setRadius(a)
    }
}
function updateMarkerPosition(a) {
    if (document.getElementById('result_lat')) {
        document.getElementById('result_lat').value = a.lat()
    }
    if (document.getElementById('result_lng')) {
        document.getElementById('result_lng').value = a.lng()
    }
}
function updateMarkerAddress(a) {
    document.getElementById('address').value = a
}
function ShowInfoWindow(a, b) {
    if (infowindow == null) {
        infowindow = new google.maps.InfoWindow({
            content: b,
            size: new google.maps.Size(500, 500)
        })
    }
    infowindow.setContent(b);
    infowindow.open(map, a)
}
function MapSearch(c) {
    if (c == "") {
        return
    }
    if (geocoder) {
        geocoder.geocode({
            'address': c
        },
        function(a, b) {
            if (b == google.maps.GeocoderStatus.OK) {
                if (checkIsInBounds(a[0].geometry.location)) {
                    map.setCenter(a[0].geometry.location);
                    PleaceMarker(a[0].geometry.location);
                    map.setZoom(13)
                } else {
                    alert(NotInViewPortHint)
                }
            } else {
                alert("Can not find the place: " + c + " ")
            }
        })
    }
}
google.maps.event.addDomListener(window, 'load', initialize_googlemap);