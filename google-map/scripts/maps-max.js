// Change these parameters to customize map
var param_wsId = "od6";
var param_ssKey = "0Agkke7dcJPyEdFlkTFlEa2Z6TjMwX0JsUVpkUnI3Y3c"; //0Agkke7dcJPyEdDRsMGhKaWdyNWtsNlVYM1hWLW0wM2c";

var param_prefix = "gsx$";

var param_region = param_prefix+"region";
var param_resourceColumn = param_prefix+"resourcetype";

var param_ncat 							= param_prefix+"rtype";
var param_titleColumn 			= param_prefix+"docname";
var param_titleLinkColumn 	= param_prefix+"doclink";
var param_institutionColumn	= param_prefix+"institution";
var param_projtitleColumn 	= param_prefix+"projtitle";
var param_ntownColumn 			= param_prefix+"ntown";

var param_link 							= param_prefix+"relatedlink";
var param_linktext 					= param_prefix+"relatedlinktitle";

var param_latColumn = param_prefix+"latitude";
var param_lngColumn = param_prefix+"longitude";

// solutions field
var param_solutionsColumn = param_prefix+"solutions";

// Objects for the map
var cm_map;
var cm_mapMarkers = [];
var cm_mapHTMLS = [];
var geocoder;
var cm_solution = '0';
var cm_filters = [];
// shadow image for all icons
var cm_shadowImage;
// info window for the map
var cm_infoWindow;
// default positions, zoom level and region name to be overriden by the html page
var cm_lat = -30;
var cm_lng = 130;
var cm_zoom = 4;
var cm_regionName = 'all';

// filter function to toggle display of icons based on their type
function cm_filter(element, rank) {
    var visible = element.className == "legend";
    element.className = visible ? "legend_disabled" : "legend";
    // update filter state
    cm_filters[rank] = !visible;
    // update cookies
    for(var value in cm_filters) {
        cm_set_cookie(cm_regionName + "_filter_" + value, cm_filters[value] == true ? "1" : "0");
    }
    // refresh all markers
    cm_filterAll();
}

function cm_updateSettings() {
    // get cookies
    for(var value in cm_filters) {
        var cookieSetting = cm_get_cookie(cm_regionName + "_filter_" + value);
        var classname;
        var element = document.getElementById("cm_" + value) || {};
        if(cookieSetting == "0") {
            cm_filters[value] = false;
            element.className = "legend_disabled";
        } else {
            cm_filters[value] = true;
            element.className = "legend";
        }
    }
    cm_filterAll();
}

// filter function to toggle display of icons based on their solution
function cm_updateSolutions() {
    var select = document.getElementById("map_solutions");
    if(select) {
        cm_solution = select.value;
        cm_filterAll();
    }
}

// function to update all markers based on current values for filters and solutions
function cm_filterAll() {

    cm_infoWindow.close();

    for(var index = 0; index < cm_mapMarkers.length; index++) {
        var marker = cm_mapMarkers[index];
        marker.filter();
    }
}

/** 
 * Called when JSON is loaded. Creates sidebar if param_sideBar is true.
 * Iterates through worksheet rows, creating marker and sidebar entries for each row.
 * @param {JSON} json Worksheet feed
 */       
