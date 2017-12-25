require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({42:[function(require,module,exports){
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
},{"../ktlib":47,"bootstrap":1,"jquery":25}]},{},[42])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvaGVyb2VzL2hlcm9kYXRhLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgJCA9IGpRdWVyeSA9IHJlcXVpcmUoJ2pxdWVyeScpO1xucmVxdWlyZSgnYm9vdHN0cmFwJyk7XG52YXIgS1RMSUIgPSByZXF1aXJlKCcuLi9rdGxpYicpO1xuXG4kKGZ1bmN0aW9uKCkge1xuICB2YXIgYXR0cmlidXRlcyA9IEtUTElCLmF0dHJpYnV0ZXM7XG4gIHZhciBhdHRyaWJ1dGVPcHRpb25zID0gS1RMSUIuYXR0cmlidXRlT3B0aW9ucztcbiAgdmFyIGF0dHJpYnV0ZU1vZGlmaWVycyA9IEtUTElCLmF0dHJpYnV0ZU1vZGlmaWVycztcblxuICBLVExJQi5pbml0KGZ1bmN0aW9uKGhlcm9EYXRhKSB7XG4gICAgJCgnLmRyb3Bkb3duLW1lbnUnKS5jbGljayhmdW5jdGlvbihlKSB7XG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIH0pO1xuXG4gICAgZnVuY3Rpb24gZ2V0UHJpbWFyeVN0YXQoaCkge1xuICAgICAgdmFyIHYgPSBoZXJvRGF0YVtoXS5hdHRyaWJ1dGVwcmltYXJ5O1xuICAgICAgaWYgKHYgPT0gJ0RPVEFfQVRUUklCVVRFX0FHSUxJVFknKSB7XG4gICAgICAgIHJldHVybiAnQWdpJ1xuICAgICAgfSBlbHNlIGlmICh2ID09ICdET1RBX0FUVFJJQlVURV9JTlRFTExFQ1QnKSB7XG4gICAgICAgIHJldHVybiAnSW50J1xuICAgICAgfSBlbHNlIGlmICh2ID09ICdET1RBX0FUVFJJQlVURV9TVFJFTkdUSCcpIHtcbiAgICAgICAgcmV0dXJuICdTdHInXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gJydcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBUYWJsZVZpZXdNb2RlbCgpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIHNlbGYuZmlsdGVyVmlzaWJsZSA9IGtvLm9ic2VydmFibGUoZmFsc2UpO1xuICAgICAgc2VsZi50b2dnbGVGaWx0ZXJWaXNpYmlsaXR5ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHNlbGYuZmlsdGVyVmlzaWJsZSghc2VsZi5maWx0ZXJWaXNpYmxlKCkpO1xuICAgICAgfVxuICAgICAgc2VsZi5maWx0ZXJUZW1wbGF0ZVRvVXNlID0gZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICByZXR1cm4gaXRlbS5maWx0ZXJUeXBlICsgJy1maWx0ZXInO1xuICAgICAgfVxuICAgICAgc2VsZi5oZWFkZXJzID0ga28ub2JzZXJ2YWJsZUFycmF5KFt7XG4gICAgICAgIG5hbWU6ICdJY29uJyxcbiAgICAgICAgZGlzcGxheToga28ub2JzZXJ2YWJsZSh0cnVlKSxcbiAgICAgICAgYWxpZ246ICdjZW50ZXInLFxuICAgICAgICBmaWx0ZXI6IGZhbHNlXG4gICAgICB9LCB7XG4gICAgICAgIG5hbWU6ICdOYW1lJyxcbiAgICAgICAgZGlzcGxheToga28ub2JzZXJ2YWJsZSh0cnVlKSxcbiAgICAgICAgYWxpZ246ICcnLFxuICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgIGZpbHRlclR5cGU6ICdzdHJpbmcnLFxuICAgICAgICBmaWx0ZXJWYWx1ZToga28ub2JzZXJ2YWJsZSgpXG4gICAgICB9LCB7XG4gICAgICAgIG5hbWU6ICdQcmltYXJ5IFN0YXQnLFxuICAgICAgICBkaXNwbGF5OiBrby5vYnNlcnZhYmxlKHRydWUpLFxuICAgICAgICBhbGlnbjogJ2NlbnRlcicsXG4gICAgICAgIGZpbHRlcjogdHJ1ZSxcbiAgICAgICAgZmlsdGVyVHlwZTogJ3NlbGVjdCcsXG4gICAgICAgIGZpbHRlck9wdGlvbnM6IFt7XG4gICAgICAgICAgdGV4dDogJ0FnaWxpdHknLFxuICAgICAgICAgIHZhbHVlOiAnQWdpJ1xuICAgICAgICB9LCB7XG4gICAgICAgICAgdGV4dDogJ1N0cmVuZ3RoJyxcbiAgICAgICAgICB2YWx1ZTogJ1N0cidcbiAgICAgICAgfSwge1xuICAgICAgICAgIHRleHQ6ICdJbnRlbGxpZ2VuY2UnLFxuICAgICAgICAgIHZhbHVlOiAnSW50J1xuICAgICAgICB9XSxcbiAgICAgICAgZmlsdGVyVmFsdWU6IGtvLm9ic2VydmFibGUoKVxuICAgICAgfSwge1xuICAgICAgICBuYW1lOiAnPGFiYnIgdGl0bGU9XFxcIkFnaWxpdHlcXFwiPkFnaTwvYWJicj4nLFxuICAgICAgICBkaXNwbGF5OiBrby5vYnNlcnZhYmxlKHRydWUpLFxuICAgICAgICBhbGlnbjogJ3JpZ2h0JyxcbiAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICBmaWx0ZXJUeXBlOiAnbnVtZXJpYycsXG4gICAgICAgIGZpbHRlclZhbHVlOiBrby5vYnNlcnZhYmxlKCksXG4gICAgICAgIGZpbHRlckNvbXBhcmlzb246IGtvLm9ic2VydmFibGUoKVxuICAgICAgfSwge1xuICAgICAgICBuYW1lOiAnPGFiYnIgdGl0bGU9XFxcIkludGVsbGlnZW5jZVxcXCI+SW50PC9hYmJyPicsXG4gICAgICAgIGRpc3BsYXk6IGtvLm9ic2VydmFibGUodHJ1ZSksXG4gICAgICAgIGFsaWduOiAncmlnaHQnLFxuICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgIGZpbHRlclR5cGU6ICdudW1lcmljJyxcbiAgICAgICAgZmlsdGVyVmFsdWU6IGtvLm9ic2VydmFibGUoKSxcbiAgICAgICAgZmlsdGVyQ29tcGFyaXNvbjoga28ub2JzZXJ2YWJsZSgpXG4gICAgICB9LCB7XG4gICAgICAgIG5hbWU6ICc8YWJiciB0aXRsZT1cXFwiU3RyZW5ndGhcXFwiPlN0cjwvYWJicj4nLFxuICAgICAgICBkaXNwbGF5OiBrby5vYnNlcnZhYmxlKHRydWUpLFxuICAgICAgICBhbGlnbjogJ3JpZ2h0JyxcbiAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICBmaWx0ZXJUeXBlOiAnbnVtZXJpYycsXG4gICAgICAgIGZpbHRlclZhbHVlOiBrby5vYnNlcnZhYmxlKCksXG4gICAgICAgIGZpbHRlckNvbXBhcmlzb246IGtvLm9ic2VydmFibGUoKVxuICAgICAgfSwge1xuICAgICAgICBuYW1lOiAnQWdpIEdhaW4nLFxuICAgICAgICBkaXNwbGF5OiBrby5vYnNlcnZhYmxlKGZhbHNlKSxcbiAgICAgICAgYWxpZ246ICdyaWdodCcsXG4gICAgICAgIGZpbHRlcjogdHJ1ZSxcbiAgICAgICAgZmlsdGVyVHlwZTogJ251bWVyaWMnLFxuICAgICAgICBmaWx0ZXJWYWx1ZToga28ub2JzZXJ2YWJsZSgpLFxuICAgICAgICBmaWx0ZXJDb21wYXJpc29uOiBrby5vYnNlcnZhYmxlKClcbiAgICAgIH0sIHtcbiAgICAgICAgbmFtZTogJ0ludCBHYWluJyxcbiAgICAgICAgZGlzcGxheToga28ub2JzZXJ2YWJsZShmYWxzZSksXG4gICAgICAgIGFsaWduOiAncmlnaHQnLFxuICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgIGZpbHRlclR5cGU6ICdudW1lcmljJyxcbiAgICAgICAgZmlsdGVyVmFsdWU6IGtvLm9ic2VydmFibGUoKSxcbiAgICAgICAgZmlsdGVyQ29tcGFyaXNvbjoga28ub2JzZXJ2YWJsZSgpXG4gICAgICB9LCB7XG4gICAgICAgIG5hbWU6ICdTdHIgR2FpbicsXG4gICAgICAgIGRpc3BsYXk6IGtvLm9ic2VydmFibGUoZmFsc2UpLFxuICAgICAgICBhbGlnbjogJ3JpZ2h0JyxcbiAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICBmaWx0ZXJUeXBlOiAnbnVtZXJpYycsXG4gICAgICAgIGZpbHRlclZhbHVlOiBrby5vYnNlcnZhYmxlKCksXG4gICAgICAgIGZpbHRlckNvbXBhcmlzb246IGtvLm9ic2VydmFibGUoKVxuICAgICAgfSwge1xuICAgICAgICBuYW1lOiAnTWluIERtZycsXG4gICAgICAgIGRpc3BsYXk6IGtvLm9ic2VydmFibGUoZmFsc2UpLFxuICAgICAgICBhbGlnbjogJ3JpZ2h0JyxcbiAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICBmaWx0ZXJUeXBlOiAnbnVtZXJpYycsXG4gICAgICAgIGZpbHRlclZhbHVlOiBrby5vYnNlcnZhYmxlKCksXG4gICAgICAgIGZpbHRlckNvbXBhcmlzb246IGtvLm9ic2VydmFibGUoKVxuICAgICAgfSwge1xuICAgICAgICBuYW1lOiAnTWF4IERtZycsXG4gICAgICAgIGRpc3BsYXk6IGtvLm9ic2VydmFibGUoZmFsc2UpLFxuICAgICAgICBhbGlnbjogJ3JpZ2h0JyxcbiAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICBmaWx0ZXJUeXBlOiAnbnVtZXJpYycsXG4gICAgICAgIGZpbHRlclZhbHVlOiBrby5vYnNlcnZhYmxlKCksXG4gICAgICAgIGZpbHRlckNvbXBhcmlzb246IGtvLm9ic2VydmFibGUoKVxuICAgICAgfSwge1xuICAgICAgICBuYW1lOiAnQXZnIERtZycsXG4gICAgICAgIGRpc3BsYXk6IGtvLm9ic2VydmFibGUodHJ1ZSksXG4gICAgICAgIGFsaWduOiAncmlnaHQnLFxuICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgIGZpbHRlclR5cGU6ICdudW1lcmljJyxcbiAgICAgICAgZmlsdGVyVmFsdWU6IGtvLm9ic2VydmFibGUoKSxcbiAgICAgICAgZmlsdGVyQ29tcGFyaXNvbjoga28ub2JzZXJ2YWJsZSgpXG4gICAgICB9LCB7XG4gICAgICAgIG5hbWU6ICdBcm1vcicsXG4gICAgICAgIGRpc3BsYXk6IGtvLm9ic2VydmFibGUodHJ1ZSksXG4gICAgICAgIGFsaWduOiAncmlnaHQnLFxuICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgIGZpbHRlclR5cGU6ICdudW1lcmljJyxcbiAgICAgICAgZmlsdGVyVmFsdWU6IGtvLm9ic2VydmFibGUoKSxcbiAgICAgICAgZmlsdGVyQ29tcGFyaXNvbjoga28ub2JzZXJ2YWJsZSgpXG4gICAgICB9LCB7XG4gICAgICAgIG5hbWU6ICdFSFAnLFxuICAgICAgICBkaXNwbGF5OiBrby5vYnNlcnZhYmxlKHRydWUpLFxuICAgICAgICBhbGlnbjogJ3JpZ2h0JyxcbiAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICBmaWx0ZXJUeXBlOiAnbnVtZXJpYycsXG4gICAgICAgIGZpbHRlclZhbHVlOiBrby5vYnNlcnZhYmxlKCksXG4gICAgICAgIGZpbHRlckNvbXBhcmlzb246IGtvLm9ic2VydmFibGUoKVxuICAgICAgfSwge1xuICAgICAgICBuYW1lOiAnRUhQIE1hZ2ljJyxcbiAgICAgICAgZGlzcGxheToga28ub2JzZXJ2YWJsZShmYWxzZSksXG4gICAgICAgIGFsaWduOiAncmlnaHQnLFxuICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgIGZpbHRlclR5cGU6ICdudW1lcmljJyxcbiAgICAgICAgZmlsdGVyVmFsdWU6IGtvLm9ic2VydmFibGUoKSxcbiAgICAgICAgZmlsdGVyQ29tcGFyaXNvbjoga28ub2JzZXJ2YWJsZSgpXG4gICAgICB9LCB7XG4gICAgICAgIG5hbWU6ICdIUCcsXG4gICAgICAgIGRpc3BsYXk6IGtvLm9ic2VydmFibGUodHJ1ZSksXG4gICAgICAgIGFsaWduOiAncmlnaHQnLFxuICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgIGZpbHRlclR5cGU6ICdudW1lcmljJyxcbiAgICAgICAgZmlsdGVyVmFsdWU6IGtvLm9ic2VydmFibGUoKSxcbiAgICAgICAgZmlsdGVyQ29tcGFyaXNvbjoga28ub2JzZXJ2YWJsZSgpXG4gICAgICB9LCB7XG4gICAgICAgIG5hbWU6ICdIUCBSZWdlbicsXG4gICAgICAgIGRpc3BsYXk6IGtvLm9ic2VydmFibGUoZmFsc2UpLFxuICAgICAgICBhbGlnbjogJ3JpZ2h0JyxcbiAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICBmaWx0ZXJUeXBlOiAnbnVtZXJpYycsXG4gICAgICAgIGZpbHRlclZhbHVlOiBrby5vYnNlcnZhYmxlKCksXG4gICAgICAgIGZpbHRlckNvbXBhcmlzb246IGtvLm9ic2VydmFibGUoKVxuICAgICAgfSwge1xuICAgICAgICBuYW1lOiAnTWFuYScsXG4gICAgICAgIGRpc3BsYXk6IGtvLm9ic2VydmFibGUodHJ1ZSksXG4gICAgICAgIGFsaWduOiAncmlnaHQnLFxuICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgIGZpbHRlclR5cGU6ICdudW1lcmljJyxcbiAgICAgICAgZmlsdGVyVmFsdWU6IGtvLm9ic2VydmFibGUoKSxcbiAgICAgICAgZmlsdGVyQ29tcGFyaXNvbjoga28ub2JzZXJ2YWJsZSgpXG4gICAgICB9LCB7XG4gICAgICAgIG5hbWU6ICdNYW5hIFJlZ2VuJyxcbiAgICAgICAgZGlzcGxheToga28ub2JzZXJ2YWJsZShmYWxzZSksXG4gICAgICAgIGFsaWduOiAncmlnaHQnLFxuICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgIGZpbHRlclR5cGU6ICdudW1lcmljJyxcbiAgICAgICAgZmlsdGVyVmFsdWU6IGtvLm9ic2VydmFibGUoKSxcbiAgICAgICAgZmlsdGVyQ29tcGFyaXNvbjoga28ub2JzZXJ2YWJsZSgpXG4gICAgICB9LCB7XG4gICAgICAgIG5hbWU6ICdBdGsgVHlwZScsXG4gICAgICAgIGRpc3BsYXk6IGtvLm9ic2VydmFibGUodHJ1ZSksXG4gICAgICAgIGFsaWduOiAnY2VudGVyJyxcbiAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICBmaWx0ZXJUeXBlOiAnc2VsZWN0JyxcbiAgICAgICAgZmlsdGVyT3B0aW9uczogW3tcbiAgICAgICAgICB0ZXh0OiAnUmFuZ2VkJyxcbiAgICAgICAgICB2YWx1ZTogJ1JhbmdlZCdcbiAgICAgICAgfSwge1xuICAgICAgICAgIHRleHQ6ICdNZWxlZScsXG4gICAgICAgICAgdmFsdWU6ICdNZWxlZSdcbiAgICAgICAgfV0sXG4gICAgICAgIGZpbHRlclZhbHVlOiBrby5vYnNlcnZhYmxlKClcbiAgICAgIH0sIHtcbiAgICAgICAgbmFtZTogJ0F0ayBSYW5nZScsXG4gICAgICAgIGRpc3BsYXk6IGtvLm9ic2VydmFibGUodHJ1ZSksXG4gICAgICAgIGFsaWduOiAncmlnaHQnLFxuICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgIGZpbHRlclR5cGU6ICdudW1lcmljJyxcbiAgICAgICAgZmlsdGVyVmFsdWU6IGtvLm9ic2VydmFibGUoKSxcbiAgICAgICAgZmlsdGVyQ29tcGFyaXNvbjoga28ub2JzZXJ2YWJsZSgpXG4gICAgICB9LCB7XG4gICAgICAgIG5hbWU6ICc8YWJiciB0aXRsZT1cXFwiQmFzZSBBdHRhY2sgVGltZVxcXCI+QkFUPC9hYmJyPicsXG4gICAgICAgIGRpc3BsYXk6IGtvLm9ic2VydmFibGUoZmFsc2UpLFxuICAgICAgICBhbGlnbjogJ3JpZ2h0JyxcbiAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICBmaWx0ZXJUeXBlOiAnbnVtZXJpYycsXG4gICAgICAgIGZpbHRlclZhbHVlOiBrby5vYnNlcnZhYmxlKCksXG4gICAgICAgIGZpbHRlckNvbXBhcmlzb246IGtvLm9ic2VydmFibGUoKVxuICAgICAgfSwge1xuICAgICAgICBuYW1lOiAnQXRrIFBvaW50JyxcbiAgICAgICAgZGlzcGxheToga28ub2JzZXJ2YWJsZShmYWxzZSksXG4gICAgICAgIGFsaWduOiAncmlnaHQnLFxuICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgIGZpbHRlclR5cGU6ICdudW1lcmljJyxcbiAgICAgICAgZmlsdGVyVmFsdWU6IGtvLm9ic2VydmFibGUoKSxcbiAgICAgICAgZmlsdGVyQ29tcGFyaXNvbjoga28ub2JzZXJ2YWJsZSgpXG4gICAgICB9LCB7XG4gICAgICAgIG5hbWU6ICdQcm9qZWN0aWxlIFNwZWVkJyxcbiAgICAgICAgZGlzcGxheToga28ub2JzZXJ2YWJsZShmYWxzZSksXG4gICAgICAgIGFsaWduOiAncmlnaHQnLFxuICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgIGZpbHRlclR5cGU6ICdudW1lcmljJyxcbiAgICAgICAgZmlsdGVyVmFsdWU6IGtvLm9ic2VydmFibGUoKSxcbiAgICAgICAgZmlsdGVyQ29tcGFyaXNvbjoga28ub2JzZXJ2YWJsZSgpXG4gICAgICB9LCB7XG4gICAgICAgIG5hbWU6ICdEYXkgVmlzaW9uIFJhbmdlJyxcbiAgICAgICAgZGlzcGxheToga28ub2JzZXJ2YWJsZShmYWxzZSksXG4gICAgICAgIGFsaWduOiAncmlnaHQnLFxuICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgIGZpbHRlclR5cGU6ICdudW1lcmljJyxcbiAgICAgICAgZmlsdGVyVmFsdWU6IGtvLm9ic2VydmFibGUoKSxcbiAgICAgICAgZmlsdGVyQ29tcGFyaXNvbjoga28ub2JzZXJ2YWJsZSgpXG4gICAgICB9LCB7XG4gICAgICAgIG5hbWU6ICdOaWdodCBWaXNpb24gUmFuZ2UnLFxuICAgICAgICBkaXNwbGF5OiBrby5vYnNlcnZhYmxlKGZhbHNlKSxcbiAgICAgICAgYWxpZ246ICdyaWdodCcsXG4gICAgICAgIGZpbHRlcjogdHJ1ZSxcbiAgICAgICAgZmlsdGVyVHlwZTogJ251bWVyaWMnLFxuICAgICAgICBmaWx0ZXJWYWx1ZToga28ub2JzZXJ2YWJsZSgpLFxuICAgICAgICBmaWx0ZXJDb21wYXJpc29uOiBrby5vYnNlcnZhYmxlKClcbiAgICAgIH0sIHtcbiAgICAgICAgbmFtZTogJzxhYmJyIHRpdGxlPVxcXCJNb3ZlbWVudCBTcGVlZFxcXCI+TVM8L2FiYnI+JyxcbiAgICAgICAgZGlzcGxheToga28ub2JzZXJ2YWJsZSh0cnVlKSxcbiAgICAgICAgYWxpZ246ICdyaWdodCcsXG4gICAgICAgIGZpbHRlcjogdHJ1ZSxcbiAgICAgICAgZmlsdGVyVHlwZTogJ251bWVyaWMnLFxuICAgICAgICBmaWx0ZXJWYWx1ZToga28ub2JzZXJ2YWJsZSgpLFxuICAgICAgICBmaWx0ZXJDb21wYXJpc29uOiBrby5vYnNlcnZhYmxlKClcbiAgICAgIH0sIHtcbiAgICAgICAgbmFtZTogJ1R1cm4gUmF0ZScsXG4gICAgICAgIGRpc3BsYXk6IGtvLm9ic2VydmFibGUoZmFsc2UpLFxuICAgICAgICBhbGlnbjogJ3JpZ2h0JyxcbiAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICBmaWx0ZXJUeXBlOiAnbnVtZXJpYycsXG4gICAgICAgIGZpbHRlclZhbHVlOiBrby5vYnNlcnZhYmxlKCksXG4gICAgICAgIGZpbHRlckNvbXBhcmlzb246IGtvLm9ic2VydmFibGUoKVxuICAgICAgfV0pO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzZWxmLmhlYWRlcnMoKS5sZW5ndGg7IGkrKykge1xuICAgICAgICBzZWxmLmhlYWRlcnMoKVtpXS5kZWZhdWx0RGlzcGxheSA9IGtvLm9ic2VydmFibGUoc2VsZi5oZWFkZXJzKClbaV0uZGlzcGxheSgpKTtcbiAgICAgIH1cbiAgICAgIHNlbGYuaGVhZGVySFRNTCA9IGZ1bmN0aW9uKGluZGV4LCBkYXRhKSB7XG4gICAgICAgIGlmIChzZWxmLnNvcnREaXJlY3Rpb25zKClbaW5kZXgoKV0oKSA9PSAtMSkge1xuICAgICAgICAgIHJldHVybiBcIjxhIGhyZWY9XFxcIiNcXFwiPlwiICsgZGF0YS5uYW1lICsgXCIgPGRpdiBjbGFzcz1cXFwiZ2x5cGhpY29uIGdseXBoaWNvbi1jaGV2cm9uLWRvd25cXFwiPjwvZGl2PjwvYT5cIlxuICAgICAgICB9IGVsc2UgaWYgKHNlbGYuc29ydERpcmVjdGlvbnMoKVtpbmRleCgpXSgpID09IDEpIHtcbiAgICAgICAgICByZXR1cm4gXCI8YSBocmVmPVxcXCIjXFxcIj5cIiArIGRhdGEubmFtZSArIFwiIDxkaXYgY2xhc3M9XFxcImdseXBoaWNvbiBnbHlwaGljb24tY2hldnJvbi11cFxcXCI+PC9kaXY+PC9hPlwiXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIFwiXCJcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgc2VsZi5tdWx0aVNvcnQgPSBrby5vYnNlcnZhYmxlKGZhbHNlKTtcbiAgICAgIHNlbGYubGV2ZWwgPSBrby5vYnNlcnZhYmxlKDEpO1xuICAgICAgc2VsZi5ib251cyA9IGtvLm9ic2VydmFibGUoMCk7XG4gICAgICBzZWxmLnNvcnREaXJlY3Rpb25zID0ga28ub2JzZXJ2YWJsZUFycmF5KFtdKTtcbiAgICAgIHNlbGYuaW5pdFNvcnREaXJlY3Rpb25zID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2VsZi5oZWFkZXJzKCkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBzZWxmLnNvcnREaXJlY3Rpb25zLnB1c2gobmV3IGtvLm9ic2VydmFibGUoMSkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBzZWxmLmluaXRTb3J0RGlyZWN0aW9ucygpO1xuICAgICAgc2VsZi5zb3J0Q29sdW1uID0ga28ub2JzZXJ2YWJsZSgxKTtcbiAgICAgIHNlbGYuY29sdW1uQ2xpY2sgPSBmdW5jdGlvbihpbmRleCwgZGF0YSwgZXZlbnQpIHtcbiAgICAgICAgc2VsZi5zb3J0RGlyZWN0aW9ucygpW2luZGV4KCldKC0xICogc2VsZi5zb3J0RGlyZWN0aW9ucygpW2luZGV4KCldKCkpO1xuICAgICAgICBpZiAoc2VsZi5zb3J0Q29sdW1ucy5pbmRleE9mKGluZGV4KCkpIDwgMCkge1xuICAgICAgICAgIGlmIChldmVudC5zaGlmdEtleSB8fCBzZWxmLm11bHRpU29ydCgpKSB7XG4gICAgICAgICAgICBzZWxmLnNvcnRDb2x1bW5zLnB1c2goaW5kZXgoKSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNlbGYuc29ydENvbHVtbnMucmVtb3ZlQWxsKCk7XG4gICAgICAgICAgICBzZWxmLnNvcnRDb2x1bW5zLnB1c2goaW5kZXgoKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHNlbGYuc29ydENvbHVtbihpbmRleCgpKTtcbiAgICAgIH07XG5cbiAgICAgIHNlbGYuc29ydENvbHVtbnMgPSBrby5vYnNlcnZhYmxlQXJyYXkoW10pO1xuICAgICAgc2VsZi5zb3J0TGFiZWxDbGljayA9IGZ1bmN0aW9uKGluZGV4LCBkYXRhLCBldmVudCkge1xuICAgICAgICBzZWxmLnNvcnRDb2x1bW5zLnJlbW92ZShkYXRhKTtcbiAgICAgIH07XG4gICAgICBzZWxmLmxhYmVsSFRNTCA9IGZ1bmN0aW9uKGluZGV4LCBkYXRhKSB7XG4gICAgICAgIGlmIChzZWxmLnNvcnREaXJlY3Rpb25zKClbc2VsZi5zb3J0Q29sdW1ucygpW2luZGV4KCldXSgpID09IC0xKSB7XG4gICAgICAgICAgcmV0dXJuIFwiPGEgaHJlZj1cXFwiI1xcXCI+XCIgKyBkYXRhLm5hbWUgKyBcIjwvYT5cIlxuICAgICAgICB9IGVsc2UgaWYgKHNlbGYuc29ydERpcmVjdGlvbnMoKVtzZWxmLnNvcnRDb2x1bW5zKClbaW5kZXgoKV1dKCkgPT0gMSkge1xuICAgICAgICAgIHJldHVybiBcIjxhIGhyZWY9XFxcIiNcXFwiPlwiICsgZGF0YS5uYW1lICsgXCI8L2E+XCJcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gXCJcIlxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBzZWxmLmNsZWFyTGFiZWxzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHNlbGYuc29ydENvbHVtbnMucmVtb3ZlQWxsKCk7XG4gICAgICB9XG4gICAgICBzZWxmLmNsZWFyRmlsdGVycyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNlbGYuaGVhZGVycygpLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgaWYgKHNlbGYuaGVhZGVycygpW2ldLmZpbHRlclZhbHVlICE9IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgc2VsZi5oZWFkZXJzKClbaV0uZmlsdGVyVmFsdWUobnVsbCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBzZWxmLmhpZGVBbGxDb2x1bW5zID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2VsZi5oZWFkZXJzKCkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBzZWxmLmhlYWRlcnMoKVtpXS5kaXNwbGF5KGZhbHNlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgc2VsZi5yZXNldENvbHVtbnMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzZWxmLmhlYWRlcnMoKS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHNlbGYuaGVhZGVycygpW2ldLmRpc3BsYXkoc2VsZi5oZWFkZXJzKClbaV0uZGVmYXVsdERpc3BsYXkoKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHNlbGYuc29ydENvbHVtbnMucHVzaCgxKTtcbiAgICAgIHNlbGYuZGF0YV9jYWNoZSA9IGtvLmNvbXB1dGVkKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZCA9IGtvLm9ic2VydmFibGVBcnJheShbXSksXG4gICAgICAgICAgcm93LCBhZ2lUb3RhbCwgaW50VG90YWwsIHN0clRvdGFsLCBwcmltYXJ5VG90YWw7XG4gICAgICAgIGZvciAoaCBpbiBoZXJvRGF0YSkge1xuICAgICAgICAgIHZhciByb3cgPSBbXSxcbiAgICAgICAgICAgIGhEYXRhID0gaGVyb0RhdGFbaF0sXG4gICAgICAgICAgICBhZ2lUb3RhbCA9IGF0dHJpYnV0ZU1vZGlmaWVycy5hZ2lsaXR5LmNhbGwoaERhdGEsIHNlbGYubGV2ZWwoKSwgc2VsZi5ib251cygpKSxcbiAgICAgICAgICAgIGludFRvdGFsID0gYXR0cmlidXRlTW9kaWZpZXJzLmludGVsbGlnZW5jZS5jYWxsKGhEYXRhLCBzZWxmLmxldmVsKCksIHNlbGYuYm9udXMoKSksXG4gICAgICAgICAgICBzdHJUb3RhbCA9IGF0dHJpYnV0ZU1vZGlmaWVycy5zdHJlbmd0aC5jYWxsKGhEYXRhLCBzZWxmLmxldmVsKCksIHNlbGYuYm9udXMoKSksXG4gICAgICAgICAgICBwcmltYXJ5VG90YWwgPSBLVExJQi5nZXRBdHRyaWJ1dGVBdExldmVsLmNhbGwoaERhdGEsIGhEYXRhLmF0dHJpYnV0ZXByaW1hcnksIHNlbGYubGV2ZWwoKSwgc2VsZi5ib251cygpKTtcbiAgICAgICAgICByb3cucHVzaCgnPGRpdiBjbGFzcz1cImhlcm9lcy1zcHJpdGUtJyArIGgucmVwbGFjZSgnbnBjX2RvdGFfaGVyb18nLCAnJykgKyAnIGhlcm9lcy1zcHJpdGUtMzJ4MThcIj48L2Rpdj4nKTtcbiAgICAgICAgICByb3cucHVzaChoZXJvRGF0YVtoXS5kaXNwbGF5bmFtZSk7XG4gICAgICAgICAgcm93LnB1c2goZ2V0UHJpbWFyeVN0YXQoaCkpO1xuICAgICAgICAgIHJvdy5wdXNoKGFnaVRvdGFsLnRvUHJlY2lzaW9uKDMpKTtcbiAgICAgICAgICByb3cucHVzaChpbnRUb3RhbC50b1ByZWNpc2lvbigzKSk7XG4gICAgICAgICAgcm93LnB1c2goc3RyVG90YWwudG9QcmVjaXNpb24oMykpO1xuICAgICAgICAgIHJvdy5wdXNoKGhlcm9EYXRhW2hdLmF0dHJpYnV0ZWFnaWxpdHlnYWluKTtcbiAgICAgICAgICByb3cucHVzaChoZXJvRGF0YVtoXS5hdHRyaWJ1dGVpbnRlbGxpZ2VuY2VnYWluKTtcbiAgICAgICAgICByb3cucHVzaChoZXJvRGF0YVtoXS5hdHRyaWJ1dGVzdHJlbmd0aGdhaW4pO1xuXG4gICAgICAgICAgcm93LnB1c2goYXR0cmlidXRlTW9kaWZpZXJzLmF0dGFja2RhbWFnZW1pbi5jYWxsKGhEYXRhLCBzZWxmLmxldmVsKCksIHNlbGYuYm9udXMoKSkudG9QcmVjaXNpb24oMykpO1xuICAgICAgICAgIHJvdy5wdXNoKGF0dHJpYnV0ZU1vZGlmaWVycy5hdHRhY2tkYW1hZ2VtYXguY2FsbChoRGF0YSwgc2VsZi5sZXZlbCgpLCBzZWxmLmJvbnVzKCkpLnRvUHJlY2lzaW9uKDMpKTtcbiAgICAgICAgICByb3cucHVzaChhdHRyaWJ1dGVNb2RpZmllcnMuYXR0YWNrZGFtYWdlYXZnLmNhbGwoaERhdGEsIHNlbGYubGV2ZWwoKSwgc2VsZi5ib251cygpKS50b1ByZWNpc2lvbigzKSk7XG4gICAgICAgICAgcm93LnB1c2goYXR0cmlidXRlTW9kaWZpZXJzLmFybW9ycGh5c2ljYWwuY2FsbChoRGF0YSwgc2VsZi5sZXZlbCgpLCBzZWxmLmJvbnVzKCkpLnRvUHJlY2lzaW9uKDMpKTtcbiAgICAgICAgICByb3cucHVzaChhdHRyaWJ1dGVNb2RpZmllcnMuZWhwLmNhbGwoaERhdGEsIHNlbGYubGV2ZWwoKSwgc2VsZi5ib251cygpKS50b1ByZWNpc2lvbig0KSk7XG4gICAgICAgICAgcm93LnB1c2goYXR0cmlidXRlTW9kaWZpZXJzLm1laHAuY2FsbChoRGF0YSwgc2VsZi5sZXZlbCgpLCBzZWxmLmJvbnVzKCkpLnRvUHJlY2lzaW9uKDQpKTtcbiAgICAgICAgICByb3cucHVzaChhdHRyaWJ1dGVNb2RpZmllcnMuc3RhdHVzaGVhbHRoLmNhbGwoaERhdGEsIHNlbGYubGV2ZWwoKSwgc2VsZi5ib251cygpKS50b1ByZWNpc2lvbig0KSk7XG4gICAgICAgICAgcm93LnB1c2goYXR0cmlidXRlTW9kaWZpZXJzLnN0YXR1c2hlYWx0aHJlZ2VuLmNhbGwoaERhdGEsIHNlbGYubGV2ZWwoKSwgc2VsZi5ib251cygpKS50b1ByZWNpc2lvbigzKSk7XG4gICAgICAgICAgcm93LnB1c2goYXR0cmlidXRlTW9kaWZpZXJzLnN0YXR1c21hbmEuY2FsbChoRGF0YSwgc2VsZi5sZXZlbCgpLCBzZWxmLmJvbnVzKCkpLnRvUHJlY2lzaW9uKDQpKTtcbiAgICAgICAgICByb3cucHVzaChhdHRyaWJ1dGVNb2RpZmllcnMuc3RhdHVzbWFuYXJlZ2VuLmNhbGwoaERhdGEsIHNlbGYubGV2ZWwoKSwgc2VsZi5ib251cygpKS50b1ByZWNpc2lvbigzKSk7XG4gICAgICAgICAgaWYgKGhlcm9EYXRhW2hdLmF0dGFja3R5cGUgPT0gJ0RPVEFfVU5JVF9DQVBfTUVMRUVfQVRUQUNLJykge1xuICAgICAgICAgICAgcm93LnB1c2goJ01lbGVlJyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJvdy5wdXNoKCdSYW5nZWQnKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcm93LnB1c2goaGVyb0RhdGFbaF0uYXR0YWNrcmFuZ2UpO1xuICAgICAgICAgIHJvdy5wdXNoKGhlcm9EYXRhW2hdLmF0dGFja3JhdGUpO1xuICAgICAgICAgIHJvdy5wdXNoKGhlcm9EYXRhW2hdLmF0dGFja3BvaW50KTtcbiAgICAgICAgICByb3cucHVzaChoZXJvRGF0YVtoXS5wcm9qZWN0aWxlc3BlZWQpO1xuICAgICAgICAgIHJvdy5wdXNoKGhlcm9EYXRhW2hdLnZpc2lvbmRheXRpbWVyYW5nZSk7XG4gICAgICAgICAgcm93LnB1c2goaGVyb0RhdGFbaF0udmlzaW9ubmlnaHR0aW1lcmFuZ2UpO1xuICAgICAgICAgIHJvdy5wdXNoKGhlcm9EYXRhW2hdLm1vdmVtZW50c3BlZWQpO1xuICAgICAgICAgIHJvdy5wdXNoKGhlcm9EYXRhW2hdLm1vdmVtZW50dHVybnJhdGUpO1xuXG4gICAgICAgICAgZC5wdXNoKHJvdyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGQ7XG4gICAgICB9KTtcbiAgICAgIHNlbGYuZGF0YSA9IGtvLmNvbXB1dGVkKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZCA9IHNlbGYuZGF0YV9jYWNoZSgpO1xuICAgICAgICBkLnNvcnQoZnVuY3Rpb24oYSwgYikge1xuICAgICAgICAgIHZhciBpID0gMDtcbiAgICAgICAgICB3aGlsZSAoaSA8IHNlbGYuc29ydENvbHVtbnMoKS5sZW5ndGgpIHtcbiAgICAgICAgICAgIGlmIChzZWxmLnNvcnRDb2x1bW5zKClbaV0gPiAyICYmIHNlbGYuaGVhZGVycygpW3NlbGYuc29ydENvbHVtbnMoKVtpXV0ubmFtZSAhPSAnQXRrIFR5cGUnKSB7XG4gICAgICAgICAgICAgIGlmIChwYXJzZUZsb2F0KGFbc2VsZi5zb3J0Q29sdW1ucygpW2ldXSkgPiBwYXJzZUZsb2F0KGJbc2VsZi5zb3J0Q29sdW1ucygpW2ldXSkpIHJldHVybiAxICogc2VsZi5zb3J0RGlyZWN0aW9ucygpW3NlbGYuc29ydENvbHVtbnMoKVtpXV0oKTtcbiAgICAgICAgICAgICAgaWYgKHBhcnNlRmxvYXQoYVtzZWxmLnNvcnRDb2x1bW5zKClbaV1dKSA8IHBhcnNlRmxvYXQoYltzZWxmLnNvcnRDb2x1bW5zKClbaV1dKSkgcmV0dXJuIC0xICogc2VsZi5zb3J0RGlyZWN0aW9ucygpW3NlbGYuc29ydENvbHVtbnMoKVtpXV0oKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGlmIChhW3NlbGYuc29ydENvbHVtbnMoKVtpXV0gPiBiW3NlbGYuc29ydENvbHVtbnMoKVtpXV0pIHJldHVybiAxICogc2VsZi5zb3J0RGlyZWN0aW9ucygpW3NlbGYuc29ydENvbHVtbnMoKVtpXV0oKTtcbiAgICAgICAgICAgICAgaWYgKGFbc2VsZi5zb3J0Q29sdW1ucygpW2ldXSA8IGJbc2VsZi5zb3J0Q29sdW1ucygpW2ldXSkgcmV0dXJuIC0xICogc2VsZi5zb3J0RGlyZWN0aW9ucygpW3NlbGYuc29ydENvbHVtbnMoKVtpXV0oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGkgKz0gMTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gZCgpLmZpbHRlcihmdW5jdGlvbihyb3cpIHtcbiAgICAgICAgICByZXR1cm4gcm93LmV2ZXJ5KGZ1bmN0aW9uKGl0ZW0sIGkpIHtcbiAgICAgICAgICAgIGlmICghc2VsZi5oZWFkZXJzKClbaV0uZmlsdGVyKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIGlmICghc2VsZi5oZWFkZXJzKClbaV0uZmlsdGVyVmFsdWUoKSkgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICBzd2l0Y2ggKHNlbGYuaGVhZGVycygpW2ldLmZpbHRlclR5cGUpIHtcbiAgICAgICAgICAgICAgY2FzZSAnbnVtZXJpYyc6XG4gICAgICAgICAgICAgICAgc3dpdGNoIChzZWxmLmhlYWRlcnMoKVtpXS5maWx0ZXJDb21wYXJpc29uKCkpIHtcbiAgICAgICAgICAgICAgICAgIGNhc2UgJ2d0JzpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQoaXRlbSkgPiBwYXJzZUZsb2F0KHNlbGYuaGVhZGVycygpW2ldLmZpbHRlclZhbHVlKCkpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgIGNhc2UgJ2x0JzpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQoaXRlbSkgPCBwYXJzZUZsb2F0KHNlbGYuaGVhZGVycygpW2ldLmZpbHRlclZhbHVlKCkpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgIGNhc2UgJ2dlJzpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQoaXRlbSkgPj0gcGFyc2VGbG9hdChzZWxmLmhlYWRlcnMoKVtpXS5maWx0ZXJWYWx1ZSgpKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICBjYXNlICdsZSc6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBwYXJzZUZsb2F0KGl0ZW0pIDw9IHBhcnNlRmxvYXQoc2VsZi5oZWFkZXJzKClbaV0uZmlsdGVyVmFsdWUoKSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgY2FzZSAnZXEnOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGFyc2VGbG9hdChpdGVtKSA9PSBwYXJzZUZsb2F0KHNlbGYuaGVhZGVycygpW2ldLmZpbHRlclZhbHVlKCkpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIGNhc2UgJ3N0cmluZyc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGl0ZW0udG9Mb3dlckNhc2UoKS5pbmRleE9mKHNlbGYuaGVhZGVycygpW2ldLmZpbHRlclZhbHVlKCkudG9Mb3dlckNhc2UoKSkgIT0gLTE7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIGNhc2UgJ3NlbGVjdCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGl0ZW0gPT0gc2VsZi5oZWFkZXJzKClbaV0uZmlsdGVyVmFsdWUoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBzZWxmLmhlYWRlcnMoKVtpXS5maWx0ZXI7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfSwgdGhpcyk7XG5cbiAgICAgIHNlbGYudG9nZ2xlQ29sdW1uID0gZnVuY3Rpb24oaW5kZXgsIGRhdGEsIGV2ZW50KSB7XG4gICAgICAgIHNlbGYuaGVhZGVycygpW2luZGV4KCldLmRpc3BsYXkoIXNlbGYuaGVhZGVycygpW2luZGV4KCldLmRpc3BsYXkoKSlcbiAgICAgIH07XG4gICAgfVxuXG4gICAga28uYXBwbHlCaW5kaW5ncyhuZXcgVGFibGVWaWV3TW9kZWwoKSk7XG4gICAgLyokLmdldEpTT04oXCIvbWVkaWEvanMvaGVyb2RhdGEuanNvblwiLCBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgaGVyb0RhdGEgPSBkYXRhO1xuICAgICAga28uYXBwbHlCaW5kaW5ncyhuZXcgVGFibGVWaWV3TW9kZWwoKSk7XG4gICAgfSk7Ki9cbiAgfSk7XG5cbn0pOyJdfQ==
