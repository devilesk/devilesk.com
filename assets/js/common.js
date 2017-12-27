require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({42:[function(require,module,exports){
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
},{}],40:[function(require,module,exports){
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
},{}],39:[function(require,module,exports){
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
},{}],12:[function(require,module,exports){
/*!
 * jQuery UI Mouse 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Mouse
//>>group: Widgets
//>>description: Abstracts mouse-based interactions to assist in creating certain widgets.
//>>docs: http://api.jqueryui.com/mouse/

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( [
			"jquery",
			"../ie",
			"../version",
			"../widget"
		], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
}( function( $ ) {

var mouseHandled = false;
$( document ).on( "mouseup", function() {
	mouseHandled = false;
} );

return $.widget( "ui.mouse", {
	version: "1.12.1",
	options: {
		cancel: "input, textarea, button, select, option",
		distance: 1,
		delay: 0
	},
	_mouseInit: function() {
		var that = this;

		this.element
			.on( "mousedown." + this.widgetName, function( event ) {
				return that._mouseDown( event );
			} )
			.on( "click." + this.widgetName, function( event ) {
				if ( true === $.data( event.target, that.widgetName + ".preventClickEvent" ) ) {
					$.removeData( event.target, that.widgetName + ".preventClickEvent" );
					event.stopImmediatePropagation();
					return false;
				}
			} );

		this.started = false;
	},

	// TODO: make sure destroying one instance of mouse doesn't mess with
	// other instances of mouse
	_mouseDestroy: function() {
		this.element.off( "." + this.widgetName );
		if ( this._mouseMoveDelegate ) {
			this.document
				.off( "mousemove." + this.widgetName, this._mouseMoveDelegate )
				.off( "mouseup." + this.widgetName, this._mouseUpDelegate );
		}
	},

	_mouseDown: function( event ) {

		// don't let more than one widget handle mouseStart
		if ( mouseHandled ) {
			return;
		}

		this._mouseMoved = false;

		// We may have missed mouseup (out of window)
		( this._mouseStarted && this._mouseUp( event ) );

		this._mouseDownEvent = event;

		var that = this,
			btnIsLeft = ( event.which === 1 ),

			// event.target.nodeName works around a bug in IE 8 with
			// disabled inputs (#7620)
			elIsCancel = ( typeof this.options.cancel === "string" && event.target.nodeName ?
				$( event.target ).closest( this.options.cancel ).length : false );
		if ( !btnIsLeft || elIsCancel || !this._mouseCapture( event ) ) {
			return true;
		}

		this.mouseDelayMet = !this.options.delay;
		if ( !this.mouseDelayMet ) {
			this._mouseDelayTimer = setTimeout( function() {
				that.mouseDelayMet = true;
			}, this.options.delay );
		}

		if ( this._mouseDistanceMet( event ) && this._mouseDelayMet( event ) ) {
			this._mouseStarted = ( this._mouseStart( event ) !== false );
			if ( !this._mouseStarted ) {
				event.preventDefault();
				return true;
			}
		}

		// Click event may never have fired (Gecko & Opera)
		if ( true === $.data( event.target, this.widgetName + ".preventClickEvent" ) ) {
			$.removeData( event.target, this.widgetName + ".preventClickEvent" );
		}

		// These delegates are required to keep context
		this._mouseMoveDelegate = function( event ) {
			return that._mouseMove( event );
		};
		this._mouseUpDelegate = function( event ) {
			return that._mouseUp( event );
		};

		this.document
			.on( "mousemove." + this.widgetName, this._mouseMoveDelegate )
			.on( "mouseup." + this.widgetName, this._mouseUpDelegate );

		event.preventDefault();

		mouseHandled = true;
		return true;
	},

	_mouseMove: function( event ) {

		// Only check for mouseups outside the document if you've moved inside the document
		// at least once. This prevents the firing of mouseup in the case of IE<9, which will
		// fire a mousemove event if content is placed under the cursor. See #7778
		// Support: IE <9
		if ( this._mouseMoved ) {

			// IE mouseup check - mouseup happened when mouse was out of window
			if ( $.ui.ie && ( !document.documentMode || document.documentMode < 9 ) &&
					!event.button ) {
				return this._mouseUp( event );

			// Iframe mouseup check - mouseup occurred in another document
			} else if ( !event.which ) {

				// Support: Safari <=8 - 9
				// Safari sets which to 0 if you press any of the following keys
				// during a drag (#14461)
				if ( event.originalEvent.altKey || event.originalEvent.ctrlKey ||
						event.originalEvent.metaKey || event.originalEvent.shiftKey ) {
					this.ignoreMissingWhich = true;
				} else if ( !this.ignoreMissingWhich ) {
					return this._mouseUp( event );
				}
			}
		}

		if ( event.which || event.button ) {
			this._mouseMoved = true;
		}

		if ( this._mouseStarted ) {
			this._mouseDrag( event );
			return event.preventDefault();
		}

		if ( this._mouseDistanceMet( event ) && this._mouseDelayMet( event ) ) {
			this._mouseStarted =
				( this._mouseStart( this._mouseDownEvent, event ) !== false );
			( this._mouseStarted ? this._mouseDrag( event ) : this._mouseUp( event ) );
		}

		return !this._mouseStarted;
	},

	_mouseUp: function( event ) {
		this.document
			.off( "mousemove." + this.widgetName, this._mouseMoveDelegate )
			.off( "mouseup." + this.widgetName, this._mouseUpDelegate );

		if ( this._mouseStarted ) {
			this._mouseStarted = false;

			if ( event.target === this._mouseDownEvent.target ) {
				$.data( event.target, this.widgetName + ".preventClickEvent", true );
			}

			this._mouseStop( event );
		}

		if ( this._mouseDelayTimer ) {
			clearTimeout( this._mouseDelayTimer );
			delete this._mouseDelayTimer;
		}

		this.ignoreMissingWhich = false;
		mouseHandled = false;
		event.preventDefault();
	},

	_mouseDistanceMet: function( event ) {
		return ( Math.max(
				Math.abs( this._mouseDownEvent.pageX - event.pageX ),
				Math.abs( this._mouseDownEvent.pageY - event.pageY )
			) >= this.options.distance
		);
	},

	_mouseDelayMet: function( /* event */ ) {
		return this.mouseDelayMet;
	},

	// These are placeholder methods, to be overriden by extending plugin
	_mouseStart: function( /* event */ ) {},
	_mouseDrag: function( /* event */ ) {},
	_mouseStop: function( /* event */ ) {},
	_mouseCapture: function( /* event */ ) { return true; }
} );

} ) );

},{}],10:[function(require,module,exports){
/*!
 * jQuery UI Draggable 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Draggable
//>>group: Interactions
//>>description: Enables dragging functionality for any element.
//>>docs: http://api.jqueryui.com/draggable/
//>>demos: http://jqueryui.com/draggable/
//>>css.structure: ../../themes/base/draggable.css

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( [
			"jquery",
			"./mouse",
			"../data",
			"../plugin",
			"../safe-active-element",
			"../safe-blur",
			"../scroll-parent",
			"../version",
			"../widget"
		], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
}( function( $ ) {

$.widget( "ui.draggable", $.ui.mouse, {
	version: "1.12.1",
	widgetEventPrefix: "drag",
	options: {
		addClasses: true,
		appendTo: "parent",
		axis: false,
		connectToSortable: false,
		containment: false,
		cursor: "auto",
		cursorAt: false,
		grid: false,
		handle: false,
		helper: "original",
		iframeFix: false,
		opacity: false,
		refreshPositions: false,
		revert: false,
		revertDuration: 500,
		scope: "default",
		scroll: true,
		scrollSensitivity: 20,
		scrollSpeed: 20,
		snap: false,
		snapMode: "both",
		snapTolerance: 20,
		stack: false,
		zIndex: false,

		// Callbacks
		drag: null,
		start: null,
		stop: null
	},
	_create: function() {

		if ( this.options.helper === "original" ) {
			this._setPositionRelative();
		}
		if ( this.options.addClasses ) {
			this._addClass( "ui-draggable" );
		}
		this._setHandleClassName();

		this._mouseInit();
	},

	_setOption: function( key, value ) {
		this._super( key, value );
		if ( key === "handle" ) {
			this._removeHandleClassName();
			this._setHandleClassName();
		}
	},

	_destroy: function() {
		if ( ( this.helper || this.element ).is( ".ui-draggable-dragging" ) ) {
			this.destroyOnClear = true;
			return;
		}
		this._removeHandleClassName();
		this._mouseDestroy();
	},

	_mouseCapture: function( event ) {
		var o = this.options;

		// Among others, prevent a drag on a resizable-handle
		if ( this.helper || o.disabled ||
				$( event.target ).closest( ".ui-resizable-handle" ).length > 0 ) {
			return false;
		}

		//Quit if we're not on a valid handle
		this.handle = this._getHandle( event );
		if ( !this.handle ) {
			return false;
		}

		this._blurActiveElement( event );

		this._blockFrames( o.iframeFix === true ? "iframe" : o.iframeFix );

		return true;

	},

	_blockFrames: function( selector ) {
		this.iframeBlocks = this.document.find( selector ).map( function() {
			var iframe = $( this );

			return $( "<div>" )
				.css( "position", "absolute" )
				.appendTo( iframe.parent() )
				.outerWidth( iframe.outerWidth() )
				.outerHeight( iframe.outerHeight() )
				.offset( iframe.offset() )[ 0 ];
		} );
	},

	_unblockFrames: function() {
		if ( this.iframeBlocks ) {
			this.iframeBlocks.remove();
			delete this.iframeBlocks;
		}
	},

	_blurActiveElement: function( event ) {
		var activeElement = $.ui.safeActiveElement( this.document[ 0 ] ),
			target = $( event.target );

		// Don't blur if the event occurred on an element that is within
		// the currently focused element
		// See #10527, #12472
		if ( target.closest( activeElement ).length ) {
			return;
		}

		// Blur any element that currently has focus, see #4261
		$.ui.safeBlur( activeElement );
	},

	_mouseStart: function( event ) {

		var o = this.options;

		//Create and append the visible helper
		this.helper = this._createHelper( event );

		this._addClass( this.helper, "ui-draggable-dragging" );

		//Cache the helper size
		this._cacheHelperProportions();

		//If ddmanager is used for droppables, set the global draggable
		if ( $.ui.ddmanager ) {
			$.ui.ddmanager.current = this;
		}

		/*
		 * - Position generation -
		 * This block generates everything position related - it's the core of draggables.
		 */

		//Cache the margins of the original element
		this._cacheMargins();

		//Store the helper's css position
		this.cssPosition = this.helper.css( "position" );
		this.scrollParent = this.helper.scrollParent( true );
		this.offsetParent = this.helper.offsetParent();
		this.hasFixedAncestor = this.helper.parents().filter( function() {
				return $( this ).css( "position" ) === "fixed";
			} ).length > 0;

		//The element's absolute position on the page minus margins
		this.positionAbs = this.element.offset();
		this._refreshOffsets( event );

		//Generate the original position
		this.originalPosition = this.position = this._generatePosition( event, false );
		this.originalPageX = event.pageX;
		this.originalPageY = event.pageY;

		//Adjust the mouse offset relative to the helper if "cursorAt" is supplied
		( o.cursorAt && this._adjustOffsetFromHelper( o.cursorAt ) );

		//Set a containment if given in the options
		this._setContainment();

		//Trigger event + callbacks
		if ( this._trigger( "start", event ) === false ) {
			this._clear();
			return false;
		}

		//Recache the helper size
		this._cacheHelperProportions();

		//Prepare the droppable offsets
		if ( $.ui.ddmanager && !o.dropBehaviour ) {
			$.ui.ddmanager.prepareOffsets( this, event );
		}

		// Execute the drag once - this causes the helper not to be visible before getting its
		// correct position
		this._mouseDrag( event, true );

		// If the ddmanager is used for droppables, inform the manager that dragging has started
		// (see #5003)
		if ( $.ui.ddmanager ) {
			$.ui.ddmanager.dragStart( this, event );
		}

		return true;
	},

	_refreshOffsets: function( event ) {
		this.offset = {
			top: this.positionAbs.top - this.margins.top,
			left: this.positionAbs.left - this.margins.left,
			scroll: false,
			parent: this._getParentOffset(),
			relative: this._getRelativeOffset()
		};

		this.offset.click = {
			left: event.pageX - this.offset.left,
			top: event.pageY - this.offset.top
		};
	},

	_mouseDrag: function( event, noPropagation ) {

		// reset any necessary cached properties (see #5009)
		if ( this.hasFixedAncestor ) {
			this.offset.parent = this._getParentOffset();
		}

		//Compute the helpers position
		this.position = this._generatePosition( event, true );
		this.positionAbs = this._convertPositionTo( "absolute" );

		//Call plugins and callbacks and use the resulting position if something is returned
		if ( !noPropagation ) {
			var ui = this._uiHash();
			if ( this._trigger( "drag", event, ui ) === false ) {
				this._mouseUp( new $.Event( "mouseup", event ) );
				return false;
			}
			this.position = ui.position;
		}

		this.helper[ 0 ].style.left = this.position.left + "px";
		this.helper[ 0 ].style.top = this.position.top + "px";

		if ( $.ui.ddmanager ) {
			$.ui.ddmanager.drag( this, event );
		}

		return false;
	},

	_mouseStop: function( event ) {

		//If we are using droppables, inform the manager about the drop
		var that = this,
			dropped = false;
		if ( $.ui.ddmanager && !this.options.dropBehaviour ) {
			dropped = $.ui.ddmanager.drop( this, event );
		}

		//if a drop comes from outside (a sortable)
		if ( this.dropped ) {
			dropped = this.dropped;
			this.dropped = false;
		}

		if ( ( this.options.revert === "invalid" && !dropped ) ||
				( this.options.revert === "valid" && dropped ) ||
				this.options.revert === true || ( $.isFunction( this.options.revert ) &&
				this.options.revert.call( this.element, dropped ) )
		) {
			$( this.helper ).animate(
				this.originalPosition,
				parseInt( this.options.revertDuration, 10 ),
				function() {
					if ( that._trigger( "stop", event ) !== false ) {
						that._clear();
					}
				}
			);
		} else {
			if ( this._trigger( "stop", event ) !== false ) {
				this._clear();
			}
		}

		return false;
	},

	_mouseUp: function( event ) {
		this._unblockFrames();

		// If the ddmanager is used for droppables, inform the manager that dragging has stopped
		// (see #5003)
		if ( $.ui.ddmanager ) {
			$.ui.ddmanager.dragStop( this, event );
		}

		// Only need to focus if the event occurred on the draggable itself, see #10527
		if ( this.handleElement.is( event.target ) ) {

			// The interaction is over; whether or not the click resulted in a drag,
			// focus the element
			this.element.trigger( "focus" );
		}

		return $.ui.mouse.prototype._mouseUp.call( this, event );
	},

	cancel: function() {

		if ( this.helper.is( ".ui-draggable-dragging" ) ) {
			this._mouseUp( new $.Event( "mouseup", { target: this.element[ 0 ] } ) );
		} else {
			this._clear();
		}

		return this;

	},

	_getHandle: function( event ) {
		return this.options.handle ?
			!!$( event.target ).closest( this.element.find( this.options.handle ) ).length :
			true;
	},

	_setHandleClassName: function() {
		this.handleElement = this.options.handle ?
			this.element.find( this.options.handle ) : this.element;
		this._addClass( this.handleElement, "ui-draggable-handle" );
	},

	_removeHandleClassName: function() {
		this._removeClass( this.handleElement, "ui-draggable-handle" );
	},

	_createHelper: function( event ) {

		var o = this.options,
			helperIsFunction = $.isFunction( o.helper ),
			helper = helperIsFunction ?
				$( o.helper.apply( this.element[ 0 ], [ event ] ) ) :
				( o.helper === "clone" ?
					this.element.clone().removeAttr( "id" ) :
					this.element );

		if ( !helper.parents( "body" ).length ) {
			helper.appendTo( ( o.appendTo === "parent" ?
				this.element[ 0 ].parentNode :
				o.appendTo ) );
		}

		// Http://bugs.jqueryui.com/ticket/9446
		// a helper function can return the original element
		// which wouldn't have been set to relative in _create
		if ( helperIsFunction && helper[ 0 ] === this.element[ 0 ] ) {
			this._setPositionRelative();
		}

		if ( helper[ 0 ] !== this.element[ 0 ] &&
				!( /(fixed|absolute)/ ).test( helper.css( "position" ) ) ) {
			helper.css( "position", "absolute" );
		}

		return helper;

	},

	_setPositionRelative: function() {
		if ( !( /^(?:r|a|f)/ ).test( this.element.css( "position" ) ) ) {
			this.element[ 0 ].style.position = "relative";
		}
	},

	_adjustOffsetFromHelper: function( obj ) {
		if ( typeof obj === "string" ) {
			obj = obj.split( " " );
		}
		if ( $.isArray( obj ) ) {
			obj = { left: +obj[ 0 ], top: +obj[ 1 ] || 0 };
		}
		if ( "left" in obj ) {
			this.offset.click.left = obj.left + this.margins.left;
		}
		if ( "right" in obj ) {
			this.offset.click.left = this.helperProportions.width - obj.right + this.margins.left;
		}
		if ( "top" in obj ) {
			this.offset.click.top = obj.top + this.margins.top;
		}
		if ( "bottom" in obj ) {
			this.offset.click.top = this.helperProportions.height - obj.bottom + this.margins.top;
		}
	},

	_isRootNode: function( element ) {
		return ( /(html|body)/i ).test( element.tagName ) || element === this.document[ 0 ];
	},

	_getParentOffset: function() {

		//Get the offsetParent and cache its position
		var po = this.offsetParent.offset(),
			document = this.document[ 0 ];

		// This is a special case where we need to modify a offset calculated on start, since the
		// following happened:
		// 1. The position of the helper is absolute, so it's position is calculated based on the
		// next positioned parent
		// 2. The actual offset parent is a child of the scroll parent, and the scroll parent isn't
		// the document, which means that the scroll is included in the initial calculation of the
		// offset of the parent, and never recalculated upon drag
		if ( this.cssPosition === "absolute" && this.scrollParent[ 0 ] !== document &&
				$.contains( this.scrollParent[ 0 ], this.offsetParent[ 0 ] ) ) {
			po.left += this.scrollParent.scrollLeft();
			po.top += this.scrollParent.scrollTop();
		}

		if ( this._isRootNode( this.offsetParent[ 0 ] ) ) {
			po = { top: 0, left: 0 };
		}

		return {
			top: po.top + ( parseInt( this.offsetParent.css( "borderTopWidth" ), 10 ) || 0 ),
			left: po.left + ( parseInt( this.offsetParent.css( "borderLeftWidth" ), 10 ) || 0 )
		};

	},

	_getRelativeOffset: function() {
		if ( this.cssPosition !== "relative" ) {
			return { top: 0, left: 0 };
		}

		var p = this.element.position(),
			scrollIsRootNode = this._isRootNode( this.scrollParent[ 0 ] );

		return {
			top: p.top - ( parseInt( this.helper.css( "top" ), 10 ) || 0 ) +
				( !scrollIsRootNode ? this.scrollParent.scrollTop() : 0 ),
			left: p.left - ( parseInt( this.helper.css( "left" ), 10 ) || 0 ) +
				( !scrollIsRootNode ? this.scrollParent.scrollLeft() : 0 )
		};

	},

	_cacheMargins: function() {
		this.margins = {
			left: ( parseInt( this.element.css( "marginLeft" ), 10 ) || 0 ),
			top: ( parseInt( this.element.css( "marginTop" ), 10 ) || 0 ),
			right: ( parseInt( this.element.css( "marginRight" ), 10 ) || 0 ),
			bottom: ( parseInt( this.element.css( "marginBottom" ), 10 ) || 0 )
		};
	},

	_cacheHelperProportions: function() {
		this.helperProportions = {
			width: this.helper.outerWidth(),
			height: this.helper.outerHeight()
		};
	},

	_setContainment: function() {

		var isUserScrollable, c, ce,
			o = this.options,
			document = this.document[ 0 ];

		this.relativeContainer = null;

		if ( !o.containment ) {
			this.containment = null;
			return;
		}

		if ( o.containment === "window" ) {
			this.containment = [
				$( window ).scrollLeft() - this.offset.relative.left - this.offset.parent.left,
				$( window ).scrollTop() - this.offset.relative.top - this.offset.parent.top,
				$( window ).scrollLeft() + $( window ).width() -
					this.helperProportions.width - this.margins.left,
				$( window ).scrollTop() +
					( $( window ).height() || document.body.parentNode.scrollHeight ) -
					this.helperProportions.height - this.margins.top
			];
			return;
		}

		if ( o.containment === "document" ) {
			this.containment = [
				0,
				0,
				$( document ).width() - this.helperProportions.width - this.margins.left,
				( $( document ).height() || document.body.parentNode.scrollHeight ) -
					this.helperProportions.height - this.margins.top
			];
			return;
		}

		if ( o.containment.constructor === Array ) {
			this.containment = o.containment;
			return;
		}

		if ( o.containment === "parent" ) {
			o.containment = this.helper[ 0 ].parentNode;
		}

		c = $( o.containment );
		ce = c[ 0 ];

		if ( !ce ) {
			return;
		}

		isUserScrollable = /(scroll|auto)/.test( c.css( "overflow" ) );

		this.containment = [
			( parseInt( c.css( "borderLeftWidth" ), 10 ) || 0 ) +
				( parseInt( c.css( "paddingLeft" ), 10 ) || 0 ),
			( parseInt( c.css( "borderTopWidth" ), 10 ) || 0 ) +
				( parseInt( c.css( "paddingTop" ), 10 ) || 0 ),
			( isUserScrollable ? Math.max( ce.scrollWidth, ce.offsetWidth ) : ce.offsetWidth ) -
				( parseInt( c.css( "borderRightWidth" ), 10 ) || 0 ) -
				( parseInt( c.css( "paddingRight" ), 10 ) || 0 ) -
				this.helperProportions.width -
				this.margins.left -
				this.margins.right,
			( isUserScrollable ? Math.max( ce.scrollHeight, ce.offsetHeight ) : ce.offsetHeight ) -
				( parseInt( c.css( "borderBottomWidth" ), 10 ) || 0 ) -
				( parseInt( c.css( "paddingBottom" ), 10 ) || 0 ) -
				this.helperProportions.height -
				this.margins.top -
				this.margins.bottom
		];
		this.relativeContainer = c;
	},

	_convertPositionTo: function( d, pos ) {

		if ( !pos ) {
			pos = this.position;
		}

		var mod = d === "absolute" ? 1 : -1,
			scrollIsRootNode = this._isRootNode( this.scrollParent[ 0 ] );

		return {
			top: (

				// The absolute mouse position
				pos.top	+

				// Only for relative positioned nodes: Relative offset from element to offset parent
				this.offset.relative.top * mod +

				// The offsetParent's offset without borders (offset + border)
				this.offset.parent.top * mod -
				( ( this.cssPosition === "fixed" ?
					-this.offset.scroll.top :
					( scrollIsRootNode ? 0 : this.offset.scroll.top ) ) * mod )
			),
			left: (

				// The absolute mouse position
				pos.left +

				// Only for relative positioned nodes: Relative offset from element to offset parent
				this.offset.relative.left * mod +

				// The offsetParent's offset without borders (offset + border)
				this.offset.parent.left * mod	-
				( ( this.cssPosition === "fixed" ?
					-this.offset.scroll.left :
					( scrollIsRootNode ? 0 : this.offset.scroll.left ) ) * mod )
			)
		};

	},

	_generatePosition: function( event, constrainPosition ) {

		var containment, co, top, left,
			o = this.options,
			scrollIsRootNode = this._isRootNode( this.scrollParent[ 0 ] ),
			pageX = event.pageX,
			pageY = event.pageY;

		// Cache the scroll
		if ( !scrollIsRootNode || !this.offset.scroll ) {
			this.offset.scroll = {
				top: this.scrollParent.scrollTop(),
				left: this.scrollParent.scrollLeft()
			};
		}

		/*
		 * - Position constraining -
		 * Constrain the position to a mix of grid, containment.
		 */

		// If we are not dragging yet, we won't check for options
		if ( constrainPosition ) {
			if ( this.containment ) {
				if ( this.relativeContainer ) {
					co = this.relativeContainer.offset();
					containment = [
						this.containment[ 0 ] + co.left,
						this.containment[ 1 ] + co.top,
						this.containment[ 2 ] + co.left,
						this.containment[ 3 ] + co.top
					];
				} else {
					containment = this.containment;
				}

				if ( event.pageX - this.offset.click.left < containment[ 0 ] ) {
					pageX = containment[ 0 ] + this.offset.click.left;
				}
				if ( event.pageY - this.offset.click.top < containment[ 1 ] ) {
					pageY = containment[ 1 ] + this.offset.click.top;
				}
				if ( event.pageX - this.offset.click.left > containment[ 2 ] ) {
					pageX = containment[ 2 ] + this.offset.click.left;
				}
				if ( event.pageY - this.offset.click.top > containment[ 3 ] ) {
					pageY = containment[ 3 ] + this.offset.click.top;
				}
			}

			if ( o.grid ) {

				//Check for grid elements set to 0 to prevent divide by 0 error causing invalid
				// argument errors in IE (see ticket #6950)
				top = o.grid[ 1 ] ? this.originalPageY + Math.round( ( pageY -
					this.originalPageY ) / o.grid[ 1 ] ) * o.grid[ 1 ] : this.originalPageY;
				pageY = containment ? ( ( top - this.offset.click.top >= containment[ 1 ] ||
					top - this.offset.click.top > containment[ 3 ] ) ?
						top :
						( ( top - this.offset.click.top >= containment[ 1 ] ) ?
							top - o.grid[ 1 ] : top + o.grid[ 1 ] ) ) : top;

				left = o.grid[ 0 ] ? this.originalPageX +
					Math.round( ( pageX - this.originalPageX ) / o.grid[ 0 ] ) * o.grid[ 0 ] :
					this.originalPageX;
				pageX = containment ? ( ( left - this.offset.click.left >= containment[ 0 ] ||
					left - this.offset.click.left > containment[ 2 ] ) ?
						left :
						( ( left - this.offset.click.left >= containment[ 0 ] ) ?
							left - o.grid[ 0 ] : left + o.grid[ 0 ] ) ) : left;
			}

			if ( o.axis === "y" ) {
				pageX = this.originalPageX;
			}

			if ( o.axis === "x" ) {
				pageY = this.originalPageY;
			}
		}

		return {
			top: (

				// The absolute mouse position
				pageY -

				// Click offset (relative to the element)
				this.offset.click.top -

				// Only for relative positioned nodes: Relative offset from element to offset parent
				this.offset.relative.top -

				// The offsetParent's offset without borders (offset + border)
				this.offset.parent.top +
				( this.cssPosition === "fixed" ?
					-this.offset.scroll.top :
					( scrollIsRootNode ? 0 : this.offset.scroll.top ) )
			),
			left: (

				// The absolute mouse position
				pageX -

				// Click offset (relative to the element)
				this.offset.click.left -

				// Only for relative positioned nodes: Relative offset from element to offset parent
				this.offset.relative.left -

				// The offsetParent's offset without borders (offset + border)
				this.offset.parent.left +
				( this.cssPosition === "fixed" ?
					-this.offset.scroll.left :
					( scrollIsRootNode ? 0 : this.offset.scroll.left ) )
			)
		};

	},

	_clear: function() {
		this._removeClass( this.helper, "ui-draggable-dragging" );
		if ( this.helper[ 0 ] !== this.element[ 0 ] && !this.cancelHelperRemoval ) {
			this.helper.remove();
		}
		this.helper = null;
		this.cancelHelperRemoval = false;
		if ( this.destroyOnClear ) {
			this.destroy();
		}
	},

	// From now on bulk stuff - mainly helpers

	_trigger: function( type, event, ui ) {
		ui = ui || this._uiHash();
		$.ui.plugin.call( this, type, [ event, ui, this ], true );

		// Absolute position and offset (see #6884 ) have to be recalculated after plugins
		if ( /^(drag|start|stop)/.test( type ) ) {
			this.positionAbs = this._convertPositionTo( "absolute" );
			ui.offset = this.positionAbs;
		}
		return $.Widget.prototype._trigger.call( this, type, event, ui );
	},

	plugins: {},

	_uiHash: function() {
		return {
			helper: this.helper,
			position: this.position,
			originalPosition: this.originalPosition,
			offset: this.positionAbs
		};
	}

} );

$.ui.plugin.add( "draggable", "connectToSortable", {
	start: function( event, ui, draggable ) {
		var uiSortable = $.extend( {}, ui, {
			item: draggable.element
		} );

		draggable.sortables = [];
		$( draggable.options.connectToSortable ).each( function() {
			var sortable = $( this ).sortable( "instance" );

			if ( sortable && !sortable.options.disabled ) {
				draggable.sortables.push( sortable );

				// RefreshPositions is called at drag start to refresh the containerCache
				// which is used in drag. This ensures it's initialized and synchronized
				// with any changes that might have happened on the page since initialization.
				sortable.refreshPositions();
				sortable._trigger( "activate", event, uiSortable );
			}
		} );
	},
	stop: function( event, ui, draggable ) {
		var uiSortable = $.extend( {}, ui, {
			item: draggable.element
		} );

		draggable.cancelHelperRemoval = false;

		$.each( draggable.sortables, function() {
			var sortable = this;

			if ( sortable.isOver ) {
				sortable.isOver = 0;

				// Allow this sortable to handle removing the helper
				draggable.cancelHelperRemoval = true;
				sortable.cancelHelperRemoval = false;

				// Use _storedCSS To restore properties in the sortable,
				// as this also handles revert (#9675) since the draggable
				// may have modified them in unexpected ways (#8809)
				sortable._storedCSS = {
					position: sortable.placeholder.css( "position" ),
					top: sortable.placeholder.css( "top" ),
					left: sortable.placeholder.css( "left" )
				};

				sortable._mouseStop( event );

				// Once drag has ended, the sortable should return to using
				// its original helper, not the shared helper from draggable
				sortable.options.helper = sortable.options._helper;
			} else {

				// Prevent this Sortable from removing the helper.
				// However, don't set the draggable to remove the helper
				// either as another connected Sortable may yet handle the removal.
				sortable.cancelHelperRemoval = true;

				sortable._trigger( "deactivate", event, uiSortable );
			}
		} );
	},
	drag: function( event, ui, draggable ) {
		$.each( draggable.sortables, function() {
			var innermostIntersecting = false,
				sortable = this;

			// Copy over variables that sortable's _intersectsWith uses
			sortable.positionAbs = draggable.positionAbs;
			sortable.helperProportions = draggable.helperProportions;
			sortable.offset.click = draggable.offset.click;

			if ( sortable._intersectsWith( sortable.containerCache ) ) {
				innermostIntersecting = true;

				$.each( draggable.sortables, function() {

					// Copy over variables that sortable's _intersectsWith uses
					this.positionAbs = draggable.positionAbs;
					this.helperProportions = draggable.helperProportions;
					this.offset.click = draggable.offset.click;

					if ( this !== sortable &&
							this._intersectsWith( this.containerCache ) &&
							$.contains( sortable.element[ 0 ], this.element[ 0 ] ) ) {
						innermostIntersecting = false;
					}

					return innermostIntersecting;
				} );
			}

			if ( innermostIntersecting ) {

				// If it intersects, we use a little isOver variable and set it once,
				// so that the move-in stuff gets fired only once.
				if ( !sortable.isOver ) {
					sortable.isOver = 1;

					// Store draggable's parent in case we need to reappend to it later.
					draggable._parent = ui.helper.parent();

					sortable.currentItem = ui.helper
						.appendTo( sortable.element )
						.data( "ui-sortable-item", true );

					// Store helper option to later restore it
					sortable.options._helper = sortable.options.helper;

					sortable.options.helper = function() {
						return ui.helper[ 0 ];
					};

					// Fire the start events of the sortable with our passed browser event,
					// and our own helper (so it doesn't create a new one)
					event.target = sortable.currentItem[ 0 ];
					sortable._mouseCapture( event, true );
					sortable._mouseStart( event, true, true );

					// Because the browser event is way off the new appended portlet,
					// modify necessary variables to reflect the changes
					sortable.offset.click.top = draggable.offset.click.top;
					sortable.offset.click.left = draggable.offset.click.left;
					sortable.offset.parent.left -= draggable.offset.parent.left -
						sortable.offset.parent.left;
					sortable.offset.parent.top -= draggable.offset.parent.top -
						sortable.offset.parent.top;

					draggable._trigger( "toSortable", event );

					// Inform draggable that the helper is in a valid drop zone,
					// used solely in the revert option to handle "valid/invalid".
					draggable.dropped = sortable.element;

					// Need to refreshPositions of all sortables in the case that
					// adding to one sortable changes the location of the other sortables (#9675)
					$.each( draggable.sortables, function() {
						this.refreshPositions();
					} );

					// Hack so receive/update callbacks work (mostly)
					draggable.currentItem = draggable.element;
					sortable.fromOutside = draggable;
				}

				if ( sortable.currentItem ) {
					sortable._mouseDrag( event );

					// Copy the sortable's position because the draggable's can potentially reflect
					// a relative position, while sortable is always absolute, which the dragged
					// element has now become. (#8809)
					ui.position = sortable.position;
				}
			} else {

				// If it doesn't intersect with the sortable, and it intersected before,
				// we fake the drag stop of the sortable, but make sure it doesn't remove
				// the helper by using cancelHelperRemoval.
				if ( sortable.isOver ) {

					sortable.isOver = 0;
					sortable.cancelHelperRemoval = true;

					// Calling sortable's mouseStop would trigger a revert,
					// so revert must be temporarily false until after mouseStop is called.
					sortable.options._revert = sortable.options.revert;
					sortable.options.revert = false;

					sortable._trigger( "out", event, sortable._uiHash( sortable ) );
					sortable._mouseStop( event, true );

					// Restore sortable behaviors that were modfied
					// when the draggable entered the sortable area (#9481)
					sortable.options.revert = sortable.options._revert;
					sortable.options.helper = sortable.options._helper;

					if ( sortable.placeholder ) {
						sortable.placeholder.remove();
					}

					// Restore and recalculate the draggable's offset considering the sortable
					// may have modified them in unexpected ways. (#8809, #10669)
					ui.helper.appendTo( draggable._parent );
					draggable._refreshOffsets( event );
					ui.position = draggable._generatePosition( event, true );

					draggable._trigger( "fromSortable", event );

					// Inform draggable that the helper is no longer in a valid drop zone
					draggable.dropped = false;

					// Need to refreshPositions of all sortables just in case removing
					// from one sortable changes the location of other sortables (#9675)
					$.each( draggable.sortables, function() {
						this.refreshPositions();
					} );
				}
			}
		} );
	}
} );

$.ui.plugin.add( "draggable", "cursor", {
	start: function( event, ui, instance ) {
		var t = $( "body" ),
			o = instance.options;

		if ( t.css( "cursor" ) ) {
			o._cursor = t.css( "cursor" );
		}
		t.css( "cursor", o.cursor );
	},
	stop: function( event, ui, instance ) {
		var o = instance.options;
		if ( o._cursor ) {
			$( "body" ).css( "cursor", o._cursor );
		}
	}
} );

$.ui.plugin.add( "draggable", "opacity", {
	start: function( event, ui, instance ) {
		var t = $( ui.helper ),
			o = instance.options;
		if ( t.css( "opacity" ) ) {
			o._opacity = t.css( "opacity" );
		}
		t.css( "opacity", o.opacity );
	},
	stop: function( event, ui, instance ) {
		var o = instance.options;
		if ( o._opacity ) {
			$( ui.helper ).css( "opacity", o._opacity );
		}
	}
} );

$.ui.plugin.add( "draggable", "scroll", {
	start: function( event, ui, i ) {
		if ( !i.scrollParentNotHidden ) {
			i.scrollParentNotHidden = i.helper.scrollParent( false );
		}

		if ( i.scrollParentNotHidden[ 0 ] !== i.document[ 0 ] &&
				i.scrollParentNotHidden[ 0 ].tagName !== "HTML" ) {
			i.overflowOffset = i.scrollParentNotHidden.offset();
		}
	},
	drag: function( event, ui, i  ) {

		var o = i.options,
			scrolled = false,
			scrollParent = i.scrollParentNotHidden[ 0 ],
			document = i.document[ 0 ];

		if ( scrollParent !== document && scrollParent.tagName !== "HTML" ) {
			if ( !o.axis || o.axis !== "x" ) {
				if ( ( i.overflowOffset.top + scrollParent.offsetHeight ) - event.pageY <
						o.scrollSensitivity ) {
					scrollParent.scrollTop = scrolled = scrollParent.scrollTop + o.scrollSpeed;
				} else if ( event.pageY - i.overflowOffset.top < o.scrollSensitivity ) {
					scrollParent.scrollTop = scrolled = scrollParent.scrollTop - o.scrollSpeed;
				}
			}

			if ( !o.axis || o.axis !== "y" ) {
				if ( ( i.overflowOffset.left + scrollParent.offsetWidth ) - event.pageX <
						o.scrollSensitivity ) {
					scrollParent.scrollLeft = scrolled = scrollParent.scrollLeft + o.scrollSpeed;
				} else if ( event.pageX - i.overflowOffset.left < o.scrollSensitivity ) {
					scrollParent.scrollLeft = scrolled = scrollParent.scrollLeft - o.scrollSpeed;
				}
			}

		} else {

			if ( !o.axis || o.axis !== "x" ) {
				if ( event.pageY - $( document ).scrollTop() < o.scrollSensitivity ) {
					scrolled = $( document ).scrollTop( $( document ).scrollTop() - o.scrollSpeed );
				} else if ( $( window ).height() - ( event.pageY - $( document ).scrollTop() ) <
						o.scrollSensitivity ) {
					scrolled = $( document ).scrollTop( $( document ).scrollTop() + o.scrollSpeed );
				}
			}

			if ( !o.axis || o.axis !== "y" ) {
				if ( event.pageX - $( document ).scrollLeft() < o.scrollSensitivity ) {
					scrolled = $( document ).scrollLeft(
						$( document ).scrollLeft() - o.scrollSpeed
					);
				} else if ( $( window ).width() - ( event.pageX - $( document ).scrollLeft() ) <
						o.scrollSensitivity ) {
					scrolled = $( document ).scrollLeft(
						$( document ).scrollLeft() + o.scrollSpeed
					);
				}
			}

		}

		if ( scrolled !== false && $.ui.ddmanager && !o.dropBehaviour ) {
			$.ui.ddmanager.prepareOffsets( i, event );
		}

	}
} );

$.ui.plugin.add( "draggable", "snap", {
	start: function( event, ui, i ) {

		var o = i.options;

		i.snapElements = [];

		$( o.snap.constructor !== String ? ( o.snap.items || ":data(ui-draggable)" ) : o.snap )
			.each( function() {
				var $t = $( this ),
					$o = $t.offset();
				if ( this !== i.element[ 0 ] ) {
					i.snapElements.push( {
						item: this,
						width: $t.outerWidth(), height: $t.outerHeight(),
						top: $o.top, left: $o.left
					} );
				}
			} );

	},
	drag: function( event, ui, inst ) {

		var ts, bs, ls, rs, l, r, t, b, i, first,
			o = inst.options,
			d = o.snapTolerance,
			x1 = ui.offset.left, x2 = x1 + inst.helperProportions.width,
			y1 = ui.offset.top, y2 = y1 + inst.helperProportions.height;

		for ( i = inst.snapElements.length - 1; i >= 0; i-- ) {

			l = inst.snapElements[ i ].left - inst.margins.left;
			r = l + inst.snapElements[ i ].width;
			t = inst.snapElements[ i ].top - inst.margins.top;
			b = t + inst.snapElements[ i ].height;

			if ( x2 < l - d || x1 > r + d || y2 < t - d || y1 > b + d ||
					!$.contains( inst.snapElements[ i ].item.ownerDocument,
					inst.snapElements[ i ].item ) ) {
				if ( inst.snapElements[ i ].snapping ) {
					( inst.options.snap.release &&
						inst.options.snap.release.call(
							inst.element,
							event,
							$.extend( inst._uiHash(), { snapItem: inst.snapElements[ i ].item } )
						) );
				}
				inst.snapElements[ i ].snapping = false;
				continue;
			}

			if ( o.snapMode !== "inner" ) {
				ts = Math.abs( t - y2 ) <= d;
				bs = Math.abs( b - y1 ) <= d;
				ls = Math.abs( l - x2 ) <= d;
				rs = Math.abs( r - x1 ) <= d;
				if ( ts ) {
					ui.position.top = inst._convertPositionTo( "relative", {
						top: t - inst.helperProportions.height,
						left: 0
					} ).top;
				}
				if ( bs ) {
					ui.position.top = inst._convertPositionTo( "relative", {
						top: b,
						left: 0
					} ).top;
				}
				if ( ls ) {
					ui.position.left = inst._convertPositionTo( "relative", {
						top: 0,
						left: l - inst.helperProportions.width
					} ).left;
				}
				if ( rs ) {
					ui.position.left = inst._convertPositionTo( "relative", {
						top: 0,
						left: r
					} ).left;
				}
			}

			first = ( ts || bs || ls || rs );

			if ( o.snapMode !== "outer" ) {
				ts = Math.abs( t - y1 ) <= d;
				bs = Math.abs( b - y2 ) <= d;
				ls = Math.abs( l - x1 ) <= d;
				rs = Math.abs( r - x2 ) <= d;
				if ( ts ) {
					ui.position.top = inst._convertPositionTo( "relative", {
						top: t,
						left: 0
					} ).top;
				}
				if ( bs ) {
					ui.position.top = inst._convertPositionTo( "relative", {
						top: b - inst.helperProportions.height,
						left: 0
					} ).top;
				}
				if ( ls ) {
					ui.position.left = inst._convertPositionTo( "relative", {
						top: 0,
						left: l
					} ).left;
				}
				if ( rs ) {
					ui.position.left = inst._convertPositionTo( "relative", {
						top: 0,
						left: r - inst.helperProportions.width
					} ).left;
				}
			}

			if ( !inst.snapElements[ i ].snapping && ( ts || bs || ls || rs || first ) ) {
				( inst.options.snap.snap &&
					inst.options.snap.snap.call(
						inst.element,
						event,
						$.extend( inst._uiHash(), {
							snapItem: inst.snapElements[ i ].item
						} ) ) );
			}
			inst.snapElements[ i ].snapping = ( ts || bs || ls || rs || first );

		}

	}
} );

$.ui.plugin.add( "draggable", "stack", {
	start: function( event, ui, instance ) {
		var min,
			o = instance.options,
			group = $.makeArray( $( o.stack ) ).sort( function( a, b ) {
				return ( parseInt( $( a ).css( "zIndex" ), 10 ) || 0 ) -
					( parseInt( $( b ).css( "zIndex" ), 10 ) || 0 );
			} );

		if ( !group.length ) { return; }

		min = parseInt( $( group[ 0 ] ).css( "zIndex" ), 10 ) || 0;
		$( group ).each( function( i ) {
			$( this ).css( "zIndex", min + i );
		} );
		this.css( "zIndex", ( min + group.length ) );
	}
} );

$.ui.plugin.add( "draggable", "zIndex", {
	start: function( event, ui, instance ) {
		var t = $( ui.helper ),
			o = instance.options;

		if ( t.css( "zIndex" ) ) {
			o._zIndex = t.css( "zIndex" );
		}
		t.css( "zIndex", o.zIndex );
	},
	stop: function( event, ui, instance ) {
		var o = instance.options;

		if ( o._zIndex ) {
			$( ui.helper ).css( "zIndex", o._zIndex );
		}
	}
} );

return $.ui.draggable;

} ) );

},{}],9:[function(require,module,exports){
/*!
 * jQuery UI Widget 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Widget
//>>group: Core
//>>description: Provides a factory for creating stateful widgets with a common API.
//>>docs: http://api.jqueryui.com/jQuery.widget/
//>>demos: http://jqueryui.com/widget/

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( [ "jquery", "./version" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
}( function( $ ) {

var widgetUuid = 0;
var widgetSlice = Array.prototype.slice;

$.cleanData = ( function( orig ) {
	return function( elems ) {
		var events, elem, i;
		for ( i = 0; ( elem = elems[ i ] ) != null; i++ ) {
			try {

				// Only trigger remove when necessary to save time
				events = $._data( elem, "events" );
				if ( events && events.remove ) {
					$( elem ).triggerHandler( "remove" );
				}

			// Http://bugs.jquery.com/ticket/8235
			} catch ( e ) {}
		}
		orig( elems );
	};
} )( $.cleanData );

$.widget = function( name, base, prototype ) {
	var existingConstructor, constructor, basePrototype;

	// ProxiedPrototype allows the provided prototype to remain unmodified
	// so that it can be used as a mixin for multiple widgets (#8876)
	var proxiedPrototype = {};

	var namespace = name.split( "." )[ 0 ];
	name = name.split( "." )[ 1 ];
	var fullName = namespace + "-" + name;

	if ( !prototype ) {
		prototype = base;
		base = $.Widget;
	}

	if ( $.isArray( prototype ) ) {
		prototype = $.extend.apply( null, [ {} ].concat( prototype ) );
	}

	// Create selector for plugin
	$.expr[ ":" ][ fullName.toLowerCase() ] = function( elem ) {
		return !!$.data( elem, fullName );
	};

	$[ namespace ] = $[ namespace ] || {};
	existingConstructor = $[ namespace ][ name ];
	constructor = $[ namespace ][ name ] = function( options, element ) {

		// Allow instantiation without "new" keyword
		if ( !this._createWidget ) {
			return new constructor( options, element );
		}

		// Allow instantiation without initializing for simple inheritance
		// must use "new" keyword (the code above always passes args)
		if ( arguments.length ) {
			this._createWidget( options, element );
		}
	};

	// Extend with the existing constructor to carry over any static properties
	$.extend( constructor, existingConstructor, {
		version: prototype.version,

		// Copy the object used to create the prototype in case we need to
		// redefine the widget later
		_proto: $.extend( {}, prototype ),

		// Track widgets that inherit from this widget in case this widget is
		// redefined after a widget inherits from it
		_childConstructors: []
	} );

	basePrototype = new base();

	// We need to make the options hash a property directly on the new instance
	// otherwise we'll modify the options hash on the prototype that we're
	// inheriting from
	basePrototype.options = $.widget.extend( {}, basePrototype.options );
	$.each( prototype, function( prop, value ) {
		if ( !$.isFunction( value ) ) {
			proxiedPrototype[ prop ] = value;
			return;
		}
		proxiedPrototype[ prop ] = ( function() {
			function _super() {
				return base.prototype[ prop ].apply( this, arguments );
			}

			function _superApply( args ) {
				return base.prototype[ prop ].apply( this, args );
			}

			return function() {
				var __super = this._super;
				var __superApply = this._superApply;
				var returnValue;

				this._super = _super;
				this._superApply = _superApply;

				returnValue = value.apply( this, arguments );

				this._super = __super;
				this._superApply = __superApply;

				return returnValue;
			};
		} )();
	} );
	constructor.prototype = $.widget.extend( basePrototype, {

		// TODO: remove support for widgetEventPrefix
		// always use the name + a colon as the prefix, e.g., draggable:start
		// don't prefix for widgets that aren't DOM-based
		widgetEventPrefix: existingConstructor ? ( basePrototype.widgetEventPrefix || name ) : name
	}, proxiedPrototype, {
		constructor: constructor,
		namespace: namespace,
		widgetName: name,
		widgetFullName: fullName
	} );

	// If this widget is being redefined then we need to find all widgets that
	// are inheriting from it and redefine all of them so that they inherit from
	// the new version of this widget. We're essentially trying to replace one
	// level in the prototype chain.
	if ( existingConstructor ) {
		$.each( existingConstructor._childConstructors, function( i, child ) {
			var childPrototype = child.prototype;

			// Redefine the child widget using the same prototype that was
			// originally used, but inherit from the new version of the base
			$.widget( childPrototype.namespace + "." + childPrototype.widgetName, constructor,
				child._proto );
		} );

		// Remove the list of existing child constructors from the old constructor
		// so the old child constructors can be garbage collected
		delete existingConstructor._childConstructors;
	} else {
		base._childConstructors.push( constructor );
	}

	$.widget.bridge( name, constructor );

	return constructor;
};

$.widget.extend = function( target ) {
	var input = widgetSlice.call( arguments, 1 );
	var inputIndex = 0;
	var inputLength = input.length;
	var key;
	var value;

	for ( ; inputIndex < inputLength; inputIndex++ ) {
		for ( key in input[ inputIndex ] ) {
			value = input[ inputIndex ][ key ];
			if ( input[ inputIndex ].hasOwnProperty( key ) && value !== undefined ) {

				// Clone objects
				if ( $.isPlainObject( value ) ) {
					target[ key ] = $.isPlainObject( target[ key ] ) ?
						$.widget.extend( {}, target[ key ], value ) :

						// Don't extend strings, arrays, etc. with objects
						$.widget.extend( {}, value );

				// Copy everything else by reference
				} else {
					target[ key ] = value;
				}
			}
		}
	}
	return target;
};

$.widget.bridge = function( name, object ) {
	var fullName = object.prototype.widgetFullName || name;
	$.fn[ name ] = function( options ) {
		var isMethodCall = typeof options === "string";
		var args = widgetSlice.call( arguments, 1 );
		var returnValue = this;

		if ( isMethodCall ) {

			// If this is an empty collection, we need to have the instance method
			// return undefined instead of the jQuery instance
			if ( !this.length && options === "instance" ) {
				returnValue = undefined;
			} else {
				this.each( function() {
					var methodValue;
					var instance = $.data( this, fullName );

					if ( options === "instance" ) {
						returnValue = instance;
						return false;
					}

					if ( !instance ) {
						return $.error( "cannot call methods on " + name +
							" prior to initialization; " +
							"attempted to call method '" + options + "'" );
					}

					if ( !$.isFunction( instance[ options ] ) || options.charAt( 0 ) === "_" ) {
						return $.error( "no such method '" + options + "' for " + name +
							" widget instance" );
					}

					methodValue = instance[ options ].apply( instance, args );

					if ( methodValue !== instance && methodValue !== undefined ) {
						returnValue = methodValue && methodValue.jquery ?
							returnValue.pushStack( methodValue.get() ) :
							methodValue;
						return false;
					}
				} );
			}
		} else {

			// Allow multiple hashes to be passed on init
			if ( args.length ) {
				options = $.widget.extend.apply( null, [ options ].concat( args ) );
			}

			this.each( function() {
				var instance = $.data( this, fullName );
				if ( instance ) {
					instance.option( options || {} );
					if ( instance._init ) {
						instance._init();
					}
				} else {
					$.data( this, fullName, new object( options, this ) );
				}
			} );
		}

		return returnValue;
	};
};

$.Widget = function( /* options, element */ ) {};
$.Widget._childConstructors = [];

$.Widget.prototype = {
	widgetName: "widget",
	widgetEventPrefix: "",
	defaultElement: "<div>",

	options: {
		classes: {},
		disabled: false,

		// Callbacks
		create: null
	},

	_createWidget: function( options, element ) {
		element = $( element || this.defaultElement || this )[ 0 ];
		this.element = $( element );
		this.uuid = widgetUuid++;
		this.eventNamespace = "." + this.widgetName + this.uuid;

		this.bindings = $();
		this.hoverable = $();
		this.focusable = $();
		this.classesElementLookup = {};

		if ( element !== this ) {
			$.data( element, this.widgetFullName, this );
			this._on( true, this.element, {
				remove: function( event ) {
					if ( event.target === element ) {
						this.destroy();
					}
				}
			} );
			this.document = $( element.style ?

				// Element within the document
				element.ownerDocument :

				// Element is window or document
				element.document || element );
			this.window = $( this.document[ 0 ].defaultView || this.document[ 0 ].parentWindow );
		}

		this.options = $.widget.extend( {},
			this.options,
			this._getCreateOptions(),
			options );

		this._create();

		if ( this.options.disabled ) {
			this._setOptionDisabled( this.options.disabled );
		}

		this._trigger( "create", null, this._getCreateEventData() );
		this._init();
	},

	_getCreateOptions: function() {
		return {};
	},

	_getCreateEventData: $.noop,

	_create: $.noop,

	_init: $.noop,

	destroy: function() {
		var that = this;

		this._destroy();
		$.each( this.classesElementLookup, function( key, value ) {
			that._removeClass( value, key );
		} );

		// We can probably remove the unbind calls in 2.0
		// all event bindings should go through this._on()
		this.element
			.off( this.eventNamespace )
			.removeData( this.widgetFullName );
		this.widget()
			.off( this.eventNamespace )
			.removeAttr( "aria-disabled" );

		// Clean up events and states
		this.bindings.off( this.eventNamespace );
	},

	_destroy: $.noop,

	widget: function() {
		return this.element;
	},

	option: function( key, value ) {
		var options = key;
		var parts;
		var curOption;
		var i;

		if ( arguments.length === 0 ) {

			// Don't return a reference to the internal hash
			return $.widget.extend( {}, this.options );
		}

		if ( typeof key === "string" ) {

			// Handle nested keys, e.g., "foo.bar" => { foo: { bar: ___ } }
			options = {};
			parts = key.split( "." );
			key = parts.shift();
			if ( parts.length ) {
				curOption = options[ key ] = $.widget.extend( {}, this.options[ key ] );
				for ( i = 0; i < parts.length - 1; i++ ) {
					curOption[ parts[ i ] ] = curOption[ parts[ i ] ] || {};
					curOption = curOption[ parts[ i ] ];
				}
				key = parts.pop();
				if ( arguments.length === 1 ) {
					return curOption[ key ] === undefined ? null : curOption[ key ];
				}
				curOption[ key ] = value;
			} else {
				if ( arguments.length === 1 ) {
					return this.options[ key ] === undefined ? null : this.options[ key ];
				}
				options[ key ] = value;
			}
		}

		this._setOptions( options );

		return this;
	},

	_setOptions: function( options ) {
		var key;

		for ( key in options ) {
			this._setOption( key, options[ key ] );
		}

		return this;
	},

	_setOption: function( key, value ) {
		if ( key === "classes" ) {
			this._setOptionClasses( value );
		}

		this.options[ key ] = value;

		if ( key === "disabled" ) {
			this._setOptionDisabled( value );
		}

		return this;
	},

	_setOptionClasses: function( value ) {
		var classKey, elements, currentElements;

		for ( classKey in value ) {
			currentElements = this.classesElementLookup[ classKey ];
			if ( value[ classKey ] === this.options.classes[ classKey ] ||
					!currentElements ||
					!currentElements.length ) {
				continue;
			}

			// We are doing this to create a new jQuery object because the _removeClass() call
			// on the next line is going to destroy the reference to the current elements being
			// tracked. We need to save a copy of this collection so that we can add the new classes
			// below.
			elements = $( currentElements.get() );
			this._removeClass( currentElements, classKey );

			// We don't use _addClass() here, because that uses this.options.classes
			// for generating the string of classes. We want to use the value passed in from
			// _setOption(), this is the new value of the classes option which was passed to
			// _setOption(). We pass this value directly to _classes().
			elements.addClass( this._classes( {
				element: elements,
				keys: classKey,
				classes: value,
				add: true
			} ) );
		}
	},

	_setOptionDisabled: function( value ) {
		this._toggleClass( this.widget(), this.widgetFullName + "-disabled", null, !!value );

		// If the widget is becoming disabled, then nothing is interactive
		if ( value ) {
			this._removeClass( this.hoverable, null, "ui-state-hover" );
			this._removeClass( this.focusable, null, "ui-state-focus" );
		}
	},

	enable: function() {
		return this._setOptions( { disabled: false } );
	},

	disable: function() {
		return this._setOptions( { disabled: true } );
	},

	_classes: function( options ) {
		var full = [];
		var that = this;

		options = $.extend( {
			element: this.element,
			classes: this.options.classes || {}
		}, options );

		function processClassString( classes, checkOption ) {
			var current, i;
			for ( i = 0; i < classes.length; i++ ) {
				current = that.classesElementLookup[ classes[ i ] ] || $();
				if ( options.add ) {
					current = $( $.unique( current.get().concat( options.element.get() ) ) );
				} else {
					current = $( current.not( options.element ).get() );
				}
				that.classesElementLookup[ classes[ i ] ] = current;
				full.push( classes[ i ] );
				if ( checkOption && options.classes[ classes[ i ] ] ) {
					full.push( options.classes[ classes[ i ] ] );
				}
			}
		}

		this._on( options.element, {
			"remove": "_untrackClassesElement"
		} );

		if ( options.keys ) {
			processClassString( options.keys.match( /\S+/g ) || [], true );
		}
		if ( options.extra ) {
			processClassString( options.extra.match( /\S+/g ) || [] );
		}

		return full.join( " " );
	},

	_untrackClassesElement: function( event ) {
		var that = this;
		$.each( that.classesElementLookup, function( key, value ) {
			if ( $.inArray( event.target, value ) !== -1 ) {
				that.classesElementLookup[ key ] = $( value.not( event.target ).get() );
			}
		} );
	},

	_removeClass: function( element, keys, extra ) {
		return this._toggleClass( element, keys, extra, false );
	},

	_addClass: function( element, keys, extra ) {
		return this._toggleClass( element, keys, extra, true );
	},

	_toggleClass: function( element, keys, extra, add ) {
		add = ( typeof add === "boolean" ) ? add : extra;
		var shift = ( typeof element === "string" || element === null ),
			options = {
				extra: shift ? keys : extra,
				keys: shift ? element : keys,
				element: shift ? this.element : element,
				add: add
			};
		options.element.toggleClass( this._classes( options ), add );
		return this;
	},

	_on: function( suppressDisabledCheck, element, handlers ) {
		var delegateElement;
		var instance = this;

		// No suppressDisabledCheck flag, shuffle arguments
		if ( typeof suppressDisabledCheck !== "boolean" ) {
			handlers = element;
			element = suppressDisabledCheck;
			suppressDisabledCheck = false;
		}

		// No element argument, shuffle and use this.element
		if ( !handlers ) {
			handlers = element;
			element = this.element;
			delegateElement = this.widget();
		} else {
			element = delegateElement = $( element );
			this.bindings = this.bindings.add( element );
		}

		$.each( handlers, function( event, handler ) {
			function handlerProxy() {

				// Allow widgets to customize the disabled handling
				// - disabled as an array instead of boolean
				// - disabled class as method for disabling individual parts
				if ( !suppressDisabledCheck &&
						( instance.options.disabled === true ||
						$( this ).hasClass( "ui-state-disabled" ) ) ) {
					return;
				}
				return ( typeof handler === "string" ? instance[ handler ] : handler )
					.apply( instance, arguments );
			}

			// Copy the guid so direct unbinding works
			if ( typeof handler !== "string" ) {
				handlerProxy.guid = handler.guid =
					handler.guid || handlerProxy.guid || $.guid++;
			}

			var match = event.match( /^([\w:-]*)\s*(.*)$/ );
			var eventName = match[ 1 ] + instance.eventNamespace;
			var selector = match[ 2 ];

			if ( selector ) {
				delegateElement.on( eventName, selector, handlerProxy );
			} else {
				element.on( eventName, handlerProxy );
			}
		} );
	},

	_off: function( element, eventName ) {
		eventName = ( eventName || "" ).split( " " ).join( this.eventNamespace + " " ) +
			this.eventNamespace;
		element.off( eventName ).off( eventName );

		// Clear the stack to avoid memory leaks (#10056)
		this.bindings = $( this.bindings.not( element ).get() );
		this.focusable = $( this.focusable.not( element ).get() );
		this.hoverable = $( this.hoverable.not( element ).get() );
	},

	_delay: function( handler, delay ) {
		function handlerProxy() {
			return ( typeof handler === "string" ? instance[ handler ] : handler )
				.apply( instance, arguments );
		}
		var instance = this;
		return setTimeout( handlerProxy, delay || 0 );
	},

	_hoverable: function( element ) {
		this.hoverable = this.hoverable.add( element );
		this._on( element, {
			mouseenter: function( event ) {
				this._addClass( $( event.currentTarget ), null, "ui-state-hover" );
			},
			mouseleave: function( event ) {
				this._removeClass( $( event.currentTarget ), null, "ui-state-hover" );
			}
		} );
	},

	_focusable: function( element ) {
		this.focusable = this.focusable.add( element );
		this._on( element, {
			focusin: function( event ) {
				this._addClass( $( event.currentTarget ), null, "ui-state-focus" );
			},
			focusout: function( event ) {
				this._removeClass( $( event.currentTarget ), null, "ui-state-focus" );
			}
		} );
	},

	_trigger: function( type, event, data ) {
		var prop, orig;
		var callback = this.options[ type ];

		data = data || {};
		event = $.Event( event );
		event.type = ( type === this.widgetEventPrefix ?
			type :
			this.widgetEventPrefix + type ).toLowerCase();

		// The original event may come from any element
		// so we need to reset the target on the new event
		event.target = this.element[ 0 ];

		// Copy original event properties over to the new event
		orig = event.originalEvent;
		if ( orig ) {
			for ( prop in orig ) {
				if ( !( prop in event ) ) {
					event[ prop ] = orig[ prop ];
				}
			}
		}

		this.element.trigger( event, data );
		return !( $.isFunction( callback ) &&
			callback.apply( this.element[ 0 ], [ event ].concat( data ) ) === false ||
			event.isDefaultPrevented() );
	}
};

$.each( { show: "fadeIn", hide: "fadeOut" }, function( method, defaultEffect ) {
	$.Widget.prototype[ "_" + method ] = function( element, options, callback ) {
		if ( typeof options === "string" ) {
			options = { effect: options };
		}

		var hasOptions;
		var effectName = !options ?
			method :
			options === true || typeof options === "number" ?
				defaultEffect :
				options.effect || defaultEffect;

		options = options || {};
		if ( typeof options === "number" ) {
			options = { duration: options };
		}

		hasOptions = !$.isEmptyObject( options );
		options.complete = callback;

		if ( options.delay ) {
			element.delay( options.delay );
		}

		if ( hasOptions && $.effects && $.effects.effect[ effectName ] ) {
			element[ method ]( options );
		} else if ( effectName !== method && element[ effectName ] ) {
			element[ effectName ]( options.duration, options.easing, callback );
		} else {
			element.queue( function( next ) {
				$( this )[ method ]();
				if ( callback ) {
					callback.call( element[ 0 ] );
				}
				next();
			} );
		}
	};
} );

return $.widget;

} ) );

},{}],8:[function(require,module,exports){
( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( [ "jquery" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
} ( function( $ ) {

$.ui = $.ui || {};

return $.ui.version = "1.12.1";

} ) );

},{}],7:[function(require,module,exports){
/*!
 * jQuery UI Scroll Parent 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: scrollParent
//>>group: Core
//>>description: Get the closest ancestor element that is scrollable.
//>>docs: http://api.jqueryui.com/scrollParent/

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( [ "jquery", "./version" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
} ( function( $ ) {

return $.fn.scrollParent = function( includeHidden ) {
	var position = this.css( "position" ),
		excludeStaticParent = position === "absolute",
		overflowRegex = includeHidden ? /(auto|scroll|hidden)/ : /(auto|scroll)/,
		scrollParent = this.parents().filter( function() {
			var parent = $( this );
			if ( excludeStaticParent && parent.css( "position" ) === "static" ) {
				return false;
			}
			return overflowRegex.test( parent.css( "overflow" ) + parent.css( "overflow-y" ) +
				parent.css( "overflow-x" ) );
		} ).eq( 0 );

	return position === "fixed" || !scrollParent.length ?
		$( this[ 0 ].ownerDocument || document ) :
		scrollParent;
};

} ) );

},{}],6:[function(require,module,exports){
( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( [ "jquery", "./version" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
} ( function( $ ) {
return $.ui.safeBlur = function( element ) {

	// Support: IE9 - 10 only
	// If the <body> is blurred, IE will switch windows, see #9420
	if ( element && element.nodeName.toLowerCase() !== "body" ) {
		$( element ).trigger( "blur" );
	}
};

} ) );

},{}],5:[function(require,module,exports){
( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( [ "jquery", "./version" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
} ( function( $ ) {
return $.ui.safeActiveElement = function( document ) {
	var activeElement;

	// Support: IE 9 only
	// IE9 throws an "Unspecified error" accessing document.activeElement from an <iframe>
	try {
		activeElement = document.activeElement;
	} catch ( error ) {
		activeElement = document.body;
	}

	// Support: IE 9 - 11 only
	// IE may return null instead of an element
	// Interestingly, this only seems to occur when NOT in an iframe
	if ( !activeElement ) {
		activeElement = document.body;
	}

	// Support: IE 11 only
	// IE11 returns a seemingly empty object in some cases when accessing
	// document.activeElement from an <iframe>
	if ( !activeElement.nodeName ) {
		activeElement = document.body;
	}

	return activeElement;
};

} ) );

},{}],4:[function(require,module,exports){
( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( [ "jquery", "./version" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
} ( function( $ ) {

// $.ui.plugin is deprecated. Use $.widget() extensions instead.
return $.ui.plugin = {
	add: function( module, option, set ) {
		var i,
			proto = $.ui[ module ].prototype;
		for ( i in set ) {
			proto.plugins[ i ] = proto.plugins[ i ] || [];
			proto.plugins[ i ].push( [ option, set[ i ] ] );
		}
	},
	call: function( instance, name, args, allowDisconnected ) {
		var i,
			set = instance.plugins[ name ];

		if ( !set ) {
			return;
		}

		if ( !allowDisconnected && ( !instance.element[ 0 ].parentNode ||
				instance.element[ 0 ].parentNode.nodeType === 11 ) ) {
			return;
		}

		for ( i = 0; i < set.length; i++ ) {
			if ( instance.options[ set[ i ][ 0 ] ] ) {
				set[ i ][ 1 ].apply( instance.element, args );
			}
		}
	}
};

} ) );

},{}],3:[function(require,module,exports){
( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( [ "jquery", "./version" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
} ( function( $ ) {

// This file is deprecated
return $.ui.ie = !!/msie [\w.]+/.exec( navigator.userAgent.toLowerCase() );
} ) );

},{}],2:[function(require,module,exports){
/*!
 * jQuery UI :data 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: :data Selector
//>>group: Core
//>>description: Selects elements which have data stored under the specified key.
//>>docs: http://api.jqueryui.com/data-selector/

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( [ "jquery", "./version" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
} ( function( $ ) {
return $.extend( $.expr[ ":" ], {
	data: $.expr.createPseudo ?
		$.expr.createPseudo( function( dataName ) {
			return function( elem ) {
				return !!$.data( elem, dataName );
			};
		} ) :

		// Support: jQuery <1.8
		function( elem, i, match ) {
			return !!$.data( elem, match[ 3 ] );
		}
} );
} ) );

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvdXRpbC9zaHVmZmxlLmpzIiwic3JjL2pzL3V0aWwvZ2V0SlNPTi5qcyIsInNyYy9qcy91dGlsL2ZhZGVPdXQuanMiLCJub2RlX21vZHVsZXMvanF1ZXJ5LXVpL3VpL3dpZGdldHMvbW91c2UuanMiLCJub2RlX21vZHVsZXMvanF1ZXJ5LXVpL3VpL3dpZGdldHMvZHJhZ2dhYmxlLmpzIiwibm9kZV9tb2R1bGVzL2pxdWVyeS11aS91aS93aWRnZXQuanMiLCJub2RlX21vZHVsZXMvanF1ZXJ5LXVpL3VpL3ZlcnNpb24uanMiLCJub2RlX21vZHVsZXMvanF1ZXJ5LXVpL3VpL3Njcm9sbC1wYXJlbnQuanMiLCJub2RlX21vZHVsZXMvanF1ZXJ5LXVpL3VpL3NhZmUtYmx1ci5qcyIsIm5vZGVfbW9kdWxlcy9qcXVlcnktdWkvdWkvc2FmZS1hY3RpdmUtZWxlbWVudC5qcyIsIm5vZGVfbW9kdWxlcy9qcXVlcnktdWkvdWkvcGx1Z2luLmpzIiwibm9kZV9tb2R1bGVzL2pxdWVyeS11aS91aS9pZS5qcyIsIm5vZGVfbW9kdWxlcy9qcXVlcnktdWkvdWkvZGF0YS5qcyIsIm5vZGVfbW9kdWxlcy9ib290c3RyYXAubmF0aXZlL2Rpc3QvYm9vdHN0cmFwLW5hdGl2ZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbE9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsdUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImZ1bmN0aW9uIHNodWZmbGUoYXJyYXkpIHtcbiAgICB2YXIgY291bnRlciA9IGFycmF5Lmxlbmd0aCxcbiAgICAgICAgdGVtcCwgaW5kZXg7XG5cbiAgICAvLyBXaGlsZSB0aGVyZSBhcmUgZWxlbWVudHMgaW4gdGhlIGFycmF5XG4gICAgd2hpbGUgKGNvdW50ZXIgPiAwKSB7XG4gICAgICAgIC8vIFBpY2sgYSByYW5kb20gaW5kZXhcbiAgICAgICAgaW5kZXggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBjb3VudGVyKTtcblxuICAgICAgICAvLyBEZWNyZWFzZSBjb3VudGVyIGJ5IDFcbiAgICAgICAgY291bnRlci0tO1xuXG4gICAgICAgIC8vIEFuZCBzd2FwIHRoZSBsYXN0IGVsZW1lbnQgd2l0aCBpdFxuICAgICAgICB0ZW1wID0gYXJyYXlbY291bnRlcl07XG4gICAgICAgIGFycmF5W2NvdW50ZXJdID0gYXJyYXlbaW5kZXhdO1xuICAgICAgICBhcnJheVtpbmRleF0gPSB0ZW1wO1xuICAgIH1cblxuICAgIHJldHVybiBhcnJheTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gc2h1ZmZsZTsiLCJmdW5jdGlvbiBnZXRKU09OKHVybCwgY2FsbGJhY2ssIGVycikge1xuICB2YXIgcmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICByZXF1ZXN0Lm9wZW4oJ0dFVCcsIHVybCwgdHJ1ZSk7XG5cbiAgcmVxdWVzdC5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAocmVxdWVzdC5zdGF0dXMgPj0gMjAwICYmIHJlcXVlc3Quc3RhdHVzIDwgNDAwKSB7XG4gICAgICAvLyBTdWNjZXNzIVxuICAgICAgdmFyIGRhdGEgPSBKU09OLnBhcnNlKHJlcXVlc3QucmVzcG9uc2VUZXh0KTtcbiAgICAgIGNhbGxiYWNrKGRhdGEpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBXZSByZWFjaGVkIG91ciB0YXJnZXQgc2VydmVyLCBidXQgaXQgcmV0dXJuZWQgYW4gZXJyb3JcbiAgICAgIGlmIChlcnIpIGVycigpO1xuICAgIH1cbiAgfTtcblxuICByZXF1ZXN0Lm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBUaGVyZSB3YXMgYSBjb25uZWN0aW9uIGVycm9yIG9mIHNvbWUgc29ydFxuICAgIGlmIChlcnIpIGVycigpO1xuICB9O1xuXG4gIHJlcXVlc3Quc2VuZCgpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldEpTT047IiwiZnVuY3Rpb24gZmFkZU91dChlbCkge1xuICAgIHZhciBvcGFjaXR5ID0gMTtcblxuICAgIGVsLnN0eWxlLm9wYWNpdHkgPSAxO1xuICAgIGVsLnN0eWxlLmZpbHRlciA9ICcnO1xuXG4gICAgdmFyIGxhc3QgPSArbmV3IERhdGUoKTtcbiAgICB2YXIgdGljayA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBvcGFjaXR5IC09IChuZXcgRGF0ZSgpIC0gbGFzdCkgLyA0MDA7XG4gICAgICAgIGVsLnN0eWxlLm9wYWNpdHkgPSBvcGFjaXR5O1xuICAgICAgICBlbC5zdHlsZS5maWx0ZXIgPSAnYWxwaGEob3BhY2l0eT0nICsgKDEwMCAqIG9wYWNpdHkpfDEgKyAnKSc7XG5cbiAgICAgICAgbGFzdCA9ICtuZXcgRGF0ZSgpO1xuXG4gICAgICAgIGlmIChvcGFjaXR5ID4gMCkge1xuICAgICAgICAgICAgKHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgJiYgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRpY2spKSB8fCBzZXRUaW1lb3V0KHRpY2ssIDE2KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB0aWNrKCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZmFkZU91dDsiLCIvKiFcbiAqIGpRdWVyeSBVSSBNb3VzZSAxLjEyLjFcbiAqIGh0dHA6Ly9qcXVlcnl1aS5jb21cbiAqXG4gKiBDb3B5cmlnaHQgalF1ZXJ5IEZvdW5kYXRpb24gYW5kIG90aGVyIGNvbnRyaWJ1dG9yc1xuICogUmVsZWFzZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlLlxuICogaHR0cDovL2pxdWVyeS5vcmcvbGljZW5zZVxuICovXG5cbi8vPj5sYWJlbDogTW91c2Vcbi8vPj5ncm91cDogV2lkZ2V0c1xuLy8+PmRlc2NyaXB0aW9uOiBBYnN0cmFjdHMgbW91c2UtYmFzZWQgaW50ZXJhY3Rpb25zIHRvIGFzc2lzdCBpbiBjcmVhdGluZyBjZXJ0YWluIHdpZGdldHMuXG4vLz4+ZG9jczogaHR0cDovL2FwaS5qcXVlcnl1aS5jb20vbW91c2UvXG5cbiggZnVuY3Rpb24oIGZhY3RvcnkgKSB7XG5cdGlmICggdHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQgKSB7XG5cblx0XHQvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXG5cdFx0ZGVmaW5lKCBbXG5cdFx0XHRcImpxdWVyeVwiLFxuXHRcdFx0XCIuLi9pZVwiLFxuXHRcdFx0XCIuLi92ZXJzaW9uXCIsXG5cdFx0XHRcIi4uL3dpZGdldFwiXG5cdFx0XSwgZmFjdG9yeSApO1xuXHR9IGVsc2Uge1xuXG5cdFx0Ly8gQnJvd3NlciBnbG9iYWxzXG5cdFx0ZmFjdG9yeSggalF1ZXJ5ICk7XG5cdH1cbn0oIGZ1bmN0aW9uKCAkICkge1xuXG52YXIgbW91c2VIYW5kbGVkID0gZmFsc2U7XG4kKCBkb2N1bWVudCApLm9uKCBcIm1vdXNldXBcIiwgZnVuY3Rpb24oKSB7XG5cdG1vdXNlSGFuZGxlZCA9IGZhbHNlO1xufSApO1xuXG5yZXR1cm4gJC53aWRnZXQoIFwidWkubW91c2VcIiwge1xuXHR2ZXJzaW9uOiBcIjEuMTIuMVwiLFxuXHRvcHRpb25zOiB7XG5cdFx0Y2FuY2VsOiBcImlucHV0LCB0ZXh0YXJlYSwgYnV0dG9uLCBzZWxlY3QsIG9wdGlvblwiLFxuXHRcdGRpc3RhbmNlOiAxLFxuXHRcdGRlbGF5OiAwXG5cdH0sXG5cdF9tb3VzZUluaXQ6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciB0aGF0ID0gdGhpcztcblxuXHRcdHRoaXMuZWxlbWVudFxuXHRcdFx0Lm9uKCBcIm1vdXNlZG93bi5cIiArIHRoaXMud2lkZ2V0TmFtZSwgZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdFx0XHRyZXR1cm4gdGhhdC5fbW91c2VEb3duKCBldmVudCApO1xuXHRcdFx0fSApXG5cdFx0XHQub24oIFwiY2xpY2suXCIgKyB0aGlzLndpZGdldE5hbWUsIGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHRcdFx0aWYgKCB0cnVlID09PSAkLmRhdGEoIGV2ZW50LnRhcmdldCwgdGhhdC53aWRnZXROYW1lICsgXCIucHJldmVudENsaWNrRXZlbnRcIiApICkge1xuXHRcdFx0XHRcdCQucmVtb3ZlRGF0YSggZXZlbnQudGFyZ2V0LCB0aGF0LndpZGdldE5hbWUgKyBcIi5wcmV2ZW50Q2xpY2tFdmVudFwiICk7XG5cdFx0XHRcdFx0ZXZlbnQuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cdFx0XHR9ICk7XG5cblx0XHR0aGlzLnN0YXJ0ZWQgPSBmYWxzZTtcblx0fSxcblxuXHQvLyBUT0RPOiBtYWtlIHN1cmUgZGVzdHJveWluZyBvbmUgaW5zdGFuY2Ugb2YgbW91c2UgZG9lc24ndCBtZXNzIHdpdGhcblx0Ly8gb3RoZXIgaW5zdGFuY2VzIG9mIG1vdXNlXG5cdF9tb3VzZURlc3Ryb3k6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuZWxlbWVudC5vZmYoIFwiLlwiICsgdGhpcy53aWRnZXROYW1lICk7XG5cdFx0aWYgKCB0aGlzLl9tb3VzZU1vdmVEZWxlZ2F0ZSApIHtcblx0XHRcdHRoaXMuZG9jdW1lbnRcblx0XHRcdFx0Lm9mZiggXCJtb3VzZW1vdmUuXCIgKyB0aGlzLndpZGdldE5hbWUsIHRoaXMuX21vdXNlTW92ZURlbGVnYXRlIClcblx0XHRcdFx0Lm9mZiggXCJtb3VzZXVwLlwiICsgdGhpcy53aWRnZXROYW1lLCB0aGlzLl9tb3VzZVVwRGVsZWdhdGUgKTtcblx0XHR9XG5cdH0sXG5cblx0X21vdXNlRG93bjogZnVuY3Rpb24oIGV2ZW50ICkge1xuXG5cdFx0Ly8gZG9uJ3QgbGV0IG1vcmUgdGhhbiBvbmUgd2lkZ2V0IGhhbmRsZSBtb3VzZVN0YXJ0XG5cdFx0aWYgKCBtb3VzZUhhbmRsZWQgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dGhpcy5fbW91c2VNb3ZlZCA9IGZhbHNlO1xuXG5cdFx0Ly8gV2UgbWF5IGhhdmUgbWlzc2VkIG1vdXNldXAgKG91dCBvZiB3aW5kb3cpXG5cdFx0KCB0aGlzLl9tb3VzZVN0YXJ0ZWQgJiYgdGhpcy5fbW91c2VVcCggZXZlbnQgKSApO1xuXG5cdFx0dGhpcy5fbW91c2VEb3duRXZlbnQgPSBldmVudDtcblxuXHRcdHZhciB0aGF0ID0gdGhpcyxcblx0XHRcdGJ0bklzTGVmdCA9ICggZXZlbnQud2hpY2ggPT09IDEgKSxcblxuXHRcdFx0Ly8gZXZlbnQudGFyZ2V0Lm5vZGVOYW1lIHdvcmtzIGFyb3VuZCBhIGJ1ZyBpbiBJRSA4IHdpdGhcblx0XHRcdC8vIGRpc2FibGVkIGlucHV0cyAoIzc2MjApXG5cdFx0XHRlbElzQ2FuY2VsID0gKCB0eXBlb2YgdGhpcy5vcHRpb25zLmNhbmNlbCA9PT0gXCJzdHJpbmdcIiAmJiBldmVudC50YXJnZXQubm9kZU5hbWUgP1xuXHRcdFx0XHQkKCBldmVudC50YXJnZXQgKS5jbG9zZXN0KCB0aGlzLm9wdGlvbnMuY2FuY2VsICkubGVuZ3RoIDogZmFsc2UgKTtcblx0XHRpZiAoICFidG5Jc0xlZnQgfHwgZWxJc0NhbmNlbCB8fCAhdGhpcy5fbW91c2VDYXB0dXJlKCBldmVudCApICkge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXG5cdFx0dGhpcy5tb3VzZURlbGF5TWV0ID0gIXRoaXMub3B0aW9ucy5kZWxheTtcblx0XHRpZiAoICF0aGlzLm1vdXNlRGVsYXlNZXQgKSB7XG5cdFx0XHR0aGlzLl9tb3VzZURlbGF5VGltZXIgPSBzZXRUaW1lb3V0KCBmdW5jdGlvbigpIHtcblx0XHRcdFx0dGhhdC5tb3VzZURlbGF5TWV0ID0gdHJ1ZTtcblx0XHRcdH0sIHRoaXMub3B0aW9ucy5kZWxheSApO1xuXHRcdH1cblxuXHRcdGlmICggdGhpcy5fbW91c2VEaXN0YW5jZU1ldCggZXZlbnQgKSAmJiB0aGlzLl9tb3VzZURlbGF5TWV0KCBldmVudCApICkge1xuXHRcdFx0dGhpcy5fbW91c2VTdGFydGVkID0gKCB0aGlzLl9tb3VzZVN0YXJ0KCBldmVudCApICE9PSBmYWxzZSApO1xuXHRcdFx0aWYgKCAhdGhpcy5fbW91c2VTdGFydGVkICkge1xuXHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBDbGljayBldmVudCBtYXkgbmV2ZXIgaGF2ZSBmaXJlZCAoR2Vja28gJiBPcGVyYSlcblx0XHRpZiAoIHRydWUgPT09ICQuZGF0YSggZXZlbnQudGFyZ2V0LCB0aGlzLndpZGdldE5hbWUgKyBcIi5wcmV2ZW50Q2xpY2tFdmVudFwiICkgKSB7XG5cdFx0XHQkLnJlbW92ZURhdGEoIGV2ZW50LnRhcmdldCwgdGhpcy53aWRnZXROYW1lICsgXCIucHJldmVudENsaWNrRXZlbnRcIiApO1xuXHRcdH1cblxuXHRcdC8vIFRoZXNlIGRlbGVnYXRlcyBhcmUgcmVxdWlyZWQgdG8ga2VlcCBjb250ZXh0XG5cdFx0dGhpcy5fbW91c2VNb3ZlRGVsZWdhdGUgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0XHRyZXR1cm4gdGhhdC5fbW91c2VNb3ZlKCBldmVudCApO1xuXHRcdH07XG5cdFx0dGhpcy5fbW91c2VVcERlbGVnYXRlID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdFx0cmV0dXJuIHRoYXQuX21vdXNlVXAoIGV2ZW50ICk7XG5cdFx0fTtcblxuXHRcdHRoaXMuZG9jdW1lbnRcblx0XHRcdC5vbiggXCJtb3VzZW1vdmUuXCIgKyB0aGlzLndpZGdldE5hbWUsIHRoaXMuX21vdXNlTW92ZURlbGVnYXRlIClcblx0XHRcdC5vbiggXCJtb3VzZXVwLlwiICsgdGhpcy53aWRnZXROYW1lLCB0aGlzLl9tb3VzZVVwRGVsZWdhdGUgKTtcblxuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHRtb3VzZUhhbmRsZWQgPSB0cnVlO1xuXHRcdHJldHVybiB0cnVlO1xuXHR9LFxuXG5cdF9tb3VzZU1vdmU6IGZ1bmN0aW9uKCBldmVudCApIHtcblxuXHRcdC8vIE9ubHkgY2hlY2sgZm9yIG1vdXNldXBzIG91dHNpZGUgdGhlIGRvY3VtZW50IGlmIHlvdSd2ZSBtb3ZlZCBpbnNpZGUgdGhlIGRvY3VtZW50XG5cdFx0Ly8gYXQgbGVhc3Qgb25jZS4gVGhpcyBwcmV2ZW50cyB0aGUgZmlyaW5nIG9mIG1vdXNldXAgaW4gdGhlIGNhc2Ugb2YgSUU8OSwgd2hpY2ggd2lsbFxuXHRcdC8vIGZpcmUgYSBtb3VzZW1vdmUgZXZlbnQgaWYgY29udGVudCBpcyBwbGFjZWQgdW5kZXIgdGhlIGN1cnNvci4gU2VlICM3Nzc4XG5cdFx0Ly8gU3VwcG9ydDogSUUgPDlcblx0XHRpZiAoIHRoaXMuX21vdXNlTW92ZWQgKSB7XG5cblx0XHRcdC8vIElFIG1vdXNldXAgY2hlY2sgLSBtb3VzZXVwIGhhcHBlbmVkIHdoZW4gbW91c2Ugd2FzIG91dCBvZiB3aW5kb3dcblx0XHRcdGlmICggJC51aS5pZSAmJiAoICFkb2N1bWVudC5kb2N1bWVudE1vZGUgfHwgZG9jdW1lbnQuZG9jdW1lbnRNb2RlIDwgOSApICYmXG5cdFx0XHRcdFx0IWV2ZW50LmJ1dHRvbiApIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuX21vdXNlVXAoIGV2ZW50ICk7XG5cblx0XHRcdC8vIElmcmFtZSBtb3VzZXVwIGNoZWNrIC0gbW91c2V1cCBvY2N1cnJlZCBpbiBhbm90aGVyIGRvY3VtZW50XG5cdFx0XHR9IGVsc2UgaWYgKCAhZXZlbnQud2hpY2ggKSB7XG5cblx0XHRcdFx0Ly8gU3VwcG9ydDogU2FmYXJpIDw9OCAtIDlcblx0XHRcdFx0Ly8gU2FmYXJpIHNldHMgd2hpY2ggdG8gMCBpZiB5b3UgcHJlc3MgYW55IG9mIHRoZSBmb2xsb3dpbmcga2V5c1xuXHRcdFx0XHQvLyBkdXJpbmcgYSBkcmFnICgjMTQ0NjEpXG5cdFx0XHRcdGlmICggZXZlbnQub3JpZ2luYWxFdmVudC5hbHRLZXkgfHwgZXZlbnQub3JpZ2luYWxFdmVudC5jdHJsS2V5IHx8XG5cdFx0XHRcdFx0XHRldmVudC5vcmlnaW5hbEV2ZW50Lm1ldGFLZXkgfHwgZXZlbnQub3JpZ2luYWxFdmVudC5zaGlmdEtleSApIHtcblx0XHRcdFx0XHR0aGlzLmlnbm9yZU1pc3NpbmdXaGljaCA9IHRydWU7XG5cdFx0XHRcdH0gZWxzZSBpZiAoICF0aGlzLmlnbm9yZU1pc3NpbmdXaGljaCApIHtcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy5fbW91c2VVcCggZXZlbnQgKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmICggZXZlbnQud2hpY2ggfHwgZXZlbnQuYnV0dG9uICkge1xuXHRcdFx0dGhpcy5fbW91c2VNb3ZlZCA9IHRydWU7XG5cdFx0fVxuXG5cdFx0aWYgKCB0aGlzLl9tb3VzZVN0YXJ0ZWQgKSB7XG5cdFx0XHR0aGlzLl9tb3VzZURyYWcoIGV2ZW50ICk7XG5cdFx0XHRyZXR1cm4gZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHR9XG5cblx0XHRpZiAoIHRoaXMuX21vdXNlRGlzdGFuY2VNZXQoIGV2ZW50ICkgJiYgdGhpcy5fbW91c2VEZWxheU1ldCggZXZlbnQgKSApIHtcblx0XHRcdHRoaXMuX21vdXNlU3RhcnRlZCA9XG5cdFx0XHRcdCggdGhpcy5fbW91c2VTdGFydCggdGhpcy5fbW91c2VEb3duRXZlbnQsIGV2ZW50ICkgIT09IGZhbHNlICk7XG5cdFx0XHQoIHRoaXMuX21vdXNlU3RhcnRlZCA/IHRoaXMuX21vdXNlRHJhZyggZXZlbnQgKSA6IHRoaXMuX21vdXNlVXAoIGV2ZW50ICkgKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gIXRoaXMuX21vdXNlU3RhcnRlZDtcblx0fSxcblxuXHRfbW91c2VVcDogZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdHRoaXMuZG9jdW1lbnRcblx0XHRcdC5vZmYoIFwibW91c2Vtb3ZlLlwiICsgdGhpcy53aWRnZXROYW1lLCB0aGlzLl9tb3VzZU1vdmVEZWxlZ2F0ZSApXG5cdFx0XHQub2ZmKCBcIm1vdXNldXAuXCIgKyB0aGlzLndpZGdldE5hbWUsIHRoaXMuX21vdXNlVXBEZWxlZ2F0ZSApO1xuXG5cdFx0aWYgKCB0aGlzLl9tb3VzZVN0YXJ0ZWQgKSB7XG5cdFx0XHR0aGlzLl9tb3VzZVN0YXJ0ZWQgPSBmYWxzZTtcblxuXHRcdFx0aWYgKCBldmVudC50YXJnZXQgPT09IHRoaXMuX21vdXNlRG93bkV2ZW50LnRhcmdldCApIHtcblx0XHRcdFx0JC5kYXRhKCBldmVudC50YXJnZXQsIHRoaXMud2lkZ2V0TmFtZSArIFwiLnByZXZlbnRDbGlja0V2ZW50XCIsIHRydWUgKTtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5fbW91c2VTdG9wKCBldmVudCApO1xuXHRcdH1cblxuXHRcdGlmICggdGhpcy5fbW91c2VEZWxheVRpbWVyICkge1xuXHRcdFx0Y2xlYXJUaW1lb3V0KCB0aGlzLl9tb3VzZURlbGF5VGltZXIgKTtcblx0XHRcdGRlbGV0ZSB0aGlzLl9tb3VzZURlbGF5VGltZXI7XG5cdFx0fVxuXG5cdFx0dGhpcy5pZ25vcmVNaXNzaW5nV2hpY2ggPSBmYWxzZTtcblx0XHRtb3VzZUhhbmRsZWQgPSBmYWxzZTtcblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHR9LFxuXG5cdF9tb3VzZURpc3RhbmNlTWV0OiBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0cmV0dXJuICggTWF0aC5tYXgoXG5cdFx0XHRcdE1hdGguYWJzKCB0aGlzLl9tb3VzZURvd25FdmVudC5wYWdlWCAtIGV2ZW50LnBhZ2VYICksXG5cdFx0XHRcdE1hdGguYWJzKCB0aGlzLl9tb3VzZURvd25FdmVudC5wYWdlWSAtIGV2ZW50LnBhZ2VZIClcblx0XHRcdCkgPj0gdGhpcy5vcHRpb25zLmRpc3RhbmNlXG5cdFx0KTtcblx0fSxcblxuXHRfbW91c2VEZWxheU1ldDogZnVuY3Rpb24oIC8qIGV2ZW50ICovICkge1xuXHRcdHJldHVybiB0aGlzLm1vdXNlRGVsYXlNZXQ7XG5cdH0sXG5cblx0Ly8gVGhlc2UgYXJlIHBsYWNlaG9sZGVyIG1ldGhvZHMsIHRvIGJlIG92ZXJyaWRlbiBieSBleHRlbmRpbmcgcGx1Z2luXG5cdF9tb3VzZVN0YXJ0OiBmdW5jdGlvbiggLyogZXZlbnQgKi8gKSB7fSxcblx0X21vdXNlRHJhZzogZnVuY3Rpb24oIC8qIGV2ZW50ICovICkge30sXG5cdF9tb3VzZVN0b3A6IGZ1bmN0aW9uKCAvKiBldmVudCAqLyApIHt9LFxuXHRfbW91c2VDYXB0dXJlOiBmdW5jdGlvbiggLyogZXZlbnQgKi8gKSB7IHJldHVybiB0cnVlOyB9XG59ICk7XG5cbn0gKSApO1xuIiwiLyohXG4gKiBqUXVlcnkgVUkgRHJhZ2dhYmxlIDEuMTIuMVxuICogaHR0cDovL2pxdWVyeXVpLmNvbVxuICpcbiAqIENvcHlyaWdodCBqUXVlcnkgRm91bmRhdGlvbiBhbmQgb3RoZXIgY29udHJpYnV0b3JzXG4gKiBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuXG4gKiBodHRwOi8vanF1ZXJ5Lm9yZy9saWNlbnNlXG4gKi9cblxuLy8+PmxhYmVsOiBEcmFnZ2FibGVcbi8vPj5ncm91cDogSW50ZXJhY3Rpb25zXG4vLz4+ZGVzY3JpcHRpb246IEVuYWJsZXMgZHJhZ2dpbmcgZnVuY3Rpb25hbGl0eSBmb3IgYW55IGVsZW1lbnQuXG4vLz4+ZG9jczogaHR0cDovL2FwaS5qcXVlcnl1aS5jb20vZHJhZ2dhYmxlL1xuLy8+PmRlbW9zOiBodHRwOi8vanF1ZXJ5dWkuY29tL2RyYWdnYWJsZS9cbi8vPj5jc3Muc3RydWN0dXJlOiAuLi8uLi90aGVtZXMvYmFzZS9kcmFnZ2FibGUuY3NzXG5cbiggZnVuY3Rpb24oIGZhY3RvcnkgKSB7XG5cdGlmICggdHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQgKSB7XG5cblx0XHQvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXG5cdFx0ZGVmaW5lKCBbXG5cdFx0XHRcImpxdWVyeVwiLFxuXHRcdFx0XCIuL21vdXNlXCIsXG5cdFx0XHRcIi4uL2RhdGFcIixcblx0XHRcdFwiLi4vcGx1Z2luXCIsXG5cdFx0XHRcIi4uL3NhZmUtYWN0aXZlLWVsZW1lbnRcIixcblx0XHRcdFwiLi4vc2FmZS1ibHVyXCIsXG5cdFx0XHRcIi4uL3Njcm9sbC1wYXJlbnRcIixcblx0XHRcdFwiLi4vdmVyc2lvblwiLFxuXHRcdFx0XCIuLi93aWRnZXRcIlxuXHRcdF0sIGZhY3RvcnkgKTtcblx0fSBlbHNlIHtcblxuXHRcdC8vIEJyb3dzZXIgZ2xvYmFsc1xuXHRcdGZhY3RvcnkoIGpRdWVyeSApO1xuXHR9XG59KCBmdW5jdGlvbiggJCApIHtcblxuJC53aWRnZXQoIFwidWkuZHJhZ2dhYmxlXCIsICQudWkubW91c2UsIHtcblx0dmVyc2lvbjogXCIxLjEyLjFcIixcblx0d2lkZ2V0RXZlbnRQcmVmaXg6IFwiZHJhZ1wiLFxuXHRvcHRpb25zOiB7XG5cdFx0YWRkQ2xhc3NlczogdHJ1ZSxcblx0XHRhcHBlbmRUbzogXCJwYXJlbnRcIixcblx0XHRheGlzOiBmYWxzZSxcblx0XHRjb25uZWN0VG9Tb3J0YWJsZTogZmFsc2UsXG5cdFx0Y29udGFpbm1lbnQ6IGZhbHNlLFxuXHRcdGN1cnNvcjogXCJhdXRvXCIsXG5cdFx0Y3Vyc29yQXQ6IGZhbHNlLFxuXHRcdGdyaWQ6IGZhbHNlLFxuXHRcdGhhbmRsZTogZmFsc2UsXG5cdFx0aGVscGVyOiBcIm9yaWdpbmFsXCIsXG5cdFx0aWZyYW1lRml4OiBmYWxzZSxcblx0XHRvcGFjaXR5OiBmYWxzZSxcblx0XHRyZWZyZXNoUG9zaXRpb25zOiBmYWxzZSxcblx0XHRyZXZlcnQ6IGZhbHNlLFxuXHRcdHJldmVydER1cmF0aW9uOiA1MDAsXG5cdFx0c2NvcGU6IFwiZGVmYXVsdFwiLFxuXHRcdHNjcm9sbDogdHJ1ZSxcblx0XHRzY3JvbGxTZW5zaXRpdml0eTogMjAsXG5cdFx0c2Nyb2xsU3BlZWQ6IDIwLFxuXHRcdHNuYXA6IGZhbHNlLFxuXHRcdHNuYXBNb2RlOiBcImJvdGhcIixcblx0XHRzbmFwVG9sZXJhbmNlOiAyMCxcblx0XHRzdGFjazogZmFsc2UsXG5cdFx0ekluZGV4OiBmYWxzZSxcblxuXHRcdC8vIENhbGxiYWNrc1xuXHRcdGRyYWc6IG51bGwsXG5cdFx0c3RhcnQ6IG51bGwsXG5cdFx0c3RvcDogbnVsbFxuXHR9LFxuXHRfY3JlYXRlOiBmdW5jdGlvbigpIHtcblxuXHRcdGlmICggdGhpcy5vcHRpb25zLmhlbHBlciA9PT0gXCJvcmlnaW5hbFwiICkge1xuXHRcdFx0dGhpcy5fc2V0UG9zaXRpb25SZWxhdGl2ZSgpO1xuXHRcdH1cblx0XHRpZiAoIHRoaXMub3B0aW9ucy5hZGRDbGFzc2VzICkge1xuXHRcdFx0dGhpcy5fYWRkQ2xhc3MoIFwidWktZHJhZ2dhYmxlXCIgKTtcblx0XHR9XG5cdFx0dGhpcy5fc2V0SGFuZGxlQ2xhc3NOYW1lKCk7XG5cblx0XHR0aGlzLl9tb3VzZUluaXQoKTtcblx0fSxcblxuXHRfc2V0T3B0aW9uOiBmdW5jdGlvbigga2V5LCB2YWx1ZSApIHtcblx0XHR0aGlzLl9zdXBlcigga2V5LCB2YWx1ZSApO1xuXHRcdGlmICgga2V5ID09PSBcImhhbmRsZVwiICkge1xuXHRcdFx0dGhpcy5fcmVtb3ZlSGFuZGxlQ2xhc3NOYW1lKCk7XG5cdFx0XHR0aGlzLl9zZXRIYW5kbGVDbGFzc05hbWUoKTtcblx0XHR9XG5cdH0sXG5cblx0X2Rlc3Ryb3k6IGZ1bmN0aW9uKCkge1xuXHRcdGlmICggKCB0aGlzLmhlbHBlciB8fCB0aGlzLmVsZW1lbnQgKS5pcyggXCIudWktZHJhZ2dhYmxlLWRyYWdnaW5nXCIgKSApIHtcblx0XHRcdHRoaXMuZGVzdHJveU9uQ2xlYXIgPSB0cnVlO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHR0aGlzLl9yZW1vdmVIYW5kbGVDbGFzc05hbWUoKTtcblx0XHR0aGlzLl9tb3VzZURlc3Ryb3koKTtcblx0fSxcblxuXHRfbW91c2VDYXB0dXJlOiBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0dmFyIG8gPSB0aGlzLm9wdGlvbnM7XG5cblx0XHQvLyBBbW9uZyBvdGhlcnMsIHByZXZlbnQgYSBkcmFnIG9uIGEgcmVzaXphYmxlLWhhbmRsZVxuXHRcdGlmICggdGhpcy5oZWxwZXIgfHwgby5kaXNhYmxlZCB8fFxuXHRcdFx0XHQkKCBldmVudC50YXJnZXQgKS5jbG9zZXN0KCBcIi51aS1yZXNpemFibGUtaGFuZGxlXCIgKS5sZW5ndGggPiAwICkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdC8vUXVpdCBpZiB3ZSdyZSBub3Qgb24gYSB2YWxpZCBoYW5kbGVcblx0XHR0aGlzLmhhbmRsZSA9IHRoaXMuX2dldEhhbmRsZSggZXZlbnQgKTtcblx0XHRpZiAoICF0aGlzLmhhbmRsZSApIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHR0aGlzLl9ibHVyQWN0aXZlRWxlbWVudCggZXZlbnQgKTtcblxuXHRcdHRoaXMuX2Jsb2NrRnJhbWVzKCBvLmlmcmFtZUZpeCA9PT0gdHJ1ZSA/IFwiaWZyYW1lXCIgOiBvLmlmcmFtZUZpeCApO1xuXG5cdFx0cmV0dXJuIHRydWU7XG5cblx0fSxcblxuXHRfYmxvY2tGcmFtZXM6IGZ1bmN0aW9uKCBzZWxlY3RvciApIHtcblx0XHR0aGlzLmlmcmFtZUJsb2NrcyA9IHRoaXMuZG9jdW1lbnQuZmluZCggc2VsZWN0b3IgKS5tYXAoIGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIGlmcmFtZSA9ICQoIHRoaXMgKTtcblxuXHRcdFx0cmV0dXJuICQoIFwiPGRpdj5cIiApXG5cdFx0XHRcdC5jc3MoIFwicG9zaXRpb25cIiwgXCJhYnNvbHV0ZVwiIClcblx0XHRcdFx0LmFwcGVuZFRvKCBpZnJhbWUucGFyZW50KCkgKVxuXHRcdFx0XHQub3V0ZXJXaWR0aCggaWZyYW1lLm91dGVyV2lkdGgoKSApXG5cdFx0XHRcdC5vdXRlckhlaWdodCggaWZyYW1lLm91dGVySGVpZ2h0KCkgKVxuXHRcdFx0XHQub2Zmc2V0KCBpZnJhbWUub2Zmc2V0KCkgKVsgMCBdO1xuXHRcdH0gKTtcblx0fSxcblxuXHRfdW5ibG9ja0ZyYW1lczogZnVuY3Rpb24oKSB7XG5cdFx0aWYgKCB0aGlzLmlmcmFtZUJsb2NrcyApIHtcblx0XHRcdHRoaXMuaWZyYW1lQmxvY2tzLnJlbW92ZSgpO1xuXHRcdFx0ZGVsZXRlIHRoaXMuaWZyYW1lQmxvY2tzO1xuXHRcdH1cblx0fSxcblxuXHRfYmx1ckFjdGl2ZUVsZW1lbnQ6IGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHR2YXIgYWN0aXZlRWxlbWVudCA9ICQudWkuc2FmZUFjdGl2ZUVsZW1lbnQoIHRoaXMuZG9jdW1lbnRbIDAgXSApLFxuXHRcdFx0dGFyZ2V0ID0gJCggZXZlbnQudGFyZ2V0ICk7XG5cblx0XHQvLyBEb24ndCBibHVyIGlmIHRoZSBldmVudCBvY2N1cnJlZCBvbiBhbiBlbGVtZW50IHRoYXQgaXMgd2l0aGluXG5cdFx0Ly8gdGhlIGN1cnJlbnRseSBmb2N1c2VkIGVsZW1lbnRcblx0XHQvLyBTZWUgIzEwNTI3LCAjMTI0NzJcblx0XHRpZiAoIHRhcmdldC5jbG9zZXN0KCBhY3RpdmVFbGVtZW50ICkubGVuZ3RoICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdC8vIEJsdXIgYW55IGVsZW1lbnQgdGhhdCBjdXJyZW50bHkgaGFzIGZvY3VzLCBzZWUgIzQyNjFcblx0XHQkLnVpLnNhZmVCbHVyKCBhY3RpdmVFbGVtZW50ICk7XG5cdH0sXG5cblx0X21vdXNlU3RhcnQ6IGZ1bmN0aW9uKCBldmVudCApIHtcblxuXHRcdHZhciBvID0gdGhpcy5vcHRpb25zO1xuXG5cdFx0Ly9DcmVhdGUgYW5kIGFwcGVuZCB0aGUgdmlzaWJsZSBoZWxwZXJcblx0XHR0aGlzLmhlbHBlciA9IHRoaXMuX2NyZWF0ZUhlbHBlciggZXZlbnQgKTtcblxuXHRcdHRoaXMuX2FkZENsYXNzKCB0aGlzLmhlbHBlciwgXCJ1aS1kcmFnZ2FibGUtZHJhZ2dpbmdcIiApO1xuXG5cdFx0Ly9DYWNoZSB0aGUgaGVscGVyIHNpemVcblx0XHR0aGlzLl9jYWNoZUhlbHBlclByb3BvcnRpb25zKCk7XG5cblx0XHQvL0lmIGRkbWFuYWdlciBpcyB1c2VkIGZvciBkcm9wcGFibGVzLCBzZXQgdGhlIGdsb2JhbCBkcmFnZ2FibGVcblx0XHRpZiAoICQudWkuZGRtYW5hZ2VyICkge1xuXHRcdFx0JC51aS5kZG1hbmFnZXIuY3VycmVudCA9IHRoaXM7XG5cdFx0fVxuXG5cdFx0Lypcblx0XHQgKiAtIFBvc2l0aW9uIGdlbmVyYXRpb24gLVxuXHRcdCAqIFRoaXMgYmxvY2sgZ2VuZXJhdGVzIGV2ZXJ5dGhpbmcgcG9zaXRpb24gcmVsYXRlZCAtIGl0J3MgdGhlIGNvcmUgb2YgZHJhZ2dhYmxlcy5cblx0XHQgKi9cblxuXHRcdC8vQ2FjaGUgdGhlIG1hcmdpbnMgb2YgdGhlIG9yaWdpbmFsIGVsZW1lbnRcblx0XHR0aGlzLl9jYWNoZU1hcmdpbnMoKTtcblxuXHRcdC8vU3RvcmUgdGhlIGhlbHBlcidzIGNzcyBwb3NpdGlvblxuXHRcdHRoaXMuY3NzUG9zaXRpb24gPSB0aGlzLmhlbHBlci5jc3MoIFwicG9zaXRpb25cIiApO1xuXHRcdHRoaXMuc2Nyb2xsUGFyZW50ID0gdGhpcy5oZWxwZXIuc2Nyb2xsUGFyZW50KCB0cnVlICk7XG5cdFx0dGhpcy5vZmZzZXRQYXJlbnQgPSB0aGlzLmhlbHBlci5vZmZzZXRQYXJlbnQoKTtcblx0XHR0aGlzLmhhc0ZpeGVkQW5jZXN0b3IgPSB0aGlzLmhlbHBlci5wYXJlbnRzKCkuZmlsdGVyKCBmdW5jdGlvbigpIHtcblx0XHRcdFx0cmV0dXJuICQoIHRoaXMgKS5jc3MoIFwicG9zaXRpb25cIiApID09PSBcImZpeGVkXCI7XG5cdFx0XHR9ICkubGVuZ3RoID4gMDtcblxuXHRcdC8vVGhlIGVsZW1lbnQncyBhYnNvbHV0ZSBwb3NpdGlvbiBvbiB0aGUgcGFnZSBtaW51cyBtYXJnaW5zXG5cdFx0dGhpcy5wb3NpdGlvbkFicyA9IHRoaXMuZWxlbWVudC5vZmZzZXQoKTtcblx0XHR0aGlzLl9yZWZyZXNoT2Zmc2V0cyggZXZlbnQgKTtcblxuXHRcdC8vR2VuZXJhdGUgdGhlIG9yaWdpbmFsIHBvc2l0aW9uXG5cdFx0dGhpcy5vcmlnaW5hbFBvc2l0aW9uID0gdGhpcy5wb3NpdGlvbiA9IHRoaXMuX2dlbmVyYXRlUG9zaXRpb24oIGV2ZW50LCBmYWxzZSApO1xuXHRcdHRoaXMub3JpZ2luYWxQYWdlWCA9IGV2ZW50LnBhZ2VYO1xuXHRcdHRoaXMub3JpZ2luYWxQYWdlWSA9IGV2ZW50LnBhZ2VZO1xuXG5cdFx0Ly9BZGp1c3QgdGhlIG1vdXNlIG9mZnNldCByZWxhdGl2ZSB0byB0aGUgaGVscGVyIGlmIFwiY3Vyc29yQXRcIiBpcyBzdXBwbGllZFxuXHRcdCggby5jdXJzb3JBdCAmJiB0aGlzLl9hZGp1c3RPZmZzZXRGcm9tSGVscGVyKCBvLmN1cnNvckF0ICkgKTtcblxuXHRcdC8vU2V0IGEgY29udGFpbm1lbnQgaWYgZ2l2ZW4gaW4gdGhlIG9wdGlvbnNcblx0XHR0aGlzLl9zZXRDb250YWlubWVudCgpO1xuXG5cdFx0Ly9UcmlnZ2VyIGV2ZW50ICsgY2FsbGJhY2tzXG5cdFx0aWYgKCB0aGlzLl90cmlnZ2VyKCBcInN0YXJ0XCIsIGV2ZW50ICkgPT09IGZhbHNlICkge1xuXHRcdFx0dGhpcy5fY2xlYXIoKTtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHQvL1JlY2FjaGUgdGhlIGhlbHBlciBzaXplXG5cdFx0dGhpcy5fY2FjaGVIZWxwZXJQcm9wb3J0aW9ucygpO1xuXG5cdFx0Ly9QcmVwYXJlIHRoZSBkcm9wcGFibGUgb2Zmc2V0c1xuXHRcdGlmICggJC51aS5kZG1hbmFnZXIgJiYgIW8uZHJvcEJlaGF2aW91ciApIHtcblx0XHRcdCQudWkuZGRtYW5hZ2VyLnByZXBhcmVPZmZzZXRzKCB0aGlzLCBldmVudCApO1xuXHRcdH1cblxuXHRcdC8vIEV4ZWN1dGUgdGhlIGRyYWcgb25jZSAtIHRoaXMgY2F1c2VzIHRoZSBoZWxwZXIgbm90IHRvIGJlIHZpc2libGUgYmVmb3JlIGdldHRpbmcgaXRzXG5cdFx0Ly8gY29ycmVjdCBwb3NpdGlvblxuXHRcdHRoaXMuX21vdXNlRHJhZyggZXZlbnQsIHRydWUgKTtcblxuXHRcdC8vIElmIHRoZSBkZG1hbmFnZXIgaXMgdXNlZCBmb3IgZHJvcHBhYmxlcywgaW5mb3JtIHRoZSBtYW5hZ2VyIHRoYXQgZHJhZ2dpbmcgaGFzIHN0YXJ0ZWRcblx0XHQvLyAoc2VlICM1MDAzKVxuXHRcdGlmICggJC51aS5kZG1hbmFnZXIgKSB7XG5cdFx0XHQkLnVpLmRkbWFuYWdlci5kcmFnU3RhcnQoIHRoaXMsIGV2ZW50ICk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRydWU7XG5cdH0sXG5cblx0X3JlZnJlc2hPZmZzZXRzOiBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0dGhpcy5vZmZzZXQgPSB7XG5cdFx0XHR0b3A6IHRoaXMucG9zaXRpb25BYnMudG9wIC0gdGhpcy5tYXJnaW5zLnRvcCxcblx0XHRcdGxlZnQ6IHRoaXMucG9zaXRpb25BYnMubGVmdCAtIHRoaXMubWFyZ2lucy5sZWZ0LFxuXHRcdFx0c2Nyb2xsOiBmYWxzZSxcblx0XHRcdHBhcmVudDogdGhpcy5fZ2V0UGFyZW50T2Zmc2V0KCksXG5cdFx0XHRyZWxhdGl2ZTogdGhpcy5fZ2V0UmVsYXRpdmVPZmZzZXQoKVxuXHRcdH07XG5cblx0XHR0aGlzLm9mZnNldC5jbGljayA9IHtcblx0XHRcdGxlZnQ6IGV2ZW50LnBhZ2VYIC0gdGhpcy5vZmZzZXQubGVmdCxcblx0XHRcdHRvcDogZXZlbnQucGFnZVkgLSB0aGlzLm9mZnNldC50b3Bcblx0XHR9O1xuXHR9LFxuXG5cdF9tb3VzZURyYWc6IGZ1bmN0aW9uKCBldmVudCwgbm9Qcm9wYWdhdGlvbiApIHtcblxuXHRcdC8vIHJlc2V0IGFueSBuZWNlc3NhcnkgY2FjaGVkIHByb3BlcnRpZXMgKHNlZSAjNTAwOSlcblx0XHRpZiAoIHRoaXMuaGFzRml4ZWRBbmNlc3RvciApIHtcblx0XHRcdHRoaXMub2Zmc2V0LnBhcmVudCA9IHRoaXMuX2dldFBhcmVudE9mZnNldCgpO1xuXHRcdH1cblxuXHRcdC8vQ29tcHV0ZSB0aGUgaGVscGVycyBwb3NpdGlvblxuXHRcdHRoaXMucG9zaXRpb24gPSB0aGlzLl9nZW5lcmF0ZVBvc2l0aW9uKCBldmVudCwgdHJ1ZSApO1xuXHRcdHRoaXMucG9zaXRpb25BYnMgPSB0aGlzLl9jb252ZXJ0UG9zaXRpb25UbyggXCJhYnNvbHV0ZVwiICk7XG5cblx0XHQvL0NhbGwgcGx1Z2lucyBhbmQgY2FsbGJhY2tzIGFuZCB1c2UgdGhlIHJlc3VsdGluZyBwb3NpdGlvbiBpZiBzb21ldGhpbmcgaXMgcmV0dXJuZWRcblx0XHRpZiAoICFub1Byb3BhZ2F0aW9uICkge1xuXHRcdFx0dmFyIHVpID0gdGhpcy5fdWlIYXNoKCk7XG5cdFx0XHRpZiAoIHRoaXMuX3RyaWdnZXIoIFwiZHJhZ1wiLCBldmVudCwgdWkgKSA9PT0gZmFsc2UgKSB7XG5cdFx0XHRcdHRoaXMuX21vdXNlVXAoIG5ldyAkLkV2ZW50KCBcIm1vdXNldXBcIiwgZXZlbnQgKSApO1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cdFx0XHR0aGlzLnBvc2l0aW9uID0gdWkucG9zaXRpb247XG5cdFx0fVxuXG5cdFx0dGhpcy5oZWxwZXJbIDAgXS5zdHlsZS5sZWZ0ID0gdGhpcy5wb3NpdGlvbi5sZWZ0ICsgXCJweFwiO1xuXHRcdHRoaXMuaGVscGVyWyAwIF0uc3R5bGUudG9wID0gdGhpcy5wb3NpdGlvbi50b3AgKyBcInB4XCI7XG5cblx0XHRpZiAoICQudWkuZGRtYW5hZ2VyICkge1xuXHRcdFx0JC51aS5kZG1hbmFnZXIuZHJhZyggdGhpcywgZXZlbnQgKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH0sXG5cblx0X21vdXNlU3RvcDogZnVuY3Rpb24oIGV2ZW50ICkge1xuXG5cdFx0Ly9JZiB3ZSBhcmUgdXNpbmcgZHJvcHBhYmxlcywgaW5mb3JtIHRoZSBtYW5hZ2VyIGFib3V0IHRoZSBkcm9wXG5cdFx0dmFyIHRoYXQgPSB0aGlzLFxuXHRcdFx0ZHJvcHBlZCA9IGZhbHNlO1xuXHRcdGlmICggJC51aS5kZG1hbmFnZXIgJiYgIXRoaXMub3B0aW9ucy5kcm9wQmVoYXZpb3VyICkge1xuXHRcdFx0ZHJvcHBlZCA9ICQudWkuZGRtYW5hZ2VyLmRyb3AoIHRoaXMsIGV2ZW50ICk7XG5cdFx0fVxuXG5cdFx0Ly9pZiBhIGRyb3AgY29tZXMgZnJvbSBvdXRzaWRlIChhIHNvcnRhYmxlKVxuXHRcdGlmICggdGhpcy5kcm9wcGVkICkge1xuXHRcdFx0ZHJvcHBlZCA9IHRoaXMuZHJvcHBlZDtcblx0XHRcdHRoaXMuZHJvcHBlZCA9IGZhbHNlO1xuXHRcdH1cblxuXHRcdGlmICggKCB0aGlzLm9wdGlvbnMucmV2ZXJ0ID09PSBcImludmFsaWRcIiAmJiAhZHJvcHBlZCApIHx8XG5cdFx0XHRcdCggdGhpcy5vcHRpb25zLnJldmVydCA9PT0gXCJ2YWxpZFwiICYmIGRyb3BwZWQgKSB8fFxuXHRcdFx0XHR0aGlzLm9wdGlvbnMucmV2ZXJ0ID09PSB0cnVlIHx8ICggJC5pc0Z1bmN0aW9uKCB0aGlzLm9wdGlvbnMucmV2ZXJ0ICkgJiZcblx0XHRcdFx0dGhpcy5vcHRpb25zLnJldmVydC5jYWxsKCB0aGlzLmVsZW1lbnQsIGRyb3BwZWQgKSApXG5cdFx0KSB7XG5cdFx0XHQkKCB0aGlzLmhlbHBlciApLmFuaW1hdGUoXG5cdFx0XHRcdHRoaXMub3JpZ2luYWxQb3NpdGlvbixcblx0XHRcdFx0cGFyc2VJbnQoIHRoaXMub3B0aW9ucy5yZXZlcnREdXJhdGlvbiwgMTAgKSxcblx0XHRcdFx0ZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0aWYgKCB0aGF0Ll90cmlnZ2VyKCBcInN0b3BcIiwgZXZlbnQgKSAhPT0gZmFsc2UgKSB7XG5cdFx0XHRcdFx0XHR0aGF0Ll9jbGVhcigpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYgKCB0aGlzLl90cmlnZ2VyKCBcInN0b3BcIiwgZXZlbnQgKSAhPT0gZmFsc2UgKSB7XG5cdFx0XHRcdHRoaXMuX2NsZWFyKCk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9LFxuXG5cdF9tb3VzZVVwOiBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0dGhpcy5fdW5ibG9ja0ZyYW1lcygpO1xuXG5cdFx0Ly8gSWYgdGhlIGRkbWFuYWdlciBpcyB1c2VkIGZvciBkcm9wcGFibGVzLCBpbmZvcm0gdGhlIG1hbmFnZXIgdGhhdCBkcmFnZ2luZyBoYXMgc3RvcHBlZFxuXHRcdC8vIChzZWUgIzUwMDMpXG5cdFx0aWYgKCAkLnVpLmRkbWFuYWdlciApIHtcblx0XHRcdCQudWkuZGRtYW5hZ2VyLmRyYWdTdG9wKCB0aGlzLCBldmVudCApO1xuXHRcdH1cblxuXHRcdC8vIE9ubHkgbmVlZCB0byBmb2N1cyBpZiB0aGUgZXZlbnQgb2NjdXJyZWQgb24gdGhlIGRyYWdnYWJsZSBpdHNlbGYsIHNlZSAjMTA1Mjdcblx0XHRpZiAoIHRoaXMuaGFuZGxlRWxlbWVudC5pcyggZXZlbnQudGFyZ2V0ICkgKSB7XG5cblx0XHRcdC8vIFRoZSBpbnRlcmFjdGlvbiBpcyBvdmVyOyB3aGV0aGVyIG9yIG5vdCB0aGUgY2xpY2sgcmVzdWx0ZWQgaW4gYSBkcmFnLFxuXHRcdFx0Ly8gZm9jdXMgdGhlIGVsZW1lbnRcblx0XHRcdHRoaXMuZWxlbWVudC50cmlnZ2VyKCBcImZvY3VzXCIgKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gJC51aS5tb3VzZS5wcm90b3R5cGUuX21vdXNlVXAuY2FsbCggdGhpcywgZXZlbnQgKTtcblx0fSxcblxuXHRjYW5jZWw6IGZ1bmN0aW9uKCkge1xuXG5cdFx0aWYgKCB0aGlzLmhlbHBlci5pcyggXCIudWktZHJhZ2dhYmxlLWRyYWdnaW5nXCIgKSApIHtcblx0XHRcdHRoaXMuX21vdXNlVXAoIG5ldyAkLkV2ZW50KCBcIm1vdXNldXBcIiwgeyB0YXJnZXQ6IHRoaXMuZWxlbWVudFsgMCBdIH0gKSApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLl9jbGVhcigpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH0sXG5cblx0X2dldEhhbmRsZTogZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdHJldHVybiB0aGlzLm9wdGlvbnMuaGFuZGxlID9cblx0XHRcdCEhJCggZXZlbnQudGFyZ2V0ICkuY2xvc2VzdCggdGhpcy5lbGVtZW50LmZpbmQoIHRoaXMub3B0aW9ucy5oYW5kbGUgKSApLmxlbmd0aCA6XG5cdFx0XHR0cnVlO1xuXHR9LFxuXG5cdF9zZXRIYW5kbGVDbGFzc05hbWU6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuaGFuZGxlRWxlbWVudCA9IHRoaXMub3B0aW9ucy5oYW5kbGUgP1xuXHRcdFx0dGhpcy5lbGVtZW50LmZpbmQoIHRoaXMub3B0aW9ucy5oYW5kbGUgKSA6IHRoaXMuZWxlbWVudDtcblx0XHR0aGlzLl9hZGRDbGFzcyggdGhpcy5oYW5kbGVFbGVtZW50LCBcInVpLWRyYWdnYWJsZS1oYW5kbGVcIiApO1xuXHR9LFxuXG5cdF9yZW1vdmVIYW5kbGVDbGFzc05hbWU6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuX3JlbW92ZUNsYXNzKCB0aGlzLmhhbmRsZUVsZW1lbnQsIFwidWktZHJhZ2dhYmxlLWhhbmRsZVwiICk7XG5cdH0sXG5cblx0X2NyZWF0ZUhlbHBlcjogZnVuY3Rpb24oIGV2ZW50ICkge1xuXG5cdFx0dmFyIG8gPSB0aGlzLm9wdGlvbnMsXG5cdFx0XHRoZWxwZXJJc0Z1bmN0aW9uID0gJC5pc0Z1bmN0aW9uKCBvLmhlbHBlciApLFxuXHRcdFx0aGVscGVyID0gaGVscGVySXNGdW5jdGlvbiA/XG5cdFx0XHRcdCQoIG8uaGVscGVyLmFwcGx5KCB0aGlzLmVsZW1lbnRbIDAgXSwgWyBldmVudCBdICkgKSA6XG5cdFx0XHRcdCggby5oZWxwZXIgPT09IFwiY2xvbmVcIiA/XG5cdFx0XHRcdFx0dGhpcy5lbGVtZW50LmNsb25lKCkucmVtb3ZlQXR0ciggXCJpZFwiICkgOlxuXHRcdFx0XHRcdHRoaXMuZWxlbWVudCApO1xuXG5cdFx0aWYgKCAhaGVscGVyLnBhcmVudHMoIFwiYm9keVwiICkubGVuZ3RoICkge1xuXHRcdFx0aGVscGVyLmFwcGVuZFRvKCAoIG8uYXBwZW5kVG8gPT09IFwicGFyZW50XCIgP1xuXHRcdFx0XHR0aGlzLmVsZW1lbnRbIDAgXS5wYXJlbnROb2RlIDpcblx0XHRcdFx0by5hcHBlbmRUbyApICk7XG5cdFx0fVxuXG5cdFx0Ly8gSHR0cDovL2J1Z3MuanF1ZXJ5dWkuY29tL3RpY2tldC85NDQ2XG5cdFx0Ly8gYSBoZWxwZXIgZnVuY3Rpb24gY2FuIHJldHVybiB0aGUgb3JpZ2luYWwgZWxlbWVudFxuXHRcdC8vIHdoaWNoIHdvdWxkbid0IGhhdmUgYmVlbiBzZXQgdG8gcmVsYXRpdmUgaW4gX2NyZWF0ZVxuXHRcdGlmICggaGVscGVySXNGdW5jdGlvbiAmJiBoZWxwZXJbIDAgXSA9PT0gdGhpcy5lbGVtZW50WyAwIF0gKSB7XG5cdFx0XHR0aGlzLl9zZXRQb3NpdGlvblJlbGF0aXZlKCk7XG5cdFx0fVxuXG5cdFx0aWYgKCBoZWxwZXJbIDAgXSAhPT0gdGhpcy5lbGVtZW50WyAwIF0gJiZcblx0XHRcdFx0ISggLyhmaXhlZHxhYnNvbHV0ZSkvICkudGVzdCggaGVscGVyLmNzcyggXCJwb3NpdGlvblwiICkgKSApIHtcblx0XHRcdGhlbHBlci5jc3MoIFwicG9zaXRpb25cIiwgXCJhYnNvbHV0ZVwiICk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGhlbHBlcjtcblxuXHR9LFxuXG5cdF9zZXRQb3NpdGlvblJlbGF0aXZlOiBmdW5jdGlvbigpIHtcblx0XHRpZiAoICEoIC9eKD86cnxhfGYpLyApLnRlc3QoIHRoaXMuZWxlbWVudC5jc3MoIFwicG9zaXRpb25cIiApICkgKSB7XG5cdFx0XHR0aGlzLmVsZW1lbnRbIDAgXS5zdHlsZS5wb3NpdGlvbiA9IFwicmVsYXRpdmVcIjtcblx0XHR9XG5cdH0sXG5cblx0X2FkanVzdE9mZnNldEZyb21IZWxwZXI6IGZ1bmN0aW9uKCBvYmogKSB7XG5cdFx0aWYgKCB0eXBlb2Ygb2JqID09PSBcInN0cmluZ1wiICkge1xuXHRcdFx0b2JqID0gb2JqLnNwbGl0KCBcIiBcIiApO1xuXHRcdH1cblx0XHRpZiAoICQuaXNBcnJheSggb2JqICkgKSB7XG5cdFx0XHRvYmogPSB7IGxlZnQ6ICtvYmpbIDAgXSwgdG9wOiArb2JqWyAxIF0gfHwgMCB9O1xuXHRcdH1cblx0XHRpZiAoIFwibGVmdFwiIGluIG9iaiApIHtcblx0XHRcdHRoaXMub2Zmc2V0LmNsaWNrLmxlZnQgPSBvYmoubGVmdCArIHRoaXMubWFyZ2lucy5sZWZ0O1xuXHRcdH1cblx0XHRpZiAoIFwicmlnaHRcIiBpbiBvYmogKSB7XG5cdFx0XHR0aGlzLm9mZnNldC5jbGljay5sZWZ0ID0gdGhpcy5oZWxwZXJQcm9wb3J0aW9ucy53aWR0aCAtIG9iai5yaWdodCArIHRoaXMubWFyZ2lucy5sZWZ0O1xuXHRcdH1cblx0XHRpZiAoIFwidG9wXCIgaW4gb2JqICkge1xuXHRcdFx0dGhpcy5vZmZzZXQuY2xpY2sudG9wID0gb2JqLnRvcCArIHRoaXMubWFyZ2lucy50b3A7XG5cdFx0fVxuXHRcdGlmICggXCJib3R0b21cIiBpbiBvYmogKSB7XG5cdFx0XHR0aGlzLm9mZnNldC5jbGljay50b3AgPSB0aGlzLmhlbHBlclByb3BvcnRpb25zLmhlaWdodCAtIG9iai5ib3R0b20gKyB0aGlzLm1hcmdpbnMudG9wO1xuXHRcdH1cblx0fSxcblxuXHRfaXNSb290Tm9kZTogZnVuY3Rpb24oIGVsZW1lbnQgKSB7XG5cdFx0cmV0dXJuICggLyhodG1sfGJvZHkpL2kgKS50ZXN0KCBlbGVtZW50LnRhZ05hbWUgKSB8fCBlbGVtZW50ID09PSB0aGlzLmRvY3VtZW50WyAwIF07XG5cdH0sXG5cblx0X2dldFBhcmVudE9mZnNldDogZnVuY3Rpb24oKSB7XG5cblx0XHQvL0dldCB0aGUgb2Zmc2V0UGFyZW50IGFuZCBjYWNoZSBpdHMgcG9zaXRpb25cblx0XHR2YXIgcG8gPSB0aGlzLm9mZnNldFBhcmVudC5vZmZzZXQoKSxcblx0XHRcdGRvY3VtZW50ID0gdGhpcy5kb2N1bWVudFsgMCBdO1xuXG5cdFx0Ly8gVGhpcyBpcyBhIHNwZWNpYWwgY2FzZSB3aGVyZSB3ZSBuZWVkIHRvIG1vZGlmeSBhIG9mZnNldCBjYWxjdWxhdGVkIG9uIHN0YXJ0LCBzaW5jZSB0aGVcblx0XHQvLyBmb2xsb3dpbmcgaGFwcGVuZWQ6XG5cdFx0Ly8gMS4gVGhlIHBvc2l0aW9uIG9mIHRoZSBoZWxwZXIgaXMgYWJzb2x1dGUsIHNvIGl0J3MgcG9zaXRpb24gaXMgY2FsY3VsYXRlZCBiYXNlZCBvbiB0aGVcblx0XHQvLyBuZXh0IHBvc2l0aW9uZWQgcGFyZW50XG5cdFx0Ly8gMi4gVGhlIGFjdHVhbCBvZmZzZXQgcGFyZW50IGlzIGEgY2hpbGQgb2YgdGhlIHNjcm9sbCBwYXJlbnQsIGFuZCB0aGUgc2Nyb2xsIHBhcmVudCBpc24ndFxuXHRcdC8vIHRoZSBkb2N1bWVudCwgd2hpY2ggbWVhbnMgdGhhdCB0aGUgc2Nyb2xsIGlzIGluY2x1ZGVkIGluIHRoZSBpbml0aWFsIGNhbGN1bGF0aW9uIG9mIHRoZVxuXHRcdC8vIG9mZnNldCBvZiB0aGUgcGFyZW50LCBhbmQgbmV2ZXIgcmVjYWxjdWxhdGVkIHVwb24gZHJhZ1xuXHRcdGlmICggdGhpcy5jc3NQb3NpdGlvbiA9PT0gXCJhYnNvbHV0ZVwiICYmIHRoaXMuc2Nyb2xsUGFyZW50WyAwIF0gIT09IGRvY3VtZW50ICYmXG5cdFx0XHRcdCQuY29udGFpbnMoIHRoaXMuc2Nyb2xsUGFyZW50WyAwIF0sIHRoaXMub2Zmc2V0UGFyZW50WyAwIF0gKSApIHtcblx0XHRcdHBvLmxlZnQgKz0gdGhpcy5zY3JvbGxQYXJlbnQuc2Nyb2xsTGVmdCgpO1xuXHRcdFx0cG8udG9wICs9IHRoaXMuc2Nyb2xsUGFyZW50LnNjcm9sbFRvcCgpO1xuXHRcdH1cblxuXHRcdGlmICggdGhpcy5faXNSb290Tm9kZSggdGhpcy5vZmZzZXRQYXJlbnRbIDAgXSApICkge1xuXHRcdFx0cG8gPSB7IHRvcDogMCwgbGVmdDogMCB9O1xuXHRcdH1cblxuXHRcdHJldHVybiB7XG5cdFx0XHR0b3A6IHBvLnRvcCArICggcGFyc2VJbnQoIHRoaXMub2Zmc2V0UGFyZW50LmNzcyggXCJib3JkZXJUb3BXaWR0aFwiICksIDEwICkgfHwgMCApLFxuXHRcdFx0bGVmdDogcG8ubGVmdCArICggcGFyc2VJbnQoIHRoaXMub2Zmc2V0UGFyZW50LmNzcyggXCJib3JkZXJMZWZ0V2lkdGhcIiApLCAxMCApIHx8IDAgKVxuXHRcdH07XG5cblx0fSxcblxuXHRfZ2V0UmVsYXRpdmVPZmZzZXQ6IGZ1bmN0aW9uKCkge1xuXHRcdGlmICggdGhpcy5jc3NQb3NpdGlvbiAhPT0gXCJyZWxhdGl2ZVwiICkge1xuXHRcdFx0cmV0dXJuIHsgdG9wOiAwLCBsZWZ0OiAwIH07XG5cdFx0fVxuXG5cdFx0dmFyIHAgPSB0aGlzLmVsZW1lbnQucG9zaXRpb24oKSxcblx0XHRcdHNjcm9sbElzUm9vdE5vZGUgPSB0aGlzLl9pc1Jvb3ROb2RlKCB0aGlzLnNjcm9sbFBhcmVudFsgMCBdICk7XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0dG9wOiBwLnRvcCAtICggcGFyc2VJbnQoIHRoaXMuaGVscGVyLmNzcyggXCJ0b3BcIiApLCAxMCApIHx8IDAgKSArXG5cdFx0XHRcdCggIXNjcm9sbElzUm9vdE5vZGUgPyB0aGlzLnNjcm9sbFBhcmVudC5zY3JvbGxUb3AoKSA6IDAgKSxcblx0XHRcdGxlZnQ6IHAubGVmdCAtICggcGFyc2VJbnQoIHRoaXMuaGVscGVyLmNzcyggXCJsZWZ0XCIgKSwgMTAgKSB8fCAwICkgK1xuXHRcdFx0XHQoICFzY3JvbGxJc1Jvb3ROb2RlID8gdGhpcy5zY3JvbGxQYXJlbnQuc2Nyb2xsTGVmdCgpIDogMCApXG5cdFx0fTtcblxuXHR9LFxuXG5cdF9jYWNoZU1hcmdpbnM6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMubWFyZ2lucyA9IHtcblx0XHRcdGxlZnQ6ICggcGFyc2VJbnQoIHRoaXMuZWxlbWVudC5jc3MoIFwibWFyZ2luTGVmdFwiICksIDEwICkgfHwgMCApLFxuXHRcdFx0dG9wOiAoIHBhcnNlSW50KCB0aGlzLmVsZW1lbnQuY3NzKCBcIm1hcmdpblRvcFwiICksIDEwICkgfHwgMCApLFxuXHRcdFx0cmlnaHQ6ICggcGFyc2VJbnQoIHRoaXMuZWxlbWVudC5jc3MoIFwibWFyZ2luUmlnaHRcIiApLCAxMCApIHx8IDAgKSxcblx0XHRcdGJvdHRvbTogKCBwYXJzZUludCggdGhpcy5lbGVtZW50LmNzcyggXCJtYXJnaW5Cb3R0b21cIiApLCAxMCApIHx8IDAgKVxuXHRcdH07XG5cdH0sXG5cblx0X2NhY2hlSGVscGVyUHJvcG9ydGlvbnM6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuaGVscGVyUHJvcG9ydGlvbnMgPSB7XG5cdFx0XHR3aWR0aDogdGhpcy5oZWxwZXIub3V0ZXJXaWR0aCgpLFxuXHRcdFx0aGVpZ2h0OiB0aGlzLmhlbHBlci5vdXRlckhlaWdodCgpXG5cdFx0fTtcblx0fSxcblxuXHRfc2V0Q29udGFpbm1lbnQ6IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIGlzVXNlclNjcm9sbGFibGUsIGMsIGNlLFxuXHRcdFx0byA9IHRoaXMub3B0aW9ucyxcblx0XHRcdGRvY3VtZW50ID0gdGhpcy5kb2N1bWVudFsgMCBdO1xuXG5cdFx0dGhpcy5yZWxhdGl2ZUNvbnRhaW5lciA9IG51bGw7XG5cblx0XHRpZiAoICFvLmNvbnRhaW5tZW50ICkge1xuXHRcdFx0dGhpcy5jb250YWlubWVudCA9IG51bGw7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0aWYgKCBvLmNvbnRhaW5tZW50ID09PSBcIndpbmRvd1wiICkge1xuXHRcdFx0dGhpcy5jb250YWlubWVudCA9IFtcblx0XHRcdFx0JCggd2luZG93ICkuc2Nyb2xsTGVmdCgpIC0gdGhpcy5vZmZzZXQucmVsYXRpdmUubGVmdCAtIHRoaXMub2Zmc2V0LnBhcmVudC5sZWZ0LFxuXHRcdFx0XHQkKCB3aW5kb3cgKS5zY3JvbGxUb3AoKSAtIHRoaXMub2Zmc2V0LnJlbGF0aXZlLnRvcCAtIHRoaXMub2Zmc2V0LnBhcmVudC50b3AsXG5cdFx0XHRcdCQoIHdpbmRvdyApLnNjcm9sbExlZnQoKSArICQoIHdpbmRvdyApLndpZHRoKCkgLVxuXHRcdFx0XHRcdHRoaXMuaGVscGVyUHJvcG9ydGlvbnMud2lkdGggLSB0aGlzLm1hcmdpbnMubGVmdCxcblx0XHRcdFx0JCggd2luZG93ICkuc2Nyb2xsVG9wKCkgK1xuXHRcdFx0XHRcdCggJCggd2luZG93ICkuaGVpZ2h0KCkgfHwgZG9jdW1lbnQuYm9keS5wYXJlbnROb2RlLnNjcm9sbEhlaWdodCApIC1cblx0XHRcdFx0XHR0aGlzLmhlbHBlclByb3BvcnRpb25zLmhlaWdodCAtIHRoaXMubWFyZ2lucy50b3Bcblx0XHRcdF07XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0aWYgKCBvLmNvbnRhaW5tZW50ID09PSBcImRvY3VtZW50XCIgKSB7XG5cdFx0XHR0aGlzLmNvbnRhaW5tZW50ID0gW1xuXHRcdFx0XHQwLFxuXHRcdFx0XHQwLFxuXHRcdFx0XHQkKCBkb2N1bWVudCApLndpZHRoKCkgLSB0aGlzLmhlbHBlclByb3BvcnRpb25zLndpZHRoIC0gdGhpcy5tYXJnaW5zLmxlZnQsXG5cdFx0XHRcdCggJCggZG9jdW1lbnQgKS5oZWlnaHQoKSB8fCBkb2N1bWVudC5ib2R5LnBhcmVudE5vZGUuc2Nyb2xsSGVpZ2h0ICkgLVxuXHRcdFx0XHRcdHRoaXMuaGVscGVyUHJvcG9ydGlvbnMuaGVpZ2h0IC0gdGhpcy5tYXJnaW5zLnRvcFxuXHRcdFx0XTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRpZiAoIG8uY29udGFpbm1lbnQuY29uc3RydWN0b3IgPT09IEFycmF5ICkge1xuXHRcdFx0dGhpcy5jb250YWlubWVudCA9IG8uY29udGFpbm1lbnQ7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0aWYgKCBvLmNvbnRhaW5tZW50ID09PSBcInBhcmVudFwiICkge1xuXHRcdFx0by5jb250YWlubWVudCA9IHRoaXMuaGVscGVyWyAwIF0ucGFyZW50Tm9kZTtcblx0XHR9XG5cblx0XHRjID0gJCggby5jb250YWlubWVudCApO1xuXHRcdGNlID0gY1sgMCBdO1xuXG5cdFx0aWYgKCAhY2UgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0aXNVc2VyU2Nyb2xsYWJsZSA9IC8oc2Nyb2xsfGF1dG8pLy50ZXN0KCBjLmNzcyggXCJvdmVyZmxvd1wiICkgKTtcblxuXHRcdHRoaXMuY29udGFpbm1lbnQgPSBbXG5cdFx0XHQoIHBhcnNlSW50KCBjLmNzcyggXCJib3JkZXJMZWZ0V2lkdGhcIiApLCAxMCApIHx8IDAgKSArXG5cdFx0XHRcdCggcGFyc2VJbnQoIGMuY3NzKCBcInBhZGRpbmdMZWZ0XCIgKSwgMTAgKSB8fCAwICksXG5cdFx0XHQoIHBhcnNlSW50KCBjLmNzcyggXCJib3JkZXJUb3BXaWR0aFwiICksIDEwICkgfHwgMCApICtcblx0XHRcdFx0KCBwYXJzZUludCggYy5jc3MoIFwicGFkZGluZ1RvcFwiICksIDEwICkgfHwgMCApLFxuXHRcdFx0KCBpc1VzZXJTY3JvbGxhYmxlID8gTWF0aC5tYXgoIGNlLnNjcm9sbFdpZHRoLCBjZS5vZmZzZXRXaWR0aCApIDogY2Uub2Zmc2V0V2lkdGggKSAtXG5cdFx0XHRcdCggcGFyc2VJbnQoIGMuY3NzKCBcImJvcmRlclJpZ2h0V2lkdGhcIiApLCAxMCApIHx8IDAgKSAtXG5cdFx0XHRcdCggcGFyc2VJbnQoIGMuY3NzKCBcInBhZGRpbmdSaWdodFwiICksIDEwICkgfHwgMCApIC1cblx0XHRcdFx0dGhpcy5oZWxwZXJQcm9wb3J0aW9ucy53aWR0aCAtXG5cdFx0XHRcdHRoaXMubWFyZ2lucy5sZWZ0IC1cblx0XHRcdFx0dGhpcy5tYXJnaW5zLnJpZ2h0LFxuXHRcdFx0KCBpc1VzZXJTY3JvbGxhYmxlID8gTWF0aC5tYXgoIGNlLnNjcm9sbEhlaWdodCwgY2Uub2Zmc2V0SGVpZ2h0ICkgOiBjZS5vZmZzZXRIZWlnaHQgKSAtXG5cdFx0XHRcdCggcGFyc2VJbnQoIGMuY3NzKCBcImJvcmRlckJvdHRvbVdpZHRoXCIgKSwgMTAgKSB8fCAwICkgLVxuXHRcdFx0XHQoIHBhcnNlSW50KCBjLmNzcyggXCJwYWRkaW5nQm90dG9tXCIgKSwgMTAgKSB8fCAwICkgLVxuXHRcdFx0XHR0aGlzLmhlbHBlclByb3BvcnRpb25zLmhlaWdodCAtXG5cdFx0XHRcdHRoaXMubWFyZ2lucy50b3AgLVxuXHRcdFx0XHR0aGlzLm1hcmdpbnMuYm90dG9tXG5cdFx0XTtcblx0XHR0aGlzLnJlbGF0aXZlQ29udGFpbmVyID0gYztcblx0fSxcblxuXHRfY29udmVydFBvc2l0aW9uVG86IGZ1bmN0aW9uKCBkLCBwb3MgKSB7XG5cblx0XHRpZiAoICFwb3MgKSB7XG5cdFx0XHRwb3MgPSB0aGlzLnBvc2l0aW9uO1xuXHRcdH1cblxuXHRcdHZhciBtb2QgPSBkID09PSBcImFic29sdXRlXCIgPyAxIDogLTEsXG5cdFx0XHRzY3JvbGxJc1Jvb3ROb2RlID0gdGhpcy5faXNSb290Tm9kZSggdGhpcy5zY3JvbGxQYXJlbnRbIDAgXSApO1xuXG5cdFx0cmV0dXJuIHtcblx0XHRcdHRvcDogKFxuXG5cdFx0XHRcdC8vIFRoZSBhYnNvbHV0ZSBtb3VzZSBwb3NpdGlvblxuXHRcdFx0XHRwb3MudG9wXHQrXG5cblx0XHRcdFx0Ly8gT25seSBmb3IgcmVsYXRpdmUgcG9zaXRpb25lZCBub2RlczogUmVsYXRpdmUgb2Zmc2V0IGZyb20gZWxlbWVudCB0byBvZmZzZXQgcGFyZW50XG5cdFx0XHRcdHRoaXMub2Zmc2V0LnJlbGF0aXZlLnRvcCAqIG1vZCArXG5cblx0XHRcdFx0Ly8gVGhlIG9mZnNldFBhcmVudCdzIG9mZnNldCB3aXRob3V0IGJvcmRlcnMgKG9mZnNldCArIGJvcmRlcilcblx0XHRcdFx0dGhpcy5vZmZzZXQucGFyZW50LnRvcCAqIG1vZCAtXG5cdFx0XHRcdCggKCB0aGlzLmNzc1Bvc2l0aW9uID09PSBcImZpeGVkXCIgP1xuXHRcdFx0XHRcdC10aGlzLm9mZnNldC5zY3JvbGwudG9wIDpcblx0XHRcdFx0XHQoIHNjcm9sbElzUm9vdE5vZGUgPyAwIDogdGhpcy5vZmZzZXQuc2Nyb2xsLnRvcCApICkgKiBtb2QgKVxuXHRcdFx0KSxcblx0XHRcdGxlZnQ6IChcblxuXHRcdFx0XHQvLyBUaGUgYWJzb2x1dGUgbW91c2UgcG9zaXRpb25cblx0XHRcdFx0cG9zLmxlZnQgK1xuXG5cdFx0XHRcdC8vIE9ubHkgZm9yIHJlbGF0aXZlIHBvc2l0aW9uZWQgbm9kZXM6IFJlbGF0aXZlIG9mZnNldCBmcm9tIGVsZW1lbnQgdG8gb2Zmc2V0IHBhcmVudFxuXHRcdFx0XHR0aGlzLm9mZnNldC5yZWxhdGl2ZS5sZWZ0ICogbW9kICtcblxuXHRcdFx0XHQvLyBUaGUgb2Zmc2V0UGFyZW50J3Mgb2Zmc2V0IHdpdGhvdXQgYm9yZGVycyAob2Zmc2V0ICsgYm9yZGVyKVxuXHRcdFx0XHR0aGlzLm9mZnNldC5wYXJlbnQubGVmdCAqIG1vZFx0LVxuXHRcdFx0XHQoICggdGhpcy5jc3NQb3NpdGlvbiA9PT0gXCJmaXhlZFwiID9cblx0XHRcdFx0XHQtdGhpcy5vZmZzZXQuc2Nyb2xsLmxlZnQgOlxuXHRcdFx0XHRcdCggc2Nyb2xsSXNSb290Tm9kZSA/IDAgOiB0aGlzLm9mZnNldC5zY3JvbGwubGVmdCApICkgKiBtb2QgKVxuXHRcdFx0KVxuXHRcdH07XG5cblx0fSxcblxuXHRfZ2VuZXJhdGVQb3NpdGlvbjogZnVuY3Rpb24oIGV2ZW50LCBjb25zdHJhaW5Qb3NpdGlvbiApIHtcblxuXHRcdHZhciBjb250YWlubWVudCwgY28sIHRvcCwgbGVmdCxcblx0XHRcdG8gPSB0aGlzLm9wdGlvbnMsXG5cdFx0XHRzY3JvbGxJc1Jvb3ROb2RlID0gdGhpcy5faXNSb290Tm9kZSggdGhpcy5zY3JvbGxQYXJlbnRbIDAgXSApLFxuXHRcdFx0cGFnZVggPSBldmVudC5wYWdlWCxcblx0XHRcdHBhZ2VZID0gZXZlbnQucGFnZVk7XG5cblx0XHQvLyBDYWNoZSB0aGUgc2Nyb2xsXG5cdFx0aWYgKCAhc2Nyb2xsSXNSb290Tm9kZSB8fCAhdGhpcy5vZmZzZXQuc2Nyb2xsICkge1xuXHRcdFx0dGhpcy5vZmZzZXQuc2Nyb2xsID0ge1xuXHRcdFx0XHR0b3A6IHRoaXMuc2Nyb2xsUGFyZW50LnNjcm9sbFRvcCgpLFxuXHRcdFx0XHRsZWZ0OiB0aGlzLnNjcm9sbFBhcmVudC5zY3JvbGxMZWZ0KClcblx0XHRcdH07XG5cdFx0fVxuXG5cdFx0Lypcblx0XHQgKiAtIFBvc2l0aW9uIGNvbnN0cmFpbmluZyAtXG5cdFx0ICogQ29uc3RyYWluIHRoZSBwb3NpdGlvbiB0byBhIG1peCBvZiBncmlkLCBjb250YWlubWVudC5cblx0XHQgKi9cblxuXHRcdC8vIElmIHdlIGFyZSBub3QgZHJhZ2dpbmcgeWV0LCB3ZSB3b24ndCBjaGVjayBmb3Igb3B0aW9uc1xuXHRcdGlmICggY29uc3RyYWluUG9zaXRpb24gKSB7XG5cdFx0XHRpZiAoIHRoaXMuY29udGFpbm1lbnQgKSB7XG5cdFx0XHRcdGlmICggdGhpcy5yZWxhdGl2ZUNvbnRhaW5lciApIHtcblx0XHRcdFx0XHRjbyA9IHRoaXMucmVsYXRpdmVDb250YWluZXIub2Zmc2V0KCk7XG5cdFx0XHRcdFx0Y29udGFpbm1lbnQgPSBbXG5cdFx0XHRcdFx0XHR0aGlzLmNvbnRhaW5tZW50WyAwIF0gKyBjby5sZWZ0LFxuXHRcdFx0XHRcdFx0dGhpcy5jb250YWlubWVudFsgMSBdICsgY28udG9wLFxuXHRcdFx0XHRcdFx0dGhpcy5jb250YWlubWVudFsgMiBdICsgY28ubGVmdCxcblx0XHRcdFx0XHRcdHRoaXMuY29udGFpbm1lbnRbIDMgXSArIGNvLnRvcFxuXHRcdFx0XHRcdF07XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Y29udGFpbm1lbnQgPSB0aGlzLmNvbnRhaW5tZW50O1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKCBldmVudC5wYWdlWCAtIHRoaXMub2Zmc2V0LmNsaWNrLmxlZnQgPCBjb250YWlubWVudFsgMCBdICkge1xuXHRcdFx0XHRcdHBhZ2VYID0gY29udGFpbm1lbnRbIDAgXSArIHRoaXMub2Zmc2V0LmNsaWNrLmxlZnQ7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKCBldmVudC5wYWdlWSAtIHRoaXMub2Zmc2V0LmNsaWNrLnRvcCA8IGNvbnRhaW5tZW50WyAxIF0gKSB7XG5cdFx0XHRcdFx0cGFnZVkgPSBjb250YWlubWVudFsgMSBdICsgdGhpcy5vZmZzZXQuY2xpY2sudG9wO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmICggZXZlbnQucGFnZVggLSB0aGlzLm9mZnNldC5jbGljay5sZWZ0ID4gY29udGFpbm1lbnRbIDIgXSApIHtcblx0XHRcdFx0XHRwYWdlWCA9IGNvbnRhaW5tZW50WyAyIF0gKyB0aGlzLm9mZnNldC5jbGljay5sZWZ0O1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmICggZXZlbnQucGFnZVkgLSB0aGlzLm9mZnNldC5jbGljay50b3AgPiBjb250YWlubWVudFsgMyBdICkge1xuXHRcdFx0XHRcdHBhZ2VZID0gY29udGFpbm1lbnRbIDMgXSArIHRoaXMub2Zmc2V0LmNsaWNrLnRvcDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIG8uZ3JpZCApIHtcblxuXHRcdFx0XHQvL0NoZWNrIGZvciBncmlkIGVsZW1lbnRzIHNldCB0byAwIHRvIHByZXZlbnQgZGl2aWRlIGJ5IDAgZXJyb3IgY2F1c2luZyBpbnZhbGlkXG5cdFx0XHRcdC8vIGFyZ3VtZW50IGVycm9ycyBpbiBJRSAoc2VlIHRpY2tldCAjNjk1MClcblx0XHRcdFx0dG9wID0gby5ncmlkWyAxIF0gPyB0aGlzLm9yaWdpbmFsUGFnZVkgKyBNYXRoLnJvdW5kKCAoIHBhZ2VZIC1cblx0XHRcdFx0XHR0aGlzLm9yaWdpbmFsUGFnZVkgKSAvIG8uZ3JpZFsgMSBdICkgKiBvLmdyaWRbIDEgXSA6IHRoaXMub3JpZ2luYWxQYWdlWTtcblx0XHRcdFx0cGFnZVkgPSBjb250YWlubWVudCA/ICggKCB0b3AgLSB0aGlzLm9mZnNldC5jbGljay50b3AgPj0gY29udGFpbm1lbnRbIDEgXSB8fFxuXHRcdFx0XHRcdHRvcCAtIHRoaXMub2Zmc2V0LmNsaWNrLnRvcCA+IGNvbnRhaW5tZW50WyAzIF0gKSA/XG5cdFx0XHRcdFx0XHR0b3AgOlxuXHRcdFx0XHRcdFx0KCAoIHRvcCAtIHRoaXMub2Zmc2V0LmNsaWNrLnRvcCA+PSBjb250YWlubWVudFsgMSBdICkgP1xuXHRcdFx0XHRcdFx0XHR0b3AgLSBvLmdyaWRbIDEgXSA6IHRvcCArIG8uZ3JpZFsgMSBdICkgKSA6IHRvcDtcblxuXHRcdFx0XHRsZWZ0ID0gby5ncmlkWyAwIF0gPyB0aGlzLm9yaWdpbmFsUGFnZVggK1xuXHRcdFx0XHRcdE1hdGgucm91bmQoICggcGFnZVggLSB0aGlzLm9yaWdpbmFsUGFnZVggKSAvIG8uZ3JpZFsgMCBdICkgKiBvLmdyaWRbIDAgXSA6XG5cdFx0XHRcdFx0dGhpcy5vcmlnaW5hbFBhZ2VYO1xuXHRcdFx0XHRwYWdlWCA9IGNvbnRhaW5tZW50ID8gKCAoIGxlZnQgLSB0aGlzLm9mZnNldC5jbGljay5sZWZ0ID49IGNvbnRhaW5tZW50WyAwIF0gfHxcblx0XHRcdFx0XHRsZWZ0IC0gdGhpcy5vZmZzZXQuY2xpY2subGVmdCA+IGNvbnRhaW5tZW50WyAyIF0gKSA/XG5cdFx0XHRcdFx0XHRsZWZ0IDpcblx0XHRcdFx0XHRcdCggKCBsZWZ0IC0gdGhpcy5vZmZzZXQuY2xpY2subGVmdCA+PSBjb250YWlubWVudFsgMCBdICkgP1xuXHRcdFx0XHRcdFx0XHRsZWZ0IC0gby5ncmlkWyAwIF0gOiBsZWZ0ICsgby5ncmlkWyAwIF0gKSApIDogbGVmdDtcblx0XHRcdH1cblxuXHRcdFx0aWYgKCBvLmF4aXMgPT09IFwieVwiICkge1xuXHRcdFx0XHRwYWdlWCA9IHRoaXMub3JpZ2luYWxQYWdlWDtcblx0XHRcdH1cblxuXHRcdFx0aWYgKCBvLmF4aXMgPT09IFwieFwiICkge1xuXHRcdFx0XHRwYWdlWSA9IHRoaXMub3JpZ2luYWxQYWdlWTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0dG9wOiAoXG5cblx0XHRcdFx0Ly8gVGhlIGFic29sdXRlIG1vdXNlIHBvc2l0aW9uXG5cdFx0XHRcdHBhZ2VZIC1cblxuXHRcdFx0XHQvLyBDbGljayBvZmZzZXQgKHJlbGF0aXZlIHRvIHRoZSBlbGVtZW50KVxuXHRcdFx0XHR0aGlzLm9mZnNldC5jbGljay50b3AgLVxuXG5cdFx0XHRcdC8vIE9ubHkgZm9yIHJlbGF0aXZlIHBvc2l0aW9uZWQgbm9kZXM6IFJlbGF0aXZlIG9mZnNldCBmcm9tIGVsZW1lbnQgdG8gb2Zmc2V0IHBhcmVudFxuXHRcdFx0XHR0aGlzLm9mZnNldC5yZWxhdGl2ZS50b3AgLVxuXG5cdFx0XHRcdC8vIFRoZSBvZmZzZXRQYXJlbnQncyBvZmZzZXQgd2l0aG91dCBib3JkZXJzIChvZmZzZXQgKyBib3JkZXIpXG5cdFx0XHRcdHRoaXMub2Zmc2V0LnBhcmVudC50b3AgK1xuXHRcdFx0XHQoIHRoaXMuY3NzUG9zaXRpb24gPT09IFwiZml4ZWRcIiA/XG5cdFx0XHRcdFx0LXRoaXMub2Zmc2V0LnNjcm9sbC50b3AgOlxuXHRcdFx0XHRcdCggc2Nyb2xsSXNSb290Tm9kZSA/IDAgOiB0aGlzLm9mZnNldC5zY3JvbGwudG9wICkgKVxuXHRcdFx0KSxcblx0XHRcdGxlZnQ6IChcblxuXHRcdFx0XHQvLyBUaGUgYWJzb2x1dGUgbW91c2UgcG9zaXRpb25cblx0XHRcdFx0cGFnZVggLVxuXG5cdFx0XHRcdC8vIENsaWNrIG9mZnNldCAocmVsYXRpdmUgdG8gdGhlIGVsZW1lbnQpXG5cdFx0XHRcdHRoaXMub2Zmc2V0LmNsaWNrLmxlZnQgLVxuXG5cdFx0XHRcdC8vIE9ubHkgZm9yIHJlbGF0aXZlIHBvc2l0aW9uZWQgbm9kZXM6IFJlbGF0aXZlIG9mZnNldCBmcm9tIGVsZW1lbnQgdG8gb2Zmc2V0IHBhcmVudFxuXHRcdFx0XHR0aGlzLm9mZnNldC5yZWxhdGl2ZS5sZWZ0IC1cblxuXHRcdFx0XHQvLyBUaGUgb2Zmc2V0UGFyZW50J3Mgb2Zmc2V0IHdpdGhvdXQgYm9yZGVycyAob2Zmc2V0ICsgYm9yZGVyKVxuXHRcdFx0XHR0aGlzLm9mZnNldC5wYXJlbnQubGVmdCArXG5cdFx0XHRcdCggdGhpcy5jc3NQb3NpdGlvbiA9PT0gXCJmaXhlZFwiID9cblx0XHRcdFx0XHQtdGhpcy5vZmZzZXQuc2Nyb2xsLmxlZnQgOlxuXHRcdFx0XHRcdCggc2Nyb2xsSXNSb290Tm9kZSA/IDAgOiB0aGlzLm9mZnNldC5zY3JvbGwubGVmdCApIClcblx0XHRcdClcblx0XHR9O1xuXG5cdH0sXG5cblx0X2NsZWFyOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLl9yZW1vdmVDbGFzcyggdGhpcy5oZWxwZXIsIFwidWktZHJhZ2dhYmxlLWRyYWdnaW5nXCIgKTtcblx0XHRpZiAoIHRoaXMuaGVscGVyWyAwIF0gIT09IHRoaXMuZWxlbWVudFsgMCBdICYmICF0aGlzLmNhbmNlbEhlbHBlclJlbW92YWwgKSB7XG5cdFx0XHR0aGlzLmhlbHBlci5yZW1vdmUoKTtcblx0XHR9XG5cdFx0dGhpcy5oZWxwZXIgPSBudWxsO1xuXHRcdHRoaXMuY2FuY2VsSGVscGVyUmVtb3ZhbCA9IGZhbHNlO1xuXHRcdGlmICggdGhpcy5kZXN0cm95T25DbGVhciApIHtcblx0XHRcdHRoaXMuZGVzdHJveSgpO1xuXHRcdH1cblx0fSxcblxuXHQvLyBGcm9tIG5vdyBvbiBidWxrIHN0dWZmIC0gbWFpbmx5IGhlbHBlcnNcblxuXHRfdHJpZ2dlcjogZnVuY3Rpb24oIHR5cGUsIGV2ZW50LCB1aSApIHtcblx0XHR1aSA9IHVpIHx8IHRoaXMuX3VpSGFzaCgpO1xuXHRcdCQudWkucGx1Z2luLmNhbGwoIHRoaXMsIHR5cGUsIFsgZXZlbnQsIHVpLCB0aGlzIF0sIHRydWUgKTtcblxuXHRcdC8vIEFic29sdXRlIHBvc2l0aW9uIGFuZCBvZmZzZXQgKHNlZSAjNjg4NCApIGhhdmUgdG8gYmUgcmVjYWxjdWxhdGVkIGFmdGVyIHBsdWdpbnNcblx0XHRpZiAoIC9eKGRyYWd8c3RhcnR8c3RvcCkvLnRlc3QoIHR5cGUgKSApIHtcblx0XHRcdHRoaXMucG9zaXRpb25BYnMgPSB0aGlzLl9jb252ZXJ0UG9zaXRpb25UbyggXCJhYnNvbHV0ZVwiICk7XG5cdFx0XHR1aS5vZmZzZXQgPSB0aGlzLnBvc2l0aW9uQWJzO1xuXHRcdH1cblx0XHRyZXR1cm4gJC5XaWRnZXQucHJvdG90eXBlLl90cmlnZ2VyLmNhbGwoIHRoaXMsIHR5cGUsIGV2ZW50LCB1aSApO1xuXHR9LFxuXG5cdHBsdWdpbnM6IHt9LFxuXG5cdF91aUhhc2g6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRoZWxwZXI6IHRoaXMuaGVscGVyLFxuXHRcdFx0cG9zaXRpb246IHRoaXMucG9zaXRpb24sXG5cdFx0XHRvcmlnaW5hbFBvc2l0aW9uOiB0aGlzLm9yaWdpbmFsUG9zaXRpb24sXG5cdFx0XHRvZmZzZXQ6IHRoaXMucG9zaXRpb25BYnNcblx0XHR9O1xuXHR9XG5cbn0gKTtcblxuJC51aS5wbHVnaW4uYWRkKCBcImRyYWdnYWJsZVwiLCBcImNvbm5lY3RUb1NvcnRhYmxlXCIsIHtcblx0c3RhcnQ6IGZ1bmN0aW9uKCBldmVudCwgdWksIGRyYWdnYWJsZSApIHtcblx0XHR2YXIgdWlTb3J0YWJsZSA9ICQuZXh0ZW5kKCB7fSwgdWksIHtcblx0XHRcdGl0ZW06IGRyYWdnYWJsZS5lbGVtZW50XG5cdFx0fSApO1xuXG5cdFx0ZHJhZ2dhYmxlLnNvcnRhYmxlcyA9IFtdO1xuXHRcdCQoIGRyYWdnYWJsZS5vcHRpb25zLmNvbm5lY3RUb1NvcnRhYmxlICkuZWFjaCggZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgc29ydGFibGUgPSAkKCB0aGlzICkuc29ydGFibGUoIFwiaW5zdGFuY2VcIiApO1xuXG5cdFx0XHRpZiAoIHNvcnRhYmxlICYmICFzb3J0YWJsZS5vcHRpb25zLmRpc2FibGVkICkge1xuXHRcdFx0XHRkcmFnZ2FibGUuc29ydGFibGVzLnB1c2goIHNvcnRhYmxlICk7XG5cblx0XHRcdFx0Ly8gUmVmcmVzaFBvc2l0aW9ucyBpcyBjYWxsZWQgYXQgZHJhZyBzdGFydCB0byByZWZyZXNoIHRoZSBjb250YWluZXJDYWNoZVxuXHRcdFx0XHQvLyB3aGljaCBpcyB1c2VkIGluIGRyYWcuIFRoaXMgZW5zdXJlcyBpdCdzIGluaXRpYWxpemVkIGFuZCBzeW5jaHJvbml6ZWRcblx0XHRcdFx0Ly8gd2l0aCBhbnkgY2hhbmdlcyB0aGF0IG1pZ2h0IGhhdmUgaGFwcGVuZWQgb24gdGhlIHBhZ2Ugc2luY2UgaW5pdGlhbGl6YXRpb24uXG5cdFx0XHRcdHNvcnRhYmxlLnJlZnJlc2hQb3NpdGlvbnMoKTtcblx0XHRcdFx0c29ydGFibGUuX3RyaWdnZXIoIFwiYWN0aXZhdGVcIiwgZXZlbnQsIHVpU29ydGFibGUgKTtcblx0XHRcdH1cblx0XHR9ICk7XG5cdH0sXG5cdHN0b3A6IGZ1bmN0aW9uKCBldmVudCwgdWksIGRyYWdnYWJsZSApIHtcblx0XHR2YXIgdWlTb3J0YWJsZSA9ICQuZXh0ZW5kKCB7fSwgdWksIHtcblx0XHRcdGl0ZW06IGRyYWdnYWJsZS5lbGVtZW50XG5cdFx0fSApO1xuXG5cdFx0ZHJhZ2dhYmxlLmNhbmNlbEhlbHBlclJlbW92YWwgPSBmYWxzZTtcblxuXHRcdCQuZWFjaCggZHJhZ2dhYmxlLnNvcnRhYmxlcywgZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgc29ydGFibGUgPSB0aGlzO1xuXG5cdFx0XHRpZiAoIHNvcnRhYmxlLmlzT3ZlciApIHtcblx0XHRcdFx0c29ydGFibGUuaXNPdmVyID0gMDtcblxuXHRcdFx0XHQvLyBBbGxvdyB0aGlzIHNvcnRhYmxlIHRvIGhhbmRsZSByZW1vdmluZyB0aGUgaGVscGVyXG5cdFx0XHRcdGRyYWdnYWJsZS5jYW5jZWxIZWxwZXJSZW1vdmFsID0gdHJ1ZTtcblx0XHRcdFx0c29ydGFibGUuY2FuY2VsSGVscGVyUmVtb3ZhbCA9IGZhbHNlO1xuXG5cdFx0XHRcdC8vIFVzZSBfc3RvcmVkQ1NTIFRvIHJlc3RvcmUgcHJvcGVydGllcyBpbiB0aGUgc29ydGFibGUsXG5cdFx0XHRcdC8vIGFzIHRoaXMgYWxzbyBoYW5kbGVzIHJldmVydCAoIzk2NzUpIHNpbmNlIHRoZSBkcmFnZ2FibGVcblx0XHRcdFx0Ly8gbWF5IGhhdmUgbW9kaWZpZWQgdGhlbSBpbiB1bmV4cGVjdGVkIHdheXMgKCM4ODA5KVxuXHRcdFx0XHRzb3J0YWJsZS5fc3RvcmVkQ1NTID0ge1xuXHRcdFx0XHRcdHBvc2l0aW9uOiBzb3J0YWJsZS5wbGFjZWhvbGRlci5jc3MoIFwicG9zaXRpb25cIiApLFxuXHRcdFx0XHRcdHRvcDogc29ydGFibGUucGxhY2Vob2xkZXIuY3NzKCBcInRvcFwiICksXG5cdFx0XHRcdFx0bGVmdDogc29ydGFibGUucGxhY2Vob2xkZXIuY3NzKCBcImxlZnRcIiApXG5cdFx0XHRcdH07XG5cblx0XHRcdFx0c29ydGFibGUuX21vdXNlU3RvcCggZXZlbnQgKTtcblxuXHRcdFx0XHQvLyBPbmNlIGRyYWcgaGFzIGVuZGVkLCB0aGUgc29ydGFibGUgc2hvdWxkIHJldHVybiB0byB1c2luZ1xuXHRcdFx0XHQvLyBpdHMgb3JpZ2luYWwgaGVscGVyLCBub3QgdGhlIHNoYXJlZCBoZWxwZXIgZnJvbSBkcmFnZ2FibGVcblx0XHRcdFx0c29ydGFibGUub3B0aW9ucy5oZWxwZXIgPSBzb3J0YWJsZS5vcHRpb25zLl9oZWxwZXI7XG5cdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdC8vIFByZXZlbnQgdGhpcyBTb3J0YWJsZSBmcm9tIHJlbW92aW5nIHRoZSBoZWxwZXIuXG5cdFx0XHRcdC8vIEhvd2V2ZXIsIGRvbid0IHNldCB0aGUgZHJhZ2dhYmxlIHRvIHJlbW92ZSB0aGUgaGVscGVyXG5cdFx0XHRcdC8vIGVpdGhlciBhcyBhbm90aGVyIGNvbm5lY3RlZCBTb3J0YWJsZSBtYXkgeWV0IGhhbmRsZSB0aGUgcmVtb3ZhbC5cblx0XHRcdFx0c29ydGFibGUuY2FuY2VsSGVscGVyUmVtb3ZhbCA9IHRydWU7XG5cblx0XHRcdFx0c29ydGFibGUuX3RyaWdnZXIoIFwiZGVhY3RpdmF0ZVwiLCBldmVudCwgdWlTb3J0YWJsZSApO1xuXHRcdFx0fVxuXHRcdH0gKTtcblx0fSxcblx0ZHJhZzogZnVuY3Rpb24oIGV2ZW50LCB1aSwgZHJhZ2dhYmxlICkge1xuXHRcdCQuZWFjaCggZHJhZ2dhYmxlLnNvcnRhYmxlcywgZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgaW5uZXJtb3N0SW50ZXJzZWN0aW5nID0gZmFsc2UsXG5cdFx0XHRcdHNvcnRhYmxlID0gdGhpcztcblxuXHRcdFx0Ly8gQ29weSBvdmVyIHZhcmlhYmxlcyB0aGF0IHNvcnRhYmxlJ3MgX2ludGVyc2VjdHNXaXRoIHVzZXNcblx0XHRcdHNvcnRhYmxlLnBvc2l0aW9uQWJzID0gZHJhZ2dhYmxlLnBvc2l0aW9uQWJzO1xuXHRcdFx0c29ydGFibGUuaGVscGVyUHJvcG9ydGlvbnMgPSBkcmFnZ2FibGUuaGVscGVyUHJvcG9ydGlvbnM7XG5cdFx0XHRzb3J0YWJsZS5vZmZzZXQuY2xpY2sgPSBkcmFnZ2FibGUub2Zmc2V0LmNsaWNrO1xuXG5cdFx0XHRpZiAoIHNvcnRhYmxlLl9pbnRlcnNlY3RzV2l0aCggc29ydGFibGUuY29udGFpbmVyQ2FjaGUgKSApIHtcblx0XHRcdFx0aW5uZXJtb3N0SW50ZXJzZWN0aW5nID0gdHJ1ZTtcblxuXHRcdFx0XHQkLmVhY2goIGRyYWdnYWJsZS5zb3J0YWJsZXMsIGZ1bmN0aW9uKCkge1xuXG5cdFx0XHRcdFx0Ly8gQ29weSBvdmVyIHZhcmlhYmxlcyB0aGF0IHNvcnRhYmxlJ3MgX2ludGVyc2VjdHNXaXRoIHVzZXNcblx0XHRcdFx0XHR0aGlzLnBvc2l0aW9uQWJzID0gZHJhZ2dhYmxlLnBvc2l0aW9uQWJzO1xuXHRcdFx0XHRcdHRoaXMuaGVscGVyUHJvcG9ydGlvbnMgPSBkcmFnZ2FibGUuaGVscGVyUHJvcG9ydGlvbnM7XG5cdFx0XHRcdFx0dGhpcy5vZmZzZXQuY2xpY2sgPSBkcmFnZ2FibGUub2Zmc2V0LmNsaWNrO1xuXG5cdFx0XHRcdFx0aWYgKCB0aGlzICE9PSBzb3J0YWJsZSAmJlxuXHRcdFx0XHRcdFx0XHR0aGlzLl9pbnRlcnNlY3RzV2l0aCggdGhpcy5jb250YWluZXJDYWNoZSApICYmXG5cdFx0XHRcdFx0XHRcdCQuY29udGFpbnMoIHNvcnRhYmxlLmVsZW1lbnRbIDAgXSwgdGhpcy5lbGVtZW50WyAwIF0gKSApIHtcblx0XHRcdFx0XHRcdGlubmVybW9zdEludGVyc2VjdGluZyA9IGZhbHNlO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHJldHVybiBpbm5lcm1vc3RJbnRlcnNlY3Rpbmc7XG5cdFx0XHRcdH0gKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKCBpbm5lcm1vc3RJbnRlcnNlY3RpbmcgKSB7XG5cblx0XHRcdFx0Ly8gSWYgaXQgaW50ZXJzZWN0cywgd2UgdXNlIGEgbGl0dGxlIGlzT3ZlciB2YXJpYWJsZSBhbmQgc2V0IGl0IG9uY2UsXG5cdFx0XHRcdC8vIHNvIHRoYXQgdGhlIG1vdmUtaW4gc3R1ZmYgZ2V0cyBmaXJlZCBvbmx5IG9uY2UuXG5cdFx0XHRcdGlmICggIXNvcnRhYmxlLmlzT3ZlciApIHtcblx0XHRcdFx0XHRzb3J0YWJsZS5pc092ZXIgPSAxO1xuXG5cdFx0XHRcdFx0Ly8gU3RvcmUgZHJhZ2dhYmxlJ3MgcGFyZW50IGluIGNhc2Ugd2UgbmVlZCB0byByZWFwcGVuZCB0byBpdCBsYXRlci5cblx0XHRcdFx0XHRkcmFnZ2FibGUuX3BhcmVudCA9IHVpLmhlbHBlci5wYXJlbnQoKTtcblxuXHRcdFx0XHRcdHNvcnRhYmxlLmN1cnJlbnRJdGVtID0gdWkuaGVscGVyXG5cdFx0XHRcdFx0XHQuYXBwZW5kVG8oIHNvcnRhYmxlLmVsZW1lbnQgKVxuXHRcdFx0XHRcdFx0LmRhdGEoIFwidWktc29ydGFibGUtaXRlbVwiLCB0cnVlICk7XG5cblx0XHRcdFx0XHQvLyBTdG9yZSBoZWxwZXIgb3B0aW9uIHRvIGxhdGVyIHJlc3RvcmUgaXRcblx0XHRcdFx0XHRzb3J0YWJsZS5vcHRpb25zLl9oZWxwZXIgPSBzb3J0YWJsZS5vcHRpb25zLmhlbHBlcjtcblxuXHRcdFx0XHRcdHNvcnRhYmxlLm9wdGlvbnMuaGVscGVyID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gdWkuaGVscGVyWyAwIF07XG5cdFx0XHRcdFx0fTtcblxuXHRcdFx0XHRcdC8vIEZpcmUgdGhlIHN0YXJ0IGV2ZW50cyBvZiB0aGUgc29ydGFibGUgd2l0aCBvdXIgcGFzc2VkIGJyb3dzZXIgZXZlbnQsXG5cdFx0XHRcdFx0Ly8gYW5kIG91ciBvd24gaGVscGVyIChzbyBpdCBkb2Vzbid0IGNyZWF0ZSBhIG5ldyBvbmUpXG5cdFx0XHRcdFx0ZXZlbnQudGFyZ2V0ID0gc29ydGFibGUuY3VycmVudEl0ZW1bIDAgXTtcblx0XHRcdFx0XHRzb3J0YWJsZS5fbW91c2VDYXB0dXJlKCBldmVudCwgdHJ1ZSApO1xuXHRcdFx0XHRcdHNvcnRhYmxlLl9tb3VzZVN0YXJ0KCBldmVudCwgdHJ1ZSwgdHJ1ZSApO1xuXG5cdFx0XHRcdFx0Ly8gQmVjYXVzZSB0aGUgYnJvd3NlciBldmVudCBpcyB3YXkgb2ZmIHRoZSBuZXcgYXBwZW5kZWQgcG9ydGxldCxcblx0XHRcdFx0XHQvLyBtb2RpZnkgbmVjZXNzYXJ5IHZhcmlhYmxlcyB0byByZWZsZWN0IHRoZSBjaGFuZ2VzXG5cdFx0XHRcdFx0c29ydGFibGUub2Zmc2V0LmNsaWNrLnRvcCA9IGRyYWdnYWJsZS5vZmZzZXQuY2xpY2sudG9wO1xuXHRcdFx0XHRcdHNvcnRhYmxlLm9mZnNldC5jbGljay5sZWZ0ID0gZHJhZ2dhYmxlLm9mZnNldC5jbGljay5sZWZ0O1xuXHRcdFx0XHRcdHNvcnRhYmxlLm9mZnNldC5wYXJlbnQubGVmdCAtPSBkcmFnZ2FibGUub2Zmc2V0LnBhcmVudC5sZWZ0IC1cblx0XHRcdFx0XHRcdHNvcnRhYmxlLm9mZnNldC5wYXJlbnQubGVmdDtcblx0XHRcdFx0XHRzb3J0YWJsZS5vZmZzZXQucGFyZW50LnRvcCAtPSBkcmFnZ2FibGUub2Zmc2V0LnBhcmVudC50b3AgLVxuXHRcdFx0XHRcdFx0c29ydGFibGUub2Zmc2V0LnBhcmVudC50b3A7XG5cblx0XHRcdFx0XHRkcmFnZ2FibGUuX3RyaWdnZXIoIFwidG9Tb3J0YWJsZVwiLCBldmVudCApO1xuXG5cdFx0XHRcdFx0Ly8gSW5mb3JtIGRyYWdnYWJsZSB0aGF0IHRoZSBoZWxwZXIgaXMgaW4gYSB2YWxpZCBkcm9wIHpvbmUsXG5cdFx0XHRcdFx0Ly8gdXNlZCBzb2xlbHkgaW4gdGhlIHJldmVydCBvcHRpb24gdG8gaGFuZGxlIFwidmFsaWQvaW52YWxpZFwiLlxuXHRcdFx0XHRcdGRyYWdnYWJsZS5kcm9wcGVkID0gc29ydGFibGUuZWxlbWVudDtcblxuXHRcdFx0XHRcdC8vIE5lZWQgdG8gcmVmcmVzaFBvc2l0aW9ucyBvZiBhbGwgc29ydGFibGVzIGluIHRoZSBjYXNlIHRoYXRcblx0XHRcdFx0XHQvLyBhZGRpbmcgdG8gb25lIHNvcnRhYmxlIGNoYW5nZXMgdGhlIGxvY2F0aW9uIG9mIHRoZSBvdGhlciBzb3J0YWJsZXMgKCM5Njc1KVxuXHRcdFx0XHRcdCQuZWFjaCggZHJhZ2dhYmxlLnNvcnRhYmxlcywgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHR0aGlzLnJlZnJlc2hQb3NpdGlvbnMoKTtcblx0XHRcdFx0XHR9ICk7XG5cblx0XHRcdFx0XHQvLyBIYWNrIHNvIHJlY2VpdmUvdXBkYXRlIGNhbGxiYWNrcyB3b3JrIChtb3N0bHkpXG5cdFx0XHRcdFx0ZHJhZ2dhYmxlLmN1cnJlbnRJdGVtID0gZHJhZ2dhYmxlLmVsZW1lbnQ7XG5cdFx0XHRcdFx0c29ydGFibGUuZnJvbU91dHNpZGUgPSBkcmFnZ2FibGU7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoIHNvcnRhYmxlLmN1cnJlbnRJdGVtICkge1xuXHRcdFx0XHRcdHNvcnRhYmxlLl9tb3VzZURyYWcoIGV2ZW50ICk7XG5cblx0XHRcdFx0XHQvLyBDb3B5IHRoZSBzb3J0YWJsZSdzIHBvc2l0aW9uIGJlY2F1c2UgdGhlIGRyYWdnYWJsZSdzIGNhbiBwb3RlbnRpYWxseSByZWZsZWN0XG5cdFx0XHRcdFx0Ly8gYSByZWxhdGl2ZSBwb3NpdGlvbiwgd2hpbGUgc29ydGFibGUgaXMgYWx3YXlzIGFic29sdXRlLCB3aGljaCB0aGUgZHJhZ2dlZFxuXHRcdFx0XHRcdC8vIGVsZW1lbnQgaGFzIG5vdyBiZWNvbWUuICgjODgwOSlcblx0XHRcdFx0XHR1aS5wb3NpdGlvbiA9IHNvcnRhYmxlLnBvc2l0aW9uO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdC8vIElmIGl0IGRvZXNuJ3QgaW50ZXJzZWN0IHdpdGggdGhlIHNvcnRhYmxlLCBhbmQgaXQgaW50ZXJzZWN0ZWQgYmVmb3JlLFxuXHRcdFx0XHQvLyB3ZSBmYWtlIHRoZSBkcmFnIHN0b3Agb2YgdGhlIHNvcnRhYmxlLCBidXQgbWFrZSBzdXJlIGl0IGRvZXNuJ3QgcmVtb3ZlXG5cdFx0XHRcdC8vIHRoZSBoZWxwZXIgYnkgdXNpbmcgY2FuY2VsSGVscGVyUmVtb3ZhbC5cblx0XHRcdFx0aWYgKCBzb3J0YWJsZS5pc092ZXIgKSB7XG5cblx0XHRcdFx0XHRzb3J0YWJsZS5pc092ZXIgPSAwO1xuXHRcdFx0XHRcdHNvcnRhYmxlLmNhbmNlbEhlbHBlclJlbW92YWwgPSB0cnVlO1xuXG5cdFx0XHRcdFx0Ly8gQ2FsbGluZyBzb3J0YWJsZSdzIG1vdXNlU3RvcCB3b3VsZCB0cmlnZ2VyIGEgcmV2ZXJ0LFxuXHRcdFx0XHRcdC8vIHNvIHJldmVydCBtdXN0IGJlIHRlbXBvcmFyaWx5IGZhbHNlIHVudGlsIGFmdGVyIG1vdXNlU3RvcCBpcyBjYWxsZWQuXG5cdFx0XHRcdFx0c29ydGFibGUub3B0aW9ucy5fcmV2ZXJ0ID0gc29ydGFibGUub3B0aW9ucy5yZXZlcnQ7XG5cdFx0XHRcdFx0c29ydGFibGUub3B0aW9ucy5yZXZlcnQgPSBmYWxzZTtcblxuXHRcdFx0XHRcdHNvcnRhYmxlLl90cmlnZ2VyKCBcIm91dFwiLCBldmVudCwgc29ydGFibGUuX3VpSGFzaCggc29ydGFibGUgKSApO1xuXHRcdFx0XHRcdHNvcnRhYmxlLl9tb3VzZVN0b3AoIGV2ZW50LCB0cnVlICk7XG5cblx0XHRcdFx0XHQvLyBSZXN0b3JlIHNvcnRhYmxlIGJlaGF2aW9ycyB0aGF0IHdlcmUgbW9kZmllZFxuXHRcdFx0XHRcdC8vIHdoZW4gdGhlIGRyYWdnYWJsZSBlbnRlcmVkIHRoZSBzb3J0YWJsZSBhcmVhICgjOTQ4MSlcblx0XHRcdFx0XHRzb3J0YWJsZS5vcHRpb25zLnJldmVydCA9IHNvcnRhYmxlLm9wdGlvbnMuX3JldmVydDtcblx0XHRcdFx0XHRzb3J0YWJsZS5vcHRpb25zLmhlbHBlciA9IHNvcnRhYmxlLm9wdGlvbnMuX2hlbHBlcjtcblxuXHRcdFx0XHRcdGlmICggc29ydGFibGUucGxhY2Vob2xkZXIgKSB7XG5cdFx0XHRcdFx0XHRzb3J0YWJsZS5wbGFjZWhvbGRlci5yZW1vdmUoKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHQvLyBSZXN0b3JlIGFuZCByZWNhbGN1bGF0ZSB0aGUgZHJhZ2dhYmxlJ3Mgb2Zmc2V0IGNvbnNpZGVyaW5nIHRoZSBzb3J0YWJsZVxuXHRcdFx0XHRcdC8vIG1heSBoYXZlIG1vZGlmaWVkIHRoZW0gaW4gdW5leHBlY3RlZCB3YXlzLiAoIzg4MDksICMxMDY2OSlcblx0XHRcdFx0XHR1aS5oZWxwZXIuYXBwZW5kVG8oIGRyYWdnYWJsZS5fcGFyZW50ICk7XG5cdFx0XHRcdFx0ZHJhZ2dhYmxlLl9yZWZyZXNoT2Zmc2V0cyggZXZlbnQgKTtcblx0XHRcdFx0XHR1aS5wb3NpdGlvbiA9IGRyYWdnYWJsZS5fZ2VuZXJhdGVQb3NpdGlvbiggZXZlbnQsIHRydWUgKTtcblxuXHRcdFx0XHRcdGRyYWdnYWJsZS5fdHJpZ2dlciggXCJmcm9tU29ydGFibGVcIiwgZXZlbnQgKTtcblxuXHRcdFx0XHRcdC8vIEluZm9ybSBkcmFnZ2FibGUgdGhhdCB0aGUgaGVscGVyIGlzIG5vIGxvbmdlciBpbiBhIHZhbGlkIGRyb3Agem9uZVxuXHRcdFx0XHRcdGRyYWdnYWJsZS5kcm9wcGVkID0gZmFsc2U7XG5cblx0XHRcdFx0XHQvLyBOZWVkIHRvIHJlZnJlc2hQb3NpdGlvbnMgb2YgYWxsIHNvcnRhYmxlcyBqdXN0IGluIGNhc2UgcmVtb3Zpbmdcblx0XHRcdFx0XHQvLyBmcm9tIG9uZSBzb3J0YWJsZSBjaGFuZ2VzIHRoZSBsb2NhdGlvbiBvZiBvdGhlciBzb3J0YWJsZXMgKCM5Njc1KVxuXHRcdFx0XHRcdCQuZWFjaCggZHJhZ2dhYmxlLnNvcnRhYmxlcywgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHR0aGlzLnJlZnJlc2hQb3NpdGlvbnMoKTtcblx0XHRcdFx0XHR9ICk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9ICk7XG5cdH1cbn0gKTtcblxuJC51aS5wbHVnaW4uYWRkKCBcImRyYWdnYWJsZVwiLCBcImN1cnNvclwiLCB7XG5cdHN0YXJ0OiBmdW5jdGlvbiggZXZlbnQsIHVpLCBpbnN0YW5jZSApIHtcblx0XHR2YXIgdCA9ICQoIFwiYm9keVwiICksXG5cdFx0XHRvID0gaW5zdGFuY2Uub3B0aW9ucztcblxuXHRcdGlmICggdC5jc3MoIFwiY3Vyc29yXCIgKSApIHtcblx0XHRcdG8uX2N1cnNvciA9IHQuY3NzKCBcImN1cnNvclwiICk7XG5cdFx0fVxuXHRcdHQuY3NzKCBcImN1cnNvclwiLCBvLmN1cnNvciApO1xuXHR9LFxuXHRzdG9wOiBmdW5jdGlvbiggZXZlbnQsIHVpLCBpbnN0YW5jZSApIHtcblx0XHR2YXIgbyA9IGluc3RhbmNlLm9wdGlvbnM7XG5cdFx0aWYgKCBvLl9jdXJzb3IgKSB7XG5cdFx0XHQkKCBcImJvZHlcIiApLmNzcyggXCJjdXJzb3JcIiwgby5fY3Vyc29yICk7XG5cdFx0fVxuXHR9XG59ICk7XG5cbiQudWkucGx1Z2luLmFkZCggXCJkcmFnZ2FibGVcIiwgXCJvcGFjaXR5XCIsIHtcblx0c3RhcnQ6IGZ1bmN0aW9uKCBldmVudCwgdWksIGluc3RhbmNlICkge1xuXHRcdHZhciB0ID0gJCggdWkuaGVscGVyICksXG5cdFx0XHRvID0gaW5zdGFuY2Uub3B0aW9ucztcblx0XHRpZiAoIHQuY3NzKCBcIm9wYWNpdHlcIiApICkge1xuXHRcdFx0by5fb3BhY2l0eSA9IHQuY3NzKCBcIm9wYWNpdHlcIiApO1xuXHRcdH1cblx0XHR0LmNzcyggXCJvcGFjaXR5XCIsIG8ub3BhY2l0eSApO1xuXHR9LFxuXHRzdG9wOiBmdW5jdGlvbiggZXZlbnQsIHVpLCBpbnN0YW5jZSApIHtcblx0XHR2YXIgbyA9IGluc3RhbmNlLm9wdGlvbnM7XG5cdFx0aWYgKCBvLl9vcGFjaXR5ICkge1xuXHRcdFx0JCggdWkuaGVscGVyICkuY3NzKCBcIm9wYWNpdHlcIiwgby5fb3BhY2l0eSApO1xuXHRcdH1cblx0fVxufSApO1xuXG4kLnVpLnBsdWdpbi5hZGQoIFwiZHJhZ2dhYmxlXCIsIFwic2Nyb2xsXCIsIHtcblx0c3RhcnQ6IGZ1bmN0aW9uKCBldmVudCwgdWksIGkgKSB7XG5cdFx0aWYgKCAhaS5zY3JvbGxQYXJlbnROb3RIaWRkZW4gKSB7XG5cdFx0XHRpLnNjcm9sbFBhcmVudE5vdEhpZGRlbiA9IGkuaGVscGVyLnNjcm9sbFBhcmVudCggZmFsc2UgKTtcblx0XHR9XG5cblx0XHRpZiAoIGkuc2Nyb2xsUGFyZW50Tm90SGlkZGVuWyAwIF0gIT09IGkuZG9jdW1lbnRbIDAgXSAmJlxuXHRcdFx0XHRpLnNjcm9sbFBhcmVudE5vdEhpZGRlblsgMCBdLnRhZ05hbWUgIT09IFwiSFRNTFwiICkge1xuXHRcdFx0aS5vdmVyZmxvd09mZnNldCA9IGkuc2Nyb2xsUGFyZW50Tm90SGlkZGVuLm9mZnNldCgpO1xuXHRcdH1cblx0fSxcblx0ZHJhZzogZnVuY3Rpb24oIGV2ZW50LCB1aSwgaSAgKSB7XG5cblx0XHR2YXIgbyA9IGkub3B0aW9ucyxcblx0XHRcdHNjcm9sbGVkID0gZmFsc2UsXG5cdFx0XHRzY3JvbGxQYXJlbnQgPSBpLnNjcm9sbFBhcmVudE5vdEhpZGRlblsgMCBdLFxuXHRcdFx0ZG9jdW1lbnQgPSBpLmRvY3VtZW50WyAwIF07XG5cblx0XHRpZiAoIHNjcm9sbFBhcmVudCAhPT0gZG9jdW1lbnQgJiYgc2Nyb2xsUGFyZW50LnRhZ05hbWUgIT09IFwiSFRNTFwiICkge1xuXHRcdFx0aWYgKCAhby5heGlzIHx8IG8uYXhpcyAhPT0gXCJ4XCIgKSB7XG5cdFx0XHRcdGlmICggKCBpLm92ZXJmbG93T2Zmc2V0LnRvcCArIHNjcm9sbFBhcmVudC5vZmZzZXRIZWlnaHQgKSAtIGV2ZW50LnBhZ2VZIDxcblx0XHRcdFx0XHRcdG8uc2Nyb2xsU2Vuc2l0aXZpdHkgKSB7XG5cdFx0XHRcdFx0c2Nyb2xsUGFyZW50LnNjcm9sbFRvcCA9IHNjcm9sbGVkID0gc2Nyb2xsUGFyZW50LnNjcm9sbFRvcCArIG8uc2Nyb2xsU3BlZWQ7XG5cdFx0XHRcdH0gZWxzZSBpZiAoIGV2ZW50LnBhZ2VZIC0gaS5vdmVyZmxvd09mZnNldC50b3AgPCBvLnNjcm9sbFNlbnNpdGl2aXR5ICkge1xuXHRcdFx0XHRcdHNjcm9sbFBhcmVudC5zY3JvbGxUb3AgPSBzY3JvbGxlZCA9IHNjcm9sbFBhcmVudC5zY3JvbGxUb3AgLSBvLnNjcm9sbFNwZWVkO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGlmICggIW8uYXhpcyB8fCBvLmF4aXMgIT09IFwieVwiICkge1xuXHRcdFx0XHRpZiAoICggaS5vdmVyZmxvd09mZnNldC5sZWZ0ICsgc2Nyb2xsUGFyZW50Lm9mZnNldFdpZHRoICkgLSBldmVudC5wYWdlWCA8XG5cdFx0XHRcdFx0XHRvLnNjcm9sbFNlbnNpdGl2aXR5ICkge1xuXHRcdFx0XHRcdHNjcm9sbFBhcmVudC5zY3JvbGxMZWZ0ID0gc2Nyb2xsZWQgPSBzY3JvbGxQYXJlbnQuc2Nyb2xsTGVmdCArIG8uc2Nyb2xsU3BlZWQ7XG5cdFx0XHRcdH0gZWxzZSBpZiAoIGV2ZW50LnBhZ2VYIC0gaS5vdmVyZmxvd09mZnNldC5sZWZ0IDwgby5zY3JvbGxTZW5zaXRpdml0eSApIHtcblx0XHRcdFx0XHRzY3JvbGxQYXJlbnQuc2Nyb2xsTGVmdCA9IHNjcm9sbGVkID0gc2Nyb2xsUGFyZW50LnNjcm9sbExlZnQgLSBvLnNjcm9sbFNwZWVkO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHR9IGVsc2Uge1xuXG5cdFx0XHRpZiAoICFvLmF4aXMgfHwgby5heGlzICE9PSBcInhcIiApIHtcblx0XHRcdFx0aWYgKCBldmVudC5wYWdlWSAtICQoIGRvY3VtZW50ICkuc2Nyb2xsVG9wKCkgPCBvLnNjcm9sbFNlbnNpdGl2aXR5ICkge1xuXHRcdFx0XHRcdHNjcm9sbGVkID0gJCggZG9jdW1lbnQgKS5zY3JvbGxUb3AoICQoIGRvY3VtZW50ICkuc2Nyb2xsVG9wKCkgLSBvLnNjcm9sbFNwZWVkICk7XG5cdFx0XHRcdH0gZWxzZSBpZiAoICQoIHdpbmRvdyApLmhlaWdodCgpIC0gKCBldmVudC5wYWdlWSAtICQoIGRvY3VtZW50ICkuc2Nyb2xsVG9wKCkgKSA8XG5cdFx0XHRcdFx0XHRvLnNjcm9sbFNlbnNpdGl2aXR5ICkge1xuXHRcdFx0XHRcdHNjcm9sbGVkID0gJCggZG9jdW1lbnQgKS5zY3JvbGxUb3AoICQoIGRvY3VtZW50ICkuc2Nyb2xsVG9wKCkgKyBvLnNjcm9sbFNwZWVkICk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0aWYgKCAhby5heGlzIHx8IG8uYXhpcyAhPT0gXCJ5XCIgKSB7XG5cdFx0XHRcdGlmICggZXZlbnQucGFnZVggLSAkKCBkb2N1bWVudCApLnNjcm9sbExlZnQoKSA8IG8uc2Nyb2xsU2Vuc2l0aXZpdHkgKSB7XG5cdFx0XHRcdFx0c2Nyb2xsZWQgPSAkKCBkb2N1bWVudCApLnNjcm9sbExlZnQoXG5cdFx0XHRcdFx0XHQkKCBkb2N1bWVudCApLnNjcm9sbExlZnQoKSAtIG8uc2Nyb2xsU3BlZWRcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9IGVsc2UgaWYgKCAkKCB3aW5kb3cgKS53aWR0aCgpIC0gKCBldmVudC5wYWdlWCAtICQoIGRvY3VtZW50ICkuc2Nyb2xsTGVmdCgpICkgPFxuXHRcdFx0XHRcdFx0by5zY3JvbGxTZW5zaXRpdml0eSApIHtcblx0XHRcdFx0XHRzY3JvbGxlZCA9ICQoIGRvY3VtZW50ICkuc2Nyb2xsTGVmdChcblx0XHRcdFx0XHRcdCQoIGRvY3VtZW50ICkuc2Nyb2xsTGVmdCgpICsgby5zY3JvbGxTcGVlZFxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdH1cblxuXHRcdGlmICggc2Nyb2xsZWQgIT09IGZhbHNlICYmICQudWkuZGRtYW5hZ2VyICYmICFvLmRyb3BCZWhhdmlvdXIgKSB7XG5cdFx0XHQkLnVpLmRkbWFuYWdlci5wcmVwYXJlT2Zmc2V0cyggaSwgZXZlbnQgKTtcblx0XHR9XG5cblx0fVxufSApO1xuXG4kLnVpLnBsdWdpbi5hZGQoIFwiZHJhZ2dhYmxlXCIsIFwic25hcFwiLCB7XG5cdHN0YXJ0OiBmdW5jdGlvbiggZXZlbnQsIHVpLCBpICkge1xuXG5cdFx0dmFyIG8gPSBpLm9wdGlvbnM7XG5cblx0XHRpLnNuYXBFbGVtZW50cyA9IFtdO1xuXG5cdFx0JCggby5zbmFwLmNvbnN0cnVjdG9yICE9PSBTdHJpbmcgPyAoIG8uc25hcC5pdGVtcyB8fCBcIjpkYXRhKHVpLWRyYWdnYWJsZSlcIiApIDogby5zbmFwIClcblx0XHRcdC5lYWNoKCBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyICR0ID0gJCggdGhpcyApLFxuXHRcdFx0XHRcdCRvID0gJHQub2Zmc2V0KCk7XG5cdFx0XHRcdGlmICggdGhpcyAhPT0gaS5lbGVtZW50WyAwIF0gKSB7XG5cdFx0XHRcdFx0aS5zbmFwRWxlbWVudHMucHVzaCgge1xuXHRcdFx0XHRcdFx0aXRlbTogdGhpcyxcblx0XHRcdFx0XHRcdHdpZHRoOiAkdC5vdXRlcldpZHRoKCksIGhlaWdodDogJHQub3V0ZXJIZWlnaHQoKSxcblx0XHRcdFx0XHRcdHRvcDogJG8udG9wLCBsZWZ0OiAkby5sZWZ0XG5cdFx0XHRcdFx0fSApO1xuXHRcdFx0XHR9XG5cdFx0XHR9ICk7XG5cblx0fSxcblx0ZHJhZzogZnVuY3Rpb24oIGV2ZW50LCB1aSwgaW5zdCApIHtcblxuXHRcdHZhciB0cywgYnMsIGxzLCBycywgbCwgciwgdCwgYiwgaSwgZmlyc3QsXG5cdFx0XHRvID0gaW5zdC5vcHRpb25zLFxuXHRcdFx0ZCA9IG8uc25hcFRvbGVyYW5jZSxcblx0XHRcdHgxID0gdWkub2Zmc2V0LmxlZnQsIHgyID0geDEgKyBpbnN0LmhlbHBlclByb3BvcnRpb25zLndpZHRoLFxuXHRcdFx0eTEgPSB1aS5vZmZzZXQudG9wLCB5MiA9IHkxICsgaW5zdC5oZWxwZXJQcm9wb3J0aW9ucy5oZWlnaHQ7XG5cblx0XHRmb3IgKCBpID0gaW5zdC5zbmFwRWxlbWVudHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0gKSB7XG5cblx0XHRcdGwgPSBpbnN0LnNuYXBFbGVtZW50c1sgaSBdLmxlZnQgLSBpbnN0Lm1hcmdpbnMubGVmdDtcblx0XHRcdHIgPSBsICsgaW5zdC5zbmFwRWxlbWVudHNbIGkgXS53aWR0aDtcblx0XHRcdHQgPSBpbnN0LnNuYXBFbGVtZW50c1sgaSBdLnRvcCAtIGluc3QubWFyZ2lucy50b3A7XG5cdFx0XHRiID0gdCArIGluc3Quc25hcEVsZW1lbnRzWyBpIF0uaGVpZ2h0O1xuXG5cdFx0XHRpZiAoIHgyIDwgbCAtIGQgfHwgeDEgPiByICsgZCB8fCB5MiA8IHQgLSBkIHx8IHkxID4gYiArIGQgfHxcblx0XHRcdFx0XHQhJC5jb250YWlucyggaW5zdC5zbmFwRWxlbWVudHNbIGkgXS5pdGVtLm93bmVyRG9jdW1lbnQsXG5cdFx0XHRcdFx0aW5zdC5zbmFwRWxlbWVudHNbIGkgXS5pdGVtICkgKSB7XG5cdFx0XHRcdGlmICggaW5zdC5zbmFwRWxlbWVudHNbIGkgXS5zbmFwcGluZyApIHtcblx0XHRcdFx0XHQoIGluc3Qub3B0aW9ucy5zbmFwLnJlbGVhc2UgJiZcblx0XHRcdFx0XHRcdGluc3Qub3B0aW9ucy5zbmFwLnJlbGVhc2UuY2FsbChcblx0XHRcdFx0XHRcdFx0aW5zdC5lbGVtZW50LFxuXHRcdFx0XHRcdFx0XHRldmVudCxcblx0XHRcdFx0XHRcdFx0JC5leHRlbmQoIGluc3QuX3VpSGFzaCgpLCB7IHNuYXBJdGVtOiBpbnN0LnNuYXBFbGVtZW50c1sgaSBdLml0ZW0gfSApXG5cdFx0XHRcdFx0XHQpICk7XG5cdFx0XHRcdH1cblx0XHRcdFx0aW5zdC5zbmFwRWxlbWVudHNbIGkgXS5zbmFwcGluZyA9IGZhbHNlO1xuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKCBvLnNuYXBNb2RlICE9PSBcImlubmVyXCIgKSB7XG5cdFx0XHRcdHRzID0gTWF0aC5hYnMoIHQgLSB5MiApIDw9IGQ7XG5cdFx0XHRcdGJzID0gTWF0aC5hYnMoIGIgLSB5MSApIDw9IGQ7XG5cdFx0XHRcdGxzID0gTWF0aC5hYnMoIGwgLSB4MiApIDw9IGQ7XG5cdFx0XHRcdHJzID0gTWF0aC5hYnMoIHIgLSB4MSApIDw9IGQ7XG5cdFx0XHRcdGlmICggdHMgKSB7XG5cdFx0XHRcdFx0dWkucG9zaXRpb24udG9wID0gaW5zdC5fY29udmVydFBvc2l0aW9uVG8oIFwicmVsYXRpdmVcIiwge1xuXHRcdFx0XHRcdFx0dG9wOiB0IC0gaW5zdC5oZWxwZXJQcm9wb3J0aW9ucy5oZWlnaHQsXG5cdFx0XHRcdFx0XHRsZWZ0OiAwXG5cdFx0XHRcdFx0fSApLnRvcDtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoIGJzICkge1xuXHRcdFx0XHRcdHVpLnBvc2l0aW9uLnRvcCA9IGluc3QuX2NvbnZlcnRQb3NpdGlvblRvKCBcInJlbGF0aXZlXCIsIHtcblx0XHRcdFx0XHRcdHRvcDogYixcblx0XHRcdFx0XHRcdGxlZnQ6IDBcblx0XHRcdFx0XHR9ICkudG9wO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmICggbHMgKSB7XG5cdFx0XHRcdFx0dWkucG9zaXRpb24ubGVmdCA9IGluc3QuX2NvbnZlcnRQb3NpdGlvblRvKCBcInJlbGF0aXZlXCIsIHtcblx0XHRcdFx0XHRcdHRvcDogMCxcblx0XHRcdFx0XHRcdGxlZnQ6IGwgLSBpbnN0LmhlbHBlclByb3BvcnRpb25zLndpZHRoXG5cdFx0XHRcdFx0fSApLmxlZnQ7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKCBycyApIHtcblx0XHRcdFx0XHR1aS5wb3NpdGlvbi5sZWZ0ID0gaW5zdC5fY29udmVydFBvc2l0aW9uVG8oIFwicmVsYXRpdmVcIiwge1xuXHRcdFx0XHRcdFx0dG9wOiAwLFxuXHRcdFx0XHRcdFx0bGVmdDogclxuXHRcdFx0XHRcdH0gKS5sZWZ0O1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGZpcnN0ID0gKCB0cyB8fCBicyB8fCBscyB8fCBycyApO1xuXG5cdFx0XHRpZiAoIG8uc25hcE1vZGUgIT09IFwib3V0ZXJcIiApIHtcblx0XHRcdFx0dHMgPSBNYXRoLmFicyggdCAtIHkxICkgPD0gZDtcblx0XHRcdFx0YnMgPSBNYXRoLmFicyggYiAtIHkyICkgPD0gZDtcblx0XHRcdFx0bHMgPSBNYXRoLmFicyggbCAtIHgxICkgPD0gZDtcblx0XHRcdFx0cnMgPSBNYXRoLmFicyggciAtIHgyICkgPD0gZDtcblx0XHRcdFx0aWYgKCB0cyApIHtcblx0XHRcdFx0XHR1aS5wb3NpdGlvbi50b3AgPSBpbnN0Ll9jb252ZXJ0UG9zaXRpb25UbyggXCJyZWxhdGl2ZVwiLCB7XG5cdFx0XHRcdFx0XHR0b3A6IHQsXG5cdFx0XHRcdFx0XHRsZWZ0OiAwXG5cdFx0XHRcdFx0fSApLnRvcDtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoIGJzICkge1xuXHRcdFx0XHRcdHVpLnBvc2l0aW9uLnRvcCA9IGluc3QuX2NvbnZlcnRQb3NpdGlvblRvKCBcInJlbGF0aXZlXCIsIHtcblx0XHRcdFx0XHRcdHRvcDogYiAtIGluc3QuaGVscGVyUHJvcG9ydGlvbnMuaGVpZ2h0LFxuXHRcdFx0XHRcdFx0bGVmdDogMFxuXHRcdFx0XHRcdH0gKS50b3A7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKCBscyApIHtcblx0XHRcdFx0XHR1aS5wb3NpdGlvbi5sZWZ0ID0gaW5zdC5fY29udmVydFBvc2l0aW9uVG8oIFwicmVsYXRpdmVcIiwge1xuXHRcdFx0XHRcdFx0dG9wOiAwLFxuXHRcdFx0XHRcdFx0bGVmdDogbFxuXHRcdFx0XHRcdH0gKS5sZWZ0O1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmICggcnMgKSB7XG5cdFx0XHRcdFx0dWkucG9zaXRpb24ubGVmdCA9IGluc3QuX2NvbnZlcnRQb3NpdGlvblRvKCBcInJlbGF0aXZlXCIsIHtcblx0XHRcdFx0XHRcdHRvcDogMCxcblx0XHRcdFx0XHRcdGxlZnQ6IHIgLSBpbnN0LmhlbHBlclByb3BvcnRpb25zLndpZHRoXG5cdFx0XHRcdFx0fSApLmxlZnQ7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0aWYgKCAhaW5zdC5zbmFwRWxlbWVudHNbIGkgXS5zbmFwcGluZyAmJiAoIHRzIHx8IGJzIHx8IGxzIHx8IHJzIHx8IGZpcnN0ICkgKSB7XG5cdFx0XHRcdCggaW5zdC5vcHRpb25zLnNuYXAuc25hcCAmJlxuXHRcdFx0XHRcdGluc3Qub3B0aW9ucy5zbmFwLnNuYXAuY2FsbChcblx0XHRcdFx0XHRcdGluc3QuZWxlbWVudCxcblx0XHRcdFx0XHRcdGV2ZW50LFxuXHRcdFx0XHRcdFx0JC5leHRlbmQoIGluc3QuX3VpSGFzaCgpLCB7XG5cdFx0XHRcdFx0XHRcdHNuYXBJdGVtOiBpbnN0LnNuYXBFbGVtZW50c1sgaSBdLml0ZW1cblx0XHRcdFx0XHRcdH0gKSApICk7XG5cdFx0XHR9XG5cdFx0XHRpbnN0LnNuYXBFbGVtZW50c1sgaSBdLnNuYXBwaW5nID0gKCB0cyB8fCBicyB8fCBscyB8fCBycyB8fCBmaXJzdCApO1xuXG5cdFx0fVxuXG5cdH1cbn0gKTtcblxuJC51aS5wbHVnaW4uYWRkKCBcImRyYWdnYWJsZVwiLCBcInN0YWNrXCIsIHtcblx0c3RhcnQ6IGZ1bmN0aW9uKCBldmVudCwgdWksIGluc3RhbmNlICkge1xuXHRcdHZhciBtaW4sXG5cdFx0XHRvID0gaW5zdGFuY2Uub3B0aW9ucyxcblx0XHRcdGdyb3VwID0gJC5tYWtlQXJyYXkoICQoIG8uc3RhY2sgKSApLnNvcnQoIGZ1bmN0aW9uKCBhLCBiICkge1xuXHRcdFx0XHRyZXR1cm4gKCBwYXJzZUludCggJCggYSApLmNzcyggXCJ6SW5kZXhcIiApLCAxMCApIHx8IDAgKSAtXG5cdFx0XHRcdFx0KCBwYXJzZUludCggJCggYiApLmNzcyggXCJ6SW5kZXhcIiApLCAxMCApIHx8IDAgKTtcblx0XHRcdH0gKTtcblxuXHRcdGlmICggIWdyb3VwLmxlbmd0aCApIHsgcmV0dXJuOyB9XG5cblx0XHRtaW4gPSBwYXJzZUludCggJCggZ3JvdXBbIDAgXSApLmNzcyggXCJ6SW5kZXhcIiApLCAxMCApIHx8IDA7XG5cdFx0JCggZ3JvdXAgKS5lYWNoKCBmdW5jdGlvbiggaSApIHtcblx0XHRcdCQoIHRoaXMgKS5jc3MoIFwiekluZGV4XCIsIG1pbiArIGkgKTtcblx0XHR9ICk7XG5cdFx0dGhpcy5jc3MoIFwiekluZGV4XCIsICggbWluICsgZ3JvdXAubGVuZ3RoICkgKTtcblx0fVxufSApO1xuXG4kLnVpLnBsdWdpbi5hZGQoIFwiZHJhZ2dhYmxlXCIsIFwiekluZGV4XCIsIHtcblx0c3RhcnQ6IGZ1bmN0aW9uKCBldmVudCwgdWksIGluc3RhbmNlICkge1xuXHRcdHZhciB0ID0gJCggdWkuaGVscGVyICksXG5cdFx0XHRvID0gaW5zdGFuY2Uub3B0aW9ucztcblxuXHRcdGlmICggdC5jc3MoIFwiekluZGV4XCIgKSApIHtcblx0XHRcdG8uX3pJbmRleCA9IHQuY3NzKCBcInpJbmRleFwiICk7XG5cdFx0fVxuXHRcdHQuY3NzKCBcInpJbmRleFwiLCBvLnpJbmRleCApO1xuXHR9LFxuXHRzdG9wOiBmdW5jdGlvbiggZXZlbnQsIHVpLCBpbnN0YW5jZSApIHtcblx0XHR2YXIgbyA9IGluc3RhbmNlLm9wdGlvbnM7XG5cblx0XHRpZiAoIG8uX3pJbmRleCApIHtcblx0XHRcdCQoIHVpLmhlbHBlciApLmNzcyggXCJ6SW5kZXhcIiwgby5fekluZGV4ICk7XG5cdFx0fVxuXHR9XG59ICk7XG5cbnJldHVybiAkLnVpLmRyYWdnYWJsZTtcblxufSApICk7XG4iLCIvKiFcbiAqIGpRdWVyeSBVSSBXaWRnZXQgMS4xMi4xXG4gKiBodHRwOi8vanF1ZXJ5dWkuY29tXG4gKlxuICogQ29weXJpZ2h0IGpRdWVyeSBGb3VuZGF0aW9uIGFuZCBvdGhlciBjb250cmlidXRvcnNcbiAqIFJlbGVhc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZS5cbiAqIGh0dHA6Ly9qcXVlcnkub3JnL2xpY2Vuc2VcbiAqL1xuXG4vLz4+bGFiZWw6IFdpZGdldFxuLy8+Pmdyb3VwOiBDb3JlXG4vLz4+ZGVzY3JpcHRpb246IFByb3ZpZGVzIGEgZmFjdG9yeSBmb3IgY3JlYXRpbmcgc3RhdGVmdWwgd2lkZ2V0cyB3aXRoIGEgY29tbW9uIEFQSS5cbi8vPj5kb2NzOiBodHRwOi8vYXBpLmpxdWVyeXVpLmNvbS9qUXVlcnkud2lkZ2V0L1xuLy8+PmRlbW9zOiBodHRwOi8vanF1ZXJ5dWkuY29tL3dpZGdldC9cblxuKCBmdW5jdGlvbiggZmFjdG9yeSApIHtcblx0aWYgKCB0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCApIHtcblxuXHRcdC8vIEFNRC4gUmVnaXN0ZXIgYXMgYW4gYW5vbnltb3VzIG1vZHVsZS5cblx0XHRkZWZpbmUoIFsgXCJqcXVlcnlcIiwgXCIuL3ZlcnNpb25cIiBdLCBmYWN0b3J5ICk7XG5cdH0gZWxzZSB7XG5cblx0XHQvLyBCcm93c2VyIGdsb2JhbHNcblx0XHRmYWN0b3J5KCBqUXVlcnkgKTtcblx0fVxufSggZnVuY3Rpb24oICQgKSB7XG5cbnZhciB3aWRnZXRVdWlkID0gMDtcbnZhciB3aWRnZXRTbGljZSA9IEFycmF5LnByb3RvdHlwZS5zbGljZTtcblxuJC5jbGVhbkRhdGEgPSAoIGZ1bmN0aW9uKCBvcmlnICkge1xuXHRyZXR1cm4gZnVuY3Rpb24oIGVsZW1zICkge1xuXHRcdHZhciBldmVudHMsIGVsZW0sIGk7XG5cdFx0Zm9yICggaSA9IDA7ICggZWxlbSA9IGVsZW1zWyBpIF0gKSAhPSBudWxsOyBpKysgKSB7XG5cdFx0XHR0cnkge1xuXG5cdFx0XHRcdC8vIE9ubHkgdHJpZ2dlciByZW1vdmUgd2hlbiBuZWNlc3NhcnkgdG8gc2F2ZSB0aW1lXG5cdFx0XHRcdGV2ZW50cyA9ICQuX2RhdGEoIGVsZW0sIFwiZXZlbnRzXCIgKTtcblx0XHRcdFx0aWYgKCBldmVudHMgJiYgZXZlbnRzLnJlbW92ZSApIHtcblx0XHRcdFx0XHQkKCBlbGVtICkudHJpZ2dlckhhbmRsZXIoIFwicmVtb3ZlXCIgKTtcblx0XHRcdFx0fVxuXG5cdFx0XHQvLyBIdHRwOi8vYnVncy5qcXVlcnkuY29tL3RpY2tldC84MjM1XG5cdFx0XHR9IGNhdGNoICggZSApIHt9XG5cdFx0fVxuXHRcdG9yaWcoIGVsZW1zICk7XG5cdH07XG59ICkoICQuY2xlYW5EYXRhICk7XG5cbiQud2lkZ2V0ID0gZnVuY3Rpb24oIG5hbWUsIGJhc2UsIHByb3RvdHlwZSApIHtcblx0dmFyIGV4aXN0aW5nQ29uc3RydWN0b3IsIGNvbnN0cnVjdG9yLCBiYXNlUHJvdG90eXBlO1xuXG5cdC8vIFByb3hpZWRQcm90b3R5cGUgYWxsb3dzIHRoZSBwcm92aWRlZCBwcm90b3R5cGUgdG8gcmVtYWluIHVubW9kaWZpZWRcblx0Ly8gc28gdGhhdCBpdCBjYW4gYmUgdXNlZCBhcyBhIG1peGluIGZvciBtdWx0aXBsZSB3aWRnZXRzICgjODg3Nilcblx0dmFyIHByb3hpZWRQcm90b3R5cGUgPSB7fTtcblxuXHR2YXIgbmFtZXNwYWNlID0gbmFtZS5zcGxpdCggXCIuXCIgKVsgMCBdO1xuXHRuYW1lID0gbmFtZS5zcGxpdCggXCIuXCIgKVsgMSBdO1xuXHR2YXIgZnVsbE5hbWUgPSBuYW1lc3BhY2UgKyBcIi1cIiArIG5hbWU7XG5cblx0aWYgKCAhcHJvdG90eXBlICkge1xuXHRcdHByb3RvdHlwZSA9IGJhc2U7XG5cdFx0YmFzZSA9ICQuV2lkZ2V0O1xuXHR9XG5cblx0aWYgKCAkLmlzQXJyYXkoIHByb3RvdHlwZSApICkge1xuXHRcdHByb3RvdHlwZSA9ICQuZXh0ZW5kLmFwcGx5KCBudWxsLCBbIHt9IF0uY29uY2F0KCBwcm90b3R5cGUgKSApO1xuXHR9XG5cblx0Ly8gQ3JlYXRlIHNlbGVjdG9yIGZvciBwbHVnaW5cblx0JC5leHByWyBcIjpcIiBdWyBmdWxsTmFtZS50b0xvd2VyQ2FzZSgpIF0gPSBmdW5jdGlvbiggZWxlbSApIHtcblx0XHRyZXR1cm4gISEkLmRhdGEoIGVsZW0sIGZ1bGxOYW1lICk7XG5cdH07XG5cblx0JFsgbmFtZXNwYWNlIF0gPSAkWyBuYW1lc3BhY2UgXSB8fCB7fTtcblx0ZXhpc3RpbmdDb25zdHJ1Y3RvciA9ICRbIG5hbWVzcGFjZSBdWyBuYW1lIF07XG5cdGNvbnN0cnVjdG9yID0gJFsgbmFtZXNwYWNlIF1bIG5hbWUgXSA9IGZ1bmN0aW9uKCBvcHRpb25zLCBlbGVtZW50ICkge1xuXG5cdFx0Ly8gQWxsb3cgaW5zdGFudGlhdGlvbiB3aXRob3V0IFwibmV3XCIga2V5d29yZFxuXHRcdGlmICggIXRoaXMuX2NyZWF0ZVdpZGdldCApIHtcblx0XHRcdHJldHVybiBuZXcgY29uc3RydWN0b3IoIG9wdGlvbnMsIGVsZW1lbnQgKTtcblx0XHR9XG5cblx0XHQvLyBBbGxvdyBpbnN0YW50aWF0aW9uIHdpdGhvdXQgaW5pdGlhbGl6aW5nIGZvciBzaW1wbGUgaW5oZXJpdGFuY2Vcblx0XHQvLyBtdXN0IHVzZSBcIm5ld1wiIGtleXdvcmQgKHRoZSBjb2RlIGFib3ZlIGFsd2F5cyBwYXNzZXMgYXJncylcblx0XHRpZiAoIGFyZ3VtZW50cy5sZW5ndGggKSB7XG5cdFx0XHR0aGlzLl9jcmVhdGVXaWRnZXQoIG9wdGlvbnMsIGVsZW1lbnQgKTtcblx0XHR9XG5cdH07XG5cblx0Ly8gRXh0ZW5kIHdpdGggdGhlIGV4aXN0aW5nIGNvbnN0cnVjdG9yIHRvIGNhcnJ5IG92ZXIgYW55IHN0YXRpYyBwcm9wZXJ0aWVzXG5cdCQuZXh0ZW5kKCBjb25zdHJ1Y3RvciwgZXhpc3RpbmdDb25zdHJ1Y3Rvciwge1xuXHRcdHZlcnNpb246IHByb3RvdHlwZS52ZXJzaW9uLFxuXG5cdFx0Ly8gQ29weSB0aGUgb2JqZWN0IHVzZWQgdG8gY3JlYXRlIHRoZSBwcm90b3R5cGUgaW4gY2FzZSB3ZSBuZWVkIHRvXG5cdFx0Ly8gcmVkZWZpbmUgdGhlIHdpZGdldCBsYXRlclxuXHRcdF9wcm90bzogJC5leHRlbmQoIHt9LCBwcm90b3R5cGUgKSxcblxuXHRcdC8vIFRyYWNrIHdpZGdldHMgdGhhdCBpbmhlcml0IGZyb20gdGhpcyB3aWRnZXQgaW4gY2FzZSB0aGlzIHdpZGdldCBpc1xuXHRcdC8vIHJlZGVmaW5lZCBhZnRlciBhIHdpZGdldCBpbmhlcml0cyBmcm9tIGl0XG5cdFx0X2NoaWxkQ29uc3RydWN0b3JzOiBbXVxuXHR9ICk7XG5cblx0YmFzZVByb3RvdHlwZSA9IG5ldyBiYXNlKCk7XG5cblx0Ly8gV2UgbmVlZCB0byBtYWtlIHRoZSBvcHRpb25zIGhhc2ggYSBwcm9wZXJ0eSBkaXJlY3RseSBvbiB0aGUgbmV3IGluc3RhbmNlXG5cdC8vIG90aGVyd2lzZSB3ZSdsbCBtb2RpZnkgdGhlIG9wdGlvbnMgaGFzaCBvbiB0aGUgcHJvdG90eXBlIHRoYXQgd2UncmVcblx0Ly8gaW5oZXJpdGluZyBmcm9tXG5cdGJhc2VQcm90b3R5cGUub3B0aW9ucyA9ICQud2lkZ2V0LmV4dGVuZCgge30sIGJhc2VQcm90b3R5cGUub3B0aW9ucyApO1xuXHQkLmVhY2goIHByb3RvdHlwZSwgZnVuY3Rpb24oIHByb3AsIHZhbHVlICkge1xuXHRcdGlmICggISQuaXNGdW5jdGlvbiggdmFsdWUgKSApIHtcblx0XHRcdHByb3hpZWRQcm90b3R5cGVbIHByb3AgXSA9IHZhbHVlO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRwcm94aWVkUHJvdG90eXBlWyBwcm9wIF0gPSAoIGZ1bmN0aW9uKCkge1xuXHRcdFx0ZnVuY3Rpb24gX3N1cGVyKCkge1xuXHRcdFx0XHRyZXR1cm4gYmFzZS5wcm90b3R5cGVbIHByb3AgXS5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG5cdFx0XHR9XG5cblx0XHRcdGZ1bmN0aW9uIF9zdXBlckFwcGx5KCBhcmdzICkge1xuXHRcdFx0XHRyZXR1cm4gYmFzZS5wcm90b3R5cGVbIHByb3AgXS5hcHBseSggdGhpcywgYXJncyApO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBfX3N1cGVyID0gdGhpcy5fc3VwZXI7XG5cdFx0XHRcdHZhciBfX3N1cGVyQXBwbHkgPSB0aGlzLl9zdXBlckFwcGx5O1xuXHRcdFx0XHR2YXIgcmV0dXJuVmFsdWU7XG5cblx0XHRcdFx0dGhpcy5fc3VwZXIgPSBfc3VwZXI7XG5cdFx0XHRcdHRoaXMuX3N1cGVyQXBwbHkgPSBfc3VwZXJBcHBseTtcblxuXHRcdFx0XHRyZXR1cm5WYWx1ZSA9IHZhbHVlLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblxuXHRcdFx0XHR0aGlzLl9zdXBlciA9IF9fc3VwZXI7XG5cdFx0XHRcdHRoaXMuX3N1cGVyQXBwbHkgPSBfX3N1cGVyQXBwbHk7XG5cblx0XHRcdFx0cmV0dXJuIHJldHVyblZhbHVlO1xuXHRcdFx0fTtcblx0XHR9ICkoKTtcblx0fSApO1xuXHRjb25zdHJ1Y3Rvci5wcm90b3R5cGUgPSAkLndpZGdldC5leHRlbmQoIGJhc2VQcm90b3R5cGUsIHtcblxuXHRcdC8vIFRPRE86IHJlbW92ZSBzdXBwb3J0IGZvciB3aWRnZXRFdmVudFByZWZpeFxuXHRcdC8vIGFsd2F5cyB1c2UgdGhlIG5hbWUgKyBhIGNvbG9uIGFzIHRoZSBwcmVmaXgsIGUuZy4sIGRyYWdnYWJsZTpzdGFydFxuXHRcdC8vIGRvbid0IHByZWZpeCBmb3Igd2lkZ2V0cyB0aGF0IGFyZW4ndCBET00tYmFzZWRcblx0XHR3aWRnZXRFdmVudFByZWZpeDogZXhpc3RpbmdDb25zdHJ1Y3RvciA/ICggYmFzZVByb3RvdHlwZS53aWRnZXRFdmVudFByZWZpeCB8fCBuYW1lICkgOiBuYW1lXG5cdH0sIHByb3hpZWRQcm90b3R5cGUsIHtcblx0XHRjb25zdHJ1Y3RvcjogY29uc3RydWN0b3IsXG5cdFx0bmFtZXNwYWNlOiBuYW1lc3BhY2UsXG5cdFx0d2lkZ2V0TmFtZTogbmFtZSxcblx0XHR3aWRnZXRGdWxsTmFtZTogZnVsbE5hbWVcblx0fSApO1xuXG5cdC8vIElmIHRoaXMgd2lkZ2V0IGlzIGJlaW5nIHJlZGVmaW5lZCB0aGVuIHdlIG5lZWQgdG8gZmluZCBhbGwgd2lkZ2V0cyB0aGF0XG5cdC8vIGFyZSBpbmhlcml0aW5nIGZyb20gaXQgYW5kIHJlZGVmaW5lIGFsbCBvZiB0aGVtIHNvIHRoYXQgdGhleSBpbmhlcml0IGZyb21cblx0Ly8gdGhlIG5ldyB2ZXJzaW9uIG9mIHRoaXMgd2lkZ2V0LiBXZSdyZSBlc3NlbnRpYWxseSB0cnlpbmcgdG8gcmVwbGFjZSBvbmVcblx0Ly8gbGV2ZWwgaW4gdGhlIHByb3RvdHlwZSBjaGFpbi5cblx0aWYgKCBleGlzdGluZ0NvbnN0cnVjdG9yICkge1xuXHRcdCQuZWFjaCggZXhpc3RpbmdDb25zdHJ1Y3Rvci5fY2hpbGRDb25zdHJ1Y3RvcnMsIGZ1bmN0aW9uKCBpLCBjaGlsZCApIHtcblx0XHRcdHZhciBjaGlsZFByb3RvdHlwZSA9IGNoaWxkLnByb3RvdHlwZTtcblxuXHRcdFx0Ly8gUmVkZWZpbmUgdGhlIGNoaWxkIHdpZGdldCB1c2luZyB0aGUgc2FtZSBwcm90b3R5cGUgdGhhdCB3YXNcblx0XHRcdC8vIG9yaWdpbmFsbHkgdXNlZCwgYnV0IGluaGVyaXQgZnJvbSB0aGUgbmV3IHZlcnNpb24gb2YgdGhlIGJhc2Vcblx0XHRcdCQud2lkZ2V0KCBjaGlsZFByb3RvdHlwZS5uYW1lc3BhY2UgKyBcIi5cIiArIGNoaWxkUHJvdG90eXBlLndpZGdldE5hbWUsIGNvbnN0cnVjdG9yLFxuXHRcdFx0XHRjaGlsZC5fcHJvdG8gKTtcblx0XHR9ICk7XG5cblx0XHQvLyBSZW1vdmUgdGhlIGxpc3Qgb2YgZXhpc3RpbmcgY2hpbGQgY29uc3RydWN0b3JzIGZyb20gdGhlIG9sZCBjb25zdHJ1Y3RvclxuXHRcdC8vIHNvIHRoZSBvbGQgY2hpbGQgY29uc3RydWN0b3JzIGNhbiBiZSBnYXJiYWdlIGNvbGxlY3RlZFxuXHRcdGRlbGV0ZSBleGlzdGluZ0NvbnN0cnVjdG9yLl9jaGlsZENvbnN0cnVjdG9ycztcblx0fSBlbHNlIHtcblx0XHRiYXNlLl9jaGlsZENvbnN0cnVjdG9ycy5wdXNoKCBjb25zdHJ1Y3RvciApO1xuXHR9XG5cblx0JC53aWRnZXQuYnJpZGdlKCBuYW1lLCBjb25zdHJ1Y3RvciApO1xuXG5cdHJldHVybiBjb25zdHJ1Y3Rvcjtcbn07XG5cbiQud2lkZ2V0LmV4dGVuZCA9IGZ1bmN0aW9uKCB0YXJnZXQgKSB7XG5cdHZhciBpbnB1dCA9IHdpZGdldFNsaWNlLmNhbGwoIGFyZ3VtZW50cywgMSApO1xuXHR2YXIgaW5wdXRJbmRleCA9IDA7XG5cdHZhciBpbnB1dExlbmd0aCA9IGlucHV0Lmxlbmd0aDtcblx0dmFyIGtleTtcblx0dmFyIHZhbHVlO1xuXG5cdGZvciAoIDsgaW5wdXRJbmRleCA8IGlucHV0TGVuZ3RoOyBpbnB1dEluZGV4KysgKSB7XG5cdFx0Zm9yICgga2V5IGluIGlucHV0WyBpbnB1dEluZGV4IF0gKSB7XG5cdFx0XHR2YWx1ZSA9IGlucHV0WyBpbnB1dEluZGV4IF1bIGtleSBdO1xuXHRcdFx0aWYgKCBpbnB1dFsgaW5wdXRJbmRleCBdLmhhc093blByb3BlcnR5KCBrZXkgKSAmJiB2YWx1ZSAhPT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHRcdC8vIENsb25lIG9iamVjdHNcblx0XHRcdFx0aWYgKCAkLmlzUGxhaW5PYmplY3QoIHZhbHVlICkgKSB7XG5cdFx0XHRcdFx0dGFyZ2V0WyBrZXkgXSA9ICQuaXNQbGFpbk9iamVjdCggdGFyZ2V0WyBrZXkgXSApID9cblx0XHRcdFx0XHRcdCQud2lkZ2V0LmV4dGVuZCgge30sIHRhcmdldFsga2V5IF0sIHZhbHVlICkgOlxuXG5cdFx0XHRcdFx0XHQvLyBEb24ndCBleHRlbmQgc3RyaW5ncywgYXJyYXlzLCBldGMuIHdpdGggb2JqZWN0c1xuXHRcdFx0XHRcdFx0JC53aWRnZXQuZXh0ZW5kKCB7fSwgdmFsdWUgKTtcblxuXHRcdFx0XHQvLyBDb3B5IGV2ZXJ5dGhpbmcgZWxzZSBieSByZWZlcmVuY2Vcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR0YXJnZXRbIGtleSBdID0gdmFsdWU7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblx0cmV0dXJuIHRhcmdldDtcbn07XG5cbiQud2lkZ2V0LmJyaWRnZSA9IGZ1bmN0aW9uKCBuYW1lLCBvYmplY3QgKSB7XG5cdHZhciBmdWxsTmFtZSA9IG9iamVjdC5wcm90b3R5cGUud2lkZ2V0RnVsbE5hbWUgfHwgbmFtZTtcblx0JC5mblsgbmFtZSBdID0gZnVuY3Rpb24oIG9wdGlvbnMgKSB7XG5cdFx0dmFyIGlzTWV0aG9kQ2FsbCA9IHR5cGVvZiBvcHRpb25zID09PSBcInN0cmluZ1wiO1xuXHRcdHZhciBhcmdzID0gd2lkZ2V0U2xpY2UuY2FsbCggYXJndW1lbnRzLCAxICk7XG5cdFx0dmFyIHJldHVyblZhbHVlID0gdGhpcztcblxuXHRcdGlmICggaXNNZXRob2RDYWxsICkge1xuXG5cdFx0XHQvLyBJZiB0aGlzIGlzIGFuIGVtcHR5IGNvbGxlY3Rpb24sIHdlIG5lZWQgdG8gaGF2ZSB0aGUgaW5zdGFuY2UgbWV0aG9kXG5cdFx0XHQvLyByZXR1cm4gdW5kZWZpbmVkIGluc3RlYWQgb2YgdGhlIGpRdWVyeSBpbnN0YW5jZVxuXHRcdFx0aWYgKCAhdGhpcy5sZW5ndGggJiYgb3B0aW9ucyA9PT0gXCJpbnN0YW5jZVwiICkge1xuXHRcdFx0XHRyZXR1cm5WYWx1ZSA9IHVuZGVmaW5lZDtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMuZWFjaCggZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0dmFyIG1ldGhvZFZhbHVlO1xuXHRcdFx0XHRcdHZhciBpbnN0YW5jZSA9ICQuZGF0YSggdGhpcywgZnVsbE5hbWUgKTtcblxuXHRcdFx0XHRcdGlmICggb3B0aW9ucyA9PT0gXCJpbnN0YW5jZVwiICkge1xuXHRcdFx0XHRcdFx0cmV0dXJuVmFsdWUgPSBpbnN0YW5jZTtcblx0XHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAoICFpbnN0YW5jZSApIHtcblx0XHRcdFx0XHRcdHJldHVybiAkLmVycm9yKCBcImNhbm5vdCBjYWxsIG1ldGhvZHMgb24gXCIgKyBuYW1lICtcblx0XHRcdFx0XHRcdFx0XCIgcHJpb3IgdG8gaW5pdGlhbGl6YXRpb247IFwiICtcblx0XHRcdFx0XHRcdFx0XCJhdHRlbXB0ZWQgdG8gY2FsbCBtZXRob2QgJ1wiICsgb3B0aW9ucyArIFwiJ1wiICk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYgKCAhJC5pc0Z1bmN0aW9uKCBpbnN0YW5jZVsgb3B0aW9ucyBdICkgfHwgb3B0aW9ucy5jaGFyQXQoIDAgKSA9PT0gXCJfXCIgKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gJC5lcnJvciggXCJubyBzdWNoIG1ldGhvZCAnXCIgKyBvcHRpb25zICsgXCInIGZvciBcIiArIG5hbWUgK1xuXHRcdFx0XHRcdFx0XHRcIiB3aWRnZXQgaW5zdGFuY2VcIiApO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdG1ldGhvZFZhbHVlID0gaW5zdGFuY2VbIG9wdGlvbnMgXS5hcHBseSggaW5zdGFuY2UsIGFyZ3MgKTtcblxuXHRcdFx0XHRcdGlmICggbWV0aG9kVmFsdWUgIT09IGluc3RhbmNlICYmIG1ldGhvZFZhbHVlICE9PSB1bmRlZmluZWQgKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm5WYWx1ZSA9IG1ldGhvZFZhbHVlICYmIG1ldGhvZFZhbHVlLmpxdWVyeSA/XG5cdFx0XHRcdFx0XHRcdHJldHVyblZhbHVlLnB1c2hTdGFjayggbWV0aG9kVmFsdWUuZ2V0KCkgKSA6XG5cdFx0XHRcdFx0XHRcdG1ldGhvZFZhbHVlO1xuXHRcdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSApO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cblx0XHRcdC8vIEFsbG93IG11bHRpcGxlIGhhc2hlcyB0byBiZSBwYXNzZWQgb24gaW5pdFxuXHRcdFx0aWYgKCBhcmdzLmxlbmd0aCApIHtcblx0XHRcdFx0b3B0aW9ucyA9ICQud2lkZ2V0LmV4dGVuZC5hcHBseSggbnVsbCwgWyBvcHRpb25zIF0uY29uY2F0KCBhcmdzICkgKTtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5lYWNoKCBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGluc3RhbmNlID0gJC5kYXRhKCB0aGlzLCBmdWxsTmFtZSApO1xuXHRcdFx0XHRpZiAoIGluc3RhbmNlICkge1xuXHRcdFx0XHRcdGluc3RhbmNlLm9wdGlvbiggb3B0aW9ucyB8fCB7fSApO1xuXHRcdFx0XHRcdGlmICggaW5zdGFuY2UuX2luaXQgKSB7XG5cdFx0XHRcdFx0XHRpbnN0YW5jZS5faW5pdCgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQkLmRhdGEoIHRoaXMsIGZ1bGxOYW1lLCBuZXcgb2JqZWN0KCBvcHRpb25zLCB0aGlzICkgKTtcblx0XHRcdFx0fVxuXHRcdFx0fSApO1xuXHRcdH1cblxuXHRcdHJldHVybiByZXR1cm5WYWx1ZTtcblx0fTtcbn07XG5cbiQuV2lkZ2V0ID0gZnVuY3Rpb24oIC8qIG9wdGlvbnMsIGVsZW1lbnQgKi8gKSB7fTtcbiQuV2lkZ2V0Ll9jaGlsZENvbnN0cnVjdG9ycyA9IFtdO1xuXG4kLldpZGdldC5wcm90b3R5cGUgPSB7XG5cdHdpZGdldE5hbWU6IFwid2lkZ2V0XCIsXG5cdHdpZGdldEV2ZW50UHJlZml4OiBcIlwiLFxuXHRkZWZhdWx0RWxlbWVudDogXCI8ZGl2PlwiLFxuXG5cdG9wdGlvbnM6IHtcblx0XHRjbGFzc2VzOiB7fSxcblx0XHRkaXNhYmxlZDogZmFsc2UsXG5cblx0XHQvLyBDYWxsYmFja3Ncblx0XHRjcmVhdGU6IG51bGxcblx0fSxcblxuXHRfY3JlYXRlV2lkZ2V0OiBmdW5jdGlvbiggb3B0aW9ucywgZWxlbWVudCApIHtcblx0XHRlbGVtZW50ID0gJCggZWxlbWVudCB8fCB0aGlzLmRlZmF1bHRFbGVtZW50IHx8IHRoaXMgKVsgMCBdO1xuXHRcdHRoaXMuZWxlbWVudCA9ICQoIGVsZW1lbnQgKTtcblx0XHR0aGlzLnV1aWQgPSB3aWRnZXRVdWlkKys7XG5cdFx0dGhpcy5ldmVudE5hbWVzcGFjZSA9IFwiLlwiICsgdGhpcy53aWRnZXROYW1lICsgdGhpcy51dWlkO1xuXG5cdFx0dGhpcy5iaW5kaW5ncyA9ICQoKTtcblx0XHR0aGlzLmhvdmVyYWJsZSA9ICQoKTtcblx0XHR0aGlzLmZvY3VzYWJsZSA9ICQoKTtcblx0XHR0aGlzLmNsYXNzZXNFbGVtZW50TG9va3VwID0ge307XG5cblx0XHRpZiAoIGVsZW1lbnQgIT09IHRoaXMgKSB7XG5cdFx0XHQkLmRhdGEoIGVsZW1lbnQsIHRoaXMud2lkZ2V0RnVsbE5hbWUsIHRoaXMgKTtcblx0XHRcdHRoaXMuX29uKCB0cnVlLCB0aGlzLmVsZW1lbnQsIHtcblx0XHRcdFx0cmVtb3ZlOiBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0XHRcdFx0aWYgKCBldmVudC50YXJnZXQgPT09IGVsZW1lbnQgKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmRlc3Ryb3koKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0gKTtcblx0XHRcdHRoaXMuZG9jdW1lbnQgPSAkKCBlbGVtZW50LnN0eWxlID9cblxuXHRcdFx0XHQvLyBFbGVtZW50IHdpdGhpbiB0aGUgZG9jdW1lbnRcblx0XHRcdFx0ZWxlbWVudC5vd25lckRvY3VtZW50IDpcblxuXHRcdFx0XHQvLyBFbGVtZW50IGlzIHdpbmRvdyBvciBkb2N1bWVudFxuXHRcdFx0XHRlbGVtZW50LmRvY3VtZW50IHx8IGVsZW1lbnQgKTtcblx0XHRcdHRoaXMud2luZG93ID0gJCggdGhpcy5kb2N1bWVudFsgMCBdLmRlZmF1bHRWaWV3IHx8IHRoaXMuZG9jdW1lbnRbIDAgXS5wYXJlbnRXaW5kb3cgKTtcblx0XHR9XG5cblx0XHR0aGlzLm9wdGlvbnMgPSAkLndpZGdldC5leHRlbmQoIHt9LFxuXHRcdFx0dGhpcy5vcHRpb25zLFxuXHRcdFx0dGhpcy5fZ2V0Q3JlYXRlT3B0aW9ucygpLFxuXHRcdFx0b3B0aW9ucyApO1xuXG5cdFx0dGhpcy5fY3JlYXRlKCk7XG5cblx0XHRpZiAoIHRoaXMub3B0aW9ucy5kaXNhYmxlZCApIHtcblx0XHRcdHRoaXMuX3NldE9wdGlvbkRpc2FibGVkKCB0aGlzLm9wdGlvbnMuZGlzYWJsZWQgKTtcblx0XHR9XG5cblx0XHR0aGlzLl90cmlnZ2VyKCBcImNyZWF0ZVwiLCBudWxsLCB0aGlzLl9nZXRDcmVhdGVFdmVudERhdGEoKSApO1xuXHRcdHRoaXMuX2luaXQoKTtcblx0fSxcblxuXHRfZ2V0Q3JlYXRlT3B0aW9uczogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHt9O1xuXHR9LFxuXG5cdF9nZXRDcmVhdGVFdmVudERhdGE6ICQubm9vcCxcblxuXHRfY3JlYXRlOiAkLm5vb3AsXG5cblx0X2luaXQ6ICQubm9vcCxcblxuXHRkZXN0cm95OiBmdW5jdGlvbigpIHtcblx0XHR2YXIgdGhhdCA9IHRoaXM7XG5cblx0XHR0aGlzLl9kZXN0cm95KCk7XG5cdFx0JC5lYWNoKCB0aGlzLmNsYXNzZXNFbGVtZW50TG9va3VwLCBmdW5jdGlvbigga2V5LCB2YWx1ZSApIHtcblx0XHRcdHRoYXQuX3JlbW92ZUNsYXNzKCB2YWx1ZSwga2V5ICk7XG5cdFx0fSApO1xuXG5cdFx0Ly8gV2UgY2FuIHByb2JhYmx5IHJlbW92ZSB0aGUgdW5iaW5kIGNhbGxzIGluIDIuMFxuXHRcdC8vIGFsbCBldmVudCBiaW5kaW5ncyBzaG91bGQgZ28gdGhyb3VnaCB0aGlzLl9vbigpXG5cdFx0dGhpcy5lbGVtZW50XG5cdFx0XHQub2ZmKCB0aGlzLmV2ZW50TmFtZXNwYWNlIClcblx0XHRcdC5yZW1vdmVEYXRhKCB0aGlzLndpZGdldEZ1bGxOYW1lICk7XG5cdFx0dGhpcy53aWRnZXQoKVxuXHRcdFx0Lm9mZiggdGhpcy5ldmVudE5hbWVzcGFjZSApXG5cdFx0XHQucmVtb3ZlQXR0ciggXCJhcmlhLWRpc2FibGVkXCIgKTtcblxuXHRcdC8vIENsZWFuIHVwIGV2ZW50cyBhbmQgc3RhdGVzXG5cdFx0dGhpcy5iaW5kaW5ncy5vZmYoIHRoaXMuZXZlbnROYW1lc3BhY2UgKTtcblx0fSxcblxuXHRfZGVzdHJveTogJC5ub29wLFxuXG5cdHdpZGdldDogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXMuZWxlbWVudDtcblx0fSxcblxuXHRvcHRpb246IGZ1bmN0aW9uKCBrZXksIHZhbHVlICkge1xuXHRcdHZhciBvcHRpb25zID0ga2V5O1xuXHRcdHZhciBwYXJ0cztcblx0XHR2YXIgY3VyT3B0aW9uO1xuXHRcdHZhciBpO1xuXG5cdFx0aWYgKCBhcmd1bWVudHMubGVuZ3RoID09PSAwICkge1xuXG5cdFx0XHQvLyBEb24ndCByZXR1cm4gYSByZWZlcmVuY2UgdG8gdGhlIGludGVybmFsIGhhc2hcblx0XHRcdHJldHVybiAkLndpZGdldC5leHRlbmQoIHt9LCB0aGlzLm9wdGlvbnMgKTtcblx0XHR9XG5cblx0XHRpZiAoIHR5cGVvZiBrZXkgPT09IFwic3RyaW5nXCIgKSB7XG5cblx0XHRcdC8vIEhhbmRsZSBuZXN0ZWQga2V5cywgZS5nLiwgXCJmb28uYmFyXCIgPT4geyBmb286IHsgYmFyOiBfX18gfSB9XG5cdFx0XHRvcHRpb25zID0ge307XG5cdFx0XHRwYXJ0cyA9IGtleS5zcGxpdCggXCIuXCIgKTtcblx0XHRcdGtleSA9IHBhcnRzLnNoaWZ0KCk7XG5cdFx0XHRpZiAoIHBhcnRzLmxlbmd0aCApIHtcblx0XHRcdFx0Y3VyT3B0aW9uID0gb3B0aW9uc1sga2V5IF0gPSAkLndpZGdldC5leHRlbmQoIHt9LCB0aGlzLm9wdGlvbnNbIGtleSBdICk7XG5cdFx0XHRcdGZvciAoIGkgPSAwOyBpIDwgcGFydHMubGVuZ3RoIC0gMTsgaSsrICkge1xuXHRcdFx0XHRcdGN1ck9wdGlvblsgcGFydHNbIGkgXSBdID0gY3VyT3B0aW9uWyBwYXJ0c1sgaSBdIF0gfHwge307XG5cdFx0XHRcdFx0Y3VyT3B0aW9uID0gY3VyT3B0aW9uWyBwYXJ0c1sgaSBdIF07XG5cdFx0XHRcdH1cblx0XHRcdFx0a2V5ID0gcGFydHMucG9wKCk7XG5cdFx0XHRcdGlmICggYXJndW1lbnRzLmxlbmd0aCA9PT0gMSApIHtcblx0XHRcdFx0XHRyZXR1cm4gY3VyT3B0aW9uWyBrZXkgXSA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IGN1ck9wdGlvblsga2V5IF07XG5cdFx0XHRcdH1cblx0XHRcdFx0Y3VyT3B0aW9uWyBrZXkgXSA9IHZhbHVlO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0aWYgKCBhcmd1bWVudHMubGVuZ3RoID09PSAxICkge1xuXHRcdFx0XHRcdHJldHVybiB0aGlzLm9wdGlvbnNbIGtleSBdID09PSB1bmRlZmluZWQgPyBudWxsIDogdGhpcy5vcHRpb25zWyBrZXkgXTtcblx0XHRcdFx0fVxuXHRcdFx0XHRvcHRpb25zWyBrZXkgXSA9IHZhbHVlO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHRoaXMuX3NldE9wdGlvbnMoIG9wdGlvbnMgKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXG5cdF9zZXRPcHRpb25zOiBmdW5jdGlvbiggb3B0aW9ucyApIHtcblx0XHR2YXIga2V5O1xuXG5cdFx0Zm9yICgga2V5IGluIG9wdGlvbnMgKSB7XG5cdFx0XHR0aGlzLl9zZXRPcHRpb24oIGtleSwgb3B0aW9uc1sga2V5IF0gKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblxuXHRfc2V0T3B0aW9uOiBmdW5jdGlvbigga2V5LCB2YWx1ZSApIHtcblx0XHRpZiAoIGtleSA9PT0gXCJjbGFzc2VzXCIgKSB7XG5cdFx0XHR0aGlzLl9zZXRPcHRpb25DbGFzc2VzKCB2YWx1ZSApO1xuXHRcdH1cblxuXHRcdHRoaXMub3B0aW9uc1sga2V5IF0gPSB2YWx1ZTtcblxuXHRcdGlmICgga2V5ID09PSBcImRpc2FibGVkXCIgKSB7XG5cdFx0XHR0aGlzLl9zZXRPcHRpb25EaXNhYmxlZCggdmFsdWUgKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblxuXHRfc2V0T3B0aW9uQ2xhc3NlczogZnVuY3Rpb24oIHZhbHVlICkge1xuXHRcdHZhciBjbGFzc0tleSwgZWxlbWVudHMsIGN1cnJlbnRFbGVtZW50cztcblxuXHRcdGZvciAoIGNsYXNzS2V5IGluIHZhbHVlICkge1xuXHRcdFx0Y3VycmVudEVsZW1lbnRzID0gdGhpcy5jbGFzc2VzRWxlbWVudExvb2t1cFsgY2xhc3NLZXkgXTtcblx0XHRcdGlmICggdmFsdWVbIGNsYXNzS2V5IF0gPT09IHRoaXMub3B0aW9ucy5jbGFzc2VzWyBjbGFzc0tleSBdIHx8XG5cdFx0XHRcdFx0IWN1cnJlbnRFbGVtZW50cyB8fFxuXHRcdFx0XHRcdCFjdXJyZW50RWxlbWVudHMubGVuZ3RoICkge1xuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gV2UgYXJlIGRvaW5nIHRoaXMgdG8gY3JlYXRlIGEgbmV3IGpRdWVyeSBvYmplY3QgYmVjYXVzZSB0aGUgX3JlbW92ZUNsYXNzKCkgY2FsbFxuXHRcdFx0Ly8gb24gdGhlIG5leHQgbGluZSBpcyBnb2luZyB0byBkZXN0cm95IHRoZSByZWZlcmVuY2UgdG8gdGhlIGN1cnJlbnQgZWxlbWVudHMgYmVpbmdcblx0XHRcdC8vIHRyYWNrZWQuIFdlIG5lZWQgdG8gc2F2ZSBhIGNvcHkgb2YgdGhpcyBjb2xsZWN0aW9uIHNvIHRoYXQgd2UgY2FuIGFkZCB0aGUgbmV3IGNsYXNzZXNcblx0XHRcdC8vIGJlbG93LlxuXHRcdFx0ZWxlbWVudHMgPSAkKCBjdXJyZW50RWxlbWVudHMuZ2V0KCkgKTtcblx0XHRcdHRoaXMuX3JlbW92ZUNsYXNzKCBjdXJyZW50RWxlbWVudHMsIGNsYXNzS2V5ICk7XG5cblx0XHRcdC8vIFdlIGRvbid0IHVzZSBfYWRkQ2xhc3MoKSBoZXJlLCBiZWNhdXNlIHRoYXQgdXNlcyB0aGlzLm9wdGlvbnMuY2xhc3Nlc1xuXHRcdFx0Ly8gZm9yIGdlbmVyYXRpbmcgdGhlIHN0cmluZyBvZiBjbGFzc2VzLiBXZSB3YW50IHRvIHVzZSB0aGUgdmFsdWUgcGFzc2VkIGluIGZyb21cblx0XHRcdC8vIF9zZXRPcHRpb24oKSwgdGhpcyBpcyB0aGUgbmV3IHZhbHVlIG9mIHRoZSBjbGFzc2VzIG9wdGlvbiB3aGljaCB3YXMgcGFzc2VkIHRvXG5cdFx0XHQvLyBfc2V0T3B0aW9uKCkuIFdlIHBhc3MgdGhpcyB2YWx1ZSBkaXJlY3RseSB0byBfY2xhc3NlcygpLlxuXHRcdFx0ZWxlbWVudHMuYWRkQ2xhc3MoIHRoaXMuX2NsYXNzZXMoIHtcblx0XHRcdFx0ZWxlbWVudDogZWxlbWVudHMsXG5cdFx0XHRcdGtleXM6IGNsYXNzS2V5LFxuXHRcdFx0XHRjbGFzc2VzOiB2YWx1ZSxcblx0XHRcdFx0YWRkOiB0cnVlXG5cdFx0XHR9ICkgKTtcblx0XHR9XG5cdH0sXG5cblx0X3NldE9wdGlvbkRpc2FibGVkOiBmdW5jdGlvbiggdmFsdWUgKSB7XG5cdFx0dGhpcy5fdG9nZ2xlQ2xhc3MoIHRoaXMud2lkZ2V0KCksIHRoaXMud2lkZ2V0RnVsbE5hbWUgKyBcIi1kaXNhYmxlZFwiLCBudWxsLCAhIXZhbHVlICk7XG5cblx0XHQvLyBJZiB0aGUgd2lkZ2V0IGlzIGJlY29taW5nIGRpc2FibGVkLCB0aGVuIG5vdGhpbmcgaXMgaW50ZXJhY3RpdmVcblx0XHRpZiAoIHZhbHVlICkge1xuXHRcdFx0dGhpcy5fcmVtb3ZlQ2xhc3MoIHRoaXMuaG92ZXJhYmxlLCBudWxsLCBcInVpLXN0YXRlLWhvdmVyXCIgKTtcblx0XHRcdHRoaXMuX3JlbW92ZUNsYXNzKCB0aGlzLmZvY3VzYWJsZSwgbnVsbCwgXCJ1aS1zdGF0ZS1mb2N1c1wiICk7XG5cdFx0fVxuXHR9LFxuXG5cdGVuYWJsZTogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXMuX3NldE9wdGlvbnMoIHsgZGlzYWJsZWQ6IGZhbHNlIH0gKTtcblx0fSxcblxuXHRkaXNhYmxlOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gdGhpcy5fc2V0T3B0aW9ucyggeyBkaXNhYmxlZDogdHJ1ZSB9ICk7XG5cdH0sXG5cblx0X2NsYXNzZXM6IGZ1bmN0aW9uKCBvcHRpb25zICkge1xuXHRcdHZhciBmdWxsID0gW107XG5cdFx0dmFyIHRoYXQgPSB0aGlzO1xuXG5cdFx0b3B0aW9ucyA9ICQuZXh0ZW5kKCB7XG5cdFx0XHRlbGVtZW50OiB0aGlzLmVsZW1lbnQsXG5cdFx0XHRjbGFzc2VzOiB0aGlzLm9wdGlvbnMuY2xhc3NlcyB8fCB7fVxuXHRcdH0sIG9wdGlvbnMgKTtcblxuXHRcdGZ1bmN0aW9uIHByb2Nlc3NDbGFzc1N0cmluZyggY2xhc3NlcywgY2hlY2tPcHRpb24gKSB7XG5cdFx0XHR2YXIgY3VycmVudCwgaTtcblx0XHRcdGZvciAoIGkgPSAwOyBpIDwgY2xhc3Nlcy5sZW5ndGg7IGkrKyApIHtcblx0XHRcdFx0Y3VycmVudCA9IHRoYXQuY2xhc3Nlc0VsZW1lbnRMb29rdXBbIGNsYXNzZXNbIGkgXSBdIHx8ICQoKTtcblx0XHRcdFx0aWYgKCBvcHRpb25zLmFkZCApIHtcblx0XHRcdFx0XHRjdXJyZW50ID0gJCggJC51bmlxdWUoIGN1cnJlbnQuZ2V0KCkuY29uY2F0KCBvcHRpb25zLmVsZW1lbnQuZ2V0KCkgKSApICk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Y3VycmVudCA9ICQoIGN1cnJlbnQubm90KCBvcHRpb25zLmVsZW1lbnQgKS5nZXQoKSApO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHRoYXQuY2xhc3Nlc0VsZW1lbnRMb29rdXBbIGNsYXNzZXNbIGkgXSBdID0gY3VycmVudDtcblx0XHRcdFx0ZnVsbC5wdXNoKCBjbGFzc2VzWyBpIF0gKTtcblx0XHRcdFx0aWYgKCBjaGVja09wdGlvbiAmJiBvcHRpb25zLmNsYXNzZXNbIGNsYXNzZXNbIGkgXSBdICkge1xuXHRcdFx0XHRcdGZ1bGwucHVzaCggb3B0aW9ucy5jbGFzc2VzWyBjbGFzc2VzWyBpIF0gXSApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dGhpcy5fb24oIG9wdGlvbnMuZWxlbWVudCwge1xuXHRcdFx0XCJyZW1vdmVcIjogXCJfdW50cmFja0NsYXNzZXNFbGVtZW50XCJcblx0XHR9ICk7XG5cblx0XHRpZiAoIG9wdGlvbnMua2V5cyApIHtcblx0XHRcdHByb2Nlc3NDbGFzc1N0cmluZyggb3B0aW9ucy5rZXlzLm1hdGNoKCAvXFxTKy9nICkgfHwgW10sIHRydWUgKTtcblx0XHR9XG5cdFx0aWYgKCBvcHRpb25zLmV4dHJhICkge1xuXHRcdFx0cHJvY2Vzc0NsYXNzU3RyaW5nKCBvcHRpb25zLmV4dHJhLm1hdGNoKCAvXFxTKy9nICkgfHwgW10gKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gZnVsbC5qb2luKCBcIiBcIiApO1xuXHR9LFxuXG5cdF91bnRyYWNrQ2xhc3Nlc0VsZW1lbnQ6IGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHR2YXIgdGhhdCA9IHRoaXM7XG5cdFx0JC5lYWNoKCB0aGF0LmNsYXNzZXNFbGVtZW50TG9va3VwLCBmdW5jdGlvbigga2V5LCB2YWx1ZSApIHtcblx0XHRcdGlmICggJC5pbkFycmF5KCBldmVudC50YXJnZXQsIHZhbHVlICkgIT09IC0xICkge1xuXHRcdFx0XHR0aGF0LmNsYXNzZXNFbGVtZW50TG9va3VwWyBrZXkgXSA9ICQoIHZhbHVlLm5vdCggZXZlbnQudGFyZ2V0ICkuZ2V0KCkgKTtcblx0XHRcdH1cblx0XHR9ICk7XG5cdH0sXG5cblx0X3JlbW92ZUNsYXNzOiBmdW5jdGlvbiggZWxlbWVudCwga2V5cywgZXh0cmEgKSB7XG5cdFx0cmV0dXJuIHRoaXMuX3RvZ2dsZUNsYXNzKCBlbGVtZW50LCBrZXlzLCBleHRyYSwgZmFsc2UgKTtcblx0fSxcblxuXHRfYWRkQ2xhc3M6IGZ1bmN0aW9uKCBlbGVtZW50LCBrZXlzLCBleHRyYSApIHtcblx0XHRyZXR1cm4gdGhpcy5fdG9nZ2xlQ2xhc3MoIGVsZW1lbnQsIGtleXMsIGV4dHJhLCB0cnVlICk7XG5cdH0sXG5cblx0X3RvZ2dsZUNsYXNzOiBmdW5jdGlvbiggZWxlbWVudCwga2V5cywgZXh0cmEsIGFkZCApIHtcblx0XHRhZGQgPSAoIHR5cGVvZiBhZGQgPT09IFwiYm9vbGVhblwiICkgPyBhZGQgOiBleHRyYTtcblx0XHR2YXIgc2hpZnQgPSAoIHR5cGVvZiBlbGVtZW50ID09PSBcInN0cmluZ1wiIHx8IGVsZW1lbnQgPT09IG51bGwgKSxcblx0XHRcdG9wdGlvbnMgPSB7XG5cdFx0XHRcdGV4dHJhOiBzaGlmdCA/IGtleXMgOiBleHRyYSxcblx0XHRcdFx0a2V5czogc2hpZnQgPyBlbGVtZW50IDoga2V5cyxcblx0XHRcdFx0ZWxlbWVudDogc2hpZnQgPyB0aGlzLmVsZW1lbnQgOiBlbGVtZW50LFxuXHRcdFx0XHRhZGQ6IGFkZFxuXHRcdFx0fTtcblx0XHRvcHRpb25zLmVsZW1lbnQudG9nZ2xlQ2xhc3MoIHRoaXMuX2NsYXNzZXMoIG9wdGlvbnMgKSwgYWRkICk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cblx0X29uOiBmdW5jdGlvbiggc3VwcHJlc3NEaXNhYmxlZENoZWNrLCBlbGVtZW50LCBoYW5kbGVycyApIHtcblx0XHR2YXIgZGVsZWdhdGVFbGVtZW50O1xuXHRcdHZhciBpbnN0YW5jZSA9IHRoaXM7XG5cblx0XHQvLyBObyBzdXBwcmVzc0Rpc2FibGVkQ2hlY2sgZmxhZywgc2h1ZmZsZSBhcmd1bWVudHNcblx0XHRpZiAoIHR5cGVvZiBzdXBwcmVzc0Rpc2FibGVkQ2hlY2sgIT09IFwiYm9vbGVhblwiICkge1xuXHRcdFx0aGFuZGxlcnMgPSBlbGVtZW50O1xuXHRcdFx0ZWxlbWVudCA9IHN1cHByZXNzRGlzYWJsZWRDaGVjaztcblx0XHRcdHN1cHByZXNzRGlzYWJsZWRDaGVjayA9IGZhbHNlO1xuXHRcdH1cblxuXHRcdC8vIE5vIGVsZW1lbnQgYXJndW1lbnQsIHNodWZmbGUgYW5kIHVzZSB0aGlzLmVsZW1lbnRcblx0XHRpZiAoICFoYW5kbGVycyApIHtcblx0XHRcdGhhbmRsZXJzID0gZWxlbWVudDtcblx0XHRcdGVsZW1lbnQgPSB0aGlzLmVsZW1lbnQ7XG5cdFx0XHRkZWxlZ2F0ZUVsZW1lbnQgPSB0aGlzLndpZGdldCgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRlbGVtZW50ID0gZGVsZWdhdGVFbGVtZW50ID0gJCggZWxlbWVudCApO1xuXHRcdFx0dGhpcy5iaW5kaW5ncyA9IHRoaXMuYmluZGluZ3MuYWRkKCBlbGVtZW50ICk7XG5cdFx0fVxuXG5cdFx0JC5lYWNoKCBoYW5kbGVycywgZnVuY3Rpb24oIGV2ZW50LCBoYW5kbGVyICkge1xuXHRcdFx0ZnVuY3Rpb24gaGFuZGxlclByb3h5KCkge1xuXG5cdFx0XHRcdC8vIEFsbG93IHdpZGdldHMgdG8gY3VzdG9taXplIHRoZSBkaXNhYmxlZCBoYW5kbGluZ1xuXHRcdFx0XHQvLyAtIGRpc2FibGVkIGFzIGFuIGFycmF5IGluc3RlYWQgb2YgYm9vbGVhblxuXHRcdFx0XHQvLyAtIGRpc2FibGVkIGNsYXNzIGFzIG1ldGhvZCBmb3IgZGlzYWJsaW5nIGluZGl2aWR1YWwgcGFydHNcblx0XHRcdFx0aWYgKCAhc3VwcHJlc3NEaXNhYmxlZENoZWNrICYmXG5cdFx0XHRcdFx0XHQoIGluc3RhbmNlLm9wdGlvbnMuZGlzYWJsZWQgPT09IHRydWUgfHxcblx0XHRcdFx0XHRcdCQoIHRoaXMgKS5oYXNDbGFzcyggXCJ1aS1zdGF0ZS1kaXNhYmxlZFwiICkgKSApIHtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuICggdHlwZW9mIGhhbmRsZXIgPT09IFwic3RyaW5nXCIgPyBpbnN0YW5jZVsgaGFuZGxlciBdIDogaGFuZGxlciApXG5cdFx0XHRcdFx0LmFwcGx5KCBpbnN0YW5jZSwgYXJndW1lbnRzICk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIENvcHkgdGhlIGd1aWQgc28gZGlyZWN0IHVuYmluZGluZyB3b3Jrc1xuXHRcdFx0aWYgKCB0eXBlb2YgaGFuZGxlciAhPT0gXCJzdHJpbmdcIiApIHtcblx0XHRcdFx0aGFuZGxlclByb3h5Lmd1aWQgPSBoYW5kbGVyLmd1aWQgPVxuXHRcdFx0XHRcdGhhbmRsZXIuZ3VpZCB8fCBoYW5kbGVyUHJveHkuZ3VpZCB8fCAkLmd1aWQrKztcblx0XHRcdH1cblxuXHRcdFx0dmFyIG1hdGNoID0gZXZlbnQubWF0Y2goIC9eKFtcXHc6LV0qKVxccyooLiopJC8gKTtcblx0XHRcdHZhciBldmVudE5hbWUgPSBtYXRjaFsgMSBdICsgaW5zdGFuY2UuZXZlbnROYW1lc3BhY2U7XG5cdFx0XHR2YXIgc2VsZWN0b3IgPSBtYXRjaFsgMiBdO1xuXG5cdFx0XHRpZiAoIHNlbGVjdG9yICkge1xuXHRcdFx0XHRkZWxlZ2F0ZUVsZW1lbnQub24oIGV2ZW50TmFtZSwgc2VsZWN0b3IsIGhhbmRsZXJQcm94eSApO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0ZWxlbWVudC5vbiggZXZlbnROYW1lLCBoYW5kbGVyUHJveHkgKTtcblx0XHRcdH1cblx0XHR9ICk7XG5cdH0sXG5cblx0X29mZjogZnVuY3Rpb24oIGVsZW1lbnQsIGV2ZW50TmFtZSApIHtcblx0XHRldmVudE5hbWUgPSAoIGV2ZW50TmFtZSB8fCBcIlwiICkuc3BsaXQoIFwiIFwiICkuam9pbiggdGhpcy5ldmVudE5hbWVzcGFjZSArIFwiIFwiICkgK1xuXHRcdFx0dGhpcy5ldmVudE5hbWVzcGFjZTtcblx0XHRlbGVtZW50Lm9mZiggZXZlbnROYW1lICkub2ZmKCBldmVudE5hbWUgKTtcblxuXHRcdC8vIENsZWFyIHRoZSBzdGFjayB0byBhdm9pZCBtZW1vcnkgbGVha3MgKCMxMDA1Nilcblx0XHR0aGlzLmJpbmRpbmdzID0gJCggdGhpcy5iaW5kaW5ncy5ub3QoIGVsZW1lbnQgKS5nZXQoKSApO1xuXHRcdHRoaXMuZm9jdXNhYmxlID0gJCggdGhpcy5mb2N1c2FibGUubm90KCBlbGVtZW50ICkuZ2V0KCkgKTtcblx0XHR0aGlzLmhvdmVyYWJsZSA9ICQoIHRoaXMuaG92ZXJhYmxlLm5vdCggZWxlbWVudCApLmdldCgpICk7XG5cdH0sXG5cblx0X2RlbGF5OiBmdW5jdGlvbiggaGFuZGxlciwgZGVsYXkgKSB7XG5cdFx0ZnVuY3Rpb24gaGFuZGxlclByb3h5KCkge1xuXHRcdFx0cmV0dXJuICggdHlwZW9mIGhhbmRsZXIgPT09IFwic3RyaW5nXCIgPyBpbnN0YW5jZVsgaGFuZGxlciBdIDogaGFuZGxlciApXG5cdFx0XHRcdC5hcHBseSggaW5zdGFuY2UsIGFyZ3VtZW50cyApO1xuXHRcdH1cblx0XHR2YXIgaW5zdGFuY2UgPSB0aGlzO1xuXHRcdHJldHVybiBzZXRUaW1lb3V0KCBoYW5kbGVyUHJveHksIGRlbGF5IHx8IDAgKTtcblx0fSxcblxuXHRfaG92ZXJhYmxlOiBmdW5jdGlvbiggZWxlbWVudCApIHtcblx0XHR0aGlzLmhvdmVyYWJsZSA9IHRoaXMuaG92ZXJhYmxlLmFkZCggZWxlbWVudCApO1xuXHRcdHRoaXMuX29uKCBlbGVtZW50LCB7XG5cdFx0XHRtb3VzZWVudGVyOiBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0XHRcdHRoaXMuX2FkZENsYXNzKCAkKCBldmVudC5jdXJyZW50VGFyZ2V0ICksIG51bGwsIFwidWktc3RhdGUtaG92ZXJcIiApO1xuXHRcdFx0fSxcblx0XHRcdG1vdXNlbGVhdmU6IGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHRcdFx0dGhpcy5fcmVtb3ZlQ2xhc3MoICQoIGV2ZW50LmN1cnJlbnRUYXJnZXQgKSwgbnVsbCwgXCJ1aS1zdGF0ZS1ob3ZlclwiICk7XG5cdFx0XHR9XG5cdFx0fSApO1xuXHR9LFxuXG5cdF9mb2N1c2FibGU6IGZ1bmN0aW9uKCBlbGVtZW50ICkge1xuXHRcdHRoaXMuZm9jdXNhYmxlID0gdGhpcy5mb2N1c2FibGUuYWRkKCBlbGVtZW50ICk7XG5cdFx0dGhpcy5fb24oIGVsZW1lbnQsIHtcblx0XHRcdGZvY3VzaW46IGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHRcdFx0dGhpcy5fYWRkQ2xhc3MoICQoIGV2ZW50LmN1cnJlbnRUYXJnZXQgKSwgbnVsbCwgXCJ1aS1zdGF0ZS1mb2N1c1wiICk7XG5cdFx0XHR9LFxuXHRcdFx0Zm9jdXNvdXQ6IGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHRcdFx0dGhpcy5fcmVtb3ZlQ2xhc3MoICQoIGV2ZW50LmN1cnJlbnRUYXJnZXQgKSwgbnVsbCwgXCJ1aS1zdGF0ZS1mb2N1c1wiICk7XG5cdFx0XHR9XG5cdFx0fSApO1xuXHR9LFxuXG5cdF90cmlnZ2VyOiBmdW5jdGlvbiggdHlwZSwgZXZlbnQsIGRhdGEgKSB7XG5cdFx0dmFyIHByb3AsIG9yaWc7XG5cdFx0dmFyIGNhbGxiYWNrID0gdGhpcy5vcHRpb25zWyB0eXBlIF07XG5cblx0XHRkYXRhID0gZGF0YSB8fCB7fTtcblx0XHRldmVudCA9ICQuRXZlbnQoIGV2ZW50ICk7XG5cdFx0ZXZlbnQudHlwZSA9ICggdHlwZSA9PT0gdGhpcy53aWRnZXRFdmVudFByZWZpeCA/XG5cdFx0XHR0eXBlIDpcblx0XHRcdHRoaXMud2lkZ2V0RXZlbnRQcmVmaXggKyB0eXBlICkudG9Mb3dlckNhc2UoKTtcblxuXHRcdC8vIFRoZSBvcmlnaW5hbCBldmVudCBtYXkgY29tZSBmcm9tIGFueSBlbGVtZW50XG5cdFx0Ly8gc28gd2UgbmVlZCB0byByZXNldCB0aGUgdGFyZ2V0IG9uIHRoZSBuZXcgZXZlbnRcblx0XHRldmVudC50YXJnZXQgPSB0aGlzLmVsZW1lbnRbIDAgXTtcblxuXHRcdC8vIENvcHkgb3JpZ2luYWwgZXZlbnQgcHJvcGVydGllcyBvdmVyIHRvIHRoZSBuZXcgZXZlbnRcblx0XHRvcmlnID0gZXZlbnQub3JpZ2luYWxFdmVudDtcblx0XHRpZiAoIG9yaWcgKSB7XG5cdFx0XHRmb3IgKCBwcm9wIGluIG9yaWcgKSB7XG5cdFx0XHRcdGlmICggISggcHJvcCBpbiBldmVudCApICkge1xuXHRcdFx0XHRcdGV2ZW50WyBwcm9wIF0gPSBvcmlnWyBwcm9wIF07XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHR0aGlzLmVsZW1lbnQudHJpZ2dlciggZXZlbnQsIGRhdGEgKTtcblx0XHRyZXR1cm4gISggJC5pc0Z1bmN0aW9uKCBjYWxsYmFjayApICYmXG5cdFx0XHRjYWxsYmFjay5hcHBseSggdGhpcy5lbGVtZW50WyAwIF0sIFsgZXZlbnQgXS5jb25jYXQoIGRhdGEgKSApID09PSBmYWxzZSB8fFxuXHRcdFx0ZXZlbnQuaXNEZWZhdWx0UHJldmVudGVkKCkgKTtcblx0fVxufTtcblxuJC5lYWNoKCB7IHNob3c6IFwiZmFkZUluXCIsIGhpZGU6IFwiZmFkZU91dFwiIH0sIGZ1bmN0aW9uKCBtZXRob2QsIGRlZmF1bHRFZmZlY3QgKSB7XG5cdCQuV2lkZ2V0LnByb3RvdHlwZVsgXCJfXCIgKyBtZXRob2QgXSA9IGZ1bmN0aW9uKCBlbGVtZW50LCBvcHRpb25zLCBjYWxsYmFjayApIHtcblx0XHRpZiAoIHR5cGVvZiBvcHRpb25zID09PSBcInN0cmluZ1wiICkge1xuXHRcdFx0b3B0aW9ucyA9IHsgZWZmZWN0OiBvcHRpb25zIH07XG5cdFx0fVxuXG5cdFx0dmFyIGhhc09wdGlvbnM7XG5cdFx0dmFyIGVmZmVjdE5hbWUgPSAhb3B0aW9ucyA/XG5cdFx0XHRtZXRob2QgOlxuXHRcdFx0b3B0aW9ucyA9PT0gdHJ1ZSB8fCB0eXBlb2Ygb3B0aW9ucyA9PT0gXCJudW1iZXJcIiA/XG5cdFx0XHRcdGRlZmF1bHRFZmZlY3QgOlxuXHRcdFx0XHRvcHRpb25zLmVmZmVjdCB8fCBkZWZhdWx0RWZmZWN0O1xuXG5cdFx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cdFx0aWYgKCB0eXBlb2Ygb3B0aW9ucyA9PT0gXCJudW1iZXJcIiApIHtcblx0XHRcdG9wdGlvbnMgPSB7IGR1cmF0aW9uOiBvcHRpb25zIH07XG5cdFx0fVxuXG5cdFx0aGFzT3B0aW9ucyA9ICEkLmlzRW1wdHlPYmplY3QoIG9wdGlvbnMgKTtcblx0XHRvcHRpb25zLmNvbXBsZXRlID0gY2FsbGJhY2s7XG5cblx0XHRpZiAoIG9wdGlvbnMuZGVsYXkgKSB7XG5cdFx0XHRlbGVtZW50LmRlbGF5KCBvcHRpb25zLmRlbGF5ICk7XG5cdFx0fVxuXG5cdFx0aWYgKCBoYXNPcHRpb25zICYmICQuZWZmZWN0cyAmJiAkLmVmZmVjdHMuZWZmZWN0WyBlZmZlY3ROYW1lIF0gKSB7XG5cdFx0XHRlbGVtZW50WyBtZXRob2QgXSggb3B0aW9ucyApO1xuXHRcdH0gZWxzZSBpZiAoIGVmZmVjdE5hbWUgIT09IG1ldGhvZCAmJiBlbGVtZW50WyBlZmZlY3ROYW1lIF0gKSB7XG5cdFx0XHRlbGVtZW50WyBlZmZlY3ROYW1lIF0oIG9wdGlvbnMuZHVyYXRpb24sIG9wdGlvbnMuZWFzaW5nLCBjYWxsYmFjayApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRlbGVtZW50LnF1ZXVlKCBmdW5jdGlvbiggbmV4dCApIHtcblx0XHRcdFx0JCggdGhpcyApWyBtZXRob2QgXSgpO1xuXHRcdFx0XHRpZiAoIGNhbGxiYWNrICkge1xuXHRcdFx0XHRcdGNhbGxiYWNrLmNhbGwoIGVsZW1lbnRbIDAgXSApO1xuXHRcdFx0XHR9XG5cdFx0XHRcdG5leHQoKTtcblx0XHRcdH0gKTtcblx0XHR9XG5cdH07XG59ICk7XG5cbnJldHVybiAkLndpZGdldDtcblxufSApICk7XG4iLCIoIGZ1bmN0aW9uKCBmYWN0b3J5ICkge1xuXHRpZiAoIHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kICkge1xuXG5cdFx0Ly8gQU1ELiBSZWdpc3RlciBhcyBhbiBhbm9ueW1vdXMgbW9kdWxlLlxuXHRcdGRlZmluZSggWyBcImpxdWVyeVwiIF0sIGZhY3RvcnkgKTtcblx0fSBlbHNlIHtcblxuXHRcdC8vIEJyb3dzZXIgZ2xvYmFsc1xuXHRcdGZhY3RvcnkoIGpRdWVyeSApO1xuXHR9XG59ICggZnVuY3Rpb24oICQgKSB7XG5cbiQudWkgPSAkLnVpIHx8IHt9O1xuXG5yZXR1cm4gJC51aS52ZXJzaW9uID0gXCIxLjEyLjFcIjtcblxufSApICk7XG4iLCIvKiFcbiAqIGpRdWVyeSBVSSBTY3JvbGwgUGFyZW50IDEuMTIuMVxuICogaHR0cDovL2pxdWVyeXVpLmNvbVxuICpcbiAqIENvcHlyaWdodCBqUXVlcnkgRm91bmRhdGlvbiBhbmQgb3RoZXIgY29udHJpYnV0b3JzXG4gKiBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuXG4gKiBodHRwOi8vanF1ZXJ5Lm9yZy9saWNlbnNlXG4gKi9cblxuLy8+PmxhYmVsOiBzY3JvbGxQYXJlbnRcbi8vPj5ncm91cDogQ29yZVxuLy8+PmRlc2NyaXB0aW9uOiBHZXQgdGhlIGNsb3Nlc3QgYW5jZXN0b3IgZWxlbWVudCB0aGF0IGlzIHNjcm9sbGFibGUuXG4vLz4+ZG9jczogaHR0cDovL2FwaS5qcXVlcnl1aS5jb20vc2Nyb2xsUGFyZW50L1xuXG4oIGZ1bmN0aW9uKCBmYWN0b3J5ICkge1xuXHRpZiAoIHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kICkge1xuXG5cdFx0Ly8gQU1ELiBSZWdpc3RlciBhcyBhbiBhbm9ueW1vdXMgbW9kdWxlLlxuXHRcdGRlZmluZSggWyBcImpxdWVyeVwiLCBcIi4vdmVyc2lvblwiIF0sIGZhY3RvcnkgKTtcblx0fSBlbHNlIHtcblxuXHRcdC8vIEJyb3dzZXIgZ2xvYmFsc1xuXHRcdGZhY3RvcnkoIGpRdWVyeSApO1xuXHR9XG59ICggZnVuY3Rpb24oICQgKSB7XG5cbnJldHVybiAkLmZuLnNjcm9sbFBhcmVudCA9IGZ1bmN0aW9uKCBpbmNsdWRlSGlkZGVuICkge1xuXHR2YXIgcG9zaXRpb24gPSB0aGlzLmNzcyggXCJwb3NpdGlvblwiICksXG5cdFx0ZXhjbHVkZVN0YXRpY1BhcmVudCA9IHBvc2l0aW9uID09PSBcImFic29sdXRlXCIsXG5cdFx0b3ZlcmZsb3dSZWdleCA9IGluY2x1ZGVIaWRkZW4gPyAvKGF1dG98c2Nyb2xsfGhpZGRlbikvIDogLyhhdXRvfHNjcm9sbCkvLFxuXHRcdHNjcm9sbFBhcmVudCA9IHRoaXMucGFyZW50cygpLmZpbHRlciggZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgcGFyZW50ID0gJCggdGhpcyApO1xuXHRcdFx0aWYgKCBleGNsdWRlU3RhdGljUGFyZW50ICYmIHBhcmVudC5jc3MoIFwicG9zaXRpb25cIiApID09PSBcInN0YXRpY1wiICkge1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gb3ZlcmZsb3dSZWdleC50ZXN0KCBwYXJlbnQuY3NzKCBcIm92ZXJmbG93XCIgKSArIHBhcmVudC5jc3MoIFwib3ZlcmZsb3cteVwiICkgK1xuXHRcdFx0XHRwYXJlbnQuY3NzKCBcIm92ZXJmbG93LXhcIiApICk7XG5cdFx0fSApLmVxKCAwICk7XG5cblx0cmV0dXJuIHBvc2l0aW9uID09PSBcImZpeGVkXCIgfHwgIXNjcm9sbFBhcmVudC5sZW5ndGggP1xuXHRcdCQoIHRoaXNbIDAgXS5vd25lckRvY3VtZW50IHx8IGRvY3VtZW50ICkgOlxuXHRcdHNjcm9sbFBhcmVudDtcbn07XG5cbn0gKSApO1xuIiwiKCBmdW5jdGlvbiggZmFjdG9yeSApIHtcblx0aWYgKCB0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCApIHtcblxuXHRcdC8vIEFNRC4gUmVnaXN0ZXIgYXMgYW4gYW5vbnltb3VzIG1vZHVsZS5cblx0XHRkZWZpbmUoIFsgXCJqcXVlcnlcIiwgXCIuL3ZlcnNpb25cIiBdLCBmYWN0b3J5ICk7XG5cdH0gZWxzZSB7XG5cblx0XHQvLyBCcm93c2VyIGdsb2JhbHNcblx0XHRmYWN0b3J5KCBqUXVlcnkgKTtcblx0fVxufSAoIGZ1bmN0aW9uKCAkICkge1xucmV0dXJuICQudWkuc2FmZUJsdXIgPSBmdW5jdGlvbiggZWxlbWVudCApIHtcblxuXHQvLyBTdXBwb3J0OiBJRTkgLSAxMCBvbmx5XG5cdC8vIElmIHRoZSA8Ym9keT4gaXMgYmx1cnJlZCwgSUUgd2lsbCBzd2l0Y2ggd2luZG93cywgc2VlICM5NDIwXG5cdGlmICggZWxlbWVudCAmJiBlbGVtZW50Lm5vZGVOYW1lLnRvTG93ZXJDYXNlKCkgIT09IFwiYm9keVwiICkge1xuXHRcdCQoIGVsZW1lbnQgKS50cmlnZ2VyKCBcImJsdXJcIiApO1xuXHR9XG59O1xuXG59ICkgKTtcbiIsIiggZnVuY3Rpb24oIGZhY3RvcnkgKSB7XG5cdGlmICggdHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQgKSB7XG5cblx0XHQvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXG5cdFx0ZGVmaW5lKCBbIFwianF1ZXJ5XCIsIFwiLi92ZXJzaW9uXCIgXSwgZmFjdG9yeSApO1xuXHR9IGVsc2Uge1xuXG5cdFx0Ly8gQnJvd3NlciBnbG9iYWxzXG5cdFx0ZmFjdG9yeSggalF1ZXJ5ICk7XG5cdH1cbn0gKCBmdW5jdGlvbiggJCApIHtcbnJldHVybiAkLnVpLnNhZmVBY3RpdmVFbGVtZW50ID0gZnVuY3Rpb24oIGRvY3VtZW50ICkge1xuXHR2YXIgYWN0aXZlRWxlbWVudDtcblxuXHQvLyBTdXBwb3J0OiBJRSA5IG9ubHlcblx0Ly8gSUU5IHRocm93cyBhbiBcIlVuc3BlY2lmaWVkIGVycm9yXCIgYWNjZXNzaW5nIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgZnJvbSBhbiA8aWZyYW1lPlxuXHR0cnkge1xuXHRcdGFjdGl2ZUVsZW1lbnQgPSBkb2N1bWVudC5hY3RpdmVFbGVtZW50O1xuXHR9IGNhdGNoICggZXJyb3IgKSB7XG5cdFx0YWN0aXZlRWxlbWVudCA9IGRvY3VtZW50LmJvZHk7XG5cdH1cblxuXHQvLyBTdXBwb3J0OiBJRSA5IC0gMTEgb25seVxuXHQvLyBJRSBtYXkgcmV0dXJuIG51bGwgaW5zdGVhZCBvZiBhbiBlbGVtZW50XG5cdC8vIEludGVyZXN0aW5nbHksIHRoaXMgb25seSBzZWVtcyB0byBvY2N1ciB3aGVuIE5PVCBpbiBhbiBpZnJhbWVcblx0aWYgKCAhYWN0aXZlRWxlbWVudCApIHtcblx0XHRhY3RpdmVFbGVtZW50ID0gZG9jdW1lbnQuYm9keTtcblx0fVxuXG5cdC8vIFN1cHBvcnQ6IElFIDExIG9ubHlcblx0Ly8gSUUxMSByZXR1cm5zIGEgc2VlbWluZ2x5IGVtcHR5IG9iamVjdCBpbiBzb21lIGNhc2VzIHdoZW4gYWNjZXNzaW5nXG5cdC8vIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgZnJvbSBhbiA8aWZyYW1lPlxuXHRpZiAoICFhY3RpdmVFbGVtZW50Lm5vZGVOYW1lICkge1xuXHRcdGFjdGl2ZUVsZW1lbnQgPSBkb2N1bWVudC5ib2R5O1xuXHR9XG5cblx0cmV0dXJuIGFjdGl2ZUVsZW1lbnQ7XG59O1xuXG59ICkgKTtcbiIsIiggZnVuY3Rpb24oIGZhY3RvcnkgKSB7XG5cdGlmICggdHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQgKSB7XG5cblx0XHQvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXG5cdFx0ZGVmaW5lKCBbIFwianF1ZXJ5XCIsIFwiLi92ZXJzaW9uXCIgXSwgZmFjdG9yeSApO1xuXHR9IGVsc2Uge1xuXG5cdFx0Ly8gQnJvd3NlciBnbG9iYWxzXG5cdFx0ZmFjdG9yeSggalF1ZXJ5ICk7XG5cdH1cbn0gKCBmdW5jdGlvbiggJCApIHtcblxuLy8gJC51aS5wbHVnaW4gaXMgZGVwcmVjYXRlZC4gVXNlICQud2lkZ2V0KCkgZXh0ZW5zaW9ucyBpbnN0ZWFkLlxucmV0dXJuICQudWkucGx1Z2luID0ge1xuXHRhZGQ6IGZ1bmN0aW9uKCBtb2R1bGUsIG9wdGlvbiwgc2V0ICkge1xuXHRcdHZhciBpLFxuXHRcdFx0cHJvdG8gPSAkLnVpWyBtb2R1bGUgXS5wcm90b3R5cGU7XG5cdFx0Zm9yICggaSBpbiBzZXQgKSB7XG5cdFx0XHRwcm90by5wbHVnaW5zWyBpIF0gPSBwcm90by5wbHVnaW5zWyBpIF0gfHwgW107XG5cdFx0XHRwcm90by5wbHVnaW5zWyBpIF0ucHVzaCggWyBvcHRpb24sIHNldFsgaSBdIF0gKTtcblx0XHR9XG5cdH0sXG5cdGNhbGw6IGZ1bmN0aW9uKCBpbnN0YW5jZSwgbmFtZSwgYXJncywgYWxsb3dEaXNjb25uZWN0ZWQgKSB7XG5cdFx0dmFyIGksXG5cdFx0XHRzZXQgPSBpbnN0YW5jZS5wbHVnaW5zWyBuYW1lIF07XG5cblx0XHRpZiAoICFzZXQgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0aWYgKCAhYWxsb3dEaXNjb25uZWN0ZWQgJiYgKCAhaW5zdGFuY2UuZWxlbWVudFsgMCBdLnBhcmVudE5vZGUgfHxcblx0XHRcdFx0aW5zdGFuY2UuZWxlbWVudFsgMCBdLnBhcmVudE5vZGUubm9kZVR5cGUgPT09IDExICkgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Zm9yICggaSA9IDA7IGkgPCBzZXQubGVuZ3RoOyBpKysgKSB7XG5cdFx0XHRpZiAoIGluc3RhbmNlLm9wdGlvbnNbIHNldFsgaSBdWyAwIF0gXSApIHtcblx0XHRcdFx0c2V0WyBpIF1bIDEgXS5hcHBseSggaW5zdGFuY2UuZWxlbWVudCwgYXJncyApO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxufTtcblxufSApICk7XG4iLCIoIGZ1bmN0aW9uKCBmYWN0b3J5ICkge1xuXHRpZiAoIHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kICkge1xuXG5cdFx0Ly8gQU1ELiBSZWdpc3RlciBhcyBhbiBhbm9ueW1vdXMgbW9kdWxlLlxuXHRcdGRlZmluZSggWyBcImpxdWVyeVwiLCBcIi4vdmVyc2lvblwiIF0sIGZhY3RvcnkgKTtcblx0fSBlbHNlIHtcblxuXHRcdC8vIEJyb3dzZXIgZ2xvYmFsc1xuXHRcdGZhY3RvcnkoIGpRdWVyeSApO1xuXHR9XG59ICggZnVuY3Rpb24oICQgKSB7XG5cbi8vIFRoaXMgZmlsZSBpcyBkZXByZWNhdGVkXG5yZXR1cm4gJC51aS5pZSA9ICEhL21zaWUgW1xcdy5dKy8uZXhlYyggbmF2aWdhdG9yLnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpICk7XG59ICkgKTtcbiIsIi8qIVxuICogalF1ZXJ5IFVJIDpkYXRhIDEuMTIuMVxuICogaHR0cDovL2pxdWVyeXVpLmNvbVxuICpcbiAqIENvcHlyaWdodCBqUXVlcnkgRm91bmRhdGlvbiBhbmQgb3RoZXIgY29udHJpYnV0b3JzXG4gKiBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuXG4gKiBodHRwOi8vanF1ZXJ5Lm9yZy9saWNlbnNlXG4gKi9cblxuLy8+PmxhYmVsOiA6ZGF0YSBTZWxlY3RvclxuLy8+Pmdyb3VwOiBDb3JlXG4vLz4+ZGVzY3JpcHRpb246IFNlbGVjdHMgZWxlbWVudHMgd2hpY2ggaGF2ZSBkYXRhIHN0b3JlZCB1bmRlciB0aGUgc3BlY2lmaWVkIGtleS5cbi8vPj5kb2NzOiBodHRwOi8vYXBpLmpxdWVyeXVpLmNvbS9kYXRhLXNlbGVjdG9yL1xuXG4oIGZ1bmN0aW9uKCBmYWN0b3J5ICkge1xuXHRpZiAoIHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kICkge1xuXG5cdFx0Ly8gQU1ELiBSZWdpc3RlciBhcyBhbiBhbm9ueW1vdXMgbW9kdWxlLlxuXHRcdGRlZmluZSggWyBcImpxdWVyeVwiLCBcIi4vdmVyc2lvblwiIF0sIGZhY3RvcnkgKTtcblx0fSBlbHNlIHtcblxuXHRcdC8vIEJyb3dzZXIgZ2xvYmFsc1xuXHRcdGZhY3RvcnkoIGpRdWVyeSApO1xuXHR9XG59ICggZnVuY3Rpb24oICQgKSB7XG5yZXR1cm4gJC5leHRlbmQoICQuZXhwclsgXCI6XCIgXSwge1xuXHRkYXRhOiAkLmV4cHIuY3JlYXRlUHNldWRvID9cblx0XHQkLmV4cHIuY3JlYXRlUHNldWRvKCBmdW5jdGlvbiggZGF0YU5hbWUgKSB7XG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24oIGVsZW0gKSB7XG5cdFx0XHRcdHJldHVybiAhISQuZGF0YSggZWxlbSwgZGF0YU5hbWUgKTtcblx0XHRcdH07XG5cdFx0fSApIDpcblxuXHRcdC8vIFN1cHBvcnQ6IGpRdWVyeSA8MS44XG5cdFx0ZnVuY3Rpb24oIGVsZW0sIGksIG1hdGNoICkge1xuXHRcdFx0cmV0dXJuICEhJC5kYXRhKCBlbGVtLCBtYXRjaFsgMyBdICk7XG5cdFx0fVxufSApO1xufSApICk7XG4iLCIvLyBOYXRpdmUgSmF2YXNjcmlwdCBmb3IgQm9vdHN0cmFwIDMgdjIuMC4yMSB8IMKpIGRucF90aGVtZSB8IE1JVC1MaWNlbnNlXG4oZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgIC8vIEFNRCBzdXBwb3J0OlxuICAgIGRlZmluZShbXSwgZmFjdG9yeSk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgICAvLyBDb21tb25KUy1saWtlOlxuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuICB9IGVsc2Uge1xuICAgIC8vIEJyb3dzZXIgZ2xvYmFscyAocm9vdCBpcyB3aW5kb3cpXG4gICAgdmFyIGJzbiA9IGZhY3RvcnkoKTtcbiAgICByb290LkFmZml4ID0gYnNuLkFmZml4O1xuICAgIHJvb3QuQWxlcnQgPSBic24uQWxlcnQ7XG4gICAgcm9vdC5CdXR0b24gPSBic24uQnV0dG9uO1xuICAgIHJvb3QuQ2Fyb3VzZWwgPSBic24uQ2Fyb3VzZWw7XG4gICAgcm9vdC5Db2xsYXBzZSA9IGJzbi5Db2xsYXBzZTtcbiAgICByb290LkRyb3Bkb3duID0gYnNuLkRyb3Bkb3duO1xuICAgIHJvb3QuTW9kYWwgPSBic24uTW9kYWw7XG4gICAgcm9vdC5Qb3BvdmVyID0gYnNuLlBvcG92ZXI7XG4gICAgcm9vdC5TY3JvbGxTcHkgPSBic24uU2Nyb2xsU3B5O1xuICAgIHJvb3QuVGFiID0gYnNuLlRhYjtcbiAgICByb290LlRvb2x0aXAgPSBic24uVG9vbHRpcDtcbiAgfVxufSh0aGlzLCBmdW5jdGlvbiAoKSB7XG4gIFxuICAvKiBOYXRpdmUgSmF2YXNjcmlwdCBmb3IgQm9vdHN0cmFwIDMgfCBJbnRlcm5hbCBVdGlsaXR5IEZ1bmN0aW9uc1xuICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbiAgXCJ1c2Ugc3RyaWN0XCI7XG4gIFxuICAvLyBnbG9iYWxzXG4gIHZhciBnbG9iYWxPYmplY3QgPSB0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyA/IGdsb2JhbCA6IHRoaXN8fHdpbmRvdyxcbiAgICBET0MgPSBkb2N1bWVudCwgSFRNTCA9IERPQy5kb2N1bWVudEVsZW1lbnQsIGJvZHkgPSAnYm9keScsIC8vIGFsbG93IHRoZSBsaWJyYXJ5IHRvIGJlIHVzZWQgaW4gPGhlYWQ+XG4gIFxuICAgIC8vIE5hdGl2ZSBKYXZhc2NyaXB0IGZvciBCb290c3RyYXAgR2xvYmFsIE9iamVjdFxuICAgIEJTTiA9IGdsb2JhbE9iamVjdC5CU04gPSB7fSxcbiAgICBzdXBwb3J0cyA9IEJTTi5zdXBwb3J0cyA9IFtdLFxuICBcbiAgICAvLyBmdW5jdGlvbiB0b2dnbGUgYXR0cmlidXRlc1xuICAgIGRhdGFUb2dnbGUgICAgPSAnZGF0YS10b2dnbGUnLFxuICAgIGRhdGFEaXNtaXNzICAgPSAnZGF0YS1kaXNtaXNzJyxcbiAgICBkYXRhU3B5ICAgICAgID0gJ2RhdGEtc3B5JyxcbiAgICBkYXRhUmlkZSAgICAgID0gJ2RhdGEtcmlkZScsXG4gICAgXG4gICAgLy8gY29tcG9uZW50c1xuICAgIHN0cmluZ0FmZml4ICAgICA9ICdBZmZpeCcsXG4gICAgc3RyaW5nQWxlcnQgICAgID0gJ0FsZXJ0JyxcbiAgICBzdHJpbmdCdXR0b24gICAgPSAnQnV0dG9uJyxcbiAgICBzdHJpbmdDYXJvdXNlbCAgPSAnQ2Fyb3VzZWwnLFxuICAgIHN0cmluZ0NvbGxhcHNlICA9ICdDb2xsYXBzZScsXG4gICAgc3RyaW5nRHJvcGRvd24gID0gJ0Ryb3Bkb3duJyxcbiAgICBzdHJpbmdNb2RhbCAgICAgPSAnTW9kYWwnLFxuICAgIHN0cmluZ1BvcG92ZXIgICA9ICdQb3BvdmVyJyxcbiAgICBzdHJpbmdTY3JvbGxTcHkgPSAnU2Nyb2xsU3B5JyxcbiAgICBzdHJpbmdUYWIgICAgICAgPSAnVGFiJyxcbiAgICBzdHJpbmdUb29sdGlwICAgPSAnVG9vbHRpcCcsXG4gIFxuICAgIC8vIG9wdGlvbnMgREFUQSBBUElcbiAgICBkYXRhYmFja2Ryb3AgICAgICA9ICdkYXRhLWJhY2tkcm9wJyxcbiAgICBkYXRhS2V5Ym9hcmQgICAgICA9ICdkYXRhLWtleWJvYXJkJyxcbiAgICBkYXRhVGFyZ2V0ICAgICAgICA9ICdkYXRhLXRhcmdldCcsXG4gICAgZGF0YUludGVydmFsICAgICAgPSAnZGF0YS1pbnRlcnZhbCcsXG4gICAgZGF0YUhlaWdodCAgICAgICAgPSAnZGF0YS1oZWlnaHQnLFxuICAgIGRhdGFQYXVzZSAgICAgICAgID0gJ2RhdGEtcGF1c2UnLFxuICAgIGRhdGFUaXRsZSAgICAgICAgID0gJ2RhdGEtdGl0bGUnLCAgXG4gICAgZGF0YU9yaWdpbmFsVGl0bGUgPSAnZGF0YS1vcmlnaW5hbC10aXRsZScsXG4gICAgZGF0YU9yaWdpbmFsVGV4dCAgPSAnZGF0YS1vcmlnaW5hbC10ZXh0JyxcbiAgICBkYXRhRGlzbWlzc2libGUgICA9ICdkYXRhLWRpc21pc3NpYmxlJyxcbiAgICBkYXRhVHJpZ2dlciAgICAgICA9ICdkYXRhLXRyaWdnZXInLFxuICAgIGRhdGFBbmltYXRpb24gICAgID0gJ2RhdGEtYW5pbWF0aW9uJyxcbiAgICBkYXRhQ29udGFpbmVyICAgICA9ICdkYXRhLWNvbnRhaW5lcicsXG4gICAgZGF0YVBsYWNlbWVudCAgICAgPSAnZGF0YS1wbGFjZW1lbnQnLFxuICAgIGRhdGFEZWxheSAgICAgICAgID0gJ2RhdGEtZGVsYXknLFxuICAgIGRhdGFPZmZzZXRUb3AgICAgID0gJ2RhdGEtb2Zmc2V0LXRvcCcsXG4gICAgZGF0YU9mZnNldEJvdHRvbSAgPSAnZGF0YS1vZmZzZXQtYm90dG9tJyxcbiAgXG4gICAgLy8gb3B0aW9uIGtleXNcbiAgICBiYWNrZHJvcCA9ICdiYWNrZHJvcCcsIGtleWJvYXJkID0gJ2tleWJvYXJkJywgZGVsYXkgPSAnZGVsYXknLFxuICAgIGNvbnRlbnQgPSAnY29udGVudCcsIHRhcmdldCA9ICd0YXJnZXQnLCBcbiAgICBpbnRlcnZhbCA9ICdpbnRlcnZhbCcsIHBhdXNlID0gJ3BhdXNlJywgYW5pbWF0aW9uID0gJ2FuaW1hdGlvbicsXG4gICAgcGxhY2VtZW50ID0gJ3BsYWNlbWVudCcsIGNvbnRhaW5lciA9ICdjb250YWluZXInLCBcbiAgXG4gICAgLy8gYm94IG1vZGVsXG4gICAgb2Zmc2V0VG9wICAgID0gJ29mZnNldFRvcCcsICAgICAgb2Zmc2V0Qm90dG9tICAgPSAnb2Zmc2V0Qm90dG9tJyxcbiAgICBvZmZzZXRMZWZ0ICAgPSAnb2Zmc2V0TGVmdCcsXG4gICAgc2Nyb2xsVG9wICAgID0gJ3Njcm9sbFRvcCcsICAgICAgc2Nyb2xsTGVmdCAgICAgPSAnc2Nyb2xsTGVmdCcsXG4gICAgY2xpZW50V2lkdGggID0gJ2NsaWVudFdpZHRoJywgICAgY2xpZW50SGVpZ2h0ICAgPSAnY2xpZW50SGVpZ2h0JyxcbiAgICBvZmZzZXRXaWR0aCAgPSAnb2Zmc2V0V2lkdGgnLCAgICBvZmZzZXRIZWlnaHQgICA9ICdvZmZzZXRIZWlnaHQnLFxuICAgIGlubmVyV2lkdGggICA9ICdpbm5lcldpZHRoJywgICAgIGlubmVySGVpZ2h0ICAgID0gJ2lubmVySGVpZ2h0JyxcbiAgICBzY3JvbGxIZWlnaHQgPSAnc2Nyb2xsSGVpZ2h0JywgICBoZWlnaHQgICAgICAgICA9ICdoZWlnaHQnLFxuICBcbiAgICAvLyBhcmlhXG4gICAgYXJpYUV4cGFuZGVkID0gJ2FyaWEtZXhwYW5kZWQnLFxuICAgIGFyaWFIaWRkZW4gICA9ICdhcmlhLWhpZGRlbicsXG4gIFxuICAgIC8vIGV2ZW50IG5hbWVzXG4gICAgY2xpY2tFdmVudCAgICA9ICdjbGljaycsXG4gICAgaG92ZXJFdmVudCAgICA9ICdob3ZlcicsXG4gICAga2V5ZG93bkV2ZW50ICA9ICdrZXlkb3duJyxcbiAgICBrZXl1cEV2ZW50ICAgID0gJ2tleXVwJywgIFxuICAgIHJlc2l6ZUV2ZW50ICAgPSAncmVzaXplJyxcbiAgICBzY3JvbGxFdmVudCAgID0gJ3Njcm9sbCcsXG4gICAgLy8gb3JpZ2luYWxFdmVudHNcbiAgICBzaG93RXZlbnQgICAgID0gJ3Nob3cnLFxuICAgIHNob3duRXZlbnQgICAgPSAnc2hvd24nLFxuICAgIGhpZGVFdmVudCAgICAgPSAnaGlkZScsXG4gICAgaGlkZGVuRXZlbnQgICA9ICdoaWRkZW4nLFxuICAgIGNsb3NlRXZlbnQgICAgPSAnY2xvc2UnLFxuICAgIGNsb3NlZEV2ZW50ICAgPSAnY2xvc2VkJyxcbiAgICBzbGlkRXZlbnQgICAgID0gJ3NsaWQnLFxuICAgIHNsaWRlRXZlbnQgICAgPSAnc2xpZGUnLFxuICAgIGNoYW5nZUV2ZW50ICAgPSAnY2hhbmdlJyxcbiAgXG4gICAgLy8gb3RoZXJcbiAgICBnZXRBdHRyaWJ1dGUgICAgICAgICAgID0gJ2dldEF0dHJpYnV0ZScsXG4gICAgc2V0QXR0cmlidXRlICAgICAgICAgICA9ICdzZXRBdHRyaWJ1dGUnLFxuICAgIGhhc0F0dHJpYnV0ZSAgICAgICAgICAgPSAnaGFzQXR0cmlidXRlJyxcbiAgICBjcmVhdGVFbGVtZW50ICAgICAgICAgID0gJ2NyZWF0ZUVsZW1lbnQnLFxuICAgIGFwcGVuZENoaWxkICAgICAgICAgICAgPSAnYXBwZW5kQ2hpbGQnLFxuICAgIGlubmVySFRNTCAgICAgICAgICAgICAgPSAnaW5uZXJIVE1MJyxcbiAgICBnZXRFbGVtZW50c0J5VGFnTmFtZSAgID0gJ2dldEVsZW1lbnRzQnlUYWdOYW1lJyxcbiAgICBwcmV2ZW50RGVmYXVsdCAgICAgICAgID0gJ3ByZXZlbnREZWZhdWx0JyxcbiAgICBnZXRCb3VuZGluZ0NsaWVudFJlY3QgID0gJ2dldEJvdW5kaW5nQ2xpZW50UmVjdCcsXG4gICAgcXVlcnlTZWxlY3RvckFsbCAgICAgICA9ICdxdWVyeVNlbGVjdG9yQWxsJyxcbiAgICBnZXRFbGVtZW50c0J5Q0xBU1NOQU1FID0gJ2dldEVsZW1lbnRzQnlDbGFzc05hbWUnLFxuICBcbiAgICBpbmRleE9mICAgICAgPSAnaW5kZXhPZicsXG4gICAgcGFyZW50Tm9kZSAgID0gJ3BhcmVudE5vZGUnLFxuICAgIGxlbmd0aCAgICAgICA9ICdsZW5ndGgnLFxuICAgIHRvTG93ZXJDYXNlICA9ICd0b0xvd2VyQ2FzZScsXG4gICAgVHJhbnNpdGlvbiAgID0gJ1RyYW5zaXRpb24nLFxuICAgIFdlYmtpdCAgICAgICA9ICdXZWJraXQnLFxuICAgIHN0eWxlICAgICAgICA9ICdzdHlsZScsXG4gICAgcHVzaCAgICAgICAgID0gJ3B1c2gnLFxuICAgIHRhYmluZGV4ICAgICA9ICd0YWJpbmRleCcsXG4gICAgY29udGFpbnMgICAgID0gJ2NvbnRhaW5zJywgIFxuICAgIFxuICAgIGFjdGl2ZSAgICAgPSAnYWN0aXZlJyxcbiAgICBpbkNsYXNzICAgID0gJ2luJyxcbiAgICBjb2xsYXBzaW5nID0gJ2NvbGxhcHNpbmcnLFxuICAgIGRpc2FibGVkICAgPSAnZGlzYWJsZWQnLFxuICAgIGxvYWRpbmcgICAgPSAnbG9hZGluZycsXG4gICAgbGVmdCAgICAgICA9ICdsZWZ0JyxcbiAgICByaWdodCAgICAgID0gJ3JpZ2h0JyxcbiAgICB0b3AgICAgICAgID0gJ3RvcCcsXG4gICAgYm90dG9tICAgICA9ICdib3R0b20nLFxuICBcbiAgICAvLyBJRTggYnJvd3NlciBkZXRlY3RcbiAgICBpc0lFOCA9ICEoJ29wYWNpdHknIGluIEhUTUxbc3R5bGVdKSxcbiAgXG4gICAgLy8gdG9vbHRpcCAvIHBvcG92ZXJcbiAgICBtb3VzZUhvdmVyID0gKCdvbm1vdXNlbGVhdmUnIGluIERPQykgPyBbICdtb3VzZWVudGVyJywgJ21vdXNlbGVhdmUnXSA6IFsgJ21vdXNlb3ZlcicsICdtb3VzZW91dCcgXSxcbiAgICB0aXBQb3NpdGlvbnMgPSAvXFxiKHRvcHxib3R0b218bGVmdHxyaWdodCkrLyxcbiAgICBcbiAgICAvLyBtb2RhbFxuICAgIG1vZGFsT3ZlcmxheSA9IDAsXG4gICAgZml4ZWRUb3AgPSAnbmF2YmFyLWZpeGVkLXRvcCcsXG4gICAgZml4ZWRCb3R0b20gPSAnbmF2YmFyLWZpeGVkLWJvdHRvbScsICBcbiAgICBcbiAgICAvLyB0cmFuc2l0aW9uRW5kIHNpbmNlIDIuMC40XG4gICAgc3VwcG9ydFRyYW5zaXRpb25zID0gV2Via2l0K1RyYW5zaXRpb24gaW4gSFRNTFtzdHlsZV0gfHwgVHJhbnNpdGlvblt0b0xvd2VyQ2FzZV0oKSBpbiBIVE1MW3N0eWxlXSxcbiAgICB0cmFuc2l0aW9uRW5kRXZlbnQgPSBXZWJraXQrVHJhbnNpdGlvbiBpbiBIVE1MW3N0eWxlXSA/IFdlYmtpdFt0b0xvd2VyQ2FzZV0oKStUcmFuc2l0aW9uKydFbmQnIDogVHJhbnNpdGlvblt0b0xvd2VyQ2FzZV0oKSsnZW5kJyxcbiAgXG4gICAgLy8gc2V0IG5ldyBmb2N1cyBlbGVtZW50IHNpbmNlIDIuMC4zXG4gICAgc2V0Rm9jdXMgPSBmdW5jdGlvbihlbGVtZW50KXtcbiAgICAgIGVsZW1lbnQuZm9jdXMgPyBlbGVtZW50LmZvY3VzKCkgOiBlbGVtZW50LnNldEFjdGl2ZSgpO1xuICAgIH0sXG4gIFxuICAgIC8vIGNsYXNzIG1hbmlwdWxhdGlvbiwgc2luY2UgMi4wLjAgcmVxdWlyZXMgcG9seWZpbGwuanNcbiAgICBhZGRDbGFzcyA9IGZ1bmN0aW9uKGVsZW1lbnQsY2xhc3NOQU1FKSB7XG4gICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoY2xhc3NOQU1FKTtcbiAgICB9LFxuICAgIHJlbW92ZUNsYXNzID0gZnVuY3Rpb24oZWxlbWVudCxjbGFzc05BTUUpIHtcbiAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShjbGFzc05BTUUpO1xuICAgIH0sXG4gICAgaGFzQ2xhc3MgPSBmdW5jdGlvbihlbGVtZW50LGNsYXNzTkFNRSl7IC8vIHNpbmNlIDIuMC4wXG4gICAgICByZXR1cm4gZWxlbWVudC5jbGFzc0xpc3RbY29udGFpbnNdKGNsYXNzTkFNRSk7XG4gICAgfSxcbiAgXG4gICAgLy8gc2VsZWN0aW9uIG1ldGhvZHNcbiAgICBub2RlTGlzdFRvQXJyYXkgPSBmdW5jdGlvbihub2RlTGlzdCl7XG4gICAgICB2YXIgY2hpbGRJdGVtcyA9IFtdOyBmb3IgKHZhciBpID0gMCwgbmxsID0gbm9kZUxpc3RbbGVuZ3RoXTsgaTxubGw7IGkrKykgeyBjaGlsZEl0ZW1zW3B1c2hdKCBub2RlTGlzdFtpXSApIH1cbiAgICAgIHJldHVybiBjaGlsZEl0ZW1zO1xuICAgIH0sXG4gICAgZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSA9IGZ1bmN0aW9uKGVsZW1lbnQsY2xhc3NOQU1FKSB7IC8vIGdldEVsZW1lbnRzQnlDbGFzc05hbWUgSUU4K1xuICAgICAgdmFyIHNlbGVjdGlvbk1ldGhvZCA9IGlzSUU4ID8gcXVlcnlTZWxlY3RvckFsbCA6IGdldEVsZW1lbnRzQnlDTEFTU05BTUU7ICAgICAgXG4gICAgICByZXR1cm4gbm9kZUxpc3RUb0FycmF5KGVsZW1lbnRbc2VsZWN0aW9uTWV0aG9kXSggaXNJRTggPyAnLicgKyBjbGFzc05BTUUucmVwbGFjZSgvXFxzKD89W2Etel0pL2csJy4nKSA6IGNsYXNzTkFNRSApKTtcbiAgICB9LFxuICAgIHF1ZXJ5RWxlbWVudCA9IGZ1bmN0aW9uIChzZWxlY3RvciwgcGFyZW50KSB7XG4gICAgICB2YXIgbG9va1VwID0gcGFyZW50ID8gcGFyZW50IDogRE9DO1xuICAgICAgcmV0dXJuIHR5cGVvZiBzZWxlY3RvciA9PT0gJ29iamVjdCcgPyBzZWxlY3RvciA6IGxvb2tVcC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgICB9LFxuICAgIGdldENsb3Nlc3QgPSBmdW5jdGlvbiAoZWxlbWVudCwgc2VsZWN0b3IpIHsgLy9lbGVtZW50IGlzIHRoZSBlbGVtZW50IGFuZCBzZWxlY3RvciBpcyBmb3IgdGhlIGNsb3Nlc3QgcGFyZW50IGVsZW1lbnQgdG8gZmluZFxuICAgICAgLy8gc291cmNlIGh0dHA6Ly9nb21ha2V0aGluZ3MuY29tL2NsaW1iaW5nLXVwLWFuZC1kb3duLXRoZS1kb20tdHJlZS13aXRoLXZhbmlsbGEtamF2YXNjcmlwdC9cbiAgICAgIHZhciBmaXJzdENoYXIgPSBzZWxlY3Rvci5jaGFyQXQoMCksIHNlbGVjdG9yU3Vic3RyaW5nID0gc2VsZWN0b3Iuc3Vic3RyKDEpO1xuICAgICAgaWYgKCBmaXJzdENoYXIgPT09ICcuJyApIHsvLyBJZiBzZWxlY3RvciBpcyBhIGNsYXNzXG4gICAgICAgIGZvciAoIDsgZWxlbWVudCAmJiBlbGVtZW50ICE9PSBET0M7IGVsZW1lbnQgPSBlbGVtZW50W3BhcmVudE5vZGVdICkgeyAvLyBHZXQgY2xvc2VzdCBtYXRjaFxuICAgICAgICAgIGlmICggcXVlcnlFbGVtZW50KHNlbGVjdG9yLGVsZW1lbnRbcGFyZW50Tm9kZV0pICE9PSBudWxsICYmIGhhc0NsYXNzKGVsZW1lbnQsc2VsZWN0b3JTdWJzdHJpbmcpICkgeyByZXR1cm4gZWxlbWVudDsgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKCBmaXJzdENoYXIgPT09ICcjJyApIHsgLy8gSWYgc2VsZWN0b3IgaXMgYW4gSURcbiAgICAgICAgZm9yICggOyBlbGVtZW50ICYmIGVsZW1lbnQgIT09IERPQzsgZWxlbWVudCA9IGVsZW1lbnRbcGFyZW50Tm9kZV0gKSB7IC8vIEdldCBjbG9zZXN0IG1hdGNoXG4gICAgICAgICAgaWYgKCBlbGVtZW50LmlkID09PSBzZWxlY3RvclN1YnN0cmluZyApIHsgcmV0dXJuIGVsZW1lbnQ7IH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0sXG4gIFxuICAgIC8vIGV2ZW50IGF0dGFjaCBqUXVlcnkgc3R5bGUgLyB0cmlnZ2VyICBzaW5jZSAxLjIuMFxuICAgIG9uID0gZnVuY3Rpb24gKGVsZW1lbnQsIGV2ZW50LCBoYW5kbGVyKSB7XG4gICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIGhhbmRsZXIsIGZhbHNlKTtcbiAgICB9LFxuICAgIG9mZiA9IGZ1bmN0aW9uKGVsZW1lbnQsIGV2ZW50LCBoYW5kbGVyKSB7XG4gICAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnQsIGhhbmRsZXIsIGZhbHNlKTtcbiAgICB9LFxuICAgIG9uZSA9IGZ1bmN0aW9uIChlbGVtZW50LCBldmVudCwgaGFuZGxlcikgeyAvLyBvbmUgc2luY2UgMi4wLjRcbiAgICAgIG9uKGVsZW1lbnQsIGV2ZW50LCBmdW5jdGlvbiBoYW5kbGVyV3JhcHBlcihlKXtcbiAgICAgICAgaGFuZGxlcihlKTtcbiAgICAgICAgb2ZmKGVsZW1lbnQsIGV2ZW50LCBoYW5kbGVyV3JhcHBlcik7XG4gICAgICB9KTtcbiAgICB9LFxuICAgIGVtdWxhdGVUcmFuc2l0aW9uRW5kID0gZnVuY3Rpb24oZWxlbWVudCxoYW5kbGVyKXsgLy8gZW11bGF0ZVRyYW5zaXRpb25FbmQgc2luY2UgMi4wLjRcbiAgICAgIGlmIChzdXBwb3J0VHJhbnNpdGlvbnMpIHsgb25lKGVsZW1lbnQsIHRyYW5zaXRpb25FbmRFdmVudCwgZnVuY3Rpb24oZSl7IGhhbmRsZXIoZSk7IH0pOyB9IFxuICAgICAgZWxzZSB7IGhhbmRsZXIoKTsgfVxuICAgIH0sXG4gICAgYm9vdHN0cmFwQ3VzdG9tRXZlbnQgPSBmdW5jdGlvbiAoZXZlbnROYW1lLCBjb21wb25lbnROYW1lLCByZWxhdGVkKSB7XG4gICAgICB2YXIgT3JpZ2luYWxDdXN0b21FdmVudCA9IG5ldyBDdXN0b21FdmVudCggZXZlbnROYW1lICsgJy5icy4nICsgY29tcG9uZW50TmFtZSk7XG4gICAgICBPcmlnaW5hbEN1c3RvbUV2ZW50LnJlbGF0ZWRUYXJnZXQgPSByZWxhdGVkO1xuICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KE9yaWdpbmFsQ3VzdG9tRXZlbnQpO1xuICAgIH0sXG4gIFxuICAgIC8vIHRvb2x0aXAgLyBwb3BvdmVyIHN0dWZmXG4gICAgZ2V0U2Nyb2xsID0gZnVuY3Rpb24oKSB7IC8vIGFsc28gQWZmaXggYW5kIFNjcm9sbFNweSB1c2VzIGl0XG4gICAgICByZXR1cm4ge1xuICAgICAgICB5IDogZ2xvYmFsT2JqZWN0LnBhZ2VZT2Zmc2V0IHx8IEhUTUxbc2Nyb2xsVG9wXSxcbiAgICAgICAgeCA6IGdsb2JhbE9iamVjdC5wYWdlWE9mZnNldCB8fCBIVE1MW3Njcm9sbExlZnRdXG4gICAgICB9XG4gICAgfSxcbiAgICBzdHlsZVRpcCA9IGZ1bmN0aW9uKGxpbmssZWxlbWVudCxwb3NpdGlvbixwYXJlbnQpIHsgLy8gYm90aCBwb3BvdmVycyBhbmQgdG9vbHRpcHMgKHRhcmdldCx0b29sdGlwL3BvcG92ZXIscGxhY2VtZW50LGVsZW1lbnRUb0FwcGVuZFRvKVxuICAgICAgdmFyIGVsZW1lbnREaW1lbnNpb25zID0geyB3IDogZWxlbWVudFtvZmZzZXRXaWR0aF0sIGg6IGVsZW1lbnRbb2Zmc2V0SGVpZ2h0XSB9LFxuICAgICAgICAgIHdpbmRvd1dpZHRoID0gKEhUTUxbY2xpZW50V2lkdGhdIHx8IERPQ1tib2R5XVtjbGllbnRXaWR0aF0pLFxuICAgICAgICAgIHdpbmRvd0hlaWdodCA9IChIVE1MW2NsaWVudEhlaWdodF0gfHwgRE9DW2JvZHldW2NsaWVudEhlaWdodF0pLFxuICAgICAgICAgIHJlY3QgPSBsaW5rW2dldEJvdW5kaW5nQ2xpZW50UmVjdF0oKSwgXG4gICAgICAgICAgc2Nyb2xsID0gcGFyZW50ID09PSBET0NbYm9keV0gPyBnZXRTY3JvbGwoKSA6IHsgeDogcGFyZW50W29mZnNldExlZnRdICsgcGFyZW50W3Njcm9sbExlZnRdLCB5OiBwYXJlbnRbb2Zmc2V0VG9wXSArIHBhcmVudFtzY3JvbGxUb3BdIH0sXG4gICAgICAgICAgbGlua0RpbWVuc2lvbnMgPSB7IHc6IHJlY3RbcmlnaHRdIC0gcmVjdFtsZWZ0XSwgaDogcmVjdFtib3R0b21dIC0gcmVjdFt0b3BdIH0sXG4gICAgICAgICAgYXJyb3cgPSBxdWVyeUVsZW1lbnQoJ1tjbGFzcyo9XCJhcnJvd1wiXScsZWxlbWVudCksXG4gICAgICAgICAgdG9wUG9zaXRpb24sIGxlZnRQb3NpdGlvbiwgYXJyb3dUb3AsIGFycm93TGVmdCxcbiAgXG4gICAgICAgICAgaGFsZlRvcEV4Y2VlZCA9IHJlY3RbdG9wXSArIGxpbmtEaW1lbnNpb25zLmgvMiAtIGVsZW1lbnREaW1lbnNpb25zLmgvMiA8IDAsXG4gICAgICAgICAgaGFsZkxlZnRFeGNlZWQgPSByZWN0W2xlZnRdICsgbGlua0RpbWVuc2lvbnMudy8yIC0gZWxlbWVudERpbWVuc2lvbnMudy8yIDwgMCxcbiAgICAgICAgICBoYWxmUmlnaHRFeGNlZWQgPSByZWN0W2xlZnRdICsgZWxlbWVudERpbWVuc2lvbnMudy8yICsgbGlua0RpbWVuc2lvbnMudy8yID49IHdpbmRvd1dpZHRoLFxuICAgICAgICAgIGhhbGZCb3R0b21FeGNlZWQgPSByZWN0W3RvcF0gKyBlbGVtZW50RGltZW5zaW9ucy5oLzIgKyBsaW5rRGltZW5zaW9ucy5oLzIgPj0gd2luZG93SGVpZ2h0LFxuICAgICAgICAgIHRvcEV4Y2VlZCA9IHJlY3RbdG9wXSAtIGVsZW1lbnREaW1lbnNpb25zLmggPCAwLFxuICAgICAgICAgIGxlZnRFeGNlZWQgPSByZWN0W2xlZnRdIC0gZWxlbWVudERpbWVuc2lvbnMudyA8IDAsXG4gICAgICAgICAgYm90dG9tRXhjZWVkID0gcmVjdFt0b3BdICsgZWxlbWVudERpbWVuc2lvbnMuaCArIGxpbmtEaW1lbnNpb25zLmggPj0gd2luZG93SGVpZ2h0LFxuICAgICAgICAgIHJpZ2h0RXhjZWVkID0gcmVjdFtsZWZ0XSArIGVsZW1lbnREaW1lbnNpb25zLncgKyBsaW5rRGltZW5zaW9ucy53ID49IHdpbmRvd1dpZHRoO1xuICBcbiAgICAgIC8vIHJlY29tcHV0ZSBwb3NpdGlvblxuICAgICAgcG9zaXRpb24gPSAocG9zaXRpb24gPT09IGxlZnQgfHwgcG9zaXRpb24gPT09IHJpZ2h0KSAmJiBsZWZ0RXhjZWVkICYmIHJpZ2h0RXhjZWVkID8gdG9wIDogcG9zaXRpb247IC8vIGZpcnN0LCB3aGVuIGJvdGggbGVmdCBhbmQgcmlnaHQgbGltaXRzIGFyZSBleGNlZWRlZCwgd2UgZmFsbCBiYWNrIHRvIHRvcHxib3R0b21cbiAgICAgIHBvc2l0aW9uID0gcG9zaXRpb24gPT09IHRvcCAmJiB0b3BFeGNlZWQgPyBib3R0b20gOiBwb3NpdGlvbjtcbiAgICAgIHBvc2l0aW9uID0gcG9zaXRpb24gPT09IGJvdHRvbSAmJiBib3R0b21FeGNlZWQgPyB0b3AgOiBwb3NpdGlvbjtcbiAgICAgIHBvc2l0aW9uID0gcG9zaXRpb24gPT09IGxlZnQgJiYgbGVmdEV4Y2VlZCA/IHJpZ2h0IDogcG9zaXRpb247XG4gICAgICBwb3NpdGlvbiA9IHBvc2l0aW9uID09PSByaWdodCAmJiByaWdodEV4Y2VlZCA/IGxlZnQgOiBwb3NpdGlvbjtcbiAgICAgIFxuICAgICAgLy8gYXBwbHkgc3R5bGluZyB0byB0b29sdGlwIG9yIHBvcG92ZXJcbiAgICAgIGlmICggcG9zaXRpb24gPT09IGxlZnQgfHwgcG9zaXRpb24gPT09IHJpZ2h0ICkgeyAvLyBzZWNvbmRhcnl8c2lkZSBwb3NpdGlvbnNcbiAgICAgICAgaWYgKCBwb3NpdGlvbiA9PT0gbGVmdCApIHsgLy8gTEVGVFxuICAgICAgICAgIGxlZnRQb3NpdGlvbiA9IHJlY3RbbGVmdF0gKyBzY3JvbGwueCAtIGVsZW1lbnREaW1lbnNpb25zLnc7XG4gICAgICAgIH0gZWxzZSB7IC8vIFJJR0hUXG4gICAgICAgICAgbGVmdFBvc2l0aW9uID0gcmVjdFtsZWZ0XSArIHNjcm9sbC54ICsgbGlua0RpbWVuc2lvbnMudztcbiAgICAgICAgfVxuICBcbiAgICAgICAgLy8gYWRqdXN0IHRvcCBhbmQgYXJyb3dcbiAgICAgICAgaWYgKGhhbGZUb3BFeGNlZWQpIHtcbiAgICAgICAgICB0b3BQb3NpdGlvbiA9IHJlY3RbdG9wXSArIHNjcm9sbC55O1xuICAgICAgICAgIGFycm93VG9wID0gbGlua0RpbWVuc2lvbnMuaC8yO1xuICAgICAgICB9IGVsc2UgaWYgKGhhbGZCb3R0b21FeGNlZWQpIHtcbiAgICAgICAgICB0b3BQb3NpdGlvbiA9IHJlY3RbdG9wXSArIHNjcm9sbC55IC0gZWxlbWVudERpbWVuc2lvbnMuaCArIGxpbmtEaW1lbnNpb25zLmg7XG4gICAgICAgICAgYXJyb3dUb3AgPSBlbGVtZW50RGltZW5zaW9ucy5oIC0gbGlua0RpbWVuc2lvbnMuaC8yO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRvcFBvc2l0aW9uID0gcmVjdFt0b3BdICsgc2Nyb2xsLnkgLSBlbGVtZW50RGltZW5zaW9ucy5oLzIgKyBsaW5rRGltZW5zaW9ucy5oLzI7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoIHBvc2l0aW9uID09PSB0b3AgfHwgcG9zaXRpb24gPT09IGJvdHRvbSApIHsgLy8gcHJpbWFyeXx2ZXJ0aWNhbCBwb3NpdGlvbnNcbiAgICAgICAgaWYgKCBwb3NpdGlvbiA9PT0gdG9wKSB7IC8vIFRPUFxuICAgICAgICAgIHRvcFBvc2l0aW9uID0gIHJlY3RbdG9wXSArIHNjcm9sbC55IC0gZWxlbWVudERpbWVuc2lvbnMuaDtcbiAgICAgICAgfSBlbHNlIHsgLy8gQk9UVE9NXG4gICAgICAgICAgdG9wUG9zaXRpb24gPSByZWN0W3RvcF0gKyBzY3JvbGwueSArIGxpbmtEaW1lbnNpb25zLmg7XG4gICAgICAgIH1cbiAgICAgICAgLy8gYWRqdXN0IGxlZnQgfCByaWdodCBhbmQgYWxzbyB0aGUgYXJyb3dcbiAgICAgICAgaWYgKGhhbGZMZWZ0RXhjZWVkKSB7XG4gICAgICAgICAgbGVmdFBvc2l0aW9uID0gMDtcbiAgICAgICAgICBhcnJvd0xlZnQgPSByZWN0W2xlZnRdICsgbGlua0RpbWVuc2lvbnMudy8yO1xuICAgICAgICB9IGVsc2UgaWYgKGhhbGZSaWdodEV4Y2VlZCkge1xuICAgICAgICAgIGxlZnRQb3NpdGlvbiA9IHdpbmRvd1dpZHRoIC0gZWxlbWVudERpbWVuc2lvbnMudyoxLjAxO1xuICAgICAgICAgIGFycm93TGVmdCA9IGVsZW1lbnREaW1lbnNpb25zLncgLSAoIHdpbmRvd1dpZHRoIC0gcmVjdFtsZWZ0XSApICsgbGlua0RpbWVuc2lvbnMudy8yO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGxlZnRQb3NpdGlvbiA9IHJlY3RbbGVmdF0gKyBzY3JvbGwueCAtIGVsZW1lbnREaW1lbnNpb25zLncvMiArIGxpbmtEaW1lbnNpb25zLncvMjtcbiAgICAgICAgfVxuICAgICAgfVxuICBcbiAgICAgIC8vIGFwcGx5IHN0eWxlIHRvIHRvb2x0aXAvcG9wb3ZlciBhbmQgaXQncyBhcnJvd1xuICAgICAgZWxlbWVudFtzdHlsZV1bdG9wXSA9IHRvcFBvc2l0aW9uICsgJ3B4JztcbiAgICAgIGVsZW1lbnRbc3R5bGVdW2xlZnRdID0gbGVmdFBvc2l0aW9uICsgJ3B4JztcbiAgXG4gICAgICBhcnJvd1RvcCAmJiAoYXJyb3dbc3R5bGVdW3RvcF0gPSBhcnJvd1RvcCArICdweCcpO1xuICAgICAgYXJyb3dMZWZ0ICYmIChhcnJvd1tzdHlsZV1bbGVmdF0gPSBhcnJvd0xlZnQgKyAncHgnKTtcbiAgXG4gICAgICBlbGVtZW50LmNsYXNzTmFtZVtpbmRleE9mXShwb3NpdGlvbikgPT09IC0xICYmIChlbGVtZW50LmNsYXNzTmFtZSA9IGVsZW1lbnQuY2xhc3NOYW1lLnJlcGxhY2UodGlwUG9zaXRpb25zLHBvc2l0aW9uKSk7XG4gICAgfTtcbiAgXG4gIEJTTi52ZXJzaW9uID0gJzIuMC4yMSc7XG4gIFxuICAvKiBOYXRpdmUgSmF2YXNjcmlwdCBmb3IgQm9vdHN0cmFwIDMgfCBBZmZpeFxuICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbiAgXG4gIC8vQUZGSVggREVGSU5JVElPTlxuICB2YXIgQWZmaXggPSBmdW5jdGlvbihlbGVtZW50LCBvcHRpb25zKSB7XG4gIFxuICAgIC8vIGluaXRpYWxpemF0aW9uIGVsZW1lbnRcbiAgICBlbGVtZW50ID0gcXVlcnlFbGVtZW50KGVsZW1lbnQpO1xuICBcbiAgICAvLyBzZXQgb3B0aW9uc1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICBcbiAgICAvLyByZWFkIERBVEEgQVBJXG4gICAgdmFyIHRhcmdldERhdGEgICAgICAgID0gZWxlbWVudFtnZXRBdHRyaWJ1dGVdKGRhdGFUYXJnZXQpLFxuICAgICAgICBvZmZzZXRUb3BEYXRhICAgICA9IGVsZW1lbnRbZ2V0QXR0cmlidXRlXShkYXRhT2Zmc2V0VG9wKSxcbiAgICAgICAgb2Zmc2V0Qm90dG9tRGF0YSAgPSBlbGVtZW50W2dldEF0dHJpYnV0ZV0oZGF0YU9mZnNldEJvdHRvbSksXG4gICAgICAgIFxuICAgICAgICAvLyBjb21wb25lbnQgc3BlY2lmaWMgc3RyaW5nc1xuICAgICAgICBhZmZpeCA9ICdhZmZpeCcsIGFmZml4ZWQgPSAnYWZmaXhlZCcsIGZuID0gJ2Z1bmN0aW9uJywgdXBkYXRlID0gJ3VwZGF0ZScsXG4gICAgICAgIGFmZml4VG9wID0gJ2FmZml4LXRvcCcsIGFmZml4ZWRUb3AgPSAnYWZmaXhlZC10b3AnLFxuICAgICAgICBhZmZpeEJvdHRvbSA9ICdhZmZpeC1ib3R0b20nLCBhZmZpeGVkQm90dG9tID0gJ2FmZml4ZWQtYm90dG9tJztcbiAgXG4gICAgdGhpc1t0YXJnZXRdID0gb3B0aW9uc1t0YXJnZXRdID8gcXVlcnlFbGVtZW50KG9wdGlvbnNbdGFyZ2V0XSkgOiBxdWVyeUVsZW1lbnQodGFyZ2V0RGF0YSkgfHwgbnVsbDsgLy8gdGFyZ2V0IGlzIGFuIG9iamVjdFxuICAgIHRoaXNbb2Zmc2V0VG9wXSA9IG9wdGlvbnNbb2Zmc2V0VG9wXSA/IG9wdGlvbnNbb2Zmc2V0VG9wXSA6IHBhcnNlSW50KG9mZnNldFRvcERhdGEpIHx8IDA7IC8vIG9mZnNldCBvcHRpb24gaXMgYW4gaW50ZWdlciBudW1iZXIgb3IgZnVuY3Rpb24gdG8gZGV0ZXJtaW5lIHRoYXQgbnVtYmVyXG4gICAgdGhpc1tvZmZzZXRCb3R0b21dID0gb3B0aW9uc1tvZmZzZXRCb3R0b21dID8gb3B0aW9uc1tvZmZzZXRCb3R0b21dOiBwYXJzZUludChvZmZzZXRCb3R0b21EYXRhKSB8fCAwO1xuICBcbiAgICBpZiAoICF0aGlzW3RhcmdldF0gJiYgISggdGhpc1tvZmZzZXRUb3BdIHx8IHRoaXNbb2Zmc2V0Qm90dG9tXSApICkgeyByZXR1cm47IH0gLy8gaW52YWxpZGF0ZVxuICBcbiAgICAvLyBpbnRlcm5hbCBiaW5kXG4gICAgdmFyIHNlbGYgPSB0aGlzLFxuICBcbiAgICAgIC8vIGNvbnN0YW50c1xuICAgICAgcGluT2Zmc2V0VG9wLCBwaW5PZmZzZXRCb3R0b20sIG1heFNjcm9sbCwgc2Nyb2xsWSwgcGlubmVkVG9wLCBwaW5uZWRCb3R0b20sXG4gICAgICBhZmZpeGVkVG9Ub3AgPSBmYWxzZSwgYWZmaXhlZFRvQm90dG9tID0gZmFsc2UsXG4gICAgICBcbiAgICAgIC8vIHByaXZhdGUgbWV0aG9kcyBcbiAgICAgIGdldE1heFNjcm9sbCA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiBNYXRoLm1heCggRE9DW2JvZHldW3Njcm9sbEhlaWdodF0sIERPQ1tib2R5XVtvZmZzZXRIZWlnaHRdLCBIVE1MW2NsaWVudEhlaWdodF0sIEhUTUxbc2Nyb2xsSGVpZ2h0XSwgSFRNTFtvZmZzZXRIZWlnaHRdICk7XG4gICAgICB9LFxuICAgICAgZ2V0T2Zmc2V0VG9wID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoIHNlbGZbdGFyZ2V0XSAhPT0gbnVsbCApIHtcbiAgICAgICAgICByZXR1cm4gc2VsZlt0YXJnZXRdW2dldEJvdW5kaW5nQ2xpZW50UmVjdF0oKVt0b3BdICsgc2Nyb2xsWTtcbiAgICAgICAgfSBlbHNlIGlmICggc2VsZltvZmZzZXRUb3BdICkge1xuICAgICAgICAgIHJldHVybiBwYXJzZUludCh0eXBlb2Ygc2VsZltvZmZzZXRUb3BdID09PSBmbiA/IHNlbGZbb2Zmc2V0VG9wXSgpIDogc2VsZltvZmZzZXRUb3BdIHx8IDApO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgZ2V0T2Zmc2V0Qm90dG9tID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoIHNlbGZbb2Zmc2V0Qm90dG9tXSApIHtcbiAgICAgICAgICByZXR1cm4gbWF4U2Nyb2xsIC0gZWxlbWVudFtvZmZzZXRIZWlnaHRdIC0gcGFyc2VJbnQoIHR5cGVvZiBzZWxmW29mZnNldEJvdHRvbV0gPT09IGZuID8gc2VsZltvZmZzZXRCb3R0b21dKCkgOiBzZWxmW29mZnNldEJvdHRvbV0gfHwgMCApO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgY2hlY2tQb3NpdGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgbWF4U2Nyb2xsID0gZ2V0TWF4U2Nyb2xsKCk7XG4gICAgICAgIHNjcm9sbFkgPSBwYXJzZUludChnZXRTY3JvbGwoKS55LDApO1xuICAgICAgICBwaW5PZmZzZXRUb3AgPSBnZXRPZmZzZXRUb3AoKTtcbiAgICAgICAgcGluT2Zmc2V0Qm90dG9tID0gZ2V0T2Zmc2V0Qm90dG9tKCk7IFxuICAgICAgICBwaW5uZWRUb3AgPSAoIHBhcnNlSW50KHBpbk9mZnNldFRvcCkgLSBzY3JvbGxZIDwgMCkgJiYgKHNjcm9sbFkgPiBwYXJzZUludChwaW5PZmZzZXRUb3ApICk7XG4gICAgICAgIHBpbm5lZEJvdHRvbSA9ICggcGFyc2VJbnQocGluT2Zmc2V0Qm90dG9tKSAtIHNjcm9sbFkgPCAwKSAmJiAoc2Nyb2xsWSA+IHBhcnNlSW50KHBpbk9mZnNldEJvdHRvbSkgKTtcbiAgICAgIH0sXG4gICAgICBwaW5Ub3AgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICggIWFmZml4ZWRUb1RvcCAmJiAhaGFzQ2xhc3MoZWxlbWVudCxhZmZpeCkgKSB7IC8vIG9uIGxvYWRpbmcgYSBwYWdlIGhhbGZ3YXkgc2Nyb2xsZWQgdGhlc2UgZXZlbnRzIGRvbid0IHRyaWdnZXIgaW4gQ2hyb21lXG4gICAgICAgICAgYm9vdHN0cmFwQ3VzdG9tRXZlbnQuY2FsbChlbGVtZW50LCBhZmZpeCwgYWZmaXgpO1xuICAgICAgICAgIGJvb3RzdHJhcEN1c3RvbUV2ZW50LmNhbGwoZWxlbWVudCwgYWZmaXhUb3AsIGFmZml4KTtcbiAgICAgICAgICBhZGRDbGFzcyhlbGVtZW50LGFmZml4KTtcbiAgICAgICAgICBhZmZpeGVkVG9Ub3AgPSB0cnVlO1xuICAgICAgICAgIGJvb3RzdHJhcEN1c3RvbUV2ZW50LmNhbGwoZWxlbWVudCwgYWZmaXhlZCwgYWZmaXgpO1xuICAgICAgICAgIGJvb3RzdHJhcEN1c3RvbUV2ZW50LmNhbGwoZWxlbWVudCwgYWZmaXhlZFRvcCwgYWZmaXgpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgdW5QaW5Ub3AgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICggYWZmaXhlZFRvVG9wICYmIGhhc0NsYXNzKGVsZW1lbnQsYWZmaXgpICkge1xuICAgICAgICAgIHJlbW92ZUNsYXNzKGVsZW1lbnQsYWZmaXgpO1xuICAgICAgICAgIGFmZml4ZWRUb1RvcCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgcGluQm90dG9tID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoICFhZmZpeGVkVG9Cb3R0b20gJiYgIWhhc0NsYXNzKGVsZW1lbnQsIGFmZml4Qm90dG9tKSApIHtcbiAgICAgICAgICBib290c3RyYXBDdXN0b21FdmVudC5jYWxsKGVsZW1lbnQsIGFmZml4LCBhZmZpeCk7XG4gICAgICAgICAgYm9vdHN0cmFwQ3VzdG9tRXZlbnQuY2FsbChlbGVtZW50LCBhZmZpeEJvdHRvbSwgYWZmaXgpO1xuICAgICAgICAgIGFkZENsYXNzKGVsZW1lbnQsYWZmaXhCb3R0b20pO1xuICAgICAgICAgIGFmZml4ZWRUb0JvdHRvbSA9IHRydWU7XG4gICAgICAgICAgYm9vdHN0cmFwQ3VzdG9tRXZlbnQuY2FsbChlbGVtZW50LCBhZmZpeGVkLCBhZmZpeCk7XG4gICAgICAgICAgYm9vdHN0cmFwQ3VzdG9tRXZlbnQuY2FsbChlbGVtZW50LCBhZmZpeGVkQm90dG9tLCBhZmZpeCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICB1blBpbkJvdHRvbSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCBhZmZpeGVkVG9Cb3R0b20gJiYgaGFzQ2xhc3MoZWxlbWVudCxhZmZpeEJvdHRvbSkgKSB7XG4gICAgICAgICAgcmVtb3ZlQ2xhc3MoZWxlbWVudCxhZmZpeEJvdHRvbSk7XG4gICAgICAgICAgYWZmaXhlZFRvQm90dG9tID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICB1cGRhdGVQaW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICggcGlubmVkQm90dG9tICkge1xuICAgICAgICAgIGlmICggcGlubmVkVG9wICkgeyB1blBpblRvcCgpOyB9XG4gICAgICAgICAgcGluQm90dG9tKCk7IFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHVuUGluQm90dG9tKCk7XG4gICAgICAgICAgaWYgKCBwaW5uZWRUb3AgKSB7IHBpblRvcCgpOyB9IFxuICAgICAgICAgIGVsc2UgeyB1blBpblRvcCgpOyB9XG4gICAgICAgIH1cbiAgICAgIH07XG4gIFxuICAgIC8vIHB1YmxpYyBtZXRob2RcbiAgICB0aGlzW3VwZGF0ZV0gPSBmdW5jdGlvbiAoKSB7XG4gICAgICBjaGVja1Bvc2l0aW9uKCk7XG4gICAgICB1cGRhdGVQaW4oKTsgXG4gICAgfTtcbiAgXG4gICAgLy8gaW5pdFxuICAgIGlmICggIShzdHJpbmdBZmZpeCBpbiBlbGVtZW50ICkgKSB7IC8vIHByZXZlbnQgYWRkaW5nIGV2ZW50IGhhbmRsZXJzIHR3aWNlXG4gICAgICBvbiggZ2xvYmFsT2JqZWN0LCBzY3JvbGxFdmVudCwgc2VsZlt1cGRhdGVdICk7XG4gICAgICAhaXNJRTggJiYgb24oIGdsb2JhbE9iamVjdCwgcmVzaXplRXZlbnQsIHNlbGZbdXBkYXRlXSApO1xuICAgIH1cbiAgICBlbGVtZW50W3N0cmluZ0FmZml4XSA9IHNlbGY7XG4gIFxuICAgIHNlbGZbdXBkYXRlXSgpO1xuICB9O1xuICBcbiAgLy8gQUZGSVggREFUQSBBUElcbiAgLy8gPT09PT09PT09PT09PT09PT1cbiAgc3VwcG9ydHNbcHVzaF0oW3N0cmluZ0FmZml4LCBBZmZpeCwgJ1snK2RhdGFTcHkrJz1cImFmZml4XCJdJ10pO1xuICBcbiAgXG4gIFxuICAvKiBOYXRpdmUgSmF2YXNjcmlwdCBmb3IgQm9vdHN0cmFwIDMgfCBBbGVydFxuICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbiAgXG4gIC8vIEFMRVJUIERFRklOSVRJT05cbiAgLy8gPT09PT09PT09PT09PT09PVxuICB2YXIgQWxlcnQgPSBmdW5jdGlvbiggZWxlbWVudCApIHtcbiAgICBcbiAgICAvLyBpbml0aWFsaXphdGlvbiBlbGVtZW50XG4gICAgZWxlbWVudCA9IHF1ZXJ5RWxlbWVudChlbGVtZW50KTtcbiAgXG4gICAgLy8gYmluZCwgdGFyZ2V0IGFsZXJ0LCBkdXJhdGlvbiBhbmQgc3R1ZmZcbiAgICB2YXIgc2VsZiA9IHRoaXMsIGNvbXBvbmVudCA9ICdhbGVydCcsXG4gICAgICBhbGVydCA9IGdldENsb3Nlc3QoZWxlbWVudCwnLicrY29tcG9uZW50KSxcbiAgICAgIHRyaWdnZXJIYW5kbGVyID0gZnVuY3Rpb24oKXsgaGFzQ2xhc3MoYWxlcnQsJ2ZhZGUnKSA/IGVtdWxhdGVUcmFuc2l0aW9uRW5kKGFsZXJ0LHRyYW5zaXRpb25FbmRIYW5kbGVyKSA6IHRyYW5zaXRpb25FbmRIYW5kbGVyKCk7IH0sXG4gICAgICAvLyBoYW5kbGVyc1xuICAgICAgY2xpY2tIYW5kbGVyID0gZnVuY3Rpb24oZSl7XG4gICAgICAgIGFsZXJ0ID0gZ2V0Q2xvc2VzdChlW3RhcmdldF0sJy4nK2NvbXBvbmVudCk7XG4gICAgICAgIGVsZW1lbnQgPSBxdWVyeUVsZW1lbnQoJ1snK2RhdGFEaXNtaXNzKyc9XCInK2NvbXBvbmVudCsnXCJdJyxhbGVydCk7XG4gICAgICAgIGVsZW1lbnQgJiYgYWxlcnQgJiYgKGVsZW1lbnQgPT09IGVbdGFyZ2V0XSB8fCBlbGVtZW50W2NvbnRhaW5zXShlW3RhcmdldF0pKSAmJiBzZWxmLmNsb3NlKCk7XG4gICAgICB9LFxuICAgICAgdHJhbnNpdGlvbkVuZEhhbmRsZXIgPSBmdW5jdGlvbigpe1xuICAgICAgICBib290c3RyYXBDdXN0b21FdmVudC5jYWxsKGFsZXJ0LCBjbG9zZWRFdmVudCwgY29tcG9uZW50KTtcbiAgICAgICAgb2ZmKGVsZW1lbnQsIGNsaWNrRXZlbnQsIGNsaWNrSGFuZGxlcik7IC8vIGRldGFjaCBpdCdzIGxpc3RlbmVyXG4gICAgICAgIGFsZXJ0W3BhcmVudE5vZGVdLnJlbW92ZUNoaWxkKGFsZXJ0KTtcbiAgICAgIH07XG4gICAgXG4gICAgLy8gcHVibGljIG1ldGhvZFxuICAgIHRoaXMuY2xvc2UgPSBmdW5jdGlvbigpIHtcbiAgICAgIGlmICggYWxlcnQgJiYgZWxlbWVudCAmJiBoYXNDbGFzcyhhbGVydCxpbkNsYXNzKSApIHtcbiAgICAgICAgYm9vdHN0cmFwQ3VzdG9tRXZlbnQuY2FsbChhbGVydCwgY2xvc2VFdmVudCwgY29tcG9uZW50KTtcbiAgICAgICAgcmVtb3ZlQ2xhc3MoYWxlcnQsaW5DbGFzcyk7XG4gICAgICAgIGFsZXJ0ICYmIHRyaWdnZXJIYW5kbGVyKCk7XG4gICAgICB9XG4gICAgfTtcbiAgXG4gICAgLy8gaW5pdFxuICAgIGlmICggIShzdHJpbmdBbGVydCBpbiBlbGVtZW50ICkgKSB7IC8vIHByZXZlbnQgYWRkaW5nIGV2ZW50IGhhbmRsZXJzIHR3aWNlXG4gICAgICBvbihlbGVtZW50LCBjbGlja0V2ZW50LCBjbGlja0hhbmRsZXIpO1xuICAgIH1cbiAgICBlbGVtZW50W3N0cmluZ0FsZXJ0XSA9IHNlbGY7XG4gIH07XG4gIFxuICAvLyBBTEVSVCBEQVRBIEFQSVxuICAvLyA9PT09PT09PT09PT09PVxuICBzdXBwb3J0c1twdXNoXShbc3RyaW5nQWxlcnQsIEFsZXJ0LCAnWycrZGF0YURpc21pc3MrJz1cImFsZXJ0XCJdJ10pO1xuICBcbiAgXG4gIFxuICAvKiBOYXRpdmUgSmF2YXNjcmlwdCBmb3IgQm9vdHN0cmFwIDMgfCBCdXR0b25cbiAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbiAgXG4gIC8vIEJVVFRPTiBERUZJTklUSU9OXG4gIC8vID09PT09PT09PT09PT09PT09PT1cbiAgdmFyIEJ1dHRvbiA9IGZ1bmN0aW9uKCBlbGVtZW50LCBvcHRpb24gKSB7XG4gIFxuICAgIC8vIGluaXRpYWxpemF0aW9uIGVsZW1lbnRcbiAgICBlbGVtZW50ID0gcXVlcnlFbGVtZW50KGVsZW1lbnQpO1xuICBcbiAgICAvLyBzZXQgb3B0aW9uXG4gICAgb3B0aW9uID0gb3B0aW9uIHx8IG51bGw7XG4gIFxuICAgIC8vIGNvbnN0YW50XG4gICAgdmFyIHRvZ2dsZWQgPSBmYWxzZSwgLy8gdG9nZ2xlZCBtYWtlcyBzdXJlIHRvIHByZXZlbnQgdHJpZ2dlcmluZyB0d2ljZSB0aGUgY2hhbmdlLmJzLmJ1dHRvbiBldmVudHNcbiAgXG4gICAgICAgIC8vIHN0cmluZ3NcbiAgICAgICAgY29tcG9uZW50ID0gJ2J1dHRvbicsXG4gICAgICAgIGNoZWNrZWQgPSAnY2hlY2tlZCcsXG4gICAgICAgIHJlc2V0ID0gJ3Jlc2V0JyxcbiAgICAgICAgTEFCRUwgPSAnTEFCRUwnLFxuICAgICAgICBJTlBVVCA9ICdJTlBVVCcsXG4gIFxuICAgICAgLy8gcHJpdmF0ZSBtZXRob2RzXG4gICAgICBzZXRTdGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoICEhIG9wdGlvbiAmJiBvcHRpb24gIT09IHJlc2V0ICkge1xuICAgICAgICAgIGlmICggb3B0aW9uID09PSBsb2FkaW5nICkge1xuICAgICAgICAgICAgYWRkQ2xhc3MoZWxlbWVudCxkaXNhYmxlZCk7XG4gICAgICAgICAgICBlbGVtZW50W3NldEF0dHJpYnV0ZV0oZGlzYWJsZWQsZGlzYWJsZWQpO1xuICAgICAgICAgICAgZWxlbWVudFtzZXRBdHRyaWJ1dGVdKGRhdGFPcmlnaW5hbFRleHQsIGVsZW1lbnRbaW5uZXJIVE1MXS50cmltKCkpOyAvLyB0cmltIHRoZSB0ZXh0XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsZW1lbnRbaW5uZXJIVE1MXSA9IGVsZW1lbnRbZ2V0QXR0cmlidXRlXSgnZGF0YS0nK29wdGlvbisnLXRleHQnKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHJlc2V0U3RhdGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKGVsZW1lbnRbZ2V0QXR0cmlidXRlXShkYXRhT3JpZ2luYWxUZXh0KSkge1xuICAgICAgICAgIGlmICggaGFzQ2xhc3MoZWxlbWVudCxkaXNhYmxlZCkgfHwgZWxlbWVudFtnZXRBdHRyaWJ1dGVdKGRpc2FibGVkKSA9PT0gZGlzYWJsZWQgKSB7XG4gICAgICAgICAgICByZW1vdmVDbGFzcyhlbGVtZW50LGRpc2FibGVkKTtcbiAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKGRpc2FibGVkKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxlbWVudFtpbm5lckhUTUxdID0gZWxlbWVudFtnZXRBdHRyaWJ1dGVdKGRhdGFPcmlnaW5hbFRleHQpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAga2V5SGFuZGxlciA9IGZ1bmN0aW9uKGUpeyBcbiAgICAgICAgdmFyIGtleSA9IGUud2hpY2ggfHwgZS5rZXlDb2RlO1xuICAgICAgICBrZXkgPT09IDMyICYmIGVbdGFyZ2V0XSA9PT0gRE9DLmFjdGl2ZUVsZW1lbnQgJiYgdG9nZ2xlKGUpO1xuICAgICAgfSxcbiAgICAgIHByZXZlbnRTY3JvbGwgPSBmdW5jdGlvbihlKXsgXG4gICAgICAgIHZhciBrZXkgPSBlLndoaWNoIHx8IGUua2V5Q29kZTtcbiAgICAgICAga2V5ID09PSAzMiAmJiBlW3ByZXZlbnREZWZhdWx0XSgpO1xuICAgICAgfSwgICAgXG4gICAgICB0b2dnbGUgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgIHZhciBsYWJlbCA9IGVbdGFyZ2V0XS50YWdOYW1lID09PSBMQUJFTCA/IGVbdGFyZ2V0XSA6IGVbdGFyZ2V0XVtwYXJlbnROb2RlXS50YWdOYW1lID09PSBMQUJFTCA/IGVbdGFyZ2V0XVtwYXJlbnROb2RlXSA6IG51bGw7IC8vIHRoZSAuYnRuIGxhYmVsXG4gICAgICAgIFxuICAgICAgICBpZiAoICFsYWJlbCApIHJldHVybjsgLy9yZWFjdCBpZiBhIGxhYmVsIG9yIGl0cyBpbW1lZGlhdGUgY2hpbGQgaXMgY2xpY2tlZFxuICBcbiAgICAgICAgdmFyIGV2ZW50VGFyZ2V0ID0gZVt0YXJnZXRdLCAvLyB0aGUgYnV0dG9uIGl0c2VsZiwgdGhlIHRhcmdldCBvZiB0aGUgaGFuZGxlciBmdW5jdGlvblxuICAgICAgICAgIGxhYmVscyA9IGdldEVsZW1lbnRzQnlDbGFzc05hbWUoZXZlbnRUYXJnZXRbcGFyZW50Tm9kZV0sJ2J0bicpLCAvLyBhbGwgdGhlIGJ1dHRvbiBncm91cCBidXR0b25zXG4gICAgICAgICAgaW5wdXQgPSBsYWJlbFtnZXRFbGVtZW50c0J5VGFnTmFtZV0oSU5QVVQpWzBdO1xuICBcbiAgICAgICAgaWYgKCAhaW5wdXQgKSByZXR1cm47IC8vcmV0dXJuIGlmIG5vIGlucHV0IGZvdW5kXG4gIFxuICAgICAgICAvLyBtYW5hZ2UgdGhlIGRvbSBtYW5pcHVsYXRpb25cbiAgICAgICAgaWYgKCBpbnB1dC50eXBlID09PSAnY2hlY2tib3gnICkgeyAvL2NoZWNrYm94ZXNcbiAgICAgICAgICBpZiAoICFpbnB1dFtjaGVja2VkXSApIHtcbiAgICAgICAgICAgIGFkZENsYXNzKGxhYmVsLGFjdGl2ZSk7XG4gICAgICAgICAgICBpbnB1dFtnZXRBdHRyaWJ1dGVdKGNoZWNrZWQpO1xuICAgICAgICAgICAgaW5wdXRbc2V0QXR0cmlidXRlXShjaGVja2VkLGNoZWNrZWQpO1xuICAgICAgICAgICAgaW5wdXRbY2hlY2tlZF0gPSB0cnVlO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZW1vdmVDbGFzcyhsYWJlbCxhY3RpdmUpO1xuICAgICAgICAgICAgaW5wdXRbZ2V0QXR0cmlidXRlXShjaGVja2VkKTtcbiAgICAgICAgICAgIGlucHV0LnJlbW92ZUF0dHJpYnV0ZShjaGVja2VkKTtcbiAgICAgICAgICAgIGlucHV0W2NoZWNrZWRdID0gZmFsc2U7XG4gICAgICAgICAgfVxuICBcbiAgICAgICAgICBpZiAoIXRvZ2dsZWQpIHsgLy8gcHJldmVudCB0cmlnZ2VyaW5nIHRoZSBldmVudCB0d2ljZVxuICAgICAgICAgICAgdG9nZ2xlZCA9IHRydWU7XG4gICAgICAgICAgICBib290c3RyYXBDdXN0b21FdmVudC5jYWxsKGlucHV0LCBjaGFuZ2VFdmVudCwgY29tcG9uZW50KTsgLy90cmlnZ2VyIHRoZSBjaGFuZ2UgZm9yIHRoZSBpbnB1dFxuICAgICAgICAgICAgYm9vdHN0cmFwQ3VzdG9tRXZlbnQuY2FsbChlbGVtZW50LCBjaGFuZ2VFdmVudCwgY29tcG9uZW50KTsgLy90cmlnZ2VyIHRoZSBjaGFuZ2UgZm9yIHRoZSBidG4tZ3JvdXBcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgXG4gICAgICAgIGlmICggaW5wdXQudHlwZSA9PT0gJ3JhZGlvJyAmJiAhdG9nZ2xlZCApIHsgLy8gcmFkaW8gYnV0dG9uc1xuICAgICAgICAgIGlmICggIWlucHV0W2NoZWNrZWRdICkgeyAvLyBkb24ndCB0cmlnZ2VyIGlmIGFscmVhZHkgYWN0aXZlXG4gICAgICAgICAgICBhZGRDbGFzcyhsYWJlbCxhY3RpdmUpO1xuICAgICAgICAgICAgaW5wdXRbc2V0QXR0cmlidXRlXShjaGVja2VkLGNoZWNrZWQpO1xuICAgICAgICAgICAgaW5wdXRbY2hlY2tlZF0gPSB0cnVlO1xuICAgICAgICAgICAgYm9vdHN0cmFwQ3VzdG9tRXZlbnQuY2FsbChpbnB1dCwgY2hhbmdlRXZlbnQsIGNvbXBvbmVudCk7IC8vdHJpZ2dlciB0aGUgY2hhbmdlIGZvciB0aGUgaW5wdXRcbiAgICAgICAgICAgIGJvb3RzdHJhcEN1c3RvbUV2ZW50LmNhbGwoZWxlbWVudCwgY2hhbmdlRXZlbnQsIGNvbXBvbmVudCk7IC8vdHJpZ2dlciB0aGUgY2hhbmdlIGZvciB0aGUgYnRuLWdyb3VwXG4gIFxuICAgICAgICAgICAgdG9nZ2xlZCA9IHRydWU7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbGwgPSBsYWJlbHNbbGVuZ3RoXTsgaTxsbDsgaSsrKSB7XG4gICAgICAgICAgICAgIHZhciBvdGhlckxhYmVsID0gbGFiZWxzW2ldLCBvdGhlcklucHV0ID0gb3RoZXJMYWJlbFtnZXRFbGVtZW50c0J5VGFnTmFtZV0oSU5QVVQpWzBdO1xuICAgICAgICAgICAgICBpZiAoIG90aGVyTGFiZWwgIT09IGxhYmVsICYmIGhhc0NsYXNzKG90aGVyTGFiZWwsYWN0aXZlKSApICB7XG4gICAgICAgICAgICAgICAgcmVtb3ZlQ2xhc3Mob3RoZXJMYWJlbCxhY3RpdmUpO1xuICAgICAgICAgICAgICAgIG90aGVySW5wdXQucmVtb3ZlQXR0cmlidXRlKGNoZWNrZWQpO1xuICAgICAgICAgICAgICAgIG90aGVySW5wdXRbY2hlY2tlZF0gPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBib290c3RyYXBDdXN0b21FdmVudC5jYWxsKG90aGVySW5wdXQsIGNoYW5nZUV2ZW50LCBjb21wb25lbnQpOyAvLyB0cmlnZ2VyIHRoZSBjaGFuZ2VcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBzZXRUaW1lb3V0KCBmdW5jdGlvbigpIHsgdG9nZ2xlZCA9IGZhbHNlOyB9LCA1MCApO1xuICAgICAgfTtcbiAgXG4gICAgLy8gaW5pdFxuICAgIGlmICggaGFzQ2xhc3MoZWxlbWVudCwnYnRuJykgKSB7IC8vIHdoZW4gQnV0dG9uIHRleHQgaXMgdXNlZCB3ZSBleGVjdXRlIGl0IGFzIGFuIGluc3RhbmNlIG1ldGhvZFxuICAgICAgaWYgKCBvcHRpb24gIT09IG51bGwgKSB7XG4gICAgICAgIGlmICggb3B0aW9uICE9PSByZXNldCApIHsgc2V0U3RhdGUoKTsgfSBcbiAgICAgICAgZWxzZSB7IHJlc2V0U3RhdGUoKTsgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7IC8vIGlmICggaGFzQ2xhc3MoZWxlbWVudCwnYnRuLWdyb3VwJykgKSAvLyB3ZSBhbGxvdyB0aGUgc2NyaXB0IHRvIHdvcmsgb3V0c2lkZSBidG4tZ3JvdXAgY29tcG9uZW50XG4gICAgICBcbiAgICAgIGlmICggISggc3RyaW5nQnV0dG9uIGluIGVsZW1lbnQgKSApIHsgLy8gcHJldmVudCBhZGRpbmcgZXZlbnQgaGFuZGxlcnMgdHdpY2VcbiAgICAgICAgb24oIGVsZW1lbnQsIGNsaWNrRXZlbnQsIHRvZ2dsZSApO1xuICAgICAgICBxdWVyeUVsZW1lbnQoJ1snK3RhYmluZGV4KyddJyxlbGVtZW50KSAmJiBvbiggZWxlbWVudCwga2V5dXBFdmVudCwga2V5SGFuZGxlciApLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb24oIGVsZW1lbnQsIGtleWRvd25FdmVudCwgcHJldmVudFNjcm9sbCApO1xuICAgICAgfVxuICBcbiAgICAgIC8vIGFjdGl2YXRlIGl0ZW1zIG9uIGxvYWRcbiAgICAgIHZhciBsYWJlbHNUb0FDdGl2YXRlID0gZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShlbGVtZW50LCAnYnRuJyksIGxibGwgPSBsYWJlbHNUb0FDdGl2YXRlW2xlbmd0aF07XG4gICAgICBmb3IgKHZhciBpPTA7IGk8bGJsbDsgaSsrKSB7XG4gICAgICAgICFoYXNDbGFzcyhsYWJlbHNUb0FDdGl2YXRlW2ldLGFjdGl2ZSkgJiYgcXVlcnlFbGVtZW50KCdpbnB1dCcsbGFiZWxzVG9BQ3RpdmF0ZVtpXSlbZ2V0QXR0cmlidXRlXShjaGVja2VkKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICYmIGFkZENsYXNzKGxhYmVsc1RvQUN0aXZhdGVbaV0sYWN0aXZlKTtcbiAgICAgIH1cbiAgICAgIGVsZW1lbnRbc3RyaW5nQnV0dG9uXSA9IHRoaXM7XG4gICAgfVxuICB9O1xuICBcbiAgLy8gQlVUVE9OIERBVEEgQVBJXG4gIC8vID09PT09PT09PT09PT09PT09XG4gIHN1cHBvcnRzW3B1c2hdKCBbIHN0cmluZ0J1dHRvbiwgQnV0dG9uLCAnWycrZGF0YVRvZ2dsZSsnPVwiYnV0dG9uc1wiXScgXSApO1xuICBcbiAgXG4gIC8qIE5hdGl2ZSBKYXZhc2NyaXB0IGZvciBCb290c3RyYXAgMyB8IENhcm91c2VsXG4gIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuICBcbiAgLy8gQ0FST1VTRUwgREVGSU5JVElPTlxuICAvLyA9PT09PT09PT09PT09PT09PT09XG4gIHZhciBDYXJvdXNlbCA9IGZ1bmN0aW9uKCBlbGVtZW50LCBvcHRpb25zICkge1xuICBcbiAgICAvLyBpbml0aWFsaXphdGlvbiBlbGVtZW50XG4gICAgZWxlbWVudCA9IHF1ZXJ5RWxlbWVudCggZWxlbWVudCApO1xuICBcbiAgICAvLyBzZXQgb3B0aW9uc1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICBcbiAgICAvLyBEQVRBIEFQSVxuICAgIHZhciBpbnRlcnZhbEF0dHJpYnV0ZSA9IGVsZW1lbnRbZ2V0QXR0cmlidXRlXShkYXRhSW50ZXJ2YWwpLFxuICAgICAgICBpbnRlcnZhbE9wdGlvbiA9IG9wdGlvbnNbaW50ZXJ2YWxdLFxuICAgICAgICBpbnRlcnZhbERhdGEgPSBpbnRlcnZhbEF0dHJpYnV0ZSA9PT0gJ2ZhbHNlJyA/IDAgOiBwYXJzZUludChpbnRlcnZhbEF0dHJpYnV0ZSkgfHwgNTAwMCwgIC8vIGJvb3RzdHJhcCBjYXJvdXNlbCBkZWZhdWx0IGludGVydmFsXG4gICAgICAgIHBhdXNlRGF0YSA9IGVsZW1lbnRbZ2V0QXR0cmlidXRlXShkYXRhUGF1c2UpID09PSBob3ZlckV2ZW50IHx8IGZhbHNlLFxuICAgICAgICBrZXlib2FyZERhdGEgPSBlbGVtZW50W2dldEF0dHJpYnV0ZV0oZGF0YUtleWJvYXJkKSA9PT0gJ3RydWUnIHx8IGZhbHNlLFxuICAgICAgXG4gICAgICAgIC8vIHN0cmluZ3NcbiAgICAgICAgY29tcG9uZW50ID0gJ2Nhcm91c2VsJyxcbiAgICAgICAgcGF1c2VkID0gJ3BhdXNlZCcsXG4gICAgICAgIGRpcmVjdGlvbiA9ICdkaXJlY3Rpb24nLFxuICAgICAgICBkYXRhU2xpZGVUbyA9ICdkYXRhLXNsaWRlLXRvJzsgXG4gIFxuICAgIHRoaXNba2V5Ym9hcmRdID0gb3B0aW9uc1trZXlib2FyZF0gPT09IHRydWUgfHwga2V5Ym9hcmREYXRhO1xuICAgIHRoaXNbcGF1c2VdID0gKG9wdGlvbnNbcGF1c2VdID09PSBob3ZlckV2ZW50IHx8IHBhdXNlRGF0YSkgPyBob3ZlckV2ZW50IDogZmFsc2U7IC8vIGZhbHNlIC8gaG92ZXJcbiAgXG4gICAgdGhpc1tpbnRlcnZhbF0gPSB0eXBlb2YgaW50ZXJ2YWxPcHRpb24gPT09ICdudW1iZXInID8gaW50ZXJ2YWxPcHRpb25cbiAgICA6IGludGVydmFsRGF0YSA9PT0gMCA/IDBcbiAgICA6IGludGVydmFsRGF0YTtcbiAgXG4gICAgLy8gYmluZCwgZXZlbnQgdGFyZ2V0c1xuICAgIHZhciBzZWxmID0gdGhpcywgaW5kZXggPSBlbGVtZW50LmluZGV4ID0gMCwgdGltZXIgPSBlbGVtZW50LnRpbWVyID0gMCwgXG4gICAgICBpc1NsaWRpbmcgPSBmYWxzZSwgLy8gaXNTbGlkaW5nIHByZXZlbnRzIGNsaWNrIGV2ZW50IGhhbmRsZXJzIHdoZW4gYW5pbWF0aW9uIGlzIHJ1bm5pbmdcbiAgICAgIHNsaWRlcyA9IGdldEVsZW1lbnRzQnlDbGFzc05hbWUoZWxlbWVudCwnaXRlbScpLCB0b3RhbCA9IHNsaWRlc1tsZW5ndGhdLFxuICAgICAgc2xpZGVEaXJlY3Rpb24gPSB0aGlzW2RpcmVjdGlvbl0gPSBsZWZ0LFxuICAgICAgY29udHJvbHMgPSBnZXRFbGVtZW50c0J5Q2xhc3NOYW1lKGVsZW1lbnQsY29tcG9uZW50KyctY29udHJvbCcpLFxuICAgICAgbGVmdEFycm93ID0gY29udHJvbHNbMF0sIHJpZ2h0QXJyb3cgPSBjb250cm9sc1sxXSxcbiAgICAgIGluZGljYXRvciA9IHF1ZXJ5RWxlbWVudCggJy4nK2NvbXBvbmVudCsnLWluZGljYXRvcnMnLCBlbGVtZW50ICksXG4gICAgICBpbmRpY2F0b3JzID0gaW5kaWNhdG9yICYmIGluZGljYXRvcltnZXRFbGVtZW50c0J5VGFnTmFtZV0oIFwiTElcIiApIHx8IFtdO1xuICBcbiAgICAvLyBoYW5kbGVyc1xuICAgIHZhciBwYXVzZUhhbmRsZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICggc2VsZltpbnRlcnZhbF0gIT09ZmFsc2UgJiYgIWhhc0NsYXNzKGVsZW1lbnQscGF1c2VkKSApIHtcbiAgICAgICAgICBhZGRDbGFzcyhlbGVtZW50LHBhdXNlZCk7XG4gICAgICAgICAgIWlzU2xpZGluZyAmJiBjbGVhckludGVydmFsKCB0aW1lciApO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgcmVzdW1lSGFuZGxlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoIHNlbGZbaW50ZXJ2YWxdICE9PSBmYWxzZSAmJiBoYXNDbGFzcyhlbGVtZW50LHBhdXNlZCkgKSB7XG4gICAgICAgICAgcmVtb3ZlQ2xhc3MoZWxlbWVudCxwYXVzZWQpO1xuICAgICAgICAgICFpc1NsaWRpbmcgJiYgY2xlYXJJbnRlcnZhbCggdGltZXIgKTtcbiAgICAgICAgICAhaXNTbGlkaW5nICYmIHNlbGYuY3ljbGUoKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGluZGljYXRvckhhbmRsZXIgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgIGVbcHJldmVudERlZmF1bHRdKCk7XG4gICAgICAgIGlmIChpc1NsaWRpbmcpIHJldHVybjtcbiAgXG4gICAgICAgIHZhciBldmVudFRhcmdldCA9IGVbdGFyZ2V0XTsgLy8gZXZlbnQgdGFyZ2V0IHwgdGhlIGN1cnJlbnQgYWN0aXZlIGl0ZW1cbiAgXG4gICAgICAgIGlmICggZXZlbnRUYXJnZXQgJiYgIWhhc0NsYXNzKGV2ZW50VGFyZ2V0LGFjdGl2ZSkgJiYgZXZlbnRUYXJnZXRbZ2V0QXR0cmlidXRlXShkYXRhU2xpZGVUbykgKSB7XG4gICAgICAgICAgaW5kZXggPSBwYXJzZUludCggZXZlbnRUYXJnZXRbZ2V0QXR0cmlidXRlXShkYXRhU2xpZGVUbyksIDEwICk7XG4gICAgICAgIH0gZWxzZSB7IHJldHVybiBmYWxzZTsgfVxuICBcbiAgICAgICAgc2VsZi5zbGlkZVRvKCBpbmRleCApOyAvL0RvIHRoZSBzbGlkZVxuICAgICAgfSxcbiAgICAgIGNvbnRyb2xzSGFuZGxlciA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGVbcHJldmVudERlZmF1bHRdKCk7XG4gICAgICAgIGlmIChpc1NsaWRpbmcpIHJldHVybjtcbiAgXG4gICAgICAgIHZhciBldmVudFRhcmdldCA9IGUuY3VycmVudFRhcmdldCB8fCBlLnNyY0VsZW1lbnQ7XG4gIFxuICAgICAgICBpZiAoIGV2ZW50VGFyZ2V0ID09PSByaWdodEFycm93ICkge1xuICAgICAgICAgIGluZGV4Kys7XG4gICAgICAgIH0gZWxzZSBpZiAoIGV2ZW50VGFyZ2V0ID09PSBsZWZ0QXJyb3cgKSB7XG4gICAgICAgICAgaW5kZXgtLTtcbiAgICAgICAgfVxuICBcbiAgICAgICAgc2VsZi5zbGlkZVRvKCBpbmRleCApOyAvL0RvIHRoZSBzbGlkZVxuICAgICAgfSxcbiAgICAgIGtleUhhbmRsZXIgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgICBpZiAoaXNTbGlkaW5nKSByZXR1cm47XG4gICAgICAgIHN3aXRjaCAoZS53aGljaCkge1xuICAgICAgICAgIGNhc2UgMzk6XG4gICAgICAgICAgICBpbmRleCsrO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAzNzpcbiAgICAgICAgICAgIGluZGV4LS07XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBkZWZhdWx0OiByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgc2VsZi5zbGlkZVRvKCBpbmRleCApOyAvL0RvIHRoZSBzbGlkZVxuICAgICAgfSxcbiAgICAgIC8vIHByaXZhdGUgbWV0aG9kc1xuICAgICAgaXNFbGVtZW50SW5TY3JvbGxSYW5nZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHJlY3QgPSBlbGVtZW50W2dldEJvdW5kaW5nQ2xpZW50UmVjdF0oKSxcbiAgICAgICAgICB2aWV3cG9ydEhlaWdodCA9IGdsb2JhbE9iamVjdFtpbm5lckhlaWdodF0gfHwgSFRNTFtjbGllbnRIZWlnaHRdXG4gICAgICAgIHJldHVybiByZWN0W3RvcF0gPD0gdmlld3BvcnRIZWlnaHQgJiYgcmVjdFtib3R0b21dID49IDA7IC8vIGJvdHRvbSAmJiB0b3BcbiAgICAgIH0sICBcbiAgICAgIHNldEFjdGl2ZVBhZ2UgPSBmdW5jdGlvbiggcGFnZUluZGV4ICkgeyAvL2luZGljYXRvcnNcbiAgICAgICAgZm9yICggdmFyIGkgPSAwLCBpY2wgPSBpbmRpY2F0b3JzW2xlbmd0aF07IGkgPCBpY2w7IGkrKyApIHtcbiAgICAgICAgICByZW1vdmVDbGFzcyhpbmRpY2F0b3JzW2ldLGFjdGl2ZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGluZGljYXRvcnNbcGFnZUluZGV4XSkgYWRkQ2xhc3MoaW5kaWNhdG9yc1twYWdlSW5kZXhdLCBhY3RpdmUpO1xuICAgICAgfTtcbiAgXG4gIFxuICAgIC8vIHB1YmxpYyBtZXRob2RzXG4gICAgdGhpcy5jeWNsZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgdGltZXIgPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcbiAgICAgICAgaXNFbGVtZW50SW5TY3JvbGxSYW5nZSgpICYmIChpbmRleCsrLCBzZWxmLnNsaWRlVG8oIGluZGV4ICkgKTtcbiAgICAgIH0sIHRoaXNbaW50ZXJ2YWxdKTtcbiAgICB9O1xuICAgIHRoaXMuc2xpZGVUbyA9IGZ1bmN0aW9uKCBuZXh0ICkge1xuICAgICAgaWYgKGlzU2xpZGluZykgcmV0dXJuOyAvLyB3aGVuIGNvbnRyb2xlZCB2aWEgbWV0aG9kcywgbWFrZSBzdXJlIHRvIGNoZWNrIGFnYWluICAgIFxuICAgICAgdmFyIGFjdGl2ZUl0ZW0gPSB0aGlzLmdldEFjdGl2ZUluZGV4KCksIC8vIHRoZSBjdXJyZW50IGFjdGl2ZVxuICAgICAgICAgIG9yaWVudGF0aW9uO1xuICAgICAgXG4gICAgICAvLyBkZXRlcm1pbmUgc2xpZGVEaXJlY3Rpb24gZmlyc3RcbiAgICAgIGlmICAoIChhY3RpdmVJdGVtIDwgbmV4dCApIHx8IChhY3RpdmVJdGVtID09PSAwICYmIG5leHQgPT09IHRvdGFsIC0xICkgKSB7XG4gICAgICAgIHNsaWRlRGlyZWN0aW9uID0gc2VsZltkaXJlY3Rpb25dID0gbGVmdDsgLy8gbmV4dFxuICAgICAgfSBlbHNlIGlmICAoIChhY3RpdmVJdGVtID4gbmV4dCkgfHwgKGFjdGl2ZUl0ZW0gPT09IHRvdGFsIC0gMSAmJiBuZXh0ID09PSAwICkgKSB7XG4gICAgICAgIHNsaWRlRGlyZWN0aW9uID0gc2VsZltkaXJlY3Rpb25dID0gcmlnaHQ7IC8vIHByZXZcbiAgICAgIH1cbiAgXG4gICAgICAvLyBmaW5kIHRoZSByaWdodCBuZXh0IGluZGV4IFxuICAgICAgaWYgKCBuZXh0IDwgMCApIHsgbmV4dCA9IHRvdGFsIC0gMTsgfSBcbiAgICAgIGVsc2UgaWYgKCBuZXh0ID09PSB0b3RhbCApeyBuZXh0ID0gMDsgfVxuICBcbiAgICAgIC8vIHVwZGF0ZSBpbmRleFxuICAgICAgaW5kZXggPSBuZXh0O1xuICAgICAgXG4gICAgICBvcmllbnRhdGlvbiA9IHNsaWRlRGlyZWN0aW9uID09PSBsZWZ0ID8gJ25leHQnIDogJ3ByZXYnOyAvL2RldGVybWluZSB0eXBlXG4gICAgICBib290c3RyYXBDdXN0b21FdmVudC5jYWxsKGVsZW1lbnQsIHNsaWRlRXZlbnQsIGNvbXBvbmVudCwgc2xpZGVzW25leHRdKTsgLy8gaGVyZSB3ZSBnbyB3aXRoIHRoZSBzbGlkZVxuICBcbiAgICAgIGlzU2xpZGluZyA9IHRydWU7XG4gICAgICBjbGVhckludGVydmFsKHRpbWVyKTtcbiAgICAgIHNldEFjdGl2ZVBhZ2UoIG5leHQgKTtcbiAgXG4gICAgICBpZiAoIHN1cHBvcnRUcmFuc2l0aW9ucyAmJiBoYXNDbGFzcyhlbGVtZW50LCdzbGlkZScpICkge1xuICBcbiAgICAgICAgYWRkQ2xhc3Moc2xpZGVzW25leHRdLG9yaWVudGF0aW9uKTtcbiAgICAgICAgc2xpZGVzW25leHRdW29mZnNldFdpZHRoXTtcbiAgICAgICAgYWRkQ2xhc3Moc2xpZGVzW25leHRdLHNsaWRlRGlyZWN0aW9uKTtcbiAgICAgICAgYWRkQ2xhc3Moc2xpZGVzW2FjdGl2ZUl0ZW1dLHNsaWRlRGlyZWN0aW9uKTtcbiAgXG4gICAgICAgIG9uZShzbGlkZXNbYWN0aXZlSXRlbV0sIHRyYW5zaXRpb25FbmRFdmVudCwgZnVuY3Rpb24oZSkge1xuICAgICAgICAgIHZhciB0aW1lb3V0ID0gZVt0YXJnZXRdICE9PSBzbGlkZXNbYWN0aXZlSXRlbV0gPyBlLmVsYXBzZWRUaW1lKjEwMDAgOiAwO1xuICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGlzU2xpZGluZyA9IGZhbHNlO1xuICBcbiAgICAgICAgICAgIGFkZENsYXNzKHNsaWRlc1tuZXh0XSxhY3RpdmUpO1xuICAgICAgICAgICAgcmVtb3ZlQ2xhc3Moc2xpZGVzW2FjdGl2ZUl0ZW1dLGFjdGl2ZSk7XG4gIFxuICAgICAgICAgICAgcmVtb3ZlQ2xhc3Moc2xpZGVzW25leHRdLG9yaWVudGF0aW9uKTtcbiAgICAgICAgICAgIHJlbW92ZUNsYXNzKHNsaWRlc1tuZXh0XSxzbGlkZURpcmVjdGlvbik7XG4gICAgICAgICAgICByZW1vdmVDbGFzcyhzbGlkZXNbYWN0aXZlSXRlbV0sc2xpZGVEaXJlY3Rpb24pO1xuICBcbiAgICAgICAgICAgIGJvb3RzdHJhcEN1c3RvbUV2ZW50LmNhbGwoZWxlbWVudCwgc2xpZEV2ZW50LCBjb21wb25lbnQsIHNsaWRlc1tuZXh0XSk7XG4gIFxuICAgICAgICAgICAgaWYgKCBzZWxmW2ludGVydmFsXSAmJiAhaGFzQ2xhc3MoZWxlbWVudCxwYXVzZWQpICkge1xuICAgICAgICAgICAgICBzZWxmLmN5Y2xlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSx0aW1lb3V0KzEwMCk7XG4gICAgICAgIH0pO1xuICBcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGFkZENsYXNzKHNsaWRlc1tuZXh0XSxhY3RpdmUpO1xuICAgICAgICBzbGlkZXNbbmV4dF1bb2Zmc2V0V2lkdGhdO1xuICAgICAgICByZW1vdmVDbGFzcyhzbGlkZXNbYWN0aXZlSXRlbV0sYWN0aXZlKTtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICBpc1NsaWRpbmcgPSBmYWxzZTtcbiAgICAgICAgICBpZiAoIHNlbGZbaW50ZXJ2YWxdICYmICFoYXNDbGFzcyhlbGVtZW50LHBhdXNlZCkgKSB7XG4gICAgICAgICAgICBzZWxmLmN5Y2xlKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJvb3RzdHJhcEN1c3RvbUV2ZW50LmNhbGwoZWxlbWVudCwgc2xpZEV2ZW50LCBjb21wb25lbnQsIHNsaWRlc1tuZXh0XSk7IC8vIGhlcmUgd2UgZ28gd2l0aCB0aGUgc2xpZCBldmVudFxuICAgICAgICB9LCAxMDAgKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIHRoaXMuZ2V0QWN0aXZlSW5kZXggPSBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gc2xpZGVzW2luZGV4T2ZdKGdldEVsZW1lbnRzQnlDbGFzc05hbWUoZWxlbWVudCwnaXRlbSBhY3RpdmUnKVswXSkgfHwgMDtcbiAgICB9O1xuICBcbiAgICAvLyBpbml0XG4gICAgaWYgKCAhKHN0cmluZ0Nhcm91c2VsIGluIGVsZW1lbnQgKSApIHsgLy8gcHJldmVudCBhZGRpbmcgZXZlbnQgaGFuZGxlcnMgdHdpY2VcbiAgXG4gICAgICBpZiAoIHNlbGZbcGF1c2VdICYmIHNlbGZbaW50ZXJ2YWxdICkge1xuICAgICAgICBvbiggZWxlbWVudCwgbW91c2VIb3ZlclswXSwgcGF1c2VIYW5kbGVyICk7XG4gICAgICAgIG9uKCBlbGVtZW50LCBtb3VzZUhvdmVyWzFdLCByZXN1bWVIYW5kbGVyICk7XG4gICAgICAgIG9uKCBlbGVtZW50LCAndG91Y2hzdGFydCcsIHBhdXNlSGFuZGxlciApO1xuICAgICAgICBvbiggZWxlbWVudCwgJ3RvdWNoZW5kJywgcmVzdW1lSGFuZGxlciApO1xuICAgICAgfVxuICAgIFxuICAgICAgcmlnaHRBcnJvdyAmJiBvbiggcmlnaHRBcnJvdywgY2xpY2tFdmVudCwgY29udHJvbHNIYW5kbGVyICk7XG4gICAgICBsZWZ0QXJyb3cgJiYgb24oIGxlZnRBcnJvdywgY2xpY2tFdmVudCwgY29udHJvbHNIYW5kbGVyICk7XG4gICAgXG4gICAgICBpbmRpY2F0b3IgJiYgb24oIGluZGljYXRvciwgY2xpY2tFdmVudCwgaW5kaWNhdG9ySGFuZGxlciApO1xuICAgICAgc2VsZltrZXlib2FyZF0gJiYgb24oIGdsb2JhbE9iamVjdCwga2V5ZG93bkV2ZW50LCBrZXlIYW5kbGVyICk7XG4gIFxuICAgIH1cbiAgICBpZiAoc2VsZi5nZXRBY3RpdmVJbmRleCgpPDApIHtcbiAgICAgIHNsaWRlc1tsZW5ndGhdICYmIGFkZENsYXNzKHNsaWRlc1swXSxhY3RpdmUpO1xuICAgICAgaW5kaWNhdG9yc1tsZW5ndGhdICYmIHNldEFjdGl2ZVBhZ2UoMCk7XG4gICAgfVxuICBcbiAgICBpZiAoIHNlbGZbaW50ZXJ2YWxdICl7IHNlbGYuY3ljbGUoKTsgfVxuICAgIGVsZW1lbnRbc3RyaW5nQ2Fyb3VzZWxdID0gc2VsZjtcbiAgfTtcbiAgXG4gIC8vIENBUk9VU0VMIERBVEEgQVBJXG4gIC8vID09PT09PT09PT09PT09PT09XG4gIHN1cHBvcnRzW3B1c2hdKCBbIHN0cmluZ0Nhcm91c2VsLCBDYXJvdXNlbCwgJ1snK2RhdGFSaWRlKyc9XCJjYXJvdXNlbFwiXScgXSApO1xuICBcbiAgXG4gIC8qIE5hdGl2ZSBKYXZhc2NyaXB0IGZvciBCb290c3RyYXAgMyB8IENvbGxhcHNlXG4gIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbiAgXG4gIC8vIENPTExBUFNFIERFRklOSVRJT05cbiAgLy8gPT09PT09PT09PT09PT09PT09PVxuICB2YXIgQ29sbGFwc2UgPSBmdW5jdGlvbiggZWxlbWVudCwgb3B0aW9ucyApIHtcbiAgXG4gICAgLy8gaW5pdGlhbGl6YXRpb24gZWxlbWVudFxuICAgIGVsZW1lbnQgPSBxdWVyeUVsZW1lbnQoZWxlbWVudCk7XG4gIFxuICAgIC8vIHNldCBvcHRpb25zXG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIFxuICAgIC8vIGV2ZW50IHRhcmdldHMgYW5kIGNvbnN0YW50c1xuICAgIHZhciBhY2NvcmRpb24gPSBudWxsLCBjb2xsYXBzZSA9IG51bGwsIHNlbGYgPSB0aGlzLFxuICAgICAgaXNBbmltYXRpbmcgPSBmYWxzZSwgLy8gd2hlbiB0cnVlIGl0IHdpbGwgcHJldmVudCBjbGljayBoYW5kbGVyc1xuICAgICAgYWNjb3JkaW9uRGF0YSA9IGVsZW1lbnRbZ2V0QXR0cmlidXRlXSgnZGF0YS1wYXJlbnQnKSxcbiAgXG4gICAgICAvLyBjb21wb25lbnQgc3RyaW5nc1xuICAgICAgY29tcG9uZW50ID0gJ2NvbGxhcHNlJyxcbiAgICAgIGNvbGxhcHNlZCA9ICdjb2xsYXBzZWQnLFxuICBcbiAgICAgIC8vIHByaXZhdGUgbWV0aG9kc1xuICAgICAgb3BlbkFjdGlvbiA9IGZ1bmN0aW9uKGNvbGxhcHNlRWxlbWVudCkge1xuICAgICAgICBib290c3RyYXBDdXN0b21FdmVudC5jYWxsKGNvbGxhcHNlRWxlbWVudCwgc2hvd0V2ZW50LCBjb21wb25lbnQpO1xuICAgICAgICBpc0FuaW1hdGluZyA9IHRydWU7XG4gICAgICAgIGFkZENsYXNzKGNvbGxhcHNlRWxlbWVudCxjb2xsYXBzaW5nKTtcbiAgICAgICAgcmVtb3ZlQ2xhc3MoY29sbGFwc2VFbGVtZW50LGNvbXBvbmVudCk7XG4gICAgICAgIGNvbGxhcHNlRWxlbWVudFtzdHlsZV1baGVpZ2h0XSA9IGNvbGxhcHNlRWxlbWVudFtzY3JvbGxIZWlnaHRdICsgJ3B4JztcbiAgICAgICAgXG4gICAgICAgIGVtdWxhdGVUcmFuc2l0aW9uRW5kKGNvbGxhcHNlRWxlbWVudCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgaXNBbmltYXRpbmcgPSBmYWxzZTtcbiAgICAgICAgICBjb2xsYXBzZUVsZW1lbnRbc2V0QXR0cmlidXRlXShhcmlhRXhwYW5kZWQsJ3RydWUnKTtcbiAgICAgICAgICByZW1vdmVDbGFzcyhjb2xsYXBzZUVsZW1lbnQsY29sbGFwc2luZyk7XG4gICAgICAgICAgYWRkQ2xhc3MoY29sbGFwc2VFbGVtZW50LCBjb21wb25lbnQpO1xuICAgICAgICAgIGFkZENsYXNzKGNvbGxhcHNlRWxlbWVudCwgaW5DbGFzcyk7XG4gICAgICAgICAgY29sbGFwc2VFbGVtZW50W3N0eWxlXVtoZWlnaHRdID0gJyc7XG4gICAgICAgICAgYm9vdHN0cmFwQ3VzdG9tRXZlbnQuY2FsbChjb2xsYXBzZUVsZW1lbnQsIHNob3duRXZlbnQsIGNvbXBvbmVudCk7XG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgIGNsb3NlQWN0aW9uID0gZnVuY3Rpb24oY29sbGFwc2VFbGVtZW50KSB7XG4gICAgICAgIGJvb3RzdHJhcEN1c3RvbUV2ZW50LmNhbGwoY29sbGFwc2VFbGVtZW50LCBoaWRlRXZlbnQsIGNvbXBvbmVudCk7XG4gICAgICAgIGlzQW5pbWF0aW5nID0gdHJ1ZTtcbiAgICAgICAgY29sbGFwc2VFbGVtZW50W3N0eWxlXVtoZWlnaHRdID0gY29sbGFwc2VFbGVtZW50W3Njcm9sbEhlaWdodF0gKyAncHgnOyAvLyBzZXQgaGVpZ2h0IGZpcnN0XG4gICAgICAgIHJlbW92ZUNsYXNzKGNvbGxhcHNlRWxlbWVudCxjb21wb25lbnQpO1xuICAgICAgICByZW1vdmVDbGFzcyhjb2xsYXBzZUVsZW1lbnQsIGluQ2xhc3MpO1xuICAgICAgICBhZGRDbGFzcyhjb2xsYXBzZUVsZW1lbnQsIGNvbGxhcHNpbmcpO1xuICAgICAgICBjb2xsYXBzZUVsZW1lbnRbb2Zmc2V0V2lkdGhdOyAvLyBmb3JjZSByZWZsb3cgdG8gZW5hYmxlIHRyYW5zaXRpb25cbiAgICAgICAgY29sbGFwc2VFbGVtZW50W3N0eWxlXVtoZWlnaHRdID0gJzBweCc7XG4gICAgICAgIFxuICAgICAgICBlbXVsYXRlVHJhbnNpdGlvbkVuZChjb2xsYXBzZUVsZW1lbnQsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGlzQW5pbWF0aW5nID0gZmFsc2U7XG4gICAgICAgICAgY29sbGFwc2VFbGVtZW50W3NldEF0dHJpYnV0ZV0oYXJpYUV4cGFuZGVkLCdmYWxzZScpO1xuICAgICAgICAgIHJlbW92ZUNsYXNzKGNvbGxhcHNlRWxlbWVudCxjb2xsYXBzaW5nKTtcbiAgICAgICAgICBhZGRDbGFzcyhjb2xsYXBzZUVsZW1lbnQsY29tcG9uZW50KTtcbiAgICAgICAgICBjb2xsYXBzZUVsZW1lbnRbc3R5bGVdW2hlaWdodF0gPSAnJztcbiAgICAgICAgICBib290c3RyYXBDdXN0b21FdmVudC5jYWxsKGNvbGxhcHNlRWxlbWVudCwgaGlkZGVuRXZlbnQsIGNvbXBvbmVudCk7XG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgIGdldFRhcmdldCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgaHJlZiA9IGVsZW1lbnQuaHJlZiAmJiBlbGVtZW50W2dldEF0dHJpYnV0ZV0oJ2hyZWYnKSxcbiAgICAgICAgICBwYXJlbnQgPSBlbGVtZW50W2dldEF0dHJpYnV0ZV0oZGF0YVRhcmdldCksXG4gICAgICAgICAgaWQgPSBocmVmIHx8ICggcGFyZW50ICYmIHBhcmVudC5jaGFyQXQoMCkgPT09ICcjJyApICYmIHBhcmVudDtcbiAgICAgICAgcmV0dXJuIGlkICYmIHF1ZXJ5RWxlbWVudChpZCk7XG4gICAgICB9O1xuICAgIFxuICAgIC8vIHB1YmxpYyBtZXRob2RzXG4gICAgdGhpcy50b2dnbGUgPSBmdW5jdGlvbihlKSB7XG4gICAgICBlW3ByZXZlbnREZWZhdWx0XSgpO1xuICAgICAgaWYgKCBpc0FuaW1hdGluZyApIHJldHVybjtcbiAgICAgIGlmICghaGFzQ2xhc3MoY29sbGFwc2UsaW5DbGFzcykpIHsgc2VsZi5zaG93KCk7IH0gXG4gICAgICBlbHNlIHsgc2VsZi5oaWRlKCk7IH1cbiAgICB9O1xuICAgIHRoaXMuaGlkZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgY2xvc2VBY3Rpb24oY29sbGFwc2UpO1xuICAgICAgYWRkQ2xhc3MoZWxlbWVudCxjb2xsYXBzZWQpO1xuICAgIH07XG4gICAgdGhpcy5zaG93ID0gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoIGFjY29yZGlvbiApIHtcbiAgICAgICAgdmFyIGFjdGl2ZUNvbGxhcHNlID0gcXVlcnlFbGVtZW50KCcuJytjb21wb25lbnQrJy4nK2luQ2xhc3MsYWNjb3JkaW9uKSxcbiAgICAgICAgICAgIHRvZ2dsZSA9IGFjdGl2ZUNvbGxhcHNlICYmIChxdWVyeUVsZW1lbnQoJ1snK2RhdGFUb2dnbGUrJz1cIicrY29tcG9uZW50KydcIl1bJytkYXRhVGFyZ2V0Kyc9XCIjJythY3RpdmVDb2xsYXBzZS5pZCsnXCJdJyxhY2NvcmRpb24pXG4gICAgICAgICAgICAgICAgICAgfHwgcXVlcnlFbGVtZW50KCdbJytkYXRhVG9nZ2xlKyc9XCInK2NvbXBvbmVudCsnXCJdW2hyZWY9XCIjJythY3RpdmVDb2xsYXBzZS5pZCsnXCJdJyxhY2NvcmRpb24pICksXG4gICAgICAgICAgICBjb3JyZXNwb25kaW5nQ29sbGFwc2UgPSB0b2dnbGUgJiYgKHRvZ2dsZVtnZXRBdHRyaWJ1dGVdKGRhdGFUYXJnZXQpIHx8IHRvZ2dsZS5ocmVmKTtcbiAgICAgICAgaWYgKCBhY3RpdmVDb2xsYXBzZSAmJiB0b2dnbGUgJiYgYWN0aXZlQ29sbGFwc2UgIT09IGNvbGxhcHNlICkgeyBcbiAgICAgICAgICBjbG9zZUFjdGlvbihhY3RpdmVDb2xsYXBzZSk7IFxuICAgICAgICAgIGlmICggY29ycmVzcG9uZGluZ0NvbGxhcHNlLnNwbGl0KCcjJylbMV0gIT09IGNvbGxhcHNlLmlkICkgeyBhZGRDbGFzcyh0b2dnbGUsY29sbGFwc2VkKTsgfSBcbiAgICAgICAgICBlbHNlIHsgcmVtb3ZlQ2xhc3ModG9nZ2xlLGNvbGxhcHNlZCk7IH1cbiAgICAgICAgfVxuICAgICAgfVxuICBcbiAgICAgIG9wZW5BY3Rpb24oY29sbGFwc2UpO1xuICAgICAgcmVtb3ZlQ2xhc3MoZWxlbWVudCxjb2xsYXBzZWQpOyBcbiAgICB9O1xuICBcbiAgICAvLyBpbml0XG4gICAgaWYgKCAhKHN0cmluZ0NvbGxhcHNlIGluIGVsZW1lbnQgKSApIHsgLy8gcHJldmVudCBhZGRpbmcgZXZlbnQgaGFuZGxlcnMgdHdpY2VcbiAgICAgIG9uKGVsZW1lbnQsIGNsaWNrRXZlbnQsIHNlbGYudG9nZ2xlKTtcbiAgICB9XG4gICAgY29sbGFwc2UgPSBnZXRUYXJnZXQoKTtcbiAgICBhY2NvcmRpb24gPSBxdWVyeUVsZW1lbnQob3B0aW9ucy5wYXJlbnQpIHx8IGFjY29yZGlvbkRhdGEgJiYgZ2V0Q2xvc2VzdChlbGVtZW50LCBhY2NvcmRpb25EYXRhKTtcbiAgICBlbGVtZW50W3N0cmluZ0NvbGxhcHNlXSA9IHNlbGY7XG4gIH07XG4gIFxuICAvLyBDT0xMQVBTRSBEQVRBIEFQSVxuICAvLyA9PT09PT09PT09PT09PT09PVxuICBzdXBwb3J0c1twdXNoXSggWyBzdHJpbmdDb2xsYXBzZSwgQ29sbGFwc2UsICdbJytkYXRhVG9nZ2xlKyc9XCJjb2xsYXBzZVwiXScgXSApO1xuICBcbiAgXG4gIC8qIE5hdGl2ZSBKYXZhc2NyaXB0IGZvciBCb290c3RyYXAgMyB8IERyb3Bkb3duXG4gIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuICBcbiAgLy8gRFJPUERPV04gREVGSU5JVElPTlxuICAvLyA9PT09PT09PT09PT09PT09PT09XG4gIHZhciBEcm9wZG93biA9IGZ1bmN0aW9uKCBlbGVtZW50LCBvcHRpb24gKSB7XG4gICAgICBcbiAgICAvLyBpbml0aWFsaXphdGlvbiBlbGVtZW50XG4gICAgZWxlbWVudCA9IHF1ZXJ5RWxlbWVudChlbGVtZW50KTtcbiAgXG4gICAgLy8gc2V0IG9wdGlvblxuICAgIHRoaXMucGVyc2lzdCA9IG9wdGlvbiA9PT0gdHJ1ZSB8fCBlbGVtZW50W2dldEF0dHJpYnV0ZV0oJ2RhdGEtcGVyc2lzdCcpID09PSAndHJ1ZScgfHwgZmFsc2U7XG4gIFxuICAgIC8vIGNvbnN0YW50cywgZXZlbnQgdGFyZ2V0cywgc3RyaW5nc1xuICAgIHZhciBzZWxmID0gdGhpcywgY2hpbGRyZW4gPSAnY2hpbGRyZW4nLFxuICAgICAgcGFyZW50ID0gZWxlbWVudFtwYXJlbnROb2RlXSxcbiAgICAgIGNvbXBvbmVudCA9ICdkcm9wZG93bicsIG9wZW4gPSAnb3BlbicsXG4gICAgICByZWxhdGVkVGFyZ2V0ID0gbnVsbCxcbiAgICAgIG1lbnUgPSBxdWVyeUVsZW1lbnQoJy5kcm9wZG93bi1tZW51JywgcGFyZW50KSxcbiAgICAgIG1lbnVJdGVtcyA9IChmdW5jdGlvbigpe1xuICAgICAgICB2YXIgc2V0ID0gbWVudVtjaGlsZHJlbl0sIG5ld1NldCA9IFtdO1xuICAgICAgICBmb3IgKCB2YXIgaT0wOyBpPHNldFtsZW5ndGhdOyBpKysgKXtcbiAgICAgICAgICBzZXRbaV1bY2hpbGRyZW5dW2xlbmd0aF0gJiYgKHNldFtpXVtjaGlsZHJlbl1bMF0udGFnTmFtZSA9PT0gJ0EnICYmIG5ld1NldFtwdXNoXShzZXRbaV0pKTsgICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ld1NldDtcbiAgICAgIH0pKCksXG4gIFxuICAgICAgLy8gcHJldmVudERlZmF1bHQgb24gZW1wdHkgYW5jaG9yIGxpbmtzXG4gICAgICBwcmV2ZW50RW1wdHlBbmNob3IgPSBmdW5jdGlvbihhbmNob3Ipe1xuICAgICAgICAoYW5jaG9yLmhyZWYgJiYgYW5jaG9yLmhyZWYuc2xpY2UoLTEpID09PSAnIycgfHwgYW5jaG9yW3BhcmVudE5vZGVdICYmIGFuY2hvcltwYXJlbnROb2RlXS5ocmVmIFxuICAgICAgICAgICYmIGFuY2hvcltwYXJlbnROb2RlXS5ocmVmLnNsaWNlKC0xKSA9PT0gJyMnKSAmJiB0aGlzW3ByZXZlbnREZWZhdWx0XSgpOyAgICAgIFxuICAgICAgfSxcbiAgXG4gICAgICAvLyB0b2dnbGUgZGlzbWlzc2libGUgZXZlbnRzXG4gICAgICB0b2dnbGVEaXNtaXNzID0gZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIHR5cGUgPSBlbGVtZW50W29wZW5dID8gb24gOiBvZmY7XG4gICAgICAgIHR5cGUoRE9DLCBjbGlja0V2ZW50LCBkaXNtaXNzSGFuZGxlcik7IFxuICAgICAgICB0eXBlKERPQywga2V5ZG93bkV2ZW50LCBwcmV2ZW50U2Nyb2xsKTtcbiAgICAgICAgdHlwZShET0MsIGtleXVwRXZlbnQsIGtleUhhbmRsZXIpO1xuICAgICAgfSxcbiAgXG4gICAgICAvLyBoYW5kbGVyc1xuICAgICAgZGlzbWlzc0hhbmRsZXIgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgIHZhciBldmVudFRhcmdldCA9IGVbdGFyZ2V0XSwgaGFzRGF0YSA9IGV2ZW50VGFyZ2V0ICYmIChzdHJpbmdEcm9wZG93biBpbiBldmVudFRhcmdldCB8fCBzdHJpbmdEcm9wZG93biBpbiBldmVudFRhcmdldFtwYXJlbnROb2RlXSk7XG4gICAgICAgIGlmICggKGV2ZW50VGFyZ2V0ID09PSBtZW51IHx8IG1lbnVbY29udGFpbnNdKGV2ZW50VGFyZ2V0KSkgJiYgKHNlbGYucGVyc2lzdCB8fCBoYXNEYXRhKSApIHsgcmV0dXJuOyB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIHJlbGF0ZWRUYXJnZXQgPSBldmVudFRhcmdldCA9PT0gZWxlbWVudCB8fCBlbGVtZW50W2NvbnRhaW5zXShldmVudFRhcmdldCkgPyBlbGVtZW50IDogbnVsbDtcbiAgICAgICAgICBoaWRlKCk7XG4gICAgICAgIH1cbiAgICAgICAgcHJldmVudEVtcHR5QW5jaG9yLmNhbGwoZSxldmVudFRhcmdldCk7XG4gICAgICB9LFxuICAgICAgY2xpY2tIYW5kbGVyID0gZnVuY3Rpb24oZSkge1xuICAgICAgICByZWxhdGVkVGFyZ2V0ID0gZWxlbWVudDtcbiAgICAgICAgc2hvdygpO1xuICAgICAgICBwcmV2ZW50RW1wdHlBbmNob3IuY2FsbChlLGVbdGFyZ2V0XSk7XG4gICAgICB9LFxuICAgICAgcHJldmVudFNjcm9sbCA9IGZ1bmN0aW9uKGUpe1xuICAgICAgICB2YXIga2V5ID0gZS53aGljaCB8fCBlLmtleUNvZGU7XG4gICAgICAgIGlmKCBrZXkgPT09IDM4IHx8IGtleSA9PT0gNDAgKSB7IGVbcHJldmVudERlZmF1bHRdKCk7IH1cbiAgICAgIH0sXG4gICAgICBrZXlIYW5kbGVyID0gZnVuY3Rpb24oZSl7XG4gICAgICAgIHZhciBrZXkgPSBlLndoaWNoIHx8IGUua2V5Q29kZSwgXG4gICAgICAgICAgICBhY3RpdmVJdGVtID0gRE9DLmFjdGl2ZUVsZW1lbnQsXG4gICAgICAgICAgICBpZHggPSBtZW51SXRlbXNbaW5kZXhPZl0oYWN0aXZlSXRlbVtwYXJlbnROb2RlXSksXG4gICAgICAgICAgICBpc1NhbWVFbGVtZW50ID0gYWN0aXZlSXRlbSA9PT0gZWxlbWVudCxcbiAgICAgICAgICAgIGlzSW5zaWRlTWVudSA9IG1lbnVbY29udGFpbnNdKGFjdGl2ZUl0ZW0pLFxuICAgICAgICAgICAgaXNNZW51SXRlbSA9IGFjdGl2ZUl0ZW1bcGFyZW50Tm9kZV1bcGFyZW50Tm9kZV0gPT09IG1lbnU7XG4gICAgICAgIFxuICAgICAgICBpZiAoIGlzTWVudUl0ZW0gfHwgaXNTYW1lRWxlbWVudCApIHsgLy8gbmF2aWdhdGUgdXAgfCBkb3duXG4gICAgICAgICAgaWR4ID0gaXNTYW1lRWxlbWVudCA/IDAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IGtleSA9PT0gMzggPyAoaWR4PjE/aWR4LTE6MCkgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IGtleSA9PT0gNDAgPyAoaWR4PG1lbnVJdGVtc1tsZW5ndGhdLTE/aWR4KzE6aWR4KSA6IGlkeDtcbiAgICAgICAgICBtZW51SXRlbXNbaWR4XSAmJiBzZXRGb2N1cyhtZW51SXRlbXNbaWR4XVtjaGlsZHJlbl1bMF0pO1xuICAgICAgICB9XG4gICAgICAgIGlmICggKG1lbnVJdGVtc1tsZW5ndGhdICYmIGlzTWVudUl0ZW0gLy8gbWVudSBoYXMgaXRlbXNcbiAgICAgICAgICB8fCAhbWVudUl0ZW1zW2xlbmd0aF0gJiYgKGlzSW5zaWRlTWVudSB8fCBpc1NhbWVFbGVtZW50KSAgLy8gbWVudSBtaWdodCBiZSBhIGZvcm1cbiAgICAgICAgICB8fCAhaXNJbnNpZGVNZW51ICkgLy8gb3IgdGhlIGZvY3VzZWQgZWxlbWVudCBpcyBub3QgaW4gdGhlIG1lbnUgYXQgYWxsXG4gICAgICAgICAgJiYgZWxlbWVudFtvcGVuXSAmJiBrZXkgPT09IDI3IC8vIG1lbnUgbXVzdCBiZSBvcGVuXG4gICAgICAgICkge1xuICAgICAgICAgIHNlbGYudG9nZ2xlKCk7XG4gICAgICAgICAgcmVsYXRlZFRhcmdldCA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH0sICBcbiAgXG4gICAgICAvLyBwcml2YXRlIG1ldGhvZHNcbiAgICAgIHNob3cgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgYm9vdHN0cmFwQ3VzdG9tRXZlbnQuY2FsbChwYXJlbnQsIHNob3dFdmVudCwgY29tcG9uZW50LCByZWxhdGVkVGFyZ2V0KTtcbiAgICAgICAgYWRkQ2xhc3MocGFyZW50LG9wZW4pO1xuICAgICAgICBtZW51W3NldEF0dHJpYnV0ZV0oYXJpYUV4cGFuZGVkLHRydWUpO1xuICAgICAgICBib290c3RyYXBDdXN0b21FdmVudC5jYWxsKHBhcmVudCwgc2hvd25FdmVudCwgY29tcG9uZW50LCByZWxhdGVkVGFyZ2V0KTtcbiAgICAgICAgZWxlbWVudFtvcGVuXSA9IHRydWU7XG4gICAgICAgIG9mZihlbGVtZW50LCBjbGlja0V2ZW50LCBjbGlja0hhbmRsZXIpO1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7IFxuICAgICAgICAgIHNldEZvY3VzKCBtZW51W2dldEVsZW1lbnRzQnlUYWdOYW1lXSgnSU5QVVQnKVswXSB8fCBlbGVtZW50ICk7IC8vIGZvY3VzIHRoZSBmaXJzdCBpbnB1dCBpdGVtIHwgZWxlbWVudFxuICAgICAgICAgIHRvZ2dsZURpc21pc3MoKTsgXG4gICAgICAgIH0sMSk7XG4gICAgICB9LFxuICAgICAgaGlkZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBib290c3RyYXBDdXN0b21FdmVudC5jYWxsKHBhcmVudCwgaGlkZUV2ZW50LCBjb21wb25lbnQsIHJlbGF0ZWRUYXJnZXQpO1xuICAgICAgICByZW1vdmVDbGFzcyhwYXJlbnQsb3Blbik7XG4gICAgICAgIG1lbnVbc2V0QXR0cmlidXRlXShhcmlhRXhwYW5kZWQsZmFsc2UpO1xuICAgICAgICBib290c3RyYXBDdXN0b21FdmVudC5jYWxsKHBhcmVudCwgaGlkZGVuRXZlbnQsIGNvbXBvbmVudCwgcmVsYXRlZFRhcmdldCk7XG4gICAgICAgIGVsZW1lbnRbb3Blbl0gPSBmYWxzZTtcbiAgICAgICAgdG9nZ2xlRGlzbWlzcygpO1xuICAgICAgICBzZXRGb2N1cyhlbGVtZW50KTtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpeyBvbihlbGVtZW50LCBjbGlja0V2ZW50LCBjbGlja0hhbmRsZXIpOyB9LDEpO1xuICAgICAgfTtcbiAgXG4gICAgLy8gc2V0IGluaXRpYWwgc3RhdGUgdG8gY2xvc2VkXG4gICAgZWxlbWVudFtvcGVuXSA9IGZhbHNlO1xuICBcbiAgICAvLyBwdWJsaWMgbWV0aG9kc1xuICAgIHRoaXMudG9nZ2xlID0gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoaGFzQ2xhc3MocGFyZW50LG9wZW4pICYmIGVsZW1lbnRbb3Blbl0pIHsgaGlkZSgpOyB9IFxuICAgICAgZWxzZSB7IHNob3coKTsgfVxuICAgIH07XG4gIFxuICAgIC8vIGluaXRcbiAgICBpZiAoIShzdHJpbmdEcm9wZG93biBpbiBlbGVtZW50KSkgeyAvLyBwcmV2ZW50IGFkZGluZyBldmVudCBoYW5kbGVycyB0d2ljZVxuICAgICAgIXRhYmluZGV4IGluIG1lbnUgJiYgbWVudVtzZXRBdHRyaWJ1dGVdKHRhYmluZGV4LCAnMCcpOyAvLyBGaXggb25ibHVyIG9uIENocm9tZSB8IFNhZmFyaVxuICAgICAgb24oZWxlbWVudCwgY2xpY2tFdmVudCwgY2xpY2tIYW5kbGVyKTtcbiAgICB9XG4gIFxuICAgIGVsZW1lbnRbc3RyaW5nRHJvcGRvd25dID0gc2VsZjtcbiAgfTtcbiAgXG4gIC8vIERST1BET1dOIERBVEEgQVBJXG4gIC8vID09PT09PT09PT09PT09PT09XG4gIHN1cHBvcnRzW3B1c2hdKCBbc3RyaW5nRHJvcGRvd24sIERyb3Bkb3duLCAnWycrZGF0YVRvZ2dsZSsnPVwiZHJvcGRvd25cIl0nXSApO1xuICBcbiAgXG4gIC8qIE5hdGl2ZSBKYXZhc2NyaXB0IGZvciBCb290c3RyYXAgMyB8IE1vZGFsXG4gIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuICBcbiAgLy8gTU9EQUwgREVGSU5JVElPTlxuICAvLyA9PT09PT09PT09PT09PT1cbiAgdmFyIE1vZGFsID0gZnVuY3Rpb24oZWxlbWVudCwgb3B0aW9ucykgeyAvLyBlbGVtZW50IGNhbiBiZSB0aGUgbW9kYWwvdHJpZ2dlcmluZyBidXR0b25cbiAgXG4gICAgLy8gdGhlIG1vZGFsIChib3RoIEphdmFTY3JpcHQgLyBEQVRBIEFQSSBpbml0KSAvIHRyaWdnZXJpbmcgYnV0dG9uIGVsZW1lbnQgKERBVEEgQVBJKVxuICAgIGVsZW1lbnQgPSBxdWVyeUVsZW1lbnQoZWxlbWVudCk7XG4gIFxuICAgIC8vIGRldGVybWluZSBtb2RhbCwgdHJpZ2dlcmluZyBlbGVtZW50XG4gICAgdmFyIGJ0bkNoZWNrID0gZWxlbWVudFtnZXRBdHRyaWJ1dGVdKGRhdGFUYXJnZXQpfHxlbGVtZW50W2dldEF0dHJpYnV0ZV0oJ2hyZWYnKSxcbiAgICAgIGNoZWNrTW9kYWwgPSBxdWVyeUVsZW1lbnQoIGJ0bkNoZWNrICksXG4gICAgICBtb2RhbCA9IGhhc0NsYXNzKGVsZW1lbnQsJ21vZGFsJykgPyBlbGVtZW50IDogY2hlY2tNb2RhbCxcbiAgXG4gICAgICAvLyBzdHJpbmdzXG4gICAgICBjb21wb25lbnQgPSAnbW9kYWwnLFxuICAgICAgc3RhdGljU3RyaW5nID0gJ3N0YXRpYycsXG4gICAgICBwYWRkaW5nTGVmdCA9ICdwYWRkaW5nTGVmdCcsXG4gICAgICBwYWRkaW5nUmlnaHQgPSAncGFkZGluZ1JpZ2h0JyxcbiAgICAgIG1vZGFsQmFja2Ryb3BTdHJpbmcgPSAnbW9kYWwtYmFja2Ryb3AnO1xuICBcbiAgICBpZiAoIGhhc0NsYXNzKGVsZW1lbnQsJ21vZGFsJykgKSB7IGVsZW1lbnQgPSBudWxsOyB9IC8vIG1vZGFsIGlzIG5vdyBpbmRlcGVuZGVudCBvZiBpdCdzIHRyaWdnZXJpbmcgZWxlbWVudFxuICBcbiAgICBpZiAoICFtb2RhbCApIHsgcmV0dXJuOyB9IC8vIGludmFsaWRhdGVcbiAgXG4gICAgLy8gc2V0IG9wdGlvbnNcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgXG4gICAgdGhpc1trZXlib2FyZF0gPSBvcHRpb25zW2tleWJvYXJkXSA9PT0gZmFsc2UgfHwgbW9kYWxbZ2V0QXR0cmlidXRlXShkYXRhS2V5Ym9hcmQpID09PSAnZmFsc2UnID8gZmFsc2UgOiB0cnVlO1xuICAgIHRoaXNbYmFja2Ryb3BdID0gb3B0aW9uc1tiYWNrZHJvcF0gPT09IHN0YXRpY1N0cmluZyB8fCBtb2RhbFtnZXRBdHRyaWJ1dGVdKGRhdGFiYWNrZHJvcCkgPT09IHN0YXRpY1N0cmluZyA/IHN0YXRpY1N0cmluZyA6IHRydWU7XG4gICAgdGhpc1tiYWNrZHJvcF0gPSBvcHRpb25zW2JhY2tkcm9wXSA9PT0gZmFsc2UgfHwgbW9kYWxbZ2V0QXR0cmlidXRlXShkYXRhYmFja2Ryb3ApID09PSAnZmFsc2UnID8gZmFsc2UgOiB0aGlzW2JhY2tkcm9wXTtcbiAgICB0aGlzW2NvbnRlbnRdICA9IG9wdGlvbnNbY29udGVudF07IC8vIEphdmFTY3JpcHQgb25seVxuICBcbiAgICAvLyBiaW5kLCBjb25zdGFudHMsIGV2ZW50IHRhcmdldHMgYW5kIG90aGVyIHZhcnNcbiAgICB2YXIgc2VsZiA9IHRoaXMsIHJlbGF0ZWRUYXJnZXQgPSBudWxsLFxuICAgICAgYm9keUlzT3ZlcmZsb3dpbmcsIG1vZGFsSXNPdmVyZmxvd2luZywgc2Nyb2xsYmFyV2lkdGgsIG92ZXJsYXksXG4gIFxuICAgICAgLy8gYWxzbyBmaW5kIGZpeGVkLXRvcCAvIGZpeGVkLWJvdHRvbSBpdGVtc1xuICAgICAgZml4ZWRJdGVtcyA9IGdldEVsZW1lbnRzQnlDbGFzc05hbWUoSFRNTCxmaXhlZFRvcCkuY29uY2F0KGdldEVsZW1lbnRzQnlDbGFzc05hbWUoSFRNTCxmaXhlZEJvdHRvbSkpLFxuICBcbiAgICAgIC8vIHByaXZhdGUgbWV0aG9kc1xuICAgICAgZ2V0V2luZG93V2lkdGggPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGh0bWxSZWN0ID0gSFRNTFtnZXRCb3VuZGluZ0NsaWVudFJlY3RdKCk7XG4gICAgICAgIHJldHVybiBnbG9iYWxPYmplY3RbaW5uZXJXaWR0aF0gfHwgKGh0bWxSZWN0W3JpZ2h0XSAtIE1hdGguYWJzKGh0bWxSZWN0W2xlZnRdKSk7XG4gICAgICB9LFxuICAgICAgc2V0U2Nyb2xsYmFyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgYm9keVN0eWxlID0gRE9DW2JvZHldLmN1cnJlbnRTdHlsZSB8fCBnbG9iYWxPYmplY3QuZ2V0Q29tcHV0ZWRTdHlsZShET0NbYm9keV0pLFxuICAgICAgICAgICAgYm9keVBhZCA9IHBhcnNlSW50KChib2R5U3R5bGVbcGFkZGluZ1JpZ2h0XSksIDEwKSwgaXRlbVBhZDtcbiAgICAgICAgaWYgKGJvZHlJc092ZXJmbG93aW5nKSB7XG4gICAgICAgICAgRE9DW2JvZHldW3N0eWxlXVtwYWRkaW5nUmlnaHRdID0gKGJvZHlQYWQgKyBzY3JvbGxiYXJXaWR0aCkgKyAncHgnO1xuICAgICAgICAgIGlmIChmaXhlZEl0ZW1zW2xlbmd0aF0pe1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBmaXhlZEl0ZW1zW2xlbmd0aF07IGkrKykge1xuICAgICAgICAgICAgICBpdGVtUGFkID0gKGZpeGVkSXRlbXNbaV0uY3VycmVudFN0eWxlIHx8IGdsb2JhbE9iamVjdC5nZXRDb21wdXRlZFN0eWxlKGZpeGVkSXRlbXNbaV0pKVtwYWRkaW5nUmlnaHRdO1xuICAgICAgICAgICAgICBmaXhlZEl0ZW1zW2ldW3N0eWxlXVtwYWRkaW5nUmlnaHRdID0gKCBwYXJzZUludChpdGVtUGFkKSArIHNjcm9sbGJhcldpZHRoKSArICdweCc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgcmVzZXRTY3JvbGxiYXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIERPQ1tib2R5XVtzdHlsZV1bcGFkZGluZ1JpZ2h0XSA9ICcnO1xuICAgICAgICBpZiAoZml4ZWRJdGVtc1tsZW5ndGhdKXtcbiAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGZpeGVkSXRlbXNbbGVuZ3RoXTsgaSsrKSB7XG4gICAgICAgICAgICBmaXhlZEl0ZW1zW2ldW3N0eWxlXVtwYWRkaW5nUmlnaHRdID0gJyc7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgbWVhc3VyZVNjcm9sbGJhciA9IGZ1bmN0aW9uICgpIHsgLy8gdGh4IHdhbHNoXG4gICAgICAgIHZhciBzY3JvbGxEaXYgPSBET0NbY3JlYXRlRWxlbWVudF0oJ2RpdicpLCBzY3JvbGxCYXJXaWR0aDtcbiAgICAgICAgc2Nyb2xsRGl2LmNsYXNzTmFtZSA9IGNvbXBvbmVudCsnLXNjcm9sbGJhci1tZWFzdXJlJzsgLy8gdGhpcyBpcyBoZXJlIHRvIHN0YXlcbiAgICAgICAgRE9DW2JvZHldW2FwcGVuZENoaWxkXShzY3JvbGxEaXYpO1xuICAgICAgICBzY3JvbGxCYXJXaWR0aCA9IHNjcm9sbERpdltvZmZzZXRXaWR0aF0gLSBzY3JvbGxEaXZbY2xpZW50V2lkdGhdO1xuICAgICAgICBET0NbYm9keV0ucmVtb3ZlQ2hpbGQoc2Nyb2xsRGl2KTtcbiAgICAgIHJldHVybiBzY3JvbGxCYXJXaWR0aDtcbiAgICAgIH0sXG4gICAgICBjaGVja1Njcm9sbGJhciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgYm9keUlzT3ZlcmZsb3dpbmcgPSBET0NbYm9keV1bY2xpZW50V2lkdGhdIDwgZ2V0V2luZG93V2lkdGgoKTtcbiAgICAgICAgbW9kYWxJc092ZXJmbG93aW5nID0gbW9kYWxbc2Nyb2xsSGVpZ2h0XSA+IEhUTUxbY2xpZW50SGVpZ2h0XTtcbiAgICAgICAgc2Nyb2xsYmFyV2lkdGggPSBtZWFzdXJlU2Nyb2xsYmFyKCk7XG4gICAgICB9LFxuICAgICAgYWRqdXN0RGlhbG9nID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBtb2RhbFtzdHlsZV1bcGFkZGluZ0xlZnRdID0gIWJvZHlJc092ZXJmbG93aW5nICYmIG1vZGFsSXNPdmVyZmxvd2luZyA/IHNjcm9sbGJhcldpZHRoICsgJ3B4JyA6ICcnO1xuICAgICAgICBtb2RhbFtzdHlsZV1bcGFkZGluZ1JpZ2h0XSA9IGJvZHlJc092ZXJmbG93aW5nICYmICFtb2RhbElzT3ZlcmZsb3dpbmcgPyBzY3JvbGxiYXJXaWR0aCArICdweCcgOiAnJztcbiAgICAgIH0sXG4gICAgICByZXNldEFkanVzdG1lbnRzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBtb2RhbFtzdHlsZV1bcGFkZGluZ0xlZnRdID0gJyc7XG4gICAgICAgIG1vZGFsW3N0eWxlXVtwYWRkaW5nUmlnaHRdID0gJyc7XG4gICAgICB9LFxuICAgICAgY3JlYXRlT3ZlcmxheSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBtb2RhbE92ZXJsYXkgPSAxO1xuICAgICAgICBcbiAgICAgICAgdmFyIG5ld092ZXJsYXkgPSBET0NbY3JlYXRlRWxlbWVudF0oJ2RpdicpO1xuICAgICAgICBvdmVybGF5ID0gcXVlcnlFbGVtZW50KCcuJyttb2RhbEJhY2tkcm9wU3RyaW5nKTtcbiAgXG4gICAgICAgIGlmICggb3ZlcmxheSA9PT0gbnVsbCApIHtcbiAgICAgICAgICBuZXdPdmVybGF5W3NldEF0dHJpYnV0ZV0oJ2NsYXNzJyxtb2RhbEJhY2tkcm9wU3RyaW5nKycgZmFkZScpO1xuICAgICAgICAgIG92ZXJsYXkgPSBuZXdPdmVybGF5O1xuICAgICAgICAgIERPQ1tib2R5XVthcHBlbmRDaGlsZF0ob3ZlcmxheSk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICByZW1vdmVPdmVybGF5ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIG92ZXJsYXkgPSBxdWVyeUVsZW1lbnQoJy4nK21vZGFsQmFja2Ryb3BTdHJpbmcpO1xuICAgICAgICBpZiAoIG92ZXJsYXkgJiYgb3ZlcmxheSAhPT0gbnVsbCAmJiB0eXBlb2Ygb3ZlcmxheSA9PT0gJ29iamVjdCcgKSB7XG4gICAgICAgICAgbW9kYWxPdmVybGF5ID0gMDtcbiAgICAgICAgICBET0NbYm9keV0ucmVtb3ZlQ2hpbGQob3ZlcmxheSk7IG92ZXJsYXkgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGJvb3RzdHJhcEN1c3RvbUV2ZW50LmNhbGwobW9kYWwsIGhpZGRlbkV2ZW50LCBjb21wb25lbnQpOyAgICAgIFxuICAgICAgfSxcbiAgICAgIGtleWRvd25IYW5kbGVyVG9nZ2xlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChoYXNDbGFzcyhtb2RhbCxpbkNsYXNzKSkge1xuICAgICAgICAgIG9uKERPQywga2V5ZG93bkV2ZW50LCBrZXlIYW5kbGVyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBvZmYoRE9DLCBrZXlkb3duRXZlbnQsIGtleUhhbmRsZXIpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgcmVzaXplSGFuZGxlclRvZ2dsZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoaGFzQ2xhc3MobW9kYWwsaW5DbGFzcykpIHtcbiAgICAgICAgICBvbihnbG9iYWxPYmplY3QsIHJlc2l6ZUV2ZW50LCBzZWxmLnVwZGF0ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgb2ZmKGdsb2JhbE9iamVjdCwgcmVzaXplRXZlbnQsIHNlbGYudXBkYXRlKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGRpc21pc3NIYW5kbGVyVG9nZ2xlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChoYXNDbGFzcyhtb2RhbCxpbkNsYXNzKSkge1xuICAgICAgICAgIG9uKG1vZGFsLCBjbGlja0V2ZW50LCBkaXNtaXNzSGFuZGxlcik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgb2ZmKG1vZGFsLCBjbGlja0V2ZW50LCBkaXNtaXNzSGFuZGxlcik7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICAvLyB0cmlnZ2Vyc1xuICAgICAgdHJpZ2dlclNob3cgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgc2V0Rm9jdXMobW9kYWwpO1xuICAgICAgICBib290c3RyYXBDdXN0b21FdmVudC5jYWxsKG1vZGFsLCBzaG93bkV2ZW50LCBjb21wb25lbnQsIHJlbGF0ZWRUYXJnZXQpO1xuICAgICAgfSxcbiAgICAgIHRyaWdnZXJIaWRlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIG1vZGFsW3N0eWxlXS5kaXNwbGF5ID0gJyc7XG4gICAgICAgIGVsZW1lbnQgJiYgKHNldEZvY3VzKGVsZW1lbnQpKTtcbiAgICAgICAgXG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICBpZiAoIWdldEVsZW1lbnRzQnlDbGFzc05hbWUoRE9DLGNvbXBvbmVudCsnICcraW5DbGFzcylbMF0pIHtcbiAgICAgICAgICAgIHJlc2V0QWRqdXN0bWVudHMoKTtcbiAgICAgICAgICAgIHJlc2V0U2Nyb2xsYmFyKCk7XG4gICAgICAgICAgICByZW1vdmVDbGFzcyhET0NbYm9keV0sY29tcG9uZW50Kyctb3BlbicpO1xuICAgICAgICAgICAgb3ZlcmxheSAmJiBoYXNDbGFzcyhvdmVybGF5LCdmYWRlJykgPyAocmVtb3ZlQ2xhc3Mob3ZlcmxheSxpbkNsYXNzKSwgZW11bGF0ZVRyYW5zaXRpb25FbmQob3ZlcmxheSxyZW1vdmVPdmVybGF5KSkgXG4gICAgICAgICAgICA6IHJlbW92ZU92ZXJsYXkoKTtcbiAgXG4gICAgICAgICAgICByZXNpemVIYW5kbGVyVG9nZ2xlKCk7XG4gICAgICAgICAgICBkaXNtaXNzSGFuZGxlclRvZ2dsZSgpO1xuICAgICAgICAgICAga2V5ZG93bkhhbmRsZXJUb2dnbGUoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sIDUwKTtcbiAgICAgIH0sXG4gICAgICAvLyBoYW5kbGVyc1xuICAgICAgY2xpY2tIYW5kbGVyID0gZnVuY3Rpb24oZSkge1xuICAgICAgICB2YXIgY2xpY2tUYXJnZXQgPSBlW3RhcmdldF07XG4gICAgICAgIGNsaWNrVGFyZ2V0ID0gY2xpY2tUYXJnZXRbaGFzQXR0cmlidXRlXShkYXRhVGFyZ2V0KSB8fCBjbGlja1RhcmdldFtoYXNBdHRyaWJ1dGVdKCdocmVmJykgPyBjbGlja1RhcmdldCA6IGNsaWNrVGFyZ2V0W3BhcmVudE5vZGVdO1xuICAgICAgICBpZiAoIGNsaWNrVGFyZ2V0ID09PSBlbGVtZW50ICYmICFoYXNDbGFzcyhtb2RhbCxpbkNsYXNzKSApIHtcbiAgICAgICAgICBtb2RhbC5tb2RhbFRyaWdnZXIgPSBlbGVtZW50O1xuICAgICAgICAgIHJlbGF0ZWRUYXJnZXQgPSBlbGVtZW50O1xuICAgICAgICAgIHNlbGYuc2hvdygpO1xuICAgICAgICAgIGVbcHJldmVudERlZmF1bHRdKCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBrZXlIYW5kbGVyID0gZnVuY3Rpb24oZSkge1xuICAgICAgICB2YXIga2V5ID0gZS53aGljaCB8fCBlLmtleUNvZGU7IC8vIGtleUNvZGUgZm9yIElFOFxuICAgICAgICBpZiAoc2VsZltrZXlib2FyZF0gJiYga2V5ID09IDI3ICYmIGhhc0NsYXNzKG1vZGFsLGluQ2xhc3MpKSB7XG4gICAgICAgICAgc2VsZi5oaWRlKCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBkaXNtaXNzSGFuZGxlciA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdmFyIGNsaWNrVGFyZ2V0ID0gZVt0YXJnZXRdO1xuICAgICAgICBpZiAoIGhhc0NsYXNzKG1vZGFsLGluQ2xhc3MpICYmIChjbGlja1RhcmdldFtwYXJlbnROb2RlXVtnZXRBdHRyaWJ1dGVdKGRhdGFEaXNtaXNzKSA9PT0gY29tcG9uZW50XG4gICAgICAgICAgICB8fCBjbGlja1RhcmdldFtnZXRBdHRyaWJ1dGVdKGRhdGFEaXNtaXNzKSA9PT0gY29tcG9uZW50XG4gICAgICAgICAgICB8fCAoY2xpY2tUYXJnZXQgPT09IG1vZGFsICYmIHNlbGZbYmFja2Ryb3BdICE9PSBzdGF0aWNTdHJpbmcpICkgKSB7XG4gICAgICAgICAgc2VsZi5oaWRlKCk7IHJlbGF0ZWRUYXJnZXQgPSBudWxsO1xuICAgICAgICAgIGVbcHJldmVudERlZmF1bHRdKCk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gIFxuICAgIC8vIHB1YmxpYyBtZXRob2RzXG4gICAgdGhpcy50b2dnbGUgPSBmdW5jdGlvbigpIHtcbiAgICAgIGlmICggaGFzQ2xhc3MobW9kYWwsaW5DbGFzcykgKSB7dGhpcy5oaWRlKCk7fSBlbHNlIHt0aGlzLnNob3coKTt9XG4gICAgfTtcbiAgICB0aGlzLnNob3cgPSBmdW5jdGlvbigpIHtcbiAgICAgIGJvb3RzdHJhcEN1c3RvbUV2ZW50LmNhbGwobW9kYWwsIHNob3dFdmVudCwgY29tcG9uZW50LCByZWxhdGVkVGFyZ2V0KTtcbiAgXG4gICAgICAvLyB3ZSBlbGVnYW50bHkgaGlkZSBhbnkgb3BlbmVkIG1vZGFsXG4gICAgICB2YXIgY3VycmVudE9wZW4gPSBnZXRFbGVtZW50c0J5Q2xhc3NOYW1lKERPQyxjb21wb25lbnQrJyBpbicpWzBdO1xuICAgICAgY3VycmVudE9wZW4gJiYgY3VycmVudE9wZW4gIT09IG1vZGFsICYmIGN1cnJlbnRPcGVuLm1vZGFsVHJpZ2dlcltzdHJpbmdNb2RhbF0uaGlkZSgpO1xuICBcbiAgICAgIGlmICggdGhpc1tiYWNrZHJvcF0gKSB7XG4gICAgICAgICFtb2RhbE92ZXJsYXkgJiYgY3JlYXRlT3ZlcmxheSgpO1xuICAgICAgfVxuICBcbiAgICAgIGlmICggb3ZlcmxheSAmJiBtb2RhbE92ZXJsYXkgJiYgIWhhc0NsYXNzKG92ZXJsYXksaW5DbGFzcykpIHtcbiAgICAgICAgb3ZlcmxheVtvZmZzZXRXaWR0aF07IC8vIGZvcmNlIHJlZmxvdyB0byBlbmFibGUgdHJhc2l0aW9uXG4gICAgICAgIGFkZENsYXNzKG92ZXJsYXksaW5DbGFzcyk7XG4gICAgICB9XG4gIFxuICAgICAgc2V0VGltZW91dCggZnVuY3Rpb24oKSB7XG4gICAgICAgIG1vZGFsW3N0eWxlXS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgXG4gICAgICAgIGNoZWNrU2Nyb2xsYmFyKCk7XG4gICAgICAgIHNldFNjcm9sbGJhcigpO1xuICAgICAgICBhZGp1c3REaWFsb2coKTtcbiAgXG4gICAgICAgIGFkZENsYXNzKERPQ1tib2R5XSxjb21wb25lbnQrJy1vcGVuJyk7XG4gICAgICAgIGFkZENsYXNzKG1vZGFsLGluQ2xhc3MpO1xuICAgICAgICBtb2RhbFtzZXRBdHRyaWJ1dGVdKGFyaWFIaWRkZW4sIGZhbHNlKTtcbiAgICAgICAgXG4gICAgICAgIHJlc2l6ZUhhbmRsZXJUb2dnbGUoKTtcbiAgICAgICAgZGlzbWlzc0hhbmRsZXJUb2dnbGUoKTtcbiAgICAgICAga2V5ZG93bkhhbmRsZXJUb2dnbGUoKTtcbiAgXG4gICAgICAgIGhhc0NsYXNzKG1vZGFsLCdmYWRlJykgPyBlbXVsYXRlVHJhbnNpdGlvbkVuZChtb2RhbCwgdHJpZ2dlclNob3cpIDogdHJpZ2dlclNob3coKTtcbiAgICAgIH0sIHN1cHBvcnRUcmFuc2l0aW9ucyA/IDE1MCA6IDApO1xuICAgIH07XG4gICAgdGhpcy5oaWRlID0gZnVuY3Rpb24oKSB7XG4gICAgICBib290c3RyYXBDdXN0b21FdmVudC5jYWxsKG1vZGFsLCBoaWRlRXZlbnQsIGNvbXBvbmVudCk7XG4gICAgICBvdmVybGF5ID0gcXVlcnlFbGVtZW50KCcuJyttb2RhbEJhY2tkcm9wU3RyaW5nKTtcbiAgXG4gICAgICByZW1vdmVDbGFzcyhtb2RhbCxpbkNsYXNzKTtcbiAgICAgIG1vZGFsW3NldEF0dHJpYnV0ZV0oYXJpYUhpZGRlbiwgdHJ1ZSk7XG4gIFxuICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICBoYXNDbGFzcyhtb2RhbCwnZmFkZScpID8gZW11bGF0ZVRyYW5zaXRpb25FbmQobW9kYWwsIHRyaWdnZXJIaWRlKSA6IHRyaWdnZXJIaWRlKCk7XG4gICAgICB9LCBzdXBwb3J0VHJhbnNpdGlvbnMgPyAxNTAgOiAwKTtcbiAgICB9O1xuICAgIHRoaXMuc2V0Q29udGVudCA9IGZ1bmN0aW9uKCBjb250ZW50ICkge1xuICAgICAgcXVlcnlFbGVtZW50KCcuJytjb21wb25lbnQrJy1jb250ZW50Jyxtb2RhbClbaW5uZXJIVE1MXSA9IGNvbnRlbnQ7XG4gICAgfTtcbiAgICB0aGlzLnVwZGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKGhhc0NsYXNzKG1vZGFsLGluQ2xhc3MpKSB7XG4gICAgICAgIGNoZWNrU2Nyb2xsYmFyKCk7XG4gICAgICAgIHNldFNjcm9sbGJhcigpO1xuICAgICAgICBhZGp1c3REaWFsb2coKTtcbiAgICAgIH1cbiAgICB9O1xuICBcbiAgICAvLyBpbml0XG4gICAgLy8gcHJldmVudCBhZGRpbmcgZXZlbnQgaGFuZGxlcnMgb3ZlciBhbmQgb3ZlclxuICAgIC8vIG1vZGFsIGlzIGluZGVwZW5kZW50IG9mIGEgdHJpZ2dlcmluZyBlbGVtZW50XG4gICAgaWYgKCAhIWVsZW1lbnQgJiYgIShzdHJpbmdNb2RhbCBpbiBlbGVtZW50KSApIHtcbiAgICAgIG9uKGVsZW1lbnQsIGNsaWNrRXZlbnQsIGNsaWNrSGFuZGxlcik7XG4gICAgfVxuICAgIGlmICggISFzZWxmW2NvbnRlbnRdICkgeyBzZWxmLnNldENvbnRlbnQoIHNlbGZbY29udGVudF0gKTsgfVxuICAgICEhZWxlbWVudCAmJiAoZWxlbWVudFtzdHJpbmdNb2RhbF0gPSBzZWxmKTtcbiAgfTtcbiAgXG4gIC8vIERBVEEgQVBJXG4gIHN1cHBvcnRzW3B1c2hdKCBbIHN0cmluZ01vZGFsLCBNb2RhbCwgJ1snK2RhdGFUb2dnbGUrJz1cIm1vZGFsXCJdJyBdICk7XG4gIFxuICAvKiBOYXRpdmUgSmF2YXNjcmlwdCBmb3IgQm9vdHN0cmFwIDMgfCBQb3BvdmVyXG4gIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuICBcbiAgLy8gUE9QT1ZFUiBERUZJTklUSU9OXG4gIC8vID09PT09PT09PT09PT09PT09PVxuICB2YXIgUG9wb3ZlciA9IGZ1bmN0aW9uKCBlbGVtZW50LCBvcHRpb25zICkge1xuICBcbiAgICAvLyBpbml0aWFsaXphdGlvbiBlbGVtZW50XG4gICAgZWxlbWVudCA9IHF1ZXJ5RWxlbWVudChlbGVtZW50KTtcbiAgXG4gICAgLy8gc2V0IG9wdGlvbnNcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgXG4gICAgLy8gREFUQSBBUElcbiAgICB2YXIgdHJpZ2dlckRhdGEgPSBlbGVtZW50W2dldEF0dHJpYnV0ZV0oZGF0YVRyaWdnZXIpLCAvLyBjbGljayAvIGhvdmVyIC8gZm9jdXNcbiAgICAgICAgYW5pbWF0aW9uRGF0YSA9IGVsZW1lbnRbZ2V0QXR0cmlidXRlXShkYXRhQW5pbWF0aW9uKSwgLy8gdHJ1ZSAvIGZhbHNlXG4gICAgICAgIHBsYWNlbWVudERhdGEgPSBlbGVtZW50W2dldEF0dHJpYnV0ZV0oZGF0YVBsYWNlbWVudCksXG4gICAgICAgIGRpc21pc3NpYmxlRGF0YSA9IGVsZW1lbnRbZ2V0QXR0cmlidXRlXShkYXRhRGlzbWlzc2libGUpLFxuICAgICAgICBkZWxheURhdGEgPSBlbGVtZW50W2dldEF0dHJpYnV0ZV0oZGF0YURlbGF5KSxcbiAgICAgICAgY29udGFpbmVyRGF0YSA9IGVsZW1lbnRbZ2V0QXR0cmlidXRlXShkYXRhQ29udGFpbmVyKSxcbiAgXG4gICAgICAgIC8vIGludGVybmFsIHN0cmluZ3NcbiAgICAgICAgY29tcG9uZW50ID0gJ3BvcG92ZXInLFxuICAgICAgICB0ZW1wbGF0ZSA9ICd0ZW1wbGF0ZScsXG4gICAgICAgIHRyaWdnZXIgPSAndHJpZ2dlcicsXG4gICAgICAgIGNsYXNzU3RyaW5nID0gJ2NsYXNzJyxcbiAgICAgICAgZGl2ID0gJ2RpdicsXG4gICAgICAgIGZhZGUgPSAnZmFkZScsXG4gICAgICAgIGNvbnRlbnQgPSAnY29udGVudCcsXG4gICAgICAgIGRhdGFDb250ZW50ID0gJ2RhdGEtY29udGVudCcsXG4gICAgICAgIGRpc21pc3NpYmxlID0gJ2Rpc21pc3NpYmxlJyxcbiAgICAgICAgY2xvc2VCdG4gPSAnPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJjbG9zZVwiPsOXPC9idXR0b24+JyxcbiAgXG4gICAgICAgIC8vIGNoZWNrIGNvbnRhaW5lclxuICAgICAgICBjb250YWluZXJFbGVtZW50ID0gcXVlcnlFbGVtZW50KG9wdGlvbnNbY29udGFpbmVyXSksXG4gICAgICAgIGNvbnRhaW5lckRhdGFFbGVtZW50ID0gcXVlcnlFbGVtZW50KGNvbnRhaW5lckRhdGEpLCAgICAgIFxuICAgICAgICBcbiAgICAgICAgLy8gbWF5YmUgdGhlIGVsZW1lbnQgaXMgaW5zaWRlIGEgbW9kYWxcbiAgICAgICAgbW9kYWwgPSBnZXRDbG9zZXN0KGVsZW1lbnQsJy5tb2RhbCcpLFxuICAgICAgICBcbiAgICAgICAgLy8gbWF5YmUgdGhlIGVsZW1lbnQgaXMgaW5zaWRlIGEgZml4ZWQgbmF2YmFyXG4gICAgICAgIG5hdmJhckZpeGVkVG9wID0gZ2V0Q2xvc2VzdChlbGVtZW50LCcuJytmaXhlZFRvcCksXG4gICAgICAgIG5hdmJhckZpeGVkQm90dG9tID0gZ2V0Q2xvc2VzdChlbGVtZW50LCcuJytmaXhlZEJvdHRvbSk7XG4gIFxuICAgIC8vIHNldCBpbnN0YW5jZSBvcHRpb25zXG4gICAgdGhpc1t0ZW1wbGF0ZV0gPSBvcHRpb25zW3RlbXBsYXRlXSA/IG9wdGlvbnNbdGVtcGxhdGVdIDogbnVsbDsgLy8gSmF2YVNjcmlwdCBvbmx5XG4gICAgdGhpc1t0cmlnZ2VyXSA9IG9wdGlvbnNbdHJpZ2dlcl0gPyBvcHRpb25zW3RyaWdnZXJdIDogdHJpZ2dlckRhdGEgfHwgaG92ZXJFdmVudDtcbiAgICB0aGlzW2FuaW1hdGlvbl0gPSBvcHRpb25zW2FuaW1hdGlvbl0gJiYgb3B0aW9uc1thbmltYXRpb25dICE9PSBmYWRlID8gb3B0aW9uc1thbmltYXRpb25dIDogYW5pbWF0aW9uRGF0YSB8fCBmYWRlO1xuICAgIHRoaXNbcGxhY2VtZW50XSA9IG9wdGlvbnNbcGxhY2VtZW50XSA/IG9wdGlvbnNbcGxhY2VtZW50XSA6IHBsYWNlbWVudERhdGEgfHwgdG9wO1xuICAgIHRoaXNbZGVsYXldID0gcGFyc2VJbnQob3B0aW9uc1tkZWxheV0gfHwgZGVsYXlEYXRhKSB8fCAyMDA7XG4gICAgdGhpc1tkaXNtaXNzaWJsZV0gPSBvcHRpb25zW2Rpc21pc3NpYmxlXSB8fCBkaXNtaXNzaWJsZURhdGEgPT09ICd0cnVlJyA/IHRydWUgOiBmYWxzZTtcbiAgICB0aGlzW2NvbnRhaW5lcl0gPSBjb250YWluZXJFbGVtZW50ID8gY29udGFpbmVyRWxlbWVudCBcbiAgICAgICAgICAgICAgICAgICAgOiBjb250YWluZXJEYXRhRWxlbWVudCA/IGNvbnRhaW5lckRhdGFFbGVtZW50IFxuICAgICAgICAgICAgICAgICAgICA6IG5hdmJhckZpeGVkVG9wID8gbmF2YmFyRml4ZWRUb3BcbiAgICAgICAgICAgICAgICAgICAgOiBuYXZiYXJGaXhlZEJvdHRvbSA/IG5hdmJhckZpeGVkQm90dG9tXG4gICAgICAgICAgICAgICAgICAgIDogbW9kYWwgPyBtb2RhbCA6IERPQ1tib2R5XTtcbiAgXG4gICAgLy8gYmluZCwgY29udGVudFxuICAgIHZhciBzZWxmID0gdGhpcywgXG4gICAgICB0aXRsZVN0cmluZyA9IGVsZW1lbnRbZ2V0QXR0cmlidXRlXShkYXRhVGl0bGUpIHx8IG51bGwsXG4gICAgICBjb250ZW50U3RyaW5nID0gZWxlbWVudFtnZXRBdHRyaWJ1dGVdKGRhdGFDb250ZW50KSB8fCBudWxsO1xuICBcbiAgICBpZiAoICFjb250ZW50U3RyaW5nICYmICF0aGlzW3RlbXBsYXRlXSApIHJldHVybjsgLy8gaW52YWxpZGF0ZVxuICBcbiAgICAvLyBjb25zdGFudHMsIHZhcnNcbiAgICB2YXIgcG9wb3ZlciA9IG51bGwsIHRpbWVyID0gMCwgcGxhY2VtZW50U2V0dGluZyA9IHRoaXNbcGxhY2VtZW50XSxcbiAgICAgIFxuICAgICAgLy8gaGFuZGxlcnNcbiAgICAgIGRpc21pc3NpYmxlSGFuZGxlciA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgaWYgKHBvcG92ZXIgIT09IG51bGwgJiYgZVt0YXJnZXRdID09PSBxdWVyeUVsZW1lbnQoJy5jbG9zZScscG9wb3ZlcikpIHtcbiAgICAgICAgICBzZWxmLmhpZGUoKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgXG4gICAgICAvLyBwcml2YXRlIG1ldGhvZHNcbiAgICAgIHJlbW92ZVBvcG92ZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgc2VsZltjb250YWluZXJdLnJlbW92ZUNoaWxkKHBvcG92ZXIpO1xuICAgICAgICB0aW1lciA9IG51bGw7IHBvcG92ZXIgPSBudWxsOyBcbiAgICAgIH0sXG4gICAgICBjcmVhdGVQb3BvdmVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHRpdGxlU3RyaW5nID0gZWxlbWVudFtnZXRBdHRyaWJ1dGVdKGRhdGFUaXRsZSk7IC8vIGNoZWNrIGNvbnRlbnQgYWdhaW5cbiAgICAgICAgY29udGVudFN0cmluZyA9IGVsZW1lbnRbZ2V0QXR0cmlidXRlXShkYXRhQ29udGVudCk7XG4gIFxuICAgICAgICBwb3BvdmVyID0gRE9DW2NyZWF0ZUVsZW1lbnRdKGRpdik7XG4gIFxuICAgICAgICBpZiAoIGNvbnRlbnRTdHJpbmcgIT09IG51bGwgJiYgc2VsZlt0ZW1wbGF0ZV0gPT09IG51bGwgKSB7IC8vY3JlYXRlIHRoZSBwb3BvdmVyIGZyb20gZGF0YSBhdHRyaWJ1dGVzXG4gIFxuICAgICAgICAgIHBvcG92ZXJbc2V0QXR0cmlidXRlXSgncm9sZScsJ3Rvb2x0aXAnKTtcbiAgXG4gICAgICAgICAgaWYgKHRpdGxlU3RyaW5nICE9PSBudWxsKSB7XG4gICAgICAgICAgICB2YXIgcG9wb3ZlclRpdGxlID0gRE9DW2NyZWF0ZUVsZW1lbnRdKCdoMycpO1xuICAgICAgICAgICAgcG9wb3ZlclRpdGxlW3NldEF0dHJpYnV0ZV0oY2xhc3NTdHJpbmcsY29tcG9uZW50KyctdGl0bGUnKTtcbiAgXG4gICAgICAgICAgICBwb3BvdmVyVGl0bGVbaW5uZXJIVE1MXSA9IHNlbGZbZGlzbWlzc2libGVdID8gdGl0bGVTdHJpbmcgKyBjbG9zZUJ0biA6IHRpdGxlU3RyaW5nO1xuICAgICAgICAgICAgcG9wb3ZlclthcHBlbmRDaGlsZF0ocG9wb3ZlclRpdGxlKTtcbiAgICAgICAgICB9XG4gIFxuICAgICAgICAgIHZhciBwb3BvdmVyQXJyb3cgPSBET0NbY3JlYXRlRWxlbWVudF0oZGl2KSwgcG9wb3ZlckNvbnRlbnQgPSBET0NbY3JlYXRlRWxlbWVudF0oZGl2KTtcbiAgICAgICAgICBwb3BvdmVyQXJyb3dbc2V0QXR0cmlidXRlXShjbGFzc1N0cmluZywnYXJyb3cnKTsgcG9wb3ZlckNvbnRlbnRbc2V0QXR0cmlidXRlXShjbGFzc1N0cmluZyxjb21wb25lbnQrJy1jb250ZW50Jyk7XG4gICAgICAgICAgcG9wb3ZlclthcHBlbmRDaGlsZF0ocG9wb3ZlckFycm93KTsgcG9wb3ZlclthcHBlbmRDaGlsZF0ocG9wb3ZlckNvbnRlbnQpO1xuICBcbiAgICAgICAgICAvL3NldCBwb3BvdmVyIGNvbnRlbnRcbiAgICAgICAgICBwb3BvdmVyQ29udGVudFtpbm5lckhUTUxdID0gc2VsZltkaXNtaXNzaWJsZV0gJiYgdGl0bGVTdHJpbmcgPT09IG51bGwgPyBjb250ZW50U3RyaW5nICsgY2xvc2VCdG4gOiBjb250ZW50U3RyaW5nO1xuICBcbiAgICAgICAgfSBlbHNlIHsgIC8vIG9yIGNyZWF0ZSB0aGUgcG9wb3ZlciBmcm9tIHRlbXBsYXRlXG4gICAgICAgICAgdmFyIHBvcG92ZXJUZW1wbGF0ZSA9IERPQ1tjcmVhdGVFbGVtZW50XShkaXYpO1xuICAgICAgICAgIHBvcG92ZXJUZW1wbGF0ZVtpbm5lckhUTUxdID0gc2VsZlt0ZW1wbGF0ZV07XG4gICAgICAgICAgcG9wb3Zlcltpbm5lckhUTUxdID0gcG9wb3ZlclRlbXBsYXRlLmZpcnN0Q2hpbGRbaW5uZXJIVE1MXTtcbiAgICAgICAgfVxuICBcbiAgICAgICAgLy9hcHBlbmQgdG8gdGhlIGNvbnRhaW5lclxuICAgICAgICBzZWxmW2NvbnRhaW5lcl1bYXBwZW5kQ2hpbGRdKHBvcG92ZXIpO1xuICAgICAgICBwb3BvdmVyW3N0eWxlXS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICAgICAgcG9wb3ZlcltzZXRBdHRyaWJ1dGVdKGNsYXNzU3RyaW5nLCBjb21wb25lbnQrICcgJyArIHBsYWNlbWVudFNldHRpbmcgKyAnICcgKyBzZWxmW2FuaW1hdGlvbl0pO1xuICAgICAgfSxcbiAgICAgIHNob3dQb3BvdmVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAhaGFzQ2xhc3MocG9wb3ZlcixpbkNsYXNzKSAmJiAoIGFkZENsYXNzKHBvcG92ZXIsaW5DbGFzcykgKTtcbiAgICAgIH0sXG4gICAgICB1cGRhdGVQb3BvdmVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHN0eWxlVGlwKGVsZW1lbnQscG9wb3ZlcixwbGFjZW1lbnRTZXR0aW5nLHNlbGZbY29udGFpbmVyXSk7XG4gICAgICB9LFxuICAgICAgXG4gICAgICAvLyBldmVudCB0b2dnbGVcbiAgICAgIGRpc21pc3NIYW5kbGVyVG9nZ2xlID0gZnVuY3Rpb24odHlwZSl7XG4gICAgICAgIGlmIChjbGlja0V2ZW50ID09IHNlbGZbdHJpZ2dlcl0gfHwgJ2ZvY3VzJyA9PSBzZWxmW3RyaWdnZXJdKSB7XG4gICAgICAgICAgIXNlbGZbZGlzbWlzc2libGVdICYmIHR5cGUoIGVsZW1lbnQsICdibHVyJywgc2VsZi5oaWRlICk7XG4gICAgICAgIH1cbiAgICAgICAgc2VsZltkaXNtaXNzaWJsZV0gJiYgdHlwZSggRE9DLCBjbGlja0V2ZW50LCBkaXNtaXNzaWJsZUhhbmRsZXIgKTtcbiAgICAgICAgIWlzSUU4ICYmIHR5cGUoIGdsb2JhbE9iamVjdCwgcmVzaXplRXZlbnQsIHNlbGYuaGlkZSApO1xuICAgICAgfSxcbiAgXG4gICAgICAvLyB0cmlnZ2Vyc1xuICAgICAgc2hvd1RyaWdnZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgZGlzbWlzc0hhbmRsZXJUb2dnbGUob24pO1xuICAgICAgICBib290c3RyYXBDdXN0b21FdmVudC5jYWxsKGVsZW1lbnQsIHNob3duRXZlbnQsIGNvbXBvbmVudCk7XG4gICAgICB9LFxuICAgICAgaGlkZVRyaWdnZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgZGlzbWlzc0hhbmRsZXJUb2dnbGUob2ZmKTtcbiAgICAgICAgcmVtb3ZlUG9wb3ZlcigpO1xuICAgICAgICBib290c3RyYXBDdXN0b21FdmVudC5jYWxsKGVsZW1lbnQsIGhpZGRlbkV2ZW50LCBjb21wb25lbnQpO1xuICAgICAgfTtcbiAgXG4gICAgLy8gcHVibGljIG1ldGhvZHMgLyBoYW5kbGVyc1xuICAgIHRoaXMudG9nZ2xlID0gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAocG9wb3ZlciA9PT0gbnVsbCkgeyBzZWxmLnNob3coKTsgfSBcbiAgICAgIGVsc2UgeyBzZWxmLmhpZGUoKTsgfVxuICAgIH07XG4gICAgdGhpcy5zaG93ID0gZnVuY3Rpb24oKSB7XG4gICAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgICAgdGltZXIgPSBzZXRUaW1lb3V0KCBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHBvcG92ZXIgPT09IG51bGwpIHtcbiAgICAgICAgICBwbGFjZW1lbnRTZXR0aW5nID0gc2VsZltwbGFjZW1lbnRdOyAvLyB3ZSByZXNldCBwbGFjZW1lbnQgaW4gYWxsIGNhc2VzXG4gICAgICAgICAgY3JlYXRlUG9wb3ZlcigpO1xuICAgICAgICAgIHVwZGF0ZVBvcG92ZXIoKTtcbiAgICAgICAgICBzaG93UG9wb3ZlcigpO1xuICAgICAgICAgIGJvb3RzdHJhcEN1c3RvbUV2ZW50LmNhbGwoZWxlbWVudCwgc2hvd0V2ZW50LCBjb21wb25lbnQpO1xuICAgICAgICAgICEhc2VsZlthbmltYXRpb25dID8gZW11bGF0ZVRyYW5zaXRpb25FbmQocG9wb3Zlciwgc2hvd1RyaWdnZXIpIDogc2hvd1RyaWdnZXIoKTtcbiAgICAgICAgfVxuICAgICAgfSwgMjAgKTtcbiAgICB9O1xuICAgIHRoaXMuaGlkZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICAgIHRpbWVyID0gc2V0VGltZW91dCggZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChwb3BvdmVyICYmIHBvcG92ZXIgIT09IG51bGwgJiYgaGFzQ2xhc3MocG9wb3ZlcixpbkNsYXNzKSkge1xuICAgICAgICAgIGJvb3RzdHJhcEN1c3RvbUV2ZW50LmNhbGwoZWxlbWVudCwgaGlkZUV2ZW50LCBjb21wb25lbnQpO1xuICAgICAgICAgIHJlbW92ZUNsYXNzKHBvcG92ZXIsaW5DbGFzcyk7XG4gICAgICAgICAgISFzZWxmW2FuaW1hdGlvbl0gPyBlbXVsYXRlVHJhbnNpdGlvbkVuZChwb3BvdmVyLCBoaWRlVHJpZ2dlcikgOiBoaWRlVHJpZ2dlcigpO1xuICAgICAgICB9XG4gICAgICB9LCBzZWxmW2RlbGF5XSApO1xuICAgIH07XG4gIFxuICAgIC8vIGluaXRcbiAgICBpZiAoICEoc3RyaW5nUG9wb3ZlciBpbiBlbGVtZW50KSApIHsgLy8gcHJldmVudCBhZGRpbmcgZXZlbnQgaGFuZGxlcnMgdHdpY2VcbiAgICAgIGlmIChzZWxmW3RyaWdnZXJdID09PSBob3ZlckV2ZW50KSB7XG4gICAgICAgIG9uKCBlbGVtZW50LCBtb3VzZUhvdmVyWzBdLCBzZWxmLnNob3cgKTtcbiAgICAgICAgaWYgKCFzZWxmW2Rpc21pc3NpYmxlXSkgeyBvbiggZWxlbWVudCwgbW91c2VIb3ZlclsxXSwgc2VsZi5oaWRlICk7IH1cbiAgICAgIH0gZWxzZSBpZiAoY2xpY2tFdmVudCA9PSBzZWxmW3RyaWdnZXJdIHx8ICdmb2N1cycgPT0gc2VsZlt0cmlnZ2VyXSkge1xuICAgICAgICBvbiggZWxlbWVudCwgc2VsZlt0cmlnZ2VyXSwgc2VsZi50b2dnbGUgKTtcbiAgICAgIH0gICAgXG4gICAgfVxuICAgIGVsZW1lbnRbc3RyaW5nUG9wb3Zlcl0gPSBzZWxmO1xuICB9O1xuICBcbiAgLy8gUE9QT1ZFUiBEQVRBIEFQSVxuICAvLyA9PT09PT09PT09PT09PT09XG4gIHN1cHBvcnRzW3B1c2hdKCBbIHN0cmluZ1BvcG92ZXIsIFBvcG92ZXIsICdbJytkYXRhVG9nZ2xlKyc9XCJwb3BvdmVyXCJdJyBdICk7XG4gIFxuICBcbiAgLyogTmF0aXZlIEphdmFzY3JpcHQgZm9yIEJvb3RzdHJhcCAzIHwgU2Nyb2xsU3B5XG4gIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbiAgXG4gIC8vIFNDUk9MTFNQWSBERUZJTklUSU9OXG4gIC8vID09PT09PT09PT09PT09PT09PT09XG4gIHZhciBTY3JvbGxTcHkgPSBmdW5jdGlvbihlbGVtZW50LCBvcHRpb25zKSB7XG4gIFxuICAgIC8vIGluaXRpYWxpemF0aW9uIGVsZW1lbnQsIHRoZSBlbGVtZW50IHdlIHNweSBvblxuICAgIGVsZW1lbnQgPSBxdWVyeUVsZW1lbnQoZWxlbWVudCk7IFxuICBcbiAgICAvLyBEQVRBIEFQSVxuICAgIHZhciB0YXJnZXREYXRhID0gcXVlcnlFbGVtZW50KGVsZW1lbnRbZ2V0QXR0cmlidXRlXShkYXRhVGFyZ2V0KSksXG4gICAgICAgIG9mZnNldERhdGEgPSBlbGVtZW50W2dldEF0dHJpYnV0ZV0oJ2RhdGEtb2Zmc2V0Jyk7XG4gIFxuICAgIC8vIHNldCBvcHRpb25zXG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgaWYgKCAhb3B0aW9uc1t0YXJnZXRdICYmICF0YXJnZXREYXRhICkgeyByZXR1cm47IH0gLy8gaW52YWxpZGF0ZVxuICBcbiAgICAvLyBldmVudCB0YXJnZXRzLCBjb25zdGFudHNcbiAgICB2YXIgc2VsZiA9IHRoaXMsIHNweVRhcmdldCA9IG9wdGlvbnNbdGFyZ2V0XSAmJiBxdWVyeUVsZW1lbnQob3B0aW9uc1t0YXJnZXRdKSB8fCB0YXJnZXREYXRhLFxuICAgICAgICBsaW5rcyA9IHNweVRhcmdldCAmJiBzcHlUYXJnZXRbZ2V0RWxlbWVudHNCeVRhZ05hbWVdKCdBJyksXG4gICAgICAgIG9mZnNldCA9IHBhcnNlSW50KG9mZnNldERhdGEgfHwgb3B0aW9uc1snb2Zmc2V0J10pIHx8IDEwLCAgICAgIFxuICAgICAgICBpdGVtcyA9IFtdLCB0YXJnZXRJdGVtcyA9IFtdLCBzY3JvbGxPZmZzZXQsXG4gICAgICAgIHNjcm9sbFRhcmdldCA9IGVsZW1lbnRbb2Zmc2V0SGVpZ2h0XSA8IGVsZW1lbnRbc2Nyb2xsSGVpZ2h0XSA/IGVsZW1lbnQgOiBnbG9iYWxPYmplY3QsIC8vIGRldGVybWluZSB3aGljaCBpcyB0aGUgcmVhbCBzY3JvbGxUYXJnZXRcbiAgICAgICAgaXNXaW5kb3cgPSBzY3JvbGxUYXJnZXQgPT09IGdsb2JhbE9iamVjdDsgIFxuICBcbiAgICAvLyBwb3B1bGF0ZSBpdGVtcyBhbmQgdGFyZ2V0c1xuICAgIGZvciAodmFyIGk9MCwgaWw9bGlua3NbbGVuZ3RoXTsgaTxpbDsgaSsrKSB7XG4gICAgICB2YXIgaHJlZiA9IGxpbmtzW2ldW2dldEF0dHJpYnV0ZV0oJ2hyZWYnKSwgXG4gICAgICAgICAgdGFyZ2V0SXRlbSA9IGhyZWYgJiYgaHJlZi5jaGFyQXQoMCkgPT09ICcjJyAmJiBocmVmLnNsaWNlKC0xKSAhPT0gJyMnICYmIHF1ZXJ5RWxlbWVudChocmVmKTtcbiAgICAgIGlmICggISF0YXJnZXRJdGVtICkge1xuICAgICAgICBpdGVtc1twdXNoXShsaW5rc1tpXSk7XG4gICAgICAgIHRhcmdldEl0ZW1zW3B1c2hdKHRhcmdldEl0ZW0pO1xuICAgICAgfVxuICAgIH1cbiAgXG4gICAgLy8gcHJpdmF0ZSBtZXRob2RzXG4gICAgdmFyIHVwZGF0ZUl0ZW0gPSBmdW5jdGlvbihpbmRleCkge1xuICAgICAgdmFyIHBhcmVudCA9IGl0ZW1zW2luZGV4XVtwYXJlbnROb2RlXSwgLy8gaXRlbSdzIHBhcmVudCBMSSBlbGVtZW50XG4gICAgICAgICAgdGFyZ2V0SXRlbSA9IHRhcmdldEl0ZW1zW2luZGV4XSwgLy8gdGhlIG1lbnUgaXRlbSB0YXJnZXRzIHRoaXMgZWxlbWVudFxuICAgICAgICAgIGRyb3Bkb3duID0gZ2V0Q2xvc2VzdChwYXJlbnQsJy5kcm9wZG93bicpLFxuICAgICAgICAgIHRhcmdldFJlY3QgPSBpc1dpbmRvdyAmJiB0YXJnZXRJdGVtW2dldEJvdW5kaW5nQ2xpZW50UmVjdF0oKSxcbiAgXG4gICAgICAgICAgaXNBY3RpdmUgPSBoYXNDbGFzcyhwYXJlbnQsYWN0aXZlKSB8fCBmYWxzZSxcbiAgXG4gICAgICAgICAgdG9wRWRnZSA9IChpc1dpbmRvdyA/IHRhcmdldFJlY3RbdG9wXSArIHNjcm9sbE9mZnNldCA6IHRhcmdldEl0ZW1bb2Zmc2V0VG9wXSkgLSBvZmZzZXQsXG4gICAgICAgICAgYm90dG9tRWRnZSA9IGlzV2luZG93ID8gdGFyZ2V0UmVjdFtib3R0b21dICsgc2Nyb2xsT2Zmc2V0IC0gb2Zmc2V0IDogdGFyZ2V0SXRlbXNbaW5kZXgrMV0gPyB0YXJnZXRJdGVtc1tpbmRleCsxXVtvZmZzZXRUb3BdIC0gb2Zmc2V0IDogZWxlbWVudFtzY3JvbGxIZWlnaHRdLFxuICBcbiAgICAgICAgICBpbnNpZGUgPSBzY3JvbGxPZmZzZXQgPj0gdG9wRWRnZSAmJiBib3R0b21FZGdlID4gc2Nyb2xsT2Zmc2V0O1xuICBcbiAgICAgICAgaWYgKCAhaXNBY3RpdmUgJiYgaW5zaWRlICkge1xuICAgICAgICAgIGlmICggcGFyZW50LnRhZ05hbWUgPT09ICdMSScgJiYgIWhhc0NsYXNzKHBhcmVudCxhY3RpdmUpICkge1xuICAgICAgICAgICAgYWRkQ2xhc3MocGFyZW50LGFjdGl2ZSk7XG4gICAgICAgICAgICBpZiAoZHJvcGRvd24gJiYgIWhhc0NsYXNzKGRyb3Bkb3duLGFjdGl2ZSkgKSB7XG4gICAgICAgICAgICAgIGFkZENsYXNzKGRyb3Bkb3duLGFjdGl2ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBib290c3RyYXBDdXN0b21FdmVudC5jYWxsKGVsZW1lbnQsICdhY3RpdmF0ZScsICdzY3JvbGxzcHknLCBpdGVtc1tpbmRleF0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICggIWluc2lkZSApIHtcbiAgICAgICAgICBpZiAoIHBhcmVudC50YWdOYW1lID09PSAnTEknICYmIGhhc0NsYXNzKHBhcmVudCxhY3RpdmUpICkge1xuICAgICAgICAgICAgcmVtb3ZlQ2xhc3MocGFyZW50LGFjdGl2ZSk7XG4gICAgICAgICAgICBpZiAoZHJvcGRvd24gJiYgaGFzQ2xhc3MoZHJvcGRvd24sYWN0aXZlKSAmJiAhZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShwYXJlbnRbcGFyZW50Tm9kZV0sYWN0aXZlKS5sZW5ndGggKSB7XG4gICAgICAgICAgICAgIHJlbW92ZUNsYXNzKGRyb3Bkb3duLGFjdGl2ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKCAhaW5zaWRlICYmICFpc0FjdGl2ZSB8fCBpc0FjdGl2ZSAmJiBpbnNpZGUgKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgdXBkYXRlSXRlbXMgPSBmdW5jdGlvbigpe1xuICAgICAgICBzY3JvbGxPZmZzZXQgPSBpc1dpbmRvdyA/IGdldFNjcm9sbCgpLnkgOiBlbGVtZW50W3Njcm9sbFRvcF07XG4gICAgICAgIGZvciAodmFyIGluZGV4PTAsIGl0bD1pdGVtc1tsZW5ndGhdOyBpbmRleDxpdGw7IGluZGV4KyspIHtcbiAgICAgICAgICB1cGRhdGVJdGVtKGluZGV4KVxuICAgICAgICB9XG4gICAgICB9O1xuICBcbiAgICAvLyBwdWJsaWMgbWV0aG9kXG4gICAgdGhpcy5yZWZyZXNoID0gZnVuY3Rpb24gKCkge1xuICAgICAgdXBkYXRlSXRlbXMoKTtcbiAgICB9XG4gIFxuICAgIC8vIGluaXRcbiAgICBpZiAoICEoc3RyaW5nU2Nyb2xsU3B5IGluIGVsZW1lbnQpICkgeyAvLyBwcmV2ZW50IGFkZGluZyBldmVudCBoYW5kbGVycyB0d2ljZVxuICAgICAgb24oIHNjcm9sbFRhcmdldCwgc2Nyb2xsRXZlbnQsIHNlbGYucmVmcmVzaCApO1xuICAgICAgIWlzSUU4ICYmIG9uKCBnbG9iYWxPYmplY3QsIHJlc2l6ZUV2ZW50LCBzZWxmLnJlZnJlc2ggKTsgXG4gICAgfVxuICAgIHNlbGYucmVmcmVzaCgpO1xuICAgIGVsZW1lbnRbc3RyaW5nU2Nyb2xsU3B5XSA9IHNlbGY7XG4gIH07XG4gIFxuICAvLyBTQ1JPTExTUFkgREFUQSBBUElcbiAgLy8gPT09PT09PT09PT09PT09PT09XG4gIHN1cHBvcnRzW3B1c2hdKCBbIHN0cmluZ1Njcm9sbFNweSwgU2Nyb2xsU3B5LCAnWycrZGF0YVNweSsnPVwic2Nyb2xsXCJdJyBdICk7XG4gIFxuICBcbiAgLyogTmF0aXZlIEphdmFzY3JpcHQgZm9yIEJvb3RzdHJhcCAzIHwgVGFiXG4gIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbiAgXG4gIC8vIFRBQiBERUZJTklUSU9OXG4gIC8vID09PT09PT09PT09PT09XG4gIHZhciBUYWIgPSBmdW5jdGlvbiggZWxlbWVudCwgb3B0aW9ucyApIHtcbiAgXG4gICAgLy8gaW5pdGlhbGl6YXRpb24gZWxlbWVudFxuICAgIGVsZW1lbnQgPSBxdWVyeUVsZW1lbnQoZWxlbWVudCk7XG4gIFxuICAgIC8vIERBVEEgQVBJXG4gICAgdmFyIGhlaWdodERhdGEgPSBlbGVtZW50W2dldEF0dHJpYnV0ZV0oZGF0YUhlaWdodCksXG4gICAgICBcbiAgICAgICAgLy8gc3RyaW5nc1xuICAgICAgICBjb21wb25lbnQgPSAndGFiJywgaGVpZ2h0ID0gJ2hlaWdodCcsIGZsb2F0ID0gJ2Zsb2F0JywgaXNBbmltYXRpbmcgPSAnaXNBbmltYXRpbmcnO1xuICBcbiAgICAvLyBzZXQgb3B0aW9uc1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIHRoaXNbaGVpZ2h0XSA9IHN1cHBvcnRUcmFuc2l0aW9ucyA/IChvcHRpb25zW2hlaWdodF0gfHwgaGVpZ2h0RGF0YSA9PT0gJ3RydWUnKSA6IGZhbHNlOyAvLyBmaWx0ZXIgbGVnYWN5IGJyb3dzZXJzXG4gIFxuICAgIC8vIGJpbmQsIGV2ZW50IHRhcmdldHNcbiAgICB2YXIgc2VsZiA9IHRoaXMsIG5leHQsXG4gICAgICB0YWJzID0gZ2V0Q2xvc2VzdChlbGVtZW50LCcubmF2JyksXG4gICAgICB0YWJzQ29udGVudENvbnRhaW5lciA9IGZhbHNlLFxuICAgICAgZHJvcGRvd24gPSB0YWJzICYmIHF1ZXJ5RWxlbWVudCgnLmRyb3Bkb3duJyx0YWJzKSxcbiAgICAgIGFjdGl2ZVRhYiwgYWN0aXZlQ29udGVudCwgbmV4dENvbnRlbnQsIGNvbnRhaW5lckhlaWdodCwgZXF1YWxDb250ZW50cywgbmV4dEhlaWdodCxcbiAgXG4gICAgICAvLyB0cmlnZ2VyXG4gICAgICB0cmlnZ2VyRW5kID0gZnVuY3Rpb24oKXtcbiAgICAgICAgdGFic0NvbnRlbnRDb250YWluZXJbc3R5bGVdW2hlaWdodF0gPSAnJztcbiAgICAgICAgcmVtb3ZlQ2xhc3ModGFic0NvbnRlbnRDb250YWluZXIsY29sbGFwc2luZyk7XG4gICAgICAgIHRhYnNbaXNBbmltYXRpbmddID0gZmFsc2U7XG4gICAgICB9LFxuICAgICAgdHJpZ2dlclNob3cgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRhYnNDb250ZW50Q29udGFpbmVyKSB7IC8vIGhlaWdodCBhbmltYXRpb25cbiAgICAgICAgICBpZiAoIGVxdWFsQ29udGVudHMgKSB7XG4gICAgICAgICAgICB0cmlnZ2VyRW5kKCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXsgLy8gZW5hYmxlcyBoZWlnaHQgYW5pbWF0aW9uXG4gICAgICAgICAgICAgIHRhYnNDb250ZW50Q29udGFpbmVyW3N0eWxlXVtoZWlnaHRdID0gbmV4dEhlaWdodCArICdweCc7IC8vIGhlaWdodCBhbmltYXRpb25cbiAgICAgICAgICAgICAgdGFic0NvbnRlbnRDb250YWluZXJbb2Zmc2V0V2lkdGhdO1xuICAgICAgICAgICAgICBlbXVsYXRlVHJhbnNpdGlvbkVuZCh0YWJzQ29udGVudENvbnRhaW5lciwgdHJpZ2dlckVuZCk7XG4gICAgICAgICAgICB9LDEpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0YWJzW2lzQW5pbWF0aW5nXSA9IGZhbHNlOyBcbiAgICAgICAgfVxuICAgICAgICBib290c3RyYXBDdXN0b21FdmVudC5jYWxsKG5leHQsIHNob3duRXZlbnQsIGNvbXBvbmVudCwgYWN0aXZlVGFiKTtcbiAgICAgIH0sXG4gICAgICB0cmlnZ2VySGlkZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGFic0NvbnRlbnRDb250YWluZXIpIHtcbiAgICAgICAgICBhY3RpdmVDb250ZW50W3N0eWxlXVtmbG9hdF0gPSBsZWZ0O1xuICAgICAgICAgIG5leHRDb250ZW50W3N0eWxlXVtmbG9hdF0gPSBsZWZ0OyAgICAgICAgXG4gICAgICAgICAgY29udGFpbmVySGVpZ2h0ID0gYWN0aXZlQ29udGVudFtzY3JvbGxIZWlnaHRdO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBhZGRDbGFzcyhuZXh0Q29udGVudCxhY3RpdmUpO1xuICAgICAgICBib290c3RyYXBDdXN0b21FdmVudC5jYWxsKG5leHQsIHNob3dFdmVudCwgY29tcG9uZW50LCBhY3RpdmVUYWIpO1xuICAgICAgICBcbiAgICAgICAgcmVtb3ZlQ2xhc3MoYWN0aXZlQ29udGVudCxhY3RpdmUpO1xuICAgICAgICBib290c3RyYXBDdXN0b21FdmVudC5jYWxsKGFjdGl2ZVRhYiwgaGlkZGVuRXZlbnQsIGNvbXBvbmVudCwgbmV4dCk7XG4gICAgICAgIFxuICAgICAgICBpZiAodGFic0NvbnRlbnRDb250YWluZXIpIHtcbiAgICAgICAgICBuZXh0SGVpZ2h0ID0gbmV4dENvbnRlbnRbc2Nyb2xsSGVpZ2h0XTtcbiAgICAgICAgICBlcXVhbENvbnRlbnRzID0gbmV4dEhlaWdodCA9PT0gY29udGFpbmVySGVpZ2h0O1xuICAgICAgICAgIGFkZENsYXNzKHRhYnNDb250ZW50Q29udGFpbmVyLGNvbGxhcHNpbmcpO1xuICAgICAgICAgIHRhYnNDb250ZW50Q29udGFpbmVyW3N0eWxlXVtoZWlnaHRdID0gY29udGFpbmVySGVpZ2h0ICsgJ3B4JzsgLy8gaGVpZ2h0IGFuaW1hdGlvblxuICAgICAgICAgIHRhYnNDb250ZW50Q29udGFpbmVyW29mZnNldEhlaWdodF07XG4gICAgICAgICAgYWN0aXZlQ29udGVudFtzdHlsZV1bZmxvYXRdID0gJyc7XG4gICAgICAgICAgbmV4dENvbnRlbnRbc3R5bGVdW2Zsb2F0XSA9ICcnO1xuICAgICAgICB9XG4gIFxuICAgICAgICBpZiAoIGhhc0NsYXNzKG5leHRDb250ZW50LCAnZmFkZScpICkge1xuICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXsgLy8gbWFrZXMgc3VyZSB0byBnbyBmb3J3YXJkXG4gICAgICAgICAgICBhZGRDbGFzcyhuZXh0Q29udGVudCxpbkNsYXNzKTtcbiAgICAgICAgICAgIGVtdWxhdGVUcmFuc2l0aW9uRW5kKG5leHRDb250ZW50LHRyaWdnZXJTaG93KTtcbiAgICAgICAgICB9LDIwKTtcbiAgICAgICAgfSBlbHNlIHsgdHJpZ2dlclNob3coKTsgfSAgICAgICAgXG4gICAgICB9O1xuICBcbiAgICBpZiAoIXRhYnMpIHJldHVybjsgLy8gaW52YWxpZGF0ZSBcbiAgXG4gICAgLy8gc2V0IGRlZmF1bHQgYW5pbWF0aW9uIHN0YXRlXG4gICAgdGFic1tpc0FuaW1hdGluZ10gPSBmYWxzZTtcbiAgICAgIFxuICAgIC8vIHByaXZhdGUgbWV0aG9kc1xuICAgIHZhciBnZXRBY3RpdmVUYWIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGFjdGl2ZVRhYnMgPSBnZXRFbGVtZW50c0J5Q2xhc3NOYW1lKHRhYnMsYWN0aXZlKSwgYWN0aXZlVGFiO1xuICAgICAgICBpZiAoIGFjdGl2ZVRhYnNbbGVuZ3RoXSA9PT0gMSAmJiAhaGFzQ2xhc3MoYWN0aXZlVGFic1swXSwnZHJvcGRvd24nKSApIHtcbiAgICAgICAgICBhY3RpdmVUYWIgPSBhY3RpdmVUYWJzWzBdO1xuICAgICAgICB9IGVsc2UgaWYgKCBhY3RpdmVUYWJzW2xlbmd0aF0gPiAxICkge1xuICAgICAgICAgIGFjdGl2ZVRhYiA9IGFjdGl2ZVRhYnNbYWN0aXZlVGFic1tsZW5ndGhdLTFdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhY3RpdmVUYWJbZ2V0RWxlbWVudHNCeVRhZ05hbWVdKCdBJylbMF07XG4gICAgICB9LFxuICAgICAgZ2V0QWN0aXZlQ29udGVudCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gcXVlcnlFbGVtZW50KGdldEFjdGl2ZVRhYigpW2dldEF0dHJpYnV0ZV0oJ2hyZWYnKSk7XG4gICAgICB9LFxuICAgICAgLy8gaGFuZGxlclxuICAgICAgY2xpY2tIYW5kbGVyID0gZnVuY3Rpb24oZSkge1xuICAgICAgICB2YXIgaHJlZiA9IGVbdGFyZ2V0XVtnZXRBdHRyaWJ1dGVdKCdocmVmJyk7XG4gICAgICAgIGVbcHJldmVudERlZmF1bHRdKCk7XG4gICAgICAgIG5leHQgPSBlW3RhcmdldF1bZ2V0QXR0cmlidXRlXShkYXRhVG9nZ2xlKSA9PT0gY29tcG9uZW50IHx8IChocmVmICYmIGhyZWYuY2hhckF0KDApID09PSAnIycpXG4gICAgICAgICAgICAgPyBlW3RhcmdldF0gOiBlW3RhcmdldF1bcGFyZW50Tm9kZV07IC8vIGFsbG93IGZvciBjaGlsZCBlbGVtZW50cyBsaWtlIGljb25zIHRvIHVzZSB0aGUgaGFuZGxlclxuICAgICAgICAhdGFic1tpc0FuaW1hdGluZ10gJiYgIWhhc0NsYXNzKG5leHRbcGFyZW50Tm9kZV0sYWN0aXZlKSAmJiBzZWxmLnNob3coKTtcbiAgICAgIH07XG4gIFxuICAgIC8vIHB1YmxpYyBtZXRob2RcbiAgICB0aGlzLnNob3cgPSBmdW5jdGlvbigpIHsgLy8gdGhlIHRhYiB3ZSBjbGlja2VkIGlzIG5vdyB0aGUgbmV4dCB0YWJcbiAgICAgIG5leHQgPSBuZXh0IHx8IGVsZW1lbnQ7XG4gICAgICBuZXh0Q29udGVudCA9IHF1ZXJ5RWxlbWVudChuZXh0W2dldEF0dHJpYnV0ZV0oJ2hyZWYnKSk7IC8vdGhpcyBpcyB0aGUgYWN0dWFsIG9iamVjdCwgdGhlIG5leHQgdGFiIGNvbnRlbnQgdG8gYWN0aXZhdGVcbiAgICAgIGFjdGl2ZVRhYiA9IGdldEFjdGl2ZVRhYigpOyBcbiAgICAgIGFjdGl2ZUNvbnRlbnQgPSBnZXRBY3RpdmVDb250ZW50KCk7XG4gIFxuICAgICAgdGFic1tpc0FuaW1hdGluZ10gPSB0cnVlO1xuICAgICAgcmVtb3ZlQ2xhc3MoYWN0aXZlVGFiW3BhcmVudE5vZGVdLGFjdGl2ZSk7XG4gICAgICBhZGRDbGFzcyhuZXh0W3BhcmVudE5vZGVdLGFjdGl2ZSk7XG4gIFxuICAgICAgaWYgKCBkcm9wZG93biApIHtcbiAgICAgICAgaWYgKCAhaGFzQ2xhc3MoZWxlbWVudFtwYXJlbnROb2RlXVtwYXJlbnROb2RlXSwnZHJvcGRvd24tbWVudScpICkge1xuICAgICAgICAgIGlmIChoYXNDbGFzcyhkcm9wZG93bixhY3RpdmUpKSByZW1vdmVDbGFzcyhkcm9wZG93bixhY3RpdmUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmICghaGFzQ2xhc3MoZHJvcGRvd24sYWN0aXZlKSkgYWRkQ2xhc3MoZHJvcGRvd24sYWN0aXZlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgXG4gICAgICBib290c3RyYXBDdXN0b21FdmVudC5jYWxsKGFjdGl2ZVRhYiwgaGlkZUV2ZW50LCBjb21wb25lbnQsIG5leHQpO1xuICAgICAgXG4gICAgICBpZiAoaGFzQ2xhc3MoYWN0aXZlQ29udGVudCwgJ2ZhZGUnKSkge1xuICAgICAgICByZW1vdmVDbGFzcyhhY3RpdmVDb250ZW50LGluQ2xhc3MpO1xuICAgICAgICBlbXVsYXRlVHJhbnNpdGlvbkVuZChhY3RpdmVDb250ZW50LCB0cmlnZ2VySGlkZSk7XG4gICAgICB9IGVsc2UgeyB0cmlnZ2VySGlkZSgpOyB9XG4gICAgfTtcbiAgXG4gICAgLy8gaW5pdFxuICAgIGlmICggIShzdHJpbmdUYWIgaW4gZWxlbWVudCkgKSB7IC8vIHByZXZlbnQgYWRkaW5nIGV2ZW50IGhhbmRsZXJzIHR3aWNlXG4gICAgICBvbihlbGVtZW50LCBjbGlja0V2ZW50LCBjbGlja0hhbmRsZXIpO1xuICAgIH1cbiAgICBpZiAoc2VsZltoZWlnaHRdKSB7IHRhYnNDb250ZW50Q29udGFpbmVyID0gZ2V0QWN0aXZlQ29udGVudCgpW3BhcmVudE5vZGVdOyB9XG4gICAgZWxlbWVudFtzdHJpbmdUYWJdID0gc2VsZjtcbiAgfTtcbiAgXG4gIC8vIFRBQiBEQVRBIEFQSVxuICAvLyA9PT09PT09PT09PT1cbiAgc3VwcG9ydHNbcHVzaF0oIFsgc3RyaW5nVGFiLCBUYWIsICdbJytkYXRhVG9nZ2xlKyc9XCJ0YWJcIl0nIF0gKTtcbiAgXG4gIFxuICAvKiBOYXRpdmUgSmF2YXNjcmlwdCBmb3IgQm9vdHN0cmFwIDMgfCBUb29sdGlwXG4gIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG4gIFxuICAvLyBUT09MVElQIERFRklOSVRJT05cbiAgLy8gPT09PT09PT09PT09PT09PT09XG4gIHZhciBUb29sdGlwID0gZnVuY3Rpb24oIGVsZW1lbnQsb3B0aW9ucyApIHtcbiAgXG4gICAgLy8gaW5pdGlhbGl6YXRpb24gZWxlbWVudFxuICAgIGVsZW1lbnQgPSBxdWVyeUVsZW1lbnQoZWxlbWVudCk7XG4gIFxuICAgIC8vIHNldCBvcHRpb25zXG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIFxuICAgIC8vIERBVEEgQVBJXG4gICAgdmFyIGFuaW1hdGlvbkRhdGEgPSBlbGVtZW50W2dldEF0dHJpYnV0ZV0oZGF0YUFuaW1hdGlvbiksXG4gICAgICAgIHBsYWNlbWVudERhdGEgPSBlbGVtZW50W2dldEF0dHJpYnV0ZV0oZGF0YVBsYWNlbWVudCksXG4gICAgICAgIGRlbGF5RGF0YSA9IGVsZW1lbnRbZ2V0QXR0cmlidXRlXShkYXRhRGVsYXkpLFxuICAgICAgICBjb250YWluZXJEYXRhID0gZWxlbWVudFtnZXRBdHRyaWJ1dGVdKGRhdGFDb250YWluZXIpLFxuICAgICAgICBcbiAgICAgICAgLy8gc3RyaW5nc1xuICAgICAgICBjb21wb25lbnQgPSAndG9vbHRpcCcsXG4gICAgICAgIGNsYXNzU3RyaW5nID0gJ2NsYXNzJyxcbiAgICAgICAgdGl0bGUgPSAndGl0bGUnLFxuICAgICAgICBmYWRlID0gJ2ZhZGUnLFxuICAgICAgICBkaXYgPSAnZGl2JyxcbiAgXG4gICAgICAgIC8vIGNoZWNrIGNvbnRhaW5lclxuICAgICAgICBjb250YWluZXJFbGVtZW50ID0gcXVlcnlFbGVtZW50KG9wdGlvbnNbY29udGFpbmVyXSksXG4gICAgICAgIGNvbnRhaW5lckRhdGFFbGVtZW50ID0gcXVlcnlFbGVtZW50KGNvbnRhaW5lckRhdGEpLCAgICAgICAgXG4gIFxuICAgICAgICAvLyBtYXliZSB0aGUgZWxlbWVudCBpcyBpbnNpZGUgYSBtb2RhbFxuICAgICAgICBtb2RhbCA9IGdldENsb3Nlc3QoZWxlbWVudCwnLm1vZGFsJyksXG4gICAgICAgIFxuICAgICAgICAvLyBtYXliZSB0aGUgZWxlbWVudCBpcyBpbnNpZGUgYSBmaXhlZCBuYXZiYXJcbiAgICAgICAgbmF2YmFyRml4ZWRUb3AgPSBnZXRDbG9zZXN0KGVsZW1lbnQsJy4nK2ZpeGVkVG9wKSxcbiAgICAgICAgbmF2YmFyRml4ZWRCb3R0b20gPSBnZXRDbG9zZXN0KGVsZW1lbnQsJy4nK2ZpeGVkQm90dG9tKTtcbiAgXG4gICAgLy8gc2V0IGluc3RhbmNlIG9wdGlvbnNcbiAgICB0aGlzW2FuaW1hdGlvbl0gPSBvcHRpb25zW2FuaW1hdGlvbl0gJiYgb3B0aW9uc1thbmltYXRpb25dICE9PSBmYWRlID8gb3B0aW9uc1thbmltYXRpb25dIDogYW5pbWF0aW9uRGF0YSB8fCBmYWRlO1xuICAgIHRoaXNbcGxhY2VtZW50XSA9IG9wdGlvbnNbcGxhY2VtZW50XSA/IG9wdGlvbnNbcGxhY2VtZW50XSA6IHBsYWNlbWVudERhdGEgfHwgdG9wO1xuICAgIHRoaXNbZGVsYXldID0gcGFyc2VJbnQob3B0aW9uc1tkZWxheV0gfHwgZGVsYXlEYXRhKSB8fCAyMDA7XG4gICAgdGhpc1tjb250YWluZXJdID0gY29udGFpbmVyRWxlbWVudCA/IGNvbnRhaW5lckVsZW1lbnQgXG4gICAgICAgICAgICAgICAgICAgIDogY29udGFpbmVyRGF0YUVsZW1lbnQgPyBjb250YWluZXJEYXRhRWxlbWVudCBcbiAgICAgICAgICAgICAgICAgICAgOiBuYXZiYXJGaXhlZFRvcCA/IG5hdmJhckZpeGVkVG9wXG4gICAgICAgICAgICAgICAgICAgIDogbmF2YmFyRml4ZWRCb3R0b20gPyBuYXZiYXJGaXhlZEJvdHRvbVxuICAgICAgICAgICAgICAgICAgICA6IG1vZGFsID8gbW9kYWwgOiBET0NbYm9keV07XG4gIFxuICAgIC8vIGJpbmQsIGV2ZW50IHRhcmdldHMsIHRpdGxlIGFuZCBjb25zdGFudHNcbiAgICB2YXIgc2VsZiA9IHRoaXMsIHRpbWVyID0gMCwgcGxhY2VtZW50U2V0dGluZyA9IHRoaXNbcGxhY2VtZW50XSwgdG9vbHRpcCA9IG51bGwsXG4gICAgICB0aXRsZVN0cmluZyA9IGVsZW1lbnRbZ2V0QXR0cmlidXRlXSh0aXRsZSkgfHwgZWxlbWVudFtnZXRBdHRyaWJ1dGVdKGRhdGFUaXRsZSkgfHwgZWxlbWVudFtnZXRBdHRyaWJ1dGVdKGRhdGFPcmlnaW5hbFRpdGxlKTtcbiAgXG4gICAgaWYgKCAhdGl0bGVTdHJpbmcgfHwgdGl0bGVTdHJpbmcgPT0gXCJcIiApIHJldHVybjsgLy8gaW52YWxpZGF0ZVxuICBcbiAgICAvLyBwcml2YXRlIG1ldGhvZHNcbiAgICB2YXIgcmVtb3ZlVG9vbFRpcCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBzZWxmW2NvbnRhaW5lcl0ucmVtb3ZlQ2hpbGQodG9vbHRpcCk7XG4gICAgICAgIHRvb2x0aXAgPSBudWxsOyB0aW1lciA9IG51bGw7XG4gICAgICB9LFxuICAgICAgY3JlYXRlVG9vbFRpcCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aXRsZVN0cmluZyA9IGVsZW1lbnRbZ2V0QXR0cmlidXRlXSh0aXRsZSkgfHwgZWxlbWVudFtnZXRBdHRyaWJ1dGVdKGRhdGFUaXRsZSkgfHwgZWxlbWVudFtnZXRBdHRyaWJ1dGVdKGRhdGFPcmlnaW5hbFRpdGxlKTsgLy8gcmVhZCB0aGUgdGl0bGUgYWdhaW5cbiAgICAgICAgaWYgKCAhdGl0bGVTdHJpbmcgfHwgdGl0bGVTdHJpbmcgPT0gXCJcIiApIHJldHVybiBmYWxzZTsgLy8gaW52YWxpZGF0ZVxuICAgICAgICBcbiAgICAgICAgdG9vbHRpcCA9IERPQ1tjcmVhdGVFbGVtZW50XShkaXYpO1xuICAgICAgICB0b29sdGlwW3NldEF0dHJpYnV0ZV0oJ3JvbGUnLGNvbXBvbmVudCk7XG4gIFxuICAgICAgICB2YXIgdG9vbHRpcEFycm93ID0gRE9DW2NyZWF0ZUVsZW1lbnRdKGRpdiksIHRvb2x0aXBJbm5lciA9IERPQ1tjcmVhdGVFbGVtZW50XShkaXYpO1xuICAgICAgICB0b29sdGlwQXJyb3dbc2V0QXR0cmlidXRlXShjbGFzc1N0cmluZywgY29tcG9uZW50KyctYXJyb3cnKTsgdG9vbHRpcElubmVyW3NldEF0dHJpYnV0ZV0oY2xhc3NTdHJpbmcsY29tcG9uZW50KyctaW5uZXInKTtcbiAgXG4gICAgICAgIHRvb2x0aXBbYXBwZW5kQ2hpbGRdKHRvb2x0aXBBcnJvdyk7IHRvb2x0aXBbYXBwZW5kQ2hpbGRdKHRvb2x0aXBJbm5lcik7XG4gIFxuICAgICAgICB0b29sdGlwSW5uZXJbaW5uZXJIVE1MXSA9IHRpdGxlU3RyaW5nO1xuICBcbiAgICAgICAgc2VsZltjb250YWluZXJdW2FwcGVuZENoaWxkXSh0b29sdGlwKTtcbiAgICAgICAgdG9vbHRpcFtzZXRBdHRyaWJ1dGVdKGNsYXNzU3RyaW5nLCBjb21wb25lbnQgKyAnICcgKyBwbGFjZW1lbnRTZXR0aW5nICsgJyAnICsgc2VsZlthbmltYXRpb25dKTtcbiAgICAgIH0sXG4gICAgICB1cGRhdGVUb29sdGlwID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBzdHlsZVRpcChlbGVtZW50LHRvb2x0aXAscGxhY2VtZW50U2V0dGluZyxzZWxmW2NvbnRhaW5lcl0pO1xuICAgICAgfSxcbiAgICAgIHNob3dUb29sdGlwID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAhaGFzQ2xhc3ModG9vbHRpcCxpbkNsYXNzKSAmJiAoIGFkZENsYXNzKHRvb2x0aXAsaW5DbGFzcykgKTtcbiAgICAgIH0sXG4gICAgICAvLyB0cmlnZ2Vyc1xuICAgICAgc2hvd1RyaWdnZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgYm9vdHN0cmFwQ3VzdG9tRXZlbnQuY2FsbChlbGVtZW50LCBzaG93bkV2ZW50LCBjb21wb25lbnQpO1xuICAgICAgICAhaXNJRTggJiYgb24oIGdsb2JhbE9iamVjdCwgcmVzaXplRXZlbnQsIHNlbGYuaGlkZSApOyAgICAgIFxuICAgICAgfSxcbiAgICAgIGhpZGVUcmlnZ2VyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICFpc0lFOCAmJiBvZmYoIGdsb2JhbE9iamVjdCwgcmVzaXplRXZlbnQsIHNlbGYuaGlkZSApOyAgICAgIFxuICAgICAgICByZW1vdmVUb29sVGlwKCk7XG4gICAgICAgIGJvb3RzdHJhcEN1c3RvbUV2ZW50LmNhbGwoZWxlbWVudCwgaGlkZGVuRXZlbnQsIGNvbXBvbmVudCk7XG4gICAgICB9O1xuICBcbiAgICAvLyBwdWJsaWMgbWV0aG9kc1xuICAgIHRoaXMuc2hvdyA9IGZ1bmN0aW9uKCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICAgIHRpbWVyID0gc2V0VGltZW91dCggZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0b29sdGlwID09PSBudWxsKSB7XG4gICAgICAgICAgcGxhY2VtZW50U2V0dGluZyA9IHNlbGZbcGxhY2VtZW50XTsgLy8gd2UgcmVzZXQgcGxhY2VtZW50IGluIGFsbCBjYXNlc1xuICAgICAgICAgIGlmKGNyZWF0ZVRvb2xUaXAoKSA9PSBmYWxzZSkgcmV0dXJuO1xuICAgICAgICAgIHVwZGF0ZVRvb2x0aXAoKTtcbiAgICAgICAgICBzaG93VG9vbHRpcCgpO1xuICAgICAgICAgIGJvb3RzdHJhcEN1c3RvbUV2ZW50LmNhbGwoZWxlbWVudCwgc2hvd0V2ZW50LCBjb21wb25lbnQpO1xuICAgICAgICAgICEhc2VsZlthbmltYXRpb25dID8gZW11bGF0ZVRyYW5zaXRpb25FbmQodG9vbHRpcCwgc2hvd1RyaWdnZXIpIDogc2hvd1RyaWdnZXIoKTtcbiAgICAgICAgfVxuICAgICAgfSwgMjAgKTtcbiAgICB9O1xuICAgIHRoaXMuaGlkZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICAgIHRpbWVyID0gc2V0VGltZW91dCggZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0b29sdGlwICYmIGhhc0NsYXNzKHRvb2x0aXAsaW5DbGFzcykpIHtcbiAgICAgICAgICBib290c3RyYXBDdXN0b21FdmVudC5jYWxsKGVsZW1lbnQsIGhpZGVFdmVudCwgY29tcG9uZW50KTtcbiAgICAgICAgICByZW1vdmVDbGFzcyh0b29sdGlwLGluQ2xhc3MpO1xuICAgICAgICAgICEhc2VsZlthbmltYXRpb25dID8gZW11bGF0ZVRyYW5zaXRpb25FbmQodG9vbHRpcCwgaGlkZVRyaWdnZXIpIDogaGlkZVRyaWdnZXIoKTtcbiAgICAgICAgfVxuICAgICAgfSwgc2VsZltkZWxheV0pO1xuICAgIH07XG4gICAgdGhpcy50b2dnbGUgPSBmdW5jdGlvbigpIHtcbiAgICAgIGlmICghdG9vbHRpcCkgeyBzZWxmLnNob3coKTsgfSBcbiAgICAgIGVsc2UgeyBzZWxmLmhpZGUoKTsgfVxuICAgIH07XG4gIFxuICAgIC8vIGluaXRcbiAgICBpZiAoICEoc3RyaW5nVG9vbHRpcCBpbiBlbGVtZW50KSApIHsgLy8gcHJldmVudCBhZGRpbmcgZXZlbnQgaGFuZGxlcnMgdHdpY2VcbiAgICAgIGVsZW1lbnRbc2V0QXR0cmlidXRlXShkYXRhT3JpZ2luYWxUaXRsZSx0aXRsZVN0cmluZyk7XG4gICAgICBlbGVtZW50LnJlbW92ZUF0dHJpYnV0ZSh0aXRsZSk7XG4gICAgICBvbihlbGVtZW50LCBtb3VzZUhvdmVyWzBdLCBzZWxmLnNob3cpO1xuICAgICAgb24oZWxlbWVudCwgbW91c2VIb3ZlclsxXSwgc2VsZi5oaWRlKTtcbiAgICB9XG4gICAgZWxlbWVudFtzdHJpbmdUb29sdGlwXSA9IHNlbGY7XG4gIH07XG4gIFxuICAvLyBUT09MVElQIERBVEEgQVBJXG4gIC8vID09PT09PT09PT09PT09PT09XG4gIHN1cHBvcnRzW3B1c2hdKCBbIHN0cmluZ1Rvb2x0aXAsIFRvb2x0aXAsICdbJytkYXRhVG9nZ2xlKyc9XCJ0b29sdGlwXCJdJyBdICk7XG4gIFxuICBcbiAgXG4gIC8qIE5hdGl2ZSBKYXZhc2NyaXB0IGZvciBCb290c3RyYXAgMyB8IEluaXRpYWxpemUgRGF0YSBBUElcbiAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuICB2YXIgaW5pdGlhbGl6ZURhdGFBUEkgPSBmdW5jdGlvbiggY29uc3RydWN0b3IsIGNvbGxlY3Rpb24gKXtcbiAgICAgIGZvciAodmFyIGk9MCwgbD1jb2xsZWN0aW9uW2xlbmd0aF07IGk8bDsgaSsrKSB7XG4gICAgICAgIG5ldyBjb25zdHJ1Y3Rvcihjb2xsZWN0aW9uW2ldKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGluaXRDYWxsYmFjayA9IEJTTi5pbml0Q2FsbGJhY2sgPSBmdW5jdGlvbihsb29rVXApe1xuICAgICAgbG9va1VwID0gbG9va1VwIHx8IERPQztcbiAgICAgIGZvciAodmFyIGk9MCwgbD1zdXBwb3J0c1tsZW5ndGhdOyBpPGw7IGkrKykge1xuICAgICAgICBpbml0aWFsaXplRGF0YUFQSSggc3VwcG9ydHNbaV1bMV0sIGxvb2tVcFtxdWVyeVNlbGVjdG9yQWxsXSAoc3VwcG9ydHNbaV1bMl0pICk7XG4gICAgICB9XG4gICAgfTtcbiAgXG4gIC8vIGJ1bGsgaW5pdGlhbGl6ZSBhbGwgY29tcG9uZW50c1xuICBET0NbYm9keV0gPyBpbml0Q2FsbGJhY2soKSA6IG9uKCBET0MsICdET01Db250ZW50TG9hZGVkJywgZnVuY3Rpb24oKXsgaW5pdENhbGxiYWNrKCk7IH0gKTtcbiAgXG4gIHJldHVybiB7XG4gICAgQWZmaXg6IEFmZml4LFxuICAgIEFsZXJ0OiBBbGVydCxcbiAgICBCdXR0b246IEJ1dHRvbixcbiAgICBDYXJvdXNlbDogQ2Fyb3VzZWwsXG4gICAgQ29sbGFwc2U6IENvbGxhcHNlLFxuICAgIERyb3Bkb3duOiBEcm9wZG93bixcbiAgICBNb2RhbDogTW9kYWwsXG4gICAgUG9wb3ZlcjogUG9wb3ZlcixcbiAgICBTY3JvbGxTcHk6IFNjcm9sbFNweSxcbiAgICBUYWI6IFRhYixcbiAgICBUb29sdGlwOiBUb29sdGlwXG4gIH07XG59KSk7XG4iXX0=
