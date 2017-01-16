
var showbuildings = true;
var showshops = true;
var showjungle = true;
var showmisc = true;
var showjuke = true;
var showlanes = true;
var showwards = true;
function show(evt, node)
{
		var svgdoc = evt.target.ownerDocument;
		var obj = evt.target;
		obj.setAttribute("visibility", "visible");
}

function togglebuildings()
{
	var val = "";
	var col = "";
	if (showbuildings) {
		val = "hidden";
		col = "red";
		showbuildings = false;
		showshops = false;
	}
	else {
		val = "visible";
		col = "green";
		showbuildings = true;
		showshops = true;
	}
	document.getElementById('DireTop').setAttribute('visibility',val);
	document.getElementById('DireMid').setAttribute('visibility',val);
	document.getElementById('DireBot').setAttribute('visibility',val);
	document.getElementById('RadTop').setAttribute('visibility',val);
	document.getElementById('RadMid').setAttribute('visibility',val);
	document.getElementById('RadBot').setAttribute('visibility',val);
	document.getElementById('DireShop').setAttribute('visibility',val);
	document.getElementById('RadShop').setAttribute('visibility',val);
	document.getElementById('Throne').setAttribute('visibility',val);
	document.getElementById('DireRax').setAttribute('visibility',val);
	document.getElementById('RadRax').setAttribute('visibility',val);
	document.getElementById('DireBaseTower').setAttribute('visibility',val);
	document.getElementById('RadBaseTower').setAttribute('visibility',val);
	document.getElementById('showbuildings').setAttribute('fill',col);
	document.getElementById('showshops').setAttribute('fill',col);
}

function toggleshops()
{
	var val = "";
	var col = "";
	if (showshops) {
		val = "hidden";
		col = "red";
		showshops = false;
	}
	else {
		val = "visible";
		col = "green";
		showshops = true;
	}
	document.getElementById('DireShop').setAttribute('visibility',val);
	document.getElementById('RadShop').setAttribute('visibility',val);
	document.getElementById('showshops').setAttribute('fill',col);
}

function togglejungle()
{
	var val = "";
	var col = "";
	if (showjungle) {
		val = "hidden";
		col = "red";
		showjungle = false;
	}
	else {
		val = "visible";
		col = "green";
		showjungle = true;
	}
	document.getElementById('DireNeutral').setAttribute('visibility',val);
	document.getElementById('RadNeutral').setAttribute('visibility',val);
	document.getElementById('showjungle').setAttribute('fill',col);
}

function togglemisc()
{
	var val = "";
	var col = "";
	if (showmisc) {
		val = "hidden";
		col = "red";
		showmisc = false;
	}
	else {
		val = "visible";
		col = "green";
		showmisc = true;
	}
	document.getElementById('Runespawn').setAttribute('visibility',val);
	document.getElementById('Rosh').setAttribute('visibility',val);
	document.getElementById('showmisc').setAttribute('fill',col);
}

function togglejuke()
{
	var val = "";
	var col = "";
	if (showjuke) {
		val = "hidden";
		col = "red";
		showjuke = false;
	}
	else {
		val = "visible";
		col = "green";
		showjuke = true;
	}
	document.getElementById('DireJuke').setAttribute('visibility',val);
	document.getElementById('DireJuke2').setAttribute('visibility',val);
	document.getElementById('DireJuke3').setAttribute('visibility',val);
	document.getElementById('RadJuke').setAttribute('visibility',val);
	document.getElementById('RadJuke2').setAttribute('visibility',val);
	document.getElementById('RadJuke3').setAttribute('visibility',val);
	document.getElementById('showjuke').setAttribute('fill',col);
}

function togglelanes()
{
	var val = "";
	var col = "";
	if (showlanes) {
		val = "hidden";
		col = "red";
		showlanes = false;
	}
	else {
		val = "visible";
		col = "green";
		showlanes = true;
	}
	document.getElementById('Lanes').setAttribute('visibility',val);
	document.getElementById('showlanes').setAttribute('fill',col);
}

function togglewards()
{
	var val = "";
	var col = "";
	if (showwards) {
		val = "hidden";
		col = "red";
		showwards = false;
	}
	else {
		val = "visible";
		col = "green";
		showwards = true;
	}
	document.getElementById('wards').setAttribute('visibility',val);
	document.getElementById('showwards').setAttribute('fill',col);
}

