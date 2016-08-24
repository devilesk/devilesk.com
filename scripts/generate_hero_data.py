import yaml
import imp

hf  = imp.load_source('hero_functions', '/home/sites/devilesk.com/plugins/hero_functions.py')

print 'start...'

with open('/home/sites/devilesk.com/data/herodata.yaml', 'r') as f:
    herodata = yaml.load(f.read())

print 'loaded'

data = {}

def populate_data(data, hero, stat, level, hero_function):
    bonus_level = 0
    if level == 16:
        bonus_level = 1
    if level == 25:
        bonus_level = 10
    data[hero][level][stat] = hero_function(herodata[hero], level, bonus_level)

levels = [1, 16, 25]

for h in herodata:
    data[h] = {}
    for l in levels:
        data[h][l] = {}
        populate_data(data, h, 'health', l, hf.get_health)
        populate_data(data, h, 'mana', l, hf.get_mana)
        populate_data(data, h, 'damagemin', l, hf.get_damage_min)
        populate_data(data, h, 'damagemax', l, hf.get_damage_max)
        populate_data(data, h, 'armor', l, hf.get_armor)
        populate_data(data, h, 'attackspersecond', l, hf.get_attacks_per_second)

with open('/home/sites/devilesk.com/data/herodata_stats.yaml', 'w') as f:
    f.write(yaml.safe_dump(data, default_flow_style=False))
