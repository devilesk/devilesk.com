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