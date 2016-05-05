import urllib
import json
import copy

def get_file(url, dst):
  print "downloading", url, "to", dst
  f = urllib.URLopener()
  f.retrieve(url, dst)

files = [
  ["https://raw.githubusercontent.com/dotabuff/d2vpkr/master/dota/scripts/npc/npc_heroes.json", "npc_heroes.json"],
  ["https://raw.githubusercontent.com/dotabuff/d2vpkr/master/dota/scripts/npc/npc_abilities.json", "npc_abilities.json"],
  ["https://raw.githubusercontent.com/dotabuff/d2vpkr/master/dota/scripts/npc/npc_units.json", "npc_units.json"],
  ["https://raw.githubusercontent.com/dotabuff/d2vpkr/master/dota/scripts/npc/items.json", "items.json"],
  ["https://raw.githubusercontent.com/dotabuff/d2vpkr/master/dota/resource/dota_english.json", "dota_english.json"]
]

OUT_PATH = "/home/sites/devilesk.com/content/media/js/dota/"

def get_files():
  for f in files:
    get_file(f[0], OUT_PATH + f[1])

def open_json(src):
  with open(src, 'r') as f:
    return json.loads(f.read())
    
def num(s):
  try:
    return int(s)
  except ValueError:
    return float(s)
        
def try_num(s):
  try:
    return num(s)
  except ValueError:
      return s
      
def write_file(data, out):
  with open(out, 'w') as f:
      f.write(json.dumps(data, sort_keys=True, indent=2, separators=(',', ': ')))

def process_files():
  json_heroes = open_json(OUT_PATH + files[0][1])['DOTAHeroes']
  del json_heroes['Version']
  
  json_abilities = open_json(OUT_PATH + files[1][1])['DOTAAbilities']
  del json_abilities['Version']
  
  json_units = open_json(OUT_PATH + files[2][1])['DOTAUnits']
  del json_units['Version']
  
  json_items = open_json(OUT_PATH + files[3][1])['DOTAAbilities']
  del json_items['Version']
  
  json_english = open_json(OUT_PATH + files[4][1])['lang']['Tokens']
  for k in json_english:
    if k != k.lower() and k.lower() in json_english:
      raise Exception()
  json_english = dict((k.lower(), v) for k,v in json_english.iteritems())
  
  abilitydata = {}
  def parse_ability_special(ability_id, data):
    a = {}
    assert len(data.keys()) == 1
    key = data.keys()[0]
    tooltip_key = 'dota_tooltip_ability_' + ability_id + '_' + key
    try:
      tooltip = json_english[tooltip_key]
    except:
      tooltip = ""
    #print data, key, tooltip_key, tooltip
    a['name'] = key
    a['tooltip'] = tooltip
    if isinstance(data[key], list):
      a['value'] = [num(x) for x in data[key]]
    else:
      a['value'] = [num(data[key])]
    return a
    
  def parse_ability(ability_id, d):
    data = copy.deepcopy(d)
    attributes = []
    for k in data:
      if isinstance(data[k], int):
        continue
      if k == 'AbilitySpecial':
        data[k] = [parse_ability_special(ability_id, x) for x in data[k]]
      elif '|' in data[k]:
        data[k] = [x.strip() for x in data[k].split('|')]
      elif ' ' in data[k]:
        data[k] = [num(x.strip()) for x in data[k].split(' ')]
      else:
        data[k] = try_num(data[k])
    data['attributes'] = attributes
    data['name'] = ability_id
    try:
      data['displayname'] = json_english['dota_tooltip_ability_' + ability_id]
    except:
      print 'json_english missing', 'dota_tooltip_ability_' + ability_id
    try:
      data['lore'] = json_english['dota_tooltip_ability_' + ability_id + '_lore']
    except:
      print 'json_english missing', 'dota_tooltip_ability_' + ability_id + '_lore'
    return data
    
  def parse_unit(json_data, base_unit):
    result = {}
    for h in json_data:
      if h == base_unit:
        continue
      data = json_data[h]
      result[h] = copy.deepcopy(json_data[base_unit])
      result[h].update(data)
      abilities = []
      for i in range(1, 18):
        k = 'Ability' + str(i)
        if k in data:
          if data[k] not in abilitydata:
            print k, data[k]
            abilitydata[data[k]] = parse_ability(data[k], json_abilities[data[k]])
          abilities.append(copy.deepcopy(abilitydata[data[k]]))
        else:
          break
      result[h]['abilities'] = abilities
      result[h]['level'] = 0
      result[h]['name'] = h
      result[h]['bio'] = json_english[h + '_bio']
      result[h]['displayname'] = json_english[h]
    return result

  herodata = parse_unit(json_heroes, 'npc_dota_hero_base')
  write_file(herodata, 'herodata.json')

  unitdata = parse_unit(json_units, 'npc_dota_units_base')
  write_file(unitdata, 'unitdata.json')


#get_files()
process_files()