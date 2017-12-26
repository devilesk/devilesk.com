require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({31:[function(require,module,exports){
var $ = jQuery = require('jquery');
require('jquery-ui/ui/version');
require('jquery-ui/ui/ie');
require('jquery-ui/ui/data');
require('jquery-ui/ui/plugin');
require('jquery-ui/ui/safe-active-element');
require('jquery-ui/ui/safe-blur');
require('jquery-ui/ui/scroll-parent');
require('jquery-ui/ui/widget');
require('jquery-ui/ui/widgets/mouse');
require('jquery-ui/ui/widgets/draggable');
require('jquery-ui/ui/widgets/droppable');
require('../lib/jquery.ui.touch-punch');
require('bootstrap');
var _ = require('underscore');

$(function () {
    $.getJSON("/media/dota-json/herodata.json", function (data) {
        var heroes = Object.keys(data),
            herodata = data;
            
        createQuestion();

        function createQuestion() {
            var h = heroes[Math.floor(Math.random() * heroes.length)],
                data = herodata[h],
                count = 0,
				imgCount = 0;
			$('#contentcontainer').hide();
            $('#abilitybox_start').empty();
            $('#abilitybox_end').empty();
            $('#heroportrait').empty();
            $('#heroname').empty();
			imgCount = data.abilities.filter(function (ability) { 
				return ability.name != 'attribute_bonus' && ability.displayname != 'Empty' && ability.displayname != ''
			}).length + 1;
			
			function checkShowContent() {
				if (imgCount == 0) {
					$('#contentcontainer').show();
				}
			}
			var portraitImage = new Image();
			portraitImage.src = "/media/images/heroes/" + h.replace('npc_dota_hero_','') + ".png";
			portraitImage.onload = function () {
				$('#heroportrait').attr('src', portraitImage.src);
				imgCount--;
				checkShowContent();
			};
            $('#heroname').text(data.displayname);
            
			function setImage(element, src) {
				element.css('background-image', 'url(' + src + ')');
				imgCount--;
				checkShowContent();
			}
			
            for (var i = 0; i < data.abilities.length; i++) {
                if (data.abilities[i].name != 'attribute_bonus' && data.abilities[i].displayname != 'Empty' && data.abilities[i].displayname != '') {
                    var abilityboxend = $('<div class=abilitybox_end id=ability_' + i + '></div>').droppable({
                        accept: '#' + data.abilities[i].name,
                        tolerance: 'intersect',
                        drop: function (event, ui) {
                            var drop_p = $(this).offset(),
                                drag_p = ui.draggable.offset(),
                                left_end = drop_p.left - drag_p.left,
                                top_end = drop_p.top - drag_p.top;
                            ui.draggable.animate({
                                top: '+=' + top_end,
                                left: '+=' + left_end
                            },
                                function() {
                                    count += 1;
                                    if (count == data.abilities.length - 1) {
                                        createQuestion();
                                    }
                                }
                            );
                        }
                    }).appendTo('#abilitybox_end');

                    var imageUrl = "/media/images/spellicons/" + data.abilities[i].name + ".png";
						overlay = $('<div class="overlay-hover"></div>'),
						abilityWrapper = $('<div class="ability-wrapper" id=' + data.abilities[i].name + '></div>').draggable({
                            revert: 'invalid'
                        }),
                        ability = $('<div class="abilitybox"></div>');
						abilityWrapper.append(overlay);
						abilityWrapper.append(ability);

					var abilityImage = new Image();
					abilityImage.src = imageUrl;
					abilityImage.onload = setImage(ability, imageUrl);
						
                    ability.html($('<div class=abilitytextcontainer></div>').html($('<div class=abilitytext></div>').text(data.abilities[i].displayname)));
                    if (Math.random() < 0.5) {
                        abilityWrapper.appendTo('#abilitybox_start');
                    }
                    else {
                        abilityWrapper.prependTo('#abilitybox_start');
                    }
                }
            }
        }
    });
});
},{"../lib/jquery.ui.touch-punch":48,"bootstrap":1,"jquery":25,"jquery-ui/ui/data":14,"jquery-ui/ui/ie":15,"jquery-ui/ui/plugin":16,"jquery-ui/ui/safe-active-element":17,"jquery-ui/ui/safe-blur":18,"jquery-ui/ui/scroll-parent":19,"jquery-ui/ui/version":20,"jquery-ui/ui/widget":21,"jquery-ui/ui/widgets/draggable":22,"jquery-ui/ui/widgets/droppable":23,"jquery-ui/ui/widgets/mouse":24,"underscore":29}],48:[function(require,module,exports){
/*!
 * jQuery UI Touch Punch 0.2.3
 *
 * Copyright 2011�2014, Dave Furfero
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * Depends:
 *  jquery.ui.widget.js
 *  jquery.ui.mouse.js
 */
(function ($) {

  // Detect touch support
  $.support.touch = 'ontouchend' in document;

  // Ignore browsers without touch support
  if (!$.support.touch) {
    return;
  }

  var mouseProto = $.ui.mouse.prototype,
      _mouseInit = mouseProto._mouseInit,
      _mouseDestroy = mouseProto._mouseDestroy,
      touchHandled;

  /**
   * Simulate a mouse event based on a corresponding touch event
   * @param {Object} event A touch event
   * @param {String} simulatedType The corresponding mouse event
   */
  function simulateMouseEvent (event, simulatedType) {

    // Ignore multi-touch events
    if (event.originalEvent.touches.length > 1) {
      return;
    }

    event.preventDefault();

    var touch = event.originalEvent.changedTouches[0],
        simulatedEvent = document.createEvent('MouseEvents');
    
    // Initialize the simulated mouse event using the touch event's coordinates
    simulatedEvent.initMouseEvent(
      simulatedType,    // type
      true,             // bubbles                    
      true,             // cancelable                 
      window,           // view                       
      1,                // detail                     
      touch.screenX,    // screenX                    
      touch.screenY,    // screenY                    
      touch.clientX,    // clientX                    
      touch.clientY,    // clientY                    
      false,            // ctrlKey                    
      false,            // altKey                     
      false,            // shiftKey                   
      false,            // metaKey                    
      0,                // button                     
      null              // relatedTarget              
    );

    // Dispatch the simulated event to the target element
    event.target.dispatchEvent(simulatedEvent);
  }

  /**
   * Handle the jQuery UI widget's touchstart events
   * @param {Object} event The widget element's touchstart event
   */
  mouseProto._touchStart = function (event) {

    var self = this;

    // Ignore the event if another widget is already being handled
    if (touchHandled || !self._mouseCapture(event.originalEvent.changedTouches[0])) {
      return;
    }

    // Set the flag to prevent other widgets from inheriting the touch event
    touchHandled = true;

    // Track movement to determine if interaction was a click
    self._touchMoved = false;

    // Simulate the mouseover event
    simulateMouseEvent(event, 'mouseover');

    // Simulate the mousemove event
    simulateMouseEvent(event, 'mousemove');

    // Simulate the mousedown event
    simulateMouseEvent(event, 'mousedown');
  };

  /**
   * Handle the jQuery UI widget's touchmove events
   * @param {Object} event The document's touchmove event
   */
  mouseProto._touchMove = function (event) {

    // Ignore event if not handled
    if (!touchHandled) {
      return;
    }

    // Interaction was not a click
    this._touchMoved = true;

    // Simulate the mousemove event
    simulateMouseEvent(event, 'mousemove');
  };

  /**
   * Handle the jQuery UI widget's touchend events
   * @param {Object} event The document's touchend event
   */
  mouseProto._touchEnd = function (event) {

    // Ignore event if not handled
    if (!touchHandled) {
      return;
    }

    // Simulate the mouseup event
    simulateMouseEvent(event, 'mouseup');

    // Simulate the mouseout event
    simulateMouseEvent(event, 'mouseout');

    // If the touch interaction did not move, it should trigger a click
    if (!this._touchMoved) {

      // Simulate the click event
      simulateMouseEvent(event, 'click');
    }

    // Unset the flag to allow other widgets to inherit the touch event
    touchHandled = false;
  };

  /**
   * A duck punch of the $.ui.mouse _mouseInit method to support touch events.
   * This method extends the widget with bound touch event handlers that
   * translate touch events to mouse events and pass them to the widget's
   * original mouse event handling methods.
   */
  mouseProto._mouseInit = function () {
    
    var self = this;

    // Delegate the touch handlers to the widget's element
    self.element.bind({
      touchstart: $.proxy(self, '_touchStart'),
      touchmove: $.proxy(self, '_touchMove'),
      touchend: $.proxy(self, '_touchEnd')
    });

    // Call the original $.ui.mouse init method
    _mouseInit.call(self);
  };

  /**
   * Remove the touch event handlers
   */
  mouseProto._mouseDestroy = function () {
    
    var self = this;

    // Delegate the touch handlers to the widget's element
    self.element.unbind({
      touchstart: $.proxy(self, '_touchStart'),
      touchmove: $.proxy(self, '_touchMove'),
      touchend: $.proxy(self, '_touchEnd')
    });

    // Call the original $.ui.mouse destroy method
    _mouseDestroy.call(self);
  };

})(jQuery);
},{}],23:[function(require,module,exports){
/*!
 * jQuery UI Droppable 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Droppable
//>>group: Interactions
//>>description: Enables drop targets for draggable elements.
//>>docs: http://api.jqueryui.com/droppable/
//>>demos: http://jqueryui.com/droppable/

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( [
			"jquery",
			"./draggable",
			"./mouse",
			"../version",
			"../widget"
		], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
}( function( $ ) {

$.widget( "ui.droppable", {
	version: "1.12.1",
	widgetEventPrefix: "drop",
	options: {
		accept: "*",
		addClasses: true,
		greedy: false,
		scope: "default",
		tolerance: "intersect",

		// Callbacks
		activate: null,
		deactivate: null,
		drop: null,
		out: null,
		over: null
	},
	_create: function() {

		var proportions,
			o = this.options,
			accept = o.accept;

		this.isover = false;
		this.isout = true;

		this.accept = $.isFunction( accept ) ? accept : function( d ) {
			return d.is( accept );
		};

		this.proportions = function( /* valueToWrite */ ) {
			if ( arguments.length ) {

				// Store the droppable's proportions
				proportions = arguments[ 0 ];
			} else {

				// Retrieve or derive the droppable's proportions
				return proportions ?
					proportions :
					proportions = {
						width: this.element[ 0 ].offsetWidth,
						height: this.element[ 0 ].offsetHeight
					};
			}
		};

		this._addToManager( o.scope );

		o.addClasses && this._addClass( "ui-droppable" );

	},

	_addToManager: function( scope ) {

		// Add the reference and positions to the manager
		$.ui.ddmanager.droppables[ scope ] = $.ui.ddmanager.droppables[ scope ] || [];
		$.ui.ddmanager.droppables[ scope ].push( this );
	},

	_splice: function( drop ) {
		var i = 0;
		for ( ; i < drop.length; i++ ) {
			if ( drop[ i ] === this ) {
				drop.splice( i, 1 );
			}
		}
	},

	_destroy: function() {
		var drop = $.ui.ddmanager.droppables[ this.options.scope ];

		this._splice( drop );
	},

	_setOption: function( key, value ) {

		if ( key === "accept" ) {
			this.accept = $.isFunction( value ) ? value : function( d ) {
				return d.is( value );
			};
		} else if ( key === "scope" ) {
			var drop = $.ui.ddmanager.droppables[ this.options.scope ];

			this._splice( drop );
			this._addToManager( value );
		}

		this._super( key, value );
	},

	_activate: function( event ) {
		var draggable = $.ui.ddmanager.current;

		this._addActiveClass();
		if ( draggable ) {
			this._trigger( "activate", event, this.ui( draggable ) );
		}
	},

	_deactivate: function( event ) {
		var draggable = $.ui.ddmanager.current;

		this._removeActiveClass();
		if ( draggable ) {
			this._trigger( "deactivate", event, this.ui( draggable ) );
		}
	},

	_over: function( event ) {

		var draggable = $.ui.ddmanager.current;

		// Bail if draggable and droppable are same element
		if ( !draggable || ( draggable.currentItem ||
				draggable.element )[ 0 ] === this.element[ 0 ] ) {
			return;
		}

		if ( this.accept.call( this.element[ 0 ], ( draggable.currentItem ||
				draggable.element ) ) ) {
			this._addHoverClass();
			this._trigger( "over", event, this.ui( draggable ) );
		}

	},

	_out: function( event ) {

		var draggable = $.ui.ddmanager.current;

		// Bail if draggable and droppable are same element
		if ( !draggable || ( draggable.currentItem ||
				draggable.element )[ 0 ] === this.element[ 0 ] ) {
			return;
		}

		if ( this.accept.call( this.element[ 0 ], ( draggable.currentItem ||
				draggable.element ) ) ) {
			this._removeHoverClass();
			this._trigger( "out", event, this.ui( draggable ) );
		}

	},

	_drop: function( event, custom ) {

		var draggable = custom || $.ui.ddmanager.current,
			childrenIntersection = false;

		// Bail if draggable and droppable are same element
		if ( !draggable || ( draggable.currentItem ||
				draggable.element )[ 0 ] === this.element[ 0 ] ) {
			return false;
		}

		this.element
			.find( ":data(ui-droppable)" )
			.not( ".ui-draggable-dragging" )
			.each( function() {
				var inst = $( this ).droppable( "instance" );
				if (
					inst.options.greedy &&
					!inst.options.disabled &&
					inst.options.scope === draggable.options.scope &&
					inst.accept.call(
						inst.element[ 0 ], ( draggable.currentItem || draggable.element )
					) &&
					intersect(
						draggable,
						$.extend( inst, { offset: inst.element.offset() } ),
						inst.options.tolerance, event
					)
				) {
					childrenIntersection = true;
					return false; }
			} );
		if ( childrenIntersection ) {
			return false;
		}

		if ( this.accept.call( this.element[ 0 ],
				( draggable.currentItem || draggable.element ) ) ) {
			this._removeActiveClass();
			this._removeHoverClass();

			this._trigger( "drop", event, this.ui( draggable ) );
			return this.element;
		}

		return false;

	},

	ui: function( c ) {
		return {
			draggable: ( c.currentItem || c.element ),
			helper: c.helper,
			position: c.position,
			offset: c.positionAbs
		};
	},

	// Extension points just to make backcompat sane and avoid duplicating logic
	// TODO: Remove in 1.13 along with call to it below
	_addHoverClass: function() {
		this._addClass( "ui-droppable-hover" );
	},

	_removeHoverClass: function() {
		this._removeClass( "ui-droppable-hover" );
	},

	_addActiveClass: function() {
		this._addClass( "ui-droppable-active" );
	},

	_removeActiveClass: function() {
		this._removeClass( "ui-droppable-active" );
	}
} );

