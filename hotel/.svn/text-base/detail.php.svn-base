<html>
<head>
    <meta name="viewport" content="initial-scale=1.0, user-scalable=no" />
    <meta http-equiv="content-type" content="text/html; charset=UTF-8" />
    <title>Google Maps Demo</title>
	 <link href="/style/common.css" rel="stylesheet" type="text/css" id="Link2">
    <link href="style/main.css" rel="stylesheet" type="text/css">
    <script type="text/javascript" src="http://www.google.com/jsapi"></script>
    <script type="text/javascript" src="http://maps.googleapis.com/maps/api/js?sensor=false"></script>
    <script type="text/javascript">
        google.load("jquery", "1.3.2"); 
    </script>
    <script type="text/javascript" src="js/PropertyOverlay.js"></script>
    <script>
        function initialize() {
            var myLatlng = new google.maps.LatLng(35.339, 33.32);
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
            var curmap = new google.maps.Map(document.getElementById("map_canvas_min"), myOptions);
            var curmarkerImage = "images/map-marker-hotel-selected.gif";

            var  curMarker = new google.maps.Marker({
                position: new google.maps.LatLng(35.339, 33.32),
                map: curmap,
                title: "Map",
                icon: curmarkerImage
                //zIndex: -10
            });
             google.maps.event.addListener(curMarker, 'click', function () {
             $("#b_map_container").fadeIn();
                    initialize_inner(this.getPosition());
             });
             $("#close_map").click(function(){
                 $("#b_map_container").hide();
             })
         }
         var curmarkerImage = "images/map-marker-hotel-selected.gif";

         
var map;
var hotelMarker = new Array();
//var infoWins = new Array();
var hotels = new Array();
//var infos = new Array();
var overlay = new Array();



function initialize_inner(curpos) {
    var myLatlng = new google.maps.LatLng(35.339, 33.32);
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
    map = new google.maps.Map(document.getElementById("b_gmap_inner"), myOptions);


    filter_data(curpos);
    google.maps.event.addListener(map, 'idle', function () {
        
    });
}

function filter_data(curpos) {

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


    var markerImage = "images/map-marker-hotel.gif";
    var popDiag = $("#markerPopup")


    $.ajax({
        type: "GET",
        url: "data.php",
        cache: false,
        data: {
            'type': 'list'
        },

        success: function (data) {
            hotels = data.Hotels;
            $.each(hotels, function (i) {
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

                //markerImage = latlng.equals(curpos) ? curmarkerImage : markerImage;

                hotelMarker[i] = new google.maps.Marker({
                    position: latlng,
                    map: map,
                    title: hotel_Name,
                    icon: latlng.equals(curpos) ? curmarkerImage : markerImage
                    //zIndex: -10
                });


                var styleFade = latlng.equals(curpos) ? "curhotel" : "hotel";

                var rate = '';
                if (hotel_StarRating && hotel_StarRating > 0) {
                    rate = '<img alt="' + hotel_StarRating + ' stars" src=\'http://q.bstatic.com/static/img/icons/stars/' + hotel_StarRating + 'sterren-small.png\'>';
                }

                var prophtml = '<div class="' + styleFade + '" id="b_overlay"><h3>' + rate + hotel_Name + '</h3><p><img alt="" src="' + hotel_Thumbnail + '">' + hotel_Memo + '</p><p>&nbsp;</p></div>'
                //infoWins[i] = new google.maps.InfoWindow({
                //    content: prophtml
                //});
                overlay[i] = new PropertyDetailOverlay(hotelMarker[i].getPosition(), prophtml, "customBox", map);

                google.maps.event.addListener(hotelMarker[i], 'mouseover', function () {
                    overlay[i].show();
                });
                google.maps.event.addListener(hotelMarker[i], 'mouseout', function () {
                    overlay[i].hide();
                });

                if (!latlng.equals(curpos)) {
                    google.maps.event.addListener(hotelMarker[i], 'click', function () {
                        document.location = hotels[i].split("#")[4];
                    });
                }

            });
        },
        error: function (d) {
            //alert("fail to search!please try again!");
        },
        dataType: "json"
    });
}
      
       
    </script>
  
</head>
<body onload="initialize();">
    <div id="map_canvas_min">
    </div>
 
    <div style="z-index: 999; left: 471.5px; top: 227px;display:none;" id="b_map_container">
        <div style="height: 427px;" id="b_gmap">
            <div id="b_map_title">
                <h2>
                    Map</h2>
                <a id="close_map" href="#">Close map</a></div>
            <div style="height: 400px; position: relative; background-color: rgb(229, 227, 223);
                overflow: hidden;" id="b_gmap_inner">
                
            </div>
            <div style="height: 390px;" id="b_map_legend">
                <h3>
                    Legend</h3>
                <table>
                    <tbody>
                        <tr>
                            <td>
                                <img src="images/map-marker-hotel-selected.gif">
                            </td>
                            <th>
                                Current hotel
                            </th>
                        </tr>
                        <tr>
                            <td>
                                <img src="images/map-marker-hotel.gif">
                            </td>
                            <th>
                                Hotel
                            </th>
                        </tr>
                        
                    </tbody>
                </table>
                <p style="font-size: 11px;">
                    Click these markers on the map for more detailed information</p>
               
            </div> 
        </div>
        <div style="height: 474px;" id="b_shadow">
        </div>
    </div>
</body>
</html>
