var $ = require('jquery');
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
    $.getJSON("/media/js/herodata.json", function(herodata) {
        herodata = data;
    }),
    $.getJSON("/media/js/items.json", function(items) {
        items = data;
    }),
    $.getJSON("/media/js/itemdata.json", function(itemdata) {
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