$(function () {
    $.getJSON("{{ media_url('js/heroes.json') }}", function (data) {
        var heroes = data.data;
        $.getJSON("{{ media_url('js/herodata.json') }}", function (data) {
            var herodata = data;
            createQuestion();

            function createQuestion() {
                $('#abilitybox_start').empty();
                $('#abilitybox_end').empty();
                $('#heroportrait').empty();
                $('#heroname').empty();
                var h = heroes[Math.floor(Math.random() * heroes.length)];
                var data = herodata['npc_dota_hero_' + h];
                $('#heroportrait').css('background-image', 'url("http://media.steampowered.com/apps/dota2/images/heroes/' + h + '_hphover.png")');
                $('#heroname').text(data.displayname);
                var count = 0;
                for (var i = 0; i < data.abilities.length; i++) {
                    if (data.abilities[i].name != 'attribute_bonus') {
                        var abilityboxend = $('<div class=abilitybox_end id=ability_' + i + '></div>').droppable({
                            accept: '#' + data.abilities[i].name,
                            tolerance: 'intersect',
                            drop: function (event, ui) {
                                var drop_p = $(this).offset();
                                var drag_p = ui.draggable.offset();
                                var left_end = drop_p.left - drag_p.left;
                                var top_end = drop_p.top - drag_p.top;
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

                        var imageUrl = "http://media.steampowered.com/apps/dota2/images/abilities/" + data.abilities[i].name + "_hp2.png"
                        var ability = $('<div class=abilitybox id=' + data.abilities[i].name + '></div>').css('background-image', 'url(' + imageUrl + ')').draggable({
                            revert: 'invalid'
                        });
                        ability.html($('<div class=abilitytextcontainer></div>').html($('<div class=abilitytext></div>').text(data.abilities[i].displayname)));
                        if (Math.random() < 0.5) {
                            ability.appendTo('#abilitybox_start');
                        }
                        else {
                            ability.prependTo('#abilitybox_start');
                        }
                    }
                }
            }
        });
	});
});