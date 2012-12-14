Date.prototype.Format = function(fmt) 
{
    //author: meizz 
    var o =
    { 
        "M+" : this.getMonth() + 1, 
        "d+" : this.getDate(), 
        "h+" : this.getHours(), 
        "m+" : this.getMinutes(), 
        "s+" : this.getSeconds(), 
        "q+" : Math.floor((this.getMonth() + 3) / 3), 
        "S" : this.getMilliseconds() 
    }; 
    if (/(y+)/.test(fmt)) 
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length)); 
    for (var k in o) 
        if (new RegExp("(" + k + ")").test(fmt)) 
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length))); 
    return fmt; 
}


Date.prototype.addDays = function(d)
{
    this.setDate(this.getDate() + d);
};

function stringFormat(str){
	var arr = str.split('-');
	return arr[2]+"-"+arr[0]+"-"+arr[1];
}
var ov =180;
function slideDate(event, ui){
	var olddate = $("#s-date").text();
	var sdate = ui.value ;

	var now = new Date(olddate);
	//var   d   =   new   Date(Date.parse(sdate.replace(/./g,   "/"))); 
	//now.setDate(now.getDate(),(sdate-180));
	now.addDays(sdate-ov); 
	ov = sdate;
	$("#s-date").text(now.Format("MM-dd-yyyy"));
}
function getDate(d) {
	return d.getMonth()+"-"+d.getDate()+"-"+d.getFullYear();
}
function slideTime(event, ui){
	var minutes0 = parseInt(ui.value % 60);
	var hours0 = parseInt(ui.value / 60 % 24);
	$("#s-time").text(getTime(hours0, minutes0));
}
function showslideTime(){
	var minutes0 = parseInt($("#slider-time").slider("values", 0) % 60);
	var hours0 = parseInt($("#slider-time").slider("values", 0) / 60 % 24);
	$("#s-time").text(getTime(hours0, minutes0));
}
function getTime(hours, minutes) {
	var time = null;
	minutes = minutes + "";
	if (hours <= 12) {
		time = "AM";
	}
	else {
		time = "PM";
	}
	if (hours == 0) {
		hours = 12;
	}
	if (hours > 12) {
		hours = hours - 12;
	}
	if (minutes.length == 1) {
		minutes = "0" + minutes;
	}
	return hours + ":" + minutes + time;
}
var sliderloading;
var map_id;
 
$(document).ready(function(){
	 // get the map id
	  for(var i in Drupal.settings.gmap){
		if (Drupal.settings.gmap.hasOwnProperty(i) && typeof(first) !== 'function') {
			map_id = Drupal.settings.gmap[i].id;
			break;
		}
	  }
	var currTime =   new Date();
	var sValue = currTime.getHours()*60+currTime.getMinutes();
	
	$("#slider-time").slider({
		range: false,
		min: 0,
		max: 1439,
		value:sValue,
		//slide: slideTime,
		slide: function(event, ui) { slideTime(event,ui);refreshIcon(ui.value); }
	});
	
	showslideTime();
 
	$( "#slidermap_datepicker" ).datepicker({
		showOn: "button",
		buttonImage: "/beakun/sites/all/modules/slidermap/images/cal.png",
		buttonImageOnly: true,
		dateFormat: 'mm-dd-yy',
		onSelect: function(dateText, inst) {
			$("#s-date").text(dateText);
			getdata(dateText);
		}
	});
	
	var sDate = getDate(currTime);
	$("#s-date").html(sDate);

	sliderloading = $("<img src=\"/beakun/sites/all/modules/slidermap/css/load.gif\"/>").css({'margin-left':'8px'}).hide();
	$("#spanDateIcon").after(sliderloading);
	
	var obj = Drupal.gmap.getMap('gmap-contenttypemap1-gmap0');
	
	 
	var b = function() {
        return !obj.ready ? setTimeout(b, 1500) : setTimeout(getdata, 200)
    };
	
    setTimeout(b, 200);
	
})

