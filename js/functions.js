var isLocalhost	= document.location.href.indexOf("http://localhost/") > -1;
var isStaging 	= document.location.href.indexOf("dev.uprise.nl/geositemap") > -1;
var isLive 		= document.location.href.indexOf("http://www.geositemapgenerator") > -1;

//var debug = document.location.href.indexOf("http://localhost") > -1;
var debug = !isLive && (isLocalhost || isStaging);
var online = !isLocalhost && (isLive || isStaging);

var rootUrl = isStaging ? "http://dev.uprise.nl/geositemap" : "http://" + (isLocalhost ? "localhost/" : "www.") + "geositemapgenerator.com";

$(document).ready(function() {
	/* Step 1 - START */
	$("#input-type-csv, #input-type-form").click(function() {
		if($("#input-type-form").attr("checked")) {
			$("#input-form").show();
			$("#input-csv, #csv-format, #csv-example").hide(); 
			
		}
		else {
			$("#input-form").hide();
			$("#input-csv, #csv-format, #csv-example").show(); 
		}
	});
	
	$(".input-col").focus(function() {
		if($(this).hasClass("example")) {
			$(this).removeClass("example").val("");			
		}
	});
	
	updateDescription();
	
	$(".input-col").bind("keyup change", function() {
		updateDescription();
	});
	
	$("#btn-add-location").click(function() { 
		$(".example").val("");
		if(validateInputForm()) {	// validation of forms is in validate.js
			updateDescription();
			addLocation();
		}
	});
	
	$("#btn-save-location").click(function() {
		if(validateInputForm()) {
			updateLocation($("#current-location").val());
		
			$("#btn-save-location").hide();
			$("#btn-add-location").show();
		
			saveLocationToDB("update", $("#current-location").val(), "");
		
			$("#current-location").val($("#nr-locations").val());
			restoreStandardForm($("#description").val());			
		}
	});
	
		
	if($("#is-edit-location").val() != "1") {
		if(true || $.browser.msie) {
			$("#btn-submit-step1").click(function() {
				return submitFormStep1();
			});
		}
		else {
			$("#form-input").submit(function() {

				return submitFormStep1();
			});
		}
	}
	
	$("#btn-resubmit").click(function() {
		if(validateInputForm()) {
			saveLocationToDB("update", $("#current-location").val(), "");
			$("#form-input").submit();
		}
		else {
			return false;
		}
	});
	
	/* Step 1 - END */
	
	/* Step 2 - START */	
	$("#form-details .input").focus(function() {
		if($(this).hasClass("example"))
			$(this).removeClass("example").val("");
	});
	
	$("#kml-filename-edit").click(function() {
		$("#geositemap-url-filename").hide();
		$("#kml-filename").show().select();
	});
	
	$("#kml-filename").change(validateStep2);
	
	$("#geositemap-url").change(function() {
		if($("#kml-website").val() == "") {
			$("#kml-website").val($(this).val());
		}
	});
	
	$("#btn-submit-step2").click(function() {
		if(validateStep2())
			$("#show-submit-step2").fadeIn();
		
		return false;
	});
	
	$("#step2-choice-download, #step2-choice-email").click(function() {
		removeErrorMsg("2b");
		if($("#step2-choice-email").attr("checked"))
			$("#step2-show-submit-email").slideDown();
		else
			$("#step2-show-submit-email").slideUp();
	});	
	
	$("#step2-choice-submit").click(function() {
		var radio = $("input:radio[@name=step2-choice]:checked").val();
		if(radio == "download") {
			$("#form-details .example").val("");
			$("#form-details").submit();
		}
		else if(radio == "email") {
			if($("#submit-step2-email").val() == "") {
				errorMsg("Please enter your email address.", "2b");
				return false;
			}
			else if(!validateEmail($("#submit-step2-email").val())) {
				errorMsg("Please a valid email address.", "2b");
				return false;
			}
			else {
				$("#form-details .example").val("");
				$("#form-details").submit();
			}
		}
		else {
			errorMsg("Please make a choice.", "2b");
			return false;
		}
	});
	/* Step 2 - END */
	
	/* Step 3 - START */
	$('#show-html, #show-html-locations').change(function() {
		var value = $('#show-html').val();
		var nr = $('#show-html-locations').val();
		var length = $('#nr-locations').val();
		
		for(var i=0; i<length; i++) {
			if(i != nr) {
				$('#html-schema-' + i + ', #html-microformats-' + i).hide();
			}
			else {
				if(value == 'schema') {
					$('#html-schema-' + i).show();
					$('#html-microformats-' + i + ', #show-html .item-').hide();
				}
				else if(value == 'microformats') {
					$('#html-schema-' + i).hide();
					$('#html-microformats-' + i).show();
				}
			}
		}
	});

	/* Step 3 - END */
	
	/* General - START */
	$("#nav-top li a, .tooltip").tooltip({
		track: true,
		delay: 0,
		showURL: false,
		showBody: ": ",
		fade: 250
	});
	
	/* General - END */
});

