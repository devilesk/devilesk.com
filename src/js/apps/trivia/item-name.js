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