function refreshIcon(){
	var stime = $("#s-time").text();
	
	var _markers=window['Drupal']['settings']['gmap'][map_id]['markers'];
	for (i = 0; i < _markers.length; i++) {
        try{
		
		var marker = _markers[i];
		var text = '<div class="gmap-popup"><span class="map-title">'
				+htmlspecialchars_decode(marker.node_link)+'</span>';

		if(isNullorEmpty(marker.opentime_value)|| isNullorEmpty(marker.closetime_value)){
			icon = Drupal.gmap.getIcon("close", marker.offset);
		}
		else{
			if(!isNullorEmpty(marker.opentime_value) && !isNullorEmpty(marker.closetime_value)){
				text += '<span>&nbsp;&nbsp;'+marker.opentime_value +'-'+marker.closetime_value+'</span>';
			}
			text += '<div>';
			if(!isNullorEmpty(marker.phone))text += '<p>'+marker.phone+'</p>';
			var open = Date.parse(marker.opentime_value);
			var close = Date.parse(marker.closetime_value);
			if(Date.parse(stime).between(open,close)){
				var res = checkSpecial(marker);
				if(res.specid!="-1"){
					icon  =res.icon;
					var spec = specials[res.specid];
					text += '<p>'+spec.special_title+'</p>';
				}else{
					icon = Drupal.gmap.getIcon("open", marker.offset);
					text += '<p>Business as usual</p>';		
				}
				
			}else{
				icon = Drupal.gmap.getIcon("close", marker.offset);
				text += '<p>Closed but come see us another day</p>';
			}
			text += '</div>';
		}
		text += '</div>';
		
		marker.text = htmlspecialchars_decode(text) ;
		marker.marker.setImage(icon.image);
		
		}
		catch(e){}
	}
	
}
var specials=[];
function getdata(v) {
	sliderloading.show();
	window['Drupal']['settings']['gmap'][map_id]['markers'] = [];
	var isSpecial = "";
	if(specials.length==0){
		isSpecial= "true";
	}
	$.ajax({type: 'GET',
      url: "get_node_slider.txt",
      dataType: 'json',
      success: makeMarkers,
	  error:function(e){
		sliderloading.hide();
		console.info("get_node_slider error");
	  },
      data: {'sdate':$("#s-date").text(),'stime':$("#s-time").text(), 'isSpecial':isSpecial} });
}
function checkSpecial(marker){
	var stime = $("#s-time").text();
	icon = Drupal.gmap.getIcon("open", marker.offset);	
	result = {"specid":-1,"icon":icon};	
	//if(marker.isspecials && marker.isspecials=="1"){
		for (var i in specials) {
			var spec = specials[i];
			if(spec.pid==marker.nid){
				if(isNullorEmpty(spec.start_time)|| isNullorEmpty(spec.end_time)){
					return result;
				}
				var start_time = Date.parse(spec.start_time);
				var end_time = Date.parse(spec.end_time);
				if(start_time!=null&& end_time !=null && Date.parse(stime).between(start_time,end_time)){
					icon = Drupal.gmap.getIcon(spec.termname.toLowerCase(), marker.offset);	
					result.icon = icon;
					result.specid = i;
					return result;	
				}
				
			}
		}
	//}
	return result;
}

function makeMarkers(data, textStatus){
	var obj = Drupal.gmap.getMap('gmap-contenttypemap1-gmap0');//window['Drupal']['settings']['gmap'][map_id];
	obj.map.clearOverlays();
	var markers = data.markers;
	specials = data.specials;
	window['Drupal']['settings']['gmap'][map_id]['markers'] = markers;
	refreshIcon();
	/*for (i = 0; i < markers.length; i++) {
		markers[i].text = markers[i].text ;
	}
	
	for (i = 0; i < markers.length; i++) {
        marker = markers[i];
        if (!marker.opts) {
          marker.opts = {};
        }
        // Pass around the object, bindings can change it if necessary.
        obj.change('preparemarker', -1, marker);
        // And add it.
        obj.change('addmarker', -1, marker);
      }
      obj.change('markersready', -1);
	  */
	  
	  obj.change('iconsready', -1);
	  
	  $("#sidebar-first .block-custom_beakun").find(".content").empty().html(htmlspecialchars_decode(data.barhtml));
	  register_refreshMarkers();
	  
	  sliderloading.hide();
}

Drupal.MapMarker = {};
Drupal.MapMarker.Refresh = function(target,response)
{
  refreshMarkers();
}

var map_markers_tids = [];
/*
 * Add tids to an array
 */
function map_refresh_binding(){
  map_markers_tids = [];
  $(".custom-checkbox input[type=checkbox]").each(function(){
    if ($(this).is(':checked')){
      map_markers_tids.push($(this).val());
    }
  });
}
function register_refreshMarkers(){
 $(".custom-checkbox input[type=checkbox]").change(function()
  {
    refreshMarkers();
  });
 map_refresh_binding();  
 refreshMarkers();
};

