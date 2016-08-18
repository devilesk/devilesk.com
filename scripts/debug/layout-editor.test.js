ko.bindingHandlers.spinner = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel) {
        //initialize datepicker with some optional options
        var options = allBindingsAccessor().spinnerOptions || {};
        $(element).spinner(options);

        //handle the field changing
        ko.utils.registerEventHandler(element, "spinstart", function (event, ui) {
            viewModel.cards.state = 'spinning';
            viewModel.cards.saveSelectedState();
            if (ui.value == null) return;
            var observable = valueAccessor();
            observable(ui.value);
        });
        
        //handle the field changing
        ko.utils.registerEventHandler(element, "spin", function (event, ui) {
            if (ui.value == null) return;
            var observable = valueAccessor();
            observable(ui.value);
        });
        
        //handle the field changing
        ko.utils.registerEventHandler(element, "spinchange", function () {
            if ($(element).spinner("value") == null) return;
            var observable = valueAccessor();
            observable($(element).spinner("value"));
        });
        
        //handle the field changing
        ko.utils.registerEventHandler(element, "spinstop", function (event, ui) {
            if (viewModel.cards.state == 'spinning') viewModel.cards.state = null;
            if (ui.value == null) return;
            var observable = valueAccessor();
            observable(ui.value);
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

ko.extenders.numeric = function(target, precision) {
    //create a writable computed observable to intercept writes to our observable
    var result = ko.pureComputed({
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
    
(function () {

    function Card(collection, name, displayname, HeroID, x, y, scale, zpos) {
        var self = this;
        this.collection = collection;
        this.selected = ko.observable(false);
        this.selected.subscribe(function(newValue) {
            if (newValue) {
                $(self.$imgDraggable).addClass("ui-state-highlight");
            }
            else {
                $(self.$imgDraggable).removeClass("ui-state-highlight");
            }
            self.collection.updateSelected();
        });
        this.name = name.replace('npc_dota_hero_', '');
        this.displayname = displayname;
        this.HeroID = HeroID;
        this.width = this.collection.cardWidth();
        this.height = this.collection.cardHeight();
        this.x = ko.observable(x - scale * this.width/2 + this.width/2 || 0);
        this.y = ko.observable(y - scale * this.height/2 + this.height/2 || 0);
        this.defaultScale = 1;
        this.scale = ko.observable(scale || this.defaultScale);
        this.scaleStart = 0;
        this.dragStartPos = {top: 0, left: 0};
        this.zpos = ko.observable(zpos || 100);
        this.zpos.subscribe(function(newValue) {
            self.$imgDraggable.css("zIndex", newValue);
        });
        //var src = 'http://placehold.it/68x68';
        //var src = "http://cdn.dota2.com/apps/dota2/images/heroes/" + name.replace('npc_dota_hero_', '') + "_vert.jpg"
        var src = "/media/images/heroes/selection/npc_dota_hero_" + this.name + ".png"
        this.snapped = ko.observable(false);
        this.snapped.subscribe(function(newValue) {
            //console.log('snapped', newValue);
            if (newValue) {
                self.setGrid([self.collection.gridWidth(), self.collection.gridHeight()]);
                $(self.$img).addClass("card-snapped");
            }
            else {
                self.setGrid(false);
                $(self.$img).removeClass("card-snapped");
            }
            //console.log(self.$imgDraggable.draggable("option", "grid"));
        });
        
        this.$imgDraggable = $('<div>')
                                    .addClass('card')
                                    .css("zIndex", this.zpos())
                                    .css('position', 'absolute')
                                    .width(this.width * this.scale())
                                    .height(this.height * this.scale())
                                    .draggable({
                                        containment: '#container',
                                        grid: false,
                                        start: function( event, ui ) {
                                            //self.snapToGrid(this, ui);
                                            /*if (!event.shiftKey && !event.ctrlKey) {
                                                self.collection.selectAll(false);
                                            }*/
                                            //console.log('drag start', $(this).draggable('option', 'grid'));
                                            self.collection.state = 'dragging';
                                            self.selected(true);
                                            self.dragStartPos.top = ui.position.top;
                                            self.dragStartPos.left = ui.position.left;
                                            var action = [];
                                            $('.ui-state-highlight').each(function(index) {
                                                if (this != self.$imgDraggable[0]) {
                                                    this.card.dragStartPos.top = parseFloat($(this).css('top')) || 0;
                                                    this.card.dragStartPos.left = parseFloat($(this).css('left')) || 0;
                                                }
                                                action.push(this.card.getState());
                                            });
                                            self.collection.future.length = 0;
                                            self.collection.history.push(action);
                                            self.collection.historyCount(self.collection.history.length);
                                        },
                                        drag: function(event, ui) {
                                            //self.snapToGrid(this, ui);
                                            $('.ui-state-highlight').each(function(index) {
                                                if (this != self.$imgDraggable[0]) {
                                                    $(this).css({
                                                        top: this.card.dragStartPos.top + (ui.position.top - self.dragStartPos.top),
                                                        left: this.card.dragStartPos.left + (ui.position.left - self.dragStartPos.left)
                                                    });
                                                }
                                            });
                                        },
                                        stop: function(event, ui) {
                                            //self.snapToGrid(this, ui);
                                            self.disableSetXY = true;
                                            self.x($(this).position().left - self.collection.$grid.offset().left);
                                            self.y($(this).position().top - self.collection.$grid.offset().top);
                                            self.disableSetXY = false;
                                            self.setXY();
                                            $('.ui-state-highlight').each(function(index) {
                                                if (this != self.$imgDraggable[0]) {
                                                    this.card.x($(this).position().left - this.card.collection.$grid.offset().left);
                                                    this.card.y($(this).position().top - this.card.collection.$grid.offset().top);
                                                    //this.card.snapToGrid(this, ui);
                                                }
                                            });
                                            if (self.collection.state == 'dragging') self.collection.state = null;
                                        }
                                    })
                                    .mousedown(function (event) {
                                        self.collection.state = 'clicking';
                                        if (self.selected()) {
                                            self.selected(false);
                                        }
                                        else {
                                            if (!event.shiftKey && !event.ctrlKey && !self.collection.swap()) {
                                                self.collection.selectAll(false);
                                            }
                                            self.selected(true);
                                        }
                                        event.stopPropagation();
                                        if (self.collection.state == 'clicking') self.collection.state = null;
                                    });
        
        this.$imgResizable = $('<div>')
                                    .addClass('card-resize')
                                    .width(this.width * this.scale())
                                    .height(this.height * this.scale())
                                    .resizable({
                                        aspectRatio: true,
                                        handles: 'se',
                                        start: function( event, ui ) {
                                            self.collection.state = 'resizing';
                                            self.selected(true);
                                            var action = [];
                                            $('.ui-state-highlight .card-resize').each(function(index) {
                                                if (this != self.$imgResizable[0]) {
                                                    this.card.scaleStart = this.card.scale();
                                                }
                                                action.push(this.card.getState());
                                            });
                                            self.collection.future.length = 0;
                                            self.collection.history.push(action);
                                            self.collection.historyCount(self.collection.history.length);
                                        },
                                        resize: function( event, ui ) {
                                            self.$imgDraggable.width(self.width * (self.$imgResizable.width() / self.width))
                                                              .height(self.height * (self.$imgResizable.width() / self.width));
                                            $('.ui-state-highlight .card-resize').each(function(index) {
                                                if (this != self.$imgResizable[0]) {
                                                    this.card.scale(this.card.scaleStart * (self.$imgResizable.width() / self.width) / self.scale());
                                                    this.card.resize();
                                                }
                                            });
                                        },
                                        stop: function( event, ui ) {
                                            self.scale(self.$imgResizable.width() / self.width);
                                            self.resize();
                                            if (self.collection.state == 'resizing') self.collection.state = null;
                                        }
                                    });
                                    
        this.$img = $('<img>')
                            .addClass('card-image')
                            .attr('src', src)
                            .width('100%')
                            .height('100%');
                              
        this.$imgDraggable[0].card = self;
        this.$imgResizable[0].card = self;
        
        this.$imgDraggable.append(this.$imgResizable);
        this.$imgResizable.append(this.$img);
        
        this.disableSetXY = false;
        this.setXY();
        
        /*this.gridChanged = ko.computed(function () {
            console.log('grid changed');
            self.collection.gridWidth();
            self.collection.gridHeight();
            if (self.snapped()) self.snap();
        });*/
        /*
        this.snapToGrid = function (element, ui) {
           if ((ui.position.left - self.collection.$grid.offset().left) % self.collection.gridWidth() < self.collection.gridWidth() / 2) {
                $(element).css({
                    left: ui.position.left - (ui.position.left - self.collection.$grid.offset().left) % self.collection.gridWidth()
                });
                ui.position.left -= (ui.position.left - self.collection.$grid.offset().left) % self.collection.gridWidth()
            }
            else {
                $(element).css({
                    left: ui.position.left + self.collection.gridWidth() - ((ui.position.left - self.collection.$grid.offset().left) % self.collection.gridWidth())
                });
                ui.position.left += self.collection.gridWidth() - ((ui.position.left - self.collection.$grid.offset().left) % self.collection.gridWidth())
            }
            if ((ui.position.top - self.collection.$grid.offset().top) % self.collection.gridHeight() < self.collection.gridHeight() / 2) {
                $(element).css({
                    top: ui.position.top - (ui.position.top - self.collection.$grid.offset().top) % self.collection.gridHeight()
                });
                ui.position.top -= (ui.position.top - self.collection.$grid.offset().top) % self.collection.gridHeight()
            }
            else {
                $(element).css({
                    top: ui.position.top + self.collection.gridHeight() - ((ui.position.top - self.collection.$grid.offset().top) % self.collection.gridHeight())
                });
                ui.position.top += self.collection.gridHeight() - ((ui.position.top - self.collection.$grid.offset().top) % self.collection.gridHeight())
            }
        }
        */
    }
    
    Card.prototype.getState = function () {
        return {
            HeroID: this.HeroID,
            x: this.x(),
            y: this.y(),
            scale: this.scale(),
            zpos: this.zpos(),
            grid: this.$imgDraggable.draggable("option", "grid"),
            snapped: this.snapped(),
            selected: this.selected()
        }
    }
    
    Card.prototype.loadState = function (state) {
        this.snapped(state.snapped);
        this.x(state.x);
        this.y(state.y);
        this.scale(state.scale);
        this.zpos(state.zpos);
        this.$imgDraggable.draggable("option", "grid", state.grid);
        this.selected(state.selected);
        this.setXY();
        this.resize();
    }
    
    Card.prototype.getX = function () {
        return (this.x() + this.$imgDraggable.width()/2 - this.width/2)/this.collection.ratioX()
    }
    
    Card.prototype.getY = function () {
        return (this.y() + this.$imgDraggable.height()/2 - this.height/2)/this.collection.ratioY()
    }
    
    Card.prototype.draggable = function (value) {
        this.$imgDraggable.draggable(value ? "enable" : "disable" );
    }
    
    Card.prototype.resizable = function (value) {
        this.$imgResizable.resizable(value ? "enable" : "disable" );
    }
    
    Card.prototype.destroy = function () {
        this.$imgDraggable.remove();
        this.$imgResizable.remove();
        this.$img.remove();
    }
    
    Card.prototype.setXY = function () {
        if (this.disableSetXY) return;
        this.$imgDraggable.css({
            top: this.collection.$grid.offset().top + this.y(),
            left: this.collection.$grid.offset().left + this.x(),
        });
    }
    
    Card.prototype.setGrid = function (value) {
        this.$imgDraggable.draggable("option", "grid", value );
    }
    
    Card.prototype.resize = function () {
        this.$imgDraggable.width(this.width * this.scale())
                          .height(this.height * this.scale());
        this.$imgResizable.width(this.width * this.scale())
                          .height(this.height * this.scale());
    }
    
    Card.prototype.reset = function () {
        this.scale(this.defaultScale);
        this.resize();
    }
    
    Card.prototype.snap = function () {
        if (this.x() % this.collection.gridWidth() < this.collection.gridWidth() / 2) {
            this.x(this.x() - this.x() % this.collection.gridWidth());
        }
        else {
            this.x(this.x() + this.collection.gridWidth() - (this.x() % this.collection.gridWidth()));
        }
        if (this.y() % this.collection.gridHeight() < this.collection.gridHeight() / 2) {
            this.y(this.y() - this.y() % this.collection.gridHeight());
        }
        else {
            this.y(this.y() + this.collection.gridHeight() - (this.y() % this.collection.gridHeight()));
        }
        this.setXY();
    }

    /*
    Card.prototype.snapToGrid = function (gridWidth, gridHeight) {
        if (this.x % gridWidth < gridWidth / 2) {
            this.x -= this.x % gridWidth;
        }
        else {
            this.x += gridWidth - (this.x % gridWidth);
        }
        if (this.y % gridHeight < gridHeight / 2) {
            this.y -= this.y % gridHeight;
        }
        else {
            this.y += gridHeight - (this.y % gridHeight);
        }
    }*/
    
    function CardCollection(width, height, layoutWidth, layoutHeight, gridWidth, gridHeight, cardWidth, cardHeight) {
        var self = this;
        this.cardWidth = ko.observable(cardWidth);
        this.cardHeight = ko.observable(cardHeight);
        this.layoutWidth = ko.observable(layoutWidth);
        this.layoutHeight = ko.observable(layoutHeight);
        this.width = ko.observable(width);
        this.height = ko.observable(height);
        this.ratioX = ko.computed(function () {
            return self.width()/self.layoutWidth();
        });
        this.ratioY = ko.computed(function () {
            return self.height()/self.layoutHeight();
        });
        this.gridWidth = ko.observable(gridWidth || 25).extend({ numeric: 0 });
        this.gridHeight = ko.observable(gridHeight || 25).extend({ numeric: 0 });
        this.$grid = $('#container')
                        .css("zIndex", -100)
                        .width(this.width())
                        .height(this.height());
        this.aspectRatio = ko.observable('16x9');
        this.aspectRatio.subscribe(function (newValue) {
            self.changeAspectRatio.apply(self, aspectRatios[newValue]);
        });
        $(document).keydown(function (event) {
            //console.log(event.which, event.ctrlKey);
            if ($(".controls input[type=text]").is(":focus")) return;
            if (event.ctrlKey) {
                switch (event.which) {
                    case 65: // CTRL + A
                        self.selectAll(true);
                    break;
                    /*case 90: // CTRL + Z
                        self.undo();
                    break;
                    case 89: // CTRL + Y
                        self.redo();
                    break;*/
                }
            }
            else {
                switch (event.which) {
                    case 74: // J
                        self.decreaseDepth();
                    break;
                    case 75: // K
                        self.increaseDepth();
                    break;
                    case 82: // R
                        self.resetSelected();
                    break;
                    case 84: // T
                        self.gridShow(!self.gridShow());
                    break;
                    case 71: // G
                        self.swap(!self.swap());
                    break;
                    case 65: //left A
                        self.nudgeSelected(-1, 0);
                    break;
                    case 83: //down S
                        self.nudgeSelected(0, 1);
                    break;
                    case 68: //right D
                        self.nudgeSelected(1, 0);
                    break;
                    case 87: // up W
                        self.nudgeSelected(0, -1);
                    break;
                    case 86: // V
                        self.nudgeScaleSelected(-.1);
                    break;
                    case 67: // C
                        self.nudgeScaleSelected(.1);
                    break;
                    case 66: // B
                        self.swapSelection();
                    break;
                    case 70: // F
                        if (self.selection().length > 0) {
                            if (self.selection()[0].snapped()) {
                                self.unsnapSelection();
                            }
                            else {
                                self.snapSelection();
                            }
                        }
                    break;
                    case 69: // E
                        if (self.downloadLink != '') {
                            $('#download-link').fadeOut().fadeIn();
                        }
                        self.downloadLink(makeTextFile(self.toLayoutVMF()));
                    break;
                    case 81:
                        if (self.shareId != '') {
                            $('#share-link').fadeOut().fadeIn();
                        }
                        self.share();
                    break;
                    case 90: // Z
                        self.undo();
                    break;
                    case 88: // X
                        self.redo();
                    break;
                }
            }

        });
        this.$ghostSelect = $('<div class="ghost-select"><span></span></div>');
        this.$grid.append(this.$ghostSelect);
        this.canvas = document.createElement('canvas');
        this.canvas.style.position = 'absolute';
        this.canvas.width = this.width();
        this.canvas.height = this.height();
        this.ctx = this.canvas.getContext('2d');
        this.$grid.append(this.canvas);
        this.sizeChanged = ko.computed(function () {
            self.canvas.width = self.width();
            self.canvas.height = self.height();
            self.$grid
                .width(self.width())
                .height(self.height())
            self.drawGridLines();
        });
        this.gridShow = ko.observable(true);
        this.gridShow.subscribe(function (newValue) {
            if (newValue) {
                self.drawGridLines();
            }
            else {
                self.ctx.clearRect(0, 0, self.canvas.width, self.canvas.height);
            }
        });
        this.gridChanged = ko.computed(function () {
            //console.log('grid changed');
            //self.setGrid([self.gridWidth(), self.gridHeight()]);
            /*self.snapped().map(function (card) {
                card.snap();
            });*/
        });
        this.gridChangeEmitter = ko.observable(0);
        this.gridListener = ko.computed(function () {
            self.gridWidth();
            self.gridHeight();
            self.gridChangeEmitter((self.gridChangeEmitter() + 1) % 10);
        });
        this.gridChangeEmitter.subscribe(function (newValue) {
            if (self.modifyingState) return;
            //console.log('gridChangeEmitter', newValue);
            var action = [];
            action.gridWidth = self.gridWidth();
            action.gridHeight = self.gridHeight();
            //self.setGrid([self.gridWidth(), self.gridHeight()]);
            self.snapped().map(function (card) {
                action.push(card.getState());
                card.setGrid([self.gridWidth(), self.gridHeight()]);
                card.snap();
            });
            self.future.length = 0;
            self.history.push(action);
            self.historyCount(self.history.length);
        });
        
        this.swap = ko.observable(false);
        this.swap.subscribe(function (newValue) {
            if (newValue) {
                self.selectAll(false);
            }
            self.draggable(!newValue);
            self.resizable(!newValue);
        });
        this.historyCount = ko.observable(0);
        this.selectedCount = ko.observable(0);
        this.selectedCard = ko.observable(null);
        this.downloadLink = ko.observable('');
        this.shareId = ko.observable('');
        this.history = [];
        this.future = [];
        this.modifyingState = false;
        this.state = null;
        this.search = ko.observable('');
        this.search.subscribe(function (newValue) {
            self.state = 'selecting';
            self.disableUpdateSelected = true;
            if (!newValue) {
                self.selectAll(false);
                return;
            }
            self.map(function (card) {
                if (card.name.toLowerCase().indexOf(newValue.toLowerCase()) == 0 || card.displayname.toLowerCase().indexOf(newValue.toLowerCase()) == 0) {
                    card.selected(true);
                }
                else {
                    card.selected(false);
                }
            });
            self.disableUpdateSelected = false;
            self.updateSelected();
            if (self.state = 'selecting') self.state = null;
        });
        //self.ctx.clearRect(0, 0, self.canvas.width, self.canvas.height);
    }
    CardCollection.prototype = Object.create(Array.prototype);
    CardCollection.prototype.constructor = CardCollection;
    
    CardCollection.prototype.empty = function () {
        while (this.length > 0) {
            var card = this.pop();
            card.destroy();
        }
    }
    
    CardCollection.prototype.changeAspectRatio = function (width, height, layoutWidth, layoutHeight, gridWidth, gridHeight, cardWidth, cardHeight) {
        var self = this;
        this.cardWidth(cardWidth);
        this.cardHeight(cardHeight);
        this.layoutWidth(layoutWidth);
        this.layoutHeight(layoutHeight);
        this.width(width);
        this.height(height);
        this.gridWidth(gridWidth);
        this.gridHeight(gridHeight);
        var saveId = getParameterByName('id');
        if (saveId) {
            $.get('save/' + saveId + '.txt', function (data) {
                self.parseVMF(data);
            });
        }
        else {
            $.get( "default_" + this.aspectRatio() + ".txt", function( data ) {
                self.parseVMF(data);
            });
        }
    }
    
    CardCollection.prototype.getHeroID = function (HeroID) {
        for (var i = 0; i < this.length; i++) {
            if (this[i].HeroID == HeroID) return this[i];
        }
        return null;
    }
    
    CardCollection.prototype.getName = function (name) {
        var n = name.replace('npc_dota_hero_', '');
        for (var i = 0; i < this.length; i++) {
            if (this[i].name == n) return this[i];
        }
        return null;
    }
    
    CardCollection.prototype.drawGridLines = function () {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.beginPath();
        this.ctx.rect(0,0,this.canvas.width,this.canvas.height);
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = '#ff0000';
        this.ctx.stroke();
        for (var i = 0; i <= Math.floor(this.canvas.width / this.gridWidth()); i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.gridWidth(), 0);
            this.ctx.lineTo(i * this.gridWidth(), this.canvas.height);
            this.ctx.strokeStyle = '#000000';
            this.ctx.stroke();
        }
        for (var i = 0; i <= Math.floor(this.canvas.height / this.gridHeight()); i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.gridHeight());
            this.ctx.lineTo(this.canvas.width, i * this.gridHeight());
            this.ctx.strokeStyle = '#000000';
            this.ctx.stroke();
        }
    }
    
    CardCollection.prototype.setGrid = function (value) {
        this.snapped().map(function (card) {
            card.setGrid(value);
            //card.snap();
        });
    }
    
    CardCollection.prototype.undo = function () {
        if (this.history.length > 0) {
            this.state = 'undoing'
            this.modifyingState = true;
            this.swap(false);
            var states = this.history.pop();
            var present = [];
            //console.log(states);
            present.gridWidth = this.gridWidth();
            present.gridHeight = this.gridHeight();
            if (states.gridWidth != undefined) this.gridWidth(states.gridWidth);
            if (states.gridHeight != undefined) this.gridHeight(states.gridHeight);
            for (var i = 0; i < states.length; i++) {
                var card = this.getHeroID(states[i].HeroID);
                present.push(card.getState());
                card.loadState(states[i]);
            }
            this.future.push(present);
            this.modifyingState = false;
            if (this.state == 'undoing') this.state = null;
        }
    }
    
    CardCollection.prototype.redo = function () {
        if (this.future.length > 0) {
            this.state = 'redoing'
            this.modifyingState = true;
            this.swap(false);
            var states = this.future.pop();
            var present = [];
            //console.log(states);
            present.gridWidth = this.gridWidth();
            present.gridHeight = this.gridHeight();
            if (states.gridWidth != undefined) this.gridWidth(states.gridWidth);
            if (states.gridHeight != undefined) this.gridHeight(states.gridHeight);
            for (var i = 0; i < states.length; i++) {
                var card = this.getHeroID(states[i].HeroID);
                present.push(card.getState());
                card.loadState(states[i]);
            }
            this.history.push(present);
            this.modifyingState = false;
            if (this.state == 'redoing') this.state = null;
        }
    }
    
    CardCollection.prototype.clearHistory = function () {
        this.history.length = 0;
        this.future.length = 0;
        this.historyCount(0);
    }
    
    CardCollection.prototype.applyAction = function (group, stateName, actionFunc) {
        this.state = stateName;
        var action = [];
        group.map(function (card) {
            action.push(card.getState());
            actionFunc(card);
        });
        this.future.length = 0;
        if (action.length > 0) this.history.push(action);
        this.historyCount(this.history.length);
        if (this.state == stateName) this.state = null;
    }
    
    CardCollection.prototype.increaseDepth = function () {
        this.applyAction(this.selection(), 'increasingDepth', function (card) {
            card.zpos(card.zpos()+1);
        });
    }
    
    CardCollection.prototype.decreaseDepth = function () {
        this.applyAction(this.selection(), 'decreasingDepth', function (card) {
            card.zpos(card.zpos()-1);
        });
    }
    
    CardCollection.prototype.nudgeSelected = function (x, y) {
        var self = this;
        this.applyAction(this.selection(), 'nudging', function (card) {
            if (x != 0) {
                card.x(card.x() + x * (card.snapped() ? self.gridWidth() : 1));
            }
            if (y != 0) {
                card.y(card.y() + y * (card.snapped() ? self.gridHeight() : 1));
            }
            card.setXY();
        });
    }
    
    CardCollection.prototype.nudgeScaleSelected = function (v) {
        this.applyAction(this.selection(), 'nudgingScale', function (card) {
            card.scale(card.scale() + v);
            card.resize();
        });
    }
    
    CardCollection.prototype.resetSelected = function () {
        this.applyAction(this.selection(), 'resetting', function (card) {
            card.reset();
        });
    }
    
    CardCollection.prototype.selectAll = function (value) {
        this.disableUpdateSelected = true;
        this.map(function (card) {
            card.selected(value);
        });
        if (!value) this.search('');
        this.selectedCount(value ? this.length : 0);
        this.selectedCard(null);
        this.disableUpdateSelected = false;
        //this.updateSelected();
    }
    
    CardCollection.prototype.selection = function () {
        return this.filter(function (card) {
            return card.selected();
        });
    }
    
    CardCollection.prototype.snapped = function () {
        return this.filter(function (card) {
            return card.snapped();
        });
    }
    
    CardCollection.prototype.swapSelection = function () {
        if (this.selectedCount() == 2) {
            var c1 = -1,
                c2 = -1;
            for (var i = 0; i < this.length; i++) {
                if (this[i].selected()) {
                    if (c1 == -1) {
                        c1 = i;
                    }
                    else if (c2 == -1) {
                        c2 = i;
                    }
                }
            }
            this.doSwap(c1, c2);
        }
    }
    
    CardCollection.prototype.snapSelection = function () {
        this.applyAction(this.selection(), 'snapping', function (card) {
            card.snapped(true);
            card.snap();
        });
    }
    
    CardCollection.prototype.unsnapSelection = function () {
        this.applyAction(this.selection(), 'unsnapping', function (card) {
            card.snapped(false);
        });
    }
    
    CardCollection.prototype.setSelectedProperty = function (prop, value) {
        var action = [];
        //var self = this;
        this.selection().map(function (card) {
            //if (self.state == null) action.push(card.getState());
            card[prop](value);
            if (prop == 'x' || prop == 'y') card.setXY();
            if (prop == 'scale') card.resize();
        });
        /*if (this.state == null) {
            console.log('saving history');
            this.future.length = 0;
            this.history.push(action);
        }*/
    }
    
    CardCollection.prototype.draggable = function (value) {
        this.map(function (card) {
            card.draggable(value);
        });
    }
    
    CardCollection.prototype.resizable = function (value) {
        this.map(function (card) {
            card.resizable(value);
        });
    }
    
    CardCollection.prototype.parseVMF = function (text) {
        var HeroIDs = Object.keys(herodata);
        this.empty();
        var data = text.split('\n').map(function (a) {
            return a.trim(' \t');
        });
        var depth = 0;
        for (var i = 0; i < data.length; i++) {
            var key,
                displayname,
                HeroID,
                x,
                y,
                scale,
                zpos;
                
            if (data[i] == "{") {
                depth++;
            }
            else if (data[i] == "}") {
                depth--;
                
                if (depth == 1) {
                    this.add(key, displayname, HeroID, x, y, scale, zpos);
                    HeroIDs.splice(HeroIDs.indexOf(HeroID.toString()), 1);
                }
            }
            /*else if (depth == 1) {
                var id = parseFloat(data[i].replace(/"/g, ''));
                if (!isNaN(id)) {
                }
            }*/
            else if (depth == 2) {
                if (data[i].indexOf('"HeroID"') > -1) {
                    HeroID = parseFloat(data[i].replace('HeroID', '').replace(/"/g, ''));
                    key = herodata[HeroID].name;
                    displayname = herodata[HeroID].displayname;
                }
                else if (data[i].indexOf('"x"') > -1) {
                    x = (parseFloat(data[i].replace('x', '').replace(/"/g, '')) - aspectRatios[this.aspectRatio()][10]) * this.ratioX();
                }
                else if (data[i].indexOf('"y"') > -1) {
                    y = parseFloat(data[i].replace('y', '').replace(/"/g, '')) * this.ratioY();
                }
                else if (data[i].indexOf('"scale"') > -1) {
                    scale = parseFloat(data[i].replace('scale', '').replace(/"/g, ''))/aspectRatios[this.aspectRatio()][11];
                }
                else if (data[i].indexOf('"zpos"') > -1) {
                    zpos = parseFloat(data[i].replace('zpos', '').replace(/"/g, ''));
                }
            }
        }
        for (var i = 0; i < HeroIDs.length; i++) {
            var h = herodata[HeroIDs[i]];
            this.add(h.name, h.displayname, h.HeroID);
        }
        this.future.length = 0;
        this.history.length = 0;
        this.historyCount(0);
    }
    
    CardCollection.prototype.toLayoutVMF = function () {
        var out = '"fulldeck_layout.txt"\n';
        out += '{\n';
        for (var i = 0; i < this.length; i++) {
            out += '\t\t"' + i + '"\n';
            out += '\t\t{\n';
            out += '\t\t\t\t"HeroID"\t\t\t\t"' + this[i].HeroID + '"\n';
            out += '\t\t\t\t"x"\t\t\t\t"' + (this[i].getX() + aspectRatios[this.aspectRatio()][10]) + '"\n';
            out += '\t\t\t\t"y"\t\t\t\t"' + this[i].getY() + '"\n';
            out += '\t\t\t\t"scale"\t\t\t\t"' + this[i].scale() * aspectRatios[this.aspectRatio()][11] + '"\n';
            out += '\t\t\t\t"zpos"\t\t\t\t"' + (this[i].zpos()) + '"\n';
            out += '\t\t}\n';
        }
        out += '}\n';
        return out;
    }
    
    CardCollection.prototype.add = function (key, displayname, HeroID, x, y, scale, zpos) {
        var card = new Card(this, key, displayname, HeroID, x, y, scale, zpos);
        this.push(card);
        this.$grid.append(card.$imgDraggable);
    }
    
    CardCollection.prototype.doSwap = function (c1, c2) {
        var action = [];
        action.push(this[c1].getState());
        action.push(this[c2].getState());
        this.future.length = 0;
        this.history.push(action);
        this.historyCount(this.history.length);
        var temp = {
            x: this[c1].x(),
            y: this[c1].y()
        }
        this[c1].x(this[c2].x());
        this[c1].y(this[c2].y());
        this[c1].setXY();
        this[c2].x(temp.x);
        this[c2].y(temp.y);
        this[c2].setXY();
    }
    
    CardCollection.prototype.saveSelectedState = function () {
        var action = [];
        action.gridWidth = this.gridWidth();
        action.gridHeight = this.gridHeight();
        this.selection().map(function (card) {
            action.push(card.getState());
        });
        this.future.length = 0;
        this.history.push(action);
        this.historyCount(this.history.length);
    }
    
    CardCollection.prototype.disableUpdateSelected = false;
    CardCollection.prototype.updateSelected = function () {
        if (this.disableUpdateSelected) return;
        var c1 = -1,
            c2 = -1,
            count = 0;
        
        for (var i = 0; i < this.length; i++) {
            if (this[i].selected()) {
                count++;
                if (c1 == -1) {
                    c1 = i;
                }
                else if (c2 == -1) {
                    c2 = i;
                }
            }
        }
        this.selectedCount(count);
        if (this.swap() && this.selectedCount() == 2 && !this.modifyingState) {
            this.doSwap(c1, c2);
            this.selectAll(false);
        }
        if (this.selectedCount() == 1) {
            this.selectedCard(this[c1]);
        }
        else {
            this.selectedCard(null);
        }
    }
    
    CardCollection.prototype.share = function () {
        var self = this;
        $.ajax({
            type: "POST",
            url: "save.php",
            data: { 'data': self.toLayoutVMF() },
            dataType: "json",
            success: function(data) {
                //console.log(data);
                if (data.error) {
                    alert("Save request failed.");
                }
                else {
                    self.shareId(data.file);
                }
            },
            failure: function(errMsg) {
                alert("Save request failed.");
            }
        });
    }
    
    var aspectRatios = {
        '16x10': [1560, 600, 1158, 440, 70, 70, 66, 66, 120, 1680, 0, 0.390228],
        '16x9': [1700, 618, 1208, 440, 72, 72, 68, 68, 220, 1920, 0, 0.390228],
        '4x3': [1280, 548, 1034, 450, 58, 58, 54, 54, 0, 1280, 10, 0.348480]
    }
    var cards = new CardCollection(1700, 618, 1208, 440, 72, 72, 68, 68),
        textFile = null;

    function getParameterByName(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }
    
    function makeTextFile(text) {
        var data = new Blob([text], {type: 'text/plain'});

        // If we are replacing a previously generated file we need to
        // manually revoke the object URL to avoid memory leaks.
        if (textFile !== null) {
            window.URL.revokeObjectURL(textFile);
        }

        textFile = window.URL.createObjectURL(data);

        // returns a URL you can use as a href
        return textFile;
    }
    
    function readSingleFile(evt, callback) {
        //Retrieve the first (and only!) File from the FileList object
        var f = evt.target.files[0]; 

        if (f) {
            var r = new FileReader();
            r.onload = function(e) {
                var contents = e.target.result;
                /*alert( "Got the file.n" 
                +"name: " + f.name + "n"
                +"type: " + f.type + "n"
                +"size: " + f.size + " bytesn"
                + "starts with: " + contents.substr(1, contents.indexOf("n"))
                );*/
                document.getElementById("upload-file").value = f.name;
                callback(contents);
            }
            r.readAsText(f);
        }
        else { 
            alert("Failed to load file");
        }
    }
        
    function LayoutViewModel(cards) {
        var self = this;
        self.width = cards.width;
        self.height = cards.height;
        self.gridWidth = cards.gridWidth;
        self.gridHeight = cards.gridHeight;
        self.gridShow = cards.gridShow;
        self.aspectRatio = cards.aspectRatio;
        self.swap = cards.swap;
        self.snapSelection = cards.snapSelection.bind(cards);
        self.unsnapSelection = cards.unsnapSelection.bind(cards);
        self.swapSelection = cards.swapSelection.bind(cards);
        self.undo = cards.undo.bind(cards);
        self.redo = cards.redo.bind(cards);
        self.clearHistory = cards.clearHistory.bind(cards);
        self.historyCount = cards.historyCount;
        self.cards = cards;
        self.search = cards.search;
        self.selectedCount = cards.selectedCount;
        self.selectedCard = cards.selectedCard;
        self.selectedCardX = ko.computed({
            read: function () {
                if (self.cards.selectedCount() > 1) return 'n/a';
                if (self.selectedCard() != null) return self.selectedCard().x();
                return null;
            },
            write: function (value) {
                if (self.cards.selectedCount() > 0) {
                    self.cards.setSelectedProperty('x', parseFloat(value));
                }
            },
            owner: this
        });
        self.selectedCardY = ko.computed({
            read: function () {
                if (self.cards.selectedCount() > 1) return 'n/a';
                if (self.selectedCard() != null) return self.selectedCard().y();
                return null;
            },
            write: function (value) {
                if (self.cards.selectedCount() > 0) {
                    self.cards.setSelectedProperty('y', parseFloat(value));
                }
            },
            owner: this
        });
        self.selectedCardZPos = ko.pureComputed({
            read: function () {
                if (self.cards.selectedCount() > 1) return 'n/a';
                if (self.selectedCard() != null) return self.selectedCard().zpos();
                return null;
            },
            write: function (value) {
                if (self.cards.selectedCount() > 0) {
                    self.cards.setSelectedProperty('zpos', parseFloat(value));
                }
            },
            owner: this
        });
        self.selectedCardScale = ko.pureComputed({
            read: function () {
                if (self.cards.selectedCount() > 1) return 'n/a';
                if (self.selectedCard() != null) return self.selectedCard().scale();
                return null;
            },
            write: function (value) {
                if (self.cards.selectedCount() > 0) {
                    self.cards.setSelectedProperty('scale', parseFloat(value));
                }
            },
            owner: this
        });
        self.backgroundImage = ko.computed(function () {
            return 'url(background_' + cards.aspectRatio() + '.jpg)'
        });
        self.marginLeft = ko.computed(function () {
            return aspectRatios[cards.aspectRatio()][8] + 'px';
        });
        self.backgroundWidth = ko.computed(function () {
            return aspectRatios[cards.aspectRatio()][9] + 'px';
        });
        self.backgroundWidth2 = ko.computed(function () {
            return (aspectRatios[cards.aspectRatio()][9]-10) + 'px';
        });
        self.reset = cards.resetSelected.bind(cards);
        self.downloadLink = cards.downloadLink;
        self.shareId = cards.shareId;
        self.shareLink = ko.computed(function () {
            return 'http://dev.devilesk.com/dota2/apps/layout-editor/?id=' + self.shareId();
        });
        self.shareLayout = function () {
            if (cards.shareId != '') {
                $('#share-link').fadeOut().fadeIn();
            }
            cards.share();
        }
        self.exportLayout = function () {
            if (cards.downloadLink != '') {
                $('#download-link').fadeOut().fadeIn();
            }
            cards.downloadLink(makeTextFile(cards.toLayoutVMF()));
        }
        self.importLayout = function (contents) {
            cards.parseVMF(contents);
        }
        
        document.getElementById('import-layout').addEventListener('change', function (event) {
            readSingleFile(event, self.importLayout);
        }, false);
    }

    var herodata = {};
    
    $.getJSON('/media/js/herodata.json', function (data) {
        for (key in data) {
            if (key == 'npc_dota_hero_abyssal_underlord') continue;
            var h = data[key];
            herodata[h.HeroID] = h;
            cards.add(key, h.displayname, h.HeroID);
        }
        var vm = new LayoutViewModel(cards);
        ko.applyBindings(vm);
        var saveId = getParameterByName('id');
        if (saveId) {
            $.get('save/' + saveId + '.txt', function (data) {
                //console.log(data);
                cards.parseVMF(data);
                if (getParameterByName('canvas_only')) {
                    $('.controls-wrapper').remove();
                    $('#instructions').remove();
                    cards.gridShow(false);
                }
            });
        }
        else {
            $.get( "default_" + cards.aspectRatio() + ".txt", function( data ) {
                cards.parseVMF(data);
                if (getParameterByName('canvas_only')) {
                    $('.controls-wrapper').remove();
                    $('#instructions').remove();
                    cards.gridShow(false);
                }
            });
        }

    });

    $('#selection-area').mousedown(function (e) {
        if (cards.swap()) return;
        if (!e.shiftKey && !e.ctrlKey) cards.selectAll(false);
        $("#big-ghost").remove();
        $(".ghost-select").addClass("ghost-active");
        $(".ghost-select").css({
            'left': e.pageX,
            'top': e.pageY
        });

        initialW = e.pageX;
        initialH = e.pageY;

        $(document).bind("mouseup", selectElements);
        $(document).bind("mousemove", openSelector);
    });
    
    $(window).bind('mousewheel DOMMouseScroll', function(event){
        if (cards.selectedCount() > 0) {
            if (event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0) {
                // scroll up
                cards.nudgeScaleSelected(.1);
            }
            else {
                // scroll down
                cards.nudgeScaleSelected(-.1);
            }
            event.preventDefault();
        }
    });
        
    function selectElements(e) {
        $(document).unbind("mousemove", openSelector);
        $(document).unbind("mouseup", selectElements);
        var maxX = 0;
        var minX = 5000;
        var maxY = 0;
        var minY = 5000;
        var totalElements = 0;
        var elementArr = new Array();
        cards.state = 'selecting';
        cards.disableUpdateSelected = true;
        $(".card").each(function () {
            var aElem = $(".ghost-select");
            var bElem = $(this);
            var result = doObjectsCollide(aElem, bElem);

            if (result == true) {
                this.card.selected(true);
            }
        });
        cards.disableUpdateSelected = false;
        cards.updateSelected();
        if (cards.state = 'selecting') cards.state = null;
        $(".ghost-select").removeClass("ghost-active");
        $(".ghost-select").width(0).height(0);
    }

    function openSelector(e) {
        var w = Math.abs(initialW - e.pageX);
        var h = Math.abs(initialH - e.pageY);

        if ((initialW + w > $(document).width() && e.pageX > initialW) || (initialH + h > $(document).height() && e.pageY > initialH)) return;
        
        $(".ghost-select").css({
            'width': w,
            'height': h
        });
        if (e.pageX <= initialW && e.pageY >= initialH) {
            $(".ghost-select").css({
                'left': e.pageX
            });
        }
        else if (e.pageY <= initialH && e.pageX >= initialW) {
            $(".ghost-select").css({
                'top': e.pageY
            });
        }
        else if (e.pageY < initialH && e.pageX < initialW) {
            $(".ghost-select").css({
                'left': e.pageX,
                "top": e.pageY
            });
        }
    }

    function doObjectsCollide(a, b) {
        var aTop = a.offset().top;
        var aLeft = a.offset().left;
        var bTop = b.offset().top;
        var bLeft = b.offset().left;

        return !(
            ((aTop + a.height()) < (bTop)) ||
            (aTop > (bTop + b.height())) ||
            ((aLeft + a.width()) < bLeft) ||
            (aLeft > (bLeft + b.width()))
        );
    }
       
    function checkMaxMinPos(a, b, aW, aH, bW, bH, maxX, minX, maxY, minY) {
        'use strict';

        if (a.left < b.left) {
            if (a.left < minX) {
                minX = a.left;
            }
        } else {
            if (b.left < minX) {
                minX = b.left;
            }
        }

        if (a.left + aW > b.left + bW) {
            if (a.left > maxX) {
                maxX = a.left + aW;
            }
        } else {
            if (b.left + bW > maxX) {
                maxX = b.left + bW;
            }
        }

        if (a.top < b.top) {
            if (a.top < minY) {
                minY = a.top;
            }
        } else {
            if (b.top < minY) {
                minY = b.top;
            }
        }

        if (a.top + aH > b.top + bH) {
            if (a.top > maxY) {
                maxY = a.top + aH;
            }
        } else {
            if (b.top + bH > maxY) {
                maxY = b.top + bH;
            }
        }

        return {
            'maxX': maxX,
            'minX': minX,
            'maxY': maxY,
            'minY': minY
        };
    }
    
})();
