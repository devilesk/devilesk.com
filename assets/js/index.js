require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({23:[function(require,module,exports){
var $ = require('jquery');
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
});
},{"bootstrap":1,"jquery":14}]},{},[23]);
