require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({20:[function(require,module,exports){
var $ = require('jquery');
var shuffle = require('../util/shuffle');

$(function () {
    var herodata, items;
    
    $.when(
        $.getJSON("/media/dota-json/herodata.json", function (data) {
            herodata = data;
        }),
        $.getJSON("/media/dota-json/heroes.json", function (data) {
            items = data.data;
        })
    ).then(function () {
        var itemnames = {};
        for (var i=0;i<items.length;i++) {
            itemnames[items[i]] = herodata['npc_dota_hero_' + items[i]].displayname
        }

        var items_shuffled;
        var answer = 0;
        var streak = 0;
        var longeststreak = 0;
        var incorrect = 0;
        var start;
        var end;
        var state = 0;
        var minutesLabel = document.getElementById("minutes");
        var secondsLabel = document.getElementById("seconds");
        var hundredthsecondsLabel = document.getElementById("hundredthseconds");
        var totalHundredthSeconds = 0;
        var timer;
        
        function debug() {
            for (var i=0;i<items.length;i++) {
                $('#h_' + items[i]).text(items[i]);
            }
        }
        //debug();

        function start() {
            items_shuffled = shuffle(items.slice(0));
            console.log(items_shuffled);
            streak = 0;
            longeststreak = 0;
            incorrect = 0;
            state = 1;
            totalHundredthSeconds = 0;
            startTime = new Date().getTime();
            setTime();
            timer = setInterval(setTime, 100);
            $('#start').hide();
            $('#stop').show();
            generateQuestion();
        }

        function generateQuestion() {
            if (items_shuffled.length > 0) {
                answer = items_shuffled.pop();
                $('#hero_name').text(itemnames[answer]);
                $('#progress').text('Progress: ' + (items.length-items_shuffled.length) + '/' + items.length);
            }
            else {
                end()
            }
        }

        function end() {
            $('#hero_name').text('');
            clearInterval(timer);
            answer = '';
            state = 0;
            $('#start').show();
            $('#stop').hide();
            endTime = new Date().getTime();
            hundredthsecondsLabel.innerHTML = (endTime-startTime)%1000;
            secondsLabel.innerHTML = pad(Math.floor(((endTime-startTime)/1000)%60));
            minutesLabel.innerHTML = pad(parseInt(((endTime-startTime)/1000)/60));
        }
        
        $('#start').click(function() {
            start();
        });
        
        $('#stop').click(function() {
            $(this).hide();
            end();
        });

        $('.hero').click(function() {
            if (state) {
                if (answer == $(this).attr('id').substring(2)) {
                    streak += 1;
                    generateQuestion();
                }
                else {
                    incorrect += 1;
                    streak = 0;
                }
                if (streak > longeststreak) {
                    longeststreak = streak;
                    $('#longeststreak').text('Longest Streak: ' + longeststreak);
                }
                $('#streak').text('Current Streak: ' + streak);
                $('#incorrect').text('Incorrect: ' + incorrect);
            }
        });	

        $('#layout').change(updateLayout);
        
        function updateLayout() {
          if ($('#layout').val() == 'normal') {
              $('.hero_wrapper').removeClass('col-md-9');
              $('.hero_wrapper').addClass('col-md-12');
              $('.hero_page').removeClass('row');
              $('.hero_page').addClass('col-md-4');
              $('.hero_section').removeClass('col-md-6');
              $('#info').removeClass('col-md-3');
              $('#info').addClass('col-md-12');
          }
          else if ($('#layout').val() == 'captain') {
              $('.hero_wrapper').removeClass('col-md-12');
              $('.hero_wrapper').addClass('col-md-9');
              $('.hero_page').removeClass('col-md-4');
              $('.hero_page').addClass('row');
              $('.hero_section').addClass('col-md-6');
              $('#info').addClass('col-md-3');
              $('#info').removeClass('col-md-12');
          }
        }
        
        updateLayout();
        
        function setTime()
        {
            ++totalHundredthSeconds;
            hundredthsecondsLabel.innerHTML = totalHundredthSeconds%10;
            secondsLabel.innerHTML = pad(Math.floor((totalHundredthSeconds/10)%60));
            minutesLabel.innerHTML = pad(parseInt((totalHundredthSeconds/10)/60));
        }

        function pad(val)
        {
            var valString = val + "";
            if(valString.length < 2)
            {
                return "0" + valString;
            }
            else
            {
                return valString;
            }
        }
    
    });
});
},{"../util/shuffle":34,"jquery":14}]},{},[20])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYXBwcy9oZXJvLXNlbGVjdGlvbi10cmFpbmVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciAkID0gcmVxdWlyZSgnanF1ZXJ5Jyk7XG52YXIgc2h1ZmZsZSA9IHJlcXVpcmUoJy4uL3V0aWwvc2h1ZmZsZScpO1xuXG4kKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgaGVyb2RhdGEsIGl0ZW1zO1xuICAgIFxuICAgICQud2hlbihcbiAgICAgICAgJC5nZXRKU09OKFwiL21lZGlhL2RvdGEtanNvbi9oZXJvZGF0YS5qc29uXCIsIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICBoZXJvZGF0YSA9IGRhdGE7XG4gICAgICAgIH0pLFxuICAgICAgICAkLmdldEpTT04oXCIvbWVkaWEvZG90YS1qc29uL2hlcm9lcy5qc29uXCIsIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICBpdGVtcyA9IGRhdGEuZGF0YTtcbiAgICAgICAgfSlcbiAgICApLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgaXRlbW5hbWVzID0ge307XG4gICAgICAgIGZvciAodmFyIGk9MDtpPGl0ZW1zLmxlbmd0aDtpKyspIHtcbiAgICAgICAgICAgIGl0ZW1uYW1lc1tpdGVtc1tpXV0gPSBoZXJvZGF0YVsnbnBjX2RvdGFfaGVyb18nICsgaXRlbXNbaV1dLmRpc3BsYXluYW1lXG4gICAgICAgIH1cblxuICAgICAgICB2YXIgaXRlbXNfc2h1ZmZsZWQ7XG4gICAgICAgIHZhciBhbnN3ZXIgPSAwO1xuICAgICAgICB2YXIgc3RyZWFrID0gMDtcbiAgICAgICAgdmFyIGxvbmdlc3RzdHJlYWsgPSAwO1xuICAgICAgICB2YXIgaW5jb3JyZWN0ID0gMDtcbiAgICAgICAgdmFyIHN0YXJ0O1xuICAgICAgICB2YXIgZW5kO1xuICAgICAgICB2YXIgc3RhdGUgPSAwO1xuICAgICAgICB2YXIgbWludXRlc0xhYmVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtaW51dGVzXCIpO1xuICAgICAgICB2YXIgc2Vjb25kc0xhYmVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzZWNvbmRzXCIpO1xuICAgICAgICB2YXIgaHVuZHJlZHRoc2Vjb25kc0xhYmVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJodW5kcmVkdGhzZWNvbmRzXCIpO1xuICAgICAgICB2YXIgdG90YWxIdW5kcmVkdGhTZWNvbmRzID0gMDtcbiAgICAgICAgdmFyIHRpbWVyO1xuICAgICAgICBcbiAgICAgICAgZnVuY3Rpb24gZGVidWcoKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpPTA7aTxpdGVtcy5sZW5ndGg7aSsrKSB7XG4gICAgICAgICAgICAgICAgJCgnI2hfJyArIGl0ZW1zW2ldKS50ZXh0KGl0ZW1zW2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvL2RlYnVnKCk7XG5cbiAgICAgICAgZnVuY3Rpb24gc3RhcnQoKSB7XG4gICAgICAgICAgICBpdGVtc19zaHVmZmxlZCA9IHNodWZmbGUoaXRlbXMuc2xpY2UoMCkpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coaXRlbXNfc2h1ZmZsZWQpO1xuICAgICAgICAgICAgc3RyZWFrID0gMDtcbiAgICAgICAgICAgIGxvbmdlc3RzdHJlYWsgPSAwO1xuICAgICAgICAgICAgaW5jb3JyZWN0ID0gMDtcbiAgICAgICAgICAgIHN0YXRlID0gMTtcbiAgICAgICAgICAgIHRvdGFsSHVuZHJlZHRoU2Vjb25kcyA9IDA7XG4gICAgICAgICAgICBzdGFydFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICAgICAgICAgIHNldFRpbWUoKTtcbiAgICAgICAgICAgIHRpbWVyID0gc2V0SW50ZXJ2YWwoc2V0VGltZSwgMTAwKTtcbiAgICAgICAgICAgICQoJyNzdGFydCcpLmhpZGUoKTtcbiAgICAgICAgICAgICQoJyNzdG9wJykuc2hvdygpO1xuICAgICAgICAgICAgZ2VuZXJhdGVRdWVzdGlvbigpO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gZ2VuZXJhdGVRdWVzdGlvbigpIHtcbiAgICAgICAgICAgIGlmIChpdGVtc19zaHVmZmxlZC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgYW5zd2VyID0gaXRlbXNfc2h1ZmZsZWQucG9wKCk7XG4gICAgICAgICAgICAgICAgJCgnI2hlcm9fbmFtZScpLnRleHQoaXRlbW5hbWVzW2Fuc3dlcl0pO1xuICAgICAgICAgICAgICAgICQoJyNwcm9ncmVzcycpLnRleHQoJ1Byb2dyZXNzOiAnICsgKGl0ZW1zLmxlbmd0aC1pdGVtc19zaHVmZmxlZC5sZW5ndGgpICsgJy8nICsgaXRlbXMubGVuZ3RoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGVuZCgpXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBlbmQoKSB7XG4gICAgICAgICAgICAkKCcjaGVyb19uYW1lJykudGV4dCgnJyk7XG4gICAgICAgICAgICBjbGVhckludGVydmFsKHRpbWVyKTtcbiAgICAgICAgICAgIGFuc3dlciA9ICcnO1xuICAgICAgICAgICAgc3RhdGUgPSAwO1xuICAgICAgICAgICAgJCgnI3N0YXJ0Jykuc2hvdygpO1xuICAgICAgICAgICAgJCgnI3N0b3AnKS5oaWRlKCk7XG4gICAgICAgICAgICBlbmRUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICAgICAgICBodW5kcmVkdGhzZWNvbmRzTGFiZWwuaW5uZXJIVE1MID0gKGVuZFRpbWUtc3RhcnRUaW1lKSUxMDAwO1xuICAgICAgICAgICAgc2Vjb25kc0xhYmVsLmlubmVySFRNTCA9IHBhZChNYXRoLmZsb29yKCgoZW5kVGltZS1zdGFydFRpbWUpLzEwMDApJTYwKSk7XG4gICAgICAgICAgICBtaW51dGVzTGFiZWwuaW5uZXJIVE1MID0gcGFkKHBhcnNlSW50KCgoZW5kVGltZS1zdGFydFRpbWUpLzEwMDApLzYwKSk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgICQoJyNzdGFydCcpLmNsaWNrKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgc3RhcnQoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICAkKCcjc3RvcCcpLmNsaWNrKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgJCh0aGlzKS5oaWRlKCk7XG4gICAgICAgICAgICBlbmQoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJCgnLmhlcm8nKS5jbGljayhmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmIChzdGF0ZSkge1xuICAgICAgICAgICAgICAgIGlmIChhbnN3ZXIgPT0gJCh0aGlzKS5hdHRyKCdpZCcpLnN1YnN0cmluZygyKSkge1xuICAgICAgICAgICAgICAgICAgICBzdHJlYWsgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgZ2VuZXJhdGVRdWVzdGlvbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaW5jb3JyZWN0ICs9IDE7XG4gICAgICAgICAgICAgICAgICAgIHN0cmVhayA9IDA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChzdHJlYWsgPiBsb25nZXN0c3RyZWFrKSB7XG4gICAgICAgICAgICAgICAgICAgIGxvbmdlc3RzdHJlYWsgPSBzdHJlYWs7XG4gICAgICAgICAgICAgICAgICAgICQoJyNsb25nZXN0c3RyZWFrJykudGV4dCgnTG9uZ2VzdCBTdHJlYWs6ICcgKyBsb25nZXN0c3RyZWFrKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgJCgnI3N0cmVhaycpLnRleHQoJ0N1cnJlbnQgU3RyZWFrOiAnICsgc3RyZWFrKTtcbiAgICAgICAgICAgICAgICAkKCcjaW5jb3JyZWN0JykudGV4dCgnSW5jb3JyZWN0OiAnICsgaW5jb3JyZWN0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XHRcblxuICAgICAgICAkKCcjbGF5b3V0JykuY2hhbmdlKHVwZGF0ZUxheW91dCk7XG4gICAgICAgIFxuICAgICAgICBmdW5jdGlvbiB1cGRhdGVMYXlvdXQoKSB7XG4gICAgICAgICAgaWYgKCQoJyNsYXlvdXQnKS52YWwoKSA9PSAnbm9ybWFsJykge1xuICAgICAgICAgICAgICAkKCcuaGVyb193cmFwcGVyJykucmVtb3ZlQ2xhc3MoJ2NvbC1tZC05Jyk7XG4gICAgICAgICAgICAgICQoJy5oZXJvX3dyYXBwZXInKS5hZGRDbGFzcygnY29sLW1kLTEyJyk7XG4gICAgICAgICAgICAgICQoJy5oZXJvX3BhZ2UnKS5yZW1vdmVDbGFzcygncm93Jyk7XG4gICAgICAgICAgICAgICQoJy5oZXJvX3BhZ2UnKS5hZGRDbGFzcygnY29sLW1kLTQnKTtcbiAgICAgICAgICAgICAgJCgnLmhlcm9fc2VjdGlvbicpLnJlbW92ZUNsYXNzKCdjb2wtbWQtNicpO1xuICAgICAgICAgICAgICAkKCcjaW5mbycpLnJlbW92ZUNsYXNzKCdjb2wtbWQtMycpO1xuICAgICAgICAgICAgICAkKCcjaW5mbycpLmFkZENsYXNzKCdjb2wtbWQtMTInKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSBpZiAoJCgnI2xheW91dCcpLnZhbCgpID09ICdjYXB0YWluJykge1xuICAgICAgICAgICAgICAkKCcuaGVyb193cmFwcGVyJykucmVtb3ZlQ2xhc3MoJ2NvbC1tZC0xMicpO1xuICAgICAgICAgICAgICAkKCcuaGVyb193cmFwcGVyJykuYWRkQ2xhc3MoJ2NvbC1tZC05Jyk7XG4gICAgICAgICAgICAgICQoJy5oZXJvX3BhZ2UnKS5yZW1vdmVDbGFzcygnY29sLW1kLTQnKTtcbiAgICAgICAgICAgICAgJCgnLmhlcm9fcGFnZScpLmFkZENsYXNzKCdyb3cnKTtcbiAgICAgICAgICAgICAgJCgnLmhlcm9fc2VjdGlvbicpLmFkZENsYXNzKCdjb2wtbWQtNicpO1xuICAgICAgICAgICAgICAkKCcjaW5mbycpLmFkZENsYXNzKCdjb2wtbWQtMycpO1xuICAgICAgICAgICAgICAkKCcjaW5mbycpLnJlbW92ZUNsYXNzKCdjb2wtbWQtMTInKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHVwZGF0ZUxheW91dCgpO1xuICAgICAgICBcbiAgICAgICAgZnVuY3Rpb24gc2V0VGltZSgpXG4gICAgICAgIHtcbiAgICAgICAgICAgICsrdG90YWxIdW5kcmVkdGhTZWNvbmRzO1xuICAgICAgICAgICAgaHVuZHJlZHRoc2Vjb25kc0xhYmVsLmlubmVySFRNTCA9IHRvdGFsSHVuZHJlZHRoU2Vjb25kcyUxMDtcbiAgICAgICAgICAgIHNlY29uZHNMYWJlbC5pbm5lckhUTUwgPSBwYWQoTWF0aC5mbG9vcigodG90YWxIdW5kcmVkdGhTZWNvbmRzLzEwKSU2MCkpO1xuICAgICAgICAgICAgbWludXRlc0xhYmVsLmlubmVySFRNTCA9IHBhZChwYXJzZUludCgodG90YWxIdW5kcmVkdGhTZWNvbmRzLzEwKS82MCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gcGFkKHZhbClcbiAgICAgICAge1xuICAgICAgICAgICAgdmFyIHZhbFN0cmluZyA9IHZhbCArIFwiXCI7XG4gICAgICAgICAgICBpZih2YWxTdHJpbmcubGVuZ3RoIDwgMilcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gXCIwXCIgKyB2YWxTdHJpbmc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbFN0cmluZztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIFxuICAgIH0pO1xufSk7Il19
