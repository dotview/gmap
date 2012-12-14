
var map;
var bankMarker = new Array();
var infowindow;
var projection;
var setmarker;
var infowindow;
var setmarkerImage = "http://maps.google.com/mapfiles/ms/micons/ylw-pushpin.png";

 var helper = new google.maps.OverlayView();
 var curMarker;
 var geocoder = new google.maps.Geocoder();

function initialize() {

    var myLatlng = new google.maps.LatLng(31.221908232069964,121.47982349414065);
    var myOptions = {
        zoom: 13,
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

helper.setMap(map);
helper.draw = function () { 
    if (!this.ready) { 
        this.ready = true; 
        google.maps.event.trigger(this, 'ready'); 
    } 
}; 
 infowindow = $("#mapTooltip2");
	// infowindow = new google.maps.InfoWindow();
    filter_data();
    google.maps.event.addListener(map, 'zoom_changed', function () {
		updatePos(false);
    });
	google.maps.event.addListener(map, 'drag', function () {
		updatePos(false);
    });
}
google.maps.event.addDomListener(window, 'load', initialize);

function updatePos(isNew){
	if(!curMarker) return;
	if(!map.getBounds().contains(curMarker.getPosition())){
		infowindow.fadeOut();
		return;
	}
	projection = helper.getProjection();
	var p =  projection.fromLatLngToContainerPixel(curMarker.getPosition());
	infowindow.css({top:p.y-22,left:p.x+270});
	if(isNew){
		$("#hinweistip-title").html(curMarker.title);
		$("#hinweistip-content").html(curMarker.content);
		infowindow.fadeIn();
	}
}
function filter_data() {
    if (bankMarker.length > 0)
        return;
    for (var j in bankMarker) {
        bankMarker[j].setMap(null);
    }

   

    var markerImage = "images/branch.png";
//http://maps.google.com/mapfiles/ms/micons/grn-pushpin.png
    $.ajax({
        type: "GET",
        url: "data/branch_sh.php",
        cache: true,
        success: function (data) {
            banks = data.branches;

            $.each(banks, function (i) {
				//setTimeout(function(){
                var bank = banks[i];
                var latlng = new google.maps.LatLng(bank.lat, bank.lng);
                bankMarker[i] = new google.maps.Marker({
                    position: latlng,
                    map: map,
                    title: bank.name,
                    icon: markerImage,
					//animation: google.maps.Animation.DROP
					visible:false
                    //zIndex: -10
                });
				
				
  		       //bankMarker[i].infoWindow = new google.maps.InfoWindow({
               //     content: "<p>Name:"+bank.name+"</p><p>Address:"+bank.address+"</p><p>Tel:"+bank.tel+"</p><p>OpenTime:"+bank.opentime+"</p>"
               // });
			   bankMarker[i].title= bank.name;
               bankMarker[i].content="<div><p>Name:"+bank.name+"</p><p>Address:"+bank.address+"</p><p>Tel:"+bank.tel+"</p><p>OpenTime:"+bank.opentime+"</p></div>";
			   
                google.maps.event.addListener(bankMarker[i], 'click', function () {
					//infowindow.setContent( bankMarker[i].content);
                    // infowindow.open(map,bankMarker[i]);
					curMarker =  bankMarker[i];
					updatePos(true);
                });
			  google.maps.event.addListener(bankMarker[i], 'mouseover', function () {
					 //bankMarker[i].setAnimation(google.maps.Animation.DROP);//BOUNCE
                });
				
				//},i*50);
            });
	 
				for(j=0;j<bankMarker.length;j++){
					(function(k){
						setTimeout(function(){
						if(bankMarker[k]){
							bankMarker[k].setVisible(true);
							bankMarker[k].setAnimation(google.maps.Animation.DROP);
						}	
						},k*50);
					})(j);
				}
			
        },
        error: function (d) {
            //alert("fail to search!please try again!");
        },
        dataType: "json"
    });
	
	
}

function MapSearch(address) {
    if (address == "")
        return;
    if (geocoder) {
        geocoder.geocode({ 'address': address }, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                map.setCenter(results[0].geometry.location);
                if (setmarker == null) {
                    setmarker = new google.maps.Marker({
                        map: map,
                        position: results[0].geometry.location
                    });
                    map.setZoom(14);
                }
                else {
                    setmarker.setPosition(results[0].geometry.location);
                }
            } else {
                alert("Can not find the place: " + address + " ");
            }
        });
    }
}
$(document).ready(function(){
	$("#buttonBeenHere").click(function(){
		if($("#accommodationName").val()=="") return;
		MapSearch($("#accommodationName").val());
	})
})