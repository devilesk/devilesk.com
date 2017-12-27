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