function submitFormStep1() {
	if(!isInputFormEmpty()) {
		var answer = confirm("You have not added the current location yet. All changes will be lost. Do you want to proceed?");
		if(!answer)
			return false;
	}
	else {
		$("#form-input").submit();
	}
}

function updateDescription() {
	$("#description-preview").html(convertVariables($("#description").val()));
}
function editDescription() {
	$("#description-preview, #description-edit").hide();
	$("#description, #description-instruction").show();
}
function saveDescription() {
	$("#description, #description-instruction").hide();
	$("#description-preview, #description-edit").show();
}


function addLocation() {

	removeErrorMsg();
	$("#location-basket").show();
	
	var nrLocations = $("#nr-locations").val();
	$(addLocationParagraph(nrLocations)).appendTo("#location-basket-table");
	$("#location-" + nrLocations).css("background", "#fff");
	if($.browser.msie) {
		$("#location-" + nrLocations).show();
	}
	else {
		$("#location-" + nrLocations).fadeIn("fast");
	}
	
	$("#nr-locations").val((1*nrLocations)+1);
	$("#current-location").val((1*nrLocations)+1);
	saveLocationToDB("add", nrLocations, "");
}

function addLocationParagraph(nrLocations) {
	var locationParagraph = "<tr id='location-" + nrLocations + "' class='invisible'>\n";
	locationParagraph += "\t<td>" + $("#name").val() + "</td>\n";
	locationParagraph += "\t<td>";
	locationParagraph += $("#address").val() + ", ";
	locationParagraph += $("#zipcode").val() + " ";
	locationParagraph += $("#city").val() + " ";
	locationParagraph += "(" + $("#country option[value='" + $("#country").val() + "']:first").text() + ")";
	locationParagraph += "</td>\n";
	locationParagraph += "\t<td><a href='javascript:editLocation(" + nrLocations + ");' title='Edit this location'><img src='images/edit.png' alt='Edit this location'></a></td>\n";
	locationParagraph += "\t<td><a href='javascript:removeLocation(" + nrLocations + ");' title='Remove this location'><img src='images/remove.png' alt='Remove this location'></a></td>\n";
	locationParagraph += "</tr>\n";

	return locationParagraph;
}

function editLocation(nrLocation) {
	$(".example").removeClass("example");
	fillForm(nrLocation);
	showLocation(nrLocation);
	$("#current-location").val(nrLocation);
	$("#btn-save-location").show();
	$("#btn-add-location").hide();
}

function fillForm(nrLocation) {
	// Get JSON data form DB
	$.post(
		rootUrl + "/location",
		{action:"get", location_nr:nrLocation},
		function(data) {
			var jsonObj = $.toJSON(data);
			
			// Fill form
			$("#name").val($.evalJSON(jsonObj).name);
			$("#address").val($.evalJSON(jsonObj).address);
			$("#city").val($.evalJSON(jsonObj).city);
			$("#zipcode").val($.evalJSON(jsonObj).zipcode);
			$("#state").val($.evalJSON(jsonObj).state);
			$("#country").val($.evalJSON(jsonObj).country);
			$("#phone").val($.evalJSON(jsonObj).phone);
			$("#description").val($.evalJSON(jsonObj).description);
			
			$("#btn-save-location").show();
			$("#btn-add-location").hide();
			
			updateDescription();
		},
		"json"
	);
}

function updateLocation(nrLocation) {
	$("#location-" + nrLocation).replaceWith(addLocationParagraph(nrLocation));
	$("#location-" + nrLocation).show();
}

function clearForm(description) {
	$(".input-col").val("");
	$("#description").val(description);
}

