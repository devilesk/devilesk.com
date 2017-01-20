require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({24:[function(require,module,exports){
var $ = jQuery = require('jquery');
require('bootstrap');

$(function () {
	$.getJSON("/media/js/patchdata.json", function (data) {
		$('.hero').click(function() {
			var hero = $(this).attr('id').substring(2);
			patchdata = data[hero];
			displayname = $(this).find('.cropped-vert-portrait').attr('title');
			$('#hero-name').html(displayname);
			$('#patch-notes').empty();
			var current_patchnumber = patchdata[0][0];
			for (var i = 0; i < patchdata.length; i++) {
				var patchnotedata = patchdata[i];
				var note = $('<li></li>').addClass('patch-note');
				var patchnumber = $('<span></span>').addClass('patch-number').html(patchnotedata[0]);
				var patchnote = $('<span></span>').addClass('patch-note').html(patchnotedata[2]);
				switch (patchnotedata[1]) {
					case 'nerf':
						patchnumber.addClass('patch-nerf');
					break;
					case 'buff':
						patchnumber.addClass('patch-buff');
					break;
					case 'neutral':
						patchnumber.addClass('patch-neutral');
					break;
				}
				note.append(patchnumber);
				note.append(patchnote);
				$('#patch-notes').append(note);
				
				if (current_patchnumber != patchnotedata[0]) {
					current_patchnumber = patchnotedata[0];
					note.addClass('patch-break');
				}
			}
		});	
	});

});
},{"bootstrap":1,"jquery":14}]},{},[24])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvaGVyb2VzL3BhdGNoaGlzdG9yeS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyICQgPSBqUXVlcnkgPSByZXF1aXJlKCdqcXVlcnknKTtcbnJlcXVpcmUoJ2Jvb3RzdHJhcCcpO1xuXG4kKGZ1bmN0aW9uICgpIHtcblx0JC5nZXRKU09OKFwiL21lZGlhL2pzL3BhdGNoZGF0YS5qc29uXCIsIGZ1bmN0aW9uIChkYXRhKSB7XG5cdFx0JCgnLmhlcm8nKS5jbGljayhmdW5jdGlvbigpIHtcblx0XHRcdHZhciBoZXJvID0gJCh0aGlzKS5hdHRyKCdpZCcpLnN1YnN0cmluZygyKTtcblx0XHRcdHBhdGNoZGF0YSA9IGRhdGFbaGVyb107XG5cdFx0XHRkaXNwbGF5bmFtZSA9ICQodGhpcykuZmluZCgnLmNyb3BwZWQtdmVydC1wb3J0cmFpdCcpLmF0dHIoJ3RpdGxlJyk7XG5cdFx0XHQkKCcjaGVyby1uYW1lJykuaHRtbChkaXNwbGF5bmFtZSk7XG5cdFx0XHQkKCcjcGF0Y2gtbm90ZXMnKS5lbXB0eSgpO1xuXHRcdFx0dmFyIGN1cnJlbnRfcGF0Y2hudW1iZXIgPSBwYXRjaGRhdGFbMF1bMF07XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHBhdGNoZGF0YS5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR2YXIgcGF0Y2hub3RlZGF0YSA9IHBhdGNoZGF0YVtpXTtcblx0XHRcdFx0dmFyIG5vdGUgPSAkKCc8bGk+PC9saT4nKS5hZGRDbGFzcygncGF0Y2gtbm90ZScpO1xuXHRcdFx0XHR2YXIgcGF0Y2hudW1iZXIgPSAkKCc8c3Bhbj48L3NwYW4+JykuYWRkQ2xhc3MoJ3BhdGNoLW51bWJlcicpLmh0bWwocGF0Y2hub3RlZGF0YVswXSk7XG5cdFx0XHRcdHZhciBwYXRjaG5vdGUgPSAkKCc8c3Bhbj48L3NwYW4+JykuYWRkQ2xhc3MoJ3BhdGNoLW5vdGUnKS5odG1sKHBhdGNobm90ZWRhdGFbMl0pO1xuXHRcdFx0XHRzd2l0Y2ggKHBhdGNobm90ZWRhdGFbMV0pIHtcblx0XHRcdFx0XHRjYXNlICduZXJmJzpcblx0XHRcdFx0XHRcdHBhdGNobnVtYmVyLmFkZENsYXNzKCdwYXRjaC1uZXJmJyk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0Y2FzZSAnYnVmZic6XG5cdFx0XHRcdFx0XHRwYXRjaG51bWJlci5hZGRDbGFzcygncGF0Y2gtYnVmZicpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGNhc2UgJ25ldXRyYWwnOlxuXHRcdFx0XHRcdFx0cGF0Y2hudW1iZXIuYWRkQ2xhc3MoJ3BhdGNoLW5ldXRyYWwnKTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0XHRub3RlLmFwcGVuZChwYXRjaG51bWJlcik7XG5cdFx0XHRcdG5vdGUuYXBwZW5kKHBhdGNobm90ZSk7XG5cdFx0XHRcdCQoJyNwYXRjaC1ub3RlcycpLmFwcGVuZChub3RlKTtcblx0XHRcdFx0XG5cdFx0XHRcdGlmIChjdXJyZW50X3BhdGNobnVtYmVyICE9IHBhdGNobm90ZWRhdGFbMF0pIHtcblx0XHRcdFx0XHRjdXJyZW50X3BhdGNobnVtYmVyID0gcGF0Y2hub3RlZGF0YVswXTtcblx0XHRcdFx0XHRub3RlLmFkZENsYXNzKCdwYXRjaC1icmVhaycpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XHRcblx0fSk7XG5cbn0pOyJdfQ==
