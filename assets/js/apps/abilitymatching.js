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
			portraitImage.src = "http://media.steampowered.com/apps/dota2/images/heroes/" + h.replace('npc_dota_hero_','') + "_lg.png";
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

                    var imageUrl = "http://media.steampowered.com/apps/dota2/images/abilities/" + data.abilities[i].name + "_hp2.png";
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYXBwcy9hYmlsaXR5bWF0Y2hpbmcuanMiLCJzcmMvanMvbGliL2pxdWVyeS51aS50b3VjaC1wdW5jaC5qcyIsIm5vZGVfbW9kdWxlcy9qcXVlcnktdWkvdWkvd2lkZ2V0cy9kcm9wcGFibGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25MQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyICQgPSBqUXVlcnkgPSByZXF1aXJlKCdqcXVlcnknKTtcbnJlcXVpcmUoJ2pxdWVyeS11aS91aS92ZXJzaW9uJyk7XG5yZXF1aXJlKCdqcXVlcnktdWkvdWkvaWUnKTtcbnJlcXVpcmUoJ2pxdWVyeS11aS91aS9kYXRhJyk7XG5yZXF1aXJlKCdqcXVlcnktdWkvdWkvcGx1Z2luJyk7XG5yZXF1aXJlKCdqcXVlcnktdWkvdWkvc2FmZS1hY3RpdmUtZWxlbWVudCcpO1xucmVxdWlyZSgnanF1ZXJ5LXVpL3VpL3NhZmUtYmx1cicpO1xucmVxdWlyZSgnanF1ZXJ5LXVpL3VpL3Njcm9sbC1wYXJlbnQnKTtcbnJlcXVpcmUoJ2pxdWVyeS11aS91aS93aWRnZXQnKTtcbnJlcXVpcmUoJ2pxdWVyeS11aS91aS93aWRnZXRzL21vdXNlJyk7XG5yZXF1aXJlKCdqcXVlcnktdWkvdWkvd2lkZ2V0cy9kcmFnZ2FibGUnKTtcbnJlcXVpcmUoJ2pxdWVyeS11aS91aS93aWRnZXRzL2Ryb3BwYWJsZScpO1xucmVxdWlyZSgnLi4vbGliL2pxdWVyeS51aS50b3VjaC1wdW5jaCcpO1xucmVxdWlyZSgnYm9vdHN0cmFwJyk7XG52YXIgXyA9IHJlcXVpcmUoJ3VuZGVyc2NvcmUnKTtcblxuJChmdW5jdGlvbiAoKSB7XG4gICAgJC5nZXRKU09OKFwiL21lZGlhL2RvdGEtanNvbi9oZXJvZGF0YS5qc29uXCIsIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgIHZhciBoZXJvZXMgPSBPYmplY3Qua2V5cyhkYXRhKSxcbiAgICAgICAgICAgIGhlcm9kYXRhID0gZGF0YTtcbiAgICAgICAgICAgIFxuICAgICAgICBjcmVhdGVRdWVzdGlvbigpO1xuXG4gICAgICAgIGZ1bmN0aW9uIGNyZWF0ZVF1ZXN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIGggPSBoZXJvZXNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogaGVyb2VzLmxlbmd0aCldLFxuICAgICAgICAgICAgICAgIGRhdGEgPSBoZXJvZGF0YVtoXSxcbiAgICAgICAgICAgICAgICBjb3VudCA9IDAsXG5cdFx0XHRcdGltZ0NvdW50ID0gMDtcblx0XHRcdCQoJyNjb250ZW50Y29udGFpbmVyJykuaGlkZSgpO1xuICAgICAgICAgICAgJCgnI2FiaWxpdHlib3hfc3RhcnQnKS5lbXB0eSgpO1xuICAgICAgICAgICAgJCgnI2FiaWxpdHlib3hfZW5kJykuZW1wdHkoKTtcbiAgICAgICAgICAgICQoJyNoZXJvcG9ydHJhaXQnKS5lbXB0eSgpO1xuICAgICAgICAgICAgJCgnI2hlcm9uYW1lJykuZW1wdHkoKTtcblx0XHRcdGltZ0NvdW50ID0gZGF0YS5hYmlsaXRpZXMuZmlsdGVyKGZ1bmN0aW9uIChhYmlsaXR5KSB7IFxuXHRcdFx0XHRyZXR1cm4gYWJpbGl0eS5uYW1lICE9ICdhdHRyaWJ1dGVfYm9udXMnICYmIGFiaWxpdHkuZGlzcGxheW5hbWUgIT0gJ0VtcHR5JyAmJiBhYmlsaXR5LmRpc3BsYXluYW1lICE9ICcnXG5cdFx0XHR9KS5sZW5ndGggKyAxO1xuXHRcdFx0XG5cdFx0XHRmdW5jdGlvbiBjaGVja1Nob3dDb250ZW50KCkge1xuXHRcdFx0XHRpZiAoaW1nQ291bnQgPT0gMCkge1xuXHRcdFx0XHRcdCQoJyNjb250ZW50Y29udGFpbmVyJykuc2hvdygpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHR2YXIgcG9ydHJhaXRJbWFnZSA9IG5ldyBJbWFnZSgpO1xuXHRcdFx0cG9ydHJhaXRJbWFnZS5zcmMgPSBcImh0dHA6Ly9tZWRpYS5zdGVhbXBvd2VyZWQuY29tL2FwcHMvZG90YTIvaW1hZ2VzL2hlcm9lcy9cIiArIGgucmVwbGFjZSgnbnBjX2RvdGFfaGVyb18nLCcnKSArIFwiX2xnLnBuZ1wiO1xuXHRcdFx0cG9ydHJhaXRJbWFnZS5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdCQoJyNoZXJvcG9ydHJhaXQnKS5hdHRyKCdzcmMnLCBwb3J0cmFpdEltYWdlLnNyYyk7XG5cdFx0XHRcdGltZ0NvdW50LS07XG5cdFx0XHRcdGNoZWNrU2hvd0NvbnRlbnQoKTtcblx0XHRcdH07XG4gICAgICAgICAgICAkKCcjaGVyb25hbWUnKS50ZXh0KGRhdGEuZGlzcGxheW5hbWUpO1xuICAgICAgICAgICAgXG5cdFx0XHRmdW5jdGlvbiBzZXRJbWFnZShlbGVtZW50LCBzcmMpIHtcblx0XHRcdFx0ZWxlbWVudC5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCAndXJsKCcgKyBzcmMgKyAnKScpO1xuXHRcdFx0XHRpbWdDb3VudC0tO1xuXHRcdFx0XHRjaGVja1Nob3dDb250ZW50KCk7XG5cdFx0XHR9XG5cdFx0XHRcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5hYmlsaXRpZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoZGF0YS5hYmlsaXRpZXNbaV0ubmFtZSAhPSAnYXR0cmlidXRlX2JvbnVzJyAmJiBkYXRhLmFiaWxpdGllc1tpXS5kaXNwbGF5bmFtZSAhPSAnRW1wdHknICYmIGRhdGEuYWJpbGl0aWVzW2ldLmRpc3BsYXluYW1lICE9ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBhYmlsaXR5Ym94ZW5kID0gJCgnPGRpdiBjbGFzcz1hYmlsaXR5Ym94X2VuZCBpZD1hYmlsaXR5XycgKyBpICsgJz48L2Rpdj4nKS5kcm9wcGFibGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgYWNjZXB0OiAnIycgKyBkYXRhLmFiaWxpdGllc1tpXS5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgdG9sZXJhbmNlOiAnaW50ZXJzZWN0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyb3A6IGZ1bmN0aW9uIChldmVudCwgdWkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZHJvcF9wID0gJCh0aGlzKS5vZmZzZXQoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZHJhZ19wID0gdWkuZHJhZ2dhYmxlLm9mZnNldCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZWZ0X2VuZCA9IGRyb3BfcC5sZWZ0IC0gZHJhZ19wLmxlZnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvcF9lbmQgPSBkcm9wX3AudG9wIC0gZHJhZ19wLnRvcDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1aS5kcmFnZ2FibGUuYW5pbWF0ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvcDogJys9JyArIHRvcF9lbmQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQ6ICcrPScgKyBsZWZ0X2VuZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY291bnQgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb3VudCA9PSBkYXRhLmFiaWxpdGllcy5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlUXVlc3Rpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pLmFwcGVuZFRvKCcjYWJpbGl0eWJveF9lbmQnKTtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgaW1hZ2VVcmwgPSBcImh0dHA6Ly9tZWRpYS5zdGVhbXBvd2VyZWQuY29tL2FwcHMvZG90YTIvaW1hZ2VzL2FiaWxpdGllcy9cIiArIGRhdGEuYWJpbGl0aWVzW2ldLm5hbWUgKyBcIl9ocDIucG5nXCI7XG5cdFx0XHRcdFx0XHRvdmVybGF5ID0gJCgnPGRpdiBjbGFzcz1cIm92ZXJsYXktaG92ZXJcIj48L2Rpdj4nKSxcblx0XHRcdFx0XHRcdGFiaWxpdHlXcmFwcGVyID0gJCgnPGRpdiBjbGFzcz1cImFiaWxpdHktd3JhcHBlclwiIGlkPScgKyBkYXRhLmFiaWxpdGllc1tpXS5uYW1lICsgJz48L2Rpdj4nKS5kcmFnZ2FibGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldmVydDogJ2ludmFsaWQnXG4gICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFiaWxpdHkgPSAkKCc8ZGl2IGNsYXNzPVwiYWJpbGl0eWJveFwiPjwvZGl2PicpO1xuXHRcdFx0XHRcdFx0YWJpbGl0eVdyYXBwZXIuYXBwZW5kKG92ZXJsYXkpO1xuXHRcdFx0XHRcdFx0YWJpbGl0eVdyYXBwZXIuYXBwZW5kKGFiaWxpdHkpO1xuXG5cdFx0XHRcdFx0dmFyIGFiaWxpdHlJbWFnZSA9IG5ldyBJbWFnZSgpO1xuXHRcdFx0XHRcdGFiaWxpdHlJbWFnZS5zcmMgPSBpbWFnZVVybDtcblx0XHRcdFx0XHRhYmlsaXR5SW1hZ2Uub25sb2FkID0gc2V0SW1hZ2UoYWJpbGl0eSwgaW1hZ2VVcmwpO1xuXHRcdFx0XHRcdFx0XG4gICAgICAgICAgICAgICAgICAgIGFiaWxpdHkuaHRtbCgkKCc8ZGl2IGNsYXNzPWFiaWxpdHl0ZXh0Y29udGFpbmVyPjwvZGl2PicpLmh0bWwoJCgnPGRpdiBjbGFzcz1hYmlsaXR5dGV4dD48L2Rpdj4nKS50ZXh0KGRhdGEuYWJpbGl0aWVzW2ldLmRpc3BsYXluYW1lKSkpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoTWF0aC5yYW5kb20oKSA8IDAuNSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYWJpbGl0eVdyYXBwZXIuYXBwZW5kVG8oJyNhYmlsaXR5Ym94X3N0YXJ0Jyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhYmlsaXR5V3JhcHBlci5wcmVwZW5kVG8oJyNhYmlsaXR5Ym94X3N0YXJ0Jyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcbn0pOyIsIi8qIVxuICogalF1ZXJ5IFVJIFRvdWNoIFB1bmNoIDAuMi4zXG4gKlxuICogQ29weXJpZ2h0IDIwMTHvv70yMDE0LCBEYXZlIEZ1cmZlcm9cbiAqIER1YWwgbGljZW5zZWQgdW5kZXIgdGhlIE1JVCBvciBHUEwgVmVyc2lvbiAyIGxpY2Vuc2VzLlxuICpcbiAqIERlcGVuZHM6XG4gKiAganF1ZXJ5LnVpLndpZGdldC5qc1xuICogIGpxdWVyeS51aS5tb3VzZS5qc1xuICovXG4oZnVuY3Rpb24gKCQpIHtcblxuICAvLyBEZXRlY3QgdG91Y2ggc3VwcG9ydFxuICAkLnN1cHBvcnQudG91Y2ggPSAnb250b3VjaGVuZCcgaW4gZG9jdW1lbnQ7XG5cbiAgLy8gSWdub3JlIGJyb3dzZXJzIHdpdGhvdXQgdG91Y2ggc3VwcG9ydFxuICBpZiAoISQuc3VwcG9ydC50b3VjaCkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBtb3VzZVByb3RvID0gJC51aS5tb3VzZS5wcm90b3R5cGUsXG4gICAgICBfbW91c2VJbml0ID0gbW91c2VQcm90by5fbW91c2VJbml0LFxuICAgICAgX21vdXNlRGVzdHJveSA9IG1vdXNlUHJvdG8uX21vdXNlRGVzdHJveSxcbiAgICAgIHRvdWNoSGFuZGxlZDtcblxuICAvKipcbiAgICogU2ltdWxhdGUgYSBtb3VzZSBldmVudCBiYXNlZCBvbiBhIGNvcnJlc3BvbmRpbmcgdG91Y2ggZXZlbnRcbiAgICogQHBhcmFtIHtPYmplY3R9IGV2ZW50IEEgdG91Y2ggZXZlbnRcbiAgICogQHBhcmFtIHtTdHJpbmd9IHNpbXVsYXRlZFR5cGUgVGhlIGNvcnJlc3BvbmRpbmcgbW91c2UgZXZlbnRcbiAgICovXG4gIGZ1bmN0aW9uIHNpbXVsYXRlTW91c2VFdmVudCAoZXZlbnQsIHNpbXVsYXRlZFR5cGUpIHtcblxuICAgIC8vIElnbm9yZSBtdWx0aS10b3VjaCBldmVudHNcbiAgICBpZiAoZXZlbnQub3JpZ2luYWxFdmVudC50b3VjaGVzLmxlbmd0aCA+IDEpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgdmFyIHRvdWNoID0gZXZlbnQub3JpZ2luYWxFdmVudC5jaGFuZ2VkVG91Y2hlc1swXSxcbiAgICAgICAgc2ltdWxhdGVkRXZlbnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnTW91c2VFdmVudHMnKTtcbiAgICBcbiAgICAvLyBJbml0aWFsaXplIHRoZSBzaW11bGF0ZWQgbW91c2UgZXZlbnQgdXNpbmcgdGhlIHRvdWNoIGV2ZW50J3MgY29vcmRpbmF0ZXNcbiAgICBzaW11bGF0ZWRFdmVudC5pbml0TW91c2VFdmVudChcbiAgICAgIHNpbXVsYXRlZFR5cGUsICAgIC8vIHR5cGVcbiAgICAgIHRydWUsICAgICAgICAgICAgIC8vIGJ1YmJsZXMgICAgICAgICAgICAgICAgICAgIFxuICAgICAgdHJ1ZSwgICAgICAgICAgICAgLy8gY2FuY2VsYWJsZSAgICAgICAgICAgICAgICAgXG4gICAgICB3aW5kb3csICAgICAgICAgICAvLyB2aWV3ICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgIDEsICAgICAgICAgICAgICAgIC8vIGRldGFpbCAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgdG91Y2guc2NyZWVuWCwgICAgLy8gc2NyZWVuWCAgICAgICAgICAgICAgICAgICAgXG4gICAgICB0b3VjaC5zY3JlZW5ZLCAgICAvLyBzY3JlZW5ZICAgICAgICAgICAgICAgICAgICBcbiAgICAgIHRvdWNoLmNsaWVudFgsICAgIC8vIGNsaWVudFggICAgICAgICAgICAgICAgICAgIFxuICAgICAgdG91Y2guY2xpZW50WSwgICAgLy8gY2xpZW50WSAgICAgICAgICAgICAgICAgICAgXG4gICAgICBmYWxzZSwgICAgICAgICAgICAvLyBjdHJsS2V5ICAgICAgICAgICAgICAgICAgICBcbiAgICAgIGZhbHNlLCAgICAgICAgICAgIC8vIGFsdEtleSAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgZmFsc2UsICAgICAgICAgICAgLy8gc2hpZnRLZXkgICAgICAgICAgICAgICAgICAgXG4gICAgICBmYWxzZSwgICAgICAgICAgICAvLyBtZXRhS2V5ICAgICAgICAgICAgICAgICAgICBcbiAgICAgIDAsICAgICAgICAgICAgICAgIC8vIGJ1dHRvbiAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgbnVsbCAgICAgICAgICAgICAgLy8gcmVsYXRlZFRhcmdldCAgICAgICAgICAgICAgXG4gICAgKTtcblxuICAgIC8vIERpc3BhdGNoIHRoZSBzaW11bGF0ZWQgZXZlbnQgdG8gdGhlIHRhcmdldCBlbGVtZW50XG4gICAgZXZlbnQudGFyZ2V0LmRpc3BhdGNoRXZlbnQoc2ltdWxhdGVkRXZlbnQpO1xuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZSB0aGUgalF1ZXJ5IFVJIHdpZGdldCdzIHRvdWNoc3RhcnQgZXZlbnRzXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBldmVudCBUaGUgd2lkZ2V0IGVsZW1lbnQncyB0b3VjaHN0YXJ0IGV2ZW50XG4gICAqL1xuICBtb3VzZVByb3RvLl90b3VjaFN0YXJ0ID0gZnVuY3Rpb24gKGV2ZW50KSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAvLyBJZ25vcmUgdGhlIGV2ZW50IGlmIGFub3RoZXIgd2lkZ2V0IGlzIGFscmVhZHkgYmVpbmcgaGFuZGxlZFxuICAgIGlmICh0b3VjaEhhbmRsZWQgfHwgIXNlbGYuX21vdXNlQ2FwdHVyZShldmVudC5vcmlnaW5hbEV2ZW50LmNoYW5nZWRUb3VjaGVzWzBdKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFNldCB0aGUgZmxhZyB0byBwcmV2ZW50IG90aGVyIHdpZGdldHMgZnJvbSBpbmhlcml0aW5nIHRoZSB0b3VjaCBldmVudFxuICAgIHRvdWNoSGFuZGxlZCA9IHRydWU7XG5cbiAgICAvLyBUcmFjayBtb3ZlbWVudCB0byBkZXRlcm1pbmUgaWYgaW50ZXJhY3Rpb24gd2FzIGEgY2xpY2tcbiAgICBzZWxmLl90b3VjaE1vdmVkID0gZmFsc2U7XG5cbiAgICAvLyBTaW11bGF0ZSB0aGUgbW91c2VvdmVyIGV2ZW50XG4gICAgc2ltdWxhdGVNb3VzZUV2ZW50KGV2ZW50LCAnbW91c2VvdmVyJyk7XG5cbiAgICAvLyBTaW11bGF0ZSB0aGUgbW91c2Vtb3ZlIGV2ZW50XG4gICAgc2ltdWxhdGVNb3VzZUV2ZW50KGV2ZW50LCAnbW91c2Vtb3ZlJyk7XG5cbiAgICAvLyBTaW11bGF0ZSB0aGUgbW91c2Vkb3duIGV2ZW50XG4gICAgc2ltdWxhdGVNb3VzZUV2ZW50KGV2ZW50LCAnbW91c2Vkb3duJyk7XG4gIH07XG5cbiAgLyoqXG4gICAqIEhhbmRsZSB0aGUgalF1ZXJ5IFVJIHdpZGdldCdzIHRvdWNobW92ZSBldmVudHNcbiAgICogQHBhcmFtIHtPYmplY3R9IGV2ZW50IFRoZSBkb2N1bWVudCdzIHRvdWNobW92ZSBldmVudFxuICAgKi9cbiAgbW91c2VQcm90by5fdG91Y2hNb3ZlID0gZnVuY3Rpb24gKGV2ZW50KSB7XG5cbiAgICAvLyBJZ25vcmUgZXZlbnQgaWYgbm90IGhhbmRsZWRcbiAgICBpZiAoIXRvdWNoSGFuZGxlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIEludGVyYWN0aW9uIHdhcyBub3QgYSBjbGlja1xuICAgIHRoaXMuX3RvdWNoTW92ZWQgPSB0cnVlO1xuXG4gICAgLy8gU2ltdWxhdGUgdGhlIG1vdXNlbW92ZSBldmVudFxuICAgIHNpbXVsYXRlTW91c2VFdmVudChldmVudCwgJ21vdXNlbW92ZScpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBIYW5kbGUgdGhlIGpRdWVyeSBVSSB3aWRnZXQncyB0b3VjaGVuZCBldmVudHNcbiAgICogQHBhcmFtIHtPYmplY3R9IGV2ZW50IFRoZSBkb2N1bWVudCdzIHRvdWNoZW5kIGV2ZW50XG4gICAqL1xuICBtb3VzZVByb3RvLl90b3VjaEVuZCA9IGZ1bmN0aW9uIChldmVudCkge1xuXG4gICAgLy8gSWdub3JlIGV2ZW50IGlmIG5vdCBoYW5kbGVkXG4gICAgaWYgKCF0b3VjaEhhbmRsZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBTaW11bGF0ZSB0aGUgbW91c2V1cCBldmVudFxuICAgIHNpbXVsYXRlTW91c2VFdmVudChldmVudCwgJ21vdXNldXAnKTtcblxuICAgIC8vIFNpbXVsYXRlIHRoZSBtb3VzZW91dCBldmVudFxuICAgIHNpbXVsYXRlTW91c2VFdmVudChldmVudCwgJ21vdXNlb3V0Jyk7XG5cbiAgICAvLyBJZiB0aGUgdG91Y2ggaW50ZXJhY3Rpb24gZGlkIG5vdCBtb3ZlLCBpdCBzaG91bGQgdHJpZ2dlciBhIGNsaWNrXG4gICAgaWYgKCF0aGlzLl90b3VjaE1vdmVkKSB7XG5cbiAgICAgIC8vIFNpbXVsYXRlIHRoZSBjbGljayBldmVudFxuICAgICAgc2ltdWxhdGVNb3VzZUV2ZW50KGV2ZW50LCAnY2xpY2snKTtcbiAgICB9XG5cbiAgICAvLyBVbnNldCB0aGUgZmxhZyB0byBhbGxvdyBvdGhlciB3aWRnZXRzIHRvIGluaGVyaXQgdGhlIHRvdWNoIGV2ZW50XG4gICAgdG91Y2hIYW5kbGVkID0gZmFsc2U7XG4gIH07XG5cbiAgLyoqXG4gICAqIEEgZHVjayBwdW5jaCBvZiB0aGUgJC51aS5tb3VzZSBfbW91c2VJbml0IG1ldGhvZCB0byBzdXBwb3J0IHRvdWNoIGV2ZW50cy5cbiAgICogVGhpcyBtZXRob2QgZXh0ZW5kcyB0aGUgd2lkZ2V0IHdpdGggYm91bmQgdG91Y2ggZXZlbnQgaGFuZGxlcnMgdGhhdFxuICAgKiB0cmFuc2xhdGUgdG91Y2ggZXZlbnRzIHRvIG1vdXNlIGV2ZW50cyBhbmQgcGFzcyB0aGVtIHRvIHRoZSB3aWRnZXQnc1xuICAgKiBvcmlnaW5hbCBtb3VzZSBldmVudCBoYW5kbGluZyBtZXRob2RzLlxuICAgKi9cbiAgbW91c2VQcm90by5fbW91c2VJbml0ID0gZnVuY3Rpb24gKCkge1xuICAgIFxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIC8vIERlbGVnYXRlIHRoZSB0b3VjaCBoYW5kbGVycyB0byB0aGUgd2lkZ2V0J3MgZWxlbWVudFxuICAgIHNlbGYuZWxlbWVudC5iaW5kKHtcbiAgICAgIHRvdWNoc3RhcnQ6ICQucHJveHkoc2VsZiwgJ190b3VjaFN0YXJ0JyksXG4gICAgICB0b3VjaG1vdmU6ICQucHJveHkoc2VsZiwgJ190b3VjaE1vdmUnKSxcbiAgICAgIHRvdWNoZW5kOiAkLnByb3h5KHNlbGYsICdfdG91Y2hFbmQnKVxuICAgIH0pO1xuXG4gICAgLy8gQ2FsbCB0aGUgb3JpZ2luYWwgJC51aS5tb3VzZSBpbml0IG1ldGhvZFxuICAgIF9tb3VzZUluaXQuY2FsbChzZWxmKTtcbiAgfTtcblxuICAvKipcbiAgICogUmVtb3ZlIHRoZSB0b3VjaCBldmVudCBoYW5kbGVyc1xuICAgKi9cbiAgbW91c2VQcm90by5fbW91c2VEZXN0cm95ID0gZnVuY3Rpb24gKCkge1xuICAgIFxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIC8vIERlbGVnYXRlIHRoZSB0b3VjaCBoYW5kbGVycyB0byB0aGUgd2lkZ2V0J3MgZWxlbWVudFxuICAgIHNlbGYuZWxlbWVudC51bmJpbmQoe1xuICAgICAgdG91Y2hzdGFydDogJC5wcm94eShzZWxmLCAnX3RvdWNoU3RhcnQnKSxcbiAgICAgIHRvdWNobW92ZTogJC5wcm94eShzZWxmLCAnX3RvdWNoTW92ZScpLFxuICAgICAgdG91Y2hlbmQ6ICQucHJveHkoc2VsZiwgJ190b3VjaEVuZCcpXG4gICAgfSk7XG5cbiAgICAvLyBDYWxsIHRoZSBvcmlnaW5hbCAkLnVpLm1vdXNlIGRlc3Ryb3kgbWV0aG9kXG4gICAgX21vdXNlRGVzdHJveS5jYWxsKHNlbGYpO1xuICB9O1xuXG59KShqUXVlcnkpOyIsIi8qIVxuICogalF1ZXJ5IFVJIERyb3BwYWJsZSAxLjEyLjFcbiAqIGh0dHA6Ly9qcXVlcnl1aS5jb21cbiAqXG4gKiBDb3B5cmlnaHQgalF1ZXJ5IEZvdW5kYXRpb24gYW5kIG90aGVyIGNvbnRyaWJ1dG9yc1xuICogUmVsZWFzZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlLlxuICogaHR0cDovL2pxdWVyeS5vcmcvbGljZW5zZVxuICovXG5cbi8vPj5sYWJlbDogRHJvcHBhYmxlXG4vLz4+Z3JvdXA6IEludGVyYWN0aW9uc1xuLy8+PmRlc2NyaXB0aW9uOiBFbmFibGVzIGRyb3AgdGFyZ2V0cyBmb3IgZHJhZ2dhYmxlIGVsZW1lbnRzLlxuLy8+PmRvY3M6IGh0dHA6Ly9hcGkuanF1ZXJ5dWkuY29tL2Ryb3BwYWJsZS9cbi8vPj5kZW1vczogaHR0cDovL2pxdWVyeXVpLmNvbS9kcm9wcGFibGUvXG5cbiggZnVuY3Rpb24oIGZhY3RvcnkgKSB7XG5cdGlmICggdHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQgKSB7XG5cblx0XHQvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXG5cdFx0ZGVmaW5lKCBbXG5cdFx0XHRcImpxdWVyeVwiLFxuXHRcdFx0XCIuL2RyYWdnYWJsZVwiLFxuXHRcdFx0XCIuL21vdXNlXCIsXG5cdFx0XHRcIi4uL3ZlcnNpb25cIixcblx0XHRcdFwiLi4vd2lkZ2V0XCJcblx0XHRdLCBmYWN0b3J5ICk7XG5cdH0gZWxzZSB7XG5cblx0XHQvLyBCcm93c2VyIGdsb2JhbHNcblx0XHRmYWN0b3J5KCBqUXVlcnkgKTtcblx0fVxufSggZnVuY3Rpb24oICQgKSB7XG5cbiQud2lkZ2V0KCBcInVpLmRyb3BwYWJsZVwiLCB7XG5cdHZlcnNpb246IFwiMS4xMi4xXCIsXG5cdHdpZGdldEV2ZW50UHJlZml4OiBcImRyb3BcIixcblx0b3B0aW9uczoge1xuXHRcdGFjY2VwdDogXCIqXCIsXG5cdFx0YWRkQ2xhc3NlczogdHJ1ZSxcblx0XHRncmVlZHk6IGZhbHNlLFxuXHRcdHNjb3BlOiBcImRlZmF1bHRcIixcblx0XHR0b2xlcmFuY2U6IFwiaW50ZXJzZWN0XCIsXG5cblx0XHQvLyBDYWxsYmFja3Ncblx0XHRhY3RpdmF0ZTogbnVsbCxcblx0XHRkZWFjdGl2YXRlOiBudWxsLFxuXHRcdGRyb3A6IG51bGwsXG5cdFx0b3V0OiBudWxsLFxuXHRcdG92ZXI6IG51bGxcblx0fSxcblx0X2NyZWF0ZTogZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIgcHJvcG9ydGlvbnMsXG5cdFx0XHRvID0gdGhpcy5vcHRpb25zLFxuXHRcdFx0YWNjZXB0ID0gby5hY2NlcHQ7XG5cblx0XHR0aGlzLmlzb3ZlciA9IGZhbHNlO1xuXHRcdHRoaXMuaXNvdXQgPSB0cnVlO1xuXG5cdFx0dGhpcy5hY2NlcHQgPSAkLmlzRnVuY3Rpb24oIGFjY2VwdCApID8gYWNjZXB0IDogZnVuY3Rpb24oIGQgKSB7XG5cdFx0XHRyZXR1cm4gZC5pcyggYWNjZXB0ICk7XG5cdFx0fTtcblxuXHRcdHRoaXMucHJvcG9ydGlvbnMgPSBmdW5jdGlvbiggLyogdmFsdWVUb1dyaXRlICovICkge1xuXHRcdFx0aWYgKCBhcmd1bWVudHMubGVuZ3RoICkge1xuXG5cdFx0XHRcdC8vIFN0b3JlIHRoZSBkcm9wcGFibGUncyBwcm9wb3J0aW9uc1xuXHRcdFx0XHRwcm9wb3J0aW9ucyA9IGFyZ3VtZW50c1sgMCBdO1xuXHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHQvLyBSZXRyaWV2ZSBvciBkZXJpdmUgdGhlIGRyb3BwYWJsZSdzIHByb3BvcnRpb25zXG5cdFx0XHRcdHJldHVybiBwcm9wb3J0aW9ucyA/XG5cdFx0XHRcdFx0cHJvcG9ydGlvbnMgOlxuXHRcdFx0XHRcdHByb3BvcnRpb25zID0ge1xuXHRcdFx0XHRcdFx0d2lkdGg6IHRoaXMuZWxlbWVudFsgMCBdLm9mZnNldFdpZHRoLFxuXHRcdFx0XHRcdFx0aGVpZ2h0OiB0aGlzLmVsZW1lbnRbIDAgXS5vZmZzZXRIZWlnaHRcblx0XHRcdFx0XHR9O1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHR0aGlzLl9hZGRUb01hbmFnZXIoIG8uc2NvcGUgKTtcblxuXHRcdG8uYWRkQ2xhc3NlcyAmJiB0aGlzLl9hZGRDbGFzcyggXCJ1aS1kcm9wcGFibGVcIiApO1xuXG5cdH0sXG5cblx0X2FkZFRvTWFuYWdlcjogZnVuY3Rpb24oIHNjb3BlICkge1xuXG5cdFx0Ly8gQWRkIHRoZSByZWZlcmVuY2UgYW5kIHBvc2l0aW9ucyB0byB0aGUgbWFuYWdlclxuXHRcdCQudWkuZGRtYW5hZ2VyLmRyb3BwYWJsZXNbIHNjb3BlIF0gPSAkLnVpLmRkbWFuYWdlci5kcm9wcGFibGVzWyBzY29wZSBdIHx8IFtdO1xuXHRcdCQudWkuZGRtYW5hZ2VyLmRyb3BwYWJsZXNbIHNjb3BlIF0ucHVzaCggdGhpcyApO1xuXHR9LFxuXG5cdF9zcGxpY2U6IGZ1bmN0aW9uKCBkcm9wICkge1xuXHRcdHZhciBpID0gMDtcblx0XHRmb3IgKCA7IGkgPCBkcm9wLmxlbmd0aDsgaSsrICkge1xuXHRcdFx0aWYgKCBkcm9wWyBpIF0gPT09IHRoaXMgKSB7XG5cdFx0XHRcdGRyb3Auc3BsaWNlKCBpLCAxICk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXG5cdF9kZXN0cm95OiBmdW5jdGlvbigpIHtcblx0XHR2YXIgZHJvcCA9ICQudWkuZGRtYW5hZ2VyLmRyb3BwYWJsZXNbIHRoaXMub3B0aW9ucy5zY29wZSBdO1xuXG5cdFx0dGhpcy5fc3BsaWNlKCBkcm9wICk7XG5cdH0sXG5cblx0X3NldE9wdGlvbjogZnVuY3Rpb24oIGtleSwgdmFsdWUgKSB7XG5cblx0XHRpZiAoIGtleSA9PT0gXCJhY2NlcHRcIiApIHtcblx0XHRcdHRoaXMuYWNjZXB0ID0gJC5pc0Z1bmN0aW9uKCB2YWx1ZSApID8gdmFsdWUgOiBmdW5jdGlvbiggZCApIHtcblx0XHRcdFx0cmV0dXJuIGQuaXMoIHZhbHVlICk7XG5cdFx0XHR9O1xuXHRcdH0gZWxzZSBpZiAoIGtleSA9PT0gXCJzY29wZVwiICkge1xuXHRcdFx0dmFyIGRyb3AgPSAkLnVpLmRkbWFuYWdlci5kcm9wcGFibGVzWyB0aGlzLm9wdGlvbnMuc2NvcGUgXTtcblxuXHRcdFx0dGhpcy5fc3BsaWNlKCBkcm9wICk7XG5cdFx0XHR0aGlzLl9hZGRUb01hbmFnZXIoIHZhbHVlICk7XG5cdFx0fVxuXG5cdFx0dGhpcy5fc3VwZXIoIGtleSwgdmFsdWUgKTtcblx0fSxcblxuXHRfYWN0aXZhdGU6IGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHR2YXIgZHJhZ2dhYmxlID0gJC51aS5kZG1hbmFnZXIuY3VycmVudDtcblxuXHRcdHRoaXMuX2FkZEFjdGl2ZUNsYXNzKCk7XG5cdFx0aWYgKCBkcmFnZ2FibGUgKSB7XG5cdFx0XHR0aGlzLl90cmlnZ2VyKCBcImFjdGl2YXRlXCIsIGV2ZW50LCB0aGlzLnVpKCBkcmFnZ2FibGUgKSApO1xuXHRcdH1cblx0fSxcblxuXHRfZGVhY3RpdmF0ZTogZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdHZhciBkcmFnZ2FibGUgPSAkLnVpLmRkbWFuYWdlci5jdXJyZW50O1xuXG5cdFx0dGhpcy5fcmVtb3ZlQWN0aXZlQ2xhc3MoKTtcblx0XHRpZiAoIGRyYWdnYWJsZSApIHtcblx0XHRcdHRoaXMuX3RyaWdnZXIoIFwiZGVhY3RpdmF0ZVwiLCBldmVudCwgdGhpcy51aSggZHJhZ2dhYmxlICkgKTtcblx0XHR9XG5cdH0sXG5cblx0X292ZXI6IGZ1bmN0aW9uKCBldmVudCApIHtcblxuXHRcdHZhciBkcmFnZ2FibGUgPSAkLnVpLmRkbWFuYWdlci5jdXJyZW50O1xuXG5cdFx0Ly8gQmFpbCBpZiBkcmFnZ2FibGUgYW5kIGRyb3BwYWJsZSBhcmUgc2FtZSBlbGVtZW50XG5cdFx0aWYgKCAhZHJhZ2dhYmxlIHx8ICggZHJhZ2dhYmxlLmN1cnJlbnRJdGVtIHx8XG5cdFx0XHRcdGRyYWdnYWJsZS5lbGVtZW50IClbIDAgXSA9PT0gdGhpcy5lbGVtZW50WyAwIF0gKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0aWYgKCB0aGlzLmFjY2VwdC5jYWxsKCB0aGlzLmVsZW1lbnRbIDAgXSwgKCBkcmFnZ2FibGUuY3VycmVudEl0ZW0gfHxcblx0XHRcdFx0ZHJhZ2dhYmxlLmVsZW1lbnQgKSApICkge1xuXHRcdFx0dGhpcy5fYWRkSG92ZXJDbGFzcygpO1xuXHRcdFx0dGhpcy5fdHJpZ2dlciggXCJvdmVyXCIsIGV2ZW50LCB0aGlzLnVpKCBkcmFnZ2FibGUgKSApO1xuXHRcdH1cblxuXHR9LFxuXG5cdF9vdXQ6IGZ1bmN0aW9uKCBldmVudCApIHtcblxuXHRcdHZhciBkcmFnZ2FibGUgPSAkLnVpLmRkbWFuYWdlci5jdXJyZW50O1xuXG5cdFx0Ly8gQmFpbCBpZiBkcmFnZ2FibGUgYW5kIGRyb3BwYWJsZSBhcmUgc2FtZSBlbGVtZW50XG5cdFx0aWYgKCAhZHJhZ2dhYmxlIHx8ICggZHJhZ2dhYmxlLmN1cnJlbnRJdGVtIHx8XG5cdFx0XHRcdGRyYWdnYWJsZS5lbGVtZW50IClbIDAgXSA9PT0gdGhpcy5lbGVtZW50WyAwIF0gKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0aWYgKCB0aGlzLmFjY2VwdC5jYWxsKCB0aGlzLmVsZW1lbnRbIDAgXSwgKCBkcmFnZ2FibGUuY3VycmVudEl0ZW0gfHxcblx0XHRcdFx0ZHJhZ2dhYmxlLmVsZW1lbnQgKSApICkge1xuXHRcdFx0dGhpcy5fcmVtb3ZlSG92ZXJDbGFzcygpO1xuXHRcdFx0dGhpcy5fdHJpZ2dlciggXCJvdXRcIiwgZXZlbnQsIHRoaXMudWkoIGRyYWdnYWJsZSApICk7XG5cdFx0fVxuXG5cdH0sXG5cblx0X2Ryb3A6IGZ1bmN0aW9uKCBldmVudCwgY3VzdG9tICkge1xuXG5cdFx0dmFyIGRyYWdnYWJsZSA9IGN1c3RvbSB8fCAkLnVpLmRkbWFuYWdlci5jdXJyZW50LFxuXHRcdFx0Y2hpbGRyZW5JbnRlcnNlY3Rpb24gPSBmYWxzZTtcblxuXHRcdC8vIEJhaWwgaWYgZHJhZ2dhYmxlIGFuZCBkcm9wcGFibGUgYXJlIHNhbWUgZWxlbWVudFxuXHRcdGlmICggIWRyYWdnYWJsZSB8fCAoIGRyYWdnYWJsZS5jdXJyZW50SXRlbSB8fFxuXHRcdFx0XHRkcmFnZ2FibGUuZWxlbWVudCApWyAwIF0gPT09IHRoaXMuZWxlbWVudFsgMCBdICkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdHRoaXMuZWxlbWVudFxuXHRcdFx0LmZpbmQoIFwiOmRhdGEodWktZHJvcHBhYmxlKVwiIClcblx0XHRcdC5ub3QoIFwiLnVpLWRyYWdnYWJsZS1kcmFnZ2luZ1wiIClcblx0XHRcdC5lYWNoKCBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIGluc3QgPSAkKCB0aGlzICkuZHJvcHBhYmxlKCBcImluc3RhbmNlXCIgKTtcblx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdGluc3Qub3B0aW9ucy5ncmVlZHkgJiZcblx0XHRcdFx0XHQhaW5zdC5vcHRpb25zLmRpc2FibGVkICYmXG5cdFx0XHRcdFx0aW5zdC5vcHRpb25zLnNjb3BlID09PSBkcmFnZ2FibGUub3B0aW9ucy5zY29wZSAmJlxuXHRcdFx0XHRcdGluc3QuYWNjZXB0LmNhbGwoXG5cdFx0XHRcdFx0XHRpbnN0LmVsZW1lbnRbIDAgXSwgKCBkcmFnZ2FibGUuY3VycmVudEl0ZW0gfHwgZHJhZ2dhYmxlLmVsZW1lbnQgKVxuXHRcdFx0XHRcdCkgJiZcblx0XHRcdFx0XHRpbnRlcnNlY3QoXG5cdFx0XHRcdFx0XHRkcmFnZ2FibGUsXG5cdFx0XHRcdFx0XHQkLmV4dGVuZCggaW5zdCwgeyBvZmZzZXQ6IGluc3QuZWxlbWVudC5vZmZzZXQoKSB9ICksXG5cdFx0XHRcdFx0XHRpbnN0Lm9wdGlvbnMudG9sZXJhbmNlLCBldmVudFxuXHRcdFx0XHRcdClcblx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0Y2hpbGRyZW5JbnRlcnNlY3Rpb24gPSB0cnVlO1xuXHRcdFx0XHRcdHJldHVybiBmYWxzZTsgfVxuXHRcdFx0fSApO1xuXHRcdGlmICggY2hpbGRyZW5JbnRlcnNlY3Rpb24gKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0aWYgKCB0aGlzLmFjY2VwdC5jYWxsKCB0aGlzLmVsZW1lbnRbIDAgXSxcblx0XHRcdFx0KCBkcmFnZ2FibGUuY3VycmVudEl0ZW0gfHwgZHJhZ2dhYmxlLmVsZW1lbnQgKSApICkge1xuXHRcdFx0dGhpcy5fcmVtb3ZlQWN0aXZlQ2xhc3MoKTtcblx0XHRcdHRoaXMuX3JlbW92ZUhvdmVyQ2xhc3MoKTtcblxuXHRcdFx0dGhpcy5fdHJpZ2dlciggXCJkcm9wXCIsIGV2ZW50LCB0aGlzLnVpKCBkcmFnZ2FibGUgKSApO1xuXHRcdFx0cmV0dXJuIHRoaXMuZWxlbWVudDtcblx0XHR9XG5cblx0XHRyZXR1cm4gZmFsc2U7XG5cblx0fSxcblxuXHR1aTogZnVuY3Rpb24oIGMgKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGRyYWdnYWJsZTogKCBjLmN1cnJlbnRJdGVtIHx8IGMuZWxlbWVudCApLFxuXHRcdFx0aGVscGVyOiBjLmhlbHBlcixcblx0XHRcdHBvc2l0aW9uOiBjLnBvc2l0aW9uLFxuXHRcdFx0b2Zmc2V0OiBjLnBvc2l0aW9uQWJzXG5cdFx0fTtcblx0fSxcblxuXHQvLyBFeHRlbnNpb24gcG9pbnRzIGp1c3QgdG8gbWFrZSBiYWNrY29tcGF0IHNhbmUgYW5kIGF2b2lkIGR1cGxpY2F0aW5nIGxvZ2ljXG5cdC8vIFRPRE86IFJlbW92ZSBpbiAxLjEzIGFsb25nIHdpdGggY2FsbCB0byBpdCBiZWxvd1xuXHRfYWRkSG92ZXJDbGFzczogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5fYWRkQ2xhc3MoIFwidWktZHJvcHBhYmxlLWhvdmVyXCIgKTtcblx0fSxcblxuXHRfcmVtb3ZlSG92ZXJDbGFzczogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5fcmVtb3ZlQ2xhc3MoIFwidWktZHJvcHBhYmxlLWhvdmVyXCIgKTtcblx0fSxcblxuXHRfYWRkQWN0aXZlQ2xhc3M6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuX2FkZENsYXNzKCBcInVpLWRyb3BwYWJsZS1hY3RpdmVcIiApO1xuXHR9LFxuXG5cdF9yZW1vdmVBY3RpdmVDbGFzczogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5fcmVtb3ZlQ2xhc3MoIFwidWktZHJvcHBhYmxlLWFjdGl2ZVwiICk7XG5cdH1cbn0gKTtcblxudmFyIGludGVyc2VjdCA9ICQudWkuaW50ZXJzZWN0ID0gKCBmdW5jdGlvbigpIHtcblx0ZnVuY3Rpb24gaXNPdmVyQXhpcyggeCwgcmVmZXJlbmNlLCBzaXplICkge1xuXHRcdHJldHVybiAoIHggPj0gcmVmZXJlbmNlICkgJiYgKCB4IDwgKCByZWZlcmVuY2UgKyBzaXplICkgKTtcblx0fVxuXG5cdHJldHVybiBmdW5jdGlvbiggZHJhZ2dhYmxlLCBkcm9wcGFibGUsIHRvbGVyYW5jZU1vZGUsIGV2ZW50ICkge1xuXG5cdFx0aWYgKCAhZHJvcHBhYmxlLm9mZnNldCApIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHR2YXIgeDEgPSAoIGRyYWdnYWJsZS5wb3NpdGlvbkFicyB8fFxuXHRcdFx0XHRkcmFnZ2FibGUucG9zaXRpb24uYWJzb2x1dGUgKS5sZWZ0ICsgZHJhZ2dhYmxlLm1hcmdpbnMubGVmdCxcblx0XHRcdHkxID0gKCBkcmFnZ2FibGUucG9zaXRpb25BYnMgfHxcblx0XHRcdFx0ZHJhZ2dhYmxlLnBvc2l0aW9uLmFic29sdXRlICkudG9wICsgZHJhZ2dhYmxlLm1hcmdpbnMudG9wLFxuXHRcdFx0eDIgPSB4MSArIGRyYWdnYWJsZS5oZWxwZXJQcm9wb3J0aW9ucy53aWR0aCxcblx0XHRcdHkyID0geTEgKyBkcmFnZ2FibGUuaGVscGVyUHJvcG9ydGlvbnMuaGVpZ2h0LFxuXHRcdFx0bCA9IGRyb3BwYWJsZS5vZmZzZXQubGVmdCxcblx0XHRcdHQgPSBkcm9wcGFibGUub2Zmc2V0LnRvcCxcblx0XHRcdHIgPSBsICsgZHJvcHBhYmxlLnByb3BvcnRpb25zKCkud2lkdGgsXG5cdFx0XHRiID0gdCArIGRyb3BwYWJsZS5wcm9wb3J0aW9ucygpLmhlaWdodDtcblxuXHRcdHN3aXRjaCAoIHRvbGVyYW5jZU1vZGUgKSB7XG5cdFx0Y2FzZSBcImZpdFwiOlxuXHRcdFx0cmV0dXJuICggbCA8PSB4MSAmJiB4MiA8PSByICYmIHQgPD0geTEgJiYgeTIgPD0gYiApO1xuXHRcdGNhc2UgXCJpbnRlcnNlY3RcIjpcblx0XHRcdHJldHVybiAoIGwgPCB4MSArICggZHJhZ2dhYmxlLmhlbHBlclByb3BvcnRpb25zLndpZHRoIC8gMiApICYmIC8vIFJpZ2h0IEhhbGZcblx0XHRcdFx0eDIgLSAoIGRyYWdnYWJsZS5oZWxwZXJQcm9wb3J0aW9ucy53aWR0aCAvIDIgKSA8IHIgJiYgLy8gTGVmdCBIYWxmXG5cdFx0XHRcdHQgPCB5MSArICggZHJhZ2dhYmxlLmhlbHBlclByb3BvcnRpb25zLmhlaWdodCAvIDIgKSAmJiAvLyBCb3R0b20gSGFsZlxuXHRcdFx0XHR5MiAtICggZHJhZ2dhYmxlLmhlbHBlclByb3BvcnRpb25zLmhlaWdodCAvIDIgKSA8IGIgKTsgLy8gVG9wIEhhbGZcblx0XHRjYXNlIFwicG9pbnRlclwiOlxuXHRcdFx0cmV0dXJuIGlzT3ZlckF4aXMoIGV2ZW50LnBhZ2VZLCB0LCBkcm9wcGFibGUucHJvcG9ydGlvbnMoKS5oZWlnaHQgKSAmJlxuXHRcdFx0XHRpc092ZXJBeGlzKCBldmVudC5wYWdlWCwgbCwgZHJvcHBhYmxlLnByb3BvcnRpb25zKCkud2lkdGggKTtcblx0XHRjYXNlIFwidG91Y2hcIjpcblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdCggeTEgPj0gdCAmJiB5MSA8PSBiICkgfHwgLy8gVG9wIGVkZ2UgdG91Y2hpbmdcblx0XHRcdFx0KCB5MiA+PSB0ICYmIHkyIDw9IGIgKSB8fCAvLyBCb3R0b20gZWRnZSB0b3VjaGluZ1xuXHRcdFx0XHQoIHkxIDwgdCAmJiB5MiA+IGIgKSAvLyBTdXJyb3VuZGVkIHZlcnRpY2FsbHlcblx0XHRcdCkgJiYgKFxuXHRcdFx0XHQoIHgxID49IGwgJiYgeDEgPD0gciApIHx8IC8vIExlZnQgZWRnZSB0b3VjaGluZ1xuXHRcdFx0XHQoIHgyID49IGwgJiYgeDIgPD0gciApIHx8IC8vIFJpZ2h0IGVkZ2UgdG91Y2hpbmdcblx0XHRcdFx0KCB4MSA8IGwgJiYgeDIgPiByICkgLy8gU3Vycm91bmRlZCBob3Jpem9udGFsbHlcblx0XHRcdCk7XG5cdFx0ZGVmYXVsdDpcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdH07XG59ICkoKTtcblxuLypcblx0VGhpcyBtYW5hZ2VyIHRyYWNrcyBvZmZzZXRzIG9mIGRyYWdnYWJsZXMgYW5kIGRyb3BwYWJsZXNcbiovXG4kLnVpLmRkbWFuYWdlciA9IHtcblx0Y3VycmVudDogbnVsbCxcblx0ZHJvcHBhYmxlczogeyBcImRlZmF1bHRcIjogW10gfSxcblx0cHJlcGFyZU9mZnNldHM6IGZ1bmN0aW9uKCB0LCBldmVudCApIHtcblxuXHRcdHZhciBpLCBqLFxuXHRcdFx0bSA9ICQudWkuZGRtYW5hZ2VyLmRyb3BwYWJsZXNbIHQub3B0aW9ucy5zY29wZSBdIHx8IFtdLFxuXHRcdFx0dHlwZSA9IGV2ZW50ID8gZXZlbnQudHlwZSA6IG51bGwsIC8vIHdvcmthcm91bmQgZm9yICMyMzE3XG5cdFx0XHRsaXN0ID0gKCB0LmN1cnJlbnRJdGVtIHx8IHQuZWxlbWVudCApLmZpbmQoIFwiOmRhdGEodWktZHJvcHBhYmxlKVwiICkuYWRkQmFjaygpO1xuXG5cdFx0ZHJvcHBhYmxlc0xvb3A6IGZvciAoIGkgPSAwOyBpIDwgbS5sZW5ndGg7IGkrKyApIHtcblxuXHRcdFx0Ly8gTm8gZGlzYWJsZWQgYW5kIG5vbi1hY2NlcHRlZFxuXHRcdFx0aWYgKCBtWyBpIF0ub3B0aW9ucy5kaXNhYmxlZCB8fCAoIHQgJiYgIW1bIGkgXS5hY2NlcHQuY2FsbCggbVsgaSBdLmVsZW1lbnRbIDAgXSxcblx0XHRcdFx0XHQoIHQuY3VycmVudEl0ZW0gfHwgdC5lbGVtZW50ICkgKSApICkge1xuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gRmlsdGVyIG91dCBlbGVtZW50cyBpbiB0aGUgY3VycmVudCBkcmFnZ2VkIGl0ZW1cblx0XHRcdGZvciAoIGogPSAwOyBqIDwgbGlzdC5sZW5ndGg7IGorKyApIHtcblx0XHRcdFx0aWYgKCBsaXN0WyBqIF0gPT09IG1bIGkgXS5lbGVtZW50WyAwIF0gKSB7XG5cdFx0XHRcdFx0bVsgaSBdLnByb3BvcnRpb25zKCkuaGVpZ2h0ID0gMDtcblx0XHRcdFx0XHRjb250aW51ZSBkcm9wcGFibGVzTG9vcDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRtWyBpIF0udmlzaWJsZSA9IG1bIGkgXS5lbGVtZW50LmNzcyggXCJkaXNwbGF5XCIgKSAhPT0gXCJub25lXCI7XG5cdFx0XHRpZiAoICFtWyBpIF0udmlzaWJsZSApIHtcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cblx0XHRcdC8vIEFjdGl2YXRlIHRoZSBkcm9wcGFibGUgaWYgdXNlZCBkaXJlY3RseSBmcm9tIGRyYWdnYWJsZXNcblx0XHRcdGlmICggdHlwZSA9PT0gXCJtb3VzZWRvd25cIiApIHtcblx0XHRcdFx0bVsgaSBdLl9hY3RpdmF0ZS5jYWxsKCBtWyBpIF0sIGV2ZW50ICk7XG5cdFx0XHR9XG5cblx0XHRcdG1bIGkgXS5vZmZzZXQgPSBtWyBpIF0uZWxlbWVudC5vZmZzZXQoKTtcblx0XHRcdG1bIGkgXS5wcm9wb3J0aW9ucygge1xuXHRcdFx0XHR3aWR0aDogbVsgaSBdLmVsZW1lbnRbIDAgXS5vZmZzZXRXaWR0aCxcblx0XHRcdFx0aGVpZ2h0OiBtWyBpIF0uZWxlbWVudFsgMCBdLm9mZnNldEhlaWdodFxuXHRcdFx0fSApO1xuXG5cdFx0fVxuXG5cdH0sXG5cdGRyb3A6IGZ1bmN0aW9uKCBkcmFnZ2FibGUsIGV2ZW50ICkge1xuXG5cdFx0dmFyIGRyb3BwZWQgPSBmYWxzZTtcblxuXHRcdC8vIENyZWF0ZSBhIGNvcHkgb2YgdGhlIGRyb3BwYWJsZXMgaW4gY2FzZSB0aGUgbGlzdCBjaGFuZ2VzIGR1cmluZyB0aGUgZHJvcCAoIzkxMTYpXG5cdFx0JC5lYWNoKCAoICQudWkuZGRtYW5hZ2VyLmRyb3BwYWJsZXNbIGRyYWdnYWJsZS5vcHRpb25zLnNjb3BlIF0gfHwgW10gKS5zbGljZSgpLCBmdW5jdGlvbigpIHtcblxuXHRcdFx0aWYgKCAhdGhpcy5vcHRpb25zICkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRpZiAoICF0aGlzLm9wdGlvbnMuZGlzYWJsZWQgJiYgdGhpcy52aXNpYmxlICYmXG5cdFx0XHRcdFx0aW50ZXJzZWN0KCBkcmFnZ2FibGUsIHRoaXMsIHRoaXMub3B0aW9ucy50b2xlcmFuY2UsIGV2ZW50ICkgKSB7XG5cdFx0XHRcdGRyb3BwZWQgPSB0aGlzLl9kcm9wLmNhbGwoIHRoaXMsIGV2ZW50ICkgfHwgZHJvcHBlZDtcblx0XHRcdH1cblxuXHRcdFx0aWYgKCAhdGhpcy5vcHRpb25zLmRpc2FibGVkICYmIHRoaXMudmlzaWJsZSAmJiB0aGlzLmFjY2VwdC5jYWxsKCB0aGlzLmVsZW1lbnRbIDAgXSxcblx0XHRcdFx0XHQoIGRyYWdnYWJsZS5jdXJyZW50SXRlbSB8fCBkcmFnZ2FibGUuZWxlbWVudCApICkgKSB7XG5cdFx0XHRcdHRoaXMuaXNvdXQgPSB0cnVlO1xuXHRcdFx0XHR0aGlzLmlzb3ZlciA9IGZhbHNlO1xuXHRcdFx0XHR0aGlzLl9kZWFjdGl2YXRlLmNhbGwoIHRoaXMsIGV2ZW50ICk7XG5cdFx0XHR9XG5cblx0XHR9ICk7XG5cdFx0cmV0dXJuIGRyb3BwZWQ7XG5cblx0fSxcblx0ZHJhZ1N0YXJ0OiBmdW5jdGlvbiggZHJhZ2dhYmxlLCBldmVudCApIHtcblxuXHRcdC8vIExpc3RlbiBmb3Igc2Nyb2xsaW5nIHNvIHRoYXQgaWYgdGhlIGRyYWdnaW5nIGNhdXNlcyBzY3JvbGxpbmcgdGhlIHBvc2l0aW9uIG9mIHRoZVxuXHRcdC8vIGRyb3BwYWJsZXMgY2FuIGJlIHJlY2FsY3VsYXRlZCAoc2VlICM1MDAzKVxuXHRcdGRyYWdnYWJsZS5lbGVtZW50LnBhcmVudHNVbnRpbCggXCJib2R5XCIgKS5vbiggXCJzY3JvbGwuZHJvcHBhYmxlXCIsIGZ1bmN0aW9uKCkge1xuXHRcdFx0aWYgKCAhZHJhZ2dhYmxlLm9wdGlvbnMucmVmcmVzaFBvc2l0aW9ucyApIHtcblx0XHRcdFx0JC51aS5kZG1hbmFnZXIucHJlcGFyZU9mZnNldHMoIGRyYWdnYWJsZSwgZXZlbnQgKTtcblx0XHRcdH1cblx0XHR9ICk7XG5cdH0sXG5cdGRyYWc6IGZ1bmN0aW9uKCBkcmFnZ2FibGUsIGV2ZW50ICkge1xuXG5cdFx0Ly8gSWYgeW91IGhhdmUgYSBoaWdobHkgZHluYW1pYyBwYWdlLCB5b3UgbWlnaHQgdHJ5IHRoaXMgb3B0aW9uLiBJdCByZW5kZXJzIHBvc2l0aW9uc1xuXHRcdC8vIGV2ZXJ5IHRpbWUgeW91IG1vdmUgdGhlIG1vdXNlLlxuXHRcdGlmICggZHJhZ2dhYmxlLm9wdGlvbnMucmVmcmVzaFBvc2l0aW9ucyApIHtcblx0XHRcdCQudWkuZGRtYW5hZ2VyLnByZXBhcmVPZmZzZXRzKCBkcmFnZ2FibGUsIGV2ZW50ICk7XG5cdFx0fVxuXG5cdFx0Ly8gUnVuIHRocm91Z2ggYWxsIGRyb3BwYWJsZXMgYW5kIGNoZWNrIHRoZWlyIHBvc2l0aW9ucyBiYXNlZCBvbiBzcGVjaWZpYyB0b2xlcmFuY2Ugb3B0aW9uc1xuXHRcdCQuZWFjaCggJC51aS5kZG1hbmFnZXIuZHJvcHBhYmxlc1sgZHJhZ2dhYmxlLm9wdGlvbnMuc2NvcGUgXSB8fCBbXSwgZnVuY3Rpb24oKSB7XG5cblx0XHRcdGlmICggdGhpcy5vcHRpb25zLmRpc2FibGVkIHx8IHRoaXMuZ3JlZWR5Q2hpbGQgfHwgIXRoaXMudmlzaWJsZSApIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgcGFyZW50SW5zdGFuY2UsIHNjb3BlLCBwYXJlbnQsXG5cdFx0XHRcdGludGVyc2VjdHMgPSBpbnRlcnNlY3QoIGRyYWdnYWJsZSwgdGhpcywgdGhpcy5vcHRpb25zLnRvbGVyYW5jZSwgZXZlbnQgKSxcblx0XHRcdFx0YyA9ICFpbnRlcnNlY3RzICYmIHRoaXMuaXNvdmVyID9cblx0XHRcdFx0XHRcImlzb3V0XCIgOlxuXHRcdFx0XHRcdCggaW50ZXJzZWN0cyAmJiAhdGhpcy5pc292ZXIgPyBcImlzb3ZlclwiIDogbnVsbCApO1xuXHRcdFx0aWYgKCAhYyApIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIHRoaXMub3B0aW9ucy5ncmVlZHkgKSB7XG5cblx0XHRcdFx0Ly8gZmluZCBkcm9wcGFibGUgcGFyZW50cyB3aXRoIHNhbWUgc2NvcGVcblx0XHRcdFx0c2NvcGUgPSB0aGlzLm9wdGlvbnMuc2NvcGU7XG5cdFx0XHRcdHBhcmVudCA9IHRoaXMuZWxlbWVudC5wYXJlbnRzKCBcIjpkYXRhKHVpLWRyb3BwYWJsZSlcIiApLmZpbHRlciggZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0cmV0dXJuICQoIHRoaXMgKS5kcm9wcGFibGUoIFwiaW5zdGFuY2VcIiApLm9wdGlvbnMuc2NvcGUgPT09IHNjb3BlO1xuXHRcdFx0XHR9ICk7XG5cblx0XHRcdFx0aWYgKCBwYXJlbnQubGVuZ3RoICkge1xuXHRcdFx0XHRcdHBhcmVudEluc3RhbmNlID0gJCggcGFyZW50WyAwIF0gKS5kcm9wcGFibGUoIFwiaW5zdGFuY2VcIiApO1xuXHRcdFx0XHRcdHBhcmVudEluc3RhbmNlLmdyZWVkeUNoaWxkID0gKCBjID09PSBcImlzb3ZlclwiICk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0Ly8gV2UganVzdCBtb3ZlZCBpbnRvIGEgZ3JlZWR5IGNoaWxkXG5cdFx0XHRpZiAoIHBhcmVudEluc3RhbmNlICYmIGMgPT09IFwiaXNvdmVyXCIgKSB7XG5cdFx0XHRcdHBhcmVudEluc3RhbmNlLmlzb3ZlciA9IGZhbHNlO1xuXHRcdFx0XHRwYXJlbnRJbnN0YW5jZS5pc291dCA9IHRydWU7XG5cdFx0XHRcdHBhcmVudEluc3RhbmNlLl9vdXQuY2FsbCggcGFyZW50SW5zdGFuY2UsIGV2ZW50ICk7XG5cdFx0XHR9XG5cblx0XHRcdHRoaXNbIGMgXSA9IHRydWU7XG5cdFx0XHR0aGlzWyBjID09PSBcImlzb3V0XCIgPyBcImlzb3ZlclwiIDogXCJpc291dFwiIF0gPSBmYWxzZTtcblx0XHRcdHRoaXNbIGMgPT09IFwiaXNvdmVyXCIgPyBcIl9vdmVyXCIgOiBcIl9vdXRcIiBdLmNhbGwoIHRoaXMsIGV2ZW50ICk7XG5cblx0XHRcdC8vIFdlIGp1c3QgbW92ZWQgb3V0IG9mIGEgZ3JlZWR5IGNoaWxkXG5cdFx0XHRpZiAoIHBhcmVudEluc3RhbmNlICYmIGMgPT09IFwiaXNvdXRcIiApIHtcblx0XHRcdFx0cGFyZW50SW5zdGFuY2UuaXNvdXQgPSBmYWxzZTtcblx0XHRcdFx0cGFyZW50SW5zdGFuY2UuaXNvdmVyID0gdHJ1ZTtcblx0XHRcdFx0cGFyZW50SW5zdGFuY2UuX292ZXIuY2FsbCggcGFyZW50SW5zdGFuY2UsIGV2ZW50ICk7XG5cdFx0XHR9XG5cdFx0fSApO1xuXG5cdH0sXG5cdGRyYWdTdG9wOiBmdW5jdGlvbiggZHJhZ2dhYmxlLCBldmVudCApIHtcblx0XHRkcmFnZ2FibGUuZWxlbWVudC5wYXJlbnRzVW50aWwoIFwiYm9keVwiICkub2ZmKCBcInNjcm9sbC5kcm9wcGFibGVcIiApO1xuXG5cdFx0Ly8gQ2FsbCBwcmVwYXJlT2Zmc2V0cyBvbmUgZmluYWwgdGltZSBzaW5jZSBJRSBkb2VzIG5vdCBmaXJlIHJldHVybiBzY3JvbGwgZXZlbnRzIHdoZW5cblx0XHQvLyBvdmVyZmxvdyB3YXMgY2F1c2VkIGJ5IGRyYWcgKHNlZSAjNTAwMylcblx0XHRpZiAoICFkcmFnZ2FibGUub3B0aW9ucy5yZWZyZXNoUG9zaXRpb25zICkge1xuXHRcdFx0JC51aS5kZG1hbmFnZXIucHJlcGFyZU9mZnNldHMoIGRyYWdnYWJsZSwgZXZlbnQgKTtcblx0XHR9XG5cdH1cbn07XG5cbi8vIERFUFJFQ0FURURcbi8vIFRPRE86IHN3aXRjaCByZXR1cm4gYmFjayB0byB3aWRnZXQgZGVjbGFyYXRpb24gYXQgdG9wIG9mIGZpbGUgd2hlbiB0aGlzIGlzIHJlbW92ZWRcbmlmICggJC51aUJhY2tDb21wYXQgIT09IGZhbHNlICkge1xuXG5cdC8vIEJhY2tjb21wYXQgZm9yIGFjdGl2ZUNsYXNzIGFuZCBob3ZlckNsYXNzIG9wdGlvbnNcblx0JC53aWRnZXQoIFwidWkuZHJvcHBhYmxlXCIsICQudWkuZHJvcHBhYmxlLCB7XG5cdFx0b3B0aW9uczoge1xuXHRcdFx0aG92ZXJDbGFzczogZmFsc2UsXG5cdFx0XHRhY3RpdmVDbGFzczogZmFsc2Vcblx0XHR9LFxuXHRcdF9hZGRBY3RpdmVDbGFzczogZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGlzLl9zdXBlcigpO1xuXHRcdFx0aWYgKCB0aGlzLm9wdGlvbnMuYWN0aXZlQ2xhc3MgKSB7XG5cdFx0XHRcdHRoaXMuZWxlbWVudC5hZGRDbGFzcyggdGhpcy5vcHRpb25zLmFjdGl2ZUNsYXNzICk7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRfcmVtb3ZlQWN0aXZlQ2xhc3M6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy5fc3VwZXIoKTtcblx0XHRcdGlmICggdGhpcy5vcHRpb25zLmFjdGl2ZUNsYXNzICkge1xuXHRcdFx0XHR0aGlzLmVsZW1lbnQucmVtb3ZlQ2xhc3MoIHRoaXMub3B0aW9ucy5hY3RpdmVDbGFzcyApO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0X2FkZEhvdmVyQ2xhc3M6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy5fc3VwZXIoKTtcblx0XHRcdGlmICggdGhpcy5vcHRpb25zLmhvdmVyQ2xhc3MgKSB7XG5cdFx0XHRcdHRoaXMuZWxlbWVudC5hZGRDbGFzcyggdGhpcy5vcHRpb25zLmhvdmVyQ2xhc3MgKTtcblx0XHRcdH1cblx0XHR9LFxuXHRcdF9yZW1vdmVIb3ZlckNsYXNzOiBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMuX3N1cGVyKCk7XG5cdFx0XHRpZiAoIHRoaXMub3B0aW9ucy5ob3ZlckNsYXNzICkge1xuXHRcdFx0XHR0aGlzLmVsZW1lbnQucmVtb3ZlQ2xhc3MoIHRoaXMub3B0aW9ucy5ob3ZlckNsYXNzICk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9ICk7XG59XG5cbnJldHVybiAkLnVpLmRyb3BwYWJsZTtcblxufSApICk7XG4iXX0=
