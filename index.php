<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<title>Google map Demos</title>
<link href="style/index.css" rel="stylesheet" type="text/css" />
<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.min.js"></script>
<script src="js/index.js" charset="UTF-8" type="text/javascript"></script>
</head>
<body>
	<div id="fb-root"></div>
<script>(function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s); js.id = id;
  js.src = "//connect.facebook.net/en_US/all.js#xfbml=1&appId=246461578724027";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));</script>
    <div id="header">

    <table width="97%" height='20px' border="0" align="left" cellspacing="0" >
      <tr>
        <td>
        <a class="titlelink" href="http://gmap.sinaapp.com" >
			Google map Demos
        </a>
        </td>
       
        <td width="30%" valign="middle"  style="text-align:right;">
          
            
                <div class="fb-like" data-href="http://gmap.sinaapp.com" data-send="false" data-layout="button_count" data-width="100" data-show-faces="false" data-colorscheme="dark"></div>
				
				<a href="https://twitter.com/share" class="twitter-share-button" data-url="http://gmap.sinaapp.com" data-text="Google Map examples" data-via="dotview">Tweet</a>
				
<script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src="//platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");</script>

              <a href='aboutme.php' target="mainFrame" style='margin-right : 10px;' >
                about me
            </a>
        </td>
      </tr>
    </table>
    </div>
	
    <div id="container" >
        <div id="sidebar">
            <div id="demoList" style = 'height:100%;'>
                <?php include_once("templates/top.php") ?>
           
			 <div id="footer">
				© 2012  by Dotview <script src="http://s21.cnzz.com/stat.php?id=3061506&web_id=3061506" language="JavaScript"></script>
			</div> 
			</div>
        </div>
		<div id="column_spit">
            <img src="images/switch_left.gif" /></div>
        <div id="content">
            <iframe name='mainFrame' onload='frameLoaded(event);' id="mainFrame" src="<?php echo isset($_GET["q"]) ? $_GET["q"] : "homepage.php" ?>" frameborder="0"></iframe>
            <div id='loading'>
                <img src='images/loading.gif' />
            </div>
        </div>
		
    </div>
   
</body>
</html>
