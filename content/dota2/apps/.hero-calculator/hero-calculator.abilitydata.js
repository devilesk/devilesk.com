var HEROCALCULATOR = (function (my) {
	my.abilityData = {
		'alchemist_acid_spray': [
			{
				label: 'Duration',
				controltype: 'input'
			},
			{
				attributename: 'damage',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				}
			},
			{
				attributename: 'armor_reduction',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return -a;
				},
				returnproperty: 'armorreduction'
			}
		],
		'alchemist_unstable_concoction': [
			{
				label: 'Brew Time',
				controltype: 'input'
			},
			{
				attributename: 'max_damage',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return v*a/5;
				}
			},
			{
				attributename: 'max_stun',
				label: 'Total Stun',
				controltype: 'text',
				fn: function(v,a) {
					return v*a/5;
				}
			}
		],
		'ancient_apparition_cold_feet': [
			{
				label: 'Duration',
				controltype: 'input'
			},
			{
				attributename: 'damage',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				}
			},
			{
				attributename: 'stun_duration',
				label: 'Total Stun',
				controltype: 'text',
				fn: function(v,a) {
					return a;
				}
			}
		],
		'ancient_apparition_ice_blast': [
			{
				label: 'Duration',
				controltype: 'input'
			},
			{
				attributename: 'dot_damage',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a,parent,index) {
					return parent.ability().getAbilityPropertyValue(parent.ability().abilities()[index], 'damage')+v*a;
				}
			}
		],
		'antimage_mana_void': [
			{
				label: 'Enemy Missing Mana',
				controltype: 'input'
			},
			{
				attributename: 'mana_void_damage_per_mana',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				}
			}
		],
		'axe_battle_hunger': [
			{
				label: 'Battle Hungered Enemies',
				controltype: 'input'
			},
			{
				attributename: 'speed_bonus',
				label: 'Movement Speed Bonus',
				controltype: 'text',
				nolevel: true,
				fn: function(v,a) {
					return v*a;
				},
				returnproperty: 'movementspeedpct'
			},
			{
				attributename: 'slow',
				label: 'Movement Speed Bonus',
				controltype: 'text',
				nolevel: true,
				fn: function(v,a) {
					return a;
				},
				returnproperty: 'movementspeedpctreduction'
			}
		],
		'bane_nightmare': [
			{
				label: 'Duration',
				controltype: 'input'
			},
			{
				label: 'DAMAGE:',
				controltype: 'text',
				fn: function(v,a,parent,index) {
					return parent.ability().getAbilityPropertyValue(parent.ability().abilities()[index], 'damage')*v;
				}
			}
		],
		'bane_fiends_grip': [
			{
				label: 'Duration',
				controltype: 'input'
			},
			{
				label: 'Enemy Max Mana',
				controltype: 'input'
			},
			{
				attributename: 'fiend_grip_damage',
				label: 'Total Damage',
				controltype: 'text',
				controls: [0,1],
				fn: function(v,a,parent,index) {
					if (parent.inventory.hasScepter()) {
						return v[0]*parent.ability().getAbilityAttributeValue(parent.ability().abilities()[index].attributes(), 'fiend_grip_damage_scepter',parent.ability().abilities()[index].level());
					}
					else {
						return v[0]*a;
					}
				}
			},
			{
				attributename: 'fiend_grip_mana_drain',
				label: 'Total Mana Drain',
				controltype: 'text',
				controls: [0,1],
				nolevel: true,
				fn: function(v,a,parent,index) {
					if (parent.inventory.hasScepter()) {
						return v[0]*v[1]*parent.ability().getAbilityAttributeValue(parent.ability().abilities()[index].attributes(), 'fiend_grip_mana_drain_scepter',parent.ability().abilities()[index].level())/100;
					}
					else {
						return v[0]*v[1]*a/100;
					}
				}
			}
		],
		'batrider_sticky_napalm': [
			{
				label: 'Stacks',
				controltype: 'input'
			},
			{
				attributename: 'damage',
				label: 'Total Bonus Damage',
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				},
				returnproperty: 'bonusdamage'
			},
			{
				attributename: 'movement_speed_pct',
				label: 'Enemy Movement Speed Slow',
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				},
				returnproperty: 'movementspeedpctreduction'
			},
			{
				attributename: 'turn_rate_pct',
				label: 'Enemy Turn Rate Slow',
				controltype: 'text',
				fn: function(v,a) {
					return a;
				},
				returnproperty: 'turnratereduction'
			}
		],
		'batrider_firefly': [
			{
				label: 'Duration',
				controltype: 'input'
			},
			{
				attributename: 'damage_per_second',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				}
			}
		],
		'bloodseeker_bloodrage': [
			{
				label: 'Duration',
				controltype: 'input'
			},
			{
				label: 'DAMAGE OVER TIME:',
				controltype: 'text',
				fn: function(v,a,parent,index) {
					return parent.ability().getAbilityPropertyValue(parent.ability().abilities()[index], 'damage')*v;
				}
			},
			{
				attributename: 'damage_increase_pct',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return a;
				},
				returnproperty: 'bonusdamagepct'
			}
		],
		'bloodseeker_rupture': [
			{
				label: 'Enemy Distance Traveled',
				controltype: 'input'
			},
			{
				attributename: 'movement_damage_pct',
				label: 'DAMAGE:',
				ignoretooltip: true,
				controltype: 'text',
				fn: function(v,a,parent,index) {
					return parent.ability().getAbilityPropertyValue(parent.ability().abilities()[index], 'damage') + v*a/100;
				}
			}
		],
		'bristleback_viscous_nasal_goo': [
			{
				label: 'Stacks',
				controltype: 'input'
			},
			{
				attributename: 'armor_per_stack',
				label: 'Enemy Armor Reduction',
				controltype: 'text',
				fn: function(v,a) {
					return -v*a;
				},
				returnproperty: 'armorreduction'
			},
			{
				attributename: 'move_slow_per_stack',
				label: '%SLOW:',
				ignoretooltip: true,
				controltype: 'text',
				fn: function(v,a,parent,index,abilitylist) {
					return -(abilitylist.getAbilityAttributeValue(abilitylist.abilities()[index].attributes(), 'base_move_slow',0)+v*a);
				},
				returnproperty: 'movementspeedpctreduction'
			}
		],
		'bristleback_quill_spray': [
			{
				label: 'Stacks',
				controltype: 'input'
			},
			{
				attributename: 'quill_stack_damage',
				label: 'DAMAGE',
				controltype: 'text',
				fn: function(v,a,parent,index) {
					var total = parent.ability().getAbilityAttributeValue(parent.ability().abilities()[index].attributes(), 'quill_base_damage',parent.ability().abilities()[index].level())+v*a,
					damage_cap = parent.ability().getAbilityAttributeValue(parent.ability().abilities()[index].attributes(), 'max_damage',0);
					if (total > damage_cap) {
						total = damage_cap;
					}
					return total;
				}
			}
		],
		'bristleback_warpath': [
			{
				label: 'Stacks',
				controltype: 'input'
			},
			{
				attributename: 'damage_per_stack',
				label: 'BONUS DAMAGE:',
				ignoretooltip: true,
				controltype: 'text',
				fn: function(v,a,parent,index) {
					if (v < 1) {
						return 0;
					}
					else {
						return parent.ability().getAbilityAttributeValue(parent.ability().abilities()[index].attributes(), 'base_damage',parent.ability().abilities()[index].level())+(v-1)*a;
					}
				}
			},
			{
				attributename: 'move_speed_per_stack',
				label: '%MOVEMENT:',
				ignoretooltip: true,
				controltype: 'text',
				fn: function(v,a,parent,index) {
					if (v < 1) {
						return 0;
					}
					else {
						return parent.ability().getAbilityAttributeValue(parent.ability().abilities()[index].attributes(), 'base_move_speed',parent.ability().abilities()[index].level())+(v-1)*a;
					}
				},
				returnproperty: 'movementspeedpct'
			}
		],
		'centaur_return': [
			{
				label: 'Strength',
				controltype: 'input'
			},
			{
				attributename: 'strength_pct',
				label: 'DAMAGE:',
				controltype: 'text',
				fn: function(v,a,parent,index) {
					return parent.ability().getAbilityAttributeValue(parent.ability().abilities()[index].attributes(), 'return_damage',parent.ability().abilities()[index].level()) + v*a/100;
				}
			}
		],
		'centaur_stampede': [
			{
				label: 'Strength',
				controltype: 'input'
			},
			{
				attributename: 'strength_damage',
				label: 'DAMAGE:',
				ignoretooltip: true,
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				}
			},
			{
				attributename: 'slow_movement_speed',
				label: 'Enemy Movement Speed Slow',
				controltype: 'text',
				fn: function(v,a) {
					return -a;
				},
				returnproperty: 'movementspeedpctreduction'
			}
		],
		'crystal_maiden_frostbite': [
			{
				label: 'Duration',
				controltype: 'input'
			},
			{
				label: 'DAMAGE:',
				controltype: 'text',
				fn: function(v,a,parent,index) {
					return parent.ability().getAbilityPropertyValue(parent.ability().abilities()[index], 'damage')*v;
				}
			}
		],
		'dark_seer_ion_shell': [
			{
				label: 'Duration',
				controltype: 'input'
			},
			{
				attributename: 'damage_per_second',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				}
			}
		],
		'dazzle_shadow_wave': [
			{
				label: 'Targets',
				controltype: 'input'
			},
			{
				label: 'DAMAGE:',
				controltype: 'text',
				fn: function(v,a,parent,index) {
					return parent.ability().getAbilityPropertyValue(parent.ability().abilities()[index], 'damage')*v;
				}
			}
		],
		'dazzle_weave': [
			{
				label: 'Duration',
				controltype: 'input'
			},
			{
				attributename: 'armor_per_second',
				label: 'ARMOR',
				ignoretooltip: true,
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				},
				returnproperty: 'armor'
			},
			{
				attributename: 'armor_per_second',
				label: 'ARMOR REDUCTION:',
				ignoretooltip: true,
				controltype: 'text',
				fn: function(v,a) {
					return -v*a;
				},
				returnproperty: 'armorreduction'
			}
		],
		'death_prophet_exorcism': [
			{
				label: 'Damage Dealt',
				controltype: 'input'
			},
			{
				attributename: 'heal_percent',
				label: 'Total Armor',
				controltype: 'text',
				fn: function(v,a) {
					return v*a/100;
				}
			}
		],
		'disruptor_static_storm': [
			{
				label: 'Duration',
				controltype: 'input'
			},
			{
				label: 'DAMAGE:',
				controltype: 'text',
				fn: function(v,a,parent,index) {
					var damagevalue = 0.25 * (130 + 40 * parent.ability().abilities()[index].level()) * (1/20),
					mult = (v*4)*((v*4)+1)/2;
					return damagevalue * mult;
				}
			}
		],
		'doom_bringer_scorched_earth': [
			{
				label: 'Duration',
				controltype: 'input'
			},
			{
				attributename: 'damage_per_second',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				}
			},
			{
				attributename: 'bonus_movement_speed_pct',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return a;
				},
				returnproperty: 'movementspeedpct'
			},
			{
				attributename: 'damage_per_second',
				label: 'HP REGEN:',
				ignoretooltip: true,
				controltype: 'text',
				fn: function(v,a) {
					return a;
				},
				returnproperty: 'healthregen'
			}
		],
		'doom_bringer_doom': [
			{
				label: 'Duration',
				controltype: 'input'
			},
			{
				attributename: 'damage',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a,parent,index) {
					if (parent.inventory.hasScepter()) {
						return v*parent.ability().getAbilityAttributeValue(parent.ability().abilities()[index].attributes(), 'damage_scepter',parent.ability().abilities()[index].level());
					}
					else {
						return v*a;
					}
				}
			}
		],
		'dragon_knight_elder_dragon_form': [
			{
				label: 'Duration',
				controltype: 'input'
			},
			{
				attributename: 'bonus_attack_range',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return a;
				},
				returnproperty: 'attackrange'
			},
			{
				attributename: 'bonus_movement_speed',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return a;
				},
				returnproperty: 'movementspeedflat'
			}
		],
		'drow_ranger_trueshot': [
			{
				label: 'Drow\'s Agility',
				controltype: 'input',
				display: 'buff'
			},
			{
				attributename: 'trueshot_ranged_damage',
				label: 'DAMAGE BONUS:',
				ignoretooltip: true,
				controltype: 'text',
				display: 'buff',
				fn: function(v,a) {
					return v*a/100;
				},
				returnproperty: 'bonusdamageprecisionaura'
			}
		],
		'earth_spirit_rolling_boulder': [
			{
				label: 'Using Stone',
				controltype: 'checkbox'
			},
			{
				attributename: 'move_slow',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a,parent,index,abilitylist) {
					if (v) {
						return -a;
					}
					else {
						return 0;
					}
				},
				returnproperty: 'movementspeedpctreduction'
			},
			{
				attributename: 'attack_slow',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a,parent,index,abilitylist) {
					if (v) {
						return -a;
					}
					else {
						return 0;
					}
				},
				returnproperty: 'attackspeedreduction'
			}
		],	
		'earthshaker_echo_slam': [
			{
				label: 'Enemies in Range',
				controltype: 'input'
			},
			{
				attributename: 'echo_slam_echo_damage',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				}
			}
		],
		'elder_titan_ancestral_spirit': [
			{
				label: 'HEROES PASSED THROUGH',
				controltype: 'input'
			},
			{
				label: 'CREEPS PASSED THROUGH',
				controltype: 'input'
			},
			{
				attributename: 'damage_creeps',
				label: 'DAMAGE:',
				ignoretooltip: true,
				controltype: 'text',
				controls: [0,1],
				fn: function(v,a,parent,index) {
					return v[0]*parent.ability().getAbilityAttributeValue(parent.ability().abilities()[index].attributes(), 'damage_heroes',parent.ability().abilities()[index].level()) + v[1]*a;
				},
				returnproperty: 'bonusdamage'
			},
			{
				attributename: 'move_pct_creeps',
				label: '%BONUS SPEED:',
				ignoretooltip: true,
				controltype: 'text',
				controls: [0,1],
				fn: function(v,a,parent,index) {
					return v[0]*parent.ability().getAbilityAttributeValue(parent.ability().abilities()[index].attributes(), 'move_pct_heroes',parent.ability().abilities()[index].level()) + v[1]*a;
				},
				returnproperty: 'movementspeedpct'
			}
		],
		'elder_titan_earth_splitter': [
			{
				label: 'Enemy Max Health',
				controltype: 'input'
			},
			{
				attributename: 'damage_pct',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return v*a/100;
				}
			},
			{
				attributename: 'slow_pct',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return -a;
				},
				returnproperty: 'movementspeedpctreduction'
			}
		],
		'enchantress_natures_attendants': [
			{
				label: 'Duration',
				controltype: 'input'
			},
			{
				attributename: 'heal',
				label: 'HEAL:',
				ignoretooltip: true,
				controltype: 'text',
				fn: function(v,a,parent,index) {
					return parent.ability().getAbilityAttributeValue(parent.ability().abilities()[index].attributes(), 'wisp_count',parent.ability().abilities()[index].level())*v*a;
				}
			}
		],
		'enigma_malefice': [
			{
				label: 'Hits',
				controltype: 'input'
			},
			{
				attributename: 'damage',
				label: 'DAMAGE:',
				ignoretooltip: true,
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				}
			},
			{
				attributename: 'stun_duration',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				}
			}
		],
		'enigma_midnight_pulse': [
			{
				label: 'Duration',
				controltype: 'input'
			},
			{
				label: 'Enemy Max Health',
				controltype: 'input'
			},
			{
				attributename: 'damage_percent',
				label: 'DAMAGE:',
				ignoretooltip: true,
				controltype: 'text',
				controls: [0,1],
				fn: function(v,a,parent,index) {
					return v[0]*v[1]*a/100;
				}
			}
		],
		'enigma_black_hole': [
			{
				label: 'Duration',
				controltype: 'input'
			},
			{
				attributename: 'far_damage',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				}
			},
			{
				attributename: 'near_damage',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				}
			}
		],
		'faceless_void_time_lock': [
			{
				label: 'In Chronosphere',
				controltype: 'checkbox'
			},
			{
				attributename: 'bonus_damage',
				label: '%MOVESPEED AS DAMAGE',
				controltype: 'text',
				fn: function(v,a) {
					if (v) {
						return a*2;
					}
					else {
						return a;
					}
				},
				returnproperty: 'bashbonusdamage'
			},
			{
				attributename: 'duration',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return a;
				}
			},
			{
				attributename: 'chance_pct',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return a;
				},
				returnproperty: 'bash'
			}
		],
		'gyrocopter_rocket_barrage': [
			{
				label: 'Rockets',
				controltype: 'input'
			},
			{
				attributename: 'rockets_per_second',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return a;
				}
			},
			{
				label: 'DAMAGE:',
				controltype: 'text',
				fn: function(v,a,parent,index) {
					return parent.ability().getAbilityPropertyValue(parent.ability().abilities()[index], 'damage')*v;
				}
			}
		],