var intersect = $.ui.intersect = ( function() {
	function isOverAxis( x, reference, size ) {
		return ( x >= reference ) && ( x < ( reference + size ) );
	}

	return function( draggable, droppable, toleranceMode, event ) {

		if ( !droppable.offset ) {
			return false;
		}

		var x1 = ( draggable.positionAbs ||
				draggable.position.absolute ).left + draggable.margins.left,
			y1 = ( draggable.positionAbs ||
				draggable.position.absolute ).top + draggable.margins.top,
			x2 = x1 + draggable.helperProportions.width,
			y2 = y1 + draggable.helperProportions.height,
			l = droppable.offset.left,
			t = droppable.offset.top,
			r = l + droppable.proportions().width,
			b = t + droppable.proportions().height;

		switch ( toleranceMode ) {
		case "fit":
			return ( l <= x1 && x2 <= r && t <= y1 && y2 <= b );
		case "intersect":
			return ( l < x1 + ( draggable.helperProportions.width / 2 ) && // Right Half
				x2 - ( draggable.helperProportions.width / 2 ) < r && // Left Half
				t < y1 + ( draggable.helperProportions.height / 2 ) && // Bottom Half
				y2 - ( draggable.helperProportions.height / 2 ) < b ); // Top Half
		case "pointer":
			return isOverAxis( event.pageY, t, droppable.proportions().height ) &&
				isOverAxis( event.pageX, l, droppable.proportions().width );
		case "touch":
			return (
				( y1 >= t && y1 <= b ) || // Top edge touching
				( y2 >= t && y2 <= b ) || // Bottom edge touching
				( y1 < t && y2 > b ) // Surrounded vertically
			) && (
				( x1 >= l && x1 <= r ) || // Left edge touching
				( x2 >= l && x2 <= r ) || // Right edge touching
				( x1 < l && x2 > r ) // Surrounded horizontally
			);
		default:
			return false;
		}
	};
} )();

/*
	This manager tracks offsets of draggables and droppables
*/
$.ui.ddmanager = {
	current: null,
	droppables: { "default": [] },
	prepareOffsets: function( t, event ) {

		var i, j,
			m = $.ui.ddmanager.droppables[ t.options.scope ] || [],
			type = event ? event.type : null, // workaround for #2317
			list = ( t.currentItem || t.element ).find( ":data(ui-droppable)" ).addBack();

		droppablesLoop: for ( i = 0; i < m.length; i++ ) {

			// No disabled and non-accepted
			if ( m[ i ].options.disabled || ( t && !m[ i ].accept.call( m[ i ].element[ 0 ],
					( t.currentItem || t.element ) ) ) ) {
				continue;
			}

			// Filter out elements in the current dragged item
			for ( j = 0; j < list.length; j++ ) {
				if ( list[ j ] === m[ i ].element[ 0 ] ) {
					m[ i ].proportions().height = 0;
					continue droppablesLoop;
				}
			}

			m[ i ].visible = m[ i ].element.css( "display" ) !== "none";
			if ( !m[ i ].visible ) {
				continue;
			}

			// Activate the droppable if used directly from draggables
			if ( type === "mousedown" ) {
				m[ i ]._activate.call( m[ i ], event );
			}

			m[ i ].offset = m[ i ].element.offset();
			m[ i ].proportions( {
				width: m[ i ].element[ 0 ].offsetWidth,
				height: m[ i ].element[ 0 ].offsetHeight
			} );

		}

	},
	drop: function( draggable, event ) {

		var dropped = false;

		// Create a copy of the droppables in case the list changes during the drop (#9116)
		$.each( ( $.ui.ddmanager.droppables[ draggable.options.scope ] || [] ).slice(), function() {

			if ( !this.options ) {
				return;
			}
			if ( !this.options.disabled && this.visible &&
					intersect( draggable, this, this.options.tolerance, event ) ) {
				dropped = this._drop.call( this, event ) || dropped;
			}

			if ( !this.options.disabled && this.visible && this.accept.call( this.element[ 0 ],
					( draggable.currentItem || draggable.element ) ) ) {
				this.isout = true;
				this.isover = false;
				this._deactivate.call( this, event );
			}

		} );
		return dropped;

	},
	dragStart: function( draggable, event ) {

		// Listen for scrolling so that if the dragging causes scrolling the position of the
		// droppables can be recalculated (see #5003)
		draggable.element.parentsUntil( "body" ).on( "scroll.droppable", function() {
			if ( !draggable.options.refreshPositions ) {
				$.ui.ddmanager.prepareOffsets( draggable, event );
			}
		} );
	},
	drag: function( draggable, event ) {

		// If you have a highly dynamic page, you might try this option. It renders positions
		// every time you move the mouse.
		if ( draggable.options.refreshPositions ) {
			$.ui.ddmanager.prepareOffsets( draggable, event );
		}

		// Run through all droppables and check their positions based on specific tolerance options
		$.each( $.ui.ddmanager.droppables[ draggable.options.scope ] || [], function() {

			if ( this.options.disabled || this.greedyChild || !this.visible ) {
				return;
			}

			var parentInstance, scope, parent,
				intersects = intersect( draggable, this, this.options.tolerance, event ),
				c = !intersects && this.isover ?
					"isout" :
					( intersects && !this.isover ? "isover" : null );
			if ( !c ) {
				return;
			}

			if ( this.options.greedy ) {

				// find droppable parents with same scope
				scope = this.options.scope;
				parent = this.element.parents( ":data(ui-droppable)" ).filter( function() {
					return $( this ).droppable( "instance" ).options.scope === scope;
				} );

				if ( parent.length ) {
					parentInstance = $( parent[ 0 ] ).droppable( "instance" );
					parentInstance.greedyChild = ( c === "isover" );
				}
			}

			// We just moved into a greedy child
			if ( parentInstance && c === "isover" ) {
				parentInstance.isover = false;
				parentInstance.isout = true;
				parentInstance._out.call( parentInstance, event );
			}

			this[ c ] = true;
			this[ c === "isout" ? "isover" : "isout" ] = false;
			this[ c === "isover" ? "_over" : "_out" ].call( this, event );

			// We just moved out of a greedy child
			if ( parentInstance && c === "isout" ) {
				parentInstance.isout = false;
				parentInstance.isover = true;
				parentInstance._over.call( parentInstance, event );
			}
		} );

	},
	dragStop: function( draggable, event ) {
		draggable.element.parentsUntil( "body" ).off( "scroll.droppable" );

		// Call prepareOffsets one final time since IE does not fire return scroll events when
		// overflow was caused by drag (see #5003)
		if ( !draggable.options.refreshPositions ) {
			$.ui.ddmanager.prepareOffsets( draggable, event );
		}
	}
};

// DEPRECATED
// TODO: switch return back to widget declaration at top of file when this is removed
if ( $.uiBackCompat !== false ) {

	// Backcompat for activeClass and hoverClass options
	$.widget( "ui.droppable", $.ui.droppable, {
		options: {
			hoverClass: false,
			activeClass: false
		},
		_addActiveClass: function() {
			this._super();
			if ( this.options.activeClass ) {
				this.element.addClass( this.options.activeClass );
			}
		},
		_removeActiveClass: function() {
			this._super();
			if ( this.options.activeClass ) {
				this.element.removeClass( this.options.activeClass );
			}
		},
		_addHoverClass: function() {
			this._super();
			if ( this.options.hoverClass ) {
				this.element.addClass( this.options.hoverClass );
			}
		},
		_removeHoverClass: function() {
			this._super();
			if ( this.options.hoverClass ) {
				this.element.removeClass( this.options.hoverClass );
			}
		}
	} );
}

