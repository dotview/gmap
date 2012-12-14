 
// define only global variable - everything else should sit under here
var RIGHTMOVE = {};

(function() {
	// This was nicked from YUI
	RIGHTMOVE.namespace = function() {
		var a=arguments, namespace=null, i, j, namspaceStrings;

		var getStartIndex = function(firstItem) {
			return (firstItem == "RIGHTMOVE") ? 1 : 0;
		};

		for (i=0; i<a.length; i=i+1) {
			namspaceStrings=(""+a[i]).split(".");
			namespace=RIGHTMOVE;

			// RIGHTMOVE is implied, so it is ignored if it is included
			for (j=getStartIndex(namspaceStrings[0]); j<namspaceStrings.length; j=j+1) {
				namespace[namspaceStrings[j]]=namespace[namspaceStrings[j]] || {};
				namespace=namespace[namspaceStrings[j]];
			}
		}

		return namespace;
	};

	RIGHTMOVE.bind = function(thisObject, bindFunction) {
		return function() {
			return bindFunction.apply(thisObject, arguments);
		};
	};

	// Caches the results of calls to a function - see http://talideon.com/weblog/2005/07/javascript-memoization.cfm
	// Function arguments cannot include objects
	RIGHTMOVE.memoize = function(func) {
		var cache = {};

		return function() {
			// arguments are not a true array - see http://shifteleven.com/articles/2007/06/28/array-like-objects-in-javascript
			var args = Array.prototype.slice.call(arguments);

			if (!(args in cache)) {
				cache[args] = func.apply(null, args);
			}

			return cache[args];
		};
	};

	RIGHTMOVE.parseLocationIdentifier = function(locId) {
		var firstHat = locId.indexOf("^");
		if (firstHat > 0 && firstHat < locId.length - 1) {
			return {
				type : locId.substring(0, firstHat),
				id : locId.substring(firstHat + 1)
			};
		} else {
			return null;
		}
	};

	RIGHTMOVE.copyObject = function(object, deep) {
		return deep ? jQuery.extend(true, {}, object) : jQuery.extend({}, object);
	};

	jQuery.ajaxSettings.traditional = true;

	RIGHTMOVE.bindWithOriginalThis = function(thisObject, bindFunction, returnOriginalThis) {
		return function() {
			var args = Array.prototype.slice.call(arguments);
			if (returnOriginalThis) {
				args.unshift(this);
			}
			return bindFunction.apply(thisObject, args);
		};
	};

	var asyncScripts = {};
	RIGHTMOVE.loadJSAsync = function(src, onload, loader) {
		var onLoad = function(scriptData) {
			scriptData.state = "loaded";
			jQuery.each(scriptData.callbacks, function(i, callback) {
				callback();
			});
		};
		var scriptData = asyncScripts[src];
		if (!scriptData) {
			scriptData = asyncScripts[src] = {state: "loading", callbacks : onload ? [onload] : []};
			var script = document.createElement('script'); script.type = 'text/javascript'; script.async = true;
			script.src = src;
			var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(script, s);
			script.onload = function() {
				if (!script.onloadDone) {
					script.onloadDone = true;
					onLoad(scriptData);
				}
			};
			script.onreadystatechange = function() {
				if (( "loaded" === script.readyState || "complete" === script.readyState ) && !script.onloadDone) {
					script.onloadDone = true;
					onLoad(scriptData);
				}
			};
		} else if (scriptData.state === "loading") {
			scriptData.callbacks.push(onload);
		} else {
			onload();
		}
	};

	RIGHTMOVE.createHistory = function() {
		window.dhtmlHistory.create({
			toJSON: function(o) {
				return JSON.stringify(o);
			},
			fromJSON: function(s) {
				return JSON.parse(s);
			},
			blankURL : "/ps/blank.html"
		});
	};
})();
 

(function() {
	var UTIL = RIGHTMOVE.namespace("RIGHTMOVE.UTIL");

	UTIL.centreElement = function(element, wrapper) {
		element.css({
			left : ((wrapper.width() - element.width()) / 2) + "px",
			top : ((wrapper.height() - element.height()) / 2) + "px"
		});
	};
})();
(function() {
	var UTIL = RIGHTMOVE.namespace("RIGHTMOVE.UTIL");

	UTIL.forwardEvents = function(eventNames, from, to, namespace) {
		for (var i = eventNames.length - 1; i >= 0; i--) {
			UTIL.forwardEvent(eventNames[i], from, to, namespace);
		}
	};

	UTIL.forwardEvent = function(eventName, from, to, namespace) {
		namespace = namespace || '';
		$(from).bind(eventName + namespace, function(event, data) {
			$(to).trigger(eventName, data);
		});
	};
})();
(function() {
	var UTIL = RIGHTMOVE.namespace("RIGHTMOVE.UTIL");

	var hasFlash = function() {
		try {
			var fo = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
			return !!fo;
		} catch(e) {
			return navigator.mimeTypes ["application/x-shockwave-flash"] !== undefined;
		}
	};

	UTIL.getFlashOrBanner = function(flashLink, bannerHtml, anchorId) {
		if (hasFlash()) {
			return ['<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=8,0,0,0" width="930" height="100" id="' + anchorId + '" align="middle"><PARAM NAME=movie VALUE="',
				flashLink,
				'"><PARAM NAME=quality VALUE=high><PARAM NAME=bgcolor VALUE=#FFFFFF><param name="wmode" value="transparent"><EMBED src="',
				flashLink,
				'" quality=high bgcolor=#FFFFFF width="930" height="100" NAME="DrawSearch_DYNAMICTEST2" TYPE="application/x-shockwave-flash" PLUGINSPAGE="http://www.macromedia.com/go/getflashplayer" wmode="transparent"></EMBED></OBJECT>'
				].join("");
		} else {
			return bannerHtml;
		}
	};
})();
(function() {
	var UTIL = RIGHTMOVE.namespace("RIGHTMOVE.UTIL");

	UTIL.getFormElements = function(form) {
		return form.map(function(){
			return this.elements ? jQuery.makeArray(this.elements) : this;
		})
		.filter(function(){
			return this.name && !this.disabled &&
				(/select|textarea/i.test(this.nodeName) ||
					/text|hidden|password|search|radio|checkbox/i.test(this.type));
		});

	};

})();
$.fn.clearForm = function() {
	return this.each(function() {
		var type = this.type, tag = this.tagName.toLowerCase();
		if (tag === 'form') {
			return $(':input', this).clearForm();
		}
		if (type == 'text' || type == 'password' || tag == 'textarea') {
			this.value = '';
		} else if (type == 'checkbox' || type == 'radio') {
			this.checked = false;
		} else if (tag == 'select') {
			this.selectedIndex = -1;
		}
	});
};

(function($) {

	$.fn.simpleAjaxSubmit = function(beforeSubmit,parameters,callback,afterSubmit) {
		return this.each(function() {

			var inputs = [];
			$("input[type=radio][checked], input[type=checkbox][checked], input[type=text], input[type=hidden], textarea", this).each(function() {
				inputs.push(this.name + '=' + encodeURI(this.value));
			});
			$("option[selected]", this).each(function() {
				inputs.push($(this).parent()[0].name + '=' + encodeURI(this.value));
			});
			for (var param in parameters) {
				if (parameters.hasOwnProperty(param)) {
					inputs.push(param+"="+encodeURI(parameters[param]));
				}
			}

			inputs.push("ajax="+encodeURI(true));

			var isFormValid = true;
			if (jQuery.isFunction(beforeSubmit)){
				isFormValid = beforeSubmit(inputs);
			}

			if (isFormValid) {
				var xhr = jQuery.ajax({
					data: inputs.join('&'),
					type: "POST",
					dataType: "json",
					url: this.action,
					timeout: 60000,
					success: function(json) {
						callback(json);
					}
				});

				if (jQuery.isFunction(afterSubmit)){
					afterSubmit(xhr);
				}
			}
		});
	};

})(jQuery);
(function() {
	var UTIL = RIGHTMOVE.namespace("RIGHTMOVE.UTIL");

	UTIL.loadTime = function() {
		var options;
		var readyTime;

		var record = function() {
			if (Math.floor(10*Math.random()) === 0) {
				var imgTimer = new Image();
				imgTimer.src=[
					'/ps/images/logging/timer.gif?',
					'p=',
					options.uri,
					'&t=',
					(new Date().getTime() - options.jsTime),
					'&r=',
					readyTime,
					'&rt=',
					options.reqTime.substring(2),
					'&trcid=',
					options.trcid,
					'&svr=',
					options.svr
				].join('');
			}
		};

		var init = function(opts) {
			options = opts;
			$(document).ready(function() {
				readyTime = new Date().getTime() - options.jsTime;
			});
			$(window).load(record);
		};

		return {
			init : init
		};
	}();
})();
 
