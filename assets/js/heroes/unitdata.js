require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({43:[function(require,module,exports){
var $ = jQuery = require('jquery');
require('bootstrap');

$(function () {
    var heroData = {};
    
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
    
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    function getDisplayName(h, heroData) {
        var split_h = h.split('_');
        var suffix = '';
        if (split_h.indexOf('goodguys') != -1) {
            suffix += ' ' + 'Radiant';
        }
        else if (split_h.indexOf('badguys') != -1) {
            suffix += ' ' + 'Dire';
        }
        if (!isNaN(split_h[split_h.length - 1])) {
            suffix += ' ' + split_h[split_h.length - 1];
        }
        else if (!isNaN(split_h[split_h.length - 1].charAt(split_h[split_h.length - 1].length - 1))) {
            suffix += ' ' + split_h[split_h.length - 1].charAt(split_h[split_h.length - 1].length - 1);
        }
        else if (split_h[split_h.length - 1] == 'bot' || split_h[split_h.length - 1] == 'mid' || split_h[split_h.length - 1] == 'top') {
            suffix += ' ';
            if (split_h[split_h.length - 2].indexOf('tower') != -1) {
                suffix += split_h[split_h.length - 2].replace('tower', 'Tier ')
            }
            suffix += ' ' + capitalizeFirstLetter(split_h[split_h.length - 1]);
        }
        else if (split_h[split_h.length - 1] == 'halloween') {
            suffix += ' ' + 'Halloween';
        }
        else if (split_h[split_h.length - 1] == 'torso') {
            suffix += ' ' + 'Torso';
        }
        return (heroData[h].displayname ? heroData[h].displayname : h) + suffix;
    }

  function getTotalAttribute(h, type, level, bonus) {
    var basestat = 0,
            statgain = 0;
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
            {name: 'ID', display: ko.observable(false), align: '', filter: true, filterType: 'string', filterValue: ko.observable()},
      {name: 'Name', display: ko.observable(true), align: '', filter: true, filterType: 'string', filterValue: ko.observable()},
      {name: 'Min Dmg', display: ko.observable(false), align: 'right', filter: true, filterType: 'numeric', filterValue: ko.observable(), filterComparison: ko.observable()},
      {name: 'Max Dmg', display: ko.observable(false), align: 'right', filter: true, filterType: 'numeric', filterValue: ko.observable(), filterComparison: ko.observable()},
      {name: 'Avg Dmg', display: ko.observable(true), align: 'right', filter: true, filterType: 'numeric', filterValue: ko.observable(), filterComparison: ko.observable()},
      {name: 'Armor', display: ko.observable(true), align: 'right', filter: true, filterType: 'numeric', filterValue: ko.observable(), filterComparison: ko.observable()},
      {name: 'EHP', display: ko.observable(true), align: 'right', filter: true, filterType: 'numeric', filterValue: ko.observable(), filterComparison: ko.observable()},
      {name: 'EHP Magic', display: ko.observable(false), align: 'right', filter: true, filterType: 'numeric', filterValue: ko.observable(), filterComparison: ko.observable()},
      {name: 'HP', display: ko.observable(true), align: 'right', filter: true, filterType: 'numeric', filterValue: ko.observable(), filterComparison: ko.observable()},
      {name: 'HP Regen', display: ko.observable(false), align: 'right', filter: true, filterType: 'numeric', filterValue: ko.observable(), filterComparison: ko.observable()},
      {name: 'Mana', display: ko.observable(true), align: 'right', filter: true, filterType: 'numeric', filterValue: ko.observable(), filterComparison: ko.observable()},
      {name: 'Mana Regen', display: ko.observable(false), align: 'right', filter: true, filterType: 'numeric', filterValue: ko.observable(), filterComparison: ko.observable()},
      {name: 'Atk Type', display: ko.observable(true), align: 'center', filter: true, filterType: 'select', filterOptions: [{text: 'Ranged', value: 'Ranged'}, {text: 'Melee', value: 'Melee'}], filterValue: ko.observable()},
      {name: 'Atk Range', display: ko.observable(true), align: 'right', filter: true, filterType: 'numeric', filterValue: ko.observable(), filterComparison: ko.observable()},
      {name: '<abbr title=\"Base Attack Time\">BAT</abbr>', display: ko.observable(false), align: 'right', filter: true, filterType: 'numeric', filterValue: ko.observable(), filterComparison: ko.observable()},
      {name: 'Atk Point', display: ko.observable(false), align: 'right', filter: true, filterType: 'numeric', filterValue: ko.observable(), filterComparison: ko.observable()},
      {name: 'Projectile Speed', display: ko.observable(false), align: 'right', filter: true, filterType: 'numeric', filterValue: ko.observable(), filterComparison: ko.observable()},
      {name: 'Day Vision Range', display: ko.observable(false), align: 'right', filter: true, filterType: 'numeric', filterValue: ko.observable(), filterComparison: ko.observable()},
      {name: 'Night Vision Range', display: ko.observable(false), align: 'right', filter: true, filterType: 'numeric', filterValue: ko.observable(), filterComparison: ko.observable()},
      {name: '<abbr title=\"Movement Speed\">MS</abbr>', display: ko.observable(true), align: 'right', filter: true, filterType: 'numeric', filterValue: ko.observable(), filterComparison: ko.observable()},
      {name: 'Turn Rate', display: ko.observable(false), align: 'right', filter: true, filterType: 'numeric', filterValue: ko.observable(), filterComparison: ko.observable()},
      {name: 'Gold Min', display: ko.observable(true), align: 'right', filter: true, filterType: 'numeric', filterValue: ko.observable(), filterComparison: ko.observable()},
      {name: 'Gold Max', display: ko.observable(true), align: 'right', filter: true, filterType: 'numeric', filterValue: ko.observable(), filterComparison: ko.observable()},
      {name: 'XP Bounty', display: ko.observable(true), align: 'right', filter: true, filterType: 'numeric', filterValue: ko.observable(), filterComparison: ko.observable()},
      {name: 'Level', display: ko.observable(true), align: 'right', filter: true, filterType: 'numeric', filterValue: ko.observable(), filterComparison: ko.observable()}
    ]);
        for (var i = 0; i < self.headers().length; i++) {
            self.headers()[i].defaultDisplay = ko.observable(self.headers()[i].display());
        }
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
        self.clearLabels = function () {
            self.sortColumns.removeAll();
        }
        self.clearFilters = function () {
            for (var i = 0; i < self.headers().length; i++) {
                if (self.headers()[i].filterValue != undefined) {
                    self.headers()[i].filterValue(null);
                }
            }
        }
        self.hideAllColumns = function () {
            for (var i = 0; i < self.headers().length; i++) {
                self.headers()[i].display(false);
            }
        }
        self.resetColumns = function () {
            for (var i = 0; i < self.headers().length; i++) {
                self.headers()[i].display(self.headers()[i].defaultDisplay());
            }
        }
    self.sortColumns.push(1);
    self.data_cache = ko.computed(function() {
      var d = ko.observableArray([]),
                row, agiTotal, intTotal, strTotal, primaryTotal;
      for (h in heroData) {
        row = [],
                agiTotal = getTotalAttribute(h,'agi', self.level(), self.bonus()),
                intTotal = getTotalAttribute(h,'int', self.level(), self.bonus()),
                strTotal = getTotalAttribute(h,'str', self.level(), self.bonus()),
                primaryTotal = getTotalAttribute(h,getPrimaryStat(h), self.level(), self.bonus());
        //row.push('<img src=\'/dota2/images/heroes/' + h.replace('npc_dota_hero_','') + '.png\' />');
                row.push(h);
        row.push(getDisplayName(h, heroData));

        row.push((heroData[h].attackdamagemin + primaryTotal).toPrecision(3));
        row.push((heroData[h].attackdamagemax + primaryTotal).toPrecision(3));
        row.push(((heroData[h].attackdamagemax-heroData[h].attackdamagemin)/2 + primaryTotal + heroData[h].attackdamagemin).toPrecision(3));
        row.push((heroData[h].armorphysical + agiTotal*.14).toPrecision(3));
        row.push(
                    (
                        (heroData[h].statushealth + strTotal*19) * (1 + (heroData[h].armorphysical + agiTotal*.14) * 0.06)
                    ).toPrecision(4)
                );
        row.push(
                    (
                        (heroData[h].statushealth + strTotal*19) * (1/(1-heroData[h].magicalresistance/100))
                    ).toPrecision(4)
                );
        row.push((heroData[h].statushealth + strTotal*19).toPrecision(4));
        row.push((heroData[h].statushealthregen + strTotal*.03).toPrecision(3));
        row.push((heroData[h].statusmana + intTotal*13).toPrecision(4));
        row.push((heroData[h].statusmanaregen + intTotal*.04).toPrecision(3));
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
        row.push(heroData[h].bountygoldmin);
        row.push(heroData[h].bountygoldmax);
        row.push(heroData[h].bountyxp);
        row.push(heroData[h].unitlevel);
        
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
    
    self.toggleColumn = function(index,data,event) {
      self.headers()[index()].display(!self.headers()[index()].display())
    };
  }

  $.getJSON("/media/dota-json/unitdata.json", function (data) {
    heroData = data;
    ko.applyBindings(new TableViewModel());
  });

});
},{"bootstrap":1,"jquery":25}]},{},[43])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvaGVyb2VzL3VuaXRkYXRhLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgJCA9IGpRdWVyeSA9IHJlcXVpcmUoJ2pxdWVyeScpO1xucmVxdWlyZSgnYm9vdHN0cmFwJyk7XG5cbiQoZnVuY3Rpb24gKCkge1xuICAgIHZhciBoZXJvRGF0YSA9IHt9O1xuICAgIFxuICAkKCcuZHJvcGRvd24tbWVudScpLmNsaWNrKGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICB9KTtcblxuICBmdW5jdGlvbiBnZXRQcmltYXJ5U3RhdChoKSB7XG4gICAgdmFyIHYgPSBoZXJvRGF0YVtoXS5hdHRyaWJ1dGVwcmltYXJ5O1xuICAgIGlmICh2ID09ICdET1RBX0FUVFJJQlVURV9BR0lMSVRZJykge1xuICAgICAgcmV0dXJuICdBZ2knXG4gICAgfVxuICAgIGVsc2UgaWYgKHYgPT0gJ0RPVEFfQVRUUklCVVRFX0lOVEVMTEVDVCcpIHtcbiAgICAgIHJldHVybiAnSW50J1xuICAgIH1cbiAgICBlbHNlIGlmICh2ID09ICdET1RBX0FUVFJJQlVURV9TVFJFTkdUSCcpIHtcbiAgICAgIHJldHVybiAnU3RyJ1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHJldHVybiAnJ1xuICAgIH1cbiAgfVxuICAgIFxuICAgIGZ1bmN0aW9uIGNhcGl0YWxpemVGaXJzdExldHRlcihzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIHN0cmluZy5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHN0cmluZy5zbGljZSgxKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXREaXNwbGF5TmFtZShoLCBoZXJvRGF0YSkge1xuICAgICAgICB2YXIgc3BsaXRfaCA9IGguc3BsaXQoJ18nKTtcbiAgICAgICAgdmFyIHN1ZmZpeCA9ICcnO1xuICAgICAgICBpZiAoc3BsaXRfaC5pbmRleE9mKCdnb29kZ3V5cycpICE9IC0xKSB7XG4gICAgICAgICAgICBzdWZmaXggKz0gJyAnICsgJ1JhZGlhbnQnO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHNwbGl0X2guaW5kZXhPZignYmFkZ3V5cycpICE9IC0xKSB7XG4gICAgICAgICAgICBzdWZmaXggKz0gJyAnICsgJ0RpcmUnO1xuICAgICAgICB9XG4gICAgICAgIGlmICghaXNOYU4oc3BsaXRfaFtzcGxpdF9oLmxlbmd0aCAtIDFdKSkge1xuICAgICAgICAgICAgc3VmZml4ICs9ICcgJyArIHNwbGl0X2hbc3BsaXRfaC5sZW5ndGggLSAxXTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICghaXNOYU4oc3BsaXRfaFtzcGxpdF9oLmxlbmd0aCAtIDFdLmNoYXJBdChzcGxpdF9oW3NwbGl0X2gubGVuZ3RoIC0gMV0ubGVuZ3RoIC0gMSkpKSB7XG4gICAgICAgICAgICBzdWZmaXggKz0gJyAnICsgc3BsaXRfaFtzcGxpdF9oLmxlbmd0aCAtIDFdLmNoYXJBdChzcGxpdF9oW3NwbGl0X2gubGVuZ3RoIC0gMV0ubGVuZ3RoIC0gMSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoc3BsaXRfaFtzcGxpdF9oLmxlbmd0aCAtIDFdID09ICdib3QnIHx8IHNwbGl0X2hbc3BsaXRfaC5sZW5ndGggLSAxXSA9PSAnbWlkJyB8fCBzcGxpdF9oW3NwbGl0X2gubGVuZ3RoIC0gMV0gPT0gJ3RvcCcpIHtcbiAgICAgICAgICAgIHN1ZmZpeCArPSAnICc7XG4gICAgICAgICAgICBpZiAoc3BsaXRfaFtzcGxpdF9oLmxlbmd0aCAtIDJdLmluZGV4T2YoJ3Rvd2VyJykgIT0gLTEpIHtcbiAgICAgICAgICAgICAgICBzdWZmaXggKz0gc3BsaXRfaFtzcGxpdF9oLmxlbmd0aCAtIDJdLnJlcGxhY2UoJ3Rvd2VyJywgJ1RpZXIgJylcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN1ZmZpeCArPSAnICcgKyBjYXBpdGFsaXplRmlyc3RMZXR0ZXIoc3BsaXRfaFtzcGxpdF9oLmxlbmd0aCAtIDFdKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChzcGxpdF9oW3NwbGl0X2gubGVuZ3RoIC0gMV0gPT0gJ2hhbGxvd2VlbicpIHtcbiAgICAgICAgICAgIHN1ZmZpeCArPSAnICcgKyAnSGFsbG93ZWVuJztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChzcGxpdF9oW3NwbGl0X2gubGVuZ3RoIC0gMV0gPT0gJ3RvcnNvJykge1xuICAgICAgICAgICAgc3VmZml4ICs9ICcgJyArICdUb3Jzbyc7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIChoZXJvRGF0YVtoXS5kaXNwbGF5bmFtZSA/IGhlcm9EYXRhW2hdLmRpc3BsYXluYW1lIDogaCkgKyBzdWZmaXg7XG4gICAgfVxuXG4gIGZ1bmN0aW9uIGdldFRvdGFsQXR0cmlidXRlKGgsIHR5cGUsIGxldmVsLCBib251cykge1xuICAgIHZhciBiYXNlc3RhdCA9IDAsXG4gICAgICAgICAgICBzdGF0Z2FpbiA9IDA7XG4gICAgaWYgKHR5cGUudG9Mb3dlckNhc2UoKSA9PSAnYWdpJykge1xuICAgICAgYmFzZXN0YXQgPSBoZXJvRGF0YVtoXS5hdHRyaWJ1dGViYXNlYWdpbGl0eVxuICAgICAgc3RhdGdhaW4gPSBoZXJvRGF0YVtoXS5hdHRyaWJ1dGVhZ2lsaXR5Z2FpblxuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlLnRvTG93ZXJDYXNlKCkgID09ICdpbnQnKSB7XG4gICAgICBiYXNlc3RhdCA9IGhlcm9EYXRhW2hdLmF0dHJpYnV0ZWJhc2VpbnRlbGxpZ2VuY2VcbiAgICAgIHN0YXRnYWluID0gaGVyb0RhdGFbaF0uYXR0cmlidXRlaW50ZWxsaWdlbmNlZ2FpblxuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlLnRvTG93ZXJDYXNlKCkgID09ICdzdHInKSB7XG4gICAgICBiYXNlc3RhdCA9IGhlcm9EYXRhW2hdLmF0dHJpYnV0ZWJhc2VzdHJlbmd0aFxuICAgICAgc3RhdGdhaW4gPSBoZXJvRGF0YVtoXS5hdHRyaWJ1dGVzdHJlbmd0aGdhaW5cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICByZXR1cm4gMFxuICAgIH1cbiAgICByZXR1cm4gTWF0aC5mbG9vcihiYXNlc3RhdCArIHN0YXRnYWluICogKGxldmVsIC0gMSkgKyBib251cyAqIDIpO1xuICB9XG5cbiAgZnVuY3Rpb24gVGFibGVWaWV3TW9kZWwoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBzZWxmLmZpbHRlclZpc2libGUgPSBrby5vYnNlcnZhYmxlKGZhbHNlKTtcbiAgICAgICAgc2VsZi50b2dnbGVGaWx0ZXJWaXNpYmlsaXR5ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc2VsZi5maWx0ZXJWaXNpYmxlKCFzZWxmLmZpbHRlclZpc2libGUoKSk7XG4gICAgICAgIH1cbiAgICAgICAgc2VsZi5maWx0ZXJUZW1wbGF0ZVRvVXNlID0gZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgIHJldHVybiBpdGVtLmZpbHRlclR5cGUgKyAnLWZpbHRlcic7XG4gICAgICAgIH1cbiAgICBzZWxmLmhlYWRlcnMgPSBrby5vYnNlcnZhYmxlQXJyYXkoW1xuICAgICAgICAgICAge25hbWU6ICdJRCcsIGRpc3BsYXk6IGtvLm9ic2VydmFibGUoZmFsc2UpLCBhbGlnbjogJycsIGZpbHRlcjogdHJ1ZSwgZmlsdGVyVHlwZTogJ3N0cmluZycsIGZpbHRlclZhbHVlOiBrby5vYnNlcnZhYmxlKCl9LFxuICAgICAge25hbWU6ICdOYW1lJywgZGlzcGxheToga28ub2JzZXJ2YWJsZSh0cnVlKSwgYWxpZ246ICcnLCBmaWx0ZXI6IHRydWUsIGZpbHRlclR5cGU6ICdzdHJpbmcnLCBmaWx0ZXJWYWx1ZToga28ub2JzZXJ2YWJsZSgpfSxcbiAgICAgIHtuYW1lOiAnTWluIERtZycsIGRpc3BsYXk6IGtvLm9ic2VydmFibGUoZmFsc2UpLCBhbGlnbjogJ3JpZ2h0JywgZmlsdGVyOiB0cnVlLCBmaWx0ZXJUeXBlOiAnbnVtZXJpYycsIGZpbHRlclZhbHVlOiBrby5vYnNlcnZhYmxlKCksIGZpbHRlckNvbXBhcmlzb246IGtvLm9ic2VydmFibGUoKX0sXG4gICAgICB7bmFtZTogJ01heCBEbWcnLCBkaXNwbGF5OiBrby5vYnNlcnZhYmxlKGZhbHNlKSwgYWxpZ246ICdyaWdodCcsIGZpbHRlcjogdHJ1ZSwgZmlsdGVyVHlwZTogJ251bWVyaWMnLCBmaWx0ZXJWYWx1ZToga28ub2JzZXJ2YWJsZSgpLCBmaWx0ZXJDb21wYXJpc29uOiBrby5vYnNlcnZhYmxlKCl9LFxuICAgICAge25hbWU6ICdBdmcgRG1nJywgZGlzcGxheToga28ub2JzZXJ2YWJsZSh0cnVlKSwgYWxpZ246ICdyaWdodCcsIGZpbHRlcjogdHJ1ZSwgZmlsdGVyVHlwZTogJ251bWVyaWMnLCBmaWx0ZXJWYWx1ZToga28ub2JzZXJ2YWJsZSgpLCBmaWx0ZXJDb21wYXJpc29uOiBrby5vYnNlcnZhYmxlKCl9LFxuICAgICAge25hbWU6ICdBcm1vcicsIGRpc3BsYXk6IGtvLm9ic2VydmFibGUodHJ1ZSksIGFsaWduOiAncmlnaHQnLCBmaWx0ZXI6IHRydWUsIGZpbHRlclR5cGU6ICdudW1lcmljJywgZmlsdGVyVmFsdWU6IGtvLm9ic2VydmFibGUoKSwgZmlsdGVyQ29tcGFyaXNvbjoga28ub2JzZXJ2YWJsZSgpfSxcbiAgICAgIHtuYW1lOiAnRUhQJywgZGlzcGxheToga28ub2JzZXJ2YWJsZSh0cnVlKSwgYWxpZ246ICdyaWdodCcsIGZpbHRlcjogdHJ1ZSwgZmlsdGVyVHlwZTogJ251bWVyaWMnLCBmaWx0ZXJWYWx1ZToga28ub2JzZXJ2YWJsZSgpLCBmaWx0ZXJDb21wYXJpc29uOiBrby5vYnNlcnZhYmxlKCl9LFxuICAgICAge25hbWU6ICdFSFAgTWFnaWMnLCBkaXNwbGF5OiBrby5vYnNlcnZhYmxlKGZhbHNlKSwgYWxpZ246ICdyaWdodCcsIGZpbHRlcjogdHJ1ZSwgZmlsdGVyVHlwZTogJ251bWVyaWMnLCBmaWx0ZXJWYWx1ZToga28ub2JzZXJ2YWJsZSgpLCBmaWx0ZXJDb21wYXJpc29uOiBrby5vYnNlcnZhYmxlKCl9LFxuICAgICAge25hbWU6ICdIUCcsIGRpc3BsYXk6IGtvLm9ic2VydmFibGUodHJ1ZSksIGFsaWduOiAncmlnaHQnLCBmaWx0ZXI6IHRydWUsIGZpbHRlclR5cGU6ICdudW1lcmljJywgZmlsdGVyVmFsdWU6IGtvLm9ic2VydmFibGUoKSwgZmlsdGVyQ29tcGFyaXNvbjoga28ub2JzZXJ2YWJsZSgpfSxcbiAgICAgIHtuYW1lOiAnSFAgUmVnZW4nLCBkaXNwbGF5OiBrby5vYnNlcnZhYmxlKGZhbHNlKSwgYWxpZ246ICdyaWdodCcsIGZpbHRlcjogdHJ1ZSwgZmlsdGVyVHlwZTogJ251bWVyaWMnLCBmaWx0ZXJWYWx1ZToga28ub2JzZXJ2YWJsZSgpLCBmaWx0ZXJDb21wYXJpc29uOiBrby5vYnNlcnZhYmxlKCl9LFxuICAgICAge25hbWU6ICdNYW5hJywgZGlzcGxheToga28ub2JzZXJ2YWJsZSh0cnVlKSwgYWxpZ246ICdyaWdodCcsIGZpbHRlcjogdHJ1ZSwgZmlsdGVyVHlwZTogJ251bWVyaWMnLCBmaWx0ZXJWYWx1ZToga28ub2JzZXJ2YWJsZSgpLCBmaWx0ZXJDb21wYXJpc29uOiBrby5vYnNlcnZhYmxlKCl9LFxuICAgICAge25hbWU6ICdNYW5hIFJlZ2VuJywgZGlzcGxheToga28ub2JzZXJ2YWJsZShmYWxzZSksIGFsaWduOiAncmlnaHQnLCBmaWx0ZXI6IHRydWUsIGZpbHRlclR5cGU6ICdudW1lcmljJywgZmlsdGVyVmFsdWU6IGtvLm9ic2VydmFibGUoKSwgZmlsdGVyQ29tcGFyaXNvbjoga28ub2JzZXJ2YWJsZSgpfSxcbiAgICAgIHtuYW1lOiAnQXRrIFR5cGUnLCBkaXNwbGF5OiBrby5vYnNlcnZhYmxlKHRydWUpLCBhbGlnbjogJ2NlbnRlcicsIGZpbHRlcjogdHJ1ZSwgZmlsdGVyVHlwZTogJ3NlbGVjdCcsIGZpbHRlck9wdGlvbnM6IFt7dGV4dDogJ1JhbmdlZCcsIHZhbHVlOiAnUmFuZ2VkJ30sIHt0ZXh0OiAnTWVsZWUnLCB2YWx1ZTogJ01lbGVlJ31dLCBmaWx0ZXJWYWx1ZToga28ub2JzZXJ2YWJsZSgpfSxcbiAgICAgIHtuYW1lOiAnQXRrIFJhbmdlJywgZGlzcGxheToga28ub2JzZXJ2YWJsZSh0cnVlKSwgYWxpZ246ICdyaWdodCcsIGZpbHRlcjogdHJ1ZSwgZmlsdGVyVHlwZTogJ251bWVyaWMnLCBmaWx0ZXJWYWx1ZToga28ub2JzZXJ2YWJsZSgpLCBmaWx0ZXJDb21wYXJpc29uOiBrby5vYnNlcnZhYmxlKCl9LFxuICAgICAge25hbWU6ICc8YWJiciB0aXRsZT1cXFwiQmFzZSBBdHRhY2sgVGltZVxcXCI+QkFUPC9hYmJyPicsIGRpc3BsYXk6IGtvLm9ic2VydmFibGUoZmFsc2UpLCBhbGlnbjogJ3JpZ2h0JywgZmlsdGVyOiB0cnVlLCBmaWx0ZXJUeXBlOiAnbnVtZXJpYycsIGZpbHRlclZhbHVlOiBrby5vYnNlcnZhYmxlKCksIGZpbHRlckNvbXBhcmlzb246IGtvLm9ic2VydmFibGUoKX0sXG4gICAgICB7bmFtZTogJ0F0ayBQb2ludCcsIGRpc3BsYXk6IGtvLm9ic2VydmFibGUoZmFsc2UpLCBhbGlnbjogJ3JpZ2h0JywgZmlsdGVyOiB0cnVlLCBmaWx0ZXJUeXBlOiAnbnVtZXJpYycsIGZpbHRlclZhbHVlOiBrby5vYnNlcnZhYmxlKCksIGZpbHRlckNvbXBhcmlzb246IGtvLm9ic2VydmFibGUoKX0sXG4gICAgICB7bmFtZTogJ1Byb2plY3RpbGUgU3BlZWQnLCBkaXNwbGF5OiBrby5vYnNlcnZhYmxlKGZhbHNlKSwgYWxpZ246ICdyaWdodCcsIGZpbHRlcjogdHJ1ZSwgZmlsdGVyVHlwZTogJ251bWVyaWMnLCBmaWx0ZXJWYWx1ZToga28ub2JzZXJ2YWJsZSgpLCBmaWx0ZXJDb21wYXJpc29uOiBrby5vYnNlcnZhYmxlKCl9LFxuICAgICAge25hbWU6ICdEYXkgVmlzaW9uIFJhbmdlJywgZGlzcGxheToga28ub2JzZXJ2YWJsZShmYWxzZSksIGFsaWduOiAncmlnaHQnLCBmaWx0ZXI6IHRydWUsIGZpbHRlclR5cGU6ICdudW1lcmljJywgZmlsdGVyVmFsdWU6IGtvLm9ic2VydmFibGUoKSwgZmlsdGVyQ29tcGFyaXNvbjoga28ub2JzZXJ2YWJsZSgpfSxcbiAgICAgIHtuYW1lOiAnTmlnaHQgVmlzaW9uIFJhbmdlJywgZGlzcGxheToga28ub2JzZXJ2YWJsZShmYWxzZSksIGFsaWduOiAncmlnaHQnLCBmaWx0ZXI6IHRydWUsIGZpbHRlclR5cGU6ICdudW1lcmljJywgZmlsdGVyVmFsdWU6IGtvLm9ic2VydmFibGUoKSwgZmlsdGVyQ29tcGFyaXNvbjoga28ub2JzZXJ2YWJsZSgpfSxcbiAgICAgIHtuYW1lOiAnPGFiYnIgdGl0bGU9XFxcIk1vdmVtZW50IFNwZWVkXFxcIj5NUzwvYWJicj4nLCBkaXNwbGF5OiBrby5vYnNlcnZhYmxlKHRydWUpLCBhbGlnbjogJ3JpZ2h0JywgZmlsdGVyOiB0cnVlLCBmaWx0ZXJUeXBlOiAnbnVtZXJpYycsIGZpbHRlclZhbHVlOiBrby5vYnNlcnZhYmxlKCksIGZpbHRlckNvbXBhcmlzb246IGtvLm9ic2VydmFibGUoKX0sXG4gICAgICB7bmFtZTogJ1R1cm4gUmF0ZScsIGRpc3BsYXk6IGtvLm9ic2VydmFibGUoZmFsc2UpLCBhbGlnbjogJ3JpZ2h0JywgZmlsdGVyOiB0cnVlLCBmaWx0ZXJUeXBlOiAnbnVtZXJpYycsIGZpbHRlclZhbHVlOiBrby5vYnNlcnZhYmxlKCksIGZpbHRlckNvbXBhcmlzb246IGtvLm9ic2VydmFibGUoKX0sXG4gICAgICB7bmFtZTogJ0dvbGQgTWluJywgZGlzcGxheToga28ub2JzZXJ2YWJsZSh0cnVlKSwgYWxpZ246ICdyaWdodCcsIGZpbHRlcjogdHJ1ZSwgZmlsdGVyVHlwZTogJ251bWVyaWMnLCBmaWx0ZXJWYWx1ZToga28ub2JzZXJ2YWJsZSgpLCBmaWx0ZXJDb21wYXJpc29uOiBrby5vYnNlcnZhYmxlKCl9LFxuICAgICAge25hbWU6ICdHb2xkIE1heCcsIGRpc3BsYXk6IGtvLm9ic2VydmFibGUodHJ1ZSksIGFsaWduOiAncmlnaHQnLCBmaWx0ZXI6IHRydWUsIGZpbHRlclR5cGU6ICdudW1lcmljJywgZmlsdGVyVmFsdWU6IGtvLm9ic2VydmFibGUoKSwgZmlsdGVyQ29tcGFyaXNvbjoga28ub2JzZXJ2YWJsZSgpfSxcbiAgICAgIHtuYW1lOiAnWFAgQm91bnR5JywgZGlzcGxheToga28ub2JzZXJ2YWJsZSh0cnVlKSwgYWxpZ246ICdyaWdodCcsIGZpbHRlcjogdHJ1ZSwgZmlsdGVyVHlwZTogJ251bWVyaWMnLCBmaWx0ZXJWYWx1ZToga28ub2JzZXJ2YWJsZSgpLCBmaWx0ZXJDb21wYXJpc29uOiBrby5vYnNlcnZhYmxlKCl9LFxuICAgICAge25hbWU6ICdMZXZlbCcsIGRpc3BsYXk6IGtvLm9ic2VydmFibGUodHJ1ZSksIGFsaWduOiAncmlnaHQnLCBmaWx0ZXI6IHRydWUsIGZpbHRlclR5cGU6ICdudW1lcmljJywgZmlsdGVyVmFsdWU6IGtvLm9ic2VydmFibGUoKSwgZmlsdGVyQ29tcGFyaXNvbjoga28ub2JzZXJ2YWJsZSgpfVxuICAgIF0pO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNlbGYuaGVhZGVycygpLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBzZWxmLmhlYWRlcnMoKVtpXS5kZWZhdWx0RGlzcGxheSA9IGtvLm9ic2VydmFibGUoc2VsZi5oZWFkZXJzKClbaV0uZGlzcGxheSgpKTtcbiAgICAgICAgfVxuICAgIHNlbGYuaGVhZGVySFRNTCA9IGZ1bmN0aW9uKGluZGV4LCBkYXRhKSB7XG4gICAgICBpZiAoc2VsZi5zb3J0RGlyZWN0aW9ucygpW2luZGV4KCldKCkgPT0gLTEpIHtcbiAgICAgICAgcmV0dXJuIFwiPGEgaHJlZj1cXFwiI1xcXCI+XCIgKyAgZGF0YS5uYW1lICsgXCIgPGRpdiBjbGFzcz1cXFwiZ2x5cGhpY29uIGdseXBoaWNvbi1jaGV2cm9uLWRvd25cXFwiPjwvZGl2PjwvYT5cIlxuICAgICAgfVxuICAgICAgZWxzZSBpZiAoc2VsZi5zb3J0RGlyZWN0aW9ucygpW2luZGV4KCldKCkgPT0gMSkge1xuICAgICAgICByZXR1cm4gXCI8YSBocmVmPVxcXCIjXFxcIj5cIiArICBkYXRhLm5hbWUgKyBcIiA8ZGl2IGNsYXNzPVxcXCJnbHlwaGljb24gZ2x5cGhpY29uLWNoZXZyb24tdXBcXFwiPjwvZGl2PjwvYT5cIlxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHJldHVybiBcIlwiXG4gICAgICB9XG4gICAgfVxuICAgIHNlbGYubXVsdGlTb3J0ID0ga28ub2JzZXJ2YWJsZShmYWxzZSk7XG4gICAgc2VsZi5sZXZlbCA9IGtvLm9ic2VydmFibGUoMSk7XG4gICAgc2VsZi5ib251cyA9IGtvLm9ic2VydmFibGUoMCk7XG4gICAgc2VsZi5zb3J0RGlyZWN0aW9ucyA9IGtvLm9ic2VydmFibGVBcnJheShbXSk7XG4gICAgc2VsZi5pbml0U29ydERpcmVjdGlvbnMgPSBmdW5jdGlvbigpIHtcbiAgICAgIGZvciAodmFyIGk9MDtpPHNlbGYuaGVhZGVycygpLmxlbmd0aDtpKyspIHtcbiAgICAgICAgc2VsZi5zb3J0RGlyZWN0aW9ucy5wdXNoKG5ldyBrby5vYnNlcnZhYmxlKDEpKTtcbiAgICAgIH1cbiAgICB9XG4gICAgc2VsZi5pbml0U29ydERpcmVjdGlvbnMoKTtcbiAgICBzZWxmLnNvcnRDb2x1bW4gPSBrby5vYnNlcnZhYmxlKDEpO1xuICAgIHNlbGYuY29sdW1uQ2xpY2sgPSBmdW5jdGlvbihpbmRleCwgZGF0YSwgZXZlbnQpIHtcbiAgICAgIHNlbGYuc29ydERpcmVjdGlvbnMoKVtpbmRleCgpXSgtMSAqIHNlbGYuc29ydERpcmVjdGlvbnMoKVtpbmRleCgpXSgpKTtcbiAgICAgIGlmIChzZWxmLnNvcnRDb2x1bW5zLmluZGV4T2YoaW5kZXgoKSkgPCAwKSB7XG4gICAgICAgIGlmIChldmVudC5zaGlmdEtleSB8fCBzZWxmLm11bHRpU29ydCgpKSB7XG4gICAgICAgICAgc2VsZi5zb3J0Q29sdW1ucy5wdXNoKGluZGV4KCkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIHNlbGYuc29ydENvbHVtbnMucmVtb3ZlQWxsKCk7XG4gICAgICAgICAgc2VsZi5zb3J0Q29sdW1ucy5wdXNoKGluZGV4KCkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBzZWxmLnNvcnRDb2x1bW4oaW5kZXgoKSk7XG4gICAgfTtcblxuICAgIHNlbGYuc29ydENvbHVtbnMgPSBrby5vYnNlcnZhYmxlQXJyYXkoW10pO1xuICAgIHNlbGYuc29ydExhYmVsQ2xpY2sgPSBmdW5jdGlvbihpbmRleCwgZGF0YSwgZXZlbnQpIHtcbiAgICAgIHNlbGYuc29ydENvbHVtbnMucmVtb3ZlKGRhdGEpO1xuICAgIH07XG4gICAgc2VsZi5sYWJlbEhUTUwgPSBmdW5jdGlvbihpbmRleCwgZGF0YSkge1xuICAgICAgaWYgKHNlbGYuc29ydERpcmVjdGlvbnMoKVtzZWxmLnNvcnRDb2x1bW5zKClbaW5kZXgoKV1dKCkgPT0gLTEpIHtcbiAgICAgICAgcmV0dXJuIFwiPGEgaHJlZj1cXFwiI1xcXCI+XCIgKyAgZGF0YS5uYW1lICsgXCI8L2E+XCJcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKHNlbGYuc29ydERpcmVjdGlvbnMoKVtzZWxmLnNvcnRDb2x1bW5zKClbaW5kZXgoKV1dKCkgPT0gMSkge1xuICAgICAgICByZXR1cm4gXCI8YSBocmVmPVxcXCIjXFxcIj5cIiArICBkYXRhLm5hbWUgKyBcIjwvYT5cIlxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHJldHVybiBcIlwiXG4gICAgICB9XG4gICAgfVxuICAgICAgICBzZWxmLmNsZWFyTGFiZWxzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc2VsZi5zb3J0Q29sdW1ucy5yZW1vdmVBbGwoKTtcbiAgICAgICAgfVxuICAgICAgICBzZWxmLmNsZWFyRmlsdGVycyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2VsZi5oZWFkZXJzKCkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoc2VsZi5oZWFkZXJzKClbaV0uZmlsdGVyVmFsdWUgIT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuaGVhZGVycygpW2ldLmZpbHRlclZhbHVlKG51bGwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBzZWxmLmhpZGVBbGxDb2x1bW5zID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzZWxmLmhlYWRlcnMoKS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHNlbGYuaGVhZGVycygpW2ldLmRpc3BsYXkoZmFsc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHNlbGYucmVzZXRDb2x1bW5zID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzZWxmLmhlYWRlcnMoKS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHNlbGYuaGVhZGVycygpW2ldLmRpc3BsYXkoc2VsZi5oZWFkZXJzKClbaV0uZGVmYXVsdERpc3BsYXkoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICBzZWxmLnNvcnRDb2x1bW5zLnB1c2goMSk7XG4gICAgc2VsZi5kYXRhX2NhY2hlID0ga28uY29tcHV0ZWQoZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZCA9IGtvLm9ic2VydmFibGVBcnJheShbXSksXG4gICAgICAgICAgICAgICAgcm93LCBhZ2lUb3RhbCwgaW50VG90YWwsIHN0clRvdGFsLCBwcmltYXJ5VG90YWw7XG4gICAgICBmb3IgKGggaW4gaGVyb0RhdGEpIHtcbiAgICAgICAgcm93ID0gW10sXG4gICAgICAgICAgICAgICAgYWdpVG90YWwgPSBnZXRUb3RhbEF0dHJpYnV0ZShoLCdhZ2knLCBzZWxmLmxldmVsKCksIHNlbGYuYm9udXMoKSksXG4gICAgICAgICAgICAgICAgaW50VG90YWwgPSBnZXRUb3RhbEF0dHJpYnV0ZShoLCdpbnQnLCBzZWxmLmxldmVsKCksIHNlbGYuYm9udXMoKSksXG4gICAgICAgICAgICAgICAgc3RyVG90YWwgPSBnZXRUb3RhbEF0dHJpYnV0ZShoLCdzdHInLCBzZWxmLmxldmVsKCksIHNlbGYuYm9udXMoKSksXG4gICAgICAgICAgICAgICAgcHJpbWFyeVRvdGFsID0gZ2V0VG90YWxBdHRyaWJ1dGUoaCxnZXRQcmltYXJ5U3RhdChoKSwgc2VsZi5sZXZlbCgpLCBzZWxmLmJvbnVzKCkpO1xuICAgICAgICAvL3Jvdy5wdXNoKCc8aW1nIHNyYz1cXCcvZG90YTIvaW1hZ2VzL2hlcm9lcy8nICsgaC5yZXBsYWNlKCducGNfZG90YV9oZXJvXycsJycpICsgJy5wbmdcXCcgLz4nKTtcbiAgICAgICAgICAgICAgICByb3cucHVzaChoKTtcbiAgICAgICAgcm93LnB1c2goZ2V0RGlzcGxheU5hbWUoaCwgaGVyb0RhdGEpKTtcblxuICAgICAgICByb3cucHVzaCgoaGVyb0RhdGFbaF0uYXR0YWNrZGFtYWdlbWluICsgcHJpbWFyeVRvdGFsKS50b1ByZWNpc2lvbigzKSk7XG4gICAgICAgIHJvdy5wdXNoKChoZXJvRGF0YVtoXS5hdHRhY2tkYW1hZ2VtYXggKyBwcmltYXJ5VG90YWwpLnRvUHJlY2lzaW9uKDMpKTtcbiAgICAgICAgcm93LnB1c2goKChoZXJvRGF0YVtoXS5hdHRhY2tkYW1hZ2VtYXgtaGVyb0RhdGFbaF0uYXR0YWNrZGFtYWdlbWluKS8yICsgcHJpbWFyeVRvdGFsICsgaGVyb0RhdGFbaF0uYXR0YWNrZGFtYWdlbWluKS50b1ByZWNpc2lvbigzKSk7XG4gICAgICAgIHJvdy5wdXNoKChoZXJvRGF0YVtoXS5hcm1vcnBoeXNpY2FsICsgYWdpVG90YWwqLjE0KS50b1ByZWNpc2lvbigzKSk7XG4gICAgICAgIHJvdy5wdXNoKFxuICAgICAgICAgICAgICAgICAgICAoXG4gICAgICAgICAgICAgICAgICAgICAgICAoaGVyb0RhdGFbaF0uc3RhdHVzaGVhbHRoICsgc3RyVG90YWwqMTkpICogKDEgKyAoaGVyb0RhdGFbaF0uYXJtb3JwaHlzaWNhbCArIGFnaVRvdGFsKi4xNCkgKiAwLjA2KVxuICAgICAgICAgICAgICAgICAgICApLnRvUHJlY2lzaW9uKDQpXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgcm93LnB1c2goXG4gICAgICAgICAgICAgICAgICAgIChcbiAgICAgICAgICAgICAgICAgICAgICAgIChoZXJvRGF0YVtoXS5zdGF0dXNoZWFsdGggKyBzdHJUb3RhbCoxOSkgKiAoMS8oMS1oZXJvRGF0YVtoXS5tYWdpY2FscmVzaXN0YW5jZS8xMDApKVxuICAgICAgICAgICAgICAgICAgICApLnRvUHJlY2lzaW9uKDQpXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgcm93LnB1c2goKGhlcm9EYXRhW2hdLnN0YXR1c2hlYWx0aCArIHN0clRvdGFsKjE5KS50b1ByZWNpc2lvbig0KSk7XG4gICAgICAgIHJvdy5wdXNoKChoZXJvRGF0YVtoXS5zdGF0dXNoZWFsdGhyZWdlbiArIHN0clRvdGFsKi4wMykudG9QcmVjaXNpb24oMykpO1xuICAgICAgICByb3cucHVzaCgoaGVyb0RhdGFbaF0uc3RhdHVzbWFuYSArIGludFRvdGFsKjEzKS50b1ByZWNpc2lvbig0KSk7XG4gICAgICAgIHJvdy5wdXNoKChoZXJvRGF0YVtoXS5zdGF0dXNtYW5hcmVnZW4gKyBpbnRUb3RhbCouMDQpLnRvUHJlY2lzaW9uKDMpKTtcbiAgICAgICAgaWYgKGhlcm9EYXRhW2hdLmF0dGFja3R5cGUgPT0gJ0RPVEFfVU5JVF9DQVBfTUVMRUVfQVRUQUNLJykge1xuICAgICAgICAgIHJvdy5wdXNoKCdNZWxlZScpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIHJvdy5wdXNoKCdSYW5nZWQnKTtcbiAgICAgICAgfVxuICAgICAgICByb3cucHVzaChoZXJvRGF0YVtoXS5hdHRhY2tyYW5nZSk7XG4gICAgICAgIHJvdy5wdXNoKGhlcm9EYXRhW2hdLmF0dGFja3JhdGUpO1xuICAgICAgICByb3cucHVzaChoZXJvRGF0YVtoXS5hdHRhY2twb2ludCk7XG4gICAgICAgIHJvdy5wdXNoKGhlcm9EYXRhW2hdLnByb2plY3RpbGVzcGVlZCk7XG4gICAgICAgIHJvdy5wdXNoKGhlcm9EYXRhW2hdLnZpc2lvbmRheXRpbWVyYW5nZSk7XG4gICAgICAgIHJvdy5wdXNoKGhlcm9EYXRhW2hdLnZpc2lvbm5pZ2h0dGltZXJhbmdlKTtcbiAgICAgICAgcm93LnB1c2goaGVyb0RhdGFbaF0ubW92ZW1lbnRzcGVlZCk7XG4gICAgICAgIHJvdy5wdXNoKGhlcm9EYXRhW2hdLm1vdmVtZW50dHVybnJhdGUpO1xuICAgICAgICByb3cucHVzaChoZXJvRGF0YVtoXS5ib3VudHlnb2xkbWluKTtcbiAgICAgICAgcm93LnB1c2goaGVyb0RhdGFbaF0uYm91bnR5Z29sZG1heCk7XG4gICAgICAgIHJvdy5wdXNoKGhlcm9EYXRhW2hdLmJvdW50eXhwKTtcbiAgICAgICAgcm93LnB1c2goaGVyb0RhdGFbaF0udW5pdGxldmVsKTtcbiAgICAgICAgXG4gICAgICAgIGQucHVzaChyb3cpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGQ7XG4gICAgfSk7XG4gICAgc2VsZi5kYXRhID0ga28uY29tcHV0ZWQoZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZCA9IHNlbGYuZGF0YV9jYWNoZSgpO1xuICAgICAgZC5zb3J0KGZ1bmN0aW9uKGEsYikge1xuICAgICAgICB2YXIgaSA9IDA7XG4gICAgICAgIHdoaWxlIChpIDwgc2VsZi5zb3J0Q29sdW1ucygpLmxlbmd0aCkge1xuICAgICAgICAgIGlmIChzZWxmLnNvcnRDb2x1bW5zKClbaV0gPiAyICYmIHNlbGYuaGVhZGVycygpW3NlbGYuc29ydENvbHVtbnMoKVtpXV0ubmFtZSAhPSAnQXRrIFR5cGUnKSB7XG4gICAgICAgICAgICBpZiAocGFyc2VGbG9hdChhW3NlbGYuc29ydENvbHVtbnMoKVtpXV0pID4gcGFyc2VGbG9hdChiW3NlbGYuc29ydENvbHVtbnMoKVtpXV0pKSByZXR1cm4gMSAqIHNlbGYuc29ydERpcmVjdGlvbnMoKVtzZWxmLnNvcnRDb2x1bW5zKClbaV1dKCk7XG4gICAgICAgICAgICBpZiAocGFyc2VGbG9hdChhW3NlbGYuc29ydENvbHVtbnMoKVtpXV0pIDwgcGFyc2VGbG9hdChiW3NlbGYuc29ydENvbHVtbnMoKVtpXV0pKSByZXR1cm4gLTEgKiBzZWxmLnNvcnREaXJlY3Rpb25zKClbc2VsZi5zb3J0Q29sdW1ucygpW2ldXSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmIChhW3NlbGYuc29ydENvbHVtbnMoKVtpXV0gPiBiW3NlbGYuc29ydENvbHVtbnMoKVtpXV0pIHJldHVybiAxICogc2VsZi5zb3J0RGlyZWN0aW9ucygpW3NlbGYuc29ydENvbHVtbnMoKVtpXV0oKTtcbiAgICAgICAgICAgIGlmIChhW3NlbGYuc29ydENvbHVtbnMoKVtpXV0gPCBiW3NlbGYuc29ydENvbHVtbnMoKVtpXV0pIHJldHVybiAtMSAqIHNlbGYuc29ydERpcmVjdGlvbnMoKVtzZWxmLnNvcnRDb2x1bW5zKClbaV1dKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGkgKz0gMTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gMDtcbiAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIGQoKS5maWx0ZXIoZnVuY3Rpb24ocm93KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJvdy5ldmVyeShmdW5jdGlvbihpdGVtLCBpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghc2VsZi5oZWFkZXJzKClbaV0uZmlsdGVyKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFzZWxmLmhlYWRlcnMoKVtpXS5maWx0ZXJWYWx1ZSgpKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChzZWxmLmhlYWRlcnMoKVtpXS5maWx0ZXJUeXBlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdudW1lcmljJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKHNlbGYuaGVhZGVycygpW2ldLmZpbHRlckNvbXBhcmlzb24oKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdndCc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGFyc2VGbG9hdChpdGVtKSA+IHBhcnNlRmxvYXQoc2VsZi5oZWFkZXJzKClbaV0uZmlsdGVyVmFsdWUoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdsdCc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGFyc2VGbG9hdChpdGVtKSA8IHBhcnNlRmxvYXQoc2VsZi5oZWFkZXJzKClbaV0uZmlsdGVyVmFsdWUoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdnZSc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGFyc2VGbG9hdChpdGVtKSA+PSBwYXJzZUZsb2F0KHNlbGYuaGVhZGVycygpW2ldLmZpbHRlclZhbHVlKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnbGUnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQoaXRlbSkgPD0gcGFyc2VGbG9hdChzZWxmLmhlYWRlcnMoKVtpXS5maWx0ZXJWYWx1ZSgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2VxJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwYXJzZUZsb2F0KGl0ZW0pID09IHBhcnNlRmxvYXQoc2VsZi5oZWFkZXJzKClbaV0uZmlsdGVyVmFsdWUoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnc3RyaW5nJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaXRlbS50b0xvd2VyQ2FzZSgpLmluZGV4T2Yoc2VsZi5oZWFkZXJzKClbaV0uZmlsdGVyVmFsdWUoKS50b0xvd2VyQ2FzZSgpKSAhPSAtMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnc2VsZWN0JzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaXRlbSA9PSBzZWxmLmhlYWRlcnMoKVtpXS5maWx0ZXJWYWx1ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNlbGYuaGVhZGVycygpW2ldLmZpbHRlcjtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgIH0sIHRoaXMpO1xuICAgIFxuICAgIHNlbGYudG9nZ2xlQ29sdW1uID0gZnVuY3Rpb24oaW5kZXgsZGF0YSxldmVudCkge1xuICAgICAgc2VsZi5oZWFkZXJzKClbaW5kZXgoKV0uZGlzcGxheSghc2VsZi5oZWFkZXJzKClbaW5kZXgoKV0uZGlzcGxheSgpKVxuICAgIH07XG4gIH1cblxuICAkLmdldEpTT04oXCIvbWVkaWEvZG90YS1qc29uL3VuaXRkYXRhLmpzb25cIiwgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICBoZXJvRGF0YSA9IGRhdGE7XG4gICAga28uYXBwbHlCaW5kaW5ncyhuZXcgVGFibGVWaWV3TW9kZWwoKSk7XG4gIH0pO1xuXG59KTsiXX0=
