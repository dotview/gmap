<?php
require ('./wp-load.php');
require ($_SERVER['DOCUMENT_ROOT'] . "/themefunctions.php");
$obj = new Model_functions(); //create object of function class
$mobile_browser = '0';

if (preg_match('/(up.browser|up.link|mmp|symbian|smartphone|midp|wap|phone|android)/i',
    strtolower($_SERVER['HTTP_USER_AGENT']))) {
    $mobile_browser++;
}

if ((strpos(strtolower($_SERVER['HTTP_ACCEPT']), 'application/vnd.wap.xhtml+xml') >
    0) or ((isset($_SERVER['HTTP_X_WAP_PROFILE']) or isset($_SERVER['HTTP_PROFILE'])))) {
    $mobile_browser++;
}

$mobile_ua = strtolower(SUBSTR($_SERVER['HTTP_USER_AGENT'], 0, 4));
$mobile_agents = array(
    'w3c ',
    'acs-',
    'alav',
    'alca',
    'amoi',
    'audi',
    'avan',
    'benq',
    'bird',
    'blac',
    'blaz',
    'brew',
    'cell',
    'cldc',
    'cmd-',
    'dang',
    'doco',
    'eric',
    'hipt',
    'inno',
    'ipaq',
    'java',
    'jigs',
    'kddi',
    'keji',
    'leno',
    'lg-c',
    'lg-d',
    'lg-g',
    'lge-',
    'maui',
    'maxo',
    'midp',
    'mits',
    'mmef',
    'mobi',
    'mot-',
    'moto',
    'mwbp',
    'nec-',
    'newt',
    'noki',
    'oper',
    'palm',
    'pana',
    'pant',
    'phil',
    'play',
    'port',
    'prox',
    'qwap',
    'sage',
    'sams',
    'sany',
    'sch-',
    'sec-',
    'send',
    'seri',
    'sgh-',
    'shar',
    'sie-',
    'siem',
    'smal',
    'smar',
    'sony',
    'sph-',
    'symb',
    't-mo',
    'teli',
    'tim-',
    'tosh',
    'tsm-',
    'upg1',
    'upsi',
    'vk-v',
    'voda',
    'wap-',
    'wapa',
    'wapi',
    'wapp',
    'wapr',
    'webc',
    'winw',
    'winw',
    'xda',
    'xda-');

if (in_array($mobile_ua, $mobile_agents)) {
    $mobile_browser++;
}
if (strpos(strtolower($_SERVER['ALL_HTTP']), 'OperaMini') > 0) {
    $mobile_browser++;
}
if (strpos(strtolower($_SERVER['HTTP_USER_AGENT']), 'windows') > 0) {
    $mobile_browser = 0;
}

$postalcode = $_REQUEST['postalCode'];
$cusine = $_REQUEST['cusine'];
$searchType = $_REQUEST['searchType'];
$ne_lat = $_REQUEST['ne_lat'];
$ne_lng = $_REQUEST['ne_lng'];

$sw_lat = $_REQUEST['sw_lat'];
$sw_lng = $_REQUEST['sw_lng'];
$noRecord = $_REQUEST['noRecord'];


if ($noRecord == 1) {
    $condition = '';

} else {
    $condition = " and latitude<='" . $ne_lat . "' and  latitude>='" . $sw_lat .
        "'  and longitude>='" . $ne_lng . "' and  longitude<='" . $sw_lng . "' ";  
}


