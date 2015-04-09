/*
 * jQuery UI Autocomplete HTML Extension
 *
 * Copyright 2010, Scott González (http://scottgonzalez.com)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * http://github.com/scottgonzalez/jquery-ui-extensions
 */
(function( $ ) {

    var proto = $.ui.autocomplete.prototype,
        initSource = proto._initSource;

    function filter( array, term ) {
        var matcher = new RegExp( $.ui.autocomplete.escapeRegex(term), "i" );
        return $.grep( array, function(value) {
            return matcher.test( $( "<div>" ).html( value.label || value.value || value ).text() );
        });
    }

    $.extend( proto, {
        _initSource: function() {
            if ( this.options.html && $.isArray(this.options.source) ) {
                this.source = function( request, response ) {
                    response( filter( this.options.source, request.term ) );
                };
            } else {
                initSource.call( this );
            }
        },

        _renderItem: function( ul, item) {
            return $( "<li></li>" )
                .data( "item.autocomplete", item )
                .append( $( "<a></a>" )[ this.options.html ? "html" : "text" ]( item.label ) )
                .appendTo( ul );
        }
    });

})( jQuery );

var HEROCALCULATOR = (function (my) {

    ko.bindingHandlers.itemBuildTable = {
        init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var buildExplorer = ko.unwrap(valueAccessor()),
                $el = $(element);

            var pressedKeys = {};
            ko.utils.domData.set(element, 'pressedKeys', pressedKeys);
            
            var keyDownHandler = function(e) {
                var pressedKeys = ko.utils.domData.get(element, 'pressedKeys');
                pressedKeys[e.which] = true;
                ko.utils.domData.set(element, 'pressedKeys', pressedKeys);
            }
            ko.utils.domData.set(element, 'keyDownHandler', keyDownHandler);
            
            var keyUpHandler = function(e) {
                var pressedKeys = ko.utils.domData.get(element, 'pressedKeys');
                if ((pressedKeys[17] && pressedKeys[67]) || (pressedKeys[17] && pressedKeys[86])) { // ctrl + c
                    $hoveredRows = $(element).find('.hover-cursor:hover');
                    if ($hoveredRows.length == 1) {
                        if (pressedKeys[67]) {
                            buildExplorer.copyInventoryToClipBoard($("tr", $(element)).index($hoveredRows[0]));
                        }
                        else {
                            buildExplorer.pasteInventoryFromClipBoard($("tr", $(element)).index($hoveredRows[0]));
                        }
						$hoveredRows.fadeOut(50).fadeIn(50);
                    }
                }
                delete pressedKeys[e.which];
                ko.utils.domData.set(element, 'pressedKeys', pressedKeys);
            }
            ko.utils.domData.set(element, 'keyUpHandler', keyUpHandler);
            
            $(document).bind( "keydown", keyDownHandler );
            $(document).bind( "keyup", keyUpHandler );

            ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
                var keyDownHandler = ko.utils.domData.get(element, 'keyDownHandler');
                var keyUpHandler = ko.utils.domData.get(element, 'keyUpHandler');
                $(document).unbind( "keydown", keyDownHandler );
                $(document).unbind( "keyup", keyUpHandler );
            });
        }
    };

	ko.bindingHandlers.preventBubble = {
		init: function(element, valueAccessor) {
			var eventName = ko.utils.unwrapObservable(valueAccessor());
			ko.utils.registerEventHandler(element, eventName, function(event) {
			   event.cancelBubble = true;
			   if (event.stopPropagation) {
					event.stopPropagation();
			   }                
			});
		}        
	};

	ko.bindingHandlers.toggle = {
		init: function (element, valueAccessor) {
			var value = valueAccessor();
			ko.applyBindingsToNode(element, {
				click: function () {
					value(!value());
				}
			});
		}
	};

    ko.bindingHandlers.shopDockStyle = {
        init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var value = ko.utils.unwrapObservable(valueAccessor());
			if (bindingContext.$data.shopDock() && !bindingContext.$data.shopPopout()) {
				ko.applyBindingsToNode(element, { style: { height: (bindingContext.$data.windowHeight() - 52) + 'px', position: 'fixed', right: 0, top: '52px', 'overflow-y': 'auto' } });
			}
			else {
				ko.applyBindingsToNode(element, { style: { height: 'auto', position: 'relative', right: 'initial', top: 'initial', 'overflow-y': 'initial' } });
			}
        },
        update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var value = ko.utils.unwrapObservable(valueAccessor());
			if (bindingContext.$data.shopDock() && !bindingContext.$data.shopPopout()) {
				ko.applyBindingsToNode(element, { style: { height: (bindingContext.$data.windowHeight() - 52) + 'px', position: 'fixed', right: 0, top: '52px', 'overflow-y': 'auto' } });
			}
			else {
				ko.applyBindingsToNode(element, { style: { height: 'auto', position: 'relative', right: 'initial', top: 'initial', 'overflow-y': 'initial' } });
			}
        }
    };
	
    ko.bindingHandlers.logger = {
        update: function(element, valueAccessor, allBindings) {
            //store a counter with this element
            var count = ko.utils.domData.get(element, "_ko_logger") || 0,
                data = ko.toJS(valueAccessor() || allBindings());

            ko.utils.domData.set(element, "_ko_logger", ++count);

            if (window.console && console.log) {
                console.log(count, element, data);
            }
        }
    };
    
    ko.bindingHandlers.tooltip = {
        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var $element, options, tooltip;
            options = ko.utils.unwrapObservable(valueAccessor());
            $element = $(element);

            // If the title is an observable, make it auto-updating.
            if (ko.isObservable(options.title)) {
                var isToolTipVisible = false;

                $element.on('show.bs.tooltip', function () {
                    isToolTipVisible = true;
                });
                $element.on('hide.bs.tooltip', function () {
                    isToolTipVisible = false;
                });

                // "true" is the bootstrap default.
                var origAnimation = options.animation || true;
                options.title.subscribe(function () {
                    if (isToolTipVisible) {
                        $element.data('bs.tooltip').options.animation = false; // temporarily disable animation to avoid flickering of the tooltip
                        $element.tooltip('fixTitle') // call this method to update the title
                            .tooltip('show');
                        $element.data('bs.tooltip').options.animation = origAnimation;
                    }
                });
            }

            tooltip = $element.data('bs.tooltip');
            if (tooltip) {
                $.extend(tooltip.options, options);
            } else {
                $element.tooltip(options);
            }
        }
    };
	
    ko.bindingHandlers.popover = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var $element = $(element);
            var popoverBindingValues = ko.utils.unwrapObservable(valueAccessor());
            var template = popoverBindingValues.template || false;
            var options = popoverBindingValues.options || {title: 'popover'};
            var data = popoverBindingValues.data || false;
            if (template !== false) {
                if (data) {
                    options.content = "<!-- ko template: { name: template, if: data, data: data } --><!-- /ko -->";
                }
                else {
                    options.content = $('#' + template).html();
                }
                options.html = true;
            }
            $element.on('shown.bs.popover', function(event) {

                var popoverData = $(event.target).data();
                var popoverEl = popoverData['bs.popover'].$tip;
                var options = popoverData['bs.popover'].options || {};
                var button = $(event.target);
                var buttonPosition = button.position();
                var buttonDimensions = {
                    x: button.outerWidth(),
                    y: button.outerHeight()
                };

                if (data) {
                    ko.applyBindingsToNode(popoverEl[0], { template: { name: template, data: data } }, bindingContext);
                    //ko.applyBindings({template: template, data: data}, popoverEl[0]);
                    //ko.renderTemplate(template, data, {}, popoverEl[0], 'replaceChildren');
                }
                else {
                    //ko.renderTemplate(template, data, {}, popoverEl[0], 'replaceChildren');
                    //ko.applyBindings(viewModel, popoverEl[0]);
                }

                var popoverDimensions = {
                    x: popoverEl.outerWidth(),
                    y: popoverEl.outerHeight()
                };

                popoverEl.find('button[data-dismiss="popover"]').click(function() {
                    button.popover('hide');
                });

                switch (options.placement) {
                    case 'right':
                        popoverEl.css({
                            left: buttonDimensions.x + buttonPosition.left,
                            top: (buttonDimensions.y / 2 + buttonPosition.top) - popoverDimensions.y / 2
                        });
                        break;
                    case 'left':
                        popoverEl.css({
                            left: buttonPosition.left - popoverDimensions.x,
                            top: (buttonDimensions.y / 2 + buttonPosition.top) - popoverDimensions.y / 2
                        });
                        break;
                    case 'top':
                        popoverEl.css({
                            left: buttonPosition.left + (buttonDimensions.x / 2 - popoverDimensions.x / 2),
                            top: buttonPosition.top - popoverDimensions.y
                        });
                        break;
                    case 'bottom':
                        popoverEl.css({
                            left: buttonPosition.left + (buttonDimensions.x / 2 - popoverDimensions.x / 2),
                            top: buttonPosition.top + buttonDimensions.y
                        });
                        break;
                }
            });

            $element.popover(options);

            return { controlsDescendantBindings: true };

        }
    };
    
	ko.bindingHandlers.chart = {
		init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
			var newCanvas = $('<canvas/>'),
				data = ko.utils.unwrapObservable(valueAccessor()),
				ctx = newCanvas[0].getContext("2d"),
				chartType = allBindingsAccessor().chartType,
				options = allBindingsAccessor().chartOptions || {};
				
			$(element).append(newCanvas);
			var myChart = new Chart(ctx)[chartType](data, options);
			ko.utils.domData.set(element, 'myChart', myChart);
			
            //handle disposal (if KO removes by the template binding)
            ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
                var myChart = ko.utils.domData.get(element, 'myChart');
                myChart.clear();
				myChart.destroy();
            });
		},
		update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
			var newCanvas = $('<canvas/>').width(730).height(365),
				data = ko.utils.unwrapObservable(valueAccessor()),
				ctx = newCanvas[0].getContext("2d"),
				chartType = allBindingsAccessor().chartType,
				options = allBindingsAccessor().chartOptions || {},
				myChart = ko.utils.domData.get(element, 'myChart');
			
            if (myChart) {
                myChart.clear();
                myChart.destroy();
            }
			bindingContext.$root.displayShop();
			bindingContext.$root.sideView();
			bindingContext.$root.shopDock();
			$(element).empty();
			$(element).append(newCanvas);
            if (data.datasets.length > 0) {
				myChart = new Chart(ctx)[chartType](data, options);
				ko.utils.domData.set(element, 'myChart', myChart);
            }
		}
	};

    ko.bindingHandlers.spinner = {
        init: function(element, valueAccessor, allBindingsAccessor) {
            //initialize datepicker with some optional options
            var options = allBindingsAccessor().spinnerOptions || {};
            $(element).spinner(options);

            //handle the field changing
            ko.utils.registerEventHandler(element, "spinchange", function () {
                var observable = valueAccessor();
                observable($(element).spinner("value"));
            });

            //handle disposal (if KO removes by the template binding)
            ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
                $(element).spinner("destroy");
            });

        },
        update: function(element, valueAccessor) {
            var value = ko.utils.unwrapObservable(valueAccessor()),
                current = $(element).spinner("value");

            if (value !== current) {
                $(element).spinner("value", value);
            }
        }
    };

    ko.bindingHandlers.secondTab = {
        update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var $root = bindingContext.$root,
                value = ko.utils.unwrapObservable(valueAccessor());
            ko.applyBindingsToNode(element, { css: {'second-tab': $root.isSecondTab(value) && $root.sideView()} });
        }
    };
    
    ko.bindingHandlers.hoverTabPopover = {
        update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var $root = bindingContext.$root,
                value = ko.utils.unwrapObservable(valueAccessor());
                
            ko.utils.registerEventHandler(element, "mouseover", function() {
                $root.showPopover(value);
            });  

            ko.utils.registerEventHandler(element, "mouseout", function() {
                $root.hidePopover(value);
            });      
        }
    };
    
    ko.bindingHandlers.hoverTab = {
        update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var $root = bindingContext.$root,
                value = ko.utils.unwrapObservable(valueAccessor());
                
            ko.utils.registerEventHandler(element, "mouseover", function() {
                $root.highlightTab(value);
            });  

            ko.utils.registerEventHandler(element, "mouseout", function() {
                $root.unhighlightTab(value);
            });      
        }
    };
    
    ko.bindingHandlers.hoverPaneStyle = {
        init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var $root = bindingContext.$root,
                value = ko.utils.unwrapObservable(valueAccessor());
            ko.applyBindingsToNode(element, { style: { opacity: !($root.sideView()) || $root.highlightedTab() == value || $root.highlightedTab() == '' ? 1 : .5 } });
        },
        update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var $root = bindingContext.$root,
                value = ko.utils.unwrapObservable(valueAccessor());
            ko.applyBindingsToNode(element, { style: { opacity: !($root.sideView()) || $root.highlightedTab() == value || $root.highlightedTab() == '' ? 1 : .5 } });
        }
    };
    
    ko.bindingHandlers.diffStyle = {
        init: function(element, valueAccessor, allBindingsAccessor, viewModel) {
            var value = ko.utils.unwrapObservable(valueAccessor());
            ko.applyBindingsToNode(element, { css: {'diffPos': value > 0, 'diffNeg': value < 0} });
        },
        update: function(element, valueAccessor, allBindingsAccessor, viewModel) {
            var value = ko.utils.unwrapObservable(valueAccessor());
            ko.applyBindingsToNode(element, { css: {'diffPos': value > 0, 'diffNeg': value < 0} });
        }
    };
    
    ko.bindingHandlers.diffCss = {
        init: function(element, valueAccessor, allBindingsAccessor, viewModel) {
            var value = ko.utils.unwrapObservable(valueAccessor()),
                stat = allBindingsAccessor().diffCssStat;
            if (stat == 'attackTime' || stat == 'bat') {
                value = -value;
            }
            ko.applyBindingsToNode(element, { css: {'diffPos': value > 0, 'diffNeg': value < 0} });
        },
        update: function(element, valueAccessor, allBindingsAccessor, viewModel) {
            var value = ko.utils.unwrapObservable(valueAccessor()),
                stat = allBindingsAccessor().diffCssStat;
            if (stat == 'attackTime' || stat == 'bat') {
                value = -value;
            }
            ko.applyBindingsToNode(element, { css: {'diffPos': value > 0, 'diffNeg': value < 0} });
        }
    };
    
    ko.bindingHandlers.jqAuto = {
        init: function(element, valueAccessor, allBindingsAccessor, viewModel) {
            var options = valueAccessor() || {},
                allBindings = allBindingsAccessor(),
                unwrap = ko.utils.unwrapObservable,
                modelValue = allBindings.jqAutoValue,
                source = allBindings.jqAutoSource,
                valueProp = allBindings.jqAutoSourceValue,
                inputValueProp = allBindings.jqAutoSourceInputValue || valueProp,
                labelProp = allBindings.jqAutoSourceLabel || valueProp;

            //function that is shared by both select and change event handlers
            function writeValueToModel(valueToWrite) {
                if (ko.isWriteableObservable(modelValue)) {
                   modelValue(valueToWrite );  
                } else {  //write to non-observable
                   if (allBindings['_ko_property_writers'] && allBindings['_ko_property_writers']['jqAutoValue'])
                            allBindings['_ko_property_writers']['jqAutoValue'](valueToWrite );    
                }
            }
            
            //on a selection write the proper value to the model
            options.select = function(event, ui) {
                writeValueToModel(ui.item ? ui.item.actualValue : null);
            };
                
            //on a change, make sure that it is a valid value or clear out the model value
            options.change = function(event, ui) {
                var currentValue = $(element).val();
                var matchingItem =  ko.utils.arrayFirst(unwrap(source), function(item) {
                   return unwrap(item[inputValueProp]) === currentValue;  
                });
                
                if (!matchingItem) {
                   writeValueToModel(null);
                }    
            }
            
            
            //handle the choices being updated in a DO, to decouple value updates from source (options) updates
            var mappedSource = ko.dependentObservable(function() {
                    mapped = ko.utils.arrayMap(unwrap(source), function(item) {
                        var result = {};
                        result.label = labelProp ? unwrap(item[labelProp]) : unwrap(item).toString();  //show in pop-up choices
                        result.value = inputValueProp ? unwrap(item[inputValueProp]) : unwrap(item).toString();  //show in input box
                        result.actualValue = valueProp ? unwrap(item[valueProp]) : item;  //store in model
                        return result;
                });
                return mapped;                
            });
            
            //whenever the items that make up the source are updated, make sure that autocomplete knows it
            mappedSource.subscribe(function(newValue) {
               $(element).autocomplete("option", "source", newValue); 
            });
            
            options.source = mappedSource();
            
			options.minLength = 1;
            //initialize autocomplete
            $(element).autocomplete(options);
        },
        update: function(element, valueAccessor, allBindingsAccessor, viewModel) {
           //update value based on a model change
           var allBindings = allBindingsAccessor(),
               unwrap = ko.utils.unwrapObservable,
               modelValue = unwrap(allBindings.jqAutoValue) || '', 
               valueProp = allBindings.jqAutoSourceValue,
               inputValueProp = allBindings.jqAutoSourceInputValue || valueProp;
            
           //if we are writing a different property to the input than we are writing to the model, then locate the object
           if (valueProp && inputValueProp !== valueProp) {
               var source = unwrap(allBindings.jqAutoSource) || [];
               var modelValue = ko.utils.arrayFirst(source, function(item) {
                     return unwrap(item[valueProp]) === modelValue;
               }) || {};  //probably don't need the || {}, but just protect against a bad value          
           } 

           //update the element with the value that should be shown in the input
           $(element).val(modelValue && inputValueProp !== valueProp ? unwrap(modelValue[inputValueProp]) : modelValue.toString());    
        }
    };

    ko.bindingHandlers.jqAutoCombo = {
        init: function(element, valueAccessor) {
           var autoEl = $("#" + valueAccessor());
           
            $(element).click(function() {
               // close if already visible
                if (autoEl.autocomplete("widget").is(":visible")) {
                    autoEl.autocomplete( "close" );
                    return;
                }

               //autoEl.blur();
                autoEl.autocomplete("search", " ");
                autoEl.focus(); 
                
            });
            
        }  
    }
    
    ko.extenders.numeric = function(target, precision) {
        //create a writeable computed observable to intercept writes to our observable
        var result = ko.computed({
            read: target,  //always return the original observables value
            write: function(newValue) {
                var current = target(),
                    roundingMultiplier = Math.pow(10, precision),
                    newValueAsNum = isNaN(newValue) ? 0 : parseFloat(+newValue),
                    valueToWrite = Math.round(newValueAsNum * roundingMultiplier) / roundingMultiplier;
     
                //only write if it changed
                if (valueToWrite !== current) {
                    target(valueToWrite);
                } else {
                    //if the rounded value is the same, but a different value was written, force a notification for the current field
                    if (newValue !== current) {
                        target.notifySubscribers(valueToWrite);
                    }
                }
            }
        }).extend({ notify: 'always' });
     
        //initialize with current value to make sure it is rounded appropriately
        result(target());
     
        //return the new computed observable
        return result;
    };
    
    return my;
}(HEROCALCULATOR));
var HEROCALCULATOR = (function (my) {

    my.Tab = function (id, href, data, text, color, template) {
        var self = this;
        self.id = id;
        self.href = href;
        self.color = color;
        self.data = data;
        self.data.id = ko.observable(self.href);
        self.text = text;
        self.template = template;
        return self;
    }
    
    my.TabGroup = function (hero, unit, clone) {
        var self = this;
        self.hero = hero;
        self.unit = unit;
        self.clone = clone;
        self.illusions = ko.observableArray([]);
        return self;
    }
    
    my.HeroCalculatorViewModel = function () {
        var self = this;
        self.heroes = [
            new my.HeroCalculatorModel(1),
            new my.HeroCalculatorModel(0),
            new my.HeroCalculatorModel(0),
            new my.HeroCalculatorModel(1)
        ];

        for (var i = 0; i < 4; i++) {
            self.heroes[i].enemy = ko.observable(self.heroes[i < 2 ? 2 : 0]);
            self.heroes[i].unit = ko.observable(new my.UnitViewModel(0, self.heroes[i]));
            self.heroes[i].unit().enemy = ko.observable(self.heroes[i < 2 ? 2 : 0]);
            self.heroes[i].clone = ko.observable(new my.CloneViewModel(0, self.heroes[i]));
            self.heroes[i].heroCompare = ko.observable(self.heroes[1 - (i % 2) + (i < 2 ? 0 : 2)]);
            self.heroes[i].unit().selectedUnit(self.heroes[i].unit().availableUnits()[0]);
            self.heroes[i].selectedHero(self.heroes[i].availableHeroes()[i < 2 ? 0 : 2]);
            self.heroes[i].illusions.subscribe(function (changes) {
                for (var i = 0; i < changes.length; i++) {
                    if (changes[i].status == 'added') {
                        var color = this.index < 2 ? '#5cb85c' : '#d9534f',
                            j = _.uniqueId();
                        self.tabs()[this.index].illusions.push(
                            new my.Tab(
                                'illusionTab' + this.index + '-' + j,
                                'illusionPane' + this.index + '-' + j,
                                self.heroes[this.index].illusions()[self.tabs()[this.index].illusions().length](),
                                'Illusion ' + j,
                                color,
                                'illusion-pane-template')
                        );
                    }
                }
            }, {vm: this, index: i}, "arrayChange");
        }
        self.heroes[0].showUnitTab(true);
        self.tabs = ko.observableArray([]);
        var tabsArr = [];
        for (var i = 0; i < 4; i++) {
            var color = i < 2 ? '#5cb85c' : '#d9534f';
            var tabGroup = new my.TabGroup(
                new my.Tab('heroTab' + i, 'heroPane' + i, self.heroes[i], 'Hero ' + i, color, 'hero-pane-template'),
                new my.Tab('unitTab' + i, 'unitPane' + i, self.heroes[i].unit(), 'Unit ' + i, color, 'unit-pane-template'),
                new my.Tab('cloneTab' + i, 'clonePane' + i, self.heroes[i].clone(), 'Meepo Clone ' + i, color, 'clone-pane-template')
            );
            //self.tabs.push(tabGroup);
            tabsArr.push(tabGroup);
        }
        self.tabs.push.apply(self.tabs, tabsArr);

        self.selectedItem = ko.observable();
        self.layout = ko.observable("1");
        self.displayShop = ko.observable(true);
        self.displayShopItemTooltip = ko.observable(true);
        self.allItems = ko.observableArray([
            {name: 'Str, Agi, Int, MS, Turn, Sight', value: 'stats0'},
            {name: 'Armor, Health, Mana, Regen, EHP', value: 'stats1'},
            {name: 'Phys Res, Magic Res, Lifesteal, Evasion, Bash, Miss', value: 'stats2'},
            {name: 'Damage, IAS, BAT, Attack', value: 'stats3'}
        ]); // Initial items
        self.selectedItems = ko.observableArray([]); 
        self.moveUp = function () {
            var start = self.allItems.indexOf(self.selectedItems()[0]),
                end = self.allItems.indexOf(self.selectedItems()[self.selectedItems().length - 1]);
            if (start > 0) {
                var e = self.allItems.splice(start - 1, 1);
                self.allItems.splice(end, 0, e[0]);            
            }
        };
        self.moveDown = function () {
            var start = self.allItems.indexOf(self.selectedItems()[0]),
                end = self.allItems.indexOf(self.selectedItems()[self.selectedItems().length - 1]);        
            if (end < self.allItems().length - 1) {
                var e = self.allItems.splice(end + 1, 1);
                self.allItems.splice(start, 0, e[0]);
            }    
        };
		self.selectedTabId = ko.observable('heroTab0');
        self.selectedTab = ko.computed(function () {
            var indices = self.selectedTabId().replace('heroTab', '').replace('cloneTab', '').replace('unitTab', '').replace('illusionTab', '').split('-'),
                index = indices[0],
                tab = self.tabs()[index];
            if (self.selectedTabId().indexOf('hero') != -1) {
                return tab.hero;
            }
            else if (self.selectedTabId().indexOf('unit') != -1) {
                return tab.unit;
            }
            else if (self.selectedTabId().indexOf('clone') != -1) {
                return tab.clone;
            }
            else if (self.selectedTabId().indexOf('illusion') != -1) {
                return _.find(tab.illusions(), function (tab) {
                    return tab.id == self.selectedTabId();
                });
            }
            else {
                return self.tabs()[0].hero;
            }
		});
        self.selectedTabs = ko.observableArray(['heroTab0', 'heroTab1']);
		//self.selectedTabs.push('heroTab0');
		//self.selectedTabs.push('heroTab1');
        self.clickTab = function (data, event, index) {
            /*if (event.target.id != 'settingsTab') {
                self.selectedTabId(event.target.id);
            }*/
            self.selectedTabId(event.target.id);
			if (self.selectedTabs()[1] != event.target.id) {
				self.selectedTabs.shift();
				self.selectedTabs.push(event.target.id);
			}
        };
        self.isSecondTab = function (id) {
            return self.selectedTabs().indexOf(id) > -1 && self.selectedTabId() != id;
        }
        
		self.showSideTabId = function (id) {
			return self.selectedTabs().indexOf(id) > -1 && self.sideView();
		};
		
        self.removeTab = function (index, data, event, tab) {
            if (data.id == self.selectedTabId()) {
                //self.selectedTabId('heroTab0');
                self.clickTab(null, {target: {id: 'heroTab0'}});
                $('#heroTab0').tab('show');
            }
            self.tabs()[tab].illusions.remove(function (illusion) {
                return illusion == data;
            });
            self.heroes[tab].illusions.remove(function (illusion) {
                return illusion() == data.data;
            });
        };
        
        self.sideView = ko.observable(false);
        self.sideView.subscribe(function (newValue) {
            if (newValue) {
				if (!self.shopPopout()) {
					self.displayShop(false);
				}
                self.layout("0");
            }
        });
		var $window = $(window);
		self.windowWidth = ko.observable($window.width());
		self.windowHeight = ko.observable($window.height());
		$window.resize(function () { 
			self.windowWidth($window.width());
			self.windowHeight($window.height());
		});
        self.shopDock = ko.observable(false);
        self.shopDock.subscribe(function (newValue) {
            if (newValue) {

            }
            else {
            }
        });
		self.shopDockTrigger = ko.computed(function () {
			self.windowWidth();
			self.shopDock();
		});
        self.shopPopout = ko.observable(false);
        self.shopPopout.subscribe(function (newValue) {
            if (newValue) {
				self.displayShop(true);
                $( "#shop-dialog" ).dialog({
                    minWidth: 380,
                    minHeight: 0,
					closeText: "",
					open: function ( event, ui ) {
						$(event.target.offsetParent).find('.ui-dialog-titlebar').find('button')
							.addClass('close glyphicon glyphicon-remove shop-button btn btn-default btn-xs pull-right')
							.removeClass('ui-button ui-widget ui-state-default ui-corner-all ui-button-icon-only ui-dialog-titlebar-close close')
							.css('margin-right','0px')
							.parent()
								.append($('#shop-minimize'))
								.append($('#shop-maximize'));
						$(event.target.offsetParent).find('.ui-dialog-titlebar').dblclick(function () {
							self.displayShop(!self.displayShop());
						});
					},
                    close: function ( event, ui ) {
                        self.shopPopout(false);
                    }
				});
            }
            else {
				$('#shop-container').prepend($('#shop-minimize')).prepend($('#shop-maximize'));
                $( "#shop-dialog" ).dialog("destroy");
            }
        });

        
        self.changeSelectedItem = function (data, event) {
            self.itemInputValue(1);
            self.selectedItem(event.target.id);
        }
        
        self.getItemTooltipData = ko.computed(function () {
            return my.getItemTooltipData(self.selectedItem());
        }, this);
        self.getItemInputLabel = ko.computed(function () {
            if (my.stackableItems.indexOf(self.selectedItem()) != -1) {
                return 'Stack Size'
            }
            else if (my.levelitems.indexOf(self.selectedItem()) != -1) {
                return 'Upgrade Level'
            }
            else if (self.selectedItem() == 'bloodstone') {
                return 'Charges'
            }
            else {
                return ''
            }
        }, this);
        self.itemInputValue = ko.observable(1);
        self.saveLink = ko.observable();
        self.save = function () {
            var data = {
                version: "1.2.0",
                heroes: []
            }
            for (var i = 0; i < 4; i++) {
                var hero = self.heroes[i];
                d = {
                    hero: hero.selectedHero().heroName,
                    level: hero.selectedHeroLevel(),
                    items: [],
                    abilities: [],
                    skillPointHistory: hero.skillPointHistory(),
                    buffs: [],
                    itemBuffs: [],
                    debuffs: [],
                    itemDebuffs: [],
                    graphData: []
                }
                // items
                for (var j = 0; j < hero.inventory.items().length; j++) {
                    d.items.push(ko.toJS(hero.inventory.items()[j]));
                }
                // abilities
                for (var j = 0; j < hero.ability().abilities().length; j++) {
                    d.abilities.push({
                        level: hero.ability().abilities()[j].level(),
                        isActive: hero.ability().abilities()[j].isActive()
                    });
                }
                // buffs
                for (var j = 0; j < hero.buffs.buffs().length; j++) {
                    d.buffs.push({
                        name: hero.buffs.buffs()[j].name,
                        level: hero.buffs.buffs()[j].data.level(),
                        isActive: hero.buffs.buffs()[j].data.isActive()
                    });
                }
                
                // debuffs
                for (var j = 0; j < hero.debuffs.buffs().length; j++) {
                    d.debuffs.push({
                        name: hero.debuffs.buffs()[j].name,
                        level: hero.debuffs.buffs()[j].data.level(),
                        isActive: hero.debuffs.buffs()[j].data.isActive()
                    });
                }

                // item buffs
                for (var j = 0; j < hero.buffs.itemBuffs.items().length; j++) {
                    d.itemBuffs.push(ko.toJS(hero.buffs.itemBuffs.items()[j]));
                }
                
                // item debuffs
                for (var j = 0; j < hero.debuffs.itemBuffs.items().length; j++) {
                    d.itemDebuffs.push(ko.toJS(hero.debuffs.itemBuffs.items()[j]));
                }
                
                // graph data
                d.graphData = ko.toJS(hero.buildExplorer.graphData);
                
                data.heroes.push(d);
            }
            var serialized = JSON.stringify(data);
            $.ajax({
                type: "POST",
                url: "/dota2/apps/hero-calculator/save.php",
                data: {'data': serialized},
                dataType: "json",
                success: function (data){
                    self.saveLink("http://devilesk.com/dota2/apps/hero-calculator?id=" + data.file);
                },
                failure: function (errMsg) {
                    alert("Save request failed.");
                }
            });
        }
        self.load = function (data) {
            for (var i = 0; i < 4; i++) {
                var hero = self.heroes[i];
                hero.selectedHero(_.findWhere(hero.availableHeroes(), {'heroName': data.heroes[i].hero}));
                hero.selectedHeroLevel(data.heroes[i].level);
                hero.inventory.items.removeAll();
                hero.inventory.activeItems.removeAll();
                
                // load items
                for (var j = 0; j < data.heroes[i].items.length; j++) {
                    var item = data.heroes[i].items[j];
                    var new_item = {
                        item: item.item,
                        state: ko.observable(item.state),
                        size: item.size,
                        enabled: ko.observable(item.enabled)
                    }
                    hero.inventory.items.push(new_item);
                }

                // load abilities
                for (var j = 0; j < data.heroes[i].abilities.length; j++) {
                    hero.ability().abilities()[j].level(data.heroes[i].abilities[j].level);
                    hero.ability().abilities()[j].isActive(data.heroes[i].abilities[j].isActive);
                }
                hero.skillPointHistory(data.heroes[i].skillPointHistory);

                // load buffs
                for (var j = 0; j < data.heroes[i].buffs.length; j++) {
                    hero.buffs.selectedBuff(_.findWhere(hero.buffs.availableBuffs(), {buffName: data.heroes[i].buffs[j].name}));
                    hero.buffs.addBuff(hero, {});
                    var b = _.findWhere(hero.buffs.buffs(), { name: data.heroes[i].buffs[j].name });
                    b.data.level(data.heroes[i].buffs[j].level);
                    b.data.isActive(data.heroes[i].buffs[j].isActive);
                }

                // load debuffs
                for (var j = 0; j < data.heroes[i].debuffs.length; j++) {
                    hero.debuffs.selectedBuff(_.findWhere(hero.debuffs.availableDebuffs(), {buffName: data.heroes[i].debuffs[j].name}));
                    hero.debuffs.addBuff(hero, {});
                    var b = _.findWhere(hero.debuffs.buffs(), { name: data.heroes[i].debuffs[j].name });
                    b.data.level(data.heroes[i].debuffs[j].level);
                    b.data.isActive(data.heroes[i].debuffs[j].isActive);
                }

                // load item buffs
                if (data.heroes[i].itemBuffs) {
                    for (var j = 0; j < data.heroes[i].itemBuffs.length; j++) {
                        var item = data.heroes[i].itemBuffs[j];
                        var new_item = {
                            item: item.item,
                            state: ko.observable(item.state),
                            size: item.size,
                            enabled: ko.observable(item.enabled)
                        }
                        hero.buffs.itemBuffs.items.push(new_item);
                    }
                }

                // load item debuffs
                if (data.heroes[i].itemDebuffs) {
                    for (var j = 0; j < data.heroes[i].itemDebuffs.length; j++) {
                        var item = data.heroes[i].itemDebuffs[j];
                        var new_item = {
                            item: item.item,
                            state: ko.observable(item.state),
                            size: item.size,
                            enabled: ko.observable(item.enabled)
                        }
                        hero.debuffs.itemBuffs.items.push(new_item);
                    }
                }
                
                // load graph data
                if (data.heroes[i].graphData) {
                    hero.buildExplorer.loadGraphData(data.heroes[i].graphData);
                }
            }
        }
        
        self.sendReport = function () {
            if ($('#BugReportFormText').val()) {
                $.post( "report.php", { name: $('#BugReportFormName').val(), email: $('#BugReportFormEmail').val(), body: $('#BugReportFormText').val() })
                .done(function (data) {
                    if (data == 'Success') {
                        alert('Report successfully sent. Thanks!');
                        $('#BugReportFormText').val('');
                    }
                    else {
                        alert('Failed to send report. Try again later or email admin@devilesk.com');
                    }
                });
                $('#myModal').modal('hide');
            }
            else {
                alert('Message is required.');
            }
        }
        
        self.getProperty = function (obj, properties) {
            var result = obj;
            for (var i = 0; i < properties.length; i++) {
                result = result[properties[i]];
            }
            return result;
        };
        
        self.getDiffTextWrapper = function (hero, property) {
            return self.getDiffText(self.getDiffMagnitude(hero, property));
        }
        
        self.getDiffMagnitude = function (hero, property) {
            var properties = property.split('.');
            return self.getProperty(hero.damageTotalInfo(), properties).toFixed(2) - self.getProperty(hero.heroCompare().damageTotalInfo(), properties).toFixed(2);
        }
        
        self.getDiffText = function (value) {
            if (value > 0) {
                return '+' + parseFloat(value.toFixed(2));
            }
            else if (value < 0) {
                return '&minus;' + parseFloat(value.toFixed(2)*-1).toString();
            }
            else {
                return '';
            }
        }
        self.highlightedTabInternal = ko.observable('');
        self.highlightedTab = ko.computed(function () {
            return self.highlightedTabInternal();
        }).extend({ throttle: 100 });
        self.highlightTab = function (data) {
            self.highlightedTabInternal(data);
        }
        self.unhighlightTab = function (data) {
            self.highlightedTabInternal('');
        }
        self.showPopover = function (tab) {
            if ($(window).width() < 768) return null;
            if (self.sideView()) return null;
            var compareText = "<strong>Compare tab</strong><br>Delta values are calculated from the difference with this tab.",
                enemyText = "<strong>Enemy tab</strong><br>Stats from this tab are taken into account and affect calculations.";
            switch (tab) {
                case 0:
                    $('#popHero' + 2).popover('destroy').popover({content: enemyText, animation: false, html: true, placement: 'top'}).popover('show');
                    $('#popHero' + 1).popover('destroy').popover({content: compareText, animation: false, html: true}).popover('show');
                break;
                case 1:
                    $('#popHero' + 2).popover('destroy').popover({content: enemyText, animation: false, html: true, placement: 'top'}).popover('show');
                    $('#popHero' + 0).popover('destroy').popover({content: compareText, animation: false, html: true}).popover('show');
                break;
                case 2:
                    $('#popHero' + 0).popover('destroy').popover({content: enemyText, animation: false, html: true, placement: 'top'}).popover('show');
                    $('#popHero' + 3).popover('destroy').popover({content: compareText, animation: false, html: true}).popover('show');
                break;
                case 3:
                    $('#popHero' + 0).popover('destroy').popover({content: enemyText, animation: false, html: true, placement: 'top'}).popover('show');
                    $('#popHero' + 2).popover('destroy').popover({content: compareText, animation: false, html: true}).popover('show');
                break;
            }
        }
        self.hidePopover = function (tab) {
            switch (tab) {
                case 0:
                    $('#popHero' + 1).popover('hide');
                    $('#popHero' + 2).popover('hide');
                    $('#popHero' + 3).popover('hide');
                break;
                case 1:
                    $('#popHero' + 0).popover('hide');
                    $('#popHero' + 2).popover('hide');
                    $('#popHero' + 3).popover('hide');
                break;
                case 2:
                    $('#popHero' + 1).popover('hide');
                    $('#popHero' + 0).popover('hide');
                    $('#popHero' + 3).popover('hide');
                break;
                case 3:
                    $('#popHero' + 1).popover('hide');
                    $('#popHero' + 2).popover('hide');
                    $('#popHero' + 0).popover('hide');
                break;
            }
        }
    }

    my.heroCalculator = {};
	my.theme = ko.observable($('#theme-select').val());
	
    my.init = function (HERODATA_PATH,ITEMDATA_PATH,UNITDATA_PATH) {
        var loadedFiles = 0;
        var loadedFilesMax = 4;
        $.when(
            $.get('templates.html', function (templates) {
                $('body').append('<div style="display:none">' + templates + '<\/div>');
            }),
            $.getJSON(HERODATA_PATH, function (data) {
                my.heroData = data;
                my.heroData['npc_dota_hero_chen'].abilities[2].behavior.push('DOTA_ABILITY_BEHAVIOR_NOT_LEARNABLE');
                my.heroData['npc_dota_hero_nevermore'].abilities[1].behavior.push('DOTA_ABILITY_BEHAVIOR_NOT_LEARNABLE');
                my.heroData['npc_dota_hero_nevermore'].abilities[2].behavior.push('DOTA_ABILITY_BEHAVIOR_NOT_LEARNABLE');
                my.heroData['npc_dota_hero_morphling'].abilities[3].behavior.push('DOTA_ABILITY_BEHAVIOR_NOT_LEARNABLE');
                my.heroData['npc_dota_hero_ogre_magi'].abilities[3].behavior.push('DOTA_ABILITY_BEHAVIOR_NOT_LEARNABLE');
                my.heroData['npc_dota_hero_techies'].abilities[4].behavior.push('DOTA_ABILITY_BEHAVIOR_NOT_LEARNABLE');
                my.heroData['npc_dota_hero_beastmaster'].abilities[2].behavior.push('DOTA_ABILITY_BEHAVIOR_NOT_LEARNABLE');
                var index = my.heroData['npc_dota_hero_lone_druid'].abilities[3].behavior.indexOf('DOTA_ABILITY_BEHAVIOR_HIDDEN');
                my.heroData['npc_dota_hero_lone_druid'].abilities[3].behavior.splice(index, 1);
                
                index = my.heroData['npc_dota_hero_abaddon'].abilities[2].behavior.indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE');
                my.heroData['npc_dota_hero_abaddon'].abilities[2].behavior.splice(index, 1);
                
                index = my.heroData['npc_dota_hero_riki'].abilities[2].behavior.indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE');
                my.heroData['npc_dota_hero_riki'].abilities[2].behavior.splice(index, 1);
            }),
            $.getJSON(ITEMDATA_PATH, function (data) {
                my.itemData = data;
            }),
            $.getJSON(UNITDATA_PATH, function (data) {
                my.unitData = data;
            })
        ).done(function(a1, a2, a3, a4){
            my.run();
        });
    }
    
    my.run = function () {
        my.heroCalculator = new my.HeroCalculatorViewModel();
        ko.applyBindings(my.heroCalculator);
		$('#theme-select').change(function () {
			my.theme($(this).val());
		});
		$('#spinner').hide();
		$('#hero-calc-wrapper').css('display', 'inline-block');
        $('#popHero0').addClass('active');
        $('#heroPane0').addClass('active');
        $('#popHero0').popover({animation: false, html: true});
        $('#popHero1').popover({animation: false, html: true});
        $('#popHero4').popover({animation: false, html: true});
        $('#popHero5').popover({animation: false, html: true});
        $('[data-toggle="tooltip"]').tooltip();
        var saveId = getParameterByName('id');
        if (saveId) {
            $.get('save/' + saveId + '.json', function (data) {
                my.heroCalculator.load(data);
            });
        }
    }
    
    my.inventoryClipBoard = {
        items: [],
        activeItems: []
    };

    function getParameterByName(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }

    return my;
}(HEROCALCULATOR));
