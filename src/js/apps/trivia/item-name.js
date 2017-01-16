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