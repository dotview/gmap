/*
 * jQuery MapPin plugin 1.0
 *
 * Copyright (c) 2011 dotview
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
settings:
			markerImage:			'http://maps.google.com/mapfiles/ms/micons/grn-pushpin.png',//pin icon
			fadeInSpeed:			'slow',//fade in effect Speed, A string or number
			fadeOutSpeed:		'slow',//fade out effect Speed, A string or number
			messageFadeOutDuration: 	3000, //the result message will disappear [messageFadeOutDuration] later
			pinFadeOutDuration	: 	600, // when remove the pin [pinFadeOutDuration] later will disappear on the map
			processBarStyles:   	{},	 //process bar styles
			newPinUrl:				'data/addAPin2.json', //new pin server url
			removePinUrl:			'data/removeApin.json',//remove pin server url
			pinListUrl:				'data/existingDestination.json'//get pin list server url
			mapOptions:{
				zoom: 6,		//default google map zoom value
				center: new google.maps.LatLng(33.65972,-85.58) // default google map center
				....   //other google map settings
			}
example:	
    $("#map_canvas").mapPin({
		markerImage:'images/branch.png',
		messageFadeOutDuration: 3000,
		processBarStyles:{top:0,left:0},//position relative to parent
		mapOptions:{
			zoom: 6,
			center: new google.maps.LatLng(33.65972,-85.58),
			mapTypeId:google.maps.MapTypeId.ROADMAP
		}
	});
 *     
 */
 
