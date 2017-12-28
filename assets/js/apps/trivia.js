require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({23:[function(require,module,exports){
var shuffle = require('../util/shuffle');
var getJSON = require('../util/getJSON');
var fadeOut = require('../util/fadeOut');

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
        document.getElementById('ans_msg').innerHTML = '<h3><span class=\"label label-success\">Correct!</span></h3>';
        this.generateQuestion();
    }
    this.onWrongAnswer = function () {
        document.getElementById('ans_msg').innerHTML = '<h3><span class=\"label label-danger\">Wrong!</span></h3>';
        this.streak = 0;
    }
    this.onStreakUpdate = function () {
        this.longeststreak = this.streak;
        document.getElementById('longeststreak').innerHTML = 'Longest Streak: ' + this.longeststreak;
    }
    this.onClickEnd = function (event) {
        document.getElementById('ans_msg').style.display = '';
        fadeOut(document.getElementById('ans_msg'));
        document.getElementById('streak').innerHTML = 'Current Streak: ' + this.streak;
        event.preventDefault();
        event.stopImmediatePropagation()
        event.currentTarget.blur();
    }
    this.init = function (btns) {
        [].forEach.call(btns, function (element) {
            element.addEventListener('click', function (event) {
                if (element.innerHTML == self.answer) {
                    self.onCorrectAnswer();
                } else {
                    self.onWrongAnswer();
                }
                if (self.streak > self.longeststreak) {
                    self.onStreakUpdate();
                }
                self.onClickEnd(event);
            });
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

getJSON("/media/dota-json/herodata.json", function (data) {
    herodata = data;
    checkStart();
});
getJSON("/media/dota-json/items.json", function (data) {
    items = data;
    checkStart();
});
getJSON("/media/dota-json/itemdata.json", function (data) {
    itemdata = data;
    checkStart();
});

function checkStart() {
    if (herodata && items && itemdata) {
        var triviaModule;
        var keys = Object.keys(triviaModules);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            if (document.querySelector('.' + key)) {
                triviaModule = new triviaModules[key](herodata, items, itemdata);
                break;
            }
        }

        var trivia = new TriviaCore();
        trivia.items = triviaModule.items;
        trivia.getAnswer = triviaModule.getAnswer;
        trivia.buildQuestion = triviaModule.buildQuestion;
        
        trivia.init(document.querySelectorAll('.btn'));
    }
}
},{"../util/fadeOut":39,"../util/getJSON":40,"../util/shuffle":42,"./trivia/ability-name":24,"./trivia/hero-name":25,"./trivia/item-cost":26,"./trivia/item-name":27}],27:[function(require,module,exports){
function TriviaModule(herodata, itemlistdata, itemdata) {
    this.items = Object.keys(itemlistdata.data);
    this.getAnswer = function(item) {
        return itemlistdata.data[item];
    }
    this.buildQuestion = function(items_shuffled, answers_shuffled) {
        document.getElementById('item').src = '/media/images/items/' + items_shuffled[0] + '.png';
        for (var i = 0; i < answers_shuffled.length; i++) {
            var element = document.getElementById('answer_' + answers_shuffled[i]);
            element.innerHTML = itemlistdata.data[items_shuffled[i]];
            element.blur();
        }
    }
}

module.exports = TriviaModule;
},{}],26:[function(require,module,exports){
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
        document.getElementById('item').src = '/media/images/items/' + items_shuffled[0].replace('item_', '') + '.png';
        document.getElementById('item-name').innerHTML = data[items_shuffled[0]].name;
        for (var i = 0; i < answers_shuffled.length; i++) {
            var element = document.getElementById('answer_' + answers_shuffled[i]);
            element.innerHTML = data[items_shuffled[i]].cost;
            element.blur();
        }
    }
}

module.exports = TriviaModule;
},{}],25:[function(require,module,exports){
function TriviaModule(herodata, itemlistdata, itemdata) {
    var self = this;
    this.items = Object.keys(herodata);
    this.getAnswer = function(item) {
        return herodata[item].displayname;
    }
    this.buildQuestion = function(items_shuffled, answers_shuffled) {
        document.getElementById('item').src = '/media/images/heroes/' + items_shuffled[0].replace('npc_dota_hero_', '') + '.png';
        for (var i = 0; i < answers_shuffled.length; i++) {
            var element = document.getElementById('answer_' + answers_shuffled[i]);
            element.innerHTML = self.getAnswer(items_shuffled[i]);
            element.blur();
        }
    }
}

module.exports = TriviaModule;
},{}],24:[function(require,module,exports){
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
        document.getElementById('item').src = '/media/images/spellicons/' + items_shuffled[0] + '.png';
        for (var i = 0; i < answers_shuffled.length; i++) {
            var element = document.getElementById('answer_' + answers_shuffled[i]);
            element.innerHTML = self.getAnswer(items_shuffled[i]);
            element.blur();
        }
    }
}

module.exports = TriviaModule;
},{}]},{},[23])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYXBwcy90cml2aWEuanMiLCJzcmMvanMvYXBwcy90cml2aWEvaXRlbS1uYW1lLmpzIiwic3JjL2pzL2FwcHMvdHJpdmlhL2l0ZW0tY29zdC5qcyIsInNyYy9qcy9hcHBzL3RyaXZpYS9oZXJvLW5hbWUuanMiLCJzcmMvanMvYXBwcy90cml2aWEvYWJpbGl0eS1uYW1lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgc2h1ZmZsZSA9IHJlcXVpcmUoJy4uL3V0aWwvc2h1ZmZsZScpO1xudmFyIGdldEpTT04gPSByZXF1aXJlKCcuLi91dGlsL2dldEpTT04nKTtcbnZhciBmYWRlT3V0ID0gcmVxdWlyZSgnLi4vdXRpbC9mYWRlT3V0Jyk7XG5cbmZ1bmN0aW9uIFRyaXZpYUNvcmUoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHRoaXMuYW5zd2VycyA9IFswLCAxLCAyLCAzLCA0XTtcbiAgICB0aGlzLmFuc3dlciA9IDA7XG4gICAgdGhpcy5zdHJlYWsgPSAwO1xuICAgIHRoaXMubG9uZ2VzdHN0cmVhayA9IDA7XG4gICAgdGhpcy5pdGVtcyA9IFtdO1xuICAgIHRoaXMuc2h1ZmZsZSA9IHNodWZmbGU7XG4gICAgdGhpcy5nZXRBbnN3ZXIgPSBmdW5jdGlvbiAoaXRlbSkge31cbiAgICB0aGlzLmdlbmVyYXRlUXVlc3Rpb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBpdGVtc19zaHVmZmxlZCA9IHRoaXMuc2h1ZmZsZSh0aGlzLml0ZW1zLnNsaWNlKDApKTtcbiAgICAgICAgdmFyIGFuc3dlcnNfc2h1ZmZsZWQgPSB0aGlzLnNodWZmbGUodGhpcy5hbnN3ZXJzLnNsaWNlKDApKTtcbiAgICAgICAgdGhpcy5hbnN3ZXIgPSB0aGlzLmdldEFuc3dlcihpdGVtc19zaHVmZmxlZFswXSk7XG4gICAgICAgIHRoaXMuYnVpbGRRdWVzdGlvbihpdGVtc19zaHVmZmxlZCwgYW5zd2Vyc19zaHVmZmxlZCk7XG4gICAgfVxuICAgIHRoaXMuYnVpbGRRdWVzdGlvbiA9IGZ1bmN0aW9uIChpdGVtc19zaHVmZmxlZCwgYW5zd2Vyc19zaHVmZmxlZCkge31cbiAgICB0aGlzLm9uQ29ycmVjdEFuc3dlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5zdHJlYWsgKz0gMTtcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Fuc19tc2cnKS5pbm5lckhUTUwgPSAnPGgzPjxzcGFuIGNsYXNzPVxcXCJsYWJlbCBsYWJlbC1zdWNjZXNzXFxcIj5Db3JyZWN0ITwvc3Bhbj48L2gzPic7XG4gICAgICAgIHRoaXMuZ2VuZXJhdGVRdWVzdGlvbigpO1xuICAgIH1cbiAgICB0aGlzLm9uV3JvbmdBbnN3ZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhbnNfbXNnJykuaW5uZXJIVE1MID0gJzxoMz48c3BhbiBjbGFzcz1cXFwibGFiZWwgbGFiZWwtZGFuZ2VyXFxcIj5Xcm9uZyE8L3NwYW4+PC9oMz4nO1xuICAgICAgICB0aGlzLnN0cmVhayA9IDA7XG4gICAgfVxuICAgIHRoaXMub25TdHJlYWtVcGRhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMubG9uZ2VzdHN0cmVhayA9IHRoaXMuc3RyZWFrO1xuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbG9uZ2VzdHN0cmVhaycpLmlubmVySFRNTCA9ICdMb25nZXN0IFN0cmVhazogJyArIHRoaXMubG9uZ2VzdHN0cmVhaztcbiAgICB9XG4gICAgdGhpcy5vbkNsaWNrRW5kID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhbnNfbXNnJykuc3R5bGUuZGlzcGxheSA9ICcnO1xuICAgICAgICBmYWRlT3V0KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhbnNfbXNnJykpO1xuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3RyZWFrJykuaW5uZXJIVE1MID0gJ0N1cnJlbnQgU3RyZWFrOiAnICsgdGhpcy5zdHJlYWs7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGV2ZW50LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpXG4gICAgICAgIGV2ZW50LmN1cnJlbnRUYXJnZXQuYmx1cigpO1xuICAgIH1cbiAgICB0aGlzLmluaXQgPSBmdW5jdGlvbiAoYnRucykge1xuICAgICAgICBbXS5mb3JFYWNoLmNhbGwoYnRucywgZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC5pbm5lckhUTUwgPT0gc2VsZi5hbnN3ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5vbkNvcnJlY3RBbnN3ZXIoKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLm9uV3JvbmdBbnN3ZXIoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHNlbGYuc3RyZWFrID4gc2VsZi5sb25nZXN0c3RyZWFrKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYub25TdHJlYWtVcGRhdGUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc2VsZi5vbkNsaWNrRW5kKGV2ZW50KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgc2VsZi5nZW5lcmF0ZVF1ZXN0aW9uKCk7XG4gICAgfVxufVxuXG52YXIgaGVyb2RhdGEsIGl0ZW1zLCBpdGVtZGF0YTtcblxudmFyIHRyaXZpYU1vZHVsZXMgPSB7XG4gICAgJ2FiaWxpdHktbmFtZSc6IHJlcXVpcmUoJy4vdHJpdmlhL2FiaWxpdHktbmFtZScpLFxuICAgICdoZXJvLW5hbWUnOiByZXF1aXJlKCcuL3RyaXZpYS9oZXJvLW5hbWUnKSxcbiAgICAnaXRlbS1uYW1lJzogcmVxdWlyZSgnLi90cml2aWEvaXRlbS1uYW1lJyksXG4gICAgJ2l0ZW0tY29zdCc6IHJlcXVpcmUoJy4vdHJpdmlhL2l0ZW0tY29zdCcpXG59XG5cbmdldEpTT04oXCIvbWVkaWEvZG90YS1qc29uL2hlcm9kYXRhLmpzb25cIiwgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICBoZXJvZGF0YSA9IGRhdGE7XG4gICAgY2hlY2tTdGFydCgpO1xufSk7XG5nZXRKU09OKFwiL21lZGlhL2RvdGEtanNvbi9pdGVtcy5qc29uXCIsIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgaXRlbXMgPSBkYXRhO1xuICAgIGNoZWNrU3RhcnQoKTtcbn0pO1xuZ2V0SlNPTihcIi9tZWRpYS9kb3RhLWpzb24vaXRlbWRhdGEuanNvblwiLCBmdW5jdGlvbiAoZGF0YSkge1xuICAgIGl0ZW1kYXRhID0gZGF0YTtcbiAgICBjaGVja1N0YXJ0KCk7XG59KTtcblxuZnVuY3Rpb24gY2hlY2tTdGFydCgpIHtcbiAgICBpZiAoaGVyb2RhdGEgJiYgaXRlbXMgJiYgaXRlbWRhdGEpIHtcbiAgICAgICAgdmFyIHRyaXZpYU1vZHVsZTtcbiAgICAgICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyh0cml2aWFNb2R1bGVzKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIga2V5ID0ga2V5c1tpXTtcbiAgICAgICAgICAgIGlmIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuJyArIGtleSkpIHtcbiAgICAgICAgICAgICAgICB0cml2aWFNb2R1bGUgPSBuZXcgdHJpdmlhTW9kdWxlc1trZXldKGhlcm9kYXRhLCBpdGVtcywgaXRlbWRhdGEpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHRyaXZpYSA9IG5ldyBUcml2aWFDb3JlKCk7XG4gICAgICAgIHRyaXZpYS5pdGVtcyA9IHRyaXZpYU1vZHVsZS5pdGVtcztcbiAgICAgICAgdHJpdmlhLmdldEFuc3dlciA9IHRyaXZpYU1vZHVsZS5nZXRBbnN3ZXI7XG4gICAgICAgIHRyaXZpYS5idWlsZFF1ZXN0aW9uID0gdHJpdmlhTW9kdWxlLmJ1aWxkUXVlc3Rpb247XG4gICAgICAgIFxuICAgICAgICB0cml2aWEuaW5pdChkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuYnRuJykpO1xuICAgIH1cbn0iLCJmdW5jdGlvbiBUcml2aWFNb2R1bGUoaGVyb2RhdGEsIGl0ZW1saXN0ZGF0YSwgaXRlbWRhdGEpIHtcbiAgICB0aGlzLml0ZW1zID0gT2JqZWN0LmtleXMoaXRlbWxpc3RkYXRhLmRhdGEpO1xuICAgIHRoaXMuZ2V0QW5zd2VyID0gZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICByZXR1cm4gaXRlbWxpc3RkYXRhLmRhdGFbaXRlbV07XG4gICAgfVxuICAgIHRoaXMuYnVpbGRRdWVzdGlvbiA9IGZ1bmN0aW9uKGl0ZW1zX3NodWZmbGVkLCBhbnN3ZXJzX3NodWZmbGVkKSB7XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpdGVtJykuc3JjID0gJy9tZWRpYS9pbWFnZXMvaXRlbXMvJyArIGl0ZW1zX3NodWZmbGVkWzBdICsgJy5wbmcnO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFuc3dlcnNfc2h1ZmZsZWQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Fuc3dlcl8nICsgYW5zd2Vyc19zaHVmZmxlZFtpXSk7XG4gICAgICAgICAgICBlbGVtZW50LmlubmVySFRNTCA9IGl0ZW1saXN0ZGF0YS5kYXRhW2l0ZW1zX3NodWZmbGVkW2ldXTtcbiAgICAgICAgICAgIGVsZW1lbnQuYmx1cigpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRyaXZpYU1vZHVsZTsiLCJmdW5jdGlvbiBUcml2aWFNb2R1bGUoaGVyb2RhdGEsIGl0ZW1saXN0ZGF0YSwgaXRlbWRhdGEpIHtcbiAgICB2YXIgZGF0YSA9IHt9O1xuICAgIHZhciBpdGVtbGlzdCA9IE9iamVjdC5rZXlzKGl0ZW1saXN0ZGF0YS5kYXRhKTtcbiAgICB2YXIgaXRlbXMgPSBpdGVtbGlzdC5tYXAoZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICByZXR1cm4gJ2l0ZW1fJyArIGl0ZW07XG4gICAgfSk7XG4gICAgaXRlbWxpc3QuZm9yRWFjaChmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgIHZhciBpdGVtUmVjaXBlID0gJ2l0ZW1fcmVjaXBlXycgKyBpdGVtO1xuICAgICAgICBpZiAoaXRlbWRhdGFbaXRlbVJlY2lwZV0gJiYgaXRlbWRhdGFbaXRlbVJlY2lwZV0uaXRlbWNvc3QpIHtcbiAgICAgICAgICAgIGl0ZW1zLnB1c2goaXRlbVJlY2lwZSk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGl0ZW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGRhdGFbaXRlbXNbaV1dID0ge1xuICAgICAgICAgICAgY29zdDogaXRlbWRhdGFbaXRlbXNbaV1dLml0ZW1jb3N0LFxuICAgICAgICAgICAgbmFtZTogaXRlbWRhdGFbaXRlbXNbaV1dLkl0ZW1SZWNpcGUgPyBpdGVtZGF0YVtpdGVtZGF0YVtpdGVtc1tpXV0uSXRlbVJlc3VsdF0uZGlzcGxheW5hbWUgKyAnIFJlY2lwZScgOiBpdGVtZGF0YVtpdGVtc1tpXV0uZGlzcGxheW5hbWVcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuaXRlbXMgPSBpdGVtcztcbiAgICB0aGlzLmdldEFuc3dlciA9IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgcmV0dXJuIGRhdGFbaXRlbV0uY29zdDtcbiAgICB9XG4gICAgdGhpcy5idWlsZFF1ZXN0aW9uID0gZnVuY3Rpb24oaXRlbXNfc2h1ZmZsZWQsIGFuc3dlcnNfc2h1ZmZsZWQpIHtcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2l0ZW0nKS5zcmMgPSAnL21lZGlhL2ltYWdlcy9pdGVtcy8nICsgaXRlbXNfc2h1ZmZsZWRbMF0ucmVwbGFjZSgnaXRlbV8nLCAnJykgKyAnLnBuZyc7XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpdGVtLW5hbWUnKS5pbm5lckhUTUwgPSBkYXRhW2l0ZW1zX3NodWZmbGVkWzBdXS5uYW1lO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFuc3dlcnNfc2h1ZmZsZWQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Fuc3dlcl8nICsgYW5zd2Vyc19zaHVmZmxlZFtpXSk7XG4gICAgICAgICAgICBlbGVtZW50LmlubmVySFRNTCA9IGRhdGFbaXRlbXNfc2h1ZmZsZWRbaV1dLmNvc3Q7XG4gICAgICAgICAgICBlbGVtZW50LmJsdXIoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBUcml2aWFNb2R1bGU7IiwiZnVuY3Rpb24gVHJpdmlhTW9kdWxlKGhlcm9kYXRhLCBpdGVtbGlzdGRhdGEsIGl0ZW1kYXRhKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHRoaXMuaXRlbXMgPSBPYmplY3Qua2V5cyhoZXJvZGF0YSk7XG4gICAgdGhpcy5nZXRBbnN3ZXIgPSBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgIHJldHVybiBoZXJvZGF0YVtpdGVtXS5kaXNwbGF5bmFtZTtcbiAgICB9XG4gICAgdGhpcy5idWlsZFF1ZXN0aW9uID0gZnVuY3Rpb24oaXRlbXNfc2h1ZmZsZWQsIGFuc3dlcnNfc2h1ZmZsZWQpIHtcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2l0ZW0nKS5zcmMgPSAnL21lZGlhL2ltYWdlcy9oZXJvZXMvJyArIGl0ZW1zX3NodWZmbGVkWzBdLnJlcGxhY2UoJ25wY19kb3RhX2hlcm9fJywgJycpICsgJy5wbmcnO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFuc3dlcnNfc2h1ZmZsZWQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Fuc3dlcl8nICsgYW5zd2Vyc19zaHVmZmxlZFtpXSk7XG4gICAgICAgICAgICBlbGVtZW50LmlubmVySFRNTCA9IHNlbGYuZ2V0QW5zd2VyKGl0ZW1zX3NodWZmbGVkW2ldKTtcbiAgICAgICAgICAgIGVsZW1lbnQuYmx1cigpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRyaXZpYU1vZHVsZTsiLCJmdW5jdGlvbiBUcml2aWFNb2R1bGUoaGVyb2RhdGEsIGl0ZW1saXN0ZGF0YSwgaXRlbWRhdGEpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIGFiaWxpdHkgPSBbXSxcbiAgICAgICAgYWJpbGl0eWRhdGEgPSB7fSxcbiAgICAgICAgYWJpbGl0eV9pbmNsdWRlID0gW1wiaW52b2tlcl9jb2xkX3NuYXBcIiwgXCJpbnZva2VyX2dob3N0X3dhbGtcIiwgXCJpbnZva2VyX3Rvcm5hZG9cIiwgXCJpbnZva2VyX2VtcFwiLCBcImludm9rZXJfYWxhY3JpdHlcIiwgXCJpbnZva2VyX2NoYW9zX21ldGVvclwiLCBcImludm9rZXJfc3VuX3N0cmlrZVwiLCBcImludm9rZXJfZm9yZ2Vfc3Bpcml0XCIsIFwiaW52b2tlcl9pY2Vfd2FsbFwiLCBcImludm9rZXJfZGVhZmVuaW5nX2JsYXN0XCIsIFwia2VlcGVyX29mX3RoZV9saWdodF9yZWNhbGxcIiwgXCJrZWVwZXJfb2ZfdGhlX2xpZ2h0X2JsaW5kaW5nX2xpZ2h0XCIsIFwibG9uZV9kcnVpZF90cnVlX2Zvcm1fYmF0dGxlX2NyeVwiXTtcblxuICAgIGZvciAoaCBpbiBoZXJvZGF0YSkge1xuICAgICAgICB2YXIgYWJpbGl0aWVzID0gaGVyb2RhdGFbaF0uYWJpbGl0aWVzLm1hcChmdW5jdGlvbihhKSB7XG4gICAgICAgICAgICByZXR1cm4gYS5uYW1lO1xuICAgICAgICB9KTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhYmlsaXRpZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBhID0gaGVyb2RhdGFbaF0uYWJpbGl0aWVzLmZpbHRlcihmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGl0ZW0ubmFtZSA9PSBhYmlsaXRpZXNbaV07XG4gICAgICAgICAgICB9KVswXTtcbiAgICAgICAgICAgIGlmIChhLm5hbWUgIT0gXCJhdHRyaWJ1dGVfYm9udXNcIiAmJiBhLmRpc3BsYXluYW1lICYmIGEuZGlzcGxheW5hbWUgIT0gJycgJiYgYS5kaXNwbGF5bmFtZSAhPSAnRW1wdHknKSB7XG4gICAgICAgICAgICAgICAgaWYgKCEoYWJpbGl0aWVzW2ldIGluIGFiaWxpdHlkYXRhKSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoKGEuYmVoYXZpb3IuaW5kZXhPZihcIkRPVEFfQUJJTElUWV9CRUhBVklPUl9OT1RfTEVBUk5BQkxFXCIpID09IC0xICYmIGEuYmVoYXZpb3IuaW5kZXhPZihcIkRPVEFfQUJJTElUWV9CRUhBVklPUl9ISURERU5cIikgPT0gLTEpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAoYWJpbGl0eV9pbmNsdWRlLmluZGV4T2YoYS5uYW1lKSAhPSAtMSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFiaWxpdHkucHVzaChhLm5hbWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYWJpbGl0eWRhdGFbYS5uYW1lXSA9IGE7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLml0ZW1zID0gYWJpbGl0eTtcbiAgICB0aGlzLmdldEFuc3dlciA9IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgcmV0dXJuIGFiaWxpdHlkYXRhW2l0ZW1dLmRpc3BsYXluYW1lO1xuICAgIH1cbiAgICB0aGlzLmJ1aWxkUXVlc3Rpb24gPSBmdW5jdGlvbihpdGVtc19zaHVmZmxlZCwgYW5zd2Vyc19zaHVmZmxlZCkge1xuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaXRlbScpLnNyYyA9ICcvbWVkaWEvaW1hZ2VzL3NwZWxsaWNvbnMvJyArIGl0ZW1zX3NodWZmbGVkWzBdICsgJy5wbmcnO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFuc3dlcnNfc2h1ZmZsZWQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Fuc3dlcl8nICsgYW5zd2Vyc19zaHVmZmxlZFtpXSk7XG4gICAgICAgICAgICBlbGVtZW50LmlubmVySFRNTCA9IHNlbGYuZ2V0QW5zd2VyKGl0ZW1zX3NodWZmbGVkW2ldKTtcbiAgICAgICAgICAgIGVsZW1lbnQuYmx1cigpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRyaXZpYU1vZHVsZTsiXX0=
