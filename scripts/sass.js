var sass = require('node-sass');
var fs = require('fs');

function render(src, dst) {
    var opts = {
        file: src,
        outFile: dst
    }
    
    sass.render(opts, function (error, result) { // node-style callback from v3.0.0 onwards
        if (!error) {
            // No errors during the compilation, write this result on the disk
            fs.writeFile(dst, result.css, function(err) {
                if (!err){
                console.log('wrote', src, dst);
                }
            });
        }
        else {
            console.log(error);
        }
    });
}

render('./src/scss/site.scss', './assets/css/site.css');