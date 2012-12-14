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
			autoCompleteUrl:		'data/autoComplete.json',//auto complete url
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
(function(){
    // remove layerX and layerY
    var all = $.event.props,
        len = all.length,
        res = [];
    while (len--) {
      var el = all[len];
      if (el != 'layerX' && el != 'layerY') res.push(el);
    }
    $.event.props = res;
}());
$.fn.extend({
	mapPin: function(setting) {
		//default options
		var options = $.extend({
			tabObject:				null,//null or does not need this param,pass the tab object so that when change the tabs,the plugin will resize the map
			markerImage:			'images/mapPin.png',//pin icon
			fadeInSpeed:			'slow',//fade in effect Speed, A string or number
			fadeOutSpeed:			'slow',//fade out effect Speed, A string or number
			messageFadeOutDuration: 	3000, //the result message will disappear [messageFadeOutDuration] later
			pinFadeOutDuration	: 		600, // when remove the pin (pinFadeOutDuration] later will disappear on the map
			processBarStyles:   	{},	 //process bar styles	
			autoCompleteUrl:		'data/autoComplete.json',//auto complete url
			newPinUrl:				'data/addAPin2.json', //new pin server url
			removePinUrl:			'data/removeAPin.json',//remove pin server url
			pinListUrl:				'data/existingDestination.json',//get pin list server url
			tabShowCallback:		{}
		}, setting);
		
		var tabObject = options.tabObject;
		if(tabObject!=null){
			tabObject.bind('tabsshow',function(event, ui) {
				ui.panel.children[0].RefreshMap();	// first children in tab panel,if not,should modify the index of chlidren array.
			});
		}
			
		return this.each(function(){
		//local variable
		var map;
		var curMarker;
		var infowindow;
		var projection;
		var setmarker;
		var markerImage = options.markerImage;
		var destMarker = new Array();
		var helper = new google.maps.OverlayView();
		var geocoder = new google.maps.Geocoder();
		
		var divProcessResult;
		var self;
		var ctrlPanel;
		var accommodationId;
		var accommodationName;
		var mapTooltip;
		var mapTooltip2;
		var tabObject = options.tabObject;
		/*
		* init map and register the events
		*/
		function initialize(obj) {
			self = obj;
			var mapcanvas = $("<div class='map'></div>");
			mapcanvas.appendTo(obj);
			$("body").append('<div class="preloadSprite"></div>	');
			
			mapTooltip = $('<div class="hinweis-bottom-rounded hinweistip-rounded mapTooltip">'
							+'<div style="overflow: visible; height: auto;" class="hinweistip-outer">'
							+'	<div class="hinweistip-inner">'
							+'		<div class="fTop"><div class="hinweistip-title">Add a destination to your map</div> <div class="hinweistip-close"><a class="close"></a></div></div>'
							+'		<div class="mapTooltipInner">'
							+'		<div class="hininnerSubtitle">Select Destination</div>'
							+'		<div class="hininnerInput"></div>'
							+'			<div style="float:left;margin: 4px;">	'
							+'				<a class="buttonClass2A buttonBeenHere">'
							+'					<div class="identifier">Been here</div> '
							+'					<div class="statusBox5097">21</div>'
							+'					<div class="clear"></div>'
							+'				</a>	'
							+'			</div>	'
							+'		</div>'
							+'	</div>'
							+'</div>'
							+'<div class="hinweistip-extra"></div>'
							+'<div style="z-index: 98; display: block;" class="hinweistip-arrows"></div>'
							+'</div>');
			
			accommodationId = $('<input type="hidden"  name="review.accommodation.accommodationId" />');
			accommodationName = $('<input type="text" class="hininput" value="hotel/attraction,city,state"/>');
			
			accommodationId.appendTo($(".hininnerInput",mapTooltip));
			accommodationName.appendTo($(".hininnerInput",mapTooltip));

			mapTooltip.hide();
			mapTooltip.appendTo("body");
			
			mapTooltip2 = $('<div class="hinweis-right-rounded hinweistip-rounded mapTooltip2">'
						+'<div style="overflow: visible; height: auto;">'
						+'	<div class="hinweistip-inner">'
						+'		<div class="fTop"><div class="hinweistip-title"></div> <div class="hinweistip-close"><a class="close"></a></div></div>'
						+'		<div class="hinweistip-content">'
						+'		</div>'
						+'		<div class="hinctrlpanel">'
						+'		<a class="removeMarker">Remove this destination</a> </div>'
						+'	</div>'
						+'</div>'
						+'<div class="hinweistip-extra"></div>'
						+'<div style="z-index: 98; display: block;"  class="hinweistip-arrows"></div>'
						+'</div>');
			
			mapTooltip2.hide();
			mapTooltip2.appendTo("body");
			
			ctrlPanel =$('<div class="ctrlPanel"><a><div class="statusBoxplus"> + </div><div class="identifier">Add more destinations</div> <div class="clear"></div></a></div> ');
			ctrlPanel.appendTo(obj); 
			
			ctrlPanel.click(function(e){
				bindOverlay(ctrlPanel);	
			});
			$(window).resize(function() {
				refreshTooltipPos();
				updatePos(false);
			});	
			$("a.buttonClass2A",mapTooltip).bind("click",function(e){
					NewMapPin();
			});
			$("a.removeMarker",mapTooltip2).bind("click",function(e){
					removeMapPin();
			});
			
			accommodationName.autocomplete({
				source: options.autoCompleteUrl,
				minLength: 2,
				select: function(event, ui) {
					if(ui.item) {
						accommodationId.val(ui.item.id);
					}
				},
				change: function(event, ui) {
					if(ui.item) {
						accommodationId.val(ui.item.id);
					} else {
						accommodationId.val("");
					}
				}
			});
			
			//init map 
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
			self.mapOptions=mapOptions;
			map = new google.maps.Map(mapcanvas[0], mapOptions);

			helper.setMap(map);
			helper.draw = function () { 
				if (!this.ready) { 
					this.ready = true; 
					google.maps.event.trigger(this, 'ready'); 
				} 	
			}; 
			
			
			google.maps.event.addListener(map, 'zoom_changed', function () {
				updatePos(false);
			});
			google.maps.event.addListener(map, 'drag', function () {
				updatePos(false);
			});
			google.maps.event.addListener(map, 'idle', function () {
				updatePos(false);
			});
			$(".close").bind("click",function(){
				$(this).parent().parent().parent().parent().parent().fadeOut();
			});
			
			infowindow = mapTooltip2;

		
			accommodationName.focus(function(){
				if(accommodationName.val()=="hotel/attraction,city,state"){
				accommodationName.val("");}
			}).blur(function(){
				if(accommodationName.val()==""){
				accommodationName.val("hotel/attraction,city,state");
				}
			});
			self.hasLoaded = false;
			//showProcess();
			getPinList();		
		}
		this.RefreshMap = function(){
			google.maps.event.trigger(map, 'resize'); 				
			$(".hinweis-right-rounded").hide();
			$(".divProcessResult").hide();
			
			if(!self.hasLoaded){
				//if(jQuery.browser.msie){
				getPinList();
				//}
				showDropmarker();
				map.setZoom(this.mapOptions.zoom);
				map.setCenter(this.mapOptions.center);
				self.hasLoaded=true;
			}
		}
		function refreshTooltipPos(){
			var top1,left1;	
			top1= ctrlPanel.offset().top+40;
			left1= ctrlPanel.offset().left-90;
			mapTooltip.css({
				top:top1,
				left:left1
			});
		} 
		
		function bindOverlay(targetObj){
			var top1,left1;
			top1= targetObj.offset().top+40;
			left1= targetObj.offset().left-90;
			//overlay
			overlayobj=mapTooltip.overlay({
				mask: {
					color: '#000',
					loadSpeed: 200,
					opacity: .1,
					zIndex: 10101
				},
				closeOnClick: false,
				closeOnEsc: false,
				top:top1,
				left:left1,
				zIndex: 10102,
				fixed:false,
				load:true
			});
			
			overlayobj.load();
			refreshTooltipPos();
		}
		/*
		* update the popup location when click another pin
		*/
		function updatePos(isNew){
			if(curMarker==null) return;
			if(!map.getBounds().contains(curMarker.getPosition())){
				infowindow.fadeOut(options.fadeOutSpeed);
				return;
			}
			projection = helper.getProjection();
			var p =  projection.fromLatLngToContainerPixel(curMarker.getPosition());//fromLatLngToContainerPixel
			infowindow.css({top:p.y+self.offsetTop-54,left:p.x+self.offsetLeft+22});
			if(isNew){
				$(".hinweistip-title",mapTooltip2).html(curMarker.title);
				$(".hinweistip-content",mapTooltip2).html(curMarker.content);
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
				divProcessResult.appendTo(self);
			}
			var _html;
			  _html = html==null? '<img src="images/loadingStripes.gif">' :"<div style='padding:0px 12px;height:50px;line-height:50px;width:auto;margin:0 auto;text-align:center;'>"+html+"</div>";
			 
			divProcessResult.html(_html).fadeIn(options.fadeInSpeed);

			if(!html && divProcessResult.css('display')!='none'){
				setTimeout(function(){
					divProcessResult.fadeOut(options.fadeOutSpeed);	//divProcessResult.hide();//
					//alert('done'+divProcessResult.css('display'));
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
			if(self.hasLoaded){
				return;
			}
			for (var j in destMarker) {
				destMarker[j].setMap(null);
			}
			destMarker.length=0;
			
			$.ajax({
				type: "GET",
				url: options.pinListUrl,
				cache: true,
				success: function (data) {
					dests = data.userDestinations;

					$.each(dests, function (i) {
						var dest = dests[i];
						var latlng = new google.maps.LatLng(dest.latitude, dest.longitude);
						var image = new google.maps.MarkerImage(markerImage,
							new google.maps.Size(31, 33),
							new google.maps.Point(0,0),
							new google.maps.Point(15, 33));
						destMarker[i] = new google.maps.Marker({
							position: latlng,
							map: map,
							title: dest.name,
							icon: image,
							visible:false
							//animation: google.maps.Animation.DROP
						});
					   destMarker[i].title= dest.name;
					   destMarker[i].content="<div><p>Name:"+dest.name+"</p></div>";
					   destMarker[i].destinationId = dest.destinationId;
					   
						google.maps.event.addListener(destMarker[i], 'click', function () {
							curMarker =  destMarker[i];
							updatePos(true);
						});
					});
					showDropmarker();
					//divProcessResult.hide();
				},
				error: function (d) {
					//alert("fail to search!please try again!");
				},
				dataType: "json"
			});
			
			
		}
		function showDropmarker(){
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
		}
		/*
		* add pins
		*/
		var NewMapPin=function(){
			if(accommodationName.val()==""||accommodationId.val()==""){ return;}
			showProcess();
			
			$.ajax({
				type: "GET",
				url: options.newPinUrl,
				data: {id:accommodationId.val()},
				success: function (data) {
					 var dest = data.userDestinations[0];
						var latlng = new google.maps.LatLng(dest.latitude, dest.longitude);
						var image = new google.maps.MarkerImage(markerImage,
							new google.maps.Size(31, 33),
							new google.maps.Point(0,0),
							new google.maps.Point(15, 33));
						var marker = new google.maps.Marker({
							position: latlng,
							map: map,
							title: dest.name,
							icon: image,
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
						accommodationName.val("hotel/attraction,city,state");
						accommodationId.val("") ;
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
		});
	}
});
 
 