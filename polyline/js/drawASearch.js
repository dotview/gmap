(function() {
	var DEFINEYOURAREA = RIGHTMOVE.namespace("RIGHTMOVE.DEFINEYOURAREA");

	DEFINEYOURAREA.ajax = {
		saveLocation : function(locationIdentifier, polygon, name, callback) {
			jQuery.ajax({
				type: "POST",
				dataType : "json",
				data: {
					locationIdentifier : locationIdentifier,
					name : name || "",
					polygon : DEFINEYOURAREA.getPolygonLatLngs(polygon)
				},
				url: RIGHTMOVE.UTIL.encodeUri("/ajax/defineyourarea/savearea.html"),
				timeout: 30000,
				success: function (data) {
					if (data.saveResult == "SAVED") {
						RIGHTMOVE.UTIL.typeAheadPersister.addToHistory(data.location.locId, data.location.name);
					}
					if (callback) {
						callback(data);
					}
				}
			});
		},

		fixPolygon : function(polygon, callback) {
			jQuery.ajax({
				type: "GET",
				dataType : "json",
				data: {polygon : DEFINEYOURAREA.getPolygonLatLngs(polygon)},
				url: RIGHTMOVE.UTIL.encodeUri("/ajax/defineyourarea/fixpolygon.html"),
				timeout: 30000,
				success: function (data) {
					if (callback) {
						callback(data);
					}
				}
			});
		},

		loadSavedAreas : function(channelUri, callback) {
			jQuery.ajax({
				type: "GET",
				dataType : "json",
				data : {
					channelUri : channelUri
				},
				url: RIGHTMOVE.UTIL.encodeUri("/ajax/defineyourarea/loadsavedareas.html"),
				timeout: 30000,
				success: function (data) {
					if (callback) {
						callback(data);
					}
				}
			});
		},

		login: function(email, password, keepMeLoggedIn, callback) {
			jQuery.ajax({
				type: "POST",
				data: {
					email : email,
					password : password,
					hideFromParameterOnRegisterURI : false,
					keepMeLoggedIn : keepMeLoggedIn
				},
				dataType: "json",
				url: "/ajax/login.html",
				timeout: 30000,
				success: function (data) {
					callback(data);
				}
			});
		},

		loadLocation : function(locationIdentifier, callback, errorCallback) {
			jQuery.ajax({
				type: "GET",
				data: {
					locationIdentifier : locationIdentifier
				},
				dataType: "json",
				url: "/ajax/defineyourarea/loadarea.html",
				timeout: 30000,
				success: callback,
				error: errorCallback
			});
		}
	};
})();
(function() {
	var DEFINEYOURAREA = RIGHTMOVE.namespace("RIGHTMOVE.DEFINEYOURAREA");

	DEFINEYOURAREA.CompletePolygonPopup = function(mapElement, savedAreas, maxAreas, saveFunction, viewFunction) {
		this.displayPopup(mapElement, savedAreas, maxAreas, saveFunction, viewFunction);
	};

	DEFINEYOURAREA.CompletePolygonPopup.prototype = {
		displayPopup : function(mapElement, savedAreas, maxAreas, saveFunction, viewFunction) {
			var popup = ["<div id='dyacompleted' class='clearfix'><h2>You have drawn a new area</h2>"];
            popup.push("<div id='viewing'>" +
                       "<input type='submit' class='button' id='dyaviewresults2' name='viewresults' value='View Properties' />" +
                       "<br/>" +
					   "<span>OR</span>" +
                       "</div>");

            if (savedAreas >= maxAreas) {
                popup.push("<div  id='saving'><p class='maxareas'>You can only save a <strong>maximum of ");
				popup.push(maxAreas);
				popup.push(" </strong> areas.<br /> Please <strong>delete</strong> one in order to save this area</p></div>");
            } else {
				popup.push("<div id='saving'><div id='saveform'><form id='dyacpform'><input type='text' id='dyasavename2'>");
				popup.push("<input type='submit' class='button secondary' id='dyasave2' name='dyasave2' value='Save Area' /></form>" +
                          "<span>e.g. 'my London', 'around NW3' </span></div></div>");
			}
            popup.push("<a href='#' id='dyacompleted-close' title='close'>Close</a></div>");
			popup = $(popup.join(""));
			popup.appendTo(mapElement.parent()).css({
				left : (mapElement.width() - popup.width()) / 2 + "px",
				top : (mapElement.height() - popup.height()) / 2 + "px"
			});

			$("#dyaviewresults2").click(function() {
				viewFunction();
			});
			$("#dyacpform").submit(function(event) {
				event.preventDefault();
				saveFunction(jQuery.trim($("#dyasavename2").val()) || "Untitled");
				popup.remove();
			});
			
			this.remove = function() {
				popup.remove();
			};

			$("#dyacompleted-close").bind("click.completed", this.remove);
		}
	};
})();
(function() {
	var DEFINEYOURAREA = RIGHTMOVE.namespace("RIGHTMOVE.DEFINEYOURAREA");
	var USER = RIGHTMOVE.namespace("RIGHTMOVE.USER");
	var accountLightbox = USER.accountLightbox;

	var pageMinHeight = 545;

	var ukBounds = {
		min : {lat : 49, lng : -8},
		max : {lat : 60, lng : 3}
	};

	DEFINEYOURAREA.defineAreaMap = function() {
		var options;
		var map;
		var polygonHandler;
		var locationHandler;
		var mouseHints;
		var domElements;
		var completePopup;
		var canDeleteRegistrationMessage = false;
		var windowSize;

		// See http://www.addthis.com/forum/viewtopic.php?f=8&t=13982&start=30
		var reinitialiseAddThis = function() {
			if (window.addthis) {
				window.addthis.ost = 0;
				window.addthis.ready();
			}
		};

		var removeCompletePopup = function() {
			if (completePopup) {
				completePopup.remove();
				completePopup = null;
			}
		};

		var setClickable = function(element, visible) {
			if (visible) {
				element.removeClass("disabled");
			} else {
				element.addClass("disabled");
			}
		};

		var saved = function() {
			return locationHandler.isSavedLocation(options.registrantId);
		};

		var showSaveIfNeeded = function(callback) {
			if (polygonHandler.getState().empty || saved()) {
				callback();
			} else {
				DEFINEYOURAREA.saver.showUnsavedChangesDialog(callback);
			}
		};

		var scrollToCurrentLocation = function() {
			if (locationHandler.isSavedLocation(options.registrantId)) {
				var item = $("#dyasavedarea-" + DEFINEYOURAREA.getUserDefinedAreaId(locationHandler.getLocation()));
				if (item.length > 0) {
					$("#dyasavedareas").scrollTo(item);
				}
			}
		};

		var showRegisteredMessage = function() {
			var message = "<div id='dyaregistered' class='tip successicon'>" +
						  "Thanks for creating an account, you are are now signed in and your area is saved.</div>";
			var messageHtml = $(message);

			domElements.mapColumn.prepend(messageHtml);
			resizeMapElem(true);
			setTimeout(function() {
				canDeleteRegistrationMessage = true;
			}, 15000);
		};

		var removeRegisteredMessage = function() {
			if (canDeleteRegistrationMessage) {
				var message = $("#dyaregistered");
				message.fadeOut("slow", function() {
					message.remove();
					resizeMapElem(true);
				});
			}
		};

		var updateButtons = function() {
			var polygonState = polygonHandler.getState();
			var isSaved = saved();
			setClickable($("#dyasave"), polygonState.complete && (!isSaved));
			setClickable($("#dyaviewresults"), polygonState.complete);
			setClickable($("#dyaundo"), polygonState.canUndo);
			setClickable($("#dyaredo"), polygonState.canRedo);
			setClickable($("#dyaclear"), !polygonState.empty);
			polygonHandler.setSaved(isSaved);
			removeRegisteredMessage();
		};

		var highlightSelectedLocation = function() {
			$("li[id^=dyasavedarea].selected").removeClass("selected");
			var userDefinedAreadId = DEFINEYOURAREA.getUserDefinedAreaId(locationHandler.getLocation());
			if (typeof userDefinedAreadId === "number") {
				$("#dyasavedarea-" + userDefinedAreadId).addClass("selected");
			}
		};

		var displayLocation = function() {
			var location = locationHandler.getLocation();
			RIGHTMOVE.UTIL.centreMap(map, locationHandler.getBounds());
			map.savePosition();
			polygonHandler.newLocation(location);
			removeCompletePopup();
			updateButtons();
			highlightSelectedLocation();
		};

		var resizeMapElem = function(force) {
			var newWindowSize = new GSize($(window).width(), $(window).height());
			if (force || !windowSize || !newWindowSize.equals(windowSize)) {
				var savedAreas = $("#dyasavedareas");
				var feedbackHeight = $("a.feedback", savedAreas.parent()).outerHeight();
				RIGHTMOVE.UTIL.resizeToBottom(savedAreas, null, feedbackHeight);
				RIGHTMOVE.UTIL.resizeToBottom(domElements.map, pageMinHeight);
				if (map) {
					var centre = map.getCenter();
					map.checkResize();
					map.setCenter(centre);
				}
			}
			windowSize = newWindowSize;
		};

		var onPolygonChange = function(event, data) {
			locationHandler.setPolylines(RIGHTMOVE.UTIL.getEncodedPolylines(data.polygon));
			removeCompletePopup();
			updateButtons();
		};

		var getSavedAreaCount = function() {
			return $("#dyasavedareas li[id^=dyasavedarea]").length;
		};

		var onPolygonCompleted = function(event, data) {
			onPolygonChange(event, data);
			if (!data.undoRedoAction) {
				completePopup = new DEFINEYOURAREA.CompletePolygonPopup(domElements.map, getSavedAreaCount(), options.maxSavedAreas, saveLocation, viewProperties);
			}
		};

		var loadMap = function() {
			resizeMapElem(true);
			map = new GMap2(domElements.map[0]);
			map.setUIToDefault();
			map.enableScrollWheelZoom();
			RIGHTMOVE.UTIL.limitMapRange(map, 6, null, new GLatLngBounds(new GLatLng(49.5,-10), new GLatLng(61,2.6)));
			polygonHandler = new DEFINEYOURAREA.PolygonHandler(map, options.maxPolygonVertices, domElements.mapColumn);
			mouseHints = new DEFINEYOURAREA.MouseHints(map, polygonHandler, domElements.mapColumn);
			$(polygonHandler)
					.bind("polygonchanged", onPolygonChange)
					.bind("polygoncompleted", onPolygonCompleted);
			displayLocation();
			scrollToCurrentLocation();
			$(window).unload(GUnload);
			$(window).resize(resizeMapElem);

			if (options.save) {
				saveLocation(options.saveName);
			}
		};

		var loadSavedAreas = function() {
			domElements.savedAreasColumn.html("<h2 id='dyasavedareasheader'>Your Saved Areas</h2><div id='dyasavedareas' class='dyaloading'><img src='/ps/images/icons/loading-small.gif'/><span>Loading...</span></div>");
			DEFINEYOURAREA.ajax.loadSavedAreas(options.channelUri, function(data) {
				domElements.savedAreasColumn.html(data.savedAreas);
				$('.scriptonly').removeClass('scriptonly');
				resizeMapElem(true);
				reinitialiseAddThis();
				highlightSelectedLocation();
				scrollToCurrentLocation();
			});
		};

		var getInitialLocation = function(callback) {
			var location = options.location;
			if (location) {
				var bounds = options.bounds && RIGHTMOVE.UTIL.stringToGLatLngBounds(options.bounds);
				locationHandler.setLocation(location, bounds, options.polygonMode);
				callback();
			} else {
				RIGHTMOVE.UTIL.typeAheadPersister.getHistoryWhenReady(function(typeAheadHistory) {
					var locationIdentifier = typeAheadHistory && typeAheadHistory[0] && typeAheadHistory[0].locationIdentifier;
					if (locationIdentifier) {
						DEFINEYOURAREA.ajax.loadLocation(locationIdentifier, function(location) {
							locationHandler.setLocation(location, null, "create");
							callback();
						}, function() {
							locationHandler.setLocationFromBounds(ukBounds);
							callback();
						});
					} else {
						locationHandler.setLocationFromBounds(ukBounds);
						callback();
					}
				}, 1000);
			}
		};

		var showMap = function() {
			var browserIsCompatible = GBrowserIsCompatible;
			if (browserIsCompatible()) {
				getInitialLocation(function() {
					loadMap();
				});
			}
		};

		var changeLocation = function(href) {
			locationHandler.setLocationFromHref(href);
			displayLocation();
		};

		var loadLocation = function(event) {
			event.preventDefault();
			var href = this.href;
			showSaveIfNeeded(function() {
				changeLocation(href);
			});
		};

		var deleteLocation = function(event, element, deleteSavedSearches) {
			event.preventDefault();
			removeCompletePopup();
			DEFINEYOURAREA.deleter.deleteLocation(element.href, deleteSavedSearches, function(location) {
				$(element).parents("li[id^=dyasavedarea]").remove();
				if (getSavedAreaCount() === 0) {
					$("#dyanosavedareas").show();
					resizeMapElem(true);
				}
				if (locationHandler.isCurrentLocation(location)) {
					clearLocation();
					highlightSelectedLocation();
				} else {
					updateButtons();
				}
			});
		};

		var submitViewResultsForm = function(locId) {
			$("input[name=locationIdentifier]", domElements.propertySearchCriteria).val(locId);
			$("input[name=radius]", domElements.propertySearchCriteria).val(0);
			domElements.propertySearchCriteria.submit();
		};

		var setViewResultsAction = function(channel, form, path) {
			form.action = channel + path;
		};

		var setupAndSubmitViewResultsForm = function(locId) {
			var form = domElements.propertySearchCriteria[0];
			var action = form.action;
			var parsedAction = RIGHTMOVE.UTIL.parseUrl(action);
			if (parsedAction.path.indexOf("/map.html") === 0) {
				var channel = RIGHTMOVE.UTIL.userPreferencePersister.getChannel();
				if (channel) {
					setViewResultsAction(channel, form, parsedAction.path);
					submitViewResultsForm(locId);
				} else {
					var buttons = [{name : "For Sale", type : "button", callback : function() {
						setViewResultsAction("/property-for-sale", form, parsedAction.path);
						submitViewResultsForm(locId);
					}}, {name : "To Rent", type : "button", callback : function() {
						setViewResultsAction("/property-to-rent", form, parsedAction.path);
						submitViewResultsForm(locId);
					}}];
					var dialog = new DEFINEYOURAREA.ModalDialog(buttons, "<div class='daspopup'><span class='daspopupLogo'>&nbsp;</span><span class='daspopupText'> - View properties in your drawn area</span></div>", "<p>Choose which type of properties you would like to view:</p>");
				}
			} else {
				submitViewResultsForm(locId);
			}
		};

		var viewSavedAreaProperties = function(href) {
			removeCompletePopup();
			setupAndSubmitViewResultsForm(DEFINEYOURAREA.parseLocationFromHref(href).locId);
		};

		var onViewSavedAreaProperties = function(event) {
			event.preventDefault();
			var href = this.href;
			showSaveIfNeeded(function() {
				viewSavedAreaProperties(href);
			});
		};

		var getDrawASearchUri = function(save, name) {
			if (polygonHandler.getState().complete) {
				return RIGHTMOVE.UTIL.encodeUri((options.channelUri || "") + "/draw-a-search.html?locationIdentifier=" + encodeURIComponent(locationHandler.getLocationIdentifier()) + "&save=" + save + "&name=" + encodeURIComponent(name));
			} else {
				return window.location.href;
			}
		};

		var clearLocation = function() {
			locationHandler.clearLocation(map.getBounds());
			polygonHandler.newLocation(locationHandler.getLocation());
			updateButtons();
			highlightSelectedLocation();
		};

		var showLoginLightbox = function(saveOnRegister, showRegisterOnLoad, name, callback) {
			var object = {};
			var uri = getDrawASearchUri(saveOnRegister, name);

			$(accountLightbox).unbind("success");

			$(accountLightbox).bind("success", function(event, data) {
				handleLoggedIn(data, callback);
			});

			accountLightbox.show({
				element : object,
				channel : RIGHTMOVE.UTIL.userPreferencePersister.getAnalyticsChannel(),
				causeAction : 'draw-a-search',
				targetURI : uri,
				showRegisterOnLoad : showRegisterOnLoad
			});
		};

		var handleLoggedIn = function(data, callback){
			options.registrantId = data.registrantId;
			loadSavedAreas();

			if(data.justRegistered){
				showRegisteredMessage();
			}

			if (callback) {
				callback();
			}
		};

		var saveLocation = function(name) {
			DEFINEYOURAREA.saver.save(locationHandler.getLocationIdentifier(), polygonHandler.polygon, name, null, options.channelUri, null, function(callback) {
				showLoginLightbox(true, true, name, callback);
			}, function(data) {
				locationHandler.setLocation(data.location);
				var savedAreaList = $("#dyasavedareas");
				if (savedAreaList.find("li[id^=dyasavedarea-]").length > 0) {
					var existingSavedArea = $("#dyasavedarea-" + data.userDefinedAreaId);
					if (existingSavedArea.length > 0) {
						existingSavedArea.replaceWith(data.savedArea);
					} else {
						savedAreaList.prepend(data.savedArea);
					}
					reinitialiseAddThis();
					highlightSelectedLocation();
					$("#dyanosavedareas").hide();
				} else {
					loadSavedAreas();
				}
				updateButtons();
			});
		};

		var rename = function(event) {
			event.preventDefault();
			var savedSearchElement = $(this).parents("li[id^=dyasavedarea]");
			RIGHTMOVE.DEFINEYOURAREA.renamer.rename(savedSearchElement, ".dyaeditareaname", function(data) {
				if (data.saveResult === "SAVED") {
					if (locationHandler.isCurrentLocation(data.location)) {
						locationHandler.setName(data.location.name);
					}
					savedSearchElement.replaceWith(data.savedArea);
					reinitialiseAddThis();
					highlightSelectedLocation();
				}
			});
		};

		var viewProperties = function() {
			if (!saved()) {
				DEFINEYOURAREA.ajax.fixPolygon(polygonHandler.polygon, function(data) {
					setupAndSubmitViewResultsForm(locationHandler.getLocationIdentifier(data.fixedPolylines));
				});
			} else {
				setupAndSubmitViewResultsForm(locationHandler.getLocation().locId);
			}
		};

		var buttonHandlers = {
			clear : function() {
				showSaveIfNeeded(clearLocation);
			},

			viewResults : function() {
				viewProperties();
			},

			save : function() {
				var name = null;
				if (locationHandler.isOverwriteableBaseLocation()) {
					name = DEFINEYOURAREA.removeNameSuffix(locationHandler.getLocation().name);
				}
				saveLocation(name);
			},

			undo : function() {
				polygonHandler.undo();
			},

			redo : function() {
				polygonHandler.redo();
			}
		};

		var attachButtonHandler = function(handlerName, handler) {
			$("#dya" + handlerName.toLowerCase()).click(function(event) {
				$(this).blur();
				if (!$(this).hasClass("disabled")) {
					event.preventDefault();
					removeCompletePopup();
					handler();
					updateButtons();
				}
			});
		};

		var attachButtonHandlers = function() {
			for (var handlerName in buttonHandlers) {
				if (buttonHandlers.hasOwnProperty(handlerName)) {
					attachButtonHandler(handlerName, buttonHandlers[handlerName]);
				}
 			}
		};

		var attachEventHandlers = function() {
			attachButtonHandlers();
			$(".dyaeditarealink").live("click", loadLocation);
			$(".dyadeletearealink").live("click", function(event) {
				deleteLocation(event, this, false);
			});
			$(".dyaviewpropertieslink").live("click", onViewSavedAreaProperties);
			$(".dyarenamearealink").live("click", rename);
			$("#dyaloginlink").live("click", function() {
				showLoginLightbox(false, false);
			});
		};

		var findDomElements = function() {
			domElements = {
				dya : $("#dya"),
				header : $("#dyaheader"),
				map : $("#dyamap"),
				mapColumn : $("#dyamapcolumn"),
				savedAreasColumn : $("#dyasavedareascolumn"),
				savedAreasHeader : $("#dyasavedareasheader"),
				login : $("#dyalogin"),
				loginLoadingStatus : $("#dyaloadingstatus"),
				loginFormError : $("#dyaloginformerror"),
				propertySearchCriteria : $("#propertySearchCriteria")
			};
		};

		var loadOptions = function(opts) {
			options = {
				channelUri : null,
				maxPolygonVertices : 100,
				justRegistered : false,
				maxSavedAreas : 20,
				registrantId : null
			};
			jQuery.extend(options, opts);
		};
 

		var init = function(opts) {
			$(".dyabutton").supersleight({shim : "/ps/images/maps/transparent.gif"});

			locationHandler = DEFINEYOURAREA.locationHandler;

			loadOptions(opts);
			 
			findDomElements();
			attachEventHandlers();
			showMap();

			if (options.justRegistered) {

				// Track register event
				var registerAction = RIGHTMOVE.UTIL.userPreferencePersister.getValue("registerAction");
				RIGHTMOVE.UTIL.analytics.trackEvent('registered', 'source', registerAction);

				showRegisteredMessage();
			}

		};

		return {
			init : init
		};
	}();
})();
(function() {
	var DEFINEYOURAREA = RIGHTMOVE.namespace("RIGHTMOVE.DEFINEYOURAREA");

	DEFINEYOURAREA.deleter = function() {
		var deleteAjaxCall = function(href, doDelete, callback) {
			var parsedLocation = DEFINEYOURAREA.parseLocationFromHref(href);

			jQuery.ajax({
				type: "POST",
				dataType : "json",
				data: {
					id : DEFINEYOURAREA.getUserDefinedAreaId(parsedLocation),
					doDelete : doDelete
				},
				url: RIGHTMOVE.UTIL.encodeUri("/ajax/defineyourarea/deletearea.html"),
				timeout: 30000,
				success: function (data) {
					if (callback) {
						callback(data, parsedLocation);
					}
				}
			});
		};


		var deleteLocation = function(href, doDelete, callback) {
			deleteAjaxCall(href, doDelete, function(data, location) {
				switch (data.deleteResult) {
					case "DELETED" :
						RIGHTMOVE.UTIL.typeAheadPersister.removeFromHistory(location.locId);
						callback(location);
						break;
					case "HAS_SAVED_SEARCHES" :
					case "NO_SAVED_SEARCHES" :
						var message = data.deleteResult == "HAS_SAVED_SEARCHES" ? data.savedSearchMessage : "<p>Are you sure you want to delete this area?</p>";
						var buttons = [{name : "Delete", type : "button", callback : function() {
							deleteLocation(href, true, callback);
						}}, {name : "Cancel", type : "link" }];
						var dialog = new DEFINEYOURAREA.ModalDialog(buttons,"<div class='daspopup'><span class='daspopupLogo'>&nbsp;</span><span class='daspopupText'> - Delete an area</span></div>", message);
						break;
				}
			});
		};

		return {
			deleteLocation : deleteLocation
		};
	}();
})();
(function() {
	var DEFINEYOURAREA = RIGHTMOVE.namespace("RIGHTMOVE.DEFINEYOURAREA");

	DEFINEYOURAREA.locationHandler = function() {
		var baseLocation = null;
		var location = null;
		var bounds = null;

		var setLocation = function(loc, newBounds, polygonMode) {
			polygonMode = polygonMode || "default";
			if (DEFINEYOURAREA.isEditable(loc)) {
				location = RIGHTMOVE.copyObject(loc, true);
				if (polygonMode === "create") {
					baseLocation = {};
					location.polylines = null;
				} else {
					baseLocation = loc;					
				}
			} else {
				baseLocation = loc;
				location = {};
				baseLocation.polylines = loc.simplifiedPolylines;
				if (polygonMode === "edit") {
					location.polylines = loc.simplifiedPolylines;
				}
			}
			bounds = newBounds || RIGHTMOVE.UTIL.createGLatLngBounds(loc.bounds);
		};

		var clearLocation = function(newBounds) {
			setLocation({}, newBounds);
		};

		var setLocationFromHref = function(href) {
			setLocation(DEFINEYOURAREA.parseLocationFromHref(href));
		};

		var setPolylines = function(polylines) {
			location.polylines = polylines;
		};

		var setName = function(name) {
			location.name = name;
		};

		var isOtherUsersArea = function(registrantId) {
			return location.registrantId && location.registrantId !== registrantId;
		};

		var isSavedLocation = function(registrantId) {
			return DEFINEYOURAREA.isSavedAndPolylinesEquals(baseLocation, location.polylines) && !isOtherUsersArea(registrantId);
		};

		var getLocationIdentifier = function(polylines) {
			polylines = polylines || location.polylines;
			return DEFINEYOURAREA.createLocationIdentifier(baseLocation, polylines);
		};

		var isOverwriteableBaseLocation = function() {
			return DEFINEYOURAREA.isOverwriteable(baseLocation);
		};

		var getLocation = function() {
			return location;
		};

		var isCurrentLocation = function(loc) {
			return RIGHTMOVE.UTIL.locationEquals(loc, location);
		};

		var setLocationFromBounds = function(bounds) {
			var gBounds = RIGHTMOVE.UTIL.createGLatLngBounds(bounds);
			setLocation({
				locId : "LAT_LONG_BOX^" + RIGHTMOVE.UTIL.gLatLngBoundsToString(gBounds),
				bounds : bounds
			});
		};

		var getBounds = function() {
			return bounds;
		};

		return {
			getLocation : getLocation,
			setLocation : setLocation,
			setLocationFromBounds : setLocationFromBounds,
			setPolylines : setPolylines,
			setName : setName,
			setLocationFromHref : setLocationFromHref,
			clearLocation : clearLocation,
			isSavedLocation : isSavedLocation,
			isOverwriteableBaseLocation : isOverwriteableBaseLocation,
			isCurrentLocation : isCurrentLocation,
			getLocationIdentifier : getLocationIdentifier,
			getBounds : getBounds
		};
	}();
})();
(function() {
	var DEFINEYOURAREA = RIGHTMOVE.namespace("RIGHTMOVE.DEFINEYOURAREA");

	var getButtonName = function(button) {
		return button.name.toLowerCase().replace(/ /g, "");
	};

	DEFINEYOURAREA.ModalDialog = function(buttons, heading, message, onShow, width, height) {
		this.buttons = buttons;
        this.heading = heading || "";
        this.message = message;
		this.onShow = onShow;
		this.width = width;
		this.height = height;
		this.displayDialog();
	};

	DEFINEYOURAREA.ModalDialog.prototype = {
		displayDialog : function() {
			$("#dyadialog").remove();
			var html = ["<div id='dyadialog'>", this.heading, "<div class='popupcontent clearfix'>", this.message];
			jQuery.each(this.buttons, RIGHTMOVE.bind(this, function(i, button) {
				html.push(this.createButton(button));
			}));
			html.push("</div></div>");

			var dialog = $(html.join(""));
			dialog.appendTo("body");
			jQuery.each(this.buttons, function(i, button) {
				$("#dyadialog" + getButtonName(button)).click(function(event) {
					event.preventDefault();
					if (button.callback) {
						button.callback();
					}
					$.fancybox.close();
				});
			});

			var options = {
				content : $("#dyadialog"),
				titleShow : false,
				transitionIn: 'none',
				transitionOut : 'none',
				onComplete : this.onShow,
				onCleanup : function() {
					$("#dyadialog").remove();
				}
			};

			if(this.height){
				$.extend(options, {
					autoDimensions :  false,
					height : this.height
				});
			}

			if(this.width){
				$.extend(options, {
					autoDimensions :  false,
					width : this.width
				});
			}

			//$.fancybox(options);
			//$.fancybox.center();
		},

		createButton : function(button) {
			var html = [];
			var buttonName = getButtonName(button);
			var imageType = button.imageType || "gif";
			switch (button.type) {
				case "button" :
					html.push("<input id='dyadialog");
					html.push(buttonName);
					html.push("' class='button' type='submit' value='");
                    html.push(button.name);
					html.push("' href=''/>");
					break;
                case "link" :
                    html.push("<a id='dyadialog");
					html.push(buttonName);
					html.push("' href=''>");
					html.push(button.name);
					html.push("</a>");
					break;
            }

			return html.join("");
		}
	};
})();
(function() {
	var DEFINEYOURAREA = RIGHTMOVE.namespace("RIGHTMOVE.DEFINEYOURAREA");

	DEFINEYOURAREA.MouseHints = function(map, polygonHandler, mapContainer) {
		this.map = map;
		this.polygonHandler = polygonHandler;
		this.containerOffset = mapContainer.offset();
		this.hintDiv = $("<div id='dyamousehint'></div>").appendTo(mapContainer);
		this.hintLeftPadding = Math.ceil((this.hintDiv.outerWidth() - this.hintDiv.width()) / 2);
		this.hintBottomPadding = Math.ceil((this.hintDiv.outerHeight() - this.hintDiv.height()) / 2);
		this.windowWidth = $(window).width();
		this.windowHeight = $(window).height();
		this.showing = false;
		this.hint = null;
		this.draggedPointCount = 0;
		this.haveDeletedPoint = false;
		this.haveCompletedPolygon = false;
		this.showHint = RIGHTMOVE.bind(this, this.showHint);
		this.notShowing = RIGHTMOVE.bind(this, this.notShowing);
		this.isShowing = RIGHTMOVE.bind(this, this.isShowing);
		this.polygonChanged = RIGHTMOVE.bind(this, this.polygonChanged);

		$("#dyamap").mouseout(this.notShowing)
				.mousemove(this.isShowing);
		$(polygonHandler).bind("polygonchanged", this.polygonChanged)
				.bind("polygoncompleted", RIGHTMOVE.bind(this, function() {
					this.haveCompletedPolygon = true;
				}
		));
		$(document).mousemove(this.showHint);
		$(window).resize(RIGHTMOVE.bind(this, function() {
			this.containerOffset = mapContainer.offset();
			this.windowWidth = $(window).width();
			this.windowHeight = $(window).height();
		}));
	};

	DEFINEYOURAREA.MouseHints.prototype = {
		isShowing : function() {
			this.showing = true;
			this.hintDiv.show();
		},

		notShowing : function() {
			this.showing = false;
			this.hintDiv.hide();
		},

		showHint : function(event) {
			if (this.showing) {
				var hint = this.getHint();
				if (hint !== null && hint !== this.hint) {
					this.hintDiv.html(hint);
					this.hintWidth = this.hintDiv.outerWidth();
					this.hintHeight = this.hintDiv.outerHeight();
				}
				this.hint = hint;

				if (event) {
					if (hint !== null) {
						var spaceToRight = this.windowWidth - (event.pageX + 20) - 1;
						var hasRoomToRight = spaceToRight > this.hintWidth;
						var spaceBelow = this.windowHeight - (event.pageY - 12) - 1;
						var hasRoomBelow = spaceBelow > this.hintHeight;
						this.hintDiv.css({
							left : event.pageX + 20 - this.containerOffset.left,
							top : event.pageY - 12 - this.containerOffset.top,
							width : hasRoomToRight ? "auto" : (spaceToRight - this.hintLeftPadding) + "px",
							height : hasRoomBelow ? "auto" : (spaceBelow - this.hintBottomPadding) + "px"
						});
						if (hasRoomToRight) {
							this.hintDiv.removeClass("dyachoppedhintright");
						} else {
							this.hintDiv.addClass("dyachoppedhintright");
						}
						if (hasRoomBelow) {
							this.hintDiv.removeClass("dyachoppedhintbelow");
						} else {
							this.hintDiv.addClass("dyachoppedhintbelow");
						}
					} else {
						this.hintDiv.css({
							left : -100000, top : -100000
						});
					}
				}
			}
		},

		polygonChanged : function(event, data) {
			if (this.polygonHandler.polygon instanceof GPolygon) {
				switch (data.change.type) {
					case "add":
					case "edit":
						this.draggedPointCount++;
						break;
					case "delete":
						this.haveDeletedPoint = true;
						break;
				}
			}
			this.showHint();
		},

		getHint : function() {
			var polygon = this.polygonHandler.polygon;

			var vertexCount = polygon.getVertexCount();
			var pointsLeft = 100 - vertexCount;
			if (polygon instanceof GPolyline) {
				if (vertexCount === 0 && !this.haveCompletedPolygon) {
					return "Click and release to place your first point";
				} else if ((vertexCount == 1 || vertexCount == 2) && !this.haveCompletedPolygon) {
					return "Click on the map to draw an edge";
				} else if (vertexCount < 6 && !this.haveCompletedPolygon) {
					return "Continue placing points or double click to finish shape";
				} else if (pointsLeft <= 10 && pointsLeft > 0) {
					return pointsLeft + " point" + (pointsLeft == 1 ? "" : "s") + " left";
				}
			} else if (polygon instanceof GPolygon) {
				if (this.draggedPointCount === 0) {
					return "Drag a point to modify the shape";
				} else if (!this.haveDeletedPoint && (this.draggedPointCount === 3 || this.draggedPointCount === 4)) {
					return "Right-click a point to delete it";
				} else if (pointsLeft <= 10 && pointsLeft > 0) {
					return pointsLeft + " point" + (pointsLeft == 1 ? "" : "s") + " left";
				} else {
					return null;
				}
			}

			return null;
		}
	};
})();
(function() {
	var DEFINEYOURAREA = RIGHTMOVE.namespace("RIGHTMOVE.DEFINEYOURAREA");

	var EditActionStack = function() {
		this.actions = [];
		this.pointer = 0;
	};

	EditActionStack.prototype = {
		addAction : function(action) {
			if (this.actions.length != this.pointer) {
				this.actions = this.actions.slice(0, this.pointer);
			}
			this.actions.push(action);
			this.pointer = this.actions.length;
		},

		undoAction : function(callback) {
			if (this.canUndo()) {
				callback(this.actions[--this.pointer].reverse());
			}
		},

		redoAction : function(callback) {
			if (this.canRedo()) {
				callback(this.actions[this.pointer++]);
			}
		},

		canUndo : function() {
			return this.pointer !== 0;
		},

		canRedo : function() {
			return this.pointer !== this.actions.length;
		}
	};

	var EditAction = function(type, index, oldGLatLng, newGLatLng) {
		this.type = type;
		this.index = index;
		this.oldGLatLng = oldGLatLng;
		this.newGLatLng = newGLatLng;
	};

	EditAction.prototype = {
		reverseActions : {
			"add" : "delete",
			"complete" : "break",
			"edit" : "edit",
			"break" : "complete",
			"delete" : "add"
		},

		reverse : function() {
			return new EditAction(
					this.reverseActions[this.type],
					this.index,
					this.newGLatLng,
					this.oldGLatLng);
		},

		toString : function() {
			return [this.type, ",", this.index, ",", this.oldGLatLng, ",", this.newGLatLng].join("");
		}
	};

	DEFINEYOURAREA.PolygonHandler = function(map, maxPolygonVertices, menuContainer) {
		this.map = map;
		this.maxPolygonVertices = maxPolygonVertices;
		this.menuContainer = menuContainer;
		this.polygon = null;
		this.editActions = new EditActionStack();
		this.ignoreActions = 0;
		this.showingSavedPolygon = false;
		this.dragInfo = null;
		this.mouseUpLatLng = null;
		GEvent.addListener(map, "singlerightclick", RIGHTMOVE.bind(this, this.mapRightClick));
		GEvent.addListener(map, "dragstart", RIGHTMOVE.bind(this, this.dragStart));
		GEvent.addListener(map, "dragend", RIGHTMOVE.bind(this, this.dragEnd));
		var mapDiv = $("#dyamap");
		mapDiv.mouseup(RIGHTMOVE.bind(this, function(event) {
			var offset = mapDiv.offset();
			var x = event.pageX - offset.left;
			var y = event.pageY - offset.top;
			this.mouseUpLatLng = this.map.fromContainerPixelToLatLng(new GPoint(x, y));
			this.polygonUpdated(false);
		}));
		GEvent.addListener(map, "click", RIGHTMOVE.bind(this, this.click));
	};

	DEFINEYOURAREA.PolygonHandler.prototype = {
		clearPolygon : function() {
			this.removePolygon();
			this.editActions = new EditActionStack();
		},

		replacePolygon : function(newPolygon) {
			this.removePolygon();
			this.addPolygon(newPolygon);
		},

		removePolygon : function() {
			if (this.polygon) {
				GEvent.clearListeners(this.polygon, "endline");
				GEvent.clearListeners(this.polygon, "lineupdated");
				GEvent.clearListeners(this.polygon, "click");
				GEvent.clearListeners(this.polygon, "cancelline");
				this.polygon.disableEditing();
				this.map.removeOverlay(this.polygon);
				this.polygon = null;
			}
		},

		getFill : function() {
			if (this.showingSavedPolygon) {
				return {
					colour: "#0000ff", opacity : 0.3
				};
			} else {
				return {
					colour: "#3333ff", opacity : 0.1
				};
			}
		},

		buildPolygon : function(gLatLngs) {
			var fill = this.getFill();
			if (gLatLngs.length > 3 && gLatLngs[0].equals(gLatLngs[gLatLngs.length - 1])) {
				return new GPolygon(gLatLngs, "#0000ff", 2, 0.7, fill.colour, fill.opacity);
			} else {
				return new GPolyline(gLatLngs, "#0000ff", 2, 0.7);
			}
		},

		isLastPointDodgy : function(gLatLngs) {
			if (gLatLngs.length == 3 && gLatLngs[0].equals(gLatLngs[2])) {
				return true;
			} else {
				var last = gLatLngs[gLatLngs.length - 1];
				var secondLast = gLatLngs.length - 2;
				for (var i = 1; i <= secondLast; i++) {
					if (last.equals(gLatLngs[i])) {
						return true;
					}
				}
			}

			return false;
		},

		polygonCompleted : function() {
			var gLatLngs = RIGHTMOVE.UTIL.getPolygonGLatLngs(this.polygon);
			if (gLatLngs.length < 3) {
				// They have completed a polyline, but its not a valid polygon, so just re-add it uncompleted
				this.replacePolygon(this.buildPolygon(gLatLngs));
			} else if (this.isLastPointDodgy(gLatLngs)) {
				this.replacePolygon(this.buildPolygon(gLatLngs.splice(0, 2)));
			} else {
				if (!gLatLngs[0].equals(gLatLngs[gLatLngs.length - 1])) {
					gLatLngs.push(gLatLngs[0]);
				}
				var editablePolygon = this.buildPolygon(gLatLngs);
				this.replacePolygon(editablePolygon);
				this.polygonUpdated(true);
				$(this).trigger("polygoncompleted", {polygon : this.polygon});
			}
		},

		addPolygon : function(newPolygon) {
			this.polygon = newPolygon;
			this.vertices = this.extractVertices();
			this.map.addOverlay(this.polygon);
			GEvent.addListener(this.polygon, "lineupdated", RIGHTMOVE.bind(this, function() {
				this.polygonUpdated();
			}));
			GEvent.addListener(this.polygon, "cancelline", RIGHTMOVE.bind(this, this.emptyPolygon));
			if (newPolygon instanceof GPolygon) {
				this.polygon.enableEditing({maxVertices:this.maxPolygonVertices});
			} else {
				GEvent.addListener(this.polygon, "endline", RIGHTMOVE.bind(this, this.polygonCompleted));
				this.polygon.enableDrawing({maxVertices: this.maxPolygonVertices});
			}
		},

		emptyPolygon : function() {
			this.clearPolygon();
			var newPolygon = this.buildPolygon([]);
			this.addPolygon(newPolygon);
		},

		newLocation : function(location) {
			if (location.polylines) {
				this.clearPolygon();
				var fill = this.getFill();
				var newPolygon = RIGHTMOVE.UTIL.createGPolygonUsingEncodedPolylines({
					polylines : location.polylines,
					colour: "#0000ff",
					weight: 2,
					lineOpacity: 0.7,
					fillColour : fill.colour,
					fillOpacity : fill.opacity
				});
				this.addPolygon(newPolygon);
			} else {
				this.emptyPolygon();
			}
		},

		extractVertices : function() {
			var vertices = [], polygon = this.polygon, count = polygon.getVertexCount();
			for (var i = 0; i < count; i++) {
				vertices.push(polygon.getVertex(i));
			}

			return vertices;
		},

		polygonUpdated : function(completes) {
			var newVertices = this.extractVertices(), oldCount = this.vertices.length, newCount = newVertices.length, changeData;
			if (this.isLastPointDodgy(newVertices)) {
				this.replacePolygon(this.buildPolygon(newVertices.splice(0, newVertices.length - 1)));				
			} else {
				if (this.ignoreActions === 0) {
					if (completes) {
						changeData = new EditAction("complete", null, null, null);
					} else if (oldCount === newCount) {
						changeData = this.findEdit(newVertices, this.vertices);
					} else if (oldCount < newCount) {
						changeData = this.findAdd(newVertices, this.vertices);
					} else {
						changeData = this.findDelete(newVertices, this.vertices);
					}
				}

				this.vertices = newVertices;
				if (this.ignoreActions > 0) {
					this.ignoreActions--;
				} else if (changeData) {
					this.editActions.addAction(changeData);
				}

				if (changeData) {
					$(this).trigger("polygonchanged", {polygon: this.polygon, change : changeData});
				}
			}
		},

		findEdit : function(newVertices, oldVertices) {
			var count = newVertices.length;
			for (var i = 0; i < count; i++) {
				if (!newVertices[i].equals(oldVertices[i])) {
					return new EditAction("edit", i, oldVertices[i], newVertices[i]);
				}
			}

			return null;
		},

		findAdd : function(newVertices, oldVertices) {
			var count = oldVertices.length;
			for (var i = 0; i < count; i++) {
				if (!newVertices[i].equals(oldVertices[i])) {
					return new EditAction("add", i, null, newVertices[i]);
				}
			}

			// last one was added
			return new EditAction("add", i, null, newVertices[i]);
		},

		findDelete : function(newVertices, oldVertices) {
			var count = newVertices.length;
			for (var i = 0; i < count; i++) {
				if (!newVertices[i].equals(oldVertices[i])) {
					return new EditAction("delete", i, oldVertices[i], null, "none");
				}
			}

			// last one was removed
			return new EditAction("delete", i, oldVertices[i], null);
		},

		undo : function() {
			this.editActions.undoAction(RIGHTMOVE.bind(this, this.doEditAction));
		},

		redo : function() {
			this.editActions.redoAction(RIGHTMOVE.bind(this, this.doEditAction));
		},

		findClickedVertexIndex : function(clickPoint, minDistance) {
			var clickedVertexIndex = null;
			var polygon = this.polygon;
			var numPoints = polygon.getVertexCount();
			for (var i = 0; i < numPoints; i++) {
				var latLongPoint = this.map.fromLatLngToContainerPixel(polygon.getVertex(i));
				var distance = Math.sqrt(
						Math.pow(latLongPoint.y-clickPoint.y, 2) + Math.pow(latLongPoint.x-clickPoint.x, 2));
				if (distance < minDistance) {
					minDistance = distance;
					clickedVertexIndex = i;
				}
			}

			return clickedVertexIndex;
		},

		mapRightClick : function(clickPoint) {
			if (this.polygon.getVertexCount() > 4) {
				var index = this.findClickedVertexIndex(clickPoint, 7);

				if (index !== null) {
					this.polygon.deleteVertex(index);
				}
			}
		},

		setSaved : function(saved) {
			if (this.showingSavedPolygon != saved) {
				this.showingSavedPolygon = saved;
				this.replacePolygon(this.buildPolygon(RIGHTMOVE.UTIL.getPolygonGLatLngs(this.polygon)));
			}
		},

		doEditAction : function(action) {
			var gLatLngs = RIGHTMOVE.UTIL.getPolygonGLatLngs(this.polygon);
			var firstVertexOfPolygon = this.polygon instanceof GPolygon && action.index === 0;
			switch (action.type) {
				case "complete" :
					gLatLngs.push(gLatLngs[0]);
					break;
				case "break":
					gLatLngs = gLatLngs.slice(0, gLatLngs.length - 1);
					break;
				case "add":
					if (firstVertexOfPolygon) {
						gLatLngs[gLatLngs.length - 1] = action.newGLatLng;
					}
					gLatLngs.splice(action.index, 0, action.newGLatLng);
					break;
				case "edit":
					if (firstVertexOfPolygon) {
						gLatLngs[gLatLngs.length - 1] = action.newGLatLng;
					}
					gLatLngs[action.index] = action.newGLatLng;
					break;
				case "delete":
					if (firstVertexOfPolygon) {
						gLatLngs[gLatLngs.length - 1] = gLatLngs[1];
					}
					gLatLngs.splice(action.index, 1);
					break;
			}

			this.replacePolygon(this.buildPolygon(gLatLngs));

			var eventData = {polygon : this.polygon, undoRedoAction : true};
			switch (action.type) {
				case "complete" :
					$(this).trigger("polygoncompleted", eventData);
					break;
				case "break" :
					$(this).trigger("polygonbroken", eventData);
					break;
				default :
					$(this).trigger("polygonchanged", jQuery.extend(eventData, {change : action}));
					break;
			}
		},

		getState : function() {
			return {
				canUndo : this.editActions.canUndo(),
				canRedo : this.editActions.canRedo(),
				complete : this.polygon instanceof GPolygon,
				empty : this.polygon.getVertexCount() === 0
			};
		},

		dragStart : function() {
			this.dragInfo = {
				time : new Date().getTime(),
				centre : this.map.getCenter()
			};
		},

		dragEnd : function() {
			if (this.dragInfo && this.mouseUpLatLng && this.polygon instanceof GPolyline && this.dragInfo.time > new Date().getTime() - 200) {
				// Sometimes the map is dragged, but a click event is also fired.
				// This results in two points being added very close to each other.

				// Delay adding our drag point for a short amount of time, so if the click
				// event is fired we can clear the timeout to avoid a double point.
				this.addDragPointTimeout = setTimeout(RIGHTMOVE.bind(this, function() {
					this.addDragPointTimeout = null;
					this.polygon.insertVertex(this.polygon.getVertexCount(), this.mouseUpLatLng);
					this.polygon.enableDrawing({maxVertices: this.maxPolygonVertices});
					this.polygonUpdated();
				}), 5);
			}
			this.dragInfo = null;
		},

		click : function() {
			if (this.addDragPointTimeout) {
				clearTimeout(this.addDragPointTimeout);
			}
		}
	};
})();
(function() {
	var DEFINEYOURAREA = RIGHTMOVE.namespace("RIGHTMOVE.DEFINEYOURAREA");

	DEFINEYOURAREA.renamer = function() {
		var renameAjaxCall = function(id, name, callback) {
			jQuery.ajax({
				type: "POST",
				dataType : "json",
				data: {
					id : id,
					name : name
				},
				url: RIGHTMOVE.UTIL.encodeUri("/ajax/defineyourarea/renamearea.html"),
				timeout: 30000,
				success: function (data) {
					RIGHTMOVE.UTIL.typeAheadPersister.addToHistory(data.location.locId, data.location.name);
					if (callback) {
						callback(data);
					}
				}
			});
		};

		var rename = function(element, nameSelector, endCallback, startCallback) {
			var formElement = element.find(".dyarename");
			var nameElement = element.find(nameSelector);
			var textBoxElement = element.find(".dyaeditareatextbox");
			var buttonElement = element.find(".dyarenameareabutton");
			var idElement = element.find("input[name=id]");
			if (nameElement.is(':visible')) {
				nameElement.hide();
				textBoxElement.show().focus();
				buttonElement.show();
				var formSubmit = function(event) {
					event.preventDefault();
					rename(element, nameSelector, endCallback, startCallback);
				};
				buttonElement.bind("click.rename", formSubmit);
				formElement.bind("submit.rename", formSubmit);
				if (startCallback) {
					startCallback();
				}
			} else {
				var name = textBoxElement.val();
				var id = idElement.val();
				if (jQuery.trim(name) !== "") {
					renameAjaxCall(id, name, function(data) {
						nameElement.show();
						textBoxElement.hide();
						buttonElement.hide();
						buttonElement.unbind(".rename");
						formElement.unbind("rename");
						if (endCallback) {
							endCallback(data);
						}
					});
				} else {
					alert("Please enter a name for this location");
				}
			}
		};

		return {
			rename : rename
		};
	}();
})();
(function() {
	var DEFINEYOURAREA = RIGHTMOVE.namespace("RIGHTMOVE.DEFINEYOURAREA");

	DEFINEYOURAREA.saver = function() {
		var saveAjaxCall = function(locationIdentifier, polygon, name, channelUri, overwrite, callback) {
			jQuery.ajax({
				type: "POST",
				dataType : "json",
				data: {
					locationIdentifier : locationIdentifier,
					name : name || "",
					polygon : DEFINEYOURAREA.getPolygonLatLngs(polygon),
					channelUri : channelUri,
					overwrite : overwrite
				},
				url: RIGHTMOVE.UTIL.encodeUri("/ajax/defineyourarea/savearea.html"),
				timeout: 30000,
				success: function (data) {
					if (data.saveResult == "SAVED") {
						RIGHTMOVE.UTIL.typeAheadPersister.addToHistory(data.location.locId, data.location.name);
					}
					if (callback) {
						callback(data);
					}
				}
			});
		};

		var askForLocationName = function(locationIdentifier, polygon, linkForDelete, channelUri, overwrite, loginCallback, successCallback) {
			var buttons = [{name : "Save", type : "button", callback : function() {
				var name = jQuery.trim($("#dyasavename").val() || "Untitled");
				save(locationIdentifier, polygon, name, linkForDelete, channelUri, overwrite, loginCallback, successCallback);
			}}, {name : "Cancel", type : "link"}];
			var dialog = new DEFINEYOURAREA.ModalDialog(buttons, "<div class='daspopup'><span class='daspopupLogo'>&nbsp;</span><span class='daspopupText'> - Save an area</span></div>", "<p> Please enter a name for your area</p> <input type='text' id='dyasavename' maxlength='100'><br/><br/>", function() {
				$("#dyasavename").focus();
			},300, 170);
		};

		var save = function(locationIdentifier, polygon, name, linkForDelete, channelUri, overwrite, loginCallback, successCallback) {
			var dialog;
			saveAjaxCall(locationIdentifier, polygon, name, channelUri, overwrite, function(data) {
				switch (data.saveResult) {
					case "LOGIN" :
						loginCallback(function() {
							save(locationIdentifier, polygon, name || "Untitled", linkForDelete, channelUri, overwrite, loginCallback, successCallback);
						});
						break;
					case "SAVED":
						successCallback(data);
						break;
					case "NEED_NAME":
						askForLocationName(locationIdentifier, polygon, linkForDelete, channelUri, overwrite, loginCallback, successCallback);
						break;
					case "REACHED_MAXIMUM":
						var linkHtml = "";
						if (linkForDelete) {
							linkHtml = "<a href='" + linkForDelete + "'>here</a> ";
						}
						var message = "<p class='maxareas'>You can only save a <strong>maximum</strong> of 20 areas. Please <strong>delete</strong> one " + linkHtml + "in order to save this area";
						dialog = new DEFINEYOURAREA.ModalDialog([],"<div class='daspopup'><span class='daspopupLogo'>&nbsp;</span><span class='daspopupText'> - Save an area</span></div>", message);
						break;
					case "CONFIRM_OVERWRITE":
						var buttons = [{name : "Update Area", type : "button", imageType : "png", callback : function() {
							save(locationIdentifier, polygon, name || "Untitled", linkForDelete, channelUri, true, loginCallback, successCallback);
						}}, {name : "Create New Area", type : "button", imageType : "png", callback : function() {
							save(locationIdentifier, polygon, null, linkForDelete, channelUri, false, loginCallback, successCallback);
						}}];
						dialog = new DEFINEYOURAREA.ModalDialog(buttons, "<div class='daspopup'><span class='daspopupLogo'>&nbsp;</span><span class='daspopupText'> - Save area</span></div>", data.confirmOverwriteMessage);
						break;
				}
			});
		};

		var showUnsavedChangesDialog = function(callback) {
			var buttons = [{name : "Discard", callback : callback, type : "button"}, {name : "Cancel", type : "link"}];
			var dialog = new DEFINEYOURAREA.ModalDialog(buttons, "<div class='daspopup'><span class='daspopupLogo'>&nbsp;</span></div>", "<p>You have <strong>unsaved</strong> changes. Do you want to discard them?</p>");
		};

		return {
			save : save,
			showUnsavedChangesDialog : showUnsavedChangesDialog
		};
	}();
})();
(function() {
	var DEFINEYOURAREA = RIGHTMOVE.namespace("RIGHTMOVE.DEFINEYOURAREA");

	var nameSuffix = " (Drawn Area)";
	var nameSuffixLength = nameSuffix.length;

	DEFINEYOURAREA.getPolylines = function(location) {
		return location && JSON.parse(RIGHTMOVE.parseLocationIdentifier(location.locId).id).polylines;
	};

	DEFINEYOURAREA.getUserDefinedAreaId = function(location) {
		if (!DEFINEYOURAREA.isEditable(location)) {
			return null;
		}
		return location && location.locId && JSON.parse(RIGHTMOVE.parseLocationIdentifier(location.locId).id).id;
	};

	DEFINEYOURAREA.isSavedLocation = function(location) {
		return !DEFINEYOURAREA.isEditable(location) || (typeof DEFINEYOURAREA.getUserDefinedAreaId(location) === "number" && !DEFINEYOURAREA.getPolylines(location));
	};

	DEFINEYOURAREA.isSavedAndPolylinesEquals = function(location, polylines) {
		return DEFINEYOURAREA.isSavedLocation(location) &&
			   RIGHTMOVE.UTIL.polylinesEquals(location.polylines, polylines);
	};

	DEFINEYOURAREA.isOverwriteable = function(location) {
		return DEFINEYOURAREA.isEditable(location) && typeof DEFINEYOURAREA.getUserDefinedAreaId(location) === "number";
	};

	DEFINEYOURAREA.createLocationIdentifier = function(location, polylines) {
		if (DEFINEYOURAREA.isSavedAndPolylinesEquals(location, polylines)) {
			return location.locId;
		}
		var locId = {
			id : DEFINEYOURAREA.getUserDefinedAreaId(location) || undefined,
			polylines : DEFINEYOURAREA.getFirstLatLngs(polylines) || undefined
		};

		return "USERDEFINEDAREA^" + JSON.stringify(locId);
	};

	DEFINEYOURAREA.getFirstLatLngs = function(polylines) {
		return polylines[0].latLngs;
	};

	DEFINEYOURAREA.getPolygonLatLngs = function(polygon) {
		return DEFINEYOURAREA.getFirstLatLngs(RIGHTMOVE.UTIL.getEncodedPolylines(polygon));
	};

	DEFINEYOURAREA.isEditable = function(location) {
		return location.locId && location.locId.indexOf("USERDEFINEDAREA") === 0;
	};

	DEFINEYOURAREA.parseLocationFromHref = function(href) {
		var parsedUrl = RIGHTMOVE.UTIL.parseUrl(href);
		var location = null;
		jQuery.each(parsedUrl.params, function(i, item) {
			if (item.name === "json") {
				location = JSON.parse(item.value);
			}
		});

		return location;
	};

	DEFINEYOURAREA.removeNameSuffix = function(name) {
		var nameLength = name.length;
		var suffixIndex = name.lastIndexOf(nameSuffix);
		if (suffixIndex >= 0 && suffixIndex == nameLength - nameSuffixLength) {
			return name.substring(0, nameLength - nameSuffixLength);
		} else {
			return name;
		}
	};

})();
http://allinthehead.com/retro/338/supersleight-jquery-plugin
jQuery.fn.supersleight = function(settings) {
	settings = jQuery.extend({
		imgs: true,
		backgrounds: true,
		shim: 'x.gif',
		apply_positioning: true
	}, settings);

	return this.each(function(){
		if (jQuery.browser.msie && parseInt(jQuery.browser.version, 10) < 7 && parseInt(jQuery.browser.version, 10) > 4) {
			jQuery(this).find('*').andSelf().each(function(i,obj) {
				var self = jQuery(obj);
				// background pngs
				if (settings.backgrounds && self.css('background-image').match(/\.png/i) !== null) {
					var bg = self.css('background-image');
					var src = bg.substring(5,bg.length-2);
					var mode = (self.css('background-repeat') == 'no-repeat' ? 'crop' : 'scale');
					var styles = {
						'filter': "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + src + "', sizingMethod='" + mode + "')",
						'background-image': 'url('+settings.shim+')'
					};
					self.css(styles);
				};
				// image elements
				if (settings.imgs && self.is('img[src$=png]')){
					var styles = {
						'width': self.width() + 'px',
						'height': self.height() + 'px',
						'filter': "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + self.attr('src') + "', sizingMethod='scale')"
					};
					self.css(styles).attr('src', settings.shim);
				};
				// apply position to 'active' elements
				if (settings.apply_positioning && self.is('a, input') && (self.css('position') === '' || self.css('position') == 'static')){
					self.css('position', 'relative');
				};
			});
		};
	});
};
/**
 * SWFObject v1.5: Flash Player detection and embed - http://blog.deconcept.com/swfobject/
 *
 * SWFObject is (c) 2007 Geoff Stearns and is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 */
