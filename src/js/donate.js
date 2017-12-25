var $ = jQuery = require('jquery');
require('bootstrap');

$(function () {
    $('[data-toggle="tooltip"]').tooltip();
    
    $('[data-toggle="tooltip"]').on('hide.bs.tooltip', function () {
        $(this).attr('data-original-title', "Copy to clipboard");
    })
    
    function copyTextHandler(event) {
        var coin = event.currentTarget.id.replace('input-address-btn-', '');
        var input = document.getElementById('input-address-' + coin).select();
        
        try {
            document.execCommand('copy');
            $(event.currentTarget).attr('data-original-title', "Copied!").tooltip('show');
        }
        catch (err) {
            console.log('Oops, unable to copy', err);
        }
    }

    document.querySelectorAll('.input-address-btn').forEach(function (element) {
        element.addEventListener('click', copyTextHandler);
    });
});