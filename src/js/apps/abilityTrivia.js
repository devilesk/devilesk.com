var $ = require('jquery');

var items = [];
var itemnames = {};
var items_shuffled;
var answers = [0, 1, 2, 3];
var rand_ability;
var streak = 0;
var longeststreak = 0;
var progress = 0;
var rand_attr;
var answerval;
var correct = 0;
var herodata;
var shuffle = require('../util/shuffle');

function generateQuestion() {
    var answers_shuffled = shuffle(answers.slice(0));
    //console.log(answers_shuffled);
    rand_ability = itemnames[items_shuffled[progress]];
    //rand_ability = itemnames['invoker_ghost_walk'];
    $('#ability').attr('src', 'http://cdn.dota2.com/apps/dota2/images/abilities/' + rand_ability.name + '_hp1.png');
    $('#hero').attr('src','http://cdn.dota2.com/apps/dota2/images/heroes/' + rand_ability.hero.replace('npc_dota_hero_','') + '_full.png');
    $('#name').html(herodata[rand_ability.hero].displayname.toUpperCase() + ' - ' + rand_ability.displayname.toUpperCase());
    var attr = [];
    for (var i=0;i<rand_ability.attributes.length;i++) {
        if ('tooltip' in rand_ability.attributes[i]) {
            attr.push(rand_ability.attributes[i]);
        }
    }
    if ('cooldown' in rand_ability && rand_ability.cooldown.length > 0 && rand_ability.cooldown.some(function(num){ return num != 0; })) {
        attr.push({tooltip:'COOLDOWN:',value:rand_ability.cooldown});
    }
    if ('manacost' in rand_ability && rand_ability.manacost.length > 0 && rand_ability.manacost.some(function(num){ return num != 0; })) {
        attr.push({tooltip:'MANA COST:',value:rand_ability.manacost});
    }
    
    var attr_shuffled = shuffle(attr.slice(0));
    rand_attr = attr_shuffled[0];
    $('#tooltip').html(rand_attr.tooltip);
    //choices = _.flatten(generateAnswerChoices(rand_attr.value));
    choices = generateAnswerChoices(rand_attr.value).reduce(function(a, b) {
      return a.concat(b);
    }, []);
    //console.log(choices);
    answerval = choices[choices.length-1];
    for (var i = 0; i < answers_shuffled.length; i++) {
        $('#answer_' + i).html(choices[i].toString()).blur();
    }
}