if(typeof deconcept == "undefined") var deconcept = new Object();
if(typeof deconcept.util == "undefined") deconcept.util = new Object();
if(typeof deconcept.SWFObjectUtil == "undefined") deconcept.SWFObjectUtil = new Object();
deconcept.SWFObject = function(swf, id, w, h, ver, c, quality, xiRedirectUrl, redirectUrl, detectKey) {
	if (!document.getElementById) { return; }
	this.DETECT_KEY = detectKey ? detectKey : 'detectflash';
	this.skipDetect = deconcept.util.getRequestParameter(this.DETECT_KEY);
	this.params = new Object();
	this.variables = new Object();
	this.attributes = new Array();
	if(swf) { this.setAttribute('swf', swf); }
	if(id) { this.setAttribute('id', id); }
	if(w) { this.setAttribute('width', w); }
	if(h) { this.setAttribute('height', h); }
	if(ver) { this.setAttribute('version', new deconcept.PlayerVersion(ver.toString().split("."))); }
	this.installedVer = deconcept.SWFObjectUtil.getPlayerVersion();
	if (!window.opera && document.all && this.installedVer.major > 7) {
		// only add the onunload cleanup if the Flash Player version supports External Interface and we are in IE
		deconcept.SWFObject.doPrepUnload = true;
	}
	if(c) { this.addParam('bgcolor', c); }
	var q = quality ? quality : 'high';
	this.addParam('quality', q);
	this.setAttribute('useExpressInstall', false);
	this.setAttribute('doExpressInstall', false);
	var xir = (xiRedirectUrl) ? xiRedirectUrl : window.location;
	this.setAttribute('xiRedirectUrl', xir);
	this.setAttribute('redirectUrl', '');
	if(redirectUrl) { this.setAttribute('redirectUrl', redirectUrl); }
}
deconcept.SWFObject.prototype = {
	useExpressInstall: function(path) {
		this.xiSWFPath = !path ? "expressinstall.swf" : path;
		this.setAttribute('useExpressInstall', true);
	},
	setAttribute: function(name, value){
		this.attributes[name] = value;
	},
	getAttribute: function(name){
		return this.attributes[name];
	},
	addParam: function(name, value){
		this.params[name] = value;
	},
	getParams: function(){
		return this.params;
	},
	addVariable: function(name, value){
		this.variables[name] = value;
	},
	getVariable: function(name){
		return this.variables[name];
	},
	getVariables: function(){
		return this.variables;
	},
	getVariablePairs: function(){
		var variablePairs = new Array();
		var key;
		var variables = this.getVariables();
		for(key in variables){
			variablePairs[variablePairs.length] = key +"="+ variables[key];
		}
		return variablePairs;
	},
	getSWFHTML: function() {
		var swfNode = "";
		if (navigator.plugins && navigator.mimeTypes && navigator.mimeTypes.length) { // netscape plugin architecture
			if (this.getAttribute("doExpressInstall")) {
				this.addVariable("MMplayerType", "PlugIn");
				this.setAttribute('swf', this.xiSWFPath);
			}
			swfNode = '<embed type="application/x-shockwave-flash" src="'+ this.getAttribute('swf') +'" width="'+ this.getAttribute('width') +'" height="'+ this.getAttribute('height') +'" style="'+ this.getAttribute('style') +'"';
			swfNode += ' id="'+ this.getAttribute('id') +'" name="'+ this.getAttribute('id') +'" ';
			var params = this.getParams();
			 for(var key in params){ swfNode += [key] +'="'+ params[key] +'" '; }
			var pairs = this.getVariablePairs().join("&");
			 if (pairs.length > 0){ swfNode += 'flashvars="'+ pairs +'"'; }
			swfNode += '/>';
		} else { // PC IE
			if (this.getAttribute("doExpressInstall")) {
				this.addVariable("MMplayerType", "ActiveX");
				this.setAttribute('swf', this.xiSWFPath);
			}
			swfNode = '<object id="'+ this.getAttribute('id') +'" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="'+ this.getAttribute('width') +'" height="'+ this.getAttribute('height') +'" style="'+ this.getAttribute('style') +'">';
			swfNode += '<param name="movie" value="'+ this.getAttribute('swf') +'" />';
			var params = this.getParams();
			for(var key in params) {
			 swfNode += '<param name="'+ key +'" value="'+ params[key] +'" />';
			}
			var pairs = this.getVariablePairs().join("&");
			if(pairs.length > 0) {swfNode += '<param name="flashvars" value="'+ pairs +'" />';}
			swfNode += "</object>";
		}
		return swfNode;
	},
	write: function(elementId){
		if(this.getAttribute('useExpressInstall')) {
			// check to see if we need to do an express install
			var expressInstallReqVer = new deconcept.PlayerVersion([6,0,65]);
			if (this.installedVer.versionIsValid(expressInstallReqVer) && !this.installedVer.versionIsValid(this.getAttribute('version'))) {
				this.setAttribute('doExpressInstall', true);
				this.addVariable("MMredirectURL", escape(this.getAttribute('xiRedirectUrl')));
				document.title = document.title.slice(0, 47) + " - Flash Player Installation";
				this.addVariable("MMdoctitle", document.title);
			}
		}
		if(this.skipDetect || this.getAttribute('doExpressInstall') || this.installedVer.versionIsValid(this.getAttribute('version'))){
			var n = (typeof elementId == 'string') ? document.getElementById(elementId) : elementId;
			n.innerHTML = this.getSWFHTML();
			return true;
		}else{
			if(this.getAttribute('redirectUrl') != "") {
				document.location.replace(this.getAttribute('redirectUrl'));
			}
		}
		return false;
	}
}

