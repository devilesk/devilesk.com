import yaml
import json
import sys
import os
from datetime import datetime

def main():

    print('start... generate patch data')

    data = {}
    for filename in os.listdir(os.path.join(sys.path[0], '../data/patches')):
        print(filename)
        
        version = filename.replace('.json', '')
        
        with open(os.path.join(sys.path[0], '../data/patches/' + filename), 'r') as f:
            data[version] = json.loads(f.read())
        
        patchpage = {}
        with open(os.path.join(sys.path[0], '../content/dota2/patches/' + version + ".html"), 'w') as f:
            patchpage['created'] = datetime.strptime(data[version]['date'], '%Y-%m-%d')
            patchpage['patch'] = data[version]['version']
            f.write(yaml.safe_dump(patchpage, default_flow_style=False))
        
        lines = []
        with open(os.path.join(sys.path[0], '../content/dota2/patches/' + version + ".html"), 'r') as f:
            for l in f.readlines():
                if 'created' in l:
                    lines.append(l.replace("created: ", "created: !!timestamp '").replace('\n', "'\n"))
                else:
                    lines.append(l)
        
        with open(os.path.join(sys.path[0], '../content/dota2/patches/' + version + ".html"), 'w') as f:    
            f.write("---\n")
            for l in lines:
                f.write(l)
            f.write("---")
            
    with open(os.path.join(sys.path[0], '../data/patchdata.yaml'), 'w') as f:
        f.write(yaml.safe_dump(data, default_flow_style=False))

    print('done generate patch data')


if __name__ == '__main__':
    main()