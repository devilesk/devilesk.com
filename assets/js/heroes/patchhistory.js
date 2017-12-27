require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({29:[function(require,module,exports){
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
},{"../util/getJSON":39}]},{},[29])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvaGVyb2VzL3BhdGNoaGlzdG9yeS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBnZXRKU09OID0gcmVxdWlyZSgnLi4vdXRpbC9nZXRKU09OJyk7XG5cbmdldEpTT04oXCIvbWVkaWEvanMvcGF0Y2hkYXRhLmpzb25cIiwgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICBbXS5mb3JFYWNoLmNhbGwoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmhlcm8nKSwgZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgdmFyIGhlcm8gPSBlbGVtZW50LmlkLnN1YnN0cmluZygyKTtcbiAgICAgICAgcGF0Y2hkYXRhID0gZGF0YVtoZXJvXTtcbiAgICAgICAgZGlzcGxheW5hbWUgPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jcm9wcGVkLXZlcnQtcG9ydHJhaXQnKS50aXRsZTtcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2hlcm8tbmFtZScpLmlubmVySFRNTCA9IGRpc3BsYXluYW1lO1xuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGF0Y2gtbm90ZXMnKS5pbm5lckhUTUwgPSAnJztcbiAgICAgICAgdmFyIGN1cnJlbnRfcGF0Y2hudW1iZXIgPSBwYXRjaGRhdGFbMF1bMF07XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGF0Y2hkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgcGF0Y2hub3RlZGF0YSA9IHBhdGNoZGF0YVtpXTtcbiAgICAgICAgICAgIHZhciBub3RlID0gJyc7XG4gICAgICAgICAgICB2YXIgcGF0Y2hudW1iZXJDbGFzcyA9ICdwYXRjaC1udW1iZXInO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBzd2l0Y2ggKHBhdGNobm90ZWRhdGFbMV0pIHtcbiAgICAgICAgICAgICAgICBjYXNlICduZXJmJzpcbiAgICAgICAgICAgICAgICBjYXNlICdidWZmJzpcbiAgICAgICAgICAgICAgICBjYXNlICduZXV0cmFsJzpcbiAgICAgICAgICAgICAgICAgICAgcGF0Y2hudW1iZXJDbGFzcyArPSAnIHBhdGNoLScgKyBwYXRjaG5vdGVkYXRhWzFdO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgcGF0Y2hudW1iZXIgPSAnPHNwYW4gY2xhc3M9XCInICsgcGF0Y2hudW1iZXJDbGFzcyArICdcIj4nICsgcGF0Y2hub3RlZGF0YVswXSArICc8L3NwYW4+JztcbiAgICAgICAgICAgIG5vdGUgKz0gcGF0Y2hudW1iZXI7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBwYXRjaG5vdGUgPSAnPHNwYW4gY2xhc3M9XCJwYXRjaC1ub3RlXCI+JyArIHBhdGNobm90ZWRhdGFbMl0gKyAnPC9zcGFuPic7XG4gICAgICAgICAgICBub3RlICs9IHBhdGNobm90ZTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKGN1cnJlbnRfcGF0Y2hudW1iZXIgIT0gcGF0Y2hub3RlZGF0YVswXSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRfcGF0Y2hudW1iZXIgPSBwYXRjaG5vdGVkYXRhWzBdO1xuICAgICAgICAgICAgICAgIG5vdGUgPSAnPGxpIGNsYXNzPVwicGF0Y2gtbm90ZSBwYXRjaC1icmVha1wiPicgKyBub3RlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgbm90ZSA9ICc8bGkgY2xhc3M9XCJwYXRjaC1ub3RlXCI+JyArIG5vdGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIG5vdGUgKz0gJzwvbGk+JztcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BhdGNoLW5vdGVzJykuaW5uZXJIVE1MID0gbm90ZTtcbiAgICAgICAgfVxuICAgIH0pO1x0XG59KTsiXX0=
