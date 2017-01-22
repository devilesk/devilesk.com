require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({30:[function(require,module,exports){
var $ = jQuery = require('jquery');
require('bootstrap');

$(function () {
    $.getJSON("/media/dota-json/herodata.json", function (data) {
        var heroes = Object.keys(data),
            herodata = data;
            
        createQuestion();

        function createQuestion() {
            var h = heroes[Math.floor(Math.random() * heroes.length)],
                data = herodata[h],
                count = 0,
				imgCount = 0;
			$('#contentcontainer').hide();
            $('#abilitybox_start').empty();
            $('#abilitybox_end').empty();
            $('#heroportrait').empty();
            $('#heroname').empty();
			imgCount = data.abilities.filter(function (ability) { 
				return ability.name != 'attribute_bonus' && ability.displayname != 'Empty' && ability.displayname != ''
			}).length + 1;
			
			function checkShowContent() {
				if (imgCount == 0) {
					$('#contentcontainer').show();
				}
			}
			var portraitImage = new Image();
			portraitImage.src = "http://media.steampowered.com/apps/dota2/images/heroes/" + h.replace('npc_dota_hero_','') + "_lg.png";
			portraitImage.onload = function () {
				$('#heroportrait').attr('src', portraitImage.src);
				imgCount--;
				checkShowContent();
			};
            $('#heroname').text(data.displayname);
            
			function setImage(element, src) {
				element.css('background-image', 'url(' + src + ')');
				imgCount--;
				checkShowContent();
			}
			
            for (var i = 0; i < data.abilities.length; i++) {
                if (data.abilities[i].name != 'attribute_bonus' && data.abilities[i].displayname != 'Empty' && data.abilities[i].displayname != '') {
                    var abilityboxend = $('<div class=abilitybox_end id=ability_' + i + '></div>').droppable({
                        accept: '#' + data.abilities[i].name,
                        tolerance: 'intersect',
                        drop: function (event, ui) {
                            var drop_p = $(this).offset(),
                                drag_p = ui.draggable.offset(),
                                left_end = drop_p.left - drag_p.left,
                                top_end = drop_p.top - drag_p.top;
                            ui.draggable.animate({
                                top: '+=' + top_end,
                                left: '+=' + left_end
                            },
                                function() {
                                    count += 1;
                                    if (count == data.abilities.length - 1) {
                                        createQuestion();
                                    }
                                }
                            );
                        }
                    }).appendTo('#abilitybox_end');

                    var imageUrl = "http://media.steampowered.com/apps/dota2/images/abilities/" + data.abilities[i].name + "_hp2.png";
						overlay = $('<div class="overlay-hover"></div>'),
						abilityWrapper = $('<div class="ability-wrapper" id=' + data.abilities[i].name + '></div>').draggable({
                            revert: 'invalid'
                        }),
                        ability = $('<div class="abilitybox"></div>');
						abilityWrapper.append(overlay);
						abilityWrapper.append(ability);

					var abilityImage = new Image();
					abilityImage.src = imageUrl;
					abilityImage.onload = setImage(ability, imageUrl);
						
                    ability.html($('<div class=abilitytextcontainer></div>').html($('<div class=abilitytext></div>').text(data.abilities[i].displayname)));
                    if (Math.random() < 0.5) {
                        abilityWrapper.appendTo('#abilitybox_start');
                    }
                    else {
                        abilityWrapper.prependTo('#abilitybox_start');
                    }
                }
            }
        }
    });
});
},{"bootstrap":1,"jquery":24}]},{},[30])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYXBwcy9hYmlsaXR5bWF0Y2hpbmcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyICQgPSBqUXVlcnkgPSByZXF1aXJlKCdqcXVlcnknKTtcbnJlcXVpcmUoJ2Jvb3RzdHJhcCcpO1xuXG4kKGZ1bmN0aW9uICgpIHtcbiAgICAkLmdldEpTT04oXCIvbWVkaWEvZG90YS1qc29uL2hlcm9kYXRhLmpzb25cIiwgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgdmFyIGhlcm9lcyA9IE9iamVjdC5rZXlzKGRhdGEpLFxuICAgICAgICAgICAgaGVyb2RhdGEgPSBkYXRhO1xuICAgICAgICAgICAgXG4gICAgICAgIGNyZWF0ZVF1ZXN0aW9uKCk7XG5cbiAgICAgICAgZnVuY3Rpb24gY3JlYXRlUXVlc3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgaCA9IGhlcm9lc1tNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBoZXJvZXMubGVuZ3RoKV0sXG4gICAgICAgICAgICAgICAgZGF0YSA9IGhlcm9kYXRhW2hdLFxuICAgICAgICAgICAgICAgIGNvdW50ID0gMCxcblx0XHRcdFx0aW1nQ291bnQgPSAwO1xuXHRcdFx0JCgnI2NvbnRlbnRjb250YWluZXInKS5oaWRlKCk7XG4gICAgICAgICAgICAkKCcjYWJpbGl0eWJveF9zdGFydCcpLmVtcHR5KCk7XG4gICAgICAgICAgICAkKCcjYWJpbGl0eWJveF9lbmQnKS5lbXB0eSgpO1xuICAgICAgICAgICAgJCgnI2hlcm9wb3J0cmFpdCcpLmVtcHR5KCk7XG4gICAgICAgICAgICAkKCcjaGVyb25hbWUnKS5lbXB0eSgpO1xuXHRcdFx0aW1nQ291bnQgPSBkYXRhLmFiaWxpdGllcy5maWx0ZXIoZnVuY3Rpb24gKGFiaWxpdHkpIHsgXG5cdFx0XHRcdHJldHVybiBhYmlsaXR5Lm5hbWUgIT0gJ2F0dHJpYnV0ZV9ib251cycgJiYgYWJpbGl0eS5kaXNwbGF5bmFtZSAhPSAnRW1wdHknICYmIGFiaWxpdHkuZGlzcGxheW5hbWUgIT0gJydcblx0XHRcdH0pLmxlbmd0aCArIDE7XG5cdFx0XHRcblx0XHRcdGZ1bmN0aW9uIGNoZWNrU2hvd0NvbnRlbnQoKSB7XG5cdFx0XHRcdGlmIChpbWdDb3VudCA9PSAwKSB7XG5cdFx0XHRcdFx0JCgnI2NvbnRlbnRjb250YWluZXInKS5zaG93KCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHZhciBwb3J0cmFpdEltYWdlID0gbmV3IEltYWdlKCk7XG5cdFx0XHRwb3J0cmFpdEltYWdlLnNyYyA9IFwiaHR0cDovL21lZGlhLnN0ZWFtcG93ZXJlZC5jb20vYXBwcy9kb3RhMi9pbWFnZXMvaGVyb2VzL1wiICsgaC5yZXBsYWNlKCducGNfZG90YV9oZXJvXycsJycpICsgXCJfbGcucG5nXCI7XG5cdFx0XHRwb3J0cmFpdEltYWdlLm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0JCgnI2hlcm9wb3J0cmFpdCcpLmF0dHIoJ3NyYycsIHBvcnRyYWl0SW1hZ2Uuc3JjKTtcblx0XHRcdFx0aW1nQ291bnQtLTtcblx0XHRcdFx0Y2hlY2tTaG93Q29udGVudCgpO1xuXHRcdFx0fTtcbiAgICAgICAgICAgICQoJyNoZXJvbmFtZScpLnRleHQoZGF0YS5kaXNwbGF5bmFtZSk7XG4gICAgICAgICAgICBcblx0XHRcdGZ1bmN0aW9uIHNldEltYWdlKGVsZW1lbnQsIHNyYykge1xuXHRcdFx0XHRlbGVtZW50LmNzcygnYmFja2dyb3VuZC1pbWFnZScsICd1cmwoJyArIHNyYyArICcpJyk7XG5cdFx0XHRcdGltZ0NvdW50LS07XG5cdFx0XHRcdGNoZWNrU2hvd0NvbnRlbnQoKTtcblx0XHRcdH1cblx0XHRcdFxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmFiaWxpdGllcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmIChkYXRhLmFiaWxpdGllc1tpXS5uYW1lICE9ICdhdHRyaWJ1dGVfYm9udXMnICYmIGRhdGEuYWJpbGl0aWVzW2ldLmRpc3BsYXluYW1lICE9ICdFbXB0eScgJiYgZGF0YS5hYmlsaXRpZXNbaV0uZGlzcGxheW5hbWUgIT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGFiaWxpdHlib3hlbmQgPSAkKCc8ZGl2IGNsYXNzPWFiaWxpdHlib3hfZW5kIGlkPWFiaWxpdHlfJyArIGkgKyAnPjwvZGl2PicpLmRyb3BwYWJsZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBhY2NlcHQ6ICcjJyArIGRhdGEuYWJpbGl0aWVzW2ldLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICB0b2xlcmFuY2U6ICdpbnRlcnNlY3QnLFxuICAgICAgICAgICAgICAgICAgICAgICAgZHJvcDogZnVuY3Rpb24gKGV2ZW50LCB1aSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkcm9wX3AgPSAkKHRoaXMpLm9mZnNldCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkcmFnX3AgPSB1aS5kcmFnZ2FibGUub2Zmc2V0KCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlZnRfZW5kID0gZHJvcF9wLmxlZnQgLSBkcmFnX3AubGVmdCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9wX2VuZCA9IGRyb3BfcC50b3AgLSBkcmFnX3AudG9wO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVpLmRyYWdnYWJsZS5hbmltYXRlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9wOiAnKz0nICsgdG9wX2VuZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGVmdDogJys9JyArIGxlZnRfZW5kXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb3VudCArPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvdW50ID09IGRhdGEuYWJpbGl0aWVzLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjcmVhdGVRdWVzdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSkuYXBwZW5kVG8oJyNhYmlsaXR5Ym94X2VuZCcpO1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBpbWFnZVVybCA9IFwiaHR0cDovL21lZGlhLnN0ZWFtcG93ZXJlZC5jb20vYXBwcy9kb3RhMi9pbWFnZXMvYWJpbGl0aWVzL1wiICsgZGF0YS5hYmlsaXRpZXNbaV0ubmFtZSArIFwiX2hwMi5wbmdcIjtcblx0XHRcdFx0XHRcdG92ZXJsYXkgPSAkKCc8ZGl2IGNsYXNzPVwib3ZlcmxheS1ob3ZlclwiPjwvZGl2PicpLFxuXHRcdFx0XHRcdFx0YWJpbGl0eVdyYXBwZXIgPSAkKCc8ZGl2IGNsYXNzPVwiYWJpbGl0eS13cmFwcGVyXCIgaWQ9JyArIGRhdGEuYWJpbGl0aWVzW2ldLm5hbWUgKyAnPjwvZGl2PicpLmRyYWdnYWJsZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV2ZXJ0OiAnaW52YWxpZCdcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgYWJpbGl0eSA9ICQoJzxkaXYgY2xhc3M9XCJhYmlsaXR5Ym94XCI+PC9kaXY+Jyk7XG5cdFx0XHRcdFx0XHRhYmlsaXR5V3JhcHBlci5hcHBlbmQob3ZlcmxheSk7XG5cdFx0XHRcdFx0XHRhYmlsaXR5V3JhcHBlci5hcHBlbmQoYWJpbGl0eSk7XG5cblx0XHRcdFx0XHR2YXIgYWJpbGl0eUltYWdlID0gbmV3IEltYWdlKCk7XG5cdFx0XHRcdFx0YWJpbGl0eUltYWdlLnNyYyA9IGltYWdlVXJsO1xuXHRcdFx0XHRcdGFiaWxpdHlJbWFnZS5vbmxvYWQgPSBzZXRJbWFnZShhYmlsaXR5LCBpbWFnZVVybCk7XG5cdFx0XHRcdFx0XHRcbiAgICAgICAgICAgICAgICAgICAgYWJpbGl0eS5odG1sKCQoJzxkaXYgY2xhc3M9YWJpbGl0eXRleHRjb250YWluZXI+PC9kaXY+JykuaHRtbCgkKCc8ZGl2IGNsYXNzPWFiaWxpdHl0ZXh0PjwvZGl2PicpLnRleHQoZGF0YS5hYmlsaXRpZXNbaV0uZGlzcGxheW5hbWUpKSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChNYXRoLnJhbmRvbSgpIDwgMC41KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhYmlsaXR5V3JhcHBlci5hcHBlbmRUbygnI2FiaWxpdHlib3hfc3RhcnQnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFiaWxpdHlXcmFwcGVyLnByZXBlbmRUbygnI2FiaWxpdHlib3hfc3RhcnQnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xufSk7Il19
