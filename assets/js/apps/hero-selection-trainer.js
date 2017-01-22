require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({31:[function(require,module,exports){
var $ = jQuery = require('jquery');
require('bootstrap');
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
},{"../util/shuffle":52,"bootstrap":1,"jquery":24}]},{},[31])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYXBwcy9oZXJvLXNlbGVjdGlvbi10cmFpbmVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyICQgPSBqUXVlcnkgPSByZXF1aXJlKCdqcXVlcnknKTtcbnJlcXVpcmUoJ2Jvb3RzdHJhcCcpO1xudmFyIHNodWZmbGUgPSByZXF1aXJlKCcuLi91dGlsL3NodWZmbGUnKTtcblxuJChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGhlcm9kYXRhLCBpdGVtcztcbiAgICBcbiAgICAkLndoZW4oXG4gICAgICAgICQuZ2V0SlNPTihcIi9tZWRpYS9kb3RhLWpzb24vaGVyb2RhdGEuanNvblwiLCBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgaGVyb2RhdGEgPSBkYXRhO1xuICAgICAgICB9KSxcbiAgICAgICAgJC5nZXRKU09OKFwiL21lZGlhL2RvdGEtanNvbi9oZXJvZXMuanNvblwiLCBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgaXRlbXMgPSBkYXRhLmRhdGE7XG4gICAgICAgIH0pXG4gICAgKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGl0ZW1uYW1lcyA9IHt9O1xuICAgICAgICBmb3IgKHZhciBpPTA7aTxpdGVtcy5sZW5ndGg7aSsrKSB7XG4gICAgICAgICAgICBpdGVtbmFtZXNbaXRlbXNbaV1dID0gaGVyb2RhdGFbJ25wY19kb3RhX2hlcm9fJyArIGl0ZW1zW2ldXS5kaXNwbGF5bmFtZVxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGl0ZW1zX3NodWZmbGVkO1xuICAgICAgICB2YXIgYW5zd2VyID0gMDtcbiAgICAgICAgdmFyIHN0cmVhayA9IDA7XG4gICAgICAgIHZhciBsb25nZXN0c3RyZWFrID0gMDtcbiAgICAgICAgdmFyIGluY29ycmVjdCA9IDA7XG4gICAgICAgIHZhciBzdGFydDtcbiAgICAgICAgdmFyIGVuZDtcbiAgICAgICAgdmFyIHN0YXRlID0gMDtcbiAgICAgICAgdmFyIG1pbnV0ZXNMYWJlbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWludXRlc1wiKTtcbiAgICAgICAgdmFyIHNlY29uZHNMYWJlbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic2Vjb25kc1wiKTtcbiAgICAgICAgdmFyIGh1bmRyZWR0aHNlY29uZHNMYWJlbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiaHVuZHJlZHRoc2Vjb25kc1wiKTtcbiAgICAgICAgdmFyIHRvdGFsSHVuZHJlZHRoU2Vjb25kcyA9IDA7XG4gICAgICAgIHZhciB0aW1lcjtcbiAgICAgICAgXG4gICAgICAgIGZ1bmN0aW9uIGRlYnVnKCkge1xuICAgICAgICAgICAgZm9yICh2YXIgaT0wO2k8aXRlbXMubGVuZ3RoO2krKykge1xuICAgICAgICAgICAgICAgICQoJyNoXycgKyBpdGVtc1tpXSkudGV4dChpdGVtc1tpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy9kZWJ1ZygpO1xuXG4gICAgICAgIGZ1bmN0aW9uIHN0YXJ0KCkge1xuICAgICAgICAgICAgaXRlbXNfc2h1ZmZsZWQgPSBzaHVmZmxlKGl0ZW1zLnNsaWNlKDApKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGl0ZW1zX3NodWZmbGVkKTtcbiAgICAgICAgICAgIHN0cmVhayA9IDA7XG4gICAgICAgICAgICBsb25nZXN0c3RyZWFrID0gMDtcbiAgICAgICAgICAgIGluY29ycmVjdCA9IDA7XG4gICAgICAgICAgICBzdGF0ZSA9IDE7XG4gICAgICAgICAgICB0b3RhbEh1bmRyZWR0aFNlY29uZHMgPSAwO1xuICAgICAgICAgICAgc3RhcnRUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICAgICAgICBzZXRUaW1lKCk7XG4gICAgICAgICAgICB0aW1lciA9IHNldEludGVydmFsKHNldFRpbWUsIDEwMCk7XG4gICAgICAgICAgICAkKCcjc3RhcnQnKS5oaWRlKCk7XG4gICAgICAgICAgICAkKCcjc3RvcCcpLnNob3coKTtcbiAgICAgICAgICAgIGdlbmVyYXRlUXVlc3Rpb24oKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGdlbmVyYXRlUXVlc3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoaXRlbXNfc2h1ZmZsZWQubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGFuc3dlciA9IGl0ZW1zX3NodWZmbGVkLnBvcCgpO1xuICAgICAgICAgICAgICAgICQoJyNoZXJvX25hbWUnKS50ZXh0KGl0ZW1uYW1lc1thbnN3ZXJdKTtcbiAgICAgICAgICAgICAgICAkKCcjcHJvZ3Jlc3MnKS50ZXh0KCdQcm9ncmVzczogJyArIChpdGVtcy5sZW5ndGgtaXRlbXNfc2h1ZmZsZWQubGVuZ3RoKSArICcvJyArIGl0ZW1zLmxlbmd0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBlbmQoKVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gZW5kKCkge1xuICAgICAgICAgICAgJCgnI2hlcm9fbmFtZScpLnRleHQoJycpO1xuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbCh0aW1lcik7XG4gICAgICAgICAgICBhbnN3ZXIgPSAnJztcbiAgICAgICAgICAgIHN0YXRlID0gMDtcbiAgICAgICAgICAgICQoJyNzdGFydCcpLnNob3coKTtcbiAgICAgICAgICAgICQoJyNzdG9wJykuaGlkZSgpO1xuICAgICAgICAgICAgZW5kVGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgICAgICAgICAgaHVuZHJlZHRoc2Vjb25kc0xhYmVsLmlubmVySFRNTCA9IChlbmRUaW1lLXN0YXJ0VGltZSklMTAwMDtcbiAgICAgICAgICAgIHNlY29uZHNMYWJlbC5pbm5lckhUTUwgPSBwYWQoTWF0aC5mbG9vcigoKGVuZFRpbWUtc3RhcnRUaW1lKS8xMDAwKSU2MCkpO1xuICAgICAgICAgICAgbWludXRlc0xhYmVsLmlubmVySFRNTCA9IHBhZChwYXJzZUludCgoKGVuZFRpbWUtc3RhcnRUaW1lKS8xMDAwKS82MCkpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAkKCcjc3RhcnQnKS5jbGljayhmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHN0YXJ0KCk7XG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgJCgnI3N0b3AnKS5jbGljayhmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICQodGhpcykuaGlkZSgpO1xuICAgICAgICAgICAgZW5kKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgICQoJy5oZXJvJykuY2xpY2soZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoc3RhdGUpIHtcbiAgICAgICAgICAgICAgICBpZiAoYW5zd2VyID09ICQodGhpcykuYXR0cignaWQnKS5zdWJzdHJpbmcoMikpIHtcbiAgICAgICAgICAgICAgICAgICAgc3RyZWFrICs9IDE7XG4gICAgICAgICAgICAgICAgICAgIGdlbmVyYXRlUXVlc3Rpb24oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGluY29ycmVjdCArPSAxO1xuICAgICAgICAgICAgICAgICAgICBzdHJlYWsgPSAwO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoc3RyZWFrID4gbG9uZ2VzdHN0cmVhaykge1xuICAgICAgICAgICAgICAgICAgICBsb25nZXN0c3RyZWFrID0gc3RyZWFrO1xuICAgICAgICAgICAgICAgICAgICAkKCcjbG9uZ2VzdHN0cmVhaycpLnRleHQoJ0xvbmdlc3QgU3RyZWFrOiAnICsgbG9uZ2VzdHN0cmVhayk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICQoJyNzdHJlYWsnKS50ZXh0KCdDdXJyZW50IFN0cmVhazogJyArIHN0cmVhayk7XG4gICAgICAgICAgICAgICAgJCgnI2luY29ycmVjdCcpLnRleHQoJ0luY29ycmVjdDogJyArIGluY29ycmVjdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1x0XG5cbiAgICAgICAgJCgnI2xheW91dCcpLmNoYW5nZSh1cGRhdGVMYXlvdXQpO1xuICAgICAgICBcbiAgICAgICAgZnVuY3Rpb24gdXBkYXRlTGF5b3V0KCkge1xuICAgICAgICAgIGlmICgkKCcjbGF5b3V0JykudmFsKCkgPT0gJ25vcm1hbCcpIHtcbiAgICAgICAgICAgICAgJCgnLmhlcm9fd3JhcHBlcicpLnJlbW92ZUNsYXNzKCdjb2wtbWQtOScpO1xuICAgICAgICAgICAgICAkKCcuaGVyb193cmFwcGVyJykuYWRkQ2xhc3MoJ2NvbC1tZC0xMicpO1xuICAgICAgICAgICAgICAkKCcuaGVyb19wYWdlJykucmVtb3ZlQ2xhc3MoJ3JvdycpO1xuICAgICAgICAgICAgICAkKCcuaGVyb19wYWdlJykuYWRkQ2xhc3MoJ2NvbC1tZC00Jyk7XG4gICAgICAgICAgICAgICQoJy5oZXJvX3NlY3Rpb24nKS5yZW1vdmVDbGFzcygnY29sLW1kLTYnKTtcbiAgICAgICAgICAgICAgJCgnI2luZm8nKS5yZW1vdmVDbGFzcygnY29sLW1kLTMnKTtcbiAgICAgICAgICAgICAgJCgnI2luZm8nKS5hZGRDbGFzcygnY29sLW1kLTEyJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2UgaWYgKCQoJyNsYXlvdXQnKS52YWwoKSA9PSAnY2FwdGFpbicpIHtcbiAgICAgICAgICAgICAgJCgnLmhlcm9fd3JhcHBlcicpLnJlbW92ZUNsYXNzKCdjb2wtbWQtMTInKTtcbiAgICAgICAgICAgICAgJCgnLmhlcm9fd3JhcHBlcicpLmFkZENsYXNzKCdjb2wtbWQtOScpO1xuICAgICAgICAgICAgICAkKCcuaGVyb19wYWdlJykucmVtb3ZlQ2xhc3MoJ2NvbC1tZC00Jyk7XG4gICAgICAgICAgICAgICQoJy5oZXJvX3BhZ2UnKS5hZGRDbGFzcygncm93Jyk7XG4gICAgICAgICAgICAgICQoJy5oZXJvX3NlY3Rpb24nKS5hZGRDbGFzcygnY29sLW1kLTYnKTtcbiAgICAgICAgICAgICAgJCgnI2luZm8nKS5hZGRDbGFzcygnY29sLW1kLTMnKTtcbiAgICAgICAgICAgICAgJCgnI2luZm8nKS5yZW1vdmVDbGFzcygnY29sLW1kLTEyJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB1cGRhdGVMYXlvdXQoKTtcbiAgICAgICAgXG4gICAgICAgIGZ1bmN0aW9uIHNldFRpbWUoKVxuICAgICAgICB7XG4gICAgICAgICAgICArK3RvdGFsSHVuZHJlZHRoU2Vjb25kcztcbiAgICAgICAgICAgIGh1bmRyZWR0aHNlY29uZHNMYWJlbC5pbm5lckhUTUwgPSB0b3RhbEh1bmRyZWR0aFNlY29uZHMlMTA7XG4gICAgICAgICAgICBzZWNvbmRzTGFiZWwuaW5uZXJIVE1MID0gcGFkKE1hdGguZmxvb3IoKHRvdGFsSHVuZHJlZHRoU2Vjb25kcy8xMCklNjApKTtcbiAgICAgICAgICAgIG1pbnV0ZXNMYWJlbC5pbm5lckhUTUwgPSBwYWQocGFyc2VJbnQoKHRvdGFsSHVuZHJlZHRoU2Vjb25kcy8xMCkvNjApKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIHBhZCh2YWwpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHZhciB2YWxTdHJpbmcgPSB2YWwgKyBcIlwiO1xuICAgICAgICAgICAgaWYodmFsU3RyaW5nLmxlbmd0aCA8IDIpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiMFwiICsgdmFsU3RyaW5nO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWxTdHJpbmc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICBcbiAgICB9KTtcbn0pOyJdfQ==
