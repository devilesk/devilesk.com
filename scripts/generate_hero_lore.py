import yaml
import json
import re
import sys
import os

def main():
    print('start... generate hero lore')
    with open(os.path.join(sys.path[0], '../node_modules/dota-datafiles/dist/herodata.json'), 'r') as f:
        herodata = json.loads(f.read())

    with open(os.path.join(sys.path[0], '../node_modules/dota-datafiles/dist/herobiodata.json'), 'r') as f:
        herobiodata = json.loads(f.read())

    print('loaded herodata')

    data = []

    for h in herodata:
        d = {}
        d['id'] = h.replace('npc_dota_hero_', '')
        d['displayname'] = herodata[h]['displayname']
        print(h)
        d['bio'] = herobiodata[h]['bio'].replace('\\"', '"').replace('--','&mdash;').splitlines()
        data.append(d)
        
    data = sorted(data, key=lambda k: k['displayname']) 

    with open(os.path.join(sys.path[0], '../data/herolore.yaml'), 'w') as f:
        f.write(yaml.safe_dump(data, default_flow_style=False))

    heroloremenu = []
    bins = [["A","B"],["C","D"],["E","F","G","H","I"],["J","K","L"],["M","N","O"],["P","Q","R"],["S"],["T"],["U","V","W","X","Y","Z"]]
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
        heroloremenu.append(d)
      
    with open(os.path.join(sys.path[0], '../data/heroloremenu.yaml'), 'w') as f:
        f.write(yaml.safe_dump(heroloremenu, default_flow_style=False))
    print('done generate hero lore')

if __name__ == '__main__':
    main()