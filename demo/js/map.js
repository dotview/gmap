; (function (window) {
    var map, infoBubble, oCluster, markers = [],
        dataUrl = window.dataUrl || "js/pins.json",// the url to get json data from server
        pinImage = window.pinImage || 'images/pin.png',// the image url of pin
        multiplePinImage = window.multiplePinImage || '/images/quyu.gif';// theimage url of multiple pins on the same location

    function init() {
        var mapCenter = new google.maps.LatLng(18.185324, -63.086750);
        map = new google.maps.Map(document.getElementById('map'), {
            zoom: 12,
            center: mapCenter,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        });

        var marker = new google.maps.Marker({
            map: map,
            position: new google.maps.LatLng(-35, 150),
            draggable: true
        });

        infoBubble = new InfoBubble({
            map: map,
            content: '<div class="phoneytext">Some label</div>',
            //position: new google.maps.LatLng(-35, 151),
            shadowStyle: 1,
            padding: 0,
            backgroundColor: 'rgb(57,57,57)',
            borderRadius: 4,
            arrowSize: 10,
            borderWidth: 1,
            borderColor: '#2c2c2c',
            disableAutoPan: false,
            //hideCloseButton: true,
            arrowPosition: 30,
            backgroundClassName: 'phoney',
            arrowStyle: 2
        });

        oCluster = new MarkerClusterer(
            map, [], {
                gridSize: 20,
                maxZoom: 15
            });
        oCluster.setCalculator(function (markers, numStyles) {
            var index = 0;
            var count = markers.length;
            var numberCount = 0;
            for (var i = 0; i < count; i++) {
                numberCount += markers[i].number;
            }
            var dv = numberCount;
            while (dv !== 0) {
                dv = parseInt(dv / 10, 10);
                index++;
            }

            index = Math.min(index, numStyles);
            return {
                text: numberCount,
                index: index
            };
        });
        google.maps.event.addListener(marker, 'click', function () {
            if (!infoBubble.isOpen()) {
                infoBubble.open(map, marker);
            }
        });
        getJsonData();
    }

    function getJsonData() {
        //get server data
        $.ajax({
            type: "GET",
            url: dataUrl,
            cache: true,
            dataType: "json",
            success: function (d) {
                showMarkersOnMaps(d.markers);
            },
            error: function (d) {
                alert('search error');
            }
        });
    }
    var showMarkersOnMaps = function (poi_array) {
        for (var i = 0; i < poi_array.length; i++) {
            var poi = poi_array[i];
            var marker = get_markers_index(poi.lat, poi.lng);

            var title = poi.title != "" ? poi.title : poi.id
            if (marker != null) {
                marker.setIcon(new google.maps.MarkerImage(multiplePinImage));
                marker.number = marker.number + 1;
                marker.setTitle(marker.getTitle() + "<br>" + title);
            } else {
                var mkr = createMarker(
                    new google.maps.LatLng(poi.lat, poi.lng),
                    poi.id, title
                );
                markers.push(mkr);
            }
        }
        oCluster.addMarkers(markers);
    }
    function get_markers_index(lat, lng) {
        var point = new google.maps.LatLng(lat, lng);
        for (var i = 0; i < markers.length; i++) {
            if (markers[i].getPosition().equals(point)) {
                return markers[i];
            }
        }
        return null;
    }
    var createMarker = function (point, id, title) {

        var marker = new google.maps.Marker({
            position: point,
            title: title,
            icon: new google.maps.MarkerImage(pinImage)
        });

        marker.number = 1;
        marker.id = id;

        google.maps.event.addListener(marker, 'click', function () {
            infoBubble.setContent('<div class="phoneytext">' + this.title + '</div>');
            infoBubble.open(map, marker);
        });

        return marker;
    };
    google.maps.event.addDomListener(window, 'load', init);
})(window)