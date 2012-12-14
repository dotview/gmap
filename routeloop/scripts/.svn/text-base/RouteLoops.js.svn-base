var rendererOptions = {
    draggable: true
};
var directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);
var directionsService = new google.maps.DirectionsService();
var map;
var geocoder;
var center;
var travelMode,
travelDirection,
travelHeading;
var markerArray = [];
var markerPosition = [];
var markerLabel = [];
var markerTime = [];
var pitchMarker;
var showOutput = false;
var initialLocation;
var browserSupportFlag = new Boolean();
var baseSet = new Boolean();
var once = 0;
var CookiesChecked = false;
var Country;
var maintainPoints = new Boolean();
var instructionsPopped = true;
var iPhonePopped = true;
var noResult = 0;
var scaleFactor = 0.80;
var scaleCount = 0;
var tooLong = 0;
var tooShort = 0;
var currentRouteData = [];
var spacedRouteData = [];
var useThis = spacedRouteData;
var BaseLocation = new google.maps.LatLng(42, -71);
var W3CLocation;
var rlPoints = new Array();
var rlPointsNew = new Array();
var uBase;
var urlPoints = new Array();
var utMode;
var ulen;
var uuS;
var parsedUrl = false;
var haveGoodUrl = false;
var haveOldUrl = new Boolean();
var haveEmbedded = new Boolean();
var oldUrlLng,
oldUrlLat;
var oldUrlLen;
var oldUrlRnd;
var OldUrlAllow;
var numSponsors;
var sponsorList = [];
var sponsorMarkers = [];
var showedSponsors = false;
var sponsorOn = [];
var numMM;
var mileMarkers = [];
var totalDistanceInCurrentUnits;
var RlUrl;
var RLroutes = [];
var myText;
var edges = [];
var edgenodes = [];
var RlRequest = new Boolean();
var previousBaseLocation = new google.maps.LatLng(42, -71);
var previousViaWaypoints = [];
var lastBaseLocation = new google.maps.LatLng(42, -71);
var lastViaWaypoints = [];
var changesFromLast = 0;
var tcxSpeed;
var allowFerries = false;

