<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <title>Map search page</title>
    <link rel="stylesheet" type="text/css" href="css/style.css" />
    <meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
    <script type="text/javascript" src="http://maps.google.com/maps/api/js?sensor=false"></script>
    <script src="http://code.jquery.com/jquery.min.js" type="text/javascript"></script>
    <script src="https://raw.github.com/andris9/jStorage/master/jstorage.js"></script>
    <script src="http://google-maps-utility-library-v3.googlecode.com/svn/trunk/markerclusterer/src/markerclusterer.js" type="text/javascript"></script>
    <script src="js/jquery.scrollTo-1.4.2-min.js" type="text/javascript"></script>

    </body>
</head>
<body>
    <div id="container">
        <div id="poiBox">

            <div id="map"></div>
        </div>
        <div id="searchForm" class="compactPanel">

            <div id="inlineForm">
                <table id="" style="text-align: left;" border="0">
                    <tr>
                        <td>Location:</td>
                        <td>
                            <input id="locationInput" placeholder="location" type="text" name="location" />

                            <div style="display: none;">
                                <label>
                                    <input name="toggleshow" type="checkbox" checked="checked" value="orange" />
                                    Toggle Show</label>
                                <label>
                                    <input name="chbtype" type="checkbox" checked="checked" value="orange" />
                                    <img src="http://maps.google.com/mapfiles/marker_orange.png" /></label>
                                <label>
                                    <input name="chbtype" type="checkbox" checked="checked" value="green" />
                                    <img src="http://maps.google.com/mapfiles/marker_green.png" /></label>
                                <label>
                                    <input name="chbtype" type="checkbox" checked="checked" value="black" />
                                    <img src="http://maps.google.com/mapfiles/marker_black.png" /></label>
                            </div>
                        </td>

                    </tr>
                    <tr>
                        <td valign="top">Distance:</td>
                        <td>
                            <select size="1" id="buffer" class="distance" title="" name="buffer">
                                <option value="">Select . . .</option>
                                <option value="1000">1km</option>
                                <option value="2000">2km</option>
                                <option value="5000" selected>5km</option>
                                <option value="10000">10km</option>
                                <option value="20000">20km</option>
                                <option value="100000">100km</option>
                                <option value="5000000">5000km</option>
                            </select>
                        </td>

                    </tr>
                    <tr>
                        <td>

                            <input type="button" class="searchbtn" id="btnSubmit" name="btnSubmit" value="search" />

                        </td>
                        <td></td>
                    </tr>
                </table>
            </div>

        </div>
        <div id="listPanel" class="compactPanel">
            <div id="poiList" class="snippets">
            </div>
        </div>
        <div id="actionMenu" class="gmnoprint" style="height: 19px;">
            <div id="searchActionMenu" title="Change search criteria"
                onclick="toggleSearchPanel();">
                Search     
            </div>
            <div id="listActionMenu" title="Show result list"
                onclick="toggleListPanel();">
                List     
            </div>
        </div>
    </div>
	<script>
	<?php
$where = "";
if(isset($_GET["state"])){
	$where = $where ."and State='".$_GET["state"]."' ";
}
if(isset($_GET["city"])){
	$where = $where ."and City='".$_GET["city"]."' ";
}
echo 'var strwhere = "'. ltrim($where,"and") .'";';

if(isset($_GET["location"])){
	echo 'var strlocation = "'. $_GET["location"] .'";';
}
if(isset($_GET["orderby"])){
	echo 'var strorderby = "'. $_GET["orderby"] .'";';
}
if(isset($_GET["radius"])){
	echo 'var strradius = "'. $_GET["radius"] .'";';
}
/*
	//Test usage : 
	$apiKey = 'ABQIAAAArVQcVxX32bZ7slezKjYHNxRRy_GDkcWXYwd3sTg48YTx-thxPhQCycvjjWX6XIj0M-uyYhSg6sW5QQ';
	$obj = new googleHelper($apiKey);
	print '<pre>';
	print_r($obj->getCoordinates('Romania,Sibiu,Sibiu'));
	*/

	class googleHelper {
	 	
		/**
		* The Google Maps API key holder
		* @var string 
		*/
	 	private $mapApiKey;
	 
		/**
		* Class Constructor
		* @param string $mapApiKey A Google Maps API Key (you can get one from http://code.google.com/apis/maps/signup.html)
		*/
		public function __construct($mapApiKey = '') {
		 	if ($mapApiKey){
				$this->mapApiKey;
			} else {
			 	throw new Exception(__CLASS__ . ' error : You must set your API key before using this class!');
			}
		}
		
		/**
		* Reads an URL to a string
		* @param string $url The URL to read from
		* @return string The URL content
		*/
		private function getURL($url){
		 	$ch = curl_init();
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
			curl_setopt($ch, CURLOPT_HEADER, 0);
			curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
			curl_setopt($ch, CURLOPT_URL, $url);
			$tmp = curl_exec($ch);
			curl_close($ch);
			if ($tmp != false){
			 	return $tmp;
			}
		}
		
		/**
		* Get Latitude/Longitude/Altitude based on an address
		* @param string $address The address for converting into coordinates
		* @return array An array containing Latitude/Longitude/Altitude data
		*/
		public function getCoordinates($address){
			$address = str_replace(' ','+',$address);
		 	$url = 'http://maps.google.com/maps/geo?q=' . $address . '&output=xml&key=' . $this->mapApiKey;
		 	$data = $this->getURL($url);
			if ($data){
				$xml = new SimpleXMLElement($data);
				$requestCode = $xml->Response->Status->code;
				if ($requestCode == 200){
				 	//all is ok
				 	$coords = $xml->Response->Placemark->Point->coordinates;
				 	$coords = explode(',',$coords);
				 	if (count($coords) > 1){
				 		if (count($coords) == 3){
						 	return array('lat' => $coords[1], 'long' => $coords[0], 'alt' => $coords[2]);
						} else {
						 	return array('lat' => $coords[1], 'long' => $coords[0], 'alt' => 0);
						}
					}
				}
			}
			//return default data
			return array('lat' => 0, 'long' => 0, 'alt' => 0);
		}
		

	}; //end class
?>
</script>
    <script src="js/map.js?t=2s44w" type="text/javascript"></script>
</body>
</html>
