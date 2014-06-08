var HEROCALCULATOR = (function (my) {

	my.AbilityModel = function (a) {
		var self = this;

		self.abilityData = my.abilityData;
		self.hasScepter = ko.observable(false);
		self.abilities = a;
		for (var i=0;i<self.abilities().length;i++) {
			self.abilities()[i].isactive = ko.observable(false);
			self.abilities()[i].isdetail = ko.observable(false);
			self.abilities()[i].basedamage = ko.observable(0);
			self.abilities()[i].bash = ko.observable(0);
			self.abilities()[i].bashbonusdamage = ko.observable(0);
			self.abilities()[i].bonusdamage = ko.observable(0);
			self.abilities()[i].bonusdamageorb = ko.observable(0);
			self.abilities()[i].bonusdamagepct = ko.observable(0);
			self.abilities()[i].bonusdamageprecisionaura = ko.observable(0);
			self.abilities()[i].bonusdamagereduction = ko.observable(0);
			self.abilities()[i].bonushealth = ko.observable(0);
			self.abilities()[i].bonusstrength = ko.observable(0);
			self.abilities()[i].bonusstrength2 = ko.observable(0);
			self.abilities()[i].bonusagility = ko.observable(0);
			self.abilities()[i].bonusagility2 = ko.observable(0);
			self.abilities()[i].bonusint = ko.observable(0);
			self.abilities()[i].bonusallstatsreduction = ko.observable(0);
			self.abilities()[i].evasion = ko.observable(0);
			self.abilities()[i].magicresist = ko.observable(0);
			self.abilities()[i].manaregen = ko.observable(0);
			self.abilities()[i].manaregenreduction = ko.observable(0);
			self.abilities()[i].misschance = ko.observable(0);
			self.abilities()[i].movementspeedflat = ko.observable(0);
			self.abilities()[i].movementspeedpct = ko.observable(0);
			self.abilities()[i].movementspeedpctreduction = ko.observable(0);
			self.abilities()[i].turnratereduction = ko.observable(0);
			self.abilities()[i].attackrange = ko.observable(0);
			self.abilities()[i].attackspeed = ko.observable(0);
			self.abilities()[i].attackspeedreduction = ko.observable(0);
			self.abilities()[i].armor = ko.observable(0);
			self.abilities()[i].armorreduction = ko.observable(0);
			self.abilities()[i].healthregen = ko.observable(0);
			self.abilities()[i].lifesteal = ko.observable(0);
			self.abilities()[i].visionnight = ko.observable(0);
			self.abilities()[i].visionday = ko.observable(0);
		}
		self.abilityControlData = {};
		self.abilitySettingsData = function(data,parent,index) {
			if (self.abilityControlData[data] == undefined) {
				return self.processAbility(data, parent, index, self.abilityData[data]);
			}
			else {
				return self.abilityControlData[data];
			}
		}
		
		self.processAbility = function(data, parent, index, args) {
			var result = {};
			result.data = [];
			var v;
			var v_list = [];
			for (var i=0;i<args.length;i++) {
				switch (args[i].controltype) {
					case 'input':
						v = ko.observable(0);
						v_list.push(v);
						result.data.push({ labelname: args[i].label.toUpperCase() + ':', controlval: v, controltype: args[i].controltype, display: args[i].display });
					break;
					case 'checkbox':
						v = ko.observable(false);
						v_list.push(v);
						result.data.push({ labelname: args[i].label.toUpperCase() + '?', controlval: v, controltype: args[i].controltype, display: args[i].display });
					break;
					case 'text':
						// single input abilities
						if (args[i].controls == undefined) {
							if (args[i].nolevel) {
								var attributevalue = function(attributename) {
									return {fn: ko.computed(function () {
										return self.getAbilityAttributeValue(self.abilities()[index].attributes(), attributename, 0);
									})};
								};
							}
							else {
								var attributevalue = function(attributename) {
									return {fn: ko.computed(function () {
										return self.getAbilityAttributeValue(self.abilities()[index].attributes(), attributename, self.abilities()[index].level());
									})};
								};
							}
							var g = attributevalue(args[i].attributename)
							var r = self.getComputedFunction(v, g.fn, args[i].fn, parent, index, self, args[i].returnproperty);
							var tooltip = self.getAbilityAttributeTooltip(self.abilities()[index].attributes(), args[i].attributename);
							if (tooltip == '' || args[i].ignoretooltip) {
								tooltip = args[i].label;
							}
							result.data.push({ labelname: tooltip, controlval: r, controltype: args[i].controltype, display: args[i].display, clean: g.fn });
						}
						// multi input abilities
						else {
							if (args[i].nolevel) {
								var attributevalue = function(attributename) {
									return {fn: ko.computed(function () {
										return self.getAbilityAttributeValue(self.abilities()[index].attributes(), attributename, 0);
									})};
								};
							}
							else {
								var attributevalue = function(attributename) {
									return {fn: ko.computed(function () {
										return self.getAbilityAttributeValue(self.abilities()[index].attributes(), attributename, self.abilities()[index].level());
									})};
								};
							}
							var g = attributevalue(args[i].attributename)
							var r = self.getComputedFunction(v_list, g.fn, args[i].fn, parent, index, self, args[i].returnproperty,args[i].controls);
							var tooltip = self.getAbilityAttributeTooltip(self.abilities()[index].attributes(), args[i].attributename);
							if (tooltip == '' || args[i].ignoretooltip) {
								tooltip = args[i].label;
							}
							result.data.push({ labelname: tooltip, controlval: r, controltype: args[i].controltype, display: args[i].display, clean: g.fn });
						}
					break;
				}
			}
			self.abilityControlData[data] = result;
			return result;
		}

		self.getComputedFunction = function(v, attributevalue, fn, parent, index, abilitylist, returnproperty, controls) {
			return ko.computed(function() {
				if (controls == undefined) {
					if (typeof v() == 'boolean') {
						var returnval = fn(v(),attributevalue(), parent, index, abilitylist);
					}
					else {
						var returnval = fn(parseFloat(v()),attributevalue(), parent, index, abilitylist);
					}
					if (returnproperty != undefined) {
						self.abilities()[index][returnproperty](returnval);
					}
					return returnval;
				}
				else {
					var v_list = [];
					for (var i=0;i<controls.length;i++) {
						if (typeof v[controls[i]]() == 'boolean') {
							v_list.push(v[controls[i]]());
						}
						else {
							v_list.push(parseFloat(v[controls[i]]()));
						}
					}
					var returnval = fn(v_list,attributevalue(), parent, index, abilitylist);
					if (returnproperty != undefined) {
						self.abilities()[index][returnproperty](returnval);
					}
					return returnval;
				}
			});
		}

		self.getAbilityAttributeValue = function(attributes, attributename, level) {
			for (var i=0;i<attributes.length;i++) {
				if (attributes[i].name() == attributename) {
					if (level == 0) {
						return parseFloat(attributes[i].value()[0]);
					}
					else if (level > attributes[i].value().length) {
						return parseFloat(attributes[i].value()[0]);
					}
					else {
						return parseFloat(attributes[i].value()[level-1]);
					}
				}
			}
		}

		self.getAbilityAttributeTooltip = function(attributes, attributename) {
			for (var i=0;i<attributes.length;i++) {
				if (attributes[i].name() == attributename) {
						return attributes[i].tooltip();
				}
			}
			return '';
		}
		
		self.getAbilityLevelByAbilityName = function(abilityname) {
			for (var i=0;i<self.abilities().length;i++) {
				if (self.abilities()[i].name() == abilityname) {
					return self.abilities()[i].level();
				}
			}
			return -1;
		}

		self.getAbilityByName = function(abilityname) {
			for (var i=0;i<self.abilities().length;i++) {
				if (self.abilities()[i].name() == abilityname) {
					return self.abilities()[i];
				}
			}
			return undefined;
		}

		self.getAbilityPropertyValue = function(ability, property) {
			return parseFloat(ability[property]()[ability.level()-1]);
		}
		
		self.getAttributeBonusLevel = function() {
			for (var i=0;i<self.abilities().length;i++) {
				if (self.abilities()[i].name() == 'attribute_bonus') {
					return self.abilities()[i].level();
				}
			}
			return 0;		
		}
		
		self.getAllStatsReduction = ko.computed(function() {
			var total_attribute = 0;
			for (var i=0; i<self.abilities().length;i++) {
				var ability = self.abilities()[i];
				if (!(ability.name() in self.abilityData)) {
					if (ability.level() > 0 && (ability.isactive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
						for (var j=0;j<self.abilities()[i].attributes().length;j++) {
							var attribute = self.abilities()[i].attributes()[j];
							/*switch(attribute.name()) {
								// invoker_quas
								case 'bonus_strength':
									total_attribute += parseInt(attribute.value()[ability.level()-1]);
								break;
							}*/
						}
					}
				}
				else if (ability.bonusallstatsreduction != undefined) {
					if (ability.level() > 0 && (ability.isactive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
						// slark_essence_shift
						total_attribute+=ability.bonusallstatsreduction();
					}
				}
			}
			return total_attribute;
		});
		
		self.getAgility = ko.computed(function() {
			var total_attribute = 0;
			for (var i=0; i<self.abilities().length;i++) {
				var ability = self.abilities()[i];
				if (!(ability.name() in self.abilityData)) {
					if (ability.level() > 0 && (ability.isactive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
						for (var j=0;j<self.abilities()[i].attributes().length;j++) {
							var attribute = self.abilities()[i].attributes()[j];
							switch(attribute.name()) {
								// drow_ranger_marksmanship
								case 'marksmanship_agility_bonus':
									total_attribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
								break;
							}
						}
					}
				}
				else {
					if (ability.bonusagility != undefined) {
						if (ability.level() > 0 && (ability.isactive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
							// invoker_wex,morphling_morph_agi,morphling_morph_str
							total_attribute+=ability.bonusagility();
						}
					}
					if (ability.bonusagility2 != undefined) {
						if (ability.level() > 0 && (ability.isactive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
							// invoker_wex,morphling_morph_agi,morphling_morph_str
							total_attribute+=ability.bonusagility2();
						}
					}
				}
			}
			return total_attribute;
		});

		self.getIntelligence = ko.computed(function() {
			var total_attribute = 0;
			for (var i=0; i<self.abilities().length;i++) {
				var ability = self.abilities()[i];
				if (!(ability.name() in self.abilityData)) {
					if (ability.level() > 0 && (ability.isactive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
						for (var j=0;j<self.abilities()[i].attributes().length;j++) {
							var attribute = self.abilities()[i].attributes()[j];
							switch(attribute.name()) {
								// invoker_exort
							/*	case 'bonus_intelligence':
									total_attribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
								break;*/
							}
						}
					}
				}
				else if (ability.bonusint != undefined) {
					if (ability.level() > 0 && (ability.isactive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
						// invoker_exort
						total_attribute+=ability.bonusint();
					}
				}
			}
			return total_attribute;
		});
		
		self.getArmor = ko.computed(function() {
			var total_attribute = 0;
			for (var i=0; i<self.abilities().length;i++) {
				var ability = self.abilities()[i];
				if (!(ability.name() in self.abilityData)) {
					if (ability.level() > 0 && (ability.isactive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
						for (var j=0;j<self.abilities()[i].attributes().length;j++) {
							var attribute = self.abilities()[i].attributes()[j];
							switch(attribute.name()) {
								// axe_berserkers_call,dragon_knight_dragon_blood,troll_warlord_berserkers_rage,lycan_shapeshift,enraged_wildkin_toughness_aura
								case 'bonus_armor':
									if (ability.name() != 'templar_assassin_meld') {
										total_attribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
									}
								break;
								// sven_warcry
								case 'warcry_armor':
									total_attribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
								break;
								// lich_frost_armor,ogre_magi_frost_armor
								case 'armor_bonus':
									if (ability.name() == 'lich_frost_armor' || ability.name() == 'ogre_magi_frost_armor') {
										total_attribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
									}
								break;
							}
						}
					}
				}
				else if (ability.armor != undefined) {
					if (ability.level() > 0 && (ability.isactive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
						// shredder_reactive_armor,visage_gravekeepers_cloak
						total_attribute+=ability.armor();
					}
				}
			}
			return total_attribute;
		});

		self.getArmorBaseReduction = ko.computed(function() {
			var total_attribute = 1;
			for (var i=0; i<self.abilities().length;i++) {
				var ability = self.abilities()[i];
				if (!(ability.name() in self.abilityData)) {
					if (ability.level() > 0 && (ability.isactive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
						switch(ability.name()) {
							//elder_titan_natural_order
							case 'elder_titan_natural_order':
								total_attribute *= (1-self.getAbilityAttributeValue(self.abilities()[i].attributes(), 'armor_reduction_pct', ability.level())/100);
							break;
						}
					}
				}
			}
			return total_attribute;
		});
		
		self.getArmorReduction = ko.computed(function() {
			var total_attribute = 0;
			for (var i=0; i<self.abilities().length;i++) {
				var ability = self.abilities()[i];
				if (!(ability.name() in self.abilityData)) {
					if (ability.level() > 0 && (ability.isactive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
						switch(ability.name()) {
							//templar_assassin_meld
							case 'templar_assassin_meld':
								total_attribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), 'bonus_armor', ability.level());
							break;
							// tidehunter_gush
							case 'tidehunter_gush':
								total_attribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), 'armor_bonus', ability.level());
							break;
							// naga_siren_rip_tide
							case 'naga_siren_rip_tide':
							// slardar_amplify_damage
							case 'slardar_amplify_damage':
							// vengefulspirit_wave_of_terror
							case 'vengefulspirit_wave_of_terror':
								total_attribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), 'armor_reduction', ability.level());
							break;
							// nevermore_dark_lord
							case 'nevermore_dark_lord':
								total_attribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), 'presence_armor_reduction', ability.level());
							break;
						}
					}
				}
				else if (ability.armorreduction != undefined) {
					if (ability.level() > 0 && (ability.isactive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
						// alchemist_acid_spray
						total_attribute+=ability.armorreduction();
					}
				}
			}
			return total_attribute;
		});

		self.getHealth = ko.computed(function() {
			var total_attribute = 0;
			for (var i=0; i<self.abilities().length;i++) {
				var ability = self.abilities()[i];
				if (!(ability.name() in self.abilityData)) {
					if (ability.level() > 0 && (ability.isactive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
						for (var j=0;j<self.abilities()[i].attributes().length;j++) {
							var attribute = self.abilities()[i].attributes()[j];
							switch(attribute.name()) {
								// lone_druid_true_form,lycan_shapeshift,troll_warlord_berserkers_rage
								case 'bonus_hp':
									total_attribute += parseInt(attribute.value()[ability.level()-1]);
								break;
								// lone_druid_synergy
								case 'true_form_hp_bonus':
									if (self.isTrueFormActive()) {
										total_attribute += parseInt(attribute.value()[ability.level()-1]);
									}
								break;
							}
						}
					}
				}
				/*else if (ability.bonushealth != undefined) {
					if (ability.level() > 0 && (ability.isactive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
						// 
						total_attribute+=ability.bonushealth();
					}
				}*/
			}
			return total_attribute;
		});
		
		self.isTrueFormActive = function() {
			for (var i=0; i<self.abilities().length;i++) {
				var ability = self.abilities()[i];
				if (ability.isactive() && ability.name() == 'lone_druid_true_form') {
					return true;
				}
			}
			return false;
		}
		
		self.getHealthRegen = ko.computed(function() {
			var total_attribute = 0;
			for (var i=0; i<self.abilities().length;i++) {
				var ability = self.abilities()[i];
				if (!(ability.name() in self.abilityData)) {
					if (ability.level() > 0 && (ability.isactive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
						for (var j=0;j<self.abilities()[i].attributes().length;j++) {
							var attribute = self.abilities()[i].attributes()[j];
							switch(attribute.name()) {
								// alchemist_chemical_rage, dragon_knight_dragon_blood
								case 'bonus_health_regen':
								// broodmother_spin_web
								case 'heath_regen':
								// omniknight_guardian_angel,treant_living_armor,satyr_hellcaller_unholy_aura
								case 'health_regen':
									total_attribute += parseInt(attribute.value()[ability.level()-1]);
								break;
								// legion_commander_press_the_attack
								case 'hp_regen':
									total_attribute += parseInt(attribute.value()[ability.level()-1]);
								break;
							}
						}
					}
				}
				else if (ability.healthregen != undefined) {
					if (ability.level() > 0 && (ability.isactive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
						// shredder_reactive_armor,invoker_quas
						total_attribute+=ability.healthregen();
					}
				}
			}
			return total_attribute;
		});

		self.getManaRegen = ko.computed(function() {
			var total_attribute = 0;
			for (var i=0; i<self.abilities().length;i++) {
				var ability = self.abilities()[i];
				if (!(ability.name() in self.abilityData)) {
					if (ability.level() > 0 && (ability.isactive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
						for (var j=0;j<self.abilities()[i].attributes().length;j++) {
							var attribute = self.abilities()[i].attributes()[j];
							switch(attribute.name()) {
								// alchemist_chemical_rage
								case 'bonus_mana_regen':
									total_attribute += parseInt(attribute.value()[ability.level()-1]);
								break;
							}
						}
					}
				}
				else if (ability.manaregen != undefined) {
					if (ability.level() > 0 && (ability.isactive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
						// 
						total_attribute+=ability.manaregen();
					}
				}
			}
			return total_attribute;
		});
		
		self.getManaRegenArcaneAura = ko.computed(function() {
			var total_attribute = 0;
			for (var i=0; i<self.abilities().length;i++) {
				var ability = self.abilities()[i];
				if (!(ability.name() in self.abilityData)) {
					if (ability.level() > 0 && (ability.isactive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
						for (var j=0;j<self.abilities()[i].attributes().length;j++) {
							var attribute = self.abilities()[i].attributes()[j];
							switch(attribute.name()) {
								// crystal_maiden_brilliance_aura
								case 'mana_regen':
									if (ability.name() == 'crystal_maiden_brilliance_aura') {
										total_attribute += parseFloat(attribute.value()[ability.level()-1]);
									}
								break;
							}
						}
					}
				}
			}
			return total_attribute;
		});

		self.getManaRegenReduction = ko.computed(function() {
			var total_attribute = 0;
			for (var i=0; i<self.abilities().length;i++) {
				var ability = self.abilities()[i];
				if (!(ability.name() in self.abilityData)) {
					if (ability.level() > 0 && (ability.isactive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
						for (var j=0;j<self.abilities()[i].attributes().length;j++) {
							var attribute = self.abilities()[i].attributes()[j];
							/*switch(attribute.name()) {
								// 
								case '':
									total_attribute += parseInt(attribute.value()[ability.level()-1]);
								break;
							}*/
						}
					}
				}
				else if (ability.manaregenreduction != undefined) {
					if (ability.level() > 0 && (ability.isactive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
						// pugna_nether_ward
						total_attribute+=ability.manaregenreduction();
					}
				}
			}
			return total_attribute;
		});
		
		self.getAttackRange = ko.computed(function() {
			var total_attribute = 0;
			for (var i=0; i<self.abilities().length;i++) {
				var ability = self.abilities()[i];
				if (!(ability.name() in self.abilityData)) {
					if (ability.level() > 0 && (ability.isactive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
						for (var j=0;j<self.abilities()[i].attributes().length;j++) {
							var attribute = self.abilities()[i].attributes()[j];
							switch(attribute.name()) {
								// templar_assassin_psi_blades,sniper_take_aim
								case 'bonus_attack_range':
								// terrorblade_metamorphosis,troll_warlord_berserkers_rage
								case 'bonus_range':
									if (ability.name() == 'terrorblade_metamorphosis') {
										total_attribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
									}
									if (ability.name() == 'troll_warlord_berserkers_rage') {
										total_attribute -= self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
									}
								break;
								// tiny_grow
								case 'bonus_range_scepter':
									if (ability.name() == 'tiny_grow' && self.hasScepter()) {
										total_attribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
									}
								break;
								// enchantress_impetus
								case 'bonus_attack_range_scepter':
									if (ability.name() == 'enchantress_impetus' && self.hasScepter()) {
										total_attribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
									}
								break;
							}
						}
						// lone_druid_true_form
						if (ability.name() == 'lone_druid_true_form') {
							total_attribute -= 422;
						}
					}
				}
				else if (ability.attackrange != undefined) {
					if (ability.level() > 0 && (ability.isactive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
						// dragon_knight_elder_dragon_form
						total_attribute+=ability.attackrange();
					}
				}
			}
			return total_attribute;
		});
		
		self.getAttackSpeed = ko.computed(function() {
			var total_attribute = 0;
			for (var i=0; i<self.abilities().length;i++) {
				var ability = self.abilities()[i];
				if (!(ability.name() in self.abilityData)) {
					if (ability.level() > 0 && (ability.isactive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
						for (var j=0;j<self.abilities()[i].attributes().length;j++) {
							var attribute = self.abilities()[i].attributes()[j];
							switch(attribute.name()) {
								// abaddon_frostmourne,troll_warlord_battle_trance
								case 'attack_speed':
								// clinkz_strafe,ursa_overpower
								case 'attack_speed_bonus_pct':
								// visage_grave_chill
								case 'attackspeed_bonus':
								// mirana_leap
								case 'leap_speedbonus_as':
								// life_stealer
								case 'attack_speed_bonus':
									total_attribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
								break;
								// axe_culling_blade,necronomicon_archer_aoe
								case 'speed_bonus':
									if (ability.name() == 'axe_culling_blade' || ability.name() == 'necronomicon_archer_aoe') {
										total_attribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
									}
								break;
								// ancient_apparition_chilling_touch
								case 'attack_speed_pct':
									if (ability.name() == 'ancient_apparition_chilling_touch') {
										total_attribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
									}
								break;
								// beastmaster_inner_beast,lycan_feral_impulse,lone_druid_rabid,tiny_grow,phantom_assassin_phantom_strike,windrunner_focusfire,ogre_magi_bloodlust,centaur_khan_endurance_aura
								case 'bonus_attack_speed':
									if (ability.name() == 'beastmaster_inner_beast' 
									 || ability.name() == 'lycan_feral_impulse' 
									 || ability.name() == 'lone_druid_rabid' 
									 || ability.name() == 'tiny_grow' 
									 || ability.name() == 'phantom_assassin_phantom_strike' 
									 || ability.name() == 'windrunner_focusfire' 
									 || ability.name() == 'ogre_magi_bloodlust'
									 || ability.name() == 'centaur_khan_endurance_aura') {
										total_attribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
									}
								break;
							}
						}
					}
				}
				else if (ability.attackspeed != undefined) {
					if (ability.level() > 0 && (ability.isactive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
						// troll_warlord_fervor,wisp_overcharge,lina_fiery_soul,invoker_alacrity,invoker_wex
						total_attribute+=ability.attackspeed();
					}
				}
			}
			return total_attribute;
		});

		self.getAttackSpeedReduction = ko.computed(function() {
			var total_attribute = 0;
			for (var i=0; i<self.abilities().length;i++) {
				var ability = self.abilities()[i];
				if (!(ability.name() in self.abilityData)) {
					if (ability.level() > 0 && (ability.isactive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
						for (var j=0;j<self.abilities()[i].attributes().length;j++) {
							var attribute = self.abilities()[i].attributes()[j];
							switch(attribute.name()) {
								// night_stalker_void,crystal_maiden_crystal_nova,ghost_frost_attack,ogre_magi_frost_armor,polar_furbolg_ursa_warrior_thunder_clap
								case 'attackspeed_slow':
								// lich_frost_armor,lich_frost_nova,enchantress_untouchable
								case 'slow_attack_speed':
								// beastmaster_primal_roar
								case 'slow_attack_speed_pct':
								// storm_spirit_overload
								case 'overload_attack_slow':
									total_attribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
								break;
								// omniknight_degen_aura
								case 'speed_bonus':
									if (ability.name() == 'omniknight_degen_aura') {
										total_attribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
									}
								break;
								// tusk_frozen_sigil,crystal_maiden_freezing_field
								case 'attack_slow':
									if (ability.name() == 'crystal_maiden_freezing_field') {
										total_attribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
									}
									else if (ability.name() == 'tusk_frozen_sigil') {
										total_attribute -= self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
									}
								break;
								// faceless_void_time_walk
								case 'attack_speed_pct':
									if (ability.name() == 'faceless_void_time_walk') {
										total_attribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
									}
								break;
								// bounty_hunter_jinada
								case 'bonus_attackspeed':
									if (ability.name() == 'bounty_hunter_jinada') {
										total_attribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
									}
								break;
								// brewmaster_thunder_clap
								case 'attack_speed_slow':
									if (ability.name() == 'brewmaster_thunder_clap') {
										total_attribute -= self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
									}
								break;
								// medusa_stone_gaze
								case 'slow':
									if (ability.name() == 'medusa_stone_gaze') {
										total_attribute -= self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
									}
								break;
								// visage_grave_chill
								case 'attackspeed_bonus':
									total_attribute -= self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
								break;
							}
						}
						if (ability.name() == 'enraged_wildkin_tornado') {
							total_attribute -= 15;
						}
					}
				}
				else if (ability.attackspeedreduction != undefined) {
					if (ability.level() > 0 && (ability.isactive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
						// viper_viper_strike,viper_corrosive_skin,jakiro_liquid_fire,lich_chain_frost,sandking_epicenter,earth_spirit_rolling_boulder
						total_attribute+=ability.attackspeedreduction();
					}
				}
			}
			return total_attribute;
		});
		self.getBash = ko.computed(function() {
			var total_attribute = 1;
			for (var i=0; i<self.abilities().length;i++) {
				var ability = self.abilities()[i];
				if (!(ability.name() in self.abilityData)) {
					if (ability.level() > 0 && (ability.isactive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
						for (var j=0;j<self.abilities()[i].attributes().length;j++) {
							var attribute = self.abilities()[i].attributes()[j];
							switch(attribute.name()) {
								// slardar_bash
								case 'chance':
								// sniper_headshot
								case 'proc_chance':
									total_attribute *= (1 - self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100);
								break;
							}
						}
					}
				}
				else if (ability.bash != undefined) {
					// spirit_breaker_greater_bash,faceless_void_time_lock
					if (ability.level() > 0 && (ability.isactive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
						total_attribute *= (1 - ability.bash()/100);
					}
				}
			}
			return total_attribute;
		});	
		self.getBaseDamage = ko.computed(function() {
			var total_attribute = 0;
			var sources = {};
			for (var i=0; i<self.abilities().length;i++) {
				var ability = self.abilities()[i];
				if (!(ability.name() in self.abilityData)) {
					if (ability.level() > 0 && (ability.isactive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
						for (var j=0;j<self.abilities()[i].attributes().length;j++) {
							var attribute = self.abilities()[i].attributes()[j];
							switch(attribute.name()) {
								// tiny_grow
								case 'bonus_damage':
									if (ability.name() == 'tiny_grow') {
										total_attribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
										sources[ability.name()] = {
											'damage': self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level()),
											'damagetype': 'physical',
											'displayname': ability.displayname()
										}
									}
								break;
							}
						}
					}
				}
			}
			return { sources: sources, total: total_attribute };
		});
		self.getBAT = ko.computed(function() {
			var total_attribute = 0;
			for (var i=0; i<self.abilities().length;i++) {
				var ability = self.abilities()[i];
				if (!(ability.name() in self.abilityData)) {
					if (ability.level() > 0 && (ability.isactive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
						for (var j=0;j<self.abilities()[i].attributes().length;j++) {
							var attribute = self.abilities()[i].attributes()[j];
							switch(attribute.name()) {
								// troll_warlord_berserkers_rage,alchemist_chemical_rage,lone_druid_true_form,lycan_shapeshift
								case 'base_attack_time':
									total_attribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
								break;
							}
						}
					}
				}
			}
			return total_attribute;
		});
		self.getBonusDamage = ko.computed(function() {
			var total_attribute = 0;
			var sources = {};
			for (var i=0; i<self.abilities().length;i++) {
				var ability = self.abilities()[i];
				if (!(ability.name() in self.abilityData)) {
					if (ability.level() > 0 && (ability.isactive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
						for (var j=0;j<self.abilities()[i].attributes().length;j++) {
							var attribute = self.abilities()[i].attributes()[j];
							switch(attribute.name()) {
								// broodmother_insatiable_hunger,luna_lunar_blessing,templar_assassin_refraction,templar_assassin_meld,terrorblade_metamorphosis,troll_warlord_berserkers_rage
								case 'bonus_damage':
									if (ability.name() == 'broodmother_insatiable_hunger' || ability.name() == 'luna_lunar_blessing'
									 || ability.name() == 'templar_assassin_refraction' || ability.name() == 'templar_assassin_meld'
									 || ability.name() == 'terrorblade_metamorphosis' || ability.name() == 'troll_warlord_berserkers_rage') {
										total_attribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
										sources[ability.name()] = {
											'damage': self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level()),
											'damagetype': 'physical',
											'displayname': ability.displayname()
										}
									}
								break;
								// lycan_howl
								case 'hero_bonus_damage':
									total_attribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
									sources[ability.name()] = {
										'damage': self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level()),
										'damagetype': 'physical',
										'displayname': ability.displayname()
									}
								break;
							}
						}
						if (ability.name() == 'storm_spirit_overload') {
							total_attribute += self.getAbilityPropertyValue(ability, 'damage');
							sources[ability.name()] = {
								'damage': self.getAbilityPropertyValue(ability, 'damage'),
								'damagetype': 'magic',
								'displayname': ability.displayname()
							}						
						}
					}
				}
				else if (ability.bonusdamage != undefined && ability.bonusdamage() != 0) {
					if (ability.level() > 0 && (ability.isactive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
						// nevermore_necromastery,ursa_fury_swipes,ursa_enrage,invoker_alacrity,invoker_exort,elder_titan_ancestral_spirit
						total_attribute+=ability.bonusdamage();
						sources[ability.name()] = {
							'damage': ability.bonusdamage(),
							'damagetype': 'physical',
							'displayname': ability.displayname()
						}
					}
				}
			}
			return { sources: sources, total: total_attribute };
		});

		self.getBonusDamagePercent = ko.computed(function() {
			var total_attribute = 0;
			var sources = {};
			for (var i=0; i<self.abilities().length;i++) {
				var ability = self.abilities()[i];
				if (!(ability.name() in self.abilityData)) {
					if (ability.level() > 0 && (ability.isactive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
						for (var j=0;j<self.abilities()[i].attributes().length;j++) {
							var attribute = self.abilities()[i].attributes()[j];
							switch(attribute.name()) {
								// magnataur_empower,vengefulspirit_command_aura,alpha_wolf_command_aura
								case 'bonus_damage_pct':
									if (ability.name() == 'magnataur_empower' || ability.name() == 'vengefulspirit_command_aura' || ability.name() == 'alpha_wolf_command_aura') {
										total_attribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100;
										sources[ability.name()] = {
											'damage': self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100,
											'damagetype': 'physical',
											'displayname': ability.displayname()
										}
									}
								break;
								// sven_gods_strength
								case 'gods_strength_damage':
									if (ability.name() == 'sven_gods_strength') {
										total_attribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100;
										sources[ability.name()] = {
											'damage': self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100,
											'damagetype': 'physical',
											'displayname': ability.displayname()
										}
									}
								break;
							}
						}
					}
				}
				else if (ability.bonusdamagepct != undefined && ability.bonusdamagepct() != 0) {
					if (ability.level() > 0 && (ability.isactive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
						// bloodseeker_bloodrage
						total_attribute+=ability.bonusdamagepct()/100;
						sources[ability.name()] = {
							'damage': ability.bonusdamagepct()/100,
							'damagetype': 'physical',
							'displayname': ability.displayname()
						}
					}
				}
			}
			return { sources: sources, total: total_attribute };
		});

		self.getBonusDamagePrecisionAura = ko.computed(function() {
			var total_attribute1 = 0;
			var total_attribute2 = 0;
			var sources = [];
			for (var i=0; i<self.abilities().length;i++) {
				var ability = self.abilities()[i];
				if (ability.name() == 'drow_ranger_trueshot') {
					if (ability.level() > 0 && (ability.isactive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
						for (var j=0;j<self.abilities()[i].attributes().length;j++) {
							var attribute = self.abilities()[i].attributes()[j];
							switch(attribute.name()) {
								// drow_ranger_trueshot
								case 'trueshot_ranged_damage':
									total_attribute1 += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100;
									sources.push({
										'damage': self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100,
										'damagetype': 'physical',
										'displayname': ability.displayname()
									});
								break;
							}
						}
						if (ability.bonusdamageprecisionaura != undefined) {
							// drow_ranger_trueshot
							total_attribute2+=ability.bonusdamageprecisionaura();
							sources.push({
								'damage': ability.bonusdamageprecisionaura(),
								'damagetype': 'physical',
								'displayname': ability.displayname()
							});
						}
					}
				}
			}
			return { sources: sources, total: [total_attribute1,total_attribute2] };
		});
		
		self.getBonusDamageReduction = ko.computed(function() {
			var total_attribute = 0;
			for (var i=0; i<self.abilities().length;i++) {
				var ability = self.abilities()[i];
				if (!(ability.name() in self.abilityData)) {
					if (ability.level() > 0 && (ability.isactive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
						for (var j=0;j<self.abilities()[i].attributes().length;j++) {
							var attribute = self.abilities()[i].attributes()[j];
							switch(attribute.name()) {
								// bane_enfeeble
								case 'enfeeble_attack_reduction':
									total_attribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
								break;
							}
						}
					}
				}
				else if (ability.bonusdamagereduction != undefined) {
					if (ability.level() > 0 && (ability.isactive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
						// rubick_fade_bolt
						total_attribute+=ability.bonusdamagereduction();
					}
				}
			}
			return total_attribute;
		});

		self.getStrength = ko.computed(function() {
			var total_attribute = 0;
			for (var i=0; i<self.abilities().length;i++) {
				var ability = self.abilities()[i];
				if (!(ability.name() in self.abilityData)) {
					if (ability.level() > 0 && (ability.isactive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
						for (var j=0;j<self.abilities()[i].attributes().length;j++) {
							var attribute = self.abilities()[i].attributes()[j];
							/*switch(attribute.name()) {
								// invoker_quas
								case 'bonus_strength':
									total_attribute += parseInt(attribute.value()[ability.level()-1]);
								break;
							}*/
						}
					}
				}
				else {
					if (ability.bonusstrength != undefined) {
						if (ability.level() > 0 && (ability.isactive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
							// pudge_flesh_heap,invoker_quas,morphling_morph_str,morphling_morph_agi
							total_attribute+=ability.bonusstrength();
						}
					}
					if (ability.bonusstrength2 != undefined) {
						if (ability.level() > 0 && (ability.isactive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
							// pudge_flesh_heap,invoker_quas,morphling_morph_str,morphling_morph_agi
							total_attribute+=ability.bonusstrength2();
						}
					}
				}
			}
			return total_attribute;
		});
		
		self.getCritSource = ko.computed(function() {
			var sources = {};
			for (var i=0; i<self.abilities().length;i++) {
				var ability = self.abilities()[i];
				if (!(ability.name() in self.abilityData)) {
					if (ability.level() > 0 && (ability.isactive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
						switch(ability.name()) {
							// phantom_assassin_coup_de_grace,brewmaster_drunken_brawler,chaos_knight_chaos_strike,lycan_shapeshift,skeleton_king_mortal_strike,juggernaut_blade_dance,alpha_wolf_critical_strike,giant_wolf_critical_strike
							case 'phantom_assassin_coup_de_grace':
								if (sources[ability.name()] == undefined) {
									sources[ability.name()] = {
										'chance': self.getAbilityAttributeValue(self.abilities()[i].attributes(), 'crit_chance', ability.level())/100,
										'multiplier': self.getAbilityAttributeValue(self.abilities()[i].attributes(), 'crit_bonus', ability.level())/100,
										'count': 1,
										'displayname': ability.displayname()
									}
								}
								else {
									sources[ability.name()].count += 1;
								}
							break;
							case 'brewmaster_drunken_brawler':
								if (sources[ability.name()] == undefined) {
									sources[ability.name()] = {
										'chance': self.getAbilityAttributeValue(self.abilities()[i].attributes(), 'crit_chance', ability.level())/100,
										'multiplier': self.getAbilityAttributeValue(self.abilities()[i].attributes(), 'crit_multiplier', ability.level())/100,
										'count': 1,
										'displayname': ability.displayname()
									}
								}
								else {
									sources[ability.name()].count += 1;
								}
							break;
							case 'chaos_knight_chaos_strike':
							case 'lycan_shapeshift':
								if (sources[ability.name()] == undefined) {
									sources[ability.name()] = {
										'chance': self.getAbilityAttributeValue(self.abilities()[i].attributes(), 'crit_chance', ability.level())/100,
										'multiplier': self.getAbilityAttributeValue(self.abilities()[i].attributes(), 'crit_damage', ability.level())/100,
										'count': 1,
										'displayname': ability.displayname()
									}
								}
								else {
									sources[ability.name()].count += 1;
								}
							break;
							case 'skeleton_king_mortal_strike':
								if (sources[ability.name()] == undefined) {
									sources[ability.name()] = {
										'chance': self.getAbilityAttributeValue(self.abilities()[i].attributes(), 'crit_chance', ability.level())/100,
										'multiplier': self.getAbilityAttributeValue(self.abilities()[i].attributes(), 'crit_mult', ability.level())/100,
										'count': 1,
										'displayname': ability.displayname()
									}
								}
								else {
									sources[ability.name()].count += 1;
								}
							break;
							case 'juggernaut_blade_dance':
								if (sources[ability.name()] == undefined) {
									sources[ability.name()] = {
										'chance': self.getAbilityAttributeValue(self.abilities()[i].attributes(), 'blade_dance_crit_chance', ability.level())/100,
										'multiplier': self.getAbilityAttributeValue(self.abilities()[i].attributes(), 'blade_dance_crit_mult', ability.level())/100,
										'count': 1,
										'displayname': ability.displayname()
									}
								}
								else {
									sources[ability.name()].count += 1;
								}
							break;
							case 'alpha_wolf_critical_strike':
							case 'giant_wolf_critical_strike':
								if (sources[ability.name()] == undefined) {
									sources[ability.name()] = {
										'chance': self.getAbilityAttributeValue(self.abilities()[i].attributes(), 'crit_chance', ability.level())/100,
										'multiplier': self.getAbilityAttributeValue(self.abilities()[i].attributes(), 'crit_mult', ability.level())/100,
										'count': 1,
										'displayname': ability.displayname()
									}
								}
								else {
									sources[ability.name()].count += 1;
								}
							break;
						}
					}
				}
			}
			return sources;
		});	

		self.getCleaveSource = ko.computed(function() {
			var sources = {};
			for (var i=0; i<self.abilities().length;i++) {
				var ability = self.abilities()[i];
				if (!(ability.name() in self.abilityData)) {
					if (ability.level() > 0 && (ability.isactive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
						switch(ability.name()) {
							// magnataur_empower
							case 'magnataur_empower':
								if (sources[ability.name()] == undefined) {
									sources[ability.name()] = {
										'radius': self.getAbilityAttributeValue(self.abilities()[i].attributes(), 'cleave_radius', ability.level()),
										'magnitude': self.getAbilityAttributeValue(self.abilities()[i].attributes(), 'cleave_damage_pct', ability.level())/100,
										'count': 1,
										'displayname': ability.displayname()
									}
								}
								else {
									sources[ability.name()].count += 1;
								}
							break;
							// sven_great_cleave
							case 'sven_great_cleave':
								if (sources[ability.name()] == undefined) {
									sources[ability.name()] = {
										'radius': self.getAbilityAttributeValue(self.abilities()[i].attributes(), 'great_cleave_radius', ability.level()),
										'magnitude': self.getAbilityAttributeValue(self.abilities()[i].attributes(), 'great_cleave_damage', ability.level())/100,
										'count': 1,
										'displayname': ability.displayname()
									}
								}
								else {
									sources[ability.name()].count += 1;
								}
							break;
							// kunkka_tidebringer
							case 'kunkka_tidebringer':
								if (sources[ability.name()] == undefined) {
									sources[ability.name()] = {
										'radius': self.getAbilityAttributeValue(self.abilities()[i].attributes(), 'radius', ability.level()),
										'magnitude': 1,
										'count': 1,
										'displayname': ability.displayname()
									}
								}
								else {
									sources[ability.name()].count += 1;
								}
							break;
							// tiny_grow
							case 'tiny_grow':
								if (self.hasScepter()) {
									if (sources[ability.name()] == undefined) {
										sources[ability.name()] = {
											'radius': self.getAbilityAttributeValue(self.abilities()[i].attributes(), 'bonus_cleave_radius_scepter', ability.level()),
											'magnitude': self.getAbilityAttributeValue(self.abilities()[i].attributes(), 'bonus_cleave_damage_scepter', ability.level())/100,
											'count': 1,
											'displayname': ability.displayname()
										}
									}
									else {
										sources[ability.name()].count += 1;
									}
								}
							break;
						}
					}
				}
			}
			return sources;
		});	
		
		self.getCritChance = ko.computed(function() {
			var total_attribute = 1;
			for (var i=0; i<self.abilities().length;i++) {
				var ability = self.abilities()[i];
				if (!(ability.name() in self.abilityData)) {
					if (ability.level() > 0 && (ability.isactive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
						for (var j=0;j<self.abilities()[i].attributes().length;j++) {
							var attribute = self.abilities()[i].attributes()[j];
							switch(attribute.name()) {
								// phantom_assassin_coup_de_grace,brewmaster_drunken_brawler,chaos_knight_chaos_strike,lycan_shapeshift,skeleton_king_mortal_strike
								case 'crit_chance':
									total_attribute *= (1 - self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100);
								break;
							}
						}
					}
				}
			}
			return total_attribute;
		});			
		
		self.getEvasion = ko.computed(function() {
			var total_attribute = 1;
			for (var i=0; i<self.abilities().length;i++) {
				var ability = self.abilities()[i];
				if (!(ability.name() in self.abilityData)) {
					if (ability.level() > 0 && (ability.isactive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
						for (var j=0;j<self.abilities()[i].attributes().length;j++) {
							var attribute = self.abilities()[i].attributes()[j];
							switch(attribute.name()) {
								// phantom_assassin_blur
								case 'bonus_evasion':
								// brewmaster_drunken_brawler
								case 'dodge_chance':
									total_attribute *= (1 - self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100);
								break;
								// faceless_void_backtrack
								case 'dodge_chance_pct':
									total_attribute *= (1 - self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100);
								break;
							}
						}
					}
				}
			}
			return total_attribute;
		});	
		
		self.getMissChance = ko.computed(function() {
			var total_attribute = 1;
			for (var i=0; i<self.abilities().length;i++) {
				var ability = self.abilities()[i];
				if (!(ability.name() in self.abilityData)) {
					if (ability.level() > 0 && (ability.isactive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
						for (var j=0;j<self.abilities()[i].attributes().length;j++) {
							var attribute = self.abilities()[i].attributes()[j];
							switch(attribute.name()) {
								// broodmother_incapacitating_bite,brewmaster_drunken_haze
								case 'miss_chance':
								// riki_smoke_screen,keeper_of_the_light_blinding_light,tinker_laser
								case 'miss_rate':
									total_attribute *= (1 - self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100);
								break;
							}
						}
					}
				}
				else if (ability.misschance != undefined) {
					if (ability.level() > 0 && (ability.isactive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
						// night_stalker_crippling_fear
						total_attribute*=(1-ability.misschance()/100);
					}
				}
			}
			return total_attribute;
		});
		
		self.getLifesteal = ko.computed(function() {
			var total_attribute = 0;
			for (var i=0; i<self.abilities().length;i++) {
				var ability = self.abilities()[i];
				if (!(ability.name() in self.abilityData)) {
					if (ability.level() > 0 && (ability.isactive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
						for (var j=0;j<self.abilities()[i].attributes().length;j++) {
							var attribute = self.abilities()[i].attributes()[j];
							switch(attribute.name()) {
								// skeleton_king_vampiric_aura
								case 'vampiric_aura':
								// broodmother_insatiable_hunger
								case 'lifesteal_pct':
									total_attribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
								break;
							}
						}
					}
				}
				else if (ability.lifesteal != undefined) {
					if (ability.level() > 0 && (ability.isactive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
						// life_stealer_open_wounds
						total_attribute+=ability.lifesteal();
					}
				}
			}
			return total_attribute;
		});
		
		self.getMagicResist = ko.computed(function() {
			var total_attribute = 0;
			for (var i=0; i<self.abilities().length;i++) {
				var ability = self.abilities()[i];
				if (!(ability.name() in self.abilityData)) {
					if (ability.level() > 0 && (ability.isactive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
						for (var j=0;j<self.abilities()[i].attributes().length;j++) {
							var attribute = self.abilities()[i].attributes()[j];
							switch(attribute.name()) {
								// antimage_spell_shield
								case 'spell_shield_resistance':
									return self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
								break;
								// phantom_lancer_phantom_edge
								case 'magic_resistance_pct':
									if (ability.name() == 'phantom_lancer_phantom_edge') {
										return self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
									}
								break;
								// rubick_null_field
								case 'magic_damage_reduction_pct':
									if (ability.name() == 'rubick_null_field') {
										return self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
									}
								break;
							}
						}
					}
				}
				else if (ability.magicresist != undefined) {
					if (ability.level() > 0 && (ability.isactive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
						// huskar_berserkers_blood,viper_corrosive_skin,visage_gravekeepers_cloak
						total_attribute+=ability.magicresist();
					}
				}
			}
			return total_attribute;
		});

		self.getMagicResistReduction = ko.computed(function() {
			var total_attribute = 1;
			for (var i=0; i<self.abilities().length;i++) {
				var ability = self.abilities()[i];
				if (!(ability.name() in self.abilityData)) {
					if (ability.level() > 0 && (ability.isactive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
						for (var j=0;j<self.abilities()[i].attributes().length;j++) {
							var attribute = self.abilities()[i].attributes()[j];
							switch(attribute.name()) {
								// ancient_apparition_ice_vortex
								case 'spell_resist_pct':
								// pugna_decrepify
								case 'bonus_spell_damage_pct':
								// skywrath_mage_ancient_seal
								case 'resist_debuff':
									total_attribute *= (1 - self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100);
								break;
								// elder_titan_natural_order
								case 'magic_resistance_pct':
									total_attribute *= (1 + self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100);
								break;
							}
						}
					}
				}
			}
			return total_attribute;
		});
		
		self.getMovementSpeedFlat = ko.computed(function() {
			var total_attribute = 0;
			for (var i=0; i<self.abilities().length;i++) {
				var ability = self.abilities()[i];
				if (!(ability.name() in self.abilityData)) {
					if (ability.level() > 0 && (ability.isactive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
						for (var j=0;j<self.abilities()[i].attributes().length;j++) {
							var attribute = self.abilities()[i].attributes()[j];
							switch(attribute.name()) {
								// alchemist_chemical_rage
								case 'bonus_movespeed':
									if (ability.name() == 'alchemist_chemical_rage') {
										total_attribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
									}
								break;
								// tiny_grow
								case 'bonus_movement_speed':
									if (ability.name() == 'tiny_grow') {
										total_attribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
									}
								break;
								// troll_warlord_berserkers_rage
								case 'bonus_move_speed':
									if (ability.name() == 'troll_warlord_berserkers_rage') {
										total_attribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
									}								
								break;
								// lone_druid_true_form
								case 'speed_loss':
									total_attribute -= self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
								break;
							}
						}
					}
				}
				else if (ability.movementspeedflat != undefined) {
					// dragon_knight_elder_dragon_form
					if (ability.level() > 0 && (ability.isactive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
						total_attribute+=ability.movementspeedflat();
					}
				}
			}
			return total_attribute;
		});
		
		self.getMovementSpeedPercent = ko.computed(function() {
			var total_attribute = 0;
			for (var i=0; i<self.abilities().length;i++) {
				var ability = self.abilities()[i];
				if (!(ability.name() in self.abilityData)) {
					if (ability.level() > 0 && (ability.isactive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
						for (var j=0;j<self.abilities()[i].attributes().length;j++) {
							var attribute = self.abilities()[i].attributes()[j];
							switch(attribute.name()) {
								// abaddon_frostmourne 
								case 'move_speed_pct':
								// bounty_hunter_track 
								case 'bonus_move_speed_pct':
								// mirana_leap 
								case 'leap_speedbonus':
								// sven_warcry 
								case 'warcry_movespeed':
								// clinkz_wind_walk
								case 'move_speed_bonus_pct':
								// windrunner_windrun
								case 'movespeed_bonus_pct':
									total_attribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100;
								break;
								// broodmother_spin_web,spectre_spectral_dagger
								case 'bonus_movespeed':
									if (ability.name() == 'broodmother_spin_web' || ability.name() == 'spectre_spectral_dagger') {
										total_attribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100;
									}
								break;
								// axe_culling_blade,necronomicon_archer_aoe
								case 'speed_bonus':
									if (ability.name() == 'axe_culling_blade' || ability.name() == 'necronomicon_archer_aoe') {
										total_attribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100;
									}
								break;
								// nyx_assassin_vendetta 
								case 'movement_speed':
									if (ability.name() == 'nyx_assassin_vendetta') {
										total_attribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100;
									}
								break;
								// spirit_breaker_empowering_haste
								case 'bonus_movespeed_pct':
									if (ability.name() == 'spirit_breaker_empowering_haste') {
										total_attribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100;
									}
								break;
								// ogre_magi_bloodlust,slark_shadow_dance,death_prophet_witchcraft,kobold_taskmaster_speed_aura
								case 'bonus_movement_speed':
									if (ability.name() == 'ogre_magi_bloodlust' || ability.name() == 'slark_shadow_dance' || ability.name() == 'death_prophet_witchcraft' || ability.name() == 'kobold_taskmaster_speed_aura') {
										total_attribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100;
									}
								break;
								// razor_unstable_current,phantom_lancer_doppelwalk
								case 'movement_speed_pct':
									if (ability.name() == 'razor_unstable_current' || ability.name() == 'phantom_lancer_doppelwalk') {
										total_attribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100;
									}
								break;
								// treant_natures_guise,lone_druid_rabid
								case 'bonus_move_speed':
									if (ability.name() == 'treant_natures_guise' || ability.name() == 'lone_druid_rabid') {
										total_attribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100;
									}
								break;
								// wisp_tether
								case 'movespeed':
									if (ability.name() == 'wisp_tether') {
										total_attribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100;
									}
								break;
								// kunkka_ghostship,visage_grave_chill
								case 'movespeed_bonus':
									if (ability.name() == 'kunkka_ghostship' || ability.name() == 'visage_grave_chill') {
										total_attribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100;
									}								
								break;
							}
						}
					}
				}
				else if (ability.movementspeedpct != undefined) {
					// axe_battle_hunger,bristleback_warpath,spirit_breaker_greater_bash,lina_fiery_soul,invoker_ghost_walk,invoker_wex,elder_titan_ancestral_spirit
					if (ability.level() > 0 && (ability.isactive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
						total_attribute+=ability.movementspeedpct()/100;
					}
				}
			}
			return total_attribute;
		});

		self.getMovementSpeedPercentReduction = ko.computed(function() {
			var total_attribute = 0;
			for (var i=0; i<self.abilities().length;i++) {
				var ability = self.abilities()[i];
				if (!(ability.name() in self.abilityData)) {
					if (ability.level() > 0 && (ability.isactive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
						for (var j=0;j<self.abilities()[i].attributes().length;j++) {
							var attribute = self.abilities()[i].attributes()[j];
							switch(attribute.name()) {
								// elder_titan_earth_splitter,magnataur_skewer,abaddon_frostmourne 
								case 'slow_pct':
									total_attribute -= self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100;
								break;
								// night_stalker_void,crystal_maiden_crystal_nova,crystal_maiden_freezing_field,ghost_frost_attack,ogre_magi_frost_armor,polar_furbolg_ursa_warrior_thunder_clap
								case 'movespeed_slow':
								// lich_frost_armor,lich_frost_nova,enchantress_enchant
								case 'slow_movement_speed':
								// beastmaster_primal_roar
								case 'slow_movement_speed_pct':
								// drow_ranger_frost_arrows
								case 'frost_arrows_movement_speed':
								// skeleton_king_hellfire_blast
								case 'blast_slow':
								// slardar_slithereen_crush
								case 'crush_extra_slow':
								// storm_spirit_overload:
								case 'overload_move_slow':
								// windrunner_windrun
								case 'enemy_movespeed_bonus_pct':
									total_attribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100;
								break;
								// phantom_assassin_stifling_dagger,tusk_frozen_sigil
								case 'move_slow':
									if (ability.name() == 'phantom_assassin_stifling_dagger') {
										total_attribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100;
									}
									else if (ability.name() == 'tusk_frozen_sigil') {
										total_attribute -= self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100;
									}
								break;
								// invoker_ice_wall,medusa_stone_gaze,wisp_tether
								case 'slow':
									if (ability.name() == 'medusa_stone_gaze') {
										total_attribute -= self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100;
									}
									else {
										total_attribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100;
									}
								break;
								// broodmother_incapacitating_bite,bounty_hunter_jinada,spectre_spectral_dagger
								case 'bonus_movespeed':
									if (ability.name() == 'broodmother_incapacitating_bite' || ability.name() == 'bounty_hunter_jinada') {
										total_attribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100;
									}
									else if (ability.name() == 'spectre_spectral_dagger') {
										total_attribute -= self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100;
									}
								break;
								// omniknight_degen_aura
								case 'speed_bonus':
									if (ability.name() == 'omniknight_degen_aura') {
										total_attribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100;
									}
								break;
								// tidehunter_gush
								case 'movement_speed':
									if (ability.name() == 'tidehunter_gush') {
										total_attribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100;
									}
								break;
								// pugna_decrepify,chen_penitence
								case 'bonus_movement_speed':
									if (ability.name() == 'pugna_decrepify' || ability.name() == 'chen_penitence') {
										total_attribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100;
									}
								break;
								// ancient_apparition_ice_vortex,phantom_lancer_spirit_lance,skywrath_mage_concussive_shot,faceless_void_time_walk
								case 'movement_speed_pct':
									if (ability.name() == 'ancient_apparition_ice_vortex' || ability.name() == 'phantom_lancer_spirit_lance' || ability.name() == 'faceless_void_time_walk') {
										total_attribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100;
									}
									else if (ability.name() == 'skywrath_mage_concussive_shot') {
										total_attribute -= self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100;
									}
								break;
								// razor_unstable_current
								case 'slow_amount':
									if (ability.name() == 'razor_unstable_current') {
										total_attribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100;
									}
								break;
								// brewmaster_drunken_haze,brewmaster_thunder_clap,treant_leech_seed
								case 'movement_slow':
									if (ability.name() == 'brewmaster_drunken_haze' || ability.name() == 'brewmaster_thunder_clap') {
										total_attribute -= self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100;
									}
									else if (ability.name() == 'ursa_earthshock' || ability.name() == 'treant_leech_seed') {
										total_attribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100;
									}
								break;
								// skeleton_king_reincarnation
								case 'movespeed':
									if (ability.name() == 'skeleton_king_reincarnation') {
										total_attribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100;
									}
								break;
								// kunkka_torrent,visage_grave_chill
								case 'movespeed_bonus':
									if (ability.name() == 'kunkka_torrent') {
										total_attribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100;
									}
									else if (ability.name() == 'visage_grave_chill') {
										total_attribute -= self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100;
									}
								break;
							}
						}
						if (ability.name() == 'satyr_trickster_purge') {
							total_attribute -= 80/100;
						}
						else if (ability.name() == 'enraged_wildkin_tornado') {
							total_attribute -= 15/100;
						}
					}
				}
				else if (ability.movementspeedpctreduction != undefined) {
					if (ability.level() > 0 && (ability.isactive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
						// axe_battle_hunger,batrider_sticky_napalm,shredder_chakram,meepo_geostrike,life_stealer_open_wounds,
						// venomancer_poison_sting,viper_viper_strike,viper_corrosive_skin,viper_poison_attack,venomancer_venomous_gale,treant_leech_seed
						// lich_chain_frost,sniper_shrapnel,centaur_stampede,huskar_life_break,jakiro_dual_breath,meepo_geostrike,sandking_epicenter
						// earth_spirit_rolling_boulder,invoker_ghost_walk,invoker_ice_wall,elder_titan_earth_splitter
						total_attribute+=ability.movementspeedpctreduction()/100;
					}
				}
			}
			return total_attribute;
		});

		self.getTurnRateReduction = ko.computed(function() {
			var total_attribute = 0;
			for (var i=0; i<self.abilities().length;i++) {
				var ability = self.abilities()[i];
				if (!(ability.name() in self.abilityData)) {
					if (ability.level() > 0 && (ability.isactive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
						for (var j=0;j<self.abilities()[i].attributes().length;j++) {
							var attribute = self.abilities()[i].attributes()[j];
							switch(attribute.name()) {
								// medusa_stone_gaze
								case 'slow':
									if (ability.name() == 'medusa_stone_gaze') {
										total_attribute -= self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100;
									}
								break;
							}
						}
					}
				}
				else if (ability.turnratereduction != undefined) {
					if (ability.level() > 0 && (ability.isactive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
						// batrider_sticky_napalm
						total_attribute+=ability.turnratereduction()/100;
					}
				}
			}
			return total_attribute;
		});
		
		self.getVisionRangeNight = ko.computed(function() {
			var total_attribute = 0;
			for (var i=0; i<self.abilities().length;i++) {
				var ability = self.abilities()[i];
				if (!(ability.name() in self.abilityData)) {
					if (ability.level() > 0 && (ability.isactive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
						for (var j=0;j<self.abilities()[i].attributes().length;j++) {
							var attribute = self.abilities()[i].attributes()[j];
							switch(attribute.name()) {
								// lycan_shapeshift,luna_lunar_blessing
								case 'bonus_night_vision':
									total_attribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
								break;
							}
						}
					}
				}
				else if (ability.visionnight != undefined) {
					if (ability.level() > 0 && (ability.isactive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
						// 
						total_attribute+=ability.visionnight();
					}
				}
			}
			return total_attribute;
		});

		self.getVisionRangePctReduction = ko.computed(function() {
			var total_attribute = 0;
			for (var i=0; i<self.abilities().length;i++) {
				var ability = self.abilities()[i];
				if (!(ability.name() in self.abilityData)) {
					if (ability.level() > 0 && (ability.isactive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
						for (var j=0;j<self.abilities()[i].attributes().length;j++) {
							var attribute = self.abilities()[i].attributes()[j];
							switch(attribute.name()) {
								// night_stalker_darkness
								case 'blind_percentage':
									total_attribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100;
								break;
							}
						}
					}
				}
			}
			return total_attribute;
		});

		self.setEvasion = ko.computed(function() {
			var total_attribute = 0;
			for (var i=0; i<self.abilities().length;i++) {
				var ability = self.abilities()[i];
				if (ability.level() > 0 && (ability.isactive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
					if (ability.name() == 'windrunner_windrun') {
						return 1;
					}
				}
			}
			return total_attribute;
		});
		
		self.setMovementSpeed = ko.computed(function() {
			var MAX_MOVESPEED = 522;
			var MIN_MOVESPEED = 100;
			var total_attribute = 0;
			for (var i=0; i<self.abilities().length;i++) {
				var ability = self.abilities()[i];
				if (ability.level() > 0 && (ability.isactive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
					if (ability.name() == 'spirit_breaker_charge_of_darkness') {
						return self.getAbilityAttributeValue(ability.attributes(), 'movement_speed', ability.level());
					}
					if (ability.name() == 'dark_seer_surge') {
						return MAX_MOVESPEED;
					}
					if (ability.name() == 'centaur_stampede') {
						return MAX_MOVESPEED;
					}
					if (ability.name() == 'lion_voodoo' || ability.name() == 'shadow_shaman_voodoo') {
						return MIN_MOVESPEED;
					}
				}
			}
			return total_attribute;
		});

		self.getBashSource = function(attacktype) {
			var sources = {};
			for (var i=0; i<self.abilities().length;i++) {
				var ability = self.abilities()[i];
				if (!(ability.name() in self.abilityData)) {
					if (ability.level() > 0 && (ability.isactive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
						for (var j=0;j<self.abilities()[i].attributes().length;j++) {
							var attribute = self.abilities()[i].attributes()[j];
							switch(attribute.name()) {
								// sniper_headshot
								case 'proc_chance':
									if (sources[ability.name()] == undefined && ability.name() == 'sniper_headshot') {
										sources[ability.name()] = {
											'chance': self.getAbilityAttributeValue(ability.attributes(), attribute.name(), ability.level())/100,
											'damage': self.getAbilityPropertyValue(ability, 'damage'),
											'count': 1,
											'damagetype': 'physical',
											'displayname': ability.displayname()
										}
									}
								break;
								// slardar_bash
								case 'chance':
									if (sources[ability.name()] == undefined && ability.name() == 'slardar_bash') {
										sources[ability.name()] = {
											'chance': self.getAbilityAttributeValue(ability.attributes(), attribute.name(), ability.level())/100,
											'damage': self.getAbilityAttributeValue(ability.attributes(), 'bonus_damage', ability.level()),
											'count': 1,
											'damagetype': 'physical',
											'displayname': ability.displayname()
										}
									}
								break;
							}
						}
					}
				}
				else if (ability.bashbonusdamage != undefined) {
					if (ability.level() > 0 && (ability.isactive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
						// faceless_void_time_lock
						if (sources[ability.name()] == undefined && ability.name() == 'faceless_void_time_lock') {
							sources[ability.name()] = {
								'chance': ability.bash()/100,
								'damage': ability.bashbonusdamage(),
								'count': 1,
								'damagetype': 'magic',
								'displayname': ability.displayname()
							}
						}
						// spirit_breaker_greater_bash
						if (sources[ability.name()] == undefined && ability.name() == 'spirit_breaker_greater_bash') {
							sources[ability.name()] = {
								'chance': ability.bash()/100,
								'damage': ability.bashbonusdamage()/100,
								'count': 1,
								'damagetype': 'magic',
								'displayname': ability.displayname()
							}
						}
					}
				}
			}

			return sources;
		};
		
		self.getOrbSource = function() {
			var sources = {};
			for (var i=0; i<self.abilities().length;i++) {
				var ability = self.abilities()[i];
				if (!(ability.name() in self.abilityData)) {
					if (ability.level() > 0 && (ability.isactive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
						for (var j=0;j<self.abilities()[i].attributes().length;j++) {
							var attribute = self.abilities()[i].attributes()[j];
							switch(attribute.name()) {
								// antimage_mana_break
								case 'mana_per_hit':
									if (sources[ability.name()] == undefined && ability.name() == 'antimage_mana_break') {
										sources[ability.name()] = {
											'damage': self.getAbilityAttributeValue(ability.attributes(), attribute.name(), ability.level()) 
													* self.getAbilityAttributeValue(ability.attributes(), 'damage_per_burn', ability.level()),
											'damagetype': 'physical',
											'displayname': ability.displayname()
										}
									}
								break;
								// clinkz_searing_arrows
								case 'damage_bonus':
									if (sources[ability.name()] == undefined && ability.name() == 'clinkz_searing_arrows') {
										sources[ability.name()] = {
											'damage': self.getAbilityAttributeValue(ability.attributes(), attribute.name(), ability.level()),
											'damagetype': 'physical',
											'displayname': ability.displayname()
										}
									}
								break;
							}
						}
					}
				}
				else if (ability.bonusdamageorb != undefined) {
					if (ability.level() > 0 && (ability.isactive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
						// obsidian_destroyer_arcane_orb
						if (sources[ability.name()] == undefined && ability.name() == 'obsidian_destroyer_arcane_orb') {
							sources[ability.name()] = {
								'damage': ability.bonusdamageorb(),
								'damagetype': 'pure',
								'displayname': ability.displayname()
							}
						}
					}
				}
			}
			
			return sources;
		};
		
		self.toggleAbility = function (index, data, event) {
			if (self.abilities()[index()].behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') < 0) {
				if (self.abilities()[index()].isactive()) {
					self.abilities()[index()].isactive(false);
				}
				else {
					self.abilities()[index()].isactive(true);
				}
			}
		}.bind(this);

		self.toggleAbilityDetail = function (index, data, event) {
			if (self.abilities()[index()].isdetail()) {
				self.abilities()[index()].isdetail(false);
			}
			else {
				self.abilities()[index()].isdetail(true);
			}
		}.bind(this);
		
		self.getAbilityTooltipData = function (hero, el) {
			return my.getAbilityTooltipData(hero, el);
		}

		self.levelUpAbility = function(index, data, event, hero) {
			if (self.abilities()[index()].level() < hero.getAbilityLevelMax(data) && hero.availableSkillPoints() > 0 ) {
				switch(self.abilities()[index()].abilitytype()) {
					case 'DOTA_ABILITY_TYPE_ULTIMATE':
                        if (hero.selectedHero().heroName == 'invoker') {
                            if (
                                (self.abilities()[index()].level() == 0) && (parseInt(hero.selectedHeroLevel()) >= 2) ||
                                (self.abilities()[index()].level() == 1) && (parseInt(hero.selectedHeroLevel()) >= 7) ||
                                (self.abilities()[index()].level() == 2) && (parseInt(hero.selectedHeroLevel()) >= 11) ||
                                (self.abilities()[index()].level() == 3) && (parseInt(hero.selectedHeroLevel()) >= 17)
                            ) {
                                self.abilities()[index()].level(self.abilities()[index()].level()+1);
                                hero.skillPointHistory.push(index());
                            }
                        }
                        else if (hero.selectedHero().heroName == 'meepo') {
                            if (self.abilities()[index()].level() * 7 + 3 <= parseInt(hero.selectedHeroLevel())) {
                                self.abilities()[index()].level(self.abilities()[index()].level()+1);
                                hero.skillPointHistory.push(index());
                            }
                        }
                        else {
                            if ((self.abilities()[index()].level()+1) * 5 + 1 <= parseInt(hero.selectedHeroLevel())) {
                                self.abilities()[index()].level(self.abilities()[index()].level()+1);
                                hero.skillPointHistory.push(index());
                            }
                        }
					break;
					default:
						if (self.abilities()[index()].level() * 2 + 1 <= parseInt(hero.selectedHeroLevel())) {
							self.abilities()[index()].level(self.abilities()[index()].level()+1);
                            hero.skillPointHistory.push(index());
						}
					break;
				}
				switch (self.abilities()[index()].name()) {
					case 'beastmaster_call_of_the_wild':
					case 'chen_test_of_faith':
					case 'morphling_morph_agi':
					case 'shadow_demon_shadow_poison':
						self.abilities()[index()+1].level(self.abilities()[index()].level());
					break;
					case 'morphling_morph_str':
						self.abilities()[index()-1].level(self.abilities()[index()].level());
					break;
					case 'keeper_of_the_light_spirit_form':
						self.abilities()[index()-1].level(self.abilities()[index()].level());
						self.abilities()[index()-2].level(self.abilities()[index()].level());
					case 'nevermore_shadowraze1':
						self.abilities()[index()+1].level(self.abilities()[index()].level());
						self.abilities()[index()+2].level(self.abilities()[index()].level());
					break;
					case 'nevermore_shadowraze2':
						self.abilities()[index()-1].level(self.abilities()[index()].level());
						self.abilities()[index()+1].level(self.abilities()[index()].level());
					break;
					case 'nevermore_shadowraze3':
						self.abilities()[index()-1].level(self.abilities()[index()].level());
						self.abilities()[index()-2].level(self.abilities()[index()].level());
					break;
					case 'ember_spirit_fire_remnant':
						self.abilities()[index()-1].level(self.abilities()[index()].level());
					break;
				}
			}
		};
		self.levelDownAbility = function(index, data, event, hero) {
			if (self.abilities()[index()].level()>0) {
				self.abilities()[index()].level(self.abilities()[index()].level()-1);
                hero.skillPointHistory.splice(hero.skillPointHistory().lastIndexOf(index()), 1);
				switch (self.abilities()[index()].name()) {
					case 'beastmaster_call_of_the_wild':
					case 'chen_test_of_faith':
					case 'morphling_morph_agi':
					case 'shadow_demon_shadow_poison':
						self.abilities()[index()+1].level(self.abilities()[index()].level());
					break;
					case 'morphling_morph_str':
						self.abilities()[index()-1].level(self.abilities()[index()].level());
					break;
					case 'keeper_of_the_light_spirit_form':
						self.abilities()[index()-1].level(self.abilities()[index()].level());
						self.abilities()[index()-2].level(self.abilities()[index()].level());
					case 'nevermore_shadowraze1':
						self.abilities()[index()+1].level(self.abilities()[index()].level());
						self.abilities()[index()+2].level(self.abilities()[index()].level());
					break;
					case 'nevermore_shadowraze2':
						self.abilities()[index()-1].level(self.abilities()[index()].level());
						self.abilities()[index()+1].level(self.abilities()[index()].level());
					break;
					case 'nevermore_shadowraze3':
						self.abilities()[index()-1].level(self.abilities()[index()].level());
						self.abilities()[index()-2].level(self.abilities()[index()].level());
					break;
					case 'ember_spirit_fire_remnant':
						self.abilities()[index()-1].level(self.abilities()[index()].level());
					break;
				}
			}
		};
	}

	return my;
}(HEROCALCULATOR));