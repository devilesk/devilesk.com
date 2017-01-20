require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({19:[function(require,module,exports){
var $ = require('jquery');

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
},{"jquery":14}]},{},[19])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYXBwcy9hYmlsaXR5bWF0Y2hpbmcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciAkID0gcmVxdWlyZSgnanF1ZXJ5Jyk7XG5cbiQoZnVuY3Rpb24gKCkge1xuICAgICQuZ2V0SlNPTihcIi9tZWRpYS9kb3RhLWpzb24vaGVyb2RhdGEuanNvblwiLCBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICB2YXIgaGVyb2VzID0gT2JqZWN0LmtleXMoZGF0YSksXG4gICAgICAgICAgICBoZXJvZGF0YSA9IGRhdGE7XG4gICAgICAgICAgICBcbiAgICAgICAgY3JlYXRlUXVlc3Rpb24oKTtcblxuICAgICAgICBmdW5jdGlvbiBjcmVhdGVRdWVzdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBoID0gaGVyb2VzW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGhlcm9lcy5sZW5ndGgpXSxcbiAgICAgICAgICAgICAgICBkYXRhID0gaGVyb2RhdGFbaF0sXG4gICAgICAgICAgICAgICAgY291bnQgPSAwLFxuXHRcdFx0XHRpbWdDb3VudCA9IDA7XG5cdFx0XHQkKCcjY29udGVudGNvbnRhaW5lcicpLmhpZGUoKTtcbiAgICAgICAgICAgICQoJyNhYmlsaXR5Ym94X3N0YXJ0JykuZW1wdHkoKTtcbiAgICAgICAgICAgICQoJyNhYmlsaXR5Ym94X2VuZCcpLmVtcHR5KCk7XG4gICAgICAgICAgICAkKCcjaGVyb3BvcnRyYWl0JykuZW1wdHkoKTtcbiAgICAgICAgICAgICQoJyNoZXJvbmFtZScpLmVtcHR5KCk7XG5cdFx0XHRpbWdDb3VudCA9IGRhdGEuYWJpbGl0aWVzLmZpbHRlcihmdW5jdGlvbiAoYWJpbGl0eSkgeyBcblx0XHRcdFx0cmV0dXJuIGFiaWxpdHkubmFtZSAhPSAnYXR0cmlidXRlX2JvbnVzJyAmJiBhYmlsaXR5LmRpc3BsYXluYW1lICE9ICdFbXB0eScgJiYgYWJpbGl0eS5kaXNwbGF5bmFtZSAhPSAnJ1xuXHRcdFx0fSkubGVuZ3RoICsgMTtcblx0XHRcdFxuXHRcdFx0ZnVuY3Rpb24gY2hlY2tTaG93Q29udGVudCgpIHtcblx0XHRcdFx0aWYgKGltZ0NvdW50ID09IDApIHtcblx0XHRcdFx0XHQkKCcjY29udGVudGNvbnRhaW5lcicpLnNob3coKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0dmFyIHBvcnRyYWl0SW1hZ2UgPSBuZXcgSW1hZ2UoKTtcblx0XHRcdHBvcnRyYWl0SW1hZ2Uuc3JjID0gXCJodHRwOi8vbWVkaWEuc3RlYW1wb3dlcmVkLmNvbS9hcHBzL2RvdGEyL2ltYWdlcy9oZXJvZXMvXCIgKyBoLnJlcGxhY2UoJ25wY19kb3RhX2hlcm9fJywnJykgKyBcIl9sZy5wbmdcIjtcblx0XHRcdHBvcnRyYWl0SW1hZ2Uub25sb2FkID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0XHQkKCcjaGVyb3BvcnRyYWl0JykuYXR0cignc3JjJywgcG9ydHJhaXRJbWFnZS5zcmMpO1xuXHRcdFx0XHRpbWdDb3VudC0tO1xuXHRcdFx0XHRjaGVja1Nob3dDb250ZW50KCk7XG5cdFx0XHR9O1xuICAgICAgICAgICAgJCgnI2hlcm9uYW1lJykudGV4dChkYXRhLmRpc3BsYXluYW1lKTtcbiAgICAgICAgICAgIFxuXHRcdFx0ZnVuY3Rpb24gc2V0SW1hZ2UoZWxlbWVudCwgc3JjKSB7XG5cdFx0XHRcdGVsZW1lbnQuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywgJ3VybCgnICsgc3JjICsgJyknKTtcblx0XHRcdFx0aW1nQ291bnQtLTtcblx0XHRcdFx0Y2hlY2tTaG93Q29udGVudCgpO1xuXHRcdFx0fVxuXHRcdFx0XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEuYWJpbGl0aWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKGRhdGEuYWJpbGl0aWVzW2ldLm5hbWUgIT0gJ2F0dHJpYnV0ZV9ib251cycgJiYgZGF0YS5hYmlsaXRpZXNbaV0uZGlzcGxheW5hbWUgIT0gJ0VtcHR5JyAmJiBkYXRhLmFiaWxpdGllc1tpXS5kaXNwbGF5bmFtZSAhPSAnJykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgYWJpbGl0eWJveGVuZCA9ICQoJzxkaXYgY2xhc3M9YWJpbGl0eWJveF9lbmQgaWQ9YWJpbGl0eV8nICsgaSArICc+PC9kaXY+JykuZHJvcHBhYmxlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjY2VwdDogJyMnICsgZGF0YS5hYmlsaXRpZXNbaV0ubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvbGVyYW5jZTogJ2ludGVyc2VjdCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBkcm9wOiBmdW5jdGlvbiAoZXZlbnQsIHVpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRyb3BfcCA9ICQodGhpcykub2Zmc2V0KCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRyYWdfcCA9IHVpLmRyYWdnYWJsZS5vZmZzZXQoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGVmdF9lbmQgPSBkcm9wX3AubGVmdCAtIGRyYWdfcC5sZWZ0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b3BfZW5kID0gZHJvcF9wLnRvcCAtIGRyYWdfcC50b3A7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdWkuZHJhZ2dhYmxlLmFuaW1hdGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b3A6ICcrPScgKyB0b3BfZW5kLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZWZ0OiAnKz0nICsgbGVmdF9lbmRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50ICs9IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY291bnQgPT0gZGF0YS5hYmlsaXRpZXMubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZVF1ZXN0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KS5hcHBlbmRUbygnI2FiaWxpdHlib3hfZW5kJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIGltYWdlVXJsID0gXCJodHRwOi8vbWVkaWEuc3RlYW1wb3dlcmVkLmNvbS9hcHBzL2RvdGEyL2ltYWdlcy9hYmlsaXRpZXMvXCIgKyBkYXRhLmFiaWxpdGllc1tpXS5uYW1lICsgXCJfaHAyLnBuZ1wiO1xuXHRcdFx0XHRcdFx0b3ZlcmxheSA9ICQoJzxkaXYgY2xhc3M9XCJvdmVybGF5LWhvdmVyXCI+PC9kaXY+JyksXG5cdFx0XHRcdFx0XHRhYmlsaXR5V3JhcHBlciA9ICQoJzxkaXYgY2xhc3M9XCJhYmlsaXR5LXdyYXBwZXJcIiBpZD0nICsgZGF0YS5hYmlsaXRpZXNbaV0ubmFtZSArICc+PC9kaXY+JykuZHJhZ2dhYmxlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXZlcnQ6ICdpbnZhbGlkJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICBhYmlsaXR5ID0gJCgnPGRpdiBjbGFzcz1cImFiaWxpdHlib3hcIj48L2Rpdj4nKTtcblx0XHRcdFx0XHRcdGFiaWxpdHlXcmFwcGVyLmFwcGVuZChvdmVybGF5KTtcblx0XHRcdFx0XHRcdGFiaWxpdHlXcmFwcGVyLmFwcGVuZChhYmlsaXR5KTtcblxuXHRcdFx0XHRcdHZhciBhYmlsaXR5SW1hZ2UgPSBuZXcgSW1hZ2UoKTtcblx0XHRcdFx0XHRhYmlsaXR5SW1hZ2Uuc3JjID0gaW1hZ2VVcmw7XG5cdFx0XHRcdFx0YWJpbGl0eUltYWdlLm9ubG9hZCA9IHNldEltYWdlKGFiaWxpdHksIGltYWdlVXJsKTtcblx0XHRcdFx0XHRcdFxuICAgICAgICAgICAgICAgICAgICBhYmlsaXR5Lmh0bWwoJCgnPGRpdiBjbGFzcz1hYmlsaXR5dGV4dGNvbnRhaW5lcj48L2Rpdj4nKS5odG1sKCQoJzxkaXYgY2xhc3M9YWJpbGl0eXRleHQ+PC9kaXY+JykudGV4dChkYXRhLmFiaWxpdGllc1tpXS5kaXNwbGF5bmFtZSkpKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKE1hdGgucmFuZG9tKCkgPCAwLjUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFiaWxpdHlXcmFwcGVyLmFwcGVuZFRvKCcjYWJpbGl0eWJveF9zdGFydCcpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgYWJpbGl0eVdyYXBwZXIucHJlcGVuZFRvKCcjYWJpbGl0eWJveF9zdGFydCcpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG59KTsiXX0=