$.fn.extend({
	mapPin: function(setting) {
		//default options
		var options = $.extend({
			markerImage:			'images/mapPin.png',//pin icon
			fadeInSpeed:			'slow',//fade in effect Speed, A string or number
			fadeOutSpeed:		'slow',//fade out effect Speed, A string or number
			messageFadeOutDuration: 	3000, //the result message will disappear [messageFadeOutDuration] later
			pinFadeOutDuration	: 		600, // when remove the pin (pinFadeOutDuration] later will disappear on the map
			processBarStyles:   	{},	 //process bar styles	
			newPinUrl:				'data/addAPin2.json', //new pin server url
			removePinUrl:			'data/removeAPin.json',//remove pin server url
			pinListUrl:				'data/existingDestination.json'//get pin list server url
		}, setting);
		
		//local variable
		var map;
		var curMarker;
		var infowindow;
		var projection;
		var setmarker;
		var infowindow;
		var markerImage = options.markerImage;
		var destMarker = new Array();
		var helper = new google.maps.OverlayView();
		var geocoder = new google.maps.Geocoder();
		var inputLocName;
		var divProcessResult;
		/*
		* init map and register the events
		*/
		function initialize(obj) {
			var mapLatlng = new google.maps.LatLng(38.22,-85.58);
			var mapOptions = {
				zoom: 4,
				center: mapLatlng,
				mapTypeId: google.maps.MapTypeId.ROADMAP,
				mapTypeControl: true,
				navigationControl: true,
				scaleControl: true,
				streetViewControl: false,
				scrollwheel: true
			};
			mapOptions= $.extend(mapOptions,options.mapOptions);
			map = new google.maps.Map(obj[0], mapOptions);

			helper.setMap(map);
			helper.draw = function () { 
				if (!this.ready) { 
					this.ready = true; 
					google.maps.event.trigger(this, 'ready'); 
				} 	
			}; 
			$("#buttonBeenHere").click(function(){
				NewMapPin();
			});
			$("#removeMarker").click(function(){
				removeMapPin();
			});
			
			google.maps.event.addListener(map, 'zoom_changed', function () {
				updatePos(false);
			});
			google.maps.event.addListener(map, 'drag', function () {
				updatePos(false);
			});
			google.maps.event.addListener(map, 'idle', function () {
				updatePos(false);
			});
			$(".close").click(function(){
				$(this).parent().parent().parent().parent().parent().fadeOut();
			});
			
			inputLocName = $("#accommodationName");
			inputLocName.focus(function(){
				if(inputLocName.val()=="hotel/attraction,city,state"){
				inputLocName.val("");}
			}).blur(function(){
				if(inputLocName.val()==""){
				inputLocName.val("hotel/attraction,city,state");
				}
			});
			
			infowindow = $("#mapTooltip2");
			
			showProcess();
			
			getPinList();
		}
		 
		/*
		* update the popup location when click another pin
		*/
		function updatePos(isNew){
			if(!curMarker) return;
			if(!map.getBounds().contains(curMarker.getPosition())){
				infowindow.fadeOut(options.fadeOutSpeed);
				return;
			}
			projection = helper.getProjection();
			var p =  projection.fromLatLngToContainerPixel(curMarker.getPosition());
			infowindow.css({top:p.y-58,left:p.x+20});
			if(isNew){
				$("#hinweistip-title").html(curMarker.title);
				$("#hinweistip-content").html(curMarker.content);
				infowindow.fadeIn(options.fadeInSpeed);
			}
		}
		/*
		* show process div or result div
		*/
		function showProcess(html){
			if(!divProcessResult){
				divProcessResult=$("<div class=\"divProcessResult\"></div>");
				divProcessResult.css(options.processBarStyles);
				divProcessResult.appendTo(".map-container");
			}
			var _html;
			  _html = html==null? '<img src="images/loadingStripes.gif">' :"<div style='padding:0px 12px;height:50px;line-height:50px;width:auto;margin:0 auto;text-align:center;'>"+html+"</div>";
			 
			divProcessResult.html(_html).fadeIn(options.fadeInSpeed);

			if(!html){
				setTimeout(function(){
					divProcessResult.fadeOut(options.fadeOutSpeed);	
				},options.messageFadeOutDuration);
			}
		}
		/*
		* search google map and return location
		*/
		function MapSearch(address,callback) {
			if (address == "") {return;}
			if (geocoder) {
				geocoder.geocode({ 'address': address }, function(results, status) {
					if (status == google.maps.GeocoderStatus.OK) {
						map.setCenter(results[0].geometry.location);
						if (setmarker == null) {
							setmarker = new google.maps.Marker({
								map: map,
								position: results[0].geometry.location
							}); 
							map.setZoom(11);
							 
						}
						else {
							setmarker.setPosition(results[0].geometry.location);
						}
						if(callback!=null){
							callback(results[0]);
						}
					} else {
						alert("Can not find the place: " + address + " ");
					}
				});
			}
		}
		/*
		* get pins list from server using ajax and show pins on the map
		*/
		var getPinList = function() {
			if (destMarker.length > 0)
				return;
			for (var j in destMarker) {
				destMarker[j].setMap(null);
			}
			
			$.ajax({
				type: "GET",
				url: options.pinListUrl,
				cache: true,
				success: function (data) {
					dests = data.userDestinations;

					$.each(dests, function (i) {
						var dest = dests[i];
						var latlng = new google.maps.LatLng(dest.latitude, dest.longitude);
						destMarker[i] = new google.maps.Marker({
							position: latlng,
							map: map,
							title: dest.name,
							icon: markerImage,
							//animation: google.maps.Animation.DROP
							visible:false
							//zIndex: -10
						});
					   destMarker[i].title= dest.name;
					   destMarker[i].content="<div><p>Name:"+dest.name+"</p></div>";
					   destMarker[i].destinationId = dest.destinationId;
					   
						google.maps.event.addListener(destMarker[i], 'click', function () {
							curMarker =  destMarker[i];
							updatePos(true);
						});
					});
			 
					for(j=0;j<destMarker.length;j++){
						(function(k){
							setTimeout(function(){
								if(destMarker[k]){
									destMarker[k].setVisible(true);
									destMarker[k].setAnimation(google.maps.Animation.DROP);
								}	
							},k*50);
						})(j);
					}
					divProcessResult.hide();
				},
				error: function (d) {
					//alert("fail to search!please try again!");
				},
				dataType: "json"
			});
			
			
		}
		/*
		* add pins
		*/
		var NewMapPin=function(){
			if($("#accommodationName").val()==""||$("#accommodationId").val()==""){ return;}
			showProcess();
			
			$.ajax({
				type: "GET",
				url: options.newPinUrl,
				data: {id:$("#accommodationId").val()},
				success: function (data) {
					 var dest = data.userDestinations[0];
						var latlng = new google.maps.LatLng(dest.latitude, dest.longitude);
						var marker = new google.maps.Marker({
							position: latlng,
							map: map,
							title: dest.name,
							icon: markerImage,
							animation: google.maps.Animation.DROP,
							visible:true
						});
					   marker.title= dest.name;
					   marker.content="<div><p>Name:"+dest.name+"</p></div>";
					   marker.destinationId = dest.destinationId;
						google.maps.event.addListener(marker, 'click', function () {
							curMarker =  marker;
							updatePos(true);
						});
						 map.setCenter(latlng);
						destMarker.push(marker);
						
					setTimeout(function(){
						$("#accommodationName").val("hotel/attraction,city,state");
						$("#accommodationId").val("") ;
						showProcess("Destination Added!");
						
					},options.pinFadeOutDuration);
					 
				},
				error: function (d) {
					 
				},
				dataType: "json"
			});
		}
		/*
		* remove pin from the map
		*/
		var removeMapPin=function(){
			if(curMarker==null) {return;}
			showProcess();
			
			$.ajax({
				type: "GET",
				url: options.removePinUrl,
				data: {destinationId:curMarker.destinationId},
				success: function (data) {
					if(data.result=="true"){
					setTimeout(function(){
						curMarker.setMap(null);
						showProcess("Destination Removed!");
						infowindow.fadeOut(options.pinFadeOutDuration);
					},options.pinFadeOutDuration );
					}
				},
				error: function (d) {
					 
				},
				dataType: "json"
			});
		}
		return initialize(this);
	}
});
 
 