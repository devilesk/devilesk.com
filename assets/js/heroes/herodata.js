require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({33:[function(require,module,exports){
var $ = jQuery = require('jquery');
//require('bootstrap');
//var KTLIB = require('../ktlib');

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
},{"jquery":16}]},{},[33])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvaGVyb2VzL2hlcm9kYXRhLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgJCA9IGpRdWVyeSA9IHJlcXVpcmUoJ2pxdWVyeScpO1xuLy9yZXF1aXJlKCdib290c3RyYXAnKTtcbi8vdmFyIEtUTElCID0gcmVxdWlyZSgnLi4va3RsaWInKTtcblxuJChmdW5jdGlvbigpIHtcbiAgdmFyIGF0dHJpYnV0ZXMgPSBLVExJQi5hdHRyaWJ1dGVzO1xuICB2YXIgYXR0cmlidXRlT3B0aW9ucyA9IEtUTElCLmF0dHJpYnV0ZU9wdGlvbnM7XG4gIHZhciBhdHRyaWJ1dGVNb2RpZmllcnMgPSBLVExJQi5hdHRyaWJ1dGVNb2RpZmllcnM7XG5cbiAgS1RMSUIuaW5pdChmdW5jdGlvbihoZXJvRGF0YSkge1xuICAgICQoJy5kcm9wZG93bi1tZW51JykuY2xpY2soZnVuY3Rpb24oZSkge1xuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICB9KTtcblxuICAgIGZ1bmN0aW9uIGdldFByaW1hcnlTdGF0KGgpIHtcbiAgICAgIHZhciB2ID0gaGVyb0RhdGFbaF0uYXR0cmlidXRlcHJpbWFyeTtcbiAgICAgIGlmICh2ID09ICdET1RBX0FUVFJJQlVURV9BR0lMSVRZJykge1xuICAgICAgICByZXR1cm4gJ0FnaSdcbiAgICAgIH0gZWxzZSBpZiAodiA9PSAnRE9UQV9BVFRSSUJVVEVfSU5URUxMRUNUJykge1xuICAgICAgICByZXR1cm4gJ0ludCdcbiAgICAgIH0gZWxzZSBpZiAodiA9PSAnRE9UQV9BVFRSSUJVVEVfU1RSRU5HVEgnKSB7XG4gICAgICAgIHJldHVybiAnU3RyJ1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuICcnXG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gVGFibGVWaWV3TW9kZWwoKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICBzZWxmLmZpbHRlclZpc2libGUgPSBrby5vYnNlcnZhYmxlKGZhbHNlKTtcbiAgICAgIHNlbGYudG9nZ2xlRmlsdGVyVmlzaWJpbGl0eSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBzZWxmLmZpbHRlclZpc2libGUoIXNlbGYuZmlsdGVyVmlzaWJsZSgpKTtcbiAgICAgIH1cbiAgICAgIHNlbGYuZmlsdGVyVGVtcGxhdGVUb1VzZSA9IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgcmV0dXJuIGl0ZW0uZmlsdGVyVHlwZSArICctZmlsdGVyJztcbiAgICAgIH1cbiAgICAgIHNlbGYuaGVhZGVycyA9IGtvLm9ic2VydmFibGVBcnJheShbe1xuICAgICAgICBuYW1lOiAnSWNvbicsXG4gICAgICAgIGRpc3BsYXk6IGtvLm9ic2VydmFibGUodHJ1ZSksXG4gICAgICAgIGFsaWduOiAnY2VudGVyJyxcbiAgICAgICAgZmlsdGVyOiBmYWxzZVxuICAgICAgfSwge1xuICAgICAgICBuYW1lOiAnTmFtZScsXG4gICAgICAgIGRpc3BsYXk6IGtvLm9ic2VydmFibGUodHJ1ZSksXG4gICAgICAgIGFsaWduOiAnJyxcbiAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICBmaWx0ZXJUeXBlOiAnc3RyaW5nJyxcbiAgICAgICAgZmlsdGVyVmFsdWU6IGtvLm9ic2VydmFibGUoKVxuICAgICAgfSwge1xuICAgICAgICBuYW1lOiAnUHJpbWFyeSBTdGF0JyxcbiAgICAgICAgZGlzcGxheToga28ub2JzZXJ2YWJsZSh0cnVlKSxcbiAgICAgICAgYWxpZ246ICdjZW50ZXInLFxuICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgIGZpbHRlclR5cGU6ICdzZWxlY3QnLFxuICAgICAgICBmaWx0ZXJPcHRpb25zOiBbe1xuICAgICAgICAgIHRleHQ6ICdBZ2lsaXR5JyxcbiAgICAgICAgICB2YWx1ZTogJ0FnaSdcbiAgICAgICAgfSwge1xuICAgICAgICAgIHRleHQ6ICdTdHJlbmd0aCcsXG4gICAgICAgICAgdmFsdWU6ICdTdHInXG4gICAgICAgIH0sIHtcbiAgICAgICAgICB0ZXh0OiAnSW50ZWxsaWdlbmNlJyxcbiAgICAgICAgICB2YWx1ZTogJ0ludCdcbiAgICAgICAgfV0sXG4gICAgICAgIGZpbHRlclZhbHVlOiBrby5vYnNlcnZhYmxlKClcbiAgICAgIH0sIHtcbiAgICAgICAgbmFtZTogJzxhYmJyIHRpdGxlPVxcXCJBZ2lsaXR5XFxcIj5BZ2k8L2FiYnI+JyxcbiAgICAgICAgZGlzcGxheToga28ub2JzZXJ2YWJsZSh0cnVlKSxcbiAgICAgICAgYWxpZ246ICdyaWdodCcsXG4gICAgICAgIGZpbHRlcjogdHJ1ZSxcbiAgICAgICAgZmlsdGVyVHlwZTogJ251bWVyaWMnLFxuICAgICAgICBmaWx0ZXJWYWx1ZToga28ub2JzZXJ2YWJsZSgpLFxuICAgICAgICBmaWx0ZXJDb21wYXJpc29uOiBrby5vYnNlcnZhYmxlKClcbiAgICAgIH0sIHtcbiAgICAgICAgbmFtZTogJzxhYmJyIHRpdGxlPVxcXCJJbnRlbGxpZ2VuY2VcXFwiPkludDwvYWJicj4nLFxuICAgICAgICBkaXNwbGF5OiBrby5vYnNlcnZhYmxlKHRydWUpLFxuICAgICAgICBhbGlnbjogJ3JpZ2h0JyxcbiAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICBmaWx0ZXJUeXBlOiAnbnVtZXJpYycsXG4gICAgICAgIGZpbHRlclZhbHVlOiBrby5vYnNlcnZhYmxlKCksXG4gICAgICAgIGZpbHRlckNvbXBhcmlzb246IGtvLm9ic2VydmFibGUoKVxuICAgICAgfSwge1xuICAgICAgICBuYW1lOiAnPGFiYnIgdGl0bGU9XFxcIlN0cmVuZ3RoXFxcIj5TdHI8L2FiYnI+JyxcbiAgICAgICAgZGlzcGxheToga28ub2JzZXJ2YWJsZSh0cnVlKSxcbiAgICAgICAgYWxpZ246ICdyaWdodCcsXG4gICAgICAgIGZpbHRlcjogdHJ1ZSxcbiAgICAgICAgZmlsdGVyVHlwZTogJ251bWVyaWMnLFxuICAgICAgICBmaWx0ZXJWYWx1ZToga28ub2JzZXJ2YWJsZSgpLFxuICAgICAgICBmaWx0ZXJDb21wYXJpc29uOiBrby5vYnNlcnZhYmxlKClcbiAgICAgIH0sIHtcbiAgICAgICAgbmFtZTogJ0FnaSBHYWluJyxcbiAgICAgICAgZGlzcGxheToga28ub2JzZXJ2YWJsZShmYWxzZSksXG4gICAgICAgIGFsaWduOiAncmlnaHQnLFxuICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgIGZpbHRlclR5cGU6ICdudW1lcmljJyxcbiAgICAgICAgZmlsdGVyVmFsdWU6IGtvLm9ic2VydmFibGUoKSxcbiAgICAgICAgZmlsdGVyQ29tcGFyaXNvbjoga28ub2JzZXJ2YWJsZSgpXG4gICAgICB9LCB7XG4gICAgICAgIG5hbWU6ICdJbnQgR2FpbicsXG4gICAgICAgIGRpc3BsYXk6IGtvLm9ic2VydmFibGUoZmFsc2UpLFxuICAgICAgICBhbGlnbjogJ3JpZ2h0JyxcbiAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICBmaWx0ZXJUeXBlOiAnbnVtZXJpYycsXG4gICAgICAgIGZpbHRlclZhbHVlOiBrby5vYnNlcnZhYmxlKCksXG4gICAgICAgIGZpbHRlckNvbXBhcmlzb246IGtvLm9ic2VydmFibGUoKVxuICAgICAgfSwge1xuICAgICAgICBuYW1lOiAnU3RyIEdhaW4nLFxuICAgICAgICBkaXNwbGF5OiBrby5vYnNlcnZhYmxlKGZhbHNlKSxcbiAgICAgICAgYWxpZ246ICdyaWdodCcsXG4gICAgICAgIGZpbHRlcjogdHJ1ZSxcbiAgICAgICAgZmlsdGVyVHlwZTogJ251bWVyaWMnLFxuICAgICAgICBmaWx0ZXJWYWx1ZToga28ub2JzZXJ2YWJsZSgpLFxuICAgICAgICBmaWx0ZXJDb21wYXJpc29uOiBrby5vYnNlcnZhYmxlKClcbiAgICAgIH0sIHtcbiAgICAgICAgbmFtZTogJ01pbiBEbWcnLFxuICAgICAgICBkaXNwbGF5OiBrby5vYnNlcnZhYmxlKGZhbHNlKSxcbiAgICAgICAgYWxpZ246ICdyaWdodCcsXG4gICAgICAgIGZpbHRlcjogdHJ1ZSxcbiAgICAgICAgZmlsdGVyVHlwZTogJ251bWVyaWMnLFxuICAgICAgICBmaWx0ZXJWYWx1ZToga28ub2JzZXJ2YWJsZSgpLFxuICAgICAgICBmaWx0ZXJDb21wYXJpc29uOiBrby5vYnNlcnZhYmxlKClcbiAgICAgIH0sIHtcbiAgICAgICAgbmFtZTogJ01heCBEbWcnLFxuICAgICAgICBkaXNwbGF5OiBrby5vYnNlcnZhYmxlKGZhbHNlKSxcbiAgICAgICAgYWxpZ246ICdyaWdodCcsXG4gICAgICAgIGZpbHRlcjogdHJ1ZSxcbiAgICAgICAgZmlsdGVyVHlwZTogJ251bWVyaWMnLFxuICAgICAgICBmaWx0ZXJWYWx1ZToga28ub2JzZXJ2YWJsZSgpLFxuICAgICAgICBmaWx0ZXJDb21wYXJpc29uOiBrby5vYnNlcnZhYmxlKClcbiAgICAgIH0sIHtcbiAgICAgICAgbmFtZTogJ0F2ZyBEbWcnLFxuICAgICAgICBkaXNwbGF5OiBrby5vYnNlcnZhYmxlKHRydWUpLFxuICAgICAgICBhbGlnbjogJ3JpZ2h0JyxcbiAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICBmaWx0ZXJUeXBlOiAnbnVtZXJpYycsXG4gICAgICAgIGZpbHRlclZhbHVlOiBrby5vYnNlcnZhYmxlKCksXG4gICAgICAgIGZpbHRlckNvbXBhcmlzb246IGtvLm9ic2VydmFibGUoKVxuICAgICAgfSwge1xuICAgICAgICBuYW1lOiAnQXJtb3InLFxuICAgICAgICBkaXNwbGF5OiBrby5vYnNlcnZhYmxlKHRydWUpLFxuICAgICAgICBhbGlnbjogJ3JpZ2h0JyxcbiAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICBmaWx0ZXJUeXBlOiAnbnVtZXJpYycsXG4gICAgICAgIGZpbHRlclZhbHVlOiBrby5vYnNlcnZhYmxlKCksXG4gICAgICAgIGZpbHRlckNvbXBhcmlzb246IGtvLm9ic2VydmFibGUoKVxuICAgICAgfSwge1xuICAgICAgICBuYW1lOiAnRUhQJyxcbiAgICAgICAgZGlzcGxheToga28ub2JzZXJ2YWJsZSh0cnVlKSxcbiAgICAgICAgYWxpZ246ICdyaWdodCcsXG4gICAgICAgIGZpbHRlcjogdHJ1ZSxcbiAgICAgICAgZmlsdGVyVHlwZTogJ251bWVyaWMnLFxuICAgICAgICBmaWx0ZXJWYWx1ZToga28ub2JzZXJ2YWJsZSgpLFxuICAgICAgICBmaWx0ZXJDb21wYXJpc29uOiBrby5vYnNlcnZhYmxlKClcbiAgICAgIH0sIHtcbiAgICAgICAgbmFtZTogJ0VIUCBNYWdpYycsXG4gICAgICAgIGRpc3BsYXk6IGtvLm9ic2VydmFibGUoZmFsc2UpLFxuICAgICAgICBhbGlnbjogJ3JpZ2h0JyxcbiAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICBmaWx0ZXJUeXBlOiAnbnVtZXJpYycsXG4gICAgICAgIGZpbHRlclZhbHVlOiBrby5vYnNlcnZhYmxlKCksXG4gICAgICAgIGZpbHRlckNvbXBhcmlzb246IGtvLm9ic2VydmFibGUoKVxuICAgICAgfSwge1xuICAgICAgICBuYW1lOiAnSFAnLFxuICAgICAgICBkaXNwbGF5OiBrby5vYnNlcnZhYmxlKHRydWUpLFxuICAgICAgICBhbGlnbjogJ3JpZ2h0JyxcbiAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICBmaWx0ZXJUeXBlOiAnbnVtZXJpYycsXG4gICAgICAgIGZpbHRlclZhbHVlOiBrby5vYnNlcnZhYmxlKCksXG4gICAgICAgIGZpbHRlckNvbXBhcmlzb246IGtvLm9ic2VydmFibGUoKVxuICAgICAgfSwge1xuICAgICAgICBuYW1lOiAnSFAgUmVnZW4nLFxuICAgICAgICBkaXNwbGF5OiBrby5vYnNlcnZhYmxlKGZhbHNlKSxcbiAgICAgICAgYWxpZ246ICdyaWdodCcsXG4gICAgICAgIGZpbHRlcjogdHJ1ZSxcbiAgICAgICAgZmlsdGVyVHlwZTogJ251bWVyaWMnLFxuICAgICAgICBmaWx0ZXJWYWx1ZToga28ub2JzZXJ2YWJsZSgpLFxuICAgICAgICBmaWx0ZXJDb21wYXJpc29uOiBrby5vYnNlcnZhYmxlKClcbiAgICAgIH0sIHtcbiAgICAgICAgbmFtZTogJ01hbmEnLFxuICAgICAgICBkaXNwbGF5OiBrby5vYnNlcnZhYmxlKHRydWUpLFxuICAgICAgICBhbGlnbjogJ3JpZ2h0JyxcbiAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICBmaWx0ZXJUeXBlOiAnbnVtZXJpYycsXG4gICAgICAgIGZpbHRlclZhbHVlOiBrby5vYnNlcnZhYmxlKCksXG4gICAgICAgIGZpbHRlckNvbXBhcmlzb246IGtvLm9ic2VydmFibGUoKVxuICAgICAgfSwge1xuICAgICAgICBuYW1lOiAnTWFuYSBSZWdlbicsXG4gICAgICAgIGRpc3BsYXk6IGtvLm9ic2VydmFibGUoZmFsc2UpLFxuICAgICAgICBhbGlnbjogJ3JpZ2h0JyxcbiAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICBmaWx0ZXJUeXBlOiAnbnVtZXJpYycsXG4gICAgICAgIGZpbHRlclZhbHVlOiBrby5vYnNlcnZhYmxlKCksXG4gICAgICAgIGZpbHRlckNvbXBhcmlzb246IGtvLm9ic2VydmFibGUoKVxuICAgICAgfSwge1xuICAgICAgICBuYW1lOiAnQXRrIFR5cGUnLFxuICAgICAgICBkaXNwbGF5OiBrby5vYnNlcnZhYmxlKHRydWUpLFxuICAgICAgICBhbGlnbjogJ2NlbnRlcicsXG4gICAgICAgIGZpbHRlcjogdHJ1ZSxcbiAgICAgICAgZmlsdGVyVHlwZTogJ3NlbGVjdCcsXG4gICAgICAgIGZpbHRlck9wdGlvbnM6IFt7XG4gICAgICAgICAgdGV4dDogJ1JhbmdlZCcsXG4gICAgICAgICAgdmFsdWU6ICdSYW5nZWQnXG4gICAgICAgIH0sIHtcbiAgICAgICAgICB0ZXh0OiAnTWVsZWUnLFxuICAgICAgICAgIHZhbHVlOiAnTWVsZWUnXG4gICAgICAgIH1dLFxuICAgICAgICBmaWx0ZXJWYWx1ZToga28ub2JzZXJ2YWJsZSgpXG4gICAgICB9LCB7XG4gICAgICAgIG5hbWU6ICdBdGsgUmFuZ2UnLFxuICAgICAgICBkaXNwbGF5OiBrby5vYnNlcnZhYmxlKHRydWUpLFxuICAgICAgICBhbGlnbjogJ3JpZ2h0JyxcbiAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICBmaWx0ZXJUeXBlOiAnbnVtZXJpYycsXG4gICAgICAgIGZpbHRlclZhbHVlOiBrby5vYnNlcnZhYmxlKCksXG4gICAgICAgIGZpbHRlckNvbXBhcmlzb246IGtvLm9ic2VydmFibGUoKVxuICAgICAgfSwge1xuICAgICAgICBuYW1lOiAnPGFiYnIgdGl0bGU9XFxcIkJhc2UgQXR0YWNrIFRpbWVcXFwiPkJBVDwvYWJicj4nLFxuICAgICAgICBkaXNwbGF5OiBrby5vYnNlcnZhYmxlKGZhbHNlKSxcbiAgICAgICAgYWxpZ246ICdyaWdodCcsXG4gICAgICAgIGZpbHRlcjogdHJ1ZSxcbiAgICAgICAgZmlsdGVyVHlwZTogJ251bWVyaWMnLFxuICAgICAgICBmaWx0ZXJWYWx1ZToga28ub2JzZXJ2YWJsZSgpLFxuICAgICAgICBmaWx0ZXJDb21wYXJpc29uOiBrby5vYnNlcnZhYmxlKClcbiAgICAgIH0sIHtcbiAgICAgICAgbmFtZTogJ0F0ayBQb2ludCcsXG4gICAgICAgIGRpc3BsYXk6IGtvLm9ic2VydmFibGUoZmFsc2UpLFxuICAgICAgICBhbGlnbjogJ3JpZ2h0JyxcbiAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICBmaWx0ZXJUeXBlOiAnbnVtZXJpYycsXG4gICAgICAgIGZpbHRlclZhbHVlOiBrby5vYnNlcnZhYmxlKCksXG4gICAgICAgIGZpbHRlckNvbXBhcmlzb246IGtvLm9ic2VydmFibGUoKVxuICAgICAgfSwge1xuICAgICAgICBuYW1lOiAnUHJvamVjdGlsZSBTcGVlZCcsXG4gICAgICAgIGRpc3BsYXk6IGtvLm9ic2VydmFibGUoZmFsc2UpLFxuICAgICAgICBhbGlnbjogJ3JpZ2h0JyxcbiAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICBmaWx0ZXJUeXBlOiAnbnVtZXJpYycsXG4gICAgICAgIGZpbHRlclZhbHVlOiBrby5vYnNlcnZhYmxlKCksXG4gICAgICAgIGZpbHRlckNvbXBhcmlzb246IGtvLm9ic2VydmFibGUoKVxuICAgICAgfSwge1xuICAgICAgICBuYW1lOiAnRGF5IFZpc2lvbiBSYW5nZScsXG4gICAgICAgIGRpc3BsYXk6IGtvLm9ic2VydmFibGUoZmFsc2UpLFxuICAgICAgICBhbGlnbjogJ3JpZ2h0JyxcbiAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICBmaWx0ZXJUeXBlOiAnbnVtZXJpYycsXG4gICAgICAgIGZpbHRlclZhbHVlOiBrby5vYnNlcnZhYmxlKCksXG4gICAgICAgIGZpbHRlckNvbXBhcmlzb246IGtvLm9ic2VydmFibGUoKVxuICAgICAgfSwge1xuICAgICAgICBuYW1lOiAnTmlnaHQgVmlzaW9uIFJhbmdlJyxcbiAgICAgICAgZGlzcGxheToga28ub2JzZXJ2YWJsZShmYWxzZSksXG4gICAgICAgIGFsaWduOiAncmlnaHQnLFxuICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgIGZpbHRlclR5cGU6ICdudW1lcmljJyxcbiAgICAgICAgZmlsdGVyVmFsdWU6IGtvLm9ic2VydmFibGUoKSxcbiAgICAgICAgZmlsdGVyQ29tcGFyaXNvbjoga28ub2JzZXJ2YWJsZSgpXG4gICAgICB9LCB7XG4gICAgICAgIG5hbWU6ICc8YWJiciB0aXRsZT1cXFwiTW92ZW1lbnQgU3BlZWRcXFwiPk1TPC9hYmJyPicsXG4gICAgICAgIGRpc3BsYXk6IGtvLm9ic2VydmFibGUodHJ1ZSksXG4gICAgICAgIGFsaWduOiAncmlnaHQnLFxuICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgIGZpbHRlclR5cGU6ICdudW1lcmljJyxcbiAgICAgICAgZmlsdGVyVmFsdWU6IGtvLm9ic2VydmFibGUoKSxcbiAgICAgICAgZmlsdGVyQ29tcGFyaXNvbjoga28ub2JzZXJ2YWJsZSgpXG4gICAgICB9LCB7XG4gICAgICAgIG5hbWU6ICdUdXJuIFJhdGUnLFxuICAgICAgICBkaXNwbGF5OiBrby5vYnNlcnZhYmxlKGZhbHNlKSxcbiAgICAgICAgYWxpZ246ICdyaWdodCcsXG4gICAgICAgIGZpbHRlcjogdHJ1ZSxcbiAgICAgICAgZmlsdGVyVHlwZTogJ251bWVyaWMnLFxuICAgICAgICBmaWx0ZXJWYWx1ZToga28ub2JzZXJ2YWJsZSgpLFxuICAgICAgICBmaWx0ZXJDb21wYXJpc29uOiBrby5vYnNlcnZhYmxlKClcbiAgICAgIH1dKTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2VsZi5oZWFkZXJzKCkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgc2VsZi5oZWFkZXJzKClbaV0uZGVmYXVsdERpc3BsYXkgPSBrby5vYnNlcnZhYmxlKHNlbGYuaGVhZGVycygpW2ldLmRpc3BsYXkoKSk7XG4gICAgICB9XG4gICAgICBzZWxmLmhlYWRlckhUTUwgPSBmdW5jdGlvbihpbmRleCwgZGF0YSkge1xuICAgICAgICBpZiAoc2VsZi5zb3J0RGlyZWN0aW9ucygpW2luZGV4KCldKCkgPT0gLTEpIHtcbiAgICAgICAgICByZXR1cm4gXCI8YSBocmVmPVxcXCIjXFxcIj5cIiArIGRhdGEubmFtZSArIFwiIDxkaXYgY2xhc3M9XFxcImdseXBoaWNvbiBnbHlwaGljb24tY2hldnJvbi1kb3duXFxcIj48L2Rpdj48L2E+XCJcbiAgICAgICAgfSBlbHNlIGlmIChzZWxmLnNvcnREaXJlY3Rpb25zKClbaW5kZXgoKV0oKSA9PSAxKSB7XG4gICAgICAgICAgcmV0dXJuIFwiPGEgaHJlZj1cXFwiI1xcXCI+XCIgKyBkYXRhLm5hbWUgKyBcIiA8ZGl2IGNsYXNzPVxcXCJnbHlwaGljb24gZ2x5cGhpY29uLWNoZXZyb24tdXBcXFwiPjwvZGl2PjwvYT5cIlxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBcIlwiXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHNlbGYubXVsdGlTb3J0ID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG4gICAgICBzZWxmLmxldmVsID0ga28ub2JzZXJ2YWJsZSgxKTtcbiAgICAgIHNlbGYuYm9udXMgPSBrby5vYnNlcnZhYmxlKDApO1xuICAgICAgc2VsZi5zb3J0RGlyZWN0aW9ucyA9IGtvLm9ic2VydmFibGVBcnJheShbXSk7XG4gICAgICBzZWxmLmluaXRTb3J0RGlyZWN0aW9ucyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNlbGYuaGVhZGVycygpLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgc2VsZi5zb3J0RGlyZWN0aW9ucy5wdXNoKG5ldyBrby5vYnNlcnZhYmxlKDEpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgc2VsZi5pbml0U29ydERpcmVjdGlvbnMoKTtcbiAgICAgIHNlbGYuc29ydENvbHVtbiA9IGtvLm9ic2VydmFibGUoMSk7XG4gICAgICBzZWxmLmNvbHVtbkNsaWNrID0gZnVuY3Rpb24oaW5kZXgsIGRhdGEsIGV2ZW50KSB7XG4gICAgICAgIHNlbGYuc29ydERpcmVjdGlvbnMoKVtpbmRleCgpXSgtMSAqIHNlbGYuc29ydERpcmVjdGlvbnMoKVtpbmRleCgpXSgpKTtcbiAgICAgICAgaWYgKHNlbGYuc29ydENvbHVtbnMuaW5kZXhPZihpbmRleCgpKSA8IDApIHtcbiAgICAgICAgICBpZiAoZXZlbnQuc2hpZnRLZXkgfHwgc2VsZi5tdWx0aVNvcnQoKSkge1xuICAgICAgICAgICAgc2VsZi5zb3J0Q29sdW1ucy5wdXNoKGluZGV4KCkpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzZWxmLnNvcnRDb2x1bW5zLnJlbW92ZUFsbCgpO1xuICAgICAgICAgICAgc2VsZi5zb3J0Q29sdW1ucy5wdXNoKGluZGV4KCkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBzZWxmLnNvcnRDb2x1bW4oaW5kZXgoKSk7XG4gICAgICB9O1xuXG4gICAgICBzZWxmLnNvcnRDb2x1bW5zID0ga28ub2JzZXJ2YWJsZUFycmF5KFtdKTtcbiAgICAgIHNlbGYuc29ydExhYmVsQ2xpY2sgPSBmdW5jdGlvbihpbmRleCwgZGF0YSwgZXZlbnQpIHtcbiAgICAgICAgc2VsZi5zb3J0Q29sdW1ucy5yZW1vdmUoZGF0YSk7XG4gICAgICB9O1xuICAgICAgc2VsZi5sYWJlbEhUTUwgPSBmdW5jdGlvbihpbmRleCwgZGF0YSkge1xuICAgICAgICBpZiAoc2VsZi5zb3J0RGlyZWN0aW9ucygpW3NlbGYuc29ydENvbHVtbnMoKVtpbmRleCgpXV0oKSA9PSAtMSkge1xuICAgICAgICAgIHJldHVybiBcIjxhIGhyZWY9XFxcIiNcXFwiPlwiICsgZGF0YS5uYW1lICsgXCI8L2E+XCJcbiAgICAgICAgfSBlbHNlIGlmIChzZWxmLnNvcnREaXJlY3Rpb25zKClbc2VsZi5zb3J0Q29sdW1ucygpW2luZGV4KCldXSgpID09IDEpIHtcbiAgICAgICAgICByZXR1cm4gXCI8YSBocmVmPVxcXCIjXFxcIj5cIiArIGRhdGEubmFtZSArIFwiPC9hPlwiXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIFwiXCJcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgc2VsZi5jbGVhckxhYmVscyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBzZWxmLnNvcnRDb2x1bW5zLnJlbW92ZUFsbCgpO1xuICAgICAgfVxuICAgICAgc2VsZi5jbGVhckZpbHRlcnMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzZWxmLmhlYWRlcnMoKS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGlmIChzZWxmLmhlYWRlcnMoKVtpXS5maWx0ZXJWYWx1ZSAhPSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHNlbGYuaGVhZGVycygpW2ldLmZpbHRlclZhbHVlKG51bGwpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgc2VsZi5oaWRlQWxsQ29sdW1ucyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNlbGYuaGVhZGVycygpLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgc2VsZi5oZWFkZXJzKClbaV0uZGlzcGxheShmYWxzZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHNlbGYucmVzZXRDb2x1bW5zID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2VsZi5oZWFkZXJzKCkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBzZWxmLmhlYWRlcnMoKVtpXS5kaXNwbGF5KHNlbGYuaGVhZGVycygpW2ldLmRlZmF1bHREaXNwbGF5KCkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBzZWxmLnNvcnRDb2x1bW5zLnB1c2goMSk7XG4gICAgICBzZWxmLmRhdGFfY2FjaGUgPSBrby5jb21wdXRlZChmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGQgPSBrby5vYnNlcnZhYmxlQXJyYXkoW10pLFxuICAgICAgICAgIHJvdywgYWdpVG90YWwsIGludFRvdGFsLCBzdHJUb3RhbCwgcHJpbWFyeVRvdGFsO1xuICAgICAgICBmb3IgKGggaW4gaGVyb0RhdGEpIHtcbiAgICAgICAgICB2YXIgcm93ID0gW10sXG4gICAgICAgICAgICBoRGF0YSA9IGhlcm9EYXRhW2hdLFxuICAgICAgICAgICAgYWdpVG90YWwgPSBhdHRyaWJ1dGVNb2RpZmllcnMuYWdpbGl0eS5jYWxsKGhEYXRhLCBzZWxmLmxldmVsKCksIHNlbGYuYm9udXMoKSksXG4gICAgICAgICAgICBpbnRUb3RhbCA9IGF0dHJpYnV0ZU1vZGlmaWVycy5pbnRlbGxpZ2VuY2UuY2FsbChoRGF0YSwgc2VsZi5sZXZlbCgpLCBzZWxmLmJvbnVzKCkpLFxuICAgICAgICAgICAgc3RyVG90YWwgPSBhdHRyaWJ1dGVNb2RpZmllcnMuc3RyZW5ndGguY2FsbChoRGF0YSwgc2VsZi5sZXZlbCgpLCBzZWxmLmJvbnVzKCkpLFxuICAgICAgICAgICAgcHJpbWFyeVRvdGFsID0gS1RMSUIuZ2V0QXR0cmlidXRlQXRMZXZlbC5jYWxsKGhEYXRhLCBoRGF0YS5hdHRyaWJ1dGVwcmltYXJ5LCBzZWxmLmxldmVsKCksIHNlbGYuYm9udXMoKSk7XG4gICAgICAgICAgcm93LnB1c2goJzxkaXYgY2xhc3M9XCJoZXJvZXMtc3ByaXRlLScgKyBoLnJlcGxhY2UoJ25wY19kb3RhX2hlcm9fJywgJycpICsgJyBoZXJvZXMtc3ByaXRlLTMyeDE4XCI+PC9kaXY+Jyk7XG4gICAgICAgICAgcm93LnB1c2goaGVyb0RhdGFbaF0uZGlzcGxheW5hbWUpO1xuICAgICAgICAgIHJvdy5wdXNoKGdldFByaW1hcnlTdGF0KGgpKTtcbiAgICAgICAgICByb3cucHVzaChhZ2lUb3RhbC50b1ByZWNpc2lvbigzKSk7XG4gICAgICAgICAgcm93LnB1c2goaW50VG90YWwudG9QcmVjaXNpb24oMykpO1xuICAgICAgICAgIHJvdy5wdXNoKHN0clRvdGFsLnRvUHJlY2lzaW9uKDMpKTtcbiAgICAgICAgICByb3cucHVzaChoZXJvRGF0YVtoXS5hdHRyaWJ1dGVhZ2lsaXR5Z2Fpbik7XG4gICAgICAgICAgcm93LnB1c2goaGVyb0RhdGFbaF0uYXR0cmlidXRlaW50ZWxsaWdlbmNlZ2Fpbik7XG4gICAgICAgICAgcm93LnB1c2goaGVyb0RhdGFbaF0uYXR0cmlidXRlc3RyZW5ndGhnYWluKTtcblxuICAgICAgICAgIHJvdy5wdXNoKGF0dHJpYnV0ZU1vZGlmaWVycy5hdHRhY2tkYW1hZ2VtaW4uY2FsbChoRGF0YSwgc2VsZi5sZXZlbCgpLCBzZWxmLmJvbnVzKCkpLnRvUHJlY2lzaW9uKDMpKTtcbiAgICAgICAgICByb3cucHVzaChhdHRyaWJ1dGVNb2RpZmllcnMuYXR0YWNrZGFtYWdlbWF4LmNhbGwoaERhdGEsIHNlbGYubGV2ZWwoKSwgc2VsZi5ib251cygpKS50b1ByZWNpc2lvbigzKSk7XG4gICAgICAgICAgcm93LnB1c2goYXR0cmlidXRlTW9kaWZpZXJzLmF0dGFja2RhbWFnZWF2Zy5jYWxsKGhEYXRhLCBzZWxmLmxldmVsKCksIHNlbGYuYm9udXMoKSkudG9QcmVjaXNpb24oMykpO1xuICAgICAgICAgIHJvdy5wdXNoKGF0dHJpYnV0ZU1vZGlmaWVycy5hcm1vcnBoeXNpY2FsLmNhbGwoaERhdGEsIHNlbGYubGV2ZWwoKSwgc2VsZi5ib251cygpKS50b1ByZWNpc2lvbigzKSk7XG4gICAgICAgICAgcm93LnB1c2goYXR0cmlidXRlTW9kaWZpZXJzLmVocC5jYWxsKGhEYXRhLCBzZWxmLmxldmVsKCksIHNlbGYuYm9udXMoKSkudG9QcmVjaXNpb24oNCkpO1xuICAgICAgICAgIHJvdy5wdXNoKGF0dHJpYnV0ZU1vZGlmaWVycy5tZWhwLmNhbGwoaERhdGEsIHNlbGYubGV2ZWwoKSwgc2VsZi5ib251cygpKS50b1ByZWNpc2lvbig0KSk7XG4gICAgICAgICAgcm93LnB1c2goYXR0cmlidXRlTW9kaWZpZXJzLnN0YXR1c2hlYWx0aC5jYWxsKGhEYXRhLCBzZWxmLmxldmVsKCksIHNlbGYuYm9udXMoKSkudG9QcmVjaXNpb24oNCkpO1xuICAgICAgICAgIHJvdy5wdXNoKGF0dHJpYnV0ZU1vZGlmaWVycy5zdGF0dXNoZWFsdGhyZWdlbi5jYWxsKGhEYXRhLCBzZWxmLmxldmVsKCksIHNlbGYuYm9udXMoKSkudG9QcmVjaXNpb24oMykpO1xuICAgICAgICAgIHJvdy5wdXNoKGF0dHJpYnV0ZU1vZGlmaWVycy5zdGF0dXNtYW5hLmNhbGwoaERhdGEsIHNlbGYubGV2ZWwoKSwgc2VsZi5ib251cygpKS50b1ByZWNpc2lvbig0KSk7XG4gICAgICAgICAgcm93LnB1c2goYXR0cmlidXRlTW9kaWZpZXJzLnN0YXR1c21hbmFyZWdlbi5jYWxsKGhEYXRhLCBzZWxmLmxldmVsKCksIHNlbGYuYm9udXMoKSkudG9QcmVjaXNpb24oMykpO1xuICAgICAgICAgIGlmIChoZXJvRGF0YVtoXS5hdHRhY2t0eXBlID09ICdET1RBX1VOSVRfQ0FQX01FTEVFX0FUVEFDSycpIHtcbiAgICAgICAgICAgIHJvdy5wdXNoKCdNZWxlZScpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByb3cucHVzaCgnUmFuZ2VkJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJvdy5wdXNoKGhlcm9EYXRhW2hdLmF0dGFja3JhbmdlKTtcbiAgICAgICAgICByb3cucHVzaChoZXJvRGF0YVtoXS5hdHRhY2tyYXRlKTtcbiAgICAgICAgICByb3cucHVzaChoZXJvRGF0YVtoXS5hdHRhY2twb2ludCk7XG4gICAgICAgICAgcm93LnB1c2goaGVyb0RhdGFbaF0ucHJvamVjdGlsZXNwZWVkKTtcbiAgICAgICAgICByb3cucHVzaChoZXJvRGF0YVtoXS52aXNpb25kYXl0aW1lcmFuZ2UpO1xuICAgICAgICAgIHJvdy5wdXNoKGhlcm9EYXRhW2hdLnZpc2lvbm5pZ2h0dGltZXJhbmdlKTtcbiAgICAgICAgICByb3cucHVzaChoZXJvRGF0YVtoXS5tb3ZlbWVudHNwZWVkKTtcbiAgICAgICAgICByb3cucHVzaChoZXJvRGF0YVtoXS5tb3ZlbWVudHR1cm5yYXRlKTtcblxuICAgICAgICAgIGQucHVzaChyb3cpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkO1xuICAgICAgfSk7XG4gICAgICBzZWxmLmRhdGEgPSBrby5jb21wdXRlZChmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGQgPSBzZWxmLmRhdGFfY2FjaGUoKTtcbiAgICAgICAgZC5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgICB2YXIgaSA9IDA7XG4gICAgICAgICAgd2hpbGUgKGkgPCBzZWxmLnNvcnRDb2x1bW5zKCkubGVuZ3RoKSB7XG4gICAgICAgICAgICBpZiAoc2VsZi5zb3J0Q29sdW1ucygpW2ldID4gMiAmJiBzZWxmLmhlYWRlcnMoKVtzZWxmLnNvcnRDb2x1bW5zKClbaV1dLm5hbWUgIT0gJ0F0ayBUeXBlJykge1xuICAgICAgICAgICAgICBpZiAocGFyc2VGbG9hdChhW3NlbGYuc29ydENvbHVtbnMoKVtpXV0pID4gcGFyc2VGbG9hdChiW3NlbGYuc29ydENvbHVtbnMoKVtpXV0pKSByZXR1cm4gMSAqIHNlbGYuc29ydERpcmVjdGlvbnMoKVtzZWxmLnNvcnRDb2x1bW5zKClbaV1dKCk7XG4gICAgICAgICAgICAgIGlmIChwYXJzZUZsb2F0KGFbc2VsZi5zb3J0Q29sdW1ucygpW2ldXSkgPCBwYXJzZUZsb2F0KGJbc2VsZi5zb3J0Q29sdW1ucygpW2ldXSkpIHJldHVybiAtMSAqIHNlbGYuc29ydERpcmVjdGlvbnMoKVtzZWxmLnNvcnRDb2x1bW5zKClbaV1dKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBpZiAoYVtzZWxmLnNvcnRDb2x1bW5zKClbaV1dID4gYltzZWxmLnNvcnRDb2x1bW5zKClbaV1dKSByZXR1cm4gMSAqIHNlbGYuc29ydERpcmVjdGlvbnMoKVtzZWxmLnNvcnRDb2x1bW5zKClbaV1dKCk7XG4gICAgICAgICAgICAgIGlmIChhW3NlbGYuc29ydENvbHVtbnMoKVtpXV0gPCBiW3NlbGYuc29ydENvbHVtbnMoKVtpXV0pIHJldHVybiAtMSAqIHNlbGYuc29ydERpcmVjdGlvbnMoKVtzZWxmLnNvcnRDb2x1bW5zKClbaV1dKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpICs9IDE7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGQoKS5maWx0ZXIoZnVuY3Rpb24ocm93KSB7XG4gICAgICAgICAgcmV0dXJuIHJvdy5ldmVyeShmdW5jdGlvbihpdGVtLCBpKSB7XG4gICAgICAgICAgICBpZiAoIXNlbGYuaGVhZGVycygpW2ldLmZpbHRlcikgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICBpZiAoIXNlbGYuaGVhZGVycygpW2ldLmZpbHRlclZhbHVlKCkpIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgc3dpdGNoIChzZWxmLmhlYWRlcnMoKVtpXS5maWx0ZXJUeXBlKSB7XG4gICAgICAgICAgICAgIGNhc2UgJ251bWVyaWMnOlxuICAgICAgICAgICAgICAgIHN3aXRjaCAoc2VsZi5oZWFkZXJzKClbaV0uZmlsdGVyQ29tcGFyaXNvbigpKSB7XG4gICAgICAgICAgICAgICAgICBjYXNlICdndCc6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBwYXJzZUZsb2F0KGl0ZW0pID4gcGFyc2VGbG9hdChzZWxmLmhlYWRlcnMoKVtpXS5maWx0ZXJWYWx1ZSgpKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICBjYXNlICdsdCc6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBwYXJzZUZsb2F0KGl0ZW0pIDwgcGFyc2VGbG9hdChzZWxmLmhlYWRlcnMoKVtpXS5maWx0ZXJWYWx1ZSgpKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICBjYXNlICdnZSc6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBwYXJzZUZsb2F0KGl0ZW0pID49IHBhcnNlRmxvYXQoc2VsZi5oZWFkZXJzKClbaV0uZmlsdGVyVmFsdWUoKSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgY2FzZSAnbGUnOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGFyc2VGbG9hdChpdGVtKSA8PSBwYXJzZUZsb2F0KHNlbGYuaGVhZGVycygpW2ldLmZpbHRlclZhbHVlKCkpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgIGNhc2UgJ2VxJzpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQoaXRlbSkgPT0gcGFyc2VGbG9hdChzZWxmLmhlYWRlcnMoKVtpXS5maWx0ZXJWYWx1ZSgpKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICBjYXNlICdzdHJpbmcnOlxuICAgICAgICAgICAgICAgIHJldHVybiBpdGVtLnRvTG93ZXJDYXNlKCkuaW5kZXhPZihzZWxmLmhlYWRlcnMoKVtpXS5maWx0ZXJWYWx1ZSgpLnRvTG93ZXJDYXNlKCkpICE9IC0xO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICBjYXNlICdzZWxlY3QnOlxuICAgICAgICAgICAgICAgIHJldHVybiBpdGVtID09IHNlbGYuaGVhZGVycygpW2ldLmZpbHRlclZhbHVlKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gc2VsZi5oZWFkZXJzKClbaV0uZmlsdGVyO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH0sIHRoaXMpO1xuXG4gICAgICBzZWxmLnRvZ2dsZUNvbHVtbiA9IGZ1bmN0aW9uKGluZGV4LCBkYXRhLCBldmVudCkge1xuICAgICAgICBzZWxmLmhlYWRlcnMoKVtpbmRleCgpXS5kaXNwbGF5KCFzZWxmLmhlYWRlcnMoKVtpbmRleCgpXS5kaXNwbGF5KCkpXG4gICAgICB9O1xuICAgIH1cblxuICAgIGtvLmFwcGx5QmluZGluZ3MobmV3IFRhYmxlVmlld01vZGVsKCkpO1xuICAgIC8qJC5nZXRKU09OKFwiL21lZGlhL2pzL2hlcm9kYXRhLmpzb25cIiwgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgIGhlcm9EYXRhID0gZGF0YTtcbiAgICAgIGtvLmFwcGx5QmluZGluZ3MobmV3IFRhYmxlVmlld01vZGVsKCkpO1xuICAgIH0pOyovXG4gIH0pO1xuXG59KTsiXX0=
