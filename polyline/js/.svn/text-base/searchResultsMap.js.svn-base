/*
Copyright (c) 2007 Brian Dillard and Brad Neuberg:
Brian Dillard | Project Lead | bdillard@pathf.com | http://blogs.pathf.com/agileajax/
Brad Neuberg | Original Project Creator | http://codinginparadise.org

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files
(the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/*
	dhtmlHistory: An object that provides history, history data, and bookmarking for DHTML and Ajax applications.

	dependencies:
		* the historyStorage object included in this file.

*/
window.dhtmlHistory = {

	/*Public: User-agent booleans*/
	isIE: false,
	isOpera: false,
	isSafari: false,
	isKonquerer: false,
	isGecko: false,
	isSupported: false,

	/*Public: Create the DHTML history infrastructure*/
	create: function(options) {

		/*
			options - object to store initialization parameters
			options.blankURL - string to override the default location of blank.html. Must end in "?"
			options.debugMode - boolean that causes hidden form fields to be shown for development purposes.
			options.toJSON - function to override default JSON stringifier
			options.fromJSON - function to override default JSON parser
			options.baseTitle - pattern for title changes; example: "Armchair DJ [@@@]" - @@@ will be replaced
		*/

		var that = this;

		/*Set up the historyStorage object; pass in options bundle*/
		window.historyStorage.setup(options);

		/*Set up our base title if one is passed in*/
		if (options && options.baseTitle) {
			if (options.baseTitle.indexOf("@@@") < 0 && historyStorage.debugMode) {
				throw new Error("Programmer error: options.baseTitle must contain the replacement parameter"
				+ " '@@@' to be useful.");
			}
			this.baseTitle = options.baseTitle;
		}

		/*set user-agent flags*/
		var UA = navigator.userAgent.toLowerCase();
		var platform = navigator.platform.toLowerCase();
		var vendor = navigator.vendor || "";
		var versionSlashIndex = UA.indexOf("version/");
		var safariVersion = versionSlashIndex == -1 ? null : parseInt(UA.substr(versionSlashIndex + 8), 10);
		if (vendor === "KDE") {
			this.isKonqueror = true;
			this.isSupported = false;
		} else if (typeof window.opera !== "undefined") {
			this.isOpera = true;
			this.isSupported = true;
		} else if (typeof document.all !== "undefined") {
			// Pretend ie8 is opera
			if (!document.documentMode) {
				this.isIE = true;
				this.isSupported = true;
			} else {
				this.isOpera = true;
				this.isSupported = true;
			}
		} else if (vendor.indexOf("Apple Computer, Inc.") > -1 && safariVersion < 4) {
			this.isSafari = true;
			this.isSupported = (platform.indexOf("mac") > -1);
		} else if (UA.indexOf("gecko") != -1) {
			this.isGecko = true;
			this.isSupported = true;
		}

		/*Create Safari/Opera-specific code*/
		if (this.isSafari) {
			this.createSafari();
		} else if (this.isOpera) {
			this.createOpera();
		}

		/*Get our initial location*/
		var initialHash = this.getCurrentLocation();

		/*Save it as our current location*/
		this.currentLocation = initialHash;

		/*Now that we have a hash, create IE-specific code*/
		if (this.isIE) {
			/*Optionally override the URL of IE's blank HTML file*/
			if (options && options.blankURL) {
				var u = options.blankURL;
				/*assign the value, adding the trailing ? if it's not passed in*/
				this.blankURL = (u.indexOf("?") != u.length - 1
					? u + "?"
					: u
				);
			}
			this.createIE(initialHash);
		}

		/*Add an unload listener for the page; this is needed for FF 1.5+ because this browser caches all dynamic updates to the
		page, which can break some of our logic related to testing whether this is the first instance a page has loaded or whether
		it is being pulled from the cache*/

		var unloadHandler = function() {
			that.firstLoad = null;
		};

		this.addEventListener(window,'unload',unloadHandler);

		/*Determine if this is our first page load; for IE, we do this in this.iframeLoaded(), which is fired on pageload. We do it
		there because we have no historyStorage at this point, which only exists after the page is finished loading in IE*/
		if (this.isIE) {
			/*The iframe will get loaded on page load, and we want to ignore this fact*/
			this.ignoreLocationChange = true;
		} else {
			if (!historyStorage.hasKey(this.PAGELOADEDSTRING)) {
				/*This is our first page load, so ignore the location change and add our special history entry*/
				this.ignoreLocationChange = true;
				this.firstLoad = true;
				historyStorage.put(this.PAGELOADEDSTRING, true);
			} else {
				/*This isn't our first page load, so indicate that we want to pay attention to this location change*/
				this.ignoreLocationChange = false;
				this.firstLoad = false;
				/*For browsers other than IE, fire a history change event; on IE, the event will be thrown automatically when its
				hidden iframe reloads on page load. Unfortunately, we don't have any listeners yet; indicate that we want to fire
				an event when a listener is added.*/
				this.fireOnNewListener = true;
			}
		}

		/*Other browsers can use a location handler that checks at regular intervals as their primary mechanism; we use it for IE as
		well to handle an important edge case; see checkLocation() for details*/
		var locationHandler = function() {
			that.checkLocation();
		};
		setInterval(locationHandler, 100);
	},

	/*Public: Initialize our DHTML history. You must call this after the page is finished loading. Optionally, you can pass your listener in
	here so you don't need to make a separate call to addListener*/
	initialize: function(listener) {

		/*save original document title to plug in when we hit a null-key history point*/
		this.originalTitle = document.title;

		/*IE needs to be explicitly initialized. IE doesn't autofill form data until the page is finished loading, so we have to wait*/
		if (this.isIE) {
			/*If this is the first time this page has loaded*/
			if (!historyStorage.hasKey(this.PAGELOADEDSTRING)) {
				/*For IE, we do this in initialize(); for other browsers, we do it in create()*/
				this.fireOnNewListener = false;
				this.firstLoad = true;
				historyStorage.put(this.PAGELOADEDSTRING, true);
			}
			/*Else if this is a fake onload event*/
			else {
				this.fireOnNewListener = true;
				this.firstLoad = false;
			}
		}
		/*optional convenience to save a separate call to addListener*/
		if (listener) {
			this.addListener(listener);
		}
	},

	/*Public: Adds a history change listener. Only one listener is supported at this time.*/
	addListener: function(listener) {
		this.listener = listener;
		/*If the page was just loaded and we should not ignore it, fire an event to our new listener now*/
		if (this.fireOnNewListener) {
			this.fireHistoryEvent(this.currentLocation);
			this.fireOnNewListener = false;
		}
	},

	/*Public: Change the current HTML title*/
	changeTitle: function(historyData) {
		var winTitle = (historyData && historyData.newTitle
			/*Plug the new title into the pattern*/
			? this.baseTitle.replace('@@@', historyData.newTitle)
			/*Otherwise, if there is no new title, use the original document title. This is useful when some
			history changes have title changes and some don't; we can automatically return to the original
			title rather than leaving a misleading title in the title bar. The same goes for our "virgin"
			(hashless) page state.*/
			: this.originalTitle
		);
		/*No need to do anything if the title isn't changing*/
		if (document.title == winTitle) {
			return;
		}

		/*Now change the DOM*/
		document.title = winTitle;
		/*Change it in the iframe, too, for IE*/
		if (this.isIE) {
			this.iframe.contentWindow.document.title = winTitle;
		}

		/*If non-IE, reload the hash so the new title "sticks" in the browser history object*/
		if (!this.isIE && !this.isOpera) {
			var hash = decodeURIComponent((location.href.split("#")[1] || ""));
			if (hash != "") {
				var encodedHash = encodeURIComponent(this.removeHash(hash));
				document.location.hash = encodedHash;
			} else {
				//document.location.hash = "#";
			}
		}
	},

	/*Public: Add a history point. Parameters available:
	* newLocation (required):
		This will be the #hash value in the URL. Users can bookmark it. It will persist across sessions, so
		your application should be able to restore itself to a specific state based on just this value. It
		should be either a simple keyword for a viewstate or else a pseudo-querystring.
	* historyData (optional):
		This is for complex data that is relevant only to the current browsing session. It will be available
		to your application until the browser is closed. If the user comes back to a bookmarked history point
		during a later session, this data will no longer be available. Don't rely on it for application
		re-initialization from a bookmark.
	* historyData.newTitle (optional):
		This will swap out the html <title> attribute with a new value. If you have set a baseTitle using the
		options bundle, the value will be plugged into the baseTitle by swapping out the @@@ replacement param.
	*/
	add: function(newLocation, historyData) {

		var that = this;

		/*Escape the location and remove any leading hash symbols*/
		var encodedLocation = encodeURIComponent(this.removeHash(newLocation));

		if (this.isSafari) {

			/*Store the history data into history storage - pass in unencoded newLocation since
			historyStorage does its own encoding*/
			historyStorage.put(newLocation, historyData);

			/*Save this as our current location*/
			this.currentLocation = encodedLocation;

			/*Change the browser location*/
			window.location.hash = encodedLocation;

			/*Save this to the Safari form field*/
			this.putSafariState(encodedLocation);

			this.changeTitle(historyData);

		} else {

			/*Most browsers require that we wait a certain amount of time before changing the location, such
			as 200 MS; rather than forcing external callers to use window.setTimeout to account for this,
			we internally handle it by putting requests in a queue.*/
			var addImpl = function() {

				/*Indicate that the current wait time is now less*/
				if (that.currentWaitTime > 0) {
					that.currentWaitTime = that.currentWaitTime - that.waitTime;
				}

				/*IE has a strange bug; if the encodedLocation is the same as _any_ preexisting id in the
				document, then the history action gets recorded twice; throw a programmer exception if
				there is an element with this ID*/
				if (document.getElementById(encodedLocation) && that.debugMode) {
					var e = "Exception: History locations can not have the same value as _any_ IDs that might be in the document,"
					+ " due to a bug in IE; please ask the developer to choose a history location that does not match any HTML"
					+ " IDs in this document. The following ID is already taken and cannot be a location: " + newLocation;
					throw new Error(e);
				}

				/*Store the history data into history storage - pass in unencoded newLocation since
				historyStorage does its own encoding*/
				historyStorage.put(newLocation, historyData);

				/*Indicate to the browser to ignore this upcomming location change since we're making it programmatically*/
				that.ignoreLocationChange = true;

				/*Indicate to IE that this is an atomic location change block*/
				that.ieAtomicLocationChange = true;

				/*Save this as our current location*/
				that.currentLocation = encodedLocation;

				/*Change the browser location*/
				window.location.hash = encodedLocation;

				/*Change the hidden iframe's location if on IE*/
				if (that.isIE) {
					that.iframe.src = that.blankURL + encodedLocation;
				}

				/*End of atomic location change block for IE*/
				that.ieAtomicLocationChange = false;

				that.changeTitle(historyData);

			};

			/*Now queue up this add request*/
			window.setTimeout(addImpl, this.currentWaitTime);

			/*Indicate that the next request will have to wait for awhile*/
			this.currentWaitTime = this.currentWaitTime + this.waitTime;
		}
	},

	/*Public*/
	isFirstLoad: function() {
		return this.firstLoad;
	},

	/*Public*/
	getVersion: function() {
		return this.VERSIONNUMBER;
	},

	/*- - - - - - - - - - - -*/

	/*Private: Constant for our own internal history event called when the page is loaded*/
	PAGELOADEDSTRING: "DhtmlHistory_pageLoaded",

	VERSIONNUMBER: "0.8",

	/*
		Private: Pattern for title changes. Example: "Armchair DJ [@@@]" where @@@ will be relaced by values passed to add();
		Default is just the title itself, hence "@@@"
	*/
	baseTitle: "@@@",

	/*Private: Placeholder variable for the original document title; will be set in ititialize()*/
	originalTitle: null,

	/*Private: URL for the blank html file we use for IE; can be overridden via the options bundle. Otherwise it must be served
	in same directory as this library*/
	blankURL: "blank.html?",

	/*Private: Our history change listener.*/
	listener: null,

	/*Private: MS to wait between add requests - will be reset for certain browsers*/
	waitTime: 200,

	/*Private: MS before an add request can execute*/
	currentWaitTime: 0,

	/*Private: Our current hash location, without the "#" symbol.*/
	currentLocation: null,

	/*Private: Hidden iframe used to IE to detect history changes*/
	iframe: null,

	/*Private: Flags and DOM references used only by Safari*/
	safariHistoryStartPoint: null,
	safariStack: null,
	safariLength: null,

	/*Private: Flag used to keep checkLocation() from doing anything when it discovers location changes we've made ourselves
	programmatically with the add() method. Basically, add() sets this to true. When checkLocation() discovers it's true,
	it refrains from firing our listener, then resets the flag to false for next cycle. That way, our listener only gets fired on
	history change events triggered by the user via back/forward buttons and manual hash changes. This flag also helps us set up
	IE's special iframe-based method of handling history changes.*/
	ignoreLocationChange: null,

	/*Private: A flag that indicates that we should fire a history change event when we are ready, i.e. after we are initialized and
	we have a history change listener. This is needed due to an edge case in browsers other than IE; if you leave a page entirely
	then return, we must fire this as a history change event. Unfortunately, we have lost all references to listeners from earlier,
	because JavaScript clears out.*/
	fireOnNewListener: null,

	/*Private: A variable that indicates whether this is the first time this page has been loaded. If you go to a web page, leave it
	for another one, and then return, the page's onload listener fires again. We need a way to differentiate between the first page
	load and subsequent ones. This variable works hand in hand with the pageLoaded variable we store into historyStorage.*/
	firstLoad: null,

	/*Private: A variable to handle an important edge case in IE. In IE, if a user manually types an address into their browser's
	location bar, we must intercept this by calling checkLocation() at regular intervals. However, if we are programmatically
	changing the location bar ourselves using the add() method, we need to ignore these changes in checkLocation(). Unfortunately,
	these changes take several lines of code to complete, so for the duration of those lines of code, we set this variable to true.
	That signals to checkLocation() to ignore the change-in-progress. Once we're done with our chunk of location-change code in
	add(), we set this back to false. We'll do the same thing when capturing user-entered address changes in checkLocation itself.*/
	ieAtomicLocationChange: null,

	/*Private: Generic utility function for attaching events*/
	addEventListener: function(o,e,l) {
		if (o.addEventListener) {
			o.addEventListener(e,l,false);
		} else if (o.attachEvent) {
			o.attachEvent('on'+e,function() {
				l(window.event);
			});
		}
	},

	/*Private: Create IE-specific DOM nodes and overrides*/
	createIE: function(initialHash) {
		/*write out a hidden iframe for IE and set the amount of time to wait between add() requests*/
		this.waitTime = 400;/*IE needs longer between history updates*/
		var styles = (historyStorage.debugMode
			? 'width: 800px;height:80px;border:1px solid black;'
			: historyStorage.hideStyles
		);
		var iframeID = "rshHistoryFrame";
		var iframeHTML = '<iframe frameborder="0" id="' + iframeID + '" style="' + styles + '" src="' + this.blankURL + initialHash + '"></iframe>';
		document.write(iframeHTML);
		this.iframe = document.getElementById(iframeID);
	},

	/*Private: Create Opera-specific DOM nodes and overrides*/
	createOpera: function() {
		this.waitTime = 400;/*Opera needs longer between history updates*/
		var imgHTML = '<img src="javascript:location.href=\'javascript:dhtmlHistory.checkLocation();\';" style="' + historyStorage.hideStyles + '" />';
		document.write(imgHTML);
	},

	/*Private: Create Safari-specific DOM nodes and overrides*/
	createSafari: function() {
		var formID = "rshSafariForm";
		var stackID = "rshSafariStack";
		var lengthID = "rshSafariLength";
		var formStyles = historyStorage.debugMode ? historyStorage.showStyles : historyStorage.hideStyles;
		var stackStyles = (historyStorage.debugMode
			? 'width: 800px;height:80px;border:1px solid black;'
			: historyStorage.hideStyles
		);
		var lengthStyles = (historyStorage.debugMode
			? 'width:800px;height:20px;border:1px solid black;margin:0;padding:0;'
			: historyStorage.hideStyles
		);
		var safariHTML = '<form id="' + formID + '" style="' + formStyles + '">'
			+ '<textarea style="' + stackStyles + '" id="' + stackID + '">[]</textarea>'
			+ '<input type="text" style="' + lengthStyles + '" id="' + lengthID + '" value=""/>'
		+ '</form>';
		document.write(safariHTML);
		this.safariStack = document.getElementById(stackID);
		this.safariLength = document.getElementById(lengthID);
		if (!historyStorage.hasKey(this.PAGELOADEDSTRING)) {
			this.safariHistoryStartPoint = history.length;
			this.safariLength.value = this.safariHistoryStartPoint;
		} else {
			this.safariHistoryStartPoint = this.safariLength.value;
		}
	},

	/*TODO: make this public again?*/
	/*Private: Get browser's current hash location; for Safari, read value from a hidden form field*/
	getCurrentLocation: function() {
		var r = (this.isSafari
			? this.getSafariState()
			: this.getCurrentHash()
		);
		return r;
	},

	/*TODO: make this public again?*/
	/*Private: Manually parse the current url for a hash; tip of the hat to YUI*/
    getCurrentHash: function() {
		var r = window.location.href;
		var i = r.indexOf("#");
		return (i >= 0
			? r.substr(i+1)
			: ""
		);
    },

	/*Private: Safari method to read the history stack from a hidden form field*/
	getSafariStack: function() {
		var r = this.safariStack.value;
		return historyStorage.fromJSON(r);
	},
	/*Private: Safari method to read from the history stack*/
	getSafariState: function() {
		var stack = this.getSafariStack();
		var state = stack[history.length - this.safariHistoryStartPoint - 1];
		return state;
	},
	/*Private: Safari method to write the history stack to a hidden form field*/
	putSafariState: function(newLocation) {
	    var stack = this.getSafariStack();
	    stack[history.length - this.safariHistoryStartPoint] = newLocation;
	    this.safariStack.value = historyStorage.toJSON(stack);
	},

	/*Private: Notify the listener of new history changes.*/
	fireHistoryEvent: function(newHash) {
		var decodedHash = decodeURIComponent(newHash)
		/*extract the value from our history storage for this hash*/
		var historyData = historyStorage.get(decodedHash);
		this.changeTitle(historyData);
		/*call our listener*/
		this.listener.call(null, decodedHash, historyData);
	},

	/*Private: See if the browser has changed location. This is the primary history mechanism for Firefox. For IE, we use this to
	handle an important edge case: if a user manually types in a new hash value into their IE location bar and press enter, we want to
	to intercept this and notify any history listener.*/
	checkLocation: function() {

		/*Ignore any location changes that we made ourselves for browsers other than IE*/
		if (!this.isIE && this.ignoreLocationChange) {
			this.ignoreLocationChange = false;
			return;
		}

		/*If we are dealing with IE and we are in the middle of making a location change from an iframe, ignore it*/
		if (!this.isIE && this.ieAtomicLocationChange) {
			return;
		}

		/*Get hash location*/
		var hash = this.getCurrentLocation();

		/*Do nothing if there's been no change*/
		if (hash == this.currentLocation) {
			return;
		}

		/*In IE, users manually entering locations into the browser; we do this by comparing the browser's location against the
		iframe's location; if they differ, we are dealing with a manual event and need to place it inside our history, otherwise
		we can return*/
		this.ieAtomicLocationChange = true;

		if (this.isIE && this.getIframeHash() != hash) {
			this.iframe.src = this.blankURL + hash;
		}
		else if (this.isIE) {
			/*the iframe is unchanged*/
			return;
		}

		/*Save this new location*/
		this.currentLocation = hash;

		this.ieAtomicLocationChange = false;

		/*Notify listeners of the change*/
			this.fireHistoryEvent(hash);
	},

	/*Private: Get the current location of IE's hidden iframe.*/
	getIframeHash: function() {
		var doc = this.iframe.contentWindow.document;
		var hash = String(doc.location.search);
		if (hash.length == 1 && hash.charAt(0) == "?") {
			hash = "";
		}
		else if (hash.length >= 2 && hash.charAt(0) == "?") {
			hash = hash.substring(1);
		}
		return hash;
	},

	/*Private: Remove any leading hash that might be on a location.*/
	removeHash: function(hashValue) {
		var r;
		if (hashValue === null || hashValue === undefined) {
			r = null;
		}
		else if (hashValue === "") {
			r = "";
		}
		else if (hashValue.length == 1 && hashValue.charAt(0) == "#") {
			r = "";
		}
		else if (hashValue.length > 1 && hashValue.charAt(0) == "#") {
			r = hashValue.substring(1);
		}
		else {
			r = hashValue;
		}
		return r;
	},

	/*Private: For IE, tell when the hidden iframe has finished loading.*/
	iframeLoaded: function(newLocation) {
		/*ignore any location changes that we made ourselves*/
		if (this.ignoreLocationChange) {
			this.ignoreLocationChange = false;
			return;
		}

		/*Get the new location*/
		var hash = String(newLocation.search);
		if (hash.length == 1 && hash.charAt(0) == "?") {
			hash = "";
		}
		else if (hash.length >= 2 && hash.charAt(0) == "?") {
			hash = hash.substring(1);
		}
		/*Keep the browser location bar in sync with the iframe hash*/
		window.location.hash = hash;

		/*Notify listeners of the change*/
		this.fireHistoryEvent(hash);
	}

};

