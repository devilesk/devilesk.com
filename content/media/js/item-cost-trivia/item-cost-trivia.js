$(function () {
    $.getJSON("/media/js/itemdata.json", function (data) {
        var itemdata = {},
            items = ["item_recipe_ancient_janggo","item_recipe_armlet","item_recipe_assault","item_recipe_basher","item_recipe_black_king_bar","item_recipe_bracer","item_recipe_buckler","item_recipe_cyclone","item_recipe_dagon","item_recipe_desolator","item_recipe_diffusal_blade","item_recipe_force_staff","item_recipe_greater_crit","item_recipe_hand_of_midas","item_recipe_headdress","item_recipe_heart","item_recipe_lesser_crit","item_recipe_maelstrom","item_recipe_magic_wand","item_recipe_manta","item_recipe_mask_of_madness","item_recipe_medallion_of_courage","item_recipe_mekansm","item_recipe_mjollnir","item_recipe_necronomicon","item_recipe_null_talisman","item_recipe_orchid","item_recipe_pipe","item_recipe_radiance","item_recipe_refresher","item_recipe_sange","item_recipe_satanic","item_recipe_shivas_guard","item_recipe_soul_ring","item_recipe_sphere","item_recipe_travel_boots","item_recipe_urn_of_shadows","item_recipe_veil_of_discord","item_recipe_vladmir","item_recipe_wraith_band","item_recipe_yasha","item_blink","item_blades_of_attack","item_broadsword","item_chainmail","item_claymore","item_helm_of_iron_will","item_javelin","item_mithril_hammer","item_platemail","item_quarterstaff","item_quelling_blade","item_ring_of_protection","item_gauntlets","item_slippers","item_mantle","item_branches","item_belt_of_strength","item_boots_of_elves","item_robe","item_circlet","item_ogre_axe","item_blade_of_alacrity","item_staff_of_wizardry","item_ultimate_orb","item_gloves","item_lifesteal","item_ring_of_regen","item_sobi_mask","item_boots","item_gem","item_cloak","item_talisman_of_evasion","item_magic_stick","item_magic_wand","item_ghost","item_clarity","item_flask","item_dust","item_bottle","item_ward_observer","item_ward_sentry","item_tango","item_courier","item_tpscroll","item_travel_boots","item_phase_boots","item_demon_edge","item_eagle","item_reaver","item_relic","item_hyperstone","item_ring_of_health","item_void_stone","item_mystic_staff","item_energy_booster","item_point_booster","item_vitality_booster","item_power_treads","item_hand_of_midas","item_oblivion_staff","item_pers","item_poor_mans_shield","item_bracer","item_wraith_band","item_null_talisman","item_mekansm","item_vladmir","item_flying_courier","item_buckler","item_ring_of_basilius","item_pipe","item_urn_of_shadows","item_headdress","item_sheepstick","item_orchid","item_cyclone","item_force_staff","item_dagon","item_necronomicon","item_ultimate_scepter","item_refresher","item_assault","item_heart","item_black_king_bar","item_shivas_guard","item_bloodstone","item_sphere","item_vanguard","item_blade_mail","item_soul_booster","item_hood_of_defiance","item_rapier","item_monkey_king_bar","item_radiance","item_butterfly","item_greater_crit","item_basher","item_bfury","item_manta","item_lesser_crit","item_armlet","item_invis_sword","item_sange_and_yasha","item_satanic","item_mjollnir","item_skadi","item_sange","item_helm_of_the_dominator","item_maelstrom","item_desolator","item_yasha","item_mask_of_madness","item_diffusal_blade","item_ethereal_blade","item_soul_ring","item_arcane_boots","item_orb_of_venom","item_stout_shield","item_ancient_janggo","item_medallion_of_courage","item_smoke_of_deceit","item_veil_of_discord","item_rod_of_atos","item_abyssal_blade","item_heavens_halberd","item_ring_of_aquila","item_tranquil_boots","item_shadow_amulet","item_crimson_guard","item_recipe_crimson_guard"],
            item = {},
            answers = [0,1,2,3,4],
            answer = 0,
            streak = 0,
            longeststreak = 0;

        for (var i = 0; i < items.length; i++) {
            itemdata[items[i]] = {
                cost: data[items[i]].itemcost,
                name: data[items[i]].ItemRecipe ? data[data[items[i]].ItemResult].displayname + ' Recipe' : data[items[i]].displayname
            }
        }
        
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

        function generateQuestion() {

            var items_shuffled = shuffle(items.slice(0)),
                answers_shuffled = shuffle(answers.slice(0));
            answer = itemdata[items_shuffled[0]].cost;
            /*$('#item').removeAttr('class');
            $('#item').addClass('itemsprite');
            $('#item').addClass('itemsprite-' + items_shuffled[0].replace('item_',''));*/
            $('#item').attr('src','http://cdn.dota2.com/apps/dota2/images/items/' + items_shuffled[0].replace('item_','') + '_lg.png');
            $('#item-name').html(itemdata[items_shuffled[0]].name);
            for (var i=0;i<answers_shuffled.length;i++) {
                $('#answer_' + answers_shuffled[i]).html(itemdata[items_shuffled[i]].cost).blur();
            }
        }

        $('.btn').click(function(e) {
            if ($(this).text() == answer) {
                streak += 1;
                //$('#ans_msg').css('color','green');
                $('#ans_msg').html('<h3><span class=\"label label-success\">Correct!</span></h3>');
                generateQuestion();
            }
            else {
                //$('#ans_msg').css('color','red');
                $('#ans_msg').html('<h3><span class=\"label label-danger\">Wrong!</span></h3>');
                streak = 0;
            }
                if (streak > longeststreak) {
                    longeststreak = streak;
                    $('#longeststreak').text('Longest Streak: ' + longeststreak);
                }
            $('#ans_msg').stop(false,true, true);
            $('#ans_msg').show();
            $('#ans_msg').fadeOut(2000);
            $('#streak').text('Current Streak: ' + streak);
            e.preventDefault();
            e.stopImmediatePropagation()
            $(this).blur();

        });

        function checkAnswer() {
            if (item.cost == $('#abilityname').val()) {
                $('#ans_msg').html('<span class=\"label label-success\">Correct!</span>');
                generateQuestion();
            }
            else {
                $('#ans_msg').html('<span class=\"label label-danger\">Wrong!</span>');
            }
            $('#abilityname').val('');
                $('#ans_msg').stop(false,true, true);
                $('#ans_msg').show();
                $('#ans_msg').fadeOut(2000);
        }
        
        generateQuestion();
    });
});