$(function () {
  var items = [];
  var itemnames = {};

  var answers = [0, 1, 2, 3, 4];
  var answer = 0;
  var streak = 0;
  var longeststreak = 0;

  function shuffle(array) {
    var counter = array.length,
      temp, index;

    // While there are elements in the array
    while (counter > 0) {
      // Pick a random index
      index = Math.floor(Math.random() * counter);

      // Decrease counter by 1
      counter--;

      // And swap the last element with it
      temp = array[counter];
      array[counter] = array[index];
      array[index] = temp;
    }

    return array;
  };

  function generateQuestion() {
    var items_shuffled = shuffle(items.slice(0));
    var answers_shuffled = shuffle(answers.slice(0));
    answer = itemnames[items_shuffled[0]].displayname;
    $('#item').attr('src', 'http://cdn.dota2.com/apps/dota2/images/abilities/' + items_shuffled[0] + '_hp1.png');
    for (var i = 0; i < answers_shuffled.length; i++) {
      $('#answer_' + answers_shuffled[i]).html(itemnames[items_shuffled[i]].displayname).blur();
    }
  }


  $('.btn').click(function (e) {
    if ($(this).text() == answer) {
      streak += 1;
      $('#ans_msg').html('<h3><span class=\"label label-success\">Correct!</span></h3>');
      generateQuestion();
    } else {
      $('#ans_msg').html('<h3><span class=\"label label-danger\">Wrong!</span></h3>');
      streak = 0;
    }
    if (streak > longeststreak) {
      longeststreak = streak;
      $('#longeststreak').text('Longest Streak: ' + longeststreak);
    }
    $('#ans_msg').stop(false, true, true);
    $('#ans_msg').show();
    $('#ans_msg').fadeOut(2000);
    $('#streak').text('Current Streak: ' + streak);
    e.preventDefault();
    e.stopImmediatePropagation()
    $(this).blur();

  });
  
  $.getJSON("/media/js/herodata.json", function (data) {
    var herodata = data;
    var ability = [];
    var abilitydata = {};
    var ability_include = ["invoker_cold_snap", "invoker_ghost_walk", "invoker_tornado", "invoker_emp", "invoker_alacrity", "invoker_chaos_meteor", "invoker_sun_strike", "invoker_forge_spirit", "invoker_ice_wall", "invoker_deafening_blast", "keeper_of_the_light_recall", "keeper_of_the_light_blinding_light", "lone_druid_true_form_battle_cry"];
    for (h in herodata) {
      var abilities = _.map(herodata[h].abilities, function(a){ return a.name; });
      for (var i=0;i<abilities.length;i++) {
        var a = _.findWhere(herodata[h].abilities, {name: abilities[i]});
        if (a.name != "attribute_bonus" && a.displayname && a.displayname != '' && a.description && a.description != '') {
          if (abilities[i] in abilitydata) {
            console.log('?', abilities[i]);
            console.log(abilitydata[abilities[i]]);
            console.log(_.findWhere(herodata[h].abilities, {name: abilities[i]}));
          }
          else {
            if ((a.behavior.indexOf("DOTA_ABILITY_BEHAVIOR_NOT_LEARNABLE") == -1 && a.behavior.indexOf("DOTA_ABILITY_BEHAVIOR_HIDDEN") == -1) ||
              (ability_include.indexOf(a.name) != -1)) {
              ability.push(a.name);
              abilitydata[a.name] = a;
            }
          }
        }
      }
    }
    items = ability;
    itemnames = abilitydata;
    generateQuestion();
  });

});