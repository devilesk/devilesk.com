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