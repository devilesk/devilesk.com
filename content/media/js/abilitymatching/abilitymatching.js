$(function () {
	var heroes = ['abaddon',
		'alchemist',
		'ancient_apparition',
		'antimage',
		'axe',
		'bane',
		'batrider',
		'beastmaster',
		'bloodseeker',
		'bounty_hunter',
		'brewmaster',
		'bristleback',
		'broodmother',
		'centaur',
		'chaos_knight',
		'chen',
		'clinkz',
		'rattletrap',
		'crystal_maiden',
		'dark_seer',
		'dazzle',
		'death_prophet',
		'disruptor',
		'doom_bringer',
		'dragon_knight',
		'drow_ranger',
		'earthshaker',
		'elder_titan',
		'enchantress',
		'enigma',
		'faceless_void',
		'gyrocopter',
		'huskar',
		'invoker',
		'wisp',
		'jakiro',
		'juggernaut',
		'keeper_of_the_light',
		'kunkka',
		'legion_commander',
		'leshrac',
		'lich',
		'life_stealer',
		'lina',
		'lion',
		'lone_druid',
		'luna',
		'lycan',
		'magnataur',
		'medusa',
		'meepo',
		'mirana',
		'morphling',
		'naga_siren',
		'furion',
		'necrolyte',
		'night_stalker',
		'nyx_assassin',
		'ogre_magi',
		'omniknight',
		'obsidian_destroyer',
		'phantom_assassin',
		'phantom_lancer',
		'puck',
		'pudge',
		'pugna',
		'queenofpain',
		'razor',
		'riki',
		'rubick',
		'sand_king',
		'shadow_demon',
		'nevermore',
		'shadow_shaman',
		'silencer',
		'skeleton_king',
		'skywrath_mage',
		'slardar',
		'slark',
		'sniper',
		'spectre',
		'spirit_breaker',
		'storm_spirit',
		'sven',
		'templar_assassin',
		'tidehunter',
		'shredder',
		'tinker',
		'tiny',
		'treant',
		'troll_warlord',
		'tusk',
		'undying',
		'ursa',
		'vengefulspirit',
		'venomancer',
		'viper',
		'visage',
		'warlock',
		'weaver',
		'windrunner',
		'witch_doctor',
		'zuus'
	];

	createQuestion();

	function createQuestion() {
		$('#abilitybox_start').empty();
		$('#abilitybox_end').empty();
		$('#heroportrait').empty();
		$('#heroname').empty();
		var h = heroes[Math.floor(Math.random() * heroes.length)];
		$.getJSON('/dota2/apps/herobuilder/herodata/npc_dota_hero_' + h + '.json', function (data) {
			$('#heroportrait').css('background-image', 'url(/dota2/images/heroes/' + data.name.substring('npc_dota_hero_'.length) + '.png)');
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

					var imageUrl = '/dota2/images/spellicons/' + data.abilities[i].name + '.png'
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
		});

	}

});