function restoreStandardForm(description) {
	$(".input-col:not(#country, #description)").val("").addClass("example");
	
	$("#name").val("Your business name");
	$("#address").val("Your address");
	$("#city").val("Your city");
	$("#state").val("OR");
	$("#zipcode").val("12345");
	$("#country").val("US");
	$("#phone").val("(123) 456-7890");
	$("#description").val(description);
	
	saveDescription();
	updateDescription();
}

function hideLocation(nrLocation) {
	$("#name-" + nrLocation).hide();
	$("#address-" + nrLocation).hide();
	$("#zipcode-" + nrLocation).hide();
	$("#city-" + nrLocation).hide();
	$("#state-" + nrLocation).hide();
	$("#country-" + nrLocation).hide();
	$("#phone-" + nrLocation).hide();
	$("#description-" + nrLocation).hide();
}

function showLocation(nrLocation) {
	$("#name-" + nrLocation).show();
	$("#address-" + nrLocation).show();
	$("#zipcode-" + nrLocation).show();
	$("#city-" + nrLocation).show();
	$("#state-" + nrLocation).show();
	$("#country-" + nrLocation).show();
	$("#phone-" + nrLocation).show();
	$("#description-" + nrLocation).show();
}

function removeLocation(nrLocation, reload) {
	if(confirm("Are you sure to delete this location? This action cannot be undone.")) {
		// Need this callback function to not cancel the hide() request	
		$("#location-" + nrLocation).animate({ opacity: 'hide' }, "fast", function() {
			$("#location-" + nrLocation).remove();
		});
	
		showLocation($("#nr-locations").val());	
		
		if(reload)
			saveLocationToDB("delete", nrLocation, "generate");
		else
			saveLocationToDB("delete", nrLocation, "");
	}
}

function removeAllLocations(gotoLoc) {
	if(confirm("Are you sure you want to delete all the current locations? This action cannot be undone.")) {
		saveLocationToDB("deleteAll", -1, gotoLoc);
	}
}

function saveLocationToDB(action, nrLocations, gotoLoc) {
	var data = "action=" + action;

	if(action != "deleteAll") {
		data += "&location_nr=" + nrLocations;
		
		if(action != "delete") {
			data += "&name=" + $("#name").val() + "&" +
					"address=" + $("#address").val() + "&" +
					"zipcode=" + $("#zipcode").val() + "&" +
					"city=" + $("#city").val() + "&" +
					"state=" + $("#state").val() + "&" +
					"country=" + $("#country").val() + "&" +
					"phone=" + $("#phone").val() + "&" +
					"description=" + $("#description").val();
		}
	}
			
	$.ajax({
    	type: "POST",
	    url: rootUrl + "/location",
	    data: data,
		success: function(msg) {
			if(gotoLoc != "") {
				window.location = rootUrl + "/" + gotoLoc;
			}
			else {
				restoreStandardForm($("#description").val());
			}
		},		
		error: function (XMLHttpRequest, textStatus, errorThrown) { 
			//console.log("Error (" + textStatus + "): " + errorThrown);
		}
	});
}

function copyElement(element, name, oldLocation, newLocation) {
	// Copy element
	$("#" + name + "-" + oldLocation).clone().appendTo($("#" + name + "-" + oldLocation).parent());
	
	// Give new element new ID and NAME attributes
	var elArr = new Array();
	var elements = $("#input-form " + element);
	for(var i=0; i<elements.length; i++) {
		if(elements[i].name.indexOf(name) > -1)
			elArr.push(elements[i]);
	}
	
	var lastSelect = elArr[newLocation-1];
	$(lastSelect).attr("name", name + "-" + newLocation);
	$(lastSelect).attr("id", name + "-" + newLocation);
	$(lastSelect).val("");
	$(lastSelect).removeClass("input-col-" + oldLocation);
	$(lastSelect).addClass("input-col-" + newLocation);
	if($(lastSelect).hasClass("required-" + oldLocation)) {
		$(lastSelect).removeClass("required-" + oldLocation);
		$(lastSelect).addClass("required-" + newLocation);
	}
	$("#" + name + "-" + oldLocation).hide();
}

function hideObject(objName) {
	$("#" + objName).fadeOut();
}

function removeElement(divNum) { 
	var oldDiv = document.getElementById(divNum);
	var parentDiv = oldDiv.parentNode;  
	parentDiv.removeChild(oldDiv); 
}

