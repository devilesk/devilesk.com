require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({31:[function(require,module,exports){
var getJSON = require('../util/getJSON');

    var heroData = {};
    
    [].forEach.call(document.querySelectorAll('.dropdown-menu'), function (element) {
        element.addEventListener('click', function (event) {
            event.stopPropagation();
        });
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

  getJSON("/media/dota-json/unitdata.json", function (data) {
    heroData = data;
    ko.applyBindings(new TableViewModel());
  });
},{"../util/getJSON":40}]},{},[31])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvaGVyb2VzL3VuaXRkYXRhLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBnZXRKU09OID0gcmVxdWlyZSgnLi4vdXRpbC9nZXRKU09OJyk7XG5cbiAgICB2YXIgaGVyb0RhdGEgPSB7fTtcbiAgICBcbiAgICBbXS5mb3JFYWNoLmNhbGwoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmRyb3Bkb3duLW1lbnUnKSwgZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gIGZ1bmN0aW9uIGdldFByaW1hcnlTdGF0KGgpIHtcbiAgICB2YXIgdiA9IGhlcm9EYXRhW2hdLmF0dHJpYnV0ZXByaW1hcnk7XG4gICAgaWYgKHYgPT0gJ0RPVEFfQVRUUklCVVRFX0FHSUxJVFknKSB7XG4gICAgICByZXR1cm4gJ0FnaSdcbiAgICB9XG4gICAgZWxzZSBpZiAodiA9PSAnRE9UQV9BVFRSSUJVVEVfSU5URUxMRUNUJykge1xuICAgICAgcmV0dXJuICdJbnQnXG4gICAgfVxuICAgIGVsc2UgaWYgKHYgPT0gJ0RPVEFfQVRUUklCVVRFX1NUUkVOR1RIJykge1xuICAgICAgcmV0dXJuICdTdHInXG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcmV0dXJuICcnXG4gICAgfVxuICB9XG4gICAgXG4gICAgZnVuY3Rpb24gY2FwaXRhbGl6ZUZpcnN0TGV0dGVyKHN0cmluZykge1xuICAgICAgICByZXR1cm4gc3RyaW5nLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgc3RyaW5nLnNsaWNlKDEpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldERpc3BsYXlOYW1lKGgsIGhlcm9EYXRhKSB7XG4gICAgICAgIHZhciBzcGxpdF9oID0gaC5zcGxpdCgnXycpO1xuICAgICAgICB2YXIgc3VmZml4ID0gJyc7XG4gICAgICAgIGlmIChzcGxpdF9oLmluZGV4T2YoJ2dvb2RndXlzJykgIT0gLTEpIHtcbiAgICAgICAgICAgIHN1ZmZpeCArPSAnICcgKyAnUmFkaWFudCc7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoc3BsaXRfaC5pbmRleE9mKCdiYWRndXlzJykgIT0gLTEpIHtcbiAgICAgICAgICAgIHN1ZmZpeCArPSAnICcgKyAnRGlyZSc7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFpc05hTihzcGxpdF9oW3NwbGl0X2gubGVuZ3RoIC0gMV0pKSB7XG4gICAgICAgICAgICBzdWZmaXggKz0gJyAnICsgc3BsaXRfaFtzcGxpdF9oLmxlbmd0aCAtIDFdO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKCFpc05hTihzcGxpdF9oW3NwbGl0X2gubGVuZ3RoIC0gMV0uY2hhckF0KHNwbGl0X2hbc3BsaXRfaC5sZW5ndGggLSAxXS5sZW5ndGggLSAxKSkpIHtcbiAgICAgICAgICAgIHN1ZmZpeCArPSAnICcgKyBzcGxpdF9oW3NwbGl0X2gubGVuZ3RoIC0gMV0uY2hhckF0KHNwbGl0X2hbc3BsaXRfaC5sZW5ndGggLSAxXS5sZW5ndGggLSAxKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChzcGxpdF9oW3NwbGl0X2gubGVuZ3RoIC0gMV0gPT0gJ2JvdCcgfHwgc3BsaXRfaFtzcGxpdF9oLmxlbmd0aCAtIDFdID09ICdtaWQnIHx8IHNwbGl0X2hbc3BsaXRfaC5sZW5ndGggLSAxXSA9PSAndG9wJykge1xuICAgICAgICAgICAgc3VmZml4ICs9ICcgJztcbiAgICAgICAgICAgIGlmIChzcGxpdF9oW3NwbGl0X2gubGVuZ3RoIC0gMl0uaW5kZXhPZigndG93ZXInKSAhPSAtMSkge1xuICAgICAgICAgICAgICAgIHN1ZmZpeCArPSBzcGxpdF9oW3NwbGl0X2gubGVuZ3RoIC0gMl0ucmVwbGFjZSgndG93ZXInLCAnVGllciAnKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3VmZml4ICs9ICcgJyArIGNhcGl0YWxpemVGaXJzdExldHRlcihzcGxpdF9oW3NwbGl0X2gubGVuZ3RoIC0gMV0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHNwbGl0X2hbc3BsaXRfaC5sZW5ndGggLSAxXSA9PSAnaGFsbG93ZWVuJykge1xuICAgICAgICAgICAgc3VmZml4ICs9ICcgJyArICdIYWxsb3dlZW4nO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHNwbGl0X2hbc3BsaXRfaC5sZW5ndGggLSAxXSA9PSAndG9yc28nKSB7XG4gICAgICAgICAgICBzdWZmaXggKz0gJyAnICsgJ1RvcnNvJztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gKGhlcm9EYXRhW2hdLmRpc3BsYXluYW1lID8gaGVyb0RhdGFbaF0uZGlzcGxheW5hbWUgOiBoKSArIHN1ZmZpeDtcbiAgICB9XG5cbiAgZnVuY3Rpb24gZ2V0VG90YWxBdHRyaWJ1dGUoaCwgdHlwZSwgbGV2ZWwsIGJvbnVzKSB7XG4gICAgdmFyIGJhc2VzdGF0ID0gMCxcbiAgICAgICAgICAgIHN0YXRnYWluID0gMDtcbiAgICBpZiAodHlwZS50b0xvd2VyQ2FzZSgpID09ICdhZ2knKSB7XG4gICAgICBiYXNlc3RhdCA9IGhlcm9EYXRhW2hdLmF0dHJpYnV0ZWJhc2VhZ2lsaXR5XG4gICAgICBzdGF0Z2FpbiA9IGhlcm9EYXRhW2hdLmF0dHJpYnV0ZWFnaWxpdHlnYWluXG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGUudG9Mb3dlckNhc2UoKSAgPT0gJ2ludCcpIHtcbiAgICAgIGJhc2VzdGF0ID0gaGVyb0RhdGFbaF0uYXR0cmlidXRlYmFzZWludGVsbGlnZW5jZVxuICAgICAgc3RhdGdhaW4gPSBoZXJvRGF0YVtoXS5hdHRyaWJ1dGVpbnRlbGxpZ2VuY2VnYWluXG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGUudG9Mb3dlckNhc2UoKSAgPT0gJ3N0cicpIHtcbiAgICAgIGJhc2VzdGF0ID0gaGVyb0RhdGFbaF0uYXR0cmlidXRlYmFzZXN0cmVuZ3RoXG4gICAgICBzdGF0Z2FpbiA9IGhlcm9EYXRhW2hdLmF0dHJpYnV0ZXN0cmVuZ3RoZ2FpblxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHJldHVybiAwXG4gICAgfVxuICAgIHJldHVybiBNYXRoLmZsb29yKGJhc2VzdGF0ICsgc3RhdGdhaW4gKiAobGV2ZWwgLSAxKSArIGJvbnVzICogMik7XG4gIH1cblxuICBmdW5jdGlvbiBUYWJsZVZpZXdNb2RlbCgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHNlbGYuZmlsdGVyVmlzaWJsZSA9IGtvLm9ic2VydmFibGUoZmFsc2UpO1xuICAgICAgICBzZWxmLnRvZ2dsZUZpbHRlclZpc2liaWxpdHkgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzZWxmLmZpbHRlclZpc2libGUoIXNlbGYuZmlsdGVyVmlzaWJsZSgpKTtcbiAgICAgICAgfVxuICAgICAgICBzZWxmLmZpbHRlclRlbXBsYXRlVG9Vc2UgPSBmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgcmV0dXJuIGl0ZW0uZmlsdGVyVHlwZSArICctZmlsdGVyJztcbiAgICAgICAgfVxuICAgIHNlbGYuaGVhZGVycyA9IGtvLm9ic2VydmFibGVBcnJheShbXG4gICAgICAgICAgICB7bmFtZTogJ0lEJywgZGlzcGxheToga28ub2JzZXJ2YWJsZShmYWxzZSksIGFsaWduOiAnJywgZmlsdGVyOiB0cnVlLCBmaWx0ZXJUeXBlOiAnc3RyaW5nJywgZmlsdGVyVmFsdWU6IGtvLm9ic2VydmFibGUoKX0sXG4gICAgICB7bmFtZTogJ05hbWUnLCBkaXNwbGF5OiBrby5vYnNlcnZhYmxlKHRydWUpLCBhbGlnbjogJycsIGZpbHRlcjogdHJ1ZSwgZmlsdGVyVHlwZTogJ3N0cmluZycsIGZpbHRlclZhbHVlOiBrby5vYnNlcnZhYmxlKCl9LFxuICAgICAge25hbWU6ICdNaW4gRG1nJywgZGlzcGxheToga28ub2JzZXJ2YWJsZShmYWxzZSksIGFsaWduOiAncmlnaHQnLCBmaWx0ZXI6IHRydWUsIGZpbHRlclR5cGU6ICdudW1lcmljJywgZmlsdGVyVmFsdWU6IGtvLm9ic2VydmFibGUoKSwgZmlsdGVyQ29tcGFyaXNvbjoga28ub2JzZXJ2YWJsZSgpfSxcbiAgICAgIHtuYW1lOiAnTWF4IERtZycsIGRpc3BsYXk6IGtvLm9ic2VydmFibGUoZmFsc2UpLCBhbGlnbjogJ3JpZ2h0JywgZmlsdGVyOiB0cnVlLCBmaWx0ZXJUeXBlOiAnbnVtZXJpYycsIGZpbHRlclZhbHVlOiBrby5vYnNlcnZhYmxlKCksIGZpbHRlckNvbXBhcmlzb246IGtvLm9ic2VydmFibGUoKX0sXG4gICAgICB7bmFtZTogJ0F2ZyBEbWcnLCBkaXNwbGF5OiBrby5vYnNlcnZhYmxlKHRydWUpLCBhbGlnbjogJ3JpZ2h0JywgZmlsdGVyOiB0cnVlLCBmaWx0ZXJUeXBlOiAnbnVtZXJpYycsIGZpbHRlclZhbHVlOiBrby5vYnNlcnZhYmxlKCksIGZpbHRlckNvbXBhcmlzb246IGtvLm9ic2VydmFibGUoKX0sXG4gICAgICB7bmFtZTogJ0FybW9yJywgZGlzcGxheToga28ub2JzZXJ2YWJsZSh0cnVlKSwgYWxpZ246ICdyaWdodCcsIGZpbHRlcjogdHJ1ZSwgZmlsdGVyVHlwZTogJ251bWVyaWMnLCBmaWx0ZXJWYWx1ZToga28ub2JzZXJ2YWJsZSgpLCBmaWx0ZXJDb21wYXJpc29uOiBrby5vYnNlcnZhYmxlKCl9LFxuICAgICAge25hbWU6ICdFSFAnLCBkaXNwbGF5OiBrby5vYnNlcnZhYmxlKHRydWUpLCBhbGlnbjogJ3JpZ2h0JywgZmlsdGVyOiB0cnVlLCBmaWx0ZXJUeXBlOiAnbnVtZXJpYycsIGZpbHRlclZhbHVlOiBrby5vYnNlcnZhYmxlKCksIGZpbHRlckNvbXBhcmlzb246IGtvLm9ic2VydmFibGUoKX0sXG4gICAgICB7bmFtZTogJ0VIUCBNYWdpYycsIGRpc3BsYXk6IGtvLm9ic2VydmFibGUoZmFsc2UpLCBhbGlnbjogJ3JpZ2h0JywgZmlsdGVyOiB0cnVlLCBmaWx0ZXJUeXBlOiAnbnVtZXJpYycsIGZpbHRlclZhbHVlOiBrby5vYnNlcnZhYmxlKCksIGZpbHRlckNvbXBhcmlzb246IGtvLm9ic2VydmFibGUoKX0sXG4gICAgICB7bmFtZTogJ0hQJywgZGlzcGxheToga28ub2JzZXJ2YWJsZSh0cnVlKSwgYWxpZ246ICdyaWdodCcsIGZpbHRlcjogdHJ1ZSwgZmlsdGVyVHlwZTogJ251bWVyaWMnLCBmaWx0ZXJWYWx1ZToga28ub2JzZXJ2YWJsZSgpLCBmaWx0ZXJDb21wYXJpc29uOiBrby5vYnNlcnZhYmxlKCl9LFxuICAgICAge25hbWU6ICdIUCBSZWdlbicsIGRpc3BsYXk6IGtvLm9ic2VydmFibGUoZmFsc2UpLCBhbGlnbjogJ3JpZ2h0JywgZmlsdGVyOiB0cnVlLCBmaWx0ZXJUeXBlOiAnbnVtZXJpYycsIGZpbHRlclZhbHVlOiBrby5vYnNlcnZhYmxlKCksIGZpbHRlckNvbXBhcmlzb246IGtvLm9ic2VydmFibGUoKX0sXG4gICAgICB7bmFtZTogJ01hbmEnLCBkaXNwbGF5OiBrby5vYnNlcnZhYmxlKHRydWUpLCBhbGlnbjogJ3JpZ2h0JywgZmlsdGVyOiB0cnVlLCBmaWx0ZXJUeXBlOiAnbnVtZXJpYycsIGZpbHRlclZhbHVlOiBrby5vYnNlcnZhYmxlKCksIGZpbHRlckNvbXBhcmlzb246IGtvLm9ic2VydmFibGUoKX0sXG4gICAgICB7bmFtZTogJ01hbmEgUmVnZW4nLCBkaXNwbGF5OiBrby5vYnNlcnZhYmxlKGZhbHNlKSwgYWxpZ246ICdyaWdodCcsIGZpbHRlcjogdHJ1ZSwgZmlsdGVyVHlwZTogJ251bWVyaWMnLCBmaWx0ZXJWYWx1ZToga28ub2JzZXJ2YWJsZSgpLCBmaWx0ZXJDb21wYXJpc29uOiBrby5vYnNlcnZhYmxlKCl9LFxuICAgICAge25hbWU6ICdBdGsgVHlwZScsIGRpc3BsYXk6IGtvLm9ic2VydmFibGUodHJ1ZSksIGFsaWduOiAnY2VudGVyJywgZmlsdGVyOiB0cnVlLCBmaWx0ZXJUeXBlOiAnc2VsZWN0JywgZmlsdGVyT3B0aW9uczogW3t0ZXh0OiAnUmFuZ2VkJywgdmFsdWU6ICdSYW5nZWQnfSwge3RleHQ6ICdNZWxlZScsIHZhbHVlOiAnTWVsZWUnfV0sIGZpbHRlclZhbHVlOiBrby5vYnNlcnZhYmxlKCl9LFxuICAgICAge25hbWU6ICdBdGsgUmFuZ2UnLCBkaXNwbGF5OiBrby5vYnNlcnZhYmxlKHRydWUpLCBhbGlnbjogJ3JpZ2h0JywgZmlsdGVyOiB0cnVlLCBmaWx0ZXJUeXBlOiAnbnVtZXJpYycsIGZpbHRlclZhbHVlOiBrby5vYnNlcnZhYmxlKCksIGZpbHRlckNvbXBhcmlzb246IGtvLm9ic2VydmFibGUoKX0sXG4gICAgICB7bmFtZTogJzxhYmJyIHRpdGxlPVxcXCJCYXNlIEF0dGFjayBUaW1lXFxcIj5CQVQ8L2FiYnI+JywgZGlzcGxheToga28ub2JzZXJ2YWJsZShmYWxzZSksIGFsaWduOiAncmlnaHQnLCBmaWx0ZXI6IHRydWUsIGZpbHRlclR5cGU6ICdudW1lcmljJywgZmlsdGVyVmFsdWU6IGtvLm9ic2VydmFibGUoKSwgZmlsdGVyQ29tcGFyaXNvbjoga28ub2JzZXJ2YWJsZSgpfSxcbiAgICAgIHtuYW1lOiAnQXRrIFBvaW50JywgZGlzcGxheToga28ub2JzZXJ2YWJsZShmYWxzZSksIGFsaWduOiAncmlnaHQnLCBmaWx0ZXI6IHRydWUsIGZpbHRlclR5cGU6ICdudW1lcmljJywgZmlsdGVyVmFsdWU6IGtvLm9ic2VydmFibGUoKSwgZmlsdGVyQ29tcGFyaXNvbjoga28ub2JzZXJ2YWJsZSgpfSxcbiAgICAgIHtuYW1lOiAnUHJvamVjdGlsZSBTcGVlZCcsIGRpc3BsYXk6IGtvLm9ic2VydmFibGUoZmFsc2UpLCBhbGlnbjogJ3JpZ2h0JywgZmlsdGVyOiB0cnVlLCBmaWx0ZXJUeXBlOiAnbnVtZXJpYycsIGZpbHRlclZhbHVlOiBrby5vYnNlcnZhYmxlKCksIGZpbHRlckNvbXBhcmlzb246IGtvLm9ic2VydmFibGUoKX0sXG4gICAgICB7bmFtZTogJ0RheSBWaXNpb24gUmFuZ2UnLCBkaXNwbGF5OiBrby5vYnNlcnZhYmxlKGZhbHNlKSwgYWxpZ246ICdyaWdodCcsIGZpbHRlcjogdHJ1ZSwgZmlsdGVyVHlwZTogJ251bWVyaWMnLCBmaWx0ZXJWYWx1ZToga28ub2JzZXJ2YWJsZSgpLCBmaWx0ZXJDb21wYXJpc29uOiBrby5vYnNlcnZhYmxlKCl9LFxuICAgICAge25hbWU6ICdOaWdodCBWaXNpb24gUmFuZ2UnLCBkaXNwbGF5OiBrby5vYnNlcnZhYmxlKGZhbHNlKSwgYWxpZ246ICdyaWdodCcsIGZpbHRlcjogdHJ1ZSwgZmlsdGVyVHlwZTogJ251bWVyaWMnLCBmaWx0ZXJWYWx1ZToga28ub2JzZXJ2YWJsZSgpLCBmaWx0ZXJDb21wYXJpc29uOiBrby5vYnNlcnZhYmxlKCl9LFxuICAgICAge25hbWU6ICc8YWJiciB0aXRsZT1cXFwiTW92ZW1lbnQgU3BlZWRcXFwiPk1TPC9hYmJyPicsIGRpc3BsYXk6IGtvLm9ic2VydmFibGUodHJ1ZSksIGFsaWduOiAncmlnaHQnLCBmaWx0ZXI6IHRydWUsIGZpbHRlclR5cGU6ICdudW1lcmljJywgZmlsdGVyVmFsdWU6IGtvLm9ic2VydmFibGUoKSwgZmlsdGVyQ29tcGFyaXNvbjoga28ub2JzZXJ2YWJsZSgpfSxcbiAgICAgIHtuYW1lOiAnVHVybiBSYXRlJywgZGlzcGxheToga28ub2JzZXJ2YWJsZShmYWxzZSksIGFsaWduOiAncmlnaHQnLCBmaWx0ZXI6IHRydWUsIGZpbHRlclR5cGU6ICdudW1lcmljJywgZmlsdGVyVmFsdWU6IGtvLm9ic2VydmFibGUoKSwgZmlsdGVyQ29tcGFyaXNvbjoga28ub2JzZXJ2YWJsZSgpfSxcbiAgICAgIHtuYW1lOiAnR29sZCBNaW4nLCBkaXNwbGF5OiBrby5vYnNlcnZhYmxlKHRydWUpLCBhbGlnbjogJ3JpZ2h0JywgZmlsdGVyOiB0cnVlLCBmaWx0ZXJUeXBlOiAnbnVtZXJpYycsIGZpbHRlclZhbHVlOiBrby5vYnNlcnZhYmxlKCksIGZpbHRlckNvbXBhcmlzb246IGtvLm9ic2VydmFibGUoKX0sXG4gICAgICB7bmFtZTogJ0dvbGQgTWF4JywgZGlzcGxheToga28ub2JzZXJ2YWJsZSh0cnVlKSwgYWxpZ246ICdyaWdodCcsIGZpbHRlcjogdHJ1ZSwgZmlsdGVyVHlwZTogJ251bWVyaWMnLCBmaWx0ZXJWYWx1ZToga28ub2JzZXJ2YWJsZSgpLCBmaWx0ZXJDb21wYXJpc29uOiBrby5vYnNlcnZhYmxlKCl9LFxuICAgICAge25hbWU6ICdYUCBCb3VudHknLCBkaXNwbGF5OiBrby5vYnNlcnZhYmxlKHRydWUpLCBhbGlnbjogJ3JpZ2h0JywgZmlsdGVyOiB0cnVlLCBmaWx0ZXJUeXBlOiAnbnVtZXJpYycsIGZpbHRlclZhbHVlOiBrby5vYnNlcnZhYmxlKCksIGZpbHRlckNvbXBhcmlzb246IGtvLm9ic2VydmFibGUoKX0sXG4gICAgICB7bmFtZTogJ0xldmVsJywgZGlzcGxheToga28ub2JzZXJ2YWJsZSh0cnVlKSwgYWxpZ246ICdyaWdodCcsIGZpbHRlcjogdHJ1ZSwgZmlsdGVyVHlwZTogJ251bWVyaWMnLCBmaWx0ZXJWYWx1ZToga28ub2JzZXJ2YWJsZSgpLCBmaWx0ZXJDb21wYXJpc29uOiBrby5vYnNlcnZhYmxlKCl9XG4gICAgXSk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2VsZi5oZWFkZXJzKCkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHNlbGYuaGVhZGVycygpW2ldLmRlZmF1bHREaXNwbGF5ID0ga28ub2JzZXJ2YWJsZShzZWxmLmhlYWRlcnMoKVtpXS5kaXNwbGF5KCkpO1xuICAgICAgICB9XG4gICAgc2VsZi5oZWFkZXJIVE1MID0gZnVuY3Rpb24oaW5kZXgsIGRhdGEpIHtcbiAgICAgIGlmIChzZWxmLnNvcnREaXJlY3Rpb25zKClbaW5kZXgoKV0oKSA9PSAtMSkge1xuICAgICAgICByZXR1cm4gXCI8YSBocmVmPVxcXCIjXFxcIj5cIiArICBkYXRhLm5hbWUgKyBcIiA8ZGl2IGNsYXNzPVxcXCJnbHlwaGljb24gZ2x5cGhpY29uLWNoZXZyb24tZG93blxcXCI+PC9kaXY+PC9hPlwiXG4gICAgICB9XG4gICAgICBlbHNlIGlmIChzZWxmLnNvcnREaXJlY3Rpb25zKClbaW5kZXgoKV0oKSA9PSAxKSB7XG4gICAgICAgIHJldHVybiBcIjxhIGhyZWY9XFxcIiNcXFwiPlwiICsgIGRhdGEubmFtZSArIFwiIDxkaXYgY2xhc3M9XFxcImdseXBoaWNvbiBnbHlwaGljb24tY2hldnJvbi11cFxcXCI+PC9kaXY+PC9hPlwiXG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFwiXCJcbiAgICAgIH1cbiAgICB9XG4gICAgc2VsZi5tdWx0aVNvcnQgPSBrby5vYnNlcnZhYmxlKGZhbHNlKTtcbiAgICBzZWxmLmxldmVsID0ga28ub2JzZXJ2YWJsZSgxKTtcbiAgICBzZWxmLmJvbnVzID0ga28ub2JzZXJ2YWJsZSgwKTtcbiAgICBzZWxmLnNvcnREaXJlY3Rpb25zID0ga28ub2JzZXJ2YWJsZUFycmF5KFtdKTtcbiAgICBzZWxmLmluaXRTb3J0RGlyZWN0aW9ucyA9IGZ1bmN0aW9uKCkge1xuICAgICAgZm9yICh2YXIgaT0wO2k8c2VsZi5oZWFkZXJzKCkubGVuZ3RoO2krKykge1xuICAgICAgICBzZWxmLnNvcnREaXJlY3Rpb25zLnB1c2gobmV3IGtvLm9ic2VydmFibGUoMSkpO1xuICAgICAgfVxuICAgIH1cbiAgICBzZWxmLmluaXRTb3J0RGlyZWN0aW9ucygpO1xuICAgIHNlbGYuc29ydENvbHVtbiA9IGtvLm9ic2VydmFibGUoMSk7XG4gICAgc2VsZi5jb2x1bW5DbGljayA9IGZ1bmN0aW9uKGluZGV4LCBkYXRhLCBldmVudCkge1xuICAgICAgc2VsZi5zb3J0RGlyZWN0aW9ucygpW2luZGV4KCldKC0xICogc2VsZi5zb3J0RGlyZWN0aW9ucygpW2luZGV4KCldKCkpO1xuICAgICAgaWYgKHNlbGYuc29ydENvbHVtbnMuaW5kZXhPZihpbmRleCgpKSA8IDApIHtcbiAgICAgICAgaWYgKGV2ZW50LnNoaWZ0S2V5IHx8IHNlbGYubXVsdGlTb3J0KCkpIHtcbiAgICAgICAgICBzZWxmLnNvcnRDb2x1bW5zLnB1c2goaW5kZXgoKSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgc2VsZi5zb3J0Q29sdW1ucy5yZW1vdmVBbGwoKTtcbiAgICAgICAgICBzZWxmLnNvcnRDb2x1bW5zLnB1c2goaW5kZXgoKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHNlbGYuc29ydENvbHVtbihpbmRleCgpKTtcbiAgICB9O1xuXG4gICAgc2VsZi5zb3J0Q29sdW1ucyA9IGtvLm9ic2VydmFibGVBcnJheShbXSk7XG4gICAgc2VsZi5zb3J0TGFiZWxDbGljayA9IGZ1bmN0aW9uKGluZGV4LCBkYXRhLCBldmVudCkge1xuICAgICAgc2VsZi5zb3J0Q29sdW1ucy5yZW1vdmUoZGF0YSk7XG4gICAgfTtcbiAgICBzZWxmLmxhYmVsSFRNTCA9IGZ1bmN0aW9uKGluZGV4LCBkYXRhKSB7XG4gICAgICBpZiAoc2VsZi5zb3J0RGlyZWN0aW9ucygpW3NlbGYuc29ydENvbHVtbnMoKVtpbmRleCgpXV0oKSA9PSAtMSkge1xuICAgICAgICByZXR1cm4gXCI8YSBocmVmPVxcXCIjXFxcIj5cIiArICBkYXRhLm5hbWUgKyBcIjwvYT5cIlxuICAgICAgfVxuICAgICAgZWxzZSBpZiAoc2VsZi5zb3J0RGlyZWN0aW9ucygpW3NlbGYuc29ydENvbHVtbnMoKVtpbmRleCgpXV0oKSA9PSAxKSB7XG4gICAgICAgIHJldHVybiBcIjxhIGhyZWY9XFxcIiNcXFwiPlwiICsgIGRhdGEubmFtZSArIFwiPC9hPlwiXG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFwiXCJcbiAgICAgIH1cbiAgICB9XG4gICAgICAgIHNlbGYuY2xlYXJMYWJlbHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzZWxmLnNvcnRDb2x1bW5zLnJlbW92ZUFsbCgpO1xuICAgICAgICB9XG4gICAgICAgIHNlbGYuY2xlYXJGaWx0ZXJzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzZWxmLmhlYWRlcnMoKS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmIChzZWxmLmhlYWRlcnMoKVtpXS5maWx0ZXJWYWx1ZSAhPSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5oZWFkZXJzKClbaV0uZmlsdGVyVmFsdWUobnVsbCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHNlbGYuaGlkZUFsbENvbHVtbnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNlbGYuaGVhZGVycygpLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5oZWFkZXJzKClbaV0uZGlzcGxheShmYWxzZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgc2VsZi5yZXNldENvbHVtbnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNlbGYuaGVhZGVycygpLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5oZWFkZXJzKClbaV0uZGlzcGxheShzZWxmLmhlYWRlcnMoKVtpXS5kZWZhdWx0RGlzcGxheSgpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIHNlbGYuc29ydENvbHVtbnMucHVzaCgxKTtcbiAgICBzZWxmLmRhdGFfY2FjaGUgPSBrby5jb21wdXRlZChmdW5jdGlvbigpIHtcbiAgICAgIHZhciBkID0ga28ub2JzZXJ2YWJsZUFycmF5KFtdKSxcbiAgICAgICAgICAgICAgICByb3csIGFnaVRvdGFsLCBpbnRUb3RhbCwgc3RyVG90YWwsIHByaW1hcnlUb3RhbDtcbiAgICAgIGZvciAoaCBpbiBoZXJvRGF0YSkge1xuICAgICAgICByb3cgPSBbXSxcbiAgICAgICAgICAgICAgICBhZ2lUb3RhbCA9IGdldFRvdGFsQXR0cmlidXRlKGgsJ2FnaScsIHNlbGYubGV2ZWwoKSwgc2VsZi5ib251cygpKSxcbiAgICAgICAgICAgICAgICBpbnRUb3RhbCA9IGdldFRvdGFsQXR0cmlidXRlKGgsJ2ludCcsIHNlbGYubGV2ZWwoKSwgc2VsZi5ib251cygpKSxcbiAgICAgICAgICAgICAgICBzdHJUb3RhbCA9IGdldFRvdGFsQXR0cmlidXRlKGgsJ3N0cicsIHNlbGYubGV2ZWwoKSwgc2VsZi5ib251cygpKSxcbiAgICAgICAgICAgICAgICBwcmltYXJ5VG90YWwgPSBnZXRUb3RhbEF0dHJpYnV0ZShoLGdldFByaW1hcnlTdGF0KGgpLCBzZWxmLmxldmVsKCksIHNlbGYuYm9udXMoKSk7XG4gICAgICAgIC8vcm93LnB1c2goJzxpbWcgc3JjPVxcJy9kb3RhMi9pbWFnZXMvaGVyb2VzLycgKyBoLnJlcGxhY2UoJ25wY19kb3RhX2hlcm9fJywnJykgKyAnLnBuZ1xcJyAvPicpO1xuICAgICAgICAgICAgICAgIHJvdy5wdXNoKGgpO1xuICAgICAgICByb3cucHVzaChnZXREaXNwbGF5TmFtZShoLCBoZXJvRGF0YSkpO1xuXG4gICAgICAgIHJvdy5wdXNoKChoZXJvRGF0YVtoXS5hdHRhY2tkYW1hZ2VtaW4gKyBwcmltYXJ5VG90YWwpLnRvUHJlY2lzaW9uKDMpKTtcbiAgICAgICAgcm93LnB1c2goKGhlcm9EYXRhW2hdLmF0dGFja2RhbWFnZW1heCArIHByaW1hcnlUb3RhbCkudG9QcmVjaXNpb24oMykpO1xuICAgICAgICByb3cucHVzaCgoKGhlcm9EYXRhW2hdLmF0dGFja2RhbWFnZW1heC1oZXJvRGF0YVtoXS5hdHRhY2tkYW1hZ2VtaW4pLzIgKyBwcmltYXJ5VG90YWwgKyBoZXJvRGF0YVtoXS5hdHRhY2tkYW1hZ2VtaW4pLnRvUHJlY2lzaW9uKDMpKTtcbiAgICAgICAgcm93LnB1c2goKGhlcm9EYXRhW2hdLmFybW9ycGh5c2ljYWwgKyBhZ2lUb3RhbCouMTQpLnRvUHJlY2lzaW9uKDMpKTtcbiAgICAgICAgcm93LnB1c2goXG4gICAgICAgICAgICAgICAgICAgIChcbiAgICAgICAgICAgICAgICAgICAgICAgIChoZXJvRGF0YVtoXS5zdGF0dXNoZWFsdGggKyBzdHJUb3RhbCoxOSkgKiAoMSArIChoZXJvRGF0YVtoXS5hcm1vcnBoeXNpY2FsICsgYWdpVG90YWwqLjE0KSAqIDAuMDYpXG4gICAgICAgICAgICAgICAgICAgICkudG9QcmVjaXNpb24oNClcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICByb3cucHVzaChcbiAgICAgICAgICAgICAgICAgICAgKFxuICAgICAgICAgICAgICAgICAgICAgICAgKGhlcm9EYXRhW2hdLnN0YXR1c2hlYWx0aCArIHN0clRvdGFsKjE5KSAqICgxLygxLWhlcm9EYXRhW2hdLm1hZ2ljYWxyZXNpc3RhbmNlLzEwMCkpXG4gICAgICAgICAgICAgICAgICAgICkudG9QcmVjaXNpb24oNClcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICByb3cucHVzaCgoaGVyb0RhdGFbaF0uc3RhdHVzaGVhbHRoICsgc3RyVG90YWwqMTkpLnRvUHJlY2lzaW9uKDQpKTtcbiAgICAgICAgcm93LnB1c2goKGhlcm9EYXRhW2hdLnN0YXR1c2hlYWx0aHJlZ2VuICsgc3RyVG90YWwqLjAzKS50b1ByZWNpc2lvbigzKSk7XG4gICAgICAgIHJvdy5wdXNoKChoZXJvRGF0YVtoXS5zdGF0dXNtYW5hICsgaW50VG90YWwqMTMpLnRvUHJlY2lzaW9uKDQpKTtcbiAgICAgICAgcm93LnB1c2goKGhlcm9EYXRhW2hdLnN0YXR1c21hbmFyZWdlbiArIGludFRvdGFsKi4wNCkudG9QcmVjaXNpb24oMykpO1xuICAgICAgICBpZiAoaGVyb0RhdGFbaF0uYXR0YWNrdHlwZSA9PSAnRE9UQV9VTklUX0NBUF9NRUxFRV9BVFRBQ0snKSB7XG4gICAgICAgICAgcm93LnB1c2goJ01lbGVlJyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgcm93LnB1c2goJ1JhbmdlZCcpO1xuICAgICAgICB9XG4gICAgICAgIHJvdy5wdXNoKGhlcm9EYXRhW2hdLmF0dGFja3JhbmdlKTtcbiAgICAgICAgcm93LnB1c2goaGVyb0RhdGFbaF0uYXR0YWNrcmF0ZSk7XG4gICAgICAgIHJvdy5wdXNoKGhlcm9EYXRhW2hdLmF0dGFja3BvaW50KTtcbiAgICAgICAgcm93LnB1c2goaGVyb0RhdGFbaF0ucHJvamVjdGlsZXNwZWVkKTtcbiAgICAgICAgcm93LnB1c2goaGVyb0RhdGFbaF0udmlzaW9uZGF5dGltZXJhbmdlKTtcbiAgICAgICAgcm93LnB1c2goaGVyb0RhdGFbaF0udmlzaW9ubmlnaHR0aW1lcmFuZ2UpO1xuICAgICAgICByb3cucHVzaChoZXJvRGF0YVtoXS5tb3ZlbWVudHNwZWVkKTtcbiAgICAgICAgcm93LnB1c2goaGVyb0RhdGFbaF0ubW92ZW1lbnR0dXJucmF0ZSk7XG4gICAgICAgIHJvdy5wdXNoKGhlcm9EYXRhW2hdLmJvdW50eWdvbGRtaW4pO1xuICAgICAgICByb3cucHVzaChoZXJvRGF0YVtoXS5ib3VudHlnb2xkbWF4KTtcbiAgICAgICAgcm93LnB1c2goaGVyb0RhdGFbaF0uYm91bnR5eHApO1xuICAgICAgICByb3cucHVzaChoZXJvRGF0YVtoXS51bml0bGV2ZWwpO1xuICAgICAgICBcbiAgICAgICAgZC5wdXNoKHJvdyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gZDtcbiAgICB9KTtcbiAgICBzZWxmLmRhdGEgPSBrby5jb21wdXRlZChmdW5jdGlvbigpIHtcbiAgICAgIHZhciBkID0gc2VsZi5kYXRhX2NhY2hlKCk7XG4gICAgICBkLnNvcnQoZnVuY3Rpb24oYSxiKSB7XG4gICAgICAgIHZhciBpID0gMDtcbiAgICAgICAgd2hpbGUgKGkgPCBzZWxmLnNvcnRDb2x1bW5zKCkubGVuZ3RoKSB7XG4gICAgICAgICAgaWYgKHNlbGYuc29ydENvbHVtbnMoKVtpXSA+IDIgJiYgc2VsZi5oZWFkZXJzKClbc2VsZi5zb3J0Q29sdW1ucygpW2ldXS5uYW1lICE9ICdBdGsgVHlwZScpIHtcbiAgICAgICAgICAgIGlmIChwYXJzZUZsb2F0KGFbc2VsZi5zb3J0Q29sdW1ucygpW2ldXSkgPiBwYXJzZUZsb2F0KGJbc2VsZi5zb3J0Q29sdW1ucygpW2ldXSkpIHJldHVybiAxICogc2VsZi5zb3J0RGlyZWN0aW9ucygpW3NlbGYuc29ydENvbHVtbnMoKVtpXV0oKTtcbiAgICAgICAgICAgIGlmIChwYXJzZUZsb2F0KGFbc2VsZi5zb3J0Q29sdW1ucygpW2ldXSkgPCBwYXJzZUZsb2F0KGJbc2VsZi5zb3J0Q29sdW1ucygpW2ldXSkpIHJldHVybiAtMSAqIHNlbGYuc29ydERpcmVjdGlvbnMoKVtzZWxmLnNvcnRDb2x1bW5zKClbaV1dKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaWYgKGFbc2VsZi5zb3J0Q29sdW1ucygpW2ldXSA+IGJbc2VsZi5zb3J0Q29sdW1ucygpW2ldXSkgcmV0dXJuIDEgKiBzZWxmLnNvcnREaXJlY3Rpb25zKClbc2VsZi5zb3J0Q29sdW1ucygpW2ldXSgpO1xuICAgICAgICAgICAgaWYgKGFbc2VsZi5zb3J0Q29sdW1ucygpW2ldXSA8IGJbc2VsZi5zb3J0Q29sdW1ucygpW2ldXSkgcmV0dXJuIC0xICogc2VsZi5zb3J0RGlyZWN0aW9ucygpW3NlbGYuc29ydENvbHVtbnMoKVtpXV0oKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaSArPSAxO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAwO1xuICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gZCgpLmZpbHRlcihmdW5jdGlvbihyb3cpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcm93LmV2ZXJ5KGZ1bmN0aW9uKGl0ZW0sIGkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFzZWxmLmhlYWRlcnMoKVtpXS5maWx0ZXIpIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXNlbGYuaGVhZGVycygpW2ldLmZpbHRlclZhbHVlKCkpIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKHNlbGYuaGVhZGVycygpW2ldLmZpbHRlclR5cGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ251bWVyaWMnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN3aXRjaCAoc2VsZi5oZWFkZXJzKClbaV0uZmlsdGVyQ29tcGFyaXNvbigpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2d0JzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwYXJzZUZsb2F0KGl0ZW0pID4gcGFyc2VGbG9hdChzZWxmLmhlYWRlcnMoKVtpXS5maWx0ZXJWYWx1ZSgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2x0JzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwYXJzZUZsb2F0KGl0ZW0pIDwgcGFyc2VGbG9hdChzZWxmLmhlYWRlcnMoKVtpXS5maWx0ZXJWYWx1ZSgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2dlJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwYXJzZUZsb2F0KGl0ZW0pID49IHBhcnNlRmxvYXQoc2VsZi5oZWFkZXJzKClbaV0uZmlsdGVyVmFsdWUoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdsZSc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGFyc2VGbG9hdChpdGVtKSA8PSBwYXJzZUZsb2F0KHNlbGYuaGVhZGVycygpW2ldLmZpbHRlclZhbHVlKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnZXEnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQoaXRlbSkgPT0gcGFyc2VGbG9hdChzZWxmLmhlYWRlcnMoKVtpXS5maWx0ZXJWYWx1ZSgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdzdHJpbmcnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBpdGVtLnRvTG93ZXJDYXNlKCkuaW5kZXhPZihzZWxmLmhlYWRlcnMoKVtpXS5maWx0ZXJWYWx1ZSgpLnRvTG93ZXJDYXNlKCkpICE9IC0xO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdzZWxlY3QnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBpdGVtID09IHNlbGYuaGVhZGVycygpW2ldLmZpbHRlclZhbHVlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2VsZi5oZWFkZXJzKClbaV0uZmlsdGVyO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgfSwgdGhpcyk7XG4gICAgXG4gICAgc2VsZi50b2dnbGVDb2x1bW4gPSBmdW5jdGlvbihpbmRleCxkYXRhLGV2ZW50KSB7XG4gICAgICBzZWxmLmhlYWRlcnMoKVtpbmRleCgpXS5kaXNwbGF5KCFzZWxmLmhlYWRlcnMoKVtpbmRleCgpXS5kaXNwbGF5KCkpXG4gICAgfTtcbiAgfVxuXG4gIGdldEpTT04oXCIvbWVkaWEvZG90YS1qc29uL3VuaXRkYXRhLmpzb25cIiwgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICBoZXJvRGF0YSA9IGRhdGE7XG4gICAga28uYXBwbHlCaW5kaW5ncyhuZXcgVGFibGVWaWV3TW9kZWwoKSk7XG4gIH0pOyJdfQ==
