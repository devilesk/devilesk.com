var HEROCALCULATOR = (function (my) {

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
	
	my.HeroCalculatorViewModel = function() {
		var self = this;
		self.heroes = [new my.HeroCalculatorModel(1), new my.HeroCalculatorModel(0)];
		self.heroes[0].enemy = ko.observable(self.heroes[1]);
		self.heroes[1].enemy = ko.observable(self.heroes[0]);
		self.heroes[0].unit = ko.observable(new my.UnitViewModel(0,self.heroes[0]));
		self.heroes[1].unit = ko.observable(new my.UnitViewModel(0,self.heroes[1]));
		self.heroes[0].unit().selectedUnit(self.heroes[0].unit().availableUnits()[0]);
		self.heroes[1].unit().selectedUnit(self.heroes[1].unit().availableUnits()[0]);
		self.heroes[0].selectedHero(self.heroes[0].availableHeroes()[0]);
		self.heroes[1].selectedHero(self.heroes[1].availableHeroes()[1]);
		self.heroes.push(self.heroes[0].unit());
		self.heroes.push(self.heroes[1].unit());
		self.selectedTab = ko.observable(0);
		self.selectedTabView = [ko.observable(true),ko.observable(true),ko.observable(false),ko.observable(false),ko.observable(false)];
		self.selectedItem = ko.observable();
		self.layout = ko.observable("1");
		self.displayShop = ko.observable(true);
		self.toggleDisplayShop = function() {
			self.displayShop(!self.displayShop());
		}
		self.allItems = ko.observableArray([
			{name: 'Str,Agi,Int,MS,Turn,Sight', value: 'stats0'},
			{name: 'Health,Mana,Regen,EHP', value: 'stats1'},
			{name: 'Armor,Magic Res,Lifesteal,Evasion,Bash,Miss', value: 'stats2'},
			{name: 'Damage,IAS,BAT,Attack', value: 'stats3'}
		]); // Initial items
		self.selectedItems = ko.observableArray([]); 
		self.moveUp = function() {
			var start = self.allItems.indexOf(self.selectedItems()[0]),
			end = self.allItems.indexOf(self.selectedItems()[self.selectedItems().length-1]);		
			if (start > 0) {
				var e = self.allItems.splice(start-1,1);
				self.allItems.splice(end,0,e[0]);			
			}
		};
		self.moveDown = function() {
			var start = self.allItems.indexOf(self.selectedItems()[0]),
			end = self.allItems.indexOf(self.selectedItems()[self.selectedItems().length-1]);		
			if (end < self.allItems().length-1) {
				var e = self.allItems.splice(end+1,1);
				self.allItems.splice(start,0,e[0]);
			}	
		};
		
		self.clickTab = function(data, event) {
			if (event.target.id == 'heroTab0') {
				self.selectedTab(0);
				self.selectedTabView[0](true);
				self.selectedTabView[2](false);
				self.selectedTabView[4](false);
			}
			else if (event.target.id == 'heroTab1') {
				self.selectedTab(1);
				self.selectedTabView[1](true);
				self.selectedTabView[3](false);
				self.selectedTabView[4](false);
			}
			else if (event.target.id == 'unitTab0') {
				self.selectedTab(2);
				self.selectedTabView[2](true);
				self.selectedTabView[0](false);
				self.selectedTabView[4](false);
			}
			else if (event.target.id == 'unitTab1') {
				self.selectedTab(3);
				self.selectedTabView[3](true);
				self.selectedTabView[1](false);
				self.selectedTabView[4](false);
			}
			else if (event.target.id == 'settingsTab') {
				self.selectedTabView[4](true);
			}
		};
		
		self.sideView = ko.observable(false);
		self.sideView.subscribe(function(newValue) {
			if (newValue) {
				self.displayShop(false);
				self.layout(0);
			}
		});
		self.showSideTab = [
			ko.computed(function() {
				return self.selectedTabView[0]() && self.sideView() && !self.selectedTabView[4]();
			}),
			ko.computed(function() {
				return self.selectedTabView[1]() && self.sideView() && !self.selectedTabView[4]();
			}),
			ko.computed(function() {
				return self.selectedTabView[2]() && self.sideView() && !self.selectedTabView[4]();
			}),
			ko.computed(function() {
				return self.selectedTabView[3]() && self.sideView() && !self.selectedTabView[4]();
			}),
			ko.computed(function() {
				return self.selectedTabView[4]() && self.sideView();
			})
		];
		
		self.changeSelectedItem = function (data,event) {
			self.itemInputValue(1);
			self.selectedItem(event.target.id);
		}
		
		self.getItemTooltipData = ko.computed(function() {
			return my.getItemTooltipData(self.selectedItem());
		}, this);
		self.getItemInputLabel = ko.computed(function() {
			if (my.stackableitems.indexOf(self.selectedItem()) != -1) {
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
		self.save = function() {
			var test = ko.toJS(this);
			var serialized = JSON.stringify(JSON.decycle(test));
			var unserialized = JSON.retrocycle(JSON.parse(serialized));
			self.load(unserialized);
			$.ajax({
				type: "POST",
				url: "/dota2/apps/hero-calculator/hero-calculator.save.py",
				data: {'data':serialized},
				dataType: "json",
				success: function(data){
					var a = document.createElement('a');
					//a.style.float = 'left';
					a.href = "/dota2/apps/hero-calculator/" + data.data;
					a.target = "_blank";
					a.innerHTML = "devilesk.com/dota2/apps/hero-calculator/" + data.data;
					document.getElementById('savelink').innerHTML = "";
					document.getElementById('savelink').appendChild(a);
				},
				failure: function(errMsg) {
					alert("Save request failed.");
				}
			});
		}
		self.load = function(data) {
			self.allItems = ko.observableArray(data.allItems);
			for (var i=0;i<data.heroes.length;i++) {
				self.heroes[i].selectedHero(data.heroes[i].selectedHero)
				self.heroes[i].selectedHeroLevel(data.heroes[i].selectedHeroLevel)
				for (var j=0;j<data.heroes[i].ability.abilities.length;j++) {
					self.heroes[i].ability().abilities()[j].level(data.heroes[i].ability.abilities[j].level);
				}
			}
		}
        
        self.sendReport = function() {
            if ($('#BugReportFormText').val()) {
                $.post( "report.php", { name: $('#BugReportFormName').val(), email: $('#BugReportFormEmail').val(), body: $('#BugReportFormText').val() })
                .done(function(data) {
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
	}

	my.heroCalculator = {};

	my.init = function(HERODATA_PATH,ITEMDATA_PATH,UNITDATA_PATH) {
		$.getJSON(HERODATA_PATH, function (data) {
			my.heroData = data;
			my.heroData['npc_dota_hero_chen'].abilities[2].behavior.push('DOTA_ABILITY_BEHAVIOR_NOT_LEARNABLE');
			$.getJSON(ITEMDATA_PATH, function (data) {
				my.itemData = data;
				$.getJSON(UNITDATA_PATH, function (data) {
					my.unitData = data;
					my.heroCalculator = new my.HeroCalculatorViewModel();
					ko.applyBindings(my.heroCalculator);
				});
			});
		});
	}

	return my;
}(HEROCALCULATOR));