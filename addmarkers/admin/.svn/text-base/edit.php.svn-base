<html>
  <head>
    <title>
      edit information
    </title>
    <script type="text/javascript" src="http://www.google.com/jsapi"></script>
      <script type="text/javascript"> 
          google.load("maps", "3",  {other_params:"sensor=false"});
          google.load("jquery", "1.3.2");
    </script>
  </head>
<?php
$op = $_GET ["op"];
$myrow;

require_once('saemysql.class.php');
$mysql = new SaeMysql();

if ($_POST ["name"]) {
					if ($op=="edit"){
					$sql = "update`OrgInfos` set logoimgpath='".$_POST["logoimgpath"]."',name='".$_POST["name"]."', city='".$_POST["city"]."', area='".$_POST["area"]."',subarea='".$_POST["subarea"]."', address='".$_POST["address"]."', lat='".$_POST["lat"]."', lng='".$_POST["lng"]."' where id=".$_POST ["id"];
          }
					else{
					$sql = "insert into `OrgInfos`(logoimgpath,name,city,area,subarea,address,lat,lng) values('".$_POST["logoimgpath"]."','".$_POST["name"]."','".$_POST["city"]."','".$_POST["area"]."','".$_POST["subarea"]."','".$_POST["address"]."','".$_POST["lat"]."','".$_POST["lng"]."')";
          }
					if ($mysql->runSql($sql)) {
						echo "success!";
					}
					else
					{
							echo "fail".$mysql->errmsg ();
						}
          $mysql->closeDb();
} 
else {
   $sql = "select * FROM `OrgInfos` where id=".$_GET ["id"];
   $data = $mysql->getData( $sql );
   $myrow = $data[0];
   $mysql->closeDb();
}
?>
<form action="<?php echo $_SERVER['REQUEST_URI']; ?>" method="post">
  <input type="hidden" class="text" name="id" value="<?php echo $myrow["id"] ?>" />
  <table class="mytab" border="0" id="ulist">
<tr>
      <td>
        image type:
      </td>
      <td align="center">
        <select id="logoimgpath" name="logoimgpath">
        	<option>a</option>
        	<option>b</option>
        	<option>c</option>
        	<option>d</option>
        	<option>e</option>
        	<option>f</option>
        	<option>g</option>
        	<option>h</option>
        </select>
      </td>
    </tr>
    <tr>
      <td>
        name:
      </td>
      <td align="center">
        <input type="text" class="text" name="name" value="<?php echo $myrow["name"] ?>" />
      </td>
    </tr>
    <tr>
      <td>
        city:
      </td>
      <td align="center">
        <input type="text" class="text" name="city" value="<?php echo $myrow["city"]?>" />
      </td>
    </tr>
    <tr>
      <td>
        area:
      </td>
      <td align="center">
        <input type="text" class="text" name="area" value="<?php echo $myrow["area"]?>" />
      </td>
    </tr>
    <tr>
      <td>
        subarea:
      </td>
      <td align="center">
        <input type="text" class="text" name="subarea" value="<?php echo $myrow["subarea"]?>" />
      </td>
    </tr>
    <tr>
      <td>
        address:
      </td>
      <td align="center">
        <input type="text" class="text" name="address" id="address" value="<?php echo $myrow["address"]?>" />
      </td>
    </tr>
    <tr>
      <td>
        lat:
      </td>
      <td align="center">
        <input type="text" class="text" name="lat" id="lat" value="<?php echo $myrow["lat"]?>" />
      </td>
    </tr>
    <tr>
      <td>
        lng:
      </td>
      <td align="center">
        <input type="text" class="text" name="lng" id="lng" value="<?php echo $myrow["lng"]?>" />
      </td>
    </tr>
    <tr>
      <td colspan="2" align="center">
        <input type="submit" value="save"></input>
      </td>

    </tr>
  </table>
  
  <div id="map_canvas" style="border:	1px solid #ccc;width:500px;height:400px;"></div>
  <script type="text/javascript" src="../js/gmap_set.js"></script>
</form>