var elevDist = [];
var pasteWindow;
var pointArray = [];
var importedPolyline = [];
var DoClean = true;
var calcCount = 0;
var circleArray = [];
var circleAsked = [];
var wayFlags = [];
var browserSupportFlag = new Boolean();
var gotW3Clocation = new Boolean();
var countW3C = 0;
var ePlot = false;
var rtTraffic = false;
var showingMarkers = false;
var eRating = true;
var Language = new String();
function initialize() {
    
    geocoder = new google.maps.Geocoder();
    if (once == 0)
    {
        baseSet = false;
        once++;
        maintainPoints = false;
        var currentTime = new Date();
        var year = currentTime.getFullYear();
        
        totalDistanceInCurrentUnits = 0;
        var currentURL = location.href;
        var useCookies = true;
        if (parseUrl(currentURL)) useCookies = false;
        if (checkCookie && !CookiesChecked && useCookies)
        {
            var CookieAddress = readCookie("address");
            if (CookieAddress != null)
            {
                document.getElementById("address").value = CookieAddress;
                $("#address").removeClass("watermark");
                codeAddress();
            }
            var CookieLength = readCookie("length");
            if (CookieLength != null) document.getElementById("length").value = CookieLength;
            var CookieTM = readCookie("TM");
            if (CookieAddress != null) document.getElementById("travelMode").value = CookieTM;
            var CookieTD = readCookie("TD");
            if (CookieAddress != null) document.getElementById("travelDirection").value = CookieTD;
            var CookieUS = readCookie("US");
            if (CookieAddress != null) document.getElementById("unitSystem").value = CookieUS;
            var CookieClean = readCookie("Clean");
            if (CookieAddress != null)
            {
                if (CookieClean == "Turn AutoClean On") toggleAutoClean();
            }
            CookiesChecked = true;
        }
        if (document.getElementById("unitSystem").value == 0)
        {
            document.getElementById("total_1").innerHTML = "0 miles";
            document.getElementById("inputUnits").innerHTML = "miles";
            
             
        }
        else
        {
            document.getElementById("total_1").innerHTML = "0 kilometers";
            document.getElementById("inputUnits").innerHTML = "kilometers";
            
            
        }
    }

    if (!parsedUrl)
    {
        haveOldUrl = false;
        haveEmbedded = false;
        var currentURL = location.href;
        if (parseUrl(currentURL))
        {
            document.getElementById("address").value = uBase.toString();
            baseSet = false;
            parsedUrl = true;
            haveGoodUrl = true;
            BaseLocation = new google.maps.LatLng(uBase.lat(), uBase.lng());
            geocoder.geocode({
                'latLng': BaseLocation
            },
            function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    var list = results[0].address_components.length;
                    for (var i = 0; i < list; i++)
                    {
                        if (results[0].address_components[i].types == "country,political") Country = results[0].address_components[i].long_name;
                    }
                } else {
                    alert("Reverse Geocode was not successful for the following reason: " + status);
                }
            });
            baseSet = true;
            for (var i = 0; i < urlPoints.length; i++) rlPoints[i] = new google.maps.LatLng(urlPoints[i].lat(), urlPoints[i].lng());
            travelMode = utM;
            document.getElementById("travelMode").value = utM;
            if (uuS == 0)
            document.getElementById("length").value = ulen;
            else if (uuS == 1)
            document.getElementById("length").value = (ulen * 1000 * 100 / 2.54 / 12 / 5280).toFixed(2);
            maintainPoints = true;
        }
        else
        {
            parsedUrl = true;
            if (haveOldUrl)
            {
                BaseLocation = new google.maps.LatLng(oldUrlLat, oldUrlLng);
                geocoder.geocode({
                    'latLng': BaseLocation
                },
                function(results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        var list = results[0].address_components.length;
                        for (var i = 0; i < list; i++)
                        {
                            if (results[0].address_components[i].types == "country,political") Country = results[0].address_components[i].long_name;
                        }
                    } else {
                        alert("Reverse Geocode was not successful for the following reason: " + status);
                    }
                });
                baseSet = true;
            }
            if (haveEmbedded)
            {
                parsedUrl = true;
                setTimeout('initialize()', 500);
            }
        }
    }
    var length = document.getElementById("length").value;
    if (document.getElementById("unitSystem").value == 0)
    {
        length = length * 5280 * 12 * 2.54 / 100;
        //tcxSpeed = document.getElementById("tcxSpeed").value * (5280 * 12 * 2.54 / 100) / (60 * 60);
    }
    else
    {
        length = length * 1000;
       // tcxSpeed = document.getElementById("tcxSpeed").value * (1000) / (60 * 60);
    }
    if (totalDistanceInCurrentUnits == 0)
    {
        scaleFactor = 0.80;
        scaleCount++;
        tooLong = 0;
        tooShort = 0;
    }
    else if (totalDistanceInCurrentUnits != 0 && scaleCount == 0)
    {
        scaleCount++;
        tooLong = 0;
        tooShort = 0;
    }
    else if (totalDistanceInCurrentUnits != 0 && scaleCount != 0)
    {
        var lWanted = document.getElementById("length").value;
        if (totalDistanceInCurrentUnits < lWanted * 0.9)
        {
            tooLong = 0;
            tooShort++;
        }
        else if (totalDistanceInCurrentUnits > lWanted * 1.1)
        {
            tooShort = 0;
            tooLong++;
        }
        else
        {
            tooLong = 0;
            tooShort = 0;
        }
        if (tooShort > 2)
        {
            scaleFactor += 0.02;
            tooShort = 0;
        }
        if (tooLong > 2)
        {
            scaleFactor -= 0.02;
            tooLong = 0;
        }
        if (scaleFactor < 0.7) scaleFactor = 0.7;
        if (scaleFactor > 1.3) scaleFactor = 1.3;
    }
    length *= scaleFactor;
    travelMode = document.getElementById("travelMode").value;
    travelDirection = document.getElementById("travelDirection").value;
    travelHeading = document.getElementById("travelHeading").value;
    initialLocation = BaseLocation;
    var myOptions = {
        zoom: 2,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        center: initialLocation,
        disableDoubleClickZoom: true
    };
    map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
    directionsDisplay.setMap(map);
    directionsDisplay.setPanel(document.getElementById("directionsPanel"));
    trafficLayer = new google.maps.TrafficLayer();
    if (navigator.geolocation && countW3C == 0) {
        countW3C++;
        browserSupportFlag = true;
        navigator.geolocation.getCurrentPosition(function(position) {
            W3CLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            gotW3Clocation = true;
            var infowindow = new google.maps.InfoWindow();
            contentString = "You are here.<br>Double click on map to set this location as your starting point.";
            infowindow.setOptions({
                maxWidth: 300
            });
            infowindow.setContent(contentString);
            infowindow.setPosition(W3CLocation);
            infowindow.open(map);
            if (!baseSet)
            {
                BaseLocation = W3CLocation;
                map.setCenter(BaseLocation);
                map.setZoom(13);
            }
        },
        function() {
            BaseLocation = new google.maps.LatLng(42, -71);
            gotW3Clocation = false;
        },
        {
            maximumAge: 1000
        });
    }
    stepDisplay = new google.maps.InfoWindow();
    if (baseSet)
    {
        if (!maintainPoints)
        {
            importedPolyline.length = 0;
            var pickOne = Math.floor(3 * Math.random());
            if (haveOldUrl) pickOne = 0;
            if (pickOne == 0)
            {
                
                RlRequest = false;
                RLroutes = new Array();
                launchRequest();
                while (!RlRequest)
                {
                    alert("Request sent to RouteLoops engine");
                }
                if (RLroutes[0].steps.length > 0)
                {
                    getRlWaypoints(4);
                }
            }
            if (pickOne != 0 || (pickOne == 0 && RLroutes[0].steps.length <= 0))
            {
                var pickTwo = Math.floor(2 * Math.random());
                if (pickTwo == 0)
                {
                    circleRoute(length);
                }
                if (pickTwo == 1)
                {
                    rectangleRoute(length);
                }
            }
        }
        setTimeout('calcRoute()', 500);
        maintainPoints = false;
    }
    if (!showOutput)
    {
        //document.getElementById("output").style.visibility = "hidden";
        document.getElementById("directionsPanel").style.visibility = "hidden";
    }
    google.maps.event.addListener(directionsDisplay, 'directions_changed', 
    function() {
        checkNewVsStored();
        
        computeTotalDistance(directionsDisplay.directions);
        
        flagPoints();
        storeRouteData();
    });
    google.maps.event.addListener(map, "dblclick", 
    function(mEvent) {
        BaseLocation = mEvent.latLng;
        placeMarker(BaseLocation, 'Clicked Base');
        baseSet = true;
        geocoder.geocode({
            'latLng': BaseLocation
        },
        function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                var list = results[0].address_components.length;
                for (var i = 0; i < list; i++)
                {
                    if (results[0].address_components[i].types == "country,political") Country = results[0].address_components[i].long_name;
                }
            } else {
                alert("Reverse Geocode was not successful for the following reason: " + status);
            }
        });
        setTimeout('initialize()', 1000);
    });
    google.maps.event.addListener(map, "rightclick", 
    function(mEvent) {
        var close = 0;
        var test = 0;
        var kill = 0;
        close = LatLngDist(mEvent.latLng.lat(), mEvent.latLng.lng(), directionsDisplay.directions.routes[0].legs[0].via_waypoint[0].location.lat(), directionsDisplay.directions.routes[0].legs[0].via_waypoint[0].location.lng());
        for (var i = 1; i < directionsDisplay.directions.routes[0].legs[0].via_waypoint.length; i++)
        {
            test = LatLngDist(mEvent.latLng.lat(), mEvent.latLng.lng(), directionsDisplay.directions.routes[0].legs[0].via_waypoint[i].location.lat(), directionsDisplay.directions.routes[0].legs[0].via_waypoint[i].location.lng());
            if (test < close)
            {
                close = test;
                kill = i;
            }
        }
        var answer = confirm("The waypoint to be removed is at " + directionsDisplay.directions.routes[0].legs[0].via_waypoint[kill].location.toString());
        if (answer)
        {
            directionsDisplay.directions.routes[0].legs[0].via_waypoint.splice(kill, 1);
            rlPoints = new Array();
            for (var i = 0; i < directionsDisplay.directions.routes[0].legs[0].via_waypoint.length; i++)
            {
                rlPoints[i] = directionsDisplay.directions.routes[0].legs[0].via_waypoint[i].location;
            }
            calcRoute();
        }
    });
    if (importedPolyline.length > 0)
    {
        var chunk = Math.floor(importedPolyline.length / 4);
        var iP1 = [];
        iP1.length = 0;
        for (var i = 0 * chunk; i < 1 * chunk; i++) iP1.push(importedPolyline[i]);
        var iP2 = [];
        iP2.length = 0;
        for (var i = 1 * chunk; i < 2 * chunk; i++) iP2.push(importedPolyline[i]);
        var iP3 = [];
        iP3.length = 0;
        for (var i = 2 * chunk; i < 3 * chunk; i++) iP3.push(importedPolyline[i]);
        var iP4 = [];
        iP4.length = 0;
        for (var i = 3 * chunk; i < importedPolyline.length; i++) iP4.push(importedPolyline[i]);
        importedTrack1 = new google.maps.Polyline({
            strokeColor: "#FF0000",
            strokeOpacity: 0.5,
            strokeWeight: 10,
            path: iP1
        });
        importedTrack1.setMap(map);
        importedTrack2 = new google.maps.Polyline({
            strokeColor: "#FFAD00",
            strokeOpacity: 0.5,
            strokeWeight: 10,
            path: iP2
        });
        importedTrack2.setMap(map);
        importedTrack3 = new google.maps.Polyline({
            strokeColor: "#06FF00",
            strokeOpacity: 0.5,
            strokeWeight: 10,
            path: iP3
        });
        importedTrack3.setMap(map);
        importedTrack4 = new google.maps.Polyline({
            strokeColor: "#B400FF",
            strokeOpacity: 0.5,
            strokeWeight: 10,
            path: iP4
        });
        importedTrack4.setMap(map);
    }
}
function codeAddress() {
    var address = document.getElementById("address").value;
    geocoder.geocode({
        'address': address
    },
    function(results, status) {
        if (status == google.maps.GeocoderStatus.OK)
        {
            BaseLocation = results[0].geometry.location;
            placeMarker(BaseLocation, 'Base');
            if (map.getZoom() == 2) map.setZoom(11);
            baseSet = true;
            showedSponsors = false;
            //handleSponsors();
            var list = results[0].address_components.length;
            for (var i = 0; i < list; i++)
            {
                if (results[0].address_components[i].types == "country,political") Country = results[0].address_components[i].long_name;
            }
            if (Language == "JP")
            document.getElementById("GoButton").value = "この距離のルートを探す";
            else if (Language == "FR")
            document.getElementById("GoButton").value = "Créez un circuit de cette distance";
            else
            document.getElementById("GoButton").value = "Create a Route of this Length";
        }
        else
        {
            alert("Geocode returned: " + status + "\n This may only be so much gobbledygook. \n Please make sure you have an address in the address field.");
        }
    });
}
function calcRoute() {
    calcCount++;
    var storage;
    storage = "Base=" + BaseLocation.lat() + ":" + BaseLocation.lng();
    storage = storage + "&tM=" + travelMode;
    storage = storage + "&len=" + document.getElementById("length").value;
    storage = storage + "&unitS=" + document.getElementById("unitSystem").value;
    storage = storage + "&address=" + document.getElementById("address").value;
    storage = storage + "&function=calcRoute";
    //$.post("write_data.php?" + storage);
    if (document.getElementById("unitSystem").value == 0)
    var units = google.maps.DirectionsUnitSystem.IMPERIAL;
    else if (document.getElementById("unitSystem").value == 1)
    var units = google.maps.DirectionsUnitSystem.METRIC;
    var wpts = [];
    for (var i = 0; i < rlPoints.length; i++)
    {
        wpts.push({
            location: rlPoints[i],
            stopover: false
        });
    }
    if (haveGoodUrl && calcCount == 1)
    {}
    else
    {
        if (Country == "United States" || Country == "Canada")
        {}
        else
        {
            if (document.getElementById("travelMode").value == 1)
            {
                alert("Google Maps Bicycling Mode is not available in " + Country + ", or anywhere outside the US.\nRouteLoops is resetting the Travel Mode to Car/Motorcyle.\nYou may also choose Walk/Run if you would prefer.");
                document.getElementById("travelMode").value = 0;
                travelMode = 0;
            }
        }
    }
    if (travelMode == 0)
    {
        var request = {
            origin: BaseLocation,
            destination: BaseLocation,
            waypoints: wpts,
            travelMode: google.maps.DirectionsTravelMode.DRIVING,
            avoidHighways: false,
            unitSystem: units
        };
    }
    else if (travelMode == 1)
    {
        var request = {
            origin: BaseLocation,
            destination: BaseLocation,
            waypoints: wpts,
            travelMode: google.maps.DirectionsTravelMode.BICYCLING,
            avoidHighways: true,
            unitSystem: units
        };
    }
    else if (travelMode == 2)
    {
        var request = {
            origin: BaseLocation,
            destination: BaseLocation,
            waypoints: wpts,
            travelMode: google.maps.DirectionsTravelMode.WALKING,
            avoidHighways: true,
            unitSystem: units
        };
    }
    directionsService.route(request, 
    function(response, status) {
        if (status == google.maps.DirectionsStatus.OK)
        {
            var rf = compareToPlan(response);
            if (!rf) initialize();
            else
            {
                noResult = 0;
                directionsDisplay.setDirections(response);
                showSteps(response);
                document.getElementById("directionsPanel").style.visibility = "hidden";
                document.getElementById("address").value = response.routes[0].legs[0].start_address;

                var cleanIt = true;
                if (!DoClean) cleanIt = false;
                if (importedPolyline.length != 0) cleanIt = false;
                if (haveGoodUrl && calcCount == 1) cleanIt = false;
                if (cleanIt) cleanTails(response);
                flagPoints();
                storeRouteData();
                //getElevations();

                document.getElementById("GoButton").value = "Create a Different Route\nof the Same Length";
            }
        }
        else
        {
            noResult++;
            if (noResult <= 5)
            initialize();
            else
            {
                alert(noResult + ". The Directions Service did not return OK, for some reason.  Returned: " + status + ". Please try again.");
                noResult = 0;
            }
        }
    });
}
function cr2() {
    var distIN,
    distOUT;
    distIN = directionsDisplay.directions.routes[0].legs[0].distance.value;
    if (document.getElementById("unitSystem").value == 0)
    var units = google.maps.DirectionsUnitSystem.IMPERIAL;
    else if (document.getElementById("unitSystem").value == 1)
    var units = google.maps.DirectionsUnitSystem.METRIC;
    var wpts = [];
    for (var i = 0; i < rlPointsNew.length; i++)
    {
        wpts.push({
            location: rlPointsNew[i],
            stopover: false
        });
    }
    if (travelMode == 0)
    var mode = google.maps.DirectionsTravelMode.DRIVING;
    else if (travelMode == 1)
    var mode = google.maps.DirectionsTravelMode.BICYCLING;
    else if (travelMode == 2)
    var mode = google.maps.DirectionsTravelMode.WALKING;
    var request = {
        origin: BaseLocation,
        destination: BaseLocation,
        waypoints: wpts,
        travelMode: mode,
        avoidHighways: false,
        unitSystem: units
    };
    directionsService.route(request, 
    function(response, status) {
        if (status == google.maps.DirectionsStatus.OK)
        {
            noResult = 0;
            directionsDisplay.setDirections(response);
            showSteps(response);
            rlPoints.length = 0;
            for (var i = 0; i < rlPointsNew.length; i++) rlPoints.push(rlPointsNew[i]);
            
            document.getElementById("directionsPanel").style.visibility = "hidden";
            document.getElementById("address").value = response.routes[0].legs[0].start_address;

            distOUT = directionsDisplay.directions.routes[0].legs[0].distance.value;
            if (distOUT / distIN < 1)
            {
                cleanTails(response);
                flagPoints();
            }
        }
        else
        {
            noResult++;
            if (noResult <= 5)
            initialize();
            else
            {
                alert(noResult + ".  The Directions Service did not return OK, for some reason.  Returned: " + status + ". Please try again.");
                noResult = 0;
            }
        }
    });
}
function computeTotalDistance(result) {
    var total = 0;
    var timeTot;
    var timeH = 0;
    var timeM = 0;
    var timeText;
    var speed = 12;//parseFloat(document.getElementById("tcxSpeed").value);
    var myroute = result.routes[0];
    for (i = 0; i < myroute.legs.length; i++) {
        total += myroute.legs[i].distance.value;
    }
    if (document.getElementById("unitSystem").value == 0)
    {
        total = total * 100 / 2.54 / 12 / 5280;
        var tP = Math.log(total) / Math.log(10);
        tP = Math.floor(tP);
        tP += 3;
        document.getElementById("total_1").innerHTML = total.toPrecision(tP) + " miles";
        totalDistanceInCurrentUnits = total;
    }
    else
    {
        total = total / 1000;
        var tP = Math.log(total) / Math.log(10);
        tP = Math.floor(tP);
        tP += 3;
        document.getElementById("total_1").innerHTML = total.toPrecision(tP) + " kilometers";
        totalDistanceInCurrentUnits = total;
    }
    timeTot = total / speed * 60 * 60;
    timeH = hours(timeTot);
    timeM = minutes(timeTot);
    if (timeH > 0) timeText = timeH + " hours ";
    else timeText = "";
    if (timeM > 0) timeText += timeM + " min ";
    else timeText += "";
    document.getElementById("routeTime").innerHTML = timeText;
    showSteps(result);
}
function changeSpeed()
 {
    var total = totalDistanceInCurrentUnits;
    var timeTot;
    var timeH = 0;
    var timeM = 0;
    var timeText;
    var speed = parseFloat(document.getElementById("tcxSpeed").value);
    timeTot = total / speed * 60 * 60;
    timeH = hours(timeTot);
    timeM = minutes(timeTot);
    if (timeH > 0) timeText = timeH + " hours ";
    else timeText = "";
    if (timeM > 0) timeText += timeM + " min ";
    else timeText += "";
    document.getElementById("routeTime").innerHTML = timeText;
}
function circleRoute(length)
 {
    var radius = length / 2 / Math.PI;
    var circlePoints = 4;
    var deg = [];
    if (travelHeading == 0)
    var direction = Math.random() * 2 * Math.PI;
    else if (travelHeading == 1)
    var direction = Math.random() * Math.PI / 4 + 3 * Math.PI / 8;
    else if (travelHeading == 2)
    var direction = Math.random() * Math.PI / 4 + 1 * Math.PI / 8;
    else if (travelHeading == 3)
    var direction = Math.random() * Math.PI / 4 - Math.PI / 8;
    else if (travelHeading == 4)
    var direction = Math.random() * Math.PI / 4 + 13 * Math.PI / 8;
    else if (travelHeading == 5)
    var direction = Math.random() * Math.PI / 4 + 11 * Math.PI / 8;
    else if (travelHeading == 6)
    var direction = Math.random() * Math.PI / 4 + 9 * Math.PI / 8;
    else if (travelHeading == 7)
    var direction = Math.random() * Math.PI / 4 + 7 * Math.PI / 8;
    else if (travelHeading == 8)
    var direction = Math.random() * Math.PI / 4 + 5 * Math.PI / 8;
    var dx = radius * Math.cos(direction);
    var dy = radius * Math.sin(direction);
    var delta_lat = dy / 110540;
    var delta_lng = dx / (111320 * Math.cos(BaseLocation.lat() * Math.PI / 180));
    center = new google.maps.LatLng(BaseLocation.lat() + delta_lat, BaseLocation.lng() + delta_lng);
    deg[0] = direction + Math.PI;
    if (travelDirection == 0)
    var sign = -1;
    else
    var sign = +1;
    for (var i = 1; i < circlePoints + 1; i++)
    {
        deg[i] = deg[i - 1] + sign * 2 * Math.PI / (circlePoints + 1);
        dx = radius * Math.cos(deg[i]);
        dy = radius * Math.sin(deg[i]);
        delta_lat = dy / 110540;
        delta_lng = dx / (111320 * Math.cos(center.lat() * Math.PI / 180));
        rlPoints[i - 1] = new google.maps.LatLng(center.lat() + delta_lat, center.lng() + delta_lng);
    }
}
function rectangleRoute(length)
 {
    var direction = 0;
    var angle = 0;
    rlPoints.length = 0;
    var maxRatio = 5;
    var minRatio = 1. / maxRatio;
    var deltaRatio = maxRatio - minRatio;
    var ratio = Math.random() * deltaRatio + minRatio;
    var width = length / (2 * ratio + 2);
    var height = width * ratio;
    var diagonal = Math.sqrt(width * width + height * height);
    var theta = Math.acos(height / diagonal);
    if (travelHeading == 0)
    var direction = Math.random() * 2 * Math.PI;
    else if (travelHeading == 1)
    var direction = Math.random() * Math.PI / 4 + 3 * Math.PI / 8;
    else if (travelHeading == 2)
    var direction = Math.random() * Math.PI / 4 + 1 * Math.PI / 8;
    else if (travelHeading == 3)
    var direction = Math.random() * Math.PI / 4 - Math.PI / 8;
    else if (travelHeading == 4)
    var direction = Math.random() * Math.PI / 4 + 13 * Math.PI / 8;
    else if (travelHeading == 5)
    var direction = Math.random() * Math.PI / 4 + 11 * Math.PI / 8;
    else if (travelHeading == 6)
    var direction = Math.random() * Math.PI / 4 + 9 * Math.PI / 8;
    else if (travelHeading == 7)
    var direction = Math.random() * Math.PI / 4 + 7 * Math.PI / 8;
    else if (travelHeading == 8)
    var direction = Math.random() * Math.PI / 4 + 5 * Math.PI / 8;
    if (travelDirection == 0)
    var sign = -1;
    else
    var sign = +1;
    angle = 0 + direction;
    var dx = height * Math.cos(angle);
    var dy = height * Math.sin(angle);
    var delta_lat = dy / 110540;
    var delta_lng = dx / (111320 * Math.cos(BaseLocation.lat() * Math.PI / 180));
    rlPoints[0] = new google.maps.LatLng(BaseLocation.lat() + delta_lat, BaseLocation.lng() + delta_lng);
    angle = sign * theta + direction;
    var dx = diagonal * Math.cos(angle);
    var dy = diagonal * Math.sin(angle);
    var delta_lat = dy / 110540;
    var delta_lng = dx / (111320 * Math.cos(BaseLocation.lat() * Math.PI / 180));
    rlPoints[1] = new google.maps.LatLng(BaseLocation.lat() + delta_lat, BaseLocation.lng() + delta_lng);
    angle = sign * Math.PI / 2 + direction;
    var dx = width * Math.cos(angle);
    var dy = width * Math.sin(angle);
    var delta_lat = dy / 110540;
    var delta_lng = dx / (111320 * Math.cos(BaseLocation.lat() * Math.PI / 180));
    rlPoints[2] = new google.maps.LatLng(BaseLocation.lat() + delta_lat, BaseLocation.lng() + delta_lng);
}
function fig8Route(length)
 {
    var radius = length / 4 / Math.PI;
    var circlePoints = 3;
    var deg = [];
    var rlpCount;
    if (travelHeading == 0)
    var direction = Math.random() * 2 * Math.PI;
    else if (travelHeading == 1)
    var direction = Math.random() * Math.PI / 4 + 3 * Math.PI / 8;
    else if (travelHeading == 2)
    var direction = Math.random() * Math.PI / 4 + 1 * Math.PI / 8;
    else if (travelHeading == 3)
    var direction = Math.random() * Math.PI / 4 - Math.PI / 8;
    else if (travelHeading == 4)
    var direction = Math.random() * Math.PI / 4 + 13 * Math.PI / 8;
    else if (travelHeading == 5)
    var direction = Math.random() * Math.PI / 4 + 11 * Math.PI / 8;
    else if (travelHeading == 6)
    var direction = Math.random() * Math.PI / 4 + 9 * Math.PI / 8;
    else if (travelHeading == 7)
    var direction = Math.random() * Math.PI / 4 + 7 * Math.PI / 8;
    else if (travelHeading == 8)
    var direction = Math.random() * Math.PI / 4 + 5 * Math.PI / 8;
    var dx = radius * Math.cos(direction);
    var dy = radius * Math.sin(direction);
    var delta_lat = dy / 110540;
    var delta_lng = dx / (111320 * Math.cos(BaseLocation.lat() * Math.PI / 180));
    center = new google.maps.LatLng(BaseLocation.lat() + delta_lat, BaseLocation.lng() + delta_lng);
    deg[0] = direction + Math.PI;
    if (travelDirection == 0)
    var sign = -1;
    else
    var sign = +1;
    rlpCount = 0;
    for (var i = 1; i < circlePoints + 1; i++)
    {
        deg[i] = deg[i - 1] + sign * 2 * Math.PI / (circlePoints + 1);
        dx = radius * Math.cos(deg[i]);
        dy = radius * Math.sin(deg[i]);
        delta_lat = dy / 110540;
        delta_lng = dx / (111320 * Math.cos(center.lat() * Math.PI / 180));
        rlPoints[rlpCount] = new google.maps.LatLng(center.lat() + delta_lat, center.lng() + delta_lng);
        rlpCount++;
    }
    direction = direction + Math.PI;
    var dx = radius * Math.cos(direction);
    var dy = radius * Math.sin(direction);
    var delta_lat = dy / 110540;
    var delta_lng = dx / (111320 * Math.cos(BaseLocation.lat() * Math.PI / 180));
    center = new google.maps.LatLng(BaseLocation.lat() + delta_lat, BaseLocation.lng() + delta_lng);
    deg.length = 0;
    deg[0] = direction + Math.PI;
    if (travelDirection == 0)
    var sign = +1;
    else
    var sign = -1;
    for (var i = 1; i < circlePoints + 1; i++)
    {
        deg[i] = deg[i - 1] + sign * 2 * Math.PI / (circlePoints + 1);
        dx = radius * Math.cos(deg[i]);
        dy = radius * Math.sin(deg[i]);
        delta_lat = dy / 110540;
        delta_lng = dx / (111320 * Math.cos(center.lat() * Math.PI / 180));
        rlPoints[rlpCount] = new google.maps.LatLng(center.lat() + delta_lat, center.lng() + delta_lng);
        rlpCount++;
    }
}
function LatLngDist(lat1, lon1, lat2, lon2)
 {
    var R = 6371;
    var dLat = (lat2 - lat1) * Math.PI / 180;
    var dLon = (lon2 - lon1) * Math.PI / 180;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + 
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d;
}
function hours(secs) {
    return Math.floor(Math.max(secs, 0) / 3600.0);
}
function minutes(secs) {
    return Math.floor((Math.max(secs, 0) % 3600.0) / 60.0);
}
function seconds(secs) {
    return Math.round(Math.max(secs, 0) % 60.0);
}
function padZeros(theNumber, max) {
    var numStr = String(theNumber);
    while (numStr.length < max) {
        numStr = '0' + numStr;
    }
    return numStr;
}
function placeMarker(location, text) {
    var marker = new google.maps.Marker({
        position: location,
        map: map,
        title: text
    });
    map.setCenter(location);
}
function centerMap(lat, lng) {
    var center = new google.maps.LatLng(lat, lng);
    map.panTo(center);
}
function log(h) {
    document.getElementById("log").innerHTML += h + "<br />";
}
 
