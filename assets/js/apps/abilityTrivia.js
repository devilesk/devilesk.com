require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({18:[function(require,module,exports){
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
},{"../util/shuffle":31,"jquery":14}]},{},[18])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYXBwcy9hYmlsaXR5VHJpdmlhLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyICQgPSByZXF1aXJlKCdqcXVlcnknKTtcblxudmFyIGl0ZW1zID0gW107XG52YXIgaXRlbW5hbWVzID0ge307XG52YXIgaXRlbXNfc2h1ZmZsZWQ7XG52YXIgYW5zd2VycyA9IFswLCAxLCAyLCAzXTtcbnZhciByYW5kX2FiaWxpdHk7XG52YXIgc3RyZWFrID0gMDtcbnZhciBsb25nZXN0c3RyZWFrID0gMDtcbnZhciBwcm9ncmVzcyA9IDA7XG52YXIgcmFuZF9hdHRyO1xudmFyIGFuc3dlcnZhbDtcbnZhciBjb3JyZWN0ID0gMDtcbnZhciBoZXJvZGF0YTtcbnZhciBzaHVmZmxlID0gcmVxdWlyZSgnLi4vdXRpbC9zaHVmZmxlJyk7XG5cbmZ1bmN0aW9uIGdlbmVyYXRlUXVlc3Rpb24oKSB7XG4gICAgdmFyIGFuc3dlcnNfc2h1ZmZsZWQgPSBzaHVmZmxlKGFuc3dlcnMuc2xpY2UoMCkpO1xuICAgIC8vY29uc29sZS5sb2coYW5zd2Vyc19zaHVmZmxlZCk7XG4gICAgcmFuZF9hYmlsaXR5ID0gaXRlbW5hbWVzW2l0ZW1zX3NodWZmbGVkW3Byb2dyZXNzXV07XG4gICAgLy9yYW5kX2FiaWxpdHkgPSBpdGVtbmFtZXNbJ2ludm9rZXJfZ2hvc3Rfd2FsayddO1xuICAgICQoJyNhYmlsaXR5JykuYXR0cignc3JjJywgJ2h0dHA6Ly9jZG4uZG90YTIuY29tL2FwcHMvZG90YTIvaW1hZ2VzL2FiaWxpdGllcy8nICsgcmFuZF9hYmlsaXR5Lm5hbWUgKyAnX2hwMS5wbmcnKTtcbiAgICAkKCcjaGVybycpLmF0dHIoJ3NyYycsJ2h0dHA6Ly9jZG4uZG90YTIuY29tL2FwcHMvZG90YTIvaW1hZ2VzL2hlcm9lcy8nICsgcmFuZF9hYmlsaXR5Lmhlcm8ucmVwbGFjZSgnbnBjX2RvdGFfaGVyb18nLCcnKSArICdfZnVsbC5wbmcnKTtcbiAgICAkKCcjbmFtZScpLmh0bWwoaGVyb2RhdGFbcmFuZF9hYmlsaXR5Lmhlcm9dLmRpc3BsYXluYW1lLnRvVXBwZXJDYXNlKCkgKyAnIC0gJyArIHJhbmRfYWJpbGl0eS5kaXNwbGF5bmFtZS50b1VwcGVyQ2FzZSgpKTtcbiAgICB2YXIgYXR0ciA9IFtdO1xuICAgIGZvciAodmFyIGk9MDtpPHJhbmRfYWJpbGl0eS5hdHRyaWJ1dGVzLmxlbmd0aDtpKyspIHtcbiAgICAgICAgaWYgKCd0b29sdGlwJyBpbiByYW5kX2FiaWxpdHkuYXR0cmlidXRlc1tpXSkge1xuICAgICAgICAgICAgYXR0ci5wdXNoKHJhbmRfYWJpbGl0eS5hdHRyaWJ1dGVzW2ldKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoJ2Nvb2xkb3duJyBpbiByYW5kX2FiaWxpdHkgJiYgcmFuZF9hYmlsaXR5LmNvb2xkb3duLmxlbmd0aCA+IDAgJiYgcmFuZF9hYmlsaXR5LmNvb2xkb3duLnNvbWUoZnVuY3Rpb24obnVtKXsgcmV0dXJuIG51bSAhPSAwOyB9KSkge1xuICAgICAgICBhdHRyLnB1c2goe3Rvb2x0aXA6J0NPT0xET1dOOicsdmFsdWU6cmFuZF9hYmlsaXR5LmNvb2xkb3dufSk7XG4gICAgfVxuICAgIGlmICgnbWFuYWNvc3QnIGluIHJhbmRfYWJpbGl0eSAmJiByYW5kX2FiaWxpdHkubWFuYWNvc3QubGVuZ3RoID4gMCAmJiByYW5kX2FiaWxpdHkubWFuYWNvc3Quc29tZShmdW5jdGlvbihudW0peyByZXR1cm4gbnVtICE9IDA7IH0pKSB7XG4gICAgICAgIGF0dHIucHVzaCh7dG9vbHRpcDonTUFOQSBDT1NUOicsdmFsdWU6cmFuZF9hYmlsaXR5Lm1hbmFjb3N0fSk7XG4gICAgfVxuICAgIFxuICAgIHZhciBhdHRyX3NodWZmbGVkID0gc2h1ZmZsZShhdHRyLnNsaWNlKDApKTtcbiAgICByYW5kX2F0dHIgPSBhdHRyX3NodWZmbGVkWzBdO1xuICAgICQoJyN0b29sdGlwJykuaHRtbChyYW5kX2F0dHIudG9vbHRpcCk7XG4gICAgLy9jaG9pY2VzID0gXy5mbGF0dGVuKGdlbmVyYXRlQW5zd2VyQ2hvaWNlcyhyYW5kX2F0dHIudmFsdWUpKTtcbiAgICBjaG9pY2VzID0gZ2VuZXJhdGVBbnN3ZXJDaG9pY2VzKHJhbmRfYXR0ci52YWx1ZSkucmVkdWNlKGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgIHJldHVybiBhLmNvbmNhdChiKTtcbiAgICB9LCBbXSk7XG4gICAgLy9jb25zb2xlLmxvZyhjaG9pY2VzKTtcbiAgICBhbnN3ZXJ2YWwgPSBjaG9pY2VzW2Nob2ljZXMubGVuZ3RoLTFdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYW5zd2Vyc19zaHVmZmxlZC5sZW5ndGg7IGkrKykge1xuICAgICAgICAkKCcjYW5zd2VyXycgKyBpKS5odG1sKGNob2ljZXNbaV0udG9TdHJpbmcoKSkuYmx1cigpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZ2VuZXJhdGVBbnN3ZXJDaG9pY2VzKGFuc3dlcl92YWx1ZXMpIHtcbiAgICAvL2NvbnNvbGUubG9nKGFuc3dlcl92YWx1ZXMpO1xuICAgIHZhciB3cm9uZ2Fuc2xpc3QgPSBbXTtcbiAgICAvL2Fuc3dlcl92YWx1ZXMgPSBhbnN3ZXIudHJpbSgpLnNwbGl0KFwiIFwiKVxuXG4gICAgdmFyIG11bHRpcGxpZXIgPSAxMDA7XG4gICAgbWludmFsID0gcGFyc2VGbG9hdChhbnN3ZXJfdmFsdWVzWzBdKTtcbiAgICBtYXh2YWwgPSBwYXJzZUZsb2F0KGFuc3dlcl92YWx1ZXNbMF0pO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhbnN3ZXJfdmFsdWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGogPSBwYXJzZUZsb2F0KGFuc3dlcl92YWx1ZXNbaV0pO1xuICAgICAgICBpZiAoaiA8PSBtaW52YWwpIHtcbiAgICAgICAgICAgIG1pbnZhbCA9IGo7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGogPj0gbWF4dmFsKSB7XG4gICAgICAgICAgICBtYXh2YWwgPSBqO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyogY2hlY2sgaWYgYWxsIHBvc2l0aXZlIG9yIGFsbCBuZWdhdGl2ZSAqL1xuICAgIHZhciB5YXhpcztcbiAgICBpZiAobWludmFsID4gMCkge1xuICAgICAgICB5YXhpcyA9IDE7XG4gICAgfSBlbHNlIGlmIChtYXh2YWwgPCAwKSB7XG4gICAgICAgIHlheGlzID0gLTE7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgeWF4aXMgPSAwO1xuICAgICAgICBpZiAoYW5zd2VyX3ZhbHVlcy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICBpZiAocGFyc2VGbG9hdChhbnN3ZXJfdmFsdWVzWzBdKSA9PSAwKSB7XG4gICAgICAgICAgICAgICAgdmFyIGFucyA9IFwiXCI7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPD0gYW5zd2VyX3ZhbHVlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBhbnMgPSBhbnMgKyBhbnN3ZXJfdmFsdWVzW2ldICsgXCIgXCI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhciBhbnN3ZXIyID0gZ2VuZXJhdGVBbnN3ZXJDaG9pY2VzKGFucyk7XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhhbnN3ZXIyKTtcbiAgICAgICAgICAgICAgICB2YXIgbmV3YW5zd2VyID0gW107XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhbnN3ZXIyWzBdLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIG5ld2Fuc3dlci5wdXNoKFwiMCBcIiArIGFuc3dlcncyWzBdW2ldKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIFtuZXdhbnN3ZXIsIGFuc3dlcjJbMV1dO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChwYXJzZUZsb2F0KGFuc3dlcl92YWx1ZXNbYW5zd2VyX3ZhbHVlcy5sZW5ndGggLSAxXSkgPT0gMCkge1xuICAgICAgICAgICAgICAgIHZhciBhbnMgPSBcIlwiO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYW5zd2VyX3ZhbHVlcy5sZW5ndGggLSAxOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgYW5zID0gYW5zICsgYW5zd2VyX3ZhbHVlc1tpXSArIFwiIFwiO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXIgYW5zd2VyMiA9IGdlbmVyYXRlQW5zd2VyQ2hvaWNlcyhhbnMpO1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coYW5zd2VyMik7XG4gICAgICAgICAgICAgICAgdmFyIG5ld2Fuc3dlciA9IFtdO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYW5zd2VyMlswXS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBuZXdhbnN3ZXIucHVzaChhbnN3ZXIyWzBdW2ldICsgXCIgMFwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIFtuZXdhbnN3ZXIsIGFuc3dlcjJbMV1dO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKGFuc3dlcl92YWx1ZXMuaW5kZXhPZigwKSk7XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhhbnN3ZXJfdmFsdWVzLnNsaWNlKDAsYW5zd2VyX3ZhbHVlcy5pbmRleE9mKDApKSk7XG4gICAgICAgICAgICAgICAgdmFyIGFuc3dlcjIgPSBnZW5lcmF0ZUFuc3dlckNob2ljZXMoYW5zd2VyX3ZhbHVlcy5zbGljZSgwLGFuc3dlcl92YWx1ZXMuaW5kZXhPZigwKSkpO1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coYW5zd2VyMik7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhhbnN3ZXJfdmFsdWVzLnNsaWNlKGFuc3dlcl92YWx1ZXMuaW5kZXhPZigwKSsxKSk7XG4gICAgICAgICAgICAgICAgdmFyIGFuc3dlcjMgPSBnZW5lcmF0ZUFuc3dlckNob2ljZXMoYW5zd2VyX3ZhbHVlcy5zbGljZShhbnN3ZXJfdmFsdWVzLmluZGV4T2YoMCkrMSkpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGFuc3dlcjMpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHZhciBuZXdhbnN3ZXIgPSBbXTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFuc3dlcjJbMF0ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgbmV3YW5zd2VyLnB1c2goYW5zd2VyMlswXVtpXSArIFwiIDAgXCIgKyBhbnN3ZXIzWzBdW2ldKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIFtuZXdhbnN3ZXIsIGFuc3dlcl92YWx1ZXNdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIFtbXCIwXCIsIFwiMVwiLCBcIjJcIiwgXCIzXCJdLCBhbnN3ZXJfdmFsdWVzXTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qIHNjYW4gbGlzdCB0byBmaW5kIGFwcHJvcHJpYXRlIG11bHRpcGxpZXIgYW5kIG9mZnNldCAqL1xuICAgIGlmIChkaXZpZGVzYWxsKGFuc3dlcl92YWx1ZXMsIDEwMCkpIHtcbiAgICAgICAgbXVsdGlwbGllciA9IDUwO1xuICAgIH0gZWxzZSBpZiAoZGl2aWRlc2FsbChhbnN3ZXJfdmFsdWVzLCAxMCkpIHtcbiAgICAgICAgbXVsdGlwbGllciA9IDU7XG4gICAgfSBlbHNlIGlmIChkaXZpZGVzYWxsKGFuc3dlcl92YWx1ZXMsIDUpKSB7XG4gICAgICAgIG11bHRpcGxpZXIgPSA1O1xuICAgIH0gZWxzZSBpZiAoZGl2aWRlc2FsbChhbnN3ZXJfdmFsdWVzLCAxKSkge1xuICAgICAgICBtdWx0aXBsaWVyID0gLjU7XG4gICAgfSBlbHNlIGlmIChkaXZpZGVzYWxsKGFuc3dlcl92YWx1ZXMsIC4yNSkpIHtcbiAgICAgICAgbXVsdGlwbGllciA9IC4yNTtcbiAgICB9IGVsc2UgaWYgKGRpdmlkZXNhbGwoYW5zd2VyX3ZhbHVlcywgLjEpKSB7XG4gICAgICAgIG11bHRpcGxpZXIgPSAuMTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBtdWx0aXBsaWVyID0gLjA1O1xuICAgIH1cblxuICAgIC8qIGdldCBib3VuZCBmb3Igb2Zmc2V0ICovXG4gICAgdmFyIG9mZnNldDtcbiAgICBpZiAoeWF4aXMgPT0gMSkge1xuICAgICAgICBvZmZzZXQgPSAtKE1hdGguYWJzKG1pbnZhbCAvIG11bHRpcGxpZXIpIC0gMSk7XG4gICAgfSBlbHNlIGlmICh5YXhpcyA9PSAtMSkge1xuICAgICAgICBvZmZzZXQgPSAtKE1hdGguYWJzKG1heHZhbCAvIG11bHRpcGxpZXIpIC0gMSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgb2Zmc2V0ID0gMFxuICAgICAgICBhbGVydChcImVycm9yXCIpO1xuICAgIH1cblxuICAgIHZhciBjO1xuICAgIGlmIChvZmZzZXQgPiAtMSkge1xuICAgICAgICBvZmZzZXQgPSAwO1xuICAgIH1cbiAgICBpZiAob2Zmc2V0IDwgLTMpIHtcbiAgICAgICAgb2Zmc2V0ID0gLTM7XG4gICAgfVxuXG4gICAgLyogcGljayByYW5kb20gdmFsdWUgYmV0d2VlbiBib3VuZCBhbmQgMCBmb3Igb2Zmc2V0ICovXG4gICAgaWYgKG9mZnNldCkge1xuICAgICAgICBjID0gb2Zmc2V0ICsgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKDEgLSBvZmZzZXQpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBjID0gMDtcbiAgICB9XG5cbiAgICB2YXIgc2xvcGUgPSAwO1xuICAgIGlmIChhbnN3ZXJfdmFsdWVzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgc2xvcGUgPSBwYXJzZUZsb2F0KGFuc3dlcl92YWx1ZXNbMV0pIC0gcGFyc2VGbG9hdChhbnN3ZXJfdmFsdWVzWzBdKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhzbG9wZSk7XG4gICAgfVxuXG4gICAgdmFyIGNvcnJlY3RhbnN3ZXIgPSBcIlwiO1xuXG4gICAgZm9yICh2YXIgaSA9IGM7IGkgPCBjICsgNDsgaSsrKSB7XG4gICAgICAgIHZhciB3cm9uZ2FucyA9IFwiXCI7XG4gICAgICAgIHZhciBmbnVtID0gMDtcbiAgICAgICAgdmFyIGZudW1zID0gW107XG4gICAgICAgIHZhciB3cm9uZ2Fuc29yZGVyID0gMDtcbiAgICAgICAgdmFyIGRlY2ltYWxwbGFjZXMgPSAwO1xuICAgICAgICBpZiAoaSA9PSAwKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGFuc3dlcl92YWx1ZXMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICBmbnVtID0gZm9ybWF0bnVtKHBhcnNlRmxvYXQoYW5zd2VyX3ZhbHVlc1tqXSkpO1xuICAgICAgICAgICAgICAgIGlmIChnZXREZWNpbWFsUGxhY2VzKGZudW0pID4gZGVjaW1hbHBsYWNlcykge1xuICAgICAgICAgICAgICAgICAgICBkZWNpbWFscGxhY2VzID0gZ2V0RGVjaW1hbFBsYWNlcyhmbnVtKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZm51bXMucHVzaChmbnVtKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgYW5zd2VyX3ZhbHVlcy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgIGlmIChwYXJzZUZsb2F0KGFuc3dlcl92YWx1ZXNbMF0pIDwgcGFyc2VGbG9hdChhbnN3ZXJfdmFsdWVzW2Fuc3dlcl92YWx1ZXMubGVuZ3RoIC0gMV0pKSB7XG4gICAgICAgICAgICAgICAgICAgIHdyb25nYW5zb3JkZXIgPSAwO1xuICAgICAgICAgICAgICAgICAgICBpZiAoeWF4aXMgPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZudW0gPSBmb3JtYXRudW0ocGFyc2VGbG9hdChhbnN3ZXJfdmFsdWVzWzBdKSAtIGkgKiBtdWx0aXBsaWVyICsgaiAqIHNsb3BlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChnZXREZWNpbWFsUGxhY2VzKGZudW0pID4gZGVjaW1hbHBsYWNlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlY2ltYWxwbGFjZXMgPSBnZXREZWNpbWFsUGxhY2VzKGZudW0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZm51bXMucHVzaChmbnVtKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh5YXhpcyA9PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmbnVtID0gZm9ybWF0bnVtKHBhcnNlRmxvYXQoYW5zd2VyX3ZhbHVlc1swXSkgKyBpICogbXVsdGlwbGllciArIGogKiBzbG9wZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZ2V0RGVjaW1hbFBsYWNlcyhmbnVtKSA+IGRlY2ltYWxwbGFjZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWNpbWFscGxhY2VzID0gZ2V0RGVjaW1hbFBsYWNlcyhmbnVtKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGZudW1zLnB1c2goZm51bSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmbnVtcy5wdXNoKDApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgd3JvbmdhbnNvcmRlciA9IDE7XG4gICAgICAgICAgICAgICAgICAgIGlmICh5YXhpcyA9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm51bSA9IGZvcm1hdG51bShwYXJzZUZsb2F0KGFuc3dlcl92YWx1ZXNbYW5zd2VyX3ZhbHVlcy5sZW5ndGggLSAxXSkgLSBpICogbXVsdGlwbGllciAtIGogKiBzbG9wZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZ2V0RGVjaW1hbFBsYWNlcyhmbnVtKSA+IGRlY2ltYWxwbGFjZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWNpbWFscGxhY2VzID0gZ2V0RGVjaW1hbFBsYWNlcyhmbnVtKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGZudW1zLnB1c2goZm51bSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoeWF4aXMgPT0gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm51bSA9IGZvcm1hdG51bShwYXJzZUZsb2F0KGFuc3dlcl92YWx1ZXNbYW5zd2VyX3ZhbHVlcy5sZW5ndGggLSAxXSkgKyBpICogbXVsdGlwbGllciAtIGogKiBzbG9wZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZ2V0RGVjaW1hbFBsYWNlcyhmbnVtKSA+IGRlY2ltYWxwbGFjZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWNpbWFscGxhY2VzID0gZ2V0RGVjaW1hbFBsYWNlcyhmbnVtKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGZudW1zLnB1c2goZm51bSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmbnVtcy5wdXNoKDApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGZvciAodmFyIGsgPSAwOyBrIDwgZm51bXMubGVuZ3RoOyBrKyspIHtcbiAgICAgICAgICAgIGlmICh3cm9uZ2Fuc29yZGVyID09IDApIHtcbiAgICAgICAgICAgICAgICB3cm9uZ2FucyA9IHdyb25nYW5zICsgZm51bXNba10udG9GaXhlZChkZWNpbWFscGxhY2VzKSArIFwiIFwiO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB3cm9uZ2FucyA9IFwiIFwiICsgZm51bXNba10udG9GaXhlZChkZWNpbWFscGxhY2VzKSArIHdyb25nYW5zO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHdyb25nYW5zbGlzdC5wdXNoKHdyb25nYW5zLnRyaW0oKSk7XG4gICAgICAgIGlmIChpID09IDApIHtcbiAgICAgICAgICAgIGNvcnJlY3RhbnN3ZXIgPSB3cm9uZ2Fucy50cmltKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIFt3cm9uZ2Fuc2xpc3QsIGNvcnJlY3RhbnN3ZXJdO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRudW0obikge1xuICAgIHJldHVybiAoTWF0aC5yb3VuZChuICogMTAwKSAvIDEwMCk7XG59XG5cbmZ1bmN0aW9uIGdldERlY2ltYWxQbGFjZXMobikge1xuICAgIGlmIChuICUgMSA9PSAwKSB7XG4gICAgICAgIHJldHVybiAwO1xuICAgIH0gZWxzZSBpZiAobiAqIDEwICUgMSA9PSAwKSB7XG4gICAgICAgIHJldHVybiAxO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiAyO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZGl2aWRlc2FsbChsLCBkKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChwYXJzZUZsb2F0KGxbaV0pICUgZCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xufVxuXG5cbiQuZ2V0SlNPTihcIi9tZWRpYS9kb3RhLWpzb24vaGVyb2RhdGEuanNvblwiLCBmdW5jdGlvbiAoZGF0YSkge1xuICAgIGhlcm9kYXRhID0gZGF0YTtcbiAgICB2YXIgYWJpbGl0eSA9IFtdO1xuICAgIHZhciBhYmlsaXR5ZGF0YSA9IHt9O1xuICAgIHZhciBhYmlsaXR5X2luY2x1ZGUgPSBbXCJpbnZva2VyX2NvbGRfc25hcFwiLCBcImludm9rZXJfZ2hvc3Rfd2Fsa1wiLCBcImludm9rZXJfdG9ybmFkb1wiLCBcImludm9rZXJfZW1wXCIsIFwiaW52b2tlcl9hbGFjcml0eVwiLCBcImludm9rZXJfY2hhb3NfbWV0ZW9yXCIsIFwiaW52b2tlcl9zdW5fc3RyaWtlXCIsIFwiaW52b2tlcl9mb3JnZV9zcGlyaXRcIiwgXCJpbnZva2VyX2ljZV93YWxsXCIsIFwiaW52b2tlcl9kZWFmZW5pbmdfYmxhc3RcIiwgXCJrZWVwZXJfb2ZfdGhlX2xpZ2h0X3JlY2FsbFwiLCBcImtlZXBlcl9vZl90aGVfbGlnaHRfYmxpbmRpbmdfbGlnaHRcIiwgXCJsb25lX2RydWlkX3RydWVfZm9ybV9iYXR0bGVfY3J5XCJdO1xuICAgIGZvciAoaCBpbiBoZXJvZGF0YSkge1xuICAgICAgICB2YXIgYWJpbGl0aWVzID0gaGVyb2RhdGFbaF0uYWJpbGl0aWVzLm1hcChmdW5jdGlvbiAoYSkge1xuICAgICAgICAgICAgcmV0dXJuIGEubmFtZTtcbiAgICAgICAgfSk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYWJpbGl0aWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgYSA9IGhlcm9kYXRhW2hdLmFiaWxpdGllcy5maWx0ZXIoZnVuY3Rpb24gKGFiaWxpdHkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYWJpbGl0eS5uYW1lID0gYWJpbGl0aWVzW2ldO1xuICAgICAgICAgICAgfSlbMF07XG4gICAgICAgICAgICBpZiAoYS5uYW1lICE9IFwiYXR0cmlidXRlX2JvbnVzXCIgJiYgYS5kaXNwbGF5bmFtZSAmJiBhLmRpc3BsYXluYW1lICE9ICcnKSB7XG4gICAgICAgICAgICAgICAgaWYgKGFiaWxpdGllc1tpXSBpbiBhYmlsaXR5ZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCc/JywgYWJpbGl0aWVzW2ldKTtcbiAgICAgICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhhYmlsaXR5ZGF0YVthYmlsaXRpZXNbaV1dKTtcbiAgICAgICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhfLmZpbmRXaGVyZShoZXJvZGF0YVtoXS5hYmlsaXRpZXMsIHtcbiAgICAgICAgICAgICAgICAgICAgLy9cdG5hbWU6IGFiaWxpdGllc1tpXVxuICAgICAgICAgICAgICAgICAgICAvL30pKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAoKGEuYmVoYXZpb3IuaW5kZXhPZihcIkRPVEFfQUJJTElUWV9CRUhBVklPUl9OT1RfTEVBUk5BQkxFXCIpID09IC0xICYmIGEuYmVoYXZpb3IuaW5kZXhPZihcIkRPVEFfQUJJTElUWV9CRUhBVklPUl9ISURERU5cIikgPT0gLTEpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAoYWJpbGl0eV9pbmNsdWRlLmluZGV4T2YoYS5uYW1lKSAhPSAtMSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFiaWxpdHkucHVzaChhLm5hbWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYWJpbGl0eWRhdGFbYS5uYW1lXSA9IGE7XG4gICAgICAgICAgICAgICAgICAgICAgICBhYmlsaXR5ZGF0YVthLm5hbWVdLmhlcm8gPSBoO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGl0ZW1zID0gYWJpbGl0eTtcbiAgICBpdGVtbmFtZXMgPSBhYmlsaXR5ZGF0YTtcbiAgICAvL2NvbnNvbGUubG9nKGl0ZW1zKVxuICAgIC8vY29uc29sZS5sb2coaXRlbW5hbWVzKVxuXG4gICAgJCgnLmJ0bicpLmNsaWNrKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGlmIChlLnRhcmdldC5pZCA9PSAnc3RhcnQnKSB7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdjbGljaycpO1xuICAgICAgICAgICAgJCgnI3N0YXJ0X2NvbnRhaW5lcicpLmhpZGUoKTtcbiAgICAgICAgICAgICQoJyNxdWVzdGlvbl9jb250YWluZXInKS5zaG93KCk7XG4gICAgICAgICAgICAkKCcjc2NvcmVfY29udGFpbmVyJykuc2hvdygpO1xuICAgICAgICAgICAgaXRlbXNfc2h1ZmZsZWQgPSBzaHVmZmxlKGl0ZW1zLnNsaWNlKDApKTtcbiAgICAgICAgICAgIHByb2dyZXNzID0gMDtcbiAgICAgICAgICAgIHN0cmVhayA9IDA7XG4gICAgICAgICAgICBjb3JyZWN0ID0gMDtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coaXRlbXNfc2h1ZmZsZWQpO1xuICAgICAgICAgICAgZ2VuZXJhdGVRdWVzdGlvbigpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhhbnN3ZXJ2YWwpO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZygkKHRoaXMpLnRleHQoKSk7XG4gICAgICAgICAgICBpZiAoJCh0aGlzKS50ZXh0KCkgPT0gYW5zd2VydmFsKSB7XG4gICAgICAgICAgICAgICAgc3RyZWFrICs9IDE7XG4gICAgICAgICAgICAgICAgY29ycmVjdCArPSAxO1xuICAgICAgICAgICAgICAgICQoJyNhbnNfbXNnJykuaHRtbCgnPGgzPjxzcGFuIGNsYXNzPVxcXCJsYWJlbCBsYWJlbC1zdWNjZXNzXFxcIj5Db3JyZWN0ITwvc3Bhbj48L2gzPicpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAkKCcjYW5zX21zZycpLmh0bWwoJzxoMz48c3BhbiBjbGFzcz1cXFwibGFiZWwgbGFiZWwtZGFuZ2VyXFxcIj5Xcm9uZyEgJyArIGFuc3dlcnZhbCArICc8L3NwYW4+PC9oMz4nKTtcbiAgICAgICAgICAgICAgICBzdHJlYWsgPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHN0cmVhayA+IGxvbmdlc3RzdHJlYWspIHtcbiAgICAgICAgICAgICAgICBsb25nZXN0c3RyZWFrID0gc3RyZWFrO1xuICAgICAgICAgICAgICAgICQoJyNsb25nZXN0c3RyZWFrJykudGV4dCgnTG9uZ2VzdCBTdHJlYWs6ICcgKyBsb25nZXN0c3RyZWFrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHByb2dyZXNzKz0xO1xuICAgICAgICAgICAgJCgnI2Fuc19tc2cnKS5zdG9wKGZhbHNlLCB0cnVlLCB0cnVlKTtcbiAgICAgICAgICAgICQoJyNhbnNfbXNnJykuc2hvdygpO1xuICAgICAgICAgICAgJCgnI2Fuc19tc2cnKS5mYWRlT3V0KDIwMDApO1xuICAgICAgICAgICAgJCgnI3N0cmVhaycpLnRleHQoJ0N1cnJlbnQgU3RyZWFrOiAnICsgc3RyZWFrKTtcbiAgICAgICAgICAgICQoJyNjb3JyZWN0JykudGV4dCgnQ29ycmVjdDogJyArIGNvcnJlY3QpO1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKVxuICAgICAgICAgICAgJCh0aGlzKS5ibHVyKCk7XG4gICAgICAgICAgICBnZW5lcmF0ZVF1ZXN0aW9uKCk7XG4gICAgICAgIH1cbiAgICAgICAgJCgnI3Byb2dyZXNzJykudGV4dCgnUHJvZ3Jlc3M6ICcgKyAocHJvZ3Jlc3MrMSkgKyAnLzI1Jyk7XG4gICAgICAgIGlmIChwcm9ncmVzcyA9PSAyNSkge1xuICAgICAgICAgICAgJCgnI3Byb2dyZXNzJykudGV4dCgnRmluYWwgU2NvcmU6ICcgKyBjb3JyZWN0ICsgJy8yNScpO1xuICAgICAgICAgICAgJCgnI2NvcnJlY3QnKS50ZXh0KCcnKTtcbiAgICAgICAgICAgICQoJyNzdGFydCcpLmh0bWwoJ1BsYXkgQWdhaW4nKTtcbiAgICAgICAgICAgICQoJyNzdGFydF9jb250YWluZXInKS5zaG93KCk7XG4gICAgICAgICAgICAkKCcjcXVlc3Rpb25fY29udGFpbmVyJykuaGlkZSgpO1xuICAgICAgICB9XG4gICAgfSk7XG59KTsiXX0=
