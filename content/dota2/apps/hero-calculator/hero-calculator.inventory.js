var HEROCALCULATOR = (function (my) {
	var my = {};
	my.heroData = {};
	my.itemData = {};
	my.unitData = {};
	my.abilityData = {};
	my.stackableitems = ['clarity','flask','dust','ward_observer','ward_sentry','tango','tpscroll','smoke_of_deceit']
	my.levelitems = ['necronomicon','dagon','diffusal_blade']
	
	my.ItemInput = function (value, name) {
		this.value = ko.observable(value);
		this.name = ko.observable(name);
		this.displayname = ko.observable(name + ' ');
	};
	
	my.InventoryViewModel = function() {
		var self = this,
		itemswithactive = ['smoke_of_deceit','dust','ghost','tranquil_boots','phase_boots','power_treads','buckler','medallion_of_courage','ancient_janggo','mekansm','pipe','veil_of_discord','rod_of_atos','orchid','sheepstick','armlet','invis_sword','ethereal_blade','shivas_guard','manta','mask_of_madness','diffusal_blade','mjollnir','satanic','ring_of_basilius','ring_of_aquila'];
		self.hasInventory = ko.observable(true);
		self.items = ko.observableArray();
		self.activeItems = ko.observableArray([]);
		self.hasScepter = ko.computed(function() {
			for (var i=0;i<self.items().length;i++) {
				var item = self.items()[i].item
				if (item == 'ultimate_scepter' && self.items()[i].enabled()) {
					return true;
				}
				
			}
			return false;
		}, this);
		self.totalCost = ko.computed(function() {
			var c = 0;
			for (var i=0;i<self.items().length;i++) {
				var item = self.items()[i].item
				if (!self.items()[i].enabled()) continue;
				if (my.stackableitems.indexOf(item) != -1) {
					c += my.itemData['item_' + item].itemcost * self.items()[i].size;
				}
				else if (my.levelitems.indexOf(item) != -1) {
					switch(item) {
						case 'diffusal_blade':
							c += my.itemData['item_' + item].itemcost + (self.items()[i].size-1) * 850;
						break;
						case 'necronomicon':
						case 'dagon':
							c += my.itemData['item_' + item].itemcost + (self.items()[i].size-1) * 1250;
						break;
						default:
							c += my.itemData['item_' + item].itemcost;
						break;
					}
				}
				else {
					c += my.itemData['item_' + item].itemcost;
				}
				
			}
			return c;
		}, this);
		self.addItem = function(data, event) {
			if (self.hasInventory() && data.selectedItem() != undefined) {
				var new_item = {
					item: data.selectedItem(),
					state: ko.observable(0),
					size: data.itemInputValue(),
					enabled: ko.observable(true)
				}
	            self.items.push(new_item);
				if (data.selectedItem() == 'ring_of_aquila' || data.selectedItem() == 'ring_of_basilius') {
					self.toggleItem(undefined,new_item,undefined);
				}
			}
		};
		self.toggleItem = function (index, data, event) {
			if (itemswithactive.indexOf(data.item) >= 0) {
				if (self.activeItems.indexOf(data) < 0) {
					self.activeItems.push(data);
				}
				else {
					self.activeItems.remove(data);
				}
				switch (data.item) {
					case 'power_treads':
						if (data.state() < 2) {
							data.state(data.state()+1);
						}
						else {
							data.state(0);
						}				
					break;
					default:
						if (data.state() == 0) {
							data.state(1);
						}
						else {
							data.state(0);
						}				
					break;
				}
			}
		}.bind(this);
		self.removeItem = function (item) {
            self.activeItems.remove(item);
			self.items.remove(item);
		}.bind(this);
		self.toggleMuteItem = function (item) {
			item.enabled(!item.enabled());
		}.bind(this);		
		self.getItemImage = function (data) {
			switch (data.item) {
				case 'power_treads':
					if (data.state() == 0) {
						return '/media/images/items/' + data.item + '_str.png';
					}
					else if (data.state() == 1) {
						return '/media/images/items/' + data.item + '_int.png';
					}
					else {
						return '/media/images/items/' + data.item + '_agi.png';
					}
				break;
				case 'tranquil_boots':
				case 'ring_of_basilius':
					if (data.state() == 0) {
						return '/media/images/items/' + data.item + '.png';
					}
					else {
						return '/media/images/items/' + data.item + '_active.png';
					}
				break;
				case 'armlet':
					if (data.state() == 0) {
						return '/media/images/items/' + data.item + '.png';
					}
					else {
						return '/media/images/items/' + data.item + '_active.png';
					}
				break;
				case 'ring_of_aquila':
					if (data.state() == 0) {
						return '/media/images/items/' + data.item + '_active.png';
					}
					else {
						return '/media/images/items/' + data.item + '.png';
					}
				break;
				case 'dagon':
				case 'diffusal_blade':
				case 'necronomicon':
					if (data.size > 1) {
						return '/media/images/items/' + data.item + '_' + data.size + '.png';
					}
					else {
						return '/media/images/items/' + data.item + '.png';
					}
				break;
				default:
					return '/media/images/items/' + data.item + '.png';			
				break;
			}
		};
		self.getItemSizeLabel = function(data) {
			if (my.stackableitems.indexOf(data.item) != -1) {
				return '<span style="font-size:10px">Qty: </span>' + data.size;
			}
			else if (my.levelitems.indexOf(data.item) != -1) {
				return '<span style="font-size:10px">Lvl: </span>' + data.size;
			}
			else if (data.item == 'bloodstone') {
				return '<span style="font-size:10px">Charges: </span>' + data.size;
			}
			else {
				return '';
			}
		};
		self.getActiveBorder = function (data) {
			switch (data.item) {
				case 'power_treads':
				case 'tranquil_boots':
				case 'ring_of_basilius':
				case 'ring_of_aquila':
				case 'armlet':
					return 0;
				break;
				default:
					return data.state();	
				break;
			}
			
		}

		self.getItemAttributeValue = function(attributes, attributename, level) {
			for (var i=0;i<attributes.length;i++) {
				if (attributes[i].name == attributename) {
					if (level == 0) {
						return parseFloat(attributes[i].value[0]);
					}
					else if (level > attributes[i].value.length) {
						return parseFloat(attributes[i].value[0]);
					}
					else {
						return parseFloat(attributes[i].value[level-1]);
					}
				}
			}
		}
		
		self.getAttributes = function(attributetype) {
			var total_attribute = 0;
			for (var i=0; i<self.items().length;i++) {
				var item = self.items()[i].item;
				var isactive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
				if (!self.items()[i].enabled()) continue;
				var size = self.items()[i].size;
				for (var j=0;j<my.itemData['item_' + item].attributes.length;j++) {
					var attribute = my.itemData['item_' + item].attributes[j];
					switch(attribute.name) {
						case 'bonus_all_stats':
							total_attribute += parseInt(attribute.value[0]);
						break;
						case 'bonus_stats':
							total_attribute += parseInt(attribute.value[0]);
						break;
					}
					switch(attributetype) {
						case 'agi':
							if (attribute.name == 'bonus_agility') {
								if (item == 'diffusal_blade') {
									total_attribute += parseInt(attribute.value[size-1]);
								}
								else {
									total_attribute += parseInt(attribute.value[0]);
								}
							}
							if (attribute.name == 'bonus_stat' && self.items()[i].state() == 2) {total_attribute += parseInt(attribute.value[0]);};
						break;
						case 'int':
							if (attribute.name == 'bonus_intellect') {
								if (item == 'necronomicon') {
									total_attribute += parseInt(attribute.value[size-1]);
								}
								else if (item == 'diffusal_blade') {
									total_attribute += parseInt(attribute.value[size-1]);
								}
								else if (item == 'dagon') {
									total_attribute += parseInt(attribute.value[size-1]);
								}
								else {
									total_attribute += parseInt(attribute.value[0]);
								}
							}
							if (attribute.name == 'bonus_int') {total_attribute += parseInt(attribute.value[0]);};
							if (attribute.name == 'bonus_stat' && self.items()[i].state() == 1) {total_attribute += parseInt(attribute.value[0]);};
						break;
						case 'str':
							if (attribute.name == 'bonus_strength') {
								if (item == 'necronomicon') {
									total_attribute += parseInt(attribute.value[size-1]);
								}
								else {
									total_attribute += parseInt(attribute.value[0]);
								}
							}
							if (attribute.name == 'bonus_stat' && self.items()[i].state() == 0) {total_attribute += parseInt(attribute.value[0]);};
							if (attribute.name == 'unholy_bonus_strength' && isactive) {total_attribute += parseInt(attribute.value[0]);};
						break;
					}
				}
			}
			return total_attribute;
		};
		self.getBash = function(attacktype) {
			var total_attribute = 1;
			for (var i=0; i<self.items().length;i++) {
				var item = self.items()[i].item;
				if (!self.items()[i].enabled()) continue;
				for (var j=0;j<my.itemData['item_' + item].attributes.length;j++) {
					var attribute = my.itemData['item_' + item].attributes[j];
					switch(attribute.name) {
						case 'bash_chance':
							total_attribute *= (1 - parseInt(attribute.value[0])/100);
						break;
						case 'bash_chance_melee':
							if (attacktype == 'DOTA_UNIT_CAP_MELEE_ATTACK') { total_attribute *= (1 - parseInt(attribute.value[0])/100); };
						break;
						case 'bash_chance_ranged':
							if (attacktype == 'DOTA_UNIT_CAP_RANGED_ATTACK') { total_attribute *= (1 - parseInt(attribute.value[0])/100); };
						break;
					}
				}
			}
			return total_attribute;
		};
		
		self.getCritChance = function() {
			var total_attribute = 1;
			for (var i=0; i<self.items().length;i++) {
				var item = self.items()[i].item;
				var isactive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
				if (!self.items()[i].enabled()) continue;
				for (var j=0;j<my.itemData['item_' + item].attributes.length;j++) {
					var attribute = my.itemData['item_' + item].attributes[j];
					switch(attribute.name) {
						case 'crit_chance':
							total_attribute *= (1 - parseInt(attribute.value[0])/100);
						break;
					}
				}
			}
			return total_attribute;
		};
		
		self.getCritSource = function() {
			var sources = {};
			for (var i=0; i<self.items().length;i++) {
				var item = self.items()[i].item;
				var isactive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
				if (!self.items()[i].enabled()) continue;
				switch (item) {
					case 'lesser_crit':
					case 'greater_crit':
						if (sources[item] == undefined) {
							sources[item] = {
								'chance': self.getItemAttributeValue(my.itemData['item_' + item].attributes, 'crit_chance', 0)/100,
								'multiplier': self.getItemAttributeValue(my.itemData['item_' + item].attributes, 'crit_multiplier', 0)/100,
								'count': 1,
								'displayname': my.itemData['item_' + item].displayname
							}
						}
						else {
							sources[item].count += 1;
						}
					break;
				}

			}
			return sources;
		};

		self.getCleaveSource = function() {
			var sources = {};
			for (var i=0; i<self.items().length;i++) {
				var item = self.items()[i].item;
				var isactive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
				if (!self.items()[i].enabled()) continue;
				switch (item) {
					case 'bfury':
						if (sources[item] == undefined) {
							sources[item] = {
								'radius': self.getItemAttributeValue(my.itemData['item_' + item].attributes, 'cleave_radius', 0),
								'magnitude': self.getItemAttributeValue(my.itemData['item_' + item].attributes, 'cleave_damage_percent', 0)/100,
								'count': 1,
								'displayname': my.itemData['item_' + item].displayname
							}
						}
						else {
							sources[item].count += 1;
						}
					break;
				}

			}
			return sources;
		};
		
		self.getBashSource = function(attacktype) {
			var sources = {};
			for (var i=0; i<self.items().length;i++) {
				var item = self.items()[i].item;
				var isactive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
				if (!self.items()[i].enabled()) continue;
				switch (item) {
					case 'javelin':
						if (sources[item] == undefined) {
							sources[item] = {
								'damage': self.getItemAttributeValue(my.itemData['item_' + item].attributes, 'bonus_chance_damage', 1),
								'damagetype': 'physical',
								'count':1,
								'chance': self.getItemAttributeValue(my.itemData['item_' + item].attributes, 'bonus_chance', 1)/100,
								'displayname': my.itemData['item_' + item].displayname + ' Pierce'
							}							
						}
						else {
							sources[item].count += 1;
						}
					break;
					case 'monkey_king_bar':
						if (sources[item] == undefined) {
							sources[item] = {
								'item': item,
								'chance': self.getItemAttributeValue(my.itemData['item_' + item].attributes, 'bash_chance', 0)/100,
								'damage': self.getItemAttributeValue(my.itemData['item_' + item].attributes, 'bash_damage', 0),
								'duration': self.getItemAttributeValue(my.itemData['item_' + item].attributes, 'bash_stun', 0),
								'count': 1,
								'damagetype': 'magic',
								'displayname': my.itemData['item_' + item].displayname
							}
						}
						else {
							sources[item].count += 1;
						}
					break;
					case 'abyssal_blade':
					case 'basher':
						if (sources[item] == undefined) {
							if (attacktype == 'DOTA_UNIT_CAP_MELEE_ATTACK') {
								sources[item] = {
									'item': item,
									'chance': self.getItemAttributeValue(my.itemData['item_' + item].attributes, 'bash_chance_melee', 0)/100,
									'damage': 0,
									'duration': self.getItemAttributeValue(my.itemData['item_' + item].attributes, 'bash_duration', 0),
									'count': 1,
									'damagetype': 'physical',
									'displayname': my.itemData['item_' + item].displayname
								}							
							}
							else {
								sources[item] = {
									'item': item,
									'chance': self.getItemAttributeValue(my.itemData['item_' + item].attributes, 'bash_chance_ranged', 0)/100,
									'damage': 0,
									'duration': self.getItemAttributeValue(my.itemData['item_' + item].attributes, 'bash_duration', 0),
									'count': 1,
									'damagetype': 'physical',
									'displayname': my.itemData['item_' + item].displayname
								}							

							}

						}
						else {
							sources[item].count += 1;
						}
					break;
				}

			}
			return sources;
		};
		
		self.getOrbProcSource = function() {
			var sources = {};
			for (var i=0; i<self.items().length;i++) {
				var item = self.items()[i].item;
				var isactive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
				if (!self.items()[i].enabled()) continue;
				switch (item) {
					case 'maelstrom':
					case 'mjollnir':
						if (sources[item] == undefined) {
							sources[item] = {
								'chance': self.getItemAttributeValue(my.itemData['item_' + item].attributes, 'chain_chance', 0)/100,
								'damage': self.getItemAttributeValue(my.itemData['item_' + item].attributes, 'chain_damage', 0),
								'count': 1,
								'damagetype': 'magic',
								'displayname': my.itemData['item_' + item].displayname
							}
						}
						else {
							sources[item].count += 1;
						}
					break;
				}

			}
			return sources;
		};

		self.getOrbSource = function() {
			var sources = {};
			for (var i=0; i<self.items().length;i++) {
				var item = self.items()[i].item;
				var isactive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
				if (!self.items()[i].enabled()) continue;
				switch (item) {
					case 'diffusal_blade':
						if (sources[item] == undefined) {
							sources[item] = {
								'chance': 1,
								'damage': self.getItemAttributeValue(my.itemData['item_' + item].attributes, 'feedback_mana_burn', self.items()[i].size),
								'count': 1,
								'damagetype': 'physical',
								'displayname': my.itemData['item_' + item].displayname
							}
						}
						else {
							sources[item].count += 1;
						}
					break;
				}

			}
			return sources;
		};
		
		self.getHealth = function() {
			var total_attribute = 0;
			for (var i=0; i<self.items().length;i++) {
				var item = self.items()[i].item;
				if (!self.items()[i].enabled()) continue;
				for (var j=0;j<my.itemData['item_' + item].attributes.length;j++) {
					var attribute = my.itemData['item_' + item].attributes[j];
					switch(attribute.name) {
						case 'bonus_health':
							total_attribute += parseInt(attribute.value[0]);
						break;
					}
				}
			}
			return total_attribute;
		};
		self.getHealthRegen = function() {
			var total_attribute = 0;
			for (var i=0; i<self.items().length;i++) {
				var item = self.items()[i].item;
				var isactive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
				if (!self.items()[i].enabled()) continue;
				for (var j=0;j<my.itemData['item_' + item].attributes.length;j++) {
					var attribute = my.itemData['item_' + item].attributes[j];
					switch(attribute.name) {
						case 'aura_health_regen':
							total_attribute += parseInt(attribute.value[0]);
						break;
						case 'health_regen':
							total_attribute += parseInt(attribute.value[0]);
						break;
						case 'bonus_health_regen':
								if (item == 'tranquil_boots' && !isactive) {
									total_attribute += parseInt(attribute.value[0]);
								}
								else if (item != 'tranquil_boots') {
									total_attribute += parseInt(attribute.value[0]);
								}
						break;
						case 'hp_regen':
							total_attribute += parseInt(attribute.value[0]);
						break;
					}
				}
			}
			return total_attribute;
		};
		self.getMana = function() {
			var total_attribute = 0;
			for (var i=0; i<self.items().length;i++) {
				var item = self.items()[i].item;
				if (!self.items()[i].enabled()) continue;
				for (var j=0;j<my.itemData['item_' + item].attributes.length;j++) {
					var attribute = my.itemData['item_' + item].attributes[j];
					switch(attribute.name) {
						case 'bonus_mana':
							total_attribute += parseInt(attribute.value[0]);
						break;
					}
				}
			}
			return total_attribute;
		};
		self.getManaRegenPercent = function() {
			var total_attribute = 0;
			for (var i=0; i<self.items().length;i++) {
				var item = self.items()[i].item;
				if (!self.items()[i].enabled()) continue;
				for (var j=0;j<my.itemData['item_' + item].attributes.length;j++) {
					var attribute = my.itemData['item_' + item].attributes[j];
					switch(attribute.name) {
						case 'bonus_mana_regen':
							total_attribute += parseFloat(attribute.value[0]);
						break;
						case 'mana_regen':
							total_attribute += parseFloat(attribute.value[0]);
						break;
						case 'bonus_mana_regen_pct':
							total_attribute += parseFloat(attribute.value[0]);
						break;
					}
				}
			}
			return total_attribute/100;	
		};
		self.getManaRegenBloodstone = function() {
			for (var i=0; i<self.items().length;i++) {
				var item = self.items()[i].item;
				if (!self.items()[i].enabled()) continue;
				if (item.indexOf('bloodstone') != -1) {
					return parseInt(self.items()[i].size);
				}
			}
			return 0;
		};
		self.getArmor = function() {
			var total_attribute = 0;
			for (var i=0; i<self.items().length;i++) {
				var item = self.items()[i].item;
				var isactive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
				if (!self.items()[i].enabled()) continue;
				for (var j=0;j<my.itemData['item_' + item].attributes.length;j++) {
					var attribute = my.itemData['item_' + item].attributes[j];
					switch(attribute.name) {
						case 'bonus_armor':
							if (!isactive || item != 'medallion_of_courage') { total_attribute += parseInt(attribute.value[0]); };
						break;
						case 'aura_positive_armor':
							total_attribute += parseInt(attribute.value[0]);
						break;
						case 'bonus_aoe_armor':
						case 'aura_bonus_armor':
							if (isactive) { total_attribute += parseInt(attribute.value[0]); };
						break;
						case 'heal_bonus_armor':
							if (isactive) { total_attribute += parseInt(attribute.value[0]); };
						break;
						case 'armor_aura':
							total_attribute += parseInt(attribute.value[0]);
						break;
					}
				}
			}
			return total_attribute;
		};
		self.getEvasion = function() {
			var total_attribute = 1;
			for (var i=0; i<self.items().length;i++) {
				var item = self.items()[i].item;
				var isactive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
				if (!self.items()[i].enabled()) continue;
				for (var j=0;j<my.itemData['item_' + item].attributes.length;j++) {
					var attribute = my.itemData['item_' + item].attributes[j];
					switch(attribute.name) {
						case 'bonus_evasion':
							total_attribute *= (1 - parseInt(attribute.value[0])/100);
						break;
					}
				}
			}
			return total_attribute;
		};
		self.getMovementSpeedFlat = function() {
			var total_attribute = 0,
			hasBoots = false,
			hasEuls = false,
			bootItems = ['boots','phase_boots','arcane_boots','travel_boots','power_treads','tranquil_boots'];
			for (var i=0; i<self.items().length;i++) {
				var item = self.items()[i].item;
				var isactive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
				if (!self.items()[i].enabled()) continue;
				for (var j=0;j<my.itemData['item_' + item].attributes.length;j++) {
					var attribute = my.itemData['item_' + item].attributes[j];
					switch(attribute.name) {
						case 'bonus_movement_speed':
							if (!hasBoots && bootItems.indexOf(item) >= 0) {
								if (item != 'tranquil_boots' || (item == 'tranquil_boots' && !isactive)) {
									total_attribute += parseInt(attribute.value[0]);
									hasBoots = true;
								}
							}
							else if (!hasEuls && item == 'cyclone') {
								total_attribute += parseInt(attribute.value[0]);
								hasEuls = true;
							}
						break;
						case 'broken_movement_speed':
							if (!hasBoots && bootItems.indexOf(item) >= 0) {
								if (item == 'tranquil_boots' && isactive) {
									total_attribute += parseInt(attribute.value[0]);
									hasBoots = true;
								}
							}
						break;
						case 'bonus_movement':
							if (!hasBoots && bootItems.indexOf(item) >= 0) {
								total_attribute += parseInt(attribute.value[0]);
								hasBoots = true;
							}
						break;
					}
				}
			}
			return total_attribute;
		};
		self.getMovementSpeedPercent = function() {
			var total_attribute = 0,
			hasYasha = false,
			hasDrums = false,
			hasDrumsActive = false,
			hasPhaseActive = false,
			hasShadowBladeActive = false,
			hasMoMActive = false,
			yashaItems = ['manta','yasha','sange_and_yasha'];
			for (var i=0; i<self.items().length;i++) {
				var item = self.items()[i].item;
				var isactive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
				if (!self.items()[i].enabled()) continue;
				for (var j=0;j<my.itemData['item_' + item].attributes.length;j++) {
					var attribute = my.itemData['item_' + item].attributes[j];
					switch(attribute.name) {
						case 'movement_speed_percent_bonus':
							if (!hasYasha && yashaItems.indexOf(item) >= 0) {
								total_attribute += parseInt(attribute.value[0]);
								hasYasha = true;
							}
						break;
						case 'bonus_aura_movement_speed_pct':
							if (!hasDrums && item == 'ancient_janggo') {
								total_attribute += parseInt(attribute.value[0]);
								hasDrums = true;
							}
						break;
						case 'phase_movement_speed':
							if (isactive && !hasPhaseActive) {
								total_attribute += parseInt(attribute.value[0]);
								hasPhaseActive = true;
							}
						break;
						case 'bonus_movement_speed_pct':
							if (isactive && !hasDrumsActive && item == 'ancient_janggo') {
								total_attribute += parseInt(attribute.value[0]);
								hasDrumsActive = true;
							}
						break;
						case 'windwalk_movement_speed':
							if (isactive && !hasShadowBladeActive && item == 'invis_sword') {
								total_attribute += parseInt(attribute.value[0]);
								hasShadowBladeActive = true;
							}
						break;
						case 'berserk_bonus_movement_speed':
							if (isactive && !hasMoMActive && item == 'mask_of_madness') {
								total_attribute += parseInt(attribute.value[0]);
								hasMoMActive = true;
							}
						break;
						case 'bonus_movement_speed': //manta
							if (!hasYasha && item == 'manta') {
								total_attribute += parseInt(attribute.value[0]);
								hasYasha = true;
							}
							else if (item == 'smoke_of_deceit' && isactive) {
								total_attribute += parseInt(attribute.value[0]);
							}
						break;
					}
				}
			}
			return total_attribute/100;
		};
		
		self.getMovementSpeedPercentReduction = function() {
			var total_attribute = 0;
			for (var i=0; i<self.items().length;i++) {
				var item = self.items()[i].item;
				var isactive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
				if (!self.items()[i].enabled()) continue;
				for (var j=0;j<my.itemData['item_' + item].attributes.length;j++) {
					var attribute = my.itemData['item_' + item].attributes[j];
					switch(attribute.name) {
						case 'movespeed':
							if (item == 'dust' && isactive) {
								total_attribute += parseInt(attribute.value[0]);
							}
						break;
					}
				}
			}
			return total_attribute/100;
		};
		
		self.getBonusDamage = function() {
			var total_attribute = 0;
			var sources = {};
			for (var i=0; i<self.items().length;i++) {
				var item = self.items()[i].item;
				var isactive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
				if (!self.items()[i].enabled()) continue;
				for (var j=0;j<my.itemData['item_' + item].attributes.length;j++) {
					var attribute = my.itemData['item_' + item].attributes[j];
					switch(attribute.name) {
						case 'bonus_damage':
							total_attribute += parseInt(attribute.value[0]);
							if (sources[item] == undefined) {
								sources[item] = {
									'damage': parseInt(attribute.value[0]),
									'damagetype': 'physical',
									'count':1,
									'displayname': my.itemData['item_' + item].displayname
								}							
							}
							else {
								sources[item].count += 1;
							}
						break;
						case 'unholy_bonus_damage':
							if (isactive) {
								total_attribute += parseInt(attribute.value[0]);
								if (sources[item + '_active'] == undefined) {
									sources[item + '_active'] = {
										'damage': parseInt(attribute.value[0]),
										'damagetype': 'physical',
										'count':1,
										'displayname': my.itemData['item_' + item].displayname + ' Unholy Strength'
									}							
								}
								else {
									sources[item].count += 1;
								}
							}
						break;
					}
				}
			}
			return { sources: sources, total: total_attribute };
		};
		self.getBonusDamagePercent = function() {
			var total_attribute = 0;
			var sources = {};
			for (var i=0; i<self.items().length;i++) {
				var item = self.items()[i].item;
				var isactive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
				if (!self.items()[i].enabled()) continue;
				for (var j=0;j<my.itemData['item_' + item].attributes.length;j++) {
					var attribute = my.itemData['item_' + item].attributes[j];
					switch(attribute.name) {
						case 'damage_aura':
							total_attribute += parseInt(attribute.value[0])/100;
							if (sources[item] == undefined) {
								sources[item] = {
									'damage': parseInt(attribute.value[0])/100,
									'damagetype': 'physical',
									'count':1,
									'displayname': my.itemData['item_' + item].displayname
								}							
							}
							else {
								sources[item].count += 1;
							}
						break;
					}
				}
			}
			return { sources: sources, total: total_attribute };
		};
		self.getAttackSpeed = function() {
			var total_attribute = 0;
			for (var i=0; i<self.items().length;i++) {
				var item = self.items()[i].item;
				var isactive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
				if (!self.items()[i].enabled()) continue;
				for (var j=0;j<my.itemData['item_' + item].attributes.length;j++) {
					var attribute = my.itemData['item_' + item].attributes[j];
					switch(attribute.name) {
						case 'bonus_attack_speed':
							total_attribute += parseInt(attribute.value[0]);
						break;
						case 'bonus_speed':
							total_attribute += parseInt(attribute.value[0]);
						break;
						case 'aura_attack_speed':
							if (item != 'shivas_guard') { total_attribute += parseInt(attribute.value[0]); };
						break;
						case 'bonus_aura_attack_speed_pct':
							total_attribute += parseInt(attribute.value[0]);
						break;
						case 'bonus_attack_speed_pct':
							if (isactive) { total_attribute += parseInt(attribute.value[0]); };
						break;
						case 'unholy_bonus_attack_speed':
							if (isactive) { total_attribute += parseInt(attribute.value[0]); };
						break;
						case 'berserk_bonus_attack_speed':
							if (isactive) { total_attribute += parseInt(attribute.value[0]); };
						break;
					}
				}
			}
			return total_attribute;
		};
		self.getLifesteal = function() {
			var total_attribute = 0;
			for (var i=0; i<self.items().length;i++) {
				var item = self.items()[i].item;
				var isactive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
				if (!self.items()[i].enabled()) continue;
				for (var j=0;j<my.itemData['item_' + item].attributes.length;j++) {
					var attribute = my.itemData['item_' + item].attributes[j];
					switch(attribute.name) {
						case 'lifesteal_percent':
							if (item == 'satanic') {
								if (!isactive) { return parseInt(attribute.value[0]); };
							}
							else {
								return parseInt(attribute.value[0]);
							}
						break;
						case 'unholy_lifesteal_percent':
							if (isactive) { return parseInt(attribute.value[0]); };
						break;
					}
				}
			}
			return total_attribute;
		};
		self.getLifestealAura = function() {
			var total_attribute = 0;
			for (var i=0; i<self.items().length;i++) {
				var item = self.items()[i].item;
				var isactive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
				if (!self.items()[i].enabled()) continue;
				for (var j=0;j<my.itemData['item_' + item].attributes.length;j++) {
					var attribute = my.itemData['item_' + item].attributes[j];
					switch(attribute.name) {
						case 'vampiric_aura':
							return parseInt(attribute.value[0]);
						break;
					}
				}
			}
			return total_attribute;
		};
		self.getMagicResist = function() {
			var total_attribute = 0;
			for (var i=0; i<self.items().length;i++) {
				var item = self.items()[i].item;
				var isactive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
				if (!self.items()[i].enabled()) continue;
				for (var j=0;j<my.itemData['item_' + item].attributes.length;j++) {
					var attribute = my.itemData['item_' + item].attributes[j];
					switch(attribute.name) {
						case 'bonus_magical_armor':
							var d = parseInt(attribute.value[0]);
							if (d > total_attribute) { total_attribute = d; };
						break;
						case 'bonus_spell_resist':
							var d = parseInt(attribute.value[0]);
							if (d > total_attribute) { total_attribute = d; };
						break;
						case 'magic_resistance':
							var d = parseInt(attribute.value[0]);
							if (d > total_attribute) { total_attribute = d; };
						break;
					}
				}
			}
			return total_attribute;
		};
		self.getMagicResistReduction = function() {
			var total_attribute = 1;
			for (var i=0; i<self.items().length;i++) {
				var item = self.items()[i].item;
				var isactive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
				if (!self.items()[i].enabled()) continue;
				if (isactive) {
					for (var j=0;j<my.itemData['item_' + item].attributes.length;j++) {
						var attribute = my.itemData['item_' + item].attributes[j];
						switch(attribute.name) {
							case 'ethereal_damage_bonus':
							case 'resist_debuff':
								total_attribute *= (1 - parseInt(attribute.value[0])/100);
							break;
						}
					}
				}
			}
			return total_attribute;
		};		

		self.itemOptions = ko.observableArray([]);
		for (i in my.itemData) {
			self.itemOptions.push(new my.ItemInput(i.replace('item_',''),my.itemData[i].displayname));
		}
	
		return self;
	};

	
	return my;
}(HEROCALCULATOR));