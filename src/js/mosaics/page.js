var lory = require('lory.js').lory;
var PhotoSwipe = require('photoswipe');
var PhotoSwipeUI_Default = require('photoswipe/dist/photoswipe-ui-default');
var debounce = require('lodash.debounce');
var heroes = require('./heroes');

var parseHash = function() {
    var hash = window.location.hash.substring(1),
        params = {};

    if (hash.length < 5) {
        return params;
    }

    var vars = hash.split('&');
    for (var i = 0; i < vars.length; i++) {
        if (!vars[i]) {
            continue;
        }
        var pair = vars[i].split('=');
        if (pair.length < 2) {
            continue;
        }
        params[pair[0]] = pair[1];
    }
    return params;
};

var images = [];
var mosaics = [];
var loaded = 0;
var carousel;
var carouselMain;
var disableLoad = false;

var debouncedHandler = debounce(function (event) {
    if (event instanceof MouseEvent) {
        var index = parseInt(event.target.getAttribute('data-index'));
        loadImage(mosaics[index]);
        loadImage(mosaics[index+1]);
        console.log('debouncedHandler', index, carouselMain);
        carouselMain.slideTo(index);
    }
}, 250, {
    leading: true,
    trailing: false
});

var debouncedHandlerGallery = debounce(function (event) {
    console.log('debouncedHandlerGallery', event);
    if (event instanceof MouseEvent) {
        var index = parseInt(event.target.getAttribute('data-index'));
        var hero = event.target.getAttribute('data-hero');
        carousel.slideTo(index);
        openGallery('hero', hero);
    }
}, 250, {
    leading: true,
    trailing: false
});

heroes.forEach(function(hero, index) {
    var slide = document.createElement('li');
    slide.classList.add('js_slide');
    document.querySelector("#slider-thumbnails .js_slides").appendChild(slide);
    var slideImage = document.createElement('img');
    slideImage.setAttribute('data-lazy', '/media/images/mosaics/thumbnails/' + hero + '.jpg');
    slideImage.setAttribute('data-index', index);
    slideImage.alt = '';
    slide.appendChild(slideImage);
    images.push(slideImage);
    
    slide.addEventListener('click', debouncedHandler);
    
    var slideGallery = document.createElement('li');
    slideGallery.classList.add('js_slide');
    document.querySelector("#slider-gallery .js_slides").appendChild(slideGallery);
    var slideImageGallery = document.createElement('img');
    slideImageGallery.setAttribute('data-lazy', '/media/images/mosaics/mosaics/' + hero + '.jpg');
    slideImageGallery.setAttribute('data-index', index);
    slideImageGallery.setAttribute('data-hero', hero);
    slideImageGallery.alt = '';
    slideGallery.appendChild(slideImageGallery);
    mosaics.push(slideImageGallery);
    
    slideGallery.addEventListener('click', debouncedHandlerGallery);
});

function loadImage(element) {
    if (element && !element.src) element.src = element.getAttribute('data-lazy');
}

function loadImages(slides, index, numCacheAfter, numCacheBefore) {
    var numSlides = slides.length;
    numCacheAfter = numCacheAfter || 0;
    numCacheBefore = numCacheBefore || 0;
    console.log('loadImages', index, index - numCacheBefore, index + numCacheAfter);
    for (var i = index - numCacheBefore; i <= index + numCacheAfter; i++) {
        var currentIndex = (i + numSlides) % numSlides;
        console.log('loadImages currentIndex', i, currentIndex);
        loadImage(slides[currentIndex]);
    }
}

var slider = document.getElementById('slider-thumbnails');

carousel = lory(slider, {
    slidesToScroll: 3,
    enableMouseEvents: true
});



var sliderMain = document.getElementById('slider-gallery');

carouselMain = lory(sliderMain, {
    infinite: 1,
    slidesToScroll: 1,
    enableMouseEvents: true
});


slider.addEventListener('before.lory.slide', function (event) {
    console.log('before slide', disableLoad, event.detail.index, event.detail.nextSlide);
    if (disableLoad) return;
    var dir = (event.detail.nextSlide - event.detail.index) / Math.abs(event.detail.nextSlide - event.detail.index);
    var index = event.detail.nextSlide - 1;
    loadImages(images, index + 4 * dir, 4, 4);
});

slider.addEventListener('after.lory.slide', debouncedHandler);

sliderMain.addEventListener('before.lory.slide', function (event) {
    console.log('before slideMain', disableLoad, event.detail.index, event.detail.nextSlide);
    if (disableLoad) return;
    loadImages(mosaics, event.detail.nextSlide - 1, 1, 1);
});

sliderMain.addEventListener('after.lory.slide', debouncedHandlerGallery);

function openGallery(gid, pid) {
    console.log('heroes.indexOf(pid)', pid, heroes.indexOf(pid));
    var gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, {
        index: heroes.indexOf(pid),
        galleryUID: gid,
        getThumbBoundsFn: function (index) {
            console.log('opengallery', index);
            disableLoad = true;
            //carousel.slideTo(index);
            //carouselMain.slideTo(index);
            loadImages(images, index, 4, 4);
            loadImages(mosaics, index, 1, 1);
            disableLoad = false;
            var thumbnail = mosaics[index], // find thumbnail
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
        pid: hero,
        src: '/media/images/mosaics/mosaics/' + hero + '.jpg',
        //msrc: '/media/images/mosaics/thumbnails/' + hero + '.jpg',
        w: 1920,
        h: 1080
    }
});

// Initializes and opens PhotoSwipe
var hashData = parseHash();
if (hashData.pid && hashData.gid) {
    openGallery(hashData.gid, hashData.pid);
    carousel.slideTo(heroes.indexOf(hashData.pid));
    carouselMain.slideTo(heroes.indexOf(hashData.pid));
}
else {
    loadImages(images, 0, 4, 0);
    loadImages(mosaics, 0, 1, 0);
}