/*		'gyrocopter_homing_missile': [
			{
				label: 'Distance Traveled',
				controltype: 'input'
			},
			{
				attributename: 'damage',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				}
			}
		],
		'gyrocopter_flak_cannon': [
			{
				label: 'Attacks',
				controltype: 'input'
			},
			{
				attributename: 'damage',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				}
			}
		],*/
		'huskar_burning_spear': [
			{
				label: 'Stacks',
				controltype: 'input'
			},
			{
				attributename: 'health_cost',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				}
			},
			{
				label: 'DAMAGE:',
				controltype: 'text',
				fn: function(v,a,parent,index) {
					return parent.ability().getAbilityPropertyValue(parent.ability().abilities()[index], 'damage')*v;
				}
			}
		],
		'huskar_berserkers_blood': [
			{
				label: 'Stacks',
				controltype: 'input'
			},
			{
				attributename: 'resistance_per_stack',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				},
				returnproperty: 'magicresist'
			},
			{
				attributename: 'attack_speed_bonus_per_stack',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				},
				returnproperty: 'attackspeed'
			}
		],
		'huskar_life_break': [
			{
				label: 'Enemy Current HP',
				controltype: 'input'
			},
			{
				attributename: 'health_damage',
				label: 'DAMAGE:',
				ignoretooltip: true,
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				}
			},
			{
				label: 'Huskar Current HP',
				controltype: 'input'
			},
			{
				attributename: 'health_cost_percent',
				label: 'DAMAGE TAKEN:',
				ignoretooltip: true,
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				}
			},
			{
				attributename: 'movespeed',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return a;
				},
				returnproperty: 'movementspeedpctreduction'
			}
		],
		'invoker_quas': [
			{
				label: 'Instances',
				controltype: 'input'
			},
			{
				attributename: 'bonus_strength',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return a;
				},
				returnproperty: 'bonusstrength'
			},
			{
				attributename: 'health_regen_per_instance',
				label: 'HP REGEN:',
				ignoretooltip: true,
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				},
				returnproperty: 'healthregen'
			}
		],
		'invoker_wex': [
			{
				label: 'Instances',
				controltype: 'input'
			},
			{
				attributename: 'bonus_agility',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return a;
				},
				returnproperty: 'bonusagility'
			},
			{
				attributename: 'move_speed_per_instance',
				label: '%MOVE SPEED:',
				ignoretooltip: true,
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				},
				returnproperty: 'movementspeedpct'
			},
			{
				attributename: 'attack_speed_per_instance',
				label: '%ATTACK SPEED:',
				ignoretooltip: true,
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				},
				returnproperty: 'attackspeed'
			}
		],
		'invoker_exort': [
			{
				label: 'Instances',
				controltype: 'input'
			},
			{
				attributename: 'bonus_intelligence',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return a;
				},
				returnproperty: 'bonusint'
			},
			{
				attributename: 'bonus_damage_per_instance',
				label: 'DAMAGE:',
				ignoretooltip: true,
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				},
				returnproperty: 'bonusdamage'
			}
		],
		'invoker_ghost_walk': [
			{
				label: 'Quas Level',
				controltype: 'input'
			},
			{
				attributename: 'enemy_slow',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a,parent,index,abilitylist) {
					if (v == 0) {
						return 0;
					}
					return abilitylist.getAbilityAttributeValue(abilitylist.abilities()[index].attributes(), 'enemy_slow',v);
				},
				returnproperty: 'movementspeedpctreduction'
			},
			{
				label: 'Wex Level',
				controltype: 'input',
				display: 'ability'
			},
			{
				attributename: 'self_slow',
				label: 'Total Damage',
				controltype: 'text',
				display: 'ability',
				fn: function(v,a,parent,index,abilitylist) {
					if (v == 0) {
						return 0;
					}
					return abilitylist.getAbilityAttributeValue(abilitylist.abilities()[index].attributes(), 'self_slow',v);
				},
				returnproperty: 'movementspeedpct'
			}
		],
		'invoker_alacrity': [
			{
				label: 'Wex Level',
				controltype: 'input'
			},
			{
				attributename: 'bonus_attack_speed',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a,parent,index,abilitylist) {
					if (v == 0) {
						return 0;
					}
					return abilitylist.getAbilityAttributeValue(abilitylist.abilities()[index].attributes(), 'bonus_attack_speed',v);
				},
				returnproperty: 'attackspeed'
			},
			{
				label: 'Exort Level',
				controltype: 'input',
			},
			{
				attributename: 'bonus_damage',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a,parent,index,abilitylist) {
					if (v == 0) {
						return 0;
					}
					return abilitylist.getAbilityAttributeValue(abilitylist.abilities()[index].attributes(), 'bonus_damage',v);
				},
				returnproperty: 'bonusdamage'
			}
		],
		'invoker_ice_wall': [
			{
				label: 'Quas Level',
				controltype: 'input'
			},
			{
				attributename: 'slow',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a,parent,index,abilitylist) {
					if (v == 0) {
						return 0;
					}
					return abilitylist.getAbilityAttributeValue(abilitylist.abilities()[index].attributes(), 'slow',v);
				},
				returnproperty: 'movementspeedpctreduction'
			},
			{
				label: 'Exort Level',
				controltype: 'input',
				display: 'ability'
			},
			{
				label: 'Duration',
				controltype: 'input',
				display: 'ability'
			},
			{
				attributename: 'damage_per_second',
				label: 'DAMAGE:',
				ignoretooltip: true,
				controltype: 'text',
				display: 'ability',
				controls: [1,2],
				fn: function(v,a,parent,index,abilitylist) {
					if (v[0] == 0) {
						return 0;
					}
					return abilitylist.getAbilityAttributeValue(abilitylist.abilities()[index].attributes(), 'damage_per_second',v[0])*v[1];
				}
			}
		],
		'jakiro_dual_breath': [
			{
				label: 'Duration',
				controltype: 'input'
			},
			{
				label: 'DAMAGE:',
				controltype: 'text',
				fn: function(v,a,parent,index) {
					return parent.ability().getAbilityPropertyValue(parent.ability().abilities()[index], 'damage')*2 + 
					parent.ability().getAbilityAttributeValue(parent.ability().abilities()[index].attributes(), 'burn_damage',parent.ability().abilities()[index].level())*v;
				}
			},
			{
				attributename: 'slow_movement_speed_pct',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return a;
				},
				returnproperty: 'movementspeedpctreduction'
			},
			{
				attributename: 'slow_attack_speed_pct',
				label: '%ATTACK SLOW:',
				ignoretooltip: true,
				controltype: 'text',
				fn: function(v,a) {
					return a;
				},
				returnproperty: 'attackspeedreduction'
			}
		],
		'jakiro_liquid_fire': [
			{
				label: 'Duration',
				controltype: 'input'
			},
			{
				attributename: 'damage',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				}
			},
			{
				attributename: 'slow_attack_speed_pct',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return a;
				},
				returnproperty: 'attackspeedreduction'
			}
		],
		'jakiro_macropyre': [
			{
				label: 'Duration',
				controltype: 'input'
			},
			{
				attributename: 'damage',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				}
			}
		],
		'juggernaut_blade_fury': [
			{
				label: 'Duration',
				controltype: 'input'
			},
			{
				label: 'DAMAGE:',
				controltype: 'text',
				fn: function(v,a,parent,index) {
					return parent.ability().getAbilityPropertyValue(parent.ability().abilities()[index], 'damage')*v;
				}
			}
		],
		'juggernaut_healing_ward': [
			{
				label: 'Duration',
				controltype: 'input'
			},
			{
				label: 'Max Health',
				controltype: 'input'
			},
			{
				attributename: 'healing_ward_heal_amount',
				label: 'HEAL OVER TIME:',
				ignoretooltip: true,
				controltype: 'text',
				controls: [0,1],
				fn: function(v,a,parent,index) {
					return v[0]*v[1]*a/100;
				}
			}
		],
		'juggernaut_omni_slash': [
			{
				label: 'Jumps',
				controltype: 'input'
			},
			{
				label: 'MIN DAMAGE:',
				ignoretooltip: true,
				controltype: 'text',
				fn: function(v,a,parent,index) {
					return parent.ability().getAbilityAttributeValue(parent.ability().abilities()[index].attributes(), 'omni_slash_damage',1)*v;
				}
			},
			{
				label: 'MAX DAMAGE:',
				ignoretooltip: true,
				controltype: 'text',
				fn: function(v,a,parent,index) {
					return parent.ability().getAbilityAttributeValue(parent.ability().abilities()[index].attributes(), 'omni_slash_damage',2)*v;
				}
			}
		],
		'keeper_of_the_light_illuminate': [
			{
				label: 'Duration',
				controltype: 'input'
			},
			{
				attributename: 'damage_per_second',
				label: 'DAMAGE:',
				ignoretooltip: true,
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				}
			}
		],
		'keeper_of_the_light_mana_leak': [
			{
				label: 'Distance Moved',
				controltype: 'input'
			},
			{
				label: 'Enemy Max Mana',
				controltype: 'input'
			},
			{
				attributename: 'mana_leak_pct',
				label: 'MANA LEAKED:',
				ignoretooltip: true,
				controltype: 'text',
				controls: [0,1],
				fn: function(v,a,parent,index) {
					return v[0]/100*v[1]*a/100;
				}
			}
		],
		'leshrac_pulse_nova': [
			{
				label: 'Duration',
				controltype: 'input'
			},
			{
				attributename: 'damage',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				}
			},
			{
				attributename: 'mana_cost_per_second',
				label: 'MANA COST:',
				ignoretooltip: true,
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				}
			}
		],
		'lich_chain_frost': [
			{
				label: 'Bounce Hits',
				controltype: 'input'
			},
			{
				attributename: 'damage',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				}
			},
			{
				attributename: 'slow_movement_speed',
				label: 'Enemy Movement Speed Slow',
				controltype: 'text',
				fn: function(v,a) {
					return a;
				},
				returnproperty: 'movementspeedpctreduction'
			},
			{
				attributename: 'slow_attack_speed',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return a;
				},
				returnproperty: 'attackspeedreduction'
			}
		],
		'life_stealer_feast': [
			{
				label: 'Enemy Current HP',
				controltype: 'input'
			},
			{
				attributename: 'hp_leech_percent',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return v*a/100;
				},
				returnproperty: 'bonusdamage'
			}
		],
		'life_stealer_open_wounds': [
			{
				label: 'Duration',
				controltype: 'input'
			},
			{
				attributename: 'heal_percent',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return a;
				},
				returnproperty: 'lifesteal'
			},
			{
				attributename: 'slow_steps',
				label: '%SLOW:',
				ignoretooltip: true,
				controltype: 'text',
				nolevel: true,
				fn: function(v,a,parent,index,abilitylist) {
					return abilitylist.getAbilityAttributeValue(abilitylist.abilities()[index].attributes(), 'slow_steps',v+1);
				},
				returnproperty: 'movementspeedpctreduction'
			}
		],
		'lina_fiery_soul': [
			{
				label: 'Duration',
				controltype: 'input'
			},
			{
				attributename: 'fiery_soul_move_speed_bonus',
				label: 'Enemy Movement Speed Slow',
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				},
				returnproperty: 'movementspeedpct'
			},
			{
				attributename: 'fiery_soul_attack_speed_bonus',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				},
				returnproperty: 'attackspeed'
			}
		],
		'lion_mana_drain': [
			{
				label: 'Duration',
				controltype: 'input'
			},
			{
				attributename: 'mana_per_second',
				label: 'MANA DRAINED:',
				ignoretooltip: true,
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				}
			}
		],
		'luna_moon_glaive': [
			{
				label: 'Bounces',
				controltype: 'input'
			},
			{
				label: 'Damage',
				controltype: 'input'
			},
			{
				attributename: 'damage_reduction_percent',
				label: 'BOUNCE DAMAGE:',
				ignoretooltip: true,
				controltype: 'text',
				controls: [0,1],
				fn: function(v,a,parent,index) {
					return v[1]*Math.pow(a/100,v[0]);
				}
			}
		],
		'luna_eclipse': [
			{
				label: 'Duration',
				controltype: 'input'
			},
			{
				attributename: 'damage',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				}
			}
		],
		'medusa_mystic_snake': [
			{
				label: 'Duration',
				controltype: 'input'
			},
			{
				attributename: 'damage',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				}
			}
		],
		'meepo_poof': [
			{
				label: 'Meepo Count',
				controltype: 'input'
			},
			{
				label: 'DAMAGE:',
				controltype: 'text',
				fn: function(v,a,parent,index) {
					return parent.ability().getAbilityPropertyValue(parent.ability().abilities()[index], 'damage')*v;
				}
			}
		],
		'meepo_geostrike': [
			{
				label: 'Stacks',
				controltype: 'input'
			},
			{
				label: 'DAMAGE:',
				controltype: 'text',
				fn: function(v,a,parent,index,abilitylist) {
					return abilitylist.getAbilityPropertyValue(abilitylist.abilities()[index], 'damage')*v;
				}
			},
			{
				attributename: 'slow',
				label: '%SLOW:',
				ignoretooltip: true,
				controltype: 'text',
				nolevel: true,
				fn: function(v,a,parent,index,abilitylist) {
					return abilitylist.getAbilityAttributeValue(abilitylist.abilities()[index].attributes(), 'slow',abilitylist.abilities()[index].level())*v;
				},
				returnproperty: 'movementspeedpctreduction'
			}
		],
		'mirana_arrow': [
			{
				label: 'Duration',
				controltype: 'input'
			},
			{
				attributename: 'damage',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				}
			}
		],
		'morphling_morph_agi': [
			{
				label: 'Shifts',
				controltype: 'input'
			},
			{
				attributename: 'points_per_tick',
				label: 'AGI SHIFT GAIN:',
				ignoretooltip: true,
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				},
				returnproperty: 'bonusagility'
			},
			{
				attributename: 'points_per_tick',
				label: 'STR SHIFT LOSS:',
				ignoretooltip: true,
				controltype: 'text',
				fn: function(v,a) {
					return -v*a;
				},
				returnproperty: 'bonusstrength'
			},
			{
				attributename: 'bonus_attributes',
				label: 'SHIFT TIME:',
				controltype: 'text',
				fn: function(v,a) {
					return a;
				},
				returnproperty: 'bonusagility2'
			},
			{
				attributename: 'morph_cooldown',
				label: 'SHIFT TIME:',
				ignoretooltip: true,
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				}
			},
			{
				attributename: 'mana_cost',
				label: 'SHIFT MANA COST:',
				ignoretooltip: true,
				controltype: 'text',
				fn: function(v,a,parent,index) {
					return v*a*parent.ability().getAbilityAttributeValue(parent.ability().abilities()[index].attributes(), 'morph_cooldown',parent.ability().abilities()[index].level());
				}
			}
		],
		'morphling_morph_str': [
			{
				label: 'Shifts',
				controltype: 'input'
			},
			{
				attributename: 'points_per_tick',
				label: 'STR SHIFT GAIN:',
				ignoretooltip: true,
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				},
				returnproperty: 'bonusstrength'
			},
			{
				attributename: 'points_per_tick',
				label: 'AGI SHIFT LOSS:',
				ignoretooltip: true,
				controltype: 'text',
				fn: function(v,a) {
					return -v*a;
				},
				returnproperty: 'bonusagility'
			},
			{
				attributename: 'bonus_attributes',
				label: 'SHIFT TIME:',
				controltype: 'text',
				fn: function(v,a) {
					return a;
				},
				returnproperty: 'bonusstrength2'
			},
			{
				attributename: 'morph_cooldown',
				label: 'SHIFT TIME:',
				ignoretooltip: true,
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				}
			},
			{
				attributename: 'mana_cost',
				label: 'SHIFT MANA COST:',
				ignoretooltip: true,
				controltype: 'text',
				fn: function(v,a,parent,index) {
					return v*a*parent.ability().getAbilityAttributeValue(parent.ability().abilities()[index].attributes(), 'morph_cooldown',parent.ability().abilities()[index].level());
				}
			}
		],
		'furion_force_of_nature': [
			{
				label: 'Duration',
				controltype: 'input'
			},
			{
				attributename: 'damage',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				}
			}
		],
		'furion_wrath_of_nature': [
			{
				label: 'Duration',
				controltype: 'input'
			},
			{
				attributename: 'damage',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				}
			}
		],
		'necrolyte_heartstopper_aura': [
			{
				label: 'Duration',
				controltype: 'input'
			},
			{
				attributename: 'damage',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				}
			}
		],
		'necrolyte_sadist': [
			{
				label: 'Duration',
				controltype: 'input'
			},
			{
				attributename: 'damage',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				}
			}
		],
		'night_stalker_crippling_fear': [
			{
				label: 'Is Night',
				controltype: 'checkbox'
			},
			{
				attributename: 'bonus_attack_speed_night',
				label: '%CHANCE TO MISS:',
				ignoretooltip: true,
				controltype: 'text',
				fn: function(v,a,parent,index,abilitylist) {
					if (v) {
						return abilitylist.getAbilityAttributeValue(abilitylist.abilities()[index].attributes(), 'miss_rate_night',abilitylist.abilities()[index].level());
					}
					else {
						return abilitylist.getAbilityAttributeValue(abilitylist.abilities()[index].attributes(), 'miss_rate_day',abilitylist.abilities()[index].level());
					}
				},
				returnproperty: 'misschance'
			}
		],	
		'night_stalker_hunter_in_the_night': [
			{
				label: 'Is Night',
				controltype: 'checkbox'
			},
			{
				attributename: 'bonus_attack_speed_night',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					if (v) {
						return a;
					}
					else {
						return 0;
					}
				},
				returnproperty: 'attackspeed'
			},
			{
				attributename: 'bonus_movement_speed_pct_night',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					if (v) {
						return a;
					}
					else {
						return 0;
					}
				},
				returnproperty: 'movementspeedpct'
			}
		],	
		'obsidian_destroyer_arcane_orb': [
			{
				label: 'Current Mana',
				controltype: 'input'
			},
			{
				attributename: 'mana_pool_damage_pct',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return v*a/100;
				},
				returnproperty: 'bonusdamageorb'
			}
		],
		'ogre_magi_ignite': [
			{
				label: 'Duration',
				controltype: 'input'
			},
			{
				attributename: 'burn_damage',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				}
			},
			{
				attributename: 'slow_movement_speed_pct',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return a;
				},
				returnproperty: 'movementspeedpctreduction'
			}
		],
		'pudge_rot': [
			{
				label: 'Duration',
				controltype: 'input'
			},
			{
				label: 'DAMAGE:',
				controltype: 'text',
				fn: function(v,a,parent,index,abilitylist) {
					return abilitylist.getAbilityPropertyValue(abilitylist.abilities()[index], 'damage')*v;
				}
			},
			{
				attributename: 'rot_slow',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return a;
				},
				returnproperty: 'movementspeedpctreduction'
			}
		],
		'pudge_flesh_heap': [
			{
				label: 'Stacks',
				controltype: 'input'
			},
			{
				attributename: 'flesh_heap_strength_buff_amount',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				},
				returnproperty: 'bonusstrength'
			},
			{
				attributename: 'flesh_heap_magic_resist',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return a;
				},
				returnproperty: 'magicresist'
			}
		],
		'pudge_dismember': [
			{
				label: 'Duration',
				controltype: 'input'
			},
			{
				attributename: 'dismember_damage',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				}
			}
		],
		'pugna_nether_ward': [
			{
				label: 'Enemy Mana Spent',
				controltype: 'input'
			},
			{
				attributename: 'mana_multiplier',
				label: 'DAMAGE:',
				ignoretooltip: true,
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				}
			},
			{
				attributename: 'mana_regen',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return a;
				},
				returnproperty: 'manaregenreduction'
			}
		],
		'pugna_life_drain': [
			{
				label: 'Duration',
				controltype: 'input'
			},
			{
				attributename: 'health_drain',
				label: 'HEALTH DRAINED:',
				ignoretooltip: true,
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				}
			}
		],
		'queenofpain_shadow_strike': [
			{
				label: 'Duration',
				controltype: 'input'
			},
			{
				attributename: 'damage',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				}
			}
		],
		'razor_plasma_field': [
			{
				label: 'Duration',
				controltype: 'input'
			},
			{
				attributename: 'damage',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				}
			}
		],
		'razor_static_link': [
			{
				label: 'Duration',
				controltype: 'input'
			},
			{
				attributename: 'damage',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				}
			}
		],
		'razor_eye_of_the_storm': [
			{
				label: 'Duration',
				controltype: 'input'
			},
			{
				attributename: 'damage',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				}
			}
		],
		'rubick_fade_bolt': [
			{
				label: 'Jumps',
				controltype: 'input'
			},
			{
				attributename: 'damage',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a,parent,index,abilitylist) {
					return a * (1 - v*abilitylist.getAbilityAttributeValue(abilitylist.abilities()[index].attributes(), 'jump_damage_reduction_pct',abilitylist.abilities()[index].level())/100);
				}
			},
			{
				attributename: 'hero_attack_damage_reduction',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return a;
				},
				returnproperty: 'bonusdamagereduction'
			}
		],
		'sandking_sand_storm': [
			{
				label: 'Duration',
				controltype: 'input'
			},
			{
				label: 'DAMAGE:',
				controltype: 'text',
				fn: function(v,a,parent,index) {
					return parent.ability().getAbilityPropertyValue(parent.ability().abilities()[index], 'damage')*v;
				}
			}
		],
		'sandking_epicenter': [
			{
				label: 'Pulses',
				controltype: 'input'
			},
			{
				attributename: 'epicenter_damage',
				label: 'DAMAGE:',
				ignoretooltip: true,
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				}
			},
			{
				attributename: 'epicenter_slow',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return a;
				},
				returnproperty: 'movementspeedpctreduction'
			},
			{
				attributename: 'epicenter_slow_as',
				label: '%ATTACK SLOW:',
				ignoretooltip: true,
				controltype: 'text',
				fn: function(v,a) {
					return a;
				},
				returnproperty: 'attackspeedreduction'
			}
		],
		'shadow_demon_shadow_poison': [
			{
				label: 'Duration',
				controltype: 'input'
			},
			{
				attributename: 'stack_damage',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					var stackmult = [1,2,4,8];
					if (v > 4) {
						return a * stackmult[3] + 50 * (v - 4);
					}
					else if (v <= 0) {
						return 0
					}
					else {
						return a * stackmult[v-1]
					}
				}
			}
		],
		'nevermore_necromastery': [
			{
				label: 'Souls',
				controltype: 'input'
			},
			{
				attributename: 'necromastery_damage_per_soul',
				label: 'DAMAGE:',
				ignoretooltip: true,
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				},
				returnproperty: 'bonusdamage'
			}
		],
		'nevermore_requiem': [
			{
				label: 'Duration',
				controltype: 'input'
			},
			{
				attributename: 'damage',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				}
			}
		],
		'shadow_shaman_shackles': [
			{
				label: 'Duration',
				controltype: 'input'
			},
			{
				label: 'DAMAGE:',
				controltype: 'text',
				fn: function(v,a,parent,index) {
					return parent.ability().getAbilityPropertyValue(parent.ability().abilities()[index], 'damage')*v;
				}
			}
		],
		'silencer_curse_of_the_silent': [
			{
				label: 'Duration',
				controltype: 'input'
			},
			{
				attributename: 'damage',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				}
			}
		],
		'silencer_glaives_of_wisdom': [
			{
				label: 'Duration',
				controltype: 'input'
			},
			{
				attributename: 'damage',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				}
			}
		],
		'skywrath_mage_mystic_flare': [
			{
				label: 'Duration',
				controltype: 'input'
			},
			{
				attributename: 'damage',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				}
			}
		],
		'slark_essence_shift': [
			{
				label: 'Attacks',
				controltype: 'input'
			},
			{
				attributename: 'agi_gain',
				label: 'Total Damage',
				controltype: 'text',
				display: 'ability',
				fn: function(v,a) {
					return v*a;
				},
				returnproperty: 'bonusagility'
			},
			{
				attributename: 'stat_loss',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return -v*a;
				},
				returnproperty: 'bonusallstatsreduction'
			}
		],
		'sniper_shrapnel': [
			{
				label: 'Duration',
				controltype: 'input'
			},
			{
				label: 'DAMAGE:',
				ignoretooltip: true,
				controltype: 'text',
				fn: function(v,a,parent,index) {
					return parent.ability().getAbilityPropertyValue(parent.ability().abilities()[index], 'damage')*v;
				}
			},
			{
				attributename: 'building_damage',
				label: 'BUILDING DAMAGE:',
				ignoretooltip: true,
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				}
			},
			{
				attributename: 'slow_movement_speed',
				label: 'Enemy Movement Speed Slow',
				controltype: 'text',
				fn: function(v,a) {
					return a;
				},
				returnproperty: 'movementspeedpctreduction'
			}
		],
		'spectre_dispersion': [
			{
				label: 'Damage Taken',
				controltype: 'input'
			},
			{
				attributename: 'damage_reflection_pct',
				label: 'DAMAGE REFLECTED:',
				ignoretooltip: true,
				controltype: 'text',
				fn: function(v,a) {
					return v*a/100;
				}
			}
		],
		'storm_spirit_ball_lightning': [
			{
				label: 'Duration',
				controltype: 'input'
			},
			{
				attributename: 'damage',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				}
			}
		],
		'templar_assassin_trap': [
			{
				label: 'Duration',
				controltype: 'input'
			},
			{
				attributename: 'damage',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				}
			}
		],
		'shredder_reactive_armor': [
			{
				label: 'Stacks',
				controltype: 'input'
			},
			{
				attributename: 'bonus_armor',
				label: 'Total Armor Bonus',
				controltype: 'text',
				nolevel: true,
				fn: function(v,a) {
					return v*a;
				},
				returnproperty: 'armor'
			},
			{
				attributename: 'bonus_hp_regen',
				label: 'Total HP Regen Bonus',
				controltype: 'text',
				nolevel: true,
				fn: function(v,a) {
					return v*a;
				},
				returnproperty: 'healthregen'
			}
		],
		'shredder_chakram': [
			{
				label: 'Duration',
				controltype: 'input'
			},
			{
				attributename: 'damage',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				}
			}
		],
		'spirit_breaker_greater_bash': [
			{
				label: 'Bash Proc',
				controltype: 'checkbox'
			},
			{
				attributename: 'damage',
				label: '%MOVESPEED AS DAMAGE',
				controltype: 'text',
				fn: function(v,a) {
					if (v) {
						return a;
					}
					else {
						return 0;
					}
				},
				returnproperty: 'bashbonusdamage'
			},
			{
				attributename: 'bonus_movespeed_pct',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					if (v) {
						return a;
					}
					else {
						return 0;
					}
				},
				returnproperty: 'movementspeedpct'
			},
			{
				attributename: 'chance_pct',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return a
				},
				returnproperty: 'bash'
			}
		],
		'tinker_march_of_the_machines': [
			{
				label: 'Duration',
				controltype: 'input'
			},
			{
				attributename: 'damage',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				}
			}
		],
		'treant_leech_seed': [
			{
				label: 'Pulses',
				controltype: 'input'
			},
			{
				attributename: 'leech_damage',
				label: 'DAMAGE/HEAL:',
				ignoretooltip: true,
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				}
			},
			{
				attributename: 'movement_slow',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return a;
				},
				returnproperty: 'movementspeedpctreduction'
			}
		],
		'troll_warlord_fervor': [
			{
				label: 'Stacks',
				controltype: 'input'
			},
			{
				attributename: 'attack_speed',
				label: 'ATTACK SPEED:',
				ignoretooltip: true,
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				},
				returnproperty: 'attackspeed'
			}
		],
		'undying_decay': [
			{
				label: 'Duration',
				controltype: 'input'
			},
			{
				attributename: 'damage',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				}
			}
		],
		'undying_soul_rip': [
			{
				label: 'Units',
				controltype: 'input'
			},
			{
				attributename: 'damage_per_unit',
				label: 'DAMAGE/HEAL:',
				ignoretooltip: true,
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				}
			}
		],
		'ursa_fury_swipes': [
			{
				label: 'Stacks',
				controltype: 'input'
			},
			{
				attributename: 'damage_per_stack',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				},
				returnproperty: 'bonusdamage'
			}
		],
		'ursa_enrage': [
			{
				label: 'Current HP',
				controltype: 'input'
			},
			{
				attributename: 'life_damage_bonus_percent',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return v*a/100;
				},
				returnproperty: 'bonusdamage'
			}
		],
		'venomancer_venomous_gale': [
			{
				label: 'Duration',
				controltype: 'input'
			},
			{
				attributename: 'tick_damage',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a,parent,index) {
					return parent.ability().getAbilityAttributeValue(parent.ability().abilities()[index].attributes(), 'strike_damage',parent.ability().abilities()[index].level()) + Math.floor(v/3)*a;
				}
			},
			{
				attributename: 'movement_slow',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return a;
				},
				returnproperty: 'movementspeedpctreduction'
			}
		],
		'venomancer_poison_sting': [
			{
				label: 'Duration',
				controltype: 'input'
			},
			{
				attributename: 'damage',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				}
			},
			{
				attributename: 'movement_speed',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return a;
				},
				returnproperty: 'movementspeedpctreduction'
			}
		],
		'venomancer_plague_ward': [
			{
				label: 'Duration',
				controltype: 'input'
			},
			{
				attributename: 'damage',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				}
			}
		],
		'venomancer_poison_nova': [
			{
				label: 'Duration',
				controltype: 'input'
			},
			{
				attributename: 'damage',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				}
			}
		],
		'viper_poison_attack': [
			{
				label: 'Duration',
				controltype: 'input'
			},
			{
				attributename: 'damage',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				}
			},
			{
				attributename: 'bonus_movement_speed',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return a;
				},
				returnproperty: 'movementspeedpctreduction'
			},
			{
				attributename: 'bonus_attack_speed',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return a;
				},
				returnproperty: 'attackspeedreduction'
			}
		],
		'viper_corrosive_skin': [
			{
				label: 'Duration',
				controltype: 'input'
			},
			{
				attributename: 'damage',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				}
			},
			{
				attributename: 'bonus_movement_speed',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return a;
				},
				returnproperty: 'movementspeedpctreduction'
			},
			{
				attributename: 'bonus_attack_speed',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return a;
				},
				returnproperty: 'attackspeedreduction'
			},
			{
				attributename: 'bonus_magic_resistance',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return a;
				},
				returnproperty: 'magicresist'
			}
		],
		'viper_viper_strike': [
			{
				label: 'Duration',
				controltype: 'input'
			},
			{
				attributename: 'damage',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				}
			},
			{
				attributename: 'bonus_movement_speed',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return a;
				},
				returnproperty: 'movementspeedpctreduction'
			},
			{
				attributename: 'bonus_attack_speed',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return a;
				},
				returnproperty: 'attackspeedreduction'
			}
		],
		'visage_soul_assumption': [
			{
				label: 'Duration',
				controltype: 'input'
			},
			{
				attributename: 'damage',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				}
			}
		],
		'visage_gravekeepers_cloak': [
			{
				label: 'Layers',
				controltype: 'input'
			},
			{
				attributename: 'bonus_armor',
				label: 'ARMOR:',
				ignoretooltip: true,
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				},
				returnproperty: 'armor'
			},
			{
				attributename: 'bonus_resist',
				label: '%RESIST:',
				ignoretooltip: true,
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				},
				returnproperty: 'magicresist'
			}
		],
		'warlock_shadow_word': [
			{
				label: 'Duration',
				controltype: 'input'
			},
			{
				label: 'DAMAGE:',
				ignoretooltip: true,
				controltype: 'text',
				fn: function(v,a,parent,index) {
					return parent.ability().getAbilityPropertyValue(parent.ability().abilities()[index], 'damage')*v;
				}
			}
		],
		'warlock_upheaval': [
			{
				label: 'Duration',
				controltype: 'input'
			},
			{
				attributename: 'slow_rate',
				label: 'DAMAGE:',
				controltype: 'text',
				fn: function(v,a) {
					return -v*a;
				},
				returnproperty: 'movementspeedpctreduction'
			}
		],
		'weaver_the_swarm': [
			{
				label: 'Attacks',
				controltype: 'input'
			},
			{
				attributename: 'damage',
				label: 'DAMAGE:',
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				}
			},
			{
				attributename: 'armor_reduction',
				label: 'DAMAGE:',
				controltype: 'text',
				fn: function(v,a) {
					return -v*a;
				},
				returnproperty: 'armorreduction'
			}
		],
		'windrunner_powershot': [
			{
				label: 'Duration',
				controltype: 'input'
			},
			{
				label: 'DAMAGE:',
				ignoretooltip: true,
				controltype: 'text',
				fn: function(v,a,parent,index) {
					return parent.ability().getAbilityPropertyValue(parent.ability().abilities()[index], 'damage')*v;
				}
			}
		],
		'wisp_spirits': [
			{
				label: 'Duration',
				controltype: 'input'
			},
			{
				attributename: 'damage',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				}
			}
		],
		'wisp_overcharge': [
			{
				label: 'Current HP',
				controltype: 'input'
			},
			{
				attributename: 'drain_pct',
				label: '%HP DRAIN:',
				ignoretooltip: true, 
				controltype: 'text',
				fn: function(v,a,parent,index) {
					return v*a;
				},
			},
			{
				label: 'Current MP',
				controltype: 'input'
			},
			{
				attributename: 'drain_pct',
				label: '%MP DRAIN:',
				ignoretooltip: true, 
				controltype: 'text',
				fn: function(v,a,parent,index) {
					return v*a;
				},
			},
			{
				attributename: 'bonus_attack_speed',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return a;
				},
				returnproperty: 'attackspeed'
			}
		],
		'witch_doctor_paralyzing_cask': [
			{
				label: 'Duration',
				controltype: 'input'
			},
			{
				attributename: 'damage',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				}
			}
		],
		'witch_doctor_voodoo_restoration': [
			{
				label: 'Duration',
				controltype: 'input'
			},
			{
				attributename: 'damage',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				}
			}
		],
		'witch_doctor_maledict': [
			{
				label: 'Duration',
				controltype: 'input'
			},
			{
				attributename: 'damage',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				}
			}
		],
		'witch_doctor_death_ward': [
			{
				label: 'Duration',
				controltype: 'input'
			},
			{
				attributename: 'damage',
				label: 'Total Damage',
				controltype: 'text',
				fn: function(v,a) {
					return v*a;
				}
			}
		],
		'zuus_static_field': [
			{
				label: 'Enemy HP',
				controltype: 'input'
			},
			{
				attributename: 'damage_health_pct',
				label: 'DAMAGE:',
				ignoretooltip: true,
				controltype: 'text',
				fn: function(v,a) {
					return v*a/100;
				}
			}
		]
	}

	return my;
}(HEROCALCULATOR));