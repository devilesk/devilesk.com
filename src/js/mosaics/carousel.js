var $ = jQuery = require('jquery');
var PhotoSwipe = require('photoswipe');
var shuffle = require('../util/shuffle');
var PhotoSwipeUI_Default = require('photoswipe/dist/photoswipe-ui-default');
require('slick-carousel');

var heroes = require('./heroes');
heroes = shuffle(heroes);

var slides = [];
heroes.forEach(function(hero, index) {
    var $thumbnail = $('<div>');
    var $thumbnailImg = $('<img data-lazy="/media/images/mosaics/thumbnails/' + hero + '.jpg" alt="">')
    $thumbnailImg.data('index', index);
    slides.push($thumbnail);
    $thumbnail.append($thumbnailImg);
    $('.slick-carousel').append($thumbnail);
});
var carousel = $('.slick-carousel').slick({
    prevArrow:"<button class='btn btn-xs btn-default prev' aria-label='Previous'><span class='glyphicon glyphicon-menu-left'></span></button>",
    nextArrow:"<button class='btn btn-xs btn-default next' aria-label='Next'><span class='glyphicon glyphicon-menu-right'></span></button>",
    infinite: true,
    slidesToShow: 5,
    slidesToScroll: 5,
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
})

function openGallery(index) {
    var gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, {
        index: index,
        history: false,
        shareEl: false,
        getThumbBoundsFn: function(index) {
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
        src: '/media/images/mosaics/mosaics/' + hero + '.jpg',
        w: 1920,
        h: 1080,
        title: '<a href="/dota2/mosaics#&gid=hero&pid=' + hero + '">Go to mosaic gallery page &#187;</a>'
    }
});