function cm_loadMapJSON(json) {

  var bounds = new google.maps.LatLngBounds();

  // initialise filters values
  cm_filters = {"cs": true, "fs": true, "fc": true, "rr": true, "pp": true, "cmp": true};

  for (var i = 0; i < json.feed.entry.length; i++) {
    var entry = json.feed.entry[i];
		
    if(entry[param_latColumn]) {
			
			var region = entry[param_region].$t;
			
                        var regionName = cm_regionName || 'all';
			if (region == regionName || regionName == 'all') {
				
				var lat = parseFloat(entry[param_latColumn].$t);
				var lng = parseFloat(entry[param_lngColumn].$t);
				
				var legendtxt;
                                var color;
				
				if(entry[param_ncat].$t == "cs") {
					legendtxt = "Case Study";
                                        color = "color: #7ca535";
				}
				else if(entry[param_ncat].$t == "fs") {
					legendtxt = "Farmer Story";
                                        color = "color: #4c227b";
				}
				else if(entry[param_ncat].$t == "fc") {
					legendtxt = "Film Clips";
                                        color = "color: #852a01";
				}
				else if(entry[param_ncat].$t == "rr") {
					legendtxt = "Research Report";
                                        color = "color: #ca9600";
				}
				else if(entry[param_ncat].$t == "pp") {
					legendtxt = "Published Products";
                                        color = "color: #4f3011";
				}
				else if(entry[param_ncat].$t == "cmp") {
					legendtxt = "Catchment Management Plans";
                                        color = "color: #2441ee";
				}

				var label = entry[param_titleColumn].$t;

				var html = "<div style='font-size:14px; text-align:left; font-family:Arial, Helvetica, sans-serif'>";

                                html += "<p style='font-size:16px; margin-bottom: 10px; font-family:Arial, Helvetica, sans-serif; font-weight: bold; " + color + "'>" + legendtxt + "</p>";

                                // popup is different depending on page we are in
                                if(regionName == 'all') {
                                    // genies map page
                                    html += '<img src="images/map_icons/google-popup-genie.gif" width="60" height="105" align="right" hspace="15"/>';
                                    html += '<b>Document Name</b><br/>';
                                    html += '<a href="' + entry[param_titleLinkColumn].$t + '" target="_blank">' + entry[param_titleColumn].$t + '</a><br/>';
                                    html += '<br/>';
                                    html += '<b>Farmers, Researcher or Institution</b><br/>';
                                    html += entry[param_institutionColumn].$t + '<br/>';
                                    html += '<br/>';
                                    html += '<b>Topic or Project Title</b><br/>';
                                    html += entry[param_projtitleColumn].$t + '<br/>';
                                    html += '<br/>';
                                    html += '<b>Nearest Town</b><br/>';
                                    html += entry[param_ntownColumn].$t + '<br/>';
                                    html += '<br/>';
                                } else {
                                    // regional map page

                                    html += "<img src='images/map_icons/google-popup-genie.gif' width='60' height='105' align='right' hspace='15'>";
                                    html += "<strong>Document Name</strong><br>";
                                    html += "<a href='" + entry[param_titleLinkColumn].$t + "' target='_blank'><strong>" + entry[param_titleColumn].$t + "</strong></a><br><br>";

                                    html += "<strong>Farmers, Researcher or Institution</strong><br>";
                                    html += entry[param_institutionColumn].$t + "<br><br>";

                                    html += "<strong>Topic or Project Title</strong><br>";
                                    html += entry[param_projtitleColumn].$t + "<br><br>";

                                    html += "<strong>Nearest Town</strong><br>";
                                    html += entry[param_ntownColumn].$t + "<br><br>";

                                }
                                html += "<strong>Related Links</strong><br>";

                                for (var j = 1; j < 2; j++) {
                                        if(entry[param_link+j].$t || entry[param_linktext+j].$t) {
                                                var linkText = entry[param_link+j].$t;
                                                if (entry[param_linktext+j].$t) {
                                                        linkText = entry[param_linktext+j].$t;
                                                }
                                                html += '<a href="'+entry[param_link+j].$t+'" target="_blank">' + linkText + "</a>";
                                        }
                                }

				html += "</div>";
	
				// create the marker
				var rank = "al";
				if(entry[param_ncat].$t) {
					rank = entry[param_ncat].$t;
				}
				var solutions = '0';
                                if(entry[param_solutionsColumn]) {
                                    solutions = entry[param_solutionsColumn].$t;
                                }
	
				if (!isEmpty(lat) && !isEmpty(lng)) {
					var point = new google.maps.LatLng(lat,lng);
					var marker = cm_createMarker(point,label,html,rank, solutions);
					cm_mapMarkers.push(marker);
					cm_mapHTMLS.push(html);
                                        bounds.extend(point);
				} else {
				}
			}
		}
  }

  cm_map.fitBounds(bounds);

  cm_updateSettings();

  cm_updateSolutions();

}

/** Is a string variable empty */
function isEmpty(text) {
  return !text || text==='' || text===' ';
}

/**
 * Creates marker with Icon
 */
