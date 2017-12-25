require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({41:[function(require,module,exports){
var $ = jQuery = require('jquery');
require('bootstrap');
var KTLIB = require('../ktlib');
var QueryString = require('../util/queryString');
var query_string = QueryString.query_string;
var updateQueryStringParam = QueryString.updateQueryStringParam;

$(function () {
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
    $.getJSON("/media/dota-json/heroes.json", function (response) {
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
          $('#chart-title').text(label);
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
});
},{"../ktlib":47,"../util/queryString":54,"bootstrap":1,"jquery":25}],54:[function(require,module,exports){
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
},{}]},{},[41])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvaGVyb2VzL2NoYXJ0LmpzIiwic3JjL2pzL3V0aWwvcXVlcnlTdHJpbmcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciAkID0galF1ZXJ5ID0gcmVxdWlyZSgnanF1ZXJ5Jyk7XG5yZXF1aXJlKCdib290c3RyYXAnKTtcbnZhciBLVExJQiA9IHJlcXVpcmUoJy4uL2t0bGliJyk7XG52YXIgUXVlcnlTdHJpbmcgPSByZXF1aXJlKCcuLi91dGlsL3F1ZXJ5U3RyaW5nJyk7XG52YXIgcXVlcnlfc3RyaW5nID0gUXVlcnlTdHJpbmcucXVlcnlfc3RyaW5nO1xudmFyIHVwZGF0ZVF1ZXJ5U3RyaW5nUGFyYW0gPSBRdWVyeVN0cmluZy51cGRhdGVRdWVyeVN0cmluZ1BhcmFtO1xuXG4kKGZ1bmN0aW9uICgpIHtcbiAgS1RMSUIuaW5pdChmdW5jdGlvbiAoaGVyb2RhdGEpIHtcbiAgICBjb25zb2xlLmxvZygnaGVyb2RhdGEnLCBoZXJvZGF0YSk7XG4gICAgdmFyIGF0dHJpYnV0ZU9wdGlvbnMgPSBLVExJQi5hdHRyaWJ1dGVPcHRpb25zO1xuICAgIHZhciBhdHRyaWJ1dGVNb2RpZmllcnMgPSBLVExJQi5hdHRyaWJ1dGVNb2RpZmllcnM7XG4gICAgYXR0cmlidXRlT3B0aW9ucy5wdXNoKHtpZDogXCJIZXJvSURcIiwgbmFtZTogXCJIZXJvSURcIn0pO1xuICAgIGF0dHJpYnV0ZU9wdGlvbnMgPSBhdHRyaWJ1dGVPcHRpb25zLmZpbHRlcihmdW5jdGlvbiAoYSkgeyByZXR1cm4gYS5pZCAhPT0gJ2F0dHJpYnV0ZXByaW1hcnknOyB9KS5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICBpZiAoYS5uYW1lIDwgYi5uYW1lKSByZXR1cm4gLTE7XG4gICAgICBpZiAoYS5uYW1lID4gYi5uYW1lKSByZXR1cm4gMTtcbiAgICAgIHJldHVybiAwO1xuICAgIH0pO1xuICAgIHZhciBhdHRyaWJ1dGVzID0gYXR0cmlidXRlT3B0aW9ucy5tYXAoZnVuY3Rpb24gKGEpIHsgcmV0dXJuIGEuaWQ7IH0pXG4gICAgXG4gICAgY29uc29sZS5sb2coJ2F0dHJpYnV0ZXMnLCBhdHRyaWJ1dGVzKTtcbiAgICAkLmdldEpTT04oXCIvbWVkaWEvZG90YS1qc29uL2hlcm9lcy5qc29uXCIsIGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgdmFyIGhlcm9lcyA9IHJlc3BvbnNlLmRhdGE7XG4gICAgICBjb25zb2xlLmxvZyhoZXJvZXMpO1xuICAgICAgdmFyIGljb25zID0ge307XG4gICAgICB2YXIgbG9hZGVkQ291bnQgPSAwO1xuICAgICAgaGVyb2VzLmZvckVhY2goZnVuY3Rpb24gKGhlcm8pIHtcbiAgICAgICAgdmFyIGltZyA9IG5ldyBJbWFnZSgpO1xuICAgICAgICBpbWcuc3JjID0gJy9tZWRpYS9pbWFnZXMvbWluaWhlcm9lcy8nICsgaGVybyArICcucG5nJztcbiAgICAgICAgaWNvbnNbaGVyb10gPSBpbWc7XG4gICAgICAgIGltZy5vbmxvYWQgPSBjaGVja0xvYWRlZDtcbiAgICAgIH0pO1xuICAgICAgXG4gICAgICBmdW5jdGlvbiBjaGVja0xvYWRlZCgpIHtcbiAgICAgICAgbG9hZGVkQ291bnQrKztcbiAgICAgICAgaWYgKGxvYWRlZENvdW50ID09PSBoZXJvZXMubGVuZ3RoKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coaWNvbnMpO1xuICAgICAgICAgIGluaXQoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgXG4gICAgICBmdW5jdGlvbiBTY2FsZShsYWJlbCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdHlwZTogJ2xpbmVhcicsXG4gICAgICAgICAgICBzY2FsZUxhYmVsOiB7XG4gICAgICAgICAgICAgICAgZGlzcGxheTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBsYWJlbFN0cmluZzogbGFiZWxcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgXG4gICAgICBmdW5jdGlvbiBEYXRhU2V0KGxhYmVsKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBsYWJlbDogbGFiZWwsXG4gICAgICAgICAgICBmaWxsOiBmYWxzZSxcbiAgICAgICAgICAgIGxpbmVUZW5zaW9uOiAwLjEsXG4gICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IFwicmdiYSg3NSwxOTIsMTkyLDAuNClcIixcbiAgICAgICAgICAgIGJvcmRlckNvbG9yOiBcInJnYmEoNzUsMTkyLDE5MiwxKVwiLFxuICAgICAgICAgICAgYm9yZGVyQ2FwU3R5bGU6ICdidXR0JyxcbiAgICAgICAgICAgIGJvcmRlckRhc2g6IFtdLFxuICAgICAgICAgICAgYm9yZGVyRGFzaE9mZnNldDogMC4wLFxuICAgICAgICAgICAgYm9yZGVySm9pblN0eWxlOiAnbWl0ZXInLFxuICAgICAgICAgICAgcG9pbnRCb3JkZXJDb2xvcjogXCJyZ2JhKDc1LDE5MiwxOTIsMSlcIixcbiAgICAgICAgICAgIHBvaW50QmFja2dyb3VuZENvbG9yOiBcIiNmZmZcIixcbiAgICAgICAgICAgIHBvaW50Qm9yZGVyV2lkdGg6IDEsXG4gICAgICAgICAgICBwb2ludEhvdmVyUmFkaXVzOiA1LFxuICAgICAgICAgICAgcG9pbnRIb3ZlckJhY2tncm91bmRDb2xvcjogXCJyZ2JhKDc1LDE5MiwxOTIsMSlcIixcbiAgICAgICAgICAgIHBvaW50SG92ZXJCb3JkZXJDb2xvcjogXCJyZ2JhKDIyMCwyMjAsMjIwLDEpXCIsXG4gICAgICAgICAgICBwb2ludEhvdmVyQm9yZGVyV2lkdGg6IDIsXG4gICAgICAgICAgICBwb2ludFJhZGl1czogMTAsXG4gICAgICAgICAgICBwb2ludEhpdFJhZGl1czogMTAsXG4gICAgICAgICAgICBkYXRhOiBbXSxcbiAgICAgICAgICAgIHBvaW50U3R5bGU6IFtdLFxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBcbiAgICAgIGZ1bmN0aW9uIGluaXQoKSB7XG4gICAgICAgIHZhciBjdHggPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm15Q2hhcnRcIik7XG4gICAgICAgIHZhciBkYXRhID0ge1xuICAgICAgICAgICAgbGFiZWxzOiBbXSxcbiAgICAgICAgICAgIGRhdGFzZXRzOiBbXG4gICAgICAgICAgICBdXG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICBkYXRhLmRhdGFzZXRzLnB1c2goKVxuICAgICAgICBcbiAgICAgICAgLypoZXJvZXMuZm9yRWFjaChmdW5jdGlvbiAoaGVybykge1xuICAgICAgICAgIGRhdGEuZGF0YXNldHNbMF0uZGF0YS5wdXNoKHt4OiBNYXRoLnJhbmRvbSgpICogMTAwLCB5OiBNYXRoLnJhbmRvbSgpICogMTAwfSk7XG4gICAgICAgICAgLy9kYXRhLmRhdGFzZXRzWzBdLnBvaW50U3R5bGUucHVzaChpY29uc1toZXJvXSk7XG4gICAgICAgICAgZGF0YS5kYXRhc2V0c1swXS5wb2ludFN0eWxlLnB1c2goJ3JlY3QnKTtcbiAgICAgICAgfSk7Ki9cbiAgICAgICAgXG4gICAgICAgIHZhciBzY2FsZXMgPSB7XG4gICAgICAgICAgICB5QXhlczogW3tcbiAgICAgICAgICAgICAgICB0eXBlOiAnbGluZWFyJyxcbiAgICAgICAgICAgICAgICBzY2FsZUxhYmVsOiB7XG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsU3RyaW5nOiAnJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1dLFxuICAgICAgICAgICAgeEF4ZXM6IFt7XG4gICAgICAgICAgICAgICAgdHlwZTogJ2xpbmVhcicsXG4gICAgICAgICAgICAgICAgc2NhbGVMYWJlbDoge1xuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbFN0cmluZzogJydcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB2YXIgbXlDaGFydCA9IG5ldyBDaGFydChjdHgsIHtcbiAgICAgICAgICAgIHR5cGU6ICdzY2F0dGVyJyxcbiAgICAgICAgICAgIGRhdGE6IGRhdGEsXG4gICAgICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICAgIHNob3dMaW5lczogZmFsc2UsXG4gICAgICAgICAgICAgIHhBeGVzOiBbe1xuICAgICAgICAgICAgICAgICAgZGlzcGxheTogdHJ1ZVxuICAgICAgICAgICAgICB9XSxcbiAgICAgICAgICAgICAgc2NhbGVzOiBzY2FsZXMsXG4gICAgICAgICAgICAgIGhvdmVyOiB7XG4gICAgICAgICAgICAgICAgbW9kZTogJ3NpbmdsZScsXG4gICAgICAgICAgICAgICAgLypvbkhvdmVyOiBmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ29uSG92ZXInLCBhLCBiKTtcbiAgICAgICAgICAgICAgICB9Ki9cbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgbGVnZW5kOiB7XG4gICAgICAgICAgICAgICAgcG9zaXRpb246ICdib3R0b20nXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHRvb2x0aXBzOiB7XG4gICAgICAgICAgICAgICAgbW9kZTogJ3NpbmdsZScsXG4gICAgICAgICAgICAgICAgY2FsbGJhY2tzOiB7XG4gICAgICAgICAgICAgICAgICB0aXRsZTogZnVuY3Rpb24gKGEsIGIsIGMpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGl0ZW1zID0gYi5kYXRhc2V0cy5maWx0ZXIoZnVuY3Rpb24gKG8pIHtcbiAgICAgICAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKG8sIG8uZGF0YVswXS54ID09IGFbMF0ueExhYmVsICYmIG8uZGF0YVswXS55ID09IGFbMF0ueUxhYmVsLCBvLmRhdGFbMF0ueCwgYVswXS54TGFiZWwsIG8uZGF0YVswXS55LCBhWzBdLnlMYWJlbCk7XG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG8uZGF0YVswXS54ID09IGFbMF0ueExhYmVsICYmIG8uZGF0YVswXS55ID09IGFbMF0ueUxhYmVsO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhhLCBiLCBpdGVtcyk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBpdGVtcy5tYXAoZnVuY3Rpb24obykgeyByZXR1cm4gby5sYWJlbCB9KS5zb3J0KCkuam9pbignLCcpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbXlDaGFydC5kYXRhLmRhdGFzZXRzW2FbMF0uZGF0YXNldEluZGV4XS5sYWJlbDtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdhc2RmJztcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdteUNoYXJ0JywgbXlDaGFydCk7XG4gICAgICAgIHZhciB2aWV3TW9kZWwgPSB7XG4gICAgICAgICAgYXR0cmlidXRlczoga28ub2JzZXJ2YWJsZUFycmF5KGF0dHJpYnV0ZU9wdGlvbnMpLFxuICAgICAgICAgIHNlbGVjdGVkWDoga28ub2JzZXJ2YWJsZSgpLFxuICAgICAgICAgIHNlbGVjdGVkWToga28ub2JzZXJ2YWJsZSgpLFxuICAgICAgICAgIHNlbGVjdGVkTGV2ZWw6IGtvLm9ic2VydmFibGUoKSxcbiAgICAgICAgICBzaG93TGVnZW5kOiBrby5vYnNlcnZhYmxlKHRydWUpLFxuICAgICAgICAgIHRvZ2dsZU9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBteUNoYXJ0LmRhdGEuZGF0YXNldHMuZm9yRWFjaChmdW5jdGlvbiAoZGF0YXNldCkge1xuICAgICAgICAgICAgICBkYXRhc2V0LmhpZGRlbiA9IGZhbHNlO1xuICAgICAgICAgICAgICBkYXRhc2V0Ll9tZXRhWzBdLmhpZGRlbiA9IG51bGw7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIG15Q2hhcnQudXBkYXRlKCk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICB0b2dnbGVPZmY6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIG15Q2hhcnQuZGF0YS5kYXRhc2V0cy5mb3JFYWNoKGZ1bmN0aW9uIChkYXRhc2V0KSB7XG4gICAgICAgICAgICAgIGRhdGFzZXQuaGlkZGVuID0gdHJ1ZTtcbiAgICAgICAgICAgICAgZGF0YXNldC5fbWV0YVswXS5oaWRkZW4gPSBudWxsO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBteUNoYXJ0LnVwZGF0ZSgpO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgdG9nZ2xlTGVnZW5kOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2aWV3TW9kZWwuc2hvd0xlZ2VuZCghdmlld01vZGVsLnNob3dMZWdlbmQoKSk7XG4gICAgICAgICAgICBteUNoYXJ0Lm9wdGlvbnMubGVnZW5kLmRpc3BsYXkgPSB2aWV3TW9kZWwuc2hvd0xlZ2VuZCgpO1xuICAgICAgICAgICAgbXlDaGFydC51cGRhdGUoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHZpZXdNb2RlbC5zZWxlY3RlZFguc3Vic2NyaWJlKGZ1bmN0aW9uIChuZXdWYWx1ZSkge1xuICAgICAgICAgIHVwZGF0ZVF1ZXJ5U3RyaW5nUGFyYW0oXCJ4XCIsIG5ld1ZhbHVlKTtcbiAgICAgICAgICB1cGRhdGUoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICB2aWV3TW9kZWwuc2VsZWN0ZWRMZXZlbC5zdWJzY3JpYmUoZnVuY3Rpb24gKG5ld1ZhbHVlKSB7XG4gICAgICAgICAgdXBkYXRlUXVlcnlTdHJpbmdQYXJhbShcImxldmVsXCIsIG5ld1ZhbHVlKTtcbiAgICAgICAgICB1cGRhdGUoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICB2aWV3TW9kZWwuc2VsZWN0ZWRZLnN1YnNjcmliZShmdW5jdGlvbiAobmV3VmFsdWUpIHtcbiAgICAgICAgICB1cGRhdGVRdWVyeVN0cmluZ1BhcmFtKFwieVwiLCBuZXdWYWx1ZSk7XG4gICAgICAgICAgdXBkYXRlKCk7XG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgdmlld01vZGVsLnNlbGVjdGVkWChxdWVyeV9zdHJpbmdbJ3gnXSB8fCAnZWhwJyk7XG4gICAgICAgIHZpZXdNb2RlbC5zZWxlY3RlZFkocXVlcnlfc3RyaW5nWyd5J10gfHwgJ2RwcycpO1xuICAgICAgICB2aWV3TW9kZWwuc2VsZWN0ZWRMZXZlbChxdWVyeV9zdHJpbmdbJ2xldmVsJ10gfHwgMSk7XG4gICAgICAgIGluaXQoKTtcbiAgICAgICAgXG4gICAgICAgIGZ1bmN0aW9uIGluaXQoKSB7XG4gICAgICAgICAgaWYgKCF2aWV3TW9kZWwuc2VsZWN0ZWRYKCkgfHwgIXZpZXdNb2RlbC5zZWxlY3RlZFkoKSkgcmV0dXJuO1xuICAgICAgICAgIGRhdGEuZGF0YXNldHMubGVuZ3RoID0gMDtcbiAgICAgICAgICBoZXJvZXMuZm9yRWFjaChmdW5jdGlvbiAoaGVybykge1xuICAgICAgICAgICAgdmFyIGhEYXRhID0gaGVyb2RhdGFbJ25wY19kb3RhX2hlcm9fJyArIGhlcm9dO1xuICAgICAgICAgICAgdmFyIGRhdGFzZXQgPSBuZXcgRGF0YVNldChoRGF0YS5kaXNwbGF5bmFtZSk7XG4gICAgICAgICAgICB2YXIgcHQgPSBnZXRQb2ludChoZXJvKTtcbiAgICAgICAgICAgIGRhdGFzZXQuX2hlcm9JZCA9IGhlcm87XG4gICAgICAgICAgICBkYXRhc2V0LmRhdGEucHVzaChwdCk7XG4gICAgICAgICAgICBkYXRhc2V0LnBvaW50U3R5bGUucHVzaChpY29uc1toZXJvXSk7XG4gICAgICAgICAgICAvL2RhdGFzZXQucG9pbnRTdHlsZS5wdXNoKCdyZWN0Jyk7XG4gICAgICAgICAgICBkYXRhLmRhdGFzZXRzLnB1c2goZGF0YXNldCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgZGF0YS5kYXRhc2V0cy5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgICAgICBpZiAoYS5sYWJlbCA8IGIubGFiZWwpIHJldHVybiAtMTtcbiAgICAgICAgICAgIGlmIChhLmxhYmVsID4gYi5sYWJlbCkgcmV0dXJuIDE7XG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBzZXRDaGFydExhYmVscygpXG4gICAgICAgICAgbXlDaGFydC51cGRhdGUoKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgZnVuY3Rpb24gdXBkYXRlKCkge1xuICAgICAgICAgIGlmICghdmlld01vZGVsLnNlbGVjdGVkWCgpIHx8ICF2aWV3TW9kZWwuc2VsZWN0ZWRZKCkpIHJldHVybjtcbiAgICAgICAgICBteUNoYXJ0LmRhdGEuZGF0YXNldHMuZm9yRWFjaChmdW5jdGlvbiAoZGF0YXNldCkge1xuICAgICAgICAgICAgdmFyIGhlcm8gPSBkYXRhc2V0Ll9oZXJvSWQ7XG4gICAgICAgICAgICB2YXIgcHQgPSBnZXRQb2ludChoZXJvKTtcbiAgICAgICAgICAgIGRhdGFzZXQuZGF0YS5sZW5ndGggPSAwO1xuICAgICAgICAgICAgZGF0YXNldC5kYXRhLnB1c2gocHQpO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHNldENoYXJ0TGFiZWxzKClcbiAgICAgICAgICBteUNoYXJ0LnVwZGF0ZSgpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBmdW5jdGlvbiBzZXRDaGFydExhYmVscygpIHtcbiAgICAgICAgICB2YXIgbGFiZWxYID0gYXR0cmlidXRlT3B0aW9ucy5maWx0ZXIoZnVuY3Rpb24gKGEpIHsgcmV0dXJuIGEuaWQgPT0gdmlld01vZGVsLnNlbGVjdGVkWCgpOyB9KVswXS5uYW1lO1xuICAgICAgICAgIHZhciBsYWJlbFkgPSBhdHRyaWJ1dGVPcHRpb25zLmZpbHRlcihmdW5jdGlvbiAoYSkgeyByZXR1cm4gYS5pZCA9PSB2aWV3TW9kZWwuc2VsZWN0ZWRZKCk7IH0pWzBdLm5hbWU7XG4gICAgICAgICAgdmFyIGxhYmVsID0gbGFiZWxZICsgJyB2cy4gJyArIGxhYmVsWDtcbiAgICAgICAgICBteUNoYXJ0Lm9wdGlvbnMuc2NhbGVzLnlBeGVzWzBdLnNjYWxlTGFiZWwubGFiZWxTdHJpbmcgPSBsYWJlbFk7XG4gICAgICAgICAgbXlDaGFydC5vcHRpb25zLnNjYWxlcy54QXhlc1swXS5zY2FsZUxhYmVsLmxhYmVsU3RyaW5nID0gbGFiZWxYO1xuICAgICAgICAgICQoJyNjaGFydC10aXRsZScpLnRleHQobGFiZWwpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBmdW5jdGlvbiBnZXRQb2ludChoZXJvKSB7XG4gICAgICAgICAgdmFyIGhEYXRhID0gaGVyb2RhdGFbJ25wY19kb3RhX2hlcm9fJyArIGhlcm9dO1xuICAgICAgICAgIGlmIChhdHRyaWJ1dGVNb2RpZmllcnMuaGFzT3duUHJvcGVydHkodmlld01vZGVsLnNlbGVjdGVkWCgpKSkge1xuICAgICAgICAgICAgdmFyIHggPSBwYXJzZUZsb2F0KGF0dHJpYnV0ZU1vZGlmaWVyc1t2aWV3TW9kZWwuc2VsZWN0ZWRYKCldLmNhbGwoaERhdGEsIHZpZXdNb2RlbC5zZWxlY3RlZExldmVsKCkpLnRvRml4ZWQoNCkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHZhciB4ID0gcGFyc2VGbG9hdChoRGF0YVt2aWV3TW9kZWwuc2VsZWN0ZWRYKCldLnRvRml4ZWQoNCkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoYXR0cmlidXRlTW9kaWZpZXJzLmhhc093blByb3BlcnR5KHZpZXdNb2RlbC5zZWxlY3RlZFkoKSkpIHtcbiAgICAgICAgICAgIHZhciB5ID0gcGFyc2VGbG9hdChhdHRyaWJ1dGVNb2RpZmllcnNbdmlld01vZGVsLnNlbGVjdGVkWSgpXS5jYWxsKGhEYXRhLCB2aWV3TW9kZWwuc2VsZWN0ZWRMZXZlbCgpKS50b0ZpeGVkKDQpKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB2YXIgeSA9IHBhcnNlRmxvYXQoaERhdGFbdmlld01vZGVsLnNlbGVjdGVkWSgpXS50b0ZpeGVkKDQpKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHt4OiB4LCB5OiB5fTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAga28uYXBwbHlCaW5kaW5ncyh2aWV3TW9kZWwpO1xuICAgICAgfVxuICAgIH0pO1xuICB9KTtcbn0pOyIsInZhciBxdWVyeV9zdHJpbmcgPSAoZnVuY3Rpb24oYSkge1xuICAgIGlmIChhID09IFwiXCIpIHJldHVybiB7fTtcbiAgICB2YXIgYiA9IHt9O1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYS5sZW5ndGg7ICsraSlcbiAgICB7XG4gICAgICAgIHZhciBwPWFbaV0uc3BsaXQoJz0nLCAyKTtcbiAgICAgICAgaWYgKHAubGVuZ3RoID09IDEpXG4gICAgICAgICAgICBiW3BbMF1dID0gXCJcIjtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgYltwWzBdXSA9IGRlY29kZVVSSUNvbXBvbmVudChwWzFdLnJlcGxhY2UoL1xcKy9nLCBcIiBcIikpO1xuICAgIH1cbiAgICByZXR1cm4gYjtcbn0pKHdpbmRvdy5sb2NhdGlvbi5zZWFyY2guc3Vic3RyKDEpLnNwbGl0KCcmJykpO1xuXG4vLyBFeHBsaWNpdGx5IHNhdmUvdXBkYXRlIGEgdXJsIHBhcmFtZXRlciB1c2luZyBIVE1MNSdzIHJlcGxhY2VTdGF0ZSgpLlxuZnVuY3Rpb24gdXBkYXRlUXVlcnlTdHJpbmdQYXJhbShrZXksIHZhbHVlKSB7XG4gIGJhc2VVcmwgPSBbbG9jYXRpb24ucHJvdG9jb2wsICcvLycsIGxvY2F0aW9uLmhvc3QsIGxvY2F0aW9uLnBhdGhuYW1lXS5qb2luKCcnKTtcbiAgdXJsUXVlcnlTdHJpbmcgPSBkb2N1bWVudC5sb2NhdGlvbi5zZWFyY2g7XG4gIHZhciBuZXdQYXJhbSA9IGtleSArICc9JyArIHZhbHVlLFxuICBwYXJhbXMgPSAnPycgKyBuZXdQYXJhbTtcblxuICAvLyBJZiB0aGUgXCJzZWFyY2hcIiBzdHJpbmcgZXhpc3RzLCB0aGVuIGJ1aWxkIHBhcmFtcyBmcm9tIGl0XG4gIGlmICh1cmxRdWVyeVN0cmluZykge1xuICAgIGtleVJlZ2V4ID0gbmV3IFJlZ0V4cCgnKFtcXD8mXSknICsga2V5ICsgJ1teJl0qJyk7XG4gICAgLy8gSWYgcGFyYW0gZXhpc3RzIGFscmVhZHksIHVwZGF0ZSBpdFxuICAgIGlmICh1cmxRdWVyeVN0cmluZy5tYXRjaChrZXlSZWdleCkgIT09IG51bGwpIHtcbiAgICAgIHBhcmFtcyA9IHVybFF1ZXJ5U3RyaW5nLnJlcGxhY2Uoa2V5UmVnZXgsIFwiJDFcIiArIG5ld1BhcmFtKTtcbiAgICB9IGVsc2UgeyAvLyBPdGhlcndpc2UsIGFkZCBpdCB0byBlbmQgb2YgcXVlcnkgc3RyaW5nXG4gICAgICBwYXJhbXMgPSB1cmxRdWVyeVN0cmluZyArICcmJyArIG5ld1BhcmFtO1xuICAgIH1cbiAgfVxuICB3aW5kb3cuaGlzdG9yeS5yZXBsYWNlU3RhdGUoe30sIFwiXCIsIGJhc2VVcmwgKyBwYXJhbXMpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBxdWVyeV9zdHJpbmc6IHF1ZXJ5X3N0cmluZyxcbiAgICB1cGRhdGVRdWVyeVN0cmluZ1BhcmFtOiB1cGRhdGVRdWVyeVN0cmluZ1BhcmFtXG59OyJdfQ==
