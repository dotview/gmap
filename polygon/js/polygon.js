function GoogleMapPolygon(conf){
		var map;
		var mapbounds;
		var polylist = [];
		var conf = $.extend(
			{
				"sidebarId": "sidebar" // set the side bar id
			}
			,conf);
		
		var polyOptionsH2 = {
		  strokeColor: "#FF0000",
			  strokeOpacity: 0.8,
			  strokeWeight: 3,
			  fillColor: "#FF0000",
			  fillOpacity: 0.25
		}
		var polyOptionsH = {
		  strokeColor: "#326FEC",
			  strokeOpacity: 0.8,
			  strokeWeight: 1,
			  fillColor: "#326FEC",
			  fillOpacity: 0.35
			  }
		 var polyOptions = {
		  strokeColor: "#326FEC",
			  strokeOpacity: 0.8,
			  strokeWeight: 0,
			  fillColor: "#326FEC",
			  fillOpacity: 0
		}
		var self = this;
		
		this.init = function(){
			var loc = new google.maps.LatLng(49.261226,-123.113927 );
			var myOptions = {
			  zoom: 7,
			  center: loc,
			  disableDoubleClickZoom:true,
			  mapTypeId: google.maps.MapTypeId.ROADMAP
			};
			map = new google.maps.Map(document.getElementById('map_canvas'), myOptions);
 
			mapbounds = new google.maps.LatLngBounds();
			
			
			//this.DrawPolygons();
			$("#selectAll").toggle(function(){
				$(this).addClass("highlight");
				$(this).val("deselect all");
				for(var i in polylist){		
					hightObject(polylist[i],true,false);
				}
			},
			function(){
				$(this).removeClass("highlight");
				$(this).val("select all");
				for(var i in polylist){		
					hightObject(polylist[i],true,false);
				}
			});
		}
		this.ready = function(){
			this.registerEvent();
			//map.fitBounds(mapbounds);
		}
		//register event
		this.registerEvent = function(){
			$("#"+conf.sidebarId).find("p").click(function(e){
				/*for(var i in polylist){		
					if(polylist[i].name == $(this).attr("title")){
						hightObject(polylist[i]);
						return;
					}
				}*/
				hightObject($(this).data("poly"));
			});
		}
		var hightObject = function(poly,isExtend,showWin){	
			var barObj = $("#"+conf.sidebarId).find("p:eq("+poly.pIndex+")");
			
			if(!poly.showing){
				if(showWin==null || showWin==true){
					setTimeout(function(){poly.infowindow.open(map);},50);
				}
				poly.showing = true;				
				poly.setOptions(polyOptionsH);
				
				if(barObj) barObj.addClass("highlight");
				if(isExtend) return;
				
				var polygonbounds;
				if($(poly).data("pbounds")==null){
					paths = poly.getPaths();
					polygonbounds = new google.maps.LatLngBounds();
					paths.forEach(function(path,index){
						path.forEach(function(p,index){
							polygonbounds.extend(p); 
						});
					});
					$(poly).data("pbounds", polygonbounds);
				}else{
					polygonbounds = $(poly).data("pbounds");
				}
				map.fitBounds(polygonbounds);
			}else{
				poly.infowindow.close();
				poly.showing = false;				
				poly.setOptions(polyOptions);
				
				if(barObj) barObj.removeClass("highlight");
			}	
		}
		/* draw polygons to the map
		*
		*@param Boundaries :include the polygon name and bounds
		*format:Boundaries =[{'name':'test name','bounds':'-122.0958299277 49.1320428644802,-122.096821078964 49.1302453272138...',..}];
		*/
		this.DrawPolygons = function(Boundaries){
			for(var i =0 ;i<Boundaries.length;i++){
			 
			 name =  Boundaries[i].name;
			 
			 bounds =  Boundaries[i].bounds;
			 coords = [];
			 var coordstr = bounds.split(',');
			 for(var k in coordstr){
				var coord = coordstr[k].split(' ');
				var latlng = new google.maps.LatLng(coord[1],coord[0]);
				mapbounds.extend(latlng); 
				coords.push(latlng);
			 }
			 this.DrawPolygon(name,coords);
			}
		}
		
		/* draw a polygon to the map
		*
		*@param name :the polygon name
		*@param Coords :the polygon paths
		*/
		this.DrawPolygon = function(name,Coords){
			
			var poly1 = new google.maps.Polygon({
			  paths: Coords
			});
			poly1.setOptions(polyOptions);
			
			poly1.infowindow = new InfoBox({content:'<div class="infoWindow">'+name+'</div>',position:Coords[0],maxWidth:200});
			poly1.name = name;
			
			$.each($("#"+conf.sidebarId).find("p"),function(index,obj){
				if(name == $(obj).attr("title")){
					poly1.pIndex = index;
					$(obj).data("poly",poly1);
					return;
				}
			})
			google.maps.event.addListener(poly1, 'click',  function(e){
				hightObject(this);
			});
			
			poly1.setMap(map);
			polylist.push(poly1);
		}
			
		return this.init();
	}