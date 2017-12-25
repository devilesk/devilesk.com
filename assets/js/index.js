require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({45:[function(require,module,exports){
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

},{"bootstrap":1,"jquery":25}]},{},[45])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciAkID0galF1ZXJ5ID0gcmVxdWlyZSgnanF1ZXJ5Jyk7XG5yZXF1aXJlKCdib290c3RyYXAnKTtcblxuJChmdW5jdGlvbiAoKSB7XG4gICAgLy8gaW5pdGlhbGl6ZSBzaWRlYmFyIGlmIGl0IGV4aXN0c1xuICAgIGlmICgkKCcuYnMtZG9jcy1zaWRlYmFyJykubGVuZ3RoKSB7XG4gICAgICAgICQoJ2JvZHknKS5zY3JvbGxzcHkoe1xuICAgICAgICAgICAgdGFyZ2V0OiAnLmJzLWRvY3Mtc2lkZWJhcicsXG4gICAgICAgICAgICBvZmZzZXQ6IDQwXG4gICAgICAgIH0pO1xuICAgICAgICAkKCcuYnMtZG9jcy1zaWRlYmFyJykuYWZmaXgoe1xuICAgICAgICAgICAgICBvZmZzZXQ6IHtcbiAgICAgICAgICAgICAgICB0b3A6IDEyNFxuICAgICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICAvLyBpbml0aWFsaXplIGRpc3F1cyBpZiBpdCBleGlzdHNcbiAgICBpZiAoJCgnI2Rpc3F1c190aHJlYWQnKS5sZW5ndGgpIHtcbiAgICAgICAgLyogKiAqIENPTkZJR1VSQVRJT04gVkFSSUFCTEVTICogKiAqL1xuICAgICAgICB2YXIgZGlzcXVzX3Nob3J0bmFtZSA9ICdkZXZpbGVza2RvdGEnO1xuICAgICAgICBcbiAgICAgICAgLyogKiAqIERPTidUIEVESVQgQkVMT1cgVEhJUyBMSU5FICogKiAqL1xuICAgICAgICAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgZHNxID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7IGRzcS50eXBlID0gJ3RleHQvamF2YXNjcmlwdCc7IGRzcS5hc3luYyA9IHRydWU7XG4gICAgICAgICAgICBkc3Euc3JjID0gJy8vJyArIGRpc3F1c19zaG9ydG5hbWUgKyAnLmRpc3F1cy5jb20vZW1iZWQuanMnO1xuICAgICAgICAgICAgKGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF0gfHwgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2JvZHknKVswXSkuYXBwZW5kQ2hpbGQoZHNxKTtcbiAgICAgICAgfSkoKTtcbiAgICB9XG4gICAgXG4gICAgJCgnbGlua1tocmVmKj1cImdpc3QtZW1iZWRcIl0nKS5yZW1vdmUoKTtcbiAgICBcbiAgICBpZiAoJCgnI3NlYXJjaC1oZXJvZXMnKS5sZW5ndGgpIHtcbiAgICAgICAgJCgnI3NlYXJjaC1oZXJvZXMnKS5rZXl1cChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgc2VhcmNoVmFsID0gJCh0aGlzKS52YWwoKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgJChcIi5oZXJvXCIpLnJlbW92ZUNsYXNzKCduby1tYXRjaCcpO1xuICAgICAgICAgICAgJChcIi5oZXJvXCIpLmZpbHRlcihmdW5jdGlvbiggaW5kZXggKSB7XG4gICAgICAgICAgICAgICAgdmFyIHMgPSAkKHRoaXMpLmZpbmQoJy5wb3J0cmFpdHMtc3ByaXRlLTY0eDg0JykuYXR0cigndGl0bGUnKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgICAgIHJldHVybiAkKHRoaXMpLmF0dHIoJ2hyZWYnKS50b0xvd2VyQ2FzZSgpLmluZGV4T2Yoc2VhcmNoVmFsKSA9PT0gLTEgJiYgcy5pbmRleE9mKHNlYXJjaFZhbCkgPT09IC0xICYmIHMubWF0Y2goL1xcYihcXHcpL2cpLmpvaW4oJycpLmluZGV4T2Yoc2VhcmNoVmFsKSA9PT0gLTE7XG4gICAgICAgICAgICB9KS5hZGRDbGFzcygnbm8tbWF0Y2gnKTtcbiAgICAgICAgfSk7XG4gICAgfVxufSk7XG4iXX0=
