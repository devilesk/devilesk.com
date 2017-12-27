var lory = require('lory.js').lory;
var PhotoSwipe = require('photoswipe');
var PhotoSwipeUI_Default = require('photoswipe/dist/photoswipe-ui-default');
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

console.log('heroes', heroes.length);
heroes.forEach(function(hero, index) {
    var slide = document.createElement('li');
    slide.classList.add('js_slide');
    document.querySelector("#slider-thumbnails .js_slides").appendChild(slide);
    var slideImage = document.createElement('img');
    slideImage.setAttribute('data-lazy', '/media/images/mosaics/thumbnails/' + hero + '.jpg');
    slideImage.alt = '';
    slide.appendChild(slideImage);
    images.push(slideImage);
    
    slide.addEventListener('dblclick', function (event) {
        //openGallery(index);
        console.log('carouselMain', carouselMain);
        loadImage(mosaics[index]);
        loadImage(mosaics[index+1]);
        carouselMain.slideTo(index);
    });
    
    var slide = document.createElement('li');
    slide.classList.add('js_slide');
    document.querySelector("#slider-gallery .js_slides").appendChild(slide);
    var slideImage = document.createElement('img');
    slideImage.setAttribute('data-lazy', '/media/images/mosaics/mosaics/' + hero + '.jpg');
    slideImage.alt = '';
    slide.appendChild(slideImage);
    mosaics.push(slideImage);
    
    slide.addEventListener('dblclick', function (event) {
        openGallery('hero', hero);
    });
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
        rewind: true,
        slidesToScroll: 3,
        enableMouseEvents: true
    });



    var sliderMain = document.getElementById('slider-gallery');

    carouselMain = lory(sliderMain, {
        infinite: 1,
        enableMouseEvents: true
    });
    
    
    slider.addEventListener('before.lory.slide', function (event) {
        if (disableLoad) return;
        console.log('before slide', event.detail.index, event.detail.nextSlide);
        var dir = (event.detail.nextSlide - event.detail.index) / Math.abs(event.detail.nextSlide - event.detail.index);
        var index = event.detail.nextSlide - 1;
        loadImages(images, index + 4 * dir, 4, 4);
        /*for (var i = loaded; i < event.detail.nextSlide + 4; i++) {
            loadImage(images[i]);
        }*/
    });
    
    slider.addEventListener('after.lory.slide', function (event) {
        console.log('after slide', event.detail.currentSlide);
    });
    
    sliderMain.addEventListener('before.lory.slide', function (event) {
        if (disableLoad) return;
        console.log('before slideMain', event.detail.index, event.detail.nextSlide);
        loadImages(mosaics, event.detail.nextSlide - 1, 1, 1);
    });
    
    sliderMain.addEventListener('after.lory.slide', function (event) {
        console.log('after slideMain', event.detail.currentSlide);
    });

function openGallery(gid, pid) {
    console.log('heroes.indexOf(pid)', pid, heroes.indexOf(pid));
    var gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, {
        index: heroes.indexOf(pid),
        galleryUID: gid,
        getThumbBoundsFn: function (index) {
            console.log('opengallery', index);
            disableLoad = true;
            carousel.slideTo(index);
            carouselMain.slideTo(index);
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
}
else {
    loadImages(images, 0, 4, 0);
    loadImages(mosaics, 0, 1, 0);
}