if ($postalcode != '' && $searchType == 0) {

    $sql = mysql_query("select * from hot_posts as a,hot_postmeta as b where  a.post_type='openmenu' and  a.post_status='publish' and a.ID=b.post_id and (meta_key='zipcode' or meta_key='restaurantlocation')  and meta_value like '%" .
        trim($postalcode) . "%' and statusType='Active' $condition order by ID desc  ");
    if (mysql_num_rows($sql) > 0) {
        $Iquery = mysql_query("select * from hot_posts as a,hot_postmeta as b where  a.post_type='openmenu' and  a.post_status='publish' and a.ID=b.post_id and (meta_key='zipcode' or meta_key='restaurantlocation')  and meta_value like '%" .
            trim($postalcode) . "%' and statusType='Active' $condition order by ID desc  ");
    } else {
        $Iquery = mysql_query("select * from hot_posts where  post_type='openmenu' and  post_status='publish' and statusType='Active' $condition order by ID desc  ");
    }

} else
    if ($cusine != '' && $searchType == 1) {

        $list = explode(',', $cusine);
        $cList = "'" . implode("','", $list) . "'";


        $Iquery = mysql_query("select * from hot_posts as a,hot_terms as b,hot_term_relationships as c,hot_term_taxonomy as d where  a.post_type='openmenu' and  a.post_status='publish' and a.ID=c.object_id and b.term_id=d.term_id and d.term_taxonomy_id =c.term_taxonomy_id and b.name in($cList) and statusType='Active' $condition  order by ID desc  ");
    } else {
        //echo "select * from hot_posts where  post_type='openmenu' and  post_status='publish' and statusType='Active' $condition order by ID desc  ";

        $Iquery = mysql_query("select * from hot_posts where  post_type='openmenu' and  post_status='publish' and statusType='Active' $condition order by ID desc  ");
    }

    $xml = '<?xml version="1.0" encoding="UTF-8"?><markers>';
$rows = mysql_num_rows($Iquery);

