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