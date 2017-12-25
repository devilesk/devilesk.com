require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({40:[function(require,module,exports){
var $ = jQuery = require('jquery');
require('bootstrap');

$(function () {
    $('[data-toggle="tooltip"]').tooltip();
    
    $('[data-toggle="tooltip"]').on('hide.bs.tooltip', function () {
        $(this).attr('data-original-title', "Copy to clipboard");
    })
    
    function copyTextHandler(event) {
        var coin = event.currentTarget.id.replace('input-address-btn-', '');
        var input = document.getElementById('input-address-' + coin).select();
        
        try {
            document.execCommand('copy');
            $(event.currentTarget).attr('data-original-title', "Copied!").tooltip('show');
        }
        catch (err) {
            console.log('Oops, unable to copy', err);
        }
    }

    document.querySelectorAll('.input-address-btn').forEach(function (element) {
        element.addEventListener('click', copyTextHandler);
    });
});
},{"bootstrap":1,"jquery":25}]},{},[40])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvZG9uYXRlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciAkID0galF1ZXJ5ID0gcmVxdWlyZSgnanF1ZXJ5Jyk7XG5yZXF1aXJlKCdib290c3RyYXAnKTtcblxuJChmdW5jdGlvbiAoKSB7XG4gICAgJCgnW2RhdGEtdG9nZ2xlPVwidG9vbHRpcFwiXScpLnRvb2x0aXAoKTtcbiAgICBcbiAgICAkKCdbZGF0YS10b2dnbGU9XCJ0b29sdGlwXCJdJykub24oJ2hpZGUuYnMudG9vbHRpcCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJCh0aGlzKS5hdHRyKCdkYXRhLW9yaWdpbmFsLXRpdGxlJywgXCJDb3B5IHRvIGNsaXBib2FyZFwiKTtcbiAgICB9KVxuICAgIFxuICAgIGZ1bmN0aW9uIGNvcHlUZXh0SGFuZGxlcihldmVudCkge1xuICAgICAgICB2YXIgY29pbiA9IGV2ZW50LmN1cnJlbnRUYXJnZXQuaWQucmVwbGFjZSgnaW5wdXQtYWRkcmVzcy1idG4tJywgJycpO1xuICAgICAgICB2YXIgaW5wdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW5wdXQtYWRkcmVzcy0nICsgY29pbikuc2VsZWN0KCk7XG4gICAgICAgIFxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgZG9jdW1lbnQuZXhlY0NvbW1hbmQoJ2NvcHknKTtcbiAgICAgICAgICAgICQoZXZlbnQuY3VycmVudFRhcmdldCkuYXR0cignZGF0YS1vcmlnaW5hbC10aXRsZScsIFwiQ29waWVkIVwiKS50b29sdGlwKCdzaG93Jyk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ09vcHMsIHVuYWJsZSB0byBjb3B5JywgZXJyKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5pbnB1dC1hZGRyZXNzLWJ0bicpLmZvckVhY2goZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGNvcHlUZXh0SGFuZGxlcik7XG4gICAgfSk7XG59KTsiXX0=
