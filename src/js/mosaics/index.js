var $ = jQuery = require('jquery');
require('bootstrap');

$(function () {
    if ($('.mosaics-carousel').length) {
        require('./carousel');
    }
    
    if ($('.mosaics-page').length) {
        require('./page');
    }
});