function show_output_map(coords) {
	var map = new GMap2(document.getElementById("maps-output"));
	map.addControl(new GLargeMapControl());
	map.addControl(new GMapTypeControl());
	map.addMapType(G_NORMAL_MAP);
	
	var bounds = new GLatLngBounds(); 
	for(var i=0; i<coords.length; i++) {
		var latLong = new GLatLng(coords[i][0], coords[i][1]);
		var marker = new GMarker(latLong, {clickable: true});
		map.addOverlay(marker);
		bounds.extend(latLong);
	};

	map.setCenter(bounds.getCenter(), map.getBoundsZoomLevel(bounds)-1);
}

function addToFavorites() {  
    var title = document.title; var url = location.href;  
    if (window.sidebar) // Firefox  
        window.sidebar.addPanel(title, url, '');  
    else if(window.opera && window.print) {// Opera  
        var elem = document.createElement('a');  
        elem.setAttribute('href',url);  
        elem.setAttribute('title',title);  
        elem.setAttribute('rel','sidebar'); // required to work in opera 7+  
        elem.click();  
    }   
    else if(document.all) // IE  
        window.external.AddFavorite(url, title);  
}

function convertVariables(value) {
	if(typeof(value) != "undefined") {
		var inputArr = new Array("name", "address", "city", "state", "zipcode", "country", "phone");
	
		for(var i in inputArr) {
			var tmpVal = $("#" + inputArr[i]).val();
			if(inputArr[i] == "country")
				tmpVal = getCountry(tmpVal);
			value = value.replace("{" + inputArr[i] + "}", tmpVal);
		}
	}
	else {
		value = "";
	}
	return value;
}

function insertAtCaret(elemId, text) {
	var activeEl = document.getElementById(elemId);
	var scrollPos = activeEl.scrollTop;
	var strPos = 0;
	var br = ((activeEl.selectionStart || activeEl.selectionStart == '0') ? "ff": (document.selection ? "ie": false));
	if (br == "ie") {
	    activeEl.focus();
	    var range = document.selection.createRange();
	    range.moveStart('character', -activeEl.value.length);
	    strPos = range.text.length;
	} 
	else if (br == "ff") {
		strPos = activeEl.selectionStart;
	}
	var front = activeEl.value.substring(0, strPos);
	var back = activeEl.value.substring(strPos, activeEl.value.length);
	activeEl.value = front + text + back;
	strPos = strPos + text.length;
	if (br == "ie") {
	    activeEl.focus();
	    var range = document.selection.createRange();
	    range.moveStart('character', -activeEl.value.length);
	    range.moveStart('character', strPos);
	    range.moveEnd('character', 0);
	    range.select();
	} else if (br == "ff") {
	    activeEl.selectionStart = strPos;
	    activeEl.selectionEnd = strPos;
	    activeEl.focus();
	}
	activeEl.scrollTop = scrollPos;
}