function refreshMarkers(){
   if(map_markers_tids.length > 0) {
        
    // loop through the checkboxes on active tab to show / hide their markers based on checked status
    $(".custom-checkbox input[type=checkbox]").each(function(){
      // if this is checked, show map markers
      
      if($(this).is(':checked')){
        $("#gmap-contenttypemap1-gmap0 img[title="+$(this).val()+"]").show();
      }
      else { // else hide map markers
        $("#gmap-contenttypemap1-gmap0 img[title="+$(this).val()+"]").hide();
      }
    });
  }
  // front page block
  $('#block-custom_beakun-5 .js-checkbox').click(function(){
    var term_id = $(this).val();
    var node_ids = Drupal.settings.MapTermNodes[term_id];
    
    if($(this).is(':checked')){
      // show submenu
      $(this).parent().parent().addClass('box-checked-on')
        .siblings('.submenu').slideDown();
      
      // show map markers
      for(i=0;i<node_ids.length;i++){
        $("#gmap-contenttypemap1-gmap0 img[title="+node_ids[i]+"]").show();
      }      
    }
    else
    {
      // hide submenu
      $(this).parent().parent().removeClass('box-checked-on')
        .siblings('.submenu').slideUp();
      
      // hide map markers
      for(i=0;i<node_ids.length;i++){
        $("#gmap-contenttypemap1-gmap0 img[title="+node_ids[i]+"]").hide();
      }
    }
  });
  /*
   * Tax Block list map hovers
   */
  // on list mouseover
  $('.block-custom_beakun ul.submenu > li > a').mouseover(function(){
    var value = $(this).attr('rel');
    var marker_int;// = parseInt($('.gmap-control img[title='+ value +']').attr('id').replace("mtgt_unnamed_",""));
    var markers = window['Drupal']['settings']['gmap'][map_id]['markers'];
	for(var k=0;k< markers.length;k++){
		if(markers[k].opts.title==value){
			marker_int=k; //GEvent.trigger(markers[k], "click");
			break;
		}
	}
	
    // correct method, works in all browsers
    GEvent.trigger(window['Drupal']['settings']['gmap'][map_id]['markers'][marker_int]['marker'], "click");
    // correct, but only works on a single map name
    // GEvent.trigger(Drupal.settings.gmap.contenttypemap1.markers[marker_int].marker, "click");
    // old, wrong method
    //$('.gmap-control img[title='+ value +']').click();
  });
}
function isNullorEmpty (str) {
	return str==null || str =="";
}
  
function htmlspecialchars_decode (string, quote_style) {
    
    var optTemp = 0,
        i = 0,
        noquotes = false;
    if (typeof quote_style === 'undefined') {
        quote_style = 2;
    }
    string = string.toString().replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    var OPTS = {
        'ENT_NOQUOTES': 0,
        'ENT_HTML_QUOTE_SINGLE': 1,
        'ENT_HTML_QUOTE_DOUBLE': 2,
        'ENT_COMPAT': 2,
        'ENT_QUOTES': 3,
        'ENT_IGNORE': 4
    };
    if (quote_style === 0) {
        noquotes = true;
    }
    if (typeof quote_style !== 'number') { // Allow for a single string or an array of string flags
        quote_style = [].concat(quote_style);
        for (i = 0; i < quote_style.length; i++) {
            // Resolve string input to bitwise e.g. 'PATHINFO_EXTENSION' becomes 4
            if (OPTS[quote_style[i]] === 0) {
                noquotes = true;
            } else if (OPTS[quote_style[i]]) {
                optTemp = optTemp | OPTS[quote_style[i]];
            }
        }
        quote_style = optTemp;
    }
    if (quote_style & OPTS.ENT_HTML_QUOTE_SINGLE) {
        string = string.replace(/&#0*39;/g, "'"); // PHP doesn't currently escape if more than one 0, but it should
        // string = string.replace(/&apos;|&#x0*27;/g, "'"); // This would also be useful here, but not a part of PHP
    }
    if (!noquotes) {
        string = string.replace(/&quot;/g, '"');
    }
    // Put this in last place to avoid escape being double-decoded
    string = string.replace(/&amp;/g, '&');

    return string;
}