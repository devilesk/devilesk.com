$(function () {
	var items = ['blink','blades_of_attack','broadsword','chainmail','claymore','helm_of_iron_will','javelin','mithril_hammer','platemail','quarterstaff','quelling_blade','ring_of_protection','gauntlets','slippers','mantle','branches','belt_of_strength','boots_of_elves','robe','circlet','ogre_axe','blade_of_alacrity','staff_of_wizardry','ultimate_orb','gloves','lifesteal','ring_of_regen','sobi_mask','boots','gem','cloak','talisman_of_evasion','cheese','magic_stick','magic_wand','ghost','clarity','flask','dust','bottle','ward_observer','ward_sentry','tango','courier','tpscroll','travel_boots','phase_boots','demon_edge','eagle','reaver','relic','hyperstone','ring_of_health','void_stone','mystic_staff','energy_booster','point_booster','vitality_booster','power_treads','hand_of_midas','oblivion_staff','pers','poor_mans_shield','bracer','wraith_band','null_talisman','mekansm','vladmir','flying_courier','buckler','ring_of_basilius','pipe','urn_of_shadows','headdress','sheepstick','orchid','cyclone','force_staff','dagon','necronomicon','ultimate_scepter','refresher','assault','heart','black_king_bar','aegis','shivas_guard','bloodstone','sphere','vanguard','blade_mail','soul_booster','hood_of_defiance','rapier','monkey_king_bar','radiance','butterfly','greater_crit','basher','bfury','manta','lesser_crit','armlet','invis_sword','sange_and_yasha','satanic','mjollnir','skadi','sange','helm_of_the_dominator','maelstrom','desolator','yasha','mask_of_madness','diffusal_blade','ethereal_blade','soul_ring','arcane_boots','orb_of_venom','stout_shield','ancient_janggo','medallion_of_courage','smoke_of_deceit','veil_of_discord','rod_of_atos','abyssal_blade','heavens_halberd','ring_of_aquila','tranquil_boots','shadow_amulet'];
	var itemnames = {
	'blink':'Blink Dagger',
	'blades_of_attack':'Blades of Attack',
	'broadsword':'Broadsword',
	'chainmail':'Chainmail',
	'claymore':'Claymore',
	'helm_of_iron_will':'Helm of Iron Will',
	'javelin':'Javelin',
	'mithril_hammer':'Mithril Hammer',
	'platemail':'Platemail',
	'quarterstaff':'Quarterstaff',
	'quelling_blade':'Quelling Blade',
	'ring_of_protection':'Ring of Protection',
	'gauntlets':'Gauntlets of Strength',
	'slippers':'Slippers of Agility',
	'mantle':'Mantle of Intelligence',
	'branches':'Iron Branch',
	'belt_of_strength':'Belt of Strength',
	'boots_of_elves':'Band of Elvenskin',
	'robe':'Robe of the Magi',
	'circlet':'Circlet',
	'ogre_axe':'Ogre Club',
	'blade_of_alacrity':'Blade of Alacrity',
	'staff_of_wizardry':'Staff of Wizardry',
	'ultimate_orb':'Ultimate Orb',
	'gloves':'Gloves of Haste',
	'lifesteal':'Morbid Mask',
	'ring_of_regen':'Ring of Regen',
	'sobi_mask':'Sage\'s Mask',
	'boots':'Boots of Speed',
	'gem':'Gem of True Sight',
	'cloak':'Cloak',
	'talisman_of_evasion':'Talisman of Evasion',
	'cheese':'Cheese',
	'magic_stick':'Magic Stick',
	'magic_wand':'Magic Wand',
	'ghost':'Ghost Scepter',
	'clarity':'Clarity',
	'flask':'Healing Salve',
	'dust':'Dust of Appearance',
	'bottle':'Bottle',
	'ward_observer':'Observer Ward',
	'ward_sentry':'Sentry Ward',
	'tango':'Tango',
	'courier':'Animal Courier',
	'tpscroll':'Town Portal Scroll',
	'travel_boots':'Boots of Travel',
	'phase_boots':'Phase Boots',
	'demon_edge':'Demon Edge',
	'eagle':'Eaglesong',
	'reaver':'Reaver',
	'relic':'Sacred Relic',
	'hyperstone':'Hyperstone',
	'ring_of_health':'Ring of Health',
	'void_stone':'Void Stone',
	'mystic_staff':'Mystic Staff',
	'energy_booster':'Energy Booster',
	'point_booster':'Point Booster',
	'vitality_booster':'Vitality Booster',
	'power_treads':'Power Treads',
	'hand_of_midas':'Hand of Midas',
	'oblivion_staff':'Oblivion Staff',
	'pers':'Perseverance',
	'poor_mans_shield':'Poor Man\'s Shield',
	'bracer':'Bracer',
	'wraith_band':'Wraith Band',
	'null_talisman':'Null Talisman',
	'mekansm':'Mekansm',
	'vladmir':'Vladmir\'s Offering',
	'flying_courier':'Flying Courier',
	'buckler':'Buckler',
	'ring_of_basilius':'Ring of Basilius',
	'pipe':'Pipe of Insight',
	'urn_of_shadows':'Urn of Shadows',
	'headdress':'Headdress',
	'sheepstick':'Scythe of Vyse',
	'orchid':'Orchid Malevolence',
	'cyclone':'Eul\'s Scepter of Divinity',
	'force_staff':'Force Staff',
	'dagon':'Dagon',
	'necronomicon':'Necronomicon',
	'ultimate_scepter':'Aghanim\'s Scepter',
	'refresher':'Refresher Orb',
	'assault':'Assault Cuirass',
	'heart':'Heart of Tarrasque',
	'black_king_bar':'Black King Bar',
	'aegis':'Aegis of the Immortal',
	'shivas_guard':'Shiva\'s Guard',
	'bloodstone':'Bloodstone',
	'sphere':'Linken\'s Sphere',
	'vanguard':'Vanguard',
	'blade_mail':'Blade Mail',
	'soul_booster':'Soul Booster',
	'hood_of_defiance':'Hood of Defiance',
	'rapier':'Divine Rapier',
	'monkey_king_bar':'Monkey King Bar',
	'radiance':'Radiance',
	'butterfly':'Butterfly',
	'greater_crit':'Daedalus',
	'basher':'Skull Basher',
	'bfury':'Battle Fury',
	'manta':'Manta Style',
	'lesser_crit':'Crystalys',
	'armlet':'Armlet of Mordiggian',
	'invis_sword':'Shadow Blade',
	'sange_and_yasha':'Sange and Yasha',
	'satanic':'Satanic',
	'mjollnir':'Mjollnir',
	'skadi':'Eye of Skadi',
	'sange':'Sange',
	'helm_of_the_dominator':'Helm of the Dominator',
	'maelstrom':'Maelstrom',
	'desolator':'Desolator',
	'yasha':'Yasha',
	'mask_of_madness':'Mask of Madness',
	'diffusal_blade':'Diffusal Blade',
	'ethereal_blade':'Ethereal Blade',
	'soul_ring':'Soul Ring',
	'arcane_boots':'Arcane Boots',
	'orb_of_venom':'Orb of Venom',
	'stout_shield':'Stout Shield',
	'ancient_janggo':'Drum of Endurance',
	'medallion_of_courage':'Medallion of Courage',
	'smoke_of_deceit':'Smoke of Deceit',
	'veil_of_discord':'Veil of Discord',
	'rod_of_atos':'Rod of Atos',
	'abyssal_blade':'Abyssal Blade',
	'heavens_halberd':'Heaven\'s Halberd',
	'ring_of_aquila':'Ring of Aquila',
	'tranquil_boots':'Tranquil Boots',
	'shadow_amulet':'Shadow Amulet'
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
	$('#item').attr('src','http://cdn.dota2.com/apps/dota2/images/items/' + items_shuffled[0] + '_lg.png');
	for (var i=0;i<answers_shuffled.length;i++) {
		$('#answer_' + answers_shuffled[i]).html(itemnames[items_shuffled[i]]).blur();
	}
}
	$('.btn').click(function(e) {
		if ($(this).text() == answer) {
			streak += 1;
			//$('#ans_msg').css('color','green');
			$('#ans_msg').html('<span class=\"label label-success\">Correct!</span>');
			generateQuestion();
		}
		else {
			//$('#ans_msg').css('color','red');
			$('#ans_msg').html('<span class=\"label label-danger\">Wrong!</span>');
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