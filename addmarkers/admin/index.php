<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <title>
      data list
    </title>
    <style>
    
.mytab{background:#fff; border-collapse:collapse; border-width:1px; border-style:solid; border-color:#80AB73; width:100%; margin:0 auto}
.mytab tr{border:1px solid #9cf; padding:1em 0.6em; color:red; text-align:left}
.mytab th{border:1px solid #80AB73; padding:0.4em 0.3em; color:green; background-image:url(../images/f2_10.gif); text-align:center; height:20px}
.mytab td{border:1px solid #80AB73; padding:0.1em; color:green; text-align:center}
.mytab tr:hover{background-color:lightyellow; color:inherit}
    </style>
  </head>
  <body>
    <?php
require_once('saemysql.class.php');

 $mysql = new SaeMysql();
 
 $pg = $_GET ["pg"];
$pagesize = 10; //per page records
$limitFrom = 0; //start num
if (! isset ( $pg )) {
	$pg = 1;
}
if ($pg > 1) {
	$limitFrom = $pagesize * ($pg - 1);
} else {
	$limitFrom = 0;
}

$result1 = "select count(*) as cnt from `OrgInfos`";
$recordcount =  $mysql->getLine ( $result1 );

$recordcount=$recordcount["cnt"]; 

 $sql = "SELECT * FROM `OrgInfos` LIMIT $limitFrom,$pagesize";
 $data = $mysql->getData( $sql );

 $mysql->closeDb();
 ?>


    <div id="content">
      <div id="sm">
        <a style="color:Red;font-weight:bold;margin-left:12px;border:0px solid #58A31B;" class="button2" href="edit.php"> create </a>
      </div>
      <table class="mytab" border="0" id="ulist">
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>City</th>
          <th>Area</th>
          <th>SubArea</th>
          <th>address</th>
          <th>Addtime</th>
          <th></th>
        </tr>
        <?php foreach ( $data as $myrow) {?>
        <tr>
          <td align="center">
            <?php echo $myrow["id"]?>
          </td>
          <td align="center">
            <?php echo $myrow["name"]?>
          </td>
          <td align="center">
            <?php echo $myrow["city"]?>
          </td>
          <td align="center">
            <?php echo $myrow["area"]?>
          </td>
          <td align="center">
            <?php echo $myrow["subarea"]?>
          </td>
          <td align="center">
            <?php echo $myrow["address"]?>
          </td>
          <td align="center">
            <?php echo $myrow["addtime"]?>
          </td>
          <td align="center">
            <?php printf("<a target=\"_blank\" href=\"edit.php?op=edit&id=%s\">modify</a> | <a href=\"delete.php?id=%s&delete=yes\">DELETE</a>", $myrow["id"],$myrow["id"]);?>
          </td>
        </tr>
        <?php }?>
      </table>
      <span id="pagestyle">
        <!--page code-->
        <?php
	require '../lib/pager.php';
	$page = new Pager ( $recordcount, $pagesize);
	?>
      </span>
    </div>
  </body>
</html>