var HEROCALCULATOR = (function (my) {
	
	my.DamageAmpViewModel = function (a) {
		var self = new my.BuffViewModel(ko.observableArray([]));
		self.availableBuffs = ko.observableArray([
			new my.BuffOption('slardar','slardar_sprint'),
			new my.BuffOption('undying','undying_flesh_golem'),
			new my.BuffOption('chen','chen_penitence'),
			new my.BuffOption('medusa','medusa_stone_gaze'),
			new my.BuffOption('shadow_demon','shadow_demon_soul_catcher')
		]);
		self.availableDebuffs = ko.observableArray([
			new my.BuffOption('medusa','medusa_mana_shield'),
			new my.BuffOption('templar_assassin','templar_assassin_refraction'),
			new my.BuffOption('faceless_void','faceless_void_backtrack'),
			new my.BuffOption('nyx_assassin','nyx_assassin_spiked_carapace'),
			new my.BuffOption('spectre','spectre_dispersion'),
			new my.BuffOption('wisp','wisp_overcharge'),
			new my.BuffOption('bristleback','bristleback_bristleback'),
			new my.BuffOption('abaddon','abaddon_borrowed_time'),
			new my.BuffOption('abaddon','abaddon_aphotic_shield'),
			new my.BuffOption('kunkka','kunkka_ghostship'),
			new my.BuffOption('treant','treant_living_armor'),
			new my.BuffOption('dazzle','dazzle_shallow_grave')
		]);
		self.selectedBuff = ko.observable(self.availableBuffs()[0]);
		
		self.buffs = ko.observableArray([]);

		self.getAbilityDamageAmpValue = function(abilityname,attributename) {
			var a = _.findWhere(self.buffs(), {name: abilityname});
			if (a == undefined) {
				return 0;
			}
			else {
				var ability = a.data;
				return self.getAbilityAttributeValue(ability.attributes(), attributename, ability.level());
			}
		}
		
		self.getDamageMultiplierSources = ko.computed(function() {
			var sources = {};
			for (var i=0; i<self.abilities().length;i++) {
				var ability = self.abilities()[i];
					if (ability.level() > 0 && (ability.isactive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
						switch (ability.name()) {
							case 'slardar_sprint':
							case 'undying_flesh_golem':
							case 'medusa_stone_gaze':
							case 'chen_penitence':
								sources[ability.name()] = {
									'multiplier': self.getAbilityAttributeValue(ability.attributes(), 'bonus_damage_taken', ability.level())/100,
									'damagetype': 'physical',
									'displayname': ability.displayname()
								}
							break;
							case 'shadow_demon_soul_catcher':
								sources[ability.name()] = {
									'multiplier': self.getAbilityAttributeValue(ability.attributes(), 'bonus_damage_taken', ability.level())/100,
									'damagetype': 'pure',
									'displayname': ability.displayname()
								}
							break;
							case 'medusa_mana_shield':
								sources[ability.name()] = {
									'multiplier': -.5,
									'damagetype': 'percentreduction',
									'displayname': ability.displayname()
								}							
							break;
							case 'spectre_dispersion':
								sources[ability.name()] = {
									'multiplier': -self.getAbilityAttributeValue(ability.attributes(), 'damage_reflection_pct', ability.level())/100,
									'damagetype': 'percentreduction',
									'displayname': ability.displayname()
								}								
							break;
							case 'abaddon_aphotic_shield':
								sources[ability.name()] = {
									'multiplier': self.getAbilityAttributeValue(ability.attributes(), 'damage_absorb', ability.level()),
									'damagetype': 'flatreduction',
									'displayname': ability.displayname()
								}								
							break;
						}
					}
			}
			return sources;
		});
		
		return self;
	}

	return my;
}(HEROCALCULATOR));
