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
            return _.filter(d(), function(row) {
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

  $.getJSON("/media/js/unitdata.json", function (data) {
    heroData = data;
    ko.applyBindings(new TableViewModel());
  });

});