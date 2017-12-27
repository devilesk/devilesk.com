require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({21:[function(require,module,exports){
var types = ['str','int','agi'],
    index = 0,
    hotkey = 'd',
    primary_attribute = {value: 0 },
    use_hotkey = 'e',
    rules = {
        'taking damage':{
            attr: {value: 0 },
            text: 'Taking Damage',
            active: false
        },
        'primary attribute':{
            attr: primary_attribute,
            text: 'Primary Attribute',
            active: false
        },
        'use mana':{
            attr: {value: 1 },
            text: 'Use Mana',
            active: true
        },
        'use regen':{
            attr: {value: 2 },
            text: 'Use Regen',
            active: true
        }
    },
    activated = false,
    previous,
    go_primary = false,
    objective = {},
    rules_keys = Object.keys(rules);

document.addEventListener('keypress', function (event) {
    console.log('keypress', event);
    if (event.key == document.getElementById('switch_key').value.toLowerCase()) {
        index += 1;
        if (index >= 3) {
            index = 0;
        }
        document.getElementById('treads').src = '/media/images/items/power_treads_' + types[index] + '.png';
        activated = false;
        checkRule();
    }
    else if (event.key == document.getElementById('use_key').value.toLowerCase()) {
        activated = true;
        checkRule();
    }
});

[].forEach.call(document.querySelectorAll('input[name="attr"]'), function (element) {
    element.addEventListener('click', function (event) {
        if (element.checked) {
            primary_attribute.value = element.value;
        }
    });
});


start = function() {
    if (!go_primary) {
        var i = Math.floor(Math.random()*rules_keys.length);
        objective = rules_keys[i];
    }
    else {
        objective = 'primary attribute';
    }
    go_primary = !go_primary;
    if (previous != objective) {
        console.log(rules[rules_keys[i]]);
        console.log(objective);
        document.getElementById('objective').innerHTML = rules[objective].text;
        activated = false;
        previous = objective;
        checkRule();
    }
    else {
        start();
    }
}

checkRule = function() {
    if (rules[objective].attr.value == index && (!rules[objective].active || activated)) {
        start();
    }
}
start();
},{}]},{},[21])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYXBwcy90cmVhZC1zd2l0Y2gtdHJhaW5lci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgdHlwZXMgPSBbJ3N0cicsJ2ludCcsJ2FnaSddLFxuICAgIGluZGV4ID0gMCxcbiAgICBob3RrZXkgPSAnZCcsXG4gICAgcHJpbWFyeV9hdHRyaWJ1dGUgPSB7dmFsdWU6IDAgfSxcbiAgICB1c2VfaG90a2V5ID0gJ2UnLFxuICAgIHJ1bGVzID0ge1xuICAgICAgICAndGFraW5nIGRhbWFnZSc6e1xuICAgICAgICAgICAgYXR0cjoge3ZhbHVlOiAwIH0sXG4gICAgICAgICAgICB0ZXh0OiAnVGFraW5nIERhbWFnZScsXG4gICAgICAgICAgICBhY3RpdmU6IGZhbHNlXG4gICAgICAgIH0sXG4gICAgICAgICdwcmltYXJ5IGF0dHJpYnV0ZSc6e1xuICAgICAgICAgICAgYXR0cjogcHJpbWFyeV9hdHRyaWJ1dGUsXG4gICAgICAgICAgICB0ZXh0OiAnUHJpbWFyeSBBdHRyaWJ1dGUnLFxuICAgICAgICAgICAgYWN0aXZlOiBmYWxzZVxuICAgICAgICB9LFxuICAgICAgICAndXNlIG1hbmEnOntcbiAgICAgICAgICAgIGF0dHI6IHt2YWx1ZTogMSB9LFxuICAgICAgICAgICAgdGV4dDogJ1VzZSBNYW5hJyxcbiAgICAgICAgICAgIGFjdGl2ZTogdHJ1ZVxuICAgICAgICB9LFxuICAgICAgICAndXNlIHJlZ2VuJzp7XG4gICAgICAgICAgICBhdHRyOiB7dmFsdWU6IDIgfSxcbiAgICAgICAgICAgIHRleHQ6ICdVc2UgUmVnZW4nLFxuICAgICAgICAgICAgYWN0aXZlOiB0cnVlXG4gICAgICAgIH1cbiAgICB9LFxuICAgIGFjdGl2YXRlZCA9IGZhbHNlLFxuICAgIHByZXZpb3VzLFxuICAgIGdvX3ByaW1hcnkgPSBmYWxzZSxcbiAgICBvYmplY3RpdmUgPSB7fSxcbiAgICBydWxlc19rZXlzID0gT2JqZWN0LmtleXMocnVsZXMpO1xuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlwcmVzcycsIGZ1bmN0aW9uIChldmVudCkge1xuICAgIGNvbnNvbGUubG9nKCdrZXlwcmVzcycsIGV2ZW50KTtcbiAgICBpZiAoZXZlbnQua2V5ID09IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzd2l0Y2hfa2V5JykudmFsdWUudG9Mb3dlckNhc2UoKSkge1xuICAgICAgICBpbmRleCArPSAxO1xuICAgICAgICBpZiAoaW5kZXggPj0gMykge1xuICAgICAgICAgICAgaW5kZXggPSAwO1xuICAgICAgICB9XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0cmVhZHMnKS5zcmMgPSAnL21lZGlhL2ltYWdlcy9pdGVtcy9wb3dlcl90cmVhZHNfJyArIHR5cGVzW2luZGV4XSArICcucG5nJztcbiAgICAgICAgYWN0aXZhdGVkID0gZmFsc2U7XG4gICAgICAgIGNoZWNrUnVsZSgpO1xuICAgIH1cbiAgICBlbHNlIGlmIChldmVudC5rZXkgPT0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3VzZV9rZXknKS52YWx1ZS50b0xvd2VyQ2FzZSgpKSB7XG4gICAgICAgIGFjdGl2YXRlZCA9IHRydWU7XG4gICAgICAgIGNoZWNrUnVsZSgpO1xuICAgIH1cbn0pO1xuXG5bXS5mb3JFYWNoLmNhbGwoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnaW5wdXRbbmFtZT1cImF0dHJcIl0nKSwgZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIGlmIChlbGVtZW50LmNoZWNrZWQpIHtcbiAgICAgICAgICAgIHByaW1hcnlfYXR0cmlidXRlLnZhbHVlID0gZWxlbWVudC52YWx1ZTtcbiAgICAgICAgfVxuICAgIH0pO1xufSk7XG5cblxuc3RhcnQgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoIWdvX3ByaW1hcnkpIHtcbiAgICAgICAgdmFyIGkgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkqcnVsZXNfa2V5cy5sZW5ndGgpO1xuICAgICAgICBvYmplY3RpdmUgPSBydWxlc19rZXlzW2ldO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgb2JqZWN0aXZlID0gJ3ByaW1hcnkgYXR0cmlidXRlJztcbiAgICB9XG4gICAgZ29fcHJpbWFyeSA9ICFnb19wcmltYXJ5O1xuICAgIGlmIChwcmV2aW91cyAhPSBvYmplY3RpdmUpIHtcbiAgICAgICAgY29uc29sZS5sb2cocnVsZXNbcnVsZXNfa2V5c1tpXV0pO1xuICAgICAgICBjb25zb2xlLmxvZyhvYmplY3RpdmUpO1xuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnb2JqZWN0aXZlJykuaW5uZXJIVE1MID0gcnVsZXNbb2JqZWN0aXZlXS50ZXh0O1xuICAgICAgICBhY3RpdmF0ZWQgPSBmYWxzZTtcbiAgICAgICAgcHJldmlvdXMgPSBvYmplY3RpdmU7XG4gICAgICAgIGNoZWNrUnVsZSgpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgc3RhcnQoKTtcbiAgICB9XG59XG5cbmNoZWNrUnVsZSA9IGZ1bmN0aW9uKCkge1xuICAgIGlmIChydWxlc1tvYmplY3RpdmVdLmF0dHIudmFsdWUgPT0gaW5kZXggJiYgKCFydWxlc1tvYmplY3RpdmVdLmFjdGl2ZSB8fCBhY3RpdmF0ZWQpKSB7XG4gICAgICAgIHN0YXJ0KCk7XG4gICAgfVxufVxuc3RhcnQoKTsiXX0=
