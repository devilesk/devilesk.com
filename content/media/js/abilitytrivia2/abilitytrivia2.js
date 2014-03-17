$(function () {
	var answer = '';
	var mode = '';
	getUrlVars();
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
	$('#skipbutton').button().click(function() {
		createQuestion();
	});
	$('#abilityname').keyup(function(event){
		if(event.keyCode == 13){
			checkAnswer();
		}
	});
	$.getJSON("{{ media_url('js/herodata.json') }}", function (data) {
		var herodata = data;
		
		createQuestion();

		function checkAnswer() {
			if ($('#abilityname').val().toLowerCase() == answer.toLowerCase()) {
				createQuestion();
			}
			else {
				$('#answerlabel').text('Wrong');
			}
		}
		function createQuestion() {
			if (mode == 'hero') {
				$('#questionprompt').text('Name the hero');
				$('#mode').html('<a href=\'/dota2/apps/abilitytrivia2/?mode=ability\'>Switch to ability mode.</a>');
			}
			else {
				$('#questionprompt').text('Name the ability');
				$('#mode').html('<a href=\'/dota2/apps/abilitytrivia2/?mode=hero\'>Switch to hero mode.</a>');
			}
			$('#heroportrait').empty();
			$('#heroname').empty();
			$('#answerlabel').empty();
			$('#abilityname').val('');
			var h = heroes[Math.floor(Math.random() * heroes.length)];
			var data = herodata['npc_dota_hero_' + h];
				$('#heroportrait').css('background-image', 'url("http://media.steampowered.com/apps/dota2/images/heroes/' + h + '_hphover.png")');
				$('#heroname').text(data.displayname);

				var a = Math.floor(Math.random() * data.abilities.length);
				while (data.abilities[a].name == 'attribute_bonus') {
					a = Math.floor(Math.random() * data.abilities.length);
				}
				if (mode != 'hero') {
					answer = data.abilities[a].displayname;
				}
				else {
					answer = data.displayname;
				}
				var count = 0;
				
				$('#ability_name').html(data.abilities[a].displayname);
				$('#ability_description').html(data.abilities[a].description);
				
				var attributes = ''
				for (var i=0;i<data.abilities[a].attributes.length;i++) {
					if (data.abilities[a].attributes[i].tooltip) {
						attributes += data.abilities[a].attributes[i].tooltip + ' ' + data.abilities[a].attributes[i].value.toString() + '<br>';
					}
				}
				$('#ability_attributes').html(attributes);
				$('#ability_lore').html(data.abilities[a].lore);
				if (data.abilities[a].manacost) {
					$('#ability_manacost').html('MANA COST: ' + data.abilities[a].manacost.toString());
				}
				if (data.abilities[a].cooldown) {
					$('#ability_cooldown').html('COOLDOWN: ' + data.abilities[a].cooldown.toString());
				}
				
					var splitname = data.displayname.split(' ');
					var tooltipdata = data2
					for (var i=0;i<splitname.length;i++) {
						var firstchar = splitname[i].substring(0,1);
						if (firstchar == firstchar.toUpperCase()) {
							var re = new RegExp(splitname[i],'g');
							tooltipdata = tooltipdata.replace(re,'???');
						}
					}
					var re2 = new RegExp(data.abilities[a].displayname,'g');
					$('#abilitytooltip').html(tooltipdata.replace(re2,'???'));
		}
	});


function getUrlVars() {
    var vars = [], hash, hashes;
	if (window.location.href.indexOf('?') > -1) {
		hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');

		for(var i = 0; i < hashes.length; i++)
		{
			hash = hashes[i].split('=');
			vars.push(hash[0]);
			vars[hash[0]] = hash[1];
		}
	}
	else {
		hashes = window.location.href.split('/');
		vars.mode = hashes[hashes.length-1];
	}
	if ((typeof vars.mode == 'undefined') || (vars.mode == 'abilitytrivia2') || (vars.mode == '') || (vars.mode == 'abilitytrivia2.html')) {
		mode = '';
	}
	else {
		mode = vars.mode;
	}
}

});