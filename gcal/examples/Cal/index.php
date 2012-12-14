<?php
header("Content-type: text/html; charset=utf-8");
/*
 * Copyright 2011 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

require_once '../../src/apiClient.php';
require_once '../../src/contrib/apiCalendarService.php';
require_once '../../src/contrib/apiUserInfoService.php';

session_start();

$client = new apiClient();
$client->setApplicationName("Google+ PHP Starter Application");
// Visit https://code.google.com/apis/console to generate your
// oauth2_client_id, oauth2_client_secret, and to register your oauth2_redirect_uri.
 //$client->setClientId('489921390194.apps.googleusercontent.com');
 //$client->setClientSecret('gyaV_xnJ6wix7PNLv5wzsIER');
 //$client->setRedirectUri('http://localhost/gcal/examples/cal/index.php');
// $client->setDeveloperKey('insert_your_developer_key');
$cal = new apiCalendarService($client);

if (isset($_REQUEST['logout'])) {
  unset($_SESSION['access_token']);
}

if (isset($_GET['code'])) {
  $client->authenticate();
  $_SESSION['access_token'] = $client->getAccessToken();
  header('Location: http://' . $_SERVER['HTTP_HOST'] . $_SERVER['PHP_SELF']);
}

if (isset($_SESSION['access_token'])) {
  $client->setAccessToken($_SESSION['access_token']);
}

//print_r($_SESSION['access_token']);
if ($client->getAccessToken()) {
  $lst = $cal->calendarList->listCalendarList();
//	$t = $client->getAccessToken();echo "00".$t["access_token"];
  //$u = new apiUserInfoService($client);
  //$u1 = $u->userinfo->userinfo("ya29.AHES6ZS-Y5X7yUzBOj8ciXRSuWSYReaoJSsFONrgyx4Zy2c");
  
  //$settings = $cal->settings;
	//$s = $settings->listSettings();
	 
  // The access token may have been updated lazily.
  $_SESSION['access_token'] = $client->getAccessToken();
} else {
  $authUrl = $client->createAuthUrl();
}
?>
<!doctype html>
<html>
<head><link rel='stylesheet' href='style.css' /></head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<body>
<header><h1>Google Calendar Sample Demo</h1></header>
<?php
  if(isset($authUrl)) {
    print "<a class='login' href='$authUrl'>Connect Me!</a>";
  } else {
   print "<a class='logout' href='?logout'>Logout</a>";
  }
?>
</body>
</html>