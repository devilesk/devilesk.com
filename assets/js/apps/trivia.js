require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({35:[function(require,module,exports){
var $ = jQuery = require('jquery');
require('bootstrap');
var shuffle = require('../util/shuffle');

function TriviaCore() {
    var self = this;
    this.answers = [0, 1, 2, 3, 4];
    this.answer = 0;
    this.streak = 0;
    this.longeststreak = 0;
    this.items = [];
    this.shuffle = shuffle;
    this.getAnswer = function (item) {}
    this.generateQuestion = function () {
        var items_shuffled = this.shuffle(this.items.slice(0));
        var answers_shuffled = this.shuffle(this.answers.slice(0));
        this.answer = this.getAnswer(items_shuffled[0]);
        this.buildQuestion(items_shuffled, answers_shuffled);
    }
    this.buildQuestion = function (items_shuffled, answers_shuffled) {}
    this.onCorrectAnswer = function () {
        this.streak += 1;
        $('#ans_msg').html('<h3><span class=\"label label-success\">Correct!</span></h3>');
        this.generateQuestion();
    }
    this.onWrongAnswer = function () {
        $('#ans_msg').html('<h3><span class=\"label label-danger\">Wrong!</span></h3>');
        this.streak = 0;
    }
    this.onStreakUpdate = function () {
        this.longeststreak = this.streak;
        $('#longeststreak').text('Longest Streak: ' + this.longeststreak);
    }
    this.onClickEnd = function (e) {
        $('#ans_msg').stop(false, true, true);
        $('#ans_msg').show();
        $('#ans_msg').fadeOut(2000);
        $('#streak').text('Current Streak: ' + this.streak);
        e.preventDefault();
        e.stopImmediatePropagation()
        $(this).blur();
    }
    this.init = function (btns) {
        btns.click(function (e) {
            if ($(this).text() == self.answer) {
                self.onCorrectAnswer();
            } else {
                self.onWrongAnswer();
            }
            if (self.streak > self.longeststreak) {
                self.onStreakUpdate();
            }
            self.onClickEnd(e);
        });
        self.generateQuestion();
    }
}

var herodata, items, itemdata;

var triviaModules = {
    'ability-name': require('./trivia/ability-name'),
    'hero-name': require('./trivia/hero-name'),
    'item-name': require('./trivia/item-name'),
    'item-cost': require('./trivia/item-cost')
}

$.when(
    $.getJSON("/media/dota-json/herodata.json", function (data) {
        herodata = data;
    }),
    $.getJSON("/media/dota-json/items.json", function (data) {
        items = data;
    }),
    $.getJSON("/media/dota-json/itemdata.json", function (data) {
        itemdata = data;
    })
).then(function () {
    var triviaModule;
    var keys = Object.keys(triviaModules);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if ($('.' + key).length) {
            triviaModule = new triviaModules[key](herodata, items, itemdata);
            break;
        }
    }

    var trivia = new TriviaCore();
    trivia.items = triviaModule.items;
    trivia.getAnswer = triviaModule.getAnswer;
    trivia.buildQuestion = triviaModule.buildQuestion;
    
    trivia.init($('.btn'));
});
},{"../util/shuffle":54,"./trivia/ability-name":36,"./trivia/hero-name":37,"./trivia/item-cost":38,"./trivia/item-name":39,"bootstrap":1,"jquery":25}],39:[function(require,module,exports){
var $ = require('jquery');

function TriviaModule(herodata, itemlistdata, itemdata) {
    this.items = Object.keys(itemlistdata.data);
    this.getAnswer = function(item) {
        return itemlistdata.data[item];
    }
    this.buildQuestion = function(items_shuffled, answers_shuffled) {
        $('#item').attr('src', 'http://cdn.dota2.com/apps/dota2/images/items/' + items_shuffled[0] + '_lg.png');
        for (var i = 0; i < answers_shuffled.length; i++) {
            $('#answer_' + answers_shuffled[i]).html(itemlistdata.data[items_shuffled[i]]).blur();
        }
    }
}

module.exports = TriviaModule;
},{"jquery":25}],38:[function(require,module,exports){
var $ = require('jquery');

function TriviaModule(herodata, itemlistdata, itemdata) {
    var data = {};
    var itemlist = Object.keys(itemlistdata.data);
    var items = itemlist.map(function(item) {
        return 'item_' + item;
    });
    itemlist.forEach(function(item) {
        var itemRecipe = 'item_recipe_' + item;
        if (itemdata[itemRecipe] && itemdata[itemRecipe].itemcost) {
            items.push(itemRecipe);
        }
    });
    for (var i = 0; i < items.length; i++) {
        data[items[i]] = {
            cost: itemdata[items[i]].itemcost,
            name: itemdata[items[i]].ItemRecipe ? itemdata[itemdata[items[i]].ItemResult].displayname + ' Recipe' : itemdata[items[i]].displayname
        }
    }

    this.items = items;
    this.getAnswer = function(item) {
        return data[item].cost;
    }
    this.buildQuestion = function(items_shuffled, answers_shuffled) {
        $('#item').attr('src', 'http://cdn.dota2.com/apps/dota2/images/items/' + items_shuffled[0].replace('item_', '') + '_lg.png');
        $('#item-name').html(data[items_shuffled[0]].name);
        for (var i = 0; i < answers_shuffled.length; i++) {
            $('#answer_' + answers_shuffled[i]).html(data[items_shuffled[i]].cost).blur();
        }
    }
}

module.exports = TriviaModule;
},{"jquery":25}],37:[function(require,module,exports){
var $ = require('jquery');

function TriviaModule(herodata, itemlistdata, itemdata) {
    var self = this;
    this.items = Object.keys(herodata);
    this.getAnswer = function(item) {
        return herodata[item].displayname;
    }
    this.buildQuestion = function(items_shuffled, answers_shuffled) {
        $('#item').attr('src', 'http://cdn.dota2.com/apps/dota2/images/heroes/' + items_shuffled[0].replace('npc_dota_hero_', '') + '_full.png');
        for (var i = 0; i < answers_shuffled.length; i++) {
            $('#answer_' + answers_shuffled[i]).html(self.getAnswer(items_shuffled[i])).blur();
        }
    }
}

module.exports = TriviaModule;
},{"jquery":25}],36:[function(require,module,exports){
var $ = require('jquery');

function TriviaModule(herodata, itemlistdata, itemdata) {
    var self = this;
    var ability = [],
        abilitydata = {},
        ability_include = ["invoker_cold_snap", "invoker_ghost_walk", "invoker_tornado", "invoker_emp", "invoker_alacrity", "invoker_chaos_meteor", "invoker_sun_strike", "invoker_forge_spirit", "invoker_ice_wall", "invoker_deafening_blast", "keeper_of_the_light_recall", "keeper_of_the_light_blinding_light", "lone_druid_true_form_battle_cry"];

    for (h in herodata) {
        var abilities = herodata[h].abilities.map(function(a) {
            return a.name;
        });
        for (var i = 0; i < abilities.length; i++) {
            var a = herodata[h].abilities.filter(function(item) {
                return item.name == abilities[i];
            })[0];
            if (a.name != "attribute_bonus" && a.displayname && a.displayname != '' && a.displayname != 'Empty') {
                if (!(abilities[i] in abilitydata)) {
                    if ((a.behavior.indexOf("DOTA_ABILITY_BEHAVIOR_NOT_LEARNABLE") == -1 && a.behavior.indexOf("DOTA_ABILITY_BEHAVIOR_HIDDEN") == -1) ||
                        (ability_include.indexOf(a.name) != -1)) {
                        ability.push(a.name);
                        abilitydata[a.name] = a;
                    }
                }
            }
        }
    }

    this.items = ability;
    this.getAnswer = function(item) {
        return abilitydata[item].displayname;
    }
    this.buildQuestion = function(items_shuffled, answers_shuffled) {
        $('#item').attr('src', 'http://cdn.dota2.com/apps/dota2/images/abilities/' + items_shuffled[0] + '_hp1.png');
        for (var i = 0; i < answers_shuffled.length; i++) {
            $('#answer_' + answers_shuffled[i]).html(self.getAnswer(items_shuffled[i])).blur();
        }
    }
}

module.exports = TriviaModule;
},{"jquery":25}]},{},[35])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYXBwcy90cml2aWEuanMiLCJzcmMvanMvYXBwcy90cml2aWEvaXRlbS1uYW1lLmpzIiwic3JjL2pzL2FwcHMvdHJpdmlhL2l0ZW0tY29zdC5qcyIsInNyYy9qcy9hcHBzL3RyaXZpYS9oZXJvLW5hbWUuanMiLCJzcmMvanMvYXBwcy90cml2aWEvYWJpbGl0eS1uYW1lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgJCA9IGpRdWVyeSA9IHJlcXVpcmUoJ2pxdWVyeScpO1xucmVxdWlyZSgnYm9vdHN0cmFwJyk7XG52YXIgc2h1ZmZsZSA9IHJlcXVpcmUoJy4uL3V0aWwvc2h1ZmZsZScpO1xuXG5mdW5jdGlvbiBUcml2aWFDb3JlKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB0aGlzLmFuc3dlcnMgPSBbMCwgMSwgMiwgMywgNF07XG4gICAgdGhpcy5hbnN3ZXIgPSAwO1xuICAgIHRoaXMuc3RyZWFrID0gMDtcbiAgICB0aGlzLmxvbmdlc3RzdHJlYWsgPSAwO1xuICAgIHRoaXMuaXRlbXMgPSBbXTtcbiAgICB0aGlzLnNodWZmbGUgPSBzaHVmZmxlO1xuICAgIHRoaXMuZ2V0QW5zd2VyID0gZnVuY3Rpb24gKGl0ZW0pIHt9XG4gICAgdGhpcy5nZW5lcmF0ZVF1ZXN0aW9uID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgaXRlbXNfc2h1ZmZsZWQgPSB0aGlzLnNodWZmbGUodGhpcy5pdGVtcy5zbGljZSgwKSk7XG4gICAgICAgIHZhciBhbnN3ZXJzX3NodWZmbGVkID0gdGhpcy5zaHVmZmxlKHRoaXMuYW5zd2Vycy5zbGljZSgwKSk7XG4gICAgICAgIHRoaXMuYW5zd2VyID0gdGhpcy5nZXRBbnN3ZXIoaXRlbXNfc2h1ZmZsZWRbMF0pO1xuICAgICAgICB0aGlzLmJ1aWxkUXVlc3Rpb24oaXRlbXNfc2h1ZmZsZWQsIGFuc3dlcnNfc2h1ZmZsZWQpO1xuICAgIH1cbiAgICB0aGlzLmJ1aWxkUXVlc3Rpb24gPSBmdW5jdGlvbiAoaXRlbXNfc2h1ZmZsZWQsIGFuc3dlcnNfc2h1ZmZsZWQpIHt9XG4gICAgdGhpcy5vbkNvcnJlY3RBbnN3ZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuc3RyZWFrICs9IDE7XG4gICAgICAgICQoJyNhbnNfbXNnJykuaHRtbCgnPGgzPjxzcGFuIGNsYXNzPVxcXCJsYWJlbCBsYWJlbC1zdWNjZXNzXFxcIj5Db3JyZWN0ITwvc3Bhbj48L2gzPicpO1xuICAgICAgICB0aGlzLmdlbmVyYXRlUXVlc3Rpb24oKTtcbiAgICB9XG4gICAgdGhpcy5vbldyb25nQW5zd2VyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAkKCcjYW5zX21zZycpLmh0bWwoJzxoMz48c3BhbiBjbGFzcz1cXFwibGFiZWwgbGFiZWwtZGFuZ2VyXFxcIj5Xcm9uZyE8L3NwYW4+PC9oMz4nKTtcbiAgICAgICAgdGhpcy5zdHJlYWsgPSAwO1xuICAgIH1cbiAgICB0aGlzLm9uU3RyZWFrVXBkYXRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmxvbmdlc3RzdHJlYWsgPSB0aGlzLnN0cmVhaztcbiAgICAgICAgJCgnI2xvbmdlc3RzdHJlYWsnKS50ZXh0KCdMb25nZXN0IFN0cmVhazogJyArIHRoaXMubG9uZ2VzdHN0cmVhayk7XG4gICAgfVxuICAgIHRoaXMub25DbGlja0VuZCA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICQoJyNhbnNfbXNnJykuc3RvcChmYWxzZSwgdHJ1ZSwgdHJ1ZSk7XG4gICAgICAgICQoJyNhbnNfbXNnJykuc2hvdygpO1xuICAgICAgICAkKCcjYW5zX21zZycpLmZhZGVPdXQoMjAwMCk7XG4gICAgICAgICQoJyNzdHJlYWsnKS50ZXh0KCdDdXJyZW50IFN0cmVhazogJyArIHRoaXMuc3RyZWFrKTtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpXG4gICAgICAgICQodGhpcykuYmx1cigpO1xuICAgIH1cbiAgICB0aGlzLmluaXQgPSBmdW5jdGlvbiAoYnRucykge1xuICAgICAgICBidG5zLmNsaWNrKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBpZiAoJCh0aGlzKS50ZXh0KCkgPT0gc2VsZi5hbnN3ZXIpIHtcbiAgICAgICAgICAgICAgICBzZWxmLm9uQ29ycmVjdEFuc3dlcigpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzZWxmLm9uV3JvbmdBbnN3ZXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChzZWxmLnN0cmVhayA+IHNlbGYubG9uZ2VzdHN0cmVhaykge1xuICAgICAgICAgICAgICAgIHNlbGYub25TdHJlYWtVcGRhdGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNlbGYub25DbGlja0VuZChlKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHNlbGYuZ2VuZXJhdGVRdWVzdGlvbigpO1xuICAgIH1cbn1cblxudmFyIGhlcm9kYXRhLCBpdGVtcywgaXRlbWRhdGE7XG5cbnZhciB0cml2aWFNb2R1bGVzID0ge1xuICAgICdhYmlsaXR5LW5hbWUnOiByZXF1aXJlKCcuL3RyaXZpYS9hYmlsaXR5LW5hbWUnKSxcbiAgICAnaGVyby1uYW1lJzogcmVxdWlyZSgnLi90cml2aWEvaGVyby1uYW1lJyksXG4gICAgJ2l0ZW0tbmFtZSc6IHJlcXVpcmUoJy4vdHJpdmlhL2l0ZW0tbmFtZScpLFxuICAgICdpdGVtLWNvc3QnOiByZXF1aXJlKCcuL3RyaXZpYS9pdGVtLWNvc3QnKVxufVxuXG4kLndoZW4oXG4gICAgJC5nZXRKU09OKFwiL21lZGlhL2RvdGEtanNvbi9oZXJvZGF0YS5qc29uXCIsIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgIGhlcm9kYXRhID0gZGF0YTtcbiAgICB9KSxcbiAgICAkLmdldEpTT04oXCIvbWVkaWEvZG90YS1qc29uL2l0ZW1zLmpzb25cIiwgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgaXRlbXMgPSBkYXRhO1xuICAgIH0pLFxuICAgICQuZ2V0SlNPTihcIi9tZWRpYS9kb3RhLWpzb24vaXRlbWRhdGEuanNvblwiLCBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICBpdGVtZGF0YSA9IGRhdGE7XG4gICAgfSlcbikudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHRyaXZpYU1vZHVsZTtcbiAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHRyaXZpYU1vZHVsZXMpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIga2V5ID0ga2V5c1tpXTtcbiAgICAgICAgaWYgKCQoJy4nICsga2V5KS5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRyaXZpYU1vZHVsZSA9IG5ldyB0cml2aWFNb2R1bGVzW2tleV0oaGVyb2RhdGEsIGl0ZW1zLCBpdGVtZGF0YSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHZhciB0cml2aWEgPSBuZXcgVHJpdmlhQ29yZSgpO1xuICAgIHRyaXZpYS5pdGVtcyA9IHRyaXZpYU1vZHVsZS5pdGVtcztcbiAgICB0cml2aWEuZ2V0QW5zd2VyID0gdHJpdmlhTW9kdWxlLmdldEFuc3dlcjtcbiAgICB0cml2aWEuYnVpbGRRdWVzdGlvbiA9IHRyaXZpYU1vZHVsZS5idWlsZFF1ZXN0aW9uO1xuICAgIFxuICAgIHRyaXZpYS5pbml0KCQoJy5idG4nKSk7XG59KTsiLCJ2YXIgJCA9IHJlcXVpcmUoJ2pxdWVyeScpO1xuXG5mdW5jdGlvbiBUcml2aWFNb2R1bGUoaGVyb2RhdGEsIGl0ZW1saXN0ZGF0YSwgaXRlbWRhdGEpIHtcbiAgICB0aGlzLml0ZW1zID0gT2JqZWN0LmtleXMoaXRlbWxpc3RkYXRhLmRhdGEpO1xuICAgIHRoaXMuZ2V0QW5zd2VyID0gZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICByZXR1cm4gaXRlbWxpc3RkYXRhLmRhdGFbaXRlbV07XG4gICAgfVxuICAgIHRoaXMuYnVpbGRRdWVzdGlvbiA9IGZ1bmN0aW9uKGl0ZW1zX3NodWZmbGVkLCBhbnN3ZXJzX3NodWZmbGVkKSB7XG4gICAgICAgICQoJyNpdGVtJykuYXR0cignc3JjJywgJ2h0dHA6Ly9jZG4uZG90YTIuY29tL2FwcHMvZG90YTIvaW1hZ2VzL2l0ZW1zLycgKyBpdGVtc19zaHVmZmxlZFswXSArICdfbGcucG5nJyk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYW5zd2Vyc19zaHVmZmxlZC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgJCgnI2Fuc3dlcl8nICsgYW5zd2Vyc19zaHVmZmxlZFtpXSkuaHRtbChpdGVtbGlzdGRhdGEuZGF0YVtpdGVtc19zaHVmZmxlZFtpXV0pLmJsdXIoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBUcml2aWFNb2R1bGU7IiwidmFyICQgPSByZXF1aXJlKCdqcXVlcnknKTtcblxuZnVuY3Rpb24gVHJpdmlhTW9kdWxlKGhlcm9kYXRhLCBpdGVtbGlzdGRhdGEsIGl0ZW1kYXRhKSB7XG4gICAgdmFyIGRhdGEgPSB7fTtcbiAgICB2YXIgaXRlbWxpc3QgPSBPYmplY3Qua2V5cyhpdGVtbGlzdGRhdGEuZGF0YSk7XG4gICAgdmFyIGl0ZW1zID0gaXRlbWxpc3QubWFwKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgcmV0dXJuICdpdGVtXycgKyBpdGVtO1xuICAgIH0pO1xuICAgIGl0ZW1saXN0LmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICB2YXIgaXRlbVJlY2lwZSA9ICdpdGVtX3JlY2lwZV8nICsgaXRlbTtcbiAgICAgICAgaWYgKGl0ZW1kYXRhW2l0ZW1SZWNpcGVdICYmIGl0ZW1kYXRhW2l0ZW1SZWNpcGVdLml0ZW1jb3N0KSB7XG4gICAgICAgICAgICBpdGVtcy5wdXNoKGl0ZW1SZWNpcGUpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpdGVtcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBkYXRhW2l0ZW1zW2ldXSA9IHtcbiAgICAgICAgICAgIGNvc3Q6IGl0ZW1kYXRhW2l0ZW1zW2ldXS5pdGVtY29zdCxcbiAgICAgICAgICAgIG5hbWU6IGl0ZW1kYXRhW2l0ZW1zW2ldXS5JdGVtUmVjaXBlID8gaXRlbWRhdGFbaXRlbWRhdGFbaXRlbXNbaV1dLkl0ZW1SZXN1bHRdLmRpc3BsYXluYW1lICsgJyBSZWNpcGUnIDogaXRlbWRhdGFbaXRlbXNbaV1dLmRpc3BsYXluYW1lXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLml0ZW1zID0gaXRlbXM7XG4gICAgdGhpcy5nZXRBbnN3ZXIgPSBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgIHJldHVybiBkYXRhW2l0ZW1dLmNvc3Q7XG4gICAgfVxuICAgIHRoaXMuYnVpbGRRdWVzdGlvbiA9IGZ1bmN0aW9uKGl0ZW1zX3NodWZmbGVkLCBhbnN3ZXJzX3NodWZmbGVkKSB7XG4gICAgICAgICQoJyNpdGVtJykuYXR0cignc3JjJywgJ2h0dHA6Ly9jZG4uZG90YTIuY29tL2FwcHMvZG90YTIvaW1hZ2VzL2l0ZW1zLycgKyBpdGVtc19zaHVmZmxlZFswXS5yZXBsYWNlKCdpdGVtXycsICcnKSArICdfbGcucG5nJyk7XG4gICAgICAgICQoJyNpdGVtLW5hbWUnKS5odG1sKGRhdGFbaXRlbXNfc2h1ZmZsZWRbMF1dLm5hbWUpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFuc3dlcnNfc2h1ZmZsZWQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICQoJyNhbnN3ZXJfJyArIGFuc3dlcnNfc2h1ZmZsZWRbaV0pLmh0bWwoZGF0YVtpdGVtc19zaHVmZmxlZFtpXV0uY29zdCkuYmx1cigpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRyaXZpYU1vZHVsZTsiLCJ2YXIgJCA9IHJlcXVpcmUoJ2pxdWVyeScpO1xuXG5mdW5jdGlvbiBUcml2aWFNb2R1bGUoaGVyb2RhdGEsIGl0ZW1saXN0ZGF0YSwgaXRlbWRhdGEpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdGhpcy5pdGVtcyA9IE9iamVjdC5rZXlzKGhlcm9kYXRhKTtcbiAgICB0aGlzLmdldEFuc3dlciA9IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgcmV0dXJuIGhlcm9kYXRhW2l0ZW1dLmRpc3BsYXluYW1lO1xuICAgIH1cbiAgICB0aGlzLmJ1aWxkUXVlc3Rpb24gPSBmdW5jdGlvbihpdGVtc19zaHVmZmxlZCwgYW5zd2Vyc19zaHVmZmxlZCkge1xuICAgICAgICAkKCcjaXRlbScpLmF0dHIoJ3NyYycsICdodHRwOi8vY2RuLmRvdGEyLmNvbS9hcHBzL2RvdGEyL2ltYWdlcy9oZXJvZXMvJyArIGl0ZW1zX3NodWZmbGVkWzBdLnJlcGxhY2UoJ25wY19kb3RhX2hlcm9fJywgJycpICsgJ19mdWxsLnBuZycpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFuc3dlcnNfc2h1ZmZsZWQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICQoJyNhbnN3ZXJfJyArIGFuc3dlcnNfc2h1ZmZsZWRbaV0pLmh0bWwoc2VsZi5nZXRBbnN3ZXIoaXRlbXNfc2h1ZmZsZWRbaV0pKS5ibHVyKCk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gVHJpdmlhTW9kdWxlOyIsInZhciAkID0gcmVxdWlyZSgnanF1ZXJ5Jyk7XG5cbmZ1bmN0aW9uIFRyaXZpYU1vZHVsZShoZXJvZGF0YSwgaXRlbWxpc3RkYXRhLCBpdGVtZGF0YSkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgYWJpbGl0eSA9IFtdLFxuICAgICAgICBhYmlsaXR5ZGF0YSA9IHt9LFxuICAgICAgICBhYmlsaXR5X2luY2x1ZGUgPSBbXCJpbnZva2VyX2NvbGRfc25hcFwiLCBcImludm9rZXJfZ2hvc3Rfd2Fsa1wiLCBcImludm9rZXJfdG9ybmFkb1wiLCBcImludm9rZXJfZW1wXCIsIFwiaW52b2tlcl9hbGFjcml0eVwiLCBcImludm9rZXJfY2hhb3NfbWV0ZW9yXCIsIFwiaW52b2tlcl9zdW5fc3RyaWtlXCIsIFwiaW52b2tlcl9mb3JnZV9zcGlyaXRcIiwgXCJpbnZva2VyX2ljZV93YWxsXCIsIFwiaW52b2tlcl9kZWFmZW5pbmdfYmxhc3RcIiwgXCJrZWVwZXJfb2ZfdGhlX2xpZ2h0X3JlY2FsbFwiLCBcImtlZXBlcl9vZl90aGVfbGlnaHRfYmxpbmRpbmdfbGlnaHRcIiwgXCJsb25lX2RydWlkX3RydWVfZm9ybV9iYXR0bGVfY3J5XCJdO1xuXG4gICAgZm9yIChoIGluIGhlcm9kYXRhKSB7XG4gICAgICAgIHZhciBhYmlsaXRpZXMgPSBoZXJvZGF0YVtoXS5hYmlsaXRpZXMubWFwKGZ1bmN0aW9uKGEpIHtcbiAgICAgICAgICAgIHJldHVybiBhLm5hbWU7XG4gICAgICAgIH0pO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFiaWxpdGllcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIGEgPSBoZXJvZGF0YVtoXS5hYmlsaXRpZXMuZmlsdGVyKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaXRlbS5uYW1lID09IGFiaWxpdGllc1tpXTtcbiAgICAgICAgICAgIH0pWzBdO1xuICAgICAgICAgICAgaWYgKGEubmFtZSAhPSBcImF0dHJpYnV0ZV9ib251c1wiICYmIGEuZGlzcGxheW5hbWUgJiYgYS5kaXNwbGF5bmFtZSAhPSAnJyAmJiBhLmRpc3BsYXluYW1lICE9ICdFbXB0eScpIHtcbiAgICAgICAgICAgICAgICBpZiAoIShhYmlsaXRpZXNbaV0gaW4gYWJpbGl0eWRhdGEpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICgoYS5iZWhhdmlvci5pbmRleE9mKFwiRE9UQV9BQklMSVRZX0JFSEFWSU9SX05PVF9MRUFSTkFCTEVcIikgPT0gLTEgJiYgYS5iZWhhdmlvci5pbmRleE9mKFwiRE9UQV9BQklMSVRZX0JFSEFWSU9SX0hJRERFTlwiKSA9PSAtMSkgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgIChhYmlsaXR5X2luY2x1ZGUuaW5kZXhPZihhLm5hbWUpICE9IC0xKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYWJpbGl0eS5wdXNoKGEubmFtZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBhYmlsaXR5ZGF0YVthLm5hbWVdID0gYTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuaXRlbXMgPSBhYmlsaXR5O1xuICAgIHRoaXMuZ2V0QW5zd2VyID0gZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICByZXR1cm4gYWJpbGl0eWRhdGFbaXRlbV0uZGlzcGxheW5hbWU7XG4gICAgfVxuICAgIHRoaXMuYnVpbGRRdWVzdGlvbiA9IGZ1bmN0aW9uKGl0ZW1zX3NodWZmbGVkLCBhbnN3ZXJzX3NodWZmbGVkKSB7XG4gICAgICAgICQoJyNpdGVtJykuYXR0cignc3JjJywgJ2h0dHA6Ly9jZG4uZG90YTIuY29tL2FwcHMvZG90YTIvaW1hZ2VzL2FiaWxpdGllcy8nICsgaXRlbXNfc2h1ZmZsZWRbMF0gKyAnX2hwMS5wbmcnKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhbnN3ZXJzX3NodWZmbGVkLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAkKCcjYW5zd2VyXycgKyBhbnN3ZXJzX3NodWZmbGVkW2ldKS5odG1sKHNlbGYuZ2V0QW5zd2VyKGl0ZW1zX3NodWZmbGVkW2ldKSkuYmx1cigpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRyaXZpYU1vZHVsZTsiXX0=
