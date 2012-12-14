<?php
header("Content-type: text/html; charset=utf-8");
require_once '../../src/apiClient.php';
require_once '../../src/contrib/apiCalendarService.php';

session_start();
$client = new apiClient();

//print_r($_POST);

if (isset($_SESSION['access_token'])) {
  $client->setAccessToken($_SESSION['access_token']);
}

if (!$client->getAccessToken()) {
	echo json_encode(array ('result'=>0,'msg'=>'Invalid access!'));
	exit;
}
if(isset($_POST["calendar"])){
	$cal = new apiCalendarService($client);

	$calendarId= $_POST["calendar"];	
	
	$optParams = array('showDeleted'=>false);
	if(isset($_POST["keyword"]) && $_POST["keyword"] !="")$optParams["q"] =$_POST["keyword"];
	if(isset($_POST["timezone"]) && $_POST["timezone"] !="")$optParams["timeZone"] =$_POST["timezone"];
	if(isset($_POST["dateStart"]) && is_date($_POST["dateStart"]))$optParams["timeMin"] = date("Y-m-d\TH:i:s\Z",strtotime($_POST["dateStart"]));
	if(isset($_POST["dateEnd"]) && is_date($_POST["dateEnd"]))$optParams["timeMax"] =date("Y-m-d\TH:i:s\Z",strtotime($_POST["dateEnd"]));

	$listevents = $cal->events->listEvents($calendarId,$optParams);
	$result = 0;
	if($listevents && array_key_exists('items', $listevents) && count($listevents['items'])>0){
		$listevents['items']=record_sort2($listevents['items'],'start','dateTime');
		$result = count($listevents['items']);
	}
	echo json_encode(array ('result'=>$result,'data'=>$listevents));
}else{
	echo json_encode(array ('result'=>0));
}
function record_sort2($array, $key,$key2) { 
  for ($i = 0; $i < sizeof($array); $i++) { 
       if(! empty($array[$i][$key][$key2])){ 
       $sort_values[$i] = $array[$i][$key][$key2]; 
       }else{ 
       $sort_values[$i] = $array[$i]; 
       } 
  } 
  asort ($sort_values); 
  reset ($sort_values); 
  while (list ($arr_keys, $arr_values) = each ($sort_values)) { 
         $sorted_arr[] = $array[$arr_keys]; 
  } 
  return $sorted_arr; 
} 
function record_sort($records, $field, $reverse=false)
{
    $hash = array();
    
    foreach($records as $key => $record)
    {
        $hash[$record[$field].$key] = $record;
    }
    
    ($reverse)? krsort($hash) : ksort($hash);
    
    $records = array();
    
    foreach($hash as $record)
    {
        $records []= $record;
    }
    
    return $records;
}
function is_date( $str ) {
  $stamp = strtotime( $str );
  
  if (!is_numeric($stamp)) { 
     return FALSE; 
  } 
  $month = date( 'm', $stamp ); 
  $day   = date( 'd', $stamp ); 
  $year  = date( 'Y', $stamp );  
  if (checkdate($month, $day, $year)) { 
     return TRUE; 
  } 
  return FALSE; 
} 
?>