var HEROCALCULATOR = (function (my) {
    
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

    my.HeroCalculatorViewModel = function () {
        var self = this;
        self.heroes = [new my.HeroCalculatorModel(1), new my.HeroCalculatorModel(0)];
        self.heroes[0].enemy = ko.observable(self.heroes[1]);
        self.heroes[1].enemy = ko.observable(self.heroes[0]);
        self.heroes[0].unit = ko.observable(new my.UnitViewModel(0,self.heroes[0]));
        self.heroes[1].unit = ko.observable(new my.UnitViewModel(0,self.heroes[1]));
        self.heroes[0].clone = ko.observable(new my.CloneViewModel(0,self.heroes[0]));
        self.heroes[1].clone = ko.observable(new my.CloneViewModel(0,self.heroes[1]));
        self.heroes[0].unit().selectedUnit(self.heroes[0].unit().availableUnits()[0]);
        self.heroes[1].unit().selectedUnit(self.heroes[1].unit().availableUnits()[0]);
        self.heroes[0].selectedHero(self.heroes[0].availableHeroes()[0]);
        self.heroes[1].selectedHero(self.heroes[1].availableHeroes()[1]);
        self.heroes.push(self.heroes[0].unit());
        self.heroes.push(self.heroes[1].unit());
        self.heroes.push(new my.HeroCalculatorModel(0));
        self.heroes.push(new my.HeroCalculatorModel(1));
        self.heroes[4].enemy(self.heroes[1]);
        self.heroes[5].enemy(self.heroes[0]);
        self.heroes[0].heroCompare = ko.observable(self.heroes[4]);
        self.heroes[1].heroCompare = ko.observable(self.heroes[5]);
        self.heroes[4].heroCompare = ko.observable(self.heroes[0]);
        self.heroes[5].heroCompare = ko.observable(self.heroes[1]);
        self.selectedItem = ko.observable();
        self.layout = ko.observable("1");
        self.displayShop = ko.observable(true);
        self.toggleDisplayShop = function () {
            self.displayShop(!self.displayShop());
        }
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
			switch (self.selectedTabId()) {
				case 'heroTab0':
					return 0;
				break;
				case 'heroTab1':
					return 1;
				break;
				case 'unitTab0':
					return 2;
				break;
				case 'unitTab1':
					return 3;
				break;
				case 'heroTab4':
					return 4;
				break;
				case 'heroTab5':
					return 5;
				break;
				default:
					return self.selectedTab();
				break;
			}
		});
        self.selectedTabs = ko.observableArray([]);
		self.selectedTabs.push('heroTab0');
		self.selectedTabs.push('heroTab1');
        self.clickTab = function (data, event) {
			self.selectedTabId(event.target.id);
			if (self.selectedTabs()[1] != event.target.id) {
				self.selectedTabs.shift();
				self.selectedTabs.push(event.target.id);
			}
        };

		self.showSideTabId = function (id) {
			return self.selectedTabs().indexOf(id) > -1 && self.sideView();
		};
		
        self.removeTab = function (index, data, event, tab) {
            self.heroes[tab].illusions.remove(function (illusion) {
                return illusion() == data;
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
                version: "1.1.0",
                heroes: []
            }
            var indices = [0, 1, 4, 5];
            for (var i = 0; i < 4; i++) {
                var hero = self.heroes[indices[i]];
                d = {
                    hero: hero.selectedHero().heroName,
                    level: hero.selectedHeroLevel(),
                    items: [],
                    abilities: [],
                    skillPointHistory: hero.skillPointHistory(),
                    buffs: [],
                    itemBuffs: [],
                    debuffs: [],
                    itemDebuffs: []
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
            var indices = [0, 1, 4, 5];
            for (var i = 0; i < 4; i++) {
                var hero = self.heroes[indices[i]];
                hero.selectedHero(_.findWhere(hero.availableHeroes(), {'heroName': data.heroes[i].hero}));
                hero.selectedHeroLevel(hero.selectedHeroLevel);
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
        self.showPopover = function (tab) {
            if ($(window).width() < 768) return null;
            var compareText = "<strong>Compare tab</strong><br>Delta values are calculated from the difference with this tab.",
                enemyText = "<strong>Enemy tab</strong><br>Stats from this tab are taken into account and affect calculations.";
            switch (tab) {
                case 0:
                    $('#popHero' + 1).popover('destroy').popover({content: enemyText, animation: false, html: true}).popover('show');
                    $('#popHero' + 4).popover('destroy').popover({content: compareText, animation: false, html: true}).popover('show');
                break;
                case 1:
                    $('#popHero' + 0).popover('destroy').popover({content: enemyText, animation: false, html: true}).popover('show');
                    $('#popHero' + 5).popover('destroy').popover({content: compareText, animation: false, html: true}).popover('show');
                break;
                case 4:
                    $('#popHero' + 1).popover('destroy').popover({content: enemyText, animation: false, html: true}).popover('show');
                    $('#popHero' + 0).popover('destroy').popover({content: compareText, animation: false, html: true}).popover('show');
                break;
                case 5:
                    $('#popHero' + 0).popover('destroy').popover({content: enemyText, animation: false, html: true}).popover('show');
                    $('#popHero' + 1).popover('destroy').popover({content: compareText, animation: false, html: true}).popover('show');
                break;
            }
        }
        self.hidePopover = function (tab) {
            switch (tab) {
                case 0:
                    $('#popHero' + 1).popover('hide');
                    $('#popHero' + 4).popover('hide');
                    $('#popHero' + 5).popover('hide');
                break;
                case 1:
                    $('#popHero' + 0).popover('hide');
                    $('#popHero' + 4).popover('hide');
                    $('#popHero' + 5).popover('hide');
                break;
                case 4:
                    $('#popHero' + 1).popover('hide');
                    $('#popHero' + 0).popover('hide');
                    $('#popHero' + 5).popover('hide');
                break;
                case 5:
                    $('#popHero' + 1).popover('hide');
                    $('#popHero' + 4).popover('hide');
                    $('#popHero' + 0).popover('hide');
                break;
            }
        }
    }

    my.heroCalculator = {};

    my.init = function (HERODATA_PATH,ITEMDATA_PATH,UNITDATA_PATH) {
        var loadedFiles = 0;
        var loadedFilesMax = 4;
        $.get('templates.html', function (templates) {
            $('body').append('<div style="display:none">' + templates + '<\/div>');
            loadedFiles++;
            
        });
        $.getJSON(HERODATA_PATH, function (data) {
            my.heroData = data;
            my.heroData['npc_dota_hero_chen'].abilities[2].behavior.push('DOTA_ABILITY_BEHAVIOR_NOT_LEARNABLE');
            my.heroData['npc_dota_hero_nevermore'].abilities[1].behavior.push('DOTA_ABILITY_BEHAVIOR_NOT_LEARNABLE');
            my.heroData['npc_dota_hero_nevermore'].abilities[2].behavior.push('DOTA_ABILITY_BEHAVIOR_NOT_LEARNABLE');
            my.heroData['npc_dota_hero_morphling'].abilities[3].behavior.push('DOTA_ABILITY_BEHAVIOR_NOT_LEARNABLE');
            var index = my.heroData['npc_dota_hero_lone_druid'].abilities[3].behavior.indexOf('DOTA_ABILITY_BEHAVIOR_HIDDEN');
            my.heroData['npc_dota_hero_lone_druid'].abilities[3].behavior.splice(index, 1);
            loadedFiles++;
            if (loadedFiles == loadedFilesMax) my.run();
        });
        $.getJSON(ITEMDATA_PATH, function (data) {
            my.itemData = data;
            loadedFiles++;
            if (loadedFiles == loadedFilesMax) my.run();
        });
        $.getJSON(UNITDATA_PATH, function (data) {
            my.unitData = data;
            loadedFiles++;
            if (loadedFiles == loadedFilesMax) my.run();
        });
    }
    
    my.run = function () {
        my.heroCalculator = new my.HeroCalculatorViewModel();
        ko.applyBindings(my.heroCalculator);
		$('#spinner').hide();
		$('#hero-calc-wrapper').css('display', 'inline-block');
        $('#popHero0').popover({animation: false, html: true});
        $('#popHero1').popover({animation: false, html: true});
        $('#popHero4').popover({animation: false, html: true});
        $('#popHero5').popover({animation: false, html: true});
        var saveId = getParameterByName('id');
        if (saveId) {
            $.get('save/' + saveId + '.json', function (data) {
                my.heroCalculator.load(data);
            });
        }
    }
    
    function getParameterByName(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }

    return my;
}(HEROCALCULATOR));
