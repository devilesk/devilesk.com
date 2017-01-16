var autoprefixer = require('autoprefixer');
var postcss      = require('postcss');
var fs           = require('fs');

var plugin = autoprefixer({
    browsers: [
        "Android 2.3",
        "Android >= 4",
        "Chrome >= 20",
        "Firefox >= 24",
        "Explorer >= 8",
        "iOS >= 6",
        "Opera >= 12",
        "Safari >= 6"
    ]
});

fs.readFile('build/media/css/site.css', (err, css) => {
    postcss([plugin])
        .process(css, { from: 'build/media/css/site.css', to: 'build/media/css/site.min.css' })
        .then(result => {
            fs.writeFile('build/media/css/site.min.css', result.css);
            if ( result.map ) fs.writeFile('build/media/css/site.min.css.map', result.map);
        });
});