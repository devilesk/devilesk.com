require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({34:[function(require,module,exports){
var $ = jQuery = require('jquery');
require('bootstrap');

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
},{"bootstrap":1,"jquery":25}]},{},[34])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYXBwcy90cmVhZC1zd2l0Y2gtdHJhaW5lci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciAkID0galF1ZXJ5ID0gcmVxdWlyZSgnanF1ZXJ5Jyk7XG5yZXF1aXJlKCdib290c3RyYXAnKTtcblxuJChmdW5jdGlvbiAoKSB7XG5cdFxuXHR2YXIgdHlwZXMgPSBbJ3N0cicsJ2ludCcsJ2FnaSddLFxuICAgICAgICBpbmRleCA9IDAsXG4gICAgICAgIGhvdGtleSA9ICdkJyxcbiAgICAgICAgcHJpbWFyeV9hdHRyaWJ1dGUgPSB7dmFsdWU6IDAgfSxcbiAgICAgICAgdXNlX2hvdGtleSA9ICdlJyxcbiAgICAgICAgcnVsZXMgPSB7XG4gICAgICAgICAgICAndGFraW5nIGRhbWFnZSc6e1xuICAgICAgICAgICAgICAgIGF0dHI6IHt2YWx1ZTogMCB9LFxuICAgICAgICAgICAgICAgIHRleHQ6ICdUYWtpbmcgRGFtYWdlJyxcbiAgICAgICAgICAgICAgICBhY3RpdmU6IGZhbHNlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgJ3ByaW1hcnkgYXR0cmlidXRlJzp7XG4gICAgICAgICAgICAgICAgYXR0cjogcHJpbWFyeV9hdHRyaWJ1dGUsXG4gICAgICAgICAgICAgICAgdGV4dDogJ1ByaW1hcnkgQXR0cmlidXRlJyxcbiAgICAgICAgICAgICAgICBhY3RpdmU6IGZhbHNlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgJ3VzZSBtYW5hJzp7XG4gICAgICAgICAgICAgICAgYXR0cjoge3ZhbHVlOiAxIH0sXG4gICAgICAgICAgICAgICAgdGV4dDogJ1VzZSBNYW5hJyxcbiAgICAgICAgICAgICAgICBhY3RpdmU6IHRydWVcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAndXNlIHJlZ2VuJzp7XG4gICAgICAgICAgICAgICAgYXR0cjoge3ZhbHVlOiAyIH0sXG4gICAgICAgICAgICAgICAgdGV4dDogJ1VzZSBSZWdlbicsXG4gICAgICAgICAgICAgICAgYWN0aXZlOiB0cnVlXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGFjdGl2YXRlZCA9IGZhbHNlLFxuICAgICAgICBwcmV2aW91cyxcbiAgICAgICAgZ29fcHJpbWFyeSA9IGZhbHNlLFxuICAgICAgICBvYmplY3RpdmUgPSB7fSxcbiAgICAgICAgcnVsZXNfa2V5cyA9IE9iamVjdC5rZXlzKHJ1bGVzKTtcblx0XG5cdCQoZG9jdW1lbnQpLm9uKFwia2V5cHJlc3NcIiwgZnVuY3Rpb24gKGUpIHtcblx0XHR2YXIgY2hhckNvZGUgPSBlLndoaWNoIHx8IGUua2V5Q29kZSxcbiAgICAgICAgICAgIGNoYXJTdHIgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGNoYXJDb2RlKTtcblx0XHRpZiAoY2hhclN0ciA9PSAkKCcjc3dpdGNoX2tleScpLnZhbCgpLnRvTG93ZXJDYXNlKCkpIHtcblx0XHRcdGluZGV4ICs9IDE7XG5cdFx0XHRpZiAoaW5kZXggPj0gMykge1xuXHRcdFx0XHRpbmRleCA9IDA7XG5cdFx0XHR9XG5cdFx0XHQkKCcjdHJlYWRzJykuYXR0cignc3JjJywnL21lZGlhL2ltYWdlcy9pdGVtcy9wb3dlcl90cmVhZHNfJyArIHR5cGVzW2luZGV4XSArICcucG5nJyk7XG5cdFx0XHRhY3RpdmF0ZWQgPSBmYWxzZTtcblx0XHRcdGNoZWNrUnVsZSgpO1xuXHRcdH1cblx0XHRlbHNlIGlmIChjaGFyU3RyID09ICQoJyN1c2Vfa2V5JykudmFsKCkudG9Mb3dlckNhc2UoKSkge1xuXHRcdFx0YWN0aXZhdGVkID0gdHJ1ZTtcblx0XHRcdGNoZWNrUnVsZSgpO1xuXHRcdH1cblx0fSk7XG5cdFxuXHQkKCdpbnB1dFtuYW1lPVwiYXR0clwiXScpLmNsaWNrKGZ1bmN0aW9uKCl7XG5cdFx0aWYoJCh0aGlzKS5pcygnOmNoZWNrZWQnKSkge1xuXHRcdFx0cHJpbWFyeV9hdHRyaWJ1dGUudmFsdWUgPSAkKHRoaXMpLnZhbCgpO1xuXHRcdFx0Y29uc29sZS5sb2cocHJpbWFyeV9hdHRyaWJ1dGUudmFsdWUpO1xuXHRcdFx0Y29uc29sZS5sb2cocnVsZXMpO1xuXHRcdH1cblx0fSk7XG5cblx0XG5cdHN0YXJ0ID0gZnVuY3Rpb24oKSB7XG5cdFx0aWYgKCFnb19wcmltYXJ5KSB7XG5cdFx0XHR2YXIgaSA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSpydWxlc19rZXlzLmxlbmd0aCk7XG5cdFx0XHRvYmplY3RpdmUgPSBydWxlc19rZXlzW2ldO1xuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdG9iamVjdGl2ZSA9ICdwcmltYXJ5IGF0dHJpYnV0ZSc7XG5cdFx0fVxuXHRcdGdvX3ByaW1hcnkgPSAhZ29fcHJpbWFyeTtcblx0XHRpZiAocHJldmlvdXMgIT0gb2JqZWN0aXZlKSB7XG5cdFx0XHRjb25zb2xlLmxvZyhydWxlc1tydWxlc19rZXlzW2ldXSk7XG5cdFx0XHRjb25zb2xlLmxvZyhvYmplY3RpdmUpO1xuXHRcdFx0JCgnI29iamVjdGl2ZScpLnRleHQocnVsZXNbb2JqZWN0aXZlXS50ZXh0KTtcblx0XHRcdGFjdGl2YXRlZCA9IGZhbHNlO1xuXHRcdFx0cHJldmlvdXMgPSBvYmplY3RpdmU7XG5cdFx0XHRjaGVja1J1bGUoKTtcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHRzdGFydCgpO1xuXHRcdH1cblx0fVxuXHRcblx0Y2hlY2tSdWxlID0gZnVuY3Rpb24oKSB7XG5cdFx0aWYgKHJ1bGVzW29iamVjdGl2ZV0uYXR0ci52YWx1ZSA9PSBpbmRleCAmJiAoIXJ1bGVzW29iamVjdGl2ZV0uYWN0aXZlIHx8IGFjdGl2YXRlZCkpIHtcblx0XHRcdHN0YXJ0KCk7XG5cdFx0fVxuXHR9XG5cdHN0YXJ0KCk7XG59KTsiXX0=
