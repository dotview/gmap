
(function () {
    "use strict";

    window.GMap = function () {
        //prop values
        var map,
            poi_cache = [],
			customIcons = [],
			city_array = [],
            marker_stor,
			oCluster,
            listenerToRemove = null,
            map_container,
            gMapContainer = "#map",
            gInfowindow = '',
            oMaxBounds = null,
            mapBounds,
            bounds_changed_listener,
			self = this,
			circle,
			setmarker,
			geocoder,
			infowindow,
			colorArray = ["#0000FF", "#9966CC", "#33CC00", "#FF80C0", "#996600", "#00CCFF", "#FF0066", "#66FF66", "#999999"],
			setmarkerImage = "http://maps.google.com/mapfiles/ms/micons/ylw-pushpin.png",
			dataurl = window.dataurl || "js/CA.json",
			//default values, can be override by call public method setMapLocation
            start_location_lat = window.start_location_lat || 36.785324,
            start_location_lng = window.start_location_lng || -119.417930,
            start_location_zoom = window.start_location_zoom || 6,
			start_location_type = google.maps.MapTypeId.ROADMAP;

        /*
        * pivate method init
        */
        var init = {
            initMap: function () {
                var myLatlng = new google.maps.LatLng(start_location_lat, start_location_lng);
                var myOptions = {
                    zoom: start_location_zoom,
                    center: myLatlng,
                    mapTypeControl: true,
                    streetViewControl: false,
                    panControl: true,
                    zoomControl: true,
                    zoomControlOptions: {
                        style: google.maps.ZoomControlStyle.LARGE
                    },
                    scaleControl: true,
                    scrollwheel: false,
                    mapTypeId: start_location_type
                };

                map_container = $(gMapContainer);
                map = new google.maps.Map(map_container.get(0), myOptions);
                map.load_count = 0;
                var infoWinOptions = {
                    disableAutoPan: false,
                    maxWidth: 0,
                    closeBoxMargin: "10px 2px 2px 2px",
                    closeBoxURL: "http://www.google.com/intl/en_us/mapfiles/close.gif",
                    isHidden: false,
                    pane: "floatPane",
                    enableEventPropagation: false
                };
                gInfowindow = new google.maps.InfoWindow(infoWinOptions);

                geocoder = new google.maps.Geocoder();
               
                circle = new google.maps.Circle({
                    map: map,
                    fillColor: '#00A0FF',
                    fillOpacity: 0.4,
                    strokeColor: '#ccc',
                    strokeOpacity: 0.5
                   // radius: jQuery("#buffer").val() // 3 km
                });


                if (typeof (strlocation) !== "undefined") {
                    $("#locationInput").val(strlocation);
                    searchEventhandler();
                   
                } else {
                    //this event only run once, idle evnet will also raise bounds change
                    bounds_changed_listener = google.maps.event.addListenerOnce(map, 'bounds_changed', function () {
                        map.current_bounds = map.getBounds();
                        oMaxBounds = map.getBounds();
                        getMarkersByFusionTable();
                    });
                }

            },
            initLoadingBox: function () {
                map_container.append($("<div id='map_loader_box'></div>").css({
                    position: 'absolute',
                    bottom: '50px',
                    left: '0px',
                    backgroundColor: '#eef',
                    display: 'none',
                    fontSize: '16px',
                    padding: '15px',
                    paddingTop: '8px',
                    paddingBottom: '8px',
                    fontFamily: 'Arial'
                }).html("Loading Map Data"));

                var mHeight = map_container.height(),
					mWidth = map_container.width(),
					mTop = map_container.offset().top,
					mLeft = map_container.offset().left;

                $('body').append($("<div id='map_blocker_box'></div>").css({
                    position: 'absolute',
                    width: mWidth,
                    height: mHeight,
                    top: mTop,
                    left: mLeft,
                    backgroundColor: '#ccc',
                    display: 'none'
                }));
            },
            initIcons: function () {
            },
            initMarkerManager: function () {
                //new marker manager object
                //marker_stor = new MarkerManager(map);
                //new villa cluster object
                oCluster = new MarkerClusterer(
					map, [], {
					    gridSize: 70,
					    maxZoom: 15,
					    styles: [{
					        'url': "images/cluster_g.png",
					        'height': 50,
					        'width': 50,
					        'textColor': '#fff'
					    }]
					});
                jQuery("#poiList li").live("click", function () {
                    var marker_cache_id = get_poi_cache_index($(this).attr("attr-id"));
                    if (marker_cache_id == -1) return;
                    var marker = poi_cache[marker_cache_id].marker;
                    google.maps.event.trigger(marker, "click");
                });
                if (typeof (strradius) !== "undefined") {
                    jQuery("#buffer").val(strradius);
                }
                jQuery("#buffer").change(function (e) {
                    if (circle != null) {
                        circle.setRadius(parseInt(jQuery("#buffer").val()));
                        map.fitBounds(circle.getBounds());
                        getMarkersByFusionTable();
                    }
                });
                $("#btnSubmit").bind("click", searchEventhandler);
            }
        };

        var showorhideMarkers = function (type, obj) {
            var checked = obj.attr("show");
            for (var i = 0; i < poi_cache.length; ++i) {
                if (poi_cache[i].City == type) {
                    if (checked == "false") {
                        poi_cache[i].marker.setMap(map);
                        obj.attr("show", "true");
                        $("#poiList").find("li[attr-id='" + poi_cache[i].id + "']").show();
                    }
                    else {
                        poi_cache[i].marker.setMap(null);
                        obj.attr("show", "false");
                        $("#poiList").find("li[attr-id='" + poi_cache[i].id + "']").hide();
                    }
                }
            }
        }

        /*
        * get marker object according to the provided map point
        */
        var getMarkerAtPoint = function (point) {
            for (var i = 0; i < poi_cache.length; ++i) {
                if (point.equals(new google.maps.LatLng(poi_cache[i].lat, poi_cache[i].lng))) {
                    return poi_cache[i].marker;
                }
            }
            // point is not in there
            return null;
        }

        // creates the marker object
        var createMarker = function (point, title, type, id) {
            var marker = new google.maps.Marker({
                position: point,
                title: title,
                map: map
                //animation: google.maps.Animation.DROP
            });
            if (!window.singleIcon) {
                var city_index = get_city_index(type);
                if (city_index == -1) {
                    city_index = add_city(type);
                }
                //var iconcolor = colorArray[city_index];

                var iconindex = city_index < 9 ? "0" + (city_index + 1).toString() : (city_index + 1);
                //var imagepath = "/guider/assets/icon/marker_f"+iconindex + ".png";
                var imagepath = "images/pin.png";
                if (city_index > 9) {
                    //imagepath = "images/pin2.png";
                }
                var image = new google.maps.MarkerImage(imagepath,
                      // This marker is 20 pixels wide by 32 pixels tall.
                      new google.maps.Size(36, 40),
                      // The origin for this image is 0,0.
                      new google.maps.Point(0, 0),
                      // The anchor for this image is the base of the flagpole at 0,32.
                      new google.maps.Point(12, 40));
                if (city_index < 20) {
                    //marker.icon = image;
                }
                marker.icon = image;
            }

            marker.type = type;
            marker.id = id;

            google.maps.event.addListener(marker, 'click', function () {
                // load up the proper info window
                selectMarker(this.id, this.type);
                selectItemDiv(this.id);
            });

            return marker;
        }
        var add_city = function (cityname) {
            city_array[city_array.length] = cityname;
            return city_array.length - 1;
        }

        /* 
		* this function is used to test is a point of interest is stored in the cache
        * it is separated so that proper sort can be added in the future for a massive
        * speed improvement
		*/
        var get_city_index = function (cityname) {
            var is_caught = false;
            for (var n = 0, len = city_array.length; n < len; n++) {
                if (cityname == city_array[n]) {
                    return n;
                }
            }
            return -1;
        }
        var geoAndMakerItem = function (poi, state, city, address, fulladdress, id, title, i, arrCnt) {
            var key = fulladdress;//address + " " + city + " " + state;
            var lat_value = $.jStorage.get("latitude_" + key);
            var lng_value = $.jStorage.get("longitude_" + key);
            if (!lat_value) {
                (function (key, poi, state, city, address, fulladdress, id, title, k, arrCnt) {
                    setTimeout(function () {
                        console.info(new Date());
                        MapSearch(key, function (results) {
                            var latlng = results[0].geometry.location;
                            var mkr = createMarker(latlng, title, city, id);

                            var lat_value = latlng.lat();
                            var lng_value = latlng.lng();
                            // and save it
                            $.jStorage.set("latitude_" + key, lat_value);
                            $.jStorage.set("longitude_" + key, lng_value);

                            mapBounds.extend(latlng);
                            poi.marker = mkr;
							//updateLatLng(poi.id,lat_value,lng_value);
                            oCluster.addMarker(mkr);
                            add_poi_to_cache(poi);
                            createHtml(id, city, title);
                            console.info("new" + title);

                            if (k == arrCnt) {
                                console.info("fitBounds...");
                               if(circle.getRadius() == undefined){
									map.fitBounds(mapBounds);
								}else{
									checkBounds();
								}
                            }
                        })
                    }, 500 * k);
                })(key, poi, state, city, address, fulladdress, id, title, i, arrCnt);
            }
            else {
                (function (poi, state, city, address, fulladdress, id, title, k, arrCnt) {
                    setTimeout(function () {
                        var latlng = new google.maps.LatLng(lat_value, lng_value);
                        var mkr = createMarker(latlng, title, city, id);
                        poi.marker = mkr;
                        oCluster.addMarker(mkr);
                        mapBounds.extend(latlng);
						//updateLatLng(poi.id,lat_value,lng_value);
                        add_poi_to_cache(poi);
                        createHtml(id, city, title);
                        console.info("load..." + city);
                        if (k == arrCnt) {
                            console.info("fitBounds...");
                            
							if(circle.getRadius() == undefined){
								map.fitBounds(mapBounds);
							}else{
								checkBounds();
							}
                        }
                    }, 10 * k);
                })(poi, state, city, address, fulladdress, id, title, i, arrCnt);
            }

        }
		var showMarkers = function (poi, k, arrCnt) {
			var lat = poiObj.lat, lng = poiObj.lng, city = poiObj.City, fulladdress = poiObj.FullAddress, id= poiObj.id, v = poiObj.Institution_Name;
			if ((lat== null || lat =="") || (lng== null || lng =="")) {
				return;
			}
			var latlng = new google.maps.LatLng(lat, lng);
			var mkr = createMarker(latlng, title, city, id);
			poi.marker = mkr;
			oCluster.addMarker(mkr);
			mapBounds.extend(latlng);
			 
			add_poi_to_cache(poi);
			createHtml(id, city, title);
			console.info("load..." + city);
			if (k == arrCnt) {
				console.info("fitBounds...");
				
				if(circle.getRadius() == undefined){
					map.fitBounds(mapBounds);
				}else{
					checkBounds();
				}
			}
		}
        // creates the marker object
        var createMarker2 = function (point, type, id, title, url) {
            var marker = new google.maps.Marker({
                position: point,
                title: title,
                map: map
            });
            if (url) {
                marker.icon = new google.maps.MarkerImage(url, new google.maps.Size(24, 32));
            }
            marker.type = type;
            marker.id = id;
            marker.url = url;

            google.maps.event.addListener(marker, 'click', function () {
                // load up the proper info window
                selectMarker(this.id, this.type);
                selectItemDiv(this.id);
            });

            return marker;
        }

        var createHtml = function (index, city, address) {
            var cityUl = $("#poiList").find("ul[city='" + city + "']");
            if (cityUl.length == 0) {
                cityUl = $("<ul city='" + city + "'><div class='head'>" + city + "</div></ul>");
                $("#poiList").append(cityUl);
            }
            cityUl.append("<li attr-id='" + index + "'>" + address + "</li>");
        }
        /*
        * show info window content
		* should get the marker firstly according to the marker_id
        */
        var selectMarker = function (marker_id, marker_type) {
            // first we want to grab the marker
            var marker_cache_id = get_poi_cache_index(marker_id);
            var poi = poi_cache[marker_cache_id];
            var marker = poi.marker;
            var getVars = "id=" + marker_id + "&type=" + marker_type;
            map.selected_marker = marker;

            // next we want to open the ext window	CEO Phone

            var content = '<div id="mhframe"><b>Institution Name:</b>' + poi.Institution_Name +'<br><b>Address:</b>'+ poi.FullAddress  
			+ '<br><br><b>CEO Name:</b>'+ poi.CEO_Name 
			+ '<br><b>CEO Title:</b>'+ poi.CEO_Title 
			+ '<br><b>CEO Phone:</b>'+ poi.CEO_Phone  + '</div>';
            gInfowindow.setContent(content);
            gInfowindow.open(map, marker);

            if (marker.getMap() == null) {
                map.setZoom(17);
            }
            map.panTo(marker.getPosition());


        }

        var selectItemDiv = function (marker_id) {
            $("#poiList .selItem").removeClass("selItem");
            $("#poiList").find("li[attr-id='" + marker_id + "']").addClass("selItem");
            $("#poiList").stop().scrollTo("li[attr-id='" + marker_id + "']", 800);
        }

        // this function adds the point of interest to the cache. we should use sorting
        // here aswell in the future. right now we just add it to the array. when the poi
        // is added to the cache, it creates the icons for them, and adds them to the
        // zoom level of the map.
        var add_poi_to_cache = function (poi_item) {
            poi_cache[poi_cache.length] = poi_item; // perhaps no .clone() lets see how this functions
            return poi_cache.length - 1;
        }

        /* 
		* this function is used to test is a point of interest is stored in the cache
        * it is separated so that proper sort can be added in the future for a massive
        * speed improvement
		*/
        var get_poi_cache_index = function (poi_id) {
            var is_caught = false;
            for (var n = 0, len = poi_cache.length; n < len; n++) {
                if (poi_id == poi_cache[n].id) {
                    return n;
                }
            }
            return -1;
        }

        /* this function takes a series of markers included from json, and merges
         * them with the current marker store. it then adds them to the cache if
         * they did not already exist, and then to the marker manager. the cache
         * is available simply to manage the markers to add/remove, and contains
         * a link to the applicable marker in the manager.
         */
        var merge_poi_with_cache = function (poi_array) {
            mapBounds = new google.maps.LatLngBounds();
			poi_cache = [];
			city_array = [];
			$("#poiList").empty();
			oCluster.clearMarkers();
            for (var i = 1; i < poi_array.length; i++) {
                var poiObj = poi_array[i];
                poiObj.id = $.trim(poiObj.Programs.replace(poiObj.Institution_Name, ""));
                //geoAndMakerItem(poiObj, poiObj.State, poiObj.City, poiObj.Address1, poiObj.FullAddress, poiObj.id, poiObj.Institution_Name, i, poi_array.length-1);
				showMarkers(poiObj, i, poi_array.length-1);
            }
            
        }
		function updateLatLng(rowid,lat,lng){
			var query = "update " +
                "1K1WZCqMmIN5EMW5s4CsHUhB90Nl0h4gY4EQcAV0 set latitude="+lat+",longitude="+lng+" Where rowid="+rowid;
            var encodedQuery = encodeURIComponent(query);

            // Construct the URL
            var url = ['https://www.googleapis.com/fusiontables/v1/query'];
            url.push('?sql=' + encodedQuery);
            url.push('&key=AIzaSyC9jGYb1zC5bYMnGsDqERzw6SQKKBEY4PY');
            url.push('&callback=?');

            $.ajax({
                url: url.join(''),
                dataType: 'jsonp',
                type: 'PUT',
                cache: false,
                success: function (data) {
                    console.info(data);
                }
            });
		}
		function getMarkersByFusionTable() {
		    var where = "", orderby="";
		    if (typeof (strwhere) !== "undefined" && strwhere !="") {
		        where = " where " + strwhere;
		    }
		    if (typeof (strorderby) !== "undefined") {
		        orderby = strorderby
		    }
		    if (typeof (strlocation) !== "undefined") {
                where = where + (where =="" ? " where " : " and ");
		        where = where + " ST_INTERSECTS(FullAddress,CIRCLE(LATLNG(" + setmarker.getPosition().lat() + "," + setmarker.getPosition().lng() + ")," + $("#buffer").val() + "))";
                //var sw = map.getBounds().getSouthWest();
                //var ne = map.getBounds().getNorthEast();
                
                //where = where + " ST_INTERSECTS(FullAddress,RECTANGLE(LATLNG(" + sw.lat() + "," + sw.lng() + "),LATLNG(" + ne.lat() + "," + ne.lng() + ")))";
		    }
		 
            var query = "SELECT  'Institution - Link to Programs','Institution Name',State,City,Address1,rowid,FullAddress,'CEO Name','CEO Title','CEO Phone' FROM " +
                "1K1WZCqMmIN5EMW5s4CsHUhB90Nl0h4gY4EQcAV0" + where + orderby; //Where City='Birmingham'
            var encodedQuery = encodeURIComponent(query);

            // Construct the URL
            var url = ['https://www.googleapis.com/fusiontables/v1/query'];
            url.push('?sql=' + encodedQuery);
            url.push('&key=AIzaSyC9jGYb1zC5bYMnGsDqERzw6SQKKBEY4PY');
            url.push('&callback=?');


            // Send the JSONP request using jQuery
            $.ajax({
                url: url.join(''),
                dataType: 'jsonp',
                cache: false,
                success: function (data) {
                    var poiArray = [];
                    var rows = data['rows'];
                    for (var i in rows) {
                        var poiObj = {};
                        var Programs = rows[i][0];
                        var Institution_Name = rows[i][1];
                        var pid = rows[i][5];//$.trim(Programs.replace(Institution_Name, ""));
                        poiObj.State = rows[i][2];
                        poiObj.City = rows[i][3];
                        poiObj.Address1 = rows[i][4];
                        poiObj.FullAddress = rows[i][6];
                        poiObj.id = pid;
                        poiObj.Institution_Name = Institution_Name;
                        poiObj.Programs = Programs;
						poiObj.CEO_Name = rows[i][7];
						poiObj.CEO_Title = rows[i][8];
						poiObj.CEO_Phone = rows[i][9];
                        poiArray.push(poiObj);
                    }
                    merge_poi_with_cache(poiArray);
                }
            });
           
        }

        var searchEventhandler = function () {
            MapSearch($("#locationInput").val(), function (results) {
                //map.fitBounds(results[0].geometry.viewport);
                circle.setRadius(parseInt(jQuery("#buffer").val()));
               
                PleaceMarker(results[0].geometry.location);

                getMarkersByFusionTable();
            })
        }

        var checkBounds = function () {
            var cBounds = circle.getBounds();
			map.fitBounds(cBounds);
            for (var i = 0; i < poi_cache.length; i++) {
                if (cBounds.contains(poi_cache[i].marker.getPosition())) {
                    poi_cache[i].marker.setVisible(true);
                    oCluster.addMarker(poi_cache[i].marker);
                    $(jQuery("#poiList li").get(i)).show();
                } else {
                    poi_cache[i].marker.setVisible(false);
                    oCluster.removeMarker(poi_cache[i].marker);
                    $(jQuery("#poiList li").get(i)).hide();
                }
            }
        }
        var PleaceMarker = function (location, updateAddress) {
            var newlatlng = new google.maps.LatLng(location);
            if (setmarker == null) {
                setmarker = new google.maps.Marker({
                    position: location,
                    map: map,
                    title: "Your place!",
                    //draggable: true,
                    icon: setmarkerImage,
                    cursor: 'pointer'
                })
               
                // Since Circle and Marker both extend MVCObject, you can bind them
                // together using MVCObject's bindTo() method.  Here, we're binding
                // the Circle's center to the Marker's position.
                // http://code.google.com/apis/maps/documentation/v3/reference.html#MVCObject
                circle.bindTo('center', setmarker, 'position');
            }
            
            setmarker.setCursor("pointer");
            setmarker.setPosition(location);
 
            google.maps.event.addListener(setmarker, 'click', function (event) {
                ShowInfoWindow(setmarker, "Point here");
            });

        }

        var ShowInfoWindow = function (marker, content) {
            if (infowindow == null) {
                infowindow = new google.maps.InfoWindow(
					  {
					      content: content,
					      size: new google.maps.Size(500, 500)
					  });
            }
            infowindow.setContent(content);
            infowindow.open(map, marker);
        }
        var MapSearch = function (address, callback) {
            if (address == "")
                return;
            if (geocoder) {
                geocoder.geocode({ 'address': address }, function (results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        if (callback) {
                            callback(results);
                        }
                        else {
                            map.setCenter(results[0].geometry.location);
                            PleaceMarker(results[0].geometry.location);
                            if (circle != null) {
                                map.fitBounds(circle.getBounds());
                            }
                            map.setZoom(13);
                        }
                    } else {
                        console.info("Can not find the place: " + address + " ");
                    }
                });
            }
        }
        /*
		* public method: get the map object
		*/
        this.getmap = function () {
            return map;
        };

        /*
         * public: set Map location parameters 
         */
        this.setMapLocation = function (opts, isUpdate) {
            start_location_lat = opts.start_lat || start_location_lat;
            start_location_lng = opts.start_lng || start_location_lng;
            start_location_zoom = opts.start_zoom || start_location_zoom;
            start_location_type = opts.start_type || start_location_type;

            //update map
            if (isUpdate) {
                map.setCenter(new google.maps.LatLng(start_location_lat, start_location_lng));
                map.setMapTypeId(start_location_type);
                map.setZoom(start_location_zoom);
            }
        }

        /*
         * public: initialize 
         */
        this.initialize = function (opts, callback) {
            if (opts != null) {
                self.setMapLocation(opts);
            }

            init.initMap();
            init.initLoadingBox();
            init.initIcons();
            init.initMarkerManager();

            //alert(map);

            if (callback) {
                callback;
            }
        }
    }
})();
$.ajaxSetup({
    cache: false
});
google.maps.event.addDomListener(window, 'load', new GMap().initialize());