(function() {
	var UTIL = RIGHTMOVE.namespace("RIGHTMOVE.UTIL");

	UTIL.nyroModalFastAnimation = {
		showLoading: function(elts, settings, callback) { callback(); },
		
		showContent : function(elts, settings, callback) {
			elts.contentWrapper.css({
				width: settings.width+'px',
				height: settings.height+'px',
				marginTop: settings.marginTop+'px',
				marginLeft: settings.marginLeft+'px'
			})
			.show();
			callback();
		},
		hideContent : function(elts, settings, callback) {
			elts.contentWrapper.hide();
			callback();
		},
		showBackground : function (elts, settings, callback) {
			elts.bg.css({opacity:0}).fadeTo(1, 0.75, callback);
		},
		hideBackground : function(elts, settings, callback) {
			elts.bg.hide();
			callback();
		},
		resize : function(elts, settings, callback) {
			elts.contentWrapper.css({
				width: settings.width+'px',
				height: settings.height+'px',
				marginLeft: settings.marginLeft+'px',
				marginTop: settings.marginTop+'px'
			});
			callback();
		}
	};
})();
jQuery(document).ready(function() {
	jQuery('body').addClass("js");
});
(function() {
	var UTIL = RIGHTMOVE.namespace("RIGHTMOVE.UTIL");

	UTIL.openAttributeWindowWithName = function(url, windowName, windowAttributes) {
		var popupWin = null;
		try {
			if(url) {
				if (windowAttributes) {
					popupWin = window.open(url, windowName, windowAttributes);
				} else {
					// Open Normal window
					popupWin = window.open(url, windowName);
				}
				popupWin.focus();
				return true;
			}
		}
		catch(e){
			// Do nothing
		}
		// Window has NOT opened with JS a href is needed
		return false;
	};
})();
 
 
(function() {
	var UTIL = RIGHTMOVE.namespace("RIGHTMOVE.UTIL");

	var mapLoadedAsync = false;
	var mapLoadedCallbacks = [];

	var getOffset = function(val1, val2, vertexRatio) {
		var diff = val2 - val1;
		return (diff * vertexRatio - diff) / 2;
	};

	UTIL.scaleGLatLngBounds = function(bounds, vertexRatio) {
		var sw = bounds.getSouthWest();
		var ne = bounds.getNorthEast();
		var latOffset = getOffset(sw.lat(), ne.lat(), vertexRatio);
		var lngOffset = getOffset(sw.lng(), ne.lng(), vertexRatio);
		return new GLatLngBounds(
				new GLatLng(sw.lat() - latOffset, sw.lng() - lngOffset),
				new GLatLng(ne.lat() + latOffset, ne.lng() + lngOffset)
				);
	};

	UTIL.gLatLngToString = function(gLatLng) {
		return [gLatLng.lat(), ",", gLatLng.lng()].join("");
	};

	UTIL.gLatLngBoundsToString = function(bounds) {
		return [bounds.getSouthWest().lng().toFixed(5),",",bounds.getNorthEast().lng().toFixed(5),",",bounds.getSouthWest().lat().toFixed(5),",",bounds.getNorthEast().lat().toFixed(5)].join("");
	};

	UTIL.stringToGLatLngBounds = function(string) {
		var coords = string.split(',');
		return new GLatLngBounds(
				new GLatLng(coords[2], coords[0]),
				new GLatLng(coords[3], coords[1])
				);
	};

	UTIL.createGPolygonUsingEncodedPolylines = function(options) {
		var length = options.polylines.length;
		var gpolylines = [];
		for (var i = 0; i < length; i++) {
			var polyline = options.polylines[i];
			gpolylines.push({
				color : options.colour,
				weight : options.weight,
				opacity : options.lineOpacity,
				points : polyline.latLngs,
				numLevels : polyline.numLevels,
				levels : polyline.levels,
				zoomFactor : 2
			});
		}

		return new GPolygon.fromEncoded({
			polylines : gpolylines,
			fill : options.fillColour,
			color : options.fillColour,
			opacity : options.fillOpacity,
			outline : true
		});
	};

	UTIL.createGLatLng = function(latLng) {
		return new GLatLng(latLng.lat, latLng.lng);
	};

	UTIL.createGLatLngBounds = function(bounds) {
		return new GLatLngBounds(
				new GLatLng(bounds.min.lat, bounds.min.lng),
				new GLatLng(bounds.max.lat, bounds.max.lng)
				);
	};

	UTIL.createBounds = function(gLatLngBounds) {
		var sw = gLatLngBounds.getSouthWest();
		var ne = gLatLngBounds.getNorthEast();
		return {
			min : { lat : sw.lat(), lng : sw.lng() },
			max : { lat : ne.lat(), lng : ne.lng() }
		};
	};

	UTIL.polylinesEquals = function(polylines1, polylines2) {
		if (!polylines1 || !polylines2 || polylines1.length !== polylines2.length) {
			return false;
		}

		for (var i = polylines1.length - 1; i >= 0; i--) {
			var polyline1 = polylines1[i];
			var polyline2 = polylines2[i];
			if (polyline1.latLngs !== polyline2.latLngs ||
				polyline1.numLevels !== polyline2.numLevels ||
				polyline1.levels !== polyline2.levels) {
				return false;
			}
		}

		return true;
	};

	UTIL.locationEquals = function(loc1, loc2) {
		if (!loc1 && !loc2) {
			return true;
		}
		if (!loc1 || !loc2) {
			return false;
		}

		return loc1.locId === loc2.locId && (loc1.radius || 0) === (loc2.radius || 0);
	};

	UTIL.compareGLatLng = function(a, b) {
		return b.lat() - a.lat() || a.lng() - b.lng();
	};

	UTIL.gBoundsOverlap = function(a, b) {
		return a.minX <= b.maxX && a.maxX >= b.minX && a.minY <= b.maxY && a.maxY >= b.minY;
	};

	UTIL.getPolygonGLatLngs = function(polygon) {
		var gLatLngs = [];
		var numPoints = polygon.getVertexCount();
		for (var i = 0; i < numPoints; i++) {
			gLatLngs.push(polygon.getVertex(i));
		}

		return gLatLngs;
	};

	UTIL.resizeToBottom = function(elem, minHeight, padding) {
		if (elem.length > 0) {
			minHeight = minHeight || 0;
			padding = padding || 0;
			var elemOuterExtra = elem.outerHeight() - elem.height();
			elem.height(Math.floor(Math.max(minHeight, $(window).height()) - padding - elem.offset().top - elemOuterExtra - 2));
		}
	};

	var encodeDimension = function(value) {
		var encoded = [];
		value = value << 1;
		if (value < 0) {
			value = ~value;
		}

		do {
			var chunk = value & 0x1F;
			value = value >> 5;
			if (value > 0) {
				chunk |= 0x20;
			}
			encoded.push(String.fromCharCode(chunk + 63));
		}
		while (value !== 0);

		return encoded.join("");
	};

	UTIL.getEncodedPolylines = function(polygon) {
		var gLatLngs = UTIL.getPolygonGLatLngs(polygon);
		var latLngs = [];
		var levels = [];
		var previous = {lat: 0, lng : 0};
		jQuery.each(gLatLngs, function(i, gLatLng) {
			var current = {
				lat : (gLatLng.lat() * 100000).toFixed(0),
				lng : (gLatLng.lng() * 100000).toFixed(0)
			};
			latLngs.push(encodeDimension(current.lat - previous.lat));
			latLngs.push(encodeDimension(current.lng - previous.lng));
			levels.push("P");
			previous = current;
		});

		return [{
			latLngs : latLngs.join(""),
			numLevels : 18,
			levels : levels.join("")
		}];
	};

	UTIL.centreMap = function(map, bounds, maxZoom) {
		maxZoom = maxZoom || 16;
		var centre = bounds.getCenter();
		var zoomLevel = Math.min(map.getBoundsZoomLevel(bounds), maxZoom);
		map.setCenter(centre, zoomLevel);
	};

	UTIL.limitMapRange = function(map, minZoom, maxZoom, bounds) {
		if (minZoom || maxZoom) {
			var mapTypes = map.getMapTypes();
			jQuery.each(mapTypes, function(i, mapType) {
				if (minZoom) {
					mapType.getMinimumResolution = function() { return minZoom; };
				}
				if (maxZoom) {
					mapType.getMinimumResolution = function() { return maxZoom; };
				}
			});
		}

		GEvent.addListener(map, "move", function() {
			// Perform the check and return if OK
			if (bounds.contains(map.getCenter())) {
				return;
			}
			var c = map.getCenter();
			var x = c.lng();
			var y = c.lat();

			var maxX = bounds.getNorthEast().lng();
			var maxY = bounds.getNorthEast().lat();
			var minX = bounds.getSouthWest().lng();
			var minY = bounds.getSouthWest().lat();

			x = Math.min(Math.max(x, minX), maxX);
			y = Math.min(Math.max(y, minY), maxY);

			map.setCenter(new GLatLng(y, x));
		});
	};

	UTIL.loadMapAsync = function(channel, callback) {
		if (!mapLoadedAsync) {
			mapLoadedCallbacks.push(callback);
			google.load("maps","2", {
				other_params:"client=gme-rightmove&amp;channel=" + channel + "&amp;sensor=false",
				callback : function() {
					jQuery.each(mapLoadedCallbacks, function(i, callback) {
						callback();
					});
					mapLoadedCallbacks = null;
				}
			});
			mapLoadedAsync = true;
		} else if (mapLoadedCallbacks) {
			mapLoadedCallbacks.push(callback);
		} else {
			callback();
		}
	};
})();
(function() {
	var UTIL = RIGHTMOVE.namespace("RIGHTMOVE.UTIL");

	UTIL.parseUrl = function(url) {
		var result = {
			protocol : null,
			domainAndPort : null,
			path : null,
			queryString : null,
			params : null
		};

		var relativeUrl;

		if (url.indexOf("http://") === 0 || url.indexOf("https://") === 0 || url.indexOf("ftp://") === 0 ) {
			result.protocol = url.substr(0, url.indexOf(":"));
			var relativeStart = url.indexOf("/", 8);
//			bug with - result.domainAndPort = url.substr(url.indexOf("//") + 2, relativeStart);
			var endTrimmedFirst =   url.substr(0, relativeStart);
			result.domainAndPort = endTrimmedFirst.substr(endTrimmedFirst.indexOf("//") + 2);
			relativeUrl = url.substr(relativeStart);
		} else {
			relativeUrl = url;
		}

		var qsIndex = relativeUrl.indexOf("?");

		if (qsIndex > 0) {
			result.path = relativeUrl.substr(0, qsIndex);
			result.queryString = relativeUrl.substr(qsIndex + 1);
			result.params = UTIL.parseQueryString(result.queryString);
		} else {
			result.path = relativeUrl;
		}

		return result;
	};

	UTIL.buildUrl = function(parsedUrl) {
		var parts = [];
		if (parsedUrl.domainAndPort) {
			parts.push(parsedUrl.protocol || "http:");
			parts.push("://");
			parts.push(parsedUrl.domainAndPort);
		}
		parts.push(parsedUrl.path);
		parts.push(parsedUrl.queryString);

		return parts.join('');
	};

	UTIL.parseQueryString = function(queryString) {
		var params = [];
		if (queryString.charAt(0) === "?" || queryString.charAt(0) === "#") {
			queryString = queryString.substr(1);
		}
		if (queryString.length > 0) {
			var namesAndVals = queryString.split("&");
			for (var i = 0; i < namesAndVals.length; i++) {
				var nameVal = namesAndVals[i].split("=");
				params.push({name : nameVal[0], value : nameVal[1] && decodeURIComponent(nameVal[1].replace(/\+/g, "%20"))});
			}
		}
		return params;
	};

	UTIL.parseQueryStringToMap = function(queryString) {
		return UTIL.paramsToMap(UTIL.parseQueryString(queryString));
	};

	UTIL.paramsToMap = function(params) {
		var map = {};
		jQuery.each(params, function(i, param) {
			var name = param.name;
			if (map[name] === undefined) {
				map[name] = [];
			}
			map[name].push(param.value);
		});
		return map;
	};

	UTIL.missingParams = function(map1, map2) {
		var missing = [];
		for (var name in map1) {
			if (map1.hasOwnProperty(name)) {
				var values1 = map1[name];
				var values2 = map2[name];
				for (var i = 0; i < values1.length; i++) {
					var value = values1[i];
					if (values2 === undefined || jQuery.inArray(value, values2) === -1) {
						missing.push({name : name, value : value});
					}
				}
			}
		}
		return missing;
	};

	UTIL.buildQueryString = function(params) {
		var qsParams = [];
		for (var i = 0; i < params.length; i++) {
			var param = params[i];
			qsParams.push(param.name + "=" + encodeURIComponent(param.value));
		}
		return qsParams.join("&");
	};

	UTIL.getUrlParam = function(url, name) {
		name = name.replace(/[\[]/,"\\[").replace(/[\]]/,"\\]");
		var regexS = "[\\?&]"+name+"=([^&#]*)";
		var regex = new RegExp( regexS );
		var results = regex.exec( unescape(url) );
		if( results === null ) {
			return "";
		} else {
			return results[1];
		}
	};

	UTIL.isParamExists = function(url, param) {
		param = param.replace(/[\[]/,"\\[").replace(/[\]]/,"\\]");
		var regexS = "[\\?&#]"+param+"=([^&#]*)";
		var regex = new RegExp( regexS );
		var results = regex.exec( unescape(url) );
		return results !== null;
	};

	UTIL.removeAnchorFromURL = function(url) {
		var anchor_index = url.indexOf('#');
		if (anchor_index != -1) {
			return url.substring(0, anchor_index);
		}
		return url;
	};

	UTIL.encodeUri = function(uri){
		var encodeString = RIGHTMOVE.UTIL.encodedUrl;
		var parsedEncoder = UTIL.parseUrl(encodeString);
		var parsedUri = UTIL.parseUrl(uri);
		var encoderSuffix = parsedEncoder.path.substring(parsedEncoder.path.indexOf("/"), parsedEncoder.path.length);
		if (encoderSuffix === "/") { encoderSuffix = ""; }
		var encodedUri = "";
		if(!parsedEncoder.protocol){
			if (parsedUri.protocol){
				encodedUri = parsedUri.protocol + "://";
				if (parsedUri.domainAndPort){
					encodedUri += parsedUri.domainAndPort;
				}
			}
		}
		else {
			encodedUri = parsedEncoder.protocol + "://";
			if (parsedEncoder.domainAndPort){
				encodedUri += parsedEncoder.domainAndPort;
			}

		}
		encodedUri += parsedUri.path + encoderSuffix;
		if(parsedUri.queryString){
			encodedUri += "?" + parsedUri.queryString;
		}
		return encodedUri;
	};

	UTIL.getHash = function(uri) {
		return (uri.split("#")[1] || "");
	};

	UTIL.removeParameter = function(uri, parameter) {
		uri = uri.replace(new RegExp("[&]" + parameter + "=[^#&]*", "g"), "");
		return uri.replace(new RegExp(parameter + "=[^#&]*&?", "g"), "");
	};

	UTIL.appendParameter = function(uri, parameter, value) {
		var appendChar = (uri.indexOf("?") >= 0 ? "&" : "?");

		var index = uri.indexOf("#");
		if(index >= 0){
			uri = uri.substring(0, index) + appendChar + parameter + "=" + value + uri.substring(index);
		}
		else {
			uri = uri + appendChar + parameter + "=" + value;
		}

		return uri;
	};

	UTIL.setParameter = function(uri, parameter, value) {
		if(UTIL.isParamExists(uri, parameter)){
			uri = UTIL.removeParameter(uri, parameter);
		}

		uri = UTIL.appendParameter(uri, parameter, value);

		return uri;
	};

	UTIL.getHashOrQuery = function(uri) {
		if (!uri) {
			uri = window.location.search;
		}
		if (uri.charAt(0) === '#') {
			uri = uri.substr(1);
		}
		// IE8 sometimes encodes the hash
		if (uri && uri.indexOf('=') === -1) {
			uri = decodeURIComponent(uri);
		}
		return uri;
	};

	UTIL.getCurrentHash = function() {
		return (location.href.split("#")[1] || "");
	};
})();

