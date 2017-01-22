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
require('bootstrap');
var _ = require('underscore');

$(function() {
    var NUM_ITEMS = 5,
        itemBasic = [],
        itemUpgrade = [],
        hashMapUpgrade = {},
        items,
        components,
        componentsList,
        answer;

    $.getJSON("/media/dota-json/itemdata.json", function(itemdata) {
        delete itemdata['item_ward_dispenser'];
        delete itemdata['item_recipe_ward_dispenser'];
        
        var upgrades = [],
            recipes = {};

        function getAllComponents(i) {
            var result = [];
            if (upgrades.indexOf(i) == -1) {
                if (i.indexOf('item_recipe_') == -1) {
                    result.push(i.replace('item_', ''));
                } else {
                    result.push('recipe');
                }
            } else {
                result = result.concat(
                    itemdata[recipes[i]].ItemRequirements.map(getAllComponents).reduce(function(memo, l) {
                        return memo.concat(l);
                    }, [])
                );
            }
            return result;
        }

        for (var i in itemdata) {
            if (itemdata[i].ItemRecipe) {
                upgrades.push(itemdata[i].ItemResult);
                recipes[itemdata[i].ItemResult] = i;
            }
        }

        for (var i in itemdata) {
            if (itemdata[i].ItemRecipe) {
                itemUpgrade.push({
                    "name": itemdata[i].ItemResult.replace('item_', ''),
                    "components": itemdata[i].ItemRequirements.map(function(item) {
                        return item.indexOf('item_recipe_') == -1 ? item.replace('item_', '') : 'recipe';
                    }),
                    "cost": itemdata[itemdata[i].ItemResult].itemcost,
                    "allComponents": getAllComponents(itemdata[i].ItemResult)
                });
            } else if (upgrades.indexOf(i) == -1 && i.indexOf('winter_') == -1 && i.indexOf('greevil_') == -1 && i.indexOf('halloween_') == -1 && i.indexOf('mystery_') == -1) {
                itemBasic.push({
                    "name": itemdata[i].name.replace('item_', ''),
                    "components": null,
                    "cost": itemdata[i].itemcost
                });
            }
        }
        for (var i = 0; i < itemUpgrade.length; i++) {
            var key = itemUpgrade[i].allComponents.sort().reduce(function(memo, item) {
                return memo + item;
            }, '');
            hashMapUpgrade[key] = itemUpgrade[i].name;
        }

        generateQuestion();
    });

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

    function generateQuestion() {

        items = _.sortBy(_.sample(itemUpgrade, NUM_ITEMS), function(item) {
            return item.name;
        });
        answer = _.pluck(items, 'name');
        components = items.reduce(function(memo, item) {
            return memo.concat(item.allComponents);
        }, []);
        componentsList = [];
        shuffle(components);
        $('#components-container').empty();
        //$('#upgrades-container').empty();
        for (var i = 0; i < components.length; i++) {
            var $component = $('<img>').attr('src', 'http://cdn.dota2.com/apps/dota2/images/items/' + components[i] + '_lg.png').addClass('component');
            $component.data('componentName', components[i]);
            componentsList.push($component);
            $component.draggable({
                snap: true,
                stop: function(event, ui) {
                    var self = this;
                    
                    var snapped = $(this).data('ui-draggable').snapElements;
                    var snappedStart = $(this).data('snap-state');

                    // get difference between new snap state and old snap state
                    snapDiff = _.pluck(snapped.filter(function(element, index) {
                        return !snapped[index].snapping == snappedStart[index].snapping;
                    }), 'item');

                    // set snap-state to new snap state
                    $(this).data('snap-state', $(this).data('ui-draggable').snapElements);

                    // update state of other components
                    snapDiff.forEach(function(element) {
                        updateSnapped(self, element);
                    });

                    // get list of upgrade items
                    var componentItems = componentsList.map(function(item) {
                        return item[0]
                    });
                    var completedUpgrades = [];
                    while (componentItems.length > 0) {
                        var u = getUpgrade(componentItems[0]);
                        if (u) {
                            completedUpgrades.push(u);
                        }
                        componentItems = _.difference(componentItems, getAllSnappedTo(componentItems[0], [], []));
                    }

                    // update upgrades container
                    //$('#upgrades-container').empty();
                    var upgrades = $(".upgrade").map(function() {
                        return $(this).data('upgradeName');
                    }).get();
                    if (completedUpgrades.length > 0) {
                        completedUpgrades.forEach(function(item) {
                            if (upgrades.indexOf(item) == -1) {
                                var $upgrade = $('<img>').attr('src', 'http://cdn.dota2.com/apps/dota2/images/items/' + item + '_lg.png').addClass('upgrade').data('upgradeName', item);
                                $('#upgrades-container').append($upgrade.hide().fadeIn(500));
                            } else {
                                upgrades.splice(upgrades.indexOf(item), 1);
                            }
                        });
                        $(".upgrade").each(function(index) {
                            if (upgrades.indexOf($(this).data('upgradeName')) != -1) {
                                $(this).remove();
                                upgrades.splice(upgrades.indexOf($(this).data('upgradeName')), 1);
                            }
                        });
                    } else {
                        $('#upgrades-container').empty();
                    }

                    // get list of unused components
                    var singleComponents = componentsList.reduce(function(memo, item) {
                        if (!getUpgrade(item[0])) {
                            memo.push(item);
                        }
                        return memo;
                    }, []);

                    // update combined class
                    componentsList.forEach(function(element) {
                        if (singleComponents.indexOf(element) == -1) {
                            element.addClass('combined');
                        } else {
                            element.removeClass('combined');
                        }
                    });

                    // check if finished
                    //if (_.difference(answer, completedUpgrades).length == 0 || (singleComponents.length == 0 && _.every(completedUpgrades, function(item) {
                    if ((singleComponents.length == 0 && completedUpgrades.every(function(item) {
                            return _.find(itemUpgrade, function(i) {
                                return i.name == item;
                            });
                        }))) {
                        var timer = setTimeout(function() {
                            $.when($('.upgrade').fadeOut(500)).then(function() {
                                $(this).remove();
                                generateQuestion();
                            });
                        }, 1000);
                    }
                }
            });
            $('#components-container').append($component.hide().fadeIn(500));
        }

        // init each component's snap state
        componentsList.forEach(function($component) {
            $component.data('snap-state', componentsList.reduce(function(memo, item) {
                if ($component != item) {
                    memo.push({
                        'item': item[0],
                        'snapping': false
                    });
                }
                return memo;
            }, []));
        });

    }

    function updateSnapped(src, dest) {
        if ($(dest).data('snap-state')) {
            var d = _.find($(dest).data('snap-state'), function(item) {
                return item.item == src;
            });
            var s = _.find($(src).data('snap-state'), function(item) {
                return item.item == dest;
            });
            d.snapping = s.snapping;
        }
    }

    function getSnappedTo(el) {
        var snapped = $(el).data('snap-state'); //$(el).data('ui-draggable').snapElements;
        var snappedTo = [];
        if (snapped) {
            snappedTo = $.map(snapped, function(element) {
                return element.snapping ? element.item : null;
            });
        }
        return snappedTo;
    }

    function getAllSnappedTo(root, result, completed) {
        var snappedTo = getSnappedTo(root);
        if (completed.indexOf(root) == -1) {
            result.push(root);
            completed.push(root);
        }
        if (snappedTo) {
            for (var i = 0; i < snappedTo.length; i++) {
                if (completed.indexOf(snappedTo[i]) == -1) {
                    getAllSnappedTo(snappedTo[i], result, completed)
                }
            }
        }
        return result;
    }

    function getUpgrade(element) {
        var items = getAllSnappedTo(element, [], []).map(function(item) {
            return $(item).data('componentName');
        });
        items = items.sort();
        var key = items.reduce(function(memo, item) {
            return memo + item;
        }, '');
        return hashMapUpgrade[key];
    }

});