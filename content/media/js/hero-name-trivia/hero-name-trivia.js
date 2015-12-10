$(function() {
    $.getJSON("/media/js/herodata.json", function(data) {
        var items = Object.keys(data),
            itemnames = {};
        for (var i = 0; i < items.length; i++) {
            itemnames[items[i]] = data[items[i]].displayname
        }
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
            answer = itemnames[items_shuffled[0]];
            $('#item').attr('src', 'http://cdn.dota2.com/apps/dota2/images/heroes/' + items_shuffled[0].replace('npc_dota_hero_', '') + '_full.png');
            for (var i = 0; i < answers_shuffled.length; i++) {
                $('#answer_' + answers_shuffled[i]).html(itemnames[items_shuffled[i]]).blur();
            }
        }
        $('.btn').click(function(e) {
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
        generateQuestion();


    });
});