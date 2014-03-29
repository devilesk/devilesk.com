var HEROCALCULATOR = (function (my) {

	my.UnitOption = function (name, displayname, levels, image, level) {
		this.heroName = ko.computed(function() {
			return (levels > 0) ? name + (level() <= levels ? level() : 1) : name;
		});
		this.heroDisplayName = displayname;
		this.image = image;
		this.levels = levels;
	};
	
	my.UnitViewModel = function (h,p) {
		var self = new my.HeroCalculatorModel(0);
		self.parent = p;
		self.selectedUnitLevel = ko.observable(1);
		self.availableUnits = ko.observableArray([
			new my.UnitOption('npc_dota_lone_druid_bear', 'Lone Druid Spirit Bear',4,'/media/images/units/spirit_bear.png', self.selectedUnitLevel),
			new my.UnitOption('npc_dota_brewmaster_earth_','Brewmaster Earth Warrior',3,'/media/images/units/npc_dota_brewmaster_earth.png', self.selectedUnitLevel),
			new my.UnitOption('npc_dota_brewmaster_fire_','Brewmaster Fire Warrior',3,'/media/images/units/npc_dota_brewmaster_fire.png', self.selectedUnitLevel),
			new my.UnitOption('npc_dota_brewmaster_storm_','Brewmaster Storm Warrior',3,'/media/images/units/npc_dota_brewmaster_storm.png', self.selectedUnitLevel),
			new my.UnitOption('npc_dota_necronomicon_archer_','Necronomicon Archer',3,'/media/images/units/npc_dota_necronomicon_archer.png', self.selectedUnitLevel),
			new my.UnitOption('npc_dota_necronomicon_warrior_','Necronomicon Warrior',3,'/media/images/units/npc_dota_necronomicon_warrior.png', self.selectedUnitLevel),
			new my.UnitOption('npc_dota_lycan_wolf','Lycan Wolf',4,'/media/images/units/npc_dota_lycan_wolf.png', self.selectedUnitLevel),
		]);
		self.selectedUnit = ko.observable(self.availableUnits()[h]);
		self.selectedUnit.subscribe(function(newValue) {
			if (newValue.heroName().indexOf('npc_dota_lone_druid_bear') != -1) {
				self.inventory.hasInventory(true);
				self.inventory.items.removeAll();
				self.inventory.activeItems.removeAll();
			}
			else {
				self.inventory.hasInventory(false);
				self.inventory.items.removeAll();
				self.inventory.activeItems.removeAll();
			}
		});
		self.hero = ko.computed(function() {
			return ko.mapping.fromJS(my.unitData[self.selectedUnit().heroName()]);
		});
		self.getAbilityLevelMax = function(data) {
			if (data.abilitytype() == 'DOTA_ABILITY_TYPE_ATTRIBUTES') {
				return 10;
			}
			else if (data.name() == 'necronomicon_archer_mana_burn' || data.name() == 'necronomicon_archer_aoe'
				|| data.name() == 'necronomicon_warrior_mana_burn' || data.name() == 'necronomicon_warrior_last_will') {
				return 3;
			}
			else if (data.name() == 'necronomicon_warrior_sight') {
				return 1;
			}
			else {
				return 4;
			}
		};
		self.ability = ko.computed(function() {
			var a = new my.AbilityModel(ko.mapping.fromJS(my.unitData[self.selectedUnit().heroName()].abilities));
			a.hasScepter = self.inventory.hasScepter
			switch (self.selectedUnit().heroName()) {
				case 'npc_dota_necronomicon_archer_1':
				case 'npc_dota_necronomicon_warrior_1':
					a.abilities()[0].level(1);
					a.abilities()[1].level(1);
				break;
				case 'npc_dota_necronomicon_archer_2':
				case 'npc_dota_necronomicon_warrior_2':
					a.abilities()[0].level(2);
					a.abilities()[1].level(2);
				break;
				case 'npc_dota_necronomicon_archer_3':
					a.abilities()[0].level(3);
					a.abilities()[1].level(3);
				break;
				case 'npc_dota_necronomicon_warrior_3':
					a.abilities()[0].level(3);
					a.abilities()[1].level(3);
					a.abilities()[2].level(1);
				break;
			}
			a.levelUpAbility = function(index, data, event, hero) {
				switch (a.abilities()[index()].name()) {
					case 'necronomicon_archer_mana_burn':
					case 'necronomicon_archer_aoe':
					case 'necronomicon_warrior_mana_burn':
					case 'necronomicon_warrior_last_will':
					case 'necronomicon_warrior_sight':
					break;
					default:
						if (a.abilities()[index()].level() < hero.getAbilityLevelMax(data)) {
							a.abilities()[index()].level(a.abilities()[index()].level()+1);
						}					
					break;
				}

			};
			a.levelDownAbility = function(index, data, event, hero) {			
				switch (a.abilities()[index()].name()) {
					case 'necronomicon_archer_mana_burn':
					case 'necronomicon_archer_aoe':
					case 'necronomicon_warrior_mana_burn':
					case 'necronomicon_warrior_last_will':
					case 'necronomicon_warrior_sight':
					break;
					default:
						if (a.abilities()[index()].level()>0) {
							a.abilities()[index()].level(a.abilities()[index()].level()-1);
						}
					break;
				}
			};
			return a;
		});		
		self.primaryattribute = ko.computed(function() {
			//var v = my.unitData[self.selectedUnit().heroName()].attributeprimary;
			var v = 0;
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
			return 0;
		};
		self.totalagi = ko.computed(function() {
			return (my.unitData[self.selectedUnit().heroName()].attributebaseagility
					+ my.unitData[self.selectedUnit().heroName()].attributeagilitygain * (self.selectedHeroLevel() - 1) 
					//+ self.inventory.getAttributes('agi') 
					+ self.ability().getAttributeBonusLevel()*2
					+ self.ability().getAgility()
					+ self.enemy().ability().getAllStatsReduction()
					+ self.debuffs.getAllStatsReduction()
				   ).toFixed(2);
		});
		self.totalint = ko.computed(function() {
			return (my.unitData[self.selectedUnit().heroName()].attributebaseintelligence 
					+ my.unitData[self.selectedUnit().heroName()].attributeintelligencegain * (self.selectedHeroLevel() - 1) 
					//+ self.inventory.getAttributes('int') 
					+ self.ability().getAttributeBonusLevel()*2
					+ self.ability().getIntelligence()
					+ self.enemy().ability().getAllStatsReduction()
					+ self.debuffs.getAllStatsReduction()
				   ).toFixed(2);
		});
		self.totalstr = ko.computed(function() {
			return (my.unitData[self.selectedUnit().heroName()].attributebasestrength 
					+ my.unitData[self.selectedUnit().heroName()].attributestrengthgain * (self.selectedHeroLevel() - 1) 
					//+ self.inventory.getAttributes('str') 
					+ self.ability().getAttributeBonusLevel()*2
					+ self.ability().getStrength()
					+ self.enemy().ability().getAllStatsReduction()
					+ self.debuffs.getAllStatsReduction()
				   ).toFixed(2);
		});
		self.health = ko.computed(function() {
			return (my.unitData[self.selectedUnit().heroName()].statushealth + self.totalstr()*19 
					+ self.inventory.getHealth()
					+ self.ability().getHealth()).toFixed(2);
		});
		self.healthregen = ko.computed(function() {
			return (my.unitData[self.selectedUnit().heroName()].statushealthregen + self.totalstr()*.03 
					+ self.inventory.getHealthRegen() 
					+ self.ability().getHealthRegen()
					+ self.buffs.getHealthRegen()).toFixed(2);
		});
		self.mana = ko.computed(function() {
			return (my.unitData[self.selectedUnit().heroName()].statusmana + self.totalint()*13 + self.inventory.getMana()).toFixed(2);
		});
		self.manaregen = ko.computed(function() {
			return ((my.unitData[self.selectedUnit().heroName()].statusmanaregen 
					+ self.totalint()*.04 
					+ self.ability().getManaRegen()) 
					* (1 + self.inventory.getManaRegenPercent()) 
					+ (self.selectedHero().heroName == 'crystal_maiden' ? self.ability().getManaRegenArcaneAura() * 2 : self.buffs.getManaRegenArcaneAura())
					+ self.inventory.getManaRegenBloodstone()
					- self.enemy().ability().getManaRegenReduction()).toFixed(2);
		});
		self.totalarmorphysical = ko.computed(function() {
			return (self.enemy().ability().getArmorBaseReduction() * self.debuffs.getArmorBaseReduction() * (my.unitData[self.selectedUnit().heroName()].armorphysical + self.totalagi()*.14)
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
				return ((my.unitData[self.selectedUnit().heroName()].movementspeed + self.inventory.getMovementSpeedFlat()+ self.ability().getMovementSpeedFlat()) * 
						(1 + self.inventory.getMovementSpeedPercent() 
						   + self.ability().getMovementSpeedPercent() 
						   + self.enemy().inventory.getMovementSpeedPercentReduction() 
						   + self.enemy().ability().getMovementSpeedPercentReduction() 
						   + self.buffs.getMovementSpeedPercent() 
						   + self.debuffs.getMovementSpeedPercentReduction()
						)).toFixed(2);
			}
		});
		self.totalturnrate = ko.computed(function() {
			return (my.unitData[self.selectedUnit().heroName()].movementturnrate 
					* (1 + self.enemy().ability().getTurnRateReduction()
						 + self.debuffs.getTurnRateReduction())).toFixed(2);
		});
		self.basedamage = ko.computed(function() {
			return [Math.floor(my.unitData[self.selectedUnit().heroName()].attackdamagemin + self.totalAttribute(self.primaryattribute()) + self.ability().getBaseDamage()),
					Math.floor(my.unitData[self.selectedUnit().heroName()].attackdamagemax + self.totalAttribute(self.primaryattribute()) + self.ability().getBaseDamage())];
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
			return (1 - my.unitData[self.selectedUnit().heroName()].magicalresistance / 100) 
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
			return my.unitData[self.selectedUnit().heroName()].attackrate;
		});
		self.ias = ko.computed(function() {
			var val = parseFloat(self.totalagi()) 
					+ self.inventory.getAttackSpeed() 
					+ self.ability().getAttackSpeed() 
					+ self.enemy().ability().getAttackSpeedReduction() 
					+ self.buffs.getAttackSpeed() 
					+ self.debuffs.getAttackSpeedReduction();
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
		
		return self;
	}

	return my;
}(HEROCALCULATOR));