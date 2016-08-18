import yaml
import json
import re

print 'start... generate item tooltips'

with open('/home/sites/devilesk.com/content/media/js/itemdata.json', 'r') as f:
    itemdata = json.loads(f.read())

with open('/home/sites/devilesk.com/content/media/js/items.json', 'r') as f:
    items = json.loads(f.read())['data'].keys()

ability_vars = {
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

def get_tooltip_item_description(item):
    d = item['description']
    for attribute in item['attributes']:
        if 'name' in attribute and attribute['name']:
            name = attribute['name']
            value = ' / '.join([str(x) for x in attribute['value']])
            p = re.compile("%" + name + "%", re.IGNORECASE)
            d = p.sub(value, d)
    p = re.compile("%%")
    d = p.sub('%', d)
    d = d.replace('\\n', '<br>')
    return d
    
def get_tooltip_item_attributes(item):
    a = ''
    for attribute in item['attributes']:
        if 'tooltip' in attribute and attribute['tooltip']:
            tooltip = attribute['tooltip']
            value = ' / '.join([str(x) for x in attribute['value']])
            p = tooltip.find('%')
            if p == 0:
                value += '%'
                tooltip = tooltip[1:]
            d = tooltip.find('$')
            if d != -1:
              a += tooltip[:d] + ' ' + value + ' ' + ability_vars[tooltip[d:]] + '<br>'
            else:
              a += tooltip + ' ' + value + '<br>'
    if a.endswith('<br>'):
        a = a[:-4]
    return a

def get_tooltip_item_cooldown(item):
    return ' '.join([str(x) for x in item['cooldown']])

def get_tooltip_item_manacost(item):
    return ' '.join([str(x) for x in item['manacost'] if x > 0])

def get_tooltip_item(item):
    data = ''
    data += '<h2 class="item_field item_name">' + item['displayname'] + '</h2>'
    data += '<img class="item_field item_cost" src="/media/images/gold.png">'
    data += '<span class="item_field item_cost">' + str(item['itemcost']) + '</span>'
    data += '<p><div class="item item-' + item['name'].replace('item_', '') + '"></div></p>'
    if 'description' in item and item['description']:
        data += '<div class="item_field item_description">' + get_tooltip_item_description(item) + '</div>'
    attributes = get_tooltip_item_attributes(item)
    if attributes:
        data += '<div class="item_field item_description">' + attributes + '</div>'
    cd = get_tooltip_item_cooldown(item)
    mana = get_tooltip_item_manacost(item)
    if cd or mana:
        data += '<div class="item_field item_cdmana">'
        if cd:
            data += '<img class="item_field item_cooldown" src="/media/images/cooldown.png">'
            data += '<span class="item_field item_cooldown">' + cd + '</span>'
        if mana:
            data += '<img class="item_field item_manacost" src="/media/images/manacost.png">'
            data += '<span class="item_field item_manacost">' + mana + '</span>'
        data += '</div>'
    if 'lore' in item and item['lore']:
        data += '<div class="item_field item_lore">' + item['lore'] + '</div>'
    return data

print 'loaded itemdata'

data = []

for h in items:
    item = itemdata['item_' + h]
    d = {}
    d['id'] = h
    d['displayname'] = item['displayname']
    d['itemcost'] = str(item['itemcost'])
    if 'description' in item and item['description']:
        d['description'] = get_tooltip_item_description(item)
    attributes = get_tooltip_item_attributes(item)
    if attributes:
        d['attributes'] = attributes
    cd = get_tooltip_item_cooldown(item)
    if cd:
        d['cd'] = cd
    mana = get_tooltip_item_manacost(item)
    if mana:
        d['mana'] = mana
    if 'lore' in item and item['lore']:
        d['lore'] = item['lore']
    data.append(d)
    
data = sorted(data, key=lambda k: k['displayname']) 

with open('/home/sites/devilesk.com/data/itemtooltip.yaml', 'w') as f:
    f.write(yaml.safe_dump(data, default_flow_style=False))

itemtooltipmenu = []
bins = [["A","B"],["C","D"],["E","F","G"],["H","I","J","K"],["L","M"],["N","O","P"],["Q","R"],["S"],["T","U","V","W","X","Y","Z"]]
for menu in bins:
    d = {}
    if len(menu) > 1:
      d['name'] = menu[0] + '&ndash;' + menu[-1]
    else:
      d['name'] = menu[0]
    d['data'] = []
    for item in data:
        if item['displayname'][0] in menu:
          i = {}
          i['id'] = item['id']
          i['displayname'] = item['displayname']
          d['data'].append(i)
    itemtooltipmenu.append(d)
  
with open('/home/sites/devilesk.com/data/itemtooltipmenu.yaml', 'w') as f:
    f.write(yaml.safe_dump(itemtooltipmenu, default_flow_style=False))

print 'done generate item tooltips'