(function() {
	var UTIL = RIGHTMOVE.namespace("RIGHTMOVE.UTIL");

	UTIL.clientPersister = function () {
		var persister = 'none';
		var storage;
		var alreadyStarted = false;
		var onStartedList = [];
		var isStarted = function() {
			return alreadyStarted;
		};
		var setOnStarted = function(pOnStarted) {
			if (alreadyStarted) {
				pOnStarted();
			} else {
				onStartedList.push(pOnStarted);
			}
		};
		var startup = function() {
			alreadyStarted = true;
			jQuery.each(onStartedList, function(i, fn) {
				fn();
			});
		};

		
		var init = function() {
			try {
				if (typeof localStorage == 'object') {
					persister = 'localStorage';
				}
				else if (typeof globalStorage == 'object') {
					persister = 'globalstorage';
				}
				else if (jQuery.browser.msie) {
					persister = 'ie';
				}

				if (persister == 'ie') {
					jQuery('body').append('<iframe src="/ps/data.html" style="width:0px; height:0px; border: 0px" name="rmIEDataFrame"></iframe>');
				}
				else if (persister == 'localStorage') {
					startup();
				}
				else if (persister == 'globalstorage') {
					storage = globalStorage[window.location.hostname];
					startup();
				}
			}
			catch(err) {
			}
		};
		var get = function(pKey) {
			if (!alreadyStarted) {
				return null;
			}
			if (persister == 'ie') {
				var rmDataFrame = document.frames.rmIEDataFrame;
				var result = rmDataFrame.RIGHTMOVE_UTIL_Persister_Get(pKey);
				return result;
			}
			else if (persister == 'localStorage') {
				return localStorage[pKey];
			}
			else if (persister == 'globalstorage') {
				return storage.getItem(pKey).value;
			}
			else {
				return null;
			}
		};

		var save = function(pKey, pValue) {
			if (!alreadyStarted) {
				return null;
			}
			if (persister == 'ie') {
				var rmDataFrame = document.frames.rmIEDataFrame;
				rmDataFrame.RIGHTMOVE_UTIL_Persister_Save(pKey, pValue);

			}
			else if (persister == 'localStorage') {
				localStorage[pKey] = pValue;
			}
			else if (persister == 'globalstorage') {
				storage.setItem(pKey, pValue);
			}
		};

		var getObj = function(pKey) {
			try {
				return JSON.parse(get(pKey));
			}
			catch(err) {
				return null;
			}
		};

		var saveObj = function(pKey, pValue) {
			try {
				if (pValue) {
					save(pKey, JSON.stringify(pValue));
				}
				else {
					save(pKey, null);
				}
			}
			catch(err) {
				return null;
			}
		};

		var getArray = function(pKey) {
			var arr = UTIL.clientPersister.getObj(pKey);
			if (arr && (arr instanceof Array)) {
				return arr;
			}
			else {
				return [];
			}
		};

		return {
			isStarted : isStarted,
			setOnStarted : setOnStarted,
			startup : startup,
			init : init,
			get : get,
			save : save,
			getObj : getObj,
			saveObj : saveObj,
			getArray : getArray
		};
	}();

	jQuery(document).ready(function() {
		UTIL.clientPersister.init();
	});

	UTIL.typeAheadPersister = function () {
		var getLatestItemFromHistory = function() {
			var myclientpersister = UTIL.clientPersister;
			var myArr = myclientpersister.getArray("typeAheadHist");
			if(myArr.length === 0){
				return null;
			}
			return myArr[0];
		};

		var getHistory = function() {
			var myclientpersister = UTIL.clientPersister;
			var result = myclientpersister.getArray("typeAheadHist");
			//please remove the REGION^93917 and BRANCH check (and this comment) any time after sept 2010, is here to clean up bad data
			result = jQuery.grep(result, function(e, i) {
				return e.locationIdentifier && e.displayName && e.locationIdentifier != 'REGION^93917' && !e.locationIdentifier.match(/^BRANCH/);
			});
			myclientpersister.saveObj("typeAheadHist", result);
			return result;
		};

		var getHistoryWhenReady = function(callback, timeout) {
			var timeoutId = null, timedOut = false;
			if (timeout) {
				timeoutId = setTimeout(function() {
					timedOut = true;
					callback(null);
				}, timeout);
			}
			UTIL.clientPersister.setOnStarted(function() {
				if (!timedOut) {
					if (timeoutId !== null) {
						clearTimeout(timeoutId);
					}
					callback(getHistory());
				}
			});
		};

		var addToHistoryNow = function(locationIdentifier, displayName) {
			if (locationIdentifier && displayName) {
				var typeAheadLocation = {
					locationIdentifier : locationIdentifier,
					displayName : displayName
				};
				var myclientpersister = UTIL.clientPersister;
				var arr = myclientpersister.getArray("typeAheadHist");

				arr = jQuery.grep(arr, function(elementOfArray, indexInArray) {
					return elementOfArray.locationIdentifier != typeAheadLocation.locationIdentifier;
				});

				arr.unshift(typeAheadLocation);
				arr.splice(30);
				myclientpersister.saveObj("typeAheadHist", arr);
			}
		};

		var addToHistory = function(locationIdentifier, displayName) {
			UTIL.clientPersister.setOnStarted(function() {
				addToHistoryNow(locationIdentifier, displayName);
			});
		};

		var removeFromHistoryNow = function(locationIdentifier) {
			var myclientpersister = UTIL.clientPersister;
			var arr = myclientpersister.getArray("typeAheadHist");

			arr = jQuery.grep(arr, function(elementOfArray, indexInArray) {
				return elementOfArray.locationIdentifier != locationIdentifier;
			});

			myclientpersister.saveObj("typeAheadHist", arr);
		};

		var removeFromHistory = function(locationIdentifier) {
			UTIL.clientPersister.setOnStarted(function() {
				removeFromHistoryNow(locationIdentifier);
			});
		};



		return {
			getHistory : getHistory,
			getHistoryWhenReady : getHistoryWhenReady,
			getLatestItemFromHistory : getLatestItemFromHistory,
			addToHistory : addToHistory,
			removeFromHistory : removeFromHistory
		};
	}();

	UTIL.sellersAreaLocationPersister = function() {

		var getLatestLocation = function() {
			var myclientpersister = UTIL.clientPersister;
			var myArr = myclientpersister.getArray("pcrLocationList");
			if(myArr.length === 0){
				return null;
			}
			return myArr[0];
		};

		var getLocations = function() {
			var myclientpersister = UTIL.clientPersister;
			var result = myclientpersister.getArray("pcrLocationList");
			result = jQuery.grep(result, function(e, i) {
				return e.locationIdentifier && e.displayName && e.locationIdentifier;
			});
			myclientpersister.saveObj("pcrLocationList", result);
			return result;
		};

		var getNumberOfLocations = function(number) {
			var locations = getLocations();
			var result;

			if (locations.length > number){
				return locations.splice(0,number);
			}
			else{
				return locations;
			}
		};

		var getLocationsWhenReady = function(callback, timeout) {
			var timeoutId = null, timedOut = false;
			if (timeout) {
				timeoutId = setTimeout(function() {
					timedOut = true;
					callback(null);
				}, timeout);
			}
			UTIL.clientPersister.setOnStarted(function() {
				if (!timedOut) {
					if (timeoutId !== null) {
						clearTimeout(timeoutId);
					}
					callback();
				}
			});
		};

		var addToLocationListNow = function(locationIdentifier, displayName) {
			if (locationIdentifier && displayName) {
				var pcrLocation = {
					locationIdentifier : locationIdentifier,
					displayName : displayName
				};
				var myclientpersister = UTIL.clientPersister;
				var arr = myclientpersister.getArray("pcrLocationList");

				arr = jQuery.grep(arr, function(elementOfArray, indexInArray) {
					return elementOfArray.locationIdentifier != pcrLocation.locationIdentifier;
				});

				arr.unshift(pcrLocation);
				arr.splice(10);
				myclientpersister.saveObj("pcrLocationList", arr);

				$.cookie("topPCRSearch",displayName,{expires: 14, path: '/'});
				
			}
		};

		var addToLocationList = function(locationIdentifier, displayName) {
			UTIL.clientPersister.setOnStarted(function() {
				addToLocationListNow(locationIdentifier, displayName);
			});
		};

		return {
			getLocationsWhenReady : getLocationsWhenReady,
			getNumberOfLocations : getNumberOfLocations,
			addToLocationList : addToLocationList
		};

	}();

    UTIL.recentSearchesPersister = function() {

        var getPersisterName = function(channel) {
           return  "RM.recentSearches_"+channel;
        };

        var getRecentSearches = function(channel) {
            return UTIL.clientPersister.getArray(getPersisterName(channel)).splice(0,5);

		};

        var getAllRecentSearches = function(channel) {
            return UTIL.clientPersister.getArray(getPersisterName(channel));

		};

        var addToRecentSearches = function(channel,currentSearch) {
                    UTIL.clientPersister.setOnStarted(function() {
                        addToRecentSearchesNow(channel,currentSearch);
                    });
                };

        var getRecentSearchesWhenReady = function(callback,channel){
			UTIL.clientPersister.setOnStarted(function() {
					callback(getRecentSearches(channel));
			});
		};

        var hasRecentSearches = function(channel){
			var arr = getRecentSearches(channel);
            return arr && arr.length > 0;
		};

		var getNonEmptyRecentSearchChannel = function(channels) {
			var firstNonEmptychannel='';
			jQuery.each(channels, function(i, channel) {
				if (getRecentSearches(channel).length > 0) {
					firstNonEmptychannel = channel;
					return false;
				}
			});
			return firstNonEmptychannel;
		};

		function sortUrlParamsArray (a, b) {
			if (a.name === b.name) {
				return a.value > b.value;
			}
			return a.name > b.name;
		}

        var compareUrlParamArrays = function(arr1, arr2) {
			if(!arr1 || !arr2 || arr1.length !== arr2.length){
                return false;
            }
			arr1.sort(sortUrlParamsArray);
			arr2.sort(sortUrlParamsArray);
			for (var i = 0; i < arr1.length; i++) {
                if (arr1[i].name !== arr2[i].name || arr1[i].value !== arr2[i].value) {
                    return false;
                }
            }
            return true;
        };

        var removeRecentSearchFromArray = function(arr,searchUrl){
         arr = jQuery.grep(arr, function(elementOfArray, indexInArray) {
                    return !compareUrlParamArrays(RIGHTMOVE.UTIL.parseUrl(elementOfArray.dedupeUrl).params,
                                RIGHTMOVE.UTIL.parseUrl(searchUrl).params);
                });
         return arr;
        };

		var addToRecentSearchesNow = function(channel,currentSearch) {
			if (currentSearch) {
                var arr = UTIL.clientPersister.getArray(getPersisterName(channel));
                arr = removeRecentSearchFromArray(arr,currentSearch.dedupeUrl);
                arr.unshift(currentSearch);
                //arr.splice(10); //not working with ie
                 arr.splice(10-arr.length,arr.length-10);
                 UTIL.clientPersister.saveObj(getPersisterName(channel), arr);
            }
		};

     	 var removeFromRecentSearchesByUrlNow = function(channel,url) {
			if (url) {
				var arr = UTIL.clientPersister.getArray(getPersisterName(channel));
				arr = removeRecentSearchFromArray(arr,url);
				UTIL.clientPersister.saveObj(getPersisterName(channel), arr);
			}
		};

        var removeFromRecentSearchesByUrl = function(channel,url) {
			UTIL.clientPersister.setOnStarted(function() {
				removeFromRecentSearchesByUrlNow(channel,url);
			});
		};

        var removeAllRecentSearches = function(channel) {
			UTIL.clientPersister.setOnStarted(function() {
                UTIL.clientPersister.saveObj(getPersisterName(channel), []);
			});
		};

        var saveRecentSearchesArrayNow = function(channel,arr) {
             UTIL.clientPersister.saveObj(getPersisterName(channel), arr);
		};

        var checkRecentSearchesNeedRefresh = function(buildTimestamp, channels) {

			if(!buildTimestamp){
                return false;
            }
			var isOutOfDate=false;
			jQuery.each(channels, function(i, channel) {
				var arr = getRecentSearches(channel);
				if (arr.length > 0 && jQuery.grep(arr,function(el){return el.buildTimestamp != buildTimestamp;}).length >0) {
					isOutOfDate = true;
					return false;
				}
			});
			return isOutOfDate;
		};

        var getRsWhenReady = function(callback) {
			UTIL.clientPersister.setOnStarted(function() {
				callback();
			});
		};

		return {
			populateMyRightmoveRecentSearches : getRecentSearches,
            getRecentSearchesWhenReady:getRecentSearchesWhenReady,
			addToRecentSearches : addToRecentSearches,
            getNonEmptyRecentSearchChannel:getNonEmptyRecentSearchChannel,
            removeAllRecentSearches:removeAllRecentSearches,
            removeFromRecentSearchesByUrl:removeFromRecentSearchesByUrl,
            hasRecentSearches:hasRecentSearches,
            getRsWhenReady:getRsWhenReady,
            getAllRecentSearches:getAllRecentSearches,
            saveRecentSearchesArrayNow:saveRecentSearchesArrayNow,
            checkRecentSearchesNeedRefresh:checkRecentSearchesNeedRefresh
		};
	}();

	UTIL.userPreferencePersister = function() {
		var KEY = "RIGHTMOVE.UTIL.userPreferences";

		var getPreferences = function() {
			return UTIL.clientPersister.getObj(KEY) || {};
		};

		var set = function(setFunc) {
			var clientPersister = UTIL.clientPersister;
			clientPersister.setOnStarted(function() {
				var obj = getPreferences();
				setFunc(obj);
				clientPersister.saveObj(KEY, obj);
			});
		};

		var setValue = function(name, value) {
			set(function(obj) {
				obj[name] = value;
			});
		};

		var getValue = function(name) {
			return getPreferences()[name] || null;
		};

		var setChannel = function(channel) {
			setValue("channel", channel);
		};

		var getChannel = function() {
			return getValue("channel");
		};

		var setAnalyticsChannel = function(channel) {
			setValue("analyticsChannel", channel);
		};

		var getAnalyticsChannel = function() {
			return getValue("analyticsChannel");
		};

		return {
			setChannel : setChannel,
			getChannel : getChannel,
			setAnalyticsChannel : setAnalyticsChannel,
			getAnalyticsChannel : getAnalyticsChannel,
			setValue : setValue,
			getValue : getValue
		};
	}();
})();
       
