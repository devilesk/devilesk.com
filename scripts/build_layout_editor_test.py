#!/usr/bin/env python

import sys, os, os.path, shutil, datetime, time, requests
sys.path.append('/home/sites/devilesk.com/minify')
from minify2 import compress, purge_cache

def main():
    ROOT = '/srv/www/dev.devilesk.com'
    
    SCRIPTS = [
        ROOT + '/dota2/apps/layout-editor/layout-editor.js'
        ]
    SCRIPTS_OUT_DEBUG = 'debug/layout-editor.test.js'
    SCRIPTS_OUT = ROOT + '/dota2/apps/layout-editor/layout-editor.test.min.js'

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

        print 'Compressing JavaScript...'
        print sys.path
        compress(SCRIPTS, SCRIPTS_OUT, 'js', False, SCRIPTS_OUT_DEBUG)


    print 'Done'
    
if __name__ == '__main__':
    main()
