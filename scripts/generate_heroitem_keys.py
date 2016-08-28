import yaml
import json

print 'start... generate hero and item key data'

heroes = []
with open('/home/sites/devilesk.com/content/media/js/herodata.json', 'r') as f:
    heroes = [x.replace('npc_dota_hero_', '') for x in json.loads(f.read()).keys()]
        
with open('../data/herokeys.yaml', 'w') as f:
    f.write(yaml.safe_dump(heroes, default_flow_style=False))
    
items = []
with open('/home/sites/devilesk.com/content/media/js/itemdata.json', 'r') as f:
    items = [x.replace('item_', '') for x in json.loads(f.read()).keys()]
        
with open('../data/itemkeys.yaml', 'w') as f:
    f.write(yaml.safe_dump(items, default_flow_style=False))

print 'done generate hero and item key data'