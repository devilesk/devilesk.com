$(function () {
    $.getJSON("/media/js/heroes.json", function (data) {
        var items = data.data;
    $.getJSON("/media/js/herodata.json", function (data) {
    var itemnames = {}
    for (var i=0;i<items.length;i++) {
        itemnames[items[i]] = data['npc_dota_hero_' + items[i]].displayname
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
        
    function shuffle(array) {
        var counter = array.length, temp, index;

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

    $('#layout').change(function() {
        console.log($(this).val());
        if ($(this).val() == 'normal') {
            $('.hero_wrapper').removeClass('col-md-8');
            $('.hero_wrapper').addClass('col-md-12');
            $('.hero_page').removeClass('col-md-12');
            $('.hero_page').addClass('col-md-4');
            $('.hero_section').removeClass('col-md-6');
            $('#info').removeClass('col-md-4');
            $('#info').addClass('col-md-12');
        }
        else if ($(this).val() == 'captain') {
            $('.hero_wrapper').removeClass('col-md-12');
            $('.hero_wrapper').addClass('col-md-8');
            $('.hero_page').removeClass('col-md-4');
            $('.hero_page').addClass('col-md-12');
            $('.hero_section').addClass('col-md-6');
            $('#info').addClass('col-md-4');
            $('#info').removeClass('col-md-12');
        }
    });
    
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
});