require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({30:[function(require,module,exports){
var $ = jQuery = require('jquery');
require('bootstrap');

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
},{"../util/shuffle":55,"bootstrap":1,"jquery":25}]},{},[30])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYXBwcy9hYmlsaXR5VHJpdmlhLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgJCA9IGpRdWVyeSA9IHJlcXVpcmUoJ2pxdWVyeScpO1xucmVxdWlyZSgnYm9vdHN0cmFwJyk7XG5cbnZhciBpdGVtcyA9IFtdO1xudmFyIGl0ZW1uYW1lcyA9IHt9O1xudmFyIGl0ZW1zX3NodWZmbGVkO1xudmFyIGFuc3dlcnMgPSBbMCwgMSwgMiwgM107XG52YXIgcmFuZF9hYmlsaXR5O1xudmFyIHN0cmVhayA9IDA7XG52YXIgbG9uZ2VzdHN0cmVhayA9IDA7XG52YXIgcHJvZ3Jlc3MgPSAwO1xudmFyIHJhbmRfYXR0cjtcbnZhciBhbnN3ZXJ2YWw7XG52YXIgY29ycmVjdCA9IDA7XG52YXIgaGVyb2RhdGE7XG52YXIgc2h1ZmZsZSA9IHJlcXVpcmUoJy4uL3V0aWwvc2h1ZmZsZScpO1xuXG5mdW5jdGlvbiBnZW5lcmF0ZVF1ZXN0aW9uKCkge1xuICAgIHZhciBhbnN3ZXJzX3NodWZmbGVkID0gc2h1ZmZsZShhbnN3ZXJzLnNsaWNlKDApKTtcbiAgICAvL2NvbnNvbGUubG9nKGFuc3dlcnNfc2h1ZmZsZWQpO1xuICAgIHJhbmRfYWJpbGl0eSA9IGl0ZW1uYW1lc1tpdGVtc19zaHVmZmxlZFtwcm9ncmVzc11dO1xuICAgIC8vcmFuZF9hYmlsaXR5ID0gaXRlbW5hbWVzWydpbnZva2VyX2dob3N0X3dhbGsnXTtcbiAgICAkKCcjYWJpbGl0eScpLmF0dHIoJ3NyYycsICdodHRwOi8vY2RuLmRvdGEyLmNvbS9hcHBzL2RvdGEyL2ltYWdlcy9hYmlsaXRpZXMvJyArIHJhbmRfYWJpbGl0eS5uYW1lICsgJ19ocDEucG5nJyk7XG4gICAgJCgnI2hlcm8nKS5hdHRyKCdzcmMnLCdodHRwOi8vY2RuLmRvdGEyLmNvbS9hcHBzL2RvdGEyL2ltYWdlcy9oZXJvZXMvJyArIHJhbmRfYWJpbGl0eS5oZXJvLnJlcGxhY2UoJ25wY19kb3RhX2hlcm9fJywnJykgKyAnX2Z1bGwucG5nJyk7XG4gICAgJCgnI25hbWUnKS5odG1sKGhlcm9kYXRhW3JhbmRfYWJpbGl0eS5oZXJvXS5kaXNwbGF5bmFtZS50b1VwcGVyQ2FzZSgpICsgJyAtICcgKyByYW5kX2FiaWxpdHkuZGlzcGxheW5hbWUudG9VcHBlckNhc2UoKSk7XG4gICAgdmFyIGF0dHIgPSBbXTtcbiAgICBmb3IgKHZhciBpPTA7aTxyYW5kX2FiaWxpdHkuYXR0cmlidXRlcy5sZW5ndGg7aSsrKSB7XG4gICAgICAgIGlmICgndG9vbHRpcCcgaW4gcmFuZF9hYmlsaXR5LmF0dHJpYnV0ZXNbaV0pIHtcbiAgICAgICAgICAgIGF0dHIucHVzaChyYW5kX2FiaWxpdHkuYXR0cmlidXRlc1tpXSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKCdjb29sZG93bicgaW4gcmFuZF9hYmlsaXR5ICYmIHJhbmRfYWJpbGl0eS5jb29sZG93bi5sZW5ndGggPiAwICYmIHJhbmRfYWJpbGl0eS5jb29sZG93bi5zb21lKGZ1bmN0aW9uKG51bSl7IHJldHVybiBudW0gIT0gMDsgfSkpIHtcbiAgICAgICAgYXR0ci5wdXNoKHt0b29sdGlwOidDT09MRE9XTjonLHZhbHVlOnJhbmRfYWJpbGl0eS5jb29sZG93bn0pO1xuICAgIH1cbiAgICBpZiAoJ21hbmFjb3N0JyBpbiByYW5kX2FiaWxpdHkgJiYgcmFuZF9hYmlsaXR5Lm1hbmFjb3N0Lmxlbmd0aCA+IDAgJiYgcmFuZF9hYmlsaXR5Lm1hbmFjb3N0LnNvbWUoZnVuY3Rpb24obnVtKXsgcmV0dXJuIG51bSAhPSAwOyB9KSkge1xuICAgICAgICBhdHRyLnB1c2goe3Rvb2x0aXA6J01BTkEgQ09TVDonLHZhbHVlOnJhbmRfYWJpbGl0eS5tYW5hY29zdH0pO1xuICAgIH1cbiAgICBcbiAgICB2YXIgYXR0cl9zaHVmZmxlZCA9IHNodWZmbGUoYXR0ci5zbGljZSgwKSk7XG4gICAgcmFuZF9hdHRyID0gYXR0cl9zaHVmZmxlZFswXTtcbiAgICAkKCcjdG9vbHRpcCcpLmh0bWwocmFuZF9hdHRyLnRvb2x0aXApO1xuICAgIC8vY2hvaWNlcyA9IF8uZmxhdHRlbihnZW5lcmF0ZUFuc3dlckNob2ljZXMocmFuZF9hdHRyLnZhbHVlKSk7XG4gICAgY2hvaWNlcyA9IGdlbmVyYXRlQW5zd2VyQ2hvaWNlcyhyYW5kX2F0dHIudmFsdWUpLnJlZHVjZShmdW5jdGlvbihhLCBiKSB7XG4gICAgICByZXR1cm4gYS5jb25jYXQoYik7XG4gICAgfSwgW10pO1xuICAgIC8vY29uc29sZS5sb2coY2hvaWNlcyk7XG4gICAgYW5zd2VydmFsID0gY2hvaWNlc1tjaG9pY2VzLmxlbmd0aC0xXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFuc3dlcnNfc2h1ZmZsZWQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgJCgnI2Fuc3dlcl8nICsgaSkuaHRtbChjaG9pY2VzW2ldLnRvU3RyaW5nKCkpLmJsdXIoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGdlbmVyYXRlQW5zd2VyQ2hvaWNlcyhhbnN3ZXJfdmFsdWVzKSB7XG4gICAgLy9jb25zb2xlLmxvZyhhbnN3ZXJfdmFsdWVzKTtcbiAgICB2YXIgd3JvbmdhbnNsaXN0ID0gW107XG4gICAgLy9hbnN3ZXJfdmFsdWVzID0gYW5zd2VyLnRyaW0oKS5zcGxpdChcIiBcIilcblxuICAgIHZhciBtdWx0aXBsaWVyID0gMTAwO1xuICAgIG1pbnZhbCA9IHBhcnNlRmxvYXQoYW5zd2VyX3ZhbHVlc1swXSk7XG4gICAgbWF4dmFsID0gcGFyc2VGbG9hdChhbnN3ZXJfdmFsdWVzWzBdKTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYW5zd2VyX3ZhbHVlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBqID0gcGFyc2VGbG9hdChhbnN3ZXJfdmFsdWVzW2ldKTtcbiAgICAgICAgaWYgKGogPD0gbWludmFsKSB7XG4gICAgICAgICAgICBtaW52YWwgPSBqO1xuICAgICAgICB9XG4gICAgICAgIGlmIChqID49IG1heHZhbCkge1xuICAgICAgICAgICAgbWF4dmFsID0gajtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qIGNoZWNrIGlmIGFsbCBwb3NpdGl2ZSBvciBhbGwgbmVnYXRpdmUgKi9cbiAgICB2YXIgeWF4aXM7XG4gICAgaWYgKG1pbnZhbCA+IDApIHtcbiAgICAgICAgeWF4aXMgPSAxO1xuICAgIH0gZWxzZSBpZiAobWF4dmFsIDwgMCkge1xuICAgICAgICB5YXhpcyA9IC0xO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHlheGlzID0gMDtcbiAgICAgICAgaWYgKGFuc3dlcl92YWx1ZXMubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgaWYgKHBhcnNlRmxvYXQoYW5zd2VyX3ZhbHVlc1swXSkgPT0gMCkge1xuICAgICAgICAgICAgICAgIHZhciBhbnMgPSBcIlwiO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDw9IGFuc3dlcl92YWx1ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgYW5zID0gYW5zICsgYW5zd2VyX3ZhbHVlc1tpXSArIFwiIFwiO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXIgYW5zd2VyMiA9IGdlbmVyYXRlQW5zd2VyQ2hvaWNlcyhhbnMpO1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coYW5zd2VyMik7XG4gICAgICAgICAgICAgICAgdmFyIG5ld2Fuc3dlciA9IFtdO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYW5zd2VyMlswXS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBuZXdhbnN3ZXIucHVzaChcIjAgXCIgKyBhbnN3ZXJ3MlswXVtpXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBbbmV3YW5zd2VyLCBhbnN3ZXIyWzFdXTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAocGFyc2VGbG9hdChhbnN3ZXJfdmFsdWVzW2Fuc3dlcl92YWx1ZXMubGVuZ3RoIC0gMV0pID09IDApIHtcbiAgICAgICAgICAgICAgICB2YXIgYW5zID0gXCJcIjtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFuc3dlcl92YWx1ZXMubGVuZ3RoIC0gMTsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGFucyA9IGFucyArIGFuc3dlcl92YWx1ZXNbaV0gKyBcIiBcIjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFyIGFuc3dlcjIgPSBnZW5lcmF0ZUFuc3dlckNob2ljZXMoYW5zKTtcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKGFuc3dlcjIpO1xuICAgICAgICAgICAgICAgIHZhciBuZXdhbnN3ZXIgPSBbXTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFuc3dlcjJbMF0ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgbmV3YW5zd2VyLnB1c2goYW5zd2VyMlswXVtpXSArIFwiIDBcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBbbmV3YW5zd2VyLCBhbnN3ZXIyWzFdXTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhhbnN3ZXJfdmFsdWVzLmluZGV4T2YoMCkpO1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coYW5zd2VyX3ZhbHVlcy5zbGljZSgwLGFuc3dlcl92YWx1ZXMuaW5kZXhPZigwKSkpO1xuICAgICAgICAgICAgICAgIHZhciBhbnN3ZXIyID0gZ2VuZXJhdGVBbnN3ZXJDaG9pY2VzKGFuc3dlcl92YWx1ZXMuc2xpY2UoMCxhbnN3ZXJfdmFsdWVzLmluZGV4T2YoMCkpKTtcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKGFuc3dlcjIpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coYW5zd2VyX3ZhbHVlcy5zbGljZShhbnN3ZXJfdmFsdWVzLmluZGV4T2YoMCkrMSkpO1xuICAgICAgICAgICAgICAgIHZhciBhbnN3ZXIzID0gZ2VuZXJhdGVBbnN3ZXJDaG9pY2VzKGFuc3dlcl92YWx1ZXMuc2xpY2UoYW5zd2VyX3ZhbHVlcy5pbmRleE9mKDApKzEpKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhhbnN3ZXIzKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB2YXIgbmV3YW5zd2VyID0gW107XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhbnN3ZXIyWzBdLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIG5ld2Fuc3dlci5wdXNoKGFuc3dlcjJbMF1baV0gKyBcIiAwIFwiICsgYW5zd2VyM1swXVtpXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBbbmV3YW5zd2VyLCBhbnN3ZXJfdmFsdWVzXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBbW1wiMFwiLCBcIjFcIiwgXCIyXCIsIFwiM1wiXSwgYW5zd2VyX3ZhbHVlc107XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiBzY2FuIGxpc3QgdG8gZmluZCBhcHByb3ByaWF0ZSBtdWx0aXBsaWVyIGFuZCBvZmZzZXQgKi9cbiAgICBpZiAoZGl2aWRlc2FsbChhbnN3ZXJfdmFsdWVzLCAxMDApKSB7XG4gICAgICAgIG11bHRpcGxpZXIgPSA1MDtcbiAgICB9IGVsc2UgaWYgKGRpdmlkZXNhbGwoYW5zd2VyX3ZhbHVlcywgMTApKSB7XG4gICAgICAgIG11bHRpcGxpZXIgPSA1O1xuICAgIH0gZWxzZSBpZiAoZGl2aWRlc2FsbChhbnN3ZXJfdmFsdWVzLCA1KSkge1xuICAgICAgICBtdWx0aXBsaWVyID0gNTtcbiAgICB9IGVsc2UgaWYgKGRpdmlkZXNhbGwoYW5zd2VyX3ZhbHVlcywgMSkpIHtcbiAgICAgICAgbXVsdGlwbGllciA9IC41O1xuICAgIH0gZWxzZSBpZiAoZGl2aWRlc2FsbChhbnN3ZXJfdmFsdWVzLCAuMjUpKSB7XG4gICAgICAgIG11bHRpcGxpZXIgPSAuMjU7XG4gICAgfSBlbHNlIGlmIChkaXZpZGVzYWxsKGFuc3dlcl92YWx1ZXMsIC4xKSkge1xuICAgICAgICBtdWx0aXBsaWVyID0gLjE7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgbXVsdGlwbGllciA9IC4wNTtcbiAgICB9XG5cbiAgICAvKiBnZXQgYm91bmQgZm9yIG9mZnNldCAqL1xuICAgIHZhciBvZmZzZXQ7XG4gICAgaWYgKHlheGlzID09IDEpIHtcbiAgICAgICAgb2Zmc2V0ID0gLShNYXRoLmFicyhtaW52YWwgLyBtdWx0aXBsaWVyKSAtIDEpO1xuICAgIH0gZWxzZSBpZiAoeWF4aXMgPT0gLTEpIHtcbiAgICAgICAgb2Zmc2V0ID0gLShNYXRoLmFicyhtYXh2YWwgLyBtdWx0aXBsaWVyKSAtIDEpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIG9mZnNldCA9IDBcbiAgICAgICAgYWxlcnQoXCJlcnJvclwiKTtcbiAgICB9XG5cbiAgICB2YXIgYztcbiAgICBpZiAob2Zmc2V0ID4gLTEpIHtcbiAgICAgICAgb2Zmc2V0ID0gMDtcbiAgICB9XG4gICAgaWYgKG9mZnNldCA8IC0zKSB7XG4gICAgICAgIG9mZnNldCA9IC0zO1xuICAgIH1cblxuICAgIC8qIHBpY2sgcmFuZG9tIHZhbHVlIGJldHdlZW4gYm91bmQgYW5kIDAgZm9yIG9mZnNldCAqL1xuICAgIGlmIChvZmZzZXQpIHtcbiAgICAgICAgYyA9IG9mZnNldCArIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqICgxIC0gb2Zmc2V0KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgYyA9IDA7XG4gICAgfVxuXG4gICAgdmFyIHNsb3BlID0gMDtcbiAgICBpZiAoYW5zd2VyX3ZhbHVlcy5sZW5ndGggPiAxKSB7XG4gICAgICAgIHNsb3BlID0gcGFyc2VGbG9hdChhbnN3ZXJfdmFsdWVzWzFdKSAtIHBhcnNlRmxvYXQoYW5zd2VyX3ZhbHVlc1swXSk7XG4gICAgICAgIC8vY29uc29sZS5sb2coc2xvcGUpO1xuICAgIH1cblxuICAgIHZhciBjb3JyZWN0YW5zd2VyID0gXCJcIjtcblxuICAgIGZvciAodmFyIGkgPSBjOyBpIDwgYyArIDQ7IGkrKykge1xuICAgICAgICB2YXIgd3JvbmdhbnMgPSBcIlwiO1xuICAgICAgICB2YXIgZm51bSA9IDA7XG4gICAgICAgIHZhciBmbnVtcyA9IFtdO1xuICAgICAgICB2YXIgd3JvbmdhbnNvcmRlciA9IDA7XG4gICAgICAgIHZhciBkZWNpbWFscGxhY2VzID0gMDtcbiAgICAgICAgaWYgKGkgPT0gMCkge1xuICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBhbnN3ZXJfdmFsdWVzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgZm51bSA9IGZvcm1hdG51bShwYXJzZUZsb2F0KGFuc3dlcl92YWx1ZXNbal0pKTtcbiAgICAgICAgICAgICAgICBpZiAoZ2V0RGVjaW1hbFBsYWNlcyhmbnVtKSA+IGRlY2ltYWxwbGFjZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVjaW1hbHBsYWNlcyA9IGdldERlY2ltYWxQbGFjZXMoZm51bSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZudW1zLnB1c2goZm51bSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGFuc3dlcl92YWx1ZXMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICBpZiAocGFyc2VGbG9hdChhbnN3ZXJfdmFsdWVzWzBdKSA8IHBhcnNlRmxvYXQoYW5zd2VyX3ZhbHVlc1thbnN3ZXJfdmFsdWVzLmxlbmd0aCAtIDFdKSkge1xuICAgICAgICAgICAgICAgICAgICB3cm9uZ2Fuc29yZGVyID0gMDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHlheGlzID09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmbnVtID0gZm9ybWF0bnVtKHBhcnNlRmxvYXQoYW5zd2VyX3ZhbHVlc1swXSkgLSBpICogbXVsdGlwbGllciArIGogKiBzbG9wZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZ2V0RGVjaW1hbFBsYWNlcyhmbnVtKSA+IGRlY2ltYWxwbGFjZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWNpbWFscGxhY2VzID0gZ2V0RGVjaW1hbFBsYWNlcyhmbnVtKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGZudW1zLnB1c2goZm51bSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoeWF4aXMgPT0gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm51bSA9IGZvcm1hdG51bShwYXJzZUZsb2F0KGFuc3dlcl92YWx1ZXNbMF0pICsgaSAqIG11bHRpcGxpZXIgKyBqICogc2xvcGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGdldERlY2ltYWxQbGFjZXMoZm51bSkgPiBkZWNpbWFscGxhY2VzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVjaW1hbHBsYWNlcyA9IGdldERlY2ltYWxQbGFjZXMoZm51bSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBmbnVtcy5wdXNoKGZudW0pO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm51bXMucHVzaCgwKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHdyb25nYW5zb3JkZXIgPSAxO1xuICAgICAgICAgICAgICAgICAgICBpZiAoeWF4aXMgPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZudW0gPSBmb3JtYXRudW0ocGFyc2VGbG9hdChhbnN3ZXJfdmFsdWVzW2Fuc3dlcl92YWx1ZXMubGVuZ3RoIC0gMV0pIC0gaSAqIG11bHRpcGxpZXIgLSBqICogc2xvcGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGdldERlY2ltYWxQbGFjZXMoZm51bSkgPiBkZWNpbWFscGxhY2VzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVjaW1hbHBsYWNlcyA9IGdldERlY2ltYWxQbGFjZXMoZm51bSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBmbnVtcy5wdXNoKGZudW0pO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHlheGlzID09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZudW0gPSBmb3JtYXRudW0ocGFyc2VGbG9hdChhbnN3ZXJfdmFsdWVzW2Fuc3dlcl92YWx1ZXMubGVuZ3RoIC0gMV0pICsgaSAqIG11bHRpcGxpZXIgLSBqICogc2xvcGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGdldERlY2ltYWxQbGFjZXMoZm51bSkgPiBkZWNpbWFscGxhY2VzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVjaW1hbHBsYWNlcyA9IGdldERlY2ltYWxQbGFjZXMoZm51bSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBmbnVtcy5wdXNoKGZudW0pO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm51bXMucHVzaCgwKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmb3IgKHZhciBrID0gMDsgayA8IGZudW1zLmxlbmd0aDsgaysrKSB7XG4gICAgICAgICAgICBpZiAod3JvbmdhbnNvcmRlciA9PSAwKSB7XG4gICAgICAgICAgICAgICAgd3JvbmdhbnMgPSB3cm9uZ2FucyArIGZudW1zW2tdLnRvRml4ZWQoZGVjaW1hbHBsYWNlcykgKyBcIiBcIjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgd3JvbmdhbnMgPSBcIiBcIiArIGZudW1zW2tdLnRvRml4ZWQoZGVjaW1hbHBsYWNlcykgKyB3cm9uZ2FucztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB3cm9uZ2Fuc2xpc3QucHVzaCh3cm9uZ2Fucy50cmltKCkpO1xuICAgICAgICBpZiAoaSA9PSAwKSB7XG4gICAgICAgICAgICBjb3JyZWN0YW5zd2VyID0gd3JvbmdhbnMudHJpbSgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBbd3JvbmdhbnNsaXN0LCBjb3JyZWN0YW5zd2VyXTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0bnVtKG4pIHtcbiAgICByZXR1cm4gKE1hdGgucm91bmQobiAqIDEwMCkgLyAxMDApO1xufVxuXG5mdW5jdGlvbiBnZXREZWNpbWFsUGxhY2VzKG4pIHtcbiAgICBpZiAobiAlIDEgPT0gMCkge1xuICAgICAgICByZXR1cm4gMDtcbiAgICB9IGVsc2UgaWYgKG4gKiAxMCAlIDEgPT0gMCkge1xuICAgICAgICByZXR1cm4gMTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gMjtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRpdmlkZXNhbGwobCwgZCkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbC5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAocGFyc2VGbG9hdChsW2ldKSAlIGQpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbn1cblxuXG4kLmdldEpTT04oXCIvbWVkaWEvZG90YS1qc29uL2hlcm9kYXRhLmpzb25cIiwgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICBoZXJvZGF0YSA9IGRhdGE7XG4gICAgdmFyIGFiaWxpdHkgPSBbXTtcbiAgICB2YXIgYWJpbGl0eWRhdGEgPSB7fTtcbiAgICB2YXIgYWJpbGl0eV9pbmNsdWRlID0gW1wiaW52b2tlcl9jb2xkX3NuYXBcIiwgXCJpbnZva2VyX2dob3N0X3dhbGtcIiwgXCJpbnZva2VyX3Rvcm5hZG9cIiwgXCJpbnZva2VyX2VtcFwiLCBcImludm9rZXJfYWxhY3JpdHlcIiwgXCJpbnZva2VyX2NoYW9zX21ldGVvclwiLCBcImludm9rZXJfc3VuX3N0cmlrZVwiLCBcImludm9rZXJfZm9yZ2Vfc3Bpcml0XCIsIFwiaW52b2tlcl9pY2Vfd2FsbFwiLCBcImludm9rZXJfZGVhZmVuaW5nX2JsYXN0XCIsIFwia2VlcGVyX29mX3RoZV9saWdodF9yZWNhbGxcIiwgXCJrZWVwZXJfb2ZfdGhlX2xpZ2h0X2JsaW5kaW5nX2xpZ2h0XCIsIFwibG9uZV9kcnVpZF90cnVlX2Zvcm1fYmF0dGxlX2NyeVwiXTtcbiAgICBmb3IgKGggaW4gaGVyb2RhdGEpIHtcbiAgICAgICAgdmFyIGFiaWxpdGllcyA9IGhlcm9kYXRhW2hdLmFiaWxpdGllcy5tYXAoZnVuY3Rpb24gKGEpIHtcbiAgICAgICAgICAgIHJldHVybiBhLm5hbWU7XG4gICAgICAgIH0pO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFiaWxpdGllcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIGEgPSBoZXJvZGF0YVtoXS5hYmlsaXRpZXMuZmlsdGVyKGZ1bmN0aW9uIChhYmlsaXR5KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGFiaWxpdHkubmFtZSA9IGFiaWxpdGllc1tpXTtcbiAgICAgICAgICAgIH0pWzBdO1xuICAgICAgICAgICAgaWYgKGEubmFtZSAhPSBcImF0dHJpYnV0ZV9ib251c1wiICYmIGEuZGlzcGxheW5hbWUgJiYgYS5kaXNwbGF5bmFtZSAhPSAnJykge1xuICAgICAgICAgICAgICAgIGlmIChhYmlsaXRpZXNbaV0gaW4gYWJpbGl0eWRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnPycsIGFiaWxpdGllc1tpXSk7XG4gICAgICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coYWJpbGl0eWRhdGFbYWJpbGl0aWVzW2ldXSk7XG4gICAgICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coXy5maW5kV2hlcmUoaGVyb2RhdGFbaF0uYWJpbGl0aWVzLCB7XG4gICAgICAgICAgICAgICAgICAgIC8vXHRuYW1lOiBhYmlsaXRpZXNbaV1cbiAgICAgICAgICAgICAgICAgICAgLy99KSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKChhLmJlaGF2aW9yLmluZGV4T2YoXCJET1RBX0FCSUxJVFlfQkVIQVZJT1JfTk9UX0xFQVJOQUJMRVwiKSA9PSAtMSAmJiBhLmJlaGF2aW9yLmluZGV4T2YoXCJET1RBX0FCSUxJVFlfQkVIQVZJT1JfSElEREVOXCIpID09IC0xKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgKGFiaWxpdHlfaW5jbHVkZS5pbmRleE9mKGEubmFtZSkgIT0gLTEpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhYmlsaXR5LnB1c2goYS5uYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFiaWxpdHlkYXRhW2EubmFtZV0gPSBhO1xuICAgICAgICAgICAgICAgICAgICAgICAgYWJpbGl0eWRhdGFbYS5uYW1lXS5oZXJvID0gaDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBpdGVtcyA9IGFiaWxpdHk7XG4gICAgaXRlbW5hbWVzID0gYWJpbGl0eWRhdGE7XG4gICAgLy9jb25zb2xlLmxvZyhpdGVtcylcbiAgICAvL2NvbnNvbGUubG9nKGl0ZW1uYW1lcylcblxuICAgICQoJy5idG4nKS5jbGljayhmdW5jdGlvbiAoZSkge1xuICAgICAgICBpZiAoZS50YXJnZXQuaWQgPT0gJ3N0YXJ0Jykge1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnY2xpY2snKTtcbiAgICAgICAgICAgICQoJyNzdGFydF9jb250YWluZXInKS5oaWRlKCk7XG4gICAgICAgICAgICAkKCcjcXVlc3Rpb25fY29udGFpbmVyJykuc2hvdygpO1xuICAgICAgICAgICAgJCgnI3Njb3JlX2NvbnRhaW5lcicpLnNob3coKTtcbiAgICAgICAgICAgIGl0ZW1zX3NodWZmbGVkID0gc2h1ZmZsZShpdGVtcy5zbGljZSgwKSk7XG4gICAgICAgICAgICBwcm9ncmVzcyA9IDA7XG4gICAgICAgICAgICBzdHJlYWsgPSAwO1xuICAgICAgICAgICAgY29ycmVjdCA9IDA7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKGl0ZW1zX3NodWZmbGVkKTtcbiAgICAgICAgICAgIGdlbmVyYXRlUXVlc3Rpb24oKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coYW5zd2VydmFsKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coJCh0aGlzKS50ZXh0KCkpO1xuICAgICAgICAgICAgaWYgKCQodGhpcykudGV4dCgpID09IGFuc3dlcnZhbCkge1xuICAgICAgICAgICAgICAgIHN0cmVhayArPSAxO1xuICAgICAgICAgICAgICAgIGNvcnJlY3QgKz0gMTtcbiAgICAgICAgICAgICAgICAkKCcjYW5zX21zZycpLmh0bWwoJzxoMz48c3BhbiBjbGFzcz1cXFwibGFiZWwgbGFiZWwtc3VjY2Vzc1xcXCI+Q29ycmVjdCE8L3NwYW4+PC9oMz4nKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgJCgnI2Fuc19tc2cnKS5odG1sKCc8aDM+PHNwYW4gY2xhc3M9XFxcImxhYmVsIGxhYmVsLWRhbmdlclxcXCI+V3JvbmchICcgKyBhbnN3ZXJ2YWwgKyAnPC9zcGFuPjwvaDM+Jyk7XG4gICAgICAgICAgICAgICAgc3RyZWFrID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChzdHJlYWsgPiBsb25nZXN0c3RyZWFrKSB7XG4gICAgICAgICAgICAgICAgbG9uZ2VzdHN0cmVhayA9IHN0cmVhaztcbiAgICAgICAgICAgICAgICAkKCcjbG9uZ2VzdHN0cmVhaycpLnRleHQoJ0xvbmdlc3QgU3RyZWFrOiAnICsgbG9uZ2VzdHN0cmVhayk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwcm9ncmVzcys9MTtcbiAgICAgICAgICAgICQoJyNhbnNfbXNnJykuc3RvcChmYWxzZSwgdHJ1ZSwgdHJ1ZSk7XG4gICAgICAgICAgICAkKCcjYW5zX21zZycpLnNob3coKTtcbiAgICAgICAgICAgICQoJyNhbnNfbXNnJykuZmFkZU91dCgyMDAwKTtcbiAgICAgICAgICAgICQoJyNzdHJlYWsnKS50ZXh0KCdDdXJyZW50IFN0cmVhazogJyArIHN0cmVhayk7XG4gICAgICAgICAgICAkKCcjY29ycmVjdCcpLnRleHQoJ0NvcnJlY3Q6ICcgKyBjb3JyZWN0KTtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKClcbiAgICAgICAgICAgICQodGhpcykuYmx1cigpO1xuICAgICAgICAgICAgZ2VuZXJhdGVRdWVzdGlvbigpO1xuICAgICAgICB9XG4gICAgICAgICQoJyNwcm9ncmVzcycpLnRleHQoJ1Byb2dyZXNzOiAnICsgKHByb2dyZXNzKzEpICsgJy8yNScpO1xuICAgICAgICBpZiAocHJvZ3Jlc3MgPT0gMjUpIHtcbiAgICAgICAgICAgICQoJyNwcm9ncmVzcycpLnRleHQoJ0ZpbmFsIFNjb3JlOiAnICsgY29ycmVjdCArICcvMjUnKTtcbiAgICAgICAgICAgICQoJyNjb3JyZWN0JykudGV4dCgnJyk7XG4gICAgICAgICAgICAkKCcjc3RhcnQnKS5odG1sKCdQbGF5IEFnYWluJyk7XG4gICAgICAgICAgICAkKCcjc3RhcnRfY29udGFpbmVyJykuc2hvdygpO1xuICAgICAgICAgICAgJCgnI3F1ZXN0aW9uX2NvbnRhaW5lcicpLmhpZGUoKTtcbiAgICAgICAgfVxuICAgIH0pO1xufSk7Il19
