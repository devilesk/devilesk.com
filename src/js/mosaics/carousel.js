var PhotoSwipe = require('photoswipe');
var lory = require('lory.js').lory;
var shuffle = require('../util/shuffle');
var PhotoSwipeUI_Default = require('photoswipe/dist/photoswipe-ui-default');
var debounce = require('lodash.debounce');
var heroes = require('./heroes');
heroes = shuffle(heroes);

var images = [];
var loaded = 0;
var carousel;

var debouncedHandler = debounce(function (event) {
    console.log('debouncedHandler', event);
    if (event instanceof MouseEvent) {
        var index = parseInt(event.target.getAttribute('data-index'));
        openGallery(index);
    }
}, 250, {
    leading: true,
    trailing: false
});

heroes.forEach(function(hero, index) {
    var slide = document.createElement('li');
    slide.classList.add('js_slide');
    document.querySelector("#slider-mosaics .js_slides").appendChild(slide);
    var slideImage = document.createElement('img');
    slideImage.setAttribute('data-lazy', '/media/images/mosaics/thumbnails/' + hero + '.jpg');
    slideImage.setAttribute('data-index', index);
    slideImage.alt = '';
    slide.appendChild(slideImage);
    images.push(slideImage);
    
    slide.addEventListener('click', debouncedHandler);
});

function loadImage(element) {
    if (element && !element.src) element.src = element.getAttribute('data-lazy');
}

function loadImages(slides, index, numCacheAfter, numCacheBefore) {
    var numSlides = slides.length;
    numCacheAfter = numCacheAfter || 0;
    numCacheBefore = numCacheBefore || 0;
    //console.log('loadImages', index, index - numCacheBefore, index + numCacheAfter);
    for (var i = index - numCacheBefore; i <= index + numCacheAfter; i++) {
        var currentIndex = (i + numSlides) % numSlides;
        //console.log('loadImages currentIndex', i, currentIndex);
        loadImage(slides[currentIndex]);
    }
}

for (var i = 0; i < 5; i++) {
    loadImage(images[i]);
    loaded = i;
}

var slider = document.querySelector('.js_slider');

carousel = lory(slider, {
    rewind: true,
    slidesToScroll: 2,
    enableMouseEvents: true
});

slider.addEventListener('before.lory.slide', function (event) {
    console.log('before slide', event.detail.index, event.detail.nextSlide);
    var dir = (event.detail.nextSlide - event.detail.index) / Math.abs(event.detail.nextSlide - event.detail.index);
    var index = event.detail.nextSlide - 1;
    loadImages(images, index + 4 * dir, 4, 4);
});

slider.addEventListener('after.lory.slide', debouncedHandler);

function openGallery(index) {
    var gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, {
        index: index,
        history: false,
        shareEl: false,
        getThumbBoundsFn: function(index) {
            console.log('openGallery index', index);
            var thumbnail = images[index], // find thumbnail
                pageYScroll = window.pageYOffset || document.documentElement.scrollTop,
                rect = thumbnail.getBoundingClientRect();
            return {
                x: rect.left,
                y: rect.top + pageYScroll,
                w: rect.width
            };
        }
    });
    gallery.init();
}

var pswpElement = document.querySelectorAll('.pswp')[0];

// build items array
var items = heroes.map(function(hero) {
    return {
        src: '/media/images/mosaics/mosaics/' + hero + '.jpg',
        w: 1920,
        h: 1080,
        title: '<a href="/dota2/mosaics#&gid=hero&pid=' + hero + '">Go to mosaic gallery page &#187;</a>'
    }
});