function generateAnswerChoices(answer_values) {
    //console.log(answer_values);
    var wronganslist = [];
    //answer_values = answer.trim().split(" ")

    var multiplier = 100;
    minval = parseFloat(answer_values[0]);
    maxval = parseFloat(answer_values[0]);

    for (var i = 0; i < answer_values.length; i++) {
        j = parseFloat(answer_values[i]);
        if (j <= minval) {
            minval = j;
        }
        if (j >= maxval) {
            maxval = j;
        }
    }

    /* check if all positive or all negative */
    var yaxis;
    if (minval > 0) {
        yaxis = 1;
    } else if (maxval < 0) {
        yaxis = -1;
    } else {
        yaxis = 0;
        if (answer_values.length > 1) {
            if (parseFloat(answer_values[0]) == 0) {
                var ans = "";
                for (var i = 1; i <= answer_values.length; i++) {
                    ans = ans + answer_values[i] + " ";
                }
                var answer2 = generateAnswerChoices(ans);
                //console.log(answer2);
                var newanswer = [];
                for (var i = 0; i < answer2[0].length; i++) {
                    newanswer.push("0 " + answerw2[0][i]);
                }
                return [newanswer, answer2[1]];
            } else if (parseFloat(answer_values[answer_values.length - 1]) == 0) {
                var ans = "";
                for (var i = 0; i < answer_values.length - 1; i++) {
                    ans = ans + answer_values[i] + " ";
                }
                var answer2 = generateAnswerChoices(ans);
                //console.log(answer2);
                var newanswer = [];
                for (var i = 0; i < answer2[0].length; i++) {
                    newanswer.push(answer2[0][i] + " 0");
                }
                return [newanswer, answer2[1]];
            } else {
                //console.log(answer_values.indexOf(0));
                //console.log(answer_values.slice(0,answer_values.indexOf(0)));
                var answer2 = generateAnswerChoices(answer_values.slice(0,answer_values.indexOf(0)));
                //console.log(answer2);
                
                //console.log(answer_values.slice(answer_values.indexOf(0)+1));
                var answer3 = generateAnswerChoices(answer_values.slice(answer_values.indexOf(0)+1));
                console.log(answer3);
                
                var newanswer = [];
                for (var i = 0; i < answer2[0].length; i++) {
                    newanswer.push(answer2[0][i] + " 0 " + answer3[0][i]);
                }
                return [newanswer, answer_values];
            }
        } else {
            return [["0", "1", "2", "3"], answer_values];
        }
    }

    /* scan list to find appropriate multiplier and offset */
    if (dividesall(answer_values, 100)) {
        multiplier = 50;
    } else if (dividesall(answer_values, 10)) {
        multiplier = 5;
    } else if (dividesall(answer_values, 5)) {
        multiplier = 5;
    } else if (dividesall(answer_values, 1)) {
        multiplier = .5;
    } else if (dividesall(answer_values, .25)) {
        multiplier = .25;
    } else if (dividesall(answer_values, .1)) {
        multiplier = .1;
    } else {
        multiplier = .05;
    }

    /* get bound for offset */
    var offset;
    if (yaxis == 1) {
        offset = -(Math.abs(minval / multiplier) - 1);
    } else if (yaxis == -1) {
        offset = -(Math.abs(maxval / multiplier) - 1);
    } else {
        offset = 0
        alert("error");
    }

    var c;
    if (offset > -1) {
        offset = 0;
    }
    if (offset < -3) {
        offset = -3;
    }

    /* pick random value between bound and 0 for offset */
    if (offset) {
        c = offset + Math.floor(Math.random() * (1 - offset));
    } else {
        c = 0;
    }

    var slope = 0;
    if (answer_values.length > 1) {
        slope = parseFloat(answer_values[1]) - parseFloat(answer_values[0]);
        //console.log(slope);
    }

    var correctanswer = "";

    for (var i = c; i < c + 4; i++) {
        var wrongans = "";
        var fnum = 0;
        var fnums = [];
        var wrongansorder = 0;
        var decimalplaces = 0;
        if (i == 0) {
            for (var j = 0; j < answer_values.length; j++) {
                fnum = formatnum(parseFloat(answer_values[j]));
                if (getDecimalPlaces(fnum) > decimalplaces) {
                    decimalplaces = getDecimalPlaces(fnum);
                }
                fnums.push(fnum);
            }
        } else {
            for (var j = 0; j < answer_values.length; j++) {
                if (parseFloat(answer_values[0]) < parseFloat(answer_values[answer_values.length - 1])) {
                    wrongansorder = 0;
                    if (yaxis == -1) {
                        fnum = formatnum(parseFloat(answer_values[0]) - i * multiplier + j * slope);
                        if (getDecimalPlaces(fnum) > decimalplaces) {
                            decimalplaces = getDecimalPlaces(fnum);
                        }
                        fnums.push(fnum);
                    } else if (yaxis == 1) {
                        fnum = formatnum(parseFloat(answer_values[0]) + i * multiplier + j * slope);
                        if (getDecimalPlaces(fnum) > decimalplaces) {
                            decimalplaces = getDecimalPlaces(fnum);
                        }
                        fnums.push(fnum);
                    } else {
                        fnums.push(0);
                    }
                } else {
                    wrongansorder = 1;
                    if (yaxis == -1) {
                        fnum = formatnum(parseFloat(answer_values[answer_values.length - 1]) - i * multiplier - j * slope);
                        if (getDecimalPlaces(fnum) > decimalplaces) {
                            decimalplaces = getDecimalPlaces(fnum);
                        }
                        fnums.push(fnum);
                    } else if (yaxis == 1) {
                        fnum = formatnum(parseFloat(answer_values[answer_values.length - 1]) + i * multiplier - j * slope);
                        if (getDecimalPlaces(fnum) > decimalplaces) {
                            decimalplaces = getDecimalPlaces(fnum);
                        }
                        fnums.push(fnum);
                    } else {
                        fnums.push(0);
                    }
                }
            }
        }
        for (var k = 0; k < fnums.length; k++) {
            if (wrongansorder == 0) {
                wrongans = wrongans + fnums[k].toFixed(decimalplaces) + " ";
            } else {
                wrongans = " " + fnums[k].toFixed(decimalplaces) + wrongans;
            }
        }
        wronganslist.push(wrongans.trim());
        if (i == 0) {
            correctanswer = wrongans.trim();
        }
    }
    return [wronganslist, correctanswer];
}

