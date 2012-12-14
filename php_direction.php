<?php
$lat1 = '53.838123026145425';
$lon1 = '-8.756103078124966';

$lat2 = '53.36220818828';
$lon2 = '-7.767333546874966';
$url = str_replace(' ', '%20', "http://maps.google.com/maps/nav?client=localhost&output=json&q=from: ".$lat1.",".$lon1." to: ".$lat2.",".$lon2);
$url = 'http://maps.google.com/maps/nav?output=json&q=50321%20to%2050265&key=YOUR-KEY-HERE';

$result = file_get_contents($url);

$data = json_decode(utf8_encode($result), true);
print_r($data["Directions"]["Routes"][0]["Steps"][0]);


//$request='http://maps.googleapis.com/maps/api/directions/json?origin=(53.838,-8.7561030)&alternatives=false&units=imperial&destination=(53.362,-7.76733030)&sensor=false';
function parseMapData($start,$end){
	$request='http://maps.googleapis.com/maps/api/directions/json?origin='.$start.'&alternatives=false&units=imperial&destination='.$end.'&sensor=false';
	$result = file_get_contents($request);
	$jsondata = json_decode(utf8_encode($result), true);
	return $jsondata;
}
?>