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