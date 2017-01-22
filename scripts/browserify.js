var browserify = require('browserify');
var fs = require('fs');
var watchify = require('watchify');

var env = process.argv.indexOf('production') !== -1 ? 'production' : 'development';
var bWatch = process.argv.indexOf('watch') !== -1 ? true : false;

console.log(process.argv);
console.log('env', env);
console.log('watch', bWatch);

var files = [
    './src/js/index.js',
    './src/js/items.js',
    './src/js/heroes/patchhistory.js',
    './src/js/heroes/chart.js',
    './src/js/heroes/herodata.js',
    './src/js/heroes/unitdata.js',
    './src/js/apps/trivia.js',
    './src/js/apps/abilityTrivia.js',
    './src/js/apps/abilitymatching.js',
    './src/js/apps/item-scramble.js',
    './src/js/apps/hero-selection-trainer.js',
    './src/js/apps/tread-switch-trainer.js',
    './src/js/mosaics/index.js'
];

var outputs = [
    'assets/js/index.js',
    'assets/js/items.js',
    'assets/js/heroes/patchhistory.js',
    'assets/js/heroes/chart.js',
    'assets/js/heroes/herodata.js',
    'assets/js/heroes/unitdata.js',
    'assets/js/apps/trivia.js',
    'assets/js/apps/abilityTrivia.js',
    'assets/js/apps/abilitymatching.js',
    'assets/js/apps/item-scramble.js',
    'assets/js/apps/hero-selection-trainer.js',
    'assets/js/apps/tread-switch-trainer.js',
    'assets/js/mosaics/index.js'
];

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
     .pipe(fs.createWriteStream('assets/js/common.js'));
    if (bWatch) {
        var b2 = browserify(opts);
        b2.plugin('factor-bundle', { outputs: outputs.map(function (file) { return file.replace('assets', 'build/media'); }) })
          .bundle()
          .pipe(fs.createWriteStream('build/media/js/common.js'));
    }
}
    
var b = browserify(opts);
b.plugin('factor-bundle', { outputs: outputs });
if (bWatch) b.on('update', bundle);

bundle();