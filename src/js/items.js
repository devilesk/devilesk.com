var $ = jQuery = require('jquery');
require('bootstrap');

$(function () {
	$('#consumables').tooltip({
		title: 'Consumables'
	});
	$('#attributes').tooltip({
		title: 'Attributes'
	});
	$('#armaments').tooltip({
		title: 'Armaments'
	});
	$('#arcane').tooltip({
		title: 'Arcane'
	});
	$('#common').tooltip({
		title: 'Common'
	});
	$('#support').tooltip({
		title: 'Support'
	});
	$('#caster').tooltip({
		title: 'Caster'
	});
	$('#weapons').tooltip({
		title: 'Weapons'
	});
	$('#armor').tooltip({
		title: 'Armor'
	});
	$('#artifacts').tooltip({
		title: 'Artifacts'
	});
	$('#secret').tooltip({
		title: 'Secret'
	});

	var item_data = {}

	get_data_for_popover_and_display = function () {
		var el = $(this);
		if (el.find('.items-sprite-70x50').attr('id') in item_data) {
			el.attr('data-content', item_data[el.find('.items-sprite-70x50').attr('id')]);
			if (el.is(':hover')) {
				el.popover('show');
			}
		}
	}

	hide_popover = function () {
		var el = $(this);
		el.popover('hide')
	}
	$('.shop-item').popover({
		"trigger": "hover",
		"html": true,
		"animation": false
	});
	$('.shop-item').hover(get_data_for_popover_and_display, hide_popover);
	
	var itemtooltipdata = {}

	function getTooltipItemDescription(item) {
		var d = item.description;
		for (var i=0;i<item.attributes.length;i++) {
			if (item.attributes[i].name != null) {
				var attributename = item.attributes[i].name;
				var attributevalue = item.attributes[i].value[0];
				for (var j=1;j<item.attributes[i].value.length;j++) {
					attributevalue += ' / ' + item.attributes[i].value[j];
				}
				var regexp = new RegExp('%' + attributename + '%', "gi");
				d = d.replace(regexp, attributevalue );
			}
		}
		var regexp = new RegExp('%%', "gi");
		d = d.replace(regexp,'%');
		regexp = new RegExp('\n', "gi");
		d = d.replace(/\\n/g, "<br>");
		return d;
	}

	var ability_vars = {
		'$health':'Health',
		'$mana':'Mana',
		'$armor':'Armor',
		'$damage':'Damage',
		'$str':'Strength',
		'$int':'Intelligence',
		'$agi':'Agility',
		'$all':'All Attributes',
		'$attack':'Attack Speed',
		'$hp_regen':'HP Regeneration',
		'$mana_regen':'Mana Regeneration',
		'$move_speed':'Movement Speed',
		'$evasion':'Evasion',
		'$spell_resist':'Spell Resistance',
		'$selected_attribute':'Selected Attribute'
	}

	function getTooltipItemAttributes(item) {
		var a = '';
		for (var i=0;i<item.attributes.length;i++) {
			if (item.attributes[i].tooltip != null) {
				var attributetooltip = item.attributes[i].tooltip;
				var attributevalue = item.attributes[i].value[0];
				for (var j=1;j<item.attributes[i].value.length;j++) {
					attributevalue += ' / ' + item.attributes[i].value[j];
				}
				var p = attributetooltip.indexOf("%");
				if (p == 0) {
					attributevalue = attributevalue + '%';
					attributetooltip = attributetooltip.slice(1);
				}
				var d = attributetooltip.indexOf("$");
				if (d != -1) {
					a = a + attributetooltip.slice(0, d) + ' ' + attributevalue + ' ' + ability_vars[attributetooltip.slice(d)] + '<br>';
				}
				else {
					a = a + attributetooltip + ' ' + attributevalue + '<br>';
				}
			}
		}
		return a.trim('<br>');
	}

	function getTooltipItemCooldown(item) {
		var c = '';
		for (var i=0;i<item.cooldown.length; i++) {
			c = c + ' ' + item.cooldown[i];
		}
		return c;
	}

	function getTooltipItemManaCost(item) {
		var c = '';
		for (var i=0;i<item.manacost.length; i++) {
			if (item.manacost[i] > 0) {
				c = c + ' ' + item.manacost[i];
			}
		}
		return c;
	}
	
	var itemData;
	$.getJSON("/media/dota-json/itemdata.json", function (data) {
		itemData = data;
		for (i in itemData) {
			var item = itemData[i];
			var data = $('<div>');
			data.append($('<span>').html(item.displayname).attr('id','item_name').addClass('item_field'));
			data.append($('<span>').html(item.itemcost).attr('id','item_cost').addClass('item_field'));
			data.append($('<hr>'));
			if (item.description != null) {
				data.append($('<div>').html(getTooltipItemDescription(item)).attr('id','item_description').addClass('item_field'));
			}
			var attributedata = getTooltipItemAttributes(item);
			if (attributedata != '') {
				data.append($('<div>').html(attributedata).attr('id','item_attributes').addClass('item_field'));
			}
			var cd = getTooltipItemCooldown(item);
			var mana = getTooltipItemManaCost(item);
			if (cd != '' || mana != '') {
				var cdmanacost = $('<div>').attr('id','item_cdmana');
				if (cd != '') {
					cdmanacost.append($('<span>').html(cd).attr('id','item_cooldown').addClass('item_field'));
				}
				if (mana != '') {
					cdmanacost.append($('<span>').html(mana).attr('id','item_manacost').addClass('item_field'));
				}
				data.append(cdmanacost);
			}
			if (item.lore != null) {
				data.append($('<div>').html(item.lore).attr('id','item_lore').addClass('item_field'));
			}
			item_data[i.replace('item_', '')] = data.html();
		}
    
    $('#search-items').keyup(function () {
      var searchVal = $(this).val().toLowerCase();
      $(".shop-item").removeClass('no-match');
      $(".shop-item").filter(function( index ) {
        var itemId = $(this).find('.items-sprite-70x50').attr('id').toLowerCase();
        var itemName = itemData['item_' + itemId].displayname.toLowerCase();
        return itemId.indexOf(searchVal) === -1 && itemName.indexOf(searchVal) === -1 && itemName.match(/\b(\w)/g).join('').indexOf(searchVal) === -1;
      }).addClass('no-match');
    });
    
	});
});