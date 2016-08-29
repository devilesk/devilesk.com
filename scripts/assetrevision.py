import os
import datetime
import yaml
import hashlib

def get_hash(full_path):
    hasher = hashlib.md5()
    with open(full_path, 'rb') as f:
        buf = f.read()
        hasher.update(buf)
    return hasher.hexdigest()
    
def modification_date(filename):
    t = os.path.getmtime(filename)
    return datetime.datetime.fromtimestamp(t)
    
asset_manifest_path = '/home/sites/devilesk.com/data/asset_manifest.yaml'
dir = '/home/sites/devilesk.com/content/media'

if os.path.exists(asset_manifest_path):
    print "loading asset_manifest..."
    with open(asset_manifest_path, 'r') as f:
        asset_manifest = yaml.load(f.read())
else:
    asset_manifest = {}
    print "asset_manifest doesn't exist. creating one..."

for root, directories, filenames in os.walk(dir, followlinks=True):
    # for directory in directories:
        # print os.path.join(root, directory) 
    for filename in filenames: 
        full_path = os.path.join(root,filename)
        file_date = modification_date(full_path)
        hash = get_hash(full_path)
        print full_path, file_date, hash
        asset_manifest[full_path] = hash[:8]
            
        
print "writing asset_manifest..."
with open(asset_manifest_path, 'w') as f:
    f.write(yaml.safe_dump(asset_manifest, default_flow_style=False))