function formatnum(n) {
    return (Math.round(n * 100) / 100);
}

function getDecimalPlaces(n) {
    if (n % 1 == 0) {
        return 0;
    } else if (n * 10 % 1 == 0) {
        return 1;
    } else {
        return 2;
    }
}

function dividesall(l, d) {
    for (var i = 0; i < l.length; i++) {
        if (parseFloat(l[i]) % d) {
            return false;
        }
    }
    return true;
}


$.getJSON("/media/dota-json/herodata.json", function (data) {
    herodata = data;
    var ability = [];
    var abilitydata = {};
    var ability_include = ["invoker_cold_snap", "invoker_ghost_walk", "invoker_tornado", "invoker_emp", "invoker_alacrity", "invoker_chaos_meteor", "invoker_sun_strike", "invoker_forge_spirit", "invoker_ice_wall", "invoker_deafening_blast", "keeper_of_the_light_recall", "keeper_of_the_light_blinding_light", "lone_druid_true_form_battle_cry"];
    for (h in herodata) {
        var abilities = herodata[h].abilities.map(function (a) {
            return a.name;
        });
        for (var i = 0; i < abilities.length; i++) {
            var a = herodata[h].abilities.filter(function (ability) {
                return ability.name = abilities[i];
            })[0];
            if (a.name != "attribute_bonus" && a.displayname && a.displayname != '') {
                if (abilities[i] in abilitydata) {
                    //console.log('?', abilities[i]);
                    //console.log(abilitydata[abilities[i]]);
                    //console.log(_.findWhere(herodata[h].abilities, {
                    //	name: abilities[i]
                    //}));
                } else {
                    if ((a.behavior.indexOf("DOTA_ABILITY_BEHAVIOR_NOT_LEARNABLE") == -1 && a.behavior.indexOf("DOTA_ABILITY_BEHAVIOR_HIDDEN") == -1) ||
                        (ability_include.indexOf(a.name) != -1)) {
                        ability.push(a.name);
                        abilitydata[a.name] = a;
                        abilitydata[a.name].hero = h;
                    }
                }
            }
        }
    }
    items = ability;
    itemnames = abilitydata;
    //console.log(items)
    //console.log(itemnames)

    $('.btn').click(function (e) {
        if (e.target.id == 'start') {
            //console.log('click');
            $('#start_container').hide();
            $('#question_container').show();
            $('#score_container').show();
            items_shuffled = shuffle(items.slice(0));
            progress = 0;
            streak = 0;
            correct = 0;
            //console.log(items_shuffled);
            generateQuestion();
        }
        else {
            //console.log(answerval);
            //console.log($(this).text());
            if ($(this).text() == answerval) {
                streak += 1;
                correct += 1;
                $('#ans_msg').html('<h3><span class=\"label label-success\">Correct!</span></h3>');
            } else {
                $('#ans_msg').html('<h3><span class=\"label label-danger\">Wrong! ' + answerval + '</span></h3>');
                streak = 0;
            }
            if (streak > longeststreak) {
                longeststreak = streak;
                $('#longeststreak').text('Longest Streak: ' + longeststreak);
            }
            progress+=1;
            $('#ans_msg').stop(false, true, true);
            $('#ans_msg').show();
            $('#ans_msg').fadeOut(2000);
            $('#streak').text('Current Streak: ' + streak);
            $('#correct').text('Correct: ' + correct);
            e.preventDefault();
            e.stopImmediatePropagation()
            $(this).blur();
            generateQuestion();
        }
        $('#progress').text('Progress: ' + (progress+1) + '/25');
        if (progress == 25) {
            $('#progress').text('Final Score: ' + correct + '/25');
            $('#correct').text('');
            $('#start').html('Play Again');
            $('#start_container').show();
            $('#question_container').hide();
        }
    });
});