	var geocoder = new google.maps.Geocoder();
function initialize_googlemap() {
	var guide_lat = document.getElementById('guide_lat').value;
	var guide_lng = document.getElementById('guide_lng').value;
	var guide_location  = document.getElementById('guide_location').value;

	if(guide_lat==""||guide_lng==""){
		MapSearch(guide_location,function(results){
			var input = document.getElementById('poi_name');
			var options = {
			  bounds: results[0].geometry.viewport,
			  types: ['establishment']
			};
			var autocomplete = new google.maps.places.Autocomplete(input,options);
		})
	}
	
}
function MapSearch(address,callback) {
			if (address == "")
				return;
			if (geocoder) {
				geocoder.geocode({ 'address': address }, function(results, status) {
					if (status == google.maps.GeocoderStatus.OK) {
						callback(results);
					} else {
						alert("Can not find the place: " + address + " ");
					}
				});
			}
		}
google.maps.event.addDomListener(window, 'load', initialize_googlemap);
