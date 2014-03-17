var progress = 0;
var streak = 0;
var score = 0;
var heroes;
var abilitylist = [];
var answer;
var answer_text;
var l;
var answer_choices;
var fadeElements = ["#portraitcontainer", "#spellcontainer", "#abilityinfo", "#descriptionlabel", "#abilitydescriptionarrow", ".answerchoices", "#stats > p", "#answer_result"]

$(function() {
	$('#abilitydescription').hide();
	$('#abilitybutton').click(function(){
		$('#startgame').hide();
		var allheroid = [];
		for (var i=1;i<109;i++) {
			if (i != 24 && i != 105) {
				allheroid.push(i);
			}
		}
		
		var heroidlist = [];
		for (var i=0;i<25;i++) {
			var randomnumber=Math.floor(Math.random()*allheroid.length);
			heroidlist.push(allheroid.splice(randomnumber, 1)[0]);
		}
		l = heroidlist;
		var jsonString = JSON.stringify(heroidlist);
		$.post(
			"/dota2/apps/abilitytrivia/abilitytrivia4.py",
			{'key':jsonString,'key2':'value2'},
			function(response){
				startgame(response);
			},
			"json"
		);
		
	$('#questioncontainer').show();
	$('#stats').show();
	progress = 0;
	streak = 0;
	score = 0;
	abilitylist = [];
	$('#progress').text("0/25");
	$('#score').text(0);
	$('#streak').text(0);
	$('#answer_result').empty();
	});
	
	$(".anschoicelabel").click(function(e) {
		submitAnswer($('#' + e.target.id).text());
	});
	$('#abilitydescriptionarrow').click(function() {
		$('#abilitydescription').slideToggle('slow', function() {
			// Animation complete.
			if ($(this).is(":hidden")) {
				$('#abilitydescriptionarrow').html("<div class=\"glyphicon glyphicon-chevron-down\"></div>");
			}
			else {
				$('#abilitydescriptionarrow').html("<div class=\"glyphicon glyphicon-chevron-up\"></div>");
			}
		});

		
	});
});

function fadeOut() {
	for (var i=0; i<fadeElements.length;i++) {
		$(fadeElements[i]).fadeOut(500);
	}
}

function fadeIn() {
	for (var i=0; i<fadeElements.length;i++) {
		$(fadeElements[i]).fadeIn(500);
	}
}

function submitAnswer(ans) {
	fadeOut();
	setTimeout(function(){nextQuestion(ans)},500);
	fadeIn();
}

function nextQuestion(ans) {
	$('#abilitydescription').empty();
	$('.anschoicelabel').empty();
	$("#attributestable tr:gt(1)").remove();
	$('#cooldownvalue').empty().removeClass();
	$('#manacostvalue').empty().removeClass();
	progress = progress + 1;
	if (progress < 25) {
		if (ans == answer.trim()) {
			score = score + 1;
			streak = streak + 1;
			$('#answer_result').css("color", "green").text("Correct! " + answer_text + " " + answer);
		}
		else {
			$('#answer_result').css("color", "red").text("Wrong! " + answer_text + " " + answer);
			streak = 0;
		}
		$('#progress').text(progress + "/25");
		$('#score').text(score);
		$('#streak').text(streak);
		generateQuestion();
	}
	else {
		$('#progress').text(progress + "/25");
		$('#score').text(score);
		$('#streak').text(streak);
		$('#questioncontainer').hide();
		$('#abilitybutton').text("Play Again");
		$('#startgame').show();
	}
}

