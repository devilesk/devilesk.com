require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({27:[function(require,module,exports){
var bsn = require("bootstrap.native");

function copyTextHandler(event) {
    var coin = event.currentTarget.id.replace('input-address-btn-', '');
    var input = document.getElementById('input-address-' + coin).select();
    
    try {
        document.execCommand('copy');
        event.currentTarget.setAttribute('data-title', "Copied!");
        event.currentTarget.Tooltip.hide();
        setTimeout(event.currentTarget.Tooltip.show, 200);
    }
    catch (err) {
        console.log('Oops, unable to copy', err);
    }
}

function initTooltip(element) {
    element.addEventListener('click', copyTextHandler);
    
    element.addEventListener('mouseleave', function () {
        element.setAttribute('data-title', "Copy to clipboard");
    });
}

[].forEach.call(document.querySelectorAll('.input-address-btn'), function (element) {
    initTooltip(element);
});
},{"bootstrap.native":1}]},{},[27])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvZG9uYXRlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIGJzbiA9IHJlcXVpcmUoXCJib290c3RyYXAubmF0aXZlXCIpO1xuXG5mdW5jdGlvbiBjb3B5VGV4dEhhbmRsZXIoZXZlbnQpIHtcbiAgICB2YXIgY29pbiA9IGV2ZW50LmN1cnJlbnRUYXJnZXQuaWQucmVwbGFjZSgnaW5wdXQtYWRkcmVzcy1idG4tJywgJycpO1xuICAgIHZhciBpbnB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbnB1dC1hZGRyZXNzLScgKyBjb2luKS5zZWxlY3QoKTtcbiAgICBcbiAgICB0cnkge1xuICAgICAgICBkb2N1bWVudC5leGVjQ29tbWFuZCgnY29weScpO1xuICAgICAgICBldmVudC5jdXJyZW50VGFyZ2V0LnNldEF0dHJpYnV0ZSgnZGF0YS10aXRsZScsIFwiQ29waWVkIVwiKTtcbiAgICAgICAgZXZlbnQuY3VycmVudFRhcmdldC5Ub29sdGlwLmhpZGUoKTtcbiAgICAgICAgc2V0VGltZW91dChldmVudC5jdXJyZW50VGFyZ2V0LlRvb2x0aXAuc2hvdywgMjAwKTtcbiAgICB9XG4gICAgY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zb2xlLmxvZygnT29wcywgdW5hYmxlIHRvIGNvcHknLCBlcnIpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gaW5pdFRvb2x0aXAoZWxlbWVudCkge1xuICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBjb3B5VGV4dEhhbmRsZXIpO1xuICAgIFxuICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2RhdGEtdGl0bGUnLCBcIkNvcHkgdG8gY2xpcGJvYXJkXCIpO1xuICAgIH0pO1xufVxuXG5bXS5mb3JFYWNoLmNhbGwoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmlucHV0LWFkZHJlc3MtYnRuJyksIGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgaW5pdFRvb2x0aXAoZWxlbWVudCk7XG59KTsiXX0=
