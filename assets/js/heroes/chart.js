require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({28:[function(require,module,exports){
var KTLIB = require('../ktlib');
var QueryString = require('../util/queryString');
var getJSON = require('../util/getJSON');
var query_string = QueryString.query_string;
var updateQueryStringParam = QueryString.updateQueryStringParam;


KTLIB.init(function (herodata) {
    console.log('herodata', herodata);
    var attributeOptions = KTLIB.attributeOptions;
    var attributeModifiers = KTLIB.attributeModifiers;
    attributeOptions.push({id: "HeroID", name: "HeroID"});
    attributeOptions = attributeOptions.filter(function (a) { return a.id !== 'attributeprimary'; }).sort(function (a, b) {
      if (a.name < b.name) return -1;
      if (a.name > b.name) return 1;
      return 0;
    });
    var attributes = attributeOptions.map(function (a) { return a.id; })
    
    console.log('attributes', attributes);
    getJSON("/media/dota-json/heroes.json", function (response) {
      var heroes = response.data;
      console.log(heroes);
      var icons = {};
      var loadedCount = 0;
      heroes.forEach(function (hero) {
        var img = new Image();
        img.src = '/media/images/miniheroes/' + hero + '.png';
        icons[hero] = img;
        img.onload = checkLoaded;
      });
      
      function checkLoaded() {
        loadedCount++;
        if (loadedCount === heroes.length) {
          console.log(icons);
          init();
        }
      }
      
      function Scale(label) {
        return {
            type: 'linear',
            scaleLabel: {
                display: true,
                labelString: label
            }
        }
      }
      
      function DataSet(label) {
        return {
            label: label,
            fill: false,
            lineTension: 0.1,
            backgroundColor: "rgba(75,192,192,0.4)",
            borderColor: "rgba(75,192,192,1)",
            borderCapStyle: 'butt',
            borderDash: [],
            borderDashOffset: 0.0,
            borderJoinStyle: 'miter',
            pointBorderColor: "rgba(75,192,192,1)",
            pointBackgroundColor: "#fff",
            pointBorderWidth: 1,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: "rgba(75,192,192,1)",
            pointHoverBorderColor: "rgba(220,220,220,1)",
            pointHoverBorderWidth: 2,
            pointRadius: 10,
            pointHitRadius: 10,
            data: [],
            pointStyle: [],
        }
      }
      
      function init() {
        var ctx = document.getElementById("myChart");
        var data = {
            labels: [],
            datasets: [
            ]
        };
        
        data.datasets.push()
        
        /*heroes.forEach(function (hero) {
          data.datasets[0].data.push({x: Math.random() * 100, y: Math.random() * 100});
          //data.datasets[0].pointStyle.push(icons[hero]);
          data.datasets[0].pointStyle.push('rect');
        });*/
        
        var scales = {
            yAxes: [{
                type: 'linear',
                scaleLabel: {
                    display: true,
                    labelString: ''
                }
            }],
            xAxes: [{
                type: 'linear',
                scaleLabel: {
                    display: true,
                    labelString: ''
                }
            }]
        }
        
        var myChart = new Chart(ctx, {
            type: 'scatter',
            data: data,
            options: {
              showLines: false,
              xAxes: [{
                  display: true
              }],
              scales: scales,
              hover: {
                mode: 'single',
                /*onHover: function (a, b) {
                  console.log('onHover', a, b);
                }*/
              },
              legend: {
                position: 'bottom'
              },
              tooltips: {
                mode: 'single',
                callbacks: {
                  title: function (a, b, c) {
                    var items = b.datasets.filter(function (o) {
                      //console.log(o, o.data[0].x == a[0].xLabel && o.data[0].y == a[0].yLabel, o.data[0].x, a[0].xLabel, o.data[0].y, a[0].yLabel);
                      return o.data[0].x == a[0].xLabel && o.data[0].y == a[0].yLabel;
                    });
                    //console.log(a, b, items);
                    return items.map(function(o) { return o.label }).sort().join(',');
                    return myChart.data.datasets[a[0].datasetIndex].label;
                    return 'asdf';
                  }
                }
              }
            }
        });
        console.log('myChart', myChart);
        var viewModel = {
          attributes: ko.observableArray(attributeOptions),
          selectedX: ko.observable(),
          selectedY: ko.observable(),
          selectedLevel: ko.observable(),
          showLegend: ko.observable(true),
          toggleOn: function () {
            myChart.data.datasets.forEach(function (dataset) {
              dataset.hidden = false;
              dataset._meta[0].hidden = null;
            });
            myChart.update();
          },
          toggleOff: function () {
            myChart.data.datasets.forEach(function (dataset) {
              dataset.hidden = true;
              dataset._meta[0].hidden = null;
            });
            myChart.update();
          },
          toggleLegend: function () {
            viewModel.showLegend(!viewModel.showLegend());
            myChart.options.legend.display = viewModel.showLegend();
            myChart.update();
          }
        }
        
        viewModel.selectedX.subscribe(function (newValue) {
          updateQueryStringParam("x", newValue);
          update();
        });
        
        viewModel.selectedLevel.subscribe(function (newValue) {
          updateQueryStringParam("level", newValue);
          update();
        });
        
        viewModel.selectedY.subscribe(function (newValue) {
          updateQueryStringParam("y", newValue);
          update();
        });
        
        viewModel.selectedX(query_string['x'] || 'ehp');
        viewModel.selectedY(query_string['y'] || 'dps');
        viewModel.selectedLevel(query_string['level'] || 1);
        init();
        
        function init() {
          if (!viewModel.selectedX() || !viewModel.selectedY()) return;
          data.datasets.length = 0;
          heroes.forEach(function (hero) {
            var hData = herodata['npc_dota_hero_' + hero];
            var dataset = new DataSet(hData.displayname);
            var pt = getPoint(hero);
            dataset._heroId = hero;
            dataset.data.push(pt);
            dataset.pointStyle.push(icons[hero]);
            //dataset.pointStyle.push('rect');
            data.datasets.push(dataset);
          });
          data.datasets.sort(function (a, b) {
            if (a.label < b.label) return -1;
            if (a.label > b.label) return 1;
            return 0;
          });
          setChartLabels()
          myChart.update();
        }
        
        function update() {
          if (!viewModel.selectedX() || !viewModel.selectedY()) return;
          myChart.data.datasets.forEach(function (dataset) {
            var hero = dataset._heroId;
            var pt = getPoint(hero);
            dataset.data.length = 0;
            dataset.data.push(pt);
          });
          setChartLabels()
          myChart.update();
        }
        
        function setChartLabels() {
          var labelX = attributeOptions.filter(function (a) { return a.id == viewModel.selectedX(); })[0].name;
          var labelY = attributeOptions.filter(function (a) { return a.id == viewModel.selectedY(); })[0].name;
          var label = labelY + ' vs. ' + labelX;
          myChart.options.scales.yAxes[0].scaleLabel.labelString = labelY;
          myChart.options.scales.xAxes[0].scaleLabel.labelString = labelX;
          document.getElementById('chart-title').innerHTML = label;
        }
        
        function getPoint(hero) {
          var hData = herodata['npc_dota_hero_' + hero];
          if (attributeModifiers.hasOwnProperty(viewModel.selectedX())) {
            var x = parseFloat(attributeModifiers[viewModel.selectedX()].call(hData, viewModel.selectedLevel()).toFixed(4));
          }
          else {
            var x = parseFloat(hData[viewModel.selectedX()].toFixed(4));
          }
          if (attributeModifiers.hasOwnProperty(viewModel.selectedY())) {
            var y = parseFloat(attributeModifiers[viewModel.selectedY()].call(hData, viewModel.selectedLevel()).toFixed(4));
          }
          else {
            var y = parseFloat(hData[viewModel.selectedY()].toFixed(4));
          }
          return {x: x, y: y};
        }
        
        ko.applyBindings(viewModel);
      }
    });
});
},{"../ktlib":33,"../util/getJSON":39,"../util/queryString":40}],40:[function(require,module,exports){
var query_string = (function(a) {
    if (a == "") return {};
    var b = {};
    for (var i = 0; i < a.length; ++i)
    {
        var p=a[i].split('=', 2);
        if (p.length == 1)
            b[p[0]] = "";
        else
            b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
    }
    return b;
})(window.location.search.substr(1).split('&'));

// Explicitly save/update a url parameter using HTML5's replaceState().
function updateQueryStringParam(key, value) {
  baseUrl = [location.protocol, '//', location.host, location.pathname].join('');
  urlQueryString = document.location.search;
  var newParam = key + '=' + value,
  params = '?' + newParam;

  // If the "search" string exists, then build params from it
  if (urlQueryString) {
    keyRegex = new RegExp('([\?&])' + key + '[^&]*');
    // If param exists already, update it
    if (urlQueryString.match(keyRegex) !== null) {
      params = urlQueryString.replace(keyRegex, "$1" + newParam);
    } else { // Otherwise, add it to end of query string
      params = urlQueryString + '&' + newParam;
    }
  }
  window.history.replaceState({}, "", baseUrl + params);
}

module.exports = {
    query_string: query_string,
    updateQueryStringParam: updateQueryStringParam
};
},{}],33:[function(require,module,exports){
var getJSON = require('./util/getJSON');
    
var KTLIB = (function () {
  
  var attributeOptions = [
    {id: "armorphysical", name: "Armor"},
    {id: "projectilespeed", name: "Missile Speed"},
    {id: "attackrange", name: "Attack Range"},
    {id: "attributeagilitygain", name: "Agi Gain"},
    {id: "attributestrengthgain", name: "Str Gain"},
    {id: "attributeintelligencegain", name: "Int Gain"},
    {id: "attributebaseagility", name: "Base Agi"},
    {id: "attributebaseintelligence", name: "Base Int"},
    {id: "attributebasestrength", name: "Base Str"},
    {id: "attributeprimary", name: "Primary Attr"},
    {id: "statushealth", name: "HP"},
    {id: "statusmana", name: "Mana"},
    {id: "statushealthregen", name: "HP Regen"},
    {id: "statusmanaregen", name: "Mana Regen"},
    {id: "movementspeed", name: "Movement Speed"},
    {id: "movementturnrate", name: "Turn Rate"},
    {id: "attackdamagemin", name: "Attack Damage Min"},
    {id: "attackdamagemax", name: "Attack Damage Max"},
    {id: "attackdamageavg", name: "Attack Damage Avg"},
    {id: "ehp", name: "EHP"},
    {id: "mehp", name: "Magical EHP"},
    {id: "dps", name: "DPS"},
    {id: "agility", name: "Agility"},
    {id: "intelligence", name: "Intelligence"},
    {id: "strength", name: "Strength"},
  ],
  attributes = attributeOptions.map(function (a) { return a.id; }),
  attributeModifiers = {
    armorphysical: function (level, bonusLevel) {
      return this.armorphysical + getAttributeAtLevel.call(this, 'DOTA_ATTRIBUTE_AGILITY', level, bonusLevel) * (1/6);
    },
    statushealth: function (level, bonusLevel) {
      return this.statushealth + getAttributeAtLevel.call(this, 'DOTA_ATTRIBUTE_STRENGTH', level, bonusLevel) * 20;
    },
    statusmana: function (level, bonusLevel) {
      return this.statusmana + getAttributeAtLevel.call(this, 'DOTA_ATTRIBUTE_INTELLECT', level, bonusLevel) * 12;
    },
    statushealthregen: function (level, bonusLevel) {
      return this.statushealthregen * (1 + getAttributeAtLevel.call(this, 'DOTA_ATTRIBUTE_STRENGTH', level, bonusLevel) * 0.007);
    },
    statusmanaregen: function (level, bonusLevel) {
      return this.statusmanaregen * (1 + getAttributeAtLevel.call(this, 'DOTA_ATTRIBUTE_INTELLECT', level, bonusLevel) * 0.02);
    },
    attackdamagemax: function (level, bonusLevel) {
      return this.attackdamagemax + getAttributeAtLevel.call(this, this.attributeprimary, level, bonusLevel);
    },
    attackdamagemin: function (level, bonusLevel) {
      return this.attackdamagemin + getAttributeAtLevel.call(this, this.attributeprimary, level, bonusLevel);
    },
    attackdamageavg: function (level, bonusLevel) {
      var maxDmg = attributeModifiers.attackdamagemax.apply(this, arguments);
      var minDmg = attributeModifiers.attackdamagemin.apply(this, arguments);
      return (maxDmg + minDmg) / 2;
    },
    ehp: function (level, bonusLevel) {
      var armor = attributeModifiers.armorphysical.apply(this, arguments);
      var health = attributeModifiers.statushealth.apply(this, arguments);
      return health / (1 - 0.05*armor / (1 + (0.05 * armor)));
    },
    mehp: function (level, bonusLevel) {
      var health = attributeModifiers.statushealth.apply(this, arguments);
      return health * (1 / (1 - this.magicalresistance / 100));
    },
    dps: function (level, bonusLevel) {
      var dmg = attributeModifiers.attackdamageavg.apply(this, arguments);
      var as = 100 + getAttributeAtLevel.call(this, 'DOTA_ATTRIBUTE_AGILITY', level, bonusLevel);
      return dmg * as / 100 / this.attackrate;
    },
    agility: function (level, bonusLevel) {
      return getAttributeAtLevel.call(this, 'DOTA_ATTRIBUTE_AGILITY', level, bonusLevel);
    },
    intelligence: function (level, bonusLevel) {
      return getAttributeAtLevel.call(this, 'DOTA_ATTRIBUTE_INTELLECT', level, bonusLevel);
    },
    strength: function (level, bonusLevel) {
      return getAttributeAtLevel.call(this, 'DOTA_ATTRIBUTE_STRENGTH', level, bonusLevel);
    },
  },
  getAttributeValue = function (hero, attribute) {
    if (attributeModifiers.hasOwnProperty(attribute)) {
      var args = Array.prototype.slice.call(arguments, 2);
      return attributeModifiers[attribute].apply(_herodata[hero], args);
    }
    else {
      return _herodata[hero][attribute];
    }
  },
  _herodata = null;
  
  function getAttributeAtLevel(attribute, level, bonusLevel) {
    var level = level || 1;
    var bonusLevel = bonusLevel || 0;
    return getAttributeBase.call(this, attribute) + getAttributeGain.call(this, attribute) * (level - 1) + bonusLevel * 2;
  }
  
  function getAttributeGain(attribute) {
    switch (attribute) {
      case 'DOTA_ATTRIBUTE_STRENGTH':
        return this.attributestrengthgain;
      break;
      case 'DOTA_ATTRIBUTE_AGILITY':
        return this.attributeagilitygain;
      break;
      case 'DOTA_ATTRIBUTE_INTELLECT':
        return this.attributeintelligencegain;
      break;
    }
  }
  
  function getAttributeBase(attribute) {
    switch (attribute) {
      case 'DOTA_ATTRIBUTE_STRENGTH':
        return this.attributebasestrength;
      break;
      case 'DOTA_ATTRIBUTE_AGILITY':
        return this.attributebaseagility;
      break;
      case 'DOTA_ATTRIBUTE_INTELLECT':
        return this.attributebaseintelligence;
      break;
    }
  }
  
  function getPrimaryAttributeGain() {
    return getAttributeGain(this.attributeprimary);
  }  
  
  function getPrimaryAttributeBase() {
    return getAttributeBase(this.attributeprimary);
  }
  
  return {
    attributes: attributes,
    attributeOptions: attributeOptions,
    attributeModifiers: attributeModifiers,
    getAttributeAtLevel: getAttributeAtLevel,
    getAttributeBase: getAttributeBase,
    getAttributeGain: getAttributeGain,
    getPrimaryAttributeBase: getPrimaryAttributeBase,
    getPrimaryAttributeGain: getPrimaryAttributeGain,
    getAttributeValue: getAttributeValue,
    getHeroData: function () {
      return _herodata || {};
    },
    init: function (callback) {
      getJSON("/media/dota-json/herodata.json", function (data) {
        _herodata = data;
        callback(data);
      });
    }
  };
})();

module.exports = KTLIB;
},{"./util/getJSON":39}]},{},[28])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvaGVyb2VzL2NoYXJ0LmpzIiwic3JjL2pzL3V0aWwvcXVlcnlTdHJpbmcuanMiLCJzcmMvanMva3RsaWIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOVBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgS1RMSUIgPSByZXF1aXJlKCcuLi9rdGxpYicpO1xudmFyIFF1ZXJ5U3RyaW5nID0gcmVxdWlyZSgnLi4vdXRpbC9xdWVyeVN0cmluZycpO1xudmFyIGdldEpTT04gPSByZXF1aXJlKCcuLi91dGlsL2dldEpTT04nKTtcbnZhciBxdWVyeV9zdHJpbmcgPSBRdWVyeVN0cmluZy5xdWVyeV9zdHJpbmc7XG52YXIgdXBkYXRlUXVlcnlTdHJpbmdQYXJhbSA9IFF1ZXJ5U3RyaW5nLnVwZGF0ZVF1ZXJ5U3RyaW5nUGFyYW07XG5cblxuS1RMSUIuaW5pdChmdW5jdGlvbiAoaGVyb2RhdGEpIHtcbiAgICBjb25zb2xlLmxvZygnaGVyb2RhdGEnLCBoZXJvZGF0YSk7XG4gICAgdmFyIGF0dHJpYnV0ZU9wdGlvbnMgPSBLVExJQi5hdHRyaWJ1dGVPcHRpb25zO1xuICAgIHZhciBhdHRyaWJ1dGVNb2RpZmllcnMgPSBLVExJQi5hdHRyaWJ1dGVNb2RpZmllcnM7XG4gICAgYXR0cmlidXRlT3B0aW9ucy5wdXNoKHtpZDogXCJIZXJvSURcIiwgbmFtZTogXCJIZXJvSURcIn0pO1xuICAgIGF0dHJpYnV0ZU9wdGlvbnMgPSBhdHRyaWJ1dGVPcHRpb25zLmZpbHRlcihmdW5jdGlvbiAoYSkgeyByZXR1cm4gYS5pZCAhPT0gJ2F0dHJpYnV0ZXByaW1hcnknOyB9KS5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICBpZiAoYS5uYW1lIDwgYi5uYW1lKSByZXR1cm4gLTE7XG4gICAgICBpZiAoYS5uYW1lID4gYi5uYW1lKSByZXR1cm4gMTtcbiAgICAgIHJldHVybiAwO1xuICAgIH0pO1xuICAgIHZhciBhdHRyaWJ1dGVzID0gYXR0cmlidXRlT3B0aW9ucy5tYXAoZnVuY3Rpb24gKGEpIHsgcmV0dXJuIGEuaWQ7IH0pXG4gICAgXG4gICAgY29uc29sZS5sb2coJ2F0dHJpYnV0ZXMnLCBhdHRyaWJ1dGVzKTtcbiAgICBnZXRKU09OKFwiL21lZGlhL2RvdGEtanNvbi9oZXJvZXMuanNvblwiLCBmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgIHZhciBoZXJvZXMgPSByZXNwb25zZS5kYXRhO1xuICAgICAgY29uc29sZS5sb2coaGVyb2VzKTtcbiAgICAgIHZhciBpY29ucyA9IHt9O1xuICAgICAgdmFyIGxvYWRlZENvdW50ID0gMDtcbiAgICAgIGhlcm9lcy5mb3JFYWNoKGZ1bmN0aW9uIChoZXJvKSB7XG4gICAgICAgIHZhciBpbWcgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgaW1nLnNyYyA9ICcvbWVkaWEvaW1hZ2VzL21pbmloZXJvZXMvJyArIGhlcm8gKyAnLnBuZyc7XG4gICAgICAgIGljb25zW2hlcm9dID0gaW1nO1xuICAgICAgICBpbWcub25sb2FkID0gY2hlY2tMb2FkZWQ7XG4gICAgICB9KTtcbiAgICAgIFxuICAgICAgZnVuY3Rpb24gY2hlY2tMb2FkZWQoKSB7XG4gICAgICAgIGxvYWRlZENvdW50Kys7XG4gICAgICAgIGlmIChsb2FkZWRDb3VudCA9PT0gaGVyb2VzLmxlbmd0aCkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKGljb25zKTtcbiAgICAgICAgICBpbml0KCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIFxuICAgICAgZnVuY3Rpb24gU2NhbGUobGFiZWwpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHR5cGU6ICdsaW5lYXInLFxuICAgICAgICAgICAgc2NhbGVMYWJlbDoge1xuICAgICAgICAgICAgICAgIGRpc3BsYXk6IHRydWUsXG4gICAgICAgICAgICAgICAgbGFiZWxTdHJpbmc6IGxhYmVsXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIFxuICAgICAgZnVuY3Rpb24gRGF0YVNldChsYWJlbCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbGFiZWw6IGxhYmVsLFxuICAgICAgICAgICAgZmlsbDogZmFsc2UsXG4gICAgICAgICAgICBsaW5lVGVuc2lvbjogMC4xLFxuICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBcInJnYmEoNzUsMTkyLDE5MiwwLjQpXCIsXG4gICAgICAgICAgICBib3JkZXJDb2xvcjogXCJyZ2JhKDc1LDE5MiwxOTIsMSlcIixcbiAgICAgICAgICAgIGJvcmRlckNhcFN0eWxlOiAnYnV0dCcsXG4gICAgICAgICAgICBib3JkZXJEYXNoOiBbXSxcbiAgICAgICAgICAgIGJvcmRlckRhc2hPZmZzZXQ6IDAuMCxcbiAgICAgICAgICAgIGJvcmRlckpvaW5TdHlsZTogJ21pdGVyJyxcbiAgICAgICAgICAgIHBvaW50Qm9yZGVyQ29sb3I6IFwicmdiYSg3NSwxOTIsMTkyLDEpXCIsXG4gICAgICAgICAgICBwb2ludEJhY2tncm91bmRDb2xvcjogXCIjZmZmXCIsXG4gICAgICAgICAgICBwb2ludEJvcmRlcldpZHRoOiAxLFxuICAgICAgICAgICAgcG9pbnRIb3ZlclJhZGl1czogNSxcbiAgICAgICAgICAgIHBvaW50SG92ZXJCYWNrZ3JvdW5kQ29sb3I6IFwicmdiYSg3NSwxOTIsMTkyLDEpXCIsXG4gICAgICAgICAgICBwb2ludEhvdmVyQm9yZGVyQ29sb3I6IFwicmdiYSgyMjAsMjIwLDIyMCwxKVwiLFxuICAgICAgICAgICAgcG9pbnRIb3ZlckJvcmRlcldpZHRoOiAyLFxuICAgICAgICAgICAgcG9pbnRSYWRpdXM6IDEwLFxuICAgICAgICAgICAgcG9pbnRIaXRSYWRpdXM6IDEwLFxuICAgICAgICAgICAgZGF0YTogW10sXG4gICAgICAgICAgICBwb2ludFN0eWxlOiBbXSxcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgXG4gICAgICBmdW5jdGlvbiBpbml0KCkge1xuICAgICAgICB2YXIgY3R4ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJteUNoYXJ0XCIpO1xuICAgICAgICB2YXIgZGF0YSA9IHtcbiAgICAgICAgICAgIGxhYmVsczogW10sXG4gICAgICAgICAgICBkYXRhc2V0czogW1xuICAgICAgICAgICAgXVxuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgZGF0YS5kYXRhc2V0cy5wdXNoKClcbiAgICAgICAgXG4gICAgICAgIC8qaGVyb2VzLmZvckVhY2goZnVuY3Rpb24gKGhlcm8pIHtcbiAgICAgICAgICBkYXRhLmRhdGFzZXRzWzBdLmRhdGEucHVzaCh7eDogTWF0aC5yYW5kb20oKSAqIDEwMCwgeTogTWF0aC5yYW5kb20oKSAqIDEwMH0pO1xuICAgICAgICAgIC8vZGF0YS5kYXRhc2V0c1swXS5wb2ludFN0eWxlLnB1c2goaWNvbnNbaGVyb10pO1xuICAgICAgICAgIGRhdGEuZGF0YXNldHNbMF0ucG9pbnRTdHlsZS5wdXNoKCdyZWN0Jyk7XG4gICAgICAgIH0pOyovXG4gICAgICAgIFxuICAgICAgICB2YXIgc2NhbGVzID0ge1xuICAgICAgICAgICAgeUF4ZXM6IFt7XG4gICAgICAgICAgICAgICAgdHlwZTogJ2xpbmVhcicsXG4gICAgICAgICAgICAgICAgc2NhbGVMYWJlbDoge1xuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbFN0cmluZzogJydcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XSxcbiAgICAgICAgICAgIHhBeGVzOiBbe1xuICAgICAgICAgICAgICAgIHR5cGU6ICdsaW5lYXInLFxuICAgICAgICAgICAgICAgIHNjYWxlTGFiZWw6IHtcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWxTdHJpbmc6ICcnXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfV1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdmFyIG15Q2hhcnQgPSBuZXcgQ2hhcnQoY3R4LCB7XG4gICAgICAgICAgICB0eXBlOiAnc2NhdHRlcicsXG4gICAgICAgICAgICBkYXRhOiBkYXRhLFxuICAgICAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgICBzaG93TGluZXM6IGZhbHNlLFxuICAgICAgICAgICAgICB4QXhlczogW3tcbiAgICAgICAgICAgICAgICAgIGRpc3BsYXk6IHRydWVcbiAgICAgICAgICAgICAgfV0sXG4gICAgICAgICAgICAgIHNjYWxlczogc2NhbGVzLFxuICAgICAgICAgICAgICBob3Zlcjoge1xuICAgICAgICAgICAgICAgIG1vZGU6ICdzaW5nbGUnLFxuICAgICAgICAgICAgICAgIC8qb25Ib3ZlcjogZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdvbkhvdmVyJywgYSwgYik7XG4gICAgICAgICAgICAgICAgfSovXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIGxlZ2VuZDoge1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAnYm90dG9tJ1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB0b29sdGlwczoge1xuICAgICAgICAgICAgICAgIG1vZGU6ICdzaW5nbGUnLFxuICAgICAgICAgICAgICAgIGNhbGxiYWNrczoge1xuICAgICAgICAgICAgICAgICAgdGl0bGU6IGZ1bmN0aW9uIChhLCBiLCBjKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBpdGVtcyA9IGIuZGF0YXNldHMuZmlsdGVyKGZ1bmN0aW9uIChvKSB7XG4gICAgICAgICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhvLCBvLmRhdGFbMF0ueCA9PSBhWzBdLnhMYWJlbCAmJiBvLmRhdGFbMF0ueSA9PSBhWzBdLnlMYWJlbCwgby5kYXRhWzBdLngsIGFbMF0ueExhYmVsLCBvLmRhdGFbMF0ueSwgYVswXS55TGFiZWwpO1xuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBvLmRhdGFbMF0ueCA9PSBhWzBdLnhMYWJlbCAmJiBvLmRhdGFbMF0ueSA9PSBhWzBdLnlMYWJlbDtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coYSwgYiwgaXRlbXMpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaXRlbXMubWFwKGZ1bmN0aW9uKG8pIHsgcmV0dXJuIG8ubGFiZWwgfSkuc29ydCgpLmpvaW4oJywnKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG15Q2hhcnQuZGF0YS5kYXRhc2V0c1thWzBdLmRhdGFzZXRJbmRleF0ubGFiZWw7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAnYXNkZic7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBjb25zb2xlLmxvZygnbXlDaGFydCcsIG15Q2hhcnQpO1xuICAgICAgICB2YXIgdmlld01vZGVsID0ge1xuICAgICAgICAgIGF0dHJpYnV0ZXM6IGtvLm9ic2VydmFibGVBcnJheShhdHRyaWJ1dGVPcHRpb25zKSxcbiAgICAgICAgICBzZWxlY3RlZFg6IGtvLm9ic2VydmFibGUoKSxcbiAgICAgICAgICBzZWxlY3RlZFk6IGtvLm9ic2VydmFibGUoKSxcbiAgICAgICAgICBzZWxlY3RlZExldmVsOiBrby5vYnNlcnZhYmxlKCksXG4gICAgICAgICAgc2hvd0xlZ2VuZDoga28ub2JzZXJ2YWJsZSh0cnVlKSxcbiAgICAgICAgICB0b2dnbGVPbjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgbXlDaGFydC5kYXRhLmRhdGFzZXRzLmZvckVhY2goZnVuY3Rpb24gKGRhdGFzZXQpIHtcbiAgICAgICAgICAgICAgZGF0YXNldC5oaWRkZW4gPSBmYWxzZTtcbiAgICAgICAgICAgICAgZGF0YXNldC5fbWV0YVswXS5oaWRkZW4gPSBudWxsO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBteUNoYXJ0LnVwZGF0ZSgpO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgdG9nZ2xlT2ZmOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBteUNoYXJ0LmRhdGEuZGF0YXNldHMuZm9yRWFjaChmdW5jdGlvbiAoZGF0YXNldCkge1xuICAgICAgICAgICAgICBkYXRhc2V0LmhpZGRlbiA9IHRydWU7XG4gICAgICAgICAgICAgIGRhdGFzZXQuX21ldGFbMF0uaGlkZGVuID0gbnVsbDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgbXlDaGFydC51cGRhdGUoKTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIHRvZ2dsZUxlZ2VuZDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmlld01vZGVsLnNob3dMZWdlbmQoIXZpZXdNb2RlbC5zaG93TGVnZW5kKCkpO1xuICAgICAgICAgICAgbXlDaGFydC5vcHRpb25zLmxlZ2VuZC5kaXNwbGF5ID0gdmlld01vZGVsLnNob3dMZWdlbmQoKTtcbiAgICAgICAgICAgIG15Q2hhcnQudXBkYXRlKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB2aWV3TW9kZWwuc2VsZWN0ZWRYLnN1YnNjcmliZShmdW5jdGlvbiAobmV3VmFsdWUpIHtcbiAgICAgICAgICB1cGRhdGVRdWVyeVN0cmluZ1BhcmFtKFwieFwiLCBuZXdWYWx1ZSk7XG4gICAgICAgICAgdXBkYXRlKCk7XG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgdmlld01vZGVsLnNlbGVjdGVkTGV2ZWwuc3Vic2NyaWJlKGZ1bmN0aW9uIChuZXdWYWx1ZSkge1xuICAgICAgICAgIHVwZGF0ZVF1ZXJ5U3RyaW5nUGFyYW0oXCJsZXZlbFwiLCBuZXdWYWx1ZSk7XG4gICAgICAgICAgdXBkYXRlKCk7XG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgdmlld01vZGVsLnNlbGVjdGVkWS5zdWJzY3JpYmUoZnVuY3Rpb24gKG5ld1ZhbHVlKSB7XG4gICAgICAgICAgdXBkYXRlUXVlcnlTdHJpbmdQYXJhbShcInlcIiwgbmV3VmFsdWUpO1xuICAgICAgICAgIHVwZGF0ZSgpO1xuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIHZpZXdNb2RlbC5zZWxlY3RlZFgocXVlcnlfc3RyaW5nWyd4J10gfHwgJ2VocCcpO1xuICAgICAgICB2aWV3TW9kZWwuc2VsZWN0ZWRZKHF1ZXJ5X3N0cmluZ1sneSddIHx8ICdkcHMnKTtcbiAgICAgICAgdmlld01vZGVsLnNlbGVjdGVkTGV2ZWwocXVlcnlfc3RyaW5nWydsZXZlbCddIHx8IDEpO1xuICAgICAgICBpbml0KCk7XG4gICAgICAgIFxuICAgICAgICBmdW5jdGlvbiBpbml0KCkge1xuICAgICAgICAgIGlmICghdmlld01vZGVsLnNlbGVjdGVkWCgpIHx8ICF2aWV3TW9kZWwuc2VsZWN0ZWRZKCkpIHJldHVybjtcbiAgICAgICAgICBkYXRhLmRhdGFzZXRzLmxlbmd0aCA9IDA7XG4gICAgICAgICAgaGVyb2VzLmZvckVhY2goZnVuY3Rpb24gKGhlcm8pIHtcbiAgICAgICAgICAgIHZhciBoRGF0YSA9IGhlcm9kYXRhWyducGNfZG90YV9oZXJvXycgKyBoZXJvXTtcbiAgICAgICAgICAgIHZhciBkYXRhc2V0ID0gbmV3IERhdGFTZXQoaERhdGEuZGlzcGxheW5hbWUpO1xuICAgICAgICAgICAgdmFyIHB0ID0gZ2V0UG9pbnQoaGVybyk7XG4gICAgICAgICAgICBkYXRhc2V0Ll9oZXJvSWQgPSBoZXJvO1xuICAgICAgICAgICAgZGF0YXNldC5kYXRhLnB1c2gocHQpO1xuICAgICAgICAgICAgZGF0YXNldC5wb2ludFN0eWxlLnB1c2goaWNvbnNbaGVyb10pO1xuICAgICAgICAgICAgLy9kYXRhc2V0LnBvaW50U3R5bGUucHVzaCgncmVjdCcpO1xuICAgICAgICAgICAgZGF0YS5kYXRhc2V0cy5wdXNoKGRhdGFzZXQpO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIGRhdGEuZGF0YXNldHMuc29ydChmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICAgICAgaWYgKGEubGFiZWwgPCBiLmxhYmVsKSByZXR1cm4gLTE7XG4gICAgICAgICAgICBpZiAoYS5sYWJlbCA+IGIubGFiZWwpIHJldHVybiAxO1xuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgc2V0Q2hhcnRMYWJlbHMoKVxuICAgICAgICAgIG15Q2hhcnQudXBkYXRlKCk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGZ1bmN0aW9uIHVwZGF0ZSgpIHtcbiAgICAgICAgICBpZiAoIXZpZXdNb2RlbC5zZWxlY3RlZFgoKSB8fCAhdmlld01vZGVsLnNlbGVjdGVkWSgpKSByZXR1cm47XG4gICAgICAgICAgbXlDaGFydC5kYXRhLmRhdGFzZXRzLmZvckVhY2goZnVuY3Rpb24gKGRhdGFzZXQpIHtcbiAgICAgICAgICAgIHZhciBoZXJvID0gZGF0YXNldC5faGVyb0lkO1xuICAgICAgICAgICAgdmFyIHB0ID0gZ2V0UG9pbnQoaGVybyk7XG4gICAgICAgICAgICBkYXRhc2V0LmRhdGEubGVuZ3RoID0gMDtcbiAgICAgICAgICAgIGRhdGFzZXQuZGF0YS5wdXNoKHB0KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBzZXRDaGFydExhYmVscygpXG4gICAgICAgICAgbXlDaGFydC51cGRhdGUoKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgZnVuY3Rpb24gc2V0Q2hhcnRMYWJlbHMoKSB7XG4gICAgICAgICAgdmFyIGxhYmVsWCA9IGF0dHJpYnV0ZU9wdGlvbnMuZmlsdGVyKGZ1bmN0aW9uIChhKSB7IHJldHVybiBhLmlkID09IHZpZXdNb2RlbC5zZWxlY3RlZFgoKTsgfSlbMF0ubmFtZTtcbiAgICAgICAgICB2YXIgbGFiZWxZID0gYXR0cmlidXRlT3B0aW9ucy5maWx0ZXIoZnVuY3Rpb24gKGEpIHsgcmV0dXJuIGEuaWQgPT0gdmlld01vZGVsLnNlbGVjdGVkWSgpOyB9KVswXS5uYW1lO1xuICAgICAgICAgIHZhciBsYWJlbCA9IGxhYmVsWSArICcgdnMuICcgKyBsYWJlbFg7XG4gICAgICAgICAgbXlDaGFydC5vcHRpb25zLnNjYWxlcy55QXhlc1swXS5zY2FsZUxhYmVsLmxhYmVsU3RyaW5nID0gbGFiZWxZO1xuICAgICAgICAgIG15Q2hhcnQub3B0aW9ucy5zY2FsZXMueEF4ZXNbMF0uc2NhbGVMYWJlbC5sYWJlbFN0cmluZyA9IGxhYmVsWDtcbiAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2hhcnQtdGl0bGUnKS5pbm5lckhUTUwgPSBsYWJlbDtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgZnVuY3Rpb24gZ2V0UG9pbnQoaGVybykge1xuICAgICAgICAgIHZhciBoRGF0YSA9IGhlcm9kYXRhWyducGNfZG90YV9oZXJvXycgKyBoZXJvXTtcbiAgICAgICAgICBpZiAoYXR0cmlidXRlTW9kaWZpZXJzLmhhc093blByb3BlcnR5KHZpZXdNb2RlbC5zZWxlY3RlZFgoKSkpIHtcbiAgICAgICAgICAgIHZhciB4ID0gcGFyc2VGbG9hdChhdHRyaWJ1dGVNb2RpZmllcnNbdmlld01vZGVsLnNlbGVjdGVkWCgpXS5jYWxsKGhEYXRhLCB2aWV3TW9kZWwuc2VsZWN0ZWRMZXZlbCgpKS50b0ZpeGVkKDQpKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB2YXIgeCA9IHBhcnNlRmxvYXQoaERhdGFbdmlld01vZGVsLnNlbGVjdGVkWCgpXS50b0ZpeGVkKDQpKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGF0dHJpYnV0ZU1vZGlmaWVycy5oYXNPd25Qcm9wZXJ0eSh2aWV3TW9kZWwuc2VsZWN0ZWRZKCkpKSB7XG4gICAgICAgICAgICB2YXIgeSA9IHBhcnNlRmxvYXQoYXR0cmlidXRlTW9kaWZpZXJzW3ZpZXdNb2RlbC5zZWxlY3RlZFkoKV0uY2FsbChoRGF0YSwgdmlld01vZGVsLnNlbGVjdGVkTGV2ZWwoKSkudG9GaXhlZCg0KSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdmFyIHkgPSBwYXJzZUZsb2F0KGhEYXRhW3ZpZXdNb2RlbC5zZWxlY3RlZFkoKV0udG9GaXhlZCg0KSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB7eDogeCwgeTogeX07XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGtvLmFwcGx5QmluZGluZ3Modmlld01vZGVsKTtcbiAgICAgIH1cbiAgICB9KTtcbn0pOyIsInZhciBxdWVyeV9zdHJpbmcgPSAoZnVuY3Rpb24oYSkge1xuICAgIGlmIChhID09IFwiXCIpIHJldHVybiB7fTtcbiAgICB2YXIgYiA9IHt9O1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYS5sZW5ndGg7ICsraSlcbiAgICB7XG4gICAgICAgIHZhciBwPWFbaV0uc3BsaXQoJz0nLCAyKTtcbiAgICAgICAgaWYgKHAubGVuZ3RoID09IDEpXG4gICAgICAgICAgICBiW3BbMF1dID0gXCJcIjtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgYltwWzBdXSA9IGRlY29kZVVSSUNvbXBvbmVudChwWzFdLnJlcGxhY2UoL1xcKy9nLCBcIiBcIikpO1xuICAgIH1cbiAgICByZXR1cm4gYjtcbn0pKHdpbmRvdy5sb2NhdGlvbi5zZWFyY2guc3Vic3RyKDEpLnNwbGl0KCcmJykpO1xuXG4vLyBFeHBsaWNpdGx5IHNhdmUvdXBkYXRlIGEgdXJsIHBhcmFtZXRlciB1c2luZyBIVE1MNSdzIHJlcGxhY2VTdGF0ZSgpLlxuZnVuY3Rpb24gdXBkYXRlUXVlcnlTdHJpbmdQYXJhbShrZXksIHZhbHVlKSB7XG4gIGJhc2VVcmwgPSBbbG9jYXRpb24ucHJvdG9jb2wsICcvLycsIGxvY2F0aW9uLmhvc3QsIGxvY2F0aW9uLnBhdGhuYW1lXS5qb2luKCcnKTtcbiAgdXJsUXVlcnlTdHJpbmcgPSBkb2N1bWVudC5sb2NhdGlvbi5zZWFyY2g7XG4gIHZhciBuZXdQYXJhbSA9IGtleSArICc9JyArIHZhbHVlLFxuICBwYXJhbXMgPSAnPycgKyBuZXdQYXJhbTtcblxuICAvLyBJZiB0aGUgXCJzZWFyY2hcIiBzdHJpbmcgZXhpc3RzLCB0aGVuIGJ1aWxkIHBhcmFtcyBmcm9tIGl0XG4gIGlmICh1cmxRdWVyeVN0cmluZykge1xuICAgIGtleVJlZ2V4ID0gbmV3IFJlZ0V4cCgnKFtcXD8mXSknICsga2V5ICsgJ1teJl0qJyk7XG4gICAgLy8gSWYgcGFyYW0gZXhpc3RzIGFscmVhZHksIHVwZGF0ZSBpdFxuICAgIGlmICh1cmxRdWVyeVN0cmluZy5tYXRjaChrZXlSZWdleCkgIT09IG51bGwpIHtcbiAgICAgIHBhcmFtcyA9IHVybFF1ZXJ5U3RyaW5nLnJlcGxhY2Uoa2V5UmVnZXgsIFwiJDFcIiArIG5ld1BhcmFtKTtcbiAgICB9IGVsc2UgeyAvLyBPdGhlcndpc2UsIGFkZCBpdCB0byBlbmQgb2YgcXVlcnkgc3RyaW5nXG4gICAgICBwYXJhbXMgPSB1cmxRdWVyeVN0cmluZyArICcmJyArIG5ld1BhcmFtO1xuICAgIH1cbiAgfVxuICB3aW5kb3cuaGlzdG9yeS5yZXBsYWNlU3RhdGUoe30sIFwiXCIsIGJhc2VVcmwgKyBwYXJhbXMpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBxdWVyeV9zdHJpbmc6IHF1ZXJ5X3N0cmluZyxcbiAgICB1cGRhdGVRdWVyeVN0cmluZ1BhcmFtOiB1cGRhdGVRdWVyeVN0cmluZ1BhcmFtXG59OyIsInZhciBnZXRKU09OID0gcmVxdWlyZSgnLi91dGlsL2dldEpTT04nKTtcbiAgICBcbnZhciBLVExJQiA9IChmdW5jdGlvbiAoKSB7XG4gIFxuICB2YXIgYXR0cmlidXRlT3B0aW9ucyA9IFtcbiAgICB7aWQ6IFwiYXJtb3JwaHlzaWNhbFwiLCBuYW1lOiBcIkFybW9yXCJ9LFxuICAgIHtpZDogXCJwcm9qZWN0aWxlc3BlZWRcIiwgbmFtZTogXCJNaXNzaWxlIFNwZWVkXCJ9LFxuICAgIHtpZDogXCJhdHRhY2tyYW5nZVwiLCBuYW1lOiBcIkF0dGFjayBSYW5nZVwifSxcbiAgICB7aWQ6IFwiYXR0cmlidXRlYWdpbGl0eWdhaW5cIiwgbmFtZTogXCJBZ2kgR2FpblwifSxcbiAgICB7aWQ6IFwiYXR0cmlidXRlc3RyZW5ndGhnYWluXCIsIG5hbWU6IFwiU3RyIEdhaW5cIn0sXG4gICAge2lkOiBcImF0dHJpYnV0ZWludGVsbGlnZW5jZWdhaW5cIiwgbmFtZTogXCJJbnQgR2FpblwifSxcbiAgICB7aWQ6IFwiYXR0cmlidXRlYmFzZWFnaWxpdHlcIiwgbmFtZTogXCJCYXNlIEFnaVwifSxcbiAgICB7aWQ6IFwiYXR0cmlidXRlYmFzZWludGVsbGlnZW5jZVwiLCBuYW1lOiBcIkJhc2UgSW50XCJ9LFxuICAgIHtpZDogXCJhdHRyaWJ1dGViYXNlc3RyZW5ndGhcIiwgbmFtZTogXCJCYXNlIFN0clwifSxcbiAgICB7aWQ6IFwiYXR0cmlidXRlcHJpbWFyeVwiLCBuYW1lOiBcIlByaW1hcnkgQXR0clwifSxcbiAgICB7aWQ6IFwic3RhdHVzaGVhbHRoXCIsIG5hbWU6IFwiSFBcIn0sXG4gICAge2lkOiBcInN0YXR1c21hbmFcIiwgbmFtZTogXCJNYW5hXCJ9LFxuICAgIHtpZDogXCJzdGF0dXNoZWFsdGhyZWdlblwiLCBuYW1lOiBcIkhQIFJlZ2VuXCJ9LFxuICAgIHtpZDogXCJzdGF0dXNtYW5hcmVnZW5cIiwgbmFtZTogXCJNYW5hIFJlZ2VuXCJ9LFxuICAgIHtpZDogXCJtb3ZlbWVudHNwZWVkXCIsIG5hbWU6IFwiTW92ZW1lbnQgU3BlZWRcIn0sXG4gICAge2lkOiBcIm1vdmVtZW50dHVybnJhdGVcIiwgbmFtZTogXCJUdXJuIFJhdGVcIn0sXG4gICAge2lkOiBcImF0dGFja2RhbWFnZW1pblwiLCBuYW1lOiBcIkF0dGFjayBEYW1hZ2UgTWluXCJ9LFxuICAgIHtpZDogXCJhdHRhY2tkYW1hZ2VtYXhcIiwgbmFtZTogXCJBdHRhY2sgRGFtYWdlIE1heFwifSxcbiAgICB7aWQ6IFwiYXR0YWNrZGFtYWdlYXZnXCIsIG5hbWU6IFwiQXR0YWNrIERhbWFnZSBBdmdcIn0sXG4gICAge2lkOiBcImVocFwiLCBuYW1lOiBcIkVIUFwifSxcbiAgICB7aWQ6IFwibWVocFwiLCBuYW1lOiBcIk1hZ2ljYWwgRUhQXCJ9LFxuICAgIHtpZDogXCJkcHNcIiwgbmFtZTogXCJEUFNcIn0sXG4gICAge2lkOiBcImFnaWxpdHlcIiwgbmFtZTogXCJBZ2lsaXR5XCJ9LFxuICAgIHtpZDogXCJpbnRlbGxpZ2VuY2VcIiwgbmFtZTogXCJJbnRlbGxpZ2VuY2VcIn0sXG4gICAge2lkOiBcInN0cmVuZ3RoXCIsIG5hbWU6IFwiU3RyZW5ndGhcIn0sXG4gIF0sXG4gIGF0dHJpYnV0ZXMgPSBhdHRyaWJ1dGVPcHRpb25zLm1hcChmdW5jdGlvbiAoYSkgeyByZXR1cm4gYS5pZDsgfSksXG4gIGF0dHJpYnV0ZU1vZGlmaWVycyA9IHtcbiAgICBhcm1vcnBoeXNpY2FsOiBmdW5jdGlvbiAobGV2ZWwsIGJvbnVzTGV2ZWwpIHtcbiAgICAgIHJldHVybiB0aGlzLmFybW9ycGh5c2ljYWwgKyBnZXRBdHRyaWJ1dGVBdExldmVsLmNhbGwodGhpcywgJ0RPVEFfQVRUUklCVVRFX0FHSUxJVFknLCBsZXZlbCwgYm9udXNMZXZlbCkgKiAoMS82KTtcbiAgICB9LFxuICAgIHN0YXR1c2hlYWx0aDogZnVuY3Rpb24gKGxldmVsLCBib251c0xldmVsKSB7XG4gICAgICByZXR1cm4gdGhpcy5zdGF0dXNoZWFsdGggKyBnZXRBdHRyaWJ1dGVBdExldmVsLmNhbGwodGhpcywgJ0RPVEFfQVRUUklCVVRFX1NUUkVOR1RIJywgbGV2ZWwsIGJvbnVzTGV2ZWwpICogMjA7XG4gICAgfSxcbiAgICBzdGF0dXNtYW5hOiBmdW5jdGlvbiAobGV2ZWwsIGJvbnVzTGV2ZWwpIHtcbiAgICAgIHJldHVybiB0aGlzLnN0YXR1c21hbmEgKyBnZXRBdHRyaWJ1dGVBdExldmVsLmNhbGwodGhpcywgJ0RPVEFfQVRUUklCVVRFX0lOVEVMTEVDVCcsIGxldmVsLCBib251c0xldmVsKSAqIDEyO1xuICAgIH0sXG4gICAgc3RhdHVzaGVhbHRocmVnZW46IGZ1bmN0aW9uIChsZXZlbCwgYm9udXNMZXZlbCkge1xuICAgICAgcmV0dXJuIHRoaXMuc3RhdHVzaGVhbHRocmVnZW4gKiAoMSArIGdldEF0dHJpYnV0ZUF0TGV2ZWwuY2FsbCh0aGlzLCAnRE9UQV9BVFRSSUJVVEVfU1RSRU5HVEgnLCBsZXZlbCwgYm9udXNMZXZlbCkgKiAwLjAwNyk7XG4gICAgfSxcbiAgICBzdGF0dXNtYW5hcmVnZW46IGZ1bmN0aW9uIChsZXZlbCwgYm9udXNMZXZlbCkge1xuICAgICAgcmV0dXJuIHRoaXMuc3RhdHVzbWFuYXJlZ2VuICogKDEgKyBnZXRBdHRyaWJ1dGVBdExldmVsLmNhbGwodGhpcywgJ0RPVEFfQVRUUklCVVRFX0lOVEVMTEVDVCcsIGxldmVsLCBib251c0xldmVsKSAqIDAuMDIpO1xuICAgIH0sXG4gICAgYXR0YWNrZGFtYWdlbWF4OiBmdW5jdGlvbiAobGV2ZWwsIGJvbnVzTGV2ZWwpIHtcbiAgICAgIHJldHVybiB0aGlzLmF0dGFja2RhbWFnZW1heCArIGdldEF0dHJpYnV0ZUF0TGV2ZWwuY2FsbCh0aGlzLCB0aGlzLmF0dHJpYnV0ZXByaW1hcnksIGxldmVsLCBib251c0xldmVsKTtcbiAgICB9LFxuICAgIGF0dGFja2RhbWFnZW1pbjogZnVuY3Rpb24gKGxldmVsLCBib251c0xldmVsKSB7XG4gICAgICByZXR1cm4gdGhpcy5hdHRhY2tkYW1hZ2VtaW4gKyBnZXRBdHRyaWJ1dGVBdExldmVsLmNhbGwodGhpcywgdGhpcy5hdHRyaWJ1dGVwcmltYXJ5LCBsZXZlbCwgYm9udXNMZXZlbCk7XG4gICAgfSxcbiAgICBhdHRhY2tkYW1hZ2Vhdmc6IGZ1bmN0aW9uIChsZXZlbCwgYm9udXNMZXZlbCkge1xuICAgICAgdmFyIG1heERtZyA9IGF0dHJpYnV0ZU1vZGlmaWVycy5hdHRhY2tkYW1hZ2VtYXguYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIHZhciBtaW5EbWcgPSBhdHRyaWJ1dGVNb2RpZmllcnMuYXR0YWNrZGFtYWdlbWluLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICByZXR1cm4gKG1heERtZyArIG1pbkRtZykgLyAyO1xuICAgIH0sXG4gICAgZWhwOiBmdW5jdGlvbiAobGV2ZWwsIGJvbnVzTGV2ZWwpIHtcbiAgICAgIHZhciBhcm1vciA9IGF0dHJpYnV0ZU1vZGlmaWVycy5hcm1vcnBoeXNpY2FsLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICB2YXIgaGVhbHRoID0gYXR0cmlidXRlTW9kaWZpZXJzLnN0YXR1c2hlYWx0aC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgcmV0dXJuIGhlYWx0aCAvICgxIC0gMC4wNSphcm1vciAvICgxICsgKDAuMDUgKiBhcm1vcikpKTtcbiAgICB9LFxuICAgIG1laHA6IGZ1bmN0aW9uIChsZXZlbCwgYm9udXNMZXZlbCkge1xuICAgICAgdmFyIGhlYWx0aCA9IGF0dHJpYnV0ZU1vZGlmaWVycy5zdGF0dXNoZWFsdGguYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIHJldHVybiBoZWFsdGggKiAoMSAvICgxIC0gdGhpcy5tYWdpY2FscmVzaXN0YW5jZSAvIDEwMCkpO1xuICAgIH0sXG4gICAgZHBzOiBmdW5jdGlvbiAobGV2ZWwsIGJvbnVzTGV2ZWwpIHtcbiAgICAgIHZhciBkbWcgPSBhdHRyaWJ1dGVNb2RpZmllcnMuYXR0YWNrZGFtYWdlYXZnLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICB2YXIgYXMgPSAxMDAgKyBnZXRBdHRyaWJ1dGVBdExldmVsLmNhbGwodGhpcywgJ0RPVEFfQVRUUklCVVRFX0FHSUxJVFknLCBsZXZlbCwgYm9udXNMZXZlbCk7XG4gICAgICByZXR1cm4gZG1nICogYXMgLyAxMDAgLyB0aGlzLmF0dGFja3JhdGU7XG4gICAgfSxcbiAgICBhZ2lsaXR5OiBmdW5jdGlvbiAobGV2ZWwsIGJvbnVzTGV2ZWwpIHtcbiAgICAgIHJldHVybiBnZXRBdHRyaWJ1dGVBdExldmVsLmNhbGwodGhpcywgJ0RPVEFfQVRUUklCVVRFX0FHSUxJVFknLCBsZXZlbCwgYm9udXNMZXZlbCk7XG4gICAgfSxcbiAgICBpbnRlbGxpZ2VuY2U6IGZ1bmN0aW9uIChsZXZlbCwgYm9udXNMZXZlbCkge1xuICAgICAgcmV0dXJuIGdldEF0dHJpYnV0ZUF0TGV2ZWwuY2FsbCh0aGlzLCAnRE9UQV9BVFRSSUJVVEVfSU5URUxMRUNUJywgbGV2ZWwsIGJvbnVzTGV2ZWwpO1xuICAgIH0sXG4gICAgc3RyZW5ndGg6IGZ1bmN0aW9uIChsZXZlbCwgYm9udXNMZXZlbCkge1xuICAgICAgcmV0dXJuIGdldEF0dHJpYnV0ZUF0TGV2ZWwuY2FsbCh0aGlzLCAnRE9UQV9BVFRSSUJVVEVfU1RSRU5HVEgnLCBsZXZlbCwgYm9udXNMZXZlbCk7XG4gICAgfSxcbiAgfSxcbiAgZ2V0QXR0cmlidXRlVmFsdWUgPSBmdW5jdGlvbiAoaGVybywgYXR0cmlidXRlKSB7XG4gICAgaWYgKGF0dHJpYnV0ZU1vZGlmaWVycy5oYXNPd25Qcm9wZXJ0eShhdHRyaWJ1dGUpKSB7XG4gICAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMik7XG4gICAgICByZXR1cm4gYXR0cmlidXRlTW9kaWZpZXJzW2F0dHJpYnV0ZV0uYXBwbHkoX2hlcm9kYXRhW2hlcm9dLCBhcmdzKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICByZXR1cm4gX2hlcm9kYXRhW2hlcm9dW2F0dHJpYnV0ZV07XG4gICAgfVxuICB9LFxuICBfaGVyb2RhdGEgPSBudWxsO1xuICBcbiAgZnVuY3Rpb24gZ2V0QXR0cmlidXRlQXRMZXZlbChhdHRyaWJ1dGUsIGxldmVsLCBib251c0xldmVsKSB7XG4gICAgdmFyIGxldmVsID0gbGV2ZWwgfHwgMTtcbiAgICB2YXIgYm9udXNMZXZlbCA9IGJvbnVzTGV2ZWwgfHwgMDtcbiAgICByZXR1cm4gZ2V0QXR0cmlidXRlQmFzZS5jYWxsKHRoaXMsIGF0dHJpYnV0ZSkgKyBnZXRBdHRyaWJ1dGVHYWluLmNhbGwodGhpcywgYXR0cmlidXRlKSAqIChsZXZlbCAtIDEpICsgYm9udXNMZXZlbCAqIDI7XG4gIH1cbiAgXG4gIGZ1bmN0aW9uIGdldEF0dHJpYnV0ZUdhaW4oYXR0cmlidXRlKSB7XG4gICAgc3dpdGNoIChhdHRyaWJ1dGUpIHtcbiAgICAgIGNhc2UgJ0RPVEFfQVRUUklCVVRFX1NUUkVOR1RIJzpcbiAgICAgICAgcmV0dXJuIHRoaXMuYXR0cmlidXRlc3RyZW5ndGhnYWluO1xuICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdET1RBX0FUVFJJQlVURV9BR0lMSVRZJzpcbiAgICAgICAgcmV0dXJuIHRoaXMuYXR0cmlidXRlYWdpbGl0eWdhaW47XG4gICAgICBicmVhaztcbiAgICAgIGNhc2UgJ0RPVEFfQVRUUklCVVRFX0lOVEVMTEVDVCc6XG4gICAgICAgIHJldHVybiB0aGlzLmF0dHJpYnV0ZWludGVsbGlnZW5jZWdhaW47XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgXG4gIGZ1bmN0aW9uIGdldEF0dHJpYnV0ZUJhc2UoYXR0cmlidXRlKSB7XG4gICAgc3dpdGNoIChhdHRyaWJ1dGUpIHtcbiAgICAgIGNhc2UgJ0RPVEFfQVRUUklCVVRFX1NUUkVOR1RIJzpcbiAgICAgICAgcmV0dXJuIHRoaXMuYXR0cmlidXRlYmFzZXN0cmVuZ3RoO1xuICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdET1RBX0FUVFJJQlVURV9BR0lMSVRZJzpcbiAgICAgICAgcmV0dXJuIHRoaXMuYXR0cmlidXRlYmFzZWFnaWxpdHk7XG4gICAgICBicmVhaztcbiAgICAgIGNhc2UgJ0RPVEFfQVRUUklCVVRFX0lOVEVMTEVDVCc6XG4gICAgICAgIHJldHVybiB0aGlzLmF0dHJpYnV0ZWJhc2VpbnRlbGxpZ2VuY2U7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgXG4gIGZ1bmN0aW9uIGdldFByaW1hcnlBdHRyaWJ1dGVHYWluKCkge1xuICAgIHJldHVybiBnZXRBdHRyaWJ1dGVHYWluKHRoaXMuYXR0cmlidXRlcHJpbWFyeSk7XG4gIH0gIFxuICBcbiAgZnVuY3Rpb24gZ2V0UHJpbWFyeUF0dHJpYnV0ZUJhc2UoKSB7XG4gICAgcmV0dXJuIGdldEF0dHJpYnV0ZUJhc2UodGhpcy5hdHRyaWJ1dGVwcmltYXJ5KTtcbiAgfVxuICBcbiAgcmV0dXJuIHtcbiAgICBhdHRyaWJ1dGVzOiBhdHRyaWJ1dGVzLFxuICAgIGF0dHJpYnV0ZU9wdGlvbnM6IGF0dHJpYnV0ZU9wdGlvbnMsXG4gICAgYXR0cmlidXRlTW9kaWZpZXJzOiBhdHRyaWJ1dGVNb2RpZmllcnMsXG4gICAgZ2V0QXR0cmlidXRlQXRMZXZlbDogZ2V0QXR0cmlidXRlQXRMZXZlbCxcbiAgICBnZXRBdHRyaWJ1dGVCYXNlOiBnZXRBdHRyaWJ1dGVCYXNlLFxuICAgIGdldEF0dHJpYnV0ZUdhaW46IGdldEF0dHJpYnV0ZUdhaW4sXG4gICAgZ2V0UHJpbWFyeUF0dHJpYnV0ZUJhc2U6IGdldFByaW1hcnlBdHRyaWJ1dGVCYXNlLFxuICAgIGdldFByaW1hcnlBdHRyaWJ1dGVHYWluOiBnZXRQcmltYXJ5QXR0cmlidXRlR2FpbixcbiAgICBnZXRBdHRyaWJ1dGVWYWx1ZTogZ2V0QXR0cmlidXRlVmFsdWUsXG4gICAgZ2V0SGVyb0RhdGE6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBfaGVyb2RhdGEgfHwge307XG4gICAgfSxcbiAgICBpbml0OiBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICAgIGdldEpTT04oXCIvbWVkaWEvZG90YS1qc29uL2hlcm9kYXRhLmpzb25cIiwgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgX2hlcm9kYXRhID0gZGF0YTtcbiAgICAgICAgY2FsbGJhY2soZGF0YSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG59KSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEtUTElCOyJdfQ==
