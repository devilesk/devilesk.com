require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({18:[function(require,module,exports){
var $ = jQuery = require('jquery');
require('bootstrap');

function TriviaCore() {
    var self = this;
    this.answers = [0, 1, 2, 3, 4];
    this.answer = 0;
    this.streak = 0;
    this.longeststreak = 0;
    this.items = [];
    this.shuffle = function shuffle(array) {
        var counter = array.length,
            temp, index;

        // While there are elements in the array
        while (counter > 0) {
            // Pick a random index
            index = Math.floor(Math.random() * counter);

            // Decrease counter by 1
            counter--;

            // And swap the last element with it
            temp = array[counter];
            array[counter] = array[index];
            array[index] = temp;
        }

        return array;
    };
    this.getAnswer = function(item) {}
    this.generateQuestion = function() {
        var items_shuffled = this.shuffle(this.items.slice(0));
        var answers_shuffled = this.shuffle(this.answers.slice(0));
        this.answer = this.getAnswer(items_shuffled[0]);
        this.buildQuestion(items_shuffled, answers_shuffled);
    }
    this.buildQuestion = function(items_shuffled, answers_shuffled) {}
    this.onCorrectAnswer = function() {
        this.streak += 1;
        $('#ans_msg').html('<h3><span class=\"label label-success\">Correct!</span></h3>');
        this.generateQuestion();
    }
    this.onWrongAnswer = function() {
        $('#ans_msg').html('<h3><span class=\"label label-danger\">Wrong!</span></h3>');
        this.streak = 0;
    }
    this.onStreakUpdate = function() {
        this.longeststreak = this.streak;
        $('#longeststreak').text('Longest Streak: ' + this.longeststreak);
    }
    this.onClickEnd = function() {
        $('#ans_msg').stop(false, true, true);
        $('#ans_msg').show();
        $('#ans_msg').fadeOut(2000);
        $('#streak').text('Current Streak: ' + this.streak);
        e.preventDefault();
        e.stopImmediatePropagation()
        $(this).blur();
    }
    this.init = function(btns) {
        btns.click(function(e) {
            if ($(this).text() == self.answer) {
                self.onCorrectAnswer();
            } else {
                self.onWrongAnswer();
            }
            if (self.streak > self.longeststreak) {
                self.onStreakUpdate();
            }
            self.onClickEnd();
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
    $.getJSON("/media/dota-json/herodata.json", function(herodata) {
        herodata = data;
    }),
    $.getJSON("/media/dota-json/items.json", function(items) {
        items = data;
    }),
    $.getJSON("/media/dota-json/itemdata.json", function(itemdata) {
        itemdata = data;
    })
).then(function() {
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
},{"./trivia/ability-name":19,"./trivia/hero-name":20,"./trivia/item-cost":21,"./trivia/item-name":22,"bootstrap":1,"jquery":14}],22:[function(require,module,exports){
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
},{"jquery":14}],21:[function(require,module,exports){
var $ = require('jquery');

function TriviaModule(herodata, itemlistdata, itemdata) {
    var itemdata = {}
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
        itemdata[items[i]] = {
            cost: itemdata[items[i]].itemcost,
            name: itemdata[items[i]].ItemRecipe ? itemdata[itemdata[items[i]].ItemResult].displayname + ' Recipe' : itemdata[items[i]].displayname
        }
    }

    this.items = items;
    this.getAnswer = function(item) {
        return itemdata[item].cost;
    }
    this.buildQuestion = function(items_shuffled, answers_shuffled) {
        $('#item').attr('src', 'http://cdn.dota2.com/apps/dota2/images/items/' + items_shuffled[0].replace('item_', '') + '_lg.png');
        $('#item-name').html(itemdata[items_shuffled[0]].name);
        for (var i = 0; i < answers_shuffled.length; i++) {
            $('#answer_' + answers_shuffled[i]).html(itemdata[items_shuffled[i]].cost).blur();
        }
    }
}

module.exports = TriviaModule;
},{"jquery":14}],20:[function(require,module,exports){
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
},{"jquery":14}],19:[function(require,module,exports){
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
            if (a.name != "attribute_bonus" && a.displayname && a.displayname != '' && a.displayname != 'Empty' && a.description && a.description != '') {
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
},{"jquery":14}]},{},[18]);
