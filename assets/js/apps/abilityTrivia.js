require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({17:[function(require,module,exports){
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
var fadeOut = require('../util/fadeOut');
var getJSON = require('../util/getJSON');

function generateQuestion() {
    var answers_shuffled = shuffle(answers.slice(0));
    //console.log(answers_shuffled);
    rand_ability = itemnames[items_shuffled[progress]];
    //rand_ability = itemnames['invoker_ghost_walk'];
    document.getElementById('ability').src = '/media/images/spellicons/' + rand_ability.name + '.png';
    document.getElementById('hero').src = '/media/images/heroes/' + rand_ability.hero.replace('npc_dota_hero_','') + '.png';
    document.getElementById('name').innerHTML = herodata[rand_ability.hero].displayname.toUpperCase() + ' - ' + rand_ability.displayname.toUpperCase();
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
    document.getElementById('tooltip').innerHTML = rand_attr.tooltip;
    choices = generateAnswerChoices(rand_attr.value).reduce(function(a, b) {
      return a.concat(b);
    }, []);
    //console.log(choices);
    answerval = choices[choices.length-1];
    for (var i = 0; i < answers_shuffled.length; i++) {
        document.getElementById('answer_' + i).innerHTML = choices[i].toString();
        document.getElementById('answer_' + i).blur();
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


getJSON("/media/dota-json/herodata.json", function (data) {
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
                if (!(abilities[i] in abilitydata)) {
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
    [].forEach.call(document.querySelectorAll('.btn'), function (element) {
        element.addEventListener('click', function (event) {
            if (event.currentTarget.id == 'start') {
                //console.log('click');
                document.getElementById('start_container').style.display = 'none';
                document.getElementById('question_container').style.display = '';
                document.getElementById('score_container').style.display = '';
                items_shuffled = shuffle(items.slice(0));
                progress = 0;
                streak = 0;
                correct = 0;
                //console.log(items_shuffled);
                generateQuestion();
            }
            else {
                //console.log(answerval);
                if (element.innerHTML == answerval) {
                    streak += 1;
                    correct += 1;
                    document.getElementById('ans_msg').innerHTML = '<h3><span class=\"label label-success\">Correct!</span></h3>';
                } else {
                    document.getElementById('ans_msg').innerHTML = '<h3><span class=\"label label-danger\">Wrong! ' + answerval + '</span></h3>';
                    streak = 0;
                }
                /*if (streak > longeststreak) {
                    longeststreak = streak;
                    document.getElementById('longeststreak').innerHTML = 'Longest Streak: ' + longeststreak;
                }*/
                progress+=1;
                document.getElementById('ans_msg').style.display = '';
                fadeOut(document.getElementById('ans_msg'));
                document.getElementById('streak').innerHTML = 'Current Streak: ' + streak;
                document.getElementById('correct').innerHTML = 'Correct: ' + correct;
                event.preventDefault();
                event.stopImmediatePropagation()
                element.blur();
                generateQuestion();
            }
            document.getElementById('progress').innerHTML = 'Progress: ' + (progress+1) + '/25';
            if (progress == 25) {
                document.getElementById('progress').innerHTML = 'Final Score: ' + correct + '/25';
                document.getElementById('correct').innerHTML = '';
                document.getElementById('start').innerHTML = 'Play Again';
                document.getElementById('start_container').style.display = '';
                document.getElementById('question_container').style.display = 'none';
            }
        });
    });
});
},{"../util/fadeOut":38,"../util/getJSON":39,"../util/shuffle":41}]},{},[17])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYXBwcy9hYmlsaXR5VHJpdmlhLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBpdGVtcyA9IFtdO1xudmFyIGl0ZW1uYW1lcyA9IHt9O1xudmFyIGl0ZW1zX3NodWZmbGVkO1xudmFyIGFuc3dlcnMgPSBbMCwgMSwgMiwgM107XG52YXIgcmFuZF9hYmlsaXR5O1xudmFyIHN0cmVhayA9IDA7XG52YXIgbG9uZ2VzdHN0cmVhayA9IDA7XG52YXIgcHJvZ3Jlc3MgPSAwO1xudmFyIHJhbmRfYXR0cjtcbnZhciBhbnN3ZXJ2YWw7XG52YXIgY29ycmVjdCA9IDA7XG52YXIgaGVyb2RhdGE7XG52YXIgc2h1ZmZsZSA9IHJlcXVpcmUoJy4uL3V0aWwvc2h1ZmZsZScpO1xudmFyIGZhZGVPdXQgPSByZXF1aXJlKCcuLi91dGlsL2ZhZGVPdXQnKTtcbnZhciBnZXRKU09OID0gcmVxdWlyZSgnLi4vdXRpbC9nZXRKU09OJyk7XG5cbmZ1bmN0aW9uIGdlbmVyYXRlUXVlc3Rpb24oKSB7XG4gICAgdmFyIGFuc3dlcnNfc2h1ZmZsZWQgPSBzaHVmZmxlKGFuc3dlcnMuc2xpY2UoMCkpO1xuICAgIC8vY29uc29sZS5sb2coYW5zd2Vyc19zaHVmZmxlZCk7XG4gICAgcmFuZF9hYmlsaXR5ID0gaXRlbW5hbWVzW2l0ZW1zX3NodWZmbGVkW3Byb2dyZXNzXV07XG4gICAgLy9yYW5kX2FiaWxpdHkgPSBpdGVtbmFtZXNbJ2ludm9rZXJfZ2hvc3Rfd2FsayddO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhYmlsaXR5Jykuc3JjID0gJy9tZWRpYS9pbWFnZXMvc3BlbGxpY29ucy8nICsgcmFuZF9hYmlsaXR5Lm5hbWUgKyAnLnBuZyc7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2hlcm8nKS5zcmMgPSAnL21lZGlhL2ltYWdlcy9oZXJvZXMvJyArIHJhbmRfYWJpbGl0eS5oZXJvLnJlcGxhY2UoJ25wY19kb3RhX2hlcm9fJywnJykgKyAnLnBuZyc7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25hbWUnKS5pbm5lckhUTUwgPSBoZXJvZGF0YVtyYW5kX2FiaWxpdHkuaGVyb10uZGlzcGxheW5hbWUudG9VcHBlckNhc2UoKSArICcgLSAnICsgcmFuZF9hYmlsaXR5LmRpc3BsYXluYW1lLnRvVXBwZXJDYXNlKCk7XG4gICAgdmFyIGF0dHIgPSBbXTtcbiAgICBmb3IgKHZhciBpPTA7aTxyYW5kX2FiaWxpdHkuYXR0cmlidXRlcy5sZW5ndGg7aSsrKSB7XG4gICAgICAgIGlmICgndG9vbHRpcCcgaW4gcmFuZF9hYmlsaXR5LmF0dHJpYnV0ZXNbaV0pIHtcbiAgICAgICAgICAgIGF0dHIucHVzaChyYW5kX2FiaWxpdHkuYXR0cmlidXRlc1tpXSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKCdjb29sZG93bicgaW4gcmFuZF9hYmlsaXR5ICYmIHJhbmRfYWJpbGl0eS5jb29sZG93bi5sZW5ndGggPiAwICYmIHJhbmRfYWJpbGl0eS5jb29sZG93bi5zb21lKGZ1bmN0aW9uKG51bSl7IHJldHVybiBudW0gIT0gMDsgfSkpIHtcbiAgICAgICAgYXR0ci5wdXNoKHt0b29sdGlwOidDT09MRE9XTjonLHZhbHVlOnJhbmRfYWJpbGl0eS5jb29sZG93bn0pO1xuICAgIH1cbiAgICBpZiAoJ21hbmFjb3N0JyBpbiByYW5kX2FiaWxpdHkgJiYgcmFuZF9hYmlsaXR5Lm1hbmFjb3N0Lmxlbmd0aCA+IDAgJiYgcmFuZF9hYmlsaXR5Lm1hbmFjb3N0LnNvbWUoZnVuY3Rpb24obnVtKXsgcmV0dXJuIG51bSAhPSAwOyB9KSkge1xuICAgICAgICBhdHRyLnB1c2goe3Rvb2x0aXA6J01BTkEgQ09TVDonLHZhbHVlOnJhbmRfYWJpbGl0eS5tYW5hY29zdH0pO1xuICAgIH1cbiAgICBcbiAgICB2YXIgYXR0cl9zaHVmZmxlZCA9IHNodWZmbGUoYXR0ci5zbGljZSgwKSk7XG4gICAgcmFuZF9hdHRyID0gYXR0cl9zaHVmZmxlZFswXTtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9vbHRpcCcpLmlubmVySFRNTCA9IHJhbmRfYXR0ci50b29sdGlwO1xuICAgIGNob2ljZXMgPSBnZW5lcmF0ZUFuc3dlckNob2ljZXMocmFuZF9hdHRyLnZhbHVlKS5yZWR1Y2UoZnVuY3Rpb24oYSwgYikge1xuICAgICAgcmV0dXJuIGEuY29uY2F0KGIpO1xuICAgIH0sIFtdKTtcbiAgICAvL2NvbnNvbGUubG9nKGNob2ljZXMpO1xuICAgIGFuc3dlcnZhbCA9IGNob2ljZXNbY2hvaWNlcy5sZW5ndGgtMV07XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhbnN3ZXJzX3NodWZmbGVkLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhbnN3ZXJfJyArIGkpLmlubmVySFRNTCA9IGNob2ljZXNbaV0udG9TdHJpbmcoKTtcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Fuc3dlcl8nICsgaSkuYmx1cigpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZ2VuZXJhdGVBbnN3ZXJDaG9pY2VzKGFuc3dlcl92YWx1ZXMpIHtcbiAgICAvL2NvbnNvbGUubG9nKGFuc3dlcl92YWx1ZXMpO1xuICAgIHZhciB3cm9uZ2Fuc2xpc3QgPSBbXTtcbiAgICAvL2Fuc3dlcl92YWx1ZXMgPSBhbnN3ZXIudHJpbSgpLnNwbGl0KFwiIFwiKVxuXG4gICAgdmFyIG11bHRpcGxpZXIgPSAxMDA7XG4gICAgbWludmFsID0gcGFyc2VGbG9hdChhbnN3ZXJfdmFsdWVzWzBdKTtcbiAgICBtYXh2YWwgPSBwYXJzZUZsb2F0KGFuc3dlcl92YWx1ZXNbMF0pO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhbnN3ZXJfdmFsdWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGogPSBwYXJzZUZsb2F0KGFuc3dlcl92YWx1ZXNbaV0pO1xuICAgICAgICBpZiAoaiA8PSBtaW52YWwpIHtcbiAgICAgICAgICAgIG1pbnZhbCA9IGo7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGogPj0gbWF4dmFsKSB7XG4gICAgICAgICAgICBtYXh2YWwgPSBqO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyogY2hlY2sgaWYgYWxsIHBvc2l0aXZlIG9yIGFsbCBuZWdhdGl2ZSAqL1xuICAgIHZhciB5YXhpcztcbiAgICBpZiAobWludmFsID4gMCkge1xuICAgICAgICB5YXhpcyA9IDE7XG4gICAgfSBlbHNlIGlmIChtYXh2YWwgPCAwKSB7XG4gICAgICAgIHlheGlzID0gLTE7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgeWF4aXMgPSAwO1xuICAgICAgICBpZiAoYW5zd2VyX3ZhbHVlcy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICBpZiAocGFyc2VGbG9hdChhbnN3ZXJfdmFsdWVzWzBdKSA9PSAwKSB7XG4gICAgICAgICAgICAgICAgdmFyIGFucyA9IFwiXCI7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPD0gYW5zd2VyX3ZhbHVlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBhbnMgPSBhbnMgKyBhbnN3ZXJfdmFsdWVzW2ldICsgXCIgXCI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhciBhbnN3ZXIyID0gZ2VuZXJhdGVBbnN3ZXJDaG9pY2VzKGFucyk7XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhhbnN3ZXIyKTtcbiAgICAgICAgICAgICAgICB2YXIgbmV3YW5zd2VyID0gW107XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhbnN3ZXIyWzBdLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIG5ld2Fuc3dlci5wdXNoKFwiMCBcIiArIGFuc3dlcncyWzBdW2ldKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIFtuZXdhbnN3ZXIsIGFuc3dlcjJbMV1dO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChwYXJzZUZsb2F0KGFuc3dlcl92YWx1ZXNbYW5zd2VyX3ZhbHVlcy5sZW5ndGggLSAxXSkgPT0gMCkge1xuICAgICAgICAgICAgICAgIHZhciBhbnMgPSBcIlwiO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYW5zd2VyX3ZhbHVlcy5sZW5ndGggLSAxOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgYW5zID0gYW5zICsgYW5zd2VyX3ZhbHVlc1tpXSArIFwiIFwiO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXIgYW5zd2VyMiA9IGdlbmVyYXRlQW5zd2VyQ2hvaWNlcyhhbnMpO1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coYW5zd2VyMik7XG4gICAgICAgICAgICAgICAgdmFyIG5ld2Fuc3dlciA9IFtdO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYW5zd2VyMlswXS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBuZXdhbnN3ZXIucHVzaChhbnN3ZXIyWzBdW2ldICsgXCIgMFwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIFtuZXdhbnN3ZXIsIGFuc3dlcjJbMV1dO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKGFuc3dlcl92YWx1ZXMuaW5kZXhPZigwKSk7XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhhbnN3ZXJfdmFsdWVzLnNsaWNlKDAsYW5zd2VyX3ZhbHVlcy5pbmRleE9mKDApKSk7XG4gICAgICAgICAgICAgICAgdmFyIGFuc3dlcjIgPSBnZW5lcmF0ZUFuc3dlckNob2ljZXMoYW5zd2VyX3ZhbHVlcy5zbGljZSgwLGFuc3dlcl92YWx1ZXMuaW5kZXhPZigwKSkpO1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coYW5zd2VyMik7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhhbnN3ZXJfdmFsdWVzLnNsaWNlKGFuc3dlcl92YWx1ZXMuaW5kZXhPZigwKSsxKSk7XG4gICAgICAgICAgICAgICAgdmFyIGFuc3dlcjMgPSBnZW5lcmF0ZUFuc3dlckNob2ljZXMoYW5zd2VyX3ZhbHVlcy5zbGljZShhbnN3ZXJfdmFsdWVzLmluZGV4T2YoMCkrMSkpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGFuc3dlcjMpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHZhciBuZXdhbnN3ZXIgPSBbXTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFuc3dlcjJbMF0ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgbmV3YW5zd2VyLnB1c2goYW5zd2VyMlswXVtpXSArIFwiIDAgXCIgKyBhbnN3ZXIzWzBdW2ldKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIFtuZXdhbnN3ZXIsIGFuc3dlcl92YWx1ZXNdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIFtbXCIwXCIsIFwiMVwiLCBcIjJcIiwgXCIzXCJdLCBhbnN3ZXJfdmFsdWVzXTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qIHNjYW4gbGlzdCB0byBmaW5kIGFwcHJvcHJpYXRlIG11bHRpcGxpZXIgYW5kIG9mZnNldCAqL1xuICAgIGlmIChkaXZpZGVzYWxsKGFuc3dlcl92YWx1ZXMsIDEwMCkpIHtcbiAgICAgICAgbXVsdGlwbGllciA9IDUwO1xuICAgIH0gZWxzZSBpZiAoZGl2aWRlc2FsbChhbnN3ZXJfdmFsdWVzLCAxMCkpIHtcbiAgICAgICAgbXVsdGlwbGllciA9IDU7XG4gICAgfSBlbHNlIGlmIChkaXZpZGVzYWxsKGFuc3dlcl92YWx1ZXMsIDUpKSB7XG4gICAgICAgIG11bHRpcGxpZXIgPSA1O1xuICAgIH0gZWxzZSBpZiAoZGl2aWRlc2FsbChhbnN3ZXJfdmFsdWVzLCAxKSkge1xuICAgICAgICBtdWx0aXBsaWVyID0gLjU7XG4gICAgfSBlbHNlIGlmIChkaXZpZGVzYWxsKGFuc3dlcl92YWx1ZXMsIC4yNSkpIHtcbiAgICAgICAgbXVsdGlwbGllciA9IC4yNTtcbiAgICB9IGVsc2UgaWYgKGRpdmlkZXNhbGwoYW5zd2VyX3ZhbHVlcywgLjEpKSB7XG4gICAgICAgIG11bHRpcGxpZXIgPSAuMTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBtdWx0aXBsaWVyID0gLjA1O1xuICAgIH1cblxuICAgIC8qIGdldCBib3VuZCBmb3Igb2Zmc2V0ICovXG4gICAgdmFyIG9mZnNldDtcbiAgICBpZiAoeWF4aXMgPT0gMSkge1xuICAgICAgICBvZmZzZXQgPSAtKE1hdGguYWJzKG1pbnZhbCAvIG11bHRpcGxpZXIpIC0gMSk7XG4gICAgfSBlbHNlIGlmICh5YXhpcyA9PSAtMSkge1xuICAgICAgICBvZmZzZXQgPSAtKE1hdGguYWJzKG1heHZhbCAvIG11bHRpcGxpZXIpIC0gMSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgb2Zmc2V0ID0gMFxuICAgICAgICBhbGVydChcImVycm9yXCIpO1xuICAgIH1cblxuICAgIHZhciBjO1xuICAgIGlmIChvZmZzZXQgPiAtMSkge1xuICAgICAgICBvZmZzZXQgPSAwO1xuICAgIH1cbiAgICBpZiAob2Zmc2V0IDwgLTMpIHtcbiAgICAgICAgb2Zmc2V0ID0gLTM7XG4gICAgfVxuXG4gICAgLyogcGljayByYW5kb20gdmFsdWUgYmV0d2VlbiBib3VuZCBhbmQgMCBmb3Igb2Zmc2V0ICovXG4gICAgaWYgKG9mZnNldCkge1xuICAgICAgICBjID0gb2Zmc2V0ICsgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKDEgLSBvZmZzZXQpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBjID0gMDtcbiAgICB9XG5cbiAgICB2YXIgc2xvcGUgPSAwO1xuICAgIGlmIChhbnN3ZXJfdmFsdWVzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgc2xvcGUgPSBwYXJzZUZsb2F0KGFuc3dlcl92YWx1ZXNbMV0pIC0gcGFyc2VGbG9hdChhbnN3ZXJfdmFsdWVzWzBdKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhzbG9wZSk7XG4gICAgfVxuXG4gICAgdmFyIGNvcnJlY3RhbnN3ZXIgPSBcIlwiO1xuXG4gICAgZm9yICh2YXIgaSA9IGM7IGkgPCBjICsgNDsgaSsrKSB7XG4gICAgICAgIHZhciB3cm9uZ2FucyA9IFwiXCI7XG4gICAgICAgIHZhciBmbnVtID0gMDtcbiAgICAgICAgdmFyIGZudW1zID0gW107XG4gICAgICAgIHZhciB3cm9uZ2Fuc29yZGVyID0gMDtcbiAgICAgICAgdmFyIGRlY2ltYWxwbGFjZXMgPSAwO1xuICAgICAgICBpZiAoaSA9PSAwKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGFuc3dlcl92YWx1ZXMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICBmbnVtID0gZm9ybWF0bnVtKHBhcnNlRmxvYXQoYW5zd2VyX3ZhbHVlc1tqXSkpO1xuICAgICAgICAgICAgICAgIGlmIChnZXREZWNpbWFsUGxhY2VzKGZudW0pID4gZGVjaW1hbHBsYWNlcykge1xuICAgICAgICAgICAgICAgICAgICBkZWNpbWFscGxhY2VzID0gZ2V0RGVjaW1hbFBsYWNlcyhmbnVtKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZm51bXMucHVzaChmbnVtKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgYW5zd2VyX3ZhbHVlcy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgIGlmIChwYXJzZUZsb2F0KGFuc3dlcl92YWx1ZXNbMF0pIDwgcGFyc2VGbG9hdChhbnN3ZXJfdmFsdWVzW2Fuc3dlcl92YWx1ZXMubGVuZ3RoIC0gMV0pKSB7XG4gICAgICAgICAgICAgICAgICAgIHdyb25nYW5zb3JkZXIgPSAwO1xuICAgICAgICAgICAgICAgICAgICBpZiAoeWF4aXMgPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZudW0gPSBmb3JtYXRudW0ocGFyc2VGbG9hdChhbnN3ZXJfdmFsdWVzWzBdKSAtIGkgKiBtdWx0aXBsaWVyICsgaiAqIHNsb3BlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChnZXREZWNpbWFsUGxhY2VzKGZudW0pID4gZGVjaW1hbHBsYWNlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlY2ltYWxwbGFjZXMgPSBnZXREZWNpbWFsUGxhY2VzKGZudW0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZm51bXMucHVzaChmbnVtKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh5YXhpcyA9PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmbnVtID0gZm9ybWF0bnVtKHBhcnNlRmxvYXQoYW5zd2VyX3ZhbHVlc1swXSkgKyBpICogbXVsdGlwbGllciArIGogKiBzbG9wZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZ2V0RGVjaW1hbFBsYWNlcyhmbnVtKSA+IGRlY2ltYWxwbGFjZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWNpbWFscGxhY2VzID0gZ2V0RGVjaW1hbFBsYWNlcyhmbnVtKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGZudW1zLnB1c2goZm51bSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmbnVtcy5wdXNoKDApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgd3JvbmdhbnNvcmRlciA9IDE7XG4gICAgICAgICAgICAgICAgICAgIGlmICh5YXhpcyA9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm51bSA9IGZvcm1hdG51bShwYXJzZUZsb2F0KGFuc3dlcl92YWx1ZXNbYW5zd2VyX3ZhbHVlcy5sZW5ndGggLSAxXSkgLSBpICogbXVsdGlwbGllciAtIGogKiBzbG9wZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZ2V0RGVjaW1hbFBsYWNlcyhmbnVtKSA+IGRlY2ltYWxwbGFjZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWNpbWFscGxhY2VzID0gZ2V0RGVjaW1hbFBsYWNlcyhmbnVtKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGZudW1zLnB1c2goZm51bSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoeWF4aXMgPT0gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm51bSA9IGZvcm1hdG51bShwYXJzZUZsb2F0KGFuc3dlcl92YWx1ZXNbYW5zd2VyX3ZhbHVlcy5sZW5ndGggLSAxXSkgKyBpICogbXVsdGlwbGllciAtIGogKiBzbG9wZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZ2V0RGVjaW1hbFBsYWNlcyhmbnVtKSA+IGRlY2ltYWxwbGFjZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWNpbWFscGxhY2VzID0gZ2V0RGVjaW1hbFBsYWNlcyhmbnVtKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGZudW1zLnB1c2goZm51bSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmbnVtcy5wdXNoKDApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGZvciAodmFyIGsgPSAwOyBrIDwgZm51bXMubGVuZ3RoOyBrKyspIHtcbiAgICAgICAgICAgIGlmICh3cm9uZ2Fuc29yZGVyID09IDApIHtcbiAgICAgICAgICAgICAgICB3cm9uZ2FucyA9IHdyb25nYW5zICsgZm51bXNba10udG9GaXhlZChkZWNpbWFscGxhY2VzKSArIFwiIFwiO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB3cm9uZ2FucyA9IFwiIFwiICsgZm51bXNba10udG9GaXhlZChkZWNpbWFscGxhY2VzKSArIHdyb25nYW5zO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHdyb25nYW5zbGlzdC5wdXNoKHdyb25nYW5zLnRyaW0oKSk7XG4gICAgICAgIGlmIChpID09IDApIHtcbiAgICAgICAgICAgIGNvcnJlY3RhbnN3ZXIgPSB3cm9uZ2Fucy50cmltKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIFt3cm9uZ2Fuc2xpc3QsIGNvcnJlY3RhbnN3ZXJdO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRudW0obikge1xuICAgIHJldHVybiAoTWF0aC5yb3VuZChuICogMTAwKSAvIDEwMCk7XG59XG5cbmZ1bmN0aW9uIGdldERlY2ltYWxQbGFjZXMobikge1xuICAgIGlmIChuICUgMSA9PSAwKSB7XG4gICAgICAgIHJldHVybiAwO1xuICAgIH0gZWxzZSBpZiAobiAqIDEwICUgMSA9PSAwKSB7XG4gICAgICAgIHJldHVybiAxO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiAyO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZGl2aWRlc2FsbChsLCBkKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChwYXJzZUZsb2F0KGxbaV0pICUgZCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xufVxuXG5cbmdldEpTT04oXCIvbWVkaWEvZG90YS1qc29uL2hlcm9kYXRhLmpzb25cIiwgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICBoZXJvZGF0YSA9IGRhdGE7XG4gICAgdmFyIGFiaWxpdHkgPSBbXTtcbiAgICB2YXIgYWJpbGl0eWRhdGEgPSB7fTtcbiAgICB2YXIgYWJpbGl0eV9pbmNsdWRlID0gW1wiaW52b2tlcl9jb2xkX3NuYXBcIiwgXCJpbnZva2VyX2dob3N0X3dhbGtcIiwgXCJpbnZva2VyX3Rvcm5hZG9cIiwgXCJpbnZva2VyX2VtcFwiLCBcImludm9rZXJfYWxhY3JpdHlcIiwgXCJpbnZva2VyX2NoYW9zX21ldGVvclwiLCBcImludm9rZXJfc3VuX3N0cmlrZVwiLCBcImludm9rZXJfZm9yZ2Vfc3Bpcml0XCIsIFwiaW52b2tlcl9pY2Vfd2FsbFwiLCBcImludm9rZXJfZGVhZmVuaW5nX2JsYXN0XCIsIFwia2VlcGVyX29mX3RoZV9saWdodF9yZWNhbGxcIiwgXCJrZWVwZXJfb2ZfdGhlX2xpZ2h0X2JsaW5kaW5nX2xpZ2h0XCIsIFwibG9uZV9kcnVpZF90cnVlX2Zvcm1fYmF0dGxlX2NyeVwiXTtcbiAgICBmb3IgKGggaW4gaGVyb2RhdGEpIHtcbiAgICAgICAgdmFyIGFiaWxpdGllcyA9IGhlcm9kYXRhW2hdLmFiaWxpdGllcy5tYXAoZnVuY3Rpb24gKGEpIHtcbiAgICAgICAgICAgIHJldHVybiBhLm5hbWU7XG4gICAgICAgIH0pO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFiaWxpdGllcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIGEgPSBoZXJvZGF0YVtoXS5hYmlsaXRpZXMuZmlsdGVyKGZ1bmN0aW9uIChhYmlsaXR5KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGFiaWxpdHkubmFtZSA9IGFiaWxpdGllc1tpXTtcbiAgICAgICAgICAgIH0pWzBdO1xuICAgICAgICAgICAgaWYgKGEubmFtZSAhPSBcImF0dHJpYnV0ZV9ib251c1wiICYmIGEuZGlzcGxheW5hbWUgJiYgYS5kaXNwbGF5bmFtZSAhPSAnJykge1xuICAgICAgICAgICAgICAgIGlmICghKGFiaWxpdGllc1tpXSBpbiBhYmlsaXR5ZGF0YSkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKChhLmJlaGF2aW9yLmluZGV4T2YoXCJET1RBX0FCSUxJVFlfQkVIQVZJT1JfTk9UX0xFQVJOQUJMRVwiKSA9PSAtMSAmJiBhLmJlaGF2aW9yLmluZGV4T2YoXCJET1RBX0FCSUxJVFlfQkVIQVZJT1JfSElEREVOXCIpID09IC0xKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgKGFiaWxpdHlfaW5jbHVkZS5pbmRleE9mKGEubmFtZSkgIT0gLTEpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhYmlsaXR5LnB1c2goYS5uYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFiaWxpdHlkYXRhW2EubmFtZV0gPSBhO1xuICAgICAgICAgICAgICAgICAgICAgICAgYWJpbGl0eWRhdGFbYS5uYW1lXS5oZXJvID0gaDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBpdGVtcyA9IGFiaWxpdHk7XG4gICAgaXRlbW5hbWVzID0gYWJpbGl0eWRhdGE7XG4gICAgLy9jb25zb2xlLmxvZyhpdGVtcylcbiAgICAvL2NvbnNvbGUubG9nKGl0ZW1uYW1lcylcbiAgICBbXS5mb3JFYWNoLmNhbGwoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmJ0bicpLCBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICBpZiAoZXZlbnQuY3VycmVudFRhcmdldC5pZCA9PSAnc3RhcnQnKSB7XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnY2xpY2snKTtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3RhcnRfY29udGFpbmVyJykuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncXVlc3Rpb25fY29udGFpbmVyJykuc3R5bGUuZGlzcGxheSA9ICcnO1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzY29yZV9jb250YWluZXInKS5zdHlsZS5kaXNwbGF5ID0gJyc7XG4gICAgICAgICAgICAgICAgaXRlbXNfc2h1ZmZsZWQgPSBzaHVmZmxlKGl0ZW1zLnNsaWNlKDApKTtcbiAgICAgICAgICAgICAgICBwcm9ncmVzcyA9IDA7XG4gICAgICAgICAgICAgICAgc3RyZWFrID0gMDtcbiAgICAgICAgICAgICAgICBjb3JyZWN0ID0gMDtcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKGl0ZW1zX3NodWZmbGVkKTtcbiAgICAgICAgICAgICAgICBnZW5lcmF0ZVF1ZXN0aW9uKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKGFuc3dlcnZhbCk7XG4gICAgICAgICAgICAgICAgaWYgKGVsZW1lbnQuaW5uZXJIVE1MID09IGFuc3dlcnZhbCkge1xuICAgICAgICAgICAgICAgICAgICBzdHJlYWsgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgY29ycmVjdCArPSAxO1xuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYW5zX21zZycpLmlubmVySFRNTCA9ICc8aDM+PHNwYW4gY2xhc3M9XFxcImxhYmVsIGxhYmVsLXN1Y2Nlc3NcXFwiPkNvcnJlY3QhPC9zcGFuPjwvaDM+JztcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYW5zX21zZycpLmlubmVySFRNTCA9ICc8aDM+PHNwYW4gY2xhc3M9XFxcImxhYmVsIGxhYmVsLWRhbmdlclxcXCI+V3JvbmchICcgKyBhbnN3ZXJ2YWwgKyAnPC9zcGFuPjwvaDM+JztcbiAgICAgICAgICAgICAgICAgICAgc3RyZWFrID0gMDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLyppZiAoc3RyZWFrID4gbG9uZ2VzdHN0cmVhaykge1xuICAgICAgICAgICAgICAgICAgICBsb25nZXN0c3RyZWFrID0gc3RyZWFrO1xuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbG9uZ2VzdHN0cmVhaycpLmlubmVySFRNTCA9ICdMb25nZXN0IFN0cmVhazogJyArIGxvbmdlc3RzdHJlYWs7XG4gICAgICAgICAgICAgICAgfSovXG4gICAgICAgICAgICAgICAgcHJvZ3Jlc3MrPTE7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Fuc19tc2cnKS5zdHlsZS5kaXNwbGF5ID0gJyc7XG4gICAgICAgICAgICAgICAgZmFkZU91dChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYW5zX21zZycpKTtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3RyZWFrJykuaW5uZXJIVE1MID0gJ0N1cnJlbnQgU3RyZWFrOiAnICsgc3RyZWFrO1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb3JyZWN0JykuaW5uZXJIVE1MID0gJ0NvcnJlY3Q6ICcgKyBjb3JyZWN0O1xuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgZXZlbnQuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKClcbiAgICAgICAgICAgICAgICBlbGVtZW50LmJsdXIoKTtcbiAgICAgICAgICAgICAgICBnZW5lcmF0ZVF1ZXN0aW9uKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncHJvZ3Jlc3MnKS5pbm5lckhUTUwgPSAnUHJvZ3Jlc3M6ICcgKyAocHJvZ3Jlc3MrMSkgKyAnLzI1JztcbiAgICAgICAgICAgIGlmIChwcm9ncmVzcyA9PSAyNSkge1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwcm9ncmVzcycpLmlubmVySFRNTCA9ICdGaW5hbCBTY29yZTogJyArIGNvcnJlY3QgKyAnLzI1JztcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29ycmVjdCcpLmlubmVySFRNTCA9ICcnO1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdGFydCcpLmlubmVySFRNTCA9ICdQbGF5IEFnYWluJztcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3RhcnRfY29udGFpbmVyJykuc3R5bGUuZGlzcGxheSA9ICcnO1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdxdWVzdGlvbl9jb250YWluZXInKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9KTtcbn0pOyJdfQ==
