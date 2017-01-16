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