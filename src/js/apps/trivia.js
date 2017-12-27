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