#!/usr/bin/env python

import sys, os, os.path, shutil, datetime, time, requests
sys.path.append('/home/sites/devilesk.com/minify')
from subprocess import call
from minify2 import compress, purge_cache

def main():
    ROOT = '/srv/www/dev.devilesk.com'
    
    SCRIPTS = [
        ROOT + '/dota2/apps/interactivemap2/rot6.js',
        ROOT + '/dota2/apps/interactivemap2/interactivemap.js'
        ]
    SCRIPTS_OUT_DEBUG = 'debug/interactivemap.js'
    SCRIPTS_OUT = ROOT + '/dota2/apps/interactivemap2/interactivemap.min.js'

    STYLESHEETS = [
        ROOT + '/dota2/apps/interactivemap2/interactivemap.css'
        ]
    STYLESHEETS_OUT = ROOT + '/dota2/apps/interactivemap2/interactivemap.min.css'
    
    FILES = [
        'interactivemap.min.css',
        'interactivemap.min.js',
        'data.json',
        'vision.json',
        'elevation.png',
        'jsts.js',
        'javascript.util.js',
        'ent_fow_blocker_node.kml',
        'trigger_no_wards.kml',
        'trigger_multiple.kml'
    ]
    
    if len(sys.argv) > 1 and 'build' in sys.argv:
        print 'Development index.html to production'
        with open(ROOT + '/dota2/apps/interactivemap2/index.html','r') as f:
            data = f.read()
            dev_header = '<link rel="stylesheet" type="text/css" href="interactivemap.css" />'
            header = '<link rel="stylesheet" type="text/css" href="interactivemap.min.css" />'
            data = data.replace(dev_header, header)
            dev_footer = '<script src="rot6.js"></script><script src="interactivemap.js"></script>'
            footer = '<script src="interactivemap.min.js"></script>'
            data = data.replace(dev_footer, footer)
            with open(ROOT + '/dota2/apps/interactivemap2/out/index.html','w') as g:
                g.write(data)

        print 'Compressing JavaScript...'
        print sys.path
        ##compress(SCRIPTS, SCRIPTS_OUT, 'js', False, SCRIPTS_OUT_DEBUG)
        cmd = ["uglifyjs"] + SCRIPTS + ["--compress", "drop_console", "--mangle", "--output", SCRIPTS_OUT]
        call(cmd)

        print 'Compressing CSS...'
        compress(STYLESHEETS, STYLESHEETS_OUT, 'css')

        for f in FILES:
            shutil.copy2(ROOT + '/dota2/apps/interactivemap2/' + f, ROOT + '/dota2/apps/interactivemap2/out/' + f)

    if len(sys.argv) > 1 and 'deploy' in sys.argv:
        print 'Creating backup and deploying...'
        FILES.append('index.html')
        DEPLOY_ROOT = '/srv/www/devilesk.com'
        BACKUP_ROOT = '/home/app-backups/interactivemap2'
        BACKUP_FOLDER = str(time.time())
        if not os.path.exists(BACKUP_ROOT + '/' + BACKUP_FOLDER): os.makedirs(BACKUP_ROOT + '/' + BACKUP_FOLDER)
        for f in FILES:
            shutil.copy2(DEPLOY_ROOT + '/dota2/apps/interactivemap2/' + f, BACKUP_ROOT + '/' +  BACKUP_FOLDER + '/' + f)
        for f in FILES:
            shutil.copy2(ROOT + '/dota2/apps/interactivemap2/out/' + f, DEPLOY_ROOT + '/dota2/apps/interactivemap2/' + f)

    if len(sys.argv) > 1 and 'purge' in sys.argv:
        print 'Purging cloudflare cache of interactivemap2...'
        CACHE_FILES = [
            'http://devilesk.com/dota2/apps/interactivemap2/interactivemap.min.js',
            'http://devilesk.com/dota2/apps/interactivemap2/interactivemap.min.css',
            'http://devilesk.com/dota2/apps/interactivemap2/data.json',
            ]
        purge_cache(CACHE_FILES)

    print 'Done'
    
if __name__ == '__main__':
    main()
