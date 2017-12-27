require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({19:[function(require,module,exports){
(function (global){
var $ = jQuery = (typeof window !== "undefined" ? window['$'] : typeof global !== "undefined" ? global['$'] : null);
//require('bootstrap');
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
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../util/shuffle":41}]},{},[19])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYXBwcy9oZXJvLXNlbGVjdGlvbi10cmFpbmVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciAkID0galF1ZXJ5ID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJyQnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJyQnXSA6IG51bGwpO1xuLy9yZXF1aXJlKCdib290c3RyYXAnKTtcbnZhciBzaHVmZmxlID0gcmVxdWlyZSgnLi4vdXRpbC9zaHVmZmxlJyk7XG5cbiQoZnVuY3Rpb24gKCkge1xuICAgIHZhciBoZXJvZGF0YSwgaXRlbXM7XG4gICAgXG4gICAgJC53aGVuKFxuICAgICAgICAkLmdldEpTT04oXCIvbWVkaWEvZG90YS1qc29uL2hlcm9kYXRhLmpzb25cIiwgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgIGhlcm9kYXRhID0gZGF0YTtcbiAgICAgICAgfSksXG4gICAgICAgICQuZ2V0SlNPTihcIi9tZWRpYS9kb3RhLWpzb24vaGVyb2VzLmpzb25cIiwgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgIGl0ZW1zID0gZGF0YS5kYXRhO1xuICAgICAgICB9KVxuICAgICkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBpdGVtbmFtZXMgPSB7fTtcbiAgICAgICAgZm9yICh2YXIgaT0wO2k8aXRlbXMubGVuZ3RoO2krKykge1xuICAgICAgICAgICAgaXRlbW5hbWVzW2l0ZW1zW2ldXSA9IGhlcm9kYXRhWyducGNfZG90YV9oZXJvXycgKyBpdGVtc1tpXV0uZGlzcGxheW5hbWVcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBpdGVtc19zaHVmZmxlZDtcbiAgICAgICAgdmFyIGFuc3dlciA9IDA7XG4gICAgICAgIHZhciBzdHJlYWsgPSAwO1xuICAgICAgICB2YXIgbG9uZ2VzdHN0cmVhayA9IDA7XG4gICAgICAgIHZhciBpbmNvcnJlY3QgPSAwO1xuICAgICAgICB2YXIgc3RhcnQ7XG4gICAgICAgIHZhciBlbmQ7XG4gICAgICAgIHZhciBzdGF0ZSA9IDA7XG4gICAgICAgIHZhciBtaW51dGVzTGFiZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1pbnV0ZXNcIik7XG4gICAgICAgIHZhciBzZWNvbmRzTGFiZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNlY29uZHNcIik7XG4gICAgICAgIHZhciBodW5kcmVkdGhzZWNvbmRzTGFiZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImh1bmRyZWR0aHNlY29uZHNcIik7XG4gICAgICAgIHZhciB0b3RhbEh1bmRyZWR0aFNlY29uZHMgPSAwO1xuICAgICAgICB2YXIgdGltZXI7XG4gICAgICAgIFxuICAgICAgICBmdW5jdGlvbiBkZWJ1ZygpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGk9MDtpPGl0ZW1zLmxlbmd0aDtpKyspIHtcbiAgICAgICAgICAgICAgICAkKCcjaF8nICsgaXRlbXNbaV0pLnRleHQoaXRlbXNbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vZGVidWcoKTtcblxuICAgICAgICBmdW5jdGlvbiBzdGFydCgpIHtcbiAgICAgICAgICAgIGl0ZW1zX3NodWZmbGVkID0gc2h1ZmZsZShpdGVtcy5zbGljZSgwKSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhpdGVtc19zaHVmZmxlZCk7XG4gICAgICAgICAgICBzdHJlYWsgPSAwO1xuICAgICAgICAgICAgbG9uZ2VzdHN0cmVhayA9IDA7XG4gICAgICAgICAgICBpbmNvcnJlY3QgPSAwO1xuICAgICAgICAgICAgc3RhdGUgPSAxO1xuICAgICAgICAgICAgdG90YWxIdW5kcmVkdGhTZWNvbmRzID0gMDtcbiAgICAgICAgICAgIHN0YXJ0VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgICAgICAgICAgc2V0VGltZSgpO1xuICAgICAgICAgICAgdGltZXIgPSBzZXRJbnRlcnZhbChzZXRUaW1lLCAxMDApO1xuICAgICAgICAgICAgJCgnI3N0YXJ0JykuaGlkZSgpO1xuICAgICAgICAgICAgJCgnI3N0b3AnKS5zaG93KCk7XG4gICAgICAgICAgICBnZW5lcmF0ZVF1ZXN0aW9uKCk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBnZW5lcmF0ZVF1ZXN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKGl0ZW1zX3NodWZmbGVkLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBhbnN3ZXIgPSBpdGVtc19zaHVmZmxlZC5wb3AoKTtcbiAgICAgICAgICAgICAgICAkKCcjaGVyb19uYW1lJykudGV4dChpdGVtbmFtZXNbYW5zd2VyXSk7XG4gICAgICAgICAgICAgICAgJCgnI3Byb2dyZXNzJykudGV4dCgnUHJvZ3Jlc3M6ICcgKyAoaXRlbXMubGVuZ3RoLWl0ZW1zX3NodWZmbGVkLmxlbmd0aCkgKyAnLycgKyBpdGVtcy5sZW5ndGgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgZW5kKClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGVuZCgpIHtcbiAgICAgICAgICAgICQoJyNoZXJvX25hbWUnKS50ZXh0KCcnKTtcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodGltZXIpO1xuICAgICAgICAgICAgYW5zd2VyID0gJyc7XG4gICAgICAgICAgICBzdGF0ZSA9IDA7XG4gICAgICAgICAgICAkKCcjc3RhcnQnKS5zaG93KCk7XG4gICAgICAgICAgICAkKCcjc3RvcCcpLmhpZGUoKTtcbiAgICAgICAgICAgIGVuZFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICAgICAgICAgIGh1bmRyZWR0aHNlY29uZHNMYWJlbC5pbm5lckhUTUwgPSAoZW5kVGltZS1zdGFydFRpbWUpJTEwMDA7XG4gICAgICAgICAgICBzZWNvbmRzTGFiZWwuaW5uZXJIVE1MID0gcGFkKE1hdGguZmxvb3IoKChlbmRUaW1lLXN0YXJ0VGltZSkvMTAwMCklNjApKTtcbiAgICAgICAgICAgIG1pbnV0ZXNMYWJlbC5pbm5lckhUTUwgPSBwYWQocGFyc2VJbnQoKChlbmRUaW1lLXN0YXJ0VGltZSkvMTAwMCkvNjApKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgJCgnI3N0YXJ0JykuY2xpY2soZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBzdGFydCgpO1xuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgICQoJyNzdG9wJykuY2xpY2soZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAkKHRoaXMpLmhpZGUoKTtcbiAgICAgICAgICAgIGVuZCgpO1xuICAgICAgICB9KTtcblxuICAgICAgICAkKCcuaGVybycpLmNsaWNrKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKHN0YXRlKSB7XG4gICAgICAgICAgICAgICAgaWYgKGFuc3dlciA9PSAkKHRoaXMpLmF0dHIoJ2lkJykuc3Vic3RyaW5nKDIpKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0cmVhayArPSAxO1xuICAgICAgICAgICAgICAgICAgICBnZW5lcmF0ZVF1ZXN0aW9uKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpbmNvcnJlY3QgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgc3RyZWFrID0gMDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHN0cmVhayA+IGxvbmdlc3RzdHJlYWspIHtcbiAgICAgICAgICAgICAgICAgICAgbG9uZ2VzdHN0cmVhayA9IHN0cmVhaztcbiAgICAgICAgICAgICAgICAgICAgJCgnI2xvbmdlc3RzdHJlYWsnKS50ZXh0KCdMb25nZXN0IFN0cmVhazogJyArIGxvbmdlc3RzdHJlYWspO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAkKCcjc3RyZWFrJykudGV4dCgnQ3VycmVudCBTdHJlYWs6ICcgKyBzdHJlYWspO1xuICAgICAgICAgICAgICAgICQoJyNpbmNvcnJlY3QnKS50ZXh0KCdJbmNvcnJlY3Q6ICcgKyBpbmNvcnJlY3QpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcdFxuXG4gICAgICAgICQoJyNsYXlvdXQnKS5jaGFuZ2UodXBkYXRlTGF5b3V0KTtcbiAgICAgICAgXG4gICAgICAgIGZ1bmN0aW9uIHVwZGF0ZUxheW91dCgpIHtcbiAgICAgICAgICBpZiAoJCgnI2xheW91dCcpLnZhbCgpID09ICdub3JtYWwnKSB7XG4gICAgICAgICAgICAgICQoJy5oZXJvX3dyYXBwZXInKS5yZW1vdmVDbGFzcygnY29sLW1kLTknKTtcbiAgICAgICAgICAgICAgJCgnLmhlcm9fd3JhcHBlcicpLmFkZENsYXNzKCdjb2wtbWQtMTInKTtcbiAgICAgICAgICAgICAgJCgnLmhlcm9fcGFnZScpLnJlbW92ZUNsYXNzKCdyb3cnKTtcbiAgICAgICAgICAgICAgJCgnLmhlcm9fcGFnZScpLmFkZENsYXNzKCdjb2wtbWQtNCcpO1xuICAgICAgICAgICAgICAkKCcuaGVyb19zZWN0aW9uJykucmVtb3ZlQ2xhc3MoJ2NvbC1tZC02Jyk7XG4gICAgICAgICAgICAgICQoJyNpbmZvJykucmVtb3ZlQ2xhc3MoJ2NvbC1tZC0zJyk7XG4gICAgICAgICAgICAgICQoJyNpbmZvJykuYWRkQ2xhc3MoJ2NvbC1tZC0xMicpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIGlmICgkKCcjbGF5b3V0JykudmFsKCkgPT0gJ2NhcHRhaW4nKSB7XG4gICAgICAgICAgICAgICQoJy5oZXJvX3dyYXBwZXInKS5yZW1vdmVDbGFzcygnY29sLW1kLTEyJyk7XG4gICAgICAgICAgICAgICQoJy5oZXJvX3dyYXBwZXInKS5hZGRDbGFzcygnY29sLW1kLTknKTtcbiAgICAgICAgICAgICAgJCgnLmhlcm9fcGFnZScpLnJlbW92ZUNsYXNzKCdjb2wtbWQtNCcpO1xuICAgICAgICAgICAgICAkKCcuaGVyb19wYWdlJykuYWRkQ2xhc3MoJ3JvdycpO1xuICAgICAgICAgICAgICAkKCcuaGVyb19zZWN0aW9uJykuYWRkQ2xhc3MoJ2NvbC1tZC02Jyk7XG4gICAgICAgICAgICAgICQoJyNpbmZvJykuYWRkQ2xhc3MoJ2NvbC1tZC0zJyk7XG4gICAgICAgICAgICAgICQoJyNpbmZvJykucmVtb3ZlQ2xhc3MoJ2NvbC1tZC0xMicpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdXBkYXRlTGF5b3V0KCk7XG4gICAgICAgIFxuICAgICAgICBmdW5jdGlvbiBzZXRUaW1lKClcbiAgICAgICAge1xuICAgICAgICAgICAgKyt0b3RhbEh1bmRyZWR0aFNlY29uZHM7XG4gICAgICAgICAgICBodW5kcmVkdGhzZWNvbmRzTGFiZWwuaW5uZXJIVE1MID0gdG90YWxIdW5kcmVkdGhTZWNvbmRzJTEwO1xuICAgICAgICAgICAgc2Vjb25kc0xhYmVsLmlubmVySFRNTCA9IHBhZChNYXRoLmZsb29yKCh0b3RhbEh1bmRyZWR0aFNlY29uZHMvMTApJTYwKSk7XG4gICAgICAgICAgICBtaW51dGVzTGFiZWwuaW5uZXJIVE1MID0gcGFkKHBhcnNlSW50KCh0b3RhbEh1bmRyZWR0aFNlY29uZHMvMTApLzYwKSk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBwYWQodmFsKVxuICAgICAgICB7XG4gICAgICAgICAgICB2YXIgdmFsU3RyaW5nID0gdmFsICsgXCJcIjtcbiAgICAgICAgICAgIGlmKHZhbFN0cmluZy5sZW5ndGggPCAyKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJldHVybiBcIjBcIiArIHZhbFN0cmluZztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsU3RyaW5nO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgXG4gICAgfSk7XG59KTsiXX0=
