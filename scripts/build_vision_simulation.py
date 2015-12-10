#!/usr/bin/env python

import sys, os, os.path, shutil, datetime, time, requests
sys.path.append('/home/sites/devilesk.com/minify')
from minify2 import compress, purge_cache

def main():
    ROOT = '/srv/www/dev.devilesk.com'
    
    SCRIPTS = [
        ROOT + '/dota2/apps/interactivemap2/rot4.js',
        ROOT + '/dota2/apps/interactivemap2/vision-simulation.js'
        ]
    SCRIPTS_OUT = ROOT + '/dota2/apps/interactivemap2/vision-simulation.min.js'

    FILES = [
        'vision-simulation.min.js'
    ]
    
    if len(sys.argv) > 1 and 'build' in sys.argv:
        print 'Development index.html to production'
        with open(ROOT + '/dota2/apps/interactivemap2/vision-simulation.html','r') as f:
            data = f.read()
            dev_footer = '<script src="rot4.js"></script><script src="vision-simulation.js"></script>'
            footer = '<script src="vision-simulation.min.js"></script>'
            data = data.replace(dev_footer, footer)
            with open(ROOT + '/dota2/apps/interactivemap2/out/vision-simulation.html','w') as g:
                g.write(data)

        print 'Compressing JavaScript...'
        print sys.path
        compress(SCRIPTS, SCRIPTS_OUT, 'js', False)
        
        for f in FILES:
            shutil.copy2(ROOT + '/dota2/apps/interactivemap2/' + f, ROOT + '/dota2/apps/interactivemap2/out/' + f)

    if len(sys.argv) > 1 and 'deploy' in sys.argv:
        print 'Creating backup and deploying...'
        FILES.append('vision-simulation.html')
        DEPLOY_ROOT = '/srv/www/devilesk.com'

        for f in FILES:
            shutil.copy2(ROOT + '/dota2/apps/interactivemap2/out/' + f, DEPLOY_ROOT + '/dota2/apps/interactivemap2/' + f)

    if len(sys.argv) > 1 and 'purge' in sys.argv:
        print 'Purging cloudflare cache of herocalc...'
        CACHE_FILES = [
            'http://devilesk.com/dota2/apps/interactivemap2/vision-simulation.min.js',
            'http://devilesk.com/dota2/apps/interactivemap2/elevation.png'
            ]
        purge_cache(CACHE_FILES)

    print 'Done'
    
if __name__ == '__main__':
    main()
