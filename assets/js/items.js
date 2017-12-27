require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({32:[function(require,module,exports){
var bsn = require("bootstrap.native");
var getJSON = require('./util/getJSON');

var item_data = {}

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
getJSON("/media/dota-json/itemdata.json", function (data) {
    itemData = data;
    for (i in itemData) {
        var item = itemData[i];
        var data = '<span id="item_name" class="item_field">' + item.displayname + '</span>';
        data += '<span id="item_cost" class="item_field">' + item.itemcost + '</span>';
        data += '<hr>';
        if (item.description != null) {
            data += '<div id="item_description" class="item_field">' + getTooltipItemDescription(item) + '</div>';
        }
        var attributedata = getTooltipItemAttributes(item);
        if (attributedata != '') {
            data += '<div id="item_attributes" class="item_field">' + attributedata + '</div>';
        }
        var cd = getTooltipItemCooldown(item);
        var mana = getTooltipItemManaCost(item);
        if (cd != '' || mana != '') {
            data += '<div id="item_cdmana">';
            if (cd != '') {
                data += '<span id="item_cooldown" class="item_field">' + cd + '</span>';
            }
            if (mana != '') {
                data += '<span id="item_manacost" class="item_field">' + mana + '</span>';
            }
            data += '</div>';
        }
        if (item.lore != null) {
            data += '<div id="item_lore" class="item_field">' + item.lore + '</div>';
        }
        item_data[i.replace('item_', '')] = data;
    }
    
    document.getElementById('search-items').addEventListener('keyup', function(event) {
        var searchVal = this.value.toLowerCase();
        var elems = document.querySelectorAll(".shop-item");
        for (var i = 0; i < elems.length; i++) {
            var el = elems[i];
            el.classList.remove("no-match");
        }
        
        [].filter.call(elems, function (element) {
            var itemId = element.querySelector('.items-sprite-70x50').id.toLowerCase();
            var itemName = itemData['item_' + itemId].displayname.toLowerCase();
            return itemId.indexOf(searchVal) === -1 && itemName.indexOf(searchVal) === -1 && itemName.match(/\b(\w)/g).join('').indexOf(searchVal) === -1;
        }).forEach(function (element) {
            element.classList.add("no-match");
        });
    });

    var divs = document.querySelectorAll('.shop-item');
    for (var i = 0; i < divs.length ;i++) {
        var element = divs[i];
        element.setAttribute('data-content', item_data[element.querySelector('.items-sprite-70x50').id]);
        new bsn.Popover(element, {
            trigger: "hover",
            html: true,
            animation: false,
            placement: "right"
        });
    }
});
},{"./util/getJSON":39,"bootstrap.native":1}]},{},[32])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvaXRlbXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgYnNuID0gcmVxdWlyZShcImJvb3RzdHJhcC5uYXRpdmVcIik7XG52YXIgZ2V0SlNPTiA9IHJlcXVpcmUoJy4vdXRpbC9nZXRKU09OJyk7XG5cbnZhciBpdGVtX2RhdGEgPSB7fVxuXG52YXIgaXRlbXRvb2x0aXBkYXRhID0ge31cblxuZnVuY3Rpb24gZ2V0VG9vbHRpcEl0ZW1EZXNjcmlwdGlvbihpdGVtKSB7XG4gICAgdmFyIGQgPSBpdGVtLmRlc2NyaXB0aW9uO1xuICAgIGZvciAodmFyIGk9MDtpPGl0ZW0uYXR0cmlidXRlcy5sZW5ndGg7aSsrKSB7XG4gICAgICAgIGlmIChpdGVtLmF0dHJpYnV0ZXNbaV0ubmFtZSAhPSBudWxsKSB7XG4gICAgICAgICAgICB2YXIgYXR0cmlidXRlbmFtZSA9IGl0ZW0uYXR0cmlidXRlc1tpXS5uYW1lO1xuICAgICAgICAgICAgdmFyIGF0dHJpYnV0ZXZhbHVlID0gaXRlbS5hdHRyaWJ1dGVzW2ldLnZhbHVlWzBdO1xuICAgICAgICAgICAgZm9yICh2YXIgaj0xO2o8aXRlbS5hdHRyaWJ1dGVzW2ldLnZhbHVlLmxlbmd0aDtqKyspIHtcbiAgICAgICAgICAgICAgICBhdHRyaWJ1dGV2YWx1ZSArPSAnIC8gJyArIGl0ZW0uYXR0cmlidXRlc1tpXS52YWx1ZVtqXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciByZWdleHAgPSBuZXcgUmVnRXhwKCclJyArIGF0dHJpYnV0ZW5hbWUgKyAnJScsIFwiZ2lcIik7XG4gICAgICAgICAgICBkID0gZC5yZXBsYWNlKHJlZ2V4cCwgYXR0cmlidXRldmFsdWUgKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICB2YXIgcmVnZXhwID0gbmV3IFJlZ0V4cCgnJSUnLCBcImdpXCIpO1xuICAgIGQgPSBkLnJlcGxhY2UocmVnZXhwLCclJyk7XG4gICAgcmVnZXhwID0gbmV3IFJlZ0V4cCgnXFxuJywgXCJnaVwiKTtcbiAgICBkID0gZC5yZXBsYWNlKC9cXFxcbi9nLCBcIjxicj5cIik7XG4gICAgcmV0dXJuIGQ7XG59XG5cbnZhciBhYmlsaXR5X3ZhcnMgPSB7XG4gICAgJyRoZWFsdGgnOiAnSGVhbHRoJyxcbiAgICAnJG1hbmEnOiAnTWFuYScsXG4gICAgJyRhcm1vcic6ICdBcm1vcicsXG4gICAgJyRkYW1hZ2UnOiAnRGFtYWdlJyxcbiAgICAnJHN0cic6ICdTdHJlbmd0aCcsXG4gICAgJyRpbnQnOiAnSW50ZWxsaWdlbmNlJyxcbiAgICAnJGFnaSc6ICdBZ2lsaXR5JyxcbiAgICAnJGFsbCc6ICdBbGwgQXR0cmlidXRlcycsXG4gICAgJyRhdHRhY2snOiAnQXR0YWNrIFNwZWVkJyxcbiAgICAnJGhwX3JlZ2VuJzogJ0hQIFJlZ2VuZXJhdGlvbicsXG4gICAgJyRtYW5hX3JlZ2VuJzogJ01hbmEgUmVnZW5lcmF0aW9uJyxcbiAgICAnJG1vdmVfc3BlZWQnOiAnTW92ZW1lbnQgU3BlZWQnLFxuICAgICckZXZhc2lvbic6ICdFdmFzaW9uJyxcbiAgICAnJHNwZWxsX3Jlc2lzdCc6ICdTcGVsbCBSZXNpc3RhbmNlJyxcbiAgICAnJHNlbGVjdGVkX2F0dHJpYnV0ZSc6ICdTZWxlY3RlZCBBdHRyaWJ1dGUnLFxuICAgICckc2VsZWN0ZWRfYXR0cmliJzogJ1NlbGVjdGVkIEF0dHJpYnV0ZScsXG4gICAgJyRjYXN0X3JhbmdlJzogJ0Nhc3QgUmFuZ2UnLFxuICAgICckYXR0YWNrX3JhbmdlJzogJ0F0dGFjayBSYW5nZSdcbn1cblxuZnVuY3Rpb24gZ2V0VG9vbHRpcEl0ZW1BdHRyaWJ1dGVzKGl0ZW0pIHtcbiAgICB2YXIgYSA9ICcnO1xuICAgIGZvciAodmFyIGk9MDtpPGl0ZW0uYXR0cmlidXRlcy5sZW5ndGg7aSsrKSB7XG4gICAgICAgIGlmIChpdGVtLmF0dHJpYnV0ZXNbaV0udG9vbHRpcCAhPSBudWxsKSB7XG4gICAgICAgICAgICB2YXIgYXR0cmlidXRldG9vbHRpcCA9IGl0ZW0uYXR0cmlidXRlc1tpXS50b29sdGlwO1xuICAgICAgICAgICAgdmFyIGF0dHJpYnV0ZXZhbHVlID0gaXRlbS5hdHRyaWJ1dGVzW2ldLnZhbHVlWzBdO1xuICAgICAgICAgICAgZm9yICh2YXIgaj0xO2o8aXRlbS5hdHRyaWJ1dGVzW2ldLnZhbHVlLmxlbmd0aDtqKyspIHtcbiAgICAgICAgICAgICAgICBhdHRyaWJ1dGV2YWx1ZSArPSAnIC8gJyArIGl0ZW0uYXR0cmlidXRlc1tpXS52YWx1ZVtqXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBwID0gYXR0cmlidXRldG9vbHRpcC5pbmRleE9mKFwiJVwiKTtcbiAgICAgICAgICAgIGlmIChwID09IDApIHtcbiAgICAgICAgICAgICAgICBhdHRyaWJ1dGV2YWx1ZSA9IGF0dHJpYnV0ZXZhbHVlICsgJyUnO1xuICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXRvb2x0aXAgPSBhdHRyaWJ1dGV0b29sdGlwLnNsaWNlKDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGQgPSBhdHRyaWJ1dGV0b29sdGlwLmluZGV4T2YoXCIkXCIpO1xuICAgICAgICAgICAgaWYgKGQgIT0gLTEpIHtcbiAgICAgICAgICAgICAgICBhID0gYSArIGF0dHJpYnV0ZXRvb2x0aXAuc2xpY2UoMCwgZCkgKyAnICcgKyBhdHRyaWJ1dGV2YWx1ZSArICcgJyArIGFiaWxpdHlfdmFyc1thdHRyaWJ1dGV0b29sdGlwLnNsaWNlKGQpXSArICc8YnI+JztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGEgPSBhICsgYXR0cmlidXRldG9vbHRpcCArICcgJyArIGF0dHJpYnV0ZXZhbHVlICsgJzxicj4nO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBhLnRyaW0oJzxicj4nKTtcbn1cblxuZnVuY3Rpb24gZ2V0VG9vbHRpcEl0ZW1Db29sZG93bihpdGVtKSB7XG4gICAgdmFyIGMgPSAnJztcbiAgICBmb3IgKHZhciBpPTA7aTxpdGVtLmNvb2xkb3duLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGMgPSBjICsgJyAnICsgaXRlbS5jb29sZG93bltpXTtcbiAgICB9XG4gICAgcmV0dXJuIGM7XG59XG5cbmZ1bmN0aW9uIGdldFRvb2x0aXBJdGVtTWFuYUNvc3QoaXRlbSkge1xuICAgIHZhciBjID0gJyc7XG4gICAgZm9yICh2YXIgaT0wO2k8aXRlbS5tYW5hY29zdC5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoaXRlbS5tYW5hY29zdFtpXSA+IDApIHtcbiAgICAgICAgICAgIGMgPSBjICsgJyAnICsgaXRlbS5tYW5hY29zdFtpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gYztcbn1cblxudmFyIGl0ZW1EYXRhO1xuZ2V0SlNPTihcIi9tZWRpYS9kb3RhLWpzb24vaXRlbWRhdGEuanNvblwiLCBmdW5jdGlvbiAoZGF0YSkge1xuICAgIGl0ZW1EYXRhID0gZGF0YTtcbiAgICBmb3IgKGkgaW4gaXRlbURhdGEpIHtcbiAgICAgICAgdmFyIGl0ZW0gPSBpdGVtRGF0YVtpXTtcbiAgICAgICAgdmFyIGRhdGEgPSAnPHNwYW4gaWQ9XCJpdGVtX25hbWVcIiBjbGFzcz1cIml0ZW1fZmllbGRcIj4nICsgaXRlbS5kaXNwbGF5bmFtZSArICc8L3NwYW4+JztcbiAgICAgICAgZGF0YSArPSAnPHNwYW4gaWQ9XCJpdGVtX2Nvc3RcIiBjbGFzcz1cIml0ZW1fZmllbGRcIj4nICsgaXRlbS5pdGVtY29zdCArICc8L3NwYW4+JztcbiAgICAgICAgZGF0YSArPSAnPGhyPic7XG4gICAgICAgIGlmIChpdGVtLmRlc2NyaXB0aW9uICE9IG51bGwpIHtcbiAgICAgICAgICAgIGRhdGEgKz0gJzxkaXYgaWQ9XCJpdGVtX2Rlc2NyaXB0aW9uXCIgY2xhc3M9XCJpdGVtX2ZpZWxkXCI+JyArIGdldFRvb2x0aXBJdGVtRGVzY3JpcHRpb24oaXRlbSkgKyAnPC9kaXY+JztcbiAgICAgICAgfVxuICAgICAgICB2YXIgYXR0cmlidXRlZGF0YSA9IGdldFRvb2x0aXBJdGVtQXR0cmlidXRlcyhpdGVtKTtcbiAgICAgICAgaWYgKGF0dHJpYnV0ZWRhdGEgIT0gJycpIHtcbiAgICAgICAgICAgIGRhdGEgKz0gJzxkaXYgaWQ9XCJpdGVtX2F0dHJpYnV0ZXNcIiBjbGFzcz1cIml0ZW1fZmllbGRcIj4nICsgYXR0cmlidXRlZGF0YSArICc8L2Rpdj4nO1xuICAgICAgICB9XG4gICAgICAgIHZhciBjZCA9IGdldFRvb2x0aXBJdGVtQ29vbGRvd24oaXRlbSk7XG4gICAgICAgIHZhciBtYW5hID0gZ2V0VG9vbHRpcEl0ZW1NYW5hQ29zdChpdGVtKTtcbiAgICAgICAgaWYgKGNkICE9ICcnIHx8IG1hbmEgIT0gJycpIHtcbiAgICAgICAgICAgIGRhdGEgKz0gJzxkaXYgaWQ9XCJpdGVtX2NkbWFuYVwiPic7XG4gICAgICAgICAgICBpZiAoY2QgIT0gJycpIHtcbiAgICAgICAgICAgICAgICBkYXRhICs9ICc8c3BhbiBpZD1cIml0ZW1fY29vbGRvd25cIiBjbGFzcz1cIml0ZW1fZmllbGRcIj4nICsgY2QgKyAnPC9zcGFuPic7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobWFuYSAhPSAnJykge1xuICAgICAgICAgICAgICAgIGRhdGEgKz0gJzxzcGFuIGlkPVwiaXRlbV9tYW5hY29zdFwiIGNsYXNzPVwiaXRlbV9maWVsZFwiPicgKyBtYW5hICsgJzwvc3Bhbj4nO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGF0YSArPSAnPC9kaXY+JztcbiAgICAgICAgfVxuICAgICAgICBpZiAoaXRlbS5sb3JlICE9IG51bGwpIHtcbiAgICAgICAgICAgIGRhdGEgKz0gJzxkaXYgaWQ9XCJpdGVtX2xvcmVcIiBjbGFzcz1cIml0ZW1fZmllbGRcIj4nICsgaXRlbS5sb3JlICsgJzwvZGl2Pic7XG4gICAgICAgIH1cbiAgICAgICAgaXRlbV9kYXRhW2kucmVwbGFjZSgnaXRlbV8nLCAnJyldID0gZGF0YTtcbiAgICB9XG4gICAgXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlYXJjaC1pdGVtcycpLmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgdmFyIHNlYXJjaFZhbCA9IHRoaXMudmFsdWUudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgdmFyIGVsZW1zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5zaG9wLWl0ZW1cIik7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZWxlbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBlbCA9IGVsZW1zW2ldO1xuICAgICAgICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZShcIm5vLW1hdGNoXCIpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBbXS5maWx0ZXIuY2FsbChlbGVtcywgZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgICAgIHZhciBpdGVtSWQgPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5pdGVtcy1zcHJpdGUtNzB4NTAnKS5pZC50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgdmFyIGl0ZW1OYW1lID0gaXRlbURhdGFbJ2l0ZW1fJyArIGl0ZW1JZF0uZGlzcGxheW5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgIHJldHVybiBpdGVtSWQuaW5kZXhPZihzZWFyY2hWYWwpID09PSAtMSAmJiBpdGVtTmFtZS5pbmRleE9mKHNlYXJjaFZhbCkgPT09IC0xICYmIGl0ZW1OYW1lLm1hdGNoKC9cXGIoXFx3KS9nKS5qb2luKCcnKS5pbmRleE9mKHNlYXJjaFZhbCkgPT09IC0xO1xuICAgICAgICB9KS5mb3JFYWNoKGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJuby1tYXRjaFwiKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICB2YXIgZGl2cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5zaG9wLWl0ZW0nKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRpdnMubGVuZ3RoIDtpKyspIHtcbiAgICAgICAgdmFyIGVsZW1lbnQgPSBkaXZzW2ldO1xuICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZSgnZGF0YS1jb250ZW50JywgaXRlbV9kYXRhW2VsZW1lbnQucXVlcnlTZWxlY3RvcignLml0ZW1zLXNwcml0ZS03MHg1MCcpLmlkXSk7XG4gICAgICAgIG5ldyBic24uUG9wb3ZlcihlbGVtZW50LCB7XG4gICAgICAgICAgICB0cmlnZ2VyOiBcImhvdmVyXCIsXG4gICAgICAgICAgICBodG1sOiB0cnVlLFxuICAgICAgICAgICAgYW5pbWF0aW9uOiBmYWxzZSxcbiAgICAgICAgICAgIHBsYWNlbWVudDogXCJyaWdodFwiXG4gICAgICAgIH0pO1xuICAgIH1cbn0pOyJdfQ==
