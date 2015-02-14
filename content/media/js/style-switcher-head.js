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

if (readCookie('theme') == 'light') {
	document.getElementById("theme-css").setAttribute("href", "/media/css/site-light.css");
}
else {
	document.getElementById("theme-css").setAttribute("href", "/media/css/site.css");
}