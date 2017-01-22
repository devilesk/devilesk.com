var $ = jQuery = require('jquery');
require('bootstrap');
var KTLIB = require('../ktlib');

$(function() {
  var attributes = KTLIB.attributes;
  var attributeOptions = KTLIB.attributeOptions;
  var attributeModifiers = KTLIB.attributeModifiers;

  KTLIB.init(function(heroData) {
    $('.dropdown-menu').click(function(e) {
      e.stopPropagation();
    });

    function getPrimaryStat(h) {
      var v = heroData[h].attributeprimary;
      if (v == 'DOTA_ATTRIBUTE_AGILITY') {
        return 'Agi'
      } else if (v == 'DOTA_ATTRIBUTE_INTELLECT') {
        return 'Int'
      } else if (v == 'DOTA_ATTRIBUTE_STRENGTH') {
        return 'Str'
      } else {
        return ''
      }
    }

    function TableViewModel() {
      var self = this;
      self.filterVisible = ko.observable(false);
      self.toggleFilterVisibility = function() {
        self.filterVisible(!self.filterVisible());
      }
      self.filterTemplateToUse = function(item) {
        return item.filterType + '-filter';
      }
      self.headers = ko.observableArray([{
        name: 'Icon',
        display: ko.observable(true),
        align: 'center',
        filter: false
      }, {
        name: 'Name',
        display: ko.observable(true),
        align: '',
        filter: true,
        filterType: 'string',
        filterValue: ko.observable()
      }, {
        name: 'Primary Stat',
        display: ko.observable(true),
        align: 'center',
        filter: true,
        filterType: 'select',
        filterOptions: [{
          text: 'Agility',
          value: 'Agi'
        }, {
          text: 'Strength',
          value: 'Str'
        }, {
          text: 'Intelligence',
          value: 'Int'
        }],
        filterValue: ko.observable()
      }, {
        name: '<abbr title=\"Agility\">Agi</abbr>',
        display: ko.observable(true),
        align: 'right',
        filter: true,
        filterType: 'numeric',
        filterValue: ko.observable(),
        filterComparison: ko.observable()
      }, {
        name: '<abbr title=\"Intelligence\">Int</abbr>',
        display: ko.observable(true),
        align: 'right',
        filter: true,
        filterType: 'numeric',
        filterValue: ko.observable(),
        filterComparison: ko.observable()
      }, {
        name: '<abbr title=\"Strength\">Str</abbr>',
        display: ko.observable(true),
        align: 'right',
        filter: true,
        filterType: 'numeric',
        filterValue: ko.observable(),
        filterComparison: ko.observable()
      }, {
        name: 'Agi Gain',
        display: ko.observable(false),
        align: 'right',
        filter: true,
        filterType: 'numeric',
        filterValue: ko.observable(),
        filterComparison: ko.observable()
      }, {
        name: 'Int Gain',
        display: ko.observable(false),
        align: 'right',
        filter: true,
        filterType: 'numeric',
        filterValue: ko.observable(),
        filterComparison: ko.observable()
      }, {
        name: 'Str Gain',
        display: ko.observable(false),
        align: 'right',
        filter: true,
        filterType: 'numeric',
        filterValue: ko.observable(),
        filterComparison: ko.observable()
      }, {
        name: 'Min Dmg',
        display: ko.observable(false),
        align: 'right',
        filter: true,
        filterType: 'numeric',
        filterValue: ko.observable(),
        filterComparison: ko.observable()
      }, {
        name: 'Max Dmg',
        display: ko.observable(false),
        align: 'right',
        filter: true,
        filterType: 'numeric',
        filterValue: ko.observable(),
        filterComparison: ko.observable()
      }, {
        name: 'Avg Dmg',
        display: ko.observable(true),
        align: 'right',
        filter: true,
        filterType: 'numeric',
        filterValue: ko.observable(),
        filterComparison: ko.observable()
      }, {
        name: 'Armor',
        display: ko.observable(true),
        align: 'right',
        filter: true,
        filterType: 'numeric',
        filterValue: ko.observable(),
        filterComparison: ko.observable()
      }, {
        name: 'EHP',
        display: ko.observable(true),
        align: 'right',
        filter: true,
        filterType: 'numeric',
        filterValue: ko.observable(),
        filterComparison: ko.observable()
      }, {
        name: 'EHP Magic',
        display: ko.observable(false),
        align: 'right',
        filter: true,
        filterType: 'numeric',
        filterValue: ko.observable(),
        filterComparison: ko.observable()
      }, {
        name: 'HP',
        display: ko.observable(true),
        align: 'right',
        filter: true,
        filterType: 'numeric',
        filterValue: ko.observable(),
        filterComparison: ko.observable()
      }, {
        name: 'HP Regen',
        display: ko.observable(false),
        align: 'right',
        filter: true,
        filterType: 'numeric',
        filterValue: ko.observable(),
        filterComparison: ko.observable()
      }, {
        name: 'Mana',
        display: ko.observable(true),
        align: 'right',
        filter: true,
        filterType: 'numeric',
        filterValue: ko.observable(),
        filterComparison: ko.observable()
      }, {
        name: 'Mana Regen',
        display: ko.observable(false),
        align: 'right',
        filter: true,
        filterType: 'numeric',
        filterValue: ko.observable(),
        filterComparison: ko.observable()
      }, {
        name: 'Atk Type',
        display: ko.observable(true),
        align: 'center',
        filter: true,
        filterType: 'select',
        filterOptions: [{
          text: 'Ranged',
          value: 'Ranged'
        }, {
          text: 'Melee',
          value: 'Melee'
        }],
        filterValue: ko.observable()
      }, {
        name: 'Atk Range',
        display: ko.observable(true),
        align: 'right',
        filter: true,
        filterType: 'numeric',
        filterValue: ko.observable(),
        filterComparison: ko.observable()
      }, {
        name: '<abbr title=\"Base Attack Time\">BAT</abbr>',
        display: ko.observable(false),
        align: 'right',
        filter: true,
        filterType: 'numeric',
        filterValue: ko.observable(),
        filterComparison: ko.observable()
      }, {
        name: 'Atk Point',
        display: ko.observable(false),
        align: 'right',
        filter: true,
        filterType: 'numeric',
        filterValue: ko.observable(),
        filterComparison: ko.observable()
      }, {
        name: 'Projectile Speed',
        display: ko.observable(false),
        align: 'right',
        filter: true,
        filterType: 'numeric',
        filterValue: ko.observable(),
        filterComparison: ko.observable()
      }, {
        name: 'Day Vision Range',
        display: ko.observable(false),
        align: 'right',
        filter: true,
        filterType: 'numeric',
        filterValue: ko.observable(),
        filterComparison: ko.observable()
      }, {
        name: 'Night Vision Range',
        display: ko.observable(false),
        align: 'right',
        filter: true,
        filterType: 'numeric',
        filterValue: ko.observable(),
        filterComparison: ko.observable()
      }, {
        name: '<abbr title=\"Movement Speed\">MS</abbr>',
        display: ko.observable(true),
        align: 'right',
        filter: true,
        filterType: 'numeric',
        filterValue: ko.observable(),
        filterComparison: ko.observable()
      }, {
        name: 'Turn Rate',
        display: ko.observable(false),
        align: 'right',
        filter: true,
        filterType: 'numeric',
        filterValue: ko.observable(),
        filterComparison: ko.observable()
      }]);
      for (var i = 0; i < self.headers().length; i++) {
        self.headers()[i].defaultDisplay = ko.observable(self.headers()[i].display());
      }
      self.headerHTML = function(index, data) {
        if (self.sortDirections()[index()]() == -1) {
          return "<a href=\"#\">" + data.name + " <div class=\"glyphicon glyphicon-chevron-down\"></div></a>"
        } else if (self.sortDirections()[index()]() == 1) {
          return "<a href=\"#\">" + data.name + " <div class=\"glyphicon glyphicon-chevron-up\"></div></a>"
        } else {
          return ""
        }
      }
      self.multiSort = ko.observable(false);
      self.level = ko.observable(1);
      self.bonus = ko.observable(0);
      self.sortDirections = ko.observableArray([]);
      self.initSortDirections = function() {
        for (var i = 0; i < self.headers().length; i++) {
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
          } else {
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
          return "<a href=\"#\">" + data.name + "</a>"
        } else if (self.sortDirections()[self.sortColumns()[index()]]() == 1) {
          return "<a href=\"#\">" + data.name + "</a>"
        } else {
          return ""
        }
      }
      self.clearLabels = function() {
        self.sortColumns.removeAll();
      }
      self.clearFilters = function() {
        for (var i = 0; i < self.headers().length; i++) {
          if (self.headers()[i].filterValue != undefined) {
            self.headers()[i].filterValue(null);
          }
        }
      }
      self.hideAllColumns = function() {
        for (var i = 0; i < self.headers().length; i++) {
          self.headers()[i].display(false);
        }
      }
      self.resetColumns = function() {
        for (var i = 0; i < self.headers().length; i++) {
          self.headers()[i].display(self.headers()[i].defaultDisplay());
        }
      }
      self.sortColumns.push(1);
      self.data_cache = ko.computed(function() {
        var d = ko.observableArray([]),
          row, agiTotal, intTotal, strTotal, primaryTotal;
        for (h in heroData) {
          var row = [],
            hData = heroData[h],
            agiTotal = attributeModifiers.agility.call(hData, self.level(), self.bonus()),
            intTotal = attributeModifiers.intelligence.call(hData, self.level(), self.bonus()),
            strTotal = attributeModifiers.strength.call(hData, self.level(), self.bonus()),
            primaryTotal = KTLIB.getAttributeAtLevel.call(hData, hData.attributeprimary, self.level(), self.bonus());
          row.push('<div class="heroes-sprite-' + h.replace('npc_dota_hero_', '') + ' heroes-sprite-32x18"></div>');
          row.push(heroData[h].displayname);
          row.push(getPrimaryStat(h));
          row.push(agiTotal.toPrecision(3));
          row.push(intTotal.toPrecision(3));
          row.push(strTotal.toPrecision(3));
          row.push(heroData[h].attributeagilitygain);
          row.push(heroData[h].attributeintelligencegain);
          row.push(heroData[h].attributestrengthgain);

          row.push(attributeModifiers.attackdamagemin.call(hData, self.level(), self.bonus()).toPrecision(3));
          row.push(attributeModifiers.attackdamagemax.call(hData, self.level(), self.bonus()).toPrecision(3));
          row.push(attributeModifiers.attackdamageavg.call(hData, self.level(), self.bonus()).toPrecision(3));
          row.push(attributeModifiers.armorphysical.call(hData, self.level(), self.bonus()).toPrecision(3));
          row.push(attributeModifiers.ehp.call(hData, self.level(), self.bonus()).toPrecision(4));
          row.push(attributeModifiers.mehp.call(hData, self.level(), self.bonus()).toPrecision(4));
          row.push(attributeModifiers.statushealth.call(hData, self.level(), self.bonus()).toPrecision(4));
          row.push(attributeModifiers.statushealthregen.call(hData, self.level(), self.bonus()).toPrecision(3));
          row.push(attributeModifiers.statusmana.call(hData, self.level(), self.bonus()).toPrecision(4));
          row.push(attributeModifiers.statusmanaregen.call(hData, self.level(), self.bonus()).toPrecision(3));
          if (heroData[h].attacktype == 'DOTA_UNIT_CAP_MELEE_ATTACK') {
            row.push('Melee');
          } else {
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
        d.sort(function(a, b) {
          var i = 0;
          while (i < self.sortColumns().length) {
            if (self.sortColumns()[i] > 2 && self.headers()[self.sortColumns()[i]].name != 'Atk Type') {
              if (parseFloat(a[self.sortColumns()[i]]) > parseFloat(b[self.sortColumns()[i]])) return 1 * self.sortDirections()[self.sortColumns()[i]]();
              if (parseFloat(a[self.sortColumns()[i]]) < parseFloat(b[self.sortColumns()[i]])) return -1 * self.sortDirections()[self.sortColumns()[i]]();
            } else {
              if (a[self.sortColumns()[i]] > b[self.sortColumns()[i]]) return 1 * self.sortDirections()[self.sortColumns()[i]]();
              if (a[self.sortColumns()[i]] < b[self.sortColumns()[i]]) return -1 * self.sortDirections()[self.sortColumns()[i]]();
            }
            i += 1;
          }
          return 0;
        });
        return d().filter(function(row) {
          return row.every(function(item, i) {
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
                  case 'ge':
                    return parseFloat(item) >= parseFloat(self.headers()[i].filterValue());
                    break;
                  case 'le':
                    return parseFloat(item) <= parseFloat(self.headers()[i].filterValue());
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
      }, this);

      self.toggleColumn = function(index, data, event) {
        self.headers()[index()].display(!self.headers()[index()].display())
      };
    }

    ko.applyBindings(new TableViewModel());
    /*$.getJSON("/media/js/herodata.json", function (data) {
      heroData = data;
      ko.applyBindings(new TableViewModel());
    });*/
  });

});