function showSteps(directionResult) {
    var myRoute = directionResult.routes[0].legs[0];
    for (var i = 0; i < markerArray.length; i++) {
        markerArray[i].setMap(null);
    }
    var offset = 150;
    var offset = 12;//document.getElementById("tcxAdvance").value;
    if (document.getElementById("unitSystem").value == 0)
    offset *= 12 * 2.54 / 100;
    var Time = myRoute.duration.value;
    var Dist = myRoute.distance.value;
    var Velocity = Dist / Time;
    var lastTime;
    markerLabel.length = 0;
    markerArray.length = 0;
    markerPosition.length = 0;
    for (var i = 0; i < myRoute.steps.length; i++)
    {
        latOffset = myRoute.steps[i].path[0].lat();
        lngOffset = myRoute.steps[i].path[0].lng();
        if (offset > 0 && i < myRoute.steps.length - 1)
        {
            var next = i + 1;
            var latActual = myRoute.steps[next].start_point.lat();
            var lngActual = myRoute.steps[next].start_point.lng();
            var previous = next - 1;
            if (myRoute.steps[previous].path.length == 2)
            {
                var j = 0;
                latOffset = myRoute.steps[previous].path[j].lat();
                lngOffset = myRoute.steps[previous].path[j].lng();
            }
            else
            {
                for (var j = 0; j < myRoute.steps[previous].path.length; j++)
                {
                    var latOffset = myRoute.steps[previous].path[j].lat();
                    var lngOffset = myRoute.steps[previous].path[j].lng();
                    var sep = LatLngDist(latActual, lngActual, latOffset, lngOffset) * 1000;
                    if (sep < offset)
                    {
                        if (j == myRoute.steps[previous].path.length - 1)
                        {
                            j = myRoute.steps[previous].path.length - 2;
                            latOffset = myRoute.steps[previous].path[j].lat();
                            lngOffset = myRoute.steps[previous].path[j].lng();
                            sep = LatLngDist(latActual, lngActual, latOffset, lngOffset) * 1000;
                        }
                        break;
                    }
                }
                if (j > 0)
                {
                    var XlatOffset = myRoute.steps[previous].path[j - 1].lat();
                    var XlngOffset = myRoute.steps[previous].path[j - 1].lng();
                    var Xsep = LatLngDist(latActual, lngActual, XlatOffset, XlngOffset) * 1000;
                    if (Math.abs(Xsep - offset) < Math.abs(sep - offset))
                    {
                        latOffset = XlatOffset;
                        lngOffset = XlngOffset;
                        j = j - 1;
                    }
                }
            }
            if (j != myRoute.steps[previous].path - 1)
            {
                var markTemp = new google.maps.LatLng(latOffset, lngOffset);
                markerPosition.push(markTemp);
                var marker = new google.maps.Marker({
                    position: markTemp,
                    map: map,
                    visible: false,
                    draggable: true
                });
                attachInstructionText(marker, myRoute.steps[next].instructions);
                markerLabel.push(myRoute.steps[next].instructions);
                markerArray.push(marker);
            }
            if (j < myRoute.steps[previous].path.length - 2 && myRoute.steps[previous].path.length > 3)
            {
                j = myRoute.steps[previous].path.length - 2;
                latOffset = myRoute.steps[previous].path[j].lat();
                lngOffset = myRoute.steps[previous].path[j].lng();
                markTemp = new google.maps.LatLng(latOffset, lngOffset);
                markerPosition.push(markTemp);
                var marker = new google.maps.Marker({
                    position: markTemp,
                    map: map,
                    visible: false,
                    draggable: true
                });
                attachInstructionText(marker, myRoute.steps[next].instructions);
                markerLabel.push(myRoute.steps[next].instructions);
                markerArray.push(marker);
            }
        }
    }

    var CookieAddress = document.getElementById("address").value;
    var CookieLength = document.getElementById("length").value;
    var CookieTM = document.getElementById("travelMode").value;
    var CookieTD = document.getElementById("travelDirection").value;
    var CookieUS = document.getElementById("unitSystem").value;
    
    createCookie("address", CookieAddress);
    createCookie("length", CookieLength);
    createCookie("TM", CookieTM);
    createCookie("TD", CookieTD);
    createCookie("US", CookieUS);
    
    buildDirections(directionResult);
    //handleSponsors();
    var bounds = new google.maps.LatLngBounds(directionsDisplay.directions.routes[0].bounds.getSouthWest(), directionsDisplay.directions.routes[0].bounds.getNorthEast());
    if (!showedSponsors)
    {
        showedSponsors = true;
        for (var i = 0; i < numSponsors; i++)
        {
            if (sponsorList[i].onMap)
            {
                var sponsorLatLng = new google.maps.LatLng(sponsorList[i].lat, sponsorList[i].lng);
                bounds.extend(sponsorLatLng)
            }
        }
        map.fitBounds(bounds);
    }
    else
    {}
}
function reverseOrNew()
 {
    if (rlPoints.length == 0)
    {
        once = 0;
        initialize();
    }
    else
    {
        for (var i = 0; i < directionsDisplay.directions.routes[0].legs[0].via_waypoint.length; i++)
        {
            rlPoints[i] = directionsDisplay.directions.routes[0].legs[0].via_waypoint[i].location;
        }
        rlPoints.reverse();
        calcRoute();
    }
}
function redrawOrNew()
 {
    if (rlPoints.length == 0)
    {
        once = 0;
        initialize();
    }
    else
    {
        for (var i = 0; i < directionsDisplay.directions.routes[0].legs[0].via_waypoint.length; i++)
        {
            rlPoints[i] = directionsDisplay.directions.routes[0].legs[0].via_waypoint[i].location;
        }
        maintainPoints = true;
        initialize();
        maintainPoints = false;
    }
}
function switchUnits()
 {
    if (rlPoints.length == 0)
    {
        once = 0;
        if (document.getElementById("unitSystem").value == 0)
        {
            var temp = document.getElementById("length").value * 1000 * 100 / 2.54 / 12 / 5280;
            document.getElementById("length").value = temp.toFixed(2);
            document.getElementById("tcxAdvance").value *= 100 / 2.54 / 12;
            temp = document.getElementById("tcxSpeed").value * 1000 * 100 / 2.54 / 12 / 5280;
            document.getElementById("tcxSpeed").value = temp.toFixed(2);
        }
        else
        {
            var temp = document.getElementById("length").value * 5280 * 12 * 2.54 / 100 / 1000;
            document.getElementById("length").value = temp.toFixed(2);
            document.getElementById("tcxAdvance").value *= 12 * 2.54 / 100;
            temp = document.getElementById("tcxSpeed").value * 5280 * 12 * 2.54 / 100 / 1000;
            document.getElementById("tcxSpeed").value = temp.toFixed(2);
        }
        initialize();
    }
    else
    {
        for (var i = 0; i < directionsDisplay.directions.routes[0].legs[0].via_waypoint.length; i++)
        {
            rlPoints[i] = directionsDisplay.directions.routes[0].legs[0].via_waypoint[i].location;
        }
        maintainPoints = true;
        initialize();
        maintainPoints = false;
        if (document.getElementById("unitSystem").value == 0)
        {
            document.getElementById("inputUnits").innerHTML = "miles";
            var temp = document.getElementById("length").value * 1000 * 100 / 2.54 / 12 / 5280;
            document.getElementById("length").value = temp.toFixed(2);
            document.getElementById("tcxUnits").innerHTML = "feet";
            document.getElementById("tcxAdvance").value *= 100 / 2.54 / 12;
            temp = document.getElementById("tcxSpeed").value * 1000 * 100 / 2.54 / 12 / 5280;
            document.getElementById("tcxSpeed").value = temp.toFixed(2);
            document.getElementById("tcxSpeedUnits").innerHTML = "mph";
        }
        else
        {
            document.getElementById("inputUnits").innerHTML = "kilometers";
            var temp = document.getElementById("length").value * 5280 * 12 * 2.54 / 100 / 1000;
            document.getElementById("length").value = temp.toFixed(2);
            document.getElementById("tcxUnits").innerHTML = "meters";
            document.getElementById("tcxAdvance").value *= 12 * 2.54 / 100;
            temp = document.getElementById("tcxSpeed").value * 5280 * 12 * 2.54 / 100 / 1000;
            document.getElementById("tcxSpeed").value = temp.toFixed(2);
            document.getElementById("tcxSpeedUnits").innerHTML = "kph";
        }
    }
}
function autoFit()
 {
    map.setCenter(directionsDisplay.directions.routes[0].bounds.getCenter());
    map.fitBounds(directionsDisplay.directions.routes[0].bounds);
}
 
