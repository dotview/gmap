<html> 
<head> 
<meta name="viewport" content="initial-scale=1.0, user-scalable=no" /> 
<meta http-equiv="content-type" content="text/html; charset=UTF-8"/> 
    <title>Gmap Apps Demo</title>
    <meta name="description" content="test">
    <meta name="keywords" content="test">
    <link href="/style/common.css" rel="stylesheet" type="text/css" id="Link2">
    <script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.min.js"></script>
    <script type="text/javascript" charset="UTF-8" src="http://maps.google.com/maps/api/js?sensor=false"></script>
    <script src="js/Image.js" charset="UTF-8" type="text/javascript"></script>

</head>
<body topmargin="0" onload="map_initialize();" marginheight="0" scroll="no">
    <!--content-->
    <div id="content">
        <div id="column_left">
            <div id="left_tab">
                <div class="curtab" id="tab_latest">
                    <span>详细信息</span></div>
                <div class="commontab" id="tab_top">
                    <span>其他信息</span></div>
            </div>
            <div id="tabpic" class="gallery">
                <div id="d_pic_latest" style="float: left; margin: 4px;">
                    <ul>
                        <li style="height: 170px;">
                            <div style="float: left; width: 258px; height: 168px; border: 1px solid #ccc; text-align: center;"
                                id="g_image">
                            </div>
                        </li>
                        <li style="height: 170px;">
                            <div style="float: left; width: 258px; height: 168px; border: 1px solid #ccc; text-align: center;"
                                id="g_flash">
                                
                            </div>
                        </li>
                        <li id="info"></li>
                        <li id="list"></li>
                    </ul>
                </div>
                <div id="pic_top" style="display: none; float: left; margin: 4px;">
                    <ul>
                        <li style="height: 134px;"></li>
                    </ul>
                </div>
            </div>
        </div>
        <div id="column_spit">
            <img src="images/switch_left.gif" /></div>
        <div id="column_main">
            <div>
                <div style="height: 522px; background-color: rgb(229, 227, 223); border: 2px solid #80AB73;"
                    id="map_property" class="map_right">
                </div>
            </div>
        </div>
        <!--end content-->
      

        <script src="http://s19.cnzz.com/stat.php?id=2920792&web_id=2920792" language="JavaScript"></script>

        <script src="js/default.js" charset="UTF-8" type="text/javascript"></script>
</body>
</html>
