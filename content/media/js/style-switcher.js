function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

$(function() {
    $('.top-nav-menu .dropdown-toggle').click(function() {
        if ($('.mobile-only').css('display') == 'none') {
            var location = $(this).attr('href');
            window.location.href = location;
            return false;
        }
    });
    if (readCookie('theme') == 'light') {
        $('#theme-css').attr('href','/media/css/site-light.css');
        $("#theme-select").val('light');
        $("#twitter-dark").hide();
        $("#twitter-light").show();
    }
    else {
        $('#theme-css').attr('href','/media/css/site.css');
        $("#theme-select").val('dark');
        $("#twitter-light").hide();
        $("#twitter-dark").show();
    }
    $('#theme-select').change( function() {
        var expiration_date = 365*24*60*60*1000;
        if ($(this).val() == 'light') {
            $('#theme-css').attr('href','/media/css/site-light.css');
            $("#twitter-dark").hide();
            $("#twitter-light").show();
            var d = new Date();
            d.setTime(d.getTime() + expiration_date);
            document.cookie = 'theme=light;path=/;expires='+d.toGMTString()+';max-age='+expiration_date+';';
        }
        else {
            $('#theme-css').attr('href','/media/css/site.css');
            $("#twitter-light").hide();
            $("#twitter-dark").show();
            var d = new Date();
            d.setTime(d.getTime() + expiration_date);
            document.cookie = 'theme=dark;path=/;expires='+d.toGMTString()+';max-age='+expiration_date+';';
        }
    });
});