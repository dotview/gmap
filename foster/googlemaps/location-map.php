<link rel="stylesheet" href="/wp-content/themes/yoo_shelf_wp/css/map.css" />
<div id="map_canvas"></div>
		
		<div id="toolbox">
            <div id="toolbox-list">
                
				<div id="dataList">
			     </div>
            </div><!-- toolbox-list -->
             
            
        </div><!-- toolbox -->
		 
	 		
		<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.6.2/jquery.min.js" type="text/javascript"></script> 

		<script type="text/javascript" src="http://maps.google.com/maps/api/js?language=en&sensor=false"></script> 

		<script src="/wp-content/themes/yoo_shelf_wp/js/map.js"></script>
		<script>
		
		//var data = {"result":1,"data":[{"category":48,"categoryname":"cate111","list":[{"mID":"1","name":"Free shipping when you ","latitude":"51.53985","longitude":"-0.87938","address":"Henley-on-Thames,Oxfordshire,United Kingdom"},{"mID":"5","name":"Buy 2 hypnotherapy sessions get the 3rd session free","latitude":"51.25348","longitude":"-0.94601", "address":"Odiham,Hampshire,United Kingdom"},{"mID":"7","name":"20% off all toy products","latitude":"52.1556","longitude":"0.40426", "address":"Newmarket,Suffolk,United Kingdom"},{"mID":"12","name":"10% Off your next web design and software development project","latitude":"51.59507","longitude":"0.03588","address":"London,South Woodford,United Kingdom"}]},{"category":77,"categoryname":"cate777","list":[{"mID":"13","name":"?¡ê10 voucher to spend on Dermalogica Products for just ?¡ê5", "latitude":"54.5851","longitude":"-5.8854", "address":"Belfast,Antrim,United Kingdom"},{"mID":"14","name":"1/2 price colour at Square Roots Hair", "latitude":"51.52143","longitude":"-0.72246", "address":"Maidenhead,Berkshire,United Kingdom"},{"mID":"15","name":"Up to 50% off on the find and management rates","latitude":"51.26244","longitude":"-1.0899","address":"Basingstoke,Hampshire,United Kingdom"},{"mID":"17","name":"Free kitchen installation and free hob oven and extrator","latitude":"51.36215","longitude":"-0.8997","address":"Wokingham,Berkshire,United Kingdom"},{"mID":"18","name":"Teeth whitening that includes free check-up and x-rays", "latitude":"51.5346","longitude":"-0.0354","address":"London,London,United Kingdom"},{"mID":"19","name":"20% off on Legionella Risk Assessment, water hygiene Monitoring programme", "latitude":"53.51446","longitude":"-2.033278","address":"Mossley,Lancashire,United Kingdom"},{"mID":"20","name":"Buy 1 LUMASLIM LIPO session and Get 2 free.","latitude":"55.93769","longitude":"-3.3912","address":"Newhouse,Edinburgh,United Kingdom"},{"mID":"38","name":"Free upgrade on DogFence System 1200","latitude":"51.5652","longitude":"-0.737","address":"Cookham Dean,Berkshire,United Kingdom"}]}]};
		
		<?php
			function get_category_id($cat_name){
				$term = get_term_by('name', $cat_name, 'category');
				return $term->term_id;
			}
			
			$catearray[] = array();
			 
			
			if(the_field("map_display_type")=="2"){
				$array = get_field("places_category");
				for ($i = 0; $i < count($array); ++$i) {
					$cateid= get_category_id($array[$i]);
					$catearray[] = array($cateid,$array[$i]);	
				}
			}
			else{
				$args=array(
				  'orderby' => 'name',
				  'order' => 'ASC'
				  );
				$categories=get_categories($args);
				foreach($categories as $category) { 
					$catearray[] = array($category->term_id,$category->name);
				} 
			} 
 
			$result = ';var data = {"data":[';
			
			$cates = array();
			foreach($catearray as $category) { 
		 
				$category_ID = $category[0]; 
				$category_Name= $category[1]; 
				if($category_ID=="") continue;
				$result .= '{"category":"'.$category_ID.'","categoryname":"'.$category_Name.'","list":[';
				// THIS IS THE WORDPRESS QUERY LOOP //
				
				$the_query = new WP_Query( 'cat='.$category_ID.'&orderby=title&order=ASC&posts_per_page=20' );
				 
				while ( $the_query->have_posts() ) : $the_query->the_post(); 
				
				$list .= '{"mID":"'.$post->ID.'",
				"name":"'.get_field('name').'",
				"latitude":"'.get_field('latitude').'",
				"longitude":"'.get_field('longitude').'",
				"address":"'.get_field('street').'"},';
				 
				endwhile; 
				 
				$result .= rtrim($list,",").']},';
			}
			$result = rtrim($result,",").']};';
			echo $result;
			
			$zoom = the_field("map_zoom");
			if($zoom ==""){
				$zoom ="8";
			}
		?>
		
		$(document).ready(function(){
			var opts ={
				mapcanvas:document.getElementById("map_canvas"),
				defaultaddress:"<? the_field("city"); ?>",
				latitude:'<? echo the_field("latitude"); ?>',
				longtitude:'<? echo the_field("longitude"); ?>',
				zoom:<? echo $zoom; ?>
			}
			map_initialize(opts,data);
			
		});
		 