/**
 * Cookie plugin
 *
 * Copyright (c) 2006 Klaus Hartl (stilbuero.de)
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 */

/**
 * Create a cookie with the given name and value and other optional parameters.
 *
 * @example $.cookie('the_cookie', 'the_value');
 * @desc Set the value of a cookie.
 * @example $.cookie('the_cookie', 'the_value', { expires: 7, path: '/', domain: 'jquery.com', secure: true });
 * @desc Create a cookie with all available options.
 * @example $.cookie('the_cookie', 'the_value');
 * @desc Create a session cookie.
 * @example $.cookie('the_cookie', null);
 * @desc Delete a cookie by passing null as value. Keep in mind that you have to use the same path and domain
 *       used when the cookie was set.
 *
 * @param String name The name of the cookie.
 * @param String value The value of the cookie.
 * @param Object options An object literal containing key/value pairs to provide optional cookie attributes.
 * @option Number|Date expires Either an integer specifying the expiration date from now on in days or a Date object.
 *                             If a negative value is specified (e.g. a date in the past), the cookie will be deleted.
 *                             If set to null or omitted, the cookie will be a session cookie and will not be retained
 *                             when the the browser exits.
 * @option String path The value of the path atribute of the cookie (default: path of page that created the cookie).
 * @option String domain The value of the domain attribute of the cookie (default: domain of page that created the cookie).
 * @option Boolean secure If true, the secure attribute of the cookie will be set and the cookie transmission will
 *                        require a secure protocol (like HTTPS).
 * @type undefined
 *
 * @name $.cookie
 * @cat Plugins/Cookie
 * @author Klaus Hartl/klaus.hartl@stilbuero.de
 */

