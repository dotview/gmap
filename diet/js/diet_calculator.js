$(document).ready(function(){
	$("#Calculate").click(function(){
		if($("#wt").val()==""){
			alert("Please Input weight");
			return;
		}
		if($("#num").val()==""){
			alert("Please Input Number of Meals Per Day");
			return;
		}
		var total;
		var num = $("#num").val();
		if($("#wu").val()=="lb"){
			total = $("#wt").val() *10;
		}
		else if($("#wu").val()=="kg"){
			total = $("#wt").val() * 22;
		}
		var ProteinPerDay= FormatValue(total/2);
		var CarbohydratesPerDay= FormatValue(total/2);
		var ProteinPerMeal= FormatValue(ProteinPerDay/num);
		var CarbohydratesPerMeal= FormatValue(CarbohydratesPerDay/num);
		
		$("#Total").val(total);
		$("#ProteinPerDay").val(ProteinPerDay);
		$("#CarbohydratesPerDay").val(CarbohydratesPerDay);
		$("#ProteinPerMeal").val(ProteinPerMeal);
		$("#CarbohydratesPerMeal").val(CarbohydratesPerMeal);
		
		//Cooked Carbohydrate Weight Per Meal
		var Oatmeal_oz = FormatValue(CarbohydratesPerMeal/84);
		var Oatmeal_g = FormatValue((CarbohydratesPerMeal/84)*28.35);
		
		var BrownRice_oz = FormatValue(CarbohydratesPerMeal/32);
		var BrownRice_g = FormatValue((CarbohydratesPerMeal/32)*28.35);
		
		var SweetPotato_oz = FormatValue(CarbohydratesPerMeal/26);
		var SweetPotato_g = FormatValue((CarbohydratesPerMeal/26)*28.35);
		
		var Quinoa_oz = FormatValue(CarbohydratesPerMeal/34);
		var Quinoa_g = FormatValue((CarbohydratesPerMeal/34)*28.35);
		
		var Yam_oz = FormatValue(CarbohydratesPerMeal/33);
		var Yam_g = FormatValue((CarbohydratesPerMeal/33)*28);
		
		$("#Oatmeal_oz").val(Oatmeal_oz);
		$("#Oatmeal_g").val(Oatmeal_g);
		$("#BrownRice_oz").val(BrownRice_oz);
		$("#BrownRice_g").val(BrownRice_g);
		$("#SweetPotato_oz").val(SweetPotato_oz);
		$("#SweetPotato_g").val(SweetPotato_g);
		$("#Quinoa_oz").val(Quinoa_oz);
		$("#Quinoa_g").val(Quinoa_g);
		$("#Yam_oz").val(Yam_oz);
		$("#Yam_g").val(Yam_g);
		
		
		//Cooked Protein Weight Per Meal
		var Eggs_oz = FormatValue(ProteinPerMeal/44);
		var Eggs_g = FormatValue((ProteinPerMeal/44)*28.35);
		
		var BeefSteak_oz = FormatValue(ProteinPerMeal/50);
		var BeefSteak_g = FormatValue((ProteinPerMeal/50)*28.35);
		
		var Chicken_oz = FormatValue(ProteinPerMeal/43);	
		var Chicken_g = FormatValue((ProteinPerMeal/43)*28.35);
		
		var Fish_oz = FormatValue(ProteinPerMeal/40);
		var Fish_g = FormatValue((ProteinPerMeal/40)*28.35);
		
		var Pork_oz = FormatValue(ProteinPerMeal/40);
		var Pork_g = FormatValue((ProteinPerMeal/40)*28.35);
		
		var Lobster_oz = FormatValue(ProteinPerMeal/30);
		var Lobster_g = FormatValue((ProteinPerMeal/30)*28.35);
		
		$("#Eggs_oz").val(Eggs_oz);
		$("#Eggs_g").val(Eggs_g);
		$("#BeefSteak_oz").val(BeefSteak_oz);
		$("#BeefSteak_g").val(BeefSteak_g);
		$("#Chicken_oz").val(Chicken_oz);
		$("#Chicken_g").val(Chicken_g);
		$("#Fish_oz").val(Fish_oz);
		$("#Fish_g").val(Fish_g);
		$("#Pork_oz").val(Pork_oz);
		$("#Pork_g").val(Pork_g);
		$("#Lobster_oz").val(Lobster_oz);
		$("#Lobster_g").val(Lobster_g);
	})
})
function FormatValue(input){
	//return  input.toFixed(2);
	return parseInt(input) === input ? input :input.toFixed(2);
}