return $.ui.droppable;

} ) );

},{}]},{},[31])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYXBwcy9hYmlsaXR5bWF0Y2hpbmcuanMiLCJzcmMvanMvbGliL2pxdWVyeS51aS50b3VjaC1wdW5jaC5qcyIsIm5vZGVfbW9kdWxlcy9qcXVlcnktdWkvdWkvd2lkZ2V0cy9kcm9wcGFibGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25MQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyICQgPSBqUXVlcnkgPSByZXF1aXJlKCdqcXVlcnknKTtcbnJlcXVpcmUoJ2pxdWVyeS11aS91aS92ZXJzaW9uJyk7XG5yZXF1aXJlKCdqcXVlcnktdWkvdWkvaWUnKTtcbnJlcXVpcmUoJ2pxdWVyeS11aS91aS9kYXRhJyk7XG5yZXF1aXJlKCdqcXVlcnktdWkvdWkvcGx1Z2luJyk7XG5yZXF1aXJlKCdqcXVlcnktdWkvdWkvc2FmZS1hY3RpdmUtZWxlbWVudCcpO1xucmVxdWlyZSgnanF1ZXJ5LXVpL3VpL3NhZmUtYmx1cicpO1xucmVxdWlyZSgnanF1ZXJ5LXVpL3VpL3Njcm9sbC1wYXJlbnQnKTtcbnJlcXVpcmUoJ2pxdWVyeS11aS91aS93aWRnZXQnKTtcbnJlcXVpcmUoJ2pxdWVyeS11aS91aS93aWRnZXRzL21vdXNlJyk7XG5yZXF1aXJlKCdqcXVlcnktdWkvdWkvd2lkZ2V0cy9kcmFnZ2FibGUnKTtcbnJlcXVpcmUoJ2pxdWVyeS11aS91aS93aWRnZXRzL2Ryb3BwYWJsZScpO1xucmVxdWlyZSgnLi4vbGliL2pxdWVyeS51aS50b3VjaC1wdW5jaCcpO1xucmVxdWlyZSgnYm9vdHN0cmFwJyk7XG52YXIgXyA9IHJlcXVpcmUoJ3VuZGVyc2NvcmUnKTtcblxuJChmdW5jdGlvbiAoKSB7XG4gICAgJC5nZXRKU09OKFwiL21lZGlhL2RvdGEtanNvbi9oZXJvZGF0YS5qc29uXCIsIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgIHZhciBoZXJvZXMgPSBPYmplY3Qua2V5cyhkYXRhKSxcbiAgICAgICAgICAgIGhlcm9kYXRhID0gZGF0YTtcbiAgICAgICAgICAgIFxuICAgICAgICBjcmVhdGVRdWVzdGlvbigpO1xuXG4gICAgICAgIGZ1bmN0aW9uIGNyZWF0ZVF1ZXN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIGggPSBoZXJvZXNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogaGVyb2VzLmxlbmd0aCldLFxuICAgICAgICAgICAgICAgIGRhdGEgPSBoZXJvZGF0YVtoXSxcbiAgICAgICAgICAgICAgICBjb3VudCA9IDAsXG5cdFx0XHRcdGltZ0NvdW50ID0gMDtcblx0XHRcdCQoJyNjb250ZW50Y29udGFpbmVyJykuaGlkZSgpO1xuICAgICAgICAgICAgJCgnI2FiaWxpdHlib3hfc3RhcnQnKS5lbXB0eSgpO1xuICAgICAgICAgICAgJCgnI2FiaWxpdHlib3hfZW5kJykuZW1wdHkoKTtcbiAgICAgICAgICAgICQoJyNoZXJvcG9ydHJhaXQnKS5lbXB0eSgpO1xuICAgICAgICAgICAgJCgnI2hlcm9uYW1lJykuZW1wdHkoKTtcblx0XHRcdGltZ0NvdW50ID0gZGF0YS5hYmlsaXRpZXMuZmlsdGVyKGZ1bmN0aW9uIChhYmlsaXR5KSB7IFxuXHRcdFx0XHRyZXR1cm4gYWJpbGl0eS5uYW1lICE9ICdhdHRyaWJ1dGVfYm9udXMnICYmIGFiaWxpdHkuZGlzcGxheW5hbWUgIT0gJ0VtcHR5JyAmJiBhYmlsaXR5LmRpc3BsYXluYW1lICE9ICcnXG5cdFx0XHR9KS5sZW5ndGggKyAxO1xuXHRcdFx0XG5cdFx0XHRmdW5jdGlvbiBjaGVja1Nob3dDb250ZW50KCkge1xuXHRcdFx0XHRpZiAoaW1nQ291bnQgPT0gMCkge1xuXHRcdFx0XHRcdCQoJyNjb250ZW50Y29udGFpbmVyJykuc2hvdygpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHR2YXIgcG9ydHJhaXRJbWFnZSA9IG5ldyBJbWFnZSgpO1xuXHRcdFx0cG9ydHJhaXRJbWFnZS5zcmMgPSBcIi9tZWRpYS9pbWFnZXMvaGVyb2VzL1wiICsgaC5yZXBsYWNlKCducGNfZG90YV9oZXJvXycsJycpICsgXCIucG5nXCI7XG5cdFx0XHRwb3J0cmFpdEltYWdlLm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0JCgnI2hlcm9wb3J0cmFpdCcpLmF0dHIoJ3NyYycsIHBvcnRyYWl0SW1hZ2Uuc3JjKTtcblx0XHRcdFx0aW1nQ291bnQtLTtcblx0XHRcdFx0Y2hlY2tTaG93Q29udGVudCgpO1xuXHRcdFx0fTtcbiAgICAgICAgICAgICQoJyNoZXJvbmFtZScpLnRleHQoZGF0YS5kaXNwbGF5bmFtZSk7XG4gICAgICAgICAgICBcblx0XHRcdGZ1bmN0aW9uIHNldEltYWdlKGVsZW1lbnQsIHNyYykge1xuXHRcdFx0XHRlbGVtZW50LmNzcygnYmFja2dyb3VuZC1pbWFnZScsICd1cmwoJyArIHNyYyArICcpJyk7XG5cdFx0XHRcdGltZ0NvdW50LS07XG5cdFx0XHRcdGNoZWNrU2hvd0NvbnRlbnQoKTtcblx0XHRcdH1cblx0XHRcdFxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmFiaWxpdGllcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmIChkYXRhLmFiaWxpdGllc1tpXS5uYW1lICE9ICdhdHRyaWJ1dGVfYm9udXMnICYmIGRhdGEuYWJpbGl0aWVzW2ldLmRpc3BsYXluYW1lICE9ICdFbXB0eScgJiYgZGF0YS5hYmlsaXRpZXNbaV0uZGlzcGxheW5hbWUgIT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGFiaWxpdHlib3hlbmQgPSAkKCc8ZGl2IGNsYXNzPWFiaWxpdHlib3hfZW5kIGlkPWFiaWxpdHlfJyArIGkgKyAnPjwvZGl2PicpLmRyb3BwYWJsZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBhY2NlcHQ6ICcjJyArIGRhdGEuYWJpbGl0aWVzW2ldLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICB0b2xlcmFuY2U6ICdpbnRlcnNlY3QnLFxuICAgICAgICAgICAgICAgICAgICAgICAgZHJvcDogZnVuY3Rpb24gKGV2ZW50LCB1aSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkcm9wX3AgPSAkKHRoaXMpLm9mZnNldCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkcmFnX3AgPSB1aS5kcmFnZ2FibGUub2Zmc2V0KCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlZnRfZW5kID0gZHJvcF9wLmxlZnQgLSBkcmFnX3AubGVmdCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9wX2VuZCA9IGRyb3BfcC50b3AgLSBkcmFnX3AudG9wO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVpLmRyYWdnYWJsZS5hbmltYXRlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9wOiAnKz0nICsgdG9wX2VuZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGVmdDogJys9JyArIGxlZnRfZW5kXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb3VudCArPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvdW50ID09IGRhdGEuYWJpbGl0aWVzLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjcmVhdGVRdWVzdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSkuYXBwZW5kVG8oJyNhYmlsaXR5Ym94X2VuZCcpO1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBpbWFnZVVybCA9IFwiL21lZGlhL2ltYWdlcy9zcGVsbGljb25zL1wiICsgZGF0YS5hYmlsaXRpZXNbaV0ubmFtZSArIFwiLnBuZ1wiO1xuXHRcdFx0XHRcdFx0b3ZlcmxheSA9ICQoJzxkaXYgY2xhc3M9XCJvdmVybGF5LWhvdmVyXCI+PC9kaXY+JyksXG5cdFx0XHRcdFx0XHRhYmlsaXR5V3JhcHBlciA9ICQoJzxkaXYgY2xhc3M9XCJhYmlsaXR5LXdyYXBwZXJcIiBpZD0nICsgZGF0YS5hYmlsaXRpZXNbaV0ubmFtZSArICc+PC9kaXY+JykuZHJhZ2dhYmxlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXZlcnQ6ICdpbnZhbGlkJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICBhYmlsaXR5ID0gJCgnPGRpdiBjbGFzcz1cImFiaWxpdHlib3hcIj48L2Rpdj4nKTtcblx0XHRcdFx0XHRcdGFiaWxpdHlXcmFwcGVyLmFwcGVuZChvdmVybGF5KTtcblx0XHRcdFx0XHRcdGFiaWxpdHlXcmFwcGVyLmFwcGVuZChhYmlsaXR5KTtcblxuXHRcdFx0XHRcdHZhciBhYmlsaXR5SW1hZ2UgPSBuZXcgSW1hZ2UoKTtcblx0XHRcdFx0XHRhYmlsaXR5SW1hZ2Uuc3JjID0gaW1hZ2VVcmw7XG5cdFx0XHRcdFx0YWJpbGl0eUltYWdlLm9ubG9hZCA9IHNldEltYWdlKGFiaWxpdHksIGltYWdlVXJsKTtcblx0XHRcdFx0XHRcdFxuICAgICAgICAgICAgICAgICAgICBhYmlsaXR5Lmh0bWwoJCgnPGRpdiBjbGFzcz1hYmlsaXR5dGV4dGNvbnRhaW5lcj48L2Rpdj4nKS5odG1sKCQoJzxkaXYgY2xhc3M9YWJpbGl0eXRleHQ+PC9kaXY+JykudGV4dChkYXRhLmFiaWxpdGllc1tpXS5kaXNwbGF5bmFtZSkpKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKE1hdGgucmFuZG9tKCkgPCAwLjUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFiaWxpdHlXcmFwcGVyLmFwcGVuZFRvKCcjYWJpbGl0eWJveF9zdGFydCcpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgYWJpbGl0eVdyYXBwZXIucHJlcGVuZFRvKCcjYWJpbGl0eWJveF9zdGFydCcpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG59KTsiLCIvKiFcbiAqIGpRdWVyeSBVSSBUb3VjaCBQdW5jaCAwLjIuM1xuICpcbiAqIENvcHlyaWdodCAyMDEx77+9MjAxNCwgRGF2ZSBGdXJmZXJvXG4gKiBEdWFsIGxpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgb3IgR1BMIFZlcnNpb24gMiBsaWNlbnNlcy5cbiAqXG4gKiBEZXBlbmRzOlxuICogIGpxdWVyeS51aS53aWRnZXQuanNcbiAqICBqcXVlcnkudWkubW91c2UuanNcbiAqL1xuKGZ1bmN0aW9uICgkKSB7XG5cbiAgLy8gRGV0ZWN0IHRvdWNoIHN1cHBvcnRcbiAgJC5zdXBwb3J0LnRvdWNoID0gJ29udG91Y2hlbmQnIGluIGRvY3VtZW50O1xuXG4gIC8vIElnbm9yZSBicm93c2VycyB3aXRob3V0IHRvdWNoIHN1cHBvcnRcbiAgaWYgKCEkLnN1cHBvcnQudG91Y2gpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgbW91c2VQcm90byA9ICQudWkubW91c2UucHJvdG90eXBlLFxuICAgICAgX21vdXNlSW5pdCA9IG1vdXNlUHJvdG8uX21vdXNlSW5pdCxcbiAgICAgIF9tb3VzZURlc3Ryb3kgPSBtb3VzZVByb3RvLl9tb3VzZURlc3Ryb3ksXG4gICAgICB0b3VjaEhhbmRsZWQ7XG5cbiAgLyoqXG4gICAqIFNpbXVsYXRlIGEgbW91c2UgZXZlbnQgYmFzZWQgb24gYSBjb3JyZXNwb25kaW5nIHRvdWNoIGV2ZW50XG4gICAqIEBwYXJhbSB7T2JqZWN0fSBldmVudCBBIHRvdWNoIGV2ZW50XG4gICAqIEBwYXJhbSB7U3RyaW5nfSBzaW11bGF0ZWRUeXBlIFRoZSBjb3JyZXNwb25kaW5nIG1vdXNlIGV2ZW50XG4gICAqL1xuICBmdW5jdGlvbiBzaW11bGF0ZU1vdXNlRXZlbnQgKGV2ZW50LCBzaW11bGF0ZWRUeXBlKSB7XG5cbiAgICAvLyBJZ25vcmUgbXVsdGktdG91Y2ggZXZlbnRzXG4gICAgaWYgKGV2ZW50Lm9yaWdpbmFsRXZlbnQudG91Y2hlcy5sZW5ndGggPiAxKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgIHZhciB0b3VjaCA9IGV2ZW50Lm9yaWdpbmFsRXZlbnQuY2hhbmdlZFRvdWNoZXNbMF0sXG4gICAgICAgIHNpbXVsYXRlZEV2ZW50ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ01vdXNlRXZlbnRzJyk7XG4gICAgXG4gICAgLy8gSW5pdGlhbGl6ZSB0aGUgc2ltdWxhdGVkIG1vdXNlIGV2ZW50IHVzaW5nIHRoZSB0b3VjaCBldmVudCdzIGNvb3JkaW5hdGVzXG4gICAgc2ltdWxhdGVkRXZlbnQuaW5pdE1vdXNlRXZlbnQoXG4gICAgICBzaW11bGF0ZWRUeXBlLCAgICAvLyB0eXBlXG4gICAgICB0cnVlLCAgICAgICAgICAgICAvLyBidWJibGVzICAgICAgICAgICAgICAgICAgICBcbiAgICAgIHRydWUsICAgICAgICAgICAgIC8vIGNhbmNlbGFibGUgICAgICAgICAgICAgICAgIFxuICAgICAgd2luZG93LCAgICAgICAgICAgLy8gdmlldyAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAxLCAgICAgICAgICAgICAgICAvLyBkZXRhaWwgICAgICAgICAgICAgICAgICAgICBcbiAgICAgIHRvdWNoLnNjcmVlblgsICAgIC8vIHNjcmVlblggICAgICAgICAgICAgICAgICAgIFxuICAgICAgdG91Y2guc2NyZWVuWSwgICAgLy8gc2NyZWVuWSAgICAgICAgICAgICAgICAgICAgXG4gICAgICB0b3VjaC5jbGllbnRYLCAgICAvLyBjbGllbnRYICAgICAgICAgICAgICAgICAgICBcbiAgICAgIHRvdWNoLmNsaWVudFksICAgIC8vIGNsaWVudFkgICAgICAgICAgICAgICAgICAgIFxuICAgICAgZmFsc2UsICAgICAgICAgICAgLy8gY3RybEtleSAgICAgICAgICAgICAgICAgICAgXG4gICAgICBmYWxzZSwgICAgICAgICAgICAvLyBhbHRLZXkgICAgICAgICAgICAgICAgICAgICBcbiAgICAgIGZhbHNlLCAgICAgICAgICAgIC8vIHNoaWZ0S2V5ICAgICAgICAgICAgICAgICAgIFxuICAgICAgZmFsc2UsICAgICAgICAgICAgLy8gbWV0YUtleSAgICAgICAgICAgICAgICAgICAgXG4gICAgICAwLCAgICAgICAgICAgICAgICAvLyBidXR0b24gICAgICAgICAgICAgICAgICAgICBcbiAgICAgIG51bGwgICAgICAgICAgICAgIC8vIHJlbGF0ZWRUYXJnZXQgICAgICAgICAgICAgIFxuICAgICk7XG5cbiAgICAvLyBEaXNwYXRjaCB0aGUgc2ltdWxhdGVkIGV2ZW50IHRvIHRoZSB0YXJnZXQgZWxlbWVudFxuICAgIGV2ZW50LnRhcmdldC5kaXNwYXRjaEV2ZW50KHNpbXVsYXRlZEV2ZW50KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGUgdGhlIGpRdWVyeSBVSSB3aWRnZXQncyB0b3VjaHN0YXJ0IGV2ZW50c1xuICAgKiBAcGFyYW0ge09iamVjdH0gZXZlbnQgVGhlIHdpZGdldCBlbGVtZW50J3MgdG91Y2hzdGFydCBldmVudFxuICAgKi9cbiAgbW91c2VQcm90by5fdG91Y2hTdGFydCA9IGZ1bmN0aW9uIChldmVudCkge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgLy8gSWdub3JlIHRoZSBldmVudCBpZiBhbm90aGVyIHdpZGdldCBpcyBhbHJlYWR5IGJlaW5nIGhhbmRsZWRcbiAgICBpZiAodG91Y2hIYW5kbGVkIHx8ICFzZWxmLl9tb3VzZUNhcHR1cmUoZXZlbnQub3JpZ2luYWxFdmVudC5jaGFuZ2VkVG91Y2hlc1swXSkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBTZXQgdGhlIGZsYWcgdG8gcHJldmVudCBvdGhlciB3aWRnZXRzIGZyb20gaW5oZXJpdGluZyB0aGUgdG91Y2ggZXZlbnRcbiAgICB0b3VjaEhhbmRsZWQgPSB0cnVlO1xuXG4gICAgLy8gVHJhY2sgbW92ZW1lbnQgdG8gZGV0ZXJtaW5lIGlmIGludGVyYWN0aW9uIHdhcyBhIGNsaWNrXG4gICAgc2VsZi5fdG91Y2hNb3ZlZCA9IGZhbHNlO1xuXG4gICAgLy8gU2ltdWxhdGUgdGhlIG1vdXNlb3ZlciBldmVudFxuICAgIHNpbXVsYXRlTW91c2VFdmVudChldmVudCwgJ21vdXNlb3ZlcicpO1xuXG4gICAgLy8gU2ltdWxhdGUgdGhlIG1vdXNlbW92ZSBldmVudFxuICAgIHNpbXVsYXRlTW91c2VFdmVudChldmVudCwgJ21vdXNlbW92ZScpO1xuXG4gICAgLy8gU2ltdWxhdGUgdGhlIG1vdXNlZG93biBldmVudFxuICAgIHNpbXVsYXRlTW91c2VFdmVudChldmVudCwgJ21vdXNlZG93bicpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBIYW5kbGUgdGhlIGpRdWVyeSBVSSB3aWRnZXQncyB0b3VjaG1vdmUgZXZlbnRzXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBldmVudCBUaGUgZG9jdW1lbnQncyB0b3VjaG1vdmUgZXZlbnRcbiAgICovXG4gIG1vdXNlUHJvdG8uX3RvdWNoTW92ZSA9IGZ1bmN0aW9uIChldmVudCkge1xuXG4gICAgLy8gSWdub3JlIGV2ZW50IGlmIG5vdCBoYW5kbGVkXG4gICAgaWYgKCF0b3VjaEhhbmRsZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBJbnRlcmFjdGlvbiB3YXMgbm90IGEgY2xpY2tcbiAgICB0aGlzLl90b3VjaE1vdmVkID0gdHJ1ZTtcblxuICAgIC8vIFNpbXVsYXRlIHRoZSBtb3VzZW1vdmUgZXZlbnRcbiAgICBzaW11bGF0ZU1vdXNlRXZlbnQoZXZlbnQsICdtb3VzZW1vdmUnKTtcbiAgfTtcblxuICAvKipcbiAgICogSGFuZGxlIHRoZSBqUXVlcnkgVUkgd2lkZ2V0J3MgdG91Y2hlbmQgZXZlbnRzXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBldmVudCBUaGUgZG9jdW1lbnQncyB0b3VjaGVuZCBldmVudFxuICAgKi9cbiAgbW91c2VQcm90by5fdG91Y2hFbmQgPSBmdW5jdGlvbiAoZXZlbnQpIHtcblxuICAgIC8vIElnbm9yZSBldmVudCBpZiBub3QgaGFuZGxlZFxuICAgIGlmICghdG91Y2hIYW5kbGVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gU2ltdWxhdGUgdGhlIG1vdXNldXAgZXZlbnRcbiAgICBzaW11bGF0ZU1vdXNlRXZlbnQoZXZlbnQsICdtb3VzZXVwJyk7XG5cbiAgICAvLyBTaW11bGF0ZSB0aGUgbW91c2VvdXQgZXZlbnRcbiAgICBzaW11bGF0ZU1vdXNlRXZlbnQoZXZlbnQsICdtb3VzZW91dCcpO1xuXG4gICAgLy8gSWYgdGhlIHRvdWNoIGludGVyYWN0aW9uIGRpZCBub3QgbW92ZSwgaXQgc2hvdWxkIHRyaWdnZXIgYSBjbGlja1xuICAgIGlmICghdGhpcy5fdG91Y2hNb3ZlZCkge1xuXG4gICAgICAvLyBTaW11bGF0ZSB0aGUgY2xpY2sgZXZlbnRcbiAgICAgIHNpbXVsYXRlTW91c2VFdmVudChldmVudCwgJ2NsaWNrJyk7XG4gICAgfVxuXG4gICAgLy8gVW5zZXQgdGhlIGZsYWcgdG8gYWxsb3cgb3RoZXIgd2lkZ2V0cyB0byBpbmhlcml0IHRoZSB0b3VjaCBldmVudFxuICAgIHRvdWNoSGFuZGxlZCA9IGZhbHNlO1xuICB9O1xuXG4gIC8qKlxuICAgKiBBIGR1Y2sgcHVuY2ggb2YgdGhlICQudWkubW91c2UgX21vdXNlSW5pdCBtZXRob2QgdG8gc3VwcG9ydCB0b3VjaCBldmVudHMuXG4gICAqIFRoaXMgbWV0aG9kIGV4dGVuZHMgdGhlIHdpZGdldCB3aXRoIGJvdW5kIHRvdWNoIGV2ZW50IGhhbmRsZXJzIHRoYXRcbiAgICogdHJhbnNsYXRlIHRvdWNoIGV2ZW50cyB0byBtb3VzZSBldmVudHMgYW5kIHBhc3MgdGhlbSB0byB0aGUgd2lkZ2V0J3NcbiAgICogb3JpZ2luYWwgbW91c2UgZXZlbnQgaGFuZGxpbmcgbWV0aG9kcy5cbiAgICovXG4gIG1vdXNlUHJvdG8uX21vdXNlSW5pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICBcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAvLyBEZWxlZ2F0ZSB0aGUgdG91Y2ggaGFuZGxlcnMgdG8gdGhlIHdpZGdldCdzIGVsZW1lbnRcbiAgICBzZWxmLmVsZW1lbnQuYmluZCh7XG4gICAgICB0b3VjaHN0YXJ0OiAkLnByb3h5KHNlbGYsICdfdG91Y2hTdGFydCcpLFxuICAgICAgdG91Y2htb3ZlOiAkLnByb3h5KHNlbGYsICdfdG91Y2hNb3ZlJyksXG4gICAgICB0b3VjaGVuZDogJC5wcm94eShzZWxmLCAnX3RvdWNoRW5kJylcbiAgICB9KTtcblxuICAgIC8vIENhbGwgdGhlIG9yaWdpbmFsICQudWkubW91c2UgaW5pdCBtZXRob2RcbiAgICBfbW91c2VJbml0LmNhbGwoc2VsZik7XG4gIH07XG5cbiAgLyoqXG4gICAqIFJlbW92ZSB0aGUgdG91Y2ggZXZlbnQgaGFuZGxlcnNcbiAgICovXG4gIG1vdXNlUHJvdG8uX21vdXNlRGVzdHJveSA9IGZ1bmN0aW9uICgpIHtcbiAgICBcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAvLyBEZWxlZ2F0ZSB0aGUgdG91Y2ggaGFuZGxlcnMgdG8gdGhlIHdpZGdldCdzIGVsZW1lbnRcbiAgICBzZWxmLmVsZW1lbnQudW5iaW5kKHtcbiAgICAgIHRvdWNoc3RhcnQ6ICQucHJveHkoc2VsZiwgJ190b3VjaFN0YXJ0JyksXG4gICAgICB0b3VjaG1vdmU6ICQucHJveHkoc2VsZiwgJ190b3VjaE1vdmUnKSxcbiAgICAgIHRvdWNoZW5kOiAkLnByb3h5KHNlbGYsICdfdG91Y2hFbmQnKVxuICAgIH0pO1xuXG4gICAgLy8gQ2FsbCB0aGUgb3JpZ2luYWwgJC51aS5tb3VzZSBkZXN0cm95IG1ldGhvZFxuICAgIF9tb3VzZURlc3Ryb3kuY2FsbChzZWxmKTtcbiAgfTtcblxufSkoalF1ZXJ5KTsiLCIvKiFcbiAqIGpRdWVyeSBVSSBEcm9wcGFibGUgMS4xMi4xXG4gKiBodHRwOi8vanF1ZXJ5dWkuY29tXG4gKlxuICogQ29weXJpZ2h0IGpRdWVyeSBGb3VuZGF0aW9uIGFuZCBvdGhlciBjb250cmlidXRvcnNcbiAqIFJlbGVhc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZS5cbiAqIGh0dHA6Ly9qcXVlcnkub3JnL2xpY2Vuc2VcbiAqL1xuXG4vLz4+bGFiZWw6IERyb3BwYWJsZVxuLy8+Pmdyb3VwOiBJbnRlcmFjdGlvbnNcbi8vPj5kZXNjcmlwdGlvbjogRW5hYmxlcyBkcm9wIHRhcmdldHMgZm9yIGRyYWdnYWJsZSBlbGVtZW50cy5cbi8vPj5kb2NzOiBodHRwOi8vYXBpLmpxdWVyeXVpLmNvbS9kcm9wcGFibGUvXG4vLz4+ZGVtb3M6IGh0dHA6Ly9qcXVlcnl1aS5jb20vZHJvcHBhYmxlL1xuXG4oIGZ1bmN0aW9uKCBmYWN0b3J5ICkge1xuXHRpZiAoIHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kICkge1xuXG5cdFx0Ly8gQU1ELiBSZWdpc3RlciBhcyBhbiBhbm9ueW1vdXMgbW9kdWxlLlxuXHRcdGRlZmluZSggW1xuXHRcdFx0XCJqcXVlcnlcIixcblx0XHRcdFwiLi9kcmFnZ2FibGVcIixcblx0XHRcdFwiLi9tb3VzZVwiLFxuXHRcdFx0XCIuLi92ZXJzaW9uXCIsXG5cdFx0XHRcIi4uL3dpZGdldFwiXG5cdFx0XSwgZmFjdG9yeSApO1xuXHR9IGVsc2Uge1xuXG5cdFx0Ly8gQnJvd3NlciBnbG9iYWxzXG5cdFx0ZmFjdG9yeSggalF1ZXJ5ICk7XG5cdH1cbn0oIGZ1bmN0aW9uKCAkICkge1xuXG4kLndpZGdldCggXCJ1aS5kcm9wcGFibGVcIiwge1xuXHR2ZXJzaW9uOiBcIjEuMTIuMVwiLFxuXHR3aWRnZXRFdmVudFByZWZpeDogXCJkcm9wXCIsXG5cdG9wdGlvbnM6IHtcblx0XHRhY2NlcHQ6IFwiKlwiLFxuXHRcdGFkZENsYXNzZXM6IHRydWUsXG5cdFx0Z3JlZWR5OiBmYWxzZSxcblx0XHRzY29wZTogXCJkZWZhdWx0XCIsXG5cdFx0dG9sZXJhbmNlOiBcImludGVyc2VjdFwiLFxuXG5cdFx0Ly8gQ2FsbGJhY2tzXG5cdFx0YWN0aXZhdGU6IG51bGwsXG5cdFx0ZGVhY3RpdmF0ZTogbnVsbCxcblx0XHRkcm9wOiBudWxsLFxuXHRcdG91dDogbnVsbCxcblx0XHRvdmVyOiBudWxsXG5cdH0sXG5cdF9jcmVhdGU6IGZ1bmN0aW9uKCkge1xuXG5cdFx0dmFyIHByb3BvcnRpb25zLFxuXHRcdFx0byA9IHRoaXMub3B0aW9ucyxcblx0XHRcdGFjY2VwdCA9IG8uYWNjZXB0O1xuXG5cdFx0dGhpcy5pc292ZXIgPSBmYWxzZTtcblx0XHR0aGlzLmlzb3V0ID0gdHJ1ZTtcblxuXHRcdHRoaXMuYWNjZXB0ID0gJC5pc0Z1bmN0aW9uKCBhY2NlcHQgKSA/IGFjY2VwdCA6IGZ1bmN0aW9uKCBkICkge1xuXHRcdFx0cmV0dXJuIGQuaXMoIGFjY2VwdCApO1xuXHRcdH07XG5cblx0XHR0aGlzLnByb3BvcnRpb25zID0gZnVuY3Rpb24oIC8qIHZhbHVlVG9Xcml0ZSAqLyApIHtcblx0XHRcdGlmICggYXJndW1lbnRzLmxlbmd0aCApIHtcblxuXHRcdFx0XHQvLyBTdG9yZSB0aGUgZHJvcHBhYmxlJ3MgcHJvcG9ydGlvbnNcblx0XHRcdFx0cHJvcG9ydGlvbnMgPSBhcmd1bWVudHNbIDAgXTtcblx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0Ly8gUmV0cmlldmUgb3IgZGVyaXZlIHRoZSBkcm9wcGFibGUncyBwcm9wb3J0aW9uc1xuXHRcdFx0XHRyZXR1cm4gcHJvcG9ydGlvbnMgP1xuXHRcdFx0XHRcdHByb3BvcnRpb25zIDpcblx0XHRcdFx0XHRwcm9wb3J0aW9ucyA9IHtcblx0XHRcdFx0XHRcdHdpZHRoOiB0aGlzLmVsZW1lbnRbIDAgXS5vZmZzZXRXaWR0aCxcblx0XHRcdFx0XHRcdGhlaWdodDogdGhpcy5lbGVtZW50WyAwIF0ub2Zmc2V0SGVpZ2h0XG5cdFx0XHRcdFx0fTtcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0dGhpcy5fYWRkVG9NYW5hZ2VyKCBvLnNjb3BlICk7XG5cblx0XHRvLmFkZENsYXNzZXMgJiYgdGhpcy5fYWRkQ2xhc3MoIFwidWktZHJvcHBhYmxlXCIgKTtcblxuXHR9LFxuXG5cdF9hZGRUb01hbmFnZXI6IGZ1bmN0aW9uKCBzY29wZSApIHtcblxuXHRcdC8vIEFkZCB0aGUgcmVmZXJlbmNlIGFuZCBwb3NpdGlvbnMgdG8gdGhlIG1hbmFnZXJcblx0XHQkLnVpLmRkbWFuYWdlci5kcm9wcGFibGVzWyBzY29wZSBdID0gJC51aS5kZG1hbmFnZXIuZHJvcHBhYmxlc1sgc2NvcGUgXSB8fCBbXTtcblx0XHQkLnVpLmRkbWFuYWdlci5kcm9wcGFibGVzWyBzY29wZSBdLnB1c2goIHRoaXMgKTtcblx0fSxcblxuXHRfc3BsaWNlOiBmdW5jdGlvbiggZHJvcCApIHtcblx0XHR2YXIgaSA9IDA7XG5cdFx0Zm9yICggOyBpIDwgZHJvcC5sZW5ndGg7IGkrKyApIHtcblx0XHRcdGlmICggZHJvcFsgaSBdID09PSB0aGlzICkge1xuXHRcdFx0XHRkcm9wLnNwbGljZSggaSwgMSApO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblxuXHRfZGVzdHJveTogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGRyb3AgPSAkLnVpLmRkbWFuYWdlci5kcm9wcGFibGVzWyB0aGlzLm9wdGlvbnMuc2NvcGUgXTtcblxuXHRcdHRoaXMuX3NwbGljZSggZHJvcCApO1xuXHR9LFxuXG5cdF9zZXRPcHRpb246IGZ1bmN0aW9uKCBrZXksIHZhbHVlICkge1xuXG5cdFx0aWYgKCBrZXkgPT09IFwiYWNjZXB0XCIgKSB7XG5cdFx0XHR0aGlzLmFjY2VwdCA9ICQuaXNGdW5jdGlvbiggdmFsdWUgKSA/IHZhbHVlIDogZnVuY3Rpb24oIGQgKSB7XG5cdFx0XHRcdHJldHVybiBkLmlzKCB2YWx1ZSApO1xuXHRcdFx0fTtcblx0XHR9IGVsc2UgaWYgKCBrZXkgPT09IFwic2NvcGVcIiApIHtcblx0XHRcdHZhciBkcm9wID0gJC51aS5kZG1hbmFnZXIuZHJvcHBhYmxlc1sgdGhpcy5vcHRpb25zLnNjb3BlIF07XG5cblx0XHRcdHRoaXMuX3NwbGljZSggZHJvcCApO1xuXHRcdFx0dGhpcy5fYWRkVG9NYW5hZ2VyKCB2YWx1ZSApO1xuXHRcdH1cblxuXHRcdHRoaXMuX3N1cGVyKCBrZXksIHZhbHVlICk7XG5cdH0sXG5cblx0X2FjdGl2YXRlOiBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0dmFyIGRyYWdnYWJsZSA9ICQudWkuZGRtYW5hZ2VyLmN1cnJlbnQ7XG5cblx0XHR0aGlzLl9hZGRBY3RpdmVDbGFzcygpO1xuXHRcdGlmICggZHJhZ2dhYmxlICkge1xuXHRcdFx0dGhpcy5fdHJpZ2dlciggXCJhY3RpdmF0ZVwiLCBldmVudCwgdGhpcy51aSggZHJhZ2dhYmxlICkgKTtcblx0XHR9XG5cdH0sXG5cblx0X2RlYWN0aXZhdGU6IGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHR2YXIgZHJhZ2dhYmxlID0gJC51aS5kZG1hbmFnZXIuY3VycmVudDtcblxuXHRcdHRoaXMuX3JlbW92ZUFjdGl2ZUNsYXNzKCk7XG5cdFx0aWYgKCBkcmFnZ2FibGUgKSB7XG5cdFx0XHR0aGlzLl90cmlnZ2VyKCBcImRlYWN0aXZhdGVcIiwgZXZlbnQsIHRoaXMudWkoIGRyYWdnYWJsZSApICk7XG5cdFx0fVxuXHR9LFxuXG5cdF9vdmVyOiBmdW5jdGlvbiggZXZlbnQgKSB7XG5cblx0XHR2YXIgZHJhZ2dhYmxlID0gJC51aS5kZG1hbmFnZXIuY3VycmVudDtcblxuXHRcdC8vIEJhaWwgaWYgZHJhZ2dhYmxlIGFuZCBkcm9wcGFibGUgYXJlIHNhbWUgZWxlbWVudFxuXHRcdGlmICggIWRyYWdnYWJsZSB8fCAoIGRyYWdnYWJsZS5jdXJyZW50SXRlbSB8fFxuXHRcdFx0XHRkcmFnZ2FibGUuZWxlbWVudCApWyAwIF0gPT09IHRoaXMuZWxlbWVudFsgMCBdICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGlmICggdGhpcy5hY2NlcHQuY2FsbCggdGhpcy5lbGVtZW50WyAwIF0sICggZHJhZ2dhYmxlLmN1cnJlbnRJdGVtIHx8XG5cdFx0XHRcdGRyYWdnYWJsZS5lbGVtZW50ICkgKSApIHtcblx0XHRcdHRoaXMuX2FkZEhvdmVyQ2xhc3MoKTtcblx0XHRcdHRoaXMuX3RyaWdnZXIoIFwib3ZlclwiLCBldmVudCwgdGhpcy51aSggZHJhZ2dhYmxlICkgKTtcblx0XHR9XG5cblx0fSxcblxuXHRfb3V0OiBmdW5jdGlvbiggZXZlbnQgKSB7XG5cblx0XHR2YXIgZHJhZ2dhYmxlID0gJC51aS5kZG1hbmFnZXIuY3VycmVudDtcblxuXHRcdC8vIEJhaWwgaWYgZHJhZ2dhYmxlIGFuZCBkcm9wcGFibGUgYXJlIHNhbWUgZWxlbWVudFxuXHRcdGlmICggIWRyYWdnYWJsZSB8fCAoIGRyYWdnYWJsZS5jdXJyZW50SXRlbSB8fFxuXHRcdFx0XHRkcmFnZ2FibGUuZWxlbWVudCApWyAwIF0gPT09IHRoaXMuZWxlbWVudFsgMCBdICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGlmICggdGhpcy5hY2NlcHQuY2FsbCggdGhpcy5lbGVtZW50WyAwIF0sICggZHJhZ2dhYmxlLmN1cnJlbnRJdGVtIHx8XG5cdFx0XHRcdGRyYWdnYWJsZS5lbGVtZW50ICkgKSApIHtcblx0XHRcdHRoaXMuX3JlbW92ZUhvdmVyQ2xhc3MoKTtcblx0XHRcdHRoaXMuX3RyaWdnZXIoIFwib3V0XCIsIGV2ZW50LCB0aGlzLnVpKCBkcmFnZ2FibGUgKSApO1xuXHRcdH1cblxuXHR9LFxuXG5cdF9kcm9wOiBmdW5jdGlvbiggZXZlbnQsIGN1c3RvbSApIHtcblxuXHRcdHZhciBkcmFnZ2FibGUgPSBjdXN0b20gfHwgJC51aS5kZG1hbmFnZXIuY3VycmVudCxcblx0XHRcdGNoaWxkcmVuSW50ZXJzZWN0aW9uID0gZmFsc2U7XG5cblx0XHQvLyBCYWlsIGlmIGRyYWdnYWJsZSBhbmQgZHJvcHBhYmxlIGFyZSBzYW1lIGVsZW1lbnRcblx0XHRpZiAoICFkcmFnZ2FibGUgfHwgKCBkcmFnZ2FibGUuY3VycmVudEl0ZW0gfHxcblx0XHRcdFx0ZHJhZ2dhYmxlLmVsZW1lbnQgKVsgMCBdID09PSB0aGlzLmVsZW1lbnRbIDAgXSApIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHR0aGlzLmVsZW1lbnRcblx0XHRcdC5maW5kKCBcIjpkYXRhKHVpLWRyb3BwYWJsZSlcIiApXG5cdFx0XHQubm90KCBcIi51aS1kcmFnZ2FibGUtZHJhZ2dpbmdcIiApXG5cdFx0XHQuZWFjaCggZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBpbnN0ID0gJCggdGhpcyApLmRyb3BwYWJsZSggXCJpbnN0YW5jZVwiICk7XG5cdFx0XHRcdGlmIChcblx0XHRcdFx0XHRpbnN0Lm9wdGlvbnMuZ3JlZWR5ICYmXG5cdFx0XHRcdFx0IWluc3Qub3B0aW9ucy5kaXNhYmxlZCAmJlxuXHRcdFx0XHRcdGluc3Qub3B0aW9ucy5zY29wZSA9PT0gZHJhZ2dhYmxlLm9wdGlvbnMuc2NvcGUgJiZcblx0XHRcdFx0XHRpbnN0LmFjY2VwdC5jYWxsKFxuXHRcdFx0XHRcdFx0aW5zdC5lbGVtZW50WyAwIF0sICggZHJhZ2dhYmxlLmN1cnJlbnRJdGVtIHx8IGRyYWdnYWJsZS5lbGVtZW50IClcblx0XHRcdFx0XHQpICYmXG5cdFx0XHRcdFx0aW50ZXJzZWN0KFxuXHRcdFx0XHRcdFx0ZHJhZ2dhYmxlLFxuXHRcdFx0XHRcdFx0JC5leHRlbmQoIGluc3QsIHsgb2Zmc2V0OiBpbnN0LmVsZW1lbnQub2Zmc2V0KCkgfSApLFxuXHRcdFx0XHRcdFx0aW5zdC5vcHRpb25zLnRvbGVyYW5jZSwgZXZlbnRcblx0XHRcdFx0XHQpXG5cdFx0XHRcdCkge1xuXHRcdFx0XHRcdGNoaWxkcmVuSW50ZXJzZWN0aW9uID0gdHJ1ZTtcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7IH1cblx0XHRcdH0gKTtcblx0XHRpZiAoIGNoaWxkcmVuSW50ZXJzZWN0aW9uICkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdGlmICggdGhpcy5hY2NlcHQuY2FsbCggdGhpcy5lbGVtZW50WyAwIF0sXG5cdFx0XHRcdCggZHJhZ2dhYmxlLmN1cnJlbnRJdGVtIHx8IGRyYWdnYWJsZS5lbGVtZW50ICkgKSApIHtcblx0XHRcdHRoaXMuX3JlbW92ZUFjdGl2ZUNsYXNzKCk7XG5cdFx0XHR0aGlzLl9yZW1vdmVIb3ZlckNsYXNzKCk7XG5cblx0XHRcdHRoaXMuX3RyaWdnZXIoIFwiZHJvcFwiLCBldmVudCwgdGhpcy51aSggZHJhZ2dhYmxlICkgKTtcblx0XHRcdHJldHVybiB0aGlzLmVsZW1lbnQ7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGZhbHNlO1xuXG5cdH0sXG5cblx0dWk6IGZ1bmN0aW9uKCBjICkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRkcmFnZ2FibGU6ICggYy5jdXJyZW50SXRlbSB8fCBjLmVsZW1lbnQgKSxcblx0XHRcdGhlbHBlcjogYy5oZWxwZXIsXG5cdFx0XHRwb3NpdGlvbjogYy5wb3NpdGlvbixcblx0XHRcdG9mZnNldDogYy5wb3NpdGlvbkFic1xuXHRcdH07XG5cdH0sXG5cblx0Ly8gRXh0ZW5zaW9uIHBvaW50cyBqdXN0IHRvIG1ha2UgYmFja2NvbXBhdCBzYW5lIGFuZCBhdm9pZCBkdXBsaWNhdGluZyBsb2dpY1xuXHQvLyBUT0RPOiBSZW1vdmUgaW4gMS4xMyBhbG9uZyB3aXRoIGNhbGwgdG8gaXQgYmVsb3dcblx0X2FkZEhvdmVyQ2xhc3M6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuX2FkZENsYXNzKCBcInVpLWRyb3BwYWJsZS1ob3ZlclwiICk7XG5cdH0sXG5cblx0X3JlbW92ZUhvdmVyQ2xhc3M6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuX3JlbW92ZUNsYXNzKCBcInVpLWRyb3BwYWJsZS1ob3ZlclwiICk7XG5cdH0sXG5cblx0X2FkZEFjdGl2ZUNsYXNzOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLl9hZGRDbGFzcyggXCJ1aS1kcm9wcGFibGUtYWN0aXZlXCIgKTtcblx0fSxcblxuXHRfcmVtb3ZlQWN0aXZlQ2xhc3M6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuX3JlbW92ZUNsYXNzKCBcInVpLWRyb3BwYWJsZS1hY3RpdmVcIiApO1xuXHR9XG59ICk7XG5cbnZhciBpbnRlcnNlY3QgPSAkLnVpLmludGVyc2VjdCA9ICggZnVuY3Rpb24oKSB7XG5cdGZ1bmN0aW9uIGlzT3ZlckF4aXMoIHgsIHJlZmVyZW5jZSwgc2l6ZSApIHtcblx0XHRyZXR1cm4gKCB4ID49IHJlZmVyZW5jZSApICYmICggeCA8ICggcmVmZXJlbmNlICsgc2l6ZSApICk7XG5cdH1cblxuXHRyZXR1cm4gZnVuY3Rpb24oIGRyYWdnYWJsZSwgZHJvcHBhYmxlLCB0b2xlcmFuY2VNb2RlLCBldmVudCApIHtcblxuXHRcdGlmICggIWRyb3BwYWJsZS5vZmZzZXQgKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0dmFyIHgxID0gKCBkcmFnZ2FibGUucG9zaXRpb25BYnMgfHxcblx0XHRcdFx0ZHJhZ2dhYmxlLnBvc2l0aW9uLmFic29sdXRlICkubGVmdCArIGRyYWdnYWJsZS5tYXJnaW5zLmxlZnQsXG5cdFx0XHR5MSA9ICggZHJhZ2dhYmxlLnBvc2l0aW9uQWJzIHx8XG5cdFx0XHRcdGRyYWdnYWJsZS5wb3NpdGlvbi5hYnNvbHV0ZSApLnRvcCArIGRyYWdnYWJsZS5tYXJnaW5zLnRvcCxcblx0XHRcdHgyID0geDEgKyBkcmFnZ2FibGUuaGVscGVyUHJvcG9ydGlvbnMud2lkdGgsXG5cdFx0XHR5MiA9IHkxICsgZHJhZ2dhYmxlLmhlbHBlclByb3BvcnRpb25zLmhlaWdodCxcblx0XHRcdGwgPSBkcm9wcGFibGUub2Zmc2V0LmxlZnQsXG5cdFx0XHR0ID0gZHJvcHBhYmxlLm9mZnNldC50b3AsXG5cdFx0XHRyID0gbCArIGRyb3BwYWJsZS5wcm9wb3J0aW9ucygpLndpZHRoLFxuXHRcdFx0YiA9IHQgKyBkcm9wcGFibGUucHJvcG9ydGlvbnMoKS5oZWlnaHQ7XG5cblx0XHRzd2l0Y2ggKCB0b2xlcmFuY2VNb2RlICkge1xuXHRcdGNhc2UgXCJmaXRcIjpcblx0XHRcdHJldHVybiAoIGwgPD0geDEgJiYgeDIgPD0gciAmJiB0IDw9IHkxICYmIHkyIDw9IGIgKTtcblx0XHRjYXNlIFwiaW50ZXJzZWN0XCI6XG5cdFx0XHRyZXR1cm4gKCBsIDwgeDEgKyAoIGRyYWdnYWJsZS5oZWxwZXJQcm9wb3J0aW9ucy53aWR0aCAvIDIgKSAmJiAvLyBSaWdodCBIYWxmXG5cdFx0XHRcdHgyIC0gKCBkcmFnZ2FibGUuaGVscGVyUHJvcG9ydGlvbnMud2lkdGggLyAyICkgPCByICYmIC8vIExlZnQgSGFsZlxuXHRcdFx0XHR0IDwgeTEgKyAoIGRyYWdnYWJsZS5oZWxwZXJQcm9wb3J0aW9ucy5oZWlnaHQgLyAyICkgJiYgLy8gQm90dG9tIEhhbGZcblx0XHRcdFx0eTIgLSAoIGRyYWdnYWJsZS5oZWxwZXJQcm9wb3J0aW9ucy5oZWlnaHQgLyAyICkgPCBiICk7IC8vIFRvcCBIYWxmXG5cdFx0Y2FzZSBcInBvaW50ZXJcIjpcblx0XHRcdHJldHVybiBpc092ZXJBeGlzKCBldmVudC5wYWdlWSwgdCwgZHJvcHBhYmxlLnByb3BvcnRpb25zKCkuaGVpZ2h0ICkgJiZcblx0XHRcdFx0aXNPdmVyQXhpcyggZXZlbnQucGFnZVgsIGwsIGRyb3BwYWJsZS5wcm9wb3J0aW9ucygpLndpZHRoICk7XG5cdFx0Y2FzZSBcInRvdWNoXCI6XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHQoIHkxID49IHQgJiYgeTEgPD0gYiApIHx8IC8vIFRvcCBlZGdlIHRvdWNoaW5nXG5cdFx0XHRcdCggeTIgPj0gdCAmJiB5MiA8PSBiICkgfHwgLy8gQm90dG9tIGVkZ2UgdG91Y2hpbmdcblx0XHRcdFx0KCB5MSA8IHQgJiYgeTIgPiBiICkgLy8gU3Vycm91bmRlZCB2ZXJ0aWNhbGx5XG5cdFx0XHQpICYmIChcblx0XHRcdFx0KCB4MSA+PSBsICYmIHgxIDw9IHIgKSB8fCAvLyBMZWZ0IGVkZ2UgdG91Y2hpbmdcblx0XHRcdFx0KCB4MiA+PSBsICYmIHgyIDw9IHIgKSB8fCAvLyBSaWdodCBlZGdlIHRvdWNoaW5nXG5cdFx0XHRcdCggeDEgPCBsICYmIHgyID4gciApIC8vIFN1cnJvdW5kZWQgaG9yaXpvbnRhbGx5XG5cdFx0XHQpO1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHR9O1xufSApKCk7XG5cbi8qXG5cdFRoaXMgbWFuYWdlciB0cmFja3Mgb2Zmc2V0cyBvZiBkcmFnZ2FibGVzIGFuZCBkcm9wcGFibGVzXG4qL1xuJC51aS5kZG1hbmFnZXIgPSB7XG5cdGN1cnJlbnQ6IG51bGwsXG5cdGRyb3BwYWJsZXM6IHsgXCJkZWZhdWx0XCI6IFtdIH0sXG5cdHByZXBhcmVPZmZzZXRzOiBmdW5jdGlvbiggdCwgZXZlbnQgKSB7XG5cblx0XHR2YXIgaSwgaixcblx0XHRcdG0gPSAkLnVpLmRkbWFuYWdlci5kcm9wcGFibGVzWyB0Lm9wdGlvbnMuc2NvcGUgXSB8fCBbXSxcblx0XHRcdHR5cGUgPSBldmVudCA/IGV2ZW50LnR5cGUgOiBudWxsLCAvLyB3b3JrYXJvdW5kIGZvciAjMjMxN1xuXHRcdFx0bGlzdCA9ICggdC5jdXJyZW50SXRlbSB8fCB0LmVsZW1lbnQgKS5maW5kKCBcIjpkYXRhKHVpLWRyb3BwYWJsZSlcIiApLmFkZEJhY2soKTtcblxuXHRcdGRyb3BwYWJsZXNMb29wOiBmb3IgKCBpID0gMDsgaSA8IG0ubGVuZ3RoOyBpKysgKSB7XG5cblx0XHRcdC8vIE5vIGRpc2FibGVkIGFuZCBub24tYWNjZXB0ZWRcblx0XHRcdGlmICggbVsgaSBdLm9wdGlvbnMuZGlzYWJsZWQgfHwgKCB0ICYmICFtWyBpIF0uYWNjZXB0LmNhbGwoIG1bIGkgXS5lbGVtZW50WyAwIF0sXG5cdFx0XHRcdFx0KCB0LmN1cnJlbnRJdGVtIHx8IHQuZWxlbWVudCApICkgKSApIHtcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cblx0XHRcdC8vIEZpbHRlciBvdXQgZWxlbWVudHMgaW4gdGhlIGN1cnJlbnQgZHJhZ2dlZCBpdGVtXG5cdFx0XHRmb3IgKCBqID0gMDsgaiA8IGxpc3QubGVuZ3RoOyBqKysgKSB7XG5cdFx0XHRcdGlmICggbGlzdFsgaiBdID09PSBtWyBpIF0uZWxlbWVudFsgMCBdICkge1xuXHRcdFx0XHRcdG1bIGkgXS5wcm9wb3J0aW9ucygpLmhlaWdodCA9IDA7XG5cdFx0XHRcdFx0Y29udGludWUgZHJvcHBhYmxlc0xvb3A7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0bVsgaSBdLnZpc2libGUgPSBtWyBpIF0uZWxlbWVudC5jc3MoIFwiZGlzcGxheVwiICkgIT09IFwibm9uZVwiO1xuXHRcdFx0aWYgKCAhbVsgaSBdLnZpc2libGUgKSB7XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBBY3RpdmF0ZSB0aGUgZHJvcHBhYmxlIGlmIHVzZWQgZGlyZWN0bHkgZnJvbSBkcmFnZ2FibGVzXG5cdFx0XHRpZiAoIHR5cGUgPT09IFwibW91c2Vkb3duXCIgKSB7XG5cdFx0XHRcdG1bIGkgXS5fYWN0aXZhdGUuY2FsbCggbVsgaSBdLCBldmVudCApO1xuXHRcdFx0fVxuXG5cdFx0XHRtWyBpIF0ub2Zmc2V0ID0gbVsgaSBdLmVsZW1lbnQub2Zmc2V0KCk7XG5cdFx0XHRtWyBpIF0ucHJvcG9ydGlvbnMoIHtcblx0XHRcdFx0d2lkdGg6IG1bIGkgXS5lbGVtZW50WyAwIF0ub2Zmc2V0V2lkdGgsXG5cdFx0XHRcdGhlaWdodDogbVsgaSBdLmVsZW1lbnRbIDAgXS5vZmZzZXRIZWlnaHRcblx0XHRcdH0gKTtcblxuXHRcdH1cblxuXHR9LFxuXHRkcm9wOiBmdW5jdGlvbiggZHJhZ2dhYmxlLCBldmVudCApIHtcblxuXHRcdHZhciBkcm9wcGVkID0gZmFsc2U7XG5cblx0XHQvLyBDcmVhdGUgYSBjb3B5IG9mIHRoZSBkcm9wcGFibGVzIGluIGNhc2UgdGhlIGxpc3QgY2hhbmdlcyBkdXJpbmcgdGhlIGRyb3AgKCM5MTE2KVxuXHRcdCQuZWFjaCggKCAkLnVpLmRkbWFuYWdlci5kcm9wcGFibGVzWyBkcmFnZ2FibGUub3B0aW9ucy5zY29wZSBdIHx8IFtdICkuc2xpY2UoKSwgZnVuY3Rpb24oKSB7XG5cblx0XHRcdGlmICggIXRoaXMub3B0aW9ucyApIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0aWYgKCAhdGhpcy5vcHRpb25zLmRpc2FibGVkICYmIHRoaXMudmlzaWJsZSAmJlxuXHRcdFx0XHRcdGludGVyc2VjdCggZHJhZ2dhYmxlLCB0aGlzLCB0aGlzLm9wdGlvbnMudG9sZXJhbmNlLCBldmVudCApICkge1xuXHRcdFx0XHRkcm9wcGVkID0gdGhpcy5fZHJvcC5jYWxsKCB0aGlzLCBldmVudCApIHx8IGRyb3BwZWQ7XG5cdFx0XHR9XG5cblx0XHRcdGlmICggIXRoaXMub3B0aW9ucy5kaXNhYmxlZCAmJiB0aGlzLnZpc2libGUgJiYgdGhpcy5hY2NlcHQuY2FsbCggdGhpcy5lbGVtZW50WyAwIF0sXG5cdFx0XHRcdFx0KCBkcmFnZ2FibGUuY3VycmVudEl0ZW0gfHwgZHJhZ2dhYmxlLmVsZW1lbnQgKSApICkge1xuXHRcdFx0XHR0aGlzLmlzb3V0ID0gdHJ1ZTtcblx0XHRcdFx0dGhpcy5pc292ZXIgPSBmYWxzZTtcblx0XHRcdFx0dGhpcy5fZGVhY3RpdmF0ZS5jYWxsKCB0aGlzLCBldmVudCApO1xuXHRcdFx0fVxuXG5cdFx0fSApO1xuXHRcdHJldHVybiBkcm9wcGVkO1xuXG5cdH0sXG5cdGRyYWdTdGFydDogZnVuY3Rpb24oIGRyYWdnYWJsZSwgZXZlbnQgKSB7XG5cblx0XHQvLyBMaXN0ZW4gZm9yIHNjcm9sbGluZyBzbyB0aGF0IGlmIHRoZSBkcmFnZ2luZyBjYXVzZXMgc2Nyb2xsaW5nIHRoZSBwb3NpdGlvbiBvZiB0aGVcblx0XHQvLyBkcm9wcGFibGVzIGNhbiBiZSByZWNhbGN1bGF0ZWQgKHNlZSAjNTAwMylcblx0XHRkcmFnZ2FibGUuZWxlbWVudC5wYXJlbnRzVW50aWwoIFwiYm9keVwiICkub24oIFwic2Nyb2xsLmRyb3BwYWJsZVwiLCBmdW5jdGlvbigpIHtcblx0XHRcdGlmICggIWRyYWdnYWJsZS5vcHRpb25zLnJlZnJlc2hQb3NpdGlvbnMgKSB7XG5cdFx0XHRcdCQudWkuZGRtYW5hZ2VyLnByZXBhcmVPZmZzZXRzKCBkcmFnZ2FibGUsIGV2ZW50ICk7XG5cdFx0XHR9XG5cdFx0fSApO1xuXHR9LFxuXHRkcmFnOiBmdW5jdGlvbiggZHJhZ2dhYmxlLCBldmVudCApIHtcblxuXHRcdC8vIElmIHlvdSBoYXZlIGEgaGlnaGx5IGR5bmFtaWMgcGFnZSwgeW91IG1pZ2h0IHRyeSB0aGlzIG9wdGlvbi4gSXQgcmVuZGVycyBwb3NpdGlvbnNcblx0XHQvLyBldmVyeSB0aW1lIHlvdSBtb3ZlIHRoZSBtb3VzZS5cblx0XHRpZiAoIGRyYWdnYWJsZS5vcHRpb25zLnJlZnJlc2hQb3NpdGlvbnMgKSB7XG5cdFx0XHQkLnVpLmRkbWFuYWdlci5wcmVwYXJlT2Zmc2V0cyggZHJhZ2dhYmxlLCBldmVudCApO1xuXHRcdH1cblxuXHRcdC8vIFJ1biB0aHJvdWdoIGFsbCBkcm9wcGFibGVzIGFuZCBjaGVjayB0aGVpciBwb3NpdGlvbnMgYmFzZWQgb24gc3BlY2lmaWMgdG9sZXJhbmNlIG9wdGlvbnNcblx0XHQkLmVhY2goICQudWkuZGRtYW5hZ2VyLmRyb3BwYWJsZXNbIGRyYWdnYWJsZS5vcHRpb25zLnNjb3BlIF0gfHwgW10sIGZ1bmN0aW9uKCkge1xuXG5cdFx0XHRpZiAoIHRoaXMub3B0aW9ucy5kaXNhYmxlZCB8fCB0aGlzLmdyZWVkeUNoaWxkIHx8ICF0aGlzLnZpc2libGUgKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0dmFyIHBhcmVudEluc3RhbmNlLCBzY29wZSwgcGFyZW50LFxuXHRcdFx0XHRpbnRlcnNlY3RzID0gaW50ZXJzZWN0KCBkcmFnZ2FibGUsIHRoaXMsIHRoaXMub3B0aW9ucy50b2xlcmFuY2UsIGV2ZW50ICksXG5cdFx0XHRcdGMgPSAhaW50ZXJzZWN0cyAmJiB0aGlzLmlzb3ZlciA/XG5cdFx0XHRcdFx0XCJpc291dFwiIDpcblx0XHRcdFx0XHQoIGludGVyc2VjdHMgJiYgIXRoaXMuaXNvdmVyID8gXCJpc292ZXJcIiA6IG51bGwgKTtcblx0XHRcdGlmICggIWMgKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0aWYgKCB0aGlzLm9wdGlvbnMuZ3JlZWR5ICkge1xuXG5cdFx0XHRcdC8vIGZpbmQgZHJvcHBhYmxlIHBhcmVudHMgd2l0aCBzYW1lIHNjb3BlXG5cdFx0XHRcdHNjb3BlID0gdGhpcy5vcHRpb25zLnNjb3BlO1xuXHRcdFx0XHRwYXJlbnQgPSB0aGlzLmVsZW1lbnQucGFyZW50cyggXCI6ZGF0YSh1aS1kcm9wcGFibGUpXCIgKS5maWx0ZXIoIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdHJldHVybiAkKCB0aGlzICkuZHJvcHBhYmxlKCBcImluc3RhbmNlXCIgKS5vcHRpb25zLnNjb3BlID09PSBzY29wZTtcblx0XHRcdFx0fSApO1xuXG5cdFx0XHRcdGlmICggcGFyZW50Lmxlbmd0aCApIHtcblx0XHRcdFx0XHRwYXJlbnRJbnN0YW5jZSA9ICQoIHBhcmVudFsgMCBdICkuZHJvcHBhYmxlKCBcImluc3RhbmNlXCIgKTtcblx0XHRcdFx0XHRwYXJlbnRJbnN0YW5jZS5ncmVlZHlDaGlsZCA9ICggYyA9PT0gXCJpc292ZXJcIiApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8vIFdlIGp1c3QgbW92ZWQgaW50byBhIGdyZWVkeSBjaGlsZFxuXHRcdFx0aWYgKCBwYXJlbnRJbnN0YW5jZSAmJiBjID09PSBcImlzb3ZlclwiICkge1xuXHRcdFx0XHRwYXJlbnRJbnN0YW5jZS5pc292ZXIgPSBmYWxzZTtcblx0XHRcdFx0cGFyZW50SW5zdGFuY2UuaXNvdXQgPSB0cnVlO1xuXHRcdFx0XHRwYXJlbnRJbnN0YW5jZS5fb3V0LmNhbGwoIHBhcmVudEluc3RhbmNlLCBldmVudCApO1xuXHRcdFx0fVxuXG5cdFx0XHR0aGlzWyBjIF0gPSB0cnVlO1xuXHRcdFx0dGhpc1sgYyA9PT0gXCJpc291dFwiID8gXCJpc292ZXJcIiA6IFwiaXNvdXRcIiBdID0gZmFsc2U7XG5cdFx0XHR0aGlzWyBjID09PSBcImlzb3ZlclwiID8gXCJfb3ZlclwiIDogXCJfb3V0XCIgXS5jYWxsKCB0aGlzLCBldmVudCApO1xuXG5cdFx0XHQvLyBXZSBqdXN0IG1vdmVkIG91dCBvZiBhIGdyZWVkeSBjaGlsZFxuXHRcdFx0aWYgKCBwYXJlbnRJbnN0YW5jZSAmJiBjID09PSBcImlzb3V0XCIgKSB7XG5cdFx0XHRcdHBhcmVudEluc3RhbmNlLmlzb3V0ID0gZmFsc2U7XG5cdFx0XHRcdHBhcmVudEluc3RhbmNlLmlzb3ZlciA9IHRydWU7XG5cdFx0XHRcdHBhcmVudEluc3RhbmNlLl9vdmVyLmNhbGwoIHBhcmVudEluc3RhbmNlLCBldmVudCApO1xuXHRcdFx0fVxuXHRcdH0gKTtcblxuXHR9LFxuXHRkcmFnU3RvcDogZnVuY3Rpb24oIGRyYWdnYWJsZSwgZXZlbnQgKSB7XG5cdFx0ZHJhZ2dhYmxlLmVsZW1lbnQucGFyZW50c1VudGlsKCBcImJvZHlcIiApLm9mZiggXCJzY3JvbGwuZHJvcHBhYmxlXCIgKTtcblxuXHRcdC8vIENhbGwgcHJlcGFyZU9mZnNldHMgb25lIGZpbmFsIHRpbWUgc2luY2UgSUUgZG9lcyBub3QgZmlyZSByZXR1cm4gc2Nyb2xsIGV2ZW50cyB3aGVuXG5cdFx0Ly8gb3ZlcmZsb3cgd2FzIGNhdXNlZCBieSBkcmFnIChzZWUgIzUwMDMpXG5cdFx0aWYgKCAhZHJhZ2dhYmxlLm9wdGlvbnMucmVmcmVzaFBvc2l0aW9ucyApIHtcblx0XHRcdCQudWkuZGRtYW5hZ2VyLnByZXBhcmVPZmZzZXRzKCBkcmFnZ2FibGUsIGV2ZW50ICk7XG5cdFx0fVxuXHR9XG59O1xuXG4vLyBERVBSRUNBVEVEXG4vLyBUT0RPOiBzd2l0Y2ggcmV0dXJuIGJhY2sgdG8gd2lkZ2V0IGRlY2xhcmF0aW9uIGF0IHRvcCBvZiBmaWxlIHdoZW4gdGhpcyBpcyByZW1vdmVkXG5pZiAoICQudWlCYWNrQ29tcGF0ICE9PSBmYWxzZSApIHtcblxuXHQvLyBCYWNrY29tcGF0IGZvciBhY3RpdmVDbGFzcyBhbmQgaG92ZXJDbGFzcyBvcHRpb25zXG5cdCQud2lkZ2V0KCBcInVpLmRyb3BwYWJsZVwiLCAkLnVpLmRyb3BwYWJsZSwge1xuXHRcdG9wdGlvbnM6IHtcblx0XHRcdGhvdmVyQ2xhc3M6IGZhbHNlLFxuXHRcdFx0YWN0aXZlQ2xhc3M6IGZhbHNlXG5cdFx0fSxcblx0XHRfYWRkQWN0aXZlQ2xhc3M6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy5fc3VwZXIoKTtcblx0XHRcdGlmICggdGhpcy5vcHRpb25zLmFjdGl2ZUNsYXNzICkge1xuXHRcdFx0XHR0aGlzLmVsZW1lbnQuYWRkQ2xhc3MoIHRoaXMub3B0aW9ucy5hY3RpdmVDbGFzcyApO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0X3JlbW92ZUFjdGl2ZUNsYXNzOiBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMuX3N1cGVyKCk7XG5cdFx0XHRpZiAoIHRoaXMub3B0aW9ucy5hY3RpdmVDbGFzcyApIHtcblx0XHRcdFx0dGhpcy5lbGVtZW50LnJlbW92ZUNsYXNzKCB0aGlzLm9wdGlvbnMuYWN0aXZlQ2xhc3MgKTtcblx0XHRcdH1cblx0XHR9LFxuXHRcdF9hZGRIb3ZlckNsYXNzOiBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMuX3N1cGVyKCk7XG5cdFx0XHRpZiAoIHRoaXMub3B0aW9ucy5ob3ZlckNsYXNzICkge1xuXHRcdFx0XHR0aGlzLmVsZW1lbnQuYWRkQ2xhc3MoIHRoaXMub3B0aW9ucy5ob3ZlckNsYXNzICk7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRfcmVtb3ZlSG92ZXJDbGFzczogZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGlzLl9zdXBlcigpO1xuXHRcdFx0aWYgKCB0aGlzLm9wdGlvbnMuaG92ZXJDbGFzcyApIHtcblx0XHRcdFx0dGhpcy5lbGVtZW50LnJlbW92ZUNsYXNzKCB0aGlzLm9wdGlvbnMuaG92ZXJDbGFzcyApO1xuXHRcdFx0fVxuXHRcdH1cblx0fSApO1xufVxuXG5yZXR1cm4gJC51aS5kcm9wcGFibGU7XG5cbn0gKSApO1xuIl19
