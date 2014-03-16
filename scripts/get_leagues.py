import tempfile
import datetime
import sys
import exceptions
import json
import requests
import yaml

def save():
    col1 = []
    col2 = []

    key='FF54FD4C892144CFA5694214597921DA'
    payload = {'key':key,'language':'en_us'}
    r = requests.get("https://api.steampowered.com/IDOTA2Match_570/GetLeagueListing/v0001/?", params=payload)
    data = r.json()
    leaguelist0 = ''
    leaguelist1 = ''
    print data
    data['result']['leagues'].sort(key=lambda league: league['name'].lower())
    for i in range(0,len(data['result']['leagues'])):
        p = {'name':data['result']['leagues'][i]['name'],
             'leagueid':data['result']['leagues'][i]['leagueid'],
             'description':data['result']['leagues'][i]['description'],
             'tournament_url':data['result']['leagues'][i]['tournament_url']}
        leaguedict[p['leagueid']] = [p['tournament_url'],p['name']]
        if i < len(data['result']['leagues'])/2:
            col1.append([p['name'],p['description'],p['tournament_url']])
        else:
            col2.append([p['name'],p['description'],p['tournament_url']])
    leagues = [col1, col2]
    with open('leagues.yaml','w') as f:
        f.write(yaml.dump(leagues))
    return
    
save()
