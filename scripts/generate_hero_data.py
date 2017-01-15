import yaml
import imp
import sys
import os
import json

def main():

    hf  = imp.load_source('hero_functions', os.path.join(sys.path[0], '../plugins/hero_functions.py'))

    print('start...')

    with open(os.path.join(sys.path[0], '../data/herodata.yaml'), 'r') as f:
        herodata = yaml.load(f.read())

    print('loaded')

    data = {}
    datalist = []
    
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

        datalist.append(herodata[h])

    with open(os.path.join(sys.path[0], '../data/herodata_stats.yaml'), 'w') as f:
        f.write(yaml.safe_dump(data, default_flow_style=False))

    with open(os.path.join(sys.path[0], '../data/herodatalist.yaml'), 'w') as f:
        f.write(yaml.safe_dump(datalist, default_flow_style=False))
        
    with open(os.path.join(sys.path[0], '../node_modules/dota-datafiles/dist/tooltipdata.json'), 'r') as f:
        tooltipdata = json.loads(f.read())

    with open(os.path.join(sys.path[0], '../data/tooltipdata.yaml'), 'w') as f:
        f.write(yaml.safe_dump(tooltipdata, default_flow_style=False))

if __name__ == '__main__':
    main()
