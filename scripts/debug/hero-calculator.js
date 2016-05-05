/*! jQuery UI - v1.11.2 - 2014-10-23
* http://jqueryui.com
* Includes: core.js, widget.js, mouse.js, position.js, draggable.js, resizable.js, autocomplete.js, button.js, dialog.js, menu.js, spinner.js
* Copyright 2014 jQuery Foundation and other contributors; Licensed MIT */

(function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define([ "jquery" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
}(function( $ ) {
/*!
 * jQuery UI Core 1.11.2
 * http://jqueryui.com
 *
 * Copyright 2014 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/category/ui-core/
 */


// $.ui might exist from components with no dependencies, e.g., $.ui.position
$.ui = $.ui || {};

$.extend( $.ui, {
	version: "1.11.2",

	keyCode: {
		BACKSPACE: 8,
		COMMA: 188,
		DELETE: 46,
		DOWN: 40,
		END: 35,
		ENTER: 13,
		ESCAPE: 27,
		HOME: 36,
		LEFT: 37,
		PAGE_DOWN: 34,
		PAGE_UP: 33,
		PERIOD: 190,
		RIGHT: 39,
		SPACE: 32,
		TAB: 9,
		UP: 38
	}
});

// plugins
$.fn.extend({
	scrollParent: function( includeHidden ) {
		var position = this.css( "position" ),
			excludeStaticParent = position === "absolute",
			overflowRegex = includeHidden ? /(auto|scroll|hidden)/ : /(auto|scroll)/,
			scrollParent = this.parents().filter( function() {
				var parent = $( this );
				if ( excludeStaticParent && parent.css( "position" ) === "static" ) {
					return false;
				}
				return overflowRegex.test( parent.css( "overflow" ) + parent.css( "overflow-y" ) + parent.css( "overflow-x" ) );
			}).eq( 0 );

		return position === "fixed" || !scrollParent.length ? $( this[ 0 ].ownerDocument || document ) : scrollParent;
	},

	uniqueId: (function() {
		var uuid = 0;

		return function() {
			return this.each(function() {
				if ( !this.id ) {
					this.id = "ui-id-" + ( ++uuid );
				}
			});
		};
	})(),

	removeUniqueId: function() {
		return this.each(function() {
			if ( /^ui-id-\d+$/.test( this.id ) ) {
				$( this ).removeAttr( "id" );
			}
		});
	}
});

// selectors
function focusable( element, isTabIndexNotNaN ) {
	var map, mapName, img,
		nodeName = element.nodeName.toLowerCase();
	if ( "area" === nodeName ) {
		map = element.parentNode;
		mapName = map.name;
		if ( !element.href || !mapName || map.nodeName.toLowerCase() !== "map" ) {
			return false;
		}
		img = $( "img[usemap='#" + mapName + "']" )[ 0 ];
		return !!img && visible( img );
	}
	return ( /input|select|textarea|button|object/.test( nodeName ) ?
		!element.disabled :
		"a" === nodeName ?
			element.href || isTabIndexNotNaN :
			isTabIndexNotNaN) &&
		// the element and all of its ancestors must be visible
		visible( element );
}

function visible( element ) {
	return $.expr.filters.visible( element ) &&
		!$( element ).parents().addBack().filter(function() {
			return $.css( this, "visibility" ) === "hidden";
		}).length;
}

$.extend( $.expr[ ":" ], {
	data: $.expr.createPseudo ?
		$.expr.createPseudo(function( dataName ) {
			return function( elem ) {
				return !!$.data( elem, dataName );
			};
		}) :
		// support: jQuery <1.8
		function( elem, i, match ) {
			return !!$.data( elem, match[ 3 ] );
		},

	focusable: function( element ) {
		return focusable( element, !isNaN( $.attr( element, "tabindex" ) ) );
	},

	tabbable: function( element ) {
		var tabIndex = $.attr( element, "tabindex" ),
			isTabIndexNaN = isNaN( tabIndex );
		return ( isTabIndexNaN || tabIndex >= 0 ) && focusable( element, !isTabIndexNaN );
	}
});

// support: jQuery <1.8
if ( !$( "<a>" ).outerWidth( 1 ).jquery ) {
	$.each( [ "Width", "Height" ], function( i, name ) {
		var side = name === "Width" ? [ "Left", "Right" ] : [ "Top", "Bottom" ],
			type = name.toLowerCase(),
			orig = {
				innerWidth: $.fn.innerWidth,
				innerHeight: $.fn.innerHeight,
				outerWidth: $.fn.outerWidth,
				outerHeight: $.fn.outerHeight
			};

		function reduce( elem, size, border, margin ) {
			$.each( side, function() {
				size -= parseFloat( $.css( elem, "padding" + this ) ) || 0;
				if ( border ) {
					size -= parseFloat( $.css( elem, "border" + this + "Width" ) ) || 0;
				}
				if ( margin ) {
					size -= parseFloat( $.css( elem, "margin" + this ) ) || 0;
				}
			});
			return size;
		}

		$.fn[ "inner" + name ] = function( size ) {
			if ( size === undefined ) {
				return orig[ "inner" + name ].call( this );
			}

			return this.each(function() {
				$( this ).css( type, reduce( this, size ) + "px" );
			});
		};

		$.fn[ "outer" + name] = function( size, margin ) {
			if ( typeof size !== "number" ) {
				return orig[ "outer" + name ].call( this, size );
			}

			return this.each(function() {
				$( this).css( type, reduce( this, size, true, margin ) + "px" );
			});
		};
	});
}

// support: jQuery <1.8
if ( !$.fn.addBack ) {
	$.fn.addBack = function( selector ) {
		return this.add( selector == null ?
			this.prevObject : this.prevObject.filter( selector )
		);
	};
}

// support: jQuery 1.6.1, 1.6.2 (http://bugs.jquery.com/ticket/9413)
if ( $( "<a>" ).data( "a-b", "a" ).removeData( "a-b" ).data( "a-b" ) ) {
	$.fn.removeData = (function( removeData ) {
		return function( key ) {
			if ( arguments.length ) {
				return removeData.call( this, $.camelCase( key ) );
			} else {
				return removeData.call( this );
			}
		};
	})( $.fn.removeData );
}

// deprecated
$.ui.ie = !!/msie [\w.]+/.exec( navigator.userAgent.toLowerCase() );

$.fn.extend({
	focus: (function( orig ) {
		return function( delay, fn ) {
			return typeof delay === "number" ?
				this.each(function() {
					var elem = this;
					setTimeout(function() {
						$( elem ).focus();
						if ( fn ) {
							fn.call( elem );
						}
					}, delay );
				}) :
				orig.apply( this, arguments );
		};
	})( $.fn.focus ),

	disableSelection: (function() {
		var eventType = "onselectstart" in document.createElement( "div" ) ?
			"selectstart" :
			"mousedown";

		return function() {
			return this.bind( eventType + ".ui-disableSelection", function( event ) {
				event.preventDefault();
			});
		};
	})(),

	enableSelection: function() {
		return this.unbind( ".ui-disableSelection" );
	},

	zIndex: function( zIndex ) {
		if ( zIndex !== undefined ) {
			return this.css( "zIndex", zIndex );
		}

		if ( this.length ) {
			var elem = $( this[ 0 ] ), position, value;
			while ( elem.length && elem[ 0 ] !== document ) {
				// Ignore z-index if position is set to a value where z-index is ignored by the browser
				// This makes behavior of this function consistent across browsers
				// WebKit always returns auto if the element is positioned
				position = elem.css( "position" );
				if ( position === "absolute" || position === "relative" || position === "fixed" ) {
					// IE returns 0 when zIndex is not specified
					// other browsers return a string
					// we ignore the case of nested elements with an explicit value of 0
					// <div style="z-index: -10;"><div style="z-index: 0;"></div></div>
					value = parseInt( elem.css( "zIndex" ), 10 );
					if ( !isNaN( value ) && value !== 0 ) {
						return value;
					}
				}
				elem = elem.parent();
			}
		}

		return 0;
	}
});

// $.ui.plugin is deprecated. Use $.widget() extensions instead.
$.ui.plugin = {
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

		if ( !allowDisconnected && ( !instance.element[ 0 ].parentNode || instance.element[ 0 ].parentNode.nodeType === 11 ) ) {
			return;
		}

		for ( i = 0; i < set.length; i++ ) {
			if ( instance.options[ set[ i ][ 0 ] ] ) {
				set[ i ][ 1 ].apply( instance.element, args );
			}
		}
	}
};


/*!
 * jQuery UI Widget 1.11.2
 * http://jqueryui.com
 *
 * Copyright 2014 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/jQuery.widget/
 */


var widget_uuid = 0,
	widget_slice = Array.prototype.slice;

$.cleanData = (function( orig ) {
	return function( elems ) {
		var events, elem, i;
		for ( i = 0; (elem = elems[i]) != null; i++ ) {
			try {

				// Only trigger remove when necessary to save time
				events = $._data( elem, "events" );
				if ( events && events.remove ) {
					$( elem ).triggerHandler( "remove" );
				}

			// http://bugs.jquery.com/ticket/8235
			} catch ( e ) {}
		}
		orig( elems );
	};
})( $.cleanData );

$.widget = function( name, base, prototype ) {
	var fullName, existingConstructor, constructor, basePrototype,
		// proxiedPrototype allows the provided prototype to remain unmodified
		// so that it can be used as a mixin for multiple widgets (#8876)
		proxiedPrototype = {},
		namespace = name.split( "." )[ 0 ];

	name = name.split( "." )[ 1 ];
	fullName = namespace + "-" + name;

	if ( !prototype ) {
		prototype = base;
		base = $.Widget;
	}

	// create selector for plugin
	$.expr[ ":" ][ fullName.toLowerCase() ] = function( elem ) {
		return !!$.data( elem, fullName );
	};

	$[ namespace ] = $[ namespace ] || {};
	existingConstructor = $[ namespace ][ name ];
	constructor = $[ namespace ][ name ] = function( options, element ) {
		// allow instantiation without "new" keyword
		if ( !this._createWidget ) {
			return new constructor( options, element );
		}

		// allow instantiation without initializing for simple inheritance
		// must use "new" keyword (the code above always passes args)
		if ( arguments.length ) {
			this._createWidget( options, element );
		}
	};
	// extend with the existing constructor to carry over any static properties
	$.extend( constructor, existingConstructor, {
		version: prototype.version,
		// copy the object used to create the prototype in case we need to
		// redefine the widget later
		_proto: $.extend( {}, prototype ),
		// track widgets that inherit from this widget in case this widget is
		// redefined after a widget inherits from it
		_childConstructors: []
	});

	basePrototype = new base();
	// we need to make the options hash a property directly on the new instance
	// otherwise we'll modify the options hash on the prototype that we're
	// inheriting from
	basePrototype.options = $.widget.extend( {}, basePrototype.options );
	$.each( prototype, function( prop, value ) {
		if ( !$.isFunction( value ) ) {
			proxiedPrototype[ prop ] = value;
			return;
		}
		proxiedPrototype[ prop ] = (function() {
			var _super = function() {
					return base.prototype[ prop ].apply( this, arguments );
				},
				_superApply = function( args ) {
					return base.prototype[ prop ].apply( this, args );
				};
			return function() {
				var __super = this._super,
					__superApply = this._superApply,
					returnValue;

				this._super = _super;
				this._superApply = _superApply;

				returnValue = value.apply( this, arguments );

				this._super = __super;
				this._superApply = __superApply;

				return returnValue;
			};
		})();
	});
	constructor.prototype = $.widget.extend( basePrototype, {
		// TODO: remove support for widgetEventPrefix
		// always use the name + a colon as the prefix, e.g., draggable:start
		// don't prefix for widgets that aren't DOM-based
		widgetEventPrefix: existingConstructor ? (basePrototype.widgetEventPrefix || name) : name
	}, proxiedPrototype, {
		constructor: constructor,
		namespace: namespace,
		widgetName: name,
		widgetFullName: fullName
	});

	// If this widget is being redefined then we need to find all widgets that
	// are inheriting from it and redefine all of them so that they inherit from
	// the new version of this widget. We're essentially trying to replace one
	// level in the prototype chain.
	if ( existingConstructor ) {
		$.each( existingConstructor._childConstructors, function( i, child ) {
			var childPrototype = child.prototype;

			// redefine the child widget using the same prototype that was
			// originally used, but inherit from the new version of the base
			$.widget( childPrototype.namespace + "." + childPrototype.widgetName, constructor, child._proto );
		});
		// remove the list of existing child constructors from the old constructor
		// so the old child constructors can be garbage collected
		delete existingConstructor._childConstructors;
	} else {
		base._childConstructors.push( constructor );
	}

	$.widget.bridge( name, constructor );

	return constructor;
};

$.widget.extend = function( target ) {
	var input = widget_slice.call( arguments, 1 ),
		inputIndex = 0,
		inputLength = input.length,
		key,
		value;
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
		var isMethodCall = typeof options === "string",
			args = widget_slice.call( arguments, 1 ),
			returnValue = this;

		// allow multiple hashes to be passed on init
		options = !isMethodCall && args.length ?
			$.widget.extend.apply( null, [ options ].concat(args) ) :
			options;

		if ( isMethodCall ) {
			this.each(function() {
				var methodValue,
					instance = $.data( this, fullName );
				if ( options === "instance" ) {
					returnValue = instance;
					return false;
				}
				if ( !instance ) {
					return $.error( "cannot call methods on " + name + " prior to initialization; " +
						"attempted to call method '" + options + "'" );
				}
				if ( !$.isFunction( instance[options] ) || options.charAt( 0 ) === "_" ) {
					return $.error( "no such method '" + options + "' for " + name + " widget instance" );
				}
				methodValue = instance[ options ].apply( instance, args );
				if ( methodValue !== instance && methodValue !== undefined ) {
					returnValue = methodValue && methodValue.jquery ?
						returnValue.pushStack( methodValue.get() ) :
						methodValue;
					return false;
				}
			});
		} else {
			this.each(function() {
				var instance = $.data( this, fullName );
				if ( instance ) {
					instance.option( options || {} );
					if ( instance._init ) {
						instance._init();
					}
				} else {
					$.data( this, fullName, new object( options, this ) );
				}
			});
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
		disabled: false,

		// callbacks
		create: null
	},
	_createWidget: function( options, element ) {
		element = $( element || this.defaultElement || this )[ 0 ];
		this.element = $( element );
		this.uuid = widget_uuid++;
		this.eventNamespace = "." + this.widgetName + this.uuid;

		this.bindings = $();
		this.hoverable = $();
		this.focusable = $();

		if ( element !== this ) {
			$.data( element, this.widgetFullName, this );
			this._on( true, this.element, {
				remove: function( event ) {
					if ( event.target === element ) {
						this.destroy();
					}
				}
			});
			this.document = $( element.style ?
				// element within the document
				element.ownerDocument :
				// element is window or document
				element.document || element );
			this.window = $( this.document[0].defaultView || this.document[0].parentWindow );
		}

		this.options = $.widget.extend( {},
			this.options,
			this._getCreateOptions(),
			options );

		this._create();
		this._trigger( "create", null, this._getCreateEventData() );
		this._init();
	},
	_getCreateOptions: $.noop,
	_getCreateEventData: $.noop,
	_create: $.noop,
	_init: $.noop,

	destroy: function() {
		this._destroy();
		// we can probably remove the unbind calls in 2.0
		// all event bindings should go through this._on()
		this.element
			.unbind( this.eventNamespace )
			.removeData( this.widgetFullName )
			// support: jquery <1.6.3
			// http://bugs.jquery.com/ticket/9413
			.removeData( $.camelCase( this.widgetFullName ) );
		this.widget()
			.unbind( this.eventNamespace )
			.removeAttr( "aria-disabled" )
			.removeClass(
				this.widgetFullName + "-disabled " +
				"ui-state-disabled" );

		// clean up events and states
		this.bindings.unbind( this.eventNamespace );
		this.hoverable.removeClass( "ui-state-hover" );
		this.focusable.removeClass( "ui-state-focus" );
	},
	_destroy: $.noop,

	widget: function() {
		return this.element;
	},

	option: function( key, value ) {
		var options = key,
			parts,
			curOption,
			i;

		if ( arguments.length === 0 ) {
			// don't return a reference to the internal hash
			return $.widget.extend( {}, this.options );
		}

		if ( typeof key === "string" ) {
			// handle nested keys, e.g., "foo.bar" => { foo: { bar: ___ } }
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
		this.options[ key ] = value;

		if ( key === "disabled" ) {
			this.widget()
				.toggleClass( this.widgetFullName + "-disabled", !!value );

			// If the widget is becoming disabled, then nothing is interactive
			if ( value ) {
				this.hoverable.removeClass( "ui-state-hover" );
				this.focusable.removeClass( "ui-state-focus" );
			}
		}

		return this;
	},

	enable: function() {
		return this._setOptions({ disabled: false });
	},
	disable: function() {
		return this._setOptions({ disabled: true });
	},

	_on: function( suppressDisabledCheck, element, handlers ) {
		var delegateElement,
			instance = this;

		// no suppressDisabledCheck flag, shuffle arguments
		if ( typeof suppressDisabledCheck !== "boolean" ) {
			handlers = element;
			element = suppressDisabledCheck;
			suppressDisabledCheck = false;
		}

		// no element argument, shuffle and use this.element
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
				// allow widgets to customize the disabled handling
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

			// copy the guid so direct unbinding works
			if ( typeof handler !== "string" ) {
				handlerProxy.guid = handler.guid =
					handler.guid || handlerProxy.guid || $.guid++;
			}

			var match = event.match( /^([\w:-]*)\s*(.*)$/ ),
				eventName = match[1] + instance.eventNamespace,
				selector = match[2];
			if ( selector ) {
				delegateElement.delegate( selector, eventName, handlerProxy );
			} else {
				element.bind( eventName, handlerProxy );
			}
		});
	},

	_off: function( element, eventName ) {
		eventName = (eventName || "").split( " " ).join( this.eventNamespace + " " ) +
			this.eventNamespace;
		element.unbind( eventName ).undelegate( eventName );

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
				$( event.currentTarget ).addClass( "ui-state-hover" );
			},
			mouseleave: function( event ) {
				$( event.currentTarget ).removeClass( "ui-state-hover" );
			}
		});
	},

	_focusable: function( element ) {
		this.focusable = this.focusable.add( element );
		this._on( element, {
			focusin: function( event ) {
				$( event.currentTarget ).addClass( "ui-state-focus" );
			},
			focusout: function( event ) {
				$( event.currentTarget ).removeClass( "ui-state-focus" );
			}
		});
	},

	_trigger: function( type, event, data ) {
		var prop, orig,
			callback = this.options[ type ];

		data = data || {};
		event = $.Event( event );
		event.type = ( type === this.widgetEventPrefix ?
			type :
			this.widgetEventPrefix + type ).toLowerCase();
		// the original event may come from any element
		// so we need to reset the target on the new event
		event.target = this.element[ 0 ];

		// copy original event properties over to the new event
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
			callback.apply( this.element[0], [ event ].concat( data ) ) === false ||
			event.isDefaultPrevented() );
	}
};

$.each( { show: "fadeIn", hide: "fadeOut" }, function( method, defaultEffect ) {
	$.Widget.prototype[ "_" + method ] = function( element, options, callback ) {
		if ( typeof options === "string" ) {
			options = { effect: options };
		}
		var hasOptions,
			effectName = !options ?
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
			element.queue(function( next ) {
				$( this )[ method ]();
				if ( callback ) {
					callback.call( element[ 0 ] );
				}
				next();
			});
		}
	};
});

var widget = $.widget;


/*!
 * jQuery UI Mouse 1.11.2
 * http://jqueryui.com
 *
 * Copyright 2014 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/mouse/
 */


var mouseHandled = false;
$( document ).mouseup( function() {
	mouseHandled = false;
});

var mouse = $.widget("ui.mouse", {
	version: "1.11.2",
	options: {
		cancel: "input,textarea,button,select,option",
		distance: 1,
		delay: 0
	},
	_mouseInit: function() {
		var that = this;

		this.element
			.bind("mousedown." + this.widgetName, function(event) {
				return that._mouseDown(event);
			})
			.bind("click." + this.widgetName, function(event) {
				if (true === $.data(event.target, that.widgetName + ".preventClickEvent")) {
					$.removeData(event.target, that.widgetName + ".preventClickEvent");
					event.stopImmediatePropagation();
					return false;
				}
			});

		this.started = false;
	},

	// TODO: make sure destroying one instance of mouse doesn't mess with
	// other instances of mouse
	_mouseDestroy: function() {
		this.element.unbind("." + this.widgetName);
		if ( this._mouseMoveDelegate ) {
			this.document
				.unbind("mousemove." + this.widgetName, this._mouseMoveDelegate)
				.unbind("mouseup." + this.widgetName, this._mouseUpDelegate);
		}
	},

	_mouseDown: function(event) {
		// don't let more than one widget handle mouseStart
		if ( mouseHandled ) {
			return;
		}

		this._mouseMoved = false;

		// we may have missed mouseup (out of window)
		(this._mouseStarted && this._mouseUp(event));

		this._mouseDownEvent = event;

		var that = this,
			btnIsLeft = (event.which === 1),
			// event.target.nodeName works around a bug in IE 8 with
			// disabled inputs (#7620)
			elIsCancel = (typeof this.options.cancel === "string" && event.target.nodeName ? $(event.target).closest(this.options.cancel).length : false);
		if (!btnIsLeft || elIsCancel || !this._mouseCapture(event)) {
			return true;
		}

		this.mouseDelayMet = !this.options.delay;
		if (!this.mouseDelayMet) {
			this._mouseDelayTimer = setTimeout(function() {
				that.mouseDelayMet = true;
			}, this.options.delay);
		}

		if (this._mouseDistanceMet(event) && this._mouseDelayMet(event)) {
			this._mouseStarted = (this._mouseStart(event) !== false);
			if (!this._mouseStarted) {
				event.preventDefault();
				return true;
			}
		}

		// Click event may never have fired (Gecko & Opera)
		if (true === $.data(event.target, this.widgetName + ".preventClickEvent")) {
			$.removeData(event.target, this.widgetName + ".preventClickEvent");
		}

		// these delegates are required to keep context
		this._mouseMoveDelegate = function(event) {
			return that._mouseMove(event);
		};
		this._mouseUpDelegate = function(event) {
			return that._mouseUp(event);
		};

		this.document
			.bind( "mousemove." + this.widgetName, this._mouseMoveDelegate )
			.bind( "mouseup." + this.widgetName, this._mouseUpDelegate );

		event.preventDefault();

		mouseHandled = true;
		return true;
	},

	_mouseMove: function(event) {
		// Only check for mouseups outside the document if you've moved inside the document
		// at least once. This prevents the firing of mouseup in the case of IE<9, which will
		// fire a mousemove event if content is placed under the cursor. See #7778
		// Support: IE <9
		if ( this._mouseMoved ) {
			// IE mouseup check - mouseup happened when mouse was out of window
			if ($.ui.ie && ( !document.documentMode || document.documentMode < 9 ) && !event.button) {
				return this._mouseUp(event);

			// Iframe mouseup check - mouseup occurred in another document
			} else if ( !event.which ) {
				return this._mouseUp( event );
			}
		}

		if ( event.which || event.button ) {
			this._mouseMoved = true;
		}

		if (this._mouseStarted) {
			this._mouseDrag(event);
			return event.preventDefault();
		}

		if (this._mouseDistanceMet(event) && this._mouseDelayMet(event)) {
			this._mouseStarted =
				(this._mouseStart(this._mouseDownEvent, event) !== false);
			(this._mouseStarted ? this._mouseDrag(event) : this._mouseUp(event));
		}

		return !this._mouseStarted;
	},

	_mouseUp: function(event) {
		this.document
			.unbind( "mousemove." + this.widgetName, this._mouseMoveDelegate )
			.unbind( "mouseup." + this.widgetName, this._mouseUpDelegate );

		if (this._mouseStarted) {
			this._mouseStarted = false;

			if (event.target === this._mouseDownEvent.target) {
				$.data(event.target, this.widgetName + ".preventClickEvent", true);
			}

			this._mouseStop(event);
		}

		mouseHandled = false;
		return false;
	},

	_mouseDistanceMet: function(event) {
		return (Math.max(
				Math.abs(this._mouseDownEvent.pageX - event.pageX),
				Math.abs(this._mouseDownEvent.pageY - event.pageY)
			) >= this.options.distance
		);
	},

	_mouseDelayMet: function(/* event */) {
		return this.mouseDelayMet;
	},

	// These are placeholder methods, to be overriden by extending plugin
	_mouseStart: function(/* event */) {},
	_mouseDrag: function(/* event */) {},
	_mouseStop: function(/* event */) {},
	_mouseCapture: function(/* event */) { return true; }
});


/*!
 * jQuery UI Position 1.11.2
 * http://jqueryui.com
 *
 * Copyright 2014 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/position/
 */

(function() {

$.ui = $.ui || {};

var cachedScrollbarWidth, supportsOffsetFractions,
	max = Math.max,
	abs = Math.abs,
	round = Math.round,
	rhorizontal = /left|center|right/,
	rvertical = /top|center|bottom/,
	roffset = /[\+\-]\d+(\.[\d]+)?%?/,
	rposition = /^\w+/,
	rpercent = /%$/,
	_position = $.fn.position;

function getOffsets( offsets, width, height ) {
	return [
		parseFloat( offsets[ 0 ] ) * ( rpercent.test( offsets[ 0 ] ) ? width / 100 : 1 ),
		parseFloat( offsets[ 1 ] ) * ( rpercent.test( offsets[ 1 ] ) ? height / 100 : 1 )
	];
}

function parseCss( element, property ) {
	return parseInt( $.css( element, property ), 10 ) || 0;
}

function getDimensions( elem ) {
	var raw = elem[0];
	if ( raw.nodeType === 9 ) {
		return {
			width: elem.width(),
			height: elem.height(),
			offset: { top: 0, left: 0 }
		};
	}
	if ( $.isWindow( raw ) ) {
		return {
			width: elem.width(),
			height: elem.height(),
			offset: { top: elem.scrollTop(), left: elem.scrollLeft() }
		};
	}
	if ( raw.preventDefault ) {
		return {
			width: 0,
			height: 0,
			offset: { top: raw.pageY, left: raw.pageX }
		};
	}
	return {
		width: elem.outerWidth(),
		height: elem.outerHeight(),
		offset: elem.offset()
	};
}

$.position = {
	scrollbarWidth: function() {
		if ( cachedScrollbarWidth !== undefined ) {
			return cachedScrollbarWidth;
		}
		var w1, w2,
			div = $( "<div style='display:block;position:absolute;width:50px;height:50px;overflow:hidden;'><div style='height:100px;width:auto;'></div></div>" ),
			innerDiv = div.children()[0];

		$( "body" ).append( div );
		w1 = innerDiv.offsetWidth;
		div.css( "overflow", "scroll" );

		w2 = innerDiv.offsetWidth;

		if ( w1 === w2 ) {
			w2 = div[0].clientWidth;
		}

		div.remove();

		return (cachedScrollbarWidth = w1 - w2);
	},
	getScrollInfo: function( within ) {
		var overflowX = within.isWindow || within.isDocument ? "" :
				within.element.css( "overflow-x" ),
			overflowY = within.isWindow || within.isDocument ? "" :
				within.element.css( "overflow-y" ),
			hasOverflowX = overflowX === "scroll" ||
				( overflowX === "auto" && within.width < within.element[0].scrollWidth ),
			hasOverflowY = overflowY === "scroll" ||
				( overflowY === "auto" && within.height < within.element[0].scrollHeight );
		return {
			width: hasOverflowY ? $.position.scrollbarWidth() : 0,
			height: hasOverflowX ? $.position.scrollbarWidth() : 0
		};
	},
	getWithinInfo: function( element ) {
		var withinElement = $( element || window ),
			isWindow = $.isWindow( withinElement[0] ),
			isDocument = !!withinElement[ 0 ] && withinElement[ 0 ].nodeType === 9;
		return {
			element: withinElement,
			isWindow: isWindow,
			isDocument: isDocument,
			offset: withinElement.offset() || { left: 0, top: 0 },
			scrollLeft: withinElement.scrollLeft(),
			scrollTop: withinElement.scrollTop(),

			// support: jQuery 1.6.x
			// jQuery 1.6 doesn't support .outerWidth/Height() on documents or windows
			width: isWindow || isDocument ? withinElement.width() : withinElement.outerWidth(),
			height: isWindow || isDocument ? withinElement.height() : withinElement.outerHeight()
		};
	}
};

$.fn.position = function( options ) {
	if ( !options || !options.of ) {
		return _position.apply( this, arguments );
	}

	// make a copy, we don't want to modify arguments
	options = $.extend( {}, options );

	var atOffset, targetWidth, targetHeight, targetOffset, basePosition, dimensions,
		target = $( options.of ),
		within = $.position.getWithinInfo( options.within ),
		scrollInfo = $.position.getScrollInfo( within ),
		collision = ( options.collision || "flip" ).split( " " ),
		offsets = {};

	dimensions = getDimensions( target );
	if ( target[0].preventDefault ) {
		// force left top to allow flipping
		options.at = "left top";
	}
	targetWidth = dimensions.width;
	targetHeight = dimensions.height;
	targetOffset = dimensions.offset;
	// clone to reuse original targetOffset later
	basePosition = $.extend( {}, targetOffset );

	// force my and at to have valid horizontal and vertical positions
	// if a value is missing or invalid, it will be converted to center
	$.each( [ "my", "at" ], function() {
		var pos = ( options[ this ] || "" ).split( " " ),
			horizontalOffset,
			verticalOffset;

		if ( pos.length === 1) {
			pos = rhorizontal.test( pos[ 0 ] ) ?
				pos.concat( [ "center" ] ) :
				rvertical.test( pos[ 0 ] ) ?
					[ "center" ].concat( pos ) :
					[ "center", "center" ];
		}
		pos[ 0 ] = rhorizontal.test( pos[ 0 ] ) ? pos[ 0 ] : "center";
		pos[ 1 ] = rvertical.test( pos[ 1 ] ) ? pos[ 1 ] : "center";

		// calculate offsets
		horizontalOffset = roffset.exec( pos[ 0 ] );
		verticalOffset = roffset.exec( pos[ 1 ] );
		offsets[ this ] = [
			horizontalOffset ? horizontalOffset[ 0 ] : 0,
			verticalOffset ? verticalOffset[ 0 ] : 0
		];

		// reduce to just the positions without the offsets
		options[ this ] = [
			rposition.exec( pos[ 0 ] )[ 0 ],
			rposition.exec( pos[ 1 ] )[ 0 ]
		];
	});

	// normalize collision option
	if ( collision.length === 1 ) {
		collision[ 1 ] = collision[ 0 ];
	}

	if ( options.at[ 0 ] === "right" ) {
		basePosition.left += targetWidth;
	} else if ( options.at[ 0 ] === "center" ) {
		basePosition.left += targetWidth / 2;
	}

	if ( options.at[ 1 ] === "bottom" ) {
		basePosition.top += targetHeight;
	} else if ( options.at[ 1 ] === "center" ) {
		basePosition.top += targetHeight / 2;
	}

	atOffset = getOffsets( offsets.at, targetWidth, targetHeight );
	basePosition.left += atOffset[ 0 ];
	basePosition.top += atOffset[ 1 ];

	return this.each(function() {
		var collisionPosition, using,
			elem = $( this ),
			elemWidth = elem.outerWidth(),
			elemHeight = elem.outerHeight(),
			marginLeft = parseCss( this, "marginLeft" ),
			marginTop = parseCss( this, "marginTop" ),
			collisionWidth = elemWidth + marginLeft + parseCss( this, "marginRight" ) + scrollInfo.width,
			collisionHeight = elemHeight + marginTop + parseCss( this, "marginBottom" ) + scrollInfo.height,
			position = $.extend( {}, basePosition ),
			myOffset = getOffsets( offsets.my, elem.outerWidth(), elem.outerHeight() );

		if ( options.my[ 0 ] === "right" ) {
			position.left -= elemWidth;
		} else if ( options.my[ 0 ] === "center" ) {
			position.left -= elemWidth / 2;
		}

		if ( options.my[ 1 ] === "bottom" ) {
			position.top -= elemHeight;
		} else if ( options.my[ 1 ] === "center" ) {
			position.top -= elemHeight / 2;
		}

		position.left += myOffset[ 0 ];
		position.top += myOffset[ 1 ];

		// if the browser doesn't support fractions, then round for consistent results
		if ( !supportsOffsetFractions ) {
			position.left = round( position.left );
			position.top = round( position.top );
		}

		collisionPosition = {
			marginLeft: marginLeft,
			marginTop: marginTop
		};

		$.each( [ "left", "top" ], function( i, dir ) {
			if ( $.ui.position[ collision[ i ] ] ) {
				$.ui.position[ collision[ i ] ][ dir ]( position, {
					targetWidth: targetWidth,
					targetHeight: targetHeight,
					elemWidth: elemWidth,
					elemHeight: elemHeight,
					collisionPosition: collisionPosition,
					collisionWidth: collisionWidth,
					collisionHeight: collisionHeight,
					offset: [ atOffset[ 0 ] + myOffset[ 0 ], atOffset [ 1 ] + myOffset[ 1 ] ],
					my: options.my,
					at: options.at,
					within: within,
					elem: elem
				});
			}
		});

		if ( options.using ) {
			// adds feedback as second argument to using callback, if present
			using = function( props ) {
				var left = targetOffset.left - position.left,
					right = left + targetWidth - elemWidth,
					top = targetOffset.top - position.top,
					bottom = top + targetHeight - elemHeight,
					feedback = {
						target: {
							element: target,
							left: targetOffset.left,
							top: targetOffset.top,
							width: targetWidth,
							height: targetHeight
						},
						element: {
							element: elem,
							left: position.left,
							top: position.top,
							width: elemWidth,
							height: elemHeight
						},
						horizontal: right < 0 ? "left" : left > 0 ? "right" : "center",
						vertical: bottom < 0 ? "top" : top > 0 ? "bottom" : "middle"
					};
				if ( targetWidth < elemWidth && abs( left + right ) < targetWidth ) {
					feedback.horizontal = "center";
				}
				if ( targetHeight < elemHeight && abs( top + bottom ) < targetHeight ) {
					feedback.vertical = "middle";
				}
				if ( max( abs( left ), abs( right ) ) > max( abs( top ), abs( bottom ) ) ) {
					feedback.important = "horizontal";
				} else {
					feedback.important = "vertical";
				}
				options.using.call( this, props, feedback );
			};
		}

		elem.offset( $.extend( position, { using: using } ) );
	});
};

$.ui.position = {
	fit: {
		left: function( position, data ) {
			var within = data.within,
				withinOffset = within.isWindow ? within.scrollLeft : within.offset.left,
				outerWidth = within.width,
				collisionPosLeft = position.left - data.collisionPosition.marginLeft,
				overLeft = withinOffset - collisionPosLeft,
				overRight = collisionPosLeft + data.collisionWidth - outerWidth - withinOffset,
				newOverRight;

			// element is wider than within
			if ( data.collisionWidth > outerWidth ) {
				// element is initially over the left side of within
				if ( overLeft > 0 && overRight <= 0 ) {
					newOverRight = position.left + overLeft + data.collisionWidth - outerWidth - withinOffset;
					position.left += overLeft - newOverRight;
				// element is initially over right side of within
				} else if ( overRight > 0 && overLeft <= 0 ) {
					position.left = withinOffset;
				// element is initially over both left and right sides of within
				} else {
					if ( overLeft > overRight ) {
						position.left = withinOffset + outerWidth - data.collisionWidth;
					} else {
						position.left = withinOffset;
					}
				}
			// too far left -> align with left edge
			} else if ( overLeft > 0 ) {
				position.left += overLeft;
			// too far right -> align with right edge
			} else if ( overRight > 0 ) {
				position.left -= overRight;
			// adjust based on position and margin
			} else {
				position.left = max( position.left - collisionPosLeft, position.left );
			}
		},
		top: function( position, data ) {
			var within = data.within,
				withinOffset = within.isWindow ? within.scrollTop : within.offset.top,
				outerHeight = data.within.height,
				collisionPosTop = position.top - data.collisionPosition.marginTop,
				overTop = withinOffset - collisionPosTop,
				overBottom = collisionPosTop + data.collisionHeight - outerHeight - withinOffset,
				newOverBottom;

			// element is taller than within
			if ( data.collisionHeight > outerHeight ) {
				// element is initially over the top of within
				if ( overTop > 0 && overBottom <= 0 ) {
					newOverBottom = position.top + overTop + data.collisionHeight - outerHeight - withinOffset;
					position.top += overTop - newOverBottom;
				// element is initially over bottom of within
				} else if ( overBottom > 0 && overTop <= 0 ) {
					position.top = withinOffset;
				// element is initially over both top and bottom of within
				} else {
					if ( overTop > overBottom ) {
						position.top = withinOffset + outerHeight - data.collisionHeight;
					} else {
						position.top = withinOffset;
					}
				}
			// too far up -> align with top
			} else if ( overTop > 0 ) {
				position.top += overTop;
			// too far down -> align with bottom edge
			} else if ( overBottom > 0 ) {
				position.top -= overBottom;
			// adjust based on position and margin
			} else {
				position.top = max( position.top - collisionPosTop, position.top );
			}
		}
	},
	flip: {
		left: function( position, data ) {
			var within = data.within,
				withinOffset = within.offset.left + within.scrollLeft,
				outerWidth = within.width,
				offsetLeft = within.isWindow ? within.scrollLeft : within.offset.left,
				collisionPosLeft = position.left - data.collisionPosition.marginLeft,
				overLeft = collisionPosLeft - offsetLeft,
				overRight = collisionPosLeft + data.collisionWidth - outerWidth - offsetLeft,
				myOffset = data.my[ 0 ] === "left" ?
					-data.elemWidth :
					data.my[ 0 ] === "right" ?
						data.elemWidth :
						0,
				atOffset = data.at[ 0 ] === "left" ?
					data.targetWidth :
					data.at[ 0 ] === "right" ?
						-data.targetWidth :
						0,
				offset = -2 * data.offset[ 0 ],
				newOverRight,
				newOverLeft;

			if ( overLeft < 0 ) {
				newOverRight = position.left + myOffset + atOffset + offset + data.collisionWidth - outerWidth - withinOffset;
				if ( newOverRight < 0 || newOverRight < abs( overLeft ) ) {
					position.left += myOffset + atOffset + offset;
				}
			} else if ( overRight > 0 ) {
				newOverLeft = position.left - data.collisionPosition.marginLeft + myOffset + atOffset + offset - offsetLeft;
				if ( newOverLeft > 0 || abs( newOverLeft ) < overRight ) {
					position.left += myOffset + atOffset + offset;
				}
			}
		},
		top: function( position, data ) {
			var within = data.within,
				withinOffset = within.offset.top + within.scrollTop,
				outerHeight = within.height,
				offsetTop = within.isWindow ? within.scrollTop : within.offset.top,
				collisionPosTop = position.top - data.collisionPosition.marginTop,
				overTop = collisionPosTop - offsetTop,
				overBottom = collisionPosTop + data.collisionHeight - outerHeight - offsetTop,
				top = data.my[ 1 ] === "top",
				myOffset = top ?
					-data.elemHeight :
					data.my[ 1 ] === "bottom" ?
						data.elemHeight :
						0,
				atOffset = data.at[ 1 ] === "top" ?
					data.targetHeight :
					data.at[ 1 ] === "bottom" ?
						-data.targetHeight :
						0,
				offset = -2 * data.offset[ 1 ],
				newOverTop,
				newOverBottom;
			if ( overTop < 0 ) {
				newOverBottom = position.top + myOffset + atOffset + offset + data.collisionHeight - outerHeight - withinOffset;
				if ( ( position.top + myOffset + atOffset + offset) > overTop && ( newOverBottom < 0 || newOverBottom < abs( overTop ) ) ) {
					position.top += myOffset + atOffset + offset;
				}
			} else if ( overBottom > 0 ) {
				newOverTop = position.top - data.collisionPosition.marginTop + myOffset + atOffset + offset - offsetTop;
				if ( ( position.top + myOffset + atOffset + offset) > overBottom && ( newOverTop > 0 || abs( newOverTop ) < overBottom ) ) {
					position.top += myOffset + atOffset + offset;
				}
			}
		}
	},
	flipfit: {
		left: function() {
			$.ui.position.flip.left.apply( this, arguments );
			$.ui.position.fit.left.apply( this, arguments );
		},
		top: function() {
			$.ui.position.flip.top.apply( this, arguments );
			$.ui.position.fit.top.apply( this, arguments );
		}
	}
};

// fraction support test
(function() {
	var testElement, testElementParent, testElementStyle, offsetLeft, i,
		body = document.getElementsByTagName( "body" )[ 0 ],
		div = document.createElement( "div" );

	//Create a "fake body" for testing based on method used in jQuery.support
	testElement = document.createElement( body ? "div" : "body" );
	testElementStyle = {
		visibility: "hidden",
		width: 0,
		height: 0,
		border: 0,
		margin: 0,
		background: "none"
	};
	if ( body ) {
		$.extend( testElementStyle, {
			position: "absolute",
			left: "-1000px",
			top: "-1000px"
		});
	}
	for ( i in testElementStyle ) {
		testElement.style[ i ] = testElementStyle[ i ];
	}
	testElement.appendChild( div );
	testElementParent = body || document.documentElement;
	testElementParent.insertBefore( testElement, testElementParent.firstChild );

	div.style.cssText = "position: absolute; left: 10.7432222px;";

	offsetLeft = $( div ).offset().left;
	supportsOffsetFractions = offsetLeft > 10 && offsetLeft < 11;

	testElement.innerHTML = "";
	testElementParent.removeChild( testElement );
})();

})();

var position = $.ui.position;


/*!
 * jQuery UI Draggable 1.11.2
 * http://jqueryui.com
 *
 * Copyright 2014 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/draggable/
 */


$.widget("ui.draggable", $.ui.mouse, {
	version: "1.11.2",
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

		// callbacks
		drag: null,
		start: null,
		stop: null
	},
	_create: function() {

		if ( this.options.helper === "original" ) {
			this._setPositionRelative();
		}
		if (this.options.addClasses){
			this.element.addClass("ui-draggable");
		}
		if (this.options.disabled){
			this.element.addClass("ui-draggable-disabled");
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
		this.element.removeClass( "ui-draggable ui-draggable-dragging ui-draggable-disabled" );
		this._removeHandleClassName();
		this._mouseDestroy();
	},

	_mouseCapture: function(event) {
		var o = this.options;

		this._blurActiveElement( event );

		// among others, prevent a drag on a resizable-handle
		if (this.helper || o.disabled || $(event.target).closest(".ui-resizable-handle").length > 0) {
			return false;
		}

		//Quit if we're not on a valid handle
		this.handle = this._getHandle(event);
		if (!this.handle) {
			return false;
		}

		this._blockFrames( o.iframeFix === true ? "iframe" : o.iframeFix );

		return true;

	},

	_blockFrames: function( selector ) {
		this.iframeBlocks = this.document.find( selector ).map(function() {
			var iframe = $( this );

			return $( "<div>" )
				.css( "position", "absolute" )
				.appendTo( iframe.parent() )
				.outerWidth( iframe.outerWidth() )
				.outerHeight( iframe.outerHeight() )
				.offset( iframe.offset() )[ 0 ];
		});
	},

	_unblockFrames: function() {
		if ( this.iframeBlocks ) {
			this.iframeBlocks.remove();
			delete this.iframeBlocks;
		}
	},

	_blurActiveElement: function( event ) {
		var document = this.document[ 0 ];

		// Only need to blur if the event occurred on the draggable itself, see #10527
		if ( !this.handleElement.is( event.target ) ) {
			return;
		}

		// support: IE9
		// IE9 throws an "Unspecified error" accessing document.activeElement from an <iframe>
		try {

			// Support: IE9, IE10
			// If the <body> is blurred, IE will switch windows, see #9520
			if ( document.activeElement && document.activeElement.nodeName.toLowerCase() !== "body" ) {

				// Blur any element that currently has focus, see #4261
				$( document.activeElement ).blur();
			}
		} catch ( error ) {}
	},

	_mouseStart: function(event) {

		var o = this.options;

		//Create and append the visible helper
		this.helper = this._createHelper(event);

		this.helper.addClass("ui-draggable-dragging");

		//Cache the helper size
		this._cacheHelperProportions();

		//If ddmanager is used for droppables, set the global draggable
		if ($.ui.ddmanager) {
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
		this.hasFixedAncestor = this.helper.parents().filter(function() {
				return $( this ).css( "position" ) === "fixed";
			}).length > 0;

		//The element's absolute position on the page minus margins
		this.positionAbs = this.element.offset();
		this._refreshOffsets( event );

		//Generate the original position
		this.originalPosition = this.position = this._generatePosition( event, false );
		this.originalPageX = event.pageX;
		this.originalPageY = event.pageY;

		//Adjust the mouse offset relative to the helper if "cursorAt" is supplied
		(o.cursorAt && this._adjustOffsetFromHelper(o.cursorAt));

		//Set a containment if given in the options
		this._setContainment();

		//Trigger event + callbacks
		if (this._trigger("start", event) === false) {
			this._clear();
			return false;
		}

		//Recache the helper size
		this._cacheHelperProportions();

		//Prepare the droppable offsets
		if ($.ui.ddmanager && !o.dropBehaviour) {
			$.ui.ddmanager.prepareOffsets(this, event);
		}

		// Reset helper's right/bottom css if they're set and set explicit width/height instead
		// as this prevents resizing of elements with right/bottom set (see #7772)
		this._normalizeRightBottom();

		this._mouseDrag(event, true); //Execute the drag once - this causes the helper not to be visible before getting its correct position

		//If the ddmanager is used for droppables, inform the manager that dragging has started (see #5003)
		if ( $.ui.ddmanager ) {
			$.ui.ddmanager.dragStart(this, event);
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

	_mouseDrag: function(event, noPropagation) {
		// reset any necessary cached properties (see #5009)
		if ( this.hasFixedAncestor ) {
			this.offset.parent = this._getParentOffset();
		}

		//Compute the helpers position
		this.position = this._generatePosition( event, true );
		this.positionAbs = this._convertPositionTo("absolute");

		//Call plugins and callbacks and use the resulting position if something is returned
		if (!noPropagation) {
			var ui = this._uiHash();
			if (this._trigger("drag", event, ui) === false) {
				this._mouseUp({});
				return false;
			}
			this.position = ui.position;
		}

		this.helper[ 0 ].style.left = this.position.left + "px";
		this.helper[ 0 ].style.top = this.position.top + "px";

		if ($.ui.ddmanager) {
			$.ui.ddmanager.drag(this, event);
		}

		return false;
	},

	_mouseStop: function(event) {

		//If we are using droppables, inform the manager about the drop
		var that = this,
			dropped = false;
		if ($.ui.ddmanager && !this.options.dropBehaviour) {
			dropped = $.ui.ddmanager.drop(this, event);
		}

		//if a drop comes from outside (a sortable)
		if (this.dropped) {
			dropped = this.dropped;
			this.dropped = false;
		}

		if ((this.options.revert === "invalid" && !dropped) || (this.options.revert === "valid" && dropped) || this.options.revert === true || ($.isFunction(this.options.revert) && this.options.revert.call(this.element, dropped))) {
			$(this.helper).animate(this.originalPosition, parseInt(this.options.revertDuration, 10), function() {
				if (that._trigger("stop", event) !== false) {
					that._clear();
				}
			});
		} else {
			if (this._trigger("stop", event) !== false) {
				this._clear();
			}
		}

		return false;
	},

	_mouseUp: function( event ) {
		this._unblockFrames();

		//If the ddmanager is used for droppables, inform the manager that dragging has stopped (see #5003)
		if ( $.ui.ddmanager ) {
			$.ui.ddmanager.dragStop(this, event);
		}

		// Only need to focus if the event occurred on the draggable itself, see #10527
		if ( this.handleElement.is( event.target ) ) {
			// The interaction is over; whether or not the click resulted in a drag, focus the element
			this.element.focus();
		}

		return $.ui.mouse.prototype._mouseUp.call(this, event);
	},

	cancel: function() {

		if (this.helper.is(".ui-draggable-dragging")) {
			this._mouseUp({});
		} else {
			this._clear();
		}

		return this;

	},

	_getHandle: function(event) {
		return this.options.handle ?
			!!$( event.target ).closest( this.element.find( this.options.handle ) ).length :
			true;
	},

	_setHandleClassName: function() {
		this.handleElement = this.options.handle ?
			this.element.find( this.options.handle ) : this.element;
		this.handleElement.addClass( "ui-draggable-handle" );
	},

	_removeHandleClassName: function() {
		this.handleElement.removeClass( "ui-draggable-handle" );
	},

	_createHelper: function(event) {

		var o = this.options,
			helperIsFunction = $.isFunction( o.helper ),
			helper = helperIsFunction ?
				$( o.helper.apply( this.element[ 0 ], [ event ] ) ) :
				( o.helper === "clone" ?
					this.element.clone().removeAttr( "id" ) :
					this.element );

		if (!helper.parents("body").length) {
			helper.appendTo((o.appendTo === "parent" ? this.element[0].parentNode : o.appendTo));
		}

		// http://bugs.jqueryui.com/ticket/9446
		// a helper function can return the original element
		// which wouldn't have been set to relative in _create
		if ( helperIsFunction && helper[ 0 ] === this.element[ 0 ] ) {
			this._setPositionRelative();
		}

		if (helper[0] !== this.element[0] && !(/(fixed|absolute)/).test(helper.css("position"))) {
			helper.css("position", "absolute");
		}

		return helper;

	},

	_setPositionRelative: function() {
		if ( !( /^(?:r|a|f)/ ).test( this.element.css( "position" ) ) ) {
			this.element[ 0 ].style.position = "relative";
		}
	},

	_adjustOffsetFromHelper: function(obj) {
		if (typeof obj === "string") {
			obj = obj.split(" ");
		}
		if ($.isArray(obj)) {
			obj = { left: +obj[0], top: +obj[1] || 0 };
		}
		if ("left" in obj) {
			this.offset.click.left = obj.left + this.margins.left;
		}
		if ("right" in obj) {
			this.offset.click.left = this.helperProportions.width - obj.right + this.margins.left;
		}
		if ("top" in obj) {
			this.offset.click.top = obj.top + this.margins.top;
		}
		if ("bottom" in obj) {
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

		// This is a special case where we need to modify a offset calculated on start, since the following happened:
		// 1. The position of the helper is absolute, so it's position is calculated based on the next positioned parent
		// 2. The actual offset parent is a child of the scroll parent, and the scroll parent isn't the document, which means that
		//    the scroll is included in the initial calculation of the offset of the parent, and never recalculated upon drag
		if (this.cssPosition === "absolute" && this.scrollParent[0] !== document && $.contains(this.scrollParent[0], this.offsetParent[0])) {
			po.left += this.scrollParent.scrollLeft();
			po.top += this.scrollParent.scrollTop();
		}

		if ( this._isRootNode( this.offsetParent[ 0 ] ) ) {
			po = { top: 0, left: 0 };
		}

		return {
			top: po.top + (parseInt(this.offsetParent.css("borderTopWidth"), 10) || 0),
			left: po.left + (parseInt(this.offsetParent.css("borderLeftWidth"), 10) || 0)
		};

	},

	_getRelativeOffset: function() {
		if ( this.cssPosition !== "relative" ) {
			return { top: 0, left: 0 };
		}

		var p = this.element.position(),
			scrollIsRootNode = this._isRootNode( this.scrollParent[ 0 ] );

		return {
			top: p.top - ( parseInt(this.helper.css( "top" ), 10) || 0 ) + ( !scrollIsRootNode ? this.scrollParent.scrollTop() : 0 ),
			left: p.left - ( parseInt(this.helper.css( "left" ), 10) || 0 ) + ( !scrollIsRootNode ? this.scrollParent.scrollLeft() : 0 )
		};

	},

	_cacheMargins: function() {
		this.margins = {
			left: (parseInt(this.element.css("marginLeft"), 10) || 0),
			top: (parseInt(this.element.css("marginTop"), 10) || 0),
			right: (parseInt(this.element.css("marginRight"), 10) || 0),
			bottom: (parseInt(this.element.css("marginBottom"), 10) || 0)
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
				$( window ).scrollLeft() + $( window ).width() - this.helperProportions.width - this.margins.left,
				$( window ).scrollTop() + ( $( window ).height() || document.body.parentNode.scrollHeight ) - this.helperProportions.height - this.margins.top
			];
			return;
		}

		if ( o.containment === "document") {
			this.containment = [
				0,
				0,
				$( document ).width() - this.helperProportions.width - this.margins.left,
				( $( document ).height() || document.body.parentNode.scrollHeight ) - this.helperProportions.height - this.margins.top
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
			( parseInt( c.css( "borderLeftWidth" ), 10 ) || 0 ) + ( parseInt( c.css( "paddingLeft" ), 10 ) || 0 ),
			( parseInt( c.css( "borderTopWidth" ), 10 ) || 0 ) + ( parseInt( c.css( "paddingTop" ), 10 ) || 0 ),
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

	_convertPositionTo: function(d, pos) {

		if (!pos) {
			pos = this.position;
		}

		var mod = d === "absolute" ? 1 : -1,
			scrollIsRootNode = this._isRootNode( this.scrollParent[ 0 ] );

		return {
			top: (
				pos.top	+																// The absolute mouse position
				this.offset.relative.top * mod +										// Only for relative positioned nodes: Relative offset from element to offset parent
				this.offset.parent.top * mod -										// The offsetParent's offset without borders (offset + border)
				( ( this.cssPosition === "fixed" ? -this.offset.scroll.top : ( scrollIsRootNode ? 0 : this.offset.scroll.top ) ) * mod)
			),
			left: (
				pos.left +																// The absolute mouse position
				this.offset.relative.left * mod +										// Only for relative positioned nodes: Relative offset from element to offset parent
				this.offset.parent.left * mod	-										// The offsetParent's offset without borders (offset + border)
				( ( this.cssPosition === "fixed" ? -this.offset.scroll.left : ( scrollIsRootNode ? 0 : this.offset.scroll.left ) ) * mod)
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
				if ( this.relativeContainer ){
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

				if (event.pageX - this.offset.click.left < containment[0]) {
					pageX = containment[0] + this.offset.click.left;
				}
				if (event.pageY - this.offset.click.top < containment[1]) {
					pageY = containment[1] + this.offset.click.top;
				}
				if (event.pageX - this.offset.click.left > containment[2]) {
					pageX = containment[2] + this.offset.click.left;
				}
				if (event.pageY - this.offset.click.top > containment[3]) {
					pageY = containment[3] + this.offset.click.top;
				}
			}

			if (o.grid) {
				//Check for grid elements set to 0 to prevent divide by 0 error causing invalid argument errors in IE (see ticket #6950)
				top = o.grid[1] ? this.originalPageY + Math.round((pageY - this.originalPageY) / o.grid[1]) * o.grid[1] : this.originalPageY;
				pageY = containment ? ((top - this.offset.click.top >= containment[1] || top - this.offset.click.top > containment[3]) ? top : ((top - this.offset.click.top >= containment[1]) ? top - o.grid[1] : top + o.grid[1])) : top;

				left = o.grid[0] ? this.originalPageX + Math.round((pageX - this.originalPageX) / o.grid[0]) * o.grid[0] : this.originalPageX;
				pageX = containment ? ((left - this.offset.click.left >= containment[0] || left - this.offset.click.left > containment[2]) ? left : ((left - this.offset.click.left >= containment[0]) ? left - o.grid[0] : left + o.grid[0])) : left;
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
				pageY -																	// The absolute mouse position
				this.offset.click.top	-												// Click offset (relative to the element)
				this.offset.relative.top -												// Only for relative positioned nodes: Relative offset from element to offset parent
				this.offset.parent.top +												// The offsetParent's offset without borders (offset + border)
				( this.cssPosition === "fixed" ? -this.offset.scroll.top : ( scrollIsRootNode ? 0 : this.offset.scroll.top ) )
			),
			left: (
				pageX -																	// The absolute mouse position
				this.offset.click.left -												// Click offset (relative to the element)
				this.offset.relative.left -												// Only for relative positioned nodes: Relative offset from element to offset parent
				this.offset.parent.left +												// The offsetParent's offset without borders (offset + border)
				( this.cssPosition === "fixed" ? -this.offset.scroll.left : ( scrollIsRootNode ? 0 : this.offset.scroll.left ) )
			)
		};

	},

	_clear: function() {
		this.helper.removeClass("ui-draggable-dragging");
		if (this.helper[0] !== this.element[0] && !this.cancelHelperRemoval) {
			this.helper.remove();
		}
		this.helper = null;
		this.cancelHelperRemoval = false;
		if ( this.destroyOnClear ) {
			this.destroy();
		}
	},

	_normalizeRightBottom: function() {
		if ( this.options.axis !== "y" && this.helper.css( "right" ) !== "auto" ) {
			this.helper.width( this.helper.width() );
			this.helper.css( "right", "auto" );
		}
		if ( this.options.axis !== "x" && this.helper.css( "bottom" ) !== "auto" ) {
			this.helper.height( this.helper.height() );
			this.helper.css( "bottom", "auto" );
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

});

$.ui.plugin.add( "draggable", "connectToSortable", {
	start: function( event, ui, draggable ) {
		var uiSortable = $.extend( {}, ui, {
			item: draggable.element
		});

		draggable.sortables = [];
		$( draggable.options.connectToSortable ).each(function() {
			var sortable = $( this ).sortable( "instance" );

			if ( sortable && !sortable.options.disabled ) {
				draggable.sortables.push( sortable );

				// refreshPositions is called at drag start to refresh the containerCache
				// which is used in drag. This ensures it's initialized and synchronized
				// with any changes that might have happened on the page since initialization.
				sortable.refreshPositions();
				sortable._trigger("activate", event, uiSortable);
			}
		});
	},
	stop: function( event, ui, draggable ) {
		var uiSortable = $.extend( {}, ui, {
			item: draggable.element
		});

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

				sortable._mouseStop(event);

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
		});
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
				});
			}

			if ( innermostIntersecting ) {
				// If it intersects, we use a little isOver variable and set it once,
				// so that the move-in stuff gets fired only once.
				if ( !sortable.isOver ) {
					sortable.isOver = 1;

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
					});

					// hack so receive/update callbacks work (mostly)
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

					// restore sortable behaviors that were modfied
					// when the draggable entered the sortable area (#9481)
					sortable.options.revert = sortable.options._revert;
					sortable.options.helper = sortable.options._helper;

					if ( sortable.placeholder ) {
						sortable.placeholder.remove();
					}

					// Recalculate the draggable's offset considering the sortable
					// may have modified them in unexpected ways (#8809)
					draggable._refreshOffsets( event );
					ui.position = draggable._generatePosition( event, true );

					draggable._trigger( "fromSortable", event );

					// Inform draggable that the helper is no longer in a valid drop zone
					draggable.dropped = false;

					// Need to refreshPositions of all sortables just in case removing
					// from one sortable changes the location of other sortables (#9675)
					$.each( draggable.sortables, function() {
						this.refreshPositions();
					});
				}
			}
		});
	}
});

$.ui.plugin.add("draggable", "cursor", {
	start: function( event, ui, instance ) {
		var t = $( "body" ),
			o = instance.options;

		if (t.css("cursor")) {
			o._cursor = t.css("cursor");
		}
		t.css("cursor", o.cursor);
	},
	stop: function( event, ui, instance ) {
		var o = instance.options;
		if (o._cursor) {
			$("body").css("cursor", o._cursor);
		}
	}
});

$.ui.plugin.add("draggable", "opacity", {
	start: function( event, ui, instance ) {
		var t = $( ui.helper ),
			o = instance.options;
		if (t.css("opacity")) {
			o._opacity = t.css("opacity");
		}
		t.css("opacity", o.opacity);
	},
	stop: function( event, ui, instance ) {
		var o = instance.options;
		if (o._opacity) {
			$(ui.helper).css("opacity", o._opacity);
		}
	}
});

$.ui.plugin.add("draggable", "scroll", {
	start: function( event, ui, i ) {
		if ( !i.scrollParentNotHidden ) {
			i.scrollParentNotHidden = i.helper.scrollParent( false );
		}

		if ( i.scrollParentNotHidden[ 0 ] !== i.document[ 0 ] && i.scrollParentNotHidden[ 0 ].tagName !== "HTML" ) {
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
				if ( ( i.overflowOffset.top + scrollParent.offsetHeight ) - event.pageY < o.scrollSensitivity ) {
					scrollParent.scrollTop = scrolled = scrollParent.scrollTop + o.scrollSpeed;
				} else if ( event.pageY - i.overflowOffset.top < o.scrollSensitivity ) {
					scrollParent.scrollTop = scrolled = scrollParent.scrollTop - o.scrollSpeed;
				}
			}

			if ( !o.axis || o.axis !== "y" ) {
				if ( ( i.overflowOffset.left + scrollParent.offsetWidth ) - event.pageX < o.scrollSensitivity ) {
					scrollParent.scrollLeft = scrolled = scrollParent.scrollLeft + o.scrollSpeed;
				} else if ( event.pageX - i.overflowOffset.left < o.scrollSensitivity ) {
					scrollParent.scrollLeft = scrolled = scrollParent.scrollLeft - o.scrollSpeed;
				}
			}

		} else {

			if (!o.axis || o.axis !== "x") {
				if (event.pageY - $(document).scrollTop() < o.scrollSensitivity) {
					scrolled = $(document).scrollTop($(document).scrollTop() - o.scrollSpeed);
				} else if ($(window).height() - (event.pageY - $(document).scrollTop()) < o.scrollSensitivity) {
					scrolled = $(document).scrollTop($(document).scrollTop() + o.scrollSpeed);
				}
			}

			if (!o.axis || o.axis !== "y") {
				if (event.pageX - $(document).scrollLeft() < o.scrollSensitivity) {
					scrolled = $(document).scrollLeft($(document).scrollLeft() - o.scrollSpeed);
				} else if ($(window).width() - (event.pageX - $(document).scrollLeft()) < o.scrollSensitivity) {
					scrolled = $(document).scrollLeft($(document).scrollLeft() + o.scrollSpeed);
				}
			}

		}

		if (scrolled !== false && $.ui.ddmanager && !o.dropBehaviour) {
			$.ui.ddmanager.prepareOffsets(i, event);
		}

	}
});

$.ui.plugin.add("draggable", "snap", {
	start: function( event, ui, i ) {

		var o = i.options;

		i.snapElements = [];

		$(o.snap.constructor !== String ? ( o.snap.items || ":data(ui-draggable)" ) : o.snap).each(function() {
			var $t = $(this),
				$o = $t.offset();
			if (this !== i.element[0]) {
				i.snapElements.push({
					item: this,
					width: $t.outerWidth(), height: $t.outerHeight(),
					top: $o.top, left: $o.left
				});
			}
		});

	},
	drag: function( event, ui, inst ) {

		var ts, bs, ls, rs, l, r, t, b, i, first,
			o = inst.options,
			d = o.snapTolerance,
			x1 = ui.offset.left, x2 = x1 + inst.helperProportions.width,
			y1 = ui.offset.top, y2 = y1 + inst.helperProportions.height;

		for (i = inst.snapElements.length - 1; i >= 0; i--){

			l = inst.snapElements[i].left - inst.margins.left;
			r = l + inst.snapElements[i].width;
			t = inst.snapElements[i].top - inst.margins.top;
			b = t + inst.snapElements[i].height;

			if ( x2 < l - d || x1 > r + d || y2 < t - d || y1 > b + d || !$.contains( inst.snapElements[ i ].item.ownerDocument, inst.snapElements[ i ].item ) ) {
				if (inst.snapElements[i].snapping) {
					(inst.options.snap.release && inst.options.snap.release.call(inst.element, event, $.extend(inst._uiHash(), { snapItem: inst.snapElements[i].item })));
				}
				inst.snapElements[i].snapping = false;
				continue;
			}

			if (o.snapMode !== "inner") {
				ts = Math.abs(t - y2) <= d;
				bs = Math.abs(b - y1) <= d;
				ls = Math.abs(l - x2) <= d;
				rs = Math.abs(r - x1) <= d;
				if (ts) {
					ui.position.top = inst._convertPositionTo("relative", { top: t - inst.helperProportions.height, left: 0 }).top;
				}
				if (bs) {
					ui.position.top = inst._convertPositionTo("relative", { top: b, left: 0 }).top;
				}
				if (ls) {
					ui.position.left = inst._convertPositionTo("relative", { top: 0, left: l - inst.helperProportions.width }).left;
				}
				if (rs) {
					ui.position.left = inst._convertPositionTo("relative", { top: 0, left: r }).left;
				}
			}

			first = (ts || bs || ls || rs);

			if (o.snapMode !== "outer") {
				ts = Math.abs(t - y1) <= d;
				bs = Math.abs(b - y2) <= d;
				ls = Math.abs(l - x1) <= d;
				rs = Math.abs(r - x2) <= d;
				if (ts) {
					ui.position.top = inst._convertPositionTo("relative", { top: t, left: 0 }).top;
				}
				if (bs) {
					ui.position.top = inst._convertPositionTo("relative", { top: b - inst.helperProportions.height, left: 0 }).top;
				}
				if (ls) {
					ui.position.left = inst._convertPositionTo("relative", { top: 0, left: l }).left;
				}
				if (rs) {
					ui.position.left = inst._convertPositionTo("relative", { top: 0, left: r - inst.helperProportions.width }).left;
				}
			}

			if (!inst.snapElements[i].snapping && (ts || bs || ls || rs || first)) {
				(inst.options.snap.snap && inst.options.snap.snap.call(inst.element, event, $.extend(inst._uiHash(), { snapItem: inst.snapElements[i].item })));
			}
			inst.snapElements[i].snapping = (ts || bs || ls || rs || first);

		}

	}
});

$.ui.plugin.add("draggable", "stack", {
	start: function( event, ui, instance ) {
		var min,
			o = instance.options,
			group = $.makeArray($(o.stack)).sort(function(a, b) {
				return (parseInt($(a).css("zIndex"), 10) || 0) - (parseInt($(b).css("zIndex"), 10) || 0);
			});

		if (!group.length) { return; }

		min = parseInt($(group[0]).css("zIndex"), 10) || 0;
		$(group).each(function(i) {
			$(this).css("zIndex", min + i);
		});
		this.css("zIndex", (min + group.length));
	}
});

$.ui.plugin.add("draggable", "zIndex", {
	start: function( event, ui, instance ) {
		var t = $( ui.helper ),
			o = instance.options;

		if (t.css("zIndex")) {
			o._zIndex = t.css("zIndex");
		}
		t.css("zIndex", o.zIndex);
	},
	stop: function( event, ui, instance ) {
		var o = instance.options;

		if (o._zIndex) {
			$(ui.helper).css("zIndex", o._zIndex);
		}
	}
});

var draggable = $.ui.draggable;


/*!
 * jQuery UI Resizable 1.11.2
 * http://jqueryui.com
 *
 * Copyright 2014 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/resizable/
 */


$.widget("ui.resizable", $.ui.mouse, {
	version: "1.11.2",
	widgetEventPrefix: "resize",
	options: {
		alsoResize: false,
		animate: false,
		animateDuration: "slow",
		animateEasing: "swing",
		aspectRatio: false,
		autoHide: false,
		containment: false,
		ghost: false,
		grid: false,
		handles: "e,s,se",
		helper: false,
		maxHeight: null,
		maxWidth: null,
		minHeight: 10,
		minWidth: 10,
		// See #7960
		zIndex: 90,

		// callbacks
		resize: null,
		start: null,
		stop: null
	},

	_num: function( value ) {
		return parseInt( value, 10 ) || 0;
	},

	_isNumber: function( value ) {
		return !isNaN( parseInt( value, 10 ) );
	},

	_hasScroll: function( el, a ) {

		if ( $( el ).css( "overflow" ) === "hidden") {
			return false;
		}

		var scroll = ( a && a === "left" ) ? "scrollLeft" : "scrollTop",
			has = false;

		if ( el[ scroll ] > 0 ) {
			return true;
		}

		// TODO: determine which cases actually cause this to happen
		// if the element doesn't have the scroll set, see if it's possible to
		// set the scroll
		el[ scroll ] = 1;
		has = ( el[ scroll ] > 0 );
		el[ scroll ] = 0;
		return has;
	},

	_create: function() {

		var n, i, handle, axis, hname,
			that = this,
			o = this.options;
		this.element.addClass("ui-resizable");

		$.extend(this, {
			_aspectRatio: !!(o.aspectRatio),
			aspectRatio: o.aspectRatio,
			originalElement: this.element,
			_proportionallyResizeElements: [],
			_helper: o.helper || o.ghost || o.animate ? o.helper || "ui-resizable-helper" : null
		});

		// Wrap the element if it cannot hold child nodes
		if (this.element[0].nodeName.match(/canvas|textarea|input|select|button|img/i)) {

			this.element.wrap(
				$("<div class='ui-wrapper' style='overflow: hidden;'></div>").css({
					position: this.element.css("position"),
					width: this.element.outerWidth(),
					height: this.element.outerHeight(),
					top: this.element.css("top"),
					left: this.element.css("left")
				})
			);

			this.element = this.element.parent().data(
				"ui-resizable", this.element.resizable( "instance" )
			);

			this.elementIsWrapper = true;

			this.element.css({
				marginLeft: this.originalElement.css("marginLeft"),
				marginTop: this.originalElement.css("marginTop"),
				marginRight: this.originalElement.css("marginRight"),
				marginBottom: this.originalElement.css("marginBottom")
			});
			this.originalElement.css({
				marginLeft: 0,
				marginTop: 0,
				marginRight: 0,
				marginBottom: 0
			});
			// support: Safari
			// Prevent Safari textarea resize
			this.originalResizeStyle = this.originalElement.css("resize");
			this.originalElement.css("resize", "none");

			this._proportionallyResizeElements.push( this.originalElement.css({
				position: "static",
				zoom: 1,
				display: "block"
			}) );

			// support: IE9
			// avoid IE jump (hard set the margin)
			this.originalElement.css({ margin: this.originalElement.css("margin") });

			this._proportionallyResize();
		}

		this.handles = o.handles ||
			( !$(".ui-resizable-handle", this.element).length ?
				"e,s,se" : {
					n: ".ui-resizable-n",
					e: ".ui-resizable-e",
					s: ".ui-resizable-s",
					w: ".ui-resizable-w",
					se: ".ui-resizable-se",
					sw: ".ui-resizable-sw",
					ne: ".ui-resizable-ne",
					nw: ".ui-resizable-nw"
				} );

		if (this.handles.constructor === String) {

			if ( this.handles === "all") {
				this.handles = "n,e,s,w,se,sw,ne,nw";
			}

			n = this.handles.split(",");
			this.handles = {};

			for (i = 0; i < n.length; i++) {

				handle = $.trim(n[i]);
				hname = "ui-resizable-" + handle;
				axis = $("<div class='ui-resizable-handle " + hname + "'></div>");

				axis.css({ zIndex: o.zIndex });

				// TODO : What's going on here?
				if ("se" === handle) {
					axis.addClass("ui-icon ui-icon-gripsmall-diagonal-se");
				}

				this.handles[handle] = ".ui-resizable-" + handle;
				this.element.append(axis);
			}

		}

		this._renderAxis = function(target) {

			var i, axis, padPos, padWrapper;

			target = target || this.element;

			for (i in this.handles) {

				if (this.handles[i].constructor === String) {
					this.handles[i] = this.element.children( this.handles[ i ] ).first().show();
				}

				if (this.elementIsWrapper && this.originalElement[0].nodeName.match(/textarea|input|select|button/i)) {

					axis = $(this.handles[i], this.element);

					padWrapper = /sw|ne|nw|se|n|s/.test(i) ? axis.outerHeight() : axis.outerWidth();

					padPos = [ "padding",
						/ne|nw|n/.test(i) ? "Top" :
						/se|sw|s/.test(i) ? "Bottom" :
						/^e$/.test(i) ? "Right" : "Left" ].join("");

					target.css(padPos, padWrapper);

					this._proportionallyResize();

				}

				// TODO: What's that good for? There's not anything to be executed left
				if (!$(this.handles[i]).length) {
					continue;
				}
			}
		};

		// TODO: make renderAxis a prototype function
		this._renderAxis(this.element);

		this._handles = $(".ui-resizable-handle", this.element)
			.disableSelection();

		this._handles.mouseover(function() {
			if (!that.resizing) {
				if (this.className) {
					axis = this.className.match(/ui-resizable-(se|sw|ne|nw|n|e|s|w)/i);
				}
				that.axis = axis && axis[1] ? axis[1] : "se";
			}
		});

		if (o.autoHide) {
			this._handles.hide();
			$(this.element)
				.addClass("ui-resizable-autohide")
				.mouseenter(function() {
					if (o.disabled) {
						return;
					}
					$(this).removeClass("ui-resizable-autohide");
					that._handles.show();
				})
				.mouseleave(function() {
					if (o.disabled) {
						return;
					}
					if (!that.resizing) {
						$(this).addClass("ui-resizable-autohide");
						that._handles.hide();
					}
				});
		}

		this._mouseInit();

	},

	_destroy: function() {

		this._mouseDestroy();

		var wrapper,
			_destroy = function(exp) {
				$(exp)
					.removeClass("ui-resizable ui-resizable-disabled ui-resizable-resizing")
					.removeData("resizable")
					.removeData("ui-resizable")
					.unbind(".resizable")
					.find(".ui-resizable-handle")
						.remove();
			};

		// TODO: Unwrap at same DOM position
		if (this.elementIsWrapper) {
			_destroy(this.element);
			wrapper = this.element;
			this.originalElement.css({
				position: wrapper.css("position"),
				width: wrapper.outerWidth(),
				height: wrapper.outerHeight(),
				top: wrapper.css("top"),
				left: wrapper.css("left")
			}).insertAfter( wrapper );
			wrapper.remove();
		}

		this.originalElement.css("resize", this.originalResizeStyle);
		_destroy(this.originalElement);

		return this;
	},

	_mouseCapture: function(event) {
		var i, handle,
			capture = false;

		for (i in this.handles) {
			handle = $(this.handles[i])[0];
			if (handle === event.target || $.contains(handle, event.target)) {
				capture = true;
			}
		}

		return !this.options.disabled && capture;
	},

	_mouseStart: function(event) {

		var curleft, curtop, cursor,
			o = this.options,
			el = this.element;

		this.resizing = true;

		this._renderProxy();

		curleft = this._num(this.helper.css("left"));
		curtop = this._num(this.helper.css("top"));

		if (o.containment) {
			curleft += $(o.containment).scrollLeft() || 0;
			curtop += $(o.containment).scrollTop() || 0;
		}

		this.offset = this.helper.offset();
		this.position = { left: curleft, top: curtop };

		this.size = this._helper ? {
				width: this.helper.width(),
				height: this.helper.height()
			} : {
				width: el.width(),
				height: el.height()
			};

		this.originalSize = this._helper ? {
				width: el.outerWidth(),
				height: el.outerHeight()
			} : {
				width: el.width(),
				height: el.height()
			};

		this.sizeDiff = {
			width: el.outerWidth() - el.width(),
			height: el.outerHeight() - el.height()
		};

		this.originalPosition = { left: curleft, top: curtop };
		this.originalMousePosition = { left: event.pageX, top: event.pageY };

		this.aspectRatio = (typeof o.aspectRatio === "number") ?
			o.aspectRatio :
			((this.originalSize.width / this.originalSize.height) || 1);

		cursor = $(".ui-resizable-" + this.axis).css("cursor");
		$("body").css("cursor", cursor === "auto" ? this.axis + "-resize" : cursor);

		el.addClass("ui-resizable-resizing");
		this._propagate("start", event);
		return true;
	},

	_mouseDrag: function(event) {

		var data, props,
			smp = this.originalMousePosition,
			a = this.axis,
			dx = (event.pageX - smp.left) || 0,
			dy = (event.pageY - smp.top) || 0,
			trigger = this._change[a];

		this._updatePrevProperties();

		if (!trigger) {
			return false;
		}

		data = trigger.apply(this, [ event, dx, dy ]);

		this._updateVirtualBoundaries(event.shiftKey);
		if (this._aspectRatio || event.shiftKey) {
			data = this._updateRatio(data, event);
		}

		data = this._respectSize(data, event);

		this._updateCache(data);

		this._propagate("resize", event);

		props = this._applyChanges();

		if ( !this._helper && this._proportionallyResizeElements.length ) {
			this._proportionallyResize();
		}

		if ( !$.isEmptyObject( props ) ) {
			this._updatePrevProperties();
			this._trigger( "resize", event, this.ui() );
			this._applyChanges();
		}

		return false;
	},

	_mouseStop: function(event) {

		this.resizing = false;
		var pr, ista, soffseth, soffsetw, s, left, top,
			o = this.options, that = this;

		if (this._helper) {

			pr = this._proportionallyResizeElements;
			ista = pr.length && (/textarea/i).test(pr[0].nodeName);
			soffseth = ista && this._hasScroll(pr[0], "left") ? 0 : that.sizeDiff.height;
			soffsetw = ista ? 0 : that.sizeDiff.width;

			s = {
				width: (that.helper.width()  - soffsetw),
				height: (that.helper.height() - soffseth)
			};
			left = (parseInt(that.element.css("left"), 10) +
				(that.position.left - that.originalPosition.left)) || null;
			top = (parseInt(that.element.css("top"), 10) +
				(that.position.top - that.originalPosition.top)) || null;

			if (!o.animate) {
				this.element.css($.extend(s, { top: top, left: left }));
			}

			that.helper.height(that.size.height);
			that.helper.width(that.size.width);

			if (this._helper && !o.animate) {
				this._proportionallyResize();
			}
		}

		$("body").css("cursor", "auto");

		this.element.removeClass("ui-resizable-resizing");

		this._propagate("stop", event);

		if (this._helper) {
			this.helper.remove();
		}

		return false;

	},

	_updatePrevProperties: function() {
		this.prevPosition = {
			top: this.position.top,
			left: this.position.left
		};
		this.prevSize = {
			width: this.size.width,
			height: this.size.height
		};
	},

	_applyChanges: function() {
		var props = {};

		if ( this.position.top !== this.prevPosition.top ) {
			props.top = this.position.top + "px";
		}
		if ( this.position.left !== this.prevPosition.left ) {
			props.left = this.position.left + "px";
		}
		if ( this.size.width !== this.prevSize.width ) {
			props.width = this.size.width + "px";
		}
		if ( this.size.height !== this.prevSize.height ) {
			props.height = this.size.height + "px";
		}

		this.helper.css( props );

		return props;
	},

	_updateVirtualBoundaries: function(forceAspectRatio) {
		var pMinWidth, pMaxWidth, pMinHeight, pMaxHeight, b,
			o = this.options;

		b = {
			minWidth: this._isNumber(o.minWidth) ? o.minWidth : 0,
			maxWidth: this._isNumber(o.maxWidth) ? o.maxWidth : Infinity,
			minHeight: this._isNumber(o.minHeight) ? o.minHeight : 0,
			maxHeight: this._isNumber(o.maxHeight) ? o.maxHeight : Infinity
		};

		if (this._aspectRatio || forceAspectRatio) {
			pMinWidth = b.minHeight * this.aspectRatio;
			pMinHeight = b.minWidth / this.aspectRatio;
			pMaxWidth = b.maxHeight * this.aspectRatio;
			pMaxHeight = b.maxWidth / this.aspectRatio;

			if (pMinWidth > b.minWidth) {
				b.minWidth = pMinWidth;
			}
			if (pMinHeight > b.minHeight) {
				b.minHeight = pMinHeight;
			}
			if (pMaxWidth < b.maxWidth) {
				b.maxWidth = pMaxWidth;
			}
			if (pMaxHeight < b.maxHeight) {
				b.maxHeight = pMaxHeight;
			}
		}
		this._vBoundaries = b;
	},

	_updateCache: function(data) {
		this.offset = this.helper.offset();
		if (this._isNumber(data.left)) {
			this.position.left = data.left;
		}
		if (this._isNumber(data.top)) {
			this.position.top = data.top;
		}
		if (this._isNumber(data.height)) {
			this.size.height = data.height;
		}
		if (this._isNumber(data.width)) {
			this.size.width = data.width;
		}
	},

	_updateRatio: function( data ) {

		var cpos = this.position,
			csize = this.size,
			a = this.axis;

		if (this._isNumber(data.height)) {
			data.width = (data.height * this.aspectRatio);
		} else if (this._isNumber(data.width)) {
			data.height = (data.width / this.aspectRatio);
		}

		if (a === "sw") {
			data.left = cpos.left + (csize.width - data.width);
			data.top = null;
		}
		if (a === "nw") {
			data.top = cpos.top + (csize.height - data.height);
			data.left = cpos.left + (csize.width - data.width);
		}

		return data;
	},

	_respectSize: function( data ) {

		var o = this._vBoundaries,
			a = this.axis,
			ismaxw = this._isNumber(data.width) && o.maxWidth && (o.maxWidth < data.width),
			ismaxh = this._isNumber(data.height) && o.maxHeight && (o.maxHeight < data.height),
			isminw = this._isNumber(data.width) && o.minWidth && (o.minWidth > data.width),
			isminh = this._isNumber(data.height) && o.minHeight && (o.minHeight > data.height),
			dw = this.originalPosition.left + this.originalSize.width,
			dh = this.position.top + this.size.height,
			cw = /sw|nw|w/.test(a), ch = /nw|ne|n/.test(a);
		if (isminw) {
			data.width = o.minWidth;
		}
		if (isminh) {
			data.height = o.minHeight;
		}
		if (ismaxw) {
			data.width = o.maxWidth;
		}
		if (ismaxh) {
			data.height = o.maxHeight;
		}

		if (isminw && cw) {
			data.left = dw - o.minWidth;
		}
		if (ismaxw && cw) {
			data.left = dw - o.maxWidth;
		}
		if (isminh && ch) {
			data.top = dh - o.minHeight;
		}
		if (ismaxh && ch) {
			data.top = dh - o.maxHeight;
		}

		// Fixing jump error on top/left - bug #2330
		if (!data.width && !data.height && !data.left && data.top) {
			data.top = null;
		} else if (!data.width && !data.height && !data.top && data.left) {
			data.left = null;
		}

		return data;
	},

	_getPaddingPlusBorderDimensions: function( element ) {
		var i = 0,
			widths = [],
			borders = [
				element.css( "borderTopWidth" ),
				element.css( "borderRightWidth" ),
				element.css( "borderBottomWidth" ),
				element.css( "borderLeftWidth" )
			],
			paddings = [
				element.css( "paddingTop" ),
				element.css( "paddingRight" ),
				element.css( "paddingBottom" ),
				element.css( "paddingLeft" )
			];

		for ( ; i < 4; i++ ) {
			widths[ i ] = ( parseInt( borders[ i ], 10 ) || 0 );
			widths[ i ] += ( parseInt( paddings[ i ], 10 ) || 0 );
		}

		return {
			height: widths[ 0 ] + widths[ 2 ],
			width: widths[ 1 ] + widths[ 3 ]
		};
	},

	_proportionallyResize: function() {

		if (!this._proportionallyResizeElements.length) {
			return;
		}

		var prel,
			i = 0,
			element = this.helper || this.element;

		for ( ; i < this._proportionallyResizeElements.length; i++) {

			prel = this._proportionallyResizeElements[i];

			// TODO: Seems like a bug to cache this.outerDimensions
			// considering that we are in a loop.
			if (!this.outerDimensions) {
				this.outerDimensions = this._getPaddingPlusBorderDimensions( prel );
			}

			prel.css({
				height: (element.height() - this.outerDimensions.height) || 0,
				width: (element.width() - this.outerDimensions.width) || 0
			});

		}

	},

	_renderProxy: function() {

		var el = this.element, o = this.options;
		this.elementOffset = el.offset();

		if (this._helper) {

			this.helper = this.helper || $("<div style='overflow:hidden;'></div>");

			this.helper.addClass(this._helper).css({
				width: this.element.outerWidth() - 1,
				height: this.element.outerHeight() - 1,
				position: "absolute",
				left: this.elementOffset.left + "px",
				top: this.elementOffset.top + "px",
				zIndex: ++o.zIndex //TODO: Don't modify option
			});

			this.helper
				.appendTo("body")
				.disableSelection();

		} else {
			this.helper = this.element;
		}

	},

	_change: {
		e: function(event, dx) {
			return { width: this.originalSize.width + dx };
		},
		w: function(event, dx) {
			var cs = this.originalSize, sp = this.originalPosition;
			return { left: sp.left + dx, width: cs.width - dx };
		},
		n: function(event, dx, dy) {
			var cs = this.originalSize, sp = this.originalPosition;
			return { top: sp.top + dy, height: cs.height - dy };
		},
		s: function(event, dx, dy) {
			return { height: this.originalSize.height + dy };
		},
		se: function(event, dx, dy) {
			return $.extend(this._change.s.apply(this, arguments),
				this._change.e.apply(this, [ event, dx, dy ]));
		},
		sw: function(event, dx, dy) {
			return $.extend(this._change.s.apply(this, arguments),
				this._change.w.apply(this, [ event, dx, dy ]));
		},
		ne: function(event, dx, dy) {
			return $.extend(this._change.n.apply(this, arguments),
				this._change.e.apply(this, [ event, dx, dy ]));
		},
		nw: function(event, dx, dy) {
			return $.extend(this._change.n.apply(this, arguments),
				this._change.w.apply(this, [ event, dx, dy ]));
		}
	},

	_propagate: function(n, event) {
		$.ui.plugin.call(this, n, [ event, this.ui() ]);
		(n !== "resize" && this._trigger(n, event, this.ui()));
	},

	plugins: {},

	ui: function() {
		return {
			originalElement: this.originalElement,
			element: this.element,
			helper: this.helper,
			position: this.position,
			size: this.size,
			originalSize: this.originalSize,
			originalPosition: this.originalPosition
		};
	}

});

/*
 * Resizable Extensions
 */

$.ui.plugin.add("resizable", "animate", {

	stop: function( event ) {
		var that = $(this).resizable( "instance" ),
			o = that.options,
			pr = that._proportionallyResizeElements,
			ista = pr.length && (/textarea/i).test(pr[0].nodeName),
			soffseth = ista && that._hasScroll(pr[0], "left") ? 0 : that.sizeDiff.height,
			soffsetw = ista ? 0 : that.sizeDiff.width,
			style = { width: (that.size.width - soffsetw), height: (that.size.height - soffseth) },
			left = (parseInt(that.element.css("left"), 10) +
				(that.position.left - that.originalPosition.left)) || null,
			top = (parseInt(that.element.css("top"), 10) +
				(that.position.top - that.originalPosition.top)) || null;

		that.element.animate(
			$.extend(style, top && left ? { top: top, left: left } : {}), {
				duration: o.animateDuration,
				easing: o.animateEasing,
				step: function() {

					var data = {
						width: parseInt(that.element.css("width"), 10),
						height: parseInt(that.element.css("height"), 10),
						top: parseInt(that.element.css("top"), 10),
						left: parseInt(that.element.css("left"), 10)
					};

					if (pr && pr.length) {
						$(pr[0]).css({ width: data.width, height: data.height });
					}

					// propagating resize, and updating values for each animation step
					that._updateCache(data);
					that._propagate("resize", event);

				}
			}
		);
	}

});

$.ui.plugin.add( "resizable", "containment", {

	start: function() {
		var element, p, co, ch, cw, width, height,
			that = $( this ).resizable( "instance" ),
			o = that.options,
			el = that.element,
			oc = o.containment,
			ce = ( oc instanceof $ ) ? oc.get( 0 ) : ( /parent/.test( oc ) ) ? el.parent().get( 0 ) : oc;

		if ( !ce ) {
			return;
		}

		that.containerElement = $( ce );

		if ( /document/.test( oc ) || oc === document ) {
			that.containerOffset = {
				left: 0,
				top: 0
			};
			that.containerPosition = {
				left: 0,
				top: 0
			};

			that.parentData = {
				element: $( document ),
				left: 0,
				top: 0,
				width: $( document ).width(),
				height: $( document ).height() || document.body.parentNode.scrollHeight
			};
		} else {
			element = $( ce );
			p = [];
			$([ "Top", "Right", "Left", "Bottom" ]).each(function( i, name ) {
				p[ i ] = that._num( element.css( "padding" + name ) );
			});

			that.containerOffset = element.offset();
			that.containerPosition = element.position();
			that.containerSize = {
				height: ( element.innerHeight() - p[ 3 ] ),
				width: ( element.innerWidth() - p[ 1 ] )
			};

			co = that.containerOffset;
			ch = that.containerSize.height;
			cw = that.containerSize.width;
			width = ( that._hasScroll ( ce, "left" ) ? ce.scrollWidth : cw );
			height = ( that._hasScroll ( ce ) ? ce.scrollHeight : ch ) ;

			that.parentData = {
				element: ce,
				left: co.left,
				top: co.top,
				width: width,
				height: height
			};
		}
	},

	resize: function( event ) {
		var woset, hoset, isParent, isOffsetRelative,
			that = $( this ).resizable( "instance" ),
			o = that.options,
			co = that.containerOffset,
			cp = that.position,
			pRatio = that._aspectRatio || event.shiftKey,
			cop = {
				top: 0,
				left: 0
			},
			ce = that.containerElement,
			continueResize = true;

		if ( ce[ 0 ] !== document && ( /static/ ).test( ce.css( "position" ) ) ) {
			cop = co;
		}

		if ( cp.left < ( that._helper ? co.left : 0 ) ) {
			that.size.width = that.size.width +
				( that._helper ?
					( that.position.left - co.left ) :
					( that.position.left - cop.left ) );

			if ( pRatio ) {
				that.size.height = that.size.width / that.aspectRatio;
				continueResize = false;
			}
			that.position.left = o.helper ? co.left : 0;
		}

		if ( cp.top < ( that._helper ? co.top : 0 ) ) {
			that.size.height = that.size.height +
				( that._helper ?
					( that.position.top - co.top ) :
					that.position.top );

			if ( pRatio ) {
				that.size.width = that.size.height * that.aspectRatio;
				continueResize = false;
			}
			that.position.top = that._helper ? co.top : 0;
		}

		isParent = that.containerElement.get( 0 ) === that.element.parent().get( 0 );
		isOffsetRelative = /relative|absolute/.test( that.containerElement.css( "position" ) );

		if ( isParent && isOffsetRelative ) {
			that.offset.left = that.parentData.left + that.position.left;
			that.offset.top = that.parentData.top + that.position.top;
		} else {
			that.offset.left = that.element.offset().left;
			that.offset.top = that.element.offset().top;
		}

		woset = Math.abs( that.sizeDiff.width +
			(that._helper ?
				that.offset.left - cop.left :
				(that.offset.left - co.left)) );

		hoset = Math.abs( that.sizeDiff.height +
			(that._helper ?
				that.offset.top - cop.top :
				(that.offset.top - co.top)) );

		if ( woset + that.size.width >= that.parentData.width ) {
			that.size.width = that.parentData.width - woset;
			if ( pRatio ) {
				that.size.height = that.size.width / that.aspectRatio;
				continueResize = false;
			}
		}

		if ( hoset + that.size.height >= that.parentData.height ) {
			that.size.height = that.parentData.height - hoset;
			if ( pRatio ) {
				that.size.width = that.size.height * that.aspectRatio;
				continueResize = false;
			}
		}

		if ( !continueResize ){
			that.position.left = that.prevPosition.left;
			that.position.top = that.prevPosition.top;
			that.size.width = that.prevSize.width;
			that.size.height = that.prevSize.height;
		}
	},

	stop: function() {
		var that = $( this ).resizable( "instance" ),
			o = that.options,
			co = that.containerOffset,
			cop = that.containerPosition,
			ce = that.containerElement,
			helper = $( that.helper ),
			ho = helper.offset(),
			w = helper.outerWidth() - that.sizeDiff.width,
			h = helper.outerHeight() - that.sizeDiff.height;

		if ( that._helper && !o.animate && ( /relative/ ).test( ce.css( "position" ) ) ) {
			$( this ).css({
				left: ho.left - cop.left - co.left,
				width: w,
				height: h
			});
		}

		if ( that._helper && !o.animate && ( /static/ ).test( ce.css( "position" ) ) ) {
			$( this ).css({
				left: ho.left - cop.left - co.left,
				width: w,
				height: h
			});
		}
	}
});

$.ui.plugin.add("resizable", "alsoResize", {

	start: function() {
		var that = $(this).resizable( "instance" ),
			o = that.options,
			_store = function(exp) {
				$(exp).each(function() {
					var el = $(this);
					el.data("ui-resizable-alsoresize", {
						width: parseInt(el.width(), 10), height: parseInt(el.height(), 10),
						left: parseInt(el.css("left"), 10), top: parseInt(el.css("top"), 10)
					});
				});
			};

		if (typeof(o.alsoResize) === "object" && !o.alsoResize.parentNode) {
			if (o.alsoResize.length) {
				o.alsoResize = o.alsoResize[0];
				_store(o.alsoResize);
			} else {
				$.each(o.alsoResize, function(exp) {
					_store(exp);
				});
			}
		} else {
			_store(o.alsoResize);
		}
	},

	resize: function(event, ui) {
		var that = $(this).resizable( "instance" ),
			o = that.options,
			os = that.originalSize,
			op = that.originalPosition,
			delta = {
				height: (that.size.height - os.height) || 0,
				width: (that.size.width - os.width) || 0,
				top: (that.position.top - op.top) || 0,
				left: (that.position.left - op.left) || 0
			},

			_alsoResize = function(exp, c) {
				$(exp).each(function() {
					var el = $(this), start = $(this).data("ui-resizable-alsoresize"), style = {},
						css = c && c.length ?
							c :
							el.parents(ui.originalElement[0]).length ?
								[ "width", "height" ] :
								[ "width", "height", "top", "left" ];

					$.each(css, function(i, prop) {
						var sum = (start[prop] || 0) + (delta[prop] || 0);
						if (sum && sum >= 0) {
							style[prop] = sum || null;
						}
					});

					el.css(style);
				});
			};

		if (typeof(o.alsoResize) === "object" && !o.alsoResize.nodeType) {
			$.each(o.alsoResize, function(exp, c) {
				_alsoResize(exp, c);
			});
		} else {
			_alsoResize(o.alsoResize);
		}
	},

	stop: function() {
		$(this).removeData("resizable-alsoresize");
	}
});

$.ui.plugin.add("resizable", "ghost", {

	start: function() {

		var that = $(this).resizable( "instance" ), o = that.options, cs = that.size;

		that.ghost = that.originalElement.clone();
		that.ghost
			.css({
				opacity: 0.25,
				display: "block",
				position: "relative",
				height: cs.height,
				width: cs.width,
				margin: 0,
				left: 0,
				top: 0
			})
			.addClass("ui-resizable-ghost")
			.addClass(typeof o.ghost === "string" ? o.ghost : "");

		that.ghost.appendTo(that.helper);

	},

	resize: function() {
		var that = $(this).resizable( "instance" );
		if (that.ghost) {
			that.ghost.css({
				position: "relative",
				height: that.size.height,
				width: that.size.width
			});
		}
	},

	stop: function() {
		var that = $(this).resizable( "instance" );
		if (that.ghost && that.helper) {
			that.helper.get(0).removeChild(that.ghost.get(0));
		}
	}

});

$.ui.plugin.add("resizable", "grid", {

	resize: function() {
		var outerDimensions,
			that = $(this).resizable( "instance" ),
			o = that.options,
			cs = that.size,
			os = that.originalSize,
			op = that.originalPosition,
			a = that.axis,
			grid = typeof o.grid === "number" ? [ o.grid, o.grid ] : o.grid,
			gridX = (grid[0] || 1),
			gridY = (grid[1] || 1),
			ox = Math.round((cs.width - os.width) / gridX) * gridX,
			oy = Math.round((cs.height - os.height) / gridY) * gridY,
			newWidth = os.width + ox,
			newHeight = os.height + oy,
			isMaxWidth = o.maxWidth && (o.maxWidth < newWidth),
			isMaxHeight = o.maxHeight && (o.maxHeight < newHeight),
			isMinWidth = o.minWidth && (o.minWidth > newWidth),
			isMinHeight = o.minHeight && (o.minHeight > newHeight);

		o.grid = grid;

		if (isMinWidth) {
			newWidth += gridX;
		}
		if (isMinHeight) {
			newHeight += gridY;
		}
		if (isMaxWidth) {
			newWidth -= gridX;
		}
		if (isMaxHeight) {
			newHeight -= gridY;
		}

		if (/^(se|s|e)$/.test(a)) {
			that.size.width = newWidth;
			that.size.height = newHeight;
		} else if (/^(ne)$/.test(a)) {
			that.size.width = newWidth;
			that.size.height = newHeight;
			that.position.top = op.top - oy;
		} else if (/^(sw)$/.test(a)) {
			that.size.width = newWidth;
			that.size.height = newHeight;
			that.position.left = op.left - ox;
		} else {
			if ( newHeight - gridY <= 0 || newWidth - gridX <= 0) {
				outerDimensions = that._getPaddingPlusBorderDimensions( this );
			}

			if ( newHeight - gridY > 0 ) {
				that.size.height = newHeight;
				that.position.top = op.top - oy;
			} else {
				newHeight = gridY - outerDimensions.height;
				that.size.height = newHeight;
				that.position.top = op.top + os.height - newHeight;
			}
			if ( newWidth - gridX > 0 ) {
				that.size.width = newWidth;
				that.position.left = op.left - ox;
			} else {
				newWidth = gridY - outerDimensions.height;
				that.size.width = newWidth;
				that.position.left = op.left + os.width - newWidth;
			}
		}
	}

});

var resizable = $.ui.resizable;


/*!
 * jQuery UI Menu 1.11.2
 * http://jqueryui.com
 *
 * Copyright 2014 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/menu/
 */


var menu = $.widget( "ui.menu", {
	version: "1.11.2",
	defaultElement: "<ul>",
	delay: 300,
	options: {
		icons: {
			submenu: "ui-icon-carat-1-e"
		},
		items: "> *",
		menus: "ul",
		position: {
			my: "left-1 top",
			at: "right top"
		},
		role: "menu",

		// callbacks
		blur: null,
		focus: null,
		select: null
	},

	_create: function() {
		this.activeMenu = this.element;

		// Flag used to prevent firing of the click handler
		// as the event bubbles up through nested menus
		this.mouseHandled = false;
		this.element
			.uniqueId()
			.addClass( "ui-menu ui-widget ui-widget-content" )
			.toggleClass( "ui-menu-icons", !!this.element.find( ".ui-icon" ).length )
			.attr({
				role: this.options.role,
				tabIndex: 0
			});

		if ( this.options.disabled ) {
			this.element
				.addClass( "ui-state-disabled" )
				.attr( "aria-disabled", "true" );
		}

		this._on({
			// Prevent focus from sticking to links inside menu after clicking
			// them (focus should always stay on UL during navigation).
			"mousedown .ui-menu-item": function( event ) {
				event.preventDefault();
			},
			"click .ui-menu-item": function( event ) {
				var target = $( event.target );
				if ( !this.mouseHandled && target.not( ".ui-state-disabled" ).length ) {
					this.select( event );

					// Only set the mouseHandled flag if the event will bubble, see #9469.
					if ( !event.isPropagationStopped() ) {
						this.mouseHandled = true;
					}

					// Open submenu on click
					if ( target.has( ".ui-menu" ).length ) {
						this.expand( event );
					} else if ( !this.element.is( ":focus" ) && $( this.document[ 0 ].activeElement ).closest( ".ui-menu" ).length ) {

						// Redirect focus to the menu
						this.element.trigger( "focus", [ true ] );

						// If the active item is on the top level, let it stay active.
						// Otherwise, blur the active item since it is no longer visible.
						if ( this.active && this.active.parents( ".ui-menu" ).length === 1 ) {
							clearTimeout( this.timer );
						}
					}
				}
			},
			"mouseenter .ui-menu-item": function( event ) {
				// Ignore mouse events while typeahead is active, see #10458.
				// Prevents focusing the wrong item when typeahead causes a scroll while the mouse
				// is over an item in the menu
				if ( this.previousFilter ) {
					return;
				}
				var target = $( event.currentTarget );
				// Remove ui-state-active class from siblings of the newly focused menu item
				// to avoid a jump caused by adjacent elements both having a class with a border
				target.siblings( ".ui-state-active" ).removeClass( "ui-state-active" );
				this.focus( event, target );
			},
			mouseleave: "collapseAll",
			"mouseleave .ui-menu": "collapseAll",
			focus: function( event, keepActiveItem ) {
				// If there's already an active item, keep it active
				// If not, activate the first item
				var item = this.active || this.element.find( this.options.items ).eq( 0 );

				if ( !keepActiveItem ) {
					this.focus( event, item );
				}
			},
			blur: function( event ) {
				this._delay(function() {
					if ( !$.contains( this.element[0], this.document[0].activeElement ) ) {
						this.collapseAll( event );
					}
				});
			},
			keydown: "_keydown"
		});

		this.refresh();

		// Clicks outside of a menu collapse any open menus
		this._on( this.document, {
			click: function( event ) {
				if ( this._closeOnDocumentClick( event ) ) {
					this.collapseAll( event );
				}

				// Reset the mouseHandled flag
				this.mouseHandled = false;
			}
		});
	},

	_destroy: function() {
		// Destroy (sub)menus
		this.element
			.removeAttr( "aria-activedescendant" )
			.find( ".ui-menu" ).addBack()
				.removeClass( "ui-menu ui-widget ui-widget-content ui-menu-icons ui-front" )
				.removeAttr( "role" )
				.removeAttr( "tabIndex" )
				.removeAttr( "aria-labelledby" )
				.removeAttr( "aria-expanded" )
				.removeAttr( "aria-hidden" )
				.removeAttr( "aria-disabled" )
				.removeUniqueId()
				.show();

		// Destroy menu items
		this.element.find( ".ui-menu-item" )
			.removeClass( "ui-menu-item" )
			.removeAttr( "role" )
			.removeAttr( "aria-disabled" )
			.removeUniqueId()
			.removeClass( "ui-state-hover" )
			.removeAttr( "tabIndex" )
			.removeAttr( "role" )
			.removeAttr( "aria-haspopup" )
			.children().each( function() {
				var elem = $( this );
				if ( elem.data( "ui-menu-submenu-carat" ) ) {
					elem.remove();
				}
			});

		// Destroy menu dividers
		this.element.find( ".ui-menu-divider" ).removeClass( "ui-menu-divider ui-widget-content" );
	},

	_keydown: function( event ) {
		var match, prev, character, skip,
			preventDefault = true;

		switch ( event.keyCode ) {
		case $.ui.keyCode.PAGE_UP:
			this.previousPage( event );
			break;
		case $.ui.keyCode.PAGE_DOWN:
			this.nextPage( event );
			break;
		case $.ui.keyCode.HOME:
			this._move( "first", "first", event );
			break;
		case $.ui.keyCode.END:
			this._move( "last", "last", event );
			break;
		case $.ui.keyCode.UP:
			this.previous( event );
			break;
		case $.ui.keyCode.DOWN:
			this.next( event );
			break;
		case $.ui.keyCode.LEFT:
			this.collapse( event );
			break;
		case $.ui.keyCode.RIGHT:
			if ( this.active && !this.active.is( ".ui-state-disabled" ) ) {
				this.expand( event );
			}
			break;
		case $.ui.keyCode.ENTER:
		case $.ui.keyCode.SPACE:
			this._activate( event );
			break;
		case $.ui.keyCode.ESCAPE:
			this.collapse( event );
			break;
		default:
			preventDefault = false;
			prev = this.previousFilter || "";
			character = String.fromCharCode( event.keyCode );
			skip = false;

			clearTimeout( this.filterTimer );

			if ( character === prev ) {
				skip = true;
			} else {
				character = prev + character;
			}

			match = this._filterMenuItems( character );
			match = skip && match.index( this.active.next() ) !== -1 ?
				this.active.nextAll( ".ui-menu-item" ) :
				match;

			// If no matches on the current filter, reset to the last character pressed
			// to move down the menu to the first item that starts with that character
			if ( !match.length ) {
				character = String.fromCharCode( event.keyCode );
				match = this._filterMenuItems( character );
			}

			if ( match.length ) {
				this.focus( event, match );
				this.previousFilter = character;
				this.filterTimer = this._delay(function() {
					delete this.previousFilter;
				}, 1000 );
			} else {
				delete this.previousFilter;
			}
		}

		if ( preventDefault ) {
			event.preventDefault();
		}
	},

	_activate: function( event ) {
		if ( !this.active.is( ".ui-state-disabled" ) ) {
			if ( this.active.is( "[aria-haspopup='true']" ) ) {
				this.expand( event );
			} else {
				this.select( event );
			}
		}
	},

	refresh: function() {
		var menus, items,
			that = this,
			icon = this.options.icons.submenu,
			submenus = this.element.find( this.options.menus );

		this.element.toggleClass( "ui-menu-icons", !!this.element.find( ".ui-icon" ).length );

		// Initialize nested menus
		submenus.filter( ":not(.ui-menu)" )
			.addClass( "ui-menu ui-widget ui-widget-content ui-front" )
			.hide()
			.attr({
				role: this.options.role,
				"aria-hidden": "true",
				"aria-expanded": "false"
			})
			.each(function() {
				var menu = $( this ),
					item = menu.parent(),
					submenuCarat = $( "<span>" )
						.addClass( "ui-menu-icon ui-icon " + icon )
						.data( "ui-menu-submenu-carat", true );

				item
					.attr( "aria-haspopup", "true" )
					.prepend( submenuCarat );
				menu.attr( "aria-labelledby", item.attr( "id" ) );
			});

		menus = submenus.add( this.element );
		items = menus.find( this.options.items );

		// Initialize menu-items containing spaces and/or dashes only as dividers
		items.not( ".ui-menu-item" ).each(function() {
			var item = $( this );
			if ( that._isDivider( item ) ) {
				item.addClass( "ui-widget-content ui-menu-divider" );
			}
		});

		// Don't refresh list items that are already adapted
		items.not( ".ui-menu-item, .ui-menu-divider" )
			.addClass( "ui-menu-item" )
			.uniqueId()
			.attr({
				tabIndex: -1,
				role: this._itemRole()
			});

		// Add aria-disabled attribute to any disabled menu item
		items.filter( ".ui-state-disabled" ).attr( "aria-disabled", "true" );

		// If the active item has been removed, blur the menu
		if ( this.active && !$.contains( this.element[ 0 ], this.active[ 0 ] ) ) {
			this.blur();
		}
	},

	_itemRole: function() {
		return {
			menu: "menuitem",
			listbox: "option"
		}[ this.options.role ];
	},

	_setOption: function( key, value ) {
		if ( key === "icons" ) {
			this.element.find( ".ui-menu-icon" )
				.removeClass( this.options.icons.submenu )
				.addClass( value.submenu );
		}
		if ( key === "disabled" ) {
			this.element
				.toggleClass( "ui-state-disabled", !!value )
				.attr( "aria-disabled", value );
		}
		this._super( key, value );
	},

	focus: function( event, item ) {
		var nested, focused;
		this.blur( event, event && event.type === "focus" );

		this._scrollIntoView( item );

		this.active = item.first();
		focused = this.active.addClass( "ui-state-focus" ).removeClass( "ui-state-active" );
		// Only update aria-activedescendant if there's a role
		// otherwise we assume focus is managed elsewhere
		if ( this.options.role ) {
			this.element.attr( "aria-activedescendant", focused.attr( "id" ) );
		}

		// Highlight active parent menu item, if any
		this.active
			.parent()
			.closest( ".ui-menu-item" )
			.addClass( "ui-state-active" );

		if ( event && event.type === "keydown" ) {
			this._close();
		} else {
			this.timer = this._delay(function() {
				this._close();
			}, this.delay );
		}

		nested = item.children( ".ui-menu" );
		if ( nested.length && event && ( /^mouse/.test( event.type ) ) ) {
			this._startOpening(nested);
		}
		this.activeMenu = item.parent();

		this._trigger( "focus", event, { item: item } );
	},

	_scrollIntoView: function( item ) {
		var borderTop, paddingTop, offset, scroll, elementHeight, itemHeight;
		if ( this._hasScroll() ) {
			borderTop = parseFloat( $.css( this.activeMenu[0], "borderTopWidth" ) ) || 0;
			paddingTop = parseFloat( $.css( this.activeMenu[0], "paddingTop" ) ) || 0;
			offset = item.offset().top - this.activeMenu.offset().top - borderTop - paddingTop;
			scroll = this.activeMenu.scrollTop();
			elementHeight = this.activeMenu.height();
			itemHeight = item.outerHeight();

			if ( offset < 0 ) {
				this.activeMenu.scrollTop( scroll + offset );
			} else if ( offset + itemHeight > elementHeight ) {
				this.activeMenu.scrollTop( scroll + offset - elementHeight + itemHeight );
			}
		}
	},

	blur: function( event, fromFocus ) {
		if ( !fromFocus ) {
			clearTimeout( this.timer );
		}

		if ( !this.active ) {
			return;
		}

		this.active.removeClass( "ui-state-focus" );
		this.active = null;

		this._trigger( "blur", event, { item: this.active } );
	},

	_startOpening: function( submenu ) {
		clearTimeout( this.timer );

		// Don't open if already open fixes a Firefox bug that caused a .5 pixel
		// shift in the submenu position when mousing over the carat icon
		if ( submenu.attr( "aria-hidden" ) !== "true" ) {
			return;
		}

		this.timer = this._delay(function() {
			this._close();
			this._open( submenu );
		}, this.delay );
	},

	_open: function( submenu ) {
		var position = $.extend({
			of: this.active
		}, this.options.position );

		clearTimeout( this.timer );
		this.element.find( ".ui-menu" ).not( submenu.parents( ".ui-menu" ) )
			.hide()
			.attr( "aria-hidden", "true" );

		submenu
			.show()
			.removeAttr( "aria-hidden" )
			.attr( "aria-expanded", "true" )
			.position( position );
	},

	collapseAll: function( event, all ) {
		clearTimeout( this.timer );
		this.timer = this._delay(function() {
			// If we were passed an event, look for the submenu that contains the event
			var currentMenu = all ? this.element :
				$( event && event.target ).closest( this.element.find( ".ui-menu" ) );

			// If we found no valid submenu ancestor, use the main menu to close all sub menus anyway
			if ( !currentMenu.length ) {
				currentMenu = this.element;
			}

			this._close( currentMenu );

			this.blur( event );
			this.activeMenu = currentMenu;
		}, this.delay );
	},

	// With no arguments, closes the currently active menu - if nothing is active
	// it closes all menus.  If passed an argument, it will search for menus BELOW
	_close: function( startMenu ) {
		if ( !startMenu ) {
			startMenu = this.active ? this.active.parent() : this.element;
		}

		startMenu
			.find( ".ui-menu" )
				.hide()
				.attr( "aria-hidden", "true" )
				.attr( "aria-expanded", "false" )
			.end()
			.find( ".ui-state-active" ).not( ".ui-state-focus" )
				.removeClass( "ui-state-active" );
	},

	_closeOnDocumentClick: function( event ) {
		return !$( event.target ).closest( ".ui-menu" ).length;
	},

	_isDivider: function( item ) {

		// Match hyphen, em dash, en dash
		return !/[^\-\u2014\u2013\s]/.test( item.text() );
	},

	collapse: function( event ) {
		var newItem = this.active &&
			this.active.parent().closest( ".ui-menu-item", this.element );
		if ( newItem && newItem.length ) {
			this._close();
			this.focus( event, newItem );
		}
	},

	expand: function( event ) {
		var newItem = this.active &&
			this.active
				.children( ".ui-menu " )
				.find( this.options.items )
				.first();

		if ( newItem && newItem.length ) {
			this._open( newItem.parent() );

			// Delay so Firefox will not hide activedescendant change in expanding submenu from AT
			this._delay(function() {
				this.focus( event, newItem );
			});
		}
	},

	next: function( event ) {
		this._move( "next", "first", event );
	},

	previous: function( event ) {
		this._move( "prev", "last", event );
	},

	isFirstItem: function() {
		return this.active && !this.active.prevAll( ".ui-menu-item" ).length;
	},

	isLastItem: function() {
		return this.active && !this.active.nextAll( ".ui-menu-item" ).length;
	},

	_move: function( direction, filter, event ) {
		var next;
		if ( this.active ) {
			if ( direction === "first" || direction === "last" ) {
				next = this.active
					[ direction === "first" ? "prevAll" : "nextAll" ]( ".ui-menu-item" )
					.eq( -1 );
			} else {
				next = this.active
					[ direction + "All" ]( ".ui-menu-item" )
					.eq( 0 );
			}
		}
		if ( !next || !next.length || !this.active ) {
			next = this.activeMenu.find( this.options.items )[ filter ]();
		}

		this.focus( event, next );
	},

	nextPage: function( event ) {
		var item, base, height;

		if ( !this.active ) {
			this.next( event );
			return;
		}
		if ( this.isLastItem() ) {
			return;
		}
		if ( this._hasScroll() ) {
			base = this.active.offset().top;
			height = this.element.height();
			this.active.nextAll( ".ui-menu-item" ).each(function() {
				item = $( this );
				return item.offset().top - base - height < 0;
			});

			this.focus( event, item );
		} else {
			this.focus( event, this.activeMenu.find( this.options.items )
				[ !this.active ? "first" : "last" ]() );
		}
	},

	previousPage: function( event ) {
		var item, base, height;
		if ( !this.active ) {
			this.next( event );
			return;
		}
		if ( this.isFirstItem() ) {
			return;
		}
		if ( this._hasScroll() ) {
			base = this.active.offset().top;
			height = this.element.height();
			this.active.prevAll( ".ui-menu-item" ).each(function() {
				item = $( this );
				return item.offset().top - base + height > 0;
			});

			this.focus( event, item );
		} else {
			this.focus( event, this.activeMenu.find( this.options.items ).first() );
		}
	},

	_hasScroll: function() {
		return this.element.outerHeight() < this.element.prop( "scrollHeight" );
	},

	select: function( event ) {
		// TODO: It should never be possible to not have an active item at this
		// point, but the tests don't trigger mouseenter before click.
		this.active = this.active || $( event.target ).closest( ".ui-menu-item" );
		var ui = { item: this.active };
		if ( !this.active.has( ".ui-menu" ).length ) {
			this.collapseAll( event, true );
		}
		this._trigger( "select", event, ui );
	},

	_filterMenuItems: function(character) {
		var escapedCharacter = character.replace( /[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&" ),
			regex = new RegExp( "^" + escapedCharacter, "i" );

		return this.activeMenu
			.find( this.options.items )

			// Only match on items, not dividers or other content (#10571)
			.filter( ".ui-menu-item" )
			.filter(function() {
				return regex.test( $.trim( $( this ).text() ) );
			});
	}
});


/*!
 * jQuery UI Autocomplete 1.11.2
 * http://jqueryui.com
 *
 * Copyright 2014 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/autocomplete/
 */


$.widget( "ui.autocomplete", {
	version: "1.11.2",
	defaultElement: "<input>",
	options: {
		appendTo: null,
		autoFocus: false,
		delay: 300,
		minLength: 1,
		position: {
			my: "left top",
			at: "left bottom",
			collision: "none"
		},
		source: null,

		// callbacks
		change: null,
		close: null,
		focus: null,
		open: null,
		response: null,
		search: null,
		select: null
	},

	requestIndex: 0,
	pending: 0,

	_create: function() {
		// Some browsers only repeat keydown events, not keypress events,
		// so we use the suppressKeyPress flag to determine if we've already
		// handled the keydown event. #7269
		// Unfortunately the code for & in keypress is the same as the up arrow,
		// so we use the suppressKeyPressRepeat flag to avoid handling keypress
		// events when we know the keydown event was used to modify the
		// search term. #7799
		var suppressKeyPress, suppressKeyPressRepeat, suppressInput,
			nodeName = this.element[ 0 ].nodeName.toLowerCase(),
			isTextarea = nodeName === "textarea",
			isInput = nodeName === "input";

		this.isMultiLine =
			// Textareas are always multi-line
			isTextarea ? true :
			// Inputs are always single-line, even if inside a contentEditable element
			// IE also treats inputs as contentEditable
			isInput ? false :
			// All other element types are determined by whether or not they're contentEditable
			this.element.prop( "isContentEditable" );

		this.valueMethod = this.element[ isTextarea || isInput ? "val" : "text" ];
		this.isNewMenu = true;

		this.element
			.addClass( "ui-autocomplete-input" )
			.attr( "autocomplete", "off" );

		this._on( this.element, {
			keydown: function( event ) {
				if ( this.element.prop( "readOnly" ) ) {
					suppressKeyPress = true;
					suppressInput = true;
					suppressKeyPressRepeat = true;
					return;
				}

				suppressKeyPress = false;
				suppressInput = false;
				suppressKeyPressRepeat = false;
				var keyCode = $.ui.keyCode;
				switch ( event.keyCode ) {
				case keyCode.PAGE_UP:
					suppressKeyPress = true;
					this._move( "previousPage", event );
					break;
				case keyCode.PAGE_DOWN:
					suppressKeyPress = true;
					this._move( "nextPage", event );
					break;
				case keyCode.UP:
					suppressKeyPress = true;
					this._keyEvent( "previous", event );
					break;
				case keyCode.DOWN:
					suppressKeyPress = true;
					this._keyEvent( "next", event );
					break;
				case keyCode.ENTER:
					// when menu is open and has focus
					if ( this.menu.active ) {
						// #6055 - Opera still allows the keypress to occur
						// which causes forms to submit
						suppressKeyPress = true;
						event.preventDefault();
						this.menu.select( event );
					}
					break;
				case keyCode.TAB:
					if ( this.menu.active ) {
						this.menu.select( event );
					}
					break;
				case keyCode.ESCAPE:
					if ( this.menu.element.is( ":visible" ) ) {
						if ( !this.isMultiLine ) {
							this._value( this.term );
						}
						this.close( event );
						// Different browsers have different default behavior for escape
						// Single press can mean undo or clear
						// Double press in IE means clear the whole form
						event.preventDefault();
					}
					break;
				default:
					suppressKeyPressRepeat = true;
					// search timeout should be triggered before the input value is changed
					this._searchTimeout( event );
					break;
				}
			},
			keypress: function( event ) {
				if ( suppressKeyPress ) {
					suppressKeyPress = false;
					if ( !this.isMultiLine || this.menu.element.is( ":visible" ) ) {
						event.preventDefault();
					}
					return;
				}
				if ( suppressKeyPressRepeat ) {
					return;
				}

				// replicate some key handlers to allow them to repeat in Firefox and Opera
				var keyCode = $.ui.keyCode;
				switch ( event.keyCode ) {
				case keyCode.PAGE_UP:
					this._move( "previousPage", event );
					break;
				case keyCode.PAGE_DOWN:
					this._move( "nextPage", event );
					break;
				case keyCode.UP:
					this._keyEvent( "previous", event );
					break;
				case keyCode.DOWN:
					this._keyEvent( "next", event );
					break;
				}
			},
			input: function( event ) {
				if ( suppressInput ) {
					suppressInput = false;
					event.preventDefault();
					return;
				}
				this._searchTimeout( event );
			},
			focus: function() {
				this.selectedItem = null;
				this.previous = this._value();
			},
			blur: function( event ) {
				if ( this.cancelBlur ) {
					delete this.cancelBlur;
					return;
				}

				clearTimeout( this.searching );
				this.close( event );
				this._change( event );
			}
		});

		this._initSource();
		this.menu = $( "<ul>" )
			.addClass( "ui-autocomplete ui-front" )
			.appendTo( this._appendTo() )
			.menu({
				// disable ARIA support, the live region takes care of that
				role: null
			})
			.hide()
			.menu( "instance" );

		this._on( this.menu.element, {
			mousedown: function( event ) {
				// prevent moving focus out of the text field
				event.preventDefault();

				// IE doesn't prevent moving focus even with event.preventDefault()
				// so we set a flag to know when we should ignore the blur event
				this.cancelBlur = true;
				this._delay(function() {
					delete this.cancelBlur;
				});

				// clicking on the scrollbar causes focus to shift to the body
				// but we can't detect a mouseup or a click immediately afterward
				// so we have to track the next mousedown and close the menu if
				// the user clicks somewhere outside of the autocomplete
				var menuElement = this.menu.element[ 0 ];
				if ( !$( event.target ).closest( ".ui-menu-item" ).length ) {
					this._delay(function() {
						var that = this;
						this.document.one( "mousedown", function( event ) {
							if ( event.target !== that.element[ 0 ] &&
									event.target !== menuElement &&
									!$.contains( menuElement, event.target ) ) {
								that.close();
							}
						});
					});
				}
			},
			menufocus: function( event, ui ) {
				var label, item;
				// support: Firefox
				// Prevent accidental activation of menu items in Firefox (#7024 #9118)
				if ( this.isNewMenu ) {
					this.isNewMenu = false;
					if ( event.originalEvent && /^mouse/.test( event.originalEvent.type ) ) {
						this.menu.blur();

						this.document.one( "mousemove", function() {
							$( event.target ).trigger( event.originalEvent );
						});

						return;
					}
				}

				item = ui.item.data( "ui-autocomplete-item" );
				if ( false !== this._trigger( "focus", event, { item: item } ) ) {
					// use value to match what will end up in the input, if it was a key event
					if ( event.originalEvent && /^key/.test( event.originalEvent.type ) ) {
						this._value( item.value );
					}
				}

				// Announce the value in the liveRegion
				label = ui.item.attr( "aria-label" ) || item.value;
				if ( label && $.trim( label ).length ) {
					this.liveRegion.children().hide();
					$( "<div>" ).text( label ).appendTo( this.liveRegion );
				}
			},
			menuselect: function( event, ui ) {
				var item = ui.item.data( "ui-autocomplete-item" ),
					previous = this.previous;

				// only trigger when focus was lost (click on menu)
				if ( this.element[ 0 ] !== this.document[ 0 ].activeElement ) {
					this.element.focus();
					this.previous = previous;
					// #6109 - IE triggers two focus events and the second
					// is asynchronous, so we need to reset the previous
					// term synchronously and asynchronously :-(
					this._delay(function() {
						this.previous = previous;
						this.selectedItem = item;
					});
				}

				if ( false !== this._trigger( "select", event, { item: item } ) ) {
					this._value( item.value );
				}
				// reset the term after the select event
				// this allows custom select handling to work properly
				this.term = this._value();

				this.close( event );
				this.selectedItem = item;
			}
		});

		this.liveRegion = $( "<span>", {
				role: "status",
				"aria-live": "assertive",
				"aria-relevant": "additions"
			})
			.addClass( "ui-helper-hidden-accessible" )
			.appendTo( this.document[ 0 ].body );

		// turning off autocomplete prevents the browser from remembering the
		// value when navigating through history, so we re-enable autocomplete
		// if the page is unloaded before the widget is destroyed. #7790
		this._on( this.window, {
			beforeunload: function() {
				this.element.removeAttr( "autocomplete" );
			}
		});
	},

	_destroy: function() {
		clearTimeout( this.searching );
		this.element
			.removeClass( "ui-autocomplete-input" )
			.removeAttr( "autocomplete" );
		this.menu.element.remove();
		this.liveRegion.remove();
	},

	_setOption: function( key, value ) {
		this._super( key, value );
		if ( key === "source" ) {
			this._initSource();
		}
		if ( key === "appendTo" ) {
			this.menu.element.appendTo( this._appendTo() );
		}
		if ( key === "disabled" && value && this.xhr ) {
			this.xhr.abort();
		}
	},

	_appendTo: function() {
		var element = this.options.appendTo;

		if ( element ) {
			element = element.jquery || element.nodeType ?
				$( element ) :
				this.document.find( element ).eq( 0 );
		}

		if ( !element || !element[ 0 ] ) {
			element = this.element.closest( ".ui-front" );
		}

		if ( !element.length ) {
			element = this.document[ 0 ].body;
		}

		return element;
	},

	_initSource: function() {
		var array, url,
			that = this;
		if ( $.isArray( this.options.source ) ) {
			array = this.options.source;
			this.source = function( request, response ) {
				response( $.ui.autocomplete.filter( array, request.term ) );
			};
		} else if ( typeof this.options.source === "string" ) {
			url = this.options.source;
			this.source = function( request, response ) {
				if ( that.xhr ) {
					that.xhr.abort();
				}
				that.xhr = $.ajax({
					url: url,
					data: request,
					dataType: "json",
					success: function( data ) {
						response( data );
					},
					error: function() {
						response([]);
					}
				});
			};
		} else {
			this.source = this.options.source;
		}
	},

	_searchTimeout: function( event ) {
		clearTimeout( this.searching );
		this.searching = this._delay(function() {

			// Search if the value has changed, or if the user retypes the same value (see #7434)
			var equalValues = this.term === this._value(),
				menuVisible = this.menu.element.is( ":visible" ),
				modifierKey = event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;

			if ( !equalValues || ( equalValues && !menuVisible && !modifierKey ) ) {
				this.selectedItem = null;
				this.search( null, event );
			}
		}, this.options.delay );
	},

	search: function( value, event ) {
		value = value != null ? value : this._value();

		// always save the actual value, not the one passed as an argument
		this.term = this._value();

		if ( value.length < this.options.minLength ) {
			return this.close( event );
		}

		if ( this._trigger( "search", event ) === false ) {
			return;
		}

		return this._search( value );
	},

	_search: function( value ) {
		this.pending++;
		this.element.addClass( "ui-autocomplete-loading" );
		this.cancelSearch = false;

		this.source( { term: value }, this._response() );
	},

	_response: function() {
		var index = ++this.requestIndex;

		return $.proxy(function( content ) {
			if ( index === this.requestIndex ) {
				this.__response( content );
			}

			this.pending--;
			if ( !this.pending ) {
				this.element.removeClass( "ui-autocomplete-loading" );
			}
		}, this );
	},

	__response: function( content ) {
		if ( content ) {
			content = this._normalize( content );
		}
		this._trigger( "response", null, { content: content } );
		if ( !this.options.disabled && content && content.length && !this.cancelSearch ) {
			this._suggest( content );
			this._trigger( "open" );
		} else {
			// use ._close() instead of .close() so we don't cancel future searches
			this._close();
		}
	},

	close: function( event ) {
		this.cancelSearch = true;
		this._close( event );
	},

	_close: function( event ) {
		if ( this.menu.element.is( ":visible" ) ) {
			this.menu.element.hide();
			this.menu.blur();
			this.isNewMenu = true;
			this._trigger( "close", event );
		}
	},

	_change: function( event ) {
		if ( this.previous !== this._value() ) {
			this._trigger( "change", event, { item: this.selectedItem } );
		}
	},

	_normalize: function( items ) {
		// assume all items have the right format when the first item is complete
		if ( items.length && items[ 0 ].label && items[ 0 ].value ) {
			return items;
		}
		return $.map( items, function( item ) {
			if ( typeof item === "string" ) {
				return {
					label: item,
					value: item
				};
			}
			return $.extend( {}, item, {
				label: item.label || item.value,
				value: item.value || item.label
			});
		});
	},

	_suggest: function( items ) {
		var ul = this.menu.element.empty();
		this._renderMenu( ul, items );
		this.isNewMenu = true;
		this.menu.refresh();

		// size and position menu
		ul.show();
		this._resizeMenu();
		ul.position( $.extend({
			of: this.element
		}, this.options.position ) );

		if ( this.options.autoFocus ) {
			this.menu.next();
		}
	},

	_resizeMenu: function() {
		var ul = this.menu.element;
		ul.outerWidth( Math.max(
			// Firefox wraps long text (possibly a rounding bug)
			// so we add 1px to avoid the wrapping (#7513)
			ul.width( "" ).outerWidth() + 1,
			this.element.outerWidth()
		) );
	},

	_renderMenu: function( ul, items ) {
		var that = this;
		$.each( items, function( index, item ) {
			that._renderItemData( ul, item );
		});
	},

	_renderItemData: function( ul, item ) {
		return this._renderItem( ul, item ).data( "ui-autocomplete-item", item );
	},

	_renderItem: function( ul, item ) {
		return $( "<li>" ).text( item.label ).appendTo( ul );
	},

	_move: function( direction, event ) {
		if ( !this.menu.element.is( ":visible" ) ) {
			this.search( null, event );
			return;
		}
		if ( this.menu.isFirstItem() && /^previous/.test( direction ) ||
				this.menu.isLastItem() && /^next/.test( direction ) ) {

			if ( !this.isMultiLine ) {
				this._value( this.term );
			}

			this.menu.blur();
			return;
		}
		this.menu[ direction ]( event );
	},

	widget: function() {
		return this.menu.element;
	},

	_value: function() {
		return this.valueMethod.apply( this.element, arguments );
	},

	_keyEvent: function( keyEvent, event ) {
		if ( !this.isMultiLine || this.menu.element.is( ":visible" ) ) {
			this._move( keyEvent, event );

			// prevents moving cursor to beginning/end of the text field in some browsers
			event.preventDefault();
		}
	}
});

$.extend( $.ui.autocomplete, {
	escapeRegex: function( value ) {
		return value.replace( /[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&" );
	},
	filter: function( array, term ) {
		var matcher = new RegExp( $.ui.autocomplete.escapeRegex( term ), "i" );
		return $.grep( array, function( value ) {
			return matcher.test( value.label || value.value || value );
		});
	}
});

// live region extension, adding a `messages` option
// NOTE: This is an experimental API. We are still investigating
// a full solution for string manipulation and internationalization.
$.widget( "ui.autocomplete", $.ui.autocomplete, {
	options: {
		messages: {
			noResults: "No search results.",
			results: function( amount ) {
				return amount + ( amount > 1 ? " results are" : " result is" ) +
					" available, use up and down arrow keys to navigate.";
			}
		}
	},

	__response: function( content ) {
		var message;
		this._superApply( arguments );
		if ( this.options.disabled || this.cancelSearch ) {
			return;
		}
		if ( content && content.length ) {
			message = this.options.messages.results( content.length );
		} else {
			message = this.options.messages.noResults;
		}
		this.liveRegion.children().hide();
		$( "<div>" ).text( message ).appendTo( this.liveRegion );
	}
});

var autocomplete = $.ui.autocomplete;


/*!
 * jQuery UI Button 1.11.2
 * http://jqueryui.com
 *
 * Copyright 2014 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/button/
 */


var lastActive,
	baseClasses = "ui-button ui-widget ui-state-default ui-corner-all",
	typeClasses = "ui-button-icons-only ui-button-icon-only ui-button-text-icons ui-button-text-icon-primary ui-button-text-icon-secondary ui-button-text-only",
	formResetHandler = function() {
		var form = $( this );
		setTimeout(function() {
			form.find( ":ui-button" ).button( "refresh" );
		}, 1 );
	},
	radioGroup = function( radio ) {
		var name = radio.name,
			form = radio.form,
			radios = $( [] );
		if ( name ) {
			name = name.replace( /'/g, "\\'" );
			if ( form ) {
				radios = $( form ).find( "[name='" + name + "'][type=radio]" );
			} else {
				radios = $( "[name='" + name + "'][type=radio]", radio.ownerDocument )
					.filter(function() {
						return !this.form;
					});
			}
		}
		return radios;
	};

$.widget( "ui.button", {
	version: "1.11.2",
	defaultElement: "<button>",
	options: {
		disabled: null,
		text: true,
		label: null,
		icons: {
			primary: null,
			secondary: null
		}
	},
	_create: function() {
		this.element.closest( "form" )
			.unbind( "reset" + this.eventNamespace )
			.bind( "reset" + this.eventNamespace, formResetHandler );

		if ( typeof this.options.disabled !== "boolean" ) {
			this.options.disabled = !!this.element.prop( "disabled" );
		} else {
			this.element.prop( "disabled", this.options.disabled );
		}

		this._determineButtonType();
		this.hasTitle = !!this.buttonElement.attr( "title" );

		var that = this,
			options = this.options,
			toggleButton = this.type === "checkbox" || this.type === "radio",
			activeClass = !toggleButton ? "ui-state-active" : "";

		if ( options.label === null ) {
			options.label = (this.type === "input" ? this.buttonElement.val() : this.buttonElement.html());
		}

		this._hoverable( this.buttonElement );

		this.buttonElement
			.addClass( baseClasses )
			.attr( "role", "button" )
			.bind( "mouseenter" + this.eventNamespace, function() {
				if ( options.disabled ) {
					return;
				}
				if ( this === lastActive ) {
					$( this ).addClass( "ui-state-active" );
				}
			})
			.bind( "mouseleave" + this.eventNamespace, function() {
				if ( options.disabled ) {
					return;
				}
				$( this ).removeClass( activeClass );
			})
			.bind( "click" + this.eventNamespace, function( event ) {
				if ( options.disabled ) {
					event.preventDefault();
					event.stopImmediatePropagation();
				}
			});

		// Can't use _focusable() because the element that receives focus
		// and the element that gets the ui-state-focus class are different
		this._on({
			focus: function() {
				this.buttonElement.addClass( "ui-state-focus" );
			},
			blur: function() {
				this.buttonElement.removeClass( "ui-state-focus" );
			}
		});

		if ( toggleButton ) {
			this.element.bind( "change" + this.eventNamespace, function() {
				that.refresh();
			});
		}

		if ( this.type === "checkbox" ) {
			this.buttonElement.bind( "click" + this.eventNamespace, function() {
				if ( options.disabled ) {
					return false;
				}
			});
		} else if ( this.type === "radio" ) {
			this.buttonElement.bind( "click" + this.eventNamespace, function() {
				if ( options.disabled ) {
					return false;
				}
				$( this ).addClass( "ui-state-active" );
				that.buttonElement.attr( "aria-pressed", "true" );

				var radio = that.element[ 0 ];
				radioGroup( radio )
					.not( radio )
					.map(function() {
						return $( this ).button( "widget" )[ 0 ];
					})
					.removeClass( "ui-state-active" )
					.attr( "aria-pressed", "false" );
			});
		} else {
			this.buttonElement
				.bind( "mousedown" + this.eventNamespace, function() {
					if ( options.disabled ) {
						return false;
					}
					$( this ).addClass( "ui-state-active" );
					lastActive = this;
					that.document.one( "mouseup", function() {
						lastActive = null;
					});
				})
				.bind( "mouseup" + this.eventNamespace, function() {
					if ( options.disabled ) {
						return false;
					}
					$( this ).removeClass( "ui-state-active" );
				})
				.bind( "keydown" + this.eventNamespace, function(event) {
					if ( options.disabled ) {
						return false;
					}
					if ( event.keyCode === $.ui.keyCode.SPACE || event.keyCode === $.ui.keyCode.ENTER ) {
						$( this ).addClass( "ui-state-active" );
					}
				})
				// see #8559, we bind to blur here in case the button element loses
				// focus between keydown and keyup, it would be left in an "active" state
				.bind( "keyup" + this.eventNamespace + " blur" + this.eventNamespace, function() {
					$( this ).removeClass( "ui-state-active" );
				});

			if ( this.buttonElement.is("a") ) {
				this.buttonElement.keyup(function(event) {
					if ( event.keyCode === $.ui.keyCode.SPACE ) {
						// TODO pass through original event correctly (just as 2nd argument doesn't work)
						$( this ).click();
					}
				});
			}
		}

		this._setOption( "disabled", options.disabled );
		this._resetButton();
	},

	_determineButtonType: function() {
		var ancestor, labelSelector, checked;

		if ( this.element.is("[type=checkbox]") ) {
			this.type = "checkbox";
		} else if ( this.element.is("[type=radio]") ) {
			this.type = "radio";
		} else if ( this.element.is("input") ) {
			this.type = "input";
		} else {
			this.type = "button";
		}

		if ( this.type === "checkbox" || this.type === "radio" ) {
			// we don't search against the document in case the element
			// is disconnected from the DOM
			ancestor = this.element.parents().last();
			labelSelector = "label[for='" + this.element.attr("id") + "']";
			this.buttonElement = ancestor.find( labelSelector );
			if ( !this.buttonElement.length ) {
				ancestor = ancestor.length ? ancestor.siblings() : this.element.siblings();
				this.buttonElement = ancestor.filter( labelSelector );
				if ( !this.buttonElement.length ) {
					this.buttonElement = ancestor.find( labelSelector );
				}
			}
			this.element.addClass( "ui-helper-hidden-accessible" );

			checked = this.element.is( ":checked" );
			if ( checked ) {
				this.buttonElement.addClass( "ui-state-active" );
			}
			this.buttonElement.prop( "aria-pressed", checked );
		} else {
			this.buttonElement = this.element;
		}
	},

	widget: function() {
		return this.buttonElement;
	},

	_destroy: function() {
		this.element
			.removeClass( "ui-helper-hidden-accessible" );
		this.buttonElement
			.removeClass( baseClasses + " ui-state-active " + typeClasses )
			.removeAttr( "role" )
			.removeAttr( "aria-pressed" )
			.html( this.buttonElement.find(".ui-button-text").html() );

		if ( !this.hasTitle ) {
			this.buttonElement.removeAttr( "title" );
		}
	},

	_setOption: function( key, value ) {
		this._super( key, value );
		if ( key === "disabled" ) {
			this.widget().toggleClass( "ui-state-disabled", !!value );
			this.element.prop( "disabled", !!value );
			if ( value ) {
				if ( this.type === "checkbox" || this.type === "radio" ) {
					this.buttonElement.removeClass( "ui-state-focus" );
				} else {
					this.buttonElement.removeClass( "ui-state-focus ui-state-active" );
				}
			}
			return;
		}
		this._resetButton();
	},

	refresh: function() {
		//See #8237 & #8828
		var isDisabled = this.element.is( "input, button" ) ? this.element.is( ":disabled" ) : this.element.hasClass( "ui-button-disabled" );

		if ( isDisabled !== this.options.disabled ) {
			this._setOption( "disabled", isDisabled );
		}
		if ( this.type === "radio" ) {
			radioGroup( this.element[0] ).each(function() {
				if ( $( this ).is( ":checked" ) ) {
					$( this ).button( "widget" )
						.addClass( "ui-state-active" )
						.attr( "aria-pressed", "true" );
				} else {
					$( this ).button( "widget" )
						.removeClass( "ui-state-active" )
						.attr( "aria-pressed", "false" );
				}
			});
		} else if ( this.type === "checkbox" ) {
			if ( this.element.is( ":checked" ) ) {
				this.buttonElement
					.addClass( "ui-state-active" )
					.attr( "aria-pressed", "true" );
			} else {
				this.buttonElement
					.removeClass( "ui-state-active" )
					.attr( "aria-pressed", "false" );
			}
		}
	},

	_resetButton: function() {
		if ( this.type === "input" ) {
			if ( this.options.label ) {
				this.element.val( this.options.label );
			}
			return;
		}
		var buttonElement = this.buttonElement.removeClass( typeClasses ),
			buttonText = $( "<span></span>", this.document[0] )
				.addClass( "ui-button-text" )
				.html( this.options.label )
				.appendTo( buttonElement.empty() )
				.text(),
			icons = this.options.icons,
			multipleIcons = icons.primary && icons.secondary,
			buttonClasses = [];

		if ( icons.primary || icons.secondary ) {
			if ( this.options.text ) {
				buttonClasses.push( "ui-button-text-icon" + ( multipleIcons ? "s" : ( icons.primary ? "-primary" : "-secondary" ) ) );
			}

			if ( icons.primary ) {
				buttonElement.prepend( "<span class='ui-button-icon-primary ui-icon " + icons.primary + "'></span>" );
			}

			if ( icons.secondary ) {
				buttonElement.append( "<span class='ui-button-icon-secondary ui-icon " + icons.secondary + "'></span>" );
			}

			if ( !this.options.text ) {
				buttonClasses.push( multipleIcons ? "ui-button-icons-only" : "ui-button-icon-only" );

				if ( !this.hasTitle ) {
					buttonElement.attr( "title", $.trim( buttonText ) );
				}
			}
		} else {
			buttonClasses.push( "ui-button-text-only" );
		}
		buttonElement.addClass( buttonClasses.join( " " ) );
	}
});

$.widget( "ui.buttonset", {
	version: "1.11.2",
	options: {
		items: "button, input[type=button], input[type=submit], input[type=reset], input[type=checkbox], input[type=radio], a, :data(ui-button)"
	},

	_create: function() {
		this.element.addClass( "ui-buttonset" );
	},

	_init: function() {
		this.refresh();
	},

	_setOption: function( key, value ) {
		if ( key === "disabled" ) {
			this.buttons.button( "option", key, value );
		}

		this._super( key, value );
	},

	refresh: function() {
		var rtl = this.element.css( "direction" ) === "rtl",
			allButtons = this.element.find( this.options.items ),
			existingButtons = allButtons.filter( ":ui-button" );

		// Initialize new buttons
		allButtons.not( ":ui-button" ).button();

		// Refresh existing buttons
		existingButtons.button( "refresh" );

		this.buttons = allButtons
			.map(function() {
				return $( this ).button( "widget" )[ 0 ];
			})
				.removeClass( "ui-corner-all ui-corner-left ui-corner-right" )
				.filter( ":first" )
					.addClass( rtl ? "ui-corner-right" : "ui-corner-left" )
				.end()
				.filter( ":last" )
					.addClass( rtl ? "ui-corner-left" : "ui-corner-right" )
				.end()
			.end();
	},

	_destroy: function() {
		this.element.removeClass( "ui-buttonset" );
		this.buttons
			.map(function() {
				return $( this ).button( "widget" )[ 0 ];
			})
				.removeClass( "ui-corner-left ui-corner-right" )
			.end()
			.button( "destroy" );
	}
});

var button = $.ui.button;


/*!
 * jQuery UI Dialog 1.11.2
 * http://jqueryui.com
 *
 * Copyright 2014 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/dialog/
 */


var dialog = $.widget( "ui.dialog", {
	version: "1.11.2",
	options: {
		appendTo: "body",
		autoOpen: true,
		buttons: [],
		closeOnEscape: true,
		closeText: "Close",
		dialogClass: "",
		draggable: true,
		hide: null,
		height: "auto",
		maxHeight: null,
		maxWidth: null,
		minHeight: 150,
		minWidth: 150,
		modal: false,
		position: {
			my: "center",
			at: "center",
			of: window,
			collision: "fit",
			// Ensure the titlebar is always visible
			using: function( pos ) {
				var topOffset = $( this ).css( pos ).offset().top;
				if ( topOffset < 0 ) {
					$( this ).css( "top", pos.top - topOffset );
				}
			}
		},
		resizable: true,
		show: null,
		title: null,
		width: 300,

		// callbacks
		beforeClose: null,
		close: null,
		drag: null,
		dragStart: null,
		dragStop: null,
		focus: null,
		open: null,
		resize: null,
		resizeStart: null,
		resizeStop: null
	},

	sizeRelatedOptions: {
		buttons: true,
		height: true,
		maxHeight: true,
		maxWidth: true,
		minHeight: true,
		minWidth: true,
		width: true
	},

	resizableRelatedOptions: {
		maxHeight: true,
		maxWidth: true,
		minHeight: true,
		minWidth: true
	},

	_create: function() {
		this.originalCss = {
			display: this.element[ 0 ].style.display,
			width: this.element[ 0 ].style.width,
			minHeight: this.element[ 0 ].style.minHeight,
			maxHeight: this.element[ 0 ].style.maxHeight,
			height: this.element[ 0 ].style.height
		};
		this.originalPosition = {
			parent: this.element.parent(),
			index: this.element.parent().children().index( this.element )
		};
		this.originalTitle = this.element.attr( "title" );
		this.options.title = this.options.title || this.originalTitle;

		this._createWrapper();

		this.element
			.show()
			.removeAttr( "title" )
			.addClass( "ui-dialog-content ui-widget-content" )
			.appendTo( this.uiDialog );

		this._createTitlebar();
		this._createButtonPane();

		if ( this.options.draggable && $.fn.draggable ) {
			this._makeDraggable();
		}
		if ( this.options.resizable && $.fn.resizable ) {
			this._makeResizable();
		}

		this._isOpen = false;

		this._trackFocus();
	},

	_init: function() {
		if ( this.options.autoOpen ) {
			this.open();
		}
	},

	_appendTo: function() {
		var element = this.options.appendTo;
		if ( element && (element.jquery || element.nodeType) ) {
			return $( element );
		}
		return this.document.find( element || "body" ).eq( 0 );
	},

	_destroy: function() {
		var next,
			originalPosition = this.originalPosition;

		this._destroyOverlay();

		this.element
			.removeUniqueId()
			.removeClass( "ui-dialog-content ui-widget-content" )
			.css( this.originalCss )
			// Without detaching first, the following becomes really slow
			.detach();

		this.uiDialog.stop( true, true ).remove();

		if ( this.originalTitle ) {
			this.element.attr( "title", this.originalTitle );
		}

		next = originalPosition.parent.children().eq( originalPosition.index );
		// Don't try to place the dialog next to itself (#8613)
		if ( next.length && next[ 0 ] !== this.element[ 0 ] ) {
			next.before( this.element );
		} else {
			originalPosition.parent.append( this.element );
		}
	},

	widget: function() {
		return this.uiDialog;
	},

	disable: $.noop,
	enable: $.noop,

	close: function( event ) {
		var activeElement,
			that = this;

		if ( !this._isOpen || this._trigger( "beforeClose", event ) === false ) {
			return;
		}

		this._isOpen = false;
		this._focusedElement = null;
		this._destroyOverlay();
		this._untrackInstance();

		if ( !this.opener.filter( ":focusable" ).focus().length ) {

			// support: IE9
			// IE9 throws an "Unspecified error" accessing document.activeElement from an <iframe>
			try {
				activeElement = this.document[ 0 ].activeElement;

				// Support: IE9, IE10
				// If the <body> is blurred, IE will switch windows, see #4520
				if ( activeElement && activeElement.nodeName.toLowerCase() !== "body" ) {

					// Hiding a focused element doesn't trigger blur in WebKit
					// so in case we have nothing to focus on, explicitly blur the active element
					// https://bugs.webkit.org/show_bug.cgi?id=47182
					$( activeElement ).blur();
				}
			} catch ( error ) {}
		}

		this._hide( this.uiDialog, this.options.hide, function() {
			that._trigger( "close", event );
		});
	},

	isOpen: function() {
		return this._isOpen;
	},

	moveToTop: function() {
		this._moveToTop();
	},

	_moveToTop: function( event, silent ) {
		var moved = false,
			zIndicies = this.uiDialog.siblings( ".ui-front:visible" ).map(function() {
				return +$( this ).css( "z-index" );
			}).get(),
			zIndexMax = Math.max.apply( null, zIndicies );

		if ( zIndexMax >= +this.uiDialog.css( "z-index" ) ) {
			this.uiDialog.css( "z-index", zIndexMax + 1 );
			moved = true;
		}

		if ( moved && !silent ) {
			this._trigger( "focus", event );
		}
		return moved;
	},

	open: function() {
		var that = this;
		if ( this._isOpen ) {
			if ( this._moveToTop() ) {
				this._focusTabbable();
			}
			return;
		}

		this._isOpen = true;
		this.opener = $( this.document[ 0 ].activeElement );

		this._size();
		this._position();
		this._createOverlay();
		this._moveToTop( null, true );

		// Ensure the overlay is moved to the top with the dialog, but only when
		// opening. The overlay shouldn't move after the dialog is open so that
		// modeless dialogs opened after the modal dialog stack properly.
		if ( this.overlay ) {
			this.overlay.css( "z-index", this.uiDialog.css( "z-index" ) - 1 );
		}

		this._show( this.uiDialog, this.options.show, function() {
			that._focusTabbable();
			that._trigger( "focus" );
		});

		// Track the dialog immediately upon openening in case a focus event
		// somehow occurs outside of the dialog before an element inside the
		// dialog is focused (#10152)
		this._makeFocusTarget();

		this._trigger( "open" );
	},

	_focusTabbable: function() {
		// Set focus to the first match:
		// 1. An element that was focused previously
		// 2. First element inside the dialog matching [autofocus]
		// 3. Tabbable element inside the content element
		// 4. Tabbable element inside the buttonpane
		// 5. The close button
		// 6. The dialog itself
		var hasFocus = this._focusedElement;
		if ( !hasFocus ) {
			hasFocus = this.element.find( "[autofocus]" );
		}
		if ( !hasFocus.length ) {
			hasFocus = this.element.find( ":tabbable" );
		}
		if ( !hasFocus.length ) {
			hasFocus = this.uiDialogButtonPane.find( ":tabbable" );
		}
		if ( !hasFocus.length ) {
			hasFocus = this.uiDialogTitlebarClose.filter( ":tabbable" );
		}
		if ( !hasFocus.length ) {
			hasFocus = this.uiDialog;
		}
		hasFocus.eq( 0 ).focus();
	},

	_keepFocus: function( event ) {
		function checkFocus() {
			var activeElement = this.document[0].activeElement,
				isActive = this.uiDialog[0] === activeElement ||
					$.contains( this.uiDialog[0], activeElement );
			if ( !isActive ) {
				this._focusTabbable();
			}
		}
		event.preventDefault();
		checkFocus.call( this );
		// support: IE
		// IE <= 8 doesn't prevent moving focus even with event.preventDefault()
		// so we check again later
		this._delay( checkFocus );
	},

	_createWrapper: function() {
		this.uiDialog = $("<div>")
			.addClass( "ui-dialog ui-widget ui-widget-content ui-corner-all ui-front " +
				this.options.dialogClass )
			.hide()
			.attr({
				// Setting tabIndex makes the div focusable
				tabIndex: -1,
				role: "dialog"
			})
			.appendTo( this._appendTo() );

		this._on( this.uiDialog, {
			keydown: function( event ) {
				if ( this.options.closeOnEscape && !event.isDefaultPrevented() && event.keyCode &&
						event.keyCode === $.ui.keyCode.ESCAPE ) {
					event.preventDefault();
					this.close( event );
					return;
				}

				// prevent tabbing out of dialogs
				if ( event.keyCode !== $.ui.keyCode.TAB || event.isDefaultPrevented() ) {
					return;
				}
				var tabbables = this.uiDialog.find( ":tabbable" ),
					first = tabbables.filter( ":first" ),
					last = tabbables.filter( ":last" );

				if ( ( event.target === last[0] || event.target === this.uiDialog[0] ) && !event.shiftKey ) {
					this._delay(function() {
						first.focus();
					});
					event.preventDefault();
				} else if ( ( event.target === first[0] || event.target === this.uiDialog[0] ) && event.shiftKey ) {
					this._delay(function() {
						last.focus();
					});
					event.preventDefault();
				}
			},
			mousedown: function( event ) {
				if ( this._moveToTop( event ) ) {
					this._focusTabbable();
				}
			}
		});

		// We assume that any existing aria-describedby attribute means
		// that the dialog content is marked up properly
		// otherwise we brute force the content as the description
		if ( !this.element.find( "[aria-describedby]" ).length ) {
			this.uiDialog.attr({
				"aria-describedby": this.element.uniqueId().attr( "id" )
			});
		}
	},

	_createTitlebar: function() {
		var uiDialogTitle;

		this.uiDialogTitlebar = $( "<div>" )
			.addClass( "ui-dialog-titlebar ui-widget-header ui-corner-all ui-helper-clearfix" )
			.prependTo( this.uiDialog );
		this._on( this.uiDialogTitlebar, {
			mousedown: function( event ) {
				// Don't prevent click on close button (#8838)
				// Focusing a dialog that is partially scrolled out of view
				// causes the browser to scroll it into view, preventing the click event
				if ( !$( event.target ).closest( ".ui-dialog-titlebar-close" ) ) {
					// Dialog isn't getting focus when dragging (#8063)
					this.uiDialog.focus();
				}
			}
		});

		// support: IE
		// Use type="button" to prevent enter keypresses in textboxes from closing the
		// dialog in IE (#9312)
		this.uiDialogTitlebarClose = $( "<button type='button'></button>" )
			.button({
				label: this.options.closeText,
				icons: {
					primary: "ui-icon-closethick"
				},
				text: false
			})
			.addClass( "ui-dialog-titlebar-close" )
			.appendTo( this.uiDialogTitlebar );
		this._on( this.uiDialogTitlebarClose, {
			click: function( event ) {
				event.preventDefault();
				this.close( event );
			}
		});

		uiDialogTitle = $( "<span>" )
			.uniqueId()
			.addClass( "ui-dialog-title" )
			.prependTo( this.uiDialogTitlebar );
		this._title( uiDialogTitle );

		this.uiDialog.attr({
			"aria-labelledby": uiDialogTitle.attr( "id" )
		});
	},

	_title: function( title ) {
		if ( !this.options.title ) {
			title.html( "&#160;" );
		}
		title.text( this.options.title );
	},

	_createButtonPane: function() {
		this.uiDialogButtonPane = $( "<div>" )
			.addClass( "ui-dialog-buttonpane ui-widget-content ui-helper-clearfix" );

		this.uiButtonSet = $( "<div>" )
			.addClass( "ui-dialog-buttonset" )
			.appendTo( this.uiDialogButtonPane );

		this._createButtons();
	},

	_createButtons: function() {
		var that = this,
			buttons = this.options.buttons;

		// if we already have a button pane, remove it
		this.uiDialogButtonPane.remove();
		this.uiButtonSet.empty();

		if ( $.isEmptyObject( buttons ) || ($.isArray( buttons ) && !buttons.length) ) {
			this.uiDialog.removeClass( "ui-dialog-buttons" );
			return;
		}

		$.each( buttons, function( name, props ) {
			var click, buttonOptions;
			props = $.isFunction( props ) ?
				{ click: props, text: name } :
				props;
			// Default to a non-submitting button
			props = $.extend( { type: "button" }, props );
			// Change the context for the click callback to be the main element
			click = props.click;
			props.click = function() {
				click.apply( that.element[ 0 ], arguments );
			};
			buttonOptions = {
				icons: props.icons,
				text: props.showText
			};
			delete props.icons;
			delete props.showText;
			$( "<button></button>", props )
				.button( buttonOptions )
				.appendTo( that.uiButtonSet );
		});
		this.uiDialog.addClass( "ui-dialog-buttons" );
		this.uiDialogButtonPane.appendTo( this.uiDialog );
	},

	_makeDraggable: function() {
		var that = this,
			options = this.options;

		function filteredUi( ui ) {
			return {
				position: ui.position,
				offset: ui.offset
			};
		}

		this.uiDialog.draggable({
			cancel: ".ui-dialog-content, .ui-dialog-titlebar-close",
			handle: ".ui-dialog-titlebar",
			containment: "document",
			start: function( event, ui ) {
				$( this ).addClass( "ui-dialog-dragging" );
				that._blockFrames();
				that._trigger( "dragStart", event, filteredUi( ui ) );
			},
			drag: function( event, ui ) {
				that._trigger( "drag", event, filteredUi( ui ) );
			},
			stop: function( event, ui ) {
				var left = ui.offset.left - that.document.scrollLeft(),
					top = ui.offset.top - that.document.scrollTop();

				options.position = {
					my: "left top",
					at: "left" + (left >= 0 ? "+" : "") + left + " " +
						"top" + (top >= 0 ? "+" : "") + top,
					of: that.window
				};
				$( this ).removeClass( "ui-dialog-dragging" );
				that._unblockFrames();
				that._trigger( "dragStop", event, filteredUi( ui ) );
			}
		});
	},

	_makeResizable: function() {
		var that = this,
			options = this.options,
			handles = options.resizable,
			// .ui-resizable has position: relative defined in the stylesheet
			// but dialogs have to use absolute or fixed positioning
			position = this.uiDialog.css("position"),
			resizeHandles = typeof handles === "string" ?
				handles	:
				"n,e,s,w,se,sw,ne,nw";

		function filteredUi( ui ) {
			return {
				originalPosition: ui.originalPosition,
				originalSize: ui.originalSize,
				position: ui.position,
				size: ui.size
			};
		}

		this.uiDialog.resizable({
			cancel: ".ui-dialog-content",
			containment: "document",
			alsoResize: this.element,
			maxWidth: options.maxWidth,
			maxHeight: options.maxHeight,
			minWidth: options.minWidth,
			minHeight: this._minHeight(),
			handles: resizeHandles,
			start: function( event, ui ) {
				$( this ).addClass( "ui-dialog-resizing" );
				that._blockFrames();
				that._trigger( "resizeStart", event, filteredUi( ui ) );
			},
			resize: function( event, ui ) {
				that._trigger( "resize", event, filteredUi( ui ) );
			},
			stop: function( event, ui ) {
				var offset = that.uiDialog.offset(),
					left = offset.left - that.document.scrollLeft(),
					top = offset.top - that.document.scrollTop();

				options.height = that.uiDialog.height();
				options.width = that.uiDialog.width();
				options.position = {
					my: "left top",
					at: "left" + (left >= 0 ? "+" : "") + left + " " +
						"top" + (top >= 0 ? "+" : "") + top,
					of: that.window
				};
				$( this ).removeClass( "ui-dialog-resizing" );
				that._unblockFrames();
				that._trigger( "resizeStop", event, filteredUi( ui ) );
			}
		})
		.css( "position", position );
	},

	_trackFocus: function() {
		this._on( this.widget(), {
			focusin: function( event ) {
				this._makeFocusTarget();
				this._focusedElement = $( event.target );
			}
		});
	},

	_makeFocusTarget: function() {
		this._untrackInstance();
		this._trackingInstances().unshift( this );
	},

	_untrackInstance: function() {
		var instances = this._trackingInstances(),
			exists = $.inArray( this, instances );
		if ( exists !== -1 ) {
			instances.splice( exists, 1 );
		}
	},

	_trackingInstances: function() {
		var instances = this.document.data( "ui-dialog-instances" );
		if ( !instances ) {
			instances = [];
			this.document.data( "ui-dialog-instances", instances );
		}
		return instances;
	},

	_minHeight: function() {
		var options = this.options;

		return options.height === "auto" ?
			options.minHeight :
			Math.min( options.minHeight, options.height );
	},

	_position: function() {
		// Need to show the dialog to get the actual offset in the position plugin
		var isVisible = this.uiDialog.is( ":visible" );
		if ( !isVisible ) {
			this.uiDialog.show();
		}
		this.uiDialog.position( this.options.position );
		if ( !isVisible ) {
			this.uiDialog.hide();
		}
	},

	_setOptions: function( options ) {
		var that = this,
			resize = false,
			resizableOptions = {};

		$.each( options, function( key, value ) {
			that._setOption( key, value );

			if ( key in that.sizeRelatedOptions ) {
				resize = true;
			}
			if ( key in that.resizableRelatedOptions ) {
				resizableOptions[ key ] = value;
			}
		});

		if ( resize ) {
			this._size();
			this._position();
		}
		if ( this.uiDialog.is( ":data(ui-resizable)" ) ) {
			this.uiDialog.resizable( "option", resizableOptions );
		}
	},

	_setOption: function( key, value ) {
		var isDraggable, isResizable,
			uiDialog = this.uiDialog;

		if ( key === "dialogClass" ) {
			uiDialog
				.removeClass( this.options.dialogClass )
				.addClass( value );
		}

		if ( key === "disabled" ) {
			return;
		}

		this._super( key, value );

		if ( key === "appendTo" ) {
			this.uiDialog.appendTo( this._appendTo() );
		}

		if ( key === "buttons" ) {
			this._createButtons();
		}

		if ( key === "closeText" ) {
			this.uiDialogTitlebarClose.button({
				// Ensure that we always pass a string
				label: "" + value
			});
		}

		if ( key === "draggable" ) {
			isDraggable = uiDialog.is( ":data(ui-draggable)" );
			if ( isDraggable && !value ) {
				uiDialog.draggable( "destroy" );
			}

			if ( !isDraggable && value ) {
				this._makeDraggable();
			}
		}

		if ( key === "position" ) {
			this._position();
		}

		if ( key === "resizable" ) {
			// currently resizable, becoming non-resizable
			isResizable = uiDialog.is( ":data(ui-resizable)" );
			if ( isResizable && !value ) {
				uiDialog.resizable( "destroy" );
			}

			// currently resizable, changing handles
			if ( isResizable && typeof value === "string" ) {
				uiDialog.resizable( "option", "handles", value );
			}

			// currently non-resizable, becoming resizable
			if ( !isResizable && value !== false ) {
				this._makeResizable();
			}
		}

		if ( key === "title" ) {
			this._title( this.uiDialogTitlebar.find( ".ui-dialog-title" ) );
		}
	},

	_size: function() {
		// If the user has resized the dialog, the .ui-dialog and .ui-dialog-content
		// divs will both have width and height set, so we need to reset them
		var nonContentHeight, minContentHeight, maxContentHeight,
			options = this.options;

		// Reset content sizing
		this.element.show().css({
			width: "auto",
			minHeight: 0,
			maxHeight: "none",
			height: 0
		});

		if ( options.minWidth > options.width ) {
			options.width = options.minWidth;
		}

		// reset wrapper sizing
		// determine the height of all the non-content elements
		nonContentHeight = this.uiDialog.css({
				height: "auto",
				width: options.width
			})
			.outerHeight();
		minContentHeight = Math.max( 0, options.minHeight - nonContentHeight );
		maxContentHeight = typeof options.maxHeight === "number" ?
			Math.max( 0, options.maxHeight - nonContentHeight ) :
			"none";

		if ( options.height === "auto" ) {
			this.element.css({
				minHeight: minContentHeight,
				maxHeight: maxContentHeight,
				height: "auto"
			});
		} else {
			this.element.height( Math.max( 0, options.height - nonContentHeight ) );
		}

		if ( this.uiDialog.is( ":data(ui-resizable)" ) ) {
			this.uiDialog.resizable( "option", "minHeight", this._minHeight() );
		}
	},

	_blockFrames: function() {
		this.iframeBlocks = this.document.find( "iframe" ).map(function() {
			var iframe = $( this );

			return $( "<div>" )
				.css({
					position: "absolute",
					width: iframe.outerWidth(),
					height: iframe.outerHeight()
				})
				.appendTo( iframe.parent() )
				.offset( iframe.offset() )[0];
		});
	},

	_unblockFrames: function() {
		if ( this.iframeBlocks ) {
			this.iframeBlocks.remove();
			delete this.iframeBlocks;
		}
	},

	_allowInteraction: function( event ) {
		if ( $( event.target ).closest( ".ui-dialog" ).length ) {
			return true;
		}

		// TODO: Remove hack when datepicker implements
		// the .ui-front logic (#8989)
		return !!$( event.target ).closest( ".ui-datepicker" ).length;
	},

	_createOverlay: function() {
		if ( !this.options.modal ) {
			return;
		}

		// We use a delay in case the overlay is created from an
		// event that we're going to be cancelling (#2804)
		var isOpening = true;
		this._delay(function() {
			isOpening = false;
		});

		if ( !this.document.data( "ui-dialog-overlays" ) ) {

			// Prevent use of anchors and inputs
			// Using _on() for an event handler shared across many instances is
			// safe because the dialogs stack and must be closed in reverse order
			this._on( this.document, {
				focusin: function( event ) {
					if ( isOpening ) {
						return;
					}

					if ( !this._allowInteraction( event ) ) {
						event.preventDefault();
						this._trackingInstances()[ 0 ]._focusTabbable();
					}
				}
			});
		}

		this.overlay = $( "<div>" )
			.addClass( "ui-widget-overlay ui-front" )
			.appendTo( this._appendTo() );
		this._on( this.overlay, {
			mousedown: "_keepFocus"
		});
		this.document.data( "ui-dialog-overlays",
			(this.document.data( "ui-dialog-overlays" ) || 0) + 1 );
	},

	_destroyOverlay: function() {
		if ( !this.options.modal ) {
			return;
		}

		if ( this.overlay ) {
			var overlays = this.document.data( "ui-dialog-overlays" ) - 1;

			if ( !overlays ) {
				this.document
					.unbind( "focusin" )
					.removeData( "ui-dialog-overlays" );
			} else {
				this.document.data( "ui-dialog-overlays", overlays );
			}

			this.overlay.remove();
			this.overlay = null;
		}
	}
});


/*!
 * jQuery UI Spinner 1.11.2
 * http://jqueryui.com
 *
 * Copyright 2014 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/spinner/
 */


function spinner_modifier( fn ) {
	return function() {
		var previous = this.element.val();
		fn.apply( this, arguments );
		this._refresh();
		if ( previous !== this.element.val() ) {
			this._trigger( "change" );
		}
	};
}

var spinner = $.widget( "ui.spinner", {
	version: "1.11.2",
	defaultElement: "<input>",
	widgetEventPrefix: "spin",
	options: {
		culture: null,
		icons: {
			down: "ui-icon-triangle-1-s",
			up: "ui-icon-triangle-1-n"
		},
		incremental: true,
		max: null,
		min: null,
		numberFormat: null,
		page: 10,
		step: 1,

		change: null,
		spin: null,
		start: null,
		stop: null
	},

	_create: function() {
		// handle string values that need to be parsed
		this._setOption( "max", this.options.max );
		this._setOption( "min", this.options.min );
		this._setOption( "step", this.options.step );

		// Only format if there is a value, prevents the field from being marked
		// as invalid in Firefox, see #9573.
		if ( this.value() !== "" ) {
			// Format the value, but don't constrain.
			this._value( this.element.val(), true );
		}

		this._draw();
		this._on( this._events );
		this._refresh();

		// turning off autocomplete prevents the browser from remembering the
		// value when navigating through history, so we re-enable autocomplete
		// if the page is unloaded before the widget is destroyed. #7790
		this._on( this.window, {
			beforeunload: function() {
				this.element.removeAttr( "autocomplete" );
			}
		});
	},

	_getCreateOptions: function() {
		var options = {},
			element = this.element;

		$.each( [ "min", "max", "step" ], function( i, option ) {
			var value = element.attr( option );
			if ( value !== undefined && value.length ) {
				options[ option ] = value;
			}
		});

		return options;
	},

	_events: {
		keydown: function( event ) {
			if ( this._start( event ) && this._keydown( event ) ) {
				event.preventDefault();
			}
		},
		keyup: "_stop",
		focus: function() {
			this.previous = this.element.val();
		},
		blur: function( event ) {
			if ( this.cancelBlur ) {
				delete this.cancelBlur;
				return;
			}

			this._stop();
			this._refresh();
			if ( this.previous !== this.element.val() ) {
				this._trigger( "change", event );
			}
		},
		mousewheel: function( event, delta ) {
			if ( !delta ) {
				return;
			}
			if ( !this.spinning && !this._start( event ) ) {
				return false;
			}

			this._spin( (delta > 0 ? 1 : -1) * this.options.step, event );
			clearTimeout( this.mousewheelTimer );
			this.mousewheelTimer = this._delay(function() {
				if ( this.spinning ) {
					this._stop( event );
				}
			}, 100 );
			event.preventDefault();
		},
		"mousedown .ui-spinner-button": function( event ) {
			var previous;

			// We never want the buttons to have focus; whenever the user is
			// interacting with the spinner, the focus should be on the input.
			// If the input is focused then this.previous is properly set from
			// when the input first received focus. If the input is not focused
			// then we need to set this.previous based on the value before spinning.
			previous = this.element[0] === this.document[0].activeElement ?
				this.previous : this.element.val();
			function checkFocus() {
				var isActive = this.element[0] === this.document[0].activeElement;
				if ( !isActive ) {
					this.element.focus();
					this.previous = previous;
					// support: IE
					// IE sets focus asynchronously, so we need to check if focus
					// moved off of the input because the user clicked on the button.
					this._delay(function() {
						this.previous = previous;
					});
				}
			}

			// ensure focus is on (or stays on) the text field
			event.preventDefault();
			checkFocus.call( this );

			// support: IE
			// IE doesn't prevent moving focus even with event.preventDefault()
			// so we set a flag to know when we should ignore the blur event
			// and check (again) if focus moved off of the input.
			this.cancelBlur = true;
			this._delay(function() {
				delete this.cancelBlur;
				checkFocus.call( this );
			});

			if ( this._start( event ) === false ) {
				return;
			}

			this._repeat( null, $( event.currentTarget ).hasClass( "ui-spinner-up" ) ? 1 : -1, event );
		},
		"mouseup .ui-spinner-button": "_stop",
		"mouseenter .ui-spinner-button": function( event ) {
			// button will add ui-state-active if mouse was down while mouseleave and kept down
			if ( !$( event.currentTarget ).hasClass( "ui-state-active" ) ) {
				return;
			}

			if ( this._start( event ) === false ) {
				return false;
			}
			this._repeat( null, $( event.currentTarget ).hasClass( "ui-spinner-up" ) ? 1 : -1, event );
		},
		// TODO: do we really want to consider this a stop?
		// shouldn't we just stop the repeater and wait until mouseup before
		// we trigger the stop event?
		"mouseleave .ui-spinner-button": "_stop"
	},

	_draw: function() {
		var uiSpinner = this.uiSpinner = this.element
			.addClass( "ui-spinner-input" )
			.attr( "autocomplete", "off" )
			.wrap( this._uiSpinnerHtml() )
			.parent()
				// add buttons
				.append( this._buttonHtml() );

		this.element.attr( "role", "spinbutton" );

		// button bindings
		this.buttons = uiSpinner.find( ".ui-spinner-button" )
			.attr( "tabIndex", -1 )
			.button()
			.removeClass( "ui-corner-all" );

		// IE 6 doesn't understand height: 50% for the buttons
		// unless the wrapper has an explicit height
		if ( this.buttons.height() > Math.ceil( uiSpinner.height() * 0.5 ) &&
				uiSpinner.height() > 0 ) {
			uiSpinner.height( uiSpinner.height() );
		}

		// disable spinner if element was already disabled
		if ( this.options.disabled ) {
			this.disable();
		}
	},

	_keydown: function( event ) {
		var options = this.options,
			keyCode = $.ui.keyCode;

		switch ( event.keyCode ) {
		case keyCode.UP:
			this._repeat( null, 1, event );
			return true;
		case keyCode.DOWN:
			this._repeat( null, -1, event );
			return true;
		case keyCode.PAGE_UP:
			this._repeat( null, options.page, event );
			return true;
		case keyCode.PAGE_DOWN:
			this._repeat( null, -options.page, event );
			return true;
		}

		return false;
	},

	_uiSpinnerHtml: function() {
		return "<span class='ui-spinner ui-widget ui-widget-content ui-corner-all'></span>";
	},

	_buttonHtml: function() {
		return "" +
			"<a class='ui-spinner-button ui-spinner-up ui-corner-tr'>" +
				"<span class='ui-icon " + this.options.icons.up + "'>&#9650;</span>" +
			"</a>" +
			"<a class='ui-spinner-button ui-spinner-down ui-corner-br'>" +
				"<span class='ui-icon " + this.options.icons.down + "'>&#9660;</span>" +
			"</a>";
	},

	_start: function( event ) {
		if ( !this.spinning && this._trigger( "start", event ) === false ) {
			return false;
		}

		if ( !this.counter ) {
			this.counter = 1;
		}
		this.spinning = true;
		return true;
	},

	_repeat: function( i, steps, event ) {
		i = i || 500;

		clearTimeout( this.timer );
		this.timer = this._delay(function() {
			this._repeat( 40, steps, event );
		}, i );

		this._spin( steps * this.options.step, event );
	},

	_spin: function( step, event ) {
		var value = this.value() || 0;

		if ( !this.counter ) {
			this.counter = 1;
		}

		value = this._adjustValue( value + step * this._increment( this.counter ) );

		if ( !this.spinning || this._trigger( "spin", event, { value: value } ) !== false) {
			this._value( value );
			this.counter++;
		}
	},

	_increment: function( i ) {
		var incremental = this.options.incremental;

		if ( incremental ) {
			return $.isFunction( incremental ) ?
				incremental( i ) :
				Math.floor( i * i * i / 50000 - i * i / 500 + 17 * i / 200 + 1 );
		}

		return 1;
	},

	_precision: function() {
		var precision = this._precisionOf( this.options.step );
		if ( this.options.min !== null ) {
			precision = Math.max( precision, this._precisionOf( this.options.min ) );
		}
		return precision;
	},

	_precisionOf: function( num ) {
		var str = num.toString(),
			decimal = str.indexOf( "." );
		return decimal === -1 ? 0 : str.length - decimal - 1;
	},

	_adjustValue: function( value ) {
		var base, aboveMin,
			options = this.options;

		// make sure we're at a valid step
		// - find out where we are relative to the base (min or 0)
		base = options.min !== null ? options.min : 0;
		aboveMin = value - base;
		// - round to the nearest step
		aboveMin = Math.round(aboveMin / options.step) * options.step;
		// - rounding is based on 0, so adjust back to our base
		value = base + aboveMin;

		// fix precision from bad JS floating point math
		value = parseFloat( value.toFixed( this._precision() ) );

		// clamp the value
		if ( options.max !== null && value > options.max) {
			return options.max;
		}
		if ( options.min !== null && value < options.min ) {
			return options.min;
		}

		return value;
	},

	_stop: function( event ) {
		if ( !this.spinning ) {
			return;
		}

		clearTimeout( this.timer );
		clearTimeout( this.mousewheelTimer );
		this.counter = 0;
		this.spinning = false;
		this._trigger( "stop", event );
	},

	_setOption: function( key, value ) {
		if ( key === "culture" || key === "numberFormat" ) {
			var prevValue = this._parse( this.element.val() );
			this.options[ key ] = value;
			this.element.val( this._format( prevValue ) );
			return;
		}

		if ( key === "max" || key === "min" || key === "step" ) {
			if ( typeof value === "string" ) {
				value = this._parse( value );
			}
		}
		if ( key === "icons" ) {
			this.buttons.first().find( ".ui-icon" )
				.removeClass( this.options.icons.up )
				.addClass( value.up );
			this.buttons.last().find( ".ui-icon" )
				.removeClass( this.options.icons.down )
				.addClass( value.down );
		}

		this._super( key, value );

		if ( key === "disabled" ) {
			this.widget().toggleClass( "ui-state-disabled", !!value );
			this.element.prop( "disabled", !!value );
			this.buttons.button( value ? "disable" : "enable" );
		}
	},

	_setOptions: spinner_modifier(function( options ) {
		this._super( options );
	}),

	_parse: function( val ) {
		if ( typeof val === "string" && val !== "" ) {
			val = window.Globalize && this.options.numberFormat ?
				Globalize.parseFloat( val, 10, this.options.culture ) : +val;
		}
		return val === "" || isNaN( val ) ? null : val;
	},

	_format: function( value ) {
		if ( value === "" ) {
			return "";
		}
		return window.Globalize && this.options.numberFormat ?
			Globalize.format( value, this.options.numberFormat, this.options.culture ) :
			value;
	},

	_refresh: function() {
		this.element.attr({
			"aria-valuemin": this.options.min,
			"aria-valuemax": this.options.max,
			// TODO: what should we do with values that can't be parsed?
			"aria-valuenow": this._parse( this.element.val() )
		});
	},

	isValid: function() {
		var value = this.value();

		// null is invalid
		if ( value === null ) {
			return false;
		}

		// if value gets adjusted, it's invalid
		return value === this._adjustValue( value );
	},

	// update the value without triggering change
	_value: function( value, allowAny ) {
		var parsed;
		if ( value !== "" ) {
			parsed = this._parse( value );
			if ( parsed !== null ) {
				if ( !allowAny ) {
					parsed = this._adjustValue( parsed );
				}
				value = this._format( parsed );
			}
		}
		this.element.val( value );
		this._refresh();
	},

	_destroy: function() {
		this.element
			.removeClass( "ui-spinner-input" )
			.prop( "disabled", false )
			.removeAttr( "autocomplete" )
			.removeAttr( "role" )
			.removeAttr( "aria-valuemin" )
			.removeAttr( "aria-valuemax" )
			.removeAttr( "aria-valuenow" );
		this.uiSpinner.replaceWith( this.element );
	},

	stepUp: spinner_modifier(function( steps ) {
		this._stepUp( steps );
	}),
	_stepUp: function( steps ) {
		if ( this._start() ) {
			this._spin( (steps || 1) * this.options.step );
			this._stop();
		}
	},

	stepDown: spinner_modifier(function( steps ) {
		this._stepDown( steps );
	}),
	_stepDown: function( steps ) {
		if ( this._start() ) {
			this._spin( (steps || 1) * -this.options.step );
			this._stop();
		}
	},

	pageUp: spinner_modifier(function( pages ) {
		this._stepUp( (pages || 1) * this.options.page );
	}),

	pageDown: spinner_modifier(function( pages ) {
		this._stepDown( (pages || 1) * this.options.page );
	}),

	value: function( newVal ) {
		if ( !arguments.length ) {
			return this._parse( this.element.val() );
		}
		spinner_modifier( this._value ).call( this, newVal );
	},

	widget: function() {
		return this.uiSpinner;
	}
});



}));
Chart.types.Line.extend({
    // Passing in a name registers this chart in the Chart namespace in the same way
    name: "Scatter",
    draw : function(ease){
			var easingDecimal = ease || 1;
			this.clear();

			var ctx = this.chart.ctx;

			// Some helper methods for getting the next/prev points
			var hasValue = function(item){
				return item.value !== null;
			},
			nextPoint = function(point, collection, index){
				return Chart.helpers.findNextWhere(collection, hasValue, index) || point;
			},
			previousPoint = function(point, collection, index){
				return Chart.helpers.findPreviousWhere(collection, hasValue, index) || point;
			};

			this.scale.draw(easingDecimal);


			Chart.helpers.each(this.datasets,function(dataset){
				var pointsWithValues = Chart.helpers.where(dataset.points, hasValue);

				//Transition each point first so that the line and point drawing isn't out of sync
				//We can use this extra loop to calculate the control points of this dataset also in this loop

				Chart.helpers.each(dataset.points, function(point, index){
					if (point.hasValue()){
						point.transition({
							y : this.scale.calculateY(point.value),
							x : this.scale.calculateX(index)
						}, easingDecimal);
					}
				},this);


				// Control points need to be calculated in a seperate loop, because we need to know the current x/y of the point
				// This would cause issues when there is no animation, because the y of the next point would be 0, so beziers would be skewed
				if (this.options.bezierCurve){
					Chart.helpers.each(pointsWithValues, function(point, index){
						var tension = (index > 0 && index < pointsWithValues.length - 1) ? this.options.bezierCurveTension : 0;
						point.controlPoints = Chart.helpers.splineCurve(
							previousPoint(point, pointsWithValues, index),
							point,
							nextPoint(point, pointsWithValues, index),
							tension
						);

						// Prevent the bezier going outside of the bounds of the graph

						// Cap puter bezier handles to the upper/lower scale bounds
						if (point.controlPoints.outer.y > this.scale.endPoint){
							point.controlPoints.outer.y = this.scale.endPoint;
						}
						else if (point.controlPoints.outer.y < this.scale.startPoint){
							point.controlPoints.outer.y = this.scale.startPoint;
						}

						// Cap inner bezier handles to the upper/lower scale bounds
						if (point.controlPoints.inner.y > this.scale.endPoint){
							point.controlPoints.inner.y = this.scale.endPoint;
						}
						else if (point.controlPoints.inner.y < this.scale.startPoint){
							point.controlPoints.inner.y = this.scale.startPoint;
						}
					},this);
				}

				if (this.options.datasetFill && pointsWithValues.length > 0){
					//Round off the line by going to the base of the chart, back to the start, then fill.
					ctx.lineTo(pointsWithValues[pointsWithValues.length - 1].x, this.scale.endPoint);
					ctx.lineTo(pointsWithValues[0].x, this.scale.endPoint);
					ctx.fillStyle = dataset.fillColor;
					ctx.closePath();
					ctx.fill();
				}

				//Now draw the points over the line
				//A little inefficient double looping, but better than the line
				//lagging behind the point positions
				Chart.helpers.each(pointsWithValues,function(point){
					point.draw();
				});
			},this);
		}
});
var HEROCALCULATOR = (function (my) {
    var my = {};
		my.heroData = {},
		my.itemData = {},
		my.unitData = {},
		my.abilityData = {},
		my.stackableItems = ['clarity','flask','dust','ward_observer','ward_sentry','tango','tpscroll','smoke_of_deceit'],
		my.levelitems = ['necronomicon','dagon','diffusal_blade','travel_boots'],
		my.validItems = ["abyssal_blade","ultimate_scepter","courier","arcane_boots","armlet","assault","boots_of_elves","bfury","belt_of_strength","black_king_bar","blade_mail","blade_of_alacrity","blades_of_attack","blink","bloodstone","boots","travel_boots","bottle","bracer","broadsword","buckler","butterfly","chainmail","circlet","clarity","claymore","cloak","lesser_crit","greater_crit","dagon","demon_edge","desolator","diffusal_blade","rapier","ancient_janggo","dust","eagle","energy_booster","ethereal_blade","cyclone","skadi","flying_courier","force_staff","gauntlets","gem","ghost","gloves","hand_of_midas","headdress","flask","heart","heavens_halberd","helm_of_iron_will","helm_of_the_dominator","hood_of_defiance","hyperstone","branches","javelin","sphere","maelstrom","magic_stick","magic_wand","manta","mantle","mask_of_madness","medallion_of_courage","mekansm","mithril_hammer","mjollnir","monkey_king_bar","lifesteal","mystic_staff","necronomicon","null_talisman","oblivion_staff","ward_observer","ogre_axe","orb_of_venom","orchid","pers","phase_boots","pipe","platemail","point_booster","poor_mans_shield","power_treads","quarterstaff","quelling_blade","radiance","reaver","refresher","ring_of_aquila","ring_of_basilius","ring_of_health","ring_of_protection","ring_of_regen","robe","rod_of_atos","relic","sobi_mask","sange","sange_and_yasha","satanic","sheepstick","ward_sentry","shadow_amulet","invis_sword","shivas_guard","basher","slippers","smoke_of_deceit","soul_booster","soul_ring","staff_of_wizardry","stout_shield","talisman_of_evasion","tango","tpscroll","tranquil_boots","ultimate_orb","urn_of_shadows","vanguard","veil_of_discord","vitality_booster","vladmir","void_stone","wraith_band","yasha","crimson_guard","enchanted_mango","lotus_orb","glimmer_cape","guardian_greaves","moon_shard","silver_edge","solar_crest","octarine_core","aether_lens","faerie_fire","iron_talon","dragon_lance"],
        my.itemsWithActive = ['heart','smoke_of_deceit','dust','ghost','tranquil_boots','phase_boots','power_treads','buckler','medallion_of_courage','ancient_janggo','mekansm','pipe','veil_of_discord','rod_of_atos','orchid','sheepstick','armlet','invis_sword','ethereal_blade','shivas_guard','manta','mask_of_madness','diffusal_blade','mjollnir','satanic','ring_of_basilius','ring_of_aquila', 'butterfly', 'moon_shard', 'silver_edge'];
    
    my.ItemInput = function (value, name, debuff) {
        if (my.itemData['item_' + value].ItemAliases instanceof Array) {
            var itemAlias = my.itemData['item_' + value].ItemAliases.join(' ');
        }
        else {
            var itemAlias = my.itemData['item_' + value].ItemAliases;
        }
        this.value = ko.observable(value);
        this.debuff = ko.observable(debuff);
        if (this.debuff()) {
            this.value = ko.observable(value + '|' + debuff.id);
            this.name = ko.observable(name + ' (' + debuff.name + ')');
            this.displayname = ko.observable(name + ' (' + debuff.name + ') <span style="display:none">' + ';' + itemAlias + '</span>');
        }
        else {
            this.value = ko.observable(value);
            this.name = ko.observable(name);
            this.displayname = ko.observable(name + ' <span style="display:none">' + ';' + itemAlias + '</span>');
        }
    };
	
	my.BasicInventoryViewModel = function (h) {
        var self = this;
		self.items = ko.observableArray([]);
		self.activeItems = ko.observableArray([]);
        self.addItem = function (data, event) {
            if (data.selectedItem() != undefined) {
                var new_item = {
                    item: data.selectedItem().split('|')[0],
                    state: ko.observable(0),
                    size: data.itemInputValue(),
                    enabled: ko.observable(true)
                }
                switch (new_item.item) {
                    case 'dagon':
                        new_item.size = Math.min(new_item.size, 5);
                    break;
                    break;
                    case 'travel_boots':
                    case 'diffusal_blade':
                        new_item.size = Math.min(new_item.size, 2);
                    break;
                    case 'necronomicon':
                        new_item.size = Math.min(new_item.size, 3);
                    break;
                }
                self.items.push(new_item);
                if (data.selectedItem() === 'ring_of_aquila' || data.selectedItem() === 'ring_of_basilius' || data.selectedItem() === 'heart') {
                    self.toggleItem(undefined, new_item, undefined);
                }
            }
        };
        self.toggleItem = function (index, data, event) {
            if (my.itemsWithActive.indexOf(data.item) >= 0) {
                if (self.activeItems.indexOf(data) < 0) {
                    self.activeItems.push(data);
                }
                else {
                    self.activeItems.remove(data);
                }
                switch (data.item) {
                    case 'power_treads':
                        if (data.state() < 2) {
                            data.state(data.state() + 1);
                        }
                        else {
                            data.state(0);
                        }                
                    break;
                    default:
                        if (data.state() == 0) {
                            data.state(1);
                        }
                        else {
                            data.state(0);
                        }                
                    break;
                }
            }
        }.bind(this);
        self.removeItem = function (item) {
            self.activeItems.remove(item);
            self.items.remove(item);
        }.bind(this);
        self.toggleMuteItem = function (item) {
            item.enabled(!item.enabled());
        }.bind(this);      

        self.getItemImage = function (data) {
            var state = ko.utils.unwrapObservable(data.state);
            switch (data.item) {
                case 'power_treads':
                    if (state == 0) {
                        return '/media/images/items/' + data.item + '_str.png';
                    }
                    else if (state == 1) {
                        return '/media/images/items/' + data.item + '_int.png';
                    }
                    else {
                        return '/media/images/items/' + data.item + '_agi.png';
                    }
                break;
                case 'tranquil_boots':
                case 'ring_of_basilius':
                    if (state == 0) {
                        return '/media/images/items/' + data.item + '.png';
                    }
                    else {
                        return '/media/images/items/' + data.item + '_active.png';
                    }
                break;
                case 'armlet':
                    if (state == 0) {
                        return '/media/images/items/' + data.item + '.png';
                    }
                    else {
                        return '/media/images/items/' + data.item + '_active.png';
                    }
                break;
                case 'ring_of_aquila':
                    if (state == 0) {
                        return '/media/images/items/' + data.item + '_active.png';
                    }
                    else {
                        return '/media/images/items/' + data.item + '.png';
                    }
                break;
                case 'dagon':
                case 'diffusal_blade':
                case 'travel_boots':
                case 'necronomicon':
                    if (data.size > 1) {
                        return '/media/images/items/' + data.item + '_' + data.size + '.png';
                    }
                    else {
                        return '/media/images/items/' + data.item + '.png';
                    }
                break;
                default:
                    return '/media/images/items/' + data.item + '.png';            
                break;
            }
        };
        self.getItemSizeLabel = function (data) {
            if (my.stackableItems.indexOf(data.item) != -1) {
                return '<span style="font-size:10px">Qty: </span>' + data.size;
            }
            else if (my.levelitems.indexOf(data.item) != -1) {
                return '<span style="font-size:10px">Lvl: </span>' + data.size;
            }
            else if (data.item == 'bloodstone') {
                return '<span style="font-size:10px">Charges: </span>' + data.size;
            }
            else {
                return '';
            }
        };
        self.getActiveBorder = function (data) {
            switch (data.item) {
                case 'power_treads':
                case 'tranquil_boots':
                case 'ring_of_basilius':
                case 'ring_of_aquila':
                case 'armlet':
                    return 0;
                break;
                default:
                    return ko.utils.unwrapObservable(data.state);    
                break;
            }
        }
        self.removeAll = function () {
            self.activeItems.removeAll();
            self.items.removeAll();
        }.bind(this);
	}
    
    my.InventoryViewModel = function (h) {
        var self = new my.BasicInventoryViewModel();
        self.hero = h;
        self.hasInventory = ko.observable(true);
        self.items = ko.observableArray([]);
        self.activeItems = ko.observableArray([]);
        self.hasScepter = ko.computed(function () {
            for (var i = 0; i < self.items().length; i++) {
                var item = self.items()[i].item;
                if (item === 'ultimate_scepter' && self.items()[i].enabled()) {
                    return true;
                }
                
            }
            return false;
        }, this);
        self.isEthereal = ko.computed(function () {
            for (var i = 0; i < self.items().length; i++) {
                var item = self.items()[i].item;
                var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
                if ((item === 'ghost' || item === 'ethereal_blade') && self.items()[i].enabled() && isActive) {
                    return true;
                }
            }
            return false;
        }, this);
        self.isSheeped = ko.computed(function () {
            for (var i = 0; i < self.items().length; i++) {
                var item = self.items()[i].item;
                var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
                if (item === 'sheepstick' && self.items()[i].enabled() && isActive) {
                    return true;
                }
            }
            return false;
        }, this);
        self.totalCost = ko.computed(function () {
            var c = 0;
            for (var i = 0; i < self.items().length; i++) {
                var item = self.items()[i].item;
                if (!self.items()[i].enabled()) continue;
                if (my.stackableItems.indexOf(item) != -1) {
                    c += my.itemData['item_' + item].itemcost * self.items()[i].size;
                }
                else if (my.levelitems.indexOf(item) != -1) {
                    switch(item) {
                        case 'diffusal_blade':
                            c += my.itemData['item_' + item].itemcost + (self.items()[i].size - 1) * 700;
                        break;
                        case 'necronomicon':
                        case 'dagon':
                            c += my.itemData['item_' + item].itemcost + (self.items()[i].size - 1) * 1250;
                        break;
                        default:
                            c += my.itemData['item_' + item].itemcost;
                        break;
                    }
                }
                else {
                    c += my.itemData['item_' + item].itemcost;
                }
                
            }
            return c;
        }, this);
        /*self.addItem = function (data, event) {
            if (self.hasInventory() && data.selectedItem() != undefined) {
                var new_item = {
                    item: data.selectedItem(),
                    state: ko.observable(0),
                    size: data.itemInputValue(),
                    enabled: ko.observable(true)
                }
                self.items.push(new_item);
                if (data.selectedItem() === 'ring_of_aquila' || data.selectedItem() === 'ring_of_basilius' || data.selectedItem() === 'heart') {
                    self.toggleItem(undefined, new_item, undefined);
                }
            }
        };*/
        self.addItemBuff = function (data, event) {
            if (self.hasInventory() && self.selectedItemBuff() != undefined) {
                var new_item = {
                    item: self.selectedItemBuff(),
                    state: ko.observable(0),
                    size: 1,
                    enabled: ko.observable(true)
                }
                self.items.push(new_item);
                if (self.selectedItemBuff() === 'ring_of_aquila' || self.selectedItemBuff() === 'ring_of_basilius') {
                    self.toggleItem(undefined, new_item, undefined);
                }
            }
        };
        self.addItemDebuff = function (data, event) {
            if (self.hasInventory() && self.selectedItemDebuff() != undefined) {
                var new_item = {
                    item: self.selectedItemDebuff().split('|')[0],
                    state: ko.observable(0),
                    size: 1,
                    enabled: ko.observable(true)
                }
                if (self.selectedItemDebuff().split('|').length == 2) {
                    new_item.debuff = self.selectedItemDebuff().split('|')[1]
                }
                self.items.push(new_item);
                if (self.selectedItemDebuff() === 'ring_of_aquila' || self.selectedItemDebuff() === 'ring_of_basilius') {
                    self.toggleItem(undefined, new_item, undefined);
                }
            }
        };
        /*self.toggleItem = function (index, data, event) {
            if (my.itemsWithActive.indexOf(data.item) >= 0) {
                if (self.activeItems.indexOf(data) < 0) {
                    self.activeItems.push(data);
                }
                else {
                    self.activeItems.remove(data);
                }
                switch (data.item) {
                    case 'power_treads':
                        if (data.state() < 2) {
                            data.state(data.state() + 1);
                        }
                        else {
                            data.state(0);
                        }                
                    break;
                    default:
                        if (data.state() == 0) {
                            data.state(1);
                        }
                        else {
                            data.state(0);
                        }                
                    break;
                }
            }
        }.bind(this);
        self.removeItem = function (item) {
            self.activeItems.remove(item);
            self.items.remove(item);
        }.bind(this);
        self.toggleMuteItem = function (item) {
            item.enabled(!item.enabled());
        }.bind(this);
        self.getItemImage = function (data) {
            switch (data.item) {
                case 'power_treads':
                    if (data.state() == 0) {
                        return '/media/images/items/' + data.item + '_str.png';
                    }
                    else if (data.state() == 1) {
                        return '/media/images/items/' + data.item + '_int.png';
                    }
                    else {
                        return '/media/images/items/' + data.item + '_agi.png';
                    }
                break;
                case 'tranquil_boots':
                case 'ring_of_basilius':
                    if (data.state() == 0) {
                        return '/media/images/items/' + data.item + '.png';
                    }
                    else {
                        return '/media/images/items/' + data.item + '_active.png';
                    }
                break;
                case 'armlet':
                    if (data.state() == 0) {
                        return '/media/images/items/' + data.item + '.png';
                    }
                    else {
                        return '/media/images/items/' + data.item + '_active.png';
                    }
                break;
                case 'ring_of_aquila':
                    if (data.state() == 0) {
                        return '/media/images/items/' + data.item + '_active.png';
                    }
                    else {
                        return '/media/images/items/' + data.item + '.png';
                    }
                break;
                case 'dagon':
                case 'diffusal_blade':
                case 'necronomicon':
                    if (data.size > 1) {
                        return '/media/images/items/' + data.item + '_' + data.size + '.png';
                    }
                    else {
                        return '/media/images/items/' + data.item + '.png';
                    }
                break;
                default:
                    return '/media/images/items/' + data.item + '.png';            
                break;
            }
        };
        self.getItemSizeLabel = function (data) {
            if (my.stackableItems.indexOf(data.item) != -1) {
                return '<span style="font-size:10px">Qty: </span>' + data.size;
            }
            else if (my.levelitems.indexOf(data.item) != -1) {
                return '<span style="font-size:10px">Lvl: </span>' + data.size;
            }
            else if (data.item == 'bloodstone') {
                return '<span style="font-size:10px">Charges: </span>' + data.size;
            }
            else {
                return '';
            }
        };
        self.getActiveBorder = function (data) {
            switch (data.item) {
                case 'power_treads':
                case 'tranquil_boots':
                case 'ring_of_basilius':
                case 'ring_of_aquila':
                case 'armlet':
                    return 0;
                break;
                default:
                    return ko.utils.unwrapObservable(data.state);    
                break;
            }
            
        }*/

        self.getItemAttributeValue = function (attributes, attributeName, level) {
            for (var i = 0; i < attributes.length; i++) {
                if (attributes[i].name == attributeName) {
                    if (level == 0) {
                        return parseFloat(attributes[i].value[0]);
                    }
                    else if (level > attributes[i].value.length) {
                        return parseFloat(attributes[i].value[0]);
                    }
                    else {
                        return parseFloat(attributes[i].value[level - 1]);
                    }
                }
            }
        }
        
        self.getAttributes = function (attributetype) {
            var totalAttribute = 0;
            for (var i = 0; i < self.items().length; i++) {
                var item = self.items()[i].item;
                var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
                if (!self.items()[i].enabled()) continue;
                var size = self.items()[i].size;
                for (var j = 0; j < my.itemData['item_' + item].attributes.length; j++) {
                    var attribute = my.itemData['item_' + item].attributes[j];
                    switch(attribute.name) {
                        case 'bonus_all_stats':
                            totalAttribute += parseInt(attribute.value[0]);
                        break;
                        case 'bonus_stats':
                            totalAttribute += parseInt(attribute.value[0]);
                        break;
                    }
                    switch(attributetype) {
                        case 'agi':
                            if (attribute.name == 'bonus_agility') {
                                if (item == 'diffusal_blade') {
                                    totalAttribute += parseInt(attribute.value[size-1]);
                                }
                                else {
                                    totalAttribute += parseInt(attribute.value[0]);
                                }
                            }
                            if (attribute.name == 'bonus_stat' && self.items()[i].state() == 2) {totalAttribute += parseInt(attribute.value[0]);};
                            if (attribute.name == 'bonus_agi') {totalAttribute += parseInt(attribute.value[0]);};
                        break;
                        case 'int':
                            if (attribute.name == 'bonus_intellect') {
                                if (item == 'necronomicon') {
                                    totalAttribute += parseInt(attribute.value[size-1]);
                                }
                                else if (item == 'diffusal_blade') {
                                    totalAttribute += parseInt(attribute.value[size-1]);
                                }
                                else if (item == 'dagon') {
                                    totalAttribute += parseInt(attribute.value[size-1]);
                                }
                                else {
                                    totalAttribute += parseInt(attribute.value[0]);
                                }
                            }
                            if (attribute.name == 'bonus_intelligence') {totalAttribute += parseInt(attribute.value[0]);};
                            if (attribute.name == 'bonus_int') {totalAttribute += parseInt(attribute.value[0]);};
                            if (attribute.name == 'bonus_stat' && self.items()[i].state() == 1) {totalAttribute += parseInt(attribute.value[0]);};
                        break;
                        case 'str':
                            if (attribute.name == 'bonus_strength') {
                                if (item == 'necronomicon') {
                                    totalAttribute += parseInt(attribute.value[size-1]);
                                }
                                else {
                                    totalAttribute += parseInt(attribute.value[0]);
                                }
                            }
                            if (attribute.name == 'bonus_stat' && self.items()[i].state() == 0) {totalAttribute += parseInt(attribute.value[0]);};
                            if (attribute.name == 'bonus_str') {totalAttribute += parseInt(attribute.value[0]);};
                            if (attribute.name == 'unholy_bonus_strength' && isActive) {totalAttribute += parseInt(attribute.value[0]);};
                        break;
                    }
                }
            }
            return totalAttribute;
        };
        self.getBash = function (attacktype) {
            var totalAttribute = 1;
            for (var i = 0; i < self.items().length; i++) {
                var item = self.items()[i].item;
                if (!self.items()[i].enabled()) continue;
                for (var j = 0; j < my.itemData['item_' + item].attributes.length; j++) {
                    var attribute = my.itemData['item_' + item].attributes[j];
                    switch(attribute.name) {
                        case 'bash_chance':
                            totalAttribute *= (1 - parseInt(attribute.value[0]) / 100);
                        break;
                        case 'bash_chance_melee':
                            if (attacktype == 'DOTA_UNIT_CAP_MELEE_ATTACK') { totalAttribute *= (1 - parseInt(attribute.value[0]) / 100); };
                        break;
                        case 'bash_chance_ranged':
                            if (attacktype == 'DOTA_UNIT_CAP_RANGED_ATTACK') { totalAttribute *= (1 - parseInt(attribute.value[0]) / 100); };
                        break;
                    }
                }
            }
            return totalAttribute;
        };
        
        self.getCritChance = function () {
            var totalAttribute = 1;
            for (var i = 0; i < self.items().length; i++) {
                var item = self.items()[i].item;
                var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
                if (!self.items()[i].enabled()) continue;
                for (var j = 0; j < my.itemData['item_' + item].attributes.length; j++) {
                    var attribute = my.itemData['item_' + item].attributes[j];
                    switch(attribute.name) {
                        case 'crit_chance':
                            totalAttribute *= (1 - parseInt(attribute.value[0]) / 100);
                        break;
                    }
                }
            }
            return totalAttribute;
        };
        
        self.getCritSource = function () {
            var sources = {};
            for (var i = 0; i < self.items().length; i++) {
                var item = self.items()[i].item;
                var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
                if (!self.items()[i].enabled()) continue;
                switch (item) {
                    case 'lesser_crit':
                    case 'greater_crit':
                        if (sources[item] == undefined) {
                            sources[item] = {
                                'chance': self.getItemAttributeValue(my.itemData['item_' + item].attributes, 'crit_chance', 0) / 100,
                                'multiplier': self.getItemAttributeValue(my.itemData['item_' + item].attributes, 'crit_multiplier', 0) / 100,
                                'count': 1,
                                'displayname': my.itemData['item_' + item].displayname
                            }
                        }
                        else {
                            sources[item].count += 1;
                        }
                    break;
                }

            }
            return sources;
        };

        self.getCleaveSource = function () {
            var sources = {};
            for (var i = 0; i < self.items().length; i++) {
                var item = self.items()[i].item;
                var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
                if (!self.items()[i].enabled()) continue;
                switch (item) {
                    case 'bfury':
                        if (sources[item] == undefined) {
                            sources[item] = {
                                'radius': self.getItemAttributeValue(my.itemData['item_' + item].attributes, 'cleave_radius', 0),
                                'magnitude': self.getItemAttributeValue(my.itemData['item_' + item].attributes, 'cleave_damage_percent', 0) / 100,
                                'count': 1,
                                'displayname': my.itemData['item_' + item].displayname
                            }
                        }
                        else {
                            sources[item].count += 1;
                        }
                    break;
                }

            }
            return sources;
        };
        
        self.getBashSource = function (attacktype) {
            var sources = {};
            for (var i = 0; i < self.items().length; i++) {
                var item = self.items()[i].item;
                var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
                if (!self.items()[i].enabled()) continue;
                switch (item) {
                    case 'javelin':
                        if (sources[item] == undefined) {
                            sources[item] = {
                                'damage': self.getItemAttributeValue(my.itemData['item_' + item].attributes, 'bonus_chance_damage', 1),
                                'damageType': 'physical',
                                'count': 1,
                                'chance': self.getItemAttributeValue(my.itemData['item_' + item].attributes, 'bonus_chance', 1) / 100,
                                'displayname': my.itemData['item_' + item].displayname + ' Pierce'
                            }                            
                        }
                        else {
                            sources[item].count += 1;
                        }
                    break;
                    case 'monkey_king_bar':
                        if (sources[item] == undefined) {
                            sources[item] = {
                                'item': item,
                                'chance': self.getItemAttributeValue(my.itemData['item_' + item].attributes, 'bash_chance', 0) / 100,
                                'damage': self.getItemAttributeValue(my.itemData['item_' + item].attributes, 'bash_damage', 0),
                                'duration': self.getItemAttributeValue(my.itemData['item_' + item].attributes, 'bash_stun', 0),
                                'count': 1,
                                'damageType': 'magic',
                                'displayname': my.itemData['item_' + item].displayname
                            }
                        }
                        else {
                            sources[item].count += 1;
                        }
                    break;
                    case 'abyssal_blade':
                    case 'basher':
                        if (sources[item] == undefined) {
                            if (attacktype == 'DOTA_UNIT_CAP_MELEE_ATTACK') {
                                sources[item] = {
                                    'item': item,
                                    'chance': self.getItemAttributeValue(my.itemData['item_' + item].attributes, 'bash_chance_melee', 0) / 100,
                                    'damage': 0,
                                    'duration': self.getItemAttributeValue(my.itemData['item_' + item].attributes, 'bash_duration', 0),
                                    'count': 1,
                                    'damageType': 'physical',
                                    'displayname': my.itemData['item_' + item].displayname
                                }                            
                            }
                            else {
                                sources[item] = {
                                    'item': item,
                                    'chance': self.getItemAttributeValue(my.itemData['item_' + item].attributes, 'bash_chance_ranged', 0) / 100,
                                    'damage': 0,
                                    'duration': self.getItemAttributeValue(my.itemData['item_' + item].attributes, 'bash_duration', 0),
                                    'count': 1,
                                    'damageType': 'physical',
                                    'displayname': my.itemData['item_' + item].displayname
                                }                            

                            }

                        }
                        else {
                            sources[item].count += 1;
                        }
                    break;
                }

            }
            return sources;
        };
        
        self.getOrbProcSource = function () {
            var sources = {};
            for (var i = 0; i < self.items().length; i++) {
                var item = self.items()[i].item;
                var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
                if (!self.items()[i].enabled()) continue;
                switch (item) {
                    case 'maelstrom':
                    case 'mjollnir':
                        if (sources[item] == undefined) {
                            sources[item] = {
                                'chance': self.getItemAttributeValue(my.itemData['item_' + item].attributes, 'chain_chance', 0) / 100,
                                'damage': self.getItemAttributeValue(my.itemData['item_' + item].attributes, 'chain_damage', 0),
                                'count': 1,
                                'damageType': 'magic',
                                'displayname': my.itemData['item_' + item].displayname
                            }
                        }
                        else {
                            sources[item].count += 1;
                        }
                    break;
                }

            }
            return sources;
        };

        self.getOrbSource = function () {
            var sources = {};
            for (var i = 0; i < self.items().length; i++) {
                var item = self.items()[i].item;
                var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
                if (!self.items()[i].enabled()) continue;
                switch (item) {
                    case 'diffusal_blade':
                        if (sources[item] == undefined) {
                            sources[item] = {
                                'chance': 1,
                                'damage': self.getItemAttributeValue(my.itemData['item_' + item].attributes, 'feedback_mana_burn', self.items()[i].size),
                                'count': 1,
                                'damageType': 'physical',
                                'displayname': my.itemData['item_' + item].displayname
                            }
                        }
                        else {
                            sources[item].count += 1;
                        }
                    break;
                }

            }
            return sources;
        };
        
        self.getHealth = function () {
            var totalAttribute = 0;
            for (var i = 0; i < self.items().length; i++) {
                var item = self.items()[i].item;
                if (!self.items()[i].enabled()) continue;
                for (var j = 0; j < my.itemData['item_' + item].attributes.length; j++) {
                    var attribute = my.itemData['item_' + item].attributes[j];
                    switch(attribute.name) {
                        case 'bonus_health':
                            totalAttribute += parseInt(attribute.value[0]);
                        break;
                    }
                }
            }
            return totalAttribute;
        };
        self.getHealthRegen = function () {
            var totalAttribute = 0;
            for (var i = 0; i < self.items().length; i++) {
                var item = self.items()[i].item;
                var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
                if (!self.items()[i].enabled()) continue;
                for (var j = 0; j < my.itemData['item_' + item].attributes.length; j++) {
                    var attribute = my.itemData['item_' + item].attributes[j];
                    switch(attribute.name) {
                        case 'health_regen':
                        case 'bonus_regen':
                            totalAttribute += parseInt(attribute.value[0]);
                        break;
                        case 'bonus_health_regen':
                            if (item == 'tranquil_boots' && !isActive) {
                                totalAttribute += parseInt(attribute.value[0]);
                            }
                            else if (item != 'tranquil_boots') {
                                totalAttribute += parseInt(attribute.value[0]);
                            }
                        break;
                        case 'hp_regen':
                            totalAttribute += parseInt(attribute.value[0]);
                        break;
                        case 'health_regen_rate':
                            if (item == 'heart' && isActive) {
                                totalAttribute += (parseInt(attribute.value[0]) / 100) * self.hero.health();
                            }
                        break;
                    }
                }
            }
            return totalAttribute;
        };
        self.getHealthRegenAura = function (e) {
            var totalAttribute = 0,
                excludeList = e || [];
            for (var i = 0; i < self.items().length; i++) {
                var item = self.items()[i].item;
                var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
                if (!self.items()[i].enabled()) continue;
                for (var j = 0; j < my.itemData['item_' + item].attributes.length; j++) {
                    var attribute = my.itemData['item_' + item].attributes[j];
                    if (excludeList.indexOf(item + attribute.name) > -1) continue;
                    switch(attribute.name) {
                        case 'aura_health_regen':
                            totalAttribute += parseInt(attribute.value[0]);
                            excludeList.push(item + attribute.name);
                        break;
                    }
                }
            }
            return {value: totalAttribute, excludeList: excludeList};
        };
        
        self.getMana = function () {
            var totalAttribute = 0;
            for (var i = 0; i < self.items().length; i++) {
                var item = self.items()[i].item;
                if (!self.items()[i].enabled()) continue;
                for (var j = 0; j < my.itemData['item_' + item].attributes.length; j++) {
                    var attribute = my.itemData['item_' + item].attributes[j];
                    switch(attribute.name) {
                        case 'bonus_mana':
                            totalAttribute += parseInt(attribute.value[0]);
                        break;
                    }
                }
            }
            return totalAttribute;
        };
        
        self.getManaRegen = function () {
            var totalAttribute = 0;
            for (var i = 0; i < self.items().length; i++) {
                var item = self.items()[i].item;
                if (!self.items()[i].enabled()) continue;
                for (var j = 0; j < my.itemData['item_' + item].attributes.length; j++) {
                    var attribute = my.itemData['item_' + item].attributes[j];
                    switch(attribute.name) {
                        case 'aura_mana_regen':
                        case 'mana_regen_aura':
                            totalAttribute += parseFloat(attribute.value[0]);
                        break;
                    }
                }
            }
            return totalAttribute;    
        };
        self.getManaRegenPercent = function () {
            var totalAttribute = 0;
            for (var i = 0; i < self.items().length; i++) {
                var item = self.items()[i].item;
                if (!self.items()[i].enabled()) continue;
                for (var j = 0; j < my.itemData['item_' + item].attributes.length; j++) {
                    var attribute = my.itemData['item_' + item].attributes[j];
                    switch(attribute.name) {
                        case 'bonus_mana_regen':
						case 'mana_regen':
						case 'bonus_mana_regen_pct':
                            totalAttribute += parseFloat(attribute.value[0]);
                        break;
                    }
                }
            }
            return totalAttribute / 100;    
        };
        self.getManaRegenBloodstone = function () {
            for (var i = 0; i < self.items().length; i++) {
                var item = self.items()[i].item;
                if (!self.items()[i].enabled()) continue;
                if (item.indexOf('bloodstone') != -1) {
                    return parseInt(self.items()[i].size);
                }
            }
            return 0;
        };
        
        self.getArmor = function () {
            var totalAttribute = 0;
            for (var i = 0; i < self.items().length; i++) {
                var item = self.items()[i].item;
                var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
                if (!self.items()[i].enabled()) continue;
                for (var j = 0; j < my.itemData['item_' + item].attributes.length; j++) {
                    var attribute = my.itemData['item_' + item].attributes[j];
                    switch(attribute.name) {
                        case 'bonus_armor':
                            if (!isActive || item != 'medallion_of_courage') { totalAttribute += parseInt(attribute.value[0]); };
                        break;
                    }
                }
            }
            return totalAttribute;
        };
        
        self.getArmorAura = function (aList) {
            var totalAttribute = 0,
                attributeList = aList || [];
            for (var i = 0; i < self.items().length; i++) {
                var item = self.items()[i].item;
                var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
                if (!self.items()[i].enabled()) continue;
                for (var j = 0;j < my.itemData['item_' + item].attributes.length; j++) {
                    var attribute = my.itemData['item_' + item].attributes[j];
                    if (_.find(attributeList, function (a) { return attribute.name == a.name; })) continue;
                    switch(attribute.name) {
                        // buckler
                        case 'bonus_aoe_armor':
							if (isActive) {
								attributeList.push({'name':attribute.name, 'value': parseInt(attribute.value[0])});
							}
                        break;
                        // assault
                        case 'aura_positive_armor':
                            attributeList.push({'name':attribute.name, 'value': parseInt(attribute.value[0])});
                        break;
                        // ring_of_aquila,ring_of_basilius
                        case 'aura_bonus_armor':
                            if (isActive) {
                                attributeList.push({'name':attribute.name, 'value': parseInt(attribute.value[0])});
                            }
                        break;
                        // vladmir
                        case 'armor_aura':
                            attributeList.push({'name':attribute.name, 'value': parseInt(attribute.value[0])});
                        break;
                        // mekansm
                        case 'heal_bonus_armor':
                            if (isActive) {
                                attributeList.push({'name':attribute.name, 'value': parseInt(attribute.value[0])});
                            }
                        break;
                    }
                }
            }
            // remove buckler if there is a mekansm
            if (_.find(attributeList, function (attribute) { return attribute.name == 'heal_bonus_armor'; })) {
                attributeList = _.reject(attributeList, function (attribute) {
                    return attribute.name == 'bonus_aoe_armor';
                });
            }
            // remove ring_of_aquila,ring_of_basilius if there is a vladmir
            if (_.find(attributeList, function (attribute) { return attribute.name == 'armor_aura'; })) {
                attributeList = _.reject(attributeList, function (attribute) {
                    return attribute.name == 'aura_bonus_armor';
                });
            }
            
            totalAttribute = _.reduce(attributeList, function (memo, attribute) {
                return memo += attribute.value;
            }, 0);
            return {value: totalAttribute, attributes: attributeList};
        };
        self.getArmorReduction = function (e) {
            var totalAttribute = 0,
                excludeList = e || [];
            for (var i = 0; i < self.items().length; i++) {
                var item = self.items()[i].item;
                var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
                if (!self.items()[i].enabled()) continue;
                for (var j = 0; j < my.itemData['item_' + item].attributes.length; j++) {
                    var attribute = my.itemData['item_' + item].attributes[j];
                    if (excludeList.indexOf(attribute.name) > -1 || excludeList.indexOf(item + '_' + attribute.name) > -1) continue;
                    switch(attribute.name) {
                        case 'armor_reduction':
                            totalAttribute += parseInt(attribute.value[0]);
                            excludeList.push(item + '_' + attribute.name);
                        break;
                        case 'aura_negative_armor':
                            totalAttribute += parseInt(attribute.value[0]);
                            excludeList.push(attribute.name);
                        break;
                        case 'corruption_armor':
                            totalAttribute += parseInt(attribute.value[0]);
                            excludeList.push(attribute.name);
                        break;
                    }
                }
            }
            return {value: totalAttribute, excludeList: excludeList};
        };
        self.getEvasion = function () {
            var totalAttribute = 1;
            for (var i = 0; i < self.items().length; i++) {
                var item = self.items()[i].item;
                var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
                if (!self.items()[i].enabled()) continue;
                for (var j = 0; j < my.itemData['item_' + item].attributes.length; j++) {
                    var attribute = my.itemData['item_' + item].attributes[j];
                    switch(attribute.name) {
                        case 'bonus_evasion':
                            if (item != 'butterfly' || !isActive) totalAttribute *= (1 - parseInt(attribute.value[0]) / 100);
                        break;
                    }
                }
            }
            return totalAttribute;
        };
        self.getMovementSpeedFlat = function () {
            var totalAttribute = 0,
            hasBoots = false,
            hasEuls = false,
            bootItems = ['boots','phase_boots','arcane_boots','travel_boots','power_treads','tranquil_boots','guardian_greaves'];
            for (var i = 0; i < self.items().length; i++) {
                var item = self.items()[i].item;
                var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
                if (!self.items()[i].enabled()) continue;
                for (var j = 0; j < my.itemData['item_' + item].attributes.length; j++) {
                    var attribute = my.itemData['item_' + item].attributes[j];
                    switch(attribute.name) {
                        case 'bonus_movement_speed':
                            if (!hasBoots && bootItems.indexOf(item) >= 0) {
                                if (item != 'tranquil_boots' || (item == 'tranquil_boots' && !isActive)) {
                                    totalAttribute += parseInt(attribute.value[0]);
                                    hasBoots = true;
                                }
                            }
                            //else if (!hasEuls && item == 'cyclone') {
                            else if (item == 'cyclone') {
                                totalAttribute += parseInt(attribute.value[0]);
                                hasEuls = true;
                            }
                        break;
                        case 'broken_movement_speed':
                            if (!hasBoots && bootItems.indexOf(item) >= 0) {
                                if (item == 'tranquil_boots' && isActive) {
                                    totalAttribute += parseInt(attribute.value[0]);
                                    hasBoots = true;
                                }
                            }
                        break;
                        case 'bonus_movement':
                            if (!hasBoots && bootItems.indexOf(item) >= 0) {
                                totalAttribute += parseInt(attribute.value[0]);
                                hasBoots = true;
                            }
                        break;
                    }
                }
            }
            return totalAttribute;
        };
        self.getMovementSpeedPercent = function (e) {
            var totalAttribute = 0,
                excludeList = e || [],
                hasYasha = false,
                hasDrums = false,
                hasDrumsActive = false,
                hasPhaseActive = false,
                hasShadowBladeActive = false,
                hasButterflyActive = false,
                hasMoMActive = false,
                yashaItems = ['manta','yasha','sange_and_yasha'];
            for (var i = 0; i < self.items().length; i++) {
                var item = self.items()[i].item;
                var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
                if (!self.items()[i].enabled()) continue;
                for (var j = 0; j < my.itemData['item_' + item].attributes.length; j++) {
                    var attribute = my.itemData['item_' + item].attributes[j];
                    if (excludeList.indexOf(attribute.name) > -1) continue;
                    switch(attribute.name) {
                        case 'movement_speed_percent_bonus':
                            if (!hasYasha && yashaItems.indexOf(item) >= 0) {
                                totalAttribute += parseInt(attribute.value[0]);
                                hasYasha = true;
                            }
                        break;
                        case 'bonus_aura_movement_speed_pct':
                            if (!hasDrums && item == 'ancient_janggo') {
                                totalAttribute += parseInt(attribute.value[0]);
                                hasDrums = true;
                                excludeList.push(attribute.name);
                            }
                        break;
                        case 'phase_movement_speed':
                            if (isActive && !hasPhaseActive) {
                                totalAttribute += parseInt(attribute.value[0]);
                                hasPhaseActive = true;
                            }
                        break;
                        case 'bonus_movement_speed_pct':
                            if (isActive && !hasDrumsActive && item == 'ancient_janggo') {
                                totalAttribute += parseInt(attribute.value[0]);
                                hasDrumsActive = true;
                                excludeList.push(attribute.name);
                            }
                        break;
                        case 'windwalk_movement_speed':
                            if (isActive && !hasShadowBladeActive && (item == 'invis_sword' || item == 'silver_edge')) {
                                totalAttribute += parseInt(attribute.value[0]);
                                hasShadowBladeActive = true;
                            }
                        break;
                        case 'berserk_bonus_movement_speed':
                            if (isActive && !hasMoMActive && item == 'mask_of_madness') {
                                totalAttribute += parseInt(attribute.value[0]);
                                hasMoMActive = true;
                            }
                        break;
                        case 'bonus_movement_speed': //manta
                            if (!hasYasha && item == 'manta') {
                                totalAttribute += parseInt(attribute.value[0]);
                                hasYasha = true;
                            }
                            else if (item == 'smoke_of_deceit' && isActive) {
                                totalAttribute += parseInt(attribute.value[0]);
                            }
                        break;
                        case 'bonus_move_speed':
                            if (isActive && !hasButterflyActive && item == 'butterfly') {
                                totalAttribute += parseInt(attribute.value[0]);
                                hasButterflyActive = true;
                            }
                        break;
                    }
                }
            }
            return {value: totalAttribute/100, excludeList: excludeList};
        };
        
        self.getMovementSpeedPercentReduction = function (e) {
            var totalAttribute = 0,
                excludeList = e || [];
            for (var i = 0; i < self.items().length; i++) {
                var item = self.items()[i].item;
                var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
                if (!self.items()[i].enabled()) continue;
                for (var j = 0; j < my.itemData['item_' + item].attributes.length; j++) {
                    var attribute = my.itemData['item_' + item].attributes[j];
                    if (excludeList.indexOf(attribute.name) > -1) continue;
                    switch(attribute.name) {
                        case 'movespeed':
                            if (item == 'dust' && isActive) {
                                totalAttribute += parseInt(attribute.value[0]);
                            }
                        case 'blast_movement_speed':
                            if (item == 'shivas_guard' && isActive) {
                                totalAttribute += parseInt(attribute.value[0]);
                                excludeList.push(attribute.name);
                            }
                        case 'cold_movement_speed':
                            if (item == 'skadi') {
                                totalAttribute += parseInt(attribute.value[0]);
                            }
                        break;
                        case 'maim_movement_speed':
                            if (self.items()[i].debuff && self.items()[i].debuff == 'maim') {
                                totalAttribute += parseInt(attribute.value[0]);
                                excludeList.push(attribute.name);
                            }
                        break;
                    }
                }
            }
            return {value: totalAttribute/100, excludeList: excludeList};
        };
        
        self.getBonusDamage = function () {
            var totalAttribute = 0;
            var sources = {};
            for (var i = 0; i < self.items().length; i++) {
                var item = self.items()[i].item;
                var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
                if (!self.items()[i].enabled()) continue;
                for (var j = 0; j < my.itemData['item_' + item].attributes.length; j++) {
                    var attribute = my.itemData['item_' + item].attributes[j];
                    switch(attribute.name) {
                        case 'bonus_damage':
                            totalAttribute += parseInt(attribute.value[0]);
                            if (sources[item] == undefined) {
                                sources[item] = {
                                    'damage': parseInt(attribute.value[0]),
                                    'damageType': 'physical',
                                    'count':1,
                                    'displayname': my.itemData['item_' + item].displayname
                                }                            
                            }
                            else {
                                sources[item].count += 1;
                            }
                        break;
                        case 'unholy_bonus_damage':
                            if (isActive) {
                                totalAttribute += parseInt(attribute.value[0]);
                                if (sources[item + '_active'] == undefined) {
                                    sources[item + '_active'] = {
                                        'damage': parseInt(attribute.value[0]),
                                        'damageType': 'physical',
                                        'count':1,
                                        'displayname': my.itemData['item_' + item].displayname + ' Unholy Strength'
                                    }                            
                                }
                                else {
                                    sources[item].count += 1;
                                }
                            }
                        break;
                    }
                }
            }
            return { sources: sources, total: totalAttribute };
        };
        self.getBonusDamagePercent = function (s) {
			s = s || {sources:{},total:0};
            var totalAttribute = s.total || 0;
            var sources = s.sources || {};
            for (var i = 0; i < self.items().length; i++) {
                var item = self.items()[i].item;
                var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
                if (!self.items()[i].enabled()) continue;
                for (var j = 0; j < my.itemData['item_' + item].attributes.length; j++) {
                    var attribute = my.itemData['item_' + item].attributes[j];
                    switch(attribute.name) {
                        case 'damage_aura':
                            if (sources[item] == undefined) {
								totalAttribute += parseInt(attribute.value[0]) / 100;
                                sources[item] = {
                                    'damage': parseInt(attribute.value[0]) / 100,
                                    'damageType': 'physical',
                                    'count':1,
                                    'displayname': my.itemData['item_' + item].displayname
                                }
                            }
                            // else {
                                // sources[item].count += 1;
                            // }
                        break;
                    }
                }
            }
            return { sources: sources, total: totalAttribute };
        };
        self.getAttackSpeed = function (e) {
            var totalAttribute = 0,
                hasPowerTreads = false,
                excludeList = e || [];
            for (var i = 0; i < self.items().length; i++) {
                var item = self.items()[i].item;
                var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
                if (!self.items()[i].enabled()) continue;
                for (var j = 0; j < my.itemData['item_' + item].attributes.length; j++) {
                    var attribute = my.itemData['item_' + item].attributes[j];
                    if (excludeList.indexOf(attribute.name) > -1) continue;
                    switch(attribute.name) {
                        case 'bonus_attack_speed':
                            if (item == 'power_treads') {
                                if (!hasPowerTreads) {
                                    totalAttribute += parseInt(attribute.value[0]);
                                    hasPowerTreads = true;
                                }
                            }
                            else if (item == 'moon_shard') {
                                if (!isActive) {
                                    totalAttribute += parseInt(attribute.value[0]);
                                }
                            }
                            else {
                                totalAttribute += parseInt(attribute.value[0]);
                            }
                        break;
                        case 'consumed_bonus':
                            if (item == 'moon_shard' && isActive) {
                                totalAttribute += parseInt(attribute.value[0]);
                            }
                        break;
                        break;
                        case 'bonus_speed':
                            totalAttribute += parseInt(attribute.value[0]);
                        break;
                        case 'aura_attack_speed':
                            if (item != 'shivas_guard') { totalAttribute += parseInt(attribute.value[0]); };
                        break;
                        // ancient_janggo
                        case 'bonus_aura_attack_speed_pct':
                            totalAttribute += parseInt(attribute.value[0]);
                            excludeList.push(attribute.name);
                        break;
                        // ancient_janggo
                        case 'bonus_attack_speed_pct':
                            if (isActive) {
                                totalAttribute += parseInt(attribute.value[0]);
                                excludeList.push(attribute.name);
                            }
                        break;
                        case 'unholy_bonus_attack_speed':
                            if (isActive) { totalAttribute += parseInt(attribute.value[0]); };
                        break;
                        case 'berserk_bonus_attack_speed':
                            if (isActive) { totalAttribute += parseInt(attribute.value[0]); };
                        break;
                    }
                }
            }
            return {value: totalAttribute, excludeList: excludeList};
        };
        self.getAttackSpeedReduction = function (e) {
            var totalAttribute = 0,
                excludeList = e || [];
            for (var i = 0; i < self.items().length; i++) {
                var item = self.items()[i].item;
                var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
                if (!self.items()[i].enabled()) continue;
                for (var j = 0; j < my.itemData['item_' + item].attributes.length; j++) {
                    var attribute = my.itemData['item_' + item].attributes[j];
                    if (excludeList.indexOf(attribute.name) > -1) continue;
                    switch(attribute.name) {
                        case 'aura_attack_speed':
                            if (item == 'shivas_guard') {
                                totalAttribute += parseInt(attribute.value[0]);
                                excludeList.push(attribute.name);
                            }
                        break;
                        case 'cold_attack_speed':
                            if (item == 'skadi') {
                                totalAttribute += parseInt(attribute.value[0]);
                                excludeList.push(attribute.name);
                            }
                        break;
                        case 'maim_attack_speed':
                            if (self.items()[i].debuff && self.items()[i].debuff == 'maim') {
                                totalAttribute += parseInt(attribute.value[0]);
                                excludeList.push(attribute.name);
                            }
                        break;
                    }
                }
            }
            return {value: totalAttribute, excludeList: excludeList};
        };
        self.getLifesteal = function () {
            var totalAttribute = 0;
            for (var i = 0; i < self.items().length; i++) {
                var item = self.items()[i].item;
                var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
                if (!self.items()[i].enabled()) continue;
                for (var j = 0; j < my.itemData['item_' + item].attributes.length; j++) {
                    var attribute = my.itemData['item_' + item].attributes[j];
                    switch(attribute.name) {
                        case 'lifesteal_percent':
                            if (item == 'satanic') {
                                if (!isActive) { return parseInt(attribute.value[0]); };
                            }
                            else {
                                return parseInt(attribute.value[0]);
                            }
                        break;
                        case 'unholy_lifesteal_percent':
                            if (isActive) { return parseInt(attribute.value[0]); };
                        break;
                    }
                }
            }
            return totalAttribute;
        };
        self.getLifestealAura = function (e) {
            var totalAttribute = 0,
				excludeList = e || [];
            for (var i = 0; i < self.items().length; i++) {
                var item = self.items()[i].item;
                var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
                if (!self.items()[i].enabled()) continue;
                for (var j = 0; j < my.itemData['item_' + item].attributes.length; j++) {
                    var attribute = my.itemData['item_' + item].attributes[j];
					if (excludeList.indexOf(attribute.name) > -1) continue;
                    switch(attribute.name) {
                        case 'vampiric_aura':
                            totalAttribute += parseInt(attribute.value[0]);
							excludeList.push(attribute.name);
                        break;
                    }
                }
            }
            return {value: totalAttribute, excludeList: excludeList};
        };
        self.getMagicResist = function () {
            var totalAttribute = 1;
            for (var i = 0; i < self.items().length; i++) {
                var item = self.items()[i].item;
                var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
                if (!self.items()[i].enabled()) continue;
                for (var j = 0; j < my.itemData['item_' + item].attributes.length; j++) {
                    var attribute = my.itemData['item_' + item].attributes[j];
                    switch(attribute.name) {
                        case 'bonus_magical_armor':
                            totalAttribute *= (1 - parseInt(attribute.value[0]) / 100);
                        break;
                        case 'bonus_spell_resist':
                            totalAttribute *= (1 - parseInt(attribute.value[0]) / 100);
                        break;
                        case 'magic_resistance':
                            totalAttribute *= (1 - parseInt(attribute.value[0]) / 100);
                        break;
                    }
                }
            }
            return totalAttribute;
        };
        self.getMagicResistReductionSelf = function () {
            var totalAttribute = 1;
            for (var i = 0; i < self.items().length; i++) {
                var item = self.items()[i].item;
                var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
                if (!self.items()[i].enabled()) continue;
                if (isActive) {
                    for (var j = 0; j < my.itemData['item_' + item].attributes.length; j++) {
                        var attribute = my.itemData['item_' + item].attributes[j];
                        switch(attribute.name) {
                            case 'extra_spell_damage_percent':
							case 'ethereal_damage_bonus':
                                return (1 - parseInt(attribute.value[0]) / 100);
                            break;
                        }
                    }
                }
            }
            return totalAttribute;
        };   
        self.getMagicResistReduction = function () {
            var totalAttribute = 1;
            for (var i = 0; i < self.items().length; i++) {
                var item = self.items()[i].item;
                var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
                if (!self.items()[i].enabled()) continue;
                if (isActive) {
                    for (var j = 0; j < my.itemData['item_' + item].attributes.length; j++) {
                        var attribute = my.itemData['item_' + item].attributes[j];
                        switch(attribute.name) {
                            case 'ethereal_damage_bonus':
                                if (!self.isEthereal()) totalAttribute *= (1 - parseInt(attribute.value[0]) / 100);
                            case 'resist_debuff':
                                totalAttribute *= (1 - parseInt(attribute.value[0]) / 100);
                            break;
                        }
                    }
                }
            }
            return totalAttribute;
        };        

        self.getVisionRangeNight = ko.computed(function () {
            var totalAttribute = 0;
            for (var i = 0; i < self.items().length; i++) {
                var item = self.items()[i].item;
                var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
                if (!self.items()[i].enabled()) continue;
                for (var j = 0; j < my.itemData['item_' + item].attributes.length; j++) {
                    var attribute = my.itemData['item_' + item].attributes[j];
                    switch(attribute.name) {
                        case 'bonus_night_vision':
                            if (item != 'moon_shard' || !isActive) {
                                totalAttribute += parseInt(attribute.value[0]);
                            }
                        break;
                    }
                }
            }
            return totalAttribute;
        });
        
        self.getAttackRange = function (attacktype, aList) {
            var totalAttribute = 0,
                attributeList = aList || [];
            for (var i = 0; i < self.items().length; i++) {
                var item = self.items()[i].item;
                var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
                if (!self.items()[i].enabled()) continue;
                for (var j = 0;j < my.itemData['item_' + item].attributes.length; j++) {
                    var attribute = my.itemData['item_' + item].attributes[j];
                    if (_.find(attributeList, function (a) { return attribute.name == a.name; })) continue;
                    switch(attribute.name) {
                        // dragon_lance
                        case 'base_attack_range':
                            if (attacktype == 'DOTA_UNIT_CAP_RANGED_ATTACK') attributeList.push({'name':attribute.name, 'value': parseInt(attribute.value[0])});
                        break;
                    }
                }
            }
            
            totalAttribute = _.reduce(attributeList, function (memo, attribute) {
                return memo += attribute.value;
            }, 0);
            return {value: totalAttribute, attributes: attributeList};
        };
        
        self.getMissChance = function (e) {
            var totalAttribute = 1,
                excludeList = e || [];
            for (var i = 0; i < self.items().length; i++) {
                var item = self.items()[i].item;
                var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
                if (!self.items()[i].enabled()) continue;
                for (var j = 0; j < my.itemData['item_' + item].attributes.length; j++) {
                    var attribute = my.itemData['item_' + item].attributes[j];
                    if (excludeList.indexOf(attribute.name) > -1) continue;
                    switch(attribute.name) {
                        case 'miss_chance':
                            totalAttribute *= (1 - parseInt(attribute.value[0]) / 100);
                            excludeList.push(attribute.name);
                        break;
                        case 'blind_pct':
                            totalAttribute *= (1 - parseInt(attribute.value[0]) / 100);
                            excludeList.push(attribute.name);
                        break;
                    }
                }
            }
            return {value: totalAttribute, excludeList: excludeList};
        };
        
        self.getBaseDamageReductionPct = function () {
            var totalAttribute = 1;
            for (var i = 0; i < self.items().length; i++) {
                var item = self.items()[i].item;
                var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
                if (!self.items()[i].enabled()) continue;
                for (var j = 0; j < my.itemData['item_' + item].attributes.length; j++) {
                    var attribute = my.itemData['item_' + item].attributes[j];
                    switch(attribute.name) {
                        case 'backstab_reduction':
                            if (self.items()[i].debuff && self.items()[i].debuff == 'shadow_walk') {
                                totalAttribute *= (1 + parseInt(attribute.value[0]) / 100);
                            }
                        break;
                    }
                }
            }
            return totalAttribute;
        };    
        self.getBonusDamageReductionPct = function () {
            var totalAttribute = 1;
            for (var i = 0; i < self.items().length; i++) {
                var item = self.items()[i].item;
                var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
                if (!self.items()[i].enabled()) continue;
                for (var j = 0; j < my.itemData['item_' + item].attributes.length; j++) {
                    var attribute = my.itemData['item_' + item].attributes[j];
                    switch(attribute.name) {
                        case 'backstab_reduction':
                            if (self.items()[i].debuff && self.items()[i].debuff == 'shadow_walk') {
                                totalAttribute *= (1 + parseInt(attribute.value[0]) / 100);
                            }
                        break;
                    }
                }
            }
            return totalAttribute;
        };    
        
        self.itemOptions = ko.observableArray([]);
        var itemOptionsArr = [];
        for (var i = 0; i < my.validItems.length; i++) {
            itemOptionsArr.push(new my.ItemInput(my.validItems[i], my.itemData['item_' + my.validItems[i]].displayname));
        }
        self.itemOptions.push.apply(self.itemOptions, itemOptionsArr);
        /*for (i in my.itemData) {
            self.itemOptions.push(new my.ItemInput(i.replace('item_',''),my.itemData[i].displayname));
        }*/
        
        var itemBuffs = ['assault', 'ancient_janggo', 'headdress', 'mekansm', 'pipe', 'ring_of_aquila', 'vladmir', 'ring_of_basilius', 'buckler', 'solar_crest'];
        self.itemBuffOptions = ko.observableArray(_.map(itemBuffs, function(item) { return new my.ItemInput(item, my.itemData['item_' + item].displayname); }));
        /*for (i in itemBuffs) {
            self.itemBuffOptions.push(new my.ItemInput(itemBuffs[i], my.itemData['item_' + itemBuffs[i]].displayname));
        }*/
        self.selectedItemBuff = ko.observable('assault');

        var itemDebuffs = [
            {item: 'assault', debuff: null},
            {item: 'shivas_guard', debuff: null},
            {item: 'desolator', debuff: null},
            {item: 'medallion_of_courage', debuff: null},
            {item: 'radiance', debuff: null},
            {item: 'sheepstick', debuff: null},
            {item: 'veil_of_discord', debuff: null},
            {item: 'solar_crest', debuff: null},
            {item: 'silver_edge', debuff: {id: 'shadow_walk', name: 'Shadow Walk'}},
            {item: 'silver_edge', debuff: {id: 'maim', name: 'Lesser Maim'}}
        ]
        self.itemDebuffOptions = ko.observableArray(_.map(itemDebuffs,
            function(item) {
                return new my.ItemInput(item.item, my.itemData['item_' + item.item].displayname, item.debuff);
            })
        );
        /*for (i in itemDebuffs) {
            self.itemDebuffOptions.push(new my.ItemInput(itemDebuffs[i], my.itemData['item_' + itemDebuffs[i]].displayname));
        }*/
        self.selectedItemDebuff = ko.observable('assault');
        
        return self;
    };

    
    return my;
}(HEROCALCULATOR));
var HEROCALCULATOR = (function (my) {

    var itemtooltipdata = {}

    function getTooltipItemDescription(item) {
        var d = item.description;
        for (var i = 0; i < item.attributes.length; i++) {
            if (item.attributes[i].name != null) {
                var attributeName = item.attributes[i].name;
                var attributeValue = item.attributes[i].value[0];
                for (var j = 1; j < item.attributes[i].value.length; j++) {
                    attributeValue += ' / ' + item.attributes[i].value[j];
                }
                var regexp = new RegExp('%' + attributeName + '%', 'gi');
                d = d.replace(regexp, attributeValue );
            }
        }
        var regexp = new RegExp('%%', 'gi');
        d = d.replace(regexp,'%');
        regexp = new RegExp('\n', 'gi');
        d = d.replace(/\\n/g, '<br>');
        return d;
    }

    var ability_vars = {
        '$health': 'Health',
        '$mana': 'Mana',
        '$armor': 'Armor',
        '$damage': 'Damage',
        '$str': 'Strength',
        '$int': 'Intelligence',
        '$agi': 'Agility',
        '$all': 'All Attributes',
        '$attack': 'Attack Speed',
        '$hp_regen': 'HP Regeneration',
        '$mana_regen': 'Mana Regeneration',
        '$move_speed': 'Movement Speed',
        '$evasion': 'Evasion',
        '$spell_resist': 'Spell Resistance',
        '$selected_attribute': 'Selected Attribute',
        '$selected_attrib': 'Selected Attribute',
        '$cast_range': 'Cast Range',
        '$attack_range': 'Attack Range'
    }

    function getTooltipItemAttributes(item) {
        var a = '';
        console.log('getTooltip', item);
        for (var i = 0; i < item.attributes.length; i++) {
            if (item.attributes[i].tooltip != null) {
                var attributeTooltip = item.attributes[i].tooltip;
                var attributeValue = item.attributes[i].value[0];
                for (var j = 1; j < item.attributes[i].value.length; j++) {
                    attributeValue += ' / ' + item.attributes[i].value[j];
                }
                var p = attributeTooltip.indexOf('%');
                if (p == 0) {
                    attributeValue = attributeValue + '%';
                    attributeTooltip = attributeTooltip.slice(1);
                }
                var d = attributeTooltip.indexOf('$');
                if (d != -1) {
                    a = a + attributeTooltip.slice(0, d) + ' ' + attributeValue + ' ' + ability_vars[attributeTooltip.slice(d)] + '<br>';
                }
                else {
                    a = a + attributeTooltip + ' ' + attributeValue + '<br>';
                }
            }
        }
        return a.trim('<br>');
    }

    function getTooltipItemCooldown(item) {
        var c = '';
        for (var i = 0; i < item.cooldown.length; i++) {
            c = c + ' ' + item.cooldown[i];
        }
        return c;
    }

    function getTooltipItemManaCost(item) {
        var c = '';
        for (var i = 0; i < item.manacost.length; i++) {
            if (item.manacost[i] > 0) {
                c = c + ' ' + item.manacost[i];
            }
        }
        return c;
    }
    
    my.getItemTooltipData = function(el) {
        if (my.itemData['item_' + el] == undefined) {
            return undefined;
        }
        if (itemtooltipdata[el] == undefined) {
            var item = my.itemData['item_' + el];
            var data = $('<div>');
            data.append($('<span>').html(item.displayname).addClass('item_field item_name'));
            data.append($('<span>').html(item.itemcost).addClass('item_field item_cost'));
            data.append($('<hr>'));
            if (item.description != null) {
                data.append($('<div>').html(getTooltipItemDescription(item)).addClass('item_field item_description'));
            }
            var attributedata = getTooltipItemAttributes(item);
            if (attributedata != '') {
                data.append($('<div>').html(attributedata).addClass('item_field item_attributes'));
            }
            var cd = getTooltipItemCooldown(item);
            var mana = getTooltipItemManaCost(item);
            if (cd != '' || mana != '') {
                var cdmanacost = $('<div>').addClass('item_cdmana');
                if (cd != '') {
                    cdmanacost.append($('<span>').html(cd).addClass('item_field item_cooldown'));
                }
                if (mana != '') {
                    cdmanacost.append($('<span>').html(mana).addClass('item_field item_manacost'));
                }
                data.append(cdmanacost);
            }
            if (item.lore != null) {
                data.append($('<div>').html(item.lore).addClass('item_field item_lore'));
            }
            itemtooltipdata[el] = data.html();
            return data.html();
        }
        else {
            return itemtooltipdata[el];
        }
    }

    var abilityTooltipData = {}

    function getTooltipAbilityDescription(item) {
        var d = item.description;
        for (var i = 0; i < item.attributes.length; i++) {
            if (item.attributes[i].name != null) {
                var attributeName = item.attributes[i].name;
                var attributeValue = item.attributes[i].value[0];
                for (var j = 1; j < item.attributes[i].value.length; j++) {
                    attributeValue += ' / ' + item.attributes[i].value[j];
                }
                regexp = new RegExp('%' + attributeName + '%', 'gi');
                d = d.replace(regexp, attributeValue);
            }
        }
        var regexp = new RegExp('%%', 'gi');
        d = d.replace(regexp, '%');
        regexp = new RegExp('\n', 'gi');
        d = d.replace(/\\n/g, '<br>');
        return d;
    }

    function getTooltipAbilityAttributes(item) {
        var a = '';
        if (item.damage.length > 0 && _.reduce(item.damage, function(memo, num){ return memo + num; }, 0) > 0) {
            var attributeTooltip = 'DAMAGE: ';
            var attributeValue = item.damage[0];
            for (var j = 1; j < item.damage.length; j++) {
                attributeValue += ' / ' + item.damage[j];
            }
            a = a + attributeTooltip + ' ' + attributeValue + '<br>';
        }
        for (var i = 0; i < item.attributes.length; i++) {
            if (item.attributes[i].tooltip != null) {
                var attributeTooltip = item.attributes[i].tooltip;
                attributeTooltip = attributeTooltip.replace(/\\n/g, '');
                var attributeValue = item.attributes[i].value[0];
                for (var j = 1; j < item.attributes[i].value.length; j++) {
                    attributeValue += ' / ' + item.attributes[i].value[j];
                }
                var p = attributeTooltip.indexOf('%');
                if (p == 0) {
                    if (attributeValue.toString().indexOf('/') == -1) {
                        attributeValue = attributeValue.toString().trim() + '%';
                    } else {
                        //var regexp2 = new RegExp('/', 'gi');
                        //attributeValue = attributeValue.replace(regexp2, '%/') + '%';
                        var attributeValues = attributeValue.split('/');
                        trimmedAttributeValues = _.map(attributeValues, function(v) {
                            return v.trim();
                        });
                        attributeValue = trimmedAttributeValues.join('% / ') + '%';
                    }
                    attributeTooltip = attributeTooltip.slice(1);
                }
                var d = attributeTooltip.indexOf('$');
                a = a + attributeTooltip + ' ' + attributeValue + '<br>';
            }
        }
        return a.trim('<br>');
    }

    function getTooltipAbilityManaCost(item) {
        var c = '';
        if (_.reduce(item.manacost, function(memo, num){ return memo + num; }, 0) == 0) {
            return c;
        }
        if (_.every(item.manacost, function(num) { return num == item.manacost[0]; })) {
            return item.manacost[0].toString();
        }
        for (var i = 0; i < 4; i++) {
            if (item.manacost[i] != null) {
                c = c + ' ' + item.manacost[i];
            }
        }
        return c;
    }

    function getTooltipAbilityCooldown(item) {
        var c = '';
        if (_.reduce(item.cooldown, function(memo, num){ return memo + num; }, 0) == 0) {
            return c;
        }
        if (_.every(item.cooldown, function(num) { return num == item.cooldown[0]; })) {
            return item.cooldown[0].toString();
        }
        for (var i = 0; i < 4; i++) {
            if (item.cooldown[i] != null) {
                c = c + ' ' + item.cooldown[i];
            }
        }
        return c;
    }
    
    var abilityDamageTypes = {
        'DAMAGE_TYPE_MAGICAL': 'Magical',
        'DAMAGE_TYPE_PURE': 'Pure',
        'DAMAGE_TYPE_PHYSICAL': 'Physical',
        'DAMAGE_TYPE_COMPOSITE': 'Composite',
        'DAMAGE_TYPE_HP_REMOVAL': 'HP Removal'
    }
        
    my.getAbilityTooltipData = function(hero, el) {
        if (abilityTooltipData[el] == undefined) {
            var abilityName = el
            var ability = {};
            if (my.heroData[hero] == undefined) {
                for (var i = 0; i < my.unitData[hero].abilities.length; i++) {
                    if (my.unitData[hero].abilities[i].name == el) {
                        ability = my.unitData[hero].abilities[i];
                    }
                }            
            }
            else {
                for (var i = 0; i < my.heroData[hero].abilities.length; i++) {
                    if (my.heroData[hero].abilities[i].name == el) {
                        ability = my.heroData[hero].abilities[i];
                    }
                }
            }
            var data = $('<div>')
            data.append($('<span>').html(ability.displayname).addClass('item_field pull-left item_name'));
            if (ability.abilityunitdamagetype) {
                data.append($('<span>').html(abilityDamageTypes[ability.abilityunitdamagetype]).addClass('item_field pull-right item_ability_damage_type').css('margin-right','10px'));
            }
            data.append($('<hr>').css('clear', 'both'));
            if (ability.description != null) {
                data.append($('<div>').html(getTooltipAbilityDescription(ability)).addClass('item_field item_description'));
            }
            var attributedata = getTooltipAbilityAttributes(ability);
            if (attributedata != '') {
                data.append($('<div>').html(attributedata).addClass('item_field item_attributes'));
            }
            var cd = getTooltipAbilityCooldown(ability);
            var mana = getTooltipAbilityManaCost(ability);
            if (cd != '' || mana != '') {
                var cdmanacost = $('<div>').addClass('item_cdmana');
                if (mana != '') {
                    cdmanacost.append($('<span>').html(mana.trim()).addClass('item_field item_manacost'));
                }
                if (cd != '') {
                    cdmanacost.append($('<span>').html(cd.trim()).addClass('item_field item_cooldown'));
                }
                data.append(cdmanacost);
            }
            if (ability.lore != null) {
                data.append($('<div>').html(ability.lore).addClass('item_field item_lore'));
            }
            abilityTooltipData[el] = data.html();
            return data.html();
        }
        else {
            return abilityTooltipData[el];
        }
    }
    
    return my;
}(HEROCALCULATOR));
var HEROCALCULATOR = (function (my) {
    my.abilityData = {
        'alchemist_acid_spray': [
            {
                label: 'Duration',
                controlType: 'input'
            },
            {
                attributeName: 'damage',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                }
            },
            {
                attributeName: 'armor_reduction',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return -a;
                },
                returnProperty: 'armorReduction'
            }
        ],
        'alchemist_unstable_concoction': [
            {
                label: 'Brew Time',
                controlType: 'input'
            },
            {
                attributeName: 'max_damage',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return v*a/5;
                }
            },
            {
                attributeName: 'max_stun',
                label: 'Total Stun',
                controlType: 'text',
                fn: function(v,a) {
                    return v*a/5;
                }
            }
        ],
        'ancient_apparition_cold_feet': [
            {
                label: 'Duration',
                controlType: 'input'
            },
            {
                attributeName: 'damage',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                }
            },
            {
                attributeName: 'stun_duration',
                label: 'Total Stun',
                controlType: 'text',
                fn: function(v,a) {
                    return a;
                }
            }
        ],
        'ancient_apparition_ice_blast': [
            {
                label: 'Duration',
                controlType: 'input'
            },
            {
                attributeName: 'dot_damage',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a,parent,index) {
                    return parent.ability().getAbilityPropertyValue(parent.ability().abilities()[index], 'damage')+v*a;
                }
            }
        ],
        'antimage_mana_void': [
            {
                label: 'Enemy Missing Mana',
                controlType: 'input'
            },
            {
                attributeName: 'mana_void_damage_per_mana',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                }
            }
        ],
        'axe_battle_hunger': [
            {
                label: 'Battle Hungered Enemies',
                controlType: 'input'
            },
            {
                attributeName: 'speed_bonus',
                label: 'Movement Speed Bonus',
                controlType: 'text',
                noLevel: true,
                fn: function(v,a) {
                    return v*a;
                },
                returnProperty: 'movementSpeedPct'
            },
            {
                attributeName: 'slow',
                label: 'Movement Speed Bonus',
                controlType: 'text',
                noLevel: true,
                fn: function(v,a) {
                    return a;
                },
                returnProperty: 'movementSpeedPctReduction'
            }
        ],
        'bane_nightmare': [
            {
                label: 'Duration',
                controlType: 'input'
            },
            {
                label: 'DAMAGE:',
                controlType: 'text',
                fn: function(v,a,parent,index) {
                    return parent.ability().getAbilityPropertyValue(parent.ability().abilities()[index], 'damage')*v;
                }
            }
        ],
        'bane_fiends_grip': [
            {
                label: 'Duration',
                controlType: 'input'
            },
            {
                label: 'Enemy Max Mana',
                controlType: 'input'
            },
            {
                attributeName: 'fiend_grip_damage',
                label: 'Total Damage',
                controlType: 'text',
                controls: [0,1],
                fn: function(v,a,parent,index) {
                    if (parent.inventory.hasScepter()) {
                        return v[0]*parent.ability().getAbilityAttributeValue(parent.ability().abilities()[index].attributes(), 'fiend_grip_damage_scepter',parent.ability().abilities()[index].level());
                    }
                    else {
                        return v[0]*a;
                    }
                }
            },
            {
                attributeName: 'fiend_grip_mana_drain',
                label: 'Total Mana Drain',
                controlType: 'text',
                controls: [0,1],
                noLevel: true,
                fn: function(v,a,parent,index) {
                    if (parent.inventory.hasScepter()) {
                        return v[0]*v[1]*parent.ability().getAbilityAttributeValue(parent.ability().abilities()[index].attributes(), 'fiend_grip_mana_drain_scepter',parent.ability().abilities()[index].level())/100;
                    }
                    else {
                        return v[0]*v[1]*a/100;
                    }
                }
            }
        ],
        'batrider_sticky_napalm': [
            {
                label: 'Stacks',
                controlType: 'input'
            },
            {
                attributeName: 'damage',
                label: 'Total Bonus Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                },
                returnProperty: 'bonusDamage'
            },
            {
                attributeName: 'movement_speed_pct',
                label: 'Enemy Movement Speed Slow',
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                },
                returnProperty: 'movementSpeedPctReduction'
            },
            {
                attributeName: 'turn_rate_pct',
                label: 'Enemy Turn Rate Slow',
                controlType: 'text',
                fn: function(v,a) {
                    return a;
                },
                returnProperty: 'turnRateReduction'
            }
        ],
        'batrider_firefly': [
            {
                label: 'Duration',
                controlType: 'input'
            },
            {
                attributeName: 'damage_per_second',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                }
            }
        ],
        'bloodseeker_rupture': [
            {
                label: 'Enemy Distance Traveled',
                controlType: 'input'
            },
            {
                attributeName: 'movement_damage_pct',
                label: 'DAMAGE:',
                ignoreTooltip: true,
                controlType: 'text',
                fn: function(v,a,parent,index) {
                    return parent.ability().getAbilityPropertyValue(parent.ability().abilities()[index], 'damage') + v*a/100;
                }
            }
        ],
        'bristleback_viscous_nasal_goo': [
            {
                label: 'Stacks',
                controlType: 'input'
            },
            {
                attributeName: 'armor_per_stack',
                label: 'Enemy Armor Reduction',
                controlType: 'text',
                fn: function(v,a) {
                    return -v*a;
                },
                returnProperty: 'armorReduction'
            },
            {
                attributeName: 'move_slow_per_stack',
                label: '%SLOW:',
                ignoreTooltip: true,
                controlType: 'text',
                fn: function(v,a,parent,index,abilityList) {
                    return -(abilityList.getAbilityAttributeValue(abilityList.abilities()[index].attributes(), 'base_move_slow',0)+v*a);
                },
                returnProperty: 'movementSpeedPctReduction'
            }
        ],
        'bristleback_quill_spray': [
            {
                label: 'Stacks',
                controlType: 'input'
            },
            {
                attributeName: 'quill_stack_damage',
                label: 'DAMAGE',
                controlType: 'text',
                fn: function(v,a,parent,index) {
                    var total = parent.ability().getAbilityAttributeValue(parent.ability().abilities()[index].attributes(), 'quill_base_damage',parent.ability().abilities()[index].level())+v*a,
                    damage_cap = parent.ability().getAbilityAttributeValue(parent.ability().abilities()[index].attributes(), 'max_damage',0);
                    if (total > damage_cap) {
                        total = damage_cap;
                    }
                    return total;
                }
            }
        ],
        'bristleback_bristleback': [
            {
                label: 'Damage From',
                controlType: 'radio',
                controlValueType: 'string',
                controlOptions: [
                    {text: 'Back', value: 'back'},
                    {text: 'Side', value: 'side'}
                ]
            },
            {
                attributeName: 'back_damage_reduction',
                label: '%DAMAGE REDUCTION:',
                ignoreTooltip: true,
                controlType: 'text',
                fn: function(v,a,parent,index) {
                    var ability = _.find(this.abilities(), function(b) {
                        return b.name() == 'bristleback_bristleback';
                    });
                    if (v == 'back') {
                        var total = this.getAbilityAttributeValue(ability.attributes(), 'back_damage_reduction', ability.level());
                    }
                    else {
                        var total = this.getAbilityAttributeValue(ability.attributes(), 'side_damage_reduction', ability.level());
                    }
                    return -total;
                },
                returnProperty: 'damageReduction'
            }
        ],
        'bristleback_warpath': [
            {
                label: 'Stacks',
                controlType: 'input'
            },
            {
                attributeName: 'damage_per_stack',
                label: 'BONUS DAMAGE:',
                ignoreTooltip: true,
                controlType: 'text',
                fn: function(v,a,parent,index) {
                    if (v < 1) {
                        return 0;
                    }
                    else {
                        return parent.ability().getAbilityAttributeValue(parent.ability().abilities()[index].attributes(), 'base_damage',parent.ability().abilities()[index].level())+(v-1)*a;
                    }
                }
            },
            {
                attributeName: 'move_speed_per_stack',
                label: '%MOVEMENT:',
                ignoreTooltip: true,
                controlType: 'text',
                fn: function(v,a,parent,index) {
                    if (v < 1) {
                        return 0;
                    }
                    else {
                        return parent.ability().getAbilityAttributeValue(parent.ability().abilities()[index].attributes(), 'base_move_speed',parent.ability().abilities()[index].level())+(v-1)*a;
                    }
                },
                returnProperty: 'movementSpeedPct'
            }
        ],
        'centaur_return': [
            {
                label: 'Strength',
                controlType: 'input'
            },
            {
                attributeName: 'strength_pct',
                label: 'DAMAGE:',
                controlType: 'text',
                fn: function(v,a,parent,index) {
                    return parent.ability().getAbilityAttributeValue(parent.ability().abilities()[index].attributes(), 'return_damage',parent.ability().abilities()[index].level()) + v*a/100;
                }
            }
        ],
        'centaur_stampede': [
            {
                label: 'Strength',
                controlType: 'input'
            },
            {
                attributeName: 'strength_damage',
                label: 'DAMAGE:',
                ignoreTooltip: true,
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                }
            },
            {
                attributeName: 'slow_movement_speed',
                label: 'Enemy Movement Speed Slow',
                controlType: 'text',
                fn: function(v,a) {
                    return -a;
                },
                returnProperty: 'movementSpeedPctReduction'
            }
        ],
        'clinkz_death_pact': [
            {
                label: 'Consumed Unit HP',
                controlType: 'input'
            },
            {
                attributeName: 'damage_gain_pct',
                label: 'BASE DAMAGE GAIN:',
                ignoreTooltip: true,
                controlType: 'text',
                fn: function(v,a) {
                    return v*a/100;
                },
                returnProperty: 'baseDamage'
            },
            {
                attributeName: 'health_gain_pct',
                label: 'HEALTH GAIN:',
                ignoreTooltip: true,
                controlType: 'text',
                fn: function(v,a) {
                    return v*a/100;
                },
                returnProperty: 'bonusHealth'
            }
        ],
        'crystal_maiden_frostbite': [
            {
                label: 'Duration',
                controlType: 'input'
            },
            {
                label: 'DAMAGE:',
                controlType: 'text',
                fn: function(v,a,parent,index) {
                    return parent.ability().getAbilityPropertyValue(parent.ability().abilities()[index], 'damage')*v;
                }
            }
        ],
        'dark_seer_ion_shell': [
            {
                label: 'Duration',
                controlType: 'input'
            },
            {
                attributeName: 'damage_per_second',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                }
            }
        ],
        'dazzle_shadow_wave': [
            {
                label: 'Targets',
                controlType: 'input'
            },
            {
                label: 'DAMAGE:',
                controlType: 'text',
                fn: function(v,a,parent,index) {
                    return parent.ability().getAbilityPropertyValue(parent.ability().abilities()[index], 'damage')*v;
                }
            }
        ],
        'dazzle_weave': [
            {
                label: 'Duration',
                controlType: 'input'
            },
            {
                attributeName: 'armor_per_second',
                label: 'ARMOR',
                ignoreTooltip: true,
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                },
                returnProperty: 'armor'
            },
            {
                attributeName: 'armor_per_second',
                label: 'ARMOR REDUCTION:',
                ignoreTooltip: true,
                controlType: 'text',
                fn: function(v,a) {
                    return -v*a;
                },
                returnProperty: 'armorReduction'
            }
        ],
        'death_prophet_exorcism': [
            {
                label: 'Damage Dealt',
                controlType: 'input'
            },
            {
                attributeName: 'heal_percent',
                label: 'Total Armor',
                controlType: 'text',
                fn: function(v,a) {
                    return v*a/100;
                }
            }
        ],
        'disruptor_static_storm': [
            {
                label: 'Duration',
                controlType: 'input'
            },
            {
                label: 'DAMAGE:',
                controlType: 'text',
                fn: function(v,a,parent,index) {
                    var damagevalue = 0.25 * (130 + 40 * parent.ability().abilities()[index].level()) * (1/20),
                    mult = (v*4)*((v*4)+1)/2;
                    return damagevalue * mult;
                }
            }
        ],
        'doom_bringer_scorched_earth': [
            {
                label: 'Duration',
                controlType: 'input'
            },
            {
                attributeName: 'damage_per_second',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                }
            },
            {
                attributeName: 'bonus_movement_speed_pct',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return a;
                },
                returnProperty: 'movementSpeedPct'
            },
            {
                attributeName: 'damage_per_second',
                label: 'HP REGEN:',
                ignoreTooltip: true,
                controlType: 'text',
                fn: function(v,a) {
                    return a;
                },
                returnProperty: 'healthregen'
            }
        ],
        'doom_bringer_doom': [
            {
                label: 'Duration',
                controlType: 'input'
            },
            {
                attributeName: 'damage',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a,parent,index) {
                    if (parent.inventory.hasScepter()) {
                        return v*parent.ability().getAbilityAttributeValue(parent.ability().abilities()[index].attributes(), 'damage_scepter',parent.ability().abilities()[index].level());
                    }
                    else {
                        return v*a;
                    }
                }
            }
        ],
        'dragon_knight_elder_dragon_form': [
            {
                label: 'Duration',
                controlType: 'input'
            },
            {
                attributeName: 'bonus_attack_range',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return a;
                },
                returnProperty: 'attackrange'
            },
            {
                attributeName: 'bonus_movement_speed',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return a;
                },
                returnProperty: 'movementSpeedFlat'
            }
        ],
        'drow_ranger_trueshot': [
            {
                label: 'Drow\'s Agility',
                controlType: 'input',
                display: 'buff'
            },
            {
                attributeName: 'trueshot_ranged_damage',
                label: 'DAMAGE BONUS:',
                ignoreTooltip: true,
                controlType: 'text',
                display: 'buff',
                fn: function(v,a) {
                    return v*a/100;
                },
                returnProperty: 'bonusDamagePrecisionAura'
            }
        ],
        'earth_spirit_rolling_boulder': [
            {
                label: 'Using Stone',
                controlType: 'checkbox'
            },
            {
                attributeName: 'move_slow',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a,parent,index,abilityList) {
                    if (v) {
                        return -a;
                    }
                    else {
                        return 0;
                    }
                },
                returnProperty: 'movementSpeedPctReduction'
            },
            {
                attributeName: 'attack_slow',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a,parent,index,abilityList) {
                    if (v) {
                        return -a;
                    }
                    else {
                        return 0;
                    }
                },
                returnProperty: 'attackspeedreduction'
            }
        ],
        'earthshaker_enchant_totem': [
            {
                label: 'Activated',
                controlType: 'checkbox'
            },
            {
                attributeName: 'totem_damage_percentage',
                label: 'DAMAGE',
                controlType: 'text',
                fn: function(v,a) {
                    if (v) {
                        return a;
                    }
                    else {
                        return 0;
                    }
                },
                returnProperty: 'baseDamageMultiplier'
            }
        ],
        'earthshaker_echo_slam': [
            {
                label: 'Enemies in Range',
                controlType: 'input'
            },
            {
                attributeName: 'echo_slam_echo_damage',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                }
            }
        ],
        'elder_titan_ancestral_spirit': [
            {
                label: 'HEROES PASSED THROUGH',
                controlType: 'input'
            },
            {
                label: 'CREEPS PASSED THROUGH',
                controlType: 'input'
            },
            {
                attributeName: 'damage_creeps',
                label: 'DAMAGE:',
                ignoreTooltip: true,
                controlType: 'text',
                controls: [0,1],
                fn: function(v,a,parent,index) {
                    return v[0]*parent.ability().getAbilityAttributeValue(parent.ability().abilities()[index].attributes(), 'damage_heroes',parent.ability().abilities()[index].level()) + v[1]*a;
                },
                returnProperty: 'bonusDamage'
            },
            {
                attributeName: 'move_pct_creeps',
                label: '%BONUS SPEED:',
                ignoreTooltip: true,
                controlType: 'text',
                controls: [0,1],
                fn: function(v,a,parent,index) {
                    return v[0]*parent.ability().getAbilityAttributeValue(parent.ability().abilities()[index].attributes(), 'move_pct_heroes',parent.ability().abilities()[index].level()) + v[1]*a;
                },
                returnProperty: 'movementSpeedPct'
            }
        ],
        'elder_titan_earth_splitter': [
            {
                label: 'Enemy Max Health',
                controlType: 'input'
            },
            {
                attributeName: 'damage_pct',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return v*a/100;
                }
            },
            {
                attributeName: 'slow_pct',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return -a;
                },
                returnProperty: 'movementSpeedPctReduction'
            }
        ],
        'enchantress_natures_attendants': [
            {
                label: 'Duration',
                controlType: 'input'
            },
            {
                attributeName: 'heal',
                label: 'HEAL:',
                ignoreTooltip: true,
                controlType: 'text',
                fn: function(v,a,parent,index) {
                    return parent.ability().getAbilityAttributeValue(parent.ability().abilities()[index].attributes(), 'wisp_count',parent.ability().abilities()[index].level())*v*a;
                }
            }
        ],
        'enigma_malefice': [
            {
                label: 'Hits',
                controlType: 'input'
            },
            {
                attributeName: 'damage',
                label: 'DAMAGE:',
                ignoreTooltip: true,
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                }
            },
            {
                attributeName: 'stun_duration',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                }
            }
        ],
        'enigma_midnight_pulse': [
            {
                label: 'Duration',
                controlType: 'input'
            },
            {
                label: 'Enemy Max Health',
                controlType: 'input'
            },
            {
                attributeName: 'damage_percent',
                label: 'DAMAGE:',
                ignoreTooltip: true,
                controlType: 'text',
                controls: [0,1],
                fn: function(v,a,parent,index) {
                    return v[0]*v[1]*a/100;
                }
            }
        ],
        'enigma_black_hole': [
            {
                label: 'Duration',
                controlType: 'input'
            },
            {
                attributeName: 'far_damage',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                }
            },
            {
                attributeName: 'near_damage',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                }
            }
        ],
        'faceless_void_time_lock': [
            {
                label: 'In Chronosphere',
                controlType: 'checkbox'
            },
            {
                attributeName: 'bonus_damage',
                label: '%MOVESPEED AS DAMAGE',
                controlType: 'text',
                fn: function(v,a) {
                    if (v) {
                        return a*2;
                    }
                    else {
                        return a;
                    }
                },
                returnProperty: 'bashBonusDamage'
            },
            {
                attributeName: 'duration',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return a;
                }
            },
            {
                attributeName: 'chance_pct',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return a;
                },
                returnProperty: 'bash'
            }
        ],
        'gyrocopter_rocket_barrage': [
            {
                label: 'Rockets',
                controlType: 'input'
            },
            {
                attributeName: 'rockets_per_second',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return a;
                }
            },
            {
                label: 'DAMAGE:',
                controlType: 'text',
                fn: function(v,a,parent,index) {
                    return parent.ability().getAbilityPropertyValue(parent.ability().abilities()[index], 'damage')*v;
                }
            }
        ],
/*        'gyrocopter_homing_missile': [
            {
                label: 'Distance Traveled',
                controlType: 'input'
            },
            {
                attributeName: 'damage',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                }
            }
        ],
        'gyrocopter_flak_cannon': [
            {
                label: 'Attacks',
                controlType: 'input'
            },
            {
                attributeName: 'damage',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                }
            }
        ],*/
        'huskar_burning_spear': [
            {
                label: 'Stacks',
                controlType: 'input'
            },
            {
                attributeName: 'health_cost',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                }
            },
            {
                label: 'DAMAGE:',
                controlType: 'text',
                fn: function(v,a,parent,index) {
                    return parent.ability().getAbilityPropertyValue(parent.ability().abilities()[index], 'damage')*v;
                }
            }
        ],
        'huskar_berserkers_blood': [
            {
                label: 'Stacks',
                controlType: 'input'
            },
            {
                attributeName: 'resistance_per_stack',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                },
                returnProperty: 'magicResist'
            },
            {
                attributeName: 'attack_speed_bonus_per_stack',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                },
                returnProperty: 'attackspeed'
            }
        ],
        'huskar_life_break': [
            {
                label: 'Enemy Current HP',
                controlType: 'input'
            },
            {
                attributeName: 'health_damage',
                label: 'DAMAGE:',
                ignoreTooltip: true,
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                }
            },
            {
                label: 'Huskar Current HP',
                controlType: 'input'
            },
            {
                attributeName: 'health_cost_percent',
                label: 'DAMAGE TAKEN:',
                ignoreTooltip: true,
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                }
            },
            {
                attributeName: 'movespeed',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return a;
                },
                returnProperty: 'movementSpeedPctReduction'
            }
        ],
        'invoker_quas': [
            {
                label: 'Instances',
                controlType: 'input'
            },
            {
                attributeName: 'bonus_strength',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return a;
                },
                returnProperty: 'bonusStrength'
            },
            {
                attributeName: 'health_regen_per_instance',
                label: 'HP REGEN:',
                ignoreTooltip: true,
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                },
                returnProperty: 'healthregen'
            }
        ],
        'invoker_wex': [
            {
                label: 'Instances',
                controlType: 'input'
            },
            {
                attributeName: 'bonus_agility',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return a;
                },
                returnProperty: 'bonusAgility'
            },
            {
                attributeName: 'move_speed_per_instance',
                label: '%MOVE SPEED:',
                ignoreTooltip: true,
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                },
                returnProperty: 'movementSpeedPct'
            },
            {
                attributeName: 'attack_speed_per_instance',
                label: '%ATTACK SPEED:',
                ignoreTooltip: true,
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                },
                returnProperty: 'attackspeed'
            }
        ],
        'invoker_exort': [
            {
                label: 'Instances',
                controlType: 'input'
            },
            {
                attributeName: 'bonus_intelligence',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return a;
                },
                returnProperty: 'bonusInt'
            },
            {
                attributeName: 'bonus_damage_per_instance',
                label: 'DAMAGE:',
                ignoreTooltip: true,
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                },
                returnProperty: 'bonusDamage'
            }
        ],
        'invoker_ghost_walk': [
            {
                label: 'Quas Level',
                controlType: 'input'
            },
            {
                attributeName: 'enemy_slow',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a,parent,index,abilityList) {
                    if (v == 0) {
                        return 0;
                    }
                    return abilityList.getAbilityAttributeValue(abilityList.abilities()[index].attributes(), 'enemy_slow',v);
                },
                returnProperty: 'movementSpeedPctReduction'
            },
            {
                label: 'Wex Level',
                controlType: 'input',
                display: 'ability'
            },
            {
                attributeName: 'self_slow',
                label: 'Total Damage',
                controlType: 'text',
                display: 'ability',
                fn: function(v,a,parent,index,abilityList) {
                    if (v == 0) {
                        return 0;
                    }
                    return abilityList.getAbilityAttributeValue(abilityList.abilities()[index].attributes(), 'self_slow',v);
                },
                returnProperty: 'movementSpeedPct'
            }
        ],
        'invoker_alacrity': [
            {
                label: 'Wex Level',
                controlType: 'input'
            },
            {
                attributeName: 'bonus_attack_speed',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a,parent,index,abilityList) {
                    if (v == 0) {
                        return 0;
                    }
                    return abilityList.getAbilityAttributeValue(abilityList.abilities()[index].attributes(), 'bonus_attack_speed',v);
                },
                returnProperty: 'attackspeed'
            },
            {
                label: 'Exort Level',
                controlType: 'input',
            },
            {
                attributeName: 'bonus_damage',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a,parent,index,abilityList) {
                    if (v == 0) {
                        return 0;
                    }
                    return abilityList.getAbilityAttributeValue(abilityList.abilities()[index].attributes(), 'bonus_damage',v);
                },
                returnProperty: 'bonusDamage'
            }
        ],
        'invoker_ice_wall': [
            {
                label: 'Quas Level',
                controlType: 'input'
            },
            {
                attributeName: 'slow',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a,parent,index,abilityList) {
                    if (v == 0) {
                        return 0;
                    }
                    return abilityList.getAbilityAttributeValue(abilityList.abilities()[index].attributes(), 'slow',v);
                },
                returnProperty: 'movementSpeedPctReduction'
            },
            {
                label: 'Exort Level',
                controlType: 'input',
                display: 'ability'
            },
            {
                label: 'Duration',
                controlType: 'input',
                display: 'ability'
            },
            {
                attributeName: 'damage_per_second',
                label: 'DAMAGE:',
                ignoreTooltip: true,
                controlType: 'text',
                display: 'ability',
                controls: [1,2],
                fn: function(v,a,parent,index,abilityList) {
                    if (v[0] == 0) {
                        return 0;
                    }
                    return abilityList.getAbilityAttributeValue(abilityList.abilities()[index].attributes(), 'damage_per_second',v[0])*v[1];
                }
            }
        ],
        'jakiro_dual_breath': [
            {
                label: 'Duration',
                controlType: 'input'
            },
            {
                label: 'DAMAGE:',
                controlType: 'text',
                fn: function(v,a,parent,index) {
                    return parent.ability().getAbilityPropertyValue(parent.ability().abilities()[index], 'damage')*2 + 
                    parent.ability().getAbilityAttributeValue(parent.ability().abilities()[index].attributes(), 'burn_damage',parent.ability().abilities()[index].level())*v;
                }
            },
            {
                attributeName: 'slow_movement_speed_pct',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return a;
                },
                returnProperty: 'movementSpeedPctReduction'
            },
            {
                attributeName: 'slow_attack_speed_pct',
                label: '%ATTACK SLOW:',
                ignoreTooltip: true,
                controlType: 'text',
                fn: function(v,a) {
                    return a;
                },
                returnProperty: 'attackspeedreduction'
            }
        ],
        'jakiro_liquid_fire': [
            {
                label: 'Duration',
                controlType: 'input'
            },
            {
                attributeName: 'damage',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                }
            },
            {
                attributeName: 'slow_attack_speed_pct',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return a;
                },
                returnProperty: 'attackspeedreduction'
            }
        ],
        'jakiro_macropyre': [
            {
                label: 'Duration',
                controlType: 'input'
            },
            {
                attributeName: 'damage',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                }
            }
        ],
        'juggernaut_blade_fury': [
            {
                label: 'Duration',
                controlType: 'input'
            },
            {
                label: 'DAMAGE:',
                controlType: 'text',
                fn: function(v,a,parent,index) {
                    return parent.ability().getAbilityPropertyValue(parent.ability().abilities()[index], 'damage')*v;
                }
            }
        ],
        'juggernaut_healing_ward': [
            {
                label: 'Duration',
                controlType: 'input'
            },
            {
                label: 'Max Health',
                controlType: 'input'
            },
            {
                attributeName: 'healing_ward_heal_amount',
                label: 'HEAL OVER TIME:',
                ignoreTooltip: true,
                controlType: 'text',
                controls: [0,1],
                fn: function(v,a,parent,index) {
                    return v[0]*v[1]*a/100;
                }
            }
        ],
        'juggernaut_omni_slash': [
            {
                label: 'Jumps',
                controlType: 'input'
            },
            {
                label: 'MIN DAMAGE:',
                ignoreTooltip: true,
                controlType: 'text',
                fn: function(v,a,parent,index) {
                    return parent.ability().getAbilityAttributeValue(parent.ability().abilities()[index].attributes(), 'omni_slash_damage',1)*v;
                }
            },
            {
                label: 'MAX DAMAGE:',
                ignoreTooltip: true,
                controlType: 'text',
                fn: function(v,a,parent,index) {
                    return parent.ability().getAbilityAttributeValue(parent.ability().abilities()[index].attributes(), 'omni_slash_damage',2)*v;
                }
            }
        ],
        'keeper_of_the_light_illuminate': [
            {
                label: 'Duration',
                controlType: 'input'
            },
            {
                attributeName: 'damage_per_second',
                label: 'DAMAGE:',
                ignoreTooltip: true,
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                }
            }
        ],
        'keeper_of_the_light_mana_leak': [
            {
                label: 'Distance Moved',
                controlType: 'input'
            },
            {
                label: 'Enemy Max Mana',
                controlType: 'input'
            },
            {
                attributeName: 'mana_leak_pct',
                label: 'MANA LEAKED:',
                ignoreTooltip: true,
                controlType: 'text',
                controls: [0,1],
                fn: function(v,a,parent,index) {
                    return v[0]/100*v[1]*a/100;
                }
            }
        ],
        'legion_commander_duel': [
            {
                label: 'Duel Wins',
                controlType: 'input'
            },
            {
                attributeName: 'reward_damage',
                label: 'Total Damage:',
                ignoreTooltip: true,
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                },
                returnProperty: 'bonusDamage'
            }
        ],
        'leshrac_pulse_nova': [
            {
                label: 'Duration',
                controlType: 'input'
            },
            {
                attributeName: 'damage',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                }
            },
            {
                attributeName: 'mana_cost_per_second',
                label: 'MANA COST:',
                ignoreTooltip: true,
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                }
            }
        ],
        'lich_chain_frost': [
            {
                label: 'Bounce Hits',
                controlType: 'input'
            },
            {
                attributeName: 'damage',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                }
            },
            {
                attributeName: 'slow_movement_speed',
                label: 'Enemy Movement Speed Slow',
                controlType: 'text',
                fn: function(v,a) {
                    return a;
                },
                returnProperty: 'movementSpeedPctReduction'
            },
            {
                attributeName: 'slow_attack_speed',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return a;
                },
                returnProperty: 'attackspeedreduction'
            }
        ],
        'life_stealer_feast': [
            {
                label: 'Enemy Current HP',
                controlType: 'input'
            },
            {
                attributeName: 'hp_leech_percent',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return v*a/100;
                },
                returnProperty: 'bonusDamage'
            }
        ],
        'life_stealer_open_wounds': [
            {
                label: 'Duration',
                controlType: 'input'
            },
            {
                attributeName: 'heal_percent',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return a;
                },
                returnProperty: 'lifesteal'
            },
            {
                attributeName: 'slow_steps',
                label: '%SLOW:',
                ignoreTooltip: true,
                controlType: 'text',
                noLevel: true,
                fn: function(v,a,parent,index,abilityList) {
                    return abilityList.getAbilityAttributeValue(abilityList.abilities()[index].attributes(), 'slow_steps',v+1);
                },
                returnProperty: 'movementSpeedPctReduction'
            }
        ],
        'lina_fiery_soul': [
            {
                label: 'Duration',
                controlType: 'input'
            },
            {
                attributeName: 'fiery_soul_move_speed_bonus',
                label: 'Enemy Movement Speed Slow',
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                },
                returnProperty: 'movementSpeedPct'
            },
            {
                attributeName: 'fiery_soul_attack_speed_bonus',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                },
                returnProperty: 'attackspeed'
            }
        ],
        'lion_mana_drain': [
            {
                label: 'Duration',
                controlType: 'input'
            },
            {
                attributeName: 'mana_per_second',
                label: 'MANA DRAINED:',
                ignoreTooltip: true,
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                }
            }
        ],
        'luna_moon_glaive': [
            {
                label: 'Damage',
                controlType: 'input'
            },
            {
                attributeName: 'damage_reduction_percent',
                label: 'BOUNCE DAMAGE:',
                ignoreTooltip: true,
                controlType: 'text',
                fn: function(v,a,parent,index) {
                    var result = [];
                    for (var i = 1; i < 6; i++) {
                        result.push((v*Math.pow(a/100,i)).toFixed(2))
                    }
                    return result.join('<br>');
                }
            }
        ],
        'luna_eclipse': [
            {
                label: 'Duration',
                controlType: 'input'
            },
            {
                attributeName: 'damage',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                }
            }
        ],
        'medusa_mystic_snake': [
            {
                label: 'Duration',
                controlType: 'input'
            },
            {
                attributeName: 'damage',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                }
            }
        ],
        'medusa_mana_shield': [
            {
                label: 'Damage',
                controlType: 'input'
            },
            {
                attributeName: 'damage_per_mana',
                label: 'MANA USED:',
                ignoreTooltip: true,
                controlType: 'text',
                fn: function(v,a) {
                    return (v/a).toFixed(2);
                }
            },
            {
                attributeName: 'absorption_tooltip',
                label: '%DAMAGE REDUCTION:',
                ignoreTooltip: true,
                controlType: 'text',
                fn: function(v,a) {
                    return -a;
                },
                returnProperty: 'damageReduction'
            }
        ],
        'meepo_poof': [
            {
                label: 'Meepo Count',
                controlType: 'input'
            },
            {
                label: 'DAMAGE:',
                controlType: 'text',
                fn: function(v,a,parent,index) {
                    return parent.ability().getAbilityPropertyValue(parent.ability().abilities()[index], 'damage')*v;
                }
            }
        ],
        'meepo_geostrike': [
            {
                label: 'Stacks',
                controlType: 'input'
            },
            {
                label: 'DAMAGE:',
                ignoreTooltip: true,
                controlType: 'text',
                fn: function(v,a,parent,index,abilityList) {
                    return abilityList.getAbilityPropertyValue(abilityList.abilities()[index], 'damage')*v;
                }
            },
            {
                attributeName: 'slow',
                label: '%SLOW:',
                ignoreTooltip: true,
                controlType: 'text',
                noLevel: true,
                fn: function(v,a,parent,index,abilityList) {
                    return abilityList.getAbilityAttributeValue(abilityList.abilities()[index].attributes(), 'slow',abilityList.abilities()[index].level())*v;
                },
                returnProperty: 'movementSpeedPctReduction'
            }
        ],
        'mirana_arrow': [
            {
                label: 'Duration',
                controlType: 'input'
            },
            {
                attributeName: 'damage',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                }
            }
        ],
        'morphling_morph_agi': [
            {
                label: 'Shifts',
                controlType: 'input'
            },
            {
                attributeName: 'points_per_tick',
                label: 'AGI SHIFT GAIN:',
                ignoreTooltip: true,
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                },
                returnProperty: 'bonusAgility'
            },
            {
                attributeName: 'points_per_tick',
                label: 'STR SHIFT LOSS:',
                ignoreTooltip: true,
                controlType: 'text',
                fn: function(v,a) {
                    return -v*a;
                },
                returnProperty: 'bonusStrength'
            },
            {
                attributeName: 'bonus_attributes',
                label: 'SHIFT TIME:',
                controlType: 'text',
                fn: function(v,a) {
                    return a;
                },
                returnProperty: 'bonusAgility2'
            },
            {
                attributeName: 'morph_cooldown',
                label: 'SHIFT TIME:',
                ignoreTooltip: true,
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                }
            },
            {
                attributeName: 'mana_cost',
                label: 'SHIFT MANA COST:',
                ignoreTooltip: true,
                controlType: 'text',
                fn: function(v,a,parent,index) {
                    return v*a*parent.ability().getAbilityAttributeValue(parent.ability().abilities()[index].attributes(), 'morph_cooldown',parent.ability().abilities()[index].level());
                }
            }
        ],
        'morphling_morph_str': [
            {
                label: 'Shifts',
                controlType: 'input'
            },
            {
                attributeName: 'points_per_tick',
                label: 'STR SHIFT GAIN:',
                ignoreTooltip: true,
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                },
                returnProperty: 'bonusStrength'
            },
            {
                attributeName: 'points_per_tick',
                label: 'AGI SHIFT LOSS:',
                ignoreTooltip: true,
                controlType: 'text',
                fn: function(v,a) {
                    return -v*a;
                },
                returnProperty: 'bonusAgility'
            },
            {
                attributeName: 'bonus_attributes',
                label: 'SHIFT TIME:',
                controlType: 'text',
                fn: function(v,a) {
                    return a;
                },
                returnProperty: 'bonusStrength2'
            },
            {
                attributeName: 'morph_cooldown',
                label: 'SHIFT TIME:',
                ignoreTooltip: true,
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                }
            },
            {
                attributeName: 'mana_cost',
                label: 'SHIFT MANA COST:',
                ignoreTooltip: true,
                controlType: 'text',
                fn: function(v,a,parent,index) {
                    return v*a*parent.ability().getAbilityAttributeValue(parent.ability().abilities()[index].attributes(), 'morph_cooldown',parent.ability().abilities()[index].level());
                }
            }
        ],
        'furion_force_of_nature': [
            {
                label: 'Duration',
                controlType: 'input'
            },
            {
                attributeName: 'damage',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                }
            }
        ],
        'furion_wrath_of_nature': [
            {
                label: 'Duration',
                controlType: 'input'
            },
            {
                attributeName: 'damage',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                }
            }
        ],
        'necrolyte_heartstopper_aura': [
            {
                label: 'Duration',
                controlType: 'input'
            },
            {
                attributeName: 'damage',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                }
            }
        ],
        'necrolyte_sadist': [
            {
                label: 'Duration',
                controlType: 'input'
            },
            {
                attributeName: 'damage',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                }
            }
        ],
        'night_stalker_crippling_fear': [
            {
                label: 'Is Night',
                controlType: 'checkbox'
            },
            {
                attributeName: 'bonus_attack_speed_night',
                label: '%CHANCE TO MISS:',
                ignoreTooltip: true,
                controlType: 'text',
                fn: function(v,a,parent,index,abilityList) {
                    if (v) {
                        return abilityList.getAbilityAttributeValue(abilityList.abilities()[index].attributes(), 'miss_rate_night',abilityList.abilities()[index].level());
                    }
                    else {
                        return abilityList.getAbilityAttributeValue(abilityList.abilities()[index].attributes(), 'miss_rate_day',abilityList.abilities()[index].level());
                    }
                },
                returnProperty: 'missChance'
            }
        ],    
        'night_stalker_hunter_in_the_night': [
            {
                label: 'Is Night',
                controlType: 'checkbox'
            },
            {
                attributeName: 'bonus_attack_speed_night',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    if (v) {
                        return a;
                    }
                    else {
                        return 0;
                    }
                },
                returnProperty: 'attackspeed'
            },
            {
                attributeName: 'bonus_movement_speed_pct_night',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    if (v) {
                        return a;
                    }
                    else {
                        return 0;
                    }
                },
                returnProperty: 'movementSpeedPct'
            }
        ],    
        'obsidian_destroyer_arcane_orb': [
            {
                label: 'Current Mana',
                controlType: 'input'
            },
            {
                attributeName: 'mana_pool_damage_pct',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return v*a/100;
                },
                returnProperty: 'bonusDamageOrb'
            }
        ],
        'ogre_magi_ignite': [
            {
                label: 'Duration',
                controlType: 'input'
            },
            {
                attributeName: 'burn_damage',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                }
            },
            {
                attributeName: 'slow_movement_speed_pct',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return a;
                },
                returnProperty: 'movementSpeedPctReduction'
            }
        ],
        'pudge_rot': [
            {
                label: 'Duration',
                controlType: 'input'
            },
            {
                label: 'DAMAGE:',
                controlType: 'text',
                fn: function(v,a,parent,index,abilityList) {
                    return abilityList.getAbilityPropertyValue(abilityList.abilities()[index], 'damage')*v;
                }
            },
            {
                attributeName: 'rot_slow',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return a;
                },
                returnProperty: 'movementSpeedPctReduction'
            }
        ],
        'pudge_flesh_heap': [
            {
                label: 'Stacks',
                controlType: 'input'
            },
            {
                attributeName: 'flesh_heap_strength_buff_amount',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                },
                returnProperty: 'bonusStrength'
            },
            {
                attributeName: 'flesh_heap_magic_resist',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return a;
                },
                returnProperty: 'magicResist'
            }
        ],
        'pudge_dismember': [
            {
                label: 'Duration',
                controlType: 'input'
            },
            {
                attributeName: 'dismember_damage',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                }
            }
        ],
        'pugna_nether_ward': [
            {
                label: 'Enemy Mana Spent',
                controlType: 'input'
            },
            {
                attributeName: 'mana_multiplier',
                label: 'DAMAGE:',
                ignoreTooltip: true,
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                }
            },
            {
                attributeName: 'mana_regen',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return a;
                },
                returnProperty: 'manaregenreduction'
            }
        ],
        'pugna_life_drain': [
            {
                label: 'Duration',
                controlType: 'input'
            },
            {
                attributeName: 'health_drain',
                label: 'HEALTH DRAINED:',
                ignoreTooltip: true,
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                }
            }
        ],
        'queenofpain_shadow_strike': [
            {
                label: 'Duration',
                controlType: 'input'
            },
            {
                attributeName: 'damage',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                }
            }
        ],
        'razor_plasma_field': [
            {
                label: 'Duration',
                controlType: 'input'
            },
            {
                attributeName: 'damage',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                }
            }
        ],
        'razor_static_link': [
            {
                label: 'Duration',
                controlType: 'input'
            },
            {
                attributeName: 'damage',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                }
            }
        ],
        'razor_eye_of_the_storm': [
            {
                label: 'Duration',
                controlType: 'input'
            },
            {
                attributeName: 'damage',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                }
            }
        ],
        'rubick_fade_bolt': [
            {
                label: 'Jumps',
                controlType: 'input'
            },
            {
                attributeName: 'damage',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a,parent,index,abilityList) {
                    return a * (1 - v*abilityList.getAbilityAttributeValue(abilityList.abilities()[index].attributes(), 'jump_damage_reduction_pct',abilityList.abilities()[index].level())/100);
                }
            },
            {
                attributeName: 'hero_attack_damage_reduction',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return a;
                },
                returnProperty: 'bonusDamageReduction'
            }
        ],
        'sandking_sand_storm': [
            {
                label: 'Duration',
                controlType: 'input'
            },
            {
                label: 'DAMAGE:',
                controlType: 'text',
                fn: function(v,a,parent,index) {
                    return parent.ability().getAbilityPropertyValue(parent.ability().abilities()[index], 'damage')*v;
                }
            }
        ],
        'sandking_epicenter': [
            {
                label: 'Pulses',
                controlType: 'input'
            },
            {
                attributeName: 'epicenter_damage',
                label: 'DAMAGE:',
                ignoreTooltip: true,
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                }
            },
            {
                attributeName: 'epicenter_slow',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return a;
                },
                returnProperty: 'movementSpeedPctReduction'
            },
            {
                attributeName: 'epicenter_slow_as',
                label: '%ATTACK SLOW:',
                ignoreTooltip: true,
                controlType: 'text',
                fn: function(v,a) {
                    return a;
                },
                returnProperty: 'attackspeedreduction'
            }
        ],
        'shadow_demon_shadow_poison': [
            {
                label: 'Duration',
                controlType: 'input'
            },
            {
                attributeName: 'stack_damage',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    var stackmult = [1,2,4,8];
                    if (v > 4) {
                        return a * stackmult[3] + 50 * (v - 4);
                    }
                    else if (v <= 0) {
                        return 0
                    }
                    else {
                        return a * stackmult[v-1]
                    }
                }
            }
        ],
        'nevermore_necromastery': [
            {
                label: 'Souls',
                controlType: 'input'
            },
            {
                attributeName: 'necromastery_damage_per_soul',
                label: 'DAMAGE:',
                ignoreTooltip: true,
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                },
                returnProperty: 'bonusDamage'
            }
        ],
        'nevermore_requiem': [
            {
                label: 'Duration',
                controlType: 'input'
            },
            {
                attributeName: 'damage',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                }
            }
        ],
        'shadow_shaman_shackles': [
            {
                label: 'Duration',
                controlType: 'input'
            },
            {
                label: 'DAMAGE:',
                controlType: 'text',
                fn: function(v,a,parent,index) {
                    return parent.ability().getAbilityPropertyValue(parent.ability().abilities()[index], 'damage')*v;
                }
            }
        ],
        'silencer_curse_of_the_silent': [
            {
                label: 'Duration',
                controlType: 'input'
            },
            {
                attributeName: 'health_damage',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                }
            },
            {
                attributeName: 'mana_damage',
                label: 'Mana Loss',
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                }
            }
        ],
/*        'silencer_glaives_of_wisdom': [
            {
                label: 'Duration',
                controlType: 'input'
            },
            {
                attributeName: 'damage',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                }
            }
        ],*/
        'skywrath_mage_mystic_flare': [
            {
                label: 'Duration',
                controlType: 'input'
            },
            {
                attributeName: 'damage',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                }
            }
        ],
        'slark_essence_shift': [
            {
                label: 'Attacks',
                controlType: 'input'
            },
            {
                attributeName: 'agi_gain',
                label: 'Total Damage',
                controlType: 'text',
                display: 'ability',
                fn: function(v,a) {
                    return v*a;
                },
                returnProperty: 'bonusAgility'
            },
            {
                attributeName: 'stat_loss',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return -v*a;
                },
                returnProperty: 'bonusAllStatsReduction'
            }
        ],
        'slark_shadow_dance': [
            {
                label: 'Duration',
                controlType: 'input'
            },
            {
                attributeName: 'bonus_regen_pct',
                label: 'TOTAL HEALTH REGENERATED:',
                ignoreTooltip: true,
                controlType: 'text',
                fn: function(v,a,parent) {
                    return v*parent.health()*a/100;
                }
            },
            {
                attributeName: 'bonus_regen_pct',
                label: 'HEALTH GAINED PER SECOND:',
                ignoreTooltip: true,
                controlType: 'text',
                fn: function(v,a,parent) {
                    return parent.health()*a/100;
                },
                returnProperty: 'healthregen'
            },
            {
                attributeName: 'bonus_movement_speed',
                label: '%MOVE SPEED:',
                ignoreTooltip: true,
                controlType: 'text',
                fn: function(v,a) {
                    return a;
                },
                returnProperty: 'movementSpeedPct'
            }
        ],
        'sniper_shrapnel': [
            {
                label: 'Duration',
                controlType: 'input'
            },
            {
                label: 'DAMAGE:',
                ignoreTooltip: true,
                controlType: 'text',
                fn: function(v,a,parent,index) {
                    return parent.ability().getAbilityPropertyValue(parent.ability().abilities()[index], 'damage')*v;
                }
            },
            {
                attributeName: 'building_damage',
                label: 'BUILDING DAMAGE:',
                ignoreTooltip: true,
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                }
            },
            {
                attributeName: 'slow_movement_speed',
                label: 'Enemy Movement Speed Slow',
                controlType: 'text',
                fn: function(v,a) {
                    return a;
                },
                returnProperty: 'movementSpeedPctReduction'
            }
        ],
        'spectre_desolate': [
            {
                label: 'Enemy Alone',
                controlType: 'checkbox'
            },
            {
                attributeName: 'bonus_damage',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a,parent,index,abilityList) {
                    if (v) {
                        return a;
                    }
                    else {
                        return 0;
                    }
                },
                returnProperty: 'bonusDamage'
            }
        ],
        'spectre_dispersion': [
            {
                label: 'Damage Taken',
                controlType: 'input'
            },
            {
                attributeName: 'damage_reflection_pct',
                label: 'DAMAGE REFLECTED:',
                controlType: 'text',
                fn: function(v,a) {
                    return -a;
                },
                returnProperty: 'damageReduction'
            },
            {
                attributeName: 'damage_reflection_pct',
                label: 'DAMAGE REFLECTED:',
                ignoreTooltip: true,
                controlType: 'text',
                fn: function(v,a) {
                    return v*a/100;
                }
            }
        ],
        'storm_spirit_ball_lightning': [
            {
                label: 'Duration',
                controlType: 'input'
            },
            {
                attributeName: 'damage',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                }
            }
        ],
        'templar_assassin_trap': [
            {
                label: 'Duration',
                controlType: 'input'
            },
            {
                attributeName: 'damage',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                }
            }
        ],
        'shredder_reactive_armor': [
            {
                label: 'Stacks',
                controlType: 'input'
            },
            {
                attributeName: 'bonus_armor',
                label: 'Total Armor Bonus',
                controlType: 'text',
                noLevel: true,
                fn: function(v,a) {
                    return v*a;
                },
                returnProperty: 'armor'
            },
            {
                attributeName: 'bonus_hp_regen',
                label: 'Total HP Regen Bonus',
                controlType: 'text',
                noLevel: true,
                fn: function(v,a) {
                    return v*a;
                },
                returnProperty: 'healthregen'
            }
        ],
        'shredder_chakram': [
            {
                label: 'Duration',
                controlType: 'input'
            },
            {
                attributeName: 'damage',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                }
            }
        ],
        'spirit_breaker_greater_bash': [
            {
                label: 'Bash Proc',
                controlType: 'checkbox'
            },
            {
                attributeName: 'damage',
                label: '%MOVESPEED AS DAMAGE',
                controlType: 'text',
                fn: function(v,a) {
                    if (v) {
                        return a;
                    }
                    else {
                        return 0;
                    }
                },
                returnProperty: 'bashBonusDamage'
            },
            {
                attributeName: 'bonus_movespeed_pct',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    if (v) {
                        return a;
                    }
                    else {
                        return 0;
                    }
                },
                returnProperty: 'movementSpeedPct'
            },
            {
                attributeName: 'chance_pct',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return a
                },
                returnProperty: 'bash'
            }
        ],
        'techies_land_mines': [
            {
                label: 'Number of Mines',
                controlType: 'input'
            },
            {
                attributeName: 'damage',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a,parent,index) {
                    return v*a;
                }
            },
            {
                attributeName: 'damage',
                label: 'AFTER REDUCTIONS:',
                ignoreTooltip: true,
                controlType: 'text',
                fn: function(v,a,parent,index) {
                    var phys_reduction = parent.enemy().totalArmorPhysicalReduction(),
                        magic_reduction = parent.enemy().totalMagicResistance();
                    return (v * a * (1 - phys_reduction / 100) * (1 - magic_reduction / 100)).toFixed(2);
                }
            }
        ],
        'techies_suicide': [
            {
                attributeName: 'damage',
                label: 'FULL DAMAGE AFTER REDUCTIONS:',
                ignoreTooltip: true,
                controlType: 'text',
                fn: function(v,a,parent,index) {
                    var phys_reduction = parent.enemy().totalArmorPhysicalReduction(),
                        magic_reduction = parent.enemy().totalMagicResistance();
                    return (a * (1 - phys_reduction / 100) * (1 - magic_reduction / 100)).toFixed(2);
                }
            },
            {
                attributeName: 'partial_damage',
                label: 'PARTIAL DAMAGE AFTER REDUCTIONS:',
                ignoreTooltip: true,
                controlType: 'text',
                fn: function(v,a,parent,index) {
                    var phys_reduction = parent.enemy().totalArmorPhysicalReduction(),
                        magic_reduction = parent.enemy().totalMagicResistance();
                    return (a * (1 - phys_reduction / 100) * (1 - magic_reduction / 100)).toFixed(2);
                }
            },
            {
                attributeName: 'damage',
                label: 'RESPAWN TIME:',
                ignoreTooltip: true,
                controlType: 'text',
                fn: function(v,a,parent,index) {
                    return (parent.respawnTime() / 2).toFixed(0) + ' seconds';
                }
            }
        ],
        'techies_remote_mines': [
            {
                label: 'Number of Mines',
                controlType: 'input'
            },
            {
                attributeName: 'damage',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a,parent,index) {
                    return v*a;
                }
            },
            {
                attributeName: 'damage',
                label: 'AFTER REDUCTIONS:',
                ignoreTooltip: true,
                controlType: 'text',
                fn: function(v,a,parent,index) {
                    var magic_reduction = parent.enemy().totalMagicResistance();
                    return (v * a * (1 - magic_reduction / 100)).toFixed(2);
                }
            }
        ],
        'tinker_march_of_the_machines': [
            {
                label: 'Duration',
                controlType: 'input'
            },
            {
                attributeName: 'damage',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                }
            }
        ],
        'treant_leech_seed': [
            {
                label: 'Pulses',
                controlType: 'input'
            },
            {
                attributeName: 'leech_damage',
                label: 'DAMAGE/HEAL:',
                ignoreTooltip: true,
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                }
            },
            {
                attributeName: 'movement_slow',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return a;
                },
                returnProperty: 'movementSpeedPctReduction'
            }
        ],
        'troll_warlord_fervor': [
            {
                label: 'Stacks',
                controlType: 'input'
            },
            {
                attributeName: 'attack_speed',
                label: 'ATTACK SPEED:',
                ignoreTooltip: true,
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                },
                returnProperty: 'attackspeed'
            }
        ],
        'undying_decay': [
            {
                label: 'Stacks',
                controlType: 'input'
            },
            {
                attributeName: 'str_steal',
                label: 'STRENGTH STOLEN:',
                ignoreTooltip: true,
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                },
                returnProperty: 'bonusStrength'
            },
        ],
        'undying_soul_rip': [
            {
                label: 'Units',
                controlType: 'input'
            },
            {
                attributeName: 'damage_per_unit',
                label: 'DAMAGE/HEAL:',
                ignoreTooltip: true,
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                }
            }
        ],
        'undying_flesh_golem': [
            {
                label: 'Distance',
                controlType: 'input'
            },
            {
                attributeName: 'speed_slow',
                label: 'DAMAGE/HEAL:',
                controlType: 'text',
                fn: function(v,a) {
                    return -a;
                },
                returnProperty: 'movementSpeedPctReduction'
            },
            {
                attributeName: 'max_damage_amp',
                label: '%DAMAGE AMP:',
                ignoreTooltip: true,
                controlType: 'text',
                fn: function(v,a,parent,index) {
                    var ability = _.find(this.abilities(), function(b) {
                        return b.name() == 'undying_flesh_golem';
                    });
                    var minRadius = this.getAbilityAttributeValue(ability.attributes(), 'full_power_radius', ability.level());
                    var maxRadius = this.getAbilityAttributeValue(ability.attributes(), 'radius', ability.level());
                    var value = Math.min(Math.max(v, minRadius), maxRadius);
                    if (parent.inventory.hasScepter()) {
                        var maxAmp = this.getAbilityAttributeValue(ability.attributes(), 'max_damage_amp_scepter', ability.level());
                        var minAmp = this.getAbilityAttributeValue(ability.attributes(), 'min_damage_amp_scepter', ability.level());
                    }
                    else {
                        var maxAmp = this.getAbilityAttributeValue(ability.attributes(), 'max_damage_amp', ability.level());
                        var minAmp = this.getAbilityAttributeValue(ability.attributes(), 'min_damage_amp', ability.level());
                    }
                    var scale = 1 - ((value - minRadius) / (maxRadius - minRadius));
                    var mult = (maxAmp - minAmp) * scale + minAmp;
                    return mult.toFixed(2);
                },
                returnProperty: 'damageAmplification'
            }
        ],
        'ursa_fury_swipes': [
            {
                label: 'Stacks',
                controlType: 'input'
            },
            {
                attributeName: 'damage_per_stack',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                },
                returnProperty: 'bonusDamage'
            }
        ],
        'ursa_enrage': [
            {
                label: 'Current HP',
                controlType: 'input'
            },
            {
                attributeName: 'life_damage_bonus_percent',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return v*a/100;
                },
                returnProperty: 'bonusDamage'
            }
        ],
        'venomancer_venomous_gale': [
            {
                label: 'Duration',
                controlType: 'input'
            },
            {
                attributeName: 'tick_damage',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a,parent,index) {
                    return parent.ability().getAbilityAttributeValue(parent.ability().abilities()[index].attributes(), 'strike_damage',parent.ability().abilities()[index].level()) + Math.floor(v/3)*a;
                }
            },
            {
                attributeName: 'movement_slow',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return a;
                },
                returnProperty: 'movementSpeedPctReduction'
            }
        ],
        'venomancer_poison_sting': [
            {
                label: 'Duration',
                controlType: 'input'
            },
            {
                attributeName: 'damage',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                }
            },
            {
                attributeName: 'movement_speed',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return a;
                },
                returnProperty: 'movementSpeedPctReduction'
            }
        ],
        'venomancer_plague_ward': [
            {
                label: 'Duration',
                controlType: 'input'
            },
            {
                attributeName: 'damage',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                }
            }
        ],
        'venomancer_poison_nova': [
            {
                label: 'Duration',
                controlType: 'input'
            },
            {
                attributeName: 'damage',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                }
            }
        ],
        'viper_poison_attack': [
            {
                label: 'Duration',
                controlType: 'input'
            },
            {
                attributeName: 'damage',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                }
            },
            {
                attributeName: 'bonus_movement_speed',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return a;
                },
                returnProperty: 'movementSpeedPctReduction'
            },
            {
                attributeName: 'bonus_attack_speed',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return a;
                },
                returnProperty: 'attackspeedreduction'
            }
        ],
        'viper_corrosive_skin': [
            {
                label: 'Duration',
                controlType: 'input'
            },
            {
                attributeName: 'damage',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                }
            },
            {
                attributeName: 'bonus_movement_speed',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return a;
                },
                returnProperty: 'movementSpeedPctReduction'
            },
            {
                attributeName: 'bonus_attack_speed',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return a;
                },
                returnProperty: 'attackspeedreduction'
            },
            {
                attributeName: 'bonus_magic_resistance',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return a;
                },
                returnProperty: 'magicResist'
            }
        ],
        'viper_viper_strike': [
            {
                label: 'Duration',
                controlType: 'input'
            },
            {
                attributeName: 'damage',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                }
            },
            {
                attributeName: 'bonus_movement_speed',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return a;
                },
                returnProperty: 'movementSpeedPctReduction'
            },
            {
                attributeName: 'bonus_attack_speed',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return a;
                },
                returnProperty: 'attackspeedreduction'
            }
        ],
        'visage_soul_assumption': [
            {
                label: 'Duration',
                controlType: 'input'
            },
            {
                attributeName: 'damage',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                }
            }
        ],
        'visage_gravekeepers_cloak': [
            {
                label: 'Layers',
                controlType: 'input'
            },
            {
                attributeName: 'bonus_armor',
                label: 'ARMOR:',
                ignoreTooltip: true,
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                },
                returnProperty: 'armor'
            },
            {
                attributeName: 'bonus_resist',
                label: '%RESIST:',
                ignoreTooltip: true,
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                },
                returnProperty: 'magicResist'
            }
        ],
        'warlock_shadow_word': [
            {
                label: 'Duration',
                controlType: 'input'
            },
            {
                label: 'DAMAGE:',
                ignoreTooltip: true,
                controlType: 'text',
                fn: function(v,a,parent,index) {
                    return parent.ability().getAbilityPropertyValue(parent.ability().abilities()[index], 'damage')*v;
                }
            }
        ],
        'warlock_upheaval': [
            {
                label: 'Duration',
                controlType: 'input'
            },
            {
                attributeName: 'slow_rate',
                label: 'DAMAGE:',
                controlType: 'text',
                fn: function(v,a) {
                    return -v*a;
                },
                returnProperty: 'movementSpeedPctReduction'
            }
        ],
        'weaver_the_swarm': [
            {
                label: 'Attacks',
                controlType: 'input'
            },
            {
                attributeName: 'damage',
                label: 'DAMAGE:',
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                }
            },
            {
                attributeName: 'armor_reduction',
                label: 'DAMAGE:',
                controlType: 'text',
                fn: function(v,a) {
                    return -v*a;
                },
                returnProperty: 'armorReduction'
            }
        ],
        'windrunner_powershot': [
            {
                label: 'Duration',
                controlType: 'input'
            },
            {
                label: 'DAMAGE:',
                ignoreTooltip: true,
                controlType: 'text',
                fn: function(v,a,parent,index) {
                    return parent.ability().getAbilityPropertyValue(parent.ability().abilities()[index], 'damage')*v;
                }
            }
        ],
        'winter_wyvern_cold_embrace': [
            {
                label: 'Duration',
                controlType: 'input'
            },
            {
                label: 'Ally Max Health',
                controlType: 'input'
            },
            {
                attributeName: 'heal_percentage',
                label: 'TOTAL HEAL:',
                ignoreTooltip: true,
                controlType: 'text',
                controls: [0,1],
                fn: function(v,a,parent,index) {
                    var base_heal = parent.ability().getAbilityAttributeValue(parent.ability().abilities()[index].attributes(), 'heal_additive',parent.ability().abilities()[index].level());
                    return (base_heal + v[1] * a/100) * v[0];
                }
            }
        ],
        'wisp_spirits': [
            {
                label: 'Duration',
                controlType: 'input'
            },
            {
                attributeName: 'damage',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                }
            }
        ],
        'wisp_overcharge': [
            {
                label: 'Current HP',
                controlType: 'input'
            },
            {
                attributeName: 'drain_pct',
                label: 'HP DRAINED:',
                ignoreTooltip: true, 
                controlType: 'text',
                fn: function(v,a,parent,index) {
                    return v*a;
                }
            },
            {
                label: 'Current MP',
                controlType: 'input'
            },
            {
                attributeName: 'drain_pct',
                label: 'MP DRAINED:',
                ignoreTooltip: true, 
                controlType: 'text',
                fn: function(v,a,parent,index) {
                    return v*a;
                }
            },
            {
                attributeName: 'bonus_attack_speed',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return a;
                },
                returnProperty: 'attackspeed'
            },
            {
                attributeName: 'bonus_damage_pct',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return a;
                },
                returnProperty: 'damageReduction'
            }
        ],
        'witch_doctor_paralyzing_cask': [
            {
                label: 'Duration',
                controlType: 'input'
            },
            {
                attributeName: 'damage',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                }
            }
        ],
        'witch_doctor_voodoo_restoration': [
            {
                label: 'Duration',
                controlType: 'input'
            },
            {
                attributeName: 'damage',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                }
            }
        ],
        'witch_doctor_maledict': [
            {
                label: 'Duration',
                controlType: 'input'
            },
            {
                attributeName: 'damage',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                }
            }
        ],
        'witch_doctor_death_ward': [
            {
                label: 'Duration',
                controlType: 'input'
            },
            {
                attributeName: 'damage',
                label: 'Total Damage',
                controlType: 'text',
                fn: function(v,a) {
                    return v*a;
                }
            }
        ],
        'zuus_static_field': [
            {
                label: 'Enemy HP',
                controlType: 'input'
            },
            {
                attributeName: 'damage_health_pct',
                label: 'DAMAGE:',
                ignoreTooltip: true,
                controlType: 'text',
                fn: function(v,a) {
                    return v*a/100;
                }
            }
        ]
    }

    return my;
}(HEROCALCULATOR));
"use strict";

var HEROCALCULATOR = (function (my) {

    my.AbilityModel = function (a, h) {
        var self = this;
        self.hero = h;
        self.abilityData = my.abilityData;
        self.hasScepter = ko.observable(false);
        self.isShapeShiftActive = ko.observable(false);
        self.abilities = a;
        for (var i = 0; i < self.abilities().length; i++) {
            self.abilities()[i].isActive = ko.observable(false);
            self.abilities()[i].isDetail = ko.observable(false);
            self.abilities()[i].baseDamage = ko.observable(0);
            self.abilities()[i].baseDamageMultiplier = ko.observable(0);
            self.abilities()[i].bash = ko.observable(0);
            self.abilities()[i].bashBonusDamage = ko.observable(0);
            self.abilities()[i].bonusDamage = ko.observable(0);
            self.abilities()[i].bonusDamageOrb = ko.observable(0);
            self.abilities()[i].bonusDamagePct = ko.observable(0);
            self.abilities()[i].bonusDamagePrecisionAura = ko.observable(0);
            self.abilities()[i].bonusDamageReduction = ko.observable(0);
            self.abilities()[i].bonusHealth = ko.observable(0);
            self.abilities()[i].bonusStrength = ko.observable(0);
            self.abilities()[i].bonusStrength2 = ko.observable(0);
            self.abilities()[i].bonusAgility = ko.observable(0);
            self.abilities()[i].bonusAgility2 = ko.observable(0);
            self.abilities()[i].bonusInt = ko.observable(0);
            self.abilities()[i].bonusAllStatsReduction = ko.observable(0);
            self.abilities()[i].damageAmplification = ko.observable(0);
            self.abilities()[i].damageReduction = ko.observable(0);
            self.abilities()[i].evasion = ko.observable(0);
            self.abilities()[i].magicResist = ko.observable(0);
            self.abilities()[i].manaregen = ko.observable(0);
            self.abilities()[i].manaregenreduction = ko.observable(0);
            self.abilities()[i].missChance = ko.observable(0);
            self.abilities()[i].movementSpeedFlat = ko.observable(0);
            self.abilities()[i].movementSpeedPct = ko.observable(0);
            self.abilities()[i].movementSpeedPctReduction = ko.observable(0);
            self.abilities()[i].turnRateReduction = ko.observable(0);
            self.abilities()[i].attackrange = ko.observable(0);
            self.abilities()[i].attackspeed = ko.observable(0);
            self.abilities()[i].attackspeedreduction = ko.observable(0);
            self.abilities()[i].armor = ko.observable(0);
            self.abilities()[i].armorReduction = ko.observable(0);
            self.abilities()[i].healthregen = ko.observable(0);
            self.abilities()[i].lifesteal = ko.observable(0);
            self.abilities()[i].visionnight = ko.observable(0);
            self.abilities()[i].visionday = ko.observable(0);
        }
        self.abilityControlData = {};
        self.abilitySettingsData = function (data, parent, index) {
            if (self.abilityControlData[data] == undefined) {
                return self.processAbility(data, parent, index, self.abilityData[data]);
            }
            else {
                return self.abilityControlData[data];
            }
        }
        
        self.processAbility = function (data, parent, index, args) {
            var result = {};
            result.data = [];
            var v;
            var v_list = [];
            for (var i=0; i < args.length; i++) {
                switch (args[i].controlType) {
                    case 'input':
                        v = ko.observable(0).extend({ numeric: 2 });
                        v.controlValueType = args[i].controlValueType;
                        v_list.push(v);
                        result.data.push({ labelName: args[i].label.toUpperCase() + ':', controlVal: v, controlType: args[i].controlType, display: args[i].display });
                    break;
                    case 'checkbox':
                        v = ko.observable(false);
                        v.controlValueType = args[i].controlValueType;
                        v_list.push(v);
                        result.data.push({ labelName: args[i].label.toUpperCase() + '?', controlVal: v, controlType: args[i].controlType, display: args[i].display });
                    break;
                    case 'radio':
                        v = ko.observable(args[i].controlOptions[0].value);
                        v.controlValueType = args[i].controlValueType;
                        v_list.push(v);
                        result.data.push({ labelName: args[i].label.toUpperCase() + '?', controlVal: v, controlType: args[i].controlType, display: args[i].display, controlOptions: args[i].controlOptions });
                    break;
                    case 'text':
                        // single input abilities
                        if (args[i].controls == undefined) {
                            if (args[i].noLevel) {
                                var attributeValue = function (attributeName) {
                                    return {fn: ko.computed(function () {
                                        var _ability = _.find(self.abilities(), function(b) {
                                            return b.name() == data;
                                        });
                                        return self.getAbilityAttributeValue(_ability.attributes(), attributeName, 0);
                                    })};
                                };
                            }
                            else {
                                var attributeValue = function (attributeName) {
                                    return {fn: ko.computed(function () {
                                        var _ability = _.find(self.abilities(), function(b) {
                                            return b.name() == data;
                                        });
                                        return self.getAbilityAttributeValue(_ability.attributes(), attributeName, _ability.level());
                                    })};
                                };
                            }
                            var g = attributeValue(args[i].attributeName)
                            var r = self.getComputedFunction(v, g.fn, args[i].fn, parent, index, self, args[i].returnProperty, undefined, data);
                            if (tooltip == '' || args[i].ignoreTooltip) {
                                var tooltip = args[i].label;
                            }
							else {
								var tooltip = self.getAbilityAttributeTooltip(self.abilities()[index].attributes(), args[i].attributeName);
							}
                            result.data.push({ labelName: tooltip, controlVal: r, controlType: args[i].controlType, display: args[i].display, clean: g.fn });
                        }
                        // multi input abilities
                        else {
                            if (args[i].noLevel) {
                                var attributeValue = function (attributeName) {
                                    return {fn: ko.computed(function () {
                                        return self.getAbilityAttributeValue(self.abilities()[index].attributes(), attributeName, 0);
                                    })};
                                };
                            }
                            else {
                                var attributeValue = function (attributeName) {
                                    return {fn: ko.computed(function () {
                                        return self.getAbilityAttributeValue(self.abilities()[index].attributes(), attributeName, self.abilities()[index].level());
                                    })};
                                };
                            }
                            var g = attributeValue(args[i].attributeName)
                            var r = self.getComputedFunction(v_list, g.fn, args[i].fn, parent, index, self, args[i].returnProperty, args[i].controls, data);
                            if (tooltip == '' || args[i].ignoreTooltip) {
                                var tooltip = args[i].label;
                            }
							else {
								var tooltip = self.getAbilityAttributeTooltip(self.abilities()[index].attributes(), args[i].attributeName);
							}
                            result.data.push({ labelName: tooltip, controlVal: r, controlType: args[i].controlType, display: args[i].display, clean: g.fn });
                        }
                    break;
                }
            }
            self.abilityControlData[data] = result;
            return result;
        }

        self.getComputedFunction = function (v, attributeValue, fn, parent, index, abilityList, returnProperty, controls, abilityName) {
            return ko.computed(function () {
                if (controls == undefined) {
                    if (v == undefined) {
                        var returnVal = fn.call(this, v, attributeValue(), parent, index, abilityList);
                    }
                    else if (typeof v() == 'boolean') {
                        var returnVal = fn.call(this, v(), attributeValue(), parent, index, abilityList);
                    }
                    else {
                        if (v.controlValueType == undefined) {
                            var returnVal = fn.call(this, parseFloat(v()), attributeValue(), parent, index, abilityList);
                        }
                        else if (v.controlValueType == 'string') {
                            var returnVal = fn.call(this, v(), attributeValue(), parent, index, abilityList);
                        }
                        else {
                            var returnVal = fn.call(this, parseFloat(v()), attributeValue(), parent, index, abilityList);
                        }
                    }
                    if (returnProperty != undefined) {
                        var _ability = _.find(self.abilities(), function(b) {
                            return b.name() == abilityName;
                        });
                        _ability[returnProperty](returnVal);
                    }
                    return returnVal;
                }
                else {
                    var v_list = [];
                    for (var i=0;i<controls.length;i++) {
                        if (typeof v[controls[i]]() == 'boolean') {
                            v_list.push(v[controls[i]]());
                        }
                        else {
                            v_list.push(parseFloat(v[controls[i]]()));
                        }
                    }
                    var returnVal = fn.call(this, v_list, attributeValue(), parent, index, abilityList);
                    if (returnProperty != undefined) {
                        var _ability = _.find(self.abilities(), function(b) {
                            return b.name() == abilityName;
                        });
                        _ability[returnProperty](returnVal);
                    }
                    return returnVal;
                }
            }, this);
        }

        self.getAbilityAttributeValue = function (attributes, attributeName, level) {
            for (var i=0; i < attributes.length; i++) {
                if (attributes[i].name() == attributeName) {
                    if (level == 0) {
                        return parseFloat(attributes[i].value()[0]);
                    }
                    else if (level > attributes[i].value().length) {
                        return parseFloat(attributes[i].value()[0]);
                    }
                    else {
                        return parseFloat(attributes[i].value()[level-1]);
                    }
                }
            }
        }

        self.getAbilityAttributeTooltip = function (attributes, attributeName) {
            for (var i=0; i<attributes.length; i++) {
                if (attributes[i].name() == attributeName) {
                        var d = attributes[i].tooltip().replace(/\\n/g, '');
                        return d;
                }
            }
            return '';
        }
        
        self.getAbilityLevelByAbilityName = function (abilityName) {
            for (var i = 0; i < self.abilities().length; i++) {
                if (self.abilities()[i].name() == abilityName) {
                    return self.abilities()[i].level();
                }
            }
            return -1;
        }

        self.getAbilityByName = function (abilityName) {
            for (var i = 0; i < self.abilities().length; i++) {
                if (self.abilities()[i].name() == abilityName) {
                    return self.abilities()[i];
                }
            }
            return undefined;
        }

        self.getAbilityPropertyValue = function (ability, property) {
            return parseFloat(ability[property]()[ability.level()-1]);
        }
        
        self.getAttributeBonusLevel = function () {
            for (var i = 0; i < self.abilities().length; i++) {
                if (self.abilities()[i].name() == 'attribute_bonus') {
                    return self.abilities()[i].level();
                }
            }
            return 0;        
        }
        
        self.getAllStatsReduction = ko.computed(function () {
            var totalAttribute = 0;
            for (var i = 0; i < self.abilities().length; i++) {
                var ability = self.abilities()[i];
                if (!(ability.name() in self.abilityData)) {
                    if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                        for (var j = 0; j < self.abilities()[i].attributes().length; j++) {
                            var attribute = self.abilities()[i].attributes()[j];
                            /*switch(attribute.name()) {
                                // invoker_quas
                                case 'bonus_strength':
                                    totalAttribute += parseInt(attribute.value()[ability.level()-1]);
                                break;
                            }*/
                        }
                    }
                }
                else if (ability.bonusAllStatsReduction != undefined) {
                    if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                        // slark_essence_shift
                        totalAttribute+=ability.bonusAllStatsReduction();
                    }
                }
            }
            return totalAttribute;
        });
        
        self.getStrengthReduction = ko.computed(function () {
            var totalAttribute = 0;
            for (var i = 0; i < self.abilities().length; i++) {
                var ability = self.abilities()[i];
                if (!(ability.name() in self.abilityData)) {
                    if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                        for (var j = 0; j < self.abilities()[i].attributes().length; j++) {
                            var attribute = self.abilities()[i].attributes()[j];
                            /*switch(attribute.name()) {
                                // invoker_quas
                                case 'bonus_strength':
                                    totalAttribute += parseInt(attribute.value()[ability.level()-1]);
                                break;
                            }*/
                        }
                    }
                }
                else if (ability.bonusStrength != undefined && ability.name() == 'undying_decay') {
                    if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                        // undying_decay
                        totalAttribute-=ability.bonusStrength();
                    }
                }
            }
            return totalAttribute;
        });
        
        self.getStrength = ko.computed(function () {
            var totalAttribute = 0;
            for (var i = 0; i < self.abilities().length; i++) {
                var ability = self.abilities()[i];
                if (!(ability.name() in self.abilityData)) {
                    if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                        for (var j = 0; j < self.abilities()[i].attributes().length; j++) {
                            var attribute = self.abilities()[i].attributes()[j];
                            /*switch(attribute.name()) {
                                // invoker_quas
                                case 'bonus_strength':
                                    totalAttribute += parseInt(attribute.value()[ability.level()-1]);
                                break;
                            }*/
                        }
                    }
                }
                else {
                    if (ability.bonusStrength != undefined) {
                        if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1) || ability.name() == 'invoker_quas')) {
                            // pudge_flesh_heap,invoker_quas,morphling_morph_str,morphling_morph_agi,undying_decay
                            totalAttribute+=ability.bonusStrength();
                        }
                    }
                    if (ability.bonusStrength2 != undefined) {
                        if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                            // morphling_morph_str
                            totalAttribute+=ability.bonusStrength2();
                        }
                    }
                }
            }
            return totalAttribute;
        });
        
        self.getAgility = ko.computed(function () {
            var totalAttribute = 0;
            for (var i = 0; i < self.abilities().length; i++) {
                var ability = self.abilities()[i];
                if (!(ability.name() in self.abilityData)) {
                    if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                        for (var j = 0; j < self.abilities()[i].attributes().length; j++) {
                            var attribute = self.abilities()[i].attributes()[j];
                            switch(attribute.name()) {
                                // drow_ranger_marksmanship
                                case 'marksmanship_agility_bonus':
                                    totalAttribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
                                break;
                            }
                        }
                    }
                }
                else {
                    if (ability.bonusAgility != undefined) {
                        if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1) || ability.name() == 'invoker_wex')) {
                            // invoker_wex,morphling_morph_agi,morphling_morph_str
                            totalAttribute+=ability.bonusAgility();
                        }
                    }
                    if (ability.bonusAgility2 != undefined) {
                        if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                            // invoker_wex,morphling_morph_agi,morphling_morph_str
                            totalAttribute+=ability.bonusAgility2();
                        }
                    }
                }
            }
            return totalAttribute;
        });

        self.getIntelligence = ko.computed(function () {
            var totalAttribute = 0;
            for (var i = 0; i < self.abilities().length; i++) {
                var ability = self.abilities()[i];
                if (!(ability.name() in self.abilityData)) {
                    if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                        for (var j = 0; j < self.abilities()[i].attributes().length; j++) {
                            var attribute = self.abilities()[i].attributes()[j];
                            switch(attribute.name()) {
                                // invoker_exort
                            /*    case 'bonus_intelligence':
                                    totalAttribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
                                break;*/
                            }
                        }
                    }
                }
                else if (ability.bonusInt != undefined) {
                    if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1) || ability.name() == 'invoker_exort')) {
                        // invoker_exort
                        totalAttribute+=ability.bonusInt();
                    }
                }
            }
            return totalAttribute;
        });
        
        self.getArmor = ko.computed(function () {
            var totalAttribute = 0;
            for (var i = 0; i < self.abilities().length; i++) {
                var ability = self.abilities()[i];
                if (!(ability.name() in self.abilityData)) {
                    if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                        for (var j = 0; j < self.abilities()[i].attributes().length; j++) {
                            var attribute = self.abilities()[i].attributes()[j];
                            switch(attribute.name()) {
                                // axe_berserkers_call,dragon_knight_dragon_blood,troll_warlord_berserkers_rage,lycan_shapeshift,enraged_wildkin_toughness_aura
                                case 'bonus_armor':
                                    if (ability.name() != 'templar_assassin_meld') {
                                        totalAttribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
                                    }
                                break;
                                // sven_warcry
                                case 'warcry_armor':
                                    totalAttribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
                                break;
                                // lich_frost_armor,ogre_magi_frost_armor
                                case 'armor_bonus':
                                    if (ability.name() == 'lich_frost_armor' || ability.name() == 'ogre_magi_frost_armor') {
                                        totalAttribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
                                    }
                                break;
                            }
                        }
                    }
                }
                else if (ability.armor != undefined) {
                    if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                        // shredder_reactive_armor,visage_gravekeepers_cloak
                        totalAttribute+=ability.armor();
                    }
                }
            }
            return totalAttribute;
        });

        self.getArmorBaseReduction = ko.computed(function () {
            var totalAttribute = 1;
            for (var i = 0; i < self.abilities().length; i++) {
                var ability = self.abilities()[i];
                if (!(ability.name() in self.abilityData)) {
                    if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                        switch(ability.name()) {
                            //elder_titan_natural_order
                            case 'elder_titan_natural_order':
                                totalAttribute *= (1-self.getAbilityAttributeValue(self.abilities()[i].attributes(), 'armor_reduction_pct', ability.level())/100);
                            break;
                        }
                    }
                }
            }
            return totalAttribute;
        });
        
        self.getArmorReduction = ko.computed(function () {
            var totalAttribute = 0;
            for (var i = 0; i < self.abilities().length; i++) {
                var ability = self.abilities()[i];
                if (!(ability.name() in self.abilityData)) {
                    if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                        switch(ability.name()) {
                            //templar_assassin_meld
                            case 'templar_assassin_meld':
                                totalAttribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), 'bonus_armor', ability.level());
                            break;
                            // tidehunter_gush
                            case 'tidehunter_gush':
                                totalAttribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), 'armor_bonus', ability.level());
                            break;
                            // naga_siren_rip_tide
                            case 'naga_siren_rip_tide':
                            // slardar_amplify_damage
                            case 'slardar_amplify_damage':
                            // vengefulspirit_wave_of_terror
                            case 'vengefulspirit_wave_of_terror':
                                totalAttribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), 'armor_reduction', ability.level());
                            break;
                            // nevermore_dark_lord
                            case 'nevermore_dark_lord':
                                totalAttribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), 'presence_armor_reduction', ability.level());
                            break;
                        }
                    }
                }
                else if (ability.armorReduction != undefined) {
                    if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                        // alchemist_acid_spray
                        totalAttribute+=ability.armorReduction();
                    }
                }
            }
            return totalAttribute;
        });

        self.getHealth = ko.computed(function () {
            var totalAttribute = 0;
            for (var i = 0; i < self.abilities().length; i++) {
                var ability = self.abilities()[i];
                if (!(ability.name() in self.abilityData)) {
                    if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                        for (var j = 0; j < self.abilities()[i].attributes().length; j++) {
                            var attribute = self.abilities()[i].attributes()[j];
                            switch(attribute.name()) {
                                // lone_druid_true_form,lycan_shapeshift,troll_warlord_berserkers_rage
                                case 'bonus_hp':
									totalAttribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
                                break;
                                // lone_druid_synergy
                                case 'true_form_hp_bonus':
                                    if (self.isTrueFormActive()) {
										totalAttribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
                                    }
                                break;
                            }
                        }
                    }
                }
                else if (ability.bonusHealth != undefined) {
                    if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                        // clinkz_death_pact
                        totalAttribute+=ability.bonusHealth();
                    }
                }
            }
            return totalAttribute;
        });
        
        self.isTrueFormActive = function () {
            for (var i = 0; i < self.abilities().length; i++) {
                var ability = self.abilities()[i];
                if (ability.isActive() && ability.name() == 'lone_druid_true_form') {
                    return true;
                }
            }
            return false;
        }
        
        /*self.operations = {
            "+": function (operand1, operand2) {
                return operand1 + operand2;
            },
            "-": function (operand1, operand2) {
                return operand1 - operand2;
            },
            "*": function (operand1, operand2) {
                return operand1 * operand2;
            },
            "i": function (ability, attribute) {
                return parseInt(attribute.value()[ability.level()-1]);
            },
            "f": function (ability, attribute) {
                return parseFloat(attribute.value()[ability.level()-1]);
            },
            "a": function (ability, attribute) {
                return self.getAbilityAttributeValue(ability.attributes(), attribute.name(), ability.level());
            },
            "1-a": function (ability, attribute, value) {
                if (property) {
                    return (1 - self.getAbilityAttributeValue(ability.attributes(), attribute.name(), ability.level())/100);
                }
                else {
                    return (1 - value/100);
                }
            }
        };

        
        self.getGenericAttribute = function (abilities, attributeList, properties, abilityList) {
            return _.reduce(abilities, function (t1, ability) {
                if (!(ability.name() in self.abilityData)) {
                    if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                        t1 += _.reduce(ability.attributes(), function (t2, attribute) {
                            t2 += _.reduce(attributeList, function (t3, a) {
                                if (typeof a == 'string') {
                                    if (a == attribute.name()) t3 += parseInt(attribute.value()[ability.level()-1]);
                                }
                                else {
                                    if (a.name == attribute.name()) {
                                        var op = a.op || '+',
                                            abilityList = a.abilityList || null,
                                            fn = a.fn || 'a',
                                            scepter = a.scepter || false;
                                        if (abilityList == null || abilityList.indexOf(ability.name()) != -1) {
                                            t3 = self.operations[op](t3, self.operations[fn](ability, attribute));
                                        }
                                    }
                                }
                                return t3
                            }, 0);
                            return t2;
                        }, 0);
                        var a = _.find(abilityList, {'name': ability.name()});
                        var op = a.op || '+',
                            abilityList = a.abilityList || null,
                            fn = a.fn || 'a',
                            scepter = a.scepter || false,
                            value = a.value || self.operations[fn](ability, attribute);
                        t1 = self.operations[op](t1, value);
                    }
                }
                else {
                    t1 += _.reduce(properties, function (t4, property) {
                        if (ability[property] != undefined) {
                            if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                                t4 = self.operations[op](t4, self.operations[fn](ability, attribute, ability[property]()));
                            }
                        }
                        return t4;
                    }, 0);
                }
                return t1;
            }, 0);
        }*/
        
        self.getHealthRegen = ko.computed(function () {
            var totalAttribute = 0;
            for (var i = 0; i < self.abilities().length; i++) {
                var ability = self.abilities()[i];
                if (!(ability.name() in self.abilityData)) {
                    if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                        for (var j = 0; j < self.abilities()[i].attributes().length; j++) {
                            var attribute = self.abilities()[i].attributes()[j];
                            switch(attribute.name()) {
                                // alchemist_chemical_rage, dragon_knight_dragon_blood
                                case 'bonus_health_regen':
                                // broodmother_spin_web
                                case 'heath_regen':
                                // omniknight_guardian_angel,treant_living_armor,satyr_hellcaller_unholy_aura
                                case 'health_regen':
									totalAttribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
                                break;
                                // legion_commander_press_the_attack
                                case 'hp_regen':
									totalAttribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
                                break;
                            }
                        }
                    }
                }
                else if (ability.healthregen != undefined) {
                    if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                        // shredder_reactive_armor,invoker_quas
                        totalAttribute+=ability.healthregen();
                    }
                }
            }
            return totalAttribute;
        });

        self.getMana = ko.computed(function () {
            var totalAttribute = 0;
            for (var i = 0; i < self.abilities().length; i++) {
                var ability = self.abilities()[i];
                if (!(ability.name() in self.abilityData)) {
                    if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                        for (var j = 0; j < self.abilities()[i].attributes().length; j++) {
                            var attribute = self.abilities()[i].attributes()[j];
                            switch(attribute.name()) {
                                // obsidian_destroyer_essence_aura
                                case 'bonus_mana':
									totalAttribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
                                break;
                            }
                        }
                    }
                }
            }
            return totalAttribute;
        });
        
        self.getManaRegen = ko.computed(function () {
            var totalAttribute = 0;
            for (var i = 0; i < self.abilities().length; i++) {
                var ability = self.abilities()[i];
                if (!(ability.name() in self.abilityData)) {
                    if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                        for (var j = 0; j < self.abilities()[i].attributes().length; j++) {
                            var attribute = self.abilities()[i].attributes()[j];
                            switch(attribute.name()) {
                                // alchemist_chemical_rage
                                case 'bonus_mana_regen':
                                    totalAttribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
                                break;
                            }
                        }
                    }
                }
                else if (ability.manaregen != undefined) {
                    if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                        // 
                        totalAttribute+=ability.manaregen();
                    }
                }
            }
            return totalAttribute;
        });
        
        self.getManaRegenArcaneAura = ko.computed(function () {
            var totalAttribute = 0;
            for (var i = 0; i < self.abilities().length; i++) {
                var ability = self.abilities()[i];
                if (!(ability.name() in self.abilityData)) {
                    if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                        for (var j = 0; j < self.abilities()[i].attributes().length; j++) {
                            var attribute = self.abilities()[i].attributes()[j];
                            switch(attribute.name()) {
                                // crystal_maiden_brilliance_aura
                                case 'mana_regen':
                                    if (ability.name() == 'crystal_maiden_brilliance_aura') {
                                        totalAttribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
                                    }
                                break;
                            }
                        }
                    }
                }
            }
            return totalAttribute;
        });

        self.getManaRegenReduction = ko.computed(function () {
            var totalAttribute = 0;
            for (var i = 0; i < self.abilities().length; i++) {
                var ability = self.abilities()[i];
                if (!(ability.name() in self.abilityData)) {
                    if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                        for (var j = 0; j < self.abilities()[i].attributes().length; j++) {
                            var attribute = self.abilities()[i].attributes()[j];
                            //switch(attribute.name()) {
                            //    // 
                            //    case '':
                            //        totalAttribute += parseInt(attribute.value()[ability.level()-1]);
                            //    break;
                            //}
                        }
                    }
                }
                else if (ability.manaregenreduction != undefined) {
                    if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                        // pugna_nether_ward
                        totalAttribute+=ability.manaregenreduction();
                    }
                }
            }
            return totalAttribute;
        });
        
        self.getAttackRange = ko.computed(function () {
            var totalAttribute = 0;
            for (var i = 0; i < self.abilities().length; i++) {
                var ability = self.abilities()[i];
                if (!(ability.name() in self.abilityData)) {
                    if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                        for (var j = 0; j < self.abilities()[i].attributes().length; j++) {
                            var attribute = self.abilities()[i].attributes()[j];
                            switch(attribute.name()) {
                                // winter_wyvern_arctic_burn
                                case 'attack_range_bonus':
                                    totalAttribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
                                break;
                                // templar_assassin_psi_blades,sniper_take_aim
                                case 'bonus_attack_range':
                                // terrorblade_metamorphosis,troll_warlord_berserkers_rage
                                case 'bonus_range':
                                    if (ability.name() == 'terrorblade_metamorphosis') {
                                        totalAttribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
                                    }
                                    if (ability.name() == 'troll_warlord_berserkers_rage') {
                                        totalAttribute -= self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
                                    }
                                break;
                                // tiny_grow
                                case 'bonus_range_scepter':
                                    if (ability.name() == 'tiny_grow' && self.hasScepter()) {
                                        totalAttribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
                                    }
                                break;
                                // enchantress_impetus
                                case 'bonus_attack_range_scepter':
                                    if (ability.name() == 'enchantress_impetus' && self.hasScepter()) {
                                        totalAttribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
                                    }
                                break;
                            }
                        }
                        // lone_druid_true_form
                        if (ability.name() == 'lone_druid_true_form') {
                            totalAttribute -= 422;
                        }
                    }
                    else if (ability.level() > 0 && ability.name() == 'enchantress_impetus' && self.hasScepter()) {
                        for (var j = 0; j < self.abilities()[i].attributes().length; j++) {
                            var attribute = self.abilities()[i].attributes()[j];
                            switch(attribute.name()) {
                              case 'bonus_attack_range_scepter':
                                totalAttribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
                              break;
                            }
                        }
                    }
                }
                else if (ability.attackrange != undefined) {
                    if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                        // dragon_knight_elder_dragon_form
                        totalAttribute+=ability.attackrange();
                    }
                }
            }
            return totalAttribute;
        });
        
        self.getAttackSpeed = ko.computed(function () {
            var totalAttribute = 0;
            for (var i = 0; i < self.abilities().length; i++) {
                var ability = self.abilities()[i];
                if (!(ability.name() in self.abilityData)) {
                    if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                        for (var j = 0; j < self.abilities()[i].attributes().length; j++) {
                            var attribute = self.abilities()[i].attributes()[j];
                            switch(attribute.name()) {
                                // abaddon_frostmourne,troll_warlord_battle_trance
                                case 'attack_speed':
                                // visage_grave_chill
                                case 'attackspeed_bonus':
                                // mirana_leap
                                case 'leap_speedbonus_as':
                                // life_stealer
                                case 'attack_speed_bonus':
                                    totalAttribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
                                break;
                                // clinkz_strafe,ursa_overpower
                                case 'attack_speed_bonus_pct':
                                    if (ability.name() == 'clinkz_strafe' || ability.name() == 'ursa_overpower') {
                                        totalAttribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
                                    }
                                break;
                                // axe_culling_blade,necronomicon_archer_aoe
                                case 'speed_bonus':
                                    if (ability.name() == 'axe_culling_blade' || ability.name() == 'necronomicon_archer_aoe') {
                                        totalAttribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
                                    }
                                break;
                                // ancient_apparition_chilling_touch
                                case 'attack_speed_pct':
                                    if (ability.name() == 'ancient_apparition_chilling_touch') {
                                        totalAttribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
                                    }
                                break;
                                // beastmaster_inner_beast,lycan_feral_impulse,lone_druid_rabid,tiny_grow,phantom_assassin_phantom_strike,windrunner_focusfire,ogre_magi_bloodlust,centaur_khan_endurance_aura
                                case 'bonus_attack_speed':
                                    if (ability.name() == 'beastmaster_inner_beast' 
                                     || ability.name() == 'lycan_feral_impulse' 
                                     || ability.name() == 'lone_druid_rabid' 
                                     || ability.name() == 'tiny_grow' 
                                     || ability.name() == 'phantom_assassin_phantom_strike' 
                                     || ability.name() == 'windrunner_focusfire' 
                                     || ability.name() == 'ogre_magi_bloodlust'
                                     || ability.name() == 'centaur_khan_endurance_aura') {
                                        totalAttribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
                                    }
                                break;
                            }
                        }
                    }
                }
                else if (ability.attackspeed != undefined) {
                    if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                        // troll_warlord_fervor,wisp_overcharge,lina_fiery_soul,invoker_alacrity,invoker_wex
                        totalAttribute+=ability.attackspeed();
                    }
                }
            }
            return totalAttribute;
        });

        self.getAttackSpeedReduction = ko.computed(function () {
            var totalAttribute = 0;
            for (var i = 0; i < self.abilities().length; i++) {
                var ability = self.abilities()[i];
                if (!(ability.name() in self.abilityData)) {
                    if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                        for (var j = 0; j < self.abilities()[i].attributes().length; j++) {
                            var attribute = self.abilities()[i].attributes()[j];
                            switch(attribute.name()) {
                                // night_stalker_void,crystal_maiden_crystal_nova,ghost_frost_attack,ogre_magi_frost_armor,polar_furbolg_ursa_warrior_thunder_clap
                                case 'attackspeed_slow':
                                // lich_frost_armor,lich_frost_nova,enchantress_untouchable
                                case 'slow_attack_speed':
                                // beastmaster_primal_roar
                                case 'slow_attack_speed_pct':
                                // storm_spirit_overload
                                case 'overload_attack_slow':
                                    totalAttribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
                                break;
                                // omniknight_degen_aura
                                case 'speed_bonus':
                                    if (ability.name() == 'omniknight_degen_aura') {
                                        totalAttribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
                                    }
                                break;
                                // tusk_frozen_sigil,crystal_maiden_freezing_field
                                case 'attack_slow':
                                    if (ability.name() == 'crystal_maiden_freezing_field' && !self.hasScepter()) {
                                        totalAttribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
                                    }
                                    else if (ability.name() == 'tusk_frozen_sigil') {
                                        totalAttribute -= self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
                                    }
                                break;
                                case 'attack_slow_scepter':
                                    if (ability.name() == 'crystal_maiden_freezing_field' && self.hasScepter()) {
                                        totalAttribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
                                    }
                                break;
                                // faceless_void_time_walk
                                case 'attack_speed_pct':
                                    if (ability.name() == 'faceless_void_time_walk') {
                                        totalAttribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
                                    }
                                break;
                                // bounty_hunter_jinada
                                case 'bonus_attackspeed':
                                    if (ability.name() == 'bounty_hunter_jinada') {
                                        totalAttribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
                                    }
                                break;
                                // brewmaster_thunder_clap
                                case 'attack_speed_slow':
                                    if (ability.name() == 'brewmaster_thunder_clap') {
                                        totalAttribute -= self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
                                    }
                                break;
                                // medusa_stone_gaze
                                case 'slow':
                                    if (ability.name() == 'medusa_stone_gaze') {
                                        totalAttribute -= self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
                                    }
                                break;
                                // visage_grave_chill
                                case 'attackspeed_bonus':
                                    totalAttribute -= self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
                                break;
                                // abaddon_frostmourne
                                case 'attack_slow_tooltip':
                                    if (ability.name() == 'abaddon_frostmourne') {
                                        totalAttribute -= self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
                                    }
                                break;
                            }
                        }
                        if (ability.name() == 'enraged_wildkin_tornado') {
                            totalAttribute -= 15;
                        }
                    }
                }
                else if (ability.attackspeedreduction != undefined) {
                    if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                        // viper_viper_strike,viper_corrosive_skin,jakiro_liquid_fire,lich_chain_frost,sandking_epicenter,earth_spirit_rolling_boulder
                        totalAttribute+=ability.attackspeedreduction();
                    }
                }
            }
            return totalAttribute;
        });
        self.getBash = ko.computed(function () {
            var totalAttribute = 1;
            for (var i = 0; i < self.abilities().length; i++) {
                var ability = self.abilities()[i];
                if (!(ability.name() in self.abilityData)) {
                    if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                        for (var j = 0; j < self.abilities()[i].attributes().length; j++) {
                            var attribute = self.abilities()[i].attributes()[j];
                            switch(attribute.name()) {
                                // slardar_bash
                                case 'chance':
                                // sniper_headshot
                                case 'proc_chance':
                                    totalAttribute *= (1 - self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100);
                                break;
                            }
                        }
                    }
                }
                else if (ability.bash != undefined) {
                    // spirit_breaker_greater_bash,faceless_void_time_lock
                    if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                        totalAttribute *= (1 - ability.bash()/100);
                    }
                }
            }
            return totalAttribute;
        });    
        self.getBaseDamage = ko.computed(function () {
            var totalAttribute = 0;
            var totalMultiplier = 1;
            var sources = {};
            for (var i = 0; i < self.abilities().length; i++) {
                var ability = self.abilities()[i];
                if (!(ability.name() in self.abilityData)) {
                    if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                        for (var j = 0; j < self.abilities()[i].attributes().length; j++) {
                            var attribute = self.abilities()[i].attributes()[j];
                            switch(attribute.name()) {
                                // tiny_grow,terrorblade_metamorphosis
                                case 'bonus_damage':
                                    if (ability.name() == 'tiny_grow' || ability.name() == 'terrorblade_metamorphosis') {
                                        totalAttribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
                                        sources[ability.name()] = {
                                            'damage': self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level()),
                                            'damageType': 'physical',
                                            'displayname': ability.displayname()
                                        }
                                    }
                                break;
                            }
                        }
                    }
                }
                else {
                    if (ability.baseDamageMultiplier != undefined) {
                        // earthshaker_enchant_totem
                        if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                            totalMultiplier += ability.baseDamageMultiplier()/100;
                            /*totalAttribute += ability.baseDamage();
                            sources[ability.name()] = {
                                'damage': ability.baseDamage(),
                                'damageType': 'physical',
                                'displayname': ability.displayname()
                            }*/
                        }
                    }
                    if (ability.baseDamage != undefined) {
                        // clinkz_death_pact
                        if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                            totalAttribute += ability.baseDamage();
                            sources[ability.name()] = {
                                'damage': ability.baseDamage(),
                                'damageType': 'physical',
                                'displayname': ability.displayname()
                            }
                        }
                    }
                }
            }
            return { sources: sources, total: totalAttribute, multiplier: totalMultiplier };
        });
        
        self.getSelfBaseDamageReductionPct = ko.computed(function () {
            var totalAttribute = 1;
            for (var i = 0; i < self.abilities().length; i++) {
                var ability = self.abilities()[i];
                if (!(ability.name() in self.abilityData)) {
                    if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                        for (var j = 0; j < self.abilities()[i].attributes().length; j++) {
                            var attribute = self.abilities()[i].attributes()[j];
                            switch(attribute.name()) {
                                // medusa_split_shot
                                case 'damage_modifier':
                                    totalAttribute *= (1 + self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100);
                                break;
                                // windrunner_focusfire
                                case 'focusfire_damage_reduction':
                                    if (!self.hasScepter()) {
                                        totalAttribute *= (1 + self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100);
                                    }
                                break;
                                case 'focusfire_damage_reduction_scepter':
                                    if (self.hasScepter()) {
                                        totalAttribute *= (1 + self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100);
                                    }
                                break;
                            }
                        }
                    }
                }
            }
            return totalAttribute;
        });
        
        self.getBaseDamageReductionPct = ko.computed(function () {
            var totalAttribute = 1;
            for (var i = 0; i < self.abilities().length; i++) {
                var ability = self.abilities()[i];
                if (!(ability.name() in self.abilityData)) {
                    if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                        for (var j = 0; j < self.abilities()[i].attributes().length; j++) {
                            var attribute = self.abilities()[i].attributes()[j];
                            switch(attribute.name()) {
                                // vengefulspirit_command_aura
                                case 'bonus_damage_pct':
                                    if (ability.name() == 'vengefulspirit_command_aura') {
                                        totalAttribute *= (1 - self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100);
                                    }
                                break;
                            }
                        }
                    }
                }
            }
            return totalAttribute;
        });
        
        self.getBAT = ko.computed(function () {
            var totalAttribute = 0;
            for (var i = 0; i < self.abilities().length; i++) {
                var ability = self.abilities()[i];
                if (!(ability.name() in self.abilityData)) {
                    if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                        for (var j = 0; j < self.abilities()[i].attributes().length; j++) {
                            var attribute = self.abilities()[i].attributes()[j];
                            switch(attribute.name()) {
                                // troll_warlord_berserkers_rage,alchemist_chemical_rage,lone_druid_true_form,lycan_shapeshift
                                case 'base_attack_time':
                                    totalAttribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
                                break;
                            }
                        }
                    }
                }
            }
            return totalAttribute;
        });
        self.getBonusDamage = ko.computed(function () {
            var totalAttribute = 0;
            var sources = {};
            for (var i = 0; i < self.abilities().length; i++) {
                var ability = self.abilities()[i];
                if (!(ability.name() in self.abilityData)) {
                    if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                        for (var j = 0; j < self.abilities()[i].attributes().length; j++) {
                            var attribute = self.abilities()[i].attributes()[j];
                            switch(attribute.name()) {
                                // broodmother_insatiable_hunger,luna_lunar_blessing,templar_assassin_refraction,templar_assassin_meld,troll_warlord_berserkers_rage,lone_druid_true_form_battle_cry
                                case 'bonus_damage':
                                    if (ability.name() == 'broodmother_insatiable_hunger' || ability.name() == 'luna_lunar_blessing'
                                     || ability.name() == 'templar_assassin_refraction' || ability.name() == 'templar_assassin_meld'
                                     || ability.name() == 'troll_warlord_berserkers_rage' || ability.name() == 'lone_druid_true_form_battle_cry') {
                                        totalAttribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
                                        sources[ability.name()] = {
                                            'damage': self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level()),
                                            'damageType': 'physical',
                                            'displayname': ability.displayname()
                                        }
                                    }
                                break;
                                // lycan_howl
                                case 'hero_bonus_damage':
                                    totalAttribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
                                    sources[ability.name()] = {
                                        'damage': self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level()),
                                        'damageType': 'physical',
                                        'displayname': ability.displayname()
                                    }
                                break;
                            }
                        }
                        if (ability.name() == 'storm_spirit_overload') {
                            totalAttribute += self.getAbilityPropertyValue(ability, 'damage');
                            sources[ability.name()] = {
                                'damage': self.getAbilityPropertyValue(ability, 'damage'),
                                'damageType': 'magic',
                                'displayname': ability.displayname()
                            }                        
                        }
                    }
                }
                else if (ability.bonusDamage != undefined && ability.bonusDamage() != 0) {
                    if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                        // nevermore_necromastery,ursa_fury_swipes,ursa_enrage,invoker_alacrity,invoker_exort,elder_titan_ancestral_spirit,spectre_desolate
                        totalAttribute+=ability.bonusDamage();
                        sources[ability.name()] = {
                            'damage': ability.bonusDamage(),
                            'damageType': ability.name() == 'spectre_desolate' ? 'pure' : 'physical',
                            'displayname': ability.displayname()
                        }
                    }
                }
            }
            return { sources: sources, total: totalAttribute };
        });

        self.getBonusDamagePercent = ko.computed(function () {
            var totalAttribute = 0;
            var sources = {};
            for (var i = 0; i < self.abilities().length; i++) {
                var ability = self.abilities()[i];
                if (!(ability.name() in self.abilityData)) {
                    if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                        for (var j = 0; j < self.abilities()[i].attributes().length; j++) {
                            var attribute = self.abilities()[i].attributes()[j];
                            switch(attribute.name()) {
                                // bloodseeker_bloodrage
                                case 'damage_increase_pct':
                                    if (ability.name() == 'bloodseeker_bloodrage') {
                                        totalAttribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100;
                                        sources[ability.name()] = {
                                            'damage': self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100,
                                            'damageType': 'physical',
                                            'displayname': ability.displayname()
                                        }
                                    }
                                break;
                                // magnataur_empower,vengefulspirit_command_aura,alpha_wolf_command_aura
                                case 'bonus_damage_pct':
                                    if (ability.name() == 'magnataur_empower' || ability.name() == 'vengefulspirit_command_aura' || ability.name() == 'alpha_wolf_command_aura') {
                                        totalAttribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100;
                                        sources[ability.name()] = {
                                            'damage': self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100,
                                            'damageType': 'physical',
                                            'displayname': ability.displayname()
                                        }
                                    }
                                break;
                                // sven_gods_strength
                                case 'gods_strength_damage':
                                    if (ability.name() == 'sven_gods_strength' && self.hero != undefined && self.hero.selectedHero().heroName == 'sven') {
                                        totalAttribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100;
                                        sources[ability.name()] = {
                                            'damage': self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100,
                                            'damageType': 'physical',
                                            'displayname': ability.displayname()
                                        }
                                    }
                                break;
                                case 'gods_strength_damage_scepter':
                                    if (ability.name() == 'sven_gods_strength' && self.hero == undefined) {
                                        totalAttribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100;
                                        sources[ability.name()] = {
                                            'damage': self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100,
                                            'damageType': 'physical',
                                            'displayname': ability.displayname()
                                        }
                                    }
                                break;
                            }
                        }
                    }
                }
                else if (ability.bonusDamagePct != undefined && ability.bonusDamagePct() != 0) {
                    if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                        // bloodseeker_bloodrage
                        /*totalAttribute+=ability.bonusDamagePct()/100;
                        sources[ability.name()] = {
                            'damage': ability.bonusDamagePct()/100,
                            'damageType': 'physical',
                            'displayname': ability.displayname()
                        }*/
                    }
                }
            }
            return { sources: sources, total: totalAttribute };
        });

        self.getBonusDamageBackstab = ko.computed(function () {
            var totalAttribute1 = 0;
            var totalAttribute2 = 0;
            var sources = [];
            for (var i = 0; i < self.abilities().length; i++) {
                var ability = self.abilities()[i];
                if (ability.name() == 'riki_backstab') {
                    if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                        for (var j = 0; j < self.abilities()[i].attributes().length; j++) {
                            var attribute = self.abilities()[i].attributes()[j];
                            switch(attribute.name()) {
                                // riki_backstab
                                case 'damage_multiplier':
                                    totalAttribute1 += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
                                    sources.push({
                                        'damage': self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level()),
                                        'damageType': 'physical',
                                        'displayname': ability.displayname()
                                    });
                                break;
                            }
                        }/*
                        if (ability.bonusDamageBackstab != undefined) {
                            console.log('bonusDamageBackstab');
                            // damage_multiplier
                            totalAttribute2+=ability.bonusDamageBackstab();
                            sources.push({
                                'damage': ability.bonusDamageBackstab(),
                                'damageType': 'physical',
                                'displayname': ability.displayname()
                            });
                        }
                        */
                    }
                }
            }
            return { sources: sources, total: [totalAttribute1,totalAttribute2] };
        });
        
        self.getBonusDamagePrecisionAura = ko.computed(function () {
            var totalAttribute1 = 0;
            var totalAttribute2 = 0;
            var sources = [];
            for (var i = 0; i < self.abilities().length; i++) {
                var ability = self.abilities()[i];
                if (ability.name() == 'drow_ranger_trueshot') {
                    if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                        for (var j = 0; j < self.abilities()[i].attributes().length; j++) {
                            var attribute = self.abilities()[i].attributes()[j];
                            switch(attribute.name()) {
                                // drow_ranger_trueshot
                                case 'trueshot_ranged_damage':
                                    totalAttribute1 += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100;
                                    sources.push({
                                        'damage': self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100,
                                        'damageType': 'physical',
                                        'displayname': ability.displayname()
                                    });
                                break;
                            }
                        }
                        if (ability.bonusDamagePrecisionAura != undefined) {
                            // drow_ranger_trueshot
                            totalAttribute2+=ability.bonusDamagePrecisionAura();
                            sources.push({
                                'damage': ability.bonusDamagePrecisionAura(),
                                'damageType': 'physical',
                                'displayname': ability.displayname()
                            });
                        }
                    }
                }
            }
            return { sources: sources, total: [totalAttribute1,totalAttribute2] };
        });
        
        self.getBonusDamageReduction = ko.computed(function () {
            var totalAttribute = 0;
            for (var i = 0; i < self.abilities().length; i++) {
                var ability = self.abilities()[i];
                if (!(ability.name() in self.abilityData)) {
                    if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                        for (var j = 0; j < self.abilities()[i].attributes().length; j++) {
                            var attribute = self.abilities()[i].attributes()[j];
                            switch(attribute.name()) {
                                // bane_enfeeble
                                case 'enfeeble_attack_reduction':
                                    totalAttribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
                                break;
                            }
                        }
                    }
                }
                else if (ability.bonusDamageReduction != undefined) {
                    if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                        // rubick_fade_bolt
                        totalAttribute+=ability.bonusDamageReduction();
                    }
                }
            }
            return totalAttribute;
        });
        
        self.getBonusDamageReductionPct = ko.computed(function () {
            var totalAttribute = 1;
            for (var i = 0; i < self.abilities().length; i++) {
                var ability = self.abilities()[i];
                if (!(ability.name() in self.abilityData)) {
                    if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                        for (var j = 0; j < self.abilities()[i].attributes().length; j++) {
                            var attribute = self.abilities()[i].attributes()[j];
                            switch(attribute.name()) {
                                // medusa_split_shot
                                case 'damage_modifier':
                                    totalAttribute *= (1 + self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100);
                                break;
                                // windrunner_focusfire
                                case 'focusfire_damage_reduction':
                                    if (!self.hasScepter()) {
                                        totalAttribute *= (1 + self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100);
                                    }
                                break;
                                case 'focusfire_damage_reduction_scepter':
                                    if (self.hasScepter()) {
                                        totalAttribute *= (1 + self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100);
                                    }
                                break;
                            }
                        }
                    }
                }
            }
            return totalAttribute;
        });

        self.getDamageAmplification = ko.computed(function () {
            var totalAttribute = 1;
            for (var i = 0; i < self.abilities().length; i++) {
                var ability = self.abilities()[i];
                if (!(ability.name() in self.abilityData)) {
                    /*if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                        for (var j = 0; j < self.abilities()[i].attributes().length; j++) {
                            var attribute = self.abilities()[i].attributes()[j];
                            switch(attribute.name()) {
                                // bane_enfeeble
                                case 'enfeeble_attack_reduction':
                                    totalAttribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
                                break;
                            }
                        }
                    }*/
                }
                else if (ability.damageAmplification != undefined) {
                    if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                        // undying_flesh_golem
                        totalAttribute *= (1 + ability.damageAmplification()/100);
                    }
                }
            }
            return totalAttribute;
        });
		
        self.getDamageReduction = ko.computed(function () {
            var totalAttribute = 1;
            for (var i = 0; i < self.abilities().length; i++) {
                var ability = self.abilities()[i];
                if (!(ability.name() in self.abilityData)) {
                    if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                        for (var j = 0; j < self.abilities()[i].attributes().length; j++) {
                            var attribute = self.abilities()[i].attributes()[j];
                            switch(attribute.name()) {
                                // bloodseeker_bloodrage
                                case 'damage_increase_pct':
                                    if (ability.name() == 'bloodseeker_bloodrage') {
                                        totalAttribute *= (1 + self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100);
                                    }
                                break;
                            }
                        }
                        // kunkka_ghostship
                        if (ability.name() == 'kunkka_ghostship') {
                            totalAttribute *= (1 - 50/100);
                        }
                    }
                }
                else if (ability.damageReduction != undefined) {
                    if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                        // wisp_overcharge,bristleback_bristleback,spectre_dispersion,medusa_mana_shield
                        totalAttribute *= (1 + ability.damageReduction()/100);
                    }
                }
            }
            return totalAttribute;
        });

        self.getCritSource = ko.computed(function () {
            var sources = {};
            for (var i = 0; i < self.abilities().length; i++) {
                var ability = self.abilities()[i];
                if (!(ability.name() in self.abilityData)) {
                    if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                        switch(ability.name()) {
                            // phantom_assassin_coup_de_grace,brewmaster_drunken_brawler,chaos_knight_chaos_strike,lycan_shapeshift,skeleton_king_mortal_strike,juggernaut_blade_dance,alpha_wolf_critical_strike,giant_wolf_critical_strike
                            case 'phantom_assassin_coup_de_grace':
                                if (sources[ability.name()] == undefined) {
                                    sources[ability.name()] = {
                                        'chance': self.getAbilityAttributeValue(self.abilities()[i].attributes(), 'crit_chance', ability.level())/100,
                                        'multiplier': self.getAbilityAttributeValue(self.abilities()[i].attributes(), 'crit_bonus', ability.level())/100,
                                        'count': 1,
                                        'displayname': ability.displayname()
                                    }
                                }
                                else {
                                    sources[ability.name()].count += 1;
                                }
                            break;
                            case 'brewmaster_drunken_brawler':
                                if (sources[ability.name()] == undefined) {
                                    sources[ability.name()] = {
                                        'chance': self.getAbilityAttributeValue(self.abilities()[i].attributes(), 'crit_chance', ability.level())/100,
                                        'multiplier': self.getAbilityAttributeValue(self.abilities()[i].attributes(), 'crit_multiplier', ability.level())/100,
                                        'count': 1,
                                        'displayname': ability.displayname()
                                    }
                                }
                                else {
                                    sources[ability.name()].count += 1;
                                }
                            break;
                            case 'chaos_knight_chaos_strike':
                            case 'lycan_shapeshift':
                                if (sources[ability.name()] == undefined) {
                                    sources[ability.name()] = {
                                        'chance': self.getAbilityAttributeValue(self.abilities()[i].attributes(), 'crit_chance', ability.level())/100,
                                        'multiplier': self.getAbilityAttributeValue(self.abilities()[i].attributes(), 'crit_multiplier', ability.level())/100,
                                        'count': 1,
                                        'displayname': ability.displayname()
                                    }
                                }
                                else {
                                    sources[ability.name()].count += 1;
                                }
                            break;
                            case 'skeleton_king_mortal_strike':
                                if (sources[ability.name()] == undefined) {
                                    sources[ability.name()] = {
                                        'chance': self.getAbilityAttributeValue(self.abilities()[i].attributes(), 'crit_chance', ability.level())/100,
                                        'multiplier': self.getAbilityAttributeValue(self.abilities()[i].attributes(), 'crit_mult', ability.level())/100,
                                        'count': 1,
                                        'displayname': ability.displayname()
                                    }
                                }
                                else {
                                    sources[ability.name()].count += 1;
                                }
                            break;
                            case 'juggernaut_blade_dance':
                                if (sources[ability.name()] == undefined) {
                                    sources[ability.name()] = {
                                        'chance': self.getAbilityAttributeValue(self.abilities()[i].attributes(), 'blade_dance_crit_chance', ability.level())/100,
                                        'multiplier': self.getAbilityAttributeValue(self.abilities()[i].attributes(), 'blade_dance_crit_mult', ability.level())/100,
                                        'count': 1,
                                        'displayname': ability.displayname()
                                    }
                                }
                                else {
                                    sources[ability.name()].count += 1;
                                }
                            break;
                            case 'alpha_wolf_critical_strike':
                            case 'giant_wolf_critical_strike':
                                if (sources[ability.name()] == undefined) {
                                    sources[ability.name()] = {
                                        'chance': self.getAbilityAttributeValue(self.abilities()[i].attributes(), 'crit_chance', ability.level())/100,
                                        'multiplier': self.getAbilityAttributeValue(self.abilities()[i].attributes(), 'crit_mult', ability.level())/100,
                                        'count': 1,
                                        'displayname': ability.displayname()
                                    }
                                }
                                else {
                                    sources[ability.name()].count += 1;
                                }
                            break;
                        }
                    }
                }
            }
            return sources;
        });    

        self.getCleaveSource = ko.computed(function () {
            var sources = {};
            for (var i = 0; i < self.abilities().length; i++) {
                var ability = self.abilities()[i];
                if (!(ability.name() in self.abilityData)) {
                    if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                        switch(ability.name()) {
                            // magnataur_empower
                            case 'magnataur_empower':
                                if (sources[ability.name()] == undefined) {
                                    sources[ability.name()] = {
                                        'radius': self.getAbilityAttributeValue(self.abilities()[i].attributes(), 'cleave_radius', ability.level()),
                                        'magnitude': self.getAbilityAttributeValue(self.abilities()[i].attributes(), 'cleave_damage_pct', ability.level())/100,
                                        'count': 1,
                                        'displayname': ability.displayname()
                                    }
                                }
                                else {
                                    sources[ability.name()].count += 1;
                                }
                            break;
                            // sven_great_cleave
                            case 'sven_great_cleave':
                                if (sources[ability.name()] == undefined) {
                                    sources[ability.name()] = {
                                        'radius': self.getAbilityAttributeValue(self.abilities()[i].attributes(), 'great_cleave_radius', ability.level()),
                                        'magnitude': self.getAbilityAttributeValue(self.abilities()[i].attributes(), 'great_cleave_damage', ability.level())/100,
                                        'count': 1,
                                        'displayname': ability.displayname()
                                    }
                                }
                                else {
                                    sources[ability.name()].count += 1;
                                }
                            break;
                            // kunkka_tidebringer
                            case 'kunkka_tidebringer':
                                if (sources[ability.name()] == undefined) {
                                    sources[ability.name()] = {
                                        'radius': self.getAbilityAttributeValue(self.abilities()[i].attributes(), 'radius', ability.level()),
                                        'magnitude': 1,
                                        'count': 1,
                                        'displayname': ability.displayname()
                                    }
                                }
                                else {
                                    sources[ability.name()].count += 1;
                                }
                            break;
                            // tiny_grow
                            case 'tiny_grow':
                                if (self.hasScepter()) {
                                    if (sources[ability.name()] == undefined) {
                                        sources[ability.name()] = {
                                            'radius': self.getAbilityAttributeValue(self.abilities()[i].attributes(), 'bonus_cleave_radius_scepter', ability.level()),
                                            'magnitude': self.getAbilityAttributeValue(self.abilities()[i].attributes(), 'bonus_cleave_damage_scepter', ability.level())/100,
                                            'count': 1,
                                            'displayname': ability.displayname()
                                        }
                                    }
                                    else {
                                        sources[ability.name()].count += 1;
                                    }
                                }
                            break;
                        }
                    }
                }
            }
            return sources;
        });    
        
        self.getCritChance = ko.computed(function () {
            var totalAttribute = 1;
            for (var i = 0; i < self.abilities().length; i++) {
                var ability = self.abilities()[i];
                if (!(ability.name() in self.abilityData)) {
                    if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                        for (var j = 0; j < self.abilities()[i].attributes().length; j++) {
                            var attribute = self.abilities()[i].attributes()[j];
                            switch(attribute.name()) {
                                // phantom_assassin_coup_de_grace,brewmaster_drunken_brawler,chaos_knight_chaos_strike,lycan_shapeshift,skeleton_king_mortal_strike
                                case 'crit_chance':
                                    totalAttribute *= (1 - self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100);
                                break;
                            }
                        }
                    }
                }
            }
            return totalAttribute;
        });            
        
        self.getEvasion = ko.computed(function () {
            var totalAttribute = 1;
            for (var i = 0; i < self.abilities().length; i++) {
                var ability = self.abilities()[i];
                if (!(ability.name() in self.abilityData)) {
                    if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                        for (var j = 0; j < self.abilities()[i].attributes().length; j++) {
                            var attribute = self.abilities()[i].attributes()[j];
                            switch(attribute.name()) {
                                // phantom_assassin_blur
                                case 'bonus_evasion':
                                // brewmaster_drunken_brawler
                                case 'dodge_chance':
                                    totalAttribute *= (1 - self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100);
                                break;
                            }
                        }
                    }
                }
            }
            return totalAttribute;
        });
        
        self.getEvasionBacktrack = ko.computed(function () {
            var totalAttribute = 1;
            for (var i = 0; i < self.abilities().length; i++) {
                var ability = self.abilities()[i];
                if (!(ability.name() in self.abilityData)) {
                    if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                        for (var j = 0; j < self.abilities()[i].attributes().length; j++) {
                            var attribute = self.abilities()[i].attributes()[j];
                            switch(attribute.name()) {
                                // faceless_void_backtrack
                                case 'dodge_chance_pct':
                                    totalAttribute *= (1 - self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100);
                                break;
                            }
                        }
                    }
                }
            }
            return totalAttribute;
        });
        
        self.getMissChance = ko.computed(function () {
            var totalAttribute = 1;
            for (var i = 0; i < self.abilities().length; i++) {
                var ability = self.abilities()[i];
                if (!(ability.name() in self.abilityData)) {
                    if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                        for (var j = 0; j < self.abilities()[i].attributes().length; j++) {
                            var attribute = self.abilities()[i].attributes()[j];
                            switch(attribute.name()) {
                                // broodmother_incapacitating_bite,brewmaster_drunken_haze
                                case 'miss_chance':
                                // riki_smoke_screen,keeper_of_the_light_blinding_light,tinker_laser
                                case 'miss_rate':
                                    totalAttribute *= (1 - self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100);
                                break;
                            }
                        }
                    }
                }
                else if (ability.missChance != undefined) {
                    if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                        // night_stalker_crippling_fear
                        totalAttribute*=(1-ability.missChance()/100);
                    }
                }
            }
            return totalAttribute;
        });
        
        self.getLifesteal = ko.computed(function () {
            var totalAttribute = 0;
            for (var i = 0; i < self.abilities().length; i++) {
                var ability = self.abilities()[i];
                if (!(ability.name() in self.abilityData)) {
                    if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                        for (var j = 0; j < self.abilities()[i].attributes().length; j++) {
                            var attribute = self.abilities()[i].attributes()[j];
                            switch(attribute.name()) {
                                // skeleton_king_vampiric_aura
                                case 'vampiric_aura':
                                // broodmother_insatiable_hunger
                                case 'lifesteal_pct':
                                    totalAttribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
                                break;
                            }
                        }
                    }
                }
                else if (ability.lifesteal != undefined) {
                    if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                        // life_stealer_open_wounds
                        totalAttribute+=ability.lifesteal();
                    }
                }
            }
            return totalAttribute;
        });
        
        self.getMagicResist = ko.computed(function () {
            var totalAttribute = 1;
            for (var i = 0; i < self.abilities().length; i++) {
                var ability = self.abilities()[i];
                if (!(ability.name() in self.abilityData)) {
                    if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                        for (var j = 0; j < self.abilities()[i].attributes().length; j++) {
                            var attribute = self.abilities()[i].attributes()[j];
                            switch(attribute.name()) {
                                // antimage_spell_shield
                                case 'spell_shield_resistance':
                                    totalAttribute *= (1 - self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100);
                                break;
                                // phantom_lancer_phantom_edge
                                case 'magic_resistance_pct':
                                    if (ability.name() == 'phantom_lancer_phantom_edge') {
                                        totalAttribute *= (1 - self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100);
                                    }
                                break;
                                // rubick_null_field
                                case 'magic_damage_reduction_pct':
                                    if (ability.name() == 'rubick_null_field') {
                                        totalAttribute *= (1 - self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100);
                                    }
                                break;
                            }
                        }
                    }
                }
                else if (ability.magicResist != undefined) {
                    if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                        // huskar_berserkers_blood,viper_corrosive_skin,visage_gravekeepers_cloak
                        totalAttribute *= (1 - ability.magicResist()/100);
                    }
                }
            }
            return totalAttribute;
        });

        self.getMagicResistReduction = ko.computed(function () {
            var totalAttribute = 1;
            for (var i = 0; i < self.abilities().length; i++) {
                var ability = self.abilities()[i];
                if (!(ability.name() in self.abilityData)) {
                    if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                        for (var j = 0; j < self.abilities()[i].attributes().length; j++) {
                            var attribute = self.abilities()[i].attributes()[j];
                            switch(attribute.name()) {
                                // ancient_apparition_ice_vortex
                                case 'spell_resist_pct':
                                // pugna_decrepify
                                case 'bonus_spell_damage_pct':
                                // skywrath_mage_ancient_seal
                                case 'resist_debuff':
                                    totalAttribute *= (1 - self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100);
                                break;
                                // elder_titan_natural_order
                                case 'magic_resistance_pct':
                                    totalAttribute *= (1 - self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100);
                                break;
                            }
                        }
                    }
                }
            }
            return totalAttribute;
        });
        
        self.getMovementSpeedFlat = ko.computed(function () {
            var totalAttribute = 0;
            for (var i = 0; i < self.abilities().length; i++) {
                var ability = self.abilities()[i];
                if (!(ability.name() in self.abilityData)) {
                    if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                        for (var j = 0; j < self.abilities()[i].attributes().length; j++) {
                            var attribute = self.abilities()[i].attributes()[j];
                            switch(attribute.name()) {
                                // alchemist_chemical_rage
                                case 'bonus_movespeed':
                                    if (ability.name() == 'alchemist_chemical_rage') {
                                        totalAttribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
                                    }
                                break;
                                // tiny_grow
                                case 'bonus_movement_speed':
                                    if (ability.name() == 'tiny_grow') {
                                        totalAttribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
                                    }
                                break;
                                // troll_warlord_berserkers_rage
                                case 'bonus_move_speed':
                                    if (ability.name() == 'troll_warlord_berserkers_rage') {
                                        totalAttribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
                                    }                                
                                break;
                                // lone_druid_true_form
                                case 'speed_loss':
                                    totalAttribute -= self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
                                break;
                            }
                        }
                    }
                }
                else if (ability.movementSpeedFlat != undefined) {
                    // dragon_knight_elder_dragon_form
                    if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                        totalAttribute+=ability.movementSpeedFlat();
                    }
                }
            }
            return totalAttribute;
        });
        
        self.getMovementSpeedPercent = ko.computed(function () {
            var totalAttribute = 0;
            for (var i = 0; i < self.abilities().length; i++) {
                var ability = self.abilities()[i];
                if (!(ability.name() in self.abilityData)) {
                    if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                        for (var j = 0; j < self.abilities()[i].attributes().length; j++) {
                            var attribute = self.abilities()[i].attributes()[j];
                            switch(attribute.name()) {
                                // abaddon_frostmourne 
                                case 'move_speed_pct':
                                // bounty_hunter_track 
                                case 'bonus_move_speed_pct':
                                // mirana_leap 
                                case 'leap_speedbonus':
                                // sven_warcry 
                                case 'warcry_movespeed':
                                // clinkz_wind_walk
                                case 'move_speed_bonus_pct':
                                // windrunner_windrun
                                case 'movespeed_bonus_pct':
                                    totalAttribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100;
                                break;
                                // broodmother_spin_web,spectre_spectral_dagger
                                case 'bonus_movespeed':
                                    if (ability.name() == 'broodmother_spin_web' || ability.name() == 'spectre_spectral_dagger') {
                                        totalAttribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100;
                                    }
                                break;
                                // axe_culling_blade,necronomicon_archer_aoe
                                case 'speed_bonus':
                                    if (ability.name() == 'axe_culling_blade' || ability.name() == 'necronomicon_archer_aoe') {
                                        totalAttribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100;
                                    }
                                break;
                                // nyx_assassin_vendetta 
                                case 'movement_speed':
                                    if (ability.name() == 'nyx_assassin_vendetta') {
                                        totalAttribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100;
                                    }
                                break;
                                // spirit_breaker_empowering_haste
                                case 'bonus_movespeed_pct':
                                    if (ability.name() == 'spirit_breaker_empowering_haste') {
                                        totalAttribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100;
                                    }
                                break;
                                // ogre_magi_bloodlust,death_prophet_witchcraft,kobold_taskmaster_speed_aura
                                case 'bonus_movement_speed':
                                    if (ability.name() == 'ogre_magi_bloodlust' || ability.name() == 'death_prophet_witchcraft' || ability.name() == 'kobold_taskmaster_speed_aura') {
                                        totalAttribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100;
                                    }
                                break;
                                // razor_unstable_current,phantom_lancer_doppelwalk
                                case 'movement_speed_pct':
                                    if (ability.name() == 'razor_unstable_current' || ability.name() == 'phantom_lancer_doppelwalk') {
                                        totalAttribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100;
                                    }
                                break;
                                // treant_natures_guise,lone_druid_rabid
                                case 'bonus_move_speed':
                                    if (ability.name() == 'treant_natures_guise' || ability.name() == 'lone_druid_rabid') {
                                        totalAttribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100;
                                    }
                                break;
                                // wisp_tether
                                case 'movespeed':
                                    if (ability.name() == 'wisp_tether') {
                                        totalAttribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100;
                                    }
                                break;
                                // kunkka_ghostship,visage_grave_chill
                                case 'movespeed_bonus':
                                    if (ability.name() == 'kunkka_ghostship' || ability.name() == 'visage_grave_chill') {
                                        totalAttribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100;
                                    }                                
                                break;
                            }
                        }
                    }
                }
                else if (ability.movementSpeedPct != undefined) {
                    // axe_battle_hunger,bristleback_warpath,spirit_breaker_greater_bash,lina_fiery_soul,invoker_ghost_walk,invoker_wex,elder_titan_ancestral_spirit
                    if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                        totalAttribute+=ability.movementSpeedPct()/100;
                    }
                }
            }
            return totalAttribute;
        });

        self.getMovementSpeedPercentReduction = ko.computed(function () {
            var totalAttribute = 0;
            for (var i = 0; i < self.abilities().length; i++) {
                var ability = self.abilities()[i];
                if (!(ability.name() in self.abilityData)) {
                    if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                        for (var j = 0; j < self.abilities()[i].attributes().length; j++) {
                            var attribute = self.abilities()[i].attributes()[j];
                            switch(attribute.name()) {
                                // crystal_maiden_freezing_field
                                case 'movespeed_slow':
                                    if (ability.name() == 'crystal_maiden_freezing_field' && !self.hasScepter()) {
                                        totalAttribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100;
                                    }
                                break;
                                case 'movespeed_slow_scepter':
                                    if (ability.name() == 'crystal_maiden_freezing_field' && self.hasScepter()) {
                                        totalAttribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100;
                                    }
                                break;
                                // elder_titan_earth_splitter,magnataur_skewer,abaddon_frostmourne 
                                case 'slow_pct':
                                    totalAttribute -= self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100;
                                break;
                                // night_stalker_void,crystal_maiden_crystal_nova,ghost_frost_attack,ogre_magi_frost_armor,polar_furbolg_ursa_warrior_thunder_clap
                                case 'movespeed_slow':
                                    if (ability.name() != 'crystal_maiden_freezing_field') {
                                        totalAttribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100;
                                    }
                                break;
                                // lich_frost_armor,lich_frost_nova,enchantress_enchant
                                case 'slow_movement_speed':
                                // beastmaster_primal_roar
                                case 'slow_movement_speed_pct':
                                // drow_ranger_frost_arrows
                                case 'frost_arrows_movement_speed':
                                // skeleton_king_hellfire_blast
                                case 'blast_slow':
                                // slardar_slithereen_crush
                                case 'crush_extra_slow':
                                // storm_spirit_overload:
                                case 'overload_move_slow':
                                // windrunner_windrun
                                case 'enemy_movespeed_bonus_pct':
                                    totalAttribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100;
                                break;
                                // phantom_assassin_stifling_dagger,tusk_frozen_sigil
                                case 'move_slow':
                                    if (ability.name() == 'phantom_assassin_stifling_dagger') {
                                        totalAttribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100;
                                    }
                                    else if (ability.name() == 'tusk_frozen_sigil') {
                                        totalAttribute -= self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100;
                                    }
                                break;
                                // invoker_ice_wall,medusa_stone_gaze,wisp_tether
                                case 'slow':
                                    if (ability.name() == 'medusa_stone_gaze') {
                                        totalAttribute -= self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100;
                                    }
                                    else {
                                        totalAttribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100;
                                    }
                                break;
                                // broodmother_incapacitating_bite,bounty_hunter_jinada,spectre_spectral_dagger,winter_wyvern_arctic_burn
                                case 'bonus_movespeed':
                                    if (ability.name() == 'broodmother_incapacitating_bite' || ability.name() == 'bounty_hunter_jinada' || ability.name() == 'winter_wyvern_arctic_burn' || ability.name() == 'winter_wyvern_splinter_blast') {
                                        totalAttribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100;
                                    }
                                    else if (ability.name() == 'spectre_spectral_dagger') {
                                        totalAttribute -= self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100;
                                    }
                                break;
                                // omniknight_degen_aura
                                case 'speed_bonus':
                                    if (ability.name() == 'omniknight_degen_aura') {
                                        totalAttribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100;
                                    }
                                break;
                                // tidehunter_gush
                                case 'movement_speed':
                                    if (ability.name() == 'tidehunter_gush') {
                                        totalAttribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100;
                                    }
                                break;
                                // pugna_decrepify,chen_penitence
                                case 'bonus_movement_speed':
                                    if (ability.name() == 'pugna_decrepify' || ability.name() == 'chen_penitence') {
                                        totalAttribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100;
                                    }
                                break;
                                // ancient_apparition_ice_vortex,phantom_lancer_spirit_lance,skywrath_mage_concussive_shot,faceless_void_time_walk
                                case 'movement_speed_pct':
                                    if (ability.name() == 'ancient_apparition_ice_vortex' || ability.name() == 'phantom_lancer_spirit_lance' || ability.name() == 'faceless_void_time_walk') {
                                        totalAttribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100;
                                    }
                                    else if (ability.name() == 'skywrath_mage_concussive_shot') {
                                        totalAttribute -= self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100;
                                    }
                                break;
                                // razor_unstable_current
                                case 'slow_amount':
                                    if (ability.name() == 'razor_unstable_current') {
                                        totalAttribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100;
                                    }
                                break;
                                // brewmaster_drunken_haze,brewmaster_thunder_clap,treant_leech_seed
                                case 'movement_slow':
                                    if (ability.name() == 'brewmaster_drunken_haze' || ability.name() == 'brewmaster_thunder_clap') {
                                        totalAttribute -= self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100;
                                    }
                                    else if (ability.name() == 'ursa_earthshock' || ability.name() == 'treant_leech_seed') {
                                        totalAttribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100;
                                    }
                                break;
                                // skeleton_king_reincarnation
                                case 'movespeed':
                                    if (ability.name() == 'skeleton_king_reincarnation') {
                                        totalAttribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100;
                                    }
                                break;
                                // kunkka_torrent,visage_grave_chill
                                case 'movespeed_bonus':
                                    if (ability.name() == 'kunkka_torrent') {
                                        totalAttribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100;
                                    }
                                    else if (ability.name() == 'visage_grave_chill') {
                                        totalAttribute -= self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100;
                                    }
                                break;
                            }
                        }
                        if (ability.name() == 'satyr_trickster_purge') {
                            totalAttribute -= 80/100;
                        }
                        else if (ability.name() == 'enraged_wildkin_tornado') {
                            totalAttribute -= 15/100;
                        }
                    }
                }
                else if (ability.movementSpeedPctReduction != undefined) {
                    if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                        // axe_battle_hunger,batrider_sticky_napalm,shredder_chakram,meepo_geostrike,life_stealer_open_wounds,
                        // venomancer_poison_sting,viper_viper_strike,viper_corrosive_skin,viper_poison_attack,venomancer_venomous_gale,treant_leech_seed
                        // lich_chain_frost,sniper_shrapnel,centaur_stampede,huskar_life_break,jakiro_dual_breath,meepo_geostrike,sandking_epicenter
                        // earth_spirit_rolling_boulder,invoker_ghost_walk,invoker_ice_wall,elder_titan_earth_splitter
                        // undying_flesh_golem
                        totalAttribute+=ability.movementSpeedPctReduction()/100;
                    }
                }
            }
            return totalAttribute;
        });

        self.getTurnRateReduction = ko.computed(function () {
            var totalAttribute = 0;
            for (var i = 0; i < self.abilities().length; i++) {
                var ability = self.abilities()[i];
                if (!(ability.name() in self.abilityData)) {
                    if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                        for (var j = 0; j < self.abilities()[i].attributes().length; j++) {
                            var attribute = self.abilities()[i].attributes()[j];
                            switch(attribute.name()) {
                                // medusa_stone_gaze
                                case 'slow':
                                    if (ability.name() == 'medusa_stone_gaze') {
                                        totalAttribute -= self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100;
                                    }
                                break;
                            }
                        }
                    }
                }
                else if (ability.turnRateReduction != undefined) {
                    if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                        // batrider_sticky_napalm
                        totalAttribute+=ability.turnRateReduction()/100;
                    }
                }
            }
            return totalAttribute;
        });
        
        self.getVisionRangeNight = ko.computed(function () {
            var totalAttribute = 0;
            for (var i = 0; i < self.abilities().length; i++) {
                var ability = self.abilities()[i];
                if (!(ability.name() in self.abilityData)) {
                    if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                        for (var j = 0; j < self.abilities()[i].attributes().length; j++) {
                            var attribute = self.abilities()[i].attributes()[j];
                            switch(attribute.name()) {
                                // winter_wyvern_arctic_burn
                                case 'night_vision_bonus':
                                // lycan_shapeshift,luna_lunar_blessing
                                case 'bonus_night_vision':
                                    totalAttribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level());
                                break;
                            }
                        }
                    }
                }
                else if (ability.visionnight != undefined) {
                    if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                        // 
                        totalAttribute+=ability.visionnight();
                    }
                }
            }
            return totalAttribute;
        });

        self.getVisionRangePctReduction = ko.computed(function () {
            var totalAttribute = 0;
            for (var i = 0; i < self.abilities().length; i++) {
                var ability = self.abilities()[i];
                if (!(ability.name() in self.abilityData)) {
                    if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                        for (var j = 0; j < self.abilities()[i].attributes().length; j++) {
                            var attribute = self.abilities()[i].attributes()[j];
                            switch(attribute.name()) {
                                // night_stalker_darkness
                                case 'blind_percentage':
                                    totalAttribute += self.getAbilityAttributeValue(self.abilities()[i].attributes(), attribute.name(), ability.level())/100;
                                break;
                            }
                        }
                    }
                }
            }
            return totalAttribute;
        });

        self.setEvasion = ko.computed(function () {
            var totalAttribute = 0;
            for (var i = 0; i < self.abilities().length; i++) {
                var ability = self.abilities()[i];
                if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                    if (ability.name() == 'windrunner_windrun') {
                        return 1;
                    }
                }
            }
            return totalAttribute;
        });
        
        self.setMovementSpeed = ko.computed(function () {
            var MAX_MOVESPEED = 522;
            var MIN_MOVESPEED = 100;
            var totalAttribute = 0;
            for (var i = 0; i < self.abilities().length; i++) {
                var ability = self.abilities()[i];
                if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                    if (ability.name() == 'spirit_breaker_charge_of_darkness') {
                        return self.getAbilityAttributeValue(ability.attributes(), 'movement_speed', ability.level());
                    }
                    if (ability.name() == 'dark_seer_surge') {
                        return MAX_MOVESPEED;
                    }
                    if (ability.name() == 'centaur_stampede') {
                        return MAX_MOVESPEED;
                    }
                    if (ability.name() == 'lycan_shapeshift') {
                        return MAX_MOVESPEED;
                    }
                    if (ability.name() == 'lion_voodoo' || ability.name() == 'shadow_shaman_voodoo') {
                        return MIN_MOVESPEED;
                    }
                }
            }
            return totalAttribute;
        });

        self.getBashSource = function (attacktype) {
            var sources = {};
            for (var i = 0; i < self.abilities().length; i++) {
                var ability = self.abilities()[i];
                if (!(ability.name() in self.abilityData)) {
                    if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                        for (var j = 0; j < self.abilities()[i].attributes().length; j++) {
                            var attribute = self.abilities()[i].attributes()[j];
                            switch(attribute.name()) {
                                // sniper_headshot
                                case 'proc_chance':
                                    if (sources[ability.name()] == undefined && ability.name() == 'sniper_headshot') {
                                        sources[ability.name()] = {
                                            'chance': self.getAbilityAttributeValue(ability.attributes(), attribute.name(), ability.level())/100,
                                            'damage': self.getAbilityPropertyValue(ability, 'damage'),
                                            'count': 1,
                                            'damageType': 'physical',
                                            'displayname': ability.displayname()
                                        }
                                    }
                                break;
                                // slardar_bash
                                case 'chance':
                                    if (sources[ability.name()] == undefined && ability.name() == 'slardar_bash') {
                                        sources[ability.name()] = {
                                            'chance': self.getAbilityAttributeValue(ability.attributes(), attribute.name(), ability.level())/100,
                                            'damage': self.getAbilityAttributeValue(ability.attributes(), 'bonus_damage', ability.level()),
                                            'count': 1,
                                            'damageType': 'physical',
                                            'displayname': ability.displayname()
                                        }
                                    }
                                break;
                            }
                        }
                    }
                }
                else if (ability.bashBonusDamage != undefined) {
                    if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                        // faceless_void_time_lock
                        if (sources[ability.name()] == undefined && ability.name() == 'faceless_void_time_lock') {
                            sources[ability.name()] = {
                                'chance': ability.bash()/100,
                                'damage': ability.bashBonusDamage(),
                                'count': 1,
                                'damageType': 'magic',
                                'displayname': ability.displayname()
                            }
                        }
                        // spirit_breaker_greater_bash
                        if (sources[ability.name()] == undefined && ability.name() == 'spirit_breaker_greater_bash') {
                            sources[ability.name()] = {
                                'chance': ability.bash()/100,
                                'damage': ability.bashBonusDamage()/100,
                                'count': 1,
                                'damageType': 'magic',
                                'displayname': ability.displayname()
                            }
                        }
                    }
                }
            }

            return sources;
        };
        
        self.getOrbSource = function () {
            var sources = {};
            for (var i = 0; i < self.abilities().length; i++) {
                var ability = self.abilities()[i];
                if (!(ability.name() in self.abilityData)) {
                    if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                        for (var j = 0; j < self.abilities()[i].attributes().length; j++) {
                            var attribute = self.abilities()[i].attributes()[j];
                            switch(attribute.name()) {
                                // antimage_mana_break
                                case 'mana_per_hit':
                                    if (sources[ability.name()] == undefined && ability.name() == 'antimage_mana_break') {
                                        sources[ability.name()] = {
                                            'damage': self.getAbilityAttributeValue(ability.attributes(), attribute.name(), ability.level()) 
                                                    * self.getAbilityAttributeValue(ability.attributes(), 'damage_per_burn', ability.level()),
                                            'damageType': 'physical',
                                            'displayname': ability.displayname()
                                        }
                                    }
                                break;
                                // clinkz_searing_arrows
                                case 'damage_bonus':
                                    if (sources[ability.name()] == undefined && ability.name() == 'clinkz_searing_arrows') {
                                        sources[ability.name()] = {
                                            'damage': self.getAbilityAttributeValue(ability.attributes(), attribute.name(), ability.level()),
                                            'damageType': 'physical',
                                            'displayname': ability.displayname()
                                        }
                                    }
                                // silencer_glaives_of_wisdom
                                case 'intellect_damage_pct':
                                    if (sources[ability.name()] == undefined && ability.name() == 'silencer_glaives_of_wisdom') {
                                        sources[ability.name()] = {
                                            'damage': self.getAbilityAttributeValue(ability.attributes(), attribute.name(), ability.level())/100 * self.hero.totalInt(),
                                            'damageType': 'pure',
                                            'displayname': ability.displayname()
                                        }
                                    }
                                break;
                            }
                        }
                    }
                }
                else if (ability.bonusDamageOrb != undefined) {
                    if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                        // obsidian_destroyer_arcane_orb
                        if (sources[ability.name()] == undefined && ability.name() == 'obsidian_destroyer_arcane_orb') {
                            sources[ability.name()] = {
                                'damage': ability.bonusDamageOrb(),
                                'damageType': 'pure',
                                'displayname': ability.displayname()
                            }
                        }
                    }
                }
            }
            
            return sources;
        };
        
        self.toggleAbility = function (index, data, event) {
            if (self.abilities()[index()].behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') < 0) {
                if (self.abilities()[index()].isActive()) {
                    self.abilities()[index()].isActive(false);
                }
                else {
                    self.abilities()[index()].isActive(true);
                }
                
                if (self.abilities()[index()].name() == 'lycan_shapeshift') {
                    self.isShapeShiftActive(self.abilities()[index()].isActive());
                }
            }
        }.bind(this);

        self.toggleAbilityDetail = function (index, data, event) {
            if (self.abilities()[index()].isDetail()) {
                self.abilities()[index()].isDetail(false);
            }
            else {
                self.abilities()[index()].isDetail(true);
            }
        }.bind(this);
        
        self.getAbilityTooltipData = function (hero, el) {
            return my.getAbilityTooltipData(hero, el);
        }

        self.levelUpAbility = function (index, data, event, hero) {
            if (self.abilities()[index()].level() < hero.getAbilityLevelMax(data) && hero.availableSkillPoints() > 0 ) {
                switch(self.abilities()[index()].abilitytype()) {
                    case 'DOTA_ABILITY_TYPE_ULTIMATE':
                        if (hero.selectedHero().heroName == 'invoker') {
                            if (
                                (self.abilities()[index()].level() == 0) && (parseInt(hero.selectedHeroLevel()) >= 2) ||
                                (self.abilities()[index()].level() == 1) && (parseInt(hero.selectedHeroLevel()) >= 7) ||
                                (self.abilities()[index()].level() == 2) && (parseInt(hero.selectedHeroLevel()) >= 11) ||
                                (self.abilities()[index()].level() == 3) && (parseInt(hero.selectedHeroLevel()) >= 17)
                            ) {
                                self.abilities()[index()].level(self.abilities()[index()].level()+1);
                                hero.skillPointHistory.push(index());
                            }
                        }
                        else if (hero.selectedHero().heroName == 'meepo') {
                            if (self.abilities()[index()].level() * 7 + 3 <= parseInt(hero.selectedHeroLevel())) {
                                self.abilities()[index()].level(self.abilities()[index()].level()+1);
                                hero.skillPointHistory.push(index());
                            }
                        }
                        else {
                            if ((self.abilities()[index()].level()+1) * 5 + 1 <= parseInt(hero.selectedHeroLevel())) {
                                self.abilities()[index()].level(self.abilities()[index()].level()+1);
                                hero.skillPointHistory.push(index());
                            }
                        }
                    break;
                    default:
                        if (self.abilities()[index()].level() * 2 + 1 <= parseInt(hero.selectedHeroLevel())) {
                            self.abilities()[index()].level(self.abilities()[index()].level()+1);
                            hero.skillPointHistory.push(index());
                        }
                    break;
                }
                switch (self.abilities()[index()].name()) {
                    case 'beastmaster_call_of_the_wild':
                    case 'chen_test_of_faith':
                    case 'morphling_morph_agi':
                    case 'shadow_demon_shadow_poison':
                        self.abilities()[index() + 1].level(self.abilities()[index()].level());
                    break;
                    case 'morphling_morph_str':
                        self.abilities()[index() - 1].level(self.abilities()[index()].level());
                    break;
                    case 'keeper_of_the_light_spirit_form':
                        self.abilities()[index() - 1].level(self.abilities()[index()].level());
                        self.abilities()[index() - 2].level(self.abilities()[index()].level());
                    case 'nevermore_shadowraze1':
                        self.abilities()[index() + 1].level(self.abilities()[index()].level());
                        self.abilities()[index() + 2].level(self.abilities()[index()].level());
                    break;
                    case 'nevermore_shadowraze2':
                        self.abilities()[index() - 1].level(self.abilities()[index()].level());
                        self.abilities()[index() + 1].level(self.abilities()[index()].level());
                    break;
                    case 'nevermore_shadowraze3':
                        self.abilities()[index() - 1].level(self.abilities()[index()].level());
                        self.abilities()[index() - 2].level(self.abilities()[index()].level());
                    break;
                    case 'ember_spirit_fire_remnant':
                        self.abilities()[index() - 1].level(self.abilities()[index()].level());
                    break;
                    case 'lone_druid_true_form':
                        self.abilities()[index() - 1].level(self.abilities()[index()].level());
                    break;
                }
            }
        };
        self.levelDownAbility = function (index, data, event, hero) {
            if (self.abilities()[index()].level() > 0) {
                self.abilities()[index()].level(self.abilities()[index()].level() - 1);
                hero.skillPointHistory.splice(hero.skillPointHistory().lastIndexOf(index()), 1);
                switch (self.abilities()[index()].name()) {
                    case 'beastmaster_call_of_the_wild':
                    case 'chen_test_of_faith':
                    case 'morphling_morph_agi':
                    case 'shadow_demon_shadow_poison':
                        self.abilities()[index() + 1].level(self.abilities()[index()].level());
                    break;
                    case 'morphling_morph_str':
                        self.abilities()[index() - 1].level(self.abilities()[index()].level());
                    break;
                    case 'keeper_of_the_light_spirit_form':
                        self.abilities()[index() - 1].level(self.abilities()[index()].level());
                        self.abilities()[index() - 2].level(self.abilities()[index()].level());
                    case 'nevermore_shadowraze1':
                        self.abilities()[index() + 1].level(self.abilities()[index()].level());
                        self.abilities()[index() + 2].level(self.abilities()[index()].level());
                    break;
                    case 'nevermore_shadowraze2':
                        self.abilities()[index() - 1].level(self.abilities()[index()].level());
                        self.abilities()[index() + 1].level(self.abilities()[index()].level());
                    break;
                    case 'nevermore_shadowraze3':
                        self.abilities()[index() - 1].level(self.abilities()[index()].level());
                        self.abilities()[index() - 2].level(self.abilities()[index()].level());
                    break;
                    case 'ember_spirit_fire_remnant':
                        self.abilities()[index() - 1].level(self.abilities()[index()].level());
                    break;
                    case 'lone_druid_true_form':
                        self.abilities()[index() - 1].level(self.abilities()[index()].level());
                    break;
                }
            }
        };
		
		self.isQWER = function (ability) {
			return (ability.displayname() != 'Empty' &&  (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_HIDDEN') == -1 || ability.name().indexOf('invoker_') != -1) && ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_NOT_LEARNABLE') == -1)
		}
    }

    return my;
}(HEROCALCULATOR));
var HEROCALCULATOR = (function (my) {

    my.BuffOption = function (hero, ability) {
        this.buffName = ability;
        if (my.heroData['npc_dota_hero_' + hero] == undefined) {
            this.hero = hero;
            this.abilityData = _.findWhere(my.unitData[hero].abilities, {name: ability})
            this.buffDisplayName = my.unitData[hero].displayname + ' - ' + this.abilityData.displayname;
        }
        else {
            this.hero = 'npc_dota_hero_' + hero;
            this.abilityData = _.findWhere(my.heroData['npc_dota_hero_' + hero].abilities, {name: ability})
            this.buffDisplayName = my.heroData['npc_dota_hero_' + hero].displayname + ' - ' + this.abilityData.displayname;        
            if (ability == 'sven_gods_strength') {
                this.buffDisplayName += ' (Aura for allies)';
            }
        }

    };
    
    my.ItemBuffOption = function (item) {
        this.buffName = item;
        if (my.heroData['npc_dota_hero_' + hero] == undefined) {
            this.hero = hero;
            this.abilityData = _.findWhere(my.unitData[hero].abilities, {name: item})
            this.buffDisplayName = my.unitData[hero].displayname + ' - ' + this.abilityData.displayname;        
        }
        else {
            this.hero = 'npc_dota_hero_' + hero;
            this.abilityData = _.findWhere(my.heroData['npc_dota_hero_' + hero].abilities, {name: item})
            this.buffDisplayName = my.heroData['npc_dota_hero_' + hero].displayname + ' - ' + this.abilityData.displayname;        
        }

    };
    
    my.BuffViewModel = function (a) {
        var self = new my.AbilityModel(ko.observableArray([]));
        self.availableBuffs = ko.observableArray([
            new my.BuffOption('abaddon', 'abaddon_frostmourne'),
            new my.BuffOption('axe', 'axe_culling_blade'),
            new my.BuffOption('beastmaster', 'beastmaster_inner_beast'),
            new my.BuffOption('bloodseeker', 'bloodseeker_bloodrage'),
            new my.BuffOption('bounty_hunter', 'bounty_hunter_track'),
            new my.BuffOption('centaur', 'centaur_stampede'),
            new my.BuffOption('crystal_maiden', 'crystal_maiden_brilliance_aura'),
            new my.BuffOption('dark_seer', 'dark_seer_surge'),
            new my.BuffOption('dazzle', 'dazzle_weave'),
            new my.BuffOption('drow_ranger', 'drow_ranger_trueshot'),
            new my.BuffOption('invoker', 'invoker_alacrity'),
            new my.BuffOption('wisp', 'wisp_tether'),
            new my.BuffOption('wisp', 'wisp_overcharge'),
            new my.BuffOption('kunkka', 'kunkka_ghostship'),
            new my.BuffOption('lich', 'lich_frost_armor'),
            new my.BuffOption('life_stealer', 'life_stealer_open_wounds'),
            new my.BuffOption('luna', 'luna_lunar_blessing'),
            new my.BuffOption('lycan', 'lycan_howl'),
            new my.BuffOption('magnataur', 'magnataur_empower'),
            new my.BuffOption('mirana', 'mirana_leap'),
            new my.BuffOption('ogre_magi', 'ogre_magi_bloodlust'),
            new my.BuffOption('omniknight', 'omniknight_guardian_angel'),
            new my.BuffOption('rubick', 'rubick_null_field'),
            new my.BuffOption('skeleton_king', 'skeleton_king_vampiric_aura'),
            new my.BuffOption('spirit_breaker', 'spirit_breaker_empowering_haste'),
            new my.BuffOption('sven', 'sven_warcry'),
            new my.BuffOption('sven', 'sven_gods_strength'),
            new my.BuffOption('treant', 'treant_living_armor'),
            new my.BuffOption('troll_warlord', 'troll_warlord_battle_trance'),
            new my.BuffOption('vengefulspirit', 'vengefulspirit_command_aura'),
            new my.BuffOption('npc_dota_neutral_alpha_wolf', 'alpha_wolf_critical_strike'),
            new my.BuffOption('npc_dota_neutral_alpha_wolf', 'alpha_wolf_command_aura'),
            new my.BuffOption('npc_dota_neutral_polar_furbolg_ursa_warrior', 'centaur_khan_endurance_aura'),
            new my.BuffOption('npc_dota_neutral_giant_wolf', 'giant_wolf_critical_strike'),
            new my.BuffOption('npc_dota_neutral_kobold_taskmaster', 'kobold_taskmaster_speed_aura'),
            new my.BuffOption('npc_dota_neutral_ogre_magi', 'ogre_magi_frost_armor'),
            new my.BuffOption('npc_dota_neutral_satyr_hellcaller', 'satyr_hellcaller_unholy_aura'),
            new my.BuffOption('npc_dota_neutral_enraged_wildkin', 'enraged_wildkin_toughness_aura'),
            new my.BuffOption('npc_dota_necronomicon_archer_1', 'necronomicon_archer_aoe')
        ]);
        self.availableDebuffs = ko.observableArray([
            new my.BuffOption('abaddon', 'abaddon_frostmourne'),
            new my.BuffOption('alchemist', 'alchemist_acid_spray'),
            new my.BuffOption('ancient_apparition', 'ancient_apparition_ice_vortex'),
            new my.BuffOption('axe', 'axe_battle_hunger'),
            new my.BuffOption('bane', 'bane_enfeeble'),
            new my.BuffOption('batrider', 'batrider_sticky_napalm'),
            new my.BuffOption('beastmaster', 'beastmaster_primal_roar'),
            new my.BuffOption('bounty_hunter', 'bounty_hunter_jinada'),
            new my.BuffOption('brewmaster', 'brewmaster_thunder_clap'),
            new my.BuffOption('brewmaster', 'brewmaster_drunken_haze'),
            new my.BuffOption('bristleback', 'bristleback_viscous_nasal_goo'),
            new my.BuffOption('broodmother', 'broodmother_incapacitating_bite'),
            new my.BuffOption('centaur', 'centaur_stampede'),
            new my.BuffOption('chen', 'chen_penitence'),
            new my.BuffOption('crystal_maiden', 'crystal_maiden_crystal_nova'),
            new my.BuffOption('crystal_maiden', 'crystal_maiden_freezing_field'),
            new my.BuffOption('dazzle', 'dazzle_weave'),
            new my.BuffOption('drow_ranger', 'drow_ranger_frost_arrows'),
            new my.BuffOption('earth_spirit', 'earth_spirit_rolling_boulder'),
            new my.BuffOption('elder_titan', 'elder_titan_natural_order'),
            new my.BuffOption('elder_titan', 'elder_titan_earth_splitter'),
            new my.BuffOption('enchantress', 'enchantress_untouchable'),
            new my.BuffOption('enchantress', 'enchantress_enchant'),
            new my.BuffOption('faceless_void', 'faceless_void_time_walk'),
            new my.BuffOption('huskar', 'huskar_life_break'),
            new my.BuffOption('invoker', 'invoker_ghost_walk'),
            new my.BuffOption('invoker', 'invoker_ice_wall'),
            new my.BuffOption('wisp', 'wisp_tether'),
            new my.BuffOption('jakiro', 'jakiro_dual_breath'),
            new my.BuffOption('jakiro', 'jakiro_liquid_fire'),
            new my.BuffOption('keeper_of_the_light', 'keeper_of_the_light_blinding_light'),
            new my.BuffOption('kunkka', 'kunkka_torrent'),
            new my.BuffOption('lich', 'lich_frost_nova'),
            new my.BuffOption('lich', 'lich_frost_armor'),
            new my.BuffOption('lich', 'lich_chain_frost'),
            new my.BuffOption('life_stealer', 'life_stealer_open_wounds'),
            new my.BuffOption('lion', 'lion_voodoo'),
            new my.BuffOption('magnataur', 'magnataur_skewer'),
            new my.BuffOption('medusa', 'medusa_stone_gaze'),
            new my.BuffOption('meepo', 'meepo_geostrike'),
            new my.BuffOption('naga_siren', 'naga_siren_rip_tide'),
            new my.BuffOption('night_stalker', 'night_stalker_void'),
            new my.BuffOption('night_stalker', 'night_stalker_crippling_fear'),
            new my.BuffOption('night_stalker', 'night_stalker_darkness'),
            new my.BuffOption('ogre_magi', 'ogre_magi_ignite'),
            new my.BuffOption('omniknight', 'omniknight_degen_aura'),
            new my.BuffOption('phantom_assassin', 'phantom_assassin_stifling_dagger'),
            new my.BuffOption('phantom_lancer', 'phantom_lancer_spirit_lance'),
            new my.BuffOption('pudge', 'pudge_rot'),
            new my.BuffOption('pugna', 'pugna_decrepify'),
            new my.BuffOption('queenofpain', 'queenofpain_shadow_strike'),
            new my.BuffOption('riki', 'riki_smoke_screen'),
            new my.BuffOption('rubick', 'rubick_fade_bolt'),
            new my.BuffOption('sand_king', 'sandking_epicenter'),
            new my.BuffOption('nevermore', 'nevermore_dark_lord'),
            new my.BuffOption('shadow_shaman', 'shadow_shaman_voodoo'),
            new my.BuffOption('skeleton_king', 'skeleton_king_hellfire_blast'),
            new my.BuffOption('skeleton_king', 'skeleton_king_reincarnation'),
            new my.BuffOption('skywrath_mage', 'skywrath_mage_concussive_shot'),
            new my.BuffOption('skywrath_mage', 'skywrath_mage_ancient_seal'),
            new my.BuffOption('slardar', 'slardar_slithereen_crush'),
            new my.BuffOption('slardar', 'slardar_amplify_damage'),
            new my.BuffOption('slark', 'slark_essence_shift'),
            new my.BuffOption('sniper', 'sniper_shrapnel'),
            new my.BuffOption('spectre', 'spectre_spectral_dagger'),
            new my.BuffOption('storm_spirit', 'storm_spirit_overload'),
            new my.BuffOption('templar_assassin', 'templar_assassin_meld'),
            new my.BuffOption('tidehunter', 'tidehunter_gush'),
            new my.BuffOption('tinker', 'tinker_laser'),
            new my.BuffOption('treant', 'treant_leech_seed'),
            new my.BuffOption('tusk', 'tusk_frozen_sigil'),
            new my.BuffOption('undying', 'undying_flesh_golem'),
            new my.BuffOption('ursa', 'ursa_earthshock'),
            new my.BuffOption('vengefulspirit', 'vengefulspirit_wave_of_terror'),
            new my.BuffOption('vengefulspirit', 'vengefulspirit_command_aura'),
            new my.BuffOption('venomancer', 'venomancer_venomous_gale'),
            new my.BuffOption('venomancer', 'venomancer_poison_sting'),
            new my.BuffOption('viper', 'viper_poison_attack'),
            new my.BuffOption('viper', 'viper_corrosive_skin'),
            new my.BuffOption('viper', 'viper_viper_strike'),
            new my.BuffOption('visage', 'visage_grave_chill'),
            new my.BuffOption('warlock', 'warlock_upheaval'),
            new my.BuffOption('weaver', 'weaver_the_swarm'),
            new my.BuffOption('windrunner', 'windrunner_windrun'),
            new my.BuffOption('winter_wyvern', 'winter_wyvern_arctic_burn'),
            new my.BuffOption('winter_wyvern', 'winter_wyvern_splinter_blast'),
            new my.BuffOption('npc_dota_neutral_ghost', 'ghost_frost_attack'),
            new my.BuffOption('npc_dota_neutral_polar_furbolg_ursa_warrior', 'polar_furbolg_ursa_warrior_thunder_clap'),
            new my.BuffOption('npc_dota_neutral_ogre_magi', 'ogre_magi_frost_armor'),
            new my.BuffOption('npc_dota_neutral_satyr_trickster', 'satyr_trickster_purge'),
            new my.BuffOption('npc_dota_neutral_enraged_wildkin', 'enraged_wildkin_tornado')
        ]);
        self.selectedBuff = ko.observable(self.availableBuffs()[0]);
        
        self.buffs = ko.observableArray([]);
        self.itemBuffs = new my.InventoryViewModel();
        
        self.addBuff = function (data, event) {
            if (_.findWhere(self.buffs(), { name: self.selectedBuff().buffName })  == undefined) {
                var a = ko.mapping.fromJS(self.selectedBuff().abilityData);
                a.isActive = ko.observable(false);
                a.isDetail = ko.observable(false);
                a.baseDamage = ko.observable(0);
                a.bash = ko.observable(0);
                a.bashBonusDamage = ko.observable(0);
                a.bonusDamage = ko.observable(0);
                a.bonusDamageOrb = ko.observable(0);
                a.bonusDamagePct = ko.observable(0);
                a.bonusDamagePrecisionAura = ko.observable(0);
                a.bonusDamageReduction = ko.observable(0);
                a.bonusHealth = ko.observable(0);
                a.bonusStrength = ko.observable(0);
                a.bonusStrength2 = ko.observable(0);
                a.bonusAgility = ko.observable(0);
                a.bonusAgility2 = ko.observable(0);
                a.bonusInt = ko.observable(0);
                a.bonusAllStatsReduction = ko.observable(0);
				a.damageAmplification = ko.observable(0);
				a.damageReduction = ko.observable(0);
                a.evasion = ko.observable(0);
                a.magicResist = ko.observable(0);
                a.manaregen = ko.observable(0);
                a.manaregenreduction = ko.observable(0);
                a.missChance = ko.observable(0);
                a.movementSpeedFlat = ko.observable(0);
                a.movementSpeedPct = ko.observable(0);
                a.movementSpeedPctReduction = ko.observable(0);
                a.turnRateReduction = ko.observable(0);
                a.attackrange = ko.observable(0);
                a.attackspeed = ko.observable(0);
                a.attackspeedreduction = ko.observable(0);
                a.armor = ko.observable(0);
                a.armorReduction = ko.observable(0);
                a.healthregen = ko.observable(0);
                a.lifesteal = ko.observable(0);
                a.visionnight = ko.observable(0);
                a.visionday = ko.observable(0);
                switch (a.name()) {
                    case 'invoker_cold_snap':
                    case 'invoker_ghost_walk':
                    case 'invoker_tornado':
                    case 'invoker_emp':
                    case 'invoker_alacrity':
                    case 'invoker_chaos_meteor':
                    case 'invoker_sun_strike':
                    case 'invoker_forge_spirit':
                    case 'invoker_ice_wall':
                    case 'invoker_deafening_blast':
                        a.level(1);
                    break;
                }
                self.abilities.push(a);
                self.buffs.push({ name: self.selectedBuff().buffName, hero: self.selectedBuff().hero, data: a });
            }
        };
        
        self.removeBuff = function (data, event, abilityName) {
            if (_.findWhere(self.buffs(), { name: abilityName })  != undefined) {
                    self.buffs.remove(_.findWhere(self.buffs(), { name: abilityName }));
                    if (self.abilityControlData[abilityName] != undefined) {
                        for (var i = 0; i < self.abilityControlData[abilityName].data.length; i++) {
                            if (self.abilityControlData[abilityName].data[i].controlVal.dispose != undefined) {
                                self.abilityControlData[abilityName].data[i].controlVal.dispose();
							}
							if (self.abilityControlData[abilityName].data[i].clean != undefined) {
                                self.abilityControlData[abilityName].data[i].clean.dispose();
                            }
                        }
                        self.abilityControlData[abilityName] = undefined;
                    }
                    for (var i = 0; i < self.abilities().length; i++) {
                        if (self.abilities()[i].name() == abilityName) {
                            self.abilities()[i].level(0);
                            self.abilities.remove(self.abilities()[i]);
                            break;
                        }
                    }
            }
        };
        self.toggleBuff = function (index, data, event) {
            if (self.buffs()[index()].data.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') < 0) {
                if (self.buffs()[index()].data.isActive()) {
                    self.buffs()[index()].data.isActive(false);
                    self.abilities()[index()].isActive(false);
                }
                else {
                    self.buffs()[index()].data.isActive(true);
                    self.abilities()[index()].isActive(true);
                }
            }
        }.bind(this);

        self.toggleBuffDetail = function (index, data, event) {
            if (self.buffs()[index()].data.isDetail()) {
                self.buffs()[index()].data.isDetail(false);
            }
            else {
                self.buffs()[index()].data.isDetail(true);
            }
        }.bind(this);

        // Overrides the ability module function to remove available skill point check
        self.levelUpAbility = function (index, data, event, hero) {
            if (self.abilities()[index()].level() < hero.getAbilityLevelMax(data)) {
                switch(self.abilities()[index()].abilitytype()) {
                    case 'DOTA_ABILITY_TYPE_ULTIMATE':
                        self.abilities()[index()].level(self.abilities()[index()].level() + 1);
                    break;
                    default:
                        self.abilities()[index()].level(self.abilities()[index()].level() + 1);
                    break;
                }
                switch (self.abilities()[index()].name()) {
                    case 'beastmaster_call_of_the_wild':
                    case 'chen_test_of_faith':
                    case 'morphling_morph_agi':
                    case 'shadow_demon_shadow_poison':
                        self.abilities()[index() + 1].level(self.abilities()[index()].level());
                    break;
                    case 'morphling_morph_str':
                        self.abilities()[index() - 1].level(self.abilities()[index()].level());
                    break;
                    case 'keeper_of_the_light_spirit_form':
                        self.abilities()[index() - 1].level(self.abilities()[index()].level());
                        self.abilities()[index() - 2].level(self.abilities()[index()].level());
                    case 'nevermore_shadowraze1':
                        self.abilities()[index() + 1].level(self.abilities()[index()].level());
                        self.abilities()[index() + 2].level(self.abilities()[index()].level());
                    break;
                    case 'nevermore_shadowraze2':
                        self.abilities()[index() - 1].level(self.abilities()[index()].level());
                        self.abilities()[index() + 1].level(self.abilities()[index()].level());
                    break;
                    case 'nevermore_shadowraze3':
                        self.abilities()[index() - 1].level(self.abilities()[index()].level());
                        self.abilities()[index() - 2].level(self.abilities()[index()].level());
                    break;
                }
            }
        };
        self.levelDownAbility = function (index, data, event, hero) {
            if (self.abilities()[index()].level() > 0) {
                self.abilities()[index()].level(self.abilities()[index()].level() - 1);
                switch (self.abilities()[index()].name()) {
                    case 'beastmaster_call_of_the_wild':
                    case 'chen_test_of_faith':
                    case 'morphling_morph_agi':
                    case 'shadow_demon_shadow_poison':
                        self.abilities()[index() + 1].level(self.abilities()[index()].level());
                    break;
                    case 'morphling_morph_str':
                        self.abilities()[index() - 1].level(self.abilities()[index()].level());
                    break;
                    case 'keeper_of_the_light_spirit_form':
                        self.abilities()[index() - 1].level(self.abilities()[index()].level());
                        self.abilities()[index() - 2].level(self.abilities()[index()].level());
                    case 'nevermore_shadowraze1':
                        self.abilities()[index() + 1].level(self.abilities()[index()].level());
                        self.abilities()[index() + 2].level(self.abilities()[index()].level());
                    break;
                    case 'nevermore_shadowraze2':
                        self.abilities()[index() - 1].level(self.abilities()[index()].level());
                        self.abilities()[index() + 1].level(self.abilities()[index()].level());
                    break;
                    case 'nevermore_shadowraze3':
                        self.abilities()[index() - 1].level(self.abilities()[index()].level());
                        self.abilities()[index() - 2].level(self.abilities()[index()].level());
                    break;
                    case 'ember_spirit_fire_remnant':
                        self.abilities()[index() - 1].level(self.abilities()[index()].level());
                    break;
                    case 'lone_druid_true_form':
                        self.abilities()[index() - 1].level(self.abilities()[index()].level());
                    break;
                }
            }
        };
        
        return self;
    }

    return my;
}(HEROCALCULATOR));
var HEROCALCULATOR = (function (my) {
    
    my.DamageAmpViewModel = function (a) {
        var self = new my.BuffViewModel(ko.observableArray([]));
        self.availableBuffs = ko.observableArray([
            new my.BuffOption('slardar', 'slardar_sprint'),
            new my.BuffOption('undying', 'undying_flesh_golem'),
            new my.BuffOption('chen', 'chen_penitence'),
            new my.BuffOption('medusa', 'medusa_stone_gaze'),
            new my.BuffOption('shadow_demon', 'shadow_demon_soul_catcher')
        ]);
        self.availableDebuffs = ko.observableArray([
            new my.BuffOption('medusa', 'medusa_mana_shield'),
            //new my.BuffOption('templar_assassin', 'templar_assassin_refraction'),
            //new my.BuffOption('faceless_void', 'faceless_void_backtrack'),
            //new my.BuffOption('nyx_assassin', 'nyx_assassin_spiked_carapace'),
            new my.BuffOption('spectre', 'spectre_dispersion'),
            new my.BuffOption('wisp', 'wisp_overcharge'),
            new my.BuffOption('bristleback', 'bristleback_bristleback'),
            //new my.BuffOption('abaddon', 'abaddon_borrowed_time'),
            //new my.BuffOption('abaddon', 'abaddon_aphotic_shield'),
            //new my.BuffOption('dazzle', 'dazzle_shallow_grave'),
            //new my.BuffOption('treant', 'treant_living_armor'),
            new my.BuffOption('kunkka', 'kunkka_ghostship')
        ]);
        self.selectedBuff = ko.observable(self.availableBuffs()[0]);
        
        self.buffs = ko.observableArray([]);

        self.getAbilityDamageAmpValue = function (abilityName, attributeName) {
            var a = _.findWhere(self.buffs(), {name: abilityName});
            if (a == undefined) {
                return 0;
            }
            else {
                var ability = a.data;
                return self.getAbilityAttributeValue(ability.attributes(), attributeName, ability.level());
            }
        }
        
        self.getDamageMultiplierSources = ko.computed(function () {
            var sources = {};
            for (var i = 0; i < self.abilities().length; i++) {
                var ability = self.abilities()[i];
                    if (ability.level() > 0 && (ability.isActive() || (ability.behavior().indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                        switch (ability.name()) {
                            case 'bristleback_bristleback':
                                sources[ability.name()] = {
                                    'multiplier': ability.damageReduction() / 100,
                                    'damageType': 'physical',
                                    'displayname': ability.displayname()
                                }
                            break;
                            case 'slardar_sprint':
                                sources[ability.name()] = {
                                    'multiplier': self.getAbilityAttributeValue(ability.attributes(), 'bonus_damage', ability.level()) / 100,
                                    'damageType': 'physical',
                                    'displayname': ability.displayname()
                                }
                            break;
                            case 'undying_flesh_golem':
                                sources[ability.name()] = {
                                    'multiplier': ability.damageAmplification() / 100,
                                    'damageType': 'physical',
                                    'displayname': ability.displayname()
                                }
                            break;
                            case 'medusa_stone_gaze':
                                sources[ability.name()] = {
                                    'multiplier': self.getAbilityAttributeValue(ability.attributes(), 'bonus_physical_damage', ability.level()) / 100,
                                    'damageType': 'physical',
                                    'displayname': ability.displayname()
                                }
                            break;
                            case 'chen_penitence':
                                sources[ability.name()] = {
                                    'multiplier': self.getAbilityAttributeValue(ability.attributes(), 'bonus_damage_taken', ability.level()) / 100,
                                    'damageType': 'physical',
                                    'displayname': ability.displayname()
                                }
                            break;
                            case 'shadow_demon_soul_catcher':
                                sources[ability.name()] = {
                                    'multiplier': self.getAbilityAttributeValue(ability.attributes(), 'bonus_damage_taken', ability.level()) / 100,
                                    'damageType': 'pure',
                                    'displayname': ability.displayname()
                                }
                            break;
                            case 'medusa_mana_shield':
                                sources[ability.name()] = {
                                    'multiplier': ability.damageReduction() / 100,
                                    'damageType': 'physical',
                                    'displayname': ability.displayname()
                                }                            
                            break;
                            case 'spectre_dispersion':
                                sources[ability.name()] = {
                                    'multiplier': -self.getAbilityAttributeValue(ability.attributes(), 'damage_reflection_pct', ability.level()) / 100,
                                    'damageType': 'percentreduction',
                                    'displayname': ability.displayname()
                                }                                
                            break;
                            case 'abaddon_aphotic_shield':
                                sources[ability.name()] = {
                                    'multiplier': self.getAbilityAttributeValue(ability.attributes(), 'damage_absorb', ability.level()),
                                    'damageType': 'flatreduction',
                                    'displayname': ability.displayname()
                                }                                
                            break;
                            case 'kunkka_ghostship':
                                sources[ability.name()] = {
                                    'multiplier': -50 / 100,
                                    'damageType': 'percentreduction',
                                    'displayname': ability.displayname()
                                }                                
                            break;
                            case 'wisp_overcharge':
                                sources[ability.name()] = {
                                    'multiplier': self.getAbilityAttributeValue(ability.attributes(), 'bonus_damage_pct', ability.level()) / 100,
                                    'damageType': 'percentreduction',
                                    'displayname': ability.displayname()
                                }                                
                            break;
                            /*case 'faceless_void_backtrack':
                                sources[ability.name()] = {
                                    'multiplier': -self.getAbilityAttributeValue(ability.attributes(), 'dodge_chance_pct', ability.level()) / 100,
                                    'damageType': 'percentreduction',
                                    'displayname': ability.displayname()
                                }                                
                            break;*/
                        }
                    }
            }
            return sources;
        });
        
        return self;
    }

    return my;
}(HEROCALCULATOR));
var HEROCALCULATOR = (function (my) {

  my.GraphPropertyOption = function (id, label) {
  this.id = id;
    this.label = label;
  };
    
	my.BuildExplorerViewModel = function (h) {
    var self = this;
		self.parent = h;

		self.itemBuild = ko.observableArray([]);
		self.skillBuild = ko.observableArray([]);
		self.graphDataItemRows = [];
		for (var i = 0; i < 25; i++) {
			self.itemBuild.push(new my.BasicInventoryViewModel());
			self.itemBuild()[i].carryOver = ko.observable(true);
			self.skillBuild.push(ko.observable(-1));
			self.graphDataItemRows.push(ko.observable(false));
		}
		self.toggleItemBuildCarryOver = function (index) {
			self.itemBuild()[index].carryOver(!self.itemBuild()[index].carryOver());
		}
		
		self.abilityMapData = [0,1,2,3,4];
		self.abilityMapHero = self.parent.selectedHero().heroName;
        self.abilityMap = ko.computed(function () {
			if (self.abilityMapHero == self.parent.selectedHero().heroName) return;
			self.abilityMapHero = self.parent.selectedHero().heroName;
			var newMap =_.filter(_.map(self.parent.ability().abilities(), function(ability, index) {
				if (self.parent.ability().isQWER(ability)) {
					return index;
				}
				else {
					return -1;
				}
			}), function(element) { return element != -1; });
			for (var i = 0; i < 25; i++) {
				var abilityValue = self.skillBuild()[i]();
				if (abilityValue == -1) continue;
				
				var abilityIndex = self.abilityMapData.indexOf(abilityValue);
				var newValue = newMap[abilityIndex];
				if (newValue != abilityValue) {
					self.skillBuild()[i](newValue);
				}
			}
			self.abilityMapData = newMap;
		});
		
		self.availableSkillBuildPoints = ko.computed(function () {
      return _.reduce(self.skillBuild(), function(memo, num){ return memo + (num() == -1); }, 0);
    });
    self.getSkillBuildAbilityLevel = function (index) {
      return _.reduce(self.skillBuild(), function(memo, num){ return memo + (num() == index); }, 0);
    };
    self.toggleAbilitySkillBuild = function (index, abilityIndex, data, event) {
			if (self.skillBuild()[index]() != abilityIndex) {
				var ability = self.parent.ability().abilities()[abilityIndex],
					abilityType = ability.abilitytype(),
					skillBuildSlice = self.skillBuild().slice(0, index),
					currentAbilityLevel = _.reduce(self.skillBuild(), function(memo, num){ return memo + (num() == abilityIndex); }, 0),
					n = _.reduce(skillBuildSlice, function(memo, num){ return memo + (num() == abilityIndex); }, 0);
				
				if (self.IsValidAbilityLevel(ability, self.parent.selectedHero().heroName, index + 1, n)) {
					self.skillBuild()[index](abilityIndex);
					for (var i = index + 1; i < 25; i++) {
						if (self.skillBuild()[i]() == abilityIndex) {
							n++;
							if (!self.IsValidAbilityLevel(ability, self.parent.selectedHero().heroName, i + 1, n)) {
								self.skillBuild()[i](-1);
								n--;
							}
						}
					}
				}
				else if (n > 0 && self.IsValidAbilityLevel(ability, self.parent.selectedHero().heroName, index + 1, n - 1)) {
					for (var i = skillBuildSlice.length - 1; i >= 0; i--) {
						if (skillBuildSlice[i]() == abilityIndex) {
							self.skillBuild()[i](-1);
							self.skillBuild()[index](abilityIndex);
							break;
						}
					}
				}
			}
			else {
				self.skillBuild()[index](-1);
			}
    };
		self.IsValidAbilityLevel = function (ability, heroName, heroLevel, abilityLevel) {
			var a = 1, b = 2, m = 4;
			if (ability.name() == 'attribute_bonus') {
				m = 10;
			}
			else {
				if (ability.abilitytype() == 'DOTA_ABILITY_TYPE_ULTIMATE') {
					if (heroName == 'invoker') {
						a = 2;
						b = 5;
					}
					else if (heroName == 'meepo') {
						a = 3;
						b = 7;
						m = 3;
					}
					else {
						a = 6;
						b = 5;
						m = 3;
					}
				}
				else {
					if (heroName == 'invoker') {
						m = 7;
					}
				}				
			}
			
			return heroLevel >= a + b * abilityLevel && abilityLevel < m;
		}
		
    self.resetItemBuild = function (index) {
      self.itemBuild()[index].removeAll();
    };		
    self.resetAllItemBuilds = function () {
      for (var i = 0; i < 25; i++) {
        self.itemBuild()[i].removeAll();
        self.itemBuild()[i].carryOver(true);
      }
    };
    self.resetSkillBuild = function () {
      for (var i = 0; i < 25; i++) {
        self.skillBuild()[i](-1);
      }
    };
    self.graphData = ko.observableArray([]);
    self.graphDataHeader = ko.observable('');
		self.parent.selectedHero.subscribe(function (newValue) {
			self.graphDataHeader(self.parent.selectedHero().heroDisplayName);
		});
    self.graphDataDescription = ko.observable('');
		self.graphProperties = ko.observableArray([
			new my.GraphPropertyOption('totalArmorPhysical', 'Armor'),
			new my.GraphPropertyOption('totalArmorPhysicalReduction', 'Physical Damage Reduction'),
			new my.GraphPropertyOption('totalMagicResistance', 'Magical Resistance'),
			new my.GraphPropertyOption('health', 'Health'),
			new my.GraphPropertyOption('healthregen', 'Health Regeneration'),
			new my.GraphPropertyOption('mana', 'Mana'),
			new my.GraphPropertyOption('manaregen', 'Mana Regeneration'),
			new my.GraphPropertyOption('ehpPhysical', 'EHP Physical'),
			new my.GraphPropertyOption('ehpMagical', 'EHP Magical'),
			new my.GraphPropertyOption('damage', 'Damage per attack'),
			new my.GraphPropertyOption('dps', 'Damage per second'),
			new my.GraphPropertyOption('attacksPerSecond', 'Attacks per second'),
			new my.GraphPropertyOption('attackTime', 'Time per attack')
		]);
    self.graph = function () {
      var savedAbilityLevels = [],
          savedLevel = self.parent.selectedHeroLevel(),
          savedItems = self.parent.inventory.items(),
          savedActiveItems = self.parent.inventory.activeItems(),
          s = ko.toJS(self.skillBuild),
          carryOverItems = [],
          carryOverActiveItems = [],
          dataset = [];
      for (var i = 0; i < self.parent.ability().abilities().length; i++) {
        savedAbilityLevels.push(self.parent.ability().abilities()[i].level());
      }
      for (var i = 1; i < 26; i++) {
        self.parent.selectedHeroLevel(i);
        var skillBuildSubset = s.slice(0, i);
        for (var j = 0; j < self.parent.ability().abilities().length; j++) {
          var a = self.parent.ability().abilities()[j],
              count = _.reduce(skillBuildSubset, function(memo, num){ return memo + (num == j); }, 0);
          a.level(count);
        }
				
				if (!self.itemBuild()[i-1].carryOver()) {
					carryOverItems = [];
					carryOverActiveItems = [];
				}
				carryOverItems = carryOverItems.concat(self.itemBuild()[i-1].items());
				carryOverActiveItems = carryOverActiveItems.concat(self.itemBuild()[i-1].activeItems());
				
				self.parent.inventory.items(carryOverItems);
				self.parent.inventory.activeItems(carryOverActiveItems);
				dataObj = {};
				for (var j = 0; j < self.graphProperties().length; j++) {
					var prop = self.graphProperties()[j];
          switch (prop.id) {
            case 'dps':
              dataObj[prop.id] = self.parent['damageTotalInfo']().dps.total.toFixed(2);
            break;
            case 'damage':
              dataObj[prop.id] = self.parent['damageTotalInfo']().total.toFixed(2);
            break;
            default :
              dataObj[prop.id] = self.parent[prop.id]();
            break;
          }
				}
				
				dataObj.items = _.map(carryOverItems, function(item) {
          return ko.toJS(item);
        });
        dataset.push(dataObj);
				if (carryOverItems > 0) {
					self.graphDataItemRows[i-1](true);
				}
      }
			var data = {
        header: self.graphDataHeader(),
				description: self.graphDataDescription(),
        items: _.map(self.parent.inventory.items(), function(item) {
          return ko.toJS(item);
        }),
        skillBuild: ko.toJS(self.skillBuild),
        data: dataset,
				abilityMap : self.abilityMapData.slice(0),
				cumulativeSkillBuild: [],
				visible: ko.observable(true)
      }
			for (var i = 0; i < 25; i++) {
				var skillBuildAtLevel = [],
            skillBuildSlice = data.skillBuild.slice(0, i + 1);
				for (var j = 0; j < data.abilityMap.length; j++) {
					var abilityIndex = data.abilityMap[j];
					skillBuildAtLevel.push(_.reduce(skillBuildSlice, function(memo, num){ return memo + (num == abilityIndex); }, 0));
				}
				data.cumulativeSkillBuild.push(skillBuildAtLevel);
			}
				
      self.graphData.push(data);
      self.parent.selectedHeroLevel(savedLevel);
      for (var i = 0; i < self.parent.ability().abilities().length; i++) {
        self.parent.ability().abilities()[i].level(savedAbilityLevels[i]);
      }
			self.parent.inventory.items(savedItems);
			self.parent.inventory.activeItems(savedActiveItems);
    };
		self.removeGraphDataSet = function (data) {
			self.graphData.remove(data);
		}
		self.selectedGraphProperty = ko.observable(self.graphProperties()[0].id);
		
		self.graphChartOptions = ko.computed(function () {
			var color = my.theme() == 'dark' ? 'rgb(151, 154, 162)' : 'rgb(51, 51, 51)';
			return {
				responsive: true,
				datasetStroke: false,
				datasetStrokeWidth: -1,
				datasetFill: false,
				pointHitDetectionRadius : 10,
				scaleFontColor: color,
				scaleLineColor: color.replace('rgb', 'rgba').replace(')', ', .1)'),
				scaleGridLineColor: color.replace('rgb', 'rgba').replace(')', ', .1)')
			}
		});
		self.graphChartData = ko.computed(function () {
			var data = {
				labels: [],
				datasets: []
			}
			for (var i = 0; i < 25; i++) {
				data.labels.push((i+1).toString());
			}
			for (var i = 0; i < self.graphData().length; i++) {
				var dataObj = self.graphData()[i],
					dataset = {
						label: dataObj.header,
						fillColor: self.graphDistinctColor(self.graphData().length, i, .1),
						strokeColor: self.graphDistinctColor(self.graphData().length, i, 1),
						pointColor: self.graphDistinctColor(self.graphData().length, i, 1),
						pointStrokeColor: self.graphDistinctColor(self.graphData().length, i, 1),
						pointHighlightFill: self.graphDistinctColor(self.graphData().length, i, .1),
						pointHighlightStroke: self.graphDistinctColor(self.graphData().length, i, .5),
						data: _.pluck(dataObj.data, self.selectedGraphProperty())
					};
				data.datasets.push(dataset);
			}
			return data;
		});
    self.graphDistinctColor = function (max, index, alpha) {
      var alpha = alpha || 1;
      rgba = self.hslToRgb((1 / max) * index % 1, 1, .5);
      rgba.push(alpha);
      return "rgba(" + rgba.join() + ")";
    }
    self.getDistinctColor = function (max, index, alpha) {
      var alpha = alpha || 1;
      rgba = self.hslToRgb((1 / max) * index % 1, 1, .5);
      rgba.push(alpha);
      return rgba;
    }
    self.hslToRgb = function (h, s, l) {
      var r, g, b;
      if (s == 0) {
        r = g = b = l; // achromatic
      }
      else {
        var hue2rgb = function hue2rgb(p, q, t) {
          if(t < 0) t += 1;
          if(t > 1) t -= 1;
          if(t < 1/6) return p + (q - p) * 6 * t;
          if(t < 1/2) return q;
          if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
          return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
      }

      return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }
		
		self.showGraphItemBuildRows = ko.observable(false);
		self.showGraphSkillBuildColumns = ko.observable(false);
		self.graphRowHasItems = function (index) {
			return _.some(self.graphData(), function (dataset) {
				return dataset.visible() && dataset.data[index].items.length > 0;
			});
		}

		self.selectInventory = function (index) {
			self.parent.selectedInventory(self.parent.selectedInventory() == index ? -1 : index);
		}
		self.getSelectedInventory = ko.pureComputed(function () {
			if (self.parent.selectedInventory() == -1) {
				return self.parent.inventory;
			}
			else {
				return self.itemBuild()[self.parent.selectedInventory()];
			}
		});
		self.copyInventory = function (index) {
			if (self.parent.selectedInventory() != -1 && self.parent.selectedInventory() != index) {
				self.itemBuild()[self.parent.selectedInventory()].items(self.itemBuild()[self.parent.selectedInventory()].items().concat(self.itemBuild()[index].items()));
				self.itemBuild()[self.parent.selectedInventory()].activeItems(_.union(self.itemBuild()[self.parent.selectedInventory()].activeItems(), self.itemBuild()[index].activeItems()));
			}
		}
		self.copyInventoryToClipBoard = function (index) {
			if (index == -1) {
				my.inventoryClipBoard.items = self.parent.inventory.items.slice(0);
				my.inventoryClipBoard.activeItems = self.parent.inventory.activeItems.slice(0);			
			}
			else {
				my.inventoryClipBoard.items = self.itemBuild()[index].items.slice(0);
				my.inventoryClipBoard.activeItems = self.itemBuild()[index].activeItems.slice(0);
			}
		}
		self.pasteInventoryFromClipBoard = function (index) {
            if (my.inventoryClipBoard.items.length > 0) {
				if (index == -1) {
					self.parent.inventory.items(self.parent.inventory.items().concat(my.inventoryClipBoard.items));
					self.parent.inventory.activeItems(_.union(self.parent.inventory.activeItems(), my.inventoryClipBoard.activeItems));	
				}
				else {
					self.itemBuild()[index].items(self.itemBuild()[index].items().concat(my.inventoryClipBoard.items));
					self.itemBuild()[index].activeItems(_.union(self.itemBuild()[index].activeItems(), my.inventoryClipBoard.activeItems));
				}
            }
		}
    self.loadGraphData = function (data) {
      self.parent.sectionDisplay()['skillbuild'](true);
      for (var i = 0; i < data.length; i++) {
        data[i].visible = ko.observable(data[i].visible);
      }
      self.graphData(data);
    }
    self.graphChartContext = ko.observable();
    self.exportImage = function () {
      console.log('graphChartContext', self.graphData());
      var w = window.open();
      w.document.write('<img src="'+ self.graphChartContext().canvas.toDataURL() +'"/>');
    }
    return self;
	}
  return my;
}(HEROCALCULATOR));
var HEROCALCULATOR = (function (my) {

    my.IllusionOption = function (name, displayname, baseHero) {
        this.illusionName = name;
        this.illusionDisplayName = displayname;
        this.baseHero = baseHero;
    };
    
    my.HeroOption = function (name, displayname) {
        this.heroName = name;
        this.heroDisplayName = displayname;
    };
	
    my.DamageInstance = function (label, damageType, value, data, total) {
        this.label = label || '';
        this.damageType = damageType || '';
        this.value = parseFloat(value) || 0;
        this.data = data || [];
        this.total = parseFloat(total) || 0;
    }
        
    function createHeroOptions() {
        var options = [];
        for (h in my.heroData) {
            options.push(new my.HeroOption(h.replace('npc_dota_hero_', ''), my.heroData[h].displayname));
        }
        return options;
    };
    
    function createIllusionOptions() {
        var options = [];
        for (h in my.illusionData) {
            options.push(new my.IllusionOption(h, my.illusionData[h].displayName, my.illusionData[h].hero));
        }
        return options;
    }
    
    my.totalExp = [0, 200, 500, 900, 1400, 2000, 2600, 3400, 4400, 5400, 6000, 8200, 9000, 10400, 11900, 13500, 15200, 17000, 18900, 20900, 23000, 25200, 27500, 29900, 32400];
    my.nextLevelExp = [200, 300, 400, 500, 600, 600, 800, 1000, 1000, 600, 2200, 800, 1400, 1500, 1600, 1700, 1800, 1900, 2000, 2100, 2200, 2300, 2400, 2500, '&mdash;'];
    
    my.HeroCalculatorModel = function (h) {
        var self = this;
        self.availableHeroes = ko.observableArray(createHeroOptions());
        self.sectionDisplay = ko.observable({
            'inventory': ko.observable(true),
            'ability': ko.observable(true),
            'buff': ko.observable(true),
            'debuff': ko.observable(true),
            'damageamp': ko.observable(false),
            'illusion': ko.observable(false),
            'skillbuild': ko.observable(false),
            'skillbuild-skills': ko.observable(true),
            'skillbuild-items': ko.observable(true)
        });
        self.sectionDisplayToggle = function (section) {
            self.sectionDisplay()[section](!self.sectionDisplay()[section]());
        }
        self.showUnitTab = ko.observable(false);
        self.availableHeroes.sort(function (left, right) {
            return left.heroDisplayName == right.heroDisplayName ? 0 : (left.heroDisplayName < right.heroDisplayName ? -1 : 1);
        });
        self.selectedHero = ko.observable(self.availableHeroes()[h]);
        self.selectedHeroLevel = ko.observable(1);
        self.inventory = new my.InventoryViewModel(self);
        self.selectedInventory = ko.observable(-1);
        self.buffs = new my.BuffViewModel();
        self.buffs.hasScepter = self.inventory.hasScepter;
        self.debuffs = new my.BuffViewModel();
        self.damageAmplification = new my.DamageAmpViewModel();
        self.damageReduction = new my.DamageAmpViewModel();
        self.hero = ko.computed(function () {
            return ko.mapping.fromJS(my.heroData['npc_dota_hero_' + self.selectedHero().heroName]);
        });
		self.heroData = ko.computed(function () {
			return my.heroData['npc_dota_hero_' + self.selectedHero().heroName];
		});
        self.heroCompare = ko.observable(self);
        self.enemy = ko.observable(self);
        self.unit = ko.observable(self);
        self.clone = ko.observable(self);
        self.illusions = ko.observableArray([]);
        self.availableIllusions = ko.observableArray(createIllusionOptions());
        self.selectedIllusion = ko.observable(self.availableIllusions()[0]);
        self.illusionAbilityLevel = ko.observable(1);
        self.illusionAbilityMaxLevel = ko.computed(function () {
            return my.illusionData[self.selectedIllusion().illusionName].max_level;
        });
        self.showDiff = ko.observable(false);
        self.getAbilityLevelMax = function (data) {
            if (data.abilitytype() === 'DOTA_ABILITY_TYPE_ATTRIBUTES') {
                return 10;
            }
            else if (data.name() === 'invoker_quas' || data.name() === 'invoker_wex' || data.name() === 'invoker_exort') {
                return 7;
            }
            else if (data.name() === 'invoker_invoke') {
                return 4;
            }
            else if (data.name() === 'earth_spirit_stone_caller' || data.name() === 'ogre_magi_unrefined_fireblast') {
                return 1;
            }
            else if (data.abilitytype() === 'DOTA_ABILITY_TYPE_ULTIMATE' || data.name() === 'keeper_of_the_light_recall' ||
                     data.name() === 'keeper_of_the_light_blinding_light' || data.name() === 'ember_spirit_activate_fire_remnant' ||
                     data.name() === 'lone_druid_true_form_battle_cry') {
                return 3;
            }
            else if (data.name() === 'puck_ethereal_jaunt'  || data.name() === 'shadow_demon_shadow_poison_release' ||
                     data.name() === 'templar_assassin_trap' || data.name() === 'spectre_reality') {
                return 0;
            }
            else if (data.name() === 'invoker_cold_snap'  || data.name() === 'invoker_ghost_walk' || data.name() === 'invoker_tornado' || 
                     data.name() === 'invoker_emp' || data.name() === 'invoker_alacrity' || data.name() === 'invoker_chaos_meteor' || 
                     data.name() === 'invoker_sun_strike' || data.name() === 'invoker_forge_spirit' || data.name() === 'invoker_ice_wall' || 
                     data.name() === 'invoker_deafening_blast') {
                return 0;
            }
            else if (data.name() === 'techies_minefield_sign' || data.name() === 'techies_focused_detonate') {
                return 0;
            }
            else {
                return 4;
            }
        };
        
        self.skillPointHistory = ko.observableArray();
        
        self.ability = ko.computed(function () {
            var a = new my.AbilityModel(ko.mapping.fromJS(self.heroData().abilities), self);
            if (self.selectedHero().heroName === 'earth_spirit' || self.selectedHero().heroName === 'ogre_magi') {
                a.abilities()[3].level(1);
            }
            else if (self.selectedHero().heroName === 'invoker') {
                for (var i = 6; i < 16; i++) {
                    a.abilities()[i].level(1);
                }
            }
            self.skillPointHistory.removeAll();
            a.hasScepter = self.inventory.hasScepter
            return a;
        });
		
        self.showCriticalStrikeDetails = ko.observable(false);
        self.damageInputValue = ko.observable(0);
        self.showDamageDetails = ko.observable(false);
        self.showStatDetails = ko.observable(false);
        self.showDamageAmpCalcDetails = ko.observable(false);

        self.availableSkillPoints = ko.computed(function () {
            var c = self.selectedHeroLevel();
            for (var i = 0; i < self.ability().abilities().length; i++) {
                var getIndex = function () {
                    return i;
                };
                switch(self.ability().abilities()[i].abilitytype()) {
                    case 'DOTA_ABILITY_TYPE_ULTIMATE':
                        if (self.selectedHero().heroName === 'invoker') {
                            while (
                                ((self.ability().abilities()[i].level() == 1) && (parseInt(self.selectedHeroLevel()) < 2)) ||
                                ((self.ability().abilities()[i].level() == 2) && (parseInt(self.selectedHeroLevel()) < 7)) ||
                                ((self.ability().abilities()[i].level() == 3) && (parseInt(self.selectedHeroLevel()) < 11)) ||
                                ((self.ability().abilities()[i].level() == 4) && (parseInt(self.selectedHeroLevel()) < 17))
                            ) {
                                self.ability().levelDownAbility(getIndex, null, null, self);
                            }
                        }
                        else if (self.selectedHero().heroName === 'meepo') {
                            while ((self.ability().abilities()[i].level()-1) * 7 + 3 > parseInt(self.selectedHeroLevel())) {
                                self.ability().levelDownAbility(getIndex, null, null, self);
                            }
                        }
                        else {
                            while (self.ability().abilities()[i].level() * 5 + 1 > parseInt(self.selectedHeroLevel())) {
                                self.ability().levelDownAbility(getIndex, null, null, self);
                            }
                        }
                    break;
                    default:
                        while (self.ability().abilities()[i].level() * 2 - 1 > parseInt(self.selectedHeroLevel())) {
                            self.ability().levelDownAbility(getIndex, null, null, self);
                        }
                    break;
                }
            }
            var getIndex = function () {
                return self.skillPointHistory()[self.skillPointHistory().length-1];
            };
            while (self.skillPointHistory().length > c) {
                self.ability().levelDownAbility(getIndex, null, null, self);
            }
            return c-self.skillPointHistory().length;
        }, this);
        self.primaryAttribute = ko.pureComputed(function () {
            var v = self.heroData().attributeprimary;
            if (v === 'DOTA_ATTRIBUTE_AGILITY') return 'agi';
            if (v === 'DOTA_ATTRIBUTE_INTELLECT') return 'int';
            if (v === 'DOTA_ATTRIBUTE_STRENGTH') return 'str';
            return '';
        });
        self.totalExp = ko.pureComputed(function () {
            return my.totalExp[self.selectedHeroLevel() - 1];
        });
        self.nextLevelExp = ko.pureComputed(function () {
            return my.nextLevelExp[self.selectedHeroLevel() - 1];
        });
        self.startingArmor = ko.pureComputed(function () {
            return (self.heroData().attributebaseagility * .14 + self.heroData().armorphysical).toFixed(2);
        });
        self.respawnTime = ko.pureComputed(function () {
            return 5 + 3.8 * self.selectedHeroLevel();
        });
        self.totalAttribute = function (a) {
            if (a === 'agi') return parseFloat(self.totalAgi());
            if (a === 'int') return parseFloat(self.totalInt());
            if (a === 'str') return parseFloat(self.totalStr());
            return 0;
        };
        self.totalAgi = ko.pureComputed(function () {
            return (self.heroData().attributebaseagility
                    + self.heroData().attributeagilitygain * (self.selectedHeroLevel() - 1) 
                    + self.inventory.getAttributes('agi') 
                    + self.ability().getAttributeBonusLevel() * 2
                    + self.ability().getAgility()
                    + self.enemy().ability().getAllStatsReduction()
                    + self.debuffs.getAllStatsReduction()
                   ).toFixed(2);
        });
        self.intStolen = ko.observable(0).extend({ numeric: 0 });
        self.totalInt = ko.pureComputed(function () {
            return (self.heroData().attributebaseintelligence 
                    + self.heroData().attributeintelligencegain * (self.selectedHeroLevel() - 1) 
                    + self.inventory.getAttributes('int') 
                    + self.ability().getAttributeBonusLevel() * 2
                    + self.ability().getIntelligence()
                    + self.enemy().ability().getAllStatsReduction()
                    + self.debuffs.getAllStatsReduction() + self.intStolen()
                   ).toFixed(2);
        });
        self.totalStr = ko.pureComputed(function () {
            return (self.heroData().attributebasestrength 
                    + self.heroData().attributestrengthgain * (self.selectedHeroLevel() - 1) 
                    + self.inventory.getAttributes('str') 
                    + self.ability().getAttributeBonusLevel() * 2
                    + self.ability().getStrength()
                    + self.enemy().ability().getStrengthReduction()
                    + self.enemy().ability().getAllStatsReduction()
                    + self.debuffs.getAllStatsReduction()
                   ).toFixed(2);
        });
        self.health = ko.pureComputed(function () {
            return (self.heroData().statushealth + Math.floor(self.totalStr()) * 20 
                    + self.inventory.getHealth()
                    + self.ability().getHealth()).toFixed(2);
        });
        self.healthregen = ko.pureComputed(function () {
            var healthRegenAura = _.reduce([self.inventory.getHealthRegenAura, self.buffs.itemBuffs.getHealthRegenAura], function (memo, fn) {
                var obj = fn(memo.excludeList);
                obj.value += memo.value;
                return obj;
            }, {value: 0, excludeList: []});
            return (self.heroData().statushealthregen + self.totalStr() * .03 
                    + self.inventory.getHealthRegen() 
                    + self.ability().getHealthRegen()
                    + self.buffs.getHealthRegen()
                    + healthRegenAura.value
                    ).toFixed(2);
        });
        self.mana = ko.pureComputed(function () {
            return (self.heroData().statusmana
                    + self.totalInt() * 12
                    + self.inventory.getMana()
                    + self.ability().getMana()).toFixed(2);
        });
        self.manaregen = ko.pureComputed(function () {
            return ((self.heroData().statusmanaregen 
                    + self.totalInt() * .04 
                    + self.ability().getManaRegen()) 
                    * (1 + self.inventory.getManaRegenPercent()) 
                    + (self.selectedHero().heroName === 'crystal_maiden' ? self.ability().getManaRegenArcaneAura() * 2 : self.buffs.getManaRegenArcaneAura())
                    + self.inventory.getManaRegenBloodstone()
					+ self.inventory.getManaRegen()
                    - self.enemy().ability().getManaRegenReduction()).toFixed(2);
        });
        self.totalArmorPhysical = ko.pureComputed(function () {
            var armorAura = _.reduce([self.inventory.getArmorAura, self.buffs.itemBuffs.getArmorAura], function (memo, fn) {
                var obj = fn(memo.attributes);
                return obj;
            }, {value:0, attributes:[]});
            var armorReduction = _.reduce([self.enemy().inventory.getArmorReduction, self.debuffs.itemBuffs.getArmorReduction], function (memo, fn) {
                var obj = fn(memo.excludeList);
                obj.value += memo.value;
                return obj;
            }, {value: 0, excludeList: []});
            return (self.enemy().ability().getArmorBaseReduction() * self.debuffs.getArmorBaseReduction() * (self.heroData().armorphysical + self.totalAgi() * .14)
                    + self.inventory.getArmor()
                    //+ self.inventory.getArmorAura().value
                    //+ self.enemy().inventory.getArmorReduction()
                    + self.ability().getArmor()
                    + self.enemy().ability().getArmorReduction()
                    + self.buffs.getArmor()
                    + self.buffs.itemBuffs.getArmor()
                    + self.debuffs.getArmorReduction()
                    //+ self.buffs.itemBuffs.getArmorAura().value
                    + armorAura.value
                    + armorReduction.value
                    //+ self.debuffs.getArmorReduction()
                    ).toFixed(2);
        });
        self.totalArmorPhysicalReduction = ko.pureComputed(function () {
			var totalArmor = self.totalArmorPhysical();
			if (totalArmor >= 0) {
				return ((0.06 * self.totalArmorPhysical()) / (1 + 0.06 * self.totalArmorPhysical()) * 100).toFixed(2);
			}
			else {
				return -((0.06 * -self.totalArmorPhysical()) / (1 + 0.06 * -self.totalArmorPhysical()) * 100).toFixed(2);
			}
		});
        self.totalMovementSpeed = ko.pureComputed(function () {
            var MIN_MOVESPEED = 100;
            var ms = (self.ability().setMovementSpeed() > 0 ? self.ability().setMovementSpeed() : self.buffs.setMovementSpeed());
            if (ms > 0) {
                return ms;
            }
            else {
                var movementSpeedPercent = _.reduce([self.inventory.getMovementSpeedPercent, self.buffs.itemBuffs.getMovementSpeedPercent], function (memo, fn) {
                    var obj = fn(memo.excludeList);
                    obj.value += memo.value;
                    return obj;
                }, {value:0, excludeList:[]});
                var movementSpeedPercentReduction = _.reduce([self.enemy().inventory.getMovementSpeedPercentReduction, self.debuffs.itemBuffs.getMovementSpeedPercentReduction], function (memo, fn) {
                    var obj = fn(memo.excludeList);
                    obj.value += memo.value;
                    return obj;
                }, {value:0, excludeList:[]});
                return Math.max(
                    self.enemy().inventory.isSheeped() || self.debuffs.itemBuffs.isSheeped() ? 140 :
                    (self.heroData().movementspeed + self.inventory.getMovementSpeedFlat()+ self.ability().getMovementSpeedFlat()) * 
                    (1 //+ self.inventory.getMovementSpeedPercent() 
                       + movementSpeedPercent.value
                       + movementSpeedPercentReduction.value
                       + self.ability().getMovementSpeedPercent() 
                       //+ self.enemy().inventory.getMovementSpeedPercentReduction() 
                       + self.enemy().ability().getMovementSpeedPercentReduction() 
                       + self.buffs.getMovementSpeedPercent() 
                       + self.debuffs.getMovementSpeedPercentReduction()
                       + self.unit().ability().getMovementSpeedPercent() 
                    )
                , MIN_MOVESPEED).toFixed(2);
            }
        });
        self.totalTurnRate = ko.pureComputed(function () {
            return (self.heroData().movementturnrate 
                    * (1 + self.enemy().ability().getTurnRateReduction()
                         + self.debuffs.getTurnRateReduction())).toFixed(2);
        });
        self.baseDamage = ko.pureComputed(function () {
            var totalAttribute = self.totalAttribute(self.primaryAttribute()),
                abilityBaseDamage = self.ability().getBaseDamage(),
                minDamage = self.heroData().attackdamagemin,
                maxDamage = self.heroData().attackdamagemax;
            return [Math.floor((minDamage + totalAttribute + abilityBaseDamage.total) * self.ability().getSelfBaseDamageReductionPct() * self.enemy().ability().getBaseDamageReductionPct() * self.debuffs.getBaseDamageReductionPct() * self.debuffs.itemBuffs.getBaseDamageReductionPct() * abilityBaseDamage.multiplier),
                    Math.floor((maxDamage + totalAttribute + abilityBaseDamage.total) * self.ability().getSelfBaseDamageReductionPct() * self.enemy().ability().getBaseDamageReductionPct() * self.debuffs.getBaseDamageReductionPct() * self.debuffs.itemBuffs.getBaseDamageReductionPct() * abilityBaseDamage.multiplier)];
        });
        self.bonusDamage = ko.pureComputed(function () {
            return ((self.inventory.getBonusDamage().total
                    + self.ability().getBonusDamage().total
                    + self.buffs.getBonusDamage().total
                    + Math.floor((self.baseDamage()[0] + self.baseDamage()[1]) / 2 
                                  * (self.buffs.itemBuffs.getBonusDamagePercent(self.inventory.getBonusDamagePercent()).total
                                     + self.ability().getBonusDamagePercent().total
                                     + self.buffs.getBonusDamagePercent().total
                                    )
                                )
                    + Math.floor(
                        (self.hero().attacktype() == 'DOTA_UNIT_CAP_RANGED_ATTACK' 
                            ? ((self.selectedHero().heroName == 'drow_ranger') ? self.ability().getBonusDamagePrecisionAura().total[0] * self.totalAgi() : self.buffs.getBonusDamagePrecisionAura().total[1])
                            : 0)
                      )
                    + Math.floor(
                        ((self.selectedHero().heroName == 'riki') ? self.ability().getBonusDamageBackstab().total[0] * self.totalAgi() : 0)
                      )
                    ) * self.ability().getSelfBaseDamageReductionPct()
                      * self.enemy().ability().getBaseDamageReductionPct()
                      * self.debuffs.itemBuffs.getBaseDamageReductionPct());
        });
        self.bonusDamageReduction = ko.pureComputed(function () {
            return Math.abs(self.enemy().ability().getBonusDamageReduction() + self.debuffs.getBonusDamageReduction());
        });
        self.damage = ko.pureComputed(function () {
            return [self.baseDamage()[0] + self.bonusDamage()[0],
                    self.baseDamage()[1] + self.bonusDamage()[1]];
        });
        self.totalMagicResistanceProduct = ko.pureComputed(function () {
            return (1 - self.heroData().magicalresistance / 100) 
                    * self.inventory.getMagicResist()
                    * self.ability().getMagicResist()
                    * self.buffs.getMagicResist()
					* self.inventory.getMagicResistReductionSelf()
					* self.enemy().inventory.getMagicResistReduction()
					* self.enemy().ability().getMagicResistReduction()
					* self.debuffs.getMagicResistReduction()
                    * self.debuffs.itemBuffs.getMagicResistReduction();
        });
        self.totalMagicResistance = ko.pureComputed(function () {
            return ((1 - self.totalMagicResistanceProduct()) * 100).toFixed(2);
        });
        self.bat = ko.pureComputed(function () {
            var abilityBAT = self.ability().getBAT();
            if (abilityBAT > 0) {
                return abilityBAT;
            }
            return self.heroData().attackrate;
        });
        self.ias = ko.pureComputed(function () {
            var attackSpeed = _.reduce([self.inventory.getAttackSpeed, self.buffs.itemBuffs.getAttackSpeed], function (memo, fn) {
                var obj = fn(memo.excludeList);
                obj.value += memo.value;
                return obj;
            }, {value:0, excludeList:[]});
            var attackSpeedReduction = _.reduce([self.enemy().inventory.getAttackSpeedReduction, self.debuffs.itemBuffs.getAttackSpeedReduction], function (memo, fn) {
                var obj = fn(memo.excludeList);
                obj.value += memo.value;
                return obj;
            }, {value:0, excludeList: []});
            var val = parseFloat(self.totalAgi()) 
                    //+ self.inventory.getAttackSpeed() 
                    + attackSpeed.value
                    + attackSpeedReduction.value
                    //+ self.enemy().inventory.getAttackSpeedReduction() 
                    + self.ability().getAttackSpeed() 
                    + self.enemy().ability().getAttackSpeedReduction() 
                    + self.buffs.getAttackSpeed() 
                    + self.debuffs.getAttackSpeedReduction()
                    + self.unit().ability().getAttackSpeed(); 
            if (val < -80) {
                return -80;
            }
            else if (val > 500) {
                return 500;
            }
            return val.toFixed(2);
        });
        self.attackTime = ko.pureComputed(function () {
            return (self.bat() / (1 + self.ias() / 100)).toFixed(2);
        });
        self.attacksPerSecond = ko.pureComputed(function () {
            return ((1 + self.ias() / 100) / self.bat()).toFixed(2);
        });
        self.evasion = ko.pureComputed(function () {
            if (self.enemy().inventory.isSheeped() || self.debuffs.itemBuffs.isSheeped()) return 0;
            var e = self.ability().setEvasion();
            if (e) {
                return (e * 100).toFixed(2);
            }
            else {
                return ((1-(self.inventory.getEvasion() * self.ability().getEvasion() * self.ability().getEvasionBacktrack() * self.buffs.itemBuffs.getEvasion())) * 100).toFixed(2);
            }
        });
        self.ehpPhysical = ko.pureComputed(function () {
            var evasion = self.enemy().inventory.isSheeped() || self.debuffs.itemBuffs.isSheeped() ? 1 : self.inventory.getEvasion() * self.ability().getEvasion() * self.buffs.itemBuffs.getEvasion();
            if (self.totalArmorPhysical() >= 0) {
                var ehp = self.health() * (1 + .06 * self.totalArmorPhysical());
            }
            else {
                var ehp = self.health() * (1 - .06 * self.totalArmorPhysical()) / (1 - .12 * self.totalArmorPhysical());
            }
            ehp /= (1 - (1 - (evasion * self.ability().getEvasionBacktrack())));
            ehp /= (1 - parseFloat(self.enemy().missChance()) / 100);
            ehp *= (_.some(self.inventory.activeItems(), function (item) {return item.item == 'mask_of_madness';}) ? (1 / 1.3) : 1);
			ehp *= (1 / self.ability().getDamageReduction());
			ehp *= (1 / self.buffs.getDamageReduction());
			ehp *= (1 / self.enemy().ability().getDamageAmplification());
			ehp *= (1 / self.debuffs.getDamageAmplification());
            return ehp.toFixed(2);
        });
        self.ehpMagical = ko.pureComputed(function () {
            var ehp = self.health() / self.totalMagicResistanceProduct();
            ehp *= (_.some(self.inventory.activeItems(), function (item) {return item.item == 'mask_of_madness';}) ? (1 / 1.3) : 1);
			ehp *= (1 / self.ability().getDamageReduction());
			ehp *= (1 / self.buffs.getDamageReduction());
			ehp *= (1 / self.ability().getEvasionBacktrack());
			ehp *= (1 / self.enemy().ability().getDamageAmplification());
            ehp *= (1 / self.debuffs.getDamageAmplification());
            return ehp.toFixed(2);
        });
        self.bash = ko.pureComputed(function () {
            var attacktype = self.heroData().attacktype;
            return ((1 - (self.inventory.getBash(attacktype) * self.ability().getBash())) * 100).toFixed(2);
        });

        self.cleaveInfo = ko.pureComputed(function () {
            var cleaveSources = self.inventory.getCleaveSource();
            $.extend(cleaveSources, self.ability().getCleaveSource());
            $.extend(cleaveSources, self.buffs.getCleaveSource());
            var cleaveSourcesArray = [];
            for (prop in cleaveSources) {
                var el = cleaveSources[prop];
                el.name = prop
                cleaveSourcesArray.push(el);
            }
            function compareByRadius(a,b) {
                if (a.radius < b.radius)
                    return 1;
                if (a.radius > b.radius)
                    return -1;
                return 0;
            }

            cleaveSourcesArray.sort(compareByRadius);
            var cleaveSourcesByRadius = {};
            for (var i = 0; i < cleaveSourcesArray.length; i++) {
                var total = 0;
                for (var j = 0; j <cleaveSourcesArray.length; j++) {
                    if (cleaveSourcesArray[j].radius >= cleaveSourcesArray[i].radius) {
                        total += cleaveSourcesArray[j].magnitude * cleaveSourcesArray[j].count;
                    }
                }
                cleaveSourcesByRadius[cleaveSourcesArray[i].radius] = total;
            }
            var result = [];
            for (prop in cleaveSourcesByRadius) {
                result.push({
                    'radius':prop,
                    'magnitude':cleaveSourcesByRadius[prop]
                });
            }
            return result;
        });
        
        self.critChance = ko.pureComputed(function () {
            return ((1 - (self.inventory.getCritChance() * self.ability().getCritChance())) * 100).toFixed(2);
        });

        self.critInfo = ko.pureComputed(function () {
            var critSources = self.inventory.getCritSource();
            $.extend(critSources, self.ability().getCritSource());
            $.extend(critSources, self.buffs.getCritSource());
            var critSourcesArray = [];
            for (prop in critSources) {
                var el = critSources[prop];
                el.name = prop
                critSourcesArray.push(el);
            }
            function compareByMultiplier(a,b) {
                if (a.multiplier < b.multiplier)
                    return 1;
                if (a.multiplier > b.multiplier)
                    return -1;
                return 0;
            }

            critSourcesArray.sort(compareByMultiplier);
            
            var result = [];
            var critTotal = 0;
            for (var i = 0; i < critSourcesArray.length; i++) {
                var total = 1;
                for (var j = 0; j < i; j++) {
                    for (var k = 0; k <critSourcesArray[j].count; k++) {
                        total *= (1 - critSourcesArray[j].chance);
                    }
                }
                var total2 = 1;
                for (var k = 0; k < critSourcesArray[i].count; k++) {
                    total2 *= (1 - critSourcesArray[i].chance);
                }
                total *= (1 - total2);
                critTotal += total;
                if (critSourcesArray[i].count > 1) {
                    result.push({
                        'name':critSourcesArray[i].displayname + ' x' + critSourcesArray[i].count,
                        'chance':critSourcesArray[i].chance,
                        'multiplier':critSourcesArray[i].multiplier,
                        'count':critSourcesArray[i].count,
                        'totalchance':total
                    });
                }
                else {
                    result.push({
                        'name':critSourcesArray[i].displayname,
                        'chance':critSourcesArray[i].chance,
                        'multiplier':critSourcesArray[i].multiplier,
                        'count':critSourcesArray[i].count,
                        'totalchance':total
                    });
                }
            }
            return { sources: result, total: critTotal };
        });
        
        self.bashInfo = ko.pureComputed(function () {
            var attacktype = self.heroData().attacktype;
            var bashSources = self.inventory.getBashSource(attacktype);
            $.extend(bashSources, self.ability().getBashSource());
            var bashSourcesArray = [];
            for (prop in bashSources) {
                var el = bashSources[prop];
                el.name = prop
                bashSourcesArray.push(el);
            }
            function compareByDuration(a, b) {
                if (a.duration < b.duration)
                    return 1;
                if (a.duration > b.duration)
                    return -1;
                return 0;
            }

            //bashSourcesArray.sort(compareByDuration);
            
            var result = [];
            var bashTotal = 0;
            for (var i = 0;i < bashSourcesArray.length; i++) {
                var total = 1;
                for (var j = 0; j < i; j++) {
                    for (var k = 0; k < bashSourcesArray[j].count; k++) {
                        total *= (1 - bashSourcesArray[j].chance);
                    }
                }
                var total2 = 1;
                for (var k = 0; k < bashSourcesArray[i].count; k++) {
                    total2 *= (1 - bashSourcesArray[i].chance);
                }
                total *= (1 - total2);
                bashTotal += total;
                if (bashSourcesArray[i].name === 'spirit_breaker_greater_bash') {
                    var d = bashSourcesArray[i].damage * self.totalMovementSpeed();
                }
                else {
                    var d = bashSourcesArray[i].damage;
                }
                if (bashSourcesArray[i].count > 1) {
                    result.push({
                        'name':bashSourcesArray[i].displayname + ' x' + bashSourcesArray[i].count,
                        'chance':bashSourcesArray[i].chance,
                        'damage':d,
                        'count':bashSourcesArray[i].count,
                        'damageType':bashSourcesArray[i].damageType,
                        'totalchance':total
                    });
                }
                else {
                    result.push({
                        'name':bashSourcesArray[i].displayname,
                        'chance':bashSourcesArray[i].chance,
                        'damage':d,
                        'count':bashSourcesArray[i].count,
                        'damageType':bashSourcesArray[i].damageType,
                        'totalchance':total
                    });
                }

            }
            return { sources: result, total: bashTotal };
        });
        
        self.orbProcInfo = ko.pureComputed(function () {
            var attacktype = self.heroData().attacktype;
            var damageSources = self.inventory.getOrbProcSource();
            var damageSourcesArray = [];
            for (prop in damageSources) {
                var el = damageSources[prop];
                el.name = prop
                damageSourcesArray.push(el);
            }
            function compareByDamage(a, b) {
                if (a.priority > b.priority) {
                    return 1;
                }
                if (a.priority < b.priority) {
                    return -1;
                }
                if (a.damage < b.damage)
                    return 1;
                if (a.damage > b.damage)
                    return -1;
                return 0;
            }

            damageSourcesArray.sort(compareByDamage);
            
            var result = [];
            var damageTotal = 0;
            for (var i=0 ; i < damageSourcesArray.length; i++) {
                var total = 1;
                for (var j = 0; j < i; j++) {
                    for (var k = 0; k < damageSourcesArray[j].count; k++) {
                        total *= (1 - damageSourcesArray[j].chance);
                    }
                }
                var total2 = 1;
                for (var k = 0; k < damageSourcesArray[i].count; k++) {
                    total2 *= (1 - damageSourcesArray[i].chance);
                }
                total *= (1 - total2);
                damageTotal += total;
                if (damageSourcesArray[i].count > 1) {
                    result.push({
                        'name':damageSourcesArray[i].displayname + ' x' + damageSourcesArray[i].count,
                        'chance':damageSourcesArray[i].chance,
                        'damage':damageSourcesArray[i].damage,
                        'count':damageSourcesArray[i].count,
                        'damageType':damageSourcesArray[i].damageType,
                        'totalchance':total
                    });
                }
                else {
                    result.push({
                        'name':damageSourcesArray[i].displayname,
                        'chance':damageSourcesArray[i].chance,
                        'damage':damageSourcesArray[i].damage,
                        'count':damageSourcesArray[i].count,
                        'damageType':damageSourcesArray[i].damageType,
                        'totalchance':total
                    });
                }
            }
            return { sources: result, total: damageTotal };
        });

        self.getReducedDamage = function (value, type) {
			var result = value;
            switch (type) {
                case 'physical':
                    /*if (self.enemy().totalArmorPhysical() >= 0) {
                        result = value * (1 - (0.06 * self.enemy().totalArmorPhysical()) / (1 + 0.06 * self.enemy().totalArmorPhysical()));
                    }
                    else {
                        result = value * (1 - (0.06 * Math.abs(self.enemy().totalArmorPhysical())) / (1 + 0.06 * Math.abs(self.enemy().totalArmorPhysical())));
                    }*/
                    result = value * (1 - (0.06 * self.enemy().totalArmorPhysical()) / (1 + 0.06 * Math.abs(self.enemy().totalArmorPhysical())));
                break;
                case 'magic':
                    result = value * (1 - self.enemy().totalMagicResistance() / 100);
                break;
                case 'pure':
                    result = value;
                break;
                case 'composite':
                    /*if (self.enemy().totalArmorPhysical() >= 0) {
                        result = value * (1 - (0.06 * self.enemy().totalArmorPhysical()) / (1 + 0.06 * self.enemy().totalArmorPhysical()));
                    }
                    else {
                        result = value * (1 + (1 - Math.pow(0.94, -self.enemy().totalArmorPhysical())));
                    }*/
                    result = value * (1 - (0.06 * self.enemy().totalArmorPhysical()) / (1 + 0.06 * Math.abs(self.enemy().totalArmorPhysical())));
                    result *= (1 - self.enemy().totalMagicResistance() / 100);
                break;
            }
			result *= self.ability().getDamageAmplification() * self.debuffs.getDamageAmplification();
            result *= self.enemy().ability().getDamageReduction() * self.enemy().buffs.getDamageReduction();
			return result;
        }
            
        self.damageTotalInfo = ko.pureComputed(function () {
            var bonusDamageArray = [
                self.ability().getBonusDamage().sources,
                self.buffs.getBonusDamage().sources
            ],
            bonusDamagePctArray = [
                self.ability().getBonusDamagePercent().sources,
                self.buffs.getBonusDamagePercent().sources
            ],
            itemBonusDamage = self.inventory.getBonusDamage().sources,
            itemBonusDamagePct = self.buffs.itemBuffs.getBonusDamagePercent(self.inventory.getBonusDamagePercent()).sources,
            critSources = self.critInfo(),
            abilityOrbSources = self.ability().getOrbSource(),
            itemOrbSources = self.inventory.getOrbSource(),
            itemProcOrbSources = self.orbProcInfo(),
            bashSources = self.bashInfo(),
            
            baseDamage = (self.baseDamage()[0] + self.baseDamage()[1]) / 2,
            totalDamage = baseDamage,
            totalCritableDamage = baseDamage,
            totalCrit = 0,
			geminateAttack = { damage: 0, damageReduced: 0, cooldown: 6, active: false },
            damage = {
                pure: 0,
                physical: baseDamage,
                magic: 0
            },
            result = [],
            crits = [];

            // bonus damage from items
            for (i in itemBonusDamage) {
                var d = itemBonusDamage[i].damage*itemBonusDamage[i].count * self.ability().getSelfBaseDamageReductionPct() * self.enemy().ability().getBaseDamageReductionPct() * self.debuffs.itemBuffs.getBaseDamageReductionPct();
                result.push({
                    name: itemBonusDamage[i].displayname + (itemBonusDamage[i].count > 1 ? ' x' + itemBonusDamage[i].count : ''),
                    damage: d,
                    damageType: itemBonusDamage[i].damageType,
                    damageReduced: self.getReducedDamage(d, itemBonusDamage[i].damageType)
                });
                totalDamage += d;
                totalCritableDamage += d;
                damage[itemBonusDamage[i].damageType] += d;
            }

            // bonus damage percent from items
            for (i in itemBonusDamagePct) {
                var d = baseDamage * itemBonusDamagePct[i].damage;
                result.push({
                    name: itemBonusDamagePct[i].displayname,
                    damage: d,
                    damageType: itemBonusDamagePct[i].damageType,
                    damageReduced: self.getReducedDamage(d, itemBonusDamagePct[i].damageType)
                });
                totalDamage += d;
                totalCritableDamage += d;
                damage[itemBonusDamagePct[i].damageType] += d;
            }
            
            // bonus damage from abilities and buffs
            for (var i = 0; i < bonusDamageArray.length; i++) {
                for (j in bonusDamageArray[i]) {
                    var d = bonusDamageArray[i][j].damage;
                    result.push({
                        name: bonusDamageArray[i][j].displayname,
                        damage: d,
                        damageType: bonusDamageArray[i][j].damageType,
                        damageReduced: self.getReducedDamage(d, bonusDamageArray[i][j].damageType)
                    });
                    totalDamage += d;
                    totalCritableDamage += d;
                    damage[bonusDamageArray[i][j].damageType] += d;
                }
            }
            
            // bonus damage percent from abilities and buffs
            for (var i = 0; i < bonusDamagePctArray.length; i++) {
                for (j in bonusDamagePctArray[i]) {
                    var d = baseDamage * bonusDamagePctArray[i][j].damage;
                    result.push({
                        name: bonusDamagePctArray[i][j].displayname,
                        damage: d,
                        damageType: bonusDamagePctArray[i][j].damageType,
                        damageReduced: self.getReducedDamage(d, bonusDamagePctArray[i][j].damageType)
                    });
                    totalDamage += d;
                    totalCritableDamage += d;
                    damage[bonusDamagePctArray[i][j].damageType] += d;
                }
            }
            // drow_ranger_trueshot
            if (self.hero().attacktype() === 'DOTA_UNIT_CAP_RANGED_ATTACK') {
                if (self.selectedHero().heroName === 'drow_ranger') {
                    var s = self.ability().getBonusDamagePrecisionAura().sources;
                    var index = 0;
                }
                else {
                    var s = self.buffs.getBonusDamagePrecisionAura().sources;
                    var index = 1;
                }
                if (s[index] != undefined) {
                    if (self.selectedHero().heroName === 'drow_ranger') {
                        var d = s[index].damage * self.totalAgi();
                    }
                    else {
                        var d = s[index].damage;
                    }
                    result.push({
                        name: s[index].displayname,
                        damage: d,
                        damageType: 'physical',
                        damageReduced: self.getReducedDamage(d, 'physical')
                    });
                    totalDamage += d;
                    totalCritableDamage += d;
                    damage.physical += d;                    
                }
            }
            
            // riki_backstab
            if (self.selectedHero().heroName === 'riki') {
                var s = self.ability().getBonusDamageBackstab().sources;
                var index = 0;
            }
            else {
                var s = self.buffs.getBonusDamageBackstab().sources;
                var index = 1;
            }
            if (s[index] != undefined) {
                if (self.selectedHero().heroName === 'riki') {
                    var d = s[index].damage * self.totalAgi();
                }
                else {
                    var d = s[index].damage;
                }
                result.push({
                    name: s[index].displayname,
                    damage: d,
                    damageType: 'physical',
                    damageReduced: self.getReducedDamage(d, 'physical')
                });
                totalDamage += d;
                //totalCritableDamage += d;
                damage.physical += d;                    
            }
			
			// weaver_geminate_attack
			if (self.selectedHero().heroName === 'weaver') {
				var a = _.find(self.ability().abilities(), function (ability) {
					return ability.name() === 'weaver_geminate_attack';
				});
				if (a) {
					if (a.level() > 0) {
						var cd = a.cooldown()[a.level() - 1],
							d = damage.physical;
						result.push({
							name: a.displayname() + ' every ' + cd + ' seconds',
							damage: d,
							damageType: 'physical',
							damageReduced: self.getReducedDamage(d, 'physical')
						});
						geminateAttack.damage += d;
						geminateAttack.damageReduced += self.getReducedDamage(d, 'physical');
						geminateAttack.cooldown = cd;
						geminateAttack.active = true;
					}
				}
			}
            
            // bash damage
            for (var i = 0; i < bashSources.sources.length; i++) {
                var d = bashSources.sources[i].damage * bashSources.sources[i].chance * bashSources.sources[i].count;
                result.push({
                    name: bashSources.sources[i].name,
                    damage: d,
                    damageType: bashSources.sources[i].damageType,
                    damageReduced: self.getReducedDamage(d, bashSources.sources[i].damageType)
                });
                totalDamage += d;
                damage[bashSources.sources[i].damageType] += d;
            }
            
            // %-based orbs
            for (var i = 0; i < itemProcOrbSources.sources.length; i++) {
                var d = itemProcOrbSources.sources[i].damage * (1 - Math.pow(1 - itemProcOrbSources.sources[i].chance, itemProcOrbSources.sources[i].count));
                result.push({
                    name: itemProcOrbSources.sources[i].name,
                    damage: d,
                    damageType: itemProcOrbSources.sources[i].damageType,
                    damageReduced: self.getReducedDamage(d, itemProcOrbSources.sources[i].damageType)
                });
                totalDamage += d;
                damage[itemProcOrbSources.sources[i].damageType] += d;
            }
            
            // ability orbs
            for (orb in abilityOrbSources) {
                var d = abilityOrbSources[orb].damage * (1 - itemProcOrbSources.total);
                result.push({
                    name: abilityOrbSources[orb].displayname,
                    damage: d,
                    damageType: abilityOrbSources[orb].damageType,
                    damageReduced: self.getReducedDamage(d, abilityOrbSources[orb].damageType)
                });
                totalDamage += d;
                damage[abilityOrbSources[orb].damageType] += d;
            }
            
            // item orbs
            if (_.size(abilityOrbSources) == 0) {
                for (orb in itemOrbSources) {
                    var d = itemOrbSources[orb].damage * (1 - itemProcOrbSources.total);
                    result.push({
                        name: itemOrbSources[orb].displayname,
                        damage: d,
                        damageType: itemOrbSources[orb].damageType,
                        damageReduced: self.getReducedDamage(d, itemOrbSources[orb].damageType)
                    });
                    totalDamage += d;
                    damage[itemOrbSources[orb].damageType] += d;
                }            
            }
            
            // crit damage
            for (var i = 0; i < critSources.sources.length; i++) {
                var d = totalCritableDamage * (critSources.sources[i].multiplier - 1) * critSources.sources[i].totalchance;
                crits.push({
                    name: critSources.sources[i].name,
                    damage: d,
                    damageType: 'physical',
                    damageReduced: self.getReducedDamage(d, 'physical')
                });
                totalCrit += d;
            }

            var totalReduced = self.getReducedDamage(damage.pure, 'pure') 
                    + self.getReducedDamage(damage.physical, 'physical')
                    + self.getReducedDamage(damage.magic, 'magic'),
                totalCritReduced = self.getReducedDamage(totalCrit, 'physical'),
                dps = {
                    base: totalDamage * self.attacksPerSecond(),
                    crit: totalCrit * self.attacksPerSecond(),
                    geminateAttack: geminateAttack.active ? geminateAttack.damage / geminateAttack.cooldown : 0,
                    reduced: {
                        base: totalReduced * self.attacksPerSecond(),
                        crit: totalCritReduced * self.attacksPerSecond(),
                        geminateAttack: geminateAttack.active ? self.getReducedDamage(geminateAttack.damage, 'physical') / geminateAttack.cooldown : 0,
                    }
                }
            
            return {
                sources: result,
                sourcesCrit: crits,
                total: totalDamage,
                totalCrit: totalCrit,
                totalGeminateAttack: totalDamage + geminateAttack.damage,
                totalGeminateAttackReduced: totalReduced + geminateAttack.damageReduced,
                geminateAttack: geminateAttack,
                totalCritReduced: totalCritReduced,
                totalReduced: totalReduced,
                sumTotal: totalDamage + totalCrit,
                sumTotalReduced: totalReduced + totalCritReduced,
                dps: {
                    base: dps.base,
                    crit: dps.base + dps.crit,
                    geminateAttack: dps.base + dps.geminateAttack,
                    total: dps.base + dps.crit + dps.geminateAttack,
                    reduced: {
                        base: dps.reduced.base,
                        crit: dps.reduced.base + dps.reduced.crit,
                        geminateAttack: dps.reduced.base + dps.reduced.geminateAttack,
                        total: dps.reduced.base + dps.reduced.crit + dps.reduced.geminateAttack
                    }
                }
            };
        });
        
        self.getDamageTypeColor = function (damageType) {
            switch (damageType) {
                case 'physical':
                    return '#979aa2';
                break;
                case 'pure':
                    return 'goldenrod';
                break;
                case 'magic':
                    return '#428bca';
                break;
                default:
                    return '#979aa2';
                break;
            }
        }
        
        self.critDamage = ko.computed(function () {
            self.critInfo();
            return 0;
        });
        self.missChance = ko.pureComputed(function () {
            var missDebuff = _.reduce([self.enemy().inventory.getMissChance, self.debuffs.itemBuffs.getMissChance], function (memo, fn) {
                var obj = fn(memo.excludeList);
                obj.value *= memo.value;
                return obj;
            }, {value:1, excludeList:[]});
            return ((1 - (self.enemy().ability().getMissChance() * self.debuffs.getMissChance() * missDebuff.value)) * 100).toFixed(2);
        });
        self.totalattackrange = ko.pureComputed(function () {
            var attacktype = self.heroData().attacktype;
            return self.heroData().attackrange + self.ability().getAttackRange() + self.inventory.getAttackRange(attacktype).value;
        });
        self.visionrangeday = ko.pureComputed(function () {
            return (self.heroData().visiondaytimerange) * (1 + self.enemy().ability().getVisionRangePctReduction() + self.debuffs.getVisionRangePctReduction());
        });
        self.visionrangenight = ko.pureComputed(function () {
            return (self.heroData().visionnighttimerange + self.inventory.getVisionRangeNight() + self.ability().getVisionRangeNight()) * (1 + self.enemy().ability().getVisionRangePctReduction() + self.debuffs.getVisionRangePctReduction());
        });
        self.lifesteal = ko.pureComputed(function () {
            var total = self.inventory.getLifesteal() + self.ability().getLifesteal() + self.buffs.getLifesteal();
            if (self.hero().attacktype() == 'DOTA_UNIT_CAP_MELEE_ATTACK') {
				var lifestealAura = _.reduce([self.inventory.getLifestealAura, self.buffs.itemBuffs.getLifestealAura], function (memo, fn) {
					var obj = fn(memo.excludeList);
					obj.value += memo.value;
					return obj;
				}, {value: 0, excludeList: []});
                total += lifestealAura.value;
            }
            return (total).toFixed(2);
        });

        self.damageBrackets = [
            ['medusa_mana_shield', 'templar_assassin_refraction', 'faceless_void_backtrack', 'nyx_assassin_spiked_carapace'],
            ['spectre_dispersion', 'wisp_overcharge', 'slardar_sprint','bristleback_bristleback', 'undying_flesh_golem'],
            ['abaddon_borrowed_time', 'abaddon_aphotic_shield', 'kunkka_ghostship', 'treant_living_armor'],
            ['chen_penitence', 'medusa_stone_gaze', 'shadow_demon_soul_catcher'],
            ['dazzle_shallow_grave']
        ];
        
        self.getDamageAfterBracket = function (initialDamage,index) {
            var bracket = self.damageBrackets[index];
            var multiplier = 1;
            for (var i = 0; i < bracket.length; i++) {
                if (_.findWhere(self.damageAmplification.buffs, {name: bracket[i].name}) != undefined || _.findWhere(self.damageReduction.buffs, {name: bracket[i].name}) != undefined) {
                    multiplier += bracket[i].value;
                }
            };
            return initialDamage * multiplier;
        };
        
        self.processDamageAmpReducBracket = function (index, sources, damage) {
            var multiplier = 1,
                data = [],
                damage = parseFloat(damage),
                total = parseFloat(damage);
                
            for (var i = 0; i < self.damageBrackets[index].length; i++) {
                if (sources[self.damageBrackets[index][i]] != undefined) {
                    multiplier = 1 + parseFloat(sources[self.damageBrackets[index][i]].multiplier);
                    total += (damage * multiplier) - damage;
                    data.push(new my.DamageInstance(
                        sources[self.damageBrackets[index][i]].displayname,
                        sources[self.damageBrackets[index][i]].damageType,
                        (damage * multiplier) - damage,
                        [],
                        total
                    ));
                }
            }
            return data;
        }
        
        self.getDamageAmpReducInstance = function(sources, initialDamage, ability, damageType) {
            var data = [],
                damage = parseFloat(initialDamage),
                prevDamage = damage,
                label = ability == 'initial' ? 'Initial' : sources[ability].displayname;

            // Bracket 0
            data = data.concat(self.processDamageAmpReducBracket(0, sources, damage));
            damage = data[data.length - 1] ? data[data.length - 1].total : damage;

            // Bracket 1
            data = data.concat(self.processDamageAmpReducBracket(1, sources, damage));
            damage = data[data.length - 1] ? data[data.length - 1].total : damage;
            
            // Bracket 2
            data = data.concat(self.processDamageAmpReducBracket(2, sources, damage));
            damage = data[data.length - 1] ? data[data.length - 1].total : damage;

            return new my.DamageInstance(label, damageType, initialDamage, data, data[data.length - 1] ? data[data.length - 1].total : damage);
        }
        
        self.getDamageAmpReduc = function (initialDamage) {
            var instances = [],
                sources = {},
                sourcesAmp = self.damageReduction.getDamageMultiplierSources(),
                sourcesReduc = self.damageAmplification.getDamageMultiplierSources();
            $.extend(sources, sourcesAmp);
            $.extend(sources, sourcesReduc);
            // Initial damage instance
            instances.push(self.getDamageAmpReducInstance(sources, initialDamage, 'initial', 'physical'));
            
            // Bracket 4 damage instances
            var b4 = ['shadow_demon_soul_catcher', 'medusa_stone_gaze', 'chen_penitence'];
            for (var i = 0; i < b4.length; i++) {
                if (sources[b4[i]] != undefined) {
                    instances.push(self.getDamageAmpReducInstance(sources, initialDamage * sources[b4[i]].multiplier, b4[i], sources[b4[i]].damageType));
                }
            }
        
            return new my.DamageInstance('Total', 'physical', initialDamage, instances, _.reduce(instances, function(memo, i) {return parseFloat(memo) + parseFloat(i.total);}, 0));
        };
        
        self.damageInputModified = ko.computed(function () {
            return self.getDamageAmpReduc(self.damageInputValue());
        });
        
        self.addIllusion = function (data, event) {
            self.illusions.push(ko.observable(new my.IllusionViewModel(0, self, self.illusionAbilityLevel())));
        };
        
        self.diffProperties = [
            'totalAgi',
            'totalInt',
            'totalStr',
            'health',
            'healthregen',
            'mana',
            'manaregen',
            'totalArmorPhysical',
            'totalArmorPhysicalReduction',
            'totalMovementSpeed',
            'totalTurnRate',
            'baseDamage',
            'bonusDamage',
            'bonusDamageReduction',
            'damage',
            'totalMagicResistanceProduct',
            'totalMagicResistance',
            'bat',
            'ias',
            'attackTime',
            'attacksPerSecond',
            'evasion',
            'ehpPhysical',
            'ehpMagical',
            'bash',
            'critChance',
            'critDamage',
            'missChance',
            'totalattackrange',
            'visionrangeday',
            'visionrangenight',
            'lifesteal'
        ];
        self.diff = {};
        self.getDiffFunction = function (prop) {
            return ko.computed(function () {
                if (prop == 'baseDamage') {
                    return [self[prop]()[0] - self.heroCompare()[prop]()[0], self[prop]()[1] - self.heroCompare()[prop]()[1]];
                }
                else {
                    return self[prop]() - self.heroCompare()[prop]();
                }
            }, this, { deferEvaluation: true });
        }
        for (var i = 0; i < self.diffProperties.length; i++) {
            var index = i;
            self.diff[self.diffProperties[index]] = self.getDiffFunction(self.diffProperties[index]);
        }
        
        self.buildExplorer = new my.BuildExplorerViewModel(self);
    };

    return my;
}(HEROCALCULATOR));
var HEROCALCULATOR = (function (my) {
    
    my.illusionData = {
        chaos_knight_phantasm: {
            hero: 'chaos_knight',
            displayName: 'Chaos Knight Phantasm',
            use_selected_hero: false,
            max_level: 3,
            outgoing_damage: 'outgoing_damage',
            incoming_damage: 'incoming_damage'
        },
        naga_siren_mirror_image: {
            hero: 'naga_siren',
            displayName: 'Naga Siren Mirror Image',
            use_selected_hero: false,
            max_level: 4,
            outgoing_damage: 'outgoing_damage',
            incoming_damage: 'incoming_damage'
        },
        dark_seer_wall_of_replica: {
            hero: 'dark_seer',
            displayName: 'Dark Seer Wall of Replica',
            use_selected_hero: true,
            max_level: 3,
            outgoing_damage: 'replica_damage_outgoing',
            incoming_damage: 'replica_damage_incoming',
            outgoing_damage_scepter: 'replica_damage_outgoing_scepter'
        },
        morphling_replicate: {
            hero: 'morphling',
            displayName: 'Morphling Replicate',
            use_selected_hero: true,
            max_level: 3,
            outgoing_damage: 'illusion_damage_out_pct',
            incoming_damage: 'illusion_damage_in_pct'
        },
        phantom_lancer_doppelwalk: {
            hero: 'phantom_lancer',
            displayName: 'Phantom Lancer Doppelwalk',
            use_selected_hero: false,
            max_level: 4,
            outgoing_damage: 'illusion_damage_out_pct',
            incoming_damage: 'illusion_damage_in_pct'        
        },
        phantom_lancer_juxtapose: {
            hero: 'phantom_lancer',
            displayName: 'Phantom Lancer Juxtapose',
            use_selected_hero: false,
            max_level: 4,
            outgoing_damage: 'illusion_damage_out_pct',
            incoming_damage: 'illusion_damage_in_pct'        
        },
        phantom_lancer_spirit_lance: {
            hero: 'phantom_lancer',
            displayName: 'Phantom Lancer Spirit Lance',
            use_selected_hero: false,
            max_level: 4,
            outgoing_damage: 'illusion_damage_out_pct',
            incoming_damage: 'illusion_damage_in_pct'        
        },
        shadow_demon_disruption: {
            hero: 'shadow_demon',
            displayName: 'Shadow Demon Disruption',
            use_selected_hero: true,
            max_level: 4,
            outgoing_damage: 'illusion_outgoing_damage',
            incoming_damage: 'illusion_incoming_damage'        
        },
        spectre_haunt: {
            hero: 'spectre',
            displayName: 'Spectre Haunt',
            use_selected_hero: false,
            max_level: 3,
            outgoing_damage: 'illusion_damage_outgoing',
            incoming_damage: 'illusion_damage_incoming'        
        },
        terrorblade_conjure_image: {
            hero: 'terrorblade',
            displayName: 'Terrorblade Conjure Image',
            use_selected_hero: false,
            max_level: 4,
            outgoing_damage: 'illusion_outgoing_damage',
            incoming_damage: 'illusion_incoming_damage'        
        },
        terrorblade_reflection: {
            hero: 'terrorblade',
            displayName: 'Terrorblade Reflection',
            use_selected_hero: true,
            max_level: 4,
            outgoing_damage: 'illusion_outgoing_damage'     
        },
        item_manta: {
            hero: '',
            is_item: true,
            displayName: 'Manta Style Illusion',
            use_selected_hero: true,
            max_level: 1,
            outgoing_damage_melee: 'images_do_damage_percent_melee',
            incoming_damage_melee: 'images_take_damage_percent_melee',
            outgoing_damage_ranged: 'images_do_damage_percent_ranged',
            incoming_damage_ranged: 'images_take_damage_percent_ranged'
        }
    }
    
    my.IllusionViewModel = function (h, p, abilityLevel) {
        var self = new my.HeroCalculatorModel(0);
        self.parent = p;
        self.inventory = self.parent.inventory;
        self.illusionType = ko.observable(self.parent.selectedIllusion().illusionName);
        self.illusionDisplayName = ko.observable(self.parent.selectedIllusion().illusionDisplayName);
        self.illusionAbilityLevel(abilityLevel);
        self.illusionAbilityMaxLevel = ko.observable(my.illusionData[self.parent.selectedIllusion().illusionName].max_level);
        if (!my.illusionData[self.illusionType()].use_selected_hero) {
            self.selectedHero(_.findWhere(self.availableHeroes(), {heroName: self.parent.selectedIllusion().baseHero}));
        }
        else {
            self.selectedHero(self.parent.selectedHero());
        }
        self.selectedHeroLevel(self.parent.selectedHeroLevel());
        self.hero = ko.computed(function() {
            return ko.mapping.fromJS(my.heroData['npc_dota_hero_' + self.selectedHero().heroName]);
        });
        
        self.ability().getAttributeBonusLevel = self.parent.ability().getAttributeBonusLevel;
        self.totalAgi = ko.computed(function () {
            return (self.heroData().attributebaseagility
                    + self.heroData().attributeagilitygain * (self.selectedHeroLevel() - 1) 
                    + self.inventory.getAttributes('agi') 
                    + self.ability().getAttributeBonusLevel() * 2
                    + self.ability().getAgility()
                    + self.enemy().ability().getAllStatsReduction()
                    + self.debuffs.getAllStatsReduction()
                   ).toFixed(2);
        });
        self.intStolen = ko.observable(0).extend({ numeric: 0 });
        self.totalInt = ko.computed(function () {
            return (self.heroData().attributebaseintelligence 
                    + self.heroData().attributeintelligencegain * (self.selectedHeroLevel() - 1) 
                    + self.inventory.getAttributes('int') 
                    + self.ability().getAttributeBonusLevel() * 2
                    + self.ability().getIntelligence()
                    + self.enemy().ability().getAllStatsReduction()
                    + self.debuffs.getAllStatsReduction() + self.intStolen()
                   ).toFixed(2);
        });
        self.totalStr = ko.computed(function () {
            return (self.heroData().attributebasestrength 
                    + self.heroData().attributestrengthgain * (self.selectedHeroLevel() - 1) 
                    + self.inventory.getAttributes('str') 
                    + self.ability().getAttributeBonusLevel() * 2
                    + self.ability().getStrength()
                    + self.enemy().ability().getAllStatsReduction()
                    + self.debuffs.getAllStatsReduction()
                   ).toFixed(2);
        });
        
        self.getAbilityAttributeValue = function(hero, ability, attributeName, level) {
            if (ability == 'item_manta') {
                var abilityObj = my.itemData[ability];
            }
            else {
                var abilityObj = _.findWhere(my.heroData['npc_dota_hero_' + hero].abilities, {name: ability});
            }
            var attribute = _.findWhere(abilityObj.attributes, {name: attributeName});
            if (level == 0) {
                return parseFloat(attribute.value[0]);
            }
            else if (level > attribute.length) {
                return parseFloat(attribute.value[0]);
            }
            else {
                return parseFloat(attribute.value[level - 1]);
            }
        }
        
        self.getIncomingDamageMultiplier = function(illusionType, hasScepter, attackType) {
            if (illusionType == 'item_manta') {
                if (attackType == 'DOTA_UNIT_CAP_MELEE_ATTACK') {
                    return (1 + self.getAbilityAttributeValue(my.illusionData[self.illusionType()].hero, self.illusionType(), my.illusionData[illusionType].incoming_damage_melee, self.illusionAbilityLevel())/100)
                }
                else {
                    return (1 + self.getAbilityAttributeValue(my.illusionData[self.illusionType()].hero, self.illusionType(), my.illusionData[illusionType].incoming_damage_ranged, self.illusionAbilityLevel())/100)
                }
            }
            else {
                return (1 + self.getAbilityAttributeValue(my.illusionData[self.illusionType()].hero, self.illusionType(), my.illusionData[illusionType].incoming_damage, self.illusionAbilityLevel())/100)
            }
        }
        self.getOutgoingDamageMultiplier = function(illusionType, hasScepter, attackType) {
            if (illusionType == 'item_manta') {
                if (attackType == 'DOTA_UNIT_CAP_MELEE_ATTACK') {
                    return (1 + self.getAbilityAttributeValue(my.illusionData[self.illusionType()].hero, self.illusionType(), my.illusionData[illusionType].outgoing_damage_melee, self.illusionAbilityLevel())/100);
                }
                else {
                    return (1 + self.getAbilityAttributeValue(my.illusionData[self.illusionType()].hero, self.illusionType(), my.illusionData[illusionType].outgoing_damage_ranged, self.illusionAbilityLevel())/100);
                }
            }
            else {
                return (1 + self.getAbilityAttributeValue(my.illusionData[self.illusionType()].hero, self.illusionType(), my.illusionData[illusionType].outgoing_damage, self.illusionAbilityLevel())/100);
            }
        }

        self.baseDamage = ko.computed(function() {
            return [Math.floor(my.heroData['npc_dota_hero_' + self.selectedHero().heroName].attackdamagemin + self.totalAttribute(self.primaryAttribute()) + self.ability().getBaseDamage().total)
                    * self.getOutgoingDamageMultiplier(self.illusionType(), false, self.hero().attacktype()),
                    Math.floor(my.heroData['npc_dota_hero_' + self.selectedHero().heroName].attackdamagemax + self.totalAttribute(self.primaryAttribute()) + self.ability().getBaseDamage().total)
                    * self.getOutgoingDamageMultiplier(self.illusionType(), false, self.hero().attacktype())];
        });
        
        self.damage = ko.computed(function() {
            return [self.baseDamage()[0],
                    self.baseDamage()[1]];
        });
        
        self.ehpPhysical = ko.computed(function() {
            var ehp = (self.health() * (1 + .06 * self.totalArmorPhysical())) / (1 - (1 - (self.inventory.getEvasion() * self.ability().getEvasion())))
            ehp *= (_.some(self.inventory.activeItems(), function(item) {return item.item == 'mask_of_madness';}) ? (1 / 1.3) : 1);
            ehp *= (1 / self.getIncomingDamageMultiplier(self.illusionType(), false, self.hero().attacktype()));
            return ehp.toFixed(2);
        });
        self.ehpMagical = ko.computed(function() {
            var ehp = self.health() / self.totalMagicResistanceProduct();
            ehp *= (1 / self.getIncomingDamageMultiplier(self.illusionType(), false, self.hero().attacktype()));
            return ehp.toFixed(2);
        });
        
        self.totalArmorPhysical = ko.computed(function() {
            return (self.enemy().ability().getArmorBaseReduction() * self.debuffs.getArmorBaseReduction() * (my.heroData['npc_dota_hero_' + self.selectedHero().heroName].armorphysical + self.totalAgi() * .14)
                    + self.ability().getArmor() + self.enemy().ability().getArmorReduction() + self.buffs.getArmor() + self.debuffs.getArmorReduction()).toFixed(2);
        });
        
        self.ias = ko.computed(function() {
            var val = parseFloat(self.totalAgi()) 
                    + self.ability().getAttackSpeed() 
                    + self.enemy().ability().getAttackSpeedReduction() 
                    + self.buffs.getAttackSpeed() 
                    + self.debuffs.getAttackSpeedReduction()
                    + self.unit().ability().getAttackSpeed(); 
            if (val < -80) {
                return -80;
            }
            else if (val > 400) {
                return 400;
            }
            return val.toFixed(2);
        });
        
        return self;
    }

    return my;
}(HEROCALCULATOR));
var HEROCALCULATOR = (function (my) {

    my.CloneOption = function (name, displayname, levels, image, level) {
        this.heroName = ko.computed(function() {
            return (levels > 0) ? name + (level() <= levels ? level() : 1) : name;
        });
        this.heroDisplayName = displayname;
        this.image = image;
        this.levels = levels;
    };
    
    my.CloneViewModel = function (h,p) {
        var self = new my.HeroCalculatorModel(0);
        self.parent = p;
        self.selectedHero(_.findWhere(self.availableHeroes(), {heroName: 'meepo'}));
        self.hero = ko.computed(function() {
            return ko.mapping.fromJS(my.heroData['npc_dota_hero_meepo']);
        });
        return self;
    }

    return my;
}(HEROCALCULATOR));
var HEROCALCULATOR = (function (my) {

    my.UnitOption = function (name, displayname, levels, image, level) {
        this.heroName = ko.computed(function() {
            return (levels > 0) ? name + (level() <= levels ? level() : 1) : name;
        });
        this.heroDisplayName = displayname;
        this.image = image;
        this.levels = levels;
    };
    
    my.UnitViewModel = function (h,p) {
        var self = new my.HeroCalculatorModel(0);
        self.parent = p;
        self.selectedUnitLevel = ko.observable(1);
        self.availableUnits = ko.observableArray([
            new my.UnitOption('npc_dota_lone_druid_bear', 'Lone Druid Spirit Bear',4,'/media/images/units/spirit_bear.png', self.selectedUnitLevel),
            new my.UnitOption('npc_dota_brewmaster_earth_','Brewmaster Earth Warrior',3,'/media/images/units/npc_dota_brewmaster_earth.png', self.selectedUnitLevel),
            new my.UnitOption('npc_dota_brewmaster_fire_','Brewmaster Fire Warrior',3,'/media/images/units/npc_dota_brewmaster_fire.png', self.selectedUnitLevel),
            new my.UnitOption('npc_dota_brewmaster_storm_','Brewmaster Storm Warrior',3,'/media/images/units/npc_dota_brewmaster_storm.png', self.selectedUnitLevel),
            new my.UnitOption('npc_dota_necronomicon_archer_','Necronomicon Archer',3,'/media/images/units/npc_dota_necronomicon_archer.png', self.selectedUnitLevel),
            new my.UnitOption('npc_dota_necronomicon_warrior_','Necronomicon Warrior',3,'/media/images/units/npc_dota_necronomicon_warrior.png', self.selectedUnitLevel),
            new my.UnitOption('npc_dota_lycan_wolf','Lycan Wolf',4,'/media/images/units/npc_dota_lycan_wolf.png', self.selectedUnitLevel),
            new my.UnitOption('npc_dota_visage_familiar','Visage Familiar',3,'/media/images/units/npc_dota_visage_familiar.png', self.selectedUnitLevel)
        ]);
        self.selectedUnit = ko.observable(self.availableUnits()[h]);
        self.selectedUnit.subscribe(function(newValue) {
            if (newValue.heroName().indexOf('npc_dota_lone_druid_bear') != -1) {
                self.inventory.hasInventory(true);
                self.inventory.items.removeAll();
                self.inventory.activeItems.removeAll();
            }
            else {
                self.inventory.hasInventory(false);
                self.inventory.items.removeAll();
                self.inventory.activeItems.removeAll();
            }
        });
        self.hero = ko.computed(function() {
            return ko.mapping.fromJS(my.unitData[self.selectedUnit().heroName()]);
        });
		self.heroData = ko.computed(function() {
			return my.unitData[self.selectedUnit().heroName()];
		});
        self.getAbilityLevelMax = function(data) {
            if (data.abilitytype() == 'DOTA_ABILITY_TYPE_ATTRIBUTES') {
                return 10;
            }
            else if (data.name() == 'necronomicon_archer_mana_burn' || data.name() == 'necronomicon_archer_aoe'
                || data.name() == 'necronomicon_warrior_mana_burn' || data.name() == 'necronomicon_warrior_last_will') {
                return 3;
            }
            else if (data.name() == 'necronomicon_warrior_sight') {
                return 1;
            }
            else {
                return 4;
            }
        };
        self.ability = ko.computed(function() {
            var a = new my.AbilityModel(ko.mapping.fromJS(my.unitData[self.selectedUnit().heroName()].abilities));
            a.hasScepter = self.inventory.hasScepter
            switch (self.selectedUnit().heroName()) {
                case 'npc_dota_necronomicon_archer_1':
                case 'npc_dota_necronomicon_warrior_1':
                    a.abilities()[0].level(1);
                    a.abilities()[1].level(1);
                break;
                case 'npc_dota_necronomicon_archer_2':
                case 'npc_dota_necronomicon_warrior_2':
                    a.abilities()[0].level(2);
                    a.abilities()[1].level(2);
                break;
                case 'npc_dota_necronomicon_archer_3':
                    a.abilities()[0].level(3);
                    a.abilities()[1].level(3);
                break;
                case 'npc_dota_necronomicon_warrior_3':
                    a.abilities()[0].level(3);
                    a.abilities()[1].level(3);
                    a.abilities()[2].level(1);
                break;
            }
            a.levelUpAbility = function(index, data, event, hero) {
                switch (a.abilities()[index()].name()) {
                    case 'necronomicon_archer_mana_burn':
                    case 'necronomicon_archer_aoe':
                    case 'necronomicon_warrior_mana_burn':
                    case 'necronomicon_warrior_last_will':
                    case 'necronomicon_warrior_sight':
                    break;
                    default:
                        if (a.abilities()[index()].level() < hero.getAbilityLevelMax(data)) {
                            a.abilities()[index()].level(a.abilities()[index()].level()+1);
                        }                    
                    break;
                }

            };
            a.levelDownAbility = function(index, data, event, hero) {            
                switch (a.abilities()[index()].name()) {
                    case 'necronomicon_archer_mana_burn':
                    case 'necronomicon_archer_aoe':
                    case 'necronomicon_warrior_mana_burn':
                    case 'necronomicon_warrior_last_will':
                    case 'necronomicon_warrior_sight':
                    break;
                    default:
                        if (a.abilities()[index()].level()>0) {
                            a.abilities()[index()].level(a.abilities()[index()].level()-1);
                        }
                    break;
                }
            };
            return a;
        });        
        self.primaryAttribute = ko.computed(function() {
            //var v = my.unitData[self.selectedUnit().heroName()].attributeprimary;
            var v = 0;
            if (v == 'DOTA_ATTRIBUTE_AGILITY') {
                return 'agi'
            }
            else if (v == 'DOTA_ATTRIBUTE_INTELLECT') {
                return 'int'
            }
            else if (v == 'DOTA_ATTRIBUTE_STRENGTH') {
                return 'str'
            }
            else {
                return ''
            }
        });
        self.totalAttribute = function(a) {
            if (a == 'agi') {
                return parseFloat(self.totalAgi());
            }
            if (a == 'int') {
                return parseFloat(self.totalInt());
            }
            if (a == 'str') {
                return parseFloat(self.totalStr());
            }
            return 0;
        };
        self.totalAgi = ko.computed(function() {
            return (my.unitData[self.selectedUnit().heroName()].attributebaseagility
                    + my.unitData[self.selectedUnit().heroName()].attributeagilitygain * (self.selectedHeroLevel() - 1) 
                    //+ self.inventory.getAttributes('agi') 
                    + self.ability().getAttributeBonusLevel()*2
                    + self.ability().getAgility()
                    + self.enemy().ability().getAllStatsReduction()
                    + self.debuffs.getAllStatsReduction()
                   ).toFixed(2);
        });
        self.totalInt = ko.computed(function() {
            return (my.unitData[self.selectedUnit().heroName()].attributebaseintelligence 
                    + my.unitData[self.selectedUnit().heroName()].attributeintelligencegain * (self.selectedHeroLevel() - 1) 
                    //+ self.inventory.getAttributes('int') 
                    + self.ability().getAttributeBonusLevel()*2
                    + self.ability().getIntelligence()
                    + self.enemy().ability().getAllStatsReduction()
                    + self.debuffs.getAllStatsReduction()
                   ).toFixed(2);
        });
        self.totalStr = ko.computed(function() {
            return (my.unitData[self.selectedUnit().heroName()].attributebasestrength 
                    + my.unitData[self.selectedUnit().heroName()].attributestrengthgain * (self.selectedHeroLevel() - 1) 
                    //+ self.inventory.getAttributes('str') 
                    + self.ability().getAttributeBonusLevel()*2
                    + self.ability().getStrength()
                    + self.enemy().ability().getAllStatsReduction()
                    + self.debuffs.getAllStatsReduction()
                   ).toFixed(2);
        });
        /*self.health = ko.computed(function() {
            return (my.unitData[self.selectedUnit().heroName()].statushealth + self.totalStr()*19 
                    + self.inventory.getHealth()
                    + self.ability().getHealth()).toFixed(2);
        });
        self.healthregen = ko.computed(function() {
            return (my.unitData[self.selectedUnit().heroName()].statushealthregen + self.totalStr()*.03 
                    + self.inventory.getHealthRegen() 
                    + self.ability().getHealthRegen()
                    + self.buffs.getHealthRegen()).toFixed(2);
        });
        self.mana = ko.computed(function() {
            return (my.unitData[self.selectedUnit().heroName()].statusmana + self.totalInt()*13 + self.inventory.getMana()).toFixed(2);
        });
        self.manaregen = ko.computed(function() {
            return ((my.unitData[self.selectedUnit().heroName()].statusmanaregen 
                    + self.totalInt()*.04 
                    + self.ability().getManaRegen()) 
                    * (1 + self.inventory.getManaRegenPercent()) 
                    + (self.selectedHero().heroName == 'crystal_maiden' ? self.ability().getManaRegenArcaneAura() * 2 : self.buffs.getManaRegenArcaneAura())
                    + self.inventory.getManaRegenBloodstone()
                    - self.enemy().ability().getManaRegenReduction()).toFixed(2);
        });
        self.totalArmorPhysical = ko.computed(function() {
            return (self.enemy().ability().getArmorBaseReduction() * self.debuffs.getArmorBaseReduction() * (my.unitData[self.selectedUnit().heroName()].armorphysical + self.totalAgi()*.14)
                    + self.inventory.getArmor() + self.ability().getArmor() + self.enemy().ability().getArmorReduction() + self.buffs.getArmor() + self.debuffs.getArmorReduction()).toFixed(2);
        });
        self.totalArmorPhysicalReduction = ko.computed(function() {
			return ((0.06 * self.totalArmorPhysical()) / (1 + 0.06 * self.totalArmorPhysical()) * 100).toFixed(2);
		});
        self.totalMovementSpeed = ko.computed(function() {
            if (self.parent.ability().isShapeShiftActive()) {
                return 522;
            }
            var ms = (self.ability().setMovementSpeed() > 0 ? self.ability().setMovementSpeed() : self.buffs.setMovementSpeed());
            if (ms > 0) {
                return ms;
            }
            else {
                return ((my.unitData[self.selectedUnit().heroName()].movementspeed + self.inventory.getMovementSpeedFlat()+ self.ability().getMovementSpeedFlat()) * 
                        (1 + self.inventory.getMovementSpeedPercent() 
                           + self.ability().getMovementSpeedPercent() 
                           + self.enemy().inventory.getMovementSpeedPercentReduction() 
                           + self.enemy().ability().getMovementSpeedPercentReduction() 
                           + self.buffs.getMovementSpeedPercent() 
                           + self.debuffs.getMovementSpeedPercentReduction()
                        )).toFixed(2);
            }
        });
        self.totalTurnRate = ko.computed(function() {
            return (my.unitData[self.selectedUnit().heroName()].movementturnrate 
                    * (1 + self.enemy().ability().getTurnRateReduction()
                         + self.debuffs.getTurnRateReduction())).toFixed(2);
        });
		*/
        self.baseDamage = ko.computed(function() {
            return [Math.floor(my.unitData[self.selectedUnit().heroName()].attackdamagemin + self.totalAttribute(self.primaryAttribute()) + self.ability().getBaseDamage().total),
                    Math.floor(my.unitData[self.selectedUnit().heroName()].attackdamagemax + self.totalAttribute(self.primaryAttribute()) + self.ability().getBaseDamage().total)];
        });
        /*self.bonusDamage = ko.computed(function() {
            return self.inventory.getBonusDamage().total
                    + self.ability().getBonusDamage().total
                    + self.buffs.getBonusDamage().total
                    + Math.floor((self.baseDamage()[0] + self.baseDamage()[1])/2 
                                  * (self.inventory.getBonusDamagePercent().total
                                     + self.ability().getBonusDamagePercent().total
                                     + self.buffs.getBonusDamagePercent().total
                                    )
                                )
                    + Math.floor(
                        (self.hero().attacktype() == 'DOTA_UNIT_CAP_RANGED_ATTACK' 
                            ? ((self.selectedHero().heroName == 'drow_ranger') ? self.ability().getBonusDamagePrecisionAura().total[0] * self.totalAgi() : self.buffs.getBonusDamagePrecisionAura().total[1])
                            : 0)
                      );
        });*/
        /*self.bonusDamageReduction = ko.computed(function() {
            return Math.abs(self.enemy().ability().getBonusDamageReduction() + self.debuffs.getBonusDamageReduction());
        });
        self.damage = ko.computed(function() {
            return [self.baseDamage()[0] + self.bonusDamage()[0],
                    self.baseDamage()[1] + self.bonusDamage()[1]];
        });*/
        self.totalMagicResistanceProduct = ko.computed(function() {
            return (1 - my.unitData[self.selectedUnit().heroName()].magicalresistance / 100) 
                       * (1 - self.inventory.getMagicResist() / 100) 
                       * (1 - self.ability().getMagicResist() / 100) 
                       * (1 - self.buffs.getMagicResist() / 100) 
                       * self.enemy().inventory.getMagicResistReduction()
                       * self.enemy().ability().getMagicResistReduction() 
                       * self.debuffs.getMagicResistReduction();
        });
        self.totalMagicResistance = ko.computed(function() {
            return (1 - self.totalMagicResistanceProduct());
        });
        self.bat = ko.computed(function() {
            var abilityBAT = self.ability().getBAT();
            if (abilityBAT > 0) {
                return abilityBAT;
            }
            return my.unitData[self.selectedUnit().heroName()].attackrate;
        });
        /*
        self.ias = ko.computed(function() {
            var val = parseFloat(self.totalAgi()) 
                    + self.inventory.getAttackSpeed() 
                    + self.ability().getAttackSpeed() 
                    + self.enemy().ability().getAttackSpeedReduction() 
                    + self.buffs.getAttackSpeed() 
                    + self.debuffs.getAttackSpeedReduction();
            if (val < -80) {
                return -80;
            }
            else if (val > 400) {
                return 400;
            }
            return (val).toFixed(2);
        });*/
        self.attackTime = ko.computed(function() {
            return (self.bat() / (1 + self.ias() / 100)).toFixed(2);
        });
        self.attacksPerSecond = ko.computed(function() {
            return (1 + self.ias() / 100) / self.bat();
        });
        self.evasion = ko.computed(function() {
            var e = self.ability().setEvasion();
            if (e) {
                return (e * 100).toFixed(2) + '%';
            }
            else {
                return ((1-(self.inventory.getEvasion() * self.ability().getEvasion())) * 100).toFixed(2) + '%';
            }
        });
        self.ehpPhysical = ko.computed(function() {
            return ((self.health() * (1 + .06 * self.totalArmorPhysical())) / (1-(1-(self.inventory.getEvasion() * self.ability().getEvasion())))).toFixed(2);
        });
        self.ehpMagical = ko.computed(function() {
            return (self.health() / self.totalMagicResistanceProduct()).toFixed(2);
        });
        
        return self;
    }

    return my;
}(HEROCALCULATOR));