/* ---- detection functions ---- */
deconcept.SWFObjectUtil.getPlayerVersion = function(){
	var PlayerVersion = new deconcept.PlayerVersion([0,0,0]);
	if(navigator.plugins && navigator.mimeTypes.length){
		var x = navigator.plugins["Shockwave Flash"];
		if(x && x.description) {
			PlayerVersion = new deconcept.PlayerVersion(x.description.replace(/([a-zA-Z]|\s)+/, "").replace(/(\s+r|\s+b[0-9]+)/, ".").split("."));
		}
	}else if (navigator.userAgent && navigator.userAgent.indexOf("Windows CE") >= 0){ // if Windows CE
		var axo = 1;
		var counter = 3;
		while(axo) {
			try {
				counter++;
				axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash."+ counter);
//				document.write("player v: "+ counter);
				PlayerVersion = new deconcept.PlayerVersion([counter,0,0]);
			} catch (e) {
				axo = null;
			}
		}
	} else { // Win IE (non mobile)
		// do minor version lookup in IE, but avoid fp6 crashing issues
		// see http://blog.deconcept.com/2006/01/11/getvariable-setvariable-crash-internet-explorer-flash-6/
		try{
			var axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.7");
		}catch(e){
			try {
				var axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.6");
				PlayerVersion = new deconcept.PlayerVersion([6,0,21]);
				axo.AllowScriptAccess = "always"; // error if player version < 6.0.47 (thanks to Michael Williams @ Adobe for this code)
			} catch(e) {
				if (PlayerVersion.major == 6) {
					return PlayerVersion;
				}
			}
			try {
				axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
			} catch(e) {}
		}
		if (axo != null) {
			PlayerVersion = new deconcept.PlayerVersion(axo.GetVariable("$version").split(" ")[1].split(","));
		}
	}
	return PlayerVersion;
}
deconcept.PlayerVersion = function(arrVersion){
	this.major = arrVersion[0] != null ? parseInt(arrVersion[0]) : 0;
	this.minor = arrVersion[1] != null ? parseInt(arrVersion[1]) : 0;
	this.rev = arrVersion[2] != null ? parseInt(arrVersion[2]) : 0;
}
deconcept.PlayerVersion.prototype.versionIsValid = function(fv){
	if(this.major < fv.major) return false;
	if(this.major > fv.major) return true;
	if(this.minor < fv.minor) return false;
	if(this.minor > fv.minor) return true;
	if(this.rev < fv.rev) return false;
	return true;
}
/* ---- get value of query string param ---- */
deconcept.util = {
	getRequestParameter: function(param) {
		var q = document.location.search || document.location.hash;
		if (param == null) { return q; }
		if(q) {
			var pairs = q.substring(1).split("&");
			for (var i=0; i < pairs.length; i++) {
				if (pairs[i].substring(0, pairs[i].indexOf("=")) == param) {
					return pairs[i].substring((pairs[i].indexOf("=")+1));
				}
			}
		}
		return "";
	}
}
/* fix for video streaming bug */
deconcept.SWFObjectUtil.cleanupSWFs = function() {
	var objects = document.getElementsByTagName("OBJECT");
	for (var i = objects.length - 1; i >= 0; i--) {
		objects[i].style.display = 'none';
		for (var x in objects[i]) {
			if (typeof objects[i][x] == 'function') {
				objects[i][x] = function(){};
			}
		}
	}
}
// fixes bug in some fp9 versions see http://blog.deconcept.com/2006/07/28/swfobject-143-released/
if (deconcept.SWFObject.doPrepUnload) {
	if (!deconcept.unloadSet) {
		deconcept.SWFObjectUtil.prepUnload = function() {
			__flash_unloadHandler = function(){};
			__flash_savedUnloadHandler = function(){};
			window.attachEvent("onunload", deconcept.SWFObjectUtil.cleanupSWFs);
		}
		window.attachEvent("onbeforeunload", deconcept.SWFObjectUtil.prepUnload);
		deconcept.unloadSet = true;
	}
}
/* add document.getElementById if needed (mobile IE < 5) */
if (!document.getElementById && document.all) { document.getElementById = function(id) { return document.all[id]; }}