function toggleMap()
 {
    if (document.getElementById("toggleMap").value == "Bigger Map")
    {
        document.getElementById("middle").style.height = "800px";
        document.getElementById("middle").style.width = "120%";
        document.getElementById("toggleMap").value = "Smaller Map";
        document.getElementById("mapsize").style.top = "262px";
        document.getElementById("mapsize").style.left = "57%";
        google.maps.event.trigger(map, 'resize');
    }
    else
    {
        document.getElementById("middle").style.height = "500px";
        document.getElementById("middle").style.width = "100%";
        document.getElementById("toggleMap").value = "Bigger Map";
        document.getElementById("mapsize").style.top = "233px";
        document.getElementById("mapsize").style.left = "46%";
        google.maps.event.trigger(map, 'resize');
    }
}
function drawElevationPlot()
 {
    var allPoints = [];
    elevator = new google.maps.ElevationService();
    chart = new google.visualization.ColumnChart(document.getElementById('elevation_chart'));
    var step = directionsDisplay.directions.routes[0].legs[0].steps.length;
    var countPoints = 0;
    for (var i = 0; i < step; i++)
    {
        var path = directionsDisplay.directions.routes[0].legs[0].steps[i].path.length;
        for (var j = 0; j < path; j++)
        {
            if (i > 0 && j == 0) continue;
            var Lat = directionsDisplay.directions.routes[0].legs[0].steps[i].path[j].lat();
            var Lng = directionsDisplay.directions.routes[0].legs[0].steps[i].path[j].lng();
            allPoints[countPoints] = new google.maps.LatLng(Lat, Lng);
            countPoints++;
        }
    }
    var thinnedArray = [];
    var pointLimit = 250;
    var ratio = pointLimit / allPoints.length;
    if (ratio > 1) ratio = 1;
    var track = 0;
    var last = -1;
    for (var i = 0; i < allPoints.length; i++)
    {
        track += ratio;
        if (Math.floor(track) > last)
        {
            thinnedArray.push(allPoints[i]);
            last = Math.floor(track);
        }
    }
    var pathRequest = {
        'path': thinnedArray,
        'samples': 256
    }
    elevator.getElevationAlongPath(pathRequest, plotElevation);
}
function plotElevation(results, status) {
    if (status == google.maps.ElevationStatus.OK) {
        elevations = results;
        var units;
        if (document.getElementById("unitSystem").value == 0) units = 0;
        else units = 1;
        elevDist.length = 0;
        var data = new google.visualization.DataTable();
        data.addColumn('string', 'Distance');
        data.addColumn('number', 'Elevation');
        for (var i = 0; i < results.length; i++) {
            var scaledDistance = (totalDistanceInCurrentUnits * i / results.length);
            elevDist.push(scaledDistance);
            data.addRow([scaledDistance.toFixed(1).toString(), elevations[i].elevation]);
        }
        document.getElementById('elevation_chart').style.display = 'block';
        document.getElementById('ecButton').style.display = 'block';
        if (units == 0) var tx = "Distance (mi)";
        else var tx = "Distance (km)";
        chart.draw(data, {
            width: 640,
            title: 'Move the cursor over the elevation plot to see the location on the route',
            height: 200,
            legend: 'none',
            titleY: 'Elevation (m)',
            titleX: tx
        });
        google.visualization.events.addListener(chart, 'onmouseover', myMouseOverHandler);
        google.visualization.events.addListener(chart, 'onmouseout', myMouseOutHandler);
    }
    else
    {
        alert("The Elevation Service did not return OK, for some reason.  Returned: " + status);
    }
}
function myClickHandler() {
    var selection = chart.getSelection();
    for (var i = 0; i < selection.length; i++) {
        var item = selection[i];
        var marker = new google.maps.Marker({
            position: elevations[item.row].location,
            map: map
        });
        if (document.getElementById("unitSystem").value == 0)
        var mText = "Elevation at distance " + elevDist[item.row].toFixed(1) + " miles is " + elevations[item.row].elevation.toFixed(1).toString() + " meters";
        else
        var mText = "Elevation at distance " + elevDist[item.row].toFixed(1) + " kilometers is " + elevations[item.row].elevation.toFixed(1).toString() + " meters";
        attachInstructionText(marker, mText);
    }
}
function myMouseOverHandler(mE)
 {
    if (document.getElementById("unitSystem").value == 0)
    {
        var Grade;
        if (mE.row > 0)
        {
            var x1 = elevDist[mE.row - 1];
            var x2 = elevDist[mE.row];
            var y1 = elevations[mE.row - 1].elevation;
            var y2 = elevations[mE.row].elevation;
            x1 *= 5280 * 12 * 2.54 / 100;
            x2 *= 5280 * 12 * 2.54 / 100;
            Grade = (y2 - y1) / (x2 - x1);
        }
        else Grade = 0;
        var mText = "Elevation at distance " + elevDist[mE.row].toFixed(1) + " miles is " + elevations[mE.row].elevation.toFixed(1).toString() + " meters" + "\n" + "Grade at this point is about " + (Grade * 100).toFixed(1) + "%";
    }
    else
    {
        var Grade;
        if (mE.row > 0)
        {
            var x1 = elevDist[mE.row - 1];
            var x2 = elevDist[mE.row];
            var y1 = elevations[mE.row - 1].elevation;
            var y2 = elevations[mE.row].elevation;
            x1 *= 1000;
            x2 *= 1000;
            Grade = (y2 - y1) / (x2 - x1);
        }
        else Grade = 0;
        var mText = "Elevation at distance " + elevDist[mE.row].toFixed(1) + " kilometers is " + elevations[mE.row].elevation.toFixed(1).toString() + " meters" + "\n" + "Grade at this point is about " + (Grade * 100).toFixed(1) + "%";
    }
    stepDisplay.setContent(mText);
    stepDisplay.setPosition(elevations[mE.row].location);
    stepDisplay.open(map);
    bikeMarker = new google.maps.Marker({
        position: elevations[mE.row].location,
        map: map,
        icon: 'images/OldBike2.png'
    });
}
function myMouseOutHandler(mE)
 {
    bikeMarker.setMap(null);
}
function showDirectionFlag(index)
 {
    var Text = directionsDisplay.directions.routes[0].legs[0].steps[index].instructions;
    var Location = directionsDisplay.directions.routes[0].legs[0].steps[index].start_location;
    stepDisplay.setContent(Text);
    stepDisplay.setPosition(Location);
    stepDisplay.open(map);
}
function placeMileMarkers()
 {
    var Dist;
    var LastDist;
    var WriteDist;
    if (!showingMarkers)
    {
        showingMarkers = true;
        if (Language == "JP")
        document.getElementById("toggleMileMarkers").value = "距離マーカーをオフにする";
        else if (Language == "FR")
        document.getElementById("toggleMileMarkers").value = "Désactiver les marqueurs de distance";
        else
        document.getElementById("toggleMileMarkers").value = "Turn distance markers off";
        for (var i = 0; i < mileMarkers.length; i++) {
            mileMarkers[i].setMap(null);
        }
        var numMM = Math.floor(totalDistanceInCurrentUnits);
        if (numMM >= 1) var next = 1;
        var step = directionsDisplay.directions.routes[0].legs[0].steps.length;
        for (var i = 0; i < step; i++)
        {
            var path = directionsDisplay.directions.routes[0].legs[0].steps[i].path.length;
            for (var j = 0; j < path; j++)
            {
                var Lat = directionsDisplay.directions.routes[0].legs[0].steps[i].path[j].lat();
                var Lng = directionsDisplay.directions.routes[0].legs[0].steps[i].path[j].lng();
                if (i == 0 && j == 0)
                {
                    Dist = 0;
                }
                else
                {
                    var pathlength = LatLngDist(Lat, Lng, Last.lat(), Last.lng()) * 1000;
                    if (document.getElementById("unitSystem").value == 0)
                    {
                        pathlength *= 100 / 2.54 / 12 / 5280;
                    }
                    else if (document.getElementById("unitSystem").value == 1)
                    {
                        pathlength /= 1000;
                    }
                    Dist += pathlength;
                }
                if (Dist >= next)
                {
                    if (Math.abs(LastDist - next) < Math.abs(Dist - next))
                    {
                        WriteLat = Last.lat();
                        WriteLng = Last.lng();
                        WriteDist = LastDist;
                    }
                    else
                    {
                        WriteLat = Lat;
                        WriteLng = Lng;
                        WriteDist = Dist;
                    }
                    var markerPosition = new google.maps.LatLng(WriteLat, WriteLng);
                    if (next <= 100)
                    {
                        var marker = new google.maps.Marker({
                            position: markerPosition,
                            map: map,
                            icon: 'images/icong' + next + '.png',
                            shadow: 'images/shadow.png'
                        });
                    }
                    else
                    {
                        var marker = new google.maps.Marker({
                            position: markerPosition,
                            map: map,
                            icon: 'images/icong.png',
                            shadow: 'images/shadow.png'
                        });
                    }
                    var flagText = new String();
                    if (document.getElementById("unitSystem").value == 0) flagText = next + " mile marker" + "  (" + WriteDist.toFixed(2) + " miles." + ")";
                    if (document.getElementById("unitSystem").value == 1) flagText = next + " kilometer marker" + "  (" + WriteDist.toFixed(2) + " km." + ")";
                    attachInstructionText(marker, flagText);
                    mileMarkers[next - 1] = marker;
                    next++;
                }
                var Last = new google.maps.LatLng(Lat, Lng);
                var LastDist = Dist;
            }
        }
    }
    else if (showingMarkers)
    {
        showingMarkers = false;
        if (Language == "JP")
        document.getElementById("toggleMileMarkers").value = "距離マーカーをオンにする";
        else if (Language == "FR")
        document.getElementById("toggleMileMarkers").value = "Activer les marqueurs de distance";
        else
        document.getElementById("toggleMileMarkers").value = "Turn distance markers on";
        for (var i = 0; i < mileMarkers.length; i++) {
            mileMarkers[i].setMap(null);
        }
    }
}
function pathPoint(lat, lng, time) {
    this.lat = lat;
    this.lng = lng;
    this.time = time;
}
function routeData(lat, lng, dist, height, pitch, peak, trough, instructions, write) {
    this.lat = lat;
    this.lng = lng;
    this.dist = dist;
    this.height = height;
    this.pitch = pitch;
    this.peak = peak;
    this.trough = trough;
    this.instructions = instructions;
    this.write = write;
}
function storeRouteData()
 {
    currentRouteData.length = 0;
    var step = directionsDisplay.directions.routes[0].legs[0].steps.length;
    for (var i = 0; i < step; i++)
    {
        var path = directionsDisplay.directions.routes[0].legs[0].steps[i].path.length;
        for (var j = 0; j < path; j++)
        {
            var txt = new String();
            if (j == 0)
            {
                txt = directionsDisplay.directions.routes[0].legs[0].steps[i].instructions;
            }
            if (i > 0 && j == 0)
            {
                var cRDlen = currentRouteData.length;
                currentRouteData[cRDlen - 1].instructions = txt;
                continue;
            }
            var Lat = directionsDisplay.directions.routes[0].legs[0].steps[i].path[j].lat();
            var Lng = directionsDisplay.directions.routes[0].legs[0].steps[i].path[j].lng();
            var temp = new routeData(Lat, Lng, 0, 0, 0, false, false, txt, false);
            currentRouteData.push(temp);
        }
    }
    currentRouteData[0].dist = 0;
    var dist = 0;
    for (var i = 0; i < currentRouteData.length - 1; i++)
    {
        var j = i + 1;
        var distMeters = LatLngDist(currentRouteData[i].lat, currentRouteData[i].lng, currentRouteData[j].lat, currentRouteData[j].lng) * 1000;
        dist += distMeters;
        currentRouteData[j].dist = dist;
    }
    for (var i = 0; i < currentRouteData.length - 1; i++)
    {
        if (currentRouteData[i].instructions.length > 0)
        {
            var turnLoc = new google.maps.LatLng(currentRouteData[i].lat, currentRouteData[i].lng);
            var turnTxt = currentRouteData[i].instructions;
            var turnMarker = new google.maps.Marker({
                position: turnLoc,
                map: map,
                draggable: true,
                visible: false,
                title: turnTxt
            });
        }
    }
    createSpacedPath();
}
 
