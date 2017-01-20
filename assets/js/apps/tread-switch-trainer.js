require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({21:[function(require,module,exports){
var $ = require('jquery');

$(function () {
	
	var types = ['str','int','agi'],
        index = 0,
        hotkey = 'd',
        primary_attribute = {value: 0 },
        use_hotkey = 'e',
        rules = {
            'taking damage':{
                attr: {value: 0 },
                text: 'Taking Damage',
                active: false
            },
            'primary attribute':{
                attr: primary_attribute,
                text: 'Primary Attribute',
                active: false
            },
            'use mana':{
                attr: {value: 1 },
                text: 'Use Mana',
                active: true
            },
            'use regen':{
                attr: {value: 2 },
                text: 'Use Regen',
                active: true
            }
        },
        activated = false,
        previous,
        go_primary = false,
        objective = {},
        rules_keys = Object.keys(rules);
	
	$(document).on("keypress", function (e) {
		var charCode = e.which || e.keyCode,
            charStr = String.fromCharCode(charCode);
		if (charStr == $('#switch_key').val().toLowerCase()) {
			index += 1;
			if (index >= 3) {
				index = 0;
			}
			$('#treads').attr('src','/media/images/items/power_treads_' + types[index] + '.png');
			activated = false;
			checkRule();
		}
		else if (charStr == $('#use_key').val().toLowerCase()) {
			activated = true;
			checkRule();
		}
	});
	
	$('input[name="attr"]').click(function(){
		if($(this).is(':checked')) {
			primary_attribute.value = $(this).val();
			console.log(primary_attribute.value);
			console.log(rules);
		}
	});

	
	start = function() {
		if (!go_primary) {
			var i = Math.floor(Math.random()*rules_keys.length);
			objective = rules_keys[i];
		}
		else {
			objective = 'primary attribute';
		}
		go_primary = !go_primary;
		if (previous != objective) {
			console.log(rules[rules_keys[i]]);
			console.log(objective);
			$('#objective').text(rules[objective].text);
			activated = false;
			previous = objective;
			checkRule();
		}
		else {
			start();
		}
	}
	
	checkRule = function() {
		if (rules[objective].attr.value == index && (!rules[objective].active || activated)) {
			start();
		}
	}
	start();
});
},{"jquery":14}]},{},[21])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYXBwcy90cmVhZC1zd2l0Y2gtdHJhaW5lci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgJCA9IHJlcXVpcmUoJ2pxdWVyeScpO1xuXG4kKGZ1bmN0aW9uICgpIHtcblx0XG5cdHZhciB0eXBlcyA9IFsnc3RyJywnaW50JywnYWdpJ10sXG4gICAgICAgIGluZGV4ID0gMCxcbiAgICAgICAgaG90a2V5ID0gJ2QnLFxuICAgICAgICBwcmltYXJ5X2F0dHJpYnV0ZSA9IHt2YWx1ZTogMCB9LFxuICAgICAgICB1c2VfaG90a2V5ID0gJ2UnLFxuICAgICAgICBydWxlcyA9IHtcbiAgICAgICAgICAgICd0YWtpbmcgZGFtYWdlJzp7XG4gICAgICAgICAgICAgICAgYXR0cjoge3ZhbHVlOiAwIH0sXG4gICAgICAgICAgICAgICAgdGV4dDogJ1Rha2luZyBEYW1hZ2UnLFxuICAgICAgICAgICAgICAgIGFjdGl2ZTogZmFsc2VcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAncHJpbWFyeSBhdHRyaWJ1dGUnOntcbiAgICAgICAgICAgICAgICBhdHRyOiBwcmltYXJ5X2F0dHJpYnV0ZSxcbiAgICAgICAgICAgICAgICB0ZXh0OiAnUHJpbWFyeSBBdHRyaWJ1dGUnLFxuICAgICAgICAgICAgICAgIGFjdGl2ZTogZmFsc2VcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAndXNlIG1hbmEnOntcbiAgICAgICAgICAgICAgICBhdHRyOiB7dmFsdWU6IDEgfSxcbiAgICAgICAgICAgICAgICB0ZXh0OiAnVXNlIE1hbmEnLFxuICAgICAgICAgICAgICAgIGFjdGl2ZTogdHJ1ZVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICd1c2UgcmVnZW4nOntcbiAgICAgICAgICAgICAgICBhdHRyOiB7dmFsdWU6IDIgfSxcbiAgICAgICAgICAgICAgICB0ZXh0OiAnVXNlIFJlZ2VuJyxcbiAgICAgICAgICAgICAgICBhY3RpdmU6IHRydWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgYWN0aXZhdGVkID0gZmFsc2UsXG4gICAgICAgIHByZXZpb3VzLFxuICAgICAgICBnb19wcmltYXJ5ID0gZmFsc2UsXG4gICAgICAgIG9iamVjdGl2ZSA9IHt9LFxuICAgICAgICBydWxlc19rZXlzID0gT2JqZWN0LmtleXMocnVsZXMpO1xuXHRcblx0JChkb2N1bWVudCkub24oXCJrZXlwcmVzc1wiLCBmdW5jdGlvbiAoZSkge1xuXHRcdHZhciBjaGFyQ29kZSA9IGUud2hpY2ggfHwgZS5rZXlDb2RlLFxuICAgICAgICAgICAgY2hhclN0ciA9IFN0cmluZy5mcm9tQ2hhckNvZGUoY2hhckNvZGUpO1xuXHRcdGlmIChjaGFyU3RyID09ICQoJyNzd2l0Y2hfa2V5JykudmFsKCkudG9Mb3dlckNhc2UoKSkge1xuXHRcdFx0aW5kZXggKz0gMTtcblx0XHRcdGlmIChpbmRleCA+PSAzKSB7XG5cdFx0XHRcdGluZGV4ID0gMDtcblx0XHRcdH1cblx0XHRcdCQoJyN0cmVhZHMnKS5hdHRyKCdzcmMnLCcvbWVkaWEvaW1hZ2VzL2l0ZW1zL3Bvd2VyX3RyZWFkc18nICsgdHlwZXNbaW5kZXhdICsgJy5wbmcnKTtcblx0XHRcdGFjdGl2YXRlZCA9IGZhbHNlO1xuXHRcdFx0Y2hlY2tSdWxlKCk7XG5cdFx0fVxuXHRcdGVsc2UgaWYgKGNoYXJTdHIgPT0gJCgnI3VzZV9rZXknKS52YWwoKS50b0xvd2VyQ2FzZSgpKSB7XG5cdFx0XHRhY3RpdmF0ZWQgPSB0cnVlO1xuXHRcdFx0Y2hlY2tSdWxlKCk7XG5cdFx0fVxuXHR9KTtcblx0XG5cdCQoJ2lucHV0W25hbWU9XCJhdHRyXCJdJykuY2xpY2soZnVuY3Rpb24oKXtcblx0XHRpZigkKHRoaXMpLmlzKCc6Y2hlY2tlZCcpKSB7XG5cdFx0XHRwcmltYXJ5X2F0dHJpYnV0ZS52YWx1ZSA9ICQodGhpcykudmFsKCk7XG5cdFx0XHRjb25zb2xlLmxvZyhwcmltYXJ5X2F0dHJpYnV0ZS52YWx1ZSk7XG5cdFx0XHRjb25zb2xlLmxvZyhydWxlcyk7XG5cdFx0fVxuXHR9KTtcblxuXHRcblx0c3RhcnQgPSBmdW5jdGlvbigpIHtcblx0XHRpZiAoIWdvX3ByaW1hcnkpIHtcblx0XHRcdHZhciBpID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKnJ1bGVzX2tleXMubGVuZ3RoKTtcblx0XHRcdG9iamVjdGl2ZSA9IHJ1bGVzX2tleXNbaV07XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0b2JqZWN0aXZlID0gJ3ByaW1hcnkgYXR0cmlidXRlJztcblx0XHR9XG5cdFx0Z29fcHJpbWFyeSA9ICFnb19wcmltYXJ5O1xuXHRcdGlmIChwcmV2aW91cyAhPSBvYmplY3RpdmUpIHtcblx0XHRcdGNvbnNvbGUubG9nKHJ1bGVzW3J1bGVzX2tleXNbaV1dKTtcblx0XHRcdGNvbnNvbGUubG9nKG9iamVjdGl2ZSk7XG5cdFx0XHQkKCcjb2JqZWN0aXZlJykudGV4dChydWxlc1tvYmplY3RpdmVdLnRleHQpO1xuXHRcdFx0YWN0aXZhdGVkID0gZmFsc2U7XG5cdFx0XHRwcmV2aW91cyA9IG9iamVjdGl2ZTtcblx0XHRcdGNoZWNrUnVsZSgpO1xuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdHN0YXJ0KCk7XG5cdFx0fVxuXHR9XG5cdFxuXHRjaGVja1J1bGUgPSBmdW5jdGlvbigpIHtcblx0XHRpZiAocnVsZXNbb2JqZWN0aXZlXS5hdHRyLnZhbHVlID09IGluZGV4ICYmICghcnVsZXNbb2JqZWN0aXZlXS5hY3RpdmUgfHwgYWN0aXZhdGVkKSkge1xuXHRcdFx0c3RhcnQoKTtcblx0XHR9XG5cdH1cblx0c3RhcnQoKTtcbn0pOyJdfQ==