function cm_createMarker(point, title, html, rank, solutions) {
  // create icon
  var image = new google.maps.MarkerImage("images/map_icons/" + rank + "_icon.png",
      new google.maps.Size(33, 41),
      new google.maps.Point(0,0),
      new google.maps.Point(9, 34));
  // create marker
  var marker = new google.maps.Marker({
    map: cm_map,
    draggable: false,
    position: point,
    icon: image,
    shadow: cm_shadowImage,
    title: title
  });
  // keep track of rank
  marker.rank = rank;
  marker.solutions = (solutions || '0') + ",";
  // add function to filter based on rank
  marker.filter = function() {
      var visible = cm_filters[this.rank];
      if(visible == undefined) {
          visible = true;
      }
      if(visible && (cm_solution == '0' || this.solutions.indexOf(cm_solution + ",") != -1)) {
          marker.setVisible(true);
      } else {
          marker.setVisible(false);
      }
  }

  google.maps.event.addListener(marker, 'click', function() {
      cm_infoWindow.setContent(html);
      cm_infoWindow.open(cm_map, marker);
  });

  return marker;
}

/**
 * Creates a script tag in the page that loads in the 
 * JSON feed for the specified key/ID. 
 * Once loaded, it calls cm_loadMapJSON.
 */
function cm_getJSON() {

  // Retrieve the JSON feed.
  var scriptDiv = document.createElement('div');
  var script = document.createElement('script');

  script.setAttribute('src', 'http://spreadsheets.google.com/feeds/list'
                         + '/' + param_ssKey + '/' + param_wsId + '/public/values' +
                        '?alt=json-in-script&callback=cm_loadMapJSON');
  script.setAttribute('id', 'jsonScript');
  script.setAttribute('type', 'text/javascript');
  
  // for not standard compilant pages
  var mapDiv = document.getElementById("map_canvas");
  scriptDiv.appendChild(script);
  mapDiv.parentNode.appendChild(scriptDiv);
  
}

function initialize() {
  var myOptions = {
    zoom: cm_zoom,
    center: new google.maps.LatLng(cm_lat, cm_lng),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  }
  cm_map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);

  // create the shadow image for all icons
  cm_shadowImage = new google.maps.MarkerImage('http://www.google.com/mapfiles/shadow50.png',
      new google.maps.Size(40, 28),
      new google.maps.Point(0,0),
      new google.maps.Point(9, 34));

  // create info window
  cm_infoWindow = new google.maps.InfoWindow({
    content: "Not Initialised!",
    maxWidth: 400
  });

  // now retrieve the data for the map
  cm_getJSON();
}

function loadScript() {
  var script = document.createElement("script");
  script.type = "text/javascript";
  script.src = "http://maps.googleapis.com/maps/api/js?sensor=false&callback=initialize";
  document.body.appendChild(script);
}

// to make sure any other onload method is not overriden
function addLoadEvent(func) {
  var oldonload = window.onload;
  if (typeof window.onload != 'function') {
    window.onload = func;
  } else {
    window.onload = function() {
      if (oldonload) {
        oldonload();
      }
      func();
    }
  }
}

function cm_get_cookie ( cookie_name )
{
  var results = document.cookie.match ( '(^|;) ?' + cookie_name + '=([^;]*)(;|$)' );

  if ( results )
    return ( unescape ( results[2] ) );
  else
    return null;
}

function cm_delete_cookie ( cookie_name )
{
  var cookie_date = new Date ( );  // current date & time
  cookie_date.setTime ( cookie_date.getTime() - 1 );
  document.cookie = cookie_name += "=; expires=" + cookie_date.toGMTString();
}

function cm_set_cookie ( name, value, exp_y, exp_m, exp_d, path, domain, secure )
{
  var cookie_string = name + "=" + escape ( value );

  if ( exp_y )
  {
    var expires = new Date ( exp_y, exp_m, exp_d );
    cookie_string += "; expires=" + expires.toGMTString();
  }

  if ( path )
        cookie_string += "; path=" + escape ( path );

  if ( domain )
        cookie_string += "; domain=" + escape ( domain );

  if ( secure )
        cookie_string += "; secure";

  document.cookie = cookie_string;
}

addLoadEvent(loadScript);