function attachInstructionText(marker, text) {
    google.maps.event.addListener(marker, 'click', 
    function() {
        stepDisplay.setContent(text);
        stepDisplay.open(map, marker);
    });
    google.maps.event.addListener(marker, 'mouseover', 
    function() {
        stepDisplay.setContent(text);
        stepDisplay.open(map, marker);
    });
}
   
function storeURL()
 {
    var storedURL;
    var protocol = location.protocol;
    var host = location.host;
    var path = location.pathname;
    var extra;
    var wptString;
    wptString = "numWpts=" + directionsDisplay.directions.routes[0].legs[0].via_waypoint.length + "&";
    for (var i = 0; i < directionsDisplay.directions.routes[0].legs[0].via_waypoint.length; i++)
    wptString = wptString + "wpt[" + i + "]=" + directionsDisplay.directions.routes[0].legs[0].via_waypoint[i].location.lat() + ":" + directionsDisplay.directions.routes[0].legs[0].via_waypoint[i].location.lng() + "&";
    extra = "?Base=" + BaseLocation.lat() + ":" + BaseLocation.lng() + "&" + wptString;
    extra = extra + "tM=" + travelMode;
    extra = extra + "&len=" + document.getElementById("length").value;
    extra = extra + "&unitS=" + document.getElementById("unitSystem").value;
    storedURL = protocol + "//" + host + path + extra;
    return storedURL;
}
function parseUrl(currentURL)
 {
    var returnStatus = new Boolean();
    var urlInputsName = [];
    var urlInputsValue = [];
    var p1,
    p2,
    val;
    returnStatus = false;
    haveEmbedded = false;
    p1 = currentURL.indexOf("URLformat");
    if (p1 > 0)
    {
        p1 = currentURL.indexOf("=", p1) + 1;
        p2 = currentURL.indexOf("&", p1);
        val = currentURL.substring(p1, p2);
        if (val == "embed")
        {
            p1 = currentURL.indexOf("&", p2) + 1;
            p2 = currentURL.indexOf("=", p1) + 1;
            val = currentURL.substring(p1, p2);
            if (val == "Base=")
            {
                p1 = p2;
                p2 = currentURL.indexOf("&", p1);
                val = currentURL.substring(p1, p2);
                var Eaddress = val.replace(/%20/g, " ");
            }
            else return;
            p1 = p2 + 1;
            p2 = currentURL.indexOf("=", p1) + 1;
            val = currentURL.substring(p1, p2);
            if (val == "len=")
            {
                p1 = p2;
                p2 = currentURL.length;
                val = currentURL.substring(p1, p2);
                var Elength = parseFloat(val);
                haveEmbedded = true;
                document.getElementById("address").value = Eaddress;
                codeAddress();
                document.getElementById("length").value = Elength.toFixed(2);
                return;
            }
            else return;
        }
        else return;
    }
    if (currentURL.indexOf("zoom") > 0)
    {
        haveOldUrl = false;
        p1 = currentURL.indexOf("ll=") + 3;
        p2 = currentURL.indexOf("%20", p1);
        val = currentURL.substring(p1, p2);
        if (val.length > 0)
        {
            oldUrlLng = parseFloat(val);
        }
        else return;
        p1 = p2 + 3;
        p2 = currentURL.indexOf("&", p1);
        val = currentURL.substring(p1, p2);
        if (val.length > 0)
        {
            oldUrlLat = parseFloat(val);
        }
        else return;
        p1 = p2 + 5;
        p2 = currentURL.indexOf("&", p1);
        val = currentURL.substring(p1, p2);
        if (val.length > 0)
        {
            oldUrlLen = parseFloat(val) * 5280 * 12 * 2.54 / 100;
        }
        else return;
        p1 = p2 + 4;
        p2 = currentURL.indexOf("&", p1);
        val = currentURL.substring(p1, p2);
        if (val.length > 0)
        {
            oldUrlRnd = parseFloat(val);
        }
        else return;
        p1 = p2 + 4;
        p2 = currentURL.indexOf("&", p1);
        val = currentURL.substring(p1, p2);
        if (val.length > 0)
        {
            oldUrlAllow = val;
        }
        else return;
        haveOldUrl = true;
        return;
    }
    var firstSplit = currentURL.split("?");
    if (firstSplit.length == 2)
    {
        var secondSplit = firstSplit[1].split("&");
        for (var i = 0; i < secondSplit.length; i++)
        {
            var hold = secondSplit[i].split("=");
            urlInputsName[i] = hold[0];
            urlInputsValue[i] = hold[1];
        }
        if (urlInputsName[0] == "Base")
        {
            var hold = urlInputsValue[0].split(":");
            var Lat = parseFloat(hold[0]);
            var Lng = parseFloat(hold[1]);
            uBase = new google.maps.LatLng(Lat, Lng);
        }
        else {
            return returnStatus;
        }
        if (urlInputsName[1] == "numWpts")
        {
            var numWpts = parseInt(urlInputsValue[1]);
        }
        else {
            return returnStatus;
        }
        for (var i = 0; i < numWpts; i++)
        {
            if (urlInputsName[i + 2] == "wpt[" + i + "]")
            {
                var hold = urlInputsValue[i + 2].split(":");
                var Lat = parseFloat(hold[0]);
                var Lng = parseFloat(hold[1]);
                urlPoints[i] = new google.maps.LatLng(Lat, Lng);
            }
            else {
                return returnStatus;
            }
        }
        if (urlInputsName[numWpts + 2] == "tM")
        {
            utM = parseInt(urlInputsValue[numWpts + 2]);
        }
        else {
            return returnStatus;
        }
        if (urlInputsName[numWpts + 3] == "len")
        {
            ulen = parseFloat(urlInputsValue[numWpts + 3]);
        }
        else {
            return returnStatus;
        }
        if (urlInputsName[numWpts + 4] == "unitS")
        {
            uuS = parseInt(urlInputsValue[numWpts + 4]);
        }
        else {
            return returnStatus;
        }
        returnStatus = true;
        return returnStatus;
    }
    else {
        return returnStatus;
    }
}
function buildDirections(directionResult)
 {
    var Directions;
    var myRoute = directionResult.routes[0].legs[0];
    var step = myRoute.steps.length;
    var cumulative = 0;
    var cumWrite;
    Directions = "<table border=1 rules=1>";
    Directions += "<tbody>";
    Directions += "<tr>";
    Directions += "<th colspan=4 align=left bgcolor='#ffec8b'>";
    Directions += "Start: " + myRoute.start_address;
    Directions += "</th>";
    Directions += "</tr>";
    Directions += "<tr>";
    Directions += "<td colspan=4 align=left>";
    Directions += "Total distance is " + totalDistanceInCurrentUnits.toFixed(2);
    if (document.getElementById("unitSystem").value == 0)
    Directions += " mi.";
    else
    Directions += " km.";
    Directions += "</td>";
    Directions += "</tr>";
    if (directionResult.routes[0].warnings.length > 0)
    {
        Directions += "<tr>";
        Directions += "<td colspan=4 align=left>";
        Directions += "<strong><i>" + directionResult.routes[0].warnings[0] + "</i></strong>";
        Directions += "</td>";
        Directions += "</tr>";
    }
    Directions += "<tr>";
    Directions += "<td></td> <td>Instruction</td> <td>Dist.</td> <td>Cum.<br>Dist.</td>";
    Directions += "</tr>";
    for (var i = 0; i < step; i++)
    {
        Directions += "<tr>";
        cumulative += myRoute.steps[i].distance.value;
        if (document.getElementById("unitSystem").value == 0)
        cumWrite = cumulative * 100 / 2.54 / 12 / 5280.;
        else
        cumWrite = cumulative / 1000;
        Directions += "<td>";
        Directions += i + 1 + ".";
        Directions += "</td>";
        Directions += "<td>";
        Directions += "<a href=\"javascript:showDirectionFlag(" + i + ")\">";
        Directions += myRoute.steps[i].instructions;
        Directions += "</a>";
        Directions += "</td>";
        Directions += "<td width='15%'>";
        Directions += myRoute.steps[i].distance.text;
        Directions += "</td>";
        Directions += "<td width='15%'>";
        if (document.getElementById("unitSystem").value == 0)
        Directions += cumWrite.toFixed(2) + "mi";
        else
        Directions += cumWrite.toFixed(2) + "km";
        Directions += "</td>";
        Directions += "</tr>";
    }
    Directions += "<tr>";
    Directions += "<th colspan=4 align=left bgcolor='#ffec8b'>";
    if (myRoute.end_address != null) Directions += "End: " + myRoute.end_address;
    else Directions += "End: " + myRoute.start_address;
    Directions += "</th>";
    Directions += "</tr>";
    Directions += "<tr>";
    Directions += "<td colspan=4 align=left>";
    Directions += "<strong>" + directionResult.routes[0].copyrights + "</strong>";
    Directions += "</td>";
    Directions += "</tr>";
    Directions += "</tbody>";
    Directions += "</table>";
    document.getElementById("mydirectionsPanel").innerHTML = Directions;
}
 
