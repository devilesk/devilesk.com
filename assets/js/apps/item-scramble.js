require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({33:[function(require,module,exports){
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
},{"bootstrap":1,"jquery":25,"jquery-ui/ui/data":14,"jquery-ui/ui/ie":15,"jquery-ui/ui/plugin":16,"jquery-ui/ui/safe-active-element":17,"jquery-ui/ui/safe-blur":18,"jquery-ui/ui/scroll-parent":19,"jquery-ui/ui/version":20,"jquery-ui/ui/widget":21,"jquery-ui/ui/widgets/draggable":22,"jquery-ui/ui/widgets/mouse":24,"underscore":29}]},{},[33])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYXBwcy9pdGVtLXNjcmFtYmxlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciAkID0galF1ZXJ5ID0gcmVxdWlyZSgnanF1ZXJ5Jyk7XG5yZXF1aXJlKCdqcXVlcnktdWkvdWkvdmVyc2lvbicpO1xucmVxdWlyZSgnanF1ZXJ5LXVpL3VpL2llJyk7XG5yZXF1aXJlKCdqcXVlcnktdWkvdWkvZGF0YScpO1xucmVxdWlyZSgnanF1ZXJ5LXVpL3VpL3BsdWdpbicpO1xucmVxdWlyZSgnanF1ZXJ5LXVpL3VpL3NhZmUtYWN0aXZlLWVsZW1lbnQnKTtcbnJlcXVpcmUoJ2pxdWVyeS11aS91aS9zYWZlLWJsdXInKTtcbnJlcXVpcmUoJ2pxdWVyeS11aS91aS9zY3JvbGwtcGFyZW50Jyk7XG5yZXF1aXJlKCdqcXVlcnktdWkvdWkvd2lkZ2V0Jyk7XG5yZXF1aXJlKCdqcXVlcnktdWkvdWkvd2lkZ2V0cy9tb3VzZScpO1xucmVxdWlyZSgnanF1ZXJ5LXVpL3VpL3dpZGdldHMvZHJhZ2dhYmxlJyk7XG5yZXF1aXJlKCdib290c3RyYXAnKTtcbnZhciBfID0gcmVxdWlyZSgndW5kZXJzY29yZScpO1xuXG4kKGZ1bmN0aW9uKCkge1xuICAgIHZhciBOVU1fSVRFTVMgPSA1LFxuICAgICAgICBpdGVtQmFzaWMgPSBbXSxcbiAgICAgICAgaXRlbVVwZ3JhZGUgPSBbXSxcbiAgICAgICAgaGFzaE1hcFVwZ3JhZGUgPSB7fSxcbiAgICAgICAgaXRlbXMsXG4gICAgICAgIGNvbXBvbmVudHMsXG4gICAgICAgIGNvbXBvbmVudHNMaXN0LFxuICAgICAgICBhbnN3ZXI7XG5cbiAgICAkLmdldEpTT04oXCIvbWVkaWEvZG90YS1qc29uL2l0ZW1kYXRhLmpzb25cIiwgZnVuY3Rpb24oaXRlbWRhdGEpIHtcbiAgICAgICAgZGVsZXRlIGl0ZW1kYXRhWydpdGVtX3dhcmRfZGlzcGVuc2VyJ107XG4gICAgICAgIGRlbGV0ZSBpdGVtZGF0YVsnaXRlbV9yZWNpcGVfd2FyZF9kaXNwZW5zZXInXTtcbiAgICAgICAgXG4gICAgICAgIHZhciB1cGdyYWRlcyA9IFtdLFxuICAgICAgICAgICAgcmVjaXBlcyA9IHt9O1xuXG4gICAgICAgIGZ1bmN0aW9uIGdldEFsbENvbXBvbmVudHMoaSkge1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgICAgICAgICAgaWYgKHVwZ3JhZGVzLmluZGV4T2YoaSkgPT0gLTEpIHtcbiAgICAgICAgICAgICAgICBpZiAoaS5pbmRleE9mKCdpdGVtX3JlY2lwZV8nKSA9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQucHVzaChpLnJlcGxhY2UoJ2l0ZW1fJywgJycpKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQucHVzaCgncmVjaXBlJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHQuY29uY2F0KFxuICAgICAgICAgICAgICAgICAgICBpdGVtZGF0YVtyZWNpcGVzW2ldXS5JdGVtUmVxdWlyZW1lbnRzLm1hcChnZXRBbGxDb21wb25lbnRzKS5yZWR1Y2UoZnVuY3Rpb24obWVtbywgbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1lbW8uY29uY2F0KGwpO1xuICAgICAgICAgICAgICAgICAgICB9LCBbXSlcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAodmFyIGkgaW4gaXRlbWRhdGEpIHtcbiAgICAgICAgICAgIGlmIChpdGVtZGF0YVtpXS5JdGVtUmVjaXBlKSB7XG4gICAgICAgICAgICAgICAgdXBncmFkZXMucHVzaChpdGVtZGF0YVtpXS5JdGVtUmVzdWx0KTtcbiAgICAgICAgICAgICAgICByZWNpcGVzW2l0ZW1kYXRhW2ldLkl0ZW1SZXN1bHRdID0gaTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAodmFyIGkgaW4gaXRlbWRhdGEpIHtcbiAgICAgICAgICAgIGlmIChpdGVtZGF0YVtpXS5JdGVtUmVjaXBlKSB7XG4gICAgICAgICAgICAgICAgaXRlbVVwZ3JhZGUucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIFwibmFtZVwiOiBpdGVtZGF0YVtpXS5JdGVtUmVzdWx0LnJlcGxhY2UoJ2l0ZW1fJywgJycpLFxuICAgICAgICAgICAgICAgICAgICBcImNvbXBvbmVudHNcIjogaXRlbWRhdGFbaV0uSXRlbVJlcXVpcmVtZW50cy5tYXAoZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGl0ZW0uaW5kZXhPZignaXRlbV9yZWNpcGVfJykgPT0gLTEgPyBpdGVtLnJlcGxhY2UoJ2l0ZW1fJywgJycpIDogJ3JlY2lwZSc7XG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICBcImNvc3RcIjogaXRlbWRhdGFbaXRlbWRhdGFbaV0uSXRlbVJlc3VsdF0uaXRlbWNvc3QsXG4gICAgICAgICAgICAgICAgICAgIFwiYWxsQ29tcG9uZW50c1wiOiBnZXRBbGxDb21wb25lbnRzKGl0ZW1kYXRhW2ldLkl0ZW1SZXN1bHQpXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHVwZ3JhZGVzLmluZGV4T2YoaSkgPT0gLTEgJiYgaS5pbmRleE9mKCd3aW50ZXJfJykgPT0gLTEgJiYgaS5pbmRleE9mKCdncmVldmlsXycpID09IC0xICYmIGkuaW5kZXhPZignaGFsbG93ZWVuXycpID09IC0xICYmIGkuaW5kZXhPZignbXlzdGVyeV8nKSA9PSAtMSkge1xuICAgICAgICAgICAgICAgIGl0ZW1CYXNpYy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgXCJuYW1lXCI6IGl0ZW1kYXRhW2ldLm5hbWUucmVwbGFjZSgnaXRlbV8nLCAnJyksXG4gICAgICAgICAgICAgICAgICAgIFwiY29tcG9uZW50c1wiOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICBcImNvc3RcIjogaXRlbWRhdGFbaV0uaXRlbWNvc3RcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGl0ZW1VcGdyYWRlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIga2V5ID0gaXRlbVVwZ3JhZGVbaV0uYWxsQ29tcG9uZW50cy5zb3J0KCkucmVkdWNlKGZ1bmN0aW9uKG1lbW8sIGl0ZW0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbWVtbyArIGl0ZW07XG4gICAgICAgICAgICB9LCAnJyk7XG4gICAgICAgICAgICBoYXNoTWFwVXBncmFkZVtrZXldID0gaXRlbVVwZ3JhZGVbaV0ubmFtZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGdlbmVyYXRlUXVlc3Rpb24oKTtcbiAgICB9KTtcblxuICAgIGZ1bmN0aW9uIHNodWZmbGUoYXJyYXkpIHtcbiAgICAgICAgdmFyIGNvdW50ZXIgPSBhcnJheS5sZW5ndGgsXG4gICAgICAgICAgICB0ZW1wLCBpbmRleDtcblxuICAgICAgICAvLyBXaGlsZSB0aGVyZSBhcmUgZWxlbWVudHMgaW4gdGhlIGFycmF5XG4gICAgICAgIHdoaWxlIChjb3VudGVyID4gMCkge1xuICAgICAgICAgICAgLy8gUGljayBhIHJhbmRvbSBpbmRleFxuICAgICAgICAgICAgaW5kZXggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBjb3VudGVyKTtcblxuICAgICAgICAgICAgLy8gRGVjcmVhc2UgY291bnRlciBieSAxXG4gICAgICAgICAgICBjb3VudGVyLS07XG5cbiAgICAgICAgICAgIC8vIEFuZCBzd2FwIHRoZSBsYXN0IGVsZW1lbnQgd2l0aCBpdFxuICAgICAgICAgICAgdGVtcCA9IGFycmF5W2NvdW50ZXJdO1xuICAgICAgICAgICAgYXJyYXlbY291bnRlcl0gPSBhcnJheVtpbmRleF07XG4gICAgICAgICAgICBhcnJheVtpbmRleF0gPSB0ZW1wO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGFycmF5O1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBnZW5lcmF0ZVF1ZXN0aW9uKCkge1xuXG4gICAgICAgIGl0ZW1zID0gXy5zb3J0QnkoXy5zYW1wbGUoaXRlbVVwZ3JhZGUsIE5VTV9JVEVNUyksIGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgIHJldHVybiBpdGVtLm5hbWU7XG4gICAgICAgIH0pO1xuICAgICAgICBhbnN3ZXIgPSBfLnBsdWNrKGl0ZW1zLCAnbmFtZScpO1xuICAgICAgICBjb21wb25lbnRzID0gaXRlbXMucmVkdWNlKGZ1bmN0aW9uKG1lbW8sIGl0ZW0pIHtcbiAgICAgICAgICAgIHJldHVybiBtZW1vLmNvbmNhdChpdGVtLmFsbENvbXBvbmVudHMpO1xuICAgICAgICB9LCBbXSk7XG4gICAgICAgIGNvbXBvbmVudHNMaXN0ID0gW107XG4gICAgICAgIHNodWZmbGUoY29tcG9uZW50cyk7XG4gICAgICAgICQoJyNjb21wb25lbnRzLWNvbnRhaW5lcicpLmVtcHR5KCk7XG4gICAgICAgIC8vJCgnI3VwZ3JhZGVzLWNvbnRhaW5lcicpLmVtcHR5KCk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29tcG9uZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyICRjb21wb25lbnQgPSAkKCc8aW1nPicpLmF0dHIoJ3NyYycsICdodHRwOi8vY2RuLmRvdGEyLmNvbS9hcHBzL2RvdGEyL2ltYWdlcy9pdGVtcy8nICsgY29tcG9uZW50c1tpXSArICdfbGcucG5nJykuYWRkQ2xhc3MoJ2NvbXBvbmVudCcpO1xuICAgICAgICAgICAgJGNvbXBvbmVudC5kYXRhKCdjb21wb25lbnROYW1lJywgY29tcG9uZW50c1tpXSk7XG4gICAgICAgICAgICBjb21wb25lbnRzTGlzdC5wdXNoKCRjb21wb25lbnQpO1xuICAgICAgICAgICAgJGNvbXBvbmVudC5kcmFnZ2FibGUoe1xuICAgICAgICAgICAgICAgIHNuYXA6IHRydWUsXG4gICAgICAgICAgICAgICAgc3RvcDogZnVuY3Rpb24oZXZlbnQsIHVpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHZhciBzbmFwcGVkID0gJCh0aGlzKS5kYXRhKCd1aS1kcmFnZ2FibGUnKS5zbmFwRWxlbWVudHM7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzbmFwcGVkU3RhcnQgPSAkKHRoaXMpLmRhdGEoJ3NuYXAtc3RhdGUnKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBnZXQgZGlmZmVyZW5jZSBiZXR3ZWVuIG5ldyBzbmFwIHN0YXRlIGFuZCBvbGQgc25hcCBzdGF0ZVxuICAgICAgICAgICAgICAgICAgICBzbmFwRGlmZiA9IF8ucGx1Y2soc25hcHBlZC5maWx0ZXIoZnVuY3Rpb24oZWxlbWVudCwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAhc25hcHBlZFtpbmRleF0uc25hcHBpbmcgPT0gc25hcHBlZFN0YXJ0W2luZGV4XS5zbmFwcGluZztcbiAgICAgICAgICAgICAgICAgICAgfSksICdpdGVtJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gc2V0IHNuYXAtc3RhdGUgdG8gbmV3IHNuYXAgc3RhdGVcbiAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5kYXRhKCdzbmFwLXN0YXRlJywgJCh0aGlzKS5kYXRhKCd1aS1kcmFnZ2FibGUnKS5zbmFwRWxlbWVudHMpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIHVwZGF0ZSBzdGF0ZSBvZiBvdGhlciBjb21wb25lbnRzXG4gICAgICAgICAgICAgICAgICAgIHNuYXBEaWZmLmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlU25hcHBlZChzZWxmLCBlbGVtZW50KTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gZ2V0IGxpc3Qgb2YgdXBncmFkZSBpdGVtc1xuICAgICAgICAgICAgICAgICAgICB2YXIgY29tcG9uZW50SXRlbXMgPSBjb21wb25lbnRzTGlzdC5tYXAoZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGl0ZW1bMF1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjb21wbGV0ZWRVcGdyYWRlcyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICB3aGlsZSAoY29tcG9uZW50SXRlbXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHUgPSBnZXRVcGdyYWRlKGNvbXBvbmVudEl0ZW1zWzBdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh1KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcGxldGVkVXBncmFkZXMucHVzaCh1KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudEl0ZW1zID0gXy5kaWZmZXJlbmNlKGNvbXBvbmVudEl0ZW1zLCBnZXRBbGxTbmFwcGVkVG8oY29tcG9uZW50SXRlbXNbMF0sIFtdLCBbXSkpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gdXBkYXRlIHVwZ3JhZGVzIGNvbnRhaW5lclxuICAgICAgICAgICAgICAgICAgICAvLyQoJyN1cGdyYWRlcy1jb250YWluZXInKS5lbXB0eSgpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgdXBncmFkZXMgPSAkKFwiLnVwZ3JhZGVcIikubWFwKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICQodGhpcykuZGF0YSgndXBncmFkZU5hbWUnKTtcbiAgICAgICAgICAgICAgICAgICAgfSkuZ2V0KCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb21wbGV0ZWRVcGdyYWRlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wbGV0ZWRVcGdyYWRlcy5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodXBncmFkZXMuaW5kZXhPZihpdGVtKSA9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgJHVwZ3JhZGUgPSAkKCc8aW1nPicpLmF0dHIoJ3NyYycsICdodHRwOi8vY2RuLmRvdGEyLmNvbS9hcHBzL2RvdGEyL2ltYWdlcy9pdGVtcy8nICsgaXRlbSArICdfbGcucG5nJykuYWRkQ2xhc3MoJ3VwZ3JhZGUnKS5kYXRhKCd1cGdyYWRlTmFtZScsIGl0ZW0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKCcjdXBncmFkZXMtY29udGFpbmVyJykuYXBwZW5kKCR1cGdyYWRlLmhpZGUoKS5mYWRlSW4oNTAwKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBncmFkZXMuc3BsaWNlKHVwZ3JhZGVzLmluZGV4T2YoaXRlbSksIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgJChcIi51cGdyYWRlXCIpLmVhY2goZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodXBncmFkZXMuaW5kZXhPZigkKHRoaXMpLmRhdGEoJ3VwZ3JhZGVOYW1lJykpICE9IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZ3JhZGVzLnNwbGljZSh1cGdyYWRlcy5pbmRleE9mKCQodGhpcykuZGF0YSgndXBncmFkZU5hbWUnKSksIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgJCgnI3VwZ3JhZGVzLWNvbnRhaW5lcicpLmVtcHR5KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAvLyBnZXQgbGlzdCBvZiB1bnVzZWQgY29tcG9uZW50c1xuICAgICAgICAgICAgICAgICAgICB2YXIgc2luZ2xlQ29tcG9uZW50cyA9IGNvbXBvbmVudHNMaXN0LnJlZHVjZShmdW5jdGlvbihtZW1vLCBpdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWdldFVwZ3JhZGUoaXRlbVswXSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZW1vLnB1c2goaXRlbSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbWVtbztcbiAgICAgICAgICAgICAgICAgICAgfSwgW10pO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIHVwZGF0ZSBjb21iaW5lZCBjbGFzc1xuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRzTGlzdC5mb3JFYWNoKGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzaW5nbGVDb21wb25lbnRzLmluZGV4T2YoZWxlbWVudCkgPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmFkZENsYXNzKCdjb21iaW5lZCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnJlbW92ZUNsYXNzKCdjb21iaW5lZCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBjaGVjayBpZiBmaW5pc2hlZFxuICAgICAgICAgICAgICAgICAgICAvL2lmIChfLmRpZmZlcmVuY2UoYW5zd2VyLCBjb21wbGV0ZWRVcGdyYWRlcykubGVuZ3RoID09IDAgfHwgKHNpbmdsZUNvbXBvbmVudHMubGVuZ3RoID09IDAgJiYgXy5ldmVyeShjb21wbGV0ZWRVcGdyYWRlcywgZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoKHNpbmdsZUNvbXBvbmVudHMubGVuZ3RoID09IDAgJiYgY29tcGxldGVkVXBncmFkZXMuZXZlcnkoZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBfLmZpbmQoaXRlbVVwZ3JhZGUsIGZ1bmN0aW9uKGkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGkubmFtZSA9PSBpdGVtO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQud2hlbigkKCcudXBncmFkZScpLmZhZGVPdXQoNTAwKSkudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2VuZXJhdGVRdWVzdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwgMTAwMCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICQoJyNjb21wb25lbnRzLWNvbnRhaW5lcicpLmFwcGVuZCgkY29tcG9uZW50LmhpZGUoKS5mYWRlSW4oNTAwKSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBpbml0IGVhY2ggY29tcG9uZW50J3Mgc25hcCBzdGF0ZVxuICAgICAgICBjb21wb25lbnRzTGlzdC5mb3JFYWNoKGZ1bmN0aW9uKCRjb21wb25lbnQpIHtcbiAgICAgICAgICAgICRjb21wb25lbnQuZGF0YSgnc25hcC1zdGF0ZScsIGNvbXBvbmVudHNMaXN0LnJlZHVjZShmdW5jdGlvbihtZW1vLCBpdGVtKSB7XG4gICAgICAgICAgICAgICAgaWYgKCRjb21wb25lbnQgIT0gaXRlbSkge1xuICAgICAgICAgICAgICAgICAgICBtZW1vLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgJ2l0ZW0nOiBpdGVtWzBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ3NuYXBwaW5nJzogZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBtZW1vO1xuICAgICAgICAgICAgfSwgW10pKTtcbiAgICAgICAgfSk7XG5cbiAgICB9XG5cbiAgICBmdW5jdGlvbiB1cGRhdGVTbmFwcGVkKHNyYywgZGVzdCkge1xuICAgICAgICBpZiAoJChkZXN0KS5kYXRhKCdzbmFwLXN0YXRlJykpIHtcbiAgICAgICAgICAgIHZhciBkID0gXy5maW5kKCQoZGVzdCkuZGF0YSgnc25hcC1zdGF0ZScpLCBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGl0ZW0uaXRlbSA9PSBzcmM7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHZhciBzID0gXy5maW5kKCQoc3JjKS5kYXRhKCdzbmFwLXN0YXRlJyksIGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaXRlbS5pdGVtID09IGRlc3Q7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGQuc25hcHBpbmcgPSBzLnNuYXBwaW5nO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0U25hcHBlZFRvKGVsKSB7XG4gICAgICAgIHZhciBzbmFwcGVkID0gJChlbCkuZGF0YSgnc25hcC1zdGF0ZScpOyAvLyQoZWwpLmRhdGEoJ3VpLWRyYWdnYWJsZScpLnNuYXBFbGVtZW50cztcbiAgICAgICAgdmFyIHNuYXBwZWRUbyA9IFtdO1xuICAgICAgICBpZiAoc25hcHBlZCkge1xuICAgICAgICAgICAgc25hcHBlZFRvID0gJC5tYXAoc25hcHBlZCwgZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBlbGVtZW50LnNuYXBwaW5nID8gZWxlbWVudC5pdGVtIDogbnVsbDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzbmFwcGVkVG87XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0QWxsU25hcHBlZFRvKHJvb3QsIHJlc3VsdCwgY29tcGxldGVkKSB7XG4gICAgICAgIHZhciBzbmFwcGVkVG8gPSBnZXRTbmFwcGVkVG8ocm9vdCk7XG4gICAgICAgIGlmIChjb21wbGV0ZWQuaW5kZXhPZihyb290KSA9PSAtMSkge1xuICAgICAgICAgICAgcmVzdWx0LnB1c2gocm9vdCk7XG4gICAgICAgICAgICBjb21wbGV0ZWQucHVzaChyb290KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc25hcHBlZFRvKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNuYXBwZWRUby5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmIChjb21wbGV0ZWQuaW5kZXhPZihzbmFwcGVkVG9baV0pID09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIGdldEFsbFNuYXBwZWRUbyhzbmFwcGVkVG9baV0sIHJlc3VsdCwgY29tcGxldGVkKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldFVwZ3JhZGUoZWxlbWVudCkge1xuICAgICAgICB2YXIgaXRlbXMgPSBnZXRBbGxTbmFwcGVkVG8oZWxlbWVudCwgW10sIFtdKS5tYXAoZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgcmV0dXJuICQoaXRlbSkuZGF0YSgnY29tcG9uZW50TmFtZScpO1xuICAgICAgICB9KTtcbiAgICAgICAgaXRlbXMgPSBpdGVtcy5zb3J0KCk7XG4gICAgICAgIHZhciBrZXkgPSBpdGVtcy5yZWR1Y2UoZnVuY3Rpb24obWVtbywgaXRlbSkge1xuICAgICAgICAgICAgcmV0dXJuIG1lbW8gKyBpdGVtO1xuICAgICAgICB9LCAnJyk7XG4gICAgICAgIHJldHVybiBoYXNoTWFwVXBncmFkZVtrZXldO1xuICAgIH1cblxufSk7Il19