function startgame(response) {
	var attributeslist = [];
	var cooldownlist = [];
	var manacostlist = [];
	
	/* initialize with first row */
	row = response.message[0];
	var current_hero = row[0];
	var display_name = row[1];
	var current_ability = row[2];
	/*ability_id = row[3];*/
	var display_ability_name = row[4];
	var ability_desc = row[5];	
	var ability_aghs_desc = row[6];
	var ability_notes = row[7];	
	var ability_lore = row[8];
	/* rows 9-12 are cooldown */
	/* rows 13-16 are manacost */
	var attributes = [row[17], row[18]];
	
	for (var i = 0; i < response.message.length; i++) {
		row = response.message[i];
		if (current_ability != row[2]) {
			var ability = new Object();
			ability.name = current_ability;
			ability.display_name = display_ability_name;
			ability.hero_display_name = display_name;
			ability.hero = current_hero;
			ability.description = ability_desc;
			ability.aghs_description = ability_aghs_desc;
			ability.notes = ability_notes;
			ability.lore = ability_lore;
			ability.cooldown = cooldownlist.slice();
			ability.manacost = manacostlist.slice();
			var cooldown_string = "";
			var manacost_string = "";
			
			var maxcooldown = 0;
			var maxmanacost = 0;
			for (var j = 0; j < cooldownlist.length; j++) {
				cooldown_string = cooldown_string + cooldownlist[j] + " ";
				maxcooldown = Math.max(parseFloat(cooldownlist[j],maxcooldown));
			}
			for (var j = 0; j < manacostlist.length; j++) {
				manacost_string = manacost_string + manacostlist[j] + " ";
				maxmanacost = Math.max(parseFloat(cooldownlist[j],maxmanacost));
			}
			
			if (maxcooldown) {
				attributeslist.push(["COOLDOWN:", cooldown_string]);
			}
			if (maxmanacost) {
				attributeslist.push(["MANACOST:", manacost_string]);
			}
			ability.attributes = attributeslist;
			attributeslist = [];
			cooldownlist = [];
			manacostlist = [];
			
			abilitylist.push(ability);
		}
		
		if (cooldownlist.length < 1) {
			for (var j = 9; j < 13; j++) {
				if (row[j] != null) {
					cooldownlist.push(row[j]);
				}
			}

		}

		if (manacostlist.length < 1) {
			for (var j = 13; j < 17; j++) {
				if (row[j] != null) {
					manacostlist.push(row[j]);
				}
			}
		}
		
		current_hero = row[0];
		display_name = row[1];
		current_ability = row[2];
		display_ability_name = row[4];
		ability_desc = row[5];	
		ability_aghs_desc = row[6];
		ability_notes = row[7];	
		ability_lore = row[8];
		attributes = [row[17], row[18]];	
		attributeslist.push(attributes);
	}

	generateQuestion();
}

function generateQuestion() {
	var randability=Math.floor(Math.random()*abilitylist.length);
	var ability = abilitylist.splice(randability, 1)[0];
	
	var randattribute=Math.floor(Math.random()*ability.attributes.length);
	
	$("#portraitimg").attr("src","/dota2/images/heroes/" + ability.hero.substring(14) + ".png");
	$("#spellimg").attr("src","/dota2/images/spellicons/" + ability.name + ".png");
	$("#hero_display_name").text(ability.hero_display_name.toUpperCase());
	$("#ability_display_name").text(ability.display_name.toUpperCase());
	$("#cooldown").hide();
	$("#manacost").hide();
	
	for (var i = 0; i < ability.attributes.length; i++) {
		if (ability.attributes[i][0] == "COOLDOWN:") {
			if (ability.attributes[i][1]) {
				$("#cooldown").show();
				
				if (i != randattribute) {
					$("#cooldownvalue").text(ability.attributes[i][1]);
				}
				else {
					$("#cooldownvalue").addClass('blankfield').text("???");
				}			
			}
		}
		else if (ability.attributes[i][0] == "MANACOST:") {
			if (ability.attributes[i][1]) {
				$("#manacost").show();
				
				if (i != randattribute) {
					$("#manacostvalue").text(ability.attributes[i][1]);
				}
				else {
					$("#manacostvalue").addClass('blankfield').text("???");
				}
			}
		}		
		else {
			$("#attributestable").find('tbody')
			.append($('<tr>')
				.append($('<td>')
					.addClass('td')
					.text(ability.attributes[i][0])
				)
			);
			
			if (i != randattribute) {
				$("#attributestable").find('tbody').find('tr:last')
				.append($('<td>')
					.text(ability.attributes[i][1])
				);
			}
			else {
				$("#attributestable").find('tbody').find('tr:last')
				.append($('<td>')
					.addClass('blankfield')
					.text("???")
				);
			}
		}

	}
	
	var description_text = "";
	if (ability.description != null) {
		$('#abilitydescription').html($('#abilitydescription').html() + '<br>' + ability.description.replace('\n', '<br>'));
	}
	if (ability.aghs_description != null) {
		$('#abilitydescription').html($('#abilitydescription').html() + '<br>' + ability.aghs_description.replace('\n', '<br>'));
	}
	if (ability.notes != null) {
		$('#abilitydescription').html($('#abilitydescription').html() + '<br>' + ability.notes.replace('\n', '<br>'));
	}
	if (ability.lore != null) {
		$('#abilitydescription').append($('<p>').attr('id', 'lore').text(ability.lore.replace('\n', '<br>')));
	}
	
	answer_choices = generateAnswerChoices(ability.attributes[randattribute][1]);
	$('#answer_1').text(answer_choices[0][0]);
	$('#answer_2').text(answer_choices[0][1]);
	$('#answer_3').text(answer_choices[0][2]);
	$('#answer_4').text(answer_choices[0][3]);
	answer = answer_choices[1];
	answer_text = ability.attributes[randattribute][0];
}