function checkNewVsStored()
 {
    var Changes = 0;
    var myRoute = directionsDisplay.directions.routes[0].legs[0];
    if (previousViaWaypoints.length == 0)
    {
        previousBaseLocation = new google.maps.LatLng(BaseLocation.lat(), BaseLocation.lng());
        lastBaseLocation = new google.maps.LatLng(BaseLocation.lat(), BaseLocation.lng());
        lastViaWaypoints.length = 0;
        previousViaWaypoints.length = 0;
        for (var i = 0; i < myRoute.via_waypoint.length; i++)
        {
            previousViaWaypoints.push(myRoute.via_waypoint[i].location);
            lastViaWaypoints.push(myRoute.via_waypoint[i].location);
        }
        return;
    }
    else
    {
        if (BaseLocation.lat() != lastBaseLocation.lat() || BaseLocation.lng() != lastBaseLocation.lng())
        Changes++;
        if (lastViaWaypoints.length != myRoute.via_waypoint.length)
        {
            Changes++;
        }
        else
        {
            for (var i = 0; i < lastViaWaypoints.length; i++)
            if (lastViaWaypoints[i].lat() != myRoute.via_waypoint[i].location.lat() || lastViaWaypoints[i].lng() != myRoute.via_waypoint[i].location.lng())
            {
                Changes++;
            }
        }
        changesFromLast += Changes;
        if (changesFromLast >= 2)
        {
            changesFromLast = 0;
            previousBaseLocation = new google.maps.LatLng(lastBaseLocation.lat(), lastBaseLocation.lng());
            previousViaWaypoints.length = 0;
            for (var i = 0; i < lastViaWaypoints.length; i++)
            {
                previousViaWaypoints.push(lastViaWaypoints[i]);
            }
        }
        if (Changes > 0)
        {
            lastBaseLocation = new google.maps.LatLng(BaseLocation.lat(), BaseLocation.lng());
            lastViaWaypoints.length = 0;
            for (var i = 0; i < myRoute.via_waypoint.length; i++)
            lastViaWaypoints.push(myRoute.via_waypoint[i].location);
            return;
        }
    }
}
function revertToPreviousRoute()
 {
    BaseLocation = new google.maps.LatLng(previousBaseLocation.lat(), previousBaseLocation.lng());
    rlPoints.length = 0;
    for (var i = 0; i < previousViaWaypoints.length; i++)
    rlPoints.push(previousViaWaypoints[i]);
    previousViaWaypoints.length = 0;
    changesFromLast = 0;
    maintainPoints = true;
    initialize();
    maintainPoints = false;
}
function createCookie(name, value, days)
 {
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        var expires = "; expires=" + date.toGMTString();
    }
    else var expires = "";
    document.cookie = name + "=" + encodeURIComponent(value) + expires + "; path=/";
}
function readCookie(name)
 {
    var ca = document.cookie.split(';');
    var nameEQ = name + "=";
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
    return null;
}
function eraseCookie(name)
 {
    createCookie(name, "", -1);
}
function checkCookie()
 {
    createCookie("cookieTest", 1);
    if (readCookie("cookieTest") == 1) return true;
    else return false;
}
function cleanTails(response)
 {
    var myRoute = response.routes[0].legs[0];
    var pLpoints = new Array();
    var pLdist = new Array();
    var pLclose = new Array();
    var pLsep = new Array();
    var newPath = new Array();
    var pLuse = new Array();
    pLpoints.push(myRoute.steps[0].path[0]);
    for (var i = 0; i < myRoute.steps.length; i++)
    {
        for (var j = 0; j < myRoute.steps[i].path.length; j++)
        {
            if (j == 0) continue;
            pLpoints.push(myRoute.steps[i].path[j]);
        }
    }
    pLdist.push(0);
    var cumulative = 0;
    for (var i = 0; i < pLpoints.length - 1; i++)
    {
        pLuse[i] = false;
        cumulative += LatLngDist(pLpoints[i].lat(), pLpoints[i].lng(), pLpoints[i + 1].lat(), pLpoints[i + 1].lng());
        pLdist.push(cumulative);
        newPath.push(pLpoints[i]);
    }
    newPath.push(pLpoints[pLpoints.length - 1]);
    var closest;
    var point;
    var dist;
    for (var i = 0; i < pLpoints.length; i++)
    {
        var thisOne = pLpoints[i];
        for (var j = i + 1; j < pLpoints.length; j++)
        {
            thatOne = pLpoints[j];
            dist = LatLngDist(thisOne.lat(), thisOne.lng(), thatOne.lat(), thatOne.lng());
            if (j == i + 1)
            {
                closest = dist;
                point = j;
            }
            else
            {
                if (dist < closest)
                {
                    closest = dist;
                    point = j;
                }
            }
        }
        pLclose[i] = point;
        pLsep[i] = closest;
    }
    var tailSize;
    for (var i = 0; i < pLpoints.length; i++)
    {
        pLuse[i] = true;
        if (pLclose[i] - i != 1)
        {
            tailSize = (pLdist[pLclose[i]] - pLdist[i]) / cumulative;
            if (tailSize < 0.2)
            {
                i = pLclose[i];
            }
        }
    }
    newPath.length = 0;
    for (var i = 0; i < pLpoints.length; i++)
    if (pLuse[i])
    newPath.push(pLpoints[i]);
    rlPointsNew.length = 0;
    for (var i = 0; i < myRoute.via_waypoint.length; i++)
    {
        for (var j = 0; j < newPath.length; j++)
        {
            dist = LatLngDist(myRoute.via_waypoint[i].location.lat(), myRoute.via_waypoint[i].location.lng(), newPath[j].lat(), newPath[j].lng());
            if (j == 0)
            {
                closest = dist;
                point = j;
            }
            else
            {
                if (dist < closest)
                {
                    closest = dist;
                    point = j;
                }
            }
        }
        rlPointsNew.push(newPath[point]);
    }
    cr2();
    return;
}
function compareToPlan(response)
 {
    retflag = true;
    var myRoute = response.routes[0].legs[0];
    var length = document.getElementById("length").value;
    if (document.getElementById("unitSystem").value == 0)
    length = length * 5280 * 12 * 2.54 / 100;
    else
    length = length * 1000;
    var ratio = myRoute.distance.value / length;
    if (ratio > 2)
    {
        if (document.getElementById("unitSystem").value == 0)
        {
            var have = myRoute.distance.value * 100 / 2.54 / 12 / 5280;
            var want = length * 100 / 2.54 / 12 / 5280;
        }
        else
        {
            var have = myRoute.distance.value / 1000;
            var want = length / 1000;
        }
        var answer = confirm("The current route length (" + have.toFixed(2) + ") is too far from the requested distance (" + want.toFixed(2) + "). \nClick 'OK' to update the desired route length and use this route. \nClick 'Cancel' to delete this route and generate a new one.");
        if (answer)
        {
            document.getElementById("length").value = have;
            length = have;
            retflag = true;
        }
        else
        retflag = false;
    }
    else
    {
        retflag = true;
    }
    if (!allowFerries)
    {
        for (var i = 0; i < myRoute.steps.length; i++)
        {
            var tmp = myRoute.steps[i].instructions.toLowerCase();
            if (tmp.indexOf("take the") > -1 && tmp.indexOf("ferry") > -1)
            {
                retflag = false;
            }
        }
    }
    return retflag;
}
function circlePoints()
 {
    var dDd = directionsDisplay.directions.routes[0].legs[0];
    for (var i = 0; i < circleArray.length; i++) {
        circleArray[i].setMap(null);
    }
    circleArray.length = 0;
    circleAsked.length = 0;
    var circleSize;
    if (document.getElementById("unitSystem").value == 0)
    {
        circleSize = totalDistanceInCurrentUnits * 5280 * 12 * 2.54 / 100;
        circleSize *= 0.01;
    }
    else
    {
        circleSize = totalDistanceInCurrentUnits * 1000;
        circleSize *= 0.01;
    }
    if (circleSize <= 0) circleSize = 200;
    for (var pnt in dDd.via_waypoint) {
        var wpntCircleOptions = {
            strokeColor: "#FF0000",
            strokeOpacity: 0.0,
            strokeWeight: 0,
            fillColor: "#FF0000",
            fillOpacity: 0.20,
            clickable: true,
            map: map,
            center: dDd.via_waypoint[pnt].location,
            radius: circleSize
        };
        wpntCircle = new google.maps.Circle(wpntCircleOptions);
        circleArray.push(wpntCircle);
        circleAsked.push(false);
        google.maps.event.addListener(wpntCircle, 'mouseover', 
        function(mEvent) {
            var close = 0;
            var test = 0;
            var kill = 0;
            close = LatLngDist(mEvent.latLng.lat(), mEvent.latLng.lng(), directionsDisplay.directions.routes[0].legs[0].via_waypoint[0].location.lat(), directionsDisplay.directions.routes[0].legs[0].via_waypoint[0].location.lng());
            for (var i = 1; i < directionsDisplay.directions.routes[0].legs[0].via_waypoint.length; i++)
            {
                test = LatLngDist(mEvent.latLng.lat(), mEvent.latLng.lng(), directionsDisplay.directions.routes[0].legs[0].via_waypoint[i].location.lat(), directionsDisplay.directions.routes[0].legs[0].via_waypoint[i].location.lng());
                if (test < close)
                {
                    close = test;
                    kill = i;
                }
            }
            if (circleAsked[kill]) return;
            var answer = confirm("The waypoint to be removed is at " + directionsDisplay.directions.routes[0].legs[0].via_waypoint[kill].location.toString() + "\n(Click 'Cancel' if you just want to move, not remove, the point.)");
            circleAsked[kill] = true;
            if (answer)
            {
                directionsDisplay.directions.routes[0].legs[0].via_waypoint.splice(kill, 1);
                rlPoints = new Array();
                for (var i = 0; i < directionsDisplay.directions.routes[0].legs[0].via_waypoint.length; i++)
                {
                    rlPoints[i] = directionsDisplay.directions.routes[0].legs[0].via_waypoint[i].location;
                }
                calcRoute();
            }
        });
    }
    return;
}
function flagPoints()
 {
    var dDd = directionsDisplay.directions.routes[0].legs[0];
    for (var i = 0; i < wayFlags.length; i++) {
        wayFlags[i].setMap(null);
    }
    wayFlags.length = 0;
    for (var pnt in dDd.via_waypoint)
    {
        var location = dDd.via_waypoint[pnt].location;
        var size = new google.maps.Size(60, 44);
        var origin = new google.maps.Point(0, 0);
        var anchor = new google.maps.Point(30, 44);
        var scaledSize = new google.maps.Size(60, 44);
        var flagNum = parseInt(pnt) + 1;
        var file = "images/Flag" + flagNum + ".png";
        var icon = new google.maps.MarkerImage(file, size, origin, anchor, scaledSize);
        var title = "Click the flag to delete waypoint #" + pnt;
        var waypointMarker = new google.maps.Marker({
            position: location,
            map: map,
            icon: icon,
            clickable: true,
            draggable: true,
            title: title
        });
        wayFlags.push(waypointMarker);
        google.maps.event.addListener(waypointMarker, 'click', 
        function(mEvent) {
            var close = 0;
            var test = 0;
            var kill = 0;
            close = LatLngDist(mEvent.latLng.lat(), mEvent.latLng.lng(), directionsDisplay.directions.routes[0].legs[0].via_waypoint[0].location.lat(), directionsDisplay.directions.routes[0].legs[0].via_waypoint[0].location.lng());
            for (var i = 1; i < directionsDisplay.directions.routes[0].legs[0].via_waypoint.length; i++)
            {
                test = LatLngDist(mEvent.latLng.lat(), mEvent.latLng.lng(), directionsDisplay.directions.routes[0].legs[0].via_waypoint[i].location.lat(), directionsDisplay.directions.routes[0].legs[0].via_waypoint[i].location.lng());
                if (test < close)
                {
                    close = test;
                    kill = i;
                }
            }
            var answer = confirm("The waypoint to be removed is at " + directionsDisplay.directions.routes[0].legs[0].via_waypoint[kill].location.toString() + "\n(Click 'Cancel' if you just want to move, not remove, the point.)");
            if (answer)
            {
                directionsDisplay.directions.routes[0].legs[0].via_waypoint.splice(kill, 1);
                rlPoints = new Array();
                for (var i = 0; i < directionsDisplay.directions.routes[0].legs[0].via_waypoint.length; i++)
                {
                    rlPoints[i] = directionsDisplay.directions.routes[0].legs[0].via_waypoint[i].location;
                }
                calcRoute();
            }
        });
    }
}
function resetScale()
 {
    scaleCount = 0;
    scaleFactor = 0.80;
    tooLong = 0;
    tooShort = 0;
    return;
}

