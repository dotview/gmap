 
 var map;
 var quyuMarker = new Array();
 var infoWins = new Array();
  var imgpaths = new Array();
  
 function initialize() {
    //var myLatlng = new google.maps.LatLng(37.4419, -122.1419);
    var myLatlng =new google.maps.LatLng(30.308582906876072, 120.05160083789064);
    var myOptions = {
      zoom: 6,
      center: myLatlng,
      zoomControl:true,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
    filter_data();
    google.maps.event.addListener(map, 'idle', function() {
        setTimeout(function() { filter_data() }, 10);
    });
 }

function filter_data() {
    for (var j in quyuMarker) {
        quyuMarker[j].setMap(null);
    }
    
    var myLatLng_agent;
    $.ajax({
        type: "GET",
        url: "admin/datalist.php",
        cache: true,
        data: {
            'type': 'list',
            pagesize: 60,
            pageindex: 1
        },

        success: function(data) {
            $.each(data, function(i) {
                var estate = data[i];
                
                quyuID = estate.ID;

                myLatLng_agent = new google.maps.LatLng(estate.lat, estate.lng);
                imgpaths[i]= new google.maps.MarkerImage('images/'+estate.logoimgpath+'.png',
                                  new google.maps.Size(32, 32),
                                  new google.maps.Point(0,0),
                                  new google.maps.Point(0, 32));
								  
                var image = "http://maps.gstatic.com/mapfiles/markers2/icon_green" + estate.logoimgpath.toUpperCase() + ".png";
				
                quyuMarker[i] = new google.maps.Marker({
                    position: myLatLng_agent,
                    map: map,
                    title: estate.name,
                    icon: image,
                    zIndex: -10
                });
                
                infoWins[i]= new google.maps.InfoWindow({
                    content: estate.address
                });
                
                google.maps.event.addListener(quyuMarker[i], 'click', function() {
                   infoWins[i].open(map,quyuMarker[i]);
                });
            });
        },
        error: function(d) {
            //alert("fail to search!please try again!");
        },
        dataType: "json"
    });
}