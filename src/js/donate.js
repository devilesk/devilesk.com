var bsn = require("bootstrap.native");

function copyTextHandler(event) {
    var coin = event.currentTarget.id.replace('input-address-btn-', '');
    var input = document.getElementById('input-address-' + coin).select();
    
    try {
        document.execCommand('copy');
        event.currentTarget.setAttribute('data-title', "Copied!");
        event.currentTarget.Tooltip.hide();
        setTimeout(event.currentTarget.Tooltip.show, 200);
    }
    catch (err) {
        console.log('Oops, unable to copy', err);
    }
}

function initTooltip(element) {
    element.addEventListener('click', copyTextHandler);
    
    element.addEventListener('mouseleave', function () {
        element.setAttribute('data-title', "Copy to clipboard");
    });
}

[].forEach.call(document.querySelectorAll('.input-address-btn'), function (element) {
    initTooltip(element);
});