</script>
<!--
<iframe src="http://gmap.sinaapp.com/foster/" frameborder="0" scrolling="no" width="100%" height="900px" style="left:-20px;"></iframe>

<div id="details" style="width:920px;margin-top:20px;background-color:#fff;padding:10px;border: 1px solid #ddd;">


<? 
//Depending on how you want to pull the map data you can use get_field() or the_field() ?>
<h2>Explanation of custom fields for map use and code</h2>
<hr>
<em>This is the custom field for the "Map Title"</em>
<br>
Map Title: <? the_field("map_title"); ?>
<hr>
<em>If the "Country" and "City" custom fields are completed they will be passed to the map code and will be used to centre the dynamic map.</em>
<br> 
Country: <? the_field("country"); ?>
<br>
City: <? the_field("city"); ?>
<br>
City (with str_replace): <? echo str_replace(' ','-',(get_field("city"))); ?>

<hr>
<em>If the "Latitude" and "Longitude" custom fields are completed they will override the Country and City values to centre the map via lat/lng.</em>
<br>
Latitude: <? the_field("latitude"); ?>
<br>
Longitude: <? the_field("longitude"); ?>
<hr>
<em>This is the "Map Zoom" custom field to be passed to the map code</em>
<br>
Map Zoom: <? the_field("map_zoom"); ?>
<hr>
<em>This is the custom field for the "Map Display Type" - Will return either "1" or "2" - 1 is to show location with all categories marked, 2 is to show one or more chosen categories from multiple select list custom field</em>
<br>
Map Display Type: <? the_field("map_display_type"); ?>
<hr>
<em>This is the custom field for the display of which category or categories to show on the map - (If none selected and/or if "1" is chosen for display type above then the map will show all categories) - If "2" is selected for display type then the category or categories selected will be displayed on the map only.</em>
<br>
Places Category: <? the_field("places_category"); ?>
<hr>
Assigns places 'wordpress category "name"' to php variable: 
<?php $map_category = single_cat_title(the_field("places_category"), false); ?>
<? echo $map_category; ?>
<hr>
Gets the places 'wordpress category "ID"' to php variable: 
<?php
 

?>
<hr>
<em>This is the custom field for the "Map Description" - we can use the content or html in this field to put into the info windows</em>
<br>
Map Description: <? the_field("map_description"); ?>
<hr>


<em>Loop to get posts and custom field values for 'specific wordpress places' category (in this case - the places category chosen above):</em>
<br><br>
<?php
$category_ID =48;
// THIS IS THE WORDPRESS QUERY LOOP //
$the_query = new WP_Query( 'cat='.$category_ID.'&orderby=title&order=ASC&posts_per_page=5' );
 
while ( $the_query->have_posts() ) : $the_query->the_post(); 
?>
<a href="<?php the_permalink() ?>" title="<?php the_title_attribute(); ?>"><?php the_title(); ?></a> 
<?
echo '<br>';
echo 'Name: '.get_field('name');
echo '<br>'; 
echo 'Latitude: '.get_field('latitude');
echo '<br>';
echo 'Longitude: '.get_field('longitude');
echo '<br>';
echo 'Street: '.get_field('street');
echo '<br>';
echo 'City: '.get_field('city');
echo '<br>etc, etc ,depending on "places" category';
echo '<br>';
echo '<em>This next line dumps an array of all custom fields for each post - probably easier for you to grab the required marker data from this</em>';
echo '<br>';

// we can get the map data we need from this array for each type
// we should also use and 'if is not null' for the custom fields because
print_r(get_post_custom($post->ID));

echo '<hr>';

endwhile; 

wp_reset_postdata();
?>
-->


</div>