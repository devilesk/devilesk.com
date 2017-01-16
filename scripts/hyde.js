var path = require('path');
var yaml = require('js-yaml');
var fs = require('fs');
var execSync = require('child_process').execSync;
var env = process.argv.indexOf('production') !== -1 ? 'production' : 'development';
console.log(process.argv);
var configFile = env === 'production' ? 'site-prod.yaml' : 'site.yaml';

var config = yaml.safeLoad(fs.readFileSync(configFile, 'utf8'));

var cmd = 'hyde -c ' + configFile;
console.log(cmd);
//execSync(cmd);