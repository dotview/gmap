var directionsDisplay;
var directionsService = new google.maps.DirectionsService();
var map;
var infoWindow;
var polylines = [];
var markers = [];
var dayroutes;
var geocoder;
var searchCount = 0;
var newdayroutes = [];
var nonedayroutes =[];
var icons = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O"];
function initialize() {
    geocoder = new google.maps.Geocoder();
    var myOptions = {
        zoom: 11,
        center: new google.maps.LatLng( - 25.633370000000003, 28.0984),
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
    directionsDisplay = new google.maps.DirectionsRenderer({
        'map': map,
        'preserveViewport': true,
        'draggable': false
    });
    directionsDisplay.setPanel(document.getElementById("directions_panel"));
    $("#day").change(function() {
        $("#day").val() == "" ? $("#validmsg").show() : $("#validmsg").hide();
    });
	$("#btnRoute").click(function() {
        getRoute();
    });
    infoWindow = new google.maps.InfoWindow({
        content: "Not Initialised!",
        maxWidth: 400
    });
    getRoute();
}
function getRoute() {
    if ($("#day").val() == "") {
        $("#validmsg").show();
        return;
    }
    $.ajax({
        type: "GET",
        url: "data/data.txt",
        cache: false,
        dataType: "json",
        data: {
            'UserID': $("#UserID").val(),
            'RouteDate': $("#day").val()
        },
        success: function(d) {
            if (d.result == 0) {
                $("#directions_panel").html("<p style=\"color:red;\">No Appointment data in the day</p>");
            } else {
                dayroutes = d.data;
                calcRoute();
            }
        },
        error: function(d) {
            $("#directions_panel").html("<p style=\"color:red;\">Search Routing data error</p>");
        }
    })
}
function reset() {
	searchCount = 0;
	newdayroutes = [];
	nonedayroutes =[];
    infoWindow.close();
    for (var j in markers) {
        markers[j].setMap(null);
    }
	markers =[];
    for (var k in polylines) {
        polylines[k].setMap(null);
    }
	polylines=[];
}

function codeAddress(dayroute,icon,callback) {
    var address = decodeURI(dayroute.address);
	if(readCookie("gmap_location_"+MakeAddress(address))==null){
    geoSearch(address,function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				var loc = results[0].geometry.location;
                map.setCenter(loc);
				var markerhtml  = getPlaceHtml(dayroute,icon,true);
				var marker = createMarker(loc, icon,address, markerhtml);
                markers.push(marker); 
				dayroute.found = true;
				dayroute.latlng = loc;
				createCookie("gmap_location_"+MakeAddress(address),loc.lat()+"|"+loc.lng());
            }
			else{
				dayroute.found = false;
			}
			searchCount +=1;
			if(callback!=null)callback();
        })
	}else{
		var strlatlng = readCookie("gmap_location_"+MakeAddress(address));
		var latlng = strlatlng.split("|");
		var loc = new google.maps.LatLng(latlng[0],latlng[1]);
		map.setCenter(loc);
                var markerhtml  = getPlaceHtml(dayroute,icon,true);
				var marker = createMarker(loc, icon,address, markerhtml);
                markers.push(marker); 
				dayroute.found = true;
				dayroute.latlng = loc;
				searchCount +=1;
				if(callback!=null)callback();
	}
}
var isFound = false;
function calcRoute() {
	if (dayroutes.length == 0|| isFound) return; 
	reset();
    if (dayroutes.length == 1 ) {
        showMapandPanel(dayroutes);
        return;
    }
	var start = "";
	var end = "";

	//filter all the pins where the address can be found on the google map
	for (var i = 0; i < dayroutes.length; i++) {
		if(dayroutes[i].found && start==""){
			start = dayroutes[i].latlng ? dayroutes[i].latlng:  decodeURI(dayroutes[i].address);
		}
		if(dayroutes[i].found){
			end = dayroutes[i].latlng ? dayroutes[i].latlng: decodeURI(dayroutes[i].address);
			newdayroutes.push(dayroutes[i]);
		}else{
			nonedayroutes.push(dayroutes[i]);
		}
	}
	if ( newdayroutes.length == 0 || isFound) return;
    if ( newdayroutes.length == 1) {
		showMapandPanel(newdayroutes);
        return;
    }
	if(start==end && newdayroutes.length == 2){
		showMapandPanel(newdayroutes);
        return;
	}
    //var start = decodeURI(dayroutes[0].address);
    //var end = decodeURI(dayroutes[dayroutes.length - 1].address);
    var request = {
        origin: start,
        destination: end,
        provideRouteAlternatives: true,
        travelMode: google.maps.TravelMode.DRIVING
    };
	
    if (newdayroutes.length > 2) {
        var waypoints = [];
        for (var i = 1; i < newdayroutes.length - 1; i++) {
            waypoints.push({
                location: newdayroutes[i].latlng ? newdayroutes[i].latlng: decodeURI(newdayroutes[i].address),
                stopover: true
            })
        }
        request.waypoints = waypoints;
        request.optimizeWaypoints = true;
    }
    $("#progress").show();
    directionsService.route(request, 
    function(response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            showRoute(response);
            $("#progress").hide();
        } else {
            $("#progress").hide();
            for (var i = 0; i < dayroutes.length; i++) {
			var func = (function(k){
				return function(){
					codeAddress(dayroutes[k],icons[k],searchDone);
					return k;
				}     
			})(i);
			setTimeout(func,0);
        }

			return false;
        }
    })
}
function showMapandPanel(routes){
	var k =-1;
	for (var i = 0; i < routes.length; i++) {
		codeAddress(routes[i],icons[i],null);
		k+=1;
	}
	var p= showAppointment(routes);
	var np = showAppointment_None(k);
    $("#directions_panel").html(p+np);
}
function searchDone(i){
	if(searchCount==dayroutes.length){
		calcRoute();
		isFound =true;
	}
}

