
$(document).ready(function() {
	$("#column_spit").toggle(
	function() {
		$("#column_spit img").attr("src", "images/switch_right.gif");
		$("#sidebar").hide();
		$("#content").css('width','99%');

	}, function() {
		$("#column_spit img").attr("src", "images/switch_left.gif");
		$("#sidebar").show();
		$("#content").css('width','85%');
	});
	$("#common_navlink a").attr("target","mainFrame");
	
	$("#morelink").toggle(function() {
		$(".moreli").slideDown();

	}, function() {
		$(".moreli").slideUp();
	})
})
function frameLoaded(evt){
    if(!evt){
        evt = window.event;
    }
    hiddenLoading();
}
function showLoading(){
    var loading = document.getElementById('loading');
    loading.style.display = '';
}

function hiddenLoading(){
    var loading = document.getElementById('loading');
    loading.style.display = 'none';
}
