require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({46:[function(require,module,exports){
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
        '$health': 'Health',
        '$mana': 'Mana',
        '$armor': 'Armor',
        '$damage': 'Damage',
        '$str': 'Strength',
        '$int': 'Intelligence',
        '$agi': 'Agility',
        '$all': 'All Attributes',
        '$attack': 'Attack Speed',
        '$hp_regen': 'HP Regeneration',
        '$mana_regen': 'Mana Regeneration',
        '$move_speed': 'Movement Speed',
        '$evasion': 'Evasion',
        '$spell_resist': 'Spell Resistance',
        '$selected_attribute': 'Selected Attribute',
        '$selected_attrib': 'Selected Attribute',
        '$cast_range': 'Cast Range',
        '$attack_range': 'Attack Range'
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
},{"bootstrap":1,"jquery":25}]},{},[46])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvaXRlbXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciAkID0galF1ZXJ5ID0gcmVxdWlyZSgnanF1ZXJ5Jyk7XG5yZXF1aXJlKCdib290c3RyYXAnKTtcblxuJChmdW5jdGlvbiAoKSB7XG5cdCQoJyNjb25zdW1hYmxlcycpLnRvb2x0aXAoe1xuXHRcdHRpdGxlOiAnQ29uc3VtYWJsZXMnXG5cdH0pO1xuXHQkKCcjYXR0cmlidXRlcycpLnRvb2x0aXAoe1xuXHRcdHRpdGxlOiAnQXR0cmlidXRlcydcblx0fSk7XG5cdCQoJyNhcm1hbWVudHMnKS50b29sdGlwKHtcblx0XHR0aXRsZTogJ0FybWFtZW50cydcblx0fSk7XG5cdCQoJyNhcmNhbmUnKS50b29sdGlwKHtcblx0XHR0aXRsZTogJ0FyY2FuZSdcblx0fSk7XG5cdCQoJyNjb21tb24nKS50b29sdGlwKHtcblx0XHR0aXRsZTogJ0NvbW1vbidcblx0fSk7XG5cdCQoJyNzdXBwb3J0JykudG9vbHRpcCh7XG5cdFx0dGl0bGU6ICdTdXBwb3J0J1xuXHR9KTtcblx0JCgnI2Nhc3RlcicpLnRvb2x0aXAoe1xuXHRcdHRpdGxlOiAnQ2FzdGVyJ1xuXHR9KTtcblx0JCgnI3dlYXBvbnMnKS50b29sdGlwKHtcblx0XHR0aXRsZTogJ1dlYXBvbnMnXG5cdH0pO1xuXHQkKCcjYXJtb3InKS50b29sdGlwKHtcblx0XHR0aXRsZTogJ0FybW9yJ1xuXHR9KTtcblx0JCgnI2FydGlmYWN0cycpLnRvb2x0aXAoe1xuXHRcdHRpdGxlOiAnQXJ0aWZhY3RzJ1xuXHR9KTtcblx0JCgnI3NlY3JldCcpLnRvb2x0aXAoe1xuXHRcdHRpdGxlOiAnU2VjcmV0J1xuXHR9KTtcblxuXHR2YXIgaXRlbV9kYXRhID0ge31cblxuXHRnZXRfZGF0YV9mb3JfcG9wb3Zlcl9hbmRfZGlzcGxheSA9IGZ1bmN0aW9uICgpIHtcblx0XHR2YXIgZWwgPSAkKHRoaXMpO1xuXHRcdGlmIChlbC5maW5kKCcuaXRlbXMtc3ByaXRlLTcweDUwJykuYXR0cignaWQnKSBpbiBpdGVtX2RhdGEpIHtcblx0XHRcdGVsLmF0dHIoJ2RhdGEtY29udGVudCcsIGl0ZW1fZGF0YVtlbC5maW5kKCcuaXRlbXMtc3ByaXRlLTcweDUwJykuYXR0cignaWQnKV0pO1xuXHRcdFx0aWYgKGVsLmlzKCc6aG92ZXInKSkge1xuXHRcdFx0XHRlbC5wb3BvdmVyKCdzaG93Jyk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0aGlkZV9wb3BvdmVyID0gZnVuY3Rpb24gKCkge1xuXHRcdHZhciBlbCA9ICQodGhpcyk7XG5cdFx0ZWwucG9wb3ZlcignaGlkZScpXG5cdH1cblx0JCgnLnNob3AtaXRlbScpLnBvcG92ZXIoe1xuXHRcdFwidHJpZ2dlclwiOiBcImhvdmVyXCIsXG5cdFx0XCJodG1sXCI6IHRydWUsXG5cdFx0XCJhbmltYXRpb25cIjogZmFsc2Vcblx0fSk7XG5cdCQoJy5zaG9wLWl0ZW0nKS5ob3ZlcihnZXRfZGF0YV9mb3JfcG9wb3Zlcl9hbmRfZGlzcGxheSwgaGlkZV9wb3BvdmVyKTtcblx0XG5cdHZhciBpdGVtdG9vbHRpcGRhdGEgPSB7fVxuXG5cdGZ1bmN0aW9uIGdldFRvb2x0aXBJdGVtRGVzY3JpcHRpb24oaXRlbSkge1xuXHRcdHZhciBkID0gaXRlbS5kZXNjcmlwdGlvbjtcblx0XHRmb3IgKHZhciBpPTA7aTxpdGVtLmF0dHJpYnV0ZXMubGVuZ3RoO2krKykge1xuXHRcdFx0aWYgKGl0ZW0uYXR0cmlidXRlc1tpXS5uYW1lICE9IG51bGwpIHtcblx0XHRcdFx0dmFyIGF0dHJpYnV0ZW5hbWUgPSBpdGVtLmF0dHJpYnV0ZXNbaV0ubmFtZTtcblx0XHRcdFx0dmFyIGF0dHJpYnV0ZXZhbHVlID0gaXRlbS5hdHRyaWJ1dGVzW2ldLnZhbHVlWzBdO1xuXHRcdFx0XHRmb3IgKHZhciBqPTE7ajxpdGVtLmF0dHJpYnV0ZXNbaV0udmFsdWUubGVuZ3RoO2orKykge1xuXHRcdFx0XHRcdGF0dHJpYnV0ZXZhbHVlICs9ICcgLyAnICsgaXRlbS5hdHRyaWJ1dGVzW2ldLnZhbHVlW2pdO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHZhciByZWdleHAgPSBuZXcgUmVnRXhwKCclJyArIGF0dHJpYnV0ZW5hbWUgKyAnJScsIFwiZ2lcIik7XG5cdFx0XHRcdGQgPSBkLnJlcGxhY2UocmVnZXhwLCBhdHRyaWJ1dGV2YWx1ZSApO1xuXHRcdFx0fVxuXHRcdH1cblx0XHR2YXIgcmVnZXhwID0gbmV3IFJlZ0V4cCgnJSUnLCBcImdpXCIpO1xuXHRcdGQgPSBkLnJlcGxhY2UocmVnZXhwLCclJyk7XG5cdFx0cmVnZXhwID0gbmV3IFJlZ0V4cCgnXFxuJywgXCJnaVwiKTtcblx0XHRkID0gZC5yZXBsYWNlKC9cXFxcbi9nLCBcIjxicj5cIik7XG5cdFx0cmV0dXJuIGQ7XG5cdH1cblxuXHR2YXIgYWJpbGl0eV92YXJzID0ge1xuICAgICAgICAnJGhlYWx0aCc6ICdIZWFsdGgnLFxuICAgICAgICAnJG1hbmEnOiAnTWFuYScsXG4gICAgICAgICckYXJtb3InOiAnQXJtb3InLFxuICAgICAgICAnJGRhbWFnZSc6ICdEYW1hZ2UnLFxuICAgICAgICAnJHN0cic6ICdTdHJlbmd0aCcsXG4gICAgICAgICckaW50JzogJ0ludGVsbGlnZW5jZScsXG4gICAgICAgICckYWdpJzogJ0FnaWxpdHknLFxuICAgICAgICAnJGFsbCc6ICdBbGwgQXR0cmlidXRlcycsXG4gICAgICAgICckYXR0YWNrJzogJ0F0dGFjayBTcGVlZCcsXG4gICAgICAgICckaHBfcmVnZW4nOiAnSFAgUmVnZW5lcmF0aW9uJyxcbiAgICAgICAgJyRtYW5hX3JlZ2VuJzogJ01hbmEgUmVnZW5lcmF0aW9uJyxcbiAgICAgICAgJyRtb3ZlX3NwZWVkJzogJ01vdmVtZW50IFNwZWVkJyxcbiAgICAgICAgJyRldmFzaW9uJzogJ0V2YXNpb24nLFxuICAgICAgICAnJHNwZWxsX3Jlc2lzdCc6ICdTcGVsbCBSZXNpc3RhbmNlJyxcbiAgICAgICAgJyRzZWxlY3RlZF9hdHRyaWJ1dGUnOiAnU2VsZWN0ZWQgQXR0cmlidXRlJyxcbiAgICAgICAgJyRzZWxlY3RlZF9hdHRyaWInOiAnU2VsZWN0ZWQgQXR0cmlidXRlJyxcbiAgICAgICAgJyRjYXN0X3JhbmdlJzogJ0Nhc3QgUmFuZ2UnLFxuICAgICAgICAnJGF0dGFja19yYW5nZSc6ICdBdHRhY2sgUmFuZ2UnXG5cdH1cblxuXHRmdW5jdGlvbiBnZXRUb29sdGlwSXRlbUF0dHJpYnV0ZXMoaXRlbSkge1xuXHRcdHZhciBhID0gJyc7XG5cdFx0Zm9yICh2YXIgaT0wO2k8aXRlbS5hdHRyaWJ1dGVzLmxlbmd0aDtpKyspIHtcblx0XHRcdGlmIChpdGVtLmF0dHJpYnV0ZXNbaV0udG9vbHRpcCAhPSBudWxsKSB7XG5cdFx0XHRcdHZhciBhdHRyaWJ1dGV0b29sdGlwID0gaXRlbS5hdHRyaWJ1dGVzW2ldLnRvb2x0aXA7XG5cdFx0XHRcdHZhciBhdHRyaWJ1dGV2YWx1ZSA9IGl0ZW0uYXR0cmlidXRlc1tpXS52YWx1ZVswXTtcblx0XHRcdFx0Zm9yICh2YXIgaj0xO2o8aXRlbS5hdHRyaWJ1dGVzW2ldLnZhbHVlLmxlbmd0aDtqKyspIHtcblx0XHRcdFx0XHRhdHRyaWJ1dGV2YWx1ZSArPSAnIC8gJyArIGl0ZW0uYXR0cmlidXRlc1tpXS52YWx1ZVtqXTtcblx0XHRcdFx0fVxuXHRcdFx0XHR2YXIgcCA9IGF0dHJpYnV0ZXRvb2x0aXAuaW5kZXhPZihcIiVcIik7XG5cdFx0XHRcdGlmIChwID09IDApIHtcblx0XHRcdFx0XHRhdHRyaWJ1dGV2YWx1ZSA9IGF0dHJpYnV0ZXZhbHVlICsgJyUnO1xuXHRcdFx0XHRcdGF0dHJpYnV0ZXRvb2x0aXAgPSBhdHRyaWJ1dGV0b29sdGlwLnNsaWNlKDEpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHZhciBkID0gYXR0cmlidXRldG9vbHRpcC5pbmRleE9mKFwiJFwiKTtcblx0XHRcdFx0aWYgKGQgIT0gLTEpIHtcblx0XHRcdFx0XHRhID0gYSArIGF0dHJpYnV0ZXRvb2x0aXAuc2xpY2UoMCwgZCkgKyAnICcgKyBhdHRyaWJ1dGV2YWx1ZSArICcgJyArIGFiaWxpdHlfdmFyc1thdHRyaWJ1dGV0b29sdGlwLnNsaWNlKGQpXSArICc8YnI+Jztcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRhID0gYSArIGF0dHJpYnV0ZXRvb2x0aXAgKyAnICcgKyBhdHRyaWJ1dGV2YWx1ZSArICc8YnI+Jztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gYS50cmltKCc8YnI+Jyk7XG5cdH1cblxuXHRmdW5jdGlvbiBnZXRUb29sdGlwSXRlbUNvb2xkb3duKGl0ZW0pIHtcblx0XHR2YXIgYyA9ICcnO1xuXHRcdGZvciAodmFyIGk9MDtpPGl0ZW0uY29vbGRvd24ubGVuZ3RoOyBpKyspIHtcblx0XHRcdGMgPSBjICsgJyAnICsgaXRlbS5jb29sZG93bltpXTtcblx0XHR9XG5cdFx0cmV0dXJuIGM7XG5cdH1cblxuXHRmdW5jdGlvbiBnZXRUb29sdGlwSXRlbU1hbmFDb3N0KGl0ZW0pIHtcblx0XHR2YXIgYyA9ICcnO1xuXHRcdGZvciAodmFyIGk9MDtpPGl0ZW0ubWFuYWNvc3QubGVuZ3RoOyBpKyspIHtcblx0XHRcdGlmIChpdGVtLm1hbmFjb3N0W2ldID4gMCkge1xuXHRcdFx0XHRjID0gYyArICcgJyArIGl0ZW0ubWFuYWNvc3RbaV07XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBjO1xuXHR9XG5cdFxuXHR2YXIgaXRlbURhdGE7XG5cdCQuZ2V0SlNPTihcIi9tZWRpYS9kb3RhLWpzb24vaXRlbWRhdGEuanNvblwiLCBmdW5jdGlvbiAoZGF0YSkge1xuXHRcdGl0ZW1EYXRhID0gZGF0YTtcblx0XHRmb3IgKGkgaW4gaXRlbURhdGEpIHtcblx0XHRcdHZhciBpdGVtID0gaXRlbURhdGFbaV07XG5cdFx0XHR2YXIgZGF0YSA9ICQoJzxkaXY+Jyk7XG5cdFx0XHRkYXRhLmFwcGVuZCgkKCc8c3Bhbj4nKS5odG1sKGl0ZW0uZGlzcGxheW5hbWUpLmF0dHIoJ2lkJywnaXRlbV9uYW1lJykuYWRkQ2xhc3MoJ2l0ZW1fZmllbGQnKSk7XG5cdFx0XHRkYXRhLmFwcGVuZCgkKCc8c3Bhbj4nKS5odG1sKGl0ZW0uaXRlbWNvc3QpLmF0dHIoJ2lkJywnaXRlbV9jb3N0JykuYWRkQ2xhc3MoJ2l0ZW1fZmllbGQnKSk7XG5cdFx0XHRkYXRhLmFwcGVuZCgkKCc8aHI+JykpO1xuXHRcdFx0aWYgKGl0ZW0uZGVzY3JpcHRpb24gIT0gbnVsbCkge1xuXHRcdFx0XHRkYXRhLmFwcGVuZCgkKCc8ZGl2PicpLmh0bWwoZ2V0VG9vbHRpcEl0ZW1EZXNjcmlwdGlvbihpdGVtKSkuYXR0cignaWQnLCdpdGVtX2Rlc2NyaXB0aW9uJykuYWRkQ2xhc3MoJ2l0ZW1fZmllbGQnKSk7XG5cdFx0XHR9XG5cdFx0XHR2YXIgYXR0cmlidXRlZGF0YSA9IGdldFRvb2x0aXBJdGVtQXR0cmlidXRlcyhpdGVtKTtcblx0XHRcdGlmIChhdHRyaWJ1dGVkYXRhICE9ICcnKSB7XG5cdFx0XHRcdGRhdGEuYXBwZW5kKCQoJzxkaXY+JykuaHRtbChhdHRyaWJ1dGVkYXRhKS5hdHRyKCdpZCcsJ2l0ZW1fYXR0cmlidXRlcycpLmFkZENsYXNzKCdpdGVtX2ZpZWxkJykpO1xuXHRcdFx0fVxuXHRcdFx0dmFyIGNkID0gZ2V0VG9vbHRpcEl0ZW1Db29sZG93bihpdGVtKTtcblx0XHRcdHZhciBtYW5hID0gZ2V0VG9vbHRpcEl0ZW1NYW5hQ29zdChpdGVtKTtcblx0XHRcdGlmIChjZCAhPSAnJyB8fCBtYW5hICE9ICcnKSB7XG5cdFx0XHRcdHZhciBjZG1hbmFjb3N0ID0gJCgnPGRpdj4nKS5hdHRyKCdpZCcsJ2l0ZW1fY2RtYW5hJyk7XG5cdFx0XHRcdGlmIChjZCAhPSAnJykge1xuXHRcdFx0XHRcdGNkbWFuYWNvc3QuYXBwZW5kKCQoJzxzcGFuPicpLmh0bWwoY2QpLmF0dHIoJ2lkJywnaXRlbV9jb29sZG93bicpLmFkZENsYXNzKCdpdGVtX2ZpZWxkJykpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChtYW5hICE9ICcnKSB7XG5cdFx0XHRcdFx0Y2RtYW5hY29zdC5hcHBlbmQoJCgnPHNwYW4+JykuaHRtbChtYW5hKS5hdHRyKCdpZCcsJ2l0ZW1fbWFuYWNvc3QnKS5hZGRDbGFzcygnaXRlbV9maWVsZCcpKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRkYXRhLmFwcGVuZChjZG1hbmFjb3N0KTtcblx0XHRcdH1cblx0XHRcdGlmIChpdGVtLmxvcmUgIT0gbnVsbCkge1xuXHRcdFx0XHRkYXRhLmFwcGVuZCgkKCc8ZGl2PicpLmh0bWwoaXRlbS5sb3JlKS5hdHRyKCdpZCcsJ2l0ZW1fbG9yZScpLmFkZENsYXNzKCdpdGVtX2ZpZWxkJykpO1xuXHRcdFx0fVxuXHRcdFx0aXRlbV9kYXRhW2kucmVwbGFjZSgnaXRlbV8nLCAnJyldID0gZGF0YS5odG1sKCk7XG5cdFx0fVxuICAgIFxuICAgICAgICAkKCcjc2VhcmNoLWl0ZW1zJykua2V5dXAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHNlYXJjaFZhbCA9ICQodGhpcykudmFsKCkudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgICQoXCIuc2hvcC1pdGVtXCIpLnJlbW92ZUNsYXNzKCduby1tYXRjaCcpO1xuICAgICAgICAgICAgJChcIi5zaG9wLWl0ZW1cIikuZmlsdGVyKGZ1bmN0aW9uKCBpbmRleCApIHtcbiAgICAgICAgICAgIHZhciBpdGVtSWQgPSAkKHRoaXMpLmZpbmQoJy5pdGVtcy1zcHJpdGUtNzB4NTAnKS5hdHRyKCdpZCcpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICB2YXIgaXRlbU5hbWUgPSBpdGVtRGF0YVsnaXRlbV8nICsgaXRlbUlkXS5kaXNwbGF5bmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgICAgIHJldHVybiBpdGVtSWQuaW5kZXhPZihzZWFyY2hWYWwpID09PSAtMSAmJiBpdGVtTmFtZS5pbmRleE9mKHNlYXJjaFZhbCkgPT09IC0xICYmIGl0ZW1OYW1lLm1hdGNoKC9cXGIoXFx3KS9nKS5qb2luKCcnKS5pbmRleE9mKHNlYXJjaFZhbCkgPT09IC0xO1xuICAgICAgICAgICAgfSkuYWRkQ2xhc3MoJ25vLW1hdGNoJyk7XG4gICAgICAgIH0pO1xuICAgIFxuXHR9KTtcbn0pOyJdfQ==
