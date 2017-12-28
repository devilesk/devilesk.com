require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({37:[function(require,module,exports){
if (document.getElementById('slider-mosaics')) {
    require('./carousel');
}

if (document.getElementById('slider-thumbnails')) {
    require('./page');
}
},{"./carousel":35,"./page":38}],38:[function(require,module,exports){
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
},{"./heroes":36,"lodash.debounce":12,"lory.js":13,"photoswipe":16,"photoswipe/dist/photoswipe-ui-default":15}],35:[function(require,module,exports){
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
},{"../util/shuffle":42,"./heroes":36,"lodash.debounce":12,"lory.js":13,"photoswipe":16,"photoswipe/dist/photoswipe-ui-default":15}],36:[function(require,module,exports){
module.exports = ['abaddon', 'abyssal_underlord', 'alchemist', 'ancient_apparition', 'antimage', 'arc_warden', 'axe', 'bane', 'batrider', 'beastmaster', 'bloodseeker', 'bounty_hunter', 'brewmaster', 'bristleback', 'broodmother', 'centaur', 'chaos_knight', 'chen', 'clinkz', 'rattletrap', 'crystal_maiden', 'dark_seer', 'dark_willow', 'dazzle', 'death_prophet', 'disruptor', 'doom_bringer', 'dragon_knight', 'drow_ranger', 'earthshaker', 'earth_spirit', 'elder_titan', 'ember_spirit', 'enchantress', 'enigma', 'faceless_void', 'gyrocopter', 'huskar', 'invoker', 'wisp', 'jakiro', 'juggernaut', 'keeper_of_the_light', 'kunkka', 'legion_commander', 'leshrac', 'lich', 'life_stealer', 'lina', 'lion', 'lone_druid', 'luna', 'lycan', 'magnataur', 'medusa', 'meepo', 'mirana', 'monkey_king', 'morphling', 'naga_siren', 'furion', 'necrolyte', 'night_stalker', 'nyx_assassin', 'ogre_magi', 'omniknight', 'oracle', 'obsidian_destroyer', 'pangolier', 'phantom_assassin', 'phantom_lancer', 'phoenix', 'puck', 'pudge', 'pugna', 'queenofpain', 'razor', 'riki', 'rubick', 'sand_king', 'shadow_demon', 'nevermore', 'shadow_shaman', 'silencer', 'skywrath_mage', 'slardar', 'slark', 'sniper', 'spectre', 'spirit_breaker', 'storm_spirit', 'sven', 'techies', 'templar_assassin', 'terrorblade', 'tidehunter', 'shredder', 'tinker', 'tiny', 'treant', 'troll_warlord', 'tusk', 'undying', 'ursa', 'vengefulspirit', 'venomancer', 'viper', 'visage', 'warlock', 'weaver', 'windrunner', 'winter_wyvern', 'witch_doctor', 'skeleton_king', 'zuus_alt1'];
},{}],16:[function(require,module,exports){
/*! PhotoSwipe - v4.1.2 - 2017-04-05
* http://photoswipe.com
* Copyright (c) 2017 Dmitry Semenov; */
(function (root, factory) { 
	if (typeof define === 'function' && define.amd) {
		define(factory);
	} else if (typeof exports === 'object') {
		module.exports = factory();
	} else {
		root.PhotoSwipe = factory();
	}
})(this, function () {

	'use strict';
	var PhotoSwipe = function(template, UiClass, items, options){

/*>>framework-bridge*/
/**
 *
 * Set of generic functions used by gallery.
 * 
 * You're free to modify anything here as long as functionality is kept.
 * 
 */
var framework = {
	features: null,
	bind: function(target, type, listener, unbind) {
		var methodName = (unbind ? 'remove' : 'add') + 'EventListener';
		type = type.split(' ');
		for(var i = 0; i < type.length; i++) {
			if(type[i]) {
				target[methodName]( type[i], listener, false);
			}
		}
	},
	isArray: function(obj) {
		return (obj instanceof Array);
	},
	createEl: function(classes, tag) {
		var el = document.createElement(tag || 'div');
		if(classes) {
			el.className = classes;
		}
		return el;
	},
	getScrollY: function() {
		var yOffset = window.pageYOffset;
		return yOffset !== undefined ? yOffset : document.documentElement.scrollTop;
	},
	unbind: function(target, type, listener) {
		framework.bind(target,type,listener,true);
	},
	removeClass: function(el, className) {
		var reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
		el.className = el.className.replace(reg, ' ').replace(/^\s\s*/, '').replace(/\s\s*$/, ''); 
	},
	addClass: function(el, className) {
		if( !framework.hasClass(el,className) ) {
			el.className += (el.className ? ' ' : '') + className;
		}
	},
	hasClass: function(el, className) {
		return el.className && new RegExp('(^|\\s)' + className + '(\\s|$)').test(el.className);
	},
	getChildByClass: function(parentEl, childClassName) {
		var node = parentEl.firstChild;
		while(node) {
			if( framework.hasClass(node, childClassName) ) {
				return node;
			}
			node = node.nextSibling;
		}
	},
	arraySearch: function(array, value, key) {
		var i = array.length;
		while(i--) {
			if(array[i][key] === value) {
				return i;
			} 
		}
		return -1;
	},
	extend: function(o1, o2, preventOverwrite) {
		for (var prop in o2) {
			if (o2.hasOwnProperty(prop)) {
				if(preventOverwrite && o1.hasOwnProperty(prop)) {
					continue;
				}
				o1[prop] = o2[prop];
			}
		}
	},
	easing: {
		sine: {
			out: function(k) {
				return Math.sin(k * (Math.PI / 2));
			},
			inOut: function(k) {
				return - (Math.cos(Math.PI * k) - 1) / 2;
			}
		},
		cubic: {
			out: function(k) {
				return --k * k * k + 1;
			}
		}
		/*
			elastic: {
				out: function ( k ) {

					var s, a = 0.1, p = 0.4;
					if ( k === 0 ) return 0;
					if ( k === 1 ) return 1;
					if ( !a || a < 1 ) { a = 1; s = p / 4; }
					else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
					return ( a * Math.pow( 2, - 10 * k) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) + 1 );

				},
			},
			back: {
				out: function ( k ) {
					var s = 1.70158;
					return --k * k * ( ( s + 1 ) * k + s ) + 1;
				}
			}
		*/
	},

	/**
	 * 
	 * @return {object}
	 * 
	 * {
	 *  raf : request animation frame function
	 *  caf : cancel animation frame function
	 *  transfrom : transform property key (with vendor), or null if not supported
	 *  oldIE : IE8 or below
	 * }
	 * 
	 */
	detectFeatures: function() {
		if(framework.features) {
			return framework.features;
		}
		var helperEl = framework.createEl(),
			helperStyle = helperEl.style,
			vendor = '',
			features = {};

		// IE8 and below
		features.oldIE = document.all && !document.addEventListener;

		features.touch = 'ontouchstart' in window;

		if(window.requestAnimationFrame) {
			features.raf = window.requestAnimationFrame;
			features.caf = window.cancelAnimationFrame;
		}

		features.pointerEvent = navigator.pointerEnabled || navigator.msPointerEnabled;

		// fix false-positive detection of old Android in new IE
		// (IE11 ua string contains "Android 4.0")
		
		if(!features.pointerEvent) { 

			var ua = navigator.userAgent;

			// Detect if device is iPhone or iPod and if it's older than iOS 8
			// http://stackoverflow.com/a/14223920
			// 
			// This detection is made because of buggy top/bottom toolbars
			// that don't trigger window.resize event.
			// For more info refer to _isFixedPosition variable in core.js

			if (/iP(hone|od)/.test(navigator.platform)) {
				var v = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);
				if(v && v.length > 0) {
					v = parseInt(v[1], 10);
					if(v >= 1 && v < 8 ) {
						features.isOldIOSPhone = true;
					}
				}
			}

			// Detect old Android (before KitKat)
			// due to bugs related to position:fixed
			// http://stackoverflow.com/questions/7184573/pick-up-the-android-version-in-the-browser-by-javascript
			
			var match = ua.match(/Android\s([0-9\.]*)/);
			var androidversion =  match ? match[1] : 0;
			androidversion = parseFloat(androidversion);
			if(androidversion >= 1 ) {
				if(androidversion < 4.4) {
					features.isOldAndroid = true; // for fixed position bug & performance
				}
				features.androidVersion = androidversion; // for touchend bug
			}	
			features.isMobileOpera = /opera mini|opera mobi/i.test(ua);

			// p.s. yes, yes, UA sniffing is bad, propose your solution for above bugs.
		}
		
		var styleChecks = ['transform', 'perspective', 'animationName'],
			vendors = ['', 'webkit','Moz','ms','O'],
			styleCheckItem,
			styleName;

		for(var i = 0; i < 4; i++) {
			vendor = vendors[i];

			for(var a = 0; a < 3; a++) {
				styleCheckItem = styleChecks[a];

				// uppercase first letter of property name, if vendor is present
				styleName = vendor + (vendor ? 
										styleCheckItem.charAt(0).toUpperCase() + styleCheckItem.slice(1) : 
										styleCheckItem);
			
				if(!features[styleCheckItem] && styleName in helperStyle ) {
					features[styleCheckItem] = styleName;
				}
			}

			if(vendor && !features.raf) {
				vendor = vendor.toLowerCase();
				features.raf = window[vendor+'RequestAnimationFrame'];
				if(features.raf) {
					features.caf = window[vendor+'CancelAnimationFrame'] || 
									window[vendor+'CancelRequestAnimationFrame'];
				}
			}
		}
			
		if(!features.raf) {
			var lastTime = 0;
			features.raf = function(fn) {
				var currTime = new Date().getTime();
				var timeToCall = Math.max(0, 16 - (currTime - lastTime));
				var id = window.setTimeout(function() { fn(currTime + timeToCall); }, timeToCall);
				lastTime = currTime + timeToCall;
				return id;
			};
			features.caf = function(id) { clearTimeout(id); };
		}

		// Detect SVG support
		features.svg = !!document.createElementNS && 
						!!document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect;

		framework.features = features;

		return features;
	}
};

framework.detectFeatures();

// Override addEventListener for old versions of IE
if(framework.features.oldIE) {

	framework.bind = function(target, type, listener, unbind) {
		
		type = type.split(' ');

		var methodName = (unbind ? 'detach' : 'attach') + 'Event',
			evName,
			_handleEv = function() {
				listener.handleEvent.call(listener);
			};

		for(var i = 0; i < type.length; i++) {
			evName = type[i];
			if(evName) {

				if(typeof listener === 'object' && listener.handleEvent) {
					if(!unbind) {
						listener['oldIE' + evName] = _handleEv;
					} else {
						if(!listener['oldIE' + evName]) {
							return false;
						}
					}

					target[methodName]( 'on' + evName, listener['oldIE' + evName]);
				} else {
					target[methodName]( 'on' + evName, listener);
				}

			}
		}
	};
	
}

/*>>framework-bridge*/

/*>>core*/
//function(template, UiClass, items, options)

var self = this;

/**
 * Static vars, don't change unless you know what you're doing.
 */
var DOUBLE_TAP_RADIUS = 25, 
	NUM_HOLDERS = 3;

/**
 * Options
 */
var _options = {
	allowPanToNext:true,
	spacing: 0.12,
	bgOpacity: 1,
	mouseUsed: false,
	loop: true,
	pinchToClose: true,
	closeOnScroll: true,
	closeOnVerticalDrag: true,
	verticalDragRange: 0.75,
	hideAnimationDuration: 333,
	showAnimationDuration: 333,
	showHideOpacity: false,
	focus: true,
	escKey: true,
	arrowKeys: true,
	mainScrollEndFriction: 0.35,
	panEndFriction: 0.35,
	isClickableElement: function(el) {
        return el.tagName === 'A';
    },
    getDoubleTapZoom: function(isMouseClick, item) {
    	if(isMouseClick) {
    		return 1;
    	} else {
    		return item.initialZoomLevel < 0.7 ? 1 : 1.33;
    	}
    },
    maxSpreadZoom: 1.33,
	modal: true,

	// not fully implemented yet
	scaleMode: 'fit' // TODO
};
framework.extend(_options, options);


/**
 * Private helper variables & functions
 */

var _getEmptyPoint = function() { 
		return {x:0,y:0}; 
	};

var _isOpen,
	_isDestroying,
	_closedByScroll,
	_currentItemIndex,
	_containerStyle,
	_containerShiftIndex,
	_currPanDist = _getEmptyPoint(),
	_startPanOffset = _getEmptyPoint(),
	_panOffset = _getEmptyPoint(),
	_upMoveEvents, // drag move, drag end & drag cancel events array
	_downEvents, // drag start events array
	_globalEventHandlers,
	_viewportSize = {},
	_currZoomLevel,
	_startZoomLevel,
	_translatePrefix,
	_translateSufix,
	_updateSizeInterval,
	_itemsNeedUpdate,
	_currPositionIndex = 0,
	_offset = {},
	_slideSize = _getEmptyPoint(), // size of slide area, including spacing
	_itemHolders,
	_prevItemIndex,
	_indexDiff = 0, // difference of indexes since last content update
	_dragStartEvent,
	_dragMoveEvent,
	_dragEndEvent,
	_dragCancelEvent,
	_transformKey,
	_pointerEventEnabled,
	_isFixedPosition = true,
	_likelyTouchDevice,
	_modules = [],
	_requestAF,
	_cancelAF,
	_initalClassName,
	_initalWindowScrollY,
	_oldIE,
	_currentWindowScrollY,
	_features,
	_windowVisibleSize = {},
	_renderMaxResolution = false,
	_orientationChangeTimeout,


	// Registers PhotoSWipe module (History, Controller ...)
	_registerModule = function(name, module) {
		framework.extend(self, module.publicMethods);
		_modules.push(name);
	},

	_getLoopedId = function(index) {
		var numSlides = _getNumItems();
		if(index > numSlides - 1) {
			return index - numSlides;
		} else  if(index < 0) {
			return numSlides + index;
		}
		return index;
	},
	
	// Micro bind/trigger
	_listeners = {},
	_listen = function(name, fn) {
		if(!_listeners[name]) {
			_listeners[name] = [];
		}
		return _listeners[name].push(fn);
	},
	_shout = function(name) {
		var listeners = _listeners[name];

		if(listeners) {
			var args = Array.prototype.slice.call(arguments);
			args.shift();

			for(var i = 0; i < listeners.length; i++) {
				listeners[i].apply(self, args);
			}
		}
	},

	_getCurrentTime = function() {
		return new Date().getTime();
	},
	_applyBgOpacity = function(opacity) {
		_bgOpacity = opacity;
		self.bg.style.opacity = opacity * _options.bgOpacity;
	},

	_applyZoomTransform = function(styleObj,x,y,zoom,item) {
		if(!_renderMaxResolution || (item && item !== self.currItem) ) {
			zoom = zoom / (item ? item.fitRatio : self.currItem.fitRatio);	
		}
			
		styleObj[_transformKey] = _translatePrefix + x + 'px, ' + y + 'px' + _translateSufix + ' scale(' + zoom + ')';
	},
	_applyCurrentZoomPan = function( allowRenderResolution ) {
		if(_currZoomElementStyle) {

			if(allowRenderResolution) {
				if(_currZoomLevel > self.currItem.fitRatio) {
					if(!_renderMaxResolution) {
						_setImageSize(self.currItem, false, true);
						_renderMaxResolution = true;
					}
				} else {
					if(_renderMaxResolution) {
						_setImageSize(self.currItem);
						_renderMaxResolution = false;
					}
				}
			}
			

			_applyZoomTransform(_currZoomElementStyle, _panOffset.x, _panOffset.y, _currZoomLevel);
		}
	},
	_applyZoomPanToItem = function(item) {
		if(item.container) {

			_applyZoomTransform(item.container.style, 
								item.initialPosition.x, 
								item.initialPosition.y, 
								item.initialZoomLevel,
								item);
		}
	},
	_setTranslateX = function(x, elStyle) {
		elStyle[_transformKey] = _translatePrefix + x + 'px, 0px' + _translateSufix;
	},
	_moveMainScroll = function(x, dragging) {

		if(!_options.loop && dragging) {
			var newSlideIndexOffset = _currentItemIndex + (_slideSize.x * _currPositionIndex - x) / _slideSize.x,
				delta = Math.round(x - _mainScrollPos.x);

			if( (newSlideIndexOffset < 0 && delta > 0) || 
				(newSlideIndexOffset >= _getNumItems() - 1 && delta < 0) ) {
				x = _mainScrollPos.x + delta * _options.mainScrollEndFriction;
			} 
		}
		
		_mainScrollPos.x = x;
		_setTranslateX(x, _containerStyle);
	},
	_calculatePanOffset = function(axis, zoomLevel) {
		var m = _midZoomPoint[axis] - _offset[axis];
		return _startPanOffset[axis] + _currPanDist[axis] + m - m * ( zoomLevel / _startZoomLevel );
	},
	
	_equalizePoints = function(p1, p2) {
		p1.x = p2.x;
		p1.y = p2.y;
		if(p2.id) {
			p1.id = p2.id;
		}
	},
	_roundPoint = function(p) {
		p.x = Math.round(p.x);
		p.y = Math.round(p.y);
	},

	_mouseMoveTimeout = null,
	_onFirstMouseMove = function() {
		// Wait until mouse move event is fired at least twice during 100ms
		// We do this, because some mobile browsers trigger it on touchstart
		if(_mouseMoveTimeout ) { 
			framework.unbind(document, 'mousemove', _onFirstMouseMove);
			framework.addClass(template, 'pswp--has_mouse');
			_options.mouseUsed = true;
			_shout('mouseUsed');
		}
		_mouseMoveTimeout = setTimeout(function() {
			_mouseMoveTimeout = null;
		}, 100);
	},

	_bindEvents = function() {
		framework.bind(document, 'keydown', self);

		if(_features.transform) {
			// don't bind click event in browsers that don't support transform (mostly IE8)
			framework.bind(self.scrollWrap, 'click', self);
		}
		

		if(!_options.mouseUsed) {
			framework.bind(document, 'mousemove', _onFirstMouseMove);
		}

		framework.bind(window, 'resize scroll orientationchange', self);

		_shout('bindEvents');
	},

	_unbindEvents = function() {
		framework.unbind(window, 'resize scroll orientationchange', self);
		framework.unbind(window, 'scroll', _globalEventHandlers.scroll);
		framework.unbind(document, 'keydown', self);
		framework.unbind(document, 'mousemove', _onFirstMouseMove);

		if(_features.transform) {
			framework.unbind(self.scrollWrap, 'click', self);
		}

		if(_isDragging) {
			framework.unbind(window, _upMoveEvents, self);
		}

		clearTimeout(_orientationChangeTimeout);

		_shout('unbindEvents');
	},
	
	_calculatePanBounds = function(zoomLevel, update) {
		var bounds = _calculateItemSize( self.currItem, _viewportSize, zoomLevel );
		if(update) {
			_currPanBounds = bounds;
		}
		return bounds;
	},
	
	_getMinZoomLevel = function(item) {
		if(!item) {
			item = self.currItem;
		}
		return item.initialZoomLevel;
	},
	_getMaxZoomLevel = function(item) {
		if(!item) {
			item = self.currItem;
		}
		return item.w > 0 ? _options.maxSpreadZoom : 1;
	},

	// Return true if offset is out of the bounds
	_modifyDestPanOffset = function(axis, destPanBounds, destPanOffset, destZoomLevel) {
		if(destZoomLevel === self.currItem.initialZoomLevel) {
			destPanOffset[axis] = self.currItem.initialPosition[axis];
			return true;
		} else {
			destPanOffset[axis] = _calculatePanOffset(axis, destZoomLevel); 

			if(destPanOffset[axis] > destPanBounds.min[axis]) {
				destPanOffset[axis] = destPanBounds.min[axis];
				return true;
			} else if(destPanOffset[axis] < destPanBounds.max[axis] ) {
				destPanOffset[axis] = destPanBounds.max[axis];
				return true;
			}
		}
		return false;
	},

	_setupTransforms = function() {

		if(_transformKey) {
			// setup 3d transforms
			var allow3dTransform = _features.perspective && !_likelyTouchDevice;
			_translatePrefix = 'translate' + (allow3dTransform ? '3d(' : '(');
			_translateSufix = _features.perspective ? ', 0px)' : ')';	
			return;
		}

		// Override zoom/pan/move functions in case old browser is used (most likely IE)
		// (so they use left/top/width/height, instead of CSS transform)
	
		_transformKey = 'left';
		framework.addClass(template, 'pswp--ie');

		_setTranslateX = function(x, elStyle) {
			elStyle.left = x + 'px';
		};
		_applyZoomPanToItem = function(item) {

			var zoomRatio = item.fitRatio > 1 ? 1 : item.fitRatio,
				s = item.container.style,
				w = zoomRatio * item.w,
				h = zoomRatio * item.h;

			s.width = w + 'px';
			s.height = h + 'px';
			s.left = item.initialPosition.x + 'px';
			s.top = item.initialPosition.y + 'px';

		};
		_applyCurrentZoomPan = function() {
			if(_currZoomElementStyle) {

				var s = _currZoomElementStyle,
					item = self.currItem,
					zoomRatio = item.fitRatio > 1 ? 1 : item.fitRatio,
					w = zoomRatio * item.w,
					h = zoomRatio * item.h;

				s.width = w + 'px';
				s.height = h + 'px';


				s.left = _panOffset.x + 'px';
				s.top = _panOffset.y + 'px';
			}
			
		};
	},

	_onKeyDown = function(e) {
		var keydownAction = '';
		if(_options.escKey && e.keyCode === 27) { 
			keydownAction = 'close';
		} else if(_options.arrowKeys) {
			if(e.keyCode === 37) {
				keydownAction = 'prev';
			} else if(e.keyCode === 39) { 
				keydownAction = 'next';
			}
		}

		if(keydownAction) {
			// don't do anything if special key pressed to prevent from overriding default browser actions
			// e.g. in Chrome on Mac cmd+arrow-left returns to previous page
			if( !e.ctrlKey && !e.altKey && !e.shiftKey && !e.metaKey ) {
				if(e.preventDefault) {
					e.preventDefault();
				} else {
					e.returnValue = false;
				} 
				self[keydownAction]();
			}
		}
	},

	_onGlobalClick = function(e) {
		if(!e) {
			return;
		}

		// don't allow click event to pass through when triggering after drag or some other gesture
		if(_moved || _zoomStarted || _mainScrollAnimating || _verticalDragInitiated) {
			e.preventDefault();
			e.stopPropagation();
		}
	},

	_updatePageScrollOffset = function() {
		self.setScrollOffset(0, framework.getScrollY());		
	};
	


	



// Micro animation engine
var _animations = {},
	_numAnimations = 0,
	_stopAnimation = function(name) {
		if(_animations[name]) {
			if(_animations[name].raf) {
				_cancelAF( _animations[name].raf );
			}
			_numAnimations--;
			delete _animations[name];
		}
	},
	_registerStartAnimation = function(name) {
		if(_animations[name]) {
			_stopAnimation(name);
		}
		if(!_animations[name]) {
			_numAnimations++;
			_animations[name] = {};
		}
	},
	_stopAllAnimations = function() {
		for (var prop in _animations) {

			if( _animations.hasOwnProperty( prop ) ) {
				_stopAnimation(prop);
			} 
			
		}
	},
	_animateProp = function(name, b, endProp, d, easingFn, onUpdate, onComplete) {
		var startAnimTime = _getCurrentTime(), t;
		_registerStartAnimation(name);

		var animloop = function(){
			if ( _animations[name] ) {
				
				t = _getCurrentTime() - startAnimTime; // time diff
				//b - beginning (start prop)
				//d - anim duration

				if ( t >= d ) {
					_stopAnimation(name);
					onUpdate(endProp);
					if(onComplete) {
						onComplete();
					}
					return;
				}
				onUpdate( (endProp - b) * easingFn(t/d) + b );

				_animations[name].raf = _requestAF(animloop);
			}
		};
		animloop();
	};
	


var publicMethods = {

	// make a few local variables and functions public
	shout: _shout,
	listen: _listen,
	viewportSize: _viewportSize,
	options: _options,

	isMainScrollAnimating: function() {
		return _mainScrollAnimating;
	},
	getZoomLevel: function() {
		return _currZoomLevel;
	},
	getCurrentIndex: function() {
		return _currentItemIndex;
	},
	isDragging: function() {
		return _isDragging;
	},	
	isZooming: function() {
		return _isZooming;
	},
	setScrollOffset: function(x,y) {
		_offset.x = x;
		_currentWindowScrollY = _offset.y = y;
		_shout('updateScrollOffset', _offset);
	},
	applyZoomPan: function(zoomLevel,panX,panY,allowRenderResolution) {
		_panOffset.x = panX;
		_panOffset.y = panY;
		_currZoomLevel = zoomLevel;
		_applyCurrentZoomPan( allowRenderResolution );
	},

	init: function() {

		if(_isOpen || _isDestroying) {
			return;
		}

		var i;

		self.framework = framework; // basic functionality
		self.template = template; // root DOM element of PhotoSwipe
		self.bg = framework.getChildByClass(template, 'pswp__bg');

		_initalClassName = template.className;
		_isOpen = true;
				
		_features = framework.detectFeatures();
		_requestAF = _features.raf;
		_cancelAF = _features.caf;
		_transformKey = _features.transform;
		_oldIE = _features.oldIE;
		
		self.scrollWrap = framework.getChildByClass(template, 'pswp__scroll-wrap');
		self.container = framework.getChildByClass(self.scrollWrap, 'pswp__container');

		_containerStyle = self.container.style; // for fast access

		// Objects that hold slides (there are only 3 in DOM)
		self.itemHolders = _itemHolders = [
			{el:self.container.children[0] , wrap:0, index: -1},
			{el:self.container.children[1] , wrap:0, index: -1},
			{el:self.container.children[2] , wrap:0, index: -1}
		];

		// hide nearby item holders until initial zoom animation finishes (to avoid extra Paints)
		_itemHolders[0].el.style.display = _itemHolders[2].el.style.display = 'none';

		_setupTransforms();

		// Setup global events
		_globalEventHandlers = {
			resize: self.updateSize,

			// Fixes: iOS 10.3 resize event
			// does not update scrollWrap.clientWidth instantly after resize
			// https://github.com/dimsemenov/PhotoSwipe/issues/1315
			orientationchange: function() {
				clearTimeout(_orientationChangeTimeout);
				_orientationChangeTimeout = setTimeout(function() {
					if(_viewportSize.x !== self.scrollWrap.clientWidth) {
						self.updateSize();
					}
				}, 500);
			},
			scroll: _updatePageScrollOffset,
			keydown: _onKeyDown,
			click: _onGlobalClick
		};

		// disable show/hide effects on old browsers that don't support CSS animations or transforms, 
		// old IOS, Android and Opera mobile. Blackberry seems to work fine, even older models.
		var oldPhone = _features.isOldIOSPhone || _features.isOldAndroid || _features.isMobileOpera;
		if(!_features.animationName || !_features.transform || oldPhone) {
			_options.showAnimationDuration = _options.hideAnimationDuration = 0;
		}

		// init modules
		for(i = 0; i < _modules.length; i++) {
			self['init' + _modules[i]]();
		}
		
		// init
		if(UiClass) {
			var ui = self.ui = new UiClass(self, framework);
			ui.init();
		}

		_shout('firstUpdate');
		_currentItemIndex = _currentItemIndex || _options.index || 0;
		// validate index
		if( isNaN(_currentItemIndex) || _currentItemIndex < 0 || _currentItemIndex >= _getNumItems() ) {
			_currentItemIndex = 0;
		}
		self.currItem = _getItemAt( _currentItemIndex );

		
		if(_features.isOldIOSPhone || _features.isOldAndroid) {
			_isFixedPosition = false;
		}
		
		template.setAttribute('aria-hidden', 'false');
		if(_options.modal) {
			if(!_isFixedPosition) {
				template.style.position = 'absolute';
				template.style.top = framework.getScrollY() + 'px';
			} else {
				template.style.position = 'fixed';
			}
		}

		if(_currentWindowScrollY === undefined) {
			_shout('initialLayout');
			_currentWindowScrollY = _initalWindowScrollY = framework.getScrollY();
		}
		
		// add classes to root element of PhotoSwipe
		var rootClasses = 'pswp--open ';
		if(_options.mainClass) {
			rootClasses += _options.mainClass + ' ';
		}
		if(_options.showHideOpacity) {
			rootClasses += 'pswp--animate_opacity ';
		}
		rootClasses += _likelyTouchDevice ? 'pswp--touch' : 'pswp--notouch';
		rootClasses += _features.animationName ? ' pswp--css_animation' : '';
		rootClasses += _features.svg ? ' pswp--svg' : '';
		framework.addClass(template, rootClasses);

		self.updateSize();

		// initial update
		_containerShiftIndex = -1;
		_indexDiff = null;
		for(i = 0; i < NUM_HOLDERS; i++) {
			_setTranslateX( (i+_containerShiftIndex) * _slideSize.x, _itemHolders[i].el.style);
		}

		if(!_oldIE) {
			framework.bind(self.scrollWrap, _downEvents, self); // no dragging for old IE
		}	

		_listen('initialZoomInEnd', function() {
			self.setContent(_itemHolders[0], _currentItemIndex-1);
			self.setContent(_itemHolders[2], _currentItemIndex+1);

			_itemHolders[0].el.style.display = _itemHolders[2].el.style.display = 'block';

			if(_options.focus) {
				// focus causes layout, 
				// which causes lag during the animation, 
				// that's why we delay it untill the initial zoom transition ends
				template.focus();
			}
			 

			_bindEvents();
		});

		// set content for center slide (first time)
		self.setContent(_itemHolders[1], _currentItemIndex);
		
		self.updateCurrItem();

		_shout('afterInit');

		if(!_isFixedPosition) {

			// On all versions of iOS lower than 8.0, we check size of viewport every second.
			// 
			// This is done to detect when Safari top & bottom bars appear, 
			// as this action doesn't trigger any events (like resize). 
			// 
			// On iOS8 they fixed this.
			// 
			// 10 Nov 2014: iOS 7 usage ~40%. iOS 8 usage 56%.
			
			_updateSizeInterval = setInterval(function() {
				if(!_numAnimations && !_isDragging && !_isZooming && (_currZoomLevel === self.currItem.initialZoomLevel)  ) {
					self.updateSize();
				}
			}, 1000);
		}

		framework.addClass(template, 'pswp--visible');
	},

	// Close the gallery, then destroy it
	close: function() {
		if(!_isOpen) {
			return;
		}

		_isOpen = false;
		_isDestroying = true;
		_shout('close');
		_unbindEvents();

		_showOrHide(self.currItem, null, true, self.destroy);
	},

	// destroys the gallery (unbinds events, cleans up intervals and timeouts to avoid memory leaks)
	destroy: function() {
		_shout('destroy');

		if(_showOrHideTimeout) {
			clearTimeout(_showOrHideTimeout);
		}
		
		template.setAttribute('aria-hidden', 'true');
		template.className = _initalClassName;

		if(_updateSizeInterval) {
			clearInterval(_updateSizeInterval);
		}

		framework.unbind(self.scrollWrap, _downEvents, self);

		// we unbind scroll event at the end, as closing animation may depend on it
		framework.unbind(window, 'scroll', self);

		_stopDragUpdateLoop();

		_stopAllAnimations();

		_listeners = null;
	},

	/**
	 * Pan image to position
	 * @param {Number} x     
	 * @param {Number} y     
	 * @param {Boolean} force Will ignore bounds if set to true.
	 */
	panTo: function(x,y,force) {
		if(!force) {
			if(x > _currPanBounds.min.x) {
				x = _currPanBounds.min.x;
			} else if(x < _currPanBounds.max.x) {
				x = _currPanBounds.max.x;
			}

			if(y > _currPanBounds.min.y) {
				y = _currPanBounds.min.y;
			} else if(y < _currPanBounds.max.y) {
				y = _currPanBounds.max.y;
			}
		}
		
		_panOffset.x = x;
		_panOffset.y = y;
		_applyCurrentZoomPan();
	},
	
	handleEvent: function (e) {
		e = e || window.event;
		if(_globalEventHandlers[e.type]) {
			_globalEventHandlers[e.type](e);
		}
	},


	goTo: function(index) {

		index = _getLoopedId(index);

		var diff = index - _currentItemIndex;
		_indexDiff = diff;

		_currentItemIndex = index;
		self.currItem = _getItemAt( _currentItemIndex );
		_currPositionIndex -= diff;
		
		_moveMainScroll(_slideSize.x * _currPositionIndex);
		

		_stopAllAnimations();
		_mainScrollAnimating = false;

		self.updateCurrItem();
	},
	next: function() {
		self.goTo( _currentItemIndex + 1);
	},
	prev: function() {
		self.goTo( _currentItemIndex - 1);
	},

	// update current zoom/pan objects
	updateCurrZoomItem: function(emulateSetContent) {
		if(emulateSetContent) {
			_shout('beforeChange', 0);
		}

		// itemHolder[1] is middle (current) item
		if(_itemHolders[1].el.children.length) {
			var zoomElement = _itemHolders[1].el.children[0];
			if( framework.hasClass(zoomElement, 'pswp__zoom-wrap') ) {
				_currZoomElementStyle = zoomElement.style;
			} else {
				_currZoomElementStyle = null;
			}
		} else {
			_currZoomElementStyle = null;
		}
		
		_currPanBounds = self.currItem.bounds;	
		_startZoomLevel = _currZoomLevel = self.currItem.initialZoomLevel;

		_panOffset.x = _currPanBounds.center.x;
		_panOffset.y = _currPanBounds.center.y;

		if(emulateSetContent) {
			_shout('afterChange');
		}
	},


	invalidateCurrItems: function() {
		_itemsNeedUpdate = true;
		for(var i = 0; i < NUM_HOLDERS; i++) {
			if( _itemHolders[i].item ) {
				_itemHolders[i].item.needsUpdate = true;
			}
		}
	},

	updateCurrItem: function(beforeAnimation) {

		if(_indexDiff === 0) {
			return;
		}

		var diffAbs = Math.abs(_indexDiff),
			tempHolder;

		if(beforeAnimation && diffAbs < 2) {
			return;
		}


		self.currItem = _getItemAt( _currentItemIndex );
		_renderMaxResolution = false;
		
		_shout('beforeChange', _indexDiff);

		if(diffAbs >= NUM_HOLDERS) {
			_containerShiftIndex += _indexDiff + (_indexDiff > 0 ? -NUM_HOLDERS : NUM_HOLDERS);
			diffAbs = NUM_HOLDERS;
		}
		for(var i = 0; i < diffAbs; i++) {
			if(_indexDiff > 0) {
				tempHolder = _itemHolders.shift();
				_itemHolders[NUM_HOLDERS-1] = tempHolder; // move first to last

				_containerShiftIndex++;
				_setTranslateX( (_containerShiftIndex+2) * _slideSize.x, tempHolder.el.style);
				self.setContent(tempHolder, _currentItemIndex - diffAbs + i + 1 + 1);
			} else {
				tempHolder = _itemHolders.pop();
				_itemHolders.unshift( tempHolder ); // move last to first

				_containerShiftIndex--;
				_setTranslateX( _containerShiftIndex * _slideSize.x, tempHolder.el.style);
				self.setContent(tempHolder, _currentItemIndex + diffAbs - i - 1 - 1);
			}
			
		}

		// reset zoom/pan on previous item
		if(_currZoomElementStyle && Math.abs(_indexDiff) === 1) {

			var prevItem = _getItemAt(_prevItemIndex);
			if(prevItem.initialZoomLevel !== _currZoomLevel) {
				_calculateItemSize(prevItem , _viewportSize );
				_setImageSize(prevItem);
				_applyZoomPanToItem( prevItem ); 				
			}

		}

		// reset diff after update
		_indexDiff = 0;

		self.updateCurrZoomItem();

		_prevItemIndex = _currentItemIndex;

		_shout('afterChange');
		
	},



	updateSize: function(force) {
		
		if(!_isFixedPosition && _options.modal) {
			var windowScrollY = framework.getScrollY();
			if(_currentWindowScrollY !== windowScrollY) {
				template.style.top = windowScrollY + 'px';
				_currentWindowScrollY = windowScrollY;
			}
			if(!force && _windowVisibleSize.x === window.innerWidth && _windowVisibleSize.y === window.innerHeight) {
				return;
			}
			_windowVisibleSize.x = window.innerWidth;
			_windowVisibleSize.y = window.innerHeight;

			//template.style.width = _windowVisibleSize.x + 'px';
			template.style.height = _windowVisibleSize.y + 'px';
		}



		_viewportSize.x = self.scrollWrap.clientWidth;
		_viewportSize.y = self.scrollWrap.clientHeight;

		_updatePageScrollOffset();

		_slideSize.x = _viewportSize.x + Math.round(_viewportSize.x * _options.spacing);
		_slideSize.y = _viewportSize.y;

		_moveMainScroll(_slideSize.x * _currPositionIndex);

		_shout('beforeResize'); // even may be used for example to switch image sources


		// don't re-calculate size on inital size update
		if(_containerShiftIndex !== undefined) {

			var holder,
				item,
				hIndex;

			for(var i = 0; i < NUM_HOLDERS; i++) {
				holder = _itemHolders[i];
				_setTranslateX( (i+_containerShiftIndex) * _slideSize.x, holder.el.style);

				hIndex = _currentItemIndex+i-1;

				if(_options.loop && _getNumItems() > 2) {
					hIndex = _getLoopedId(hIndex);
				}

				// update zoom level on items and refresh source (if needsUpdate)
				item = _getItemAt( hIndex );

				// re-render gallery item if `needsUpdate`,
				// or doesn't have `bounds` (entirely new slide object)
				if( item && (_itemsNeedUpdate || item.needsUpdate || !item.bounds) ) {

					self.cleanSlide( item );
					
					self.setContent( holder, hIndex );

					// if "center" slide
					if(i === 1) {
						self.currItem = item;
						self.updateCurrZoomItem(true);
					}

					item.needsUpdate = false;

				} else if(holder.index === -1 && hIndex >= 0) {
					// add content first time
					self.setContent( holder, hIndex );
				}
				if(item && item.container) {
					_calculateItemSize(item, _viewportSize);
					_setImageSize(item);
					_applyZoomPanToItem( item );
				}
				
			}
			_itemsNeedUpdate = false;
		}	

		_startZoomLevel = _currZoomLevel = self.currItem.initialZoomLevel;
		_currPanBounds = self.currItem.bounds;

		if(_currPanBounds) {
			_panOffset.x = _currPanBounds.center.x;
			_panOffset.y = _currPanBounds.center.y;
			_applyCurrentZoomPan( true );
		}
		
		_shout('resize');
	},
	
	// Zoom current item to
	zoomTo: function(destZoomLevel, centerPoint, speed, easingFn, updateFn) {
		/*
			if(destZoomLevel === 'fit') {
				destZoomLevel = self.currItem.fitRatio;
			} else if(destZoomLevel === 'fill') {
				destZoomLevel = self.currItem.fillRatio;
			}
		*/

		if(centerPoint) {
			_startZoomLevel = _currZoomLevel;
			_midZoomPoint.x = Math.abs(centerPoint.x) - _panOffset.x ;
			_midZoomPoint.y = Math.abs(centerPoint.y) - _panOffset.y ;
			_equalizePoints(_startPanOffset, _panOffset);
		}

		var destPanBounds = _calculatePanBounds(destZoomLevel, false),
			destPanOffset = {};

		_modifyDestPanOffset('x', destPanBounds, destPanOffset, destZoomLevel);
		_modifyDestPanOffset('y', destPanBounds, destPanOffset, destZoomLevel);

		var initialZoomLevel = _currZoomLevel;
		var initialPanOffset = {
			x: _panOffset.x,
			y: _panOffset.y
		};

		_roundPoint(destPanOffset);

		var onUpdate = function(now) {
			if(now === 1) {
				_currZoomLevel = destZoomLevel;
				_panOffset.x = destPanOffset.x;
				_panOffset.y = destPanOffset.y;
			} else {
				_currZoomLevel = (destZoomLevel - initialZoomLevel) * now + initialZoomLevel;
				_panOffset.x = (destPanOffset.x - initialPanOffset.x) * now + initialPanOffset.x;
				_panOffset.y = (destPanOffset.y - initialPanOffset.y) * now + initialPanOffset.y;
			}

			if(updateFn) {
				updateFn(now);
			}

			_applyCurrentZoomPan( now === 1 );
		};

		if(speed) {
			_animateProp('customZoomTo', 0, 1, speed, easingFn || framework.easing.sine.inOut, onUpdate);
		} else {
			onUpdate(1);
		}
	}


};


/*>>core*/

/*>>gestures*/
/**
 * Mouse/touch/pointer event handlers.
 * 
 * separated from @core.js for readability
 */

var MIN_SWIPE_DISTANCE = 30,
	DIRECTION_CHECK_OFFSET = 10; // amount of pixels to drag to determine direction of swipe

var _gestureStartTime,
	_gestureCheckSpeedTime,

	// pool of objects that are used during dragging of zooming
	p = {}, // first point
	p2 = {}, // second point (for zoom gesture)
	delta = {},
	_currPoint = {},
	_startPoint = {},
	_currPointers = [],
	_startMainScrollPos = {},
	_releaseAnimData,
	_posPoints = [], // array of points during dragging, used to determine type of gesture
	_tempPoint = {},

	_isZoomingIn,
	_verticalDragInitiated,
	_oldAndroidTouchEndTimeout,
	_currZoomedItemIndex = 0,
	_centerPoint = _getEmptyPoint(),
	_lastReleaseTime = 0,
	_isDragging, // at least one pointer is down
	_isMultitouch, // at least two _pointers are down
	_zoomStarted, // zoom level changed during zoom gesture
	_moved,
	_dragAnimFrame,
	_mainScrollShifted,
	_currentPoints, // array of current touch points
	_isZooming,
	_currPointsDistance,
	_startPointsDistance,
	_currPanBounds,
	_mainScrollPos = _getEmptyPoint(),
	_currZoomElementStyle,
	_mainScrollAnimating, // true, if animation after swipe gesture is running
	_midZoomPoint = _getEmptyPoint(),
	_currCenterPoint = _getEmptyPoint(),
	_direction,
	_isFirstMove,
	_opacityChanged,
	_bgOpacity,
	_wasOverInitialZoom,

	_isEqualPoints = function(p1, p2) {
		return p1.x === p2.x && p1.y === p2.y;
	},
	_isNearbyPoints = function(touch0, touch1) {
		return Math.abs(touch0.x - touch1.x) < DOUBLE_TAP_RADIUS && Math.abs(touch0.y - touch1.y) < DOUBLE_TAP_RADIUS;
	},
	_calculatePointsDistance = function(p1, p2) {
		_tempPoint.x = Math.abs( p1.x - p2.x );
		_tempPoint.y = Math.abs( p1.y - p2.y );
		return Math.sqrt(_tempPoint.x * _tempPoint.x + _tempPoint.y * _tempPoint.y);
	},
	_stopDragUpdateLoop = function() {
		if(_dragAnimFrame) {
			_cancelAF(_dragAnimFrame);
			_dragAnimFrame = null;
		}
	},
	_dragUpdateLoop = function() {
		if(_isDragging) {
			_dragAnimFrame = _requestAF(_dragUpdateLoop);
			_renderMovement();
		}
	},
	_canPan = function() {
		return !(_options.scaleMode === 'fit' && _currZoomLevel ===  self.currItem.initialZoomLevel);
	},
	
	// find the closest parent DOM element
	_closestElement = function(el, fn) {
	  	if(!el || el === document) {
	  		return false;
	  	}

	  	// don't search elements above pswp__scroll-wrap
	  	if(el.getAttribute('class') && el.getAttribute('class').indexOf('pswp__scroll-wrap') > -1 ) {
	  		return false;
	  	}

	  	if( fn(el) ) {
	  		return el;
	  	}

	  	return _closestElement(el.parentNode, fn);
	},

	_preventObj = {},
	_preventDefaultEventBehaviour = function(e, isDown) {
	    _preventObj.prevent = !_closestElement(e.target, _options.isClickableElement);

		_shout('preventDragEvent', e, isDown, _preventObj);
		return _preventObj.prevent;

	},
	_convertTouchToPoint = function(touch, p) {
		p.x = touch.pageX;
		p.y = touch.pageY;
		p.id = touch.identifier;
		return p;
	},
	_findCenterOfPoints = function(p1, p2, pCenter) {
		pCenter.x = (p1.x + p2.x) * 0.5;
		pCenter.y = (p1.y + p2.y) * 0.5;
	},
	_pushPosPoint = function(time, x, y) {
		if(time - _gestureCheckSpeedTime > 50) {
			var o = _posPoints.length > 2 ? _posPoints.shift() : {};
			o.x = x;
			o.y = y; 
			_posPoints.push(o);
			_gestureCheckSpeedTime = time;
		}
	},

	_calculateVerticalDragOpacityRatio = function() {
		var yOffset = _panOffset.y - self.currItem.initialPosition.y; // difference between initial and current position
		return 1 -  Math.abs( yOffset / (_viewportSize.y / 2)  );
	},

	
	// points pool, reused during touch events
	_ePoint1 = {},
	_ePoint2 = {},
	_tempPointsArr = [],
	_tempCounter,
	_getTouchPoints = function(e) {
		// clean up previous points, without recreating array
		while(_tempPointsArr.length > 0) {
			_tempPointsArr.pop();
		}

		if(!_pointerEventEnabled) {
			if(e.type.indexOf('touch') > -1) {

				if(e.touches && e.touches.length > 0) {
					_tempPointsArr[0] = _convertTouchToPoint(e.touches[0], _ePoint1);
					if(e.touches.length > 1) {
						_tempPointsArr[1] = _convertTouchToPoint(e.touches[1], _ePoint2);
					}
				}
				
			} else {
				_ePoint1.x = e.pageX;
				_ePoint1.y = e.pageY;
				_ePoint1.id = '';
				_tempPointsArr[0] = _ePoint1;//_ePoint1;
			}
		} else {
			_tempCounter = 0;
			// we can use forEach, as pointer events are supported only in modern browsers
			_currPointers.forEach(function(p) {
				if(_tempCounter === 0) {
					_tempPointsArr[0] = p;
				} else if(_tempCounter === 1) {
					_tempPointsArr[1] = p;
				}
				_tempCounter++;

			});
		}
		return _tempPointsArr;
	},

	_panOrMoveMainScroll = function(axis, delta) {

		var panFriction,
			overDiff = 0,
			newOffset = _panOffset[axis] + delta[axis],
			startOverDiff,
			dir = delta[axis] > 0,
			newMainScrollPosition = _mainScrollPos.x + delta.x,
			mainScrollDiff = _mainScrollPos.x - _startMainScrollPos.x,
			newPanPos,
			newMainScrollPos;

		// calculate fdistance over the bounds and friction
		if(newOffset > _currPanBounds.min[axis] || newOffset < _currPanBounds.max[axis]) {
			panFriction = _options.panEndFriction;
			// Linear increasing of friction, so at 1/4 of viewport it's at max value. 
			// Looks not as nice as was expected. Left for history.
			// panFriction = (1 - (_panOffset[axis] + delta[axis] + panBounds.min[axis]) / (_viewportSize[axis] / 4) );
		} else {
			panFriction = 1;
		}
		
		newOffset = _panOffset[axis] + delta[axis] * panFriction;

		// move main scroll or start panning
		if(_options.allowPanToNext || _currZoomLevel === self.currItem.initialZoomLevel) {


			if(!_currZoomElementStyle) {
				
				newMainScrollPos = newMainScrollPosition;

			} else if(_direction === 'h' && axis === 'x' && !_zoomStarted ) {
				
				if(dir) {
					if(newOffset > _currPanBounds.min[axis]) {
						panFriction = _options.panEndFriction;
						overDiff = _currPanBounds.min[axis] - newOffset;
						startOverDiff = _currPanBounds.min[axis] - _startPanOffset[axis];
					}
					
					// drag right
					if( (startOverDiff <= 0 || mainScrollDiff < 0) && _getNumItems() > 1 ) {
						newMainScrollPos = newMainScrollPosition;
						if(mainScrollDiff < 0 && newMainScrollPosition > _startMainScrollPos.x) {
							newMainScrollPos = _startMainScrollPos.x;
						}
					} else {
						if(_currPanBounds.min.x !== _currPanBounds.max.x) {
							newPanPos = newOffset;
						}
						
					}

				} else {

					if(newOffset < _currPanBounds.max[axis] ) {
						panFriction =_options.panEndFriction;
						overDiff = newOffset - _currPanBounds.max[axis];
						startOverDiff = _startPanOffset[axis] - _currPanBounds.max[axis];
					}

					if( (startOverDiff <= 0 || mainScrollDiff > 0) && _getNumItems() > 1 ) {
						newMainScrollPos = newMainScrollPosition;

						if(mainScrollDiff > 0 && newMainScrollPosition < _startMainScrollPos.x) {
							newMainScrollPos = _startMainScrollPos.x;
						}

					} else {
						if(_currPanBounds.min.x !== _currPanBounds.max.x) {
							newPanPos = newOffset;
						}
					}

				}


				//
			}

			if(axis === 'x') {

				if(newMainScrollPos !== undefined) {
					_moveMainScroll(newMainScrollPos, true);
					if(newMainScrollPos === _startMainScrollPos.x) {
						_mainScrollShifted = false;
					} else {
						_mainScrollShifted = true;
					}
				}

				if(_currPanBounds.min.x !== _currPanBounds.max.x) {
					if(newPanPos !== undefined) {
						_panOffset.x = newPanPos;
					} else if(!_mainScrollShifted) {
						_panOffset.x += delta.x * panFriction;
					}
				}

				return newMainScrollPos !== undefined;
			}

		}

		if(!_mainScrollAnimating) {
			
			if(!_mainScrollShifted) {
				if(_currZoomLevel > self.currItem.fitRatio) {
					_panOffset[axis] += delta[axis] * panFriction;
				
				}
			}

			
		}
		
	},

	// Pointerdown/touchstart/mousedown handler
	_onDragStart = function(e) {

		// Allow dragging only via left mouse button.
		// As this handler is not added in IE8 - we ignore e.which
		// 
		// http://www.quirksmode.org/js/events_properties.html
		// https://developer.mozilla.org/en-US/docs/Web/API/event.button
		if(e.type === 'mousedown' && e.button > 0  ) {
			return;
		}

		if(_initialZoomRunning) {
			e.preventDefault();
			return;
		}

		if(_oldAndroidTouchEndTimeout && e.type === 'mousedown') {
			return;
		}

		if(_preventDefaultEventBehaviour(e, true)) {
			e.preventDefault();
		}



		_shout('pointerDown');

		if(_pointerEventEnabled) {
			var pointerIndex = framework.arraySearch(_currPointers, e.pointerId, 'id');
			if(pointerIndex < 0) {
				pointerIndex = _currPointers.length;
			}
			_currPointers[pointerIndex] = {x:e.pageX, y:e.pageY, id: e.pointerId};
		}
		


		var startPointsList = _getTouchPoints(e),
			numPoints = startPointsList.length;

		_currentPoints = null;

		_stopAllAnimations();

		// init drag
		if(!_isDragging || numPoints === 1) {

			

			_isDragging = _isFirstMove = true;
			framework.bind(window, _upMoveEvents, self);

			_isZoomingIn = 
				_wasOverInitialZoom = 
				_opacityChanged = 
				_verticalDragInitiated = 
				_mainScrollShifted = 
				_moved = 
				_isMultitouch = 
				_zoomStarted = false;

			_direction = null;

			_shout('firstTouchStart', startPointsList);

			_equalizePoints(_startPanOffset, _panOffset);

			_currPanDist.x = _currPanDist.y = 0;
			_equalizePoints(_currPoint, startPointsList[0]);
			_equalizePoints(_startPoint, _currPoint);

			//_equalizePoints(_startMainScrollPos, _mainScrollPos);
			_startMainScrollPos.x = _slideSize.x * _currPositionIndex;

			_posPoints = [{
				x: _currPoint.x,
				y: _currPoint.y
			}];

			_gestureCheckSpeedTime = _gestureStartTime = _getCurrentTime();

			//_mainScrollAnimationEnd(true);
			_calculatePanBounds( _currZoomLevel, true );
			
			// Start rendering
			_stopDragUpdateLoop();
			_dragUpdateLoop();
			
		}

		// init zoom
		if(!_isZooming && numPoints > 1 && !_mainScrollAnimating && !_mainScrollShifted) {
			_startZoomLevel = _currZoomLevel;
			_zoomStarted = false; // true if zoom changed at least once

			_isZooming = _isMultitouch = true;
			_currPanDist.y = _currPanDist.x = 0;

			_equalizePoints(_startPanOffset, _panOffset);

			_equalizePoints(p, startPointsList[0]);
			_equalizePoints(p2, startPointsList[1]);

			_findCenterOfPoints(p, p2, _currCenterPoint);

			_midZoomPoint.x = Math.abs(_currCenterPoint.x) - _panOffset.x;
			_midZoomPoint.y = Math.abs(_currCenterPoint.y) - _panOffset.y;
			_currPointsDistance = _startPointsDistance = _calculatePointsDistance(p, p2);
		}


	},

	// Pointermove/touchmove/mousemove handler
	_onDragMove = function(e) {

		e.preventDefault();

		if(_pointerEventEnabled) {
			var pointerIndex = framework.arraySearch(_currPointers, e.pointerId, 'id');
			if(pointerIndex > -1) {
				var p = _currPointers[pointerIndex];
				p.x = e.pageX;
				p.y = e.pageY; 
			}
		}

		if(_isDragging) {
			var touchesList = _getTouchPoints(e);
			if(!_direction && !_moved && !_isZooming) {

				if(_mainScrollPos.x !== _slideSize.x * _currPositionIndex) {
					// if main scroll position is shifted – direction is always horizontal
					_direction = 'h';
				} else {
					var diff = Math.abs(touchesList[0].x - _currPoint.x) - Math.abs(touchesList[0].y - _currPoint.y);
					// check the direction of movement
					if(Math.abs(diff) >= DIRECTION_CHECK_OFFSET) {
						_direction = diff > 0 ? 'h' : 'v';
						_currentPoints = touchesList;
					}
				}
				
			} else {
				_currentPoints = touchesList;
			}
		}	
	},
	// 
	_renderMovement =  function() {

		if(!_currentPoints) {
			return;
		}

		var numPoints = _currentPoints.length;

		if(numPoints === 0) {
			return;
		}

		_equalizePoints(p, _currentPoints[0]);

		delta.x = p.x - _currPoint.x;
		delta.y = p.y - _currPoint.y;

		if(_isZooming && numPoints > 1) {
			// Handle behaviour for more than 1 point

			_currPoint.x = p.x;
			_currPoint.y = p.y;
		
			// check if one of two points changed
			if( !delta.x && !delta.y && _isEqualPoints(_currentPoints[1], p2) ) {
				return;
			}

			_equalizePoints(p2, _currentPoints[1]);


			if(!_zoomStarted) {
				_zoomStarted = true;
				_shout('zoomGestureStarted');
			}
			
			// Distance between two points
			var pointsDistance = _calculatePointsDistance(p,p2);

			var zoomLevel = _calculateZoomLevel(pointsDistance);

			// slightly over the of initial zoom level
			if(zoomLevel > self.currItem.initialZoomLevel + self.currItem.initialZoomLevel / 15) {
				_wasOverInitialZoom = true;
			}

			// Apply the friction if zoom level is out of the bounds
			var zoomFriction = 1,
				minZoomLevel = _getMinZoomLevel(),
				maxZoomLevel = _getMaxZoomLevel();

			if ( zoomLevel < minZoomLevel ) {
				
				if(_options.pinchToClose && !_wasOverInitialZoom && _startZoomLevel <= self.currItem.initialZoomLevel) {
					// fade out background if zooming out
					var minusDiff = minZoomLevel - zoomLevel;
					var percent = 1 - minusDiff / (minZoomLevel / 1.2);

					_applyBgOpacity(percent);
					_shout('onPinchClose', percent);
					_opacityChanged = true;
				} else {
					zoomFriction = (minZoomLevel - zoomLevel) / minZoomLevel;
					if(zoomFriction > 1) {
						zoomFriction = 1;
					}
					zoomLevel = minZoomLevel - zoomFriction * (minZoomLevel / 3);
				}
				
			} else if ( zoomLevel > maxZoomLevel ) {
				// 1.5 - extra zoom level above the max. E.g. if max is x6, real max 6 + 1.5 = 7.5
				zoomFriction = (zoomLevel - maxZoomLevel) / ( minZoomLevel * 6 );
				if(zoomFriction > 1) {
					zoomFriction = 1;
				}
				zoomLevel = maxZoomLevel + zoomFriction * minZoomLevel;
			}

			if(zoomFriction < 0) {
				zoomFriction = 0;
			}

			// distance between touch points after friction is applied
			_currPointsDistance = pointsDistance;

			// _centerPoint - The point in the middle of two pointers
			_findCenterOfPoints(p, p2, _centerPoint);
		
			// paning with two pointers pressed
			_currPanDist.x += _centerPoint.x - _currCenterPoint.x;
			_currPanDist.y += _centerPoint.y - _currCenterPoint.y;
			_equalizePoints(_currCenterPoint, _centerPoint);

			_panOffset.x = _calculatePanOffset('x', zoomLevel);
			_panOffset.y = _calculatePanOffset('y', zoomLevel);

			_isZoomingIn = zoomLevel > _currZoomLevel;
			_currZoomLevel = zoomLevel;
			_applyCurrentZoomPan();

		} else {

			// handle behaviour for one point (dragging or panning)

			if(!_direction) {
				return;
			}

			if(_isFirstMove) {
				_isFirstMove = false;

				// subtract drag distance that was used during the detection direction  

				if( Math.abs(delta.x) >= DIRECTION_CHECK_OFFSET) {
					delta.x -= _currentPoints[0].x - _startPoint.x;
				}
				
				if( Math.abs(delta.y) >= DIRECTION_CHECK_OFFSET) {
					delta.y -= _currentPoints[0].y - _startPoint.y;
				}
			}

			_currPoint.x = p.x;
			_currPoint.y = p.y;

			// do nothing if pointers position hasn't changed
			if(delta.x === 0 && delta.y === 0) {
				return;
			}

			if(_direction === 'v' && _options.closeOnVerticalDrag) {
				if(!_canPan()) {
					_currPanDist.y += delta.y;
					_panOffset.y += delta.y;

					var opacityRatio = _calculateVerticalDragOpacityRatio();

					_verticalDragInitiated = true;
					_shout('onVerticalDrag', opacityRatio);

					_applyBgOpacity(opacityRatio);
					_applyCurrentZoomPan();
					return ;
				}
			}

			_pushPosPoint(_getCurrentTime(), p.x, p.y);

			_moved = true;
			_currPanBounds = self.currItem.bounds;
			
			var mainScrollChanged = _panOrMoveMainScroll('x', delta);
			if(!mainScrollChanged) {
				_panOrMoveMainScroll('y', delta);

				_roundPoint(_panOffset);
				_applyCurrentZoomPan();
			}

		}

	},
	
	// Pointerup/pointercancel/touchend/touchcancel/mouseup event handler
	_onDragRelease = function(e) {

		if(_features.isOldAndroid ) {

			if(_oldAndroidTouchEndTimeout && e.type === 'mouseup') {
				return;
			}

			// on Android (v4.1, 4.2, 4.3 & possibly older) 
			// ghost mousedown/up event isn't preventable via e.preventDefault,
			// which causes fake mousedown event
			// so we block mousedown/up for 600ms
			if( e.type.indexOf('touch') > -1 ) {
				clearTimeout(_oldAndroidTouchEndTimeout);
				_oldAndroidTouchEndTimeout = setTimeout(function() {
					_oldAndroidTouchEndTimeout = 0;
				}, 600);
			}
			
		}

		_shout('pointerUp');

		if(_preventDefaultEventBehaviour(e, false)) {
			e.preventDefault();
		}

		var releasePoint;

		if(_pointerEventEnabled) {
			var pointerIndex = framework.arraySearch(_currPointers, e.pointerId, 'id');
			
			if(pointerIndex > -1) {
				releasePoint = _currPointers.splice(pointerIndex, 1)[0];

				if(navigator.pointerEnabled) {
					releasePoint.type = e.pointerType || 'mouse';
				} else {
					var MSPOINTER_TYPES = {
						4: 'mouse', // event.MSPOINTER_TYPE_MOUSE
						2: 'touch', // event.MSPOINTER_TYPE_TOUCH 
						3: 'pen' // event.MSPOINTER_TYPE_PEN
					};
					releasePoint.type = MSPOINTER_TYPES[e.pointerType];

					if(!releasePoint.type) {
						releasePoint.type = e.pointerType || 'mouse';
					}
				}

			}
		}

		var touchList = _getTouchPoints(e),
			gestureType,
			numPoints = touchList.length;

		if(e.type === 'mouseup') {
			numPoints = 0;
		}

		// Do nothing if there were 3 touch points or more
		if(numPoints === 2) {
			_currentPoints = null;
			return true;
		}

		// if second pointer released
		if(numPoints === 1) {
			_equalizePoints(_startPoint, touchList[0]);
		}				


		// pointer hasn't moved, send "tap release" point
		if(numPoints === 0 && !_direction && !_mainScrollAnimating) {
			if(!releasePoint) {
				if(e.type === 'mouseup') {
					releasePoint = {x: e.pageX, y: e.pageY, type:'mouse'};
				} else if(e.changedTouches && e.changedTouches[0]) {
					releasePoint = {x: e.changedTouches[0].pageX, y: e.changedTouches[0].pageY, type:'touch'};
				}		
			}

			_shout('touchRelease', e, releasePoint);
		}

		// Difference in time between releasing of two last touch points (zoom gesture)
		var releaseTimeDiff = -1;

		// Gesture completed, no pointers left
		if(numPoints === 0) {
			_isDragging = false;
			framework.unbind(window, _upMoveEvents, self);

			_stopDragUpdateLoop();

			if(_isZooming) {
				// Two points released at the same time
				releaseTimeDiff = 0;
			} else if(_lastReleaseTime !== -1) {
				releaseTimeDiff = _getCurrentTime() - _lastReleaseTime;
			}
		}
		_lastReleaseTime = numPoints === 1 ? _getCurrentTime() : -1;
		
		if(releaseTimeDiff !== -1 && releaseTimeDiff < 150) {
			gestureType = 'zoom';
		} else {
			gestureType = 'swipe';
		}

		if(_isZooming && numPoints < 2) {
			_isZooming = false;

			// Only second point released
			if(numPoints === 1) {
				gestureType = 'zoomPointerUp';
			}
			_shout('zoomGestureEnded');
		}

		_currentPoints = null;
		if(!_moved && !_zoomStarted && !_mainScrollAnimating && !_verticalDragInitiated) {
			// nothing to animate
			return;
		}
	
		_stopAllAnimations();

		
		if(!_releaseAnimData) {
			_releaseAnimData = _initDragReleaseAnimationData();
		}
		
		_releaseAnimData.calculateSwipeSpeed('x');


		if(_verticalDragInitiated) {

			var opacityRatio = _calculateVerticalDragOpacityRatio();

			if(opacityRatio < _options.verticalDragRange) {
				self.close();
			} else {
				var initalPanY = _panOffset.y,
					initialBgOpacity = _bgOpacity;

				_animateProp('verticalDrag', 0, 1, 300, framework.easing.cubic.out, function(now) {
					
					_panOffset.y = (self.currItem.initialPosition.y - initalPanY) * now + initalPanY;

					_applyBgOpacity(  (1 - initialBgOpacity) * now + initialBgOpacity );
					_applyCurrentZoomPan();
				});

				_shout('onVerticalDrag', 1);
			}

			return;
		}


		// main scroll 
		if(  (_mainScrollShifted || _mainScrollAnimating) && numPoints === 0) {
			var itemChanged = _finishSwipeMainScrollGesture(gestureType, _releaseAnimData);
			if(itemChanged) {
				return;
			}
			gestureType = 'zoomPointerUp';
		}

		// prevent zoom/pan animation when main scroll animation runs
		if(_mainScrollAnimating) {
			return;
		}
		
		// Complete simple zoom gesture (reset zoom level if it's out of the bounds)  
		if(gestureType !== 'swipe') {
			_completeZoomGesture();
			return;
		}
	
		// Complete pan gesture if main scroll is not shifted, and it's possible to pan current image
		if(!_mainScrollShifted && _currZoomLevel > self.currItem.fitRatio) {
			_completePanGesture(_releaseAnimData);
		}
	},


	// Returns object with data about gesture
	// It's created only once and then reused
	_initDragReleaseAnimationData  = function() {
		// temp local vars
		var lastFlickDuration,
			tempReleasePos;

		// s = this
		var s = {
			lastFlickOffset: {},
			lastFlickDist: {},
			lastFlickSpeed: {},
			slowDownRatio:  {},
			slowDownRatioReverse:  {},
			speedDecelerationRatio:  {},
			speedDecelerationRatioAbs:  {},
			distanceOffset:  {},
			backAnimDestination: {},
			backAnimStarted: {},
			calculateSwipeSpeed: function(axis) {
				

				if( _posPoints.length > 1) {
					lastFlickDuration = _getCurrentTime() - _gestureCheckSpeedTime + 50;
					tempReleasePos = _posPoints[_posPoints.length-2][axis];
				} else {
					lastFlickDuration = _getCurrentTime() - _gestureStartTime; // total gesture duration
					tempReleasePos = _startPoint[axis];
				}
				s.lastFlickOffset[axis] = _currPoint[axis] - tempReleasePos;
				s.lastFlickDist[axis] = Math.abs(s.lastFlickOffset[axis]);
				if(s.lastFlickDist[axis] > 20) {
					s.lastFlickSpeed[axis] = s.lastFlickOffset[axis] / lastFlickDuration;
				} else {
					s.lastFlickSpeed[axis] = 0;
				}
				if( Math.abs(s.lastFlickSpeed[axis]) < 0.1 ) {
					s.lastFlickSpeed[axis] = 0;
				}
				
				s.slowDownRatio[axis] = 0.95;
				s.slowDownRatioReverse[axis] = 1 - s.slowDownRatio[axis];
				s.speedDecelerationRatio[axis] = 1;
			},

			calculateOverBoundsAnimOffset: function(axis, speed) {
				if(!s.backAnimStarted[axis]) {

					if(_panOffset[axis] > _currPanBounds.min[axis]) {
						s.backAnimDestination[axis] = _currPanBounds.min[axis];
						
					} else if(_panOffset[axis] < _currPanBounds.max[axis]) {
						s.backAnimDestination[axis] = _currPanBounds.max[axis];
					}

					if(s.backAnimDestination[axis] !== undefined) {
						s.slowDownRatio[axis] = 0.7;
						s.slowDownRatioReverse[axis] = 1 - s.slowDownRatio[axis];
						if(s.speedDecelerationRatioAbs[axis] < 0.05) {

							s.lastFlickSpeed[axis] = 0;
							s.backAnimStarted[axis] = true;

							_animateProp('bounceZoomPan'+axis,_panOffset[axis], 
								s.backAnimDestination[axis], 
								speed || 300, 
								framework.easing.sine.out, 
								function(pos) {
									_panOffset[axis] = pos;
									_applyCurrentZoomPan();
								}
							);

						}
					}
				}
			},

			// Reduces the speed by slowDownRatio (per 10ms)
			calculateAnimOffset: function(axis) {
				if(!s.backAnimStarted[axis]) {
					s.speedDecelerationRatio[axis] = s.speedDecelerationRatio[axis] * (s.slowDownRatio[axis] + 
												s.slowDownRatioReverse[axis] - 
												s.slowDownRatioReverse[axis] * s.timeDiff / 10);

					s.speedDecelerationRatioAbs[axis] = Math.abs(s.lastFlickSpeed[axis] * s.speedDecelerationRatio[axis]);
					s.distanceOffset[axis] = s.lastFlickSpeed[axis] * s.speedDecelerationRatio[axis] * s.timeDiff;
					_panOffset[axis] += s.distanceOffset[axis];

				}
			},

			panAnimLoop: function() {
				if ( _animations.zoomPan ) {
					_animations.zoomPan.raf = _requestAF(s.panAnimLoop);

					s.now = _getCurrentTime();
					s.timeDiff = s.now - s.lastNow;
					s.lastNow = s.now;
					
					s.calculateAnimOffset('x');
					s.calculateAnimOffset('y');

					_applyCurrentZoomPan();
					
					s.calculateOverBoundsAnimOffset('x');
					s.calculateOverBoundsAnimOffset('y');


					if (s.speedDecelerationRatioAbs.x < 0.05 && s.speedDecelerationRatioAbs.y < 0.05) {

						// round pan position
						_panOffset.x = Math.round(_panOffset.x);
						_panOffset.y = Math.round(_panOffset.y);
						_applyCurrentZoomPan();
						
						_stopAnimation('zoomPan');
						return;
					}
				}

			}
		};
		return s;
	},

	_completePanGesture = function(animData) {
		// calculate swipe speed for Y axis (paanning)
		animData.calculateSwipeSpeed('y');

		_currPanBounds = self.currItem.bounds;
		
		animData.backAnimDestination = {};
		animData.backAnimStarted = {};

		// Avoid acceleration animation if speed is too low
		if(Math.abs(animData.lastFlickSpeed.x) <= 0.05 && Math.abs(animData.lastFlickSpeed.y) <= 0.05 ) {
			animData.speedDecelerationRatioAbs.x = animData.speedDecelerationRatioAbs.y = 0;

			// Run pan drag release animation. E.g. if you drag image and release finger without momentum.
			animData.calculateOverBoundsAnimOffset('x');
			animData.calculateOverBoundsAnimOffset('y');
			return true;
		}

		// Animation loop that controls the acceleration after pan gesture ends
		_registerStartAnimation('zoomPan');
		animData.lastNow = _getCurrentTime();
		animData.panAnimLoop();
	},


	_finishSwipeMainScrollGesture = function(gestureType, _releaseAnimData) {
		var itemChanged;
		if(!_mainScrollAnimating) {
			_currZoomedItemIndex = _currentItemIndex;
		}


		
		var itemsDiff;

		if(gestureType === 'swipe') {
			var totalShiftDist = _currPoint.x - _startPoint.x,
				isFastLastFlick = _releaseAnimData.lastFlickDist.x < 10;

			// if container is shifted for more than MIN_SWIPE_DISTANCE, 
			// and last flick gesture was in right direction
			if(totalShiftDist > MIN_SWIPE_DISTANCE && 
				(isFastLastFlick || _releaseAnimData.lastFlickOffset.x > 20) ) {
				// go to prev item
				itemsDiff = -1;
			} else if(totalShiftDist < -MIN_SWIPE_DISTANCE && 
				(isFastLastFlick || _releaseAnimData.lastFlickOffset.x < -20) ) {
				// go to next item
				itemsDiff = 1;
			}
		}

		var nextCircle;

		if(itemsDiff) {
			
			_currentItemIndex += itemsDiff;

			if(_currentItemIndex < 0) {
				_currentItemIndex = _options.loop ? _getNumItems()-1 : 0;
				nextCircle = true;
			} else if(_currentItemIndex >= _getNumItems()) {
				_currentItemIndex = _options.loop ? 0 : _getNumItems()-1;
				nextCircle = true;
			}

			if(!nextCircle || _options.loop) {
				_indexDiff += itemsDiff;
				_currPositionIndex -= itemsDiff;
				itemChanged = true;
			}
			

			
		}

		var animateToX = _slideSize.x * _currPositionIndex;
		var animateToDist = Math.abs( animateToX - _mainScrollPos.x );
		var finishAnimDuration;


		if(!itemChanged && animateToX > _mainScrollPos.x !== _releaseAnimData.lastFlickSpeed.x > 0) {
			// "return to current" duration, e.g. when dragging from slide 0 to -1
			finishAnimDuration = 333; 
		} else {
			finishAnimDuration = Math.abs(_releaseAnimData.lastFlickSpeed.x) > 0 ? 
									animateToDist / Math.abs(_releaseAnimData.lastFlickSpeed.x) : 
									333;

			finishAnimDuration = Math.min(finishAnimDuration, 400);
			finishAnimDuration = Math.max(finishAnimDuration, 250);
		}

		if(_currZoomedItemIndex === _currentItemIndex) {
			itemChanged = false;
		}
		
		_mainScrollAnimating = true;
		
		_shout('mainScrollAnimStart');

		_animateProp('mainScroll', _mainScrollPos.x, animateToX, finishAnimDuration, framework.easing.cubic.out, 
			_moveMainScroll,
			function() {
				_stopAllAnimations();
				_mainScrollAnimating = false;
				_currZoomedItemIndex = -1;
				
				if(itemChanged || _currZoomedItemIndex !== _currentItemIndex) {
					self.updateCurrItem();
				}
				
				_shout('mainScrollAnimComplete');
			}
		);

		if(itemChanged) {
			self.updateCurrItem(true);
		}

		return itemChanged;
	},

	_calculateZoomLevel = function(touchesDistance) {
		return  1 / _startPointsDistance * touchesDistance * _startZoomLevel;
	},

	// Resets zoom if it's out of bounds
	_completeZoomGesture = function() {
		var destZoomLevel = _currZoomLevel,
			minZoomLevel = _getMinZoomLevel(),
			maxZoomLevel = _getMaxZoomLevel();

		if ( _currZoomLevel < minZoomLevel ) {
			destZoomLevel = minZoomLevel;
		} else if ( _currZoomLevel > maxZoomLevel ) {
			destZoomLevel = maxZoomLevel;
		}

		var destOpacity = 1,
			onUpdate,
			initialOpacity = _bgOpacity;

		if(_opacityChanged && !_isZoomingIn && !_wasOverInitialZoom && _currZoomLevel < minZoomLevel) {
			//_closedByScroll = true;
			self.close();
			return true;
		}

		if(_opacityChanged) {
			onUpdate = function(now) {
				_applyBgOpacity(  (destOpacity - initialOpacity) * now + initialOpacity );
			};
		}

		self.zoomTo(destZoomLevel, 0, 200,  framework.easing.cubic.out, onUpdate);
		return true;
	};


_registerModule('Gestures', {
	publicMethods: {

		initGestures: function() {

			// helper function that builds touch/pointer/mouse events
			var addEventNames = function(pref, down, move, up, cancel) {
				_dragStartEvent = pref + down;
				_dragMoveEvent = pref + move;
				_dragEndEvent = pref + up;
				if(cancel) {
					_dragCancelEvent = pref + cancel;
				} else {
					_dragCancelEvent = '';
				}
			};

			_pointerEventEnabled = _features.pointerEvent;
			if(_pointerEventEnabled && _features.touch) {
				// we don't need touch events, if browser supports pointer events
				_features.touch = false;
			}

			if(_pointerEventEnabled) {
				if(navigator.pointerEnabled) {
					addEventNames('pointer', 'down', 'move', 'up', 'cancel');
				} else {
					// IE10 pointer events are case-sensitive
					addEventNames('MSPointer', 'Down', 'Move', 'Up', 'Cancel');
				}
			} else if(_features.touch) {
				addEventNames('touch', 'start', 'move', 'end', 'cancel');
				_likelyTouchDevice = true;
			} else {
				addEventNames('mouse', 'down', 'move', 'up');	
			}

			_upMoveEvents = _dragMoveEvent + ' ' + _dragEndEvent  + ' ' +  _dragCancelEvent;
			_downEvents = _dragStartEvent;

			if(_pointerEventEnabled && !_likelyTouchDevice) {
				_likelyTouchDevice = (navigator.maxTouchPoints > 1) || (navigator.msMaxTouchPoints > 1);
			}
			// make variable public
			self.likelyTouchDevice = _likelyTouchDevice; 
			
			_globalEventHandlers[_dragStartEvent] = _onDragStart;
			_globalEventHandlers[_dragMoveEvent] = _onDragMove;
			_globalEventHandlers[_dragEndEvent] = _onDragRelease; // the Kraken

			if(_dragCancelEvent) {
				_globalEventHandlers[_dragCancelEvent] = _globalEventHandlers[_dragEndEvent];
			}

			// Bind mouse events on device with detected hardware touch support, in case it supports multiple types of input.
			if(_features.touch) {
				_downEvents += ' mousedown';
				_upMoveEvents += ' mousemove mouseup';
				_globalEventHandlers.mousedown = _globalEventHandlers[_dragStartEvent];
				_globalEventHandlers.mousemove = _globalEventHandlers[_dragMoveEvent];
				_globalEventHandlers.mouseup = _globalEventHandlers[_dragEndEvent];
			}

			if(!_likelyTouchDevice) {
				// don't allow pan to next slide from zoomed state on Desktop
				_options.allowPanToNext = false;
			}
		}

	}
});


/*>>gestures*/

/*>>show-hide-transition*/
/**
 * show-hide-transition.js:
 *
 * Manages initial opening or closing transition.
 *
 * If you're not planning to use transition for gallery at all,
 * you may set options hideAnimationDuration and showAnimationDuration to 0,
 * and just delete startAnimation function.
 * 
 */


var _showOrHideTimeout,
	_showOrHide = function(item, img, out, completeFn) {

		if(_showOrHideTimeout) {
			clearTimeout(_showOrHideTimeout);
		}

		_initialZoomRunning = true;
		_initialContentSet = true;
		
		// dimensions of small thumbnail {x:,y:,w:}.
		// Height is optional, as calculated based on large image.
		var thumbBounds; 
		if(item.initialLayout) {
			thumbBounds = item.initialLayout;
			item.initialLayout = null;
		} else {
			thumbBounds = _options.getThumbBoundsFn && _options.getThumbBoundsFn(_currentItemIndex);
		}

		var duration = out ? _options.hideAnimationDuration : _options.showAnimationDuration;

		var onComplete = function() {
			_stopAnimation('initialZoom');
			if(!out) {
				_applyBgOpacity(1);
				if(img) {
					img.style.display = 'block';
				}
				framework.addClass(template, 'pswp--animated-in');
				_shout('initialZoom' + (out ? 'OutEnd' : 'InEnd'));
			} else {
				self.template.removeAttribute('style');
				self.bg.removeAttribute('style');
			}

			if(completeFn) {
				completeFn();
			}
			_initialZoomRunning = false;
		};

		// if bounds aren't provided, just open gallery without animation
		if(!duration || !thumbBounds || thumbBounds.x === undefined) {

			_shout('initialZoom' + (out ? 'Out' : 'In') );

			_currZoomLevel = item.initialZoomLevel;
			_equalizePoints(_panOffset,  item.initialPosition );
			_applyCurrentZoomPan();

			template.style.opacity = out ? 0 : 1;
			_applyBgOpacity(1);

			if(duration) {
				setTimeout(function() {
					onComplete();
				}, duration);
			} else {
				onComplete();
			}

			return;
		}

		var startAnimation = function() {
			var closeWithRaf = _closedByScroll,
				fadeEverything = !self.currItem.src || self.currItem.loadError || _options.showHideOpacity;
			
			// apply hw-acceleration to image
			if(item.miniImg) {
				item.miniImg.style.webkitBackfaceVisibility = 'hidden';
			}

			if(!out) {
				_currZoomLevel = thumbBounds.w / item.w;
				_panOffset.x = thumbBounds.x;
				_panOffset.y = thumbBounds.y - _initalWindowScrollY;

				self[fadeEverything ? 'template' : 'bg'].style.opacity = 0.001;
				_applyCurrentZoomPan();
			}

			_registerStartAnimation('initialZoom');
			
			if(out && !closeWithRaf) {
				framework.removeClass(template, 'pswp--animated-in');
			}

			if(fadeEverything) {
				if(out) {
					framework[ (closeWithRaf ? 'remove' : 'add') + 'Class' ](template, 'pswp--animate_opacity');
				} else {
					setTimeout(function() {
						framework.addClass(template, 'pswp--animate_opacity');
					}, 30);
				}
			}

			_showOrHideTimeout = setTimeout(function() {

				_shout('initialZoom' + (out ? 'Out' : 'In') );
				

				if(!out) {

					// "in" animation always uses CSS transitions (instead of rAF).
					// CSS transition work faster here, 
					// as developer may also want to animate other things, 
					// like ui on top of sliding area, which can be animated just via CSS
					
					_currZoomLevel = item.initialZoomLevel;
					_equalizePoints(_panOffset,  item.initialPosition );
					_applyCurrentZoomPan();
					_applyBgOpacity(1);

					if(fadeEverything) {
						template.style.opacity = 1;
					} else {
						_applyBgOpacity(1);
					}

					_showOrHideTimeout = setTimeout(onComplete, duration + 20);
				} else {

					// "out" animation uses rAF only when PhotoSwipe is closed by browser scroll, to recalculate position
					var destZoomLevel = thumbBounds.w / item.w,
						initialPanOffset = {
							x: _panOffset.x,
							y: _panOffset.y
						},
						initialZoomLevel = _currZoomLevel,
						initalBgOpacity = _bgOpacity,
						onUpdate = function(now) {
							
							if(now === 1) {
								_currZoomLevel = destZoomLevel;
								_panOffset.x = thumbBounds.x;
								_panOffset.y = thumbBounds.y  - _currentWindowScrollY;
							} else {
								_currZoomLevel = (destZoomLevel - initialZoomLevel) * now + initialZoomLevel;
								_panOffset.x = (thumbBounds.x - initialPanOffset.x) * now + initialPanOffset.x;
								_panOffset.y = (thumbBounds.y - _currentWindowScrollY - initialPanOffset.y) * now + initialPanOffset.y;
							}
							
							_applyCurrentZoomPan();
							if(fadeEverything) {
								template.style.opacity = 1 - now;
							} else {
								_applyBgOpacity( initalBgOpacity - now * initalBgOpacity );
							}
						};

					if(closeWithRaf) {
						_animateProp('initialZoom', 0, 1, duration, framework.easing.cubic.out, onUpdate, onComplete);
					} else {
						onUpdate(1);
						_showOrHideTimeout = setTimeout(onComplete, duration + 20);
					}
				}
			
			}, out ? 25 : 90); // Main purpose of this delay is to give browser time to paint and
					// create composite layers of PhotoSwipe UI parts (background, controls, caption, arrows).
					// Which avoids lag at the beginning of scale transition.
		};
		startAnimation();

		
	};

/*>>show-hide-transition*/

/*>>items-controller*/
/**
*
* Controller manages gallery items, their dimensions, and their content.
* 
*/

var _items,
	_tempPanAreaSize = {},
	_imagesToAppendPool = [],
	_initialContentSet,
	_initialZoomRunning,
	_controllerDefaultOptions = {
		index: 0,
		errorMsg: '<div class="pswp__error-msg"><a href="%url%" target="_blank">The image</a> could not be loaded.</div>',
		forceProgressiveLoading: false, // TODO
		preload: [1,1],
		getNumItemsFn: function() {
			return _items.length;
		}
	};


var _getItemAt,
	_getNumItems,
	_initialIsLoop,
	_getZeroBounds = function() {
		return {
			center:{x:0,y:0}, 
			max:{x:0,y:0}, 
			min:{x:0,y:0}
		};
	},
	_calculateSingleItemPanBounds = function(item, realPanElementW, realPanElementH ) {
		var bounds = item.bounds;

		// position of element when it's centered
		bounds.center.x = Math.round((_tempPanAreaSize.x - realPanElementW) / 2);
		bounds.center.y = Math.round((_tempPanAreaSize.y - realPanElementH) / 2) + item.vGap.top;

		// maximum pan position
		bounds.max.x = (realPanElementW > _tempPanAreaSize.x) ? 
							Math.round(_tempPanAreaSize.x - realPanElementW) : 
							bounds.center.x;
		
		bounds.max.y = (realPanElementH > _tempPanAreaSize.y) ? 
							Math.round(_tempPanAreaSize.y - realPanElementH) + item.vGap.top : 
							bounds.center.y;
		
		// minimum pan position
		bounds.min.x = (realPanElementW > _tempPanAreaSize.x) ? 0 : bounds.center.x;
		bounds.min.y = (realPanElementH > _tempPanAreaSize.y) ? item.vGap.top : bounds.center.y;
	},
	_calculateItemSize = function(item, viewportSize, zoomLevel) {

		if (item.src && !item.loadError) {
			var isInitial = !zoomLevel;
			
			if(isInitial) {
				if(!item.vGap) {
					item.vGap = {top:0,bottom:0};
				}
				// allows overriding vertical margin for individual items
				_shout('parseVerticalMargin', item);
			}


			_tempPanAreaSize.x = viewportSize.x;
			_tempPanAreaSize.y = viewportSize.y - item.vGap.top - item.vGap.bottom;

			if (isInitial) {
				var hRatio = _tempPanAreaSize.x / item.w;
				var vRatio = _tempPanAreaSize.y / item.h;

				item.fitRatio = hRatio < vRatio ? hRatio : vRatio;
				//item.fillRatio = hRatio > vRatio ? hRatio : vRatio;

				var scaleMode = _options.scaleMode;

				if (scaleMode === 'orig') {
					zoomLevel = 1;
				} else if (scaleMode === 'fit') {
					zoomLevel = item.fitRatio;
				}

				if (zoomLevel > 1) {
					zoomLevel = 1;
				}

				item.initialZoomLevel = zoomLevel;
				
				if(!item.bounds) {
					// reuse bounds object
					item.bounds = _getZeroBounds(); 
				}
			}

			if(!zoomLevel) {
				return;
			}

			_calculateSingleItemPanBounds(item, item.w * zoomLevel, item.h * zoomLevel);

			if (isInitial && zoomLevel === item.initialZoomLevel) {
				item.initialPosition = item.bounds.center;
			}

			return item.bounds;
		} else {
			item.w = item.h = 0;
			item.initialZoomLevel = item.fitRatio = 1;
			item.bounds = _getZeroBounds();
			item.initialPosition = item.bounds.center;

			// if it's not image, we return zero bounds (content is not zoomable)
			return item.bounds;
		}
		
	},

	


	_appendImage = function(index, item, baseDiv, img, preventAnimation, keepPlaceholder) {
		

		if(item.loadError) {
			return;
		}

		if(img) {

			item.imageAppended = true;
			_setImageSize(item, img, (item === self.currItem && _renderMaxResolution) );
			
			baseDiv.appendChild(img);

			if(keepPlaceholder) {
				setTimeout(function() {
					if(item && item.loaded && item.placeholder) {
						item.placeholder.style.display = 'none';
						item.placeholder = null;
					}
				}, 500);
			}
		}
	},
	


	_preloadImage = function(item) {
		item.loading = true;
		item.loaded = false;
		var img = item.img = framework.createEl('pswp__img', 'img');
		var onComplete = function() {
			item.loading = false;
			item.loaded = true;

			if(item.loadComplete) {
				item.loadComplete(item);
			} else {
				item.img = null; // no need to store image object
			}
			img.onload = img.onerror = null;
			img = null;
		};
		img.onload = onComplete;
		img.onerror = function() {
			item.loadError = true;
			onComplete();
		};		

		img.src = item.src;// + '?a=' + Math.random();

		return img;
	},
	_checkForError = function(item, cleanUp) {
		if(item.src && item.loadError && item.container) {

			if(cleanUp) {
				item.container.innerHTML = '';
			}

			item.container.innerHTML = _options.errorMsg.replace('%url%',  item.src );
			return true;
			
		}
	},
	_setImageSize = function(item, img, maxRes) {
		if(!item.src) {
			return;
		}

		if(!img) {
			img = item.container.lastChild;
		}

		var w = maxRes ? item.w : Math.round(item.w * item.fitRatio),
			h = maxRes ? item.h : Math.round(item.h * item.fitRatio);
		
		if(item.placeholder && !item.loaded) {
			item.placeholder.style.width = w + 'px';
			item.placeholder.style.height = h + 'px';
		}

		img.style.width = w + 'px';
		img.style.height = h + 'px';
	},
	_appendImagesPool = function() {

		if(_imagesToAppendPool.length) {
			var poolItem;

			for(var i = 0; i < _imagesToAppendPool.length; i++) {
				poolItem = _imagesToAppendPool[i];
				if( poolItem.holder.index === poolItem.index ) {
					_appendImage(poolItem.index, poolItem.item, poolItem.baseDiv, poolItem.img, false, poolItem.clearPlaceholder);
				}
			}
			_imagesToAppendPool = [];
		}
	};
	


_registerModule('Controller', {

	publicMethods: {

		lazyLoadItem: function(index) {
			index = _getLoopedId(index);
			var item = _getItemAt(index);

			if(!item || ((item.loaded || item.loading) && !_itemsNeedUpdate)) {
				return;
			}

			_shout('gettingData', index, item);

			if (!item.src) {
				return;
			}

			_preloadImage(item);
		},
		initController: function() {
			framework.extend(_options, _controllerDefaultOptions, true);
			self.items = _items = items;
			_getItemAt = self.getItemAt;
			_getNumItems = _options.getNumItemsFn; //self.getNumItems;



			_initialIsLoop = _options.loop;
			if(_getNumItems() < 3) {
				_options.loop = false; // disable loop if less then 3 items
			}

			_listen('beforeChange', function(diff) {

				var p = _options.preload,
					isNext = diff === null ? true : (diff >= 0),
					preloadBefore = Math.min(p[0], _getNumItems() ),
					preloadAfter = Math.min(p[1], _getNumItems() ),
					i;


				for(i = 1; i <= (isNext ? preloadAfter : preloadBefore); i++) {
					self.lazyLoadItem(_currentItemIndex+i);
				}
				for(i = 1; i <= (isNext ? preloadBefore : preloadAfter); i++) {
					self.lazyLoadItem(_currentItemIndex-i);
				}
			});

			_listen('initialLayout', function() {
				self.currItem.initialLayout = _options.getThumbBoundsFn && _options.getThumbBoundsFn(_currentItemIndex);
			});

			_listen('mainScrollAnimComplete', _appendImagesPool);
			_listen('initialZoomInEnd', _appendImagesPool);



			_listen('destroy', function() {
				var item;
				for(var i = 0; i < _items.length; i++) {
					item = _items[i];
					// remove reference to DOM elements, for GC
					if(item.container) {
						item.container = null; 
					}
					if(item.placeholder) {
						item.placeholder = null;
					}
					if(item.img) {
						item.img = null;
					}
					if(item.preloader) {
						item.preloader = null;
					}
					if(item.loadError) {
						item.loaded = item.loadError = false;
					}
				}
				_imagesToAppendPool = null;
			});
		},


		getItemAt: function(index) {
			if (index >= 0) {
				return _items[index] !== undefined ? _items[index] : false;
			}
			return false;
		},

		allowProgressiveImg: function() {
			// 1. Progressive image loading isn't working on webkit/blink 
			//    when hw-acceleration (e.g. translateZ) is applied to IMG element.
			//    That's why in PhotoSwipe parent element gets zoom transform, not image itself.
			//    
			// 2. Progressive image loading sometimes blinks in webkit/blink when applying animation to parent element.
			//    That's why it's disabled on touch devices (mainly because of swipe transition)
			//    
			// 3. Progressive image loading sometimes doesn't work in IE (up to 11).

			// Don't allow progressive loading on non-large touch devices
			return _options.forceProgressiveLoading || !_likelyTouchDevice || _options.mouseUsed || screen.width > 1200; 
			// 1200 - to eliminate touch devices with large screen (like Chromebook Pixel)
		},

		setContent: function(holder, index) {

			if(_options.loop) {
				index = _getLoopedId(index);
			}

			var prevItem = self.getItemAt(holder.index);
			if(prevItem) {
				prevItem.container = null;
			}
	
			var item = self.getItemAt(index),
				img;
			
			if(!item) {
				holder.el.innerHTML = '';
				return;
			}

			// allow to override data
			_shout('gettingData', index, item);

			holder.index = index;
			holder.item = item;

			// base container DIV is created only once for each of 3 holders
			var baseDiv = item.container = framework.createEl('pswp__zoom-wrap'); 

			

			if(!item.src && item.html) {
				if(item.html.tagName) {
					baseDiv.appendChild(item.html);
				} else {
					baseDiv.innerHTML = item.html;
				}
			}

			_checkForError(item);

			_calculateItemSize(item, _viewportSize);
			
			if(item.src && !item.loadError && !item.loaded) {

				item.loadComplete = function(item) {

					// gallery closed before image finished loading
					if(!_isOpen) {
						return;
					}

					// check if holder hasn't changed while image was loading
					if(holder && holder.index === index ) {
						if( _checkForError(item, true) ) {
							item.loadComplete = item.img = null;
							_calculateItemSize(item, _viewportSize);
							_applyZoomPanToItem(item);

							if(holder.index === _currentItemIndex) {
								// recalculate dimensions
								self.updateCurrZoomItem();
							}
							return;
						}
						if( !item.imageAppended ) {
							if(_features.transform && (_mainScrollAnimating || _initialZoomRunning) ) {
								_imagesToAppendPool.push({
									item:item,
									baseDiv:baseDiv,
									img:item.img,
									index:index,
									holder:holder,
									clearPlaceholder:true
								});
							} else {
								_appendImage(index, item, baseDiv, item.img, _mainScrollAnimating || _initialZoomRunning, true);
							}
						} else {
							// remove preloader & mini-img
							if(!_initialZoomRunning && item.placeholder) {
								item.placeholder.style.display = 'none';
								item.placeholder = null;
							}
						}
					}

					item.loadComplete = null;
					item.img = null; // no need to store image element after it's added

					_shout('imageLoadComplete', index, item);
				};

				if(framework.features.transform) {
					
					var placeholderClassName = 'pswp__img pswp__img--placeholder'; 
					placeholderClassName += (item.msrc ? '' : ' pswp__img--placeholder--blank');

					var placeholder = framework.createEl(placeholderClassName, item.msrc ? 'img' : '');
					if(item.msrc) {
						placeholder.src = item.msrc;
					}
					
					_setImageSize(item, placeholder);

					baseDiv.appendChild(placeholder);
					item.placeholder = placeholder;

				}
				

				

				if(!item.loading) {
					_preloadImage(item);
				}


				if( self.allowProgressiveImg() ) {
					// just append image
					if(!_initialContentSet && _features.transform) {
						_imagesToAppendPool.push({
							item:item, 
							baseDiv:baseDiv, 
							img:item.img, 
							index:index, 
							holder:holder
						});
					} else {
						_appendImage(index, item, baseDiv, item.img, true, true);
					}
				}
				
			} else if(item.src && !item.loadError) {
				// image object is created every time, due to bugs of image loading & delay when switching images
				img = framework.createEl('pswp__img', 'img');
				img.style.opacity = 1;
				img.src = item.src;
				_setImageSize(item, img);
				_appendImage(index, item, baseDiv, img, true);
			}
			

			if(!_initialContentSet && index === _currentItemIndex) {
				_currZoomElementStyle = baseDiv.style;
				_showOrHide(item, (img ||item.img) );
			} else {
				_applyZoomPanToItem(item);
			}

			holder.el.innerHTML = '';
			holder.el.appendChild(baseDiv);
		},

		cleanSlide: function( item ) {
			if(item.img ) {
				item.img.onload = item.img.onerror = null;
			}
			item.loaded = item.loading = item.img = item.imageAppended = false;
		}

	}
});

/*>>items-controller*/

/*>>tap*/
/**
 * tap.js:
 *
 * Displatches tap and double-tap events.
 * 
 */

var tapTimer,
	tapReleasePoint = {},
	_dispatchTapEvent = function(origEvent, releasePoint, pointerType) {		
		var e = document.createEvent( 'CustomEvent' ),
			eDetail = {
				origEvent:origEvent, 
				target:origEvent.target, 
				releasePoint: releasePoint, 
				pointerType:pointerType || 'touch'
			};

		e.initCustomEvent( 'pswpTap', true, true, eDetail );
		origEvent.target.dispatchEvent(e);
	};

_registerModule('Tap', {
	publicMethods: {
		initTap: function() {
			_listen('firstTouchStart', self.onTapStart);
			_listen('touchRelease', self.onTapRelease);
			_listen('destroy', function() {
				tapReleasePoint = {};
				tapTimer = null;
			});
		},
		onTapStart: function(touchList) {
			if(touchList.length > 1) {
				clearTimeout(tapTimer);
				tapTimer = null;
			}
		},
		onTapRelease: function(e, releasePoint) {
			if(!releasePoint) {
				return;
			}

			if(!_moved && !_isMultitouch && !_numAnimations) {
				var p0 = releasePoint;
				if(tapTimer) {
					clearTimeout(tapTimer);
					tapTimer = null;

					// Check if taped on the same place
					if ( _isNearbyPoints(p0, tapReleasePoint) ) {
						_shout('doubleTap', p0);
						return;
					}
				}

				if(releasePoint.type === 'mouse') {
					_dispatchTapEvent(e, releasePoint, 'mouse');
					return;
				}

				var clickedTagName = e.target.tagName.toUpperCase();
				// avoid double tap delay on buttons and elements that have class pswp__single-tap
				if(clickedTagName === 'BUTTON' || framework.hasClass(e.target, 'pswp__single-tap') ) {
					_dispatchTapEvent(e, releasePoint);
					return;
				}

				_equalizePoints(tapReleasePoint, p0);

				tapTimer = setTimeout(function() {
					_dispatchTapEvent(e, releasePoint);
					tapTimer = null;
				}, 300);
			}
		}
	}
});

/*>>tap*/

/*>>desktop-zoom*/
/**
 *
 * desktop-zoom.js:
 *
 * - Binds mousewheel event for paning zoomed image.
 * - Manages "dragging", "zoomed-in", "zoom-out" classes.
 *   (which are used for cursors and zoom icon)
 * - Adds toggleDesktopZoom function.
 * 
 */

var _wheelDelta;
	
_registerModule('DesktopZoom', {

	publicMethods: {

		initDesktopZoom: function() {

			if(_oldIE) {
				// no zoom for old IE (<=8)
				return;
			}

			if(_likelyTouchDevice) {
				// if detected hardware touch support, we wait until mouse is used,
				// and only then apply desktop-zoom features
				_listen('mouseUsed', function() {
					self.setupDesktopZoom();
				});
			} else {
				self.setupDesktopZoom(true);
			}

		},

		setupDesktopZoom: function(onInit) {

			_wheelDelta = {};

			var events = 'wheel mousewheel DOMMouseScroll';
			
			_listen('bindEvents', function() {
				framework.bind(template, events,  self.handleMouseWheel);
			});

			_listen('unbindEvents', function() {
				if(_wheelDelta) {
					framework.unbind(template, events, self.handleMouseWheel);
				}
			});

			self.mouseZoomedIn = false;

			var hasDraggingClass,
				updateZoomable = function() {
					if(self.mouseZoomedIn) {
						framework.removeClass(template, 'pswp--zoomed-in');
						self.mouseZoomedIn = false;
					}
					if(_currZoomLevel < 1) {
						framework.addClass(template, 'pswp--zoom-allowed');
					} else {
						framework.removeClass(template, 'pswp--zoom-allowed');
					}
					removeDraggingClass();
				},
				removeDraggingClass = function() {
					if(hasDraggingClass) {
						framework.removeClass(template, 'pswp--dragging');
						hasDraggingClass = false;
					}
				};

			_listen('resize' , updateZoomable);
			_listen('afterChange' , updateZoomable);
			_listen('pointerDown', function() {
				if(self.mouseZoomedIn) {
					hasDraggingClass = true;
					framework.addClass(template, 'pswp--dragging');
				}
			});
			_listen('pointerUp', removeDraggingClass);

			if(!onInit) {
				updateZoomable();
			}
			
		},

		handleMouseWheel: function(e) {

			if(_currZoomLevel <= self.currItem.fitRatio) {
				if( _options.modal ) {

					if (!_options.closeOnScroll || _numAnimations || _isDragging) {
						e.preventDefault();
					} else if(_transformKey && Math.abs(e.deltaY) > 2) {
						// close PhotoSwipe
						// if browser supports transforms & scroll changed enough
						_closedByScroll = true;
						self.close();
					}

				}
				return true;
			}

			// allow just one event to fire
			e.stopPropagation();

			// https://developer.mozilla.org/en-US/docs/Web/Events/wheel
			_wheelDelta.x = 0;

			if('deltaX' in e) {
				if(e.deltaMode === 1 /* DOM_DELTA_LINE */) {
					// 18 - average line height
					_wheelDelta.x = e.deltaX * 18;
					_wheelDelta.y = e.deltaY * 18;
				} else {
					_wheelDelta.x = e.deltaX;
					_wheelDelta.y = e.deltaY;
				}
			} else if('wheelDelta' in e) {
				if(e.wheelDeltaX) {
					_wheelDelta.x = -0.16 * e.wheelDeltaX;
				}
				if(e.wheelDeltaY) {
					_wheelDelta.y = -0.16 * e.wheelDeltaY;
				} else {
					_wheelDelta.y = -0.16 * e.wheelDelta;
				}
			} else if('detail' in e) {
				_wheelDelta.y = e.detail;
			} else {
				return;
			}

			_calculatePanBounds(_currZoomLevel, true);

			var newPanX = _panOffset.x - _wheelDelta.x,
				newPanY = _panOffset.y - _wheelDelta.y;

			// only prevent scrolling in nonmodal mode when not at edges
			if (_options.modal ||
				(
				newPanX <= _currPanBounds.min.x && newPanX >= _currPanBounds.max.x &&
				newPanY <= _currPanBounds.min.y && newPanY >= _currPanBounds.max.y
				) ) {
				e.preventDefault();
			}

			// TODO: use rAF instead of mousewheel?
			self.panTo(newPanX, newPanY);
		},

		toggleDesktopZoom: function(centerPoint) {
			centerPoint = centerPoint || {x:_viewportSize.x/2 + _offset.x, y:_viewportSize.y/2 + _offset.y };

			var doubleTapZoomLevel = _options.getDoubleTapZoom(true, self.currItem);
			var zoomOut = _currZoomLevel === doubleTapZoomLevel;
			
			self.mouseZoomedIn = !zoomOut;

			self.zoomTo(zoomOut ? self.currItem.initialZoomLevel : doubleTapZoomLevel, centerPoint, 333);
			framework[ (!zoomOut ? 'add' : 'remove') + 'Class'](template, 'pswp--zoomed-in');
		}

	}
});


/*>>desktop-zoom*/

/*>>history*/
/**
 *
 * history.js:
 *
 * - Back button to close gallery.
 * 
 * - Unique URL for each slide: example.com/&pid=1&gid=3
 *   (where PID is picture index, and GID and gallery index)
 *   
 * - Switch URL when slides change.
 * 
 */


var _historyDefaultOptions = {
	history: true,
	galleryUID: 1
};

var _historyUpdateTimeout,
	_hashChangeTimeout,
	_hashAnimCheckTimeout,
	_hashChangedByScript,
	_hashChangedByHistory,
	_hashReseted,
	_initialHash,
	_historyChanged,
	_closedFromURL,
	_urlChangedOnce,
	_windowLoc,

	_supportsPushState,

	_getHash = function() {
		return _windowLoc.hash.substring(1);
	},
	_cleanHistoryTimeouts = function() {

		if(_historyUpdateTimeout) {
			clearTimeout(_historyUpdateTimeout);
		}

		if(_hashAnimCheckTimeout) {
			clearTimeout(_hashAnimCheckTimeout);
		}
	},

	// pid - Picture index
	// gid - Gallery index
	_parseItemIndexFromURL = function() {
		var hash = _getHash(),
			params = {};

		if(hash.length < 5) { // pid=1
			return params;
		}

		var i, vars = hash.split('&');
		for (i = 0; i < vars.length; i++) {
			if(!vars[i]) {
				continue;
			}
			var pair = vars[i].split('=');	
			if(pair.length < 2) {
				continue;
			}
			params[pair[0]] = pair[1];
		}
		if(_options.galleryPIDs) {
			// detect custom pid in hash and search for it among the items collection
			var searchfor = params.pid;
			params.pid = 0; // if custom pid cannot be found, fallback to the first item
			for(i = 0; i < _items.length; i++) {
				if(_items[i].pid === searchfor) {
					params.pid = i;
					break;
				}
			}
		} else {
			params.pid = parseInt(params.pid,10)-1;
		}
		if( params.pid < 0 ) {
			params.pid = 0;
		}
		return params;
	},
	_updateHash = function() {

		if(_hashAnimCheckTimeout) {
			clearTimeout(_hashAnimCheckTimeout);
		}


		if(_numAnimations || _isDragging) {
			// changing browser URL forces layout/paint in some browsers, which causes noticable lag during animation
			// that's why we update hash only when no animations running
			_hashAnimCheckTimeout = setTimeout(_updateHash, 500);
			return;
		}
		
		if(_hashChangedByScript) {
			clearTimeout(_hashChangeTimeout);
		} else {
			_hashChangedByScript = true;
		}


		var pid = (_currentItemIndex + 1);
		var item = _getItemAt( _currentItemIndex );
		if(item.hasOwnProperty('pid')) {
			// carry forward any custom pid assigned to the item
			pid = item.pid;
		}
		var newHash = _initialHash + '&'  +  'gid=' + _options.galleryUID + '&' + 'pid=' + pid;

		if(!_historyChanged) {
			if(_windowLoc.hash.indexOf(newHash) === -1) {
				_urlChangedOnce = true;
			}
			// first time - add new hisory record, then just replace
		}

		var newURL = _windowLoc.href.split('#')[0] + '#' +  newHash;

		if( _supportsPushState ) {

			if('#' + newHash !== window.location.hash) {
				history[_historyChanged ? 'replaceState' : 'pushState']('', document.title, newURL);
			}

		} else {
			if(_historyChanged) {
				_windowLoc.replace( newURL );
			} else {
				_windowLoc.hash = newHash;
			}
		}
		
		

		_historyChanged = true;
		_hashChangeTimeout = setTimeout(function() {
			_hashChangedByScript = false;
		}, 60);
	};



	

_registerModule('History', {

	

	publicMethods: {
		initHistory: function() {

			framework.extend(_options, _historyDefaultOptions, true);

			if( !_options.history ) {
				return;
			}


			_windowLoc = window.location;
			_urlChangedOnce = false;
			_closedFromURL = false;
			_historyChanged = false;
			_initialHash = _getHash();
			_supportsPushState = ('pushState' in history);


			if(_initialHash.indexOf('gid=') > -1) {
				_initialHash = _initialHash.split('&gid=')[0];
				_initialHash = _initialHash.split('?gid=')[0];
			}
			

			_listen('afterChange', self.updateURL);
			_listen('unbindEvents', function() {
				framework.unbind(window, 'hashchange', self.onHashChange);
			});


			var returnToOriginal = function() {
				_hashReseted = true;
				if(!_closedFromURL) {

					if(_urlChangedOnce) {
						history.back();
					} else {

						if(_initialHash) {
							_windowLoc.hash = _initialHash;
						} else {
							if (_supportsPushState) {

								// remove hash from url without refreshing it or scrolling to top
								history.pushState('', document.title,  _windowLoc.pathname + _windowLoc.search );
							} else {
								_windowLoc.hash = '';
							}
						}
					}
					
				}

				_cleanHistoryTimeouts();
			};


			_listen('unbindEvents', function() {
				if(_closedByScroll) {
					// if PhotoSwipe is closed by scroll, we go "back" before the closing animation starts
					// this is done to keep the scroll position
					returnToOriginal();
				}
			});
			_listen('destroy', function() {
				if(!_hashReseted) {
					returnToOriginal();
				}
			});
			_listen('firstUpdate', function() {
				_currentItemIndex = _parseItemIndexFromURL().pid;
			});

			

			
			var index = _initialHash.indexOf('pid=');
			if(index > -1) {
				_initialHash = _initialHash.substring(0, index);
				if(_initialHash.slice(-1) === '&') {
					_initialHash = _initialHash.slice(0, -1);
				}
			}
			

			setTimeout(function() {
				if(_isOpen) { // hasn't destroyed yet
					framework.bind(window, 'hashchange', self.onHashChange);
				}
			}, 40);
			
		},
		onHashChange: function() {

			if(_getHash() === _initialHash) {

				_closedFromURL = true;
				self.close();
				return;
			}
			if(!_hashChangedByScript) {

				_hashChangedByHistory = true;
				self.goTo( _parseItemIndexFromURL().pid );
				_hashChangedByHistory = false;
			}
			
		},
		updateURL: function() {

			// Delay the update of URL, to avoid lag during transition, 
			// and to not to trigger actions like "refresh page sound" or "blinking favicon" to often
			
			_cleanHistoryTimeouts();
			

			if(_hashChangedByHistory) {
				return;
			}

			if(!_historyChanged) {
				_updateHash(); // first time
			} else {
				_historyUpdateTimeout = setTimeout(_updateHash, 800);
			}
		}
	
	}
});


/*>>history*/
	framework.extend(self, publicMethods); };
	return PhotoSwipe;
});
},{}],15:[function(require,module,exports){
/*! PhotoSwipe Default UI - 4.1.2 - 2017-04-05
* http://photoswipe.com
* Copyright (c) 2017 Dmitry Semenov; */
/**
*
* UI on top of main sliding area (caption, arrows, close button, etc.).
* Built just using public methods/properties of PhotoSwipe.
* 
*/
(function (root, factory) { 
	if (typeof define === 'function' && define.amd) {
		define(factory);
	} else if (typeof exports === 'object') {
		module.exports = factory();
	} else {
		root.PhotoSwipeUI_Default = factory();
	}
})(this, function () {

	'use strict';



var PhotoSwipeUI_Default =
 function(pswp, framework) {

	var ui = this;
	var _overlayUIUpdated = false,
		_controlsVisible = true,
		_fullscrenAPI,
		_controls,
		_captionContainer,
		_fakeCaptionContainer,
		_indexIndicator,
		_shareButton,
		_shareModal,
		_shareModalHidden = true,
		_initalCloseOnScrollValue,
		_isIdle,
		_listen,

		_loadingIndicator,
		_loadingIndicatorHidden,
		_loadingIndicatorTimeout,

		_galleryHasOneSlide,

		_options,
		_defaultUIOptions = {
			barsSize: {top:44, bottom:'auto'},
			closeElClasses: ['item', 'caption', 'zoom-wrap', 'ui', 'top-bar'], 
			timeToIdle: 4000, 
			timeToIdleOutside: 1000,
			loadingIndicatorDelay: 1000, // 2s
			
			addCaptionHTMLFn: function(item, captionEl /*, isFake */) {
				if(!item.title) {
					captionEl.children[0].innerHTML = '';
					return false;
				}
				captionEl.children[0].innerHTML = item.title;
				return true;
			},

			closeEl:true,
			captionEl: true,
			fullscreenEl: true,
			zoomEl: true,
			shareEl: true,
			counterEl: true,
			arrowEl: true,
			preloaderEl: true,

			tapToClose: false,
			tapToToggleControls: true,

			clickToCloseNonZoomable: true,

			shareButtons: [
				{id:'facebook', label:'Share on Facebook', url:'https://www.facebook.com/sharer/sharer.php?u={{url}}'},
				{id:'twitter', label:'Tweet', url:'https://twitter.com/intent/tweet?text={{text}}&url={{url}}'},
				{id:'pinterest', label:'Pin it', url:'http://www.pinterest.com/pin/create/button/'+
													'?url={{url}}&media={{image_url}}&description={{text}}'},
				{id:'download', label:'Download image', url:'{{raw_image_url}}', download:true}
			],
			getImageURLForShare: function( /* shareButtonData */ ) {
				return pswp.currItem.src || '';
			},
			getPageURLForShare: function( /* shareButtonData */ ) {
				return window.location.href;
			},
			getTextForShare: function( /* shareButtonData */ ) {
				return pswp.currItem.title || '';
			},
				
			indexIndicatorSep: ' / ',
			fitControlsWidth: 1200

		},
		_blockControlsTap,
		_blockControlsTapTimeout;



	var _onControlsTap = function(e) {
			if(_blockControlsTap) {
				return true;
			}


			e = e || window.event;

			if(_options.timeToIdle && _options.mouseUsed && !_isIdle) {
				// reset idle timer
				_onIdleMouseMove();
			}


			var target = e.target || e.srcElement,
				uiElement,
				clickedClass = target.getAttribute('class') || '',
				found;

			for(var i = 0; i < _uiElements.length; i++) {
				uiElement = _uiElements[i];
				if(uiElement.onTap && clickedClass.indexOf('pswp__' + uiElement.name ) > -1 ) {
					uiElement.onTap();
					found = true;

				}
			}

			if(found) {
				if(e.stopPropagation) {
					e.stopPropagation();
				}
				_blockControlsTap = true;

				// Some versions of Android don't prevent ghost click event 
				// when preventDefault() was called on touchstart and/or touchend.
				// 
				// This happens on v4.3, 4.2, 4.1, 
				// older versions strangely work correctly, 
				// but just in case we add delay on all of them)	
				var tapDelay = framework.features.isOldAndroid ? 600 : 30;
				_blockControlsTapTimeout = setTimeout(function() {
					_blockControlsTap = false;
				}, tapDelay);
			}

		},
		_fitControlsInViewport = function() {
			return !pswp.likelyTouchDevice || _options.mouseUsed || screen.width > _options.fitControlsWidth;
		},
		_togglePswpClass = function(el, cName, add) {
			framework[ (add ? 'add' : 'remove') + 'Class' ](el, 'pswp__' + cName);
		},

		// add class when there is just one item in the gallery
		// (by default it hides left/right arrows and 1ofX counter)
		_countNumItems = function() {
			var hasOneSlide = (_options.getNumItemsFn() === 1);

			if(hasOneSlide !== _galleryHasOneSlide) {
				_togglePswpClass(_controls, 'ui--one-slide', hasOneSlide);
				_galleryHasOneSlide = hasOneSlide;
			}
		},
		_toggleShareModalClass = function() {
			_togglePswpClass(_shareModal, 'share-modal--hidden', _shareModalHidden);
		},
		_toggleShareModal = function() {

			_shareModalHidden = !_shareModalHidden;
			
			
			if(!_shareModalHidden) {
				_toggleShareModalClass();
				setTimeout(function() {
					if(!_shareModalHidden) {
						framework.addClass(_shareModal, 'pswp__share-modal--fade-in');
					}
				}, 30);
			} else {
				framework.removeClass(_shareModal, 'pswp__share-modal--fade-in');
				setTimeout(function() {
					if(_shareModalHidden) {
						_toggleShareModalClass();
					}
				}, 300);
			}
			
			if(!_shareModalHidden) {
				_updateShareURLs();
			}
			return false;
		},

		_openWindowPopup = function(e) {
			e = e || window.event;
			var target = e.target || e.srcElement;

			pswp.shout('shareLinkClick', e, target);

			if(!target.href) {
				return false;
			}

			if( target.hasAttribute('download') ) {
				return true;
			}

			window.open(target.href, 'pswp_share', 'scrollbars=yes,resizable=yes,toolbar=no,'+
										'location=yes,width=550,height=420,top=100,left=' + 
										(window.screen ? Math.round(screen.width / 2 - 275) : 100)  );

			if(!_shareModalHidden) {
				_toggleShareModal();
			}
			
			return false;
		},
		_updateShareURLs = function() {
			var shareButtonOut = '',
				shareButtonData,
				shareURL,
				image_url,
				page_url,
				share_text;

			for(var i = 0; i < _options.shareButtons.length; i++) {
				shareButtonData = _options.shareButtons[i];

				image_url = _options.getImageURLForShare(shareButtonData);
				page_url = _options.getPageURLForShare(shareButtonData);
				share_text = _options.getTextForShare(shareButtonData);

				shareURL = shareButtonData.url.replace('{{url}}', encodeURIComponent(page_url) )
									.replace('{{image_url}}', encodeURIComponent(image_url) )
									.replace('{{raw_image_url}}', image_url )
									.replace('{{text}}', encodeURIComponent(share_text) );

				shareButtonOut += '<a href="' + shareURL + '" target="_blank" '+
									'class="pswp__share--' + shareButtonData.id + '"' +
									(shareButtonData.download ? 'download' : '') + '>' + 
									shareButtonData.label + '</a>';

				if(_options.parseShareButtonOut) {
					shareButtonOut = _options.parseShareButtonOut(shareButtonData, shareButtonOut);
				}
			}
			_shareModal.children[0].innerHTML = shareButtonOut;
			_shareModal.children[0].onclick = _openWindowPopup;

		},
		_hasCloseClass = function(target) {
			for(var  i = 0; i < _options.closeElClasses.length; i++) {
				if( framework.hasClass(target, 'pswp__' + _options.closeElClasses[i]) ) {
					return true;
				}
			}
		},
		_idleInterval,
		_idleTimer,
		_idleIncrement = 0,
		_onIdleMouseMove = function() {
			clearTimeout(_idleTimer);
			_idleIncrement = 0;
			if(_isIdle) {
				ui.setIdle(false);
			}
		},
		_onMouseLeaveWindow = function(e) {
			e = e ? e : window.event;
			var from = e.relatedTarget || e.toElement;
			if (!from || from.nodeName === 'HTML') {
				clearTimeout(_idleTimer);
				_idleTimer = setTimeout(function() {
					ui.setIdle(true);
				}, _options.timeToIdleOutside);
			}
		},
		_setupFullscreenAPI = function() {
			if(_options.fullscreenEl && !framework.features.isOldAndroid) {
				if(!_fullscrenAPI) {
					_fullscrenAPI = ui.getFullscreenAPI();
				}
				if(_fullscrenAPI) {
					framework.bind(document, _fullscrenAPI.eventK, ui.updateFullscreen);
					ui.updateFullscreen();
					framework.addClass(pswp.template, 'pswp--supports-fs');
				} else {
					framework.removeClass(pswp.template, 'pswp--supports-fs');
				}
			}
		},
		_setupLoadingIndicator = function() {
			// Setup loading indicator
			if(_options.preloaderEl) {
			
				_toggleLoadingIndicator(true);

				_listen('beforeChange', function() {

					clearTimeout(_loadingIndicatorTimeout);

					// display loading indicator with delay
					_loadingIndicatorTimeout = setTimeout(function() {

						if(pswp.currItem && pswp.currItem.loading) {

							if( !pswp.allowProgressiveImg() || (pswp.currItem.img && !pswp.currItem.img.naturalWidth)  ) {
								// show preloader if progressive loading is not enabled, 
								// or image width is not defined yet (because of slow connection)
								_toggleLoadingIndicator(false); 
								// items-controller.js function allowProgressiveImg
							}
							
						} else {
							_toggleLoadingIndicator(true); // hide preloader
						}

					}, _options.loadingIndicatorDelay);
					
				});
				_listen('imageLoadComplete', function(index, item) {
					if(pswp.currItem === item) {
						_toggleLoadingIndicator(true);
					}
				});

			}
		},
		_toggleLoadingIndicator = function(hide) {
			if( _loadingIndicatorHidden !== hide ) {
				_togglePswpClass(_loadingIndicator, 'preloader--active', !hide);
				_loadingIndicatorHidden = hide;
			}
		},
		_applyNavBarGaps = function(item) {
			var gap = item.vGap;

			if( _fitControlsInViewport() ) {
				
				var bars = _options.barsSize; 
				if(_options.captionEl && bars.bottom === 'auto') {
					if(!_fakeCaptionContainer) {
						_fakeCaptionContainer = framework.createEl('pswp__caption pswp__caption--fake');
						_fakeCaptionContainer.appendChild( framework.createEl('pswp__caption__center') );
						_controls.insertBefore(_fakeCaptionContainer, _captionContainer);
						framework.addClass(_controls, 'pswp__ui--fit');
					}
					if( _options.addCaptionHTMLFn(item, _fakeCaptionContainer, true) ) {

						var captionSize = _fakeCaptionContainer.clientHeight;
						gap.bottom = parseInt(captionSize,10) || 44;
					} else {
						gap.bottom = bars.top; // if no caption, set size of bottom gap to size of top
					}
				} else {
					gap.bottom = bars.bottom === 'auto' ? 0 : bars.bottom;
				}
				
				// height of top bar is static, no need to calculate it
				gap.top = bars.top;
			} else {
				gap.top = gap.bottom = 0;
			}
		},
		_setupIdle = function() {
			// Hide controls when mouse is used
			if(_options.timeToIdle) {
				_listen('mouseUsed', function() {
					
					framework.bind(document, 'mousemove', _onIdleMouseMove);
					framework.bind(document, 'mouseout', _onMouseLeaveWindow);

					_idleInterval = setInterval(function() {
						_idleIncrement++;
						if(_idleIncrement === 2) {
							ui.setIdle(true);
						}
					}, _options.timeToIdle / 2);
				});
			}
		},
		_setupHidingControlsDuringGestures = function() {

			// Hide controls on vertical drag
			_listen('onVerticalDrag', function(now) {
				if(_controlsVisible && now < 0.95) {
					ui.hideControls();
				} else if(!_controlsVisible && now >= 0.95) {
					ui.showControls();
				}
			});

			// Hide controls when pinching to close
			var pinchControlsHidden;
			_listen('onPinchClose' , function(now) {
				if(_controlsVisible && now < 0.9) {
					ui.hideControls();
					pinchControlsHidden = true;
				} else if(pinchControlsHidden && !_controlsVisible && now > 0.9) {
					ui.showControls();
				}
			});

			_listen('zoomGestureEnded', function() {
				pinchControlsHidden = false;
				if(pinchControlsHidden && !_controlsVisible) {
					ui.showControls();
				}
			});

		};



	var _uiElements = [
		{ 
			name: 'caption', 
			option: 'captionEl',
			onInit: function(el) {  
				_captionContainer = el; 
			} 
		},
		{ 
			name: 'share-modal', 
			option: 'shareEl',
			onInit: function(el) {  
				_shareModal = el;
			},
			onTap: function() {
				_toggleShareModal();
			} 
		},
		{ 
			name: 'button--share', 
			option: 'shareEl',
			onInit: function(el) { 
				_shareButton = el;
			},
			onTap: function() {
				_toggleShareModal();
			} 
		},
		{ 
			name: 'button--zoom', 
			option: 'zoomEl',
			onTap: pswp.toggleDesktopZoom
		},
		{ 
			name: 'counter', 
			option: 'counterEl',
			onInit: function(el) {  
				_indexIndicator = el;
			} 
		},
		{ 
			name: 'button--close', 
			option: 'closeEl',
			onTap: pswp.close
		},
		{ 
			name: 'button--arrow--left', 
			option: 'arrowEl',
			onTap: pswp.prev
		},
		{ 
			name: 'button--arrow--right', 
			option: 'arrowEl',
			onTap: pswp.next
		},
		{ 
			name: 'button--fs', 
			option: 'fullscreenEl',
			onTap: function() {  
				if(_fullscrenAPI.isFullscreen()) {
					_fullscrenAPI.exit();
				} else {
					_fullscrenAPI.enter();
				}
			} 
		},
		{ 
			name: 'preloader', 
			option: 'preloaderEl',
			onInit: function(el) {  
				_loadingIndicator = el;
			} 
		}

	];

	var _setupUIElements = function() {
		var item,
			classAttr,
			uiElement;

		var loopThroughChildElements = function(sChildren) {
			if(!sChildren) {
				return;
			}

			var l = sChildren.length;
			for(var i = 0; i < l; i++) {
				item = sChildren[i];
				classAttr = item.className;

				for(var a = 0; a < _uiElements.length; a++) {
					uiElement = _uiElements[a];

					if(classAttr.indexOf('pswp__' + uiElement.name) > -1  ) {

						if( _options[uiElement.option] ) { // if element is not disabled from options
							
							framework.removeClass(item, 'pswp__element--disabled');
							if(uiElement.onInit) {
								uiElement.onInit(item);
							}
							
							//item.style.display = 'block';
						} else {
							framework.addClass(item, 'pswp__element--disabled');
							//item.style.display = 'none';
						}
					}
				}
			}
		};
		loopThroughChildElements(_controls.children);

		var topBar =  framework.getChildByClass(_controls, 'pswp__top-bar');
		if(topBar) {
			loopThroughChildElements( topBar.children );
		}
	};


	

	ui.init = function() {

		// extend options
		framework.extend(pswp.options, _defaultUIOptions, true);

		// create local link for fast access
		_options = pswp.options;

		// find pswp__ui element
		_controls = framework.getChildByClass(pswp.scrollWrap, 'pswp__ui');

		// create local link
		_listen = pswp.listen;


		_setupHidingControlsDuringGestures();

		// update controls when slides change
		_listen('beforeChange', ui.update);

		// toggle zoom on double-tap
		_listen('doubleTap', function(point) {
			var initialZoomLevel = pswp.currItem.initialZoomLevel;
			if(pswp.getZoomLevel() !== initialZoomLevel) {
				pswp.zoomTo(initialZoomLevel, point, 333);
			} else {
				pswp.zoomTo(_options.getDoubleTapZoom(false, pswp.currItem), point, 333);
			}
		});

		// Allow text selection in caption
		_listen('preventDragEvent', function(e, isDown, preventObj) {
			var t = e.target || e.srcElement;
			if(
				t && 
				t.getAttribute('class') && e.type.indexOf('mouse') > -1 && 
				( t.getAttribute('class').indexOf('__caption') > 0 || (/(SMALL|STRONG|EM)/i).test(t.tagName) ) 
			) {
				preventObj.prevent = false;
			}
		});

		// bind events for UI
		_listen('bindEvents', function() {
			framework.bind(_controls, 'pswpTap click', _onControlsTap);
			framework.bind(pswp.scrollWrap, 'pswpTap', ui.onGlobalTap);

			if(!pswp.likelyTouchDevice) {
				framework.bind(pswp.scrollWrap, 'mouseover', ui.onMouseOver);
			}
		});

		// unbind events for UI
		_listen('unbindEvents', function() {
			if(!_shareModalHidden) {
				_toggleShareModal();
			}

			if(_idleInterval) {
				clearInterval(_idleInterval);
			}
			framework.unbind(document, 'mouseout', _onMouseLeaveWindow);
			framework.unbind(document, 'mousemove', _onIdleMouseMove);
			framework.unbind(_controls, 'pswpTap click', _onControlsTap);
			framework.unbind(pswp.scrollWrap, 'pswpTap', ui.onGlobalTap);
			framework.unbind(pswp.scrollWrap, 'mouseover', ui.onMouseOver);

			if(_fullscrenAPI) {
				framework.unbind(document, _fullscrenAPI.eventK, ui.updateFullscreen);
				if(_fullscrenAPI.isFullscreen()) {
					_options.hideAnimationDuration = 0;
					_fullscrenAPI.exit();
				}
				_fullscrenAPI = null;
			}
		});


		// clean up things when gallery is destroyed
		_listen('destroy', function() {
			if(_options.captionEl) {
				if(_fakeCaptionContainer) {
					_controls.removeChild(_fakeCaptionContainer);
				}
				framework.removeClass(_captionContainer, 'pswp__caption--empty');
			}

			if(_shareModal) {
				_shareModal.children[0].onclick = null;
			}
			framework.removeClass(_controls, 'pswp__ui--over-close');
			framework.addClass( _controls, 'pswp__ui--hidden');
			ui.setIdle(false);
		});
		

		if(!_options.showAnimationDuration) {
			framework.removeClass( _controls, 'pswp__ui--hidden');
		}
		_listen('initialZoomIn', function() {
			if(_options.showAnimationDuration) {
				framework.removeClass( _controls, 'pswp__ui--hidden');
			}
		});
		_listen('initialZoomOut', function() {
			framework.addClass( _controls, 'pswp__ui--hidden');
		});

		_listen('parseVerticalMargin', _applyNavBarGaps);
		
		_setupUIElements();

		if(_options.shareEl && _shareButton && _shareModal) {
			_shareModalHidden = true;
		}

		_countNumItems();

		_setupIdle();

		_setupFullscreenAPI();

		_setupLoadingIndicator();
	};

	ui.setIdle = function(isIdle) {
		_isIdle = isIdle;
		_togglePswpClass(_controls, 'ui--idle', isIdle);
	};

	ui.update = function() {
		// Don't update UI if it's hidden
		if(_controlsVisible && pswp.currItem) {
			
			ui.updateIndexIndicator();

			if(_options.captionEl) {
				_options.addCaptionHTMLFn(pswp.currItem, _captionContainer);

				_togglePswpClass(_captionContainer, 'caption--empty', !pswp.currItem.title);
			}

			_overlayUIUpdated = true;

		} else {
			_overlayUIUpdated = false;
		}

		if(!_shareModalHidden) {
			_toggleShareModal();
		}

		_countNumItems();
	};

	ui.updateFullscreen = function(e) {

		if(e) {
			// some browsers change window scroll position during the fullscreen
			// so PhotoSwipe updates it just in case
			setTimeout(function() {
				pswp.setScrollOffset( 0, framework.getScrollY() );
			}, 50);
		}
		
		// toogle pswp--fs class on root element
		framework[ (_fullscrenAPI.isFullscreen() ? 'add' : 'remove') + 'Class' ](pswp.template, 'pswp--fs');
	};

	ui.updateIndexIndicator = function() {
		if(_options.counterEl) {
			_indexIndicator.innerHTML = (pswp.getCurrentIndex()+1) + 
										_options.indexIndicatorSep + 
										_options.getNumItemsFn();
		}
	};
	
	ui.onGlobalTap = function(e) {
		e = e || window.event;
		var target = e.target || e.srcElement;

		if(_blockControlsTap) {
			return;
		}

		if(e.detail && e.detail.pointerType === 'mouse') {

			// close gallery if clicked outside of the image
			if(_hasCloseClass(target)) {
				pswp.close();
				return;
			}

			if(framework.hasClass(target, 'pswp__img')) {
				if(pswp.getZoomLevel() === 1 && pswp.getZoomLevel() <= pswp.currItem.fitRatio) {
					if(_options.clickToCloseNonZoomable) {
						pswp.close();
					}
				} else {
					pswp.toggleDesktopZoom(e.detail.releasePoint);
				}
			}
			
		} else {

			// tap anywhere (except buttons) to toggle visibility of controls
			if(_options.tapToToggleControls) {
				if(_controlsVisible) {
					ui.hideControls();
				} else {
					ui.showControls();
				}
			}

			// tap to close gallery
			if(_options.tapToClose && (framework.hasClass(target, 'pswp__img') || _hasCloseClass(target)) ) {
				pswp.close();
				return;
			}
			
		}
	};
	ui.onMouseOver = function(e) {
		e = e || window.event;
		var target = e.target || e.srcElement;

		// add class when mouse is over an element that should close the gallery
		_togglePswpClass(_controls, 'ui--over-close', _hasCloseClass(target));
	};

	ui.hideControls = function() {
		framework.addClass(_controls,'pswp__ui--hidden');
		_controlsVisible = false;
	};

	ui.showControls = function() {
		_controlsVisible = true;
		if(!_overlayUIUpdated) {
			ui.update();
		}
		framework.removeClass(_controls,'pswp__ui--hidden');
	};

	ui.supportsFullscreen = function() {
		var d = document;
		return !!(d.exitFullscreen || d.mozCancelFullScreen || d.webkitExitFullscreen || d.msExitFullscreen);
	};

	ui.getFullscreenAPI = function() {
		var dE = document.documentElement,
			api,
			tF = 'fullscreenchange';

		if (dE.requestFullscreen) {
			api = {
				enterK: 'requestFullscreen',
				exitK: 'exitFullscreen',
				elementK: 'fullscreenElement',
				eventK: tF
			};

		} else if(dE.mozRequestFullScreen ) {
			api = {
				enterK: 'mozRequestFullScreen',
				exitK: 'mozCancelFullScreen',
				elementK: 'mozFullScreenElement',
				eventK: 'moz' + tF
			};

			

		} else if(dE.webkitRequestFullscreen) {
			api = {
				enterK: 'webkitRequestFullscreen',
				exitK: 'webkitExitFullscreen',
				elementK: 'webkitFullscreenElement',
				eventK: 'webkit' + tF
			};

		} else if(dE.msRequestFullscreen) {
			api = {
				enterK: 'msRequestFullscreen',
				exitK: 'msExitFullscreen',
				elementK: 'msFullscreenElement',
				eventK: 'MSFullscreenChange'
			};
		}

		if(api) {
			api.enter = function() { 
				// disable close-on-scroll in fullscreen
				_initalCloseOnScrollValue = _options.closeOnScroll; 
				_options.closeOnScroll = false; 

				if(this.enterK === 'webkitRequestFullscreen') {
					pswp.template[this.enterK]( Element.ALLOW_KEYBOARD_INPUT );
				} else {
					return pswp.template[this.enterK](); 
				}
			};
			api.exit = function() { 
				_options.closeOnScroll = _initalCloseOnScrollValue;

				return document[this.exitK](); 

			};
			api.isFullscreen = function() { return document[this.elementK]; };
		}

		return api;
	};



};
return PhotoSwipeUI_Default;


});

},{}],13:[function(require,module,exports){
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 7);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /* globals jQuery */

exports.lory = lory;

var _detectPrefixes = __webpack_require__(3);

var _detectPrefixes2 = _interopRequireDefault(_detectPrefixes);

var _dispatchEvent = __webpack_require__(4);

var _dispatchEvent2 = _interopRequireDefault(_dispatchEvent);

var _defaults = __webpack_require__(2);

var _defaults2 = _interopRequireDefault(_defaults);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var slice = Array.prototype.slice;

function lory(slider, opts) {
    var position = void 0;
    var slidesWidth = void 0;
    var frameWidth = void 0;
    var slides = void 0;

    /**
     * slider DOM elements
     */
    var frame = void 0;
    var slideContainer = void 0;
    var prevCtrl = void 0;
    var nextCtrl = void 0;
    var prefixes = void 0;
    var transitionEndCallback = void 0;

    var index = 0;
    var options = {};

    /**
     * if object is jQuery convert to native DOM element
     */
    if (typeof jQuery !== 'undefined' && slider instanceof jQuery) {
        slider = slider[0];
    }

    /**
     * private
     * set active class to element which is the current slide
     */
    function setActiveElement(slides, currentIndex) {
        var _options = options,
            classNameActiveSlide = _options.classNameActiveSlide;


        slides.forEach(function (element, index) {
            if (element.classList.contains(classNameActiveSlide)) {
                element.classList.remove(classNameActiveSlide);
            }
        });

        slides[currentIndex].classList.add(classNameActiveSlide);
    }

    /**
     * private
     * setupInfinite: function to setup if infinite is set
     *
     * @param  {array} slideArray
     * @return {array} array of updated slideContainer elements
     */
    function setupInfinite(slideArray) {
        var _options2 = options,
            infinite = _options2.infinite;


        var front = slideArray.slice(0, infinite);
        var back = slideArray.slice(slideArray.length - infinite, slideArray.length);

        front.forEach(function (element) {
            var cloned = element.cloneNode(true);

            slideContainer.appendChild(cloned);
        });

        back.reverse().forEach(function (element) {
            var cloned = element.cloneNode(true);

            slideContainer.insertBefore(cloned, slideContainer.firstChild);
        });

        slideContainer.addEventListener(prefixes.transitionEnd, onTransitionEnd);

        return slice.call(slideContainer.children);
    }

    /**
     * [dispatchSliderEvent description]
     * @return {[type]} [description]
     */
    function dispatchSliderEvent(phase, type, detail) {
        (0, _dispatchEvent2.default)(slider, phase + '.lory.' + type, detail);
    }

    /**
     * translates to a given position in a given time in milliseconds
     *
     * @to        {number} number in pixels where to translate to
     * @duration  {number} time in milliseconds for the transistion
     * @ease      {string} easing css property
     */
    function translate(to, duration, ease) {
        var style = slideContainer && slideContainer.style;

        if (style) {
            style[prefixes.transition + 'TimingFunction'] = ease;
            style[prefixes.transition + 'Duration'] = duration + 'ms';

            if (prefixes.hasTranslate3d) {
                style[prefixes.transform] = 'translate3d(' + to + 'px, 0, 0)';
            } else {
                style[prefixes.transform] = 'translate(' + to + 'px, 0)';
            }
        }
    }

    /**
     * slidefunction called by prev, next & touchend
     *
     * determine nextIndex and slide to next postion
     * under restrictions of the defined options
     *
     * @direction  {boolean}
     */
    function slide(nextIndex, direction) {
        var _options3 = options,
            slideSpeed = _options3.slideSpeed,
            slidesToScroll = _options3.slidesToScroll,
            infinite = _options3.infinite,
            rewind = _options3.rewind,
            rewindSpeed = _options3.rewindSpeed,
            ease = _options3.ease,
            classNameActiveSlide = _options3.classNameActiveSlide;


        var duration = slideSpeed;

        var nextSlide = direction ? index + 1 : index - 1;
        var maxOffset = Math.round(slidesWidth - frameWidth);

        dispatchSliderEvent('before', 'slide', {
            index: index,
            nextSlide: nextSlide
        });

        /**
         * Reset control classes
         */
        if (prevCtrl) {
            prevCtrl.classList.remove('disabled');
        }
        if (nextCtrl) {
            nextCtrl.classList.remove('disabled');
        }

        if (typeof nextIndex !== 'number') {
            if (direction) {
                nextIndex = index + slidesToScroll;
            } else {
                nextIndex = index - slidesToScroll;
            }
        }

        nextIndex = Math.min(Math.max(nextIndex, 0), slides.length - 1);

        if (infinite && direction === undefined) {
            nextIndex += infinite;
        }

        var nextOffset = Math.min(Math.max(slides[nextIndex].offsetLeft * -1, maxOffset * -1), 0);

        if (rewind && Math.abs(position.x) === maxOffset && direction) {
            nextOffset = 0;
            nextIndex = 0;
            duration = rewindSpeed;
        }

        /**
         * translate to the nextOffset by a defined duration and ease function
         */
        translate(nextOffset, duration, ease);

        /**
         * update the position with the next position
         */
        position.x = nextOffset;

        /**
         * update the index with the nextIndex only if
         * the offset of the nextIndex is in the range of the maxOffset
         */
        if (slides[nextIndex].offsetLeft <= maxOffset) {
            index = nextIndex;
        }

        if (infinite && (nextIndex === slides.length - infinite || nextIndex === 0)) {
            if (direction) {
                index = infinite;
            }

            if (!direction) {
                index = slides.length - infinite * 2;
            }

            position.x = slides[index].offsetLeft * -1;

            transitionEndCallback = function transitionEndCallback() {
                translate(slides[index].offsetLeft * -1, 0, undefined);
            };
        }

        if (classNameActiveSlide) {
            setActiveElement(slice.call(slides), index);
        }

        /**
         * update classes for next and prev arrows
         * based on user settings
         */
        if (prevCtrl && !infinite && nextIndex === 0) {
            prevCtrl.classList.add('disabled');
        }

        if (nextCtrl && !infinite && !rewind && nextIndex + 1 === slides.length) {
            nextCtrl.classList.add('disabled');
        }

        dispatchSliderEvent('after', 'slide', {
            currentSlide: index
        });
    }

    /**
     * public
     * setup function
     */
    function setup() {
        dispatchSliderEvent('before', 'init');

        prefixes = (0, _detectPrefixes2.default)();
        options = _extends({}, _defaults2.default, opts);

        var _options4 = options,
            classNameFrame = _options4.classNameFrame,
            classNameSlideContainer = _options4.classNameSlideContainer,
            classNamePrevCtrl = _options4.classNamePrevCtrl,
            classNameNextCtrl = _options4.classNameNextCtrl,
            enableMouseEvents = _options4.enableMouseEvents,
            classNameActiveSlide = _options4.classNameActiveSlide;


        frame = slider.getElementsByClassName(classNameFrame)[0];
        slideContainer = frame.getElementsByClassName(classNameSlideContainer)[0];
        prevCtrl = slider.getElementsByClassName(classNamePrevCtrl)[0];
        nextCtrl = slider.getElementsByClassName(classNameNextCtrl)[0];

        position = {
            x: slideContainer.offsetLeft,
            y: slideContainer.offsetTop
        };

        if (options.infinite) {
            slides = setupInfinite(slice.call(slideContainer.children));
        } else {
            slides = slice.call(slideContainer.children);

            if (prevCtrl) {
                prevCtrl.classList.add('disabled');
            }

            if (nextCtrl && slides.length === 1 && !options.rewind) {
                nextCtrl.classList.add('disabled');
            }
        }

        reset();

        if (classNameActiveSlide) {
            setActiveElement(slides, index);
        }

        if (prevCtrl && nextCtrl) {
            prevCtrl.addEventListener('click', prev);
            nextCtrl.addEventListener('click', next);
        }

        frame.addEventListener('touchstart', onTouchstart);

        if (enableMouseEvents) {
            frame.addEventListener('mousedown', onTouchstart);
            frame.addEventListener('click', onClick);
        }

        options.window.addEventListener('resize', onResize);

        dispatchSliderEvent('after', 'init');
    }

    /**
     * public
     * reset function: called on resize
     */
    function reset() {
        var _options5 = options,
            infinite = _options5.infinite,
            ease = _options5.ease,
            rewindSpeed = _options5.rewindSpeed,
            rewindOnResize = _options5.rewindOnResize,
            classNameActiveSlide = _options5.classNameActiveSlide;


        slidesWidth = slideContainer.getBoundingClientRect().width || slideContainer.offsetWidth;
        frameWidth = frame.getBoundingClientRect().width || frame.offsetWidth;

        if (frameWidth === slidesWidth) {
            slidesWidth = slides.reduce(function (previousValue, slide) {
                return previousValue + slide.getBoundingClientRect().width || slide.offsetWidth;
            }, 0);
        }

        if (rewindOnResize) {
            index = 0;
        } else {
            ease = null;
            rewindSpeed = 0;
        }

        if (infinite) {
            translate(slides[index + infinite].offsetLeft * -1, 0, null);

            index = index + infinite;
            position.x = slides[index].offsetLeft * -1;
        } else {
            translate(slides[index].offsetLeft * -1, rewindSpeed, ease);
            position.x = slides[index].offsetLeft * -1;
        }

        if (classNameActiveSlide) {
            setActiveElement(slice.call(slides), index);
        }
    }

    /**
     * public
     * slideTo: called on clickhandler
     */
    function slideTo(index) {
        slide(index);
    }

    /**
     * public
     * returnIndex function: called on clickhandler
     */
    function returnIndex() {
        return index - options.infinite || 0;
    }

    /**
     * public
     * prev function: called on clickhandler
     */
    function prev() {
        slide(false, false);
    }

    /**
     * public
     * next function: called on clickhandler
     */
    function next() {
        slide(false, true);
    }

    /**
     * public
     * destroy function: called to gracefully destroy the lory instance
     */
    function destroy() {
        dispatchSliderEvent('before', 'destroy');

        // remove event listeners
        frame.removeEventListener(prefixes.transitionEnd, onTransitionEnd);
        frame.removeEventListener('touchstart', onTouchstart);
        frame.removeEventListener('touchmove', onTouchmove);
        frame.removeEventListener('touchend', onTouchend);
        frame.removeEventListener('mousemove', onTouchmove);
        frame.removeEventListener('mousedown', onTouchstart);
        frame.removeEventListener('mouseup', onTouchend);
        frame.removeEventListener('mouseleave', onTouchend);
        frame.removeEventListener('click', onClick);

        options.window.removeEventListener('resize', onResize);

        if (prevCtrl) {
            prevCtrl.removeEventListener('click', prev);
        }

        if (nextCtrl) {
            nextCtrl.removeEventListener('click', next);
        }

        // remove cloned slides if infinite is set
        if (options.infinite) {
            Array.apply(null, Array(options.infinite)).forEach(function () {
                slideContainer.removeChild(slideContainer.firstChild);
                slideContainer.removeChild(slideContainer.lastChild);
            });
        }

        dispatchSliderEvent('after', 'destroy');
    }

    // event handling

    var touchOffset = void 0;
    var delta = void 0;
    var isScrolling = void 0;

    function onTransitionEnd() {
        if (transitionEndCallback) {
            transitionEndCallback();

            transitionEndCallback = undefined;
        }
    }

    function onTouchstart(event) {
        var _options6 = options,
            enableMouseEvents = _options6.enableMouseEvents;

        var touches = event.touches ? event.touches[0] : event;

        if (enableMouseEvents) {
            frame.addEventListener('mousemove', onTouchmove);
            frame.addEventListener('mouseup', onTouchend);
            frame.addEventListener('mouseleave', onTouchend);
        }

        frame.addEventListener('touchmove', onTouchmove);
        frame.addEventListener('touchend', onTouchend);

        var pageX = touches.pageX,
            pageY = touches.pageY;


        touchOffset = {
            x: pageX,
            y: pageY,
            time: Date.now()
        };

        isScrolling = undefined;

        delta = {};

        dispatchSliderEvent('on', 'touchstart', {
            event: event
        });
    }

    function onTouchmove(event) {
        var touches = event.touches ? event.touches[0] : event;
        var pageX = touches.pageX,
            pageY = touches.pageY;


        delta = {
            x: pageX - touchOffset.x,
            y: pageY - touchOffset.y
        };

        if (typeof isScrolling === 'undefined') {
            isScrolling = !!(isScrolling || Math.abs(delta.x) < Math.abs(delta.y));
        }

        if (!isScrolling && touchOffset) {
            event.preventDefault();
            translate(position.x + delta.x, 0, null);
        }

        // may be
        dispatchSliderEvent('on', 'touchmove', {
            event: event
        });
    }

    function onTouchend(event) {
        /**
         * time between touchstart and touchend in milliseconds
         * @duration {number}
         */
        var duration = touchOffset ? Date.now() - touchOffset.time : undefined;

        /**
         * is valid if:
         *
         * -> swipe attempt time is over 300 ms
         * and
         * -> swipe distance is greater than 25px
         * or
         * -> swipe distance is more then a third of the swipe area
         *
         * @isValidSlide {Boolean}
         */
        var isValid = Number(duration) < 300 && Math.abs(delta.x) > 25 || Math.abs(delta.x) > frameWidth / 3;

        /**
         * is out of bounds if:
         *
         * -> index is 0 and delta x is greater than 0
         * or
         * -> index is the last slide and delta is smaller than 0
         *
         * @isOutOfBounds {Boolean}
         */
        var isOutOfBounds = !index && delta.x > 0 || index === slides.length - 1 && delta.x < 0;

        var direction = delta.x < 0;

        if (!isScrolling) {
            if (isValid && !isOutOfBounds) {
                slide(false, direction);
            } else {
                translate(position.x, options.snapBackSpeed);
            }
        }

        touchOffset = undefined;

        /**
         * remove eventlisteners after swipe attempt
         */
        frame.removeEventListener('touchmove', onTouchmove);
        frame.removeEventListener('touchend', onTouchend);
        frame.removeEventListener('mousemove', onTouchmove);
        frame.removeEventListener('mouseup', onTouchend);
        frame.removeEventListener('mouseleave', onTouchend);

        dispatchSliderEvent('on', 'touchend', {
            event: event
        });
    }

    function onClick(event) {
        if (delta.x) {
            event.preventDefault();
        }
    }

    function onResize(event) {
        reset();

        dispatchSliderEvent('on', 'resize', {
            event: event
        });
    }

    // trigger initial setup
    setup();

    // expose public api
    return {
        setup: setup,
        reset: reset,
        slideTo: slideTo,
        returnIndex: returnIndex,
        prev: prev,
        next: next,
        destroy: destroy
    };
}

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {
  /**
   * slides scrolled at once
   * @slidesToScroll {Number}
   */
  slidesToScroll: 1,

  /**
   * time in milliseconds for the animation of a valid slide attempt
   * @slideSpeed {Number}
   */
  slideSpeed: 300,

  /**
   * time in milliseconds for the animation of the rewind after the last slide
   * @rewindSpeed {Number}
   */
  rewindSpeed: 600,

  /**
   * time for the snapBack of the slider if the slide attempt was not valid
   * @snapBackSpeed {Number}
   */
  snapBackSpeed: 200,

  /**
   * Basic easing functions: https://developer.mozilla.org/de/docs/Web/CSS/transition-timing-function
   * cubic bezier easing functions: http://easings.net/de
   * @ease {String}
   */
  ease: 'ease',

  /**
   * if slider reached the last slide, with next click the slider goes back to the startindex.
   * use infinite or rewind, not both
   * @rewind {Boolean}
   */
  rewind: false,

  /**
   * number of visible slides or false
   * use infinite or rewind, not both
   * @infinite {number}
   */
  infinite: false,

  /**
   * class name for slider frame
   * @classNameFrame {string}
   */
  classNameFrame: 'js_frame',

  /**
   * class name for slides container
   * @classNameSlideContainer {string}
   */
  classNameSlideContainer: 'js_slides',

  /**
   * class name for slider prev control
   * @classNamePrevCtrl {string}
   */
  classNamePrevCtrl: 'js_prev',

  /**
   * class name for slider next control
   * @classNameNextCtrl {string}
   */
  classNameNextCtrl: 'js_next',

  /**
   * class name for current active slide
   * if emptyString then no class is set
   * @classNameActiveSlide {string}
   */
  classNameActiveSlide: 'active',

  /**
   * enables mouse events for swiping on desktop devices
   * @enableMouseEvents {boolean}
   */
  enableMouseEvents: false,

  /**
   * window instance
   * @window {object}
   */
  window: window,

  /**
   * If false, slides lory to the first slide on window resize.
   * @rewindOnResize {boolean}
   */
  rewindOnResize: true
};

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = detectPrefixes;
/**
 * Detecting prefixes for saving time and bytes
 */
function detectPrefixes() {
    var transform = void 0;
    var transition = void 0;
    var transitionEnd = void 0;
    var hasTranslate3d = void 0;

    (function () {
        var el = document.createElement('_');
        var style = el.style;

        var prop = void 0;

        if (style[prop = 'webkitTransition'] === '') {
            transitionEnd = 'webkitTransitionEnd';
            transition = prop;
        }

        if (style[prop = 'transition'] === '') {
            transitionEnd = 'transitionend';
            transition = prop;
        }

        if (style[prop = 'webkitTransform'] === '') {
            transform = prop;
        }

        if (style[prop = 'msTransform'] === '') {
            transform = prop;
        }

        if (style[prop = 'transform'] === '') {
            transform = prop;
        }

        document.body.insertBefore(el, null);
        style[transform] = 'translate3d(0, 0, 0)';
        hasTranslate3d = !!global.getComputedStyle(el).getPropertyValue(transform);
        document.body.removeChild(el);
    })();

    return {
        transform: transform,
        transition: transition,
        transitionEnd: transitionEnd,
        hasTranslate3d: hasTranslate3d
    };
}
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = dispatchEvent;

var _customEvent = __webpack_require__(5);

var _customEvent2 = _interopRequireDefault(_customEvent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * dispatch custom events
 *
 * @param  {element} el         slideshow element
 * @param  {string}  type       custom event name
 * @param  {object}  detail     custom detail information
 */
function dispatchEvent(target, type, detail) {
    var event = new _customEvent2.default(type, {
        bubbles: true,
        cancelable: true,
        detail: detail
    });

    target.dispatchEvent(event);
}

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {
var NativeCustomEvent = global.CustomEvent;

function useNative () {
  try {
    var p = new NativeCustomEvent('cat', { detail: { foo: 'bar' } });
    return  'cat' === p.type && 'bar' === p.detail.foo;
  } catch (e) {
  }
  return false;
}

/**
 * Cross-browser `CustomEvent` constructor.
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent.CustomEvent
 *
 * @public
 */

module.exports = useNative() ? NativeCustomEvent :

// IE >= 9
'undefined' !== typeof document && 'function' === typeof document.createEvent ? function CustomEvent (type, params) {
  var e = document.createEvent('CustomEvent');
  if (params) {
    e.initCustomEvent(type, params.bubbles, params.cancelable, params.detail);
  } else {
    e.initCustomEvent(type, false, false, void 0);
  }
  return e;
} :

// IE <= 8
function CustomEvent (type, params) {
  var e = document.createEventObject();
  e.type = type;
  if (params) {
    e.bubbles = Boolean(params.bubbles);
    e.cancelable = Boolean(params.cancelable);
    e.detail = params.detail;
  } else {
    e.bubbles = false;
    e.cancelable = false;
    e.detail = void 0;
  }
  return e;
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 6 */,
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(1);


/***/ })
/******/ ]);
});
},{}],12:[function(require,module,exports){
(function (global){
/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as the `TypeError` message for "Functions" methods. */
var FUNC_ERROR_TEXT = 'Expected a function';

/** Used as references for various `Number` constants. */
var NAN = 0 / 0;

/** `Object#toString` result references. */
var symbolTag = '[object Symbol]';

/** Used to match leading and trailing whitespace. */
var reTrim = /^\s+|\s+$/g;

/** Used to detect bad signed hexadecimal string values. */
var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

/** Used to detect binary string values. */
var reIsBinary = /^0b[01]+$/i;

/** Used to detect octal string values. */
var reIsOctal = /^0o[0-7]+$/i;

/** Built-in method references without a dependency on `root`. */
var freeParseInt = parseInt;

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max,
    nativeMin = Math.min;

/**
 * Gets the timestamp of the number of milliseconds that have elapsed since
 * the Unix epoch (1 January 1970 00:00:00 UTC).
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Date
 * @returns {number} Returns the timestamp.
 * @example
 *
 * _.defer(function(stamp) {
 *   console.log(_.now() - stamp);
 * }, _.now());
 * // => Logs the number of milliseconds it took for the deferred invocation.
 */
var now = function() {
  return root.Date.now();
};

/**
 * Creates a debounced function that delays invoking `func` until after `wait`
 * milliseconds have elapsed since the last time the debounced function was
 * invoked. The debounced function comes with a `cancel` method to cancel
 * delayed `func` invocations and a `flush` method to immediately invoke them.
 * Provide `options` to indicate whether `func` should be invoked on the
 * leading and/or trailing edge of the `wait` timeout. The `func` is invoked
 * with the last arguments provided to the debounced function. Subsequent
 * calls to the debounced function return the result of the last `func`
 * invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is
 * invoked on the trailing edge of the timeout only if the debounced function
 * is invoked more than once during the `wait` timeout.
 *
 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
 *
 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
 * for details over the differences between `_.debounce` and `_.throttle`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to debounce.
 * @param {number} [wait=0] The number of milliseconds to delay.
 * @param {Object} [options={}] The options object.
 * @param {boolean} [options.leading=false]
 *  Specify invoking on the leading edge of the timeout.
 * @param {number} [options.maxWait]
 *  The maximum time `func` is allowed to be delayed before it's invoked.
 * @param {boolean} [options.trailing=true]
 *  Specify invoking on the trailing edge of the timeout.
 * @returns {Function} Returns the new debounced function.
 * @example
 *
 * // Avoid costly calculations while the window size is in flux.
 * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
 *
 * // Invoke `sendMail` when clicked, debouncing subsequent calls.
 * jQuery(element).on('click', _.debounce(sendMail, 300, {
 *   'leading': true,
 *   'trailing': false
 * }));
 *
 * // Ensure `batchLog` is invoked once after 1 second of debounced calls.
 * var debounced = _.debounce(batchLog, 250, { 'maxWait': 1000 });
 * var source = new EventSource('/stream');
 * jQuery(source).on('message', debounced);
 *
 * // Cancel the trailing debounced invocation.
 * jQuery(window).on('popstate', debounced.cancel);
 */
function debounce(func, wait, options) {
  var lastArgs,
      lastThis,
      maxWait,
      result,
      timerId,
      lastCallTime,
      lastInvokeTime = 0,
      leading = false,
      maxing = false,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  wait = toNumber(wait) || 0;
  if (isObject(options)) {
    leading = !!options.leading;
    maxing = 'maxWait' in options;
    maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }

  function invokeFunc(time) {
    var args = lastArgs,
        thisArg = lastThis;

    lastArgs = lastThis = undefined;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  }

  function leadingEdge(time) {
    // Reset any `maxWait` timer.
    lastInvokeTime = time;
    // Start the timer for the trailing edge.
    timerId = setTimeout(timerExpired, wait);
    // Invoke the leading edge.
    return leading ? invokeFunc(time) : result;
  }

  function remainingWait(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime,
        result = wait - timeSinceLastCall;

    return maxing ? nativeMin(result, maxWait - timeSinceLastInvoke) : result;
  }

  function shouldInvoke(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime;

    // Either this is the first call, activity has stopped and we're at the
    // trailing edge, the system time has gone backwards and we're treating
    // it as the trailing edge, or we've hit the `maxWait` limit.
    return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
      (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
  }

  function timerExpired() {
    var time = now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    // Restart the timer.
    timerId = setTimeout(timerExpired, remainingWait(time));
  }

  function trailingEdge(time) {
    timerId = undefined;

    // Only invoke if we have `lastArgs` which means `func` has been
    // debounced at least once.
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = undefined;
    return result;
  }

  function cancel() {
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timerId = undefined;
  }

  function flush() {
    return timerId === undefined ? result : trailingEdge(now());
  }

  function debounced() {
    var time = now(),
        isInvoking = shouldInvoke(time);

    lastArgs = arguments;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timerId === undefined) {
        return leadingEdge(lastCallTime);
      }
      if (maxing) {
        // Handle invocations in a tight loop.
        timerId = setTimeout(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timerId === undefined) {
      timerId = setTimeout(timerExpired, wait);
    }
    return result;
  }
  debounced.cancel = cancel;
  debounced.flush = flush;
  return debounced;
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && objectToString.call(value) == symbolTag);
}

/**
 * Converts `value` to a number.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {number} Returns the number.
 * @example
 *
 * _.toNumber(3.2);
 * // => 3.2
 *
 * _.toNumber(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toNumber(Infinity);
 * // => Infinity
 *
 * _.toNumber('3.2');
 * // => 3.2
 */
function toNumber(value) {
  if (typeof value == 'number') {
    return value;
  }
  if (isSymbol(value)) {
    return NAN;
  }
  if (isObject(value)) {
    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
    value = isObject(other) ? (other + '') : other;
  }
  if (typeof value != 'string') {
    return value === 0 ? value : +value;
  }
  value = value.replace(reTrim, '');
  var isBinary = reIsBinary.test(value);
  return (isBinary || reIsOctal.test(value))
    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
    : (reIsBadHex.test(value) ? NAN : +value);
}

module.exports = debounce;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}]},{},[37])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvbW9zYWljcy9pbmRleC5qcyIsInNyYy9qcy9tb3NhaWNzL3BhZ2UuanMiLCJzcmMvanMvbW9zYWljcy9jYXJvdXNlbC5qcyIsInNyYy9qcy9tb3NhaWNzL2hlcm9lcy5qcyIsIm5vZGVfbW9kdWxlcy9waG90b3N3aXBlL2Rpc3QvcGhvdG9zd2lwZS5qcyIsIm5vZGVfbW9kdWxlcy9waG90b3N3aXBlL2Rpc3QvcGhvdG9zd2lwZS11aS1kZWZhdWx0LmpzIiwibm9kZV9tb2R1bGVzL2xvcnkuanMvZGlzdC9sb3J5LmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC5kZWJvdW5jZS9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6R0E7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNycEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzcxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN4OEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpZiAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NsaWRlci1tb3NhaWNzJykpIHtcbiAgICByZXF1aXJlKCcuL2Nhcm91c2VsJyk7XG59XG5cbmlmIChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2xpZGVyLXRodW1ibmFpbHMnKSkge1xuICAgIHJlcXVpcmUoJy4vcGFnZScpO1xufSIsInZhciBsb3J5ID0gcmVxdWlyZSgnbG9yeS5qcycpLmxvcnk7XG52YXIgUGhvdG9Td2lwZSA9IHJlcXVpcmUoJ3Bob3Rvc3dpcGUnKTtcbnZhciBQaG90b1N3aXBlVUlfRGVmYXVsdCA9IHJlcXVpcmUoJ3Bob3Rvc3dpcGUvZGlzdC9waG90b3N3aXBlLXVpLWRlZmF1bHQnKTtcbnZhciBkZWJvdW5jZSA9IHJlcXVpcmUoJ2xvZGFzaC5kZWJvdW5jZScpO1xudmFyIGhlcm9lcyA9IHJlcXVpcmUoJy4vaGVyb2VzJyk7XG5cbnZhciBwYXJzZUhhc2ggPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaGFzaCA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoLnN1YnN0cmluZygxKSxcbiAgICAgICAgcGFyYW1zID0ge307XG5cbiAgICBpZiAoaGFzaC5sZW5ndGggPCA1KSB7XG4gICAgICAgIHJldHVybiBwYXJhbXM7XG4gICAgfVxuXG4gICAgdmFyIHZhcnMgPSBoYXNoLnNwbGl0KCcmJyk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB2YXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmICghdmFyc1tpXSkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHBhaXIgPSB2YXJzW2ldLnNwbGl0KCc9Jyk7XG4gICAgICAgIGlmIChwYWlyLmxlbmd0aCA8IDIpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIHBhcmFtc1twYWlyWzBdXSA9IHBhaXJbMV07XG4gICAgfVxuICAgIHJldHVybiBwYXJhbXM7XG59O1xuXG52YXIgaW1hZ2VzID0gW107XG52YXIgbW9zYWljcyA9IFtdO1xudmFyIGxvYWRlZCA9IDA7XG52YXIgY2Fyb3VzZWw7XG52YXIgY2Fyb3VzZWxNYWluO1xudmFyIGRpc2FibGVMb2FkID0gZmFsc2U7XG5cbnZhciBkZWJvdW5jZWRIYW5kbGVyID0gZGVib3VuY2UoZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgaWYgKGV2ZW50IGluc3RhbmNlb2YgTW91c2VFdmVudCkge1xuICAgICAgICB2YXIgaW5kZXggPSBwYXJzZUludChldmVudC50YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLWluZGV4JykpO1xuICAgICAgICBsb2FkSW1hZ2UobW9zYWljc1tpbmRleF0pO1xuICAgICAgICBsb2FkSW1hZ2UobW9zYWljc1tpbmRleCsxXSk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdkZWJvdW5jZWRIYW5kbGVyJywgaW5kZXgsIGNhcm91c2VsTWFpbik7XG4gICAgICAgIGNhcm91c2VsTWFpbi5zbGlkZVRvKGluZGV4KTtcbiAgICB9XG59LCAyNTAsIHtcbiAgICBsZWFkaW5nOiB0cnVlLFxuICAgIHRyYWlsaW5nOiBmYWxzZVxufSk7XG5cbnZhciBkZWJvdW5jZWRIYW5kbGVyR2FsbGVyeSA9IGRlYm91bmNlKGZ1bmN0aW9uIChldmVudCkge1xuICAgIGNvbnNvbGUubG9nKCdkZWJvdW5jZWRIYW5kbGVyR2FsbGVyeScsIGV2ZW50KTtcbiAgICBpZiAoZXZlbnQgaW5zdGFuY2VvZiBNb3VzZUV2ZW50KSB7XG4gICAgICAgIHZhciBpbmRleCA9IHBhcnNlSW50KGV2ZW50LnRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtaW5kZXgnKSk7XG4gICAgICAgIHZhciBoZXJvID0gZXZlbnQudGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1oZXJvJyk7XG4gICAgICAgIGNhcm91c2VsLnNsaWRlVG8oaW5kZXgpO1xuICAgICAgICBvcGVuR2FsbGVyeSgnaGVybycsIGhlcm8pO1xuICAgIH1cbn0sIDI1MCwge1xuICAgIGxlYWRpbmc6IHRydWUsXG4gICAgdHJhaWxpbmc6IGZhbHNlXG59KTtcblxuaGVyb2VzLmZvckVhY2goZnVuY3Rpb24oaGVybywgaW5kZXgpIHtcbiAgICB2YXIgc2xpZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpO1xuICAgIHNsaWRlLmNsYXNzTGlzdC5hZGQoJ2pzX3NsaWRlJyk7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzbGlkZXItdGh1bWJuYWlscyAuanNfc2xpZGVzXCIpLmFwcGVuZENoaWxkKHNsaWRlKTtcbiAgICB2YXIgc2xpZGVJbWFnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xuICAgIHNsaWRlSW1hZ2Uuc2V0QXR0cmlidXRlKCdkYXRhLWxhenknLCAnL21lZGlhL2ltYWdlcy9tb3NhaWNzL3RodW1ibmFpbHMvJyArIGhlcm8gKyAnLmpwZycpO1xuICAgIHNsaWRlSW1hZ2Uuc2V0QXR0cmlidXRlKCdkYXRhLWluZGV4JywgaW5kZXgpO1xuICAgIHNsaWRlSW1hZ2UuYWx0ID0gJyc7XG4gICAgc2xpZGUuYXBwZW5kQ2hpbGQoc2xpZGVJbWFnZSk7XG4gICAgaW1hZ2VzLnB1c2goc2xpZGVJbWFnZSk7XG4gICAgXG4gICAgc2xpZGUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBkZWJvdW5jZWRIYW5kbGVyKTtcbiAgICBcbiAgICB2YXIgc2xpZGVHYWxsZXJ5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcbiAgICBzbGlkZUdhbGxlcnkuY2xhc3NMaXN0LmFkZCgnanNfc2xpZGUnKTtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3NsaWRlci1nYWxsZXJ5IC5qc19zbGlkZXNcIikuYXBwZW5kQ2hpbGQoc2xpZGVHYWxsZXJ5KTtcbiAgICB2YXIgc2xpZGVJbWFnZUdhbGxlcnkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKTtcbiAgICBzbGlkZUltYWdlR2FsbGVyeS5zZXRBdHRyaWJ1dGUoJ2RhdGEtbGF6eScsICcvbWVkaWEvaW1hZ2VzL21vc2FpY3MvbW9zYWljcy8nICsgaGVybyArICcuanBnJyk7XG4gICAgc2xpZGVJbWFnZUdhbGxlcnkuc2V0QXR0cmlidXRlKCdkYXRhLWluZGV4JywgaW5kZXgpO1xuICAgIHNsaWRlSW1hZ2VHYWxsZXJ5LnNldEF0dHJpYnV0ZSgnZGF0YS1oZXJvJywgaGVybyk7XG4gICAgc2xpZGVJbWFnZUdhbGxlcnkuYWx0ID0gJyc7XG4gICAgc2xpZGVHYWxsZXJ5LmFwcGVuZENoaWxkKHNsaWRlSW1hZ2VHYWxsZXJ5KTtcbiAgICBtb3NhaWNzLnB1c2goc2xpZGVJbWFnZUdhbGxlcnkpO1xuICAgIFxuICAgIHNsaWRlR2FsbGVyeS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGRlYm91bmNlZEhhbmRsZXJHYWxsZXJ5KTtcbn0pO1xuXG5mdW5jdGlvbiBsb2FkSW1hZ2UoZWxlbWVudCkge1xuICAgIGlmIChlbGVtZW50ICYmICFlbGVtZW50LnNyYykgZWxlbWVudC5zcmMgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1sYXp5Jyk7XG59XG5cbmZ1bmN0aW9uIGxvYWRJbWFnZXMoc2xpZGVzLCBpbmRleCwgbnVtQ2FjaGVBZnRlciwgbnVtQ2FjaGVCZWZvcmUpIHtcbiAgICB2YXIgbnVtU2xpZGVzID0gc2xpZGVzLmxlbmd0aDtcbiAgICBudW1DYWNoZUFmdGVyID0gbnVtQ2FjaGVBZnRlciB8fCAwO1xuICAgIG51bUNhY2hlQmVmb3JlID0gbnVtQ2FjaGVCZWZvcmUgfHwgMDtcbiAgICBjb25zb2xlLmxvZygnbG9hZEltYWdlcycsIGluZGV4LCBpbmRleCAtIG51bUNhY2hlQmVmb3JlLCBpbmRleCArIG51bUNhY2hlQWZ0ZXIpO1xuICAgIGZvciAodmFyIGkgPSBpbmRleCAtIG51bUNhY2hlQmVmb3JlOyBpIDw9IGluZGV4ICsgbnVtQ2FjaGVBZnRlcjsgaSsrKSB7XG4gICAgICAgIHZhciBjdXJyZW50SW5kZXggPSAoaSArIG51bVNsaWRlcykgJSBudW1TbGlkZXM7XG4gICAgICAgIGNvbnNvbGUubG9nKCdsb2FkSW1hZ2VzIGN1cnJlbnRJbmRleCcsIGksIGN1cnJlbnRJbmRleCk7XG4gICAgICAgIGxvYWRJbWFnZShzbGlkZXNbY3VycmVudEluZGV4XSk7XG4gICAgfVxufVxuXG52YXIgc2xpZGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NsaWRlci10aHVtYm5haWxzJyk7XG5cbmNhcm91c2VsID0gbG9yeShzbGlkZXIsIHtcbiAgICBzbGlkZXNUb1Njcm9sbDogMyxcbiAgICBlbmFibGVNb3VzZUV2ZW50czogdHJ1ZVxufSk7XG5cblxuXG52YXIgc2xpZGVyTWFpbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzbGlkZXItZ2FsbGVyeScpO1xuXG5jYXJvdXNlbE1haW4gPSBsb3J5KHNsaWRlck1haW4sIHtcbiAgICBpbmZpbml0ZTogMSxcbiAgICBzbGlkZXNUb1Njcm9sbDogMSxcbiAgICBlbmFibGVNb3VzZUV2ZW50czogdHJ1ZVxufSk7XG5cblxuc2xpZGVyLmFkZEV2ZW50TGlzdGVuZXIoJ2JlZm9yZS5sb3J5LnNsaWRlJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgY29uc29sZS5sb2coJ2JlZm9yZSBzbGlkZScsIGRpc2FibGVMb2FkLCBldmVudC5kZXRhaWwuaW5kZXgsIGV2ZW50LmRldGFpbC5uZXh0U2xpZGUpO1xuICAgIGlmIChkaXNhYmxlTG9hZCkgcmV0dXJuO1xuICAgIHZhciBkaXIgPSAoZXZlbnQuZGV0YWlsLm5leHRTbGlkZSAtIGV2ZW50LmRldGFpbC5pbmRleCkgLyBNYXRoLmFicyhldmVudC5kZXRhaWwubmV4dFNsaWRlIC0gZXZlbnQuZGV0YWlsLmluZGV4KTtcbiAgICB2YXIgaW5kZXggPSBldmVudC5kZXRhaWwubmV4dFNsaWRlIC0gMTtcbiAgICBsb2FkSW1hZ2VzKGltYWdlcywgaW5kZXggKyA0ICogZGlyLCA0LCA0KTtcbn0pO1xuXG5zbGlkZXIuYWRkRXZlbnRMaXN0ZW5lcignYWZ0ZXIubG9yeS5zbGlkZScsIGRlYm91bmNlZEhhbmRsZXIpO1xuXG5zbGlkZXJNYWluLmFkZEV2ZW50TGlzdGVuZXIoJ2JlZm9yZS5sb3J5LnNsaWRlJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgY29uc29sZS5sb2coJ2JlZm9yZSBzbGlkZU1haW4nLCBkaXNhYmxlTG9hZCwgZXZlbnQuZGV0YWlsLmluZGV4LCBldmVudC5kZXRhaWwubmV4dFNsaWRlKTtcbiAgICBpZiAoZGlzYWJsZUxvYWQpIHJldHVybjtcbiAgICBsb2FkSW1hZ2VzKG1vc2FpY3MsIGV2ZW50LmRldGFpbC5uZXh0U2xpZGUgLSAxLCAxLCAxKTtcbn0pO1xuXG5zbGlkZXJNYWluLmFkZEV2ZW50TGlzdGVuZXIoJ2FmdGVyLmxvcnkuc2xpZGUnLCBkZWJvdW5jZWRIYW5kbGVyR2FsbGVyeSk7XG5cbmZ1bmN0aW9uIG9wZW5HYWxsZXJ5KGdpZCwgcGlkKSB7XG4gICAgY29uc29sZS5sb2coJ2hlcm9lcy5pbmRleE9mKHBpZCknLCBwaWQsIGhlcm9lcy5pbmRleE9mKHBpZCkpO1xuICAgIHZhciBnYWxsZXJ5ID0gbmV3IFBob3RvU3dpcGUocHN3cEVsZW1lbnQsIFBob3RvU3dpcGVVSV9EZWZhdWx0LCBpdGVtcywge1xuICAgICAgICBpbmRleDogaGVyb2VzLmluZGV4T2YocGlkKSxcbiAgICAgICAgZ2FsbGVyeVVJRDogZ2lkLFxuICAgICAgICBnZXRUaHVtYkJvdW5kc0ZuOiBmdW5jdGlvbiAoaW5kZXgpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdvcGVuZ2FsbGVyeScsIGluZGV4KTtcbiAgICAgICAgICAgIGRpc2FibGVMb2FkID0gdHJ1ZTtcbiAgICAgICAgICAgIC8vY2Fyb3VzZWwuc2xpZGVUbyhpbmRleCk7XG4gICAgICAgICAgICAvL2Nhcm91c2VsTWFpbi5zbGlkZVRvKGluZGV4KTtcbiAgICAgICAgICAgIGxvYWRJbWFnZXMoaW1hZ2VzLCBpbmRleCwgNCwgNCk7XG4gICAgICAgICAgICBsb2FkSW1hZ2VzKG1vc2FpY3MsIGluZGV4LCAxLCAxKTtcbiAgICAgICAgICAgIGRpc2FibGVMb2FkID0gZmFsc2U7XG4gICAgICAgICAgICB2YXIgdGh1bWJuYWlsID0gbW9zYWljc1tpbmRleF0sIC8vIGZpbmQgdGh1bWJuYWlsXG4gICAgICAgICAgICAgICAgcGFnZVlTY3JvbGwgPSB3aW5kb3cucGFnZVlPZmZzZXQgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcCxcbiAgICAgICAgICAgICAgICByZWN0ID0gdGh1bWJuYWlsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB4OiByZWN0LmxlZnQsXG4gICAgICAgICAgICAgICAgeTogcmVjdC50b3AgKyBwYWdlWVNjcm9sbCxcbiAgICAgICAgICAgICAgICB3OiByZWN0LndpZHRoXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgZ2FsbGVyeS5pbml0KCk7XG59XG5cbnZhciBwc3dwRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5wc3dwJylbMF07XG5cbi8vIGJ1aWxkIGl0ZW1zIGFycmF5XG52YXIgaXRlbXMgPSBoZXJvZXMubWFwKGZ1bmN0aW9uKGhlcm8pIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBwaWQ6IGhlcm8sXG4gICAgICAgIHNyYzogJy9tZWRpYS9pbWFnZXMvbW9zYWljcy9tb3NhaWNzLycgKyBoZXJvICsgJy5qcGcnLFxuICAgICAgICAvL21zcmM6ICcvbWVkaWEvaW1hZ2VzL21vc2FpY3MvdGh1bWJuYWlscy8nICsgaGVybyArICcuanBnJyxcbiAgICAgICAgdzogMTkyMCxcbiAgICAgICAgaDogMTA4MFxuICAgIH1cbn0pO1xuXG4vLyBJbml0aWFsaXplcyBhbmQgb3BlbnMgUGhvdG9Td2lwZVxudmFyIGhhc2hEYXRhID0gcGFyc2VIYXNoKCk7XG5pZiAoaGFzaERhdGEucGlkICYmIGhhc2hEYXRhLmdpZCkge1xuICAgIG9wZW5HYWxsZXJ5KGhhc2hEYXRhLmdpZCwgaGFzaERhdGEucGlkKTtcbiAgICBjYXJvdXNlbC5zbGlkZVRvKGhlcm9lcy5pbmRleE9mKGhhc2hEYXRhLnBpZCkpO1xuICAgIGNhcm91c2VsTWFpbi5zbGlkZVRvKGhlcm9lcy5pbmRleE9mKGhhc2hEYXRhLnBpZCkpO1xufVxuZWxzZSB7XG4gICAgbG9hZEltYWdlcyhpbWFnZXMsIDAsIDQsIDApO1xuICAgIGxvYWRJbWFnZXMobW9zYWljcywgMCwgMSwgMCk7XG59IiwidmFyIFBob3RvU3dpcGUgPSByZXF1aXJlKCdwaG90b3N3aXBlJyk7XG52YXIgbG9yeSA9IHJlcXVpcmUoJ2xvcnkuanMnKS5sb3J5O1xudmFyIHNodWZmbGUgPSByZXF1aXJlKCcuLi91dGlsL3NodWZmbGUnKTtcbnZhciBQaG90b1N3aXBlVUlfRGVmYXVsdCA9IHJlcXVpcmUoJ3Bob3Rvc3dpcGUvZGlzdC9waG90b3N3aXBlLXVpLWRlZmF1bHQnKTtcbnZhciBkZWJvdW5jZSA9IHJlcXVpcmUoJ2xvZGFzaC5kZWJvdW5jZScpO1xudmFyIGhlcm9lcyA9IHJlcXVpcmUoJy4vaGVyb2VzJyk7XG5oZXJvZXMgPSBzaHVmZmxlKGhlcm9lcyk7XG5cbnZhciBpbWFnZXMgPSBbXTtcbnZhciBsb2FkZWQgPSAwO1xudmFyIGNhcm91c2VsO1xuXG52YXIgZGVib3VuY2VkSGFuZGxlciA9IGRlYm91bmNlKGZ1bmN0aW9uIChldmVudCkge1xuICAgIGNvbnNvbGUubG9nKCdkZWJvdW5jZWRIYW5kbGVyJywgZXZlbnQpO1xuICAgIGlmIChldmVudCBpbnN0YW5jZW9mIE1vdXNlRXZlbnQpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gcGFyc2VJbnQoZXZlbnQudGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1pbmRleCcpKTtcbiAgICAgICAgb3BlbkdhbGxlcnkoaW5kZXgpO1xuICAgIH1cbn0sIDI1MCwge1xuICAgIGxlYWRpbmc6IHRydWUsXG4gICAgdHJhaWxpbmc6IGZhbHNlXG59KTtcblxuaGVyb2VzLmZvckVhY2goZnVuY3Rpb24oaGVybywgaW5kZXgpIHtcbiAgICB2YXIgc2xpZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpO1xuICAgIHNsaWRlLmNsYXNzTGlzdC5hZGQoJ2pzX3NsaWRlJyk7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzbGlkZXItbW9zYWljcyAuanNfc2xpZGVzXCIpLmFwcGVuZENoaWxkKHNsaWRlKTtcbiAgICB2YXIgc2xpZGVJbWFnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xuICAgIHNsaWRlSW1hZ2Uuc2V0QXR0cmlidXRlKCdkYXRhLWxhenknLCAnL21lZGlhL2ltYWdlcy9tb3NhaWNzL3RodW1ibmFpbHMvJyArIGhlcm8gKyAnLmpwZycpO1xuICAgIHNsaWRlSW1hZ2Uuc2V0QXR0cmlidXRlKCdkYXRhLWluZGV4JywgaW5kZXgpO1xuICAgIHNsaWRlSW1hZ2UuYWx0ID0gJyc7XG4gICAgc2xpZGUuYXBwZW5kQ2hpbGQoc2xpZGVJbWFnZSk7XG4gICAgaW1hZ2VzLnB1c2goc2xpZGVJbWFnZSk7XG4gICAgXG4gICAgc2xpZGUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBkZWJvdW5jZWRIYW5kbGVyKTtcbn0pO1xuXG5mdW5jdGlvbiBsb2FkSW1hZ2UoZWxlbWVudCkge1xuICAgIGlmIChlbGVtZW50ICYmICFlbGVtZW50LnNyYykgZWxlbWVudC5zcmMgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1sYXp5Jyk7XG59XG5cbmZ1bmN0aW9uIGxvYWRJbWFnZXMoc2xpZGVzLCBpbmRleCwgbnVtQ2FjaGVBZnRlciwgbnVtQ2FjaGVCZWZvcmUpIHtcbiAgICB2YXIgbnVtU2xpZGVzID0gc2xpZGVzLmxlbmd0aDtcbiAgICBudW1DYWNoZUFmdGVyID0gbnVtQ2FjaGVBZnRlciB8fCAwO1xuICAgIG51bUNhY2hlQmVmb3JlID0gbnVtQ2FjaGVCZWZvcmUgfHwgMDtcbiAgICAvL2NvbnNvbGUubG9nKCdsb2FkSW1hZ2VzJywgaW5kZXgsIGluZGV4IC0gbnVtQ2FjaGVCZWZvcmUsIGluZGV4ICsgbnVtQ2FjaGVBZnRlcik7XG4gICAgZm9yICh2YXIgaSA9IGluZGV4IC0gbnVtQ2FjaGVCZWZvcmU7IGkgPD0gaW5kZXggKyBudW1DYWNoZUFmdGVyOyBpKyspIHtcbiAgICAgICAgdmFyIGN1cnJlbnRJbmRleCA9IChpICsgbnVtU2xpZGVzKSAlIG51bVNsaWRlcztcbiAgICAgICAgLy9jb25zb2xlLmxvZygnbG9hZEltYWdlcyBjdXJyZW50SW5kZXgnLCBpLCBjdXJyZW50SW5kZXgpO1xuICAgICAgICBsb2FkSW1hZ2Uoc2xpZGVzW2N1cnJlbnRJbmRleF0pO1xuICAgIH1cbn1cblxuZm9yICh2YXIgaSA9IDA7IGkgPCA1OyBpKyspIHtcbiAgICBsb2FkSW1hZ2UoaW1hZ2VzW2ldKTtcbiAgICBsb2FkZWQgPSBpO1xufVxuXG52YXIgc2xpZGVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzX3NsaWRlcicpO1xuXG5jYXJvdXNlbCA9IGxvcnkoc2xpZGVyLCB7XG4gICAgcmV3aW5kOiB0cnVlLFxuICAgIHNsaWRlc1RvU2Nyb2xsOiAyLFxuICAgIGVuYWJsZU1vdXNlRXZlbnRzOiB0cnVlXG59KTtcblxuc2xpZGVyLmFkZEV2ZW50TGlzdGVuZXIoJ2JlZm9yZS5sb3J5LnNsaWRlJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgY29uc29sZS5sb2coJ2JlZm9yZSBzbGlkZScsIGV2ZW50LmRldGFpbC5pbmRleCwgZXZlbnQuZGV0YWlsLm5leHRTbGlkZSk7XG4gICAgdmFyIGRpciA9IChldmVudC5kZXRhaWwubmV4dFNsaWRlIC0gZXZlbnQuZGV0YWlsLmluZGV4KSAvIE1hdGguYWJzKGV2ZW50LmRldGFpbC5uZXh0U2xpZGUgLSBldmVudC5kZXRhaWwuaW5kZXgpO1xuICAgIHZhciBpbmRleCA9IGV2ZW50LmRldGFpbC5uZXh0U2xpZGUgLSAxO1xuICAgIGxvYWRJbWFnZXMoaW1hZ2VzLCBpbmRleCArIDQgKiBkaXIsIDQsIDQpO1xufSk7XG5cbnNsaWRlci5hZGRFdmVudExpc3RlbmVyKCdhZnRlci5sb3J5LnNsaWRlJywgZGVib3VuY2VkSGFuZGxlcik7XG5cbmZ1bmN0aW9uIG9wZW5HYWxsZXJ5KGluZGV4KSB7XG4gICAgdmFyIGdhbGxlcnkgPSBuZXcgUGhvdG9Td2lwZShwc3dwRWxlbWVudCwgUGhvdG9Td2lwZVVJX0RlZmF1bHQsIGl0ZW1zLCB7XG4gICAgICAgIGluZGV4OiBpbmRleCxcbiAgICAgICAgaGlzdG9yeTogZmFsc2UsXG4gICAgICAgIHNoYXJlRWw6IGZhbHNlLFxuICAgICAgICBnZXRUaHVtYkJvdW5kc0ZuOiBmdW5jdGlvbihpbmRleCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ29wZW5HYWxsZXJ5IGluZGV4JywgaW5kZXgpO1xuICAgICAgICAgICAgdmFyIHRodW1ibmFpbCA9IGltYWdlc1tpbmRleF0sIC8vIGZpbmQgdGh1bWJuYWlsXG4gICAgICAgICAgICAgICAgcGFnZVlTY3JvbGwgPSB3aW5kb3cucGFnZVlPZmZzZXQgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcCxcbiAgICAgICAgICAgICAgICByZWN0ID0gdGh1bWJuYWlsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB4OiByZWN0LmxlZnQsXG4gICAgICAgICAgICAgICAgeTogcmVjdC50b3AgKyBwYWdlWVNjcm9sbCxcbiAgICAgICAgICAgICAgICB3OiByZWN0LndpZHRoXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgZ2FsbGVyeS5pbml0KCk7XG59XG5cbnZhciBwc3dwRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5wc3dwJylbMF07XG5cbi8vIGJ1aWxkIGl0ZW1zIGFycmF5XG52YXIgaXRlbXMgPSBoZXJvZXMubWFwKGZ1bmN0aW9uKGhlcm8pIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBzcmM6ICcvbWVkaWEvaW1hZ2VzL21vc2FpY3MvbW9zYWljcy8nICsgaGVybyArICcuanBnJyxcbiAgICAgICAgdzogMTkyMCxcbiAgICAgICAgaDogMTA4MCxcbiAgICAgICAgdGl0bGU6ICc8YSBocmVmPVwiL2RvdGEyL21vc2FpY3MjJmdpZD1oZXJvJnBpZD0nICsgaGVybyArICdcIj5HbyB0byBtb3NhaWMgZ2FsbGVyeSBwYWdlICYjMTg3OzwvYT4nXG4gICAgfVxufSk7IiwibW9kdWxlLmV4cG9ydHMgPSBbJ2FiYWRkb24nLCAnYWJ5c3NhbF91bmRlcmxvcmQnLCAnYWxjaGVtaXN0JywgJ2FuY2llbnRfYXBwYXJpdGlvbicsICdhbnRpbWFnZScsICdhcmNfd2FyZGVuJywgJ2F4ZScsICdiYW5lJywgJ2JhdHJpZGVyJywgJ2JlYXN0bWFzdGVyJywgJ2Jsb29kc2Vla2VyJywgJ2JvdW50eV9odW50ZXInLCAnYnJld21hc3RlcicsICdicmlzdGxlYmFjaycsICdicm9vZG1vdGhlcicsICdjZW50YXVyJywgJ2NoYW9zX2tuaWdodCcsICdjaGVuJywgJ2NsaW5reicsICdyYXR0bGV0cmFwJywgJ2NyeXN0YWxfbWFpZGVuJywgJ2Rhcmtfc2VlcicsICdkYXJrX3dpbGxvdycsICdkYXp6bGUnLCAnZGVhdGhfcHJvcGhldCcsICdkaXNydXB0b3InLCAnZG9vbV9icmluZ2VyJywgJ2RyYWdvbl9rbmlnaHQnLCAnZHJvd19yYW5nZXInLCAnZWFydGhzaGFrZXInLCAnZWFydGhfc3Bpcml0JywgJ2VsZGVyX3RpdGFuJywgJ2VtYmVyX3NwaXJpdCcsICdlbmNoYW50cmVzcycsICdlbmlnbWEnLCAnZmFjZWxlc3Nfdm9pZCcsICdneXJvY29wdGVyJywgJ2h1c2thcicsICdpbnZva2VyJywgJ3dpc3AnLCAnamFraXJvJywgJ2p1Z2dlcm5hdXQnLCAna2VlcGVyX29mX3RoZV9saWdodCcsICdrdW5ra2EnLCAnbGVnaW9uX2NvbW1hbmRlcicsICdsZXNocmFjJywgJ2xpY2gnLCAnbGlmZV9zdGVhbGVyJywgJ2xpbmEnLCAnbGlvbicsICdsb25lX2RydWlkJywgJ2x1bmEnLCAnbHljYW4nLCAnbWFnbmF0YXVyJywgJ21lZHVzYScsICdtZWVwbycsICdtaXJhbmEnLCAnbW9ua2V5X2tpbmcnLCAnbW9ycGhsaW5nJywgJ25hZ2Ffc2lyZW4nLCAnZnVyaW9uJywgJ25lY3JvbHl0ZScsICduaWdodF9zdGFsa2VyJywgJ255eF9hc3Nhc3NpbicsICdvZ3JlX21hZ2knLCAnb21uaWtuaWdodCcsICdvcmFjbGUnLCAnb2JzaWRpYW5fZGVzdHJveWVyJywgJ3BhbmdvbGllcicsICdwaGFudG9tX2Fzc2Fzc2luJywgJ3BoYW50b21fbGFuY2VyJywgJ3Bob2VuaXgnLCAncHVjaycsICdwdWRnZScsICdwdWduYScsICdxdWVlbm9mcGFpbicsICdyYXpvcicsICdyaWtpJywgJ3J1YmljaycsICdzYW5kX2tpbmcnLCAnc2hhZG93X2RlbW9uJywgJ25ldmVybW9yZScsICdzaGFkb3dfc2hhbWFuJywgJ3NpbGVuY2VyJywgJ3NreXdyYXRoX21hZ2UnLCAnc2xhcmRhcicsICdzbGFyaycsICdzbmlwZXInLCAnc3BlY3RyZScsICdzcGlyaXRfYnJlYWtlcicsICdzdG9ybV9zcGlyaXQnLCAnc3ZlbicsICd0ZWNoaWVzJywgJ3RlbXBsYXJfYXNzYXNzaW4nLCAndGVycm9yYmxhZGUnLCAndGlkZWh1bnRlcicsICdzaHJlZGRlcicsICd0aW5rZXInLCAndGlueScsICd0cmVhbnQnLCAndHJvbGxfd2FybG9yZCcsICd0dXNrJywgJ3VuZHlpbmcnLCAndXJzYScsICd2ZW5nZWZ1bHNwaXJpdCcsICd2ZW5vbWFuY2VyJywgJ3ZpcGVyJywgJ3Zpc2FnZScsICd3YXJsb2NrJywgJ3dlYXZlcicsICd3aW5kcnVubmVyJywgJ3dpbnRlcl93eXZlcm4nLCAnd2l0Y2hfZG9jdG9yJywgJ3NrZWxldG9uX2tpbmcnLCAnenV1c19hbHQxJ107IiwiLyohIFBob3RvU3dpcGUgLSB2NC4xLjIgLSAyMDE3LTA0LTA1XG4qIGh0dHA6Ly9waG90b3N3aXBlLmNvbVxuKiBDb3B5cmlnaHQgKGMpIDIwMTcgRG1pdHJ5IFNlbWVub3Y7ICovXG4oZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHsgXG5cdGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcblx0XHRkZWZpbmUoZmFjdG9yeSk7XG5cdH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG5cdH0gZWxzZSB7XG5cdFx0cm9vdC5QaG90b1N3aXBlID0gZmFjdG9yeSgpO1xuXHR9XG59KSh0aGlzLCBmdW5jdGlvbiAoKSB7XG5cblx0J3VzZSBzdHJpY3QnO1xuXHR2YXIgUGhvdG9Td2lwZSA9IGZ1bmN0aW9uKHRlbXBsYXRlLCBVaUNsYXNzLCBpdGVtcywgb3B0aW9ucyl7XG5cbi8qPj5mcmFtZXdvcmstYnJpZGdlKi9cbi8qKlxuICpcbiAqIFNldCBvZiBnZW5lcmljIGZ1bmN0aW9ucyB1c2VkIGJ5IGdhbGxlcnkuXG4gKiBcbiAqIFlvdSdyZSBmcmVlIHRvIG1vZGlmeSBhbnl0aGluZyBoZXJlIGFzIGxvbmcgYXMgZnVuY3Rpb25hbGl0eSBpcyBrZXB0LlxuICogXG4gKi9cbnZhciBmcmFtZXdvcmsgPSB7XG5cdGZlYXR1cmVzOiBudWxsLFxuXHRiaW5kOiBmdW5jdGlvbih0YXJnZXQsIHR5cGUsIGxpc3RlbmVyLCB1bmJpbmQpIHtcblx0XHR2YXIgbWV0aG9kTmFtZSA9ICh1bmJpbmQgPyAncmVtb3ZlJyA6ICdhZGQnKSArICdFdmVudExpc3RlbmVyJztcblx0XHR0eXBlID0gdHlwZS5zcGxpdCgnICcpO1xuXHRcdGZvcih2YXIgaSA9IDA7IGkgPCB0eXBlLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRpZih0eXBlW2ldKSB7XG5cdFx0XHRcdHRhcmdldFttZXRob2ROYW1lXSggdHlwZVtpXSwgbGlzdGVuZXIsIGZhbHNlKTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdGlzQXJyYXk6IGZ1bmN0aW9uKG9iaikge1xuXHRcdHJldHVybiAob2JqIGluc3RhbmNlb2YgQXJyYXkpO1xuXHR9LFxuXHRjcmVhdGVFbDogZnVuY3Rpb24oY2xhc3NlcywgdGFnKSB7XG5cdFx0dmFyIGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWcgfHwgJ2RpdicpO1xuXHRcdGlmKGNsYXNzZXMpIHtcblx0XHRcdGVsLmNsYXNzTmFtZSA9IGNsYXNzZXM7XG5cdFx0fVxuXHRcdHJldHVybiBlbDtcblx0fSxcblx0Z2V0U2Nyb2xsWTogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHlPZmZzZXQgPSB3aW5kb3cucGFnZVlPZmZzZXQ7XG5cdFx0cmV0dXJuIHlPZmZzZXQgIT09IHVuZGVmaW5lZCA/IHlPZmZzZXQgOiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wO1xuXHR9LFxuXHR1bmJpbmQ6IGZ1bmN0aW9uKHRhcmdldCwgdHlwZSwgbGlzdGVuZXIpIHtcblx0XHRmcmFtZXdvcmsuYmluZCh0YXJnZXQsdHlwZSxsaXN0ZW5lcix0cnVlKTtcblx0fSxcblx0cmVtb3ZlQ2xhc3M6IGZ1bmN0aW9uKGVsLCBjbGFzc05hbWUpIHtcblx0XHR2YXIgcmVnID0gbmV3IFJlZ0V4cCgnKFxcXFxzfF4pJyArIGNsYXNzTmFtZSArICcoXFxcXHN8JCknKTtcblx0XHRlbC5jbGFzc05hbWUgPSBlbC5jbGFzc05hbWUucmVwbGFjZShyZWcsICcgJykucmVwbGFjZSgvXlxcc1xccyovLCAnJykucmVwbGFjZSgvXFxzXFxzKiQvLCAnJyk7IFxuXHR9LFxuXHRhZGRDbGFzczogZnVuY3Rpb24oZWwsIGNsYXNzTmFtZSkge1xuXHRcdGlmKCAhZnJhbWV3b3JrLmhhc0NsYXNzKGVsLGNsYXNzTmFtZSkgKSB7XG5cdFx0XHRlbC5jbGFzc05hbWUgKz0gKGVsLmNsYXNzTmFtZSA/ICcgJyA6ICcnKSArIGNsYXNzTmFtZTtcblx0XHR9XG5cdH0sXG5cdGhhc0NsYXNzOiBmdW5jdGlvbihlbCwgY2xhc3NOYW1lKSB7XG5cdFx0cmV0dXJuIGVsLmNsYXNzTmFtZSAmJiBuZXcgUmVnRXhwKCcoXnxcXFxccyknICsgY2xhc3NOYW1lICsgJyhcXFxcc3wkKScpLnRlc3QoZWwuY2xhc3NOYW1lKTtcblx0fSxcblx0Z2V0Q2hpbGRCeUNsYXNzOiBmdW5jdGlvbihwYXJlbnRFbCwgY2hpbGRDbGFzc05hbWUpIHtcblx0XHR2YXIgbm9kZSA9IHBhcmVudEVsLmZpcnN0Q2hpbGQ7XG5cdFx0d2hpbGUobm9kZSkge1xuXHRcdFx0aWYoIGZyYW1ld29yay5oYXNDbGFzcyhub2RlLCBjaGlsZENsYXNzTmFtZSkgKSB7XG5cdFx0XHRcdHJldHVybiBub2RlO1xuXHRcdFx0fVxuXHRcdFx0bm9kZSA9IG5vZGUubmV4dFNpYmxpbmc7XG5cdFx0fVxuXHR9LFxuXHRhcnJheVNlYXJjaDogZnVuY3Rpb24oYXJyYXksIHZhbHVlLCBrZXkpIHtcblx0XHR2YXIgaSA9IGFycmF5Lmxlbmd0aDtcblx0XHR3aGlsZShpLS0pIHtcblx0XHRcdGlmKGFycmF5W2ldW2tleV0gPT09IHZhbHVlKSB7XG5cdFx0XHRcdHJldHVybiBpO1xuXHRcdFx0fSBcblx0XHR9XG5cdFx0cmV0dXJuIC0xO1xuXHR9LFxuXHRleHRlbmQ6IGZ1bmN0aW9uKG8xLCBvMiwgcHJldmVudE92ZXJ3cml0ZSkge1xuXHRcdGZvciAodmFyIHByb3AgaW4gbzIpIHtcblx0XHRcdGlmIChvMi5oYXNPd25Qcm9wZXJ0eShwcm9wKSkge1xuXHRcdFx0XHRpZihwcmV2ZW50T3ZlcndyaXRlICYmIG8xLmhhc093blByb3BlcnR5KHByb3ApKSB7XG5cdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdH1cblx0XHRcdFx0bzFbcHJvcF0gPSBvMltwcm9wXTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdGVhc2luZzoge1xuXHRcdHNpbmU6IHtcblx0XHRcdG91dDogZnVuY3Rpb24oaykge1xuXHRcdFx0XHRyZXR1cm4gTWF0aC5zaW4oayAqIChNYXRoLlBJIC8gMikpO1xuXHRcdFx0fSxcblx0XHRcdGluT3V0OiBmdW5jdGlvbihrKSB7XG5cdFx0XHRcdHJldHVybiAtIChNYXRoLmNvcyhNYXRoLlBJICogaykgLSAxKSAvIDI7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRjdWJpYzoge1xuXHRcdFx0b3V0OiBmdW5jdGlvbihrKSB7XG5cdFx0XHRcdHJldHVybiAtLWsgKiBrICogayArIDE7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdC8qXG5cdFx0XHRlbGFzdGljOiB7XG5cdFx0XHRcdG91dDogZnVuY3Rpb24gKCBrICkge1xuXG5cdFx0XHRcdFx0dmFyIHMsIGEgPSAwLjEsIHAgPSAwLjQ7XG5cdFx0XHRcdFx0aWYgKCBrID09PSAwICkgcmV0dXJuIDA7XG5cdFx0XHRcdFx0aWYgKCBrID09PSAxICkgcmV0dXJuIDE7XG5cdFx0XHRcdFx0aWYgKCAhYSB8fCBhIDwgMSApIHsgYSA9IDE7IHMgPSBwIC8gNDsgfVxuXHRcdFx0XHRcdGVsc2UgcyA9IHAgKiBNYXRoLmFzaW4oIDEgLyBhICkgLyAoIDIgKiBNYXRoLlBJICk7XG5cdFx0XHRcdFx0cmV0dXJuICggYSAqIE1hdGgucG93KCAyLCAtIDEwICogaykgKiBNYXRoLnNpbiggKCBrIC0gcyApICogKCAyICogTWF0aC5QSSApIC8gcCApICsgMSApO1xuXG5cdFx0XHRcdH0sXG5cdFx0XHR9LFxuXHRcdFx0YmFjazoge1xuXHRcdFx0XHRvdXQ6IGZ1bmN0aW9uICggayApIHtcblx0XHRcdFx0XHR2YXIgcyA9IDEuNzAxNTg7XG5cdFx0XHRcdFx0cmV0dXJuIC0tayAqIGsgKiAoICggcyArIDEgKSAqIGsgKyBzICkgKyAxO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0Ki9cblx0fSxcblxuXHQvKipcblx0ICogXG5cdCAqIEByZXR1cm4ge29iamVjdH1cblx0ICogXG5cdCAqIHtcblx0ICogIHJhZiA6IHJlcXVlc3QgYW5pbWF0aW9uIGZyYW1lIGZ1bmN0aW9uXG5cdCAqICBjYWYgOiBjYW5jZWwgYW5pbWF0aW9uIGZyYW1lIGZ1bmN0aW9uXG5cdCAqICB0cmFuc2Zyb20gOiB0cmFuc2Zvcm0gcHJvcGVydHkga2V5ICh3aXRoIHZlbmRvciksIG9yIG51bGwgaWYgbm90IHN1cHBvcnRlZFxuXHQgKiAgb2xkSUUgOiBJRTggb3IgYmVsb3dcblx0ICogfVxuXHQgKiBcblx0ICovXG5cdGRldGVjdEZlYXR1cmVzOiBmdW5jdGlvbigpIHtcblx0XHRpZihmcmFtZXdvcmsuZmVhdHVyZXMpIHtcblx0XHRcdHJldHVybiBmcmFtZXdvcmsuZmVhdHVyZXM7XG5cdFx0fVxuXHRcdHZhciBoZWxwZXJFbCA9IGZyYW1ld29yay5jcmVhdGVFbCgpLFxuXHRcdFx0aGVscGVyU3R5bGUgPSBoZWxwZXJFbC5zdHlsZSxcblx0XHRcdHZlbmRvciA9ICcnLFxuXHRcdFx0ZmVhdHVyZXMgPSB7fTtcblxuXHRcdC8vIElFOCBhbmQgYmVsb3dcblx0XHRmZWF0dXJlcy5vbGRJRSA9IGRvY3VtZW50LmFsbCAmJiAhZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcjtcblxuXHRcdGZlYXR1cmVzLnRvdWNoID0gJ29udG91Y2hzdGFydCcgaW4gd2luZG93O1xuXG5cdFx0aWYod2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSkge1xuXHRcdFx0ZmVhdHVyZXMucmFmID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZTtcblx0XHRcdGZlYXR1cmVzLmNhZiA9IHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZTtcblx0XHR9XG5cblx0XHRmZWF0dXJlcy5wb2ludGVyRXZlbnQgPSBuYXZpZ2F0b3IucG9pbnRlckVuYWJsZWQgfHwgbmF2aWdhdG9yLm1zUG9pbnRlckVuYWJsZWQ7XG5cblx0XHQvLyBmaXggZmFsc2UtcG9zaXRpdmUgZGV0ZWN0aW9uIG9mIG9sZCBBbmRyb2lkIGluIG5ldyBJRVxuXHRcdC8vIChJRTExIHVhIHN0cmluZyBjb250YWlucyBcIkFuZHJvaWQgNC4wXCIpXG5cdFx0XG5cdFx0aWYoIWZlYXR1cmVzLnBvaW50ZXJFdmVudCkgeyBcblxuXHRcdFx0dmFyIHVhID0gbmF2aWdhdG9yLnVzZXJBZ2VudDtcblxuXHRcdFx0Ly8gRGV0ZWN0IGlmIGRldmljZSBpcyBpUGhvbmUgb3IgaVBvZCBhbmQgaWYgaXQncyBvbGRlciB0aGFuIGlPUyA4XG5cdFx0XHQvLyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8xNDIyMzkyMFxuXHRcdFx0Ly8gXG5cdFx0XHQvLyBUaGlzIGRldGVjdGlvbiBpcyBtYWRlIGJlY2F1c2Ugb2YgYnVnZ3kgdG9wL2JvdHRvbSB0b29sYmFyc1xuXHRcdFx0Ly8gdGhhdCBkb24ndCB0cmlnZ2VyIHdpbmRvdy5yZXNpemUgZXZlbnQuXG5cdFx0XHQvLyBGb3IgbW9yZSBpbmZvIHJlZmVyIHRvIF9pc0ZpeGVkUG9zaXRpb24gdmFyaWFibGUgaW4gY29yZS5qc1xuXG5cdFx0XHRpZiAoL2lQKGhvbmV8b2QpLy50ZXN0KG5hdmlnYXRvci5wbGF0Zm9ybSkpIHtcblx0XHRcdFx0dmFyIHYgPSAobmF2aWdhdG9yLmFwcFZlcnNpb24pLm1hdGNoKC9PUyAoXFxkKylfKFxcZCspXz8oXFxkKyk/Lyk7XG5cdFx0XHRcdGlmKHYgJiYgdi5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdFx0diA9IHBhcnNlSW50KHZbMV0sIDEwKTtcblx0XHRcdFx0XHRpZih2ID49IDEgJiYgdiA8IDggKSB7XG5cdFx0XHRcdFx0XHRmZWF0dXJlcy5pc09sZElPU1Bob25lID0gdHJ1ZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0Ly8gRGV0ZWN0IG9sZCBBbmRyb2lkIChiZWZvcmUgS2l0S2F0KVxuXHRcdFx0Ly8gZHVlIHRvIGJ1Z3MgcmVsYXRlZCB0byBwb3NpdGlvbjpmaXhlZFxuXHRcdFx0Ly8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy83MTg0NTczL3BpY2stdXAtdGhlLWFuZHJvaWQtdmVyc2lvbi1pbi10aGUtYnJvd3Nlci1ieS1qYXZhc2NyaXB0XG5cdFx0XHRcblx0XHRcdHZhciBtYXRjaCA9IHVhLm1hdGNoKC9BbmRyb2lkXFxzKFswLTlcXC5dKikvKTtcblx0XHRcdHZhciBhbmRyb2lkdmVyc2lvbiA9ICBtYXRjaCA/IG1hdGNoWzFdIDogMDtcblx0XHRcdGFuZHJvaWR2ZXJzaW9uID0gcGFyc2VGbG9hdChhbmRyb2lkdmVyc2lvbik7XG5cdFx0XHRpZihhbmRyb2lkdmVyc2lvbiA+PSAxICkge1xuXHRcdFx0XHRpZihhbmRyb2lkdmVyc2lvbiA8IDQuNCkge1xuXHRcdFx0XHRcdGZlYXR1cmVzLmlzT2xkQW5kcm9pZCA9IHRydWU7IC8vIGZvciBmaXhlZCBwb3NpdGlvbiBidWcgJiBwZXJmb3JtYW5jZVxuXHRcdFx0XHR9XG5cdFx0XHRcdGZlYXR1cmVzLmFuZHJvaWRWZXJzaW9uID0gYW5kcm9pZHZlcnNpb247IC8vIGZvciB0b3VjaGVuZCBidWdcblx0XHRcdH1cdFxuXHRcdFx0ZmVhdHVyZXMuaXNNb2JpbGVPcGVyYSA9IC9vcGVyYSBtaW5pfG9wZXJhIG1vYmkvaS50ZXN0KHVhKTtcblxuXHRcdFx0Ly8gcC5zLiB5ZXMsIHllcywgVUEgc25pZmZpbmcgaXMgYmFkLCBwcm9wb3NlIHlvdXIgc29sdXRpb24gZm9yIGFib3ZlIGJ1Z3MuXG5cdFx0fVxuXHRcdFxuXHRcdHZhciBzdHlsZUNoZWNrcyA9IFsndHJhbnNmb3JtJywgJ3BlcnNwZWN0aXZlJywgJ2FuaW1hdGlvbk5hbWUnXSxcblx0XHRcdHZlbmRvcnMgPSBbJycsICd3ZWJraXQnLCdNb3onLCdtcycsJ08nXSxcblx0XHRcdHN0eWxlQ2hlY2tJdGVtLFxuXHRcdFx0c3R5bGVOYW1lO1xuXG5cdFx0Zm9yKHZhciBpID0gMDsgaSA8IDQ7IGkrKykge1xuXHRcdFx0dmVuZG9yID0gdmVuZG9yc1tpXTtcblxuXHRcdFx0Zm9yKHZhciBhID0gMDsgYSA8IDM7IGErKykge1xuXHRcdFx0XHRzdHlsZUNoZWNrSXRlbSA9IHN0eWxlQ2hlY2tzW2FdO1xuXG5cdFx0XHRcdC8vIHVwcGVyY2FzZSBmaXJzdCBsZXR0ZXIgb2YgcHJvcGVydHkgbmFtZSwgaWYgdmVuZG9yIGlzIHByZXNlbnRcblx0XHRcdFx0c3R5bGVOYW1lID0gdmVuZG9yICsgKHZlbmRvciA/IFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRzdHlsZUNoZWNrSXRlbS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHN0eWxlQ2hlY2tJdGVtLnNsaWNlKDEpIDogXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHN0eWxlQ2hlY2tJdGVtKTtcblx0XHRcdFxuXHRcdFx0XHRpZighZmVhdHVyZXNbc3R5bGVDaGVja0l0ZW1dICYmIHN0eWxlTmFtZSBpbiBoZWxwZXJTdHlsZSApIHtcblx0XHRcdFx0XHRmZWF0dXJlc1tzdHlsZUNoZWNrSXRlbV0gPSBzdHlsZU5hbWU7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0aWYodmVuZG9yICYmICFmZWF0dXJlcy5yYWYpIHtcblx0XHRcdFx0dmVuZG9yID0gdmVuZG9yLnRvTG93ZXJDYXNlKCk7XG5cdFx0XHRcdGZlYXR1cmVzLnJhZiA9IHdpbmRvd1t2ZW5kb3IrJ1JlcXVlc3RBbmltYXRpb25GcmFtZSddO1xuXHRcdFx0XHRpZihmZWF0dXJlcy5yYWYpIHtcblx0XHRcdFx0XHRmZWF0dXJlcy5jYWYgPSB3aW5kb3dbdmVuZG9yKydDYW5jZWxBbmltYXRpb25GcmFtZSddIHx8IFxuXHRcdFx0XHRcdFx0XHRcdFx0d2luZG93W3ZlbmRvcisnQ2FuY2VsUmVxdWVzdEFuaW1hdGlvbkZyYW1lJ107XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0XHRcblx0XHRpZighZmVhdHVyZXMucmFmKSB7XG5cdFx0XHR2YXIgbGFzdFRpbWUgPSAwO1xuXHRcdFx0ZmVhdHVyZXMucmFmID0gZnVuY3Rpb24oZm4pIHtcblx0XHRcdFx0dmFyIGN1cnJUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG5cdFx0XHRcdHZhciB0aW1lVG9DYWxsID0gTWF0aC5tYXgoMCwgMTYgLSAoY3VyclRpbWUgLSBsYXN0VGltZSkpO1xuXHRcdFx0XHR2YXIgaWQgPSB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpIHsgZm4oY3VyclRpbWUgKyB0aW1lVG9DYWxsKTsgfSwgdGltZVRvQ2FsbCk7XG5cdFx0XHRcdGxhc3RUaW1lID0gY3VyclRpbWUgKyB0aW1lVG9DYWxsO1xuXHRcdFx0XHRyZXR1cm4gaWQ7XG5cdFx0XHR9O1xuXHRcdFx0ZmVhdHVyZXMuY2FmID0gZnVuY3Rpb24oaWQpIHsgY2xlYXJUaW1lb3V0KGlkKTsgfTtcblx0XHR9XG5cblx0XHQvLyBEZXRlY3QgU1ZHIHN1cHBvcnRcblx0XHRmZWF0dXJlcy5zdmcgPSAhIWRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyAmJiBcblx0XHRcdFx0XHRcdCEhZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycsICdzdmcnKS5jcmVhdGVTVkdSZWN0O1xuXG5cdFx0ZnJhbWV3b3JrLmZlYXR1cmVzID0gZmVhdHVyZXM7XG5cblx0XHRyZXR1cm4gZmVhdHVyZXM7XG5cdH1cbn07XG5cbmZyYW1ld29yay5kZXRlY3RGZWF0dXJlcygpO1xuXG4vLyBPdmVycmlkZSBhZGRFdmVudExpc3RlbmVyIGZvciBvbGQgdmVyc2lvbnMgb2YgSUVcbmlmKGZyYW1ld29yay5mZWF0dXJlcy5vbGRJRSkge1xuXG5cdGZyYW1ld29yay5iaW5kID0gZnVuY3Rpb24odGFyZ2V0LCB0eXBlLCBsaXN0ZW5lciwgdW5iaW5kKSB7XG5cdFx0XG5cdFx0dHlwZSA9IHR5cGUuc3BsaXQoJyAnKTtcblxuXHRcdHZhciBtZXRob2ROYW1lID0gKHVuYmluZCA/ICdkZXRhY2gnIDogJ2F0dGFjaCcpICsgJ0V2ZW50Jyxcblx0XHRcdGV2TmFtZSxcblx0XHRcdF9oYW5kbGVFdiA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRsaXN0ZW5lci5oYW5kbGVFdmVudC5jYWxsKGxpc3RlbmVyKTtcblx0XHRcdH07XG5cblx0XHRmb3IodmFyIGkgPSAwOyBpIDwgdHlwZS5sZW5ndGg7IGkrKykge1xuXHRcdFx0ZXZOYW1lID0gdHlwZVtpXTtcblx0XHRcdGlmKGV2TmFtZSkge1xuXG5cdFx0XHRcdGlmKHR5cGVvZiBsaXN0ZW5lciA9PT0gJ29iamVjdCcgJiYgbGlzdGVuZXIuaGFuZGxlRXZlbnQpIHtcblx0XHRcdFx0XHRpZighdW5iaW5kKSB7XG5cdFx0XHRcdFx0XHRsaXN0ZW5lclsnb2xkSUUnICsgZXZOYW1lXSA9IF9oYW5kbGVFdjtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0aWYoIWxpc3RlbmVyWydvbGRJRScgKyBldk5hbWVdKSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHR0YXJnZXRbbWV0aG9kTmFtZV0oICdvbicgKyBldk5hbWUsIGxpc3RlbmVyWydvbGRJRScgKyBldk5hbWVdKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR0YXJnZXRbbWV0aG9kTmFtZV0oICdvbicgKyBldk5hbWUsIGxpc3RlbmVyKTtcblx0XHRcdFx0fVxuXG5cdFx0XHR9XG5cdFx0fVxuXHR9O1xuXHRcbn1cblxuLyo+PmZyYW1ld29yay1icmlkZ2UqL1xuXG4vKj4+Y29yZSovXG4vL2Z1bmN0aW9uKHRlbXBsYXRlLCBVaUNsYXNzLCBpdGVtcywgb3B0aW9ucylcblxudmFyIHNlbGYgPSB0aGlzO1xuXG4vKipcbiAqIFN0YXRpYyB2YXJzLCBkb24ndCBjaGFuZ2UgdW5sZXNzIHlvdSBrbm93IHdoYXQgeW91J3JlIGRvaW5nLlxuICovXG52YXIgRE9VQkxFX1RBUF9SQURJVVMgPSAyNSwgXG5cdE5VTV9IT0xERVJTID0gMztcblxuLyoqXG4gKiBPcHRpb25zXG4gKi9cbnZhciBfb3B0aW9ucyA9IHtcblx0YWxsb3dQYW5Ub05leHQ6dHJ1ZSxcblx0c3BhY2luZzogMC4xMixcblx0YmdPcGFjaXR5OiAxLFxuXHRtb3VzZVVzZWQ6IGZhbHNlLFxuXHRsb29wOiB0cnVlLFxuXHRwaW5jaFRvQ2xvc2U6IHRydWUsXG5cdGNsb3NlT25TY3JvbGw6IHRydWUsXG5cdGNsb3NlT25WZXJ0aWNhbERyYWc6IHRydWUsXG5cdHZlcnRpY2FsRHJhZ1JhbmdlOiAwLjc1LFxuXHRoaWRlQW5pbWF0aW9uRHVyYXRpb246IDMzMyxcblx0c2hvd0FuaW1hdGlvbkR1cmF0aW9uOiAzMzMsXG5cdHNob3dIaWRlT3BhY2l0eTogZmFsc2UsXG5cdGZvY3VzOiB0cnVlLFxuXHRlc2NLZXk6IHRydWUsXG5cdGFycm93S2V5czogdHJ1ZSxcblx0bWFpblNjcm9sbEVuZEZyaWN0aW9uOiAwLjM1LFxuXHRwYW5FbmRGcmljdGlvbjogMC4zNSxcblx0aXNDbGlja2FibGVFbGVtZW50OiBmdW5jdGlvbihlbCkge1xuICAgICAgICByZXR1cm4gZWwudGFnTmFtZSA9PT0gJ0EnO1xuICAgIH0sXG4gICAgZ2V0RG91YmxlVGFwWm9vbTogZnVuY3Rpb24oaXNNb3VzZUNsaWNrLCBpdGVtKSB7XG4gICAgXHRpZihpc01vdXNlQ2xpY2spIHtcbiAgICBcdFx0cmV0dXJuIDE7XG4gICAgXHR9IGVsc2Uge1xuICAgIFx0XHRyZXR1cm4gaXRlbS5pbml0aWFsWm9vbUxldmVsIDwgMC43ID8gMSA6IDEuMzM7XG4gICAgXHR9XG4gICAgfSxcbiAgICBtYXhTcHJlYWRab29tOiAxLjMzLFxuXHRtb2RhbDogdHJ1ZSxcblxuXHQvLyBub3QgZnVsbHkgaW1wbGVtZW50ZWQgeWV0XG5cdHNjYWxlTW9kZTogJ2ZpdCcgLy8gVE9ET1xufTtcbmZyYW1ld29yay5leHRlbmQoX29wdGlvbnMsIG9wdGlvbnMpO1xuXG5cbi8qKlxuICogUHJpdmF0ZSBoZWxwZXIgdmFyaWFibGVzICYgZnVuY3Rpb25zXG4gKi9cblxudmFyIF9nZXRFbXB0eVBvaW50ID0gZnVuY3Rpb24oKSB7IFxuXHRcdHJldHVybiB7eDowLHk6MH07IFxuXHR9O1xuXG52YXIgX2lzT3Blbixcblx0X2lzRGVzdHJveWluZyxcblx0X2Nsb3NlZEJ5U2Nyb2xsLFxuXHRfY3VycmVudEl0ZW1JbmRleCxcblx0X2NvbnRhaW5lclN0eWxlLFxuXHRfY29udGFpbmVyU2hpZnRJbmRleCxcblx0X2N1cnJQYW5EaXN0ID0gX2dldEVtcHR5UG9pbnQoKSxcblx0X3N0YXJ0UGFuT2Zmc2V0ID0gX2dldEVtcHR5UG9pbnQoKSxcblx0X3Bhbk9mZnNldCA9IF9nZXRFbXB0eVBvaW50KCksXG5cdF91cE1vdmVFdmVudHMsIC8vIGRyYWcgbW92ZSwgZHJhZyBlbmQgJiBkcmFnIGNhbmNlbCBldmVudHMgYXJyYXlcblx0X2Rvd25FdmVudHMsIC8vIGRyYWcgc3RhcnQgZXZlbnRzIGFycmF5XG5cdF9nbG9iYWxFdmVudEhhbmRsZXJzLFxuXHRfdmlld3BvcnRTaXplID0ge30sXG5cdF9jdXJyWm9vbUxldmVsLFxuXHRfc3RhcnRab29tTGV2ZWwsXG5cdF90cmFuc2xhdGVQcmVmaXgsXG5cdF90cmFuc2xhdGVTdWZpeCxcblx0X3VwZGF0ZVNpemVJbnRlcnZhbCxcblx0X2l0ZW1zTmVlZFVwZGF0ZSxcblx0X2N1cnJQb3NpdGlvbkluZGV4ID0gMCxcblx0X29mZnNldCA9IHt9LFxuXHRfc2xpZGVTaXplID0gX2dldEVtcHR5UG9pbnQoKSwgLy8gc2l6ZSBvZiBzbGlkZSBhcmVhLCBpbmNsdWRpbmcgc3BhY2luZ1xuXHRfaXRlbUhvbGRlcnMsXG5cdF9wcmV2SXRlbUluZGV4LFxuXHRfaW5kZXhEaWZmID0gMCwgLy8gZGlmZmVyZW5jZSBvZiBpbmRleGVzIHNpbmNlIGxhc3QgY29udGVudCB1cGRhdGVcblx0X2RyYWdTdGFydEV2ZW50LFxuXHRfZHJhZ01vdmVFdmVudCxcblx0X2RyYWdFbmRFdmVudCxcblx0X2RyYWdDYW5jZWxFdmVudCxcblx0X3RyYW5zZm9ybUtleSxcblx0X3BvaW50ZXJFdmVudEVuYWJsZWQsXG5cdF9pc0ZpeGVkUG9zaXRpb24gPSB0cnVlLFxuXHRfbGlrZWx5VG91Y2hEZXZpY2UsXG5cdF9tb2R1bGVzID0gW10sXG5cdF9yZXF1ZXN0QUYsXG5cdF9jYW5jZWxBRixcblx0X2luaXRhbENsYXNzTmFtZSxcblx0X2luaXRhbFdpbmRvd1Njcm9sbFksXG5cdF9vbGRJRSxcblx0X2N1cnJlbnRXaW5kb3dTY3JvbGxZLFxuXHRfZmVhdHVyZXMsXG5cdF93aW5kb3dWaXNpYmxlU2l6ZSA9IHt9LFxuXHRfcmVuZGVyTWF4UmVzb2x1dGlvbiA9IGZhbHNlLFxuXHRfb3JpZW50YXRpb25DaGFuZ2VUaW1lb3V0LFxuXG5cblx0Ly8gUmVnaXN0ZXJzIFBob3RvU1dpcGUgbW9kdWxlIChIaXN0b3J5LCBDb250cm9sbGVyIC4uLilcblx0X3JlZ2lzdGVyTW9kdWxlID0gZnVuY3Rpb24obmFtZSwgbW9kdWxlKSB7XG5cdFx0ZnJhbWV3b3JrLmV4dGVuZChzZWxmLCBtb2R1bGUucHVibGljTWV0aG9kcyk7XG5cdFx0X21vZHVsZXMucHVzaChuYW1lKTtcblx0fSxcblxuXHRfZ2V0TG9vcGVkSWQgPSBmdW5jdGlvbihpbmRleCkge1xuXHRcdHZhciBudW1TbGlkZXMgPSBfZ2V0TnVtSXRlbXMoKTtcblx0XHRpZihpbmRleCA+IG51bVNsaWRlcyAtIDEpIHtcblx0XHRcdHJldHVybiBpbmRleCAtIG51bVNsaWRlcztcblx0XHR9IGVsc2UgIGlmKGluZGV4IDwgMCkge1xuXHRcdFx0cmV0dXJuIG51bVNsaWRlcyArIGluZGV4O1xuXHRcdH1cblx0XHRyZXR1cm4gaW5kZXg7XG5cdH0sXG5cdFxuXHQvLyBNaWNybyBiaW5kL3RyaWdnZXJcblx0X2xpc3RlbmVycyA9IHt9LFxuXHRfbGlzdGVuID0gZnVuY3Rpb24obmFtZSwgZm4pIHtcblx0XHRpZighX2xpc3RlbmVyc1tuYW1lXSkge1xuXHRcdFx0X2xpc3RlbmVyc1tuYW1lXSA9IFtdO1xuXHRcdH1cblx0XHRyZXR1cm4gX2xpc3RlbmVyc1tuYW1lXS5wdXNoKGZuKTtcblx0fSxcblx0X3Nob3V0ID0gZnVuY3Rpb24obmFtZSkge1xuXHRcdHZhciBsaXN0ZW5lcnMgPSBfbGlzdGVuZXJzW25hbWVdO1xuXG5cdFx0aWYobGlzdGVuZXJzKSB7XG5cdFx0XHR2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XG5cdFx0XHRhcmdzLnNoaWZ0KCk7XG5cblx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCBsaXN0ZW5lcnMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0bGlzdGVuZXJzW2ldLmFwcGx5KHNlbGYsIGFyZ3MpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblxuXHRfZ2V0Q3VycmVudFRpbWUgPSBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG5cdH0sXG5cdF9hcHBseUJnT3BhY2l0eSA9IGZ1bmN0aW9uKG9wYWNpdHkpIHtcblx0XHRfYmdPcGFjaXR5ID0gb3BhY2l0eTtcblx0XHRzZWxmLmJnLnN0eWxlLm9wYWNpdHkgPSBvcGFjaXR5ICogX29wdGlvbnMuYmdPcGFjaXR5O1xuXHR9LFxuXG5cdF9hcHBseVpvb21UcmFuc2Zvcm0gPSBmdW5jdGlvbihzdHlsZU9iaix4LHksem9vbSxpdGVtKSB7XG5cdFx0aWYoIV9yZW5kZXJNYXhSZXNvbHV0aW9uIHx8IChpdGVtICYmIGl0ZW0gIT09IHNlbGYuY3Vyckl0ZW0pICkge1xuXHRcdFx0em9vbSA9IHpvb20gLyAoaXRlbSA/IGl0ZW0uZml0UmF0aW8gOiBzZWxmLmN1cnJJdGVtLmZpdFJhdGlvKTtcdFxuXHRcdH1cblx0XHRcdFxuXHRcdHN0eWxlT2JqW190cmFuc2Zvcm1LZXldID0gX3RyYW5zbGF0ZVByZWZpeCArIHggKyAncHgsICcgKyB5ICsgJ3B4JyArIF90cmFuc2xhdGVTdWZpeCArICcgc2NhbGUoJyArIHpvb20gKyAnKSc7XG5cdH0sXG5cdF9hcHBseUN1cnJlbnRab29tUGFuID0gZnVuY3Rpb24oIGFsbG93UmVuZGVyUmVzb2x1dGlvbiApIHtcblx0XHRpZihfY3Vyclpvb21FbGVtZW50U3R5bGUpIHtcblxuXHRcdFx0aWYoYWxsb3dSZW5kZXJSZXNvbHV0aW9uKSB7XG5cdFx0XHRcdGlmKF9jdXJyWm9vbUxldmVsID4gc2VsZi5jdXJySXRlbS5maXRSYXRpbykge1xuXHRcdFx0XHRcdGlmKCFfcmVuZGVyTWF4UmVzb2x1dGlvbikge1xuXHRcdFx0XHRcdFx0X3NldEltYWdlU2l6ZShzZWxmLmN1cnJJdGVtLCBmYWxzZSwgdHJ1ZSk7XG5cdFx0XHRcdFx0XHRfcmVuZGVyTWF4UmVzb2x1dGlvbiA9IHRydWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGlmKF9yZW5kZXJNYXhSZXNvbHV0aW9uKSB7XG5cdFx0XHRcdFx0XHRfc2V0SW1hZ2VTaXplKHNlbGYuY3Vyckl0ZW0pO1xuXHRcdFx0XHRcdFx0X3JlbmRlck1heFJlc29sdXRpb24gPSBmYWxzZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdFxuXG5cdFx0XHRfYXBwbHlab29tVHJhbnNmb3JtKF9jdXJyWm9vbUVsZW1lbnRTdHlsZSwgX3Bhbk9mZnNldC54LCBfcGFuT2Zmc2V0LnksIF9jdXJyWm9vbUxldmVsKTtcblx0XHR9XG5cdH0sXG5cdF9hcHBseVpvb21QYW5Ub0l0ZW0gPSBmdW5jdGlvbihpdGVtKSB7XG5cdFx0aWYoaXRlbS5jb250YWluZXIpIHtcblxuXHRcdFx0X2FwcGx5Wm9vbVRyYW5zZm9ybShpdGVtLmNvbnRhaW5lci5zdHlsZSwgXG5cdFx0XHRcdFx0XHRcdFx0aXRlbS5pbml0aWFsUG9zaXRpb24ueCwgXG5cdFx0XHRcdFx0XHRcdFx0aXRlbS5pbml0aWFsUG9zaXRpb24ueSwgXG5cdFx0XHRcdFx0XHRcdFx0aXRlbS5pbml0aWFsWm9vbUxldmVsLFxuXHRcdFx0XHRcdFx0XHRcdGl0ZW0pO1xuXHRcdH1cblx0fSxcblx0X3NldFRyYW5zbGF0ZVggPSBmdW5jdGlvbih4LCBlbFN0eWxlKSB7XG5cdFx0ZWxTdHlsZVtfdHJhbnNmb3JtS2V5XSA9IF90cmFuc2xhdGVQcmVmaXggKyB4ICsgJ3B4LCAwcHgnICsgX3RyYW5zbGF0ZVN1Zml4O1xuXHR9LFxuXHRfbW92ZU1haW5TY3JvbGwgPSBmdW5jdGlvbih4LCBkcmFnZ2luZykge1xuXG5cdFx0aWYoIV9vcHRpb25zLmxvb3AgJiYgZHJhZ2dpbmcpIHtcblx0XHRcdHZhciBuZXdTbGlkZUluZGV4T2Zmc2V0ID0gX2N1cnJlbnRJdGVtSW5kZXggKyAoX3NsaWRlU2l6ZS54ICogX2N1cnJQb3NpdGlvbkluZGV4IC0geCkgLyBfc2xpZGVTaXplLngsXG5cdFx0XHRcdGRlbHRhID0gTWF0aC5yb3VuZCh4IC0gX21haW5TY3JvbGxQb3MueCk7XG5cblx0XHRcdGlmKCAobmV3U2xpZGVJbmRleE9mZnNldCA8IDAgJiYgZGVsdGEgPiAwKSB8fCBcblx0XHRcdFx0KG5ld1NsaWRlSW5kZXhPZmZzZXQgPj0gX2dldE51bUl0ZW1zKCkgLSAxICYmIGRlbHRhIDwgMCkgKSB7XG5cdFx0XHRcdHggPSBfbWFpblNjcm9sbFBvcy54ICsgZGVsdGEgKiBfb3B0aW9ucy5tYWluU2Nyb2xsRW5kRnJpY3Rpb247XG5cdFx0XHR9IFxuXHRcdH1cblx0XHRcblx0XHRfbWFpblNjcm9sbFBvcy54ID0geDtcblx0XHRfc2V0VHJhbnNsYXRlWCh4LCBfY29udGFpbmVyU3R5bGUpO1xuXHR9LFxuXHRfY2FsY3VsYXRlUGFuT2Zmc2V0ID0gZnVuY3Rpb24oYXhpcywgem9vbUxldmVsKSB7XG5cdFx0dmFyIG0gPSBfbWlkWm9vbVBvaW50W2F4aXNdIC0gX29mZnNldFtheGlzXTtcblx0XHRyZXR1cm4gX3N0YXJ0UGFuT2Zmc2V0W2F4aXNdICsgX2N1cnJQYW5EaXN0W2F4aXNdICsgbSAtIG0gKiAoIHpvb21MZXZlbCAvIF9zdGFydFpvb21MZXZlbCApO1xuXHR9LFxuXHRcblx0X2VxdWFsaXplUG9pbnRzID0gZnVuY3Rpb24ocDEsIHAyKSB7XG5cdFx0cDEueCA9IHAyLng7XG5cdFx0cDEueSA9IHAyLnk7XG5cdFx0aWYocDIuaWQpIHtcblx0XHRcdHAxLmlkID0gcDIuaWQ7XG5cdFx0fVxuXHR9LFxuXHRfcm91bmRQb2ludCA9IGZ1bmN0aW9uKHApIHtcblx0XHRwLnggPSBNYXRoLnJvdW5kKHAueCk7XG5cdFx0cC55ID0gTWF0aC5yb3VuZChwLnkpO1xuXHR9LFxuXG5cdF9tb3VzZU1vdmVUaW1lb3V0ID0gbnVsbCxcblx0X29uRmlyc3RNb3VzZU1vdmUgPSBmdW5jdGlvbigpIHtcblx0XHQvLyBXYWl0IHVudGlsIG1vdXNlIG1vdmUgZXZlbnQgaXMgZmlyZWQgYXQgbGVhc3QgdHdpY2UgZHVyaW5nIDEwMG1zXG5cdFx0Ly8gV2UgZG8gdGhpcywgYmVjYXVzZSBzb21lIG1vYmlsZSBicm93c2VycyB0cmlnZ2VyIGl0IG9uIHRvdWNoc3RhcnRcblx0XHRpZihfbW91c2VNb3ZlVGltZW91dCApIHsgXG5cdFx0XHRmcmFtZXdvcmsudW5iaW5kKGRvY3VtZW50LCAnbW91c2Vtb3ZlJywgX29uRmlyc3RNb3VzZU1vdmUpO1xuXHRcdFx0ZnJhbWV3b3JrLmFkZENsYXNzKHRlbXBsYXRlLCAncHN3cC0taGFzX21vdXNlJyk7XG5cdFx0XHRfb3B0aW9ucy5tb3VzZVVzZWQgPSB0cnVlO1xuXHRcdFx0X3Nob3V0KCdtb3VzZVVzZWQnKTtcblx0XHR9XG5cdFx0X21vdXNlTW92ZVRpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0X21vdXNlTW92ZVRpbWVvdXQgPSBudWxsO1xuXHRcdH0sIDEwMCk7XG5cdH0sXG5cblx0X2JpbmRFdmVudHMgPSBmdW5jdGlvbigpIHtcblx0XHRmcmFtZXdvcmsuYmluZChkb2N1bWVudCwgJ2tleWRvd24nLCBzZWxmKTtcblxuXHRcdGlmKF9mZWF0dXJlcy50cmFuc2Zvcm0pIHtcblx0XHRcdC8vIGRvbid0IGJpbmQgY2xpY2sgZXZlbnQgaW4gYnJvd3NlcnMgdGhhdCBkb24ndCBzdXBwb3J0IHRyYW5zZm9ybSAobW9zdGx5IElFOClcblx0XHRcdGZyYW1ld29yay5iaW5kKHNlbGYuc2Nyb2xsV3JhcCwgJ2NsaWNrJywgc2VsZik7XG5cdFx0fVxuXHRcdFxuXG5cdFx0aWYoIV9vcHRpb25zLm1vdXNlVXNlZCkge1xuXHRcdFx0ZnJhbWV3b3JrLmJpbmQoZG9jdW1lbnQsICdtb3VzZW1vdmUnLCBfb25GaXJzdE1vdXNlTW92ZSk7XG5cdFx0fVxuXG5cdFx0ZnJhbWV3b3JrLmJpbmQod2luZG93LCAncmVzaXplIHNjcm9sbCBvcmllbnRhdGlvbmNoYW5nZScsIHNlbGYpO1xuXG5cdFx0X3Nob3V0KCdiaW5kRXZlbnRzJyk7XG5cdH0sXG5cblx0X3VuYmluZEV2ZW50cyA9IGZ1bmN0aW9uKCkge1xuXHRcdGZyYW1ld29yay51bmJpbmQod2luZG93LCAncmVzaXplIHNjcm9sbCBvcmllbnRhdGlvbmNoYW5nZScsIHNlbGYpO1xuXHRcdGZyYW1ld29yay51bmJpbmQod2luZG93LCAnc2Nyb2xsJywgX2dsb2JhbEV2ZW50SGFuZGxlcnMuc2Nyb2xsKTtcblx0XHRmcmFtZXdvcmsudW5iaW5kKGRvY3VtZW50LCAna2V5ZG93bicsIHNlbGYpO1xuXHRcdGZyYW1ld29yay51bmJpbmQoZG9jdW1lbnQsICdtb3VzZW1vdmUnLCBfb25GaXJzdE1vdXNlTW92ZSk7XG5cblx0XHRpZihfZmVhdHVyZXMudHJhbnNmb3JtKSB7XG5cdFx0XHRmcmFtZXdvcmsudW5iaW5kKHNlbGYuc2Nyb2xsV3JhcCwgJ2NsaWNrJywgc2VsZik7XG5cdFx0fVxuXG5cdFx0aWYoX2lzRHJhZ2dpbmcpIHtcblx0XHRcdGZyYW1ld29yay51bmJpbmQod2luZG93LCBfdXBNb3ZlRXZlbnRzLCBzZWxmKTtcblx0XHR9XG5cblx0XHRjbGVhclRpbWVvdXQoX29yaWVudGF0aW9uQ2hhbmdlVGltZW91dCk7XG5cblx0XHRfc2hvdXQoJ3VuYmluZEV2ZW50cycpO1xuXHR9LFxuXHRcblx0X2NhbGN1bGF0ZVBhbkJvdW5kcyA9IGZ1bmN0aW9uKHpvb21MZXZlbCwgdXBkYXRlKSB7XG5cdFx0dmFyIGJvdW5kcyA9IF9jYWxjdWxhdGVJdGVtU2l6ZSggc2VsZi5jdXJySXRlbSwgX3ZpZXdwb3J0U2l6ZSwgem9vbUxldmVsICk7XG5cdFx0aWYodXBkYXRlKSB7XG5cdFx0XHRfY3VyclBhbkJvdW5kcyA9IGJvdW5kcztcblx0XHR9XG5cdFx0cmV0dXJuIGJvdW5kcztcblx0fSxcblx0XG5cdF9nZXRNaW5ab29tTGV2ZWwgPSBmdW5jdGlvbihpdGVtKSB7XG5cdFx0aWYoIWl0ZW0pIHtcblx0XHRcdGl0ZW0gPSBzZWxmLmN1cnJJdGVtO1xuXHRcdH1cblx0XHRyZXR1cm4gaXRlbS5pbml0aWFsWm9vbUxldmVsO1xuXHR9LFxuXHRfZ2V0TWF4Wm9vbUxldmVsID0gZnVuY3Rpb24oaXRlbSkge1xuXHRcdGlmKCFpdGVtKSB7XG5cdFx0XHRpdGVtID0gc2VsZi5jdXJySXRlbTtcblx0XHR9XG5cdFx0cmV0dXJuIGl0ZW0udyA+IDAgPyBfb3B0aW9ucy5tYXhTcHJlYWRab29tIDogMTtcblx0fSxcblxuXHQvLyBSZXR1cm4gdHJ1ZSBpZiBvZmZzZXQgaXMgb3V0IG9mIHRoZSBib3VuZHNcblx0X21vZGlmeURlc3RQYW5PZmZzZXQgPSBmdW5jdGlvbihheGlzLCBkZXN0UGFuQm91bmRzLCBkZXN0UGFuT2Zmc2V0LCBkZXN0Wm9vbUxldmVsKSB7XG5cdFx0aWYoZGVzdFpvb21MZXZlbCA9PT0gc2VsZi5jdXJySXRlbS5pbml0aWFsWm9vbUxldmVsKSB7XG5cdFx0XHRkZXN0UGFuT2Zmc2V0W2F4aXNdID0gc2VsZi5jdXJySXRlbS5pbml0aWFsUG9zaXRpb25bYXhpc107XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0ZGVzdFBhbk9mZnNldFtheGlzXSA9IF9jYWxjdWxhdGVQYW5PZmZzZXQoYXhpcywgZGVzdFpvb21MZXZlbCk7IFxuXG5cdFx0XHRpZihkZXN0UGFuT2Zmc2V0W2F4aXNdID4gZGVzdFBhbkJvdW5kcy5taW5bYXhpc10pIHtcblx0XHRcdFx0ZGVzdFBhbk9mZnNldFtheGlzXSA9IGRlc3RQYW5Cb3VuZHMubWluW2F4aXNdO1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH0gZWxzZSBpZihkZXN0UGFuT2Zmc2V0W2F4aXNdIDwgZGVzdFBhbkJvdW5kcy5tYXhbYXhpc10gKSB7XG5cdFx0XHRcdGRlc3RQYW5PZmZzZXRbYXhpc10gPSBkZXN0UGFuQm91bmRzLm1heFtheGlzXTtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBmYWxzZTtcblx0fSxcblxuXHRfc2V0dXBUcmFuc2Zvcm1zID0gZnVuY3Rpb24oKSB7XG5cblx0XHRpZihfdHJhbnNmb3JtS2V5KSB7XG5cdFx0XHQvLyBzZXR1cCAzZCB0cmFuc2Zvcm1zXG5cdFx0XHR2YXIgYWxsb3czZFRyYW5zZm9ybSA9IF9mZWF0dXJlcy5wZXJzcGVjdGl2ZSAmJiAhX2xpa2VseVRvdWNoRGV2aWNlO1xuXHRcdFx0X3RyYW5zbGF0ZVByZWZpeCA9ICd0cmFuc2xhdGUnICsgKGFsbG93M2RUcmFuc2Zvcm0gPyAnM2QoJyA6ICcoJyk7XG5cdFx0XHRfdHJhbnNsYXRlU3VmaXggPSBfZmVhdHVyZXMucGVyc3BlY3RpdmUgPyAnLCAwcHgpJyA6ICcpJztcdFxuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdC8vIE92ZXJyaWRlIHpvb20vcGFuL21vdmUgZnVuY3Rpb25zIGluIGNhc2Ugb2xkIGJyb3dzZXIgaXMgdXNlZCAobW9zdCBsaWtlbHkgSUUpXG5cdFx0Ly8gKHNvIHRoZXkgdXNlIGxlZnQvdG9wL3dpZHRoL2hlaWdodCwgaW5zdGVhZCBvZiBDU1MgdHJhbnNmb3JtKVxuXHRcblx0XHRfdHJhbnNmb3JtS2V5ID0gJ2xlZnQnO1xuXHRcdGZyYW1ld29yay5hZGRDbGFzcyh0ZW1wbGF0ZSwgJ3Bzd3AtLWllJyk7XG5cblx0XHRfc2V0VHJhbnNsYXRlWCA9IGZ1bmN0aW9uKHgsIGVsU3R5bGUpIHtcblx0XHRcdGVsU3R5bGUubGVmdCA9IHggKyAncHgnO1xuXHRcdH07XG5cdFx0X2FwcGx5Wm9vbVBhblRvSXRlbSA9IGZ1bmN0aW9uKGl0ZW0pIHtcblxuXHRcdFx0dmFyIHpvb21SYXRpbyA9IGl0ZW0uZml0UmF0aW8gPiAxID8gMSA6IGl0ZW0uZml0UmF0aW8sXG5cdFx0XHRcdHMgPSBpdGVtLmNvbnRhaW5lci5zdHlsZSxcblx0XHRcdFx0dyA9IHpvb21SYXRpbyAqIGl0ZW0udyxcblx0XHRcdFx0aCA9IHpvb21SYXRpbyAqIGl0ZW0uaDtcblxuXHRcdFx0cy53aWR0aCA9IHcgKyAncHgnO1xuXHRcdFx0cy5oZWlnaHQgPSBoICsgJ3B4Jztcblx0XHRcdHMubGVmdCA9IGl0ZW0uaW5pdGlhbFBvc2l0aW9uLnggKyAncHgnO1xuXHRcdFx0cy50b3AgPSBpdGVtLmluaXRpYWxQb3NpdGlvbi55ICsgJ3B4JztcblxuXHRcdH07XG5cdFx0X2FwcGx5Q3VycmVudFpvb21QYW4gPSBmdW5jdGlvbigpIHtcblx0XHRcdGlmKF9jdXJyWm9vbUVsZW1lbnRTdHlsZSkge1xuXG5cdFx0XHRcdHZhciBzID0gX2N1cnJab29tRWxlbWVudFN0eWxlLFxuXHRcdFx0XHRcdGl0ZW0gPSBzZWxmLmN1cnJJdGVtLFxuXHRcdFx0XHRcdHpvb21SYXRpbyA9IGl0ZW0uZml0UmF0aW8gPiAxID8gMSA6IGl0ZW0uZml0UmF0aW8sXG5cdFx0XHRcdFx0dyA9IHpvb21SYXRpbyAqIGl0ZW0udyxcblx0XHRcdFx0XHRoID0gem9vbVJhdGlvICogaXRlbS5oO1xuXG5cdFx0XHRcdHMud2lkdGggPSB3ICsgJ3B4Jztcblx0XHRcdFx0cy5oZWlnaHQgPSBoICsgJ3B4JztcblxuXG5cdFx0XHRcdHMubGVmdCA9IF9wYW5PZmZzZXQueCArICdweCc7XG5cdFx0XHRcdHMudG9wID0gX3Bhbk9mZnNldC55ICsgJ3B4Jztcblx0XHRcdH1cblx0XHRcdFxuXHRcdH07XG5cdH0sXG5cblx0X29uS2V5RG93biA9IGZ1bmN0aW9uKGUpIHtcblx0XHR2YXIga2V5ZG93bkFjdGlvbiA9ICcnO1xuXHRcdGlmKF9vcHRpb25zLmVzY0tleSAmJiBlLmtleUNvZGUgPT09IDI3KSB7IFxuXHRcdFx0a2V5ZG93bkFjdGlvbiA9ICdjbG9zZSc7XG5cdFx0fSBlbHNlIGlmKF9vcHRpb25zLmFycm93S2V5cykge1xuXHRcdFx0aWYoZS5rZXlDb2RlID09PSAzNykge1xuXHRcdFx0XHRrZXlkb3duQWN0aW9uID0gJ3ByZXYnO1xuXHRcdFx0fSBlbHNlIGlmKGUua2V5Q29kZSA9PT0gMzkpIHsgXG5cdFx0XHRcdGtleWRvd25BY3Rpb24gPSAnbmV4dCc7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYoa2V5ZG93bkFjdGlvbikge1xuXHRcdFx0Ly8gZG9uJ3QgZG8gYW55dGhpbmcgaWYgc3BlY2lhbCBrZXkgcHJlc3NlZCB0byBwcmV2ZW50IGZyb20gb3ZlcnJpZGluZyBkZWZhdWx0IGJyb3dzZXIgYWN0aW9uc1xuXHRcdFx0Ly8gZS5nLiBpbiBDaHJvbWUgb24gTWFjIGNtZCthcnJvdy1sZWZ0IHJldHVybnMgdG8gcHJldmlvdXMgcGFnZVxuXHRcdFx0aWYoICFlLmN0cmxLZXkgJiYgIWUuYWx0S2V5ICYmICFlLnNoaWZ0S2V5ICYmICFlLm1ldGFLZXkgKSB7XG5cdFx0XHRcdGlmKGUucHJldmVudERlZmF1bHQpIHtcblx0XHRcdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0ZS5yZXR1cm5WYWx1ZSA9IGZhbHNlO1xuXHRcdFx0XHR9IFxuXHRcdFx0XHRzZWxmW2tleWRvd25BY3Rpb25dKCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXG5cdF9vbkdsb2JhbENsaWNrID0gZnVuY3Rpb24oZSkge1xuXHRcdGlmKCFlKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Ly8gZG9uJ3QgYWxsb3cgY2xpY2sgZXZlbnQgdG8gcGFzcyB0aHJvdWdoIHdoZW4gdHJpZ2dlcmluZyBhZnRlciBkcmFnIG9yIHNvbWUgb3RoZXIgZ2VzdHVyZVxuXHRcdGlmKF9tb3ZlZCB8fCBfem9vbVN0YXJ0ZWQgfHwgX21haW5TY3JvbGxBbmltYXRpbmcgfHwgX3ZlcnRpY2FsRHJhZ0luaXRpYXRlZCkge1xuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0ZS5zdG9wUHJvcGFnYXRpb24oKTtcblx0XHR9XG5cdH0sXG5cblx0X3VwZGF0ZVBhZ2VTY3JvbGxPZmZzZXQgPSBmdW5jdGlvbigpIHtcblx0XHRzZWxmLnNldFNjcm9sbE9mZnNldCgwLCBmcmFtZXdvcmsuZ2V0U2Nyb2xsWSgpKTtcdFx0XG5cdH07XG5cdFxuXG5cblx0XG5cblxuXG4vLyBNaWNybyBhbmltYXRpb24gZW5naW5lXG52YXIgX2FuaW1hdGlvbnMgPSB7fSxcblx0X251bUFuaW1hdGlvbnMgPSAwLFxuXHRfc3RvcEFuaW1hdGlvbiA9IGZ1bmN0aW9uKG5hbWUpIHtcblx0XHRpZihfYW5pbWF0aW9uc1tuYW1lXSkge1xuXHRcdFx0aWYoX2FuaW1hdGlvbnNbbmFtZV0ucmFmKSB7XG5cdFx0XHRcdF9jYW5jZWxBRiggX2FuaW1hdGlvbnNbbmFtZV0ucmFmICk7XG5cdFx0XHR9XG5cdFx0XHRfbnVtQW5pbWF0aW9ucy0tO1xuXHRcdFx0ZGVsZXRlIF9hbmltYXRpb25zW25hbWVdO1xuXHRcdH1cblx0fSxcblx0X3JlZ2lzdGVyU3RhcnRBbmltYXRpb24gPSBmdW5jdGlvbihuYW1lKSB7XG5cdFx0aWYoX2FuaW1hdGlvbnNbbmFtZV0pIHtcblx0XHRcdF9zdG9wQW5pbWF0aW9uKG5hbWUpO1xuXHRcdH1cblx0XHRpZighX2FuaW1hdGlvbnNbbmFtZV0pIHtcblx0XHRcdF9udW1BbmltYXRpb25zKys7XG5cdFx0XHRfYW5pbWF0aW9uc1tuYW1lXSA9IHt9O1xuXHRcdH1cblx0fSxcblx0X3N0b3BBbGxBbmltYXRpb25zID0gZnVuY3Rpb24oKSB7XG5cdFx0Zm9yICh2YXIgcHJvcCBpbiBfYW5pbWF0aW9ucykge1xuXG5cdFx0XHRpZiggX2FuaW1hdGlvbnMuaGFzT3duUHJvcGVydHkoIHByb3AgKSApIHtcblx0XHRcdFx0X3N0b3BBbmltYXRpb24ocHJvcCk7XG5cdFx0XHR9IFxuXHRcdFx0XG5cdFx0fVxuXHR9LFxuXHRfYW5pbWF0ZVByb3AgPSBmdW5jdGlvbihuYW1lLCBiLCBlbmRQcm9wLCBkLCBlYXNpbmdGbiwgb25VcGRhdGUsIG9uQ29tcGxldGUpIHtcblx0XHR2YXIgc3RhcnRBbmltVGltZSA9IF9nZXRDdXJyZW50VGltZSgpLCB0O1xuXHRcdF9yZWdpc3RlclN0YXJ0QW5pbWF0aW9uKG5hbWUpO1xuXG5cdFx0dmFyIGFuaW1sb29wID0gZnVuY3Rpb24oKXtcblx0XHRcdGlmICggX2FuaW1hdGlvbnNbbmFtZV0gKSB7XG5cdFx0XHRcdFxuXHRcdFx0XHR0ID0gX2dldEN1cnJlbnRUaW1lKCkgLSBzdGFydEFuaW1UaW1lOyAvLyB0aW1lIGRpZmZcblx0XHRcdFx0Ly9iIC0gYmVnaW5uaW5nIChzdGFydCBwcm9wKVxuXHRcdFx0XHQvL2QgLSBhbmltIGR1cmF0aW9uXG5cblx0XHRcdFx0aWYgKCB0ID49IGQgKSB7XG5cdFx0XHRcdFx0X3N0b3BBbmltYXRpb24obmFtZSk7XG5cdFx0XHRcdFx0b25VcGRhdGUoZW5kUHJvcCk7XG5cdFx0XHRcdFx0aWYob25Db21wbGV0ZSkge1xuXHRcdFx0XHRcdFx0b25Db21wbGV0ZSgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblx0XHRcdFx0b25VcGRhdGUoIChlbmRQcm9wIC0gYikgKiBlYXNpbmdGbih0L2QpICsgYiApO1xuXG5cdFx0XHRcdF9hbmltYXRpb25zW25hbWVdLnJhZiA9IF9yZXF1ZXN0QUYoYW5pbWxvb3ApO1xuXHRcdFx0fVxuXHRcdH07XG5cdFx0YW5pbWxvb3AoKTtcblx0fTtcblx0XG5cblxudmFyIHB1YmxpY01ldGhvZHMgPSB7XG5cblx0Ly8gbWFrZSBhIGZldyBsb2NhbCB2YXJpYWJsZXMgYW5kIGZ1bmN0aW9ucyBwdWJsaWNcblx0c2hvdXQ6IF9zaG91dCxcblx0bGlzdGVuOiBfbGlzdGVuLFxuXHR2aWV3cG9ydFNpemU6IF92aWV3cG9ydFNpemUsXG5cdG9wdGlvbnM6IF9vcHRpb25zLFxuXG5cdGlzTWFpblNjcm9sbEFuaW1hdGluZzogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIF9tYWluU2Nyb2xsQW5pbWF0aW5nO1xuXHR9LFxuXHRnZXRab29tTGV2ZWw6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiBfY3Vyclpvb21MZXZlbDtcblx0fSxcblx0Z2V0Q3VycmVudEluZGV4OiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gX2N1cnJlbnRJdGVtSW5kZXg7XG5cdH0sXG5cdGlzRHJhZ2dpbmc6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiBfaXNEcmFnZ2luZztcblx0fSxcdFxuXHRpc1pvb21pbmc6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiBfaXNab29taW5nO1xuXHR9LFxuXHRzZXRTY3JvbGxPZmZzZXQ6IGZ1bmN0aW9uKHgseSkge1xuXHRcdF9vZmZzZXQueCA9IHg7XG5cdFx0X2N1cnJlbnRXaW5kb3dTY3JvbGxZID0gX29mZnNldC55ID0geTtcblx0XHRfc2hvdXQoJ3VwZGF0ZVNjcm9sbE9mZnNldCcsIF9vZmZzZXQpO1xuXHR9LFxuXHRhcHBseVpvb21QYW46IGZ1bmN0aW9uKHpvb21MZXZlbCxwYW5YLHBhblksYWxsb3dSZW5kZXJSZXNvbHV0aW9uKSB7XG5cdFx0X3Bhbk9mZnNldC54ID0gcGFuWDtcblx0XHRfcGFuT2Zmc2V0LnkgPSBwYW5ZO1xuXHRcdF9jdXJyWm9vbUxldmVsID0gem9vbUxldmVsO1xuXHRcdF9hcHBseUN1cnJlbnRab29tUGFuKCBhbGxvd1JlbmRlclJlc29sdXRpb24gKTtcblx0fSxcblxuXHRpbml0OiBmdW5jdGlvbigpIHtcblxuXHRcdGlmKF9pc09wZW4gfHwgX2lzRGVzdHJveWluZykge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHZhciBpO1xuXG5cdFx0c2VsZi5mcmFtZXdvcmsgPSBmcmFtZXdvcms7IC8vIGJhc2ljIGZ1bmN0aW9uYWxpdHlcblx0XHRzZWxmLnRlbXBsYXRlID0gdGVtcGxhdGU7IC8vIHJvb3QgRE9NIGVsZW1lbnQgb2YgUGhvdG9Td2lwZVxuXHRcdHNlbGYuYmcgPSBmcmFtZXdvcmsuZ2V0Q2hpbGRCeUNsYXNzKHRlbXBsYXRlLCAncHN3cF9fYmcnKTtcblxuXHRcdF9pbml0YWxDbGFzc05hbWUgPSB0ZW1wbGF0ZS5jbGFzc05hbWU7XG5cdFx0X2lzT3BlbiA9IHRydWU7XG5cdFx0XHRcdFxuXHRcdF9mZWF0dXJlcyA9IGZyYW1ld29yay5kZXRlY3RGZWF0dXJlcygpO1xuXHRcdF9yZXF1ZXN0QUYgPSBfZmVhdHVyZXMucmFmO1xuXHRcdF9jYW5jZWxBRiA9IF9mZWF0dXJlcy5jYWY7XG5cdFx0X3RyYW5zZm9ybUtleSA9IF9mZWF0dXJlcy50cmFuc2Zvcm07XG5cdFx0X29sZElFID0gX2ZlYXR1cmVzLm9sZElFO1xuXHRcdFxuXHRcdHNlbGYuc2Nyb2xsV3JhcCA9IGZyYW1ld29yay5nZXRDaGlsZEJ5Q2xhc3ModGVtcGxhdGUsICdwc3dwX19zY3JvbGwtd3JhcCcpO1xuXHRcdHNlbGYuY29udGFpbmVyID0gZnJhbWV3b3JrLmdldENoaWxkQnlDbGFzcyhzZWxmLnNjcm9sbFdyYXAsICdwc3dwX19jb250YWluZXInKTtcblxuXHRcdF9jb250YWluZXJTdHlsZSA9IHNlbGYuY29udGFpbmVyLnN0eWxlOyAvLyBmb3IgZmFzdCBhY2Nlc3NcblxuXHRcdC8vIE9iamVjdHMgdGhhdCBob2xkIHNsaWRlcyAodGhlcmUgYXJlIG9ubHkgMyBpbiBET00pXG5cdFx0c2VsZi5pdGVtSG9sZGVycyA9IF9pdGVtSG9sZGVycyA9IFtcblx0XHRcdHtlbDpzZWxmLmNvbnRhaW5lci5jaGlsZHJlblswXSAsIHdyYXA6MCwgaW5kZXg6IC0xfSxcblx0XHRcdHtlbDpzZWxmLmNvbnRhaW5lci5jaGlsZHJlblsxXSAsIHdyYXA6MCwgaW5kZXg6IC0xfSxcblx0XHRcdHtlbDpzZWxmLmNvbnRhaW5lci5jaGlsZHJlblsyXSAsIHdyYXA6MCwgaW5kZXg6IC0xfVxuXHRcdF07XG5cblx0XHQvLyBoaWRlIG5lYXJieSBpdGVtIGhvbGRlcnMgdW50aWwgaW5pdGlhbCB6b29tIGFuaW1hdGlvbiBmaW5pc2hlcyAodG8gYXZvaWQgZXh0cmEgUGFpbnRzKVxuXHRcdF9pdGVtSG9sZGVyc1swXS5lbC5zdHlsZS5kaXNwbGF5ID0gX2l0ZW1Ib2xkZXJzWzJdLmVsLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG5cblx0XHRfc2V0dXBUcmFuc2Zvcm1zKCk7XG5cblx0XHQvLyBTZXR1cCBnbG9iYWwgZXZlbnRzXG5cdFx0X2dsb2JhbEV2ZW50SGFuZGxlcnMgPSB7XG5cdFx0XHRyZXNpemU6IHNlbGYudXBkYXRlU2l6ZSxcblxuXHRcdFx0Ly8gRml4ZXM6IGlPUyAxMC4zIHJlc2l6ZSBldmVudFxuXHRcdFx0Ly8gZG9lcyBub3QgdXBkYXRlIHNjcm9sbFdyYXAuY2xpZW50V2lkdGggaW5zdGFudGx5IGFmdGVyIHJlc2l6ZVxuXHRcdFx0Ly8gaHR0cHM6Ly9naXRodWIuY29tL2RpbXNlbWVub3YvUGhvdG9Td2lwZS9pc3N1ZXMvMTMxNVxuXHRcdFx0b3JpZW50YXRpb25jaGFuZ2U6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRjbGVhclRpbWVvdXQoX29yaWVudGF0aW9uQ2hhbmdlVGltZW91dCk7XG5cdFx0XHRcdF9vcmllbnRhdGlvbkNoYW5nZVRpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdGlmKF92aWV3cG9ydFNpemUueCAhPT0gc2VsZi5zY3JvbGxXcmFwLmNsaWVudFdpZHRoKSB7XG5cdFx0XHRcdFx0XHRzZWxmLnVwZGF0ZVNpemUoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sIDUwMCk7XG5cdFx0XHR9LFxuXHRcdFx0c2Nyb2xsOiBfdXBkYXRlUGFnZVNjcm9sbE9mZnNldCxcblx0XHRcdGtleWRvd246IF9vbktleURvd24sXG5cdFx0XHRjbGljazogX29uR2xvYmFsQ2xpY2tcblx0XHR9O1xuXG5cdFx0Ly8gZGlzYWJsZSBzaG93L2hpZGUgZWZmZWN0cyBvbiBvbGQgYnJvd3NlcnMgdGhhdCBkb24ndCBzdXBwb3J0IENTUyBhbmltYXRpb25zIG9yIHRyYW5zZm9ybXMsIFxuXHRcdC8vIG9sZCBJT1MsIEFuZHJvaWQgYW5kIE9wZXJhIG1vYmlsZS4gQmxhY2tiZXJyeSBzZWVtcyB0byB3b3JrIGZpbmUsIGV2ZW4gb2xkZXIgbW9kZWxzLlxuXHRcdHZhciBvbGRQaG9uZSA9IF9mZWF0dXJlcy5pc09sZElPU1Bob25lIHx8IF9mZWF0dXJlcy5pc09sZEFuZHJvaWQgfHwgX2ZlYXR1cmVzLmlzTW9iaWxlT3BlcmE7XG5cdFx0aWYoIV9mZWF0dXJlcy5hbmltYXRpb25OYW1lIHx8ICFfZmVhdHVyZXMudHJhbnNmb3JtIHx8IG9sZFBob25lKSB7XG5cdFx0XHRfb3B0aW9ucy5zaG93QW5pbWF0aW9uRHVyYXRpb24gPSBfb3B0aW9ucy5oaWRlQW5pbWF0aW9uRHVyYXRpb24gPSAwO1xuXHRcdH1cblxuXHRcdC8vIGluaXQgbW9kdWxlc1xuXHRcdGZvcihpID0gMDsgaSA8IF9tb2R1bGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRzZWxmWydpbml0JyArIF9tb2R1bGVzW2ldXSgpO1xuXHRcdH1cblx0XHRcblx0XHQvLyBpbml0XG5cdFx0aWYoVWlDbGFzcykge1xuXHRcdFx0dmFyIHVpID0gc2VsZi51aSA9IG5ldyBVaUNsYXNzKHNlbGYsIGZyYW1ld29yayk7XG5cdFx0XHR1aS5pbml0KCk7XG5cdFx0fVxuXG5cdFx0X3Nob3V0KCdmaXJzdFVwZGF0ZScpO1xuXHRcdF9jdXJyZW50SXRlbUluZGV4ID0gX2N1cnJlbnRJdGVtSW5kZXggfHwgX29wdGlvbnMuaW5kZXggfHwgMDtcblx0XHQvLyB2YWxpZGF0ZSBpbmRleFxuXHRcdGlmKCBpc05hTihfY3VycmVudEl0ZW1JbmRleCkgfHwgX2N1cnJlbnRJdGVtSW5kZXggPCAwIHx8IF9jdXJyZW50SXRlbUluZGV4ID49IF9nZXROdW1JdGVtcygpICkge1xuXHRcdFx0X2N1cnJlbnRJdGVtSW5kZXggPSAwO1xuXHRcdH1cblx0XHRzZWxmLmN1cnJJdGVtID0gX2dldEl0ZW1BdCggX2N1cnJlbnRJdGVtSW5kZXggKTtcblxuXHRcdFxuXHRcdGlmKF9mZWF0dXJlcy5pc09sZElPU1Bob25lIHx8IF9mZWF0dXJlcy5pc09sZEFuZHJvaWQpIHtcblx0XHRcdF9pc0ZpeGVkUG9zaXRpb24gPSBmYWxzZTtcblx0XHR9XG5cdFx0XG5cdFx0dGVtcGxhdGUuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsICdmYWxzZScpO1xuXHRcdGlmKF9vcHRpb25zLm1vZGFsKSB7XG5cdFx0XHRpZighX2lzRml4ZWRQb3NpdGlvbikge1xuXHRcdFx0XHR0ZW1wbGF0ZS5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG5cdFx0XHRcdHRlbXBsYXRlLnN0eWxlLnRvcCA9IGZyYW1ld29yay5nZXRTY3JvbGxZKCkgKyAncHgnO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGVtcGxhdGUuc3R5bGUucG9zaXRpb24gPSAnZml4ZWQnO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmKF9jdXJyZW50V2luZG93U2Nyb2xsWSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRfc2hvdXQoJ2luaXRpYWxMYXlvdXQnKTtcblx0XHRcdF9jdXJyZW50V2luZG93U2Nyb2xsWSA9IF9pbml0YWxXaW5kb3dTY3JvbGxZID0gZnJhbWV3b3JrLmdldFNjcm9sbFkoKTtcblx0XHR9XG5cdFx0XG5cdFx0Ly8gYWRkIGNsYXNzZXMgdG8gcm9vdCBlbGVtZW50IG9mIFBob3RvU3dpcGVcblx0XHR2YXIgcm9vdENsYXNzZXMgPSAncHN3cC0tb3BlbiAnO1xuXHRcdGlmKF9vcHRpb25zLm1haW5DbGFzcykge1xuXHRcdFx0cm9vdENsYXNzZXMgKz0gX29wdGlvbnMubWFpbkNsYXNzICsgJyAnO1xuXHRcdH1cblx0XHRpZihfb3B0aW9ucy5zaG93SGlkZU9wYWNpdHkpIHtcblx0XHRcdHJvb3RDbGFzc2VzICs9ICdwc3dwLS1hbmltYXRlX29wYWNpdHkgJztcblx0XHR9XG5cdFx0cm9vdENsYXNzZXMgKz0gX2xpa2VseVRvdWNoRGV2aWNlID8gJ3Bzd3AtLXRvdWNoJyA6ICdwc3dwLS1ub3RvdWNoJztcblx0XHRyb290Q2xhc3NlcyArPSBfZmVhdHVyZXMuYW5pbWF0aW9uTmFtZSA/ICcgcHN3cC0tY3NzX2FuaW1hdGlvbicgOiAnJztcblx0XHRyb290Q2xhc3NlcyArPSBfZmVhdHVyZXMuc3ZnID8gJyBwc3dwLS1zdmcnIDogJyc7XG5cdFx0ZnJhbWV3b3JrLmFkZENsYXNzKHRlbXBsYXRlLCByb290Q2xhc3Nlcyk7XG5cblx0XHRzZWxmLnVwZGF0ZVNpemUoKTtcblxuXHRcdC8vIGluaXRpYWwgdXBkYXRlXG5cdFx0X2NvbnRhaW5lclNoaWZ0SW5kZXggPSAtMTtcblx0XHRfaW5kZXhEaWZmID0gbnVsbDtcblx0XHRmb3IoaSA9IDA7IGkgPCBOVU1fSE9MREVSUzsgaSsrKSB7XG5cdFx0XHRfc2V0VHJhbnNsYXRlWCggKGkrX2NvbnRhaW5lclNoaWZ0SW5kZXgpICogX3NsaWRlU2l6ZS54LCBfaXRlbUhvbGRlcnNbaV0uZWwuc3R5bGUpO1xuXHRcdH1cblxuXHRcdGlmKCFfb2xkSUUpIHtcblx0XHRcdGZyYW1ld29yay5iaW5kKHNlbGYuc2Nyb2xsV3JhcCwgX2Rvd25FdmVudHMsIHNlbGYpOyAvLyBubyBkcmFnZ2luZyBmb3Igb2xkIElFXG5cdFx0fVx0XG5cblx0XHRfbGlzdGVuKCdpbml0aWFsWm9vbUluRW5kJywgZnVuY3Rpb24oKSB7XG5cdFx0XHRzZWxmLnNldENvbnRlbnQoX2l0ZW1Ib2xkZXJzWzBdLCBfY3VycmVudEl0ZW1JbmRleC0xKTtcblx0XHRcdHNlbGYuc2V0Q29udGVudChfaXRlbUhvbGRlcnNbMl0sIF9jdXJyZW50SXRlbUluZGV4KzEpO1xuXG5cdFx0XHRfaXRlbUhvbGRlcnNbMF0uZWwuc3R5bGUuZGlzcGxheSA9IF9pdGVtSG9sZGVyc1syXS5lbC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcblxuXHRcdFx0aWYoX29wdGlvbnMuZm9jdXMpIHtcblx0XHRcdFx0Ly8gZm9jdXMgY2F1c2VzIGxheW91dCwgXG5cdFx0XHRcdC8vIHdoaWNoIGNhdXNlcyBsYWcgZHVyaW5nIHRoZSBhbmltYXRpb24sIFxuXHRcdFx0XHQvLyB0aGF0J3Mgd2h5IHdlIGRlbGF5IGl0IHVudGlsbCB0aGUgaW5pdGlhbCB6b29tIHRyYW5zaXRpb24gZW5kc1xuXHRcdFx0XHR0ZW1wbGF0ZS5mb2N1cygpO1xuXHRcdFx0fVxuXHRcdFx0IFxuXG5cdFx0XHRfYmluZEV2ZW50cygpO1xuXHRcdH0pO1xuXG5cdFx0Ly8gc2V0IGNvbnRlbnQgZm9yIGNlbnRlciBzbGlkZSAoZmlyc3QgdGltZSlcblx0XHRzZWxmLnNldENvbnRlbnQoX2l0ZW1Ib2xkZXJzWzFdLCBfY3VycmVudEl0ZW1JbmRleCk7XG5cdFx0XG5cdFx0c2VsZi51cGRhdGVDdXJySXRlbSgpO1xuXG5cdFx0X3Nob3V0KCdhZnRlckluaXQnKTtcblxuXHRcdGlmKCFfaXNGaXhlZFBvc2l0aW9uKSB7XG5cblx0XHRcdC8vIE9uIGFsbCB2ZXJzaW9ucyBvZiBpT1MgbG93ZXIgdGhhbiA4LjAsIHdlIGNoZWNrIHNpemUgb2Ygdmlld3BvcnQgZXZlcnkgc2Vjb25kLlxuXHRcdFx0Ly8gXG5cdFx0XHQvLyBUaGlzIGlzIGRvbmUgdG8gZGV0ZWN0IHdoZW4gU2FmYXJpIHRvcCAmIGJvdHRvbSBiYXJzIGFwcGVhciwgXG5cdFx0XHQvLyBhcyB0aGlzIGFjdGlvbiBkb2Vzbid0IHRyaWdnZXIgYW55IGV2ZW50cyAobGlrZSByZXNpemUpLiBcblx0XHRcdC8vIFxuXHRcdFx0Ly8gT24gaU9TOCB0aGV5IGZpeGVkIHRoaXMuXG5cdFx0XHQvLyBcblx0XHRcdC8vIDEwIE5vdiAyMDE0OiBpT1MgNyB1c2FnZSB+NDAlLiBpT1MgOCB1c2FnZSA1NiUuXG5cdFx0XHRcblx0XHRcdF91cGRhdGVTaXplSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcblx0XHRcdFx0aWYoIV9udW1BbmltYXRpb25zICYmICFfaXNEcmFnZ2luZyAmJiAhX2lzWm9vbWluZyAmJiAoX2N1cnJab29tTGV2ZWwgPT09IHNlbGYuY3Vyckl0ZW0uaW5pdGlhbFpvb21MZXZlbCkgICkge1xuXHRcdFx0XHRcdHNlbGYudXBkYXRlU2l6ZSgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9LCAxMDAwKTtcblx0XHR9XG5cblx0XHRmcmFtZXdvcmsuYWRkQ2xhc3ModGVtcGxhdGUsICdwc3dwLS12aXNpYmxlJyk7XG5cdH0sXG5cblx0Ly8gQ2xvc2UgdGhlIGdhbGxlcnksIHRoZW4gZGVzdHJveSBpdFxuXHRjbG9zZTogZnVuY3Rpb24oKSB7XG5cdFx0aWYoIV9pc09wZW4pIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRfaXNPcGVuID0gZmFsc2U7XG5cdFx0X2lzRGVzdHJveWluZyA9IHRydWU7XG5cdFx0X3Nob3V0KCdjbG9zZScpO1xuXHRcdF91bmJpbmRFdmVudHMoKTtcblxuXHRcdF9zaG93T3JIaWRlKHNlbGYuY3Vyckl0ZW0sIG51bGwsIHRydWUsIHNlbGYuZGVzdHJveSk7XG5cdH0sXG5cblx0Ly8gZGVzdHJveXMgdGhlIGdhbGxlcnkgKHVuYmluZHMgZXZlbnRzLCBjbGVhbnMgdXAgaW50ZXJ2YWxzIGFuZCB0aW1lb3V0cyB0byBhdm9pZCBtZW1vcnkgbGVha3MpXG5cdGRlc3Ryb3k6IGZ1bmN0aW9uKCkge1xuXHRcdF9zaG91dCgnZGVzdHJveScpO1xuXG5cdFx0aWYoX3Nob3dPckhpZGVUaW1lb3V0KSB7XG5cdFx0XHRjbGVhclRpbWVvdXQoX3Nob3dPckhpZGVUaW1lb3V0KTtcblx0XHR9XG5cdFx0XG5cdFx0dGVtcGxhdGUuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsICd0cnVlJyk7XG5cdFx0dGVtcGxhdGUuY2xhc3NOYW1lID0gX2luaXRhbENsYXNzTmFtZTtcblxuXHRcdGlmKF91cGRhdGVTaXplSW50ZXJ2YWwpIHtcblx0XHRcdGNsZWFySW50ZXJ2YWwoX3VwZGF0ZVNpemVJbnRlcnZhbCk7XG5cdFx0fVxuXG5cdFx0ZnJhbWV3b3JrLnVuYmluZChzZWxmLnNjcm9sbFdyYXAsIF9kb3duRXZlbnRzLCBzZWxmKTtcblxuXHRcdC8vIHdlIHVuYmluZCBzY3JvbGwgZXZlbnQgYXQgdGhlIGVuZCwgYXMgY2xvc2luZyBhbmltYXRpb24gbWF5IGRlcGVuZCBvbiBpdFxuXHRcdGZyYW1ld29yay51bmJpbmQod2luZG93LCAnc2Nyb2xsJywgc2VsZik7XG5cblx0XHRfc3RvcERyYWdVcGRhdGVMb29wKCk7XG5cblx0XHRfc3RvcEFsbEFuaW1hdGlvbnMoKTtcblxuXHRcdF9saXN0ZW5lcnMgPSBudWxsO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBQYW4gaW1hZ2UgdG8gcG9zaXRpb25cblx0ICogQHBhcmFtIHtOdW1iZXJ9IHggICAgIFxuXHQgKiBAcGFyYW0ge051bWJlcn0geSAgICAgXG5cdCAqIEBwYXJhbSB7Qm9vbGVhbn0gZm9yY2UgV2lsbCBpZ25vcmUgYm91bmRzIGlmIHNldCB0byB0cnVlLlxuXHQgKi9cblx0cGFuVG86IGZ1bmN0aW9uKHgseSxmb3JjZSkge1xuXHRcdGlmKCFmb3JjZSkge1xuXHRcdFx0aWYoeCA+IF9jdXJyUGFuQm91bmRzLm1pbi54KSB7XG5cdFx0XHRcdHggPSBfY3VyclBhbkJvdW5kcy5taW4ueDtcblx0XHRcdH0gZWxzZSBpZih4IDwgX2N1cnJQYW5Cb3VuZHMubWF4LngpIHtcblx0XHRcdFx0eCA9IF9jdXJyUGFuQm91bmRzLm1heC54O1xuXHRcdFx0fVxuXG5cdFx0XHRpZih5ID4gX2N1cnJQYW5Cb3VuZHMubWluLnkpIHtcblx0XHRcdFx0eSA9IF9jdXJyUGFuQm91bmRzLm1pbi55O1xuXHRcdFx0fSBlbHNlIGlmKHkgPCBfY3VyclBhbkJvdW5kcy5tYXgueSkge1xuXHRcdFx0XHR5ID0gX2N1cnJQYW5Cb3VuZHMubWF4Lnk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdFxuXHRcdF9wYW5PZmZzZXQueCA9IHg7XG5cdFx0X3Bhbk9mZnNldC55ID0geTtcblx0XHRfYXBwbHlDdXJyZW50Wm9vbVBhbigpO1xuXHR9LFxuXHRcblx0aGFuZGxlRXZlbnQ6IGZ1bmN0aW9uIChlKSB7XG5cdFx0ZSA9IGUgfHwgd2luZG93LmV2ZW50O1xuXHRcdGlmKF9nbG9iYWxFdmVudEhhbmRsZXJzW2UudHlwZV0pIHtcblx0XHRcdF9nbG9iYWxFdmVudEhhbmRsZXJzW2UudHlwZV0oZSk7XG5cdFx0fVxuXHR9LFxuXG5cblx0Z29UbzogZnVuY3Rpb24oaW5kZXgpIHtcblxuXHRcdGluZGV4ID0gX2dldExvb3BlZElkKGluZGV4KTtcblxuXHRcdHZhciBkaWZmID0gaW5kZXggLSBfY3VycmVudEl0ZW1JbmRleDtcblx0XHRfaW5kZXhEaWZmID0gZGlmZjtcblxuXHRcdF9jdXJyZW50SXRlbUluZGV4ID0gaW5kZXg7XG5cdFx0c2VsZi5jdXJySXRlbSA9IF9nZXRJdGVtQXQoIF9jdXJyZW50SXRlbUluZGV4ICk7XG5cdFx0X2N1cnJQb3NpdGlvbkluZGV4IC09IGRpZmY7XG5cdFx0XG5cdFx0X21vdmVNYWluU2Nyb2xsKF9zbGlkZVNpemUueCAqIF9jdXJyUG9zaXRpb25JbmRleCk7XG5cdFx0XG5cblx0XHRfc3RvcEFsbEFuaW1hdGlvbnMoKTtcblx0XHRfbWFpblNjcm9sbEFuaW1hdGluZyA9IGZhbHNlO1xuXG5cdFx0c2VsZi51cGRhdGVDdXJySXRlbSgpO1xuXHR9LFxuXHRuZXh0OiBmdW5jdGlvbigpIHtcblx0XHRzZWxmLmdvVG8oIF9jdXJyZW50SXRlbUluZGV4ICsgMSk7XG5cdH0sXG5cdHByZXY6IGZ1bmN0aW9uKCkge1xuXHRcdHNlbGYuZ29UbyggX2N1cnJlbnRJdGVtSW5kZXggLSAxKTtcblx0fSxcblxuXHQvLyB1cGRhdGUgY3VycmVudCB6b29tL3BhbiBvYmplY3RzXG5cdHVwZGF0ZUN1cnJab29tSXRlbTogZnVuY3Rpb24oZW11bGF0ZVNldENvbnRlbnQpIHtcblx0XHRpZihlbXVsYXRlU2V0Q29udGVudCkge1xuXHRcdFx0X3Nob3V0KCdiZWZvcmVDaGFuZ2UnLCAwKTtcblx0XHR9XG5cblx0XHQvLyBpdGVtSG9sZGVyWzFdIGlzIG1pZGRsZSAoY3VycmVudCkgaXRlbVxuXHRcdGlmKF9pdGVtSG9sZGVyc1sxXS5lbC5jaGlsZHJlbi5sZW5ndGgpIHtcblx0XHRcdHZhciB6b29tRWxlbWVudCA9IF9pdGVtSG9sZGVyc1sxXS5lbC5jaGlsZHJlblswXTtcblx0XHRcdGlmKCBmcmFtZXdvcmsuaGFzQ2xhc3Moem9vbUVsZW1lbnQsICdwc3dwX196b29tLXdyYXAnKSApIHtcblx0XHRcdFx0X2N1cnJab29tRWxlbWVudFN0eWxlID0gem9vbUVsZW1lbnQuc3R5bGU7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRfY3Vyclpvb21FbGVtZW50U3R5bGUgPSBudWxsO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRfY3Vyclpvb21FbGVtZW50U3R5bGUgPSBudWxsO1xuXHRcdH1cblx0XHRcblx0XHRfY3VyclBhbkJvdW5kcyA9IHNlbGYuY3Vyckl0ZW0uYm91bmRzO1x0XG5cdFx0X3N0YXJ0Wm9vbUxldmVsID0gX2N1cnJab29tTGV2ZWwgPSBzZWxmLmN1cnJJdGVtLmluaXRpYWxab29tTGV2ZWw7XG5cblx0XHRfcGFuT2Zmc2V0LnggPSBfY3VyclBhbkJvdW5kcy5jZW50ZXIueDtcblx0XHRfcGFuT2Zmc2V0LnkgPSBfY3VyclBhbkJvdW5kcy5jZW50ZXIueTtcblxuXHRcdGlmKGVtdWxhdGVTZXRDb250ZW50KSB7XG5cdFx0XHRfc2hvdXQoJ2FmdGVyQ2hhbmdlJyk7XG5cdFx0fVxuXHR9LFxuXG5cblx0aW52YWxpZGF0ZUN1cnJJdGVtczogZnVuY3Rpb24oKSB7XG5cdFx0X2l0ZW1zTmVlZFVwZGF0ZSA9IHRydWU7XG5cdFx0Zm9yKHZhciBpID0gMDsgaSA8IE5VTV9IT0xERVJTOyBpKyspIHtcblx0XHRcdGlmKCBfaXRlbUhvbGRlcnNbaV0uaXRlbSApIHtcblx0XHRcdFx0X2l0ZW1Ib2xkZXJzW2ldLml0ZW0ubmVlZHNVcGRhdGUgPSB0cnVlO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblxuXHR1cGRhdGVDdXJySXRlbTogZnVuY3Rpb24oYmVmb3JlQW5pbWF0aW9uKSB7XG5cblx0XHRpZihfaW5kZXhEaWZmID09PSAwKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dmFyIGRpZmZBYnMgPSBNYXRoLmFicyhfaW5kZXhEaWZmKSxcblx0XHRcdHRlbXBIb2xkZXI7XG5cblx0XHRpZihiZWZvcmVBbmltYXRpb24gJiYgZGlmZkFicyA8IDIpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblxuXHRcdHNlbGYuY3Vyckl0ZW0gPSBfZ2V0SXRlbUF0KCBfY3VycmVudEl0ZW1JbmRleCApO1xuXHRcdF9yZW5kZXJNYXhSZXNvbHV0aW9uID0gZmFsc2U7XG5cdFx0XG5cdFx0X3Nob3V0KCdiZWZvcmVDaGFuZ2UnLCBfaW5kZXhEaWZmKTtcblxuXHRcdGlmKGRpZmZBYnMgPj0gTlVNX0hPTERFUlMpIHtcblx0XHRcdF9jb250YWluZXJTaGlmdEluZGV4ICs9IF9pbmRleERpZmYgKyAoX2luZGV4RGlmZiA+IDAgPyAtTlVNX0hPTERFUlMgOiBOVU1fSE9MREVSUyk7XG5cdFx0XHRkaWZmQWJzID0gTlVNX0hPTERFUlM7XG5cdFx0fVxuXHRcdGZvcih2YXIgaSA9IDA7IGkgPCBkaWZmQWJzOyBpKyspIHtcblx0XHRcdGlmKF9pbmRleERpZmYgPiAwKSB7XG5cdFx0XHRcdHRlbXBIb2xkZXIgPSBfaXRlbUhvbGRlcnMuc2hpZnQoKTtcblx0XHRcdFx0X2l0ZW1Ib2xkZXJzW05VTV9IT0xERVJTLTFdID0gdGVtcEhvbGRlcjsgLy8gbW92ZSBmaXJzdCB0byBsYXN0XG5cblx0XHRcdFx0X2NvbnRhaW5lclNoaWZ0SW5kZXgrKztcblx0XHRcdFx0X3NldFRyYW5zbGF0ZVgoIChfY29udGFpbmVyU2hpZnRJbmRleCsyKSAqIF9zbGlkZVNpemUueCwgdGVtcEhvbGRlci5lbC5zdHlsZSk7XG5cdFx0XHRcdHNlbGYuc2V0Q29udGVudCh0ZW1wSG9sZGVyLCBfY3VycmVudEl0ZW1JbmRleCAtIGRpZmZBYnMgKyBpICsgMSArIDEpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGVtcEhvbGRlciA9IF9pdGVtSG9sZGVycy5wb3AoKTtcblx0XHRcdFx0X2l0ZW1Ib2xkZXJzLnVuc2hpZnQoIHRlbXBIb2xkZXIgKTsgLy8gbW92ZSBsYXN0IHRvIGZpcnN0XG5cblx0XHRcdFx0X2NvbnRhaW5lclNoaWZ0SW5kZXgtLTtcblx0XHRcdFx0X3NldFRyYW5zbGF0ZVgoIF9jb250YWluZXJTaGlmdEluZGV4ICogX3NsaWRlU2l6ZS54LCB0ZW1wSG9sZGVyLmVsLnN0eWxlKTtcblx0XHRcdFx0c2VsZi5zZXRDb250ZW50KHRlbXBIb2xkZXIsIF9jdXJyZW50SXRlbUluZGV4ICsgZGlmZkFicyAtIGkgLSAxIC0gMSk7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHR9XG5cblx0XHQvLyByZXNldCB6b29tL3BhbiBvbiBwcmV2aW91cyBpdGVtXG5cdFx0aWYoX2N1cnJab29tRWxlbWVudFN0eWxlICYmIE1hdGguYWJzKF9pbmRleERpZmYpID09PSAxKSB7XG5cblx0XHRcdHZhciBwcmV2SXRlbSA9IF9nZXRJdGVtQXQoX3ByZXZJdGVtSW5kZXgpO1xuXHRcdFx0aWYocHJldkl0ZW0uaW5pdGlhbFpvb21MZXZlbCAhPT0gX2N1cnJab29tTGV2ZWwpIHtcblx0XHRcdFx0X2NhbGN1bGF0ZUl0ZW1TaXplKHByZXZJdGVtICwgX3ZpZXdwb3J0U2l6ZSApO1xuXHRcdFx0XHRfc2V0SW1hZ2VTaXplKHByZXZJdGVtKTtcblx0XHRcdFx0X2FwcGx5Wm9vbVBhblRvSXRlbSggcHJldkl0ZW0gKTsgXHRcdFx0XHRcblx0XHRcdH1cblxuXHRcdH1cblxuXHRcdC8vIHJlc2V0IGRpZmYgYWZ0ZXIgdXBkYXRlXG5cdFx0X2luZGV4RGlmZiA9IDA7XG5cblx0XHRzZWxmLnVwZGF0ZUN1cnJab29tSXRlbSgpO1xuXG5cdFx0X3ByZXZJdGVtSW5kZXggPSBfY3VycmVudEl0ZW1JbmRleDtcblxuXHRcdF9zaG91dCgnYWZ0ZXJDaGFuZ2UnKTtcblx0XHRcblx0fSxcblxuXG5cblx0dXBkYXRlU2l6ZTogZnVuY3Rpb24oZm9yY2UpIHtcblx0XHRcblx0XHRpZighX2lzRml4ZWRQb3NpdGlvbiAmJiBfb3B0aW9ucy5tb2RhbCkge1xuXHRcdFx0dmFyIHdpbmRvd1Njcm9sbFkgPSBmcmFtZXdvcmsuZ2V0U2Nyb2xsWSgpO1xuXHRcdFx0aWYoX2N1cnJlbnRXaW5kb3dTY3JvbGxZICE9PSB3aW5kb3dTY3JvbGxZKSB7XG5cdFx0XHRcdHRlbXBsYXRlLnN0eWxlLnRvcCA9IHdpbmRvd1Njcm9sbFkgKyAncHgnO1xuXHRcdFx0XHRfY3VycmVudFdpbmRvd1Njcm9sbFkgPSB3aW5kb3dTY3JvbGxZO1xuXHRcdFx0fVxuXHRcdFx0aWYoIWZvcmNlICYmIF93aW5kb3dWaXNpYmxlU2l6ZS54ID09PSB3aW5kb3cuaW5uZXJXaWR0aCAmJiBfd2luZG93VmlzaWJsZVNpemUueSA9PT0gd2luZG93LmlubmVySGVpZ2h0KSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdF93aW5kb3dWaXNpYmxlU2l6ZS54ID0gd2luZG93LmlubmVyV2lkdGg7XG5cdFx0XHRfd2luZG93VmlzaWJsZVNpemUueSA9IHdpbmRvdy5pbm5lckhlaWdodDtcblxuXHRcdFx0Ly90ZW1wbGF0ZS5zdHlsZS53aWR0aCA9IF93aW5kb3dWaXNpYmxlU2l6ZS54ICsgJ3B4Jztcblx0XHRcdHRlbXBsYXRlLnN0eWxlLmhlaWdodCA9IF93aW5kb3dWaXNpYmxlU2l6ZS55ICsgJ3B4Jztcblx0XHR9XG5cblxuXG5cdFx0X3ZpZXdwb3J0U2l6ZS54ID0gc2VsZi5zY3JvbGxXcmFwLmNsaWVudFdpZHRoO1xuXHRcdF92aWV3cG9ydFNpemUueSA9IHNlbGYuc2Nyb2xsV3JhcC5jbGllbnRIZWlnaHQ7XG5cblx0XHRfdXBkYXRlUGFnZVNjcm9sbE9mZnNldCgpO1xuXG5cdFx0X3NsaWRlU2l6ZS54ID0gX3ZpZXdwb3J0U2l6ZS54ICsgTWF0aC5yb3VuZChfdmlld3BvcnRTaXplLnggKiBfb3B0aW9ucy5zcGFjaW5nKTtcblx0XHRfc2xpZGVTaXplLnkgPSBfdmlld3BvcnRTaXplLnk7XG5cblx0XHRfbW92ZU1haW5TY3JvbGwoX3NsaWRlU2l6ZS54ICogX2N1cnJQb3NpdGlvbkluZGV4KTtcblxuXHRcdF9zaG91dCgnYmVmb3JlUmVzaXplJyk7IC8vIGV2ZW4gbWF5IGJlIHVzZWQgZm9yIGV4YW1wbGUgdG8gc3dpdGNoIGltYWdlIHNvdXJjZXNcblxuXG5cdFx0Ly8gZG9uJ3QgcmUtY2FsY3VsYXRlIHNpemUgb24gaW5pdGFsIHNpemUgdXBkYXRlXG5cdFx0aWYoX2NvbnRhaW5lclNoaWZ0SW5kZXggIT09IHVuZGVmaW5lZCkge1xuXG5cdFx0XHR2YXIgaG9sZGVyLFxuXHRcdFx0XHRpdGVtLFxuXHRcdFx0XHRoSW5kZXg7XG5cblx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCBOVU1fSE9MREVSUzsgaSsrKSB7XG5cdFx0XHRcdGhvbGRlciA9IF9pdGVtSG9sZGVyc1tpXTtcblx0XHRcdFx0X3NldFRyYW5zbGF0ZVgoIChpK19jb250YWluZXJTaGlmdEluZGV4KSAqIF9zbGlkZVNpemUueCwgaG9sZGVyLmVsLnN0eWxlKTtcblxuXHRcdFx0XHRoSW5kZXggPSBfY3VycmVudEl0ZW1JbmRleCtpLTE7XG5cblx0XHRcdFx0aWYoX29wdGlvbnMubG9vcCAmJiBfZ2V0TnVtSXRlbXMoKSA+IDIpIHtcblx0XHRcdFx0XHRoSW5kZXggPSBfZ2V0TG9vcGVkSWQoaEluZGV4KTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIHVwZGF0ZSB6b29tIGxldmVsIG9uIGl0ZW1zIGFuZCByZWZyZXNoIHNvdXJjZSAoaWYgbmVlZHNVcGRhdGUpXG5cdFx0XHRcdGl0ZW0gPSBfZ2V0SXRlbUF0KCBoSW5kZXggKTtcblxuXHRcdFx0XHQvLyByZS1yZW5kZXIgZ2FsbGVyeSBpdGVtIGlmIGBuZWVkc1VwZGF0ZWAsXG5cdFx0XHRcdC8vIG9yIGRvZXNuJ3QgaGF2ZSBgYm91bmRzYCAoZW50aXJlbHkgbmV3IHNsaWRlIG9iamVjdClcblx0XHRcdFx0aWYoIGl0ZW0gJiYgKF9pdGVtc05lZWRVcGRhdGUgfHwgaXRlbS5uZWVkc1VwZGF0ZSB8fCAhaXRlbS5ib3VuZHMpICkge1xuXG5cdFx0XHRcdFx0c2VsZi5jbGVhblNsaWRlKCBpdGVtICk7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0c2VsZi5zZXRDb250ZW50KCBob2xkZXIsIGhJbmRleCApO1xuXG5cdFx0XHRcdFx0Ly8gaWYgXCJjZW50ZXJcIiBzbGlkZVxuXHRcdFx0XHRcdGlmKGkgPT09IDEpIHtcblx0XHRcdFx0XHRcdHNlbGYuY3Vyckl0ZW0gPSBpdGVtO1xuXHRcdFx0XHRcdFx0c2VsZi51cGRhdGVDdXJyWm9vbUl0ZW0odHJ1ZSk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aXRlbS5uZWVkc1VwZGF0ZSA9IGZhbHNlO1xuXG5cdFx0XHRcdH0gZWxzZSBpZihob2xkZXIuaW5kZXggPT09IC0xICYmIGhJbmRleCA+PSAwKSB7XG5cdFx0XHRcdFx0Ly8gYWRkIGNvbnRlbnQgZmlyc3QgdGltZVxuXHRcdFx0XHRcdHNlbGYuc2V0Q29udGVudCggaG9sZGVyLCBoSW5kZXggKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZihpdGVtICYmIGl0ZW0uY29udGFpbmVyKSB7XG5cdFx0XHRcdFx0X2NhbGN1bGF0ZUl0ZW1TaXplKGl0ZW0sIF92aWV3cG9ydFNpemUpO1xuXHRcdFx0XHRcdF9zZXRJbWFnZVNpemUoaXRlbSk7XG5cdFx0XHRcdFx0X2FwcGx5Wm9vbVBhblRvSXRlbSggaXRlbSApO1xuXHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0fVxuXHRcdFx0X2l0ZW1zTmVlZFVwZGF0ZSA9IGZhbHNlO1xuXHRcdH1cdFxuXG5cdFx0X3N0YXJ0Wm9vbUxldmVsID0gX2N1cnJab29tTGV2ZWwgPSBzZWxmLmN1cnJJdGVtLmluaXRpYWxab29tTGV2ZWw7XG5cdFx0X2N1cnJQYW5Cb3VuZHMgPSBzZWxmLmN1cnJJdGVtLmJvdW5kcztcblxuXHRcdGlmKF9jdXJyUGFuQm91bmRzKSB7XG5cdFx0XHRfcGFuT2Zmc2V0LnggPSBfY3VyclBhbkJvdW5kcy5jZW50ZXIueDtcblx0XHRcdF9wYW5PZmZzZXQueSA9IF9jdXJyUGFuQm91bmRzLmNlbnRlci55O1xuXHRcdFx0X2FwcGx5Q3VycmVudFpvb21QYW4oIHRydWUgKTtcblx0XHR9XG5cdFx0XG5cdFx0X3Nob3V0KCdyZXNpemUnKTtcblx0fSxcblx0XG5cdC8vIFpvb20gY3VycmVudCBpdGVtIHRvXG5cdHpvb21UbzogZnVuY3Rpb24oZGVzdFpvb21MZXZlbCwgY2VudGVyUG9pbnQsIHNwZWVkLCBlYXNpbmdGbiwgdXBkYXRlRm4pIHtcblx0XHQvKlxuXHRcdFx0aWYoZGVzdFpvb21MZXZlbCA9PT0gJ2ZpdCcpIHtcblx0XHRcdFx0ZGVzdFpvb21MZXZlbCA9IHNlbGYuY3Vyckl0ZW0uZml0UmF0aW87XG5cdFx0XHR9IGVsc2UgaWYoZGVzdFpvb21MZXZlbCA9PT0gJ2ZpbGwnKSB7XG5cdFx0XHRcdGRlc3Rab29tTGV2ZWwgPSBzZWxmLmN1cnJJdGVtLmZpbGxSYXRpbztcblx0XHRcdH1cblx0XHQqL1xuXG5cdFx0aWYoY2VudGVyUG9pbnQpIHtcblx0XHRcdF9zdGFydFpvb21MZXZlbCA9IF9jdXJyWm9vbUxldmVsO1xuXHRcdFx0X21pZFpvb21Qb2ludC54ID0gTWF0aC5hYnMoY2VudGVyUG9pbnQueCkgLSBfcGFuT2Zmc2V0LnggO1xuXHRcdFx0X21pZFpvb21Qb2ludC55ID0gTWF0aC5hYnMoY2VudGVyUG9pbnQueSkgLSBfcGFuT2Zmc2V0LnkgO1xuXHRcdFx0X2VxdWFsaXplUG9pbnRzKF9zdGFydFBhbk9mZnNldCwgX3Bhbk9mZnNldCk7XG5cdFx0fVxuXG5cdFx0dmFyIGRlc3RQYW5Cb3VuZHMgPSBfY2FsY3VsYXRlUGFuQm91bmRzKGRlc3Rab29tTGV2ZWwsIGZhbHNlKSxcblx0XHRcdGRlc3RQYW5PZmZzZXQgPSB7fTtcblxuXHRcdF9tb2RpZnlEZXN0UGFuT2Zmc2V0KCd4JywgZGVzdFBhbkJvdW5kcywgZGVzdFBhbk9mZnNldCwgZGVzdFpvb21MZXZlbCk7XG5cdFx0X21vZGlmeURlc3RQYW5PZmZzZXQoJ3knLCBkZXN0UGFuQm91bmRzLCBkZXN0UGFuT2Zmc2V0LCBkZXN0Wm9vbUxldmVsKTtcblxuXHRcdHZhciBpbml0aWFsWm9vbUxldmVsID0gX2N1cnJab29tTGV2ZWw7XG5cdFx0dmFyIGluaXRpYWxQYW5PZmZzZXQgPSB7XG5cdFx0XHR4OiBfcGFuT2Zmc2V0LngsXG5cdFx0XHR5OiBfcGFuT2Zmc2V0Lnlcblx0XHR9O1xuXG5cdFx0X3JvdW5kUG9pbnQoZGVzdFBhbk9mZnNldCk7XG5cblx0XHR2YXIgb25VcGRhdGUgPSBmdW5jdGlvbihub3cpIHtcblx0XHRcdGlmKG5vdyA9PT0gMSkge1xuXHRcdFx0XHRfY3Vyclpvb21MZXZlbCA9IGRlc3Rab29tTGV2ZWw7XG5cdFx0XHRcdF9wYW5PZmZzZXQueCA9IGRlc3RQYW5PZmZzZXQueDtcblx0XHRcdFx0X3Bhbk9mZnNldC55ID0gZGVzdFBhbk9mZnNldC55O1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0X2N1cnJab29tTGV2ZWwgPSAoZGVzdFpvb21MZXZlbCAtIGluaXRpYWxab29tTGV2ZWwpICogbm93ICsgaW5pdGlhbFpvb21MZXZlbDtcblx0XHRcdFx0X3Bhbk9mZnNldC54ID0gKGRlc3RQYW5PZmZzZXQueCAtIGluaXRpYWxQYW5PZmZzZXQueCkgKiBub3cgKyBpbml0aWFsUGFuT2Zmc2V0Lng7XG5cdFx0XHRcdF9wYW5PZmZzZXQueSA9IChkZXN0UGFuT2Zmc2V0LnkgLSBpbml0aWFsUGFuT2Zmc2V0LnkpICogbm93ICsgaW5pdGlhbFBhbk9mZnNldC55O1xuXHRcdFx0fVxuXG5cdFx0XHRpZih1cGRhdGVGbikge1xuXHRcdFx0XHR1cGRhdGVGbihub3cpO1xuXHRcdFx0fVxuXG5cdFx0XHRfYXBwbHlDdXJyZW50Wm9vbVBhbiggbm93ID09PSAxICk7XG5cdFx0fTtcblxuXHRcdGlmKHNwZWVkKSB7XG5cdFx0XHRfYW5pbWF0ZVByb3AoJ2N1c3RvbVpvb21UbycsIDAsIDEsIHNwZWVkLCBlYXNpbmdGbiB8fCBmcmFtZXdvcmsuZWFzaW5nLnNpbmUuaW5PdXQsIG9uVXBkYXRlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0b25VcGRhdGUoMSk7XG5cdFx0fVxuXHR9XG5cblxufTtcblxuXG4vKj4+Y29yZSovXG5cbi8qPj5nZXN0dXJlcyovXG4vKipcbiAqIE1vdXNlL3RvdWNoL3BvaW50ZXIgZXZlbnQgaGFuZGxlcnMuXG4gKiBcbiAqIHNlcGFyYXRlZCBmcm9tIEBjb3JlLmpzIGZvciByZWFkYWJpbGl0eVxuICovXG5cbnZhciBNSU5fU1dJUEVfRElTVEFOQ0UgPSAzMCxcblx0RElSRUNUSU9OX0NIRUNLX09GRlNFVCA9IDEwOyAvLyBhbW91bnQgb2YgcGl4ZWxzIHRvIGRyYWcgdG8gZGV0ZXJtaW5lIGRpcmVjdGlvbiBvZiBzd2lwZVxuXG52YXIgX2dlc3R1cmVTdGFydFRpbWUsXG5cdF9nZXN0dXJlQ2hlY2tTcGVlZFRpbWUsXG5cblx0Ly8gcG9vbCBvZiBvYmplY3RzIHRoYXQgYXJlIHVzZWQgZHVyaW5nIGRyYWdnaW5nIG9mIHpvb21pbmdcblx0cCA9IHt9LCAvLyBmaXJzdCBwb2ludFxuXHRwMiA9IHt9LCAvLyBzZWNvbmQgcG9pbnQgKGZvciB6b29tIGdlc3R1cmUpXG5cdGRlbHRhID0ge30sXG5cdF9jdXJyUG9pbnQgPSB7fSxcblx0X3N0YXJ0UG9pbnQgPSB7fSxcblx0X2N1cnJQb2ludGVycyA9IFtdLFxuXHRfc3RhcnRNYWluU2Nyb2xsUG9zID0ge30sXG5cdF9yZWxlYXNlQW5pbURhdGEsXG5cdF9wb3NQb2ludHMgPSBbXSwgLy8gYXJyYXkgb2YgcG9pbnRzIGR1cmluZyBkcmFnZ2luZywgdXNlZCB0byBkZXRlcm1pbmUgdHlwZSBvZiBnZXN0dXJlXG5cdF90ZW1wUG9pbnQgPSB7fSxcblxuXHRfaXNab29taW5nSW4sXG5cdF92ZXJ0aWNhbERyYWdJbml0aWF0ZWQsXG5cdF9vbGRBbmRyb2lkVG91Y2hFbmRUaW1lb3V0LFxuXHRfY3Vyclpvb21lZEl0ZW1JbmRleCA9IDAsXG5cdF9jZW50ZXJQb2ludCA9IF9nZXRFbXB0eVBvaW50KCksXG5cdF9sYXN0UmVsZWFzZVRpbWUgPSAwLFxuXHRfaXNEcmFnZ2luZywgLy8gYXQgbGVhc3Qgb25lIHBvaW50ZXIgaXMgZG93blxuXHRfaXNNdWx0aXRvdWNoLCAvLyBhdCBsZWFzdCB0d28gX3BvaW50ZXJzIGFyZSBkb3duXG5cdF96b29tU3RhcnRlZCwgLy8gem9vbSBsZXZlbCBjaGFuZ2VkIGR1cmluZyB6b29tIGdlc3R1cmVcblx0X21vdmVkLFxuXHRfZHJhZ0FuaW1GcmFtZSxcblx0X21haW5TY3JvbGxTaGlmdGVkLFxuXHRfY3VycmVudFBvaW50cywgLy8gYXJyYXkgb2YgY3VycmVudCB0b3VjaCBwb2ludHNcblx0X2lzWm9vbWluZyxcblx0X2N1cnJQb2ludHNEaXN0YW5jZSxcblx0X3N0YXJ0UG9pbnRzRGlzdGFuY2UsXG5cdF9jdXJyUGFuQm91bmRzLFxuXHRfbWFpblNjcm9sbFBvcyA9IF9nZXRFbXB0eVBvaW50KCksXG5cdF9jdXJyWm9vbUVsZW1lbnRTdHlsZSxcblx0X21haW5TY3JvbGxBbmltYXRpbmcsIC8vIHRydWUsIGlmIGFuaW1hdGlvbiBhZnRlciBzd2lwZSBnZXN0dXJlIGlzIHJ1bm5pbmdcblx0X21pZFpvb21Qb2ludCA9IF9nZXRFbXB0eVBvaW50KCksXG5cdF9jdXJyQ2VudGVyUG9pbnQgPSBfZ2V0RW1wdHlQb2ludCgpLFxuXHRfZGlyZWN0aW9uLFxuXHRfaXNGaXJzdE1vdmUsXG5cdF9vcGFjaXR5Q2hhbmdlZCxcblx0X2JnT3BhY2l0eSxcblx0X3dhc092ZXJJbml0aWFsWm9vbSxcblxuXHRfaXNFcXVhbFBvaW50cyA9IGZ1bmN0aW9uKHAxLCBwMikge1xuXHRcdHJldHVybiBwMS54ID09PSBwMi54ICYmIHAxLnkgPT09IHAyLnk7XG5cdH0sXG5cdF9pc05lYXJieVBvaW50cyA9IGZ1bmN0aW9uKHRvdWNoMCwgdG91Y2gxKSB7XG5cdFx0cmV0dXJuIE1hdGguYWJzKHRvdWNoMC54IC0gdG91Y2gxLngpIDwgRE9VQkxFX1RBUF9SQURJVVMgJiYgTWF0aC5hYnModG91Y2gwLnkgLSB0b3VjaDEueSkgPCBET1VCTEVfVEFQX1JBRElVUztcblx0fSxcblx0X2NhbGN1bGF0ZVBvaW50c0Rpc3RhbmNlID0gZnVuY3Rpb24ocDEsIHAyKSB7XG5cdFx0X3RlbXBQb2ludC54ID0gTWF0aC5hYnMoIHAxLnggLSBwMi54ICk7XG5cdFx0X3RlbXBQb2ludC55ID0gTWF0aC5hYnMoIHAxLnkgLSBwMi55ICk7XG5cdFx0cmV0dXJuIE1hdGguc3FydChfdGVtcFBvaW50LnggKiBfdGVtcFBvaW50LnggKyBfdGVtcFBvaW50LnkgKiBfdGVtcFBvaW50LnkpO1xuXHR9LFxuXHRfc3RvcERyYWdVcGRhdGVMb29wID0gZnVuY3Rpb24oKSB7XG5cdFx0aWYoX2RyYWdBbmltRnJhbWUpIHtcblx0XHRcdF9jYW5jZWxBRihfZHJhZ0FuaW1GcmFtZSk7XG5cdFx0XHRfZHJhZ0FuaW1GcmFtZSA9IG51bGw7XG5cdFx0fVxuXHR9LFxuXHRfZHJhZ1VwZGF0ZUxvb3AgPSBmdW5jdGlvbigpIHtcblx0XHRpZihfaXNEcmFnZ2luZykge1xuXHRcdFx0X2RyYWdBbmltRnJhbWUgPSBfcmVxdWVzdEFGKF9kcmFnVXBkYXRlTG9vcCk7XG5cdFx0XHRfcmVuZGVyTW92ZW1lbnQoKTtcblx0XHR9XG5cdH0sXG5cdF9jYW5QYW4gPSBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gIShfb3B0aW9ucy5zY2FsZU1vZGUgPT09ICdmaXQnICYmIF9jdXJyWm9vbUxldmVsID09PSAgc2VsZi5jdXJySXRlbS5pbml0aWFsWm9vbUxldmVsKTtcblx0fSxcblx0XG5cdC8vIGZpbmQgdGhlIGNsb3Nlc3QgcGFyZW50IERPTSBlbGVtZW50XG5cdF9jbG9zZXN0RWxlbWVudCA9IGZ1bmN0aW9uKGVsLCBmbikge1xuXHQgIFx0aWYoIWVsIHx8IGVsID09PSBkb2N1bWVudCkge1xuXHQgIFx0XHRyZXR1cm4gZmFsc2U7XG5cdCAgXHR9XG5cblx0ICBcdC8vIGRvbid0IHNlYXJjaCBlbGVtZW50cyBhYm92ZSBwc3dwX19zY3JvbGwtd3JhcFxuXHQgIFx0aWYoZWwuZ2V0QXR0cmlidXRlKCdjbGFzcycpICYmIGVsLmdldEF0dHJpYnV0ZSgnY2xhc3MnKS5pbmRleE9mKCdwc3dwX19zY3JvbGwtd3JhcCcpID4gLTEgKSB7XG5cdCAgXHRcdHJldHVybiBmYWxzZTtcblx0ICBcdH1cblxuXHQgIFx0aWYoIGZuKGVsKSApIHtcblx0ICBcdFx0cmV0dXJuIGVsO1xuXHQgIFx0fVxuXG5cdCAgXHRyZXR1cm4gX2Nsb3Nlc3RFbGVtZW50KGVsLnBhcmVudE5vZGUsIGZuKTtcblx0fSxcblxuXHRfcHJldmVudE9iaiA9IHt9LFxuXHRfcHJldmVudERlZmF1bHRFdmVudEJlaGF2aW91ciA9IGZ1bmN0aW9uKGUsIGlzRG93bikge1xuXHQgICAgX3ByZXZlbnRPYmoucHJldmVudCA9ICFfY2xvc2VzdEVsZW1lbnQoZS50YXJnZXQsIF9vcHRpb25zLmlzQ2xpY2thYmxlRWxlbWVudCk7XG5cblx0XHRfc2hvdXQoJ3ByZXZlbnREcmFnRXZlbnQnLCBlLCBpc0Rvd24sIF9wcmV2ZW50T2JqKTtcblx0XHRyZXR1cm4gX3ByZXZlbnRPYmoucHJldmVudDtcblxuXHR9LFxuXHRfY29udmVydFRvdWNoVG9Qb2ludCA9IGZ1bmN0aW9uKHRvdWNoLCBwKSB7XG5cdFx0cC54ID0gdG91Y2gucGFnZVg7XG5cdFx0cC55ID0gdG91Y2gucGFnZVk7XG5cdFx0cC5pZCA9IHRvdWNoLmlkZW50aWZpZXI7XG5cdFx0cmV0dXJuIHA7XG5cdH0sXG5cdF9maW5kQ2VudGVyT2ZQb2ludHMgPSBmdW5jdGlvbihwMSwgcDIsIHBDZW50ZXIpIHtcblx0XHRwQ2VudGVyLnggPSAocDEueCArIHAyLngpICogMC41O1xuXHRcdHBDZW50ZXIueSA9IChwMS55ICsgcDIueSkgKiAwLjU7XG5cdH0sXG5cdF9wdXNoUG9zUG9pbnQgPSBmdW5jdGlvbih0aW1lLCB4LCB5KSB7XG5cdFx0aWYodGltZSAtIF9nZXN0dXJlQ2hlY2tTcGVlZFRpbWUgPiA1MCkge1xuXHRcdFx0dmFyIG8gPSBfcG9zUG9pbnRzLmxlbmd0aCA+IDIgPyBfcG9zUG9pbnRzLnNoaWZ0KCkgOiB7fTtcblx0XHRcdG8ueCA9IHg7XG5cdFx0XHRvLnkgPSB5OyBcblx0XHRcdF9wb3NQb2ludHMucHVzaChvKTtcblx0XHRcdF9nZXN0dXJlQ2hlY2tTcGVlZFRpbWUgPSB0aW1lO1xuXHRcdH1cblx0fSxcblxuXHRfY2FsY3VsYXRlVmVydGljYWxEcmFnT3BhY2l0eVJhdGlvID0gZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHlPZmZzZXQgPSBfcGFuT2Zmc2V0LnkgLSBzZWxmLmN1cnJJdGVtLmluaXRpYWxQb3NpdGlvbi55OyAvLyBkaWZmZXJlbmNlIGJldHdlZW4gaW5pdGlhbCBhbmQgY3VycmVudCBwb3NpdGlvblxuXHRcdHJldHVybiAxIC0gIE1hdGguYWJzKCB5T2Zmc2V0IC8gKF92aWV3cG9ydFNpemUueSAvIDIpICApO1xuXHR9LFxuXG5cdFxuXHQvLyBwb2ludHMgcG9vbCwgcmV1c2VkIGR1cmluZyB0b3VjaCBldmVudHNcblx0X2VQb2ludDEgPSB7fSxcblx0X2VQb2ludDIgPSB7fSxcblx0X3RlbXBQb2ludHNBcnIgPSBbXSxcblx0X3RlbXBDb3VudGVyLFxuXHRfZ2V0VG91Y2hQb2ludHMgPSBmdW5jdGlvbihlKSB7XG5cdFx0Ly8gY2xlYW4gdXAgcHJldmlvdXMgcG9pbnRzLCB3aXRob3V0IHJlY3JlYXRpbmcgYXJyYXlcblx0XHR3aGlsZShfdGVtcFBvaW50c0Fyci5sZW5ndGggPiAwKSB7XG5cdFx0XHRfdGVtcFBvaW50c0Fyci5wb3AoKTtcblx0XHR9XG5cblx0XHRpZighX3BvaW50ZXJFdmVudEVuYWJsZWQpIHtcblx0XHRcdGlmKGUudHlwZS5pbmRleE9mKCd0b3VjaCcpID4gLTEpIHtcblxuXHRcdFx0XHRpZihlLnRvdWNoZXMgJiYgZS50b3VjaGVzLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRfdGVtcFBvaW50c0FyclswXSA9IF9jb252ZXJ0VG91Y2hUb1BvaW50KGUudG91Y2hlc1swXSwgX2VQb2ludDEpO1xuXHRcdFx0XHRcdGlmKGUudG91Y2hlcy5sZW5ndGggPiAxKSB7XG5cdFx0XHRcdFx0XHRfdGVtcFBvaW50c0FyclsxXSA9IF9jb252ZXJ0VG91Y2hUb1BvaW50KGUudG91Y2hlc1sxXSwgX2VQb2ludDIpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdF9lUG9pbnQxLnggPSBlLnBhZ2VYO1xuXHRcdFx0XHRfZVBvaW50MS55ID0gZS5wYWdlWTtcblx0XHRcdFx0X2VQb2ludDEuaWQgPSAnJztcblx0XHRcdFx0X3RlbXBQb2ludHNBcnJbMF0gPSBfZVBvaW50MTsvL19lUG9pbnQxO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRfdGVtcENvdW50ZXIgPSAwO1xuXHRcdFx0Ly8gd2UgY2FuIHVzZSBmb3JFYWNoLCBhcyBwb2ludGVyIGV2ZW50cyBhcmUgc3VwcG9ydGVkIG9ubHkgaW4gbW9kZXJuIGJyb3dzZXJzXG5cdFx0XHRfY3VyclBvaW50ZXJzLmZvckVhY2goZnVuY3Rpb24ocCkge1xuXHRcdFx0XHRpZihfdGVtcENvdW50ZXIgPT09IDApIHtcblx0XHRcdFx0XHRfdGVtcFBvaW50c0FyclswXSA9IHA7XG5cdFx0XHRcdH0gZWxzZSBpZihfdGVtcENvdW50ZXIgPT09IDEpIHtcblx0XHRcdFx0XHRfdGVtcFBvaW50c0FyclsxXSA9IHA7XG5cdFx0XHRcdH1cblx0XHRcdFx0X3RlbXBDb3VudGVyKys7XG5cblx0XHRcdH0pO1xuXHRcdH1cblx0XHRyZXR1cm4gX3RlbXBQb2ludHNBcnI7XG5cdH0sXG5cblx0X3Bhbk9yTW92ZU1haW5TY3JvbGwgPSBmdW5jdGlvbihheGlzLCBkZWx0YSkge1xuXG5cdFx0dmFyIHBhbkZyaWN0aW9uLFxuXHRcdFx0b3ZlckRpZmYgPSAwLFxuXHRcdFx0bmV3T2Zmc2V0ID0gX3Bhbk9mZnNldFtheGlzXSArIGRlbHRhW2F4aXNdLFxuXHRcdFx0c3RhcnRPdmVyRGlmZixcblx0XHRcdGRpciA9IGRlbHRhW2F4aXNdID4gMCxcblx0XHRcdG5ld01haW5TY3JvbGxQb3NpdGlvbiA9IF9tYWluU2Nyb2xsUG9zLnggKyBkZWx0YS54LFxuXHRcdFx0bWFpblNjcm9sbERpZmYgPSBfbWFpblNjcm9sbFBvcy54IC0gX3N0YXJ0TWFpblNjcm9sbFBvcy54LFxuXHRcdFx0bmV3UGFuUG9zLFxuXHRcdFx0bmV3TWFpblNjcm9sbFBvcztcblxuXHRcdC8vIGNhbGN1bGF0ZSBmZGlzdGFuY2Ugb3ZlciB0aGUgYm91bmRzIGFuZCBmcmljdGlvblxuXHRcdGlmKG5ld09mZnNldCA+IF9jdXJyUGFuQm91bmRzLm1pbltheGlzXSB8fCBuZXdPZmZzZXQgPCBfY3VyclBhbkJvdW5kcy5tYXhbYXhpc10pIHtcblx0XHRcdHBhbkZyaWN0aW9uID0gX29wdGlvbnMucGFuRW5kRnJpY3Rpb247XG5cdFx0XHQvLyBMaW5lYXIgaW5jcmVhc2luZyBvZiBmcmljdGlvbiwgc28gYXQgMS80IG9mIHZpZXdwb3J0IGl0J3MgYXQgbWF4IHZhbHVlLiBcblx0XHRcdC8vIExvb2tzIG5vdCBhcyBuaWNlIGFzIHdhcyBleHBlY3RlZC4gTGVmdCBmb3IgaGlzdG9yeS5cblx0XHRcdC8vIHBhbkZyaWN0aW9uID0gKDEgLSAoX3Bhbk9mZnNldFtheGlzXSArIGRlbHRhW2F4aXNdICsgcGFuQm91bmRzLm1pbltheGlzXSkgLyAoX3ZpZXdwb3J0U2l6ZVtheGlzXSAvIDQpICk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHBhbkZyaWN0aW9uID0gMTtcblx0XHR9XG5cdFx0XG5cdFx0bmV3T2Zmc2V0ID0gX3Bhbk9mZnNldFtheGlzXSArIGRlbHRhW2F4aXNdICogcGFuRnJpY3Rpb247XG5cblx0XHQvLyBtb3ZlIG1haW4gc2Nyb2xsIG9yIHN0YXJ0IHBhbm5pbmdcblx0XHRpZihfb3B0aW9ucy5hbGxvd1BhblRvTmV4dCB8fCBfY3Vyclpvb21MZXZlbCA9PT0gc2VsZi5jdXJySXRlbS5pbml0aWFsWm9vbUxldmVsKSB7XG5cblxuXHRcdFx0aWYoIV9jdXJyWm9vbUVsZW1lbnRTdHlsZSkge1xuXHRcdFx0XHRcblx0XHRcdFx0bmV3TWFpblNjcm9sbFBvcyA9IG5ld01haW5TY3JvbGxQb3NpdGlvbjtcblxuXHRcdFx0fSBlbHNlIGlmKF9kaXJlY3Rpb24gPT09ICdoJyAmJiBheGlzID09PSAneCcgJiYgIV96b29tU3RhcnRlZCApIHtcblx0XHRcdFx0XG5cdFx0XHRcdGlmKGRpcikge1xuXHRcdFx0XHRcdGlmKG5ld09mZnNldCA+IF9jdXJyUGFuQm91bmRzLm1pbltheGlzXSkge1xuXHRcdFx0XHRcdFx0cGFuRnJpY3Rpb24gPSBfb3B0aW9ucy5wYW5FbmRGcmljdGlvbjtcblx0XHRcdFx0XHRcdG92ZXJEaWZmID0gX2N1cnJQYW5Cb3VuZHMubWluW2F4aXNdIC0gbmV3T2Zmc2V0O1xuXHRcdFx0XHRcdFx0c3RhcnRPdmVyRGlmZiA9IF9jdXJyUGFuQm91bmRzLm1pbltheGlzXSAtIF9zdGFydFBhbk9mZnNldFtheGlzXTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0Ly8gZHJhZyByaWdodFxuXHRcdFx0XHRcdGlmKCAoc3RhcnRPdmVyRGlmZiA8PSAwIHx8IG1haW5TY3JvbGxEaWZmIDwgMCkgJiYgX2dldE51bUl0ZW1zKCkgPiAxICkge1xuXHRcdFx0XHRcdFx0bmV3TWFpblNjcm9sbFBvcyA9IG5ld01haW5TY3JvbGxQb3NpdGlvbjtcblx0XHRcdFx0XHRcdGlmKG1haW5TY3JvbGxEaWZmIDwgMCAmJiBuZXdNYWluU2Nyb2xsUG9zaXRpb24gPiBfc3RhcnRNYWluU2Nyb2xsUG9zLngpIHtcblx0XHRcdFx0XHRcdFx0bmV3TWFpblNjcm9sbFBvcyA9IF9zdGFydE1haW5TY3JvbGxQb3MueDtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0aWYoX2N1cnJQYW5Cb3VuZHMubWluLnggIT09IF9jdXJyUGFuQm91bmRzLm1heC54KSB7XG5cdFx0XHRcdFx0XHRcdG5ld1BhblBvcyA9IG5ld09mZnNldDtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdFx0aWYobmV3T2Zmc2V0IDwgX2N1cnJQYW5Cb3VuZHMubWF4W2F4aXNdICkge1xuXHRcdFx0XHRcdFx0cGFuRnJpY3Rpb24gPV9vcHRpb25zLnBhbkVuZEZyaWN0aW9uO1xuXHRcdFx0XHRcdFx0b3ZlckRpZmYgPSBuZXdPZmZzZXQgLSBfY3VyclBhbkJvdW5kcy5tYXhbYXhpc107XG5cdFx0XHRcdFx0XHRzdGFydE92ZXJEaWZmID0gX3N0YXJ0UGFuT2Zmc2V0W2F4aXNdIC0gX2N1cnJQYW5Cb3VuZHMubWF4W2F4aXNdO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmKCAoc3RhcnRPdmVyRGlmZiA8PSAwIHx8IG1haW5TY3JvbGxEaWZmID4gMCkgJiYgX2dldE51bUl0ZW1zKCkgPiAxICkge1xuXHRcdFx0XHRcdFx0bmV3TWFpblNjcm9sbFBvcyA9IG5ld01haW5TY3JvbGxQb3NpdGlvbjtcblxuXHRcdFx0XHRcdFx0aWYobWFpblNjcm9sbERpZmYgPiAwICYmIG5ld01haW5TY3JvbGxQb3NpdGlvbiA8IF9zdGFydE1haW5TY3JvbGxQb3MueCkge1xuXHRcdFx0XHRcdFx0XHRuZXdNYWluU2Nyb2xsUG9zID0gX3N0YXJ0TWFpblNjcm9sbFBvcy54O1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGlmKF9jdXJyUGFuQm91bmRzLm1pbi54ICE9PSBfY3VyclBhbkJvdW5kcy5tYXgueCkge1xuXHRcdFx0XHRcdFx0XHRuZXdQYW5Qb3MgPSBuZXdPZmZzZXQ7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdH1cblxuXG5cdFx0XHRcdC8vXG5cdFx0XHR9XG5cblx0XHRcdGlmKGF4aXMgPT09ICd4Jykge1xuXG5cdFx0XHRcdGlmKG5ld01haW5TY3JvbGxQb3MgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdF9tb3ZlTWFpblNjcm9sbChuZXdNYWluU2Nyb2xsUG9zLCB0cnVlKTtcblx0XHRcdFx0XHRpZihuZXdNYWluU2Nyb2xsUG9zID09PSBfc3RhcnRNYWluU2Nyb2xsUG9zLngpIHtcblx0XHRcdFx0XHRcdF9tYWluU2Nyb2xsU2hpZnRlZCA9IGZhbHNlO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRfbWFpblNjcm9sbFNoaWZ0ZWQgPSB0cnVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmKF9jdXJyUGFuQm91bmRzLm1pbi54ICE9PSBfY3VyclBhbkJvdW5kcy5tYXgueCkge1xuXHRcdFx0XHRcdGlmKG5ld1BhblBvcyAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0XHRfcGFuT2Zmc2V0LnggPSBuZXdQYW5Qb3M7XG5cdFx0XHRcdFx0fSBlbHNlIGlmKCFfbWFpblNjcm9sbFNoaWZ0ZWQpIHtcblx0XHRcdFx0XHRcdF9wYW5PZmZzZXQueCArPSBkZWx0YS54ICogcGFuRnJpY3Rpb247XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIG5ld01haW5TY3JvbGxQb3MgIT09IHVuZGVmaW5lZDtcblx0XHRcdH1cblxuXHRcdH1cblxuXHRcdGlmKCFfbWFpblNjcm9sbEFuaW1hdGluZykge1xuXHRcdFx0XG5cdFx0XHRpZighX21haW5TY3JvbGxTaGlmdGVkKSB7XG5cdFx0XHRcdGlmKF9jdXJyWm9vbUxldmVsID4gc2VsZi5jdXJySXRlbS5maXRSYXRpbykge1xuXHRcdFx0XHRcdF9wYW5PZmZzZXRbYXhpc10gKz0gZGVsdGFbYXhpc10gKiBwYW5GcmljdGlvbjtcblx0XHRcdFx0XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0XG5cdFx0fVxuXHRcdFxuXHR9LFxuXG5cdC8vIFBvaW50ZXJkb3duL3RvdWNoc3RhcnQvbW91c2Vkb3duIGhhbmRsZXJcblx0X29uRHJhZ1N0YXJ0ID0gZnVuY3Rpb24oZSkge1xuXG5cdFx0Ly8gQWxsb3cgZHJhZ2dpbmcgb25seSB2aWEgbGVmdCBtb3VzZSBidXR0b24uXG5cdFx0Ly8gQXMgdGhpcyBoYW5kbGVyIGlzIG5vdCBhZGRlZCBpbiBJRTggLSB3ZSBpZ25vcmUgZS53aGljaFxuXHRcdC8vIFxuXHRcdC8vIGh0dHA6Ly93d3cucXVpcmtzbW9kZS5vcmcvanMvZXZlbnRzX3Byb3BlcnRpZXMuaHRtbFxuXHRcdC8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9ldmVudC5idXR0b25cblx0XHRpZihlLnR5cGUgPT09ICdtb3VzZWRvd24nICYmIGUuYnV0dG9uID4gMCAgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0aWYoX2luaXRpYWxab29tUnVubmluZykge1xuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGlmKF9vbGRBbmRyb2lkVG91Y2hFbmRUaW1lb3V0ICYmIGUudHlwZSA9PT0gJ21vdXNlZG93bicpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRpZihfcHJldmVudERlZmF1bHRFdmVudEJlaGF2aW91cihlLCB0cnVlKSkge1xuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdH1cblxuXG5cblx0XHRfc2hvdXQoJ3BvaW50ZXJEb3duJyk7XG5cblx0XHRpZihfcG9pbnRlckV2ZW50RW5hYmxlZCkge1xuXHRcdFx0dmFyIHBvaW50ZXJJbmRleCA9IGZyYW1ld29yay5hcnJheVNlYXJjaChfY3VyclBvaW50ZXJzLCBlLnBvaW50ZXJJZCwgJ2lkJyk7XG5cdFx0XHRpZihwb2ludGVySW5kZXggPCAwKSB7XG5cdFx0XHRcdHBvaW50ZXJJbmRleCA9IF9jdXJyUG9pbnRlcnMubGVuZ3RoO1xuXHRcdFx0fVxuXHRcdFx0X2N1cnJQb2ludGVyc1twb2ludGVySW5kZXhdID0ge3g6ZS5wYWdlWCwgeTplLnBhZ2VZLCBpZDogZS5wb2ludGVySWR9O1xuXHRcdH1cblx0XHRcblxuXG5cdFx0dmFyIHN0YXJ0UG9pbnRzTGlzdCA9IF9nZXRUb3VjaFBvaW50cyhlKSxcblx0XHRcdG51bVBvaW50cyA9IHN0YXJ0UG9pbnRzTGlzdC5sZW5ndGg7XG5cblx0XHRfY3VycmVudFBvaW50cyA9IG51bGw7XG5cblx0XHRfc3RvcEFsbEFuaW1hdGlvbnMoKTtcblxuXHRcdC8vIGluaXQgZHJhZ1xuXHRcdGlmKCFfaXNEcmFnZ2luZyB8fCBudW1Qb2ludHMgPT09IDEpIHtcblxuXHRcdFx0XG5cblx0XHRcdF9pc0RyYWdnaW5nID0gX2lzRmlyc3RNb3ZlID0gdHJ1ZTtcblx0XHRcdGZyYW1ld29yay5iaW5kKHdpbmRvdywgX3VwTW92ZUV2ZW50cywgc2VsZik7XG5cblx0XHRcdF9pc1pvb21pbmdJbiA9IFxuXHRcdFx0XHRfd2FzT3ZlckluaXRpYWxab29tID0gXG5cdFx0XHRcdF9vcGFjaXR5Q2hhbmdlZCA9IFxuXHRcdFx0XHRfdmVydGljYWxEcmFnSW5pdGlhdGVkID0gXG5cdFx0XHRcdF9tYWluU2Nyb2xsU2hpZnRlZCA9IFxuXHRcdFx0XHRfbW92ZWQgPSBcblx0XHRcdFx0X2lzTXVsdGl0b3VjaCA9IFxuXHRcdFx0XHRfem9vbVN0YXJ0ZWQgPSBmYWxzZTtcblxuXHRcdFx0X2RpcmVjdGlvbiA9IG51bGw7XG5cblx0XHRcdF9zaG91dCgnZmlyc3RUb3VjaFN0YXJ0Jywgc3RhcnRQb2ludHNMaXN0KTtcblxuXHRcdFx0X2VxdWFsaXplUG9pbnRzKF9zdGFydFBhbk9mZnNldCwgX3Bhbk9mZnNldCk7XG5cblx0XHRcdF9jdXJyUGFuRGlzdC54ID0gX2N1cnJQYW5EaXN0LnkgPSAwO1xuXHRcdFx0X2VxdWFsaXplUG9pbnRzKF9jdXJyUG9pbnQsIHN0YXJ0UG9pbnRzTGlzdFswXSk7XG5cdFx0XHRfZXF1YWxpemVQb2ludHMoX3N0YXJ0UG9pbnQsIF9jdXJyUG9pbnQpO1xuXG5cdFx0XHQvL19lcXVhbGl6ZVBvaW50cyhfc3RhcnRNYWluU2Nyb2xsUG9zLCBfbWFpblNjcm9sbFBvcyk7XG5cdFx0XHRfc3RhcnRNYWluU2Nyb2xsUG9zLnggPSBfc2xpZGVTaXplLnggKiBfY3VyclBvc2l0aW9uSW5kZXg7XG5cblx0XHRcdF9wb3NQb2ludHMgPSBbe1xuXHRcdFx0XHR4OiBfY3VyclBvaW50LngsXG5cdFx0XHRcdHk6IF9jdXJyUG9pbnQueVxuXHRcdFx0fV07XG5cblx0XHRcdF9nZXN0dXJlQ2hlY2tTcGVlZFRpbWUgPSBfZ2VzdHVyZVN0YXJ0VGltZSA9IF9nZXRDdXJyZW50VGltZSgpO1xuXG5cdFx0XHQvL19tYWluU2Nyb2xsQW5pbWF0aW9uRW5kKHRydWUpO1xuXHRcdFx0X2NhbGN1bGF0ZVBhbkJvdW5kcyggX2N1cnJab29tTGV2ZWwsIHRydWUgKTtcblx0XHRcdFxuXHRcdFx0Ly8gU3RhcnQgcmVuZGVyaW5nXG5cdFx0XHRfc3RvcERyYWdVcGRhdGVMb29wKCk7XG5cdFx0XHRfZHJhZ1VwZGF0ZUxvb3AoKTtcblx0XHRcdFxuXHRcdH1cblxuXHRcdC8vIGluaXQgem9vbVxuXHRcdGlmKCFfaXNab29taW5nICYmIG51bVBvaW50cyA+IDEgJiYgIV9tYWluU2Nyb2xsQW5pbWF0aW5nICYmICFfbWFpblNjcm9sbFNoaWZ0ZWQpIHtcblx0XHRcdF9zdGFydFpvb21MZXZlbCA9IF9jdXJyWm9vbUxldmVsO1xuXHRcdFx0X3pvb21TdGFydGVkID0gZmFsc2U7IC8vIHRydWUgaWYgem9vbSBjaGFuZ2VkIGF0IGxlYXN0IG9uY2VcblxuXHRcdFx0X2lzWm9vbWluZyA9IF9pc011bHRpdG91Y2ggPSB0cnVlO1xuXHRcdFx0X2N1cnJQYW5EaXN0LnkgPSBfY3VyclBhbkRpc3QueCA9IDA7XG5cblx0XHRcdF9lcXVhbGl6ZVBvaW50cyhfc3RhcnRQYW5PZmZzZXQsIF9wYW5PZmZzZXQpO1xuXG5cdFx0XHRfZXF1YWxpemVQb2ludHMocCwgc3RhcnRQb2ludHNMaXN0WzBdKTtcblx0XHRcdF9lcXVhbGl6ZVBvaW50cyhwMiwgc3RhcnRQb2ludHNMaXN0WzFdKTtcblxuXHRcdFx0X2ZpbmRDZW50ZXJPZlBvaW50cyhwLCBwMiwgX2N1cnJDZW50ZXJQb2ludCk7XG5cblx0XHRcdF9taWRab29tUG9pbnQueCA9IE1hdGguYWJzKF9jdXJyQ2VudGVyUG9pbnQueCkgLSBfcGFuT2Zmc2V0Lng7XG5cdFx0XHRfbWlkWm9vbVBvaW50LnkgPSBNYXRoLmFicyhfY3VyckNlbnRlclBvaW50LnkpIC0gX3Bhbk9mZnNldC55O1xuXHRcdFx0X2N1cnJQb2ludHNEaXN0YW5jZSA9IF9zdGFydFBvaW50c0Rpc3RhbmNlID0gX2NhbGN1bGF0ZVBvaW50c0Rpc3RhbmNlKHAsIHAyKTtcblx0XHR9XG5cblxuXHR9LFxuXG5cdC8vIFBvaW50ZXJtb3ZlL3RvdWNobW92ZS9tb3VzZW1vdmUgaGFuZGxlclxuXHRfb25EcmFnTW92ZSA9IGZ1bmN0aW9uKGUpIHtcblxuXHRcdGUucHJldmVudERlZmF1bHQoKTtcblxuXHRcdGlmKF9wb2ludGVyRXZlbnRFbmFibGVkKSB7XG5cdFx0XHR2YXIgcG9pbnRlckluZGV4ID0gZnJhbWV3b3JrLmFycmF5U2VhcmNoKF9jdXJyUG9pbnRlcnMsIGUucG9pbnRlcklkLCAnaWQnKTtcblx0XHRcdGlmKHBvaW50ZXJJbmRleCA+IC0xKSB7XG5cdFx0XHRcdHZhciBwID0gX2N1cnJQb2ludGVyc1twb2ludGVySW5kZXhdO1xuXHRcdFx0XHRwLnggPSBlLnBhZ2VYO1xuXHRcdFx0XHRwLnkgPSBlLnBhZ2VZOyBcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZihfaXNEcmFnZ2luZykge1xuXHRcdFx0dmFyIHRvdWNoZXNMaXN0ID0gX2dldFRvdWNoUG9pbnRzKGUpO1xuXHRcdFx0aWYoIV9kaXJlY3Rpb24gJiYgIV9tb3ZlZCAmJiAhX2lzWm9vbWluZykge1xuXG5cdFx0XHRcdGlmKF9tYWluU2Nyb2xsUG9zLnggIT09IF9zbGlkZVNpemUueCAqIF9jdXJyUG9zaXRpb25JbmRleCkge1xuXHRcdFx0XHRcdC8vIGlmIG1haW4gc2Nyb2xsIHBvc2l0aW9uIGlzIHNoaWZ0ZWQg4oCTIGRpcmVjdGlvbiBpcyBhbHdheXMgaG9yaXpvbnRhbFxuXHRcdFx0XHRcdF9kaXJlY3Rpb24gPSAnaCc7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dmFyIGRpZmYgPSBNYXRoLmFicyh0b3VjaGVzTGlzdFswXS54IC0gX2N1cnJQb2ludC54KSAtIE1hdGguYWJzKHRvdWNoZXNMaXN0WzBdLnkgLSBfY3VyclBvaW50LnkpO1xuXHRcdFx0XHRcdC8vIGNoZWNrIHRoZSBkaXJlY3Rpb24gb2YgbW92ZW1lbnRcblx0XHRcdFx0XHRpZihNYXRoLmFicyhkaWZmKSA+PSBESVJFQ1RJT05fQ0hFQ0tfT0ZGU0VUKSB7XG5cdFx0XHRcdFx0XHRfZGlyZWN0aW9uID0gZGlmZiA+IDAgPyAnaCcgOiAndic7XG5cdFx0XHRcdFx0XHRfY3VycmVudFBvaW50cyA9IHRvdWNoZXNMaXN0O1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdF9jdXJyZW50UG9pbnRzID0gdG91Y2hlc0xpc3Q7XG5cdFx0XHR9XG5cdFx0fVx0XG5cdH0sXG5cdC8vIFxuXHRfcmVuZGVyTW92ZW1lbnQgPSAgZnVuY3Rpb24oKSB7XG5cblx0XHRpZighX2N1cnJlbnRQb2ludHMpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR2YXIgbnVtUG9pbnRzID0gX2N1cnJlbnRQb2ludHMubGVuZ3RoO1xuXG5cdFx0aWYobnVtUG9pbnRzID09PSAwKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0X2VxdWFsaXplUG9pbnRzKHAsIF9jdXJyZW50UG9pbnRzWzBdKTtcblxuXHRcdGRlbHRhLnggPSBwLnggLSBfY3VyclBvaW50Lng7XG5cdFx0ZGVsdGEueSA9IHAueSAtIF9jdXJyUG9pbnQueTtcblxuXHRcdGlmKF9pc1pvb21pbmcgJiYgbnVtUG9pbnRzID4gMSkge1xuXHRcdFx0Ly8gSGFuZGxlIGJlaGF2aW91ciBmb3IgbW9yZSB0aGFuIDEgcG9pbnRcblxuXHRcdFx0X2N1cnJQb2ludC54ID0gcC54O1xuXHRcdFx0X2N1cnJQb2ludC55ID0gcC55O1xuXHRcdFxuXHRcdFx0Ly8gY2hlY2sgaWYgb25lIG9mIHR3byBwb2ludHMgY2hhbmdlZFxuXHRcdFx0aWYoICFkZWx0YS54ICYmICFkZWx0YS55ICYmIF9pc0VxdWFsUG9pbnRzKF9jdXJyZW50UG9pbnRzWzFdLCBwMikgKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0X2VxdWFsaXplUG9pbnRzKHAyLCBfY3VycmVudFBvaW50c1sxXSk7XG5cblxuXHRcdFx0aWYoIV96b29tU3RhcnRlZCkge1xuXHRcdFx0XHRfem9vbVN0YXJ0ZWQgPSB0cnVlO1xuXHRcdFx0XHRfc2hvdXQoJ3pvb21HZXN0dXJlU3RhcnRlZCcpO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHQvLyBEaXN0YW5jZSBiZXR3ZWVuIHR3byBwb2ludHNcblx0XHRcdHZhciBwb2ludHNEaXN0YW5jZSA9IF9jYWxjdWxhdGVQb2ludHNEaXN0YW5jZShwLHAyKTtcblxuXHRcdFx0dmFyIHpvb21MZXZlbCA9IF9jYWxjdWxhdGVab29tTGV2ZWwocG9pbnRzRGlzdGFuY2UpO1xuXG5cdFx0XHQvLyBzbGlnaHRseSBvdmVyIHRoZSBvZiBpbml0aWFsIHpvb20gbGV2ZWxcblx0XHRcdGlmKHpvb21MZXZlbCA+IHNlbGYuY3Vyckl0ZW0uaW5pdGlhbFpvb21MZXZlbCArIHNlbGYuY3Vyckl0ZW0uaW5pdGlhbFpvb21MZXZlbCAvIDE1KSB7XG5cdFx0XHRcdF93YXNPdmVySW5pdGlhbFpvb20gPSB0cnVlO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBBcHBseSB0aGUgZnJpY3Rpb24gaWYgem9vbSBsZXZlbCBpcyBvdXQgb2YgdGhlIGJvdW5kc1xuXHRcdFx0dmFyIHpvb21GcmljdGlvbiA9IDEsXG5cdFx0XHRcdG1pblpvb21MZXZlbCA9IF9nZXRNaW5ab29tTGV2ZWwoKSxcblx0XHRcdFx0bWF4Wm9vbUxldmVsID0gX2dldE1heFpvb21MZXZlbCgpO1xuXG5cdFx0XHRpZiAoIHpvb21MZXZlbCA8IG1pblpvb21MZXZlbCApIHtcblx0XHRcdFx0XG5cdFx0XHRcdGlmKF9vcHRpb25zLnBpbmNoVG9DbG9zZSAmJiAhX3dhc092ZXJJbml0aWFsWm9vbSAmJiBfc3RhcnRab29tTGV2ZWwgPD0gc2VsZi5jdXJySXRlbS5pbml0aWFsWm9vbUxldmVsKSB7XG5cdFx0XHRcdFx0Ly8gZmFkZSBvdXQgYmFja2dyb3VuZCBpZiB6b29taW5nIG91dFxuXHRcdFx0XHRcdHZhciBtaW51c0RpZmYgPSBtaW5ab29tTGV2ZWwgLSB6b29tTGV2ZWw7XG5cdFx0XHRcdFx0dmFyIHBlcmNlbnQgPSAxIC0gbWludXNEaWZmIC8gKG1pblpvb21MZXZlbCAvIDEuMik7XG5cblx0XHRcdFx0XHRfYXBwbHlCZ09wYWNpdHkocGVyY2VudCk7XG5cdFx0XHRcdFx0X3Nob3V0KCdvblBpbmNoQ2xvc2UnLCBwZXJjZW50KTtcblx0XHRcdFx0XHRfb3BhY2l0eUNoYW5nZWQgPSB0cnVlO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHpvb21GcmljdGlvbiA9IChtaW5ab29tTGV2ZWwgLSB6b29tTGV2ZWwpIC8gbWluWm9vbUxldmVsO1xuXHRcdFx0XHRcdGlmKHpvb21GcmljdGlvbiA+IDEpIHtcblx0XHRcdFx0XHRcdHpvb21GcmljdGlvbiA9IDE7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHpvb21MZXZlbCA9IG1pblpvb21MZXZlbCAtIHpvb21GcmljdGlvbiAqIChtaW5ab29tTGV2ZWwgLyAzKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRcblx0XHRcdH0gZWxzZSBpZiAoIHpvb21MZXZlbCA+IG1heFpvb21MZXZlbCApIHtcblx0XHRcdFx0Ly8gMS41IC0gZXh0cmEgem9vbSBsZXZlbCBhYm92ZSB0aGUgbWF4LiBFLmcuIGlmIG1heCBpcyB4NiwgcmVhbCBtYXggNiArIDEuNSA9IDcuNVxuXHRcdFx0XHR6b29tRnJpY3Rpb24gPSAoem9vbUxldmVsIC0gbWF4Wm9vbUxldmVsKSAvICggbWluWm9vbUxldmVsICogNiApO1xuXHRcdFx0XHRpZih6b29tRnJpY3Rpb24gPiAxKSB7XG5cdFx0XHRcdFx0em9vbUZyaWN0aW9uID0gMTtcblx0XHRcdFx0fVxuXHRcdFx0XHR6b29tTGV2ZWwgPSBtYXhab29tTGV2ZWwgKyB6b29tRnJpY3Rpb24gKiBtaW5ab29tTGV2ZWw7XG5cdFx0XHR9XG5cblx0XHRcdGlmKHpvb21GcmljdGlvbiA8IDApIHtcblx0XHRcdFx0em9vbUZyaWN0aW9uID0gMDtcblx0XHRcdH1cblxuXHRcdFx0Ly8gZGlzdGFuY2UgYmV0d2VlbiB0b3VjaCBwb2ludHMgYWZ0ZXIgZnJpY3Rpb24gaXMgYXBwbGllZFxuXHRcdFx0X2N1cnJQb2ludHNEaXN0YW5jZSA9IHBvaW50c0Rpc3RhbmNlO1xuXG5cdFx0XHQvLyBfY2VudGVyUG9pbnQgLSBUaGUgcG9pbnQgaW4gdGhlIG1pZGRsZSBvZiB0d28gcG9pbnRlcnNcblx0XHRcdF9maW5kQ2VudGVyT2ZQb2ludHMocCwgcDIsIF9jZW50ZXJQb2ludCk7XG5cdFx0XG5cdFx0XHQvLyBwYW5pbmcgd2l0aCB0d28gcG9pbnRlcnMgcHJlc3NlZFxuXHRcdFx0X2N1cnJQYW5EaXN0LnggKz0gX2NlbnRlclBvaW50LnggLSBfY3VyckNlbnRlclBvaW50Lng7XG5cdFx0XHRfY3VyclBhbkRpc3QueSArPSBfY2VudGVyUG9pbnQueSAtIF9jdXJyQ2VudGVyUG9pbnQueTtcblx0XHRcdF9lcXVhbGl6ZVBvaW50cyhfY3VyckNlbnRlclBvaW50LCBfY2VudGVyUG9pbnQpO1xuXG5cdFx0XHRfcGFuT2Zmc2V0LnggPSBfY2FsY3VsYXRlUGFuT2Zmc2V0KCd4Jywgem9vbUxldmVsKTtcblx0XHRcdF9wYW5PZmZzZXQueSA9IF9jYWxjdWxhdGVQYW5PZmZzZXQoJ3knLCB6b29tTGV2ZWwpO1xuXG5cdFx0XHRfaXNab29taW5nSW4gPSB6b29tTGV2ZWwgPiBfY3Vyclpvb21MZXZlbDtcblx0XHRcdF9jdXJyWm9vbUxldmVsID0gem9vbUxldmVsO1xuXHRcdFx0X2FwcGx5Q3VycmVudFpvb21QYW4oKTtcblxuXHRcdH0gZWxzZSB7XG5cblx0XHRcdC8vIGhhbmRsZSBiZWhhdmlvdXIgZm9yIG9uZSBwb2ludCAoZHJhZ2dpbmcgb3IgcGFubmluZylcblxuXHRcdFx0aWYoIV9kaXJlY3Rpb24pIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRpZihfaXNGaXJzdE1vdmUpIHtcblx0XHRcdFx0X2lzRmlyc3RNb3ZlID0gZmFsc2U7XG5cblx0XHRcdFx0Ly8gc3VidHJhY3QgZHJhZyBkaXN0YW5jZSB0aGF0IHdhcyB1c2VkIGR1cmluZyB0aGUgZGV0ZWN0aW9uIGRpcmVjdGlvbiAgXG5cblx0XHRcdFx0aWYoIE1hdGguYWJzKGRlbHRhLngpID49IERJUkVDVElPTl9DSEVDS19PRkZTRVQpIHtcblx0XHRcdFx0XHRkZWx0YS54IC09IF9jdXJyZW50UG9pbnRzWzBdLnggLSBfc3RhcnRQb2ludC54O1xuXHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0XHRpZiggTWF0aC5hYnMoZGVsdGEueSkgPj0gRElSRUNUSU9OX0NIRUNLX09GRlNFVCkge1xuXHRcdFx0XHRcdGRlbHRhLnkgLT0gX2N1cnJlbnRQb2ludHNbMF0ueSAtIF9zdGFydFBvaW50Lnk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0X2N1cnJQb2ludC54ID0gcC54O1xuXHRcdFx0X2N1cnJQb2ludC55ID0gcC55O1xuXG5cdFx0XHQvLyBkbyBub3RoaW5nIGlmIHBvaW50ZXJzIHBvc2l0aW9uIGhhc24ndCBjaGFuZ2VkXG5cdFx0XHRpZihkZWx0YS54ID09PSAwICYmIGRlbHRhLnkgPT09IDApIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRpZihfZGlyZWN0aW9uID09PSAndicgJiYgX29wdGlvbnMuY2xvc2VPblZlcnRpY2FsRHJhZykge1xuXHRcdFx0XHRpZighX2NhblBhbigpKSB7XG5cdFx0XHRcdFx0X2N1cnJQYW5EaXN0LnkgKz0gZGVsdGEueTtcblx0XHRcdFx0XHRfcGFuT2Zmc2V0LnkgKz0gZGVsdGEueTtcblxuXHRcdFx0XHRcdHZhciBvcGFjaXR5UmF0aW8gPSBfY2FsY3VsYXRlVmVydGljYWxEcmFnT3BhY2l0eVJhdGlvKCk7XG5cblx0XHRcdFx0XHRfdmVydGljYWxEcmFnSW5pdGlhdGVkID0gdHJ1ZTtcblx0XHRcdFx0XHRfc2hvdXQoJ29uVmVydGljYWxEcmFnJywgb3BhY2l0eVJhdGlvKTtcblxuXHRcdFx0XHRcdF9hcHBseUJnT3BhY2l0eShvcGFjaXR5UmF0aW8pO1xuXHRcdFx0XHRcdF9hcHBseUN1cnJlbnRab29tUGFuKCk7XG5cdFx0XHRcdFx0cmV0dXJuIDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRfcHVzaFBvc1BvaW50KF9nZXRDdXJyZW50VGltZSgpLCBwLngsIHAueSk7XG5cblx0XHRcdF9tb3ZlZCA9IHRydWU7XG5cdFx0XHRfY3VyclBhbkJvdW5kcyA9IHNlbGYuY3Vyckl0ZW0uYm91bmRzO1xuXHRcdFx0XG5cdFx0XHR2YXIgbWFpblNjcm9sbENoYW5nZWQgPSBfcGFuT3JNb3ZlTWFpblNjcm9sbCgneCcsIGRlbHRhKTtcblx0XHRcdGlmKCFtYWluU2Nyb2xsQ2hhbmdlZCkge1xuXHRcdFx0XHRfcGFuT3JNb3ZlTWFpblNjcm9sbCgneScsIGRlbHRhKTtcblxuXHRcdFx0XHRfcm91bmRQb2ludChfcGFuT2Zmc2V0KTtcblx0XHRcdFx0X2FwcGx5Q3VycmVudFpvb21QYW4oKTtcblx0XHRcdH1cblxuXHRcdH1cblxuXHR9LFxuXHRcblx0Ly8gUG9pbnRlcnVwL3BvaW50ZXJjYW5jZWwvdG91Y2hlbmQvdG91Y2hjYW5jZWwvbW91c2V1cCBldmVudCBoYW5kbGVyXG5cdF9vbkRyYWdSZWxlYXNlID0gZnVuY3Rpb24oZSkge1xuXG5cdFx0aWYoX2ZlYXR1cmVzLmlzT2xkQW5kcm9pZCApIHtcblxuXHRcdFx0aWYoX29sZEFuZHJvaWRUb3VjaEVuZFRpbWVvdXQgJiYgZS50eXBlID09PSAnbW91c2V1cCcpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBvbiBBbmRyb2lkICh2NC4xLCA0LjIsIDQuMyAmIHBvc3NpYmx5IG9sZGVyKSBcblx0XHRcdC8vIGdob3N0IG1vdXNlZG93bi91cCBldmVudCBpc24ndCBwcmV2ZW50YWJsZSB2aWEgZS5wcmV2ZW50RGVmYXVsdCxcblx0XHRcdC8vIHdoaWNoIGNhdXNlcyBmYWtlIG1vdXNlZG93biBldmVudFxuXHRcdFx0Ly8gc28gd2UgYmxvY2sgbW91c2Vkb3duL3VwIGZvciA2MDBtc1xuXHRcdFx0aWYoIGUudHlwZS5pbmRleE9mKCd0b3VjaCcpID4gLTEgKSB7XG5cdFx0XHRcdGNsZWFyVGltZW91dChfb2xkQW5kcm9pZFRvdWNoRW5kVGltZW91dCk7XG5cdFx0XHRcdF9vbGRBbmRyb2lkVG91Y2hFbmRUaW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRfb2xkQW5kcm9pZFRvdWNoRW5kVGltZW91dCA9IDA7XG5cdFx0XHRcdH0sIDYwMCk7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHR9XG5cblx0XHRfc2hvdXQoJ3BvaW50ZXJVcCcpO1xuXG5cdFx0aWYoX3ByZXZlbnREZWZhdWx0RXZlbnRCZWhhdmlvdXIoZSwgZmFsc2UpKSB7XG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0fVxuXG5cdFx0dmFyIHJlbGVhc2VQb2ludDtcblxuXHRcdGlmKF9wb2ludGVyRXZlbnRFbmFibGVkKSB7XG5cdFx0XHR2YXIgcG9pbnRlckluZGV4ID0gZnJhbWV3b3JrLmFycmF5U2VhcmNoKF9jdXJyUG9pbnRlcnMsIGUucG9pbnRlcklkLCAnaWQnKTtcblx0XHRcdFxuXHRcdFx0aWYocG9pbnRlckluZGV4ID4gLTEpIHtcblx0XHRcdFx0cmVsZWFzZVBvaW50ID0gX2N1cnJQb2ludGVycy5zcGxpY2UocG9pbnRlckluZGV4LCAxKVswXTtcblxuXHRcdFx0XHRpZihuYXZpZ2F0b3IucG9pbnRlckVuYWJsZWQpIHtcblx0XHRcdFx0XHRyZWxlYXNlUG9pbnQudHlwZSA9IGUucG9pbnRlclR5cGUgfHwgJ21vdXNlJztcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR2YXIgTVNQT0lOVEVSX1RZUEVTID0ge1xuXHRcdFx0XHRcdFx0NDogJ21vdXNlJywgLy8gZXZlbnQuTVNQT0lOVEVSX1RZUEVfTU9VU0Vcblx0XHRcdFx0XHRcdDI6ICd0b3VjaCcsIC8vIGV2ZW50Lk1TUE9JTlRFUl9UWVBFX1RPVUNIIFxuXHRcdFx0XHRcdFx0MzogJ3BlbicgLy8gZXZlbnQuTVNQT0lOVEVSX1RZUEVfUEVOXG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRyZWxlYXNlUG9pbnQudHlwZSA9IE1TUE9JTlRFUl9UWVBFU1tlLnBvaW50ZXJUeXBlXTtcblxuXHRcdFx0XHRcdGlmKCFyZWxlYXNlUG9pbnQudHlwZSkge1xuXHRcdFx0XHRcdFx0cmVsZWFzZVBvaW50LnR5cGUgPSBlLnBvaW50ZXJUeXBlIHx8ICdtb3VzZSc7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdH1cblx0XHR9XG5cblx0XHR2YXIgdG91Y2hMaXN0ID0gX2dldFRvdWNoUG9pbnRzKGUpLFxuXHRcdFx0Z2VzdHVyZVR5cGUsXG5cdFx0XHRudW1Qb2ludHMgPSB0b3VjaExpc3QubGVuZ3RoO1xuXG5cdFx0aWYoZS50eXBlID09PSAnbW91c2V1cCcpIHtcblx0XHRcdG51bVBvaW50cyA9IDA7XG5cdFx0fVxuXG5cdFx0Ly8gRG8gbm90aGluZyBpZiB0aGVyZSB3ZXJlIDMgdG91Y2ggcG9pbnRzIG9yIG1vcmVcblx0XHRpZihudW1Qb2ludHMgPT09IDIpIHtcblx0XHRcdF9jdXJyZW50UG9pbnRzID0gbnVsbDtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblxuXHRcdC8vIGlmIHNlY29uZCBwb2ludGVyIHJlbGVhc2VkXG5cdFx0aWYobnVtUG9pbnRzID09PSAxKSB7XG5cdFx0XHRfZXF1YWxpemVQb2ludHMoX3N0YXJ0UG9pbnQsIHRvdWNoTGlzdFswXSk7XG5cdFx0fVx0XHRcdFx0XG5cblxuXHRcdC8vIHBvaW50ZXIgaGFzbid0IG1vdmVkLCBzZW5kIFwidGFwIHJlbGVhc2VcIiBwb2ludFxuXHRcdGlmKG51bVBvaW50cyA9PT0gMCAmJiAhX2RpcmVjdGlvbiAmJiAhX21haW5TY3JvbGxBbmltYXRpbmcpIHtcblx0XHRcdGlmKCFyZWxlYXNlUG9pbnQpIHtcblx0XHRcdFx0aWYoZS50eXBlID09PSAnbW91c2V1cCcpIHtcblx0XHRcdFx0XHRyZWxlYXNlUG9pbnQgPSB7eDogZS5wYWdlWCwgeTogZS5wYWdlWSwgdHlwZTonbW91c2UnfTtcblx0XHRcdFx0fSBlbHNlIGlmKGUuY2hhbmdlZFRvdWNoZXMgJiYgZS5jaGFuZ2VkVG91Y2hlc1swXSkge1xuXHRcdFx0XHRcdHJlbGVhc2VQb2ludCA9IHt4OiBlLmNoYW5nZWRUb3VjaGVzWzBdLnBhZ2VYLCB5OiBlLmNoYW5nZWRUb3VjaGVzWzBdLnBhZ2VZLCB0eXBlOid0b3VjaCd9O1xuXHRcdFx0XHR9XHRcdFxuXHRcdFx0fVxuXG5cdFx0XHRfc2hvdXQoJ3RvdWNoUmVsZWFzZScsIGUsIHJlbGVhc2VQb2ludCk7XG5cdFx0fVxuXG5cdFx0Ly8gRGlmZmVyZW5jZSBpbiB0aW1lIGJldHdlZW4gcmVsZWFzaW5nIG9mIHR3byBsYXN0IHRvdWNoIHBvaW50cyAoem9vbSBnZXN0dXJlKVxuXHRcdHZhciByZWxlYXNlVGltZURpZmYgPSAtMTtcblxuXHRcdC8vIEdlc3R1cmUgY29tcGxldGVkLCBubyBwb2ludGVycyBsZWZ0XG5cdFx0aWYobnVtUG9pbnRzID09PSAwKSB7XG5cdFx0XHRfaXNEcmFnZ2luZyA9IGZhbHNlO1xuXHRcdFx0ZnJhbWV3b3JrLnVuYmluZCh3aW5kb3csIF91cE1vdmVFdmVudHMsIHNlbGYpO1xuXG5cdFx0XHRfc3RvcERyYWdVcGRhdGVMb29wKCk7XG5cblx0XHRcdGlmKF9pc1pvb21pbmcpIHtcblx0XHRcdFx0Ly8gVHdvIHBvaW50cyByZWxlYXNlZCBhdCB0aGUgc2FtZSB0aW1lXG5cdFx0XHRcdHJlbGVhc2VUaW1lRGlmZiA9IDA7XG5cdFx0XHR9IGVsc2UgaWYoX2xhc3RSZWxlYXNlVGltZSAhPT0gLTEpIHtcblx0XHRcdFx0cmVsZWFzZVRpbWVEaWZmID0gX2dldEN1cnJlbnRUaW1lKCkgLSBfbGFzdFJlbGVhc2VUaW1lO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRfbGFzdFJlbGVhc2VUaW1lID0gbnVtUG9pbnRzID09PSAxID8gX2dldEN1cnJlbnRUaW1lKCkgOiAtMTtcblx0XHRcblx0XHRpZihyZWxlYXNlVGltZURpZmYgIT09IC0xICYmIHJlbGVhc2VUaW1lRGlmZiA8IDE1MCkge1xuXHRcdFx0Z2VzdHVyZVR5cGUgPSAnem9vbSc7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGdlc3R1cmVUeXBlID0gJ3N3aXBlJztcblx0XHR9XG5cblx0XHRpZihfaXNab29taW5nICYmIG51bVBvaW50cyA8IDIpIHtcblx0XHRcdF9pc1pvb21pbmcgPSBmYWxzZTtcblxuXHRcdFx0Ly8gT25seSBzZWNvbmQgcG9pbnQgcmVsZWFzZWRcblx0XHRcdGlmKG51bVBvaW50cyA9PT0gMSkge1xuXHRcdFx0XHRnZXN0dXJlVHlwZSA9ICd6b29tUG9pbnRlclVwJztcblx0XHRcdH1cblx0XHRcdF9zaG91dCgnem9vbUdlc3R1cmVFbmRlZCcpO1xuXHRcdH1cblxuXHRcdF9jdXJyZW50UG9pbnRzID0gbnVsbDtcblx0XHRpZighX21vdmVkICYmICFfem9vbVN0YXJ0ZWQgJiYgIV9tYWluU2Nyb2xsQW5pbWF0aW5nICYmICFfdmVydGljYWxEcmFnSW5pdGlhdGVkKSB7XG5cdFx0XHQvLyBub3RoaW5nIHRvIGFuaW1hdGVcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFxuXHRcdF9zdG9wQWxsQW5pbWF0aW9ucygpO1xuXG5cdFx0XG5cdFx0aWYoIV9yZWxlYXNlQW5pbURhdGEpIHtcblx0XHRcdF9yZWxlYXNlQW5pbURhdGEgPSBfaW5pdERyYWdSZWxlYXNlQW5pbWF0aW9uRGF0YSgpO1xuXHRcdH1cblx0XHRcblx0XHRfcmVsZWFzZUFuaW1EYXRhLmNhbGN1bGF0ZVN3aXBlU3BlZWQoJ3gnKTtcblxuXG5cdFx0aWYoX3ZlcnRpY2FsRHJhZ0luaXRpYXRlZCkge1xuXG5cdFx0XHR2YXIgb3BhY2l0eVJhdGlvID0gX2NhbGN1bGF0ZVZlcnRpY2FsRHJhZ09wYWNpdHlSYXRpbygpO1xuXG5cdFx0XHRpZihvcGFjaXR5UmF0aW8gPCBfb3B0aW9ucy52ZXJ0aWNhbERyYWdSYW5nZSkge1xuXHRcdFx0XHRzZWxmLmNsb3NlKCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR2YXIgaW5pdGFsUGFuWSA9IF9wYW5PZmZzZXQueSxcblx0XHRcdFx0XHRpbml0aWFsQmdPcGFjaXR5ID0gX2JnT3BhY2l0eTtcblxuXHRcdFx0XHRfYW5pbWF0ZVByb3AoJ3ZlcnRpY2FsRHJhZycsIDAsIDEsIDMwMCwgZnJhbWV3b3JrLmVhc2luZy5jdWJpYy5vdXQsIGZ1bmN0aW9uKG5vdykge1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdF9wYW5PZmZzZXQueSA9IChzZWxmLmN1cnJJdGVtLmluaXRpYWxQb3NpdGlvbi55IC0gaW5pdGFsUGFuWSkgKiBub3cgKyBpbml0YWxQYW5ZO1xuXG5cdFx0XHRcdFx0X2FwcGx5QmdPcGFjaXR5KCAgKDEgLSBpbml0aWFsQmdPcGFjaXR5KSAqIG5vdyArIGluaXRpYWxCZ09wYWNpdHkgKTtcblx0XHRcdFx0XHRfYXBwbHlDdXJyZW50Wm9vbVBhbigpO1xuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHRfc2hvdXQoJ29uVmVydGljYWxEcmFnJywgMSk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybjtcblx0XHR9XG5cblxuXHRcdC8vIG1haW4gc2Nyb2xsIFxuXHRcdGlmKCAgKF9tYWluU2Nyb2xsU2hpZnRlZCB8fCBfbWFpblNjcm9sbEFuaW1hdGluZykgJiYgbnVtUG9pbnRzID09PSAwKSB7XG5cdFx0XHR2YXIgaXRlbUNoYW5nZWQgPSBfZmluaXNoU3dpcGVNYWluU2Nyb2xsR2VzdHVyZShnZXN0dXJlVHlwZSwgX3JlbGVhc2VBbmltRGF0YSk7XG5cdFx0XHRpZihpdGVtQ2hhbmdlZCkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRnZXN0dXJlVHlwZSA9ICd6b29tUG9pbnRlclVwJztcblx0XHR9XG5cblx0XHQvLyBwcmV2ZW50IHpvb20vcGFuIGFuaW1hdGlvbiB3aGVuIG1haW4gc2Nyb2xsIGFuaW1hdGlvbiBydW5zXG5cdFx0aWYoX21haW5TY3JvbGxBbmltYXRpbmcpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0XG5cdFx0Ly8gQ29tcGxldGUgc2ltcGxlIHpvb20gZ2VzdHVyZSAocmVzZXQgem9vbSBsZXZlbCBpZiBpdCdzIG91dCBvZiB0aGUgYm91bmRzKSAgXG5cdFx0aWYoZ2VzdHVyZVR5cGUgIT09ICdzd2lwZScpIHtcblx0XHRcdF9jb21wbGV0ZVpvb21HZXN0dXJlKCk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcblx0XHQvLyBDb21wbGV0ZSBwYW4gZ2VzdHVyZSBpZiBtYWluIHNjcm9sbCBpcyBub3Qgc2hpZnRlZCwgYW5kIGl0J3MgcG9zc2libGUgdG8gcGFuIGN1cnJlbnQgaW1hZ2Vcblx0XHRpZighX21haW5TY3JvbGxTaGlmdGVkICYmIF9jdXJyWm9vbUxldmVsID4gc2VsZi5jdXJySXRlbS5maXRSYXRpbykge1xuXHRcdFx0X2NvbXBsZXRlUGFuR2VzdHVyZShfcmVsZWFzZUFuaW1EYXRhKTtcblx0XHR9XG5cdH0sXG5cblxuXHQvLyBSZXR1cm5zIG9iamVjdCB3aXRoIGRhdGEgYWJvdXQgZ2VzdHVyZVxuXHQvLyBJdCdzIGNyZWF0ZWQgb25seSBvbmNlIGFuZCB0aGVuIHJldXNlZFxuXHRfaW5pdERyYWdSZWxlYXNlQW5pbWF0aW9uRGF0YSAgPSBmdW5jdGlvbigpIHtcblx0XHQvLyB0ZW1wIGxvY2FsIHZhcnNcblx0XHR2YXIgbGFzdEZsaWNrRHVyYXRpb24sXG5cdFx0XHR0ZW1wUmVsZWFzZVBvcztcblxuXHRcdC8vIHMgPSB0aGlzXG5cdFx0dmFyIHMgPSB7XG5cdFx0XHRsYXN0RmxpY2tPZmZzZXQ6IHt9LFxuXHRcdFx0bGFzdEZsaWNrRGlzdDoge30sXG5cdFx0XHRsYXN0RmxpY2tTcGVlZDoge30sXG5cdFx0XHRzbG93RG93blJhdGlvOiAge30sXG5cdFx0XHRzbG93RG93blJhdGlvUmV2ZXJzZTogIHt9LFxuXHRcdFx0c3BlZWREZWNlbGVyYXRpb25SYXRpbzogIHt9LFxuXHRcdFx0c3BlZWREZWNlbGVyYXRpb25SYXRpb0FiczogIHt9LFxuXHRcdFx0ZGlzdGFuY2VPZmZzZXQ6ICB7fSxcblx0XHRcdGJhY2tBbmltRGVzdGluYXRpb246IHt9LFxuXHRcdFx0YmFja0FuaW1TdGFydGVkOiB7fSxcblx0XHRcdGNhbGN1bGF0ZVN3aXBlU3BlZWQ6IGZ1bmN0aW9uKGF4aXMpIHtcblx0XHRcdFx0XG5cblx0XHRcdFx0aWYoIF9wb3NQb2ludHMubGVuZ3RoID4gMSkge1xuXHRcdFx0XHRcdGxhc3RGbGlja0R1cmF0aW9uID0gX2dldEN1cnJlbnRUaW1lKCkgLSBfZ2VzdHVyZUNoZWNrU3BlZWRUaW1lICsgNTA7XG5cdFx0XHRcdFx0dGVtcFJlbGVhc2VQb3MgPSBfcG9zUG9pbnRzW19wb3NQb2ludHMubGVuZ3RoLTJdW2F4aXNdO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGxhc3RGbGlja0R1cmF0aW9uID0gX2dldEN1cnJlbnRUaW1lKCkgLSBfZ2VzdHVyZVN0YXJ0VGltZTsgLy8gdG90YWwgZ2VzdHVyZSBkdXJhdGlvblxuXHRcdFx0XHRcdHRlbXBSZWxlYXNlUG9zID0gX3N0YXJ0UG9pbnRbYXhpc107XG5cdFx0XHRcdH1cblx0XHRcdFx0cy5sYXN0RmxpY2tPZmZzZXRbYXhpc10gPSBfY3VyclBvaW50W2F4aXNdIC0gdGVtcFJlbGVhc2VQb3M7XG5cdFx0XHRcdHMubGFzdEZsaWNrRGlzdFtheGlzXSA9IE1hdGguYWJzKHMubGFzdEZsaWNrT2Zmc2V0W2F4aXNdKTtcblx0XHRcdFx0aWYocy5sYXN0RmxpY2tEaXN0W2F4aXNdID4gMjApIHtcblx0XHRcdFx0XHRzLmxhc3RGbGlja1NwZWVkW2F4aXNdID0gcy5sYXN0RmxpY2tPZmZzZXRbYXhpc10gLyBsYXN0RmxpY2tEdXJhdGlvbjtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRzLmxhc3RGbGlja1NwZWVkW2F4aXNdID0gMDtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiggTWF0aC5hYnMocy5sYXN0RmxpY2tTcGVlZFtheGlzXSkgPCAwLjEgKSB7XG5cdFx0XHRcdFx0cy5sYXN0RmxpY2tTcGVlZFtheGlzXSA9IDA7XG5cdFx0XHRcdH1cblx0XHRcdFx0XG5cdFx0XHRcdHMuc2xvd0Rvd25SYXRpb1theGlzXSA9IDAuOTU7XG5cdFx0XHRcdHMuc2xvd0Rvd25SYXRpb1JldmVyc2VbYXhpc10gPSAxIC0gcy5zbG93RG93blJhdGlvW2F4aXNdO1xuXHRcdFx0XHRzLnNwZWVkRGVjZWxlcmF0aW9uUmF0aW9bYXhpc10gPSAxO1xuXHRcdFx0fSxcblxuXHRcdFx0Y2FsY3VsYXRlT3ZlckJvdW5kc0FuaW1PZmZzZXQ6IGZ1bmN0aW9uKGF4aXMsIHNwZWVkKSB7XG5cdFx0XHRcdGlmKCFzLmJhY2tBbmltU3RhcnRlZFtheGlzXSkge1xuXG5cdFx0XHRcdFx0aWYoX3Bhbk9mZnNldFtheGlzXSA+IF9jdXJyUGFuQm91bmRzLm1pbltheGlzXSkge1xuXHRcdFx0XHRcdFx0cy5iYWNrQW5pbURlc3RpbmF0aW9uW2F4aXNdID0gX2N1cnJQYW5Cb3VuZHMubWluW2F4aXNdO1xuXHRcdFx0XHRcdFx0XG5cdFx0XHRcdFx0fSBlbHNlIGlmKF9wYW5PZmZzZXRbYXhpc10gPCBfY3VyclBhbkJvdW5kcy5tYXhbYXhpc10pIHtcblx0XHRcdFx0XHRcdHMuYmFja0FuaW1EZXN0aW5hdGlvbltheGlzXSA9IF9jdXJyUGFuQm91bmRzLm1heFtheGlzXTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZihzLmJhY2tBbmltRGVzdGluYXRpb25bYXhpc10gIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdFx0cy5zbG93RG93blJhdGlvW2F4aXNdID0gMC43O1xuXHRcdFx0XHRcdFx0cy5zbG93RG93blJhdGlvUmV2ZXJzZVtheGlzXSA9IDEgLSBzLnNsb3dEb3duUmF0aW9bYXhpc107XG5cdFx0XHRcdFx0XHRpZihzLnNwZWVkRGVjZWxlcmF0aW9uUmF0aW9BYnNbYXhpc10gPCAwLjA1KSB7XG5cblx0XHRcdFx0XHRcdFx0cy5sYXN0RmxpY2tTcGVlZFtheGlzXSA9IDA7XG5cdFx0XHRcdFx0XHRcdHMuYmFja0FuaW1TdGFydGVkW2F4aXNdID0gdHJ1ZTtcblxuXHRcdFx0XHRcdFx0XHRfYW5pbWF0ZVByb3AoJ2JvdW5jZVpvb21QYW4nK2F4aXMsX3Bhbk9mZnNldFtheGlzXSwgXG5cdFx0XHRcdFx0XHRcdFx0cy5iYWNrQW5pbURlc3RpbmF0aW9uW2F4aXNdLCBcblx0XHRcdFx0XHRcdFx0XHRzcGVlZCB8fCAzMDAsIFxuXHRcdFx0XHRcdFx0XHRcdGZyYW1ld29yay5lYXNpbmcuc2luZS5vdXQsIFxuXHRcdFx0XHRcdFx0XHRcdGZ1bmN0aW9uKHBvcykge1xuXHRcdFx0XHRcdFx0XHRcdFx0X3Bhbk9mZnNldFtheGlzXSA9IHBvcztcblx0XHRcdFx0XHRcdFx0XHRcdF9hcHBseUN1cnJlbnRab29tUGFuKCk7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHQpO1xuXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXG5cdFx0XHQvLyBSZWR1Y2VzIHRoZSBzcGVlZCBieSBzbG93RG93blJhdGlvIChwZXIgMTBtcylcblx0XHRcdGNhbGN1bGF0ZUFuaW1PZmZzZXQ6IGZ1bmN0aW9uKGF4aXMpIHtcblx0XHRcdFx0aWYoIXMuYmFja0FuaW1TdGFydGVkW2F4aXNdKSB7XG5cdFx0XHRcdFx0cy5zcGVlZERlY2VsZXJhdGlvblJhdGlvW2F4aXNdID0gcy5zcGVlZERlY2VsZXJhdGlvblJhdGlvW2F4aXNdICogKHMuc2xvd0Rvd25SYXRpb1theGlzXSArIFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0cy5zbG93RG93blJhdGlvUmV2ZXJzZVtheGlzXSAtIFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0cy5zbG93RG93blJhdGlvUmV2ZXJzZVtheGlzXSAqIHMudGltZURpZmYgLyAxMCk7XG5cblx0XHRcdFx0XHRzLnNwZWVkRGVjZWxlcmF0aW9uUmF0aW9BYnNbYXhpc10gPSBNYXRoLmFicyhzLmxhc3RGbGlja1NwZWVkW2F4aXNdICogcy5zcGVlZERlY2VsZXJhdGlvblJhdGlvW2F4aXNdKTtcblx0XHRcdFx0XHRzLmRpc3RhbmNlT2Zmc2V0W2F4aXNdID0gcy5sYXN0RmxpY2tTcGVlZFtheGlzXSAqIHMuc3BlZWREZWNlbGVyYXRpb25SYXRpb1theGlzXSAqIHMudGltZURpZmY7XG5cdFx0XHRcdFx0X3Bhbk9mZnNldFtheGlzXSArPSBzLmRpc3RhbmNlT2Zmc2V0W2F4aXNdO1xuXG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cblx0XHRcdHBhbkFuaW1Mb29wOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0aWYgKCBfYW5pbWF0aW9ucy56b29tUGFuICkge1xuXHRcdFx0XHRcdF9hbmltYXRpb25zLnpvb21QYW4ucmFmID0gX3JlcXVlc3RBRihzLnBhbkFuaW1Mb29wKTtcblxuXHRcdFx0XHRcdHMubm93ID0gX2dldEN1cnJlbnRUaW1lKCk7XG5cdFx0XHRcdFx0cy50aW1lRGlmZiA9IHMubm93IC0gcy5sYXN0Tm93O1xuXHRcdFx0XHRcdHMubGFzdE5vdyA9IHMubm93O1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdHMuY2FsY3VsYXRlQW5pbU9mZnNldCgneCcpO1xuXHRcdFx0XHRcdHMuY2FsY3VsYXRlQW5pbU9mZnNldCgneScpO1xuXG5cdFx0XHRcdFx0X2FwcGx5Q3VycmVudFpvb21QYW4oKTtcblx0XHRcdFx0XHRcblx0XHRcdFx0XHRzLmNhbGN1bGF0ZU92ZXJCb3VuZHNBbmltT2Zmc2V0KCd4Jyk7XG5cdFx0XHRcdFx0cy5jYWxjdWxhdGVPdmVyQm91bmRzQW5pbU9mZnNldCgneScpO1xuXG5cblx0XHRcdFx0XHRpZiAocy5zcGVlZERlY2VsZXJhdGlvblJhdGlvQWJzLnggPCAwLjA1ICYmIHMuc3BlZWREZWNlbGVyYXRpb25SYXRpb0Ficy55IDwgMC4wNSkge1xuXG5cdFx0XHRcdFx0XHQvLyByb3VuZCBwYW4gcG9zaXRpb25cblx0XHRcdFx0XHRcdF9wYW5PZmZzZXQueCA9IE1hdGgucm91bmQoX3Bhbk9mZnNldC54KTtcblx0XHRcdFx0XHRcdF9wYW5PZmZzZXQueSA9IE1hdGgucm91bmQoX3Bhbk9mZnNldC55KTtcblx0XHRcdFx0XHRcdF9hcHBseUN1cnJlbnRab29tUGFuKCk7XG5cdFx0XHRcdFx0XHRcblx0XHRcdFx0XHRcdF9zdG9wQW5pbWF0aW9uKCd6b29tUGFuJyk7XG5cdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdH1cblx0XHR9O1xuXHRcdHJldHVybiBzO1xuXHR9LFxuXG5cdF9jb21wbGV0ZVBhbkdlc3R1cmUgPSBmdW5jdGlvbihhbmltRGF0YSkge1xuXHRcdC8vIGNhbGN1bGF0ZSBzd2lwZSBzcGVlZCBmb3IgWSBheGlzIChwYWFubmluZylcblx0XHRhbmltRGF0YS5jYWxjdWxhdGVTd2lwZVNwZWVkKCd5Jyk7XG5cblx0XHRfY3VyclBhbkJvdW5kcyA9IHNlbGYuY3Vyckl0ZW0uYm91bmRzO1xuXHRcdFxuXHRcdGFuaW1EYXRhLmJhY2tBbmltRGVzdGluYXRpb24gPSB7fTtcblx0XHRhbmltRGF0YS5iYWNrQW5pbVN0YXJ0ZWQgPSB7fTtcblxuXHRcdC8vIEF2b2lkIGFjY2VsZXJhdGlvbiBhbmltYXRpb24gaWYgc3BlZWQgaXMgdG9vIGxvd1xuXHRcdGlmKE1hdGguYWJzKGFuaW1EYXRhLmxhc3RGbGlja1NwZWVkLngpIDw9IDAuMDUgJiYgTWF0aC5hYnMoYW5pbURhdGEubGFzdEZsaWNrU3BlZWQueSkgPD0gMC4wNSApIHtcblx0XHRcdGFuaW1EYXRhLnNwZWVkRGVjZWxlcmF0aW9uUmF0aW9BYnMueCA9IGFuaW1EYXRhLnNwZWVkRGVjZWxlcmF0aW9uUmF0aW9BYnMueSA9IDA7XG5cblx0XHRcdC8vIFJ1biBwYW4gZHJhZyByZWxlYXNlIGFuaW1hdGlvbi4gRS5nLiBpZiB5b3UgZHJhZyBpbWFnZSBhbmQgcmVsZWFzZSBmaW5nZXIgd2l0aG91dCBtb21lbnR1bS5cblx0XHRcdGFuaW1EYXRhLmNhbGN1bGF0ZU92ZXJCb3VuZHNBbmltT2Zmc2V0KCd4Jyk7XG5cdFx0XHRhbmltRGF0YS5jYWxjdWxhdGVPdmVyQm91bmRzQW5pbU9mZnNldCgneScpO1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXG5cdFx0Ly8gQW5pbWF0aW9uIGxvb3AgdGhhdCBjb250cm9scyB0aGUgYWNjZWxlcmF0aW9uIGFmdGVyIHBhbiBnZXN0dXJlIGVuZHNcblx0XHRfcmVnaXN0ZXJTdGFydEFuaW1hdGlvbignem9vbVBhbicpO1xuXHRcdGFuaW1EYXRhLmxhc3ROb3cgPSBfZ2V0Q3VycmVudFRpbWUoKTtcblx0XHRhbmltRGF0YS5wYW5BbmltTG9vcCgpO1xuXHR9LFxuXG5cblx0X2ZpbmlzaFN3aXBlTWFpblNjcm9sbEdlc3R1cmUgPSBmdW5jdGlvbihnZXN0dXJlVHlwZSwgX3JlbGVhc2VBbmltRGF0YSkge1xuXHRcdHZhciBpdGVtQ2hhbmdlZDtcblx0XHRpZighX21haW5TY3JvbGxBbmltYXRpbmcpIHtcblx0XHRcdF9jdXJyWm9vbWVkSXRlbUluZGV4ID0gX2N1cnJlbnRJdGVtSW5kZXg7XG5cdFx0fVxuXG5cblx0XHRcblx0XHR2YXIgaXRlbXNEaWZmO1xuXG5cdFx0aWYoZ2VzdHVyZVR5cGUgPT09ICdzd2lwZScpIHtcblx0XHRcdHZhciB0b3RhbFNoaWZ0RGlzdCA9IF9jdXJyUG9pbnQueCAtIF9zdGFydFBvaW50LngsXG5cdFx0XHRcdGlzRmFzdExhc3RGbGljayA9IF9yZWxlYXNlQW5pbURhdGEubGFzdEZsaWNrRGlzdC54IDwgMTA7XG5cblx0XHRcdC8vIGlmIGNvbnRhaW5lciBpcyBzaGlmdGVkIGZvciBtb3JlIHRoYW4gTUlOX1NXSVBFX0RJU1RBTkNFLCBcblx0XHRcdC8vIGFuZCBsYXN0IGZsaWNrIGdlc3R1cmUgd2FzIGluIHJpZ2h0IGRpcmVjdGlvblxuXHRcdFx0aWYodG90YWxTaGlmdERpc3QgPiBNSU5fU1dJUEVfRElTVEFOQ0UgJiYgXG5cdFx0XHRcdChpc0Zhc3RMYXN0RmxpY2sgfHwgX3JlbGVhc2VBbmltRGF0YS5sYXN0RmxpY2tPZmZzZXQueCA+IDIwKSApIHtcblx0XHRcdFx0Ly8gZ28gdG8gcHJldiBpdGVtXG5cdFx0XHRcdGl0ZW1zRGlmZiA9IC0xO1xuXHRcdFx0fSBlbHNlIGlmKHRvdGFsU2hpZnREaXN0IDwgLU1JTl9TV0lQRV9ESVNUQU5DRSAmJiBcblx0XHRcdFx0KGlzRmFzdExhc3RGbGljayB8fCBfcmVsZWFzZUFuaW1EYXRhLmxhc3RGbGlja09mZnNldC54IDwgLTIwKSApIHtcblx0XHRcdFx0Ly8gZ28gdG8gbmV4dCBpdGVtXG5cdFx0XHRcdGl0ZW1zRGlmZiA9IDE7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dmFyIG5leHRDaXJjbGU7XG5cblx0XHRpZihpdGVtc0RpZmYpIHtcblx0XHRcdFxuXHRcdFx0X2N1cnJlbnRJdGVtSW5kZXggKz0gaXRlbXNEaWZmO1xuXG5cdFx0XHRpZihfY3VycmVudEl0ZW1JbmRleCA8IDApIHtcblx0XHRcdFx0X2N1cnJlbnRJdGVtSW5kZXggPSBfb3B0aW9ucy5sb29wID8gX2dldE51bUl0ZW1zKCktMSA6IDA7XG5cdFx0XHRcdG5leHRDaXJjbGUgPSB0cnVlO1xuXHRcdFx0fSBlbHNlIGlmKF9jdXJyZW50SXRlbUluZGV4ID49IF9nZXROdW1JdGVtcygpKSB7XG5cdFx0XHRcdF9jdXJyZW50SXRlbUluZGV4ID0gX29wdGlvbnMubG9vcCA/IDAgOiBfZ2V0TnVtSXRlbXMoKS0xO1xuXHRcdFx0XHRuZXh0Q2lyY2xlID0gdHJ1ZTtcblx0XHRcdH1cblxuXHRcdFx0aWYoIW5leHRDaXJjbGUgfHwgX29wdGlvbnMubG9vcCkge1xuXHRcdFx0XHRfaW5kZXhEaWZmICs9IGl0ZW1zRGlmZjtcblx0XHRcdFx0X2N1cnJQb3NpdGlvbkluZGV4IC09IGl0ZW1zRGlmZjtcblx0XHRcdFx0aXRlbUNoYW5nZWQgPSB0cnVlO1xuXHRcdFx0fVxuXHRcdFx0XG5cblx0XHRcdFxuXHRcdH1cblxuXHRcdHZhciBhbmltYXRlVG9YID0gX3NsaWRlU2l6ZS54ICogX2N1cnJQb3NpdGlvbkluZGV4O1xuXHRcdHZhciBhbmltYXRlVG9EaXN0ID0gTWF0aC5hYnMoIGFuaW1hdGVUb1ggLSBfbWFpblNjcm9sbFBvcy54ICk7XG5cdFx0dmFyIGZpbmlzaEFuaW1EdXJhdGlvbjtcblxuXG5cdFx0aWYoIWl0ZW1DaGFuZ2VkICYmIGFuaW1hdGVUb1ggPiBfbWFpblNjcm9sbFBvcy54ICE9PSBfcmVsZWFzZUFuaW1EYXRhLmxhc3RGbGlja1NwZWVkLnggPiAwKSB7XG5cdFx0XHQvLyBcInJldHVybiB0byBjdXJyZW50XCIgZHVyYXRpb24sIGUuZy4gd2hlbiBkcmFnZ2luZyBmcm9tIHNsaWRlIDAgdG8gLTFcblx0XHRcdGZpbmlzaEFuaW1EdXJhdGlvbiA9IDMzMzsgXG5cdFx0fSBlbHNlIHtcblx0XHRcdGZpbmlzaEFuaW1EdXJhdGlvbiA9IE1hdGguYWJzKF9yZWxlYXNlQW5pbURhdGEubGFzdEZsaWNrU3BlZWQueCkgPiAwID8gXG5cdFx0XHRcdFx0XHRcdFx0XHRhbmltYXRlVG9EaXN0IC8gTWF0aC5hYnMoX3JlbGVhc2VBbmltRGF0YS5sYXN0RmxpY2tTcGVlZC54KSA6IFxuXHRcdFx0XHRcdFx0XHRcdFx0MzMzO1xuXG5cdFx0XHRmaW5pc2hBbmltRHVyYXRpb24gPSBNYXRoLm1pbihmaW5pc2hBbmltRHVyYXRpb24sIDQwMCk7XG5cdFx0XHRmaW5pc2hBbmltRHVyYXRpb24gPSBNYXRoLm1heChmaW5pc2hBbmltRHVyYXRpb24sIDI1MCk7XG5cdFx0fVxuXG5cdFx0aWYoX2N1cnJab29tZWRJdGVtSW5kZXggPT09IF9jdXJyZW50SXRlbUluZGV4KSB7XG5cdFx0XHRpdGVtQ2hhbmdlZCA9IGZhbHNlO1xuXHRcdH1cblx0XHRcblx0XHRfbWFpblNjcm9sbEFuaW1hdGluZyA9IHRydWU7XG5cdFx0XG5cdFx0X3Nob3V0KCdtYWluU2Nyb2xsQW5pbVN0YXJ0Jyk7XG5cblx0XHRfYW5pbWF0ZVByb3AoJ21haW5TY3JvbGwnLCBfbWFpblNjcm9sbFBvcy54LCBhbmltYXRlVG9YLCBmaW5pc2hBbmltRHVyYXRpb24sIGZyYW1ld29yay5lYXNpbmcuY3ViaWMub3V0LCBcblx0XHRcdF9tb3ZlTWFpblNjcm9sbCxcblx0XHRcdGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRfc3RvcEFsbEFuaW1hdGlvbnMoKTtcblx0XHRcdFx0X21haW5TY3JvbGxBbmltYXRpbmcgPSBmYWxzZTtcblx0XHRcdFx0X2N1cnJab29tZWRJdGVtSW5kZXggPSAtMTtcblx0XHRcdFx0XG5cdFx0XHRcdGlmKGl0ZW1DaGFuZ2VkIHx8IF9jdXJyWm9vbWVkSXRlbUluZGV4ICE9PSBfY3VycmVudEl0ZW1JbmRleCkge1xuXHRcdFx0XHRcdHNlbGYudXBkYXRlQ3Vyckl0ZW0oKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRcblx0XHRcdFx0X3Nob3V0KCdtYWluU2Nyb2xsQW5pbUNvbXBsZXRlJyk7XG5cdFx0XHR9XG5cdFx0KTtcblxuXHRcdGlmKGl0ZW1DaGFuZ2VkKSB7XG5cdFx0XHRzZWxmLnVwZGF0ZUN1cnJJdGVtKHRydWUpO1xuXHRcdH1cblxuXHRcdHJldHVybiBpdGVtQ2hhbmdlZDtcblx0fSxcblxuXHRfY2FsY3VsYXRlWm9vbUxldmVsID0gZnVuY3Rpb24odG91Y2hlc0Rpc3RhbmNlKSB7XG5cdFx0cmV0dXJuICAxIC8gX3N0YXJ0UG9pbnRzRGlzdGFuY2UgKiB0b3VjaGVzRGlzdGFuY2UgKiBfc3RhcnRab29tTGV2ZWw7XG5cdH0sXG5cblx0Ly8gUmVzZXRzIHpvb20gaWYgaXQncyBvdXQgb2YgYm91bmRzXG5cdF9jb21wbGV0ZVpvb21HZXN0dXJlID0gZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGRlc3Rab29tTGV2ZWwgPSBfY3Vyclpvb21MZXZlbCxcblx0XHRcdG1pblpvb21MZXZlbCA9IF9nZXRNaW5ab29tTGV2ZWwoKSxcblx0XHRcdG1heFpvb21MZXZlbCA9IF9nZXRNYXhab29tTGV2ZWwoKTtcblxuXHRcdGlmICggX2N1cnJab29tTGV2ZWwgPCBtaW5ab29tTGV2ZWwgKSB7XG5cdFx0XHRkZXN0Wm9vbUxldmVsID0gbWluWm9vbUxldmVsO1xuXHRcdH0gZWxzZSBpZiAoIF9jdXJyWm9vbUxldmVsID4gbWF4Wm9vbUxldmVsICkge1xuXHRcdFx0ZGVzdFpvb21MZXZlbCA9IG1heFpvb21MZXZlbDtcblx0XHR9XG5cblx0XHR2YXIgZGVzdE9wYWNpdHkgPSAxLFxuXHRcdFx0b25VcGRhdGUsXG5cdFx0XHRpbml0aWFsT3BhY2l0eSA9IF9iZ09wYWNpdHk7XG5cblx0XHRpZihfb3BhY2l0eUNoYW5nZWQgJiYgIV9pc1pvb21pbmdJbiAmJiAhX3dhc092ZXJJbml0aWFsWm9vbSAmJiBfY3Vyclpvb21MZXZlbCA8IG1pblpvb21MZXZlbCkge1xuXHRcdFx0Ly9fY2xvc2VkQnlTY3JvbGwgPSB0cnVlO1xuXHRcdFx0c2VsZi5jbG9zZSgpO1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXG5cdFx0aWYoX29wYWNpdHlDaGFuZ2VkKSB7XG5cdFx0XHRvblVwZGF0ZSA9IGZ1bmN0aW9uKG5vdykge1xuXHRcdFx0XHRfYXBwbHlCZ09wYWNpdHkoICAoZGVzdE9wYWNpdHkgLSBpbml0aWFsT3BhY2l0eSkgKiBub3cgKyBpbml0aWFsT3BhY2l0eSApO1xuXHRcdFx0fTtcblx0XHR9XG5cblx0XHRzZWxmLnpvb21UbyhkZXN0Wm9vbUxldmVsLCAwLCAyMDAsICBmcmFtZXdvcmsuZWFzaW5nLmN1YmljLm91dCwgb25VcGRhdGUpO1xuXHRcdHJldHVybiB0cnVlO1xuXHR9O1xuXG5cbl9yZWdpc3Rlck1vZHVsZSgnR2VzdHVyZXMnLCB7XG5cdHB1YmxpY01ldGhvZHM6IHtcblxuXHRcdGluaXRHZXN0dXJlczogZnVuY3Rpb24oKSB7XG5cblx0XHRcdC8vIGhlbHBlciBmdW5jdGlvbiB0aGF0IGJ1aWxkcyB0b3VjaC9wb2ludGVyL21vdXNlIGV2ZW50c1xuXHRcdFx0dmFyIGFkZEV2ZW50TmFtZXMgPSBmdW5jdGlvbihwcmVmLCBkb3duLCBtb3ZlLCB1cCwgY2FuY2VsKSB7XG5cdFx0XHRcdF9kcmFnU3RhcnRFdmVudCA9IHByZWYgKyBkb3duO1xuXHRcdFx0XHRfZHJhZ01vdmVFdmVudCA9IHByZWYgKyBtb3ZlO1xuXHRcdFx0XHRfZHJhZ0VuZEV2ZW50ID0gcHJlZiArIHVwO1xuXHRcdFx0XHRpZihjYW5jZWwpIHtcblx0XHRcdFx0XHRfZHJhZ0NhbmNlbEV2ZW50ID0gcHJlZiArIGNhbmNlbDtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRfZHJhZ0NhbmNlbEV2ZW50ID0gJyc7XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cblx0XHRcdF9wb2ludGVyRXZlbnRFbmFibGVkID0gX2ZlYXR1cmVzLnBvaW50ZXJFdmVudDtcblx0XHRcdGlmKF9wb2ludGVyRXZlbnRFbmFibGVkICYmIF9mZWF0dXJlcy50b3VjaCkge1xuXHRcdFx0XHQvLyB3ZSBkb24ndCBuZWVkIHRvdWNoIGV2ZW50cywgaWYgYnJvd3NlciBzdXBwb3J0cyBwb2ludGVyIGV2ZW50c1xuXHRcdFx0XHRfZmVhdHVyZXMudG91Y2ggPSBmYWxzZTtcblx0XHRcdH1cblxuXHRcdFx0aWYoX3BvaW50ZXJFdmVudEVuYWJsZWQpIHtcblx0XHRcdFx0aWYobmF2aWdhdG9yLnBvaW50ZXJFbmFibGVkKSB7XG5cdFx0XHRcdFx0YWRkRXZlbnROYW1lcygncG9pbnRlcicsICdkb3duJywgJ21vdmUnLCAndXAnLCAnY2FuY2VsJyk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Ly8gSUUxMCBwb2ludGVyIGV2ZW50cyBhcmUgY2FzZS1zZW5zaXRpdmVcblx0XHRcdFx0XHRhZGRFdmVudE5hbWVzKCdNU1BvaW50ZXInLCAnRG93bicsICdNb3ZlJywgJ1VwJywgJ0NhbmNlbCcpO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2UgaWYoX2ZlYXR1cmVzLnRvdWNoKSB7XG5cdFx0XHRcdGFkZEV2ZW50TmFtZXMoJ3RvdWNoJywgJ3N0YXJ0JywgJ21vdmUnLCAnZW5kJywgJ2NhbmNlbCcpO1xuXHRcdFx0XHRfbGlrZWx5VG91Y2hEZXZpY2UgPSB0cnVlO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0YWRkRXZlbnROYW1lcygnbW91c2UnLCAnZG93bicsICdtb3ZlJywgJ3VwJyk7XHRcblx0XHRcdH1cblxuXHRcdFx0X3VwTW92ZUV2ZW50cyA9IF9kcmFnTW92ZUV2ZW50ICsgJyAnICsgX2RyYWdFbmRFdmVudCAgKyAnICcgKyAgX2RyYWdDYW5jZWxFdmVudDtcblx0XHRcdF9kb3duRXZlbnRzID0gX2RyYWdTdGFydEV2ZW50O1xuXG5cdFx0XHRpZihfcG9pbnRlckV2ZW50RW5hYmxlZCAmJiAhX2xpa2VseVRvdWNoRGV2aWNlKSB7XG5cdFx0XHRcdF9saWtlbHlUb3VjaERldmljZSA9IChuYXZpZ2F0b3IubWF4VG91Y2hQb2ludHMgPiAxKSB8fCAobmF2aWdhdG9yLm1zTWF4VG91Y2hQb2ludHMgPiAxKTtcblx0XHRcdH1cblx0XHRcdC8vIG1ha2UgdmFyaWFibGUgcHVibGljXG5cdFx0XHRzZWxmLmxpa2VseVRvdWNoRGV2aWNlID0gX2xpa2VseVRvdWNoRGV2aWNlOyBcblx0XHRcdFxuXHRcdFx0X2dsb2JhbEV2ZW50SGFuZGxlcnNbX2RyYWdTdGFydEV2ZW50XSA9IF9vbkRyYWdTdGFydDtcblx0XHRcdF9nbG9iYWxFdmVudEhhbmRsZXJzW19kcmFnTW92ZUV2ZW50XSA9IF9vbkRyYWdNb3ZlO1xuXHRcdFx0X2dsb2JhbEV2ZW50SGFuZGxlcnNbX2RyYWdFbmRFdmVudF0gPSBfb25EcmFnUmVsZWFzZTsgLy8gdGhlIEtyYWtlblxuXG5cdFx0XHRpZihfZHJhZ0NhbmNlbEV2ZW50KSB7XG5cdFx0XHRcdF9nbG9iYWxFdmVudEhhbmRsZXJzW19kcmFnQ2FuY2VsRXZlbnRdID0gX2dsb2JhbEV2ZW50SGFuZGxlcnNbX2RyYWdFbmRFdmVudF07XG5cdFx0XHR9XG5cblx0XHRcdC8vIEJpbmQgbW91c2UgZXZlbnRzIG9uIGRldmljZSB3aXRoIGRldGVjdGVkIGhhcmR3YXJlIHRvdWNoIHN1cHBvcnQsIGluIGNhc2UgaXQgc3VwcG9ydHMgbXVsdGlwbGUgdHlwZXMgb2YgaW5wdXQuXG5cdFx0XHRpZihfZmVhdHVyZXMudG91Y2gpIHtcblx0XHRcdFx0X2Rvd25FdmVudHMgKz0gJyBtb3VzZWRvd24nO1xuXHRcdFx0XHRfdXBNb3ZlRXZlbnRzICs9ICcgbW91c2Vtb3ZlIG1vdXNldXAnO1xuXHRcdFx0XHRfZ2xvYmFsRXZlbnRIYW5kbGVycy5tb3VzZWRvd24gPSBfZ2xvYmFsRXZlbnRIYW5kbGVyc1tfZHJhZ1N0YXJ0RXZlbnRdO1xuXHRcdFx0XHRfZ2xvYmFsRXZlbnRIYW5kbGVycy5tb3VzZW1vdmUgPSBfZ2xvYmFsRXZlbnRIYW5kbGVyc1tfZHJhZ01vdmVFdmVudF07XG5cdFx0XHRcdF9nbG9iYWxFdmVudEhhbmRsZXJzLm1vdXNldXAgPSBfZ2xvYmFsRXZlbnRIYW5kbGVyc1tfZHJhZ0VuZEV2ZW50XTtcblx0XHRcdH1cblxuXHRcdFx0aWYoIV9saWtlbHlUb3VjaERldmljZSkge1xuXHRcdFx0XHQvLyBkb24ndCBhbGxvdyBwYW4gdG8gbmV4dCBzbGlkZSBmcm9tIHpvb21lZCBzdGF0ZSBvbiBEZXNrdG9wXG5cdFx0XHRcdF9vcHRpb25zLmFsbG93UGFuVG9OZXh0ID0gZmFsc2U7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdH1cbn0pO1xuXG5cbi8qPj5nZXN0dXJlcyovXG5cbi8qPj5zaG93LWhpZGUtdHJhbnNpdGlvbiovXG4vKipcbiAqIHNob3ctaGlkZS10cmFuc2l0aW9uLmpzOlxuICpcbiAqIE1hbmFnZXMgaW5pdGlhbCBvcGVuaW5nIG9yIGNsb3NpbmcgdHJhbnNpdGlvbi5cbiAqXG4gKiBJZiB5b3UncmUgbm90IHBsYW5uaW5nIHRvIHVzZSB0cmFuc2l0aW9uIGZvciBnYWxsZXJ5IGF0IGFsbCxcbiAqIHlvdSBtYXkgc2V0IG9wdGlvbnMgaGlkZUFuaW1hdGlvbkR1cmF0aW9uIGFuZCBzaG93QW5pbWF0aW9uRHVyYXRpb24gdG8gMCxcbiAqIGFuZCBqdXN0IGRlbGV0ZSBzdGFydEFuaW1hdGlvbiBmdW5jdGlvbi5cbiAqIFxuICovXG5cblxudmFyIF9zaG93T3JIaWRlVGltZW91dCxcblx0X3Nob3dPckhpZGUgPSBmdW5jdGlvbihpdGVtLCBpbWcsIG91dCwgY29tcGxldGVGbikge1xuXG5cdFx0aWYoX3Nob3dPckhpZGVUaW1lb3V0KSB7XG5cdFx0XHRjbGVhclRpbWVvdXQoX3Nob3dPckhpZGVUaW1lb3V0KTtcblx0XHR9XG5cblx0XHRfaW5pdGlhbFpvb21SdW5uaW5nID0gdHJ1ZTtcblx0XHRfaW5pdGlhbENvbnRlbnRTZXQgPSB0cnVlO1xuXHRcdFxuXHRcdC8vIGRpbWVuc2lvbnMgb2Ygc21hbGwgdGh1bWJuYWlsIHt4Oix5Oix3On0uXG5cdFx0Ly8gSGVpZ2h0IGlzIG9wdGlvbmFsLCBhcyBjYWxjdWxhdGVkIGJhc2VkIG9uIGxhcmdlIGltYWdlLlxuXHRcdHZhciB0aHVtYkJvdW5kczsgXG5cdFx0aWYoaXRlbS5pbml0aWFsTGF5b3V0KSB7XG5cdFx0XHR0aHVtYkJvdW5kcyA9IGl0ZW0uaW5pdGlhbExheW91dDtcblx0XHRcdGl0ZW0uaW5pdGlhbExheW91dCA9IG51bGw7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRodW1iQm91bmRzID0gX29wdGlvbnMuZ2V0VGh1bWJCb3VuZHNGbiAmJiBfb3B0aW9ucy5nZXRUaHVtYkJvdW5kc0ZuKF9jdXJyZW50SXRlbUluZGV4KTtcblx0XHR9XG5cblx0XHR2YXIgZHVyYXRpb24gPSBvdXQgPyBfb3B0aW9ucy5oaWRlQW5pbWF0aW9uRHVyYXRpb24gOiBfb3B0aW9ucy5zaG93QW5pbWF0aW9uRHVyYXRpb247XG5cblx0XHR2YXIgb25Db21wbGV0ZSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0X3N0b3BBbmltYXRpb24oJ2luaXRpYWxab29tJyk7XG5cdFx0XHRpZighb3V0KSB7XG5cdFx0XHRcdF9hcHBseUJnT3BhY2l0eSgxKTtcblx0XHRcdFx0aWYoaW1nKSB7XG5cdFx0XHRcdFx0aW1nLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGZyYW1ld29yay5hZGRDbGFzcyh0ZW1wbGF0ZSwgJ3Bzd3AtLWFuaW1hdGVkLWluJyk7XG5cdFx0XHRcdF9zaG91dCgnaW5pdGlhbFpvb20nICsgKG91dCA/ICdPdXRFbmQnIDogJ0luRW5kJykpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0c2VsZi50ZW1wbGF0ZS5yZW1vdmVBdHRyaWJ1dGUoJ3N0eWxlJyk7XG5cdFx0XHRcdHNlbGYuYmcucmVtb3ZlQXR0cmlidXRlKCdzdHlsZScpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZihjb21wbGV0ZUZuKSB7XG5cdFx0XHRcdGNvbXBsZXRlRm4oKTtcblx0XHRcdH1cblx0XHRcdF9pbml0aWFsWm9vbVJ1bm5pbmcgPSBmYWxzZTtcblx0XHR9O1xuXG5cdFx0Ly8gaWYgYm91bmRzIGFyZW4ndCBwcm92aWRlZCwganVzdCBvcGVuIGdhbGxlcnkgd2l0aG91dCBhbmltYXRpb25cblx0XHRpZighZHVyYXRpb24gfHwgIXRodW1iQm91bmRzIHx8IHRodW1iQm91bmRzLnggPT09IHVuZGVmaW5lZCkge1xuXG5cdFx0XHRfc2hvdXQoJ2luaXRpYWxab29tJyArIChvdXQgPyAnT3V0JyA6ICdJbicpICk7XG5cblx0XHRcdF9jdXJyWm9vbUxldmVsID0gaXRlbS5pbml0aWFsWm9vbUxldmVsO1xuXHRcdFx0X2VxdWFsaXplUG9pbnRzKF9wYW5PZmZzZXQsICBpdGVtLmluaXRpYWxQb3NpdGlvbiApO1xuXHRcdFx0X2FwcGx5Q3VycmVudFpvb21QYW4oKTtcblxuXHRcdFx0dGVtcGxhdGUuc3R5bGUub3BhY2l0eSA9IG91dCA/IDAgOiAxO1xuXHRcdFx0X2FwcGx5QmdPcGFjaXR5KDEpO1xuXG5cdFx0XHRpZihkdXJhdGlvbikge1xuXHRcdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdG9uQ29tcGxldGUoKTtcblx0XHRcdFx0fSwgZHVyYXRpb24pO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0b25Db21wbGV0ZSgpO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dmFyIHN0YXJ0QW5pbWF0aW9uID0gZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgY2xvc2VXaXRoUmFmID0gX2Nsb3NlZEJ5U2Nyb2xsLFxuXHRcdFx0XHRmYWRlRXZlcnl0aGluZyA9ICFzZWxmLmN1cnJJdGVtLnNyYyB8fCBzZWxmLmN1cnJJdGVtLmxvYWRFcnJvciB8fCBfb3B0aW9ucy5zaG93SGlkZU9wYWNpdHk7XG5cdFx0XHRcblx0XHRcdC8vIGFwcGx5IGh3LWFjY2VsZXJhdGlvbiB0byBpbWFnZVxuXHRcdFx0aWYoaXRlbS5taW5pSW1nKSB7XG5cdFx0XHRcdGl0ZW0ubWluaUltZy5zdHlsZS53ZWJraXRCYWNrZmFjZVZpc2liaWxpdHkgPSAnaGlkZGVuJztcblx0XHRcdH1cblxuXHRcdFx0aWYoIW91dCkge1xuXHRcdFx0XHRfY3Vyclpvb21MZXZlbCA9IHRodW1iQm91bmRzLncgLyBpdGVtLnc7XG5cdFx0XHRcdF9wYW5PZmZzZXQueCA9IHRodW1iQm91bmRzLng7XG5cdFx0XHRcdF9wYW5PZmZzZXQueSA9IHRodW1iQm91bmRzLnkgLSBfaW5pdGFsV2luZG93U2Nyb2xsWTtcblxuXHRcdFx0XHRzZWxmW2ZhZGVFdmVyeXRoaW5nID8gJ3RlbXBsYXRlJyA6ICdiZyddLnN0eWxlLm9wYWNpdHkgPSAwLjAwMTtcblx0XHRcdFx0X2FwcGx5Q3VycmVudFpvb21QYW4oKTtcblx0XHRcdH1cblxuXHRcdFx0X3JlZ2lzdGVyU3RhcnRBbmltYXRpb24oJ2luaXRpYWxab29tJyk7XG5cdFx0XHRcblx0XHRcdGlmKG91dCAmJiAhY2xvc2VXaXRoUmFmKSB7XG5cdFx0XHRcdGZyYW1ld29yay5yZW1vdmVDbGFzcyh0ZW1wbGF0ZSwgJ3Bzd3AtLWFuaW1hdGVkLWluJyk7XG5cdFx0XHR9XG5cblx0XHRcdGlmKGZhZGVFdmVyeXRoaW5nKSB7XG5cdFx0XHRcdGlmKG91dCkge1xuXHRcdFx0XHRcdGZyYW1ld29ya1sgKGNsb3NlV2l0aFJhZiA/ICdyZW1vdmUnIDogJ2FkZCcpICsgJ0NsYXNzJyBdKHRlbXBsYXRlLCAncHN3cC0tYW5pbWF0ZV9vcGFjaXR5Jyk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdGZyYW1ld29yay5hZGRDbGFzcyh0ZW1wbGF0ZSwgJ3Bzd3AtLWFuaW1hdGVfb3BhY2l0eScpO1xuXHRcdFx0XHRcdH0sIDMwKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRfc2hvd09ySGlkZVRpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXG5cdFx0XHRcdF9zaG91dCgnaW5pdGlhbFpvb20nICsgKG91dCA/ICdPdXQnIDogJ0luJykgKTtcblx0XHRcdFx0XG5cblx0XHRcdFx0aWYoIW91dCkge1xuXG5cdFx0XHRcdFx0Ly8gXCJpblwiIGFuaW1hdGlvbiBhbHdheXMgdXNlcyBDU1MgdHJhbnNpdGlvbnMgKGluc3RlYWQgb2YgckFGKS5cblx0XHRcdFx0XHQvLyBDU1MgdHJhbnNpdGlvbiB3b3JrIGZhc3RlciBoZXJlLCBcblx0XHRcdFx0XHQvLyBhcyBkZXZlbG9wZXIgbWF5IGFsc28gd2FudCB0byBhbmltYXRlIG90aGVyIHRoaW5ncywgXG5cdFx0XHRcdFx0Ly8gbGlrZSB1aSBvbiB0b3Agb2Ygc2xpZGluZyBhcmVhLCB3aGljaCBjYW4gYmUgYW5pbWF0ZWQganVzdCB2aWEgQ1NTXG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0X2N1cnJab29tTGV2ZWwgPSBpdGVtLmluaXRpYWxab29tTGV2ZWw7XG5cdFx0XHRcdFx0X2VxdWFsaXplUG9pbnRzKF9wYW5PZmZzZXQsICBpdGVtLmluaXRpYWxQb3NpdGlvbiApO1xuXHRcdFx0XHRcdF9hcHBseUN1cnJlbnRab29tUGFuKCk7XG5cdFx0XHRcdFx0X2FwcGx5QmdPcGFjaXR5KDEpO1xuXG5cdFx0XHRcdFx0aWYoZmFkZUV2ZXJ5dGhpbmcpIHtcblx0XHRcdFx0XHRcdHRlbXBsYXRlLnN0eWxlLm9wYWNpdHkgPSAxO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRfYXBwbHlCZ09wYWNpdHkoMSk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0X3Nob3dPckhpZGVUaW1lb3V0ID0gc2V0VGltZW91dChvbkNvbXBsZXRlLCBkdXJhdGlvbiArIDIwKTtcblx0XHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHRcdC8vIFwib3V0XCIgYW5pbWF0aW9uIHVzZXMgckFGIG9ubHkgd2hlbiBQaG90b1N3aXBlIGlzIGNsb3NlZCBieSBicm93c2VyIHNjcm9sbCwgdG8gcmVjYWxjdWxhdGUgcG9zaXRpb25cblx0XHRcdFx0XHR2YXIgZGVzdFpvb21MZXZlbCA9IHRodW1iQm91bmRzLncgLyBpdGVtLncsXG5cdFx0XHRcdFx0XHRpbml0aWFsUGFuT2Zmc2V0ID0ge1xuXHRcdFx0XHRcdFx0XHR4OiBfcGFuT2Zmc2V0LngsXG5cdFx0XHRcdFx0XHRcdHk6IF9wYW5PZmZzZXQueVxuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdGluaXRpYWxab29tTGV2ZWwgPSBfY3Vyclpvb21MZXZlbCxcblx0XHRcdFx0XHRcdGluaXRhbEJnT3BhY2l0eSA9IF9iZ09wYWNpdHksXG5cdFx0XHRcdFx0XHRvblVwZGF0ZSA9IGZ1bmN0aW9uKG5vdykge1xuXHRcdFx0XHRcdFx0XHRcblx0XHRcdFx0XHRcdFx0aWYobm93ID09PSAxKSB7XG5cdFx0XHRcdFx0XHRcdFx0X2N1cnJab29tTGV2ZWwgPSBkZXN0Wm9vbUxldmVsO1xuXHRcdFx0XHRcdFx0XHRcdF9wYW5PZmZzZXQueCA9IHRodW1iQm91bmRzLng7XG5cdFx0XHRcdFx0XHRcdFx0X3Bhbk9mZnNldC55ID0gdGh1bWJCb3VuZHMueSAgLSBfY3VycmVudFdpbmRvd1Njcm9sbFk7XG5cdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0X2N1cnJab29tTGV2ZWwgPSAoZGVzdFpvb21MZXZlbCAtIGluaXRpYWxab29tTGV2ZWwpICogbm93ICsgaW5pdGlhbFpvb21MZXZlbDtcblx0XHRcdFx0XHRcdFx0XHRfcGFuT2Zmc2V0LnggPSAodGh1bWJCb3VuZHMueCAtIGluaXRpYWxQYW5PZmZzZXQueCkgKiBub3cgKyBpbml0aWFsUGFuT2Zmc2V0Lng7XG5cdFx0XHRcdFx0XHRcdFx0X3Bhbk9mZnNldC55ID0gKHRodW1iQm91bmRzLnkgLSBfY3VycmVudFdpbmRvd1Njcm9sbFkgLSBpbml0aWFsUGFuT2Zmc2V0LnkpICogbm93ICsgaW5pdGlhbFBhbk9mZnNldC55O1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFxuXHRcdFx0XHRcdFx0XHRfYXBwbHlDdXJyZW50Wm9vbVBhbigpO1xuXHRcdFx0XHRcdFx0XHRpZihmYWRlRXZlcnl0aGluZykge1xuXHRcdFx0XHRcdFx0XHRcdHRlbXBsYXRlLnN0eWxlLm9wYWNpdHkgPSAxIC0gbm93O1xuXHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdF9hcHBseUJnT3BhY2l0eSggaW5pdGFsQmdPcGFjaXR5IC0gbm93ICogaW5pdGFsQmdPcGFjaXR5ICk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH07XG5cblx0XHRcdFx0XHRpZihjbG9zZVdpdGhSYWYpIHtcblx0XHRcdFx0XHRcdF9hbmltYXRlUHJvcCgnaW5pdGlhbFpvb20nLCAwLCAxLCBkdXJhdGlvbiwgZnJhbWV3b3JrLmVhc2luZy5jdWJpYy5vdXQsIG9uVXBkYXRlLCBvbkNvbXBsZXRlKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0b25VcGRhdGUoMSk7XG5cdFx0XHRcdFx0XHRfc2hvd09ySGlkZVRpbWVvdXQgPSBzZXRUaW1lb3V0KG9uQ29tcGxldGUsIGR1cmF0aW9uICsgMjApO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XG5cdFx0XHR9LCBvdXQgPyAyNSA6IDkwKTsgLy8gTWFpbiBwdXJwb3NlIG9mIHRoaXMgZGVsYXkgaXMgdG8gZ2l2ZSBicm93c2VyIHRpbWUgdG8gcGFpbnQgYW5kXG5cdFx0XHRcdFx0Ly8gY3JlYXRlIGNvbXBvc2l0ZSBsYXllcnMgb2YgUGhvdG9Td2lwZSBVSSBwYXJ0cyAoYmFja2dyb3VuZCwgY29udHJvbHMsIGNhcHRpb24sIGFycm93cykuXG5cdFx0XHRcdFx0Ly8gV2hpY2ggYXZvaWRzIGxhZyBhdCB0aGUgYmVnaW5uaW5nIG9mIHNjYWxlIHRyYW5zaXRpb24uXG5cdFx0fTtcblx0XHRzdGFydEFuaW1hdGlvbigpO1xuXG5cdFx0XG5cdH07XG5cbi8qPj5zaG93LWhpZGUtdHJhbnNpdGlvbiovXG5cbi8qPj5pdGVtcy1jb250cm9sbGVyKi9cbi8qKlxuKlxuKiBDb250cm9sbGVyIG1hbmFnZXMgZ2FsbGVyeSBpdGVtcywgdGhlaXIgZGltZW5zaW9ucywgYW5kIHRoZWlyIGNvbnRlbnQuXG4qIFxuKi9cblxudmFyIF9pdGVtcyxcblx0X3RlbXBQYW5BcmVhU2l6ZSA9IHt9LFxuXHRfaW1hZ2VzVG9BcHBlbmRQb29sID0gW10sXG5cdF9pbml0aWFsQ29udGVudFNldCxcblx0X2luaXRpYWxab29tUnVubmluZyxcblx0X2NvbnRyb2xsZXJEZWZhdWx0T3B0aW9ucyA9IHtcblx0XHRpbmRleDogMCxcblx0XHRlcnJvck1zZzogJzxkaXYgY2xhc3M9XCJwc3dwX19lcnJvci1tc2dcIj48YSBocmVmPVwiJXVybCVcIiB0YXJnZXQ9XCJfYmxhbmtcIj5UaGUgaW1hZ2U8L2E+IGNvdWxkIG5vdCBiZSBsb2FkZWQuPC9kaXY+Jyxcblx0XHRmb3JjZVByb2dyZXNzaXZlTG9hZGluZzogZmFsc2UsIC8vIFRPRE9cblx0XHRwcmVsb2FkOiBbMSwxXSxcblx0XHRnZXROdW1JdGVtc0ZuOiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiBfaXRlbXMubGVuZ3RoO1xuXHRcdH1cblx0fTtcblxuXG52YXIgX2dldEl0ZW1BdCxcblx0X2dldE51bUl0ZW1zLFxuXHRfaW5pdGlhbElzTG9vcCxcblx0X2dldFplcm9Cb3VuZHMgPSBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0Y2VudGVyOnt4OjAseTowfSwgXG5cdFx0XHRtYXg6e3g6MCx5OjB9LCBcblx0XHRcdG1pbjp7eDowLHk6MH1cblx0XHR9O1xuXHR9LFxuXHRfY2FsY3VsYXRlU2luZ2xlSXRlbVBhbkJvdW5kcyA9IGZ1bmN0aW9uKGl0ZW0sIHJlYWxQYW5FbGVtZW50VywgcmVhbFBhbkVsZW1lbnRIICkge1xuXHRcdHZhciBib3VuZHMgPSBpdGVtLmJvdW5kcztcblxuXHRcdC8vIHBvc2l0aW9uIG9mIGVsZW1lbnQgd2hlbiBpdCdzIGNlbnRlcmVkXG5cdFx0Ym91bmRzLmNlbnRlci54ID0gTWF0aC5yb3VuZCgoX3RlbXBQYW5BcmVhU2l6ZS54IC0gcmVhbFBhbkVsZW1lbnRXKSAvIDIpO1xuXHRcdGJvdW5kcy5jZW50ZXIueSA9IE1hdGgucm91bmQoKF90ZW1wUGFuQXJlYVNpemUueSAtIHJlYWxQYW5FbGVtZW50SCkgLyAyKSArIGl0ZW0udkdhcC50b3A7XG5cblx0XHQvLyBtYXhpbXVtIHBhbiBwb3NpdGlvblxuXHRcdGJvdW5kcy5tYXgueCA9IChyZWFsUGFuRWxlbWVudFcgPiBfdGVtcFBhbkFyZWFTaXplLngpID8gXG5cdFx0XHRcdFx0XHRcdE1hdGgucm91bmQoX3RlbXBQYW5BcmVhU2l6ZS54IC0gcmVhbFBhbkVsZW1lbnRXKSA6IFxuXHRcdFx0XHRcdFx0XHRib3VuZHMuY2VudGVyLng7XG5cdFx0XG5cdFx0Ym91bmRzLm1heC55ID0gKHJlYWxQYW5FbGVtZW50SCA+IF90ZW1wUGFuQXJlYVNpemUueSkgPyBcblx0XHRcdFx0XHRcdFx0TWF0aC5yb3VuZChfdGVtcFBhbkFyZWFTaXplLnkgLSByZWFsUGFuRWxlbWVudEgpICsgaXRlbS52R2FwLnRvcCA6IFxuXHRcdFx0XHRcdFx0XHRib3VuZHMuY2VudGVyLnk7XG5cdFx0XG5cdFx0Ly8gbWluaW11bSBwYW4gcG9zaXRpb25cblx0XHRib3VuZHMubWluLnggPSAocmVhbFBhbkVsZW1lbnRXID4gX3RlbXBQYW5BcmVhU2l6ZS54KSA/IDAgOiBib3VuZHMuY2VudGVyLng7XG5cdFx0Ym91bmRzLm1pbi55ID0gKHJlYWxQYW5FbGVtZW50SCA+IF90ZW1wUGFuQXJlYVNpemUueSkgPyBpdGVtLnZHYXAudG9wIDogYm91bmRzLmNlbnRlci55O1xuXHR9LFxuXHRfY2FsY3VsYXRlSXRlbVNpemUgPSBmdW5jdGlvbihpdGVtLCB2aWV3cG9ydFNpemUsIHpvb21MZXZlbCkge1xuXG5cdFx0aWYgKGl0ZW0uc3JjICYmICFpdGVtLmxvYWRFcnJvcikge1xuXHRcdFx0dmFyIGlzSW5pdGlhbCA9ICF6b29tTGV2ZWw7XG5cdFx0XHRcblx0XHRcdGlmKGlzSW5pdGlhbCkge1xuXHRcdFx0XHRpZighaXRlbS52R2FwKSB7XG5cdFx0XHRcdFx0aXRlbS52R2FwID0ge3RvcDowLGJvdHRvbTowfTtcblx0XHRcdFx0fVxuXHRcdFx0XHQvLyBhbGxvd3Mgb3ZlcnJpZGluZyB2ZXJ0aWNhbCBtYXJnaW4gZm9yIGluZGl2aWR1YWwgaXRlbXNcblx0XHRcdFx0X3Nob3V0KCdwYXJzZVZlcnRpY2FsTWFyZ2luJywgaXRlbSk7XG5cdFx0XHR9XG5cblxuXHRcdFx0X3RlbXBQYW5BcmVhU2l6ZS54ID0gdmlld3BvcnRTaXplLng7XG5cdFx0XHRfdGVtcFBhbkFyZWFTaXplLnkgPSB2aWV3cG9ydFNpemUueSAtIGl0ZW0udkdhcC50b3AgLSBpdGVtLnZHYXAuYm90dG9tO1xuXG5cdFx0XHRpZiAoaXNJbml0aWFsKSB7XG5cdFx0XHRcdHZhciBoUmF0aW8gPSBfdGVtcFBhbkFyZWFTaXplLnggLyBpdGVtLnc7XG5cdFx0XHRcdHZhciB2UmF0aW8gPSBfdGVtcFBhbkFyZWFTaXplLnkgLyBpdGVtLmg7XG5cblx0XHRcdFx0aXRlbS5maXRSYXRpbyA9IGhSYXRpbyA8IHZSYXRpbyA/IGhSYXRpbyA6IHZSYXRpbztcblx0XHRcdFx0Ly9pdGVtLmZpbGxSYXRpbyA9IGhSYXRpbyA+IHZSYXRpbyA/IGhSYXRpbyA6IHZSYXRpbztcblxuXHRcdFx0XHR2YXIgc2NhbGVNb2RlID0gX29wdGlvbnMuc2NhbGVNb2RlO1xuXG5cdFx0XHRcdGlmIChzY2FsZU1vZGUgPT09ICdvcmlnJykge1xuXHRcdFx0XHRcdHpvb21MZXZlbCA9IDE7XG5cdFx0XHRcdH0gZWxzZSBpZiAoc2NhbGVNb2RlID09PSAnZml0Jykge1xuXHRcdFx0XHRcdHpvb21MZXZlbCA9IGl0ZW0uZml0UmF0aW87XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoem9vbUxldmVsID4gMSkge1xuXHRcdFx0XHRcdHpvb21MZXZlbCA9IDE7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpdGVtLmluaXRpYWxab29tTGV2ZWwgPSB6b29tTGV2ZWw7XG5cdFx0XHRcdFxuXHRcdFx0XHRpZighaXRlbS5ib3VuZHMpIHtcblx0XHRcdFx0XHQvLyByZXVzZSBib3VuZHMgb2JqZWN0XG5cdFx0XHRcdFx0aXRlbS5ib3VuZHMgPSBfZ2V0WmVyb0JvdW5kcygpOyBcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRpZighem9vbUxldmVsKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0X2NhbGN1bGF0ZVNpbmdsZUl0ZW1QYW5Cb3VuZHMoaXRlbSwgaXRlbS53ICogem9vbUxldmVsLCBpdGVtLmggKiB6b29tTGV2ZWwpO1xuXG5cdFx0XHRpZiAoaXNJbml0aWFsICYmIHpvb21MZXZlbCA9PT0gaXRlbS5pbml0aWFsWm9vbUxldmVsKSB7XG5cdFx0XHRcdGl0ZW0uaW5pdGlhbFBvc2l0aW9uID0gaXRlbS5ib3VuZHMuY2VudGVyO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gaXRlbS5ib3VuZHM7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGl0ZW0udyA9IGl0ZW0uaCA9IDA7XG5cdFx0XHRpdGVtLmluaXRpYWxab29tTGV2ZWwgPSBpdGVtLmZpdFJhdGlvID0gMTtcblx0XHRcdGl0ZW0uYm91bmRzID0gX2dldFplcm9Cb3VuZHMoKTtcblx0XHRcdGl0ZW0uaW5pdGlhbFBvc2l0aW9uID0gaXRlbS5ib3VuZHMuY2VudGVyO1xuXG5cdFx0XHQvLyBpZiBpdCdzIG5vdCBpbWFnZSwgd2UgcmV0dXJuIHplcm8gYm91bmRzIChjb250ZW50IGlzIG5vdCB6b29tYWJsZSlcblx0XHRcdHJldHVybiBpdGVtLmJvdW5kcztcblx0XHR9XG5cdFx0XG5cdH0sXG5cblx0XG5cblxuXHRfYXBwZW5kSW1hZ2UgPSBmdW5jdGlvbihpbmRleCwgaXRlbSwgYmFzZURpdiwgaW1nLCBwcmV2ZW50QW5pbWF0aW9uLCBrZWVwUGxhY2Vob2xkZXIpIHtcblx0XHRcblxuXHRcdGlmKGl0ZW0ubG9hZEVycm9yKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0aWYoaW1nKSB7XG5cblx0XHRcdGl0ZW0uaW1hZ2VBcHBlbmRlZCA9IHRydWU7XG5cdFx0XHRfc2V0SW1hZ2VTaXplKGl0ZW0sIGltZywgKGl0ZW0gPT09IHNlbGYuY3Vyckl0ZW0gJiYgX3JlbmRlck1heFJlc29sdXRpb24pICk7XG5cdFx0XHRcblx0XHRcdGJhc2VEaXYuYXBwZW5kQ2hpbGQoaW1nKTtcblxuXHRcdFx0aWYoa2VlcFBsYWNlaG9sZGVyKSB7XG5cdFx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0aWYoaXRlbSAmJiBpdGVtLmxvYWRlZCAmJiBpdGVtLnBsYWNlaG9sZGVyKSB7XG5cdFx0XHRcdFx0XHRpdGVtLnBsYWNlaG9sZGVyLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG5cdFx0XHRcdFx0XHRpdGVtLnBsYWNlaG9sZGVyID0gbnVsbDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sIDUwMCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHRcblxuXG5cdF9wcmVsb2FkSW1hZ2UgPSBmdW5jdGlvbihpdGVtKSB7XG5cdFx0aXRlbS5sb2FkaW5nID0gdHJ1ZTtcblx0XHRpdGVtLmxvYWRlZCA9IGZhbHNlO1xuXHRcdHZhciBpbWcgPSBpdGVtLmltZyA9IGZyYW1ld29yay5jcmVhdGVFbCgncHN3cF9faW1nJywgJ2ltZycpO1xuXHRcdHZhciBvbkNvbXBsZXRlID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRpdGVtLmxvYWRpbmcgPSBmYWxzZTtcblx0XHRcdGl0ZW0ubG9hZGVkID0gdHJ1ZTtcblxuXHRcdFx0aWYoaXRlbS5sb2FkQ29tcGxldGUpIHtcblx0XHRcdFx0aXRlbS5sb2FkQ29tcGxldGUoaXRlbSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRpdGVtLmltZyA9IG51bGw7IC8vIG5vIG5lZWQgdG8gc3RvcmUgaW1hZ2Ugb2JqZWN0XG5cdFx0XHR9XG5cdFx0XHRpbWcub25sb2FkID0gaW1nLm9uZXJyb3IgPSBudWxsO1xuXHRcdFx0aW1nID0gbnVsbDtcblx0XHR9O1xuXHRcdGltZy5vbmxvYWQgPSBvbkNvbXBsZXRlO1xuXHRcdGltZy5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRpdGVtLmxvYWRFcnJvciA9IHRydWU7XG5cdFx0XHRvbkNvbXBsZXRlKCk7XG5cdFx0fTtcdFx0XG5cblx0XHRpbWcuc3JjID0gaXRlbS5zcmM7Ly8gKyAnP2E9JyArIE1hdGgucmFuZG9tKCk7XG5cblx0XHRyZXR1cm4gaW1nO1xuXHR9LFxuXHRfY2hlY2tGb3JFcnJvciA9IGZ1bmN0aW9uKGl0ZW0sIGNsZWFuVXApIHtcblx0XHRpZihpdGVtLnNyYyAmJiBpdGVtLmxvYWRFcnJvciAmJiBpdGVtLmNvbnRhaW5lcikge1xuXG5cdFx0XHRpZihjbGVhblVwKSB7XG5cdFx0XHRcdGl0ZW0uY29udGFpbmVyLmlubmVySFRNTCA9ICcnO1xuXHRcdFx0fVxuXG5cdFx0XHRpdGVtLmNvbnRhaW5lci5pbm5lckhUTUwgPSBfb3B0aW9ucy5lcnJvck1zZy5yZXBsYWNlKCcldXJsJScsICBpdGVtLnNyYyApO1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcblx0XHR9XG5cdH0sXG5cdF9zZXRJbWFnZVNpemUgPSBmdW5jdGlvbihpdGVtLCBpbWcsIG1heFJlcykge1xuXHRcdGlmKCFpdGVtLnNyYykge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGlmKCFpbWcpIHtcblx0XHRcdGltZyA9IGl0ZW0uY29udGFpbmVyLmxhc3RDaGlsZDtcblx0XHR9XG5cblx0XHR2YXIgdyA9IG1heFJlcyA/IGl0ZW0udyA6IE1hdGgucm91bmQoaXRlbS53ICogaXRlbS5maXRSYXRpbyksXG5cdFx0XHRoID0gbWF4UmVzID8gaXRlbS5oIDogTWF0aC5yb3VuZChpdGVtLmggKiBpdGVtLmZpdFJhdGlvKTtcblx0XHRcblx0XHRpZihpdGVtLnBsYWNlaG9sZGVyICYmICFpdGVtLmxvYWRlZCkge1xuXHRcdFx0aXRlbS5wbGFjZWhvbGRlci5zdHlsZS53aWR0aCA9IHcgKyAncHgnO1xuXHRcdFx0aXRlbS5wbGFjZWhvbGRlci5zdHlsZS5oZWlnaHQgPSBoICsgJ3B4Jztcblx0XHR9XG5cblx0XHRpbWcuc3R5bGUud2lkdGggPSB3ICsgJ3B4Jztcblx0XHRpbWcuc3R5bGUuaGVpZ2h0ID0gaCArICdweCc7XG5cdH0sXG5cdF9hcHBlbmRJbWFnZXNQb29sID0gZnVuY3Rpb24oKSB7XG5cblx0XHRpZihfaW1hZ2VzVG9BcHBlbmRQb29sLmxlbmd0aCkge1xuXHRcdFx0dmFyIHBvb2xJdGVtO1xuXG5cdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgX2ltYWdlc1RvQXBwZW5kUG9vbC5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRwb29sSXRlbSA9IF9pbWFnZXNUb0FwcGVuZFBvb2xbaV07XG5cdFx0XHRcdGlmKCBwb29sSXRlbS5ob2xkZXIuaW5kZXggPT09IHBvb2xJdGVtLmluZGV4ICkge1xuXHRcdFx0XHRcdF9hcHBlbmRJbWFnZShwb29sSXRlbS5pbmRleCwgcG9vbEl0ZW0uaXRlbSwgcG9vbEl0ZW0uYmFzZURpdiwgcG9vbEl0ZW0uaW1nLCBmYWxzZSwgcG9vbEl0ZW0uY2xlYXJQbGFjZWhvbGRlcik7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdF9pbWFnZXNUb0FwcGVuZFBvb2wgPSBbXTtcblx0XHR9XG5cdH07XG5cdFxuXG5cbl9yZWdpc3Rlck1vZHVsZSgnQ29udHJvbGxlcicsIHtcblxuXHRwdWJsaWNNZXRob2RzOiB7XG5cblx0XHRsYXp5TG9hZEl0ZW06IGZ1bmN0aW9uKGluZGV4KSB7XG5cdFx0XHRpbmRleCA9IF9nZXRMb29wZWRJZChpbmRleCk7XG5cdFx0XHR2YXIgaXRlbSA9IF9nZXRJdGVtQXQoaW5kZXgpO1xuXG5cdFx0XHRpZighaXRlbSB8fCAoKGl0ZW0ubG9hZGVkIHx8IGl0ZW0ubG9hZGluZykgJiYgIV9pdGVtc05lZWRVcGRhdGUpKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0X3Nob3V0KCdnZXR0aW5nRGF0YScsIGluZGV4LCBpdGVtKTtcblxuXHRcdFx0aWYgKCFpdGVtLnNyYykge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdF9wcmVsb2FkSW1hZ2UoaXRlbSk7XG5cdFx0fSxcblx0XHRpbml0Q29udHJvbGxlcjogZnVuY3Rpb24oKSB7XG5cdFx0XHRmcmFtZXdvcmsuZXh0ZW5kKF9vcHRpb25zLCBfY29udHJvbGxlckRlZmF1bHRPcHRpb25zLCB0cnVlKTtcblx0XHRcdHNlbGYuaXRlbXMgPSBfaXRlbXMgPSBpdGVtcztcblx0XHRcdF9nZXRJdGVtQXQgPSBzZWxmLmdldEl0ZW1BdDtcblx0XHRcdF9nZXROdW1JdGVtcyA9IF9vcHRpb25zLmdldE51bUl0ZW1zRm47IC8vc2VsZi5nZXROdW1JdGVtcztcblxuXG5cblx0XHRcdF9pbml0aWFsSXNMb29wID0gX29wdGlvbnMubG9vcDtcblx0XHRcdGlmKF9nZXROdW1JdGVtcygpIDwgMykge1xuXHRcdFx0XHRfb3B0aW9ucy5sb29wID0gZmFsc2U7IC8vIGRpc2FibGUgbG9vcCBpZiBsZXNzIHRoZW4gMyBpdGVtc1xuXHRcdFx0fVxuXG5cdFx0XHRfbGlzdGVuKCdiZWZvcmVDaGFuZ2UnLCBmdW5jdGlvbihkaWZmKSB7XG5cblx0XHRcdFx0dmFyIHAgPSBfb3B0aW9ucy5wcmVsb2FkLFxuXHRcdFx0XHRcdGlzTmV4dCA9IGRpZmYgPT09IG51bGwgPyB0cnVlIDogKGRpZmYgPj0gMCksXG5cdFx0XHRcdFx0cHJlbG9hZEJlZm9yZSA9IE1hdGgubWluKHBbMF0sIF9nZXROdW1JdGVtcygpICksXG5cdFx0XHRcdFx0cHJlbG9hZEFmdGVyID0gTWF0aC5taW4ocFsxXSwgX2dldE51bUl0ZW1zKCkgKSxcblx0XHRcdFx0XHRpO1xuXG5cblx0XHRcdFx0Zm9yKGkgPSAxOyBpIDw9IChpc05leHQgPyBwcmVsb2FkQWZ0ZXIgOiBwcmVsb2FkQmVmb3JlKTsgaSsrKSB7XG5cdFx0XHRcdFx0c2VsZi5sYXp5TG9hZEl0ZW0oX2N1cnJlbnRJdGVtSW5kZXgraSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0Zm9yKGkgPSAxOyBpIDw9IChpc05leHQgPyBwcmVsb2FkQmVmb3JlIDogcHJlbG9hZEFmdGVyKTsgaSsrKSB7XG5cdFx0XHRcdFx0c2VsZi5sYXp5TG9hZEl0ZW0oX2N1cnJlbnRJdGVtSW5kZXgtaSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXG5cdFx0XHRfbGlzdGVuKCdpbml0aWFsTGF5b3V0JywgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHNlbGYuY3Vyckl0ZW0uaW5pdGlhbExheW91dCA9IF9vcHRpb25zLmdldFRodW1iQm91bmRzRm4gJiYgX29wdGlvbnMuZ2V0VGh1bWJCb3VuZHNGbihfY3VycmVudEl0ZW1JbmRleCk7XG5cdFx0XHR9KTtcblxuXHRcdFx0X2xpc3RlbignbWFpblNjcm9sbEFuaW1Db21wbGV0ZScsIF9hcHBlbmRJbWFnZXNQb29sKTtcblx0XHRcdF9saXN0ZW4oJ2luaXRpYWxab29tSW5FbmQnLCBfYXBwZW5kSW1hZ2VzUG9vbCk7XG5cblxuXG5cdFx0XHRfbGlzdGVuKCdkZXN0cm95JywgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBpdGVtO1xuXHRcdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgX2l0ZW1zLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0aXRlbSA9IF9pdGVtc1tpXTtcblx0XHRcdFx0XHQvLyByZW1vdmUgcmVmZXJlbmNlIHRvIERPTSBlbGVtZW50cywgZm9yIEdDXG5cdFx0XHRcdFx0aWYoaXRlbS5jb250YWluZXIpIHtcblx0XHRcdFx0XHRcdGl0ZW0uY29udGFpbmVyID0gbnVsbDsgXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmKGl0ZW0ucGxhY2Vob2xkZXIpIHtcblx0XHRcdFx0XHRcdGl0ZW0ucGxhY2Vob2xkZXIgPSBudWxsO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZihpdGVtLmltZykge1xuXHRcdFx0XHRcdFx0aXRlbS5pbWcgPSBudWxsO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZihpdGVtLnByZWxvYWRlcikge1xuXHRcdFx0XHRcdFx0aXRlbS5wcmVsb2FkZXIgPSBudWxsO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZihpdGVtLmxvYWRFcnJvcikge1xuXHRcdFx0XHRcdFx0aXRlbS5sb2FkZWQgPSBpdGVtLmxvYWRFcnJvciA9IGZhbHNlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRfaW1hZ2VzVG9BcHBlbmRQb29sID0gbnVsbDtcblx0XHRcdH0pO1xuXHRcdH0sXG5cblxuXHRcdGdldEl0ZW1BdDogZnVuY3Rpb24oaW5kZXgpIHtcblx0XHRcdGlmIChpbmRleCA+PSAwKSB7XG5cdFx0XHRcdHJldHVybiBfaXRlbXNbaW5kZXhdICE9PSB1bmRlZmluZWQgPyBfaXRlbXNbaW5kZXhdIDogZmFsc2U7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fSxcblxuXHRcdGFsbG93UHJvZ3Jlc3NpdmVJbWc6IGZ1bmN0aW9uKCkge1xuXHRcdFx0Ly8gMS4gUHJvZ3Jlc3NpdmUgaW1hZ2UgbG9hZGluZyBpc24ndCB3b3JraW5nIG9uIHdlYmtpdC9ibGluayBcblx0XHRcdC8vICAgIHdoZW4gaHctYWNjZWxlcmF0aW9uIChlLmcuIHRyYW5zbGF0ZVopIGlzIGFwcGxpZWQgdG8gSU1HIGVsZW1lbnQuXG5cdFx0XHQvLyAgICBUaGF0J3Mgd2h5IGluIFBob3RvU3dpcGUgcGFyZW50IGVsZW1lbnQgZ2V0cyB6b29tIHRyYW5zZm9ybSwgbm90IGltYWdlIGl0c2VsZi5cblx0XHRcdC8vICAgIFxuXHRcdFx0Ly8gMi4gUHJvZ3Jlc3NpdmUgaW1hZ2UgbG9hZGluZyBzb21ldGltZXMgYmxpbmtzIGluIHdlYmtpdC9ibGluayB3aGVuIGFwcGx5aW5nIGFuaW1hdGlvbiB0byBwYXJlbnQgZWxlbWVudC5cblx0XHRcdC8vICAgIFRoYXQncyB3aHkgaXQncyBkaXNhYmxlZCBvbiB0b3VjaCBkZXZpY2VzIChtYWlubHkgYmVjYXVzZSBvZiBzd2lwZSB0cmFuc2l0aW9uKVxuXHRcdFx0Ly8gICAgXG5cdFx0XHQvLyAzLiBQcm9ncmVzc2l2ZSBpbWFnZSBsb2FkaW5nIHNvbWV0aW1lcyBkb2Vzbid0IHdvcmsgaW4gSUUgKHVwIHRvIDExKS5cblxuXHRcdFx0Ly8gRG9uJ3QgYWxsb3cgcHJvZ3Jlc3NpdmUgbG9hZGluZyBvbiBub24tbGFyZ2UgdG91Y2ggZGV2aWNlc1xuXHRcdFx0cmV0dXJuIF9vcHRpb25zLmZvcmNlUHJvZ3Jlc3NpdmVMb2FkaW5nIHx8ICFfbGlrZWx5VG91Y2hEZXZpY2UgfHwgX29wdGlvbnMubW91c2VVc2VkIHx8IHNjcmVlbi53aWR0aCA+IDEyMDA7IFxuXHRcdFx0Ly8gMTIwMCAtIHRvIGVsaW1pbmF0ZSB0b3VjaCBkZXZpY2VzIHdpdGggbGFyZ2Ugc2NyZWVuIChsaWtlIENocm9tZWJvb2sgUGl4ZWwpXG5cdFx0fSxcblxuXHRcdHNldENvbnRlbnQ6IGZ1bmN0aW9uKGhvbGRlciwgaW5kZXgpIHtcblxuXHRcdFx0aWYoX29wdGlvbnMubG9vcCkge1xuXHRcdFx0XHRpbmRleCA9IF9nZXRMb29wZWRJZChpbmRleCk7XG5cdFx0XHR9XG5cblx0XHRcdHZhciBwcmV2SXRlbSA9IHNlbGYuZ2V0SXRlbUF0KGhvbGRlci5pbmRleCk7XG5cdFx0XHRpZihwcmV2SXRlbSkge1xuXHRcdFx0XHRwcmV2SXRlbS5jb250YWluZXIgPSBudWxsO1xuXHRcdFx0fVxuXHRcblx0XHRcdHZhciBpdGVtID0gc2VsZi5nZXRJdGVtQXQoaW5kZXgpLFxuXHRcdFx0XHRpbWc7XG5cdFx0XHRcblx0XHRcdGlmKCFpdGVtKSB7XG5cdFx0XHRcdGhvbGRlci5lbC5pbm5lckhUTUwgPSAnJztcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBhbGxvdyB0byBvdmVycmlkZSBkYXRhXG5cdFx0XHRfc2hvdXQoJ2dldHRpbmdEYXRhJywgaW5kZXgsIGl0ZW0pO1xuXG5cdFx0XHRob2xkZXIuaW5kZXggPSBpbmRleDtcblx0XHRcdGhvbGRlci5pdGVtID0gaXRlbTtcblxuXHRcdFx0Ly8gYmFzZSBjb250YWluZXIgRElWIGlzIGNyZWF0ZWQgb25seSBvbmNlIGZvciBlYWNoIG9mIDMgaG9sZGVyc1xuXHRcdFx0dmFyIGJhc2VEaXYgPSBpdGVtLmNvbnRhaW5lciA9IGZyYW1ld29yay5jcmVhdGVFbCgncHN3cF9fem9vbS13cmFwJyk7IFxuXG5cdFx0XHRcblxuXHRcdFx0aWYoIWl0ZW0uc3JjICYmIGl0ZW0uaHRtbCkge1xuXHRcdFx0XHRpZihpdGVtLmh0bWwudGFnTmFtZSkge1xuXHRcdFx0XHRcdGJhc2VEaXYuYXBwZW5kQ2hpbGQoaXRlbS5odG1sKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRiYXNlRGl2LmlubmVySFRNTCA9IGl0ZW0uaHRtbDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRfY2hlY2tGb3JFcnJvcihpdGVtKTtcblxuXHRcdFx0X2NhbGN1bGF0ZUl0ZW1TaXplKGl0ZW0sIF92aWV3cG9ydFNpemUpO1xuXHRcdFx0XG5cdFx0XHRpZihpdGVtLnNyYyAmJiAhaXRlbS5sb2FkRXJyb3IgJiYgIWl0ZW0ubG9hZGVkKSB7XG5cblx0XHRcdFx0aXRlbS5sb2FkQ29tcGxldGUgPSBmdW5jdGlvbihpdGVtKSB7XG5cblx0XHRcdFx0XHQvLyBnYWxsZXJ5IGNsb3NlZCBiZWZvcmUgaW1hZ2UgZmluaXNoZWQgbG9hZGluZ1xuXHRcdFx0XHRcdGlmKCFfaXNPcGVuKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Ly8gY2hlY2sgaWYgaG9sZGVyIGhhc24ndCBjaGFuZ2VkIHdoaWxlIGltYWdlIHdhcyBsb2FkaW5nXG5cdFx0XHRcdFx0aWYoaG9sZGVyICYmIGhvbGRlci5pbmRleCA9PT0gaW5kZXggKSB7XG5cdFx0XHRcdFx0XHRpZiggX2NoZWNrRm9yRXJyb3IoaXRlbSwgdHJ1ZSkgKSB7XG5cdFx0XHRcdFx0XHRcdGl0ZW0ubG9hZENvbXBsZXRlID0gaXRlbS5pbWcgPSBudWxsO1xuXHRcdFx0XHRcdFx0XHRfY2FsY3VsYXRlSXRlbVNpemUoaXRlbSwgX3ZpZXdwb3J0U2l6ZSk7XG5cdFx0XHRcdFx0XHRcdF9hcHBseVpvb21QYW5Ub0l0ZW0oaXRlbSk7XG5cblx0XHRcdFx0XHRcdFx0aWYoaG9sZGVyLmluZGV4ID09PSBfY3VycmVudEl0ZW1JbmRleCkge1xuXHRcdFx0XHRcdFx0XHRcdC8vIHJlY2FsY3VsYXRlIGRpbWVuc2lvbnNcblx0XHRcdFx0XHRcdFx0XHRzZWxmLnVwZGF0ZUN1cnJab29tSXRlbSgpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGlmKCAhaXRlbS5pbWFnZUFwcGVuZGVkICkge1xuXHRcdFx0XHRcdFx0XHRpZihfZmVhdHVyZXMudHJhbnNmb3JtICYmIChfbWFpblNjcm9sbEFuaW1hdGluZyB8fCBfaW5pdGlhbFpvb21SdW5uaW5nKSApIHtcblx0XHRcdFx0XHRcdFx0XHRfaW1hZ2VzVG9BcHBlbmRQb29sLnB1c2goe1xuXHRcdFx0XHRcdFx0XHRcdFx0aXRlbTppdGVtLFxuXHRcdFx0XHRcdFx0XHRcdFx0YmFzZURpdjpiYXNlRGl2LFxuXHRcdFx0XHRcdFx0XHRcdFx0aW1nOml0ZW0uaW1nLFxuXHRcdFx0XHRcdFx0XHRcdFx0aW5kZXg6aW5kZXgsXG5cdFx0XHRcdFx0XHRcdFx0XHRob2xkZXI6aG9sZGVyLFxuXHRcdFx0XHRcdFx0XHRcdFx0Y2xlYXJQbGFjZWhvbGRlcjp0cnVlXG5cdFx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0X2FwcGVuZEltYWdlKGluZGV4LCBpdGVtLCBiYXNlRGl2LCBpdGVtLmltZywgX21haW5TY3JvbGxBbmltYXRpbmcgfHwgX2luaXRpYWxab29tUnVubmluZywgdHJ1ZSk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdC8vIHJlbW92ZSBwcmVsb2FkZXIgJiBtaW5pLWltZ1xuXHRcdFx0XHRcdFx0XHRpZighX2luaXRpYWxab29tUnVubmluZyAmJiBpdGVtLnBsYWNlaG9sZGVyKSB7XG5cdFx0XHRcdFx0XHRcdFx0aXRlbS5wbGFjZWhvbGRlci5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuXHRcdFx0XHRcdFx0XHRcdGl0ZW0ucGxhY2Vob2xkZXIgPSBudWxsO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aXRlbS5sb2FkQ29tcGxldGUgPSBudWxsO1xuXHRcdFx0XHRcdGl0ZW0uaW1nID0gbnVsbDsgLy8gbm8gbmVlZCB0byBzdG9yZSBpbWFnZSBlbGVtZW50IGFmdGVyIGl0J3MgYWRkZWRcblxuXHRcdFx0XHRcdF9zaG91dCgnaW1hZ2VMb2FkQ29tcGxldGUnLCBpbmRleCwgaXRlbSk7XG5cdFx0XHRcdH07XG5cblx0XHRcdFx0aWYoZnJhbWV3b3JrLmZlYXR1cmVzLnRyYW5zZm9ybSkge1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdHZhciBwbGFjZWhvbGRlckNsYXNzTmFtZSA9ICdwc3dwX19pbWcgcHN3cF9faW1nLS1wbGFjZWhvbGRlcic7IFxuXHRcdFx0XHRcdHBsYWNlaG9sZGVyQ2xhc3NOYW1lICs9IChpdGVtLm1zcmMgPyAnJyA6ICcgcHN3cF9faW1nLS1wbGFjZWhvbGRlci0tYmxhbmsnKTtcblxuXHRcdFx0XHRcdHZhciBwbGFjZWhvbGRlciA9IGZyYW1ld29yay5jcmVhdGVFbChwbGFjZWhvbGRlckNsYXNzTmFtZSwgaXRlbS5tc3JjID8gJ2ltZycgOiAnJyk7XG5cdFx0XHRcdFx0aWYoaXRlbS5tc3JjKSB7XG5cdFx0XHRcdFx0XHRwbGFjZWhvbGRlci5zcmMgPSBpdGVtLm1zcmM7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdF9zZXRJbWFnZVNpemUoaXRlbSwgcGxhY2Vob2xkZXIpO1xuXG5cdFx0XHRcdFx0YmFzZURpdi5hcHBlbmRDaGlsZChwbGFjZWhvbGRlcik7XG5cdFx0XHRcdFx0aXRlbS5wbGFjZWhvbGRlciA9IHBsYWNlaG9sZGVyO1xuXG5cdFx0XHRcdH1cblx0XHRcdFx0XG5cblx0XHRcdFx0XG5cblx0XHRcdFx0aWYoIWl0ZW0ubG9hZGluZykge1xuXHRcdFx0XHRcdF9wcmVsb2FkSW1hZ2UoaXRlbSk7XG5cdFx0XHRcdH1cblxuXG5cdFx0XHRcdGlmKCBzZWxmLmFsbG93UHJvZ3Jlc3NpdmVJbWcoKSApIHtcblx0XHRcdFx0XHQvLyBqdXN0IGFwcGVuZCBpbWFnZVxuXHRcdFx0XHRcdGlmKCFfaW5pdGlhbENvbnRlbnRTZXQgJiYgX2ZlYXR1cmVzLnRyYW5zZm9ybSkge1xuXHRcdFx0XHRcdFx0X2ltYWdlc1RvQXBwZW5kUG9vbC5wdXNoKHtcblx0XHRcdFx0XHRcdFx0aXRlbTppdGVtLCBcblx0XHRcdFx0XHRcdFx0YmFzZURpdjpiYXNlRGl2LCBcblx0XHRcdFx0XHRcdFx0aW1nOml0ZW0uaW1nLCBcblx0XHRcdFx0XHRcdFx0aW5kZXg6aW5kZXgsIFxuXHRcdFx0XHRcdFx0XHRob2xkZXI6aG9sZGVyXG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0X2FwcGVuZEltYWdlKGluZGV4LCBpdGVtLCBiYXNlRGl2LCBpdGVtLmltZywgdHJ1ZSwgdHJ1ZSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0fSBlbHNlIGlmKGl0ZW0uc3JjICYmICFpdGVtLmxvYWRFcnJvcikge1xuXHRcdFx0XHQvLyBpbWFnZSBvYmplY3QgaXMgY3JlYXRlZCBldmVyeSB0aW1lLCBkdWUgdG8gYnVncyBvZiBpbWFnZSBsb2FkaW5nICYgZGVsYXkgd2hlbiBzd2l0Y2hpbmcgaW1hZ2VzXG5cdFx0XHRcdGltZyA9IGZyYW1ld29yay5jcmVhdGVFbCgncHN3cF9faW1nJywgJ2ltZycpO1xuXHRcdFx0XHRpbWcuc3R5bGUub3BhY2l0eSA9IDE7XG5cdFx0XHRcdGltZy5zcmMgPSBpdGVtLnNyYztcblx0XHRcdFx0X3NldEltYWdlU2l6ZShpdGVtLCBpbWcpO1xuXHRcdFx0XHRfYXBwZW5kSW1hZ2UoaW5kZXgsIGl0ZW0sIGJhc2VEaXYsIGltZywgdHJ1ZSk7XG5cdFx0XHR9XG5cdFx0XHRcblxuXHRcdFx0aWYoIV9pbml0aWFsQ29udGVudFNldCAmJiBpbmRleCA9PT0gX2N1cnJlbnRJdGVtSW5kZXgpIHtcblx0XHRcdFx0X2N1cnJab29tRWxlbWVudFN0eWxlID0gYmFzZURpdi5zdHlsZTtcblx0XHRcdFx0X3Nob3dPckhpZGUoaXRlbSwgKGltZyB8fGl0ZW0uaW1nKSApO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0X2FwcGx5Wm9vbVBhblRvSXRlbShpdGVtKTtcblx0XHRcdH1cblxuXHRcdFx0aG9sZGVyLmVsLmlubmVySFRNTCA9ICcnO1xuXHRcdFx0aG9sZGVyLmVsLmFwcGVuZENoaWxkKGJhc2VEaXYpO1xuXHRcdH0sXG5cblx0XHRjbGVhblNsaWRlOiBmdW5jdGlvbiggaXRlbSApIHtcblx0XHRcdGlmKGl0ZW0uaW1nICkge1xuXHRcdFx0XHRpdGVtLmltZy5vbmxvYWQgPSBpdGVtLmltZy5vbmVycm9yID0gbnVsbDtcblx0XHRcdH1cblx0XHRcdGl0ZW0ubG9hZGVkID0gaXRlbS5sb2FkaW5nID0gaXRlbS5pbWcgPSBpdGVtLmltYWdlQXBwZW5kZWQgPSBmYWxzZTtcblx0XHR9XG5cblx0fVxufSk7XG5cbi8qPj5pdGVtcy1jb250cm9sbGVyKi9cblxuLyo+PnRhcCovXG4vKipcbiAqIHRhcC5qczpcbiAqXG4gKiBEaXNwbGF0Y2hlcyB0YXAgYW5kIGRvdWJsZS10YXAgZXZlbnRzLlxuICogXG4gKi9cblxudmFyIHRhcFRpbWVyLFxuXHR0YXBSZWxlYXNlUG9pbnQgPSB7fSxcblx0X2Rpc3BhdGNoVGFwRXZlbnQgPSBmdW5jdGlvbihvcmlnRXZlbnQsIHJlbGVhc2VQb2ludCwgcG9pbnRlclR5cGUpIHtcdFx0XG5cdFx0dmFyIGUgPSBkb2N1bWVudC5jcmVhdGVFdmVudCggJ0N1c3RvbUV2ZW50JyApLFxuXHRcdFx0ZURldGFpbCA9IHtcblx0XHRcdFx0b3JpZ0V2ZW50Om9yaWdFdmVudCwgXG5cdFx0XHRcdHRhcmdldDpvcmlnRXZlbnQudGFyZ2V0LCBcblx0XHRcdFx0cmVsZWFzZVBvaW50OiByZWxlYXNlUG9pbnQsIFxuXHRcdFx0XHRwb2ludGVyVHlwZTpwb2ludGVyVHlwZSB8fCAndG91Y2gnXG5cdFx0XHR9O1xuXG5cdFx0ZS5pbml0Q3VzdG9tRXZlbnQoICdwc3dwVGFwJywgdHJ1ZSwgdHJ1ZSwgZURldGFpbCApO1xuXHRcdG9yaWdFdmVudC50YXJnZXQuZGlzcGF0Y2hFdmVudChlKTtcblx0fTtcblxuX3JlZ2lzdGVyTW9kdWxlKCdUYXAnLCB7XG5cdHB1YmxpY01ldGhvZHM6IHtcblx0XHRpbml0VGFwOiBmdW5jdGlvbigpIHtcblx0XHRcdF9saXN0ZW4oJ2ZpcnN0VG91Y2hTdGFydCcsIHNlbGYub25UYXBTdGFydCk7XG5cdFx0XHRfbGlzdGVuKCd0b3VjaFJlbGVhc2UnLCBzZWxmLm9uVGFwUmVsZWFzZSk7XG5cdFx0XHRfbGlzdGVuKCdkZXN0cm95JywgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHRhcFJlbGVhc2VQb2ludCA9IHt9O1xuXHRcdFx0XHR0YXBUaW1lciA9IG51bGw7XG5cdFx0XHR9KTtcblx0XHR9LFxuXHRcdG9uVGFwU3RhcnQ6IGZ1bmN0aW9uKHRvdWNoTGlzdCkge1xuXHRcdFx0aWYodG91Y2hMaXN0Lmxlbmd0aCA+IDEpIHtcblx0XHRcdFx0Y2xlYXJUaW1lb3V0KHRhcFRpbWVyKTtcblx0XHRcdFx0dGFwVGltZXIgPSBudWxsO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0b25UYXBSZWxlYXNlOiBmdW5jdGlvbihlLCByZWxlYXNlUG9pbnQpIHtcblx0XHRcdGlmKCFyZWxlYXNlUG9pbnQpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRpZighX21vdmVkICYmICFfaXNNdWx0aXRvdWNoICYmICFfbnVtQW5pbWF0aW9ucykge1xuXHRcdFx0XHR2YXIgcDAgPSByZWxlYXNlUG9pbnQ7XG5cdFx0XHRcdGlmKHRhcFRpbWVyKSB7XG5cdFx0XHRcdFx0Y2xlYXJUaW1lb3V0KHRhcFRpbWVyKTtcblx0XHRcdFx0XHR0YXBUaW1lciA9IG51bGw7XG5cblx0XHRcdFx0XHQvLyBDaGVjayBpZiB0YXBlZCBvbiB0aGUgc2FtZSBwbGFjZVxuXHRcdFx0XHRcdGlmICggX2lzTmVhcmJ5UG9pbnRzKHAwLCB0YXBSZWxlYXNlUG9pbnQpICkge1xuXHRcdFx0XHRcdFx0X3Nob3V0KCdkb3VibGVUYXAnLCBwMCk7XG5cdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYocmVsZWFzZVBvaW50LnR5cGUgPT09ICdtb3VzZScpIHtcblx0XHRcdFx0XHRfZGlzcGF0Y2hUYXBFdmVudChlLCByZWxlYXNlUG9pbnQsICdtb3VzZScpO1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHZhciBjbGlja2VkVGFnTmFtZSA9IGUudGFyZ2V0LnRhZ05hbWUudG9VcHBlckNhc2UoKTtcblx0XHRcdFx0Ly8gYXZvaWQgZG91YmxlIHRhcCBkZWxheSBvbiBidXR0b25zIGFuZCBlbGVtZW50cyB0aGF0IGhhdmUgY2xhc3MgcHN3cF9fc2luZ2xlLXRhcFxuXHRcdFx0XHRpZihjbGlja2VkVGFnTmFtZSA9PT0gJ0JVVFRPTicgfHwgZnJhbWV3b3JrLmhhc0NsYXNzKGUudGFyZ2V0LCAncHN3cF9fc2luZ2xlLXRhcCcpICkge1xuXHRcdFx0XHRcdF9kaXNwYXRjaFRhcEV2ZW50KGUsIHJlbGVhc2VQb2ludCk7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0X2VxdWFsaXplUG9pbnRzKHRhcFJlbGVhc2VQb2ludCwgcDApO1xuXG5cdFx0XHRcdHRhcFRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRfZGlzcGF0Y2hUYXBFdmVudChlLCByZWxlYXNlUG9pbnQpO1xuXHRcdFx0XHRcdHRhcFRpbWVyID0gbnVsbDtcblx0XHRcdFx0fSwgMzAwKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cbn0pO1xuXG4vKj4+dGFwKi9cblxuLyo+PmRlc2t0b3Atem9vbSovXG4vKipcbiAqXG4gKiBkZXNrdG9wLXpvb20uanM6XG4gKlxuICogLSBCaW5kcyBtb3VzZXdoZWVsIGV2ZW50IGZvciBwYW5pbmcgem9vbWVkIGltYWdlLlxuICogLSBNYW5hZ2VzIFwiZHJhZ2dpbmdcIiwgXCJ6b29tZWQtaW5cIiwgXCJ6b29tLW91dFwiIGNsYXNzZXMuXG4gKiAgICh3aGljaCBhcmUgdXNlZCBmb3IgY3Vyc29ycyBhbmQgem9vbSBpY29uKVxuICogLSBBZGRzIHRvZ2dsZURlc2t0b3Bab29tIGZ1bmN0aW9uLlxuICogXG4gKi9cblxudmFyIF93aGVlbERlbHRhO1xuXHRcbl9yZWdpc3Rlck1vZHVsZSgnRGVza3RvcFpvb20nLCB7XG5cblx0cHVibGljTWV0aG9kczoge1xuXG5cdFx0aW5pdERlc2t0b3Bab29tOiBmdW5jdGlvbigpIHtcblxuXHRcdFx0aWYoX29sZElFKSB7XG5cdFx0XHRcdC8vIG5vIHpvb20gZm9yIG9sZCBJRSAoPD04KVxuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdGlmKF9saWtlbHlUb3VjaERldmljZSkge1xuXHRcdFx0XHQvLyBpZiBkZXRlY3RlZCBoYXJkd2FyZSB0b3VjaCBzdXBwb3J0LCB3ZSB3YWl0IHVudGlsIG1vdXNlIGlzIHVzZWQsXG5cdFx0XHRcdC8vIGFuZCBvbmx5IHRoZW4gYXBwbHkgZGVza3RvcC16b29tIGZlYXR1cmVzXG5cdFx0XHRcdF9saXN0ZW4oJ21vdXNlVXNlZCcsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdHNlbGYuc2V0dXBEZXNrdG9wWm9vbSgpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHNlbGYuc2V0dXBEZXNrdG9wWm9vbSh0cnVlKTtcblx0XHRcdH1cblxuXHRcdH0sXG5cblx0XHRzZXR1cERlc2t0b3Bab29tOiBmdW5jdGlvbihvbkluaXQpIHtcblxuXHRcdFx0X3doZWVsRGVsdGEgPSB7fTtcblxuXHRcdFx0dmFyIGV2ZW50cyA9ICd3aGVlbCBtb3VzZXdoZWVsIERPTU1vdXNlU2Nyb2xsJztcblx0XHRcdFxuXHRcdFx0X2xpc3RlbignYmluZEV2ZW50cycsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRmcmFtZXdvcmsuYmluZCh0ZW1wbGF0ZSwgZXZlbnRzLCAgc2VsZi5oYW5kbGVNb3VzZVdoZWVsKTtcblx0XHRcdH0pO1xuXG5cdFx0XHRfbGlzdGVuKCd1bmJpbmRFdmVudHMnLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0aWYoX3doZWVsRGVsdGEpIHtcblx0XHRcdFx0XHRmcmFtZXdvcmsudW5iaW5kKHRlbXBsYXRlLCBldmVudHMsIHNlbGYuaGFuZGxlTW91c2VXaGVlbCk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXG5cdFx0XHRzZWxmLm1vdXNlWm9vbWVkSW4gPSBmYWxzZTtcblxuXHRcdFx0dmFyIGhhc0RyYWdnaW5nQ2xhc3MsXG5cdFx0XHRcdHVwZGF0ZVpvb21hYmxlID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0aWYoc2VsZi5tb3VzZVpvb21lZEluKSB7XG5cdFx0XHRcdFx0XHRmcmFtZXdvcmsucmVtb3ZlQ2xhc3ModGVtcGxhdGUsICdwc3dwLS16b29tZWQtaW4nKTtcblx0XHRcdFx0XHRcdHNlbGYubW91c2Vab29tZWRJbiA9IGZhbHNlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZihfY3Vyclpvb21MZXZlbCA8IDEpIHtcblx0XHRcdFx0XHRcdGZyYW1ld29yay5hZGRDbGFzcyh0ZW1wbGF0ZSwgJ3Bzd3AtLXpvb20tYWxsb3dlZCcpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRmcmFtZXdvcmsucmVtb3ZlQ2xhc3ModGVtcGxhdGUsICdwc3dwLS16b29tLWFsbG93ZWQnKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0cmVtb3ZlRHJhZ2dpbmdDbGFzcygpO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRyZW1vdmVEcmFnZ2luZ0NsYXNzID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0aWYoaGFzRHJhZ2dpbmdDbGFzcykge1xuXHRcdFx0XHRcdFx0ZnJhbWV3b3JrLnJlbW92ZUNsYXNzKHRlbXBsYXRlLCAncHN3cC0tZHJhZ2dpbmcnKTtcblx0XHRcdFx0XHRcdGhhc0RyYWdnaW5nQ2xhc3MgPSBmYWxzZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH07XG5cblx0XHRcdF9saXN0ZW4oJ3Jlc2l6ZScgLCB1cGRhdGVab29tYWJsZSk7XG5cdFx0XHRfbGlzdGVuKCdhZnRlckNoYW5nZScgLCB1cGRhdGVab29tYWJsZSk7XG5cdFx0XHRfbGlzdGVuKCdwb2ludGVyRG93bicsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRpZihzZWxmLm1vdXNlWm9vbWVkSW4pIHtcblx0XHRcdFx0XHRoYXNEcmFnZ2luZ0NsYXNzID0gdHJ1ZTtcblx0XHRcdFx0XHRmcmFtZXdvcmsuYWRkQ2xhc3ModGVtcGxhdGUsICdwc3dwLS1kcmFnZ2luZycpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRcdF9saXN0ZW4oJ3BvaW50ZXJVcCcsIHJlbW92ZURyYWdnaW5nQ2xhc3MpO1xuXG5cdFx0XHRpZighb25Jbml0KSB7XG5cdFx0XHRcdHVwZGF0ZVpvb21hYmxlKCk7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHR9LFxuXG5cdFx0aGFuZGxlTW91c2VXaGVlbDogZnVuY3Rpb24oZSkge1xuXG5cdFx0XHRpZihfY3Vyclpvb21MZXZlbCA8PSBzZWxmLmN1cnJJdGVtLmZpdFJhdGlvKSB7XG5cdFx0XHRcdGlmKCBfb3B0aW9ucy5tb2RhbCApIHtcblxuXHRcdFx0XHRcdGlmICghX29wdGlvbnMuY2xvc2VPblNjcm9sbCB8fCBfbnVtQW5pbWF0aW9ucyB8fCBfaXNEcmFnZ2luZykge1xuXHRcdFx0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0XHRcdH0gZWxzZSBpZihfdHJhbnNmb3JtS2V5ICYmIE1hdGguYWJzKGUuZGVsdGFZKSA+IDIpIHtcblx0XHRcdFx0XHRcdC8vIGNsb3NlIFBob3RvU3dpcGVcblx0XHRcdFx0XHRcdC8vIGlmIGJyb3dzZXIgc3VwcG9ydHMgdHJhbnNmb3JtcyAmIHNjcm9sbCBjaGFuZ2VkIGVub3VnaFxuXHRcdFx0XHRcdFx0X2Nsb3NlZEJ5U2Nyb2xsID0gdHJ1ZTtcblx0XHRcdFx0XHRcdHNlbGYuY2xvc2UoKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gYWxsb3cganVzdCBvbmUgZXZlbnQgdG8gZmlyZVxuXHRcdFx0ZS5zdG9wUHJvcGFnYXRpb24oKTtcblxuXHRcdFx0Ly8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvRXZlbnRzL3doZWVsXG5cdFx0XHRfd2hlZWxEZWx0YS54ID0gMDtcblxuXHRcdFx0aWYoJ2RlbHRhWCcgaW4gZSkge1xuXHRcdFx0XHRpZihlLmRlbHRhTW9kZSA9PT0gMSAvKiBET01fREVMVEFfTElORSAqLykge1xuXHRcdFx0XHRcdC8vIDE4IC0gYXZlcmFnZSBsaW5lIGhlaWdodFxuXHRcdFx0XHRcdF93aGVlbERlbHRhLnggPSBlLmRlbHRhWCAqIDE4O1xuXHRcdFx0XHRcdF93aGVlbERlbHRhLnkgPSBlLmRlbHRhWSAqIDE4O1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdF93aGVlbERlbHRhLnggPSBlLmRlbHRhWDtcblx0XHRcdFx0XHRfd2hlZWxEZWx0YS55ID0gZS5kZWx0YVk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSBpZignd2hlZWxEZWx0YScgaW4gZSkge1xuXHRcdFx0XHRpZihlLndoZWVsRGVsdGFYKSB7XG5cdFx0XHRcdFx0X3doZWVsRGVsdGEueCA9IC0wLjE2ICogZS53aGVlbERlbHRhWDtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZihlLndoZWVsRGVsdGFZKSB7XG5cdFx0XHRcdFx0X3doZWVsRGVsdGEueSA9IC0wLjE2ICogZS53aGVlbERlbHRhWTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRfd2hlZWxEZWx0YS55ID0gLTAuMTYgKiBlLndoZWVsRGVsdGE7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSBpZignZGV0YWlsJyBpbiBlKSB7XG5cdFx0XHRcdF93aGVlbERlbHRhLnkgPSBlLmRldGFpbDtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0X2NhbGN1bGF0ZVBhbkJvdW5kcyhfY3Vyclpvb21MZXZlbCwgdHJ1ZSk7XG5cblx0XHRcdHZhciBuZXdQYW5YID0gX3Bhbk9mZnNldC54IC0gX3doZWVsRGVsdGEueCxcblx0XHRcdFx0bmV3UGFuWSA9IF9wYW5PZmZzZXQueSAtIF93aGVlbERlbHRhLnk7XG5cblx0XHRcdC8vIG9ubHkgcHJldmVudCBzY3JvbGxpbmcgaW4gbm9ubW9kYWwgbW9kZSB3aGVuIG5vdCBhdCBlZGdlc1xuXHRcdFx0aWYgKF9vcHRpb25zLm1vZGFsIHx8XG5cdFx0XHRcdChcblx0XHRcdFx0bmV3UGFuWCA8PSBfY3VyclBhbkJvdW5kcy5taW4ueCAmJiBuZXdQYW5YID49IF9jdXJyUGFuQm91bmRzLm1heC54ICYmXG5cdFx0XHRcdG5ld1BhblkgPD0gX2N1cnJQYW5Cb3VuZHMubWluLnkgJiYgbmV3UGFuWSA+PSBfY3VyclBhbkJvdW5kcy5tYXgueVxuXHRcdFx0XHQpICkge1xuXHRcdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIFRPRE86IHVzZSByQUYgaW5zdGVhZCBvZiBtb3VzZXdoZWVsP1xuXHRcdFx0c2VsZi5wYW5UbyhuZXdQYW5YLCBuZXdQYW5ZKTtcblx0XHR9LFxuXG5cdFx0dG9nZ2xlRGVza3RvcFpvb206IGZ1bmN0aW9uKGNlbnRlclBvaW50KSB7XG5cdFx0XHRjZW50ZXJQb2ludCA9IGNlbnRlclBvaW50IHx8IHt4Ol92aWV3cG9ydFNpemUueC8yICsgX29mZnNldC54LCB5Ol92aWV3cG9ydFNpemUueS8yICsgX29mZnNldC55IH07XG5cblx0XHRcdHZhciBkb3VibGVUYXBab29tTGV2ZWwgPSBfb3B0aW9ucy5nZXREb3VibGVUYXBab29tKHRydWUsIHNlbGYuY3Vyckl0ZW0pO1xuXHRcdFx0dmFyIHpvb21PdXQgPSBfY3Vyclpvb21MZXZlbCA9PT0gZG91YmxlVGFwWm9vbUxldmVsO1xuXHRcdFx0XG5cdFx0XHRzZWxmLm1vdXNlWm9vbWVkSW4gPSAhem9vbU91dDtcblxuXHRcdFx0c2VsZi56b29tVG8oem9vbU91dCA/IHNlbGYuY3Vyckl0ZW0uaW5pdGlhbFpvb21MZXZlbCA6IGRvdWJsZVRhcFpvb21MZXZlbCwgY2VudGVyUG9pbnQsIDMzMyk7XG5cdFx0XHRmcmFtZXdvcmtbICghem9vbU91dCA/ICdhZGQnIDogJ3JlbW92ZScpICsgJ0NsYXNzJ10odGVtcGxhdGUsICdwc3dwLS16b29tZWQtaW4nKTtcblx0XHR9XG5cblx0fVxufSk7XG5cblxuLyo+PmRlc2t0b3Atem9vbSovXG5cbi8qPj5oaXN0b3J5Ki9cbi8qKlxuICpcbiAqIGhpc3RvcnkuanM6XG4gKlxuICogLSBCYWNrIGJ1dHRvbiB0byBjbG9zZSBnYWxsZXJ5LlxuICogXG4gKiAtIFVuaXF1ZSBVUkwgZm9yIGVhY2ggc2xpZGU6IGV4YW1wbGUuY29tLyZwaWQ9MSZnaWQ9M1xuICogICAod2hlcmUgUElEIGlzIHBpY3R1cmUgaW5kZXgsIGFuZCBHSUQgYW5kIGdhbGxlcnkgaW5kZXgpXG4gKiAgIFxuICogLSBTd2l0Y2ggVVJMIHdoZW4gc2xpZGVzIGNoYW5nZS5cbiAqIFxuICovXG5cblxudmFyIF9oaXN0b3J5RGVmYXVsdE9wdGlvbnMgPSB7XG5cdGhpc3Rvcnk6IHRydWUsXG5cdGdhbGxlcnlVSUQ6IDFcbn07XG5cbnZhciBfaGlzdG9yeVVwZGF0ZVRpbWVvdXQsXG5cdF9oYXNoQ2hhbmdlVGltZW91dCxcblx0X2hhc2hBbmltQ2hlY2tUaW1lb3V0LFxuXHRfaGFzaENoYW5nZWRCeVNjcmlwdCxcblx0X2hhc2hDaGFuZ2VkQnlIaXN0b3J5LFxuXHRfaGFzaFJlc2V0ZWQsXG5cdF9pbml0aWFsSGFzaCxcblx0X2hpc3RvcnlDaGFuZ2VkLFxuXHRfY2xvc2VkRnJvbVVSTCxcblx0X3VybENoYW5nZWRPbmNlLFxuXHRfd2luZG93TG9jLFxuXG5cdF9zdXBwb3J0c1B1c2hTdGF0ZSxcblxuXHRfZ2V0SGFzaCA9IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiBfd2luZG93TG9jLmhhc2guc3Vic3RyaW5nKDEpO1xuXHR9LFxuXHRfY2xlYW5IaXN0b3J5VGltZW91dHMgPSBmdW5jdGlvbigpIHtcblxuXHRcdGlmKF9oaXN0b3J5VXBkYXRlVGltZW91dCkge1xuXHRcdFx0Y2xlYXJUaW1lb3V0KF9oaXN0b3J5VXBkYXRlVGltZW91dCk7XG5cdFx0fVxuXG5cdFx0aWYoX2hhc2hBbmltQ2hlY2tUaW1lb3V0KSB7XG5cdFx0XHRjbGVhclRpbWVvdXQoX2hhc2hBbmltQ2hlY2tUaW1lb3V0KTtcblx0XHR9XG5cdH0sXG5cblx0Ly8gcGlkIC0gUGljdHVyZSBpbmRleFxuXHQvLyBnaWQgLSBHYWxsZXJ5IGluZGV4XG5cdF9wYXJzZUl0ZW1JbmRleEZyb21VUkwgPSBmdW5jdGlvbigpIHtcblx0XHR2YXIgaGFzaCA9IF9nZXRIYXNoKCksXG5cdFx0XHRwYXJhbXMgPSB7fTtcblxuXHRcdGlmKGhhc2gubGVuZ3RoIDwgNSkgeyAvLyBwaWQ9MVxuXHRcdFx0cmV0dXJuIHBhcmFtcztcblx0XHR9XG5cblx0XHR2YXIgaSwgdmFycyA9IGhhc2guc3BsaXQoJyYnKTtcblx0XHRmb3IgKGkgPSAwOyBpIDwgdmFycy5sZW5ndGg7IGkrKykge1xuXHRcdFx0aWYoIXZhcnNbaV0pIHtcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cdFx0XHR2YXIgcGFpciA9IHZhcnNbaV0uc3BsaXQoJz0nKTtcdFxuXHRcdFx0aWYocGFpci5sZW5ndGggPCAyKSB7XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXHRcdFx0cGFyYW1zW3BhaXJbMF1dID0gcGFpclsxXTtcblx0XHR9XG5cdFx0aWYoX29wdGlvbnMuZ2FsbGVyeVBJRHMpIHtcblx0XHRcdC8vIGRldGVjdCBjdXN0b20gcGlkIGluIGhhc2ggYW5kIHNlYXJjaCBmb3IgaXQgYW1vbmcgdGhlIGl0ZW1zIGNvbGxlY3Rpb25cblx0XHRcdHZhciBzZWFyY2hmb3IgPSBwYXJhbXMucGlkO1xuXHRcdFx0cGFyYW1zLnBpZCA9IDA7IC8vIGlmIGN1c3RvbSBwaWQgY2Fubm90IGJlIGZvdW5kLCBmYWxsYmFjayB0byB0aGUgZmlyc3QgaXRlbVxuXHRcdFx0Zm9yKGkgPSAwOyBpIDwgX2l0ZW1zLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGlmKF9pdGVtc1tpXS5waWQgPT09IHNlYXJjaGZvcikge1xuXHRcdFx0XHRcdHBhcmFtcy5waWQgPSBpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdHBhcmFtcy5waWQgPSBwYXJzZUludChwYXJhbXMucGlkLDEwKS0xO1xuXHRcdH1cblx0XHRpZiggcGFyYW1zLnBpZCA8IDAgKSB7XG5cdFx0XHRwYXJhbXMucGlkID0gMDtcblx0XHR9XG5cdFx0cmV0dXJuIHBhcmFtcztcblx0fSxcblx0X3VwZGF0ZUhhc2ggPSBmdW5jdGlvbigpIHtcblxuXHRcdGlmKF9oYXNoQW5pbUNoZWNrVGltZW91dCkge1xuXHRcdFx0Y2xlYXJUaW1lb3V0KF9oYXNoQW5pbUNoZWNrVGltZW91dCk7XG5cdFx0fVxuXG5cblx0XHRpZihfbnVtQW5pbWF0aW9ucyB8fCBfaXNEcmFnZ2luZykge1xuXHRcdFx0Ly8gY2hhbmdpbmcgYnJvd3NlciBVUkwgZm9yY2VzIGxheW91dC9wYWludCBpbiBzb21lIGJyb3dzZXJzLCB3aGljaCBjYXVzZXMgbm90aWNhYmxlIGxhZyBkdXJpbmcgYW5pbWF0aW9uXG5cdFx0XHQvLyB0aGF0J3Mgd2h5IHdlIHVwZGF0ZSBoYXNoIG9ubHkgd2hlbiBubyBhbmltYXRpb25zIHJ1bm5pbmdcblx0XHRcdF9oYXNoQW5pbUNoZWNrVGltZW91dCA9IHNldFRpbWVvdXQoX3VwZGF0ZUhhc2gsIDUwMCk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdFxuXHRcdGlmKF9oYXNoQ2hhbmdlZEJ5U2NyaXB0KSB7XG5cdFx0XHRjbGVhclRpbWVvdXQoX2hhc2hDaGFuZ2VUaW1lb3V0KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0X2hhc2hDaGFuZ2VkQnlTY3JpcHQgPSB0cnVlO1xuXHRcdH1cblxuXG5cdFx0dmFyIHBpZCA9IChfY3VycmVudEl0ZW1JbmRleCArIDEpO1xuXHRcdHZhciBpdGVtID0gX2dldEl0ZW1BdCggX2N1cnJlbnRJdGVtSW5kZXggKTtcblx0XHRpZihpdGVtLmhhc093blByb3BlcnR5KCdwaWQnKSkge1xuXHRcdFx0Ly8gY2FycnkgZm9yd2FyZCBhbnkgY3VzdG9tIHBpZCBhc3NpZ25lZCB0byB0aGUgaXRlbVxuXHRcdFx0cGlkID0gaXRlbS5waWQ7XG5cdFx0fVxuXHRcdHZhciBuZXdIYXNoID0gX2luaXRpYWxIYXNoICsgJyYnICArICAnZ2lkPScgKyBfb3B0aW9ucy5nYWxsZXJ5VUlEICsgJyYnICsgJ3BpZD0nICsgcGlkO1xuXG5cdFx0aWYoIV9oaXN0b3J5Q2hhbmdlZCkge1xuXHRcdFx0aWYoX3dpbmRvd0xvYy5oYXNoLmluZGV4T2YobmV3SGFzaCkgPT09IC0xKSB7XG5cdFx0XHRcdF91cmxDaGFuZ2VkT25jZSA9IHRydWU7XG5cdFx0XHR9XG5cdFx0XHQvLyBmaXJzdCB0aW1lIC0gYWRkIG5ldyBoaXNvcnkgcmVjb3JkLCB0aGVuIGp1c3QgcmVwbGFjZVxuXHRcdH1cblxuXHRcdHZhciBuZXdVUkwgPSBfd2luZG93TG9jLmhyZWYuc3BsaXQoJyMnKVswXSArICcjJyArICBuZXdIYXNoO1xuXG5cdFx0aWYoIF9zdXBwb3J0c1B1c2hTdGF0ZSApIHtcblxuXHRcdFx0aWYoJyMnICsgbmV3SGFzaCAhPT0gd2luZG93LmxvY2F0aW9uLmhhc2gpIHtcblx0XHRcdFx0aGlzdG9yeVtfaGlzdG9yeUNoYW5nZWQgPyAncmVwbGFjZVN0YXRlJyA6ICdwdXNoU3RhdGUnXSgnJywgZG9jdW1lbnQudGl0bGUsIG5ld1VSTCk7XG5cdFx0XHR9XG5cblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYoX2hpc3RvcnlDaGFuZ2VkKSB7XG5cdFx0XHRcdF93aW5kb3dMb2MucmVwbGFjZSggbmV3VVJMICk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRfd2luZG93TG9jLmhhc2ggPSBuZXdIYXNoO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRcblx0XHRcblxuXHRcdF9oaXN0b3J5Q2hhbmdlZCA9IHRydWU7XG5cdFx0X2hhc2hDaGFuZ2VUaW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdF9oYXNoQ2hhbmdlZEJ5U2NyaXB0ID0gZmFsc2U7XG5cdFx0fSwgNjApO1xuXHR9O1xuXG5cblxuXHRcblxuX3JlZ2lzdGVyTW9kdWxlKCdIaXN0b3J5Jywge1xuXG5cdFxuXG5cdHB1YmxpY01ldGhvZHM6IHtcblx0XHRpbml0SGlzdG9yeTogZnVuY3Rpb24oKSB7XG5cblx0XHRcdGZyYW1ld29yay5leHRlbmQoX29wdGlvbnMsIF9oaXN0b3J5RGVmYXVsdE9wdGlvbnMsIHRydWUpO1xuXG5cdFx0XHRpZiggIV9vcHRpb25zLmhpc3RvcnkgKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXG5cdFx0XHRfd2luZG93TG9jID0gd2luZG93LmxvY2F0aW9uO1xuXHRcdFx0X3VybENoYW5nZWRPbmNlID0gZmFsc2U7XG5cdFx0XHRfY2xvc2VkRnJvbVVSTCA9IGZhbHNlO1xuXHRcdFx0X2hpc3RvcnlDaGFuZ2VkID0gZmFsc2U7XG5cdFx0XHRfaW5pdGlhbEhhc2ggPSBfZ2V0SGFzaCgpO1xuXHRcdFx0X3N1cHBvcnRzUHVzaFN0YXRlID0gKCdwdXNoU3RhdGUnIGluIGhpc3RvcnkpO1xuXG5cblx0XHRcdGlmKF9pbml0aWFsSGFzaC5pbmRleE9mKCdnaWQ9JykgPiAtMSkge1xuXHRcdFx0XHRfaW5pdGlhbEhhc2ggPSBfaW5pdGlhbEhhc2guc3BsaXQoJyZnaWQ9JylbMF07XG5cdFx0XHRcdF9pbml0aWFsSGFzaCA9IF9pbml0aWFsSGFzaC5zcGxpdCgnP2dpZD0nKVswXTtcblx0XHRcdH1cblx0XHRcdFxuXG5cdFx0XHRfbGlzdGVuKCdhZnRlckNoYW5nZScsIHNlbGYudXBkYXRlVVJMKTtcblx0XHRcdF9saXN0ZW4oJ3VuYmluZEV2ZW50cycsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRmcmFtZXdvcmsudW5iaW5kKHdpbmRvdywgJ2hhc2hjaGFuZ2UnLCBzZWxmLm9uSGFzaENoYW5nZSk7XG5cdFx0XHR9KTtcblxuXG5cdFx0XHR2YXIgcmV0dXJuVG9PcmlnaW5hbCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRfaGFzaFJlc2V0ZWQgPSB0cnVlO1xuXHRcdFx0XHRpZighX2Nsb3NlZEZyb21VUkwpIHtcblxuXHRcdFx0XHRcdGlmKF91cmxDaGFuZ2VkT25jZSkge1xuXHRcdFx0XHRcdFx0aGlzdG9yeS5iYWNrKCk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHRcdFx0aWYoX2luaXRpYWxIYXNoKSB7XG5cdFx0XHRcdFx0XHRcdF93aW5kb3dMb2MuaGFzaCA9IF9pbml0aWFsSGFzaDtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdGlmIChfc3VwcG9ydHNQdXNoU3RhdGUpIHtcblxuXHRcdFx0XHRcdFx0XHRcdC8vIHJlbW92ZSBoYXNoIGZyb20gdXJsIHdpdGhvdXQgcmVmcmVzaGluZyBpdCBvciBzY3JvbGxpbmcgdG8gdG9wXG5cdFx0XHRcdFx0XHRcdFx0aGlzdG9yeS5wdXNoU3RhdGUoJycsIGRvY3VtZW50LnRpdGxlLCAgX3dpbmRvd0xvYy5wYXRobmFtZSArIF93aW5kb3dMb2Muc2VhcmNoICk7XG5cdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0X3dpbmRvd0xvYy5oYXNoID0gJyc7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRfY2xlYW5IaXN0b3J5VGltZW91dHMoKTtcblx0XHRcdH07XG5cblxuXHRcdFx0X2xpc3RlbigndW5iaW5kRXZlbnRzJywgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGlmKF9jbG9zZWRCeVNjcm9sbCkge1xuXHRcdFx0XHRcdC8vIGlmIFBob3RvU3dpcGUgaXMgY2xvc2VkIGJ5IHNjcm9sbCwgd2UgZ28gXCJiYWNrXCIgYmVmb3JlIHRoZSBjbG9zaW5nIGFuaW1hdGlvbiBzdGFydHNcblx0XHRcdFx0XHQvLyB0aGlzIGlzIGRvbmUgdG8ga2VlcCB0aGUgc2Nyb2xsIHBvc2l0aW9uXG5cdFx0XHRcdFx0cmV0dXJuVG9PcmlnaW5hbCgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRcdF9saXN0ZW4oJ2Rlc3Ryb3knLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0aWYoIV9oYXNoUmVzZXRlZCkge1xuXHRcdFx0XHRcdHJldHVyblRvT3JpZ2luYWwoKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0XHRfbGlzdGVuKCdmaXJzdFVwZGF0ZScsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRfY3VycmVudEl0ZW1JbmRleCA9IF9wYXJzZUl0ZW1JbmRleEZyb21VUkwoKS5waWQ7XG5cdFx0XHR9KTtcblxuXHRcdFx0XG5cblx0XHRcdFxuXHRcdFx0dmFyIGluZGV4ID0gX2luaXRpYWxIYXNoLmluZGV4T2YoJ3BpZD0nKTtcblx0XHRcdGlmKGluZGV4ID4gLTEpIHtcblx0XHRcdFx0X2luaXRpYWxIYXNoID0gX2luaXRpYWxIYXNoLnN1YnN0cmluZygwLCBpbmRleCk7XG5cdFx0XHRcdGlmKF9pbml0aWFsSGFzaC5zbGljZSgtMSkgPT09ICcmJykge1xuXHRcdFx0XHRcdF9pbml0aWFsSGFzaCA9IF9pbml0aWFsSGFzaC5zbGljZSgwLCAtMSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdFxuXG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRpZihfaXNPcGVuKSB7IC8vIGhhc24ndCBkZXN0cm95ZWQgeWV0XG5cdFx0XHRcdFx0ZnJhbWV3b3JrLmJpbmQod2luZG93LCAnaGFzaGNoYW5nZScsIHNlbGYub25IYXNoQ2hhbmdlKTtcblx0XHRcdFx0fVxuXHRcdFx0fSwgNDApO1xuXHRcdFx0XG5cdFx0fSxcblx0XHRvbkhhc2hDaGFuZ2U6IGZ1bmN0aW9uKCkge1xuXG5cdFx0XHRpZihfZ2V0SGFzaCgpID09PSBfaW5pdGlhbEhhc2gpIHtcblxuXHRcdFx0XHRfY2xvc2VkRnJvbVVSTCA9IHRydWU7XG5cdFx0XHRcdHNlbGYuY2xvc2UoKTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0aWYoIV9oYXNoQ2hhbmdlZEJ5U2NyaXB0KSB7XG5cblx0XHRcdFx0X2hhc2hDaGFuZ2VkQnlIaXN0b3J5ID0gdHJ1ZTtcblx0XHRcdFx0c2VsZi5nb1RvKCBfcGFyc2VJdGVtSW5kZXhGcm9tVVJMKCkucGlkICk7XG5cdFx0XHRcdF9oYXNoQ2hhbmdlZEJ5SGlzdG9yeSA9IGZhbHNlO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0fSxcblx0XHR1cGRhdGVVUkw6IGZ1bmN0aW9uKCkge1xuXG5cdFx0XHQvLyBEZWxheSB0aGUgdXBkYXRlIG9mIFVSTCwgdG8gYXZvaWQgbGFnIGR1cmluZyB0cmFuc2l0aW9uLCBcblx0XHRcdC8vIGFuZCB0byBub3QgdG8gdHJpZ2dlciBhY3Rpb25zIGxpa2UgXCJyZWZyZXNoIHBhZ2Ugc291bmRcIiBvciBcImJsaW5raW5nIGZhdmljb25cIiB0byBvZnRlblxuXHRcdFx0XG5cdFx0XHRfY2xlYW5IaXN0b3J5VGltZW91dHMoKTtcblx0XHRcdFxuXG5cdFx0XHRpZihfaGFzaENoYW5nZWRCeUhpc3RvcnkpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRpZighX2hpc3RvcnlDaGFuZ2VkKSB7XG5cdFx0XHRcdF91cGRhdGVIYXNoKCk7IC8vIGZpcnN0IHRpbWVcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdF9oaXN0b3J5VXBkYXRlVGltZW91dCA9IHNldFRpbWVvdXQoX3VwZGF0ZUhhc2gsIDgwMCk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcblx0fVxufSk7XG5cblxuLyo+Pmhpc3RvcnkqL1xuXHRmcmFtZXdvcmsuZXh0ZW5kKHNlbGYsIHB1YmxpY01ldGhvZHMpOyB9O1xuXHRyZXR1cm4gUGhvdG9Td2lwZTtcbn0pOyIsIi8qISBQaG90b1N3aXBlIERlZmF1bHQgVUkgLSA0LjEuMiAtIDIwMTctMDQtMDVcbiogaHR0cDovL3Bob3Rvc3dpcGUuY29tXG4qIENvcHlyaWdodCAoYykgMjAxNyBEbWl0cnkgU2VtZW5vdjsgKi9cbi8qKlxuKlxuKiBVSSBvbiB0b3Agb2YgbWFpbiBzbGlkaW5nIGFyZWEgKGNhcHRpb24sIGFycm93cywgY2xvc2UgYnV0dG9uLCBldGMuKS5cbiogQnVpbHQganVzdCB1c2luZyBwdWJsaWMgbWV0aG9kcy9wcm9wZXJ0aWVzIG9mIFBob3RvU3dpcGUuXG4qIFxuKi9cbihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkgeyBcblx0aWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuXHRcdGRlZmluZShmYWN0b3J5KTtcblx0fSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcblx0XHRtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcblx0fSBlbHNlIHtcblx0XHRyb290LlBob3RvU3dpcGVVSV9EZWZhdWx0ID0gZmFjdG9yeSgpO1xuXHR9XG59KSh0aGlzLCBmdW5jdGlvbiAoKSB7XG5cblx0J3VzZSBzdHJpY3QnO1xuXG5cblxudmFyIFBob3RvU3dpcGVVSV9EZWZhdWx0ID1cbiBmdW5jdGlvbihwc3dwLCBmcmFtZXdvcmspIHtcblxuXHR2YXIgdWkgPSB0aGlzO1xuXHR2YXIgX292ZXJsYXlVSVVwZGF0ZWQgPSBmYWxzZSxcblx0XHRfY29udHJvbHNWaXNpYmxlID0gdHJ1ZSxcblx0XHRfZnVsbHNjcmVuQVBJLFxuXHRcdF9jb250cm9scyxcblx0XHRfY2FwdGlvbkNvbnRhaW5lcixcblx0XHRfZmFrZUNhcHRpb25Db250YWluZXIsXG5cdFx0X2luZGV4SW5kaWNhdG9yLFxuXHRcdF9zaGFyZUJ1dHRvbixcblx0XHRfc2hhcmVNb2RhbCxcblx0XHRfc2hhcmVNb2RhbEhpZGRlbiA9IHRydWUsXG5cdFx0X2luaXRhbENsb3NlT25TY3JvbGxWYWx1ZSxcblx0XHRfaXNJZGxlLFxuXHRcdF9saXN0ZW4sXG5cblx0XHRfbG9hZGluZ0luZGljYXRvcixcblx0XHRfbG9hZGluZ0luZGljYXRvckhpZGRlbixcblx0XHRfbG9hZGluZ0luZGljYXRvclRpbWVvdXQsXG5cblx0XHRfZ2FsbGVyeUhhc09uZVNsaWRlLFxuXG5cdFx0X29wdGlvbnMsXG5cdFx0X2RlZmF1bHRVSU9wdGlvbnMgPSB7XG5cdFx0XHRiYXJzU2l6ZToge3RvcDo0NCwgYm90dG9tOidhdXRvJ30sXG5cdFx0XHRjbG9zZUVsQ2xhc3NlczogWydpdGVtJywgJ2NhcHRpb24nLCAnem9vbS13cmFwJywgJ3VpJywgJ3RvcC1iYXInXSwgXG5cdFx0XHR0aW1lVG9JZGxlOiA0MDAwLCBcblx0XHRcdHRpbWVUb0lkbGVPdXRzaWRlOiAxMDAwLFxuXHRcdFx0bG9hZGluZ0luZGljYXRvckRlbGF5OiAxMDAwLCAvLyAyc1xuXHRcdFx0XG5cdFx0XHRhZGRDYXB0aW9uSFRNTEZuOiBmdW5jdGlvbihpdGVtLCBjYXB0aW9uRWwgLyosIGlzRmFrZSAqLykge1xuXHRcdFx0XHRpZighaXRlbS50aXRsZSkge1xuXHRcdFx0XHRcdGNhcHRpb25FbC5jaGlsZHJlblswXS5pbm5lckhUTUwgPSAnJztcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblx0XHRcdFx0Y2FwdGlvbkVsLmNoaWxkcmVuWzBdLmlubmVySFRNTCA9IGl0ZW0udGl0bGU7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fSxcblxuXHRcdFx0Y2xvc2VFbDp0cnVlLFxuXHRcdFx0Y2FwdGlvbkVsOiB0cnVlLFxuXHRcdFx0ZnVsbHNjcmVlbkVsOiB0cnVlLFxuXHRcdFx0em9vbUVsOiB0cnVlLFxuXHRcdFx0c2hhcmVFbDogdHJ1ZSxcblx0XHRcdGNvdW50ZXJFbDogdHJ1ZSxcblx0XHRcdGFycm93RWw6IHRydWUsXG5cdFx0XHRwcmVsb2FkZXJFbDogdHJ1ZSxcblxuXHRcdFx0dGFwVG9DbG9zZTogZmFsc2UsXG5cdFx0XHR0YXBUb1RvZ2dsZUNvbnRyb2xzOiB0cnVlLFxuXG5cdFx0XHRjbGlja1RvQ2xvc2VOb25ab29tYWJsZTogdHJ1ZSxcblxuXHRcdFx0c2hhcmVCdXR0b25zOiBbXG5cdFx0XHRcdHtpZDonZmFjZWJvb2snLCBsYWJlbDonU2hhcmUgb24gRmFjZWJvb2snLCB1cmw6J2h0dHBzOi8vd3d3LmZhY2Vib29rLmNvbS9zaGFyZXIvc2hhcmVyLnBocD91PXt7dXJsfX0nfSxcblx0XHRcdFx0e2lkOid0d2l0dGVyJywgbGFiZWw6J1R3ZWV0JywgdXJsOidodHRwczovL3R3aXR0ZXIuY29tL2ludGVudC90d2VldD90ZXh0PXt7dGV4dH19JnVybD17e3VybH19J30sXG5cdFx0XHRcdHtpZDoncGludGVyZXN0JywgbGFiZWw6J1BpbiBpdCcsIHVybDonaHR0cDovL3d3dy5waW50ZXJlc3QuY29tL3Bpbi9jcmVhdGUvYnV0dG9uLycrXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdCc/dXJsPXt7dXJsfX0mbWVkaWE9e3tpbWFnZV91cmx9fSZkZXNjcmlwdGlvbj17e3RleHR9fSd9LFxuXHRcdFx0XHR7aWQ6J2Rvd25sb2FkJywgbGFiZWw6J0Rvd25sb2FkIGltYWdlJywgdXJsOid7e3Jhd19pbWFnZV91cmx9fScsIGRvd25sb2FkOnRydWV9XG5cdFx0XHRdLFxuXHRcdFx0Z2V0SW1hZ2VVUkxGb3JTaGFyZTogZnVuY3Rpb24oIC8qIHNoYXJlQnV0dG9uRGF0YSAqLyApIHtcblx0XHRcdFx0cmV0dXJuIHBzd3AuY3Vyckl0ZW0uc3JjIHx8ICcnO1xuXHRcdFx0fSxcblx0XHRcdGdldFBhZ2VVUkxGb3JTaGFyZTogZnVuY3Rpb24oIC8qIHNoYXJlQnV0dG9uRGF0YSAqLyApIHtcblx0XHRcdFx0cmV0dXJuIHdpbmRvdy5sb2NhdGlvbi5ocmVmO1xuXHRcdFx0fSxcblx0XHRcdGdldFRleHRGb3JTaGFyZTogZnVuY3Rpb24oIC8qIHNoYXJlQnV0dG9uRGF0YSAqLyApIHtcblx0XHRcdFx0cmV0dXJuIHBzd3AuY3Vyckl0ZW0udGl0bGUgfHwgJyc7XG5cdFx0XHR9LFxuXHRcdFx0XHRcblx0XHRcdGluZGV4SW5kaWNhdG9yU2VwOiAnIC8gJyxcblx0XHRcdGZpdENvbnRyb2xzV2lkdGg6IDEyMDBcblxuXHRcdH0sXG5cdFx0X2Jsb2NrQ29udHJvbHNUYXAsXG5cdFx0X2Jsb2NrQ29udHJvbHNUYXBUaW1lb3V0O1xuXG5cblxuXHR2YXIgX29uQ29udHJvbHNUYXAgPSBmdW5jdGlvbihlKSB7XG5cdFx0XHRpZihfYmxvY2tDb250cm9sc1RhcCkge1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblxuXG5cdFx0XHRlID0gZSB8fCB3aW5kb3cuZXZlbnQ7XG5cblx0XHRcdGlmKF9vcHRpb25zLnRpbWVUb0lkbGUgJiYgX29wdGlvbnMubW91c2VVc2VkICYmICFfaXNJZGxlKSB7XG5cdFx0XHRcdC8vIHJlc2V0IGlkbGUgdGltZXJcblx0XHRcdFx0X29uSWRsZU1vdXNlTW92ZSgpO1xuXHRcdFx0fVxuXG5cblx0XHRcdHZhciB0YXJnZXQgPSBlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnQsXG5cdFx0XHRcdHVpRWxlbWVudCxcblx0XHRcdFx0Y2xpY2tlZENsYXNzID0gdGFyZ2V0LmdldEF0dHJpYnV0ZSgnY2xhc3MnKSB8fCAnJyxcblx0XHRcdFx0Zm91bmQ7XG5cblx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCBfdWlFbGVtZW50cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR1aUVsZW1lbnQgPSBfdWlFbGVtZW50c1tpXTtcblx0XHRcdFx0aWYodWlFbGVtZW50Lm9uVGFwICYmIGNsaWNrZWRDbGFzcy5pbmRleE9mKCdwc3dwX18nICsgdWlFbGVtZW50Lm5hbWUgKSA+IC0xICkge1xuXHRcdFx0XHRcdHVpRWxlbWVudC5vblRhcCgpO1xuXHRcdFx0XHRcdGZvdW5kID0gdHJ1ZTtcblxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGlmKGZvdW5kKSB7XG5cdFx0XHRcdGlmKGUuc3RvcFByb3BhZ2F0aW9uKSB7XG5cdFx0XHRcdFx0ZS5zdG9wUHJvcGFnYXRpb24oKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRfYmxvY2tDb250cm9sc1RhcCA9IHRydWU7XG5cblx0XHRcdFx0Ly8gU29tZSB2ZXJzaW9ucyBvZiBBbmRyb2lkIGRvbid0IHByZXZlbnQgZ2hvc3QgY2xpY2sgZXZlbnQgXG5cdFx0XHRcdC8vIHdoZW4gcHJldmVudERlZmF1bHQoKSB3YXMgY2FsbGVkIG9uIHRvdWNoc3RhcnQgYW5kL29yIHRvdWNoZW5kLlxuXHRcdFx0XHQvLyBcblx0XHRcdFx0Ly8gVGhpcyBoYXBwZW5zIG9uIHY0LjMsIDQuMiwgNC4xLCBcblx0XHRcdFx0Ly8gb2xkZXIgdmVyc2lvbnMgc3RyYW5nZWx5IHdvcmsgY29ycmVjdGx5LCBcblx0XHRcdFx0Ly8gYnV0IGp1c3QgaW4gY2FzZSB3ZSBhZGQgZGVsYXkgb24gYWxsIG9mIHRoZW0pXHRcblx0XHRcdFx0dmFyIHRhcERlbGF5ID0gZnJhbWV3b3JrLmZlYXR1cmVzLmlzT2xkQW5kcm9pZCA/IDYwMCA6IDMwO1xuXHRcdFx0XHRfYmxvY2tDb250cm9sc1RhcFRpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdF9ibG9ja0NvbnRyb2xzVGFwID0gZmFsc2U7XG5cdFx0XHRcdH0sIHRhcERlbGF5KTtcblx0XHRcdH1cblxuXHRcdH0sXG5cdFx0X2ZpdENvbnRyb2xzSW5WaWV3cG9ydCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuICFwc3dwLmxpa2VseVRvdWNoRGV2aWNlIHx8IF9vcHRpb25zLm1vdXNlVXNlZCB8fCBzY3JlZW4ud2lkdGggPiBfb3B0aW9ucy5maXRDb250cm9sc1dpZHRoO1xuXHRcdH0sXG5cdFx0X3RvZ2dsZVBzd3BDbGFzcyA9IGZ1bmN0aW9uKGVsLCBjTmFtZSwgYWRkKSB7XG5cdFx0XHRmcmFtZXdvcmtbIChhZGQgPyAnYWRkJyA6ICdyZW1vdmUnKSArICdDbGFzcycgXShlbCwgJ3Bzd3BfXycgKyBjTmFtZSk7XG5cdFx0fSxcblxuXHRcdC8vIGFkZCBjbGFzcyB3aGVuIHRoZXJlIGlzIGp1c3Qgb25lIGl0ZW0gaW4gdGhlIGdhbGxlcnlcblx0XHQvLyAoYnkgZGVmYXVsdCBpdCBoaWRlcyBsZWZ0L3JpZ2h0IGFycm93cyBhbmQgMW9mWCBjb3VudGVyKVxuXHRcdF9jb3VudE51bUl0ZW1zID0gZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgaGFzT25lU2xpZGUgPSAoX29wdGlvbnMuZ2V0TnVtSXRlbXNGbigpID09PSAxKTtcblxuXHRcdFx0aWYoaGFzT25lU2xpZGUgIT09IF9nYWxsZXJ5SGFzT25lU2xpZGUpIHtcblx0XHRcdFx0X3RvZ2dsZVBzd3BDbGFzcyhfY29udHJvbHMsICd1aS0tb25lLXNsaWRlJywgaGFzT25lU2xpZGUpO1xuXHRcdFx0XHRfZ2FsbGVyeUhhc09uZVNsaWRlID0gaGFzT25lU2xpZGU7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRfdG9nZ2xlU2hhcmVNb2RhbENsYXNzID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRfdG9nZ2xlUHN3cENsYXNzKF9zaGFyZU1vZGFsLCAnc2hhcmUtbW9kYWwtLWhpZGRlbicsIF9zaGFyZU1vZGFsSGlkZGVuKTtcblx0XHR9LFxuXHRcdF90b2dnbGVTaGFyZU1vZGFsID0gZnVuY3Rpb24oKSB7XG5cblx0XHRcdF9zaGFyZU1vZGFsSGlkZGVuID0gIV9zaGFyZU1vZGFsSGlkZGVuO1xuXHRcdFx0XG5cdFx0XHRcblx0XHRcdGlmKCFfc2hhcmVNb2RhbEhpZGRlbikge1xuXHRcdFx0XHRfdG9nZ2xlU2hhcmVNb2RhbENsYXNzKCk7XG5cdFx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0aWYoIV9zaGFyZU1vZGFsSGlkZGVuKSB7XG5cdFx0XHRcdFx0XHRmcmFtZXdvcmsuYWRkQ2xhc3MoX3NoYXJlTW9kYWwsICdwc3dwX19zaGFyZS1tb2RhbC0tZmFkZS1pbicpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSwgMzApO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0ZnJhbWV3b3JrLnJlbW92ZUNsYXNzKF9zaGFyZU1vZGFsLCAncHN3cF9fc2hhcmUtbW9kYWwtLWZhZGUtaW4nKTtcblx0XHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRpZihfc2hhcmVNb2RhbEhpZGRlbikge1xuXHRcdFx0XHRcdFx0X3RvZ2dsZVNoYXJlTW9kYWxDbGFzcygpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSwgMzAwKTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0aWYoIV9zaGFyZU1vZGFsSGlkZGVuKSB7XG5cdFx0XHRcdF91cGRhdGVTaGFyZVVSTHMoKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9LFxuXG5cdFx0X29wZW5XaW5kb3dQb3B1cCA9IGZ1bmN0aW9uKGUpIHtcblx0XHRcdGUgPSBlIHx8IHdpbmRvdy5ldmVudDtcblx0XHRcdHZhciB0YXJnZXQgPSBlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnQ7XG5cblx0XHRcdHBzd3Auc2hvdXQoJ3NoYXJlTGlua0NsaWNrJywgZSwgdGFyZ2V0KTtcblxuXHRcdFx0aWYoIXRhcmdldC5ocmVmKSB7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblxuXHRcdFx0aWYoIHRhcmdldC5oYXNBdHRyaWJ1dGUoJ2Rvd25sb2FkJykgKSB7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXG5cdFx0XHR3aW5kb3cub3Blbih0YXJnZXQuaHJlZiwgJ3Bzd3Bfc2hhcmUnLCAnc2Nyb2xsYmFycz15ZXMscmVzaXphYmxlPXllcyx0b29sYmFyPW5vLCcrXG5cdFx0XHRcdFx0XHRcdFx0XHRcdCdsb2NhdGlvbj15ZXMsd2lkdGg9NTUwLGhlaWdodD00MjAsdG9wPTEwMCxsZWZ0PScgKyBcblx0XHRcdFx0XHRcdFx0XHRcdFx0KHdpbmRvdy5zY3JlZW4gPyBNYXRoLnJvdW5kKHNjcmVlbi53aWR0aCAvIDIgLSAyNzUpIDogMTAwKSAgKTtcblxuXHRcdFx0aWYoIV9zaGFyZU1vZGFsSGlkZGVuKSB7XG5cdFx0XHRcdF90b2dnbGVTaGFyZU1vZGFsKCk7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9LFxuXHRcdF91cGRhdGVTaGFyZVVSTHMgPSBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBzaGFyZUJ1dHRvbk91dCA9ICcnLFxuXHRcdFx0XHRzaGFyZUJ1dHRvbkRhdGEsXG5cdFx0XHRcdHNoYXJlVVJMLFxuXHRcdFx0XHRpbWFnZV91cmwsXG5cdFx0XHRcdHBhZ2VfdXJsLFxuXHRcdFx0XHRzaGFyZV90ZXh0O1xuXG5cdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgX29wdGlvbnMuc2hhcmVCdXR0b25zLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdHNoYXJlQnV0dG9uRGF0YSA9IF9vcHRpb25zLnNoYXJlQnV0dG9uc1tpXTtcblxuXHRcdFx0XHRpbWFnZV91cmwgPSBfb3B0aW9ucy5nZXRJbWFnZVVSTEZvclNoYXJlKHNoYXJlQnV0dG9uRGF0YSk7XG5cdFx0XHRcdHBhZ2VfdXJsID0gX29wdGlvbnMuZ2V0UGFnZVVSTEZvclNoYXJlKHNoYXJlQnV0dG9uRGF0YSk7XG5cdFx0XHRcdHNoYXJlX3RleHQgPSBfb3B0aW9ucy5nZXRUZXh0Rm9yU2hhcmUoc2hhcmVCdXR0b25EYXRhKTtcblxuXHRcdFx0XHRzaGFyZVVSTCA9IHNoYXJlQnV0dG9uRGF0YS51cmwucmVwbGFjZSgne3t1cmx9fScsIGVuY29kZVVSSUNvbXBvbmVudChwYWdlX3VybCkgKVxuXHRcdFx0XHRcdFx0XHRcdFx0LnJlcGxhY2UoJ3t7aW1hZ2VfdXJsfX0nLCBlbmNvZGVVUklDb21wb25lbnQoaW1hZ2VfdXJsKSApXG5cdFx0XHRcdFx0XHRcdFx0XHQucmVwbGFjZSgne3tyYXdfaW1hZ2VfdXJsfX0nLCBpbWFnZV91cmwgKVxuXHRcdFx0XHRcdFx0XHRcdFx0LnJlcGxhY2UoJ3t7dGV4dH19JywgZW5jb2RlVVJJQ29tcG9uZW50KHNoYXJlX3RleHQpICk7XG5cblx0XHRcdFx0c2hhcmVCdXR0b25PdXQgKz0gJzxhIGhyZWY9XCInICsgc2hhcmVVUkwgKyAnXCIgdGFyZ2V0PVwiX2JsYW5rXCIgJytcblx0XHRcdFx0XHRcdFx0XHRcdCdjbGFzcz1cInBzd3BfX3NoYXJlLS0nICsgc2hhcmVCdXR0b25EYXRhLmlkICsgJ1wiJyArXG5cdFx0XHRcdFx0XHRcdFx0XHQoc2hhcmVCdXR0b25EYXRhLmRvd25sb2FkID8gJ2Rvd25sb2FkJyA6ICcnKSArICc+JyArIFxuXHRcdFx0XHRcdFx0XHRcdFx0c2hhcmVCdXR0b25EYXRhLmxhYmVsICsgJzwvYT4nO1xuXG5cdFx0XHRcdGlmKF9vcHRpb25zLnBhcnNlU2hhcmVCdXR0b25PdXQpIHtcblx0XHRcdFx0XHRzaGFyZUJ1dHRvbk91dCA9IF9vcHRpb25zLnBhcnNlU2hhcmVCdXR0b25PdXQoc2hhcmVCdXR0b25EYXRhLCBzaGFyZUJ1dHRvbk91dCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdF9zaGFyZU1vZGFsLmNoaWxkcmVuWzBdLmlubmVySFRNTCA9IHNoYXJlQnV0dG9uT3V0O1xuXHRcdFx0X3NoYXJlTW9kYWwuY2hpbGRyZW5bMF0ub25jbGljayA9IF9vcGVuV2luZG93UG9wdXA7XG5cblx0XHR9LFxuXHRcdF9oYXNDbG9zZUNsYXNzID0gZnVuY3Rpb24odGFyZ2V0KSB7XG5cdFx0XHRmb3IodmFyICBpID0gMDsgaSA8IF9vcHRpb25zLmNsb3NlRWxDbGFzc2VzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGlmKCBmcmFtZXdvcmsuaGFzQ2xhc3ModGFyZ2V0LCAncHN3cF9fJyArIF9vcHRpb25zLmNsb3NlRWxDbGFzc2VzW2ldKSApIHtcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0X2lkbGVJbnRlcnZhbCxcblx0XHRfaWRsZVRpbWVyLFxuXHRcdF9pZGxlSW5jcmVtZW50ID0gMCxcblx0XHRfb25JZGxlTW91c2VNb3ZlID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRjbGVhclRpbWVvdXQoX2lkbGVUaW1lcik7XG5cdFx0XHRfaWRsZUluY3JlbWVudCA9IDA7XG5cdFx0XHRpZihfaXNJZGxlKSB7XG5cdFx0XHRcdHVpLnNldElkbGUoZmFsc2UpO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0X29uTW91c2VMZWF2ZVdpbmRvdyA9IGZ1bmN0aW9uKGUpIHtcblx0XHRcdGUgPSBlID8gZSA6IHdpbmRvdy5ldmVudDtcblx0XHRcdHZhciBmcm9tID0gZS5yZWxhdGVkVGFyZ2V0IHx8IGUudG9FbGVtZW50O1xuXHRcdFx0aWYgKCFmcm9tIHx8IGZyb20ubm9kZU5hbWUgPT09ICdIVE1MJykge1xuXHRcdFx0XHRjbGVhclRpbWVvdXQoX2lkbGVUaW1lcik7XG5cdFx0XHRcdF9pZGxlVGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdHVpLnNldElkbGUodHJ1ZSk7XG5cdFx0XHRcdH0sIF9vcHRpb25zLnRpbWVUb0lkbGVPdXRzaWRlKTtcblx0XHRcdH1cblx0XHR9LFxuXHRcdF9zZXR1cEZ1bGxzY3JlZW5BUEkgPSBmdW5jdGlvbigpIHtcblx0XHRcdGlmKF9vcHRpb25zLmZ1bGxzY3JlZW5FbCAmJiAhZnJhbWV3b3JrLmZlYXR1cmVzLmlzT2xkQW5kcm9pZCkge1xuXHRcdFx0XHRpZighX2Z1bGxzY3JlbkFQSSkge1xuXHRcdFx0XHRcdF9mdWxsc2NyZW5BUEkgPSB1aS5nZXRGdWxsc2NyZWVuQVBJKCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYoX2Z1bGxzY3JlbkFQSSkge1xuXHRcdFx0XHRcdGZyYW1ld29yay5iaW5kKGRvY3VtZW50LCBfZnVsbHNjcmVuQVBJLmV2ZW50SywgdWkudXBkYXRlRnVsbHNjcmVlbik7XG5cdFx0XHRcdFx0dWkudXBkYXRlRnVsbHNjcmVlbigpO1xuXHRcdFx0XHRcdGZyYW1ld29yay5hZGRDbGFzcyhwc3dwLnRlbXBsYXRlLCAncHN3cC0tc3VwcG9ydHMtZnMnKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRmcmFtZXdvcmsucmVtb3ZlQ2xhc3MocHN3cC50ZW1wbGF0ZSwgJ3Bzd3AtLXN1cHBvcnRzLWZzJyk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9LFxuXHRcdF9zZXR1cExvYWRpbmdJbmRpY2F0b3IgPSBmdW5jdGlvbigpIHtcblx0XHRcdC8vIFNldHVwIGxvYWRpbmcgaW5kaWNhdG9yXG5cdFx0XHRpZihfb3B0aW9ucy5wcmVsb2FkZXJFbCkge1xuXHRcdFx0XG5cdFx0XHRcdF90b2dnbGVMb2FkaW5nSW5kaWNhdG9yKHRydWUpO1xuXG5cdFx0XHRcdF9saXN0ZW4oJ2JlZm9yZUNoYW5nZScsIGZ1bmN0aW9uKCkge1xuXG5cdFx0XHRcdFx0Y2xlYXJUaW1lb3V0KF9sb2FkaW5nSW5kaWNhdG9yVGltZW91dCk7XG5cblx0XHRcdFx0XHQvLyBkaXNwbGF5IGxvYWRpbmcgaW5kaWNhdG9yIHdpdGggZGVsYXlcblx0XHRcdFx0XHRfbG9hZGluZ0luZGljYXRvclRpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXG5cdFx0XHRcdFx0XHRpZihwc3dwLmN1cnJJdGVtICYmIHBzd3AuY3Vyckl0ZW0ubG9hZGluZykge1xuXG5cdFx0XHRcdFx0XHRcdGlmKCAhcHN3cC5hbGxvd1Byb2dyZXNzaXZlSW1nKCkgfHwgKHBzd3AuY3Vyckl0ZW0uaW1nICYmICFwc3dwLmN1cnJJdGVtLmltZy5uYXR1cmFsV2lkdGgpICApIHtcblx0XHRcdFx0XHRcdFx0XHQvLyBzaG93IHByZWxvYWRlciBpZiBwcm9ncmVzc2l2ZSBsb2FkaW5nIGlzIG5vdCBlbmFibGVkLCBcblx0XHRcdFx0XHRcdFx0XHQvLyBvciBpbWFnZSB3aWR0aCBpcyBub3QgZGVmaW5lZCB5ZXQgKGJlY2F1c2Ugb2Ygc2xvdyBjb25uZWN0aW9uKVxuXHRcdFx0XHRcdFx0XHRcdF90b2dnbGVMb2FkaW5nSW5kaWNhdG9yKGZhbHNlKTsgXG5cdFx0XHRcdFx0XHRcdFx0Ly8gaXRlbXMtY29udHJvbGxlci5qcyBmdW5jdGlvbiBhbGxvd1Byb2dyZXNzaXZlSW1nXG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRfdG9nZ2xlTG9hZGluZ0luZGljYXRvcih0cnVlKTsgLy8gaGlkZSBwcmVsb2FkZXJcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdH0sIF9vcHRpb25zLmxvYWRpbmdJbmRpY2F0b3JEZWxheSk7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRfbGlzdGVuKCdpbWFnZUxvYWRDb21wbGV0ZScsIGZ1bmN0aW9uKGluZGV4LCBpdGVtKSB7XG5cdFx0XHRcdFx0aWYocHN3cC5jdXJySXRlbSA9PT0gaXRlbSkge1xuXHRcdFx0XHRcdFx0X3RvZ2dsZUxvYWRpbmdJbmRpY2F0b3IodHJ1ZSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0X3RvZ2dsZUxvYWRpbmdJbmRpY2F0b3IgPSBmdW5jdGlvbihoaWRlKSB7XG5cdFx0XHRpZiggX2xvYWRpbmdJbmRpY2F0b3JIaWRkZW4gIT09IGhpZGUgKSB7XG5cdFx0XHRcdF90b2dnbGVQc3dwQ2xhc3MoX2xvYWRpbmdJbmRpY2F0b3IsICdwcmVsb2FkZXItLWFjdGl2ZScsICFoaWRlKTtcblx0XHRcdFx0X2xvYWRpbmdJbmRpY2F0b3JIaWRkZW4gPSBoaWRlO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0X2FwcGx5TmF2QmFyR2FwcyA9IGZ1bmN0aW9uKGl0ZW0pIHtcblx0XHRcdHZhciBnYXAgPSBpdGVtLnZHYXA7XG5cblx0XHRcdGlmKCBfZml0Q29udHJvbHNJblZpZXdwb3J0KCkgKSB7XG5cdFx0XHRcdFxuXHRcdFx0XHR2YXIgYmFycyA9IF9vcHRpb25zLmJhcnNTaXplOyBcblx0XHRcdFx0aWYoX29wdGlvbnMuY2FwdGlvbkVsICYmIGJhcnMuYm90dG9tID09PSAnYXV0bycpIHtcblx0XHRcdFx0XHRpZighX2Zha2VDYXB0aW9uQ29udGFpbmVyKSB7XG5cdFx0XHRcdFx0XHRfZmFrZUNhcHRpb25Db250YWluZXIgPSBmcmFtZXdvcmsuY3JlYXRlRWwoJ3Bzd3BfX2NhcHRpb24gcHN3cF9fY2FwdGlvbi0tZmFrZScpO1xuXHRcdFx0XHRcdFx0X2Zha2VDYXB0aW9uQ29udGFpbmVyLmFwcGVuZENoaWxkKCBmcmFtZXdvcmsuY3JlYXRlRWwoJ3Bzd3BfX2NhcHRpb25fX2NlbnRlcicpICk7XG5cdFx0XHRcdFx0XHRfY29udHJvbHMuaW5zZXJ0QmVmb3JlKF9mYWtlQ2FwdGlvbkNvbnRhaW5lciwgX2NhcHRpb25Db250YWluZXIpO1xuXHRcdFx0XHRcdFx0ZnJhbWV3b3JrLmFkZENsYXNzKF9jb250cm9scywgJ3Bzd3BfX3VpLS1maXQnKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYoIF9vcHRpb25zLmFkZENhcHRpb25IVE1MRm4oaXRlbSwgX2Zha2VDYXB0aW9uQ29udGFpbmVyLCB0cnVlKSApIHtcblxuXHRcdFx0XHRcdFx0dmFyIGNhcHRpb25TaXplID0gX2Zha2VDYXB0aW9uQ29udGFpbmVyLmNsaWVudEhlaWdodDtcblx0XHRcdFx0XHRcdGdhcC5ib3R0b20gPSBwYXJzZUludChjYXB0aW9uU2l6ZSwxMCkgfHwgNDQ7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGdhcC5ib3R0b20gPSBiYXJzLnRvcDsgLy8gaWYgbm8gY2FwdGlvbiwgc2V0IHNpemUgb2YgYm90dG9tIGdhcCB0byBzaXplIG9mIHRvcFxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRnYXAuYm90dG9tID0gYmFycy5ib3R0b20gPT09ICdhdXRvJyA/IDAgOiBiYXJzLmJvdHRvbTtcblx0XHRcdFx0fVxuXHRcdFx0XHRcblx0XHRcdFx0Ly8gaGVpZ2h0IG9mIHRvcCBiYXIgaXMgc3RhdGljLCBubyBuZWVkIHRvIGNhbGN1bGF0ZSBpdFxuXHRcdFx0XHRnYXAudG9wID0gYmFycy50b3A7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRnYXAudG9wID0gZ2FwLmJvdHRvbSA9IDA7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRfc2V0dXBJZGxlID0gZnVuY3Rpb24oKSB7XG5cdFx0XHQvLyBIaWRlIGNvbnRyb2xzIHdoZW4gbW91c2UgaXMgdXNlZFxuXHRcdFx0aWYoX29wdGlvbnMudGltZVRvSWRsZSkge1xuXHRcdFx0XHRfbGlzdGVuKCdtb3VzZVVzZWQnLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcblx0XHRcdFx0XHRmcmFtZXdvcmsuYmluZChkb2N1bWVudCwgJ21vdXNlbW92ZScsIF9vbklkbGVNb3VzZU1vdmUpO1xuXHRcdFx0XHRcdGZyYW1ld29yay5iaW5kKGRvY3VtZW50LCAnbW91c2VvdXQnLCBfb25Nb3VzZUxlYXZlV2luZG93KTtcblxuXHRcdFx0XHRcdF9pZGxlSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdF9pZGxlSW5jcmVtZW50Kys7XG5cdFx0XHRcdFx0XHRpZihfaWRsZUluY3JlbWVudCA9PT0gMikge1xuXHRcdFx0XHRcdFx0XHR1aS5zZXRJZGxlKHRydWUpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0sIF9vcHRpb25zLnRpbWVUb0lkbGUgLyAyKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRfc2V0dXBIaWRpbmdDb250cm9sc0R1cmluZ0dlc3R1cmVzID0gZnVuY3Rpb24oKSB7XG5cblx0XHRcdC8vIEhpZGUgY29udHJvbHMgb24gdmVydGljYWwgZHJhZ1xuXHRcdFx0X2xpc3Rlbignb25WZXJ0aWNhbERyYWcnLCBmdW5jdGlvbihub3cpIHtcblx0XHRcdFx0aWYoX2NvbnRyb2xzVmlzaWJsZSAmJiBub3cgPCAwLjk1KSB7XG5cdFx0XHRcdFx0dWkuaGlkZUNvbnRyb2xzKCk7XG5cdFx0XHRcdH0gZWxzZSBpZighX2NvbnRyb2xzVmlzaWJsZSAmJiBub3cgPj0gMC45NSkge1xuXHRcdFx0XHRcdHVpLnNob3dDb250cm9scygpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdFx0Ly8gSGlkZSBjb250cm9scyB3aGVuIHBpbmNoaW5nIHRvIGNsb3NlXG5cdFx0XHR2YXIgcGluY2hDb250cm9sc0hpZGRlbjtcblx0XHRcdF9saXN0ZW4oJ29uUGluY2hDbG9zZScgLCBmdW5jdGlvbihub3cpIHtcblx0XHRcdFx0aWYoX2NvbnRyb2xzVmlzaWJsZSAmJiBub3cgPCAwLjkpIHtcblx0XHRcdFx0XHR1aS5oaWRlQ29udHJvbHMoKTtcblx0XHRcdFx0XHRwaW5jaENvbnRyb2xzSGlkZGVuID0gdHJ1ZTtcblx0XHRcdFx0fSBlbHNlIGlmKHBpbmNoQ29udHJvbHNIaWRkZW4gJiYgIV9jb250cm9sc1Zpc2libGUgJiYgbm93ID4gMC45KSB7XG5cdFx0XHRcdFx0dWkuc2hvd0NvbnRyb2xzKCk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXG5cdFx0XHRfbGlzdGVuKCd6b29tR2VzdHVyZUVuZGVkJywgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHBpbmNoQ29udHJvbHNIaWRkZW4gPSBmYWxzZTtcblx0XHRcdFx0aWYocGluY2hDb250cm9sc0hpZGRlbiAmJiAhX2NvbnRyb2xzVmlzaWJsZSkge1xuXHRcdFx0XHRcdHVpLnNob3dDb250cm9scygpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdH07XG5cblxuXG5cdHZhciBfdWlFbGVtZW50cyA9IFtcblx0XHR7IFxuXHRcdFx0bmFtZTogJ2NhcHRpb24nLCBcblx0XHRcdG9wdGlvbjogJ2NhcHRpb25FbCcsXG5cdFx0XHRvbkluaXQ6IGZ1bmN0aW9uKGVsKSB7ICBcblx0XHRcdFx0X2NhcHRpb25Db250YWluZXIgPSBlbDsgXG5cdFx0XHR9IFxuXHRcdH0sXG5cdFx0eyBcblx0XHRcdG5hbWU6ICdzaGFyZS1tb2RhbCcsIFxuXHRcdFx0b3B0aW9uOiAnc2hhcmVFbCcsXG5cdFx0XHRvbkluaXQ6IGZ1bmN0aW9uKGVsKSB7ICBcblx0XHRcdFx0X3NoYXJlTW9kYWwgPSBlbDtcblx0XHRcdH0sXG5cdFx0XHRvblRhcDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdF90b2dnbGVTaGFyZU1vZGFsKCk7XG5cdFx0XHR9IFxuXHRcdH0sXG5cdFx0eyBcblx0XHRcdG5hbWU6ICdidXR0b24tLXNoYXJlJywgXG5cdFx0XHRvcHRpb246ICdzaGFyZUVsJyxcblx0XHRcdG9uSW5pdDogZnVuY3Rpb24oZWwpIHsgXG5cdFx0XHRcdF9zaGFyZUJ1dHRvbiA9IGVsO1xuXHRcdFx0fSxcblx0XHRcdG9uVGFwOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0X3RvZ2dsZVNoYXJlTW9kYWwoKTtcblx0XHRcdH0gXG5cdFx0fSxcblx0XHR7IFxuXHRcdFx0bmFtZTogJ2J1dHRvbi0tem9vbScsIFxuXHRcdFx0b3B0aW9uOiAnem9vbUVsJyxcblx0XHRcdG9uVGFwOiBwc3dwLnRvZ2dsZURlc2t0b3Bab29tXG5cdFx0fSxcblx0XHR7IFxuXHRcdFx0bmFtZTogJ2NvdW50ZXInLCBcblx0XHRcdG9wdGlvbjogJ2NvdW50ZXJFbCcsXG5cdFx0XHRvbkluaXQ6IGZ1bmN0aW9uKGVsKSB7ICBcblx0XHRcdFx0X2luZGV4SW5kaWNhdG9yID0gZWw7XG5cdFx0XHR9IFxuXHRcdH0sXG5cdFx0eyBcblx0XHRcdG5hbWU6ICdidXR0b24tLWNsb3NlJywgXG5cdFx0XHRvcHRpb246ICdjbG9zZUVsJyxcblx0XHRcdG9uVGFwOiBwc3dwLmNsb3NlXG5cdFx0fSxcblx0XHR7IFxuXHRcdFx0bmFtZTogJ2J1dHRvbi0tYXJyb3ctLWxlZnQnLCBcblx0XHRcdG9wdGlvbjogJ2Fycm93RWwnLFxuXHRcdFx0b25UYXA6IHBzd3AucHJldlxuXHRcdH0sXG5cdFx0eyBcblx0XHRcdG5hbWU6ICdidXR0b24tLWFycm93LS1yaWdodCcsIFxuXHRcdFx0b3B0aW9uOiAnYXJyb3dFbCcsXG5cdFx0XHRvblRhcDogcHN3cC5uZXh0XG5cdFx0fSxcblx0XHR7IFxuXHRcdFx0bmFtZTogJ2J1dHRvbi0tZnMnLCBcblx0XHRcdG9wdGlvbjogJ2Z1bGxzY3JlZW5FbCcsXG5cdFx0XHRvblRhcDogZnVuY3Rpb24oKSB7ICBcblx0XHRcdFx0aWYoX2Z1bGxzY3JlbkFQSS5pc0Z1bGxzY3JlZW4oKSkge1xuXHRcdFx0XHRcdF9mdWxsc2NyZW5BUEkuZXhpdCgpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdF9mdWxsc2NyZW5BUEkuZW50ZXIoKTtcblx0XHRcdFx0fVxuXHRcdFx0fSBcblx0XHR9LFxuXHRcdHsgXG5cdFx0XHRuYW1lOiAncHJlbG9hZGVyJywgXG5cdFx0XHRvcHRpb246ICdwcmVsb2FkZXJFbCcsXG5cdFx0XHRvbkluaXQ6IGZ1bmN0aW9uKGVsKSB7ICBcblx0XHRcdFx0X2xvYWRpbmdJbmRpY2F0b3IgPSBlbDtcblx0XHRcdH0gXG5cdFx0fVxuXG5cdF07XG5cblx0dmFyIF9zZXR1cFVJRWxlbWVudHMgPSBmdW5jdGlvbigpIHtcblx0XHR2YXIgaXRlbSxcblx0XHRcdGNsYXNzQXR0cixcblx0XHRcdHVpRWxlbWVudDtcblxuXHRcdHZhciBsb29wVGhyb3VnaENoaWxkRWxlbWVudHMgPSBmdW5jdGlvbihzQ2hpbGRyZW4pIHtcblx0XHRcdGlmKCFzQ2hpbGRyZW4pIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgbCA9IHNDaGlsZHJlbi5sZW5ndGg7XG5cdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgbDsgaSsrKSB7XG5cdFx0XHRcdGl0ZW0gPSBzQ2hpbGRyZW5baV07XG5cdFx0XHRcdGNsYXNzQXR0ciA9IGl0ZW0uY2xhc3NOYW1lO1xuXG5cdFx0XHRcdGZvcih2YXIgYSA9IDA7IGEgPCBfdWlFbGVtZW50cy5sZW5ndGg7IGErKykge1xuXHRcdFx0XHRcdHVpRWxlbWVudCA9IF91aUVsZW1lbnRzW2FdO1xuXG5cdFx0XHRcdFx0aWYoY2xhc3NBdHRyLmluZGV4T2YoJ3Bzd3BfXycgKyB1aUVsZW1lbnQubmFtZSkgPiAtMSAgKSB7XG5cblx0XHRcdFx0XHRcdGlmKCBfb3B0aW9uc1t1aUVsZW1lbnQub3B0aW9uXSApIHsgLy8gaWYgZWxlbWVudCBpcyBub3QgZGlzYWJsZWQgZnJvbSBvcHRpb25zXG5cdFx0XHRcdFx0XHRcdFxuXHRcdFx0XHRcdFx0XHRmcmFtZXdvcmsucmVtb3ZlQ2xhc3MoaXRlbSwgJ3Bzd3BfX2VsZW1lbnQtLWRpc2FibGVkJyk7XG5cdFx0XHRcdFx0XHRcdGlmKHVpRWxlbWVudC5vbkluaXQpIHtcblx0XHRcdFx0XHRcdFx0XHR1aUVsZW1lbnQub25Jbml0KGl0ZW0pO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFxuXHRcdFx0XHRcdFx0XHQvL2l0ZW0uc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRmcmFtZXdvcmsuYWRkQ2xhc3MoaXRlbSwgJ3Bzd3BfX2VsZW1lbnQtLWRpc2FibGVkJyk7XG5cdFx0XHRcdFx0XHRcdC8vaXRlbS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH07XG5cdFx0bG9vcFRocm91Z2hDaGlsZEVsZW1lbnRzKF9jb250cm9scy5jaGlsZHJlbik7XG5cblx0XHR2YXIgdG9wQmFyID0gIGZyYW1ld29yay5nZXRDaGlsZEJ5Q2xhc3MoX2NvbnRyb2xzLCAncHN3cF9fdG9wLWJhcicpO1xuXHRcdGlmKHRvcEJhcikge1xuXHRcdFx0bG9vcFRocm91Z2hDaGlsZEVsZW1lbnRzKCB0b3BCYXIuY2hpbGRyZW4gKTtcblx0XHR9XG5cdH07XG5cblxuXHRcblxuXHR1aS5pbml0ID0gZnVuY3Rpb24oKSB7XG5cblx0XHQvLyBleHRlbmQgb3B0aW9uc1xuXHRcdGZyYW1ld29yay5leHRlbmQocHN3cC5vcHRpb25zLCBfZGVmYXVsdFVJT3B0aW9ucywgdHJ1ZSk7XG5cblx0XHQvLyBjcmVhdGUgbG9jYWwgbGluayBmb3IgZmFzdCBhY2Nlc3Ncblx0XHRfb3B0aW9ucyA9IHBzd3Aub3B0aW9ucztcblxuXHRcdC8vIGZpbmQgcHN3cF9fdWkgZWxlbWVudFxuXHRcdF9jb250cm9scyA9IGZyYW1ld29yay5nZXRDaGlsZEJ5Q2xhc3MocHN3cC5zY3JvbGxXcmFwLCAncHN3cF9fdWknKTtcblxuXHRcdC8vIGNyZWF0ZSBsb2NhbCBsaW5rXG5cdFx0X2xpc3RlbiA9IHBzd3AubGlzdGVuO1xuXG5cblx0XHRfc2V0dXBIaWRpbmdDb250cm9sc0R1cmluZ0dlc3R1cmVzKCk7XG5cblx0XHQvLyB1cGRhdGUgY29udHJvbHMgd2hlbiBzbGlkZXMgY2hhbmdlXG5cdFx0X2xpc3RlbignYmVmb3JlQ2hhbmdlJywgdWkudXBkYXRlKTtcblxuXHRcdC8vIHRvZ2dsZSB6b29tIG9uIGRvdWJsZS10YXBcblx0XHRfbGlzdGVuKCdkb3VibGVUYXAnLCBmdW5jdGlvbihwb2ludCkge1xuXHRcdFx0dmFyIGluaXRpYWxab29tTGV2ZWwgPSBwc3dwLmN1cnJJdGVtLmluaXRpYWxab29tTGV2ZWw7XG5cdFx0XHRpZihwc3dwLmdldFpvb21MZXZlbCgpICE9PSBpbml0aWFsWm9vbUxldmVsKSB7XG5cdFx0XHRcdHBzd3Auem9vbVRvKGluaXRpYWxab29tTGV2ZWwsIHBvaW50LCAzMzMpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cHN3cC56b29tVG8oX29wdGlvbnMuZ2V0RG91YmxlVGFwWm9vbShmYWxzZSwgcHN3cC5jdXJySXRlbSksIHBvaW50LCAzMzMpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0Ly8gQWxsb3cgdGV4dCBzZWxlY3Rpb24gaW4gY2FwdGlvblxuXHRcdF9saXN0ZW4oJ3ByZXZlbnREcmFnRXZlbnQnLCBmdW5jdGlvbihlLCBpc0Rvd24sIHByZXZlbnRPYmopIHtcblx0XHRcdHZhciB0ID0gZS50YXJnZXQgfHwgZS5zcmNFbGVtZW50O1xuXHRcdFx0aWYoXG5cdFx0XHRcdHQgJiYgXG5cdFx0XHRcdHQuZ2V0QXR0cmlidXRlKCdjbGFzcycpICYmIGUudHlwZS5pbmRleE9mKCdtb3VzZScpID4gLTEgJiYgXG5cdFx0XHRcdCggdC5nZXRBdHRyaWJ1dGUoJ2NsYXNzJykuaW5kZXhPZignX19jYXB0aW9uJykgPiAwIHx8ICgvKFNNQUxMfFNUUk9OR3xFTSkvaSkudGVzdCh0LnRhZ05hbWUpICkgXG5cdFx0XHQpIHtcblx0XHRcdFx0cHJldmVudE9iai5wcmV2ZW50ID0gZmFsc2U7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHQvLyBiaW5kIGV2ZW50cyBmb3IgVUlcblx0XHRfbGlzdGVuKCdiaW5kRXZlbnRzJywgZnVuY3Rpb24oKSB7XG5cdFx0XHRmcmFtZXdvcmsuYmluZChfY29udHJvbHMsICdwc3dwVGFwIGNsaWNrJywgX29uQ29udHJvbHNUYXApO1xuXHRcdFx0ZnJhbWV3b3JrLmJpbmQocHN3cC5zY3JvbGxXcmFwLCAncHN3cFRhcCcsIHVpLm9uR2xvYmFsVGFwKTtcblxuXHRcdFx0aWYoIXBzd3AubGlrZWx5VG91Y2hEZXZpY2UpIHtcblx0XHRcdFx0ZnJhbWV3b3JrLmJpbmQocHN3cC5zY3JvbGxXcmFwLCAnbW91c2VvdmVyJywgdWkub25Nb3VzZU92ZXIpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0Ly8gdW5iaW5kIGV2ZW50cyBmb3IgVUlcblx0XHRfbGlzdGVuKCd1bmJpbmRFdmVudHMnLCBmdW5jdGlvbigpIHtcblx0XHRcdGlmKCFfc2hhcmVNb2RhbEhpZGRlbikge1xuXHRcdFx0XHRfdG9nZ2xlU2hhcmVNb2RhbCgpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZihfaWRsZUludGVydmFsKSB7XG5cdFx0XHRcdGNsZWFySW50ZXJ2YWwoX2lkbGVJbnRlcnZhbCk7XG5cdFx0XHR9XG5cdFx0XHRmcmFtZXdvcmsudW5iaW5kKGRvY3VtZW50LCAnbW91c2VvdXQnLCBfb25Nb3VzZUxlYXZlV2luZG93KTtcblx0XHRcdGZyYW1ld29yay51bmJpbmQoZG9jdW1lbnQsICdtb3VzZW1vdmUnLCBfb25JZGxlTW91c2VNb3ZlKTtcblx0XHRcdGZyYW1ld29yay51bmJpbmQoX2NvbnRyb2xzLCAncHN3cFRhcCBjbGljaycsIF9vbkNvbnRyb2xzVGFwKTtcblx0XHRcdGZyYW1ld29yay51bmJpbmQocHN3cC5zY3JvbGxXcmFwLCAncHN3cFRhcCcsIHVpLm9uR2xvYmFsVGFwKTtcblx0XHRcdGZyYW1ld29yay51bmJpbmQocHN3cC5zY3JvbGxXcmFwLCAnbW91c2VvdmVyJywgdWkub25Nb3VzZU92ZXIpO1xuXG5cdFx0XHRpZihfZnVsbHNjcmVuQVBJKSB7XG5cdFx0XHRcdGZyYW1ld29yay51bmJpbmQoZG9jdW1lbnQsIF9mdWxsc2NyZW5BUEkuZXZlbnRLLCB1aS51cGRhdGVGdWxsc2NyZWVuKTtcblx0XHRcdFx0aWYoX2Z1bGxzY3JlbkFQSS5pc0Z1bGxzY3JlZW4oKSkge1xuXHRcdFx0XHRcdF9vcHRpb25zLmhpZGVBbmltYXRpb25EdXJhdGlvbiA9IDA7XG5cdFx0XHRcdFx0X2Z1bGxzY3JlbkFQSS5leGl0KCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0X2Z1bGxzY3JlbkFQSSA9IG51bGw7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblxuXHRcdC8vIGNsZWFuIHVwIHRoaW5ncyB3aGVuIGdhbGxlcnkgaXMgZGVzdHJveWVkXG5cdFx0X2xpc3RlbignZGVzdHJveScsIGZ1bmN0aW9uKCkge1xuXHRcdFx0aWYoX29wdGlvbnMuY2FwdGlvbkVsKSB7XG5cdFx0XHRcdGlmKF9mYWtlQ2FwdGlvbkNvbnRhaW5lcikge1xuXHRcdFx0XHRcdF9jb250cm9scy5yZW1vdmVDaGlsZChfZmFrZUNhcHRpb25Db250YWluZXIpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGZyYW1ld29yay5yZW1vdmVDbGFzcyhfY2FwdGlvbkNvbnRhaW5lciwgJ3Bzd3BfX2NhcHRpb24tLWVtcHR5Jyk7XG5cdFx0XHR9XG5cblx0XHRcdGlmKF9zaGFyZU1vZGFsKSB7XG5cdFx0XHRcdF9zaGFyZU1vZGFsLmNoaWxkcmVuWzBdLm9uY2xpY2sgPSBudWxsO1xuXHRcdFx0fVxuXHRcdFx0ZnJhbWV3b3JrLnJlbW92ZUNsYXNzKF9jb250cm9scywgJ3Bzd3BfX3VpLS1vdmVyLWNsb3NlJyk7XG5cdFx0XHRmcmFtZXdvcmsuYWRkQ2xhc3MoIF9jb250cm9scywgJ3Bzd3BfX3VpLS1oaWRkZW4nKTtcblx0XHRcdHVpLnNldElkbGUoZmFsc2UpO1xuXHRcdH0pO1xuXHRcdFxuXG5cdFx0aWYoIV9vcHRpb25zLnNob3dBbmltYXRpb25EdXJhdGlvbikge1xuXHRcdFx0ZnJhbWV3b3JrLnJlbW92ZUNsYXNzKCBfY29udHJvbHMsICdwc3dwX191aS0taGlkZGVuJyk7XG5cdFx0fVxuXHRcdF9saXN0ZW4oJ2luaXRpYWxab29tSW4nLCBmdW5jdGlvbigpIHtcblx0XHRcdGlmKF9vcHRpb25zLnNob3dBbmltYXRpb25EdXJhdGlvbikge1xuXHRcdFx0XHRmcmFtZXdvcmsucmVtb3ZlQ2xhc3MoIF9jb250cm9scywgJ3Bzd3BfX3VpLS1oaWRkZW4nKTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHRfbGlzdGVuKCdpbml0aWFsWm9vbU91dCcsIGZ1bmN0aW9uKCkge1xuXHRcdFx0ZnJhbWV3b3JrLmFkZENsYXNzKCBfY29udHJvbHMsICdwc3dwX191aS0taGlkZGVuJyk7XG5cdFx0fSk7XG5cblx0XHRfbGlzdGVuKCdwYXJzZVZlcnRpY2FsTWFyZ2luJywgX2FwcGx5TmF2QmFyR2Fwcyk7XG5cdFx0XG5cdFx0X3NldHVwVUlFbGVtZW50cygpO1xuXG5cdFx0aWYoX29wdGlvbnMuc2hhcmVFbCAmJiBfc2hhcmVCdXR0b24gJiYgX3NoYXJlTW9kYWwpIHtcblx0XHRcdF9zaGFyZU1vZGFsSGlkZGVuID0gdHJ1ZTtcblx0XHR9XG5cblx0XHRfY291bnROdW1JdGVtcygpO1xuXG5cdFx0X3NldHVwSWRsZSgpO1xuXG5cdFx0X3NldHVwRnVsbHNjcmVlbkFQSSgpO1xuXG5cdFx0X3NldHVwTG9hZGluZ0luZGljYXRvcigpO1xuXHR9O1xuXG5cdHVpLnNldElkbGUgPSBmdW5jdGlvbihpc0lkbGUpIHtcblx0XHRfaXNJZGxlID0gaXNJZGxlO1xuXHRcdF90b2dnbGVQc3dwQ2xhc3MoX2NvbnRyb2xzLCAndWktLWlkbGUnLCBpc0lkbGUpO1xuXHR9O1xuXG5cdHVpLnVwZGF0ZSA9IGZ1bmN0aW9uKCkge1xuXHRcdC8vIERvbid0IHVwZGF0ZSBVSSBpZiBpdCdzIGhpZGRlblxuXHRcdGlmKF9jb250cm9sc1Zpc2libGUgJiYgcHN3cC5jdXJySXRlbSkge1xuXHRcdFx0XG5cdFx0XHR1aS51cGRhdGVJbmRleEluZGljYXRvcigpO1xuXG5cdFx0XHRpZihfb3B0aW9ucy5jYXB0aW9uRWwpIHtcblx0XHRcdFx0X29wdGlvbnMuYWRkQ2FwdGlvbkhUTUxGbihwc3dwLmN1cnJJdGVtLCBfY2FwdGlvbkNvbnRhaW5lcik7XG5cblx0XHRcdFx0X3RvZ2dsZVBzd3BDbGFzcyhfY2FwdGlvbkNvbnRhaW5lciwgJ2NhcHRpb24tLWVtcHR5JywgIXBzd3AuY3Vyckl0ZW0udGl0bGUpO1xuXHRcdFx0fVxuXG5cdFx0XHRfb3ZlcmxheVVJVXBkYXRlZCA9IHRydWU7XG5cblx0XHR9IGVsc2Uge1xuXHRcdFx0X292ZXJsYXlVSVVwZGF0ZWQgPSBmYWxzZTtcblx0XHR9XG5cblx0XHRpZighX3NoYXJlTW9kYWxIaWRkZW4pIHtcblx0XHRcdF90b2dnbGVTaGFyZU1vZGFsKCk7XG5cdFx0fVxuXG5cdFx0X2NvdW50TnVtSXRlbXMoKTtcblx0fTtcblxuXHR1aS51cGRhdGVGdWxsc2NyZWVuID0gZnVuY3Rpb24oZSkge1xuXG5cdFx0aWYoZSkge1xuXHRcdFx0Ly8gc29tZSBicm93c2VycyBjaGFuZ2Ugd2luZG93IHNjcm9sbCBwb3NpdGlvbiBkdXJpbmcgdGhlIGZ1bGxzY3JlZW5cblx0XHRcdC8vIHNvIFBob3RvU3dpcGUgdXBkYXRlcyBpdCBqdXN0IGluIGNhc2Vcblx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHBzd3Auc2V0U2Nyb2xsT2Zmc2V0KCAwLCBmcmFtZXdvcmsuZ2V0U2Nyb2xsWSgpICk7XG5cdFx0XHR9LCA1MCk7XG5cdFx0fVxuXHRcdFxuXHRcdC8vIHRvb2dsZSBwc3dwLS1mcyBjbGFzcyBvbiByb290IGVsZW1lbnRcblx0XHRmcmFtZXdvcmtbIChfZnVsbHNjcmVuQVBJLmlzRnVsbHNjcmVlbigpID8gJ2FkZCcgOiAncmVtb3ZlJykgKyAnQ2xhc3MnIF0ocHN3cC50ZW1wbGF0ZSwgJ3Bzd3AtLWZzJyk7XG5cdH07XG5cblx0dWkudXBkYXRlSW5kZXhJbmRpY2F0b3IgPSBmdW5jdGlvbigpIHtcblx0XHRpZihfb3B0aW9ucy5jb3VudGVyRWwpIHtcblx0XHRcdF9pbmRleEluZGljYXRvci5pbm5lckhUTUwgPSAocHN3cC5nZXRDdXJyZW50SW5kZXgoKSsxKSArIFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRfb3B0aW9ucy5pbmRleEluZGljYXRvclNlcCArIFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRfb3B0aW9ucy5nZXROdW1JdGVtc0ZuKCk7XG5cdFx0fVxuXHR9O1xuXHRcblx0dWkub25HbG9iYWxUYXAgPSBmdW5jdGlvbihlKSB7XG5cdFx0ZSA9IGUgfHwgd2luZG93LmV2ZW50O1xuXHRcdHZhciB0YXJnZXQgPSBlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnQ7XG5cblx0XHRpZihfYmxvY2tDb250cm9sc1RhcCkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGlmKGUuZGV0YWlsICYmIGUuZGV0YWlsLnBvaW50ZXJUeXBlID09PSAnbW91c2UnKSB7XG5cblx0XHRcdC8vIGNsb3NlIGdhbGxlcnkgaWYgY2xpY2tlZCBvdXRzaWRlIG9mIHRoZSBpbWFnZVxuXHRcdFx0aWYoX2hhc0Nsb3NlQ2xhc3ModGFyZ2V0KSkge1xuXHRcdFx0XHRwc3dwLmNsb3NlKCk7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0aWYoZnJhbWV3b3JrLmhhc0NsYXNzKHRhcmdldCwgJ3Bzd3BfX2ltZycpKSB7XG5cdFx0XHRcdGlmKHBzd3AuZ2V0Wm9vbUxldmVsKCkgPT09IDEgJiYgcHN3cC5nZXRab29tTGV2ZWwoKSA8PSBwc3dwLmN1cnJJdGVtLmZpdFJhdGlvKSB7XG5cdFx0XHRcdFx0aWYoX29wdGlvbnMuY2xpY2tUb0Nsb3NlTm9uWm9vbWFibGUpIHtcblx0XHRcdFx0XHRcdHBzd3AuY2xvc2UoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cHN3cC50b2dnbGVEZXNrdG9wWm9vbShlLmRldGFpbC5yZWxlYXNlUG9pbnQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRcblx0XHR9IGVsc2Uge1xuXG5cdFx0XHQvLyB0YXAgYW55d2hlcmUgKGV4Y2VwdCBidXR0b25zKSB0byB0b2dnbGUgdmlzaWJpbGl0eSBvZiBjb250cm9sc1xuXHRcdFx0aWYoX29wdGlvbnMudGFwVG9Ub2dnbGVDb250cm9scykge1xuXHRcdFx0XHRpZihfY29udHJvbHNWaXNpYmxlKSB7XG5cdFx0XHRcdFx0dWkuaGlkZUNvbnRyb2xzKCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dWkuc2hvd0NvbnRyb2xzKCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0Ly8gdGFwIHRvIGNsb3NlIGdhbGxlcnlcblx0XHRcdGlmKF9vcHRpb25zLnRhcFRvQ2xvc2UgJiYgKGZyYW1ld29yay5oYXNDbGFzcyh0YXJnZXQsICdwc3dwX19pbWcnKSB8fCBfaGFzQ2xvc2VDbGFzcyh0YXJnZXQpKSApIHtcblx0XHRcdFx0cHN3cC5jbG9zZSgpO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRcblx0XHR9XG5cdH07XG5cdHVpLm9uTW91c2VPdmVyID0gZnVuY3Rpb24oZSkge1xuXHRcdGUgPSBlIHx8IHdpbmRvdy5ldmVudDtcblx0XHR2YXIgdGFyZ2V0ID0gZS50YXJnZXQgfHwgZS5zcmNFbGVtZW50O1xuXG5cdFx0Ly8gYWRkIGNsYXNzIHdoZW4gbW91c2UgaXMgb3ZlciBhbiBlbGVtZW50IHRoYXQgc2hvdWxkIGNsb3NlIHRoZSBnYWxsZXJ5XG5cdFx0X3RvZ2dsZVBzd3BDbGFzcyhfY29udHJvbHMsICd1aS0tb3Zlci1jbG9zZScsIF9oYXNDbG9zZUNsYXNzKHRhcmdldCkpO1xuXHR9O1xuXG5cdHVpLmhpZGVDb250cm9scyA9IGZ1bmN0aW9uKCkge1xuXHRcdGZyYW1ld29yay5hZGRDbGFzcyhfY29udHJvbHMsJ3Bzd3BfX3VpLS1oaWRkZW4nKTtcblx0XHRfY29udHJvbHNWaXNpYmxlID0gZmFsc2U7XG5cdH07XG5cblx0dWkuc2hvd0NvbnRyb2xzID0gZnVuY3Rpb24oKSB7XG5cdFx0X2NvbnRyb2xzVmlzaWJsZSA9IHRydWU7XG5cdFx0aWYoIV9vdmVybGF5VUlVcGRhdGVkKSB7XG5cdFx0XHR1aS51cGRhdGUoKTtcblx0XHR9XG5cdFx0ZnJhbWV3b3JrLnJlbW92ZUNsYXNzKF9jb250cm9scywncHN3cF9fdWktLWhpZGRlbicpO1xuXHR9O1xuXG5cdHVpLnN1cHBvcnRzRnVsbHNjcmVlbiA9IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBkID0gZG9jdW1lbnQ7XG5cdFx0cmV0dXJuICEhKGQuZXhpdEZ1bGxzY3JlZW4gfHwgZC5tb3pDYW5jZWxGdWxsU2NyZWVuIHx8IGQud2Via2l0RXhpdEZ1bGxzY3JlZW4gfHwgZC5tc0V4aXRGdWxsc2NyZWVuKTtcblx0fTtcblxuXHR1aS5nZXRGdWxsc2NyZWVuQVBJID0gZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGRFID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LFxuXHRcdFx0YXBpLFxuXHRcdFx0dEYgPSAnZnVsbHNjcmVlbmNoYW5nZSc7XG5cblx0XHRpZiAoZEUucmVxdWVzdEZ1bGxzY3JlZW4pIHtcblx0XHRcdGFwaSA9IHtcblx0XHRcdFx0ZW50ZXJLOiAncmVxdWVzdEZ1bGxzY3JlZW4nLFxuXHRcdFx0XHRleGl0SzogJ2V4aXRGdWxsc2NyZWVuJyxcblx0XHRcdFx0ZWxlbWVudEs6ICdmdWxsc2NyZWVuRWxlbWVudCcsXG5cdFx0XHRcdGV2ZW50SzogdEZcblx0XHRcdH07XG5cblx0XHR9IGVsc2UgaWYoZEUubW96UmVxdWVzdEZ1bGxTY3JlZW4gKSB7XG5cdFx0XHRhcGkgPSB7XG5cdFx0XHRcdGVudGVySzogJ21velJlcXVlc3RGdWxsU2NyZWVuJyxcblx0XHRcdFx0ZXhpdEs6ICdtb3pDYW5jZWxGdWxsU2NyZWVuJyxcblx0XHRcdFx0ZWxlbWVudEs6ICdtb3pGdWxsU2NyZWVuRWxlbWVudCcsXG5cdFx0XHRcdGV2ZW50SzogJ21veicgKyB0RlxuXHRcdFx0fTtcblxuXHRcdFx0XG5cblx0XHR9IGVsc2UgaWYoZEUud2Via2l0UmVxdWVzdEZ1bGxzY3JlZW4pIHtcblx0XHRcdGFwaSA9IHtcblx0XHRcdFx0ZW50ZXJLOiAnd2Via2l0UmVxdWVzdEZ1bGxzY3JlZW4nLFxuXHRcdFx0XHRleGl0SzogJ3dlYmtpdEV4aXRGdWxsc2NyZWVuJyxcblx0XHRcdFx0ZWxlbWVudEs6ICd3ZWJraXRGdWxsc2NyZWVuRWxlbWVudCcsXG5cdFx0XHRcdGV2ZW50SzogJ3dlYmtpdCcgKyB0RlxuXHRcdFx0fTtcblxuXHRcdH0gZWxzZSBpZihkRS5tc1JlcXVlc3RGdWxsc2NyZWVuKSB7XG5cdFx0XHRhcGkgPSB7XG5cdFx0XHRcdGVudGVySzogJ21zUmVxdWVzdEZ1bGxzY3JlZW4nLFxuXHRcdFx0XHRleGl0SzogJ21zRXhpdEZ1bGxzY3JlZW4nLFxuXHRcdFx0XHRlbGVtZW50SzogJ21zRnVsbHNjcmVlbkVsZW1lbnQnLFxuXHRcdFx0XHRldmVudEs6ICdNU0Z1bGxzY3JlZW5DaGFuZ2UnXG5cdFx0XHR9O1xuXHRcdH1cblxuXHRcdGlmKGFwaSkge1xuXHRcdFx0YXBpLmVudGVyID0gZnVuY3Rpb24oKSB7IFxuXHRcdFx0XHQvLyBkaXNhYmxlIGNsb3NlLW9uLXNjcm9sbCBpbiBmdWxsc2NyZWVuXG5cdFx0XHRcdF9pbml0YWxDbG9zZU9uU2Nyb2xsVmFsdWUgPSBfb3B0aW9ucy5jbG9zZU9uU2Nyb2xsOyBcblx0XHRcdFx0X29wdGlvbnMuY2xvc2VPblNjcm9sbCA9IGZhbHNlOyBcblxuXHRcdFx0XHRpZih0aGlzLmVudGVySyA9PT0gJ3dlYmtpdFJlcXVlc3RGdWxsc2NyZWVuJykge1xuXHRcdFx0XHRcdHBzd3AudGVtcGxhdGVbdGhpcy5lbnRlcktdKCBFbGVtZW50LkFMTE9XX0tFWUJPQVJEX0lOUFVUICk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cmV0dXJuIHBzd3AudGVtcGxhdGVbdGhpcy5lbnRlcktdKCk7IFxuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXHRcdFx0YXBpLmV4aXQgPSBmdW5jdGlvbigpIHsgXG5cdFx0XHRcdF9vcHRpb25zLmNsb3NlT25TY3JvbGwgPSBfaW5pdGFsQ2xvc2VPblNjcm9sbFZhbHVlO1xuXG5cdFx0XHRcdHJldHVybiBkb2N1bWVudFt0aGlzLmV4aXRLXSgpOyBcblxuXHRcdFx0fTtcblx0XHRcdGFwaS5pc0Z1bGxzY3JlZW4gPSBmdW5jdGlvbigpIHsgcmV0dXJuIGRvY3VtZW50W3RoaXMuZWxlbWVudEtdOyB9O1xuXHRcdH1cblxuXHRcdHJldHVybiBhcGk7XG5cdH07XG5cblxuXG59O1xucmV0dXJuIFBob3RvU3dpcGVVSV9EZWZhdWx0O1xuXG5cbn0pO1xuIiwiKGZ1bmN0aW9uIHdlYnBhY2tVbml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uKHJvb3QsIGZhY3RvcnkpIHtcblx0aWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnKVxuXHRcdG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuXHRlbHNlIGlmKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZClcblx0XHRkZWZpbmUoW10sIGZhY3RvcnkpO1xuXHRlbHNlIHtcblx0XHR2YXIgYSA9IGZhY3RvcnkoKTtcblx0XHRmb3IodmFyIGkgaW4gYSkgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyA/IGV4cG9ydHMgOiByb290KVtpXSA9IGFbaV07XG5cdH1cbn0pKHRoaXMsIGZ1bmN0aW9uKCkge1xucmV0dXJuIC8qKioqKiovIChmdW5jdGlvbihtb2R1bGVzKSB7IC8vIHdlYnBhY2tCb290c3RyYXBcbi8qKioqKiovIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuLyoqKioqKi8gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuLyoqKioqKi9cbi8qKioqKiovIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbi8qKioqKiovIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuLyoqKioqKi9cbi8qKioqKiovIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbi8qKioqKiovIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuLyoqKioqKi8gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4vKioqKioqLyBcdFx0fVxuLyoqKioqKi8gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4vKioqKioqLyBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuLyoqKioqKi8gXHRcdFx0aTogbW9kdWxlSWQsXG4vKioqKioqLyBcdFx0XHRsOiBmYWxzZSxcbi8qKioqKiovIFx0XHRcdGV4cG9ydHM6IHt9XG4vKioqKioqLyBcdFx0fTtcbi8qKioqKiovXG4vKioqKioqLyBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4vKioqKioqLyBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG4vKioqKioqL1xuLyoqKioqKi8gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbi8qKioqKiovIFx0XHRtb2R1bGUubCA9IHRydWU7XG4vKioqKioqL1xuLyoqKioqKi8gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4vKioqKioqLyBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuLyoqKioqKi8gXHR9XG4vKioqKioqL1xuLyoqKioqKi9cbi8qKioqKiovIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbi8qKioqKiovIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcbi8qKioqKiovXG4vKioqKioqLyBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4vKioqKioqLyBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG4vKioqKioqL1xuLyoqKioqKi8gXHQvLyBpZGVudGl0eSBmdW5jdGlvbiBmb3IgY2FsbGluZyBoYXJtb255IGltcG9ydHMgd2l0aCB0aGUgY29ycmVjdCBjb250ZXh0XG4vKioqKioqLyBcdF9fd2VicGFja19yZXF1aXJlX18uaSA9IGZ1bmN0aW9uKHZhbHVlKSB7IHJldHVybiB2YWx1ZTsgfTtcbi8qKioqKiovXG4vKioqKioqLyBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuLyoqKioqKi8gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbi8qKioqKiovIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4vKioqKioqLyBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwge1xuLyoqKioqKi8gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuLyoqKioqKi8gXHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuLyoqKioqKi8gXHRcdFx0XHRnZXQ6IGdldHRlclxuLyoqKioqKi8gXHRcdFx0fSk7XG4vKioqKioqLyBcdFx0fVxuLyoqKioqKi8gXHR9O1xuLyoqKioqKi9cbi8qKioqKiovIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbi8qKioqKiovIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4vKioqKioqLyBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4vKioqKioqLyBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuLyoqKioqKi8gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbi8qKioqKiovIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4vKioqKioqLyBcdFx0cmV0dXJuIGdldHRlcjtcbi8qKioqKiovIFx0fTtcbi8qKioqKiovXG4vKioqKioqLyBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuLyoqKioqKi8gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG4vKioqKioqL1xuLyoqKioqKi8gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuLyoqKioqKi8gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuLyoqKioqKi9cbi8qKioqKiovIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vKioqKioqLyBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IDcpO1xuLyoqKioqKi8gfSlcbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4vKioqKioqLyAoW1xuLyogMCAqL1xuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cykge1xuXG52YXIgZztcclxuXHJcbi8vIFRoaXMgd29ya3MgaW4gbm9uLXN0cmljdCBtb2RlXHJcbmcgPSAoZnVuY3Rpb24oKSB7XHJcblx0cmV0dXJuIHRoaXM7XHJcbn0pKCk7XHJcblxyXG50cnkge1xyXG5cdC8vIFRoaXMgd29ya3MgaWYgZXZhbCBpcyBhbGxvd2VkIChzZWUgQ1NQKVxyXG5cdGcgPSBnIHx8IEZ1bmN0aW9uKFwicmV0dXJuIHRoaXNcIikoKSB8fCAoMSxldmFsKShcInRoaXNcIik7XHJcbn0gY2F0Y2goZSkge1xyXG5cdC8vIFRoaXMgd29ya3MgaWYgdGhlIHdpbmRvdyByZWZlcmVuY2UgaXMgYXZhaWxhYmxlXHJcblx0aWYodHlwZW9mIHdpbmRvdyA9PT0gXCJvYmplY3RcIilcclxuXHRcdGcgPSB3aW5kb3c7XHJcbn1cclxuXHJcbi8vIGcgY2FuIHN0aWxsIGJlIHVuZGVmaW5lZCwgYnV0IG5vdGhpbmcgdG8gZG8gYWJvdXQgaXQuLi5cclxuLy8gV2UgcmV0dXJuIHVuZGVmaW5lZCwgaW5zdGVhZCBvZiBub3RoaW5nIGhlcmUsIHNvIGl0J3NcclxuLy8gZWFzaWVyIHRvIGhhbmRsZSB0aGlzIGNhc2UuIGlmKCFnbG9iYWwpIHsgLi4ufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBnO1xyXG5cblxuLyoqKi8gfSksXG4vKiAxICovXG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cblwidXNlIHN0cmljdFwiO1xuXG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTsgLyogZ2xvYmFscyBqUXVlcnkgKi9cblxuZXhwb3J0cy5sb3J5ID0gbG9yeTtcblxudmFyIF9kZXRlY3RQcmVmaXhlcyA9IF9fd2VicGFja19yZXF1aXJlX18oMyk7XG5cbnZhciBfZGV0ZWN0UHJlZml4ZXMyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfZGV0ZWN0UHJlZml4ZXMpO1xuXG52YXIgX2Rpc3BhdGNoRXZlbnQgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDQpO1xuXG52YXIgX2Rpc3BhdGNoRXZlbnQyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfZGlzcGF0Y2hFdmVudCk7XG5cbnZhciBfZGVmYXVsdHMgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDIpO1xuXG52YXIgX2RlZmF1bHRzMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2RlZmF1bHRzKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxudmFyIHNsaWNlID0gQXJyYXkucHJvdG90eXBlLnNsaWNlO1xuXG5mdW5jdGlvbiBsb3J5KHNsaWRlciwgb3B0cykge1xuICAgIHZhciBwb3NpdGlvbiA9IHZvaWQgMDtcbiAgICB2YXIgc2xpZGVzV2lkdGggPSB2b2lkIDA7XG4gICAgdmFyIGZyYW1lV2lkdGggPSB2b2lkIDA7XG4gICAgdmFyIHNsaWRlcyA9IHZvaWQgMDtcblxuICAgIC8qKlxuICAgICAqIHNsaWRlciBET00gZWxlbWVudHNcbiAgICAgKi9cbiAgICB2YXIgZnJhbWUgPSB2b2lkIDA7XG4gICAgdmFyIHNsaWRlQ29udGFpbmVyID0gdm9pZCAwO1xuICAgIHZhciBwcmV2Q3RybCA9IHZvaWQgMDtcbiAgICB2YXIgbmV4dEN0cmwgPSB2b2lkIDA7XG4gICAgdmFyIHByZWZpeGVzID0gdm9pZCAwO1xuICAgIHZhciB0cmFuc2l0aW9uRW5kQ2FsbGJhY2sgPSB2b2lkIDA7XG5cbiAgICB2YXIgaW5kZXggPSAwO1xuICAgIHZhciBvcHRpb25zID0ge307XG5cbiAgICAvKipcbiAgICAgKiBpZiBvYmplY3QgaXMgalF1ZXJ5IGNvbnZlcnQgdG8gbmF0aXZlIERPTSBlbGVtZW50XG4gICAgICovXG4gICAgaWYgKHR5cGVvZiBqUXVlcnkgIT09ICd1bmRlZmluZWQnICYmIHNsaWRlciBpbnN0YW5jZW9mIGpRdWVyeSkge1xuICAgICAgICBzbGlkZXIgPSBzbGlkZXJbMF07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogcHJpdmF0ZVxuICAgICAqIHNldCBhY3RpdmUgY2xhc3MgdG8gZWxlbWVudCB3aGljaCBpcyB0aGUgY3VycmVudCBzbGlkZVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHNldEFjdGl2ZUVsZW1lbnQoc2xpZGVzLCBjdXJyZW50SW5kZXgpIHtcbiAgICAgICAgdmFyIF9vcHRpb25zID0gb3B0aW9ucyxcbiAgICAgICAgICAgIGNsYXNzTmFtZUFjdGl2ZVNsaWRlID0gX29wdGlvbnMuY2xhc3NOYW1lQWN0aXZlU2xpZGU7XG5cblxuICAgICAgICBzbGlkZXMuZm9yRWFjaChmdW5jdGlvbiAoZWxlbWVudCwgaW5kZXgpIHtcbiAgICAgICAgICAgIGlmIChlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhjbGFzc05hbWVBY3RpdmVTbGlkZSkpIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoY2xhc3NOYW1lQWN0aXZlU2xpZGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBzbGlkZXNbY3VycmVudEluZGV4XS5jbGFzc0xpc3QuYWRkKGNsYXNzTmFtZUFjdGl2ZVNsaWRlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBwcml2YXRlXG4gICAgICogc2V0dXBJbmZpbml0ZTogZnVuY3Rpb24gdG8gc2V0dXAgaWYgaW5maW5pdGUgaXMgc2V0XG4gICAgICpcbiAgICAgKiBAcGFyYW0gIHthcnJheX0gc2xpZGVBcnJheVxuICAgICAqIEByZXR1cm4ge2FycmF5fSBhcnJheSBvZiB1cGRhdGVkIHNsaWRlQ29udGFpbmVyIGVsZW1lbnRzXG4gICAgICovXG4gICAgZnVuY3Rpb24gc2V0dXBJbmZpbml0ZShzbGlkZUFycmF5KSB7XG4gICAgICAgIHZhciBfb3B0aW9uczIgPSBvcHRpb25zLFxuICAgICAgICAgICAgaW5maW5pdGUgPSBfb3B0aW9uczIuaW5maW5pdGU7XG5cblxuICAgICAgICB2YXIgZnJvbnQgPSBzbGlkZUFycmF5LnNsaWNlKDAsIGluZmluaXRlKTtcbiAgICAgICAgdmFyIGJhY2sgPSBzbGlkZUFycmF5LnNsaWNlKHNsaWRlQXJyYXkubGVuZ3RoIC0gaW5maW5pdGUsIHNsaWRlQXJyYXkubGVuZ3RoKTtcblxuICAgICAgICBmcm9udC5mb3JFYWNoKGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgICAgICB2YXIgY2xvbmVkID0gZWxlbWVudC5jbG9uZU5vZGUodHJ1ZSk7XG5cbiAgICAgICAgICAgIHNsaWRlQ29udGFpbmVyLmFwcGVuZENoaWxkKGNsb25lZCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGJhY2sucmV2ZXJzZSgpLmZvckVhY2goZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgICAgIHZhciBjbG9uZWQgPSBlbGVtZW50LmNsb25lTm9kZSh0cnVlKTtcblxuICAgICAgICAgICAgc2xpZGVDb250YWluZXIuaW5zZXJ0QmVmb3JlKGNsb25lZCwgc2xpZGVDb250YWluZXIuZmlyc3RDaGlsZCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHNsaWRlQ29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIocHJlZml4ZXMudHJhbnNpdGlvbkVuZCwgb25UcmFuc2l0aW9uRW5kKTtcblxuICAgICAgICByZXR1cm4gc2xpY2UuY2FsbChzbGlkZUNvbnRhaW5lci5jaGlsZHJlbik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogW2Rpc3BhdGNoU2xpZGVyRXZlbnQgZGVzY3JpcHRpb25dXG4gICAgICogQHJldHVybiB7W3R5cGVdfSBbZGVzY3JpcHRpb25dXG4gICAgICovXG4gICAgZnVuY3Rpb24gZGlzcGF0Y2hTbGlkZXJFdmVudChwaGFzZSwgdHlwZSwgZGV0YWlsKSB7XG4gICAgICAgICgwLCBfZGlzcGF0Y2hFdmVudDIuZGVmYXVsdCkoc2xpZGVyLCBwaGFzZSArICcubG9yeS4nICsgdHlwZSwgZGV0YWlsKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiB0cmFuc2xhdGVzIHRvIGEgZ2l2ZW4gcG9zaXRpb24gaW4gYSBnaXZlbiB0aW1lIGluIG1pbGxpc2Vjb25kc1xuICAgICAqXG4gICAgICogQHRvICAgICAgICB7bnVtYmVyfSBudW1iZXIgaW4gcGl4ZWxzIHdoZXJlIHRvIHRyYW5zbGF0ZSB0b1xuICAgICAqIEBkdXJhdGlvbiAge251bWJlcn0gdGltZSBpbiBtaWxsaXNlY29uZHMgZm9yIHRoZSB0cmFuc2lzdGlvblxuICAgICAqIEBlYXNlICAgICAge3N0cmluZ30gZWFzaW5nIGNzcyBwcm9wZXJ0eVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHRyYW5zbGF0ZSh0bywgZHVyYXRpb24sIGVhc2UpIHtcbiAgICAgICAgdmFyIHN0eWxlID0gc2xpZGVDb250YWluZXIgJiYgc2xpZGVDb250YWluZXIuc3R5bGU7XG5cbiAgICAgICAgaWYgKHN0eWxlKSB7XG4gICAgICAgICAgICBzdHlsZVtwcmVmaXhlcy50cmFuc2l0aW9uICsgJ1RpbWluZ0Z1bmN0aW9uJ10gPSBlYXNlO1xuICAgICAgICAgICAgc3R5bGVbcHJlZml4ZXMudHJhbnNpdGlvbiArICdEdXJhdGlvbiddID0gZHVyYXRpb24gKyAnbXMnO1xuXG4gICAgICAgICAgICBpZiAocHJlZml4ZXMuaGFzVHJhbnNsYXRlM2QpIHtcbiAgICAgICAgICAgICAgICBzdHlsZVtwcmVmaXhlcy50cmFuc2Zvcm1dID0gJ3RyYW5zbGF0ZTNkKCcgKyB0byArICdweCwgMCwgMCknO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzdHlsZVtwcmVmaXhlcy50cmFuc2Zvcm1dID0gJ3RyYW5zbGF0ZSgnICsgdG8gKyAncHgsIDApJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIHNsaWRlZnVuY3Rpb24gY2FsbGVkIGJ5IHByZXYsIG5leHQgJiB0b3VjaGVuZFxuICAgICAqXG4gICAgICogZGV0ZXJtaW5lIG5leHRJbmRleCBhbmQgc2xpZGUgdG8gbmV4dCBwb3N0aW9uXG4gICAgICogdW5kZXIgcmVzdHJpY3Rpb25zIG9mIHRoZSBkZWZpbmVkIG9wdGlvbnNcbiAgICAgKlxuICAgICAqIEBkaXJlY3Rpb24gIHtib29sZWFufVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHNsaWRlKG5leHRJbmRleCwgZGlyZWN0aW9uKSB7XG4gICAgICAgIHZhciBfb3B0aW9uczMgPSBvcHRpb25zLFxuICAgICAgICAgICAgc2xpZGVTcGVlZCA9IF9vcHRpb25zMy5zbGlkZVNwZWVkLFxuICAgICAgICAgICAgc2xpZGVzVG9TY3JvbGwgPSBfb3B0aW9uczMuc2xpZGVzVG9TY3JvbGwsXG4gICAgICAgICAgICBpbmZpbml0ZSA9IF9vcHRpb25zMy5pbmZpbml0ZSxcbiAgICAgICAgICAgIHJld2luZCA9IF9vcHRpb25zMy5yZXdpbmQsXG4gICAgICAgICAgICByZXdpbmRTcGVlZCA9IF9vcHRpb25zMy5yZXdpbmRTcGVlZCxcbiAgICAgICAgICAgIGVhc2UgPSBfb3B0aW9uczMuZWFzZSxcbiAgICAgICAgICAgIGNsYXNzTmFtZUFjdGl2ZVNsaWRlID0gX29wdGlvbnMzLmNsYXNzTmFtZUFjdGl2ZVNsaWRlO1xuXG5cbiAgICAgICAgdmFyIGR1cmF0aW9uID0gc2xpZGVTcGVlZDtcblxuICAgICAgICB2YXIgbmV4dFNsaWRlID0gZGlyZWN0aW9uID8gaW5kZXggKyAxIDogaW5kZXggLSAxO1xuICAgICAgICB2YXIgbWF4T2Zmc2V0ID0gTWF0aC5yb3VuZChzbGlkZXNXaWR0aCAtIGZyYW1lV2lkdGgpO1xuXG4gICAgICAgIGRpc3BhdGNoU2xpZGVyRXZlbnQoJ2JlZm9yZScsICdzbGlkZScsIHtcbiAgICAgICAgICAgIGluZGV4OiBpbmRleCxcbiAgICAgICAgICAgIG5leHRTbGlkZTogbmV4dFNsaWRlXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZXNldCBjb250cm9sIGNsYXNzZXNcbiAgICAgICAgICovXG4gICAgICAgIGlmIChwcmV2Q3RybCkge1xuICAgICAgICAgICAgcHJldkN0cmwuY2xhc3NMaXN0LnJlbW92ZSgnZGlzYWJsZWQnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobmV4dEN0cmwpIHtcbiAgICAgICAgICAgIG5leHRDdHJsLmNsYXNzTGlzdC5yZW1vdmUoJ2Rpc2FibGVkJyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodHlwZW9mIG5leHRJbmRleCAhPT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgIGlmIChkaXJlY3Rpb24pIHtcbiAgICAgICAgICAgICAgICBuZXh0SW5kZXggPSBpbmRleCArIHNsaWRlc1RvU2Nyb2xsO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBuZXh0SW5kZXggPSBpbmRleCAtIHNsaWRlc1RvU2Nyb2xsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgbmV4dEluZGV4ID0gTWF0aC5taW4oTWF0aC5tYXgobmV4dEluZGV4LCAwKSwgc2xpZGVzLmxlbmd0aCAtIDEpO1xuXG4gICAgICAgIGlmIChpbmZpbml0ZSAmJiBkaXJlY3Rpb24gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgbmV4dEluZGV4ICs9IGluZmluaXRlO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIG5leHRPZmZzZXQgPSBNYXRoLm1pbihNYXRoLm1heChzbGlkZXNbbmV4dEluZGV4XS5vZmZzZXRMZWZ0ICogLTEsIG1heE9mZnNldCAqIC0xKSwgMCk7XG5cbiAgICAgICAgaWYgKHJld2luZCAmJiBNYXRoLmFicyhwb3NpdGlvbi54KSA9PT0gbWF4T2Zmc2V0ICYmIGRpcmVjdGlvbikge1xuICAgICAgICAgICAgbmV4dE9mZnNldCA9IDA7XG4gICAgICAgICAgICBuZXh0SW5kZXggPSAwO1xuICAgICAgICAgICAgZHVyYXRpb24gPSByZXdpbmRTcGVlZDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiB0cmFuc2xhdGUgdG8gdGhlIG5leHRPZmZzZXQgYnkgYSBkZWZpbmVkIGR1cmF0aW9uIGFuZCBlYXNlIGZ1bmN0aW9uXG4gICAgICAgICAqL1xuICAgICAgICB0cmFuc2xhdGUobmV4dE9mZnNldCwgZHVyYXRpb24sIGVhc2UpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiB1cGRhdGUgdGhlIHBvc2l0aW9uIHdpdGggdGhlIG5leHQgcG9zaXRpb25cbiAgICAgICAgICovXG4gICAgICAgIHBvc2l0aW9uLnggPSBuZXh0T2Zmc2V0O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiB1cGRhdGUgdGhlIGluZGV4IHdpdGggdGhlIG5leHRJbmRleCBvbmx5IGlmXG4gICAgICAgICAqIHRoZSBvZmZzZXQgb2YgdGhlIG5leHRJbmRleCBpcyBpbiB0aGUgcmFuZ2Ugb2YgdGhlIG1heE9mZnNldFxuICAgICAgICAgKi9cbiAgICAgICAgaWYgKHNsaWRlc1tuZXh0SW5kZXhdLm9mZnNldExlZnQgPD0gbWF4T2Zmc2V0KSB7XG4gICAgICAgICAgICBpbmRleCA9IG5leHRJbmRleDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpbmZpbml0ZSAmJiAobmV4dEluZGV4ID09PSBzbGlkZXMubGVuZ3RoIC0gaW5maW5pdGUgfHwgbmV4dEluZGV4ID09PSAwKSkge1xuICAgICAgICAgICAgaWYgKGRpcmVjdGlvbikge1xuICAgICAgICAgICAgICAgIGluZGV4ID0gaW5maW5pdGU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghZGlyZWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgaW5kZXggPSBzbGlkZXMubGVuZ3RoIC0gaW5maW5pdGUgKiAyO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBwb3NpdGlvbi54ID0gc2xpZGVzW2luZGV4XS5vZmZzZXRMZWZ0ICogLTE7XG5cbiAgICAgICAgICAgIHRyYW5zaXRpb25FbmRDYWxsYmFjayA9IGZ1bmN0aW9uIHRyYW5zaXRpb25FbmRDYWxsYmFjaygpIHtcbiAgICAgICAgICAgICAgICB0cmFuc2xhdGUoc2xpZGVzW2luZGV4XS5vZmZzZXRMZWZ0ICogLTEsIDAsIHVuZGVmaW5lZCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNsYXNzTmFtZUFjdGl2ZVNsaWRlKSB7XG4gICAgICAgICAgICBzZXRBY3RpdmVFbGVtZW50KHNsaWNlLmNhbGwoc2xpZGVzKSwgaW5kZXgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIHVwZGF0ZSBjbGFzc2VzIGZvciBuZXh0IGFuZCBwcmV2IGFycm93c1xuICAgICAgICAgKiBiYXNlZCBvbiB1c2VyIHNldHRpbmdzXG4gICAgICAgICAqL1xuICAgICAgICBpZiAocHJldkN0cmwgJiYgIWluZmluaXRlICYmIG5leHRJbmRleCA9PT0gMCkge1xuICAgICAgICAgICAgcHJldkN0cmwuY2xhc3NMaXN0LmFkZCgnZGlzYWJsZWQnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChuZXh0Q3RybCAmJiAhaW5maW5pdGUgJiYgIXJld2luZCAmJiBuZXh0SW5kZXggKyAxID09PSBzbGlkZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICBuZXh0Q3RybC5jbGFzc0xpc3QuYWRkKCdkaXNhYmxlZCcpO1xuICAgICAgICB9XG5cbiAgICAgICAgZGlzcGF0Y2hTbGlkZXJFdmVudCgnYWZ0ZXInLCAnc2xpZGUnLCB7XG4gICAgICAgICAgICBjdXJyZW50U2xpZGU6IGluZGV4XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIHB1YmxpY1xuICAgICAqIHNldHVwIGZ1bmN0aW9uXG4gICAgICovXG4gICAgZnVuY3Rpb24gc2V0dXAoKSB7XG4gICAgICAgIGRpc3BhdGNoU2xpZGVyRXZlbnQoJ2JlZm9yZScsICdpbml0Jyk7XG5cbiAgICAgICAgcHJlZml4ZXMgPSAoMCwgX2RldGVjdFByZWZpeGVzMi5kZWZhdWx0KSgpO1xuICAgICAgICBvcHRpb25zID0gX2V4dGVuZHMoe30sIF9kZWZhdWx0czIuZGVmYXVsdCwgb3B0cyk7XG5cbiAgICAgICAgdmFyIF9vcHRpb25zNCA9IG9wdGlvbnMsXG4gICAgICAgICAgICBjbGFzc05hbWVGcmFtZSA9IF9vcHRpb25zNC5jbGFzc05hbWVGcmFtZSxcbiAgICAgICAgICAgIGNsYXNzTmFtZVNsaWRlQ29udGFpbmVyID0gX29wdGlvbnM0LmNsYXNzTmFtZVNsaWRlQ29udGFpbmVyLFxuICAgICAgICAgICAgY2xhc3NOYW1lUHJldkN0cmwgPSBfb3B0aW9uczQuY2xhc3NOYW1lUHJldkN0cmwsXG4gICAgICAgICAgICBjbGFzc05hbWVOZXh0Q3RybCA9IF9vcHRpb25zNC5jbGFzc05hbWVOZXh0Q3RybCxcbiAgICAgICAgICAgIGVuYWJsZU1vdXNlRXZlbnRzID0gX29wdGlvbnM0LmVuYWJsZU1vdXNlRXZlbnRzLFxuICAgICAgICAgICAgY2xhc3NOYW1lQWN0aXZlU2xpZGUgPSBfb3B0aW9uczQuY2xhc3NOYW1lQWN0aXZlU2xpZGU7XG5cblxuICAgICAgICBmcmFtZSA9IHNsaWRlci5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKGNsYXNzTmFtZUZyYW1lKVswXTtcbiAgICAgICAgc2xpZGVDb250YWluZXIgPSBmcmFtZS5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKGNsYXNzTmFtZVNsaWRlQ29udGFpbmVyKVswXTtcbiAgICAgICAgcHJldkN0cmwgPSBzbGlkZXIuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShjbGFzc05hbWVQcmV2Q3RybClbMF07XG4gICAgICAgIG5leHRDdHJsID0gc2xpZGVyLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoY2xhc3NOYW1lTmV4dEN0cmwpWzBdO1xuXG4gICAgICAgIHBvc2l0aW9uID0ge1xuICAgICAgICAgICAgeDogc2xpZGVDb250YWluZXIub2Zmc2V0TGVmdCxcbiAgICAgICAgICAgIHk6IHNsaWRlQ29udGFpbmVyLm9mZnNldFRvcFxuICAgICAgICB9O1xuXG4gICAgICAgIGlmIChvcHRpb25zLmluZmluaXRlKSB7XG4gICAgICAgICAgICBzbGlkZXMgPSBzZXR1cEluZmluaXRlKHNsaWNlLmNhbGwoc2xpZGVDb250YWluZXIuY2hpbGRyZW4pKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNsaWRlcyA9IHNsaWNlLmNhbGwoc2xpZGVDb250YWluZXIuY2hpbGRyZW4pO1xuXG4gICAgICAgICAgICBpZiAocHJldkN0cmwpIHtcbiAgICAgICAgICAgICAgICBwcmV2Q3RybC5jbGFzc0xpc3QuYWRkKCdkaXNhYmxlZCcpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAobmV4dEN0cmwgJiYgc2xpZGVzLmxlbmd0aCA9PT0gMSAmJiAhb3B0aW9ucy5yZXdpbmQpIHtcbiAgICAgICAgICAgICAgICBuZXh0Q3RybC5jbGFzc0xpc3QuYWRkKCdkaXNhYmxlZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmVzZXQoKTtcblxuICAgICAgICBpZiAoY2xhc3NOYW1lQWN0aXZlU2xpZGUpIHtcbiAgICAgICAgICAgIHNldEFjdGl2ZUVsZW1lbnQoc2xpZGVzLCBpbmRleCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocHJldkN0cmwgJiYgbmV4dEN0cmwpIHtcbiAgICAgICAgICAgIHByZXZDdHJsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgcHJldik7XG4gICAgICAgICAgICBuZXh0Q3RybC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIG5leHQpO1xuICAgICAgICB9XG5cbiAgICAgICAgZnJhbWUuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIG9uVG91Y2hzdGFydCk7XG5cbiAgICAgICAgaWYgKGVuYWJsZU1vdXNlRXZlbnRzKSB7XG4gICAgICAgICAgICBmcmFtZS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBvblRvdWNoc3RhcnQpO1xuICAgICAgICAgICAgZnJhbWUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBvbkNsaWNrKTtcbiAgICAgICAgfVxuXG4gICAgICAgIG9wdGlvbnMud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIG9uUmVzaXplKTtcblxuICAgICAgICBkaXNwYXRjaFNsaWRlckV2ZW50KCdhZnRlcicsICdpbml0Jyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogcHVibGljXG4gICAgICogcmVzZXQgZnVuY3Rpb246IGNhbGxlZCBvbiByZXNpemVcbiAgICAgKi9cbiAgICBmdW5jdGlvbiByZXNldCgpIHtcbiAgICAgICAgdmFyIF9vcHRpb25zNSA9IG9wdGlvbnMsXG4gICAgICAgICAgICBpbmZpbml0ZSA9IF9vcHRpb25zNS5pbmZpbml0ZSxcbiAgICAgICAgICAgIGVhc2UgPSBfb3B0aW9uczUuZWFzZSxcbiAgICAgICAgICAgIHJld2luZFNwZWVkID0gX29wdGlvbnM1LnJld2luZFNwZWVkLFxuICAgICAgICAgICAgcmV3aW5kT25SZXNpemUgPSBfb3B0aW9uczUucmV3aW5kT25SZXNpemUsXG4gICAgICAgICAgICBjbGFzc05hbWVBY3RpdmVTbGlkZSA9IF9vcHRpb25zNS5jbGFzc05hbWVBY3RpdmVTbGlkZTtcblxuXG4gICAgICAgIHNsaWRlc1dpZHRoID0gc2xpZGVDb250YWluZXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGggfHwgc2xpZGVDb250YWluZXIub2Zmc2V0V2lkdGg7XG4gICAgICAgIGZyYW1lV2lkdGggPSBmcmFtZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aCB8fCBmcmFtZS5vZmZzZXRXaWR0aDtcblxuICAgICAgICBpZiAoZnJhbWVXaWR0aCA9PT0gc2xpZGVzV2lkdGgpIHtcbiAgICAgICAgICAgIHNsaWRlc1dpZHRoID0gc2xpZGVzLnJlZHVjZShmdW5jdGlvbiAocHJldmlvdXNWYWx1ZSwgc2xpZGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJldmlvdXNWYWx1ZSArIHNsaWRlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLndpZHRoIHx8IHNsaWRlLm9mZnNldFdpZHRoO1xuICAgICAgICAgICAgfSwgMCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocmV3aW5kT25SZXNpemUpIHtcbiAgICAgICAgICAgIGluZGV4ID0gMDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVhc2UgPSBudWxsO1xuICAgICAgICAgICAgcmV3aW5kU3BlZWQgPSAwO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGluZmluaXRlKSB7XG4gICAgICAgICAgICB0cmFuc2xhdGUoc2xpZGVzW2luZGV4ICsgaW5maW5pdGVdLm9mZnNldExlZnQgKiAtMSwgMCwgbnVsbCk7XG5cbiAgICAgICAgICAgIGluZGV4ID0gaW5kZXggKyBpbmZpbml0ZTtcbiAgICAgICAgICAgIHBvc2l0aW9uLnggPSBzbGlkZXNbaW5kZXhdLm9mZnNldExlZnQgKiAtMTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRyYW5zbGF0ZShzbGlkZXNbaW5kZXhdLm9mZnNldExlZnQgKiAtMSwgcmV3aW5kU3BlZWQsIGVhc2UpO1xuICAgICAgICAgICAgcG9zaXRpb24ueCA9IHNsaWRlc1tpbmRleF0ub2Zmc2V0TGVmdCAqIC0xO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNsYXNzTmFtZUFjdGl2ZVNsaWRlKSB7XG4gICAgICAgICAgICBzZXRBY3RpdmVFbGVtZW50KHNsaWNlLmNhbGwoc2xpZGVzKSwgaW5kZXgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogcHVibGljXG4gICAgICogc2xpZGVUbzogY2FsbGVkIG9uIGNsaWNraGFuZGxlclxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHNsaWRlVG8oaW5kZXgpIHtcbiAgICAgICAgc2xpZGUoaW5kZXgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIHB1YmxpY1xuICAgICAqIHJldHVybkluZGV4IGZ1bmN0aW9uOiBjYWxsZWQgb24gY2xpY2toYW5kbGVyXG4gICAgICovXG4gICAgZnVuY3Rpb24gcmV0dXJuSW5kZXgoKSB7XG4gICAgICAgIHJldHVybiBpbmRleCAtIG9wdGlvbnMuaW5maW5pdGUgfHwgMDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBwdWJsaWNcbiAgICAgKiBwcmV2IGZ1bmN0aW9uOiBjYWxsZWQgb24gY2xpY2toYW5kbGVyXG4gICAgICovXG4gICAgZnVuY3Rpb24gcHJldigpIHtcbiAgICAgICAgc2xpZGUoZmFsc2UsIGZhbHNlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBwdWJsaWNcbiAgICAgKiBuZXh0IGZ1bmN0aW9uOiBjYWxsZWQgb24gY2xpY2toYW5kbGVyXG4gICAgICovXG4gICAgZnVuY3Rpb24gbmV4dCgpIHtcbiAgICAgICAgc2xpZGUoZmFsc2UsIHRydWUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIHB1YmxpY1xuICAgICAqIGRlc3Ryb3kgZnVuY3Rpb246IGNhbGxlZCB0byBncmFjZWZ1bGx5IGRlc3Ryb3kgdGhlIGxvcnkgaW5zdGFuY2VcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBkZXN0cm95KCkge1xuICAgICAgICBkaXNwYXRjaFNsaWRlckV2ZW50KCdiZWZvcmUnLCAnZGVzdHJveScpO1xuXG4gICAgICAgIC8vIHJlbW92ZSBldmVudCBsaXN0ZW5lcnNcbiAgICAgICAgZnJhbWUucmVtb3ZlRXZlbnRMaXN0ZW5lcihwcmVmaXhlcy50cmFuc2l0aW9uRW5kLCBvblRyYW5zaXRpb25FbmQpO1xuICAgICAgICBmcmFtZS5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0Jywgb25Ub3VjaHN0YXJ0KTtcbiAgICAgICAgZnJhbWUucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgb25Ub3VjaG1vdmUpO1xuICAgICAgICBmcmFtZS5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIG9uVG91Y2hlbmQpO1xuICAgICAgICBmcmFtZS5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBvblRvdWNobW92ZSk7XG4gICAgICAgIGZyYW1lLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIG9uVG91Y2hzdGFydCk7XG4gICAgICAgIGZyYW1lLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBvblRvdWNoZW5kKTtcbiAgICAgICAgZnJhbWUucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsIG9uVG91Y2hlbmQpO1xuICAgICAgICBmcmFtZS5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIG9uQ2xpY2spO1xuXG4gICAgICAgIG9wdGlvbnMud2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIG9uUmVzaXplKTtcblxuICAgICAgICBpZiAocHJldkN0cmwpIHtcbiAgICAgICAgICAgIHByZXZDdHJsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgcHJldik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobmV4dEN0cmwpIHtcbiAgICAgICAgICAgIG5leHRDdHJsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgbmV4dCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyByZW1vdmUgY2xvbmVkIHNsaWRlcyBpZiBpbmZpbml0ZSBpcyBzZXRcbiAgICAgICAgaWYgKG9wdGlvbnMuaW5maW5pdGUpIHtcbiAgICAgICAgICAgIEFycmF5LmFwcGx5KG51bGwsIEFycmF5KG9wdGlvbnMuaW5maW5pdGUpKS5mb3JFYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBzbGlkZUNvbnRhaW5lci5yZW1vdmVDaGlsZChzbGlkZUNvbnRhaW5lci5maXJzdENoaWxkKTtcbiAgICAgICAgICAgICAgICBzbGlkZUNvbnRhaW5lci5yZW1vdmVDaGlsZChzbGlkZUNvbnRhaW5lci5sYXN0Q2hpbGQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBkaXNwYXRjaFNsaWRlckV2ZW50KCdhZnRlcicsICdkZXN0cm95Jyk7XG4gICAgfVxuXG4gICAgLy8gZXZlbnQgaGFuZGxpbmdcblxuICAgIHZhciB0b3VjaE9mZnNldCA9IHZvaWQgMDtcbiAgICB2YXIgZGVsdGEgPSB2b2lkIDA7XG4gICAgdmFyIGlzU2Nyb2xsaW5nID0gdm9pZCAwO1xuXG4gICAgZnVuY3Rpb24gb25UcmFuc2l0aW9uRW5kKCkge1xuICAgICAgICBpZiAodHJhbnNpdGlvbkVuZENhbGxiYWNrKSB7XG4gICAgICAgICAgICB0cmFuc2l0aW9uRW5kQ2FsbGJhY2soKTtcblxuICAgICAgICAgICAgdHJhbnNpdGlvbkVuZENhbGxiYWNrID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gb25Ub3VjaHN0YXJ0KGV2ZW50KSB7XG4gICAgICAgIHZhciBfb3B0aW9uczYgPSBvcHRpb25zLFxuICAgICAgICAgICAgZW5hYmxlTW91c2VFdmVudHMgPSBfb3B0aW9uczYuZW5hYmxlTW91c2VFdmVudHM7XG5cbiAgICAgICAgdmFyIHRvdWNoZXMgPSBldmVudC50b3VjaGVzID8gZXZlbnQudG91Y2hlc1swXSA6IGV2ZW50O1xuXG4gICAgICAgIGlmIChlbmFibGVNb3VzZUV2ZW50cykge1xuICAgICAgICAgICAgZnJhbWUuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgb25Ub3VjaG1vdmUpO1xuICAgICAgICAgICAgZnJhbWUuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIG9uVG91Y2hlbmQpO1xuICAgICAgICAgICAgZnJhbWUuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsIG9uVG91Y2hlbmQpO1xuICAgICAgICB9XG5cbiAgICAgICAgZnJhbWUuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgb25Ub3VjaG1vdmUpO1xuICAgICAgICBmcmFtZS5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIG9uVG91Y2hlbmQpO1xuXG4gICAgICAgIHZhciBwYWdlWCA9IHRvdWNoZXMucGFnZVgsXG4gICAgICAgICAgICBwYWdlWSA9IHRvdWNoZXMucGFnZVk7XG5cblxuICAgICAgICB0b3VjaE9mZnNldCA9IHtcbiAgICAgICAgICAgIHg6IHBhZ2VYLFxuICAgICAgICAgICAgeTogcGFnZVksXG4gICAgICAgICAgICB0aW1lOiBEYXRlLm5vdygpXG4gICAgICAgIH07XG5cbiAgICAgICAgaXNTY3JvbGxpbmcgPSB1bmRlZmluZWQ7XG5cbiAgICAgICAgZGVsdGEgPSB7fTtcblxuICAgICAgICBkaXNwYXRjaFNsaWRlckV2ZW50KCdvbicsICd0b3VjaHN0YXJ0Jywge1xuICAgICAgICAgICAgZXZlbnQ6IGV2ZW50XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG9uVG91Y2htb3ZlKGV2ZW50KSB7XG4gICAgICAgIHZhciB0b3VjaGVzID0gZXZlbnQudG91Y2hlcyA/IGV2ZW50LnRvdWNoZXNbMF0gOiBldmVudDtcbiAgICAgICAgdmFyIHBhZ2VYID0gdG91Y2hlcy5wYWdlWCxcbiAgICAgICAgICAgIHBhZ2VZID0gdG91Y2hlcy5wYWdlWTtcblxuXG4gICAgICAgIGRlbHRhID0ge1xuICAgICAgICAgICAgeDogcGFnZVggLSB0b3VjaE9mZnNldC54LFxuICAgICAgICAgICAgeTogcGFnZVkgLSB0b3VjaE9mZnNldC55XG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKHR5cGVvZiBpc1Njcm9sbGluZyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIGlzU2Nyb2xsaW5nID0gISEoaXNTY3JvbGxpbmcgfHwgTWF0aC5hYnMoZGVsdGEueCkgPCBNYXRoLmFicyhkZWx0YS55KSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWlzU2Nyb2xsaW5nICYmIHRvdWNoT2Zmc2V0KSB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgdHJhbnNsYXRlKHBvc2l0aW9uLnggKyBkZWx0YS54LCAwLCBudWxsKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIG1heSBiZVxuICAgICAgICBkaXNwYXRjaFNsaWRlckV2ZW50KCdvbicsICd0b3VjaG1vdmUnLCB7XG4gICAgICAgICAgICBldmVudDogZXZlbnRcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gb25Ub3VjaGVuZChldmVudCkge1xuICAgICAgICAvKipcbiAgICAgICAgICogdGltZSBiZXR3ZWVuIHRvdWNoc3RhcnQgYW5kIHRvdWNoZW5kIGluIG1pbGxpc2Vjb25kc1xuICAgICAgICAgKiBAZHVyYXRpb24ge251bWJlcn1cbiAgICAgICAgICovXG4gICAgICAgIHZhciBkdXJhdGlvbiA9IHRvdWNoT2Zmc2V0ID8gRGF0ZS5ub3coKSAtIHRvdWNoT2Zmc2V0LnRpbWUgOiB1bmRlZmluZWQ7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIGlzIHZhbGlkIGlmOlxuICAgICAgICAgKlxuICAgICAgICAgKiAtPiBzd2lwZSBhdHRlbXB0IHRpbWUgaXMgb3ZlciAzMDAgbXNcbiAgICAgICAgICogYW5kXG4gICAgICAgICAqIC0+IHN3aXBlIGRpc3RhbmNlIGlzIGdyZWF0ZXIgdGhhbiAyNXB4XG4gICAgICAgICAqIG9yXG4gICAgICAgICAqIC0+IHN3aXBlIGRpc3RhbmNlIGlzIG1vcmUgdGhlbiBhIHRoaXJkIG9mIHRoZSBzd2lwZSBhcmVhXG4gICAgICAgICAqXG4gICAgICAgICAqIEBpc1ZhbGlkU2xpZGUge0Jvb2xlYW59XG4gICAgICAgICAqL1xuICAgICAgICB2YXIgaXNWYWxpZCA9IE51bWJlcihkdXJhdGlvbikgPCAzMDAgJiYgTWF0aC5hYnMoZGVsdGEueCkgPiAyNSB8fCBNYXRoLmFicyhkZWx0YS54KSA+IGZyYW1lV2lkdGggLyAzO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBpcyBvdXQgb2YgYm91bmRzIGlmOlxuICAgICAgICAgKlxuICAgICAgICAgKiAtPiBpbmRleCBpcyAwIGFuZCBkZWx0YSB4IGlzIGdyZWF0ZXIgdGhhbiAwXG4gICAgICAgICAqIG9yXG4gICAgICAgICAqIC0+IGluZGV4IGlzIHRoZSBsYXN0IHNsaWRlIGFuZCBkZWx0YSBpcyBzbWFsbGVyIHRoYW4gMFxuICAgICAgICAgKlxuICAgICAgICAgKiBAaXNPdXRPZkJvdW5kcyB7Qm9vbGVhbn1cbiAgICAgICAgICovXG4gICAgICAgIHZhciBpc091dE9mQm91bmRzID0gIWluZGV4ICYmIGRlbHRhLnggPiAwIHx8IGluZGV4ID09PSBzbGlkZXMubGVuZ3RoIC0gMSAmJiBkZWx0YS54IDwgMDtcblxuICAgICAgICB2YXIgZGlyZWN0aW9uID0gZGVsdGEueCA8IDA7XG5cbiAgICAgICAgaWYgKCFpc1Njcm9sbGluZykge1xuICAgICAgICAgICAgaWYgKGlzVmFsaWQgJiYgIWlzT3V0T2ZCb3VuZHMpIHtcbiAgICAgICAgICAgICAgICBzbGlkZShmYWxzZSwgZGlyZWN0aW9uKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdHJhbnNsYXRlKHBvc2l0aW9uLngsIG9wdGlvbnMuc25hcEJhY2tTcGVlZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0b3VjaE9mZnNldCA9IHVuZGVmaW5lZDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogcmVtb3ZlIGV2ZW50bGlzdGVuZXJzIGFmdGVyIHN3aXBlIGF0dGVtcHRcbiAgICAgICAgICovXG4gICAgICAgIGZyYW1lLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIG9uVG91Y2htb3ZlKTtcbiAgICAgICAgZnJhbWUucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCBvblRvdWNoZW5kKTtcbiAgICAgICAgZnJhbWUucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgb25Ub3VjaG1vdmUpO1xuICAgICAgICBmcmFtZS5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgb25Ub3VjaGVuZCk7XG4gICAgICAgIGZyYW1lLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCBvblRvdWNoZW5kKTtcblxuICAgICAgICBkaXNwYXRjaFNsaWRlckV2ZW50KCdvbicsICd0b3VjaGVuZCcsIHtcbiAgICAgICAgICAgIGV2ZW50OiBldmVudFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBvbkNsaWNrKGV2ZW50KSB7XG4gICAgICAgIGlmIChkZWx0YS54KSB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gb25SZXNpemUoZXZlbnQpIHtcbiAgICAgICAgcmVzZXQoKTtcblxuICAgICAgICBkaXNwYXRjaFNsaWRlckV2ZW50KCdvbicsICdyZXNpemUnLCB7XG4gICAgICAgICAgICBldmVudDogZXZlbnRcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gdHJpZ2dlciBpbml0aWFsIHNldHVwXG4gICAgc2V0dXAoKTtcblxuICAgIC8vIGV4cG9zZSBwdWJsaWMgYXBpXG4gICAgcmV0dXJuIHtcbiAgICAgICAgc2V0dXA6IHNldHVwLFxuICAgICAgICByZXNldDogcmVzZXQsXG4gICAgICAgIHNsaWRlVG86IHNsaWRlVG8sXG4gICAgICAgIHJldHVybkluZGV4OiByZXR1cm5JbmRleCxcbiAgICAgICAgcHJldjogcHJldixcbiAgICAgICAgbmV4dDogbmV4dCxcbiAgICAgICAgZGVzdHJveTogZGVzdHJveVxuICAgIH07XG59XG5cbi8qKiovIH0pLFxuLyogMiAqL1xuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5cInVzZSBzdHJpY3RcIjtcblxuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5kZWZhdWx0ID0ge1xuICAvKipcbiAgICogc2xpZGVzIHNjcm9sbGVkIGF0IG9uY2VcbiAgICogQHNsaWRlc1RvU2Nyb2xsIHtOdW1iZXJ9XG4gICAqL1xuICBzbGlkZXNUb1Njcm9sbDogMSxcblxuICAvKipcbiAgICogdGltZSBpbiBtaWxsaXNlY29uZHMgZm9yIHRoZSBhbmltYXRpb24gb2YgYSB2YWxpZCBzbGlkZSBhdHRlbXB0XG4gICAqIEBzbGlkZVNwZWVkIHtOdW1iZXJ9XG4gICAqL1xuICBzbGlkZVNwZWVkOiAzMDAsXG5cbiAgLyoqXG4gICAqIHRpbWUgaW4gbWlsbGlzZWNvbmRzIGZvciB0aGUgYW5pbWF0aW9uIG9mIHRoZSByZXdpbmQgYWZ0ZXIgdGhlIGxhc3Qgc2xpZGVcbiAgICogQHJld2luZFNwZWVkIHtOdW1iZXJ9XG4gICAqL1xuICByZXdpbmRTcGVlZDogNjAwLFxuXG4gIC8qKlxuICAgKiB0aW1lIGZvciB0aGUgc25hcEJhY2sgb2YgdGhlIHNsaWRlciBpZiB0aGUgc2xpZGUgYXR0ZW1wdCB3YXMgbm90IHZhbGlkXG4gICAqIEBzbmFwQmFja1NwZWVkIHtOdW1iZXJ9XG4gICAqL1xuICBzbmFwQmFja1NwZWVkOiAyMDAsXG5cbiAgLyoqXG4gICAqIEJhc2ljIGVhc2luZyBmdW5jdGlvbnM6IGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2RlL2RvY3MvV2ViL0NTUy90cmFuc2l0aW9uLXRpbWluZy1mdW5jdGlvblxuICAgKiBjdWJpYyBiZXppZXIgZWFzaW5nIGZ1bmN0aW9uczogaHR0cDovL2Vhc2luZ3MubmV0L2RlXG4gICAqIEBlYXNlIHtTdHJpbmd9XG4gICAqL1xuICBlYXNlOiAnZWFzZScsXG5cbiAgLyoqXG4gICAqIGlmIHNsaWRlciByZWFjaGVkIHRoZSBsYXN0IHNsaWRlLCB3aXRoIG5leHQgY2xpY2sgdGhlIHNsaWRlciBnb2VzIGJhY2sgdG8gdGhlIHN0YXJ0aW5kZXguXG4gICAqIHVzZSBpbmZpbml0ZSBvciByZXdpbmQsIG5vdCBib3RoXG4gICAqIEByZXdpbmQge0Jvb2xlYW59XG4gICAqL1xuICByZXdpbmQ6IGZhbHNlLFxuXG4gIC8qKlxuICAgKiBudW1iZXIgb2YgdmlzaWJsZSBzbGlkZXMgb3IgZmFsc2VcbiAgICogdXNlIGluZmluaXRlIG9yIHJld2luZCwgbm90IGJvdGhcbiAgICogQGluZmluaXRlIHtudW1iZXJ9XG4gICAqL1xuICBpbmZpbml0ZTogZmFsc2UsXG5cbiAgLyoqXG4gICAqIGNsYXNzIG5hbWUgZm9yIHNsaWRlciBmcmFtZVxuICAgKiBAY2xhc3NOYW1lRnJhbWUge3N0cmluZ31cbiAgICovXG4gIGNsYXNzTmFtZUZyYW1lOiAnanNfZnJhbWUnLFxuXG4gIC8qKlxuICAgKiBjbGFzcyBuYW1lIGZvciBzbGlkZXMgY29udGFpbmVyXG4gICAqIEBjbGFzc05hbWVTbGlkZUNvbnRhaW5lciB7c3RyaW5nfVxuICAgKi9cbiAgY2xhc3NOYW1lU2xpZGVDb250YWluZXI6ICdqc19zbGlkZXMnLFxuXG4gIC8qKlxuICAgKiBjbGFzcyBuYW1lIGZvciBzbGlkZXIgcHJldiBjb250cm9sXG4gICAqIEBjbGFzc05hbWVQcmV2Q3RybCB7c3RyaW5nfVxuICAgKi9cbiAgY2xhc3NOYW1lUHJldkN0cmw6ICdqc19wcmV2JyxcblxuICAvKipcbiAgICogY2xhc3MgbmFtZSBmb3Igc2xpZGVyIG5leHQgY29udHJvbFxuICAgKiBAY2xhc3NOYW1lTmV4dEN0cmwge3N0cmluZ31cbiAgICovXG4gIGNsYXNzTmFtZU5leHRDdHJsOiAnanNfbmV4dCcsXG5cbiAgLyoqXG4gICAqIGNsYXNzIG5hbWUgZm9yIGN1cnJlbnQgYWN0aXZlIHNsaWRlXG4gICAqIGlmIGVtcHR5U3RyaW5nIHRoZW4gbm8gY2xhc3MgaXMgc2V0XG4gICAqIEBjbGFzc05hbWVBY3RpdmVTbGlkZSB7c3RyaW5nfVxuICAgKi9cbiAgY2xhc3NOYW1lQWN0aXZlU2xpZGU6ICdhY3RpdmUnLFxuXG4gIC8qKlxuICAgKiBlbmFibGVzIG1vdXNlIGV2ZW50cyBmb3Igc3dpcGluZyBvbiBkZXNrdG9wIGRldmljZXNcbiAgICogQGVuYWJsZU1vdXNlRXZlbnRzIHtib29sZWFufVxuICAgKi9cbiAgZW5hYmxlTW91c2VFdmVudHM6IGZhbHNlLFxuXG4gIC8qKlxuICAgKiB3aW5kb3cgaW5zdGFuY2VcbiAgICogQHdpbmRvdyB7b2JqZWN0fVxuICAgKi9cbiAgd2luZG93OiB3aW5kb3csXG5cbiAgLyoqXG4gICAqIElmIGZhbHNlLCBzbGlkZXMgbG9yeSB0byB0aGUgZmlyc3Qgc2xpZGUgb24gd2luZG93IHJlc2l6ZS5cbiAgICogQHJld2luZE9uUmVzaXplIHtib29sZWFufVxuICAgKi9cbiAgcmV3aW5kT25SZXNpemU6IHRydWVcbn07XG5cbi8qKiovIH0pLFxuLyogMyAqL1xuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5cInVzZSBzdHJpY3RcIjtcbi8qIFdFQlBBQ0sgVkFSIElOSkVDVElPTiAqLyhmdW5jdGlvbihnbG9iYWwpIHtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gZGV0ZWN0UHJlZml4ZXM7XG4vKipcbiAqIERldGVjdGluZyBwcmVmaXhlcyBmb3Igc2F2aW5nIHRpbWUgYW5kIGJ5dGVzXG4gKi9cbmZ1bmN0aW9uIGRldGVjdFByZWZpeGVzKCkge1xuICAgIHZhciB0cmFuc2Zvcm0gPSB2b2lkIDA7XG4gICAgdmFyIHRyYW5zaXRpb24gPSB2b2lkIDA7XG4gICAgdmFyIHRyYW5zaXRpb25FbmQgPSB2b2lkIDA7XG4gICAgdmFyIGhhc1RyYW5zbGF0ZTNkID0gdm9pZCAwO1xuXG4gICAgKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnXycpO1xuICAgICAgICB2YXIgc3R5bGUgPSBlbC5zdHlsZTtcblxuICAgICAgICB2YXIgcHJvcCA9IHZvaWQgMDtcblxuICAgICAgICBpZiAoc3R5bGVbcHJvcCA9ICd3ZWJraXRUcmFuc2l0aW9uJ10gPT09ICcnKSB7XG4gICAgICAgICAgICB0cmFuc2l0aW9uRW5kID0gJ3dlYmtpdFRyYW5zaXRpb25FbmQnO1xuICAgICAgICAgICAgdHJhbnNpdGlvbiA9IHByb3A7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc3R5bGVbcHJvcCA9ICd0cmFuc2l0aW9uJ10gPT09ICcnKSB7XG4gICAgICAgICAgICB0cmFuc2l0aW9uRW5kID0gJ3RyYW5zaXRpb25lbmQnO1xuICAgICAgICAgICAgdHJhbnNpdGlvbiA9IHByb3A7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc3R5bGVbcHJvcCA9ICd3ZWJraXRUcmFuc2Zvcm0nXSA9PT0gJycpIHtcbiAgICAgICAgICAgIHRyYW5zZm9ybSA9IHByb3A7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc3R5bGVbcHJvcCA9ICdtc1RyYW5zZm9ybSddID09PSAnJykge1xuICAgICAgICAgICAgdHJhbnNmb3JtID0gcHJvcDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzdHlsZVtwcm9wID0gJ3RyYW5zZm9ybSddID09PSAnJykge1xuICAgICAgICAgICAgdHJhbnNmb3JtID0gcHJvcDtcbiAgICAgICAgfVxuXG4gICAgICAgIGRvY3VtZW50LmJvZHkuaW5zZXJ0QmVmb3JlKGVsLCBudWxsKTtcbiAgICAgICAgc3R5bGVbdHJhbnNmb3JtXSA9ICd0cmFuc2xhdGUzZCgwLCAwLCAwKSc7XG4gICAgICAgIGhhc1RyYW5zbGF0ZTNkID0gISFnbG9iYWwuZ2V0Q29tcHV0ZWRTdHlsZShlbCkuZ2V0UHJvcGVydHlWYWx1ZSh0cmFuc2Zvcm0pO1xuICAgICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGVsKTtcbiAgICB9KSgpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgdHJhbnNmb3JtOiB0cmFuc2Zvcm0sXG4gICAgICAgIHRyYW5zaXRpb246IHRyYW5zaXRpb24sXG4gICAgICAgIHRyYW5zaXRpb25FbmQ6IHRyYW5zaXRpb25FbmQsXG4gICAgICAgIGhhc1RyYW5zbGF0ZTNkOiBoYXNUcmFuc2xhdGUzZFxuICAgIH07XG59XG4vKiBXRUJQQUNLIFZBUiBJTkpFQ1RJT04gKi99LmNhbGwoZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXygwKSkpXG5cbi8qKiovIH0pLFxuLyogNCAqL1xuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5cInVzZSBzdHJpY3RcIjtcblxuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSBkaXNwYXRjaEV2ZW50O1xuXG52YXIgX2N1c3RvbUV2ZW50ID0gX193ZWJwYWNrX3JlcXVpcmVfXyg1KTtcblxudmFyIF9jdXN0b21FdmVudDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9jdXN0b21FdmVudCk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbi8qKlxuICogZGlzcGF0Y2ggY3VzdG9tIGV2ZW50c1xuICpcbiAqIEBwYXJhbSAge2VsZW1lbnR9IGVsICAgICAgICAgc2xpZGVzaG93IGVsZW1lbnRcbiAqIEBwYXJhbSAge3N0cmluZ30gIHR5cGUgICAgICAgY3VzdG9tIGV2ZW50IG5hbWVcbiAqIEBwYXJhbSAge29iamVjdH0gIGRldGFpbCAgICAgY3VzdG9tIGRldGFpbCBpbmZvcm1hdGlvblxuICovXG5mdW5jdGlvbiBkaXNwYXRjaEV2ZW50KHRhcmdldCwgdHlwZSwgZGV0YWlsKSB7XG4gICAgdmFyIGV2ZW50ID0gbmV3IF9jdXN0b21FdmVudDIuZGVmYXVsdCh0eXBlLCB7XG4gICAgICAgIGJ1YmJsZXM6IHRydWUsXG4gICAgICAgIGNhbmNlbGFibGU6IHRydWUsXG4gICAgICAgIGRldGFpbDogZGV0YWlsXG4gICAgfSk7XG5cbiAgICB0YXJnZXQuZGlzcGF0Y2hFdmVudChldmVudCk7XG59XG5cbi8qKiovIH0pLFxuLyogNSAqL1xuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG4vKiBXRUJQQUNLIFZBUiBJTkpFQ1RJT04gKi8oZnVuY3Rpb24oZ2xvYmFsKSB7XG52YXIgTmF0aXZlQ3VzdG9tRXZlbnQgPSBnbG9iYWwuQ3VzdG9tRXZlbnQ7XG5cbmZ1bmN0aW9uIHVzZU5hdGl2ZSAoKSB7XG4gIHRyeSB7XG4gICAgdmFyIHAgPSBuZXcgTmF0aXZlQ3VzdG9tRXZlbnQoJ2NhdCcsIHsgZGV0YWlsOiB7IGZvbzogJ2JhcicgfSB9KTtcbiAgICByZXR1cm4gICdjYXQnID09PSBwLnR5cGUgJiYgJ2JhcicgPT09IHAuZGV0YWlsLmZvbztcbiAgfSBjYXRjaCAoZSkge1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuLyoqXG4gKiBDcm9zcy1icm93c2VyIGBDdXN0b21FdmVudGAgY29uc3RydWN0b3IuXG4gKlxuICogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0N1c3RvbUV2ZW50LkN1c3RvbUV2ZW50XG4gKlxuICogQHB1YmxpY1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gdXNlTmF0aXZlKCkgPyBOYXRpdmVDdXN0b21FdmVudCA6XG5cbi8vIElFID49IDlcbid1bmRlZmluZWQnICE9PSB0eXBlb2YgZG9jdW1lbnQgJiYgJ2Z1bmN0aW9uJyA9PT0gdHlwZW9mIGRvY3VtZW50LmNyZWF0ZUV2ZW50ID8gZnVuY3Rpb24gQ3VzdG9tRXZlbnQgKHR5cGUsIHBhcmFtcykge1xuICB2YXIgZSA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdDdXN0b21FdmVudCcpO1xuICBpZiAocGFyYW1zKSB7XG4gICAgZS5pbml0Q3VzdG9tRXZlbnQodHlwZSwgcGFyYW1zLmJ1YmJsZXMsIHBhcmFtcy5jYW5jZWxhYmxlLCBwYXJhbXMuZGV0YWlsKTtcbiAgfSBlbHNlIHtcbiAgICBlLmluaXRDdXN0b21FdmVudCh0eXBlLCBmYWxzZSwgZmFsc2UsIHZvaWQgMCk7XG4gIH1cbiAgcmV0dXJuIGU7XG59IDpcblxuLy8gSUUgPD0gOFxuZnVuY3Rpb24gQ3VzdG9tRXZlbnQgKHR5cGUsIHBhcmFtcykge1xuICB2YXIgZSA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50T2JqZWN0KCk7XG4gIGUudHlwZSA9IHR5cGU7XG4gIGlmIChwYXJhbXMpIHtcbiAgICBlLmJ1YmJsZXMgPSBCb29sZWFuKHBhcmFtcy5idWJibGVzKTtcbiAgICBlLmNhbmNlbGFibGUgPSBCb29sZWFuKHBhcmFtcy5jYW5jZWxhYmxlKTtcbiAgICBlLmRldGFpbCA9IHBhcmFtcy5kZXRhaWw7XG4gIH0gZWxzZSB7XG4gICAgZS5idWJibGVzID0gZmFsc2U7XG4gICAgZS5jYW5jZWxhYmxlID0gZmFsc2U7XG4gICAgZS5kZXRhaWwgPSB2b2lkIDA7XG4gIH1cbiAgcmV0dXJuIGU7XG59XG5cbi8qIFdFQlBBQ0sgVkFSIElOSkVDVElPTiAqL30uY2FsbChleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKDApKSlcblxuLyoqKi8gfSksXG4vKiA2ICovLFxuLyogNyAqL1xuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5tb2R1bGUuZXhwb3J0cyA9IF9fd2VicGFja19yZXF1aXJlX18oMSk7XG5cblxuLyoqKi8gfSlcbi8qKioqKiovIF0pO1xufSk7IiwiLyoqXG4gKiBsb2Rhc2ggKEN1c3RvbSBCdWlsZCkgPGh0dHBzOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIGV4cG9ydHM9XCJucG1cIiAtbyAuL2BcbiAqIENvcHlyaWdodCBqUXVlcnkgRm91bmRhdGlvbiBhbmQgb3RoZXIgY29udHJpYnV0b3JzIDxodHRwczovL2pxdWVyeS5vcmcvPlxuICogUmVsZWFzZWQgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHBzOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjguMyA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICovXG5cbi8qKiBVc2VkIGFzIHRoZSBgVHlwZUVycm9yYCBtZXNzYWdlIGZvciBcIkZ1bmN0aW9uc1wiIG1ldGhvZHMuICovXG52YXIgRlVOQ19FUlJPUl9URVhUID0gJ0V4cGVjdGVkIGEgZnVuY3Rpb24nO1xuXG4vKiogVXNlZCBhcyByZWZlcmVuY2VzIGZvciB2YXJpb3VzIGBOdW1iZXJgIGNvbnN0YW50cy4gKi9cbnZhciBOQU4gPSAwIC8gMDtcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIHN5bWJvbFRhZyA9ICdbb2JqZWN0IFN5bWJvbF0nO1xuXG4vKiogVXNlZCB0byBtYXRjaCBsZWFkaW5nIGFuZCB0cmFpbGluZyB3aGl0ZXNwYWNlLiAqL1xudmFyIHJlVHJpbSA9IC9eXFxzK3xcXHMrJC9nO1xuXG4vKiogVXNlZCB0byBkZXRlY3QgYmFkIHNpZ25lZCBoZXhhZGVjaW1hbCBzdHJpbmcgdmFsdWVzLiAqL1xudmFyIHJlSXNCYWRIZXggPSAvXlstK10weFswLTlhLWZdKyQvaTtcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IGJpbmFyeSBzdHJpbmcgdmFsdWVzLiAqL1xudmFyIHJlSXNCaW5hcnkgPSAvXjBiWzAxXSskL2k7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBvY3RhbCBzdHJpbmcgdmFsdWVzLiAqL1xudmFyIHJlSXNPY3RhbCA9IC9eMG9bMC03XSskL2k7XG5cbi8qKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyB3aXRob3V0IGEgZGVwZW5kZW5jeSBvbiBgcm9vdGAuICovXG52YXIgZnJlZVBhcnNlSW50ID0gcGFyc2VJbnQ7XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgZ2xvYmFsYCBmcm9tIE5vZGUuanMuICovXG52YXIgZnJlZUdsb2JhbCA9IHR5cGVvZiBnbG9iYWwgPT0gJ29iamVjdCcgJiYgZ2xvYmFsICYmIGdsb2JhbC5PYmplY3QgPT09IE9iamVjdCAmJiBnbG9iYWw7XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgc2VsZmAuICovXG52YXIgZnJlZVNlbGYgPSB0eXBlb2Ygc2VsZiA9PSAnb2JqZWN0JyAmJiBzZWxmICYmIHNlbGYuT2JqZWN0ID09PSBPYmplY3QgJiYgc2VsZjtcblxuLyoqIFVzZWQgYXMgYSByZWZlcmVuY2UgdG8gdGhlIGdsb2JhbCBvYmplY3QuICovXG52YXIgcm9vdCA9IGZyZWVHbG9iYWwgfHwgZnJlZVNlbGYgfHwgRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqXG4gKiBVc2VkIHRvIHJlc29sdmUgdGhlXG4gKiBbYHRvU3RyaW5nVGFnYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtb2JqZWN0LnByb3RvdHlwZS50b3N0cmluZylcbiAqIG9mIHZhbHVlcy5cbiAqL1xudmFyIG9iamVjdFRvU3RyaW5nID0gb2JqZWN0UHJvdG8udG9TdHJpbmc7XG5cbi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIGZvciB0aG9zZSB3aXRoIHRoZSBzYW1lIG5hbWUgYXMgb3RoZXIgYGxvZGFzaGAgbWV0aG9kcy4gKi9cbnZhciBuYXRpdmVNYXggPSBNYXRoLm1heCxcbiAgICBuYXRpdmVNaW4gPSBNYXRoLm1pbjtcblxuLyoqXG4gKiBHZXRzIHRoZSB0aW1lc3RhbXAgb2YgdGhlIG51bWJlciBvZiBtaWxsaXNlY29uZHMgdGhhdCBoYXZlIGVsYXBzZWQgc2luY2VcbiAqIHRoZSBVbml4IGVwb2NoICgxIEphbnVhcnkgMTk3MCAwMDowMDowMCBVVEMpLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMi40LjBcbiAqIEBjYXRlZ29yeSBEYXRlXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBSZXR1cm5zIHRoZSB0aW1lc3RhbXAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uZGVmZXIoZnVuY3Rpb24oc3RhbXApIHtcbiAqICAgY29uc29sZS5sb2coXy5ub3coKSAtIHN0YW1wKTtcbiAqIH0sIF8ubm93KCkpO1xuICogLy8gPT4gTG9ncyB0aGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBpdCB0b29rIGZvciB0aGUgZGVmZXJyZWQgaW52b2NhdGlvbi5cbiAqL1xudmFyIG5vdyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gcm9vdC5EYXRlLm5vdygpO1xufTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgZGVib3VuY2VkIGZ1bmN0aW9uIHRoYXQgZGVsYXlzIGludm9raW5nIGBmdW5jYCB1bnRpbCBhZnRlciBgd2FpdGBcbiAqIG1pbGxpc2Vjb25kcyBoYXZlIGVsYXBzZWQgc2luY2UgdGhlIGxhc3QgdGltZSB0aGUgZGVib3VuY2VkIGZ1bmN0aW9uIHdhc1xuICogaW52b2tlZC4gVGhlIGRlYm91bmNlZCBmdW5jdGlvbiBjb21lcyB3aXRoIGEgYGNhbmNlbGAgbWV0aG9kIHRvIGNhbmNlbFxuICogZGVsYXllZCBgZnVuY2AgaW52b2NhdGlvbnMgYW5kIGEgYGZsdXNoYCBtZXRob2QgdG8gaW1tZWRpYXRlbHkgaW52b2tlIHRoZW0uXG4gKiBQcm92aWRlIGBvcHRpb25zYCB0byBpbmRpY2F0ZSB3aGV0aGVyIGBmdW5jYCBzaG91bGQgYmUgaW52b2tlZCBvbiB0aGVcbiAqIGxlYWRpbmcgYW5kL29yIHRyYWlsaW5nIGVkZ2Ugb2YgdGhlIGB3YWl0YCB0aW1lb3V0LiBUaGUgYGZ1bmNgIGlzIGludm9rZWRcbiAqIHdpdGggdGhlIGxhc3QgYXJndW1lbnRzIHByb3ZpZGVkIHRvIHRoZSBkZWJvdW5jZWQgZnVuY3Rpb24uIFN1YnNlcXVlbnRcbiAqIGNhbGxzIHRvIHRoZSBkZWJvdW5jZWQgZnVuY3Rpb24gcmV0dXJuIHRoZSByZXN1bHQgb2YgdGhlIGxhc3QgYGZ1bmNgXG4gKiBpbnZvY2F0aW9uLlxuICpcbiAqICoqTm90ZToqKiBJZiBgbGVhZGluZ2AgYW5kIGB0cmFpbGluZ2Agb3B0aW9ucyBhcmUgYHRydWVgLCBgZnVuY2AgaXNcbiAqIGludm9rZWQgb24gdGhlIHRyYWlsaW5nIGVkZ2Ugb2YgdGhlIHRpbWVvdXQgb25seSBpZiB0aGUgZGVib3VuY2VkIGZ1bmN0aW9uXG4gKiBpcyBpbnZva2VkIG1vcmUgdGhhbiBvbmNlIGR1cmluZyB0aGUgYHdhaXRgIHRpbWVvdXQuXG4gKlxuICogSWYgYHdhaXRgIGlzIGAwYCBhbmQgYGxlYWRpbmdgIGlzIGBmYWxzZWAsIGBmdW5jYCBpbnZvY2F0aW9uIGlzIGRlZmVycmVkXG4gKiB1bnRpbCB0byB0aGUgbmV4dCB0aWNrLCBzaW1pbGFyIHRvIGBzZXRUaW1lb3V0YCB3aXRoIGEgdGltZW91dCBvZiBgMGAuXG4gKlxuICogU2VlIFtEYXZpZCBDb3JiYWNobydzIGFydGljbGVdKGh0dHBzOi8vY3NzLXRyaWNrcy5jb20vZGVib3VuY2luZy10aHJvdHRsaW5nLWV4cGxhaW5lZC1leGFtcGxlcy8pXG4gKiBmb3IgZGV0YWlscyBvdmVyIHRoZSBkaWZmZXJlbmNlcyBiZXR3ZWVuIGBfLmRlYm91bmNlYCBhbmQgYF8udGhyb3R0bGVgLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBjYXRlZ29yeSBGdW5jdGlvblxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gZGVib3VuY2UuXG4gKiBAcGFyYW0ge251bWJlcn0gW3dhaXQ9MF0gVGhlIG51bWJlciBvZiBtaWxsaXNlY29uZHMgdG8gZGVsYXkuXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnM9e31dIFRoZSBvcHRpb25zIG9iamVjdC5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMubGVhZGluZz1mYWxzZV1cbiAqICBTcGVjaWZ5IGludm9raW5nIG9uIHRoZSBsZWFkaW5nIGVkZ2Ugb2YgdGhlIHRpbWVvdXQuXG4gKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMubWF4V2FpdF1cbiAqICBUaGUgbWF4aW11bSB0aW1lIGBmdW5jYCBpcyBhbGxvd2VkIHRvIGJlIGRlbGF5ZWQgYmVmb3JlIGl0J3MgaW52b2tlZC5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMudHJhaWxpbmc9dHJ1ZV1cbiAqICBTcGVjaWZ5IGludm9raW5nIG9uIHRoZSB0cmFpbGluZyBlZGdlIG9mIHRoZSB0aW1lb3V0LlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgZGVib3VuY2VkIGZ1bmN0aW9uLlxuICogQGV4YW1wbGVcbiAqXG4gKiAvLyBBdm9pZCBjb3N0bHkgY2FsY3VsYXRpb25zIHdoaWxlIHRoZSB3aW5kb3cgc2l6ZSBpcyBpbiBmbHV4LlxuICogalF1ZXJ5KHdpbmRvdykub24oJ3Jlc2l6ZScsIF8uZGVib3VuY2UoY2FsY3VsYXRlTGF5b3V0LCAxNTApKTtcbiAqXG4gKiAvLyBJbnZva2UgYHNlbmRNYWlsYCB3aGVuIGNsaWNrZWQsIGRlYm91bmNpbmcgc3Vic2VxdWVudCBjYWxscy5cbiAqIGpRdWVyeShlbGVtZW50KS5vbignY2xpY2snLCBfLmRlYm91bmNlKHNlbmRNYWlsLCAzMDAsIHtcbiAqICAgJ2xlYWRpbmcnOiB0cnVlLFxuICogICAndHJhaWxpbmcnOiBmYWxzZVxuICogfSkpO1xuICpcbiAqIC8vIEVuc3VyZSBgYmF0Y2hMb2dgIGlzIGludm9rZWQgb25jZSBhZnRlciAxIHNlY29uZCBvZiBkZWJvdW5jZWQgY2FsbHMuXG4gKiB2YXIgZGVib3VuY2VkID0gXy5kZWJvdW5jZShiYXRjaExvZywgMjUwLCB7ICdtYXhXYWl0JzogMTAwMCB9KTtcbiAqIHZhciBzb3VyY2UgPSBuZXcgRXZlbnRTb3VyY2UoJy9zdHJlYW0nKTtcbiAqIGpRdWVyeShzb3VyY2UpLm9uKCdtZXNzYWdlJywgZGVib3VuY2VkKTtcbiAqXG4gKiAvLyBDYW5jZWwgdGhlIHRyYWlsaW5nIGRlYm91bmNlZCBpbnZvY2F0aW9uLlxuICogalF1ZXJ5KHdpbmRvdykub24oJ3BvcHN0YXRlJywgZGVib3VuY2VkLmNhbmNlbCk7XG4gKi9cbmZ1bmN0aW9uIGRlYm91bmNlKGZ1bmMsIHdhaXQsIG9wdGlvbnMpIHtcbiAgdmFyIGxhc3RBcmdzLFxuICAgICAgbGFzdFRoaXMsXG4gICAgICBtYXhXYWl0LFxuICAgICAgcmVzdWx0LFxuICAgICAgdGltZXJJZCxcbiAgICAgIGxhc3RDYWxsVGltZSxcbiAgICAgIGxhc3RJbnZva2VUaW1lID0gMCxcbiAgICAgIGxlYWRpbmcgPSBmYWxzZSxcbiAgICAgIG1heGluZyA9IGZhbHNlLFxuICAgICAgdHJhaWxpbmcgPSB0cnVlO1xuXG4gIGlmICh0eXBlb2YgZnVuYyAhPSAnZnVuY3Rpb24nKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihGVU5DX0VSUk9SX1RFWFQpO1xuICB9XG4gIHdhaXQgPSB0b051bWJlcih3YWl0KSB8fCAwO1xuICBpZiAoaXNPYmplY3Qob3B0aW9ucykpIHtcbiAgICBsZWFkaW5nID0gISFvcHRpb25zLmxlYWRpbmc7XG4gICAgbWF4aW5nID0gJ21heFdhaXQnIGluIG9wdGlvbnM7XG4gICAgbWF4V2FpdCA9IG1heGluZyA/IG5hdGl2ZU1heCh0b051bWJlcihvcHRpb25zLm1heFdhaXQpIHx8IDAsIHdhaXQpIDogbWF4V2FpdDtcbiAgICB0cmFpbGluZyA9ICd0cmFpbGluZycgaW4gb3B0aW9ucyA/ICEhb3B0aW9ucy50cmFpbGluZyA6IHRyYWlsaW5nO1xuICB9XG5cbiAgZnVuY3Rpb24gaW52b2tlRnVuYyh0aW1lKSB7XG4gICAgdmFyIGFyZ3MgPSBsYXN0QXJncyxcbiAgICAgICAgdGhpc0FyZyA9IGxhc3RUaGlzO1xuXG4gICAgbGFzdEFyZ3MgPSBsYXN0VGhpcyA9IHVuZGVmaW5lZDtcbiAgICBsYXN0SW52b2tlVGltZSA9IHRpbWU7XG4gICAgcmVzdWx0ID0gZnVuYy5hcHBseSh0aGlzQXJnLCBhcmdzKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgZnVuY3Rpb24gbGVhZGluZ0VkZ2UodGltZSkge1xuICAgIC8vIFJlc2V0IGFueSBgbWF4V2FpdGAgdGltZXIuXG4gICAgbGFzdEludm9rZVRpbWUgPSB0aW1lO1xuICAgIC8vIFN0YXJ0IHRoZSB0aW1lciBmb3IgdGhlIHRyYWlsaW5nIGVkZ2UuXG4gICAgdGltZXJJZCA9IHNldFRpbWVvdXQodGltZXJFeHBpcmVkLCB3YWl0KTtcbiAgICAvLyBJbnZva2UgdGhlIGxlYWRpbmcgZWRnZS5cbiAgICByZXR1cm4gbGVhZGluZyA/IGludm9rZUZ1bmModGltZSkgOiByZXN1bHQ7XG4gIH1cblxuICBmdW5jdGlvbiByZW1haW5pbmdXYWl0KHRpbWUpIHtcbiAgICB2YXIgdGltZVNpbmNlTGFzdENhbGwgPSB0aW1lIC0gbGFzdENhbGxUaW1lLFxuICAgICAgICB0aW1lU2luY2VMYXN0SW52b2tlID0gdGltZSAtIGxhc3RJbnZva2VUaW1lLFxuICAgICAgICByZXN1bHQgPSB3YWl0IC0gdGltZVNpbmNlTGFzdENhbGw7XG5cbiAgICByZXR1cm4gbWF4aW5nID8gbmF0aXZlTWluKHJlc3VsdCwgbWF4V2FpdCAtIHRpbWVTaW5jZUxhc3RJbnZva2UpIDogcmVzdWx0O1xuICB9XG5cbiAgZnVuY3Rpb24gc2hvdWxkSW52b2tlKHRpbWUpIHtcbiAgICB2YXIgdGltZVNpbmNlTGFzdENhbGwgPSB0aW1lIC0gbGFzdENhbGxUaW1lLFxuICAgICAgICB0aW1lU2luY2VMYXN0SW52b2tlID0gdGltZSAtIGxhc3RJbnZva2VUaW1lO1xuXG4gICAgLy8gRWl0aGVyIHRoaXMgaXMgdGhlIGZpcnN0IGNhbGwsIGFjdGl2aXR5IGhhcyBzdG9wcGVkIGFuZCB3ZSdyZSBhdCB0aGVcbiAgICAvLyB0cmFpbGluZyBlZGdlLCB0aGUgc3lzdGVtIHRpbWUgaGFzIGdvbmUgYmFja3dhcmRzIGFuZCB3ZSdyZSB0cmVhdGluZ1xuICAgIC8vIGl0IGFzIHRoZSB0cmFpbGluZyBlZGdlLCBvciB3ZSd2ZSBoaXQgdGhlIGBtYXhXYWl0YCBsaW1pdC5cbiAgICByZXR1cm4gKGxhc3RDYWxsVGltZSA9PT0gdW5kZWZpbmVkIHx8ICh0aW1lU2luY2VMYXN0Q2FsbCA+PSB3YWl0KSB8fFxuICAgICAgKHRpbWVTaW5jZUxhc3RDYWxsIDwgMCkgfHwgKG1heGluZyAmJiB0aW1lU2luY2VMYXN0SW52b2tlID49IG1heFdhaXQpKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHRpbWVyRXhwaXJlZCgpIHtcbiAgICB2YXIgdGltZSA9IG5vdygpO1xuICAgIGlmIChzaG91bGRJbnZva2UodGltZSkpIHtcbiAgICAgIHJldHVybiB0cmFpbGluZ0VkZ2UodGltZSk7XG4gICAgfVxuICAgIC8vIFJlc3RhcnQgdGhlIHRpbWVyLlxuICAgIHRpbWVySWQgPSBzZXRUaW1lb3V0KHRpbWVyRXhwaXJlZCwgcmVtYWluaW5nV2FpdCh0aW1lKSk7XG4gIH1cblxuICBmdW5jdGlvbiB0cmFpbGluZ0VkZ2UodGltZSkge1xuICAgIHRpbWVySWQgPSB1bmRlZmluZWQ7XG5cbiAgICAvLyBPbmx5IGludm9rZSBpZiB3ZSBoYXZlIGBsYXN0QXJnc2Agd2hpY2ggbWVhbnMgYGZ1bmNgIGhhcyBiZWVuXG4gICAgLy8gZGVib3VuY2VkIGF0IGxlYXN0IG9uY2UuXG4gICAgaWYgKHRyYWlsaW5nICYmIGxhc3RBcmdzKSB7XG4gICAgICByZXR1cm4gaW52b2tlRnVuYyh0aW1lKTtcbiAgICB9XG4gICAgbGFzdEFyZ3MgPSBsYXN0VGhpcyA9IHVuZGVmaW5lZDtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgZnVuY3Rpb24gY2FuY2VsKCkge1xuICAgIGlmICh0aW1lcklkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aW1lcklkKTtcbiAgICB9XG4gICAgbGFzdEludm9rZVRpbWUgPSAwO1xuICAgIGxhc3RBcmdzID0gbGFzdENhbGxUaW1lID0gbGFzdFRoaXMgPSB0aW1lcklkID0gdW5kZWZpbmVkO1xuICB9XG5cbiAgZnVuY3Rpb24gZmx1c2goKSB7XG4gICAgcmV0dXJuIHRpbWVySWQgPT09IHVuZGVmaW5lZCA/IHJlc3VsdCA6IHRyYWlsaW5nRWRnZShub3coKSk7XG4gIH1cblxuICBmdW5jdGlvbiBkZWJvdW5jZWQoKSB7XG4gICAgdmFyIHRpbWUgPSBub3coKSxcbiAgICAgICAgaXNJbnZva2luZyA9IHNob3VsZEludm9rZSh0aW1lKTtcblxuICAgIGxhc3RBcmdzID0gYXJndW1lbnRzO1xuICAgIGxhc3RUaGlzID0gdGhpcztcbiAgICBsYXN0Q2FsbFRpbWUgPSB0aW1lO1xuXG4gICAgaWYgKGlzSW52b2tpbmcpIHtcbiAgICAgIGlmICh0aW1lcklkID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIGxlYWRpbmdFZGdlKGxhc3RDYWxsVGltZSk7XG4gICAgICB9XG4gICAgICBpZiAobWF4aW5nKSB7XG4gICAgICAgIC8vIEhhbmRsZSBpbnZvY2F0aW9ucyBpbiBhIHRpZ2h0IGxvb3AuXG4gICAgICAgIHRpbWVySWQgPSBzZXRUaW1lb3V0KHRpbWVyRXhwaXJlZCwgd2FpdCk7XG4gICAgICAgIHJldHVybiBpbnZva2VGdW5jKGxhc3RDYWxsVGltZSk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICh0aW1lcklkID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRpbWVySWQgPSBzZXRUaW1lb3V0KHRpbWVyRXhwaXJlZCwgd2FpdCk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbiAgZGVib3VuY2VkLmNhbmNlbCA9IGNhbmNlbDtcbiAgZGVib3VuY2VkLmZsdXNoID0gZmx1c2g7XG4gIHJldHVybiBkZWJvdW5jZWQ7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgdGhlXG4gKiBbbGFuZ3VhZ2UgdHlwZV0oaHR0cDovL3d3dy5lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLWVjbWFzY3JpcHQtbGFuZ3VhZ2UtdHlwZXMpXG4gKiBvZiBgT2JqZWN0YC4gKGUuZy4gYXJyYXlzLCBmdW5jdGlvbnMsIG9iamVjdHMsIHJlZ2V4ZXMsIGBuZXcgTnVtYmVyKDApYCwgYW5kIGBuZXcgU3RyaW5nKCcnKWApXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYW4gb2JqZWN0LCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNPYmplY3Qoe30pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3QoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0KF8ubm9vcCk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdChudWxsKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzT2JqZWN0KHZhbHVlKSB7XG4gIHZhciB0eXBlID0gdHlwZW9mIHZhbHVlO1xuICByZXR1cm4gISF2YWx1ZSAmJiAodHlwZSA9PSAnb2JqZWN0JyB8fCB0eXBlID09ICdmdW5jdGlvbicpO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIG9iamVjdC1saWtlLiBBIHZhbHVlIGlzIG9iamVjdC1saWtlIGlmIGl0J3Mgbm90IGBudWxsYFxuICogYW5kIGhhcyBhIGB0eXBlb2ZgIHJlc3VsdCBvZiBcIm9iamVjdFwiLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIG9iamVjdC1saWtlLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKHt9KTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZShbMSwgMiwgM10pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKF8ubm9vcCk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKG51bGwpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNPYmplY3RMaWtlKHZhbHVlKSB7XG4gIHJldHVybiAhIXZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PSAnb2JqZWN0Jztcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBjbGFzc2lmaWVkIGFzIGEgYFN5bWJvbGAgcHJpbWl0aXZlIG9yIG9iamVjdC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHN5bWJvbCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzU3ltYm9sKFN5bWJvbC5pdGVyYXRvcik7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc1N5bWJvbCgnYWJjJyk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1N5bWJvbCh2YWx1ZSkge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09ICdzeW1ib2wnIHx8XG4gICAgKGlzT2JqZWN0TGlrZSh2YWx1ZSkgJiYgb2JqZWN0VG9TdHJpbmcuY2FsbCh2YWx1ZSkgPT0gc3ltYm9sVGFnKTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBgdmFsdWVgIHRvIGEgbnVtYmVyLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBwcm9jZXNzLlxuICogQHJldHVybnMge251bWJlcn0gUmV0dXJucyB0aGUgbnVtYmVyLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLnRvTnVtYmVyKDMuMik7XG4gKiAvLyA9PiAzLjJcbiAqXG4gKiBfLnRvTnVtYmVyKE51bWJlci5NSU5fVkFMVUUpO1xuICogLy8gPT4gNWUtMzI0XG4gKlxuICogXy50b051bWJlcihJbmZpbml0eSk7XG4gKiAvLyA9PiBJbmZpbml0eVxuICpcbiAqIF8udG9OdW1iZXIoJzMuMicpO1xuICogLy8gPT4gMy4yXG4gKi9cbmZ1bmN0aW9uIHRvTnVtYmVyKHZhbHVlKSB7XG4gIGlmICh0eXBlb2YgdmFsdWUgPT0gJ251bWJlcicpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cbiAgaWYgKGlzU3ltYm9sKHZhbHVlKSkge1xuICAgIHJldHVybiBOQU47XG4gIH1cbiAgaWYgKGlzT2JqZWN0KHZhbHVlKSkge1xuICAgIHZhciBvdGhlciA9IHR5cGVvZiB2YWx1ZS52YWx1ZU9mID09ICdmdW5jdGlvbicgPyB2YWx1ZS52YWx1ZU9mKCkgOiB2YWx1ZTtcbiAgICB2YWx1ZSA9IGlzT2JqZWN0KG90aGVyKSA/IChvdGhlciArICcnKSA6IG90aGVyO1xuICB9XG4gIGlmICh0eXBlb2YgdmFsdWUgIT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gdmFsdWUgPT09IDAgPyB2YWx1ZSA6ICt2YWx1ZTtcbiAgfVxuICB2YWx1ZSA9IHZhbHVlLnJlcGxhY2UocmVUcmltLCAnJyk7XG4gIHZhciBpc0JpbmFyeSA9IHJlSXNCaW5hcnkudGVzdCh2YWx1ZSk7XG4gIHJldHVybiAoaXNCaW5hcnkgfHwgcmVJc09jdGFsLnRlc3QodmFsdWUpKVxuICAgID8gZnJlZVBhcnNlSW50KHZhbHVlLnNsaWNlKDIpLCBpc0JpbmFyeSA/IDIgOiA4KVxuICAgIDogKHJlSXNCYWRIZXgudGVzdCh2YWx1ZSkgPyBOQU4gOiArdmFsdWUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGRlYm91bmNlO1xuIl19
