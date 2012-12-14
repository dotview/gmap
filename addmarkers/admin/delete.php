<?php
$op = $_GET ["delete"];
if ($op == "yes") {
   require_once('saemysql.class.php');

   $mysql = new SaeMysql();
   
   $sql = "delete FROM `OrgInfos` where id=".$_GET ["id"];
   if ( $mysql->runSql( $sql ) )
   {
       echo "delete success";
   }
   else{
       echo "delete failed";
   }
   $mysql->closeDb();
 
 }
 ?>