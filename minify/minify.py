import sys, os, os.path, shutil
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
		
    SCRIPTS = [
        ROOT + '/dota2/apps/hero-calculator/jquery-ui-1.10.3.custom.js',
        ROOT + '/dota2/apps/hero-calculator/hero-calculator.inventory.js',
        ROOT + '/dota2/apps/hero-calculator/hero-calculator.tooltips.js',
        ROOT + '/dota2/apps/hero-calculator/hero-calculator.abilitydata.js',
        ROOT + '/dota2/apps/hero-calculator/hero-calculator.abilities.js',
        ROOT + '/dota2/apps/hero-calculator/hero-calculator.buffs.js',
        ROOT + '/dota2/apps/hero-calculator/hero-calculator.buffs.amplification.reduction.js',
        ROOT + '/dota2/apps/hero-calculator/hero-calculator.hero.js',
	    ROOT + '/dota2/apps/hero-calculator/hero-calculator.unit.js'
        ]
    SCRIPTS_OUT_DEBUG = 'debug/hero-calculator.js'
    SCRIPTS_OUT = ROOT + '/dota2/apps/hero-calculator/hero-calculator.min.js'

    APP = [
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


    print 'Compressing JavaScript...'
    print sys.path
    compress(SCRIPTS, SCRIPTS_OUT, 'js', False, SCRIPTS_OUT_DEBUG)

    print 'Compressing JavaScript...'
    print sys.path
    compress(APP, APP_OUT, 'js', False, APP_OUT_DEBUG)
	
    print 'Compressing CSS...'
    compress(STYLESHEETS, STYLESHEETS_OUT, 'css')

    print 'Done'
if __name__ == '__main__':
    main()