/**
 * Get the value of a cookie with the given name.
 *
 * @example $.cookie('the_cookie');
 * @desc Get the value of a cookie.
 *
 * @param String name The name of the cookie.
 * @return The value of the cookie.
 * @type String
 *
 * @name $.cookie
 * @cat Plugins/Cookie
 * @author Klaus Hartl/klaus.hartl@stilbuero.de
 */
jQuery.cookie = function(name, value, options) {
    if (typeof value != 'undefined') { // name and value given, set cookie
        options = options || {};
        if (value === null) {
            value = '';
            options.expires = -1;
        }
        var expires = '';
        if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
            var date;
            if (typeof options.expires == 'number') {
                date = new Date();
                date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
            } else {
                date = options.expires;
            }
            expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
        }
        // CAUTION: Needed to parenthesize options.path and options.domain
        // in the following expressions, otherwise they evaluate to undefined
        // in the packed version for some reason...
        var path = options.path ? '; path=' + (options.path) : '';
        var domain = options.domain ? '; domain=' + (options.domain) : '';
        var secure = options.secure ? '; secure' : '';
        document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
    } else { // only name given, get cookie
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
};
/*! Copyright (c) 2009 Brandon Aaron (http://brandonaaron.net)
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 * Thanks to: http://adomas.org/javascript-mouse-wheel/ for some pointers.
 * Thanks to: Mathias Bank(http://www.mathias-bank.de) for a scope bug fix.
 *
 * Version: 3.0.2
 * 
 * Requires: 1.2.2+
 */

