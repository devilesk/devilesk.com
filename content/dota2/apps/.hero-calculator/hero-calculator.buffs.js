var HEROCALCULATOR = (function (my) {

	my.BuffOption = function (hero, ability) {
		this.buffName = ability;
		if (my.heroData['npc_dota_hero_' + hero] == undefined) {
			this.hero = hero;
			this.abilityData = _.findWhere(my.unitData[hero].abilities, {name: ability})
			this.buffDisplayName = my.unitData[hero].displayname + ' - ' + this.abilityData.displayname;		
		}
		else {
			this.hero = 'npc_dota_hero_' + hero;
			this.abilityData = _.findWhere(my.heroData['npc_dota_hero_' + hero].abilities, {name: ability})
			this.buffDisplayName = my.heroData['npc_dota_hero_' + hero].displayname + ' - ' + this.abilityData.displayname;		
		}

	};
	
	my.BuffViewModel = function (a) {
		var self = new my.AbilityModel(ko.observableArray([]));
		self.availableBuffs = ko.observableArray([
			new my.BuffOption('abaddon','abaddon_frostmourne'),
			new my.BuffOption('axe','axe_culling_blade'),
			new my.BuffOption('beastmaster','beastmaster_inner_beast'),
			new my.BuffOption('bloodseeker','bloodseeker_bloodrage'),
			new my.BuffOption('bounty_hunter','bounty_hunter_track'),
			new my.BuffOption('centaur','centaur_stampede'),
			new my.BuffOption('crystal_maiden','crystal_maiden_brilliance_aura'),
			new my.BuffOption('dark_seer','dark_seer_surge'),
			new my.BuffOption('dazzle','dazzle_weave'),
			new my.BuffOption('drow_ranger','drow_ranger_trueshot'),
			new my.BuffOption('invoker','invoker_alacrity'),
			new my.BuffOption('wisp','wisp_tether'),
			new my.BuffOption('wisp','wisp_overcharge'),
			new my.BuffOption('kunkka','kunkka_ghostship'),
			new my.BuffOption('lich','lich_frost_armor'),
			new my.BuffOption('life_stealer','life_stealer_open_wounds'),
			new my.BuffOption('luna','luna_lunar_blessing'),
			new my.BuffOption('lycan','lycan_howl'),
			new my.BuffOption('magnataur','magnataur_empower'),
			new my.BuffOption('mirana','mirana_leap'),
			new my.BuffOption('ogre_magi','ogre_magi_bloodlust'),
			new my.BuffOption('omniknight','omniknight_guardian_angel'),
			new my.BuffOption('rubick','rubick_null_field'),
			new my.BuffOption('skeleton_king','skeleton_king_vampiric_aura'),
			new my.BuffOption('spirit_breaker','spirit_breaker_empowering_haste'),
			new my.BuffOption('sven','sven_warcry'),
			new my.BuffOption('treant','treant_living_armor'),
			new my.BuffOption('vengefulspirit','vengefulspirit_command_aura'),
			new my.BuffOption('npc_dota_neutral_alpha_wolf','alpha_wolf_critical_strike'),
			new my.BuffOption('npc_dota_neutral_alpha_wolf','alpha_wolf_command_aura'),
			new my.BuffOption('npc_dota_neutral_centaur_khan','centaur_khan_endurance_aura'),
			new my.BuffOption('npc_dota_neutral_giant_wolf','giant_wolf_critical_strike'),
			new my.BuffOption('npc_dota_neutral_kobold_taskmaster','kobold_taskmaster_speed_aura'),
			new my.BuffOption('npc_dota_neutral_ogre_magi','ogre_magi_frost_armor'),
			new my.BuffOption('npc_dota_neutral_satyr_hellcaller','satyr_hellcaller_unholy_aura'),
			new my.BuffOption('npc_dota_neutral_enraged_wildkin','enraged_wildkin_toughness_aura'),
			new my.BuffOption('npc_dota_necronomicon_archer_1','necronomicon_archer_aoe')
		]);
		self.availableDebuffs = ko.observableArray([
			new my.BuffOption('alchemist','alchemist_acid_spray'),
			new my.BuffOption('ancient_apparition','ancient_apparition_ice_vortex'),
			new my.BuffOption('axe','axe_battle_hunger'),
			new my.BuffOption('bane','bane_enfeeble'),
			new my.BuffOption('batrider','batrider_sticky_napalm'),
			new my.BuffOption('beastmaster','beastmaster_primal_roar'),
			new my.BuffOption('bounty_hunter','bounty_hunter_jinada'),
			new my.BuffOption('brewmaster','brewmaster_thunder_clap'),
			new my.BuffOption('brewmaster','brewmaster_drunken_haze'),
			new my.BuffOption('bristleback','bristleback_viscous_nasal_goo'),
			new my.BuffOption('broodmother','broodmother_incapacitating_bite'),
			new my.BuffOption('centaur','centaur_stampede'),
			new my.BuffOption('chen','chen_penitence'),
			new my.BuffOption('crystal_maiden','crystal_maiden_crystal_nova'),
			new my.BuffOption('crystal_maiden','crystal_maiden_freezing_field'),
			new my.BuffOption('dazzle','dazzle_weave'),
			new my.BuffOption('drow_ranger','drow_ranger_frost_arrows'),
			new my.BuffOption('earth_spirit','earth_spirit_rolling_boulder'),
			new my.BuffOption('elder_titan','elder_titan_natural_order'),
			new my.BuffOption('elder_titan','elder_titan_earth_splitter'),
			new my.BuffOption('enchantress','enchantress_untouchable'),
			new my.BuffOption('enchantress','enchantress_enchant'),
			new my.BuffOption('faceless_void','faceless_void_time_walk'),
			new my.BuffOption('huskar','huskar_life_break'),
			new my.BuffOption('invoker','invoker_ghost_walk'),
			new my.BuffOption('invoker','invoker_ice_wall'),
			new my.BuffOption('wisp','wisp_tether'),
			new my.BuffOption('jakiro','jakiro_dual_breath'),
			new my.BuffOption('jakiro','jakiro_liquid_fire'),
			new my.BuffOption('keeper_of_the_light','keeper_of_the_light_blinding_light'),
			new my.BuffOption('kunkka','kunkka_torrent'),
			new my.BuffOption('lich','lich_frost_nova'),
			new my.BuffOption('lich','lich_frost_armor'),
			new my.BuffOption('lich','lich_chain_frost'),
			new my.BuffOption('life_stealer','life_stealer_open_wounds'),
			new my.BuffOption('lion','lion_voodoo'),
			new my.BuffOption('magnataur','magnataur_skewer'),
			new my.BuffOption('medusa','medusa_stone_gaze'),
			new my.BuffOption('meepo','meepo_geostrike'),
			new my.BuffOption('naga_siren','naga_siren_rip_tide'),
			new my.BuffOption('night_stalker','night_stalker_void'),
			new my.BuffOption('night_stalker','night_stalker_crippling_fear'),
			new my.BuffOption('night_stalker','night_stalker_darkness'),
			new my.BuffOption('ogre_magi','ogre_magi_ignite'),
			new my.BuffOption('omniknight','omniknight_degen_aura'),
			new my.BuffOption('phantom_assassin','phantom_assassin_stifling_dagger'),
			new my.BuffOption('phantom_lancer','phantom_lancer_spirit_lance'),
			new my.BuffOption('pudge','pudge_rot'),
			new my.BuffOption('pugna','pugna_decrepify'),
			new my.BuffOption('queenofpain','queenofpain_shadow_strike'),
			new my.BuffOption('riki','riki_smoke_screen'),
			new my.BuffOption('rubick','rubick_fade_bolt'),
			new my.BuffOption('sand_king','sandking_epicenter'),
			new my.BuffOption('nevermore','nevermore_dark_lord'),
			new my.BuffOption('shadow_shaman','shadow_shaman_voodoo'),
			new my.BuffOption('skeleton_king','skeleton_king_hellfire_blast'),
			new my.BuffOption('skeleton_king','skeleton_king_reincarnation'),
			new my.BuffOption('skywrath_mage','skywrath_mage_concussive_shot'),
			new my.BuffOption('slardar','slardar_slithereen_crush'),
			new my.BuffOption('slardar','slardar_amplify_damage'),
			new my.BuffOption('slark','slark_essence_shift'),
			new my.BuffOption('sniper','sniper_shrapnel'),
			new my.BuffOption('spectre','spectre_spectral_dagger'),
			new my.BuffOption('storm_spirit','storm_spirit_overload'),
			new my.BuffOption('templar_assassin','templar_assassin_meld'),
			new my.BuffOption('tidehunter','tidehunter_gush'),
			new my.BuffOption('tinker','tinker_laser'),
			new my.BuffOption('treant','treant_leech_seed'),
			new my.BuffOption('tusk','tusk_frozen_sigil'),
			new my.BuffOption('ursa','ursa_earthshock'),
			new my.BuffOption('vengefulspirit','vengefulspirit_wave_of_terror'),
			new my.BuffOption('venomancer','venomancer_venomous_gale'),
			new my.BuffOption('venomancer','venomancer_poison_sting'),
			new my.BuffOption('viper','viper_poison_attack'),
			new my.BuffOption('viper','viper_corrosive_skin'),
			new my.BuffOption('viper','viper_viper_strike'),
			new my.BuffOption('visage','visage_grave_chill'),
			new my.BuffOption('warlock','warlock_upheaval'),
			new my.BuffOption('weaver','weaver_the_swarm'),
			new my.BuffOption('windrunner','windrunner_windrun'),
			new my.BuffOption('npc_dota_neutral_ghost','ghost_frost_attack'),
			new my.BuffOption('npc_dota_neutral_polar_furbolg_ursa_warrior','polar_furbolg_ursa_warrior_thunder_clap'),
			new my.BuffOption('npc_dota_neutral_ogre_magi','ogre_magi_frost_armor'),
			new my.BuffOption('npc_dota_neutral_satyr_trickster','satyr_trickster_purge'),
			new my.BuffOption('npc_dota_neutral_enraged_wildkin','enraged_wildkin_tornado')
		]);
		self.selectedBuff = ko.observable(self.availableBuffs()[0]);
		
		self.buffs = ko.observableArray([]);
		
		self.addBuff = function(data, event) {
			if (_.findWhere(self.buffs(), { name: self.selectedBuff().buffName })  == undefined) {
				var a = ko.mapping.fromJS(self.selectedBuff().abilityData);
				a.isactive = ko.observable(false);
				a.isdetail = ko.observable(false);
				a.basedamage = ko.observable(0);
				a.bash = ko.observable(0);
				a.bashbonusdamage = ko.observable(0);
				a.bonusdamage = ko.observable(0);
				a.bonusdamageorb = ko.observable(0);
				a.bonusdamagepct = ko.observable(0);
				a.bonusdamageprecisionaura = ko.observable(0);
				a.bonusdamagereduction = ko.observable(0);
				a.bonushealth = ko.observable(0);
				a.bonusstrength = ko.observable(0);
				a.bonusstrength2 = ko.observable(0);
				a.bonusagility = ko.observable(0);
				a.bonusagility2 = ko.observable(0);
				a.bonusint = ko.observable(0);
				a.bonusallstatsreduction = ko.observable(0);
				a.evasion = ko.observable(0);
				a.magicresist = ko.observable(0);
				a.manaregen = ko.observable(0);
				a.manaregenreduction = ko.observable(0);
				a.misschance = ko.observable(0);
				a.movementspeedflat = ko.observable(0);
				a.movementspeedpct = ko.observable(0);
				a.movementspeedpctreduction = ko.observable(0);
				a.turnratereduction = ko.observable(0);
				a.attackrange = ko.observable(0);
				a.attackspeed = ko.observable(0);
				a.attackspeedreduction = ko.observable(0);
				a.armor = ko.observable(0);
				a.armorreduction = ko.observable(0);
				a.healthregen = ko.observable(0);
				a.lifesteal = ko.observable(0);
				a.visionnight = ko.observable(0);
				a.visionday = ko.observable(0);
				switch (a.name()) {
					case 'invoker_cold_snap':
					case 'invoker_ghost_walk':
					case 'invoker_tornado':
					case 'invoker_emp':
					case 'invoker_alacrity':
					case 'invoker_chaos_meteor':
					case 'invoker_sun_strike':
					case 'invoker_forge_spirit':
					case 'invoker_ice_wall':
					case 'invoker_deafening_blast':
						a.level(1);
					break;
				}
				self.abilities.push(a);
				self.buffs.push({ name: self.selectedBuff().buffName, hero: self.selectedBuff().hero, data: a });
			}
		};
		
		self.removeBuff = function(data, event, abilityname) {
			if (_.findWhere(self.buffs(), { name: abilityname })  != undefined) {
					self.buffs.remove(_.findWhere(self.buffs(), { name: abilityname }));
					if (self.abilityControlData[abilityname] != undefined) {
						for (var i=0;i<self.abilityControlData[abilityname].data.length;i++) {
							if (self.abilityControlData[abilityname].data[i].controlval.dispose != undefined) {
								self.abilityControlData[abilityname].data[i].controlval.dispose();
								self.abilityControlData[abilityname].data[i].clean.dispose();
							}
						}
						self.abilityControlData[abilityname] = undefined;
					}
					for (var i=0;i<self.abilities().length;i++) {
						if (self.abilities()[i].name() == abilityname) {
							self.abilities()[i].level(0);
							self.abilities.remove(self.abilities()[i]);
							break;
						}
					}
			}
		};
		self.toggleBuff = function (index, data, event) {
			if (self.buffs()[index()].data.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') < 0) {
				if (self.buffs()[index()].data.isactive()) {
					self.buffs()[index()].data.isactive(false);
					self.abilities()[index()].isactive(false);
				}
				else {
					self.buffs()[index()].data.isactive(true);
					self.abilities()[index()].isactive(true);
				}
			}
		}.bind(this);

		self.toggleBuffDetail = function (index, data, event) {
			if (self.buffs()[index()].data.isdetail()) {
				self.buffs()[index()].data.isdetail(false);
			}
			else {
				self.buffs()[index()].data.isdetail(true);
			}
		}.bind(this);

		// Overrides the ability module function to remove available skill point check
		self.levelUpAbility = function(index, data, event, hero) {
			if (self.abilities()[index()].level() < hero.getAbilityLevelMax(data)) {
				switch(self.abilities()[index()].abilitytype()) {
					case 'DOTA_ABILITY_TYPE_ULTIMATE':
						self.abilities()[index()].level(self.abilities()[index()].level()+1);
					break;
					default:
						self.abilities()[index()].level(self.abilities()[index()].level()+1);
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
				}
			}
		};
		
		return self;
	}

	return my;
}(HEROCALCULATOR));