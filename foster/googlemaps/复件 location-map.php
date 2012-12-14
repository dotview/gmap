<!--<iframe src="http://gmap.sinaapp.com/foster/" frameborder="0" scrolling="no" width="100%" height="900px" style="left:-20px;"></iframe>-->

<div id="details" style="width:920px;margin-top:20px;background-color:#fff;padding:10px;border: 1px solid #ddd;">


<? //Depending on how you want to pull the map data you can use get_field() or the_field() ?>
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
function get_category_id($cat_name){
	$term = get_term_by('name', $cat_name, 'category');
	return $term->term_id;
}

$category_ID = get_category_id(get_field("places_category")); 
echo $category_ID;

$array = get_field("places_category");
for ($i = 0; $i < count($array); ++$i) {
        print '['.get_category_id($array[$i]).']';
    }

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



</div>