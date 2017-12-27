var MobileDragDrop = require('mobile-drag-drop');
var getJSON = require('../util/getJSON');
var dragSrcEl;
var herodata;
var heroes;
var count = 0;

MobileDragDrop.polyfill();

function handleDragStart(e) {
    console.log('drag start', e, this);
    this.classList.add('dragging');

    dragSrcEl = this;

    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
}

function handleDragEnter(e) {
  this.classList.add('dragover');
}

function handleDragOver(e) {
  if (e.preventDefault) { e.preventDefault(); }

  e.dataTransfer.dropEffect = 'move';
  return false;
}

function handleDragLeave(e) {
  this.classList.remove('dragover');
}

function handleDrop(event) {
    if (event.stopPropagation) { event.stopPropagation(); }

    if (dragSrcEl != this) {
        console.log('dragSrcEl', dragSrcEl);
        console.log('droppedEl', this);
        if (dragSrcEl.getAttribute('data-ability-index') == this.getAttribute('data-ability-index')) {
            dragSrcEl.innerHTML = this.innerHTML;
            this.innerHTML = event.dataTransfer.getData('text/html');
            this.setAttribute('draggable', false);
            dragSrcEl.setAttribute('draggable', false);
            dragSrcEl.parentNode.removeChild(dragSrcEl);
            console.log('count', count);
            count--;
            console.log('count', count);
            if (count == 0) {
                createQuestion();
            }
        }
    }
    return false;
}

function handleDragEnd(e) {
    var ul = document.getElementById('abilitybox_start');
    [].forEach.call(ul.children, function (col) {
        col.classList.remove('dragover');
        col.classList.remove('dragging');
    });
}

function createQuestion() {
    console.log('createQuestion');
    var h = heroes[Math.floor(Math.random() * heroes.length)],
        data = herodata[h],
        imgCount = 0;
    count = 0;
    document.getElementById('contentcontainer').style.display = 'none';
    document.getElementById('abilitybox_start').innerHTML = '';
    document.getElementById('abilitybox_end').innerHTML = '';
    document.getElementById('hero-portrait').innerHTML = '';
    document.getElementById('heroname').innerHTML = '';
    imgCount = data.abilities.filter(function (ability) { 
        return ability.name != 'attribute_bonus' && ability.displayname != 'Empty' && ability.displayname != '' && ability.name != 'generic_hidden';
    }).length + 1;
    
    function checkShowContent() {
        console.log('checkShowContent', imgCount);
        if (imgCount == 0) {
            document.getElementById('contentcontainer').style.display = '';
        }
    }
    var portraitImage = new Image();
    portraitImage.src = "/media/images/heroes/" + h.replace('npc_dota_hero_','') + ".png";
    portraitImage.onload = function () {
        document.getElementById('hero-portrait').src = portraitImage.src;
        imgCount--;
        checkShowContent();
    };
    document.getElementById('heroname').innerHTML = data.displayname;
    
    function setImage(element, src) {
        element.style.backgroundImage = 'url(' + src + ')';
        imgCount--;
        checkShowContent();
    }
    
    for (var i = 0; i < data.abilities.length; i++) {
        if (data.abilities[i].name != 'attribute_bonus' && data.abilities[i].displayname != 'Empty' && data.abilities[i].displayname != '' && data.abilities[i].name != 'generic_hidden') {
            count++;
            var abilityboxend = document.createElement('div');
            abilityboxend.classList.add('abilitybox_end');
            abilityboxend.id = 'ability_' + i;
            abilityboxend.setAttribute('data-ability-index', i);
            document.getElementById('abilitybox_end').appendChild(abilityboxend);
            abilityboxend.addEventListener('dragover', function (event) {
                event.preventDefault();
            });
            abilityboxend.addEventListener('dragenter', function (event) {
                event.preventDefault();
            });
            abilityboxend.addEventListener('drop', handleDrop);

            var imageUrl = "/media/images/spellicons/" + data.abilities[i].name + ".png";
            
            var abilityWrapper = document.createElement('div');
            abilityWrapper.classList.add('ability-wrapper');
            abilityWrapper.id = data.abilities[i].name;
            abilityWrapper.setAttribute('draggable', true);
            abilityWrapper.setAttribute('data-ability-index', i);
            
            var overlay = document.createElement('div');
            overlay.classList.add('overlay-hover');
            abilityWrapper.appendChild(overlay);
            
            var ability = document.createElement('div');
            ability.classList.add('abilitybox');
            abilityWrapper.appendChild(ability);

            var abilityImage = new Image();
            abilityImage.src = imageUrl;
            abilityImage.onload = setImage(ability, imageUrl);
                
            var abilityTextContainer = document.createElement('div');
            abilityTextContainer.classList.add('abilitytextcontainer');
            
            var abilityText = document.createElement('div');
            abilityText.classList.add('abilitytext');
            abilityText.innerHTML = data.abilities[i].displayname;
            abilityTextContainer.appendChild(abilityText);
            
            ability.appendChild(abilityTextContainer);
            
            document.getElementById('abilitybox_start').appendChild(abilityWrapper);
        }
    }
    
    var ul = document.getElementById('abilitybox_start');
    for (var i = ul.children.length; i >= 0; i--) {
        ul.appendChild(ul.children[Math.random() * i | 0]);
    }
    
    [].forEach.call(ul.children, function(col) {
      col.addEventListener('dragstart', handleDragStart,  false);
      //col.addEventListener('dragenter', handleDragEnter,  false);
      //col.addEventListener('dragover',  handleDragOver,   false);
      col.addEventListener('dragleave', handleDragLeave,  false);
      //col.addEventListener('drop',      handleDrop,       false);
      col.addEventListener('dragend',   handleDragEnd,    false);
    });
    console.log('count', count);
}
    
getJSON("/media/dota-json/herodata.json", function (data) {
    heroes = Object.keys(data);
    herodata = data;
        
    createQuestion();
});