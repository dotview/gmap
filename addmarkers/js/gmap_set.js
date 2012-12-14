var map;
var markersArray = [];
var estateid = new Object();
var marker;
var makemarker;
var setmarker;
var setmarkerImage = "../static/cn/images/beachflag.png";

var infowindow;
var windows = new Array();
var geocoder = new google.maps.Geocoder();

var hseMarker;
var setlat, setlng;
function initialize() {
    var latlng = new google.maps.LatLng(22.393253705304865, 114.1191100371094);
    var myOptions = {
        zoom: 6,
        center: latlng,
        mapTypeControl: false,
        mapTypeControlOptions: { style: google.maps.MapTypeControlStyle.DROPDOWN_MENU },
        navigationControl: true,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        cursor: 'pointer'
    };
    map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);

    google.maps.event.addListener(map, 'click', function(event) {
        PleaceMarker(event.latLng);
    });

    if (setlat != null && setlng != null) {
        var setlatlng = new google.maps.LatLng(setlat, setlng);
        PleaceMarker(setlatlng, false);
        map.setCenter(setlatlng);
    }
    //setmarker = new google.maps.Marker();
}
google.maps.event.addDomListener(window, 'load', initialize);

function PleaceMarker(location, updateAddress) {
    var newlatlng = new google.maps.LatLng(location);
    if (setmarker == null) {
        setmarker = new google.maps.Marker({
            position: location,
            map: map,
            title: "set the place!",
            draggable: true,
            //icon: setmarkerImage,
            cursor: 'pointer'
        })

    }
    setmarker.setCursor("pointer");
    setmarker.setPosition(location);
    if (updateAddress)
        geocodePosition(location);
    updateMarkerPosition(location);
    //map.setCenter(location);
    google.maps.event.addListener(setmarker, 'click', function(event) {
        ShowInfoWindow(setmarker, "set the place here!");

    });
    ShowInfoWindow(setmarker, "set the place here!<br> drag or rightclick the icon");
    // Add dragging event listeners.
    google.maps.event.addListener(setmarker, 'dragstart', function() {
        updateMarkerAddress('Dragging...');
    });

    google.maps.event.addListener(setmarker, 'drag', function() {
        updateMarkerStatus('Dragging...');
        updateMarkerPosition(setmarker.getPosition());
    });

    google.maps.event.addListener(setmarker, 'dragend', function() {
        updateMarkerStatus('Drag ended');
        geocodePosition(setmarker.getPosition());
    });
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

function updateMarkerStatus(str) {
    //document.getElementById('markerStatus').innerHTML = str;

}

function updateMarkerPosition(latLng) {
    if (document.getElementById('lat'))
        document.getElementById('lat').value = latLng.lat();
    if (document.getElementById('lng'))
        document.getElementById('lng').value = latLng.lng();

}

function updateMarkerAddress(str) {
    document.getElementById('address').value = str;
}

function addMarker(location) {
    marker = new google.maps.Marker({
        position: location,
        map: map
    });
    markersArray.push(marker);
}

// Removes the overlays from the map, but keeps them in the array
function clearOverlays() {
    if (markersArray) {
        for (i in markersArray) {
            markersArray[i].setMap(null);
        }
    }
}

// Shows any overlays currently in the array
function showOverlays() {
    if (markersArray) {
        for (i in markersArray) {
            markersArray[i].setMap(map);
        }
    }
}

// Deletes all markers in the array by removing references to them
function deleteOverlays() {
    if (markersArray) {
        for (i in markersArray) {
            markersArray[i].setMap(null);
        }
        markersArray.length = 0;
    }
}
function ShowInfoWindow(marker, content) {
    if (infowindow == null) {
        infowindow = new google.maps.InfoWindow(
              { content: content,
                  size: new google.maps.Size(500, 500)
              });
    }
    infowindow.open(map, marker);
}
function SearchControl(controlDiv, map) {

    // Set CSS styles for the DIV containing the control
    // Setting padding to 5 px will offset the control
    // from the edge of the map
    controlDiv.style.padding = '5px';

    // Set CSS for the control border
    var controlUI = document.createElement('DIV');
    controlUI.style.cssText = 'color:red;border:0px solid green;cursor:pointer';
    //controlUI.innerHTML = "<input type='text' id='search' /><input type='button' value='search'/>";

    var TextCtl = document.createElement("input");
    TextCtl.type = "text";
    TextCtl.style.cssText = 'border:1px solid #346EA7;height:16px;width:120px;';
    TextCtl.id = "search";
    controlUI.appendChild(TextCtl);

    var ButtonCtl = document.createElement("input");
    ButtonCtl.type = "button";
    ButtonCtl.id = "btnSearch";
    ButtonCtl.style.cssText = 'border:1px solid #346EA7;cursor:pointer;height:20px;width:50px;';
    ButtonCtl.value = "search";

    controlUI.appendChild(ButtonCtl);

    controlDiv.appendChild(controlUI);

    google.maps.event.addDomListener(ButtonCtl, 'click', function(ev) {
        MapSearch(TextCtl.value);
    });
}
function CopyRightControl(controlDiv, map) {
    controlDiv.style.padding = '4px';
    var controlUI = document.createElement('DIV');
    controlUI.style.cssText = ' border:0px solid green;cursor:pointer;font-size:13px;color:#666;';
    controlUI.innerHTML = "copyright &copy GoSeeHome";
    controlDiv.appendChild(controlUI);
}
function MapSearch(address) {
    if (address == "")
        return;
    if (geocoder) {
        geocoder.geocode({ 'address': address }, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                map.setCenter(results[0].geometry.location);
                if (makemarker == null) {
                    makemarker = new google.maps.Marker({
                        map: map,
                        position: results[0].geometry.location
                    });
                    map.setZoom(12);
                }
                else {
                    makemarker.setPosition(results[0].geometry.location);
                }
            } else {
                alert("Can't find the place: " + address + "");
            }
        });
    }
}

function setMarker(lat, lng) {
    var latlng = new google.maps.LatLng(lat, lng);
    map.setCenter(latlng);
    hseMarker = new google.maps.Marker({
        position: latlng,
        map: map,
        title: "Select the place!",
        cursor: 'pointer'
    })

}
 