function showRoute(response) {
    var legs = response.routes[0].legs;
    var html = [];
    for (var i = 0; i < legs.length; i++) {
        var leg = legs[i];
        var duration = leg.duration.text;
        var distance = leg.distance.text;
        var steps = leg.steps;
        var start_address = leg.start_address;
        var start_location = leg.start_location;
        var end_address = leg.end_address;
        var end_location = leg.end_location;
        if (i == 0) {
            map.panTo(start_location);
            map.setZoom(12);
        }
		var companyname = decodeURI(newdayroutes[i].companyname);
		var markerhtml  = getPlaceHtml(newdayroutes[i],icons[i],true);
		var marker = createMarker(start_location, icons[i],companyname, markerhtml);
        markers.push(marker);
        
		html.push(getPlaceHtml(newdayroutes[i],icons[i],false));

        html.push('<div class="adp-summary"><span>' + distance + '</span><span> - </span><span>' + duration + '</span></div>');
        html.push('<div><table class="adp-step" cellspacing="0" cellpadding="0">');
        for (var j = 0; j < steps.length; j++) {
            var step = steps[j];
            var instructions = step.instructions;
            var s_duration = step.duration.text;
            var s_distance = step.distance.text;
            var paths = step.path;
            var polyOptions = {
                strokeColor: '#0000AA',
                strokeOpacity: 0.7,
                strokeWeight: 4,
                path: paths
            }
            var polyline = new google.maps.Polyline(polyOptions);
            polyline.setMap(this.map);
            polylines.push(polyline);
            html.push('<tr><td class="adp-substep"> ' + (j + 1) + '.</td><td class="adp-substep">' + instructions + '</td><td width="40" class="adp-substep"><div>' + s_duration + '</div></td></tr>')
        }
        html.push('</table></div>');
        if (i == legs.length - 1) {
			var companyname = decodeURI(newdayroutes[i+1].companyname);
			var markerhtml  = getPlaceHtml(newdayroutes[i+1],icons[i+1],true);
			var marker = createMarker(end_location, icons[i+1], companyname,markerhtml);
			markers.push(marker);
			
			html.push(getPlaceHtml(newdayroutes[i+ 1],icons[i+ 1],false));
		}
    }
	var k =legs.length;
	html.push(showAppointment_None(k));
   	
    html.push('<div>dotview ©2011</div>');
    $("#directions_panel").html(html.join(""));
}
function showAppointment(routes) {
    var html = [];
    html.push("<p style='color:red;'>No route found</p>");
    for (var i = 0; i < routes.length; i++) {
		html.push(getPlaceHtml(routes[i],icons[i],false,routes[i].found?false:true));
	}
	return html.join("");
    
}
function showAppointment_None(k){
	var html = [];
	for (var i = 0; i < nonedayroutes.length; i++) {
		k+=1;
		html.push(getPlaceHtml(nonedayroutes[i],icons[k],false,true));
   }
   return html.join("");
}
function getPlaceHtml(route,icon,ismarker,updateAddress) {
    var companyname = decodeURI(route.companyname);
    var apptime = route.apptime;
    var address = decodeURI(route.address);
    var image = "http://maps.gstatic.com/mapfiles/markers2/icon_green" + icon + ".png";
    var markerhtml = '<p style="font-weight:bold;">Time:' + apptime + '</p><p style="font-weight:bold;">Company:' + companyname + '</p>' + address + '';
	if(!ismarker){
		if(updateAddress){
			markerhtml += "<p style=\"font-weight:bold;\"><a href='#' onclick=\"updateAddress("+route.customerid+")\">Update Address</a></p>";
		}
		var result = '<div><table id="adp-placemark" class="adp-placemark"><tbody><tr><td><img src="' + image + '"></td><td class="adp-text">' + markerhtml + '</td></tr></tbody></table></div>';
		
		return result;
	}
	else{
		return markerhtml;
	}
}
function updateAddress(id){
	LeftPosition=(screen.width)?(screen.width-1000)/2:100;
	TopPosition=(screen.height)?(screen.height-720)/2:100;
	window.open("ChangeCustomer.asp?id="+id,'Update Address',"top="+TopPosition+",left="+LeftPosition+",location=1,status=1,scrollbars=1,width=1000,height=720");

}
function geoSearch(address,callback) {
    if (geocoder) {
        geocoder.geocode({
            'address': address,
            'region': 'ZA'
        },callback)
    }
}
function createMarker(point, icon, title, html) {
	var image = "http://maps.gstatic.com/mapfiles/markers2/icon_green" + icon + ".png";
    var marker = new google.maps.Marker({
        map: map,
        draggable: false,
        position: point,
        icon: image,
		title:title
    });
    google.maps.event.addListener(marker, 'click', function() {
		infoWindow.setContent(html);
		infoWindow.open(map, marker);
	});
    return marker;
}
function MakeAddress(address){
	address = decodeURI(address);
	address = address.replace(/\"/g,"");
	address = address.replace(/\'/g,"");
	address = address.replace(/\,/g,"");
	address = address.replace(/\;/g,"");
	address = address.replace(/\s/g,"");
 
	return address;
}
function createCookie(name,value,days) {
	if (days) {
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		var expires = "; expires="+date.toGMTString();
	}
	else var expires = "";
	document.cookie = name+"="+value+expires+"; path=/";
}

function readCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}

function deleteCookie(name) {
	createCookie(name,"",-1);
}