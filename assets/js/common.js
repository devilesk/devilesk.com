require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({41:[function(require,module,exports){
function shuffle(array) {
    var counter = array.length,
        temp, index;

    // While there are elements in the array
    while (counter > 0) {
        // Pick a random index
        index = Math.floor(Math.random() * counter);

        // Decrease counter by 1
        counter--;

        // And swap the last element with it
        temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }

    return array;
};

module.exports = shuffle;
},{}],39:[function(require,module,exports){
function getJSON(url, callback, err) {
  var request = new XMLHttpRequest();
  request.open('GET', url, true);

  request.onload = function() {
    if (request.status >= 200 && request.status < 400) {
      // Success!
      var data = JSON.parse(request.responseText);
      callback(data);
    } else {
      // We reached our target server, but it returned an error
      if (err) err();
    }
  };

  request.onerror = function() {
    // There was a connection error of some sort
    if (err) err();
  };

  request.send();
}

module.exports = getJSON;
},{}],38:[function(require,module,exports){
function fadeOut(el) {
    var opacity = 1;

    el.style.opacity = 1;
    el.style.filter = '';

    var last = +new Date();
    var tick = function() {
        opacity -= (new Date() - last) / 400;
        el.style.opacity = opacity;
        el.style.filter = 'alpha(opacity=' + (100 * opacity)|1 + ')';

        last = +new Date();

        if (opacity > 0) {
            (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16);
        }
    };

    tick();
}

module.exports = fadeOut;
},{}],1:[function(require,module,exports){
(function (global){
// Native Javascript for Bootstrap 3 v2.0.21 | © dnp_theme | MIT-License
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD support:
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like:
    module.exports = factory();
  } else {
    // Browser globals (root is window)
    var bsn = factory();
    root.Affix = bsn.Affix;
    root.Alert = bsn.Alert;
    root.Button = bsn.Button;
    root.Carousel = bsn.Carousel;
    root.Collapse = bsn.Collapse;
    root.Dropdown = bsn.Dropdown;
    root.Modal = bsn.Modal;
    root.Popover = bsn.Popover;
    root.ScrollSpy = bsn.ScrollSpy;
    root.Tab = bsn.Tab;
    root.Tooltip = bsn.Tooltip;
  }
}(this, function () {
  
  /* Native Javascript for Bootstrap 3 | Internal Utility Functions
  ----------------------------------------------------------------*/
  "use strict";
  
  // globals
  var globalObject = typeof global !== 'undefined' ? global : this||window,
    DOC = document, HTML = DOC.documentElement, body = 'body', // allow the library to be used in <head>
  
    // Native Javascript for Bootstrap Global Object
    BSN = globalObject.BSN = {},
    supports = BSN.supports = [],
  
    // function toggle attributes
    dataToggle    = 'data-toggle',
    dataDismiss   = 'data-dismiss',
    dataSpy       = 'data-spy',
    dataRide      = 'data-ride',
    
    // components
    stringAffix     = 'Affix',
    stringAlert     = 'Alert',
    stringButton    = 'Button',
    stringCarousel  = 'Carousel',
    stringCollapse  = 'Collapse',
    stringDropdown  = 'Dropdown',
    stringModal     = 'Modal',
    stringPopover   = 'Popover',
    stringScrollSpy = 'ScrollSpy',
    stringTab       = 'Tab',
    stringTooltip   = 'Tooltip',
  
    // options DATA API
    databackdrop      = 'data-backdrop',
    dataKeyboard      = 'data-keyboard',
    dataTarget        = 'data-target',
    dataInterval      = 'data-interval',
    dataHeight        = 'data-height',
    dataPause         = 'data-pause',
    dataTitle         = 'data-title',  
    dataOriginalTitle = 'data-original-title',
    dataOriginalText  = 'data-original-text',
    dataDismissible   = 'data-dismissible',
    dataTrigger       = 'data-trigger',
    dataAnimation     = 'data-animation',
    dataContainer     = 'data-container',
    dataPlacement     = 'data-placement',
    dataDelay         = 'data-delay',
    dataOffsetTop     = 'data-offset-top',
    dataOffsetBottom  = 'data-offset-bottom',
  
    // option keys
    backdrop = 'backdrop', keyboard = 'keyboard', delay = 'delay',
    content = 'content', target = 'target', 
    interval = 'interval', pause = 'pause', animation = 'animation',
    placement = 'placement', container = 'container', 
  
    // box model
    offsetTop    = 'offsetTop',      offsetBottom   = 'offsetBottom',
    offsetLeft   = 'offsetLeft',
    scrollTop    = 'scrollTop',      scrollLeft     = 'scrollLeft',
    clientWidth  = 'clientWidth',    clientHeight   = 'clientHeight',
    offsetWidth  = 'offsetWidth',    offsetHeight   = 'offsetHeight',
    innerWidth   = 'innerWidth',     innerHeight    = 'innerHeight',
    scrollHeight = 'scrollHeight',   height         = 'height',
  
    // aria
    ariaExpanded = 'aria-expanded',
    ariaHidden   = 'aria-hidden',
  
    // event names
    clickEvent    = 'click',
    hoverEvent    = 'hover',
    keydownEvent  = 'keydown',
    keyupEvent    = 'keyup',  
    resizeEvent   = 'resize',
    scrollEvent   = 'scroll',
    // originalEvents
    showEvent     = 'show',
    shownEvent    = 'shown',
    hideEvent     = 'hide',
    hiddenEvent   = 'hidden',
    closeEvent    = 'close',
    closedEvent   = 'closed',
    slidEvent     = 'slid',
    slideEvent    = 'slide',
    changeEvent   = 'change',
  
    // other
    getAttribute           = 'getAttribute',
    setAttribute           = 'setAttribute',
    hasAttribute           = 'hasAttribute',
    createElement          = 'createElement',
    appendChild            = 'appendChild',
    innerHTML              = 'innerHTML',
    getElementsByTagName   = 'getElementsByTagName',
    preventDefault         = 'preventDefault',
    getBoundingClientRect  = 'getBoundingClientRect',
    querySelectorAll       = 'querySelectorAll',
    getElementsByCLASSNAME = 'getElementsByClassName',
  
    indexOf      = 'indexOf',
    parentNode   = 'parentNode',
    length       = 'length',
    toLowerCase  = 'toLowerCase',
    Transition   = 'Transition',
    Webkit       = 'Webkit',
    style        = 'style',
    push         = 'push',
    tabindex     = 'tabindex',
    contains     = 'contains',  
    
    active     = 'active',
    inClass    = 'in',
    collapsing = 'collapsing',
    disabled   = 'disabled',
    loading    = 'loading',
    left       = 'left',
    right      = 'right',
    top        = 'top',
    bottom     = 'bottom',
  
    // IE8 browser detect
    isIE8 = !('opacity' in HTML[style]),
  
    // tooltip / popover
    mouseHover = ('onmouseleave' in DOC) ? [ 'mouseenter', 'mouseleave'] : [ 'mouseover', 'mouseout' ],
    tipPositions = /\b(top|bottom|left|right)+/,
    
    // modal
    modalOverlay = 0,
    fixedTop = 'navbar-fixed-top',
    fixedBottom = 'navbar-fixed-bottom',  
    
    // transitionEnd since 2.0.4
    supportTransitions = Webkit+Transition in HTML[style] || Transition[toLowerCase]() in HTML[style],
    transitionEndEvent = Webkit+Transition in HTML[style] ? Webkit[toLowerCase]()+Transition+'End' : Transition[toLowerCase]()+'end',
  
    // set new focus element since 2.0.3
    setFocus = function(element){
      element.focus ? element.focus() : element.setActive();
    },
  
    // class manipulation, since 2.0.0 requires polyfill.js
    addClass = function(element,classNAME) {
      element.classList.add(classNAME);
    },
    removeClass = function(element,classNAME) {
      element.classList.remove(classNAME);
    },
    hasClass = function(element,classNAME){ // since 2.0.0
      return element.classList[contains](classNAME);
    },
  
    // selection methods
    nodeListToArray = function(nodeList){
      var childItems = []; for (var i = 0, nll = nodeList[length]; i<nll; i++) { childItems[push]( nodeList[i] ) }
      return childItems;
    },
    getElementsByClassName = function(element,classNAME) { // getElementsByClassName IE8+
      var selectionMethod = isIE8 ? querySelectorAll : getElementsByCLASSNAME;      
      return nodeListToArray(element[selectionMethod]( isIE8 ? '.' + classNAME.replace(/\s(?=[a-z])/g,'.') : classNAME ));
    },
    queryElement = function (selector, parent) {
      var lookUp = parent ? parent : DOC;
      return typeof selector === 'object' ? selector : lookUp.querySelector(selector);
    },
    getClosest = function (element, selector) { //element is the element and selector is for the closest parent element to find
      // source http://gomakethings.com/climbing-up-and-down-the-dom-tree-with-vanilla-javascript/
      var firstChar = selector.charAt(0), selectorSubstring = selector.substr(1);
      if ( firstChar === '.' ) {// If selector is a class
        for ( ; element && element !== DOC; element = element[parentNode] ) { // Get closest match
          if ( queryElement(selector,element[parentNode]) !== null && hasClass(element,selectorSubstring) ) { return element; }
        }
      } else if ( firstChar === '#' ) { // If selector is an ID
        for ( ; element && element !== DOC; element = element[parentNode] ) { // Get closest match
          if ( element.id === selectorSubstring ) { return element; }
        }
      }
      return false;
    },
  
    // event attach jQuery style / trigger  since 1.2.0
    on = function (element, event, handler) {
      element.addEventListener(event, handler, false);
    },
    off = function(element, event, handler) {
      element.removeEventListener(event, handler, false);
    },
    one = function (element, event, handler) { // one since 2.0.4
      on(element, event, function handlerWrapper(e){
        handler(e);
        off(element, event, handlerWrapper);
      });
    },
    emulateTransitionEnd = function(element,handler){ // emulateTransitionEnd since 2.0.4
      if (supportTransitions) { one(element, transitionEndEvent, function(e){ handler(e); }); } 
      else { handler(); }
    },
    bootstrapCustomEvent = function (eventName, componentName, related) {
      var OriginalCustomEvent = new CustomEvent( eventName + '.bs.' + componentName);
      OriginalCustomEvent.relatedTarget = related;
      this.dispatchEvent(OriginalCustomEvent);
    },
  
    // tooltip / popover stuff
    getScroll = function() { // also Affix and ScrollSpy uses it
      return {
        y : globalObject.pageYOffset || HTML[scrollTop],
        x : globalObject.pageXOffset || HTML[scrollLeft]
      }
    },
    styleTip = function(link,element,position,parent) { // both popovers and tooltips (target,tooltip/popover,placement,elementToAppendTo)
      var elementDimensions = { w : element[offsetWidth], h: element[offsetHeight] },
          windowWidth = (HTML[clientWidth] || DOC[body][clientWidth]),
          windowHeight = (HTML[clientHeight] || DOC[body][clientHeight]),
          rect = link[getBoundingClientRect](), 
          scroll = parent === DOC[body] ? getScroll() : { x: parent[offsetLeft] + parent[scrollLeft], y: parent[offsetTop] + parent[scrollTop] },
          linkDimensions = { w: rect[right] - rect[left], h: rect[bottom] - rect[top] },
          arrow = queryElement('[class*="arrow"]',element),
          topPosition, leftPosition, arrowTop, arrowLeft,
  
          halfTopExceed = rect[top] + linkDimensions.h/2 - elementDimensions.h/2 < 0,
          halfLeftExceed = rect[left] + linkDimensions.w/2 - elementDimensions.w/2 < 0,
          halfRightExceed = rect[left] + elementDimensions.w/2 + linkDimensions.w/2 >= windowWidth,
          halfBottomExceed = rect[top] + elementDimensions.h/2 + linkDimensions.h/2 >= windowHeight,
          topExceed = rect[top] - elementDimensions.h < 0,
          leftExceed = rect[left] - elementDimensions.w < 0,
          bottomExceed = rect[top] + elementDimensions.h + linkDimensions.h >= windowHeight,
          rightExceed = rect[left] + elementDimensions.w + linkDimensions.w >= windowWidth;
  
      // recompute position
      position = (position === left || position === right) && leftExceed && rightExceed ? top : position; // first, when both left and right limits are exceeded, we fall back to top|bottom
      position = position === top && topExceed ? bottom : position;
      position = position === bottom && bottomExceed ? top : position;
      position = position === left && leftExceed ? right : position;
      position = position === right && rightExceed ? left : position;
      
      // apply styling to tooltip or popover
      if ( position === left || position === right ) { // secondary|side positions
        if ( position === left ) { // LEFT
          leftPosition = rect[left] + scroll.x - elementDimensions.w;
        } else { // RIGHT
          leftPosition = rect[left] + scroll.x + linkDimensions.w;
        }
  
        // adjust top and arrow
        if (halfTopExceed) {
          topPosition = rect[top] + scroll.y;
          arrowTop = linkDimensions.h/2;
        } else if (halfBottomExceed) {
          topPosition = rect[top] + scroll.y - elementDimensions.h + linkDimensions.h;
          arrowTop = elementDimensions.h - linkDimensions.h/2;
        } else {
          topPosition = rect[top] + scroll.y - elementDimensions.h/2 + linkDimensions.h/2;
        }
      } else if ( position === top || position === bottom ) { // primary|vertical positions
        if ( position === top) { // TOP
          topPosition =  rect[top] + scroll.y - elementDimensions.h;
        } else { // BOTTOM
          topPosition = rect[top] + scroll.y + linkDimensions.h;
        }
        // adjust left | right and also the arrow
        if (halfLeftExceed) {
          leftPosition = 0;
          arrowLeft = rect[left] + linkDimensions.w/2;
        } else if (halfRightExceed) {
          leftPosition = windowWidth - elementDimensions.w*1.01;
          arrowLeft = elementDimensions.w - ( windowWidth - rect[left] ) + linkDimensions.w/2;
        } else {
          leftPosition = rect[left] + scroll.x - elementDimensions.w/2 + linkDimensions.w/2;
        }
      }
  
      // apply style to tooltip/popover and it's arrow
      element[style][top] = topPosition + 'px';
      element[style][left] = leftPosition + 'px';
  
      arrowTop && (arrow[style][top] = arrowTop + 'px');
      arrowLeft && (arrow[style][left] = arrowLeft + 'px');
  
      element.className[indexOf](position) === -1 && (element.className = element.className.replace(tipPositions,position));
    };
  
  BSN.version = '2.0.21';
  
  /* Native Javascript for Bootstrap 3 | Affix
  -------------------------------------------*/
  
  //AFFIX DEFINITION
  var Affix = function(element, options) {
  
    // initialization element
    element = queryElement(element);
  
    // set options
    options = options || {};
  
    // read DATA API
    var targetData        = element[getAttribute](dataTarget),
        offsetTopData     = element[getAttribute](dataOffsetTop),
        offsetBottomData  = element[getAttribute](dataOffsetBottom),
        
        // component specific strings
        affix = 'affix', affixed = 'affixed', fn = 'function', update = 'update',
        affixTop = 'affix-top', affixedTop = 'affixed-top',
        affixBottom = 'affix-bottom', affixedBottom = 'affixed-bottom';
  
    this[target] = options[target] ? queryElement(options[target]) : queryElement(targetData) || null; // target is an object
    this[offsetTop] = options[offsetTop] ? options[offsetTop] : parseInt(offsetTopData) || 0; // offset option is an integer number or function to determine that number
    this[offsetBottom] = options[offsetBottom] ? options[offsetBottom]: parseInt(offsetBottomData) || 0;
  
    if ( !this[target] && !( this[offsetTop] || this[offsetBottom] ) ) { return; } // invalidate
  
    // internal bind
    var self = this,
  
      // constants
      pinOffsetTop, pinOffsetBottom, maxScroll, scrollY, pinnedTop, pinnedBottom,
      affixedToTop = false, affixedToBottom = false,
      
      // private methods 
      getMaxScroll = function(){
        return Math.max( DOC[body][scrollHeight], DOC[body][offsetHeight], HTML[clientHeight], HTML[scrollHeight], HTML[offsetHeight] );
      },
      getOffsetTop = function () {
        if ( self[target] !== null ) {
          return self[target][getBoundingClientRect]()[top] + scrollY;
        } else if ( self[offsetTop] ) {
          return parseInt(typeof self[offsetTop] === fn ? self[offsetTop]() : self[offsetTop] || 0);
        }
      },
      getOffsetBottom = function () {
        if ( self[offsetBottom] ) {
          return maxScroll - element[offsetHeight] - parseInt( typeof self[offsetBottom] === fn ? self[offsetBottom]() : self[offsetBottom] || 0 );
        }
      },
      checkPosition = function () {
        maxScroll = getMaxScroll();
        scrollY = parseInt(getScroll().y,0);
        pinOffsetTop = getOffsetTop();
        pinOffsetBottom = getOffsetBottom(); 
        pinnedTop = ( parseInt(pinOffsetTop) - scrollY < 0) && (scrollY > parseInt(pinOffsetTop) );
        pinnedBottom = ( parseInt(pinOffsetBottom) - scrollY < 0) && (scrollY > parseInt(pinOffsetBottom) );
      },
      pinTop = function () {
        if ( !affixedToTop && !hasClass(element,affix) ) { // on loading a page halfway scrolled these events don't trigger in Chrome
          bootstrapCustomEvent.call(element, affix, affix);
          bootstrapCustomEvent.call(element, affixTop, affix);
          addClass(element,affix);
          affixedToTop = true;
          bootstrapCustomEvent.call(element, affixed, affix);
          bootstrapCustomEvent.call(element, affixedTop, affix);
        }
      },
      unPinTop = function () {
        if ( affixedToTop && hasClass(element,affix) ) {
          removeClass(element,affix);
          affixedToTop = false;
        }
      },
      pinBottom = function () {
        if ( !affixedToBottom && !hasClass(element, affixBottom) ) {
          bootstrapCustomEvent.call(element, affix, affix);
          bootstrapCustomEvent.call(element, affixBottom, affix);
          addClass(element,affixBottom);
          affixedToBottom = true;
          bootstrapCustomEvent.call(element, affixed, affix);
          bootstrapCustomEvent.call(element, affixedBottom, affix);
        }
      },
      unPinBottom = function () {
        if ( affixedToBottom && hasClass(element,affixBottom) ) {
          removeClass(element,affixBottom);
          affixedToBottom = false;
        }
      },
      updatePin = function () {
        if ( pinnedBottom ) {
          if ( pinnedTop ) { unPinTop(); }
          pinBottom(); 
        } else {
          unPinBottom();
          if ( pinnedTop ) { pinTop(); } 
          else { unPinTop(); }
        }
      };
  
    // public method
    this[update] = function () {
      checkPosition();
      updatePin(); 
    };
  
    // init
    if ( !(stringAffix in element ) ) { // prevent adding event handlers twice
      on( globalObject, scrollEvent, self[update] );
      !isIE8 && on( globalObject, resizeEvent, self[update] );
    }
    element[stringAffix] = self;
  
    self[update]();
  };
  
  // AFFIX DATA API
  // =================
  supports[push]([stringAffix, Affix, '['+dataSpy+'="affix"]']);
  
  
  
  /* Native Javascript for Bootstrap 3 | Alert
  -------------------------------------------*/
  
  // ALERT DEFINITION
  // ================
  var Alert = function( element ) {
    
    // initialization element
    element = queryElement(element);
  
    // bind, target alert, duration and stuff
    var self = this, component = 'alert',
      alert = getClosest(element,'.'+component),
      triggerHandler = function(){ hasClass(alert,'fade') ? emulateTransitionEnd(alert,transitionEndHandler) : transitionEndHandler(); },
      // handlers
      clickHandler = function(e){
        alert = getClosest(e[target],'.'+component);
        element = queryElement('['+dataDismiss+'="'+component+'"]',alert);
        element && alert && (element === e[target] || element[contains](e[target])) && self.close();
      },
      transitionEndHandler = function(){
        bootstrapCustomEvent.call(alert, closedEvent, component);
        off(element, clickEvent, clickHandler); // detach it's listener
        alert[parentNode].removeChild(alert);
      };
    
    // public method
    this.close = function() {
      if ( alert && element && hasClass(alert,inClass) ) {
        bootstrapCustomEvent.call(alert, closeEvent, component);
        removeClass(alert,inClass);
        alert && triggerHandler();
      }
    };
  
    // init
    if ( !(stringAlert in element ) ) { // prevent adding event handlers twice
      on(element, clickEvent, clickHandler);
    }
    element[stringAlert] = self;
  };
  
  // ALERT DATA API
  // ==============
  supports[push]([stringAlert, Alert, '['+dataDismiss+'="alert"]']);
  
  
  
  /* Native Javascript for Bootstrap 3 | Button
  ---------------------------------------------*/
  
  // BUTTON DEFINITION
  // ===================
  var Button = function( element, option ) {
  
    // initialization element
    element = queryElement(element);
  
    // set option
    option = option || null;
  
    // constant
    var toggled = false, // toggled makes sure to prevent triggering twice the change.bs.button events
  
        // strings
        component = 'button',
        checked = 'checked',
        reset = 'reset',
        LABEL = 'LABEL',
        INPUT = 'INPUT',
  
      // private methods
      setState = function() {
        if ( !! option && option !== reset ) {
          if ( option === loading ) {
            addClass(element,disabled);
            element[setAttribute](disabled,disabled);
            element[setAttribute](dataOriginalText, element[innerHTML].trim()); // trim the text
          }
          element[innerHTML] = element[getAttribute]('data-'+option+'-text');
        }
      },
      resetState = function() {
        if (element[getAttribute](dataOriginalText)) {
          if ( hasClass(element,disabled) || element[getAttribute](disabled) === disabled ) {
            removeClass(element,disabled);
            element.removeAttribute(disabled);
          }
          element[innerHTML] = element[getAttribute](dataOriginalText);
        }
      },
      keyHandler = function(e){ 
        var key = e.which || e.keyCode;
        key === 32 && e[target] === DOC.activeElement && toggle(e);
      },
      preventScroll = function(e){ 
        var key = e.which || e.keyCode;
        key === 32 && e[preventDefault]();
      },    
      toggle = function(e) {
        var label = e[target].tagName === LABEL ? e[target] : e[target][parentNode].tagName === LABEL ? e[target][parentNode] : null; // the .btn label
        
        if ( !label ) return; //react if a label or its immediate child is clicked
  
        var eventTarget = e[target], // the button itself, the target of the handler function
          labels = getElementsByClassName(eventTarget[parentNode],'btn'), // all the button group buttons
          input = label[getElementsByTagName](INPUT)[0];
  
        if ( !input ) return; //return if no input found
  
        // manage the dom manipulation
        if ( input.type === 'checkbox' ) { //checkboxes
          if ( !input[checked] ) {
            addClass(label,active);
            input[getAttribute](checked);
            input[setAttribute](checked,checked);
            input[checked] = true;
          } else {
            removeClass(label,active);
            input[getAttribute](checked);
            input.removeAttribute(checked);
            input[checked] = false;
          }
  
          if (!toggled) { // prevent triggering the event twice
            toggled = true;
            bootstrapCustomEvent.call(input, changeEvent, component); //trigger the change for the input
            bootstrapCustomEvent.call(element, changeEvent, component); //trigger the change for the btn-group
          }
        }
  
        if ( input.type === 'radio' && !toggled ) { // radio buttons
          if ( !input[checked] ) { // don't trigger if already active
            addClass(label,active);
            input[setAttribute](checked,checked);
            input[checked] = true;
            bootstrapCustomEvent.call(input, changeEvent, component); //trigger the change for the input
            bootstrapCustomEvent.call(element, changeEvent, component); //trigger the change for the btn-group
  
            toggled = true;
            for (var i = 0, ll = labels[length]; i<ll; i++) {
              var otherLabel = labels[i], otherInput = otherLabel[getElementsByTagName](INPUT)[0];
              if ( otherLabel !== label && hasClass(otherLabel,active) )  {
                removeClass(otherLabel,active);
                otherInput.removeAttribute(checked);
                otherInput[checked] = false;
                bootstrapCustomEvent.call(otherInput, changeEvent, component); // trigger the change
              }
            }
          }
        }
        setTimeout( function() { toggled = false; }, 50 );
      };
  
    // init
    if ( hasClass(element,'btn') ) { // when Button text is used we execute it as an instance method
      if ( option !== null ) {
        if ( option !== reset ) { setState(); } 
        else { resetState(); }
      }
    } else { // if ( hasClass(element,'btn-group') ) // we allow the script to work outside btn-group component
      
      if ( !( stringButton in element ) ) { // prevent adding event handlers twice
        on( element, clickEvent, toggle );
        queryElement('['+tabindex+']',element) && on( element, keyupEvent, keyHandler ), 
                                                  on( element, keydownEvent, preventScroll );
      }
  
      // activate items on load
      var labelsToACtivate = getElementsByClassName(element, 'btn'), lbll = labelsToACtivate[length];
      for (var i=0; i<lbll; i++) {
        !hasClass(labelsToACtivate[i],active) && queryElement('input',labelsToACtivate[i])[getAttribute](checked)
                                              && addClass(labelsToACtivate[i],active);
      }
      element[stringButton] = this;
    }
  };
  
  // BUTTON DATA API
  // =================
  supports[push]( [ stringButton, Button, '['+dataToggle+'="buttons"]' ] );
  
  
  /* Native Javascript for Bootstrap 3 | Carousel
  ----------------------------------------------*/
  
  // CAROUSEL DEFINITION
  // ===================
  var Carousel = function( element, options ) {
  
    // initialization element
    element = queryElement( element );
  
    // set options
    options = options || {};
  
    // DATA API
    var intervalAttribute = element[getAttribute](dataInterval),
        intervalOption = options[interval],
        intervalData = intervalAttribute === 'false' ? 0 : parseInt(intervalAttribute) || 5000,  // bootstrap carousel default interval
        pauseData = element[getAttribute](dataPause) === hoverEvent || false,
        keyboardData = element[getAttribute](dataKeyboard) === 'true' || false,
      
        // strings
        component = 'carousel',
        paused = 'paused',
        direction = 'direction',
        dataSlideTo = 'data-slide-to'; 
  
    this[keyboard] = options[keyboard] === true || keyboardData;
    this[pause] = (options[pause] === hoverEvent || pauseData) ? hoverEvent : false; // false / hover
  
    this[interval] = typeof intervalOption === 'number' ? intervalOption
    : intervalData === 0 ? 0
    : intervalData;
  
    // bind, event targets
    var self = this, index = element.index = 0, timer = element.timer = 0, 
      isSliding = false, // isSliding prevents click event handlers when animation is running
      slides = getElementsByClassName(element,'item'), total = slides[length],
      slideDirection = this[direction] = left,
      controls = getElementsByClassName(element,component+'-control'),
      leftArrow = controls[0], rightArrow = controls[1],
      indicator = queryElement( '.'+component+'-indicators', element ),
      indicators = indicator && indicator[getElementsByTagName]( "LI" ) || [];
  
    // handlers
    var pauseHandler = function () {
        if ( self[interval] !==false && !hasClass(element,paused) ) {
          addClass(element,paused);
          !isSliding && clearInterval( timer );
        }
      },
      resumeHandler = function() {
        if ( self[interval] !== false && hasClass(element,paused) ) {
          removeClass(element,paused);
          !isSliding && clearInterval( timer );
          !isSliding && self.cycle();
        }
      },
      indicatorHandler = function(e) {
        e[preventDefault]();
        if (isSliding) return;
  
        var eventTarget = e[target]; // event target | the current active item
  
        if ( eventTarget && !hasClass(eventTarget,active) && eventTarget[getAttribute](dataSlideTo) ) {
          index = parseInt( eventTarget[getAttribute](dataSlideTo), 10 );
        } else { return false; }
  
        self.slideTo( index ); //Do the slide
      },
      controlsHandler = function (e) {
        e[preventDefault]();
        if (isSliding) return;
  
        var eventTarget = e.currentTarget || e.srcElement;
  
        if ( eventTarget === rightArrow ) {
          index++;
        } else if ( eventTarget === leftArrow ) {
          index--;
        }
  
        self.slideTo( index ); //Do the slide
      },
      keyHandler = function (e) {
        if (isSliding) return;
        switch (e.which) {
          case 39:
            index++;
            break;
          case 37:
            index--;
            break;
          default: return;
        }
        self.slideTo( index ); //Do the slide
      },
      // private methods
      isElementInScrollRange = function () {
        var rect = element[getBoundingClientRect](),
          viewportHeight = globalObject[innerHeight] || HTML[clientHeight]
        return rect[top] <= viewportHeight && rect[bottom] >= 0; // bottom && top
      },  
      setActivePage = function( pageIndex ) { //indicators
        for ( var i = 0, icl = indicators[length]; i < icl; i++ ) {
          removeClass(indicators[i],active);
        }
        if (indicators[pageIndex]) addClass(indicators[pageIndex], active);
      };
  
  
    // public methods
    this.cycle = function() {
      timer = setInterval(function() {
        isElementInScrollRange() && (index++, self.slideTo( index ) );
      }, this[interval]);
    };
    this.slideTo = function( next ) {
      if (isSliding) return; // when controled via methods, make sure to check again    
      var activeItem = this.getActiveIndex(), // the current active
          orientation;
      
      // determine slideDirection first
      if  ( (activeItem < next ) || (activeItem === 0 && next === total -1 ) ) {
        slideDirection = self[direction] = left; // next
      } else if  ( (activeItem > next) || (activeItem === total - 1 && next === 0 ) ) {
        slideDirection = self[direction] = right; // prev
      }
  
      // find the right next index 
      if ( next < 0 ) { next = total - 1; } 
      else if ( next === total ){ next = 0; }
  
      // update index
      index = next;
      
      orientation = slideDirection === left ? 'next' : 'prev'; //determine type
      bootstrapCustomEvent.call(element, slideEvent, component, slides[next]); // here we go with the slide
  
      isSliding = true;
      clearInterval(timer);
      setActivePage( next );
  
      if ( supportTransitions && hasClass(element,'slide') ) {
  
        addClass(slides[next],orientation);
        slides[next][offsetWidth];
        addClass(slides[next],slideDirection);
        addClass(slides[activeItem],slideDirection);
  
        one(slides[activeItem], transitionEndEvent, function(e) {
          var timeout = e[target] !== slides[activeItem] ? e.elapsedTime*1000 : 0;
          setTimeout(function(){
            isSliding = false;
  
            addClass(slides[next],active);
            removeClass(slides[activeItem],active);
  
            removeClass(slides[next],orientation);
            removeClass(slides[next],slideDirection);
            removeClass(slides[activeItem],slideDirection);
  
            bootstrapCustomEvent.call(element, slidEvent, component, slides[next]);
  
            if ( self[interval] && !hasClass(element,paused) ) {
              self.cycle();
            }
          },timeout+100);
        });
  
      } else {
        addClass(slides[next],active);
        slides[next][offsetWidth];
        removeClass(slides[activeItem],active);
        setTimeout(function() {
          isSliding = false;
          if ( self[interval] && !hasClass(element,paused) ) {
            self.cycle();
          }
          bootstrapCustomEvent.call(element, slidEvent, component, slides[next]); // here we go with the slid event
        }, 100 );
      }
    };
    this.getActiveIndex = function () {
      return slides[indexOf](getElementsByClassName(element,'item active')[0]) || 0;
    };
  
    // init
    if ( !(stringCarousel in element ) ) { // prevent adding event handlers twice
  
      if ( self[pause] && self[interval] ) {
        on( element, mouseHover[0], pauseHandler );
        on( element, mouseHover[1], resumeHandler );
        on( element, 'touchstart', pauseHandler );
        on( element, 'touchend', resumeHandler );
      }
    
      rightArrow && on( rightArrow, clickEvent, controlsHandler );
      leftArrow && on( leftArrow, clickEvent, controlsHandler );
    
      indicator && on( indicator, clickEvent, indicatorHandler );
      self[keyboard] && on( globalObject, keydownEvent, keyHandler );
  
    }
    if (self.getActiveIndex()<0) {
      slides[length] && addClass(slides[0],active);
      indicators[length] && setActivePage(0);
    }
  
    if ( self[interval] ){ self.cycle(); }
    element[stringCarousel] = self;
  };
  
  // CAROUSEL DATA API
  // =================
  supports[push]( [ stringCarousel, Carousel, '['+dataRide+'="carousel"]' ] );
  
  
  /* Native Javascript for Bootstrap 3 | Collapse
  -----------------------------------------------*/
  
  // COLLAPSE DEFINITION
  // ===================
  var Collapse = function( element, options ) {
  
    // initialization element
    element = queryElement(element);
  
    // set options
    options = options || {};
  
    // event targets and constants
    var accordion = null, collapse = null, self = this,
      isAnimating = false, // when true it will prevent click handlers
      accordionData = element[getAttribute]('data-parent'),
  
      // component strings
      component = 'collapse',
      collapsed = 'collapsed',
  
      // private methods
      openAction = function(collapseElement) {
        bootstrapCustomEvent.call(collapseElement, showEvent, component);
        isAnimating = true;
        addClass(collapseElement,collapsing);
        removeClass(collapseElement,component);
        collapseElement[style][height] = collapseElement[scrollHeight] + 'px';
        
        emulateTransitionEnd(collapseElement, function() {
          isAnimating = false;
          collapseElement[setAttribute](ariaExpanded,'true');
          removeClass(collapseElement,collapsing);
          addClass(collapseElement, component);
          addClass(collapseElement, inClass);
          collapseElement[style][height] = '';
          bootstrapCustomEvent.call(collapseElement, shownEvent, component);
        });
      },
      closeAction = function(collapseElement) {
        bootstrapCustomEvent.call(collapseElement, hideEvent, component);
        isAnimating = true;
        collapseElement[style][height] = collapseElement[scrollHeight] + 'px'; // set height first
        removeClass(collapseElement,component);
        removeClass(collapseElement, inClass);
        addClass(collapseElement, collapsing);
        collapseElement[offsetWidth]; // force reflow to enable transition
        collapseElement[style][height] = '0px';
        
        emulateTransitionEnd(collapseElement, function() {
          isAnimating = false;
          collapseElement[setAttribute](ariaExpanded,'false');
          removeClass(collapseElement,collapsing);
          addClass(collapseElement,component);
          collapseElement[style][height] = '';
          bootstrapCustomEvent.call(collapseElement, hiddenEvent, component);
        });
      },
      getTarget = function() {
        var href = element.href && element[getAttribute]('href'),
          parent = element[getAttribute](dataTarget),
          id = href || ( parent && parent.charAt(0) === '#' ) && parent;
        return id && queryElement(id);
      };
    
    // public methods
    this.toggle = function(e) {
      e[preventDefault]();
      if ( isAnimating ) return;
      if (!hasClass(collapse,inClass)) { self.show(); } 
      else { self.hide(); }
    };
    this.hide = function() {
      closeAction(collapse);
      addClass(element,collapsed);
    };
    this.show = function() {
      if ( accordion ) {
        var activeCollapse = queryElement('.'+component+'.'+inClass,accordion),
            toggle = activeCollapse && (queryElement('['+dataToggle+'="'+component+'"]['+dataTarget+'="#'+activeCollapse.id+'"]',accordion)
                   || queryElement('['+dataToggle+'="'+component+'"][href="#'+activeCollapse.id+'"]',accordion) ),
            correspondingCollapse = toggle && (toggle[getAttribute](dataTarget) || toggle.href);
        if ( activeCollapse && toggle && activeCollapse !== collapse ) { 
          closeAction(activeCollapse); 
          if ( correspondingCollapse.split('#')[1] !== collapse.id ) { addClass(toggle,collapsed); } 
          else { removeClass(toggle,collapsed); }
        }
      }
  
      openAction(collapse);
      removeClass(element,collapsed); 
    };
  
    // init
    if ( !(stringCollapse in element ) ) { // prevent adding event handlers twice
      on(element, clickEvent, self.toggle);
    }
    collapse = getTarget();
    accordion = queryElement(options.parent) || accordionData && getClosest(element, accordionData);
    element[stringCollapse] = self;
  };
  
  // COLLAPSE DATA API
  // =================
  supports[push]( [ stringCollapse, Collapse, '['+dataToggle+'="collapse"]' ] );
  
  
  /* Native Javascript for Bootstrap 3 | Dropdown
  ----------------------------------------------*/
  
  // DROPDOWN DEFINITION
  // ===================
  var Dropdown = function( element, option ) {
      
    // initialization element
    element = queryElement(element);
  
    // set option
    this.persist = option === true || element[getAttribute]('data-persist') === 'true' || false;
  
    // constants, event targets, strings
    var self = this, children = 'children',
      parent = element[parentNode],
      component = 'dropdown', open = 'open',
      relatedTarget = null,
      menu = queryElement('.dropdown-menu', parent),
      menuItems = (function(){
        var set = menu[children], newSet = [];
        for ( var i=0; i<set[length]; i++ ){
          set[i][children][length] && (set[i][children][0].tagName === 'A' && newSet[push](set[i]));          
        }
        return newSet;
      })(),
  
      // preventDefault on empty anchor links
      preventEmptyAnchor = function(anchor){
        (anchor.href && anchor.href.slice(-1) === '#' || anchor[parentNode] && anchor[parentNode].href 
          && anchor[parentNode].href.slice(-1) === '#') && this[preventDefault]();      
      },
  
      // toggle dismissible events
      toggleDismiss = function(){
        var type = element[open] ? on : off;
        type(DOC, clickEvent, dismissHandler); 
        type(DOC, keydownEvent, preventScroll);
        type(DOC, keyupEvent, keyHandler);
      },
  
      // handlers
      dismissHandler = function(e) {
        var eventTarget = e[target], hasData = eventTarget && (stringDropdown in eventTarget || stringDropdown in eventTarget[parentNode]);
        if ( (eventTarget === menu || menu[contains](eventTarget)) && (self.persist || hasData) ) { return; }
        else {
          relatedTarget = eventTarget === element || element[contains](eventTarget) ? element : null;
          hide();
        }
        preventEmptyAnchor.call(e,eventTarget);
      },
      clickHandler = function(e) {
        relatedTarget = element;
        show();
        preventEmptyAnchor.call(e,e[target]);
      },
      preventScroll = function(e){
        var key = e.which || e.keyCode;
        if( key === 38 || key === 40 ) { e[preventDefault](); }
      },
      keyHandler = function(e){
        var key = e.which || e.keyCode, 
            activeItem = DOC.activeElement,
            idx = menuItems[indexOf](activeItem[parentNode]),
            isSameElement = activeItem === element,
            isInsideMenu = menu[contains](activeItem),
            isMenuItem = activeItem[parentNode][parentNode] === menu;
        
        if ( isMenuItem || isSameElement ) { // navigate up | down
          idx = isSameElement ? 0 
                              : key === 38 ? (idx>1?idx-1:0) 
                              : key === 40 ? (idx<menuItems[length]-1?idx+1:idx) : idx;
          menuItems[idx] && setFocus(menuItems[idx][children][0]);
        }
        if ( (menuItems[length] && isMenuItem // menu has items
          || !menuItems[length] && (isInsideMenu || isSameElement)  // menu might be a form
          || !isInsideMenu ) // or the focused element is not in the menu at all
          && element[open] && key === 27 // menu must be open
        ) {
          self.toggle();
          relatedTarget = null;
        }
      },  
  
      // private methods
      show = function() {
        bootstrapCustomEvent.call(parent, showEvent, component, relatedTarget);
        addClass(parent,open);
        menu[setAttribute](ariaExpanded,true);
        bootstrapCustomEvent.call(parent, shownEvent, component, relatedTarget);
        element[open] = true;
        off(element, clickEvent, clickHandler);
        setTimeout(function(){ 
          setFocus( menu[getElementsByTagName]('INPUT')[0] || element ); // focus the first input item | element
          toggleDismiss(); 
        },1);
      },
      hide = function() {
        bootstrapCustomEvent.call(parent, hideEvent, component, relatedTarget);
        removeClass(parent,open);
        menu[setAttribute](ariaExpanded,false);
        bootstrapCustomEvent.call(parent, hiddenEvent, component, relatedTarget);
        element[open] = false;
        toggleDismiss();
        setFocus(element);
        setTimeout(function(){ on(element, clickEvent, clickHandler); },1);
      };
  
    // set initial state to closed
    element[open] = false;
  
    // public methods
    this.toggle = function() {
      if (hasClass(parent,open) && element[open]) { hide(); } 
      else { show(); }
    };
  
    // init
    if (!(stringDropdown in element)) { // prevent adding event handlers twice
      !tabindex in menu && menu[setAttribute](tabindex, '0'); // Fix onblur on Chrome | Safari
      on(element, clickEvent, clickHandler);
    }
  
    element[stringDropdown] = self;
  };
  
  // DROPDOWN DATA API
  // =================
  supports[push]( [stringDropdown, Dropdown, '['+dataToggle+'="dropdown"]'] );
  
  
  /* Native Javascript for Bootstrap 3 | Modal
  -------------------------------------------*/
  
  // MODAL DEFINITION
  // ===============
  var Modal = function(element, options) { // element can be the modal/triggering button
  
    // the modal (both JavaScript / DATA API init) / triggering button element (DATA API)
    element = queryElement(element);
  
    // determine modal, triggering element
    var btnCheck = element[getAttribute](dataTarget)||element[getAttribute]('href'),
      checkModal = queryElement( btnCheck ),
      modal = hasClass(element,'modal') ? element : checkModal,
  
      // strings
      component = 'modal',
      staticString = 'static',
      paddingLeft = 'paddingLeft',
      paddingRight = 'paddingRight',
      modalBackdropString = 'modal-backdrop';
  
    if ( hasClass(element,'modal') ) { element = null; } // modal is now independent of it's triggering element
  
    if ( !modal ) { return; } // invalidate
  
    // set options
    options = options || {};
  
    this[keyboard] = options[keyboard] === false || modal[getAttribute](dataKeyboard) === 'false' ? false : true;
    this[backdrop] = options[backdrop] === staticString || modal[getAttribute](databackdrop) === staticString ? staticString : true;
    this[backdrop] = options[backdrop] === false || modal[getAttribute](databackdrop) === 'false' ? false : this[backdrop];
    this[content]  = options[content]; // JavaScript only
  
    // bind, constants, event targets and other vars
    var self = this, relatedTarget = null,
      bodyIsOverflowing, modalIsOverflowing, scrollbarWidth, overlay,
  
      // also find fixed-top / fixed-bottom items
      fixedItems = getElementsByClassName(HTML,fixedTop).concat(getElementsByClassName(HTML,fixedBottom)),
  
      // private methods
      getWindowWidth = function() {
        var htmlRect = HTML[getBoundingClientRect]();
        return globalObject[innerWidth] || (htmlRect[right] - Math.abs(htmlRect[left]));
      },
      setScrollbar = function () {
        var bodyStyle = DOC[body].currentStyle || globalObject.getComputedStyle(DOC[body]),
            bodyPad = parseInt((bodyStyle[paddingRight]), 10), itemPad;
        if (bodyIsOverflowing) {
          DOC[body][style][paddingRight] = (bodyPad + scrollbarWidth) + 'px';
          if (fixedItems[length]){
            for (var i = 0; i < fixedItems[length]; i++) {
              itemPad = (fixedItems[i].currentStyle || globalObject.getComputedStyle(fixedItems[i]))[paddingRight];
              fixedItems[i][style][paddingRight] = ( parseInt(itemPad) + scrollbarWidth) + 'px';
            }
          }
        }
      },
      resetScrollbar = function () {
        DOC[body][style][paddingRight] = '';
        if (fixedItems[length]){
          for (var i = 0; i < fixedItems[length]; i++) {
            fixedItems[i][style][paddingRight] = '';
          }
        }
      },
      measureScrollbar = function () { // thx walsh
        var scrollDiv = DOC[createElement]('div'), scrollBarWidth;
        scrollDiv.className = component+'-scrollbar-measure'; // this is here to stay
        DOC[body][appendChild](scrollDiv);
        scrollBarWidth = scrollDiv[offsetWidth] - scrollDiv[clientWidth];
        DOC[body].removeChild(scrollDiv);
      return scrollBarWidth;
      },
      checkScrollbar = function () {
        bodyIsOverflowing = DOC[body][clientWidth] < getWindowWidth();
        modalIsOverflowing = modal[scrollHeight] > HTML[clientHeight];
        scrollbarWidth = measureScrollbar();
      },
      adjustDialog = function () {
        modal[style][paddingLeft] = !bodyIsOverflowing && modalIsOverflowing ? scrollbarWidth + 'px' : '';
        modal[style][paddingRight] = bodyIsOverflowing && !modalIsOverflowing ? scrollbarWidth + 'px' : '';
      },
      resetAdjustments = function () {
        modal[style][paddingLeft] = '';
        modal[style][paddingRight] = '';
      },
      createOverlay = function() {
        modalOverlay = 1;
        
        var newOverlay = DOC[createElement]('div');
        overlay = queryElement('.'+modalBackdropString);
  
        if ( overlay === null ) {
          newOverlay[setAttribute]('class',modalBackdropString+' fade');
          overlay = newOverlay;
          DOC[body][appendChild](overlay);
        }
      },
      removeOverlay = function() {
        overlay = queryElement('.'+modalBackdropString);
        if ( overlay && overlay !== null && typeof overlay === 'object' ) {
          modalOverlay = 0;
          DOC[body].removeChild(overlay); overlay = null;
        }
        bootstrapCustomEvent.call(modal, hiddenEvent, component);      
      },
      keydownHandlerToggle = function() {
        if (hasClass(modal,inClass)) {
          on(DOC, keydownEvent, keyHandler);
        } else {
          off(DOC, keydownEvent, keyHandler);
        }
      },
      resizeHandlerToggle = function() {
        if (hasClass(modal,inClass)) {
          on(globalObject, resizeEvent, self.update);
        } else {
          off(globalObject, resizeEvent, self.update);
        }
      },
      dismissHandlerToggle = function() {
        if (hasClass(modal,inClass)) {
          on(modal, clickEvent, dismissHandler);
        } else {
          off(modal, clickEvent, dismissHandler);
        }
      },
      // triggers
      triggerShow = function() {
        setFocus(modal);
        bootstrapCustomEvent.call(modal, shownEvent, component, relatedTarget);
      },
      triggerHide = function() {
        modal[style].display = '';
        element && (setFocus(element));
        
        setTimeout(function(){
          if (!getElementsByClassName(DOC,component+' '+inClass)[0]) {
            resetAdjustments();
            resetScrollbar();
            removeClass(DOC[body],component+'-open');
            overlay && hasClass(overlay,'fade') ? (removeClass(overlay,inClass), emulateTransitionEnd(overlay,removeOverlay)) 
            : removeOverlay();
  
            resizeHandlerToggle();
            dismissHandlerToggle();
            keydownHandlerToggle();
          }
        }, 50);
      },
      // handlers
      clickHandler = function(e) {
        var clickTarget = e[target];
        clickTarget = clickTarget[hasAttribute](dataTarget) || clickTarget[hasAttribute]('href') ? clickTarget : clickTarget[parentNode];
        if ( clickTarget === element && !hasClass(modal,inClass) ) {
          modal.modalTrigger = element;
          relatedTarget = element;
          self.show();
          e[preventDefault]();
        }
      },
      keyHandler = function(e) {
        var key = e.which || e.keyCode; // keyCode for IE8
        if (self[keyboard] && key == 27 && hasClass(modal,inClass)) {
          self.hide();
        }
      },
      dismissHandler = function(e) {
        var clickTarget = e[target];
        if ( hasClass(modal,inClass) && (clickTarget[parentNode][getAttribute](dataDismiss) === component
            || clickTarget[getAttribute](dataDismiss) === component
            || (clickTarget === modal && self[backdrop] !== staticString) ) ) {
          self.hide(); relatedTarget = null;
          e[preventDefault]();
        }
      };
  
    // public methods
    this.toggle = function() {
      if ( hasClass(modal,inClass) ) {this.hide();} else {this.show();}
    };
    this.show = function() {
      bootstrapCustomEvent.call(modal, showEvent, component, relatedTarget);
  
      // we elegantly hide any opened modal
      var currentOpen = getElementsByClassName(DOC,component+' in')[0];
      currentOpen && currentOpen !== modal && currentOpen.modalTrigger[stringModal].hide();
  
      if ( this[backdrop] ) {
        !modalOverlay && createOverlay();
      }
  
      if ( overlay && modalOverlay && !hasClass(overlay,inClass)) {
        overlay[offsetWidth]; // force reflow to enable trasition
        addClass(overlay,inClass);
      }
  
      setTimeout( function() {
        modal[style].display = 'block';
  
        checkScrollbar();
        setScrollbar();
        adjustDialog();
  
        addClass(DOC[body],component+'-open');
        addClass(modal,inClass);
        modal[setAttribute](ariaHidden, false);
        
        resizeHandlerToggle();
        dismissHandlerToggle();
        keydownHandlerToggle();
  
        hasClass(modal,'fade') ? emulateTransitionEnd(modal, triggerShow) : triggerShow();
      }, supportTransitions ? 150 : 0);
    };
    this.hide = function() {
      bootstrapCustomEvent.call(modal, hideEvent, component);
      overlay = queryElement('.'+modalBackdropString);
  
      removeClass(modal,inClass);
      modal[setAttribute](ariaHidden, true);
  
      setTimeout(function(){
        hasClass(modal,'fade') ? emulateTransitionEnd(modal, triggerHide) : triggerHide();
      }, supportTransitions ? 150 : 0);
    };
    this.setContent = function( content ) {
      queryElement('.'+component+'-content',modal)[innerHTML] = content;
    };
    this.update = function() {
      if (hasClass(modal,inClass)) {
        checkScrollbar();
        setScrollbar();
        adjustDialog();
      }
    };
  
    // init
    // prevent adding event handlers over and over
    // modal is independent of a triggering element
    if ( !!element && !(stringModal in element) ) {
      on(element, clickEvent, clickHandler);
    }
    if ( !!self[content] ) { self.setContent( self[content] ); }
    !!element && (element[stringModal] = self);
  };
  
  // DATA API
  supports[push]( [ stringModal, Modal, '['+dataToggle+'="modal"]' ] );
  
  /* Native Javascript for Bootstrap 3 | Popover
  ----------------------------------------------*/
  
  // POPOVER DEFINITION
  // ==================
  var Popover = function( element, options ) {
  
    // initialization element
    element = queryElement(element);
  
    // set options
    options = options || {};
  
    // DATA API
    var triggerData = element[getAttribute](dataTrigger), // click / hover / focus
        animationData = element[getAttribute](dataAnimation), // true / false
        placementData = element[getAttribute](dataPlacement),
        dismissibleData = element[getAttribute](dataDismissible),
        delayData = element[getAttribute](dataDelay),
        containerData = element[getAttribute](dataContainer),
  
        // internal strings
        component = 'popover',
        template = 'template',
        trigger = 'trigger',
        classString = 'class',
        div = 'div',
        fade = 'fade',
        content = 'content',
        dataContent = 'data-content',
        dismissible = 'dismissible',
        closeBtn = '<button type="button" class="close">×</button>',
  
        // check container
        containerElement = queryElement(options[container]),
        containerDataElement = queryElement(containerData),      
        
        // maybe the element is inside a modal
        modal = getClosest(element,'.modal'),
        
        // maybe the element is inside a fixed navbar
        navbarFixedTop = getClosest(element,'.'+fixedTop),
        navbarFixedBottom = getClosest(element,'.'+fixedBottom);
  
    // set instance options
    this[template] = options[template] ? options[template] : null; // JavaScript only
    this[trigger] = options[trigger] ? options[trigger] : triggerData || hoverEvent;
    this[animation] = options[animation] && options[animation] !== fade ? options[animation] : animationData || fade;
    this[placement] = options[placement] ? options[placement] : placementData || top;
    this[delay] = parseInt(options[delay] || delayData) || 200;
    this[dismissible] = options[dismissible] || dismissibleData === 'true' ? true : false;
    this[container] = containerElement ? containerElement 
                    : containerDataElement ? containerDataElement 
                    : navbarFixedTop ? navbarFixedTop
                    : navbarFixedBottom ? navbarFixedBottom
                    : modal ? modal : DOC[body];
  
    // bind, content
    var self = this, 
      titleString = element[getAttribute](dataTitle) || null,
      contentString = element[getAttribute](dataContent) || null;
  
    if ( !contentString && !this[template] ) return; // invalidate
  
    // constants, vars
    var popover = null, timer = 0, placementSetting = this[placement],
      
      // handlers
      dismissibleHandler = function(e) {
        if (popover !== null && e[target] === queryElement('.close',popover)) {
          self.hide();
        }
      },
  
      // private methods
      removePopover = function() {
        self[container].removeChild(popover);
        timer = null; popover = null; 
      },
      createPopover = function() {
        titleString = element[getAttribute](dataTitle); // check content again
        contentString = element[getAttribute](dataContent);
  
        popover = DOC[createElement](div);
  
        if ( contentString !== null && self[template] === null ) { //create the popover from data attributes
  
          popover[setAttribute]('role','tooltip');
  
          if (titleString !== null) {
            var popoverTitle = DOC[createElement]('h3');
            popoverTitle[setAttribute](classString,component+'-title');
  
            popoverTitle[innerHTML] = self[dismissible] ? titleString + closeBtn : titleString;
            popover[appendChild](popoverTitle);
          }
  
          var popoverArrow = DOC[createElement](div), popoverContent = DOC[createElement](div);
          popoverArrow[setAttribute](classString,'arrow'); popoverContent[setAttribute](classString,component+'-content');
          popover[appendChild](popoverArrow); popover[appendChild](popoverContent);
  
          //set popover content
          popoverContent[innerHTML] = self[dismissible] && titleString === null ? contentString + closeBtn : contentString;
  
        } else {  // or create the popover from template
          var popoverTemplate = DOC[createElement](div);
          popoverTemplate[innerHTML] = self[template];
          popover[innerHTML] = popoverTemplate.firstChild[innerHTML];
        }
  
        //append to the container
        self[container][appendChild](popover);
        popover[style].display = 'block';
        popover[setAttribute](classString, component+ ' ' + placementSetting + ' ' + self[animation]);
      },
      showPopover = function () {
        !hasClass(popover,inClass) && ( addClass(popover,inClass) );
      },
      updatePopover = function() {
        styleTip(element,popover,placementSetting,self[container]);
      },
      
      // event toggle
      dismissHandlerToggle = function(type){
        if (clickEvent == self[trigger] || 'focus' == self[trigger]) {
          !self[dismissible] && type( element, 'blur', self.hide );
        }
        self[dismissible] && type( DOC, clickEvent, dismissibleHandler );
        !isIE8 && type( globalObject, resizeEvent, self.hide );
      },
  
      // triggers
      showTrigger = function() {
        dismissHandlerToggle(on);
        bootstrapCustomEvent.call(element, shownEvent, component);
      },
      hideTrigger = function() {
        dismissHandlerToggle(off);
        removePopover();
        bootstrapCustomEvent.call(element, hiddenEvent, component);
      };
  
    // public methods / handlers
    this.toggle = function() {
      if (popover === null) { self.show(); } 
      else { self.hide(); }
    };
    this.show = function() {
      clearTimeout(timer);
      timer = setTimeout( function() {
        if (popover === null) {
          placementSetting = self[placement]; // we reset placement in all cases
          createPopover();
          updatePopover();
          showPopover();
          bootstrapCustomEvent.call(element, showEvent, component);
          !!self[animation] ? emulateTransitionEnd(popover, showTrigger) : showTrigger();
        }
      }, 20 );
    };
    this.hide = function() {
      clearTimeout(timer);
      timer = setTimeout( function() {
        if (popover && popover !== null && hasClass(popover,inClass)) {
          bootstrapCustomEvent.call(element, hideEvent, component);
          removeClass(popover,inClass);
          !!self[animation] ? emulateTransitionEnd(popover, hideTrigger) : hideTrigger();
        }
      }, self[delay] );
    };
  
    // init
    if ( !(stringPopover in element) ) { // prevent adding event handlers twice
      if (self[trigger] === hoverEvent) {
        on( element, mouseHover[0], self.show );
        if (!self[dismissible]) { on( element, mouseHover[1], self.hide ); }
      } else if (clickEvent == self[trigger] || 'focus' == self[trigger]) {
        on( element, self[trigger], self.toggle );
      }    
    }
    element[stringPopover] = self;
  };
  
  // POPOVER DATA API
  // ================
  supports[push]( [ stringPopover, Popover, '['+dataToggle+'="popover"]' ] );
  
  
  /* Native Javascript for Bootstrap 3 | ScrollSpy
  -----------------------------------------------*/
  
  // SCROLLSPY DEFINITION
  // ====================
  var ScrollSpy = function(element, options) {
  
    // initialization element, the element we spy on
    element = queryElement(element); 
  
    // DATA API
    var targetData = queryElement(element[getAttribute](dataTarget)),
        offsetData = element[getAttribute]('data-offset');
  
    // set options
    options = options || {};
    if ( !options[target] && !targetData ) { return; } // invalidate
  
    // event targets, constants
    var self = this, spyTarget = options[target] && queryElement(options[target]) || targetData,
        links = spyTarget && spyTarget[getElementsByTagName]('A'),
        offset = parseInt(offsetData || options['offset']) || 10,      
        items = [], targetItems = [], scrollOffset,
        scrollTarget = element[offsetHeight] < element[scrollHeight] ? element : globalObject, // determine which is the real scrollTarget
        isWindow = scrollTarget === globalObject;  
  
    // populate items and targets
    for (var i=0, il=links[length]; i<il; i++) {
      var href = links[i][getAttribute]('href'), 
          targetItem = href && href.charAt(0) === '#' && href.slice(-1) !== '#' && queryElement(href);
      if ( !!targetItem ) {
        items[push](links[i]);
        targetItems[push](targetItem);
      }
    }
  
    // private methods
    var updateItem = function(index) {
      var parent = items[index][parentNode], // item's parent LI element
          targetItem = targetItems[index], // the menu item targets this element
          dropdown = getClosest(parent,'.dropdown'),
          targetRect = isWindow && targetItem[getBoundingClientRect](),
  
          isActive = hasClass(parent,active) || false,
  
          topEdge = (isWindow ? targetRect[top] + scrollOffset : targetItem[offsetTop]) - offset,
          bottomEdge = isWindow ? targetRect[bottom] + scrollOffset - offset : targetItems[index+1] ? targetItems[index+1][offsetTop] - offset : element[scrollHeight],
  
          inside = scrollOffset >= topEdge && bottomEdge > scrollOffset;
  
        if ( !isActive && inside ) {
          if ( parent.tagName === 'LI' && !hasClass(parent,active) ) {
            addClass(parent,active);
            if (dropdown && !hasClass(dropdown,active) ) {
              addClass(dropdown,active);
            }
            bootstrapCustomEvent.call(element, 'activate', 'scrollspy', items[index]);
          }
        } else if ( !inside ) {
          if ( parent.tagName === 'LI' && hasClass(parent,active) ) {
            removeClass(parent,active);
            if (dropdown && hasClass(dropdown,active) && !getElementsByClassName(parent[parentNode],active).length ) {
              removeClass(dropdown,active);
            }
          }
        } else if ( !inside && !isActive || isActive && inside ) {
          return;
        }
      },
      updateItems = function(){
        scrollOffset = isWindow ? getScroll().y : element[scrollTop];
        for (var index=0, itl=items[length]; index<itl; index++) {
          updateItem(index)
        }
      };
  
    // public method
    this.refresh = function () {
      updateItems();
    }
  
    // init
    if ( !(stringScrollSpy in element) ) { // prevent adding event handlers twice
      on( scrollTarget, scrollEvent, self.refresh );
      !isIE8 && on( globalObject, resizeEvent, self.refresh ); 
    }
    self.refresh();
    element[stringScrollSpy] = self;
  };
  
  // SCROLLSPY DATA API
  // ==================
  supports[push]( [ stringScrollSpy, ScrollSpy, '['+dataSpy+'="scroll"]' ] );
  
  
  /* Native Javascript for Bootstrap 3 | Tab
  -----------------------------------------*/
  
  // TAB DEFINITION
  // ==============
  var Tab = function( element, options ) {
  
    // initialization element
    element = queryElement(element);
  
    // DATA API
    var heightData = element[getAttribute](dataHeight),
      
        // strings
        component = 'tab', height = 'height', float = 'float', isAnimating = 'isAnimating';
  
    // set options
    options = options || {};
    this[height] = supportTransitions ? (options[height] || heightData === 'true') : false; // filter legacy browsers
  
    // bind, event targets
    var self = this, next,
      tabs = getClosest(element,'.nav'),
      tabsContentContainer = false,
      dropdown = tabs && queryElement('.dropdown',tabs),
      activeTab, activeContent, nextContent, containerHeight, equalContents, nextHeight,
  
      // trigger
      triggerEnd = function(){
        tabsContentContainer[style][height] = '';
        removeClass(tabsContentContainer,collapsing);
        tabs[isAnimating] = false;
      },
      triggerShow = function() {
        if (tabsContentContainer) { // height animation
          if ( equalContents ) {
            triggerEnd();
          } else {
            setTimeout(function(){ // enables height animation
              tabsContentContainer[style][height] = nextHeight + 'px'; // height animation
              tabsContentContainer[offsetWidth];
              emulateTransitionEnd(tabsContentContainer, triggerEnd);
            },1);
          }
        } else {
          tabs[isAnimating] = false; 
        }
        bootstrapCustomEvent.call(next, shownEvent, component, activeTab);
      },
      triggerHide = function() {
        if (tabsContentContainer) {
          activeContent[style][float] = left;
          nextContent[style][float] = left;        
          containerHeight = activeContent[scrollHeight];
        }
        
        addClass(nextContent,active);
        bootstrapCustomEvent.call(next, showEvent, component, activeTab);
        
        removeClass(activeContent,active);
        bootstrapCustomEvent.call(activeTab, hiddenEvent, component, next);
        
        if (tabsContentContainer) {
          nextHeight = nextContent[scrollHeight];
          equalContents = nextHeight === containerHeight;
          addClass(tabsContentContainer,collapsing);
          tabsContentContainer[style][height] = containerHeight + 'px'; // height animation
          tabsContentContainer[offsetHeight];
          activeContent[style][float] = '';
          nextContent[style][float] = '';
        }
  
        if ( hasClass(nextContent, 'fade') ) {
          setTimeout(function(){ // makes sure to go forward
            addClass(nextContent,inClass);
            emulateTransitionEnd(nextContent,triggerShow);
          },20);
        } else { triggerShow(); }        
      };
  
    if (!tabs) return; // invalidate 
  
    // set default animation state
    tabs[isAnimating] = false;
      
    // private methods
    var getActiveTab = function() {
        var activeTabs = getElementsByClassName(tabs,active), activeTab;
        if ( activeTabs[length] === 1 && !hasClass(activeTabs[0],'dropdown') ) {
          activeTab = activeTabs[0];
        } else if ( activeTabs[length] > 1 ) {
          activeTab = activeTabs[activeTabs[length]-1];
        }
        return activeTab[getElementsByTagName]('A')[0];
      },
      getActiveContent = function() {
        return queryElement(getActiveTab()[getAttribute]('href'));
      },
      // handler
      clickHandler = function(e) {
        var href = e[target][getAttribute]('href');
        e[preventDefault]();
        next = e[target][getAttribute](dataToggle) === component || (href && href.charAt(0) === '#')
             ? e[target] : e[target][parentNode]; // allow for child elements like icons to use the handler
        !tabs[isAnimating] && !hasClass(next[parentNode],active) && self.show();
      };
  
    // public method
    this.show = function() { // the tab we clicked is now the next tab
      next = next || element;
      nextContent = queryElement(next[getAttribute]('href')); //this is the actual object, the next tab content to activate
      activeTab = getActiveTab(); 
      activeContent = getActiveContent();
  
      tabs[isAnimating] = true;
      removeClass(activeTab[parentNode],active);
      addClass(next[parentNode],active);
  
      if ( dropdown ) {
        if ( !hasClass(element[parentNode][parentNode],'dropdown-menu') ) {
          if (hasClass(dropdown,active)) removeClass(dropdown,active);
        } else {
          if (!hasClass(dropdown,active)) addClass(dropdown,active);
        }
      }
      
      bootstrapCustomEvent.call(activeTab, hideEvent, component, next);
      
      if (hasClass(activeContent, 'fade')) {
        removeClass(activeContent,inClass);
        emulateTransitionEnd(activeContent, triggerHide);
      } else { triggerHide(); }
    };
  
    // init
    if ( !(stringTab in element) ) { // prevent adding event handlers twice
      on(element, clickEvent, clickHandler);
    }
    if (self[height]) { tabsContentContainer = getActiveContent()[parentNode]; }
    element[stringTab] = self;
  };
  
  // TAB DATA API
  // ============
  supports[push]( [ stringTab, Tab, '['+dataToggle+'="tab"]' ] );
  
  
  /* Native Javascript for Bootstrap 3 | Tooltip
  ---------------------------------------------*/
  
  // TOOLTIP DEFINITION
  // ==================
  var Tooltip = function( element,options ) {
  
    // initialization element
    element = queryElement(element);
  
    // set options
    options = options || {};
  
    // DATA API
    var animationData = element[getAttribute](dataAnimation),
        placementData = element[getAttribute](dataPlacement),
        delayData = element[getAttribute](dataDelay),
        containerData = element[getAttribute](dataContainer),
        
        // strings
        component = 'tooltip',
        classString = 'class',
        title = 'title',
        fade = 'fade',
        div = 'div',
  
        // check container
        containerElement = queryElement(options[container]),
        containerDataElement = queryElement(containerData),        
  
        // maybe the element is inside a modal
        modal = getClosest(element,'.modal'),
        
        // maybe the element is inside a fixed navbar
        navbarFixedTop = getClosest(element,'.'+fixedTop),
        navbarFixedBottom = getClosest(element,'.'+fixedBottom);
  
    // set instance options
    this[animation] = options[animation] && options[animation] !== fade ? options[animation] : animationData || fade;
    this[placement] = options[placement] ? options[placement] : placementData || top;
    this[delay] = parseInt(options[delay] || delayData) || 200;
    this[container] = containerElement ? containerElement 
                    : containerDataElement ? containerDataElement 
                    : navbarFixedTop ? navbarFixedTop
                    : navbarFixedBottom ? navbarFixedBottom
                    : modal ? modal : DOC[body];
  
    // bind, event targets, title and constants
    var self = this, timer = 0, placementSetting = this[placement], tooltip = null,
      titleString = element[getAttribute](title) || element[getAttribute](dataTitle) || element[getAttribute](dataOriginalTitle);
  
    if ( !titleString || titleString == "" ) return; // invalidate
  
    // private methods
    var removeToolTip = function() {
        self[container].removeChild(tooltip);
        tooltip = null; timer = null;
      },
      createToolTip = function() {
        titleString = element[getAttribute](title) || element[getAttribute](dataTitle) || element[getAttribute](dataOriginalTitle); // read the title again
        if ( !titleString || titleString == "" ) return false; // invalidate
        
        tooltip = DOC[createElement](div);
        tooltip[setAttribute]('role',component);
  
        var tooltipArrow = DOC[createElement](div), tooltipInner = DOC[createElement](div);
        tooltipArrow[setAttribute](classString, component+'-arrow'); tooltipInner[setAttribute](classString,component+'-inner');
  
        tooltip[appendChild](tooltipArrow); tooltip[appendChild](tooltipInner);
  
        tooltipInner[innerHTML] = titleString;
  
        self[container][appendChild](tooltip);
        tooltip[setAttribute](classString, component + ' ' + placementSetting + ' ' + self[animation]);
      },
      updateTooltip = function () {
        styleTip(element,tooltip,placementSetting,self[container]);
      },
      showTooltip = function () {
        !hasClass(tooltip,inClass) && ( addClass(tooltip,inClass) );
      },
      // triggers
      showTrigger = function() {
        bootstrapCustomEvent.call(element, shownEvent, component);
        !isIE8 && on( globalObject, resizeEvent, self.hide );      
      },
      hideTrigger = function() {
        !isIE8 && off( globalObject, resizeEvent, self.hide );      
        removeToolTip();
        bootstrapCustomEvent.call(element, hiddenEvent, component);
      };
  
    // public methods
    this.show = function() {
      clearTimeout(timer);
      timer = setTimeout( function() {
        if (tooltip === null) {
          placementSetting = self[placement]; // we reset placement in all cases
          if(createToolTip() == false) return;
          updateTooltip();
          showTooltip();
          bootstrapCustomEvent.call(element, showEvent, component);
          !!self[animation] ? emulateTransitionEnd(tooltip, showTrigger) : showTrigger();
        }
      }, 20 );
    };
    this.hide = function() {
      clearTimeout(timer);
      timer = setTimeout( function() {
        if (tooltip && hasClass(tooltip,inClass)) {
          bootstrapCustomEvent.call(element, hideEvent, component);
          removeClass(tooltip,inClass);
          !!self[animation] ? emulateTransitionEnd(tooltip, hideTrigger) : hideTrigger();
        }
      }, self[delay]);
    };
    this.toggle = function() {
      if (!tooltip) { self.show(); } 
      else { self.hide(); }
    };
  
    // init
    if ( !(stringTooltip in element) ) { // prevent adding event handlers twice
      element[setAttribute](dataOriginalTitle,titleString);
      element.removeAttribute(title);
      on(element, mouseHover[0], self.show);
      on(element, mouseHover[1], self.hide);
    }
    element[stringTooltip] = self;
  };
  
  // TOOLTIP DATA API
  // =================
  supports[push]( [ stringTooltip, Tooltip, '['+dataToggle+'="tooltip"]' ] );
  
  
  
  /* Native Javascript for Bootstrap 3 | Initialize Data API
  --------------------------------------------------------*/
  var initializeDataAPI = function( constructor, collection ){
      for (var i=0, l=collection[length]; i<l; i++) {
        new constructor(collection[i]);
      }
    },
    initCallback = BSN.initCallback = function(lookUp){
      lookUp = lookUp || DOC;
      for (var i=0, l=supports[length]; i<l; i++) {
        initializeDataAPI( supports[i][1], lookUp[querySelectorAll] (supports[i][2]) );
      }
    };
  
  // bulk initialize all components
  DOC[body] ? initCallback() : on( DOC, 'DOMContentLoaded', function(){ initCallback(); } );
  
  return {
    Affix: Affix,
    Alert: Alert,
    Button: Button,
    Carousel: Carousel,
    Collapse: Collapse,
    Dropdown: Dropdown,
    Modal: Modal,
    Popover: Popover,
    ScrollSpy: ScrollSpy,
    Tab: Tab,
    Tooltip: Tooltip
  };
}));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}]},{},[])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvdXRpbC9zaHVmZmxlLmpzIiwic3JjL2pzL3V0aWwvZ2V0SlNPTi5qcyIsInNyYy9qcy91dGlsL2ZhZGVPdXQuanMiLCJub2RlX21vZHVsZXMvYm9vdHN0cmFwLm5hdGl2ZS9kaXN0L2Jvb3RzdHJhcC1uYXRpdmUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiZnVuY3Rpb24gc2h1ZmZsZShhcnJheSkge1xuICAgIHZhciBjb3VudGVyID0gYXJyYXkubGVuZ3RoLFxuICAgICAgICB0ZW1wLCBpbmRleDtcblxuICAgIC8vIFdoaWxlIHRoZXJlIGFyZSBlbGVtZW50cyBpbiB0aGUgYXJyYXlcbiAgICB3aGlsZSAoY291bnRlciA+IDApIHtcbiAgICAgICAgLy8gUGljayBhIHJhbmRvbSBpbmRleFxuICAgICAgICBpbmRleCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGNvdW50ZXIpO1xuXG4gICAgICAgIC8vIERlY3JlYXNlIGNvdW50ZXIgYnkgMVxuICAgICAgICBjb3VudGVyLS07XG5cbiAgICAgICAgLy8gQW5kIHN3YXAgdGhlIGxhc3QgZWxlbWVudCB3aXRoIGl0XG4gICAgICAgIHRlbXAgPSBhcnJheVtjb3VudGVyXTtcbiAgICAgICAgYXJyYXlbY291bnRlcl0gPSBhcnJheVtpbmRleF07XG4gICAgICAgIGFycmF5W2luZGV4XSA9IHRlbXA7XG4gICAgfVxuXG4gICAgcmV0dXJuIGFycmF5O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBzaHVmZmxlOyIsImZ1bmN0aW9uIGdldEpTT04odXJsLCBjYWxsYmFjaywgZXJyKSB7XG4gIHZhciByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gIHJlcXVlc3Qub3BlbignR0VUJywgdXJsLCB0cnVlKTtcblxuICByZXF1ZXN0Lm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgIGlmIChyZXF1ZXN0LnN0YXR1cyA+PSAyMDAgJiYgcmVxdWVzdC5zdGF0dXMgPCA0MDApIHtcbiAgICAgIC8vIFN1Y2Nlc3MhXG4gICAgICB2YXIgZGF0YSA9IEpTT04ucGFyc2UocmVxdWVzdC5yZXNwb25zZVRleHQpO1xuICAgICAgY2FsbGJhY2soZGF0YSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFdlIHJlYWNoZWQgb3VyIHRhcmdldCBzZXJ2ZXIsIGJ1dCBpdCByZXR1cm5lZCBhbiBlcnJvclxuICAgICAgaWYgKGVycikgZXJyKCk7XG4gICAgfVxuICB9O1xuXG4gIHJlcXVlc3Qub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIFRoZXJlIHdhcyBhIGNvbm5lY3Rpb24gZXJyb3Igb2Ygc29tZSBzb3J0XG4gICAgaWYgKGVycikgZXJyKCk7XG4gIH07XG5cbiAgcmVxdWVzdC5zZW5kKCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0SlNPTjsiLCJmdW5jdGlvbiBmYWRlT3V0KGVsKSB7XG4gICAgdmFyIG9wYWNpdHkgPSAxO1xuXG4gICAgZWwuc3R5bGUub3BhY2l0eSA9IDE7XG4gICAgZWwuc3R5bGUuZmlsdGVyID0gJyc7XG5cbiAgICB2YXIgbGFzdCA9ICtuZXcgRGF0ZSgpO1xuICAgIHZhciB0aWNrID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIG9wYWNpdHkgLT0gKG5ldyBEYXRlKCkgLSBsYXN0KSAvIDQwMDtcbiAgICAgICAgZWwuc3R5bGUub3BhY2l0eSA9IG9wYWNpdHk7XG4gICAgICAgIGVsLnN0eWxlLmZpbHRlciA9ICdhbHBoYShvcGFjaXR5PScgKyAoMTAwICogb3BhY2l0eSl8MSArICcpJztcblxuICAgICAgICBsYXN0ID0gK25ldyBEYXRlKCk7XG5cbiAgICAgICAgaWYgKG9wYWNpdHkgPiAwKSB7XG4gICAgICAgICAgICAod2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSAmJiByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGljaykpIHx8IHNldFRpbWVvdXQodGljaywgMTYpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHRpY2soKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmYWRlT3V0OyIsIi8vIE5hdGl2ZSBKYXZhc2NyaXB0IGZvciBCb290c3RyYXAgMyB2Mi4wLjIxIHwgwqkgZG5wX3RoZW1lIHwgTUlULUxpY2Vuc2VcbihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgLy8gQU1EIHN1cHBvcnQ6XG4gICAgZGVmaW5lKFtdLCBmYWN0b3J5KTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cykge1xuICAgIC8vIENvbW1vbkpTLWxpa2U6XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG4gIH0gZWxzZSB7XG4gICAgLy8gQnJvd3NlciBnbG9iYWxzIChyb290IGlzIHdpbmRvdylcbiAgICB2YXIgYnNuID0gZmFjdG9yeSgpO1xuICAgIHJvb3QuQWZmaXggPSBic24uQWZmaXg7XG4gICAgcm9vdC5BbGVydCA9IGJzbi5BbGVydDtcbiAgICByb290LkJ1dHRvbiA9IGJzbi5CdXR0b247XG4gICAgcm9vdC5DYXJvdXNlbCA9IGJzbi5DYXJvdXNlbDtcbiAgICByb290LkNvbGxhcHNlID0gYnNuLkNvbGxhcHNlO1xuICAgIHJvb3QuRHJvcGRvd24gPSBic24uRHJvcGRvd247XG4gICAgcm9vdC5Nb2RhbCA9IGJzbi5Nb2RhbDtcbiAgICByb290LlBvcG92ZXIgPSBic24uUG9wb3ZlcjtcbiAgICByb290LlNjcm9sbFNweSA9IGJzbi5TY3JvbGxTcHk7XG4gICAgcm9vdC5UYWIgPSBic24uVGFiO1xuICAgIHJvb3QuVG9vbHRpcCA9IGJzbi5Ub29sdGlwO1xuICB9XG59KHRoaXMsIGZ1bmN0aW9uICgpIHtcbiAgXG4gIC8qIE5hdGl2ZSBKYXZhc2NyaXB0IGZvciBCb290c3RyYXAgMyB8IEludGVybmFsIFV0aWxpdHkgRnVuY3Rpb25zXG4gIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuICBcInVzZSBzdHJpY3RcIjtcbiAgXG4gIC8vIGdsb2JhbHNcbiAgdmFyIGdsb2JhbE9iamVjdCA9IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsIDogdGhpc3x8d2luZG93LFxuICAgIERPQyA9IGRvY3VtZW50LCBIVE1MID0gRE9DLmRvY3VtZW50RWxlbWVudCwgYm9keSA9ICdib2R5JywgLy8gYWxsb3cgdGhlIGxpYnJhcnkgdG8gYmUgdXNlZCBpbiA8aGVhZD5cbiAgXG4gICAgLy8gTmF0aXZlIEphdmFzY3JpcHQgZm9yIEJvb3RzdHJhcCBHbG9iYWwgT2JqZWN0XG4gICAgQlNOID0gZ2xvYmFsT2JqZWN0LkJTTiA9IHt9LFxuICAgIHN1cHBvcnRzID0gQlNOLnN1cHBvcnRzID0gW10sXG4gIFxuICAgIC8vIGZ1bmN0aW9uIHRvZ2dsZSBhdHRyaWJ1dGVzXG4gICAgZGF0YVRvZ2dsZSAgICA9ICdkYXRhLXRvZ2dsZScsXG4gICAgZGF0YURpc21pc3MgICA9ICdkYXRhLWRpc21pc3MnLFxuICAgIGRhdGFTcHkgICAgICAgPSAnZGF0YS1zcHknLFxuICAgIGRhdGFSaWRlICAgICAgPSAnZGF0YS1yaWRlJyxcbiAgICBcbiAgICAvLyBjb21wb25lbnRzXG4gICAgc3RyaW5nQWZmaXggICAgID0gJ0FmZml4JyxcbiAgICBzdHJpbmdBbGVydCAgICAgPSAnQWxlcnQnLFxuICAgIHN0cmluZ0J1dHRvbiAgICA9ICdCdXR0b24nLFxuICAgIHN0cmluZ0Nhcm91c2VsICA9ICdDYXJvdXNlbCcsXG4gICAgc3RyaW5nQ29sbGFwc2UgID0gJ0NvbGxhcHNlJyxcbiAgICBzdHJpbmdEcm9wZG93biAgPSAnRHJvcGRvd24nLFxuICAgIHN0cmluZ01vZGFsICAgICA9ICdNb2RhbCcsXG4gICAgc3RyaW5nUG9wb3ZlciAgID0gJ1BvcG92ZXInLFxuICAgIHN0cmluZ1Njcm9sbFNweSA9ICdTY3JvbGxTcHknLFxuICAgIHN0cmluZ1RhYiAgICAgICA9ICdUYWInLFxuICAgIHN0cmluZ1Rvb2x0aXAgICA9ICdUb29sdGlwJyxcbiAgXG4gICAgLy8gb3B0aW9ucyBEQVRBIEFQSVxuICAgIGRhdGFiYWNrZHJvcCAgICAgID0gJ2RhdGEtYmFja2Ryb3AnLFxuICAgIGRhdGFLZXlib2FyZCAgICAgID0gJ2RhdGEta2V5Ym9hcmQnLFxuICAgIGRhdGFUYXJnZXQgICAgICAgID0gJ2RhdGEtdGFyZ2V0JyxcbiAgICBkYXRhSW50ZXJ2YWwgICAgICA9ICdkYXRhLWludGVydmFsJyxcbiAgICBkYXRhSGVpZ2h0ICAgICAgICA9ICdkYXRhLWhlaWdodCcsXG4gICAgZGF0YVBhdXNlICAgICAgICAgPSAnZGF0YS1wYXVzZScsXG4gICAgZGF0YVRpdGxlICAgICAgICAgPSAnZGF0YS10aXRsZScsICBcbiAgICBkYXRhT3JpZ2luYWxUaXRsZSA9ICdkYXRhLW9yaWdpbmFsLXRpdGxlJyxcbiAgICBkYXRhT3JpZ2luYWxUZXh0ICA9ICdkYXRhLW9yaWdpbmFsLXRleHQnLFxuICAgIGRhdGFEaXNtaXNzaWJsZSAgID0gJ2RhdGEtZGlzbWlzc2libGUnLFxuICAgIGRhdGFUcmlnZ2VyICAgICAgID0gJ2RhdGEtdHJpZ2dlcicsXG4gICAgZGF0YUFuaW1hdGlvbiAgICAgPSAnZGF0YS1hbmltYXRpb24nLFxuICAgIGRhdGFDb250YWluZXIgICAgID0gJ2RhdGEtY29udGFpbmVyJyxcbiAgICBkYXRhUGxhY2VtZW50ICAgICA9ICdkYXRhLXBsYWNlbWVudCcsXG4gICAgZGF0YURlbGF5ICAgICAgICAgPSAnZGF0YS1kZWxheScsXG4gICAgZGF0YU9mZnNldFRvcCAgICAgPSAnZGF0YS1vZmZzZXQtdG9wJyxcbiAgICBkYXRhT2Zmc2V0Qm90dG9tICA9ICdkYXRhLW9mZnNldC1ib3R0b20nLFxuICBcbiAgICAvLyBvcHRpb24ga2V5c1xuICAgIGJhY2tkcm9wID0gJ2JhY2tkcm9wJywga2V5Ym9hcmQgPSAna2V5Ym9hcmQnLCBkZWxheSA9ICdkZWxheScsXG4gICAgY29udGVudCA9ICdjb250ZW50JywgdGFyZ2V0ID0gJ3RhcmdldCcsIFxuICAgIGludGVydmFsID0gJ2ludGVydmFsJywgcGF1c2UgPSAncGF1c2UnLCBhbmltYXRpb24gPSAnYW5pbWF0aW9uJyxcbiAgICBwbGFjZW1lbnQgPSAncGxhY2VtZW50JywgY29udGFpbmVyID0gJ2NvbnRhaW5lcicsIFxuICBcbiAgICAvLyBib3ggbW9kZWxcbiAgICBvZmZzZXRUb3AgICAgPSAnb2Zmc2V0VG9wJywgICAgICBvZmZzZXRCb3R0b20gICA9ICdvZmZzZXRCb3R0b20nLFxuICAgIG9mZnNldExlZnQgICA9ICdvZmZzZXRMZWZ0JyxcbiAgICBzY3JvbGxUb3AgICAgPSAnc2Nyb2xsVG9wJywgICAgICBzY3JvbGxMZWZ0ICAgICA9ICdzY3JvbGxMZWZ0JyxcbiAgICBjbGllbnRXaWR0aCAgPSAnY2xpZW50V2lkdGgnLCAgICBjbGllbnRIZWlnaHQgICA9ICdjbGllbnRIZWlnaHQnLFxuICAgIG9mZnNldFdpZHRoICA9ICdvZmZzZXRXaWR0aCcsICAgIG9mZnNldEhlaWdodCAgID0gJ29mZnNldEhlaWdodCcsXG4gICAgaW5uZXJXaWR0aCAgID0gJ2lubmVyV2lkdGgnLCAgICAgaW5uZXJIZWlnaHQgICAgPSAnaW5uZXJIZWlnaHQnLFxuICAgIHNjcm9sbEhlaWdodCA9ICdzY3JvbGxIZWlnaHQnLCAgIGhlaWdodCAgICAgICAgID0gJ2hlaWdodCcsXG4gIFxuICAgIC8vIGFyaWFcbiAgICBhcmlhRXhwYW5kZWQgPSAnYXJpYS1leHBhbmRlZCcsXG4gICAgYXJpYUhpZGRlbiAgID0gJ2FyaWEtaGlkZGVuJyxcbiAgXG4gICAgLy8gZXZlbnQgbmFtZXNcbiAgICBjbGlja0V2ZW50ICAgID0gJ2NsaWNrJyxcbiAgICBob3ZlckV2ZW50ICAgID0gJ2hvdmVyJyxcbiAgICBrZXlkb3duRXZlbnQgID0gJ2tleWRvd24nLFxuICAgIGtleXVwRXZlbnQgICAgPSAna2V5dXAnLCAgXG4gICAgcmVzaXplRXZlbnQgICA9ICdyZXNpemUnLFxuICAgIHNjcm9sbEV2ZW50ICAgPSAnc2Nyb2xsJyxcbiAgICAvLyBvcmlnaW5hbEV2ZW50c1xuICAgIHNob3dFdmVudCAgICAgPSAnc2hvdycsXG4gICAgc2hvd25FdmVudCAgICA9ICdzaG93bicsXG4gICAgaGlkZUV2ZW50ICAgICA9ICdoaWRlJyxcbiAgICBoaWRkZW5FdmVudCAgID0gJ2hpZGRlbicsXG4gICAgY2xvc2VFdmVudCAgICA9ICdjbG9zZScsXG4gICAgY2xvc2VkRXZlbnQgICA9ICdjbG9zZWQnLFxuICAgIHNsaWRFdmVudCAgICAgPSAnc2xpZCcsXG4gICAgc2xpZGVFdmVudCAgICA9ICdzbGlkZScsXG4gICAgY2hhbmdlRXZlbnQgICA9ICdjaGFuZ2UnLFxuICBcbiAgICAvLyBvdGhlclxuICAgIGdldEF0dHJpYnV0ZSAgICAgICAgICAgPSAnZ2V0QXR0cmlidXRlJyxcbiAgICBzZXRBdHRyaWJ1dGUgICAgICAgICAgID0gJ3NldEF0dHJpYnV0ZScsXG4gICAgaGFzQXR0cmlidXRlICAgICAgICAgICA9ICdoYXNBdHRyaWJ1dGUnLFxuICAgIGNyZWF0ZUVsZW1lbnQgICAgICAgICAgPSAnY3JlYXRlRWxlbWVudCcsXG4gICAgYXBwZW5kQ2hpbGQgICAgICAgICAgICA9ICdhcHBlbmRDaGlsZCcsXG4gICAgaW5uZXJIVE1MICAgICAgICAgICAgICA9ICdpbm5lckhUTUwnLFxuICAgIGdldEVsZW1lbnRzQnlUYWdOYW1lICAgPSAnZ2V0RWxlbWVudHNCeVRhZ05hbWUnLFxuICAgIHByZXZlbnREZWZhdWx0ICAgICAgICAgPSAncHJldmVudERlZmF1bHQnLFxuICAgIGdldEJvdW5kaW5nQ2xpZW50UmVjdCAgPSAnZ2V0Qm91bmRpbmdDbGllbnRSZWN0JyxcbiAgICBxdWVyeVNlbGVjdG9yQWxsICAgICAgID0gJ3F1ZXJ5U2VsZWN0b3JBbGwnLFxuICAgIGdldEVsZW1lbnRzQnlDTEFTU05BTUUgPSAnZ2V0RWxlbWVudHNCeUNsYXNzTmFtZScsXG4gIFxuICAgIGluZGV4T2YgICAgICA9ICdpbmRleE9mJyxcbiAgICBwYXJlbnROb2RlICAgPSAncGFyZW50Tm9kZScsXG4gICAgbGVuZ3RoICAgICAgID0gJ2xlbmd0aCcsXG4gICAgdG9Mb3dlckNhc2UgID0gJ3RvTG93ZXJDYXNlJyxcbiAgICBUcmFuc2l0aW9uICAgPSAnVHJhbnNpdGlvbicsXG4gICAgV2Via2l0ICAgICAgID0gJ1dlYmtpdCcsXG4gICAgc3R5bGUgICAgICAgID0gJ3N0eWxlJyxcbiAgICBwdXNoICAgICAgICAgPSAncHVzaCcsXG4gICAgdGFiaW5kZXggICAgID0gJ3RhYmluZGV4JyxcbiAgICBjb250YWlucyAgICAgPSAnY29udGFpbnMnLCAgXG4gICAgXG4gICAgYWN0aXZlICAgICA9ICdhY3RpdmUnLFxuICAgIGluQ2xhc3MgICAgPSAnaW4nLFxuICAgIGNvbGxhcHNpbmcgPSAnY29sbGFwc2luZycsXG4gICAgZGlzYWJsZWQgICA9ICdkaXNhYmxlZCcsXG4gICAgbG9hZGluZyAgICA9ICdsb2FkaW5nJyxcbiAgICBsZWZ0ICAgICAgID0gJ2xlZnQnLFxuICAgIHJpZ2h0ICAgICAgPSAncmlnaHQnLFxuICAgIHRvcCAgICAgICAgPSAndG9wJyxcbiAgICBib3R0b20gICAgID0gJ2JvdHRvbScsXG4gIFxuICAgIC8vIElFOCBicm93c2VyIGRldGVjdFxuICAgIGlzSUU4ID0gISgnb3BhY2l0eScgaW4gSFRNTFtzdHlsZV0pLFxuICBcbiAgICAvLyB0b29sdGlwIC8gcG9wb3ZlclxuICAgIG1vdXNlSG92ZXIgPSAoJ29ubW91c2VsZWF2ZScgaW4gRE9DKSA/IFsgJ21vdXNlZW50ZXInLCAnbW91c2VsZWF2ZSddIDogWyAnbW91c2VvdmVyJywgJ21vdXNlb3V0JyBdLFxuICAgIHRpcFBvc2l0aW9ucyA9IC9cXGIodG9wfGJvdHRvbXxsZWZ0fHJpZ2h0KSsvLFxuICAgIFxuICAgIC8vIG1vZGFsXG4gICAgbW9kYWxPdmVybGF5ID0gMCxcbiAgICBmaXhlZFRvcCA9ICduYXZiYXItZml4ZWQtdG9wJyxcbiAgICBmaXhlZEJvdHRvbSA9ICduYXZiYXItZml4ZWQtYm90dG9tJywgIFxuICAgIFxuICAgIC8vIHRyYW5zaXRpb25FbmQgc2luY2UgMi4wLjRcbiAgICBzdXBwb3J0VHJhbnNpdGlvbnMgPSBXZWJraXQrVHJhbnNpdGlvbiBpbiBIVE1MW3N0eWxlXSB8fCBUcmFuc2l0aW9uW3RvTG93ZXJDYXNlXSgpIGluIEhUTUxbc3R5bGVdLFxuICAgIHRyYW5zaXRpb25FbmRFdmVudCA9IFdlYmtpdCtUcmFuc2l0aW9uIGluIEhUTUxbc3R5bGVdID8gV2Via2l0W3RvTG93ZXJDYXNlXSgpK1RyYW5zaXRpb24rJ0VuZCcgOiBUcmFuc2l0aW9uW3RvTG93ZXJDYXNlXSgpKydlbmQnLFxuICBcbiAgICAvLyBzZXQgbmV3IGZvY3VzIGVsZW1lbnQgc2luY2UgMi4wLjNcbiAgICBzZXRGb2N1cyA9IGZ1bmN0aW9uKGVsZW1lbnQpe1xuICAgICAgZWxlbWVudC5mb2N1cyA/IGVsZW1lbnQuZm9jdXMoKSA6IGVsZW1lbnQuc2V0QWN0aXZlKCk7XG4gICAgfSxcbiAgXG4gICAgLy8gY2xhc3MgbWFuaXB1bGF0aW9uLCBzaW5jZSAyLjAuMCByZXF1aXJlcyBwb2x5ZmlsbC5qc1xuICAgIGFkZENsYXNzID0gZnVuY3Rpb24oZWxlbWVudCxjbGFzc05BTUUpIHtcbiAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZChjbGFzc05BTUUpO1xuICAgIH0sXG4gICAgcmVtb3ZlQ2xhc3MgPSBmdW5jdGlvbihlbGVtZW50LGNsYXNzTkFNRSkge1xuICAgICAgZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKGNsYXNzTkFNRSk7XG4gICAgfSxcbiAgICBoYXNDbGFzcyA9IGZ1bmN0aW9uKGVsZW1lbnQsY2xhc3NOQU1FKXsgLy8gc2luY2UgMi4wLjBcbiAgICAgIHJldHVybiBlbGVtZW50LmNsYXNzTGlzdFtjb250YWluc10oY2xhc3NOQU1FKTtcbiAgICB9LFxuICBcbiAgICAvLyBzZWxlY3Rpb24gbWV0aG9kc1xuICAgIG5vZGVMaXN0VG9BcnJheSA9IGZ1bmN0aW9uKG5vZGVMaXN0KXtcbiAgICAgIHZhciBjaGlsZEl0ZW1zID0gW107IGZvciAodmFyIGkgPSAwLCBubGwgPSBub2RlTGlzdFtsZW5ndGhdOyBpPG5sbDsgaSsrKSB7IGNoaWxkSXRlbXNbcHVzaF0oIG5vZGVMaXN0W2ldICkgfVxuICAgICAgcmV0dXJuIGNoaWxkSXRlbXM7XG4gICAgfSxcbiAgICBnZXRFbGVtZW50c0J5Q2xhc3NOYW1lID0gZnVuY3Rpb24oZWxlbWVudCxjbGFzc05BTUUpIHsgLy8gZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSBJRTgrXG4gICAgICB2YXIgc2VsZWN0aW9uTWV0aG9kID0gaXNJRTggPyBxdWVyeVNlbGVjdG9yQWxsIDogZ2V0RWxlbWVudHNCeUNMQVNTTkFNRTsgICAgICBcbiAgICAgIHJldHVybiBub2RlTGlzdFRvQXJyYXkoZWxlbWVudFtzZWxlY3Rpb25NZXRob2RdKCBpc0lFOCA/ICcuJyArIGNsYXNzTkFNRS5yZXBsYWNlKC9cXHMoPz1bYS16XSkvZywnLicpIDogY2xhc3NOQU1FICkpO1xuICAgIH0sXG4gICAgcXVlcnlFbGVtZW50ID0gZnVuY3Rpb24gKHNlbGVjdG9yLCBwYXJlbnQpIHtcbiAgICAgIHZhciBsb29rVXAgPSBwYXJlbnQgPyBwYXJlbnQgOiBET0M7XG4gICAgICByZXR1cm4gdHlwZW9mIHNlbGVjdG9yID09PSAnb2JqZWN0JyA/IHNlbGVjdG9yIDogbG9va1VwLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuICAgIH0sXG4gICAgZ2V0Q2xvc2VzdCA9IGZ1bmN0aW9uIChlbGVtZW50LCBzZWxlY3RvcikgeyAvL2VsZW1lbnQgaXMgdGhlIGVsZW1lbnQgYW5kIHNlbGVjdG9yIGlzIGZvciB0aGUgY2xvc2VzdCBwYXJlbnQgZWxlbWVudCB0byBmaW5kXG4gICAgICAvLyBzb3VyY2UgaHR0cDovL2dvbWFrZXRoaW5ncy5jb20vY2xpbWJpbmctdXAtYW5kLWRvd24tdGhlLWRvbS10cmVlLXdpdGgtdmFuaWxsYS1qYXZhc2NyaXB0L1xuICAgICAgdmFyIGZpcnN0Q2hhciA9IHNlbGVjdG9yLmNoYXJBdCgwKSwgc2VsZWN0b3JTdWJzdHJpbmcgPSBzZWxlY3Rvci5zdWJzdHIoMSk7XG4gICAgICBpZiAoIGZpcnN0Q2hhciA9PT0gJy4nICkgey8vIElmIHNlbGVjdG9yIGlzIGEgY2xhc3NcbiAgICAgICAgZm9yICggOyBlbGVtZW50ICYmIGVsZW1lbnQgIT09IERPQzsgZWxlbWVudCA9IGVsZW1lbnRbcGFyZW50Tm9kZV0gKSB7IC8vIEdldCBjbG9zZXN0IG1hdGNoXG4gICAgICAgICAgaWYgKCBxdWVyeUVsZW1lbnQoc2VsZWN0b3IsZWxlbWVudFtwYXJlbnROb2RlXSkgIT09IG51bGwgJiYgaGFzQ2xhc3MoZWxlbWVudCxzZWxlY3RvclN1YnN0cmluZykgKSB7IHJldHVybiBlbGVtZW50OyB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoIGZpcnN0Q2hhciA9PT0gJyMnICkgeyAvLyBJZiBzZWxlY3RvciBpcyBhbiBJRFxuICAgICAgICBmb3IgKCA7IGVsZW1lbnQgJiYgZWxlbWVudCAhPT0gRE9DOyBlbGVtZW50ID0gZWxlbWVudFtwYXJlbnROb2RlXSApIHsgLy8gR2V0IGNsb3Nlc3QgbWF0Y2hcbiAgICAgICAgICBpZiAoIGVsZW1lbnQuaWQgPT09IHNlbGVjdG9yU3Vic3RyaW5nICkgeyByZXR1cm4gZWxlbWVudDsgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSxcbiAgXG4gICAgLy8gZXZlbnQgYXR0YWNoIGpRdWVyeSBzdHlsZSAvIHRyaWdnZXIgIHNpbmNlIDEuMi4wXG4gICAgb24gPSBmdW5jdGlvbiAoZWxlbWVudCwgZXZlbnQsIGhhbmRsZXIpIHtcbiAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgaGFuZGxlciwgZmFsc2UpO1xuICAgIH0sXG4gICAgb2ZmID0gZnVuY3Rpb24oZWxlbWVudCwgZXZlbnQsIGhhbmRsZXIpIHtcbiAgICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudCwgaGFuZGxlciwgZmFsc2UpO1xuICAgIH0sXG4gICAgb25lID0gZnVuY3Rpb24gKGVsZW1lbnQsIGV2ZW50LCBoYW5kbGVyKSB7IC8vIG9uZSBzaW5jZSAyLjAuNFxuICAgICAgb24oZWxlbWVudCwgZXZlbnQsIGZ1bmN0aW9uIGhhbmRsZXJXcmFwcGVyKGUpe1xuICAgICAgICBoYW5kbGVyKGUpO1xuICAgICAgICBvZmYoZWxlbWVudCwgZXZlbnQsIGhhbmRsZXJXcmFwcGVyKTtcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgZW11bGF0ZVRyYW5zaXRpb25FbmQgPSBmdW5jdGlvbihlbGVtZW50LGhhbmRsZXIpeyAvLyBlbXVsYXRlVHJhbnNpdGlvbkVuZCBzaW5jZSAyLjAuNFxuICAgICAgaWYgKHN1cHBvcnRUcmFuc2l0aW9ucykgeyBvbmUoZWxlbWVudCwgdHJhbnNpdGlvbkVuZEV2ZW50LCBmdW5jdGlvbihlKXsgaGFuZGxlcihlKTsgfSk7IH0gXG4gICAgICBlbHNlIHsgaGFuZGxlcigpOyB9XG4gICAgfSxcbiAgICBib290c3RyYXBDdXN0b21FdmVudCA9IGZ1bmN0aW9uIChldmVudE5hbWUsIGNvbXBvbmVudE5hbWUsIHJlbGF0ZWQpIHtcbiAgICAgIHZhciBPcmlnaW5hbEN1c3RvbUV2ZW50ID0gbmV3IEN1c3RvbUV2ZW50KCBldmVudE5hbWUgKyAnLmJzLicgKyBjb21wb25lbnROYW1lKTtcbiAgICAgIE9yaWdpbmFsQ3VzdG9tRXZlbnQucmVsYXRlZFRhcmdldCA9IHJlbGF0ZWQ7XG4gICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoT3JpZ2luYWxDdXN0b21FdmVudCk7XG4gICAgfSxcbiAgXG4gICAgLy8gdG9vbHRpcCAvIHBvcG92ZXIgc3R1ZmZcbiAgICBnZXRTY3JvbGwgPSBmdW5jdGlvbigpIHsgLy8gYWxzbyBBZmZpeCBhbmQgU2Nyb2xsU3B5IHVzZXMgaXRcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHkgOiBnbG9iYWxPYmplY3QucGFnZVlPZmZzZXQgfHwgSFRNTFtzY3JvbGxUb3BdLFxuICAgICAgICB4IDogZ2xvYmFsT2JqZWN0LnBhZ2VYT2Zmc2V0IHx8IEhUTUxbc2Nyb2xsTGVmdF1cbiAgICAgIH1cbiAgICB9LFxuICAgIHN0eWxlVGlwID0gZnVuY3Rpb24obGluayxlbGVtZW50LHBvc2l0aW9uLHBhcmVudCkgeyAvLyBib3RoIHBvcG92ZXJzIGFuZCB0b29sdGlwcyAodGFyZ2V0LHRvb2x0aXAvcG9wb3ZlcixwbGFjZW1lbnQsZWxlbWVudFRvQXBwZW5kVG8pXG4gICAgICB2YXIgZWxlbWVudERpbWVuc2lvbnMgPSB7IHcgOiBlbGVtZW50W29mZnNldFdpZHRoXSwgaDogZWxlbWVudFtvZmZzZXRIZWlnaHRdIH0sXG4gICAgICAgICAgd2luZG93V2lkdGggPSAoSFRNTFtjbGllbnRXaWR0aF0gfHwgRE9DW2JvZHldW2NsaWVudFdpZHRoXSksXG4gICAgICAgICAgd2luZG93SGVpZ2h0ID0gKEhUTUxbY2xpZW50SGVpZ2h0XSB8fCBET0NbYm9keV1bY2xpZW50SGVpZ2h0XSksXG4gICAgICAgICAgcmVjdCA9IGxpbmtbZ2V0Qm91bmRpbmdDbGllbnRSZWN0XSgpLCBcbiAgICAgICAgICBzY3JvbGwgPSBwYXJlbnQgPT09IERPQ1tib2R5XSA/IGdldFNjcm9sbCgpIDogeyB4OiBwYXJlbnRbb2Zmc2V0TGVmdF0gKyBwYXJlbnRbc2Nyb2xsTGVmdF0sIHk6IHBhcmVudFtvZmZzZXRUb3BdICsgcGFyZW50W3Njcm9sbFRvcF0gfSxcbiAgICAgICAgICBsaW5rRGltZW5zaW9ucyA9IHsgdzogcmVjdFtyaWdodF0gLSByZWN0W2xlZnRdLCBoOiByZWN0W2JvdHRvbV0gLSByZWN0W3RvcF0gfSxcbiAgICAgICAgICBhcnJvdyA9IHF1ZXJ5RWxlbWVudCgnW2NsYXNzKj1cImFycm93XCJdJyxlbGVtZW50KSxcbiAgICAgICAgICB0b3BQb3NpdGlvbiwgbGVmdFBvc2l0aW9uLCBhcnJvd1RvcCwgYXJyb3dMZWZ0LFxuICBcbiAgICAgICAgICBoYWxmVG9wRXhjZWVkID0gcmVjdFt0b3BdICsgbGlua0RpbWVuc2lvbnMuaC8yIC0gZWxlbWVudERpbWVuc2lvbnMuaC8yIDwgMCxcbiAgICAgICAgICBoYWxmTGVmdEV4Y2VlZCA9IHJlY3RbbGVmdF0gKyBsaW5rRGltZW5zaW9ucy53LzIgLSBlbGVtZW50RGltZW5zaW9ucy53LzIgPCAwLFxuICAgICAgICAgIGhhbGZSaWdodEV4Y2VlZCA9IHJlY3RbbGVmdF0gKyBlbGVtZW50RGltZW5zaW9ucy53LzIgKyBsaW5rRGltZW5zaW9ucy53LzIgPj0gd2luZG93V2lkdGgsXG4gICAgICAgICAgaGFsZkJvdHRvbUV4Y2VlZCA9IHJlY3RbdG9wXSArIGVsZW1lbnREaW1lbnNpb25zLmgvMiArIGxpbmtEaW1lbnNpb25zLmgvMiA+PSB3aW5kb3dIZWlnaHQsXG4gICAgICAgICAgdG9wRXhjZWVkID0gcmVjdFt0b3BdIC0gZWxlbWVudERpbWVuc2lvbnMuaCA8IDAsXG4gICAgICAgICAgbGVmdEV4Y2VlZCA9IHJlY3RbbGVmdF0gLSBlbGVtZW50RGltZW5zaW9ucy53IDwgMCxcbiAgICAgICAgICBib3R0b21FeGNlZWQgPSByZWN0W3RvcF0gKyBlbGVtZW50RGltZW5zaW9ucy5oICsgbGlua0RpbWVuc2lvbnMuaCA+PSB3aW5kb3dIZWlnaHQsXG4gICAgICAgICAgcmlnaHRFeGNlZWQgPSByZWN0W2xlZnRdICsgZWxlbWVudERpbWVuc2lvbnMudyArIGxpbmtEaW1lbnNpb25zLncgPj0gd2luZG93V2lkdGg7XG4gIFxuICAgICAgLy8gcmVjb21wdXRlIHBvc2l0aW9uXG4gICAgICBwb3NpdGlvbiA9IChwb3NpdGlvbiA9PT0gbGVmdCB8fCBwb3NpdGlvbiA9PT0gcmlnaHQpICYmIGxlZnRFeGNlZWQgJiYgcmlnaHRFeGNlZWQgPyB0b3AgOiBwb3NpdGlvbjsgLy8gZmlyc3QsIHdoZW4gYm90aCBsZWZ0IGFuZCByaWdodCBsaW1pdHMgYXJlIGV4Y2VlZGVkLCB3ZSBmYWxsIGJhY2sgdG8gdG9wfGJvdHRvbVxuICAgICAgcG9zaXRpb24gPSBwb3NpdGlvbiA9PT0gdG9wICYmIHRvcEV4Y2VlZCA/IGJvdHRvbSA6IHBvc2l0aW9uO1xuICAgICAgcG9zaXRpb24gPSBwb3NpdGlvbiA9PT0gYm90dG9tICYmIGJvdHRvbUV4Y2VlZCA/IHRvcCA6IHBvc2l0aW9uO1xuICAgICAgcG9zaXRpb24gPSBwb3NpdGlvbiA9PT0gbGVmdCAmJiBsZWZ0RXhjZWVkID8gcmlnaHQgOiBwb3NpdGlvbjtcbiAgICAgIHBvc2l0aW9uID0gcG9zaXRpb24gPT09IHJpZ2h0ICYmIHJpZ2h0RXhjZWVkID8gbGVmdCA6IHBvc2l0aW9uO1xuICAgICAgXG4gICAgICAvLyBhcHBseSBzdHlsaW5nIHRvIHRvb2x0aXAgb3IgcG9wb3ZlclxuICAgICAgaWYgKCBwb3NpdGlvbiA9PT0gbGVmdCB8fCBwb3NpdGlvbiA9PT0gcmlnaHQgKSB7IC8vIHNlY29uZGFyeXxzaWRlIHBvc2l0aW9uc1xuICAgICAgICBpZiAoIHBvc2l0aW9uID09PSBsZWZ0ICkgeyAvLyBMRUZUXG4gICAgICAgICAgbGVmdFBvc2l0aW9uID0gcmVjdFtsZWZ0XSArIHNjcm9sbC54IC0gZWxlbWVudERpbWVuc2lvbnMudztcbiAgICAgICAgfSBlbHNlIHsgLy8gUklHSFRcbiAgICAgICAgICBsZWZ0UG9zaXRpb24gPSByZWN0W2xlZnRdICsgc2Nyb2xsLnggKyBsaW5rRGltZW5zaW9ucy53O1xuICAgICAgICB9XG4gIFxuICAgICAgICAvLyBhZGp1c3QgdG9wIGFuZCBhcnJvd1xuICAgICAgICBpZiAoaGFsZlRvcEV4Y2VlZCkge1xuICAgICAgICAgIHRvcFBvc2l0aW9uID0gcmVjdFt0b3BdICsgc2Nyb2xsLnk7XG4gICAgICAgICAgYXJyb3dUb3AgPSBsaW5rRGltZW5zaW9ucy5oLzI7XG4gICAgICAgIH0gZWxzZSBpZiAoaGFsZkJvdHRvbUV4Y2VlZCkge1xuICAgICAgICAgIHRvcFBvc2l0aW9uID0gcmVjdFt0b3BdICsgc2Nyb2xsLnkgLSBlbGVtZW50RGltZW5zaW9ucy5oICsgbGlua0RpbWVuc2lvbnMuaDtcbiAgICAgICAgICBhcnJvd1RvcCA9IGVsZW1lbnREaW1lbnNpb25zLmggLSBsaW5rRGltZW5zaW9ucy5oLzI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdG9wUG9zaXRpb24gPSByZWN0W3RvcF0gKyBzY3JvbGwueSAtIGVsZW1lbnREaW1lbnNpb25zLmgvMiArIGxpbmtEaW1lbnNpb25zLmgvMjtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICggcG9zaXRpb24gPT09IHRvcCB8fCBwb3NpdGlvbiA9PT0gYm90dG9tICkgeyAvLyBwcmltYXJ5fHZlcnRpY2FsIHBvc2l0aW9uc1xuICAgICAgICBpZiAoIHBvc2l0aW9uID09PSB0b3ApIHsgLy8gVE9QXG4gICAgICAgICAgdG9wUG9zaXRpb24gPSAgcmVjdFt0b3BdICsgc2Nyb2xsLnkgLSBlbGVtZW50RGltZW5zaW9ucy5oO1xuICAgICAgICB9IGVsc2UgeyAvLyBCT1RUT01cbiAgICAgICAgICB0b3BQb3NpdGlvbiA9IHJlY3RbdG9wXSArIHNjcm9sbC55ICsgbGlua0RpbWVuc2lvbnMuaDtcbiAgICAgICAgfVxuICAgICAgICAvLyBhZGp1c3QgbGVmdCB8IHJpZ2h0IGFuZCBhbHNvIHRoZSBhcnJvd1xuICAgICAgICBpZiAoaGFsZkxlZnRFeGNlZWQpIHtcbiAgICAgICAgICBsZWZ0UG9zaXRpb24gPSAwO1xuICAgICAgICAgIGFycm93TGVmdCA9IHJlY3RbbGVmdF0gKyBsaW5rRGltZW5zaW9ucy53LzI7XG4gICAgICAgIH0gZWxzZSBpZiAoaGFsZlJpZ2h0RXhjZWVkKSB7XG4gICAgICAgICAgbGVmdFBvc2l0aW9uID0gd2luZG93V2lkdGggLSBlbGVtZW50RGltZW5zaW9ucy53KjEuMDE7XG4gICAgICAgICAgYXJyb3dMZWZ0ID0gZWxlbWVudERpbWVuc2lvbnMudyAtICggd2luZG93V2lkdGggLSByZWN0W2xlZnRdICkgKyBsaW5rRGltZW5zaW9ucy53LzI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbGVmdFBvc2l0aW9uID0gcmVjdFtsZWZ0XSArIHNjcm9sbC54IC0gZWxlbWVudERpbWVuc2lvbnMudy8yICsgbGlua0RpbWVuc2lvbnMudy8yO1xuICAgICAgICB9XG4gICAgICB9XG4gIFxuICAgICAgLy8gYXBwbHkgc3R5bGUgdG8gdG9vbHRpcC9wb3BvdmVyIGFuZCBpdCdzIGFycm93XG4gICAgICBlbGVtZW50W3N0eWxlXVt0b3BdID0gdG9wUG9zaXRpb24gKyAncHgnO1xuICAgICAgZWxlbWVudFtzdHlsZV1bbGVmdF0gPSBsZWZ0UG9zaXRpb24gKyAncHgnO1xuICBcbiAgICAgIGFycm93VG9wICYmIChhcnJvd1tzdHlsZV1bdG9wXSA9IGFycm93VG9wICsgJ3B4Jyk7XG4gICAgICBhcnJvd0xlZnQgJiYgKGFycm93W3N0eWxlXVtsZWZ0XSA9IGFycm93TGVmdCArICdweCcpO1xuICBcbiAgICAgIGVsZW1lbnQuY2xhc3NOYW1lW2luZGV4T2ZdKHBvc2l0aW9uKSA9PT0gLTEgJiYgKGVsZW1lbnQuY2xhc3NOYW1lID0gZWxlbWVudC5jbGFzc05hbWUucmVwbGFjZSh0aXBQb3NpdGlvbnMscG9zaXRpb24pKTtcbiAgICB9O1xuICBcbiAgQlNOLnZlcnNpb24gPSAnMi4wLjIxJztcbiAgXG4gIC8qIE5hdGl2ZSBKYXZhc2NyaXB0IGZvciBCb290c3RyYXAgMyB8IEFmZml4XG4gIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuICBcbiAgLy9BRkZJWCBERUZJTklUSU9OXG4gIHZhciBBZmZpeCA9IGZ1bmN0aW9uKGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgXG4gICAgLy8gaW5pdGlhbGl6YXRpb24gZWxlbWVudFxuICAgIGVsZW1lbnQgPSBxdWVyeUVsZW1lbnQoZWxlbWVudCk7XG4gIFxuICAgIC8vIHNldCBvcHRpb25zXG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIFxuICAgIC8vIHJlYWQgREFUQSBBUElcbiAgICB2YXIgdGFyZ2V0RGF0YSAgICAgICAgPSBlbGVtZW50W2dldEF0dHJpYnV0ZV0oZGF0YVRhcmdldCksXG4gICAgICAgIG9mZnNldFRvcERhdGEgICAgID0gZWxlbWVudFtnZXRBdHRyaWJ1dGVdKGRhdGFPZmZzZXRUb3ApLFxuICAgICAgICBvZmZzZXRCb3R0b21EYXRhICA9IGVsZW1lbnRbZ2V0QXR0cmlidXRlXShkYXRhT2Zmc2V0Qm90dG9tKSxcbiAgICAgICAgXG4gICAgICAgIC8vIGNvbXBvbmVudCBzcGVjaWZpYyBzdHJpbmdzXG4gICAgICAgIGFmZml4ID0gJ2FmZml4JywgYWZmaXhlZCA9ICdhZmZpeGVkJywgZm4gPSAnZnVuY3Rpb24nLCB1cGRhdGUgPSAndXBkYXRlJyxcbiAgICAgICAgYWZmaXhUb3AgPSAnYWZmaXgtdG9wJywgYWZmaXhlZFRvcCA9ICdhZmZpeGVkLXRvcCcsXG4gICAgICAgIGFmZml4Qm90dG9tID0gJ2FmZml4LWJvdHRvbScsIGFmZml4ZWRCb3R0b20gPSAnYWZmaXhlZC1ib3R0b20nO1xuICBcbiAgICB0aGlzW3RhcmdldF0gPSBvcHRpb25zW3RhcmdldF0gPyBxdWVyeUVsZW1lbnQob3B0aW9uc1t0YXJnZXRdKSA6IHF1ZXJ5RWxlbWVudCh0YXJnZXREYXRhKSB8fCBudWxsOyAvLyB0YXJnZXQgaXMgYW4gb2JqZWN0XG4gICAgdGhpc1tvZmZzZXRUb3BdID0gb3B0aW9uc1tvZmZzZXRUb3BdID8gb3B0aW9uc1tvZmZzZXRUb3BdIDogcGFyc2VJbnQob2Zmc2V0VG9wRGF0YSkgfHwgMDsgLy8gb2Zmc2V0IG9wdGlvbiBpcyBhbiBpbnRlZ2VyIG51bWJlciBvciBmdW5jdGlvbiB0byBkZXRlcm1pbmUgdGhhdCBudW1iZXJcbiAgICB0aGlzW29mZnNldEJvdHRvbV0gPSBvcHRpb25zW29mZnNldEJvdHRvbV0gPyBvcHRpb25zW29mZnNldEJvdHRvbV06IHBhcnNlSW50KG9mZnNldEJvdHRvbURhdGEpIHx8IDA7XG4gIFxuICAgIGlmICggIXRoaXNbdGFyZ2V0XSAmJiAhKCB0aGlzW29mZnNldFRvcF0gfHwgdGhpc1tvZmZzZXRCb3R0b21dICkgKSB7IHJldHVybjsgfSAvLyBpbnZhbGlkYXRlXG4gIFxuICAgIC8vIGludGVybmFsIGJpbmRcbiAgICB2YXIgc2VsZiA9IHRoaXMsXG4gIFxuICAgICAgLy8gY29uc3RhbnRzXG4gICAgICBwaW5PZmZzZXRUb3AsIHBpbk9mZnNldEJvdHRvbSwgbWF4U2Nyb2xsLCBzY3JvbGxZLCBwaW5uZWRUb3AsIHBpbm5lZEJvdHRvbSxcbiAgICAgIGFmZml4ZWRUb1RvcCA9IGZhbHNlLCBhZmZpeGVkVG9Cb3R0b20gPSBmYWxzZSxcbiAgICAgIFxuICAgICAgLy8gcHJpdmF0ZSBtZXRob2RzIFxuICAgICAgZ2V0TWF4U2Nyb2xsID0gZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIE1hdGgubWF4KCBET0NbYm9keV1bc2Nyb2xsSGVpZ2h0XSwgRE9DW2JvZHldW29mZnNldEhlaWdodF0sIEhUTUxbY2xpZW50SGVpZ2h0XSwgSFRNTFtzY3JvbGxIZWlnaHRdLCBIVE1MW29mZnNldEhlaWdodF0gKTtcbiAgICAgIH0sXG4gICAgICBnZXRPZmZzZXRUb3AgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICggc2VsZlt0YXJnZXRdICE9PSBudWxsICkge1xuICAgICAgICAgIHJldHVybiBzZWxmW3RhcmdldF1bZ2V0Qm91bmRpbmdDbGllbnRSZWN0XSgpW3RvcF0gKyBzY3JvbGxZO1xuICAgICAgICB9IGVsc2UgaWYgKCBzZWxmW29mZnNldFRvcF0gKSB7XG4gICAgICAgICAgcmV0dXJuIHBhcnNlSW50KHR5cGVvZiBzZWxmW29mZnNldFRvcF0gPT09IGZuID8gc2VsZltvZmZzZXRUb3BdKCkgOiBzZWxmW29mZnNldFRvcF0gfHwgMCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBnZXRPZmZzZXRCb3R0b20gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICggc2VsZltvZmZzZXRCb3R0b21dICkge1xuICAgICAgICAgIHJldHVybiBtYXhTY3JvbGwgLSBlbGVtZW50W29mZnNldEhlaWdodF0gLSBwYXJzZUludCggdHlwZW9mIHNlbGZbb2Zmc2V0Qm90dG9tXSA9PT0gZm4gPyBzZWxmW29mZnNldEJvdHRvbV0oKSA6IHNlbGZbb2Zmc2V0Qm90dG9tXSB8fCAwICk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBjaGVja1Bvc2l0aW9uID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBtYXhTY3JvbGwgPSBnZXRNYXhTY3JvbGwoKTtcbiAgICAgICAgc2Nyb2xsWSA9IHBhcnNlSW50KGdldFNjcm9sbCgpLnksMCk7XG4gICAgICAgIHBpbk9mZnNldFRvcCA9IGdldE9mZnNldFRvcCgpO1xuICAgICAgICBwaW5PZmZzZXRCb3R0b20gPSBnZXRPZmZzZXRCb3R0b20oKTsgXG4gICAgICAgIHBpbm5lZFRvcCA9ICggcGFyc2VJbnQocGluT2Zmc2V0VG9wKSAtIHNjcm9sbFkgPCAwKSAmJiAoc2Nyb2xsWSA+IHBhcnNlSW50KHBpbk9mZnNldFRvcCkgKTtcbiAgICAgICAgcGlubmVkQm90dG9tID0gKCBwYXJzZUludChwaW5PZmZzZXRCb3R0b20pIC0gc2Nyb2xsWSA8IDApICYmIChzY3JvbGxZID4gcGFyc2VJbnQocGluT2Zmc2V0Qm90dG9tKSApO1xuICAgICAgfSxcbiAgICAgIHBpblRvcCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCAhYWZmaXhlZFRvVG9wICYmICFoYXNDbGFzcyhlbGVtZW50LGFmZml4KSApIHsgLy8gb24gbG9hZGluZyBhIHBhZ2UgaGFsZndheSBzY3JvbGxlZCB0aGVzZSBldmVudHMgZG9uJ3QgdHJpZ2dlciBpbiBDaHJvbWVcbiAgICAgICAgICBib290c3RyYXBDdXN0b21FdmVudC5jYWxsKGVsZW1lbnQsIGFmZml4LCBhZmZpeCk7XG4gICAgICAgICAgYm9vdHN0cmFwQ3VzdG9tRXZlbnQuY2FsbChlbGVtZW50LCBhZmZpeFRvcCwgYWZmaXgpO1xuICAgICAgICAgIGFkZENsYXNzKGVsZW1lbnQsYWZmaXgpO1xuICAgICAgICAgIGFmZml4ZWRUb1RvcCA9IHRydWU7XG4gICAgICAgICAgYm9vdHN0cmFwQ3VzdG9tRXZlbnQuY2FsbChlbGVtZW50LCBhZmZpeGVkLCBhZmZpeCk7XG4gICAgICAgICAgYm9vdHN0cmFwQ3VzdG9tRXZlbnQuY2FsbChlbGVtZW50LCBhZmZpeGVkVG9wLCBhZmZpeCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICB1blBpblRvcCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCBhZmZpeGVkVG9Ub3AgJiYgaGFzQ2xhc3MoZWxlbWVudCxhZmZpeCkgKSB7XG4gICAgICAgICAgcmVtb3ZlQ2xhc3MoZWxlbWVudCxhZmZpeCk7XG4gICAgICAgICAgYWZmaXhlZFRvVG9wID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBwaW5Cb3R0b20gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICggIWFmZml4ZWRUb0JvdHRvbSAmJiAhaGFzQ2xhc3MoZWxlbWVudCwgYWZmaXhCb3R0b20pICkge1xuICAgICAgICAgIGJvb3RzdHJhcEN1c3RvbUV2ZW50LmNhbGwoZWxlbWVudCwgYWZmaXgsIGFmZml4KTtcbiAgICAgICAgICBib290c3RyYXBDdXN0b21FdmVudC5jYWxsKGVsZW1lbnQsIGFmZml4Qm90dG9tLCBhZmZpeCk7XG4gICAgICAgICAgYWRkQ2xhc3MoZWxlbWVudCxhZmZpeEJvdHRvbSk7XG4gICAgICAgICAgYWZmaXhlZFRvQm90dG9tID0gdHJ1ZTtcbiAgICAgICAgICBib290c3RyYXBDdXN0b21FdmVudC5jYWxsKGVsZW1lbnQsIGFmZml4ZWQsIGFmZml4KTtcbiAgICAgICAgICBib290c3RyYXBDdXN0b21FdmVudC5jYWxsKGVsZW1lbnQsIGFmZml4ZWRCb3R0b20sIGFmZml4KTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHVuUGluQm90dG9tID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoIGFmZml4ZWRUb0JvdHRvbSAmJiBoYXNDbGFzcyhlbGVtZW50LGFmZml4Qm90dG9tKSApIHtcbiAgICAgICAgICByZW1vdmVDbGFzcyhlbGVtZW50LGFmZml4Qm90dG9tKTtcbiAgICAgICAgICBhZmZpeGVkVG9Cb3R0b20gPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHVwZGF0ZVBpbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCBwaW5uZWRCb3R0b20gKSB7XG4gICAgICAgICAgaWYgKCBwaW5uZWRUb3AgKSB7IHVuUGluVG9wKCk7IH1cbiAgICAgICAgICBwaW5Cb3R0b20oKTsgXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdW5QaW5Cb3R0b20oKTtcbiAgICAgICAgICBpZiAoIHBpbm5lZFRvcCApIHsgcGluVG9wKCk7IH0gXG4gICAgICAgICAgZWxzZSB7IHVuUGluVG9wKCk7IH1cbiAgICAgICAgfVxuICAgICAgfTtcbiAgXG4gICAgLy8gcHVibGljIG1ldGhvZFxuICAgIHRoaXNbdXBkYXRlXSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGNoZWNrUG9zaXRpb24oKTtcbiAgICAgIHVwZGF0ZVBpbigpOyBcbiAgICB9O1xuICBcbiAgICAvLyBpbml0XG4gICAgaWYgKCAhKHN0cmluZ0FmZml4IGluIGVsZW1lbnQgKSApIHsgLy8gcHJldmVudCBhZGRpbmcgZXZlbnQgaGFuZGxlcnMgdHdpY2VcbiAgICAgIG9uKCBnbG9iYWxPYmplY3QsIHNjcm9sbEV2ZW50LCBzZWxmW3VwZGF0ZV0gKTtcbiAgICAgICFpc0lFOCAmJiBvbiggZ2xvYmFsT2JqZWN0LCByZXNpemVFdmVudCwgc2VsZlt1cGRhdGVdICk7XG4gICAgfVxuICAgIGVsZW1lbnRbc3RyaW5nQWZmaXhdID0gc2VsZjtcbiAgXG4gICAgc2VsZlt1cGRhdGVdKCk7XG4gIH07XG4gIFxuICAvLyBBRkZJWCBEQVRBIEFQSVxuICAvLyA9PT09PT09PT09PT09PT09PVxuICBzdXBwb3J0c1twdXNoXShbc3RyaW5nQWZmaXgsIEFmZml4LCAnWycrZGF0YVNweSsnPVwiYWZmaXhcIl0nXSk7XG4gIFxuICBcbiAgXG4gIC8qIE5hdGl2ZSBKYXZhc2NyaXB0IGZvciBCb290c3RyYXAgMyB8IEFsZXJ0XG4gIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuICBcbiAgLy8gQUxFUlQgREVGSU5JVElPTlxuICAvLyA9PT09PT09PT09PT09PT09XG4gIHZhciBBbGVydCA9IGZ1bmN0aW9uKCBlbGVtZW50ICkge1xuICAgIFxuICAgIC8vIGluaXRpYWxpemF0aW9uIGVsZW1lbnRcbiAgICBlbGVtZW50ID0gcXVlcnlFbGVtZW50KGVsZW1lbnQpO1xuICBcbiAgICAvLyBiaW5kLCB0YXJnZXQgYWxlcnQsIGR1cmF0aW9uIGFuZCBzdHVmZlxuICAgIHZhciBzZWxmID0gdGhpcywgY29tcG9uZW50ID0gJ2FsZXJ0JyxcbiAgICAgIGFsZXJ0ID0gZ2V0Q2xvc2VzdChlbGVtZW50LCcuJytjb21wb25lbnQpLFxuICAgICAgdHJpZ2dlckhhbmRsZXIgPSBmdW5jdGlvbigpeyBoYXNDbGFzcyhhbGVydCwnZmFkZScpID8gZW11bGF0ZVRyYW5zaXRpb25FbmQoYWxlcnQsdHJhbnNpdGlvbkVuZEhhbmRsZXIpIDogdHJhbnNpdGlvbkVuZEhhbmRsZXIoKTsgfSxcbiAgICAgIC8vIGhhbmRsZXJzXG4gICAgICBjbGlja0hhbmRsZXIgPSBmdW5jdGlvbihlKXtcbiAgICAgICAgYWxlcnQgPSBnZXRDbG9zZXN0KGVbdGFyZ2V0XSwnLicrY29tcG9uZW50KTtcbiAgICAgICAgZWxlbWVudCA9IHF1ZXJ5RWxlbWVudCgnWycrZGF0YURpc21pc3MrJz1cIicrY29tcG9uZW50KydcIl0nLGFsZXJ0KTtcbiAgICAgICAgZWxlbWVudCAmJiBhbGVydCAmJiAoZWxlbWVudCA9PT0gZVt0YXJnZXRdIHx8IGVsZW1lbnRbY29udGFpbnNdKGVbdGFyZ2V0XSkpICYmIHNlbGYuY2xvc2UoKTtcbiAgICAgIH0sXG4gICAgICB0cmFuc2l0aW9uRW5kSGFuZGxlciA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIGJvb3RzdHJhcEN1c3RvbUV2ZW50LmNhbGwoYWxlcnQsIGNsb3NlZEV2ZW50LCBjb21wb25lbnQpO1xuICAgICAgICBvZmYoZWxlbWVudCwgY2xpY2tFdmVudCwgY2xpY2tIYW5kbGVyKTsgLy8gZGV0YWNoIGl0J3MgbGlzdGVuZXJcbiAgICAgICAgYWxlcnRbcGFyZW50Tm9kZV0ucmVtb3ZlQ2hpbGQoYWxlcnQpO1xuICAgICAgfTtcbiAgICBcbiAgICAvLyBwdWJsaWMgbWV0aG9kXG4gICAgdGhpcy5jbG9zZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCBhbGVydCAmJiBlbGVtZW50ICYmIGhhc0NsYXNzKGFsZXJ0LGluQ2xhc3MpICkge1xuICAgICAgICBib290c3RyYXBDdXN0b21FdmVudC5jYWxsKGFsZXJ0LCBjbG9zZUV2ZW50LCBjb21wb25lbnQpO1xuICAgICAgICByZW1vdmVDbGFzcyhhbGVydCxpbkNsYXNzKTtcbiAgICAgICAgYWxlcnQgJiYgdHJpZ2dlckhhbmRsZXIoKTtcbiAgICAgIH1cbiAgICB9O1xuICBcbiAgICAvLyBpbml0XG4gICAgaWYgKCAhKHN0cmluZ0FsZXJ0IGluIGVsZW1lbnQgKSApIHsgLy8gcHJldmVudCBhZGRpbmcgZXZlbnQgaGFuZGxlcnMgdHdpY2VcbiAgICAgIG9uKGVsZW1lbnQsIGNsaWNrRXZlbnQsIGNsaWNrSGFuZGxlcik7XG4gICAgfVxuICAgIGVsZW1lbnRbc3RyaW5nQWxlcnRdID0gc2VsZjtcbiAgfTtcbiAgXG4gIC8vIEFMRVJUIERBVEEgQVBJXG4gIC8vID09PT09PT09PT09PT09XG4gIHN1cHBvcnRzW3B1c2hdKFtzdHJpbmdBbGVydCwgQWxlcnQsICdbJytkYXRhRGlzbWlzcysnPVwiYWxlcnRcIl0nXSk7XG4gIFxuICBcbiAgXG4gIC8qIE5hdGl2ZSBKYXZhc2NyaXB0IGZvciBCb290c3RyYXAgMyB8IEJ1dHRvblxuICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuICBcbiAgLy8gQlVUVE9OIERFRklOSVRJT05cbiAgLy8gPT09PT09PT09PT09PT09PT09PVxuICB2YXIgQnV0dG9uID0gZnVuY3Rpb24oIGVsZW1lbnQsIG9wdGlvbiApIHtcbiAgXG4gICAgLy8gaW5pdGlhbGl6YXRpb24gZWxlbWVudFxuICAgIGVsZW1lbnQgPSBxdWVyeUVsZW1lbnQoZWxlbWVudCk7XG4gIFxuICAgIC8vIHNldCBvcHRpb25cbiAgICBvcHRpb24gPSBvcHRpb24gfHwgbnVsbDtcbiAgXG4gICAgLy8gY29uc3RhbnRcbiAgICB2YXIgdG9nZ2xlZCA9IGZhbHNlLCAvLyB0b2dnbGVkIG1ha2VzIHN1cmUgdG8gcHJldmVudCB0cmlnZ2VyaW5nIHR3aWNlIHRoZSBjaGFuZ2UuYnMuYnV0dG9uIGV2ZW50c1xuICBcbiAgICAgICAgLy8gc3RyaW5nc1xuICAgICAgICBjb21wb25lbnQgPSAnYnV0dG9uJyxcbiAgICAgICAgY2hlY2tlZCA9ICdjaGVja2VkJyxcbiAgICAgICAgcmVzZXQgPSAncmVzZXQnLFxuICAgICAgICBMQUJFTCA9ICdMQUJFTCcsXG4gICAgICAgIElOUFVUID0gJ0lOUFVUJyxcbiAgXG4gICAgICAvLyBwcml2YXRlIG1ldGhvZHNcbiAgICAgIHNldFN0YXRlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICggISEgb3B0aW9uICYmIG9wdGlvbiAhPT0gcmVzZXQgKSB7XG4gICAgICAgICAgaWYgKCBvcHRpb24gPT09IGxvYWRpbmcgKSB7XG4gICAgICAgICAgICBhZGRDbGFzcyhlbGVtZW50LGRpc2FibGVkKTtcbiAgICAgICAgICAgIGVsZW1lbnRbc2V0QXR0cmlidXRlXShkaXNhYmxlZCxkaXNhYmxlZCk7XG4gICAgICAgICAgICBlbGVtZW50W3NldEF0dHJpYnV0ZV0oZGF0YU9yaWdpbmFsVGV4dCwgZWxlbWVudFtpbm5lckhUTUxdLnRyaW0oKSk7IC8vIHRyaW0gdGhlIHRleHRcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxlbWVudFtpbm5lckhUTUxdID0gZWxlbWVudFtnZXRBdHRyaWJ1dGVdKCdkYXRhLScrb3B0aW9uKyctdGV4dCcpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgcmVzZXRTdGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoZWxlbWVudFtnZXRBdHRyaWJ1dGVdKGRhdGFPcmlnaW5hbFRleHQpKSB7XG4gICAgICAgICAgaWYgKCBoYXNDbGFzcyhlbGVtZW50LGRpc2FibGVkKSB8fCBlbGVtZW50W2dldEF0dHJpYnV0ZV0oZGlzYWJsZWQpID09PSBkaXNhYmxlZCApIHtcbiAgICAgICAgICAgIHJlbW92ZUNsYXNzKGVsZW1lbnQsZGlzYWJsZWQpO1xuICAgICAgICAgICAgZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoZGlzYWJsZWQpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbGVtZW50W2lubmVySFRNTF0gPSBlbGVtZW50W2dldEF0dHJpYnV0ZV0oZGF0YU9yaWdpbmFsVGV4dCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBrZXlIYW5kbGVyID0gZnVuY3Rpb24oZSl7IFxuICAgICAgICB2YXIga2V5ID0gZS53aGljaCB8fCBlLmtleUNvZGU7XG4gICAgICAgIGtleSA9PT0gMzIgJiYgZVt0YXJnZXRdID09PSBET0MuYWN0aXZlRWxlbWVudCAmJiB0b2dnbGUoZSk7XG4gICAgICB9LFxuICAgICAgcHJldmVudFNjcm9sbCA9IGZ1bmN0aW9uKGUpeyBcbiAgICAgICAgdmFyIGtleSA9IGUud2hpY2ggfHwgZS5rZXlDb2RlO1xuICAgICAgICBrZXkgPT09IDMyICYmIGVbcHJldmVudERlZmF1bHRdKCk7XG4gICAgICB9LCAgICBcbiAgICAgIHRvZ2dsZSA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdmFyIGxhYmVsID0gZVt0YXJnZXRdLnRhZ05hbWUgPT09IExBQkVMID8gZVt0YXJnZXRdIDogZVt0YXJnZXRdW3BhcmVudE5vZGVdLnRhZ05hbWUgPT09IExBQkVMID8gZVt0YXJnZXRdW3BhcmVudE5vZGVdIDogbnVsbDsgLy8gdGhlIC5idG4gbGFiZWxcbiAgICAgICAgXG4gICAgICAgIGlmICggIWxhYmVsICkgcmV0dXJuOyAvL3JlYWN0IGlmIGEgbGFiZWwgb3IgaXRzIGltbWVkaWF0ZSBjaGlsZCBpcyBjbGlja2VkXG4gIFxuICAgICAgICB2YXIgZXZlbnRUYXJnZXQgPSBlW3RhcmdldF0sIC8vIHRoZSBidXR0b24gaXRzZWxmLCB0aGUgdGFyZ2V0IG9mIHRoZSBoYW5kbGVyIGZ1bmN0aW9uXG4gICAgICAgICAgbGFiZWxzID0gZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShldmVudFRhcmdldFtwYXJlbnROb2RlXSwnYnRuJyksIC8vIGFsbCB0aGUgYnV0dG9uIGdyb3VwIGJ1dHRvbnNcbiAgICAgICAgICBpbnB1dCA9IGxhYmVsW2dldEVsZW1lbnRzQnlUYWdOYW1lXShJTlBVVClbMF07XG4gIFxuICAgICAgICBpZiAoICFpbnB1dCApIHJldHVybjsgLy9yZXR1cm4gaWYgbm8gaW5wdXQgZm91bmRcbiAgXG4gICAgICAgIC8vIG1hbmFnZSB0aGUgZG9tIG1hbmlwdWxhdGlvblxuICAgICAgICBpZiAoIGlucHV0LnR5cGUgPT09ICdjaGVja2JveCcgKSB7IC8vY2hlY2tib3hlc1xuICAgICAgICAgIGlmICggIWlucHV0W2NoZWNrZWRdICkge1xuICAgICAgICAgICAgYWRkQ2xhc3MobGFiZWwsYWN0aXZlKTtcbiAgICAgICAgICAgIGlucHV0W2dldEF0dHJpYnV0ZV0oY2hlY2tlZCk7XG4gICAgICAgICAgICBpbnB1dFtzZXRBdHRyaWJ1dGVdKGNoZWNrZWQsY2hlY2tlZCk7XG4gICAgICAgICAgICBpbnB1dFtjaGVja2VkXSA9IHRydWU7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlbW92ZUNsYXNzKGxhYmVsLGFjdGl2ZSk7XG4gICAgICAgICAgICBpbnB1dFtnZXRBdHRyaWJ1dGVdKGNoZWNrZWQpO1xuICAgICAgICAgICAgaW5wdXQucmVtb3ZlQXR0cmlidXRlKGNoZWNrZWQpO1xuICAgICAgICAgICAgaW5wdXRbY2hlY2tlZF0gPSBmYWxzZTtcbiAgICAgICAgICB9XG4gIFxuICAgICAgICAgIGlmICghdG9nZ2xlZCkgeyAvLyBwcmV2ZW50IHRyaWdnZXJpbmcgdGhlIGV2ZW50IHR3aWNlXG4gICAgICAgICAgICB0b2dnbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGJvb3RzdHJhcEN1c3RvbUV2ZW50LmNhbGwoaW5wdXQsIGNoYW5nZUV2ZW50LCBjb21wb25lbnQpOyAvL3RyaWdnZXIgdGhlIGNoYW5nZSBmb3IgdGhlIGlucHV0XG4gICAgICAgICAgICBib290c3RyYXBDdXN0b21FdmVudC5jYWxsKGVsZW1lbnQsIGNoYW5nZUV2ZW50LCBjb21wb25lbnQpOyAvL3RyaWdnZXIgdGhlIGNoYW5nZSBmb3IgdGhlIGJ0bi1ncm91cFxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICBcbiAgICAgICAgaWYgKCBpbnB1dC50eXBlID09PSAncmFkaW8nICYmICF0b2dnbGVkICkgeyAvLyByYWRpbyBidXR0b25zXG4gICAgICAgICAgaWYgKCAhaW5wdXRbY2hlY2tlZF0gKSB7IC8vIGRvbid0IHRyaWdnZXIgaWYgYWxyZWFkeSBhY3RpdmVcbiAgICAgICAgICAgIGFkZENsYXNzKGxhYmVsLGFjdGl2ZSk7XG4gICAgICAgICAgICBpbnB1dFtzZXRBdHRyaWJ1dGVdKGNoZWNrZWQsY2hlY2tlZCk7XG4gICAgICAgICAgICBpbnB1dFtjaGVja2VkXSA9IHRydWU7XG4gICAgICAgICAgICBib290c3RyYXBDdXN0b21FdmVudC5jYWxsKGlucHV0LCBjaGFuZ2VFdmVudCwgY29tcG9uZW50KTsgLy90cmlnZ2VyIHRoZSBjaGFuZ2UgZm9yIHRoZSBpbnB1dFxuICAgICAgICAgICAgYm9vdHN0cmFwQ3VzdG9tRXZlbnQuY2FsbChlbGVtZW50LCBjaGFuZ2VFdmVudCwgY29tcG9uZW50KTsgLy90cmlnZ2VyIHRoZSBjaGFuZ2UgZm9yIHRoZSBidG4tZ3JvdXBcbiAgXG4gICAgICAgICAgICB0b2dnbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsbCA9IGxhYmVsc1tsZW5ndGhdOyBpPGxsOyBpKyspIHtcbiAgICAgICAgICAgICAgdmFyIG90aGVyTGFiZWwgPSBsYWJlbHNbaV0sIG90aGVySW5wdXQgPSBvdGhlckxhYmVsW2dldEVsZW1lbnRzQnlUYWdOYW1lXShJTlBVVClbMF07XG4gICAgICAgICAgICAgIGlmICggb3RoZXJMYWJlbCAhPT0gbGFiZWwgJiYgaGFzQ2xhc3Mob3RoZXJMYWJlbCxhY3RpdmUpICkgIHtcbiAgICAgICAgICAgICAgICByZW1vdmVDbGFzcyhvdGhlckxhYmVsLGFjdGl2ZSk7XG4gICAgICAgICAgICAgICAgb3RoZXJJbnB1dC5yZW1vdmVBdHRyaWJ1dGUoY2hlY2tlZCk7XG4gICAgICAgICAgICAgICAgb3RoZXJJbnB1dFtjaGVja2VkXSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGJvb3RzdHJhcEN1c3RvbUV2ZW50LmNhbGwob3RoZXJJbnB1dCwgY2hhbmdlRXZlbnQsIGNvbXBvbmVudCk7IC8vIHRyaWdnZXIgdGhlIGNoYW5nZVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHNldFRpbWVvdXQoIGZ1bmN0aW9uKCkgeyB0b2dnbGVkID0gZmFsc2U7IH0sIDUwICk7XG4gICAgICB9O1xuICBcbiAgICAvLyBpbml0XG4gICAgaWYgKCBoYXNDbGFzcyhlbGVtZW50LCdidG4nKSApIHsgLy8gd2hlbiBCdXR0b24gdGV4dCBpcyB1c2VkIHdlIGV4ZWN1dGUgaXQgYXMgYW4gaW5zdGFuY2UgbWV0aG9kXG4gICAgICBpZiAoIG9wdGlvbiAhPT0gbnVsbCApIHtcbiAgICAgICAgaWYgKCBvcHRpb24gIT09IHJlc2V0ICkgeyBzZXRTdGF0ZSgpOyB9IFxuICAgICAgICBlbHNlIHsgcmVzZXRTdGF0ZSgpOyB9XG4gICAgICB9XG4gICAgfSBlbHNlIHsgLy8gaWYgKCBoYXNDbGFzcyhlbGVtZW50LCdidG4tZ3JvdXAnKSApIC8vIHdlIGFsbG93IHRoZSBzY3JpcHQgdG8gd29yayBvdXRzaWRlIGJ0bi1ncm91cCBjb21wb25lbnRcbiAgICAgIFxuICAgICAgaWYgKCAhKCBzdHJpbmdCdXR0b24gaW4gZWxlbWVudCApICkgeyAvLyBwcmV2ZW50IGFkZGluZyBldmVudCBoYW5kbGVycyB0d2ljZVxuICAgICAgICBvbiggZWxlbWVudCwgY2xpY2tFdmVudCwgdG9nZ2xlICk7XG4gICAgICAgIHF1ZXJ5RWxlbWVudCgnWycrdGFiaW5kZXgrJ10nLGVsZW1lbnQpICYmIG9uKCBlbGVtZW50LCBrZXl1cEV2ZW50LCBrZXlIYW5kbGVyICksIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbiggZWxlbWVudCwga2V5ZG93bkV2ZW50LCBwcmV2ZW50U2Nyb2xsICk7XG4gICAgICB9XG4gIFxuICAgICAgLy8gYWN0aXZhdGUgaXRlbXMgb24gbG9hZFxuICAgICAgdmFyIGxhYmVsc1RvQUN0aXZhdGUgPSBnZXRFbGVtZW50c0J5Q2xhc3NOYW1lKGVsZW1lbnQsICdidG4nKSwgbGJsbCA9IGxhYmVsc1RvQUN0aXZhdGVbbGVuZ3RoXTtcbiAgICAgIGZvciAodmFyIGk9MDsgaTxsYmxsOyBpKyspIHtcbiAgICAgICAgIWhhc0NsYXNzKGxhYmVsc1RvQUN0aXZhdGVbaV0sYWN0aXZlKSAmJiBxdWVyeUVsZW1lbnQoJ2lucHV0JyxsYWJlbHNUb0FDdGl2YXRlW2ldKVtnZXRBdHRyaWJ1dGVdKGNoZWNrZWQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJiYgYWRkQ2xhc3MobGFiZWxzVG9BQ3RpdmF0ZVtpXSxhY3RpdmUpO1xuICAgICAgfVxuICAgICAgZWxlbWVudFtzdHJpbmdCdXR0b25dID0gdGhpcztcbiAgICB9XG4gIH07XG4gIFxuICAvLyBCVVRUT04gREFUQSBBUElcbiAgLy8gPT09PT09PT09PT09PT09PT1cbiAgc3VwcG9ydHNbcHVzaF0oIFsgc3RyaW5nQnV0dG9uLCBCdXR0b24sICdbJytkYXRhVG9nZ2xlKyc9XCJidXR0b25zXCJdJyBdICk7XG4gIFxuICBcbiAgLyogTmF0aXZlIEphdmFzY3JpcHQgZm9yIEJvb3RzdHJhcCAzIHwgQ2Fyb3VzZWxcbiAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4gIFxuICAvLyBDQVJPVVNFTCBERUZJTklUSU9OXG4gIC8vID09PT09PT09PT09PT09PT09PT1cbiAgdmFyIENhcm91c2VsID0gZnVuY3Rpb24oIGVsZW1lbnQsIG9wdGlvbnMgKSB7XG4gIFxuICAgIC8vIGluaXRpYWxpemF0aW9uIGVsZW1lbnRcbiAgICBlbGVtZW50ID0gcXVlcnlFbGVtZW50KCBlbGVtZW50ICk7XG4gIFxuICAgIC8vIHNldCBvcHRpb25zXG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIFxuICAgIC8vIERBVEEgQVBJXG4gICAgdmFyIGludGVydmFsQXR0cmlidXRlID0gZWxlbWVudFtnZXRBdHRyaWJ1dGVdKGRhdGFJbnRlcnZhbCksXG4gICAgICAgIGludGVydmFsT3B0aW9uID0gb3B0aW9uc1tpbnRlcnZhbF0sXG4gICAgICAgIGludGVydmFsRGF0YSA9IGludGVydmFsQXR0cmlidXRlID09PSAnZmFsc2UnID8gMCA6IHBhcnNlSW50KGludGVydmFsQXR0cmlidXRlKSB8fCA1MDAwLCAgLy8gYm9vdHN0cmFwIGNhcm91c2VsIGRlZmF1bHQgaW50ZXJ2YWxcbiAgICAgICAgcGF1c2VEYXRhID0gZWxlbWVudFtnZXRBdHRyaWJ1dGVdKGRhdGFQYXVzZSkgPT09IGhvdmVyRXZlbnQgfHwgZmFsc2UsXG4gICAgICAgIGtleWJvYXJkRGF0YSA9IGVsZW1lbnRbZ2V0QXR0cmlidXRlXShkYXRhS2V5Ym9hcmQpID09PSAndHJ1ZScgfHwgZmFsc2UsXG4gICAgICBcbiAgICAgICAgLy8gc3RyaW5nc1xuICAgICAgICBjb21wb25lbnQgPSAnY2Fyb3VzZWwnLFxuICAgICAgICBwYXVzZWQgPSAncGF1c2VkJyxcbiAgICAgICAgZGlyZWN0aW9uID0gJ2RpcmVjdGlvbicsXG4gICAgICAgIGRhdGFTbGlkZVRvID0gJ2RhdGEtc2xpZGUtdG8nOyBcbiAgXG4gICAgdGhpc1trZXlib2FyZF0gPSBvcHRpb25zW2tleWJvYXJkXSA9PT0gdHJ1ZSB8fCBrZXlib2FyZERhdGE7XG4gICAgdGhpc1twYXVzZV0gPSAob3B0aW9uc1twYXVzZV0gPT09IGhvdmVyRXZlbnQgfHwgcGF1c2VEYXRhKSA/IGhvdmVyRXZlbnQgOiBmYWxzZTsgLy8gZmFsc2UgLyBob3ZlclxuICBcbiAgICB0aGlzW2ludGVydmFsXSA9IHR5cGVvZiBpbnRlcnZhbE9wdGlvbiA9PT0gJ251bWJlcicgPyBpbnRlcnZhbE9wdGlvblxuICAgIDogaW50ZXJ2YWxEYXRhID09PSAwID8gMFxuICAgIDogaW50ZXJ2YWxEYXRhO1xuICBcbiAgICAvLyBiaW5kLCBldmVudCB0YXJnZXRzXG4gICAgdmFyIHNlbGYgPSB0aGlzLCBpbmRleCA9IGVsZW1lbnQuaW5kZXggPSAwLCB0aW1lciA9IGVsZW1lbnQudGltZXIgPSAwLCBcbiAgICAgIGlzU2xpZGluZyA9IGZhbHNlLCAvLyBpc1NsaWRpbmcgcHJldmVudHMgY2xpY2sgZXZlbnQgaGFuZGxlcnMgd2hlbiBhbmltYXRpb24gaXMgcnVubmluZ1xuICAgICAgc2xpZGVzID0gZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShlbGVtZW50LCdpdGVtJyksIHRvdGFsID0gc2xpZGVzW2xlbmd0aF0sXG4gICAgICBzbGlkZURpcmVjdGlvbiA9IHRoaXNbZGlyZWN0aW9uXSA9IGxlZnQsXG4gICAgICBjb250cm9scyA9IGdldEVsZW1lbnRzQnlDbGFzc05hbWUoZWxlbWVudCxjb21wb25lbnQrJy1jb250cm9sJyksXG4gICAgICBsZWZ0QXJyb3cgPSBjb250cm9sc1swXSwgcmlnaHRBcnJvdyA9IGNvbnRyb2xzWzFdLFxuICAgICAgaW5kaWNhdG9yID0gcXVlcnlFbGVtZW50KCAnLicrY29tcG9uZW50KyctaW5kaWNhdG9ycycsIGVsZW1lbnQgKSxcbiAgICAgIGluZGljYXRvcnMgPSBpbmRpY2F0b3IgJiYgaW5kaWNhdG9yW2dldEVsZW1lbnRzQnlUYWdOYW1lXSggXCJMSVwiICkgfHwgW107XG4gIFxuICAgIC8vIGhhbmRsZXJzXG4gICAgdmFyIHBhdXNlSGFuZGxlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCBzZWxmW2ludGVydmFsXSAhPT1mYWxzZSAmJiAhaGFzQ2xhc3MoZWxlbWVudCxwYXVzZWQpICkge1xuICAgICAgICAgIGFkZENsYXNzKGVsZW1lbnQscGF1c2VkKTtcbiAgICAgICAgICAhaXNTbGlkaW5nICYmIGNsZWFySW50ZXJ2YWwoIHRpbWVyICk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICByZXN1bWVIYW5kbGVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICggc2VsZltpbnRlcnZhbF0gIT09IGZhbHNlICYmIGhhc0NsYXNzKGVsZW1lbnQscGF1c2VkKSApIHtcbiAgICAgICAgICByZW1vdmVDbGFzcyhlbGVtZW50LHBhdXNlZCk7XG4gICAgICAgICAgIWlzU2xpZGluZyAmJiBjbGVhckludGVydmFsKCB0aW1lciApO1xuICAgICAgICAgICFpc1NsaWRpbmcgJiYgc2VsZi5jeWNsZSgpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgaW5kaWNhdG9ySGFuZGxlciA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgZVtwcmV2ZW50RGVmYXVsdF0oKTtcbiAgICAgICAgaWYgKGlzU2xpZGluZykgcmV0dXJuO1xuICBcbiAgICAgICAgdmFyIGV2ZW50VGFyZ2V0ID0gZVt0YXJnZXRdOyAvLyBldmVudCB0YXJnZXQgfCB0aGUgY3VycmVudCBhY3RpdmUgaXRlbVxuICBcbiAgICAgICAgaWYgKCBldmVudFRhcmdldCAmJiAhaGFzQ2xhc3MoZXZlbnRUYXJnZXQsYWN0aXZlKSAmJiBldmVudFRhcmdldFtnZXRBdHRyaWJ1dGVdKGRhdGFTbGlkZVRvKSApIHtcbiAgICAgICAgICBpbmRleCA9IHBhcnNlSW50KCBldmVudFRhcmdldFtnZXRBdHRyaWJ1dGVdKGRhdGFTbGlkZVRvKSwgMTAgKTtcbiAgICAgICAgfSBlbHNlIHsgcmV0dXJuIGZhbHNlOyB9XG4gIFxuICAgICAgICBzZWxmLnNsaWRlVG8oIGluZGV4ICk7IC8vRG8gdGhlIHNsaWRlXG4gICAgICB9LFxuICAgICAgY29udHJvbHNIYW5kbGVyID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgZVtwcmV2ZW50RGVmYXVsdF0oKTtcbiAgICAgICAgaWYgKGlzU2xpZGluZykgcmV0dXJuO1xuICBcbiAgICAgICAgdmFyIGV2ZW50VGFyZ2V0ID0gZS5jdXJyZW50VGFyZ2V0IHx8IGUuc3JjRWxlbWVudDtcbiAgXG4gICAgICAgIGlmICggZXZlbnRUYXJnZXQgPT09IHJpZ2h0QXJyb3cgKSB7XG4gICAgICAgICAgaW5kZXgrKztcbiAgICAgICAgfSBlbHNlIGlmICggZXZlbnRUYXJnZXQgPT09IGxlZnRBcnJvdyApIHtcbiAgICAgICAgICBpbmRleC0tO1xuICAgICAgICB9XG4gIFxuICAgICAgICBzZWxmLnNsaWRlVG8oIGluZGV4ICk7IC8vRG8gdGhlIHNsaWRlXG4gICAgICB9LFxuICAgICAga2V5SGFuZGxlciA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGlmIChpc1NsaWRpbmcpIHJldHVybjtcbiAgICAgICAgc3dpdGNoIChlLndoaWNoKSB7XG4gICAgICAgICAgY2FzZSAzOTpcbiAgICAgICAgICAgIGluZGV4Kys7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDM3OlxuICAgICAgICAgICAgaW5kZXgtLTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGRlZmF1bHQ6IHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBzZWxmLnNsaWRlVG8oIGluZGV4ICk7IC8vRG8gdGhlIHNsaWRlXG4gICAgICB9LFxuICAgICAgLy8gcHJpdmF0ZSBtZXRob2RzXG4gICAgICBpc0VsZW1lbnRJblNjcm9sbFJhbmdlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgcmVjdCA9IGVsZW1lbnRbZ2V0Qm91bmRpbmdDbGllbnRSZWN0XSgpLFxuICAgICAgICAgIHZpZXdwb3J0SGVpZ2h0ID0gZ2xvYmFsT2JqZWN0W2lubmVySGVpZ2h0XSB8fCBIVE1MW2NsaWVudEhlaWdodF1cbiAgICAgICAgcmV0dXJuIHJlY3RbdG9wXSA8PSB2aWV3cG9ydEhlaWdodCAmJiByZWN0W2JvdHRvbV0gPj0gMDsgLy8gYm90dG9tICYmIHRvcFxuICAgICAgfSwgIFxuICAgICAgc2V0QWN0aXZlUGFnZSA9IGZ1bmN0aW9uKCBwYWdlSW5kZXggKSB7IC8vaW5kaWNhdG9yc1xuICAgICAgICBmb3IgKCB2YXIgaSA9IDAsIGljbCA9IGluZGljYXRvcnNbbGVuZ3RoXTsgaSA8IGljbDsgaSsrICkge1xuICAgICAgICAgIHJlbW92ZUNsYXNzKGluZGljYXRvcnNbaV0sYWN0aXZlKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaW5kaWNhdG9yc1twYWdlSW5kZXhdKSBhZGRDbGFzcyhpbmRpY2F0b3JzW3BhZ2VJbmRleF0sIGFjdGl2ZSk7XG4gICAgICB9O1xuICBcbiAgXG4gICAgLy8gcHVibGljIG1ldGhvZHNcbiAgICB0aGlzLmN5Y2xlID0gZnVuY3Rpb24oKSB7XG4gICAgICB0aW1lciA9IHNldEludGVydmFsKGZ1bmN0aW9uKCkge1xuICAgICAgICBpc0VsZW1lbnRJblNjcm9sbFJhbmdlKCkgJiYgKGluZGV4KyssIHNlbGYuc2xpZGVUbyggaW5kZXggKSApO1xuICAgICAgfSwgdGhpc1tpbnRlcnZhbF0pO1xuICAgIH07XG4gICAgdGhpcy5zbGlkZVRvID0gZnVuY3Rpb24oIG5leHQgKSB7XG4gICAgICBpZiAoaXNTbGlkaW5nKSByZXR1cm47IC8vIHdoZW4gY29udHJvbGVkIHZpYSBtZXRob2RzLCBtYWtlIHN1cmUgdG8gY2hlY2sgYWdhaW4gICAgXG4gICAgICB2YXIgYWN0aXZlSXRlbSA9IHRoaXMuZ2V0QWN0aXZlSW5kZXgoKSwgLy8gdGhlIGN1cnJlbnQgYWN0aXZlXG4gICAgICAgICAgb3JpZW50YXRpb247XG4gICAgICBcbiAgICAgIC8vIGRldGVybWluZSBzbGlkZURpcmVjdGlvbiBmaXJzdFxuICAgICAgaWYgICggKGFjdGl2ZUl0ZW0gPCBuZXh0ICkgfHwgKGFjdGl2ZUl0ZW0gPT09IDAgJiYgbmV4dCA9PT0gdG90YWwgLTEgKSApIHtcbiAgICAgICAgc2xpZGVEaXJlY3Rpb24gPSBzZWxmW2RpcmVjdGlvbl0gPSBsZWZ0OyAvLyBuZXh0XG4gICAgICB9IGVsc2UgaWYgICggKGFjdGl2ZUl0ZW0gPiBuZXh0KSB8fCAoYWN0aXZlSXRlbSA9PT0gdG90YWwgLSAxICYmIG5leHQgPT09IDAgKSApIHtcbiAgICAgICAgc2xpZGVEaXJlY3Rpb24gPSBzZWxmW2RpcmVjdGlvbl0gPSByaWdodDsgLy8gcHJldlxuICAgICAgfVxuICBcbiAgICAgIC8vIGZpbmQgdGhlIHJpZ2h0IG5leHQgaW5kZXggXG4gICAgICBpZiAoIG5leHQgPCAwICkgeyBuZXh0ID0gdG90YWwgLSAxOyB9IFxuICAgICAgZWxzZSBpZiAoIG5leHQgPT09IHRvdGFsICl7IG5leHQgPSAwOyB9XG4gIFxuICAgICAgLy8gdXBkYXRlIGluZGV4XG4gICAgICBpbmRleCA9IG5leHQ7XG4gICAgICBcbiAgICAgIG9yaWVudGF0aW9uID0gc2xpZGVEaXJlY3Rpb24gPT09IGxlZnQgPyAnbmV4dCcgOiAncHJldic7IC8vZGV0ZXJtaW5lIHR5cGVcbiAgICAgIGJvb3RzdHJhcEN1c3RvbUV2ZW50LmNhbGwoZWxlbWVudCwgc2xpZGVFdmVudCwgY29tcG9uZW50LCBzbGlkZXNbbmV4dF0pOyAvLyBoZXJlIHdlIGdvIHdpdGggdGhlIHNsaWRlXG4gIFxuICAgICAgaXNTbGlkaW5nID0gdHJ1ZTtcbiAgICAgIGNsZWFySW50ZXJ2YWwodGltZXIpO1xuICAgICAgc2V0QWN0aXZlUGFnZSggbmV4dCApO1xuICBcbiAgICAgIGlmICggc3VwcG9ydFRyYW5zaXRpb25zICYmIGhhc0NsYXNzKGVsZW1lbnQsJ3NsaWRlJykgKSB7XG4gIFxuICAgICAgICBhZGRDbGFzcyhzbGlkZXNbbmV4dF0sb3JpZW50YXRpb24pO1xuICAgICAgICBzbGlkZXNbbmV4dF1bb2Zmc2V0V2lkdGhdO1xuICAgICAgICBhZGRDbGFzcyhzbGlkZXNbbmV4dF0sc2xpZGVEaXJlY3Rpb24pO1xuICAgICAgICBhZGRDbGFzcyhzbGlkZXNbYWN0aXZlSXRlbV0sc2xpZGVEaXJlY3Rpb24pO1xuICBcbiAgICAgICAgb25lKHNsaWRlc1thY3RpdmVJdGVtXSwgdHJhbnNpdGlvbkVuZEV2ZW50LCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgdmFyIHRpbWVvdXQgPSBlW3RhcmdldF0gIT09IHNsaWRlc1thY3RpdmVJdGVtXSA/IGUuZWxhcHNlZFRpbWUqMTAwMCA6IDA7XG4gICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgICAgaXNTbGlkaW5nID0gZmFsc2U7XG4gIFxuICAgICAgICAgICAgYWRkQ2xhc3Moc2xpZGVzW25leHRdLGFjdGl2ZSk7XG4gICAgICAgICAgICByZW1vdmVDbGFzcyhzbGlkZXNbYWN0aXZlSXRlbV0sYWN0aXZlKTtcbiAgXG4gICAgICAgICAgICByZW1vdmVDbGFzcyhzbGlkZXNbbmV4dF0sb3JpZW50YXRpb24pO1xuICAgICAgICAgICAgcmVtb3ZlQ2xhc3Moc2xpZGVzW25leHRdLHNsaWRlRGlyZWN0aW9uKTtcbiAgICAgICAgICAgIHJlbW92ZUNsYXNzKHNsaWRlc1thY3RpdmVJdGVtXSxzbGlkZURpcmVjdGlvbik7XG4gIFxuICAgICAgICAgICAgYm9vdHN0cmFwQ3VzdG9tRXZlbnQuY2FsbChlbGVtZW50LCBzbGlkRXZlbnQsIGNvbXBvbmVudCwgc2xpZGVzW25leHRdKTtcbiAgXG4gICAgICAgICAgICBpZiAoIHNlbGZbaW50ZXJ2YWxdICYmICFoYXNDbGFzcyhlbGVtZW50LHBhdXNlZCkgKSB7XG4gICAgICAgICAgICAgIHNlbGYuY3ljbGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LHRpbWVvdXQrMTAwKTtcbiAgICAgICAgfSk7XG4gIFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYWRkQ2xhc3Moc2xpZGVzW25leHRdLGFjdGl2ZSk7XG4gICAgICAgIHNsaWRlc1tuZXh0XVtvZmZzZXRXaWR0aF07XG4gICAgICAgIHJlbW92ZUNsYXNzKHNsaWRlc1thY3RpdmVJdGVtXSxhY3RpdmUpO1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGlzU2xpZGluZyA9IGZhbHNlO1xuICAgICAgICAgIGlmICggc2VsZltpbnRlcnZhbF0gJiYgIWhhc0NsYXNzKGVsZW1lbnQscGF1c2VkKSApIHtcbiAgICAgICAgICAgIHNlbGYuY3ljbGUoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYm9vdHN0cmFwQ3VzdG9tRXZlbnQuY2FsbChlbGVtZW50LCBzbGlkRXZlbnQsIGNvbXBvbmVudCwgc2xpZGVzW25leHRdKTsgLy8gaGVyZSB3ZSBnbyB3aXRoIHRoZSBzbGlkIGV2ZW50XG4gICAgICAgIH0sIDEwMCApO1xuICAgICAgfVxuICAgIH07XG4gICAgdGhpcy5nZXRBY3RpdmVJbmRleCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBzbGlkZXNbaW5kZXhPZl0oZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShlbGVtZW50LCdpdGVtIGFjdGl2ZScpWzBdKSB8fCAwO1xuICAgIH07XG4gIFxuICAgIC8vIGluaXRcbiAgICBpZiAoICEoc3RyaW5nQ2Fyb3VzZWwgaW4gZWxlbWVudCApICkgeyAvLyBwcmV2ZW50IGFkZGluZyBldmVudCBoYW5kbGVycyB0d2ljZVxuICBcbiAgICAgIGlmICggc2VsZltwYXVzZV0gJiYgc2VsZltpbnRlcnZhbF0gKSB7XG4gICAgICAgIG9uKCBlbGVtZW50LCBtb3VzZUhvdmVyWzBdLCBwYXVzZUhhbmRsZXIgKTtcbiAgICAgICAgb24oIGVsZW1lbnQsIG1vdXNlSG92ZXJbMV0sIHJlc3VtZUhhbmRsZXIgKTtcbiAgICAgICAgb24oIGVsZW1lbnQsICd0b3VjaHN0YXJ0JywgcGF1c2VIYW5kbGVyICk7XG4gICAgICAgIG9uKCBlbGVtZW50LCAndG91Y2hlbmQnLCByZXN1bWVIYW5kbGVyICk7XG4gICAgICB9XG4gICAgXG4gICAgICByaWdodEFycm93ICYmIG9uKCByaWdodEFycm93LCBjbGlja0V2ZW50LCBjb250cm9sc0hhbmRsZXIgKTtcbiAgICAgIGxlZnRBcnJvdyAmJiBvbiggbGVmdEFycm93LCBjbGlja0V2ZW50LCBjb250cm9sc0hhbmRsZXIgKTtcbiAgICBcbiAgICAgIGluZGljYXRvciAmJiBvbiggaW5kaWNhdG9yLCBjbGlja0V2ZW50LCBpbmRpY2F0b3JIYW5kbGVyICk7XG4gICAgICBzZWxmW2tleWJvYXJkXSAmJiBvbiggZ2xvYmFsT2JqZWN0LCBrZXlkb3duRXZlbnQsIGtleUhhbmRsZXIgKTtcbiAgXG4gICAgfVxuICAgIGlmIChzZWxmLmdldEFjdGl2ZUluZGV4KCk8MCkge1xuICAgICAgc2xpZGVzW2xlbmd0aF0gJiYgYWRkQ2xhc3Moc2xpZGVzWzBdLGFjdGl2ZSk7XG4gICAgICBpbmRpY2F0b3JzW2xlbmd0aF0gJiYgc2V0QWN0aXZlUGFnZSgwKTtcbiAgICB9XG4gIFxuICAgIGlmICggc2VsZltpbnRlcnZhbF0gKXsgc2VsZi5jeWNsZSgpOyB9XG4gICAgZWxlbWVudFtzdHJpbmdDYXJvdXNlbF0gPSBzZWxmO1xuICB9O1xuICBcbiAgLy8gQ0FST1VTRUwgREFUQSBBUElcbiAgLy8gPT09PT09PT09PT09PT09PT1cbiAgc3VwcG9ydHNbcHVzaF0oIFsgc3RyaW5nQ2Fyb3VzZWwsIENhcm91c2VsLCAnWycrZGF0YVJpZGUrJz1cImNhcm91c2VsXCJdJyBdICk7XG4gIFxuICBcbiAgLyogTmF0aXZlIEphdmFzY3JpcHQgZm9yIEJvb3RzdHJhcCAzIHwgQ29sbGFwc2VcbiAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuICBcbiAgLy8gQ09MTEFQU0UgREVGSU5JVElPTlxuICAvLyA9PT09PT09PT09PT09PT09PT09XG4gIHZhciBDb2xsYXBzZSA9IGZ1bmN0aW9uKCBlbGVtZW50LCBvcHRpb25zICkge1xuICBcbiAgICAvLyBpbml0aWFsaXphdGlvbiBlbGVtZW50XG4gICAgZWxlbWVudCA9IHF1ZXJ5RWxlbWVudChlbGVtZW50KTtcbiAgXG4gICAgLy8gc2V0IG9wdGlvbnNcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgXG4gICAgLy8gZXZlbnQgdGFyZ2V0cyBhbmQgY29uc3RhbnRzXG4gICAgdmFyIGFjY29yZGlvbiA9IG51bGwsIGNvbGxhcHNlID0gbnVsbCwgc2VsZiA9IHRoaXMsXG4gICAgICBpc0FuaW1hdGluZyA9IGZhbHNlLCAvLyB3aGVuIHRydWUgaXQgd2lsbCBwcmV2ZW50IGNsaWNrIGhhbmRsZXJzXG4gICAgICBhY2NvcmRpb25EYXRhID0gZWxlbWVudFtnZXRBdHRyaWJ1dGVdKCdkYXRhLXBhcmVudCcpLFxuICBcbiAgICAgIC8vIGNvbXBvbmVudCBzdHJpbmdzXG4gICAgICBjb21wb25lbnQgPSAnY29sbGFwc2UnLFxuICAgICAgY29sbGFwc2VkID0gJ2NvbGxhcHNlZCcsXG4gIFxuICAgICAgLy8gcHJpdmF0ZSBtZXRob2RzXG4gICAgICBvcGVuQWN0aW9uID0gZnVuY3Rpb24oY29sbGFwc2VFbGVtZW50KSB7XG4gICAgICAgIGJvb3RzdHJhcEN1c3RvbUV2ZW50LmNhbGwoY29sbGFwc2VFbGVtZW50LCBzaG93RXZlbnQsIGNvbXBvbmVudCk7XG4gICAgICAgIGlzQW5pbWF0aW5nID0gdHJ1ZTtcbiAgICAgICAgYWRkQ2xhc3MoY29sbGFwc2VFbGVtZW50LGNvbGxhcHNpbmcpO1xuICAgICAgICByZW1vdmVDbGFzcyhjb2xsYXBzZUVsZW1lbnQsY29tcG9uZW50KTtcbiAgICAgICAgY29sbGFwc2VFbGVtZW50W3N0eWxlXVtoZWlnaHRdID0gY29sbGFwc2VFbGVtZW50W3Njcm9sbEhlaWdodF0gKyAncHgnO1xuICAgICAgICBcbiAgICAgICAgZW11bGF0ZVRyYW5zaXRpb25FbmQoY29sbGFwc2VFbGVtZW50LCBmdW5jdGlvbigpIHtcbiAgICAgICAgICBpc0FuaW1hdGluZyA9IGZhbHNlO1xuICAgICAgICAgIGNvbGxhcHNlRWxlbWVudFtzZXRBdHRyaWJ1dGVdKGFyaWFFeHBhbmRlZCwndHJ1ZScpO1xuICAgICAgICAgIHJlbW92ZUNsYXNzKGNvbGxhcHNlRWxlbWVudCxjb2xsYXBzaW5nKTtcbiAgICAgICAgICBhZGRDbGFzcyhjb2xsYXBzZUVsZW1lbnQsIGNvbXBvbmVudCk7XG4gICAgICAgICAgYWRkQ2xhc3MoY29sbGFwc2VFbGVtZW50LCBpbkNsYXNzKTtcbiAgICAgICAgICBjb2xsYXBzZUVsZW1lbnRbc3R5bGVdW2hlaWdodF0gPSAnJztcbiAgICAgICAgICBib290c3RyYXBDdXN0b21FdmVudC5jYWxsKGNvbGxhcHNlRWxlbWVudCwgc2hvd25FdmVudCwgY29tcG9uZW50KTtcbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgY2xvc2VBY3Rpb24gPSBmdW5jdGlvbihjb2xsYXBzZUVsZW1lbnQpIHtcbiAgICAgICAgYm9vdHN0cmFwQ3VzdG9tRXZlbnQuY2FsbChjb2xsYXBzZUVsZW1lbnQsIGhpZGVFdmVudCwgY29tcG9uZW50KTtcbiAgICAgICAgaXNBbmltYXRpbmcgPSB0cnVlO1xuICAgICAgICBjb2xsYXBzZUVsZW1lbnRbc3R5bGVdW2hlaWdodF0gPSBjb2xsYXBzZUVsZW1lbnRbc2Nyb2xsSGVpZ2h0XSArICdweCc7IC8vIHNldCBoZWlnaHQgZmlyc3RcbiAgICAgICAgcmVtb3ZlQ2xhc3MoY29sbGFwc2VFbGVtZW50LGNvbXBvbmVudCk7XG4gICAgICAgIHJlbW92ZUNsYXNzKGNvbGxhcHNlRWxlbWVudCwgaW5DbGFzcyk7XG4gICAgICAgIGFkZENsYXNzKGNvbGxhcHNlRWxlbWVudCwgY29sbGFwc2luZyk7XG4gICAgICAgIGNvbGxhcHNlRWxlbWVudFtvZmZzZXRXaWR0aF07IC8vIGZvcmNlIHJlZmxvdyB0byBlbmFibGUgdHJhbnNpdGlvblxuICAgICAgICBjb2xsYXBzZUVsZW1lbnRbc3R5bGVdW2hlaWdodF0gPSAnMHB4JztcbiAgICAgICAgXG4gICAgICAgIGVtdWxhdGVUcmFuc2l0aW9uRW5kKGNvbGxhcHNlRWxlbWVudCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgaXNBbmltYXRpbmcgPSBmYWxzZTtcbiAgICAgICAgICBjb2xsYXBzZUVsZW1lbnRbc2V0QXR0cmlidXRlXShhcmlhRXhwYW5kZWQsJ2ZhbHNlJyk7XG4gICAgICAgICAgcmVtb3ZlQ2xhc3MoY29sbGFwc2VFbGVtZW50LGNvbGxhcHNpbmcpO1xuICAgICAgICAgIGFkZENsYXNzKGNvbGxhcHNlRWxlbWVudCxjb21wb25lbnQpO1xuICAgICAgICAgIGNvbGxhcHNlRWxlbWVudFtzdHlsZV1baGVpZ2h0XSA9ICcnO1xuICAgICAgICAgIGJvb3RzdHJhcEN1c3RvbUV2ZW50LmNhbGwoY29sbGFwc2VFbGVtZW50LCBoaWRkZW5FdmVudCwgY29tcG9uZW50KTtcbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgZ2V0VGFyZ2V0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBocmVmID0gZWxlbWVudC5ocmVmICYmIGVsZW1lbnRbZ2V0QXR0cmlidXRlXSgnaHJlZicpLFxuICAgICAgICAgIHBhcmVudCA9IGVsZW1lbnRbZ2V0QXR0cmlidXRlXShkYXRhVGFyZ2V0KSxcbiAgICAgICAgICBpZCA9IGhyZWYgfHwgKCBwYXJlbnQgJiYgcGFyZW50LmNoYXJBdCgwKSA9PT0gJyMnICkgJiYgcGFyZW50O1xuICAgICAgICByZXR1cm4gaWQgJiYgcXVlcnlFbGVtZW50KGlkKTtcbiAgICAgIH07XG4gICAgXG4gICAgLy8gcHVibGljIG1ldGhvZHNcbiAgICB0aGlzLnRvZ2dsZSA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgIGVbcHJldmVudERlZmF1bHRdKCk7XG4gICAgICBpZiAoIGlzQW5pbWF0aW5nICkgcmV0dXJuO1xuICAgICAgaWYgKCFoYXNDbGFzcyhjb2xsYXBzZSxpbkNsYXNzKSkgeyBzZWxmLnNob3coKTsgfSBcbiAgICAgIGVsc2UgeyBzZWxmLmhpZGUoKTsgfVxuICAgIH07XG4gICAgdGhpcy5oaWRlID0gZnVuY3Rpb24oKSB7XG4gICAgICBjbG9zZUFjdGlvbihjb2xsYXBzZSk7XG4gICAgICBhZGRDbGFzcyhlbGVtZW50LGNvbGxhcHNlZCk7XG4gICAgfTtcbiAgICB0aGlzLnNob3cgPSBmdW5jdGlvbigpIHtcbiAgICAgIGlmICggYWNjb3JkaW9uICkge1xuICAgICAgICB2YXIgYWN0aXZlQ29sbGFwc2UgPSBxdWVyeUVsZW1lbnQoJy4nK2NvbXBvbmVudCsnLicraW5DbGFzcyxhY2NvcmRpb24pLFxuICAgICAgICAgICAgdG9nZ2xlID0gYWN0aXZlQ29sbGFwc2UgJiYgKHF1ZXJ5RWxlbWVudCgnWycrZGF0YVRvZ2dsZSsnPVwiJytjb21wb25lbnQrJ1wiXVsnK2RhdGFUYXJnZXQrJz1cIiMnK2FjdGl2ZUNvbGxhcHNlLmlkKydcIl0nLGFjY29yZGlvbilcbiAgICAgICAgICAgICAgICAgICB8fCBxdWVyeUVsZW1lbnQoJ1snK2RhdGFUb2dnbGUrJz1cIicrY29tcG9uZW50KydcIl1baHJlZj1cIiMnK2FjdGl2ZUNvbGxhcHNlLmlkKydcIl0nLGFjY29yZGlvbikgKSxcbiAgICAgICAgICAgIGNvcnJlc3BvbmRpbmdDb2xsYXBzZSA9IHRvZ2dsZSAmJiAodG9nZ2xlW2dldEF0dHJpYnV0ZV0oZGF0YVRhcmdldCkgfHwgdG9nZ2xlLmhyZWYpO1xuICAgICAgICBpZiAoIGFjdGl2ZUNvbGxhcHNlICYmIHRvZ2dsZSAmJiBhY3RpdmVDb2xsYXBzZSAhPT0gY29sbGFwc2UgKSB7IFxuICAgICAgICAgIGNsb3NlQWN0aW9uKGFjdGl2ZUNvbGxhcHNlKTsgXG4gICAgICAgICAgaWYgKCBjb3JyZXNwb25kaW5nQ29sbGFwc2Uuc3BsaXQoJyMnKVsxXSAhPT0gY29sbGFwc2UuaWQgKSB7IGFkZENsYXNzKHRvZ2dsZSxjb2xsYXBzZWQpOyB9IFxuICAgICAgICAgIGVsc2UgeyByZW1vdmVDbGFzcyh0b2dnbGUsY29sbGFwc2VkKTsgfVxuICAgICAgICB9XG4gICAgICB9XG4gIFxuICAgICAgb3BlbkFjdGlvbihjb2xsYXBzZSk7XG4gICAgICByZW1vdmVDbGFzcyhlbGVtZW50LGNvbGxhcHNlZCk7IFxuICAgIH07XG4gIFxuICAgIC8vIGluaXRcbiAgICBpZiAoICEoc3RyaW5nQ29sbGFwc2UgaW4gZWxlbWVudCApICkgeyAvLyBwcmV2ZW50IGFkZGluZyBldmVudCBoYW5kbGVycyB0d2ljZVxuICAgICAgb24oZWxlbWVudCwgY2xpY2tFdmVudCwgc2VsZi50b2dnbGUpO1xuICAgIH1cbiAgICBjb2xsYXBzZSA9IGdldFRhcmdldCgpO1xuICAgIGFjY29yZGlvbiA9IHF1ZXJ5RWxlbWVudChvcHRpb25zLnBhcmVudCkgfHwgYWNjb3JkaW9uRGF0YSAmJiBnZXRDbG9zZXN0KGVsZW1lbnQsIGFjY29yZGlvbkRhdGEpO1xuICAgIGVsZW1lbnRbc3RyaW5nQ29sbGFwc2VdID0gc2VsZjtcbiAgfTtcbiAgXG4gIC8vIENPTExBUFNFIERBVEEgQVBJXG4gIC8vID09PT09PT09PT09PT09PT09XG4gIHN1cHBvcnRzW3B1c2hdKCBbIHN0cmluZ0NvbGxhcHNlLCBDb2xsYXBzZSwgJ1snK2RhdGFUb2dnbGUrJz1cImNvbGxhcHNlXCJdJyBdICk7XG4gIFxuICBcbiAgLyogTmF0aXZlIEphdmFzY3JpcHQgZm9yIEJvb3RzdHJhcCAzIHwgRHJvcGRvd25cbiAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4gIFxuICAvLyBEUk9QRE9XTiBERUZJTklUSU9OXG4gIC8vID09PT09PT09PT09PT09PT09PT1cbiAgdmFyIERyb3Bkb3duID0gZnVuY3Rpb24oIGVsZW1lbnQsIG9wdGlvbiApIHtcbiAgICAgIFxuICAgIC8vIGluaXRpYWxpemF0aW9uIGVsZW1lbnRcbiAgICBlbGVtZW50ID0gcXVlcnlFbGVtZW50KGVsZW1lbnQpO1xuICBcbiAgICAvLyBzZXQgb3B0aW9uXG4gICAgdGhpcy5wZXJzaXN0ID0gb3B0aW9uID09PSB0cnVlIHx8IGVsZW1lbnRbZ2V0QXR0cmlidXRlXSgnZGF0YS1wZXJzaXN0JykgPT09ICd0cnVlJyB8fCBmYWxzZTtcbiAgXG4gICAgLy8gY29uc3RhbnRzLCBldmVudCB0YXJnZXRzLCBzdHJpbmdzXG4gICAgdmFyIHNlbGYgPSB0aGlzLCBjaGlsZHJlbiA9ICdjaGlsZHJlbicsXG4gICAgICBwYXJlbnQgPSBlbGVtZW50W3BhcmVudE5vZGVdLFxuICAgICAgY29tcG9uZW50ID0gJ2Ryb3Bkb3duJywgb3BlbiA9ICdvcGVuJyxcbiAgICAgIHJlbGF0ZWRUYXJnZXQgPSBudWxsLFxuICAgICAgbWVudSA9IHF1ZXJ5RWxlbWVudCgnLmRyb3Bkb3duLW1lbnUnLCBwYXJlbnQpLFxuICAgICAgbWVudUl0ZW1zID0gKGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciBzZXQgPSBtZW51W2NoaWxkcmVuXSwgbmV3U2V0ID0gW107XG4gICAgICAgIGZvciAoIHZhciBpPTA7IGk8c2V0W2xlbmd0aF07IGkrKyApe1xuICAgICAgICAgIHNldFtpXVtjaGlsZHJlbl1bbGVuZ3RoXSAmJiAoc2V0W2ldW2NoaWxkcmVuXVswXS50YWdOYW1lID09PSAnQScgJiYgbmV3U2V0W3B1c2hdKHNldFtpXSkpOyAgICAgICAgICBcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3U2V0O1xuICAgICAgfSkoKSxcbiAgXG4gICAgICAvLyBwcmV2ZW50RGVmYXVsdCBvbiBlbXB0eSBhbmNob3IgbGlua3NcbiAgICAgIHByZXZlbnRFbXB0eUFuY2hvciA9IGZ1bmN0aW9uKGFuY2hvcil7XG4gICAgICAgIChhbmNob3IuaHJlZiAmJiBhbmNob3IuaHJlZi5zbGljZSgtMSkgPT09ICcjJyB8fCBhbmNob3JbcGFyZW50Tm9kZV0gJiYgYW5jaG9yW3BhcmVudE5vZGVdLmhyZWYgXG4gICAgICAgICAgJiYgYW5jaG9yW3BhcmVudE5vZGVdLmhyZWYuc2xpY2UoLTEpID09PSAnIycpICYmIHRoaXNbcHJldmVudERlZmF1bHRdKCk7ICAgICAgXG4gICAgICB9LFxuICBcbiAgICAgIC8vIHRvZ2dsZSBkaXNtaXNzaWJsZSBldmVudHNcbiAgICAgIHRvZ2dsZURpc21pc3MgPSBmdW5jdGlvbigpe1xuICAgICAgICB2YXIgdHlwZSA9IGVsZW1lbnRbb3Blbl0gPyBvbiA6IG9mZjtcbiAgICAgICAgdHlwZShET0MsIGNsaWNrRXZlbnQsIGRpc21pc3NIYW5kbGVyKTsgXG4gICAgICAgIHR5cGUoRE9DLCBrZXlkb3duRXZlbnQsIHByZXZlbnRTY3JvbGwpO1xuICAgICAgICB0eXBlKERPQywga2V5dXBFdmVudCwga2V5SGFuZGxlcik7XG4gICAgICB9LFxuICBcbiAgICAgIC8vIGhhbmRsZXJzXG4gICAgICBkaXNtaXNzSGFuZGxlciA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdmFyIGV2ZW50VGFyZ2V0ID0gZVt0YXJnZXRdLCBoYXNEYXRhID0gZXZlbnRUYXJnZXQgJiYgKHN0cmluZ0Ryb3Bkb3duIGluIGV2ZW50VGFyZ2V0IHx8IHN0cmluZ0Ryb3Bkb3duIGluIGV2ZW50VGFyZ2V0W3BhcmVudE5vZGVdKTtcbiAgICAgICAgaWYgKCAoZXZlbnRUYXJnZXQgPT09IG1lbnUgfHwgbWVudVtjb250YWluc10oZXZlbnRUYXJnZXQpKSAmJiAoc2VsZi5wZXJzaXN0IHx8IGhhc0RhdGEpICkgeyByZXR1cm47IH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgcmVsYXRlZFRhcmdldCA9IGV2ZW50VGFyZ2V0ID09PSBlbGVtZW50IHx8IGVsZW1lbnRbY29udGFpbnNdKGV2ZW50VGFyZ2V0KSA/IGVsZW1lbnQgOiBudWxsO1xuICAgICAgICAgIGhpZGUoKTtcbiAgICAgICAgfVxuICAgICAgICBwcmV2ZW50RW1wdHlBbmNob3IuY2FsbChlLGV2ZW50VGFyZ2V0KTtcbiAgICAgIH0sXG4gICAgICBjbGlja0hhbmRsZXIgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgIHJlbGF0ZWRUYXJnZXQgPSBlbGVtZW50O1xuICAgICAgICBzaG93KCk7XG4gICAgICAgIHByZXZlbnRFbXB0eUFuY2hvci5jYWxsKGUsZVt0YXJnZXRdKTtcbiAgICAgIH0sXG4gICAgICBwcmV2ZW50U2Nyb2xsID0gZnVuY3Rpb24oZSl7XG4gICAgICAgIHZhciBrZXkgPSBlLndoaWNoIHx8IGUua2V5Q29kZTtcbiAgICAgICAgaWYoIGtleSA9PT0gMzggfHwga2V5ID09PSA0MCApIHsgZVtwcmV2ZW50RGVmYXVsdF0oKTsgfVxuICAgICAgfSxcbiAgICAgIGtleUhhbmRsZXIgPSBmdW5jdGlvbihlKXtcbiAgICAgICAgdmFyIGtleSA9IGUud2hpY2ggfHwgZS5rZXlDb2RlLCBcbiAgICAgICAgICAgIGFjdGl2ZUl0ZW0gPSBET0MuYWN0aXZlRWxlbWVudCxcbiAgICAgICAgICAgIGlkeCA9IG1lbnVJdGVtc1tpbmRleE9mXShhY3RpdmVJdGVtW3BhcmVudE5vZGVdKSxcbiAgICAgICAgICAgIGlzU2FtZUVsZW1lbnQgPSBhY3RpdmVJdGVtID09PSBlbGVtZW50LFxuICAgICAgICAgICAgaXNJbnNpZGVNZW51ID0gbWVudVtjb250YWluc10oYWN0aXZlSXRlbSksXG4gICAgICAgICAgICBpc01lbnVJdGVtID0gYWN0aXZlSXRlbVtwYXJlbnROb2RlXVtwYXJlbnROb2RlXSA9PT0gbWVudTtcbiAgICAgICAgXG4gICAgICAgIGlmICggaXNNZW51SXRlbSB8fCBpc1NhbWVFbGVtZW50ICkgeyAvLyBuYXZpZ2F0ZSB1cCB8IGRvd25cbiAgICAgICAgICBpZHggPSBpc1NhbWVFbGVtZW50ID8gMCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDoga2V5ID09PSAzOCA/IChpZHg+MT9pZHgtMTowKSBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDoga2V5ID09PSA0MCA/IChpZHg8bWVudUl0ZW1zW2xlbmd0aF0tMT9pZHgrMTppZHgpIDogaWR4O1xuICAgICAgICAgIG1lbnVJdGVtc1tpZHhdICYmIHNldEZvY3VzKG1lbnVJdGVtc1tpZHhdW2NoaWxkcmVuXVswXSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCAobWVudUl0ZW1zW2xlbmd0aF0gJiYgaXNNZW51SXRlbSAvLyBtZW51IGhhcyBpdGVtc1xuICAgICAgICAgIHx8ICFtZW51SXRlbXNbbGVuZ3RoXSAmJiAoaXNJbnNpZGVNZW51IHx8IGlzU2FtZUVsZW1lbnQpICAvLyBtZW51IG1pZ2h0IGJlIGEgZm9ybVxuICAgICAgICAgIHx8ICFpc0luc2lkZU1lbnUgKSAvLyBvciB0aGUgZm9jdXNlZCBlbGVtZW50IGlzIG5vdCBpbiB0aGUgbWVudSBhdCBhbGxcbiAgICAgICAgICAmJiBlbGVtZW50W29wZW5dICYmIGtleSA9PT0gMjcgLy8gbWVudSBtdXN0IGJlIG9wZW5cbiAgICAgICAgKSB7XG4gICAgICAgICAgc2VsZi50b2dnbGUoKTtcbiAgICAgICAgICByZWxhdGVkVGFyZ2V0ID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfSwgIFxuICBcbiAgICAgIC8vIHByaXZhdGUgbWV0aG9kc1xuICAgICAgc2hvdyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBib290c3RyYXBDdXN0b21FdmVudC5jYWxsKHBhcmVudCwgc2hvd0V2ZW50LCBjb21wb25lbnQsIHJlbGF0ZWRUYXJnZXQpO1xuICAgICAgICBhZGRDbGFzcyhwYXJlbnQsb3Blbik7XG4gICAgICAgIG1lbnVbc2V0QXR0cmlidXRlXShhcmlhRXhwYW5kZWQsdHJ1ZSk7XG4gICAgICAgIGJvb3RzdHJhcEN1c3RvbUV2ZW50LmNhbGwocGFyZW50LCBzaG93bkV2ZW50LCBjb21wb25lbnQsIHJlbGF0ZWRUYXJnZXQpO1xuICAgICAgICBlbGVtZW50W29wZW5dID0gdHJ1ZTtcbiAgICAgICAgb2ZmKGVsZW1lbnQsIGNsaWNrRXZlbnQsIGNsaWNrSGFuZGxlcik7XG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXsgXG4gICAgICAgICAgc2V0Rm9jdXMoIG1lbnVbZ2V0RWxlbWVudHNCeVRhZ05hbWVdKCdJTlBVVCcpWzBdIHx8IGVsZW1lbnQgKTsgLy8gZm9jdXMgdGhlIGZpcnN0IGlucHV0IGl0ZW0gfCBlbGVtZW50XG4gICAgICAgICAgdG9nZ2xlRGlzbWlzcygpOyBcbiAgICAgICAgfSwxKTtcbiAgICAgIH0sXG4gICAgICBoaWRlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGJvb3RzdHJhcEN1c3RvbUV2ZW50LmNhbGwocGFyZW50LCBoaWRlRXZlbnQsIGNvbXBvbmVudCwgcmVsYXRlZFRhcmdldCk7XG4gICAgICAgIHJlbW92ZUNsYXNzKHBhcmVudCxvcGVuKTtcbiAgICAgICAgbWVudVtzZXRBdHRyaWJ1dGVdKGFyaWFFeHBhbmRlZCxmYWxzZSk7XG4gICAgICAgIGJvb3RzdHJhcEN1c3RvbUV2ZW50LmNhbGwocGFyZW50LCBoaWRkZW5FdmVudCwgY29tcG9uZW50LCByZWxhdGVkVGFyZ2V0KTtcbiAgICAgICAgZWxlbWVudFtvcGVuXSA9IGZhbHNlO1xuICAgICAgICB0b2dnbGVEaXNtaXNzKCk7XG4gICAgICAgIHNldEZvY3VzKGVsZW1lbnQpO1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7IG9uKGVsZW1lbnQsIGNsaWNrRXZlbnQsIGNsaWNrSGFuZGxlcik7IH0sMSk7XG4gICAgICB9O1xuICBcbiAgICAvLyBzZXQgaW5pdGlhbCBzdGF0ZSB0byBjbG9zZWRcbiAgICBlbGVtZW50W29wZW5dID0gZmFsc2U7XG4gIFxuICAgIC8vIHB1YmxpYyBtZXRob2RzXG4gICAgdGhpcy50b2dnbGUgPSBmdW5jdGlvbigpIHtcbiAgICAgIGlmIChoYXNDbGFzcyhwYXJlbnQsb3BlbikgJiYgZWxlbWVudFtvcGVuXSkgeyBoaWRlKCk7IH0gXG4gICAgICBlbHNlIHsgc2hvdygpOyB9XG4gICAgfTtcbiAgXG4gICAgLy8gaW5pdFxuICAgIGlmICghKHN0cmluZ0Ryb3Bkb3duIGluIGVsZW1lbnQpKSB7IC8vIHByZXZlbnQgYWRkaW5nIGV2ZW50IGhhbmRsZXJzIHR3aWNlXG4gICAgICAhdGFiaW5kZXggaW4gbWVudSAmJiBtZW51W3NldEF0dHJpYnV0ZV0odGFiaW5kZXgsICcwJyk7IC8vIEZpeCBvbmJsdXIgb24gQ2hyb21lIHwgU2FmYXJpXG4gICAgICBvbihlbGVtZW50LCBjbGlja0V2ZW50LCBjbGlja0hhbmRsZXIpO1xuICAgIH1cbiAgXG4gICAgZWxlbWVudFtzdHJpbmdEcm9wZG93bl0gPSBzZWxmO1xuICB9O1xuICBcbiAgLy8gRFJPUERPV04gREFUQSBBUElcbiAgLy8gPT09PT09PT09PT09PT09PT1cbiAgc3VwcG9ydHNbcHVzaF0oIFtzdHJpbmdEcm9wZG93biwgRHJvcGRvd24sICdbJytkYXRhVG9nZ2xlKyc9XCJkcm9wZG93blwiXSddICk7XG4gIFxuICBcbiAgLyogTmF0aXZlIEphdmFzY3JpcHQgZm9yIEJvb3RzdHJhcCAzIHwgTW9kYWxcbiAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4gIFxuICAvLyBNT0RBTCBERUZJTklUSU9OXG4gIC8vID09PT09PT09PT09PT09PVxuICB2YXIgTW9kYWwgPSBmdW5jdGlvbihlbGVtZW50LCBvcHRpb25zKSB7IC8vIGVsZW1lbnQgY2FuIGJlIHRoZSBtb2RhbC90cmlnZ2VyaW5nIGJ1dHRvblxuICBcbiAgICAvLyB0aGUgbW9kYWwgKGJvdGggSmF2YVNjcmlwdCAvIERBVEEgQVBJIGluaXQpIC8gdHJpZ2dlcmluZyBidXR0b24gZWxlbWVudCAoREFUQSBBUEkpXG4gICAgZWxlbWVudCA9IHF1ZXJ5RWxlbWVudChlbGVtZW50KTtcbiAgXG4gICAgLy8gZGV0ZXJtaW5lIG1vZGFsLCB0cmlnZ2VyaW5nIGVsZW1lbnRcbiAgICB2YXIgYnRuQ2hlY2sgPSBlbGVtZW50W2dldEF0dHJpYnV0ZV0oZGF0YVRhcmdldCl8fGVsZW1lbnRbZ2V0QXR0cmlidXRlXSgnaHJlZicpLFxuICAgICAgY2hlY2tNb2RhbCA9IHF1ZXJ5RWxlbWVudCggYnRuQ2hlY2sgKSxcbiAgICAgIG1vZGFsID0gaGFzQ2xhc3MoZWxlbWVudCwnbW9kYWwnKSA/IGVsZW1lbnQgOiBjaGVja01vZGFsLFxuICBcbiAgICAgIC8vIHN0cmluZ3NcbiAgICAgIGNvbXBvbmVudCA9ICdtb2RhbCcsXG4gICAgICBzdGF0aWNTdHJpbmcgPSAnc3RhdGljJyxcbiAgICAgIHBhZGRpbmdMZWZ0ID0gJ3BhZGRpbmdMZWZ0JyxcbiAgICAgIHBhZGRpbmdSaWdodCA9ICdwYWRkaW5nUmlnaHQnLFxuICAgICAgbW9kYWxCYWNrZHJvcFN0cmluZyA9ICdtb2RhbC1iYWNrZHJvcCc7XG4gIFxuICAgIGlmICggaGFzQ2xhc3MoZWxlbWVudCwnbW9kYWwnKSApIHsgZWxlbWVudCA9IG51bGw7IH0gLy8gbW9kYWwgaXMgbm93IGluZGVwZW5kZW50IG9mIGl0J3MgdHJpZ2dlcmluZyBlbGVtZW50XG4gIFxuICAgIGlmICggIW1vZGFsICkgeyByZXR1cm47IH0gLy8gaW52YWxpZGF0ZVxuICBcbiAgICAvLyBzZXQgb3B0aW9uc1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICBcbiAgICB0aGlzW2tleWJvYXJkXSA9IG9wdGlvbnNba2V5Ym9hcmRdID09PSBmYWxzZSB8fCBtb2RhbFtnZXRBdHRyaWJ1dGVdKGRhdGFLZXlib2FyZCkgPT09ICdmYWxzZScgPyBmYWxzZSA6IHRydWU7XG4gICAgdGhpc1tiYWNrZHJvcF0gPSBvcHRpb25zW2JhY2tkcm9wXSA9PT0gc3RhdGljU3RyaW5nIHx8IG1vZGFsW2dldEF0dHJpYnV0ZV0oZGF0YWJhY2tkcm9wKSA9PT0gc3RhdGljU3RyaW5nID8gc3RhdGljU3RyaW5nIDogdHJ1ZTtcbiAgICB0aGlzW2JhY2tkcm9wXSA9IG9wdGlvbnNbYmFja2Ryb3BdID09PSBmYWxzZSB8fCBtb2RhbFtnZXRBdHRyaWJ1dGVdKGRhdGFiYWNrZHJvcCkgPT09ICdmYWxzZScgPyBmYWxzZSA6IHRoaXNbYmFja2Ryb3BdO1xuICAgIHRoaXNbY29udGVudF0gID0gb3B0aW9uc1tjb250ZW50XTsgLy8gSmF2YVNjcmlwdCBvbmx5XG4gIFxuICAgIC8vIGJpbmQsIGNvbnN0YW50cywgZXZlbnQgdGFyZ2V0cyBhbmQgb3RoZXIgdmFyc1xuICAgIHZhciBzZWxmID0gdGhpcywgcmVsYXRlZFRhcmdldCA9IG51bGwsXG4gICAgICBib2R5SXNPdmVyZmxvd2luZywgbW9kYWxJc092ZXJmbG93aW5nLCBzY3JvbGxiYXJXaWR0aCwgb3ZlcmxheSxcbiAgXG4gICAgICAvLyBhbHNvIGZpbmQgZml4ZWQtdG9wIC8gZml4ZWQtYm90dG9tIGl0ZW1zXG4gICAgICBmaXhlZEl0ZW1zID0gZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShIVE1MLGZpeGVkVG9wKS5jb25jYXQoZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShIVE1MLGZpeGVkQm90dG9tKSksXG4gIFxuICAgICAgLy8gcHJpdmF0ZSBtZXRob2RzXG4gICAgICBnZXRXaW5kb3dXaWR0aCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgaHRtbFJlY3QgPSBIVE1MW2dldEJvdW5kaW5nQ2xpZW50UmVjdF0oKTtcbiAgICAgICAgcmV0dXJuIGdsb2JhbE9iamVjdFtpbm5lcldpZHRoXSB8fCAoaHRtbFJlY3RbcmlnaHRdIC0gTWF0aC5hYnMoaHRtbFJlY3RbbGVmdF0pKTtcbiAgICAgIH0sXG4gICAgICBzZXRTY3JvbGxiYXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBib2R5U3R5bGUgPSBET0NbYm9keV0uY3VycmVudFN0eWxlIHx8IGdsb2JhbE9iamVjdC5nZXRDb21wdXRlZFN0eWxlKERPQ1tib2R5XSksXG4gICAgICAgICAgICBib2R5UGFkID0gcGFyc2VJbnQoKGJvZHlTdHlsZVtwYWRkaW5nUmlnaHRdKSwgMTApLCBpdGVtUGFkO1xuICAgICAgICBpZiAoYm9keUlzT3ZlcmZsb3dpbmcpIHtcbiAgICAgICAgICBET0NbYm9keV1bc3R5bGVdW3BhZGRpbmdSaWdodF0gPSAoYm9keVBhZCArIHNjcm9sbGJhcldpZHRoKSArICdweCc7XG4gICAgICAgICAgaWYgKGZpeGVkSXRlbXNbbGVuZ3RoXSl7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGZpeGVkSXRlbXNbbGVuZ3RoXTsgaSsrKSB7XG4gICAgICAgICAgICAgIGl0ZW1QYWQgPSAoZml4ZWRJdGVtc1tpXS5jdXJyZW50U3R5bGUgfHwgZ2xvYmFsT2JqZWN0LmdldENvbXB1dGVkU3R5bGUoZml4ZWRJdGVtc1tpXSkpW3BhZGRpbmdSaWdodF07XG4gICAgICAgICAgICAgIGZpeGVkSXRlbXNbaV1bc3R5bGVdW3BhZGRpbmdSaWdodF0gPSAoIHBhcnNlSW50KGl0ZW1QYWQpICsgc2Nyb2xsYmFyV2lkdGgpICsgJ3B4JztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICByZXNldFNjcm9sbGJhciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgRE9DW2JvZHldW3N0eWxlXVtwYWRkaW5nUmlnaHRdID0gJyc7XG4gICAgICAgIGlmIChmaXhlZEl0ZW1zW2xlbmd0aF0pe1xuICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZml4ZWRJdGVtc1tsZW5ndGhdOyBpKyspIHtcbiAgICAgICAgICAgIGZpeGVkSXRlbXNbaV1bc3R5bGVdW3BhZGRpbmdSaWdodF0gPSAnJztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBtZWFzdXJlU2Nyb2xsYmFyID0gZnVuY3Rpb24gKCkgeyAvLyB0aHggd2Fsc2hcbiAgICAgICAgdmFyIHNjcm9sbERpdiA9IERPQ1tjcmVhdGVFbGVtZW50XSgnZGl2JyksIHNjcm9sbEJhcldpZHRoO1xuICAgICAgICBzY3JvbGxEaXYuY2xhc3NOYW1lID0gY29tcG9uZW50Kyctc2Nyb2xsYmFyLW1lYXN1cmUnOyAvLyB0aGlzIGlzIGhlcmUgdG8gc3RheVxuICAgICAgICBET0NbYm9keV1bYXBwZW5kQ2hpbGRdKHNjcm9sbERpdik7XG4gICAgICAgIHNjcm9sbEJhcldpZHRoID0gc2Nyb2xsRGl2W29mZnNldFdpZHRoXSAtIHNjcm9sbERpdltjbGllbnRXaWR0aF07XG4gICAgICAgIERPQ1tib2R5XS5yZW1vdmVDaGlsZChzY3JvbGxEaXYpO1xuICAgICAgcmV0dXJuIHNjcm9sbEJhcldpZHRoO1xuICAgICAgfSxcbiAgICAgIGNoZWNrU2Nyb2xsYmFyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBib2R5SXNPdmVyZmxvd2luZyA9IERPQ1tib2R5XVtjbGllbnRXaWR0aF0gPCBnZXRXaW5kb3dXaWR0aCgpO1xuICAgICAgICBtb2RhbElzT3ZlcmZsb3dpbmcgPSBtb2RhbFtzY3JvbGxIZWlnaHRdID4gSFRNTFtjbGllbnRIZWlnaHRdO1xuICAgICAgICBzY3JvbGxiYXJXaWR0aCA9IG1lYXN1cmVTY3JvbGxiYXIoKTtcbiAgICAgIH0sXG4gICAgICBhZGp1c3REaWFsb2cgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIG1vZGFsW3N0eWxlXVtwYWRkaW5nTGVmdF0gPSAhYm9keUlzT3ZlcmZsb3dpbmcgJiYgbW9kYWxJc092ZXJmbG93aW5nID8gc2Nyb2xsYmFyV2lkdGggKyAncHgnIDogJyc7XG4gICAgICAgIG1vZGFsW3N0eWxlXVtwYWRkaW5nUmlnaHRdID0gYm9keUlzT3ZlcmZsb3dpbmcgJiYgIW1vZGFsSXNPdmVyZmxvd2luZyA/IHNjcm9sbGJhcldpZHRoICsgJ3B4JyA6ICcnO1xuICAgICAgfSxcbiAgICAgIHJlc2V0QWRqdXN0bWVudHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIG1vZGFsW3N0eWxlXVtwYWRkaW5nTGVmdF0gPSAnJztcbiAgICAgICAgbW9kYWxbc3R5bGVdW3BhZGRpbmdSaWdodF0gPSAnJztcbiAgICAgIH0sXG4gICAgICBjcmVhdGVPdmVybGF5ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIG1vZGFsT3ZlcmxheSA9IDE7XG4gICAgICAgIFxuICAgICAgICB2YXIgbmV3T3ZlcmxheSA9IERPQ1tjcmVhdGVFbGVtZW50XSgnZGl2Jyk7XG4gICAgICAgIG92ZXJsYXkgPSBxdWVyeUVsZW1lbnQoJy4nK21vZGFsQmFja2Ryb3BTdHJpbmcpO1xuICBcbiAgICAgICAgaWYgKCBvdmVybGF5ID09PSBudWxsICkge1xuICAgICAgICAgIG5ld092ZXJsYXlbc2V0QXR0cmlidXRlXSgnY2xhc3MnLG1vZGFsQmFja2Ryb3BTdHJpbmcrJyBmYWRlJyk7XG4gICAgICAgICAgb3ZlcmxheSA9IG5ld092ZXJsYXk7XG4gICAgICAgICAgRE9DW2JvZHldW2FwcGVuZENoaWxkXShvdmVybGF5KTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHJlbW92ZU92ZXJsYXkgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgb3ZlcmxheSA9IHF1ZXJ5RWxlbWVudCgnLicrbW9kYWxCYWNrZHJvcFN0cmluZyk7XG4gICAgICAgIGlmICggb3ZlcmxheSAmJiBvdmVybGF5ICE9PSBudWxsICYmIHR5cGVvZiBvdmVybGF5ID09PSAnb2JqZWN0JyApIHtcbiAgICAgICAgICBtb2RhbE92ZXJsYXkgPSAwO1xuICAgICAgICAgIERPQ1tib2R5XS5yZW1vdmVDaGlsZChvdmVybGF5KTsgb3ZlcmxheSA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgYm9vdHN0cmFwQ3VzdG9tRXZlbnQuY2FsbChtb2RhbCwgaGlkZGVuRXZlbnQsIGNvbXBvbmVudCk7ICAgICAgXG4gICAgICB9LFxuICAgICAga2V5ZG93bkhhbmRsZXJUb2dnbGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKGhhc0NsYXNzKG1vZGFsLGluQ2xhc3MpKSB7XG4gICAgICAgICAgb24oRE9DLCBrZXlkb3duRXZlbnQsIGtleUhhbmRsZXIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG9mZihET0MsIGtleWRvd25FdmVudCwga2V5SGFuZGxlcik7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICByZXNpemVIYW5kbGVyVG9nZ2xlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChoYXNDbGFzcyhtb2RhbCxpbkNsYXNzKSkge1xuICAgICAgICAgIG9uKGdsb2JhbE9iamVjdCwgcmVzaXplRXZlbnQsIHNlbGYudXBkYXRlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBvZmYoZ2xvYmFsT2JqZWN0LCByZXNpemVFdmVudCwgc2VsZi51cGRhdGUpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgZGlzbWlzc0hhbmRsZXJUb2dnbGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKGhhc0NsYXNzKG1vZGFsLGluQ2xhc3MpKSB7XG4gICAgICAgICAgb24obW9kYWwsIGNsaWNrRXZlbnQsIGRpc21pc3NIYW5kbGVyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBvZmYobW9kYWwsIGNsaWNrRXZlbnQsIGRpc21pc3NIYW5kbGVyKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIC8vIHRyaWdnZXJzXG4gICAgICB0cmlnZ2VyU2hvdyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBzZXRGb2N1cyhtb2RhbCk7XG4gICAgICAgIGJvb3RzdHJhcEN1c3RvbUV2ZW50LmNhbGwobW9kYWwsIHNob3duRXZlbnQsIGNvbXBvbmVudCwgcmVsYXRlZFRhcmdldCk7XG4gICAgICB9LFxuICAgICAgdHJpZ2dlckhpZGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgbW9kYWxbc3R5bGVdLmRpc3BsYXkgPSAnJztcbiAgICAgICAgZWxlbWVudCAmJiAoc2V0Rm9jdXMoZWxlbWVudCkpO1xuICAgICAgICBcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgIGlmICghZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShET0MsY29tcG9uZW50KycgJytpbkNsYXNzKVswXSkge1xuICAgICAgICAgICAgcmVzZXRBZGp1c3RtZW50cygpO1xuICAgICAgICAgICAgcmVzZXRTY3JvbGxiYXIoKTtcbiAgICAgICAgICAgIHJlbW92ZUNsYXNzKERPQ1tib2R5XSxjb21wb25lbnQrJy1vcGVuJyk7XG4gICAgICAgICAgICBvdmVybGF5ICYmIGhhc0NsYXNzKG92ZXJsYXksJ2ZhZGUnKSA/IChyZW1vdmVDbGFzcyhvdmVybGF5LGluQ2xhc3MpLCBlbXVsYXRlVHJhbnNpdGlvbkVuZChvdmVybGF5LHJlbW92ZU92ZXJsYXkpKSBcbiAgICAgICAgICAgIDogcmVtb3ZlT3ZlcmxheSgpO1xuICBcbiAgICAgICAgICAgIHJlc2l6ZUhhbmRsZXJUb2dnbGUoKTtcbiAgICAgICAgICAgIGRpc21pc3NIYW5kbGVyVG9nZ2xlKCk7XG4gICAgICAgICAgICBrZXlkb3duSGFuZGxlclRvZ2dsZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgNTApO1xuICAgICAgfSxcbiAgICAgIC8vIGhhbmRsZXJzXG4gICAgICBjbGlja0hhbmRsZXIgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgIHZhciBjbGlja1RhcmdldCA9IGVbdGFyZ2V0XTtcbiAgICAgICAgY2xpY2tUYXJnZXQgPSBjbGlja1RhcmdldFtoYXNBdHRyaWJ1dGVdKGRhdGFUYXJnZXQpIHx8IGNsaWNrVGFyZ2V0W2hhc0F0dHJpYnV0ZV0oJ2hyZWYnKSA/IGNsaWNrVGFyZ2V0IDogY2xpY2tUYXJnZXRbcGFyZW50Tm9kZV07XG4gICAgICAgIGlmICggY2xpY2tUYXJnZXQgPT09IGVsZW1lbnQgJiYgIWhhc0NsYXNzKG1vZGFsLGluQ2xhc3MpICkge1xuICAgICAgICAgIG1vZGFsLm1vZGFsVHJpZ2dlciA9IGVsZW1lbnQ7XG4gICAgICAgICAgcmVsYXRlZFRhcmdldCA9IGVsZW1lbnQ7XG4gICAgICAgICAgc2VsZi5zaG93KCk7XG4gICAgICAgICAgZVtwcmV2ZW50RGVmYXVsdF0oKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGtleUhhbmRsZXIgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgIHZhciBrZXkgPSBlLndoaWNoIHx8IGUua2V5Q29kZTsgLy8ga2V5Q29kZSBmb3IgSUU4XG4gICAgICAgIGlmIChzZWxmW2tleWJvYXJkXSAmJiBrZXkgPT0gMjcgJiYgaGFzQ2xhc3MobW9kYWwsaW5DbGFzcykpIHtcbiAgICAgICAgICBzZWxmLmhpZGUoKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGRpc21pc3NIYW5kbGVyID0gZnVuY3Rpb24oZSkge1xuICAgICAgICB2YXIgY2xpY2tUYXJnZXQgPSBlW3RhcmdldF07XG4gICAgICAgIGlmICggaGFzQ2xhc3MobW9kYWwsaW5DbGFzcykgJiYgKGNsaWNrVGFyZ2V0W3BhcmVudE5vZGVdW2dldEF0dHJpYnV0ZV0oZGF0YURpc21pc3MpID09PSBjb21wb25lbnRcbiAgICAgICAgICAgIHx8IGNsaWNrVGFyZ2V0W2dldEF0dHJpYnV0ZV0oZGF0YURpc21pc3MpID09PSBjb21wb25lbnRcbiAgICAgICAgICAgIHx8IChjbGlja1RhcmdldCA9PT0gbW9kYWwgJiYgc2VsZltiYWNrZHJvcF0gIT09IHN0YXRpY1N0cmluZykgKSApIHtcbiAgICAgICAgICBzZWxmLmhpZGUoKTsgcmVsYXRlZFRhcmdldCA9IG51bGw7XG4gICAgICAgICAgZVtwcmV2ZW50RGVmYXVsdF0oKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgXG4gICAgLy8gcHVibGljIG1ldGhvZHNcbiAgICB0aGlzLnRvZ2dsZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCBoYXNDbGFzcyhtb2RhbCxpbkNsYXNzKSApIHt0aGlzLmhpZGUoKTt9IGVsc2Uge3RoaXMuc2hvdygpO31cbiAgICB9O1xuICAgIHRoaXMuc2hvdyA9IGZ1bmN0aW9uKCkge1xuICAgICAgYm9vdHN0cmFwQ3VzdG9tRXZlbnQuY2FsbChtb2RhbCwgc2hvd0V2ZW50LCBjb21wb25lbnQsIHJlbGF0ZWRUYXJnZXQpO1xuICBcbiAgICAgIC8vIHdlIGVsZWdhbnRseSBoaWRlIGFueSBvcGVuZWQgbW9kYWxcbiAgICAgIHZhciBjdXJyZW50T3BlbiA9IGdldEVsZW1lbnRzQnlDbGFzc05hbWUoRE9DLGNvbXBvbmVudCsnIGluJylbMF07XG4gICAgICBjdXJyZW50T3BlbiAmJiBjdXJyZW50T3BlbiAhPT0gbW9kYWwgJiYgY3VycmVudE9wZW4ubW9kYWxUcmlnZ2VyW3N0cmluZ01vZGFsXS5oaWRlKCk7XG4gIFxuICAgICAgaWYgKCB0aGlzW2JhY2tkcm9wXSApIHtcbiAgICAgICAgIW1vZGFsT3ZlcmxheSAmJiBjcmVhdGVPdmVybGF5KCk7XG4gICAgICB9XG4gIFxuICAgICAgaWYgKCBvdmVybGF5ICYmIG1vZGFsT3ZlcmxheSAmJiAhaGFzQ2xhc3Mob3ZlcmxheSxpbkNsYXNzKSkge1xuICAgICAgICBvdmVybGF5W29mZnNldFdpZHRoXTsgLy8gZm9yY2UgcmVmbG93IHRvIGVuYWJsZSB0cmFzaXRpb25cbiAgICAgICAgYWRkQ2xhc3Mob3ZlcmxheSxpbkNsYXNzKTtcbiAgICAgIH1cbiAgXG4gICAgICBzZXRUaW1lb3V0KCBmdW5jdGlvbigpIHtcbiAgICAgICAgbW9kYWxbc3R5bGVdLmRpc3BsYXkgPSAnYmxvY2snO1xuICBcbiAgICAgICAgY2hlY2tTY3JvbGxiYXIoKTtcbiAgICAgICAgc2V0U2Nyb2xsYmFyKCk7XG4gICAgICAgIGFkanVzdERpYWxvZygpO1xuICBcbiAgICAgICAgYWRkQ2xhc3MoRE9DW2JvZHldLGNvbXBvbmVudCsnLW9wZW4nKTtcbiAgICAgICAgYWRkQ2xhc3MobW9kYWwsaW5DbGFzcyk7XG4gICAgICAgIG1vZGFsW3NldEF0dHJpYnV0ZV0oYXJpYUhpZGRlbiwgZmFsc2UpO1xuICAgICAgICBcbiAgICAgICAgcmVzaXplSGFuZGxlclRvZ2dsZSgpO1xuICAgICAgICBkaXNtaXNzSGFuZGxlclRvZ2dsZSgpO1xuICAgICAgICBrZXlkb3duSGFuZGxlclRvZ2dsZSgpO1xuICBcbiAgICAgICAgaGFzQ2xhc3MobW9kYWwsJ2ZhZGUnKSA/IGVtdWxhdGVUcmFuc2l0aW9uRW5kKG1vZGFsLCB0cmlnZ2VyU2hvdykgOiB0cmlnZ2VyU2hvdygpO1xuICAgICAgfSwgc3VwcG9ydFRyYW5zaXRpb25zID8gMTUwIDogMCk7XG4gICAgfTtcbiAgICB0aGlzLmhpZGUgPSBmdW5jdGlvbigpIHtcbiAgICAgIGJvb3RzdHJhcEN1c3RvbUV2ZW50LmNhbGwobW9kYWwsIGhpZGVFdmVudCwgY29tcG9uZW50KTtcbiAgICAgIG92ZXJsYXkgPSBxdWVyeUVsZW1lbnQoJy4nK21vZGFsQmFja2Ryb3BTdHJpbmcpO1xuICBcbiAgICAgIHJlbW92ZUNsYXNzKG1vZGFsLGluQ2xhc3MpO1xuICAgICAgbW9kYWxbc2V0QXR0cmlidXRlXShhcmlhSGlkZGVuLCB0cnVlKTtcbiAgXG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgIGhhc0NsYXNzKG1vZGFsLCdmYWRlJykgPyBlbXVsYXRlVHJhbnNpdGlvbkVuZChtb2RhbCwgdHJpZ2dlckhpZGUpIDogdHJpZ2dlckhpZGUoKTtcbiAgICAgIH0sIHN1cHBvcnRUcmFuc2l0aW9ucyA/IDE1MCA6IDApO1xuICAgIH07XG4gICAgdGhpcy5zZXRDb250ZW50ID0gZnVuY3Rpb24oIGNvbnRlbnQgKSB7XG4gICAgICBxdWVyeUVsZW1lbnQoJy4nK2NvbXBvbmVudCsnLWNvbnRlbnQnLG1vZGFsKVtpbm5lckhUTUxdID0gY29udGVudDtcbiAgICB9O1xuICAgIHRoaXMudXBkYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoaGFzQ2xhc3MobW9kYWwsaW5DbGFzcykpIHtcbiAgICAgICAgY2hlY2tTY3JvbGxiYXIoKTtcbiAgICAgICAgc2V0U2Nyb2xsYmFyKCk7XG4gICAgICAgIGFkanVzdERpYWxvZygpO1xuICAgICAgfVxuICAgIH07XG4gIFxuICAgIC8vIGluaXRcbiAgICAvLyBwcmV2ZW50IGFkZGluZyBldmVudCBoYW5kbGVycyBvdmVyIGFuZCBvdmVyXG4gICAgLy8gbW9kYWwgaXMgaW5kZXBlbmRlbnQgb2YgYSB0cmlnZ2VyaW5nIGVsZW1lbnRcbiAgICBpZiAoICEhZWxlbWVudCAmJiAhKHN0cmluZ01vZGFsIGluIGVsZW1lbnQpICkge1xuICAgICAgb24oZWxlbWVudCwgY2xpY2tFdmVudCwgY2xpY2tIYW5kbGVyKTtcbiAgICB9XG4gICAgaWYgKCAhIXNlbGZbY29udGVudF0gKSB7IHNlbGYuc2V0Q29udGVudCggc2VsZltjb250ZW50XSApOyB9XG4gICAgISFlbGVtZW50ICYmIChlbGVtZW50W3N0cmluZ01vZGFsXSA9IHNlbGYpO1xuICB9O1xuICBcbiAgLy8gREFUQSBBUElcbiAgc3VwcG9ydHNbcHVzaF0oIFsgc3RyaW5nTW9kYWwsIE1vZGFsLCAnWycrZGF0YVRvZ2dsZSsnPVwibW9kYWxcIl0nIF0gKTtcbiAgXG4gIC8qIE5hdGl2ZSBKYXZhc2NyaXB0IGZvciBCb290c3RyYXAgMyB8IFBvcG92ZXJcbiAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4gIFxuICAvLyBQT1BPVkVSIERFRklOSVRJT05cbiAgLy8gPT09PT09PT09PT09PT09PT09XG4gIHZhciBQb3BvdmVyID0gZnVuY3Rpb24oIGVsZW1lbnQsIG9wdGlvbnMgKSB7XG4gIFxuICAgIC8vIGluaXRpYWxpemF0aW9uIGVsZW1lbnRcbiAgICBlbGVtZW50ID0gcXVlcnlFbGVtZW50KGVsZW1lbnQpO1xuICBcbiAgICAvLyBzZXQgb3B0aW9uc1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICBcbiAgICAvLyBEQVRBIEFQSVxuICAgIHZhciB0cmlnZ2VyRGF0YSA9IGVsZW1lbnRbZ2V0QXR0cmlidXRlXShkYXRhVHJpZ2dlciksIC8vIGNsaWNrIC8gaG92ZXIgLyBmb2N1c1xuICAgICAgICBhbmltYXRpb25EYXRhID0gZWxlbWVudFtnZXRBdHRyaWJ1dGVdKGRhdGFBbmltYXRpb24pLCAvLyB0cnVlIC8gZmFsc2VcbiAgICAgICAgcGxhY2VtZW50RGF0YSA9IGVsZW1lbnRbZ2V0QXR0cmlidXRlXShkYXRhUGxhY2VtZW50KSxcbiAgICAgICAgZGlzbWlzc2libGVEYXRhID0gZWxlbWVudFtnZXRBdHRyaWJ1dGVdKGRhdGFEaXNtaXNzaWJsZSksXG4gICAgICAgIGRlbGF5RGF0YSA9IGVsZW1lbnRbZ2V0QXR0cmlidXRlXShkYXRhRGVsYXkpLFxuICAgICAgICBjb250YWluZXJEYXRhID0gZWxlbWVudFtnZXRBdHRyaWJ1dGVdKGRhdGFDb250YWluZXIpLFxuICBcbiAgICAgICAgLy8gaW50ZXJuYWwgc3RyaW5nc1xuICAgICAgICBjb21wb25lbnQgPSAncG9wb3ZlcicsXG4gICAgICAgIHRlbXBsYXRlID0gJ3RlbXBsYXRlJyxcbiAgICAgICAgdHJpZ2dlciA9ICd0cmlnZ2VyJyxcbiAgICAgICAgY2xhc3NTdHJpbmcgPSAnY2xhc3MnLFxuICAgICAgICBkaXYgPSAnZGl2JyxcbiAgICAgICAgZmFkZSA9ICdmYWRlJyxcbiAgICAgICAgY29udGVudCA9ICdjb250ZW50JyxcbiAgICAgICAgZGF0YUNvbnRlbnQgPSAnZGF0YS1jb250ZW50JyxcbiAgICAgICAgZGlzbWlzc2libGUgPSAnZGlzbWlzc2libGUnLFxuICAgICAgICBjbG9zZUJ0biA9ICc8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImNsb3NlXCI+w5c8L2J1dHRvbj4nLFxuICBcbiAgICAgICAgLy8gY2hlY2sgY29udGFpbmVyXG4gICAgICAgIGNvbnRhaW5lckVsZW1lbnQgPSBxdWVyeUVsZW1lbnQob3B0aW9uc1tjb250YWluZXJdKSxcbiAgICAgICAgY29udGFpbmVyRGF0YUVsZW1lbnQgPSBxdWVyeUVsZW1lbnQoY29udGFpbmVyRGF0YSksICAgICAgXG4gICAgICAgIFxuICAgICAgICAvLyBtYXliZSB0aGUgZWxlbWVudCBpcyBpbnNpZGUgYSBtb2RhbFxuICAgICAgICBtb2RhbCA9IGdldENsb3Nlc3QoZWxlbWVudCwnLm1vZGFsJyksXG4gICAgICAgIFxuICAgICAgICAvLyBtYXliZSB0aGUgZWxlbWVudCBpcyBpbnNpZGUgYSBmaXhlZCBuYXZiYXJcbiAgICAgICAgbmF2YmFyRml4ZWRUb3AgPSBnZXRDbG9zZXN0KGVsZW1lbnQsJy4nK2ZpeGVkVG9wKSxcbiAgICAgICAgbmF2YmFyRml4ZWRCb3R0b20gPSBnZXRDbG9zZXN0KGVsZW1lbnQsJy4nK2ZpeGVkQm90dG9tKTtcbiAgXG4gICAgLy8gc2V0IGluc3RhbmNlIG9wdGlvbnNcbiAgICB0aGlzW3RlbXBsYXRlXSA9IG9wdGlvbnNbdGVtcGxhdGVdID8gb3B0aW9uc1t0ZW1wbGF0ZV0gOiBudWxsOyAvLyBKYXZhU2NyaXB0IG9ubHlcbiAgICB0aGlzW3RyaWdnZXJdID0gb3B0aW9uc1t0cmlnZ2VyXSA/IG9wdGlvbnNbdHJpZ2dlcl0gOiB0cmlnZ2VyRGF0YSB8fCBob3ZlckV2ZW50O1xuICAgIHRoaXNbYW5pbWF0aW9uXSA9IG9wdGlvbnNbYW5pbWF0aW9uXSAmJiBvcHRpb25zW2FuaW1hdGlvbl0gIT09IGZhZGUgPyBvcHRpb25zW2FuaW1hdGlvbl0gOiBhbmltYXRpb25EYXRhIHx8IGZhZGU7XG4gICAgdGhpc1twbGFjZW1lbnRdID0gb3B0aW9uc1twbGFjZW1lbnRdID8gb3B0aW9uc1twbGFjZW1lbnRdIDogcGxhY2VtZW50RGF0YSB8fCB0b3A7XG4gICAgdGhpc1tkZWxheV0gPSBwYXJzZUludChvcHRpb25zW2RlbGF5XSB8fCBkZWxheURhdGEpIHx8IDIwMDtcbiAgICB0aGlzW2Rpc21pc3NpYmxlXSA9IG9wdGlvbnNbZGlzbWlzc2libGVdIHx8IGRpc21pc3NpYmxlRGF0YSA9PT0gJ3RydWUnID8gdHJ1ZSA6IGZhbHNlO1xuICAgIHRoaXNbY29udGFpbmVyXSA9IGNvbnRhaW5lckVsZW1lbnQgPyBjb250YWluZXJFbGVtZW50IFxuICAgICAgICAgICAgICAgICAgICA6IGNvbnRhaW5lckRhdGFFbGVtZW50ID8gY29udGFpbmVyRGF0YUVsZW1lbnQgXG4gICAgICAgICAgICAgICAgICAgIDogbmF2YmFyRml4ZWRUb3AgPyBuYXZiYXJGaXhlZFRvcFxuICAgICAgICAgICAgICAgICAgICA6IG5hdmJhckZpeGVkQm90dG9tID8gbmF2YmFyRml4ZWRCb3R0b21cbiAgICAgICAgICAgICAgICAgICAgOiBtb2RhbCA/IG1vZGFsIDogRE9DW2JvZHldO1xuICBcbiAgICAvLyBiaW5kLCBjb250ZW50XG4gICAgdmFyIHNlbGYgPSB0aGlzLCBcbiAgICAgIHRpdGxlU3RyaW5nID0gZWxlbWVudFtnZXRBdHRyaWJ1dGVdKGRhdGFUaXRsZSkgfHwgbnVsbCxcbiAgICAgIGNvbnRlbnRTdHJpbmcgPSBlbGVtZW50W2dldEF0dHJpYnV0ZV0oZGF0YUNvbnRlbnQpIHx8IG51bGw7XG4gIFxuICAgIGlmICggIWNvbnRlbnRTdHJpbmcgJiYgIXRoaXNbdGVtcGxhdGVdICkgcmV0dXJuOyAvLyBpbnZhbGlkYXRlXG4gIFxuICAgIC8vIGNvbnN0YW50cywgdmFyc1xuICAgIHZhciBwb3BvdmVyID0gbnVsbCwgdGltZXIgPSAwLCBwbGFjZW1lbnRTZXR0aW5nID0gdGhpc1twbGFjZW1lbnRdLFxuICAgICAgXG4gICAgICAvLyBoYW5kbGVyc1xuICAgICAgZGlzbWlzc2libGVIYW5kbGVyID0gZnVuY3Rpb24oZSkge1xuICAgICAgICBpZiAocG9wb3ZlciAhPT0gbnVsbCAmJiBlW3RhcmdldF0gPT09IHF1ZXJ5RWxlbWVudCgnLmNsb3NlJyxwb3BvdmVyKSkge1xuICAgICAgICAgIHNlbGYuaGlkZSgpO1xuICAgICAgICB9XG4gICAgICB9LFxuICBcbiAgICAgIC8vIHByaXZhdGUgbWV0aG9kc1xuICAgICAgcmVtb3ZlUG9wb3ZlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBzZWxmW2NvbnRhaW5lcl0ucmVtb3ZlQ2hpbGQocG9wb3Zlcik7XG4gICAgICAgIHRpbWVyID0gbnVsbDsgcG9wb3ZlciA9IG51bGw7IFxuICAgICAgfSxcbiAgICAgIGNyZWF0ZVBvcG92ZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdGl0bGVTdHJpbmcgPSBlbGVtZW50W2dldEF0dHJpYnV0ZV0oZGF0YVRpdGxlKTsgLy8gY2hlY2sgY29udGVudCBhZ2FpblxuICAgICAgICBjb250ZW50U3RyaW5nID0gZWxlbWVudFtnZXRBdHRyaWJ1dGVdKGRhdGFDb250ZW50KTtcbiAgXG4gICAgICAgIHBvcG92ZXIgPSBET0NbY3JlYXRlRWxlbWVudF0oZGl2KTtcbiAgXG4gICAgICAgIGlmICggY29udGVudFN0cmluZyAhPT0gbnVsbCAmJiBzZWxmW3RlbXBsYXRlXSA9PT0gbnVsbCApIHsgLy9jcmVhdGUgdGhlIHBvcG92ZXIgZnJvbSBkYXRhIGF0dHJpYnV0ZXNcbiAgXG4gICAgICAgICAgcG9wb3ZlcltzZXRBdHRyaWJ1dGVdKCdyb2xlJywndG9vbHRpcCcpO1xuICBcbiAgICAgICAgICBpZiAodGl0bGVTdHJpbmcgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHZhciBwb3BvdmVyVGl0bGUgPSBET0NbY3JlYXRlRWxlbWVudF0oJ2gzJyk7XG4gICAgICAgICAgICBwb3BvdmVyVGl0bGVbc2V0QXR0cmlidXRlXShjbGFzc1N0cmluZyxjb21wb25lbnQrJy10aXRsZScpO1xuICBcbiAgICAgICAgICAgIHBvcG92ZXJUaXRsZVtpbm5lckhUTUxdID0gc2VsZltkaXNtaXNzaWJsZV0gPyB0aXRsZVN0cmluZyArIGNsb3NlQnRuIDogdGl0bGVTdHJpbmc7XG4gICAgICAgICAgICBwb3BvdmVyW2FwcGVuZENoaWxkXShwb3BvdmVyVGl0bGUpO1xuICAgICAgICAgIH1cbiAgXG4gICAgICAgICAgdmFyIHBvcG92ZXJBcnJvdyA9IERPQ1tjcmVhdGVFbGVtZW50XShkaXYpLCBwb3BvdmVyQ29udGVudCA9IERPQ1tjcmVhdGVFbGVtZW50XShkaXYpO1xuICAgICAgICAgIHBvcG92ZXJBcnJvd1tzZXRBdHRyaWJ1dGVdKGNsYXNzU3RyaW5nLCdhcnJvdycpOyBwb3BvdmVyQ29udGVudFtzZXRBdHRyaWJ1dGVdKGNsYXNzU3RyaW5nLGNvbXBvbmVudCsnLWNvbnRlbnQnKTtcbiAgICAgICAgICBwb3BvdmVyW2FwcGVuZENoaWxkXShwb3BvdmVyQXJyb3cpOyBwb3BvdmVyW2FwcGVuZENoaWxkXShwb3BvdmVyQ29udGVudCk7XG4gIFxuICAgICAgICAgIC8vc2V0IHBvcG92ZXIgY29udGVudFxuICAgICAgICAgIHBvcG92ZXJDb250ZW50W2lubmVySFRNTF0gPSBzZWxmW2Rpc21pc3NpYmxlXSAmJiB0aXRsZVN0cmluZyA9PT0gbnVsbCA/IGNvbnRlbnRTdHJpbmcgKyBjbG9zZUJ0biA6IGNvbnRlbnRTdHJpbmc7XG4gIFxuICAgICAgICB9IGVsc2UgeyAgLy8gb3IgY3JlYXRlIHRoZSBwb3BvdmVyIGZyb20gdGVtcGxhdGVcbiAgICAgICAgICB2YXIgcG9wb3ZlclRlbXBsYXRlID0gRE9DW2NyZWF0ZUVsZW1lbnRdKGRpdik7XG4gICAgICAgICAgcG9wb3ZlclRlbXBsYXRlW2lubmVySFRNTF0gPSBzZWxmW3RlbXBsYXRlXTtcbiAgICAgICAgICBwb3BvdmVyW2lubmVySFRNTF0gPSBwb3BvdmVyVGVtcGxhdGUuZmlyc3RDaGlsZFtpbm5lckhUTUxdO1xuICAgICAgICB9XG4gIFxuICAgICAgICAvL2FwcGVuZCB0byB0aGUgY29udGFpbmVyXG4gICAgICAgIHNlbGZbY29udGFpbmVyXVthcHBlbmRDaGlsZF0ocG9wb3Zlcik7XG4gICAgICAgIHBvcG92ZXJbc3R5bGVdLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgICAgICBwb3BvdmVyW3NldEF0dHJpYnV0ZV0oY2xhc3NTdHJpbmcsIGNvbXBvbmVudCsgJyAnICsgcGxhY2VtZW50U2V0dGluZyArICcgJyArIHNlbGZbYW5pbWF0aW9uXSk7XG4gICAgICB9LFxuICAgICAgc2hvd1BvcG92ZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICFoYXNDbGFzcyhwb3BvdmVyLGluQ2xhc3MpICYmICggYWRkQ2xhc3MocG9wb3ZlcixpbkNsYXNzKSApO1xuICAgICAgfSxcbiAgICAgIHVwZGF0ZVBvcG92ZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgc3R5bGVUaXAoZWxlbWVudCxwb3BvdmVyLHBsYWNlbWVudFNldHRpbmcsc2VsZltjb250YWluZXJdKTtcbiAgICAgIH0sXG4gICAgICBcbiAgICAgIC8vIGV2ZW50IHRvZ2dsZVxuICAgICAgZGlzbWlzc0hhbmRsZXJUb2dnbGUgPSBmdW5jdGlvbih0eXBlKXtcbiAgICAgICAgaWYgKGNsaWNrRXZlbnQgPT0gc2VsZlt0cmlnZ2VyXSB8fCAnZm9jdXMnID09IHNlbGZbdHJpZ2dlcl0pIHtcbiAgICAgICAgICAhc2VsZltkaXNtaXNzaWJsZV0gJiYgdHlwZSggZWxlbWVudCwgJ2JsdXInLCBzZWxmLmhpZGUgKTtcbiAgICAgICAgfVxuICAgICAgICBzZWxmW2Rpc21pc3NpYmxlXSAmJiB0eXBlKCBET0MsIGNsaWNrRXZlbnQsIGRpc21pc3NpYmxlSGFuZGxlciApO1xuICAgICAgICAhaXNJRTggJiYgdHlwZSggZ2xvYmFsT2JqZWN0LCByZXNpemVFdmVudCwgc2VsZi5oaWRlICk7XG4gICAgICB9LFxuICBcbiAgICAgIC8vIHRyaWdnZXJzXG4gICAgICBzaG93VHJpZ2dlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBkaXNtaXNzSGFuZGxlclRvZ2dsZShvbik7XG4gICAgICAgIGJvb3RzdHJhcEN1c3RvbUV2ZW50LmNhbGwoZWxlbWVudCwgc2hvd25FdmVudCwgY29tcG9uZW50KTtcbiAgICAgIH0sXG4gICAgICBoaWRlVHJpZ2dlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBkaXNtaXNzSGFuZGxlclRvZ2dsZShvZmYpO1xuICAgICAgICByZW1vdmVQb3BvdmVyKCk7XG4gICAgICAgIGJvb3RzdHJhcEN1c3RvbUV2ZW50LmNhbGwoZWxlbWVudCwgaGlkZGVuRXZlbnQsIGNvbXBvbmVudCk7XG4gICAgICB9O1xuICBcbiAgICAvLyBwdWJsaWMgbWV0aG9kcyAvIGhhbmRsZXJzXG4gICAgdGhpcy50b2dnbGUgPSBmdW5jdGlvbigpIHtcbiAgICAgIGlmIChwb3BvdmVyID09PSBudWxsKSB7IHNlbGYuc2hvdygpOyB9IFxuICAgICAgZWxzZSB7IHNlbGYuaGlkZSgpOyB9XG4gICAgfTtcbiAgICB0aGlzLnNob3cgPSBmdW5jdGlvbigpIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aW1lcik7XG4gICAgICB0aW1lciA9IHNldFRpbWVvdXQoIGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAocG9wb3ZlciA9PT0gbnVsbCkge1xuICAgICAgICAgIHBsYWNlbWVudFNldHRpbmcgPSBzZWxmW3BsYWNlbWVudF07IC8vIHdlIHJlc2V0IHBsYWNlbWVudCBpbiBhbGwgY2FzZXNcbiAgICAgICAgICBjcmVhdGVQb3BvdmVyKCk7XG4gICAgICAgICAgdXBkYXRlUG9wb3ZlcigpO1xuICAgICAgICAgIHNob3dQb3BvdmVyKCk7XG4gICAgICAgICAgYm9vdHN0cmFwQ3VzdG9tRXZlbnQuY2FsbChlbGVtZW50LCBzaG93RXZlbnQsIGNvbXBvbmVudCk7XG4gICAgICAgICAgISFzZWxmW2FuaW1hdGlvbl0gPyBlbXVsYXRlVHJhbnNpdGlvbkVuZChwb3BvdmVyLCBzaG93VHJpZ2dlcikgOiBzaG93VHJpZ2dlcigpO1xuICAgICAgICB9XG4gICAgICB9LCAyMCApO1xuICAgIH07XG4gICAgdGhpcy5oaWRlID0gZnVuY3Rpb24oKSB7XG4gICAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgICAgdGltZXIgPSBzZXRUaW1lb3V0KCBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHBvcG92ZXIgJiYgcG9wb3ZlciAhPT0gbnVsbCAmJiBoYXNDbGFzcyhwb3BvdmVyLGluQ2xhc3MpKSB7XG4gICAgICAgICAgYm9vdHN0cmFwQ3VzdG9tRXZlbnQuY2FsbChlbGVtZW50LCBoaWRlRXZlbnQsIGNvbXBvbmVudCk7XG4gICAgICAgICAgcmVtb3ZlQ2xhc3MocG9wb3ZlcixpbkNsYXNzKTtcbiAgICAgICAgICAhIXNlbGZbYW5pbWF0aW9uXSA/IGVtdWxhdGVUcmFuc2l0aW9uRW5kKHBvcG92ZXIsIGhpZGVUcmlnZ2VyKSA6IGhpZGVUcmlnZ2VyKCk7XG4gICAgICAgIH1cbiAgICAgIH0sIHNlbGZbZGVsYXldICk7XG4gICAgfTtcbiAgXG4gICAgLy8gaW5pdFxuICAgIGlmICggIShzdHJpbmdQb3BvdmVyIGluIGVsZW1lbnQpICkgeyAvLyBwcmV2ZW50IGFkZGluZyBldmVudCBoYW5kbGVycyB0d2ljZVxuICAgICAgaWYgKHNlbGZbdHJpZ2dlcl0gPT09IGhvdmVyRXZlbnQpIHtcbiAgICAgICAgb24oIGVsZW1lbnQsIG1vdXNlSG92ZXJbMF0sIHNlbGYuc2hvdyApO1xuICAgICAgICBpZiAoIXNlbGZbZGlzbWlzc2libGVdKSB7IG9uKCBlbGVtZW50LCBtb3VzZUhvdmVyWzFdLCBzZWxmLmhpZGUgKTsgfVxuICAgICAgfSBlbHNlIGlmIChjbGlja0V2ZW50ID09IHNlbGZbdHJpZ2dlcl0gfHwgJ2ZvY3VzJyA9PSBzZWxmW3RyaWdnZXJdKSB7XG4gICAgICAgIG9uKCBlbGVtZW50LCBzZWxmW3RyaWdnZXJdLCBzZWxmLnRvZ2dsZSApO1xuICAgICAgfSAgICBcbiAgICB9XG4gICAgZWxlbWVudFtzdHJpbmdQb3BvdmVyXSA9IHNlbGY7XG4gIH07XG4gIFxuICAvLyBQT1BPVkVSIERBVEEgQVBJXG4gIC8vID09PT09PT09PT09PT09PT1cbiAgc3VwcG9ydHNbcHVzaF0oIFsgc3RyaW5nUG9wb3ZlciwgUG9wb3ZlciwgJ1snK2RhdGFUb2dnbGUrJz1cInBvcG92ZXJcIl0nIF0gKTtcbiAgXG4gIFxuICAvKiBOYXRpdmUgSmF2YXNjcmlwdCBmb3IgQm9vdHN0cmFwIDMgfCBTY3JvbGxTcHlcbiAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuICBcbiAgLy8gU0NST0xMU1BZIERFRklOSVRJT05cbiAgLy8gPT09PT09PT09PT09PT09PT09PT1cbiAgdmFyIFNjcm9sbFNweSA9IGZ1bmN0aW9uKGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgXG4gICAgLy8gaW5pdGlhbGl6YXRpb24gZWxlbWVudCwgdGhlIGVsZW1lbnQgd2Ugc3B5IG9uXG4gICAgZWxlbWVudCA9IHF1ZXJ5RWxlbWVudChlbGVtZW50KTsgXG4gIFxuICAgIC8vIERBVEEgQVBJXG4gICAgdmFyIHRhcmdldERhdGEgPSBxdWVyeUVsZW1lbnQoZWxlbWVudFtnZXRBdHRyaWJ1dGVdKGRhdGFUYXJnZXQpKSxcbiAgICAgICAgb2Zmc2V0RGF0YSA9IGVsZW1lbnRbZ2V0QXR0cmlidXRlXSgnZGF0YS1vZmZzZXQnKTtcbiAgXG4gICAgLy8gc2V0IG9wdGlvbnNcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICBpZiAoICFvcHRpb25zW3RhcmdldF0gJiYgIXRhcmdldERhdGEgKSB7IHJldHVybjsgfSAvLyBpbnZhbGlkYXRlXG4gIFxuICAgIC8vIGV2ZW50IHRhcmdldHMsIGNvbnN0YW50c1xuICAgIHZhciBzZWxmID0gdGhpcywgc3B5VGFyZ2V0ID0gb3B0aW9uc1t0YXJnZXRdICYmIHF1ZXJ5RWxlbWVudChvcHRpb25zW3RhcmdldF0pIHx8IHRhcmdldERhdGEsXG4gICAgICAgIGxpbmtzID0gc3B5VGFyZ2V0ICYmIHNweVRhcmdldFtnZXRFbGVtZW50c0J5VGFnTmFtZV0oJ0EnKSxcbiAgICAgICAgb2Zmc2V0ID0gcGFyc2VJbnQob2Zmc2V0RGF0YSB8fCBvcHRpb25zWydvZmZzZXQnXSkgfHwgMTAsICAgICAgXG4gICAgICAgIGl0ZW1zID0gW10sIHRhcmdldEl0ZW1zID0gW10sIHNjcm9sbE9mZnNldCxcbiAgICAgICAgc2Nyb2xsVGFyZ2V0ID0gZWxlbWVudFtvZmZzZXRIZWlnaHRdIDwgZWxlbWVudFtzY3JvbGxIZWlnaHRdID8gZWxlbWVudCA6IGdsb2JhbE9iamVjdCwgLy8gZGV0ZXJtaW5lIHdoaWNoIGlzIHRoZSByZWFsIHNjcm9sbFRhcmdldFxuICAgICAgICBpc1dpbmRvdyA9IHNjcm9sbFRhcmdldCA9PT0gZ2xvYmFsT2JqZWN0OyAgXG4gIFxuICAgIC8vIHBvcHVsYXRlIGl0ZW1zIGFuZCB0YXJnZXRzXG4gICAgZm9yICh2YXIgaT0wLCBpbD1saW5rc1tsZW5ndGhdOyBpPGlsOyBpKyspIHtcbiAgICAgIHZhciBocmVmID0gbGlua3NbaV1bZ2V0QXR0cmlidXRlXSgnaHJlZicpLCBcbiAgICAgICAgICB0YXJnZXRJdGVtID0gaHJlZiAmJiBocmVmLmNoYXJBdCgwKSA9PT0gJyMnICYmIGhyZWYuc2xpY2UoLTEpICE9PSAnIycgJiYgcXVlcnlFbGVtZW50KGhyZWYpO1xuICAgICAgaWYgKCAhIXRhcmdldEl0ZW0gKSB7XG4gICAgICAgIGl0ZW1zW3B1c2hdKGxpbmtzW2ldKTtcbiAgICAgICAgdGFyZ2V0SXRlbXNbcHVzaF0odGFyZ2V0SXRlbSk7XG4gICAgICB9XG4gICAgfVxuICBcbiAgICAvLyBwcml2YXRlIG1ldGhvZHNcbiAgICB2YXIgdXBkYXRlSXRlbSA9IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgICB2YXIgcGFyZW50ID0gaXRlbXNbaW5kZXhdW3BhcmVudE5vZGVdLCAvLyBpdGVtJ3MgcGFyZW50IExJIGVsZW1lbnRcbiAgICAgICAgICB0YXJnZXRJdGVtID0gdGFyZ2V0SXRlbXNbaW5kZXhdLCAvLyB0aGUgbWVudSBpdGVtIHRhcmdldHMgdGhpcyBlbGVtZW50XG4gICAgICAgICAgZHJvcGRvd24gPSBnZXRDbG9zZXN0KHBhcmVudCwnLmRyb3Bkb3duJyksXG4gICAgICAgICAgdGFyZ2V0UmVjdCA9IGlzV2luZG93ICYmIHRhcmdldEl0ZW1bZ2V0Qm91bmRpbmdDbGllbnRSZWN0XSgpLFxuICBcbiAgICAgICAgICBpc0FjdGl2ZSA9IGhhc0NsYXNzKHBhcmVudCxhY3RpdmUpIHx8IGZhbHNlLFxuICBcbiAgICAgICAgICB0b3BFZGdlID0gKGlzV2luZG93ID8gdGFyZ2V0UmVjdFt0b3BdICsgc2Nyb2xsT2Zmc2V0IDogdGFyZ2V0SXRlbVtvZmZzZXRUb3BdKSAtIG9mZnNldCxcbiAgICAgICAgICBib3R0b21FZGdlID0gaXNXaW5kb3cgPyB0YXJnZXRSZWN0W2JvdHRvbV0gKyBzY3JvbGxPZmZzZXQgLSBvZmZzZXQgOiB0YXJnZXRJdGVtc1tpbmRleCsxXSA/IHRhcmdldEl0ZW1zW2luZGV4KzFdW29mZnNldFRvcF0gLSBvZmZzZXQgOiBlbGVtZW50W3Njcm9sbEhlaWdodF0sXG4gIFxuICAgICAgICAgIGluc2lkZSA9IHNjcm9sbE9mZnNldCA+PSB0b3BFZGdlICYmIGJvdHRvbUVkZ2UgPiBzY3JvbGxPZmZzZXQ7XG4gIFxuICAgICAgICBpZiAoICFpc0FjdGl2ZSAmJiBpbnNpZGUgKSB7XG4gICAgICAgICAgaWYgKCBwYXJlbnQudGFnTmFtZSA9PT0gJ0xJJyAmJiAhaGFzQ2xhc3MocGFyZW50LGFjdGl2ZSkgKSB7XG4gICAgICAgICAgICBhZGRDbGFzcyhwYXJlbnQsYWN0aXZlKTtcbiAgICAgICAgICAgIGlmIChkcm9wZG93biAmJiAhaGFzQ2xhc3MoZHJvcGRvd24sYWN0aXZlKSApIHtcbiAgICAgICAgICAgICAgYWRkQ2xhc3MoZHJvcGRvd24sYWN0aXZlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJvb3RzdHJhcEN1c3RvbUV2ZW50LmNhbGwoZWxlbWVudCwgJ2FjdGl2YXRlJywgJ3Njcm9sbHNweScsIGl0ZW1zW2luZGV4XSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKCAhaW5zaWRlICkge1xuICAgICAgICAgIGlmICggcGFyZW50LnRhZ05hbWUgPT09ICdMSScgJiYgaGFzQ2xhc3MocGFyZW50LGFjdGl2ZSkgKSB7XG4gICAgICAgICAgICByZW1vdmVDbGFzcyhwYXJlbnQsYWN0aXZlKTtcbiAgICAgICAgICAgIGlmIChkcm9wZG93biAmJiBoYXNDbGFzcyhkcm9wZG93bixhY3RpdmUpICYmICFnZXRFbGVtZW50c0J5Q2xhc3NOYW1lKHBhcmVudFtwYXJlbnROb2RlXSxhY3RpdmUpLmxlbmd0aCApIHtcbiAgICAgICAgICAgICAgcmVtb3ZlQ2xhc3MoZHJvcGRvd24sYWN0aXZlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoICFpbnNpZGUgJiYgIWlzQWN0aXZlIHx8IGlzQWN0aXZlICYmIGluc2lkZSApIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICB1cGRhdGVJdGVtcyA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHNjcm9sbE9mZnNldCA9IGlzV2luZG93ID8gZ2V0U2Nyb2xsKCkueSA6IGVsZW1lbnRbc2Nyb2xsVG9wXTtcbiAgICAgICAgZm9yICh2YXIgaW5kZXg9MCwgaXRsPWl0ZW1zW2xlbmd0aF07IGluZGV4PGl0bDsgaW5kZXgrKykge1xuICAgICAgICAgIHVwZGF0ZUl0ZW0oaW5kZXgpXG4gICAgICAgIH1cbiAgICAgIH07XG4gIFxuICAgIC8vIHB1YmxpYyBtZXRob2RcbiAgICB0aGlzLnJlZnJlc2ggPSBmdW5jdGlvbiAoKSB7XG4gICAgICB1cGRhdGVJdGVtcygpO1xuICAgIH1cbiAgXG4gICAgLy8gaW5pdFxuICAgIGlmICggIShzdHJpbmdTY3JvbGxTcHkgaW4gZWxlbWVudCkgKSB7IC8vIHByZXZlbnQgYWRkaW5nIGV2ZW50IGhhbmRsZXJzIHR3aWNlXG4gICAgICBvbiggc2Nyb2xsVGFyZ2V0LCBzY3JvbGxFdmVudCwgc2VsZi5yZWZyZXNoICk7XG4gICAgICAhaXNJRTggJiYgb24oIGdsb2JhbE9iamVjdCwgcmVzaXplRXZlbnQsIHNlbGYucmVmcmVzaCApOyBcbiAgICB9XG4gICAgc2VsZi5yZWZyZXNoKCk7XG4gICAgZWxlbWVudFtzdHJpbmdTY3JvbGxTcHldID0gc2VsZjtcbiAgfTtcbiAgXG4gIC8vIFNDUk9MTFNQWSBEQVRBIEFQSVxuICAvLyA9PT09PT09PT09PT09PT09PT1cbiAgc3VwcG9ydHNbcHVzaF0oIFsgc3RyaW5nU2Nyb2xsU3B5LCBTY3JvbGxTcHksICdbJytkYXRhU3B5Kyc9XCJzY3JvbGxcIl0nIF0gKTtcbiAgXG4gIFxuICAvKiBOYXRpdmUgSmF2YXNjcmlwdCBmb3IgQm9vdHN0cmFwIDMgfCBUYWJcbiAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuICBcbiAgLy8gVEFCIERFRklOSVRJT05cbiAgLy8gPT09PT09PT09PT09PT1cbiAgdmFyIFRhYiA9IGZ1bmN0aW9uKCBlbGVtZW50LCBvcHRpb25zICkge1xuICBcbiAgICAvLyBpbml0aWFsaXphdGlvbiBlbGVtZW50XG4gICAgZWxlbWVudCA9IHF1ZXJ5RWxlbWVudChlbGVtZW50KTtcbiAgXG4gICAgLy8gREFUQSBBUElcbiAgICB2YXIgaGVpZ2h0RGF0YSA9IGVsZW1lbnRbZ2V0QXR0cmlidXRlXShkYXRhSGVpZ2h0KSxcbiAgICAgIFxuICAgICAgICAvLyBzdHJpbmdzXG4gICAgICAgIGNvbXBvbmVudCA9ICd0YWInLCBoZWlnaHQgPSAnaGVpZ2h0JywgZmxvYXQgPSAnZmxvYXQnLCBpc0FuaW1hdGluZyA9ICdpc0FuaW1hdGluZyc7XG4gIFxuICAgIC8vIHNldCBvcHRpb25zXG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgdGhpc1toZWlnaHRdID0gc3VwcG9ydFRyYW5zaXRpb25zID8gKG9wdGlvbnNbaGVpZ2h0XSB8fCBoZWlnaHREYXRhID09PSAndHJ1ZScpIDogZmFsc2U7IC8vIGZpbHRlciBsZWdhY3kgYnJvd3NlcnNcbiAgXG4gICAgLy8gYmluZCwgZXZlbnQgdGFyZ2V0c1xuICAgIHZhciBzZWxmID0gdGhpcywgbmV4dCxcbiAgICAgIHRhYnMgPSBnZXRDbG9zZXN0KGVsZW1lbnQsJy5uYXYnKSxcbiAgICAgIHRhYnNDb250ZW50Q29udGFpbmVyID0gZmFsc2UsXG4gICAgICBkcm9wZG93biA9IHRhYnMgJiYgcXVlcnlFbGVtZW50KCcuZHJvcGRvd24nLHRhYnMpLFxuICAgICAgYWN0aXZlVGFiLCBhY3RpdmVDb250ZW50LCBuZXh0Q29udGVudCwgY29udGFpbmVySGVpZ2h0LCBlcXVhbENvbnRlbnRzLCBuZXh0SGVpZ2h0LFxuICBcbiAgICAgIC8vIHRyaWdnZXJcbiAgICAgIHRyaWdnZXJFbmQgPSBmdW5jdGlvbigpe1xuICAgICAgICB0YWJzQ29udGVudENvbnRhaW5lcltzdHlsZV1baGVpZ2h0XSA9ICcnO1xuICAgICAgICByZW1vdmVDbGFzcyh0YWJzQ29udGVudENvbnRhaW5lcixjb2xsYXBzaW5nKTtcbiAgICAgICAgdGFic1tpc0FuaW1hdGluZ10gPSBmYWxzZTtcbiAgICAgIH0sXG4gICAgICB0cmlnZ2VyU2hvdyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGFic0NvbnRlbnRDb250YWluZXIpIHsgLy8gaGVpZ2h0IGFuaW1hdGlvblxuICAgICAgICAgIGlmICggZXF1YWxDb250ZW50cyApIHtcbiAgICAgICAgICAgIHRyaWdnZXJFbmQoKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpeyAvLyBlbmFibGVzIGhlaWdodCBhbmltYXRpb25cbiAgICAgICAgICAgICAgdGFic0NvbnRlbnRDb250YWluZXJbc3R5bGVdW2hlaWdodF0gPSBuZXh0SGVpZ2h0ICsgJ3B4JzsgLy8gaGVpZ2h0IGFuaW1hdGlvblxuICAgICAgICAgICAgICB0YWJzQ29udGVudENvbnRhaW5lcltvZmZzZXRXaWR0aF07XG4gICAgICAgICAgICAgIGVtdWxhdGVUcmFuc2l0aW9uRW5kKHRhYnNDb250ZW50Q29udGFpbmVyLCB0cmlnZ2VyRW5kKTtcbiAgICAgICAgICAgIH0sMSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRhYnNbaXNBbmltYXRpbmddID0gZmFsc2U7IFxuICAgICAgICB9XG4gICAgICAgIGJvb3RzdHJhcEN1c3RvbUV2ZW50LmNhbGwobmV4dCwgc2hvd25FdmVudCwgY29tcG9uZW50LCBhY3RpdmVUYWIpO1xuICAgICAgfSxcbiAgICAgIHRyaWdnZXJIaWRlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0YWJzQ29udGVudENvbnRhaW5lcikge1xuICAgICAgICAgIGFjdGl2ZUNvbnRlbnRbc3R5bGVdW2Zsb2F0XSA9IGxlZnQ7XG4gICAgICAgICAgbmV4dENvbnRlbnRbc3R5bGVdW2Zsb2F0XSA9IGxlZnQ7ICAgICAgICBcbiAgICAgICAgICBjb250YWluZXJIZWlnaHQgPSBhY3RpdmVDb250ZW50W3Njcm9sbEhlaWdodF07XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGFkZENsYXNzKG5leHRDb250ZW50LGFjdGl2ZSk7XG4gICAgICAgIGJvb3RzdHJhcEN1c3RvbUV2ZW50LmNhbGwobmV4dCwgc2hvd0V2ZW50LCBjb21wb25lbnQsIGFjdGl2ZVRhYik7XG4gICAgICAgIFxuICAgICAgICByZW1vdmVDbGFzcyhhY3RpdmVDb250ZW50LGFjdGl2ZSk7XG4gICAgICAgIGJvb3RzdHJhcEN1c3RvbUV2ZW50LmNhbGwoYWN0aXZlVGFiLCBoaWRkZW5FdmVudCwgY29tcG9uZW50LCBuZXh0KTtcbiAgICAgICAgXG4gICAgICAgIGlmICh0YWJzQ29udGVudENvbnRhaW5lcikge1xuICAgICAgICAgIG5leHRIZWlnaHQgPSBuZXh0Q29udGVudFtzY3JvbGxIZWlnaHRdO1xuICAgICAgICAgIGVxdWFsQ29udGVudHMgPSBuZXh0SGVpZ2h0ID09PSBjb250YWluZXJIZWlnaHQ7XG4gICAgICAgICAgYWRkQ2xhc3ModGFic0NvbnRlbnRDb250YWluZXIsY29sbGFwc2luZyk7XG4gICAgICAgICAgdGFic0NvbnRlbnRDb250YWluZXJbc3R5bGVdW2hlaWdodF0gPSBjb250YWluZXJIZWlnaHQgKyAncHgnOyAvLyBoZWlnaHQgYW5pbWF0aW9uXG4gICAgICAgICAgdGFic0NvbnRlbnRDb250YWluZXJbb2Zmc2V0SGVpZ2h0XTtcbiAgICAgICAgICBhY3RpdmVDb250ZW50W3N0eWxlXVtmbG9hdF0gPSAnJztcbiAgICAgICAgICBuZXh0Q29udGVudFtzdHlsZV1bZmxvYXRdID0gJyc7XG4gICAgICAgIH1cbiAgXG4gICAgICAgIGlmICggaGFzQ2xhc3MobmV4dENvbnRlbnQsICdmYWRlJykgKSB7XG4gICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpeyAvLyBtYWtlcyBzdXJlIHRvIGdvIGZvcndhcmRcbiAgICAgICAgICAgIGFkZENsYXNzKG5leHRDb250ZW50LGluQ2xhc3MpO1xuICAgICAgICAgICAgZW11bGF0ZVRyYW5zaXRpb25FbmQobmV4dENvbnRlbnQsdHJpZ2dlclNob3cpO1xuICAgICAgICAgIH0sMjApO1xuICAgICAgICB9IGVsc2UgeyB0cmlnZ2VyU2hvdygpOyB9ICAgICAgICBcbiAgICAgIH07XG4gIFxuICAgIGlmICghdGFicykgcmV0dXJuOyAvLyBpbnZhbGlkYXRlIFxuICBcbiAgICAvLyBzZXQgZGVmYXVsdCBhbmltYXRpb24gc3RhdGVcbiAgICB0YWJzW2lzQW5pbWF0aW5nXSA9IGZhbHNlO1xuICAgICAgXG4gICAgLy8gcHJpdmF0ZSBtZXRob2RzXG4gICAgdmFyIGdldEFjdGl2ZVRhYiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgYWN0aXZlVGFicyA9IGdldEVsZW1lbnRzQnlDbGFzc05hbWUodGFicyxhY3RpdmUpLCBhY3RpdmVUYWI7XG4gICAgICAgIGlmICggYWN0aXZlVGFic1tsZW5ndGhdID09PSAxICYmICFoYXNDbGFzcyhhY3RpdmVUYWJzWzBdLCdkcm9wZG93bicpICkge1xuICAgICAgICAgIGFjdGl2ZVRhYiA9IGFjdGl2ZVRhYnNbMF07XG4gICAgICAgIH0gZWxzZSBpZiAoIGFjdGl2ZVRhYnNbbGVuZ3RoXSA+IDEgKSB7XG4gICAgICAgICAgYWN0aXZlVGFiID0gYWN0aXZlVGFic1thY3RpdmVUYWJzW2xlbmd0aF0tMV07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGFjdGl2ZVRhYltnZXRFbGVtZW50c0J5VGFnTmFtZV0oJ0EnKVswXTtcbiAgICAgIH0sXG4gICAgICBnZXRBY3RpdmVDb250ZW50ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBxdWVyeUVsZW1lbnQoZ2V0QWN0aXZlVGFiKClbZ2V0QXR0cmlidXRlXSgnaHJlZicpKTtcbiAgICAgIH0sXG4gICAgICAvLyBoYW5kbGVyXG4gICAgICBjbGlja0hhbmRsZXIgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgIHZhciBocmVmID0gZVt0YXJnZXRdW2dldEF0dHJpYnV0ZV0oJ2hyZWYnKTtcbiAgICAgICAgZVtwcmV2ZW50RGVmYXVsdF0oKTtcbiAgICAgICAgbmV4dCA9IGVbdGFyZ2V0XVtnZXRBdHRyaWJ1dGVdKGRhdGFUb2dnbGUpID09PSBjb21wb25lbnQgfHwgKGhyZWYgJiYgaHJlZi5jaGFyQXQoMCkgPT09ICcjJylcbiAgICAgICAgICAgICA/IGVbdGFyZ2V0XSA6IGVbdGFyZ2V0XVtwYXJlbnROb2RlXTsgLy8gYWxsb3cgZm9yIGNoaWxkIGVsZW1lbnRzIGxpa2UgaWNvbnMgdG8gdXNlIHRoZSBoYW5kbGVyXG4gICAgICAgICF0YWJzW2lzQW5pbWF0aW5nXSAmJiAhaGFzQ2xhc3MobmV4dFtwYXJlbnROb2RlXSxhY3RpdmUpICYmIHNlbGYuc2hvdygpO1xuICAgICAgfTtcbiAgXG4gICAgLy8gcHVibGljIG1ldGhvZFxuICAgIHRoaXMuc2hvdyA9IGZ1bmN0aW9uKCkgeyAvLyB0aGUgdGFiIHdlIGNsaWNrZWQgaXMgbm93IHRoZSBuZXh0IHRhYlxuICAgICAgbmV4dCA9IG5leHQgfHwgZWxlbWVudDtcbiAgICAgIG5leHRDb250ZW50ID0gcXVlcnlFbGVtZW50KG5leHRbZ2V0QXR0cmlidXRlXSgnaHJlZicpKTsgLy90aGlzIGlzIHRoZSBhY3R1YWwgb2JqZWN0LCB0aGUgbmV4dCB0YWIgY29udGVudCB0byBhY3RpdmF0ZVxuICAgICAgYWN0aXZlVGFiID0gZ2V0QWN0aXZlVGFiKCk7IFxuICAgICAgYWN0aXZlQ29udGVudCA9IGdldEFjdGl2ZUNvbnRlbnQoKTtcbiAgXG4gICAgICB0YWJzW2lzQW5pbWF0aW5nXSA9IHRydWU7XG4gICAgICByZW1vdmVDbGFzcyhhY3RpdmVUYWJbcGFyZW50Tm9kZV0sYWN0aXZlKTtcbiAgICAgIGFkZENsYXNzKG5leHRbcGFyZW50Tm9kZV0sYWN0aXZlKTtcbiAgXG4gICAgICBpZiAoIGRyb3Bkb3duICkge1xuICAgICAgICBpZiAoICFoYXNDbGFzcyhlbGVtZW50W3BhcmVudE5vZGVdW3BhcmVudE5vZGVdLCdkcm9wZG93bi1tZW51JykgKSB7XG4gICAgICAgICAgaWYgKGhhc0NsYXNzKGRyb3Bkb3duLGFjdGl2ZSkpIHJlbW92ZUNsYXNzKGRyb3Bkb3duLGFjdGl2ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKCFoYXNDbGFzcyhkcm9wZG93bixhY3RpdmUpKSBhZGRDbGFzcyhkcm9wZG93bixhY3RpdmUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBcbiAgICAgIGJvb3RzdHJhcEN1c3RvbUV2ZW50LmNhbGwoYWN0aXZlVGFiLCBoaWRlRXZlbnQsIGNvbXBvbmVudCwgbmV4dCk7XG4gICAgICBcbiAgICAgIGlmIChoYXNDbGFzcyhhY3RpdmVDb250ZW50LCAnZmFkZScpKSB7XG4gICAgICAgIHJlbW92ZUNsYXNzKGFjdGl2ZUNvbnRlbnQsaW5DbGFzcyk7XG4gICAgICAgIGVtdWxhdGVUcmFuc2l0aW9uRW5kKGFjdGl2ZUNvbnRlbnQsIHRyaWdnZXJIaWRlKTtcbiAgICAgIH0gZWxzZSB7IHRyaWdnZXJIaWRlKCk7IH1cbiAgICB9O1xuICBcbiAgICAvLyBpbml0XG4gICAgaWYgKCAhKHN0cmluZ1RhYiBpbiBlbGVtZW50KSApIHsgLy8gcHJldmVudCBhZGRpbmcgZXZlbnQgaGFuZGxlcnMgdHdpY2VcbiAgICAgIG9uKGVsZW1lbnQsIGNsaWNrRXZlbnQsIGNsaWNrSGFuZGxlcik7XG4gICAgfVxuICAgIGlmIChzZWxmW2hlaWdodF0pIHsgdGFic0NvbnRlbnRDb250YWluZXIgPSBnZXRBY3RpdmVDb250ZW50KClbcGFyZW50Tm9kZV07IH1cbiAgICBlbGVtZW50W3N0cmluZ1RhYl0gPSBzZWxmO1xuICB9O1xuICBcbiAgLy8gVEFCIERBVEEgQVBJXG4gIC8vID09PT09PT09PT09PVxuICBzdXBwb3J0c1twdXNoXSggWyBzdHJpbmdUYWIsIFRhYiwgJ1snK2RhdGFUb2dnbGUrJz1cInRhYlwiXScgXSApO1xuICBcbiAgXG4gIC8qIE5hdGl2ZSBKYXZhc2NyaXB0IGZvciBCb290c3RyYXAgMyB8IFRvb2x0aXBcbiAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbiAgXG4gIC8vIFRPT0xUSVAgREVGSU5JVElPTlxuICAvLyA9PT09PT09PT09PT09PT09PT1cbiAgdmFyIFRvb2x0aXAgPSBmdW5jdGlvbiggZWxlbWVudCxvcHRpb25zICkge1xuICBcbiAgICAvLyBpbml0aWFsaXphdGlvbiBlbGVtZW50XG4gICAgZWxlbWVudCA9IHF1ZXJ5RWxlbWVudChlbGVtZW50KTtcbiAgXG4gICAgLy8gc2V0IG9wdGlvbnNcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgXG4gICAgLy8gREFUQSBBUElcbiAgICB2YXIgYW5pbWF0aW9uRGF0YSA9IGVsZW1lbnRbZ2V0QXR0cmlidXRlXShkYXRhQW5pbWF0aW9uKSxcbiAgICAgICAgcGxhY2VtZW50RGF0YSA9IGVsZW1lbnRbZ2V0QXR0cmlidXRlXShkYXRhUGxhY2VtZW50KSxcbiAgICAgICAgZGVsYXlEYXRhID0gZWxlbWVudFtnZXRBdHRyaWJ1dGVdKGRhdGFEZWxheSksXG4gICAgICAgIGNvbnRhaW5lckRhdGEgPSBlbGVtZW50W2dldEF0dHJpYnV0ZV0oZGF0YUNvbnRhaW5lciksXG4gICAgICAgIFxuICAgICAgICAvLyBzdHJpbmdzXG4gICAgICAgIGNvbXBvbmVudCA9ICd0b29sdGlwJyxcbiAgICAgICAgY2xhc3NTdHJpbmcgPSAnY2xhc3MnLFxuICAgICAgICB0aXRsZSA9ICd0aXRsZScsXG4gICAgICAgIGZhZGUgPSAnZmFkZScsXG4gICAgICAgIGRpdiA9ICdkaXYnLFxuICBcbiAgICAgICAgLy8gY2hlY2sgY29udGFpbmVyXG4gICAgICAgIGNvbnRhaW5lckVsZW1lbnQgPSBxdWVyeUVsZW1lbnQob3B0aW9uc1tjb250YWluZXJdKSxcbiAgICAgICAgY29udGFpbmVyRGF0YUVsZW1lbnQgPSBxdWVyeUVsZW1lbnQoY29udGFpbmVyRGF0YSksICAgICAgICBcbiAgXG4gICAgICAgIC8vIG1heWJlIHRoZSBlbGVtZW50IGlzIGluc2lkZSBhIG1vZGFsXG4gICAgICAgIG1vZGFsID0gZ2V0Q2xvc2VzdChlbGVtZW50LCcubW9kYWwnKSxcbiAgICAgICAgXG4gICAgICAgIC8vIG1heWJlIHRoZSBlbGVtZW50IGlzIGluc2lkZSBhIGZpeGVkIG5hdmJhclxuICAgICAgICBuYXZiYXJGaXhlZFRvcCA9IGdldENsb3Nlc3QoZWxlbWVudCwnLicrZml4ZWRUb3ApLFxuICAgICAgICBuYXZiYXJGaXhlZEJvdHRvbSA9IGdldENsb3Nlc3QoZWxlbWVudCwnLicrZml4ZWRCb3R0b20pO1xuICBcbiAgICAvLyBzZXQgaW5zdGFuY2Ugb3B0aW9uc1xuICAgIHRoaXNbYW5pbWF0aW9uXSA9IG9wdGlvbnNbYW5pbWF0aW9uXSAmJiBvcHRpb25zW2FuaW1hdGlvbl0gIT09IGZhZGUgPyBvcHRpb25zW2FuaW1hdGlvbl0gOiBhbmltYXRpb25EYXRhIHx8IGZhZGU7XG4gICAgdGhpc1twbGFjZW1lbnRdID0gb3B0aW9uc1twbGFjZW1lbnRdID8gb3B0aW9uc1twbGFjZW1lbnRdIDogcGxhY2VtZW50RGF0YSB8fCB0b3A7XG4gICAgdGhpc1tkZWxheV0gPSBwYXJzZUludChvcHRpb25zW2RlbGF5XSB8fCBkZWxheURhdGEpIHx8IDIwMDtcbiAgICB0aGlzW2NvbnRhaW5lcl0gPSBjb250YWluZXJFbGVtZW50ID8gY29udGFpbmVyRWxlbWVudCBcbiAgICAgICAgICAgICAgICAgICAgOiBjb250YWluZXJEYXRhRWxlbWVudCA/IGNvbnRhaW5lckRhdGFFbGVtZW50IFxuICAgICAgICAgICAgICAgICAgICA6IG5hdmJhckZpeGVkVG9wID8gbmF2YmFyRml4ZWRUb3BcbiAgICAgICAgICAgICAgICAgICAgOiBuYXZiYXJGaXhlZEJvdHRvbSA/IG5hdmJhckZpeGVkQm90dG9tXG4gICAgICAgICAgICAgICAgICAgIDogbW9kYWwgPyBtb2RhbCA6IERPQ1tib2R5XTtcbiAgXG4gICAgLy8gYmluZCwgZXZlbnQgdGFyZ2V0cywgdGl0bGUgYW5kIGNvbnN0YW50c1xuICAgIHZhciBzZWxmID0gdGhpcywgdGltZXIgPSAwLCBwbGFjZW1lbnRTZXR0aW5nID0gdGhpc1twbGFjZW1lbnRdLCB0b29sdGlwID0gbnVsbCxcbiAgICAgIHRpdGxlU3RyaW5nID0gZWxlbWVudFtnZXRBdHRyaWJ1dGVdKHRpdGxlKSB8fCBlbGVtZW50W2dldEF0dHJpYnV0ZV0oZGF0YVRpdGxlKSB8fCBlbGVtZW50W2dldEF0dHJpYnV0ZV0oZGF0YU9yaWdpbmFsVGl0bGUpO1xuICBcbiAgICBpZiAoICF0aXRsZVN0cmluZyB8fCB0aXRsZVN0cmluZyA9PSBcIlwiICkgcmV0dXJuOyAvLyBpbnZhbGlkYXRlXG4gIFxuICAgIC8vIHByaXZhdGUgbWV0aG9kc1xuICAgIHZhciByZW1vdmVUb29sVGlwID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHNlbGZbY29udGFpbmVyXS5yZW1vdmVDaGlsZCh0b29sdGlwKTtcbiAgICAgICAgdG9vbHRpcCA9IG51bGw7IHRpbWVyID0gbnVsbDtcbiAgICAgIH0sXG4gICAgICBjcmVhdGVUb29sVGlwID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHRpdGxlU3RyaW5nID0gZWxlbWVudFtnZXRBdHRyaWJ1dGVdKHRpdGxlKSB8fCBlbGVtZW50W2dldEF0dHJpYnV0ZV0oZGF0YVRpdGxlKSB8fCBlbGVtZW50W2dldEF0dHJpYnV0ZV0oZGF0YU9yaWdpbmFsVGl0bGUpOyAvLyByZWFkIHRoZSB0aXRsZSBhZ2FpblxuICAgICAgICBpZiAoICF0aXRsZVN0cmluZyB8fCB0aXRsZVN0cmluZyA9PSBcIlwiICkgcmV0dXJuIGZhbHNlOyAvLyBpbnZhbGlkYXRlXG4gICAgICAgIFxuICAgICAgICB0b29sdGlwID0gRE9DW2NyZWF0ZUVsZW1lbnRdKGRpdik7XG4gICAgICAgIHRvb2x0aXBbc2V0QXR0cmlidXRlXSgncm9sZScsY29tcG9uZW50KTtcbiAgXG4gICAgICAgIHZhciB0b29sdGlwQXJyb3cgPSBET0NbY3JlYXRlRWxlbWVudF0oZGl2KSwgdG9vbHRpcElubmVyID0gRE9DW2NyZWF0ZUVsZW1lbnRdKGRpdik7XG4gICAgICAgIHRvb2x0aXBBcnJvd1tzZXRBdHRyaWJ1dGVdKGNsYXNzU3RyaW5nLCBjb21wb25lbnQrJy1hcnJvdycpOyB0b29sdGlwSW5uZXJbc2V0QXR0cmlidXRlXShjbGFzc1N0cmluZyxjb21wb25lbnQrJy1pbm5lcicpO1xuICBcbiAgICAgICAgdG9vbHRpcFthcHBlbmRDaGlsZF0odG9vbHRpcEFycm93KTsgdG9vbHRpcFthcHBlbmRDaGlsZF0odG9vbHRpcElubmVyKTtcbiAgXG4gICAgICAgIHRvb2x0aXBJbm5lcltpbm5lckhUTUxdID0gdGl0bGVTdHJpbmc7XG4gIFxuICAgICAgICBzZWxmW2NvbnRhaW5lcl1bYXBwZW5kQ2hpbGRdKHRvb2x0aXApO1xuICAgICAgICB0b29sdGlwW3NldEF0dHJpYnV0ZV0oY2xhc3NTdHJpbmcsIGNvbXBvbmVudCArICcgJyArIHBsYWNlbWVudFNldHRpbmcgKyAnICcgKyBzZWxmW2FuaW1hdGlvbl0pO1xuICAgICAgfSxcbiAgICAgIHVwZGF0ZVRvb2x0aXAgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHN0eWxlVGlwKGVsZW1lbnQsdG9vbHRpcCxwbGFjZW1lbnRTZXR0aW5nLHNlbGZbY29udGFpbmVyXSk7XG4gICAgICB9LFxuICAgICAgc2hvd1Rvb2x0aXAgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICFoYXNDbGFzcyh0b29sdGlwLGluQ2xhc3MpICYmICggYWRkQ2xhc3ModG9vbHRpcCxpbkNsYXNzKSApO1xuICAgICAgfSxcbiAgICAgIC8vIHRyaWdnZXJzXG4gICAgICBzaG93VHJpZ2dlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBib290c3RyYXBDdXN0b21FdmVudC5jYWxsKGVsZW1lbnQsIHNob3duRXZlbnQsIGNvbXBvbmVudCk7XG4gICAgICAgICFpc0lFOCAmJiBvbiggZ2xvYmFsT2JqZWN0LCByZXNpemVFdmVudCwgc2VsZi5oaWRlICk7ICAgICAgXG4gICAgICB9LFxuICAgICAgaGlkZVRyaWdnZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgIWlzSUU4ICYmIG9mZiggZ2xvYmFsT2JqZWN0LCByZXNpemVFdmVudCwgc2VsZi5oaWRlICk7ICAgICAgXG4gICAgICAgIHJlbW92ZVRvb2xUaXAoKTtcbiAgICAgICAgYm9vdHN0cmFwQ3VzdG9tRXZlbnQuY2FsbChlbGVtZW50LCBoaWRkZW5FdmVudCwgY29tcG9uZW50KTtcbiAgICAgIH07XG4gIFxuICAgIC8vIHB1YmxpYyBtZXRob2RzXG4gICAgdGhpcy5zaG93ID0gZnVuY3Rpb24oKSB7XG4gICAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgICAgdGltZXIgPSBzZXRUaW1lb3V0KCBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRvb2x0aXAgPT09IG51bGwpIHtcbiAgICAgICAgICBwbGFjZW1lbnRTZXR0aW5nID0gc2VsZltwbGFjZW1lbnRdOyAvLyB3ZSByZXNldCBwbGFjZW1lbnQgaW4gYWxsIGNhc2VzXG4gICAgICAgICAgaWYoY3JlYXRlVG9vbFRpcCgpID09IGZhbHNlKSByZXR1cm47XG4gICAgICAgICAgdXBkYXRlVG9vbHRpcCgpO1xuICAgICAgICAgIHNob3dUb29sdGlwKCk7XG4gICAgICAgICAgYm9vdHN0cmFwQ3VzdG9tRXZlbnQuY2FsbChlbGVtZW50LCBzaG93RXZlbnQsIGNvbXBvbmVudCk7XG4gICAgICAgICAgISFzZWxmW2FuaW1hdGlvbl0gPyBlbXVsYXRlVHJhbnNpdGlvbkVuZCh0b29sdGlwLCBzaG93VHJpZ2dlcikgOiBzaG93VHJpZ2dlcigpO1xuICAgICAgICB9XG4gICAgICB9LCAyMCApO1xuICAgIH07XG4gICAgdGhpcy5oaWRlID0gZnVuY3Rpb24oKSB7XG4gICAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgICAgdGltZXIgPSBzZXRUaW1lb3V0KCBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRvb2x0aXAgJiYgaGFzQ2xhc3ModG9vbHRpcCxpbkNsYXNzKSkge1xuICAgICAgICAgIGJvb3RzdHJhcEN1c3RvbUV2ZW50LmNhbGwoZWxlbWVudCwgaGlkZUV2ZW50LCBjb21wb25lbnQpO1xuICAgICAgICAgIHJlbW92ZUNsYXNzKHRvb2x0aXAsaW5DbGFzcyk7XG4gICAgICAgICAgISFzZWxmW2FuaW1hdGlvbl0gPyBlbXVsYXRlVHJhbnNpdGlvbkVuZCh0b29sdGlwLCBoaWRlVHJpZ2dlcikgOiBoaWRlVHJpZ2dlcigpO1xuICAgICAgICB9XG4gICAgICB9LCBzZWxmW2RlbGF5XSk7XG4gICAgfTtcbiAgICB0aGlzLnRvZ2dsZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCF0b29sdGlwKSB7IHNlbGYuc2hvdygpOyB9IFxuICAgICAgZWxzZSB7IHNlbGYuaGlkZSgpOyB9XG4gICAgfTtcbiAgXG4gICAgLy8gaW5pdFxuICAgIGlmICggIShzdHJpbmdUb29sdGlwIGluIGVsZW1lbnQpICkgeyAvLyBwcmV2ZW50IGFkZGluZyBldmVudCBoYW5kbGVycyB0d2ljZVxuICAgICAgZWxlbWVudFtzZXRBdHRyaWJ1dGVdKGRhdGFPcmlnaW5hbFRpdGxlLHRpdGxlU3RyaW5nKTtcbiAgICAgIGVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKHRpdGxlKTtcbiAgICAgIG9uKGVsZW1lbnQsIG1vdXNlSG92ZXJbMF0sIHNlbGYuc2hvdyk7XG4gICAgICBvbihlbGVtZW50LCBtb3VzZUhvdmVyWzFdLCBzZWxmLmhpZGUpO1xuICAgIH1cbiAgICBlbGVtZW50W3N0cmluZ1Rvb2x0aXBdID0gc2VsZjtcbiAgfTtcbiAgXG4gIC8vIFRPT0xUSVAgREFUQSBBUElcbiAgLy8gPT09PT09PT09PT09PT09PT1cbiAgc3VwcG9ydHNbcHVzaF0oIFsgc3RyaW5nVG9vbHRpcCwgVG9vbHRpcCwgJ1snK2RhdGFUb2dnbGUrJz1cInRvb2x0aXBcIl0nIF0gKTtcbiAgXG4gIFxuICBcbiAgLyogTmF0aXZlIEphdmFzY3JpcHQgZm9yIEJvb3RzdHJhcCAzIHwgSW5pdGlhbGl6ZSBEYXRhIEFQSVxuICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4gIHZhciBpbml0aWFsaXplRGF0YUFQSSA9IGZ1bmN0aW9uKCBjb25zdHJ1Y3RvciwgY29sbGVjdGlvbiApe1xuICAgICAgZm9yICh2YXIgaT0wLCBsPWNvbGxlY3Rpb25bbGVuZ3RoXTsgaTxsOyBpKyspIHtcbiAgICAgICAgbmV3IGNvbnN0cnVjdG9yKGNvbGxlY3Rpb25baV0pO1xuICAgICAgfVxuICAgIH0sXG4gICAgaW5pdENhbGxiYWNrID0gQlNOLmluaXRDYWxsYmFjayA9IGZ1bmN0aW9uKGxvb2tVcCl7XG4gICAgICBsb29rVXAgPSBsb29rVXAgfHwgRE9DO1xuICAgICAgZm9yICh2YXIgaT0wLCBsPXN1cHBvcnRzW2xlbmd0aF07IGk8bDsgaSsrKSB7XG4gICAgICAgIGluaXRpYWxpemVEYXRhQVBJKCBzdXBwb3J0c1tpXVsxXSwgbG9va1VwW3F1ZXJ5U2VsZWN0b3JBbGxdIChzdXBwb3J0c1tpXVsyXSkgKTtcbiAgICAgIH1cbiAgICB9O1xuICBcbiAgLy8gYnVsayBpbml0aWFsaXplIGFsbCBjb21wb25lbnRzXG4gIERPQ1tib2R5XSA/IGluaXRDYWxsYmFjaygpIDogb24oIERPQywgJ0RPTUNvbnRlbnRMb2FkZWQnLCBmdW5jdGlvbigpeyBpbml0Q2FsbGJhY2soKTsgfSApO1xuICBcbiAgcmV0dXJuIHtcbiAgICBBZmZpeDogQWZmaXgsXG4gICAgQWxlcnQ6IEFsZXJ0LFxuICAgIEJ1dHRvbjogQnV0dG9uLFxuICAgIENhcm91c2VsOiBDYXJvdXNlbCxcbiAgICBDb2xsYXBzZTogQ29sbGFwc2UsXG4gICAgRHJvcGRvd246IERyb3Bkb3duLFxuICAgIE1vZGFsOiBNb2RhbCxcbiAgICBQb3BvdmVyOiBQb3BvdmVyLFxuICAgIFNjcm9sbFNweTogU2Nyb2xsU3B5LFxuICAgIFRhYjogVGFiLFxuICAgIFRvb2x0aXA6IFRvb2x0aXBcbiAgfTtcbn0pKTtcbiJdfQ==
