<?php
require_once('saemysql.class.php');

$mysql = new SaeMysql();
 
$sql = "SELECT * FROM `OrgInfos` LIMIT 20";
$data = $mysql->getData( $sql );
$mysql->closeDb();

echo json_encode($data);

?>
 