function toggle(evt)
{
	var el = evt.target;
	var el_id = el.getAttribute('id');
	var col = "";

	if (el.getAttribute('fill') == 'green') {
		val = "hidden";
		col = "red";
		showwards = false;
	}
	else {
		val = "visible";
		col = "green";
	}
	el.setAttribute('fill',col);

	switch(el_id) {
		case 'showbuildings':
			document.getElementById('DireTop').setAttribute('visibility',val);
			document.getElementById('DireMid').setAttribute('visibility',val);
			document.getElementById('DireBot').setAttribute('visibility',val);
			document.getElementById('RadTop').setAttribute('visibility',val);
			document.getElementById('RadMid').setAttribute('visibility',val);
			document.getElementById('RadBot').setAttribute('visibility',val);
			document.getElementById('DireShop').setAttribute('visibility',val);
			document.getElementById('RadShop').setAttribute('visibility',val);
			document.getElementById('Throne').setAttribute('visibility',val);
			document.getElementById('DireRax').setAttribute('visibility',val);
			document.getElementById('RadRax').setAttribute('visibility',val);
			document.getElementById('DireBaseTower').setAttribute('visibility',val);
			document.getElementById('RadBaseTower').setAttribute('visibility',val);

			document.getElementById('showshops').setAttribute('fill',col);
			document.getElementById('showbarracks').setAttribute('fill',col);
			document.getElementById('showtowers').setAttribute('fill',col);
			document.getElementById('showancients').setAttribute('fill',col);
		break;
		case 'showshops':
			document.getElementById('DireShop').setAttribute('visibility',val);
			document.getElementById('RadShop').setAttribute('visibility',val);			
		break;
		case 'showtowers':
			document.getElementById('DireTop').setAttribute('visibility',val);
			document.getElementById('DireMid').setAttribute('visibility',val);
			document.getElementById('DireBot').setAttribute('visibility',val);
			document.getElementById('RadTop').setAttribute('visibility',val);
			document.getElementById('RadMid').setAttribute('visibility',val);
			document.getElementById('RadBot').setAttribute('visibility',val);			
		break;
		case 'showbarracks':
			document.getElementById('DireRax').setAttribute('visibility',val);
			document.getElementById('RadRax').setAttribute('visibility',val);			
		break;
		case 'showancients':
			document.getElementById('Throne').setAttribute('visibility',val);
		break;
		case 'showjungle':
			document.getElementById('DireNeutralEasy').setAttribute('visibility',val);
			document.getElementById('DireNeutralMedium').setAttribute('visibility',val);
			document.getElementById('DireNeutralHard').setAttribute('visibility',val);
			document.getElementById('DireNeutralAncient').setAttribute('visibility',val);
			document.getElementById('RadNeutralEasy').setAttribute('visibility',val);
			document.getElementById('RadNeutralMedium').setAttribute('visibility',val);
			document.getElementById('RadNeutralHard').setAttribute('visibility',val);
			document.getElementById('RadNeutralAncient').setAttribute('visibility',val);
			document.getElementById('showjungleeasy').setAttribute('fill',col);
			document.getElementById('showjunglemedium').setAttribute('fill',col);
			document.getElementById('showjunglehard').setAttribute('fill',col);			
			document.getElementById('showjungleancient').setAttribute('fill',col);		
		break;
		case 'showjungleeasy':
			document.getElementById('DireNeutralEasy').setAttribute('visibility',val);
			document.getElementById('RadNeutralEasy').setAttribute('visibility',val);
		break;
		case 'showjunglemedium':
			document.getElementById('DireNeutralMedium').setAttribute('visibility',val);
			document.getElementById('RadNeutralMedium').setAttribute('visibility',val);
		break;
		case 'showjunglehard':
			document.getElementById('DireNeutralHard').setAttribute('visibility',val);
			document.getElementById('RadNeutralHard').setAttribute('visibility',val);
		break;
		case 'showjungleancient':
			document.getElementById('DireNeutralAncient').setAttribute('visibility',val);
			document.getElementById('RadNeutralAncient').setAttribute('visibility',val);
		break;
		case 'showspawnbox':
			document.getElementById('neutralspawnbox').setAttribute('visibility',val);

		break;
		case 'showmisc':
			document.getElementById('Runespawn').setAttribute('visibility',val);
			document.getElementById('Rosh').setAttribute('visibility',val);		
		break;
		case 'showjuke':
			document.getElementById('DireJuke').setAttribute('visibility',val);
			document.getElementById('DireJuke2').setAttribute('visibility',val);
			document.getElementById('DireJuke3').setAttribute('visibility',val);
			document.getElementById('RadJuke').setAttribute('visibility',val);
			document.getElementById('RadJuke2').setAttribute('visibility',val);
			document.getElementById('RadJuke3').setAttribute('visibility',val);			
		break;
		case 'showlanes':
			document.getElementById('Lanes').setAttribute('visibility',val);			
		break;
		case 'showwards':
			document.getElementById('wardsrune').setAttribute('visibility',val);
			document.getElementById('wardsuber').setAttribute('visibility',val);
			document.getElementById('wardslane').setAttribute('visibility',val);
			document.getElementById('wardsjungle').setAttribute('visibility',val);
			document.getElementById('wardspush').setAttribute('visibility',val);
			document.getElementById('wardssituational').setAttribute('visibility',val);
			
			document.getElementById('showwardsrune').setAttribute('fill',col);
			document.getElementById('showwardsuber').setAttribute('fill',col);
			document.getElementById('showwardslane').setAttribute('fill',col);
			document.getElementById('showwardsjungle').setAttribute('fill',col);
			document.getElementById('showwardspush').setAttribute('fill',col);
			document.getElementById('showwardssituational').setAttribute('fill',col);
		break;
		case 'showwardsrune':
			document.getElementById('wardsrune').setAttribute('visibility',val);
		break;
		case 'showwardsuber':
			document.getElementById('wardsuber').setAttribute('visibility',val);
		break;
		case 'showwardslane':
			document.getElementById('wardslane').setAttribute('visibility',val);
		break;
		case 'showwardsjungle':
			document.getElementById('wardsjungle').setAttribute('visibility',val);
		break;
		case 'showwardspush':
			document.getElementById('wardspush').setAttribute('visibility',val);
		break;
		case 'showwardssituational':
			document.getElementById('wardssituational').setAttribute('visibility',val);
		break;
		default:
	}
}

function switch_map(evt) {
	parent.switch_map();
}