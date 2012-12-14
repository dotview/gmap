
/*
 * Map Marker fixes
 */
function beakun_fix_mapmarkers(){
  // help with determining map hover points
  $('.gmnoprint').hover(
    function(){
      $(this).addClass('hovering');
    },
    function(){
      $(this).removeClass('hovering');
    }
  );
  
  $('.gmap-control div div div img').each(function(){
    if($(this).attr("id") != ""){
      // fix icons
      $(this).css({height: 'auto', width: 'auto', 'margin-left': '-20px'});
      
      // handle hovers
      $(this).mouseover(function(){
        $(this).addClass('hovering');
      });
      $(this).mouseout(function(){
        $(this).removeClass('hovering');
        var marker = $(this);
        var this_timeout = function(){ beakun_mapmarker_blur(marker); }; 
        setTimeout(this_timeout, 3000);
      });
    }
  });
}
// handle mouseout for mapmarkers
function beakun_mapmarker_blur(marker){
  var still_hover = false;
  var nid = $(marker).attr('title');
  var marker_int = parseInt($(marker).attr('id').replace("mtgt_unnamed_",""));
  
  // check if hovering on marker
  if($(marker).hasClass('hovering')){
    still_hover = true;
  } 
  // check if hover on gmnoprint
  if($('.gmnoprint:visible .gmnoprint').hasClass('hovering')){
    still_hover = true;
  }
  
  if(!still_hover){
    // do the blur by clicking on something arbitrary
    //console.log('do blur '+marker_int);
    //Drupal.settings.gmap.contenttypemap1.markers[marker_int].marker.__proto__.c.closeInfoWindow();
    //console.log(Drupal.settings.gmap.contenttypemap1.markers[marker_int].marker);
    $('.gmap-control div:eg(0) div:eg(0) div:eg(1) div:eg(0) img').click();
    //Drupal.settings.gmap.closeInfoWindow();
    //GEvent.trigger(Drupal.settings.gmap.contenttypemap1.markers[marker_int].marker, "visibilitychanged");
  }
}

var map_id;

$(document).ready(function(){
  // get the map id
  for(var i in Drupal.settings.gmap){
    if (Drupal.settings.gmap.hasOwnProperty(i) && typeof(first) !== 'function') {
        map_id = Drupal.settings.gmap[i].id;
        break;
    }
  }
  
  // fix some things
  //modify by dotview(lexinquan@gmail.com) ,removed
  //setTimeout(beakun_fix_mapmarkers, 4000);
 
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
    var marker_int = parseInt($('.gmap-control img[title='+ value +']').attr('id').replace("mtgt_unnamed_",""));
  
    // correct method, works in all browsers
    GEvent.trigger(window['Drupal']['settings']['gmap'][map_id]['markers'][marker_int]['marker'], "click");
    // correct, but only works on a single map name
    // GEvent.trigger(Drupal.settings.gmap.contenttypemap1.markers[marker_int].marker, "click");
    // old, wrong method
    //$('.gmap-control img[title='+ value +']').click();
  });
  // on list mouseout
  $('.block-custom_beakun ul.submenu > li > a').mouseout(function(){});
  
  /*
   * Business Time Hours
   */
  $('.node-type-business .group-business-hours,.page-node-add-business .group-business-hours ').append('<div class="business_node_openclose"><span style="float:left;">Open</span><span style="float:right;">Close</span></div>');
  
  // ??? Insert Default value in og_decription field 
  $('#edit-og-description').val("This OG default description value");
  $('#edit-og-selective-2').attr('checked',true);
  
  /*
   * Change city
   */
  $('#block-custom_beakun-4 #changecity1 ').hide();
  $('#block-custom_beakun-4 #arrow-img').mouseover(function() {
    $('#block-custom_beakun-4 #changecity1').toggle();
  });
 
  $('#block-custom_beakun-4 #changecity1 >ul >li > a').click(function(){
    $('#block-custom_beakun-4 #changecity1').hide();
  });
});