/* add some aliases for ease of use/backwards compatibility */
var getQueryParamValue = deconcept.util.getRequestParameter;
var FlashObject = deconcept.SWFObject; // for legacy support
var SWFObject = deconcept.SWFObject;
(function() {
	var VIDEO = RIGHTMOVE.namespace("RIGHTMOVE.VIDEO");

	VIDEO.EmbeddedVideo = function(opts) {
		var options = $.extend({
			pathToFlvVideo : '',
			width : undefined,
			height : undefined,
			videoContainerSelector : '#videoContainer',
			videoElementId : 'videoElement'
		}, opts);

		var showVideo = function(){
			var videoElement = "<div id='"+options.videoElementId+"' width='"+options.width+"' height='"+options.height+"'>You need flash installed to view this video.</div>";

			$(options.videoContainerSelector).html(videoElement);

			var so = new SWFObject('/ps/video/flash/player2.swf', 'mpl', options.width, options.height, '9');
			so.addParam('allowfullscreen','true');
			so.addParam('flashvars','file='+options.pathToFlvVideo+'');
			so.write(options.videoElementId);
		};

		return {
			showVideo : showVideo
		};
	};
})();
/**
 * jQuery.ScrollTo
 * Copyright (c) 2007-2009 Ariel Flesler - aflesler(at)gmail(dot)com | http://flesler.blogspot.com
 * Dual licensed under MIT and GPL.
 * Date: 5/25/2009
 *
 * @projectDescription Easy element scrolling using jQuery.
 * http://flesler.blogspot.com/2007/10/jqueryscrollto.html
 * Works with jQuery +1.2.6. Tested on FF 2/3, IE 6/7/8, Opera 9.5/6, Safari 3, Chrome 1 on WinXP.
 *
 * @author Ariel Flesler
 * @version 1.4.2
 *
 * @id jQuery.scrollTo
 * @id jQuery.fn.scrollTo
 * @param {String, Number, DOMElement, jQuery, Object} target Where to scroll the matched elements.
 *	  The different options for target are:
 *		- A number position (will be applied to all axes).
 *		- A string position ('44', '100px', '+=90', etc ) will be applied to all axes
 *		- A jQuery/DOM element ( logically, child of the element to scroll )
 *		- A string selector, that will be relative to the element to scroll ( 'li:eq(2)', etc )
 *		- A hash { top:x, left:y }, x and y can be any kind of number/string like above.
*		- A percentage of the container's dimension/s, for example: 50% to go to the middle.
 *		- The string 'max' for go-to-end.
 * @param {Number} duration The OVERALL length of the animation, this argument can be the settings object instead.
 * @param {Object,Function} settings Optional set of settings or the onAfter callback.
 *	 @option {String} axis Which axis must be scrolled, use 'x', 'y', 'xy' or 'yx'.
 *	 @option {Number} duration The OVERALL length of the animation.
 *	 @option {String} easing The easing method for the animation.
 *	 @option {Boolean} margin If true, the margin of the target element will be deducted from the final position.
 *	 @option {Object, Number} offset Add/deduct from the end position. One number for both axes or { top:x, left:y }.
 *	 @option {Object, Number} over Add/deduct the height/width multiplied by 'over', can be { top:x, left:y } when using both axes.
 *	 @option {Boolean} queue If true, and both axis are given, the 2nd axis will only be animated after the first one ends.
 *	 @option {Function} onAfter Function to be called after the scrolling ends.
 *	 @option {Function} onAfterFirst If queuing is activated, this function will be called after the first scrolling ends.
 * @return {jQuery} Returns the same jQuery object, for chaining.
 *
 * @desc Scroll to a fixed position
 * @example $('div').scrollTo( 340 );
 *
 * @desc Scroll relatively to the actual position
 * @example $('div').scrollTo( '+=340px', { axis:'y' } );
 *
 * @dec Scroll using a selector (relative to the scrolled element)
 * @example $('div').scrollTo( 'p.paragraph:eq(2)', 500, { easing:'swing', queue:true, axis:'xy' } );
 *
 * @ Scroll to a DOM element (same for jQuery object)
 * @example var second_child = document.getElementById('container').firstChild.nextSibling;
 *			$('#container').scrollTo( second_child, { duration:500, axis:'x', onAfter:function(){
 *				alert('scrolled!!');
 *			}});
 *
 * @desc Scroll on both axes, to different values
 * @example $('div').scrollTo( { top: 300, left:'+=200' }, { axis:'xy', offset:-20 } );
 */
