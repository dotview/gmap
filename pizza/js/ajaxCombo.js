
	jQuery(document).ready(function(){				
		// when any option from country list is selected
		
		jQuery("select[name='area']").live("change",function(){				
			
			
			// get the selected option value of country
			var areaValue = jQuery("select[name='area']").val();
			//var stateValue = jQuery("select[name='state']").val();			
			/**
			 * pass country value through POST method
			 * the 'status' parameter is only a dummy parameter (just to show how multiple parameters can be passed)
			 * if we get response from data.php, then only the cityAjax div is displayed 
			 * otherwise the cityAjax div remains hidden
			 * 'beforeSend' is used to display loader image
			 * 'complete' is used to hide the loader image
			 */			
			jQuery.ajax({
				type: "GET",
				url: "data/areaadd.txt",
				data: ({area: areaValue}),
				beforeSend: function(){ jQuery("#ajaxLoader").show(); },
				complete: function(){ jQuery("#ajaxLoader").hide(); },
				success: function(response){
					jQuery("#addressAjax").html(response);
					//jQuery("#from").val(jQuery("select[name='address']").val());
					jQuery("#addressAjax").show();
				}
			});			
		});
		
		
		jQuery("select[name='city']").live("change",function(){				
			
			// get the selected option value of country
			var cityValue = jQuery("select[name='city']").val();
			//var stateValue = jQuery("select[name='state']").val();		
			/**
			 * pass country value through POST method
			 * the 'status' parameter is only a dummy parameter (just to show how multiple parameters can be passed)
			 * if we get response from data.php, then only the cityAjax div is displayed 
			 * otherwise the cityAjax div remains hidden
			 * 'beforeSend' is used to display loader image
			 * 'complete' is used to hide the loader image
			 */			
			jQuery.ajax({
				type: "GET",
				url: "data/data.txt",
				data: ({city: cityValue}),
				beforeSend: function(){ jQuery("#ajaxLoader").show(); },
				complete: function(){ jQuery("#ajaxLoader").hide(); },
				success: function(response){
					jQuery("#areaAjax").html(response);
					jQuery("#areaAjax").show();
				}
			});			
		});
		
		
		
		
		
		
	});
