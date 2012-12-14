<?

define('WP_USE_THEMES', false);
require_once('../../../../../wp-blog-header.php');


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
				$mom = get_category_by_slug("Places");
				$args=array(
					'child_of'=>$mom->cat_ID,
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
			$id = 0;
			foreach($catearray as $category) { 
		 
				$category_ID = $category[0]; 
				$category_Name= $category[1]; 
				if($category_ID=="") continue;
				$result .= '{"category":"'.$category_ID.'","categoryname":"'.$category_Name.'","list":[';
				// THIS IS THE WORDPRESS QUERY LOOP //
				
				
				$args = array(
					'cat' => $category_ID,
					'posts_per_page' => 9999,
					'meta_query' => array(
						'relation' => 'OR',
						array(
							'key' => 'latitude',
							'value' => 'blue',
							'compare' => 'NOT LIKE'
						),
						array(
							'key' => 'price',
							'value' => array( 20, 100 ),
							'type' => 'numeric',
							'compare' => 'BETWEEN'
						)
					)
				);
				$the_query = new WP_Query($args);
				 
				$list = "";
				
				while ( $the_query->have_posts() ) : $the_query->the_post(); 
				
				$lat = get_field('latitude');
				$lng = get_field('longitude');
				if($lat=="" || $lng =="") continue;
				$list .= '{"mID":"'.$id.'",
				"name":"'.get_field('name').'",
				"latitude":"'.$lat.'",
				"longitude":"'.$lng.'",
				"address":"'.get_field('street').'"},';
				
				$id +=1;		
				endwhile; 
				 
				$result .= rtrim($list,",").']},';
			}
			wp_reset_postdata();
			$result = rtrim($result,",").']};';
			echo $result;
?>