(function($) {

var types = ['DOMMouseScroll', 'mousewheel'];

$.event.special.mousewheel = {
	setup: function() {
		if ( this.addEventListener )
			for ( var i=types.length; i; )
				this.addEventListener( types[--i], handler, false );
		else
			this.onmousewheel = handler;
	},
	
	teardown: function() {
		if ( this.removeEventListener )
			for ( var i=types.length; i; )
				this.removeEventListener( types[--i], handler, false );
		else
			this.onmousewheel = null;
	}
};

$.fn.extend({
	mousewheel: function(fn) {
		return fn ? this.bind("mousewheel", fn) : this.trigger("mousewheel");
	},
	
	unmousewheel: function(fn) {
		return this.unbind("mousewheel", fn);
	}
});


function handler(event) {
	var args = [].slice.call( arguments, 1 ), delta = 0, returnValue = true;
	
	event = $.event.fix(event || window.event);
	event.type = "mousewheel";
	
	if ( event.wheelDelta ) delta = event.wheelDelta/120;
	if ( event.detail     ) delta = -event.detail/3;
	
	// Add events and delta to the front of the arguments
	args.unshift(event, delta);

	return $.event.handle.apply(this, args);
}

})(jQuery);
jQuery.fn.hint = function () {
	return this.each(function () {
		// get jQuery version of 'this'
		var t = jQuery(this);
		// get it once since it won't change
		var title = t.attr('title');
		// only apply logic if the element has the attribute
		if (title) {
			// on blur, set value to title attr if text is blank
			t.blur(function () {
				if (t.val() == '') {
					t.val(title);
					t.addClass('blur');
				}
			});
	// on focus, set value to blank if current value
			// matches title attr
			t.focus(function () {
				if (t.val() == title) {
					t.val('');
					t.removeClass('blur');
				}
			});

		  // clear the pre-defined text when form is submitted
			t.parents('form:first').submit(function() {
				if (t.val() == title) {
					t.val('');
					t.removeClass('blur');
				}
			});

		  // now change all inputs to title
			t.blur();
		}
	});
};
(function() {
	var ANALYTICS = RIGHTMOVE.namespace("RIGHTMOVE.ANALYTICS");

	ANALYTICS.woopra = function() {

		var trackedPage;
		window.woo_actions = [];

		var init = function(woopraPageToTrack, pageToTrack) {
			woopraPageToTrack = woopraPageToTrack ? woopraPageToTrack : pageToTrack; //use woopra page, else use GA pageToTrack
			woopraPageToTrack = woopraPageToTrack ? woopraPageToTrack : window.location.pathname; //use analytics page else current url
			var regExp = new RegExp("(.*)(/svr/[0-9]{4}).*");
			if (regExp.test(woopraPageToTrack)) { woopraPageToTrack=regExp.exec(woopraPageToTrack)[1]; } //strip out svr from woopraPageToTrack
			trackedPage = woopraPageToTrack;
			window.woo_actions.push({
				type : 'pageview',
				title : document.title,
				url : trackedPage,
				page : window.location.pathname
			});
			trackLinks();
		};

		//add an event to global "woo_actions" and woopra will pick them up once it has loaded, this does not fire custom events
		var addEvent = function(eventInfo) {
			eventInfo.type = 'event';
			eventInfo.url = trackedPage;
			eventInfo.page = window.location.pathname;
			window.woo_actions.push(eventInfo);
		};

		var trackLinks = function() {
			trackLinkClick("body.overseas #menu a", "MenuLink");
			trackLinkClick("a.trackExternalLink", "ExternalLink");
		};

		var trackLinkClick = function(jQuerySelector, eventName) {
			$(jQuerySelector).live('click', function(){
				trackLinkEvent(eventName, $(this));
				return true;
			});
		};

		var trackLinkEvent = function(eventName, jQueryObj) {
			var html = jQueryObj.children("img").length===0 ? jQueryObj.html().trim() : "image";
			var woopraEventInfo = {
				name : eventName,
				href : jQueryObj.attr("href"),
				html : html,
				title : jQueryObj.attr("title"),
				url : trackedPage,
				page : window.location.pathname
			};
			window.woopraTracker.pushEvent(woopraEventInfo);
		};

		var addCustomVisitorData = function(attributeName, attribute) {
			window.woo_visitor = window.woo_visitor || {};
			window.woo_visitor[attributeName]=attribute;
		};

		return {
			init : init,
			addEvent : addEvent,
			trackLinkClick : trackLinkClick,
			addCustomVisitorData : addCustomVisitorData
		};
	}();

})();
(function() {
	var VALIDATION = RIGHTMOVE.namespace("RIGHTMOVE.VALIDATION");

	var getVariables = function(variables) {
		var fixedRegexpVars = {};
		jQuery.each(variables, function(name, varData) {
			fixedRegexpVars[name] = varData.regexp ? new RegExp(varData.value) : varData.value;
		});

		return fixedRegexpVars;
	};

	var createFieldValidator = function(formName, field) {
		var fieldValidators = [];
		var variables = getVariables(field.variables);
		jQuery.each(field.validations, function(i, validation) {
			fieldValidators.push(new VALIDATION.validator.FieldValidator(variables, validation.errorMessage, RIGHTMOVE.VALIDATION.validator[validation.method]));
		});
		return new RIGHTMOVE.VALIDATION.validator.FieldValidatorGroup(field.serverSideErrors, field.initialValue, field.name, formName, fieldValidators, field.showValidMessage);
	};

	var createFieldValidators = function(formName, fields) {
		var fieldValidators = {};
		jQuery.each(fields, function(i, field) {
			fieldValidators[field.name] = createFieldValidator(formName, field);
		});

		return fieldValidators;
	};


	VALIDATION.FormValidator = function(formData) {
		this.formData = formData;
		this.formName = this.formData.formName;
		this.form = $("#" + this.formName);
		this.fields = this.formData.fields;
		this.previousFieldValidator = null;
		this.fieldValidators = createFieldValidators(this.formName, this.fields);
		this.specialValidation = this.formData.specialValidation && this.specialValidations[this.formData.specialValidation];
		this.specialValidationFunction = this.specialValidation && RIGHTMOVE.bind(this, this.specialValidation.validate);
		this.specialValidationSetupFunction = this.specialValidation && RIGHTMOVE.bind(this, this.specialValidation.setup);
		this.setupValidationEvents();
		this.validateAll(true);
	};

	VALIDATION.FormValidator.prototype = {
		setupValidationEvents : function() {
			if (!this.formData.suppressValidateUntilSubmit) {
				jQuery.each(this.fields, RIGHTMOVE.bind(this, function(i, field) {
					this.form.find("*[name=" + field.name + "]", this.form).blur(RIGHTMOVE.bind(this, function() {
						this.previousFieldValidator = this.fieldValidators[field.name];
					}));
				}));

				this.form.find('input,textarea,select').focus(RIGHTMOVE.bind(this, function(evt) {
					if (this.previousFieldValidator) {
						var currentValidator = this.fieldValidators[evt.target.id];
						if (!currentValidator || currentValidator.isValid || this.previousFieldValidator.isValid !== null || this.previousFieldValidator.fieldNotBlank()) {
							this.previousFieldValidator.validate(false);
						}
					}
				}));
			}

			this.form.submit(RIGHTMOVE.bind(this, function() {
				var validated = this.validateAll(false);
				if (validated) {
					this.form.trigger('rmFormValidated');
				} else {
					this.form.trigger('rmFormNotValid');
				}
				return validated;
			})).bind("reset", RIGHTMOVE.bind(this, function() {
				setTimeout(RIGHTMOVE.bind(this, function() {
					this.hideErrorMessage('form', 'errorbox');
					this.validateAll(true);
				}), 1);
			}));
		},

		displayErrorMessage : function(fieldName, errorMessage, divClass) {
			var errorDiv = this.form.find('#' + this.formName + fieldName + 'errordiv');
			errorDiv.html(errorMessage);
			errorDiv.removeClass();
			errorDiv.addClass(divClass);
		},

		hideErrorMessage : function(fieldName, divClass) {
			var errorDiv = this.form.find('#' + this.formName + fieldName + 'errordiv');
			errorDiv.html("");
			errorDiv.removeClass(divClass);
		},

		validateAll : function(isLoadingPage) {
			var allValid = true;
			jQuery.each(this.fields, RIGHTMOVE.bind(this, function(i, field) {
				allValid = this.fieldValidators[field.name].validate(isLoadingPage) && allValid;
			}));
			if (this.specialValidation) {
				allValid = this.specialValidationFunction(isLoadingPage) && allValid;
			}
			if (!allValid && !isLoadingPage) {
				this.displayErrorMessage('form', this.formData.formInvalidMessage, 'errorbox');
			}
			return allValid;
		},

		specialValidations : {
			name : {
				setup : function() {
					$(this.form).find('input,textarea,select').filter(':not(#' + this.formName + '-title,#' + this.formName + '-firstName,#' + this.formName + '-lastName)').focus(RIGHTMOVE.bind(this, function() {
						this.specialValidationFunction();
					}));
				},

				validate : function(isLoadingPage) {
					var validator = RIGHTMOVE.VALIDATION.validator;
					if (validator.getFieldValue("#" + this.formName + "-title") !== '' && validator.getFieldValue("#" + this.formName + "-firstName") !== '' && validator.getFieldValue("#" + this.formName + "-lastName") !== '' &&
							validator.getFieldValue("#" + this.formName + "-title").length <= 30 && validator.getFieldValue("#" + this.formName + "-firstName").length <= 100 && validator.getFieldValue("#" + this.formName + "-lastName").length <= 100) {
						this.displayErrorMessage('Name', '', 'validationcontainer passed');
						return true;
					}
					else if (!isLoadingPage) {
						if(validator.getFieldValue("#" + this.formName + "-title") === '' || validator.getFieldValue("#" + this.formName + "-firstName") === '' || validator.getFieldValue("#" + this.formName + "-lastName") === '') {
							this.displayErrorMessage('Name', 'Please enter all name fields.', 'validationcontainer failed');
							return false;
						} else {
							this.displayErrorMessage('Name', 'Please enter 100 characters or less for each name component.', 'validationcontainer failed');
							return false;
						}
					}
				}
			},

			shortName : {
				setup : function() {
					$(this.form).find('input,textarea,select').filter(':not(#' + this.formName + '-firstName,#' + this.formName + '-lastName)').focus(RIGHTMOVE.bind(this, function() {
						this.specialValidationFunction();
					}));
				},

				validate : function(isLoadingPage) {
					var validator = RIGHTMOVE.VALIDATION.validator;
					if (validator.getFieldValue("#" + this.formName + "-firstName") !== '' && validator.getFieldValue("#" + this.formName + "-lastName") !== '') {
						this.displayErrorMessage('Name', '', 'validationcontainer passed');
						return true;
					}
					else if (!isLoadingPage) {
						this.displayErrorMessage('Name', 'Please enter all name fields.', 'validationcontainer failed');
						return false;
					}
				}
			}
		}
	};
})();
(function() {
	var VALIDATION = RIGHTMOVE.namespace("RIGHTMOVE.VALIDATION");

	VALIDATION.validator = function() {
		var getFieldFromForm = function(form, fieldName) {
			return form[fieldName];
		};

		var getFieldValue = function(field) {
			var fieldTitle = $(field).attr('title');
			var fieldValue = $(field).val();

			if (fieldValue == fieldTitle){
				return "";
			}

			return jQuery.trim(fieldValue);
		};

		var genericValidateWithFieldType = function(form, fieldName, variablesObject, fieldTypes, isValidFunction) {
			var field = getFieldFromForm(form, fieldName);

			var fieldTypeCorrect = true;
			for (var fieldTypeIndex in fieldTypes) {
				if (fieldTypes.hasOwnProperty(fieldTypeIndex)) {
					fieldTypeCorrect = (field.type == fieldTypes[fieldTypeIndex]) || fieldTypeCorrect;
				}
			}

			return !(fieldTypeCorrect && !isValidFunction(field));
		};

		var genericValidate = function(form, fieldName, variablesObject, isValidFunction) {
			return genericValidateWithFieldType(form, fieldName, variablesObject, ['text', 'textarea'], function(field) {
				return (!getFieldValue(field)) || isValidFunction(field);
			});
		};

		var fieldContainsData = function(field) {
			var value = getFieldValue(field);
			return value.length > 0;
		};

		var validateRequired = function(form, fieldName, variablesObject) {
			return genericValidateWithFieldType(form, fieldName, variablesObject, ['text', 'textarea', 'file', 'select-one', 'radio', 'password'], function(field) {
				return fieldContainsData(field);
			});
		};

		var validateValidWhen = function(){
			return true;
		};

		var validateMinLength = function(form, fieldName, variablesObject) {
			return genericValidate(form, fieldName, variablesObject, function(field) {
				var iMin = parseInt(variablesObject.minlength, 10);
				return getFieldValue(field).length >= iMin;
			});
		};

		var validateMaxLength = function(form, fieldName, variablesObject) {
			return genericValidate(form, fieldName, variablesObject, function(field) {
				var iMax = parseInt(variablesObject.maxlength, 10);
				return getFieldValue(field).length <= iMax;
			});
		};

		var matchPattern = function(value, mask) {
			return mask.exec(value);
		};

		var validateMask = function(form, fieldName, variablesObject) {
			return genericValidate(form, fieldName, variablesObject, function(field) {
				return matchPattern(getFieldValue(field), variablesObject.mask);
			});
		};

		var isAllDigits = function(argvalue) {
			argvalue = argvalue.toString();
			var validChars = "0123456789";
			var startFrom = 0;
			if (argvalue.substring(0, 2) == "0x") {
				validChars = "0123456789abcdefABCDEF";
				startFrom = 2;
			} else if (argvalue.charAt(0) == "0") {
				validChars = "01234567";
				startFrom = 1;
			} else if (argvalue.charAt(0) == "-") {
				startFrom = 1;
			}

			for (var n = startFrom; n < argvalue.length; n++) {
				if (validChars.indexOf(argvalue.substring(n, n + 1)) == -1) { return false; }
			}
			return true;
		};

		var validateRangeNumber = function(form, fieldName, variablesObject, min, max) {
			return genericValidateWithFieldType(form, fieldName, variablesObject, ['text', 'textarea', 'select-one', 'radio'], function(field) {
				var isValid = true;
				var value = getFieldValue(field);
				if (value.length > 0) {
					if (!isAllDigits(value)) {
						isValid = false;
					}
					else {
						var iValue = parseInt(value, 10);
						if (isNaN(iValue) || !(iValue >= min && iValue <= max)) {
							isValid = false;
						}
					}
				}
				return isValid;
			});
		};

		var validateByte = function(form, fieldName, variablesObject) {
			return validateRangeNumber(form, fieldName, variablesObject,  -128, 127);
		};

		var validateShort = function(form, fieldName, variablesObject) {
			return validateRangeNumber(form, fieldName, variablesObject, -32768, 32767);
		};

		var validateInteger = function(form, fieldName, variablesObject) {
			return validateRangeNumber(form, fieldName, variablesObject, -2147483648, 2147483647);
		};

		var validateFloat = function(form, fieldName, variablesObject) {
			return genericValidateWithFieldType(form, fieldName, variablesObject, ['text', 'textarea', 'select-one', 'radio'], function(field) {
				var isValid = true;
				var value = getFieldValue(field);

				if (value.length > 0) {
					// remove '.' before checking digits
					var tempArray = value.split('.');
					var joinedString = tempArray.join('');

					if (!isAllDigits(joinedString)) {
						isValid = false;
					}
					else {
						var iValue = parseFloat(value);
						if (isNaN(iValue)) {
							isValid = false;
						}
					}
				}
				return isValid;
			});
		};

		var validateIntRange = function(form, fieldName, variablesObject) {
			return genericValidate(form, fieldName, variablesObject, function(field) {

				var fMin = parseInt(variablesObject.min, 10);
				var fMax = parseInt(variablesObject.max, 10);
				var fValue = parseInt(getFieldValue(field), 10);

				return (fMin <= fValue && fValue <= fMax);
			});
		};

		var validateRange = function(form, fieldName, variablesObject) {
			return validateIntRange(form, fieldName, variablesObject);
		};

		var validateFloatRange = function(form, fieldName, variablesObject) {
			return genericValidate(form, fieldName, variablesObject, function(field) {

				var fMin = parseFloat(variablesObject.min);
				var fMax = parseFloat(variablesObject.max);
				var fValue = parseFloat(getFieldValue(field));

				return (fMin <= fValue && fValue <= fMax);
			});
		};

		var validateFieldEqual = function(form, fieldName, variablesObject) {
			return genericValidate(form, fieldName, variablesObject, function(field) {
				var equalsField = getFieldFromForm(form, variablesObject.equalsfieldname);
				var fieldValue = getFieldValue(field);
				var equalsFieldValue = getFieldValue(equalsField);
				return fieldValue == equalsFieldValue;
			});
		};

		var validateFieldRequiredIfOtherFieldHasValue = function(form, fieldName, variablesObject){
			return genericValidateWithFieldType(form, fieldName, variablesObject, ['text'] , function(field) {
				var dependentField = getFieldFromForm(form, variablesObject.dependentField);
				var dependentValue = variablesObject.dependentValue;
				if (dependentField.value == dependentValue){
					return validateRequired(form, fieldName, variablesObject);
				}
				return true;
			});
		};

		var validateMaskWhenMask = function(form, fieldName, variablesObject){
			if (matchPattern(getFieldValue(getFieldFromForm(form, variablesObject.conditionField) ),new RegExp(variablesObject.conditionMask))){
				return validateMask(form, fieldName, variablesObject);
			} else {
				return true;
			}
		};

		var validateAllFieldsRequired = function(form, fieldName, variablesObject) {
			if (variablesObject.validateOnBlur) {
				var requiredFieldNames = variablesObject.requiredfieldsnames.split(",");
				var isValid = true;
				for (var requiredFieldNamesIndex = 0; requiredFieldNamesIndex < requiredFieldNames.length; requiredFieldNamesIndex++) {
					var requiredFieldName = jQuery.trim(requiredFieldNames[requiredFieldNamesIndex]);

					isValid = isValid && validateRequired(form, requiredFieldName, variablesObject);
				}

				return isValid;
			}
			return null;
		};

		var validateMandatoryParam = function(form, fieldName, variablesObject) {
			return genericValidate(form, fieldName, variablesObject, function(field) {
				var mandatoryValue = variablesObject.mandatoryFieldValue;
				var fieldValue;
				 if (field.type == 'checkbox'){
					fieldValue = String(field.checked);
				 }
				else{
					 fieldValue = field.value;
				 }
				return fieldValue == mandatoryValue;
			});
		};


		/**
		 * Reference: Sandeep V. Tamhankar (stamhankar@hotmail.com),
		 * http://javascript.internet.com
		 */
		var checkEmail = function(emailStr) {
			if (!emailStr) {
				return true;
			}
			var emailPat = /^(.+)@(.+)$/;
			var specialChars = "\\(\\)<>@,;:\\\\\\\"\\.\\[\\]";
			var validChars = "[^\\s" + specialChars + "]";
			var quotedUser = "(\"[^\"]*\")";
			var ipDomainPat = /^(\d{1,3})[.](\d{1,3})[.](\d{1,3})[.](\d{1,3})$/;
			var atom = validChars + '+';
			var word = "(" + atom + "|" + quotedUser + ")";
			var userPat = new RegExp("^" + word + "(\\." + word + ")*$");
			var domainPat = new RegExp("^" + atom + "(\\." + atom + ")*$");
			var matchArray = emailStr.match(emailPat);
			if (!matchArray) {
				return false;
			}
			var user = matchArray[1];
			var domain = matchArray[2];
			if (!user.match(userPat)) {
				return false;
			}
			var IPArray = domain.match(ipDomainPat);
			if (IPArray) {
				for (var i = 1; i <= 4; i++) {
					if (IPArray[i] > 255) {
						return false;
					}
				}
				return true;
			}
			var domainArray = domain.match(domainPat);
			if (!domainArray) {
				return false;
			}
			var atomPat = new RegExp(atom, "g");
			var domArr = domain.match(atomPat);
			var len = domArr.length;
			if ((domArr[domArr.length - 1].length < 2) ||
				(domArr[domArr.length - 1].length > 4)) {
				return false;
			}
			if (len < 2) {
				return false;
			}
			return true;
		};

		var validateEmail = function(form, fieldName, variablesObject) {
			return genericValidate(form, fieldName, variablesObject, function(field) {
				return checkEmail(getFieldValue(field));
			});
		};

		var limitCharactersInField = function(field, limit) {
			if(field.value.length > limit) {
				field.value =  field.value.substring(0, limit);
			}
		};

		var FieldValidatorGroup = function(loadingErrorMessages, initialValue, fieldName, formName, fieldValidators, showValidMessage) {
			this.loadingErrorMessages = loadingErrorMessages;
			this.initialValue = initialValue;
			this.fieldName = fieldName;
			this.formName = formName;
			this.form = $("#" + formName).get(0);
			this.field = getFieldFromForm(this.form, this.fieldName);
			this.fieldValidators = fieldValidators;
			this.isValid = null;
			this.showValidMessage = showValidMessage;
		};

		FieldValidatorGroup.prototype = {
			isPageLoadingWithErrorsFromServer : function(isLoadingPage){
				return isLoadingPage && this.loadingErrorMessages.length > 0;
			},
			isCurrentFieldValueMatchingPreviouslyFailedValue : function(currentFieldValue){
				return (this.initialValue == encodeURIComponent(currentFieldValue).replace("%20", "+") && this.loadingErrorMessages.length > 0);
			},
			isDisplayServerError : function(isLoadingPage, currentFieldValue){
				return this.isPageLoadingWithErrorsFromServer(isLoadingPage) || this.isCurrentFieldValueMatchingPreviouslyFailedValue(currentFieldValue);
			},
			validate : function(isLoadingPage) {
				var currentFieldValue = getFieldValue(this.field);
				if (this.isDisplayServerError(isLoadingPage, currentFieldValue)){
					this.displayFieldErrorMessage(false, false, this.loadingErrorMessages.join(', '), false);
					return false;
				}

				for (var fieldValidatorsIndex = 0; fieldValidatorsIndex < this.fieldValidators.length; fieldValidatorsIndex++) {
					var fieldValidator = this.fieldValidators[fieldValidatorsIndex];
					var isValid = fieldValidator.validate(this.form, this.fieldName);
					this.displayFieldErrorMessage(isValid, isLoadingPage, fieldValidator.errorMessage, this.showValidMessage);

					if (!isValid) {
						if (!isLoadingPage) {
							this.isValid = false;
						}
						return false;
					}
				}

				this.isValid = true;
				return true;
			},
			displayErrorMessage : function(errorMessage, divClass) {
				var errorDiv = $("#" + this.formName).find('#'+ this.formName + this.fieldName + 'errordiv');
				errorDiv.html(errorMessage);
				errorDiv.removeClass();
				errorDiv.addClass(divClass);
			},
			displayFieldErrorMessage : function(isValid, isLoadingPage, message, showValidMessage) {
				var errorMessage;
				var divClass;
				if (isValid) {
					errorMessage = '';
					divClass = (this.fieldNotBlank() && showValidMessage) ? 'validationcontainer passed' : '';
				}
				else {
					errorMessage = (isLoadingPage) ? '' : message;
					divClass = (isLoadingPage) ? '' : 'validationcontainer failed';
				}
				this.displayErrorMessage(errorMessage, divClass);
			},
			fieldNotBlank : function() {
				return fieldContainsData(getFieldFromForm(this.form, this.fieldName));
			}
		};

		var FieldValidator = function(variables, errorMessage, validationFunction) {
			this.variables = variables;
			this.errorMessage = errorMessage;
			this.validationFunction = validationFunction;
		};

		FieldValidator.prototype = {
			validate : function(form, fieldName) {
				return this.validationFunction(form, fieldName, this.variables);
			}
		};

		return {
			getFieldValue : getFieldValue,
			validateRequired : validateRequired,
			validateValidWhen : validateValidWhen,
			validateMinLength : validateMinLength,
			validateMaxLength : validateMaxLength,
			validateMask : validateMask,
			validateRangeNumber : validateRangeNumber,
			validateByte : validateByte,
			validateShort : validateShort,
			validateInteger : validateInteger,
			validateFloat : validateFloat,
			validateIntRange : validateIntRange,
			validateRange : validateRange,
			validateFloatRange : validateFloatRange,
			validateFieldEqual : validateFieldEqual,
			validateFieldRequiredIfOtherFieldHasValue : validateFieldRequiredIfOtherFieldHasValue,
			validateMaskWhenMask : validateMaskWhenMask,
			validateAllFieldsRequired : validateAllFieldsRequired,
			validateMandatoryParam : validateMandatoryParam,
			validateEmail : validateEmail,
			checkEmail : checkEmail,
			limitCharactersInField : limitCharactersInField,
			FieldValidatorGroup : FieldValidatorGroup,
			FieldValidator : FieldValidator
		};
	}();
})();
(function() {
	var ANALYTICS = RIGHTMOVE.namespace("RIGHTMOVE.ANALYTICS");

	ANALYTICS.mvt = function() {
		var AJAX_TIMEOUT = 60000;

		var logAction = function(data){
			jQuery.ajax({
				type: "POST",
				data: data,
				dataType: "json",
				url: "/ajax/mvt-event.html",
				timeout: AJAX_TIMEOUT
			});
		};

		// Attached to a specific html element
		var logActionOnClick = function(selector, data) {
			$(selector).die(".mvtEvent").live("click.mvtEvent", function() {
				logAction(data);
			});
		};

		// Attached to a specific object and event
		var logActionOnEvent = function(selector, event, data) {
			$(selector).unbind(event);
			$(selector).bind(event, function() {
				logAction(data);
			});
		};

		return {
			logAction : logAction,
			logActionOnClick : logActionOnClick,
			logActionOnEvent : logActionOnEvent
		};
	}();
})();
 