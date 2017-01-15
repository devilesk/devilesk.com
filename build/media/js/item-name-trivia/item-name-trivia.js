$(function () {
  $.getJSON("/media/js/items.json", function(data) {
    var trivia = new TriviaCore();
    trivia.items = Object.keys(data.data);
    trivia.getAnswer = function (item) {
      return data.data[item];
    }
    trivia.buildQuestion = function (items_shuffled, answers_shuffled) {
      $('#item').attr('src','http://cdn.dota2.com/apps/dota2/images/items/' + items_shuffled[0] + '_lg.png');
      for (var i=0;i<answers_shuffled.length;i++) {
        $('#answer_' + answers_shuffled[i]).html(data.data[items_shuffled[i]]).blur();
      }
    }
    trivia.init($('.btn'));
  });
});