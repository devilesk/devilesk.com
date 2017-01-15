$(function () {
  $.getJSON("/media/js/herodata.json", function(data) {
    var trivia = new TriviaCore();
    trivia.items = Object.keys(data);
    trivia.getAnswer = function (item) {
      return data[item].displayname;
    }
    trivia.buildQuestion = function (items_shuffled, answers_shuffled) {
      $('#item').attr('src', 'http://cdn.dota2.com/apps/dota2/images/heroes/' + items_shuffled[0].replace('npc_dota_hero_', '') + '_full.png');
      for (var i = 0; i < answers_shuffled.length; i++) {
        $('#answer_' + answers_shuffled[i]).html(trivia.getAnswer(items_shuffled[i])).blur();
      }
    }
    trivia.init($('.btn'));
  });
});