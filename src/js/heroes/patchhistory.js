var getJSON = require('../util/getJSON');

getJSON("/media/js/patchdata.json", function (data) {
    [].forEach.call(document.querySelectorAll('.hero'), function (element) {
        var hero = element.id.substring(2);
        patchdata = data[hero];
        displayname = element.querySelector('.cropped-vert-portrait').title;
        document.getElementById('hero-name').innerHTML = displayname;
        document.getElementById('patch-notes').innerHTML = '';
        var current_patchnumber = patchdata[0][0];
        for (var i = 0; i < patchdata.length; i++) {
            var patchnotedata = patchdata[i];
            var note = '';
            var patchnumberClass = 'patch-number';
            
            switch (patchnotedata[1]) {
                case 'nerf':
                case 'buff':
                case 'neutral':
                    patchnumberClass += ' patch-' + patchnotedata[1];
                break;
            }
            
            var patchnumber = '<span class="' + patchnumberClass + '">' + patchnotedata[0] + '</span>';
            note += patchnumber;
            
            var patchnote = '<span class="patch-note">' + patchnotedata[2] + '</span>';
            note += patchnote;
            
            if (current_patchnumber != patchnotedata[0]) {
                current_patchnumber = patchnotedata[0];
                note = '<li class="patch-note patch-break">' + note;
            }
            else {
                note = '<li class="patch-note">' + note;
            }
            
            note += '</li>';
            
            document.getElementById('patch-notes').innerHTML = note;
        }
    });	
});