var HEROCALCULATOR = (function (my) {

	my.HeroOption = function (name, displayname) {
		this.heroName = name;
		this.heroDisplayName = displayname;
	};
	
	function createHeroOptions() {
		var options = [];
		for (h in my.heroData) {
			options.push(new my.HeroOption(h.replace('npc_dota_hero_',''),my.heroData[h].displayname))
		}
		console.log(options);
		return options;
	};

	my.HeroCalculatorModel = function(h) {
		var self = this;
		self.availableHeroes = ko.observableArray(createHeroOptions());
		self.sectionDisplay = ko.observable({
			inventory: ko.observable(true),
			ability: ko.observable(true),
			buff: ko.observable(true),
			debuff: ko.observable(true),
			damageamp: ko.observable(false)
		});
		self.sectionDisplayToggle = function(section) {
			console.log(section);
			self.sectionDisplay()[section](!self.sectionDisplay()[section]());
		}
		self.availableHeroes.sort(function(left, right) {
			return left.heroDisplayName == right.heroDisplayName ? 0 : (left.heroDisplayName < right.heroDisplayName ? -1 : 1);
		});
		self.selectedHero = ko.observable(self.availableHeroes()[h]);
		self.selectedHeroLevel = ko.observable(1);
		self.inventory = new my.InventoryViewModel();
		self.buffs = new my.BuffViewModel();
		self.buffs.hasScepter = self.inventory.hasScepter;
		self.debuffs = new my.BuffViewModel();
		self.damageamplification = new my.DamageAmpViewModel();
		self.damagereduction = new my.DamageAmpViewModel();
		self.hero = ko.computed(function() {
			return ko.mapping.fromJS(my.heroData['npc_dota_hero_' + self.selectedHero().heroName]);
		});
		self.enemy = ko.observable(self);
		self.unit = ko.observable(self);

		self.getAbilityLevelMax = function(data) {
			if (data.abilitytype() == 'DOTA_ABILITY_TYPE_ATTRIBUTES') {
				return 10;
			}
			else if (data.name() == 'invoker_quas' || data.name() == 'invoker_wex' || data.name() == 'invoker_exort') {
				return 7;
			}
			else if (data.name() == 'invoker_invoke') {
				return 4;
			}
			else if (data.name() == 'earth_spirit_stone_caller') {
				return 1;
			}
			else if (data.abilitytype() == 'DOTA_ABILITY_TYPE_ULTIMATE' || data.name() == 'keeper_of_the_light_recall' || data.name() == 'keeper_of_the_light_blinding_light' || data.name() == 'ember_spirit_activate_fire_remnant') {
				return 3;
			}
			else if (data.name() == 'puck_ethereal_jaunt'  || data.name() == 'shadow_demon_shadow_poison_release' || data.name() == 'templar_assassin_trap' || data.name() == 'spectre_reality') {
				return 0;
			}
			else if (data.name() == 'invoker_cold_snap'  || data.name() == 'invoker_ghost_walk' || data.name() == 'invoker_tornado' || data.name() == 'invoker_emp' || data.name() == 'invoker_alacrity'
				|| data.name() == 'invoker_chaos_meteor' || data.name() == 'invoker_sun_strike' || data.name() == 'invoker_forge_spirit' || data.name() == 'invoker_ice_wall' || data.name() == 'invoker_deafening_blast') {
				return 0;
			}
			else {
				return 4;
			}
		};

		self.ability = ko.computed(function() {
			var a = new my.AbilityModel(ko.mapping.fromJS(my.heroData['npc_dota_hero_' + self.selectedHero().heroName].abilities));
			if (self.selectedHero().heroName == 'earth_spirit') {
				a.abilities()[3].level(1);
			}
			if (self.selectedHero().heroName == 'invoker') {
				for (var i=6;i<16;i++) {
					a.abilities()[i].level(1);
				}
			}
			a.hasScepter = self.inventory.hasScepter
			return a;
		});
		self.showCriticalStrikeDetails = ko.observable(false);
		self.toggleCriticalStrikeDetails = function() {
			self.showCriticalStrikeDetails(!self.showCriticalStrikeDetails());
		};
		self.damageInputValue = ko.observable(0);
		self.showDamageDetails = ko.observable(false);
		self.toggleDamageDetails = function() {
			self.showDamageDetails(!self.showDamageDetails());
		};
		self.showStatDetails = ko.observable(false);
		self.toggleStatDetails = function() {
			self.showStatDetails(!self.showStatDetails());
		};
		self.availableSkillPoints = ko.computed(function() {
			var c = self.selectedHeroLevel();
			for (var i=0;i < self.ability().abilities().length;i++) {
				switch(self.ability().abilities()[i].abilitytype()) {
					case 'DOTA_ABILITY_TYPE_ULTIMATE':
						if ((self.ability().abilities()[i].level()+1) * 5 + 1 > parseInt(self.selectedHeroLevel())) {
							self.ability().abilities()[i].level(Math.floor((parseInt(self.selectedHeroLevel()) - 1) / 5));
						}
					break;
					default:
						if (self.ability().abilities()[i].level() * 2 + 1 > parseInt(self.selectedHeroLevel())) {
								self.ability().abilities()[i].level(Math.floor((parseInt(self.selectedHeroLevel()) + 1) / 2));
						}
					break;
				}
				/*if (self.ability().abilities()[i].level() > (parseInt(self.selectedHeroLevel()) + 1) / 2 ) {
					self.ability().abilities()[i].level((parseInt(self.selectedHeroLevel()) + 1) / 2)
				}*/
				switch(self.ability().abilities()[i].name()) {
					case 'beastmaster_call_of_the_wild_boar':
					case 'chen_test_of_faith_teleport':
					case 'keeper_of_the_light_recall':
					case 'keeper_of_the_light_blinding_light':
					case 'morphling_morph_str':
					case 'shadow_demon_shadow_poison_release':
					case 'nevermore_shadowraze2':
					case 'nevermore_shadowraze3':
					case 'earth_spirit_stone_caller':
					case 'ember_spirit_activate_fire_remnant':
					case 'invoker_cold_snap' :
					case 'invoker_ghost_walk':
					case 'invoker_tornado':
					case 'invoker_emp':
					case 'invoker_alacrity':
					case 'invoker_chaos_meteor':
					case 'invoker_sun_strike':
					case 'invoker_forge_spirit':
					case 'invoker_ice_wall':
					case 'invoker_deafening_blast':
					break;
					default:
						c -= self.ability().abilities()[i].level();
					break;
				}
			}
			if (c < 0) {
				for (var i=0;i < self.ability().abilities().length;i++) {
					self.ability().abilities()[i].level(0);
				}
				c = self.selectedHeroLevel();
			}
			return c;
		}, this);
		self.primaryattribute = ko.computed(function() {
			var v = my.heroData['npc_dota_hero_' + self.selectedHero().heroName].attributeprimary;
			if (v == 'DOTA_ATTRIBUTE_AGILITY') {
				return 'agi'
			}
			else if (v == 'DOTA_ATTRIBUTE_INTELLECT') {
				return 'int'
			}
			else if (v == 'DOTA_ATTRIBUTE_STRENGTH') {
				return 'str'
			}
			else {
				return ''
			}
		});
		self.totalAttribute = function(a) {
			if (a == 'agi') {
				return parseFloat(self.totalagi());
			}
			if (a == 'int') {
				return parseFloat(self.totalint());
			}
			if (a == 'str') {
				return parseFloat(self.totalstr());
			}
		};
		self.totalagi = ko.computed(function() {
			return (my.heroData['npc_dota_hero_' + self.selectedHero().heroName].attributebaseagility
					+ my.heroData['npc_dota_hero_' + self.selectedHero().heroName].attributeagilitygain * (self.selectedHeroLevel() - 1) 
					+ self.inventory.getAttributes('agi') 
					+ self.ability().getAttributeBonusLevel()*2
					+ self.ability().getAgility()
					+ self.enemy().ability().getAllStatsReduction()
					+ self.debuffs.getAllStatsReduction()
				   ).toFixed(2);
		});
		self.totalint = ko.computed(function() {
			return (my.heroData['npc_dota_hero_' + self.selectedHero().heroName].attributebaseintelligence 
					+ my.heroData['npc_dota_hero_' + self.selectedHero().heroName].attributeintelligencegain * (self.selectedHeroLevel() - 1) 
					+ self.inventory.getAttributes('int') 
					+ self.ability().getAttributeBonusLevel()*2
					+ self.ability().getIntelligence()
					+ self.enemy().ability().getAllStatsReduction()
					+ self.debuffs.getAllStatsReduction()
				   ).toFixed(2);
		});
		self.totalstr = ko.computed(function() {
			return (my.heroData['npc_dota_hero_' + self.selectedHero().heroName].attributebasestrength 
					+ my.heroData['npc_dota_hero_' + self.selectedHero().heroName].attributestrengthgain * (self.selectedHeroLevel() - 1) 
					+ self.inventory.getAttributes('str') 
					+ self.ability().getAttributeBonusLevel()*2
					+ self.ability().getStrength()
					+ self.enemy().ability().getAllStatsReduction()
					+ self.debuffs.getAllStatsReduction()
				   ).toFixed(2);
		});
		self.health = ko.computed(function() {
			return (my.heroData['npc_dota_hero_' + self.selectedHero().heroName].statushealth + self.totalstr()*19 
					+ self.inventory.getHealth()
					+ self.ability().getHealth()).toFixed(2);
		});
		self.healthregen = ko.computed(function() {
			return (my.heroData['npc_dota_hero_' + self.selectedHero().heroName].statushealthregen + self.totalstr()*.03 
					+ self.inventory.getHealthRegen() 
					+ self.ability().getHealthRegen()
					+ self.buffs.getHealthRegen()).toFixed(2);
		});
		self.mana = ko.computed(function() {
			return (my.heroData['npc_dota_hero_' + self.selectedHero().heroName].statusmana + self.totalint()*13 + self.inventory.getMana()).toFixed(2);
		});
		self.manaregen = ko.computed(function() {
			return ((my.heroData['npc_dota_hero_' + self.selectedHero().heroName].statusmanaregen 
					+ self.totalint()*.04 
					+ self.ability().getManaRegen()) 
					* (1 + self.inventory.getManaRegenPercent()) 
					+ (self.selectedHero().heroName == 'crystal_maiden' ? self.ability().getManaRegenArcaneAura() * 2 : self.buffs.getManaRegenArcaneAura())
					+ self.inventory.getManaRegenBloodstone()
					- self.enemy().ability().getManaRegenReduction()).toFixed(2);
		});
		self.totalarmorphysical = ko.computed(function() {
			return (self.enemy().ability().getArmorBaseReduction() * self.debuffs.getArmorBaseReduction() * (my.heroData['npc_dota_hero_' + self.selectedHero().heroName].armorphysical + self.totalagi()*.14)
					+ self.inventory.getArmor() + self.ability().getArmor() + self.enemy().ability().getArmorReduction() + self.buffs.getArmor() + self.debuffs.getArmorReduction()).toFixed(2);
		});
		self.totalarmorphysicalreduction = ko.observable();
		self.damagreduction = ko.observable();
		self.totalmovementspeed = ko.computed(function() {
			var ms = (self.ability().setMovementSpeed() > 0 ? self.ability().setMovementSpeed() : self.buffs.setMovementSpeed());
			if (ms > 0) {
				return ms;
			}
			else {
				return ((my.heroData['npc_dota_hero_' + self.selectedHero().heroName].movementspeed + self.inventory.getMovementSpeedFlat()+ self.ability().getMovementSpeedFlat()) * 
						(1 + self.inventory.getMovementSpeedPercent() 
						   + self.ability().getMovementSpeedPercent() 
						   + self.enemy().inventory.getMovementSpeedPercentReduction() 
						   + self.enemy().ability().getMovementSpeedPercentReduction() 
						   + self.buffs.getMovementSpeedPercent() 
						   + self.debuffs.getMovementSpeedPercentReduction()
						   + self.unit().ability().getMovementSpeedPercent() 
						)).toFixed(2);
			}
		});
		self.totalturnrate = ko.computed(function() {
			return (my.heroData['npc_dota_hero_' + self.selectedHero().heroName].movementturnrate 
					* (1 + self.enemy().ability().getTurnRateReduction()
						 + self.debuffs.getTurnRateReduction())).toFixed(2);
		});
		self.basedamage = ko.computed(function() {
			return [Math.floor(my.heroData['npc_dota_hero_' + self.selectedHero().heroName].attackdamagemin + self.totalAttribute(self.primaryattribute()) + self.ability().getBaseDamage()),
					Math.floor(my.heroData['npc_dota_hero_' + self.selectedHero().heroName].attackdamagemax + self.totalAttribute(self.primaryattribute()) + self.ability().getBaseDamage())];
		});
		self.bonusdamage = ko.computed(function() {
			return self.inventory.getBonusDamage().total
					+ self.ability().getBonusDamage().total
					+ self.buffs.getBonusDamage().total
					+ Math.floor((self.basedamage()[0] + self.basedamage()[1])/2 
								  * (self.inventory.getBonusDamagePercent().total
									 + self.ability().getBonusDamagePercent().total
									 + self.buffs.getBonusDamagePercent().total
									)
								)
					+ Math.floor(
						(self.hero().attacktype() == 'DOTA_UNIT_CAP_RANGED_ATTACK' 
							? ((self.selectedHero().heroName == 'drow_ranger') ? self.ability().getBonusDamagePrecisionAura().total[0] * self.totalagi() : self.buffs.getBonusDamagePrecisionAura().total[1])
							: 0)
					  );
		});
		self.bonusdamagereduction = ko.computed(function() {
			return Math.abs(self.enemy().ability().getBonusDamageReduction() + self.debuffs.getBonusDamageReduction());
		});
		self.damage = ko.computed(function() {
			return [self.basedamage()[0] + self.bonusdamage()[0],
					self.basedamage()[1] + self.bonusdamage()[1]];
		});
		self.damageagainstenemy = ko.observable();
		self.totalmagicresistanceproduct = ko.computed(function() {
			return (1 - my.heroData['npc_dota_hero_' + self.selectedHero().heroName].magicalresistance / 100) 
					   * (1 - self.inventory.getMagicResist() / 100) 
					   * (1 - self.ability().getMagicResist() / 100) 
					   * (1 - self.buffs.getMagicResist() / 100) 
					   * self.enemy().inventory.getMagicResistReduction()
					   * self.enemy().ability().getMagicResistReduction() 
					   * self.debuffs.getMagicResistReduction();
		});
		self.totalmagicresistance = ko.computed(function() {
			return (1 - self.totalmagicresistanceproduct());
		});
		self.bat = ko.computed(function() {
			var abilityBAT = self.ability().getBAT();
			if (abilityBAT > 0) {
				return abilityBAT;
			}
			return my.heroData['npc_dota_hero_' + self.selectedHero().heroName].attackrate;
		});
		self.ias = ko.computed(function() {
			var val = parseFloat(self.totalagi()) 
					+ self.inventory.getAttackSpeed() 
					+ self.ability().getAttackSpeed() 
					+ self.enemy().ability().getAttackSpeedReduction() 
					+ self.buffs.getAttackSpeed() 
					+ self.debuffs.getAttackSpeedReduction()
					+ self.unit().ability().getAttackSpeed(); 
			if (val < -80) {
				return -80;
			}
			else if (val > 400) {
				return 400;
			}
			return (val).toFixed(2);
		});
		self.attacktime = ko.computed(function() {
			return (self.bat() / (1 + self.ias() / 100)).toFixed(2);
		});
		self.attackspersecond = ko.computed(function() {
			return (1 + self.ias() / 100) / self.bat();
		});
		self.evasion = ko.computed(function() {
			var e = self.ability().setEvasion();
			if (e) {
				return (e * 100).toFixed(2) + '%';
			}
			else {
				return ((1-(self.inventory.getEvasion() * self.ability().getEvasion())) * 100).toFixed(2) + '%';
			}
		});
		self.ehp_physical = ko.computed(function() {
			return ((self.health() * (1 + .06 * self.totalarmorphysical())) / (1-(1-(self.inventory.getEvasion() * self.ability().getEvasion())))).toFixed(2);
		});
		self.ehp_magical = ko.computed(function() {
			return (self.health() / self.totalmagicresistanceproduct()).toFixed(2);
		});
		self.bash = ko.computed(function() {
			var attacktype = my.heroData['npc_dota_hero_' + self.selectedHero().heroName].attacktype;
			return ((1-(self.inventory.getBash(attacktype) * self.ability().getBash())) * 100).toFixed(2) + '%';
		});

		self.cleaveinfo = ko.computed(function() {
			var cleavesources = self.inventory.getCleaveSource();
			$.extend(cleavesources, self.ability().getCleaveSource());
			$.extend(cleavesources, self.buffs.getCleaveSource());
			var cleavesources_array = [];
			for (prop in cleavesources) {
				var el = cleavesources[prop];
				el.name = prop
				cleavesources_array.push(el);
			}
			function compareByRadius(a,b) {
				if (a.radius < b.radius)
					return 1;
				if (a.radius > b.radius)
					return -1;
				return 0;
			}

			cleavesources_array.sort(compareByRadius);
			var cleavesources_by_radius = {};
			for (var i=0;i<cleavesources_array.length;i++) {
				var total = 0;
				for (var j=0;j<cleavesources_array.length;j++) {
					if (cleavesources_array[j].radius >= cleavesources_array[i].radius) {
						total += cleavesources_array[j].magnitude * cleavesources_array[j].count;
					}
				}
				cleavesources_by_radius[cleavesources_array[i].radius] = total;
			}
			var result = [];
			for (prop in cleavesources_by_radius) {
				result.push({
					'radius':prop,
					'magnitude':cleavesources_by_radius[prop]
				});
			}
			return result;
		});
		
		self.critchance = ko.computed(function() {
			return ((1-(self.inventory.getCritChance() * self.ability().getCritChance())) * 100).toFixed(2) + '%';
		});

		self.critinfo = ko.computed(function() {
			var critsources = self.inventory.getCritSource();
			$.extend(critsources, self.ability().getCritSource());
			$.extend(critsources, self.buffs.getCritSource());
			var critsources_array = [];
			for (prop in critsources) {
				var el = critsources[prop];
				el.name = prop
				critsources_array.push(el);
			}
			function compareByMultiplier(a,b) {
				if (a.multiplier < b.multiplier)
					return 1;
				if (a.multiplier > b.multiplier)
					return -1;
				return 0;
			}

			critsources_array.sort(compareByMultiplier);
			
			var result = [];
			var crit_total = 0;
			for (var i=0;i<critsources_array.length;i++) {
				var total = 1;
				for (var j=0;j<i;j++) {
					for (var k=0;k<critsources_array[j].count;k++) {
						total *= (1-critsources_array[j].chance);
					}
				}
				var total2 = 1;
				for (var k=0;k<critsources_array[i].count;k++) {
					total2 *= (1-critsources_array[i].chance);
				}
				total *= (1-total2);
				crit_total += total;
				if (critsources_array[i].count > 1) {
					result.push({
						'name':critsources_array[i].displayname + ' x' + critsources_array[i].count,
						'chance':critsources_array[i].chance,
						'multiplier':critsources_array[i].multiplier,
						'count':critsources_array[i].count,
						'totalchance':total
					});
				}
				else {
					result.push({
						'name':critsources_array[i].displayname,
						'chance':critsources_array[i].chance,
						'multiplier':critsources_array[i].multiplier,
						'count':critsources_array[i].count,
						'totalchance':total
					});
				}
			}
			return { sources: result, total: crit_total };
		});
		
		self.bashinfo = ko.computed(function() {
			var attacktype = my.heroData['npc_dota_hero_' + self.selectedHero().heroName].attacktype;
			var bashsources = self.inventory.getBashSource(attacktype);
			$.extend(bashsources, self.ability().getBashSource());
			var bashsources_array = [];
			for (prop in bashsources) {
				var el = bashsources[prop];
				el.name = prop
				bashsources_array.push(el);
			}
			function compareByDuration(a,b) {
				if (a.duration < b.duration)
					return 1;
				if (a.duration > b.duration)
					return -1;
				return 0;
			}

			//bashsources_array.sort(compareByDuration);
			
			var result = [];
			var bash_total = 0;
			for (var i=0;i<bashsources_array.length;i++) {
				var total = 1;
				for (var j=0;j<i;j++) {
					for (var k=0;k<bashsources_array[j].count;k++) {
						total *= (1-bashsources_array[j].chance);
					}
				}
				var total2 = 1;
				for (var k=0;k<bashsources_array[i].count;k++) {
					total2 *= (1-bashsources_array[i].chance);
				}
				total *= (1-total2);
				bash_total += total;
				if (bashsources_array[i].name == 'spirit_breaker_greater_bash') {
					var d = bashsources_array[i].damage * self.totalmovementspeed();
				}
				else {
					var d = bashsources_array[i].damage;
				}
				if (bashsources_array[i].count > 1) {
					result.push({
						'name':bashsources_array[i].displayname + ' x' + bashsources_array[i].count,
						'chance':bashsources_array[i].chance,
						'damage':d,
						'count':bashsources_array[i].count,
						'damagetype':bashsources_array[i].damagetype,
						'totalchance':total
					});
				}
				else {
					result.push({
						'name':bashsources_array[i].displayname,
						'chance':bashsources_array[i].chance,
						'damage':d,
						'count':bashsources_array[i].count,
						'damagetype':bashsources_array[i].damagetype,
						'totalchance':total
					});
				}

			}
			return { sources: result, total: bash_total };
		});
		
		self.orbprocinfo = ko.computed(function() {
			var attacktype = my.heroData['npc_dota_hero_' + self.selectedHero().heroName].attacktype;
			var damagesources = self.inventory.getOrbProcSource();
			//$.extend(damagesources, self.ability().getProcSource());
			var damagesources_array = [];
			for (prop in damagesources) {
				var el = damagesources[prop];
				el.name = prop
				damagesources_array.push(el);
			}
			function compareByDamage(a,b) {
				if (a.priority > b.priority) {
					return 1;
				}
				if (a.priority < b.priority) {
					return -1;
				}
				if (a.damage < b.damage)
					return 1;
				if (a.damage > b.damage)
					return -1;
				return 0;
			}

			damagesources_array.sort(compareByDamage);
			
			var result = [];
			var damage_total = 0;
			for (var i=0;i<damagesources_array.length;i++) {
				var total = 1;
				for (var j=0;j<i;j++) {
					for (var k=0;k<damagesources_array[j].count;k++) {
						total *= (1-damagesources_array[j].chance);
					}
				}
				var total2 = 1;
				for (var k=0;k<damagesources_array[i].count;k++) {
					total2 *= (1-damagesources_array[i].chance);
				}
				total *= (1-total2);
				damage_total += total;
				if (damagesources_array[i].count > 1) {
					result.push({
						'name':damagesources_array[i].displayname + ' x' + damagesources_array[i].count,
						'chance':damagesources_array[i].chance,
						'damage':damagesources_array[i].damage,
						'count':damagesources_array[i].count,
						'damagetype':damagesources_array[i].damagetype,
						'totalchance':total
					});
				}
				else {
					result.push({
						'name':damagesources_array[i].displayname,
						'chance':damagesources_array[i].chance,
						'damage':damagesources_array[i].damage,
						'count':damagesources_array[i].count,
						'damagetype':damagesources_array[i].damagetype,
						'totalchance':total
					});
				}
			}
			return { sources: result, total: damage_total };
		});

		self.getReducedDamage = function(value, type) {
			switch(type) {
				case 'physical':
					if (self.enemy().totalarmorphysical() >= 0) {
						return value * (1 - (0.06 * self.enemy().totalarmorphysical()) / (1 + 0.06 * self.enemy().totalarmorphysical()));
					}
					else {
						return value * (1 + (1 - Math.pow(0.94,-self.enemy().totalarmorphysical())));
					}
				break;
				case 'magic':
					return value * (1 - self.enemy().totalmagicresistance());
				break;
				case 'pure':
					return value;
				break;
			}
		}
			
		self.damagetotalinfo = ko.computed(function() {
			var bonusdamage_array = [
				self.ability().getBonusDamage().sources,
				self.buffs.getBonusDamage().sources
			],
			bonusdamagepct_array = [
				self.ability().getBonusDamagePercent().sources,
				self.buffs.getBonusDamagePercent().sources
			],
			itembonusdamage = self.inventory.getBonusDamage().sources,
			itembonusdamagepct = self.inventory.getBonusDamagePercent().sources,
			critsources = self.critinfo(),
			abilityorbsources = self.ability().getOrbSource(),
			itemorbsources = self.inventory.getOrbSource(),
			itemprocorbsources = self.orbprocinfo(),
			bashsources = self.bashinfo(),
			
			basedamage = (self.basedamage()[0] + self.basedamage()[1])/2,
			totaldamage = basedamage,
			totalcritabledamage = basedamage,
			totalcrit = 0,
			damage = {
				pure: 0,
				physical: basedamage,
				magic: 0
			},
			result = [],
			crits = [];

			// bonus damage from items
			for (i in itembonusdamage) {
				var d = itembonusdamage[i].damage*itembonusdamage[i].count;
				result.push({
					'name':itembonusdamage[i].displayname + (itembonusdamage[i].count > 1 ? ' x' + itembonusdamage[i].count : ''),
					'damage':d,
					'damagetype':itembonusdamage[i].damagetype,
					'damagereduced':self.getReducedDamage(d, itembonusdamage[i].damagetype)
				});
				totaldamage += d;
				totalcritabledamage += d;
				damage[itembonusdamage[i].damagetype] += d;
			}

			// bonus damage percent from items
			for (i in itembonusdamagepct) {
				var d = basedamage * itembonusdamagepct[i].damage;
				result.push({
					'name':itembonusdamagepct[i].displayname,
					'damage':d,
					'damagetype':itembonusdamagepct[i].damagetype,
					'damagereduced':self.getReducedDamage(d, itembonusdamagepct[i].damagetype)
				});
				totaldamage += d;
				totalcritabledamage += d;
				damage[itembonusdamagepct[i].damagetype] += d;
			}
			
			// bonus damage from abilities and buffs
			for (var i=0;i<bonusdamage_array.length;i++) {
				for (j in bonusdamage_array[i]) {
					var d = bonusdamage_array[i][j].damage;
					result.push({
						'name':bonusdamage_array[i][j].displayname,
						'damage':d,
						'damagetype':bonusdamage_array[i][j].damagetype,
						'damagereduced':self.getReducedDamage(d, bonusdamage_array[i][j].damagetype)
					});
					totaldamage += d;
					totalcritabledamage += d;
					damage[bonusdamage_array[i][j].damagetype] += d;
				}
			}
			
			// bonus damage percent from abilities and buffs
			for (var i=0;i<bonusdamagepct_array.length;i++) {
				for (j in bonusdamagepct_array[i]) {
					var d = basedamage * bonusdamagepct_array[i][j].damage;
					result.push({
						'name':bonusdamagepct_array[i][j].displayname,
						'damage':d,
						'damagetype':bonusdamagepct_array[i][j].damagetype,
						'damagereduced':self.getReducedDamage(d, bonusdamagepct_array[i][j].damagetype)
					});
					totaldamage += d;
					totalcritabledamage += d;
					damage[bonusdamagepct_array[i][j].damagetype] += d;
				}
			}
			// drow_ranger_trueshot
			if (self.hero().attacktype() == 'DOTA_UNIT_CAP_RANGED_ATTACK') {
				if (self.selectedHero().heroName == 'drow_ranger') {
					var s = self.ability().getBonusDamagePrecisionAura().sources;
					var index = 0;
				}
				else {
					var s = self.buffs.getBonusDamagePrecisionAura().sources;
					var index = 1;
				}
				if (s[index] != undefined) {
					if (self.selectedHero().heroName == 'drow_ranger') {
						var d = s[index].damage * self.totalagi();
					}
					else {
						var d = s[index].damage;
					}
					result.push({
						'name':s[index].displayname,
						'damage':d,
						'damagetype':'physical',
						'damagereduced':self.getReducedDamage(d, 'physical')
					});
					totaldamage += d;
					totalcritabledamage += d;
					damage.physical += d;					
				}
		
			}
			
			// bash damage
			for (var i=0;i<bashsources.sources.length;i++) {
				var d = bashsources.sources[i].damage * bashsources.sources[i].chance * bashsources.sources[i].count;
				result.push({
					'name':bashsources.sources[i].name,
					'damage':d,
					'damagetype':bashsources.sources[i].damagetype,
					'damagereduced':self.getReducedDamage(d, bashsources.sources[i].damagetype)
				});
				totaldamage += d;
				damage[bashsources.sources[i].damagetype] += d;
			}
			
			// %-based orbs
			for (var i=0;i<itemprocorbsources.sources.length;i++) {
				var d = itemprocorbsources.sources[i].damage * (1-Math.pow(1-itemprocorbsources.sources[i].chance,itemprocorbsources.sources[i].count));
				result.push({
					'name':itemprocorbsources.sources[i].name,
					'damage':d,
					'damagetype':itemprocorbsources.sources[i].damagetype,
					'damagereduced':self.getReducedDamage(d, itemprocorbsources.sources[i].damagetype)
				});
				totaldamage += d;
				damage[itemprocorbsources.sources[i].damagetype] += d;
			}
			
			// ability orbs
			for (orb in abilityorbsources) {
				var d = abilityorbsources[orb].damage * (1-itemprocorbsources.total);
				result.push({
					'name':abilityorbsources[orb].displayname,
					'damage':d,
					'damagetype':abilityorbsources[orb].damagetype,
					'damagereduced':self.getReducedDamage(d, abilityorbsources[orb].damagetype)
				});
				totaldamage += d;
				damage[abilityorbsources[orb].damagetype] += d;
			}
			
			// item orbs
			if (_.size(abilityorbsources) == 0) {
				for (orb in itemorbsources) {
					var d = itemorbsources[orb].damage * (1-itemprocorbsources.total);
					result.push({
						'name':itemorbsources[orb].displayname,
						'damage':d,
						'damagetype':itemorbsources[orb].damagetype,
						'damagereduced':self.getReducedDamage(d, itemorbsources[orb].damagetype)
					});
					totaldamage += d;
					damage[itemorbsources[orb].damagetype] += d;
				}			
			}
			
			// crit damage
			for (var i=0;i<critsources.sources.length;i++) {
				var d = totalcritabledamage * (critsources.sources[i].multiplier-1) * critsources.sources[i].totalchance;
				crits.push({
					'name':critsources.sources[i].name,
					'damage':d,
					'damagetype':'physical',
					'damagereduced':self.getReducedDamage(d, 'physical')
				});
				totalcrit += d;
			}

			return { sources: result,
					 sourcescrit: crits,
					 total: totaldamage,
					 totalcrit: totalcrit,
					 totalcritreduced: self.getReducedDamage(totalcrit, 'physical'),
					 totalreduced: self.getReducedDamage(damage.pure, 'pure') 
								 + self.getReducedDamage(damage.physical, 'physical')
								 + self.getReducedDamage(damage.magic, 'magic')
				   };
		});
		
		self.getDamageTypeColor = function(damagetype) {
			switch(damagetype) {
				case 'physical':
					return '#979aa2';
				break;
				case 'pure':
					return 'goldenrod';
				break;
				case 'magic':
					return '#428bca';
				break;
				default:
					return '#979aa2';
				break;
			}
		}
		
		self.critdamage = ko.computed(function() {
			self.critinfo();
			return 0 + '%';
		});
		self.misschance = ko.computed(function() {
			return ((1-(self.enemy().ability().getMissChance() * self.debuffs.getMissChance())) * 100).toFixed(2) + '%';
		});
		self.totalattackrange = ko.computed(function() {
			return my.heroData['npc_dota_hero_' + self.selectedHero().heroName].attackrange + self.ability().getAttackRange();
		});
		self.visionrangeday = ko.computed(function() {
			return (my.heroData['npc_dota_hero_' + self.selectedHero().heroName].visiondaytimerange) * (1 + self.enemy().ability().getVisionRangePctReduction()
																										  + self.debuffs.getVisionRangePctReduction());
		});
		self.visionrangenight = ko.computed(function() {
			return (my.heroData['npc_dota_hero_' + self.selectedHero().heroName].visionnighttimerange + self.ability().getVisionRangeNight()) * (1 + self.enemy().ability().getVisionRangePctReduction()
																																				   + self.debuffs.getVisionRangePctReduction());
		});
		self.lifesteal = ko.computed(function() {
			var total = self.inventory.getLifesteal() + self.ability().getLifesteal() + self.buffs.getLifesteal();
			if (self.hero().attacktype() == 'DOTA_UNIT_CAP_MELEE_ATTACK') {
				total+= self.inventory.getLifestealAura();
			}
			return (total).toFixed(2) + '%';
		});
		
		self.damage_brackets = [
			[
				{name: 'medusa_mana_shield', source: self.damagereduction, value: -.5},
				{name: 'templar_assassin_refraction', source: self.damagereduction, value: -1},
				{name: 'faceless_void_backtrack', source: self.damagereduction, value: -1},
				{name: 'nyx_assassin_spiked_carapace', source: self.damagereduction, value: -1}
			],
			[
				{
					name: 'spectre_dispersion',
					source: self.damagereduction,
					value: -self.damagereduction.getAbilityDamageAmpValue('spectre_dispersion','damage_reflection_pct')
				},
				{
					name: 'wisp_overcharge',
					source: self.damagereduction,
					value: self.damagereduction.getAbilityDamageAmpValue('wisp_overcharge','bonus_damage_pct')
				},
				{name: 'slardar_sprint', source: self.damageamplification, value: .5},
				{name: 'bristleback_bristleback', source: self.damagereduction, value: -.5},
				{name: 'undying_flesh_golem', source: self.damageamplification, value: .5}
			],
			[
				{name: 'abaddon_borrowed_time', source: self.damagereduction, value: .5},
				{
					name: 'abaddon_aphotic_shield',
					source: self.damagereduction,
					value: self.damagereduction.getAbilityDamageAmpValue('abaddon_aphotic_shield','damage_absorb'),
					type: 'absorb'
				},
				{name: 'kunkka_ghostship', source: self.damagereduction, value: .5},
				{name: 'treant_living_armor', source: self.damagereduction, value: .5}
			],
			[
				{name: 'chen_penitence', source: self.damageamplification, value: .5},
				{name: 'medusa_stone_gaze', source: self.damageamplification, value: .5},
				{name: 'shadow_demon_soul_catcher', source: self.damageamplification, value: .5}
			],
			[
				{name: 'dazzle_shallow_grave', source: self.damagereduction, value: .5}
			]
		];

		self.damage_brackets = [
			['medusa_mana_shield','templar_assassin_refraction','faceless_void_backtrack','nyx_assassin_spiked_carapace'],
			['spectre_dispersion','wisp_overcharge','slardar_sprint','bristleback_bristleback','undying_flesh_golem'],
			['abaddon_borrowed_time','abaddon_aphotic_shield','kunkka_ghostship','treant_living_armor'],
			['chen_penitence','medusa_stone_gaze','shadow_demon_soul_catcher'],
			['dazzle_shallow_grave']
		];
		
		self.getDamageAfterBracket = function(initialdamage,index) {
			var bracket = self.damage_brackets[index];
			var multiplier = 1;
			for (var i=0;i<bracket.length;i++) {
				if (_.findWhere(self.damageamplification.buffs, {name: bracket[i].name}) != undefined || _.findWhere(self.damagereduction.buffs, {name: bracket[i].name}) != undefined) {
					multiplier += bracket[i].value;
					console.log(bracket[i].value);
				}
			};
			return initialdamage * multiplier;
		};
		
		self.getDamageAmpReduc = function(initialdamage, skipBracket4) {
			var damage = initialdamage;
			var sources = self.damageamplification.getDamageMultiplierSources();
			$.extend(sources, self.damagereduction.getDamageMultiplierSources());
			console.log('sources');
			console.log(sources);
			var result = [];
			if (!skipBracket4) {
				result.push({
					label: 'Initial Damage',
					damagetype: 'physical',
					value: damage
				});
			}
			// Bracket 1
			var multiplier = 1;
			var label = '';
			for (var i=0;i<self.damage_brackets[1].length;i++) {
				if (sources[self.damage_brackets[1][i]] != undefined) {
					multiplier += sources[self.damage_brackets[1][i]].multiplier;
					label += sources[self.damage_brackets[1][i]].displayname + ', ';
				}
				damage *= multiplier;
				if (label != '') {
					result.push({
						label: 'After ' + label.substring(0,label.length-2) + ' Reductions',
						damagetype: sources[self.damage_brackets[1][i]].damagetype,
						value: damage
					});
				}
			}
			
			// Bracket 2
			var multiplier = 1;
			var label = '';
			for (var i=0;i<self.damage_brackets[1].length;i++) {
				if (sources[self.damage_brackets[1][i]] != undefined) {
					multiplier += sources[self.damage_brackets[1][i]].multiplier;
					label += sources[self.damage_brackets[1][i]].displayname + ', ';
				}
				damage *= multiplier;
				if (label != '') {
					result.push({
						label: 'After ' + label.substring(0,label.length-2) + ' Reductions',
						damagetype: sources[self.damage_brackets[1][i]].damagetype,
						value: damage
					});
				}
			}
			
			// Bracket 3
			var multiplier = 0;
			var label = '';
			if (sources['abaddon_aphotic_shield'] != undefined) {
				multiplier += sources['abaddon_aphotic_shield'].multiplier;
				console.log('abaddon_aphotic_shield');
				console.log(multiplier);
				label += sources['abaddon_aphotic_shield'].displayname + ', ';
			}
			damage -= multiplier;
			if (label != '') {
				result.push({
					label: 'After ' + label.substring(0,label.length-2) + ' Reductions',
					damagetype: sources['abaddon_aphotic_shield'].damagetype,
					value: damage
				});
			}
			
			// Bracket 4
			var damageBracket4 = 0;
			var damageBracket4total = 0;
			if (!skipBracket4) {
				damageBracket4 = damage;
				var multiplier = 0;
				var label = '';
				if (sources['shadow_demon_soul_catcher'] != undefined) {
					multiplier += sources['shadow_demon_soul_catcher'].multiplier;
					console.log('shadow_demon_soul_catcher');
					console.log(multiplier);
				}
				damageBracket4 *= multiplier;
				
				var resultBracket4 = self.getDamageAmpReduc(damageBracket4, true);
				if (sources['shadow_demon_soul_catcher'] != undefined) {
					result.push({
						label: sources['shadow_demon_soul_catcher'].displayname,
						damagetype: sources['shadow_demon_soul_catcher'].damagetype,
						value: damageBracket4
					});
				}
				damageBracket4 = resultBracket4.value;
				damageBracket4total += resultBracket4.value;
				if (sources['shadow_demon_soul_catcher'] != undefined) {
					for (var i=0;i<resultBracket4.sources.length;i++) {
						result.push(resultBracket4.sources[i]);
					}
				}
				
				damageBracket4 = damage;
				var multiplier = 0;
				var label = '';
				if (sources['chen_penitence'] != undefined) {
					multiplier += sources['chen_penitence'].multiplier;
					console.log('chen_penitence');
					console.log(multiplier);
				}
				damageBracket4 *= multiplier;
				
				var resultBracket4 = self.getDamageAmpReduc(damageBracket4, true);
				if (sources['chen_penitence'] != undefined) {
					result.push({
						label: sources['chen_penitence'].displayname,
						damagetype: sources['chen_penitence'].damagetype,
						value: damageBracket4
					});
				}
				damageBracket4 = resultBracket4.value;
				damageBracket4total += resultBracket4.value;
				if (sources['chen_penitence'] != undefined) {
					for (var i=0;i<resultBracket4.sources.length;i++) {
						result.push(resultBracket4.sources[i]);
					}
				}			
			}
			
			console.log('damage');
			console.log(damage);
			console.log(damageBracket4);
			if (!skipBracket4) {
				result.push({
					label: 'Total Damage',
					damagetype: 'physical',
					value: damage + damageBracket4total
				});
			}
			return { value: damage + damageBracket4total, sources: result };
		};
		
		self.damageInputModified = ko.computed(function() {
			return self.getDamageAmpReduc(self.damageInputValue(), false);
		});
	};

	return my;
}(HEROCALCULATOR));