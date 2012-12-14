<html>
<head>
    <meta name="viewport" content="initial-scale=1.0, user-scalable=no" />
    <meta http-equiv="content-type" content="text/html; charset=UTF-8" />
    <title>Google Maps JavaScript API v3 Demo -- Direction </title>
    <link rel="stylesheet" href="http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.16/themes/base/jquery-ui.css"
        type="text/css" media="all" />

    <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.min.js" type="text/javascript"></script>

    <script src="http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.16/jquery-ui.min.js"
        type="text/javascript"></script>

    <script type="text/javascript" src="http://maps.google.com/maps/api/js?language=en&sensor=false"></script>
	<script type="text/javascript" src="scripts/route.js"></script>
    <style>
        body
        {
            margin: 0px;
            font-size: 12px;
            font-family: Arial;
            background-color: #fff;
            color: #333;
        }
        *
        {
            font-size: 12px;
            margin: 0;
        }
        .adp-placemark
        {
            background: #EEEEEE;
            border: 1px solid #c0c0c0;
            width: 100%;
        }
        .adp-summary
        {
            line-height: 28px;
            padding: 4px;
        }
        .adp-step td
        {
            border-top: 1px solid #c0c0c0;
            padding: 2;
        }
        .adp-substep
        {
            padding: 2px;
        }
    </style>

 

</head>
<body onload="initialize()">
    <div style="margin: 0 auto; width: 1000px;">
        <div style="display: none;">
            Select date:<input type="text" value="03/24/2010" id="day" /><span style="display: none;
                color: red;" id="validmsg">* input day</span>
            <input type="button" style="cursor: pointer;" id="btnRoute" value="Route for the day" />
            <span style="display: none;" id="progress">
                loading..</span>
        </div>
        <input type="hidden" value="231" id="UserID" />
        <div id="map_canvas" style="float: left; width: 700px; height: 700px">
        </div>
        <div style="float: right; width: 300px; height: 700px; overflow: auto">
			
            <div id="directions_panel" style="width: 100%">
            </div>
        </div>
    </div>
</body>
</html>
