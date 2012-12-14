<?php
$category_ID =48;
// THIS IS THE WORDPRESS QUERY LOOP //
$the_query = new WP_Query( 'cat='.$category_ID.'&orderby=title&order=ASC&posts_per_page=5' );
 
while ( $the_query->have_posts() ) : $the_query->the_post(); 

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

endwhile; 

?>