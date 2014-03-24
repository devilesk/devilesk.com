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
		self.headers = ko.observableArray([
			{name: 'Icon', display: ko.observable(true), align: 'center'},
			{name: 'Name', display: ko.observable(true), align: ''},
			{name: 'Primary Stat', display: ko.observable(true), align: 'center'},
			{name: '<abbr title=\"Agility\">Agi</abbr>', display: ko.observable(true), align: 'right'},
			{name: '<abbr title=\"Intelligence\">Int</abbr>', display: ko.observable(true), align: 'right'},
			{name: '<abbr title=\"Strength\">Str</abbr>', display: ko.observable(true), align: 'right'},
			{name: 'Agi Gain', display: ko.observable(false), align: 'right'},
			{name: 'Int Gain', display: ko.observable(false), align: 'right'},
			{name: 'Str Gain', display: ko.observable(false), align: 'right'},
			{name: 'Min Dmg', display: ko.observable(false), align: 'right'},
			{name: 'Max Dmg', display: ko.observable(false), align: 'right'},
			{name: 'Avg Dmg', display: ko.observable(true), align: 'right'},
			{name: 'Armor', display: ko.observable(true), align: 'right'},
			{name: 'HP', display: ko.observable(true), align: 'right'},
			{name: 'HP Regen', display: ko.observable(false), align: 'right'},
			{name: 'Mana', display: ko.observable(true), align: 'right'},
			{name: 'Mana Regen', display: ko.observable(false), align: 'right'},
			{name: 'Atk Type', display: ko.observable(true), align: 'center'},
			{name: 'Atk Range', display: ko.observable(true), align: 'right'},
			{name: 'Atk Rate', display: ko.observable(false), align: 'right'},
			{name: 'Atk Point', display: ko.observable(false), align: 'right'},
			{name: 'Projectile Speed', display: ko.observable(false), align: 'right'},
			{name: 'Day Vision Range', display: ko.observable(false), align: 'right'},
			{name: 'Night Vision Range', display: ko.observable(false), align: 'right'},
			{name: '<abbr title=\"Movement Speed\">MS</abbr>', display: ko.observable(true), align: 'right'},
			{name: 'Turn Rate', display: ko.observable(false), align: 'right'}
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
		self.data = ko.computed(function() {
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
			d.sort(function(a,b) {
				var i = 0;
				while (i < self.sortColumns().length) {
					if (self.sortColumns()[i] > 2 && self.headers()[self.sortColumns()[i]].name != 'Attack Type') {
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
			return d();
		}, this);
		
		self.toggleColumn = function(index,data,event) {
			self.headers()[index()].display(!self.headers()[index()].display())
		};
	}

	var heroData = {};
	$.getJSON("{{ media_url('js/herodata.json') }}", function (data) {
		heroData = data;
		var tableViewModel = new TableViewModel();
		ko.applyBindings(tableViewModel);
	});

});