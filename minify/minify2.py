import sys, os, os.path, shutil, datetime, time, requests
YUI_COMPRESSOR = 'yuicompressor-2.4.8.jar'

def compress(in_files, out_file, in_type='js', verbose=False,
             temp_file='.temp'):
    temp = open(temp_file, 'w')
    for f in in_files:
        fh = open(f)
        data = fh.read() + '\n'
        fh.close()

        temp.write(data)

        print ' + %s' % f
    temp.close()

    options = ['-o "%s"' % out_file,
               '--type %s' % in_type]

    if verbose:
        options.append('-v')

    os.system('java -jar "%s" %s "%s"' % (YUI_COMPRESSOR,
                                          ' '.join(options),
                                          temp_file))

    org_size = os.path.getsize(temp_file)
    new_size = os.path.getsize(out_file)

    print '=> %s' % out_file
    print 'Original: %.2f kB' % (org_size / 1024.0)
    print 'Compressed: %.2f kB' % (new_size / 1024.0)
    print 'Reduction: %.1f%%' % (float(org_size - new_size) / org_size * 100)
    print ''

    #os.remove(temp_file)

def main():
    if len(sys.argv) > 1 and sys.argv[1] == 'production':
        ROOT = '/srv/www/devilesk.com'
    else:
        ROOT = '/srv/www/dev.devilesk.com'
        print 'Development index.html to production'
        with open(ROOT + '/dota2/apps/hero-calculator/index.html','r') as f:
            data = f.read()
            dev_header = '<link rel="stylesheet" type="text/css" href="jquery-ui-1.10.3.custom.css" />' \
            '<link rel="stylesheet" type="text/css" href="hero-calculator.items.css" />' \
            '<link id="hero-css" rel="stylesheet" type="text/css" href="hero-calculator.app.css" />'
            header = '    <link id="hero-css" rel="stylesheet" type="text/css" href="hero-calculator.min.css" />'
            data = data.replace(dev_header, header)
            dev_footer = '<script src="jquery-ui-1.11.0.custom.js"></script>\n' \
            '    <script src="hero-calculator.inventory.js"></script>\n' \
            '    <script src="hero-calculator.tooltips.js"></script>\n' \
            '    <script src="hero-calculator.abilitydata.js"></script>\n' \
            '    <script src="hero-calculator.abilities.js"></script>\n' \
            '    <script src="hero-calculator.buffs.js"></script>\n' \
            '    <script src="hero-calculator.buffs.amplification.reduction.js"></script>\n' \
            '    <script src="hero-calculator.hero.js"></script>\n' \
            '    <script src="hero-calculator.hero.illusion.js"></script>\n' \
            '    <script src="hero-calculator.hero.meepo.js"></script>\n' \
            '    <script src="hero-calculator.unit.js"></script>\n' \
            '    <script src="hero-calculator.ko-bindings.js"></script>\n' \
            '    <script src="hero-calculator.app.js"></script>'
            footer = '<script src="hero-calculator.min.js"></script>\r\n' \
            '    <script src="hero-calculator.app.min.js"></script>'
            data = data.replace(dev_footer, footer)
            dev_js = 'var cssPath = "hero-calculator.app";'
            js = 'var cssPath = "hero-calculator.min";'
            data = data.replace(dev_js, js)
            dev_update = 'var lastUpdate = "Development";'
            update = 'var lastUpdate = "Last updated: ' + datetime.datetime.fromtimestamp(time.time()).strftime('%Y-%m-%d %H:%M:%S') + '";'
            data = data.replace(dev_update, update)
            with open(ROOT + '/dota2/apps/hero-calculator/out/index.html','w') as g:
                g.write(data)

    SCRIPTS = [
        ROOT + '/dota2/apps/hero-calculator/jquery-ui-1.11.0.custom.js',
        ROOT + '/dota2/apps/hero-calculator/hero-calculator.inventory.js',
        ROOT + '/dota2/apps/hero-calculator/hero-calculator.tooltips.js',
        ROOT + '/dota2/apps/hero-calculator/hero-calculator.abilitydata.js',
        ROOT + '/dota2/apps/hero-calculator/hero-calculator.abilities.js',
        ROOT + '/dota2/apps/hero-calculator/hero-calculator.buffs.js',
        ROOT + '/dota2/apps/hero-calculator/hero-calculator.buffs.amplification.reduction.js',
        ROOT + '/dota2/apps/hero-calculator/hero-calculator.hero.js',
        ROOT + '/dota2/apps/hero-calculator/hero-calculator.hero.illusion.js',
        ROOT + '/dota2/apps/hero-calculator/hero-calculator.hero.meepo.js',
        ROOT + '/dota2/apps/hero-calculator/hero-calculator.unit.js'
        ]
    SCRIPTS_OUT_DEBUG = 'debug/hero-calculator.js'
    SCRIPTS_OUT = ROOT + '/dota2/apps/hero-calculator/hero-calculator.min.js'

    APP = [
        ROOT + '/dota2/apps/hero-calculator/hero-calculator.ko-bindings.js',
        ROOT + '/dota2/apps/hero-calculator/hero-calculator.app.js'
        ]
    APP_OUT_DEBUG = 'debug/hero-calculator.app.js'
    APP_OUT = ROOT + '/dota2/apps/hero-calculator/hero-calculator.app.min.js'

    STYLESHEETS = [
        ROOT + '/dota2/apps/hero-calculator/jquery-ui-1.10.3.custom.css',
        ROOT + '/dota2/apps/hero-calculator/hero-calculator.items.css',
        ROOT + '/dota2/apps/hero-calculator/hero-calculator.app.css',
        ]
    STYLESHEETS_OUT = ROOT + '/dota2/apps/hero-calculator/hero-calculator.min.css'

    STYLESHEETS_LIGHT = [
        ROOT + '/dota2/apps/hero-calculator/jquery-ui-1.10.3.custom.css',
        ROOT + '/dota2/apps/hero-calculator/hero-calculator.items.css',
        ROOT + '/dota2/apps/hero-calculator/hero-calculator.app-light.css',
        ]
    STYLESHEETS_LIGHT_OUT = ROOT + '/dota2/apps/hero-calculator/hero-calculator.min-light.css'


    print 'Compressing JavaScript...'
    print sys.path
    compress(SCRIPTS, SCRIPTS_OUT, 'js', False, SCRIPTS_OUT_DEBUG)

    print 'Compressing JavaScript...'
    print sys.path
    compress(APP, APP_OUT, 'js', False, APP_OUT_DEBUG)

    print 'Compressing CSS...'
    compress(STYLESHEETS, STYLESHEETS_OUT, 'css')

    print 'Compressing CSS light...'
    compress(STYLESHEETS_LIGHT, STYLESHEETS_LIGHT_OUT, 'css')

    FILES = [
        'hero-calculator.min.css',
        'hero-calculator.min-light.css',
        'hero-calculator.min.js',
        'hero-calculator.app.min.js',
        'changelog.txt',
        'hero-calculator.items.png',
        'templates.html',
        'report.php',
        'save.php'
    ]
    for f in FILES:
        shutil.copy2(ROOT + '/dota2/apps/hero-calculator/' + f, ROOT + '/dota2/apps/hero-calculator/out/' + f)

    if len(sys.argv) > 1 and sys.argv[1] == 'deploy':
        print 'Creating backup and deploying...'
        FILES.append('index.html')
        DEPLOY_ROOT = '/srv/www/devilesk.com'
        BACKUP_ROOT = '/home/hero-calculator-backups'
        BACKUP_FOLDER = str(time.time())
        if not os.path.exists(BACKUP_ROOT + '/' + BACKUP_FOLDER): os.makedirs(BACKUP_ROOT + '/' + BACKUP_FOLDER)
        for f in FILES:
            shutil.copy2(DEPLOY_ROOT + '/dota2/apps/hero-calculator/' + f, BACKUP_ROOT + '/' +  BACKUP_FOLDER + '/' + f)
        for f in FILES:
            shutil.copy2(ROOT + '/dota2/apps/hero-calculator/out/' + f, DEPLOY_ROOT + '/dota2/apps/hero-calculator/' + f)

    if len(sys.argv) > 1 and (sys.argv[1] == 'purge' or sys.argv[2] == 'purge'):
        print 'Purging cloudflare cache...'
        CACHE_FILES = [
            'http://devilesk.com/dota2/apps/hero-calculator/hero-calculator.min.js',
            'http://devilesk.com/dota2/apps/hero-calculator/hero-calculator.app.min.js',
            'http://devilesk.com/dota2/apps/hero-calculator/hero-calculator.min.css',
            'http://devilesk.com/dota2/apps/hero-calculator/hero-calculator.min-light.css',
            'http://devilesk.com/dota2/apps/hero-calculator/changelog.txt'
            ]
        payload = {
            'a': 'zone_file_purge',
            'tkn': '159caa92e960af1f5bac4135f2e55e55259ad',
            'email': 'devilesk@gmail.com',
            'z': 'devilesk.com',
            'url': ''
            }
        for f in CACHE_FILES:
            payload['url'] = f
            r = requests.post("https://www.cloudflare.com/api_json.html", data=payload)
            print(r.text)

    print 'Done'
if __name__ == '__main__':
    main()
