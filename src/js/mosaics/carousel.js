var PhotoSwipe = require('photoswipe');
var lory = require('lory.js').lory;
var shuffle = require('../util/shuffle');
var PhotoSwipeUI_Default = require('photoswipe/dist/photoswipe-ui-default');
var heroes = require('./heroes');
heroes = shuffle(heroes);

var images = [];
var loaded = 0;
var carousel;

heroes.forEach(function(hero, index) {
    var slide = document.createElement('li');
    slide.classList.add('js_slide');
    document.querySelector("#slider-mosaics .js_slides").appendChild(slide);
    var slideImage = document.createElement('img');
    slideImage.setAttribute('data-lazy', '/media/images/mosaics/thumbnails/' + hero + '.jpg');
    slideImage.alt = '';
    slide.appendChild(slideImage);
    images.push(slideImage);
    
    slide.addEventListener('dblclick', function (event) {
        openGallery(index);
    });
});

function loadImage(element) {
    if (element && !element.src) element.src = element.getAttribute('data-lazy');
}

for (var i = 0; i < 5; i++) {
    loadImage(images[i]);
    loaded = i;
}

document.addEventListener('DOMContentLoaded', function() {


    var slider = document.querySelector('.js_slider');

    carousel = lory(slider, {
        infinite: 4,
        slidesToScroll: 3,
        enableMouseEvents: true
    });
    
    slider.addEventListener('before.lory.slide', function (event) {
        console.log('slide', event, event.detail.nextSlide + 4);
        for (var i = loaded; i < event.detail.nextSlide + 4; i++) {
            loadImage(images[i]);
        }
    });
});
    
    
    /*
var carousel = $('.slick-carousel').slick({
    prevArrow:"<button class='btn btn-xs btn-default prev' aria-label='Previous'><span class='glyphicon glyphicon-menu-left'></span></button>",
    nextArrow:"<button class='btn btn-xs btn-default next' aria-label='Next'><span class='glyphicon glyphicon-menu-right'></span></button>",
    infinite: true,
    slidesToShow: 11,
    variableWidth: true,
    centerMode: true,
    speed: 100,
    initialSlide: 5,
    swipeToSlide: true,
    slidesToScroll: 5,
    rows: 0,
    lazyLoad: 'ondemand',
    responsive: [{
            breakpoint: 960,
            settings: {
                slidesToShow: 3,
                slidesToScroll: 3
            }
        }, {
            breakpoint: 640,
            settings: {
                slidesToShow: 2,
                slidesToScroll: 2
            }
        }, {
            breakpoint: 320,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1
            }
        }
    ]
});

$('.slick-carousel').on('lazyLoaded', function(event, slick, direction){
    console.log('lazyLoaded');
    $('.slick-carousel').addClass('mosaics-carousel-initialized');
});

carousel.on('click', '.slick-slide', function(e) {
    var $slide = $(e.currentTarget).find('img');
    var index = $slide.data('index');
    openGallery(index);
})*/

function openGallery(index) {
    var gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, {
        index: index,
        history: false,
        shareEl: false,
        getThumbBoundsFn: function(index) {
            carousel.slideTo(index);
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