function getCountry(countryCode) {
	var countries = new Array();
	countries["AF"] = "Afghanistan"; countries["AL"] = "Albania"; countries["DZ"] = "Algeria"; countries["AS"] = "American Samoa"; countries["AD"] = "Andorra"; countries["AO"] = "Angola"; countries["AI"] = "Anguilla"; countries["AQ"] = "Antarctica"; countries["AG"] = "Antigua And Barbuda"; countries["AR"] = "Argentina"; countries["AM"] = "Armenia"; countries["AW"] = "Aruba"; countries["AU"] = "Australia"; countries["AT"] = "Austria"; countries["AZ"] = "Azerbaijan"; countries["BS"] = "Bahamas"; countries["BH"] = "Bahrain"; countries["BD"] = "Bangladesh"; countries["BB"] = "Barbados"; countries["BY"] = "Belarus"; countries["BE"] = "Belgium"; countries["BZ"] = "Belize"; countries["BJ"] = "Benin"; countries["BM"] = "Bermuda"; countries["BT"] = "Bhutan"; countries["BO"] = "Bolivia"; countries["BA"] = "Bosnia And Herzegovina"; countries["BW"] = "Botswana"; countries["BV"] = "Bouvet Island"; countries["BR"] = "Brazil"; countries["IO"] = "British Indian Ocean Territory"; countries["BN"] = "Brunei"; countries["BG"] = "Bulgaria"; countries["BF"] = "Burkina Faso"; countries["BI"] = "Burundi"; countries["KH"] = "Cambodia"; countries["CM"] = "Cameroon"; countries["CA"] = "Canada"; countries["CV"] = "Cape Verde"; countries["KY"] = "Cayman Islands"; countries["CF"] = "Central African Republic"; countries["TD"] = "Chad"; countries["CL"] = "Chile"; countries["CN"] = "China"; countries["CX"] = "Christmas Island"; countries["CC"] = "Cocos (Keeling) Islands"; countries["CO"] = "Columbia"; countries["KM"] = "Comoros"; countries["CG"] = "Congo"; countries["CK"] = "Cook Islands"; countries["CR"] = "Costa Rica"; countries["CI"] = "Cote D'Ivorie (Ivory Coast)"; countries["HR"] = "Croatia (Hrvatska)"; countries["CU"] = "Cuba"; countries["CY"] = "Cyprus"; countries["CZ"] = "Czech Republic"; countries["CD"] = "Democratic Republic Of Congo (Zaire)"; countries["DK"] = "Denmark"; countries["DJ"] = "Djibouti"; countries["DM"] = "Dominica"; countries["DO"] = "Dominican Republic"; countries["TP"] = "East Timor"; countries["EC"] = "Ecuador"; countries["EG"] = "Egypt"; countries["SV"] = "El Salvador"; countries["GQ"] = "Equatorial Guinea"; countries["ER"] = "Eritrea"; countries["EE"] = "Estonia"; countries["ET"] = "Ethiopia"; countries["FK"] = "Falkland Islands (Malvinas)"; countries["FO"] = "Faroe Islands"; countries["FJ"] = "Fiji"; countries["FI"] = "Finland"; countries["FR"] = "France"; countries["FX"] = "France, Metropolitan"; countries["GF"] = "French Guinea"; countries["PF"] = "French Polynesia"; countries["TF"] = "French Southern Territories"; countries["GA"] = "Gabon"; countries["GM"] = "Gambia"; countries["GE"] = "Georgia"; countries["DE"] = "Germany"; countries["GH"] = "Ghana"; countries["GI"] = "Gibraltar"; countries["GR"] = "Greece"; countries["GL"] = "Greenland"; countries["GD"] = "Grenada"; countries["GP"] = "Guadeloupe"; countries["GU"] = "Guam"; countries["GT"] = "Guatemala"; countries["GN"] = "Guinea"; countries["GW"] = "Guinea-Bissau"; countries["GY"] = "Guyana"; countries["HT"] = "Haiti"; countries["HM"] = "Heard And McDonald Islands"; countries["HN"] = "Honduras"; countries["HK"] = "Hong Kong"; countries["HU"] = "Hungary"; countries["IS"] = "Iceland"; countries["IN"] = "India"; countries["ID"] = "Indonesia"; countries["IR"] = "Iran"; countries["IQ"] = "Iraq"; countries["IE"] = "Ireland"; countries["IL"] = "Israel"; countries["IT"] = "Italy"; countries["JM"] = "Jamaica"; countries["JP"] = "Japan"; countries["JO"] = "Jordan"; countries["KZ"] = "Kazakhstan"; countries["KE"] = "Kenya"; countries["KI"] = "Kiribati"; countries["KW"] = "Kuwait"; countries["KG"] = "Kyrgyzstan"; countries["LA"] = "Laos"; countries["LV"] = "Latvia"; countries["LB"] = "Lebanon"; countries["LS"] = "Lesotho"; countries["LR"] = "Liberia"; countries["LY"] = "Libya"; countries["LI"] = "Liechtenstein"; countries["LT"] = "Lithuania"; countries["LU"] = "Luxembourg"; countries["MO"] = "Macau"; countries["MK"] = "Macedonia"; countries["MG"] = "Madagascar"; countries["MW"] = "Malawi"; countries["MY"] = "Malaysia"; countries["MV"] = "Maldives"; countries["ML"] = "Mali"; countries["MT"] = "Malta"; countries["MH"] = "Marshall Islands"; countries["MQ"] = "Martinique"; countries["MR"] = "Mauritania"; countries["MU"] = "Mauritius"; countries["YT"] = "Mayotte"; countries["MX"] = "Mexico"; countries["FM"] = "Micronesia"; countries["MD"] = "Moldova"; countries["MC"] = "Monaco"; countries["MN"] = "Mongolia"; countries["MS"] = "Montserrat"; countries["MA"] = "Morocco"; countries["MZ"] = "Mozambique"; countries["MM"] = "Myanmar (Burma)"; countries["NA"] = "Namibia"; countries["NR"] = "Nauru"; countries["NP"] = "Nepal"; countries["NL"] = "Netherlands"; countries["AN"] = "Netherlands Antilles"; countries["NC"] = "New Caledonia"; countries["NZ"] = "New Zealand"; countries["NI"] = "Nicaragua"; countries["NE"] = "Niger"; countries["NG"] = "Nigeria"; countries["NU"] = "Niue"; countries["NF"] = "Norfolk Island"; countries["KP"] = "North Korea"; countries["MP"] = "Northern Mariana Islands"; countries["NO"] = "Norway"; countries["OM"] = "Oman"; countries["PK"] = "Pakistan"; countries["PW"] = "Palau"; countries["PA"] = "Panama"; countries["PG"] = "Papua New Guinea"; countries["PY"] = "Paraguay"; countries["PE"] = "Peru"; countries["PH"] = "Philippines"; countries["PN"] = "Pitcairn"; countries["PL"] = "Poland"; countries["PT"] = "Portugal"; countries["PR"] = "Puerto Rico"; countries["QA"] = "Qatar"; countries["RE"] = "Reunion"; countries["RO"] = "Romania"; countries["RU"] = "Russia"; countries["RW"] = "Rwanda"; countries["SH"] = "Saint Helena"; countries["KN"] = "Saint Kitts And Nevis"; countries["LC"] = "Saint Lucia"; countries["PM"] = "Saint Pierre And Miquelon"; countries["VC"] = "Saint Vincent And The Grenadines"; countries["SM"] = "San Marino"; countries["ST"] = "Sao Tome And Principe"; countries["SA"] = "Saudi Arabia"; countries["SN"] = "Senegal"; countries["SC"] = "Seychelles"; countries["SL"] = "Sierra Leone"; countries["SG"] = "Singapore"; countries["SK"] = "Slovak Republic"; countries["SI"] = "Slovenia"; countries["SB"] = "Solomon Islands"; countries["SO"] = "Somalia"; countries["ZA"] = "South Africa"; countries["GS"] = "South Georgia And South Sandwich Islands"; countries["KR"] = "South Korea"; countries["ES"] = "Spain"; countries["LK"] = "Sri Lanka"; countries["SD"] = "Sudan"; countries["SR"] = "Suriname"; countries["SJ"] = "Svalbard And Jan Mayen"; countries["SZ"] = "Swaziland"; countries["SE"] = "Sweden"; countries["CH"] = "Switzerland"; countries["SY"] = "Syria"; countries["TW"] = "Taiwan"; countries["TJ"] = "Tajikistan"; countries["TZ"] = "Tanzania"; countries["TH"] = "Thailand"; countries["TG"] = "Togo"; countries["TK"] = "Tokelau"; countries["TO"] = "Tonga"; countries["TT"] = "Trinidad And Tobago"; countries["TN"] = "Tunisia"; countries["TR"] = "Turkey"; countries["TM"] = "Turkmenistan"; countries["TC"] = "Turks And Caicos Islands"; countries["TV"] = "Tuvalu"; countries["UG"] = "Uganda"; countries["UA"] = "Ukraine"; countries["AE"] = "United Arab Emirates"; countries["UK"] = "United Kingdom"; countries["US"] = "United States"; countries["UM"] = "United States Minor Outlying Islands"; countries["UY"] = "Uruguay"; countries["UZ"] = "Uzbekistan"; countries["VU"] = "Vanuatu"; countries["VA"] = "Vatican City (Holy See)"; countries["VE"] = "Venezuela"; countries["VN"] = "Vietnam"; countries["VG"] = "Virgin Islands (British)"; countries["VI"] = "Virgin Islands (US)"; countries["WF"] = "Wallis And Futuna Islands"; countries["EH"] = "Western Sahara"; countries["WS"] = "Western Samoa"; countries["YE"] = "Yemen"; countries["YU"] = "Yugoslavia"; countries["ZM"] = "Zambia"; countries["ZW"] = "Zimbabwe"; 
	return countries[countryCode];
}