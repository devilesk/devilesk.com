var fs = require('fs');
var UglifyJS = require("uglify-js");
var files = require('./manifest').outputs;

files.forEach(function (src) {
    var result = UglifyJS.minify(src, {
        compress: {drop_console: true}
    });

    fs.writeFile(src.replace('.js', '.min.js'), result.code, function(err) {
        if (err) {
            console.log(err);
        }
        else {
            console.log("File was successfully saved.");
        }
    });
});

