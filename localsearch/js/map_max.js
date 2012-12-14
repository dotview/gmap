var map, gInfowindow, localResult, service, geocoder, oldPlace = "";
function init() {
    var mapCenter = new google.maps.LatLng(41.941692, -87.758293);
    var myOptions = {
        zoom: 12,
        center: mapCenter,
        mapTypeControl: true,
        mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
            position: google.maps.ControlPosition.BOTTOM_LEFT

        },
        streetViewControl: false,
        panControl: true,
        zoomControl: true,
        zoomControlOptions: {
            style: google.maps.ZoomControlStyle.LARGE
        },
        scaleControl: true,
        scrollwheel: false,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById('map'), myOptions);

    geocoder = new google.maps.Geocoder();
    gInfowindow = new google.maps.InfoWindow();
    service = new google.maps.places.PlacesService(map);
}
function clear() {
    for (var i in localResult) {
        localResult[i].setMap(null);
        delete (localResult[i]);
    }
    localResult = [];
}
function callback(results, status, pagination) {
    if (status != google.maps.places.PlacesServiceStatus.OK) {
        return;
    } else {
        clear();
        createMarkers(results);
    }
}

function createMarkers(places) {
    var bounds = new google.maps.LatLngBounds();

    for (var i = 0, place; place = places[i]; i++) {
        var image = new google.maps.MarkerImage(
            place.icon, new google.maps.Size(71, 71),
            new google.maps.Point(0, 0), new google.maps.Point(17, 34),
            new google.maps.Size(25, 25));

        var marker = new google.maps.Marker({
            map: map,
            icon: image,
            title: place.name,
            position: place.geometry.location
        });
        var photos = place.photos;
        var photohtml = "";
        if (photos && photos.length > 0) {
            var url = photos[0].raw_reference.fife_url;//photos[0].getUrl({'maxWidth': 50, 'maxHeight': 50});
            photohtml = '<tr><td align=right><b>Photo:&nbsp;</b></td><td align=left><img style="max-width:100px;max-height:100px;" src="' + url + '"</td> </tr>';
        }
        marker.html = '<table width=100% border=0 style="font - size: 11px "><tr><td align=right><b>Name:&nbsp;</b></td><td align=left>' + place.name + '</td></tr>'
        + '<tr><td align=right><b>Address:&nbsp;</b></td><td align=left>' + place.formatted_address + '</td> </tr>'
        + photohtml
        + '</table>';

        google.maps.event.addListener(marker, 'click', function () {
            gInfowindow.setContent(this.html);
            gInfowindow.open(map, this);
        });
        bounds.extend(place.geometry.location);
        localResult.push(marker);
    }
    map.fitBounds(bounds);
}


function MapSearch(c, callback) {
    if (c == "") {
        return;
    }
    if (geocoder) {
        geocoder.geocode({
            'address': c
        },
        function (a, b) {
            if (b == google.maps.GeocoderStatus.OK) {
                if (typeof callback === "function") {
                    callback(a[0].geometry);
                }
            } else {
                alert("Can not find the place: " + c + " ");
            }
        })
    }
}
function doPlaceSearch() {
    var q = $("#location").val();
    MapSearch(q, function (loc) {
        map.fitBounds(loc.viewport);
        doLocalSearch();
    })
}
function localSearchByKeyWords(k) {
    document.getElementById('keyword').value = k;
    doLocalSearch();
}
function doLocalSearch() {
    var q = $("#keyword").val();
    if (q == "") { return; }
    var request = {
        bounds: map.getBounds(),
        query: q
    };
    service.textSearch(request, callback);
    //service.nearbySearch(request, callback);
}
function doSearch() {
    var pos = $("#location").val();
    if (oldPlace != pos) {
        doPlaceSearch();
    } else {
        doLocalSearch();
    }
}
$(document).ready(function () {
    $("#keyword").change(function () {
        doLocalSearch();
    });
    $("#search").click(function () {
        doSearch();
    });
    $("#location").change(function () {
        doLocalSearch();
    });
});
google.maps.event.addDomListener(window, 'load', init);