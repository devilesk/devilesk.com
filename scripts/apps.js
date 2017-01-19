var yaml = require('js-yaml');
var fs = require('fs');
var execSync = require('child_process').execSync;
var env = process.argv.indexOf('production') !== -1 ? 'production' : 'development';
var config = yaml.safeLoad(fs.readFileSync(env === 'production' ? 'site-prod.yaml' : 'site.yaml', 'utf8'));
var deploy_root = config.deploy_root;

var apps = [
    {
        src: 'apps/dota-interactive-map/dist/',
        dst: '/dota2/apps/interactivemap',
        exclude: 'index.*'
    },
    {
        src: 'apps/dota-drawable-map/dist/',
        dst: '/dota2/apps/drawablemap',
        exclude: 'index.*'
    },
    {
        src: 'apps/dota-hero-calculator/dist/',
        dst: '/dota2/apps/hero-calculator',
        exclude: 'index.*'
    }
]

apps.forEach(function (app) {
    execSync('rsync -av --exclude="' + app.exclude + '" "' + app.src + '" "' + deploy_root + app.dst + '"');
});