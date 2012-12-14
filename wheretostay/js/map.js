/**
* wheretostay map js
* 
* Params:default values, can be override by call public method setDefaultOptions
			start_showing_type =['villa','hotel'], // the types array of markers showing when loaded
            start_sidebar_style = "open", // sidebar style [open | close ]
            start_showing_marker = false, // using for a property page, showing certain marker
            start_marker_bigIcon = true, // should set start_showing_marker to true, then this will show a big red icon for the start marker
            start_showing_infowindow = false, // if or not showing infowindow on the start marker
			start_location_lat = 18.185324, //start latitude
            start_location_lng = -63.086750, // start longitiude
            start_location_zoom = 13, // start zoom level
			start_location_type = google.maps.MapTypeId.HYBRID; //map type
*			
*/
(function (window) {
    "use strict";
    window.wheretostay = window.wheretostay || {};
    wheretostay.maps = function () {
        //prop values
        var map,
            customIcons = [],
			markers = [],
			mTypes = [],
			managers = [],
            oVillasMarkersCluster = null,
            oHotelsMarkersCluster = null,
            map_container,
            gMapContainer = "#Gmap",
            gInfowindow = '',
            oMaxBounds = null,
			curmarker = null,
			self = this,
			zoomLevel = 1,
			maxzoom = 5, // markermanager maxzoom param
			hotelClusterShow = false, 
			villaClusterShow = false,
			isUpdateTypeValue = false,
			start_marker = null,
			
            //default values, can be override by call public method setDefaultOptions
			start_showing_type = ['favorites','villa', 'hotel'], // the types array of markers showing when loaded
            start_sidebar_style = "open", // sidebar style [open | close ]
            start_showing_marker = false, // using for a property page, showing certain marker
            start_marker_bigIcon = true, // should set start_showing_marker to true, then this will show a big red icon for the start marker
            start_showing_infowindow = false, // if or not showing infowindow on the start marker
			start_location_lat = 18.185324, //start latitude
            start_location_lng = -63.086750, // start longitiude
            start_location_zoom = 13, // start zoom level
			start_location_type = google.maps.MapTypeId.HYBRID; //map type

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
                    mapTypeId: start_location_type,
					styles: [
						{
							featureType: "poi.business",
							elementType: "all",
							stylers: [
								{ visibility: "off" }
							]
						}
					]
                };

                map_container = $(gMapContainer);
                map = new google.maps.Map(map_container.get(0), myOptions);
            },
            initMapEvent: function () {
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

                google.maps.event.addListener(gInfowindow, 'closeclick', infoWindowCloseHandler);
                //this event only run once, idle evnet will also raise bounds change bounds_changed
                google.maps.event.addListenerOnce(map, 'tilesloaded', tilesLoadedHandler);

            },
            initLoadingBox: function () {
                map_container.append($("<div id='map_loader_box'></div>").css({
                    position: 'absolute',
                    top: '6px',
                    left: '100px',
                    backgroundColor: '#eef',
                    display: 'none',
                    fontSize: '14px',
                    padding: '2px',
                    paddingTop: '0',
                    paddingBottom: '0',
                    'z-index': '59999',
                    fontFamily: 'Arial'
                }).html("<img src='/images/global/loader.white.gif' />Loading Map Data.."));

                var barstyle = start_sidebar_style == "open" ? "listShow" : "listHidden";

                map_container.append($('<div id="sidebar"  class="' + barstyle + '"><div class="map-factsheet" data-type="all"><div class="head all active"><span id="listToggle" style="cursor: pointer;"></span></div></div></div>'));

                insertTypeHtmlByType("favorites");
                insertTypeHtmlByType("villa");
                insertTypeHtmlByType("hotel");

                mapfactSheetEventRegister();
            },
            initIcons: function () {
                /*
                Custom Icon Setup
                */
                var favoriteIcon = 'http://www.wheretostay.com/images/maps/100/default.png';
                var selectedIcon = 'http://www.wheretostay.com/images/maps/pin_48.png';
                var iconHotel = 'http://www.wheretostay.com/images/maps/75/hotels.png';
                var iconVilla = 'http://www.wheretostay.com/images/maps/75/villas.png';
                var iconInn = 'http://www.wheretostay.com/images/maps/75/inns.png';
                var iconAttr = 'http://www.wheretostay.com/images/maps/75/attractions.png';
                var iconDining = 'http://www.wheretostay.com/images/maps/75/restaurants.png';
                var iconBeach = 'http://www.wheretostay.com/images/maps/75/beaches.png';
                var iconMed = 'http://www.wheretostay.com/images/maps/75/medical.png';
                var iconServ = 'http://www.wheretostay.com/images/maps/75/services.png';
                var iconCar = 'http://www.wheretostay.com/images/maps/75/car.png';
                var iconGrocery = 'http://www.wheretostay.com/images/maps/75/grocery.png';
                var iconVideo = 'http://www.wheretostay.com/images/maps/75/video.png';

				/*
				var favoriteIcon = '/images/maps/100/default.png';
                var selectedIcon = '/images/maps/pin_48.png';
                var iconHotel = '/images/maps/75/hotels.png';
                var iconVilla = '/images/maps/75/villas.png';
                var iconInn = '/images/maps/75/inns.png';
                var iconAttr = '/images/maps/75/attractions.png';
                var iconDining = '/images/maps/75/restaurants.png';
                var iconBeach = '/images/maps/75/beaches.png';
                var iconMed = '/images/maps/75/medical.png';
                var iconServ = '/images/maps/75/services.png';
                var iconCar = '/images/maps/75/car.png';
                var iconGrocery = '/images/maps/75/grocery.png';
                var iconVideo = '/images/maps/75/video.png';*/
				
                var baseIcon = new google.maps.MarkerImage('/images/maps/75/default.png', new google.maps.Size(24, 32));
                //using dot style property
                customIcons.favorites = favoriteIcon;
                customIcons.selectedIcon = selectedIcon;
                customIcons.hotel = iconHotel
                customIcons.villa = iconVilla;
                customIcons.inn = iconInn;
                customIcons.attractions = iconAttr;
                customIcons.dining = iconDining;
                customIcons.beach = iconBeach;
                customIcons.medical = iconMed;
                customIcons.service = iconServ;
                customIcons.car = iconCar;
                customIcons.grocery = iconGrocery;
                customIcons.video = iconVideo;

            },
            initMarkerManager: function () {
                //new villa cluster object
                oVillasMarkersCluster = new MarkerClusterer(
					map, [], {
					    gridSize: 70,
					    maxZoom: 15,
					    styles: [{
					        'url': "http://www.wheretostay.com/images/maps/cluster_villa.png",
					        'height': 38,
					        'width': 67,
					        'anchor': [5, 40]
					    }]
					});

                //new hotel cluster object
                oHotelsMarkersCluster = new MarkerClusterer(
                map, [], {
                    gridSize: 70,
                    maxZoom: 15,
                    styles: [{
                        'url': "http://www.wheretostay.com/images/maps/cluster_hotel.png",
                        'height': 38,
                        'width': 67,
                        'anchor': [5, 40]
                    }]
                });
            },

        };

        /**
		* map tilesloaded event handler
		*/
        var tilesLoadedHandler = function () {
            oMaxBounds = map.getBounds();
            load_markers(oMaxBounds, oMaxBounds, true, function () {
                if (start_showing_marker) {
                    var mLatlng = new google.maps.LatLng(start_location_lat, start_location_lng);
                    self.selectMarkerByPoint(mLatlng, start_location_zoom, null);
                    toggleSidebar(start_sidebar_style);
                }
            });
            self.load_markers_favorite();
            //listen idle evnet
            google.maps.event.addListener(map, 'idle', MoveEndListener);
        }


		/**
		* infoWindow close event handler
		*/
		var infoWindowCloseHandler = function () {
			if(curmarker != null){
				var type = curmarker.type;
				var typeUl = $("#sidebar").find("div.map-factsheet[data-type='" + type + "']");
				var listUL = typeUl.find("ul.map-list[data-type='" + type + "']");
				if (listUL.find("li.selItem").length > 0) {
					listUL.find("li.selItem").removeClass("selItem");
				}
				
				curmarker.isolated = false;
				curmarker = null;
			}
		}
        /**
		 * map move end listener
		 *
		 * @private
		 */
        var MoveEndListener = function () {
            //we now have the current and previous bounderies, but we do not want to load up everything.
            // but what if they zoom out? then we could have 4 different bounderies that are invalidated
            // we need to go through and produce multiple bounderies
            var rects_to_load = new Array();
            var new_bounds = map.getBounds();

            var old_bounds = new google.maps.LatLngBounds(oMaxBounds.getSouthWest(), oMaxBounds.getNorthEast()); // this way copy the old bounds

            var new_sw = new_bounds.getSouthWest();
            var new_ne = new_bounds.getNorthEast();

            //extend the old bounds
            if (!oMaxBounds.contains(new_sw) || !oMaxBounds.contains(new_ne)) {
                oMaxBounds.extend(new_sw);
                oMaxBounds.extend(new_ne);

                $('#map_loader_box').show().fadeTo('fast', '0.9');
                load_markers(oMaxBounds, old_bounds, true);
            } else {
                setTimeout(function(){showOrHideMarkerCluster()},10);
				if ($("#sidebar").hasClass("listShow")) {
					setTimeout(function(){updateTypeValues()},50);
					isUpdateTypeValue = true;
				}else{
					isUpdateTypeValue = false;
				}
            }
        };

        /**
		* map legend event register
		*/
        var mapfactSheetEventRegister = function () {
            $(".map-factsheet .villa .type-cb").live("click", function () {
                var $divhead = $(this).parent();
                if ($divhead.hasClass("active")) {
                    if ($("#sidebar").hasClass("listShow")) {

                        $divhead.parent().find(".map-list").slideUp(function () {
                            oVillasMarkersCluster.clearMarkers();
                            $divhead.find(".direction").removeClass("diropen").addClass("dirclose");
                        });

                    } else {
                        oVillasMarkersCluster.clearMarkers();
						$divhead.find(".direction").removeClass("diropen").addClass("dirclose");
                    }
					villaClusterShow = false;
                    $divhead.removeClass("active");
                } else {
                    var ms = getMarkers("villa");
                    if ($("#sidebar").hasClass("listShow")) {
                        $divhead.parent().find(".map-list").slideDown(function () {
                            oVillasMarkersCluster.addMarkers(ms);
							$divhead.find(".direction").removeClass("dirclose").addClass("diropen");
                        });
                        
                    } else {
                        oVillasMarkersCluster.addMarkers(ms);
						$divhead.find(".direction").removeClass("dirclose").addClass("diropen");
                    }
					villaClusterShow = true;
                    $divhead.addClass("active");
                }
            });
            $(".map-factsheet .hotel .type-cb").live("click", function () {
                var $divhead = $(this).parent();
                if ($divhead.hasClass("active")) {
                    if ($("#sidebar").hasClass("listShow")) {
                        $divhead.parent().find(".map-list").slideUp(function () {
                            oHotelsMarkersCluster.clearMarkers();
                            $divhead.find(".direction").removeClass("diropen").addClass("dirclose");
                        });

                    } else {
                        oHotelsMarkersCluster.clearMarkers();
						$divhead.find(".direction").removeClass("diropen").addClass("dirclose");
                    }
					hotelClusterShow = false;
                    $divhead.removeClass("active");
                } else {
                    var ms = getMarkers("hotel");
                    if ($("#sidebar").hasClass("listShow")) {
                        $divhead.parent().find(".map-list").slideDown(function () {
                            oHotelsMarkersCluster.addMarkers(ms);
                            $divhead.find(".direction").removeClass("dirclose").addClass("diropen");
                        });

                    } else {
                        oHotelsMarkersCluster.addMarkers(ms);
						$divhead.find(".direction").removeClass("dirclose").addClass("diropen");
                    }
					hotelClusterShow = true;
                    $divhead.addClass("active");
                }
            });
            //other types event, we use markermanger for the other type
            $(".map-factsheet div.head[isother='1'] .type-cb").live("click", function () {
                var $divhead = $(this).parent();
                if ($divhead.attr("diable") == "true") {
                    return false;
                }
                var type = $divhead.attr("otype");
                if ($divhead.hasClass("active")) {
                    showorhideMarkers('hide',type);
                    if ($("#sidebar").hasClass("listShow")) {
                        $divhead.parent().find(".map-list").slideUp(function () {

                        });
                    }
                    $divhead.find(".direction").removeClass("diropen").addClass("dirclose");
                    $divhead.attr("oactive", "").removeClass("active");
                } else {
                    showorhideMarkers('show',type);
                    if ($("#sidebar").hasClass("listShow")) {
                        $divhead.parent().find(".map-list").slideDown();
                    }
                    $divhead.attr("oactive", "active").addClass("active");
                    $divhead.find(".direction").removeClass("dirclose").addClass("diropen");
                }
            });
			
			//direction icon click event
            $(".map-factsheet .direction").live("click", function () {
                if ($(this).hasClass("diropen")) {
                    $(this).parent().parent().find(".map-list").slideUp();
                    $(this).removeClass("diropen").addClass("dirclose");
                } else {
                    $(this).parent().parent().find(".map-list").slideDown();
                    $(this).removeClass("dirclose").addClass("diropen");
                }
            });
            // click event for each li element
            jQuery("#sidebar .map-factsheet li").live("click", function () {
                if (!$(this).parent().parent().find("div.head").hasClass("active")) {
                    return false;
                }
                var type = $(this).parent().attr("data-type");
                var mid = $(this).attr("attr-id");
                if ($(this).hasClass("selItem")) {
                    $(this).removeClass("selItem");
					//addToCluster(curmarker);
					curmarker.isolated = false;
					curmarker = null;
                    gInfowindow.close();
                } else {

                    var marker = get_marker(type, mid);
                    if (marker == null) return;

                    google.maps.event.trigger(marker, "click");
                    //marker.setAnimation(google.maps.Animation.BOUNCE);
                    if (type != "villa" && type != "hotel") {
                        //map.panTo(marker.getPosition());
                        google.maps.event.trigger(map, 'dragend');
                    }
                }

            });

            // click event show or hide sidebar
            $("#listToggle").bind("click", toggleSidebarHandler);
        }

        /**
		 * show or hide side bar 
		 */
        var toggleSidebarHandler = function () {
            var bar = $("#sidebar");
            if (bar.hasClass("listHidden")) {
                bar.animate({ 'width': '220px' }, 500, function () {
                    bar.removeClass("listHidden").addClass("listShow");
					if(!isUpdateTypeValue){
						setTimeout(function(){updateTypeValues()},50);
						isUpdateTypeValue = true;
					}
                });

                $("ul.map-list").parent().each(function (i, obj) {
                    if ($(obj).find("div.head").hasClass("active") || $(obj).find("span.direction").hasClass("diropen") ) {
                        $(obj).find("ul.map-list").show();
                    } else {
                        $(obj).find("ul.map-list").hide();
                    }
                })
					
            } else {

                bar.animate({ 'width': '116px' }, 500, function () {
                    bar.removeClass("listShow").addClass("listHidden");
                });
                $("ul.map-list").parent().each(function (i, obj) {
                    $(obj).find("ul.map-list").hide();
                })
            }
        }

        /**
		 * show or hide side bar 
		 */
        var toggleSidebar = function (style) {
            if (style == "open") {
                $("#sidebar").css({ 'width': '220px' });
                $("ul.map-list").parent().each(function (i, obj) {
                    if ($(obj).find("div.head").hasClass("active")) {
                        $(obj).find("ul.map-list").show();
                    } else {
                        $(obj).find("ul.map-list").hide();
                    }
                })
            } else {
                $("#sidebar").css({ 'width': '116px' });
                $("ul.map-list").hide();
            }
        }

        
        function showFavoriteMarkersOnMap(data) {
            var type = "favorites";
            for (var i = 0; i < data.length; i++) {
                var poi = data[i];
				var n = get_markers_index(type, poi.id);
                if (n == -1) {
					var certainPoint = false;
					var title = ((typeof poi.property_name != "undefined" && poi.property_name != "") ? poi.property_name : 
						(typeof poi.title != "undefined" && poi.title != "") ? poi.title : poi.type + poi.id);
					var lat = 	(typeof poi.lat != "undefined" && poi.lat != "") ? parseFloat(poi.lat) : 0.0; 
					var lng = 	(typeof poi.lng != "undefined" && poi.lng != "") ? parseFloat(poi.lng) : 0.0; 

					var mkr = createMarker(
						new google.maps.LatLng(lat, lng),
						type, poi.type,
						poi.id, title, 999,
						certainPoint
					);
					//push marker to the markers object
					mkr.setMap(map);
					pushMarker(type, mkr);

					insertListHtml(type, poi.id, title);
				}
            }
        }
        /**
		 * this is the ajax powered function which loads the markers through json_onscroll.
		 *
		 * @param {GBounds} bounds: Marker to be added to the map
		 * @param {Boolean} reset_viewport: if reset viewport
		 *
		 * @private
		 */
        var load_markers = function (bounds, old_bounds, reset_viewport, callback) {
            if (map.load_count == 0) {
                $('#map_loader_box').fadeIn('slow');
            }
            map.load_count++;
            var getVars = '';
            //get the bounds ne and sw value, so we can only get pins within this bounds
            if (bounds instanceof google.maps.LatLngBounds) {
                var southWest = bounds.getSouthWest().toUrlValue();
                var northEast = bounds.getNorthEast().toUrlValue();
            } else {
                var oBounds = bounds[bounds.length - 1];
                var southWest = oBounds.getSouthWest().toUrlValue();
                var northEast = oBounds.getNorthEast().toUrlValue();
            }
            var old_sw = southWest;
            var old_ne = northEast;
            if (old_bounds instanceof google.maps.LatLngBounds) {
                old_sw = old_bounds.getSouthWest().toUrlValue();
                old_ne = old_bounds.getNorthEast().toUrlValue();
            }

			jQuery.getJSON("js/pins.json", function (data) {
            //jQuery.getJSON("/maps/new_get_pins/" + old_ne + ":" + old_sw + "/" + northEast + ":" + southWest, function (data) {
                map.load_count--;
                if (map.load_count == 0) {
                    $('#map_loader_box').fadeOut('slow');
                }

                //show markers on map and update category html
                showMarkersOnMaps(data.markers);

				setTimeout(function(){showOrHideMarkerCluster()},10);
                //insertTypeHtml();
                if ($("#sidebar").hasClass("listShow")) {
					setTimeout(function(){updateTypeValues()},50);
					isUpdateTypeValue = true;
				}else{
					isUpdateTypeValue = false;
				}

                if (callback) {
                    callback(data);
                }
                $('#map_loader_box').fadeOut('fast');
            });
        };

        /**
		 *	show poi array to the markers array
		 *
		 * @param {Array} poi_array: poi array from server
		 */
        var showMarkersOnMaps = function (poi_array) {
            for (var i = 0; i < poi_array.length; i++) {
                var poi = poi_array[i];
                var n = get_markers_index(poi.type, poi.id);

                if (n == -1) {
                    var certainPoint = false;
                    var title = ((typeof poi.property_name != "undefined" && poi.property_name != "") ? poi.property_name : 
					(typeof poi.title != "undefined" && poi.title != "") ? poi.title : poi.type + poi.id);
                    var mkr = createMarker(
						new google.maps.LatLng(poi.lat, poi.lng),
						poi.type, poi.type,
						poi.id, title, 998,
						certainPoint
					);
                    //push marker to the markers object
                    pushMarker(poi.type, mkr);
					
					switch (poi.type) {
                        case 'hotel':
                            if(hotelClusterShow){oHotelsMarkersCluster.addMarker(mkr);}
                            break;
                        case 'villa':
                            if(villaClusterShow){oVillasMarkersCluster.addMarker(mkr);}
                            break;
                        default:
                            break;
                    }

                    insertListHtml(poi.type, poi.id, title);
                }
            }
        };
		/**
		 *	show markers
		 */
		function showorhideMarkers(show,type){
			var mkrArr = getMarkers(type);
			var mapBounds = map.getBounds();
            for (var k = 0; k < mkrArr.length; k++) {
                if (!mkrArr[k]) { continue };
                if (mapBounds.contains(mkrArr[k].getPosition())) {
					if(show =='show'){
						mkrArr[k].getMap() == null? mkrArr[k].setMap(map) : "";
					}else{
						mkrArr[k].getMap() != null ? mkrArr[k].setMap(null): "";
					} 
                } else {
					mkrArr[k].getMap() != null ? mkrArr[k].setMap(null): "";
                }
            } 
		}

        /**
		 *	show or hide cluster and manager according to the checkbox value
		 */
        var showOrHideMarkerCluster = function () {
			
			if ($(".map-factsheet .hotel").length > 0 && $(".map-factsheet .hotel").hasClass("active")) {
				if(!hotelClusterShow){
					oHotelsMarkersCluster.clearMarkers();
					oHotelsMarkersCluster.addMarkers(getMarkers("hotel"));
					hotelClusterShow = true;
				}
			}else{
				if(hotelClusterShow){
					oHotelsMarkersCluster.clearMarkers();
					hotelClusterShow = false;
				}
			}

			if ($(".map-factsheet .villa").length > 0 && $(".map-factsheet .villa").hasClass("active")) {
				if(!villaClusterShow){
					oVillasMarkersCluster.clearMarkers();
					oVillasMarkersCluster.addMarkers(getMarkers("villa"));
					villaClusterShow = true;
				}
			}else{
				if(villaClusterShow){
					oVillasMarkersCluster.clearMarkers();
					villaClusterShow = false;
				}
			}
			
			
            $(".map-factsheet div.head[isother='1']").each(function (i, obj) {
                var type = $(obj).attr("otype");
                if ($(obj).hasClass("active")) {
                    showorhideMarkers('show',type);
                } else {
                    showorhideMarkers('hide',type);
                }
            })
        }

        /**
		*	expands a bounds by so many lat/lng in order to avoid things such as floating point error
		*
		* @param {GBounds} bounds: google map bounds
		* @param {Double} degree_buffer: extend bounds value
		* @return {GBounds}
		*/
        var expandBounds = function (bounds, degree_buffer) {
            return new google.maps.LatLngBounds(
                    new google.maps.LatLng(
                        bounds.getSouthWest().lat() - degree_buffer,
                        bounds.getSouthWest().lng() - degree_buffer),
                    new google.maps.LatLng(
                        bounds.getNorthEast().lat() + degree_buffer,
                        bounds.getNorthEast().lng() + degree_buffer));
        };

        /**
        * create the marker object
		* @Return: marker
        */
        var createMarker = function (point, type, org_type, id, title, zIndex, certainPoint) {
            if (certainPoint) {
                var marker = new google.maps.Marker({
                    position: point,
                    title: title,
                    zIndex: zIndex || 99
                });
            } else {
                var mkerImage = type == "favorites" ? new google.maps.MarkerImage(customIcons[type], new google.maps.Size(32, 43)) : new google.maps.MarkerImage(customIcons[type], new google.maps.Size(24, 32));
                var marker = new google.maps.Marker({
                    position: point,
                    icon: mkerImage,
                    title: title,
					draggable: true,
                    zIndex: zIndex || 99
                });
            }
			marker.org_type = org_type;
            marker.type = type;
            marker.id = id;

            google.maps.event.addListener(marker, 'click', function () {
                //for cluster markers, set them visible
                if (marker.getMap() == null) {
                    map.setZoom(17);
                }
                //reset previous curmarker
				if(curmarker != null){
					curmarker.isolated = false;
				}
                map.panTo(marker.getPosition());
 
				curmarker = this;	
				curmarker.isolated = true;
				// load up the proper info window
				selectMarker(this);
				selectItemDiv(this.type,this.id);
            });

            return marker;
        };

        var selectItemDiv = function (type,marker_id) {
            $("#sidebar .map-factsheet li.selItem").removeClass("selItem");
			if($("#sidebar .map-factsheet ul[data-type='"+type+"']").find("li[attr-id='" + marker_id + "']").length==1){
				$("#sidebar .map-factsheet ul[data-type='"+type+"']").find("li[attr-id='" + marker_id + "']").addClass("selItem");
				$("#sidebar").stop().scrollTo("ul[data-type='"+type+"'] li[attr-id='" + marker_id + "']", 800);
			}
        }

		/**
        * to keep the selected marker always showing, remove it from cluster
		*		
		* @param {GMarker} marker: google.maps.Marker
        */
		var removeFromCluster =  function(mkr){
			if(mkr == null) return;
			var type = mkr.type;
			if (type =='hotel') {
				oHotelsMarkersCluster.removeMarker(mkr);
				mkr.setMap(map);
				
				var ms = getMarkers(type);
				var n = get_markers_index(mkr.type,mkr.id);
				ms = ms.splice(n,1);
			
			}else if (type =='villa') {
				oVillasMarkersCluster.removeMarker(mkr);
				mkr.setMap(map);
				
				var ms = getMarkers(type);
				var n = get_markers_index(mkr.type,mkr.id);
				ms = ms.splice(n,1);
			}
			
		}
		
		/**
        * to keep the selected marker always showing, remove it from cluster, this method readd to cluster
		*		
		* @param {GMarker} marker: google.maps.Marker
        */
		var addToCluster =  function(mkr){
			if(mkr == null) return;
			var type = mkr.type;
			if (type =='hotel') {
				mkr.setMap(null);
				oHotelsMarkersCluster.addMarker(mkr);
				
				var ms = getMarkers(type);
				ms.push(mkr);
			}else if (type =='villa') {
				mkr.setMap(null);
				oVillasMarkersCluster.addMarker(mkr);
				
				var ms = getMarkers(type);
				ms.push(mkr);
			}
		}
		
		/**
        * to keep the selected marker always showing, remove it from cluster, so when show or hide type, also include these markers
		*		
		* @param {type} String: marker type
		* @param {show} Boolean: show or hide this type
        */
		var showorhideMakerRemoved =  function(type,show){
			if(curmarker != null && curmarker.type === type){
				show ? curmarker.setMap(map) : curmarker.setMap(null);
			}
			if(start_marker != null && start_marker.type === type){
				show ? start_marker.setMap(map) : start_marker.setMap(null);
			}
		}
		
        /**
        * show info window content
		*		
		* @param {GMarker} marker: google.maps.Marker
        */
        var selectMarker = function (marker) {
            // next we want to open the ext window		
            //gInfowindow.setContent("<div style='height:100px;width:300px;'><img src='/images/global/loading-lrg-black.gif' /></div>");
            //gInfowindow.open(map, marker);

            var marker_type = marker.org_type,
			marker_id = marker.id;

			$.get("js/detail.txt", function (data) {
            //$.get("/maps/markerbubble/" + marker_type + "/" + marker_id, function (data) {
                gInfowindow.setContent(data);
				gInfowindow.open(map, marker);
            });
        }


        /**
        * get marker object according to the provided map point
		* if provide type, it will be more faster to find the marker.
		* First it will find which array contain the type's markers, then find the marker in the type's markers array
		*
		* @param {GPoint} point: google.maps.LatLng
		* @param {String} type: type(hotel,villa..etc)
		* @Return: marker
        */
        var getMarkerAtPoint = function (point, type) {
            //if type, then find markers in certain type
            if (type != null) {
                return getMarkerAtPointByType(point, type);
            }

            //if type is null, then find all markers in all types
            for (var i = 0; i < mTypes.length; i++) {
                var type = mTypes[i];
                var mkr = getMarkerAtPointByType(point, type);
                if (mkr != null) {
                    return mkr;
                }
            }
            // point is not in there
            return null;
        };

        /**
        * get marker object according to the provided map point and type
		* 
		* @param {GPoint} point: google.maps.LatLng
		* @param {String} type: type(hotel,villa..etc)
		* @Return {GMarker} marker
        */
        var getMarkerAtPointByType = function (point, type) {
            var mkrs = getMarkers(type);
            for (var n = 0; n < mkrs.length; n++) {
                if (point.equals(mkrs[n].getPosition())) {
                    return mkrs[n];
                }
            }
            // point is not in there
            return null;
        }

        /**
        * get marker index according to the provided id and type
		* 
		* @param {String} poi_type
		* @param {String} poi_id
		* @Return {Number} n
        */
        var get_markers_index = function (poi_type, poi_id) {
            var ms = getMarkers(poi_type);
            for (var n = 0, len = ms.length; n < len; n++) {
                if (poi_id == ms[n].id) {
                    return n;
                }
            }
            return -1;
        };

        /**
       * get marker according to the provided id and type
       * 
       * @param {String} poi_type
       * @param {String} poi_id
       * @Return {GMarker} n
       */
        var get_marker = function (poi_type, poi_id) {
            var ms = getMarkers(poi_type);
            for (var n = 0, len = ms.length; n < len; n++) {
                if (poi_id == ms[n].id) {
                    return ms[n];
                }
            }
            return null;
        };

        /**
		 *	push marker to markers array.
		 */
        var pushMarker = function (type, mkr) {
            //select which arrry to push
            var n = selectTypeIndex(type);
            if (n == -1) {
                n = add_type(type);
            }
            markers[n].push(mkr);
        }

        /**
		 *	push type to mTypes array.
		 *
		 * @param {String} type.
		 */
        var add_type = function (type) {
            mTypes[mTypes.length] = type;
            markers[markers.length] = [];
            return mTypes.length - 1;
        };

        /**
		 *	get the index of mTypes by type name
		 */
        var selectTypeIndex = function (type) {
            for (var i = 0; i < mTypes.length; i++) {
                if (type == mTypes[i]) {
                    return i;
                }
            }
            return -1;
        }

        /**
		 *	get markers by type
		 *
		 * @param {String} type.
		 */
        var getMarkers = function (type) {
            //select which arrry to push
            var n = selectTypeIndex(type);
            if (n == -1) {
                return [];
            }
            return markers[n];
        }


        /**
		 *	check if currnet map zoom should show the certain markers 
		 */
        var getIsActive = function (type) {
            //return map.getZoom() >= maxzoom ? "active" : "";
            for (var i = 0; i < start_showing_type.length; i++) {
                if (start_showing_type[i] == type) {
                    return "active";
                }
            }
            return "";
        }

        var upperText = function (str) {
            return str.slice(0, 1).toUpperCase() + str.slice(1);
        }

        /**
		 *	append li html by all types
		 */
        var insertTypeHtml = function () {
            var isactive;
            for (var i = 0; i < mTypes.length; i++) {
                var type = mTypes[i];
                var html = "";
                if (type == "hotel" || type == "villa") {
                    isactive = "active";
                    html = 'isother="0"';
                } else {
                    isactive = getIsActive(type);
                    //var disable = map.getZoom() >= maxzoom ? "" : " diable='true'";
                    html = 'oactive="active" otype="' + type + '" isother="1" ';
                }
                if ($(".map-factsheet ." + type).length == 0) {
                    $(".map-factsheet").append('<li class="' + type + ' ' + isactive + '" ' + html + '>'
					+ '<span class="name">' + upperText(type) + '</span><span class="cb"></span><span class="value">0</span></li>');
                }
            }
        }
        function insertTypeHtmlByType(type) {
            var typeUl = $("#sidebar").find("div.map-factsheet[data-type='" + type + "']");
            var html = "";
            var isactive = getIsActive(type);
            if (type == "hotel" || type == "villa") {
                //isactive = "active";
                html = 'oactive="" otype="' + type + '" isother="0"';
            } else {
                //no disable
                //var disable = ""; //map.getZoom() >= maxzoom ? "" : "diable='true'";
                html = 'oactive="" otype="' + type + '" isother="1" ';
            }
            var ulhidecss = $("#sidebar").hasClass("listShow") && isactive == "active" ? "" : "hide";
            //var headactive = $("#sidebar").hasClass("listShow") && isactive == "active"? "active" : "";
            var liststyle = isactive == "active" ? "diropen" : "dirclose";
            if (typeUl.length == 0) {
                typeUl = $('<div class="map-factsheet" data-type="' + type + '">'
				+ '<div class="head ' + type + ' ' + isactive + '" ' + html + '>'
				+ '<div class="type-cb"><span class="cb"></span><img src="' + customIcons[type] + '"/><span class="name">' + upperText(type) + '</span></div>'
				+ '<span class="direction ' + liststyle + '"></span><span class="value">0</span></div><ul class="map-list ' + ulhidecss + '" data-type="' + type + '"></ul></div>');
                $("#sidebar").append(typeUl);
            }
        }

        var insertListHtml = function (type, id, title) {
			insertTypeHtmlByType(type);
			var typeUl = $("#sidebar").find("div.map-factsheet[data-type='" + type + "']");
			var listUL = typeUl.find("ul.map-list[data-type='" + type + "']");
			if (listUL.length == 0) {
				var isactive = getIsActive(type);
				var ulhidecss = $("#sidebar").hasClass("listShow") && isactive == "active" ? "" : "hide";
				listUL = $('<ul class="map-list ' + ulhidecss + '" data-type="' + type + '"></ul>');
				typeUl.append(listUL);
			}				
			
			var formatHtml = formatLiHtml(id,title);
            listUL.append(formatHtml);
        }
		/**
		 *	format li html
		 */
		var formatLiHtml = function(id, title){
			var formatTitle = title.length >28 ? title.substr(0,28)+".." : title;
            return '<li attr-id="' + id + '" title="'+ title +'">' + formatTitle + '</li>';
		}
		/**
		 *	this new method remove all li html and then recreate all
		 */
		var updateListHtmlInViewPort = function (type, html) {
			var typeUl = $("#sidebar").find("div.map-factsheet[data-type='" + type + "']");
			var listUL = typeUl.find("ul.map-list[data-type='" + type + "']");
			if (listUL.length == 0) {
				var isactive = getIsActive(type);
				var ulhidecss = $("#sidebar").hasClass("listShow") && isactive == "active" ? "" : "hide";
				listUL = $('<ul class="map-list ' + ulhidecss + '" data-type="' + type + '"></ul>');
				typeUl.append(listUL);
			}				
			
			listUL.empty().html(html);
        }
        /**
		 *	set type pins count to the li element
		 */
        var setTypeValue = function (type, value) {
            $(".map-factsheet[data-type='" + type + "'] div.head").find("span.value").text(value);
        };

        /**
		 *	set type pins count to the li element
		 */
        var updateTypeValues_all = function () {
            var total = 0;
            for (var i = 0; i < mTypes.length; i++) {
                var type = mTypes[i];
                if (type === "favorites") { continue; }
                var index = selectTypeIndex(type);
                var len = markers[index].length;
                total += len;
                setTypeValue(type, len); // set type's pins count
            }
            //setTypeValue("all", total); // set total count
        }

        /**
		 *	set type pins count to the li element (only in map viewport)
		 */
        var updateTypeValues = function (type) {
			if(type != null){
				var mkrArr;
                var index = selectTypeIndex(type);
                mkrArr = markers[index];
				if(mkrArr != null){
					setTypeValue(type, mkrArr.length); // set type's pins count	
				}
				if ($("#sidebar").hasClass("listShow") && curmarker != null) {
					selectItemDiv(curmarker.type,curmarker.id);
				}
				return;
			}
            var total = 0;
            for (var i = 0; i < mTypes.length; i++) {
                var type = mTypes[i];      
                var mkrArr;
                var index = selectTypeIndex(type);
                mkrArr = markers[index];   

                if (type === "favorites") {
                    setTypeValue(type, mkrArr.length); // set type's pins count	
                } else {
                    var subCount = getVisiableMarkersCountNew(type, mkrArr);
                    setTypeValue(type, subCount); // set type's pins count	
                    total += subCount;
                }
            }
							
			if ($("#sidebar").hasClass("listShow") && curmarker != null) {
				selectItemDiv(curmarker.type,curmarker.id);
			}
        }
        //get getVisiableMarkersCount
		// this method is a little slow when a large number of markers, so replace with then new function getVisiableMarkersCountNew
        var getVisiableMarkersCount = function (type, mkrArr) {
            var subCount = 0;
            var mapBounds = map.getBounds();
            for (var k = 0; k < mkrArr.length; k++) {
                if (!mkrArr[k]) { continue };
                var $li = $("#sidebar .map-factsheet[data-type='" + type + "']").find("li[attr-id='" + mkrArr[k].id + "']");
                if (mapBounds.contains(mkrArr[k].getPosition())) {
                    subCount++;
                    $li.show();
                } else {
                    $li.hide();
                }
            }
            return subCount;
        }
		//remove all and recreate html
		var getVisiableMarkersCountNew = function (type, mkrArr) {
            var subCount = 0;
            var mapBounds = map.getBounds();
			var liHtml = "";
            for (var k = 0; k < mkrArr.length; k++) {
                if (!mkrArr[k]) { continue };
                if (mapBounds.contains(mkrArr[k].getPosition())) {
                    subCount++;
                    liHtml += formatLiHtml(mkrArr[k].id, mkrArr[k].title);
                }
            }
			updateListHtmlInViewPort(type,liHtml);
            return subCount;
        }
        /**
		 * get the map object
		 *
		 * @return {Map}  google map object.
		 */
        self.getmap = function () {
            return map;
        };

        /**
        * set Map location parameters 
        *
        * @param {Object} opts: {}
        * @param {Boolean} isUpdate: update map location and zoom after set the map params
        */
        self.setDefaultOptions = function (opts, isUpdate) {
            start_location_lat = opts.start_location_lat || start_location_lat;
            start_location_lng = opts.start_location_lng || start_location_lng;
            start_location_zoom = parseInt(opts.start_location_zoom) || start_location_zoom;
            start_location_type = eval(opts.start_location_type) || start_location_type;
            start_showing_marker = opts.start_showing_marker || start_showing_marker;
            start_marker_bigIcon = opts.start_marker_bigIcon || start_marker_bigIcon;
            start_showing_infowindow = opts.start_showing_infowindow || start_showing_infowindow;
            start_sidebar_style = opts.start_sidebar_style || start_sidebar_style;
            start_showing_type = opts.start_showing_type || start_showing_type;
            //update map
            if (isUpdate) {
                map.setCenter(new google.maps.LatLng(start_location_lat, start_location_lng));
                map.setMapTypeId(start_location_type);
                map.setZoom(start_location_zoom);
            }
        };

        /**
		 * init map only
		 *
		 * @param {Object} opts: {}
		 * @param {Function} callback
		 */
        self.initialize = function (opts, callback) {
            if (opts != null) {
                self.setDefaultOptions(opts);
            }
            if (map == null) {
                init.initMap();
            }
            if (callback) {
                callback;
            }
        };

        /**
		 * init map and load markers via ajax
		 *
		 * @param {Object} opts: {}
		 * @param {Function} callback
		 */
        self.initAndLoad = function (opts, callback) {
            if (opts != null) {
                self.setDefaultOptions(opts);
            }
            if (map == null) {
                init.initMap();
            }
            init.initMapEvent();
            init.initIcons();
            init.initLoadingBox();
            init.initMarkerManager();

            if (callback) {
                callback;
            }
        };
		
		self.load_markers_favorite = function (callback) {
            //jQuery.getJSON("/my/get_favorite_list", function (data) {
            jQuery.getJSON("js/favorites.json?t=26", function (data) {
                //show markers on map and update category html
                showFavoriteMarkersOnMap(data.markers);
				updateTypeValues("favorites");
                //insertTypeHtml();
                if (typeof callback === "function") {
                    callback(data);
                }
            });
        }
        /**
		 * select Marker by point
		 *
		 * @param {Point} point: The google map point
		 * @param {Number} zoomlevel: zoom value
		 * @param {String} type
		 */
        self.selectMarkerByPoint = function (point, zoomlevel, type) {
			if (start_marker != null) {
				start_marker.isolated = false;
			}
            // checks if there is a marker at the point, and if not, it attempts to
            // load the selected marker from the database, and then clicks it.
            start_marker = getMarkerAtPoint(point, type);

            if (start_marker === null) {
                if (oMaxBounds == null) {
                    oMaxBounds = map.getBounds();
                }
                var old_bounds = new google.maps.LatLngBounds(oMaxBounds.getSouthWest(), oMaxBounds.getNorthEast());
                if (!oMaxBounds.contains(point)) {
                    oMaxBounds.extend(point);
                }

                load_markers(
					old_bounds, oMaxBounds,
					true,
					function (data) {
					    var start_marker = getMarkerAtPoint(point, type);
					    if (start_marker === null) {
					        map.setCenter(point);
					    } else {
					        if (zoomlevel) { map.setZoom(zoomlevel); }
					        if (start_marker_bigIcon) {
					            map.setCenter(point);
					            start_marker.setIcon(customIcons.selectedIcon);
					        }
					        if (start_showing_infowindow) {
					            google.maps.event.trigger(start_marker, "click");
					        }
							start_marker.isolated = true;
					    }
					});
            } else {
                if (zoomlevel) { map.setZoom(zoomlevel); }
                if (start_marker_bigIcon) {
                    map.setCenter(point);
                    start_marker.setIcon(customIcons.selectedIcon);
                }
                if (start_showing_infowindow) {
                    google.maps.event.trigger(start_marker, "click");
                }
				start_marker.isolated = true;
            }
        };

        /**
        * load Markers in current bounds
        *
        * @param {Function} callback
        */
        self.loadMarkers = function (callback) {
            if (oMaxBounds == null) {
                oMaxBounds = map.getBounds();
            }
            load_markers(oMaxBounds, oMaxBounds, true, callback);
        };

        /**
        * zoom the map to certain location
        *
        * @param {String} f: coords, format(latitude:longitude:zoom), eg:18.257557:-62.996464:13
        */
        self.zoomto = function (f) {
            if (f != '') {
                var coords = f.split(":");
                map.setZoom(coords[2] * 1);
                map.panTo(new google.maps.LatLng(coords[0], coords[1]));
            }
        };

        /**
        * zoom the map to certain pin and show prop infomation window
        *
        * @param {String} f: coords, format(latitude:longitude:zoom), eg:18.257557:-62.996464:13
        * @param {String} type: hotel or villa or beach etc
        */
        self.zoomMe = function (f, type) {
            if (f != '') {
                var coords = f.split(":");
                var point = new google.maps.LatLng(coords[0], coords[1]);
                var zoom = coords[2] * 1;
                map.setZoom(zoom);
                map.setCenter(point);
                self.selectMarkerByPoint(point, zoom, type);
            }
        };
    }

    window.wheretostayMap = new wheretostay.maps();
    window.zoomMe = wheretostayMap.zoomMe;
    window.Markers = wheretostayMap.Markers;
    window.zoomto = wheretostayMap.zoomto;

})(window);