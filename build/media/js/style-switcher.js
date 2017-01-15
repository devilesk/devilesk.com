$(function() {
    $('.top-nav-menu .dropdown-toggle').click(function() {
        if ($('.mobile-only').css('display') == 'none') {
            var location = $(this).attr('href');
            window.location.href = location;
            return false;
        }
    });
	if (readCookie('theme') == 'light') {
		$("#theme-select").val("light");
		$(".dark-theme").hide();
		$(".light-theme").show();
	}
	else {
		$("#theme-select").val("dark");
		$(".light-theme").hide();
		$(".dark-theme").show();
	}
    $('#theme-select').change( function() {
        var expiration_date = 365*24*60*60*1000;
        if ($(this).val() == 'light') {
            $('#theme-css').attr('href','/media/css/site-light.css');
            $(".dark-theme").hide();
            $(".light-theme").show();
            var d = new Date();
            d.setTime(d.getTime() + expiration_date);
            document.cookie = 'theme=light;path=/;expires='+d.toGMTString()+';max-age='+expiration_date+';';
        }
        else {
            $('#theme-css').attr('href','/media/css/site.css');
            $(".light-theme").hide();
            $(".dark-theme").show();
            var d = new Date();
            d.setTime(d.getTime() + expiration_date);
            document.cookie = 'theme=dark;path=/;expires='+d.toGMTString()+';max-age='+expiration_date+';';
        }
    });
});