;(function( $ ){

	var $scrollTo = $.scrollTo = function( target, duration, settings ){
		$(window).scrollTo( target, duration, settings );
	};

	$scrollTo.defaults = {
		axis:'xy',
		duration: parseFloat($.fn.jquery) >= 1.3 ? 0 : 1
	};

	// Returns the element that needs to be animated to scroll the window.
	// Kept for backwards compatibility (specially for localScroll & serialScroll)
	$scrollTo.window = function( scope ){
		return $(window)._scrollable();
	};

	// Hack, hack, hack :)
	// Returns the real elements to scroll (supports window/iframes, documents and regular nodes)
	$.fn._scrollable = function(){
		return this.map(function(){
			var elem = this,
				isWin = !elem.nodeName || $.inArray( elem.nodeName.toLowerCase(), ['iframe','#document','html','body'] ) != -1;

				if( !isWin )
					return elem;

			var doc = (elem.contentWindow || elem).document || elem.ownerDocument || elem;

			return $.browser.safari || doc.compatMode == 'BackCompat' ?
				doc.body :
				doc.documentElement;
		});
	};

	$.fn.scrollTo = function( target, duration, settings ){
		if( typeof duration == 'object' ){
			settings = duration;
			duration = 0;
		}
		if( typeof settings == 'function' )
			settings = { onAfter:settings };

		if( target == 'max' )
			target = 9e9;

		settings = $.extend( {}, $scrollTo.defaults, settings );
		// Speed is still recognized for backwards compatibility
		duration = duration || settings.speed || settings.duration;
		// Make sure the settings are given right
		settings.queue = settings.queue && settings.axis.length > 1;

		if( settings.queue )
			// Let's keep the overall duration
			duration /= 2;
		settings.offset = both( settings.offset );
		settings.over = both( settings.over );

		return this._scrollable().each(function(){
			var elem = this,
				$elem = $(elem),
				targ = target, toff, attr = {},
				win = $elem.is('html,body');

			switch( typeof targ ){
				// A number will pass the regex
				case 'number':
				case 'string':
					if( /^([+-]=)?\d+(\.\d+)?(px|%)?$/.test(targ) ){
						targ = both( targ );
						// We are done
						break;
					}
					// Relative selector, no break!
					targ = $(targ,this);
				case 'object':
					// DOMElement / jQuery
					if( targ.is || targ.style )
						// Get the real position of the target
						toff = (targ = $(targ)).offset();
			}
			$.each( settings.axis.split(''), function( i, axis ){
				var Pos	= axis == 'x' ? 'Left' : 'Top',
					pos = Pos.toLowerCase(),
					key = 'scroll' + Pos,
					old = elem[key],
					max = $scrollTo.max(elem, axis);

				if( toff ){// jQuery / DOMElement
					attr[key] = toff[pos] + ( win ? 0 : old - $elem.offset()[pos] );

					// If it's a dom element, reduce the margin
					if( settings.margin ){
						attr[key] -= parseInt(targ.css('margin'+Pos)) || 0;
						attr[key] -= parseInt(targ.css('border'+Pos+'Width')) || 0;
					}

					attr[key] += settings.offset[pos] || 0;

					if( settings.over[pos] )
						// Scroll to a fraction of its width/height
						attr[key] += targ[axis=='x'?'width':'height']() * settings.over[pos];
				}else{
					var val = targ[pos];
					// Handle percentage values
					attr[key] = val.slice && val.slice(-1) == '%' ?
						parseFloat(val) / 100 * max
						: val;
				}

				// Number or 'number'
				if( /^\d+$/.test(attr[key]) )
					// Check the limits
					attr[key] = attr[key] <= 0 ? 0 : Math.min( attr[key], max );

				// Queueing axes
				if( !i && settings.queue ){
					// Don't waste time animating, if there's no need.
					if( old != attr[key] )
						// Intermediate animation
						animate( settings.onAfterFirst );
					// Don't animate this axis again in the next iteration.
					delete attr[key];
				}
			});

			animate( settings.onAfter );

			function animate( callback ){
				$elem.animate( attr, duration, settings.easing, callback && function(){
					callback.call(this, target, settings);
				});
			};

		}).end();
	};

	// Max scrolling position, works on quirks mode
	// It only fails (not too badly) on IE, quirks mode.
	$scrollTo.max = function( elem, axis ){
		var Dim = axis == 'x' ? 'Width' : 'Height',
			scroll = 'scroll'+Dim;

		if( !$(elem).is('html,body') )
			return elem[scroll] - $(elem)[Dim.toLowerCase()]();

		var size = 'client' + Dim,
			html = elem.ownerDocument.documentElement,
			body = elem.ownerDocument.body;

		return Math.max( html[scroll], body[scroll] )
			 - Math.min( html[size]  , body[size]   );

	};

	function both( val ){
		return typeof val == 'object' ? val : { top:val, left:val };
	};

})( jQuery );
