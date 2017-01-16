var browserify = require('browserify');
var fs = require('fs');
var env = process.argv.indexOf('production') !== -1 ? 'production' : 'development';

var files = [
    './src/js/index.js',
    './src/js/apps/trivia.js',
    './src/js/mosaics/index.js'
];

var root = (env === 'production' ? 'build' : 'content');

var outputs = [
    '/media/js/index.js',
    '/media/js/apps/trivia.js',
    '/media/js/mosaics/index.js'
].map(function (file) {
    return root + file;
});

var b = browserify(files);
b.plugin('factor-bundle', { outputs: outputs });
b.bundle().pipe(fs.createWriteStream(root + '/media/js/common.js'));