var bsn = require("bootstrap.native");

function findAncestor (el, cls) {
    while ((el = el.parentElement) && !el.classList.contains(cls));
    return el;
}

// initialize sidebar if it exists
if (document.querySelector('.bs-docs-sidebar')) {
    new bsn.ScrollSpy(document.body, {
        target: '.bs-docs-sidebar'
    });
    document.body.addEventListener('activate.bs.scrollspy', function (event) {
        [].forEach.call(document.querySelectorAll('.sidenav-group'), function (element) {
            element.classList.remove('group-active');
        });
        var group = findAncestor(event.relatedTarget, 'sidenav-group');
        group.classList.add('group-active');
    });
}

// initialize disqus if it exists
if (document.getElementById('disqus_thread')) {
    /* * * CONFIGURATION VARIABLES * * */
    var disqus_shortname = 'devileskdota';
    
    /* * * DON'T EDIT BELOW THIS LINE * * */
    (function() {
        var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
        dsq.src = '//' + disqus_shortname + '.disqus.com/embed.js';
        (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
    })();
}

[].forEach.call(document.querySelectorAll('link[href*="gist-embed"]'), function(element) {
    element.parentNode.removeChild(element);
});

if (document.getElementById('search-heroes')) {
    document.getElementById('search-heroes').addEventListener('keyup', function(event) {
        var searchVal = this.value.toLowerCase();
        var elems = document.querySelectorAll(".hero");
        for (var i = 0; i < elems.length; i++) {
            var el = elems[i];
            el.classList.remove("no-match");
        }
        
        [].filter.call(elems, function (element) {
            var s = element.querySelector('.portraits-sprite-64x84').title.toLowerCase();
            return element.getAttribute('href').toLowerCase().indexOf(searchVal) === -1 && s.indexOf(searchVal) === -1 && s.match(/\b(\w)/g).join('').indexOf(searchVal) === -1;
        }).forEach(function (element) {
            element.classList.add("no-match");
        });
    });
}
