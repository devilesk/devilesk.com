#!/usr/bin/env python

import sys, os, os.path, shutil, datetime, time, requests
sys.path.append('/home/sites/devilesk.com/minify')
from minify2 import compress, purge_cache

def main():
    ROOT = '/srv/www/dev.devilesk.com'
    
    SCRIPTS = [
        ROOT + '/dota2/apps/layout-editor/layout-editor.js'
        ]
    SCRIPTS_OUT_DEBUG = 'debug/layout-editor.js'
    SCRIPTS_OUT = ROOT + '/dota2/apps/layout-editor/layout-editor2.min.js'

    STYLESHEETS = [
        ROOT + '/dota2/apps/layout-editor/layout-editor.css'
        ]
    STYLESHEETS_OUT = ROOT + '/dota2/apps/layout-editor/layout-editor.min.css'
    
    FILES = [
        'layout-editor.min.css',
        'layout-editor2.min.js',
        'default_16x10.txt',
        'default_16x9.txt',
        'default_4x3.txt',
        'background_16x10.jpg',
        'background_16x9.jpg',
        'background_4x3.jpg',
        'save.php'
    ]
    
    if len(sys.argv) > 1 and 'build' in sys.argv:
        print 'Development index.html to production'
        with open(ROOT + '/dota2/apps/layout-editor/index.html','r') as f:
            data = f.read()
            dev_header = '<link rel="stylesheet" type="text/css" href="layout-editor.css" />'
            header = '<link rel="stylesheet" type="text/css" href="layout-editor.min.css" />'
            data = data.replace(dev_header, header)
            dev_footer = '<script src="layout-editor.js"></script>'
            footer = '<script src="layout-editor2.min.js"></script>'
            data = data.replace(dev_footer, footer)
            with open(ROOT + '/dota2/apps/layout-editor/out/index.html','w') as g:
                g.write(data)

        print 'Compressing JavaScript...'
        print sys.path
        compress(SCRIPTS, SCRIPTS_OUT, 'js', False, SCRIPTS_OUT_DEBUG)

        print 'Compressing CSS...'
        compress(STYLESHEETS, STYLESHEETS_OUT, 'css')

        for f in FILES:
            if f == 'layout-editor2.min.js':
                with open(ROOT + '/dota2/apps/layout-editor/' + f,'r') as h:
                    data = h.read()
                    data = data.replace('dev.devilesk.com', 'devilesk.com')
                with open(ROOT + '/dota2/apps/layout-editor/out/' + f,'w') as g:
                    g.write(data)
            else:
                shutil.copy2(ROOT + '/dota2/apps/layout-editor/' + f, ROOT + '/dota2/apps/layout-editor/out/' + f)

    if len(sys.argv) > 1 and 'deploy' in sys.argv:
        print 'Creating backup and deploying...'
        FILES.append('index.html')
        DEPLOY_ROOT = '/srv/www/devilesk.com'
        BACKUP_ROOT = '/home/app-backups/layout-editor'
        BACKUP_FOLDER = str(time.time())
        if not os.path.exists(BACKUP_ROOT + '/' + BACKUP_FOLDER): os.makedirs(BACKUP_ROOT + '/' + BACKUP_FOLDER)
        for f in FILES:
            shutil.copy2(DEPLOY_ROOT + '/dota2/apps/layout-editor/' + f, BACKUP_ROOT + '/' +  BACKUP_FOLDER + '/' + f)
        for f in FILES:
            shutil.copy2(ROOT + '/dota2/apps/layout-editor/out/' + f, DEPLOY_ROOT + '/dota2/apps/layout-editor/' + f)

    if len(sys.argv) > 1 and 'purge' in sys.argv:
        print 'Purging cloudflare cache of layout-editor...'
        CACHE_FILES = [
            'http://devilesk.com/dota2/apps/layout-editor/layout-editor2.min.js',
            'http://devilesk.com/dota2/apps/layout-editor/layout-editor.min.css',
            'http://devilesk.com/dota2/apps/layout-editor/default.txt',
            'http://devilesk.com/dota2/apps/layout-editor/background.jpg',
            ]
        purge_cache(CACHE_FILES)

    print 'Done'
    
if __name__ == '__main__':
    main()
