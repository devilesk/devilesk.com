var $ = jQuery = require('jquery');
require('bootstrap');

$(function () {
    // initialize sidebar if it exists
    if ($('.bs-docs-sidebar').length) {
        $('body').scrollspy({
            target: '.bs-docs-sidebar',
            offset: 40
        });
        $('.bs-docs-sidebar').affix({
              offset: {
                top: 124
              }
        });
    }
    
    // initialize disqus if it exists
    if ($('#disqus_thread').length) {
        /* * * CONFIGURATION VARIABLES * * */
        var disqus_shortname = 'devileskdota';
        
        /* * * DON'T EDIT BELOW THIS LINE * * */
        (function() {
            var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
            dsq.src = '//' + disqus_shortname + '.disqus.com/embed.js';
            (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
        })();
    }
    
    $('link[href*="gist-embed"]').remove();
    
    if ($('#search-heroes').length) {
        $('#search-heroes').keyup(function () {
            var searchVal = $(this).val().toLowerCase();
            $(".hero").removeClass('no-match');
            $(".hero").filter(function( index ) {
                var s = $(this).find('.portraits-sprite-64x84').attr('title').toLowerCase();
                return $(this).attr('href').toLowerCase().indexOf(searchVal) === -1 && s.indexOf(searchVal) === -1 && s.match(/\b(\w)/g).join('').indexOf(searchVal) === -1;
            }).addClass('no-match');
        });
    }
});