var postalVal='';
var cuisineVal='';
var searchType='';

var noRecord='0';
var map;
var counter = 0;
var markerArray = new Array;
var html = new Array;
var previousBubble = null;
var ID=0;
var markerArray = new Array;
var openBubble=null;
 
 //alert(noRecord)    
$(document).ready(function(){
	$('input#cuisine').focus(function(){
		$('#cusine_types').slideDown(200);
	})
	$('.close_cuisine_types').click(function(){
		$('#cusine_types').slideUp(200);
	})
})
$(document).ready(function () {
	viewmap(postalVal,cuisineVal,ID,searchType,noRecord);
});

function showMapWithAjax(latVal,longVal,ID,set)
{
	
	function initMap(){
		if($('#noRecord').val()==1)
		{
			var zoomVal=16;
		}
		else
		{
			var zoomVal=12;
		}
		var a = latVal;
		var b = longVal;
		var c = new google.maps.LatLng(a, b);
		 var d = {
			zoom: zoomVal,
			center: c,
			panControl: false,
			  mapTypeControl: false,
			  mapTypeControlOptions: {
				style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
			  },
			  zoomControl: true,
			  zoomControlOptions: {
				 style: google.maps.ZoomControlStyle.LARGE,
				  position: google.maps.ControlPosition.LEFT_TOP
			  },
			  mapTypeId: google.maps.MapTypeId.ROADMAP
		};
		map = new google.maps.Map(document.getElementById("map"), d);

		openBubble = new InfoBubble;
		
		google.maps.event.addListener(map, "click", mapclickHandler); 
		
		google.maps.event.addListener(map, 'idle', idleHandler);
	}
	
	function mapclickHandler(){
        if(previousBubble)
	    {
			var Id_val=$('#restIDval').val();
			if(Id_val!='')
			{
				$(".abc").removeClass("active_restaurant");
				$(".more_details_wrap").removeClass("active_restaurant");
				$("#rstdetail"+Id_val).addClass("nonactive_restaurant");
				$('#restIDval').val('');
			}
			previousBubble.close();
			var openBubble=null;
			return false;
    	}
	}
	  function idleHandler(){
		var bounds = map.getBounds();
		var ne = bounds.getNorthEast();
		var sw = bounds.getSouthWest();
		var ne_lat = ne.lat();
		var ne_lng = ne.lng();
		var sw_lat = sw.lat();
		var sw_lng = sw.lng();
		var searchType=$('#searchType').val();
		var postalVal=$('#postalCode').val();
		if(postalVal!='address')
			postalVal=$('#postalCode').val();
		else
			postalVal=''


		var cuisineVal=$('#cuisine').val();	

		if(cuisineVal!='cuisine')
			cuisineVal=$('#cuisine').val();	
		else
			cuisineVal=''

		$.ajax({
			//url: '/map.php?postalCode='+postalVal+'&cusine='+cuisineVal+'&searchType='+searchType+'&noRecord='+noRecord,
			url: 'data.txt',
			data: { ne_lat: ne_lat, ne_lng: ne_lng-0.0020, sw_lat: sw_lat, sw_lng: sw_lng+0.0020},		
			success: function(data) {
				 // alert("map");
				if((data=='1' || data==1))
				{
					removeMarker();
					$("#restData").empty().append('<div class="scroll-pane"><div class="noRecord">no record found</div></div>');
					$('#restData').trigger('update');
				}
				else{
					loadMarkers();
				}
	  		
			}
		});
	  }
	  var loadMarkers(){
		$.ajax({
	    type: "GET",
	    url: "map.xml",
	    dataType: "xml",
	    success: function(xml){
			removeMarker();
			$('#noRecord').val('0');
			$("#restData").empty().append(data);
			//$('#restData').trigger('update');
			 
			$(xml).find('marker').each(function(){
				//alert(1)
				var name = $(this).find('name').text();
				var address = $(this).find('address').text();
				// create a new LatLng point for the marker
				var lat = $(this).find('lat').text();
				var lng = $(this).find('lng').text();
				var restImage = $(this).find('restImage').text();//'http://localhost/hottable/wp-content/themes/hot-table/images/yellow_flame.png'
				var rID = $(this).find('rID').text();

				var h = new google.maps.LatLng(lat,lng);
				var i = new google.maps.MarkerImage(restImage, null, null, null, new google.maps.Size(26, 30));
				var mkr = new google.maps.Marker({
					position: h,
					map: map,
					icon: i,
					title: name
				});
				
				mkr.setMap(map);
				markerArray[counter] = mkr;
				var text=document.getElementById(rID).innerHTML;
				html[h] = "<div class='infobubbleDiv'><div id='restHeader' class='scroll_hedng1'>" + text + "</div></div>";


				google.maps.event.addListener(j, "click", function (a) {
					selectMarker(j);
				});
				counter++
			});
	  	}
	  });
	  }
	  function selectMarker(){
		//c=a.latLng;
		if (previousBubble)
		{
			previousBubble.close();
		}
	
		openBubble.setContent(html[h]);
		map.setCenter(h);
		var openID = rID.substring(7);
		$('#restIDval').val(openID);
		$(".more_details_wrap").removeClass("nonactive_restaurant");
		$("#rstname"+openID).addClass("active_restaurant");
		$("#rstdetail"+openID).addClass("active_restaurant");
			
		openBubble = c;
		c.open(map, j); 
		previousBubble = c
		return false;		
	  }
	  
	  function removeMarker() {
			if (counter > 0) {
				for (j in markerArray) {
					if (markerArray[j]) {
						markerArray[j].setMap(null)
					}
				}
				markerArray = [];
				html = [];
				counter = 0
			}
		}
		
	return initMap();
}

function MouseOverBounce(id) {
	id = id-1;
	markerArray[id].setAnimation(google.maps.Animation.BOUNCE);  
	return false;
}

function MouseOutBounce(id) {
	id = id-1;
	markerArray[id].setAnimation(null);  
	return false;
}