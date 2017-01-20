var $ = require('jquery');
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
        img.src = 'http://dev.devilesk.com/media/images/miniheroes/' + hero + '.png';
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