import sys, os, os.path, shutil, datetime, time, requests
from subprocess import call
YUI_COMPRESSOR = os.path.join(os.path.dirname(__file__), 'yuicompressor-2.4.8.jar')

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

    cmd = ['java', '-jar', YUI_COMPRESSOR, '-o', out_file, '--type', in_type, temp_file]
    if verbose:
        cmd.append('-v')

    call(cmd)

    org_size = os.path.getsize(temp_file)
    new_size = os.path.getsize(out_file)

    print '=> %s' % out_file
    print 'Original: %.2f kB' % (org_size / 1024.0)
    print 'Compressed: %.2f kB' % (new_size / 1024.0)
    print 'Reduction: %.1f%%' % (float(org_size - new_size) / org_size * 100)
    print ''

    #os.remove(temp_file)

def purge_cache(CACHE_FILES):
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