var isSearchPanelOn = false;
var isLocationPanelOn = false;
var isListPanelOn = false;
var isDisclaimerPanelOn = false;
var isEmbedPanelOn = false;
function showSearchPanel() {
    hideAllCompactPanel();
    $('#searchActionMenu').addClass('actionMenuSelected');
    $('#panelOverlay').show();
    $('#searchForm').show('slow');
    isSearchPanelOn = true;
};
function hideSearchPanel() {
    isSearchPanelOn = false;
    $('#searchActionMenu').removeClass('actionMenuSelected');
    $('#searchForm').hide();
};
function showListPanel() {
    hideAllCompactPanel();
    $('#listActionMenu').addClass('actionMenuSelected');
    $('#panelOverlay').show();
    $('#listPanel').show('slow');
    isListPanelOn = true;
};
function hideListPanel() {
    isListPanelOn = false;
    $('#listActionMenu').removeClass('actionMenuSelected');
    $('#listPanel').hide();
};
function hideAllCompactPanel() {
    $('#panelOverlay').hide();
    hideSearchPanel();
    hideListPanel();
};
function toggleSearchPanel() {
    if (isSearchPanelOn) hideSearchPanel();
    else showSearchPanel();
};
function toggleListPanel() {
    if (isListPanelOn) hideListPanel();
    else showListPanel();
};
$(document).ready(function () {
    showListPanel();
})