/*
	historyStorage: An object that uses a hidden form to store history state across page loads. The mechanism for doing so relies on
	the fact that browsers save the text in form data for the life of the browser session, which means the text is still there when
	the user navigates back to the page. This object can be used independently of the dhtmlHistory object for caching of Ajax
	session information.

	dependencies:
		* json2007.js (included in a separate file) or alternate JSON methods passed in through an options bundle.
*/
window.historyStorage = {

	/*Public: Set up our historyStorage object for use by dhtmlHistory or other objects*/
	setup: function(options) {

		/*
			options - object to store initialization parameters - passed in from dhtmlHistory or directly into historyStorage
			options.debugMode - boolean that causes hidden form fields to be shown for development purposes.
			options.toJSON - function to override default JSON stringifier
			options.fromJSON - function to override default JSON parser
		*/

		/*process init parameters*/
		if (typeof options !== "undefined") {
			if (options.debugMode) {
				this.debugMode = options.debugMode;
			}
			if (options.toJSON) {
				this.toJSON = options.toJSON;
			}
			if (options.fromJSON) {
				this.fromJSON = options.fromJSON;
			}
		}

		/*write a hidden form and textarea into the page; we'll stow our history stack here*/
		var formID = "rshStorageForm";
		var textareaID = "rshStorageField";
		var formStyles = this.debugMode ? historyStorage.showStyles : historyStorage.hideStyles;
		var textareaStyles = (historyStorage.debugMode
			? 'width: 800px;height:80px;border:1px solid black;'
			: historyStorage.hideStyles
		);
		var textareaHTML = '<form id="' + formID + '" style="' + formStyles + '">'
			+ '<textarea id="' + textareaID + '" style="' + textareaStyles + '"></textarea>'
		+ '</form>';
		document.write(textareaHTML);
		this.storageField = document.getElementById(textareaID);
		if (typeof window.opera !== "undefined") {
			this.storageField.focus();/*Opera needs to focus this element before persisting values in it*/
		}
	},

	/*Public*/
	put: function(key, value) {

		var encodedKey = encodeURIComponent(key);

		this.assertValidKey(encodedKey);
		/*if we already have a value for this, remove the value before adding the new one*/
		if (this.hasKey(key)) {
			this.remove(key);
		}
		/*store this new key*/
		this.storageHash[encodedKey] = value;
		/*save and serialize the hashtable into the form*/
		this.saveHashTable();
	},

	/*Public*/
	get: function(key) {

		var encodedKey = encodeURIComponent(key);

		this.assertValidKey(encodedKey);
		/*make sure the hash table has been loaded from the form*/
		this.loadHashTable();
		var value = this.storageHash[encodedKey];
		if (value === undefined) {
			value = null;
		}
		return value;
	},

	/*Public*/
	remove: function(key) {

		var encodedKey = encodeURIComponent(key);

		this.assertValidKey(encodedKey);
		/*make sure the hash table has been loaded from the form*/
		this.loadHashTable();
		/*delete the value*/
		delete this.storageHash[encodedKey];
		/*serialize and save the hash table into the form*/
		this.saveHashTable();
	},

	/*Public: Clears out all saved data.*/
	reset: function() {
		this.storageField.value = "";
		this.storageHash = {};
	},

	/*Public*/
	hasKey: function(key) {

		var encodedKey = encodeURIComponent(key);

		this.assertValidKey(encodedKey);
		/*make sure the hash table has been loaded from the form*/
		this.loadHashTable();
		return (typeof this.storageHash[encodedKey] !== "undefined");
	},

	/*Public*/
	isValidKey: function(key) {
		return (typeof key === "string");
		//TODO - should we ban hash signs and other special characters?
	},

	/*- - - - - - - - - - - -*/

	/*Private - CSS strings utilized by both objects to hide or show behind-the-scenes DOM elements*/
	showStyles: 'border:0;margin:0;padding:0;',
	hideStyles: 'left:-1000px;top:-1000px;width:1px;height:1px;border:0;position:absolute;',

	/*Private - debug mode flag*/
	debugMode: false,

	/*Private: Our hash of key name/values.*/
	storageHash: {},

	/*Private: If true, we have loaded our hash table out of the storage form.*/
	hashLoaded: false,

	/*Private: DOM reference to our history field*/
	storageField: null,

	/*Private: Assert that a key is valid; throw an exception if it not.*/
	assertValidKey: function(key) {
		var isValid = this.isValidKey(key);
		if (!isValid && this.debugMode) {
			throw new Error("Please provide a valid key for window.historyStorage. Invalid key = " + key + ".");
		}
	},

	/*Private: Load the hash table up from the form.*/
	loadHashTable: function() {
		if (!this.hashLoaded) {	
			var serializedHashTable = this.storageField.value;
			if (serializedHashTable !== "" && serializedHashTable !== null) {
				this.storageHash = this.fromJSON(serializedHashTable);
				this.hashLoaded = true;
			}
		}
	},
	/*Private: Save the hash table into the form.*/
	saveHashTable: function() {
		this.loadHashTable();
		var serializedHashTable = this.toJSON(this.storageHash);
		this.storageField.value = serializedHashTable;
	},
	/*Private: Bridges for our JSON implementations - both rely on 2007 JSON.org library - can be overridden by options bundle*/
	toJSON: function(o) {
		return o.toJSONString();
	},
	fromJSON: function(s) {
		return s.parseJSON();
	}
};
(function() {
	var MAPS = RIGHTMOVE.namespace("RIGHTMOVE.MAPS");

	var ClusteredOverlay = function() {
		this.map = null;
		this.markers = null;
		this.clusterer = null;
		this.zoom = null;
		this.markerPane = null;
		this.markerIcon = null;
		this.markerOverlay = null;
		this.createIconFunction = RIGHTMOVE.bind(this, function() {
										return this.markerIcon;
									});
		this.pixelBounds = new GSize(10, 10);
	};

	ClusteredOverlay.prototype = new GOverlay();

	ClusteredOverlay.prototype = {
		initialize : function(map) {
			this.map = map;
			this.markerPane = $(map.getPane(G_MAP_MARKER_PANE));
			this.zoom = map.getZoom();
			this.onInitialize();
		},

		remove : function() {
			this.removeMarkers();
			this.onRemove();
		},

		copy : function() {
			return null;
		},

		redraw : function() {
			if (this.zoom != this.map.getZoom()) {
				this.addMarkerLayer();
			}
		},

		setMarkerIcon : function(markerIcon) {
			this.markerIcon = markerIcon;
		},

		setPixelBounds : function(pixelBounds) {
			this.pixelBounds = pixelBounds;
		},

		setCreateIconFunction : function(createIconFunction) {
			this.createIconFunction = createIconFunction;
		},

		setMarkers : function(markers) {
			if (this.markers !== markers || this.zoom != this.map.getZoom()) {
				if (this.markers !== markers) {
					this.clusterer = new MAPS.MarkerClusterer(markers, this.map.getCurrentMapType().getProjection(), this.pixelBounds, false);
				}
				this.markers = markers;
				this.addMarkerLayer();
			}
		},

		removeMarkers : function() {
			this.markers = null;
			this.clusteredMarkers = null;
			this.clusterer = null;
			this.removeMarkerLayer();
		},

		removeMarkerLayer : function() {
			if (this.markerOverlay) {
				this.map.removeOverlay(this.markerOverlay);
				this.markerOverlay = null;
				this.onRemoveMarkerLayer();
			}
		},

		addMarkerLayer : function() {
			this.removeMarkerLayer();
			var zoom = this.map.getZoom();
			var clusteredMarkers = this.clusterer.getClusteredMarkers(zoom);
			this.markerOverlay = new MAPS.FastMarkerOverlay(clusteredMarkers, {
				createIconFunction : this.createIconFunction,
				alphaShadow : true
			});
			this.map.addOverlay(this.markerOverlay);
			this.zoom = zoom;
			this.onAddMarkerLayer();
		},

		simulateMarkerClick : function(itemId) {
			if (this.markerOverlay) {
				this.markerOverlay.selectItem(itemId);
			}
		},

		onRemoveMarkerLayer : function() {

		},

		onAddMarkerLayer : function() {

		},

		onInitialize : function() {

		},

		onRemove : function() {

		}
	};

	MAPS.ClusteredOverlay = ClusteredOverlay;
})();
(function() {
	var MAPS = RIGHTMOVE.namespace("RIGHTMOVE.MAPS");

	MAPS.dynamicMap = function() {
		var initialised = false;
		var options;
		var attachToElement;
		var map;
		var returnObject;
		var toDoWhenMapIsReady = [];

		var loadMap = function() {
			map = new GMap2(attachToElement[0]);
			if (options.polylines) {
				var polygon = RIGHTMOVE.UTIL.createGPolygonUsingEncodedPolylines({
					polylines : options.polylines,
					colour: "#666666",
					weight: 1,
					lineOpacity: 1,
					fillColour : "#3333ff",
					fillOpacity : 0.1
				});
				RIGHTMOVE.UTIL.centreMap(map, polygon.getBounds());
				map.addOverlay(polygon);
			} else {
				var centrePoint = new GLatLng(options.latitude, options.longitude);
				if (options.bounds) {
					RIGHTMOVE.UTIL.centreMap(map, options.bounds);
				} else {
					map.setCenter(centrePoint, options.zoom ? options.zoom : 14);
				}
			}
			if (options.customUIFunction) {
				map.setUI(options.customUIFunction(map));
			} else {
				map.setUIToDefault();
			}
			map.disableScrollWheelZoom();
			if (options.showPin) {
				addMarker(centrePoint);
			}
			jQuery.each(toDoWhenMapIsReady, function(i, func) {
				func();
			});
			$(returnObject).trigger("mapLoaded", {map : map});
		};

		var setupMap = function() {
			$(document).ready(loadMap);
			$(window).unload(GUnload);
		};

		var addMarker = function(centrePoint) {
			var baseIcon = new GIcon(G_DEFAULT_ICON);
			var rmIcon = new GIcon(baseIcon);

			if(options.customIcon) {
				rmIcon.image = options.customIcon;
				rmIcon.iconSize = new GSize(options.customIconWidth, options.customIconHeight);
				rmIcon.iconAnchor = new GPoint(10, 25);
				rmIcon.shadow = options.customIconShadow;
				rmIcon.shadowSize = new GSize(34, 25);
			}
			var marker;
			if (options.customMarkerFunction) {
				marker = options.customMarkerFunction(centrePoint, rmIcon);
			}
			else {
				marker = new GMarker(centrePoint, {icon:rmIcon, clickable: false, zIndexProcess : function() {return "";}});
			}
			map.addOverlay(marker);
			return marker;
		};

		var getMap = function() {
			return map;
		};

		var doWhenMapIsReady = function(func) {
			return function() {
				var args = arguments;
				if (map) {
					func.apply(null, arguments);
				} else {
					toDoWhenMapIsReady.push(function() {
						func.apply(null, args);
					});
				}
			};
		};

		var init = function(opts) {
			var browserIsCompatible = GBrowserIsCompatible;

			options = opts;
			attachToElement = $(options.attachToElement);

			if (browserIsCompatible()) {
				setupMap();
				initialised = true;
			}
		};

		var initOnce = function(opts){
			if(!initialised){
				init(opts);
			}
		};

		var checkResize = function() {
			if(map){
				var center = map.getCenter();
				map.checkResize();
				map.setCenter(center);
			}
		};

		returnObject = {
			init : init,
			initOnce : initOnce,
			addMarker : doWhenMapIsReady(addMarker),
			addMarkerNow : addMarker,
			getMap : getMap,
			checkResize : checkResize
		};

		return returnObject;
	}();
})();
(function() {
	var MAPS = RIGHTMOVE.namespace("RIGHTMOVE.MAPS");

	var idCounter = 0;
	/*
		Options:
			createIconFunction - function that will return a GIcon for the given marker
	 */
	var FastMarkerOverlay = function(markerData, options) {
		var that = this;
		this.overlayId = idCounter++;
		this.map = null;
		this.pane = null;
		this.markerData = markerData;
		this.markerIdToDataMap = [];
		this.drawn = false;
		this.hasShadow = false;
		this.options = {
			alphaShadow : false,
			alphaImage : false,
			createIconFunction : function() { return G_DEFAULT_ICON; }
		};
		this.itemMap = [];
		this.idPrefix = "fastmarker" + this.overlayId + "-";
		this.mapSize = null;

		jQuery.extend(this.options, options);

		$(".fastmarker" + this.overlayId).live("mouseover", function() {
			if (!jQuery.data(this, "fastMarkerEventsAdded")) {
				$(this).dblclick(function(event) {
					event.stopPropagation();
				}).mousedown(function(event) {
					event.stopPropagation();
				});
				jQuery.data(this, "fastMarkerEventsAdded", true);
			}
			that.markerEvent(this, "markerMouseOver");
		}).live("mouseout", function() {
			that.markerEvent(this, "markerMouseOut");
		}).live("click", function(event) {
			that.markerEvent(this, "markerClick");
			event.stopPropagation();
		});
	};

	FastMarkerOverlay.prototype = new GOverlay();

	jQuery.extend(FastMarkerOverlay.prototype, {
		initialize : function(map) {
			this.map = map;
			this.mapSize = map.getSize();
			this.pane = map.getPane(G_MAP_MARKER_PANE);
		},

		remove : function() {
			if (this.layer) {
				this.layer.remove();
			}
		},

		copy : function() {
			return new FastMarkerOverlay(this.markers, this.options);
		},

		redraw : function() {
			var size = this.map.getSize();
			if (!this.mapSize.equals(size)) {
				this.drawn = false;
				this.remove();
				this.mapSize = size;
			}
			if (!this.drawn) {
				this.drawn = true;
				this.addLayer();
			}
		},

		addLayer : function() {
			this.layer = this.createLayer();
			this.layer.prependTo($(this.pane));
			if (this.options.alphaShadow) {
				$(".mapshadow", this.layer).supersleight({shim : "/ps/images/maps/transparent.gif"});
			}
			if (this.options.alphaImage) {
				$(".mapimage", this.layer).supersleight({shim : "/ps/images/maps/transparent.gif"});
			}
		},

		createLayer : function() {
			this.markerIdToDataMap = [];
			this.itemMap = [];
			var length = this.markerData.length;
			var shadowHtml = ["<div class='fasttileoverlay'>"];
			var iconHtml = [];
			for (var i = 0; i < length; i++) {
				this.createMarker(this.markerData[i], i, shadowHtml, iconHtml);
			}
			var html = shadowHtml.concat(iconHtml);
			html.push("</div>");
			$(html.join("")).appendTo($(this.markerPane));

			return $(html.join(""));
		},

		createMarker : function(markerData, index, shadowHtml, iconHtml) {
			var icon = this.options.createIconFunction(markerData);
			var point = this.map.fromLatLngToDivPixel(markerData.gLatLng);
			if (icon.shadow) {
				shadowHtml.push(this.createImage(index, point, icon.shadow, icon.iconAnchor, null, "mapshadow"));
				this.hasShadow = true;
			}
			iconHtml.push(this.createImage(index, point, icon.image, icon.iconAnchor, this.idPrefix, "fastmarker" + this.overlayId + " mapimage"));
			this.markerIdToDataMap.push(markerData);
			jQuery.each(markerData.items, RIGHTMOVE.bind(this, function(i, item) {
				this.itemMap[item.id] = {
					item : item,
					markerId : index,
					highlightImage : icon.highlightImage,
					highlightOffset : icon.highlightAnchor ? new GPoint(icon.iconAnchor.x - icon.highlightAnchor.x, icon.iconAnchor.y - icon.highlightAnchor.y) : new GPoint(0,0),
					image : icon.image
				};
			}));
		},

		createImage : function(markerId, point, image, iconAnchor, idStart, cssClass) {
			return [
				"<img ",
				(idStart ? "id='" + idStart + markerId + "' " : ""),
				"src='",
				image,
				"' style='left:",
				point.x  - iconAnchor.x,
				"px; top:",
				point.y  - iconAnchor.y,
				"px;' class='" +
				cssClass +
				"'/>"].join('');
		},

		getMarkerData : function(marker) {
			var markerId = parseInt(marker.id.substr(this.idPrefix.length), 10);
			return markerId !== undefined ? this.markerIdToDataMap[markerId] : null;
		},

		markerEvent : function(marker, eventName, extraData) {
			var data = {
				marker : marker,
				markerData : this.getMarkerData(marker)
			};
			jQuery.extend(data, extraData);
			$(this).trigger(eventName, data);
		},

		selectItem : function(itemId) {
			var markerMapData = this.itemMap[itemId];
			if (markerMapData !== undefined) {
				this.markerEvent(this.getMarkerByMarkerId(markerMapData.markerId), "markerSelectItem", {selectId : itemId});
			}
		},

		highlight : function(marker, customHighlightImage) {
			var markerData = this.getMarkerData(marker);
			var markerInfo = this.itemMap[markerData.items[0].id];
			var highlightImage = customHighlightImage || markerInfo.highlightImage;
			if (highlightImage && !markerInfo.highlighted) {
				$(marker).attr("src", highlightImage);
				this.moveMarker(marker, markerInfo.highlightOffset);
				markerInfo.highlighted = true;
				if (this.options.alphaImage) {
					$(marker).supersleight({shim : "/ps/images/maps/transparent.gif"});
				}
				return true;
			}
			return false;
		},

		unhighlight : function(marker) {
			var markerData = this.getMarkerData(marker);
			var markerInfo = this.itemMap[markerData.items[0].id];
			if (markerInfo.highlightImage && markerInfo.highlighted) {
				$(marker).attr("src", markerInfo.image);
				var offset = markerInfo.highlightOffset;
				this.moveMarker(marker, new GPoint(-offset.x, -offset.y));
				markerInfo.highlighted = false;
				if (this.options.alphaImage) {
					$(marker).supersleight({shim : "/ps/images/maps/transparent.gif"});
				}
				return true;
			}
			return false;
		},

		highlightByItemId : function(itemId) {
			var marker = this.getMarkerByItemId(itemId);
			return marker ? this.highlight(marker) : false;
		},

		unhighlightByItemId : function(itemId) {
			var marker = this.getMarkerByItemId(itemId);
			return marker ? this.unhighlight(marker) : false;
		},

		moveMarker : function(marker, offset) {
			var left = parseInt($(marker).css("left"), 10);
			var top = parseInt($(marker).css("top"), 10);
			$(marker).css({left : left + offset.x + "px", top : top + offset.y+ "px"});
		},

		getMarkerByMarkerId : function(markerId) {
			return $("#fastmarker" + this.overlayId + "-" + markerId)[0];
		},

		getMarkerByItemId : function(itemId) {
			var markerInfo = this.itemMap[itemId];
			return markerInfo ? this.getMarkerByMarkerId(markerInfo.markerId) : null;
		},

		getItemById : function(itemId) {
			var markerInfo = this.itemMap[itemId];
			return markerInfo ? markerInfo.item : null;
		},

		getMarkerDataByItemId : function(itemId) {
			var marker = this.getMarkerByItemId(itemId);
			return this.getMarkerData(marker);
		}
	});

	MAPS.FastMarkerOverlay = FastMarkerOverlay;
})();
(function() {
	var MAPS = RIGHTMOVE.namespace("RIGHTMOVE.MAPS");

	var ListPanel = function(map, options) {
		this.map = map;
		this.options = {
			mapExpandedWidth : "100%",
			mapReducedWidth : "72%",
			mapCanvasSelector : "#map_canvas",
			disableScrollWheelZoom : false,
			listContainerSelector : null,
			createListFunction : null
		};

		jQuery.extend(this.options, options);

		this.mapCanvas = $(this.options.mapCanvasSelector);
		this.listContainer = $(this.options.listContainerSelector);
		this.panelLoadingMessageTimerId = null;
		this.hideListButton = null;
		this.showListButton = $("a[class=showlist]");

		this.showListButton.bind("click.listPanel", RIGHTMOVE.bind(this, this.showList));
	};

	ListPanel.prototype = {
		display : function() {
			this.reduceMap();
			this.setPanelLoading();
		},

		expandMap : function() {
			this.listContainer.hide();
			this.resizeMap(this.options.mapExpandedWidth);
		},

		reduceMap : function() {
			this.listContainer.show();
			this.showListButton.hide();
			this.resizeMap(this.options.mapReducedWidth);
		},

		resizeMap : function(width) {
			var centre = this.map.getCenter();
			this.mapCanvas.width(width);
			this.map.checkResize();
			if (this.options.disableScrollWheelZoom) {
				this.map.disableScrollWheelZoom();
			}
			this.map.setCenter(centre);
			$(this).trigger("mapSizeChanged");
		},

		clearPanelLoadingTimer : function() {
			if (this.panelLoadingMessageTimerId) {
				clearTimeout(this.panelLoadingMessageTimerId);
				this.panelLoadingMessageTimerId = null;
			}
		},

		setPanelLoading : function() {
			this.clearPanelLoadingTimer();
			this.panelLoadingMessageTimerId = setTimeout(RIGHTMOVE.bind(this, function() {
				this.listContainer.html("<div style='padding:1em'><img src='/ps/images/icons/loading-small.gif' style='padding-right:0.8em'/><span>Loading...</span></div>");
				this.panelLoadingMessageTimerId = null;
			}), 250);
		},

		addContents : function(items, tooMany) {
			this.clearPanelLoadingTimer();
			var html = ["<a href='#' class='hidelist' title='Hide the list of schools'></a>"];
			html.push(this.options.createListFunction(items, tooMany));
			this.listContainer.html(html.join(""));
			this.hideListButton = $("a[class=hidelist]");
			this.hideListButton.bind("click.listPanel", RIGHTMOVE.bind(this, this.hideList));
		},

		hideList : function() {
			this.expandMap();
			this.showListButton.show();
			return false;
		},

		showList : function() {
			this.reduceMap();
			return false;
		},

		remove : function() {
			this.listContainer.html("");
			this.expandMap();
			this.showListButton.hide().unbind(".listPanel");
			if (this.hideListButton) {
				this.hideListButton.unbind(".listPanel");
			}
		}
	};

	MAPS.ListPanel = ListPanel;
})();
(function() {
	var MAPS = RIGHTMOVE.namespace("RIGHTMOVE.MAPS");

	var boundsOverlap = RIGHTMOVE.UTIL.gBoundsOverlap;

	// If sorted is true, the markers must be in latitude order (highest first)
	var MarkerClusterer = function(markers, projection, pixelBounds, sorted) {
		if (!sorted) {
			markers.sort(function(a, b) {
				return RIGHTMOVE.UTIL.compareGLatLng(a.gLatLng, b.gLatLng);
			});
		}
		this.markers = markers;
		this.projection = projection;
		this.pixelBounds = pixelBounds;
		this.clusteredMarkersCache = [];
	};

	MarkerClusterer.prototype = {
		getClusteredMarkers : function(zoom) {
			var clusteredMarkers = this.clusteredMarkersCache[zoom];
			if (!clusteredMarkers) {
				clusteredMarkers = this.buildClusteredMarkers(zoom);
				this.clusteredMarkersCache[zoom] = clusteredMarkers;
			}

			return clusteredMarkers;
		},

		/*
			Each marker is expected to have a gLatLng property which is a GLatLng object:
		 */
		buildClusteredMarkers : function(zoom) {
			var markers = this.markers, markerCount = markers.length;
			var clusteredMarkers = [];
			var clusteredIndexes = [];
			var markerBoundsCache = [];
			var sortFunc = function(a, b) {return a.sort - b.sort;};

			for (var i = 0; i < markerCount; i++) {
				if (!clusteredIndexes[i]) {
					var marker = markers[i];
					var gLatLng = marker.gLatLng;
					var markerBounds = this.getMarkerBounds(gLatLng, zoom);
					var clusterMarkers = [marker];
					var latLngBounds = new GLatLngBounds(gLatLng, gLatLng);

					for (var j = i + 1; j < markerCount; j++) {
						if (!clusteredIndexes[j]) {
							var marker2 = markers[j];
							var markerBounds2 = markerBoundsCache[j];
							var gLatLng2 = marker2.gLatLng;
							if (!markerBounds2) {
								markerBoundsCache[j] = markerBounds2 = this.getMarkerBounds(gLatLng2, zoom);
							}
							if (boundsOverlap(markerBounds, markerBounds2)) {
								clusterMarkers.push(marker2);
								latLngBounds.extend(gLatLng2);
								clusteredIndexes[j] = true;
							}
							// markers are sorted by latitude so if this marker is competely below the main one so are all the rest
							if (markerBounds.maxY < markerBounds2.minY) {
								break;
							}
						}
					}

					if (marker.sort) {
						clusterMarkers.sort(sortFunc);
					}

					clusteredMarkers.push({
						gLatLng : latLngBounds.getCenter(),
						items : clusterMarkers
					});
				}
			}

			return clusteredMarkers;
		},

		getMarkerBounds : function(gLatLng, zoom) {
			var pixelPoint = this.projection.fromLatLngToPixel(gLatLng, zoom);
			var se = new GPoint(pixelPoint.x + this.pixelBounds.width, pixelPoint.y + this.pixelBounds.height);
			return new GBounds([pixelPoint, se]);
		}
	};

	MAPS.MarkerClusterer = MarkerClusterer;
})();
(function() {
	var MAPS = RIGHTMOVE.namespace("RIGHTMOVE.MAPS");

	var Popup = function() {
		this.map = null;
		this.markerData = null;
		this.container = null;
		this.scrollContainer = null;
		this.sizedContainer = null;
	};

	Popup.prototype = new GOverlay();

	jQuery.extend(Popup.prototype, {
		initialize : function(map) {
			this.map = map;
			this.container = this.createContainer();
			$(map.getPane(G_MAP_FLOAT_PANE)).append(this.container);
			this.container.mousedown(function(event) {event.stopPropagation();})
					.dblclick(function(event) {event.stopPropagation();});
			this.scrollContainer = this.scrollContainerSelector ? $(this.scrollContainerSelector) : this.container;
			this.scrollContainer.mousewheel(RIGHTMOVE.bind(this, function(event, delta) {
				// In IE when you scroll to the bottom of the container the scroll then spills over to the document
				// Stopping propagation of the event doesn't help so instead we will cancel the event altogether and
				// scroll the div ourselves
				var scrollDiff = -delta * 45;
				this.scrollContainer.scrollTo( (scrollDiff < 0 ? "-" : "+") + "=" + Math.abs(scrollDiff) + "px", { axis:"y" } );
				event.preventDefault();
			}));
			this.sizedContainer = this.sizedContainerSelector ? $(this.sizedContainerSelector) : this.container;
			this.setLoading();
			this.onAdd();
		},

		redraw : function(force) {
			if (!force) { return; }

			if (!this.drawn) {
				var offsetX, offsetY, pointerClass;
				var con = this.map.fromLatLngToContainerPixel(this.markerData.gLatLng);
				var div = this.map.fromLatLngToDivPixel(this.markerData.gLatLng);
				var mapSize = this.map.getSize();
				var popupSize = new GSize(this.sizedContainer.width(), this.sizedContainer.height());
				var room = {
					right : mapSize.width - con.x, bottom : mapSize.height - con.y
				};
				var spaceNeeded = {
					right : popupSize.width + this.popupSpaceBuffer.width,
					bottom : popupSize.height + this.popupSpaceBuffer.height
				};
				if (room.bottom >= spaceNeeded.bottom) {
					offsetY = div.y + this.popupAnchorOffsets.top;
					pointerClass = "top";
				} else {
					offsetY = div.y - popupSize.height + this.popupAnchorOffsets.bottom;
					pointerClass = "bottom";
				}
				if (room.right >= spaceNeeded.right) {
					offsetX = div.x + this.popupAnchorOffsets.left;
					pointerClass += "left";
				} else {
					offsetX = div.x - popupSize.width + this.popupAnchorOffsets.right;
					pointerClass += "right";
				}

				$("#pointer").attr("class", pointerClass);
				this.container.css("left", offsetX).css("top", offsetY);
				this.drawn = true;
				this.onRedraw(pointerClass);
			}
		},

		remove : function() {
			this.container.remove();
			this.onRemove();
		},

		copy : function() {
			return null;
		},

		setLoading : function() {
			this.scrollContainer.html("<div id='loading'>&nbsp;</div>");
			setTimeout(function() {
				$("#loading").html("<div><img src='/ps/images/icons/loading-small.gif'/><span>Loading...</span></div>");
			}, 250);
		},

		scrollTo : function(anchor) {
			if ($(anchor).length > 0) {
				this.scrollContainer.scrollTo(anchor);
			}
		},

		containsItem : function(itemId) {
			var items = this.markerData.items;
			for (var i = items.length - 1; i >= 0; i--) {
				if (items[i].id === itemId) { return true; }
			}
			return false;
		},

		onRemove : function() {},

		onAdd : function() {},

		onRedraw : function(pointerClass) {},

		// data for PopupListener to return in popupAdd event
		popupData : function() {return {}; },

		// array of popup events for PopupListener to forward
		popupEvents : null,

		popupSpaceBuffer : new GSize(0, 0),

		popupAnchorOffsets : {
			left : 0, right : 0, top : 0, bottom : 0
		},

		scrollContainerSelector : null,

		sizedContainerSelector : null,

		createContainer : function() {}
	});

	MAPS.Popup = Popup;

})();
(function() {
	var MAPS = RIGHTMOVE.namespace("RIGHTMOVE.MAPS");

	var listenerId = 0;

	var PopupListener = function(map, markerOverlay, options) {
		this.map = map;
		this.markerOverlay = markerOverlay;
		this.id = listenerId++;
		this.showPopupTimerId = null;
		this.removePopupTimerId = null;
		this.fixed = false;
		this.popupMarkerData = null;
		this.listeners = [];
		this.popup = null;
		this.isOverPopup = false;
		this.options = {
			popupShowDelay : 500,
			popupHideDelay : 500,
			scrollWheelEnabled : false
		};
		jQuery.extend(this.options, options);

		this.eventNamespace = ".popupListener" + this.id;
		$(markerOverlay).bind("markerMouseOver" + this.eventNamespace, RIGHTMOVE.bind(this, function(event, data) {
			this.mouseOver(data);
		})).bind("markerMouseOut" + this.eventNamespace, RIGHTMOVE.bind(this, function(event, data) {
			this.mouseOut(data);
		})).bind("markerClick" + this.eventNamespace, RIGHTMOVE.bind(this, function(event, data) {
			this.click(data);
		})).bind("markerSelectItem" + this.eventNamespace, RIGHTMOVE.bind(this, function(event, data) {
			this.selectItem(data);
		})).bind("markerRefresh" + this.eventNamespace, RIGHTMOVE.bind(this, function() {
			if (this.popupMarkerData) {
				this.markerOverlay.highlightByItemId(this.popupMarkerData.items[0].id);
			}
		}));

		this.listeners.push(GEvent.addListener(map, "map", RIGHTMOVE.bind(this, this.remove)));
		this.listeners.push(GEvent.addListener(map, "click", RIGHTMOVE.bind(this, this.remove)));
		this.listeners.push(GEvent.addListener(map, "dblclick", RIGHTMOVE.bind(this, this.remove)));
		this.listeners.push(GEvent.addListener(map, "zoomend", RIGHTMOVE.bind(this, this.remove)));

		$(map).bind("popupRemove" + this.eventNamespace, RIGHTMOVE.bind(this, function(event, data) {
			if (data.listener !== this) {
				this.fixed = false;
			}
		})).bind("popupAdd" + this.eventNamespace, RIGHTMOVE.bind(this, function(event, data) {
			if (data.listener !== this) {
				this.fixed = false;
				this.remove();
			}
		})).bind("popupFixed" + this.eventNamespace, RIGHTMOVE.bind(this, function(event, data) {
			if (data.listener !== this) {
				this.fixed = true;
			}
		}));
	};

	PopupListener.prototype = {
		mouseOver : function(data) {
			this.markerOverlay.highlight(data.marker);
			if (!this.fixed) {
				if (this.isPopupMarker(data.markerData)) {
					this.clearRemovePopupTimer();
				} else {
					this.startShowPopupTimer(data);
				}
			}
		},

		mouseOut : function(data) {
			this.clearShowPopupTimer();
			if (this.isPopupMarker(data.markerData)) {
				if (!this.fixed) {
					this.startRemovePopupTimer();
				}
			} else {
				this.markerOverlay.unhighlight(data.marker);
			}
		},

		click : function(data) {
			if (this.isPopupMarker(data.markerData)) {
				if (this.fixed) {
					this.remove();
				} else {
					this.fixPopup();
				}
			} else {
				this.show(data, true);
			}
		},

		selectItem : function(data) {
			if (this.isPopupMarker(data.markerData)) {
				this.fixPopup();
				this.scrollToAnchor(data.selectId);
			} else {
				this.show(data, true);
			}
		},

		clearTimers : function() {
			this.clearShowPopupTimer();
			this.clearRemovePopupTimer();
		},

		startShowPopupTimer : function(data) {
			this.clearShowPopupTimer();
			this.showPopupTimerId = setTimeout(RIGHTMOVE.bind(this, function() {
				this.show(data, false);
			}), this.options.popupShowDelay);
		},

		clearShowPopupTimer : function() {
			this.clearTimer("showPopupTimerId");
		},

		startRemovePopupTimer : function() {
			this.clearRemovePopupTimer();
			this.removePopupTimerId = setTimeout(RIGHTMOVE.bind(this, function() {
				this.remove();
			}), this.options.popupHideDelay);
		},

		clearRemovePopupTimer : function() {
			this.clearTimer("removePopupTimerId");
		},

		clearTimer : function(timerIdProperty) {
			var timerId = this[timerIdProperty];
			if (timerId) {
				clearTimeout(timerId);
				this[timerIdProperty] = null;
			}
		},

		remove : function() {
			if (this.popup) {
				this.markerOverlay.unhighlightByItemId(this.popupMarkerData.items[0].id);
				this.fixed = false;
				this.popupMarkerData = null;
				this.map.removeOverlay(this.popup);
				if (this.options.scrollWheelEnabled && !this.map.scrollWheelZoomEnabled() && this.isOverPopup) {
					this.map.enableScrollWheelZoom();
				}
				$(this.popup).unbind(".popupListener");
				this.popup = null;
				this.isOverPopup = false;
				$(this).trigger("popupRemove");
				$(this.map).trigger("popupRemove", {listener: this});
			}
		},

		show : function(data, fixed) {
			this.remove();
			this.clearTimers();
			this.popupMarkerData = data.markerData;
			this.popup = this.options.createPopupFunction(data);
			this.map.addOverlay(this.popup);
			this.popup.container.mouseover(RIGHTMOVE.bind(this, this.overPopup))
					.bind("mouseleave", RIGHTMOVE.bind(this, this.leavePopup));
			$("#popupClose", this.popup.container).click(RIGHTMOVE.bind(this, this.remove));
			var popupEvents = this.popup.popupEvents;
			if (popupEvents) {
				RIGHTMOVE.UTIL.forwardEvents(popupEvents, this.popup, this, ".popupListener");
			}
			if (data.selectId) {
				this.scrollToAnchor(data.selectId);
			}
			this.markerOverlay.highlightByItemId(this.popupMarkerData.items[0].id);
			$(this).trigger("popupAdd", this.popup.popupData());
			$(this.map).trigger("popupAdd", {listener: this});
			if (fixed) {
				this.fixPopup();
			}
		},

		scrollToAnchor : function(selectId) {
			if (this.options.scrollToAnchorFunction) {
				this.popup.scrollTo(this.options.scrollToAnchorFunction(selectId));
			}
		},

		overPopup : function() {
			if (this.options.scrollWheelEnabled && this.map.scrollWheelZoomEnabled()) {
				this.map.disableScrollWheelZoom();
			}
			if (!this.fixed) {
				this.clearRemovePopupTimer();
			}
			this.isOverPopup = true;
		},
		
		leavePopup : function() {
			if (this.options.scrollWheelEnabled && !this.map.scrollWheelZoomEnabled()) {
				this.map.enableScrollWheelZoom();
			}
			if (!this.fixed) {
				this.startRemovePopupTimer();
			}
			this.isOverPopup = false;
		},

		fixPopup : function() {
			this.fixed = true;
			$(this.map).trigger("popupFixed", {listener: this});
		},

		destroy : function() {
			this.remove();
			$(this.markerOverlay).unbind(this.eventNamespace);
			$(this.map).unbind(this.eventNamespace);
			for (var i = this.listeners.length - 1; i >= 0; i--) {
				GEvent.removeListener(this.listeners[i]);
			}
			this.clearTimers();
		},

		popupContainsItem : function(itemId) {
			if (!this.popup) { return false; }
			return this.popup.containsItem(itemId);
		},

		isPopupMarker : function(markerData) {
			return this.popupMarkerData && markerData.gLatLng.equals(this.popupMarkerData.gLatLng);
		}
	};

	MAPS.PopupListener = PopupListener;
})();
(function() {
	var MAPS = RIGHTMOVE.namespace("RIGHTMOVE.MAPS");

	var TILE_SIZE = 256;

	var getTileRange = function(min, max) {
		return {
			tileMin : Math.floor(min / TILE_SIZE),
			tileMax : Math.floor(max / TILE_SIZE)
		};
	};

	var arrayEquals = function(arr1, arr2) {
		if (!arr1 || !arr2 || arr1.length !== arr2.length) { return false; }
		for (var i = arr1.length - 1; i >= 0; i--) {
			if (arr1[i] != arr2[i]) { return false; }
		}

		return true;
	};

	// Memoize to prevent recalculation of tile keys
	var createTileKey = RIGHTMOVE.memoize(function(x, y, zoom) {
		var id = [];
		for (var i = zoom - 1; i >= 0; i--) {
			var mask = Math.pow(2, i);
			var zoomKey = ((x & mask) > 0 ? 1 : 0) + ((y & mask) > 0 ? 2 : 0);
			id.push(zoomKey);
		}

		return {
			id : id.join(''),
			x : x,
			y : y,
			zoom : zoom,
			items : null
		};
	});

	var createParentTileKey = function(tileKey) {
		var tileId = tileKey.id;
		return {
			id : tileId.substr(0, tileId.length - 1),
			x : Math.floor(tileKey.x / 2),
			y : Math.floor(tileKey.y / 2),
			zoom : tileKey.zoom - 1,
			items : null
		};
	};

	var createChildTileKey = function(tileKey, quadrant) {
		var addX = quadrant % 2 === 1 ? 1 : 0;
		var addY = quadrant > 2 ? 1 : 0;
		return {
			id : tileKey.id + quadrant,
			x : tileKey.x * 2 + addX,
			y : tileKey.y * 2 + addY,
			zoom : tileKey.zoom + 1,
			items : null
		};
	};

	var createChildTileKeys = function(tileKey) {
		return [
			createChildTileKey(tileKey, 0),
			createChildTileKey(tileKey, 1),
			createChildTileKey(tileKey, 2),
			createChildTileKey(tileKey, 3)
		];
	};

	var getTileKeys = function(map, pixelBuffer) {
		pixelBuffer = pixelBuffer || 0;
		var tileKeys = [];
		var bounds = map.getBounds();
		var zoom = map.getZoom();
		var projection = map.getCurrentMapType().getProjection();
		var pixelSW = projection.fromLatLngToPixel(bounds.getSouthWest(), zoom);
		var pixelNE = projection.fromLatLngToPixel(bounds.getNorthEast(), zoom);
		var longRange = getTileRange(pixelSW.x - pixelBuffer, pixelNE.x + pixelBuffer);
		var latRange = getTileRange(pixelNE.y - pixelBuffer, pixelSW.y + pixelBuffer);

		for (var x = longRange.tileMin; x <= longRange.tileMax; x++) {
			for (var y = latRange.tileMin; y <= latRange.tileMax; y++) {
				tileKeys.push(createTileKey(x, y, zoom));
			}
		}

		return tileKeys;
	};

	var Tile = function(key, bounds) {
		this.key = key;
		this.bounds = bounds;
		this.item = null;
		this.loading = false;
		this.error = false;
	};

	Tile.prototype = {
		isLoaded : function() {
			return !this.loading && !this.error;
		}
	};

	/*
		Options:
			tileUri - uri for loading tile data
			maxResultsPerTile - maximum number of items for a single tile
			createIconFunction - function that will return a GIcon for the given item
			showItem - function that decides whether an icon should be shown - all will be shown if this is not passed in
			focus - a GLatLng - used to sort visible items
	 */
	var TileOverlay = function(options) {
		this.map = null;
		this.pane = null;
		this.tileKeys = null;
		this.tiles = [];
		this.options = {
			showItem : function() { return true; },
			maxResultsPerTile : 50,
			alphaShadow : false,
			alphaImage : false,
			tileParameters : {}
		};
		this.fastMarkerOverlay = null;
		this.dragging = false;
		this.listeners = [];

		jQuery.extend(this.options, options);
	};

	TileOverlay.prototype = new GOverlay();

	jQuery.extend(TileOverlay.prototype, {
		initialize : function(map) {
			this.map = map;
			this.pane = map.getPane(G_MAP_MARKER_PANE);
			this.listeners.push(GEvent.addListener(map, "dragstart", RIGHTMOVE.bind(this, function() {
				this.dragging = true;
			})));
			this.listeners.push(GEvent.addListener(map, "dragend", RIGHTMOVE.bind(this, function() {
				this.dragging = false;
				this.redraw();
			})));
		},

		remove : function() {
			this.removeCurrentLayer();
			for (var i = this.listeners.length - 1; i >= 0; i--) {
				GEvent.removeListener(this.listeners[i]);
			}
		},

		copy : function() {
			return new TileOverlay();
		},

		redraw : function() {
			if (!this.dragging) {
				if (this.layer && this.layer.zoom != this.map.getZoom()) {
					this.removeCurrentLayer();
				}
				var loaded = this.loadTiles();
				if (loaded) {
					this.refresh();
				} else {
					$(this).trigger("loading");
				}
			}
		},

		loadTiles : function() {
			var keysToLoad = [];
			var allLoaded = true;
			var tooMany = false;
			var tileKeys = getTileKeys(this.map);
			for (var i = tileKeys.length - 1; i >= 0; i--) {
				var tileKey = tileKeys[i];
				var tile = this.loadTileLocal(tileKey);
				if (tile) {
					allLoaded = allLoaded && tile.isLoaded();
					tooMany = tooMany || tile.tooMany;
				} else {
					keysToLoad.push(tileKey);
					allLoaded = false;
				}
			}

			if (!tooMany) {
				for (i = keysToLoad.length - 1; i >= 0; i--) {
					this.loadTileAjax(keysToLoad[i]);
				}
			}

			this.tileKeys = tileKeys;

			return tooMany || allLoaded;
		},

		loadTileLocal : function(tileKey) {
			var tileId = tileKey.id;
			var tile = this.tiles[tileId];
			if (tile) { return tile; }

			tile = this.loadTileFromParent(tileKey);
			if (!tile) {
				tile = this.loadTileFromChildren(tileKey);
			}
			if (tile) {
				this.tiles[tileId] = tile;
			}

			return tile;
		},

		loadTileFromParent : function(tileKey) {
			var parentTileKey = createParentTileKey(tileKey);
			var parentTile = this.tiles[parentTileKey.id];
			if (!parentTile || !parentTile.isLoaded() || parentTile.tooMany) { return null; }

			var tile = this.createTile(tileKey);
			var parentItems = parentTile.items;
			var items = [];
			var bounds = tile.bounds;
			for (var i = parentItems.length - 1; i >= 0; i--) {
				var item = parentItems[i];
				if (bounds.containsLatLng(item.gLatLng)) {
					items.push(item);
				}
			}
			tile.items = items;
			return tile;
		},

		loadTileFromChildren : function(tileKey) {
			var childTileKeys = createChildTileKeys(tileKey);
			var items = [];
			var tooMany = false;
			var allLoaded = true;
			for (var i = 0; i <= 3; i++) {
				var childTileKey = childTileKeys[i];
				var childTile = this.tiles[childTileKey.id];
				allLoaded = allLoaded && childTile && childTile.isLoaded();
				tooMany = tooMany || (childTile && childTile.tooMany);
				if (tooMany) {
					break;
				}
				if (allLoaded) {
					jQuery.merge(items, childTile.items);
				}
			}

			if (!allLoaded && !tooMany) {
				return null;
			}
			var tile = this.createTile(tileKey);
			if (tooMany || items.length > this.options.maxResultsPerTile) {
				tile.tooMany = true;
				tile.items = null;
			} else {
				tile.items = items;
			}
			return tile;
		},

		loadTileAjax : function(tileKey) {
			var tile = this.createTile(tileKey);
			var tileId = tileKey.id;
			tile.loading = true;
			var data = {tileKey : tileId};
			jQuery.extend(data, this.options.tileParameters);

			jQuery.ajax({
				type: "GET",
				dataType : "json",
				data: data,
				url: RIGHTMOVE.UTIL.encodeUri(this.options.tileUri),
				timeout: 30000,
				success: RIGHTMOVE.bind(this, function (data) {
					var items = data.items;
					var focus = this.options.focus;
					if (items) {
						tile.items = items;
						for (var i = items.length - 1; i >= 0; i--) {
							var item = items[i];
							item.gLatLng = RIGHTMOVE.UTIL.createGLatLng(item.latLng);
							if (focus) {
								item.distanceToFocus = focus.distanceFrom(item.gLatLng);
							}
						}
					}
					tile.tooMany = data.tooMany;
					tile.loading = false;
					this.refresh();
				}),
				error : RIGHTMOVE.bind(this, function () {
					tile.loading = false;
					tile.error = true;
				})
			});

			this.tiles[tileId] = tile;
		},

		createTile : function(tileKey) {
			var projection = this.map.getCurrentMapType().getProjection();
			var x = tileKey.x, y = tileKey.y;
			var sw = projection.fromPixelToLatLng(new GPoint(x * 256, (y + 1) * 256), tileKey.zoom);
			var ne = projection.fromPixelToLatLng(new GPoint((x + 1) * 256, y * 256), tileKey.zoom);

			return new Tile(tileKey, new GLatLngBounds(sw, ne));
		},

		refresh : function() {
			var allLoaded = true;
			var tooMany = false;
			var items = [];
			var tileKeys = this.tileKeys;
			for (var i = tileKeys.length - 1; i >= 0; i--) {
				var tile = this.tiles[tileKeys[i].id];
				allLoaded = allLoaded && tile && tile.isLoaded();
				if (tile) {
					tooMany = tooMany || tile.tooMany;
					if (tooMany) {
						break;
					}
					if (allLoaded) {
						jQuery.merge(items, this.getVisibleItems(tile.items));
					}
				}
			}

			if (!allLoaded) {
				$(this).trigger("loading");
			}

			if (tooMany || allLoaded) {
				this.draw(items, tooMany);
			}
		},

		getVisibleItems : function(items) {
			var visible = [];
			var mapBounds = this.map.getBounds();
			for (var i = items.length - 1; i >= 0; i--) {
				var item = items[i];
				if (this.options.showItem(item) && mapBounds.contains(item.gLatLng)) {
					visible.push(item);
				}
			}

			return visible;
		},

		draw : function(items, tooMany) {
			$(this).trigger("loaded");
			if (tooMany) {
				this.removeCurrentLayer();
			} else {
				if (!arrayEquals(items, this.visibleItems)) {
					var overlay = this.createOverlay(items);
					this.addLayer(overlay);
					this.visibleItems = items;
					$(this).trigger("markerRefresh");
				}
			}

			if (tooMany && !this.tooMany) {
				$(this).trigger("tooManyResults");
			} else if (!tooMany && this.tooMany) {
				$(this).trigger("notTooManyResults");
			}

			if (!tooMany) {
				if (this.options.focus) {
					items.sort(function(a, b) {
						return a.distanceToFocus - b.distanceToFocus;
					});
				}
				$(this).trigger("drewResults", {items : items});
			}
			this.tooMany = tooMany;
		},

		createOverlay : function(items) {
			var clusterer = new MAPS.MarkerClusterer(items, this.map.getCurrentMapType().getProjection(), new GSize(0,0), false);
			var clusteredMarkers = clusterer.getClusteredMarkers(this.map.getZoom());

			return new MAPS.FastMarkerOverlay(clusteredMarkers, {
				createIconFunction : this.options.createIconFunction,
				alphaShadow : this.options.alphaShadow,
				alphaImage : this.options.alphaImage
			});
		},

		addLayer : function(overlay) {
			var oldLayer = this.layer;
			this.layer = {
				overlay : overlay,
				zoom : this.map.getZoom()
			};
			this.map.addOverlay(overlay);
			RIGHTMOVE.UTIL.forwardEvents(["markerMouseOver", "markerMouseOut", "markerClick", "markerSelectItem"], overlay, this);
			this.removeLayer(oldLayer);
		},

		removeCurrentLayer : function() {
			this.removeLayer(this.layer);
			this.layer = null;
			this.visibleItems = null;
		},

		removeLayer : function(layer) {
			if (layer) {
				this.map.removeOverlay(layer.overlay);
			}
		},

		selectItem : function(id) {
			if (this.layer) {
				this.layer.overlay.selectItem(id);
			}
		},

		highlight : function(marker) {
			if (this.layer) {
				return this.layer.overlay.highlight(marker);
			}
			return false;
		},

		unhighlight : function(marker) {
			if (this.layer) {
				return this.layer.overlay.unhighlight(marker);
			}
			return false;
		},

		highlightByItemId : function(itemId) {
			if (this.layer) {
				return this.layer.overlay.highlightByItemId(itemId);
			}
			return false;
		},

		unhighlightByItemId : function(itemId) {
			if (this.layer) {
				return this.layer.overlay.unhighlightByItemId(itemId);
			}
			return false;
		},

		getItemById : function(itemId) {
			return this.layer ? this.layer.overlay.getItemById(itemId): null;
		},

		getMarkerDataByItemId : function(itemId) {
			return this.layer ? this.layer.overlay.getMarkerDataByItemId(itemId): null;
		}
	});

	MAPS.TileOverlay = TileOverlay;
})();
(function() {
	var MAPS = RIGHTMOVE.namespace("RIGHTMOVE.MAPS");

	var ClusteredOverlay = function() {
		this.map = null;
		this.markers = null;
		this.clusterer = null;
		this.zoom = null;
		this.markerPane = null;
		this.markerIcon = null;
		this.markerOverlay = null;
		this.createIconFunction = RIGHTMOVE.bind(this, function() {
										return this.markerIcon;
									});
		this.pixelBounds = new GSize(10, 10);
	};

	ClusteredOverlay.prototype = new GOverlay();

	ClusteredOverlay.prototype = {
		initialize : function(map) {
			this.map = map;
			this.markerPane = $(map.getPane(G_MAP_MARKER_PANE));
			this.zoom = map.getZoom();
			this.onInitialize();
		},

		remove : function() {
			this.removeMarkers();
			this.onRemove();
		},

		copy : function() {
			return null;
		},

		redraw : function() {
			if (this.zoom != this.map.getZoom()) {
				this.addMarkerLayer();
			}
		},

		setMarkerIcon : function(markerIcon) {
			this.markerIcon = markerIcon;
		},

		setPixelBounds : function(pixelBounds) {
			this.pixelBounds = pixelBounds;
		},

		setCreateIconFunction : function(createIconFunction) {
			this.createIconFunction = createIconFunction;
		},

		setMarkers : function(markers) {
			if (this.markers !== markers || this.zoom != this.map.getZoom()) {
				if (this.markers !== markers) {
					this.clusterer = new MAPS.MarkerClusterer(markers, this.map.getCurrentMapType().getProjection(), this.pixelBounds, false);
				}
				this.markers = markers;
				this.addMarkerLayer();
			}
		},

		removeMarkers : function() {
			this.markers = null;
			this.clusteredMarkers = null;
			this.clusterer = null;
			this.removeMarkerLayer();
		},

		removeMarkerLayer : function() {
			if (this.markerOverlay) {
				this.map.removeOverlay(this.markerOverlay);
				this.markerOverlay = null;
				this.onRemoveMarkerLayer();
			}
		},

		addMarkerLayer : function() {
			this.removeMarkerLayer();
			var zoom = this.map.getZoom();
			var clusteredMarkers = this.clusterer.getClusteredMarkers(zoom);
			this.markerOverlay = new MAPS.FastMarkerOverlay(clusteredMarkers, {
				createIconFunction : this.createIconFunction,
				alphaShadow : true
			});
			this.map.addOverlay(this.markerOverlay);
			this.zoom = zoom;
			this.onAddMarkerLayer();
		},

		simulateMarkerClick : function(itemId) {
			if (this.markerOverlay) {
				this.markerOverlay.selectItem(itemId);
			}
		},

		onRemoveMarkerLayer : function() {

		},

		onAddMarkerLayer : function() {

		},

		onInitialize : function() {

		},

		onRemove : function() {

		}
	};

	MAPS.ClusteredOverlay = ClusteredOverlay;
})();
(function() {
	var MAPS = RIGHTMOVE.namespace("RIGHTMOVE.MAPS");

	MAPS.dynamicMap = function() {
		var initialised = false;
		var options;
		var attachToElement;
		var map;
		var returnObject;
		var toDoWhenMapIsReady = [];

		var loadMap = function() {
			map = new GMap2(attachToElement[0]);
			if (options.polylines) {
				var polygon = RIGHTMOVE.UTIL.createGPolygonUsingEncodedPolylines({
					polylines : options.polylines,
					colour: "#666666",
					weight: 1,
					lineOpacity: 1,
					fillColour : "#3333ff",
					fillOpacity : 0.1
				});
				RIGHTMOVE.UTIL.centreMap(map, polygon.getBounds());
				map.addOverlay(polygon);
			} else {
				var centrePoint = new GLatLng(options.latitude, options.longitude);
				if (options.bounds) {
					RIGHTMOVE.UTIL.centreMap(map, options.bounds);
				} else {
					map.setCenter(centrePoint, options.zoom ? options.zoom : 14);
				}
			}
			if (options.customUIFunction) {
				map.setUI(options.customUIFunction(map));
			} else {
				map.setUIToDefault();
			}
			map.disableScrollWheelZoom();
			if (options.showPin) {
				addMarker(centrePoint);
			}
			jQuery.each(toDoWhenMapIsReady, function(i, func) {
				func();
			});
			$(returnObject).trigger("mapLoaded", {map : map});
		};

		var setupMap = function() {
			$(document).ready(loadMap);
			$(window).unload(GUnload);
		};

		var addMarker = function(centrePoint) {
			var baseIcon = new GIcon(G_DEFAULT_ICON);
			var rmIcon = new GIcon(baseIcon);

			if(options.customIcon) {
				rmIcon.image = options.customIcon;
				rmIcon.iconSize = new GSize(options.customIconWidth, options.customIconHeight);
				rmIcon.iconAnchor = new GPoint(10, 25);
				rmIcon.shadow = options.customIconShadow;
				rmIcon.shadowSize = new GSize(34, 25);
			}
			var marker;
			if (options.customMarkerFunction) {
				marker = options.customMarkerFunction(centrePoint, rmIcon);
			}
			else {
				marker = new GMarker(centrePoint, {icon:rmIcon, clickable: false, zIndexProcess : function() {return "";}});
			}
			map.addOverlay(marker);
			return marker;
		};

		var getMap = function() {
			return map;
		};

		var doWhenMapIsReady = function(func) {
			return function() {
				var args = arguments;
				if (map) {
					func.apply(null, arguments);
				} else {
					toDoWhenMapIsReady.push(function() {
						func.apply(null, args);
					});
				}
			};
		};

		var init = function(opts) {
			var browserIsCompatible = GBrowserIsCompatible;

			options = opts;
			attachToElement = $(options.attachToElement);

			if (browserIsCompatible()) {
				setupMap();
				initialised = true;
			}
		};

		var initOnce = function(opts){
			if(!initialised){
				init(opts);
			}
		};

		var checkResize = function() {
			if(map){
				var center = map.getCenter();
				map.checkResize();
				map.setCenter(center);
			}
		};

		returnObject = {
			init : init,
			initOnce : initOnce,
			addMarker : doWhenMapIsReady(addMarker),
			addMarkerNow : addMarker,
			getMap : getMap,
			checkResize : checkResize
		};

		return returnObject;
	}();
})();
(function() {
	var MAPS = RIGHTMOVE.namespace("RIGHTMOVE.MAPS");

	var idCounter = 0;
	/*
		Options:
			createIconFunction - function that will return a GIcon for the given marker
	 */
	var FastMarkerOverlay = function(markerData, options) {
		var that = this;
		this.overlayId = idCounter++;
		this.map = null;
		this.pane = null;
		this.markerData = markerData;
		this.markerIdToDataMap = [];
		this.drawn = false;
		this.hasShadow = false;
		this.options = {
			alphaShadow : false,
			alphaImage : false,
			createIconFunction : function() { return G_DEFAULT_ICON; }
		};
		this.itemMap = [];
		this.idPrefix = "fastmarker" + this.overlayId + "-";
		this.mapSize = null;

		jQuery.extend(this.options, options);

		$(".fastmarker" + this.overlayId).live("mouseover", function() {
			if (!jQuery.data(this, "fastMarkerEventsAdded")) {
				$(this).dblclick(function(event) {
					event.stopPropagation();
				}).mousedown(function(event) {
					event.stopPropagation();
				});
				jQuery.data(this, "fastMarkerEventsAdded", true);
			}
			that.markerEvent(this, "markerMouseOver");
		}).live("mouseout", function() {
			that.markerEvent(this, "markerMouseOut");
		}).live("click", function(event) {
			that.markerEvent(this, "markerClick");
			event.stopPropagation();
		});
	};

	FastMarkerOverlay.prototype = new GOverlay();

	jQuery.extend(FastMarkerOverlay.prototype, {
		initialize : function(map) {
			this.map = map;
			this.mapSize = map.getSize();
			this.pane = map.getPane(G_MAP_MARKER_PANE);
		},

		remove : function() {
			if (this.layer) {
				this.layer.remove();
			}
		},

		copy : function() {
			return new FastMarkerOverlay(this.markers, this.options);
		},

		redraw : function() {
			var size = this.map.getSize();
			if (!this.mapSize.equals(size)) {
				this.drawn = false;
				this.remove();
				this.mapSize = size;
			}
			if (!this.drawn) {
				this.drawn = true;
				this.addLayer();
			}
		},

		addLayer : function() {
			this.layer = this.createLayer();
			this.layer.prependTo($(this.pane));
			if (this.options.alphaShadow) {
				$(".mapshadow", this.layer).supersleight({shim : "/ps/images/maps/transparent.gif"});
			}
			if (this.options.alphaImage) {
				$(".mapimage", this.layer).supersleight({shim : "/ps/images/maps/transparent.gif"});
			}
		},

		createLayer : function() {
			this.markerIdToDataMap = [];
			this.itemMap = [];
			var length = this.markerData.length;
			var shadowHtml = ["<div class='fasttileoverlay'>"];
			var iconHtml = [];
			for (var i = 0; i < length; i++) {
				this.createMarker(this.markerData[i], i, shadowHtml, iconHtml);
			}
			var html = shadowHtml.concat(iconHtml);
			html.push("</div>");
			$(html.join("")).appendTo($(this.markerPane));

			return $(html.join(""));
		},

		createMarker : function(markerData, index, shadowHtml, iconHtml) {
			var icon = this.options.createIconFunction(markerData);
			var point = this.map.fromLatLngToDivPixel(markerData.gLatLng);
			if (icon.shadow) {
				shadowHtml.push(this.createImage(index, point, icon.shadow, icon.iconAnchor, null, "mapshadow"));
				this.hasShadow = true;
			}
			iconHtml.push(this.createImage(index, point, icon.image, icon.iconAnchor, this.idPrefix, "fastmarker" + this.overlayId + " mapimage"));
			this.markerIdToDataMap.push(markerData);
			jQuery.each(markerData.items, RIGHTMOVE.bind(this, function(i, item) {
				this.itemMap[item.id] = {
					item : item,
					markerId : index,
					highlightImage : icon.highlightImage,
					highlightOffset : icon.highlightAnchor ? new GPoint(icon.iconAnchor.x - icon.highlightAnchor.x, icon.iconAnchor.y - icon.highlightAnchor.y) : new GPoint(0,0),
					image : icon.image
				};
			}));
		},

		createImage : function(markerId, point, image, iconAnchor, idStart, cssClass) {
			return [
				"<img ",
				(idStart ? "id='" + idStart + markerId + "' " : ""),
				"src='",
				image,
				"' style='left:",
				point.x  - iconAnchor.x,
				"px; top:",
				point.y  - iconAnchor.y,
				"px;' class='" +
				cssClass +
				"'/>"].join('');
		},

		getMarkerData : function(marker) {
			var markerId = parseInt(marker.id.substr(this.idPrefix.length), 10);
			return markerId !== undefined ? this.markerIdToDataMap[markerId] : null;
		},

		markerEvent : function(marker, eventName, extraData) {
			var data = {
				marker : marker,
				markerData : this.getMarkerData(marker)
			};
			jQuery.extend(data, extraData);
			$(this).trigger(eventName, data);
		},

		selectItem : function(itemId) {
			var markerMapData = this.itemMap[itemId];
			if (markerMapData !== undefined) {
				this.markerEvent(this.getMarkerByMarkerId(markerMapData.markerId), "markerSelectItem", {selectId : itemId});
			}
		},

		highlight : function(marker, customHighlightImage) {
			var markerData = this.getMarkerData(marker);
			var markerInfo = this.itemMap[markerData.items[0].id];
			var highlightImage = customHighlightImage || markerInfo.highlightImage;
			if (highlightImage && !markerInfo.highlighted) {
				$(marker).attr("src", highlightImage);
				this.moveMarker(marker, markerInfo.highlightOffset);
				markerInfo.highlighted = true;
				if (this.options.alphaImage) {
					$(marker).supersleight({shim : "/ps/images/maps/transparent.gif"});
				}
				return true;
			}
			return false;
		},

		unhighlight : function(marker) {
			var markerData = this.getMarkerData(marker);
			var markerInfo = this.itemMap[markerData.items[0].id];
			if (markerInfo.highlightImage && markerInfo.highlighted) {
				$(marker).attr("src", markerInfo.image);
				var offset = markerInfo.highlightOffset;
				this.moveMarker(marker, new GPoint(-offset.x, -offset.y));
				markerInfo.highlighted = false;
				if (this.options.alphaImage) {
					$(marker).supersleight({shim : "/ps/images/maps/transparent.gif"});
				}
				return true;
			}
			return false;
		},

		highlightByItemId : function(itemId) {
			var marker = this.getMarkerByItemId(itemId);
			return marker ? this.highlight(marker) : false;
		},

		unhighlightByItemId : function(itemId) {
			var marker = this.getMarkerByItemId(itemId);
			return marker ? this.unhighlight(marker) : false;
		},

		moveMarker : function(marker, offset) {
			var left = parseInt($(marker).css("left"), 10);
			var top = parseInt($(marker).css("top"), 10);
			$(marker).css({left : left + offset.x + "px", top : top + offset.y+ "px"});
		},

		getMarkerByMarkerId : function(markerId) {
			return $("#fastmarker" + this.overlayId + "-" + markerId)[0];
		},

		getMarkerByItemId : function(itemId) {
			var markerInfo = this.itemMap[itemId];
			return markerInfo ? this.getMarkerByMarkerId(markerInfo.markerId) : null;
		},

		getItemById : function(itemId) {
			var markerInfo = this.itemMap[itemId];
			return markerInfo ? markerInfo.item : null;
		},

		getMarkerDataByItemId : function(itemId) {
			var marker = this.getMarkerByItemId(itemId);
			return this.getMarkerData(marker);
		}
	});

	MAPS.FastMarkerOverlay = FastMarkerOverlay;
})();
(function() {
	var MAPS = RIGHTMOVE.namespace("RIGHTMOVE.MAPS");

	var ListPanel = function(map, options) {
		this.map = map;
		this.options = {
			mapExpandedWidth : "100%",
			mapReducedWidth : "72%",
			mapCanvasSelector : "#map_canvas",
			disableScrollWheelZoom : false,
			listContainerSelector : null,
			createListFunction : null
		};

		jQuery.extend(this.options, options);

		this.mapCanvas = $(this.options.mapCanvasSelector);
		this.listContainer = $(this.options.listContainerSelector);
		this.panelLoadingMessageTimerId = null;
		this.hideListButton = null;
		this.showListButton = $("a[class=showlist]");

		this.showListButton.bind("click.listPanel", RIGHTMOVE.bind(this, this.showList));
	};

	ListPanel.prototype = {
		display : function() {
			this.reduceMap();
			this.setPanelLoading();
		},

		expandMap : function() {
			this.listContainer.hide();
			this.resizeMap(this.options.mapExpandedWidth);
		},

		reduceMap : function() {
			this.listContainer.show();
			this.showListButton.hide();
			this.resizeMap(this.options.mapReducedWidth);
		},

		resizeMap : function(width) {
			var centre = this.map.getCenter();
			this.mapCanvas.width(width);
			this.map.checkResize();
			if (this.options.disableScrollWheelZoom) {
				this.map.disableScrollWheelZoom();
			}
			this.map.setCenter(centre);
			$(this).trigger("mapSizeChanged");
		},

		clearPanelLoadingTimer : function() {
			if (this.panelLoadingMessageTimerId) {
				clearTimeout(this.panelLoadingMessageTimerId);
				this.panelLoadingMessageTimerId = null;
			}
		},

		setPanelLoading : function() {
			this.clearPanelLoadingTimer();
			this.panelLoadingMessageTimerId = setTimeout(RIGHTMOVE.bind(this, function() {
				this.listContainer.html("<div style='padding:1em'><img src='/ps/images/icons/loading-small.gif' style='padding-right:0.8em'/><span>Loading...</span></div>");
				this.panelLoadingMessageTimerId = null;
			}), 250);
		},

		addContents : function(items, tooMany) {
			this.clearPanelLoadingTimer();
			var html = ["<a href='#' class='hidelist' title='Hide the list of schools'></a>"];
			html.push(this.options.createListFunction(items, tooMany));
			this.listContainer.html(html.join(""));
			this.hideListButton = $("a[class=hidelist]");
			this.hideListButton.bind("click.listPanel", RIGHTMOVE.bind(this, this.hideList));
		},

		hideList : function() {
			this.expandMap();
			this.showListButton.show();
			return false;
		},

		showList : function() {
			this.reduceMap();
			return false;
		},

		remove : function() {
			this.listContainer.html("");
			this.expandMap();
			this.showListButton.hide().unbind(".listPanel");
			if (this.hideListButton) {
				this.hideListButton.unbind(".listPanel");
			}
		}
	};

	MAPS.ListPanel = ListPanel;
})();
(function() {
	var MAPS = RIGHTMOVE.namespace("RIGHTMOVE.MAPS");

	var boundsOverlap = RIGHTMOVE.UTIL.gBoundsOverlap;

	// If sorted is true, the markers must be in latitude order (highest first)
	var MarkerClusterer = function(markers, projection, pixelBounds, sorted) {
		if (!sorted) {
			markers.sort(function(a, b) {
				return RIGHTMOVE.UTIL.compareGLatLng(a.gLatLng, b.gLatLng);
			});
		}
		this.markers = markers;
		this.projection = projection;
		this.pixelBounds = pixelBounds;
		this.clusteredMarkersCache = [];
	};

	MarkerClusterer.prototype = {
		getClusteredMarkers : function(zoom) {
			var clusteredMarkers = this.clusteredMarkersCache[zoom];
			if (!clusteredMarkers) {
				clusteredMarkers = this.buildClusteredMarkers(zoom);
				this.clusteredMarkersCache[zoom] = clusteredMarkers;
			}

			return clusteredMarkers;
		},

		/*
			Each marker is expected to have a gLatLng property which is a GLatLng object:
		 */
		buildClusteredMarkers : function(zoom) {
			var markers = this.markers, markerCount = markers.length;
			var clusteredMarkers = [];
			var clusteredIndexes = [];
			var markerBoundsCache = [];
			var sortFunc = function(a, b) {return a.sort - b.sort;};

			for (var i = 0; i < markerCount; i++) {
				if (!clusteredIndexes[i]) {
					var marker = markers[i];
					var gLatLng = marker.gLatLng;
					var markerBounds = this.getMarkerBounds(gLatLng, zoom);
					var clusterMarkers = [marker];
					var latLngBounds = new GLatLngBounds(gLatLng, gLatLng);

					for (var j = i + 1; j < markerCount; j++) {
						if (!clusteredIndexes[j]) {
							var marker2 = markers[j];
							var markerBounds2 = markerBoundsCache[j];
							var gLatLng2 = marker2.gLatLng;
							if (!markerBounds2) {
								markerBoundsCache[j] = markerBounds2 = this.getMarkerBounds(gLatLng2, zoom);
							}
							if (boundsOverlap(markerBounds, markerBounds2)) {
								clusterMarkers.push(marker2);
								latLngBounds.extend(gLatLng2);
								clusteredIndexes[j] = true;
							}
							// markers are sorted by latitude so if this marker is competely below the main one so are all the rest
							if (markerBounds.maxY < markerBounds2.minY) {
								break;
							}
						}
					}

					if (marker.sort) {
						clusterMarkers.sort(sortFunc);
					}

					clusteredMarkers.push({
						gLatLng : latLngBounds.getCenter(),
						items : clusterMarkers
					});
				}
			}

			return clusteredMarkers;
		},

		getMarkerBounds : function(gLatLng, zoom) {
			var pixelPoint = this.projection.fromLatLngToPixel(gLatLng, zoom);
			var se = new GPoint(pixelPoint.x + this.pixelBounds.width, pixelPoint.y + this.pixelBounds.height);
			return new GBounds([pixelPoint, se]);
		}
	};

	MAPS.MarkerClusterer = MarkerClusterer;
})();
(function() {
	var MAPS = RIGHTMOVE.namespace("RIGHTMOVE.MAPS");

	var Popup = function() {
		this.map = null;
		this.markerData = null;
		this.container = null;
		this.scrollContainer = null;
		this.sizedContainer = null;
	};

	Popup.prototype = new GOverlay();

	jQuery.extend(Popup.prototype, {
		initialize : function(map) {
			this.map = map;
			this.container = this.createContainer();
			$(map.getPane(G_MAP_FLOAT_PANE)).append(this.container);
			this.container.mousedown(function(event) {event.stopPropagation();})
					.dblclick(function(event) {event.stopPropagation();});
			this.scrollContainer = this.scrollContainerSelector ? $(this.scrollContainerSelector) : this.container;
			this.scrollContainer.mousewheel(RIGHTMOVE.bind(this, function(event, delta) {
				// In IE when you scroll to the bottom of the container the scroll then spills over to the document
				// Stopping propagation of the event doesn't help so instead we will cancel the event altogether and
				// scroll the div ourselves
				var scrollDiff = -delta * 45;
				this.scrollContainer.scrollTo( (scrollDiff < 0 ? "-" : "+") + "=" + Math.abs(scrollDiff) + "px", { axis:"y" } );
				event.preventDefault();
			}));
			this.sizedContainer = this.sizedContainerSelector ? $(this.sizedContainerSelector) : this.container;
			this.setLoading();
			this.onAdd();
		},

		redraw : function(force) {
			if (!force) { return; }

			if (!this.drawn) {
				var offsetX, offsetY, pointerClass;
				var con = this.map.fromLatLngToContainerPixel(this.markerData.gLatLng);
				var div = this.map.fromLatLngToDivPixel(this.markerData.gLatLng);
				var mapSize = this.map.getSize();
				var popupSize = new GSize(this.sizedContainer.width(), this.sizedContainer.height());
				var room = {
					right : mapSize.width - con.x, bottom : mapSize.height - con.y
				};
				var spaceNeeded = {
					right : popupSize.width + this.popupSpaceBuffer.width,
					bottom : popupSize.height + this.popupSpaceBuffer.height
				};
				if (room.bottom >= spaceNeeded.bottom) {
					offsetY = div.y + this.popupAnchorOffsets.top;
					pointerClass = "top";
				} else {
					offsetY = div.y - popupSize.height + this.popupAnchorOffsets.bottom;
					pointerClass = "bottom";
				}
				if (room.right >= spaceNeeded.right) {
					offsetX = div.x + this.popupAnchorOffsets.left;
					pointerClass += "left";
				} else {
					offsetX = div.x - popupSize.width + this.popupAnchorOffsets.right;
					pointerClass += "right";
				}

				$("#pointer").attr("class", pointerClass);
				this.container.css("left", offsetX).css("top", offsetY);
				this.drawn = true;
				this.onRedraw(pointerClass);
			}
		},

		remove : function() {
			this.container.remove();
			this.onRemove();
		},

		copy : function() {
			return null;
		},

		setLoading : function() {
			this.scrollContainer.html("<div id='loading'>&nbsp;</div>");
			setTimeout(function() {
				$("#loading").html("<div><img src='/ps/images/icons/loading-small.gif'/><span>Loading...</span></div>");
			}, 250);
		},

		scrollTo : function(anchor) {
			if ($(anchor).length > 0) {
				this.scrollContainer.scrollTo(anchor);
			}
		},

		containsItem : function(itemId) {
			var items = this.markerData.items;
			for (var i = items.length - 1; i >= 0; i--) {
				if (items[i].id === itemId) { return true; }
			}
			return false;
		},

		onRemove : function() {},

		onAdd : function() {},

		onRedraw : function(pointerClass) {},

		// data for PopupListener to return in popupAdd event
		popupData : function() {return {}; },

		// array of popup events for PopupListener to forward
		popupEvents : null,

		popupSpaceBuffer : new GSize(0, 0),

		popupAnchorOffsets : {
			left : 0, right : 0, top : 0, bottom : 0
		},

		scrollContainerSelector : null,

		sizedContainerSelector : null,

		createContainer : function() {}
	});

	MAPS.Popup = Popup;

})();
(function() {
	var MAPS = RIGHTMOVE.namespace("RIGHTMOVE.MAPS");

	var listenerId = 0;

	var PopupListener = function(map, markerOverlay, options) {
		this.map = map;
		this.markerOverlay = markerOverlay;
		this.id = listenerId++;
		this.showPopupTimerId = null;
		this.removePopupTimerId = null;
		this.fixed = false;
		this.popupMarkerData = null;
		this.listeners = [];
		this.popup = null;
		this.isOverPopup = false;
		this.options = {
			popupShowDelay : 500,
			popupHideDelay : 500,
			scrollWheelEnabled : false
		};
		jQuery.extend(this.options, options);

		this.eventNamespace = ".popupListener" + this.id;
		$(markerOverlay).bind("markerMouseOver" + this.eventNamespace, RIGHTMOVE.bind(this, function(event, data) {
			this.mouseOver(data);
		})).bind("markerMouseOut" + this.eventNamespace, RIGHTMOVE.bind(this, function(event, data) {
			this.mouseOut(data);
		})).bind("markerClick" + this.eventNamespace, RIGHTMOVE.bind(this, function(event, data) {
			this.click(data);
		})).bind("markerSelectItem" + this.eventNamespace, RIGHTMOVE.bind(this, function(event, data) {
			this.selectItem(data);
		})).bind("markerRefresh" + this.eventNamespace, RIGHTMOVE.bind(this, function() {
			if (this.popupMarkerData) {
				this.markerOverlay.highlightByItemId(this.popupMarkerData.items[0].id);
			}
		}));

		this.listeners.push(GEvent.addListener(map, "map", RIGHTMOVE.bind(this, this.remove)));
		this.listeners.push(GEvent.addListener(map, "click", RIGHTMOVE.bind(this, this.remove)));
		this.listeners.push(GEvent.addListener(map, "dblclick", RIGHTMOVE.bind(this, this.remove)));
		this.listeners.push(GEvent.addListener(map, "zoomend", RIGHTMOVE.bind(this, this.remove)));

		$(map).bind("popupRemove" + this.eventNamespace, RIGHTMOVE.bind(this, function(event, data) {
			if (data.listener !== this) {
				this.fixed = false;
			}
		})).bind("popupAdd" + this.eventNamespace, RIGHTMOVE.bind(this, function(event, data) {
			if (data.listener !== this) {
				this.fixed = false;
				this.remove();
			}
		})).bind("popupFixed" + this.eventNamespace, RIGHTMOVE.bind(this, function(event, data) {
			if (data.listener !== this) {
				this.fixed = true;
			}
		}));
	};

	PopupListener.prototype = {
		mouseOver : function(data) {
			this.markerOverlay.highlight(data.marker);
			if (!this.fixed) {
				if (this.isPopupMarker(data.markerData)) {
					this.clearRemovePopupTimer();
				} else {
					this.startShowPopupTimer(data);
				}
			}
		},

		mouseOut : function(data) {
			this.clearShowPopupTimer();
			if (this.isPopupMarker(data.markerData)) {
				if (!this.fixed) {
					this.startRemovePopupTimer();
				}
			} else {
				this.markerOverlay.unhighlight(data.marker);
			}
		},

		click : function(data) {
			if (this.isPopupMarker(data.markerData)) {
				if (this.fixed) {
					this.remove();
				} else {
					this.fixPopup();
				}
			} else {
				this.show(data, true);
			}
		},

		selectItem : function(data) {
			if (this.isPopupMarker(data.markerData)) {
				this.fixPopup();
				this.scrollToAnchor(data.selectId);
			} else {
				this.show(data, true);
			}
		},

		clearTimers : function() {
			this.clearShowPopupTimer();
			this.clearRemovePopupTimer();
		},

		startShowPopupTimer : function(data) {
			this.clearShowPopupTimer();
			this.showPopupTimerId = setTimeout(RIGHTMOVE.bind(this, function() {
				this.show(data, false);
			}), this.options.popupShowDelay);
		},

		clearShowPopupTimer : function() {
			this.clearTimer("showPopupTimerId");
		},

		startRemovePopupTimer : function() {
			this.clearRemovePopupTimer();
			this.removePopupTimerId = setTimeout(RIGHTMOVE.bind(this, function() {
				this.remove();
			}), this.options.popupHideDelay);
		},

		clearRemovePopupTimer : function() {
			this.clearTimer("removePopupTimerId");
		},

		clearTimer : function(timerIdProperty) {
			var timerId = this[timerIdProperty];
			if (timerId) {
				clearTimeout(timerId);
				this[timerIdProperty] = null;
			}
		},

		remove : function() {
			if (this.popup) {
				this.markerOverlay.unhighlightByItemId(this.popupMarkerData.items[0].id);
				this.fixed = false;
				this.popupMarkerData = null;
				this.map.removeOverlay(this.popup);
				if (this.options.scrollWheelEnabled && !this.map.scrollWheelZoomEnabled() && this.isOverPopup) {
					this.map.enableScrollWheelZoom();
				}
				$(this.popup).unbind(".popupListener");
				this.popup = null;
				this.isOverPopup = false;
				$(this).trigger("popupRemove");
				$(this.map).trigger("popupRemove", {listener: this});
			}
		},

		show : function(data, fixed) {
			this.remove();
			this.clearTimers();
			this.popupMarkerData = data.markerData;
			this.popup = this.options.createPopupFunction(data);
			this.map.addOverlay(this.popup);
			this.popup.container.mouseover(RIGHTMOVE.bind(this, this.overPopup))
					.bind("mouseleave", RIGHTMOVE.bind(this, this.leavePopup));
			$("#popupClose", this.popup.container).click(RIGHTMOVE.bind(this, this.remove));
			var popupEvents = this.popup.popupEvents;
			if (popupEvents) {
				RIGHTMOVE.UTIL.forwardEvents(popupEvents, this.popup, this, ".popupListener");
			}
			if (data.selectId) {
				this.scrollToAnchor(data.selectId);
			}
			this.markerOverlay.highlightByItemId(this.popupMarkerData.items[0].id);
			$(this).trigger("popupAdd", this.popup.popupData());
			$(this.map).trigger("popupAdd", {listener: this});
			if (fixed) {
				this.fixPopup();
			}
		},

		scrollToAnchor : function(selectId) {
			if (this.options.scrollToAnchorFunction) {
				this.popup.scrollTo(this.options.scrollToAnchorFunction(selectId));
			}
		},

		overPopup : function() {
			if (this.options.scrollWheelEnabled && this.map.scrollWheelZoomEnabled()) {
				this.map.disableScrollWheelZoom();
			}
			if (!this.fixed) {
				this.clearRemovePopupTimer();
			}
			this.isOverPopup = true;
		},
		
		leavePopup : function() {
			if (this.options.scrollWheelEnabled && !this.map.scrollWheelZoomEnabled()) {
				this.map.enableScrollWheelZoom();
			}
			if (!this.fixed) {
				this.startRemovePopupTimer();
			}
			this.isOverPopup = false;
		},

		fixPopup : function() {
			this.fixed = true;
			$(this.map).trigger("popupFixed", {listener: this});
		},

		destroy : function() {
			this.remove();
			$(this.markerOverlay).unbind(this.eventNamespace);
			$(this.map).unbind(this.eventNamespace);
			for (var i = this.listeners.length - 1; i >= 0; i--) {
				GEvent.removeListener(this.listeners[i]);
			}
			this.clearTimers();
		},

		popupContainsItem : function(itemId) {
			if (!this.popup) { return false; }
			return this.popup.containsItem(itemId);
		},

		isPopupMarker : function(markerData) {
			return this.popupMarkerData && markerData.gLatLng.equals(this.popupMarkerData.gLatLng);
		}
	};

	MAPS.PopupListener = PopupListener;
})();
(function() {
	var MAPS = RIGHTMOVE.namespace("RIGHTMOVE.MAPS");

	var TILE_SIZE = 256;

	var getTileRange = function(min, max) {
		return {
			tileMin : Math.floor(min / TILE_SIZE),
			tileMax : Math.floor(max / TILE_SIZE)
		};
	};

	var arrayEquals = function(arr1, arr2) {
		if (!arr1 || !arr2 || arr1.length !== arr2.length) { return false; }
		for (var i = arr1.length - 1; i >= 0; i--) {
			if (arr1[i] != arr2[i]) { return false; }
		}

		return true;
	};

	// Memoize to prevent recalculation of tile keys
	var createTileKey = RIGHTMOVE.memoize(function(x, y, zoom) {
		var id = [];
		for (var i = zoom - 1; i >= 0; i--) {
			var mask = Math.pow(2, i);
			var zoomKey = ((x & mask) > 0 ? 1 : 0) + ((y & mask) > 0 ? 2 : 0);
			id.push(zoomKey);
		}

		return {
			id : id.join(''),
			x : x,
			y : y,
			zoom : zoom,
			items : null
		};
	});

	var createParentTileKey = function(tileKey) {
		var tileId = tileKey.id;
		return {
			id : tileId.substr(0, tileId.length - 1),
			x : Math.floor(tileKey.x / 2),
			y : Math.floor(tileKey.y / 2),
			zoom : tileKey.zoom - 1,
			items : null
		};
	};

	var createChildTileKey = function(tileKey, quadrant) {
		var addX = quadrant % 2 === 1 ? 1 : 0;
		var addY = quadrant > 2 ? 1 : 0;
		return {
			id : tileKey.id + quadrant,
			x : tileKey.x * 2 + addX,
			y : tileKey.y * 2 + addY,
			zoom : tileKey.zoom + 1,
			items : null
		};
	};

	var createChildTileKeys = function(tileKey) {
		return [
			createChildTileKey(tileKey, 0),
			createChildTileKey(tileKey, 1),
			createChildTileKey(tileKey, 2),
			createChildTileKey(tileKey, 3)
		];
	};

	var getTileKeys = function(map, pixelBuffer) {
		pixelBuffer = pixelBuffer || 0;
		var tileKeys = [];
		var bounds = map.getBounds();
		var zoom = map.getZoom();
		var projection = map.getCurrentMapType().getProjection();
		var pixelSW = projection.fromLatLngToPixel(bounds.getSouthWest(), zoom);
		var pixelNE = projection.fromLatLngToPixel(bounds.getNorthEast(), zoom);
		var longRange = getTileRange(pixelSW.x - pixelBuffer, pixelNE.x + pixelBuffer);
		var latRange = getTileRange(pixelNE.y - pixelBuffer, pixelSW.y + pixelBuffer);

		for (var x = longRange.tileMin; x <= longRange.tileMax; x++) {
			for (var y = latRange.tileMin; y <= latRange.tileMax; y++) {
				tileKeys.push(createTileKey(x, y, zoom));
			}
		}

		return tileKeys;
	};

	var Tile = function(key, bounds) {
		this.key = key;
		this.bounds = bounds;
		this.item = null;
		this.loading = false;
		this.error = false;
	};

	Tile.prototype = {
		isLoaded : function() {
			return !this.loading && !this.error;
		}
	};

	/*
		Options:
			tileUri - uri for loading tile data
			maxResultsPerTile - maximum number of items for a single tile
			createIconFunction - function that will return a GIcon for the given item
			showItem - function that decides whether an icon should be shown - all will be shown if this is not passed in
			focus - a GLatLng - used to sort visible items
	 */
	var TileOverlay = function(options) {
		this.map = null;
		this.pane = null;
		this.tileKeys = null;
		this.tiles = [];
		this.options = {
			showItem : function() { return true; },
			maxResultsPerTile : 50,
			alphaShadow : false,
			alphaImage : false,
			tileParameters : {}
		};
		this.fastMarkerOverlay = null;
		this.dragging = false;
		this.listeners = [];

		jQuery.extend(this.options, options);
	};

	TileOverlay.prototype = new GOverlay();

	jQuery.extend(TileOverlay.prototype, {
		initialize : function(map) {
			this.map = map;
			this.pane = map.getPane(G_MAP_MARKER_PANE);
			this.listeners.push(GEvent.addListener(map, "dragstart", RIGHTMOVE.bind(this, function() {
				this.dragging = true;
			})));
			this.listeners.push(GEvent.addListener(map, "dragend", RIGHTMOVE.bind(this, function() {
				this.dragging = false;
				this.redraw();
			})));
		},

		remove : function() {
			this.removeCurrentLayer();
			for (var i = this.listeners.length - 1; i >= 0; i--) {
				GEvent.removeListener(this.listeners[i]);
			}
		},

		copy : function() {
			return new TileOverlay();
		},

		redraw : function() {
			if (!this.dragging) {
				if (this.layer && this.layer.zoom != this.map.getZoom()) {
					this.removeCurrentLayer();
				}
				var loaded = this.loadTiles();
				if (loaded) {
					this.refresh();
				} else {
					$(this).trigger("loading");
				}
			}
		},

		loadTiles : function() {
			var keysToLoad = [];
			var allLoaded = true;
			var tooMany = false;
			var tileKeys = getTileKeys(this.map);
			for (var i = tileKeys.length - 1; i >= 0; i--) {
				var tileKey = tileKeys[i];
				var tile = this.loadTileLocal(tileKey);
				if (tile) {
					allLoaded = allLoaded && tile.isLoaded();
					tooMany = tooMany || tile.tooMany;
				} else {
					keysToLoad.push(tileKey);
					allLoaded = false;
				}
			}

			if (!tooMany) {
				for (i = keysToLoad.length - 1; i >= 0; i--) {
					this.loadTileAjax(keysToLoad[i]);
				}
			}

			this.tileKeys = tileKeys;

			return tooMany || allLoaded;
		},

		loadTileLocal : function(tileKey) {
			var tileId = tileKey.id;
			var tile = this.tiles[tileId];
			if (tile) { return tile; }

			tile = this.loadTileFromParent(tileKey);
			if (!tile) {
				tile = this.loadTileFromChildren(tileKey);
			}
			if (tile) {
				this.tiles[tileId] = tile;
			}

			return tile;
		},

		loadTileFromParent : function(tileKey) {
			var parentTileKey = createParentTileKey(tileKey);
			var parentTile = this.tiles[parentTileKey.id];
			if (!parentTile || !parentTile.isLoaded() || parentTile.tooMany) { return null; }

			var tile = this.createTile(tileKey);
			var parentItems = parentTile.items;
			var items = [];
			var bounds = tile.bounds;
			for (var i = parentItems.length - 1; i >= 0; i--) {
				var item = parentItems[i];
				if (bounds.containsLatLng(item.gLatLng)) {
					items.push(item);
				}
			}
			tile.items = items;
			return tile;
		},

		loadTileFromChildren : function(tileKey) {
			var childTileKeys = createChildTileKeys(tileKey);
			var items = [];
			var tooMany = false;
			var allLoaded = true;
			for (var i = 0; i <= 3; i++) {
				var childTileKey = childTileKeys[i];
				var childTile = this.tiles[childTileKey.id];
				allLoaded = allLoaded && childTile && childTile.isLoaded();
				tooMany = tooMany || (childTile && childTile.tooMany);
				if (tooMany) {
					break;
				}
				if (allLoaded) {
					jQuery.merge(items, childTile.items);
				}
			}

			if (!allLoaded && !tooMany) {
				return null;
			}
			var tile = this.createTile(tileKey);
			if (tooMany || items.length > this.options.maxResultsPerTile) {
				tile.tooMany = true;
				tile.items = null;
			} else {
				tile.items = items;
			}
			return tile;
		},

		loadTileAjax : function(tileKey) {
			var tile = this.createTile(tileKey);
			var tileId = tileKey.id;
			tile.loading = true;
			var data = {tileKey : tileId};
			jQuery.extend(data, this.options.tileParameters);

			jQuery.ajax({
				type: "GET",
				dataType : "json",
				data: data,
				url: RIGHTMOVE.UTIL.encodeUri(this.options.tileUri),
				timeout: 30000,
				success: RIGHTMOVE.bind(this, function (data) {
					var items = data.items;
					var focus = this.options.focus;
					if (items) {
						tile.items = items;
						for (var i = items.length - 1; i >= 0; i--) {
							var item = items[i];
							item.gLatLng = RIGHTMOVE.UTIL.createGLatLng(item.latLng);
							if (focus) {
								item.distanceToFocus = focus.distanceFrom(item.gLatLng);
							}
						}
					}
					tile.tooMany = data.tooMany;
					tile.loading = false;
					this.refresh();
				}),
				error : RIGHTMOVE.bind(this, function () {
					tile.loading = false;
					tile.error = true;
				})
			});

			this.tiles[tileId] = tile;
		},

		createTile : function(tileKey) {
			var projection = this.map.getCurrentMapType().getProjection();
			var x = tileKey.x, y = tileKey.y;
			var sw = projection.fromPixelToLatLng(new GPoint(x * 256, (y + 1) * 256), tileKey.zoom);
			var ne = projection.fromPixelToLatLng(new GPoint((x + 1) * 256, y * 256), tileKey.zoom);

			return new Tile(tileKey, new GLatLngBounds(sw, ne));
		},

		refresh : function() {
			var allLoaded = true;
			var tooMany = false;
			var items = [];
			var tileKeys = this.tileKeys;
			for (var i = tileKeys.length - 1; i >= 0; i--) {
				var tile = this.tiles[tileKeys[i].id];
				allLoaded = allLoaded && tile && tile.isLoaded();
				if (tile) {
					tooMany = tooMany || tile.tooMany;
					if (tooMany) {
						break;
					}
					if (allLoaded) {
						jQuery.merge(items, this.getVisibleItems(tile.items));
					}
				}
			}

			if (!allLoaded) {
				$(this).trigger("loading");
			}

			if (tooMany || allLoaded) {
				this.draw(items, tooMany);
			}
		},

		getVisibleItems : function(items) {
			var visible = [];
			var mapBounds = this.map.getBounds();
			for (var i = items.length - 1; i >= 0; i--) {
				var item = items[i];
				if (this.options.showItem(item) && mapBounds.contains(item.gLatLng)) {
					visible.push(item);
				}
			}

			return visible;
		},

		draw : function(items, tooMany) {
			$(this).trigger("loaded");
			if (tooMany) {
				this.removeCurrentLayer();
			} else {
				if (!arrayEquals(items, this.visibleItems)) {
					var overlay = this.createOverlay(items);
					this.addLayer(overlay);
					this.visibleItems = items;
					$(this).trigger("markerRefresh");
				}
			}

			if (tooMany && !this.tooMany) {
				$(this).trigger("tooManyResults");
			} else if (!tooMany && this.tooMany) {
				$(this).trigger("notTooManyResults");
			}

			if (!tooMany) {
				if (this.options.focus) {
					items.sort(function(a, b) {
						return a.distanceToFocus - b.distanceToFocus;
					});
				}
				$(this).trigger("drewResults", {items : items});
			}
			this.tooMany = tooMany;
		},

		createOverlay : function(items) {
			var clusterer = new MAPS.MarkerClusterer(items, this.map.getCurrentMapType().getProjection(), new GSize(0,0), false);
			var clusteredMarkers = clusterer.getClusteredMarkers(this.map.getZoom());

			return new MAPS.FastMarkerOverlay(clusteredMarkers, {
				createIconFunction : this.options.createIconFunction,
				alphaShadow : this.options.alphaShadow,
				alphaImage : this.options.alphaImage
			});
		},

		addLayer : function(overlay) {
			var oldLayer = this.layer;
			this.layer = {
				overlay : overlay,
				zoom : this.map.getZoom()
			};
			this.map.addOverlay(overlay);
			RIGHTMOVE.UTIL.forwardEvents(["markerMouseOver", "markerMouseOut", "markerClick", "markerSelectItem"], overlay, this);
			this.removeLayer(oldLayer);
		},

		removeCurrentLayer : function() {
			this.removeLayer(this.layer);
			this.layer = null;
			this.visibleItems = null;
		},

		removeLayer : function(layer) {
			if (layer) {
				this.map.removeOverlay(layer.overlay);
			}
		},

		selectItem : function(id) {
			if (this.layer) {
				this.layer.overlay.selectItem(id);
			}
		},

		highlight : function(marker) {
			if (this.layer) {
				return this.layer.overlay.highlight(marker);
			}
			return false;
		},

		unhighlight : function(marker) {
			if (this.layer) {
				return this.layer.overlay.unhighlight(marker);
			}
			return false;
		},

		highlightByItemId : function(itemId) {
			if (this.layer) {
				return this.layer.overlay.highlightByItemId(itemId);
			}
			return false;
		},

		unhighlightByItemId : function(itemId) {
			if (this.layer) {
				return this.layer.overlay.unhighlightByItemId(itemId);
			}
			return false;
		},

		getItemById : function(itemId) {
			return this.layer ? this.layer.overlay.getItemById(itemId): null;
		},

		getMarkerDataByItemId : function(itemId) {
			return this.layer ? this.layer.overlay.getMarkerDataByItemId(itemId): null;
		}
	});

	MAPS.TileOverlay = TileOverlay;
})();
(function() {
	var SEARCHRESULTS = RIGHTMOVE.namespace("RIGHTMOVE.MAPS.SEARCHRESULTS");

	var bind = RIGHTMOVE.bind;
	var getFormElements = RIGHTMOVE.UTIL.getFormElements;

	SEARCHRESULTS.CriteriaForm = function(typeAheadUrl) {
		this.typeAheadUrl = typeAheadUrl;
		$("#propertySearchCriteria").submit(bind(this, this.criteriaSubmit));
		$("a", "#directedsearch").live("click", bind(this, this.clickDirectedSearch));
		$("#down, #up, #newlisting").live("click", bind(this, this.clickSortBy));
	};

	SEARCHRESULTS.CriteriaForm.prototype = {
		submitLocation : function(location) {
			$("#locationIdentifier").val(location.locId);
			$("#useLocationIdentifier").val(true);
			$("#propertySearchCriteria").submit();
		},

		criteriaSubmit : function(event) {
			event.preventDefault();
			if($("#searchLocation").val() !== "") {
				$("#searchLocation").trigger("hideAutoComplete");
				$(this).trigger("submitSearchCriteria", {queryString : this.serialise()});
			}
		},

		clickDirectedSearch : function(event) {
			event.preventDefault();
			var directedUrl = $(event.target).attr("href");
			var newQS = directedUrl.substr(directedUrl.indexOf("?") + 1);
			$(this).trigger("submitSearchCriteria", {queryString : newQS});
		},

		clickSortBy : function(event) {
			event.preventDefault();
            if ($(event.target).attr("href").indexOf("sortByNewestListing=true") > 0){
                $("#sortByNewestListing").val($(event.target).attr("href").indexOf("sortByNewestListing=true") > 0);
                $(this).trigger("submitSearchCriteria", {queryString : this.serialise()});
            } else {
                $("#sortByPriceDescending").val($(event.target).attr("href").indexOf("sortByPriceDescending=true") > 0);
                $("#sortByNewestListing").val($(event.target).attr("href").indexOf("sortByNewestListing=true") > 0);
                $(this).trigger("submitSearchCriteria", {queryString : this.serialise()});
            }
		},

		serialise : function() {
			var params = [];
			jQuery.each($("#propertySearchCriteria").serializeArray(), function(i, elem) {
				if (jQuery.isArray(elem)) {
					elem.each(function(i, elem) {
						if (elem.value) { params.push(elem); }
					});
				} else {
					if (elem.value) { params.push(elem); }
				}
			});
			params.sort(function(a, b) {
				return a.name == b.name ?
					   a.value < b.value ? -1 : 1 :
					   a.name < b.name ? -1 : 1;

			});

			return jQuery.param(params);
		},

		set : function(searchParameters) {
			var parameters = {};
			var formFields = {};

			jQuery.each(searchParameters, function(i, param) {
				var values = parameters[param.name];
				if (!values) {
					values = [];
					parameters[param.name] = values;
				}
				values.push(param.value);
			});

			getFormElements($("#propertySearchCriteria")).each(function() {
				var name = this.name;
				var values = formFields[name];
				if (!values) {
					values = [];
					formFields[name] = values;
				}
				values.push(this);
			});

			jQuery.each(formFields, function(name, fields) {
				var newValues = parameters[name];
				if (newValues) {
					if (/radio|checkbox/i.test(fields[0].type)) {
						fields[0].checked = true;
						delete parameters[name];
					} else if (fields[0].type != "hidden" || (newValues.length == 1 && fields.length == 1)) {
						$(fields).val(decodeURIComponent(newValues[0].replace(/\+/g, "%20")));
						delete parameters[name];
					} else {
						// we will add them back as hidden fields in the next step
						$(fields).remove();
					}
				} else {
					if (!/_.*|previousSearchLocation|searchLocation|searchType|useLocationIdentifier|sortByPriceDescending/i.test(fields[0].name)) {
						if (/select/i.test(fields[0].nodeName)) {
							fields[0].selectedIndex = 0;
						} else if (/radio|checkbox/i.test(fields[0].type)) {
							fields[0].checked = false;
						} else if (/hidden/i.test(fields[0].type)) {
							if (/auction|houseFlatShare/.test(fields[0].name)) {
								$(fields).val("false");
							} else {
								$(fields).remove();
							}
 						} else {
							$(fields).val("");
						}
					}
				}
			});

			var fieldsToAdd = [];
			jQuery.each(parameters, function(name, values) {
				jQuery.each(values, function() {
					fieldsToAdd.push({name : name, value : this});
				});
			});
			this.addHiddenFields($("#directedhidden"), fieldsToAdd);
		},

		addHiddenFields : function(container, added) {
			jQuery.each(added, function() {
				container.append("<input type='hidden' name='" + this.name + "' value='" + this.value + "'/>");
			});
		},

		updateFormAndDirectedSearch : function(criteria, directedSearch) {
			var directedSearchElem = $("#directedsearch");
			if (directedSearchElem.length > 0) {
				directedSearchElem.replaceWith(directedSearch);
			} else {
				if($("#save-search-content")) {
					$("#save-search-content").after(directedSearch);
				} else {
					$("#criteriaresults").after(directedSearch);
				}
			}
			$("#dya-access").remove();
			$("#criteriaresults").replaceWith(criteria);
			$("#searchResultsInput").rightmoveautocomplete(this.typeAheadUrl, $('#propertySearchCriteria'));
			$("#propertySearchCriteria").addSearchLocationEvent();
			$("#propertySearchCriteria").submit(bind(this, this.criteriaSubmit));
		}
	};
})();
(function() {
	var SEARCHRESULTS = RIGHTMOVE.namespace("RIGHTMOVE.MAPS.SEARCHRESULTS");

	SEARCHRESULTS.mapController = function() {
		var mapModel;
		var mapView;

		var viewHandlers = {
			handleViewSummaryAdd : function(event, data) {
				mapModel.getSummary(data.clusterMarker, data.properties, data.scrollToAnchor);
			},

			handleViewMapMoved : function(event, data) {
				mapModel.mapMoved(data.bounds);
			},

			handleViewSearch : function(event, data) {
				mapModel.search(data.queryString);
			},

			handleViewSearchBounds : function(event, result) {
				mapModel.searchBounds(result.queryString);
			},

			handleViewSummaryRemove : function() {
				mapModel.removeSummary();
			},

			handleViewSummaryClicked : function(event, data) {
				mapModel.loadPropertyDetails(data.propertyId, data.href);
			},

			handleViewAddToShortlist : function(event, data) {
				mapModel.addToShortlist(data.propertyId, data.element);
			},

			handleViewLoginSuccess : function(event, data) {
				mapModel.addToShortlist(data.propertyId, data.element);
			},

			handleViewSetTitle : function(event, data) {
				mapModel.setTitle(data.title, data.saveToHistory);
			},

			handleViewMapTypeChanged : function(event, data) {
				mapModel.setMapType(data.mapType);
			}
		};

		var modelHandlers = {
			handleModelSearchEnd : function(event, data) {
				var results = data.searchResults.results;
				if (results.searchLocation) {
					mapView.updateSearchResults(data.searchResults, data.popupPropertyId, data.sameAsLast, data.saveToHistory, data.changeMapBounds, data.saveArea);
				} else {
					window.location.href = results.searchLocations.initialSearchUrl;
				}
			},

			handleModelGotSummary : function(event, data) {
				mapView.addSummaryContents(data);
			},

			handleModelSearchStart : function() {
				mapView.startSearch();
			},

			handleModelSearchFail : function() {
				mapView.searchFail();
			},

			handleModelEndParse : function(event, data) {
				mapView.setupView(data.bounds, data.searchParameters, data.popupPropertyId, data.mapType);
			},

			handleModelSavePropertyPostRegistration : function(event, data) {
				// Track register event
				var registerAction = RIGHTMOVE.UTIL.userPreferencePersister.getValue("registerAction");
				RIGHTMOVE.UTIL.analytics.trackEvent('registered', 'source', registerAction);
				
				mapView.showRegistrationMessage();
			},

			handleModelLoadPropertyDetails : function(event, data) {
				window.location.href = data.uri;
			},

			handleModelSaveArea : function(event, data) {
				mapView.saveArea();
			}
		};

		var attachHandlers = function(object, handlers) {
			var jQueryObject = $(object);
			jQuery.each(handlers, function(name, func) {
				var eventName = name.substr(6, 1).toLowerCase() + name.substr(7);
				jQueryObject.bind(eventName, func);
			});
		};

		var loadMap = function() {
			mapView = new SEARCHRESULTS.MapView(options);
			mapModel = new SEARCHRESULTS.MapModel(options);
			$(window).resize(function() {
				mapView.resize();
			});
			attachHandlers(mapView, viewHandlers);
			attachHandlers(mapModel, modelHandlers);

			mapModel.setupHistory();
			mapModel.parse(window.location.hash ? window.location.hash : window.location.search);
		};

		var init = function(opts) {
			// jslint doesn't like calling a function beginning with a capital letter that isn't a constructor
			var browserIsCompatible = GBrowserIsCompatible;
			options = opts;

			RIGHTMOVE.createHistory();

			if (browserIsCompatible()) {
				$(document).ready(loadMap);
				$(window).unload(GUnload);
			}
		};

		var redraw = function(locationPolygon) {
			if(mapView) {
				mapView.redraw(locationPolygon);
			}
		};

		return {
			init : init,
			redraw : redraw
		};
	}();
})();
(function() {
	var MAPS = RIGHTMOVE.namespace("RIGHTMOVE.MAPS");
	var SEARCHRESULTS = RIGHTMOVE.namespace("RIGHTMOVE.MAPS.SEARCHRESULTS");

	SEARCHRESULTS.MapModel = function(options) {
		this.reset();
		jQuery.extend(this, options);
		this.searcher = this.createSearcher();
		this.currentLocation = null;
	};

	SEARCHRESULTS.MapModel.prototype = {
		reset : function() {
			this.searchParameters = [];
			this.popupPropertyId = null;
			this.uri = null;
			this.lastResults = null;
			this.saveArea = null;
		},

		createSearcher : function() {
			return new SEARCHRESULTS.Searcher(
				this.maxResultsOnMap,
				this.maxResultsInSearch,
				this.searchUrl);
		},

		setupHistory : function() {
			dhtmlHistory.initialize(RIGHTMOVE.bind(this, this.parse));
		},

		setTitle : function(title, saveToHistory) {
			if (saveToHistory) {
				this.serializeToHistory(title);
			} else {
				var hash = RIGHTMOVE.UTIL.getHash(location.href);
				if (hash) {
					this.addHistoryEntry(decodeURIComponent(hash), title);
				}
			}
		},

		serializeToHistory : function(title) {
			this.addHistoryEntry(this.serialize(), title);
		},

		addHistoryEntry : function(hash, title) {
			var options = title ? {newTitle : title} : null;
			dhtmlHistory.add(hash, options);
		},

		parse : function(uri) {
			uri = RIGHTMOVE.UTIL.getHashOrQuery(uri);
			if (uri !== this.uri) {
				this.reset();
				this.uri = uri;
				var justRegistered;
				var params = RIGHTMOVE.UTIL.parseQueryString(uri);
				if (params) {
					jQuery.each(params, RIGHTMOVE.bind(this, function(i, param) {
						if (param.name === "box") {
							this.mapBounds = RIGHTMOVE.UTIL.stringToGLatLngBounds(param.value);
						} else if (param.name === "popupPropertyId") {
							this.popupPropertyId = param.value;
						} else if (param.name === "mapType") {
							this.mapType = param.value;
						} else if (param.name === "onetime_justRegistered") {
							justRegistered = param.value;
						} else if (param.name === "onetime_savearea") {
							this.saveArea = param.value;
						} else if (param.name.indexOf("onetime_") !== 0) {
							this.searchParameters.push(param);
						}
					}));
				}
				$(this).trigger("modelEndParse", {searchParameters : this.searchParameters, bounds : this.mapBounds, popupPropertyId : this.popupPropertyId, mapType : this.mapType});
				if(justRegistered && this.popupPropertyId) {
					SEARCHRESULTS.shortlist.addToShortlist(this.popupPropertyId, null, RIGHTMOVE.bind(this, function() {
						$(this).trigger("modelSavePropertyPostRegistration", {popupPropertyId : this.popupPropertyId});
					}), justRegistered);
				}
			}
		},

		setSearchParameters : function(queryString) {
			this.searchParameters = RIGHTMOVE.UTIL.parseQueryString(queryString);
		},

		setMapType : function(mapType) {
			this.mapType = mapType;
		},

		serialize : function() {
			var params = jQuery.map(this.searchParameters, function(param) {
				return param.name + "=" + encodeURIComponent(param.value);
			});
			params.push("box=" + RIGHTMOVE.UTIL.gLatLngBoundsToString(this.mapBounds));
			if (this.popupPropertyId) {
				params.push("popupPropertyId=" + this.popupPropertyId);
			}
			if (this.mapType) {
				params.push("mapType=" + this.mapType);
			}
			return params.join("&");
		},

		mapMoved : function(bounds) {
			this.mapBounds = bounds;
		},

		searchBounds : function(queryString) {
			this.runSearch(queryString, false, false);
		},

		getSearchBounds : function() {
			return this.currentLocation && this.mapBounds.containsBounds(this.currentLocation.gbounds) ?
				   null :
				   this.mapBounds;
		},

		search : function(queryString) {
			this.runSearch(queryString, !!this.mapBounds, true);
		},

		runSearch : function(queryString, saveToHistory, changeMapBounds) {
			$(this).trigger("modelSearchStart", [queryString]);
			this.setSearchParameters(queryString);
			this.searcher.getResults(
					queryString,
					this.getSearchBounds(),
					this.currentLocation,
					RIGHTMOVE.bind(this, function(searchResults) {
						this.currentLocation = searchResults.results.searchLocation;
						$(this).trigger("modelSearchEnd", {
							sameAsLast : this.lastResults === searchResults.results,
							searchResults : searchResults,
							popupPropertyId : this.popupPropertyId,
							saveToHistory : saveToHistory,
							changeMapBounds : changeMapBounds,
							saveArea : this.saveArea
						});
						this.saveArea = false;
						this.lastResults = searchResults.results;
					}),
					RIGHTMOVE.bind(this, function() {
						$(this).trigger("modelSearchFail");
					})
			);
		},

		getSummary : function(clusterMarker, properties, scrollToAnchor) {
			
			jQuery.ajax({
				type: "GET",
				data: {propertyId : jQuery.map(properties, function(property) {return property.id;})},
				dataType: "json",
				url: RIGHTMOVE.UTIL.encodeUri("/ajax/maps/property-summaries.html"),
				timeout: 60000,
				success: RIGHTMOVE.bind(this, function (summaries) {
					$(this).trigger("modelGotSummary", {
						clusterMarker : clusterMarker,
						properties: properties,
						summaries : summaries,
						scrollToAnchor : scrollToAnchor
					});
				})
			});
		},

		removeSummary : function() {
			this.popupPropertyId = null;
		},

		loadPropertyDetails : function(propertyId, href) {
			this.popupPropertyId = propertyId;
			// remove any current backListLink
			href = RIGHTMOVE.UTIL.removeParameter(href, "backListLink");

			var uri = href +
					  (href.indexOf("?") == -1 ? "?" : "&") +
					  "backListLink=" +
					  encodeURIComponent(window.location.pathname + this.removeOnetimeParams(window.location.search) + "#" + this.serialize()) +
					  "&fromMap=true";
			this.serializeToHistory();
			// Need a timeout here or IE doesn't register the history event properly
			setTimeout(RIGHTMOVE.bind(this, function() {
				$(this).trigger("modelLoadPropertyDetails", {uri : uri});
			}), 10);
		},

		addToShortlist : function(propertyId, summaryOverlay) {
			this.popupPropertyId = propertyId;

			var registerLinkSelector = "#createAccountLink";

			var eventObject = this;
			var postSaveCallback = function(data){
				if(data.justRegistered){
					$(eventObject).trigger("modelSavePropertyPostRegistration", {popupPropertyId : propertyId});
				}
			};

			SEARCHRESULTS.shortlist.addToShortlist(propertyId, summaryOverlay , postSaveCallback, false);
		},

		removeOnetimeParams : function(str) {
			return str.replace(/onetime_(.)*?=[^#&]*&?/g,'');
		}		
	};
})();
(function() {
	var SEARCHRESULTS = RIGHTMOVE.namespace("RIGHTMOVE.MAPS.SEARCHRESULTS");
	var USER = RIGHTMOVE.namespace("RIGHTMOVE.USER");
	var UTIL = RIGHTMOVE.namespace("RIGHTMOVE.UTIL");
	var DEFINEYOURAREA = RIGHTMOVE.namespace("RIGHTMOVE.DEFINEYOURAREA");
	var accountLightbox = USER.accountLightbox;

	var trackEventOnClick = UTIL.analytics.trackEventOnClick;
	var bind = RIGHTMOVE.bind;
	var primarycontent = $(".primarycontent");
	var secondarycontent = $(".secondarycontent");
	var mapcanvas = $("#mapcanvas");
	var greyoutmap = $("#greyoutmap");
	var PAGE_MIN_WIDTH = 980;
	var PAGE_MIN_HEIGHT = 545;

	SEARCHRESULTS.MapView = function(options) {
		this.options = options;
		
		this.resize();
		this.setupMap();
		this.messageHandler = new MessageHandler(this.map);
		this.criteriaForm = new SEARCHRESULTS.CriteriaForm(options.typeAheadUrl);
		this.locationPolygon = null;
		this.searchResultsOverlay = new SEARCHRESULTS.SearchResultsOverlay();
		this.map.addOverlay(this.searchResultsOverlay);
		this.bindViewEvents();
		this.scrollwheelTimeout = null;
		GEvent.addListener(this.map, "moveend", bind(this, function() {
			this.updateDrawASearchLink();
			$(this).trigger("viewMapMoved", {bounds : this.map.getBounds()});
			if (this.dontSearchOnNextMapMove) {
				this.dontSearchOnNextMapMove = false;
			} else {
				this.searchBounds();
			}
		}));
		GEvent.addListener(this.map, "maptypechanged", bind(this, function() {
			this.addLocationPolygon(this.currentLocation);
			$(this).trigger("viewMapTypeChanged", {mapType: this.map.getCurrentMapType().getName(true)});
		}));
		trackEventOnClick("#proplist", this.options.channel + "-search-results-map","features","list-of-properties");
		trackEventOnClick("#dyaboxheader", this.options.channel + "-search-results-map","features","draw-a-search-map-heading");
		trackEventOnClick("#dyaboxcreate", this.options.channel + "-search-results-map","features","draw-a-search-map-create");
		trackEventOnClick("#dyaboxedit", this.options.channel + "-search-results-map","features","draw-a-search-map-edit");
		$("#dyasavecurrent").live("click", RIGHTMOVE.bind(this, this.saveArea));
	};

	SEARCHRESULTS.MapView.prototype = {
		bindViewEvents : function() {
			$(this.searchResultsOverlay).bind("popupAdd", bind(this, function(event, data) {
				$(this).trigger("viewSummaryAdd", data);
			})).bind("popupRemove", bind(this, function(event, data) {
				$(this).trigger("viewSummaryRemove", data);
			})).bind("summaryClicked", bind(this, function(event, data) {
				$(this).trigger("viewSummaryClicked", data);
			})).bind("addToShortlist", bind(this, function(event, data) {
				$(this).trigger("viewAddToShortlist", {propertyId : data.propertyId, element : $(this.searchResultsOverlay)} );
			})).bind("loginSuccess", bind(this, function(event, data) {
				$(this).trigger("viewLoginSuccess", {propertyId : data.propertyId, element : $(this.searchResultsOverlay)} );
			}));

			$(this.criteriaForm).bind("submitSearchCriteria", bind(this, function(event, data) {
				this.removeSummary();
				var message = $("#savedConfirmationMessage");
				message.fadeOut("slow", bind(this, function() {
					message.remove();
					this.resize(true);
				}));
				$(this).trigger("viewSearch", {queryString : data.queryString});
			}));
		},

		search : function() {
			$(this).trigger("viewSearch", {queryString : this.criteriaForm.serialise()});
		},

		searchBounds : function() {
			$(this).trigger("viewSearchBounds", {queryString : this.criteriaForm.serialise()});
		},

		resize : function(force) {
			var windowSize = new GSize($(window).width(), $(window).height());
			if (force || !this.windowSize || !windowSize.equals(this.windowSize)) {
				var tooSmall = windowSize.width < PAGE_MIN_WIDTH || windowSize.height < PAGE_MIN_HEIGHT;
				if (this.map) {
					this.setScrollwheelTimeout(tooSmall ? this.map.disableScrollWheelZoom : this.map.enableScrollWheelZoom);
				}
				if (windowSize.height > 675) {
					primarycontent.css({width: null}).children().css({paddingLeft: null});
					secondarycontent.css({width: null, height: null, overflow: ""});
					UTIL.resizeToBottom($("#directedfilters"));
				} else {
					primarycontent.css({width: "70.8%"}).children().css({paddingLeft: 0});
					secondarycontent.css({width: "29.2%", overflow: "auto"});
					$("#directedfilters").css({height: null});
					UTIL.resizeToBottom(secondarycontent, PAGE_MIN_HEIGHT);
				}
				UTIL.resizeToBottom(mapcanvas, PAGE_MIN_HEIGHT, $("#mapfooter").height());
				greyoutmap.height(mapcanvas.height()).width(mapcanvas.width());
				if (this.map) {
					this.map.checkResize();
					this.windowSize = windowSize;
				}
			}
		},

		setScrollwheelTimeout : function(func) {
			if (this.map) {
				if (this.scrollwheelTimeout) {
					clearTimeout(this.scrollwheelTimeout);
				}
				this.scrollwheelTimeout = setTimeout(bind(this.map, func), 10);
			}
		},

		centreLocation : function(bounds) {
			var centre = bounds.getCenter();
			var zoomLevel = Math.min(this.map.getBoundsZoomLevel(bounds), 16);
			if (this.isNewMapView(centre, zoomLevel)) {
				// centring the map will move it and trigger a search
				this.map.setCenter(bounds.getCenter(), zoomLevel);
			} else {
				this.searchBounds();
			}
		},

		isNewMapView : function(centre, zoomLevel) {
			return !this.map.getCenter() || centre.distanceFrom(this.map.getCenter()) > 1 || zoomLevel !== this.map.getZoom();
		},

		addStandardControl : function(control, Constructor) {
			if (!control) {
				control = new Constructor();
				this.map.addControl(control);
			}

			return control;
		},

		removeStandardControl : function(control) {
			if (control) {
				this.map.removeControl(control);
			}

			return null;
		},

		setupMap : function() {
			this.map = new GMap2(mapcanvas[0]);
			this.map.setUIToDefault();
			this.map.enableScrollWheelZoom();
			var mapTypes = [];
			jQuery.each(this.map.getMapTypes(), function(i, mapType) {
				mapTypes[mapType.getName(true)] = mapType;
			});
			this.mapTypes = mapTypes;
		},

		setupView : function(bounds, searchParameters, popupPropertyId, mapType) {
			this.removeMarkers();
			if (!popupPropertyId) {
				this.removeSummary();
			}
			this.criteriaForm.set(searchParameters);
			if (bounds) {
				// If we recentre on the exact bounds that came from a previous map it will usually zoom out a level, so scale it back to 90%
				this.centreLocation(UTIL.scaleGLatLngBounds(bounds, 0.9));
				this.map.setMapType(this.mapTypes[mapType]);
			} else {
				// Once the search returns results, it will centre the map based on the search location
				// which will trigger a mapmove event. Avoid doing a new search on this map move as we will
				// already have the required results
				this.dontSearchOnNextMapMove = true;
				this.search();
			}
		},

		setLocation : function(location, changeMapBounds) {
			if (changeMapBounds) {
				this.centreLocation(location.gbounds);
			}
			this.addLocationPolygon(location);
			this.currentLocation = location;
		},

		isNewLocation : function(location) {
			return !UTIL.locationEquals(this.currentLocation, location);
		},

		addLocationPolygon : function(location) {
			if (location) {
				if (this.locationPolygon) {
					this.map.removeOverlay(this.locationPolygon);
				}
				if (location.polylines) {
					var colour = this.map.getCurrentMapType() == G_SATELLITE_MAP || this.map.getCurrentMapType() == G_HYBRID_MAP ?
									 "#0000cd" :
									 "#666666";
					var fillColour = this.map.getCurrentMapType() == G_SATELLITE_MAP || this.map.getCurrentMapType() == G_HYBRID_MAP ?
									 "#0000cd" :
									 "#3333ff";
					this.locationPolygon = UTIL.createGPolygonUsingEncodedPolylines({
						polylines : location.polylines,
						colour: colour,
						weight: 1,
						lineOpacity: 1,
						fillColour : fillColour,
						fillOpacity : 0.1
					});
					this.map.addOverlay(this.locationPolygon);
				}
			}
		},

		addSummaryContents : function(summaries) {
			this.searchResultsOverlay.addSummaries(summaries);
		},

		removeSummary : function() {
			this.searchResultsOverlay.removePopup();
		},

		updateMarkers : function(searchResults) {
			this.messageHandler.removeMainMessage();
			this.searchResultsOverlay.setMarkers(searchResults.results.mappedProperties);
			this.updateResultCount(searchResults);
		},

		removeMarkers : function() {
			this.searchResultsOverlay.removeMarkers();
		},

		simulateMarkerClick : function(propertyId) {
			this.searchResultsOverlay.simulateMarkerClick(propertyId);
		},

		updateSearchResults : function(searchResults, popupPropertyId, sameAsLast, saveToHistory, changeMapBounds, saveArea) {
			var location = searchResults.results.searchLocation;
			this.messageHandler.removeMainMessage();
			if (this.isNewLocation(location)) {
				this.setLocation(location, changeMapBounds);
			}
			this.updateResultsView(searchResults, sameAsLast);
			if (popupPropertyId) {
				this.simulateMarkerClick(popupPropertyId);
			}
			$(this).trigger("viewSetTitle", {title : searchResults.results.title, saveToHistory : saveToHistory});
			if (saveArea) {
				this.saveArea();
			}
		},

		updateResultsView : function(searchResults, sameAsLast) {
			var unboundedResults = searchResults.unboundedResults;
			var results = searchResults.results;
			if (!sameAsLast) {
				this.criteriaForm.updateFormAndDirectedSearch(unboundedResults.criteria, unboundedResults.directedSearch);
				$("#pageheader > h1").html(results.h1);
				var oldNumberOfProperties = $("#numberOfProperties").html();
				$("#resultsOptions").replaceWith(results.options);
				if (unboundedResults.resultCount !== 0 && unboundedResults.resultCount <= this.options.maxResultsInSearch) {
					$("#numberOfProperties").html(oldNumberOfProperties);
				}
				$("#save-search-content").replaceWith(results.savedSearch);
				this.updateDrawASearchLink();
				this.resize(true);
			}
			if (unboundedResults.resultCount === 0) {
				this.messageHandler.showNoResultsMessage();
				this.removeMarkers();
			} else if (unboundedResults.resultCount > this.options.maxResultsInSearch) {
				this.messageHandler.showTooManyResultsMessage();
				this.removeMarkers();
			} else if (results.resultCount > this.options.maxResultsOnMap) {
				this.messageHandler.showResultCountMessage(results.listViewUrl, false);
				this.updateMarkers(searchResults);
			} else {
				this.messageHandler.removeResultCountMessage();
				this.updateMarkers(searchResults);
			}
		},

		updateResultCount : function(searchResults) {
			var results = searchResults.results;
			var unboundedResults = searchResults.unboundedResults;
			var bounds = this.map.getBounds();
			var maxResultsOnMap = this.options.maxResultsOnMap;
			var resultsOnMap = 0;
			var mappedProperties = results.mappedProperties;
			for (var i = mappedProperties.length - 1; i >= 0; i--) {
				if (bounds.containsLatLng(mappedProperties[i].gLatLng)) {
					resultsOnMap++;
				}
			}

			var unmapped = 0;
			var unmappedProperties = results.unmappedProperties;
			if (unmappedProperties) {
				for (i = unmappedProperties.length - 1; i>= 0; i--) {
					if (bounds.containsLatLng(UTIL.createGLatLng(unmappedProperties[i].latLng))) {
						unmapped++;
					}
				}
			}

			// If the total mapped and unmapped is 300, we'll pretend that we are showing 300 results
			// as it looks strange to show a maximum of 299 properties when we've had to remove an unmapped property
			if (resultsOnMap + unmapped == maxResultsOnMap) {
				resultsOnMap = maxResultsOnMap;
			}

			var totalResults = unboundedResults.resultCount;
			var html = ["Showing <span id='resultcount'>"];

			if (resultsOnMap == maxResultsOnMap) {
				html.push("<a id='maxResults' href=''>");
				html.push(resultsOnMap);
				html.push("</a>");
			} else {
				html.push(resultsOnMap);
			}
			html.push(" of ");
			html.push(totalResults);
			html.push("</span> properties");
			if (unboundedResults.unmappedPropertyCount > 0) {
				html.push(" (<a id='unmapped' href=''>");
				html.push(unboundedResults.unmappedPropertyCount);
				html.push(" unmapped</a>)");
			}
			$("#numberOfProperties").html(html.join(""));
			$("#maxResults").click(bind(this, function(event) {
				event.preventDefault();
				this.messageHandler.showResultCountMessage(unboundedResults.listViewUrl, true);
			}));
			$("#unmapped").click(bind(this, function(event) {
				event.preventDefault();
				this.messageHandler.showUnmappedPropertyMessage(unboundedResults.unmappedPropertyCount);
			}));
		},

		startSearch : function() {
			this.messageHandler.showLoadingMessage();
		},

		searchFail : function() {
			this.messageHandler.showSearchFailureMessage();
		},

		showRegistrationMessage : function() {
			var message = "<div id='savedConfirmationMessage' class='tip successicon'>" +
						  "Thanks for creating an account, your property has been saved and you are now signed in.</div>";

			$("#resultsOptions").after(message);
		},

		updateDrawASearchLink : function() {
			if (this.options.drawASearch && this.currentLocation) {
				var dyalink = $(".dyaresultslink");
				if (dyalink.length > 0) {
					dyalink.attr("href", this.getDrawASearchLink(!DEFINEYOURAREA.isEditable(this.currentLocation)));
				}
				this.addDrawASearchBox();
			}
		},

		getDrawASearchLink : function(create) {
			var dyalink = $(".dyaresultslink");
			if (dyalink.length > 0) {
				var href = dyalink.attr("href");
				href = UTIL.removeParameter(href, "bounds");
				href = UTIL.removeParameter(href, "create");
				href = UTIL.removeParameter(href, "edit");
				if (create) {
					href += "&create=true&bounds=" + UTIL.gLatLngBoundsToString(this.map.getBounds());
				} else {
					href += "&edit=true";
				}
				return href;
			}
		},

		addDrawASearchBox : function() {
			var editable = DEFINEYOURAREA.isEditable(this.currentLocation);
			var saved = DEFINEYOURAREA.isSavedLocation(this.currentLocation);
			$("#dyaoptionbox").remove();
			var html = [];
			var createLink = this.getDrawASearchLink(true);
			var editLink = this.getDrawASearchLink(false);
			html.push("<div id='dyaoptionbox'><a id='dyaboxheader' class='dyaboxcreate' href='");
			html.push(editLink);
			html.push("'><h1></h1></a><ul>");
			html.push("<li><a id='dyaboxcreate' class='dyaboxcreate' href='");
			html.push(createLink);
			html.push("'>Create a new area</a>");
			if (editable || this.currentLocation.simplifiedPolylines) {
				html.push("<li><a id='dyaboxedit' href='");
				html.push(this.getDrawASearchLink(false));
				html.push("'>Edit this area</a>");
			}
			if (editable && !saved) {
				html.push("<li><a id='dyasavecurrent' href='#'>Save this area</a>");
			}
			html.push("</ul></div>");

			$("#mapcanvas").after(html.join(""));
			$("#dyaoptionbox h1").supersleight({shim : "/ps/images/maps/transparent.gif"});
			if (editable && !saved) {
				$("#dyaboxcreate").click(function(event) {
					var element = this;
					event.preventDefault();
					DEFINEYOURAREA.saver.showUnsavedChangesDialog(function() {
						window.location.href = $(element).attr("href");
					});
				});
			}
		},

		saveArea : function(event) {
			if (event) {
				event.preventDefault();
			}
			var polygon = UTIL.createGPolygonUsingEncodedPolylines({
				polylines : this.currentLocation.polylines
			});

			var name = DEFINEYOURAREA.isOverwriteable(this.currentLocation) ? DEFINEYOURAREA.removeNameSuffix(this.currentLocation.name) : null;
			DEFINEYOURAREA.saver.save(this.currentLocation.locId, polygon, name, $("#dyaresultslink").attr("href"), null, null, function(callback) {
				var object = {};
				var uri = window.location + "&onetime_savearea=true";

				$(accountLightbox).unbind("success");
				$(accountLightbox).bind("success", function() {
					callback();
				});

				accountLightbox.show({
					element : object,
					channel : UTIL.userPreferencePersister.getAnalyticsChannel(),
					causeAction : 'draw-a-search',
					targetURI : uri,
					showRegisterOnLoad : true
				});
			}, RIGHTMOVE.bind(this, function(data) {
				this.criteriaForm.submitLocation(data.location);
			}));
		}
	};

	var MessageHandler = function(map) {
		this.map = map;
		$('.messageClose').live("click", function() {
			$(this).closest(".message").fadeOut("slow", function() {
				$(this).remove();
			});
		});
	};

	MessageHandler.prototype = {
		removeAllMessages : function() {
			this.removeMainMessage();
			this.removeResultCountMessage();
		},

		removeMainMessage : function() {
			var mainMessage = $("#mainmessage");
			if (mainMessage.length > 0) {
				mainMessage.remove();
				greyoutmap.hide();
			}
		},

		removeResultCountMessage : function() {
			var resultCountMessage = $("#resultcountmessage");
			if (resultCountMessage.length > 0) {
				resultCountMessage.remove();
			}
		},

		showLoadingMessage : function() {
			this.showTopMessage("<p>Loading...</p>", false);
		},

		showMainMessage : function(message, position, closeable, greyout) {
			this.removeMainMessage();
			this.createMessage(message, position, closeable, "mainmessage");
			if (greyout) {
				greyoutmap.show();
			}
		},

		createMessage : function(message, position, closeable, id, cssClass) {
			cssClass = cssClass || "";
			greyoutmap.after([
				"<div id='",
				id,
				"' style='left:",
				position.width,
				"px; top:",
				position.height,
				"px;' class='message ",
				cssClass,
				"'>",
				message,
				closeable ? "<div class='messageClose'></div>" : "",
				"</div>"
			].join(""));
		},

		showTopMessage : function(message, greyout) {
			var pos = new GSize((this.map.getSize().width - 166) / 2, 10);
			this.showMainMessage(message, pos, false, greyout);
		},

		showCentreMessage : function(left, message, greyout) {
			var pos = new GSize(left, 100);
			this.showMainMessage(message, pos, false, greyout);
		},

		showNoResultsMessage : function() {
			this.removeResultCountMessage();
			this.showCentreMessage(175, "<h3>No properties match your search</h3> <ul><li>Broaden your area by expanding the search radius</li><li>Change your search criteria</li><li>Remove your filters</li></ul>", true);
		},

		showTooManyResultsMessage : function() {
			this.removeResultCountMessage();
			this.showCentreMessage(140, "<h3>More than 1000 properties found</h3><p>Please refine your search using the criteria and filters on the left</p>", true);
		},

		showSearchFailureMessage : function() {
			this.removeResultCountMessage();
			this.showCentreMessage(110, "<h3>Could not update results</h3><p>Please check that you are connected to the internet.</p><p>If the problem persists please <a href='" + UTIL.encodeUri("/rightmoveplc/rightmove-contacts.html") + "'>contact us</a>.</p>", false);
		},

		showResultCountMessage : function(listViewUrl, alwaysShow) {
			var shownInSession = jQuery.cookie("rmrcm");
			if (!shownInSession || alwaysShow) {
				var pos = new GSize(78, 5);
				this.removeResultCountMessage();
				this.createMessage(
						"<p>A <b>maximum of 300</b> properties can be displayed on the map. <br />You can refine your search, zoom in or go to <a href='" + listViewUrl + "'>list view</a> to see them all</p><span class='arrow'></span>",
						pos,
						true,
						"resultcountmessage",
						"resultcount");
				jQuery.cookie("rmrcm", "x");
			}
		},

		showUnmappedPropertyMessage : function(unmappedPropertyCount) {
			var pos = new GSize(78, 5);
			this.removeResultCountMessage();
			this.createMessage(
					"<p>The advertiser has chosen not to display " +
					(unmappedPropertyCount == 1 ? "this property" : "these properties") +
					" on the map.</p><span class='arrow'></span>",
					pos,
					true,
					"resultcountmessage",
					"resultcount");
		}
	};
})();
(function() {
	var SEARCHRESULTS = RIGHTMOVE.namespace("RIGHTMOVE.MAPS.SEARCHRESULTS");

	var MAX_PROPERTIES_PER_PAGE = 30;

	var Paginator = function(properties, propertyId) {
		this.properties = properties;
		var totalProperties = properties.length;
		if (totalProperties <= MAX_PROPERTIES_PER_PAGE) {
			this.currentPage = 1;
			this.pageCount = 1;
			this.pageProperties = properties;
		} else {
			this.pageCount = Math.ceil(totalProperties / MAX_PROPERTIES_PER_PAGE);
			this.currentPage = propertyId ?
						  this.pageForPropertyId(propertyId, properties, totalProperties) :
						  1;

			this.pageProperties = this.getPageProperties(this.currentPage, properties);
		}

		this.setPagingData();
	};

	Paginator.prototype = {
		pageForPropertyId : function(propertyId, properties, totalProperties) {
			var index = null;
			for (var i = 0; i < totalProperties; i++) {
				if (properties[i].id == propertyId) {
					index = i;
					break;
				}
			}

			return index ? Math.floor(index / MAX_PROPERTIES_PER_PAGE) + 1 : 1;
		},

		setPage : function(page) {
			this.currentPage = Math.min(page, this.pageCount);
			this.pageProperties = this.getPageProperties(this.currentPage, this.properties);
			this.setPagingData();
		},

		getPageProperties : function(page, properties) {
			var start = (page - 1) * MAX_PROPERTIES_PER_PAGE;
			var end = start + MAX_PROPERTIES_PER_PAGE;
			return properties.slice(start, end);
		},

		pagingHtml : function(page, pageCount) {
			if (pageCount == 1) {
				return "";
			}

			var html = ["<div id='popup-pagination' class='clearfix'><span>Pages:</span><ul>"];
			for (var i = 1; i <= pageCount; i++) {
				html.push("<li>");
				html.push(i == page ? "<a class='selected'>" : "<a href=''>");
				html.push(i);
				html.push("</a></li>");
			}
			html.push("</ul></div>");

			return html.join("");
		},

		setPagingData : function() {
			this.pagingData = {
				page : this.currentPage,
				properties : this.pageProperties,
				pagingHtml : this.pagingHtml(this.currentPage, this.pageCount)
			};
		}
	};

	SEARCHRESULTS.Paginator = Paginator;
})();
(function() {
	var MAPS = RIGHTMOVE.namespace("RIGHTMOVE.MAPS");
	var SEARCHRESULTS = RIGHTMOVE.namespace("RIGHTMOVE.MAPS.SEARCHRESULTS");

	var PropertyPopup = function(popupData) {
		this.markerData = popupData.markerData;
		this.scrollToAnchor = popupData.selectId ? "#propertysummary-" + popupData.selectId : null;
		this.selectId = popupData.selectId;
	};

	PropertyPopup.prototype = new MAPS.Popup();

	jQuery.extend(PropertyPopup.prototype, {
		createContainer : function() {
			var properties = this.markerData.items;
			this.paginator = new SEARCHRESULTS.Paginator(properties, this.selectId);
			var propertyCount = properties.length;
			var div = $("<div id='map-popup' class='map-popup'>");
			div.append("<a id='popupClose' class='popupClose'></a>");
			if (propertyCount > 1) {
				div.addClass('moreThanOne');
			}
			div.append("<h3>" + (propertyCount == 1 ? "1 property " : propertyCount +" properties") + "</h3>");
			div.append(this.paginator.pagingData.pagingHtml);
			div.append("<div id='properties'></div>");
			div.mousedown(function(event) {event.stopPropagation();});
			div.dblclick(function(event) {event.stopPropagation();});

			return div;
		},

		setPage : function(page) {
			this.scrollToAnchor = null;
			this.paginator.setPage(page);
			this.setLoading();
			$("#popup-pagination").replaceWith(this.paginator.pagingData.pagingHtml);
		},

		popupData : function() {
			var pagingData = this.paginator.pagingData;
			return {
				markerData : this.markerData,
				properties : pagingData.properties,
				page : pagingData.page,
				scrollToAnchor : this.scrollToAnchor
			};
		},

		popupEvents : ["summaryClicked"],

		scrollContainerSelector : "#properties",

		addSummaries : function(data) {
			$("#properties").html(data.summaries.join(""));
			if(this.scrollToAnchor) {
				this.scrollTo(this.scrollToAnchor);
			}
			$("a.photo, a[id^=standardPropertySummary]").bind("contextmenu", function(event) {
				event.stopPropagation();
			}).click(RIGHTMOVE.bind(this, function(event) {
				if (!event.ctrlKey && !event.altKey && !event.shiftKey && !event.metaKey) {
					event.preventDefault();
					var propertyId = $(event.target).closest("li[id]").attr("id").substr(7); // id is summary12356436
					$(this).trigger("summaryClicked", {propertyId : propertyId, href : $(event.target).closest("a").attr("href")});
				}
			}));
		},

		popupAnchorOffsets : {
			left : 11, right : -12, top : -25, bottom : -4
		},

		popupSpaceBuffer : new GSize(23, 5)
	});

	SEARCHRESULTS.PropertyPopup = PropertyPopup;
})();
(function() {
	var MAPS = RIGHTMOVE.namespace("RIGHTMOVE.MAPS");
	var SEARCHRESULTS = RIGHTMOVE.namespace("RIGHTMOVE.MAPS.SEARCHRESULTS");

	var SearchResults = function(queryString, maxResultsOnMap, maxResultsInSearch) {
		this.queryString = queryString;
		this.maxResultsOnMap = maxResultsOnMap;
		this.maxResultsInSearch = maxResultsInSearch;
		this.unboundedResults = null;
		this.boundedResultsMap = {};
	};

	SearchResults.prototype = {
		addResults : function(results, bounds) {
			if (bounds) {
				this.boundedResultsMap[RIGHTMOVE.UTIL.gLatLngBoundsToString(bounds)] = {bounds : bounds, results : results};
			} else {
				this.unboundedResults = results;
			}
		},

		getResults : function(bounds) {
			if (!this.unboundedResults) {
				return null;
			} else if (bounds && this.tooManyResults(this.unboundedResults) && !this.farTooManyResults(this.unboundedResults)) {
				return this.getBoundsMatchResults(bounds);
			} else {
				return this.createResults();
			}
		},

		getBoundsMatchResults : function(bounds) {
			var exactMatch = this.boundedResultsMap[RIGHTMOVE.UTIL.gLatLngBoundsToString(bounds)];

			if (exactMatch) {
				return this.createResults(exactMatch.results, exactMatch.bounds);
			}

			return this.getBestBoundsMatchResults(bounds);
		},

		getBestBoundsMatchResults : function(bounds) {
			for (var i in this.boundedResultsMap) {
				if (this.boundedResultsMap.hasOwnProperty(i)) {
					var boundedResults = this.boundedResultsMap[i];
					if (boundedResults.bounds.containsBounds(bounds) && !this.tooManyResults(boundedResults.results)) {
						return this.createResults(boundedResults.results, boundedResults.bounds);
					}
				}
			}

			return null;
		},

		createResults : function(boundedResults, bounds) {
			return {
				unboundedResults : this.unboundedResults,
				results : boundedResults ? boundedResults : this.unboundedResults,
				bounds : bounds
			};
		},

		tooManyResults : function(results) {
			return results.resultCount > this.maxResultsOnMap;
		},

		farTooManyResults : function(results) {
			return results.resultCount > this.maxResultsInSearch;
		}
	};

	SEARCHRESULTS.Searcher = function(maxResultsOnMap, maxResultsInSearch, searchUriBase) {
		this.maxResultsOnMap = maxResultsOnMap;
		this.maxResultsInSearch = maxResultsInSearch;
		this.searchUriBase = searchUriBase;
		this.searchResults = null;
		this.searchXhr = null;
	};

	SEARCHRESULTS.Searcher.prototype = {
		searchLoaded : function(queryString) {
			return this.searchResults && this.searchResults.queryString === queryString;
		},

		getResults : function(queryString, bounds, currentLocation, successCallback, errorCallback) {
			this.abortSearch();
			queryString = this.cleanQueryString(queryString);
			if (!this.searchLoaded(queryString)) {
				this.searchResults = new SearchResults(queryString, this.maxResultsOnMap, this.maxResultsInSearch);
			}

			this.returnResults(bounds, currentLocation, successCallback, errorCallback);
		},

		search : function(bounds, currentLocation, successCallback, errorCallback) {
			// Always do an unbounded search first as there may be less then 300 results which means
			// we have all the results and don't need a bounded search
			var searchBounds = this.searchResults.unboundedResults ? bounds : null;
			this.searchXhr = jQuery.ajax({
				type: "GET",
				dataType: "json",
				url: this.getSearchUri(this.searchUriBase, searchBounds),
				timeout: 30000,
				success: RIGHTMOVE.bind(this, function(json) {
					this.searchXhr = null;
					var searchLocation = json.searchLocation;
					if (searchLocation) {
						searchLocation.gbounds = RIGHTMOVE.UTIL.createGLatLngBounds(searchLocation.bounds);
					}

					if (json.mappedProperties) {
						jQuery.each(json.mappedProperties, function(i, result) {
							result.gLatLng = RIGHTMOVE.UTIL.createGLatLng(result.latLng);
							result.sort = i;
						});
					}

					this.searchResults.addResults(json, searchBounds);

					// if the search has returned a new location there's no need to do a bounded search as the map
					// will be zoomed out to show the full results.
					var getBoundedResults = this.getBoundedResults(currentLocation, searchLocation);

					// if we don't pass a bounds returnResults will return the unbounded results even if there are too many results
					this.returnResults(getBoundedResults ? bounds : null, currentLocation, successCallback, errorCallback);
				}),
				error: errorCallback
			});
		},

		getBoundedResults : function(currentLocation, newLocation) {
			return currentLocation === null || RIGHTMOVE.UTIL.locationEquals(currentLocation, newLocation);
		},

		returnResults : function(bounds, currentLocation, successCallback, errorCallback) {
			var results = this.searchResults.getResults(bounds);

			if (results) {
				successCallback(results);
			} else {
				this.search(bounds, currentLocation, successCallback, errorCallback);
			}
		},

		getSearchUri : function(uriBase, bounds) {
			return RIGHTMOVE.UTIL.encodeUri([
					uriBase, "?", this.searchResults.queryString, this.getBoundsQueryString(bounds)
			].join(""));
		},

		getBoundsQueryString : function(bounds) {
			return bounds ? "&box=" + RIGHTMOVE.UTIL.gLatLngBoundsToString(bounds) : "";
		},

		abortSearch : function() {
			if (this.searchXhr) {
				this.searchXhr.abort();
				this.searchXhr = null;
			}
		},

		cleanQueryString : function(queryString) {
			// if useLocationIdentifier is true, we should remove previousSearchLocation from the URL as it
			// won't be relevant and if its changed we'll kick off another search

			if (queryString.indexOf("useLocationIdentifier=true") > 0) {
				queryString = this.removeFromQueryString(queryString, "previousSearchLocation");
			}

			queryString = this.removeFromQueryString(queryString, "insId");

			return queryString;
		},

		removeFromQueryString : function(queryString, param) {
			var parts = new RegExp("((.*)&)?" + param + "=[^&]*(&?.*)").exec(queryString);
			if (parts) {
				return parts[2] + parts[3];
			}
			return queryString;
		}
	};
})();
(function() {
	var MAPS = RIGHTMOVE.namespace("RIGHTMOVE.MAPS");
	var SEARCHRESULTS = RIGHTMOVE.namespace("RIGHTMOVE.MAPS.SEARCHRESULTS");

	var createIcon = function() {
		var icon = new GIcon(G_DEFAULT_ICON);
		jQuery.extend(icon, {
			image : "/ps/images/maps/icons/rmpin.png",
			highlightImage : "/ps/images/maps/icons/rmpin-green.png",
			shadow : "/ps/images/maps/icons/rmshadow.png",
			shadowSize : new GSize(34, 25),
			iconSize : new GSize(21, 25),
			iconAnchor : new GPoint(10, 24)
		});
		return icon;
	};

	var SearchResultsOverlay = function() {
		this.popupListener = null;

		$("a[id^=link-addtoshortlist]").live("click", RIGHTMOVE.bind(this, function(event) {
			var propertyId = $(event.target).closest("li[id]").attr("id").substr(7); // id is summary12356436
			this.fixPopup();
			$(this).trigger("addToShortlist", {propertyId : propertyId});
		}));
		$('#popup-pagination ul li a').live("click", RIGHTMOVE.bind(this, function(event) {
			this.fixPopup();
			event.preventDefault();
			this.popupListener.popup.setPage($(event.target).html());
			$(this).trigger("popupAdd", this.popupListener.popup.popupData());
		}));
	};

	var clusteredOverlay = new MAPS.ClusteredOverlay();
	clusteredOverlay.setMarkerIcon(createIcon());

	SearchResultsOverlay.prototype = clusteredOverlay;

	jQuery.extend(SearchResultsOverlay.prototype, {
		onInitialize : function() {
			GEvent.addListener(this.map, "zoomend", RIGHTMOVE.bind(this, this.removeMarkerLayer));
		},

		redraw : function() {
			// do nothing as the mapview may want to add different markers
		},

		onRemoveMarkerLayer : function() {
			$(this.popupListener).unbind(".markerView");
			this.popupListener.destroy();
			this.popupListener = null;
		},

		onAddMarkerLayer : function() {
			this.popupListener = new MAPS.PopupListener(this.map, this.markerOverlay, {
				createPopupFunction : function(popupData) {
					return new SEARCHRESULTS.PropertyPopup(popupData);
				},
				scrollWheelEnabled : true
			});
			RIGHTMOVE.UTIL.forwardEvents(["popupRemove", "popupAdd", "summaryClicked"], this.popupListener, this, ".markerView");
		},

		fixPopup : function() {
			if (this.popupListener) {
				this.popupListener.fixPopup();
			}
		},

		removePopup : function() {
			if (this.popupListener) {
				this.popupListener.remove();
			}
		},

		addSummaries : function(data) {
			if (this.popupListener && this.popupListener.popup) {
				this.popupListener.popup.addSummaries(data);
			}
		}
	});

	SEARCHRESULTS.SearchResultsOverlay = SearchResultsOverlay;
})();
(function() {
	var SEARCHRESULTS = RIGHTMOVE.namespace("RIGHTMOVE.MAPS.SEARCHRESULTS");
	var USER = RIGHTMOVE.namespace("RIGHTMOVE.USER");
	var UTIL = RIGHTMOVE.namespace("RIGHTMOVE.UTIL");
	var accountLightbox = USER.accountLightbox;

	SEARCHRESULTS.shortlist = function() {
		var addToShortlist = function(propertyId, summaryOverlay, postSaveCallback, justRegistered) {

			jQuery.ajax({
				type: "GET",
				data: {propertyId : propertyId,
					from : window.location.href},
				dataType: "json",
				url: "/ajax/maps/addtoshortlist.html",
				timeout: 60000,
				success: function(data) {
					if (data.propertyId) {
						updatePropertySaved(data.propertyId);

						data.justRegistered = justRegistered;
						if (postSaveCallback) {
							postSaveCallback(data);
						}
					}
					else {
						handleUserNotLoggedIn(propertyId, summaryOverlay, postSaveCallback);
					}

					$("#addtoshortlist-progress").remove();
				},
				error : function() {
					$("#addtoshortlist-progress").remove();
				}
			});
		};

		var handleUserNotLoggedIn = function(propertyId, summaryOverlay, postSaveCallback){
			$(accountLightbox).unbind("success");
			$(accountLightbox).bind("success", function(event, data){
				addToShortlist(propertyId, summaryOverlay, postSaveCallback, data.justRegistered);
			});

			accountLightbox.show({
				element : summaryOverlay,
				channel : UTIL.userPreferencePersister.getAnalyticsChannel(),
				causeAction : 'save-property',
				showRegisterOnLoad : true
			});
		};

		var updatePropertySaved = function (propertyId){
			$("#link-addtoshortlist-" + propertyId).replaceWith("<span class='saved'>Property saved</span>");
		};

		return {
			addToShortlist : addToShortlist
		};
	}();
})();
jQuery.fn.premiumDisplayImageViewer = function() {
	var $premiumDisplaySwapablePhoto = this.find('.largephoto');
	var $viewport = this.find('.viewport');

		function swapPhoto(event) {

			var xcoord = event.originalEvent.layerX || event.originalEvent.x;
			var marginOffset;

			if (xcoord > 5 && xcoord < 82) {
				marginOffset = -160;
			}
			else if (xcoord > 82 && xcoord < 164) {
				marginOffset = -320;
			}
			else {
				return false;
			}

			$premiumDisplaySwapablePhoto.attr('style', 'margin-left: ' + marginOffset + 'px');

			return false;
		}

		$viewport.mousemove(swapPhoto);
		$viewport.mouseout(function(){
			$premiumDisplaySwapablePhoto.attr('style', 'margin-left: 0');
		});

	return this;
};
/*!
 * jQuery UI 1.8.2
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI
 */

(function($) {

// prevent duplicate loading
// this is only a problem because we proxy existing functions
// and we don't want to double proxy them
$.ui = $.ui || {};
if ($.ui.version) {
	return;
}

//Helper functions and ui object
$.extend($.ui, {
	version: "1.8.2",

	// $.ui.plugin is deprecated.  Use the proxy pattern instead.
	plugin: {
		add: function(module, option, set) {
			var proto = $.ui[module].prototype;
			for(var i in set) {
				proto.plugins[i] = proto.plugins[i] || [];
				proto.plugins[i].push([option, set[i]]);
			}
		},
		call: function(instance, name, args) {
			var set = instance.plugins[name];
			if(!set || !instance.element[0].parentNode) { return; }

			for (var i = 0; i < set.length; i++) {
				if (instance.options[set[i][0]]) {
					set[i][1].apply(instance.element, args);
				}
			}
		}
	},

	contains: function(a, b) {
		return document.compareDocumentPosition
			? a.compareDocumentPosition(b) & 16
			: a !== b && a.contains(b);
	},

	hasScroll: function(el, a) {

		//If overflow is hidden, the element might have extra content, but the user wants to hide it
		if ($(el).css('overflow') == 'hidden') { return false; }

		var scroll = (a && a == 'left') ? 'scrollLeft' : 'scrollTop',
			has = false;

		if (el[scroll] > 0) { return true; }

		// TODO: determine which cases actually cause this to happen
		// if the element doesn't have the scroll set, see if it's possible to
		// set the scroll
		el[scroll] = 1;
		has = (el[scroll] > 0);
		el[scroll] = 0;
		return has;
	},

	isOverAxis: function(x, reference, size) {
		//Determines when x coordinate is over "b" element axis
		return (x > reference) && (x < (reference + size));
	},

	isOver: function(y, x, top, left, height, width) {
		//Determines when x, y coordinates is over "b" element
		return $.ui.isOverAxis(y, top, height) && $.ui.isOverAxis(x, left, width);
	},

	keyCode: {
		ALT: 18,
		BACKSPACE: 8,
		CAPS_LOCK: 20,
		COMMA: 188,
		COMMAND: 91,
		COMMAND_LEFT: 91, // COMMAND
		COMMAND_RIGHT: 93,
		CONTROL: 17,
		DELETE: 46,
		DOWN: 40,
		END: 35,
		ENTER: 13,
		ESCAPE: 27,
		HOME: 36,
		INSERT: 45,
		LEFT: 37,
		MENU: 93, // COMMAND_RIGHT
		NUMPAD_ADD: 107,
		NUMPAD_DECIMAL: 110,
		NUMPAD_DIVIDE: 111,
		NUMPAD_ENTER: 108,
		NUMPAD_MULTIPLY: 106,
		NUMPAD_SUBTRACT: 109,
		PAGE_DOWN: 34,
		PAGE_UP: 33,
		PERIOD: 190,
		RIGHT: 39,
		SHIFT: 16,
		SPACE: 32,
		TAB: 9,
		UP: 38,
		WINDOWS: 91 // COMMAND
	}
});

//jQuery plugins
$.fn.extend({
	_focus: $.fn.focus,
	focus: function(delay, fn) {
		return typeof delay === 'number'
			? this.each(function() {
				var elem = this;
				setTimeout(function() {
					$(elem).focus();
					(fn && fn.call(elem));
				}, delay);
			})
			: this._focus.apply(this, arguments);
	},
	
	enableSelection: function() {
		return this
			.attr('unselectable', 'off')
			.css('MozUserSelect', '');
	},

	disableSelection: function() {
		return this
			.attr('unselectable', 'on')
			.css('MozUserSelect', 'none');
	},

	scrollParent: function() {
		var scrollParent;
		if(($.browser.msie && (/(static|relative)/).test(this.css('position'))) || (/absolute/).test(this.css('position'))) {
			scrollParent = this.parents().filter(function() {
				return (/(relative|absolute|fixed)/).test($.curCSS(this,'position',1)) && (/(auto|scroll)/).test($.curCSS(this,'overflow',1)+$.curCSS(this,'overflow-y',1)+$.curCSS(this,'overflow-x',1));
			}).eq(0);
		} else {
			scrollParent = this.parents().filter(function() {
				return (/(auto|scroll)/).test($.curCSS(this,'overflow',1)+$.curCSS(this,'overflow-y',1)+$.curCSS(this,'overflow-x',1));
			}).eq(0);
		}

		return (/fixed/).test(this.css('position')) || !scrollParent.length ? $(document) : scrollParent;
	},

	zIndex: function(zIndex) {
		if (zIndex !== undefined) {
			return this.css('zIndex', zIndex);
		}
		
		if (this.length) {
			var elem = $(this[0]), position, value;
			while (elem.length && elem[0] !== document) {
				// Ignore z-index if position is set to a value where z-index is ignored by the browser
				// This makes behavior of this function consistent across browsers
				// WebKit always returns auto if the element is positioned
				position = elem.css('position');
				if (position == 'absolute' || position == 'relative' || position == 'fixed')
				{
					// IE returns 0 when zIndex is not specified
					// other browsers return a string
					// we ignore the case of nested elements with an explicit value of 0
					// <div style="z-index: -10;"><div style="z-index: 0;"></div></div>
					value = parseInt(elem.css('zIndex'));
					if (!isNaN(value) && value != 0) {
						return value;
					}
				}
				elem = elem.parent();
			}
		}

		return 0;
	}
});


//Additional selectors
$.extend($.expr[':'], {
	data: function(elem, i, match) {
		return !!$.data(elem, match[3]);
	},

	focusable: function(element) {
		var nodeName = element.nodeName.toLowerCase(),
			tabIndex = $.attr(element, 'tabindex');
		return (/input|select|textarea|button|object/.test(nodeName)
			? !element.disabled
			: 'a' == nodeName || 'area' == nodeName
				? element.href || !isNaN(tabIndex)
				: !isNaN(tabIndex))
			// the element and all of its ancestors must be visible
			// the browser may report that the area is hidden
			&& !$(element)['area' == nodeName ? 'parents' : 'closest'](':hidden').length;
	},

	tabbable: function(element) {
		var tabIndex = $.attr(element, 'tabindex');
		return (isNaN(tabIndex) || tabIndex >= 0) && $(element).is(':focusable');
	}
});

})(jQuery);
/*!
 * jQuery UI Widget 1.8.2
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Widget
 */
(function( $ ) {

var _remove = $.fn.remove;

$.fn.remove = function( selector, keepData ) {
	return this.each(function() {
		if ( !keepData ) {
			if ( !selector || $.filter( selector, [ this ] ).length ) {
				$( "*", this ).add( this ).each(function() {
					$( this ).triggerHandler( "remove" );
				});
			}
		}
		return _remove.call( $(this), selector, keepData );
	});
};

$.widget = function( name, base, prototype ) {
	var namespace = name.split( "." )[ 0 ],
		fullName;
	name = name.split( "." )[ 1 ];
	fullName = namespace + "-" + name;

	if ( !prototype ) {
		prototype = base;
		base = $.Widget;
	}

	// create selector for plugin
	$.expr[ ":" ][ fullName ] = function( elem ) {
		return !!$.data( elem, name );
	};

	$[ namespace ] = $[ namespace ] || {};
	$[ namespace ][ name ] = function( options, element ) {
		// allow instantiation without initializing for simple inheritance
		if ( arguments.length ) {
			this._createWidget( options, element );
		}
	};

	var basePrototype = new base();
	// we need to make the options hash a property directly on the new instance
	// otherwise we'll modify the options hash on the prototype that we're
	// inheriting from
//	$.each( basePrototype, function( key, val ) {
//		if ( $.isPlainObject(val) ) {
//			basePrototype[ key ] = $.extend( {}, val );
//		}
//	});
	basePrototype.options = $.extend( {}, basePrototype.options );
	$[ namespace ][ name ].prototype = $.extend( true, basePrototype, {
		namespace: namespace,
		widgetName: name,
		widgetEventPrefix: $[ namespace ][ name ].prototype.widgetEventPrefix || name,
		widgetBaseClass: fullName
	}, prototype );

	$.widget.bridge( name, $[ namespace ][ name ] );
};

$.widget.bridge = function( name, object ) {
	$.fn[ name ] = function( options ) {
		var isMethodCall = typeof options === "string",
			args = Array.prototype.slice.call( arguments, 1 ),
			returnValue = this;

		// allow multiple hashes to be passed on init
		options = !isMethodCall && args.length ?
			$.extend.apply( null, [ true, options ].concat(args) ) :
			options;

		// prevent calls to internal methods
		if ( isMethodCall && options.substring( 0, 1 ) === "_" ) {
			return returnValue;
		}

		if ( isMethodCall ) {
			this.each(function() {
				var instance = $.data( this, name ),
					methodValue = instance && $.isFunction( instance[options] ) ?
						instance[ options ].apply( instance, args ) :
						instance;
				if ( methodValue !== instance && methodValue !== undefined ) {
					returnValue = methodValue;
					return false;
				}
			});
		} else {
			this.each(function() {
				var instance = $.data( this, name );
				if ( instance ) {
					if ( options ) {
						instance.option( options );
					}
					instance._init();
				} else {
					$.data( this, name, new object( options, this ) );
				}
			});
		}

		return returnValue;
	};
};

$.Widget = function( options, element ) {
	// allow instantiation without initializing for simple inheritance
	if ( arguments.length ) {
		this._createWidget( options, element );
	}
};

$.Widget.prototype = {
	widgetName: "widget",
	widgetEventPrefix: "",
	options: {
		disabled: false
	},
	_createWidget: function( options, element ) {
		// $.widget.bridge stores the plugin instance, but we do it anyway
		// so that it's stored even before the _create function runs
		this.element = $( element ).data( this.widgetName, this );
		this.options = $.extend( true, {},
			this.options,
			$.metadata && $.metadata.get( element )[ this.widgetName ],
			options );

		var self = this;
		this.element.bind( "remove." + this.widgetName, function() {
			self.destroy();
		});

		this._create();
		this._init();
	},
	_create: function() {},
	_init: function() {},

	destroy: function() {
		this.element
			.unbind( "." + this.widgetName )
			.removeData( this.widgetName );
		this.widget()
			.unbind( "." + this.widgetName )
			.removeAttr( "aria-disabled" )
			.removeClass(
				this.widgetBaseClass + "-disabled " +
				"ui-state-disabled" );
	},

	widget: function() {
		return this.element;
	},

	option: function( key, value ) {
		var options = key,
			self = this;

		if ( arguments.length === 0 ) {
			// don't return a reference to the internal hash
			return $.extend( {}, self.options );
		}

		if  (typeof key === "string" ) {
			if ( value === undefined ) {
				return this.options[ key ];
			}
			options = {};
			options[ key ] = value;
		}

		$.each( options, function( key, value ) {
			self._setOption( key, value );
		});

		return self;
	},
	_setOption: function( key, value ) {
		this.options[ key ] = value;

		if ( key === "disabled" ) {
			this.widget()
				[ value ? "addClass" : "removeClass"](
					this.widgetBaseClass + "-disabled" + " " +
					"ui-state-disabled" )
				.attr( "aria-disabled", value );
		}

		return this;
	},

	enable: function() {
		return this._setOption( "disabled", false );
	},
	disable: function() {
		return this._setOption( "disabled", true );
	},

	_trigger: function( type, event, data ) {
		var callback = this.options[ type ];

		event = $.Event( event );
		event.type = ( type === this.widgetEventPrefix ?
			type :
			this.widgetEventPrefix + type ).toLowerCase();
		data = data || {};

		// copy original event properties over to the new event
		// this would happen if we could call $.event.fix instead of $.Event
		// but we don't have a way to force an event to be fixed multiple times
		if ( event.originalEvent ) {
			for ( var i = $.event.props.length, prop; i; ) {
				prop = $.event.props[ --i ];
				event[ prop ] = event.originalEvent[ prop ];
			}
		}

		this.element.trigger( event, data );

		return !( $.isFunction(callback) &&
			callback.call( this.element[0], event, data ) === false ||
			event.isDefaultPrevented() );
	}
};

})( jQuery );
/*!
 * jQuery UI Mouse 1.8.2
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Mouse
 *
 * Depends:
 *	jquery.ui.widget.js
 */
(function($) {

$.widget("ui.mouse", {
	options: {
		cancel: ':input,option',
		distance: 1,
		delay: 0
	},
	_mouseInit: function() {
		var self = this;

		this.element
			.bind('mousedown.'+this.widgetName, function(event) {
				return self._mouseDown(event);
			})
			.bind('click.'+this.widgetName, function(event) {
				if(self._preventClickEvent) {
					self._preventClickEvent = false;
					event.stopImmediatePropagation();
					return false;
				}
			});

		this.started = false;
	},

	// TODO: make sure destroying one instance of mouse doesn't mess with
	// other instances of mouse
	_mouseDestroy: function() {
		this.element.unbind('.'+this.widgetName);
	},

	_mouseDown: function(event) {
		// don't let more than one widget handle mouseStart
		// TODO: figure out why we have to use originalEvent
		event.originalEvent = event.originalEvent || {};
		if (event.originalEvent.mouseHandled) { return; }

		// we may have missed mouseup (out of window)
		(this._mouseStarted && this._mouseUp(event));

		this._mouseDownEvent = event;

		var self = this,
			btnIsLeft = (event.which == 1),
			elIsCancel = (typeof this.options.cancel == "string" ? $(event.target).parents().add(event.target).filter(this.options.cancel).length : false);
		if (!btnIsLeft || elIsCancel || !this._mouseCapture(event)) {
			return true;
		}

		this.mouseDelayMet = !this.options.delay;
		if (!this.mouseDelayMet) {
			this._mouseDelayTimer = setTimeout(function() {
				self.mouseDelayMet = true;
			}, this.options.delay);
		}

		if (this._mouseDistanceMet(event) && this._mouseDelayMet(event)) {
			this._mouseStarted = (this._mouseStart(event) !== false);
			if (!this._mouseStarted) {
				event.preventDefault();
				return true;
			}
		}

		// these delegates are required to keep context
		this._mouseMoveDelegate = function(event) {
			return self._mouseMove(event);
		};
		this._mouseUpDelegate = function(event) {
			return self._mouseUp(event);
		};
		$(document)
			.bind('mousemove.'+this.widgetName, this._mouseMoveDelegate)
			.bind('mouseup.'+this.widgetName, this._mouseUpDelegate);

		// preventDefault() is used to prevent the selection of text here -
		// however, in Safari, this causes select boxes not to be selectable
		// anymore, so this fix is needed
		($.browser.safari || event.preventDefault());

		event.originalEvent.mouseHandled = true;
		return true;
	},

	_mouseMove: function(event) {
		// IE mouseup check - mouseup happened when mouse was out of window
		if ($.browser.msie && !event.button) {
			return this._mouseUp(event);
		}

		if (this._mouseStarted) {
			this._mouseDrag(event);
			return event.preventDefault();
		}

		if (this._mouseDistanceMet(event) && this._mouseDelayMet(event)) {
			this._mouseStarted =
				(this._mouseStart(this._mouseDownEvent, event) !== false);
			(this._mouseStarted ? this._mouseDrag(event) : this._mouseUp(event));
		}

		return !this._mouseStarted;
	},

	_mouseUp: function(event) {
		$(document)
			.unbind('mousemove.'+this.widgetName, this._mouseMoveDelegate)
			.unbind('mouseup.'+this.widgetName, this._mouseUpDelegate);

		if (this._mouseStarted) {
			this._mouseStarted = false;
			this._preventClickEvent = (event.target == this._mouseDownEvent.target);
			this._mouseStop(event);
		}

		return false;
	},

	_mouseDistanceMet: function(event) {
		return (Math.max(
				Math.abs(this._mouseDownEvent.pageX - event.pageX),
				Math.abs(this._mouseDownEvent.pageY - event.pageY)
			) >= this.options.distance
		);
	},

	_mouseDelayMet: function(event) {
		return this.mouseDelayMet;
	},

	// These are placeholder methods, to be overriden by extending plugin
	_mouseStart: function(event) {},
	_mouseDrag: function(event) {},
	_mouseStop: function(event) {},
	_mouseCapture: function(event) { return true; }
});

})(jQuery);
/*
 * jQuery UI Slider 1.8.2
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Slider
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.mouse.js
 *	jquery.ui.widget.js
 */

(function( $ ) {

// number of pages in a slider
// (how many times can you page up/down to go through the whole range)
var numPages = 5;

$.widget( "ui.slider", $.ui.mouse, {

	widgetEventPrefix: "slide",

	options: {
		animate: false,
		distance: 0,
		max: 100,
		min: 0,
		orientation: "horizontal",
		range: false,
		step: 1,
		value: 0,
		values: null
	},

	_create: function() {
		var self = this,
			o = this.options;

		this._keySliding = false;
		this._mouseSliding = false;
		this._animateOff = true;
		this._handleIndex = null;
		this._detectOrientation();
		this._mouseInit();

		this.element
			.addClass( "ui-slider" +
				" ui-slider-" + this.orientation +
				" ui-widget" +
				" ui-widget-content" +
				" ui-corner-all" );
		
		if ( o.disabled ) {
			this.element.addClass( "ui-slider-disabled ui-disabled" );
		}

		this.range = $([]);

		if ( o.range ) {
			if ( o.range === true ) {
				this.range = $( "<div></div>" );
				if ( !o.values ) {
					o.values = [ this._valueMin(), this._valueMin() ];
				}
				if ( o.values.length && o.values.length !== 2 ) {
					o.values = [ o.values[0], o.values[0] ];
				}
			} else {
				this.range = $( "<div></div>" );
			}

			this.range
				.appendTo( this.element )
				.addClass( "ui-slider-range" );

			if ( o.range === "min" || o.range === "max" ) {
				this.range.addClass( "ui-slider-range-" + o.range );
			}

			// note: this isn't the most fittingly semantic framework class for this element,
			// but worked best visually with a variety of themes
			this.range.addClass( "ui-widget-header" );
		}

		if ( $( ".ui-slider-handle", this.element ).length === 0 ) {
			$( "<a href='#'></a>" )
				.appendTo( this.element )
				.addClass( "ui-slider-handle" );
		}

		if ( o.values && o.values.length ) {
			while ( $(".ui-slider-handle", this.element).length < o.values.length ) {
				$( "<a href='#'></a>" )
					.appendTo( this.element )
					.addClass( "ui-slider-handle" );
			}
		}

		this.handles = $( ".ui-slider-handle", this.element )
			.addClass( "ui-state-default" +
				" ui-corner-all" );

		this.handle = this.handles.eq( 0 );

		this.handles.add( this.range ).filter( "a" )
			.click(function( event ) {
				event.preventDefault();
			})
			.hover(function() {
				if ( !o.disabled ) {
					$( this ).addClass( "ui-state-hover" );
				}
			}, function() {
				$( this ).removeClass( "ui-state-hover" );
			})
			.focus(function() {
				if ( !o.disabled ) {
					$( ".ui-slider .ui-state-focus" ).removeClass( "ui-state-focus" );
					$( this ).addClass( "ui-state-focus" );
				} else {
					$( this ).blur();
				}
			})
			.blur(function() {
				$( this ).removeClass( "ui-state-focus" );
			});

		this.handles.each(function( i ) {
			$( this ).data( "index.ui-slider-handle", i );
		});

		this.handles
			.keydown(function( event ) {
				var ret = true,
					index = $( this ).data( "index.ui-slider-handle" ),
					allowed,
					curVal,
					newVal,
					step;
	
				if ( self.options.disabled ) {
					return;
				}
	
				switch ( event.keyCode ) {
					case $.ui.keyCode.HOME:
					case $.ui.keyCode.END:
					case $.ui.keyCode.PAGE_UP:
					case $.ui.keyCode.PAGE_DOWN:
					case $.ui.keyCode.UP:
					case $.ui.keyCode.RIGHT:
					case $.ui.keyCode.DOWN:
					case $.ui.keyCode.LEFT:
						ret = false;
						if ( !self._keySliding ) {
							self._keySliding = true;
							$( this ).addClass( "ui-state-active" );
							allowed = self._start( event, index );
							if ( allowed === false ) {
								return;
							}
						}
						break;
				}
	
				step = self.options.step;
				if ( self.options.values && self.options.values.length ) {
					curVal = newVal = self.values( index );
				} else {
					curVal = newVal = self.value();
				}
	
				switch ( event.keyCode ) {
					case $.ui.keyCode.HOME:
						newVal = self._valueMin();
						break;
					case $.ui.keyCode.END:
						newVal = self._valueMax();
						break;
					case $.ui.keyCode.PAGE_UP:
						newVal = self._trimAlignValue( curVal + ( (self._valueMax() - self._valueMin()) / numPages ) );
						break;
					case $.ui.keyCode.PAGE_DOWN:
						newVal = self._trimAlignValue( curVal - ( (self._valueMax() - self._valueMin()) / numPages ) );
						break;
					case $.ui.keyCode.UP:
					case $.ui.keyCode.RIGHT:
						if ( curVal === self._valueMax() ) {
							return;
						}
						newVal = self._trimAlignValue( curVal + step );
						break;
					case $.ui.keyCode.DOWN:
					case $.ui.keyCode.LEFT:
						if ( curVal === self._valueMin() ) {
							return;
						}
						newVal = self._trimAlignValue( curVal - step );
						break;
				}
	
				self._slide( event, index, newVal );
	
				return ret;
	
			})
			.keyup(function( event ) {
				var index = $( this ).data( "index.ui-slider-handle" );
	
				if ( self._keySliding ) {
					self._keySliding = false;
					self._stop( event, index );
					self._change( event, index );
					$( this ).removeClass( "ui-state-active" );
				}
	
			});

		this._refreshValue();

		this._animateOff = false;
	},

	destroy: function() {
		this.handles.remove();
		this.range.remove();

		this.element
			.removeClass( "ui-slider" +
				" ui-slider-horizontal" +
				" ui-slider-vertical" +
				" ui-slider-disabled" +
				" ui-widget" +
				" ui-widget-content" +
				" ui-corner-all" )
			.removeData( "slider" )
			.unbind( ".slider" );

		this._mouseDestroy();

		return this;
	},

	_mouseCapture: function( event ) {
		var o = this.options,
			position,
			normValue,
			distance,
			closestHandle,
			self,
			index,
			allowed,
			offset,
			mouseOverHandle;

		if ( o.disabled ) {
			return false;
		}

		this.elementSize = {
			width: this.element.outerWidth(),
			height: this.element.outerHeight()
		};
		this.elementOffset = this.element.offset();

		position = { x: event.pageX, y: event.pageY };
		normValue = this._normValueFromMouse( position );
		distance = this._valueMax() - this._valueMin() + 1;
		self = this;
		this.handles.each(function( i ) {
			var thisDistance = Math.abs( normValue - self.values(i) );
			if ( distance > thisDistance ) {
				distance = thisDistance;
				closestHandle = $( this );
				index = i;
			}
		});

		// workaround for bug #3736 (if both handles of a range are at 0,
		// the first is always used as the one with least distance,
		// and moving it is obviously prevented by preventing negative ranges)
		if( o.range === true && this.values(1) === o.min ) {
			index += 1;
			closestHandle = $( this.handles[index] );
		}

		allowed = this._start( event, index );
		if ( allowed === false ) {
			return false;
		}
		this._mouseSliding = true;

		self._handleIndex = index;

		closestHandle
			.addClass( "ui-state-active" )
			.focus();
		
		offset = closestHandle.offset();
		mouseOverHandle = !$( event.target ).parents().andSelf().is( ".ui-slider-handle" );
		this._clickOffset = mouseOverHandle ? { left: 0, top: 0 } : {
			left: event.pageX - offset.left - ( closestHandle.width() / 2 ),
			top: event.pageY - offset.top -
				( closestHandle.height() / 2 ) -
				( parseInt( closestHandle.css("borderTopWidth"), 10 ) || 0 ) -
				( parseInt( closestHandle.css("borderBottomWidth"), 10 ) || 0) +
				( parseInt( closestHandle.css("marginTop"), 10 ) || 0)
		};

		normValue = this._normValueFromMouse( position );
		this._slide( event, index, normValue );
		this._animateOff = true;
		return true;
	},

	_mouseStart: function( event ) {
		return true;
	},

	_mouseDrag: function( event ) {
		var position = { x: event.pageX, y: event.pageY },
			normValue = this._normValueFromMouse( position );
		
		this._slide( event, this._handleIndex, normValue );

		return false;
	},

	_mouseStop: function( event ) {
		this.handles.removeClass( "ui-state-active" );
		this._mouseSliding = false;

		this._stop( event, this._handleIndex );
		this._change( event, this._handleIndex );

		this._handleIndex = null;
		this._clickOffset = null;
		this._animateOff = false;

		return false;
	},
	
	_detectOrientation: function() {
		this.orientation = ( this.options.orientation === "vertical" ) ? "vertical" : "horizontal";
	},

	_normValueFromMouse: function( position ) {
		var pixelTotal,
			pixelMouse,
			percentMouse,
			valueTotal,
			valueMouse;

		if ( this.orientation === "horizontal" ) {
			pixelTotal = this.elementSize.width;
			pixelMouse = position.x - this.elementOffset.left - ( this._clickOffset ? this._clickOffset.left : 0 );
		} else {
			pixelTotal = this.elementSize.height;
			pixelMouse = position.y - this.elementOffset.top - ( this._clickOffset ? this._clickOffset.top : 0 );
		}

		percentMouse = ( pixelMouse / pixelTotal );
		if ( percentMouse > 1 ) {
			percentMouse = 1;
		}
		if ( percentMouse < 0 ) {
			percentMouse = 0;
		}
		if ( this.orientation === "vertical" ) {
			percentMouse = 1 - percentMouse;
		}

		valueTotal = this._valueMax() - this._valueMin();
		valueMouse = this._valueMin() + percentMouse * valueTotal;

		return this._trimAlignValue( valueMouse );
	},

	_start: function( event, index ) {
		var uiHash = {
			handle: this.handles[ index ],
			value: this.value()
		};
		if ( this.options.values && this.options.values.length ) {
			uiHash.value = this.values( index );
			uiHash.values = this.values();
		}
		return this._trigger( "start", event, uiHash );
	},

	_slide: function( event, index, newVal ) {
		var otherVal,
			newValues,
			allowed;

		if ( this.options.values && this.options.values.length ) {
			otherVal = this.values( index ? 0 : 1 );

			if ( ( this.options.values.length === 2 && this.options.range === true ) && 
					( ( index === 0 && newVal > otherVal) || ( index === 1 && newVal < otherVal ) )
				) {
				newVal = otherVal;
			}

			if ( newVal !== this.values( index ) ) {
				newValues = this.values();
				newValues[ index ] = newVal;
				// A slide can be canceled by returning false from the slide callback
				allowed = this._trigger( "slide", event, {
					handle: this.handles[ index ],
					value: newVal,
					values: newValues
				} );
				otherVal = this.values( index ? 0 : 1 );
				if ( allowed !== false ) {
					this.values( index, newVal, true );
				}
			}
		} else {
			if ( newVal !== this.value() ) {
				// A slide can be canceled by returning false from the slide callback
				allowed = this._trigger( "slide", event, {
					handle: this.handles[ index ],
					value: newVal
				} );
				if ( allowed !== false ) {
					this.value( newVal );
				}
			}
		}
	},

	_stop: function( event, index ) {
		var uiHash = {
			handle: this.handles[ index ],
			value: this.value()
		};
		if ( this.options.values && this.options.values.length ) {
			uiHash.value = this.values( index );
			uiHash.values = this.values();
		}

		this._trigger( "stop", event, uiHash );
	},

	_change: function( event, index ) {
		if ( !this._keySliding && !this._mouseSliding ) {
			var uiHash = {
				handle: this.handles[ index ],
				value: this.value()
			};
			if ( this.options.values && this.options.values.length ) {
				uiHash.value = this.values( index );
				uiHash.values = this.values();
			}

			this._trigger( "change", event, uiHash );
		}
	},

	value: function( newValue ) {
		if ( arguments.length ) {
			this.options.value = this._trimAlignValue( newValue );
			this._refreshValue();
			this._change( null, 0 );
		}

		return this._value();
	},

	values: function( index, newValue ) {
		var vals,
			newValues,
			i;

		if ( arguments.length > 1 ) {
			this.options.values[ index ] = this._trimAlignValue( newValue );
			this._refreshValue();
			this._change( null, index );
		}

		if ( arguments.length ) {
			if ( $.isArray( arguments[ 0 ] ) ) {
				vals = this.options.values;
				newValues = arguments[ 0 ];
				for ( i = 0; i < vals.length; i += 1 ) {
					vals[ i ] = this._trimAlignValue( newValues[ i ] );
					this._change( null, i );
				}
				this._refreshValue();
			} else {
				if ( this.options.values && this.options.values.length ) {
					return this._values( index );
				} else {
					return this.value();
				}
			}
		} else {
			return this._values();
		}
	},

	_setOption: function( key, value ) {
		var i,
			valsLength = 0;

		if ( $.isArray( this.options.values ) ) {
			valsLength = this.options.values.length;
		}

		$.Widget.prototype._setOption.apply( this, arguments );

		switch ( key ) {
			case "disabled":
				if ( value ) {
					this.handles.filter( ".ui-state-focus" ).blur();
					this.handles.removeClass( "ui-state-hover" );
					this.handles.attr( "disabled", "disabled" );
					this.element.addClass( "ui-disabled" );
				} else {
					this.handles.removeAttr( "disabled" );
					this.element.removeClass( "ui-disabled" );
				}
				break;
			case "orientation":
				this._detectOrientation();
				this.element
					.removeClass( "ui-slider-horizontal ui-slider-vertical" )
					.addClass( "ui-slider-" + this.orientation );
				this._refreshValue();
				break;
			case "value":
				this._animateOff = true;
				this._refreshValue();
				this._change( null, 0 );
				this._animateOff = false;
				break;
			case "values":
				this._animateOff = true;
				this._refreshValue();
				for ( i = 0; i < valsLength; i += 1 ) {
					this._change( null, i );
				}
				this._animateOff = false;
				break;
		}
	},

	//internal value getter
	// _value() returns value trimmed by min and max, aligned by step
	_value: function() {
		var val = this.options.value;
		val = this._trimAlignValue( val );

		return val;
	},

	//internal values getter
	// _values() returns array of values trimmed by min and max, aligned by step
	// _values( index ) returns single value trimmed by min and max, aligned by step
	_values: function( index ) {
		var val,
			vals,
			i;

		if ( arguments.length ) {
			val = this.options.values[ index ];
			val = this._trimAlignValue( val );

			return val;
		} else {
			// .slice() creates a copy of the array
			// this copy gets trimmed by min and max and then returned
			vals = this.options.values.slice();
			for ( i = 0; i < vals.length; i+= 1) {
				vals[ i ] = this._trimAlignValue( vals[ i ] );
			}

			return vals;
		}
	},
	
	// returns the step-aligned value that val is closest to, between (inclusive) min and max
	_trimAlignValue: function( val ) {
		if ( val < this._valueMin() ) {
			return this._valueMin();
		}
		if ( val > this._valueMax() ) {
			return this._valueMax();
		}
		var step = ( this.options.step > 0 ) ? this.options.step : 1,
			valModStep = val % step,
			alignValue = val - valModStep;

		if ( Math.abs(valModStep) * 2 >= step ) {
			alignValue += ( valModStep > 0 ) ? step : ( -step );
		}

		// Since JavaScript has problems with large floats, round
		// the final value to 5 digits after the decimal point (see #4124)
		return parseFloat( alignValue.toFixed(5) );
	},

	_valueMin: function() {
		return this.options.min;
	},

	_valueMax: function() {
		return this.options.max;
	},
	
	_refreshValue: function() {
		var oRange = this.options.range,
			o = this.options,
			self = this,
			animate = ( !this._animateOff ) ? o.animate : false,
			valPercent,
			_set = {},
			lastValPercent,
			value,
			valueMin,
			valueMax;

		if ( this.options.values && this.options.values.length ) {
			this.handles.each(function( i, j ) {
				valPercent = ( self.values(i) - self._valueMin() ) / ( self._valueMax() - self._valueMin() ) * 100;
				_set[ self.orientation === "horizontal" ? "left" : "bottom" ] = valPercent + "%";
				$( this ).stop( 1, 1 )[ animate ? "animate" : "css" ]( _set, o.animate );
				if ( self.options.range === true ) {
					if ( self.orientation === "horizontal" ) {
						if ( i === 0 ) {
							self.range.stop( 1, 1 )[ animate ? "animate" : "css" ]( { left: valPercent + "%" }, o.animate );
						}
						if ( i === 1 ) {
							self.range[ animate ? "animate" : "css" ]( { width: ( valPercent - lastValPercent ) + "%" }, { queue: false, duration: o.animate } );
						}
					} else {
						if ( i === 0 ) {
							self.range.stop( 1, 1 )[ animate ? "animate" : "css" ]( { bottom: ( valPercent ) + "%" }, o.animate );
						}
						if ( i === 1 ) {
							self.range[ animate ? "animate" : "css" ]( { height: ( valPercent - lastValPercent ) + "%" }, { queue: false, duration: o.animate } );
						}
					}
				}
				lastValPercent = valPercent;
			});
		} else {
			value = this.value();
			valueMin = this._valueMin();
			valueMax = this._valueMax();
			valPercent = ( valueMax !== valueMin ) ?
					( value - valueMin ) / ( valueMax - valueMin ) * 100 :
					0;
			_set[ self.orientation === "horizontal" ? "left" : "bottom" ] = valPercent + "%";
			this.handle.stop( 1, 1 )[ animate ? "animate" : "css" ]( _set, o.animate );

			if ( oRange === "min" && this.orientation === "horizontal" ) {
				this.range.stop( 1, 1 )[ animate ? "animate" : "css" ]( { width: valPercent + "%" }, o.animate );
			}
			if ( oRange === "max" && this.orientation === "horizontal" ) {
				this.range[ animate ? "animate" : "css" ]( { width: ( 100 - valPercent ) + "%" }, { queue: false, duration: o.animate } );
			}
			if ( oRange === "min" && this.orientation === "vertical" ) {
				this.range.stop( 1, 1 )[ animate ? "animate" : "css" ]( { height: valPercent + "%" }, o.animate );
			}
			if ( oRange === "max" && this.orientation === "vertical" ) {
				this.range[ animate ? "animate" : "css" ]( { height: ( 100 - valPercent ) + "%" }, { queue: false, duration: o.animate } );
			}
		}
	}

});

$.extend( $.ui.slider, {
	version: "1.8.2"
});

}(jQuery));
jQuery.fn.pageSlider = function(numOfPages, currentPage, itemsPerPage) {
	var ul = $('ul', this);
	var currentUrl=currentPage;
	if (currentPage > 1) {
		if( document.getElementById('linkNo' + String(currentPage-1)) !== undefined ) {
			currentUrl = document.getElementById('linkNo' + String(currentPage-1)).href;
		} else if( document.getElementById('linkNo' + String(currentPage+1)) !== undefined ) {
			currentUrl = document.getElementById('linkNo' + String(currentPage+1)).href;
		}
	} else if (numOfPages > 1) {
		currentUrl = document.getElementById('linkNo2').href;
	}
	ul.empty();
	for(var i=0;i<numOfPages;i++) {
		if((i+1)==currentPage) {
			ul.append('<li><span class="current">' + currentPage + '</span></li>');
		} else {
			var start = currentUrl.indexOf('?');
			var finish = currentUrl.length;
			if(currentUrl.indexOf('index=') > -1) {
				start = currentUrl.indexOf('index=');
				if(currentUrl.indexOf('&', start) > -1) {
					finish = currentUrl.indexOf('&', start);
				}
				var urlText = currentUrl.substring(start,finish);
				if(urlText.indexOf('index') > -1) {
					if((i * itemsPerPage)>0) {
						ul.append('<li><a href="' + currentUrl.replace(urlText, 'index='+(i * itemsPerPage)) + '"' + '>' + (i+1) + '</a></li>');
					} else {
						ul.append('<li><a href="' + currentUrl.replace(currentUrl.substring(start-1,finish), '') + '"' + '>' + (i+1) + '</a></li>');
					}
				} else {
					if((i * itemsPerPage)>0) {
						ul.append('<li><a href="' + currentUrl.replace(urlText, urlText+'index='+(i * itemsPerPage)) + '"' + '>' + (i+1) + '</a></li>');
					} else {
						ul.append('<li><a href="' + currentUrl.replace(urlText, urlText) + '"' + '>' + (i+1) + '</a></li>');
					}
				}
			} else {
				if((i * itemsPerPage)===0) {
					ul.append('<li><a href="' + currentUrl + '"' + '>' + (i+1) + '</a></li>');
				} else {
					var paramchar = '&';
					if(currentUrl.indexOf('?') === -1) {
						paramchar = '?';
					}
					ul.append('<li><a href="' + currentUrl + paramchar + 'index=' + (i * itemsPerPage) + '"' + '>' + (i+1) + '</a></li>');
				}
			}
		}
	}
	var sliderGallery = $('.sliderGallery', this);
	sliderGallery.addClass("sliderGallery-JS");
	var sliderWidth = $(sliderGallery).outerWidth();
	var pageNumbersWidth = ul.innerWidth() + (ul.innerWidth()/10);
	var slider;

	if (pageNumbersWidth > sliderWidth) {
		var pageNumbersWidthMinusSliderWidth = pageNumbersWidth - sliderWidth;
		var pixelsOnPageNumbersPerPage = pageNumbersWidthMinusSliderWidth / (numOfPages - 1);
		var startValue = pixelsOnPageNumbersPerPage * (currentPage - 1);

		slider = $('#slider', this);
		ul.css('left', '-' + startValue + 'px');
		slider.slider(
		{
			min: 0,
			max: pageNumbersWidthMinusSliderWidth,
			value: startValue,
			slide: function (ev, ui) {
				ul.css('left', '-' + ui.value + 'px');
			},
			stop: function (ev, ui) {
				ul.css('left', '-' + ui.value + 'px');
			}
		});

		var markerWidth = 5;
		var sliderHandle = $('.ui-slider-handle', slider);
		var markerPosition = sliderWidth * parseInt(sliderHandle.css("left"), 10) / 100 - (markerWidth / 2);

		slider.append("<div class='previous-marker' style='left:" + markerPosition + "px;'></div>");
		ul.css('width', (pageNumbersWidth + 3) + 'px');
		ul.children('li').css('float','left');
		ul.children('li').css('margin-right','3px');
		ul.children(':last-child').css('margin-right','0');
	} else {

		slider = $('.sliderGallery', this);
		slider.css("width", pageNumbersWidth);
		//slider.style.width =
		var sliderlist = $('.items', this);
		sliderlist.addClass("slidersmalllist");
		ul.css('width', (pageNumbersWidth + 3) + 'px');
		ul.children('li').css('float','left');
		ul.children('li').css('margin-right','3px');
		ul.children(':last-child').css('margin-right','0');

		/*slider.style.width = pageNumbersWidth + "px";*/
	}
};
(function() {
	var SEARCHRESULTS = RIGHTMOVE.namespace("RIGHTMOVE.SEARCHRESULTS");

	SEARCHRESULTS.mamForm = function() {
		var total = 0 ;
		var selected = 0;
		var initialComments = "Hints...What's on your 'must have' list? Do you have any property to sell or to let? Do you need any mortgage advice?";

		var validationRules = {
			fullName: {
				pattern: /[\w]+/,
				message: "* Please enter your full name"
			},
			email: {
				pattern: /^[A-Za-z0-9\-\?\!\$\%\&\'\*\=\.\|\~\{\}\+_\#\^\/]+\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]{2,5}$/,
				message: "* Please enter a valid email address"
			},
			telephone: {
				pattern: /^[\-\+\s0-9\)\(]{8,50}$/,
				message: "* Please enter a valid phone number"
			}
		};

		var formFieldTips = {
			fullName: "required",
			email: "required",
			telephone: "required",
			comments: initialComments
		};

		var validateMamForm = function() {
			// Replace submit button with loading symbol
			$("#mamsubmit").hide();
			$("#loading_status").show();

			var hasError = false, emptyForm = false, noAgent = false, messageTooLarge = false, nonValidFields = false;
			if (!selected) { noAgent = true; }

			$("#multiContactBranchForm input[type=text], #multiContactBranchForm textarea").each(function() {
				var tip = formFieldTips[this.id];
				if (this.id != "comments" && (!this.value || (tip && this.value === tip))) {emptyForm = true; }

				var rule = validationRules[this.id];
				if (rule) {
					if (!this.value.match(rule.pattern) || (tip && this.value === tip)) {
						nonValidFields = true;
					}
				}
			});

			if($("textarea[id=comments]").val().length > 700) {
				messageTooLarge = true;
			}

			if (noAgent && emptyForm) { alert("Please select at least one agent or developer from the list and complete your details before sending the form"); hasError = true; }
			else if (noAgent) { alert("Please select at least one agent or developer"); hasError = true; }
			else if (emptyForm) { alert("Please complete your details before sending the form"); hasError = true; }
			else if (nonValidFields) { alert("Please check your details before sending the form"); hasError = true; }
			else if (messageTooLarge) { alert("Please enter 700 characters or less for your message"); hasError = true; }

			if(hasError) {
				// Change loading symbol back to button
				$("#loading_status").hide();
				$("#mamsubmit").show();
				return false;
			} else {
				return true;
			}
		};

		var removeJavascriptHints = function() {
			if($("textarea[id=comments]").val() == initialComments) {
				$("textarea[id=comments]").val("");
			}
		};

		var setupEcommerceTags = function(channel, emailsSent, currentDateAndTime) {
			var channelWithMAM = channel + "_MAM";
			var totalValue = 10 * emailsSent;
			var totalValueWithQuotes = "\"" + totalValue + "\"";

			var orderIdWithQuotes = "GB MAMbottom" + " " + channel + " " +currentDateAndTime;
			var stateWithQuotes = "\"" + "MAM " + channel + "\"";
            var pageToTrack = "/click/"+channel+"/searchresults/mambottomsubmit";

			if( typeof(_gaq) != 'undefined' ) {
				_gaq.push(['_addTrans',
						orderIdWithQuotes,   		// Order Id
						'',							// Affiliation (not used)
						totalValueWithQuotes,		// Total
						'',							// Tax
						'',							// Shipping
						'',			                // City
						stateWithQuotes,			// State
						'GB']); 					// Country
				_gaq.push(['_addItem',
						orderIdWithQuotes,			// Order Id
						'MAM',					    //'SKU'
						'MAM', 		                // Product Name
						channelWithMAM,  			// Category (utmiva)
						'10', 					    // Price
						emailsSent]); 	    		// Quantity
				_gaq.push(['_trackTrans']);
                _gaq.push(['_trackPageview',pageToTrack ]);
			}
		};

		var setupCustomVariables = function(channel) {
			if( typeof(_gaq) != 'undefined' ) {
				var currentUserTypesString = RIGHTMOVE.UTIL.analytics.getCurrentUserTypesFromUtmvCookie();

				if (currentUserTypesString !== undefined && currentUserTypesString.length > 0) {
					var userTypesArray = currentUserTypesString.split("-").sort();

					if (channel === 'buying' || channel === 'newhomes') {
						userTypesArray.push('cbuy');
					} else if (channel === 'letting') {
						userTypesArray.push('crent');
					}

					userTypesArray = RIGHTMOVE.UTIL.analytics.deduplicateConvertedUserTypes(channel, userTypesArray);

					currentUserTypesString = '';
					for (var i=0; i<userTypesArray.length; i++) {
						currentUserTypesString += (i+1 !== userTypesArray.length) ? userTypesArray[i]+"-" : userTypesArray[i];
					}

					_gaq.push(['_setCustomVar', 3, 'user', currentUserTypesString, 1]);
				}
			}
		};

		var mamSuccess = function(json) {
			if(!json.error) {
				// Success
				$("#numberOfAgentsEmailed").empty().append(json.emailsSent);
				$("#confirmationEmailSent").empty();
				if(json.confirmationEmailSent == "true" || json.confirmationEmailSent ) {
					$("#confirmationEmailSent").append("A copy of the email will be sent to " + json.email + ".");
				}
				$("#ajax_multi_agent_confirmation").toggle();
				$("#multiContactBranchForm").hide();
				// Google Analytics stuff
				setupEcommerceTags(json.channel, json.emailsSent, json.currentDateAndTime);
				setupCustomVariables(json.channel);
			}
			else {
				$("#validation").empty().append(json.error);
				$("#loading_status").hide();
				$("#mamsubmit").show();
			}
			window.location.hash="multiContactBranch";
		};

		var initialiseFormFields = function() {
			// Remove all the HTML tips/stars
			$("#multiContactBranchForm label span, #required_text, #hints").remove();

			// Add tooltips, validation etc.
			$("#multiContactBranchForm :text, #multiContactBranchForm textarea").each(function() {
				var $field = $(this);
				var hint = formFieldTips[this.id];
				var rule = validationRules[this.id];

				if (rule) {
					$field
							.after("<span class='validationcontainer'></span>")
							.blur(function() {
								if (!this.value.match(rule.pattern) || (hint && this.value === hint)) {
									// If the field doesn't match the regex
									$(this).next().html(rule.message).removeClass("passed").addClass("failed");
								} else {
									$(this).next().empty().removeClass("failed").addClass("passed");
								}
							});
				}
				if (hint) {
					if (!$field.val()) {
						$field.val(hint).addClass("fieldhint");
					}
					$field
							.focus(function() {
						// Remove tip if necessary
						if (this.value == hint) {
							$(this).val("").removeClass("fieldhint");
						}
					})
							.blur(function(){
						// Add tip if necessary
						if (!this.value) {
							$(this).val(hint).addClass("fieldhint");
						}
					});
				}
			});
		};

		var handleSelectDeselectAll = function(){
			var link = this;

			if (link.id == "select") {
				selected = total;
				$("#agents :checkbox").each(function(i, checkbox) {
					checkbox.checked = "checked";
				});
			} else {
				selected = 0;
				$("#agents :checkbox").each(function(i, checkbox) {
					checkbox.checked = null;
				});
			}

			$("#selected").html(selected.toString());
			return false;
		};

		/*
		Function to add div with 'selected agents' counter and 'select all'/'deselect all' links
		 */
		var createSelectOptions = function(){
			var $selectOptionsDiv = $("<div id='select_options' class='clearfix'>");

			// Add counter string to select_options div
			$("<p><span id='selected'></span>/<span id='total'></span> added</p>").appendTo($selectOptionsDiv);

			// Add to ul then select_options div
			var $ul = $("<ul>").appendTo($selectOptionsDiv);

			$("<li>")
					.append($("<a id='select' class='priority2' href='#' title='Select all agents and developers'>Select All</a>").click(handleSelectDeselectAll))
					.appendTo($ul);
			$("<li>")
					.append($("<a id='deselect' class='priority2' href='#' title='Deselect all agents and developers'>Deselect All</a>").click(handleSelectDeselectAll))
					.appendTo($ul);

			// Add select_options div to form in right place
			$("#agentlist").append($selectOptionsDiv);

		};

		/*
		Sets the initial 'selected agents' counter on page load
		 */
		var initialiseAgentCounter = function() {
			var $agentList = $("#agents li");

			// Set total count of agents
			total = $agentList.length;
			$("#total").html(total.toString());

			// Set current count of agents
			selected = $agentList.find("input:checked").length;
			$("#selected").html(selected.toString());
		};

		var initialiseAgentList = function() {
			$("#agents li").each(function(i,listItem) {
				var $listItem = $(listItem);
				$listItem.mouseover(function() {
					$(this).addClass('highlight');
				});
				$listItem.mouseout(function() {
					$(this).removeClass('highlight');
				});
				var $checkbox = $listItem.find(":checkbox:first");
				$checkbox.click(function() {
					selected = this.checked ? selected+1 : selected-1;
					$("#selected").html(selected.toString());
				});
			});
		};

		var init = function() {
			createSelectOptions(); // Create counter for agent list
			initialiseAgentCounter(); // Set the agent counter
			initialiseAgentList(); // Add hover and onclick events
			initialiseFormFields(); // Set hints, validation, focus and blur events

			$("#multiContactBranchForm").submit(function() {
				removeJavascriptHints();
				var comments=$("textarea[id=comments]").val();
				$("textarea[id=comments]").val(comments.replace("&","and"));
				$(this).simpleAjaxSubmit(validateMamForm,{},mamSuccess);
				return false;
			});
		};

		return {
			init : init
		};
	}();
})();
/*
 * Autocomplete - jQuery plugin 1.0.2
 *
 * Copyright (c) 2007 Dylan Verheul, Dan G. Switzer, Anjesh Tuladhar, Jörn Zaefferer
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 */

function rightmove_autocomplete_replaceWeirdCharsWithSpace(term) {
		//replace any of these weird chars with nothing
	term = term.replace(/'/g, '');

		//replace any weird chars with a space.
	term = term.replace(/[^A-Z0-9&]/g, ' ');

		//replace any double space with a single space
	return term.replace(/\s+/g, " ") + "";
}

function rightmove_autocomplete_convertTerm(term) {
	term = term.replace(/&/g, "AND") + "";
	term = term.replace(/ ST\./g, " SAINT ") + "";
	term = term.replace(/ ST /g, " SAINT ") + "";
	term = term.replace(/^ST\./g, "SAINT ") + "";
	term = term.replace(/^ST /g, "SAINT ") + "";
	term = rightmove_autocomplete_replaceWeirdCharsWithSpace(term)
	return term;
}

function rightmove_autocomplete_filterOutNonMatchingLocations(locations, termToMatch, excludeUserDefined) {
	return jQuery.grep(locations, function(elementOfArray) {
		if (excludeUserDefined && elementOfArray.locationIdentifier.match(/^USERDEFINEDAREA/)) {
			return false;
		}
		if (!elementOfArray.displayName) {
			return false;
		}
		var dataToMatch = rightmove_autocomplete_convertTerm(elementOfArray.displayName.toUpperCase());
		return (dataToMatch.indexOf(termToMatch) === 0 );
	});
}

function rightmove_autocomplete_getMatchingRegionIds(originalTerm){
	var regionPrefixLength = "REGION^".length;

	var termToMatch = rightmove_autocomplete_convertTerm(originalTerm.toUpperCase());

	var matchingTerms = RIGHTMOVE.UTIL.typeAheadPersister.getHistory(termToMatch);

	matchingTerms = rightmove_autocomplete_filterOutNonMatchingLocations(matchingTerms, termToMatch);

	var matchingRegions = jQuery.grep(matchingTerms, function(e, i) {
		return e.locationIdentifier && e.locationIdentifier.match(/^REGION/);
	});

	return jQuery.map(matchingRegions, function(e, i) {
		return e.locationIdentifier.substring(regionPrefixLength, e.locationIdentifier.length);
	});
};

(function($) {
	function isTermStartWithOutcode(term) {
		return (term.length) <= 2 || term.match(/^[a-zA-Z]{1,2}[0-9].*$/);
	}



	function getOptions() {

		return {
			itemLengthLimit:35,
			delay:1,
			width: 300,
			minChars:1,
			max: 10,
			scroll:false,
			selectFirst: false,
			matchSubset: false,
			extraParams: false,
			mustMatch: false,
			cacheLength: 100,
			formatItem: function(data, counter, max, value, term, options) {

				var termToMatch = rightmove_autocomplete_convertTerm(term.toUpperCase());
				var dataToMatch = rightmove_autocomplete_convertTerm(data.toUpperCase());
				var itemSizeLimit = options.itemLengthLimit;

				if (dataToMatch.indexOf(termToMatch) === 0) {

					if (data.length > itemSizeLimit) {
						return data.substr(0, itemSizeLimit) + "...";
					}
					return data;

				}
				return false;

			},
			formatMatch: function(rawValue, counter, length) {
				return false;
			},

			parse: function (data, originalTerm, myInput) {
				var parsed = [];
				var evaluatedData = eval(data);
				if (evaluatedData) {
					var locations = evaluatedData.typeAheadLocations;
					var i;
					var j;
					var location;
					var myclientpersister = RIGHTMOVE.UTIL.typeAheadPersister;
					var termToMatch = rightmove_autocomplete_convertTerm(originalTerm.toUpperCase());

					var arr = myclientpersister.getHistory(originalTerm);

					arr = rightmove_autocomplete_filterOutNonMatchingLocations(arr, termToMatch, this.excludeUserDefined);

					for (i = 0; i < arr.length; i++) {
						arr[i].historical = true;
					}
					if (locations) {
						locations = rightmove_autocomplete_filterOutNonMatchingLocations(locations, termToMatch, this.excludeUserDefined);
						for (i = 0; i < locations.length; i++) {
							location = locations[i];
							var unique = true;
							for (j = 0; j < arr.length; j++) {
								if (location.locationIdentifier == arr[j].locationIdentifier) {
									unique = false;
								}
							}
							if (unique) {
								arr.push(location);
							}
						}
					}
					locations = arr;

					if (locations) {
						var lastHistorical = -1;
						for (i = 0; i < locations.length; i++) {
							location = locations[i];
							if (location) {
								parsed[parsed.length] = {
									data: location.displayName,
									value: location.locationIdentifier,
									result: location.displayName,
									historical: (location.historical === true)
								};
								if (location.historical === true) {
									lastHistorical = i;
								}
							}
						}
						if (lastHistorical > -1) {
							parsed[lastHistorical].lastHistorical = true;
						}
					}
					else {
						//display empty list message
					}
				}
				return parsed;
			},

			highlight: function(value, term) {

				var termToMatch = rightmove_autocomplete_replaceWeirdCharsWithSpace(term.toUpperCase());

				if (getStOrSaintFromTerm(termToMatch)) {
					termToMatch = getTermSoItMatchesValue(termToMatch, value, getStOrSaintFromTerm);
				}

				if (getAndOrSign(termToMatch)) {
					termToMatch = getTermSoItMatchesValue(termToMatch, value, getAndOrSign);
				}

				var highlightToLength = getHighlightToLength(value, termToMatch);

				return "<span class='highlightLetter'>" + value.substr(0, highlightToLength) + "</span>" + value.substr(highlightToLength, value.length);


			}};
	}

	$.fn.extend({
		rightmoveautocomplete: function(urlOrData, form, excludeUserDefined) {
			var options = getOptions();
			var isUrl = typeof urlOrData == "string";
			options = $.extend({}, $.Autocompleter.defaults, {
				url: isUrl ? urlOrData : null,
				data: isUrl ? null : urlOrData,
				delay: isUrl ? $.Autocompleter.defaults.delay : 10,
				delay: isUrl ? $.Autocompleter.defaults.delay : 10,
				max: options && !options.scroll ? 10 : 150
			}, options);

			// if highlight is set to false, replace it with a do-nothing function
			options.highlight = options.highlight || function(value) {
				return value;
			};

			// if the formatMatch option is not specified, then use formatItem for backwards compatibility
			options.formatMatch = options.formatMatch || options.formatItem;

			options.excludeUserDefined = excludeUserDefined;

			return this.each(function() {
				autoCompleter = new $.Autocompleter(this, options, form);
			});
		},
		result: function(handler) {
			return this.bind("result", handler);
		},
		search: function(handler) {
			return this.trigger("search", [handler]);
		},
		flushCache: function() {
			return this.trigger("flushCache");
		},
		setOptions: function(options) {
			return this.trigger("setOptions", [options]);
		},
		unautocomplete: function() {
			return this.trigger("unautocomplete");
		}
	});


	$.Autocompleter = function(input, options, form) {

		var KEY = {
			UP: 38,
			DOWN: 40,
			DEL: 46,
			TAB: 9,
			RETURN: 13,
			ESC: 27,
			COMMA: 188,
			PAGEUP: 33,
			PAGEDOWN: 34,
			BACKSPACE: 8
		};


		// Create $ object for input element
		var $input = $(input).attr("autocomplete", "off").addClass(options.inputClass);

		var timeout;
		var currentValue;
		var previousValue = "";
		var cache = $.Autocompleter.Cache(options);

		function getCurrentStatus() {
			return currentStatus;
		}

		var hasFocus = 0;
		var lastKeyPressCode;
		var config = {
			mouseDownOnSelect: false
		};
		var select = $.Autocompleter.Select(options, input, selectCurrent, config, form);

		var blockSubmit;

		// prevent form submit in opera when selecting with return key
		$.browser.opera && $(input.form).bind("submit.autocomplete", function() {
			if (blockSubmit) {
				blockSubmit = false;
				return false;
			}
		});


		function selectCurrent() {
			var selected = select.selected();
			if (!selected)
				return false;

			var v = selected.result;
			previousValue = v;

			if (options.multiple) {
				var words = trimWords($input.val());
				if (words.length > 1) {
					v = words.slice(0, words.length - 1).join(options.multipleSeparator) + options.multipleSeparator + v;
				}
				v += options.multipleSeparator;
			}

			$input.val(v);
			hideResultsNow();
			$input.trigger("result", [selected.data, selected.value]);
			return true;
		}

		function onChange(crap, skipPrevCheck) {
			if (lastKeyPressCode == KEY.DEL) {
				select.hide();
				return;
			}

			var currentValue = $input.val();

			if (!skipPrevCheck && currentValue == previousValue)
				return;

			previousValue = currentValue;

			currentValue = lastWord(currentValue);
			if (currentValue.length >= options.minChars) {
				$input.addClass(options.loadingClass);
				if (!options.matchCase)
					currentValue = currentValue.toLowerCase();
				request(currentValue, receiveData, hideResultsNow);
			} else {
				stopLoading();
				select.hide();
			}
		}
		;

		// only opera doesn't trigger keydown multiple times while pressed, others don't work with keypress at all
		$input.bind(($.browser.opera ? "keypress" : "keydown") + ".autocomplete", function(event) {
			// track last key pressed
			lastKeyPressCode = event.keyCode;
			switch (event.keyCode) {

				case KEY.UP:
					event.preventDefault();
					if (select.visible()) {
						select.prev(currentValue);
					} else {
						onChange(0, true);
					}
					break;

				case KEY.DOWN:
					event.preventDefault();
					if (select.visible()) {
						select.next(currentValue);
					} else {
						onChange(0, true);
					}
					break;

				case KEY.PAGEUP:
					event.preventDefault();
					if (select.visible()) {
						select.pageUp(currentValue);
					} else {
						onChange(0, true);
					}
					break;

				case KEY.PAGEDOWN:
					event.preventDefault();
					if (select.visible()) {
						select.pageDown(currentValue);
					} else {
						onChange(0, true);
					}
					break;

				// matches also semicolon
				case options.multiple && $.trim(options.multipleSeparator) == "," && KEY.COMMA:
				case KEY.TAB:
				case KEY.RETURN:
					if (selectCurrent()) {
						// stop default to prevent a form submit, Opera needs special handling
						event.preventDefault();
						blockSubmit = true;
						return false;
					}
					break;

				case KEY.ESC:
					select.hide();
					break;

				default:
					clearTimeout(timeout);
					timeout = setTimeout(function() {
						select.resetSelectedCounter();
						currentValue = $input.val();
						onChange();
					}, options.delay);
					break;
			}
		}).focus(function() {
			// track whether the field has focus, we shouldn't process any
			// results if the field no longer has focus
			hasFocus++;
		}).blur(function() {
			hasFocus = 0;
			if (!config.mouseDownOnSelect) {
				hideResults();
			}
		}).click(function() {
			// show select when clicking in a focused field
			if (hasFocus++ > 1 && !select.visible()) {
				onChange(0, true);
			}
		}).bind("hideAutoComplete", function() {
			hideResults();
		}).bind("search", function() {
			// TODO why not just specifying both arguments?
			var fn = (arguments.length > 1) ? arguments[1] : null;
			function findValueCallback(q, data) {
				var result;
				if (data && data.length) {
					for (var i = 0; i < data.length; i++) {
						if (data[i].result.toLowerCase() == q.toLowerCase()) {
							result = data[i];
							break;
						}
					}
				}
				if (typeof fn == "function") {
					fn(result);
				}
				else {
					$input.trigger("result", result && [result.data, result.value]);
				}
			}
			$.each(trimWords($input.val()), function(i, value) {
				request(value, findValueCallback, findValueCallback);
			});
		}).bind("flushCache", function() {
			cache.flush();
		}).bind("setOptions", function() {
			$.extend(options, arguments[1]);
			// if we've updated the data, repopulate
			if ("data" in arguments[1]) {
				cache.populate();
			}
		}).bind("unautocomplete", function() {
			select.unbind();
			$input.unbind();
			$(input.form).unbind(".autocomplete");
		});


		function trimWords(value) {
			if (!value) {
				return [""];
			}
			var words = value.split(options.multipleSeparator);
			var result = [];
			$.each(words, function(i, value) {
				if ($.trim(value))
					result[i] = $.trim(value);
			});
			return result;
		}

		function lastWord(value) {
			if (!options.multiple)
				return value;
			var words = trimWords(value);
			return words[words.length - 1];
		}

		// fills in the input box w/the first match (assumed to be the best match)
		// q: the term entered
		// sValue: the first matching result
		function autoFill(q, sValue) {
			// autofill in the complete box w/the first match as long as the user hasn't entered in more data
			// if the last user key pressed was backspace, don't autofill
			if (options.autoFill && (lastWord($input.val()).toLowerCase() == q.toLowerCase()) && lastKeyPressCode != KEY.BACKSPACE) {
				// fill in the value (keep the case the user has typed)
				$input.val($input.val() + sValue.substring(lastWord(previousValue).length));
				// select the portion of the value not typed by the user (so the next character will erase)
				$.Autocompleter.Selection(input, previousValue.length, previousValue.length + sValue.length);
			}
		}
		;

		function hideResults() {
			clearTimeout(timeout);
			timeout = setTimeout(hideResultsNow, 200);
		}
		;

		function hideResultsNow() {
			var wasVisible = select.visible();
			select.hide();
			clearTimeout(timeout);
			stopLoading();
			if (options.mustMatch) {
				// call search and run callback
				$input.search(
						function (result) {
							// if no value found, clear the input box
							if (!result) {
								if (options.multiple) {
									var words = trimWords($input.val()).slice(0, -1);
									$input.val(words.join(options.multipleSeparator) + (words.length ? options.multipleSeparator : ""));
								}
								else
									$input.val("");
							}
						}
						);
			}
			if (wasVisible)
			// position cursor at end of input field
				$.Autocompleter.Selection(input, input.value.length, input.value.length);

		}
		;

		function receiveData(q, data) {
			if (data && data.length && hasFocus) {
				stopLoading();
				select.display(data, q);
				autoFill(q, data[0].value);
				select.show();
			} else {
				hideResultsNow();

				//$.data(li, "ac_data", null);
				select.display(data, q);
				if (!isTermStartWithOutcode(q)) {
					//display the no matches found
					select.show();
				}
			}
		}
		;

		//	function convertTerm(term){
		//		term = term.replace(/&/g, "AND") + "";
		//		term = term.replace(/ ST\./g, " SAINT ") + "";
		//		term = term.replace(/ ST /g, " SAINT ") + "";
		//		term = term.replace(/^ST\./g, "SAINT ") + "";
		//		term = term.replace(/^ST /g, "SAINT ") + "";
		//		//replace any weird chars with a space.
		//		term = term.replace(/[^A-Z'0-9]/g, ' ');
		//		//replace any double space with a single space
		//		term = term.replace(/\s+/g, " ") + "";
		//		return term;
		//	}


		function request(originalTerm, success, failure) {
			var term = originalTerm;
			if (!options.matchCase) {
				term = term.toUpperCase();
			}
			term = rightmove_autocomplete_convertTerm(term);
			if (term != null && term.length < 1) {
				failure(originalTerm);
			}
			var data = cache.load(term);

			// recieve the cached data
			if (data) {
				success(originalTerm, options.parse(data, originalTerm, $input));
			}
			else if ((typeof options.url == "string") && (options.url.length > 0)) {
				var extraParams = {
				};
				$.ajax({
					// try to leverage ajaxQueue plugin to abort previous requests
					mode: "abort",
					// limit abortion to this input
					port: "autocomplete" + input.name,
					dataType: options.dataType,
					url: options.url,
					data: $.extend({
						q: lastWord(term)
					}, extraParams),
					success: function(data) {
						var parsed = options.parse(data, originalTerm, $input);
						cache.add(term, data);
						success(originalTerm, parsed);
					}
				});
			} else {
				// if we have a failure, we need to empty the list -- this prevents the the [TAB] key from selecting the last successful match
				select.emptyList();
				failure(originalTerm);
			}
		}
		;

		function stopLoading() {
			$input.removeClass(options.loadingClass);
		}
		;

	};

	$.Autocompleter.defaults = {
		inputClass: "ac_input",
		resultsClass: "ac_results",
		loadingClass: "ac_loading",
		minChars: 1,
		delay: 400,
		matchCase: false,
		matchSubset: true,
		matchContains: false,
		cacheLength: 10,
		max: 100,
		mustMatch: false,
		extraParams: {},
		selectFirst: true,
		formatItem: function(row) {
			return row[0];
		},
		formatMatch: null,
		autoFill: false,
		width: 0,
		multiple: false,
		multipleSeparator: ", ",
		highlight: function(value, term) {
			return value.replace(new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + term.replace(/([\^\$\(\)\[\]\{\}\*\.\+\?\|\\])/gi, "\\$1") + ")(?![^<>]*>)(?![^&;]+;)", "gi"), "<strong>$1</strong>");
		},
		scroll: true,
		scrollHeight: 180
	};

	$.Autocompleter.Cache = function(options) {

		var data = {};
		var length = 0;

		function matchSubset(s, sub) {
			if (!options.matchCase)
				s = s.toLowerCase();
			var i = s.indexOf(sub);
			if (i == -1) return false;
			return i == 0 || options.matchContains;
		}
		;

		function add(q, value) {
			if (length > options.cacheLength) {
				flush();
			}
			if (!data[q]) {
				length++;
			}
			data[q] = value;
		}

		function populate() {
			if (!options.data) return false;
			// track the matches
			var stMatchSets = {},
					nullData = 0;

			// no url was specified, we need to adjust the cache length to make sure it fits the local data store
			if (!options.url) options.cacheLength = 1;

			// track all options for minChars = 0
			stMatchSets[""] = [];

			// loop through the array and create a lookup structure
			for (var i = 0, ol = options.data.length; i < ol; i++) {
				var rawValue = options.data[i];
				// if rawValue is a string, make an array otherwise just reference the array
				rawValue = (typeof rawValue == "string") ? [rawValue] : rawValue;

				var value = options.formatMatch(rawValue, i + 1, options.data.length);
				if (value === false)
					continue;

				var firstChar = value.charAt(0).toLowerCase();
				// if no lookup array for this character exists, look it up now
				if (!stMatchSets[firstChar])
					stMatchSets[firstChar] = [];

				// if the match is a string
				var row = {
					value: value,
					data: rawValue,
					result: options.formatResult && options.formatResult(rawValue) || value
				};

				// push the current match into the set list
				stMatchSets[firstChar].push(row);

				// keep track of minChars zero items
				if (nullData++ < options.max) {
					stMatchSets[""].push(row);
				}
			}
			;

			// add the data items to the cache
			$.each(stMatchSets, function(i, value) {
				// increase the cache size
				options.cacheLength++;
				// add to the cache
				add(i, value);
			});
		}

		// populate any existing data
		setTimeout(populate, 25);

		function flush() {
			data = {};
			length = 0;
		}

		return {
			flush: flush,
			add: add,
			populate: populate,
			load: function(q) {
				if (!options.cacheLength || !length) {
					return null;
				}

				if (data[q]) {
					return data[q];
				}
				else {

					var currentKey = getParentKey(q);
					var item;
					while (currentKey.length >= options.minChars) {
						item = data[currentKey]
						if (item) {
							if (eval(item).isComplete) {
								return item;
							}
							else {
								return null;
							}
						}
						currentKey = getParentKey(currentKey);
					}
					return null;

				}


			}
		};
	};

	function getAndOrSign(input) {
		var theString = input.toUpperCase();
		if (theString.indexOf("&") != -1) {
			return " & ";
		}
		if (theString.indexOf(" AND ") != -1) {
			return " AND ";
		}
	}

	function getStOrSaintFromTerm(input) {
		var theString = input.toUpperCase();

		var saintExpressionsTheTermCouldStartWith = ["ST. ", "ST.", "ST ", "SAINT.", "SAINT " ];

		var saintExpressionsTheTermCouldContain = [" ST. ", " ST ", " SAINT. ", " SAINT " ];

		for (var count = 0; count <= saintExpressionsTheTermCouldStartWith.length; count++) {
			if (theString.indexOf(saintExpressionsTheTermCouldStartWith[count]) === 0) {
				return saintExpressionsTheTermCouldStartWith[count];
			}
		}

		for (count = 0; count <= saintExpressionsTheTermCouldContain.length; count++) {
			if (theString.indexOf(saintExpressionsTheTermCouldContain[count]) != -1) {
				return saintExpressionsTheTermCouldContain[count];
			}
		}
		return null;

	}

	function getHighlightToLength(valueToHighlight, termToMatch) {

		var currentlyMatching = true;
		var currentTermCharIndex = 0;
		var currentTermChar;
		var highlightToLength = 0;
		var currentValueToHighlightChar;

		while (highlightToLength < valueToHighlight.length && currentTermCharIndex <= termToMatch.length && currentlyMatching) {

			currentTermChar = termToMatch.charAt(currentTermCharIndex);
			currentValueToHighlightChar = valueToHighlight.charAt(highlightToLength);
			if (currentTermChar == currentValueToHighlightChar.toUpperCase()) {
				highlightToLength++;
				currentTermCharIndex++;
			}
			else if (currentTermChar == ' ') {
				currentTermCharIndex++;
				var isCurrentHighlightCharNonAlphaNumeric = true;
				while (isCurrentHighlightCharNonAlphaNumeric) {
					highlightToLength++;
					isCurrentHighlightCharNonAlphaNumeric = (/[^A-Z'0-9]/g.test(valueToHighlight.charAt(highlightToLength)) && highlightToLength <= valueToHighlight.length);
				}
			}
			else {
				currentlyMatching = false;
			}
		}
		return highlightToLength;
	}

	function getTermSoItMatchesValue(termToMatch, value, replaceFunction) {
		var term = replaceFunction(termToMatch);
		var data = replaceFunction(value.toUpperCase());
		if (data != term) {
			return termToMatch.replace(term, data);
		}
		return termToMatch;
	}





	function getParentKey(key) {
		return key.substr(0, key.length - 1);
	}

	$.Autocompleter.Select = function (options, input, select, config, form) {
		var CLASSES = {
			ACTIVE: "ac_over"
		};

		var listItems,
				active = -1,
				data,
				term = "",
				needsInit = true,
				element,
				list,
				currentlyDisplayedData,
				mouseMoved = false;

		// Create results
		function init() {
			if (!needsInit)
				return;
			element = $("<div/>")
					.hide()
					.addClass(options.resultsClass)
					.css("position", "absolute")
					.appendTo(document.body);

			// fix for IE6 z-index bug
			if ($.browser.msie && parseInt($.browser.version) == 6) {
				element.append("<iframe></iframe>");
			}

			list = $("<ul id='typeAheadResult'  />").appendTo(element).mouseover(function(event) {
				if (mouseMoved && target(event).nodeName && target(event).nodeName.toUpperCase() == 'LI') {
					selectItem(event, list);
				}
			}).mousemove(function(event) {
				if (!mouseMoved && target(event).nodeName && target(event).nodeName.toUpperCase() == 'LI') {
					selectItem(event, list);
					mouseMoved = true;
				}
			}).click(function(event) {
				$(target(event)).addClass(CLASSES.ACTIVE);
				if ($(target(event))[0].id == 'moreLink') {
					return true;
				}
				select();
				// TODO provide option to avoid setting focus again after selection? useful for cleanup-on-focus
				input.focus();
				return false;
			}).mousedown(function() {
				config.mouseDownOnSelect = true;
			}).mouseup(function() {
				config.mouseDownOnSelect = false;
			});

			if (options.width > 0)
				element.css("width", options.width);

			needsInit = false;
		}

		function selectItem(event, list) {
			active = $("li", list).removeClass(CLASSES.ACTIVE).index(target(event));
			$(target(event)).addClass(CLASSES.ACTIVE);
		}

		function target(event) {
			var element = event.target;
			while (element && element.tagName != "LI")
				element = element.parentNode;
			// more fun with IE, sometimes event.target is empty, just ignore it then
			if (!element)
				return [];
			return element;
		}

		function moveSelect(step, currentValue) {
			var activeItem;
			listItems.slice(active, active + 1).removeClass(CLASSES.ACTIVE);
			movePosition(step);
			var textToDisplay;
			if (active === -1) {
				textToDisplay = currentValue;
			}
			else {
				activeItem = listItems.slice(active, active + 1).addClass(CLASSES.ACTIVE);
				textToDisplay = currentlyDisplayedData[active].data;
			}

			$(input).attr("value", textToDisplay);

			if (options.scroll) {
				var offset = 0;
				listItems.slice(0, active).each(function() {
					offset += this.offsetHeight;
				});
				if ((offset + activeItem[0].offsetHeight - list.scrollTop()) > list[0].clientHeight) {
					list.scrollTop(offset + activeItem[0].offsetHeight - list.innerHeight());
				} else if (offset < list.scrollTop()) {
					list.scrollTop(offset);
				}
			}
		}
		;

		function movePosition(step) {
			active += step;
			if (active < -1) {
				active = listItems.size() - 1;
			} else if (active >= listItems.size()) {
				active = -1;
			}
		}

		function limitNumberOfItems(available) {
			return options.max && options.max < available
					? options.max
					: available;
		}

		function fillList() {
			mouseMoved = false;
			list.empty();
			var max = limitNumberOfItems(data.length);
			var isEmpty = true;
			var count;
			currentlyDisplayedData = new Array();
			for (count = 0; count < max; count++) {
				if (!data[count])
					continue;
				var formatted = options.formatItem(data[count].data, count + 1, max, data[count].value, term, options);
				if (formatted === false) {
					continue;
				}
				isEmpty = false;
				var liHtml = $("<li/>").html(options.highlight(formatted, term)).addClass(count % 2 == 0 ? "ac_even" : "ac_odd");
				if (data[count].historical) {
					liHtml.addClass("ac_hist");
				}
				if (data[count].lastHistorical) {
					liHtml.addClass("ac_lasthist");
				}

				var li = liHtml.appendTo(list)[0];
				$.data(li, "ac_data", data[count]);
				currentlyDisplayedData[currentlyDisplayedData.length] = data[count];
			}
			listItems = list.find("li");
			if (options.selectFirst) {
				listItems.slice(0, 1).addClass(CLASSES.ACTIVE);
				active = 0;
			}


			if (isEmpty) {
				var li = null;
				if (!isTermStartWithOutcode(term)) {
					li = $("<li class='nomatch'>no matches found</li>").addClass(count % 2 == 0 ? "ac_even" : "ac_odd").appendTo(list)[0];
					$.data(li, "ac_data", null);
				}
			}
			else {
				if (count === 10)
				{
					var moreLinkLi = $("<li id ='moreLink'></li>").html("<a class='more' href='#'>More...</a>").addClass(count % 2 == 0 ? "ac_even" : "ac_odd").appendTo(list)[0];
					$.data(moreLinkLi, "ac_data", null);
					$("#moreLink").click(function() {
						return form.submit();
					});
				}
			}
			// apply bgiframe if available
			if ($.fn.bgiframe)
				list.bgiframe();
		}

		return {
			display: function(d, q) {
				init();
				data = d;
				term = q;
				fillList();
			},
			next: function(currentValue) {
				moveSelect(1, currentValue);
			},
			prev: function(currentValue) {
				moveSelect(-1, currentValue);
			},
			pageUp: function(currentValue) {
				if (active != 0 && active - 8 < 0) {
					moveSelect(-active, currentValue);
				} else {
					moveSelect(-8, currentValue);
				}
			},
			pageDown: function(currentValue) {
				if (active != listItems.size() - 1 && active + 8 > listItems.size()) {
					moveSelect(listItems.size() - 1 - active, currentValue);
				} else {
					moveSelect(8, currentValue);
				}
			},
			hide: function() {
				element && element.hide();
				listItems && listItems.removeClass(CLASSES.ACTIVE);
				active = -1;
			},
			visible : function() {
				return element && element.is(":visible");
			},
			current: function() {
				return this.visible() && (listItems.filter("." + CLASSES.ACTIVE)[0] || options.selectFirst && listItems[0]);
			},
			show: function() {
				var offset = $(input).offset();
				element.css({
					width: typeof options.width == "string" || options.width > 0 ? options.width : $(input).width(),
					top: offset.top + input.offsetHeight,
					left: offset.left
				}).show();
				if (options.scroll) {
					list.scrollTop(0);
					list.css({
						maxHeight: options.scrollHeight,
						overflow: 'auto'
					});

					if ($.browser.msie && typeof document.body.style.maxHeight === "undefined") {
						var listHeight = 0;
						listItems.each(function() {
							listHeight += this.offsetHeight;
						});
						var scrollbarsVisible = listHeight > options.scrollHeight;
						list.css('height', scrollbarsVisible ? options.scrollHeight : listHeight);
						if (!scrollbarsVisible) {
							// IE doesn't recalculate width when scrollbar disappears
							listItems.width(list.width() - parseInt(listItems.css("padding-left")) - parseInt(listItems.css("padding-right")));
						}
					}

				}
			},
			selected: function() {
				var selected = listItems && listItems.filter("." + CLASSES.ACTIVE).removeClass(CLASSES.ACTIVE);
				return selected && selected.length && $.data(selected[0], "ac_data");
			},
			emptyList: function () {
				list && list.empty();
			},
			unbind: function() {
				element && element.remove();
			},
			resetSelectedCounter: function() {
				active = -1;
			}
		};
	};

	$.Autocompleter.Selection = function(field, start, end) {
		if (field.createTextRange) {
			var selRange = field.createTextRange();
			selRange.collapse(true);
			selRange.moveStart("character", start);
			selRange.moveEnd("character", end);
			selRange.select();
		} else if (field.setSelectionRange) {
			field.setSelectionRange(start, end);
		} else {
			if (field.selectionStart) {
				field.selectionStart = start;
				field.selectionEnd = end;
			}
		}
		field.focus();
	};

})(jQuery);
jQuery.fn.addSearchLocationEvent = function(isDontShowAlert) {

	var dontShowAlert = isDontShowAlert;
	var lastLocationIdentifierSelected;
	var lastLocationDisplayName;
	var lastPersonalisedLocationIdentifierShown;
	var locationIdentifierHiddenFieldElem  = this.find("input[name=locationIdentifier]", this);
	var useLocationIdentifierHiddenFieldElem = this.find("input[name=useLocationIdentifier]", this);
	var searchLocationTextBox =  this.find("input[name=searchLocation]", this);
	var searchLocationForm = this;
	var clickedSubmitButtonValue = null;

	var alertIfTextBoxInvalid = function() {
		if (searchLocationTextBox[0]){
			if (jQuery.trim(searchLocationTextBox.val()).length < 2){
				if (!dontShowAlert) {
					alert("Please enter an area, postcode or train station.");
				}
				return true;
			} else if (!jQuery.trim(searchLocationTextBox.val()).match(new RegExp("([a-zA-Z0-9])*([a-zA-Z0-9])([a-zA-Z0-9])*"))){
				if (!dontShowAlert) {
					alert("Please enter an area, postcode or train station.");
				}
				return true;
			} else if (jQuery.trim(searchLocationTextBox.val()).length > 200){
				if (!dontShowAlert) {
					alert("Please enter an area, postcode or train station.");
				}
				return true;
            }
        }
		return false;
	};

	var setLocationIdentifierIfValid = function(){
		if (alertIfTextBoxInvalid() ){
			//stop the event
			return false;
		}
		if (searchLocationTextBox.val() === lastLocationDisplayName){
			locationIdentifierHiddenFieldElem.val(lastLocationIdentifierSelected);
			useLocationIdentifierHiddenFieldElem.val('true');
		}
		else{
			useLocationIdentifierHiddenFieldElem.val('false');
			var matchedPreviousRegionIds = rightmove_autocomplete_getMatchingRegionIds(searchLocationTextBox.val());
			if(matchedPreviousRegionIds.length > 0){
				$('<input />').attr('type', 'hidden')
            		.attr('name', 'topMatchPersistRegIds')
            		.attr('value', matchedPreviousRegionIds.join(","))
            		.appendTo(searchLocationForm);
			}
			var latestItemFromHistory = RIGHTMOVE.UTIL.typeAheadPersister.getLatestItemFromHistory();
			if(latestItemFromHistory !== null){
				var lastPersistLocId = $("#lastPersistLocId");
				if (lastPersistLocId.length === 0) {
					$('<input />').attr('type', 'hidden')
						.attr('id', 'lastPersistLocId')
						.attr('name', 'lastPersistLocId')
						.attr('value', latestItemFromHistory.locationIdentifier)
						.appendTo(searchLocationForm);
				} else {
					lastPersistLocId.val(latestItemFromHistory.locationIdentifier);
				}
			}
		}
		return true;
	};

	var getChannelUri = function(action) {
		return (clickedSubmitButtonValue == "To Rent" || clickedSubmitButtonValue == "RENT") ? "/property-to-rent" : "/property-for-sale";
	};

	var setAction = function(form) {
		var action = form.action;

		var parsedAction = RIGHTMOVE.UTIL.parseUrl(action);
		if (parsedAction.path.indexOf("/search.html") === 0) {
			parsedAction.path = getChannelUri(form.action) + parsedAction.path;
			form.action = RIGHTMOVE.UTIL.buildUrl(parsedAction);
		}
	};

	this.submit(function() {
		if (setLocationIdentifierIfValid()) {
			setAction(this);
			return true;
		} else {
			return false;
		}
	});

	$("input[type=submit]", this).click(function() {
		clickedSubmitButtonValue = this.value;
	});

	searchLocationTextBox.result(
		function(event, data, locationIdentifier) {
			lastLocationIdentifierSelected = locationIdentifier;
			lastLocationDisplayName = data;
		}
	);
};
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
/*
 * Robert Douglas has bastardised:
 * Thickbox 3.1 - One Box To Rule Them All.
 * By Cody Lindley (http://www.codylindley.com)
 * Copyright (c) 2007 cody lindley
 * Licensed under the MIT License: http://www.opensource.org/licenses/mit-license.php
*/

jQuery.fn.thickbox = function (options) {
	return this.each(function () {
		var opts;

		// lightbox functions
		var init = function(){
			//add thickbox to href & area elements that have a class of .thickbox
			opts.imgLoader = new Image();// preload image
			opts.imgLoader.src = opts.loadingImage;
		};

		var getPageSize = function(){
			var de = document.documentElement;
			var w = window.innerWidth || self.innerWidth || (de&&de.clientWidth) || document.body.clientWidth;
			var h = window.innerHeight || self.innerHeight || (de&&de.clientHeight) || document.body.clientHeight;
			return [w,h];
		};


		var getImageSize = function(imgPreloader) {
			// Resizing large images - orginal by Christian Montoya edited by me.
			var pagesize = getPageSize();
			var x = pagesize[0] - 100;
			var y = pagesize[1] - 100;
			var imageWidth = imgPreloader.width;
			var imageHeight = imgPreloader.height;
			if (imageWidth > x) {
				imageHeight = imageHeight * (x / imageWidth);
				imageWidth = x;
				if (imageHeight > y) {
					imageWidth = imageWidth * (y / imageHeight);
					imageHeight = y;
				}
			} else if (imageHeight > y) {
				imageWidth = imageWidth * (y / imageHeight);
				imageHeight = y;
				if (imageWidth > x) {
					imageHeight = imageHeight * (x / imageWidth);
					imageWidth = x;
				}
			}
			// End Resizing

			return [imageWidth, imageHeight];
		};

		var preloadNeighbourImages = function(){
			var nextImage = (opts.currentImage === opts.imageArraySize-1) ? 0 : opts.currentImage+1;
			var preloadNextImage = new Image();
			preloadNextImage.src = opts.imageArray[nextImage];

			var previousImage = (opts.currentImage === 0) ? opts.imageArraySize-1 : opts.currentImage-1;
			var preloadPrevImage = new Image();
			preloadPrevImage.src = opts.imageArray[previousImage];
		};

		var showImage = function () {
			$("#TB_load").hide();
			$("#TB_Image").fadeIn(200);
			$("#TB_caption").html(opts.imageArray[opts.currentImage].title);
			$("#TB_count").html(opts.currentImage + 1 + " of " + opts.imageArray.length + ":");
			$("#TB_info").show();
			$("#TB_ImageOff").click(removeThickbox);
			preloadNeighbourImages();
		};

		var changeImage = function() {

			var imgPreloader = new Image();
			$(imgPreloader).error(function(){
			  	$(this).attr({src:"/ps/images/propertydetails/biggerphotonotavailable.png"});
			});
			imgPreloader.onload = function(){
				imgPreloader.onload = null;
				var imageSize = getImageSize(imgPreloader);

				var imageWidth = imageSize[0];
				var imageHeight = imageSize[1];

				opts.thickboxWidth = imageWidth;
				opts.thickboxHeight = imageHeight+30;

				$("#TB_Image").attr("src",imgPreloader.src).width(imageWidth).height(imageHeight);
//				setPosition();

				$("#TB_next a, #TB_prev a").height(imageHeight).width(Math.floor(imageWidth*0.4));

				var animateWidth = Math.abs($("#TB_window").width() - opts.thickboxWidth);
				var animateHeight = Math.abs($("#TB_window").height() - opts.thickboxHeight);
				var animateSpeed = Math.max(animateHeight, animateWidth);
				if (animateSpeed > 0) {
					$('#TB_load').show();
					$('#TB_Image').hide();
					$('#TB_info').hide();
					$("#TB_window").animate({width: opts.thickboxWidth, marginLeft: Math.floor(opts.thickboxWidth/-2), height: opts.thickboxHeight, marginTop: Math.floor(opts.thickboxHeight/-2)},animateSpeed,"linear", showImage);
				} else {
					showImage();
				}

				document.onkeydown = function(e){
					var keycode = (e === null) ? event.keyCode : e.which;

					if(keycode === 27){ // close
						removeThickbox();
					} else if(keycode === 190){ // display previous image
						if(opts.imageGroup){
							document.onkeydown = "";
							changeImage(opts.currentImage-1);
						}
					} else if(keycode === 188){ // display next image
						if(opts.imageGroup){
							document.onkeydown = "";
							changeImage(opts.currentImage+1);
						}
					}
				};

			};

			imgPreloader.src = opts.imageArray[opts.currentImage].href;
		};

		//helper functions below
		var showIframe = function (){
			$("#TB_load").remove();
			$("#TB_window").css({display:"block"});
		};

		var removeThickbox = function() {
			var newImageSrc = $("#TB_Image").attr("src");
			$("#TB_imageOff").unbind("click");
			$("#TB_closeWindowButton").unbind("click");
			$("#TB_prev").unbind("click");
			$("#TB_next").unbind("click");
			$("#TB_window").fadeOut("fast",function(){
				$('#TB_window,#TB_overlay,#TB_HideSelect').trigger("unload").unbind().remove();
				if (opts.unloadCallback) {
					opts.unloadCallback(opts);
				}
			});
			$("#TB_load").remove();
			if (typeof document.body.style.maxHeight === "undefined") {//if IE 6
				$("body","html").css({height: "auto", width: "auto"});
				$("html").css("overflow","");
			}
			document.onkeydown = "";
			document.onkeyup = "";
			return false;
		};

		var setPosition = function() {
			var isIE6 = typeof document.body.style.maxHeight === "undefined";
			$("#TB_window").css({marginLeft: '-' + parseInt((opts.thickboxWidth / 2),10) + 'px', width: opts.thickboxWidth + 'px'});
			if ( ! isIE6 ) { // take away IE6
				$("#TB_window").css({marginTop: '-' + parseInt((opts.thickboxHeight / 2),10) + 'px'});
			}
		};

		var parseQuery = function(query) {
		   var Params = {};
		   if ( ! query ) {return Params;}// return empty object
		   var Pairs = query.split(/[;&]/);
		   for ( var i = 0; i < Pairs.length; i++ ) {
			  var KeyVal = Pairs[i].split('=');
			  if ( ! KeyVal || KeyVal.length != 2 ) {continue;}
			  var key = unescape( KeyVal[0] );
			  var val = unescape( KeyVal[1] );
			  val = val.replace(/\+/g, ' ');
			  Params[key] = val;
		   }
		   return Params;
		};

		var detectMacXFF = function() {
		  var userAgent = navigator.userAgent.toLowerCase();
		  if (userAgent.indexOf('mac') != -1 && userAgent.indexOf('firefox')!=-1) {
			return true;
		  }
		};

		var setup = function(thickboxLink) {//function called when the user clicks on a thickbox link
			var caption = thickboxLink.title || thickboxLink.name || null;
			var url = thickboxLink.href || thickboxLink.alt;
			opts.imageGroup = thickboxLink.rel || false;

			try {
				if (typeof document.body.style.maxHeight === "undefined") {//if IE 6
					$("body","html").css({height: "100%", width: "100%"});
					$("html").css("overflow","hidden");
					if (document.getElementById("TB_HideSelect") === null) {//iframe to hide select elements in ie6
						$("body").append("<iframe id='TB_HideSelect'></iframe><div id='TB_overlay'></div><div id='TB_window'></div>");
						$("#TB_overlay").click(removeThickbox);
					}
				} else {//all others
					if(document.getElementById("TB_overlay") === null){
						$("body").append("<div id='TB_overlay'></div><div id='TB_window'></div>");
						$("#TB_overlay").click(removeThickbox);
					}
				}

				if (detectMacXFF()) {
					$("#TB_overlay").addClass("TB_overlayMacFFBGHack");//use png overlay so hide flash
				} else {
					$("#TB_overlay").addClass("TB_overlayBG");//use background and opacity
				}

				if(caption===null){caption="";}

				$("body").append("<div id='TB_load'><img src='"+opts.imgLoader.src+"' /></div>");//add loader to the page
				$('#TB_load').show();//show loader

				var baseURL;
				if (url.indexOf("?")!==-1) { //ff there is a query string involved
					baseURL = url.substr(0, url.indexOf("?"));
				} else {
					baseURL = url;
				}

				var urlString = /\.jpg$|\.jpeg$|\.png$|\.gif$|\.bmp$/;
				var urlType = baseURL.toLowerCase().match(urlString);

				if (urlType && (urlType[0] === '.jpg' || urlType[0] === '.jpeg' || urlType[0] === '.png' || urlType[0] === '.gif' || urlType[0] === '.bmp')) {//code to show images

					opts.imageArray = [thickboxLink];
					opts.currentImage = 0;

					var objectsToAppend = "<img id='TB_Image' src='"+url+"' title='"+opts.imageArray[opts.currentImage].title+"' alt='"+opts.imageArray[opts.currentImage].title+"' /><div id='TB_info'><span id='TB_caption'>"+opts.imageArray[opts.currentImage].title+"</span></div><div id='TB_closeWindow'><a href='' id='TB_closeWindowButton' title='Close'><img src='"+opts.closeImage+"' /></a></div>";
					$("#TB_window").append(objectsToAppend);
					$("#TB_closeWindowButton").click(removeThickbox);

					if (opts.imageGroup) {
						opts.imageArray = $("a[rel="+opts.imageGroup+"]").not(".thickboxdummy").get();
						opts.imageArraySize = opts.imageArray.length;
						for (opts.counter = 0; ((opts.counter < opts.imageArraySize)); opts.counter++) {
							if (opts.imageArray[opts.counter].href === url) {
								opts.currentImage = opts.counter;
							}
						}

						$("#TB_info").prepend("<span id='TB_count'>"+(opts.currentImage+1)+" of "+opts.imageArraySize+": </span>");
						$("#TB_window").append("<span id='TB_prev'><a href=''>Prev</a></span><span id='TB_next'><a href=''>Next</a></span>");

						$("#TB_prev").click(function(){
							opts.currentImage = (opts.currentImage === 0) ? opts.imageArraySize-1 : opts.currentImage-1;
							changeImage(opts.currentImage);
							$(this).children()[0].blur();
							return false;
						});
						$("#TB_next").click(function(){
							opts.currentImage = (opts.currentImage === opts.imageArraySize-1) ? 0 : opts.currentImage+1;
							changeImage(opts.currentImage);
							$(this).children()[0].blur();
							return false;
						});
					}
					changeImage(opts.currentImage);

				} else {//code to show html

					var queryString = url.replace(/^[^\?]+\??/,'');
					var params = parseQuery(queryString);

					opts.thickboxWidth = params.width || 630; //defaults to 630 if no paramaters were added to URL
					opts.thickboxHeight = params.height || 440; //defaults to 440 if no paramaters were added to URL
					var ajaxContentW = opts.thickboxWidth;
					var ajaxContentH = opts.thickboxHeight;

					if (url.indexOf('TB_iframe') != -1) {// either iframe or ajax window
							var urlNoQuery = url.split('TB_');
							$("#TB_iframeContent").remove();
							if(params.modal != "true"){//iframe no modal
								$("#TB_window").append("<div id='TB_title'><div id='TB_ajaxWindowTitle'>"+opts.caption+"</div><div id='TB_closeAjaxWindow'><a href='#' id='TB_closeWindowButton' title='Close'>close</a></div></div><iframe frameborder='0' hspace='0' src='"+urlNoQuery[0]+"' id='TB_iframeContent' name='TB_iframeContent"+Math.round(Math.random()*1000)+"' style='width:"+(ajaxContentW + 29)+"px;height:"+(ajaxContentH + 17)+"px;' > </iframe>");
								$("TB_iframeContent").ready(
										function() {
											showIframe();
										}
								);
							}else{//iframe modal
							$("#TB_overlay").unbind();
								$("#TB_window").append("<iframe frameborder='0' hspace='0' src='"+urlNoQuery[0]+"' id='TB_iframeContent' name='TB_iframeContent"+Math.round(Math.random()*1000)+"' onload='showIframe()' style='width:"+(ajaxContentW + 29)+"px;height:"+(ajaxContentH + 17)+"px;'> </iframe>");
							}
					} else {// not an iframe, ajax
							if($("#TB_window").css("display") != "block"){
								if(params.modal != "true"){//ajax no modal
								$("#TB_window").append("<div id='TB_title'><div id='TB_ajaxWindowTitle'>"+opts.caption+"</div><div id='TB_closeAjaxWindow'><a href='#' id='TB_closeWindowButton' class='close'><img src='" + opts.closeImage + "'/></a></div></div><div id='TB_ajaxContent' style='width:"+ajaxContentW+"px;height:"+ajaxContentH+"px'></div>");
								}else{//ajax modal
								$("#TB_overlay").unbind();
								$("#TB_window").append("<div id='TB_ajaxContent' class='TB_modal' style='width:"+ajaxContentW+"px;height:"+ajaxContentH+"px;'></div>");
								}
							}else{//this means the window is already up, we are just loading new content via ajax
								$("#TB_ajaxContent")[0].style.width = ajaxContentW +"px";
								$("#TB_ajaxContent")[0].style.height = ajaxContentH +"px";
								$("#TB_ajaxContent")[0].scrollTop = 0;
								$("#TB_ajaxWindowTitle").html(opts.caption);
							}
					}

					$("#TB_closeWindowButton").click(removeThickbox);

					if (url.indexOf('TB_inline') != -1) {
						$("#TB_ajaxContent").append($('#' + params.inlineId).children());
						$("#TB_window").unload(function () {
							$('#' + params.inlineId).append( $("#TB_ajaxContent").children() ); // move elements back when you're finished
						});
						setPosition();
						$("#TB_load").remove();
						$("#TB_window").css({display:"block"});
					} else if(url.indexOf('TB_iframe') != -1) {
						setPosition();
						if($.browser.safari){//safari needs help because it will not fire iframe onload
							$("#TB_load").remove();
							$("#TB_window").css({display:"block"});
						}
					} else {
						var dateForTimeStamp = new Date();
						$("#TB_ajaxContent").load(url += "&random=" + dateForTimeStamp.getTime(),function(){//to do a post change this load method
							setPosition();
							$("#TB_load").remove();
							init("#TB_ajaxContent a.thickbox");
							$("#TB_window").css({display:"block"});
						});
					}

					if (!params.modal) {
						document.onkeyup = function(e){
							var keycode = e ? e.which : event.keyCode;
							if(keycode === 27){ // close
								removeThickbox();
							}
						};
					}

				}

			} catch(e) {
				//nothing here
			}

			if (opts.loadCallback) {
				opts.loadCallback(opts, thickboxLink);
			}
		};

		var defaults = {
			loadingImage: "/ps/images/icons/thickbox/loading.gif",
			closeImage: "/ps/images/icons/thickbox/close.png"
		};

		// Add the defaults
		opts = $.extend({}, defaults, options);

		// Initalize the lightbox
		init();
		$(this).click(function(){
			setup(this);
			return false;
		});
	});
};
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

			$.fancybox(options);
			$.fancybox.center();
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
	var TELEPHONEMESSAGE = RIGHTMOVE.namespace("RIGHTMOVE.TELEPHONEMESSAGE");

	TELEPHONEMESSAGE.attach = function() {

		var haveRunOneTimeSetup = false;

		var clearAllPopUps = function() {
		    $('.btnotewrapper').fadeOut(125);
		};

		var runOneTimeSetup = function() {
			if (!haveRunOneTimeSetup) {
				haveRunOneTimeSetup=true;
				$('.bt4pmin').css('color','#004889').css('text-decoration','underline').css('cursor','pointer');
			}
		};

		var init = function(uniqueId) {
			$(".btnoteCloseButton").click(function() {
				$('#btinfo-'+uniqueId).fadeOut(125);
				$("#"+this.parentNode.id.replace('btinfo-','')).focus();
			});
			$('#'+uniqueId).mousedown(function() {
				clearAllPopUps();
				$('#'+uniqueId).focus();				
				if ( $('#btinfo-'+uniqueId).css('display') == 'none' ) {
					$('#btinfo-'+uniqueId).fadeIn(140, function() {
						$('#btinfo-'+uniqueId).css('display', 'inline');
					});
					setTimeout(RIGHTMOVE.bind(this, function() {
						$('#btinfo-'+uniqueId).focus();
				}), 1);
				}
			});
			$('#btinfo-'+uniqueId).focusout(function() {
				clearAllPopUps();
			});
			runOneTimeSetup();
		};

		var initAll = function(elements) {
			haveRunOneTimeSetup=false;
			elements.each(
				function (i) {init(this.id);}
			);
		};

		return { init: init, initAll:initAll };
	}();
})();
(function() {
	var USER = RIGHTMOVE.namespace("RIGHTMOVE.USER");

	USER.propertyAlertsLightbox = function(){
		var AJAX_TIMEOUT = 60000;
		var REQUEST_DATA_TYPE = "json";
		var REQUEST_URL = "/ajax/save-search-setup-alert.html";

		var alertsXhr;
		var alertFormId = "#lightboxPropertyAlerts";
		var alertFormErrorBoxId = alertFormId+"-errors";
		var alertFormSubmitButton = alertFormId+"-submit";
		var replaceSearchButton = "#lightboxReplaceSearch";
		var saveAsNewSearchButton = "#lightboxSaveAsNewSearch";
		var cancelLinkId = "#alerts-lightbox-link-cancel";
		var accountLightbox = USER.accountLightbox;
		var justRegistered = false;
		var saveSearchSelector;

		var setupSearch;

		var attach = function(config){
			var element = config.element;
			var channel = config.channel;
			var onSaved = config.onSaved;

			var saveSearchSelector = "#savesearch";
			if (config.saveSearchSelector) {
				saveSearchSelector = config.saveSearchSelector;
			}

			var setupSearch = {
				savedSearchId : config.savedSearchId,
				saveSearchUrl: config.saveSearchUrl
			};

			bindOnSaved(onSaved);
			bindShowLightbox(element, setupSearch, channel, saveSearchSelector);
		};

		var showLoginLightbox = function(element, channel){
			accountLightbox.show({
				element : element,
				channel : channel,
				loginForm : "#lightboxLogin",
				registerForm : "#lightboxRegistration",
				showRegisterOnLoad : true,
				preventSuccessRedirect : true,
				preventClose : true
			});
		};

		var bindOnSaved = function (onSaved) {
			if (onSaved) {
				$(USER.propertyAlertsLightbox).unbind("searchSaved.propertyAlerts");
				$(USER.propertyAlertsLightbox).bind("searchSaved.propertyAlerts", function (event, data) {
					onSaved(data);
					toggleLightboxPreventRedirect(false);
				});
			}
		};

		var bindShowLightbox = function(element, setupSearch, channel, saveSearchSelector){
			$(accountLightbox).unbind("beforeShow.propertyAlerts");
			$(accountLightbox).bind("beforeShow.propertyAlerts",  function(event, data) {
				if(!data.loggedIn){
					if($(data.element).is(element)) {
						toggleLightboxPreventRedirect(true);
						$(accountLightbox).unbind("success.propertyAlerts");
						$(accountLightbox).bind("success.propertyAlerts", function(event, data){
							if(data.justRegistered){
								justRegistered = data.justRegistered;
							}

							show({
								setupSearch : setupSearch,
								element : data.element,
								saveSearchSelector : saveSearchSelector
							});

							return false;
						});
					}
				}
				else if($(data.element).is(element)) {
					toggleLightboxPreventRedirect(true);
					show({
						setupSearch : setupSearch,
						element : data.element,
						saveSearchSelector : saveSearchSelector
					});
					return false;
				}
			});
		};

		var show = function(config){
			if(config.saveSearchSelector){
				saveSearchSelector = config.saveSearchSelector;
			}

			setupSearch = {
				saveSearchUrl : window.location.href,
				frequency : getDefaultFrequency(config.element),
				isSubmit : false,
				fromUrl : window.location.href
			};

			if(config.formId){
				alertFormId = config.formId;
			}

			if(config.setupSearch){
				$.extend(setupSearch, config.setupSearch);
			}

			sendRequest(false, function(data) {
				displayForm(data.lightboxHtml, null);
			}, null);

			return false;
		};

		var getDefaultFrequency = function (element) {
			if($(element).is(saveSearchSelector)) {
				return null;
			}
			else {
				return 1;
			}
		};

		var sendRequest = function(isSubmit, onSuccess, onError){
			if (alertsXhr) {
				alertsXhr.abort();
			}

			initSetupSearchData(isSubmit);

			$.fancybox.showActivity();

			alertsXhr = jQuery.ajax({
				type: "POST",
				data : setupSearch,
				dataType: REQUEST_DATA_TYPE,
				url: REQUEST_URL,
				cache: false,
				timeout: AJAX_TIMEOUT,
				success: function (data) {
					$.fancybox.hideActivity();
					if(onSuccess){
						onSuccess(data);
					}
				},
				error: function(data) {
					$.fancybox.hideActivity();
					if(onError){
						onError(data);
					}
				}
			});
		};

		var displayForm = function(lightboxHtml, onComplete) {
			var content = '<div>' + lightboxHtml + '</div>';

			var options = getLightboxOptions(content, onComplete);

			$.fancybox(options);

			return false;
		};

		var displayErrorMessage = function(data) {
			$.fancybox.hideActivity();
            if(data && data.errorMessage){
			    $(alertFormErrorBoxId).html(data.errorMessage).show();
		    }
			else {
				$(alertFormErrorBoxId).html("An error occurred when attempting to save this search").show();
			}
			$.fancybox.resize();
        };

		var setupForm = function(){
			// We don't bind to submit here because IE doesn't bubble submit events.
			$(alertFormId + ' ' + alertFormSubmitButton).die('click.propertyAlerts').live('click.propertyAlerts',function(){
				savePropertyAlert();
				return false;
			});

			$(alertFormId + ' input').die('keydown.propertyAlerts').live('keydown.propertyAlerts',function(e){
				if (e.keyCode == 13) {
					$(alertFormId + " " + alertFormSubmitButton).click();
					return false;
				}
			});

			$(cancelLinkId).die('click.propertyAlerts').live('click.propertyAlerts',function(){
				close();
				return false;
			});

		};

		var savePropertyAlert = function(){
			sendRequest(true,
				function(data) {
					if(data.isSaved){
						onSaved(data);
					}
					else {
						displayForm(data.lightboxHtml, function () {
							if(data.isOverwrite) {
								$.extend(setupSearch, {
									isOverwrite : data.isOverwrite
								});

								bindToOverwriteLinks();
							}
						});
					}
				},
				function(data){
					if(data.errorMessage){
						displayErrorMessage(data.errorMessage);
					}
				}
			);
		};

		var bindToOverwriteLinks = function() {
			$(replaceSearchButton).die('click.propertyAlerts').live('click.propertyAlerts', function(){
				$.extend(setupSearch, {
					isOverwrite : true
				});
				savePropertyAlert();
				return false;
			});

			$(saveAsNewSearchButton).die('click.propertyAlerts').live('click.propertyAlerts', function(){
				$.extend(setupSearch, {
					isOverwrite : false
				});
				savePropertyAlert();
				return false;
			});
		};

		var initSetupSearchData = function (isSubmit) {
			$.extend(setupSearch, {
				frequency : getFrequency(),
				isSubmit : isSubmit,
				fromUrl : window.location.href
			});
		};

		var getFrequency = function(){
			return $(alertFormId + " input:checked[name=frequency]").val();
		};

		var onSaved = function(data){
			close();
			data.justRegistered = justRegistered;
			$(returnObject).trigger("searchSaved", data);
		};

		var close = function(){
			$.fancybox.close();
		};

		var toggleLightboxPreventRedirect  = function (isPreventRedirect){
			accountLightbox.init({
				preventSuccessRedirect : isPreventRedirect,
				preventClose : isPreventRedirect
			}, false);
		};

		var getLightboxOptions = function (content, onComplete){
			return {
				autoScale : true,
				autoDimensions : true,
				content : $(content),

				onComplete: function() {
					$.fancybox.hideActivity();
					setupForm();

					if(onComplete){
						onComplete();
					}
				},
				onClosed : function() {
					$(alertFormErrorBoxId).hide().html("");
					toggleLightboxPreventRedirect(false);
				}
			};
		};

		var	returnObject = {
			show : show,
			close : close,
			attach : attach,
			setupSearch : setupSearch
		};

		return returnObject;
	}();

})();
(function() {
	var USER = RIGHTMOVE.namespace("RIGHTMOVE.USER");
	var UTIL =  RIGHTMOVE.namespace("RIGHTMOVE.UTIL");

	USER.propertyAlerts = function(){
		var savedSearchIdParamName = 'savedSearchId';
		var justRegisteredParamName = 'onetime_justRegistered';
		var justRegisteredSavedSearchParamName = 'onetime_justRegisteredSavedSearch';
		var searchSavedParamName = 'onetime_searchSaved';
		var alertSavedParamName = 'onetime_alertSaved';
		var saveSearchSelector = '#savesearch';

		var init = function(config){
			var element = config.element;
			var channel = config.channel;

			var uri = window.location.href;
			var savedSearchId = UTIL.getUrlParam(uri,savedSearchIdParamName);

			USER.propertyAlertsLightbox.attach({
				element : element,
				saveSearchUrl : window.location.href,
				savedSearchId : savedSearchId,
				saveSearchSelector : saveSearchSelector,
				channel : channel,
				onSaved : function(data) {
					var savedSearchId = data.savedSearchId;

					if(savedSearchId){
						uri = UTIL.setParameter(uri, savedSearchIdParamName, savedSearchId);
					}

					if(data.isSaved){
						if(data.justRegistered){
							uri = UTIL.setParameter(uri, justRegisteredSavedSearchParamName, 'true');
						}

						if (data.frequency !== undefined){
							uri = UTIL.removeParameter(uri, searchSavedParamName);
							uri = UTIL.setParameter(uri, alertSavedParamName, data.frequency);
						}
						else {
							uri = UTIL.removeParameter(uri, alertSavedParamName);
							uri = UTIL.setParameter(uri, searchSavedParamName, 'true');
						}
					}

					if(data.justRegistered) {
						uri = UTIL.setParameter(uri, justRegisteredParamName, 'true');
					}

					window.location.href = uri;
				}
			});
		};

		return {
			init : init
		};
	}();

})();
