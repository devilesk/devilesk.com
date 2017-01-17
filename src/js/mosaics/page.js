var $ = jQuery = require('jquery');
var PhotoSwipe = require('photoswipe');
var PhotoSwipeUI_Default = require('photoswipe/dist/photoswipe-ui-default');
require('slick-carousel');

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

var heroes = require('./heroes');

var slides = [];
heroes.forEach(function(hero) {
    var $thumbnail = $('<div>');
    var $mainSlide = $('<div>');
    var $mainImage = $('<img data-lazy="/media/images/mosaics/thumbnails/' + hero + '.jpg">')
    var $thumbnailImg = $('<img data-lazy="/media/images/mosaics/thumbnails/' + hero + '.jpg">')
    $thumbnail.data('hero', hero);
    $mainSlide.data('hero', hero);
    slides.push($mainImage);
    $thumbnail.append($thumbnailImg);
    $mainSlide.append($mainImage);
    $('.slick-carousel').append($mainSlide);
    $('.slick-carousel-nav').append($thumbnail);
});

var carousel = $('.slick-carousel').slick({
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    fade: true,
    lazyLoad: 'ondemand',
    asNavFor: '.slick-carousel-nav'
});

var carouselNav = $('.slick-carousel-nav').slick({
    infinite: true,
    lazyLoad: 'ondemand',
    slidesToShow: 10,
    slidesToScroll: 10,
    asNavFor: '.slick-carousel',
    focusOnSelect: true,
    responsive: [{
            breakpoint: 960,
            settings: {
                slidesToShow: 6,
                slidesToScroll: 6
            }
        }, {
            breakpoint: 640,
            settings: {
                slidesToShow: 4,
                slidesToScroll: 4
            }
        }, {
            breakpoint: 320,
            settings: {
                slidesToShow: 2,
                slidesToScroll: 2
            }
        }
    ]
});

carousel.on('click', '.slick-slide', function(e) {
    var $slide = $(e.currentTarget);
    var hero = $slide.data('hero');
    openGallery('hero', hero);
})

function openGallery(gid, pid) {
    var gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, {
        index: heroes.indexOf(pid),
        galleryUID: gid,
        getThumbBoundsFn: function (index) {
            carousel.slick('slickGoTo', index, true);
            var thumbnail = slides[index][0], // find thumbnail
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