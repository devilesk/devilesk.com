import math
from hyde.plugin import Plugin
 
def quoted(var):
    return '"%s"' % var

def get_damage_min(data, level=1, bonus_level=0):
    return int(data['attackdamagemin']) + math.floor(get_total_attr(get_primary(data), data, level, bonus_level))

def get_damage_max(data, level=1, bonus_level=0):
    return int(data['attackdamagemax']) + math.floor(get_total_attr(get_primary(data), data, level, bonus_level))

def get_health(data, level=1, bonus_level=0):
    return calc_stat(data['statushealth'], 19, get_total_attr('str', data, level, bonus_level))

def get_mana(data, level=1, bonus_level=0):
    return calc_stat(data['statusmana'], 13, get_total_attr('int', data, level, bonus_level))

def get_armor(data, level=1, bonus_level=0):
    return round(calc_stat(data['armorphysical'], .14, get_total_attr('agi', data, level, bonus_level)), 2)

def get_attacks_per_second(data, level=1, bonus_level=0):
    return round((1 + get_total_attr('agi', data, level, bonus_level) / 100) / float(data['attackrate']), 2)

def get_total_attr(attr, data, level=1, bonus_level=0):
    base = 0
    growth = 0
    if attr == 'str':
        base = data['attributebasestrength']
        growth = data['attributestrengthgain']
    elif attr == 'agi':
        base = data['attributebaseagility']
        growth = data['attributeagilitygain']
    elif attr == 'int':
        base = data['attributebaseintelligence']
        growth = data['attributeintelligencegain']
    return int(base) + float(growth) * (level - 1) + (2 * bonus_level)

def get_primary_val(data):
    if data['attributeprimary'] == 'DOTA_ATTRIBUTE_STRENGTH':
        return int(data['attributebasestrength'])
    if data['attributeprimary'] == 'DOTA_ATTRIBUTE_AGILITY':
        return int(data['attributebaseagility'])
    if data['attributeprimary'] == 'DOTA_ATTRIBUTE_INTELLECT':
        return int(data['attributebaseintelligence'])
    return 0

def get_primary(data):
    if data['attributeprimary'] == 'DOTA_ATTRIBUTE_STRENGTH':
        return 'str'
    if data['attributeprimary'] == 'DOTA_ATTRIBUTE_AGILITY':
        return 'agi'
    if data['attributeprimary'] == 'DOTA_ATTRIBUTE_INTELLECT':
        return 'int'
    return 'str'

def calc_stat(base, mult, stat):
    return base + mult * math.floor(stat)

class Hero:

    def __init__(self, data):
        self.data = data

class MyJinjaLoader(Plugin):
 
    def template_loaded(self, template):
        template.env.globals['quoted'] = quoted
        template.env.globals['get_health'] = get_health
        template.env.globals['get_mana'] = get_mana
        template.env.globals['get_damage_min'] = get_damage_min
        template.env.globals['get_damage_max'] = get_damage_max
        template.env.globals['get_armor'] = get_armor
        template.env.globals['get_attacks_per_second'] = get_attacks_per_second
