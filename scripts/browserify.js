var browserify = require('browserify');
var fs = require('fs');
var env = process.argv.indexOf('production') !== -1 ? 'production' : 'development';

var files = [
    './src/js/index.js',
    './src/js/items.js',
    './src/js/heroes/patchhistory.js',
    './src/js/apps/trivia.js',
    './src/js/mosaics/index.js'
];

var outputs = [
    'assets/js/index.js',
    'assets/js/items.js',
    'assets/js/heroes/patchhistory.js',
    'assets/js/apps/trivia.js',
    'assets/js/mosaics/index.js'
];

var b = browserify(files);
b.plugin('factor-bundle', { outputs: outputs });
b.bundle().pipe(fs.createWriteStream('assets/js/common.js'));