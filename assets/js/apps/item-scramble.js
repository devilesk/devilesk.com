require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({20:[function(require,module,exports){
(function (global){
var $ = jQuery = (typeof window !== "undefined" ? window['$'] : typeof global !== "undefined" ? global['$'] : null);
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
//require('bootstrap');
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
            var $component = $('<img>').attr('src', '/media/images/items/' + components[i] + '.png').addClass('component');
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
                                var $upgrade = $('<img>').attr('src', '/media/images/items/' + item + '.png').addClass('upgrade').data('upgradeName', item);
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
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"jquery-ui/ui/data":2,"jquery-ui/ui/ie":3,"jquery-ui/ui/plugin":4,"jquery-ui/ui/safe-active-element":5,"jquery-ui/ui/safe-blur":6,"jquery-ui/ui/scroll-parent":7,"jquery-ui/ui/version":8,"jquery-ui/ui/widget":9,"jquery-ui/ui/widgets/draggable":10,"jquery-ui/ui/widgets/mouse":11,"underscore":16}],16:[function(require,module,exports){
//     Underscore.js 1.8.3
//     http://underscorejs.org
//     (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind,
    nativeCreate       = Object.create;

  // Naked function reference for surrogate-prototype-swapping.
  var Ctor = function(){};

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.8.3';

  // Internal function that returns an efficient (for current engines) version
  // of the passed-in callback, to be repeatedly applied in other Underscore
  // functions.
  var optimizeCb = function(func, context, argCount) {
    if (context === void 0) return func;
    switch (argCount == null ? 3 : argCount) {
      case 1: return function(value) {
        return func.call(context, value);
      };
      case 2: return function(value, other) {
        return func.call(context, value, other);
      };
      case 3: return function(value, index, collection) {
        return func.call(context, value, index, collection);
      };
      case 4: return function(accumulator, value, index, collection) {
        return func.call(context, accumulator, value, index, collection);
      };
    }
    return function() {
      return func.apply(context, arguments);
    };
  };

  // A mostly-internal function to generate callbacks that can be applied
  // to each element in a collection, returning the desired result — either
  // identity, an arbitrary callback, a property matcher, or a property accessor.
  var cb = function(value, context, argCount) {
    if (value == null) return _.identity;
    if (_.isFunction(value)) return optimizeCb(value, context, argCount);
    if (_.isObject(value)) return _.matcher(value);
    return _.property(value);
  };
  _.iteratee = function(value, context) {
    return cb(value, context, Infinity);
  };

  // An internal function for creating assigner functions.
  var createAssigner = function(keysFunc, undefinedOnly) {
    return function(obj) {
      var length = arguments.length;
      if (length < 2 || obj == null) return obj;
      for (var index = 1; index < length; index++) {
        var source = arguments[index],
            keys = keysFunc(source),
            l = keys.length;
        for (var i = 0; i < l; i++) {
          var key = keys[i];
          if (!undefinedOnly || obj[key] === void 0) obj[key] = source[key];
        }
      }
      return obj;
    };
  };

  // An internal function for creating a new object that inherits from another.
  var baseCreate = function(prototype) {
    if (!_.isObject(prototype)) return {};
    if (nativeCreate) return nativeCreate(prototype);
    Ctor.prototype = prototype;
    var result = new Ctor;
    Ctor.prototype = null;
    return result;
  };

  var property = function(key) {
    return function(obj) {
      return obj == null ? void 0 : obj[key];
    };
  };

  // Helper for collection methods to determine whether a collection
  // should be iterated as an array or as an object
  // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
  // Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
  var getLength = property('length');
  var isArrayLike = function(collection) {
    var length = getLength(collection);
    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
  };

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles raw objects in addition to array-likes. Treats all
  // sparse array-likes as if they were dense.
  _.each = _.forEach = function(obj, iteratee, context) {
    iteratee = optimizeCb(iteratee, context);
    var i, length;
    if (isArrayLike(obj)) {
      for (i = 0, length = obj.length; i < length; i++) {
        iteratee(obj[i], i, obj);
      }
    } else {
      var keys = _.keys(obj);
      for (i = 0, length = keys.length; i < length; i++) {
        iteratee(obj[keys[i]], keys[i], obj);
      }
    }
    return obj;
  };

  // Return the results of applying the iteratee to each element.
  _.map = _.collect = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length,
        results = Array(length);
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      results[index] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  };

  // Create a reducing function iterating left or right.
  function createReduce(dir) {
    // Optimized iterator function as using arguments.length
    // in the main function will deoptimize the, see #1991.
    function iterator(obj, iteratee, memo, keys, index, length) {
      for (; index >= 0 && index < length; index += dir) {
        var currentKey = keys ? keys[index] : index;
        memo = iteratee(memo, obj[currentKey], currentKey, obj);
      }
      return memo;
    }

    return function(obj, iteratee, memo, context) {
      iteratee = optimizeCb(iteratee, context, 4);
      var keys = !isArrayLike(obj) && _.keys(obj),
          length = (keys || obj).length,
          index = dir > 0 ? 0 : length - 1;
      // Determine the initial value if none is provided.
      if (arguments.length < 3) {
        memo = obj[keys ? keys[index] : index];
        index += dir;
      }
      return iterator(obj, iteratee, memo, keys, index, length);
    };
  }

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`.
  _.reduce = _.foldl = _.inject = createReduce(1);

  // The right-associative version of reduce, also known as `foldr`.
  _.reduceRight = _.foldr = createReduce(-1);

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, predicate, context) {
    var key;
    if (isArrayLike(obj)) {
      key = _.findIndex(obj, predicate, context);
    } else {
      key = _.findKey(obj, predicate, context);
    }
    if (key !== void 0 && key !== -1) return obj[key];
  };

  // Return all the elements that pass a truth test.
  // Aliased as `select`.
  _.filter = _.select = function(obj, predicate, context) {
    var results = [];
    predicate = cb(predicate, context);
    _.each(obj, function(value, index, list) {
      if (predicate(value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, predicate, context) {
    return _.filter(obj, _.negate(cb(predicate)), context);
  };

  // Determine whether all of the elements match a truth test.
  // Aliased as `all`.
  _.every = _.all = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (!predicate(obj[currentKey], currentKey, obj)) return false;
    }
    return true;
  };

  // Determine if at least one element in the object matches a truth test.
  // Aliased as `any`.
  _.some = _.any = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (predicate(obj[currentKey], currentKey, obj)) return true;
    }
    return false;
  };

  // Determine if the array or object contains a given item (using `===`).
  // Aliased as `includes` and `include`.
  _.contains = _.includes = _.include = function(obj, item, fromIndex, guard) {
    if (!isArrayLike(obj)) obj = _.values(obj);
    if (typeof fromIndex != 'number' || guard) fromIndex = 0;
    return _.indexOf(obj, item, fromIndex) >= 0;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      var func = isFunc ? method : value[method];
      return func == null ? func : func.apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, _.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs) {
    return _.filter(obj, _.matcher(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.find(obj, _.matcher(attrs));
  };

  // Return the maximum element (or element-based computation).
  _.max = function(obj, iteratee, context) {
    var result = -Infinity, lastComputed = -Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value > result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iteratee, context) {
    var result = Infinity, lastComputed = Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value < result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed < lastComputed || computed === Infinity && result === Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Shuffle a collection, using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  _.shuffle = function(obj) {
    var set = isArrayLike(obj) ? obj : _.values(obj);
    var length = set.length;
    var shuffled = Array(length);
    for (var index = 0, rand; index < length; index++) {
      rand = _.random(0, index);
      if (rand !== index) shuffled[index] = shuffled[rand];
      shuffled[rand] = set[index];
    }
    return shuffled;
  };

  // Sample **n** random values from a collection.
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (n == null || guard) {
      if (!isArrayLike(obj)) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }
    return _.shuffle(obj).slice(0, Math.max(0, n));
  };

  // Sort the object's values by a criterion produced by an iteratee.
  _.sortBy = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iteratee(value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior) {
    return function(obj, iteratee, context) {
      var result = {};
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index) {
        var key = iteratee(value, index, obj);
        behavior(result, value, key);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key].push(value); else result[key] = [value];
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, value, key) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key]++; else result[key] = 1;
  });

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (isArrayLike(obj)) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return isArrayLike(obj) ? obj.length : _.keys(obj).length;
  };

  // Split a collection into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  _.partition = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var pass = [], fail = [];
    _.each(obj, function(value, key, obj) {
      (predicate(value, key, obj) ? pass : fail).push(value);
    });
    return [pass, fail];
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[0];
    return _.initial(array, array.length - n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[array.length - 1];
    return _.rest(array, Math.max(0, array.length - n));
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, n == null || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, strict, startIndex) {
    var output = [], idx = 0;
    for (var i = startIndex || 0, length = getLength(input); i < length; i++) {
      var value = input[i];
      if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
        //flatten current level of array or arguments object
        if (!shallow) value = flatten(value, shallow, strict);
        var j = 0, len = value.length;
        output.length += len;
        while (j < len) {
          output[idx++] = value[j++];
        }
      } else if (!strict) {
        output[idx++] = value;
      }
    }
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, false);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iteratee, context) {
    if (!_.isBoolean(isSorted)) {
      context = iteratee;
      iteratee = isSorted;
      isSorted = false;
    }
    if (iteratee != null) iteratee = cb(iteratee, context);
    var result = [];
    var seen = [];
    for (var i = 0, length = getLength(array); i < length; i++) {
      var value = array[i],
          computed = iteratee ? iteratee(value, i, array) : value;
      if (isSorted) {
        if (!i || seen !== computed) result.push(value);
        seen = computed;
      } else if (iteratee) {
        if (!_.contains(seen, computed)) {
          seen.push(computed);
          result.push(value);
        }
      } else if (!_.contains(result, value)) {
        result.push(value);
      }
    }
    return result;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(flatten(arguments, true, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var result = [];
    var argsLength = arguments.length;
    for (var i = 0, length = getLength(array); i < length; i++) {
      var item = array[i];
      if (_.contains(result, item)) continue;
      for (var j = 1; j < argsLength; j++) {
        if (!_.contains(arguments[j], item)) break;
      }
      if (j === argsLength) result.push(item);
    }
    return result;
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = flatten(arguments, true, true, 1);
    return _.filter(array, function(value){
      return !_.contains(rest, value);
    });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    return _.unzip(arguments);
  };

  // Complement of _.zip. Unzip accepts an array of arrays and groups
  // each array's elements on shared indices
  _.unzip = function(array) {
    var length = array && _.max(array, getLength).length || 0;
    var result = Array(length);

    for (var index = 0; index < length; index++) {
      result[index] = _.pluck(array, index);
    }
    return result;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    var result = {};
    for (var i = 0, length = getLength(list); i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // Generator function to create the findIndex and findLastIndex functions
  function createPredicateIndexFinder(dir) {
    return function(array, predicate, context) {
      predicate = cb(predicate, context);
      var length = getLength(array);
      var index = dir > 0 ? 0 : length - 1;
      for (; index >= 0 && index < length; index += dir) {
        if (predicate(array[index], index, array)) return index;
      }
      return -1;
    };
  }

  // Returns the first index on an array-like that passes a predicate test
  _.findIndex = createPredicateIndexFinder(1);
  _.findLastIndex = createPredicateIndexFinder(-1);

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iteratee, context) {
    iteratee = cb(iteratee, context, 1);
    var value = iteratee(obj);
    var low = 0, high = getLength(array);
    while (low < high) {
      var mid = Math.floor((low + high) / 2);
      if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
    }
    return low;
  };

  // Generator function to create the indexOf and lastIndexOf functions
  function createIndexFinder(dir, predicateFind, sortedIndex) {
    return function(array, item, idx) {
      var i = 0, length = getLength(array);
      if (typeof idx == 'number') {
        if (dir > 0) {
            i = idx >= 0 ? idx : Math.max(idx + length, i);
        } else {
            length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
        }
      } else if (sortedIndex && idx && length) {
        idx = sortedIndex(array, item);
        return array[idx] === item ? idx : -1;
      }
      if (item !== item) {
        idx = predicateFind(slice.call(array, i, length), _.isNaN);
        return idx >= 0 ? idx + i : -1;
      }
      for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
        if (array[idx] === item) return idx;
      }
      return -1;
    };
  }

  // Return the position of the first occurrence of an item in an array,
  // or -1 if the item is not included in the array.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
  _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (stop == null) {
      stop = start || 0;
      start = 0;
    }
    step = step || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var range = Array(length);

    for (var idx = 0; idx < length; idx++, start += step) {
      range[idx] = start;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Determines whether to execute a function as a constructor
  // or a normal function with the provided arguments
  var executeBound = function(sourceFunc, boundFunc, context, callingContext, args) {
    if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
    var self = baseCreate(sourceFunc.prototype);
    var result = sourceFunc.apply(self, args);
    if (_.isObject(result)) return result;
    return self;
  };

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
    var args = slice.call(arguments, 2);
    var bound = function() {
      return executeBound(func, bound, context, this, args.concat(slice.call(arguments)));
    };
    return bound;
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder, allowing any combination of arguments to be pre-filled.
  _.partial = function(func) {
    var boundArgs = slice.call(arguments, 1);
    var bound = function() {
      var position = 0, length = boundArgs.length;
      var args = Array(length);
      for (var i = 0; i < length; i++) {
        args[i] = boundArgs[i] === _ ? arguments[position++] : boundArgs[i];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return executeBound(func, bound, this, this, args);
    };
    return bound;
  };

  // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.
  _.bindAll = function(obj) {
    var i, length = arguments.length, key;
    if (length <= 1) throw new Error('bindAll must be passed function names');
    for (i = 1; i < length; i++) {
      key = arguments[i];
      obj[key] = _.bind(obj[key], obj);
    }
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memoize = function(key) {
      var cache = memoize.cache;
      var address = '' + (hasher ? hasher.apply(this, arguments) : key);
      if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
      return cache[address];
    };
    memoize.cache = {};
    return memoize;
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){
      return func.apply(null, args);
    }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = _.partial(_.delay, _, 1);

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    if (!options) options = {};
    var later = function() {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };
    return function() {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
      var last = _.now() - timestamp;

      if (last < wait && last >= 0) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          if (!timeout) context = args = null;
        }
      }
    };

    return function() {
      context = this;
      args = arguments;
      timestamp = _.now();
      var callNow = immediate && !timeout;
      if (!timeout) timeout = setTimeout(later, wait);
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return _.partial(wrapper, func);
  };

  // Returns a negated version of the passed-in predicate.
  _.negate = function(predicate) {
    return function() {
      return !predicate.apply(this, arguments);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var args = arguments;
    var start = args.length - 1;
    return function() {
      var i = start;
      var result = args[start].apply(this, arguments);
      while (i--) result = args[i].call(this, result);
      return result;
    };
  };

  // Returns a function that will only be executed on and after the Nth call.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Returns a function that will only be executed up to (but not including) the Nth call.
  _.before = function(times, func) {
    var memo;
    return function() {
      if (--times > 0) {
        memo = func.apply(this, arguments);
      }
      if (times <= 1) func = null;
      return memo;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = _.partial(_.before, 2);

  // Object Functions
  // ----------------

  // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
  var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
  var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
                      'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

  function collectNonEnumProps(obj, keys) {
    var nonEnumIdx = nonEnumerableProps.length;
    var constructor = obj.constructor;
    var proto = (_.isFunction(constructor) && constructor.prototype) || ObjProto;

    // Constructor is a special case.
    var prop = 'constructor';
    if (_.has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

    while (nonEnumIdx--) {
      prop = nonEnumerableProps[nonEnumIdx];
      if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
        keys.push(prop);
      }
    }
  }

  // Retrieve the names of an object's own properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve all the property names of an object.
  _.allKeys = function(obj) {
    if (!_.isObject(obj)) return [];
    var keys = [];
    for (var key in obj) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Returns the results of applying the iteratee to each element of the object
  // In contrast to _.map it returns an object
  _.mapObject = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys =  _.keys(obj),
          length = keys.length,
          results = {},
          currentKey;
      for (var index = 0; index < length; index++) {
        currentKey = keys[index];
        results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
      }
      return results;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = createAssigner(_.allKeys);

  // Assigns a given object with all the own properties in the passed-in object(s)
  // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
  _.extendOwn = _.assign = createAssigner(_.keys);

  // Returns the first key on an object that passes a predicate test
  _.findKey = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = _.keys(obj), key;
    for (var i = 0, length = keys.length; i < length; i++) {
      key = keys[i];
      if (predicate(obj[key], key, obj)) return key;
    }
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(object, oiteratee, context) {
    var result = {}, obj = object, iteratee, keys;
    if (obj == null) return result;
    if (_.isFunction(oiteratee)) {
      keys = _.allKeys(obj);
      iteratee = optimizeCb(oiteratee, context);
    } else {
      keys = flatten(arguments, false, false, 1);
      iteratee = function(value, key, obj) { return key in obj; };
      obj = Object(obj);
    }
    for (var i = 0, length = keys.length; i < length; i++) {
      var key = keys[i];
      var value = obj[key];
      if (iteratee(value, key, obj)) result[key] = value;
    }
    return result;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj, iteratee, context) {
    if (_.isFunction(iteratee)) {
      iteratee = _.negate(iteratee);
    } else {
      var keys = _.map(flatten(arguments, false, false, 1), String);
      iteratee = function(value, key) {
        return !_.contains(keys, key);
      };
    }
    return _.pick(obj, iteratee, context);
  };

  // Fill in a given object with default properties.
  _.defaults = createAssigner(_.allKeys, true);

  // Creates an object that inherits from the given prototype object.
  // If additional properties are provided then they will be added to the
  // created object.
  _.create = function(prototype, props) {
    var result = baseCreate(prototype);
    if (props) _.extendOwn(result, props);
    return result;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Returns whether an object has a given set of `key:value` pairs.
  _.isMatch = function(object, attrs) {
    var keys = _.keys(attrs), length = keys.length;
    if (object == null) return !length;
    var obj = Object(object);
    for (var i = 0; i < length; i++) {
      var key = keys[i];
      if (attrs[key] !== obj[key] || !(key in obj)) return false;
    }
    return true;
  };


  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a === 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className !== toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
      case '[object RegExp]':
      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return '' + a === '' + b;
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive.
        // Object(NaN) is equivalent to NaN
        if (+a !== +a) return +b !== +b;
        // An `egal` comparison is performed for other numeric values.
        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a === +b;
    }

    var areArrays = className === '[object Array]';
    if (!areArrays) {
      if (typeof a != 'object' || typeof b != 'object') return false;

      // Objects with different constructors are not equivalent, but `Object`s or `Array`s
      // from different frames are.
      var aCtor = a.constructor, bCtor = b.constructor;
      if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
                               _.isFunction(bCtor) && bCtor instanceof bCtor)
                          && ('constructor' in a && 'constructor' in b)) {
        return false;
      }
    }
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

    // Initializing stack of traversed objects.
    // It's done here since we only need them for objects and arrays comparison.
    aStack = aStack || [];
    bStack = bStack || [];
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] === a) return bStack[length] === b;
    }

    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);

    // Recursively compare objects and arrays.
    if (areArrays) {
      // Compare array lengths to determine if a deep comparison is necessary.
      length = a.length;
      if (length !== b.length) return false;
      // Deep compare the contents, ignoring non-numeric properties.
      while (length--) {
        if (!eq(a[length], b[length], aStack, bStack)) return false;
      }
    } else {
      // Deep compare objects.
      var keys = _.keys(a), key;
      length = keys.length;
      // Ensure that both objects contain the same number of properties before comparing deep equality.
      if (_.keys(b).length !== length) return false;
      while (length--) {
        // Deep compare each member
        key = keys[length];
        if (!(_.has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return true;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
    return _.keys(obj).length === 0;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) === '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError.
  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) === '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE < 9), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return _.has(obj, 'callee');
    };
  }

  // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
  // IE 11 (#1621), and in Safari 8 (#1929).
  if (typeof /./ != 'function' && typeof Int8Array != 'object') {
    _.isFunction = function(obj) {
      return typeof obj == 'function' || false;
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj !== +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return obj != null && hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iteratees.
  _.identity = function(value) {
    return value;
  };

  // Predicate-generating functions. Often useful outside of Underscore.
  _.constant = function(value) {
    return function() {
      return value;
    };
  };

  _.noop = function(){};

  _.property = property;

  // Generates a function for a given object that returns a given property.
  _.propertyOf = function(obj) {
    return obj == null ? function(){} : function(key) {
      return obj[key];
    };
  };

  // Returns a predicate for checking whether an object has a given set of
  // `key:value` pairs.
  _.matcher = _.matches = function(attrs) {
    attrs = _.extendOwn({}, attrs);
    return function(obj) {
      return _.isMatch(obj, attrs);
    };
  };

  // Run a function **n** times.
  _.times = function(n, iteratee, context) {
    var accum = Array(Math.max(0, n));
    iteratee = optimizeCb(iteratee, context, 1);
    for (var i = 0; i < n; i++) accum[i] = iteratee(i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // A (possibly faster) way to get the current timestamp as an integer.
  _.now = Date.now || function() {
    return new Date().getTime();
  };

   // List of HTML entities for escaping.
  var escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
  };
  var unescapeMap = _.invert(escapeMap);

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  var createEscaper = function(map) {
    var escaper = function(match) {
      return map[match];
    };
    // Regexes for identifying a key that needs to be escaped
    var source = '(?:' + _.keys(map).join('|') + ')';
    var testRegexp = RegExp(source);
    var replaceRegexp = RegExp(source, 'g');
    return function(string) {
      string = string == null ? '' : '' + string;
      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
    };
  };
  _.escape = createEscaper(escapeMap);
  _.unescape = createEscaper(unescapeMap);

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property, fallback) {
    var value = object == null ? void 0 : object[property];
    if (value === void 0) {
      value = fallback;
    }
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

  var escapeChar = function(match) {
    return '\\' + escapes[match];
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  // NB: `oldSettings` only exists for backwards compatibility.
  _.template = function(text, settings, oldSettings) {
    if (!settings && oldSettings) settings = oldSettings;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset).replace(escaper, escapeChar);
      index = offset + match.length;

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      } else if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      } else if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }

      // Adobe VMs need the match returned to produce the correct offest.
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + 'return __p;\n';

    try {
      var render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled source as a convenience for precompilation.
    var argument = settings.variable || 'obj';
    template.source = 'function(' + argument + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function. Start chaining a wrapped Underscore object.
  _.chain = function(obj) {
    var instance = _(obj);
    instance._chain = true;
    return instance;
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(instance, obj) {
    return instance._chain ? _(obj).chain() : obj;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    _.each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result(this, func.apply(_, args));
      };
    });
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
      return result(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  _.each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result(this, method.apply(this._wrapped, arguments));
    };
  });

  // Extracts the result from a wrapped and chained object.
  _.prototype.value = function() {
    return this._wrapped;
  };

  // Provide unwrapping proxy for some methods used in engine operations
  // such as arithmetic and JSON stringification.
  _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

  _.prototype.toString = function() {
    return '' + this._wrapped;
  };

  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (typeof define === 'function' && define.amd) {
    define('underscore', [], function() {
      return _;
    });
  }
}.call(this));

},{}],11:[function(require,module,exports){
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

},{}]},{},[20])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYXBwcy9pdGVtLXNjcmFtYmxlLmpzIiwibm9kZV9tb2R1bGVzL3VuZGVyc2NvcmUvdW5kZXJzY29yZS5qcyIsIm5vZGVfbW9kdWxlcy9qcXVlcnktdWkvdWkvd2lkZ2V0cy9tb3VzZS5qcyIsIm5vZGVfbW9kdWxlcy9qcXVlcnktdWkvdWkvd2lkZ2V0cy9kcmFnZ2FibGUuanMiLCJub2RlX21vZHVsZXMvanF1ZXJ5LXVpL3VpL3dpZGdldC5qcyIsIm5vZGVfbW9kdWxlcy9qcXVlcnktdWkvdWkvdmVyc2lvbi5qcyIsIm5vZGVfbW9kdWxlcy9qcXVlcnktdWkvdWkvc2Nyb2xsLXBhcmVudC5qcyIsIm5vZGVfbW9kdWxlcy9qcXVlcnktdWkvdWkvc2FmZS1ibHVyLmpzIiwibm9kZV9tb2R1bGVzL2pxdWVyeS11aS91aS9zYWZlLWFjdGl2ZS1lbGVtZW50LmpzIiwibm9kZV9tb2R1bGVzL2pxdWVyeS11aS91aS9wbHVnaW4uanMiLCJub2RlX21vZHVsZXMvanF1ZXJ5LXVpL3VpL2llLmpzIiwibm9kZV9tb2R1bGVzL2pxdWVyeS11aS91aS9kYXRhLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3pSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Z0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbE9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsdUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgJCA9IGpRdWVyeSA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WyckJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyckJ10gOiBudWxsKTtcbnJlcXVpcmUoJ2pxdWVyeS11aS91aS92ZXJzaW9uJyk7XG5yZXF1aXJlKCdqcXVlcnktdWkvdWkvaWUnKTtcbnJlcXVpcmUoJ2pxdWVyeS11aS91aS9kYXRhJyk7XG5yZXF1aXJlKCdqcXVlcnktdWkvdWkvcGx1Z2luJyk7XG5yZXF1aXJlKCdqcXVlcnktdWkvdWkvc2FmZS1hY3RpdmUtZWxlbWVudCcpO1xucmVxdWlyZSgnanF1ZXJ5LXVpL3VpL3NhZmUtYmx1cicpO1xucmVxdWlyZSgnanF1ZXJ5LXVpL3VpL3Njcm9sbC1wYXJlbnQnKTtcbnJlcXVpcmUoJ2pxdWVyeS11aS91aS93aWRnZXQnKTtcbnJlcXVpcmUoJ2pxdWVyeS11aS91aS93aWRnZXRzL21vdXNlJyk7XG5yZXF1aXJlKCdqcXVlcnktdWkvdWkvd2lkZ2V0cy9kcmFnZ2FibGUnKTtcbi8vcmVxdWlyZSgnYm9vdHN0cmFwJyk7XG52YXIgXyA9IHJlcXVpcmUoJ3VuZGVyc2NvcmUnKTtcblxuJChmdW5jdGlvbigpIHtcbiAgICB2YXIgTlVNX0lURU1TID0gNSxcbiAgICAgICAgaXRlbUJhc2ljID0gW10sXG4gICAgICAgIGl0ZW1VcGdyYWRlID0gW10sXG4gICAgICAgIGhhc2hNYXBVcGdyYWRlID0ge30sXG4gICAgICAgIGl0ZW1zLFxuICAgICAgICBjb21wb25lbnRzLFxuICAgICAgICBjb21wb25lbnRzTGlzdCxcbiAgICAgICAgYW5zd2VyO1xuXG4gICAgJC5nZXRKU09OKFwiL21lZGlhL2RvdGEtanNvbi9pdGVtZGF0YS5qc29uXCIsIGZ1bmN0aW9uKGl0ZW1kYXRhKSB7XG4gICAgICAgIGRlbGV0ZSBpdGVtZGF0YVsnaXRlbV93YXJkX2Rpc3BlbnNlciddO1xuICAgICAgICBkZWxldGUgaXRlbWRhdGFbJ2l0ZW1fcmVjaXBlX3dhcmRfZGlzcGVuc2VyJ107XG4gICAgICAgIFxuICAgICAgICB2YXIgdXBncmFkZXMgPSBbXSxcbiAgICAgICAgICAgIHJlY2lwZXMgPSB7fTtcblxuICAgICAgICBmdW5jdGlvbiBnZXRBbGxDb21wb25lbnRzKGkpIHtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICAgICAgICAgIGlmICh1cGdyYWRlcy5pbmRleE9mKGkpID09IC0xKSB7XG4gICAgICAgICAgICAgICAgaWYgKGkuaW5kZXhPZignaXRlbV9yZWNpcGVfJykgPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goaS5yZXBsYWNlKCdpdGVtXycsICcnKSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goJ3JlY2lwZScpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LmNvbmNhdChcbiAgICAgICAgICAgICAgICAgICAgaXRlbWRhdGFbcmVjaXBlc1tpXV0uSXRlbVJlcXVpcmVtZW50cy5tYXAoZ2V0QWxsQ29tcG9uZW50cykucmVkdWNlKGZ1bmN0aW9uKG1lbW8sIGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtZW1vLmNvbmNhdChsKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgW10pXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKHZhciBpIGluIGl0ZW1kYXRhKSB7XG4gICAgICAgICAgICBpZiAoaXRlbWRhdGFbaV0uSXRlbVJlY2lwZSkge1xuICAgICAgICAgICAgICAgIHVwZ3JhZGVzLnB1c2goaXRlbWRhdGFbaV0uSXRlbVJlc3VsdCk7XG4gICAgICAgICAgICAgICAgcmVjaXBlc1tpdGVtZGF0YVtpXS5JdGVtUmVzdWx0XSA9IGk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKHZhciBpIGluIGl0ZW1kYXRhKSB7XG4gICAgICAgICAgICBpZiAoaXRlbWRhdGFbaV0uSXRlbVJlY2lwZSkge1xuICAgICAgICAgICAgICAgIGl0ZW1VcGdyYWRlLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBcIm5hbWVcIjogaXRlbWRhdGFbaV0uSXRlbVJlc3VsdC5yZXBsYWNlKCdpdGVtXycsICcnKSxcbiAgICAgICAgICAgICAgICAgICAgXCJjb21wb25lbnRzXCI6IGl0ZW1kYXRhW2ldLkl0ZW1SZXF1aXJlbWVudHMubWFwKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBpdGVtLmluZGV4T2YoJ2l0ZW1fcmVjaXBlXycpID09IC0xID8gaXRlbS5yZXBsYWNlKCdpdGVtXycsICcnKSA6ICdyZWNpcGUnO1xuICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgXCJjb3N0XCI6IGl0ZW1kYXRhW2l0ZW1kYXRhW2ldLkl0ZW1SZXN1bHRdLml0ZW1jb3N0LFxuICAgICAgICAgICAgICAgICAgICBcImFsbENvbXBvbmVudHNcIjogZ2V0QWxsQ29tcG9uZW50cyhpdGVtZGF0YVtpXS5JdGVtUmVzdWx0KVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh1cGdyYWRlcy5pbmRleE9mKGkpID09IC0xICYmIGkuaW5kZXhPZignd2ludGVyXycpID09IC0xICYmIGkuaW5kZXhPZignZ3JlZXZpbF8nKSA9PSAtMSAmJiBpLmluZGV4T2YoJ2hhbGxvd2Vlbl8nKSA9PSAtMSAmJiBpLmluZGV4T2YoJ215c3RlcnlfJykgPT0gLTEpIHtcbiAgICAgICAgICAgICAgICBpdGVtQmFzaWMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIFwibmFtZVwiOiBpdGVtZGF0YVtpXS5uYW1lLnJlcGxhY2UoJ2l0ZW1fJywgJycpLFxuICAgICAgICAgICAgICAgICAgICBcImNvbXBvbmVudHNcIjogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgXCJjb3N0XCI6IGl0ZW1kYXRhW2ldLml0ZW1jb3N0XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpdGVtVXBncmFkZS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIGtleSA9IGl0ZW1VcGdyYWRlW2ldLmFsbENvbXBvbmVudHMuc29ydCgpLnJlZHVjZShmdW5jdGlvbihtZW1vLCBpdGVtKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG1lbW8gKyBpdGVtO1xuICAgICAgICAgICAgfSwgJycpO1xuICAgICAgICAgICAgaGFzaE1hcFVwZ3JhZGVba2V5XSA9IGl0ZW1VcGdyYWRlW2ldLm5hbWU7XG4gICAgICAgIH1cblxuICAgICAgICBnZW5lcmF0ZVF1ZXN0aW9uKCk7XG4gICAgfSk7XG5cbiAgICBmdW5jdGlvbiBzaHVmZmxlKGFycmF5KSB7XG4gICAgICAgIHZhciBjb3VudGVyID0gYXJyYXkubGVuZ3RoLFxuICAgICAgICAgICAgdGVtcCwgaW5kZXg7XG5cbiAgICAgICAgLy8gV2hpbGUgdGhlcmUgYXJlIGVsZW1lbnRzIGluIHRoZSBhcnJheVxuICAgICAgICB3aGlsZSAoY291bnRlciA+IDApIHtcbiAgICAgICAgICAgIC8vIFBpY2sgYSByYW5kb20gaW5kZXhcbiAgICAgICAgICAgIGluZGV4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogY291bnRlcik7XG5cbiAgICAgICAgICAgIC8vIERlY3JlYXNlIGNvdW50ZXIgYnkgMVxuICAgICAgICAgICAgY291bnRlci0tO1xuXG4gICAgICAgICAgICAvLyBBbmQgc3dhcCB0aGUgbGFzdCBlbGVtZW50IHdpdGggaXRcbiAgICAgICAgICAgIHRlbXAgPSBhcnJheVtjb3VudGVyXTtcbiAgICAgICAgICAgIGFycmF5W2NvdW50ZXJdID0gYXJyYXlbaW5kZXhdO1xuICAgICAgICAgICAgYXJyYXlbaW5kZXhdID0gdGVtcDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBhcnJheTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gZ2VuZXJhdGVRdWVzdGlvbigpIHtcblxuICAgICAgICBpdGVtcyA9IF8uc29ydEJ5KF8uc2FtcGxlKGl0ZW1VcGdyYWRlLCBOVU1fSVRFTVMpLCBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICByZXR1cm4gaXRlbS5uYW1lO1xuICAgICAgICB9KTtcbiAgICAgICAgYW5zd2VyID0gXy5wbHVjayhpdGVtcywgJ25hbWUnKTtcbiAgICAgICAgY29tcG9uZW50cyA9IGl0ZW1zLnJlZHVjZShmdW5jdGlvbihtZW1vLCBpdGVtKSB7XG4gICAgICAgICAgICByZXR1cm4gbWVtby5jb25jYXQoaXRlbS5hbGxDb21wb25lbnRzKTtcbiAgICAgICAgfSwgW10pO1xuICAgICAgICBjb21wb25lbnRzTGlzdCA9IFtdO1xuICAgICAgICBzaHVmZmxlKGNvbXBvbmVudHMpO1xuICAgICAgICAkKCcjY29tcG9uZW50cy1jb250YWluZXInKS5lbXB0eSgpO1xuICAgICAgICAvLyQoJyN1cGdyYWRlcy1jb250YWluZXInKS5lbXB0eSgpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvbXBvbmVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciAkY29tcG9uZW50ID0gJCgnPGltZz4nKS5hdHRyKCdzcmMnLCAnL21lZGlhL2ltYWdlcy9pdGVtcy8nICsgY29tcG9uZW50c1tpXSArICcucG5nJykuYWRkQ2xhc3MoJ2NvbXBvbmVudCcpO1xuICAgICAgICAgICAgJGNvbXBvbmVudC5kYXRhKCdjb21wb25lbnROYW1lJywgY29tcG9uZW50c1tpXSk7XG4gICAgICAgICAgICBjb21wb25lbnRzTGlzdC5wdXNoKCRjb21wb25lbnQpO1xuICAgICAgICAgICAgJGNvbXBvbmVudC5kcmFnZ2FibGUoe1xuICAgICAgICAgICAgICAgIHNuYXA6IHRydWUsXG4gICAgICAgICAgICAgICAgc3RvcDogZnVuY3Rpb24oZXZlbnQsIHVpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHZhciBzbmFwcGVkID0gJCh0aGlzKS5kYXRhKCd1aS1kcmFnZ2FibGUnKS5zbmFwRWxlbWVudHM7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzbmFwcGVkU3RhcnQgPSAkKHRoaXMpLmRhdGEoJ3NuYXAtc3RhdGUnKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBnZXQgZGlmZmVyZW5jZSBiZXR3ZWVuIG5ldyBzbmFwIHN0YXRlIGFuZCBvbGQgc25hcCBzdGF0ZVxuICAgICAgICAgICAgICAgICAgICBzbmFwRGlmZiA9IF8ucGx1Y2soc25hcHBlZC5maWx0ZXIoZnVuY3Rpb24oZWxlbWVudCwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAhc25hcHBlZFtpbmRleF0uc25hcHBpbmcgPT0gc25hcHBlZFN0YXJ0W2luZGV4XS5zbmFwcGluZztcbiAgICAgICAgICAgICAgICAgICAgfSksICdpdGVtJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gc2V0IHNuYXAtc3RhdGUgdG8gbmV3IHNuYXAgc3RhdGVcbiAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5kYXRhKCdzbmFwLXN0YXRlJywgJCh0aGlzKS5kYXRhKCd1aS1kcmFnZ2FibGUnKS5zbmFwRWxlbWVudHMpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIHVwZGF0ZSBzdGF0ZSBvZiBvdGhlciBjb21wb25lbnRzXG4gICAgICAgICAgICAgICAgICAgIHNuYXBEaWZmLmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlU25hcHBlZChzZWxmLCBlbGVtZW50KTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gZ2V0IGxpc3Qgb2YgdXBncmFkZSBpdGVtc1xuICAgICAgICAgICAgICAgICAgICB2YXIgY29tcG9uZW50SXRlbXMgPSBjb21wb25lbnRzTGlzdC5tYXAoZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGl0ZW1bMF1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjb21wbGV0ZWRVcGdyYWRlcyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICB3aGlsZSAoY29tcG9uZW50SXRlbXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHUgPSBnZXRVcGdyYWRlKGNvbXBvbmVudEl0ZW1zWzBdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh1KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcGxldGVkVXBncmFkZXMucHVzaCh1KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudEl0ZW1zID0gXy5kaWZmZXJlbmNlKGNvbXBvbmVudEl0ZW1zLCBnZXRBbGxTbmFwcGVkVG8oY29tcG9uZW50SXRlbXNbMF0sIFtdLCBbXSkpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gdXBkYXRlIHVwZ3JhZGVzIGNvbnRhaW5lclxuICAgICAgICAgICAgICAgICAgICAvLyQoJyN1cGdyYWRlcy1jb250YWluZXInKS5lbXB0eSgpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgdXBncmFkZXMgPSAkKFwiLnVwZ3JhZGVcIikubWFwKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICQodGhpcykuZGF0YSgndXBncmFkZU5hbWUnKTtcbiAgICAgICAgICAgICAgICAgICAgfSkuZ2V0KCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb21wbGV0ZWRVcGdyYWRlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wbGV0ZWRVcGdyYWRlcy5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodXBncmFkZXMuaW5kZXhPZihpdGVtKSA9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgJHVwZ3JhZGUgPSAkKCc8aW1nPicpLmF0dHIoJ3NyYycsICcvbWVkaWEvaW1hZ2VzL2l0ZW1zLycgKyBpdGVtICsgJy5wbmcnKS5hZGRDbGFzcygndXBncmFkZScpLmRhdGEoJ3VwZ3JhZGVOYW1lJywgaXRlbSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoJyN1cGdyYWRlcy1jb250YWluZXInKS5hcHBlbmQoJHVwZ3JhZGUuaGlkZSgpLmZhZGVJbig1MDApKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGdyYWRlcy5zcGxpY2UodXBncmFkZXMuaW5kZXhPZihpdGVtKSwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAkKFwiLnVwZ3JhZGVcIikuZWFjaChmdW5jdGlvbihpbmRleCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh1cGdyYWRlcy5pbmRleE9mKCQodGhpcykuZGF0YSgndXBncmFkZU5hbWUnKSkgIT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBncmFkZXMuc3BsaWNlKHVwZ3JhZGVzLmluZGV4T2YoJCh0aGlzKS5kYXRhKCd1cGdyYWRlTmFtZScpKSwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcjdXBncmFkZXMtY29udGFpbmVyJykuZW1wdHkoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIGdldCBsaXN0IG9mIHVudXNlZCBjb21wb25lbnRzXG4gICAgICAgICAgICAgICAgICAgIHZhciBzaW5nbGVDb21wb25lbnRzID0gY29tcG9uZW50c0xpc3QucmVkdWNlKGZ1bmN0aW9uKG1lbW8sIGl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghZ2V0VXBncmFkZShpdGVtWzBdKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lbW8ucHVzaChpdGVtKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtZW1vO1xuICAgICAgICAgICAgICAgICAgICB9LCBbXSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gdXBkYXRlIGNvbWJpbmVkIGNsYXNzXG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudHNMaXN0LmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNpbmdsZUNvbXBvbmVudHMuaW5kZXhPZihlbGVtZW50KSA9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoJ2NvbWJpbmVkJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlQ2xhc3MoJ2NvbWJpbmVkJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGNoZWNrIGlmIGZpbmlzaGVkXG4gICAgICAgICAgICAgICAgICAgIC8vaWYgKF8uZGlmZmVyZW5jZShhbnN3ZXIsIGNvbXBsZXRlZFVwZ3JhZGVzKS5sZW5ndGggPT0gMCB8fCAoc2luZ2xlQ29tcG9uZW50cy5sZW5ndGggPT0gMCAmJiBfLmV2ZXJ5KGNvbXBsZXRlZFVwZ3JhZGVzLCBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICgoc2luZ2xlQ29tcG9uZW50cy5sZW5ndGggPT0gMCAmJiBjb21wbGV0ZWRVcGdyYWRlcy5ldmVyeShmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF8uZmluZChpdGVtVXBncmFkZSwgZnVuY3Rpb24oaSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaS5uYW1lID09IGl0ZW07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0aW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJC53aGVuKCQoJy51cGdyYWRlJykuZmFkZU91dCg1MDApKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBnZW5lcmF0ZVF1ZXN0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LCAxMDAwKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgJCgnI2NvbXBvbmVudHMtY29udGFpbmVyJykuYXBwZW5kKCRjb21wb25lbnQuaGlkZSgpLmZhZGVJbig1MDApKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGluaXQgZWFjaCBjb21wb25lbnQncyBzbmFwIHN0YXRlXG4gICAgICAgIGNvbXBvbmVudHNMaXN0LmZvckVhY2goZnVuY3Rpb24oJGNvbXBvbmVudCkge1xuICAgICAgICAgICAgJGNvbXBvbmVudC5kYXRhKCdzbmFwLXN0YXRlJywgY29tcG9uZW50c0xpc3QucmVkdWNlKGZ1bmN0aW9uKG1lbW8sIGl0ZW0pIHtcbiAgICAgICAgICAgICAgICBpZiAoJGNvbXBvbmVudCAhPSBpdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgIG1lbW8ucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAnaXRlbSc6IGl0ZW1bMF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAnc25hcHBpbmcnOiBmYWxzZVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIG1lbW87XG4gICAgICAgICAgICB9LCBbXSkpO1xuICAgICAgICB9KTtcblxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHVwZGF0ZVNuYXBwZWQoc3JjLCBkZXN0KSB7XG4gICAgICAgIGlmICgkKGRlc3QpLmRhdGEoJ3NuYXAtc3RhdGUnKSkge1xuICAgICAgICAgICAgdmFyIGQgPSBfLmZpbmQoJChkZXN0KS5kYXRhKCdzbmFwLXN0YXRlJyksIGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaXRlbS5pdGVtID09IHNyYztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdmFyIHMgPSBfLmZpbmQoJChzcmMpLmRhdGEoJ3NuYXAtc3RhdGUnKSwgZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBpdGVtLml0ZW0gPT0gZGVzdDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZC5zbmFwcGluZyA9IHMuc25hcHBpbmc7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRTbmFwcGVkVG8oZWwpIHtcbiAgICAgICAgdmFyIHNuYXBwZWQgPSAkKGVsKS5kYXRhKCdzbmFwLXN0YXRlJyk7IC8vJChlbCkuZGF0YSgndWktZHJhZ2dhYmxlJykuc25hcEVsZW1lbnRzO1xuICAgICAgICB2YXIgc25hcHBlZFRvID0gW107XG4gICAgICAgIGlmIChzbmFwcGVkKSB7XG4gICAgICAgICAgICBzbmFwcGVkVG8gPSAkLm1hcChzbmFwcGVkLCBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQuc25hcHBpbmcgPyBlbGVtZW50Lml0ZW0gOiBudWxsO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHNuYXBwZWRUbztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRBbGxTbmFwcGVkVG8ocm9vdCwgcmVzdWx0LCBjb21wbGV0ZWQpIHtcbiAgICAgICAgdmFyIHNuYXBwZWRUbyA9IGdldFNuYXBwZWRUbyhyb290KTtcbiAgICAgICAgaWYgKGNvbXBsZXRlZC5pbmRleE9mKHJvb3QpID09IC0xKSB7XG4gICAgICAgICAgICByZXN1bHQucHVzaChyb290KTtcbiAgICAgICAgICAgIGNvbXBsZXRlZC5wdXNoKHJvb3QpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzbmFwcGVkVG8pIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc25hcHBlZFRvLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKGNvbXBsZXRlZC5pbmRleE9mKHNuYXBwZWRUb1tpXSkgPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgZ2V0QWxsU25hcHBlZFRvKHNuYXBwZWRUb1tpXSwgcmVzdWx0LCBjb21wbGV0ZWQpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0VXBncmFkZShlbGVtZW50KSB7XG4gICAgICAgIHZhciBpdGVtcyA9IGdldEFsbFNuYXBwZWRUbyhlbGVtZW50LCBbXSwgW10pLm1hcChmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICByZXR1cm4gJChpdGVtKS5kYXRhKCdjb21wb25lbnROYW1lJyk7XG4gICAgICAgIH0pO1xuICAgICAgICBpdGVtcyA9IGl0ZW1zLnNvcnQoKTtcbiAgICAgICAgdmFyIGtleSA9IGl0ZW1zLnJlZHVjZShmdW5jdGlvbihtZW1vLCBpdGVtKSB7XG4gICAgICAgICAgICByZXR1cm4gbWVtbyArIGl0ZW07XG4gICAgICAgIH0sICcnKTtcbiAgICAgICAgcmV0dXJuIGhhc2hNYXBVcGdyYWRlW2tleV07XG4gICAgfVxuXG59KTsiLCIvLyAgICAgVW5kZXJzY29yZS5qcyAxLjguM1xuLy8gICAgIGh0dHA6Ly91bmRlcnNjb3JlanMub3JnXG4vLyAgICAgKGMpIDIwMDktMjAxNSBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuLy8gICAgIFVuZGVyc2NvcmUgbWF5IGJlIGZyZWVseSBkaXN0cmlidXRlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuXG5cbihmdW5jdGlvbigpIHtcblxuICAvLyBCYXNlbGluZSBzZXR1cFxuICAvLyAtLS0tLS0tLS0tLS0tLVxuXG4gIC8vIEVzdGFibGlzaCB0aGUgcm9vdCBvYmplY3QsIGB3aW5kb3dgIGluIHRoZSBicm93c2VyLCBvciBgZXhwb3J0c2Agb24gdGhlIHNlcnZlci5cbiAgdmFyIHJvb3QgPSB0aGlzO1xuXG4gIC8vIFNhdmUgdGhlIHByZXZpb3VzIHZhbHVlIG9mIHRoZSBgX2AgdmFyaWFibGUuXG4gIHZhciBwcmV2aW91c1VuZGVyc2NvcmUgPSByb290Ll87XG5cbiAgLy8gU2F2ZSBieXRlcyBpbiB0aGUgbWluaWZpZWQgKGJ1dCBub3QgZ3ppcHBlZCkgdmVyc2lvbjpcbiAgdmFyIEFycmF5UHJvdG8gPSBBcnJheS5wcm90b3R5cGUsIE9ialByb3RvID0gT2JqZWN0LnByb3RvdHlwZSwgRnVuY1Byb3RvID0gRnVuY3Rpb24ucHJvdG90eXBlO1xuXG4gIC8vIENyZWF0ZSBxdWljayByZWZlcmVuY2UgdmFyaWFibGVzIGZvciBzcGVlZCBhY2Nlc3MgdG8gY29yZSBwcm90b3R5cGVzLlxuICB2YXJcbiAgICBwdXNoICAgICAgICAgICAgID0gQXJyYXlQcm90by5wdXNoLFxuICAgIHNsaWNlICAgICAgICAgICAgPSBBcnJheVByb3RvLnNsaWNlLFxuICAgIHRvU3RyaW5nICAgICAgICAgPSBPYmpQcm90by50b1N0cmluZyxcbiAgICBoYXNPd25Qcm9wZXJ0eSAgID0gT2JqUHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbiAgLy8gQWxsICoqRUNNQVNjcmlwdCA1KiogbmF0aXZlIGZ1bmN0aW9uIGltcGxlbWVudGF0aW9ucyB0aGF0IHdlIGhvcGUgdG8gdXNlXG4gIC8vIGFyZSBkZWNsYXJlZCBoZXJlLlxuICB2YXJcbiAgICBuYXRpdmVJc0FycmF5ICAgICAgPSBBcnJheS5pc0FycmF5LFxuICAgIG5hdGl2ZUtleXMgICAgICAgICA9IE9iamVjdC5rZXlzLFxuICAgIG5hdGl2ZUJpbmQgICAgICAgICA9IEZ1bmNQcm90by5iaW5kLFxuICAgIG5hdGl2ZUNyZWF0ZSAgICAgICA9IE9iamVjdC5jcmVhdGU7XG5cbiAgLy8gTmFrZWQgZnVuY3Rpb24gcmVmZXJlbmNlIGZvciBzdXJyb2dhdGUtcHJvdG90eXBlLXN3YXBwaW5nLlxuICB2YXIgQ3RvciA9IGZ1bmN0aW9uKCl7fTtcblxuICAvLyBDcmVhdGUgYSBzYWZlIHJlZmVyZW5jZSB0byB0aGUgVW5kZXJzY29yZSBvYmplY3QgZm9yIHVzZSBiZWxvdy5cbiAgdmFyIF8gPSBmdW5jdGlvbihvYmopIHtcbiAgICBpZiAob2JqIGluc3RhbmNlb2YgXykgcmV0dXJuIG9iajtcbiAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgXykpIHJldHVybiBuZXcgXyhvYmopO1xuICAgIHRoaXMuX3dyYXBwZWQgPSBvYmo7XG4gIH07XG5cbiAgLy8gRXhwb3J0IHRoZSBVbmRlcnNjb3JlIG9iamVjdCBmb3IgKipOb2RlLmpzKiosIHdpdGhcbiAgLy8gYmFja3dhcmRzLWNvbXBhdGliaWxpdHkgZm9yIHRoZSBvbGQgYHJlcXVpcmUoKWAgQVBJLiBJZiB3ZSdyZSBpblxuICAvLyB0aGUgYnJvd3NlciwgYWRkIGBfYCBhcyBhIGdsb2JhbCBvYmplY3QuXG4gIGlmICh0eXBlb2YgZXhwb3J0cyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgICAgIGV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IF87XG4gICAgfVxuICAgIGV4cG9ydHMuXyA9IF87XG4gIH0gZWxzZSB7XG4gICAgcm9vdC5fID0gXztcbiAgfVxuXG4gIC8vIEN1cnJlbnQgdmVyc2lvbi5cbiAgXy5WRVJTSU9OID0gJzEuOC4zJztcblxuICAvLyBJbnRlcm5hbCBmdW5jdGlvbiB0aGF0IHJldHVybnMgYW4gZWZmaWNpZW50IChmb3IgY3VycmVudCBlbmdpbmVzKSB2ZXJzaW9uXG4gIC8vIG9mIHRoZSBwYXNzZWQtaW4gY2FsbGJhY2ssIHRvIGJlIHJlcGVhdGVkbHkgYXBwbGllZCBpbiBvdGhlciBVbmRlcnNjb3JlXG4gIC8vIGZ1bmN0aW9ucy5cbiAgdmFyIG9wdGltaXplQ2IgPSBmdW5jdGlvbihmdW5jLCBjb250ZXh0LCBhcmdDb3VudCkge1xuICAgIGlmIChjb250ZXh0ID09PSB2b2lkIDApIHJldHVybiBmdW5jO1xuICAgIHN3aXRjaCAoYXJnQ291bnQgPT0gbnVsbCA/IDMgOiBhcmdDb3VudCkge1xuICAgICAgY2FzZSAxOiByZXR1cm4gZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmMuY2FsbChjb250ZXh0LCB2YWx1ZSk7XG4gICAgICB9O1xuICAgICAgY2FzZSAyOiByZXR1cm4gZnVuY3Rpb24odmFsdWUsIG90aGVyKSB7XG4gICAgICAgIHJldHVybiBmdW5jLmNhbGwoY29udGV4dCwgdmFsdWUsIG90aGVyKTtcbiAgICAgIH07XG4gICAgICBjYXNlIDM6IHJldHVybiBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pIHtcbiAgICAgICAgcmV0dXJuIGZ1bmMuY2FsbChjb250ZXh0LCB2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pO1xuICAgICAgfTtcbiAgICAgIGNhc2UgNDogcmV0dXJuIGZ1bmN0aW9uKGFjY3VtdWxhdG9yLCB2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pIHtcbiAgICAgICAgcmV0dXJuIGZ1bmMuY2FsbChjb250ZXh0LCBhY2N1bXVsYXRvciwgdmFsdWUsIGluZGV4LCBjb2xsZWN0aW9uKTtcbiAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3VtZW50cyk7XG4gICAgfTtcbiAgfTtcblxuICAvLyBBIG1vc3RseS1pbnRlcm5hbCBmdW5jdGlvbiB0byBnZW5lcmF0ZSBjYWxsYmFja3MgdGhhdCBjYW4gYmUgYXBwbGllZFxuICAvLyB0byBlYWNoIGVsZW1lbnQgaW4gYSBjb2xsZWN0aW9uLCByZXR1cm5pbmcgdGhlIGRlc2lyZWQgcmVzdWx0IOKAlCBlaXRoZXJcbiAgLy8gaWRlbnRpdHksIGFuIGFyYml0cmFyeSBjYWxsYmFjaywgYSBwcm9wZXJ0eSBtYXRjaGVyLCBvciBhIHByb3BlcnR5IGFjY2Vzc29yLlxuICB2YXIgY2IgPSBmdW5jdGlvbih2YWx1ZSwgY29udGV4dCwgYXJnQ291bnQpIHtcbiAgICBpZiAodmFsdWUgPT0gbnVsbCkgcmV0dXJuIF8uaWRlbnRpdHk7XG4gICAgaWYgKF8uaXNGdW5jdGlvbih2YWx1ZSkpIHJldHVybiBvcHRpbWl6ZUNiKHZhbHVlLCBjb250ZXh0LCBhcmdDb3VudCk7XG4gICAgaWYgKF8uaXNPYmplY3QodmFsdWUpKSByZXR1cm4gXy5tYXRjaGVyKHZhbHVlKTtcbiAgICByZXR1cm4gXy5wcm9wZXJ0eSh2YWx1ZSk7XG4gIH07XG4gIF8uaXRlcmF0ZWUgPSBmdW5jdGlvbih2YWx1ZSwgY29udGV4dCkge1xuICAgIHJldHVybiBjYih2YWx1ZSwgY29udGV4dCwgSW5maW5pdHkpO1xuICB9O1xuXG4gIC8vIEFuIGludGVybmFsIGZ1bmN0aW9uIGZvciBjcmVhdGluZyBhc3NpZ25lciBmdW5jdGlvbnMuXG4gIHZhciBjcmVhdGVBc3NpZ25lciA9IGZ1bmN0aW9uKGtleXNGdW5jLCB1bmRlZmluZWRPbmx5KSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKG9iaikge1xuICAgICAgdmFyIGxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgICBpZiAobGVuZ3RoIDwgMiB8fCBvYmogPT0gbnVsbCkgcmV0dXJuIG9iajtcbiAgICAgIGZvciAodmFyIGluZGV4ID0gMTsgaW5kZXggPCBsZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpbmRleF0sXG4gICAgICAgICAgICBrZXlzID0ga2V5c0Z1bmMoc291cmNlKSxcbiAgICAgICAgICAgIGwgPSBrZXlzLmxlbmd0aDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICB2YXIga2V5ID0ga2V5c1tpXTtcbiAgICAgICAgICBpZiAoIXVuZGVmaW5lZE9ubHkgfHwgb2JqW2tleV0gPT09IHZvaWQgMCkgb2JqW2tleV0gPSBzb3VyY2Vba2V5XTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIG9iajtcbiAgICB9O1xuICB9O1xuXG4gIC8vIEFuIGludGVybmFsIGZ1bmN0aW9uIGZvciBjcmVhdGluZyBhIG5ldyBvYmplY3QgdGhhdCBpbmhlcml0cyBmcm9tIGFub3RoZXIuXG4gIHZhciBiYXNlQ3JlYXRlID0gZnVuY3Rpb24ocHJvdG90eXBlKSB7XG4gICAgaWYgKCFfLmlzT2JqZWN0KHByb3RvdHlwZSkpIHJldHVybiB7fTtcbiAgICBpZiAobmF0aXZlQ3JlYXRlKSByZXR1cm4gbmF0aXZlQ3JlYXRlKHByb3RvdHlwZSk7XG4gICAgQ3Rvci5wcm90b3R5cGUgPSBwcm90b3R5cGU7XG4gICAgdmFyIHJlc3VsdCA9IG5ldyBDdG9yO1xuICAgIEN0b3IucHJvdG90eXBlID0gbnVsbDtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIHZhciBwcm9wZXJ0eSA9IGZ1bmN0aW9uKGtleSkge1xuICAgIHJldHVybiBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiBvYmogPT0gbnVsbCA/IHZvaWQgMCA6IG9ialtrZXldO1xuICAgIH07XG4gIH07XG5cbiAgLy8gSGVscGVyIGZvciBjb2xsZWN0aW9uIG1ldGhvZHMgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgYSBjb2xsZWN0aW9uXG4gIC8vIHNob3VsZCBiZSBpdGVyYXRlZCBhcyBhbiBhcnJheSBvciBhcyBhbiBvYmplY3RcbiAgLy8gUmVsYXRlZDogaHR0cDovL3Blb3BsZS5tb3ppbGxhLm9yZy9+am9yZW5kb3JmZi9lczYtZHJhZnQuaHRtbCNzZWMtdG9sZW5ndGhcbiAgLy8gQXZvaWRzIGEgdmVyeSBuYXN0eSBpT1MgOCBKSVQgYnVnIG9uIEFSTS02NC4gIzIwOTRcbiAgdmFyIE1BWF9BUlJBWV9JTkRFWCA9IE1hdGgucG93KDIsIDUzKSAtIDE7XG4gIHZhciBnZXRMZW5ndGggPSBwcm9wZXJ0eSgnbGVuZ3RoJyk7XG4gIHZhciBpc0FycmF5TGlrZSA9IGZ1bmN0aW9uKGNvbGxlY3Rpb24pIHtcbiAgICB2YXIgbGVuZ3RoID0gZ2V0TGVuZ3RoKGNvbGxlY3Rpb24pO1xuICAgIHJldHVybiB0eXBlb2YgbGVuZ3RoID09ICdudW1iZXInICYmIGxlbmd0aCA+PSAwICYmIGxlbmd0aCA8PSBNQVhfQVJSQVlfSU5ERVg7XG4gIH07XG5cbiAgLy8gQ29sbGVjdGlvbiBGdW5jdGlvbnNcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvLyBUaGUgY29ybmVyc3RvbmUsIGFuIGBlYWNoYCBpbXBsZW1lbnRhdGlvbiwgYWthIGBmb3JFYWNoYC5cbiAgLy8gSGFuZGxlcyByYXcgb2JqZWN0cyBpbiBhZGRpdGlvbiB0byBhcnJheS1saWtlcy4gVHJlYXRzIGFsbFxuICAvLyBzcGFyc2UgYXJyYXktbGlrZXMgYXMgaWYgdGhleSB3ZXJlIGRlbnNlLlxuICBfLmVhY2ggPSBfLmZvckVhY2ggPSBmdW5jdGlvbihvYmosIGl0ZXJhdGVlLCBjb250ZXh0KSB7XG4gICAgaXRlcmF0ZWUgPSBvcHRpbWl6ZUNiKGl0ZXJhdGVlLCBjb250ZXh0KTtcbiAgICB2YXIgaSwgbGVuZ3RoO1xuICAgIGlmIChpc0FycmF5TGlrZShvYmopKSB7XG4gICAgICBmb3IgKGkgPSAwLCBsZW5ndGggPSBvYmoubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaXRlcmF0ZWUob2JqW2ldLCBpLCBvYmopO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIga2V5cyA9IF8ua2V5cyhvYmopO1xuICAgICAgZm9yIChpID0gMCwgbGVuZ3RoID0ga2V5cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBpdGVyYXRlZShvYmpba2V5c1tpXV0sIGtleXNbaV0sIG9iaik7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvYmo7XG4gIH07XG5cbiAgLy8gUmV0dXJuIHRoZSByZXN1bHRzIG9mIGFwcGx5aW5nIHRoZSBpdGVyYXRlZSB0byBlYWNoIGVsZW1lbnQuXG4gIF8ubWFwID0gXy5jb2xsZWN0ID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRlZSwgY29udGV4dCkge1xuICAgIGl0ZXJhdGVlID0gY2IoaXRlcmF0ZWUsIGNvbnRleHQpO1xuICAgIHZhciBrZXlzID0gIWlzQXJyYXlMaWtlKG9iaikgJiYgXy5rZXlzKG9iaiksXG4gICAgICAgIGxlbmd0aCA9IChrZXlzIHx8IG9iaikubGVuZ3RoLFxuICAgICAgICByZXN1bHRzID0gQXJyYXkobGVuZ3RoKTtcbiAgICBmb3IgKHZhciBpbmRleCA9IDA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICB2YXIgY3VycmVudEtleSA9IGtleXMgPyBrZXlzW2luZGV4XSA6IGluZGV4O1xuICAgICAgcmVzdWx0c1tpbmRleF0gPSBpdGVyYXRlZShvYmpbY3VycmVudEtleV0sIGN1cnJlbnRLZXksIG9iaik7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzO1xuICB9O1xuXG4gIC8vIENyZWF0ZSBhIHJlZHVjaW5nIGZ1bmN0aW9uIGl0ZXJhdGluZyBsZWZ0IG9yIHJpZ2h0LlxuICBmdW5jdGlvbiBjcmVhdGVSZWR1Y2UoZGlyKSB7XG4gICAgLy8gT3B0aW1pemVkIGl0ZXJhdG9yIGZ1bmN0aW9uIGFzIHVzaW5nIGFyZ3VtZW50cy5sZW5ndGhcbiAgICAvLyBpbiB0aGUgbWFpbiBmdW5jdGlvbiB3aWxsIGRlb3B0aW1pemUgdGhlLCBzZWUgIzE5OTEuXG4gICAgZnVuY3Rpb24gaXRlcmF0b3Iob2JqLCBpdGVyYXRlZSwgbWVtbywga2V5cywgaW5kZXgsIGxlbmd0aCkge1xuICAgICAgZm9yICg7IGluZGV4ID49IDAgJiYgaW5kZXggPCBsZW5ndGg7IGluZGV4ICs9IGRpcikge1xuICAgICAgICB2YXIgY3VycmVudEtleSA9IGtleXMgPyBrZXlzW2luZGV4XSA6IGluZGV4O1xuICAgICAgICBtZW1vID0gaXRlcmF0ZWUobWVtbywgb2JqW2N1cnJlbnRLZXldLCBjdXJyZW50S2V5LCBvYmopO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG1lbW87XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uKG9iaiwgaXRlcmF0ZWUsIG1lbW8sIGNvbnRleHQpIHtcbiAgICAgIGl0ZXJhdGVlID0gb3B0aW1pemVDYihpdGVyYXRlZSwgY29udGV4dCwgNCk7XG4gICAgICB2YXIga2V5cyA9ICFpc0FycmF5TGlrZShvYmopICYmIF8ua2V5cyhvYmopLFxuICAgICAgICAgIGxlbmd0aCA9IChrZXlzIHx8IG9iaikubGVuZ3RoLFxuICAgICAgICAgIGluZGV4ID0gZGlyID4gMCA/IDAgOiBsZW5ndGggLSAxO1xuICAgICAgLy8gRGV0ZXJtaW5lIHRoZSBpbml0aWFsIHZhbHVlIGlmIG5vbmUgaXMgcHJvdmlkZWQuXG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDMpIHtcbiAgICAgICAgbWVtbyA9IG9ialtrZXlzID8ga2V5c1tpbmRleF0gOiBpbmRleF07XG4gICAgICAgIGluZGV4ICs9IGRpcjtcbiAgICAgIH1cbiAgICAgIHJldHVybiBpdGVyYXRvcihvYmosIGl0ZXJhdGVlLCBtZW1vLCBrZXlzLCBpbmRleCwgbGVuZ3RoKTtcbiAgICB9O1xuICB9XG5cbiAgLy8gKipSZWR1Y2UqKiBidWlsZHMgdXAgYSBzaW5nbGUgcmVzdWx0IGZyb20gYSBsaXN0IG9mIHZhbHVlcywgYWthIGBpbmplY3RgLFxuICAvLyBvciBgZm9sZGxgLlxuICBfLnJlZHVjZSA9IF8uZm9sZGwgPSBfLmluamVjdCA9IGNyZWF0ZVJlZHVjZSgxKTtcblxuICAvLyBUaGUgcmlnaHQtYXNzb2NpYXRpdmUgdmVyc2lvbiBvZiByZWR1Y2UsIGFsc28ga25vd24gYXMgYGZvbGRyYC5cbiAgXy5yZWR1Y2VSaWdodCA9IF8uZm9sZHIgPSBjcmVhdGVSZWR1Y2UoLTEpO1xuXG4gIC8vIFJldHVybiB0aGUgZmlyc3QgdmFsdWUgd2hpY2ggcGFzc2VzIGEgdHJ1dGggdGVzdC4gQWxpYXNlZCBhcyBgZGV0ZWN0YC5cbiAgXy5maW5kID0gXy5kZXRlY3QgPSBmdW5jdGlvbihvYmosIHByZWRpY2F0ZSwgY29udGV4dCkge1xuICAgIHZhciBrZXk7XG4gICAgaWYgKGlzQXJyYXlMaWtlKG9iaikpIHtcbiAgICAgIGtleSA9IF8uZmluZEluZGV4KG9iaiwgcHJlZGljYXRlLCBjb250ZXh0KTtcbiAgICB9IGVsc2Uge1xuICAgICAga2V5ID0gXy5maW5kS2V5KG9iaiwgcHJlZGljYXRlLCBjb250ZXh0KTtcbiAgICB9XG4gICAgaWYgKGtleSAhPT0gdm9pZCAwICYmIGtleSAhPT0gLTEpIHJldHVybiBvYmpba2V5XTtcbiAgfTtcblxuICAvLyBSZXR1cm4gYWxsIHRoZSBlbGVtZW50cyB0aGF0IHBhc3MgYSB0cnV0aCB0ZXN0LlxuICAvLyBBbGlhc2VkIGFzIGBzZWxlY3RgLlxuICBfLmZpbHRlciA9IF8uc2VsZWN0ID0gZnVuY3Rpb24ob2JqLCBwcmVkaWNhdGUsIGNvbnRleHQpIHtcbiAgICB2YXIgcmVzdWx0cyA9IFtdO1xuICAgIHByZWRpY2F0ZSA9IGNiKHByZWRpY2F0ZSwgY29udGV4dCk7XG4gICAgXy5lYWNoKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICBpZiAocHJlZGljYXRlKHZhbHVlLCBpbmRleCwgbGlzdCkpIHJlc3VsdHMucHVzaCh2YWx1ZSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH07XG5cbiAgLy8gUmV0dXJuIGFsbCB0aGUgZWxlbWVudHMgZm9yIHdoaWNoIGEgdHJ1dGggdGVzdCBmYWlscy5cbiAgXy5yZWplY3QgPSBmdW5jdGlvbihvYmosIHByZWRpY2F0ZSwgY29udGV4dCkge1xuICAgIHJldHVybiBfLmZpbHRlcihvYmosIF8ubmVnYXRlKGNiKHByZWRpY2F0ZSkpLCBjb250ZXh0KTtcbiAgfTtcblxuICAvLyBEZXRlcm1pbmUgd2hldGhlciBhbGwgb2YgdGhlIGVsZW1lbnRzIG1hdGNoIGEgdHJ1dGggdGVzdC5cbiAgLy8gQWxpYXNlZCBhcyBgYWxsYC5cbiAgXy5ldmVyeSA9IF8uYWxsID0gZnVuY3Rpb24ob2JqLCBwcmVkaWNhdGUsIGNvbnRleHQpIHtcbiAgICBwcmVkaWNhdGUgPSBjYihwcmVkaWNhdGUsIGNvbnRleHQpO1xuICAgIHZhciBrZXlzID0gIWlzQXJyYXlMaWtlKG9iaikgJiYgXy5rZXlzKG9iaiksXG4gICAgICAgIGxlbmd0aCA9IChrZXlzIHx8IG9iaikubGVuZ3RoO1xuICAgIGZvciAodmFyIGluZGV4ID0gMDsgaW5kZXggPCBsZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIHZhciBjdXJyZW50S2V5ID0ga2V5cyA/IGtleXNbaW5kZXhdIDogaW5kZXg7XG4gICAgICBpZiAoIXByZWRpY2F0ZShvYmpbY3VycmVudEtleV0sIGN1cnJlbnRLZXksIG9iaikpIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG5cbiAgLy8gRGV0ZXJtaW5lIGlmIGF0IGxlYXN0IG9uZSBlbGVtZW50IGluIHRoZSBvYmplY3QgbWF0Y2hlcyBhIHRydXRoIHRlc3QuXG4gIC8vIEFsaWFzZWQgYXMgYGFueWAuXG4gIF8uc29tZSA9IF8uYW55ID0gZnVuY3Rpb24ob2JqLCBwcmVkaWNhdGUsIGNvbnRleHQpIHtcbiAgICBwcmVkaWNhdGUgPSBjYihwcmVkaWNhdGUsIGNvbnRleHQpO1xuICAgIHZhciBrZXlzID0gIWlzQXJyYXlMaWtlKG9iaikgJiYgXy5rZXlzKG9iaiksXG4gICAgICAgIGxlbmd0aCA9IChrZXlzIHx8IG9iaikubGVuZ3RoO1xuICAgIGZvciAodmFyIGluZGV4ID0gMDsgaW5kZXggPCBsZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIHZhciBjdXJyZW50S2V5ID0ga2V5cyA/IGtleXNbaW5kZXhdIDogaW5kZXg7XG4gICAgICBpZiAocHJlZGljYXRlKG9ialtjdXJyZW50S2V5XSwgY3VycmVudEtleSwgb2JqKSkgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfTtcblxuICAvLyBEZXRlcm1pbmUgaWYgdGhlIGFycmF5IG9yIG9iamVjdCBjb250YWlucyBhIGdpdmVuIGl0ZW0gKHVzaW5nIGA9PT1gKS5cbiAgLy8gQWxpYXNlZCBhcyBgaW5jbHVkZXNgIGFuZCBgaW5jbHVkZWAuXG4gIF8uY29udGFpbnMgPSBfLmluY2x1ZGVzID0gXy5pbmNsdWRlID0gZnVuY3Rpb24ob2JqLCBpdGVtLCBmcm9tSW5kZXgsIGd1YXJkKSB7XG4gICAgaWYgKCFpc0FycmF5TGlrZShvYmopKSBvYmogPSBfLnZhbHVlcyhvYmopO1xuICAgIGlmICh0eXBlb2YgZnJvbUluZGV4ICE9ICdudW1iZXInIHx8IGd1YXJkKSBmcm9tSW5kZXggPSAwO1xuICAgIHJldHVybiBfLmluZGV4T2Yob2JqLCBpdGVtLCBmcm9tSW5kZXgpID49IDA7XG4gIH07XG5cbiAgLy8gSW52b2tlIGEgbWV0aG9kICh3aXRoIGFyZ3VtZW50cykgb24gZXZlcnkgaXRlbSBpbiBhIGNvbGxlY3Rpb24uXG4gIF8uaW52b2tlID0gZnVuY3Rpb24ob2JqLCBtZXRob2QpIHtcbiAgICB2YXIgYXJncyA9IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKTtcbiAgICB2YXIgaXNGdW5jID0gXy5pc0Z1bmN0aW9uKG1ldGhvZCk7XG4gICAgcmV0dXJuIF8ubWFwKG9iaiwgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIHZhciBmdW5jID0gaXNGdW5jID8gbWV0aG9kIDogdmFsdWVbbWV0aG9kXTtcbiAgICAgIHJldHVybiBmdW5jID09IG51bGwgPyBmdW5jIDogZnVuYy5hcHBseSh2YWx1ZSwgYXJncyk7XG4gICAgfSk7XG4gIH07XG5cbiAgLy8gQ29udmVuaWVuY2UgdmVyc2lvbiBvZiBhIGNvbW1vbiB1c2UgY2FzZSBvZiBgbWFwYDogZmV0Y2hpbmcgYSBwcm9wZXJ0eS5cbiAgXy5wbHVjayA9IGZ1bmN0aW9uKG9iaiwga2V5KSB7XG4gICAgcmV0dXJuIF8ubWFwKG9iaiwgXy5wcm9wZXJ0eShrZXkpKTtcbiAgfTtcblxuICAvLyBDb252ZW5pZW5jZSB2ZXJzaW9uIG9mIGEgY29tbW9uIHVzZSBjYXNlIG9mIGBmaWx0ZXJgOiBzZWxlY3Rpbmcgb25seSBvYmplY3RzXG4gIC8vIGNvbnRhaW5pbmcgc3BlY2lmaWMgYGtleTp2YWx1ZWAgcGFpcnMuXG4gIF8ud2hlcmUgPSBmdW5jdGlvbihvYmosIGF0dHJzKSB7XG4gICAgcmV0dXJuIF8uZmlsdGVyKG9iaiwgXy5tYXRjaGVyKGF0dHJzKSk7XG4gIH07XG5cbiAgLy8gQ29udmVuaWVuY2UgdmVyc2lvbiBvZiBhIGNvbW1vbiB1c2UgY2FzZSBvZiBgZmluZGA6IGdldHRpbmcgdGhlIGZpcnN0IG9iamVjdFxuICAvLyBjb250YWluaW5nIHNwZWNpZmljIGBrZXk6dmFsdWVgIHBhaXJzLlxuICBfLmZpbmRXaGVyZSA9IGZ1bmN0aW9uKG9iaiwgYXR0cnMpIHtcbiAgICByZXR1cm4gXy5maW5kKG9iaiwgXy5tYXRjaGVyKGF0dHJzKSk7XG4gIH07XG5cbiAgLy8gUmV0dXJuIHRoZSBtYXhpbXVtIGVsZW1lbnQgKG9yIGVsZW1lbnQtYmFzZWQgY29tcHV0YXRpb24pLlxuICBfLm1heCA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0ZWUsIGNvbnRleHQpIHtcbiAgICB2YXIgcmVzdWx0ID0gLUluZmluaXR5LCBsYXN0Q29tcHV0ZWQgPSAtSW5maW5pdHksXG4gICAgICAgIHZhbHVlLCBjb21wdXRlZDtcbiAgICBpZiAoaXRlcmF0ZWUgPT0gbnVsbCAmJiBvYmogIT0gbnVsbCkge1xuICAgICAgb2JqID0gaXNBcnJheUxpa2Uob2JqKSA/IG9iaiA6IF8udmFsdWVzKG9iaik7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gb2JqLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhbHVlID0gb2JqW2ldO1xuICAgICAgICBpZiAodmFsdWUgPiByZXN1bHQpIHtcbiAgICAgICAgICByZXN1bHQgPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpdGVyYXRlZSA9IGNiKGl0ZXJhdGVlLCBjb250ZXh0KTtcbiAgICAgIF8uZWFjaChvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgbGlzdCkge1xuICAgICAgICBjb21wdXRlZCA9IGl0ZXJhdGVlKHZhbHVlLCBpbmRleCwgbGlzdCk7XG4gICAgICAgIGlmIChjb21wdXRlZCA+IGxhc3RDb21wdXRlZCB8fCBjb21wdXRlZCA9PT0gLUluZmluaXR5ICYmIHJlc3VsdCA9PT0gLUluZmluaXR5KSB7XG4gICAgICAgICAgcmVzdWx0ID0gdmFsdWU7XG4gICAgICAgICAgbGFzdENvbXB1dGVkID0gY29tcHV0ZWQ7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8vIFJldHVybiB0aGUgbWluaW11bSBlbGVtZW50IChvciBlbGVtZW50LWJhc2VkIGNvbXB1dGF0aW9uKS5cbiAgXy5taW4gPSBmdW5jdGlvbihvYmosIGl0ZXJhdGVlLCBjb250ZXh0KSB7XG4gICAgdmFyIHJlc3VsdCA9IEluZmluaXR5LCBsYXN0Q29tcHV0ZWQgPSBJbmZpbml0eSxcbiAgICAgICAgdmFsdWUsIGNvbXB1dGVkO1xuICAgIGlmIChpdGVyYXRlZSA9PSBudWxsICYmIG9iaiAhPSBudWxsKSB7XG4gICAgICBvYmogPSBpc0FycmF5TGlrZShvYmopID8gb2JqIDogXy52YWx1ZXMob2JqKTtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBvYmoubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFsdWUgPSBvYmpbaV07XG4gICAgICAgIGlmICh2YWx1ZSA8IHJlc3VsdCkge1xuICAgICAgICAgIHJlc3VsdCA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGl0ZXJhdGVlID0gY2IoaXRlcmF0ZWUsIGNvbnRleHQpO1xuICAgICAgXy5lYWNoKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICAgIGNvbXB1dGVkID0gaXRlcmF0ZWUodmFsdWUsIGluZGV4LCBsaXN0KTtcbiAgICAgICAgaWYgKGNvbXB1dGVkIDwgbGFzdENvbXB1dGVkIHx8IGNvbXB1dGVkID09PSBJbmZpbml0eSAmJiByZXN1bHQgPT09IEluZmluaXR5KSB7XG4gICAgICAgICAgcmVzdWx0ID0gdmFsdWU7XG4gICAgICAgICAgbGFzdENvbXB1dGVkID0gY29tcHV0ZWQ7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8vIFNodWZmbGUgYSBjb2xsZWN0aW9uLCB1c2luZyB0aGUgbW9kZXJuIHZlcnNpb24gb2YgdGhlXG4gIC8vIFtGaXNoZXItWWF0ZXMgc2h1ZmZsZV0oaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9GaXNoZXLigJNZYXRlc19zaHVmZmxlKS5cbiAgXy5zaHVmZmxlID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIHNldCA9IGlzQXJyYXlMaWtlKG9iaikgPyBvYmogOiBfLnZhbHVlcyhvYmopO1xuICAgIHZhciBsZW5ndGggPSBzZXQubGVuZ3RoO1xuICAgIHZhciBzaHVmZmxlZCA9IEFycmF5KGxlbmd0aCk7XG4gICAgZm9yICh2YXIgaW5kZXggPSAwLCByYW5kOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgcmFuZCA9IF8ucmFuZG9tKDAsIGluZGV4KTtcbiAgICAgIGlmIChyYW5kICE9PSBpbmRleCkgc2h1ZmZsZWRbaW5kZXhdID0gc2h1ZmZsZWRbcmFuZF07XG4gICAgICBzaHVmZmxlZFtyYW5kXSA9IHNldFtpbmRleF07XG4gICAgfVxuICAgIHJldHVybiBzaHVmZmxlZDtcbiAgfTtcblxuICAvLyBTYW1wbGUgKipuKiogcmFuZG9tIHZhbHVlcyBmcm9tIGEgY29sbGVjdGlvbi5cbiAgLy8gSWYgKipuKiogaXMgbm90IHNwZWNpZmllZCwgcmV0dXJucyBhIHNpbmdsZSByYW5kb20gZWxlbWVudC5cbiAgLy8gVGhlIGludGVybmFsIGBndWFyZGAgYXJndW1lbnQgYWxsb3dzIGl0IHRvIHdvcmsgd2l0aCBgbWFwYC5cbiAgXy5zYW1wbGUgPSBmdW5jdGlvbihvYmosIG4sIGd1YXJkKSB7XG4gICAgaWYgKG4gPT0gbnVsbCB8fCBndWFyZCkge1xuICAgICAgaWYgKCFpc0FycmF5TGlrZShvYmopKSBvYmogPSBfLnZhbHVlcyhvYmopO1xuICAgICAgcmV0dXJuIG9ialtfLnJhbmRvbShvYmoubGVuZ3RoIC0gMSldO1xuICAgIH1cbiAgICByZXR1cm4gXy5zaHVmZmxlKG9iaikuc2xpY2UoMCwgTWF0aC5tYXgoMCwgbikpO1xuICB9O1xuXG4gIC8vIFNvcnQgdGhlIG9iamVjdCdzIHZhbHVlcyBieSBhIGNyaXRlcmlvbiBwcm9kdWNlZCBieSBhbiBpdGVyYXRlZS5cbiAgXy5zb3J0QnkgPSBmdW5jdGlvbihvYmosIGl0ZXJhdGVlLCBjb250ZXh0KSB7XG4gICAgaXRlcmF0ZWUgPSBjYihpdGVyYXRlZSwgY29udGV4dCk7XG4gICAgcmV0dXJuIF8ucGx1Y2soXy5tYXAob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGxpc3QpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgaW5kZXg6IGluZGV4LFxuICAgICAgICBjcml0ZXJpYTogaXRlcmF0ZWUodmFsdWUsIGluZGV4LCBsaXN0KVxuICAgICAgfTtcbiAgICB9KS5zb3J0KGZ1bmN0aW9uKGxlZnQsIHJpZ2h0KSB7XG4gICAgICB2YXIgYSA9IGxlZnQuY3JpdGVyaWE7XG4gICAgICB2YXIgYiA9IHJpZ2h0LmNyaXRlcmlhO1xuICAgICAgaWYgKGEgIT09IGIpIHtcbiAgICAgICAgaWYgKGEgPiBiIHx8IGEgPT09IHZvaWQgMCkgcmV0dXJuIDE7XG4gICAgICAgIGlmIChhIDwgYiB8fCBiID09PSB2b2lkIDApIHJldHVybiAtMTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBsZWZ0LmluZGV4IC0gcmlnaHQuaW5kZXg7XG4gICAgfSksICd2YWx1ZScpO1xuICB9O1xuXG4gIC8vIEFuIGludGVybmFsIGZ1bmN0aW9uIHVzZWQgZm9yIGFnZ3JlZ2F0ZSBcImdyb3VwIGJ5XCIgb3BlcmF0aW9ucy5cbiAgdmFyIGdyb3VwID0gZnVuY3Rpb24oYmVoYXZpb3IpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24ob2JqLCBpdGVyYXRlZSwgY29udGV4dCkge1xuICAgICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgICAgaXRlcmF0ZWUgPSBjYihpdGVyYXRlZSwgY29udGV4dCk7XG4gICAgICBfLmVhY2gob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgpIHtcbiAgICAgICAgdmFyIGtleSA9IGl0ZXJhdGVlKHZhbHVlLCBpbmRleCwgb2JqKTtcbiAgICAgICAgYmVoYXZpb3IocmVzdWx0LCB2YWx1ZSwga2V5KTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuICB9O1xuXG4gIC8vIEdyb3VwcyB0aGUgb2JqZWN0J3MgdmFsdWVzIGJ5IGEgY3JpdGVyaW9uLiBQYXNzIGVpdGhlciBhIHN0cmluZyBhdHRyaWJ1dGVcbiAgLy8gdG8gZ3JvdXAgYnksIG9yIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHRoZSBjcml0ZXJpb24uXG4gIF8uZ3JvdXBCeSA9IGdyb3VwKGZ1bmN0aW9uKHJlc3VsdCwgdmFsdWUsIGtleSkge1xuICAgIGlmIChfLmhhcyhyZXN1bHQsIGtleSkpIHJlc3VsdFtrZXldLnB1c2godmFsdWUpOyBlbHNlIHJlc3VsdFtrZXldID0gW3ZhbHVlXTtcbiAgfSk7XG5cbiAgLy8gSW5kZXhlcyB0aGUgb2JqZWN0J3MgdmFsdWVzIGJ5IGEgY3JpdGVyaW9uLCBzaW1pbGFyIHRvIGBncm91cEJ5YCwgYnV0IGZvclxuICAvLyB3aGVuIHlvdSBrbm93IHRoYXQgeW91ciBpbmRleCB2YWx1ZXMgd2lsbCBiZSB1bmlxdWUuXG4gIF8uaW5kZXhCeSA9IGdyb3VwKGZ1bmN0aW9uKHJlc3VsdCwgdmFsdWUsIGtleSkge1xuICAgIHJlc3VsdFtrZXldID0gdmFsdWU7XG4gIH0pO1xuXG4gIC8vIENvdW50cyBpbnN0YW5jZXMgb2YgYW4gb2JqZWN0IHRoYXQgZ3JvdXAgYnkgYSBjZXJ0YWluIGNyaXRlcmlvbi4gUGFzc1xuICAvLyBlaXRoZXIgYSBzdHJpbmcgYXR0cmlidXRlIHRvIGNvdW50IGJ5LCBvciBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0aGVcbiAgLy8gY3JpdGVyaW9uLlxuICBfLmNvdW50QnkgPSBncm91cChmdW5jdGlvbihyZXN1bHQsIHZhbHVlLCBrZXkpIHtcbiAgICBpZiAoXy5oYXMocmVzdWx0LCBrZXkpKSByZXN1bHRba2V5XSsrOyBlbHNlIHJlc3VsdFtrZXldID0gMTtcbiAgfSk7XG5cbiAgLy8gU2FmZWx5IGNyZWF0ZSBhIHJlYWwsIGxpdmUgYXJyYXkgZnJvbSBhbnl0aGluZyBpdGVyYWJsZS5cbiAgXy50b0FycmF5ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKCFvYmopIHJldHVybiBbXTtcbiAgICBpZiAoXy5pc0FycmF5KG9iaikpIHJldHVybiBzbGljZS5jYWxsKG9iaik7XG4gICAgaWYgKGlzQXJyYXlMaWtlKG9iaikpIHJldHVybiBfLm1hcChvYmosIF8uaWRlbnRpdHkpO1xuICAgIHJldHVybiBfLnZhbHVlcyhvYmopO1xuICB9O1xuXG4gIC8vIFJldHVybiB0aGUgbnVtYmVyIG9mIGVsZW1lbnRzIGluIGFuIG9iamVjdC5cbiAgXy5zaXplID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gMDtcbiAgICByZXR1cm4gaXNBcnJheUxpa2Uob2JqKSA/IG9iai5sZW5ndGggOiBfLmtleXMob2JqKS5sZW5ndGg7XG4gIH07XG5cbiAgLy8gU3BsaXQgYSBjb2xsZWN0aW9uIGludG8gdHdvIGFycmF5czogb25lIHdob3NlIGVsZW1lbnRzIGFsbCBzYXRpc2Z5IHRoZSBnaXZlblxuICAvLyBwcmVkaWNhdGUsIGFuZCBvbmUgd2hvc2UgZWxlbWVudHMgYWxsIGRvIG5vdCBzYXRpc2Z5IHRoZSBwcmVkaWNhdGUuXG4gIF8ucGFydGl0aW9uID0gZnVuY3Rpb24ob2JqLCBwcmVkaWNhdGUsIGNvbnRleHQpIHtcbiAgICBwcmVkaWNhdGUgPSBjYihwcmVkaWNhdGUsIGNvbnRleHQpO1xuICAgIHZhciBwYXNzID0gW10sIGZhaWwgPSBbXTtcbiAgICBfLmVhY2gob2JqLCBmdW5jdGlvbih2YWx1ZSwga2V5LCBvYmopIHtcbiAgICAgIChwcmVkaWNhdGUodmFsdWUsIGtleSwgb2JqKSA/IHBhc3MgOiBmYWlsKS5wdXNoKHZhbHVlKTtcbiAgICB9KTtcbiAgICByZXR1cm4gW3Bhc3MsIGZhaWxdO1xuICB9O1xuXG4gIC8vIEFycmF5IEZ1bmN0aW9uc1xuICAvLyAtLS0tLS0tLS0tLS0tLS1cblxuICAvLyBHZXQgdGhlIGZpcnN0IGVsZW1lbnQgb2YgYW4gYXJyYXkuIFBhc3NpbmcgKipuKiogd2lsbCByZXR1cm4gdGhlIGZpcnN0IE5cbiAgLy8gdmFsdWVzIGluIHRoZSBhcnJheS4gQWxpYXNlZCBhcyBgaGVhZGAgYW5kIGB0YWtlYC4gVGhlICoqZ3VhcmQqKiBjaGVja1xuICAvLyBhbGxvd3MgaXQgdG8gd29yayB3aXRoIGBfLm1hcGAuXG4gIF8uZmlyc3QgPSBfLmhlYWQgPSBfLnRha2UgPSBmdW5jdGlvbihhcnJheSwgbiwgZ3VhcmQpIHtcbiAgICBpZiAoYXJyYXkgPT0gbnVsbCkgcmV0dXJuIHZvaWQgMDtcbiAgICBpZiAobiA9PSBudWxsIHx8IGd1YXJkKSByZXR1cm4gYXJyYXlbMF07XG4gICAgcmV0dXJuIF8uaW5pdGlhbChhcnJheSwgYXJyYXkubGVuZ3RoIC0gbik7XG4gIH07XG5cbiAgLy8gUmV0dXJucyBldmVyeXRoaW5nIGJ1dCB0aGUgbGFzdCBlbnRyeSBvZiB0aGUgYXJyYXkuIEVzcGVjaWFsbHkgdXNlZnVsIG9uXG4gIC8vIHRoZSBhcmd1bWVudHMgb2JqZWN0LiBQYXNzaW5nICoqbioqIHdpbGwgcmV0dXJuIGFsbCB0aGUgdmFsdWVzIGluXG4gIC8vIHRoZSBhcnJheSwgZXhjbHVkaW5nIHRoZSBsYXN0IE4uXG4gIF8uaW5pdGlhbCA9IGZ1bmN0aW9uKGFycmF5LCBuLCBndWFyZCkge1xuICAgIHJldHVybiBzbGljZS5jYWxsKGFycmF5LCAwLCBNYXRoLm1heCgwLCBhcnJheS5sZW5ndGggLSAobiA9PSBudWxsIHx8IGd1YXJkID8gMSA6IG4pKSk7XG4gIH07XG5cbiAgLy8gR2V0IHRoZSBsYXN0IGVsZW1lbnQgb2YgYW4gYXJyYXkuIFBhc3NpbmcgKipuKiogd2lsbCByZXR1cm4gdGhlIGxhc3QgTlxuICAvLyB2YWx1ZXMgaW4gdGhlIGFycmF5LlxuICBfLmxhc3QgPSBmdW5jdGlvbihhcnJheSwgbiwgZ3VhcmQpIHtcbiAgICBpZiAoYXJyYXkgPT0gbnVsbCkgcmV0dXJuIHZvaWQgMDtcbiAgICBpZiAobiA9PSBudWxsIHx8IGd1YXJkKSByZXR1cm4gYXJyYXlbYXJyYXkubGVuZ3RoIC0gMV07XG4gICAgcmV0dXJuIF8ucmVzdChhcnJheSwgTWF0aC5tYXgoMCwgYXJyYXkubGVuZ3RoIC0gbikpO1xuICB9O1xuXG4gIC8vIFJldHVybnMgZXZlcnl0aGluZyBidXQgdGhlIGZpcnN0IGVudHJ5IG9mIHRoZSBhcnJheS4gQWxpYXNlZCBhcyBgdGFpbGAgYW5kIGBkcm9wYC5cbiAgLy8gRXNwZWNpYWxseSB1c2VmdWwgb24gdGhlIGFyZ3VtZW50cyBvYmplY3QuIFBhc3NpbmcgYW4gKipuKiogd2lsbCByZXR1cm5cbiAgLy8gdGhlIHJlc3QgTiB2YWx1ZXMgaW4gdGhlIGFycmF5LlxuICBfLnJlc3QgPSBfLnRhaWwgPSBfLmRyb3AgPSBmdW5jdGlvbihhcnJheSwgbiwgZ3VhcmQpIHtcbiAgICByZXR1cm4gc2xpY2UuY2FsbChhcnJheSwgbiA9PSBudWxsIHx8IGd1YXJkID8gMSA6IG4pO1xuICB9O1xuXG4gIC8vIFRyaW0gb3V0IGFsbCBmYWxzeSB2YWx1ZXMgZnJvbSBhbiBhcnJheS5cbiAgXy5jb21wYWN0ID0gZnVuY3Rpb24oYXJyYXkpIHtcbiAgICByZXR1cm4gXy5maWx0ZXIoYXJyYXksIF8uaWRlbnRpdHkpO1xuICB9O1xuXG4gIC8vIEludGVybmFsIGltcGxlbWVudGF0aW9uIG9mIGEgcmVjdXJzaXZlIGBmbGF0dGVuYCBmdW5jdGlvbi5cbiAgdmFyIGZsYXR0ZW4gPSBmdW5jdGlvbihpbnB1dCwgc2hhbGxvdywgc3RyaWN0LCBzdGFydEluZGV4KSB7XG4gICAgdmFyIG91dHB1dCA9IFtdLCBpZHggPSAwO1xuICAgIGZvciAodmFyIGkgPSBzdGFydEluZGV4IHx8IDAsIGxlbmd0aCA9IGdldExlbmd0aChpbnB1dCk7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHZhbHVlID0gaW5wdXRbaV07XG4gICAgICBpZiAoaXNBcnJheUxpa2UodmFsdWUpICYmIChfLmlzQXJyYXkodmFsdWUpIHx8IF8uaXNBcmd1bWVudHModmFsdWUpKSkge1xuICAgICAgICAvL2ZsYXR0ZW4gY3VycmVudCBsZXZlbCBvZiBhcnJheSBvciBhcmd1bWVudHMgb2JqZWN0XG4gICAgICAgIGlmICghc2hhbGxvdykgdmFsdWUgPSBmbGF0dGVuKHZhbHVlLCBzaGFsbG93LCBzdHJpY3QpO1xuICAgICAgICB2YXIgaiA9IDAsIGxlbiA9IHZhbHVlLmxlbmd0aDtcbiAgICAgICAgb3V0cHV0Lmxlbmd0aCArPSBsZW47XG4gICAgICAgIHdoaWxlIChqIDwgbGVuKSB7XG4gICAgICAgICAgb3V0cHV0W2lkeCsrXSA9IHZhbHVlW2orK107XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoIXN0cmljdCkge1xuICAgICAgICBvdXRwdXRbaWR4KytdID0gdmFsdWU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvdXRwdXQ7XG4gIH07XG5cbiAgLy8gRmxhdHRlbiBvdXQgYW4gYXJyYXksIGVpdGhlciByZWN1cnNpdmVseSAoYnkgZGVmYXVsdCksIG9yIGp1c3Qgb25lIGxldmVsLlxuICBfLmZsYXR0ZW4gPSBmdW5jdGlvbihhcnJheSwgc2hhbGxvdykge1xuICAgIHJldHVybiBmbGF0dGVuKGFycmF5LCBzaGFsbG93LCBmYWxzZSk7XG4gIH07XG5cbiAgLy8gUmV0dXJuIGEgdmVyc2lvbiBvZiB0aGUgYXJyYXkgdGhhdCBkb2VzIG5vdCBjb250YWluIHRoZSBzcGVjaWZpZWQgdmFsdWUocykuXG4gIF8ud2l0aG91dCA9IGZ1bmN0aW9uKGFycmF5KSB7XG4gICAgcmV0dXJuIF8uZGlmZmVyZW5jZShhcnJheSwgc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpKTtcbiAgfTtcblxuICAvLyBQcm9kdWNlIGEgZHVwbGljYXRlLWZyZWUgdmVyc2lvbiBvZiB0aGUgYXJyYXkuIElmIHRoZSBhcnJheSBoYXMgYWxyZWFkeVxuICAvLyBiZWVuIHNvcnRlZCwgeW91IGhhdmUgdGhlIG9wdGlvbiBvZiB1c2luZyBhIGZhc3RlciBhbGdvcml0aG0uXG4gIC8vIEFsaWFzZWQgYXMgYHVuaXF1ZWAuXG4gIF8udW5pcSA9IF8udW5pcXVlID0gZnVuY3Rpb24oYXJyYXksIGlzU29ydGVkLCBpdGVyYXRlZSwgY29udGV4dCkge1xuICAgIGlmICghXy5pc0Jvb2xlYW4oaXNTb3J0ZWQpKSB7XG4gICAgICBjb250ZXh0ID0gaXRlcmF0ZWU7XG4gICAgICBpdGVyYXRlZSA9IGlzU29ydGVkO1xuICAgICAgaXNTb3J0ZWQgPSBmYWxzZTtcbiAgICB9XG4gICAgaWYgKGl0ZXJhdGVlICE9IG51bGwpIGl0ZXJhdGVlID0gY2IoaXRlcmF0ZWUsIGNvbnRleHQpO1xuICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICB2YXIgc2VlbiA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBnZXRMZW5ndGgoYXJyYXkpOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciB2YWx1ZSA9IGFycmF5W2ldLFxuICAgICAgICAgIGNvbXB1dGVkID0gaXRlcmF0ZWUgPyBpdGVyYXRlZSh2YWx1ZSwgaSwgYXJyYXkpIDogdmFsdWU7XG4gICAgICBpZiAoaXNTb3J0ZWQpIHtcbiAgICAgICAgaWYgKCFpIHx8IHNlZW4gIT09IGNvbXB1dGVkKSByZXN1bHQucHVzaCh2YWx1ZSk7XG4gICAgICAgIHNlZW4gPSBjb21wdXRlZDtcbiAgICAgIH0gZWxzZSBpZiAoaXRlcmF0ZWUpIHtcbiAgICAgICAgaWYgKCFfLmNvbnRhaW5zKHNlZW4sIGNvbXB1dGVkKSkge1xuICAgICAgICAgIHNlZW4ucHVzaChjb21wdXRlZCk7XG4gICAgICAgICAgcmVzdWx0LnB1c2godmFsdWUpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKCFfLmNvbnRhaW5zKHJlc3VsdCwgdmFsdWUpKSB7XG4gICAgICAgIHJlc3VsdC5wdXNoKHZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBQcm9kdWNlIGFuIGFycmF5IHRoYXQgY29udGFpbnMgdGhlIHVuaW9uOiBlYWNoIGRpc3RpbmN0IGVsZW1lbnQgZnJvbSBhbGwgb2ZcbiAgLy8gdGhlIHBhc3NlZC1pbiBhcnJheXMuXG4gIF8udW5pb24gPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gXy51bmlxKGZsYXR0ZW4oYXJndW1lbnRzLCB0cnVlLCB0cnVlKSk7XG4gIH07XG5cbiAgLy8gUHJvZHVjZSBhbiBhcnJheSB0aGF0IGNvbnRhaW5zIGV2ZXJ5IGl0ZW0gc2hhcmVkIGJldHdlZW4gYWxsIHRoZVxuICAvLyBwYXNzZWQtaW4gYXJyYXlzLlxuICBfLmludGVyc2VjdGlvbiA9IGZ1bmN0aW9uKGFycmF5KSB7XG4gICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgIHZhciBhcmdzTGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gZ2V0TGVuZ3RoKGFycmF5KTsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgaXRlbSA9IGFycmF5W2ldO1xuICAgICAgaWYgKF8uY29udGFpbnMocmVzdWx0LCBpdGVtKSkgY29udGludWU7XG4gICAgICBmb3IgKHZhciBqID0gMTsgaiA8IGFyZ3NMZW5ndGg7IGorKykge1xuICAgICAgICBpZiAoIV8uY29udGFpbnMoYXJndW1lbnRzW2pdLCBpdGVtKSkgYnJlYWs7XG4gICAgICB9XG4gICAgICBpZiAoaiA9PT0gYXJnc0xlbmd0aCkgcmVzdWx0LnB1c2goaXRlbSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgLy8gVGFrZSB0aGUgZGlmZmVyZW5jZSBiZXR3ZWVuIG9uZSBhcnJheSBhbmQgYSBudW1iZXIgb2Ygb3RoZXIgYXJyYXlzLlxuICAvLyBPbmx5IHRoZSBlbGVtZW50cyBwcmVzZW50IGluIGp1c3QgdGhlIGZpcnN0IGFycmF5IHdpbGwgcmVtYWluLlxuICBfLmRpZmZlcmVuY2UgPSBmdW5jdGlvbihhcnJheSkge1xuICAgIHZhciByZXN0ID0gZmxhdHRlbihhcmd1bWVudHMsIHRydWUsIHRydWUsIDEpO1xuICAgIHJldHVybiBfLmZpbHRlcihhcnJheSwgZnVuY3Rpb24odmFsdWUpe1xuICAgICAgcmV0dXJuICFfLmNvbnRhaW5zKHJlc3QsIHZhbHVlKTtcbiAgICB9KTtcbiAgfTtcblxuICAvLyBaaXAgdG9nZXRoZXIgbXVsdGlwbGUgbGlzdHMgaW50byBhIHNpbmdsZSBhcnJheSAtLSBlbGVtZW50cyB0aGF0IHNoYXJlXG4gIC8vIGFuIGluZGV4IGdvIHRvZ2V0aGVyLlxuICBfLnppcCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBfLnVuemlwKGFyZ3VtZW50cyk7XG4gIH07XG5cbiAgLy8gQ29tcGxlbWVudCBvZiBfLnppcC4gVW56aXAgYWNjZXB0cyBhbiBhcnJheSBvZiBhcnJheXMgYW5kIGdyb3Vwc1xuICAvLyBlYWNoIGFycmF5J3MgZWxlbWVudHMgb24gc2hhcmVkIGluZGljZXNcbiAgXy51bnppcCA9IGZ1bmN0aW9uKGFycmF5KSB7XG4gICAgdmFyIGxlbmd0aCA9IGFycmF5ICYmIF8ubWF4KGFycmF5LCBnZXRMZW5ndGgpLmxlbmd0aCB8fCAwO1xuICAgIHZhciByZXN1bHQgPSBBcnJheShsZW5ndGgpO1xuXG4gICAgZm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgcmVzdWx0W2luZGV4XSA9IF8ucGx1Y2soYXJyYXksIGluZGV4KTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBDb252ZXJ0cyBsaXN0cyBpbnRvIG9iamVjdHMuIFBhc3MgZWl0aGVyIGEgc2luZ2xlIGFycmF5IG9mIGBba2V5LCB2YWx1ZV1gXG4gIC8vIHBhaXJzLCBvciB0d28gcGFyYWxsZWwgYXJyYXlzIG9mIHRoZSBzYW1lIGxlbmd0aCAtLSBvbmUgb2Yga2V5cywgYW5kIG9uZSBvZlxuICAvLyB0aGUgY29ycmVzcG9uZGluZyB2YWx1ZXMuXG4gIF8ub2JqZWN0ID0gZnVuY3Rpb24obGlzdCwgdmFsdWVzKSB7XG4gICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBnZXRMZW5ndGgobGlzdCk7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHZhbHVlcykge1xuICAgICAgICByZXN1bHRbbGlzdFtpXV0gPSB2YWx1ZXNbaV07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXN1bHRbbGlzdFtpXVswXV0gPSBsaXN0W2ldWzFdO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8vIEdlbmVyYXRvciBmdW5jdGlvbiB0byBjcmVhdGUgdGhlIGZpbmRJbmRleCBhbmQgZmluZExhc3RJbmRleCBmdW5jdGlvbnNcbiAgZnVuY3Rpb24gY3JlYXRlUHJlZGljYXRlSW5kZXhGaW5kZXIoZGlyKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGFycmF5LCBwcmVkaWNhdGUsIGNvbnRleHQpIHtcbiAgICAgIHByZWRpY2F0ZSA9IGNiKHByZWRpY2F0ZSwgY29udGV4dCk7XG4gICAgICB2YXIgbGVuZ3RoID0gZ2V0TGVuZ3RoKGFycmF5KTtcbiAgICAgIHZhciBpbmRleCA9IGRpciA+IDAgPyAwIDogbGVuZ3RoIC0gMTtcbiAgICAgIGZvciAoOyBpbmRleCA+PSAwICYmIGluZGV4IDwgbGVuZ3RoOyBpbmRleCArPSBkaXIpIHtcbiAgICAgICAgaWYgKHByZWRpY2F0ZShhcnJheVtpbmRleF0sIGluZGV4LCBhcnJheSkpIHJldHVybiBpbmRleDtcbiAgICAgIH1cbiAgICAgIHJldHVybiAtMTtcbiAgICB9O1xuICB9XG5cbiAgLy8gUmV0dXJucyB0aGUgZmlyc3QgaW5kZXggb24gYW4gYXJyYXktbGlrZSB0aGF0IHBhc3NlcyBhIHByZWRpY2F0ZSB0ZXN0XG4gIF8uZmluZEluZGV4ID0gY3JlYXRlUHJlZGljYXRlSW5kZXhGaW5kZXIoMSk7XG4gIF8uZmluZExhc3RJbmRleCA9IGNyZWF0ZVByZWRpY2F0ZUluZGV4RmluZGVyKC0xKTtcblxuICAvLyBVc2UgYSBjb21wYXJhdG9yIGZ1bmN0aW9uIHRvIGZpZ3VyZSBvdXQgdGhlIHNtYWxsZXN0IGluZGV4IGF0IHdoaWNoXG4gIC8vIGFuIG9iamVjdCBzaG91bGQgYmUgaW5zZXJ0ZWQgc28gYXMgdG8gbWFpbnRhaW4gb3JkZXIuIFVzZXMgYmluYXJ5IHNlYXJjaC5cbiAgXy5zb3J0ZWRJbmRleCA9IGZ1bmN0aW9uKGFycmF5LCBvYmosIGl0ZXJhdGVlLCBjb250ZXh0KSB7XG4gICAgaXRlcmF0ZWUgPSBjYihpdGVyYXRlZSwgY29udGV4dCwgMSk7XG4gICAgdmFyIHZhbHVlID0gaXRlcmF0ZWUob2JqKTtcbiAgICB2YXIgbG93ID0gMCwgaGlnaCA9IGdldExlbmd0aChhcnJheSk7XG4gICAgd2hpbGUgKGxvdyA8IGhpZ2gpIHtcbiAgICAgIHZhciBtaWQgPSBNYXRoLmZsb29yKChsb3cgKyBoaWdoKSAvIDIpO1xuICAgICAgaWYgKGl0ZXJhdGVlKGFycmF5W21pZF0pIDwgdmFsdWUpIGxvdyA9IG1pZCArIDE7IGVsc2UgaGlnaCA9IG1pZDtcbiAgICB9XG4gICAgcmV0dXJuIGxvdztcbiAgfTtcblxuICAvLyBHZW5lcmF0b3IgZnVuY3Rpb24gdG8gY3JlYXRlIHRoZSBpbmRleE9mIGFuZCBsYXN0SW5kZXhPZiBmdW5jdGlvbnNcbiAgZnVuY3Rpb24gY3JlYXRlSW5kZXhGaW5kZXIoZGlyLCBwcmVkaWNhdGVGaW5kLCBzb3J0ZWRJbmRleCkge1xuICAgIHJldHVybiBmdW5jdGlvbihhcnJheSwgaXRlbSwgaWR4KSB7XG4gICAgICB2YXIgaSA9IDAsIGxlbmd0aCA9IGdldExlbmd0aChhcnJheSk7XG4gICAgICBpZiAodHlwZW9mIGlkeCA9PSAnbnVtYmVyJykge1xuICAgICAgICBpZiAoZGlyID4gMCkge1xuICAgICAgICAgICAgaSA9IGlkeCA+PSAwID8gaWR4IDogTWF0aC5tYXgoaWR4ICsgbGVuZ3RoLCBpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxlbmd0aCA9IGlkeCA+PSAwID8gTWF0aC5taW4oaWR4ICsgMSwgbGVuZ3RoKSA6IGlkeCArIGxlbmd0aCArIDE7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoc29ydGVkSW5kZXggJiYgaWR4ICYmIGxlbmd0aCkge1xuICAgICAgICBpZHggPSBzb3J0ZWRJbmRleChhcnJheSwgaXRlbSk7XG4gICAgICAgIHJldHVybiBhcnJheVtpZHhdID09PSBpdGVtID8gaWR4IDogLTE7XG4gICAgICB9XG4gICAgICBpZiAoaXRlbSAhPT0gaXRlbSkge1xuICAgICAgICBpZHggPSBwcmVkaWNhdGVGaW5kKHNsaWNlLmNhbGwoYXJyYXksIGksIGxlbmd0aCksIF8uaXNOYU4pO1xuICAgICAgICByZXR1cm4gaWR4ID49IDAgPyBpZHggKyBpIDogLTE7XG4gICAgICB9XG4gICAgICBmb3IgKGlkeCA9IGRpciA+IDAgPyBpIDogbGVuZ3RoIC0gMTsgaWR4ID49IDAgJiYgaWR4IDwgbGVuZ3RoOyBpZHggKz0gZGlyKSB7XG4gICAgICAgIGlmIChhcnJheVtpZHhdID09PSBpdGVtKSByZXR1cm4gaWR4O1xuICAgICAgfVxuICAgICAgcmV0dXJuIC0xO1xuICAgIH07XG4gIH1cblxuICAvLyBSZXR1cm4gdGhlIHBvc2l0aW9uIG9mIHRoZSBmaXJzdCBvY2N1cnJlbmNlIG9mIGFuIGl0ZW0gaW4gYW4gYXJyYXksXG4gIC8vIG9yIC0xIGlmIHRoZSBpdGVtIGlzIG5vdCBpbmNsdWRlZCBpbiB0aGUgYXJyYXkuXG4gIC8vIElmIHRoZSBhcnJheSBpcyBsYXJnZSBhbmQgYWxyZWFkeSBpbiBzb3J0IG9yZGVyLCBwYXNzIGB0cnVlYFxuICAvLyBmb3IgKippc1NvcnRlZCoqIHRvIHVzZSBiaW5hcnkgc2VhcmNoLlxuICBfLmluZGV4T2YgPSBjcmVhdGVJbmRleEZpbmRlcigxLCBfLmZpbmRJbmRleCwgXy5zb3J0ZWRJbmRleCk7XG4gIF8ubGFzdEluZGV4T2YgPSBjcmVhdGVJbmRleEZpbmRlcigtMSwgXy5maW5kTGFzdEluZGV4KTtcblxuICAvLyBHZW5lcmF0ZSBhbiBpbnRlZ2VyIEFycmF5IGNvbnRhaW5pbmcgYW4gYXJpdGhtZXRpYyBwcm9ncmVzc2lvbi4gQSBwb3J0IG9mXG4gIC8vIHRoZSBuYXRpdmUgUHl0aG9uIGByYW5nZSgpYCBmdW5jdGlvbi4gU2VlXG4gIC8vIFt0aGUgUHl0aG9uIGRvY3VtZW50YXRpb25dKGh0dHA6Ly9kb2NzLnB5dGhvbi5vcmcvbGlicmFyeS9mdW5jdGlvbnMuaHRtbCNyYW5nZSkuXG4gIF8ucmFuZ2UgPSBmdW5jdGlvbihzdGFydCwgc3RvcCwgc3RlcCkge1xuICAgIGlmIChzdG9wID09IG51bGwpIHtcbiAgICAgIHN0b3AgPSBzdGFydCB8fCAwO1xuICAgICAgc3RhcnQgPSAwO1xuICAgIH1cbiAgICBzdGVwID0gc3RlcCB8fCAxO1xuXG4gICAgdmFyIGxlbmd0aCA9IE1hdGgubWF4KE1hdGguY2VpbCgoc3RvcCAtIHN0YXJ0KSAvIHN0ZXApLCAwKTtcbiAgICB2YXIgcmFuZ2UgPSBBcnJheShsZW5ndGgpO1xuXG4gICAgZm9yICh2YXIgaWR4ID0gMDsgaWR4IDwgbGVuZ3RoOyBpZHgrKywgc3RhcnQgKz0gc3RlcCkge1xuICAgICAgcmFuZ2VbaWR4XSA9IHN0YXJ0O1xuICAgIH1cblxuICAgIHJldHVybiByYW5nZTtcbiAgfTtcblxuICAvLyBGdW5jdGlvbiAoYWhlbSkgRnVuY3Rpb25zXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIERldGVybWluZXMgd2hldGhlciB0byBleGVjdXRlIGEgZnVuY3Rpb24gYXMgYSBjb25zdHJ1Y3RvclxuICAvLyBvciBhIG5vcm1hbCBmdW5jdGlvbiB3aXRoIHRoZSBwcm92aWRlZCBhcmd1bWVudHNcbiAgdmFyIGV4ZWN1dGVCb3VuZCA9IGZ1bmN0aW9uKHNvdXJjZUZ1bmMsIGJvdW5kRnVuYywgY29udGV4dCwgY2FsbGluZ0NvbnRleHQsIGFyZ3MpIHtcbiAgICBpZiAoIShjYWxsaW5nQ29udGV4dCBpbnN0YW5jZW9mIGJvdW5kRnVuYykpIHJldHVybiBzb3VyY2VGdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgIHZhciBzZWxmID0gYmFzZUNyZWF0ZShzb3VyY2VGdW5jLnByb3RvdHlwZSk7XG4gICAgdmFyIHJlc3VsdCA9IHNvdXJjZUZ1bmMuYXBwbHkoc2VsZiwgYXJncyk7XG4gICAgaWYgKF8uaXNPYmplY3QocmVzdWx0KSkgcmV0dXJuIHJlc3VsdDtcbiAgICByZXR1cm4gc2VsZjtcbiAgfTtcblxuICAvLyBDcmVhdGUgYSBmdW5jdGlvbiBib3VuZCB0byBhIGdpdmVuIG9iamVjdCAoYXNzaWduaW5nIGB0aGlzYCwgYW5kIGFyZ3VtZW50cyxcbiAgLy8gb3B0aW9uYWxseSkuIERlbGVnYXRlcyB0byAqKkVDTUFTY3JpcHQgNSoqJ3MgbmF0aXZlIGBGdW5jdGlvbi5iaW5kYCBpZlxuICAvLyBhdmFpbGFibGUuXG4gIF8uYmluZCA9IGZ1bmN0aW9uKGZ1bmMsIGNvbnRleHQpIHtcbiAgICBpZiAobmF0aXZlQmluZCAmJiBmdW5jLmJpbmQgPT09IG5hdGl2ZUJpbmQpIHJldHVybiBuYXRpdmVCaW5kLmFwcGx5KGZ1bmMsIHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSk7XG4gICAgaWYgKCFfLmlzRnVuY3Rpb24oZnVuYykpIHRocm93IG5ldyBUeXBlRXJyb3IoJ0JpbmQgbXVzdCBiZSBjYWxsZWQgb24gYSBmdW5jdGlvbicpO1xuICAgIHZhciBhcmdzID0gc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpO1xuICAgIHZhciBib3VuZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGV4ZWN1dGVCb3VuZChmdW5jLCBib3VuZCwgY29udGV4dCwgdGhpcywgYXJncy5jb25jYXQoc2xpY2UuY2FsbChhcmd1bWVudHMpKSk7XG4gICAgfTtcbiAgICByZXR1cm4gYm91bmQ7XG4gIH07XG5cbiAgLy8gUGFydGlhbGx5IGFwcGx5IGEgZnVuY3Rpb24gYnkgY3JlYXRpbmcgYSB2ZXJzaW9uIHRoYXQgaGFzIGhhZCBzb21lIG9mIGl0c1xuICAvLyBhcmd1bWVudHMgcHJlLWZpbGxlZCwgd2l0aG91dCBjaGFuZ2luZyBpdHMgZHluYW1pYyBgdGhpc2AgY29udGV4dC4gXyBhY3RzXG4gIC8vIGFzIGEgcGxhY2Vob2xkZXIsIGFsbG93aW5nIGFueSBjb21iaW5hdGlvbiBvZiBhcmd1bWVudHMgdG8gYmUgcHJlLWZpbGxlZC5cbiAgXy5wYXJ0aWFsID0gZnVuY3Rpb24oZnVuYykge1xuICAgIHZhciBib3VuZEFyZ3MgPSBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgdmFyIGJvdW5kID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcG9zaXRpb24gPSAwLCBsZW5ndGggPSBib3VuZEFyZ3MubGVuZ3RoO1xuICAgICAgdmFyIGFyZ3MgPSBBcnJheShsZW5ndGgpO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBhcmdzW2ldID0gYm91bmRBcmdzW2ldID09PSBfID8gYXJndW1lbnRzW3Bvc2l0aW9uKytdIDogYm91bmRBcmdzW2ldO1xuICAgICAgfVxuICAgICAgd2hpbGUgKHBvc2l0aW9uIDwgYXJndW1lbnRzLmxlbmd0aCkgYXJncy5wdXNoKGFyZ3VtZW50c1twb3NpdGlvbisrXSk7XG4gICAgICByZXR1cm4gZXhlY3V0ZUJvdW5kKGZ1bmMsIGJvdW5kLCB0aGlzLCB0aGlzLCBhcmdzKTtcbiAgICB9O1xuICAgIHJldHVybiBib3VuZDtcbiAgfTtcblxuICAvLyBCaW5kIGEgbnVtYmVyIG9mIGFuIG9iamVjdCdzIG1ldGhvZHMgdG8gdGhhdCBvYmplY3QuIFJlbWFpbmluZyBhcmd1bWVudHNcbiAgLy8gYXJlIHRoZSBtZXRob2QgbmFtZXMgdG8gYmUgYm91bmQuIFVzZWZ1bCBmb3IgZW5zdXJpbmcgdGhhdCBhbGwgY2FsbGJhY2tzXG4gIC8vIGRlZmluZWQgb24gYW4gb2JqZWN0IGJlbG9uZyB0byBpdC5cbiAgXy5iaW5kQWxsID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIGksIGxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGgsIGtleTtcbiAgICBpZiAobGVuZ3RoIDw9IDEpIHRocm93IG5ldyBFcnJvcignYmluZEFsbCBtdXN0IGJlIHBhc3NlZCBmdW5jdGlvbiBuYW1lcycpO1xuICAgIGZvciAoaSA9IDE7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAga2V5ID0gYXJndW1lbnRzW2ldO1xuICAgICAgb2JqW2tleV0gPSBfLmJpbmQob2JqW2tleV0sIG9iaik7XG4gICAgfVxuICAgIHJldHVybiBvYmo7XG4gIH07XG5cbiAgLy8gTWVtb2l6ZSBhbiBleHBlbnNpdmUgZnVuY3Rpb24gYnkgc3RvcmluZyBpdHMgcmVzdWx0cy5cbiAgXy5tZW1vaXplID0gZnVuY3Rpb24oZnVuYywgaGFzaGVyKSB7XG4gICAgdmFyIG1lbW9pemUgPSBmdW5jdGlvbihrZXkpIHtcbiAgICAgIHZhciBjYWNoZSA9IG1lbW9pemUuY2FjaGU7XG4gICAgICB2YXIgYWRkcmVzcyA9ICcnICsgKGhhc2hlciA/IGhhc2hlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpIDoga2V5KTtcbiAgICAgIGlmICghXy5oYXMoY2FjaGUsIGFkZHJlc3MpKSBjYWNoZVthZGRyZXNzXSA9IGZ1bmMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIHJldHVybiBjYWNoZVthZGRyZXNzXTtcbiAgICB9O1xuICAgIG1lbW9pemUuY2FjaGUgPSB7fTtcbiAgICByZXR1cm4gbWVtb2l6ZTtcbiAgfTtcblxuICAvLyBEZWxheXMgYSBmdW5jdGlvbiBmb3IgdGhlIGdpdmVuIG51bWJlciBvZiBtaWxsaXNlY29uZHMsIGFuZCB0aGVuIGNhbGxzXG4gIC8vIGl0IHdpdGggdGhlIGFyZ3VtZW50cyBzdXBwbGllZC5cbiAgXy5kZWxheSA9IGZ1bmN0aW9uKGZ1bmMsIHdhaXQpIHtcbiAgICB2YXIgYXJncyA9IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKTtcbiAgICByZXR1cm4gc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIGZ1bmMuYXBwbHkobnVsbCwgYXJncyk7XG4gICAgfSwgd2FpdCk7XG4gIH07XG5cbiAgLy8gRGVmZXJzIGEgZnVuY3Rpb24sIHNjaGVkdWxpbmcgaXQgdG8gcnVuIGFmdGVyIHRoZSBjdXJyZW50IGNhbGwgc3RhY2sgaGFzXG4gIC8vIGNsZWFyZWQuXG4gIF8uZGVmZXIgPSBfLnBhcnRpYWwoXy5kZWxheSwgXywgMSk7XG5cbiAgLy8gUmV0dXJucyBhIGZ1bmN0aW9uLCB0aGF0LCB3aGVuIGludm9rZWQsIHdpbGwgb25seSBiZSB0cmlnZ2VyZWQgYXQgbW9zdCBvbmNlXG4gIC8vIGR1cmluZyBhIGdpdmVuIHdpbmRvdyBvZiB0aW1lLiBOb3JtYWxseSwgdGhlIHRocm90dGxlZCBmdW5jdGlvbiB3aWxsIHJ1blxuICAvLyBhcyBtdWNoIGFzIGl0IGNhbiwgd2l0aG91dCBldmVyIGdvaW5nIG1vcmUgdGhhbiBvbmNlIHBlciBgd2FpdGAgZHVyYXRpb247XG4gIC8vIGJ1dCBpZiB5b3UnZCBsaWtlIHRvIGRpc2FibGUgdGhlIGV4ZWN1dGlvbiBvbiB0aGUgbGVhZGluZyBlZGdlLCBwYXNzXG4gIC8vIGB7bGVhZGluZzogZmFsc2V9YC4gVG8gZGlzYWJsZSBleGVjdXRpb24gb24gdGhlIHRyYWlsaW5nIGVkZ2UsIGRpdHRvLlxuICBfLnRocm90dGxlID0gZnVuY3Rpb24oZnVuYywgd2FpdCwgb3B0aW9ucykge1xuICAgIHZhciBjb250ZXh0LCBhcmdzLCByZXN1bHQ7XG4gICAgdmFyIHRpbWVvdXQgPSBudWxsO1xuICAgIHZhciBwcmV2aW91cyA9IDA7XG4gICAgaWYgKCFvcHRpb25zKSBvcHRpb25zID0ge307XG4gICAgdmFyIGxhdGVyID0gZnVuY3Rpb24oKSB7XG4gICAgICBwcmV2aW91cyA9IG9wdGlvbnMubGVhZGluZyA9PT0gZmFsc2UgPyAwIDogXy5ub3coKTtcbiAgICAgIHRpbWVvdXQgPSBudWxsO1xuICAgICAgcmVzdWx0ID0gZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgIGlmICghdGltZW91dCkgY29udGV4dCA9IGFyZ3MgPSBudWxsO1xuICAgIH07XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIG5vdyA9IF8ubm93KCk7XG4gICAgICBpZiAoIXByZXZpb3VzICYmIG9wdGlvbnMubGVhZGluZyA9PT0gZmFsc2UpIHByZXZpb3VzID0gbm93O1xuICAgICAgdmFyIHJlbWFpbmluZyA9IHdhaXQgLSAobm93IC0gcHJldmlvdXMpO1xuICAgICAgY29udGV4dCA9IHRoaXM7XG4gICAgICBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgaWYgKHJlbWFpbmluZyA8PSAwIHx8IHJlbWFpbmluZyA+IHdhaXQpIHtcbiAgICAgICAgaWYgKHRpbWVvdXQpIHtcbiAgICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICAgICAgdGltZW91dCA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgcHJldmlvdXMgPSBub3c7XG4gICAgICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgICAgIGlmICghdGltZW91dCkgY29udGV4dCA9IGFyZ3MgPSBudWxsO1xuICAgICAgfSBlbHNlIGlmICghdGltZW91dCAmJiBvcHRpb25zLnRyYWlsaW5nICE9PSBmYWxzZSkge1xuICAgICAgICB0aW1lb3V0ID0gc2V0VGltZW91dChsYXRlciwgcmVtYWluaW5nKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGEgZnVuY3Rpb24sIHRoYXQsIGFzIGxvbmcgYXMgaXQgY29udGludWVzIHRvIGJlIGludm9rZWQsIHdpbGwgbm90XG4gIC8vIGJlIHRyaWdnZXJlZC4gVGhlIGZ1bmN0aW9uIHdpbGwgYmUgY2FsbGVkIGFmdGVyIGl0IHN0b3BzIGJlaW5nIGNhbGxlZCBmb3JcbiAgLy8gTiBtaWxsaXNlY29uZHMuIElmIGBpbW1lZGlhdGVgIGlzIHBhc3NlZCwgdHJpZ2dlciB0aGUgZnVuY3Rpb24gb24gdGhlXG4gIC8vIGxlYWRpbmcgZWRnZSwgaW5zdGVhZCBvZiB0aGUgdHJhaWxpbmcuXG4gIF8uZGVib3VuY2UgPSBmdW5jdGlvbihmdW5jLCB3YWl0LCBpbW1lZGlhdGUpIHtcbiAgICB2YXIgdGltZW91dCwgYXJncywgY29udGV4dCwgdGltZXN0YW1wLCByZXN1bHQ7XG5cbiAgICB2YXIgbGF0ZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBsYXN0ID0gXy5ub3coKSAtIHRpbWVzdGFtcDtcblxuICAgICAgaWYgKGxhc3QgPCB3YWl0ICYmIGxhc3QgPj0gMCkge1xuICAgICAgICB0aW1lb3V0ID0gc2V0VGltZW91dChsYXRlciwgd2FpdCAtIGxhc3QpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGltZW91dCA9IG51bGw7XG4gICAgICAgIGlmICghaW1tZWRpYXRlKSB7XG4gICAgICAgICAgcmVzdWx0ID0gZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgICAgICBpZiAoIXRpbWVvdXQpIGNvbnRleHQgPSBhcmdzID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICBjb250ZXh0ID0gdGhpcztcbiAgICAgIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICB0aW1lc3RhbXAgPSBfLm5vdygpO1xuICAgICAgdmFyIGNhbGxOb3cgPSBpbW1lZGlhdGUgJiYgIXRpbWVvdXQ7XG4gICAgICBpZiAoIXRpbWVvdXQpIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGxhdGVyLCB3YWl0KTtcbiAgICAgIGlmIChjYWxsTm93KSB7XG4gICAgICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgICAgIGNvbnRleHQgPSBhcmdzID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuICB9O1xuXG4gIC8vIFJldHVybnMgdGhlIGZpcnN0IGZ1bmN0aW9uIHBhc3NlZCBhcyBhbiBhcmd1bWVudCB0byB0aGUgc2Vjb25kLFxuICAvLyBhbGxvd2luZyB5b3UgdG8gYWRqdXN0IGFyZ3VtZW50cywgcnVuIGNvZGUgYmVmb3JlIGFuZCBhZnRlciwgYW5kXG4gIC8vIGNvbmRpdGlvbmFsbHkgZXhlY3V0ZSB0aGUgb3JpZ2luYWwgZnVuY3Rpb24uXG4gIF8ud3JhcCA9IGZ1bmN0aW9uKGZ1bmMsIHdyYXBwZXIpIHtcbiAgICByZXR1cm4gXy5wYXJ0aWFsKHdyYXBwZXIsIGZ1bmMpO1xuICB9O1xuXG4gIC8vIFJldHVybnMgYSBuZWdhdGVkIHZlcnNpb24gb2YgdGhlIHBhc3NlZC1pbiBwcmVkaWNhdGUuXG4gIF8ubmVnYXRlID0gZnVuY3Rpb24ocHJlZGljYXRlKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuICFwcmVkaWNhdGUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9O1xuICB9O1xuXG4gIC8vIFJldHVybnMgYSBmdW5jdGlvbiB0aGF0IGlzIHRoZSBjb21wb3NpdGlvbiBvZiBhIGxpc3Qgb2YgZnVuY3Rpb25zLCBlYWNoXG4gIC8vIGNvbnN1bWluZyB0aGUgcmV0dXJuIHZhbHVlIG9mIHRoZSBmdW5jdGlvbiB0aGF0IGZvbGxvd3MuXG4gIF8uY29tcG9zZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICAgIHZhciBzdGFydCA9IGFyZ3MubGVuZ3RoIC0gMTtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgaSA9IHN0YXJ0O1xuICAgICAgdmFyIHJlc3VsdCA9IGFyZ3Nbc3RhcnRdLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICB3aGlsZSAoaS0tKSByZXN1bHQgPSBhcmdzW2ldLmNhbGwodGhpcywgcmVzdWx0KTtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGEgZnVuY3Rpb24gdGhhdCB3aWxsIG9ubHkgYmUgZXhlY3V0ZWQgb24gYW5kIGFmdGVyIHRoZSBOdGggY2FsbC5cbiAgXy5hZnRlciA9IGZ1bmN0aW9uKHRpbWVzLCBmdW5jKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKC0tdGltZXMgPCAxKSB7XG4gICAgICAgIHJldHVybiBmdW5jLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICB9XG4gICAgfTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGEgZnVuY3Rpb24gdGhhdCB3aWxsIG9ubHkgYmUgZXhlY3V0ZWQgdXAgdG8gKGJ1dCBub3QgaW5jbHVkaW5nKSB0aGUgTnRoIGNhbGwuXG4gIF8uYmVmb3JlID0gZnVuY3Rpb24odGltZXMsIGZ1bmMpIHtcbiAgICB2YXIgbWVtbztcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoLS10aW1lcyA+IDApIHtcbiAgICAgICAgbWVtbyA9IGZ1bmMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aW1lcyA8PSAxKSBmdW5jID0gbnVsbDtcbiAgICAgIHJldHVybiBtZW1vO1xuICAgIH07XG4gIH07XG5cbiAgLy8gUmV0dXJucyBhIGZ1bmN0aW9uIHRoYXQgd2lsbCBiZSBleGVjdXRlZCBhdCBtb3N0IG9uZSB0aW1lLCBubyBtYXR0ZXIgaG93XG4gIC8vIG9mdGVuIHlvdSBjYWxsIGl0LiBVc2VmdWwgZm9yIGxhenkgaW5pdGlhbGl6YXRpb24uXG4gIF8ub25jZSA9IF8ucGFydGlhbChfLmJlZm9yZSwgMik7XG5cbiAgLy8gT2JqZWN0IEZ1bmN0aW9uc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gS2V5cyBpbiBJRSA8IDkgdGhhdCB3b24ndCBiZSBpdGVyYXRlZCBieSBgZm9yIGtleSBpbiAuLi5gIGFuZCB0aHVzIG1pc3NlZC5cbiAgdmFyIGhhc0VudW1CdWcgPSAhe3RvU3RyaW5nOiBudWxsfS5wcm9wZXJ0eUlzRW51bWVyYWJsZSgndG9TdHJpbmcnKTtcbiAgdmFyIG5vbkVudW1lcmFibGVQcm9wcyA9IFsndmFsdWVPZicsICdpc1Byb3RvdHlwZU9mJywgJ3RvU3RyaW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAncHJvcGVydHlJc0VudW1lcmFibGUnLCAnaGFzT3duUHJvcGVydHknLCAndG9Mb2NhbGVTdHJpbmcnXTtcblxuICBmdW5jdGlvbiBjb2xsZWN0Tm9uRW51bVByb3BzKG9iaiwga2V5cykge1xuICAgIHZhciBub25FbnVtSWR4ID0gbm9uRW51bWVyYWJsZVByb3BzLmxlbmd0aDtcbiAgICB2YXIgY29uc3RydWN0b3IgPSBvYmouY29uc3RydWN0b3I7XG4gICAgdmFyIHByb3RvID0gKF8uaXNGdW5jdGlvbihjb25zdHJ1Y3RvcikgJiYgY29uc3RydWN0b3IucHJvdG90eXBlKSB8fCBPYmpQcm90bztcblxuICAgIC8vIENvbnN0cnVjdG9yIGlzIGEgc3BlY2lhbCBjYXNlLlxuICAgIHZhciBwcm9wID0gJ2NvbnN0cnVjdG9yJztcbiAgICBpZiAoXy5oYXMob2JqLCBwcm9wKSAmJiAhXy5jb250YWlucyhrZXlzLCBwcm9wKSkga2V5cy5wdXNoKHByb3ApO1xuXG4gICAgd2hpbGUgKG5vbkVudW1JZHgtLSkge1xuICAgICAgcHJvcCA9IG5vbkVudW1lcmFibGVQcm9wc1tub25FbnVtSWR4XTtcbiAgICAgIGlmIChwcm9wIGluIG9iaiAmJiBvYmpbcHJvcF0gIT09IHByb3RvW3Byb3BdICYmICFfLmNvbnRhaW5zKGtleXMsIHByb3ApKSB7XG4gICAgICAgIGtleXMucHVzaChwcm9wKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBSZXRyaWV2ZSB0aGUgbmFtZXMgb2YgYW4gb2JqZWN0J3Mgb3duIHByb3BlcnRpZXMuXG4gIC8vIERlbGVnYXRlcyB0byAqKkVDTUFTY3JpcHQgNSoqJ3MgbmF0aXZlIGBPYmplY3Qua2V5c2BcbiAgXy5rZXlzID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKCFfLmlzT2JqZWN0KG9iaikpIHJldHVybiBbXTtcbiAgICBpZiAobmF0aXZlS2V5cykgcmV0dXJuIG5hdGl2ZUtleXMob2JqKTtcbiAgICB2YXIga2V5cyA9IFtdO1xuICAgIGZvciAodmFyIGtleSBpbiBvYmopIGlmIChfLmhhcyhvYmosIGtleSkpIGtleXMucHVzaChrZXkpO1xuICAgIC8vIEFoZW0sIElFIDwgOS5cbiAgICBpZiAoaGFzRW51bUJ1ZykgY29sbGVjdE5vbkVudW1Qcm9wcyhvYmosIGtleXMpO1xuICAgIHJldHVybiBrZXlzO1xuICB9O1xuXG4gIC8vIFJldHJpZXZlIGFsbCB0aGUgcHJvcGVydHkgbmFtZXMgb2YgYW4gb2JqZWN0LlxuICBfLmFsbEtleXMgPSBmdW5jdGlvbihvYmopIHtcbiAgICBpZiAoIV8uaXNPYmplY3Qob2JqKSkgcmV0dXJuIFtdO1xuICAgIHZhciBrZXlzID0gW107XG4gICAgZm9yICh2YXIga2V5IGluIG9iaikga2V5cy5wdXNoKGtleSk7XG4gICAgLy8gQWhlbSwgSUUgPCA5LlxuICAgIGlmIChoYXNFbnVtQnVnKSBjb2xsZWN0Tm9uRW51bVByb3BzKG9iaiwga2V5cyk7XG4gICAgcmV0dXJuIGtleXM7XG4gIH07XG5cbiAgLy8gUmV0cmlldmUgdGhlIHZhbHVlcyBvZiBhbiBvYmplY3QncyBwcm9wZXJ0aWVzLlxuICBfLnZhbHVlcyA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciBrZXlzID0gXy5rZXlzKG9iaik7XG4gICAgdmFyIGxlbmd0aCA9IGtleXMubGVuZ3RoO1xuICAgIHZhciB2YWx1ZXMgPSBBcnJheShsZW5ndGgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhbHVlc1tpXSA9IG9ialtrZXlzW2ldXTtcbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlcztcbiAgfTtcblxuICAvLyBSZXR1cm5zIHRoZSByZXN1bHRzIG9mIGFwcGx5aW5nIHRoZSBpdGVyYXRlZSB0byBlYWNoIGVsZW1lbnQgb2YgdGhlIG9iamVjdFxuICAvLyBJbiBjb250cmFzdCB0byBfLm1hcCBpdCByZXR1cm5zIGFuIG9iamVjdFxuICBfLm1hcE9iamVjdCA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0ZWUsIGNvbnRleHQpIHtcbiAgICBpdGVyYXRlZSA9IGNiKGl0ZXJhdGVlLCBjb250ZXh0KTtcbiAgICB2YXIga2V5cyA9ICBfLmtleXMob2JqKSxcbiAgICAgICAgICBsZW5ndGggPSBrZXlzLmxlbmd0aCxcbiAgICAgICAgICByZXN1bHRzID0ge30sXG4gICAgICAgICAgY3VycmVudEtleTtcbiAgICAgIGZvciAodmFyIGluZGV4ID0gMDsgaW5kZXggPCBsZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgY3VycmVudEtleSA9IGtleXNbaW5kZXhdO1xuICAgICAgICByZXN1bHRzW2N1cnJlbnRLZXldID0gaXRlcmF0ZWUob2JqW2N1cnJlbnRLZXldLCBjdXJyZW50S2V5LCBvYmopO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gIH07XG5cbiAgLy8gQ29udmVydCBhbiBvYmplY3QgaW50byBhIGxpc3Qgb2YgYFtrZXksIHZhbHVlXWAgcGFpcnMuXG4gIF8ucGFpcnMgPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIga2V5cyA9IF8ua2V5cyhvYmopO1xuICAgIHZhciBsZW5ndGggPSBrZXlzLmxlbmd0aDtcbiAgICB2YXIgcGFpcnMgPSBBcnJheShsZW5ndGgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHBhaXJzW2ldID0gW2tleXNbaV0sIG9ialtrZXlzW2ldXV07XG4gICAgfVxuICAgIHJldHVybiBwYWlycztcbiAgfTtcblxuICAvLyBJbnZlcnQgdGhlIGtleXMgYW5kIHZhbHVlcyBvZiBhbiBvYmplY3QuIFRoZSB2YWx1ZXMgbXVzdCBiZSBzZXJpYWxpemFibGUuXG4gIF8uaW52ZXJ0ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgIHZhciBrZXlzID0gXy5rZXlzKG9iaik7XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGtleXMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHJlc3VsdFtvYmpba2V5c1tpXV1dID0ga2V5c1tpXTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBSZXR1cm4gYSBzb3J0ZWQgbGlzdCBvZiB0aGUgZnVuY3Rpb24gbmFtZXMgYXZhaWxhYmxlIG9uIHRoZSBvYmplY3QuXG4gIC8vIEFsaWFzZWQgYXMgYG1ldGhvZHNgXG4gIF8uZnVuY3Rpb25zID0gXy5tZXRob2RzID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIG5hbWVzID0gW107XG4gICAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgICAgaWYgKF8uaXNGdW5jdGlvbihvYmpba2V5XSkpIG5hbWVzLnB1c2goa2V5KTtcbiAgICB9XG4gICAgcmV0dXJuIG5hbWVzLnNvcnQoKTtcbiAgfTtcblxuICAvLyBFeHRlbmQgYSBnaXZlbiBvYmplY3Qgd2l0aCBhbGwgdGhlIHByb3BlcnRpZXMgaW4gcGFzc2VkLWluIG9iamVjdChzKS5cbiAgXy5leHRlbmQgPSBjcmVhdGVBc3NpZ25lcihfLmFsbEtleXMpO1xuXG4gIC8vIEFzc2lnbnMgYSBnaXZlbiBvYmplY3Qgd2l0aCBhbGwgdGhlIG93biBwcm9wZXJ0aWVzIGluIHRoZSBwYXNzZWQtaW4gb2JqZWN0KHMpXG4gIC8vIChodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9PYmplY3QvYXNzaWduKVxuICBfLmV4dGVuZE93biA9IF8uYXNzaWduID0gY3JlYXRlQXNzaWduZXIoXy5rZXlzKTtcblxuICAvLyBSZXR1cm5zIHRoZSBmaXJzdCBrZXkgb24gYW4gb2JqZWN0IHRoYXQgcGFzc2VzIGEgcHJlZGljYXRlIHRlc3RcbiAgXy5maW5kS2V5ID0gZnVuY3Rpb24ob2JqLCBwcmVkaWNhdGUsIGNvbnRleHQpIHtcbiAgICBwcmVkaWNhdGUgPSBjYihwcmVkaWNhdGUsIGNvbnRleHQpO1xuICAgIHZhciBrZXlzID0gXy5rZXlzKG9iaiksIGtleTtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0ga2V5cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAga2V5ID0ga2V5c1tpXTtcbiAgICAgIGlmIChwcmVkaWNhdGUob2JqW2tleV0sIGtleSwgb2JqKSkgcmV0dXJuIGtleTtcbiAgICB9XG4gIH07XG5cbiAgLy8gUmV0dXJuIGEgY29weSBvZiB0aGUgb2JqZWN0IG9ubHkgY29udGFpbmluZyB0aGUgd2hpdGVsaXN0ZWQgcHJvcGVydGllcy5cbiAgXy5waWNrID0gZnVuY3Rpb24ob2JqZWN0LCBvaXRlcmF0ZWUsIGNvbnRleHQpIHtcbiAgICB2YXIgcmVzdWx0ID0ge30sIG9iaiA9IG9iamVjdCwgaXRlcmF0ZWUsIGtleXM7XG4gICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gcmVzdWx0O1xuICAgIGlmIChfLmlzRnVuY3Rpb24ob2l0ZXJhdGVlKSkge1xuICAgICAga2V5cyA9IF8uYWxsS2V5cyhvYmopO1xuICAgICAgaXRlcmF0ZWUgPSBvcHRpbWl6ZUNiKG9pdGVyYXRlZSwgY29udGV4dCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGtleXMgPSBmbGF0dGVuKGFyZ3VtZW50cywgZmFsc2UsIGZhbHNlLCAxKTtcbiAgICAgIGl0ZXJhdGVlID0gZnVuY3Rpb24odmFsdWUsIGtleSwgb2JqKSB7IHJldHVybiBrZXkgaW4gb2JqOyB9O1xuICAgICAgb2JqID0gT2JqZWN0KG9iaik7XG4gICAgfVxuICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBrZXlzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIga2V5ID0ga2V5c1tpXTtcbiAgICAgIHZhciB2YWx1ZSA9IG9ialtrZXldO1xuICAgICAgaWYgKGl0ZXJhdGVlKHZhbHVlLCBrZXksIG9iaikpIHJlc3VsdFtrZXldID0gdmFsdWU7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgIC8vIFJldHVybiBhIGNvcHkgb2YgdGhlIG9iamVjdCB3aXRob3V0IHRoZSBibGFja2xpc3RlZCBwcm9wZXJ0aWVzLlxuICBfLm9taXQgPSBmdW5jdGlvbihvYmosIGl0ZXJhdGVlLCBjb250ZXh0KSB7XG4gICAgaWYgKF8uaXNGdW5jdGlvbihpdGVyYXRlZSkpIHtcbiAgICAgIGl0ZXJhdGVlID0gXy5uZWdhdGUoaXRlcmF0ZWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIga2V5cyA9IF8ubWFwKGZsYXR0ZW4oYXJndW1lbnRzLCBmYWxzZSwgZmFsc2UsIDEpLCBTdHJpbmcpO1xuICAgICAgaXRlcmF0ZWUgPSBmdW5jdGlvbih2YWx1ZSwga2V5KSB7XG4gICAgICAgIHJldHVybiAhXy5jb250YWlucyhrZXlzLCBrZXkpO1xuICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIF8ucGljayhvYmosIGl0ZXJhdGVlLCBjb250ZXh0KTtcbiAgfTtcblxuICAvLyBGaWxsIGluIGEgZ2l2ZW4gb2JqZWN0IHdpdGggZGVmYXVsdCBwcm9wZXJ0aWVzLlxuICBfLmRlZmF1bHRzID0gY3JlYXRlQXNzaWduZXIoXy5hbGxLZXlzLCB0cnVlKTtcblxuICAvLyBDcmVhdGVzIGFuIG9iamVjdCB0aGF0IGluaGVyaXRzIGZyb20gdGhlIGdpdmVuIHByb3RvdHlwZSBvYmplY3QuXG4gIC8vIElmIGFkZGl0aW9uYWwgcHJvcGVydGllcyBhcmUgcHJvdmlkZWQgdGhlbiB0aGV5IHdpbGwgYmUgYWRkZWQgdG8gdGhlXG4gIC8vIGNyZWF0ZWQgb2JqZWN0LlxuICBfLmNyZWF0ZSA9IGZ1bmN0aW9uKHByb3RvdHlwZSwgcHJvcHMpIHtcbiAgICB2YXIgcmVzdWx0ID0gYmFzZUNyZWF0ZShwcm90b3R5cGUpO1xuICAgIGlmIChwcm9wcykgXy5leHRlbmRPd24ocmVzdWx0LCBwcm9wcyk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBDcmVhdGUgYSAoc2hhbGxvdy1jbG9uZWQpIGR1cGxpY2F0ZSBvZiBhbiBvYmplY3QuXG4gIF8uY2xvbmUgPSBmdW5jdGlvbihvYmopIHtcbiAgICBpZiAoIV8uaXNPYmplY3Qob2JqKSkgcmV0dXJuIG9iajtcbiAgICByZXR1cm4gXy5pc0FycmF5KG9iaikgPyBvYmouc2xpY2UoKSA6IF8uZXh0ZW5kKHt9LCBvYmopO1xuICB9O1xuXG4gIC8vIEludm9rZXMgaW50ZXJjZXB0b3Igd2l0aCB0aGUgb2JqLCBhbmQgdGhlbiByZXR1cm5zIG9iai5cbiAgLy8gVGhlIHByaW1hcnkgcHVycG9zZSBvZiB0aGlzIG1ldGhvZCBpcyB0byBcInRhcCBpbnRvXCIgYSBtZXRob2QgY2hhaW4sIGluXG4gIC8vIG9yZGVyIHRvIHBlcmZvcm0gb3BlcmF0aW9ucyBvbiBpbnRlcm1lZGlhdGUgcmVzdWx0cyB3aXRoaW4gdGhlIGNoYWluLlxuICBfLnRhcCA9IGZ1bmN0aW9uKG9iaiwgaW50ZXJjZXB0b3IpIHtcbiAgICBpbnRlcmNlcHRvcihvYmopO1xuICAgIHJldHVybiBvYmo7XG4gIH07XG5cbiAgLy8gUmV0dXJucyB3aGV0aGVyIGFuIG9iamVjdCBoYXMgYSBnaXZlbiBzZXQgb2YgYGtleTp2YWx1ZWAgcGFpcnMuXG4gIF8uaXNNYXRjaCA9IGZ1bmN0aW9uKG9iamVjdCwgYXR0cnMpIHtcbiAgICB2YXIga2V5cyA9IF8ua2V5cyhhdHRycyksIGxlbmd0aCA9IGtleXMubGVuZ3RoO1xuICAgIGlmIChvYmplY3QgPT0gbnVsbCkgcmV0dXJuICFsZW5ndGg7XG4gICAgdmFyIG9iaiA9IE9iamVjdChvYmplY3QpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBrZXkgPSBrZXlzW2ldO1xuICAgICAgaWYgKGF0dHJzW2tleV0gIT09IG9ialtrZXldIHx8ICEoa2V5IGluIG9iaikpIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG5cblxuICAvLyBJbnRlcm5hbCByZWN1cnNpdmUgY29tcGFyaXNvbiBmdW5jdGlvbiBmb3IgYGlzRXF1YWxgLlxuICB2YXIgZXEgPSBmdW5jdGlvbihhLCBiLCBhU3RhY2ssIGJTdGFjaykge1xuICAgIC8vIElkZW50aWNhbCBvYmplY3RzIGFyZSBlcXVhbC4gYDAgPT09IC0wYCwgYnV0IHRoZXkgYXJlbid0IGlkZW50aWNhbC5cbiAgICAvLyBTZWUgdGhlIFtIYXJtb255IGBlZ2FsYCBwcm9wb3NhbF0oaHR0cDovL3dpa2kuZWNtYXNjcmlwdC5vcmcvZG9rdS5waHA/aWQ9aGFybW9ueTplZ2FsKS5cbiAgICBpZiAoYSA9PT0gYikgcmV0dXJuIGEgIT09IDAgfHwgMSAvIGEgPT09IDEgLyBiO1xuICAgIC8vIEEgc3RyaWN0IGNvbXBhcmlzb24gaXMgbmVjZXNzYXJ5IGJlY2F1c2UgYG51bGwgPT0gdW5kZWZpbmVkYC5cbiAgICBpZiAoYSA9PSBudWxsIHx8IGIgPT0gbnVsbCkgcmV0dXJuIGEgPT09IGI7XG4gICAgLy8gVW53cmFwIGFueSB3cmFwcGVkIG9iamVjdHMuXG4gICAgaWYgKGEgaW5zdGFuY2VvZiBfKSBhID0gYS5fd3JhcHBlZDtcbiAgICBpZiAoYiBpbnN0YW5jZW9mIF8pIGIgPSBiLl93cmFwcGVkO1xuICAgIC8vIENvbXBhcmUgYFtbQ2xhc3NdXWAgbmFtZXMuXG4gICAgdmFyIGNsYXNzTmFtZSA9IHRvU3RyaW5nLmNhbGwoYSk7XG4gICAgaWYgKGNsYXNzTmFtZSAhPT0gdG9TdHJpbmcuY2FsbChiKSkgcmV0dXJuIGZhbHNlO1xuICAgIHN3aXRjaCAoY2xhc3NOYW1lKSB7XG4gICAgICAvLyBTdHJpbmdzLCBudW1iZXJzLCByZWd1bGFyIGV4cHJlc3Npb25zLCBkYXRlcywgYW5kIGJvb2xlYW5zIGFyZSBjb21wYXJlZCBieSB2YWx1ZS5cbiAgICAgIGNhc2UgJ1tvYmplY3QgUmVnRXhwXSc6XG4gICAgICAvLyBSZWdFeHBzIGFyZSBjb2VyY2VkIHRvIHN0cmluZ3MgZm9yIGNvbXBhcmlzb24gKE5vdGU6ICcnICsgL2EvaSA9PT0gJy9hL2knKVxuICAgICAgY2FzZSAnW29iamVjdCBTdHJpbmddJzpcbiAgICAgICAgLy8gUHJpbWl0aXZlcyBhbmQgdGhlaXIgY29ycmVzcG9uZGluZyBvYmplY3Qgd3JhcHBlcnMgYXJlIGVxdWl2YWxlbnQ7IHRodXMsIGBcIjVcImAgaXNcbiAgICAgICAgLy8gZXF1aXZhbGVudCB0byBgbmV3IFN0cmluZyhcIjVcIilgLlxuICAgICAgICByZXR1cm4gJycgKyBhID09PSAnJyArIGI7XG4gICAgICBjYXNlICdbb2JqZWN0IE51bWJlcl0nOlxuICAgICAgICAvLyBgTmFOYHMgYXJlIGVxdWl2YWxlbnQsIGJ1dCBub24tcmVmbGV4aXZlLlxuICAgICAgICAvLyBPYmplY3QoTmFOKSBpcyBlcXVpdmFsZW50IHRvIE5hTlxuICAgICAgICBpZiAoK2EgIT09ICthKSByZXR1cm4gK2IgIT09ICtiO1xuICAgICAgICAvLyBBbiBgZWdhbGAgY29tcGFyaXNvbiBpcyBwZXJmb3JtZWQgZm9yIG90aGVyIG51bWVyaWMgdmFsdWVzLlxuICAgICAgICByZXR1cm4gK2EgPT09IDAgPyAxIC8gK2EgPT09IDEgLyBiIDogK2EgPT09ICtiO1xuICAgICAgY2FzZSAnW29iamVjdCBEYXRlXSc6XG4gICAgICBjYXNlICdbb2JqZWN0IEJvb2xlYW5dJzpcbiAgICAgICAgLy8gQ29lcmNlIGRhdGVzIGFuZCBib29sZWFucyB0byBudW1lcmljIHByaW1pdGl2ZSB2YWx1ZXMuIERhdGVzIGFyZSBjb21wYXJlZCBieSB0aGVpclxuICAgICAgICAvLyBtaWxsaXNlY29uZCByZXByZXNlbnRhdGlvbnMuIE5vdGUgdGhhdCBpbnZhbGlkIGRhdGVzIHdpdGggbWlsbGlzZWNvbmQgcmVwcmVzZW50YXRpb25zXG4gICAgICAgIC8vIG9mIGBOYU5gIGFyZSBub3QgZXF1aXZhbGVudC5cbiAgICAgICAgcmV0dXJuICthID09PSArYjtcbiAgICB9XG5cbiAgICB2YXIgYXJlQXJyYXlzID0gY2xhc3NOYW1lID09PSAnW29iamVjdCBBcnJheV0nO1xuICAgIGlmICghYXJlQXJyYXlzKSB7XG4gICAgICBpZiAodHlwZW9mIGEgIT0gJ29iamVjdCcgfHwgdHlwZW9mIGIgIT0gJ29iamVjdCcpIHJldHVybiBmYWxzZTtcblxuICAgICAgLy8gT2JqZWN0cyB3aXRoIGRpZmZlcmVudCBjb25zdHJ1Y3RvcnMgYXJlIG5vdCBlcXVpdmFsZW50LCBidXQgYE9iamVjdGBzIG9yIGBBcnJheWBzXG4gICAgICAvLyBmcm9tIGRpZmZlcmVudCBmcmFtZXMgYXJlLlxuICAgICAgdmFyIGFDdG9yID0gYS5jb25zdHJ1Y3RvciwgYkN0b3IgPSBiLmNvbnN0cnVjdG9yO1xuICAgICAgaWYgKGFDdG9yICE9PSBiQ3RvciAmJiAhKF8uaXNGdW5jdGlvbihhQ3RvcikgJiYgYUN0b3IgaW5zdGFuY2VvZiBhQ3RvciAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8uaXNGdW5jdGlvbihiQ3RvcikgJiYgYkN0b3IgaW5zdGFuY2VvZiBiQ3RvcilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgJiYgKCdjb25zdHJ1Y3RvcicgaW4gYSAmJiAnY29uc3RydWN0b3InIGluIGIpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gQXNzdW1lIGVxdWFsaXR5IGZvciBjeWNsaWMgc3RydWN0dXJlcy4gVGhlIGFsZ29yaXRobSBmb3IgZGV0ZWN0aW5nIGN5Y2xpY1xuICAgIC8vIHN0cnVjdHVyZXMgaXMgYWRhcHRlZCBmcm9tIEVTIDUuMSBzZWN0aW9uIDE1LjEyLjMsIGFic3RyYWN0IG9wZXJhdGlvbiBgSk9gLlxuXG4gICAgLy8gSW5pdGlhbGl6aW5nIHN0YWNrIG9mIHRyYXZlcnNlZCBvYmplY3RzLlxuICAgIC8vIEl0J3MgZG9uZSBoZXJlIHNpbmNlIHdlIG9ubHkgbmVlZCB0aGVtIGZvciBvYmplY3RzIGFuZCBhcnJheXMgY29tcGFyaXNvbi5cbiAgICBhU3RhY2sgPSBhU3RhY2sgfHwgW107XG4gICAgYlN0YWNrID0gYlN0YWNrIHx8IFtdO1xuICAgIHZhciBsZW5ndGggPSBhU3RhY2subGVuZ3RoO1xuICAgIHdoaWxlIChsZW5ndGgtLSkge1xuICAgICAgLy8gTGluZWFyIHNlYXJjaC4gUGVyZm9ybWFuY2UgaXMgaW52ZXJzZWx5IHByb3BvcnRpb25hbCB0byB0aGUgbnVtYmVyIG9mXG4gICAgICAvLyB1bmlxdWUgbmVzdGVkIHN0cnVjdHVyZXMuXG4gICAgICBpZiAoYVN0YWNrW2xlbmd0aF0gPT09IGEpIHJldHVybiBiU3RhY2tbbGVuZ3RoXSA9PT0gYjtcbiAgICB9XG5cbiAgICAvLyBBZGQgdGhlIGZpcnN0IG9iamVjdCB0byB0aGUgc3RhY2sgb2YgdHJhdmVyc2VkIG9iamVjdHMuXG4gICAgYVN0YWNrLnB1c2goYSk7XG4gICAgYlN0YWNrLnB1c2goYik7XG5cbiAgICAvLyBSZWN1cnNpdmVseSBjb21wYXJlIG9iamVjdHMgYW5kIGFycmF5cy5cbiAgICBpZiAoYXJlQXJyYXlzKSB7XG4gICAgICAvLyBDb21wYXJlIGFycmF5IGxlbmd0aHMgdG8gZGV0ZXJtaW5lIGlmIGEgZGVlcCBjb21wYXJpc29uIGlzIG5lY2Vzc2FyeS5cbiAgICAgIGxlbmd0aCA9IGEubGVuZ3RoO1xuICAgICAgaWYgKGxlbmd0aCAhPT0gYi5sZW5ndGgpIHJldHVybiBmYWxzZTtcbiAgICAgIC8vIERlZXAgY29tcGFyZSB0aGUgY29udGVudHMsIGlnbm9yaW5nIG5vbi1udW1lcmljIHByb3BlcnRpZXMuXG4gICAgICB3aGlsZSAobGVuZ3RoLS0pIHtcbiAgICAgICAgaWYgKCFlcShhW2xlbmd0aF0sIGJbbGVuZ3RoXSwgYVN0YWNrLCBiU3RhY2spKSByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIERlZXAgY29tcGFyZSBvYmplY3RzLlxuICAgICAgdmFyIGtleXMgPSBfLmtleXMoYSksIGtleTtcbiAgICAgIGxlbmd0aCA9IGtleXMubGVuZ3RoO1xuICAgICAgLy8gRW5zdXJlIHRoYXQgYm90aCBvYmplY3RzIGNvbnRhaW4gdGhlIHNhbWUgbnVtYmVyIG9mIHByb3BlcnRpZXMgYmVmb3JlIGNvbXBhcmluZyBkZWVwIGVxdWFsaXR5LlxuICAgICAgaWYgKF8ua2V5cyhiKS5sZW5ndGggIT09IGxlbmd0aCkgcmV0dXJuIGZhbHNlO1xuICAgICAgd2hpbGUgKGxlbmd0aC0tKSB7XG4gICAgICAgIC8vIERlZXAgY29tcGFyZSBlYWNoIG1lbWJlclxuICAgICAgICBrZXkgPSBrZXlzW2xlbmd0aF07XG4gICAgICAgIGlmICghKF8uaGFzKGIsIGtleSkgJiYgZXEoYVtrZXldLCBiW2tleV0sIGFTdGFjaywgYlN0YWNrKSkpIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gUmVtb3ZlIHRoZSBmaXJzdCBvYmplY3QgZnJvbSB0aGUgc3RhY2sgb2YgdHJhdmVyc2VkIG9iamVjdHMuXG4gICAgYVN0YWNrLnBvcCgpO1xuICAgIGJTdGFjay5wb3AoKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcblxuICAvLyBQZXJmb3JtIGEgZGVlcCBjb21wYXJpc29uIHRvIGNoZWNrIGlmIHR3byBvYmplY3RzIGFyZSBlcXVhbC5cbiAgXy5pc0VxdWFsID0gZnVuY3Rpb24oYSwgYikge1xuICAgIHJldHVybiBlcShhLCBiKTtcbiAgfTtcblxuICAvLyBJcyBhIGdpdmVuIGFycmF5LCBzdHJpbmcsIG9yIG9iamVjdCBlbXB0eT9cbiAgLy8gQW4gXCJlbXB0eVwiIG9iamVjdCBoYXMgbm8gZW51bWVyYWJsZSBvd24tcHJvcGVydGllcy5cbiAgXy5pc0VtcHR5ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gdHJ1ZTtcbiAgICBpZiAoaXNBcnJheUxpa2Uob2JqKSAmJiAoXy5pc0FycmF5KG9iaikgfHwgXy5pc1N0cmluZyhvYmopIHx8IF8uaXNBcmd1bWVudHMob2JqKSkpIHJldHVybiBvYmoubGVuZ3RoID09PSAwO1xuICAgIHJldHVybiBfLmtleXMob2JqKS5sZW5ndGggPT09IDA7XG4gIH07XG5cbiAgLy8gSXMgYSBnaXZlbiB2YWx1ZSBhIERPTSBlbGVtZW50P1xuICBfLmlzRWxlbWVudCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiAhIShvYmogJiYgb2JqLm5vZGVUeXBlID09PSAxKTtcbiAgfTtcblxuICAvLyBJcyBhIGdpdmVuIHZhbHVlIGFuIGFycmF5P1xuICAvLyBEZWxlZ2F0ZXMgdG8gRUNNQTUncyBuYXRpdmUgQXJyYXkuaXNBcnJheVxuICBfLmlzQXJyYXkgPSBuYXRpdmVJc0FycmF5IHx8IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiB0b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0IEFycmF5XSc7XG4gIH07XG5cbiAgLy8gSXMgYSBnaXZlbiB2YXJpYWJsZSBhbiBvYmplY3Q/XG4gIF8uaXNPYmplY3QgPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIgdHlwZSA9IHR5cGVvZiBvYmo7XG4gICAgcmV0dXJuIHR5cGUgPT09ICdmdW5jdGlvbicgfHwgdHlwZSA9PT0gJ29iamVjdCcgJiYgISFvYmo7XG4gIH07XG5cbiAgLy8gQWRkIHNvbWUgaXNUeXBlIG1ldGhvZHM6IGlzQXJndW1lbnRzLCBpc0Z1bmN0aW9uLCBpc1N0cmluZywgaXNOdW1iZXIsIGlzRGF0ZSwgaXNSZWdFeHAsIGlzRXJyb3IuXG4gIF8uZWFjaChbJ0FyZ3VtZW50cycsICdGdW5jdGlvbicsICdTdHJpbmcnLCAnTnVtYmVyJywgJ0RhdGUnLCAnUmVnRXhwJywgJ0Vycm9yJ10sIGZ1bmN0aW9uKG5hbWUpIHtcbiAgICBfWydpcycgKyBuYW1lXSA9IGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuIHRvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgJyArIG5hbWUgKyAnXSc7XG4gICAgfTtcbiAgfSk7XG5cbiAgLy8gRGVmaW5lIGEgZmFsbGJhY2sgdmVyc2lvbiBvZiB0aGUgbWV0aG9kIGluIGJyb3dzZXJzIChhaGVtLCBJRSA8IDkpLCB3aGVyZVxuICAvLyB0aGVyZSBpc24ndCBhbnkgaW5zcGVjdGFibGUgXCJBcmd1bWVudHNcIiB0eXBlLlxuICBpZiAoIV8uaXNBcmd1bWVudHMoYXJndW1lbnRzKSkge1xuICAgIF8uaXNBcmd1bWVudHMgPSBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiBfLmhhcyhvYmosICdjYWxsZWUnKTtcbiAgICB9O1xuICB9XG5cbiAgLy8gT3B0aW1pemUgYGlzRnVuY3Rpb25gIGlmIGFwcHJvcHJpYXRlLiBXb3JrIGFyb3VuZCBzb21lIHR5cGVvZiBidWdzIGluIG9sZCB2OCxcbiAgLy8gSUUgMTEgKCMxNjIxKSwgYW5kIGluIFNhZmFyaSA4ICgjMTkyOSkuXG4gIGlmICh0eXBlb2YgLy4vICE9ICdmdW5jdGlvbicgJiYgdHlwZW9mIEludDhBcnJheSAhPSAnb2JqZWN0Jykge1xuICAgIF8uaXNGdW5jdGlvbiA9IGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuIHR5cGVvZiBvYmogPT0gJ2Z1bmN0aW9uJyB8fCBmYWxzZTtcbiAgICB9O1xuICB9XG5cbiAgLy8gSXMgYSBnaXZlbiBvYmplY3QgYSBmaW5pdGUgbnVtYmVyP1xuICBfLmlzRmluaXRlID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIGlzRmluaXRlKG9iaikgJiYgIWlzTmFOKHBhcnNlRmxvYXQob2JqKSk7XG4gIH07XG5cbiAgLy8gSXMgdGhlIGdpdmVuIHZhbHVlIGBOYU5gPyAoTmFOIGlzIHRoZSBvbmx5IG51bWJlciB3aGljaCBkb2VzIG5vdCBlcXVhbCBpdHNlbGYpLlxuICBfLmlzTmFOID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIF8uaXNOdW1iZXIob2JqKSAmJiBvYmogIT09ICtvYmo7XG4gIH07XG5cbiAgLy8gSXMgYSBnaXZlbiB2YWx1ZSBhIGJvb2xlYW4/XG4gIF8uaXNCb29sZWFuID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIG9iaiA9PT0gdHJ1ZSB8fCBvYmogPT09IGZhbHNlIHx8IHRvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgQm9vbGVhbl0nO1xuICB9O1xuXG4gIC8vIElzIGEgZ2l2ZW4gdmFsdWUgZXF1YWwgdG8gbnVsbD9cbiAgXy5pc051bGwgPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gb2JqID09PSBudWxsO1xuICB9O1xuXG4gIC8vIElzIGEgZ2l2ZW4gdmFyaWFibGUgdW5kZWZpbmVkP1xuICBfLmlzVW5kZWZpbmVkID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIG9iaiA9PT0gdm9pZCAwO1xuICB9O1xuXG4gIC8vIFNob3J0Y3V0IGZ1bmN0aW9uIGZvciBjaGVja2luZyBpZiBhbiBvYmplY3QgaGFzIGEgZ2l2ZW4gcHJvcGVydHkgZGlyZWN0bHlcbiAgLy8gb24gaXRzZWxmIChpbiBvdGhlciB3b3Jkcywgbm90IG9uIGEgcHJvdG90eXBlKS5cbiAgXy5oYXMgPSBmdW5jdGlvbihvYmosIGtleSkge1xuICAgIHJldHVybiBvYmogIT0gbnVsbCAmJiBoYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwga2V5KTtcbiAgfTtcblxuICAvLyBVdGlsaXR5IEZ1bmN0aW9uc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIFJ1biBVbmRlcnNjb3JlLmpzIGluICpub0NvbmZsaWN0KiBtb2RlLCByZXR1cm5pbmcgdGhlIGBfYCB2YXJpYWJsZSB0byBpdHNcbiAgLy8gcHJldmlvdXMgb3duZXIuIFJldHVybnMgYSByZWZlcmVuY2UgdG8gdGhlIFVuZGVyc2NvcmUgb2JqZWN0LlxuICBfLm5vQ29uZmxpY3QgPSBmdW5jdGlvbigpIHtcbiAgICByb290Ll8gPSBwcmV2aW91c1VuZGVyc2NvcmU7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLy8gS2VlcCB0aGUgaWRlbnRpdHkgZnVuY3Rpb24gYXJvdW5kIGZvciBkZWZhdWx0IGl0ZXJhdGVlcy5cbiAgXy5pZGVudGl0eSA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9O1xuXG4gIC8vIFByZWRpY2F0ZS1nZW5lcmF0aW5nIGZ1bmN0aW9ucy4gT2Z0ZW4gdXNlZnVsIG91dHNpZGUgb2YgVW5kZXJzY29yZS5cbiAgXy5jb25zdGFudCA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH07XG4gIH07XG5cbiAgXy5ub29wID0gZnVuY3Rpb24oKXt9O1xuXG4gIF8ucHJvcGVydHkgPSBwcm9wZXJ0eTtcblxuICAvLyBHZW5lcmF0ZXMgYSBmdW5jdGlvbiBmb3IgYSBnaXZlbiBvYmplY3QgdGhhdCByZXR1cm5zIGEgZ2l2ZW4gcHJvcGVydHkuXG4gIF8ucHJvcGVydHlPZiA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiBvYmogPT0gbnVsbCA/IGZ1bmN0aW9uKCl7fSA6IGZ1bmN0aW9uKGtleSkge1xuICAgICAgcmV0dXJuIG9ialtrZXldO1xuICAgIH07XG4gIH07XG5cbiAgLy8gUmV0dXJucyBhIHByZWRpY2F0ZSBmb3IgY2hlY2tpbmcgd2hldGhlciBhbiBvYmplY3QgaGFzIGEgZ2l2ZW4gc2V0IG9mXG4gIC8vIGBrZXk6dmFsdWVgIHBhaXJzLlxuICBfLm1hdGNoZXIgPSBfLm1hdGNoZXMgPSBmdW5jdGlvbihhdHRycykge1xuICAgIGF0dHJzID0gXy5leHRlbmRPd24oe30sIGF0dHJzKTtcbiAgICByZXR1cm4gZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gXy5pc01hdGNoKG9iaiwgYXR0cnMpO1xuICAgIH07XG4gIH07XG5cbiAgLy8gUnVuIGEgZnVuY3Rpb24gKipuKiogdGltZXMuXG4gIF8udGltZXMgPSBmdW5jdGlvbihuLCBpdGVyYXRlZSwgY29udGV4dCkge1xuICAgIHZhciBhY2N1bSA9IEFycmF5KE1hdGgubWF4KDAsIG4pKTtcbiAgICBpdGVyYXRlZSA9IG9wdGltaXplQ2IoaXRlcmF0ZWUsIGNvbnRleHQsIDEpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbjsgaSsrKSBhY2N1bVtpXSA9IGl0ZXJhdGVlKGkpO1xuICAgIHJldHVybiBhY2N1bTtcbiAgfTtcblxuICAvLyBSZXR1cm4gYSByYW5kb20gaW50ZWdlciBiZXR3ZWVuIG1pbiBhbmQgbWF4IChpbmNsdXNpdmUpLlxuICBfLnJhbmRvbSA9IGZ1bmN0aW9uKG1pbiwgbWF4KSB7XG4gICAgaWYgKG1heCA9PSBudWxsKSB7XG4gICAgICBtYXggPSBtaW47XG4gICAgICBtaW4gPSAwO1xuICAgIH1cbiAgICByZXR1cm4gbWluICsgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbiArIDEpKTtcbiAgfTtcblxuICAvLyBBIChwb3NzaWJseSBmYXN0ZXIpIHdheSB0byBnZXQgdGhlIGN1cnJlbnQgdGltZXN0YW1wIGFzIGFuIGludGVnZXIuXG4gIF8ubm93ID0gRGF0ZS5ub3cgfHwgZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICB9O1xuXG4gICAvLyBMaXN0IG9mIEhUTUwgZW50aXRpZXMgZm9yIGVzY2FwaW5nLlxuICB2YXIgZXNjYXBlTWFwID0ge1xuICAgICcmJzogJyZhbXA7JyxcbiAgICAnPCc6ICcmbHQ7JyxcbiAgICAnPic6ICcmZ3Q7JyxcbiAgICAnXCInOiAnJnF1b3Q7JyxcbiAgICBcIidcIjogJyYjeDI3OycsXG4gICAgJ2AnOiAnJiN4NjA7J1xuICB9O1xuICB2YXIgdW5lc2NhcGVNYXAgPSBfLmludmVydChlc2NhcGVNYXApO1xuXG4gIC8vIEZ1bmN0aW9ucyBmb3IgZXNjYXBpbmcgYW5kIHVuZXNjYXBpbmcgc3RyaW5ncyB0by9mcm9tIEhUTUwgaW50ZXJwb2xhdGlvbi5cbiAgdmFyIGNyZWF0ZUVzY2FwZXIgPSBmdW5jdGlvbihtYXApIHtcbiAgICB2YXIgZXNjYXBlciA9IGZ1bmN0aW9uKG1hdGNoKSB7XG4gICAgICByZXR1cm4gbWFwW21hdGNoXTtcbiAgICB9O1xuICAgIC8vIFJlZ2V4ZXMgZm9yIGlkZW50aWZ5aW5nIGEga2V5IHRoYXQgbmVlZHMgdG8gYmUgZXNjYXBlZFxuICAgIHZhciBzb3VyY2UgPSAnKD86JyArIF8ua2V5cyhtYXApLmpvaW4oJ3wnKSArICcpJztcbiAgICB2YXIgdGVzdFJlZ2V4cCA9IFJlZ0V4cChzb3VyY2UpO1xuICAgIHZhciByZXBsYWNlUmVnZXhwID0gUmVnRXhwKHNvdXJjZSwgJ2cnKTtcbiAgICByZXR1cm4gZnVuY3Rpb24oc3RyaW5nKSB7XG4gICAgICBzdHJpbmcgPSBzdHJpbmcgPT0gbnVsbCA/ICcnIDogJycgKyBzdHJpbmc7XG4gICAgICByZXR1cm4gdGVzdFJlZ2V4cC50ZXN0KHN0cmluZykgPyBzdHJpbmcucmVwbGFjZShyZXBsYWNlUmVnZXhwLCBlc2NhcGVyKSA6IHN0cmluZztcbiAgICB9O1xuICB9O1xuICBfLmVzY2FwZSA9IGNyZWF0ZUVzY2FwZXIoZXNjYXBlTWFwKTtcbiAgXy51bmVzY2FwZSA9IGNyZWF0ZUVzY2FwZXIodW5lc2NhcGVNYXApO1xuXG4gIC8vIElmIHRoZSB2YWx1ZSBvZiB0aGUgbmFtZWQgYHByb3BlcnR5YCBpcyBhIGZ1bmN0aW9uIHRoZW4gaW52b2tlIGl0IHdpdGggdGhlXG4gIC8vIGBvYmplY3RgIGFzIGNvbnRleHQ7IG90aGVyd2lzZSwgcmV0dXJuIGl0LlxuICBfLnJlc3VsdCA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHksIGZhbGxiYWNrKSB7XG4gICAgdmFyIHZhbHVlID0gb2JqZWN0ID09IG51bGwgPyB2b2lkIDAgOiBvYmplY3RbcHJvcGVydHldO1xuICAgIGlmICh2YWx1ZSA9PT0gdm9pZCAwKSB7XG4gICAgICB2YWx1ZSA9IGZhbGxiYWNrO1xuICAgIH1cbiAgICByZXR1cm4gXy5pc0Z1bmN0aW9uKHZhbHVlKSA/IHZhbHVlLmNhbGwob2JqZWN0KSA6IHZhbHVlO1xuICB9O1xuXG4gIC8vIEdlbmVyYXRlIGEgdW5pcXVlIGludGVnZXIgaWQgKHVuaXF1ZSB3aXRoaW4gdGhlIGVudGlyZSBjbGllbnQgc2Vzc2lvbikuXG4gIC8vIFVzZWZ1bCBmb3IgdGVtcG9yYXJ5IERPTSBpZHMuXG4gIHZhciBpZENvdW50ZXIgPSAwO1xuICBfLnVuaXF1ZUlkID0gZnVuY3Rpb24ocHJlZml4KSB7XG4gICAgdmFyIGlkID0gKytpZENvdW50ZXIgKyAnJztcbiAgICByZXR1cm4gcHJlZml4ID8gcHJlZml4ICsgaWQgOiBpZDtcbiAgfTtcblxuICAvLyBCeSBkZWZhdWx0LCBVbmRlcnNjb3JlIHVzZXMgRVJCLXN0eWxlIHRlbXBsYXRlIGRlbGltaXRlcnMsIGNoYW5nZSB0aGVcbiAgLy8gZm9sbG93aW5nIHRlbXBsYXRlIHNldHRpbmdzIHRvIHVzZSBhbHRlcm5hdGl2ZSBkZWxpbWl0ZXJzLlxuICBfLnRlbXBsYXRlU2V0dGluZ3MgPSB7XG4gICAgZXZhbHVhdGUgICAgOiAvPCUoW1xcc1xcU10rPyklPi9nLFxuICAgIGludGVycG9sYXRlIDogLzwlPShbXFxzXFxTXSs/KSU+L2csXG4gICAgZXNjYXBlICAgICAgOiAvPCUtKFtcXHNcXFNdKz8pJT4vZ1xuICB9O1xuXG4gIC8vIFdoZW4gY3VzdG9taXppbmcgYHRlbXBsYXRlU2V0dGluZ3NgLCBpZiB5b3UgZG9uJ3Qgd2FudCB0byBkZWZpbmUgYW5cbiAgLy8gaW50ZXJwb2xhdGlvbiwgZXZhbHVhdGlvbiBvciBlc2NhcGluZyByZWdleCwgd2UgbmVlZCBvbmUgdGhhdCBpc1xuICAvLyBndWFyYW50ZWVkIG5vdCB0byBtYXRjaC5cbiAgdmFyIG5vTWF0Y2ggPSAvKC4pXi87XG5cbiAgLy8gQ2VydGFpbiBjaGFyYWN0ZXJzIG5lZWQgdG8gYmUgZXNjYXBlZCBzbyB0aGF0IHRoZXkgY2FuIGJlIHB1dCBpbnRvIGFcbiAgLy8gc3RyaW5nIGxpdGVyYWwuXG4gIHZhciBlc2NhcGVzID0ge1xuICAgIFwiJ1wiOiAgICAgIFwiJ1wiLFxuICAgICdcXFxcJzogICAgICdcXFxcJyxcbiAgICAnXFxyJzogICAgICdyJyxcbiAgICAnXFxuJzogICAgICduJyxcbiAgICAnXFx1MjAyOCc6ICd1MjAyOCcsXG4gICAgJ1xcdTIwMjknOiAndTIwMjknXG4gIH07XG5cbiAgdmFyIGVzY2FwZXIgPSAvXFxcXHwnfFxccnxcXG58XFx1MjAyOHxcXHUyMDI5L2c7XG5cbiAgdmFyIGVzY2FwZUNoYXIgPSBmdW5jdGlvbihtYXRjaCkge1xuICAgIHJldHVybiAnXFxcXCcgKyBlc2NhcGVzW21hdGNoXTtcbiAgfTtcblxuICAvLyBKYXZhU2NyaXB0IG1pY3JvLXRlbXBsYXRpbmcsIHNpbWlsYXIgdG8gSm9obiBSZXNpZydzIGltcGxlbWVudGF0aW9uLlxuICAvLyBVbmRlcnNjb3JlIHRlbXBsYXRpbmcgaGFuZGxlcyBhcmJpdHJhcnkgZGVsaW1pdGVycywgcHJlc2VydmVzIHdoaXRlc3BhY2UsXG4gIC8vIGFuZCBjb3JyZWN0bHkgZXNjYXBlcyBxdW90ZXMgd2l0aGluIGludGVycG9sYXRlZCBjb2RlLlxuICAvLyBOQjogYG9sZFNldHRpbmdzYCBvbmx5IGV4aXN0cyBmb3IgYmFja3dhcmRzIGNvbXBhdGliaWxpdHkuXG4gIF8udGVtcGxhdGUgPSBmdW5jdGlvbih0ZXh0LCBzZXR0aW5ncywgb2xkU2V0dGluZ3MpIHtcbiAgICBpZiAoIXNldHRpbmdzICYmIG9sZFNldHRpbmdzKSBzZXR0aW5ncyA9IG9sZFNldHRpbmdzO1xuICAgIHNldHRpbmdzID0gXy5kZWZhdWx0cyh7fSwgc2V0dGluZ3MsIF8udGVtcGxhdGVTZXR0aW5ncyk7XG5cbiAgICAvLyBDb21iaW5lIGRlbGltaXRlcnMgaW50byBvbmUgcmVndWxhciBleHByZXNzaW9uIHZpYSBhbHRlcm5hdGlvbi5cbiAgICB2YXIgbWF0Y2hlciA9IFJlZ0V4cChbXG4gICAgICAoc2V0dGluZ3MuZXNjYXBlIHx8IG5vTWF0Y2gpLnNvdXJjZSxcbiAgICAgIChzZXR0aW5ncy5pbnRlcnBvbGF0ZSB8fCBub01hdGNoKS5zb3VyY2UsXG4gICAgICAoc2V0dGluZ3MuZXZhbHVhdGUgfHwgbm9NYXRjaCkuc291cmNlXG4gICAgXS5qb2luKCd8JykgKyAnfCQnLCAnZycpO1xuXG4gICAgLy8gQ29tcGlsZSB0aGUgdGVtcGxhdGUgc291cmNlLCBlc2NhcGluZyBzdHJpbmcgbGl0ZXJhbHMgYXBwcm9wcmlhdGVseS5cbiAgICB2YXIgaW5kZXggPSAwO1xuICAgIHZhciBzb3VyY2UgPSBcIl9fcCs9J1wiO1xuICAgIHRleHQucmVwbGFjZShtYXRjaGVyLCBmdW5jdGlvbihtYXRjaCwgZXNjYXBlLCBpbnRlcnBvbGF0ZSwgZXZhbHVhdGUsIG9mZnNldCkge1xuICAgICAgc291cmNlICs9IHRleHQuc2xpY2UoaW5kZXgsIG9mZnNldCkucmVwbGFjZShlc2NhcGVyLCBlc2NhcGVDaGFyKTtcbiAgICAgIGluZGV4ID0gb2Zmc2V0ICsgbWF0Y2gubGVuZ3RoO1xuXG4gICAgICBpZiAoZXNjYXBlKSB7XG4gICAgICAgIHNvdXJjZSArPSBcIicrXFxuKChfX3Q9KFwiICsgZXNjYXBlICsgXCIpKT09bnVsbD8nJzpfLmVzY2FwZShfX3QpKStcXG4nXCI7XG4gICAgICB9IGVsc2UgaWYgKGludGVycG9sYXRlKSB7XG4gICAgICAgIHNvdXJjZSArPSBcIicrXFxuKChfX3Q9KFwiICsgaW50ZXJwb2xhdGUgKyBcIikpPT1udWxsPycnOl9fdCkrXFxuJ1wiO1xuICAgICAgfSBlbHNlIGlmIChldmFsdWF0ZSkge1xuICAgICAgICBzb3VyY2UgKz0gXCInO1xcblwiICsgZXZhbHVhdGUgKyBcIlxcbl9fcCs9J1wiO1xuICAgICAgfVxuXG4gICAgICAvLyBBZG9iZSBWTXMgbmVlZCB0aGUgbWF0Y2ggcmV0dXJuZWQgdG8gcHJvZHVjZSB0aGUgY29ycmVjdCBvZmZlc3QuXG4gICAgICByZXR1cm4gbWF0Y2g7XG4gICAgfSk7XG4gICAgc291cmNlICs9IFwiJztcXG5cIjtcblxuICAgIC8vIElmIGEgdmFyaWFibGUgaXMgbm90IHNwZWNpZmllZCwgcGxhY2UgZGF0YSB2YWx1ZXMgaW4gbG9jYWwgc2NvcGUuXG4gICAgaWYgKCFzZXR0aW5ncy52YXJpYWJsZSkgc291cmNlID0gJ3dpdGgob2JqfHx7fSl7XFxuJyArIHNvdXJjZSArICd9XFxuJztcblxuICAgIHNvdXJjZSA9IFwidmFyIF9fdCxfX3A9JycsX19qPUFycmF5LnByb3RvdHlwZS5qb2luLFwiICtcbiAgICAgIFwicHJpbnQ9ZnVuY3Rpb24oKXtfX3ArPV9fai5jYWxsKGFyZ3VtZW50cywnJyk7fTtcXG5cIiArXG4gICAgICBzb3VyY2UgKyAncmV0dXJuIF9fcDtcXG4nO1xuXG4gICAgdHJ5IHtcbiAgICAgIHZhciByZW5kZXIgPSBuZXcgRnVuY3Rpb24oc2V0dGluZ3MudmFyaWFibGUgfHwgJ29iaicsICdfJywgc291cmNlKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBlLnNvdXJjZSA9IHNvdXJjZTtcbiAgICAgIHRocm93IGU7XG4gICAgfVxuXG4gICAgdmFyIHRlbXBsYXRlID0gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgcmV0dXJuIHJlbmRlci5jYWxsKHRoaXMsIGRhdGEsIF8pO1xuICAgIH07XG5cbiAgICAvLyBQcm92aWRlIHRoZSBjb21waWxlZCBzb3VyY2UgYXMgYSBjb252ZW5pZW5jZSBmb3IgcHJlY29tcGlsYXRpb24uXG4gICAgdmFyIGFyZ3VtZW50ID0gc2V0dGluZ3MudmFyaWFibGUgfHwgJ29iaic7XG4gICAgdGVtcGxhdGUuc291cmNlID0gJ2Z1bmN0aW9uKCcgKyBhcmd1bWVudCArICcpe1xcbicgKyBzb3VyY2UgKyAnfSc7XG5cbiAgICByZXR1cm4gdGVtcGxhdGU7XG4gIH07XG5cbiAgLy8gQWRkIGEgXCJjaGFpblwiIGZ1bmN0aW9uLiBTdGFydCBjaGFpbmluZyBhIHdyYXBwZWQgVW5kZXJzY29yZSBvYmplY3QuXG4gIF8uY2hhaW4gPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIgaW5zdGFuY2UgPSBfKG9iaik7XG4gICAgaW5zdGFuY2UuX2NoYWluID0gdHJ1ZTtcbiAgICByZXR1cm4gaW5zdGFuY2U7XG4gIH07XG5cbiAgLy8gT09QXG4gIC8vIC0tLS0tLS0tLS0tLS0tLVxuICAvLyBJZiBVbmRlcnNjb3JlIGlzIGNhbGxlZCBhcyBhIGZ1bmN0aW9uLCBpdCByZXR1cm5zIGEgd3JhcHBlZCBvYmplY3QgdGhhdFxuICAvLyBjYW4gYmUgdXNlZCBPTy1zdHlsZS4gVGhpcyB3cmFwcGVyIGhvbGRzIGFsdGVyZWQgdmVyc2lvbnMgb2YgYWxsIHRoZVxuICAvLyB1bmRlcnNjb3JlIGZ1bmN0aW9ucy4gV3JhcHBlZCBvYmplY3RzIG1heSBiZSBjaGFpbmVkLlxuXG4gIC8vIEhlbHBlciBmdW5jdGlvbiB0byBjb250aW51ZSBjaGFpbmluZyBpbnRlcm1lZGlhdGUgcmVzdWx0cy5cbiAgdmFyIHJlc3VsdCA9IGZ1bmN0aW9uKGluc3RhbmNlLCBvYmopIHtcbiAgICByZXR1cm4gaW5zdGFuY2UuX2NoYWluID8gXyhvYmopLmNoYWluKCkgOiBvYmo7XG4gIH07XG5cbiAgLy8gQWRkIHlvdXIgb3duIGN1c3RvbSBmdW5jdGlvbnMgdG8gdGhlIFVuZGVyc2NvcmUgb2JqZWN0LlxuICBfLm1peGluID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgXy5lYWNoKF8uZnVuY3Rpb25zKG9iaiksIGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgIHZhciBmdW5jID0gX1tuYW1lXSA9IG9ialtuYW1lXTtcbiAgICAgIF8ucHJvdG90eXBlW25hbWVdID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBhcmdzID0gW3RoaXMuX3dyYXBwZWRdO1xuICAgICAgICBwdXNoLmFwcGx5KGFyZ3MsIGFyZ3VtZW50cyk7XG4gICAgICAgIHJldHVybiByZXN1bHQodGhpcywgZnVuYy5hcHBseShfLCBhcmdzKSk7XG4gICAgICB9O1xuICAgIH0pO1xuICB9O1xuXG4gIC8vIEFkZCBhbGwgb2YgdGhlIFVuZGVyc2NvcmUgZnVuY3Rpb25zIHRvIHRoZSB3cmFwcGVyIG9iamVjdC5cbiAgXy5taXhpbihfKTtcblxuICAvLyBBZGQgYWxsIG11dGF0b3IgQXJyYXkgZnVuY3Rpb25zIHRvIHRoZSB3cmFwcGVyLlxuICBfLmVhY2goWydwb3AnLCAncHVzaCcsICdyZXZlcnNlJywgJ3NoaWZ0JywgJ3NvcnQnLCAnc3BsaWNlJywgJ3Vuc2hpZnQnXSwgZnVuY3Rpb24obmFtZSkge1xuICAgIHZhciBtZXRob2QgPSBBcnJheVByb3RvW25hbWVdO1xuICAgIF8ucHJvdG90eXBlW25hbWVdID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgb2JqID0gdGhpcy5fd3JhcHBlZDtcbiAgICAgIG1ldGhvZC5hcHBseShvYmosIGFyZ3VtZW50cyk7XG4gICAgICBpZiAoKG5hbWUgPT09ICdzaGlmdCcgfHwgbmFtZSA9PT0gJ3NwbGljZScpICYmIG9iai5sZW5ndGggPT09IDApIGRlbGV0ZSBvYmpbMF07XG4gICAgICByZXR1cm4gcmVzdWx0KHRoaXMsIG9iaik7XG4gICAgfTtcbiAgfSk7XG5cbiAgLy8gQWRkIGFsbCBhY2Nlc3NvciBBcnJheSBmdW5jdGlvbnMgdG8gdGhlIHdyYXBwZXIuXG4gIF8uZWFjaChbJ2NvbmNhdCcsICdqb2luJywgJ3NsaWNlJ10sIGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB2YXIgbWV0aG9kID0gQXJyYXlQcm90b1tuYW1lXTtcbiAgICBfLnByb3RvdHlwZVtuYW1lXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHJlc3VsdCh0aGlzLCBtZXRob2QuYXBwbHkodGhpcy5fd3JhcHBlZCwgYXJndW1lbnRzKSk7XG4gICAgfTtcbiAgfSk7XG5cbiAgLy8gRXh0cmFjdHMgdGhlIHJlc3VsdCBmcm9tIGEgd3JhcHBlZCBhbmQgY2hhaW5lZCBvYmplY3QuXG4gIF8ucHJvdG90eXBlLnZhbHVlID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuX3dyYXBwZWQ7XG4gIH07XG5cbiAgLy8gUHJvdmlkZSB1bndyYXBwaW5nIHByb3h5IGZvciBzb21lIG1ldGhvZHMgdXNlZCBpbiBlbmdpbmUgb3BlcmF0aW9uc1xuICAvLyBzdWNoIGFzIGFyaXRobWV0aWMgYW5kIEpTT04gc3RyaW5naWZpY2F0aW9uLlxuICBfLnByb3RvdHlwZS52YWx1ZU9mID0gXy5wcm90b3R5cGUudG9KU09OID0gXy5wcm90b3R5cGUudmFsdWU7XG5cbiAgXy5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gJycgKyB0aGlzLl93cmFwcGVkO1xuICB9O1xuXG4gIC8vIEFNRCByZWdpc3RyYXRpb24gaGFwcGVucyBhdCB0aGUgZW5kIGZvciBjb21wYXRpYmlsaXR5IHdpdGggQU1EIGxvYWRlcnNcbiAgLy8gdGhhdCBtYXkgbm90IGVuZm9yY2UgbmV4dC10dXJuIHNlbWFudGljcyBvbiBtb2R1bGVzLiBFdmVuIHRob3VnaCBnZW5lcmFsXG4gIC8vIHByYWN0aWNlIGZvciBBTUQgcmVnaXN0cmF0aW9uIGlzIHRvIGJlIGFub255bW91cywgdW5kZXJzY29yZSByZWdpc3RlcnNcbiAgLy8gYXMgYSBuYW1lZCBtb2R1bGUgYmVjYXVzZSwgbGlrZSBqUXVlcnksIGl0IGlzIGEgYmFzZSBsaWJyYXJ5IHRoYXQgaXNcbiAgLy8gcG9wdWxhciBlbm91Z2ggdG8gYmUgYnVuZGxlZCBpbiBhIHRoaXJkIHBhcnR5IGxpYiwgYnV0IG5vdCBiZSBwYXJ0IG9mXG4gIC8vIGFuIEFNRCBsb2FkIHJlcXVlc3QuIFRob3NlIGNhc2VzIGNvdWxkIGdlbmVyYXRlIGFuIGVycm9yIHdoZW4gYW5cbiAgLy8gYW5vbnltb3VzIGRlZmluZSgpIGlzIGNhbGxlZCBvdXRzaWRlIG9mIGEgbG9hZGVyIHJlcXVlc3QuXG4gIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICBkZWZpbmUoJ3VuZGVyc2NvcmUnLCBbXSwgZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gXztcbiAgICB9KTtcbiAgfVxufS5jYWxsKHRoaXMpKTtcbiIsIi8qIVxuICogalF1ZXJ5IFVJIE1vdXNlIDEuMTIuMVxuICogaHR0cDovL2pxdWVyeXVpLmNvbVxuICpcbiAqIENvcHlyaWdodCBqUXVlcnkgRm91bmRhdGlvbiBhbmQgb3RoZXIgY29udHJpYnV0b3JzXG4gKiBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuXG4gKiBodHRwOi8vanF1ZXJ5Lm9yZy9saWNlbnNlXG4gKi9cblxuLy8+PmxhYmVsOiBNb3VzZVxuLy8+Pmdyb3VwOiBXaWRnZXRzXG4vLz4+ZGVzY3JpcHRpb246IEFic3RyYWN0cyBtb3VzZS1iYXNlZCBpbnRlcmFjdGlvbnMgdG8gYXNzaXN0IGluIGNyZWF0aW5nIGNlcnRhaW4gd2lkZ2V0cy5cbi8vPj5kb2NzOiBodHRwOi8vYXBpLmpxdWVyeXVpLmNvbS9tb3VzZS9cblxuKCBmdW5jdGlvbiggZmFjdG9yeSApIHtcblx0aWYgKCB0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCApIHtcblxuXHRcdC8vIEFNRC4gUmVnaXN0ZXIgYXMgYW4gYW5vbnltb3VzIG1vZHVsZS5cblx0XHRkZWZpbmUoIFtcblx0XHRcdFwianF1ZXJ5XCIsXG5cdFx0XHRcIi4uL2llXCIsXG5cdFx0XHRcIi4uL3ZlcnNpb25cIixcblx0XHRcdFwiLi4vd2lkZ2V0XCJcblx0XHRdLCBmYWN0b3J5ICk7XG5cdH0gZWxzZSB7XG5cblx0XHQvLyBCcm93c2VyIGdsb2JhbHNcblx0XHRmYWN0b3J5KCBqUXVlcnkgKTtcblx0fVxufSggZnVuY3Rpb24oICQgKSB7XG5cbnZhciBtb3VzZUhhbmRsZWQgPSBmYWxzZTtcbiQoIGRvY3VtZW50ICkub24oIFwibW91c2V1cFwiLCBmdW5jdGlvbigpIHtcblx0bW91c2VIYW5kbGVkID0gZmFsc2U7XG59ICk7XG5cbnJldHVybiAkLndpZGdldCggXCJ1aS5tb3VzZVwiLCB7XG5cdHZlcnNpb246IFwiMS4xMi4xXCIsXG5cdG9wdGlvbnM6IHtcblx0XHRjYW5jZWw6IFwiaW5wdXQsIHRleHRhcmVhLCBidXR0b24sIHNlbGVjdCwgb3B0aW9uXCIsXG5cdFx0ZGlzdGFuY2U6IDEsXG5cdFx0ZGVsYXk6IDBcblx0fSxcblx0X21vdXNlSW5pdDogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHRoYXQgPSB0aGlzO1xuXG5cdFx0dGhpcy5lbGVtZW50XG5cdFx0XHQub24oIFwibW91c2Vkb3duLlwiICsgdGhpcy53aWRnZXROYW1lLCBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0XHRcdHJldHVybiB0aGF0Ll9tb3VzZURvd24oIGV2ZW50ICk7XG5cdFx0XHR9IClcblx0XHRcdC5vbiggXCJjbGljay5cIiArIHRoaXMud2lkZ2V0TmFtZSwgZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdFx0XHRpZiAoIHRydWUgPT09ICQuZGF0YSggZXZlbnQudGFyZ2V0LCB0aGF0LndpZGdldE5hbWUgKyBcIi5wcmV2ZW50Q2xpY2tFdmVudFwiICkgKSB7XG5cdFx0XHRcdFx0JC5yZW1vdmVEYXRhKCBldmVudC50YXJnZXQsIHRoYXQud2lkZ2V0TmFtZSArIFwiLnByZXZlbnRDbGlja0V2ZW50XCIgKTtcblx0XHRcdFx0XHRldmVudC5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblx0XHRcdH0gKTtcblxuXHRcdHRoaXMuc3RhcnRlZCA9IGZhbHNlO1xuXHR9LFxuXG5cdC8vIFRPRE86IG1ha2Ugc3VyZSBkZXN0cm95aW5nIG9uZSBpbnN0YW5jZSBvZiBtb3VzZSBkb2Vzbid0IG1lc3Mgd2l0aFxuXHQvLyBvdGhlciBpbnN0YW5jZXMgb2YgbW91c2Vcblx0X21vdXNlRGVzdHJveTogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5lbGVtZW50Lm9mZiggXCIuXCIgKyB0aGlzLndpZGdldE5hbWUgKTtcblx0XHRpZiAoIHRoaXMuX21vdXNlTW92ZURlbGVnYXRlICkge1xuXHRcdFx0dGhpcy5kb2N1bWVudFxuXHRcdFx0XHQub2ZmKCBcIm1vdXNlbW92ZS5cIiArIHRoaXMud2lkZ2V0TmFtZSwgdGhpcy5fbW91c2VNb3ZlRGVsZWdhdGUgKVxuXHRcdFx0XHQub2ZmKCBcIm1vdXNldXAuXCIgKyB0aGlzLndpZGdldE5hbWUsIHRoaXMuX21vdXNlVXBEZWxlZ2F0ZSApO1xuXHRcdH1cblx0fSxcblxuXHRfbW91c2VEb3duOiBmdW5jdGlvbiggZXZlbnQgKSB7XG5cblx0XHQvLyBkb24ndCBsZXQgbW9yZSB0aGFuIG9uZSB3aWRnZXQgaGFuZGxlIG1vdXNlU3RhcnRcblx0XHRpZiAoIG1vdXNlSGFuZGxlZCApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR0aGlzLl9tb3VzZU1vdmVkID0gZmFsc2U7XG5cblx0XHQvLyBXZSBtYXkgaGF2ZSBtaXNzZWQgbW91c2V1cCAob3V0IG9mIHdpbmRvdylcblx0XHQoIHRoaXMuX21vdXNlU3RhcnRlZCAmJiB0aGlzLl9tb3VzZVVwKCBldmVudCApICk7XG5cblx0XHR0aGlzLl9tb3VzZURvd25FdmVudCA9IGV2ZW50O1xuXG5cdFx0dmFyIHRoYXQgPSB0aGlzLFxuXHRcdFx0YnRuSXNMZWZ0ID0gKCBldmVudC53aGljaCA9PT0gMSApLFxuXG5cdFx0XHQvLyBldmVudC50YXJnZXQubm9kZU5hbWUgd29ya3MgYXJvdW5kIGEgYnVnIGluIElFIDggd2l0aFxuXHRcdFx0Ly8gZGlzYWJsZWQgaW5wdXRzICgjNzYyMClcblx0XHRcdGVsSXNDYW5jZWwgPSAoIHR5cGVvZiB0aGlzLm9wdGlvbnMuY2FuY2VsID09PSBcInN0cmluZ1wiICYmIGV2ZW50LnRhcmdldC5ub2RlTmFtZSA/XG5cdFx0XHRcdCQoIGV2ZW50LnRhcmdldCApLmNsb3Nlc3QoIHRoaXMub3B0aW9ucy5jYW5jZWwgKS5sZW5ndGggOiBmYWxzZSApO1xuXHRcdGlmICggIWJ0bklzTGVmdCB8fCBlbElzQ2FuY2VsIHx8ICF0aGlzLl9tb3VzZUNhcHR1cmUoIGV2ZW50ICkgKSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cblx0XHR0aGlzLm1vdXNlRGVsYXlNZXQgPSAhdGhpcy5vcHRpb25zLmRlbGF5O1xuXHRcdGlmICggIXRoaXMubW91c2VEZWxheU1ldCApIHtcblx0XHRcdHRoaXMuX21vdXNlRGVsYXlUaW1lciA9IHNldFRpbWVvdXQoIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR0aGF0Lm1vdXNlRGVsYXlNZXQgPSB0cnVlO1xuXHRcdFx0fSwgdGhpcy5vcHRpb25zLmRlbGF5ICk7XG5cdFx0fVxuXG5cdFx0aWYgKCB0aGlzLl9tb3VzZURpc3RhbmNlTWV0KCBldmVudCApICYmIHRoaXMuX21vdXNlRGVsYXlNZXQoIGV2ZW50ICkgKSB7XG5cdFx0XHR0aGlzLl9tb3VzZVN0YXJ0ZWQgPSAoIHRoaXMuX21vdXNlU3RhcnQoIGV2ZW50ICkgIT09IGZhbHNlICk7XG5cdFx0XHRpZiAoICF0aGlzLl9tb3VzZVN0YXJ0ZWQgKSB7XG5cdFx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIENsaWNrIGV2ZW50IG1heSBuZXZlciBoYXZlIGZpcmVkIChHZWNrbyAmIE9wZXJhKVxuXHRcdGlmICggdHJ1ZSA9PT0gJC5kYXRhKCBldmVudC50YXJnZXQsIHRoaXMud2lkZ2V0TmFtZSArIFwiLnByZXZlbnRDbGlja0V2ZW50XCIgKSApIHtcblx0XHRcdCQucmVtb3ZlRGF0YSggZXZlbnQudGFyZ2V0LCB0aGlzLndpZGdldE5hbWUgKyBcIi5wcmV2ZW50Q2xpY2tFdmVudFwiICk7XG5cdFx0fVxuXG5cdFx0Ly8gVGhlc2UgZGVsZWdhdGVzIGFyZSByZXF1aXJlZCB0byBrZWVwIGNvbnRleHRcblx0XHR0aGlzLl9tb3VzZU1vdmVEZWxlZ2F0ZSA9IGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHRcdHJldHVybiB0aGF0Ll9tb3VzZU1vdmUoIGV2ZW50ICk7XG5cdFx0fTtcblx0XHR0aGlzLl9tb3VzZVVwRGVsZWdhdGUgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0XHRyZXR1cm4gdGhhdC5fbW91c2VVcCggZXZlbnQgKTtcblx0XHR9O1xuXG5cdFx0dGhpcy5kb2N1bWVudFxuXHRcdFx0Lm9uKCBcIm1vdXNlbW92ZS5cIiArIHRoaXMud2lkZ2V0TmFtZSwgdGhpcy5fbW91c2VNb3ZlRGVsZWdhdGUgKVxuXHRcdFx0Lm9uKCBcIm1vdXNldXAuXCIgKyB0aGlzLndpZGdldE5hbWUsIHRoaXMuX21vdXNlVXBEZWxlZ2F0ZSApO1xuXG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuXHRcdG1vdXNlSGFuZGxlZCA9IHRydWU7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH0sXG5cblx0X21vdXNlTW92ZTogZnVuY3Rpb24oIGV2ZW50ICkge1xuXG5cdFx0Ly8gT25seSBjaGVjayBmb3IgbW91c2V1cHMgb3V0c2lkZSB0aGUgZG9jdW1lbnQgaWYgeW91J3ZlIG1vdmVkIGluc2lkZSB0aGUgZG9jdW1lbnRcblx0XHQvLyBhdCBsZWFzdCBvbmNlLiBUaGlzIHByZXZlbnRzIHRoZSBmaXJpbmcgb2YgbW91c2V1cCBpbiB0aGUgY2FzZSBvZiBJRTw5LCB3aGljaCB3aWxsXG5cdFx0Ly8gZmlyZSBhIG1vdXNlbW92ZSBldmVudCBpZiBjb250ZW50IGlzIHBsYWNlZCB1bmRlciB0aGUgY3Vyc29yLiBTZWUgIzc3Nzhcblx0XHQvLyBTdXBwb3J0OiBJRSA8OVxuXHRcdGlmICggdGhpcy5fbW91c2VNb3ZlZCApIHtcblxuXHRcdFx0Ly8gSUUgbW91c2V1cCBjaGVjayAtIG1vdXNldXAgaGFwcGVuZWQgd2hlbiBtb3VzZSB3YXMgb3V0IG9mIHdpbmRvd1xuXHRcdFx0aWYgKCAkLnVpLmllICYmICggIWRvY3VtZW50LmRvY3VtZW50TW9kZSB8fCBkb2N1bWVudC5kb2N1bWVudE1vZGUgPCA5ICkgJiZcblx0XHRcdFx0XHQhZXZlbnQuYnV0dG9uICkge1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5fbW91c2VVcCggZXZlbnQgKTtcblxuXHRcdFx0Ly8gSWZyYW1lIG1vdXNldXAgY2hlY2sgLSBtb3VzZXVwIG9jY3VycmVkIGluIGFub3RoZXIgZG9jdW1lbnRcblx0XHRcdH0gZWxzZSBpZiAoICFldmVudC53aGljaCApIHtcblxuXHRcdFx0XHQvLyBTdXBwb3J0OiBTYWZhcmkgPD04IC0gOVxuXHRcdFx0XHQvLyBTYWZhcmkgc2V0cyB3aGljaCB0byAwIGlmIHlvdSBwcmVzcyBhbnkgb2YgdGhlIGZvbGxvd2luZyBrZXlzXG5cdFx0XHRcdC8vIGR1cmluZyBhIGRyYWcgKCMxNDQ2MSlcblx0XHRcdFx0aWYgKCBldmVudC5vcmlnaW5hbEV2ZW50LmFsdEtleSB8fCBldmVudC5vcmlnaW5hbEV2ZW50LmN0cmxLZXkgfHxcblx0XHRcdFx0XHRcdGV2ZW50Lm9yaWdpbmFsRXZlbnQubWV0YUtleSB8fCBldmVudC5vcmlnaW5hbEV2ZW50LnNoaWZ0S2V5ICkge1xuXHRcdFx0XHRcdHRoaXMuaWdub3JlTWlzc2luZ1doaWNoID0gdHJ1ZTtcblx0XHRcdFx0fSBlbHNlIGlmICggIXRoaXMuaWdub3JlTWlzc2luZ1doaWNoICkge1xuXHRcdFx0XHRcdHJldHVybiB0aGlzLl9tb3VzZVVwKCBldmVudCApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKCBldmVudC53aGljaCB8fCBldmVudC5idXR0b24gKSB7XG5cdFx0XHR0aGlzLl9tb3VzZU1vdmVkID0gdHJ1ZTtcblx0XHR9XG5cblx0XHRpZiAoIHRoaXMuX21vdXNlU3RhcnRlZCApIHtcblx0XHRcdHRoaXMuX21vdXNlRHJhZyggZXZlbnQgKTtcblx0XHRcdHJldHVybiBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdH1cblxuXHRcdGlmICggdGhpcy5fbW91c2VEaXN0YW5jZU1ldCggZXZlbnQgKSAmJiB0aGlzLl9tb3VzZURlbGF5TWV0KCBldmVudCApICkge1xuXHRcdFx0dGhpcy5fbW91c2VTdGFydGVkID1cblx0XHRcdFx0KCB0aGlzLl9tb3VzZVN0YXJ0KCB0aGlzLl9tb3VzZURvd25FdmVudCwgZXZlbnQgKSAhPT0gZmFsc2UgKTtcblx0XHRcdCggdGhpcy5fbW91c2VTdGFydGVkID8gdGhpcy5fbW91c2VEcmFnKCBldmVudCApIDogdGhpcy5fbW91c2VVcCggZXZlbnQgKSApO1xuXHRcdH1cblxuXHRcdHJldHVybiAhdGhpcy5fbW91c2VTdGFydGVkO1xuXHR9LFxuXG5cdF9tb3VzZVVwOiBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0dGhpcy5kb2N1bWVudFxuXHRcdFx0Lm9mZiggXCJtb3VzZW1vdmUuXCIgKyB0aGlzLndpZGdldE5hbWUsIHRoaXMuX21vdXNlTW92ZURlbGVnYXRlIClcblx0XHRcdC5vZmYoIFwibW91c2V1cC5cIiArIHRoaXMud2lkZ2V0TmFtZSwgdGhpcy5fbW91c2VVcERlbGVnYXRlICk7XG5cblx0XHRpZiAoIHRoaXMuX21vdXNlU3RhcnRlZCApIHtcblx0XHRcdHRoaXMuX21vdXNlU3RhcnRlZCA9IGZhbHNlO1xuXG5cdFx0XHRpZiAoIGV2ZW50LnRhcmdldCA9PT0gdGhpcy5fbW91c2VEb3duRXZlbnQudGFyZ2V0ICkge1xuXHRcdFx0XHQkLmRhdGEoIGV2ZW50LnRhcmdldCwgdGhpcy53aWRnZXROYW1lICsgXCIucHJldmVudENsaWNrRXZlbnRcIiwgdHJ1ZSApO1xuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLl9tb3VzZVN0b3AoIGV2ZW50ICk7XG5cdFx0fVxuXG5cdFx0aWYgKCB0aGlzLl9tb3VzZURlbGF5VGltZXIgKSB7XG5cdFx0XHRjbGVhclRpbWVvdXQoIHRoaXMuX21vdXNlRGVsYXlUaW1lciApO1xuXHRcdFx0ZGVsZXRlIHRoaXMuX21vdXNlRGVsYXlUaW1lcjtcblx0XHR9XG5cblx0XHR0aGlzLmlnbm9yZU1pc3NpbmdXaGljaCA9IGZhbHNlO1xuXHRcdG1vdXNlSGFuZGxlZCA9IGZhbHNlO1xuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdH0sXG5cblx0X21vdXNlRGlzdGFuY2VNZXQ6IGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHRyZXR1cm4gKCBNYXRoLm1heChcblx0XHRcdFx0TWF0aC5hYnMoIHRoaXMuX21vdXNlRG93bkV2ZW50LnBhZ2VYIC0gZXZlbnQucGFnZVggKSxcblx0XHRcdFx0TWF0aC5hYnMoIHRoaXMuX21vdXNlRG93bkV2ZW50LnBhZ2VZIC0gZXZlbnQucGFnZVkgKVxuXHRcdFx0KSA+PSB0aGlzLm9wdGlvbnMuZGlzdGFuY2Vcblx0XHQpO1xuXHR9LFxuXG5cdF9tb3VzZURlbGF5TWV0OiBmdW5jdGlvbiggLyogZXZlbnQgKi8gKSB7XG5cdFx0cmV0dXJuIHRoaXMubW91c2VEZWxheU1ldDtcblx0fSxcblxuXHQvLyBUaGVzZSBhcmUgcGxhY2Vob2xkZXIgbWV0aG9kcywgdG8gYmUgb3ZlcnJpZGVuIGJ5IGV4dGVuZGluZyBwbHVnaW5cblx0X21vdXNlU3RhcnQ6IGZ1bmN0aW9uKCAvKiBldmVudCAqLyApIHt9LFxuXHRfbW91c2VEcmFnOiBmdW5jdGlvbiggLyogZXZlbnQgKi8gKSB7fSxcblx0X21vdXNlU3RvcDogZnVuY3Rpb24oIC8qIGV2ZW50ICovICkge30sXG5cdF9tb3VzZUNhcHR1cmU6IGZ1bmN0aW9uKCAvKiBldmVudCAqLyApIHsgcmV0dXJuIHRydWU7IH1cbn0gKTtcblxufSApICk7XG4iLCIvKiFcbiAqIGpRdWVyeSBVSSBEcmFnZ2FibGUgMS4xMi4xXG4gKiBodHRwOi8vanF1ZXJ5dWkuY29tXG4gKlxuICogQ29weXJpZ2h0IGpRdWVyeSBGb3VuZGF0aW9uIGFuZCBvdGhlciBjb250cmlidXRvcnNcbiAqIFJlbGVhc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZS5cbiAqIGh0dHA6Ly9qcXVlcnkub3JnL2xpY2Vuc2VcbiAqL1xuXG4vLz4+bGFiZWw6IERyYWdnYWJsZVxuLy8+Pmdyb3VwOiBJbnRlcmFjdGlvbnNcbi8vPj5kZXNjcmlwdGlvbjogRW5hYmxlcyBkcmFnZ2luZyBmdW5jdGlvbmFsaXR5IGZvciBhbnkgZWxlbWVudC5cbi8vPj5kb2NzOiBodHRwOi8vYXBpLmpxdWVyeXVpLmNvbS9kcmFnZ2FibGUvXG4vLz4+ZGVtb3M6IGh0dHA6Ly9qcXVlcnl1aS5jb20vZHJhZ2dhYmxlL1xuLy8+PmNzcy5zdHJ1Y3R1cmU6IC4uLy4uL3RoZW1lcy9iYXNlL2RyYWdnYWJsZS5jc3NcblxuKCBmdW5jdGlvbiggZmFjdG9yeSApIHtcblx0aWYgKCB0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCApIHtcblxuXHRcdC8vIEFNRC4gUmVnaXN0ZXIgYXMgYW4gYW5vbnltb3VzIG1vZHVsZS5cblx0XHRkZWZpbmUoIFtcblx0XHRcdFwianF1ZXJ5XCIsXG5cdFx0XHRcIi4vbW91c2VcIixcblx0XHRcdFwiLi4vZGF0YVwiLFxuXHRcdFx0XCIuLi9wbHVnaW5cIixcblx0XHRcdFwiLi4vc2FmZS1hY3RpdmUtZWxlbWVudFwiLFxuXHRcdFx0XCIuLi9zYWZlLWJsdXJcIixcblx0XHRcdFwiLi4vc2Nyb2xsLXBhcmVudFwiLFxuXHRcdFx0XCIuLi92ZXJzaW9uXCIsXG5cdFx0XHRcIi4uL3dpZGdldFwiXG5cdFx0XSwgZmFjdG9yeSApO1xuXHR9IGVsc2Uge1xuXG5cdFx0Ly8gQnJvd3NlciBnbG9iYWxzXG5cdFx0ZmFjdG9yeSggalF1ZXJ5ICk7XG5cdH1cbn0oIGZ1bmN0aW9uKCAkICkge1xuXG4kLndpZGdldCggXCJ1aS5kcmFnZ2FibGVcIiwgJC51aS5tb3VzZSwge1xuXHR2ZXJzaW9uOiBcIjEuMTIuMVwiLFxuXHR3aWRnZXRFdmVudFByZWZpeDogXCJkcmFnXCIsXG5cdG9wdGlvbnM6IHtcblx0XHRhZGRDbGFzc2VzOiB0cnVlLFxuXHRcdGFwcGVuZFRvOiBcInBhcmVudFwiLFxuXHRcdGF4aXM6IGZhbHNlLFxuXHRcdGNvbm5lY3RUb1NvcnRhYmxlOiBmYWxzZSxcblx0XHRjb250YWlubWVudDogZmFsc2UsXG5cdFx0Y3Vyc29yOiBcImF1dG9cIixcblx0XHRjdXJzb3JBdDogZmFsc2UsXG5cdFx0Z3JpZDogZmFsc2UsXG5cdFx0aGFuZGxlOiBmYWxzZSxcblx0XHRoZWxwZXI6IFwib3JpZ2luYWxcIixcblx0XHRpZnJhbWVGaXg6IGZhbHNlLFxuXHRcdG9wYWNpdHk6IGZhbHNlLFxuXHRcdHJlZnJlc2hQb3NpdGlvbnM6IGZhbHNlLFxuXHRcdHJldmVydDogZmFsc2UsXG5cdFx0cmV2ZXJ0RHVyYXRpb246IDUwMCxcblx0XHRzY29wZTogXCJkZWZhdWx0XCIsXG5cdFx0c2Nyb2xsOiB0cnVlLFxuXHRcdHNjcm9sbFNlbnNpdGl2aXR5OiAyMCxcblx0XHRzY3JvbGxTcGVlZDogMjAsXG5cdFx0c25hcDogZmFsc2UsXG5cdFx0c25hcE1vZGU6IFwiYm90aFwiLFxuXHRcdHNuYXBUb2xlcmFuY2U6IDIwLFxuXHRcdHN0YWNrOiBmYWxzZSxcblx0XHR6SW5kZXg6IGZhbHNlLFxuXG5cdFx0Ly8gQ2FsbGJhY2tzXG5cdFx0ZHJhZzogbnVsbCxcblx0XHRzdGFydDogbnVsbCxcblx0XHRzdG9wOiBudWxsXG5cdH0sXG5cdF9jcmVhdGU6IGZ1bmN0aW9uKCkge1xuXG5cdFx0aWYgKCB0aGlzLm9wdGlvbnMuaGVscGVyID09PSBcIm9yaWdpbmFsXCIgKSB7XG5cdFx0XHR0aGlzLl9zZXRQb3NpdGlvblJlbGF0aXZlKCk7XG5cdFx0fVxuXHRcdGlmICggdGhpcy5vcHRpb25zLmFkZENsYXNzZXMgKSB7XG5cdFx0XHR0aGlzLl9hZGRDbGFzcyggXCJ1aS1kcmFnZ2FibGVcIiApO1xuXHRcdH1cblx0XHR0aGlzLl9zZXRIYW5kbGVDbGFzc05hbWUoKTtcblxuXHRcdHRoaXMuX21vdXNlSW5pdCgpO1xuXHR9LFxuXG5cdF9zZXRPcHRpb246IGZ1bmN0aW9uKCBrZXksIHZhbHVlICkge1xuXHRcdHRoaXMuX3N1cGVyKCBrZXksIHZhbHVlICk7XG5cdFx0aWYgKCBrZXkgPT09IFwiaGFuZGxlXCIgKSB7XG5cdFx0XHR0aGlzLl9yZW1vdmVIYW5kbGVDbGFzc05hbWUoKTtcblx0XHRcdHRoaXMuX3NldEhhbmRsZUNsYXNzTmFtZSgpO1xuXHRcdH1cblx0fSxcblxuXHRfZGVzdHJveTogZnVuY3Rpb24oKSB7XG5cdFx0aWYgKCAoIHRoaXMuaGVscGVyIHx8IHRoaXMuZWxlbWVudCApLmlzKCBcIi51aS1kcmFnZ2FibGUtZHJhZ2dpbmdcIiApICkge1xuXHRcdFx0dGhpcy5kZXN0cm95T25DbGVhciA9IHRydWU7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdHRoaXMuX3JlbW92ZUhhbmRsZUNsYXNzTmFtZSgpO1xuXHRcdHRoaXMuX21vdXNlRGVzdHJveSgpO1xuXHR9LFxuXG5cdF9tb3VzZUNhcHR1cmU6IGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHR2YXIgbyA9IHRoaXMub3B0aW9ucztcblxuXHRcdC8vIEFtb25nIG90aGVycywgcHJldmVudCBhIGRyYWcgb24gYSByZXNpemFibGUtaGFuZGxlXG5cdFx0aWYgKCB0aGlzLmhlbHBlciB8fCBvLmRpc2FibGVkIHx8XG5cdFx0XHRcdCQoIGV2ZW50LnRhcmdldCApLmNsb3Nlc3QoIFwiLnVpLXJlc2l6YWJsZS1oYW5kbGVcIiApLmxlbmd0aCA+IDAgKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0Ly9RdWl0IGlmIHdlJ3JlIG5vdCBvbiBhIHZhbGlkIGhhbmRsZVxuXHRcdHRoaXMuaGFuZGxlID0gdGhpcy5fZ2V0SGFuZGxlKCBldmVudCApO1xuXHRcdGlmICggIXRoaXMuaGFuZGxlICkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdHRoaXMuX2JsdXJBY3RpdmVFbGVtZW50KCBldmVudCApO1xuXG5cdFx0dGhpcy5fYmxvY2tGcmFtZXMoIG8uaWZyYW1lRml4ID09PSB0cnVlID8gXCJpZnJhbWVcIiA6IG8uaWZyYW1lRml4ICk7XG5cblx0XHRyZXR1cm4gdHJ1ZTtcblxuXHR9LFxuXG5cdF9ibG9ja0ZyYW1lczogZnVuY3Rpb24oIHNlbGVjdG9yICkge1xuXHRcdHRoaXMuaWZyYW1lQmxvY2tzID0gdGhpcy5kb2N1bWVudC5maW5kKCBzZWxlY3RvciApLm1hcCggZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgaWZyYW1lID0gJCggdGhpcyApO1xuXG5cdFx0XHRyZXR1cm4gJCggXCI8ZGl2PlwiIClcblx0XHRcdFx0LmNzcyggXCJwb3NpdGlvblwiLCBcImFic29sdXRlXCIgKVxuXHRcdFx0XHQuYXBwZW5kVG8oIGlmcmFtZS5wYXJlbnQoKSApXG5cdFx0XHRcdC5vdXRlcldpZHRoKCBpZnJhbWUub3V0ZXJXaWR0aCgpIClcblx0XHRcdFx0Lm91dGVySGVpZ2h0KCBpZnJhbWUub3V0ZXJIZWlnaHQoKSApXG5cdFx0XHRcdC5vZmZzZXQoIGlmcmFtZS5vZmZzZXQoKSApWyAwIF07XG5cdFx0fSApO1xuXHR9LFxuXG5cdF91bmJsb2NrRnJhbWVzOiBmdW5jdGlvbigpIHtcblx0XHRpZiAoIHRoaXMuaWZyYW1lQmxvY2tzICkge1xuXHRcdFx0dGhpcy5pZnJhbWVCbG9ja3MucmVtb3ZlKCk7XG5cdFx0XHRkZWxldGUgdGhpcy5pZnJhbWVCbG9ja3M7XG5cdFx0fVxuXHR9LFxuXG5cdF9ibHVyQWN0aXZlRWxlbWVudDogZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdHZhciBhY3RpdmVFbGVtZW50ID0gJC51aS5zYWZlQWN0aXZlRWxlbWVudCggdGhpcy5kb2N1bWVudFsgMCBdICksXG5cdFx0XHR0YXJnZXQgPSAkKCBldmVudC50YXJnZXQgKTtcblxuXHRcdC8vIERvbid0IGJsdXIgaWYgdGhlIGV2ZW50IG9jY3VycmVkIG9uIGFuIGVsZW1lbnQgdGhhdCBpcyB3aXRoaW5cblx0XHQvLyB0aGUgY3VycmVudGx5IGZvY3VzZWQgZWxlbWVudFxuXHRcdC8vIFNlZSAjMTA1MjcsICMxMjQ3MlxuXHRcdGlmICggdGFyZ2V0LmNsb3Nlc3QoIGFjdGl2ZUVsZW1lbnQgKS5sZW5ndGggKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Ly8gQmx1ciBhbnkgZWxlbWVudCB0aGF0IGN1cnJlbnRseSBoYXMgZm9jdXMsIHNlZSAjNDI2MVxuXHRcdCQudWkuc2FmZUJsdXIoIGFjdGl2ZUVsZW1lbnQgKTtcblx0fSxcblxuXHRfbW91c2VTdGFydDogZnVuY3Rpb24oIGV2ZW50ICkge1xuXG5cdFx0dmFyIG8gPSB0aGlzLm9wdGlvbnM7XG5cblx0XHQvL0NyZWF0ZSBhbmQgYXBwZW5kIHRoZSB2aXNpYmxlIGhlbHBlclxuXHRcdHRoaXMuaGVscGVyID0gdGhpcy5fY3JlYXRlSGVscGVyKCBldmVudCApO1xuXG5cdFx0dGhpcy5fYWRkQ2xhc3MoIHRoaXMuaGVscGVyLCBcInVpLWRyYWdnYWJsZS1kcmFnZ2luZ1wiICk7XG5cblx0XHQvL0NhY2hlIHRoZSBoZWxwZXIgc2l6ZVxuXHRcdHRoaXMuX2NhY2hlSGVscGVyUHJvcG9ydGlvbnMoKTtcblxuXHRcdC8vSWYgZGRtYW5hZ2VyIGlzIHVzZWQgZm9yIGRyb3BwYWJsZXMsIHNldCB0aGUgZ2xvYmFsIGRyYWdnYWJsZVxuXHRcdGlmICggJC51aS5kZG1hbmFnZXIgKSB7XG5cdFx0XHQkLnVpLmRkbWFuYWdlci5jdXJyZW50ID0gdGhpcztcblx0XHR9XG5cblx0XHQvKlxuXHRcdCAqIC0gUG9zaXRpb24gZ2VuZXJhdGlvbiAtXG5cdFx0ICogVGhpcyBibG9jayBnZW5lcmF0ZXMgZXZlcnl0aGluZyBwb3NpdGlvbiByZWxhdGVkIC0gaXQncyB0aGUgY29yZSBvZiBkcmFnZ2FibGVzLlxuXHRcdCAqL1xuXG5cdFx0Ly9DYWNoZSB0aGUgbWFyZ2lucyBvZiB0aGUgb3JpZ2luYWwgZWxlbWVudFxuXHRcdHRoaXMuX2NhY2hlTWFyZ2lucygpO1xuXG5cdFx0Ly9TdG9yZSB0aGUgaGVscGVyJ3MgY3NzIHBvc2l0aW9uXG5cdFx0dGhpcy5jc3NQb3NpdGlvbiA9IHRoaXMuaGVscGVyLmNzcyggXCJwb3NpdGlvblwiICk7XG5cdFx0dGhpcy5zY3JvbGxQYXJlbnQgPSB0aGlzLmhlbHBlci5zY3JvbGxQYXJlbnQoIHRydWUgKTtcblx0XHR0aGlzLm9mZnNldFBhcmVudCA9IHRoaXMuaGVscGVyLm9mZnNldFBhcmVudCgpO1xuXHRcdHRoaXMuaGFzRml4ZWRBbmNlc3RvciA9IHRoaXMuaGVscGVyLnBhcmVudHMoKS5maWx0ZXIoIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRyZXR1cm4gJCggdGhpcyApLmNzcyggXCJwb3NpdGlvblwiICkgPT09IFwiZml4ZWRcIjtcblx0XHRcdH0gKS5sZW5ndGggPiAwO1xuXG5cdFx0Ly9UaGUgZWxlbWVudCdzIGFic29sdXRlIHBvc2l0aW9uIG9uIHRoZSBwYWdlIG1pbnVzIG1hcmdpbnNcblx0XHR0aGlzLnBvc2l0aW9uQWJzID0gdGhpcy5lbGVtZW50Lm9mZnNldCgpO1xuXHRcdHRoaXMuX3JlZnJlc2hPZmZzZXRzKCBldmVudCApO1xuXG5cdFx0Ly9HZW5lcmF0ZSB0aGUgb3JpZ2luYWwgcG9zaXRpb25cblx0XHR0aGlzLm9yaWdpbmFsUG9zaXRpb24gPSB0aGlzLnBvc2l0aW9uID0gdGhpcy5fZ2VuZXJhdGVQb3NpdGlvbiggZXZlbnQsIGZhbHNlICk7XG5cdFx0dGhpcy5vcmlnaW5hbFBhZ2VYID0gZXZlbnQucGFnZVg7XG5cdFx0dGhpcy5vcmlnaW5hbFBhZ2VZID0gZXZlbnQucGFnZVk7XG5cblx0XHQvL0FkanVzdCB0aGUgbW91c2Ugb2Zmc2V0IHJlbGF0aXZlIHRvIHRoZSBoZWxwZXIgaWYgXCJjdXJzb3JBdFwiIGlzIHN1cHBsaWVkXG5cdFx0KCBvLmN1cnNvckF0ICYmIHRoaXMuX2FkanVzdE9mZnNldEZyb21IZWxwZXIoIG8uY3Vyc29yQXQgKSApO1xuXG5cdFx0Ly9TZXQgYSBjb250YWlubWVudCBpZiBnaXZlbiBpbiB0aGUgb3B0aW9uc1xuXHRcdHRoaXMuX3NldENvbnRhaW5tZW50KCk7XG5cblx0XHQvL1RyaWdnZXIgZXZlbnQgKyBjYWxsYmFja3Ncblx0XHRpZiAoIHRoaXMuX3RyaWdnZXIoIFwic3RhcnRcIiwgZXZlbnQgKSA9PT0gZmFsc2UgKSB7XG5cdFx0XHR0aGlzLl9jbGVhcigpO1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdC8vUmVjYWNoZSB0aGUgaGVscGVyIHNpemVcblx0XHR0aGlzLl9jYWNoZUhlbHBlclByb3BvcnRpb25zKCk7XG5cblx0XHQvL1ByZXBhcmUgdGhlIGRyb3BwYWJsZSBvZmZzZXRzXG5cdFx0aWYgKCAkLnVpLmRkbWFuYWdlciAmJiAhby5kcm9wQmVoYXZpb3VyICkge1xuXHRcdFx0JC51aS5kZG1hbmFnZXIucHJlcGFyZU9mZnNldHMoIHRoaXMsIGV2ZW50ICk7XG5cdFx0fVxuXG5cdFx0Ly8gRXhlY3V0ZSB0aGUgZHJhZyBvbmNlIC0gdGhpcyBjYXVzZXMgdGhlIGhlbHBlciBub3QgdG8gYmUgdmlzaWJsZSBiZWZvcmUgZ2V0dGluZyBpdHNcblx0XHQvLyBjb3JyZWN0IHBvc2l0aW9uXG5cdFx0dGhpcy5fbW91c2VEcmFnKCBldmVudCwgdHJ1ZSApO1xuXG5cdFx0Ly8gSWYgdGhlIGRkbWFuYWdlciBpcyB1c2VkIGZvciBkcm9wcGFibGVzLCBpbmZvcm0gdGhlIG1hbmFnZXIgdGhhdCBkcmFnZ2luZyBoYXMgc3RhcnRlZFxuXHRcdC8vIChzZWUgIzUwMDMpXG5cdFx0aWYgKCAkLnVpLmRkbWFuYWdlciApIHtcblx0XHRcdCQudWkuZGRtYW5hZ2VyLmRyYWdTdGFydCggdGhpcywgZXZlbnQgKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fSxcblxuXHRfcmVmcmVzaE9mZnNldHM6IGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHR0aGlzLm9mZnNldCA9IHtcblx0XHRcdHRvcDogdGhpcy5wb3NpdGlvbkFicy50b3AgLSB0aGlzLm1hcmdpbnMudG9wLFxuXHRcdFx0bGVmdDogdGhpcy5wb3NpdGlvbkFicy5sZWZ0IC0gdGhpcy5tYXJnaW5zLmxlZnQsXG5cdFx0XHRzY3JvbGw6IGZhbHNlLFxuXHRcdFx0cGFyZW50OiB0aGlzLl9nZXRQYXJlbnRPZmZzZXQoKSxcblx0XHRcdHJlbGF0aXZlOiB0aGlzLl9nZXRSZWxhdGl2ZU9mZnNldCgpXG5cdFx0fTtcblxuXHRcdHRoaXMub2Zmc2V0LmNsaWNrID0ge1xuXHRcdFx0bGVmdDogZXZlbnQucGFnZVggLSB0aGlzLm9mZnNldC5sZWZ0LFxuXHRcdFx0dG9wOiBldmVudC5wYWdlWSAtIHRoaXMub2Zmc2V0LnRvcFxuXHRcdH07XG5cdH0sXG5cblx0X21vdXNlRHJhZzogZnVuY3Rpb24oIGV2ZW50LCBub1Byb3BhZ2F0aW9uICkge1xuXG5cdFx0Ly8gcmVzZXQgYW55IG5lY2Vzc2FyeSBjYWNoZWQgcHJvcGVydGllcyAoc2VlICM1MDA5KVxuXHRcdGlmICggdGhpcy5oYXNGaXhlZEFuY2VzdG9yICkge1xuXHRcdFx0dGhpcy5vZmZzZXQucGFyZW50ID0gdGhpcy5fZ2V0UGFyZW50T2Zmc2V0KCk7XG5cdFx0fVxuXG5cdFx0Ly9Db21wdXRlIHRoZSBoZWxwZXJzIHBvc2l0aW9uXG5cdFx0dGhpcy5wb3NpdGlvbiA9IHRoaXMuX2dlbmVyYXRlUG9zaXRpb24oIGV2ZW50LCB0cnVlICk7XG5cdFx0dGhpcy5wb3NpdGlvbkFicyA9IHRoaXMuX2NvbnZlcnRQb3NpdGlvblRvKCBcImFic29sdXRlXCIgKTtcblxuXHRcdC8vQ2FsbCBwbHVnaW5zIGFuZCBjYWxsYmFja3MgYW5kIHVzZSB0aGUgcmVzdWx0aW5nIHBvc2l0aW9uIGlmIHNvbWV0aGluZyBpcyByZXR1cm5lZFxuXHRcdGlmICggIW5vUHJvcGFnYXRpb24gKSB7XG5cdFx0XHR2YXIgdWkgPSB0aGlzLl91aUhhc2goKTtcblx0XHRcdGlmICggdGhpcy5fdHJpZ2dlciggXCJkcmFnXCIsIGV2ZW50LCB1aSApID09PSBmYWxzZSApIHtcblx0XHRcdFx0dGhpcy5fbW91c2VVcCggbmV3ICQuRXZlbnQoIFwibW91c2V1cFwiLCBldmVudCApICk7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblx0XHRcdHRoaXMucG9zaXRpb24gPSB1aS5wb3NpdGlvbjtcblx0XHR9XG5cblx0XHR0aGlzLmhlbHBlclsgMCBdLnN0eWxlLmxlZnQgPSB0aGlzLnBvc2l0aW9uLmxlZnQgKyBcInB4XCI7XG5cdFx0dGhpcy5oZWxwZXJbIDAgXS5zdHlsZS50b3AgPSB0aGlzLnBvc2l0aW9uLnRvcCArIFwicHhcIjtcblxuXHRcdGlmICggJC51aS5kZG1hbmFnZXIgKSB7XG5cdFx0XHQkLnVpLmRkbWFuYWdlci5kcmFnKCB0aGlzLCBldmVudCApO1xuXHRcdH1cblxuXHRcdHJldHVybiBmYWxzZTtcblx0fSxcblxuXHRfbW91c2VTdG9wOiBmdW5jdGlvbiggZXZlbnQgKSB7XG5cblx0XHQvL0lmIHdlIGFyZSB1c2luZyBkcm9wcGFibGVzLCBpbmZvcm0gdGhlIG1hbmFnZXIgYWJvdXQgdGhlIGRyb3Bcblx0XHR2YXIgdGhhdCA9IHRoaXMsXG5cdFx0XHRkcm9wcGVkID0gZmFsc2U7XG5cdFx0aWYgKCAkLnVpLmRkbWFuYWdlciAmJiAhdGhpcy5vcHRpb25zLmRyb3BCZWhhdmlvdXIgKSB7XG5cdFx0XHRkcm9wcGVkID0gJC51aS5kZG1hbmFnZXIuZHJvcCggdGhpcywgZXZlbnQgKTtcblx0XHR9XG5cblx0XHQvL2lmIGEgZHJvcCBjb21lcyBmcm9tIG91dHNpZGUgKGEgc29ydGFibGUpXG5cdFx0aWYgKCB0aGlzLmRyb3BwZWQgKSB7XG5cdFx0XHRkcm9wcGVkID0gdGhpcy5kcm9wcGVkO1xuXHRcdFx0dGhpcy5kcm9wcGVkID0gZmFsc2U7XG5cdFx0fVxuXG5cdFx0aWYgKCAoIHRoaXMub3B0aW9ucy5yZXZlcnQgPT09IFwiaW52YWxpZFwiICYmICFkcm9wcGVkICkgfHxcblx0XHRcdFx0KCB0aGlzLm9wdGlvbnMucmV2ZXJ0ID09PSBcInZhbGlkXCIgJiYgZHJvcHBlZCApIHx8XG5cdFx0XHRcdHRoaXMub3B0aW9ucy5yZXZlcnQgPT09IHRydWUgfHwgKCAkLmlzRnVuY3Rpb24oIHRoaXMub3B0aW9ucy5yZXZlcnQgKSAmJlxuXHRcdFx0XHR0aGlzLm9wdGlvbnMucmV2ZXJ0LmNhbGwoIHRoaXMuZWxlbWVudCwgZHJvcHBlZCApIClcblx0XHQpIHtcblx0XHRcdCQoIHRoaXMuaGVscGVyICkuYW5pbWF0ZShcblx0XHRcdFx0dGhpcy5vcmlnaW5hbFBvc2l0aW9uLFxuXHRcdFx0XHRwYXJzZUludCggdGhpcy5vcHRpb25zLnJldmVydER1cmF0aW9uLCAxMCApLFxuXHRcdFx0XHRmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRpZiAoIHRoYXQuX3RyaWdnZXIoIFwic3RvcFwiLCBldmVudCApICE9PSBmYWxzZSApIHtcblx0XHRcdFx0XHRcdHRoYXQuX2NsZWFyKCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHQpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRpZiAoIHRoaXMuX3RyaWdnZXIoIFwic3RvcFwiLCBldmVudCApICE9PSBmYWxzZSApIHtcblx0XHRcdFx0dGhpcy5fY2xlYXIoKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH0sXG5cblx0X21vdXNlVXA6IGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHR0aGlzLl91bmJsb2NrRnJhbWVzKCk7XG5cblx0XHQvLyBJZiB0aGUgZGRtYW5hZ2VyIGlzIHVzZWQgZm9yIGRyb3BwYWJsZXMsIGluZm9ybSB0aGUgbWFuYWdlciB0aGF0IGRyYWdnaW5nIGhhcyBzdG9wcGVkXG5cdFx0Ly8gKHNlZSAjNTAwMylcblx0XHRpZiAoICQudWkuZGRtYW5hZ2VyICkge1xuXHRcdFx0JC51aS5kZG1hbmFnZXIuZHJhZ1N0b3AoIHRoaXMsIGV2ZW50ICk7XG5cdFx0fVxuXG5cdFx0Ly8gT25seSBuZWVkIHRvIGZvY3VzIGlmIHRoZSBldmVudCBvY2N1cnJlZCBvbiB0aGUgZHJhZ2dhYmxlIGl0c2VsZiwgc2VlICMxMDUyN1xuXHRcdGlmICggdGhpcy5oYW5kbGVFbGVtZW50LmlzKCBldmVudC50YXJnZXQgKSApIHtcblxuXHRcdFx0Ly8gVGhlIGludGVyYWN0aW9uIGlzIG92ZXI7IHdoZXRoZXIgb3Igbm90IHRoZSBjbGljayByZXN1bHRlZCBpbiBhIGRyYWcsXG5cdFx0XHQvLyBmb2N1cyB0aGUgZWxlbWVudFxuXHRcdFx0dGhpcy5lbGVtZW50LnRyaWdnZXIoIFwiZm9jdXNcIiApO1xuXHRcdH1cblxuXHRcdHJldHVybiAkLnVpLm1vdXNlLnByb3RvdHlwZS5fbW91c2VVcC5jYWxsKCB0aGlzLCBldmVudCApO1xuXHR9LFxuXG5cdGNhbmNlbDogZnVuY3Rpb24oKSB7XG5cblx0XHRpZiAoIHRoaXMuaGVscGVyLmlzKCBcIi51aS1kcmFnZ2FibGUtZHJhZ2dpbmdcIiApICkge1xuXHRcdFx0dGhpcy5fbW91c2VVcCggbmV3ICQuRXZlbnQoIFwibW91c2V1cFwiLCB7IHRhcmdldDogdGhpcy5lbGVtZW50WyAwIF0gfSApICk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuX2NsZWFyKCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fSxcblxuXHRfZ2V0SGFuZGxlOiBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0cmV0dXJuIHRoaXMub3B0aW9ucy5oYW5kbGUgP1xuXHRcdFx0ISEkKCBldmVudC50YXJnZXQgKS5jbG9zZXN0KCB0aGlzLmVsZW1lbnQuZmluZCggdGhpcy5vcHRpb25zLmhhbmRsZSApICkubGVuZ3RoIDpcblx0XHRcdHRydWU7XG5cdH0sXG5cblx0X3NldEhhbmRsZUNsYXNzTmFtZTogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5oYW5kbGVFbGVtZW50ID0gdGhpcy5vcHRpb25zLmhhbmRsZSA/XG5cdFx0XHR0aGlzLmVsZW1lbnQuZmluZCggdGhpcy5vcHRpb25zLmhhbmRsZSApIDogdGhpcy5lbGVtZW50O1xuXHRcdHRoaXMuX2FkZENsYXNzKCB0aGlzLmhhbmRsZUVsZW1lbnQsIFwidWktZHJhZ2dhYmxlLWhhbmRsZVwiICk7XG5cdH0sXG5cblx0X3JlbW92ZUhhbmRsZUNsYXNzTmFtZTogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5fcmVtb3ZlQ2xhc3MoIHRoaXMuaGFuZGxlRWxlbWVudCwgXCJ1aS1kcmFnZ2FibGUtaGFuZGxlXCIgKTtcblx0fSxcblxuXHRfY3JlYXRlSGVscGVyOiBmdW5jdGlvbiggZXZlbnQgKSB7XG5cblx0XHR2YXIgbyA9IHRoaXMub3B0aW9ucyxcblx0XHRcdGhlbHBlcklzRnVuY3Rpb24gPSAkLmlzRnVuY3Rpb24oIG8uaGVscGVyICksXG5cdFx0XHRoZWxwZXIgPSBoZWxwZXJJc0Z1bmN0aW9uID9cblx0XHRcdFx0JCggby5oZWxwZXIuYXBwbHkoIHRoaXMuZWxlbWVudFsgMCBdLCBbIGV2ZW50IF0gKSApIDpcblx0XHRcdFx0KCBvLmhlbHBlciA9PT0gXCJjbG9uZVwiID9cblx0XHRcdFx0XHR0aGlzLmVsZW1lbnQuY2xvbmUoKS5yZW1vdmVBdHRyKCBcImlkXCIgKSA6XG5cdFx0XHRcdFx0dGhpcy5lbGVtZW50ICk7XG5cblx0XHRpZiAoICFoZWxwZXIucGFyZW50cyggXCJib2R5XCIgKS5sZW5ndGggKSB7XG5cdFx0XHRoZWxwZXIuYXBwZW5kVG8oICggby5hcHBlbmRUbyA9PT0gXCJwYXJlbnRcIiA/XG5cdFx0XHRcdHRoaXMuZWxlbWVudFsgMCBdLnBhcmVudE5vZGUgOlxuXHRcdFx0XHRvLmFwcGVuZFRvICkgKTtcblx0XHR9XG5cblx0XHQvLyBIdHRwOi8vYnVncy5qcXVlcnl1aS5jb20vdGlja2V0Lzk0NDZcblx0XHQvLyBhIGhlbHBlciBmdW5jdGlvbiBjYW4gcmV0dXJuIHRoZSBvcmlnaW5hbCBlbGVtZW50XG5cdFx0Ly8gd2hpY2ggd291bGRuJ3QgaGF2ZSBiZWVuIHNldCB0byByZWxhdGl2ZSBpbiBfY3JlYXRlXG5cdFx0aWYgKCBoZWxwZXJJc0Z1bmN0aW9uICYmIGhlbHBlclsgMCBdID09PSB0aGlzLmVsZW1lbnRbIDAgXSApIHtcblx0XHRcdHRoaXMuX3NldFBvc2l0aW9uUmVsYXRpdmUoKTtcblx0XHR9XG5cblx0XHRpZiAoIGhlbHBlclsgMCBdICE9PSB0aGlzLmVsZW1lbnRbIDAgXSAmJlxuXHRcdFx0XHQhKCAvKGZpeGVkfGFic29sdXRlKS8gKS50ZXN0KCBoZWxwZXIuY3NzKCBcInBvc2l0aW9uXCIgKSApICkge1xuXHRcdFx0aGVscGVyLmNzcyggXCJwb3NpdGlvblwiLCBcImFic29sdXRlXCIgKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gaGVscGVyO1xuXG5cdH0sXG5cblx0X3NldFBvc2l0aW9uUmVsYXRpdmU6IGZ1bmN0aW9uKCkge1xuXHRcdGlmICggISggL14oPzpyfGF8ZikvICkudGVzdCggdGhpcy5lbGVtZW50LmNzcyggXCJwb3NpdGlvblwiICkgKSApIHtcblx0XHRcdHRoaXMuZWxlbWVudFsgMCBdLnN0eWxlLnBvc2l0aW9uID0gXCJyZWxhdGl2ZVwiO1xuXHRcdH1cblx0fSxcblxuXHRfYWRqdXN0T2Zmc2V0RnJvbUhlbHBlcjogZnVuY3Rpb24oIG9iaiApIHtcblx0XHRpZiAoIHR5cGVvZiBvYmogPT09IFwic3RyaW5nXCIgKSB7XG5cdFx0XHRvYmogPSBvYmouc3BsaXQoIFwiIFwiICk7XG5cdFx0fVxuXHRcdGlmICggJC5pc0FycmF5KCBvYmogKSApIHtcblx0XHRcdG9iaiA9IHsgbGVmdDogK29ialsgMCBdLCB0b3A6ICtvYmpbIDEgXSB8fCAwIH07XG5cdFx0fVxuXHRcdGlmICggXCJsZWZ0XCIgaW4gb2JqICkge1xuXHRcdFx0dGhpcy5vZmZzZXQuY2xpY2subGVmdCA9IG9iai5sZWZ0ICsgdGhpcy5tYXJnaW5zLmxlZnQ7XG5cdFx0fVxuXHRcdGlmICggXCJyaWdodFwiIGluIG9iaiApIHtcblx0XHRcdHRoaXMub2Zmc2V0LmNsaWNrLmxlZnQgPSB0aGlzLmhlbHBlclByb3BvcnRpb25zLndpZHRoIC0gb2JqLnJpZ2h0ICsgdGhpcy5tYXJnaW5zLmxlZnQ7XG5cdFx0fVxuXHRcdGlmICggXCJ0b3BcIiBpbiBvYmogKSB7XG5cdFx0XHR0aGlzLm9mZnNldC5jbGljay50b3AgPSBvYmoudG9wICsgdGhpcy5tYXJnaW5zLnRvcDtcblx0XHR9XG5cdFx0aWYgKCBcImJvdHRvbVwiIGluIG9iaiApIHtcblx0XHRcdHRoaXMub2Zmc2V0LmNsaWNrLnRvcCA9IHRoaXMuaGVscGVyUHJvcG9ydGlvbnMuaGVpZ2h0IC0gb2JqLmJvdHRvbSArIHRoaXMubWFyZ2lucy50b3A7XG5cdFx0fVxuXHR9LFxuXG5cdF9pc1Jvb3ROb2RlOiBmdW5jdGlvbiggZWxlbWVudCApIHtcblx0XHRyZXR1cm4gKCAvKGh0bWx8Ym9keSkvaSApLnRlc3QoIGVsZW1lbnQudGFnTmFtZSApIHx8IGVsZW1lbnQgPT09IHRoaXMuZG9jdW1lbnRbIDAgXTtcblx0fSxcblxuXHRfZ2V0UGFyZW50T2Zmc2V0OiBmdW5jdGlvbigpIHtcblxuXHRcdC8vR2V0IHRoZSBvZmZzZXRQYXJlbnQgYW5kIGNhY2hlIGl0cyBwb3NpdGlvblxuXHRcdHZhciBwbyA9IHRoaXMub2Zmc2V0UGFyZW50Lm9mZnNldCgpLFxuXHRcdFx0ZG9jdW1lbnQgPSB0aGlzLmRvY3VtZW50WyAwIF07XG5cblx0XHQvLyBUaGlzIGlzIGEgc3BlY2lhbCBjYXNlIHdoZXJlIHdlIG5lZWQgdG8gbW9kaWZ5IGEgb2Zmc2V0IGNhbGN1bGF0ZWQgb24gc3RhcnQsIHNpbmNlIHRoZVxuXHRcdC8vIGZvbGxvd2luZyBoYXBwZW5lZDpcblx0XHQvLyAxLiBUaGUgcG9zaXRpb24gb2YgdGhlIGhlbHBlciBpcyBhYnNvbHV0ZSwgc28gaXQncyBwb3NpdGlvbiBpcyBjYWxjdWxhdGVkIGJhc2VkIG9uIHRoZVxuXHRcdC8vIG5leHQgcG9zaXRpb25lZCBwYXJlbnRcblx0XHQvLyAyLiBUaGUgYWN0dWFsIG9mZnNldCBwYXJlbnQgaXMgYSBjaGlsZCBvZiB0aGUgc2Nyb2xsIHBhcmVudCwgYW5kIHRoZSBzY3JvbGwgcGFyZW50IGlzbid0XG5cdFx0Ly8gdGhlIGRvY3VtZW50LCB3aGljaCBtZWFucyB0aGF0IHRoZSBzY3JvbGwgaXMgaW5jbHVkZWQgaW4gdGhlIGluaXRpYWwgY2FsY3VsYXRpb24gb2YgdGhlXG5cdFx0Ly8gb2Zmc2V0IG9mIHRoZSBwYXJlbnQsIGFuZCBuZXZlciByZWNhbGN1bGF0ZWQgdXBvbiBkcmFnXG5cdFx0aWYgKCB0aGlzLmNzc1Bvc2l0aW9uID09PSBcImFic29sdXRlXCIgJiYgdGhpcy5zY3JvbGxQYXJlbnRbIDAgXSAhPT0gZG9jdW1lbnQgJiZcblx0XHRcdFx0JC5jb250YWlucyggdGhpcy5zY3JvbGxQYXJlbnRbIDAgXSwgdGhpcy5vZmZzZXRQYXJlbnRbIDAgXSApICkge1xuXHRcdFx0cG8ubGVmdCArPSB0aGlzLnNjcm9sbFBhcmVudC5zY3JvbGxMZWZ0KCk7XG5cdFx0XHRwby50b3AgKz0gdGhpcy5zY3JvbGxQYXJlbnQuc2Nyb2xsVG9wKCk7XG5cdFx0fVxuXG5cdFx0aWYgKCB0aGlzLl9pc1Jvb3ROb2RlKCB0aGlzLm9mZnNldFBhcmVudFsgMCBdICkgKSB7XG5cdFx0XHRwbyA9IHsgdG9wOiAwLCBsZWZ0OiAwIH07XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHtcblx0XHRcdHRvcDogcG8udG9wICsgKCBwYXJzZUludCggdGhpcy5vZmZzZXRQYXJlbnQuY3NzKCBcImJvcmRlclRvcFdpZHRoXCIgKSwgMTAgKSB8fCAwICksXG5cdFx0XHRsZWZ0OiBwby5sZWZ0ICsgKCBwYXJzZUludCggdGhpcy5vZmZzZXRQYXJlbnQuY3NzKCBcImJvcmRlckxlZnRXaWR0aFwiICksIDEwICkgfHwgMCApXG5cdFx0fTtcblxuXHR9LFxuXG5cdF9nZXRSZWxhdGl2ZU9mZnNldDogZnVuY3Rpb24oKSB7XG5cdFx0aWYgKCB0aGlzLmNzc1Bvc2l0aW9uICE9PSBcInJlbGF0aXZlXCIgKSB7XG5cdFx0XHRyZXR1cm4geyB0b3A6IDAsIGxlZnQ6IDAgfTtcblx0XHR9XG5cblx0XHR2YXIgcCA9IHRoaXMuZWxlbWVudC5wb3NpdGlvbigpLFxuXHRcdFx0c2Nyb2xsSXNSb290Tm9kZSA9IHRoaXMuX2lzUm9vdE5vZGUoIHRoaXMuc2Nyb2xsUGFyZW50WyAwIF0gKTtcblxuXHRcdHJldHVybiB7XG5cdFx0XHR0b3A6IHAudG9wIC0gKCBwYXJzZUludCggdGhpcy5oZWxwZXIuY3NzKCBcInRvcFwiICksIDEwICkgfHwgMCApICtcblx0XHRcdFx0KCAhc2Nyb2xsSXNSb290Tm9kZSA/IHRoaXMuc2Nyb2xsUGFyZW50LnNjcm9sbFRvcCgpIDogMCApLFxuXHRcdFx0bGVmdDogcC5sZWZ0IC0gKCBwYXJzZUludCggdGhpcy5oZWxwZXIuY3NzKCBcImxlZnRcIiApLCAxMCApIHx8IDAgKSArXG5cdFx0XHRcdCggIXNjcm9sbElzUm9vdE5vZGUgPyB0aGlzLnNjcm9sbFBhcmVudC5zY3JvbGxMZWZ0KCkgOiAwIClcblx0XHR9O1xuXG5cdH0sXG5cblx0X2NhY2hlTWFyZ2luczogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5tYXJnaW5zID0ge1xuXHRcdFx0bGVmdDogKCBwYXJzZUludCggdGhpcy5lbGVtZW50LmNzcyggXCJtYXJnaW5MZWZ0XCIgKSwgMTAgKSB8fCAwICksXG5cdFx0XHR0b3A6ICggcGFyc2VJbnQoIHRoaXMuZWxlbWVudC5jc3MoIFwibWFyZ2luVG9wXCIgKSwgMTAgKSB8fCAwICksXG5cdFx0XHRyaWdodDogKCBwYXJzZUludCggdGhpcy5lbGVtZW50LmNzcyggXCJtYXJnaW5SaWdodFwiICksIDEwICkgfHwgMCApLFxuXHRcdFx0Ym90dG9tOiAoIHBhcnNlSW50KCB0aGlzLmVsZW1lbnQuY3NzKCBcIm1hcmdpbkJvdHRvbVwiICksIDEwICkgfHwgMCApXG5cdFx0fTtcblx0fSxcblxuXHRfY2FjaGVIZWxwZXJQcm9wb3J0aW9uczogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5oZWxwZXJQcm9wb3J0aW9ucyA9IHtcblx0XHRcdHdpZHRoOiB0aGlzLmhlbHBlci5vdXRlcldpZHRoKCksXG5cdFx0XHRoZWlnaHQ6IHRoaXMuaGVscGVyLm91dGVySGVpZ2h0KClcblx0XHR9O1xuXHR9LFxuXG5cdF9zZXRDb250YWlubWVudDogZnVuY3Rpb24oKSB7XG5cblx0XHR2YXIgaXNVc2VyU2Nyb2xsYWJsZSwgYywgY2UsXG5cdFx0XHRvID0gdGhpcy5vcHRpb25zLFxuXHRcdFx0ZG9jdW1lbnQgPSB0aGlzLmRvY3VtZW50WyAwIF07XG5cblx0XHR0aGlzLnJlbGF0aXZlQ29udGFpbmVyID0gbnVsbDtcblxuXHRcdGlmICggIW8uY29udGFpbm1lbnQgKSB7XG5cdFx0XHR0aGlzLmNvbnRhaW5tZW50ID0gbnVsbDtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRpZiAoIG8uY29udGFpbm1lbnQgPT09IFwid2luZG93XCIgKSB7XG5cdFx0XHR0aGlzLmNvbnRhaW5tZW50ID0gW1xuXHRcdFx0XHQkKCB3aW5kb3cgKS5zY3JvbGxMZWZ0KCkgLSB0aGlzLm9mZnNldC5yZWxhdGl2ZS5sZWZ0IC0gdGhpcy5vZmZzZXQucGFyZW50LmxlZnQsXG5cdFx0XHRcdCQoIHdpbmRvdyApLnNjcm9sbFRvcCgpIC0gdGhpcy5vZmZzZXQucmVsYXRpdmUudG9wIC0gdGhpcy5vZmZzZXQucGFyZW50LnRvcCxcblx0XHRcdFx0JCggd2luZG93ICkuc2Nyb2xsTGVmdCgpICsgJCggd2luZG93ICkud2lkdGgoKSAtXG5cdFx0XHRcdFx0dGhpcy5oZWxwZXJQcm9wb3J0aW9ucy53aWR0aCAtIHRoaXMubWFyZ2lucy5sZWZ0LFxuXHRcdFx0XHQkKCB3aW5kb3cgKS5zY3JvbGxUb3AoKSArXG5cdFx0XHRcdFx0KCAkKCB3aW5kb3cgKS5oZWlnaHQoKSB8fCBkb2N1bWVudC5ib2R5LnBhcmVudE5vZGUuc2Nyb2xsSGVpZ2h0ICkgLVxuXHRcdFx0XHRcdHRoaXMuaGVscGVyUHJvcG9ydGlvbnMuaGVpZ2h0IC0gdGhpcy5tYXJnaW5zLnRvcFxuXHRcdFx0XTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRpZiAoIG8uY29udGFpbm1lbnQgPT09IFwiZG9jdW1lbnRcIiApIHtcblx0XHRcdHRoaXMuY29udGFpbm1lbnQgPSBbXG5cdFx0XHRcdDAsXG5cdFx0XHRcdDAsXG5cdFx0XHRcdCQoIGRvY3VtZW50ICkud2lkdGgoKSAtIHRoaXMuaGVscGVyUHJvcG9ydGlvbnMud2lkdGggLSB0aGlzLm1hcmdpbnMubGVmdCxcblx0XHRcdFx0KCAkKCBkb2N1bWVudCApLmhlaWdodCgpIHx8IGRvY3VtZW50LmJvZHkucGFyZW50Tm9kZS5zY3JvbGxIZWlnaHQgKSAtXG5cdFx0XHRcdFx0dGhpcy5oZWxwZXJQcm9wb3J0aW9ucy5oZWlnaHQgLSB0aGlzLm1hcmdpbnMudG9wXG5cdFx0XHRdO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGlmICggby5jb250YWlubWVudC5jb25zdHJ1Y3RvciA9PT0gQXJyYXkgKSB7XG5cdFx0XHR0aGlzLmNvbnRhaW5tZW50ID0gby5jb250YWlubWVudDtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRpZiAoIG8uY29udGFpbm1lbnQgPT09IFwicGFyZW50XCIgKSB7XG5cdFx0XHRvLmNvbnRhaW5tZW50ID0gdGhpcy5oZWxwZXJbIDAgXS5wYXJlbnROb2RlO1xuXHRcdH1cblxuXHRcdGMgPSAkKCBvLmNvbnRhaW5tZW50ICk7XG5cdFx0Y2UgPSBjWyAwIF07XG5cblx0XHRpZiAoICFjZSApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRpc1VzZXJTY3JvbGxhYmxlID0gLyhzY3JvbGx8YXV0bykvLnRlc3QoIGMuY3NzKCBcIm92ZXJmbG93XCIgKSApO1xuXG5cdFx0dGhpcy5jb250YWlubWVudCA9IFtcblx0XHRcdCggcGFyc2VJbnQoIGMuY3NzKCBcImJvcmRlckxlZnRXaWR0aFwiICksIDEwICkgfHwgMCApICtcblx0XHRcdFx0KCBwYXJzZUludCggYy5jc3MoIFwicGFkZGluZ0xlZnRcIiApLCAxMCApIHx8IDAgKSxcblx0XHRcdCggcGFyc2VJbnQoIGMuY3NzKCBcImJvcmRlclRvcFdpZHRoXCIgKSwgMTAgKSB8fCAwICkgK1xuXHRcdFx0XHQoIHBhcnNlSW50KCBjLmNzcyggXCJwYWRkaW5nVG9wXCIgKSwgMTAgKSB8fCAwICksXG5cdFx0XHQoIGlzVXNlclNjcm9sbGFibGUgPyBNYXRoLm1heCggY2Uuc2Nyb2xsV2lkdGgsIGNlLm9mZnNldFdpZHRoICkgOiBjZS5vZmZzZXRXaWR0aCApIC1cblx0XHRcdFx0KCBwYXJzZUludCggYy5jc3MoIFwiYm9yZGVyUmlnaHRXaWR0aFwiICksIDEwICkgfHwgMCApIC1cblx0XHRcdFx0KCBwYXJzZUludCggYy5jc3MoIFwicGFkZGluZ1JpZ2h0XCIgKSwgMTAgKSB8fCAwICkgLVxuXHRcdFx0XHR0aGlzLmhlbHBlclByb3BvcnRpb25zLndpZHRoIC1cblx0XHRcdFx0dGhpcy5tYXJnaW5zLmxlZnQgLVxuXHRcdFx0XHR0aGlzLm1hcmdpbnMucmlnaHQsXG5cdFx0XHQoIGlzVXNlclNjcm9sbGFibGUgPyBNYXRoLm1heCggY2Uuc2Nyb2xsSGVpZ2h0LCBjZS5vZmZzZXRIZWlnaHQgKSA6IGNlLm9mZnNldEhlaWdodCApIC1cblx0XHRcdFx0KCBwYXJzZUludCggYy5jc3MoIFwiYm9yZGVyQm90dG9tV2lkdGhcIiApLCAxMCApIHx8IDAgKSAtXG5cdFx0XHRcdCggcGFyc2VJbnQoIGMuY3NzKCBcInBhZGRpbmdCb3R0b21cIiApLCAxMCApIHx8IDAgKSAtXG5cdFx0XHRcdHRoaXMuaGVscGVyUHJvcG9ydGlvbnMuaGVpZ2h0IC1cblx0XHRcdFx0dGhpcy5tYXJnaW5zLnRvcCAtXG5cdFx0XHRcdHRoaXMubWFyZ2lucy5ib3R0b21cblx0XHRdO1xuXHRcdHRoaXMucmVsYXRpdmVDb250YWluZXIgPSBjO1xuXHR9LFxuXG5cdF9jb252ZXJ0UG9zaXRpb25UbzogZnVuY3Rpb24oIGQsIHBvcyApIHtcblxuXHRcdGlmICggIXBvcyApIHtcblx0XHRcdHBvcyA9IHRoaXMucG9zaXRpb247XG5cdFx0fVxuXG5cdFx0dmFyIG1vZCA9IGQgPT09IFwiYWJzb2x1dGVcIiA/IDEgOiAtMSxcblx0XHRcdHNjcm9sbElzUm9vdE5vZGUgPSB0aGlzLl9pc1Jvb3ROb2RlKCB0aGlzLnNjcm9sbFBhcmVudFsgMCBdICk7XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0dG9wOiAoXG5cblx0XHRcdFx0Ly8gVGhlIGFic29sdXRlIG1vdXNlIHBvc2l0aW9uXG5cdFx0XHRcdHBvcy50b3BcdCtcblxuXHRcdFx0XHQvLyBPbmx5IGZvciByZWxhdGl2ZSBwb3NpdGlvbmVkIG5vZGVzOiBSZWxhdGl2ZSBvZmZzZXQgZnJvbSBlbGVtZW50IHRvIG9mZnNldCBwYXJlbnRcblx0XHRcdFx0dGhpcy5vZmZzZXQucmVsYXRpdmUudG9wICogbW9kICtcblxuXHRcdFx0XHQvLyBUaGUgb2Zmc2V0UGFyZW50J3Mgb2Zmc2V0IHdpdGhvdXQgYm9yZGVycyAob2Zmc2V0ICsgYm9yZGVyKVxuXHRcdFx0XHR0aGlzLm9mZnNldC5wYXJlbnQudG9wICogbW9kIC1cblx0XHRcdFx0KCAoIHRoaXMuY3NzUG9zaXRpb24gPT09IFwiZml4ZWRcIiA/XG5cdFx0XHRcdFx0LXRoaXMub2Zmc2V0LnNjcm9sbC50b3AgOlxuXHRcdFx0XHRcdCggc2Nyb2xsSXNSb290Tm9kZSA/IDAgOiB0aGlzLm9mZnNldC5zY3JvbGwudG9wICkgKSAqIG1vZCApXG5cdFx0XHQpLFxuXHRcdFx0bGVmdDogKFxuXG5cdFx0XHRcdC8vIFRoZSBhYnNvbHV0ZSBtb3VzZSBwb3NpdGlvblxuXHRcdFx0XHRwb3MubGVmdCArXG5cblx0XHRcdFx0Ly8gT25seSBmb3IgcmVsYXRpdmUgcG9zaXRpb25lZCBub2RlczogUmVsYXRpdmUgb2Zmc2V0IGZyb20gZWxlbWVudCB0byBvZmZzZXQgcGFyZW50XG5cdFx0XHRcdHRoaXMub2Zmc2V0LnJlbGF0aXZlLmxlZnQgKiBtb2QgK1xuXG5cdFx0XHRcdC8vIFRoZSBvZmZzZXRQYXJlbnQncyBvZmZzZXQgd2l0aG91dCBib3JkZXJzIChvZmZzZXQgKyBib3JkZXIpXG5cdFx0XHRcdHRoaXMub2Zmc2V0LnBhcmVudC5sZWZ0ICogbW9kXHQtXG5cdFx0XHRcdCggKCB0aGlzLmNzc1Bvc2l0aW9uID09PSBcImZpeGVkXCIgP1xuXHRcdFx0XHRcdC10aGlzLm9mZnNldC5zY3JvbGwubGVmdCA6XG5cdFx0XHRcdFx0KCBzY3JvbGxJc1Jvb3ROb2RlID8gMCA6IHRoaXMub2Zmc2V0LnNjcm9sbC5sZWZ0ICkgKSAqIG1vZCApXG5cdFx0XHQpXG5cdFx0fTtcblxuXHR9LFxuXG5cdF9nZW5lcmF0ZVBvc2l0aW9uOiBmdW5jdGlvbiggZXZlbnQsIGNvbnN0cmFpblBvc2l0aW9uICkge1xuXG5cdFx0dmFyIGNvbnRhaW5tZW50LCBjbywgdG9wLCBsZWZ0LFxuXHRcdFx0byA9IHRoaXMub3B0aW9ucyxcblx0XHRcdHNjcm9sbElzUm9vdE5vZGUgPSB0aGlzLl9pc1Jvb3ROb2RlKCB0aGlzLnNjcm9sbFBhcmVudFsgMCBdICksXG5cdFx0XHRwYWdlWCA9IGV2ZW50LnBhZ2VYLFxuXHRcdFx0cGFnZVkgPSBldmVudC5wYWdlWTtcblxuXHRcdC8vIENhY2hlIHRoZSBzY3JvbGxcblx0XHRpZiAoICFzY3JvbGxJc1Jvb3ROb2RlIHx8ICF0aGlzLm9mZnNldC5zY3JvbGwgKSB7XG5cdFx0XHR0aGlzLm9mZnNldC5zY3JvbGwgPSB7XG5cdFx0XHRcdHRvcDogdGhpcy5zY3JvbGxQYXJlbnQuc2Nyb2xsVG9wKCksXG5cdFx0XHRcdGxlZnQ6IHRoaXMuc2Nyb2xsUGFyZW50LnNjcm9sbExlZnQoKVxuXHRcdFx0fTtcblx0XHR9XG5cblx0XHQvKlxuXHRcdCAqIC0gUG9zaXRpb24gY29uc3RyYWluaW5nIC1cblx0XHQgKiBDb25zdHJhaW4gdGhlIHBvc2l0aW9uIHRvIGEgbWl4IG9mIGdyaWQsIGNvbnRhaW5tZW50LlxuXHRcdCAqL1xuXG5cdFx0Ly8gSWYgd2UgYXJlIG5vdCBkcmFnZ2luZyB5ZXQsIHdlIHdvbid0IGNoZWNrIGZvciBvcHRpb25zXG5cdFx0aWYgKCBjb25zdHJhaW5Qb3NpdGlvbiApIHtcblx0XHRcdGlmICggdGhpcy5jb250YWlubWVudCApIHtcblx0XHRcdFx0aWYgKCB0aGlzLnJlbGF0aXZlQ29udGFpbmVyICkge1xuXHRcdFx0XHRcdGNvID0gdGhpcy5yZWxhdGl2ZUNvbnRhaW5lci5vZmZzZXQoKTtcblx0XHRcdFx0XHRjb250YWlubWVudCA9IFtcblx0XHRcdFx0XHRcdHRoaXMuY29udGFpbm1lbnRbIDAgXSArIGNvLmxlZnQsXG5cdFx0XHRcdFx0XHR0aGlzLmNvbnRhaW5tZW50WyAxIF0gKyBjby50b3AsXG5cdFx0XHRcdFx0XHR0aGlzLmNvbnRhaW5tZW50WyAyIF0gKyBjby5sZWZ0LFxuXHRcdFx0XHRcdFx0dGhpcy5jb250YWlubWVudFsgMyBdICsgY28udG9wXG5cdFx0XHRcdFx0XTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRjb250YWlubWVudCA9IHRoaXMuY29udGFpbm1lbnQ7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoIGV2ZW50LnBhZ2VYIC0gdGhpcy5vZmZzZXQuY2xpY2subGVmdCA8IGNvbnRhaW5tZW50WyAwIF0gKSB7XG5cdFx0XHRcdFx0cGFnZVggPSBjb250YWlubWVudFsgMCBdICsgdGhpcy5vZmZzZXQuY2xpY2subGVmdDtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoIGV2ZW50LnBhZ2VZIC0gdGhpcy5vZmZzZXQuY2xpY2sudG9wIDwgY29udGFpbm1lbnRbIDEgXSApIHtcblx0XHRcdFx0XHRwYWdlWSA9IGNvbnRhaW5tZW50WyAxIF0gKyB0aGlzLm9mZnNldC5jbGljay50b3A7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKCBldmVudC5wYWdlWCAtIHRoaXMub2Zmc2V0LmNsaWNrLmxlZnQgPiBjb250YWlubWVudFsgMiBdICkge1xuXHRcdFx0XHRcdHBhZ2VYID0gY29udGFpbm1lbnRbIDIgXSArIHRoaXMub2Zmc2V0LmNsaWNrLmxlZnQ7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKCBldmVudC5wYWdlWSAtIHRoaXMub2Zmc2V0LmNsaWNrLnRvcCA+IGNvbnRhaW5tZW50WyAzIF0gKSB7XG5cdFx0XHRcdFx0cGFnZVkgPSBjb250YWlubWVudFsgMyBdICsgdGhpcy5vZmZzZXQuY2xpY2sudG9wO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGlmICggby5ncmlkICkge1xuXG5cdFx0XHRcdC8vQ2hlY2sgZm9yIGdyaWQgZWxlbWVudHMgc2V0IHRvIDAgdG8gcHJldmVudCBkaXZpZGUgYnkgMCBlcnJvciBjYXVzaW5nIGludmFsaWRcblx0XHRcdFx0Ly8gYXJndW1lbnQgZXJyb3JzIGluIElFIChzZWUgdGlja2V0ICM2OTUwKVxuXHRcdFx0XHR0b3AgPSBvLmdyaWRbIDEgXSA/IHRoaXMub3JpZ2luYWxQYWdlWSArIE1hdGgucm91bmQoICggcGFnZVkgLVxuXHRcdFx0XHRcdHRoaXMub3JpZ2luYWxQYWdlWSApIC8gby5ncmlkWyAxIF0gKSAqIG8uZ3JpZFsgMSBdIDogdGhpcy5vcmlnaW5hbFBhZ2VZO1xuXHRcdFx0XHRwYWdlWSA9IGNvbnRhaW5tZW50ID8gKCAoIHRvcCAtIHRoaXMub2Zmc2V0LmNsaWNrLnRvcCA+PSBjb250YWlubWVudFsgMSBdIHx8XG5cdFx0XHRcdFx0dG9wIC0gdGhpcy5vZmZzZXQuY2xpY2sudG9wID4gY29udGFpbm1lbnRbIDMgXSApID9cblx0XHRcdFx0XHRcdHRvcCA6XG5cdFx0XHRcdFx0XHQoICggdG9wIC0gdGhpcy5vZmZzZXQuY2xpY2sudG9wID49IGNvbnRhaW5tZW50WyAxIF0gKSA/XG5cdFx0XHRcdFx0XHRcdHRvcCAtIG8uZ3JpZFsgMSBdIDogdG9wICsgby5ncmlkWyAxIF0gKSApIDogdG9wO1xuXG5cdFx0XHRcdGxlZnQgPSBvLmdyaWRbIDAgXSA/IHRoaXMub3JpZ2luYWxQYWdlWCArXG5cdFx0XHRcdFx0TWF0aC5yb3VuZCggKCBwYWdlWCAtIHRoaXMub3JpZ2luYWxQYWdlWCApIC8gby5ncmlkWyAwIF0gKSAqIG8uZ3JpZFsgMCBdIDpcblx0XHRcdFx0XHR0aGlzLm9yaWdpbmFsUGFnZVg7XG5cdFx0XHRcdHBhZ2VYID0gY29udGFpbm1lbnQgPyAoICggbGVmdCAtIHRoaXMub2Zmc2V0LmNsaWNrLmxlZnQgPj0gY29udGFpbm1lbnRbIDAgXSB8fFxuXHRcdFx0XHRcdGxlZnQgLSB0aGlzLm9mZnNldC5jbGljay5sZWZ0ID4gY29udGFpbm1lbnRbIDIgXSApID9cblx0XHRcdFx0XHRcdGxlZnQgOlxuXHRcdFx0XHRcdFx0KCAoIGxlZnQgLSB0aGlzLm9mZnNldC5jbGljay5sZWZ0ID49IGNvbnRhaW5tZW50WyAwIF0gKSA/XG5cdFx0XHRcdFx0XHRcdGxlZnQgLSBvLmdyaWRbIDAgXSA6IGxlZnQgKyBvLmdyaWRbIDAgXSApICkgOiBsZWZ0O1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIG8uYXhpcyA9PT0gXCJ5XCIgKSB7XG5cdFx0XHRcdHBhZ2VYID0gdGhpcy5vcmlnaW5hbFBhZ2VYO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIG8uYXhpcyA9PT0gXCJ4XCIgKSB7XG5cdFx0XHRcdHBhZ2VZID0gdGhpcy5vcmlnaW5hbFBhZ2VZO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiB7XG5cdFx0XHR0b3A6IChcblxuXHRcdFx0XHQvLyBUaGUgYWJzb2x1dGUgbW91c2UgcG9zaXRpb25cblx0XHRcdFx0cGFnZVkgLVxuXG5cdFx0XHRcdC8vIENsaWNrIG9mZnNldCAocmVsYXRpdmUgdG8gdGhlIGVsZW1lbnQpXG5cdFx0XHRcdHRoaXMub2Zmc2V0LmNsaWNrLnRvcCAtXG5cblx0XHRcdFx0Ly8gT25seSBmb3IgcmVsYXRpdmUgcG9zaXRpb25lZCBub2RlczogUmVsYXRpdmUgb2Zmc2V0IGZyb20gZWxlbWVudCB0byBvZmZzZXQgcGFyZW50XG5cdFx0XHRcdHRoaXMub2Zmc2V0LnJlbGF0aXZlLnRvcCAtXG5cblx0XHRcdFx0Ly8gVGhlIG9mZnNldFBhcmVudCdzIG9mZnNldCB3aXRob3V0IGJvcmRlcnMgKG9mZnNldCArIGJvcmRlcilcblx0XHRcdFx0dGhpcy5vZmZzZXQucGFyZW50LnRvcCArXG5cdFx0XHRcdCggdGhpcy5jc3NQb3NpdGlvbiA9PT0gXCJmaXhlZFwiID9cblx0XHRcdFx0XHQtdGhpcy5vZmZzZXQuc2Nyb2xsLnRvcCA6XG5cdFx0XHRcdFx0KCBzY3JvbGxJc1Jvb3ROb2RlID8gMCA6IHRoaXMub2Zmc2V0LnNjcm9sbC50b3AgKSApXG5cdFx0XHQpLFxuXHRcdFx0bGVmdDogKFxuXG5cdFx0XHRcdC8vIFRoZSBhYnNvbHV0ZSBtb3VzZSBwb3NpdGlvblxuXHRcdFx0XHRwYWdlWCAtXG5cblx0XHRcdFx0Ly8gQ2xpY2sgb2Zmc2V0IChyZWxhdGl2ZSB0byB0aGUgZWxlbWVudClcblx0XHRcdFx0dGhpcy5vZmZzZXQuY2xpY2subGVmdCAtXG5cblx0XHRcdFx0Ly8gT25seSBmb3IgcmVsYXRpdmUgcG9zaXRpb25lZCBub2RlczogUmVsYXRpdmUgb2Zmc2V0IGZyb20gZWxlbWVudCB0byBvZmZzZXQgcGFyZW50XG5cdFx0XHRcdHRoaXMub2Zmc2V0LnJlbGF0aXZlLmxlZnQgLVxuXG5cdFx0XHRcdC8vIFRoZSBvZmZzZXRQYXJlbnQncyBvZmZzZXQgd2l0aG91dCBib3JkZXJzIChvZmZzZXQgKyBib3JkZXIpXG5cdFx0XHRcdHRoaXMub2Zmc2V0LnBhcmVudC5sZWZ0ICtcblx0XHRcdFx0KCB0aGlzLmNzc1Bvc2l0aW9uID09PSBcImZpeGVkXCIgP1xuXHRcdFx0XHRcdC10aGlzLm9mZnNldC5zY3JvbGwubGVmdCA6XG5cdFx0XHRcdFx0KCBzY3JvbGxJc1Jvb3ROb2RlID8gMCA6IHRoaXMub2Zmc2V0LnNjcm9sbC5sZWZ0ICkgKVxuXHRcdFx0KVxuXHRcdH07XG5cblx0fSxcblxuXHRfY2xlYXI6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuX3JlbW92ZUNsYXNzKCB0aGlzLmhlbHBlciwgXCJ1aS1kcmFnZ2FibGUtZHJhZ2dpbmdcIiApO1xuXHRcdGlmICggdGhpcy5oZWxwZXJbIDAgXSAhPT0gdGhpcy5lbGVtZW50WyAwIF0gJiYgIXRoaXMuY2FuY2VsSGVscGVyUmVtb3ZhbCApIHtcblx0XHRcdHRoaXMuaGVscGVyLnJlbW92ZSgpO1xuXHRcdH1cblx0XHR0aGlzLmhlbHBlciA9IG51bGw7XG5cdFx0dGhpcy5jYW5jZWxIZWxwZXJSZW1vdmFsID0gZmFsc2U7XG5cdFx0aWYgKCB0aGlzLmRlc3Ryb3lPbkNsZWFyICkge1xuXHRcdFx0dGhpcy5kZXN0cm95KCk7XG5cdFx0fVxuXHR9LFxuXG5cdC8vIEZyb20gbm93IG9uIGJ1bGsgc3R1ZmYgLSBtYWlubHkgaGVscGVyc1xuXG5cdF90cmlnZ2VyOiBmdW5jdGlvbiggdHlwZSwgZXZlbnQsIHVpICkge1xuXHRcdHVpID0gdWkgfHwgdGhpcy5fdWlIYXNoKCk7XG5cdFx0JC51aS5wbHVnaW4uY2FsbCggdGhpcywgdHlwZSwgWyBldmVudCwgdWksIHRoaXMgXSwgdHJ1ZSApO1xuXG5cdFx0Ly8gQWJzb2x1dGUgcG9zaXRpb24gYW5kIG9mZnNldCAoc2VlICM2ODg0ICkgaGF2ZSB0byBiZSByZWNhbGN1bGF0ZWQgYWZ0ZXIgcGx1Z2luc1xuXHRcdGlmICggL14oZHJhZ3xzdGFydHxzdG9wKS8udGVzdCggdHlwZSApICkge1xuXHRcdFx0dGhpcy5wb3NpdGlvbkFicyA9IHRoaXMuX2NvbnZlcnRQb3NpdGlvblRvKCBcImFic29sdXRlXCIgKTtcblx0XHRcdHVpLm9mZnNldCA9IHRoaXMucG9zaXRpb25BYnM7XG5cdFx0fVxuXHRcdHJldHVybiAkLldpZGdldC5wcm90b3R5cGUuX3RyaWdnZXIuY2FsbCggdGhpcywgdHlwZSwgZXZlbnQsIHVpICk7XG5cdH0sXG5cblx0cGx1Z2luczoge30sXG5cblx0X3VpSGFzaDogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGhlbHBlcjogdGhpcy5oZWxwZXIsXG5cdFx0XHRwb3NpdGlvbjogdGhpcy5wb3NpdGlvbixcblx0XHRcdG9yaWdpbmFsUG9zaXRpb246IHRoaXMub3JpZ2luYWxQb3NpdGlvbixcblx0XHRcdG9mZnNldDogdGhpcy5wb3NpdGlvbkFic1xuXHRcdH07XG5cdH1cblxufSApO1xuXG4kLnVpLnBsdWdpbi5hZGQoIFwiZHJhZ2dhYmxlXCIsIFwiY29ubmVjdFRvU29ydGFibGVcIiwge1xuXHRzdGFydDogZnVuY3Rpb24oIGV2ZW50LCB1aSwgZHJhZ2dhYmxlICkge1xuXHRcdHZhciB1aVNvcnRhYmxlID0gJC5leHRlbmQoIHt9LCB1aSwge1xuXHRcdFx0aXRlbTogZHJhZ2dhYmxlLmVsZW1lbnRcblx0XHR9ICk7XG5cblx0XHRkcmFnZ2FibGUuc29ydGFibGVzID0gW107XG5cdFx0JCggZHJhZ2dhYmxlLm9wdGlvbnMuY29ubmVjdFRvU29ydGFibGUgKS5lYWNoKCBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBzb3J0YWJsZSA9ICQoIHRoaXMgKS5zb3J0YWJsZSggXCJpbnN0YW5jZVwiICk7XG5cblx0XHRcdGlmICggc29ydGFibGUgJiYgIXNvcnRhYmxlLm9wdGlvbnMuZGlzYWJsZWQgKSB7XG5cdFx0XHRcdGRyYWdnYWJsZS5zb3J0YWJsZXMucHVzaCggc29ydGFibGUgKTtcblxuXHRcdFx0XHQvLyBSZWZyZXNoUG9zaXRpb25zIGlzIGNhbGxlZCBhdCBkcmFnIHN0YXJ0IHRvIHJlZnJlc2ggdGhlIGNvbnRhaW5lckNhY2hlXG5cdFx0XHRcdC8vIHdoaWNoIGlzIHVzZWQgaW4gZHJhZy4gVGhpcyBlbnN1cmVzIGl0J3MgaW5pdGlhbGl6ZWQgYW5kIHN5bmNocm9uaXplZFxuXHRcdFx0XHQvLyB3aXRoIGFueSBjaGFuZ2VzIHRoYXQgbWlnaHQgaGF2ZSBoYXBwZW5lZCBvbiB0aGUgcGFnZSBzaW5jZSBpbml0aWFsaXphdGlvbi5cblx0XHRcdFx0c29ydGFibGUucmVmcmVzaFBvc2l0aW9ucygpO1xuXHRcdFx0XHRzb3J0YWJsZS5fdHJpZ2dlciggXCJhY3RpdmF0ZVwiLCBldmVudCwgdWlTb3J0YWJsZSApO1xuXHRcdFx0fVxuXHRcdH0gKTtcblx0fSxcblx0c3RvcDogZnVuY3Rpb24oIGV2ZW50LCB1aSwgZHJhZ2dhYmxlICkge1xuXHRcdHZhciB1aVNvcnRhYmxlID0gJC5leHRlbmQoIHt9LCB1aSwge1xuXHRcdFx0aXRlbTogZHJhZ2dhYmxlLmVsZW1lbnRcblx0XHR9ICk7XG5cblx0XHRkcmFnZ2FibGUuY2FuY2VsSGVscGVyUmVtb3ZhbCA9IGZhbHNlO1xuXG5cdFx0JC5lYWNoKCBkcmFnZ2FibGUuc29ydGFibGVzLCBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBzb3J0YWJsZSA9IHRoaXM7XG5cblx0XHRcdGlmICggc29ydGFibGUuaXNPdmVyICkge1xuXHRcdFx0XHRzb3J0YWJsZS5pc092ZXIgPSAwO1xuXG5cdFx0XHRcdC8vIEFsbG93IHRoaXMgc29ydGFibGUgdG8gaGFuZGxlIHJlbW92aW5nIHRoZSBoZWxwZXJcblx0XHRcdFx0ZHJhZ2dhYmxlLmNhbmNlbEhlbHBlclJlbW92YWwgPSB0cnVlO1xuXHRcdFx0XHRzb3J0YWJsZS5jYW5jZWxIZWxwZXJSZW1vdmFsID0gZmFsc2U7XG5cblx0XHRcdFx0Ly8gVXNlIF9zdG9yZWRDU1MgVG8gcmVzdG9yZSBwcm9wZXJ0aWVzIGluIHRoZSBzb3J0YWJsZSxcblx0XHRcdFx0Ly8gYXMgdGhpcyBhbHNvIGhhbmRsZXMgcmV2ZXJ0ICgjOTY3NSkgc2luY2UgdGhlIGRyYWdnYWJsZVxuXHRcdFx0XHQvLyBtYXkgaGF2ZSBtb2RpZmllZCB0aGVtIGluIHVuZXhwZWN0ZWQgd2F5cyAoIzg4MDkpXG5cdFx0XHRcdHNvcnRhYmxlLl9zdG9yZWRDU1MgPSB7XG5cdFx0XHRcdFx0cG9zaXRpb246IHNvcnRhYmxlLnBsYWNlaG9sZGVyLmNzcyggXCJwb3NpdGlvblwiICksXG5cdFx0XHRcdFx0dG9wOiBzb3J0YWJsZS5wbGFjZWhvbGRlci5jc3MoIFwidG9wXCIgKSxcblx0XHRcdFx0XHRsZWZ0OiBzb3J0YWJsZS5wbGFjZWhvbGRlci5jc3MoIFwibGVmdFwiIClcblx0XHRcdFx0fTtcblxuXHRcdFx0XHRzb3J0YWJsZS5fbW91c2VTdG9wKCBldmVudCApO1xuXG5cdFx0XHRcdC8vIE9uY2UgZHJhZyBoYXMgZW5kZWQsIHRoZSBzb3J0YWJsZSBzaG91bGQgcmV0dXJuIHRvIHVzaW5nXG5cdFx0XHRcdC8vIGl0cyBvcmlnaW5hbCBoZWxwZXIsIG5vdCB0aGUgc2hhcmVkIGhlbHBlciBmcm9tIGRyYWdnYWJsZVxuXHRcdFx0XHRzb3J0YWJsZS5vcHRpb25zLmhlbHBlciA9IHNvcnRhYmxlLm9wdGlvbnMuX2hlbHBlcjtcblx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0Ly8gUHJldmVudCB0aGlzIFNvcnRhYmxlIGZyb20gcmVtb3ZpbmcgdGhlIGhlbHBlci5cblx0XHRcdFx0Ly8gSG93ZXZlciwgZG9uJ3Qgc2V0IHRoZSBkcmFnZ2FibGUgdG8gcmVtb3ZlIHRoZSBoZWxwZXJcblx0XHRcdFx0Ly8gZWl0aGVyIGFzIGFub3RoZXIgY29ubmVjdGVkIFNvcnRhYmxlIG1heSB5ZXQgaGFuZGxlIHRoZSByZW1vdmFsLlxuXHRcdFx0XHRzb3J0YWJsZS5jYW5jZWxIZWxwZXJSZW1vdmFsID0gdHJ1ZTtcblxuXHRcdFx0XHRzb3J0YWJsZS5fdHJpZ2dlciggXCJkZWFjdGl2YXRlXCIsIGV2ZW50LCB1aVNvcnRhYmxlICk7XG5cdFx0XHR9XG5cdFx0fSApO1xuXHR9LFxuXHRkcmFnOiBmdW5jdGlvbiggZXZlbnQsIHVpLCBkcmFnZ2FibGUgKSB7XG5cdFx0JC5lYWNoKCBkcmFnZ2FibGUuc29ydGFibGVzLCBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBpbm5lcm1vc3RJbnRlcnNlY3RpbmcgPSBmYWxzZSxcblx0XHRcdFx0c29ydGFibGUgPSB0aGlzO1xuXG5cdFx0XHQvLyBDb3B5IG92ZXIgdmFyaWFibGVzIHRoYXQgc29ydGFibGUncyBfaW50ZXJzZWN0c1dpdGggdXNlc1xuXHRcdFx0c29ydGFibGUucG9zaXRpb25BYnMgPSBkcmFnZ2FibGUucG9zaXRpb25BYnM7XG5cdFx0XHRzb3J0YWJsZS5oZWxwZXJQcm9wb3J0aW9ucyA9IGRyYWdnYWJsZS5oZWxwZXJQcm9wb3J0aW9ucztcblx0XHRcdHNvcnRhYmxlLm9mZnNldC5jbGljayA9IGRyYWdnYWJsZS5vZmZzZXQuY2xpY2s7XG5cblx0XHRcdGlmICggc29ydGFibGUuX2ludGVyc2VjdHNXaXRoKCBzb3J0YWJsZS5jb250YWluZXJDYWNoZSApICkge1xuXHRcdFx0XHRpbm5lcm1vc3RJbnRlcnNlY3RpbmcgPSB0cnVlO1xuXG5cdFx0XHRcdCQuZWFjaCggZHJhZ2dhYmxlLnNvcnRhYmxlcywgZnVuY3Rpb24oKSB7XG5cblx0XHRcdFx0XHQvLyBDb3B5IG92ZXIgdmFyaWFibGVzIHRoYXQgc29ydGFibGUncyBfaW50ZXJzZWN0c1dpdGggdXNlc1xuXHRcdFx0XHRcdHRoaXMucG9zaXRpb25BYnMgPSBkcmFnZ2FibGUucG9zaXRpb25BYnM7XG5cdFx0XHRcdFx0dGhpcy5oZWxwZXJQcm9wb3J0aW9ucyA9IGRyYWdnYWJsZS5oZWxwZXJQcm9wb3J0aW9ucztcblx0XHRcdFx0XHR0aGlzLm9mZnNldC5jbGljayA9IGRyYWdnYWJsZS5vZmZzZXQuY2xpY2s7XG5cblx0XHRcdFx0XHRpZiAoIHRoaXMgIT09IHNvcnRhYmxlICYmXG5cdFx0XHRcdFx0XHRcdHRoaXMuX2ludGVyc2VjdHNXaXRoKCB0aGlzLmNvbnRhaW5lckNhY2hlICkgJiZcblx0XHRcdFx0XHRcdFx0JC5jb250YWlucyggc29ydGFibGUuZWxlbWVudFsgMCBdLCB0aGlzLmVsZW1lbnRbIDAgXSApICkge1xuXHRcdFx0XHRcdFx0aW5uZXJtb3N0SW50ZXJzZWN0aW5nID0gZmFsc2U7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0cmV0dXJuIGlubmVybW9zdEludGVyc2VjdGluZztcblx0XHRcdFx0fSApO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIGlubmVybW9zdEludGVyc2VjdGluZyApIHtcblxuXHRcdFx0XHQvLyBJZiBpdCBpbnRlcnNlY3RzLCB3ZSB1c2UgYSBsaXR0bGUgaXNPdmVyIHZhcmlhYmxlIGFuZCBzZXQgaXQgb25jZSxcblx0XHRcdFx0Ly8gc28gdGhhdCB0aGUgbW92ZS1pbiBzdHVmZiBnZXRzIGZpcmVkIG9ubHkgb25jZS5cblx0XHRcdFx0aWYgKCAhc29ydGFibGUuaXNPdmVyICkge1xuXHRcdFx0XHRcdHNvcnRhYmxlLmlzT3ZlciA9IDE7XG5cblx0XHRcdFx0XHQvLyBTdG9yZSBkcmFnZ2FibGUncyBwYXJlbnQgaW4gY2FzZSB3ZSBuZWVkIHRvIHJlYXBwZW5kIHRvIGl0IGxhdGVyLlxuXHRcdFx0XHRcdGRyYWdnYWJsZS5fcGFyZW50ID0gdWkuaGVscGVyLnBhcmVudCgpO1xuXG5cdFx0XHRcdFx0c29ydGFibGUuY3VycmVudEl0ZW0gPSB1aS5oZWxwZXJcblx0XHRcdFx0XHRcdC5hcHBlbmRUbyggc29ydGFibGUuZWxlbWVudCApXG5cdFx0XHRcdFx0XHQuZGF0YSggXCJ1aS1zb3J0YWJsZS1pdGVtXCIsIHRydWUgKTtcblxuXHRcdFx0XHRcdC8vIFN0b3JlIGhlbHBlciBvcHRpb24gdG8gbGF0ZXIgcmVzdG9yZSBpdFxuXHRcdFx0XHRcdHNvcnRhYmxlLm9wdGlvbnMuX2hlbHBlciA9IHNvcnRhYmxlLm9wdGlvbnMuaGVscGVyO1xuXG5cdFx0XHRcdFx0c29ydGFibGUub3B0aW9ucy5oZWxwZXIgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdHJldHVybiB1aS5oZWxwZXJbIDAgXTtcblx0XHRcdFx0XHR9O1xuXG5cdFx0XHRcdFx0Ly8gRmlyZSB0aGUgc3RhcnQgZXZlbnRzIG9mIHRoZSBzb3J0YWJsZSB3aXRoIG91ciBwYXNzZWQgYnJvd3NlciBldmVudCxcblx0XHRcdFx0XHQvLyBhbmQgb3VyIG93biBoZWxwZXIgKHNvIGl0IGRvZXNuJ3QgY3JlYXRlIGEgbmV3IG9uZSlcblx0XHRcdFx0XHRldmVudC50YXJnZXQgPSBzb3J0YWJsZS5jdXJyZW50SXRlbVsgMCBdO1xuXHRcdFx0XHRcdHNvcnRhYmxlLl9tb3VzZUNhcHR1cmUoIGV2ZW50LCB0cnVlICk7XG5cdFx0XHRcdFx0c29ydGFibGUuX21vdXNlU3RhcnQoIGV2ZW50LCB0cnVlLCB0cnVlICk7XG5cblx0XHRcdFx0XHQvLyBCZWNhdXNlIHRoZSBicm93c2VyIGV2ZW50IGlzIHdheSBvZmYgdGhlIG5ldyBhcHBlbmRlZCBwb3J0bGV0LFxuXHRcdFx0XHRcdC8vIG1vZGlmeSBuZWNlc3NhcnkgdmFyaWFibGVzIHRvIHJlZmxlY3QgdGhlIGNoYW5nZXNcblx0XHRcdFx0XHRzb3J0YWJsZS5vZmZzZXQuY2xpY2sudG9wID0gZHJhZ2dhYmxlLm9mZnNldC5jbGljay50b3A7XG5cdFx0XHRcdFx0c29ydGFibGUub2Zmc2V0LmNsaWNrLmxlZnQgPSBkcmFnZ2FibGUub2Zmc2V0LmNsaWNrLmxlZnQ7XG5cdFx0XHRcdFx0c29ydGFibGUub2Zmc2V0LnBhcmVudC5sZWZ0IC09IGRyYWdnYWJsZS5vZmZzZXQucGFyZW50LmxlZnQgLVxuXHRcdFx0XHRcdFx0c29ydGFibGUub2Zmc2V0LnBhcmVudC5sZWZ0O1xuXHRcdFx0XHRcdHNvcnRhYmxlLm9mZnNldC5wYXJlbnQudG9wIC09IGRyYWdnYWJsZS5vZmZzZXQucGFyZW50LnRvcCAtXG5cdFx0XHRcdFx0XHRzb3J0YWJsZS5vZmZzZXQucGFyZW50LnRvcDtcblxuXHRcdFx0XHRcdGRyYWdnYWJsZS5fdHJpZ2dlciggXCJ0b1NvcnRhYmxlXCIsIGV2ZW50ICk7XG5cblx0XHRcdFx0XHQvLyBJbmZvcm0gZHJhZ2dhYmxlIHRoYXQgdGhlIGhlbHBlciBpcyBpbiBhIHZhbGlkIGRyb3Agem9uZSxcblx0XHRcdFx0XHQvLyB1c2VkIHNvbGVseSBpbiB0aGUgcmV2ZXJ0IG9wdGlvbiB0byBoYW5kbGUgXCJ2YWxpZC9pbnZhbGlkXCIuXG5cdFx0XHRcdFx0ZHJhZ2dhYmxlLmRyb3BwZWQgPSBzb3J0YWJsZS5lbGVtZW50O1xuXG5cdFx0XHRcdFx0Ly8gTmVlZCB0byByZWZyZXNoUG9zaXRpb25zIG9mIGFsbCBzb3J0YWJsZXMgaW4gdGhlIGNhc2UgdGhhdFxuXHRcdFx0XHRcdC8vIGFkZGluZyB0byBvbmUgc29ydGFibGUgY2hhbmdlcyB0aGUgbG9jYXRpb24gb2YgdGhlIG90aGVyIHNvcnRhYmxlcyAoIzk2NzUpXG5cdFx0XHRcdFx0JC5lYWNoKCBkcmFnZ2FibGUuc29ydGFibGVzLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdHRoaXMucmVmcmVzaFBvc2l0aW9ucygpO1xuXHRcdFx0XHRcdH0gKTtcblxuXHRcdFx0XHRcdC8vIEhhY2sgc28gcmVjZWl2ZS91cGRhdGUgY2FsbGJhY2tzIHdvcmsgKG1vc3RseSlcblx0XHRcdFx0XHRkcmFnZ2FibGUuY3VycmVudEl0ZW0gPSBkcmFnZ2FibGUuZWxlbWVudDtcblx0XHRcdFx0XHRzb3J0YWJsZS5mcm9tT3V0c2lkZSA9IGRyYWdnYWJsZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmICggc29ydGFibGUuY3VycmVudEl0ZW0gKSB7XG5cdFx0XHRcdFx0c29ydGFibGUuX21vdXNlRHJhZyggZXZlbnQgKTtcblxuXHRcdFx0XHRcdC8vIENvcHkgdGhlIHNvcnRhYmxlJ3MgcG9zaXRpb24gYmVjYXVzZSB0aGUgZHJhZ2dhYmxlJ3MgY2FuIHBvdGVudGlhbGx5IHJlZmxlY3Rcblx0XHRcdFx0XHQvLyBhIHJlbGF0aXZlIHBvc2l0aW9uLCB3aGlsZSBzb3J0YWJsZSBpcyBhbHdheXMgYWJzb2x1dGUsIHdoaWNoIHRoZSBkcmFnZ2VkXG5cdFx0XHRcdFx0Ly8gZWxlbWVudCBoYXMgbm93IGJlY29tZS4gKCM4ODA5KVxuXHRcdFx0XHRcdHVpLnBvc2l0aW9uID0gc29ydGFibGUucG9zaXRpb247XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0Ly8gSWYgaXQgZG9lc24ndCBpbnRlcnNlY3Qgd2l0aCB0aGUgc29ydGFibGUsIGFuZCBpdCBpbnRlcnNlY3RlZCBiZWZvcmUsXG5cdFx0XHRcdC8vIHdlIGZha2UgdGhlIGRyYWcgc3RvcCBvZiB0aGUgc29ydGFibGUsIGJ1dCBtYWtlIHN1cmUgaXQgZG9lc24ndCByZW1vdmVcblx0XHRcdFx0Ly8gdGhlIGhlbHBlciBieSB1c2luZyBjYW5jZWxIZWxwZXJSZW1vdmFsLlxuXHRcdFx0XHRpZiAoIHNvcnRhYmxlLmlzT3ZlciApIHtcblxuXHRcdFx0XHRcdHNvcnRhYmxlLmlzT3ZlciA9IDA7XG5cdFx0XHRcdFx0c29ydGFibGUuY2FuY2VsSGVscGVyUmVtb3ZhbCA9IHRydWU7XG5cblx0XHRcdFx0XHQvLyBDYWxsaW5nIHNvcnRhYmxlJ3MgbW91c2VTdG9wIHdvdWxkIHRyaWdnZXIgYSByZXZlcnQsXG5cdFx0XHRcdFx0Ly8gc28gcmV2ZXJ0IG11c3QgYmUgdGVtcG9yYXJpbHkgZmFsc2UgdW50aWwgYWZ0ZXIgbW91c2VTdG9wIGlzIGNhbGxlZC5cblx0XHRcdFx0XHRzb3J0YWJsZS5vcHRpb25zLl9yZXZlcnQgPSBzb3J0YWJsZS5vcHRpb25zLnJldmVydDtcblx0XHRcdFx0XHRzb3J0YWJsZS5vcHRpb25zLnJldmVydCA9IGZhbHNlO1xuXG5cdFx0XHRcdFx0c29ydGFibGUuX3RyaWdnZXIoIFwib3V0XCIsIGV2ZW50LCBzb3J0YWJsZS5fdWlIYXNoKCBzb3J0YWJsZSApICk7XG5cdFx0XHRcdFx0c29ydGFibGUuX21vdXNlU3RvcCggZXZlbnQsIHRydWUgKTtcblxuXHRcdFx0XHRcdC8vIFJlc3RvcmUgc29ydGFibGUgYmVoYXZpb3JzIHRoYXQgd2VyZSBtb2RmaWVkXG5cdFx0XHRcdFx0Ly8gd2hlbiB0aGUgZHJhZ2dhYmxlIGVudGVyZWQgdGhlIHNvcnRhYmxlIGFyZWEgKCM5NDgxKVxuXHRcdFx0XHRcdHNvcnRhYmxlLm9wdGlvbnMucmV2ZXJ0ID0gc29ydGFibGUub3B0aW9ucy5fcmV2ZXJ0O1xuXHRcdFx0XHRcdHNvcnRhYmxlLm9wdGlvbnMuaGVscGVyID0gc29ydGFibGUub3B0aW9ucy5faGVscGVyO1xuXG5cdFx0XHRcdFx0aWYgKCBzb3J0YWJsZS5wbGFjZWhvbGRlciApIHtcblx0XHRcdFx0XHRcdHNvcnRhYmxlLnBsYWNlaG9sZGVyLnJlbW92ZSgpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdC8vIFJlc3RvcmUgYW5kIHJlY2FsY3VsYXRlIHRoZSBkcmFnZ2FibGUncyBvZmZzZXQgY29uc2lkZXJpbmcgdGhlIHNvcnRhYmxlXG5cdFx0XHRcdFx0Ly8gbWF5IGhhdmUgbW9kaWZpZWQgdGhlbSBpbiB1bmV4cGVjdGVkIHdheXMuICgjODgwOSwgIzEwNjY5KVxuXHRcdFx0XHRcdHVpLmhlbHBlci5hcHBlbmRUbyggZHJhZ2dhYmxlLl9wYXJlbnQgKTtcblx0XHRcdFx0XHRkcmFnZ2FibGUuX3JlZnJlc2hPZmZzZXRzKCBldmVudCApO1xuXHRcdFx0XHRcdHVpLnBvc2l0aW9uID0gZHJhZ2dhYmxlLl9nZW5lcmF0ZVBvc2l0aW9uKCBldmVudCwgdHJ1ZSApO1xuXG5cdFx0XHRcdFx0ZHJhZ2dhYmxlLl90cmlnZ2VyKCBcImZyb21Tb3J0YWJsZVwiLCBldmVudCApO1xuXG5cdFx0XHRcdFx0Ly8gSW5mb3JtIGRyYWdnYWJsZSB0aGF0IHRoZSBoZWxwZXIgaXMgbm8gbG9uZ2VyIGluIGEgdmFsaWQgZHJvcCB6b25lXG5cdFx0XHRcdFx0ZHJhZ2dhYmxlLmRyb3BwZWQgPSBmYWxzZTtcblxuXHRcdFx0XHRcdC8vIE5lZWQgdG8gcmVmcmVzaFBvc2l0aW9ucyBvZiBhbGwgc29ydGFibGVzIGp1c3QgaW4gY2FzZSByZW1vdmluZ1xuXHRcdFx0XHRcdC8vIGZyb20gb25lIHNvcnRhYmxlIGNoYW5nZXMgdGhlIGxvY2F0aW9uIG9mIG90aGVyIHNvcnRhYmxlcyAoIzk2NzUpXG5cdFx0XHRcdFx0JC5lYWNoKCBkcmFnZ2FibGUuc29ydGFibGVzLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdHRoaXMucmVmcmVzaFBvc2l0aW9ucygpO1xuXHRcdFx0XHRcdH0gKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0gKTtcblx0fVxufSApO1xuXG4kLnVpLnBsdWdpbi5hZGQoIFwiZHJhZ2dhYmxlXCIsIFwiY3Vyc29yXCIsIHtcblx0c3RhcnQ6IGZ1bmN0aW9uKCBldmVudCwgdWksIGluc3RhbmNlICkge1xuXHRcdHZhciB0ID0gJCggXCJib2R5XCIgKSxcblx0XHRcdG8gPSBpbnN0YW5jZS5vcHRpb25zO1xuXG5cdFx0aWYgKCB0LmNzcyggXCJjdXJzb3JcIiApICkge1xuXHRcdFx0by5fY3Vyc29yID0gdC5jc3MoIFwiY3Vyc29yXCIgKTtcblx0XHR9XG5cdFx0dC5jc3MoIFwiY3Vyc29yXCIsIG8uY3Vyc29yICk7XG5cdH0sXG5cdHN0b3A6IGZ1bmN0aW9uKCBldmVudCwgdWksIGluc3RhbmNlICkge1xuXHRcdHZhciBvID0gaW5zdGFuY2Uub3B0aW9ucztcblx0XHRpZiAoIG8uX2N1cnNvciApIHtcblx0XHRcdCQoIFwiYm9keVwiICkuY3NzKCBcImN1cnNvclwiLCBvLl9jdXJzb3IgKTtcblx0XHR9XG5cdH1cbn0gKTtcblxuJC51aS5wbHVnaW4uYWRkKCBcImRyYWdnYWJsZVwiLCBcIm9wYWNpdHlcIiwge1xuXHRzdGFydDogZnVuY3Rpb24oIGV2ZW50LCB1aSwgaW5zdGFuY2UgKSB7XG5cdFx0dmFyIHQgPSAkKCB1aS5oZWxwZXIgKSxcblx0XHRcdG8gPSBpbnN0YW5jZS5vcHRpb25zO1xuXHRcdGlmICggdC5jc3MoIFwib3BhY2l0eVwiICkgKSB7XG5cdFx0XHRvLl9vcGFjaXR5ID0gdC5jc3MoIFwib3BhY2l0eVwiICk7XG5cdFx0fVxuXHRcdHQuY3NzKCBcIm9wYWNpdHlcIiwgby5vcGFjaXR5ICk7XG5cdH0sXG5cdHN0b3A6IGZ1bmN0aW9uKCBldmVudCwgdWksIGluc3RhbmNlICkge1xuXHRcdHZhciBvID0gaW5zdGFuY2Uub3B0aW9ucztcblx0XHRpZiAoIG8uX29wYWNpdHkgKSB7XG5cdFx0XHQkKCB1aS5oZWxwZXIgKS5jc3MoIFwib3BhY2l0eVwiLCBvLl9vcGFjaXR5ICk7XG5cdFx0fVxuXHR9XG59ICk7XG5cbiQudWkucGx1Z2luLmFkZCggXCJkcmFnZ2FibGVcIiwgXCJzY3JvbGxcIiwge1xuXHRzdGFydDogZnVuY3Rpb24oIGV2ZW50LCB1aSwgaSApIHtcblx0XHRpZiAoICFpLnNjcm9sbFBhcmVudE5vdEhpZGRlbiApIHtcblx0XHRcdGkuc2Nyb2xsUGFyZW50Tm90SGlkZGVuID0gaS5oZWxwZXIuc2Nyb2xsUGFyZW50KCBmYWxzZSApO1xuXHRcdH1cblxuXHRcdGlmICggaS5zY3JvbGxQYXJlbnROb3RIaWRkZW5bIDAgXSAhPT0gaS5kb2N1bWVudFsgMCBdICYmXG5cdFx0XHRcdGkuc2Nyb2xsUGFyZW50Tm90SGlkZGVuWyAwIF0udGFnTmFtZSAhPT0gXCJIVE1MXCIgKSB7XG5cdFx0XHRpLm92ZXJmbG93T2Zmc2V0ID0gaS5zY3JvbGxQYXJlbnROb3RIaWRkZW4ub2Zmc2V0KCk7XG5cdFx0fVxuXHR9LFxuXHRkcmFnOiBmdW5jdGlvbiggZXZlbnQsIHVpLCBpICApIHtcblxuXHRcdHZhciBvID0gaS5vcHRpb25zLFxuXHRcdFx0c2Nyb2xsZWQgPSBmYWxzZSxcblx0XHRcdHNjcm9sbFBhcmVudCA9IGkuc2Nyb2xsUGFyZW50Tm90SGlkZGVuWyAwIF0sXG5cdFx0XHRkb2N1bWVudCA9IGkuZG9jdW1lbnRbIDAgXTtcblxuXHRcdGlmICggc2Nyb2xsUGFyZW50ICE9PSBkb2N1bWVudCAmJiBzY3JvbGxQYXJlbnQudGFnTmFtZSAhPT0gXCJIVE1MXCIgKSB7XG5cdFx0XHRpZiAoICFvLmF4aXMgfHwgby5heGlzICE9PSBcInhcIiApIHtcblx0XHRcdFx0aWYgKCAoIGkub3ZlcmZsb3dPZmZzZXQudG9wICsgc2Nyb2xsUGFyZW50Lm9mZnNldEhlaWdodCApIC0gZXZlbnQucGFnZVkgPFxuXHRcdFx0XHRcdFx0by5zY3JvbGxTZW5zaXRpdml0eSApIHtcblx0XHRcdFx0XHRzY3JvbGxQYXJlbnQuc2Nyb2xsVG9wID0gc2Nyb2xsZWQgPSBzY3JvbGxQYXJlbnQuc2Nyb2xsVG9wICsgby5zY3JvbGxTcGVlZDtcblx0XHRcdFx0fSBlbHNlIGlmICggZXZlbnQucGFnZVkgLSBpLm92ZXJmbG93T2Zmc2V0LnRvcCA8IG8uc2Nyb2xsU2Vuc2l0aXZpdHkgKSB7XG5cdFx0XHRcdFx0c2Nyb2xsUGFyZW50LnNjcm9sbFRvcCA9IHNjcm9sbGVkID0gc2Nyb2xsUGFyZW50LnNjcm9sbFRvcCAtIG8uc2Nyb2xsU3BlZWQ7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0aWYgKCAhby5heGlzIHx8IG8uYXhpcyAhPT0gXCJ5XCIgKSB7XG5cdFx0XHRcdGlmICggKCBpLm92ZXJmbG93T2Zmc2V0LmxlZnQgKyBzY3JvbGxQYXJlbnQub2Zmc2V0V2lkdGggKSAtIGV2ZW50LnBhZ2VYIDxcblx0XHRcdFx0XHRcdG8uc2Nyb2xsU2Vuc2l0aXZpdHkgKSB7XG5cdFx0XHRcdFx0c2Nyb2xsUGFyZW50LnNjcm9sbExlZnQgPSBzY3JvbGxlZCA9IHNjcm9sbFBhcmVudC5zY3JvbGxMZWZ0ICsgby5zY3JvbGxTcGVlZDtcblx0XHRcdFx0fSBlbHNlIGlmICggZXZlbnQucGFnZVggLSBpLm92ZXJmbG93T2Zmc2V0LmxlZnQgPCBvLnNjcm9sbFNlbnNpdGl2aXR5ICkge1xuXHRcdFx0XHRcdHNjcm9sbFBhcmVudC5zY3JvbGxMZWZ0ID0gc2Nyb2xsZWQgPSBzY3JvbGxQYXJlbnQuc2Nyb2xsTGVmdCAtIG8uc2Nyb2xsU3BlZWQ7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdH0gZWxzZSB7XG5cblx0XHRcdGlmICggIW8uYXhpcyB8fCBvLmF4aXMgIT09IFwieFwiICkge1xuXHRcdFx0XHRpZiAoIGV2ZW50LnBhZ2VZIC0gJCggZG9jdW1lbnQgKS5zY3JvbGxUb3AoKSA8IG8uc2Nyb2xsU2Vuc2l0aXZpdHkgKSB7XG5cdFx0XHRcdFx0c2Nyb2xsZWQgPSAkKCBkb2N1bWVudCApLnNjcm9sbFRvcCggJCggZG9jdW1lbnQgKS5zY3JvbGxUb3AoKSAtIG8uc2Nyb2xsU3BlZWQgKTtcblx0XHRcdFx0fSBlbHNlIGlmICggJCggd2luZG93ICkuaGVpZ2h0KCkgLSAoIGV2ZW50LnBhZ2VZIC0gJCggZG9jdW1lbnQgKS5zY3JvbGxUb3AoKSApIDxcblx0XHRcdFx0XHRcdG8uc2Nyb2xsU2Vuc2l0aXZpdHkgKSB7XG5cdFx0XHRcdFx0c2Nyb2xsZWQgPSAkKCBkb2N1bWVudCApLnNjcm9sbFRvcCggJCggZG9jdW1lbnQgKS5zY3JvbGxUb3AoKSArIG8uc2Nyb2xsU3BlZWQgKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRpZiAoICFvLmF4aXMgfHwgby5heGlzICE9PSBcInlcIiApIHtcblx0XHRcdFx0aWYgKCBldmVudC5wYWdlWCAtICQoIGRvY3VtZW50ICkuc2Nyb2xsTGVmdCgpIDwgby5zY3JvbGxTZW5zaXRpdml0eSApIHtcblx0XHRcdFx0XHRzY3JvbGxlZCA9ICQoIGRvY3VtZW50ICkuc2Nyb2xsTGVmdChcblx0XHRcdFx0XHRcdCQoIGRvY3VtZW50ICkuc2Nyb2xsTGVmdCgpIC0gby5zY3JvbGxTcGVlZFxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH0gZWxzZSBpZiAoICQoIHdpbmRvdyApLndpZHRoKCkgLSAoIGV2ZW50LnBhZ2VYIC0gJCggZG9jdW1lbnQgKS5zY3JvbGxMZWZ0KCkgKSA8XG5cdFx0XHRcdFx0XHRvLnNjcm9sbFNlbnNpdGl2aXR5ICkge1xuXHRcdFx0XHRcdHNjcm9sbGVkID0gJCggZG9jdW1lbnQgKS5zY3JvbGxMZWZ0KFxuXHRcdFx0XHRcdFx0JCggZG9jdW1lbnQgKS5zY3JvbGxMZWZ0KCkgKyBvLnNjcm9sbFNwZWVkXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0fVxuXG5cdFx0aWYgKCBzY3JvbGxlZCAhPT0gZmFsc2UgJiYgJC51aS5kZG1hbmFnZXIgJiYgIW8uZHJvcEJlaGF2aW91ciApIHtcblx0XHRcdCQudWkuZGRtYW5hZ2VyLnByZXBhcmVPZmZzZXRzKCBpLCBldmVudCApO1xuXHRcdH1cblxuXHR9XG59ICk7XG5cbiQudWkucGx1Z2luLmFkZCggXCJkcmFnZ2FibGVcIiwgXCJzbmFwXCIsIHtcblx0c3RhcnQ6IGZ1bmN0aW9uKCBldmVudCwgdWksIGkgKSB7XG5cblx0XHR2YXIgbyA9IGkub3B0aW9ucztcblxuXHRcdGkuc25hcEVsZW1lbnRzID0gW107XG5cblx0XHQkKCBvLnNuYXAuY29uc3RydWN0b3IgIT09IFN0cmluZyA/ICggby5zbmFwLml0ZW1zIHx8IFwiOmRhdGEodWktZHJhZ2dhYmxlKVwiICkgOiBvLnNuYXAgKVxuXHRcdFx0LmVhY2goIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgJHQgPSAkKCB0aGlzICksXG5cdFx0XHRcdFx0JG8gPSAkdC5vZmZzZXQoKTtcblx0XHRcdFx0aWYgKCB0aGlzICE9PSBpLmVsZW1lbnRbIDAgXSApIHtcblx0XHRcdFx0XHRpLnNuYXBFbGVtZW50cy5wdXNoKCB7XG5cdFx0XHRcdFx0XHRpdGVtOiB0aGlzLFxuXHRcdFx0XHRcdFx0d2lkdGg6ICR0Lm91dGVyV2lkdGgoKSwgaGVpZ2h0OiAkdC5vdXRlckhlaWdodCgpLFxuXHRcdFx0XHRcdFx0dG9wOiAkby50b3AsIGxlZnQ6ICRvLmxlZnRcblx0XHRcdFx0XHR9ICk7XG5cdFx0XHRcdH1cblx0XHRcdH0gKTtcblxuXHR9LFxuXHRkcmFnOiBmdW5jdGlvbiggZXZlbnQsIHVpLCBpbnN0ICkge1xuXG5cdFx0dmFyIHRzLCBicywgbHMsIHJzLCBsLCByLCB0LCBiLCBpLCBmaXJzdCxcblx0XHRcdG8gPSBpbnN0Lm9wdGlvbnMsXG5cdFx0XHRkID0gby5zbmFwVG9sZXJhbmNlLFxuXHRcdFx0eDEgPSB1aS5vZmZzZXQubGVmdCwgeDIgPSB4MSArIGluc3QuaGVscGVyUHJvcG9ydGlvbnMud2lkdGgsXG5cdFx0XHR5MSA9IHVpLm9mZnNldC50b3AsIHkyID0geTEgKyBpbnN0LmhlbHBlclByb3BvcnRpb25zLmhlaWdodDtcblxuXHRcdGZvciAoIGkgPSBpbnN0LnNuYXBFbGVtZW50cy5sZW5ndGggLSAxOyBpID49IDA7IGktLSApIHtcblxuXHRcdFx0bCA9IGluc3Quc25hcEVsZW1lbnRzWyBpIF0ubGVmdCAtIGluc3QubWFyZ2lucy5sZWZ0O1xuXHRcdFx0ciA9IGwgKyBpbnN0LnNuYXBFbGVtZW50c1sgaSBdLndpZHRoO1xuXHRcdFx0dCA9IGluc3Quc25hcEVsZW1lbnRzWyBpIF0udG9wIC0gaW5zdC5tYXJnaW5zLnRvcDtcblx0XHRcdGIgPSB0ICsgaW5zdC5zbmFwRWxlbWVudHNbIGkgXS5oZWlnaHQ7XG5cblx0XHRcdGlmICggeDIgPCBsIC0gZCB8fCB4MSA+IHIgKyBkIHx8IHkyIDwgdCAtIGQgfHwgeTEgPiBiICsgZCB8fFxuXHRcdFx0XHRcdCEkLmNvbnRhaW5zKCBpbnN0LnNuYXBFbGVtZW50c1sgaSBdLml0ZW0ub3duZXJEb2N1bWVudCxcblx0XHRcdFx0XHRpbnN0LnNuYXBFbGVtZW50c1sgaSBdLml0ZW0gKSApIHtcblx0XHRcdFx0aWYgKCBpbnN0LnNuYXBFbGVtZW50c1sgaSBdLnNuYXBwaW5nICkge1xuXHRcdFx0XHRcdCggaW5zdC5vcHRpb25zLnNuYXAucmVsZWFzZSAmJlxuXHRcdFx0XHRcdFx0aW5zdC5vcHRpb25zLnNuYXAucmVsZWFzZS5jYWxsKFxuXHRcdFx0XHRcdFx0XHRpbnN0LmVsZW1lbnQsXG5cdFx0XHRcdFx0XHRcdGV2ZW50LFxuXHRcdFx0XHRcdFx0XHQkLmV4dGVuZCggaW5zdC5fdWlIYXNoKCksIHsgc25hcEl0ZW06IGluc3Quc25hcEVsZW1lbnRzWyBpIF0uaXRlbSB9IClcblx0XHRcdFx0XHRcdCkgKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpbnN0LnNuYXBFbGVtZW50c1sgaSBdLnNuYXBwaW5nID0gZmFsc2U7XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIG8uc25hcE1vZGUgIT09IFwiaW5uZXJcIiApIHtcblx0XHRcdFx0dHMgPSBNYXRoLmFicyggdCAtIHkyICkgPD0gZDtcblx0XHRcdFx0YnMgPSBNYXRoLmFicyggYiAtIHkxICkgPD0gZDtcblx0XHRcdFx0bHMgPSBNYXRoLmFicyggbCAtIHgyICkgPD0gZDtcblx0XHRcdFx0cnMgPSBNYXRoLmFicyggciAtIHgxICkgPD0gZDtcblx0XHRcdFx0aWYgKCB0cyApIHtcblx0XHRcdFx0XHR1aS5wb3NpdGlvbi50b3AgPSBpbnN0Ll9jb252ZXJ0UG9zaXRpb25UbyggXCJyZWxhdGl2ZVwiLCB7XG5cdFx0XHRcdFx0XHR0b3A6IHQgLSBpbnN0LmhlbHBlclByb3BvcnRpb25zLmhlaWdodCxcblx0XHRcdFx0XHRcdGxlZnQ6IDBcblx0XHRcdFx0XHR9ICkudG9wO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmICggYnMgKSB7XG5cdFx0XHRcdFx0dWkucG9zaXRpb24udG9wID0gaW5zdC5fY29udmVydFBvc2l0aW9uVG8oIFwicmVsYXRpdmVcIiwge1xuXHRcdFx0XHRcdFx0dG9wOiBiLFxuXHRcdFx0XHRcdFx0bGVmdDogMFxuXHRcdFx0XHRcdH0gKS50b3A7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKCBscyApIHtcblx0XHRcdFx0XHR1aS5wb3NpdGlvbi5sZWZ0ID0gaW5zdC5fY29udmVydFBvc2l0aW9uVG8oIFwicmVsYXRpdmVcIiwge1xuXHRcdFx0XHRcdFx0dG9wOiAwLFxuXHRcdFx0XHRcdFx0bGVmdDogbCAtIGluc3QuaGVscGVyUHJvcG9ydGlvbnMud2lkdGhcblx0XHRcdFx0XHR9ICkubGVmdDtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoIHJzICkge1xuXHRcdFx0XHRcdHVpLnBvc2l0aW9uLmxlZnQgPSBpbnN0Ll9jb252ZXJ0UG9zaXRpb25UbyggXCJyZWxhdGl2ZVwiLCB7XG5cdFx0XHRcdFx0XHR0b3A6IDAsXG5cdFx0XHRcdFx0XHRsZWZ0OiByXG5cdFx0XHRcdFx0fSApLmxlZnQ7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0Zmlyc3QgPSAoIHRzIHx8IGJzIHx8IGxzIHx8IHJzICk7XG5cblx0XHRcdGlmICggby5zbmFwTW9kZSAhPT0gXCJvdXRlclwiICkge1xuXHRcdFx0XHR0cyA9IE1hdGguYWJzKCB0IC0geTEgKSA8PSBkO1xuXHRcdFx0XHRicyA9IE1hdGguYWJzKCBiIC0geTIgKSA8PSBkO1xuXHRcdFx0XHRscyA9IE1hdGguYWJzKCBsIC0geDEgKSA8PSBkO1xuXHRcdFx0XHRycyA9IE1hdGguYWJzKCByIC0geDIgKSA8PSBkO1xuXHRcdFx0XHRpZiAoIHRzICkge1xuXHRcdFx0XHRcdHVpLnBvc2l0aW9uLnRvcCA9IGluc3QuX2NvbnZlcnRQb3NpdGlvblRvKCBcInJlbGF0aXZlXCIsIHtcblx0XHRcdFx0XHRcdHRvcDogdCxcblx0XHRcdFx0XHRcdGxlZnQ6IDBcblx0XHRcdFx0XHR9ICkudG9wO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmICggYnMgKSB7XG5cdFx0XHRcdFx0dWkucG9zaXRpb24udG9wID0gaW5zdC5fY29udmVydFBvc2l0aW9uVG8oIFwicmVsYXRpdmVcIiwge1xuXHRcdFx0XHRcdFx0dG9wOiBiIC0gaW5zdC5oZWxwZXJQcm9wb3J0aW9ucy5oZWlnaHQsXG5cdFx0XHRcdFx0XHRsZWZ0OiAwXG5cdFx0XHRcdFx0fSApLnRvcDtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoIGxzICkge1xuXHRcdFx0XHRcdHVpLnBvc2l0aW9uLmxlZnQgPSBpbnN0Ll9jb252ZXJ0UG9zaXRpb25UbyggXCJyZWxhdGl2ZVwiLCB7XG5cdFx0XHRcdFx0XHR0b3A6IDAsXG5cdFx0XHRcdFx0XHRsZWZ0OiBsXG5cdFx0XHRcdFx0fSApLmxlZnQ7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKCBycyApIHtcblx0XHRcdFx0XHR1aS5wb3NpdGlvbi5sZWZ0ID0gaW5zdC5fY29udmVydFBvc2l0aW9uVG8oIFwicmVsYXRpdmVcIiwge1xuXHRcdFx0XHRcdFx0dG9wOiAwLFxuXHRcdFx0XHRcdFx0bGVmdDogciAtIGluc3QuaGVscGVyUHJvcG9ydGlvbnMud2lkdGhcblx0XHRcdFx0XHR9ICkubGVmdDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRpZiAoICFpbnN0LnNuYXBFbGVtZW50c1sgaSBdLnNuYXBwaW5nICYmICggdHMgfHwgYnMgfHwgbHMgfHwgcnMgfHwgZmlyc3QgKSApIHtcblx0XHRcdFx0KCBpbnN0Lm9wdGlvbnMuc25hcC5zbmFwICYmXG5cdFx0XHRcdFx0aW5zdC5vcHRpb25zLnNuYXAuc25hcC5jYWxsKFxuXHRcdFx0XHRcdFx0aW5zdC5lbGVtZW50LFxuXHRcdFx0XHRcdFx0ZXZlbnQsXG5cdFx0XHRcdFx0XHQkLmV4dGVuZCggaW5zdC5fdWlIYXNoKCksIHtcblx0XHRcdFx0XHRcdFx0c25hcEl0ZW06IGluc3Quc25hcEVsZW1lbnRzWyBpIF0uaXRlbVxuXHRcdFx0XHRcdFx0fSApICkgKTtcblx0XHRcdH1cblx0XHRcdGluc3Quc25hcEVsZW1lbnRzWyBpIF0uc25hcHBpbmcgPSAoIHRzIHx8IGJzIHx8IGxzIHx8IHJzIHx8IGZpcnN0ICk7XG5cblx0XHR9XG5cblx0fVxufSApO1xuXG4kLnVpLnBsdWdpbi5hZGQoIFwiZHJhZ2dhYmxlXCIsIFwic3RhY2tcIiwge1xuXHRzdGFydDogZnVuY3Rpb24oIGV2ZW50LCB1aSwgaW5zdGFuY2UgKSB7XG5cdFx0dmFyIG1pbixcblx0XHRcdG8gPSBpbnN0YW5jZS5vcHRpb25zLFxuXHRcdFx0Z3JvdXAgPSAkLm1ha2VBcnJheSggJCggby5zdGFjayApICkuc29ydCggZnVuY3Rpb24oIGEsIGIgKSB7XG5cdFx0XHRcdHJldHVybiAoIHBhcnNlSW50KCAkKCBhICkuY3NzKCBcInpJbmRleFwiICksIDEwICkgfHwgMCApIC1cblx0XHRcdFx0XHQoIHBhcnNlSW50KCAkKCBiICkuY3NzKCBcInpJbmRleFwiICksIDEwICkgfHwgMCApO1xuXHRcdFx0fSApO1xuXG5cdFx0aWYgKCAhZ3JvdXAubGVuZ3RoICkgeyByZXR1cm47IH1cblxuXHRcdG1pbiA9IHBhcnNlSW50KCAkKCBncm91cFsgMCBdICkuY3NzKCBcInpJbmRleFwiICksIDEwICkgfHwgMDtcblx0XHQkKCBncm91cCApLmVhY2goIGZ1bmN0aW9uKCBpICkge1xuXHRcdFx0JCggdGhpcyApLmNzcyggXCJ6SW5kZXhcIiwgbWluICsgaSApO1xuXHRcdH0gKTtcblx0XHR0aGlzLmNzcyggXCJ6SW5kZXhcIiwgKCBtaW4gKyBncm91cC5sZW5ndGggKSApO1xuXHR9XG59ICk7XG5cbiQudWkucGx1Z2luLmFkZCggXCJkcmFnZ2FibGVcIiwgXCJ6SW5kZXhcIiwge1xuXHRzdGFydDogZnVuY3Rpb24oIGV2ZW50LCB1aSwgaW5zdGFuY2UgKSB7XG5cdFx0dmFyIHQgPSAkKCB1aS5oZWxwZXIgKSxcblx0XHRcdG8gPSBpbnN0YW5jZS5vcHRpb25zO1xuXG5cdFx0aWYgKCB0LmNzcyggXCJ6SW5kZXhcIiApICkge1xuXHRcdFx0by5fekluZGV4ID0gdC5jc3MoIFwiekluZGV4XCIgKTtcblx0XHR9XG5cdFx0dC5jc3MoIFwiekluZGV4XCIsIG8uekluZGV4ICk7XG5cdH0sXG5cdHN0b3A6IGZ1bmN0aW9uKCBldmVudCwgdWksIGluc3RhbmNlICkge1xuXHRcdHZhciBvID0gaW5zdGFuY2Uub3B0aW9ucztcblxuXHRcdGlmICggby5fekluZGV4ICkge1xuXHRcdFx0JCggdWkuaGVscGVyICkuY3NzKCBcInpJbmRleFwiLCBvLl96SW5kZXggKTtcblx0XHR9XG5cdH1cbn0gKTtcblxucmV0dXJuICQudWkuZHJhZ2dhYmxlO1xuXG59ICkgKTtcbiIsIi8qIVxuICogalF1ZXJ5IFVJIFdpZGdldCAxLjEyLjFcbiAqIGh0dHA6Ly9qcXVlcnl1aS5jb21cbiAqXG4gKiBDb3B5cmlnaHQgalF1ZXJ5IEZvdW5kYXRpb24gYW5kIG90aGVyIGNvbnRyaWJ1dG9yc1xuICogUmVsZWFzZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlLlxuICogaHR0cDovL2pxdWVyeS5vcmcvbGljZW5zZVxuICovXG5cbi8vPj5sYWJlbDogV2lkZ2V0XG4vLz4+Z3JvdXA6IENvcmVcbi8vPj5kZXNjcmlwdGlvbjogUHJvdmlkZXMgYSBmYWN0b3J5IGZvciBjcmVhdGluZyBzdGF0ZWZ1bCB3aWRnZXRzIHdpdGggYSBjb21tb24gQVBJLlxuLy8+PmRvY3M6IGh0dHA6Ly9hcGkuanF1ZXJ5dWkuY29tL2pRdWVyeS53aWRnZXQvXG4vLz4+ZGVtb3M6IGh0dHA6Ly9qcXVlcnl1aS5jb20vd2lkZ2V0L1xuXG4oIGZ1bmN0aW9uKCBmYWN0b3J5ICkge1xuXHRpZiAoIHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kICkge1xuXG5cdFx0Ly8gQU1ELiBSZWdpc3RlciBhcyBhbiBhbm9ueW1vdXMgbW9kdWxlLlxuXHRcdGRlZmluZSggWyBcImpxdWVyeVwiLCBcIi4vdmVyc2lvblwiIF0sIGZhY3RvcnkgKTtcblx0fSBlbHNlIHtcblxuXHRcdC8vIEJyb3dzZXIgZ2xvYmFsc1xuXHRcdGZhY3RvcnkoIGpRdWVyeSApO1xuXHR9XG59KCBmdW5jdGlvbiggJCApIHtcblxudmFyIHdpZGdldFV1aWQgPSAwO1xudmFyIHdpZGdldFNsaWNlID0gQXJyYXkucHJvdG90eXBlLnNsaWNlO1xuXG4kLmNsZWFuRGF0YSA9ICggZnVuY3Rpb24oIG9yaWcgKSB7XG5cdHJldHVybiBmdW5jdGlvbiggZWxlbXMgKSB7XG5cdFx0dmFyIGV2ZW50cywgZWxlbSwgaTtcblx0XHRmb3IgKCBpID0gMDsgKCBlbGVtID0gZWxlbXNbIGkgXSApICE9IG51bGw7IGkrKyApIHtcblx0XHRcdHRyeSB7XG5cblx0XHRcdFx0Ly8gT25seSB0cmlnZ2VyIHJlbW92ZSB3aGVuIG5lY2Vzc2FyeSB0byBzYXZlIHRpbWVcblx0XHRcdFx0ZXZlbnRzID0gJC5fZGF0YSggZWxlbSwgXCJldmVudHNcIiApO1xuXHRcdFx0XHRpZiAoIGV2ZW50cyAmJiBldmVudHMucmVtb3ZlICkge1xuXHRcdFx0XHRcdCQoIGVsZW0gKS50cmlnZ2VySGFuZGxlciggXCJyZW1vdmVcIiApO1xuXHRcdFx0XHR9XG5cblx0XHRcdC8vIEh0dHA6Ly9idWdzLmpxdWVyeS5jb20vdGlja2V0LzgyMzVcblx0XHRcdH0gY2F0Y2ggKCBlICkge31cblx0XHR9XG5cdFx0b3JpZyggZWxlbXMgKTtcblx0fTtcbn0gKSggJC5jbGVhbkRhdGEgKTtcblxuJC53aWRnZXQgPSBmdW5jdGlvbiggbmFtZSwgYmFzZSwgcHJvdG90eXBlICkge1xuXHR2YXIgZXhpc3RpbmdDb25zdHJ1Y3RvciwgY29uc3RydWN0b3IsIGJhc2VQcm90b3R5cGU7XG5cblx0Ly8gUHJveGllZFByb3RvdHlwZSBhbGxvd3MgdGhlIHByb3ZpZGVkIHByb3RvdHlwZSB0byByZW1haW4gdW5tb2RpZmllZFxuXHQvLyBzbyB0aGF0IGl0IGNhbiBiZSB1c2VkIGFzIGEgbWl4aW4gZm9yIG11bHRpcGxlIHdpZGdldHMgKCM4ODc2KVxuXHR2YXIgcHJveGllZFByb3RvdHlwZSA9IHt9O1xuXG5cdHZhciBuYW1lc3BhY2UgPSBuYW1lLnNwbGl0KCBcIi5cIiApWyAwIF07XG5cdG5hbWUgPSBuYW1lLnNwbGl0KCBcIi5cIiApWyAxIF07XG5cdHZhciBmdWxsTmFtZSA9IG5hbWVzcGFjZSArIFwiLVwiICsgbmFtZTtcblxuXHRpZiAoICFwcm90b3R5cGUgKSB7XG5cdFx0cHJvdG90eXBlID0gYmFzZTtcblx0XHRiYXNlID0gJC5XaWRnZXQ7XG5cdH1cblxuXHRpZiAoICQuaXNBcnJheSggcHJvdG90eXBlICkgKSB7XG5cdFx0cHJvdG90eXBlID0gJC5leHRlbmQuYXBwbHkoIG51bGwsIFsge30gXS5jb25jYXQoIHByb3RvdHlwZSApICk7XG5cdH1cblxuXHQvLyBDcmVhdGUgc2VsZWN0b3IgZm9yIHBsdWdpblxuXHQkLmV4cHJbIFwiOlwiIF1bIGZ1bGxOYW1lLnRvTG93ZXJDYXNlKCkgXSA9IGZ1bmN0aW9uKCBlbGVtICkge1xuXHRcdHJldHVybiAhISQuZGF0YSggZWxlbSwgZnVsbE5hbWUgKTtcblx0fTtcblxuXHQkWyBuYW1lc3BhY2UgXSA9ICRbIG5hbWVzcGFjZSBdIHx8IHt9O1xuXHRleGlzdGluZ0NvbnN0cnVjdG9yID0gJFsgbmFtZXNwYWNlIF1bIG5hbWUgXTtcblx0Y29uc3RydWN0b3IgPSAkWyBuYW1lc3BhY2UgXVsgbmFtZSBdID0gZnVuY3Rpb24oIG9wdGlvbnMsIGVsZW1lbnQgKSB7XG5cblx0XHQvLyBBbGxvdyBpbnN0YW50aWF0aW9uIHdpdGhvdXQgXCJuZXdcIiBrZXl3b3JkXG5cdFx0aWYgKCAhdGhpcy5fY3JlYXRlV2lkZ2V0ICkge1xuXHRcdFx0cmV0dXJuIG5ldyBjb25zdHJ1Y3Rvciggb3B0aW9ucywgZWxlbWVudCApO1xuXHRcdH1cblxuXHRcdC8vIEFsbG93IGluc3RhbnRpYXRpb24gd2l0aG91dCBpbml0aWFsaXppbmcgZm9yIHNpbXBsZSBpbmhlcml0YW5jZVxuXHRcdC8vIG11c3QgdXNlIFwibmV3XCIga2V5d29yZCAodGhlIGNvZGUgYWJvdmUgYWx3YXlzIHBhc3NlcyBhcmdzKVxuXHRcdGlmICggYXJndW1lbnRzLmxlbmd0aCApIHtcblx0XHRcdHRoaXMuX2NyZWF0ZVdpZGdldCggb3B0aW9ucywgZWxlbWVudCApO1xuXHRcdH1cblx0fTtcblxuXHQvLyBFeHRlbmQgd2l0aCB0aGUgZXhpc3RpbmcgY29uc3RydWN0b3IgdG8gY2Fycnkgb3ZlciBhbnkgc3RhdGljIHByb3BlcnRpZXNcblx0JC5leHRlbmQoIGNvbnN0cnVjdG9yLCBleGlzdGluZ0NvbnN0cnVjdG9yLCB7XG5cdFx0dmVyc2lvbjogcHJvdG90eXBlLnZlcnNpb24sXG5cblx0XHQvLyBDb3B5IHRoZSBvYmplY3QgdXNlZCB0byBjcmVhdGUgdGhlIHByb3RvdHlwZSBpbiBjYXNlIHdlIG5lZWQgdG9cblx0XHQvLyByZWRlZmluZSB0aGUgd2lkZ2V0IGxhdGVyXG5cdFx0X3Byb3RvOiAkLmV4dGVuZCgge30sIHByb3RvdHlwZSApLFxuXG5cdFx0Ly8gVHJhY2sgd2lkZ2V0cyB0aGF0IGluaGVyaXQgZnJvbSB0aGlzIHdpZGdldCBpbiBjYXNlIHRoaXMgd2lkZ2V0IGlzXG5cdFx0Ly8gcmVkZWZpbmVkIGFmdGVyIGEgd2lkZ2V0IGluaGVyaXRzIGZyb20gaXRcblx0XHRfY2hpbGRDb25zdHJ1Y3RvcnM6IFtdXG5cdH0gKTtcblxuXHRiYXNlUHJvdG90eXBlID0gbmV3IGJhc2UoKTtcblxuXHQvLyBXZSBuZWVkIHRvIG1ha2UgdGhlIG9wdGlvbnMgaGFzaCBhIHByb3BlcnR5IGRpcmVjdGx5IG9uIHRoZSBuZXcgaW5zdGFuY2Vcblx0Ly8gb3RoZXJ3aXNlIHdlJ2xsIG1vZGlmeSB0aGUgb3B0aW9ucyBoYXNoIG9uIHRoZSBwcm90b3R5cGUgdGhhdCB3ZSdyZVxuXHQvLyBpbmhlcml0aW5nIGZyb21cblx0YmFzZVByb3RvdHlwZS5vcHRpb25zID0gJC53aWRnZXQuZXh0ZW5kKCB7fSwgYmFzZVByb3RvdHlwZS5vcHRpb25zICk7XG5cdCQuZWFjaCggcHJvdG90eXBlLCBmdW5jdGlvbiggcHJvcCwgdmFsdWUgKSB7XG5cdFx0aWYgKCAhJC5pc0Z1bmN0aW9uKCB2YWx1ZSApICkge1xuXHRcdFx0cHJveGllZFByb3RvdHlwZVsgcHJvcCBdID0gdmFsdWU7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdHByb3hpZWRQcm90b3R5cGVbIHByb3AgXSA9ICggZnVuY3Rpb24oKSB7XG5cdFx0XHRmdW5jdGlvbiBfc3VwZXIoKSB7XG5cdFx0XHRcdHJldHVybiBiYXNlLnByb3RvdHlwZVsgcHJvcCBdLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblx0XHRcdH1cblxuXHRcdFx0ZnVuY3Rpb24gX3N1cGVyQXBwbHkoIGFyZ3MgKSB7XG5cdFx0XHRcdHJldHVybiBiYXNlLnByb3RvdHlwZVsgcHJvcCBdLmFwcGx5KCB0aGlzLCBhcmdzICk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIF9fc3VwZXIgPSB0aGlzLl9zdXBlcjtcblx0XHRcdFx0dmFyIF9fc3VwZXJBcHBseSA9IHRoaXMuX3N1cGVyQXBwbHk7XG5cdFx0XHRcdHZhciByZXR1cm5WYWx1ZTtcblxuXHRcdFx0XHR0aGlzLl9zdXBlciA9IF9zdXBlcjtcblx0XHRcdFx0dGhpcy5fc3VwZXJBcHBseSA9IF9zdXBlckFwcGx5O1xuXG5cdFx0XHRcdHJldHVyblZhbHVlID0gdmFsdWUuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuXG5cdFx0XHRcdHRoaXMuX3N1cGVyID0gX19zdXBlcjtcblx0XHRcdFx0dGhpcy5fc3VwZXJBcHBseSA9IF9fc3VwZXJBcHBseTtcblxuXHRcdFx0XHRyZXR1cm4gcmV0dXJuVmFsdWU7XG5cdFx0XHR9O1xuXHRcdH0gKSgpO1xuXHR9ICk7XG5cdGNvbnN0cnVjdG9yLnByb3RvdHlwZSA9ICQud2lkZ2V0LmV4dGVuZCggYmFzZVByb3RvdHlwZSwge1xuXG5cdFx0Ly8gVE9ETzogcmVtb3ZlIHN1cHBvcnQgZm9yIHdpZGdldEV2ZW50UHJlZml4XG5cdFx0Ly8gYWx3YXlzIHVzZSB0aGUgbmFtZSArIGEgY29sb24gYXMgdGhlIHByZWZpeCwgZS5nLiwgZHJhZ2dhYmxlOnN0YXJ0XG5cdFx0Ly8gZG9uJ3QgcHJlZml4IGZvciB3aWRnZXRzIHRoYXQgYXJlbid0IERPTS1iYXNlZFxuXHRcdHdpZGdldEV2ZW50UHJlZml4OiBleGlzdGluZ0NvbnN0cnVjdG9yID8gKCBiYXNlUHJvdG90eXBlLndpZGdldEV2ZW50UHJlZml4IHx8IG5hbWUgKSA6IG5hbWVcblx0fSwgcHJveGllZFByb3RvdHlwZSwge1xuXHRcdGNvbnN0cnVjdG9yOiBjb25zdHJ1Y3Rvcixcblx0XHRuYW1lc3BhY2U6IG5hbWVzcGFjZSxcblx0XHR3aWRnZXROYW1lOiBuYW1lLFxuXHRcdHdpZGdldEZ1bGxOYW1lOiBmdWxsTmFtZVxuXHR9ICk7XG5cblx0Ly8gSWYgdGhpcyB3aWRnZXQgaXMgYmVpbmcgcmVkZWZpbmVkIHRoZW4gd2UgbmVlZCB0byBmaW5kIGFsbCB3aWRnZXRzIHRoYXRcblx0Ly8gYXJlIGluaGVyaXRpbmcgZnJvbSBpdCBhbmQgcmVkZWZpbmUgYWxsIG9mIHRoZW0gc28gdGhhdCB0aGV5IGluaGVyaXQgZnJvbVxuXHQvLyB0aGUgbmV3IHZlcnNpb24gb2YgdGhpcyB3aWRnZXQuIFdlJ3JlIGVzc2VudGlhbGx5IHRyeWluZyB0byByZXBsYWNlIG9uZVxuXHQvLyBsZXZlbCBpbiB0aGUgcHJvdG90eXBlIGNoYWluLlxuXHRpZiAoIGV4aXN0aW5nQ29uc3RydWN0b3IgKSB7XG5cdFx0JC5lYWNoKCBleGlzdGluZ0NvbnN0cnVjdG9yLl9jaGlsZENvbnN0cnVjdG9ycywgZnVuY3Rpb24oIGksIGNoaWxkICkge1xuXHRcdFx0dmFyIGNoaWxkUHJvdG90eXBlID0gY2hpbGQucHJvdG90eXBlO1xuXG5cdFx0XHQvLyBSZWRlZmluZSB0aGUgY2hpbGQgd2lkZ2V0IHVzaW5nIHRoZSBzYW1lIHByb3RvdHlwZSB0aGF0IHdhc1xuXHRcdFx0Ly8gb3JpZ2luYWxseSB1c2VkLCBidXQgaW5oZXJpdCBmcm9tIHRoZSBuZXcgdmVyc2lvbiBvZiB0aGUgYmFzZVxuXHRcdFx0JC53aWRnZXQoIGNoaWxkUHJvdG90eXBlLm5hbWVzcGFjZSArIFwiLlwiICsgY2hpbGRQcm90b3R5cGUud2lkZ2V0TmFtZSwgY29uc3RydWN0b3IsXG5cdFx0XHRcdGNoaWxkLl9wcm90byApO1xuXHRcdH0gKTtcblxuXHRcdC8vIFJlbW92ZSB0aGUgbGlzdCBvZiBleGlzdGluZyBjaGlsZCBjb25zdHJ1Y3RvcnMgZnJvbSB0aGUgb2xkIGNvbnN0cnVjdG9yXG5cdFx0Ly8gc28gdGhlIG9sZCBjaGlsZCBjb25zdHJ1Y3RvcnMgY2FuIGJlIGdhcmJhZ2UgY29sbGVjdGVkXG5cdFx0ZGVsZXRlIGV4aXN0aW5nQ29uc3RydWN0b3IuX2NoaWxkQ29uc3RydWN0b3JzO1xuXHR9IGVsc2Uge1xuXHRcdGJhc2UuX2NoaWxkQ29uc3RydWN0b3JzLnB1c2goIGNvbnN0cnVjdG9yICk7XG5cdH1cblxuXHQkLndpZGdldC5icmlkZ2UoIG5hbWUsIGNvbnN0cnVjdG9yICk7XG5cblx0cmV0dXJuIGNvbnN0cnVjdG9yO1xufTtcblxuJC53aWRnZXQuZXh0ZW5kID0gZnVuY3Rpb24oIHRhcmdldCApIHtcblx0dmFyIGlucHV0ID0gd2lkZ2V0U2xpY2UuY2FsbCggYXJndW1lbnRzLCAxICk7XG5cdHZhciBpbnB1dEluZGV4ID0gMDtcblx0dmFyIGlucHV0TGVuZ3RoID0gaW5wdXQubGVuZ3RoO1xuXHR2YXIga2V5O1xuXHR2YXIgdmFsdWU7XG5cblx0Zm9yICggOyBpbnB1dEluZGV4IDwgaW5wdXRMZW5ndGg7IGlucHV0SW5kZXgrKyApIHtcblx0XHRmb3IgKCBrZXkgaW4gaW5wdXRbIGlucHV0SW5kZXggXSApIHtcblx0XHRcdHZhbHVlID0gaW5wdXRbIGlucHV0SW5kZXggXVsga2V5IF07XG5cdFx0XHRpZiAoIGlucHV0WyBpbnB1dEluZGV4IF0uaGFzT3duUHJvcGVydHkoIGtleSApICYmIHZhbHVlICE9PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdFx0Ly8gQ2xvbmUgb2JqZWN0c1xuXHRcdFx0XHRpZiAoICQuaXNQbGFpbk9iamVjdCggdmFsdWUgKSApIHtcblx0XHRcdFx0XHR0YXJnZXRbIGtleSBdID0gJC5pc1BsYWluT2JqZWN0KCB0YXJnZXRbIGtleSBdICkgP1xuXHRcdFx0XHRcdFx0JC53aWRnZXQuZXh0ZW5kKCB7fSwgdGFyZ2V0WyBrZXkgXSwgdmFsdWUgKSA6XG5cblx0XHRcdFx0XHRcdC8vIERvbid0IGV4dGVuZCBzdHJpbmdzLCBhcnJheXMsIGV0Yy4gd2l0aCBvYmplY3RzXG5cdFx0XHRcdFx0XHQkLndpZGdldC5leHRlbmQoIHt9LCB2YWx1ZSApO1xuXG5cdFx0XHRcdC8vIENvcHkgZXZlcnl0aGluZyBlbHNlIGJ5IHJlZmVyZW5jZVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHRhcmdldFsga2V5IF0gPSB2YWx1ZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRyZXR1cm4gdGFyZ2V0O1xufTtcblxuJC53aWRnZXQuYnJpZGdlID0gZnVuY3Rpb24oIG5hbWUsIG9iamVjdCApIHtcblx0dmFyIGZ1bGxOYW1lID0gb2JqZWN0LnByb3RvdHlwZS53aWRnZXRGdWxsTmFtZSB8fCBuYW1lO1xuXHQkLmZuWyBuYW1lIF0gPSBmdW5jdGlvbiggb3B0aW9ucyApIHtcblx0XHR2YXIgaXNNZXRob2RDYWxsID0gdHlwZW9mIG9wdGlvbnMgPT09IFwic3RyaW5nXCI7XG5cdFx0dmFyIGFyZ3MgPSB3aWRnZXRTbGljZS5jYWxsKCBhcmd1bWVudHMsIDEgKTtcblx0XHR2YXIgcmV0dXJuVmFsdWUgPSB0aGlzO1xuXG5cdFx0aWYgKCBpc01ldGhvZENhbGwgKSB7XG5cblx0XHRcdC8vIElmIHRoaXMgaXMgYW4gZW1wdHkgY29sbGVjdGlvbiwgd2UgbmVlZCB0byBoYXZlIHRoZSBpbnN0YW5jZSBtZXRob2Rcblx0XHRcdC8vIHJldHVybiB1bmRlZmluZWQgaW5zdGVhZCBvZiB0aGUgalF1ZXJ5IGluc3RhbmNlXG5cdFx0XHRpZiAoICF0aGlzLmxlbmd0aCAmJiBvcHRpb25zID09PSBcImluc3RhbmNlXCIgKSB7XG5cdFx0XHRcdHJldHVyblZhbHVlID0gdW5kZWZpbmVkO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5lYWNoKCBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHR2YXIgbWV0aG9kVmFsdWU7XG5cdFx0XHRcdFx0dmFyIGluc3RhbmNlID0gJC5kYXRhKCB0aGlzLCBmdWxsTmFtZSApO1xuXG5cdFx0XHRcdFx0aWYgKCBvcHRpb25zID09PSBcImluc3RhbmNlXCIgKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm5WYWx1ZSA9IGluc3RhbmNlO1xuXHRcdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmICggIWluc3RhbmNlICkge1xuXHRcdFx0XHRcdFx0cmV0dXJuICQuZXJyb3IoIFwiY2Fubm90IGNhbGwgbWV0aG9kcyBvbiBcIiArIG5hbWUgK1xuXHRcdFx0XHRcdFx0XHRcIiBwcmlvciB0byBpbml0aWFsaXphdGlvbjsgXCIgK1xuXHRcdFx0XHRcdFx0XHRcImF0dGVtcHRlZCB0byBjYWxsIG1ldGhvZCAnXCIgKyBvcHRpb25zICsgXCInXCIgKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAoICEkLmlzRnVuY3Rpb24oIGluc3RhbmNlWyBvcHRpb25zIF0gKSB8fCBvcHRpb25zLmNoYXJBdCggMCApID09PSBcIl9cIiApIHtcblx0XHRcdFx0XHRcdHJldHVybiAkLmVycm9yKCBcIm5vIHN1Y2ggbWV0aG9kICdcIiArIG9wdGlvbnMgKyBcIicgZm9yIFwiICsgbmFtZSArXG5cdFx0XHRcdFx0XHRcdFwiIHdpZGdldCBpbnN0YW5jZVwiICk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0bWV0aG9kVmFsdWUgPSBpbnN0YW5jZVsgb3B0aW9ucyBdLmFwcGx5KCBpbnN0YW5jZSwgYXJncyApO1xuXG5cdFx0XHRcdFx0aWYgKCBtZXRob2RWYWx1ZSAhPT0gaW5zdGFuY2UgJiYgbWV0aG9kVmFsdWUgIT09IHVuZGVmaW5lZCApIHtcblx0XHRcdFx0XHRcdHJldHVyblZhbHVlID0gbWV0aG9kVmFsdWUgJiYgbWV0aG9kVmFsdWUuanF1ZXJ5ID9cblx0XHRcdFx0XHRcdFx0cmV0dXJuVmFsdWUucHVzaFN0YWNrKCBtZXRob2RWYWx1ZS5nZXQoKSApIDpcblx0XHRcdFx0XHRcdFx0bWV0aG9kVmFsdWU7XG5cdFx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9ICk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblxuXHRcdFx0Ly8gQWxsb3cgbXVsdGlwbGUgaGFzaGVzIHRvIGJlIHBhc3NlZCBvbiBpbml0XG5cdFx0XHRpZiAoIGFyZ3MubGVuZ3RoICkge1xuXHRcdFx0XHRvcHRpb25zID0gJC53aWRnZXQuZXh0ZW5kLmFwcGx5KCBudWxsLCBbIG9wdGlvbnMgXS5jb25jYXQoIGFyZ3MgKSApO1xuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLmVhY2goIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgaW5zdGFuY2UgPSAkLmRhdGEoIHRoaXMsIGZ1bGxOYW1lICk7XG5cdFx0XHRcdGlmICggaW5zdGFuY2UgKSB7XG5cdFx0XHRcdFx0aW5zdGFuY2Uub3B0aW9uKCBvcHRpb25zIHx8IHt9ICk7XG5cdFx0XHRcdFx0aWYgKCBpbnN0YW5jZS5faW5pdCApIHtcblx0XHRcdFx0XHRcdGluc3RhbmNlLl9pbml0KCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdCQuZGF0YSggdGhpcywgZnVsbE5hbWUsIG5ldyBvYmplY3QoIG9wdGlvbnMsIHRoaXMgKSApO1xuXHRcdFx0XHR9XG5cdFx0XHR9ICk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHJldHVyblZhbHVlO1xuXHR9O1xufTtcblxuJC5XaWRnZXQgPSBmdW5jdGlvbiggLyogb3B0aW9ucywgZWxlbWVudCAqLyApIHt9O1xuJC5XaWRnZXQuX2NoaWxkQ29uc3RydWN0b3JzID0gW107XG5cbiQuV2lkZ2V0LnByb3RvdHlwZSA9IHtcblx0d2lkZ2V0TmFtZTogXCJ3aWRnZXRcIixcblx0d2lkZ2V0RXZlbnRQcmVmaXg6IFwiXCIsXG5cdGRlZmF1bHRFbGVtZW50OiBcIjxkaXY+XCIsXG5cblx0b3B0aW9uczoge1xuXHRcdGNsYXNzZXM6IHt9LFxuXHRcdGRpc2FibGVkOiBmYWxzZSxcblxuXHRcdC8vIENhbGxiYWNrc1xuXHRcdGNyZWF0ZTogbnVsbFxuXHR9LFxuXG5cdF9jcmVhdGVXaWRnZXQ6IGZ1bmN0aW9uKCBvcHRpb25zLCBlbGVtZW50ICkge1xuXHRcdGVsZW1lbnQgPSAkKCBlbGVtZW50IHx8IHRoaXMuZGVmYXVsdEVsZW1lbnQgfHwgdGhpcyApWyAwIF07XG5cdFx0dGhpcy5lbGVtZW50ID0gJCggZWxlbWVudCApO1xuXHRcdHRoaXMudXVpZCA9IHdpZGdldFV1aWQrKztcblx0XHR0aGlzLmV2ZW50TmFtZXNwYWNlID0gXCIuXCIgKyB0aGlzLndpZGdldE5hbWUgKyB0aGlzLnV1aWQ7XG5cblx0XHR0aGlzLmJpbmRpbmdzID0gJCgpO1xuXHRcdHRoaXMuaG92ZXJhYmxlID0gJCgpO1xuXHRcdHRoaXMuZm9jdXNhYmxlID0gJCgpO1xuXHRcdHRoaXMuY2xhc3Nlc0VsZW1lbnRMb29rdXAgPSB7fTtcblxuXHRcdGlmICggZWxlbWVudCAhPT0gdGhpcyApIHtcblx0XHRcdCQuZGF0YSggZWxlbWVudCwgdGhpcy53aWRnZXRGdWxsTmFtZSwgdGhpcyApO1xuXHRcdFx0dGhpcy5fb24oIHRydWUsIHRoaXMuZWxlbWVudCwge1xuXHRcdFx0XHRyZW1vdmU6IGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHRcdFx0XHRpZiAoIGV2ZW50LnRhcmdldCA9PT0gZWxlbWVudCApIHtcblx0XHRcdFx0XHRcdHRoaXMuZGVzdHJveSgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSApO1xuXHRcdFx0dGhpcy5kb2N1bWVudCA9ICQoIGVsZW1lbnQuc3R5bGUgP1xuXG5cdFx0XHRcdC8vIEVsZW1lbnQgd2l0aGluIHRoZSBkb2N1bWVudFxuXHRcdFx0XHRlbGVtZW50Lm93bmVyRG9jdW1lbnQgOlxuXG5cdFx0XHRcdC8vIEVsZW1lbnQgaXMgd2luZG93IG9yIGRvY3VtZW50XG5cdFx0XHRcdGVsZW1lbnQuZG9jdW1lbnQgfHwgZWxlbWVudCApO1xuXHRcdFx0dGhpcy53aW5kb3cgPSAkKCB0aGlzLmRvY3VtZW50WyAwIF0uZGVmYXVsdFZpZXcgfHwgdGhpcy5kb2N1bWVudFsgMCBdLnBhcmVudFdpbmRvdyApO1xuXHRcdH1cblxuXHRcdHRoaXMub3B0aW9ucyA9ICQud2lkZ2V0LmV4dGVuZCgge30sXG5cdFx0XHR0aGlzLm9wdGlvbnMsXG5cdFx0XHR0aGlzLl9nZXRDcmVhdGVPcHRpb25zKCksXG5cdFx0XHRvcHRpb25zICk7XG5cblx0XHR0aGlzLl9jcmVhdGUoKTtcblxuXHRcdGlmICggdGhpcy5vcHRpb25zLmRpc2FibGVkICkge1xuXHRcdFx0dGhpcy5fc2V0T3B0aW9uRGlzYWJsZWQoIHRoaXMub3B0aW9ucy5kaXNhYmxlZCApO1xuXHRcdH1cblxuXHRcdHRoaXMuX3RyaWdnZXIoIFwiY3JlYXRlXCIsIG51bGwsIHRoaXMuX2dldENyZWF0ZUV2ZW50RGF0YSgpICk7XG5cdFx0dGhpcy5faW5pdCgpO1xuXHR9LFxuXG5cdF9nZXRDcmVhdGVPcHRpb25zOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4ge307XG5cdH0sXG5cblx0X2dldENyZWF0ZUV2ZW50RGF0YTogJC5ub29wLFxuXG5cdF9jcmVhdGU6ICQubm9vcCxcblxuXHRfaW5pdDogJC5ub29wLFxuXG5cdGRlc3Ryb3k6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciB0aGF0ID0gdGhpcztcblxuXHRcdHRoaXMuX2Rlc3Ryb3koKTtcblx0XHQkLmVhY2goIHRoaXMuY2xhc3Nlc0VsZW1lbnRMb29rdXAsIGZ1bmN0aW9uKCBrZXksIHZhbHVlICkge1xuXHRcdFx0dGhhdC5fcmVtb3ZlQ2xhc3MoIHZhbHVlLCBrZXkgKTtcblx0XHR9ICk7XG5cblx0XHQvLyBXZSBjYW4gcHJvYmFibHkgcmVtb3ZlIHRoZSB1bmJpbmQgY2FsbHMgaW4gMi4wXG5cdFx0Ly8gYWxsIGV2ZW50IGJpbmRpbmdzIHNob3VsZCBnbyB0aHJvdWdoIHRoaXMuX29uKClcblx0XHR0aGlzLmVsZW1lbnRcblx0XHRcdC5vZmYoIHRoaXMuZXZlbnROYW1lc3BhY2UgKVxuXHRcdFx0LnJlbW92ZURhdGEoIHRoaXMud2lkZ2V0RnVsbE5hbWUgKTtcblx0XHR0aGlzLndpZGdldCgpXG5cdFx0XHQub2ZmKCB0aGlzLmV2ZW50TmFtZXNwYWNlIClcblx0XHRcdC5yZW1vdmVBdHRyKCBcImFyaWEtZGlzYWJsZWRcIiApO1xuXG5cdFx0Ly8gQ2xlYW4gdXAgZXZlbnRzIGFuZCBzdGF0ZXNcblx0XHR0aGlzLmJpbmRpbmdzLm9mZiggdGhpcy5ldmVudE5hbWVzcGFjZSApO1xuXHR9LFxuXG5cdF9kZXN0cm95OiAkLm5vb3AsXG5cblx0d2lkZ2V0OiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gdGhpcy5lbGVtZW50O1xuXHR9LFxuXG5cdG9wdGlvbjogZnVuY3Rpb24oIGtleSwgdmFsdWUgKSB7XG5cdFx0dmFyIG9wdGlvbnMgPSBrZXk7XG5cdFx0dmFyIHBhcnRzO1xuXHRcdHZhciBjdXJPcHRpb247XG5cdFx0dmFyIGk7XG5cblx0XHRpZiAoIGFyZ3VtZW50cy5sZW5ndGggPT09IDAgKSB7XG5cblx0XHRcdC8vIERvbid0IHJldHVybiBhIHJlZmVyZW5jZSB0byB0aGUgaW50ZXJuYWwgaGFzaFxuXHRcdFx0cmV0dXJuICQud2lkZ2V0LmV4dGVuZCgge30sIHRoaXMub3B0aW9ucyApO1xuXHRcdH1cblxuXHRcdGlmICggdHlwZW9mIGtleSA9PT0gXCJzdHJpbmdcIiApIHtcblxuXHRcdFx0Ly8gSGFuZGxlIG5lc3RlZCBrZXlzLCBlLmcuLCBcImZvby5iYXJcIiA9PiB7IGZvbzogeyBiYXI6IF9fXyB9IH1cblx0XHRcdG9wdGlvbnMgPSB7fTtcblx0XHRcdHBhcnRzID0ga2V5LnNwbGl0KCBcIi5cIiApO1xuXHRcdFx0a2V5ID0gcGFydHMuc2hpZnQoKTtcblx0XHRcdGlmICggcGFydHMubGVuZ3RoICkge1xuXHRcdFx0XHRjdXJPcHRpb24gPSBvcHRpb25zWyBrZXkgXSA9ICQud2lkZ2V0LmV4dGVuZCgge30sIHRoaXMub3B0aW9uc1sga2V5IF0gKTtcblx0XHRcdFx0Zm9yICggaSA9IDA7IGkgPCBwYXJ0cy5sZW5ndGggLSAxOyBpKysgKSB7XG5cdFx0XHRcdFx0Y3VyT3B0aW9uWyBwYXJ0c1sgaSBdIF0gPSBjdXJPcHRpb25bIHBhcnRzWyBpIF0gXSB8fCB7fTtcblx0XHRcdFx0XHRjdXJPcHRpb24gPSBjdXJPcHRpb25bIHBhcnRzWyBpIF0gXTtcblx0XHRcdFx0fVxuXHRcdFx0XHRrZXkgPSBwYXJ0cy5wb3AoKTtcblx0XHRcdFx0aWYgKCBhcmd1bWVudHMubGVuZ3RoID09PSAxICkge1xuXHRcdFx0XHRcdHJldHVybiBjdXJPcHRpb25bIGtleSBdID09PSB1bmRlZmluZWQgPyBudWxsIDogY3VyT3B0aW9uWyBrZXkgXTtcblx0XHRcdFx0fVxuXHRcdFx0XHRjdXJPcHRpb25bIGtleSBdID0gdmFsdWU7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRpZiAoIGFyZ3VtZW50cy5sZW5ndGggPT09IDEgKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMub3B0aW9uc1sga2V5IF0gPT09IHVuZGVmaW5lZCA/IG51bGwgOiB0aGlzLm9wdGlvbnNbIGtleSBdO1xuXHRcdFx0XHR9XG5cdFx0XHRcdG9wdGlvbnNbIGtleSBdID0gdmFsdWU7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dGhpcy5fc2V0T3B0aW9ucyggb3B0aW9ucyApO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cblx0X3NldE9wdGlvbnM6IGZ1bmN0aW9uKCBvcHRpb25zICkge1xuXHRcdHZhciBrZXk7XG5cblx0XHRmb3IgKCBrZXkgaW4gb3B0aW9ucyApIHtcblx0XHRcdHRoaXMuX3NldE9wdGlvbigga2V5LCBvcHRpb25zWyBrZXkgXSApO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXG5cdF9zZXRPcHRpb246IGZ1bmN0aW9uKCBrZXksIHZhbHVlICkge1xuXHRcdGlmICgga2V5ID09PSBcImNsYXNzZXNcIiApIHtcblx0XHRcdHRoaXMuX3NldE9wdGlvbkNsYXNzZXMoIHZhbHVlICk7XG5cdFx0fVxuXG5cdFx0dGhpcy5vcHRpb25zWyBrZXkgXSA9IHZhbHVlO1xuXG5cdFx0aWYgKCBrZXkgPT09IFwiZGlzYWJsZWRcIiApIHtcblx0XHRcdHRoaXMuX3NldE9wdGlvbkRpc2FibGVkKCB2YWx1ZSApO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXG5cdF9zZXRPcHRpb25DbGFzc2VzOiBmdW5jdGlvbiggdmFsdWUgKSB7XG5cdFx0dmFyIGNsYXNzS2V5LCBlbGVtZW50cywgY3VycmVudEVsZW1lbnRzO1xuXG5cdFx0Zm9yICggY2xhc3NLZXkgaW4gdmFsdWUgKSB7XG5cdFx0XHRjdXJyZW50RWxlbWVudHMgPSB0aGlzLmNsYXNzZXNFbGVtZW50TG9va3VwWyBjbGFzc0tleSBdO1xuXHRcdFx0aWYgKCB2YWx1ZVsgY2xhc3NLZXkgXSA9PT0gdGhpcy5vcHRpb25zLmNsYXNzZXNbIGNsYXNzS2V5IF0gfHxcblx0XHRcdFx0XHQhY3VycmVudEVsZW1lbnRzIHx8XG5cdFx0XHRcdFx0IWN1cnJlbnRFbGVtZW50cy5sZW5ndGggKSB7XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBXZSBhcmUgZG9pbmcgdGhpcyB0byBjcmVhdGUgYSBuZXcgalF1ZXJ5IG9iamVjdCBiZWNhdXNlIHRoZSBfcmVtb3ZlQ2xhc3MoKSBjYWxsXG5cdFx0XHQvLyBvbiB0aGUgbmV4dCBsaW5lIGlzIGdvaW5nIHRvIGRlc3Ryb3kgdGhlIHJlZmVyZW5jZSB0byB0aGUgY3VycmVudCBlbGVtZW50cyBiZWluZ1xuXHRcdFx0Ly8gdHJhY2tlZC4gV2UgbmVlZCB0byBzYXZlIGEgY29weSBvZiB0aGlzIGNvbGxlY3Rpb24gc28gdGhhdCB3ZSBjYW4gYWRkIHRoZSBuZXcgY2xhc3Nlc1xuXHRcdFx0Ly8gYmVsb3cuXG5cdFx0XHRlbGVtZW50cyA9ICQoIGN1cnJlbnRFbGVtZW50cy5nZXQoKSApO1xuXHRcdFx0dGhpcy5fcmVtb3ZlQ2xhc3MoIGN1cnJlbnRFbGVtZW50cywgY2xhc3NLZXkgKTtcblxuXHRcdFx0Ly8gV2UgZG9uJ3QgdXNlIF9hZGRDbGFzcygpIGhlcmUsIGJlY2F1c2UgdGhhdCB1c2VzIHRoaXMub3B0aW9ucy5jbGFzc2VzXG5cdFx0XHQvLyBmb3IgZ2VuZXJhdGluZyB0aGUgc3RyaW5nIG9mIGNsYXNzZXMuIFdlIHdhbnQgdG8gdXNlIHRoZSB2YWx1ZSBwYXNzZWQgaW4gZnJvbVxuXHRcdFx0Ly8gX3NldE9wdGlvbigpLCB0aGlzIGlzIHRoZSBuZXcgdmFsdWUgb2YgdGhlIGNsYXNzZXMgb3B0aW9uIHdoaWNoIHdhcyBwYXNzZWQgdG9cblx0XHRcdC8vIF9zZXRPcHRpb24oKS4gV2UgcGFzcyB0aGlzIHZhbHVlIGRpcmVjdGx5IHRvIF9jbGFzc2VzKCkuXG5cdFx0XHRlbGVtZW50cy5hZGRDbGFzcyggdGhpcy5fY2xhc3Nlcygge1xuXHRcdFx0XHRlbGVtZW50OiBlbGVtZW50cyxcblx0XHRcdFx0a2V5czogY2xhc3NLZXksXG5cdFx0XHRcdGNsYXNzZXM6IHZhbHVlLFxuXHRcdFx0XHRhZGQ6IHRydWVcblx0XHRcdH0gKSApO1xuXHRcdH1cblx0fSxcblxuXHRfc2V0T3B0aW9uRGlzYWJsZWQ6IGZ1bmN0aW9uKCB2YWx1ZSApIHtcblx0XHR0aGlzLl90b2dnbGVDbGFzcyggdGhpcy53aWRnZXQoKSwgdGhpcy53aWRnZXRGdWxsTmFtZSArIFwiLWRpc2FibGVkXCIsIG51bGwsICEhdmFsdWUgKTtcblxuXHRcdC8vIElmIHRoZSB3aWRnZXQgaXMgYmVjb21pbmcgZGlzYWJsZWQsIHRoZW4gbm90aGluZyBpcyBpbnRlcmFjdGl2ZVxuXHRcdGlmICggdmFsdWUgKSB7XG5cdFx0XHR0aGlzLl9yZW1vdmVDbGFzcyggdGhpcy5ob3ZlcmFibGUsIG51bGwsIFwidWktc3RhdGUtaG92ZXJcIiApO1xuXHRcdFx0dGhpcy5fcmVtb3ZlQ2xhc3MoIHRoaXMuZm9jdXNhYmxlLCBudWxsLCBcInVpLXN0YXRlLWZvY3VzXCIgKTtcblx0XHR9XG5cdH0sXG5cblx0ZW5hYmxlOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gdGhpcy5fc2V0T3B0aW9ucyggeyBkaXNhYmxlZDogZmFsc2UgfSApO1xuXHR9LFxuXG5cdGRpc2FibGU6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB0aGlzLl9zZXRPcHRpb25zKCB7IGRpc2FibGVkOiB0cnVlIH0gKTtcblx0fSxcblxuXHRfY2xhc3NlczogZnVuY3Rpb24oIG9wdGlvbnMgKSB7XG5cdFx0dmFyIGZ1bGwgPSBbXTtcblx0XHR2YXIgdGhhdCA9IHRoaXM7XG5cblx0XHRvcHRpb25zID0gJC5leHRlbmQoIHtcblx0XHRcdGVsZW1lbnQ6IHRoaXMuZWxlbWVudCxcblx0XHRcdGNsYXNzZXM6IHRoaXMub3B0aW9ucy5jbGFzc2VzIHx8IHt9XG5cdFx0fSwgb3B0aW9ucyApO1xuXG5cdFx0ZnVuY3Rpb24gcHJvY2Vzc0NsYXNzU3RyaW5nKCBjbGFzc2VzLCBjaGVja09wdGlvbiApIHtcblx0XHRcdHZhciBjdXJyZW50LCBpO1xuXHRcdFx0Zm9yICggaSA9IDA7IGkgPCBjbGFzc2VzLmxlbmd0aDsgaSsrICkge1xuXHRcdFx0XHRjdXJyZW50ID0gdGhhdC5jbGFzc2VzRWxlbWVudExvb2t1cFsgY2xhc3Nlc1sgaSBdIF0gfHwgJCgpO1xuXHRcdFx0XHRpZiAoIG9wdGlvbnMuYWRkICkge1xuXHRcdFx0XHRcdGN1cnJlbnQgPSAkKCAkLnVuaXF1ZSggY3VycmVudC5nZXQoKS5jb25jYXQoIG9wdGlvbnMuZWxlbWVudC5nZXQoKSApICkgKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRjdXJyZW50ID0gJCggY3VycmVudC5ub3QoIG9wdGlvbnMuZWxlbWVudCApLmdldCgpICk7XG5cdFx0XHRcdH1cblx0XHRcdFx0dGhhdC5jbGFzc2VzRWxlbWVudExvb2t1cFsgY2xhc3Nlc1sgaSBdIF0gPSBjdXJyZW50O1xuXHRcdFx0XHRmdWxsLnB1c2goIGNsYXNzZXNbIGkgXSApO1xuXHRcdFx0XHRpZiAoIGNoZWNrT3B0aW9uICYmIG9wdGlvbnMuY2xhc3Nlc1sgY2xhc3Nlc1sgaSBdIF0gKSB7XG5cdFx0XHRcdFx0ZnVsbC5wdXNoKCBvcHRpb25zLmNsYXNzZXNbIGNsYXNzZXNbIGkgXSBdICk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHR0aGlzLl9vbiggb3B0aW9ucy5lbGVtZW50LCB7XG5cdFx0XHRcInJlbW92ZVwiOiBcIl91bnRyYWNrQ2xhc3Nlc0VsZW1lbnRcIlxuXHRcdH0gKTtcblxuXHRcdGlmICggb3B0aW9ucy5rZXlzICkge1xuXHRcdFx0cHJvY2Vzc0NsYXNzU3RyaW5nKCBvcHRpb25zLmtleXMubWF0Y2goIC9cXFMrL2cgKSB8fCBbXSwgdHJ1ZSApO1xuXHRcdH1cblx0XHRpZiAoIG9wdGlvbnMuZXh0cmEgKSB7XG5cdFx0XHRwcm9jZXNzQ2xhc3NTdHJpbmcoIG9wdGlvbnMuZXh0cmEubWF0Y2goIC9cXFMrL2cgKSB8fCBbXSApO1xuXHRcdH1cblxuXHRcdHJldHVybiBmdWxsLmpvaW4oIFwiIFwiICk7XG5cdH0sXG5cblx0X3VudHJhY2tDbGFzc2VzRWxlbWVudDogZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdHZhciB0aGF0ID0gdGhpcztcblx0XHQkLmVhY2goIHRoYXQuY2xhc3Nlc0VsZW1lbnRMb29rdXAsIGZ1bmN0aW9uKCBrZXksIHZhbHVlICkge1xuXHRcdFx0aWYgKCAkLmluQXJyYXkoIGV2ZW50LnRhcmdldCwgdmFsdWUgKSAhPT0gLTEgKSB7XG5cdFx0XHRcdHRoYXQuY2xhc3Nlc0VsZW1lbnRMb29rdXBbIGtleSBdID0gJCggdmFsdWUubm90KCBldmVudC50YXJnZXQgKS5nZXQoKSApO1xuXHRcdFx0fVxuXHRcdH0gKTtcblx0fSxcblxuXHRfcmVtb3ZlQ2xhc3M6IGZ1bmN0aW9uKCBlbGVtZW50LCBrZXlzLCBleHRyYSApIHtcblx0XHRyZXR1cm4gdGhpcy5fdG9nZ2xlQ2xhc3MoIGVsZW1lbnQsIGtleXMsIGV4dHJhLCBmYWxzZSApO1xuXHR9LFxuXG5cdF9hZGRDbGFzczogZnVuY3Rpb24oIGVsZW1lbnQsIGtleXMsIGV4dHJhICkge1xuXHRcdHJldHVybiB0aGlzLl90b2dnbGVDbGFzcyggZWxlbWVudCwga2V5cywgZXh0cmEsIHRydWUgKTtcblx0fSxcblxuXHRfdG9nZ2xlQ2xhc3M6IGZ1bmN0aW9uKCBlbGVtZW50LCBrZXlzLCBleHRyYSwgYWRkICkge1xuXHRcdGFkZCA9ICggdHlwZW9mIGFkZCA9PT0gXCJib29sZWFuXCIgKSA/IGFkZCA6IGV4dHJhO1xuXHRcdHZhciBzaGlmdCA9ICggdHlwZW9mIGVsZW1lbnQgPT09IFwic3RyaW5nXCIgfHwgZWxlbWVudCA9PT0gbnVsbCApLFxuXHRcdFx0b3B0aW9ucyA9IHtcblx0XHRcdFx0ZXh0cmE6IHNoaWZ0ID8ga2V5cyA6IGV4dHJhLFxuXHRcdFx0XHRrZXlzOiBzaGlmdCA/IGVsZW1lbnQgOiBrZXlzLFxuXHRcdFx0XHRlbGVtZW50OiBzaGlmdCA/IHRoaXMuZWxlbWVudCA6IGVsZW1lbnQsXG5cdFx0XHRcdGFkZDogYWRkXG5cdFx0XHR9O1xuXHRcdG9wdGlvbnMuZWxlbWVudC50b2dnbGVDbGFzcyggdGhpcy5fY2xhc3Nlcyggb3B0aW9ucyApLCBhZGQgKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblxuXHRfb246IGZ1bmN0aW9uKCBzdXBwcmVzc0Rpc2FibGVkQ2hlY2ssIGVsZW1lbnQsIGhhbmRsZXJzICkge1xuXHRcdHZhciBkZWxlZ2F0ZUVsZW1lbnQ7XG5cdFx0dmFyIGluc3RhbmNlID0gdGhpcztcblxuXHRcdC8vIE5vIHN1cHByZXNzRGlzYWJsZWRDaGVjayBmbGFnLCBzaHVmZmxlIGFyZ3VtZW50c1xuXHRcdGlmICggdHlwZW9mIHN1cHByZXNzRGlzYWJsZWRDaGVjayAhPT0gXCJib29sZWFuXCIgKSB7XG5cdFx0XHRoYW5kbGVycyA9IGVsZW1lbnQ7XG5cdFx0XHRlbGVtZW50ID0gc3VwcHJlc3NEaXNhYmxlZENoZWNrO1xuXHRcdFx0c3VwcHJlc3NEaXNhYmxlZENoZWNrID0gZmFsc2U7XG5cdFx0fVxuXG5cdFx0Ly8gTm8gZWxlbWVudCBhcmd1bWVudCwgc2h1ZmZsZSBhbmQgdXNlIHRoaXMuZWxlbWVudFxuXHRcdGlmICggIWhhbmRsZXJzICkge1xuXHRcdFx0aGFuZGxlcnMgPSBlbGVtZW50O1xuXHRcdFx0ZWxlbWVudCA9IHRoaXMuZWxlbWVudDtcblx0XHRcdGRlbGVnYXRlRWxlbWVudCA9IHRoaXMud2lkZ2V0KCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGVsZW1lbnQgPSBkZWxlZ2F0ZUVsZW1lbnQgPSAkKCBlbGVtZW50ICk7XG5cdFx0XHR0aGlzLmJpbmRpbmdzID0gdGhpcy5iaW5kaW5ncy5hZGQoIGVsZW1lbnQgKTtcblx0XHR9XG5cblx0XHQkLmVhY2goIGhhbmRsZXJzLCBmdW5jdGlvbiggZXZlbnQsIGhhbmRsZXIgKSB7XG5cdFx0XHRmdW5jdGlvbiBoYW5kbGVyUHJveHkoKSB7XG5cblx0XHRcdFx0Ly8gQWxsb3cgd2lkZ2V0cyB0byBjdXN0b21pemUgdGhlIGRpc2FibGVkIGhhbmRsaW5nXG5cdFx0XHRcdC8vIC0gZGlzYWJsZWQgYXMgYW4gYXJyYXkgaW5zdGVhZCBvZiBib29sZWFuXG5cdFx0XHRcdC8vIC0gZGlzYWJsZWQgY2xhc3MgYXMgbWV0aG9kIGZvciBkaXNhYmxpbmcgaW5kaXZpZHVhbCBwYXJ0c1xuXHRcdFx0XHRpZiAoICFzdXBwcmVzc0Rpc2FibGVkQ2hlY2sgJiZcblx0XHRcdFx0XHRcdCggaW5zdGFuY2Uub3B0aW9ucy5kaXNhYmxlZCA9PT0gdHJ1ZSB8fFxuXHRcdFx0XHRcdFx0JCggdGhpcyApLmhhc0NsYXNzKCBcInVpLXN0YXRlLWRpc2FibGVkXCIgKSApICkge1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gKCB0eXBlb2YgaGFuZGxlciA9PT0gXCJzdHJpbmdcIiA/IGluc3RhbmNlWyBoYW5kbGVyIF0gOiBoYW5kbGVyIClcblx0XHRcdFx0XHQuYXBwbHkoIGluc3RhbmNlLCBhcmd1bWVudHMgKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gQ29weSB0aGUgZ3VpZCBzbyBkaXJlY3QgdW5iaW5kaW5nIHdvcmtzXG5cdFx0XHRpZiAoIHR5cGVvZiBoYW5kbGVyICE9PSBcInN0cmluZ1wiICkge1xuXHRcdFx0XHRoYW5kbGVyUHJveHkuZ3VpZCA9IGhhbmRsZXIuZ3VpZCA9XG5cdFx0XHRcdFx0aGFuZGxlci5ndWlkIHx8IGhhbmRsZXJQcm94eS5ndWlkIHx8ICQuZ3VpZCsrO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgbWF0Y2ggPSBldmVudC5tYXRjaCggL14oW1xcdzotXSopXFxzKiguKikkLyApO1xuXHRcdFx0dmFyIGV2ZW50TmFtZSA9IG1hdGNoWyAxIF0gKyBpbnN0YW5jZS5ldmVudE5hbWVzcGFjZTtcblx0XHRcdHZhciBzZWxlY3RvciA9IG1hdGNoWyAyIF07XG5cblx0XHRcdGlmICggc2VsZWN0b3IgKSB7XG5cdFx0XHRcdGRlbGVnYXRlRWxlbWVudC5vbiggZXZlbnROYW1lLCBzZWxlY3RvciwgaGFuZGxlclByb3h5ICk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRlbGVtZW50Lm9uKCBldmVudE5hbWUsIGhhbmRsZXJQcm94eSApO1xuXHRcdFx0fVxuXHRcdH0gKTtcblx0fSxcblxuXHRfb2ZmOiBmdW5jdGlvbiggZWxlbWVudCwgZXZlbnROYW1lICkge1xuXHRcdGV2ZW50TmFtZSA9ICggZXZlbnROYW1lIHx8IFwiXCIgKS5zcGxpdCggXCIgXCIgKS5qb2luKCB0aGlzLmV2ZW50TmFtZXNwYWNlICsgXCIgXCIgKSArXG5cdFx0XHR0aGlzLmV2ZW50TmFtZXNwYWNlO1xuXHRcdGVsZW1lbnQub2ZmKCBldmVudE5hbWUgKS5vZmYoIGV2ZW50TmFtZSApO1xuXG5cdFx0Ly8gQ2xlYXIgdGhlIHN0YWNrIHRvIGF2b2lkIG1lbW9yeSBsZWFrcyAoIzEwMDU2KVxuXHRcdHRoaXMuYmluZGluZ3MgPSAkKCB0aGlzLmJpbmRpbmdzLm5vdCggZWxlbWVudCApLmdldCgpICk7XG5cdFx0dGhpcy5mb2N1c2FibGUgPSAkKCB0aGlzLmZvY3VzYWJsZS5ub3QoIGVsZW1lbnQgKS5nZXQoKSApO1xuXHRcdHRoaXMuaG92ZXJhYmxlID0gJCggdGhpcy5ob3ZlcmFibGUubm90KCBlbGVtZW50ICkuZ2V0KCkgKTtcblx0fSxcblxuXHRfZGVsYXk6IGZ1bmN0aW9uKCBoYW5kbGVyLCBkZWxheSApIHtcblx0XHRmdW5jdGlvbiBoYW5kbGVyUHJveHkoKSB7XG5cdFx0XHRyZXR1cm4gKCB0eXBlb2YgaGFuZGxlciA9PT0gXCJzdHJpbmdcIiA/IGluc3RhbmNlWyBoYW5kbGVyIF0gOiBoYW5kbGVyIClcblx0XHRcdFx0LmFwcGx5KCBpbnN0YW5jZSwgYXJndW1lbnRzICk7XG5cdFx0fVxuXHRcdHZhciBpbnN0YW5jZSA9IHRoaXM7XG5cdFx0cmV0dXJuIHNldFRpbWVvdXQoIGhhbmRsZXJQcm94eSwgZGVsYXkgfHwgMCApO1xuXHR9LFxuXG5cdF9ob3ZlcmFibGU6IGZ1bmN0aW9uKCBlbGVtZW50ICkge1xuXHRcdHRoaXMuaG92ZXJhYmxlID0gdGhpcy5ob3ZlcmFibGUuYWRkKCBlbGVtZW50ICk7XG5cdFx0dGhpcy5fb24oIGVsZW1lbnQsIHtcblx0XHRcdG1vdXNlZW50ZXI6IGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHRcdFx0dGhpcy5fYWRkQ2xhc3MoICQoIGV2ZW50LmN1cnJlbnRUYXJnZXQgKSwgbnVsbCwgXCJ1aS1zdGF0ZS1ob3ZlclwiICk7XG5cdFx0XHR9LFxuXHRcdFx0bW91c2VsZWF2ZTogZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdFx0XHR0aGlzLl9yZW1vdmVDbGFzcyggJCggZXZlbnQuY3VycmVudFRhcmdldCApLCBudWxsLCBcInVpLXN0YXRlLWhvdmVyXCIgKTtcblx0XHRcdH1cblx0XHR9ICk7XG5cdH0sXG5cblx0X2ZvY3VzYWJsZTogZnVuY3Rpb24oIGVsZW1lbnQgKSB7XG5cdFx0dGhpcy5mb2N1c2FibGUgPSB0aGlzLmZvY3VzYWJsZS5hZGQoIGVsZW1lbnQgKTtcblx0XHR0aGlzLl9vbiggZWxlbWVudCwge1xuXHRcdFx0Zm9jdXNpbjogZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdFx0XHR0aGlzLl9hZGRDbGFzcyggJCggZXZlbnQuY3VycmVudFRhcmdldCApLCBudWxsLCBcInVpLXN0YXRlLWZvY3VzXCIgKTtcblx0XHRcdH0sXG5cdFx0XHRmb2N1c291dDogZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdFx0XHR0aGlzLl9yZW1vdmVDbGFzcyggJCggZXZlbnQuY3VycmVudFRhcmdldCApLCBudWxsLCBcInVpLXN0YXRlLWZvY3VzXCIgKTtcblx0XHRcdH1cblx0XHR9ICk7XG5cdH0sXG5cblx0X3RyaWdnZXI6IGZ1bmN0aW9uKCB0eXBlLCBldmVudCwgZGF0YSApIHtcblx0XHR2YXIgcHJvcCwgb3JpZztcblx0XHR2YXIgY2FsbGJhY2sgPSB0aGlzLm9wdGlvbnNbIHR5cGUgXTtcblxuXHRcdGRhdGEgPSBkYXRhIHx8IHt9O1xuXHRcdGV2ZW50ID0gJC5FdmVudCggZXZlbnQgKTtcblx0XHRldmVudC50eXBlID0gKCB0eXBlID09PSB0aGlzLndpZGdldEV2ZW50UHJlZml4ID9cblx0XHRcdHR5cGUgOlxuXHRcdFx0dGhpcy53aWRnZXRFdmVudFByZWZpeCArIHR5cGUgKS50b0xvd2VyQ2FzZSgpO1xuXG5cdFx0Ly8gVGhlIG9yaWdpbmFsIGV2ZW50IG1heSBjb21lIGZyb20gYW55IGVsZW1lbnRcblx0XHQvLyBzbyB3ZSBuZWVkIHRvIHJlc2V0IHRoZSB0YXJnZXQgb24gdGhlIG5ldyBldmVudFxuXHRcdGV2ZW50LnRhcmdldCA9IHRoaXMuZWxlbWVudFsgMCBdO1xuXG5cdFx0Ly8gQ29weSBvcmlnaW5hbCBldmVudCBwcm9wZXJ0aWVzIG92ZXIgdG8gdGhlIG5ldyBldmVudFxuXHRcdG9yaWcgPSBldmVudC5vcmlnaW5hbEV2ZW50O1xuXHRcdGlmICggb3JpZyApIHtcblx0XHRcdGZvciAoIHByb3AgaW4gb3JpZyApIHtcblx0XHRcdFx0aWYgKCAhKCBwcm9wIGluIGV2ZW50ICkgKSB7XG5cdFx0XHRcdFx0ZXZlbnRbIHByb3AgXSA9IG9yaWdbIHByb3AgXTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHRoaXMuZWxlbWVudC50cmlnZ2VyKCBldmVudCwgZGF0YSApO1xuXHRcdHJldHVybiAhKCAkLmlzRnVuY3Rpb24oIGNhbGxiYWNrICkgJiZcblx0XHRcdGNhbGxiYWNrLmFwcGx5KCB0aGlzLmVsZW1lbnRbIDAgXSwgWyBldmVudCBdLmNvbmNhdCggZGF0YSApICkgPT09IGZhbHNlIHx8XG5cdFx0XHRldmVudC5pc0RlZmF1bHRQcmV2ZW50ZWQoKSApO1xuXHR9XG59O1xuXG4kLmVhY2goIHsgc2hvdzogXCJmYWRlSW5cIiwgaGlkZTogXCJmYWRlT3V0XCIgfSwgZnVuY3Rpb24oIG1ldGhvZCwgZGVmYXVsdEVmZmVjdCApIHtcblx0JC5XaWRnZXQucHJvdG90eXBlWyBcIl9cIiArIG1ldGhvZCBdID0gZnVuY3Rpb24oIGVsZW1lbnQsIG9wdGlvbnMsIGNhbGxiYWNrICkge1xuXHRcdGlmICggdHlwZW9mIG9wdGlvbnMgPT09IFwic3RyaW5nXCIgKSB7XG5cdFx0XHRvcHRpb25zID0geyBlZmZlY3Q6IG9wdGlvbnMgfTtcblx0XHR9XG5cblx0XHR2YXIgaGFzT3B0aW9ucztcblx0XHR2YXIgZWZmZWN0TmFtZSA9ICFvcHRpb25zID9cblx0XHRcdG1ldGhvZCA6XG5cdFx0XHRvcHRpb25zID09PSB0cnVlIHx8IHR5cGVvZiBvcHRpb25zID09PSBcIm51bWJlclwiID9cblx0XHRcdFx0ZGVmYXVsdEVmZmVjdCA6XG5cdFx0XHRcdG9wdGlvbnMuZWZmZWN0IHx8IGRlZmF1bHRFZmZlY3Q7XG5cblx0XHRvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblx0XHRpZiAoIHR5cGVvZiBvcHRpb25zID09PSBcIm51bWJlclwiICkge1xuXHRcdFx0b3B0aW9ucyA9IHsgZHVyYXRpb246IG9wdGlvbnMgfTtcblx0XHR9XG5cblx0XHRoYXNPcHRpb25zID0gISQuaXNFbXB0eU9iamVjdCggb3B0aW9ucyApO1xuXHRcdG9wdGlvbnMuY29tcGxldGUgPSBjYWxsYmFjaztcblxuXHRcdGlmICggb3B0aW9ucy5kZWxheSApIHtcblx0XHRcdGVsZW1lbnQuZGVsYXkoIG9wdGlvbnMuZGVsYXkgKTtcblx0XHR9XG5cblx0XHRpZiAoIGhhc09wdGlvbnMgJiYgJC5lZmZlY3RzICYmICQuZWZmZWN0cy5lZmZlY3RbIGVmZmVjdE5hbWUgXSApIHtcblx0XHRcdGVsZW1lbnRbIG1ldGhvZCBdKCBvcHRpb25zICk7XG5cdFx0fSBlbHNlIGlmICggZWZmZWN0TmFtZSAhPT0gbWV0aG9kICYmIGVsZW1lbnRbIGVmZmVjdE5hbWUgXSApIHtcblx0XHRcdGVsZW1lbnRbIGVmZmVjdE5hbWUgXSggb3B0aW9ucy5kdXJhdGlvbiwgb3B0aW9ucy5lYXNpbmcsIGNhbGxiYWNrICk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGVsZW1lbnQucXVldWUoIGZ1bmN0aW9uKCBuZXh0ICkge1xuXHRcdFx0XHQkKCB0aGlzIClbIG1ldGhvZCBdKCk7XG5cdFx0XHRcdGlmICggY2FsbGJhY2sgKSB7XG5cdFx0XHRcdFx0Y2FsbGJhY2suY2FsbCggZWxlbWVudFsgMCBdICk7XG5cdFx0XHRcdH1cblx0XHRcdFx0bmV4dCgpO1xuXHRcdFx0fSApO1xuXHRcdH1cblx0fTtcbn0gKTtcblxucmV0dXJuICQud2lkZ2V0O1xuXG59ICkgKTtcbiIsIiggZnVuY3Rpb24oIGZhY3RvcnkgKSB7XG5cdGlmICggdHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQgKSB7XG5cblx0XHQvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXG5cdFx0ZGVmaW5lKCBbIFwianF1ZXJ5XCIgXSwgZmFjdG9yeSApO1xuXHR9IGVsc2Uge1xuXG5cdFx0Ly8gQnJvd3NlciBnbG9iYWxzXG5cdFx0ZmFjdG9yeSggalF1ZXJ5ICk7XG5cdH1cbn0gKCBmdW5jdGlvbiggJCApIHtcblxuJC51aSA9ICQudWkgfHwge307XG5cbnJldHVybiAkLnVpLnZlcnNpb24gPSBcIjEuMTIuMVwiO1xuXG59ICkgKTtcbiIsIi8qIVxuICogalF1ZXJ5IFVJIFNjcm9sbCBQYXJlbnQgMS4xMi4xXG4gKiBodHRwOi8vanF1ZXJ5dWkuY29tXG4gKlxuICogQ29weXJpZ2h0IGpRdWVyeSBGb3VuZGF0aW9uIGFuZCBvdGhlciBjb250cmlidXRvcnNcbiAqIFJlbGVhc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZS5cbiAqIGh0dHA6Ly9qcXVlcnkub3JnL2xpY2Vuc2VcbiAqL1xuXG4vLz4+bGFiZWw6IHNjcm9sbFBhcmVudFxuLy8+Pmdyb3VwOiBDb3JlXG4vLz4+ZGVzY3JpcHRpb246IEdldCB0aGUgY2xvc2VzdCBhbmNlc3RvciBlbGVtZW50IHRoYXQgaXMgc2Nyb2xsYWJsZS5cbi8vPj5kb2NzOiBodHRwOi8vYXBpLmpxdWVyeXVpLmNvbS9zY3JvbGxQYXJlbnQvXG5cbiggZnVuY3Rpb24oIGZhY3RvcnkgKSB7XG5cdGlmICggdHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQgKSB7XG5cblx0XHQvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXG5cdFx0ZGVmaW5lKCBbIFwianF1ZXJ5XCIsIFwiLi92ZXJzaW9uXCIgXSwgZmFjdG9yeSApO1xuXHR9IGVsc2Uge1xuXG5cdFx0Ly8gQnJvd3NlciBnbG9iYWxzXG5cdFx0ZmFjdG9yeSggalF1ZXJ5ICk7XG5cdH1cbn0gKCBmdW5jdGlvbiggJCApIHtcblxucmV0dXJuICQuZm4uc2Nyb2xsUGFyZW50ID0gZnVuY3Rpb24oIGluY2x1ZGVIaWRkZW4gKSB7XG5cdHZhciBwb3NpdGlvbiA9IHRoaXMuY3NzKCBcInBvc2l0aW9uXCIgKSxcblx0XHRleGNsdWRlU3RhdGljUGFyZW50ID0gcG9zaXRpb24gPT09IFwiYWJzb2x1dGVcIixcblx0XHRvdmVyZmxvd1JlZ2V4ID0gaW5jbHVkZUhpZGRlbiA/IC8oYXV0b3xzY3JvbGx8aGlkZGVuKS8gOiAvKGF1dG98c2Nyb2xsKS8sXG5cdFx0c2Nyb2xsUGFyZW50ID0gdGhpcy5wYXJlbnRzKCkuZmlsdGVyKCBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBwYXJlbnQgPSAkKCB0aGlzICk7XG5cdFx0XHRpZiAoIGV4Y2x1ZGVTdGF0aWNQYXJlbnQgJiYgcGFyZW50LmNzcyggXCJwb3NpdGlvblwiICkgPT09IFwic3RhdGljXCIgKSB7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBvdmVyZmxvd1JlZ2V4LnRlc3QoIHBhcmVudC5jc3MoIFwib3ZlcmZsb3dcIiApICsgcGFyZW50LmNzcyggXCJvdmVyZmxvdy15XCIgKSArXG5cdFx0XHRcdHBhcmVudC5jc3MoIFwib3ZlcmZsb3cteFwiICkgKTtcblx0XHR9ICkuZXEoIDAgKTtcblxuXHRyZXR1cm4gcG9zaXRpb24gPT09IFwiZml4ZWRcIiB8fCAhc2Nyb2xsUGFyZW50Lmxlbmd0aCA/XG5cdFx0JCggdGhpc1sgMCBdLm93bmVyRG9jdW1lbnQgfHwgZG9jdW1lbnQgKSA6XG5cdFx0c2Nyb2xsUGFyZW50O1xufTtcblxufSApICk7XG4iLCIoIGZ1bmN0aW9uKCBmYWN0b3J5ICkge1xuXHRpZiAoIHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kICkge1xuXG5cdFx0Ly8gQU1ELiBSZWdpc3RlciBhcyBhbiBhbm9ueW1vdXMgbW9kdWxlLlxuXHRcdGRlZmluZSggWyBcImpxdWVyeVwiLCBcIi4vdmVyc2lvblwiIF0sIGZhY3RvcnkgKTtcblx0fSBlbHNlIHtcblxuXHRcdC8vIEJyb3dzZXIgZ2xvYmFsc1xuXHRcdGZhY3RvcnkoIGpRdWVyeSApO1xuXHR9XG59ICggZnVuY3Rpb24oICQgKSB7XG5yZXR1cm4gJC51aS5zYWZlQmx1ciA9IGZ1bmN0aW9uKCBlbGVtZW50ICkge1xuXG5cdC8vIFN1cHBvcnQ6IElFOSAtIDEwIG9ubHlcblx0Ly8gSWYgdGhlIDxib2R5PiBpcyBibHVycmVkLCBJRSB3aWxsIHN3aXRjaCB3aW5kb3dzLCBzZWUgIzk0MjBcblx0aWYgKCBlbGVtZW50ICYmIGVsZW1lbnQubm9kZU5hbWUudG9Mb3dlckNhc2UoKSAhPT0gXCJib2R5XCIgKSB7XG5cdFx0JCggZWxlbWVudCApLnRyaWdnZXIoIFwiYmx1clwiICk7XG5cdH1cbn07XG5cbn0gKSApO1xuIiwiKCBmdW5jdGlvbiggZmFjdG9yeSApIHtcblx0aWYgKCB0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCApIHtcblxuXHRcdC8vIEFNRC4gUmVnaXN0ZXIgYXMgYW4gYW5vbnltb3VzIG1vZHVsZS5cblx0XHRkZWZpbmUoIFsgXCJqcXVlcnlcIiwgXCIuL3ZlcnNpb25cIiBdLCBmYWN0b3J5ICk7XG5cdH0gZWxzZSB7XG5cblx0XHQvLyBCcm93c2VyIGdsb2JhbHNcblx0XHRmYWN0b3J5KCBqUXVlcnkgKTtcblx0fVxufSAoIGZ1bmN0aW9uKCAkICkge1xucmV0dXJuICQudWkuc2FmZUFjdGl2ZUVsZW1lbnQgPSBmdW5jdGlvbiggZG9jdW1lbnQgKSB7XG5cdHZhciBhY3RpdmVFbGVtZW50O1xuXG5cdC8vIFN1cHBvcnQ6IElFIDkgb25seVxuXHQvLyBJRTkgdGhyb3dzIGFuIFwiVW5zcGVjaWZpZWQgZXJyb3JcIiBhY2Nlc3NpbmcgZG9jdW1lbnQuYWN0aXZlRWxlbWVudCBmcm9tIGFuIDxpZnJhbWU+XG5cdHRyeSB7XG5cdFx0YWN0aXZlRWxlbWVudCA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQ7XG5cdH0gY2F0Y2ggKCBlcnJvciApIHtcblx0XHRhY3RpdmVFbGVtZW50ID0gZG9jdW1lbnQuYm9keTtcblx0fVxuXG5cdC8vIFN1cHBvcnQ6IElFIDkgLSAxMSBvbmx5XG5cdC8vIElFIG1heSByZXR1cm4gbnVsbCBpbnN0ZWFkIG9mIGFuIGVsZW1lbnRcblx0Ly8gSW50ZXJlc3RpbmdseSwgdGhpcyBvbmx5IHNlZW1zIHRvIG9jY3VyIHdoZW4gTk9UIGluIGFuIGlmcmFtZVxuXHRpZiAoICFhY3RpdmVFbGVtZW50ICkge1xuXHRcdGFjdGl2ZUVsZW1lbnQgPSBkb2N1bWVudC5ib2R5O1xuXHR9XG5cblx0Ly8gU3VwcG9ydDogSUUgMTEgb25seVxuXHQvLyBJRTExIHJldHVybnMgYSBzZWVtaW5nbHkgZW1wdHkgb2JqZWN0IGluIHNvbWUgY2FzZXMgd2hlbiBhY2Nlc3Npbmdcblx0Ly8gZG9jdW1lbnQuYWN0aXZlRWxlbWVudCBmcm9tIGFuIDxpZnJhbWU+XG5cdGlmICggIWFjdGl2ZUVsZW1lbnQubm9kZU5hbWUgKSB7XG5cdFx0YWN0aXZlRWxlbWVudCA9IGRvY3VtZW50LmJvZHk7XG5cdH1cblxuXHRyZXR1cm4gYWN0aXZlRWxlbWVudDtcbn07XG5cbn0gKSApO1xuIiwiKCBmdW5jdGlvbiggZmFjdG9yeSApIHtcblx0aWYgKCB0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCApIHtcblxuXHRcdC8vIEFNRC4gUmVnaXN0ZXIgYXMgYW4gYW5vbnltb3VzIG1vZHVsZS5cblx0XHRkZWZpbmUoIFsgXCJqcXVlcnlcIiwgXCIuL3ZlcnNpb25cIiBdLCBmYWN0b3J5ICk7XG5cdH0gZWxzZSB7XG5cblx0XHQvLyBCcm93c2VyIGdsb2JhbHNcblx0XHRmYWN0b3J5KCBqUXVlcnkgKTtcblx0fVxufSAoIGZ1bmN0aW9uKCAkICkge1xuXG4vLyAkLnVpLnBsdWdpbiBpcyBkZXByZWNhdGVkLiBVc2UgJC53aWRnZXQoKSBleHRlbnNpb25zIGluc3RlYWQuXG5yZXR1cm4gJC51aS5wbHVnaW4gPSB7XG5cdGFkZDogZnVuY3Rpb24oIG1vZHVsZSwgb3B0aW9uLCBzZXQgKSB7XG5cdFx0dmFyIGksXG5cdFx0XHRwcm90byA9ICQudWlbIG1vZHVsZSBdLnByb3RvdHlwZTtcblx0XHRmb3IgKCBpIGluIHNldCApIHtcblx0XHRcdHByb3RvLnBsdWdpbnNbIGkgXSA9IHByb3RvLnBsdWdpbnNbIGkgXSB8fCBbXTtcblx0XHRcdHByb3RvLnBsdWdpbnNbIGkgXS5wdXNoKCBbIG9wdGlvbiwgc2V0WyBpIF0gXSApO1xuXHRcdH1cblx0fSxcblx0Y2FsbDogZnVuY3Rpb24oIGluc3RhbmNlLCBuYW1lLCBhcmdzLCBhbGxvd0Rpc2Nvbm5lY3RlZCApIHtcblx0XHR2YXIgaSxcblx0XHRcdHNldCA9IGluc3RhbmNlLnBsdWdpbnNbIG5hbWUgXTtcblxuXHRcdGlmICggIXNldCApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRpZiAoICFhbGxvd0Rpc2Nvbm5lY3RlZCAmJiAoICFpbnN0YW5jZS5lbGVtZW50WyAwIF0ucGFyZW50Tm9kZSB8fFxuXHRcdFx0XHRpbnN0YW5jZS5lbGVtZW50WyAwIF0ucGFyZW50Tm9kZS5ub2RlVHlwZSA9PT0gMTEgKSApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRmb3IgKCBpID0gMDsgaSA8IHNldC5sZW5ndGg7IGkrKyApIHtcblx0XHRcdGlmICggaW5zdGFuY2Uub3B0aW9uc1sgc2V0WyBpIF1bIDAgXSBdICkge1xuXHRcdFx0XHRzZXRbIGkgXVsgMSBdLmFwcGx5KCBpbnN0YW5jZS5lbGVtZW50LCBhcmdzICk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59O1xuXG59ICkgKTtcbiIsIiggZnVuY3Rpb24oIGZhY3RvcnkgKSB7XG5cdGlmICggdHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQgKSB7XG5cblx0XHQvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXG5cdFx0ZGVmaW5lKCBbIFwianF1ZXJ5XCIsIFwiLi92ZXJzaW9uXCIgXSwgZmFjdG9yeSApO1xuXHR9IGVsc2Uge1xuXG5cdFx0Ly8gQnJvd3NlciBnbG9iYWxzXG5cdFx0ZmFjdG9yeSggalF1ZXJ5ICk7XG5cdH1cbn0gKCBmdW5jdGlvbiggJCApIHtcblxuLy8gVGhpcyBmaWxlIGlzIGRlcHJlY2F0ZWRcbnJldHVybiAkLnVpLmllID0gISEvbXNpZSBbXFx3Ll0rLy5leGVjKCBuYXZpZ2F0b3IudXNlckFnZW50LnRvTG93ZXJDYXNlKCkgKTtcbn0gKSApO1xuIiwiLyohXG4gKiBqUXVlcnkgVUkgOmRhdGEgMS4xMi4xXG4gKiBodHRwOi8vanF1ZXJ5dWkuY29tXG4gKlxuICogQ29weXJpZ2h0IGpRdWVyeSBGb3VuZGF0aW9uIGFuZCBvdGhlciBjb250cmlidXRvcnNcbiAqIFJlbGVhc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZS5cbiAqIGh0dHA6Ly9qcXVlcnkub3JnL2xpY2Vuc2VcbiAqL1xuXG4vLz4+bGFiZWw6IDpkYXRhIFNlbGVjdG9yXG4vLz4+Z3JvdXA6IENvcmVcbi8vPj5kZXNjcmlwdGlvbjogU2VsZWN0cyBlbGVtZW50cyB3aGljaCBoYXZlIGRhdGEgc3RvcmVkIHVuZGVyIHRoZSBzcGVjaWZpZWQga2V5LlxuLy8+PmRvY3M6IGh0dHA6Ly9hcGkuanF1ZXJ5dWkuY29tL2RhdGEtc2VsZWN0b3IvXG5cbiggZnVuY3Rpb24oIGZhY3RvcnkgKSB7XG5cdGlmICggdHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQgKSB7XG5cblx0XHQvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXG5cdFx0ZGVmaW5lKCBbIFwianF1ZXJ5XCIsIFwiLi92ZXJzaW9uXCIgXSwgZmFjdG9yeSApO1xuXHR9IGVsc2Uge1xuXG5cdFx0Ly8gQnJvd3NlciBnbG9iYWxzXG5cdFx0ZmFjdG9yeSggalF1ZXJ5ICk7XG5cdH1cbn0gKCBmdW5jdGlvbiggJCApIHtcbnJldHVybiAkLmV4dGVuZCggJC5leHByWyBcIjpcIiBdLCB7XG5cdGRhdGE6ICQuZXhwci5jcmVhdGVQc2V1ZG8gP1xuXHRcdCQuZXhwci5jcmVhdGVQc2V1ZG8oIGZ1bmN0aW9uKCBkYXRhTmFtZSApIHtcblx0XHRcdHJldHVybiBmdW5jdGlvbiggZWxlbSApIHtcblx0XHRcdFx0cmV0dXJuICEhJC5kYXRhKCBlbGVtLCBkYXRhTmFtZSApO1xuXHRcdFx0fTtcblx0XHR9ICkgOlxuXG5cdFx0Ly8gU3VwcG9ydDogalF1ZXJ5IDwxLjhcblx0XHRmdW5jdGlvbiggZWxlbSwgaSwgbWF0Y2ggKSB7XG5cdFx0XHRyZXR1cm4gISEkLmRhdGEoIGVsZW0sIG1hdGNoWyAzIF0gKTtcblx0XHR9XG59ICk7XG59ICkgKTtcbiJdfQ==