function createSpacedPath()
 {
    spacedRouteData.length = 0;
    var spacing = 50;
    var inPoints = currentRouteData.length;
    var routeLength = currentRouteData[inPoints - 1].dist;
    var Lat = currentRouteData[0].lat;
    var Lng = currentRouteData[0].lng;
    var temp = new routeData(Lat, Lng, 0, 0, 0, false, false, "", false);
    spacedRouteData.push(temp);
    var currentDist = 0;
    var istart;
    while (currentDist < routeLength)
    {
        currentDist += spacing;
        if (currentDist >= routeLength) break;
        for (var i = 0; i < inPoints; i++)
        if (currentRouteData[i].dist > currentDist)
        break;
        var j = i;
        i--;
        var distToGo = currentDist - currentRouteData[i].dist;
        var Lat1 = currentRouteData[i].lat;
        var Lon1 = currentRouteData[i].lng;
        var Lat2 = currentRouteData[j].lat;
        var Lon2 = currentRouteData[j].lng;
        var lat1 = Lat1 * Math.PI / 180;
        var lat2 = Lat2 * Math.PI / 180;
        var lon1 = Lon1 * Math.PI / 180;
        var lon2 = Lon2 * Math.PI / 180;
        var R = 6371;
        var dLat = (lat2 - lat1);
        var dLon = (lon2 - lon1);
        var y = Math.sin(dLon) * Math.cos(lat2);
        var x = Math.cos(lat1) * Math.sin(lat2) - 
        Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
        var brng = Math.atan2(y, x);
        var d = distToGo / 1000;
        var lat3 = Math.asin(Math.sin(lat1) * Math.cos(d / R) + 
        Math.cos(lat1) * Math.sin(d / R) * Math.cos(brng));
        var lon3 = lon1 + Math.atan2(Math.sin(brng) * Math.sin(d / R) * Math.cos(lat1), Math.cos(d / R) - Math.sin(lat1) * Math.sin(lat3));
        var Lat3 = lat3 * 180 / Math.PI;
        var Lon3 = lon3 * 180 / Math.PI;
        var temp = new routeData(Lat3, Lon3, currentDist, 0, 0, false, false, "", false);
        spacedRouteData.push(temp);
    }
    var Lat = currentRouteData[inPoints - 1].lat;
    var Lng = currentRouteData[inPoints - 1].lng;
    var temp = new routeData(Lat, Lng, routeLength, 0, 0, false, false, "", false);
    spacedRouteData.push(temp);
}
 
 