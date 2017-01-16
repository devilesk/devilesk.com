var heroes = ['abaddon', 'abyssal_underlord', 'alchemist', 'ancient_apparition', 'antimage', 'arc_warden', 'axe', 'bane', 'batrider', 'beastmaster', 'bloodseeker', 'bounty_hunter', 'brewmaster', 'bristleback', 'broodmother', 'centaur', 'chaos_knight', 'chen', 'clinkz', 'crystal_maiden', 'dark_seer', 'dazzle', 'death_prophet', 'disruptor', 'doom_bringer', 'dragon_knight', 'drow_ranger', 'earthshaker', 'earth_spirit', 'elder_titan', 'ember_spirit', 'enchantress', 'enigma', 'faceless_void', 'furion', 'gyrocopter', 'huskar', 'invoker', 'jakiro', 'juggernaut', 'keeper_of_the_light', 'kunkka', 'legion_commander', 'leshrac', 'lich', 'life_stealer', 'lina', 'lion', 'lone_druid', 'luna', 'lycan', 'magnataur', 'medusa', 'meepo', 'mirana', 'morphling', 'naga_siren', 'necrolyte', 'nevermore', 'night_stalker', 'nyx_assassin', 'obsidian_destroyer', 'ogre_magi', 'omniknight', 'oracle', 'phantom_assassin', 'phantom_lancer', 'phoenix', 'puck', 'pudge', 'pugna', 'queenofpain', 'rattletrap', 'razor', 'riki', 'rubick', 'sand_king', 'shadow_demon', 'shadow_shaman', 'shredder', 'silencer', 'skeleton_king', 'skywrath_mage', 'slardar', 'slark', 'sniper', 'spectre', 'spirit_breaker', 'storm_spirit', 'sven', 'techies', 'templar_assassin', 'terrorblade', 'tidehunter', 'tinker', 'tiny', 'treant', 'troll_warlord', 'tusk', 'undying', 'ursa', 'vengefulspirit', 'venomancer', 'viper', 'visage', 'warlock', 'weaver', 'windrunner', 'winter_wyvern', 'wisp', 'witch_doctor', 'zuus_alt1'];

var slides = [];
$(document).ready(function() {
    heroes.forEach(function(hero, index) {
        var $thumbnail = $('<div>');
        var $thumbnailImg = $('<img data-lazy="/media/images/mosaics/thumbnails/' + hero + '.jpg">')
        $thumbnail.data('index', index);
        slides.push($thumbnail);
        $thumbnail.append($thumbnailImg);
        $('.slick-carousel').append($thumbnail);
    });
    var carousel = $('.slick-carousel').slick({
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

    carousel.on('click', '.slick-slide', function(e) {
        var $slide = $(e.currentTarget);
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
            h: 1080
        }
    });
});