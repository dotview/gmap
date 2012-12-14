<?php
ob_start();
require('./wp-load.php');
require($_SERVER['DOCUMENT_ROOT']."/themefunctions.php");
$obj=new Model_functions(); //create object of function class
 	
$postalcode=$_REQUEST['postalCode'];
$cusine=$_REQUEST['cusine'];
$searchType=$_REQUEST['searchType'];
$ne_lat=$_REQUEST['ne_lat'];
$ne_lng=$_REQUEST['ne_lng'];
$sw_lat=$_REQUEST['sw_lat'];
$sw_lng=$_REQUEST['sw_lng'];
$noRecord=$_REQUEST['noRecord'];

if($noRecord==1)
{
	$condition='';
	 
}
else
{
	 $condition=" and latitude<='".$ne_lat."' and  latitude>='".$sw_lat."'  and longitude>='".$ne_lng."' and  longitude<='".$sw_lng."' ";
} 



if($postalcode!='' && $searchType==0)
		{	
		
		$sql= mysql_query("select * from hot_posts as a,hot_postmeta as b where  a.post_type='openmenu' and  a.post_status='publish' and a.ID=b.post_id and (meta_key='zipcode' or meta_key='restaurantlocation')  and meta_value like '%".trim($postalcode)."%' and statusType='Active' $condition order by ID desc  ");
			if(mysql_num_rows($sql)>0)
			{
			$Iquery= mysql_query("select * from hot_posts as a,hot_postmeta as b where  a.post_type='openmenu' and  a.post_status='publish' and a.ID=b.post_id and (meta_key='zipcode' or meta_key='restaurantlocation')  and meta_value like '%".trim($postalcode)."%' and statusType='Active' $condition order by ID desc  ");
			}
			else
			{
			$Iquery= mysql_query("select * from hot_posts where  post_type='openmenu' and  post_status='publish' and statusType='Active' and latitude<='".$ne_lat."' and  latitude>='".$sw_lat."'  and longitude>='".$ne_lng."' and  longitude<='".$sw_lng."' order by ID desc  ");
			}
			
		}
		else if($cusine!='' && $searchType==1)
		{	
		
		$list=explode(',',$cusine) ;
		 $cList="'".implode("','",$list)."'";

	
			$Iquery= mysql_query("select * from hot_posts as a,hot_terms as b,hot_term_relationships as c,hot_term_taxonomy as d where  a.post_type='openmenu' and  a.post_status='publish' and a.ID=c.object_id and b.term_id=d.term_id and d.term_taxonomy_id =c.term_taxonomy_id and b.name in($cList) and statusType='Active' $condition  order by ID desc  ");
		}
		else
		{
//echo "select * from hot_posts where  post_type='openmenu' and  post_status='publish' and statusType='Active' $condition order by ID desc  ";
	
			$Iquery= mysql_query("select * from hot_posts where  post_type='openmenu' and  post_status='publish' and statusType='Active' $condition order by ID desc  ");
		}
		
$xml='<?xml version="1.0" encoding="UTF-8"?><markers>';
	 $rows=mysql_num_rows($Iquery);

	// Iterate through the rows, adding XML nodes for each
	if($rows==0)
	{


		if($postalcode!='')
		{
		  $param= urlencode($postalcode);
	 	 $url= 'http://maps.google.com/maps/api/geocode/json?address='.$param.'&sensor=false'; 
		 $geocode=file_get_contents($url); 
	 	$output = json_decode($geocode); 
		//print_r($output );
		 $lat = $output->results[0]->geometry->location->lat; 
		$long 	 = $output->results[0]->geometry->location->lng; 
			if($lat!='' )
			{
				echo "1" ;
			}
			else
			{
				echo "2";
			}
		}
			else
			{
				echo "1";
			}

	}
	else
	{

		$i=1;
		while($row = mysql_fetch_array($Iquery))
		{
		
			 $state = get_post_meta($row['ID'], 'state', true);

				 $city = get_post_meta($row['ID'], 'city', true);
				 $location = get_post_meta($row['ID'], 'restaurantlocation', true);
				 $zipcode = get_post_meta($row['ID'], 'zipcode', true);
				 
				 $address=$location.", ".$city." ".$state." ".$zipcode;
				  $discount = get_post_meta($row['ID'], 'discount', true);
				if($discount=='30%')
				{
					$image='http://'.$_SERVER['HTTP_HOST'].'/wp-content/themes/hot-table/images/yellow_flame.png';
				}
				else if($discount=='40%')
				{
					$image='http://'.$_SERVER['HTTP_HOST'].'/wp-content/themes/hot-table/images/orange_flame.png';
				}
				else 
				{
					$image='http://'.$_SERVER['HTTP_HOST'].'/wp-content/themes/hot-table/images/red_flame.png';
				}
				$rID=$row['ID'];
			  // ADD TO XML DOCUMENT NODE
			 $xml=$xml.'<marker>';
			$xml=$xml.'<name>'.$row['post_title'].'</name>';
			$xml=$xml.'<address>'.$address.'</address>';
			$xml=$xml.'<lat>'.$row['latitude'].'</lat>';
			$xml=$xml.'<lng>'.$row['longitude'].'</lng>';
			$xml=$xml.'<restImage>'.$image.'</restImage>';
			$xml=$xml.'<rID>'.$rID.'</rID>';
			
			
			$xml=$xml.'</marker>';
			
			$i++;
		} 
	}
	$xml=$xml.'</markers>';
	header( 'Content-type: text/xml; charset=utf-8' );
 
ob_clean();
echo $xml;
ob_end_flush();
?>