var Guiderer_Views_PoiMap = function() {
		var a,
		b,
		c,
		d,
		e = this;
		var tsp;
		var directionsDisplay;
		 var dirRenderer;  
		var directionsService = new google.maps.DirectionsService();
		var bound = new google.maps.LatLngBounds();
		var polylines = [];
		var markers = [];
		d = {
			center: new google.maps.LatLng(1, -22),
			zoom: 15,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		},
		e.map = new google.maps.Map($("#guidePOILargeMap .POImap")[0], d);

		var infowindow = new InfoBox({
				maxWidth:'0',
				content: "not initialized",
				pixelOffset: new google.maps.Size(-60, 0),
				boxStyle: { 
				  background: "url('assets/tipbox.gif') no-repeat -80px 2px",
				  opacity: 0.95,
				  width: "132px"
				 },
				 closeBoxMargin: "10px 2px 2px 2px"
			 });
		$("#viewFullMap").toggle(function(){
			$("#guidePOILargeMap").addClass("POIMap-Large").css({"width":$(window).width(),"height":$(window).height()});
			$(".POImap").css({"height":$(window).height()});
			google.maps.event.trigger(e.map, 'resize'); 
			$("#guidePOIList").hide();
			$(this).text("close full screen");
		},function(){
			$("#guidePOILargeMap").removeClass("POIMap-Large").css({"width":'800px',"height":'100%'});
			$(".POImap").css({"height":'400px'});
			google.maps.event.trigger(e.map, 'resize'); 
			$("#guidePOIList").show();
			$(this).text("view map in full screen");
		}
		);
		var index = 0;
		$("#guidePOIList .day_time").each(function(dayindex,dayobj) {
			title = $(this).find("h2").text();
			var routes =[];
			$('<span class="span-button span-selected" ref="'+dayindex+'">'+title+'</span>').appendTo($("#POImapButton"));
			$("section.guideItemPOI",$(this)).each(function(i,obj) {
				c = $(this).find(".gmap"),
				a = c.attr("data-lat"), b = c.attr("data-lng");
				var title = $(this).find(".guideItemPOIHeader").text();
				
				var latlng = new google.maps.LatLng(a, b);
				routes.push(latlng);

				bound.extend(latlng);
				
			})
			calcRoute(routes,dayindex);
		});	
		e.map.fitBounds(bound);
		function calcRoute(dayroutes,dayindex) {
			if (dayroutes.length <2) return; 

			var start = dayroutes[0];
			var end = dayroutes[dayroutes.length - 1];

			var request = {
				origin: start,
				destination: end,
				provideRouteAlternatives: true,
				travelMode: google.maps.TravelMode.DRIVING
			};

			if (dayroutes.length > 2) {
				var waypoints = [];
				for (var i = 1; i < dayroutes.length - 1; i++) {
					waypoints.push({
						location: dayroutes[i],
						stopover: true
					})
				}
				request.waypoints = waypoints;
				request.optimizeWaypoints = true;
			}

			directionsService.route(request, function(response, status) {
				if (status == google.maps.DirectionsStatus.OK) {
					showRoute(response,dayindex);
				}
			})
		}
		var colorArray = ["black", "red", "blue", "green", "darkblue", "orange", "brown"];
		function showRoute(response,dayindex){
			var legs = response.routes[0].legs;
			var color = colorArray[dayindex];
			var iconcolor = colorArray[dayindex];
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

				var marker = createMarker(start_location, iconcolor,dayindex,i);
				markers.push(marker);
				
				 
				for (var j = 0; j < steps.length; j++) {
					var step = steps[j];
					var instructions = step.instructions;
					var s_duration = step.duration.text;
					var s_distance = step.distance.text;
					var paths = step.path;
					var polyOptions = {
						strokeColor: color,
						strokeOpacity: 0.6,
						strokeWeight: 3,
						path: paths
					}
					var polyline = new google.maps.Polyline(polyOptions);
					polyline.dayindex = dayindex;
					polyline.setMap(e.map);
					polylines.push(polyline);
					
				}
				 
				if (i == legs.length - 1) {
					var marker = createMarker(end_location, iconcolor,dayindex,i+1);
					markers.push(marker);					 
				}
			}
			$(".span-button").toggle(function(){
				$(this).removeClass("span-selected");
				infowindow.close();
				$("div.day_time:eq("+$(this).attr("ref")+")").hide();
				for (var j in markers) {
					if(markers[j].dayindex == $(this).attr("ref"))
					markers[j].setMap(null);
				}
				for (var k in polylines) {
					if(polylines[k].dayindex == $(this).attr("ref"))
					polylines[k].setMap(null);
				}
			},
			function(){
				$(this).addClass("span-selected");
				$("div.day_time:eq("+$(this).attr("ref")+")").show();
				for (var j in markers) {
				if(markers[j].dayindex == $(this).attr("ref"))
					markers[j].setMap(e.map);
				}
				for (var k in polylines) {
				if(polylines[k].dayindex == $(this).attr("ref"))
					polylines[k].setMap(e.map);
				}
			});
			var item = $("section.guideItemPOI").find("img").click(function(){
				var idx = $("section.guideItemPOI").find("img").index($(this)[0]);
				for (var j in markers) {
					if(j == idx){
						infowindow.setContent(markers[j].html);
						infowindow.open(e.map,markers[j]);
						var top=$("#guidePOILargeMap").scrollTop();
						$('html,body').animate({
								// Animate these properties.
								scrollTop : top
							},1000, function() {
								// Animation complete callback.
								//$(".highlight").removeClass("highlight");
								//item.addClass("highlight");
						});
					}
				}
			});
		}
		function createMarker(point, color,dayindex,index) {
			var iconindex = index.toString().length<2 ?"0"+(index+1).toString() : (index+1);
			var image = "assets/icons/"+color+ iconindex + ".png";
			var marker = new google.maps.Marker({
				map: e.map,
				draggable: true,
				position: point,
				icon: image
			});

			marker.dayindex = dayindex;
			marker.itemIndex = index;
			var dayitem = $("div.day_time:eq("+dayindex+")>h2");
			var item = $("section.guideItemPOI:eq("+index+")",$("div.day_time:eq("+dayindex+")"));
			var html ="<div class='infowindowcontent'>"
					+"<p class='info-hd'>"+dayitem.html()+ " > "+item.parent().attr("id")  +"</p>"
					+"<p class='info-fn'>"+item.find(".guideItemPOIHeader>h3").html() +"</p>"
					+"<p><img class='info-img' src='"+item.find("img").attr("src")+"' /></p>";
					//+"<div class=\"info-c\">"+item.find(".vcard").html()+"</div></div>";
					+"</div>";
			marker.html = html;
			google.maps.event.addListener(marker, "mouseover", function() {
				infowindow.setContent(this.html);
				infowindow.open(e.map,this);
			});
			google.maps.event.addListener(marker, "mouseout", function() {
			});
			google.maps.event.addListener(marker, "click", function() {
				var item = $("section.guideItemPOI:eq("+this.itemIndex+")",$("div.day_time:eq("+this.dayindex+")"));
				var top= item.offset().top;
				//$(window).scrollTop(top);
				
				$('html,body').animate({
						// Animate these properties.
						scrollTop : top
					},1000, function() {
						// Animation complete callback.
						$(".highlight").removeClass("highlight");
						item.addClass("highlight");
				});
				 
				infowindow.setContent(this.html);
				infowindow.open(e.map,this);
			});
			google.maps.event.addListener(infowindow, "closeclick", function() {
				$(".highlight").removeClass("highlight");
			});
			return marker;
		}
} 