$(function () {
  $.getJSON("/media/js/items.json", function(itemlistdata) {
    $.getJSON("/media/js/itemdata.json", function(data) {
      var itemdata = {}
      var itemlist = Object.keys(itemlistdata.data);
      var items = itemlist.map(function (item) { return 'item_' + item; });
      itemlist.forEach(function (item) {
        var itemRecipe = 'item_recipe_' + item;
        if (data[itemRecipe] && data[itemRecipe].itemcost) {
          items.push(itemRecipe);
        }
      });
      for (var i = 0; i < items.length; i++) {
        itemdata[items[i]] = {
          cost: data[items[i]].itemcost,
          name: data[items[i]].ItemRecipe ? data[data[items[i]].ItemResult].displayname + ' Recipe' : data[items[i]].displayname
        }
      }
        
      var trivia = new TriviaCore();
      trivia.items = items;
      trivia.getAnswer = function (item) {
        return itemdata[item].cost;
      }
      trivia.buildQuestion = function (items_shuffled, answers_shuffled) {
        $('#item').attr('src','http://cdn.dota2.com/apps/dota2/images/items/' + items_shuffled[0].replace('item_','') + '_lg.png');
        $('#item-name').html(itemdata[items_shuffled[0]].name);
        for (var i=0;i<answers_shuffled.length;i++) {
            $('#answer_' + answers_shuffled[i]).html(itemdata[items_shuffled[i]].cost).blur();
        }
      }
      trivia.init($('.btn'));
    });
  });
});