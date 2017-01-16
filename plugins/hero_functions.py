import math
import re
from hyde.plugin import Plugin
import yaml
import os
from jinja2 import (
    contextfunction
)
from commando.util import getLoggerWithNullHandler
logger = getLoggerWithNullHandler('hyde.engine')

def get_damage_type(ability, ability_type):
    if ability == 'elder_titan_echo_stomp' or ability == 'elder_titan_earth_splitter':
        return 'Physical/Magical'
    if ability_type == 'DAMAGE_TYPE_MAGICAL':
        return 'Magical'
    if ability_type == 'DAMAGE_TYPE_PURE':
        return 'Pure'
    if ability_type == 'DAMAGE_TYPE_PHYSICAL':
        return 'Physical'
    if ability_type == 'DAMAGE_TYPE_COMPOSITE':
        return 'Composite'
    if ability_type == 'DAMAGE_TYPE_HP_REMOVAL':
        return 'HP Removal'

def get_behavior(ability_type):
    if ability_type == 'DOTA_ABILITY_BEHAVIOR_NO_TARGET':
        return 'No Target'
    if ability_type == 'DOTA_ABILITY_BEHAVIOR_PASSIVE':
        return 'Passive'
    if ability_type == 'DOTA_ABILITY_BEHAVIOR_POINT':
        return 'Target Point'
    if ability_type == 'DOTA_ABILITY_BEHAVIOR_UNIT_TARGET':
        return 'Target Unit'
    if ability_type == 'DOTA_ABILITY_BEHAVIOR_AURA':
        return 'Aura'
    if ability_type == 'DOTA_ABILITY_BEHAVIOR_AUTOCAST':
        return 'Auto-cast'
    if ability_type == 'DOTA_ABILITY_BEHAVIOR_TOGGLE':
        return 'Toggle'
    if ability_type == 'DOTA_ABILITY_BEHAVIOR_CHANNELLED':
        return 'Channeled'
    return ''

def get_ability_behavior(behaviors):
    return ', '.join([y for y in [get_behavior(x) for x in behaviors] if y != ''])

def paragraphs(text):
    paras = re.split(r'[\r\n]+', text)
    paras = ['<p>%s</p>' % p.strip() for p in paras]
    return '\n'.join(paras)

def format_tooltip(text, attributes):
    mapping = {}
    for x in attributes:
        a = x.to_dict()
        mapping['%' + a['name'] + '%'] = ', '.join([str(v) for v in a['value']])

    for k, v in mapping.items():
        text = text.replace(k, v)
    text = text.replace('%%', '%')
    return text

def quoted(var):
    return '"%s"' % var

def get_damage_min(data, level=1, bonus_level=0):
    return int(data['attackdamagemin']) + math.floor(get_total_attr(get_primary(data), data, level, bonus_level))

def get_damage_max(data, level=1, bonus_level=0):
    return int(data['attackdamagemax']) + math.floor(get_total_attr(get_primary(data), data, level, bonus_level))

def get_health(data, level=1, bonus_level=0):
    return calc_stat(data['statushealth'], 20, get_total_attr('str', data, level, bonus_level))

def get_mana(data, level=1, bonus_level=0):
    return calc_stat(data['statusmana'], 12, get_total_attr('int', data, level, bonus_level))

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


class HeroFunctionsPlugin(Plugin):
 
    def template_loaded(self, template):
        template.env.globals['quoted'] = quoted
        template.env.globals['get_health'] = get_health
        template.env.globals['get_mana'] = get_mana
        template.env.globals['get_damage_min'] = get_damage_min
        template.env.globals['get_damage_max'] = get_damage_max
        template.env.globals['get_armor'] = get_armor
        template.env.globals['get_attacks_per_second'] = get_attacks_per_second
        template.env.globals['any'] = any
        template.env.globals['format_tooltip'] = format_tooltip
        template.env.globals['paragraphs'] = paragraphs
        template.env.globals['get_damage_type'] = get_damage_type
        template.env.globals['get_ability_behavior'] = get_ability_behavior