// Iterate through the rows, adding XML nodes for each
if ($rows == 0) {


    if ($postalcode != '') {
        $param = urlencode($postalcode);
        $url = 'http://maps.google.com/maps/api/geocode/json?address=' . $param .
            '&sensor=false';
        $geocode = file_get_contents($url);
        $output = json_decode($geocode);
        //print_r($output );
        $lat = $output->results[0]->geometry->location->lat;
        $long = $output->results[0]->geometry->location->lng;
        if ($lat != '') {
            echo "1";
        } else {
            echo "2";
        }
    } else {
        echo "1";
    }

} else {
?>

<div class="scroll-pane">
        <?php

    require ($_SERVER['DOCUMENT_ROOT'] . "/resize-class.php");
    $i = 1;
    while ($row = mysql_fetch_array($Iquery)) {

        $state = get_post_meta($row['ID'], 'state', true);

        $city = get_post_meta($row['ID'], 'city', true);
        $location = get_post_meta($row['ID'], 'restaurantlocation', true);
        $zipcode = get_post_meta($row['ID'], 'zipcode', true);

        $address = $location . ", " . $city . " " . $state . " " . $zipcode;
        $discount = get_post_meta($row['ID'], 'discount', true);
        if ($discount == '30%') {
            $image = 'http://' . $_SERVER['HTTP_HOST'] .
                '/wp-content/themes/hot-table/images/yellow_flame.png';
        } else
            if ($discount == '40%') {
                $image = 'http://' . $_SERVER['HTTP_HOST'] .
                    '/wp-content/themes/hot-table/images/orange_flame.png';
            } else {
                $image = 'http://' . $_SERVER['HTTP_HOST'] .
                    '/wp-content/themes/hot-table/images/red_flame.png';
            }
            $rID = $row['ID'];
        // ADD TO XML DOCUMENT NODE
        $xml = $xml . '<marker>';
        $xml = $xml . '<name>' . $row['post_title'] . '</name>';
        $xml = $xml . '<address>' . $address . '</address>';
        $xml = $xml . '<lat>' . $row['latitude'] . '</lat>';
        $xml = $xml . '<lng>' . $row['longitude'] . '</lng>';
        $xml = $xml . '<restImage>' . $image . '</restImage>';
        $xml = $xml . '<rID>' . $rID . '</rID>';


        $xml = $xml . '</marker>';
        $restId = $row['ID'];
        $data = $obj->getRestaurantDetails($restId);
        $Idata = $obj->getMapphoto($restId); //Get Restaurant Logo


        $src = $_SERVER['DOCUMENT_ROOT'] . '/wp-content/uploads/' . $Idata['meta_value'];
        $ex = explode('/', $Idata['meta_value']);
        $des = $_SERVER['DOCUMENT_ROOT'] . '/wp-content/uploads/logothumb/small/' . $ex[2];
        $dest = 'wp-content/uploads/logothumb/small/' . $ex[2];


        // *** 1) Initialise / load image
        $resizeObj = new resize($src);

        // *** 2) Resize image (options: exact, portrait, landscape, auto, crop)
        $resizeObj->resizeImage(70, 70, 'crop');

        // *** 3) Save image
        $resizeObj->saveImage($des, 100);

?>
       							 <?php if ($data['menutype'] == 'Add Menu URL') {
            $menuurl = $data['menu_url'];
        } else {
            $menuurl = '?page_id=152&id=' . $restId . '&type=menu';
        }
?>
        <?php
        $turnoffphoneicon = get_post_meta($restId, 'turnoffphoneicon', true);
        $address = $data['_restaurant_location'] . "," . $data['city'] . "," . $data['state'] .
            " " . $data['zipcode'];
?>
        <div class="tool_tip_wrap"  style="display:none;" id="<?php echo $restId; ?>">
          <div id="tooltip<?php echo $restId; ?>">
            <h2 style="padding:5px 2px 0 8px; color:#441161;"><?php echo $data['post_title']; ?></h2>
            <div class="more_details_wrap" style="font-weight:bold;"> <img src="http://<?php echo
$_SERVER['HTTP_HOST'] . "/" . $dest; ?>" alt="" class="img" />
              <div class="overfllow">
                    <p>Bookings: <?php if ($mobile_browser > 0) {
            // do something ?><a href="tel:<?php echo $data['phonenumber']; ?>"><?php echo
$data['phonenumber']; ?></a>
   <?php
        } else {
            echo $data['phonenumber']; // do something else
        } ?><br />
                  Location: <?php echo $data['_restaurant_location']; ?>, <br />
                  <?php echo $data['city']; ?>, <?php echo $data['state']; ?> <?php echo
$data['zipcode']; ?><br />
                  Cuisine: <?php echo $data['cuisine']; ?><br />
                  <a href="<?php echo $menuurl; ?>" target="_blank" class="orange_text"><u>view menu</u></a> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; <a target="_blank" href="https://maps.google.ca/maps?q=<?php echo
$data['_restaurant_location']; ?>+<?php echo
$data['zipcode']; ?>+<?php echo
$data['state']; ?>+<?php echo
$data['city']; ?>+map" class="orange_text"><u>view map</u></a> </p>
              </div>
              <div class="clear"></div>
              <div class="day_services_search"> <span class="fl"><img src="<?php echo
get_template_directory_uri(); ?>/images/star-img-small.png" alt="" /></span>
                <div class="fl">
                  <?php $dayschedule = str_replace('"', '', str_replace("]", "",
str_replace("[", "", $data['dayschedule'])));
?>
                  <ul class="boder_btm">
                    <?php
        if (strstr($dayschedule, 'Monday'))
            $mclass = "mon";
        else
            $mclass = "mon holiday";

        if (strstr($dayschedule, 'Tuesday'))
            $tclass = "tue";
        else
            $tclass = "tue holiday";

        if (strstr($dayschedule, 'Wednesday'))
            $wclass = "wed";
        else
            $wclass = "wed holiday";


        if (strstr($dayschedule, 'Thursday'))
            $thclass = "thu";
        else
            $thclass = "thu holiday";

        if (strstr($dayschedule, 'Friday'))
            $fclass = "fri";
        else
            $fclass = "fri holiday";

        if (strstr($dayschedule, 'Saturday'))
            $sclass = "sat";
        else
            $sclass = "sat holiday";

        if (strstr($dayschedule, 'Sunday'))
            $snclass = "sun";
        else
            $snclass = "sun holiday";

?>
                    <li class="<?php echo $mclass; ?>">&nbsp;</li>
                    <li class="<?php echo $tclass; ?>">&nbsp;</li>
                    <li class="<?php echo $wclass; ?>">&nbsp;</li>
                    <li class="<?php echo $thclass; ?>">&nbsp;</li>
                    <li class="<?php echo $fclass; ?>">&nbsp;</li>
                    <li class="<?php echo $sclass; ?>">&nbsp;</li>
                    <li class="<?php echo $snclass; ?>">&nbsp;</li>
                  </ul>
                  <div class="clear"></div>
                  <?php $nightschedule = str_replace('"', '', str_replace("]",
"", str_replace("[", "", $data['nightschedule'])));
?>
                  <?php
        if (strstr($nightschedule, 'Monday'))
            $mclass1 = "mon";
        else
            $mclass1 = "mon holiday";

        if (strstr($nightschedule, 'Tuesday'))
            $tclass1 = "tue";
        else
            $tclass1 = "tue holiday";

        if (strstr($nightschedule, 'Wednesday'))
            $wclass1 = "wed";
        else
            $wclass1 = "wed holiday";


        if (strstr($nightschedule, 'Thursday'))
            $thclass1 = "thu";
        else
            $thclass1 = "thu holiday";

        if (strstr($nightschedule, 'Friday'))
            $fclass1 = "fri";
        else
            $fclass1 = "fri holiday";

        if (strstr($nightschedule, 'Saturday'))
            $sclass1 = "sat";
        else
            $sclass1 = "sat holiday";

        if (strstr($nightschedule, 'Sunday'))
            $snclass1 = "sun";
        else
            $snclass1 = "sun holiday";


?>
                  <ul>
                    <li class="<?php echo $mclass1; ?>">&nbsp;</li>
                    <li class="<?php echo $tclass1; ?>">&nbsp;</li>
                    <li class="<?php echo $wclass1; ?>">&nbsp;</li>
                    <li class="<?php echo $thclass1; ?>">&nbsp;</li>
                    <li class="<?php echo $fclass1; ?>">&nbsp;</li>
                    <li class="<?php echo $sclass1; ?>">&nbsp;</li>
                    <li class="<?php echo $snclass1; ?>">&nbsp;</li>
                  </ul>
                </div>
                <div class="clear"></div>
                <div class="thump_wrap">
                  <?php if ($data['discount'] == '30%') { ?>
                  <img src="<?php echo get_template_directory_uri(); ?>/images/img-fire-yellow-low.png" alt="" class="vb" />
                  <?php } ?>
                  <?php if ($data['discount'] == '40%') { ?>
                  <img src="<?php echo get_template_directory_uri(); ?>/images/img-fire-orange-middle.png" alt="" class="vb" />
                  <?php } ?>
                  <?php if ($data['discount'] == '50%') { ?>
                  <img src="<?php echo get_template_directory_uri(); ?>/images/img-fire-red-high.png" alt="" class="vb" />
                  <?php } ?>
                  <?php if ($data['maxpeople'] == 'X2') { ?>
                  <img src="<?php echo get_template_directory_uri(); ?>/images/icon-user-two.png" alt="" class="vb" />
                  <?php } ?>
                  <?php if ($data['maxpeople'] == 'X4') { ?>
                  <img src="<?php echo get_template_directory_uri(); ?>/images/icon-user-four.png" alt="" class="vb" />
                  <?php } ?>
                  <?php if ($data['maxpeople'] == 'X6') { ?>
                  <img src="<?php echo get_template_directory_uri(); ?>/images/icon-user-six.png" alt="" class="vb" />
                  <?php } ?>
                  <?php if ($data['maxpeople'] == 'X8') { ?>
                  <img src="<?php echo get_template_directory_uri(); ?>/images/icon-user-eight.png" alt="" class="vb" />
                  <?php } ?>
                  <?php if ($data['maxpeople'] == 'X10') { ?>
                  <img src="<?php echo get_template_directory_uri(); ?>/images/icon-user-ten.png" alt="" class="vb" />
                  <?php } ?>
                  <?php if ($data['maxpeople'] == 'X12') { ?>
                  <img src="<?php echo get_template_directory_uri(); ?>/images/icon-user-double.png" alt="" class="vb" />
                  <?php } ?>
                  <?php if ($data['turnofficon'] == 'On') { ?>
                  <img src="<?php echo get_template_directory_uri(); ?>/images/icon-userpng.png" alt="" class="vb" />
                  <?php } ?>
                  <?php if ($turnoffphoneicon == 'On') { ?>
                  <img src="<?php echo get_template_directory_uri(); ?>/images/icon-phone.png" alt="" class="vb" />
                  <?php } ?>
                  <a href="/?page_id=152&id=<?php echo $restId; ?>" class="orange_text fr mtop_15">more details</a></div>
                <div class="clear"></div>
              </div>
            </div>
            <div class="clear"></div>
          </div>
        </div>
        <input type="hidden" value="<?php echo $address; ?>" id="address<?php echo
$restId; ?>" name="address" class="input" />
<!--	-->		
<div  id="hoverDiv<?php echo $restId; ?>" class="hoverDiv" onclick="MouseOverBounce(<?php echo $i; ?>);"  onmouseout="MouseOutBounce(<?php echo
$i; ?>);" onmouseover="MouseOverBounce(<?php echo
$i; ?>);" >
        <h2 id="rstname<?php echo $restId; ?>" class="abc"><?php echo $row['post_title']; ?></h2>
        <div class="more_details_wrap" id="rstdetail<?php echo $restId; ?>"> <img src="http://<?php echo
$_SERVER['HTTP_HOST'] . "/" . $dest; ?>" alt="" class="img"  />
          <div class="overfllow">



		    <p>Bookings: <?php
        //print_r( $categories);
        if ($mobile_browser > 0) {
            // do something ?><a href="tel:<?php echo $data['phonenumber']; ?>"><?php echo
$data['phonenumber']; ?></a>
   <?php
        } else {
            echo $data['phonenumber']; // do something else
        } ?><br />
              Location: <?php echo $data['_restaurant_location']; ?>, <br />
              <?php echo $data['city']; ?>, <?php echo $data['state']; ?> <?php echo
$data['zipcode']; ?><br />
                       <?php
        $terms = get_the_terms($restId, 'cuisine_type');

        if ($terms && !is_wp_error($terms)):

            $draught_links = array();

            foreach ($terms as $term) {
                $draught_links[] = $term->name;
            }

            $on_draught = join(", ", $draught_links);
?>

	Cuisine: <?php echo $on_draught; ?>

<?php endif; ?><br />
              <a href="<?php echo $menuurl; ?>" target="_blank" class="orange_text"><u>view menu</u></a> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; <a target="_blank" href="https://maps.google.ca/maps?q=<?php echo
$data['_restaurant_location']; ?>+<?php echo
$data['zipcode']; ?>+<?php echo
$data['state']; ?>+<?php echo
$data['city']; ?>+map" class="orange_text"><u>view map</u></a> </p>
          </div>
          <div class="clear"></div>
          <div class="day_services_search"> <span class="fl"><img src="<?php echo
get_template_directory_uri(); ?>/images/star-img-small.png" alt="" /></span>
            <div class="fl">
              <?php $dayschedule = str_replace('"', '', str_replace("]", "",
str_replace("[", "", $data['dayschedule'])));
?>
              <ul class="boder_btm">
                <?php
        if (strstr($dayschedule, 'Monday'))
            $mclass = "mon";
        else
            $mclass = "mon holiday";

        if (strstr($dayschedule, 'Tuesday'))
            $tclass = "tue";
        else
            $tclass = "tue holiday";

        if (strstr($dayschedule, 'Wednesday'))
            $wclass = "wed";
        else
            $wclass = "wed holiday";


        if (strstr($dayschedule, 'Thursday'))
            $thclass = "thu";
        else
            $thclass = "thu holiday";

        if (strstr($dayschedule, 'Friday'))
            $fclass = "fri";
        else
            $fclass = "fri holiday";

        if (strstr($dayschedule, 'Saturday'))
            $sclass = "sat";
        else
            $sclass = "sat holiday";

        if (strstr($dayschedule, 'Sunday'))
            $snclass = "sun";
        else
            $snclass = "sun holiday";

?>
                <li class="<?php echo $mclass; ?>">&nbsp;</li>
                <li class="<?php echo $tclass; ?>">&nbsp;</li>
                <li class="<?php echo $wclass; ?>">&nbsp;</li>
                <li class="<?php echo $thclass; ?>">&nbsp;</li>
                <li class="<?php echo $fclass; ?>">&nbsp;</li>
                <li class="<?php echo $sclass; ?>">&nbsp;</li>
                <li class="<?php echo $snclass; ?>">&nbsp;</li>
              </ul>
              <div class="clear"></div>
              <?php $nightschedule = str_replace('"', '', str_replace("]", "",
str_replace("[", "", $data['nightschedule'])));
?>
              <?php
        if (strstr($nightschedule, 'Monday'))
            $mclass1 = "mon";
        else
            $mclass1 = "mon holiday";

        if (strstr($nightschedule, 'Tuesday'))
            $tclass1 = "tue";
        else
            $tclass1 = "tue holiday";

        if (strstr($nightschedule, 'Wednesday'))
            $wclass1 = "wed";
        else
            $wclass1 = "wed holiday";


        if (strstr($nightschedule, 'Thursday'))
            $thclass1 = "thu";
        else
            $thclass1 = "thu holiday";

        if (strstr($nightschedule, 'Friday'))
            $fclass1 = "fri";
        else
            $fclass1 = "fri holiday";

        if (strstr($nightschedule, 'Saturday'))
            $sclass1 = "sat";
        else
            $sclass1 = "sat holiday";

        if (strstr($nightschedule, 'Sunday'))
            $snclass1 = "sun";
        else
            $snclass1 = "sun holiday";

?>
              <ul>
                <li class="<?php echo $mclass1; ?>">&nbsp;</li>
                <li class="<?php echo $tclass1; ?>">&nbsp;</li>
                <li class="<?php echo $wclass1; ?>">&nbsp;</li>
                <li class="<?php echo $thclass1; ?>">&nbsp;</li>
                <li class="<?php echo $fclass1; ?>">&nbsp;</li>
                <li class="<?php echo $sclass1; ?>">&nbsp;</li>
                <li class="<?php echo $snclass1; ?>">&nbsp;</li>
              </ul>
            </div>
            <div class="clear"></div>
            <div class="thump_wrap">
              <?php if ($data['discount'] == '30%') { ?>
              <img src="<?php echo get_template_directory_uri(); ?>/images/img-fire-yellow-low.png" alt="" class="vb" />
              <?php } ?>
              <?php if ($data['discount'] == '40%') { ?>
              <img src="<?php echo get_template_directory_uri(); ?>/images/img-fire-orange-middle.png" alt="" class="vb" />
              <?php } ?>
              <?php if ($data['discount'] == '50%') { ?>
              <img src="<?php echo get_template_directory_uri(); ?>/images/img-fire-red-high.png" alt="" class="vb" />
              <?php } ?>
              <?php if ($data['maxpeople'] == 'X2') { ?>
              <img src="<?php echo get_template_directory_uri(); ?>/images/icon-user-two.png" alt="" class="vb" />
              <?php } ?>
              <?php if ($data['maxpeople'] == 'X4') { ?>
              <img src="<?php echo get_template_directory_uri(); ?>/images/icon-user-four.png" alt="" class="vb" />
              <?php } ?>
              <?php if ($data['maxpeople'] == 'X6') { ?>
              <img src="<?php echo get_template_directory_uri(); ?>/images/icon-user-six.png" alt="" class="vb" />
              <?php } ?>
              <?php if ($data['maxpeople'] == 'X8') { ?>
              <img src="<?php echo get_template_directory_uri(); ?>/images/icon-user-eight.png" alt="" class="vb" />
              <?php } ?>
              <?php if ($data['maxpeople'] == 'X10') { ?>
              <img src="<?php echo get_template_directory_uri(); ?>/images/icon-user-ten.png" alt="" class="vb" />
              <?php } ?>
              <?php if ($data['maxpeople'] == 'X12') { ?>
              <img src="<?php echo get_template_directory_uri(); ?>/images/icon-user-double.png" alt="" class="vb" />
              <?php } ?>
              <?php if ($data['turnofficon'] == 'On') { ?>
              <img src="<?php echo get_template_directory_uri(); ?>/images/icon-userpng.png" alt="" class="vb" />
              <?php } ?>
              <?php if ($turnoffphoneicon == 'On') { ?>
              <img src="<?php echo get_template_directory_uri(); ?>/images/icon-phone.png" alt="" class="vb" />
              <?php } ?>
              <a href="/?page_id=152&id= <?php echo $restId; ?>" class="orange_text fr mtop_15">more details</a></div>
            <div class="clear"></div>
          </div>
        </div>
		</div>
        <div class="clear"></div>
        <?php $i++;
    } ?>
      </div>	

<?php


}
$xml = $xml . '</markers>';

$ourFileName = "map.xml";
$ourFileHandle = fopen($ourFileName, 'w') or die("can't open file");
fwrite($ourFileHandle, $xml);
fclose($ourFileHandle);
die;


?>