function generateAnswerChoices(answer) {
	var wronganslist = [];
	
	answer_values = answer.trim().split(" ")
	
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
	}
	else if (maxval < 0) {
		yaxis = -1;
	}
	else {
		yaxis = 0;
		if (answer_values.length > 1) {
			if (parseFloat(answer_values[0]) == 0) {
				var ans = "";
				for (var i = 1; i <= answer_values.length; i++) {
					ans = ans + answer_values[i] + " ";
				}
				var answer2 = generateAnswerChoices(ans);
				var newanswer = [];
				for (var i = 0; i < answer2[0].length; i++) {
					newanswer.push("0 " + answerw2[0][i]);
				}
				return [newanswer, answer2[1]];
			}
			else if (parseFloat(answer_values[answer_values.length-1]) == 0) {
				var ans = "";
				for (var i = 0; i < answer_values.length-1; i++) {
					ans = ans + answer_values[i] + " ";
				}
				var answer2 = generateAnswerChoices(ans);
				var newanswer = [];
				for (var i = 0; i < answer2[0].length; i++) {
					newanswer.push(answer2[0][i] + " 0");
				}
				return [newanswer, answer2[1]];
			}
		}
		else {
			return [["0", "1", "2", "3"], answer];
		}
	}
	
	/* scan list to find appropriate multiplier and offset */
	if (dividesall(answer_values, 100)) {
		multiplier = 50;
	}
	else if (dividesall(answer_values, 10)) {
		multiplier = 5;
	}
	else if (dividesall(answer_values, 5)) {
		multiplier = 5;
	}
	else if (dividesall(answer_values, 1)) {
		multiplier = .5;
	}
	else if (dividesall(answer_values, .25)) {
		multiplier = .25;
	}
	else if (dividesall(answer_values, .1)) {
		multiplier = .1;
	}
	else {
		multiplier = .05;
	}
	
	/* get bound for offset */
	var offset;
	if (yaxis == 1) {
		offset = -(Math.abs(minval/multiplier) - 1);
	}
	else if (yaxis == -1) {
		offset = -(Math.abs(maxval/multiplier) -1);
	}
	else {
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
		c = offset + Math.floor(Math.random()*(1 - offset));
	}
	else {
		c = 0;
	}
	
	var slope = 0;
	if (answer_values.length > 1) {
		slope = parseFloat(answer_values[1]) - parseFloat(answer_values[0]);
	}
	
	var correctanswer = "";

	for (var i = c; i < c+4; i++) {
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
		}
		else {
			for (var j = 0; j < answer_values.length; j++) {
				if (parseFloat(answer_values[0]) < parseFloat(answer_values[answer_values.length-1])) {
					wrongansorder = 0;
					if (yaxis == -1) {
						fnum = formatnum(parseFloat(answer_values[0])-i*multiplier+j*slope);
						if (getDecimalPlaces(fnum) > decimalplaces) {
							decimalplaces = getDecimalPlaces(fnum);
						}
						fnums.push(fnum);
					}
					else if (yaxis == 1) {
						fnum = formatnum(parseFloat(answer_values[0])+i*multiplier+j*slope);
						if (getDecimalPlaces(fnum) > decimalplaces) {
							decimalplaces = getDecimalPlaces(fnum);
						}
						fnums.push(fnum);
					}
					else {
						fnums.push(0);
					}
				}
				else {
					wrongansorder = 1;
					if (yaxis == -1) {
						fnum = formatnum(parseFloat(answer_values[answer_values.length-1])-i*multiplier-j*slope);
						if (getDecimalPlaces(fnum) > decimalplaces) {
							decimalplaces = getDecimalPlaces(fnum);
						}
						fnums.push(fnum);
					}
					else if (yaxis == 1) {
						fnum = formatnum(parseFloat(answer_values[answer_values.length-1])+i*multiplier-j*slope);
						if (getDecimalPlaces(fnum) > decimalplaces) {
							decimalplaces = getDecimalPlaces(fnum);
						}
						fnums.push(fnum);
					}
					else {
						fnums.push(0);
					}			
				}
			}
		}
		for (var k = 0; k < fnums.length; k++) {
			if (wrongansorder == 0) {
				wrongans = wrongans + fnums[k].toFixed(decimalplaces) + " ";
			}
			else {
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
	}
	else if (n*10 % 1 == 0) {
		return 1;
	}
	else {
		return 2;
	}
}

function dividesall(l, d) {
	for (var i = 0; i < l.length; i++) {
		if (parseFloat(l[i].trim()) % d) {
			return false;
		}
	}
	return true;
}
/*
function showDescription(arg) {
	$("#abilitydescription").fadeIn(500);
	$("#abilitydescriptionarrow").hide();
}
function hideDescription(arg) {
	$('#abilitydescription').fadeOut('slow', function() {
    $('#abilitydescriptionarrow').show();
});
}*/