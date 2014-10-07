$(function () {
	$('.dropdown-menu').click(function(e) {
        e.stopPropagation();
    });

	function getPrimaryStat(h) {
		var v = heroData[h].attributeprimary;
		if (v == 'DOTA_ATTRIBUTE_AGILITY') {
			return 'Agi'
		}
		else if (v == 'DOTA_ATTRIBUTE_INTELLECT') {
			return 'Int'
		}
		else if (v == 'DOTA_ATTRIBUTE_STRENGTH') {
			return 'Str'
		}
		else {
			return ''
		}
	}

	function getTotalAttribute(h, type, level, bonus) {
		var basestat = 0;
		var statgain = 0;
		if (type.toLowerCase() == 'agi') {
			basestat = heroData[h].attributebaseagility
			statgain = heroData[h].attributeagilitygain
		}
		else if (type.toLowerCase()  == 'int') {
			basestat = heroData[h].attributebaseintelligence
			statgain = heroData[h].attributeintelligencegain
		}
		else if (type.toLowerCase()  == 'str') {
			basestat = heroData[h].attributebasestrength
			statgain = heroData[h].attributestrengthgain
		}
		else {
			return 0
		}
		return Math.floor(basestat + statgain * (level - 1) + bonus * 2);
	}

	function TableViewModel() {
		var self = this;
        self.filterVisible = ko.observable(false);
        self.toggleFilterVisibility = function () {
            self.filterVisible(!self.filterVisible());
        }
        self.filterTemplateToUse = function (item) {
            return item.filterType + '-filter';
        }
		self.headers = ko.observableArray([
			{name: 'Icon', display: ko.observable(true), align: 'center', filter: false},
			{name: 'Name', display: ko.observable(true), align: '', filter: true, filterType: 'string', filterValue: ko.observable()},
			{name: 'Primary Stat', display: ko.observable(true), align: 'center', filter: true, filterType: 'select', filterOptions: [{text: 'Agility', value: 'Agi'}, {text: 'Strength', value: 'Str'}, {text: 'Intelligence', value: 'Int'}], filterValue: ko.observable()},
			{name: '<abbr title=\"Agility\">Agi</abbr>', display: ko.observable(true), align: 'right', filter: true, filterType: 'numeric', filterValue: ko.observable(), filterComparison: ko.observable()},
			{name: '<abbr title=\"Intelligence\">Int</abbr>', display: ko.observable(true), align: 'right', filter: true, filterType: 'numeric', filterValue: ko.observable(), filterComparison: ko.observable()},
			{name: '<abbr title=\"Strength\">Str</abbr>', display: ko.observable(true), align: 'right', filter: true, filterType: 'numeric', filterValue: ko.observable(), filterComparison: ko.observable()},
			{name: 'Agi Gain', display: ko.observable(false), align: 'right', filter: true, filterType: 'numeric', filterValue: ko.observable(), filterComparison: ko.observable()},
			{name: 'Int Gain', display: ko.observable(false), align: 'right', filter: true, filterType: 'numeric', filterValue: ko.observable(), filterComparison: ko.observable()},
			{name: 'Str Gain', display: ko.observable(false), align: 'right', filter: true, filterType: 'numeric', filterValue: ko.observable(), filterComparison: ko.observable()},
			{name: 'Min Dmg', display: ko.observable(false), align: 'right', filter: true, filterType: 'numeric', filterValue: ko.observable(), filterComparison: ko.observable()},
			{name: 'Max Dmg', display: ko.observable(false), align: 'right', filter: true, filterType: 'numeric', filterValue: ko.observable(), filterComparison: ko.observable()},
			{name: 'Avg Dmg', display: ko.observable(true), align: 'right', filter: true, filterType: 'numeric', filterValue: ko.observable(), filterComparison: ko.observable()},
			{name: 'Armor', display: ko.observable(true), align: 'right', filter: true, filterType: 'numeric', filterValue: ko.observable(), filterComparison: ko.observable()},
			{name: 'HP', display: ko.observable(true), align: 'right', filter: true, filterType: 'numeric', filterValue: ko.observable(), filterComparison: ko.observable()},
			{name: 'HP Regen', display: ko.observable(false), align: 'right', filter: true, filterType: 'numeric', filterValue: ko.observable(), filterComparison: ko.observable()},
			{name: 'Mana', display: ko.observable(true), align: 'right', filter: true, filterType: 'numeric', filterValue: ko.observable(), filterComparison: ko.observable()},
			{name: 'Mana Regen', display: ko.observable(false), align: 'right', filter: true, filterType: 'numeric', filterValue: ko.observable(), filterComparison: ko.observable()},
			{name: 'Atk Type', display: ko.observable(true), align: 'center', filter: true, filterType: 'select', filterOptions: [{text: 'Ranged', value: 'Ranged'}, {text: 'Melee', value: 'Melee'}], filterValue: ko.observable()},
			{name: 'Atk Range', display: ko.observable(true), align: 'right', filter: true, filterType: 'numeric', filterValue: ko.observable(), filterComparison: ko.observable()},
			{name: 'Atk Rate', display: ko.observable(false), align: 'right', filter: true, filterType: 'numeric', filterValue: ko.observable(), filterComparison: ko.observable()},
			{name: 'Atk Point', display: ko.observable(false), align: 'right', filter: true, filterType: 'numeric', filterValue: ko.observable(), filterComparison: ko.observable()},
			{name: 'Projectile Speed', display: ko.observable(false), align: 'right', filter: true, filterType: 'numeric', filterValue: ko.observable(), filterComparison: ko.observable()},
			{name: 'Day Vision Range', display: ko.observable(false), align: 'right', filter: true, filterType: 'numeric', filterValue: ko.observable(), filterComparison: ko.observable()},
			{name: 'Night Vision Range', display: ko.observable(false), align: 'right', filter: true, filterType: 'numeric', filterValue: ko.observable(), filterComparison: ko.observable()},
			{name: '<abbr title=\"Movement Speed\">MS</abbr>', display: ko.observable(true), align: 'right', filter: true, filterType: 'numeric', filterValue: ko.observable(), filterComparison: ko.observable()},
			{name: 'Turn Rate', display: ko.observable(false), align: 'right', filter: true, filterType: 'numeric', filterValue: ko.observable(), filterComparison: ko.observable()}
		]);
		self.headerHTML = function(index, data) {
			if (self.sortDirections()[index()]() == -1) {
				return "<a href=\"#\">" +  data.name + " <div class=\"glyphicon glyphicon-chevron-down\"></div></a>"
			}
			else if (self.sortDirections()[index()]() == 1) {
				return "<a href=\"#\">" +  data.name + " <div class=\"glyphicon glyphicon-chevron-up\"></div></a>"
			}
			else {
				return ""
			}
		}
		self.multiSort = ko.observable(false);
		self.level = ko.observable(1);
		self.bonus = ko.observable(0);
		self.sortDirections = ko.observableArray([]);
		self.initSortDirections = function() {
			for (var i=0;i<self.headers().length;i++) {
				self.sortDirections.push(new ko.observable(1));
			}
		}
		self.initSortDirections();
		self.sortColumn = ko.observable(1);
		self.columnClick = function(index, data, event) {
			self.sortDirections()[index()](-1 * self.sortDirections()[index()]());
			if (self.sortColumns.indexOf(index()) < 0) {
				if (event.shiftKey || self.multiSort()) {
					self.sortColumns.push(index());
				}
				else {
					self.sortColumns.removeAll();
					self.sortColumns.push(index());
				}
			}
			self.sortColumn(index());
		};

		self.sortColumns = ko.observableArray([]);
		self.sortLabelClick = function(index, data, event) {
			self.sortColumns.remove(data);
		};
		self.labelHTML = function(index, data) {
			if (self.sortDirections()[self.sortColumns()[index()]]() == -1) {
				return "<a href=\"#\">" +  data.name + "</a>"
			}
			else if (self.sortDirections()[self.sortColumns()[index()]]() == 1) {
				return "<a href=\"#\">" +  data.name + "</a>"
			}
			else {
				return ""
			}
		}
		self.sortColumns.push(1);
		self.data_cache = ko.computed(function() {
			var d = ko.observableArray([]);
			for (h in heroData) {
				var row = []
				//row.push('<img src=\'/dota2/images/heroes/' + h.replace('npc_dota_hero_','') + '.png\' />');
				row.push('<div class="portraitsprite portraitsprite-' + h.replace('npc_dota_hero_','') + '"></div>');
				row.push(heroData[h].displayname);
				row.push(getPrimaryStat(h));
				row.push(getTotalAttribute(h,'agi', self.level(), self.bonus()).toPrecision(3));
				row.push(getTotalAttribute(h,'int', self.level(), self.bonus()).toPrecision(3));
				row.push(getTotalAttribute(h,'str', self.level(), self.bonus()).toPrecision(3));
				row.push(heroData[h].attributeagilitygain);
				row.push(heroData[h].attributeintelligencegain);
				row.push(heroData[h].attributestrengthgain);

				row.push((heroData[h].attackdamagemin + getTotalAttribute(h,getPrimaryStat(h), self.level(), self.bonus())).toPrecision(3));
				row.push((heroData[h].attackdamagemax + getTotalAttribute(h,getPrimaryStat(h), self.level(), self.bonus())).toPrecision(3));
				row.push(((heroData[h].attackdamagemax-heroData[h].attackdamagemin)/2 + getTotalAttribute(h,getPrimaryStat(h), self.level(), self.bonus()) + heroData[h].attackdamagemin).toPrecision(3));
				row.push((heroData[h].armorphysical + getTotalAttribute(h,'agi', self.level(), self.bonus())*.14).toPrecision(3));
				row.push((heroData[h].statushealth + getTotalAttribute(h,'str', self.level(), self.bonus())*19).toPrecision(4));
				row.push((heroData[h].statushealthregen + getTotalAttribute(h,'str', self.level(), self.bonus())*.03).toPrecision(3));
				row.push((heroData[h].statusmana + getTotalAttribute(h,'int', self.level(), self.bonus())*13).toPrecision(4));
				row.push((heroData[h].statusmanaregen + getTotalAttribute(h,'int', self.level(), self.bonus())*.04).toPrecision(3));
				if (heroData[h].attacktype == 'DOTA_UNIT_CAP_MELEE_ATTACK') {
					row.push('Melee');
				}
				else {
					row.push('Ranged');
				}
				row.push(heroData[h].attackrange);
				row.push(heroData[h].attackrate);
				row.push(heroData[h].attackpoint);
				row.push(heroData[h].projectilespeed);
				row.push(heroData[h].visiondaytimerange);
				row.push(heroData[h].visionnighttimerange);
				row.push(heroData[h].movementspeed);
				row.push(heroData[h].movementturnrate);
				
				d.push(row);
			}
			return d;
		});
		self.data = ko.computed(function() {
			var d = self.data_cache();
			d.sort(function(a,b) {
				var i = 0;
				while (i < self.sortColumns().length) {
					if (self.sortColumns()[i] > 2 && self.headers()[self.sortColumns()[i]].name != 'Atk Type') {
						if (parseFloat(a[self.sortColumns()[i]]) > parseFloat(b[self.sortColumns()[i]])) return 1 * self.sortDirections()[self.sortColumns()[i]]();
						if (parseFloat(a[self.sortColumns()[i]]) < parseFloat(b[self.sortColumns()[i]])) return -1 * self.sortDirections()[self.sortColumns()[i]]();
					}
					else {
						if (a[self.sortColumns()[i]] > b[self.sortColumns()[i]]) return 1 * self.sortDirections()[self.sortColumns()[i]]();
						if (a[self.sortColumns()[i]] < b[self.sortColumns()[i]]) return -1 * self.sortDirections()[self.sortColumns()[i]]();
					}
					i += 1;
				}
				return 0;
			});
            var filtered = _.filter(d(), function(row) {
                return _.every(row, function(item, i) {
                    if (!self.headers()[i].filter) return true;
                    if (!self.headers()[i].filterValue()) return true;
                    switch (self.headers()[i].filterType) {
                        case 'numeric':
                            switch (self.headers()[i].filterComparison()) {
                                case 'gt':
                                    return parseFloat(item) > parseFloat(self.headers()[i].filterValue());
                                break;
                                case 'lt':
                                    return parseFloat(item) < parseFloat(self.headers()[i].filterValue());
                                break;
                                case 'eq':
                                    return parseFloat(item) == parseFloat(self.headers()[i].filterValue());
                                break;
                            }
                        break;
                        case 'string':
                            return item.toLowerCase().indexOf(self.headers()[i].filterValue().toLowerCase()) != -1;
                        break;
                        case 'select':
                            return item == self.headers()[i].filterValue();
                        break;
                    }
                    return self.headers()[i].filter;
                });
            });
			return filtered;
		}, this);
		
		self.toggleColumn = function(index,data,event) {
			self.headers()[index()].display(!self.headers()[index()].display())
		};
	}

	var heroData = {};
	$.getJSON("/media/js/herodata.json", function (data) {
		heroData = data;
		var tableViewModel = new TableViewModel();
		ko.applyBindings(tableViewModel);
	});

});