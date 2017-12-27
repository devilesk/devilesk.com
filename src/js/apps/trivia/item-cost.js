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