$(function () {
	var items = ["antimage","axe","bane","bloodseeker","crystal_maiden","drow_ranger","earthshaker","juggernaut","mirana","morphling","nevermore","phantom_lancer","puck","pudge","razor","sand_king","storm_spirit","sven","tiny","vengefulspirit","windrunner","zuus","kunkka","lina","lion","shadow_shaman","slardar","tidehunter","witch_doctor","lich","riki","enigma","tinker","sniper","necrolyte","warlock","beastmaster","queenofpain","venomancer","faceless_void","skeleton_king","death_prophet","phantom_assassin","pugna","templar_assassin","viper","luna","dragon_knight","dazzle","rattletrap","leshrac","furion","life_stealer","dark_seer","clinkz","omniknight","enchantress","huskar","night_stalker","broodmother","bounty_hunter","weaver","jakiro","batrider","chen","spectre","ancient_apparition","doom_bringer","ursa","spirit_breaker","gyrocopter","alchemist","invoker","silencer","obsidian_destroyer","lycan","brewmaster","shadow_demon","lone_druid","chaos_knight","meepo","treant","ogre_magi","undying","rubick","disruptor","nyx_assassin","naga_siren","keeper_of_the_light","wisp","visage","slark","medusa","troll_warlord","centaur","magnataur","shredder","bristleback","tusk","skywrath_mage","abaddon","elder_titan","earth_spirit","ember_spirit"];
	var itemnames = {
'antimage':'Anti-Mage',
'axe':'Axe',
'bane':'Bane',
'bloodseeker':'Bloodseeker',
'crystal_maiden':'Crystal Maiden',
'drow_ranger':'Drow Ranger',
'earthshaker':'Earthshaker',
'juggernaut':'Juggernaut',
'mirana':'Mirana',
'morphling':'Morphling',
'nevermore':'Shadow Fiend',
'phantom_lancer':'Phantom Lancer',
'puck':'Puck',
'pudge':'Pudge',
'razor':'Razor',
'sand_king':'Sand King',
'storm_spirit':'Storm Spirit',
'sven':'Sven',
'tiny':'Tiny',
'vengefulspirit':'Vengeful Spirit',
'windrunner':'Windranger',
'zuus':'Zeus',
'kunkka':'Kunkka',
'lina':'Lina',
'lion':'Lion',
'shadow_shaman':'Shadow Shaman',
'slardar':'Slardar',
'tidehunter':'Tidehunter',
'witch_doctor':'Witch Doctor',
'lich':'Lich',
'riki':'Riki',
'enigma':'Enigma',
'tinker':'Tinker',
'sniper':'Sniper',
'necrolyte':'Necrophos',
'warlock':'Warlock',
'beastmaster':'Beastmaster',
'queenofpain':'Queen of Pain',
'venomancer':'Venomancer',
'faceless_void':'Faceless Void',
'skeleton_king':'Wraith King',
'death_prophet':'Death Prophet',
'phantom_assassin':'Phantom Assassin',
'pugna':'Pugna',
'templar_assassin':'Templar Assassin',
'viper':'Viper',
'luna':'Luna',
'dragon_knight':'Dragon Knight',
'dazzle':'Dazzle',
'rattletrap':'Clockwerk',
'leshrac':'Leshrac',
'furion':'Nature\'s Prophet',
'life_stealer':'Lifestealer',
'dark_seer':'Dark Seer',
'clinkz':'Clinkz',
'omniknight':'Omniknight',
'enchantress':'Enchantress',
'huskar':'Huskar',
'night_stalker':'Night Stalker',
'broodmother':'Broodmother',
'bounty_hunter':'Bounty Hunter',
'weaver':'Weaver',
'jakiro':'Jakiro',
'batrider':'Batrider',
'chen':'Chen',
'spectre':'Spectre',
'ancient_apparition':'Ancient Apparition',
'doom_bringer':'Doom',
'ursa':'Ursa',
'spirit_breaker':'Spirit Breaker',
'gyrocopter':'Gyrocopter',
'alchemist':'Alchemist',
'invoker':'Invoker',
'silencer':'Silencer',
'obsidian_destroyer':'Outworld Devourer',
'lycan':'Lycan',
'brewmaster':'Brewmaster',
'shadow_demon':'Shadow Demon',
'lone_druid':'Lone Druid',
'chaos_knight':'Chaos Knight',
'meepo':'Meepo',
'treant':'Treant Protector',
'ogre_magi':'Ogre Magi',
'undying':'Undying',
'rubick':'Rubick',
'disruptor':'Disruptor',
'nyx_assassin':'Nyx Assassin',
'naga_siren':'Naga Siren',
'keeper_of_the_light':'Keeper of the Light',
'wisp':'Io',
'visage':'Visage',
'slark':'Slark',
'medusa':'Medusa',
'troll_warlord':'Troll Warlord',
'centaur':'Centaur Warrunner',
'magnataur':'Magnus',
'shredder':'Timbersaw',
'bristleback':'Bristleback',
'tusk':'Tusk',
'skywrath_mage':'Skywrath Mage',
'abaddon':'Abaddon',
'elder_titan':'Elder Titan',
'earth_spirit':'Earth Spirit',
'ember_spirit':'Ember Spirit',
'legion_commander':'Tresdin',
'phoenix':'Phoenix',
'terrorblade':'Terrorblade'
};

	var answers = [0,1,2,3,4];
	var answer = 0;
	var streak = 0;
	var longeststreak = 0;
	
function shuffle(array) {
    var counter = array.length, temp, index;

    // While there are elements in the array
    while (counter > 0) {
        // Pick a random index
        index = Math.floor(Math.random() * counter);

        // Decrease counter by 1
        counter--;

        // And swap the last element with it
        temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }

    return array;
};

function generateQuestion() {

	var items_shuffled = shuffle(items.slice(0));
	var answers_shuffled = shuffle(answers.slice(0));
	answer = itemnames[items_shuffled[0]];
	/*$('#item').removeAttr('class');
	$('#item').addClass('itemsprite');
	$('#item').addClass('itemsprite-' + items_shuffled[0]);*/
	$('#item').attr('src','http://cdn.dota2.com/apps/dota2/images/heroes/' + items_shuffled[0] + '_full.png');
	for (var i=0;i<answers_shuffled.length;i++) {
		$('#answer_' + answers_shuffled[i]).html(itemnames[items_shuffled[i]]).blur();
	}
}
	$('.btn').click(function(e) {
		if ($(this).text() == answer) {
			streak += 1;
			//$('#ans_msg').css('color','green');
			$('#ans_msg').html('<h3><span class=\"label label-success\">Correct!</span></h3>');
			generateQuestion();
		}
		else {
			//$('#ans_msg').css('color','red');
			$('#ans_msg').html('<h3><span class=\"label label-danger\">Wrong!</span></h3>');
			streak = 0;
		}
			if (streak > longeststreak) {
				longeststreak = streak;
				$('#longeststreak').text('Longest Streak: ' + longeststreak);
			}
		$('#ans_msg').stop(false,true, true);
		$('#ans_msg').show();
		$('#ans_msg').fadeOut(2000);
		$('#streak').text('Current Streak: ' + streak);
		e.preventDefault();
		e.stopImmediatePropagation()
		$(this).blur();

	});
	generateQuestion();


});