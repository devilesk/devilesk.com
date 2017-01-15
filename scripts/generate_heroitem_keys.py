import yaml
import json
import sys
import os

def main():
    print('start... generate hero and item key data')

    heroes = []
    with open(os.path.join(sys.path[0], '../node_modules/dota-datafiles/dist/herodata.json'), 'r') as f:
        heroes = [x.replace('npc_dota_hero_', '') for x in json.loads(f.read()).keys()]
            
    with open(os.path.join(sys.path[0], '../data/herokeys.yaml'), 'w') as f:
        f.write(yaml.safe_dump(heroes, default_flow_style=False))
        
    items = []
    with open(os.path.join(sys.path[0], '../node_modules/dota-datafiles/dist/itemdata.json'), 'r') as f:
        items = [x.replace('item_', '') for x in json.loads(f.read()).keys()]
            
    with open(os.path.join(sys.path[0], '../data/itemkeys.yaml'), 'w') as f:
        f.write(yaml.safe_dump(items, default_flow_style=False))

    print('done generate hero and item key data')

if __name__ == '__main__':
    main()