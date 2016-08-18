$(function () {
  $.getJSON("/media/js/herodata.json", function(data) {
    var ability = [],
        abilitydata = {},
        ability_include = ["invoker_cold_snap", "invoker_ghost_walk", "invoker_tornado", "invoker_emp", "invoker_alacrity", "invoker_chaos_meteor", "invoker_sun_strike", "invoker_forge_spirit", "invoker_ice_wall", "invoker_deafening_blast", "keeper_of_the_light_recall", "keeper_of_the_light_blinding_light", "lone_druid_true_form_battle_cry"];
        
    for (h in data) {
      var abilities = data[h].abilities.map(function(a) {
        return a.name;
      });
      for (var i = 0; i < abilities.length; i++) {
        var a = data[h].abilities.filter(function (item) { return item.name == abilities[i]; })[0];
        if (a.name != "attribute_bonus" && a.displayname && a.displayname != '' && a.displayname != 'Empty' && a.description && a.description != '') {
          if (!(abilities[i] in abilitydata)) {
            if ((a.behavior.indexOf("DOTA_ABILITY_BEHAVIOR_NOT_LEARNABLE") == -1 && a.behavior.indexOf("DOTA_ABILITY_BEHAVIOR_HIDDEN") == -1) ||
              (ability_include.indexOf(a.name) != -1)) {
              ability.push(a.name);
              abilitydata[a.name] = a;
            }
          }
        }
      }
    }
        
    var trivia = new TriviaCore();
    trivia.items = ability;
    trivia.getAnswer = function (item) {
      return abilitydata[item].displayname;
    }
    trivia.buildQuestion = function (items_shuffled, answers_shuffled) {
      $('#item').attr('src', 'http://cdn.dota2.com/apps/dota2/images/abilities/' + items_shuffled[0] + '_hp1.png');
      for (var i = 0; i < answers_shuffled.length; i++) {
          $('#answer_' + answers_shuffled[i]).html(trivia.getAnswer(items_shuffled[i])).blur();
      }
    }
    trivia.init($('.btn'));
  });
});
