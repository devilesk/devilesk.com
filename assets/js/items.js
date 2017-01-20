require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({30:[function(require,module,exports){
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
},{"bootstrap":1,"jquery":14}]},{},[30])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvaXRlbXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciAkID0galF1ZXJ5ID0gcmVxdWlyZSgnanF1ZXJ5Jyk7XG5yZXF1aXJlKCdib290c3RyYXAnKTtcblxuJChmdW5jdGlvbiAoKSB7XG5cdCQoJyNjb25zdW1hYmxlcycpLnRvb2x0aXAoe1xuXHRcdHRpdGxlOiAnQ29uc3VtYWJsZXMnXG5cdH0pO1xuXHQkKCcjYXR0cmlidXRlcycpLnRvb2x0aXAoe1xuXHRcdHRpdGxlOiAnQXR0cmlidXRlcydcblx0fSk7XG5cdCQoJyNhcm1hbWVudHMnKS50b29sdGlwKHtcblx0XHR0aXRsZTogJ0FybWFtZW50cydcblx0fSk7XG5cdCQoJyNhcmNhbmUnKS50b29sdGlwKHtcblx0XHR0aXRsZTogJ0FyY2FuZSdcblx0fSk7XG5cdCQoJyNjb21tb24nKS50b29sdGlwKHtcblx0XHR0aXRsZTogJ0NvbW1vbidcblx0fSk7XG5cdCQoJyNzdXBwb3J0JykudG9vbHRpcCh7XG5cdFx0dGl0bGU6ICdTdXBwb3J0J1xuXHR9KTtcblx0JCgnI2Nhc3RlcicpLnRvb2x0aXAoe1xuXHRcdHRpdGxlOiAnQ2FzdGVyJ1xuXHR9KTtcblx0JCgnI3dlYXBvbnMnKS50b29sdGlwKHtcblx0XHR0aXRsZTogJ1dlYXBvbnMnXG5cdH0pO1xuXHQkKCcjYXJtb3InKS50b29sdGlwKHtcblx0XHR0aXRsZTogJ0FybW9yJ1xuXHR9KTtcblx0JCgnI2FydGlmYWN0cycpLnRvb2x0aXAoe1xuXHRcdHRpdGxlOiAnQXJ0aWZhY3RzJ1xuXHR9KTtcblx0JCgnI3NlY3JldCcpLnRvb2x0aXAoe1xuXHRcdHRpdGxlOiAnU2VjcmV0J1xuXHR9KTtcblxuXHR2YXIgaXRlbV9kYXRhID0ge31cblxuXHRnZXRfZGF0YV9mb3JfcG9wb3Zlcl9hbmRfZGlzcGxheSA9IGZ1bmN0aW9uICgpIHtcblx0XHR2YXIgZWwgPSAkKHRoaXMpO1xuXHRcdGlmIChlbC5maW5kKCcuaXRlbXMtc3ByaXRlLTcweDUwJykuYXR0cignaWQnKSBpbiBpdGVtX2RhdGEpIHtcblx0XHRcdGVsLmF0dHIoJ2RhdGEtY29udGVudCcsIGl0ZW1fZGF0YVtlbC5maW5kKCcuaXRlbXMtc3ByaXRlLTcweDUwJykuYXR0cignaWQnKV0pO1xuXHRcdFx0aWYgKGVsLmlzKCc6aG92ZXInKSkge1xuXHRcdFx0XHRlbC5wb3BvdmVyKCdzaG93Jyk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0aGlkZV9wb3BvdmVyID0gZnVuY3Rpb24gKCkge1xuXHRcdHZhciBlbCA9ICQodGhpcyk7XG5cdFx0ZWwucG9wb3ZlcignaGlkZScpXG5cdH1cblx0JCgnLnNob3AtaXRlbScpLnBvcG92ZXIoe1xuXHRcdFwidHJpZ2dlclwiOiBcImhvdmVyXCIsXG5cdFx0XCJodG1sXCI6IHRydWUsXG5cdFx0XCJhbmltYXRpb25cIjogZmFsc2Vcblx0fSk7XG5cdCQoJy5zaG9wLWl0ZW0nKS5ob3ZlcihnZXRfZGF0YV9mb3JfcG9wb3Zlcl9hbmRfZGlzcGxheSwgaGlkZV9wb3BvdmVyKTtcblx0XG5cdHZhciBpdGVtdG9vbHRpcGRhdGEgPSB7fVxuXG5cdGZ1bmN0aW9uIGdldFRvb2x0aXBJdGVtRGVzY3JpcHRpb24oaXRlbSkge1xuXHRcdHZhciBkID0gaXRlbS5kZXNjcmlwdGlvbjtcblx0XHRmb3IgKHZhciBpPTA7aTxpdGVtLmF0dHJpYnV0ZXMubGVuZ3RoO2krKykge1xuXHRcdFx0aWYgKGl0ZW0uYXR0cmlidXRlc1tpXS5uYW1lICE9IG51bGwpIHtcblx0XHRcdFx0dmFyIGF0dHJpYnV0ZW5hbWUgPSBpdGVtLmF0dHJpYnV0ZXNbaV0ubmFtZTtcblx0XHRcdFx0dmFyIGF0dHJpYnV0ZXZhbHVlID0gaXRlbS5hdHRyaWJ1dGVzW2ldLnZhbHVlWzBdO1xuXHRcdFx0XHRmb3IgKHZhciBqPTE7ajxpdGVtLmF0dHJpYnV0ZXNbaV0udmFsdWUubGVuZ3RoO2orKykge1xuXHRcdFx0XHRcdGF0dHJpYnV0ZXZhbHVlICs9ICcgLyAnICsgaXRlbS5hdHRyaWJ1dGVzW2ldLnZhbHVlW2pdO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHZhciByZWdleHAgPSBuZXcgUmVnRXhwKCclJyArIGF0dHJpYnV0ZW5hbWUgKyAnJScsIFwiZ2lcIik7XG5cdFx0XHRcdGQgPSBkLnJlcGxhY2UocmVnZXhwLCBhdHRyaWJ1dGV2YWx1ZSApO1xuXHRcdFx0fVxuXHRcdH1cblx0XHR2YXIgcmVnZXhwID0gbmV3IFJlZ0V4cCgnJSUnLCBcImdpXCIpO1xuXHRcdGQgPSBkLnJlcGxhY2UocmVnZXhwLCclJyk7XG5cdFx0cmVnZXhwID0gbmV3IFJlZ0V4cCgnXFxuJywgXCJnaVwiKTtcblx0XHRkID0gZC5yZXBsYWNlKC9cXFxcbi9nLCBcIjxicj5cIik7XG5cdFx0cmV0dXJuIGQ7XG5cdH1cblxuXHR2YXIgYWJpbGl0eV92YXJzID0ge1xuXHRcdCckaGVhbHRoJzonSGVhbHRoJyxcblx0XHQnJG1hbmEnOidNYW5hJyxcblx0XHQnJGFybW9yJzonQXJtb3InLFxuXHRcdCckZGFtYWdlJzonRGFtYWdlJyxcblx0XHQnJHN0cic6J1N0cmVuZ3RoJyxcblx0XHQnJGludCc6J0ludGVsbGlnZW5jZScsXG5cdFx0JyRhZ2knOidBZ2lsaXR5Jyxcblx0XHQnJGFsbCc6J0FsbCBBdHRyaWJ1dGVzJyxcblx0XHQnJGF0dGFjayc6J0F0dGFjayBTcGVlZCcsXG5cdFx0JyRocF9yZWdlbic6J0hQIFJlZ2VuZXJhdGlvbicsXG5cdFx0JyRtYW5hX3JlZ2VuJzonTWFuYSBSZWdlbmVyYXRpb24nLFxuXHRcdCckbW92ZV9zcGVlZCc6J01vdmVtZW50IFNwZWVkJyxcblx0XHQnJGV2YXNpb24nOidFdmFzaW9uJyxcblx0XHQnJHNwZWxsX3Jlc2lzdCc6J1NwZWxsIFJlc2lzdGFuY2UnLFxuXHRcdCckc2VsZWN0ZWRfYXR0cmlidXRlJzonU2VsZWN0ZWQgQXR0cmlidXRlJ1xuXHR9XG5cblx0ZnVuY3Rpb24gZ2V0VG9vbHRpcEl0ZW1BdHRyaWJ1dGVzKGl0ZW0pIHtcblx0XHR2YXIgYSA9ICcnO1xuXHRcdGZvciAodmFyIGk9MDtpPGl0ZW0uYXR0cmlidXRlcy5sZW5ndGg7aSsrKSB7XG5cdFx0XHRpZiAoaXRlbS5hdHRyaWJ1dGVzW2ldLnRvb2x0aXAgIT0gbnVsbCkge1xuXHRcdFx0XHR2YXIgYXR0cmlidXRldG9vbHRpcCA9IGl0ZW0uYXR0cmlidXRlc1tpXS50b29sdGlwO1xuXHRcdFx0XHR2YXIgYXR0cmlidXRldmFsdWUgPSBpdGVtLmF0dHJpYnV0ZXNbaV0udmFsdWVbMF07XG5cdFx0XHRcdGZvciAodmFyIGo9MTtqPGl0ZW0uYXR0cmlidXRlc1tpXS52YWx1ZS5sZW5ndGg7aisrKSB7XG5cdFx0XHRcdFx0YXR0cmlidXRldmFsdWUgKz0gJyAvICcgKyBpdGVtLmF0dHJpYnV0ZXNbaV0udmFsdWVbal07XG5cdFx0XHRcdH1cblx0XHRcdFx0dmFyIHAgPSBhdHRyaWJ1dGV0b29sdGlwLmluZGV4T2YoXCIlXCIpO1xuXHRcdFx0XHRpZiAocCA9PSAwKSB7XG5cdFx0XHRcdFx0YXR0cmlidXRldmFsdWUgPSBhdHRyaWJ1dGV2YWx1ZSArICclJztcblx0XHRcdFx0XHRhdHRyaWJ1dGV0b29sdGlwID0gYXR0cmlidXRldG9vbHRpcC5zbGljZSgxKTtcblx0XHRcdFx0fVxuXHRcdFx0XHR2YXIgZCA9IGF0dHJpYnV0ZXRvb2x0aXAuaW5kZXhPZihcIiRcIik7XG5cdFx0XHRcdGlmIChkICE9IC0xKSB7XG5cdFx0XHRcdFx0YSA9IGEgKyBhdHRyaWJ1dGV0b29sdGlwLnNsaWNlKDAsIGQpICsgJyAnICsgYXR0cmlidXRldmFsdWUgKyAnICcgKyBhYmlsaXR5X3ZhcnNbYXR0cmlidXRldG9vbHRpcC5zbGljZShkKV0gKyAnPGJyPic7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0YSA9IGEgKyBhdHRyaWJ1dGV0b29sdGlwICsgJyAnICsgYXR0cmlidXRldmFsdWUgKyAnPGJyPic7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIGEudHJpbSgnPGJyPicpO1xuXHR9XG5cblx0ZnVuY3Rpb24gZ2V0VG9vbHRpcEl0ZW1Db29sZG93bihpdGVtKSB7XG5cdFx0dmFyIGMgPSAnJztcblx0XHRmb3IgKHZhciBpPTA7aTxpdGVtLmNvb2xkb3duLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRjID0gYyArICcgJyArIGl0ZW0uY29vbGRvd25baV07XG5cdFx0fVxuXHRcdHJldHVybiBjO1xuXHR9XG5cblx0ZnVuY3Rpb24gZ2V0VG9vbHRpcEl0ZW1NYW5hQ29zdChpdGVtKSB7XG5cdFx0dmFyIGMgPSAnJztcblx0XHRmb3IgKHZhciBpPTA7aTxpdGVtLm1hbmFjb3N0Lmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRpZiAoaXRlbS5tYW5hY29zdFtpXSA+IDApIHtcblx0XHRcdFx0YyA9IGMgKyAnICcgKyBpdGVtLm1hbmFjb3N0W2ldO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gYztcblx0fVxuXHRcblx0dmFyIGl0ZW1EYXRhO1xuXHQkLmdldEpTT04oXCIvbWVkaWEvZG90YS1qc29uL2l0ZW1kYXRhLmpzb25cIiwgZnVuY3Rpb24gKGRhdGEpIHtcblx0XHRpdGVtRGF0YSA9IGRhdGE7XG5cdFx0Zm9yIChpIGluIGl0ZW1EYXRhKSB7XG5cdFx0XHR2YXIgaXRlbSA9IGl0ZW1EYXRhW2ldO1xuXHRcdFx0dmFyIGRhdGEgPSAkKCc8ZGl2PicpO1xuXHRcdFx0ZGF0YS5hcHBlbmQoJCgnPHNwYW4+JykuaHRtbChpdGVtLmRpc3BsYXluYW1lKS5hdHRyKCdpZCcsJ2l0ZW1fbmFtZScpLmFkZENsYXNzKCdpdGVtX2ZpZWxkJykpO1xuXHRcdFx0ZGF0YS5hcHBlbmQoJCgnPHNwYW4+JykuaHRtbChpdGVtLml0ZW1jb3N0KS5hdHRyKCdpZCcsJ2l0ZW1fY29zdCcpLmFkZENsYXNzKCdpdGVtX2ZpZWxkJykpO1xuXHRcdFx0ZGF0YS5hcHBlbmQoJCgnPGhyPicpKTtcblx0XHRcdGlmIChpdGVtLmRlc2NyaXB0aW9uICE9IG51bGwpIHtcblx0XHRcdFx0ZGF0YS5hcHBlbmQoJCgnPGRpdj4nKS5odG1sKGdldFRvb2x0aXBJdGVtRGVzY3JpcHRpb24oaXRlbSkpLmF0dHIoJ2lkJywnaXRlbV9kZXNjcmlwdGlvbicpLmFkZENsYXNzKCdpdGVtX2ZpZWxkJykpO1xuXHRcdFx0fVxuXHRcdFx0dmFyIGF0dHJpYnV0ZWRhdGEgPSBnZXRUb29sdGlwSXRlbUF0dHJpYnV0ZXMoaXRlbSk7XG5cdFx0XHRpZiAoYXR0cmlidXRlZGF0YSAhPSAnJykge1xuXHRcdFx0XHRkYXRhLmFwcGVuZCgkKCc8ZGl2PicpLmh0bWwoYXR0cmlidXRlZGF0YSkuYXR0cignaWQnLCdpdGVtX2F0dHJpYnV0ZXMnKS5hZGRDbGFzcygnaXRlbV9maWVsZCcpKTtcblx0XHRcdH1cblx0XHRcdHZhciBjZCA9IGdldFRvb2x0aXBJdGVtQ29vbGRvd24oaXRlbSk7XG5cdFx0XHR2YXIgbWFuYSA9IGdldFRvb2x0aXBJdGVtTWFuYUNvc3QoaXRlbSk7XG5cdFx0XHRpZiAoY2QgIT0gJycgfHwgbWFuYSAhPSAnJykge1xuXHRcdFx0XHR2YXIgY2RtYW5hY29zdCA9ICQoJzxkaXY+JykuYXR0cignaWQnLCdpdGVtX2NkbWFuYScpO1xuXHRcdFx0XHRpZiAoY2QgIT0gJycpIHtcblx0XHRcdFx0XHRjZG1hbmFjb3N0LmFwcGVuZCgkKCc8c3Bhbj4nKS5odG1sKGNkKS5hdHRyKCdpZCcsJ2l0ZW1fY29vbGRvd24nKS5hZGRDbGFzcygnaXRlbV9maWVsZCcpKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAobWFuYSAhPSAnJykge1xuXHRcdFx0XHRcdGNkbWFuYWNvc3QuYXBwZW5kKCQoJzxzcGFuPicpLmh0bWwobWFuYSkuYXR0cignaWQnLCdpdGVtX21hbmFjb3N0JykuYWRkQ2xhc3MoJ2l0ZW1fZmllbGQnKSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZGF0YS5hcHBlbmQoY2RtYW5hY29zdCk7XG5cdFx0XHR9XG5cdFx0XHRpZiAoaXRlbS5sb3JlICE9IG51bGwpIHtcblx0XHRcdFx0ZGF0YS5hcHBlbmQoJCgnPGRpdj4nKS5odG1sKGl0ZW0ubG9yZSkuYXR0cignaWQnLCdpdGVtX2xvcmUnKS5hZGRDbGFzcygnaXRlbV9maWVsZCcpKTtcblx0XHRcdH1cblx0XHRcdGl0ZW1fZGF0YVtpLnJlcGxhY2UoJ2l0ZW1fJywgJycpXSA9IGRhdGEuaHRtbCgpO1xuXHRcdH1cbiAgICBcbiAgICAkKCcjc2VhcmNoLWl0ZW1zJykua2V5dXAoZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIHNlYXJjaFZhbCA9ICQodGhpcykudmFsKCkudG9Mb3dlckNhc2UoKTtcbiAgICAgICQoXCIuc2hvcC1pdGVtXCIpLnJlbW92ZUNsYXNzKCduby1tYXRjaCcpO1xuICAgICAgJChcIi5zaG9wLWl0ZW1cIikuZmlsdGVyKGZ1bmN0aW9uKCBpbmRleCApIHtcbiAgICAgICAgdmFyIGl0ZW1JZCA9ICQodGhpcykuZmluZCgnLml0ZW1zLXNwcml0ZS03MHg1MCcpLmF0dHIoJ2lkJykudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgdmFyIGl0ZW1OYW1lID0gaXRlbURhdGFbJ2l0ZW1fJyArIGl0ZW1JZF0uZGlzcGxheW5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgcmV0dXJuIGl0ZW1JZC5pbmRleE9mKHNlYXJjaFZhbCkgPT09IC0xICYmIGl0ZW1OYW1lLmluZGV4T2Yoc2VhcmNoVmFsKSA9PT0gLTEgJiYgaXRlbU5hbWUubWF0Y2goL1xcYihcXHcpL2cpLmpvaW4oJycpLmluZGV4T2Yoc2VhcmNoVmFsKSA9PT0gLTE7XG4gICAgICB9KS5hZGRDbGFzcygnbm8tbWF0Y2gnKTtcbiAgICB9KTtcbiAgICBcblx0fSk7XG59KTsiXX0=
