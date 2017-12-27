var browserify = require('browserify');
var fs = require('fs');
var watchify = require('watchify');

var env = process.argv.indexOf('production') !== -1 ? 'production' : 'development';
var bWatch = process.argv.indexOf('watch') !== -1 ? true : false;

console.log(process.argv);
console.log('env', env);
console.log('watch', bWatch);

var files = require('./manifest').files;

var outputs = require('./manifest').outputs;

var opts = {
    debug:true,
    entries: files,
    cache: {},
    packageCache: {}
};
if (bWatch) opts.plugin = [watchify];

function bundle() {
    b.bundle()
     .on('error', console.error)
     .pipe(fs.createWriteStream('assets/js/common.js'))
     .on('finish', function () { console.log('bundled'); });
    if (bWatch) {
        var b2 = browserify(opts);
b2.exclude('jquery');
b2.transform({
        global: true
    }, 'browserify-shim');
        b2.plugin('factor-bundle', { outputs: outputs.map(function (file) { return file.replace('assets', 'build/media'); }) })
          .bundle()
          .pipe(fs.createWriteStream('build/media/js/common.js'))
          .on('finish', function () { console.log('bundled'); });
    }
}
    
var b = browserify(opts);
b.exclude('jquery');
b.transform({
        global: true
    }, 'browserify-shim');
b.plugin('factor-bundle', { outputs: outputs });
if (bWatch) b.on('update', bundle);

bundle();