require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({32:[function(require,module,exports){
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
},{"bootstrap":1,"jquery":24,"jquery-ui/ui/data":14,"jquery-ui/ui/ie":15,"jquery-ui/ui/plugin":16,"jquery-ui/ui/safe-active-element":17,"jquery-ui/ui/safe-blur":18,"jquery-ui/ui/scroll-parent":19,"jquery-ui/ui/version":20,"jquery-ui/ui/widget":21,"jquery-ui/ui/widgets/draggable":22,"jquery-ui/ui/widgets/mouse":23,"underscore":28}],28:[function(require,module,exports){
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

},{}],23:[function(require,module,exports){
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

},{}],22:[function(require,module,exports){
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

},{}],21:[function(require,module,exports){
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

},{}],20:[function(require,module,exports){
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

},{}],19:[function(require,module,exports){
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

},{}],18:[function(require,module,exports){
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

},{}],17:[function(require,module,exports){
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

},{}],16:[function(require,module,exports){
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

},{}],15:[function(require,module,exports){
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

},{}],14:[function(require,module,exports){
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

},{}]},{},[32])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYXBwcy9pdGVtLXNjcmFtYmxlLmpzIiwibm9kZV9tb2R1bGVzL3VuZGVyc2NvcmUvdW5kZXJzY29yZS5qcyIsIm5vZGVfbW9kdWxlcy9qcXVlcnktdWkvdWkvd2lkZ2V0cy9tb3VzZS5qcyIsIm5vZGVfbW9kdWxlcy9qcXVlcnktdWkvdWkvd2lkZ2V0cy9kcmFnZ2FibGUuanMiLCJub2RlX21vZHVsZXMvanF1ZXJ5LXVpL3VpL3dpZGdldC5qcyIsIm5vZGVfbW9kdWxlcy9qcXVlcnktdWkvdWkvdmVyc2lvbi5qcyIsIm5vZGVfbW9kdWxlcy9qcXVlcnktdWkvdWkvc2Nyb2xsLXBhcmVudC5qcyIsIm5vZGVfbW9kdWxlcy9qcXVlcnktdWkvdWkvc2FmZS1ibHVyLmpzIiwibm9kZV9tb2R1bGVzL2pxdWVyeS11aS91aS9zYWZlLWFjdGl2ZS1lbGVtZW50LmpzIiwibm9kZV9tb2R1bGVzL2pxdWVyeS11aS91aS9wbHVnaW4uanMiLCJub2RlX21vZHVsZXMvanF1ZXJ5LXVpL3VpL2llLmpzIiwibm9kZV9tb2R1bGVzL2pxdWVyeS11aS91aS9kYXRhLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Z0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbE9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsdUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgJCA9IGpRdWVyeSA9IHJlcXVpcmUoJ2pxdWVyeScpO1xucmVxdWlyZSgnanF1ZXJ5LXVpL3VpL3ZlcnNpb24nKTtcbnJlcXVpcmUoJ2pxdWVyeS11aS91aS9pZScpO1xucmVxdWlyZSgnanF1ZXJ5LXVpL3VpL2RhdGEnKTtcbnJlcXVpcmUoJ2pxdWVyeS11aS91aS9wbHVnaW4nKTtcbnJlcXVpcmUoJ2pxdWVyeS11aS91aS9zYWZlLWFjdGl2ZS1lbGVtZW50Jyk7XG5yZXF1aXJlKCdqcXVlcnktdWkvdWkvc2FmZS1ibHVyJyk7XG5yZXF1aXJlKCdqcXVlcnktdWkvdWkvc2Nyb2xsLXBhcmVudCcpO1xucmVxdWlyZSgnanF1ZXJ5LXVpL3VpL3dpZGdldCcpO1xucmVxdWlyZSgnanF1ZXJ5LXVpL3VpL3dpZGdldHMvbW91c2UnKTtcbnJlcXVpcmUoJ2pxdWVyeS11aS91aS93aWRnZXRzL2RyYWdnYWJsZScpO1xucmVxdWlyZSgnYm9vdHN0cmFwJyk7XG52YXIgXyA9IHJlcXVpcmUoJ3VuZGVyc2NvcmUnKTtcblxuJChmdW5jdGlvbigpIHtcbiAgICB2YXIgTlVNX0lURU1TID0gNSxcbiAgICAgICAgaXRlbUJhc2ljID0gW10sXG4gICAgICAgIGl0ZW1VcGdyYWRlID0gW10sXG4gICAgICAgIGhhc2hNYXBVcGdyYWRlID0ge30sXG4gICAgICAgIGl0ZW1zLFxuICAgICAgICBjb21wb25lbnRzLFxuICAgICAgICBjb21wb25lbnRzTGlzdCxcbiAgICAgICAgYW5zd2VyO1xuXG4gICAgJC5nZXRKU09OKFwiL21lZGlhL2RvdGEtanNvbi9pdGVtZGF0YS5qc29uXCIsIGZ1bmN0aW9uKGl0ZW1kYXRhKSB7XG4gICAgICAgIGRlbGV0ZSBpdGVtZGF0YVsnaXRlbV93YXJkX2Rpc3BlbnNlciddO1xuICAgICAgICBkZWxldGUgaXRlbWRhdGFbJ2l0ZW1fcmVjaXBlX3dhcmRfZGlzcGVuc2VyJ107XG4gICAgICAgIFxuICAgICAgICB2YXIgdXBncmFkZXMgPSBbXSxcbiAgICAgICAgICAgIHJlY2lwZXMgPSB7fTtcblxuICAgICAgICBmdW5jdGlvbiBnZXRBbGxDb21wb25lbnRzKGkpIHtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICAgICAgICAgIGlmICh1cGdyYWRlcy5pbmRleE9mKGkpID09IC0xKSB7XG4gICAgICAgICAgICAgICAgaWYgKGkuaW5kZXhPZignaXRlbV9yZWNpcGVfJykgPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goaS5yZXBsYWNlKCdpdGVtXycsICcnKSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goJ3JlY2lwZScpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LmNvbmNhdChcbiAgICAgICAgICAgICAgICAgICAgaXRlbWRhdGFbcmVjaXBlc1tpXV0uSXRlbVJlcXVpcmVtZW50cy5tYXAoZ2V0QWxsQ29tcG9uZW50cykucmVkdWNlKGZ1bmN0aW9uKG1lbW8sIGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtZW1vLmNvbmNhdChsKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgW10pXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKHZhciBpIGluIGl0ZW1kYXRhKSB7XG4gICAgICAgICAgICBpZiAoaXRlbWRhdGFbaV0uSXRlbVJlY2lwZSkge1xuICAgICAgICAgICAgICAgIHVwZ3JhZGVzLnB1c2goaXRlbWRhdGFbaV0uSXRlbVJlc3VsdCk7XG4gICAgICAgICAgICAgICAgcmVjaXBlc1tpdGVtZGF0YVtpXS5JdGVtUmVzdWx0XSA9IGk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKHZhciBpIGluIGl0ZW1kYXRhKSB7XG4gICAgICAgICAgICBpZiAoaXRlbWRhdGFbaV0uSXRlbVJlY2lwZSkge1xuICAgICAgICAgICAgICAgIGl0ZW1VcGdyYWRlLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBcIm5hbWVcIjogaXRlbWRhdGFbaV0uSXRlbVJlc3VsdC5yZXBsYWNlKCdpdGVtXycsICcnKSxcbiAgICAgICAgICAgICAgICAgICAgXCJjb21wb25lbnRzXCI6IGl0ZW1kYXRhW2ldLkl0ZW1SZXF1aXJlbWVudHMubWFwKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBpdGVtLmluZGV4T2YoJ2l0ZW1fcmVjaXBlXycpID09IC0xID8gaXRlbS5yZXBsYWNlKCdpdGVtXycsICcnKSA6ICdyZWNpcGUnO1xuICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgXCJjb3N0XCI6IGl0ZW1kYXRhW2l0ZW1kYXRhW2ldLkl0ZW1SZXN1bHRdLml0ZW1jb3N0LFxuICAgICAgICAgICAgICAgICAgICBcImFsbENvbXBvbmVudHNcIjogZ2V0QWxsQ29tcG9uZW50cyhpdGVtZGF0YVtpXS5JdGVtUmVzdWx0KVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh1cGdyYWRlcy5pbmRleE9mKGkpID09IC0xICYmIGkuaW5kZXhPZignd2ludGVyXycpID09IC0xICYmIGkuaW5kZXhPZignZ3JlZXZpbF8nKSA9PSAtMSAmJiBpLmluZGV4T2YoJ2hhbGxvd2Vlbl8nKSA9PSAtMSAmJiBpLmluZGV4T2YoJ215c3RlcnlfJykgPT0gLTEpIHtcbiAgICAgICAgICAgICAgICBpdGVtQmFzaWMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIFwibmFtZVwiOiBpdGVtZGF0YVtpXS5uYW1lLnJlcGxhY2UoJ2l0ZW1fJywgJycpLFxuICAgICAgICAgICAgICAgICAgICBcImNvbXBvbmVudHNcIjogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgXCJjb3N0XCI6IGl0ZW1kYXRhW2ldLml0ZW1jb3N0XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpdGVtVXBncmFkZS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIGtleSA9IGl0ZW1VcGdyYWRlW2ldLmFsbENvbXBvbmVudHMuc29ydCgpLnJlZHVjZShmdW5jdGlvbihtZW1vLCBpdGVtKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG1lbW8gKyBpdGVtO1xuICAgICAgICAgICAgfSwgJycpO1xuICAgICAgICAgICAgaGFzaE1hcFVwZ3JhZGVba2V5XSA9IGl0ZW1VcGdyYWRlW2ldLm5hbWU7XG4gICAgICAgIH1cblxuICAgICAgICBnZW5lcmF0ZVF1ZXN0aW9uKCk7XG4gICAgfSk7XG5cbiAgICBmdW5jdGlvbiBzaHVmZmxlKGFycmF5KSB7XG4gICAgICAgIHZhciBjb3VudGVyID0gYXJyYXkubGVuZ3RoLFxuICAgICAgICAgICAgdGVtcCwgaW5kZXg7XG5cbiAgICAgICAgLy8gV2hpbGUgdGhlcmUgYXJlIGVsZW1lbnRzIGluIHRoZSBhcnJheVxuICAgICAgICB3aGlsZSAoY291bnRlciA+IDApIHtcbiAgICAgICAgICAgIC8vIFBpY2sgYSByYW5kb20gaW5kZXhcbiAgICAgICAgICAgIGluZGV4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogY291bnRlcik7XG5cbiAgICAgICAgICAgIC8vIERlY3JlYXNlIGNvdW50ZXIgYnkgMVxuICAgICAgICAgICAgY291bnRlci0tO1xuXG4gICAgICAgICAgICAvLyBBbmQgc3dhcCB0aGUgbGFzdCBlbGVtZW50IHdpdGggaXRcbiAgICAgICAgICAgIHRlbXAgPSBhcnJheVtjb3VudGVyXTtcbiAgICAgICAgICAgIGFycmF5W2NvdW50ZXJdID0gYXJyYXlbaW5kZXhdO1xuICAgICAgICAgICAgYXJyYXlbaW5kZXhdID0gdGVtcDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBhcnJheTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gZ2VuZXJhdGVRdWVzdGlvbigpIHtcblxuICAgICAgICBpdGVtcyA9IF8uc29ydEJ5KF8uc2FtcGxlKGl0ZW1VcGdyYWRlLCBOVU1fSVRFTVMpLCBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICByZXR1cm4gaXRlbS5uYW1lO1xuICAgICAgICB9KTtcbiAgICAgICAgYW5zd2VyID0gXy5wbHVjayhpdGVtcywgJ25hbWUnKTtcbiAgICAgICAgY29tcG9uZW50cyA9IGl0ZW1zLnJlZHVjZShmdW5jdGlvbihtZW1vLCBpdGVtKSB7XG4gICAgICAgICAgICByZXR1cm4gbWVtby5jb25jYXQoaXRlbS5hbGxDb21wb25lbnRzKTtcbiAgICAgICAgfSwgW10pO1xuICAgICAgICBjb21wb25lbnRzTGlzdCA9IFtdO1xuICAgICAgICBzaHVmZmxlKGNvbXBvbmVudHMpO1xuICAgICAgICAkKCcjY29tcG9uZW50cy1jb250YWluZXInKS5lbXB0eSgpO1xuICAgICAgICAvLyQoJyN1cGdyYWRlcy1jb250YWluZXInKS5lbXB0eSgpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvbXBvbmVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciAkY29tcG9uZW50ID0gJCgnPGltZz4nKS5hdHRyKCdzcmMnLCAnaHR0cDovL2Nkbi5kb3RhMi5jb20vYXBwcy9kb3RhMi9pbWFnZXMvaXRlbXMvJyArIGNvbXBvbmVudHNbaV0gKyAnX2xnLnBuZycpLmFkZENsYXNzKCdjb21wb25lbnQnKTtcbiAgICAgICAgICAgICRjb21wb25lbnQuZGF0YSgnY29tcG9uZW50TmFtZScsIGNvbXBvbmVudHNbaV0pO1xuICAgICAgICAgICAgY29tcG9uZW50c0xpc3QucHVzaCgkY29tcG9uZW50KTtcbiAgICAgICAgICAgICRjb21wb25lbnQuZHJhZ2dhYmxlKHtcbiAgICAgICAgICAgICAgICBzbmFwOiB0cnVlLFxuICAgICAgICAgICAgICAgIHN0b3A6IGZ1bmN0aW9uKGV2ZW50LCB1aSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICB2YXIgc25hcHBlZCA9ICQodGhpcykuZGF0YSgndWktZHJhZ2dhYmxlJykuc25hcEVsZW1lbnRzO1xuICAgICAgICAgICAgICAgICAgICB2YXIgc25hcHBlZFN0YXJ0ID0gJCh0aGlzKS5kYXRhKCdzbmFwLXN0YXRlJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gZ2V0IGRpZmZlcmVuY2UgYmV0d2VlbiBuZXcgc25hcCBzdGF0ZSBhbmQgb2xkIHNuYXAgc3RhdGVcbiAgICAgICAgICAgICAgICAgICAgc25hcERpZmYgPSBfLnBsdWNrKHNuYXBwZWQuZmlsdGVyKGZ1bmN0aW9uKGVsZW1lbnQsIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gIXNuYXBwZWRbaW5kZXhdLnNuYXBwaW5nID09IHNuYXBwZWRTdGFydFtpbmRleF0uc25hcHBpbmc7XG4gICAgICAgICAgICAgICAgICAgIH0pLCAnaXRlbScpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIHNldCBzbmFwLXN0YXRlIHRvIG5ldyBzbmFwIHN0YXRlXG4gICAgICAgICAgICAgICAgICAgICQodGhpcykuZGF0YSgnc25hcC1zdGF0ZScsICQodGhpcykuZGF0YSgndWktZHJhZ2dhYmxlJykuc25hcEVsZW1lbnRzKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyB1cGRhdGUgc3RhdGUgb2Ygb3RoZXIgY29tcG9uZW50c1xuICAgICAgICAgICAgICAgICAgICBzbmFwRGlmZi5mb3JFYWNoKGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZVNuYXBwZWQoc2VsZiwgZWxlbWVudCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGdldCBsaXN0IG9mIHVwZ3JhZGUgaXRlbXNcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNvbXBvbmVudEl0ZW1zID0gY29tcG9uZW50c0xpc3QubWFwKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBpdGVtWzBdXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB2YXIgY29tcGxldGVkVXBncmFkZXMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgd2hpbGUgKGNvbXBvbmVudEl0ZW1zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB1ID0gZ2V0VXBncmFkZShjb21wb25lbnRJdGVtc1swXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBsZXRlZFVwZ3JhZGVzLnB1c2godSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRJdGVtcyA9IF8uZGlmZmVyZW5jZShjb21wb25lbnRJdGVtcywgZ2V0QWxsU25hcHBlZFRvKGNvbXBvbmVudEl0ZW1zWzBdLCBbXSwgW10pKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIHVwZGF0ZSB1cGdyYWRlcyBjb250YWluZXJcbiAgICAgICAgICAgICAgICAgICAgLy8kKCcjdXBncmFkZXMtY29udGFpbmVyJykuZW1wdHkoKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHVwZ3JhZGVzID0gJChcIi51cGdyYWRlXCIpLm1hcChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAkKHRoaXMpLmRhdGEoJ3VwZ3JhZGVOYW1lJyk7XG4gICAgICAgICAgICAgICAgICAgIH0pLmdldCgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY29tcGxldGVkVXBncmFkZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29tcGxldGVkVXBncmFkZXMuZm9yRWFjaChmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHVwZ3JhZGVzLmluZGV4T2YoaXRlbSkgPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyICR1cGdyYWRlID0gJCgnPGltZz4nKS5hdHRyKCdzcmMnLCAnaHR0cDovL2Nkbi5kb3RhMi5jb20vYXBwcy9kb3RhMi9pbWFnZXMvaXRlbXMvJyArIGl0ZW0gKyAnX2xnLnBuZycpLmFkZENsYXNzKCd1cGdyYWRlJykuZGF0YSgndXBncmFkZU5hbWUnLCBpdGVtKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJCgnI3VwZ3JhZGVzLWNvbnRhaW5lcicpLmFwcGVuZCgkdXBncmFkZS5oaWRlKCkuZmFkZUluKDUwMCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZ3JhZGVzLnNwbGljZSh1cGdyYWRlcy5pbmRleE9mKGl0ZW0pLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICQoXCIudXBncmFkZVwiKS5lYWNoKGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHVwZ3JhZGVzLmluZGV4T2YoJCh0aGlzKS5kYXRhKCd1cGdyYWRlTmFtZScpKSAhPSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGdyYWRlcy5zcGxpY2UodXBncmFkZXMuaW5kZXhPZigkKHRoaXMpLmRhdGEoJ3VwZ3JhZGVOYW1lJykpLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJyN1cGdyYWRlcy1jb250YWluZXInKS5lbXB0eSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gZ2V0IGxpc3Qgb2YgdW51c2VkIGNvbXBvbmVudHNcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNpbmdsZUNvbXBvbmVudHMgPSBjb21wb25lbnRzTGlzdC5yZWR1Y2UoZnVuY3Rpb24obWVtbywgaXRlbSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFnZXRVcGdyYWRlKGl0ZW1bMF0pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVtby5wdXNoKGl0ZW0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1lbW87XG4gICAgICAgICAgICAgICAgICAgIH0sIFtdKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyB1cGRhdGUgY29tYmluZWQgY2xhc3NcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50c0xpc3QuZm9yRWFjaChmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2luZ2xlQ29tcG9uZW50cy5pbmRleE9mKGVsZW1lbnQpID09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5hZGRDbGFzcygnY29tYmluZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5yZW1vdmVDbGFzcygnY29tYmluZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gY2hlY2sgaWYgZmluaXNoZWRcbiAgICAgICAgICAgICAgICAgICAgLy9pZiAoXy5kaWZmZXJlbmNlKGFuc3dlciwgY29tcGxldGVkVXBncmFkZXMpLmxlbmd0aCA9PSAwIHx8IChzaW5nbGVDb21wb25lbnRzLmxlbmd0aCA9PSAwICYmIF8uZXZlcnkoY29tcGxldGVkVXBncmFkZXMsIGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKChzaW5nbGVDb21wb25lbnRzLmxlbmd0aCA9PSAwICYmIGNvbXBsZXRlZFVwZ3JhZGVzLmV2ZXJ5KGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gXy5maW5kKGl0ZW1VcGdyYWRlLCBmdW5jdGlvbihpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBpLm5hbWUgPT0gaXRlbTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkLndoZW4oJCgnLnVwZ3JhZGUnKS5mYWRlT3V0KDUwMCkpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdlbmVyYXRlUXVlc3Rpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIDEwMDApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAkKCcjY29tcG9uZW50cy1jb250YWluZXInKS5hcHBlbmQoJGNvbXBvbmVudC5oaWRlKCkuZmFkZUluKDUwMCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gaW5pdCBlYWNoIGNvbXBvbmVudCdzIHNuYXAgc3RhdGVcbiAgICAgICAgY29tcG9uZW50c0xpc3QuZm9yRWFjaChmdW5jdGlvbigkY29tcG9uZW50KSB7XG4gICAgICAgICAgICAkY29tcG9uZW50LmRhdGEoJ3NuYXAtc3RhdGUnLCBjb21wb25lbnRzTGlzdC5yZWR1Y2UoZnVuY3Rpb24obWVtbywgaXRlbSkge1xuICAgICAgICAgICAgICAgIGlmICgkY29tcG9uZW50ICE9IGl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgbWVtby5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICdpdGVtJzogaXRlbVswXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICdzbmFwcGluZyc6IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gbWVtbztcbiAgICAgICAgICAgIH0sIFtdKSk7XG4gICAgICAgIH0pO1xuXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdXBkYXRlU25hcHBlZChzcmMsIGRlc3QpIHtcbiAgICAgICAgaWYgKCQoZGVzdCkuZGF0YSgnc25hcC1zdGF0ZScpKSB7XG4gICAgICAgICAgICB2YXIgZCA9IF8uZmluZCgkKGRlc3QpLmRhdGEoJ3NuYXAtc3RhdGUnKSwgZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBpdGVtLml0ZW0gPT0gc3JjO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB2YXIgcyA9IF8uZmluZCgkKHNyYykuZGF0YSgnc25hcC1zdGF0ZScpLCBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGl0ZW0uaXRlbSA9PSBkZXN0O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBkLnNuYXBwaW5nID0gcy5zbmFwcGluZztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldFNuYXBwZWRUbyhlbCkge1xuICAgICAgICB2YXIgc25hcHBlZCA9ICQoZWwpLmRhdGEoJ3NuYXAtc3RhdGUnKTsgLy8kKGVsKS5kYXRhKCd1aS1kcmFnZ2FibGUnKS5zbmFwRWxlbWVudHM7XG4gICAgICAgIHZhciBzbmFwcGVkVG8gPSBbXTtcbiAgICAgICAgaWYgKHNuYXBwZWQpIHtcbiAgICAgICAgICAgIHNuYXBwZWRUbyA9ICQubWFwKHNuYXBwZWQsIGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZWxlbWVudC5zbmFwcGluZyA/IGVsZW1lbnQuaXRlbSA6IG51bGw7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc25hcHBlZFRvO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldEFsbFNuYXBwZWRUbyhyb290LCByZXN1bHQsIGNvbXBsZXRlZCkge1xuICAgICAgICB2YXIgc25hcHBlZFRvID0gZ2V0U25hcHBlZFRvKHJvb3QpO1xuICAgICAgICBpZiAoY29tcGxldGVkLmluZGV4T2Yocm9vdCkgPT0gLTEpIHtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKHJvb3QpO1xuICAgICAgICAgICAgY29tcGxldGVkLnB1c2gocm9vdCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNuYXBwZWRUbykge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzbmFwcGVkVG8ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoY29tcGxldGVkLmluZGV4T2Yoc25hcHBlZFRvW2ldKSA9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICBnZXRBbGxTbmFwcGVkVG8oc25hcHBlZFRvW2ldLCByZXN1bHQsIGNvbXBsZXRlZClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRVcGdyYWRlKGVsZW1lbnQpIHtcbiAgICAgICAgdmFyIGl0ZW1zID0gZ2V0QWxsU25hcHBlZFRvKGVsZW1lbnQsIFtdLCBbXSkubWFwKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgIHJldHVybiAkKGl0ZW0pLmRhdGEoJ2NvbXBvbmVudE5hbWUnKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGl0ZW1zID0gaXRlbXMuc29ydCgpO1xuICAgICAgICB2YXIga2V5ID0gaXRlbXMucmVkdWNlKGZ1bmN0aW9uKG1lbW8sIGl0ZW0pIHtcbiAgICAgICAgICAgIHJldHVybiBtZW1vICsgaXRlbTtcbiAgICAgICAgfSwgJycpO1xuICAgICAgICByZXR1cm4gaGFzaE1hcFVwZ3JhZGVba2V5XTtcbiAgICB9XG5cbn0pOyIsIi8vICAgICBVbmRlcnNjb3JlLmpzIDEuOC4zXG4vLyAgICAgaHR0cDovL3VuZGVyc2NvcmVqcy5vcmdcbi8vICAgICAoYykgMjAwOS0yMDE1IEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4vLyAgICAgVW5kZXJzY29yZSBtYXkgYmUgZnJlZWx5IGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBNSVQgbGljZW5zZS5cblxuKGZ1bmN0aW9uKCkge1xuXG4gIC8vIEJhc2VsaW5lIHNldHVwXG4gIC8vIC0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gRXN0YWJsaXNoIHRoZSByb290IG9iamVjdCwgYHdpbmRvd2AgaW4gdGhlIGJyb3dzZXIsIG9yIGBleHBvcnRzYCBvbiB0aGUgc2VydmVyLlxuICB2YXIgcm9vdCA9IHRoaXM7XG5cbiAgLy8gU2F2ZSB0aGUgcHJldmlvdXMgdmFsdWUgb2YgdGhlIGBfYCB2YXJpYWJsZS5cbiAgdmFyIHByZXZpb3VzVW5kZXJzY29yZSA9IHJvb3QuXztcblxuICAvLyBTYXZlIGJ5dGVzIGluIHRoZSBtaW5pZmllZCAoYnV0IG5vdCBnemlwcGVkKSB2ZXJzaW9uOlxuICB2YXIgQXJyYXlQcm90byA9IEFycmF5LnByb3RvdHlwZSwgT2JqUHJvdG8gPSBPYmplY3QucHJvdG90eXBlLCBGdW5jUHJvdG8gPSBGdW5jdGlvbi5wcm90b3R5cGU7XG5cbiAgLy8gQ3JlYXRlIHF1aWNrIHJlZmVyZW5jZSB2YXJpYWJsZXMgZm9yIHNwZWVkIGFjY2VzcyB0byBjb3JlIHByb3RvdHlwZXMuXG4gIHZhclxuICAgIHB1c2ggICAgICAgICAgICAgPSBBcnJheVByb3RvLnB1c2gsXG4gICAgc2xpY2UgICAgICAgICAgICA9IEFycmF5UHJvdG8uc2xpY2UsXG4gICAgdG9TdHJpbmcgICAgICAgICA9IE9ialByb3RvLnRvU3RyaW5nLFxuICAgIGhhc093blByb3BlcnR5ICAgPSBPYmpQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuICAvLyBBbGwgKipFQ01BU2NyaXB0IDUqKiBuYXRpdmUgZnVuY3Rpb24gaW1wbGVtZW50YXRpb25zIHRoYXQgd2UgaG9wZSB0byB1c2VcbiAgLy8gYXJlIGRlY2xhcmVkIGhlcmUuXG4gIHZhclxuICAgIG5hdGl2ZUlzQXJyYXkgICAgICA9IEFycmF5LmlzQXJyYXksXG4gICAgbmF0aXZlS2V5cyAgICAgICAgID0gT2JqZWN0LmtleXMsXG4gICAgbmF0aXZlQmluZCAgICAgICAgID0gRnVuY1Byb3RvLmJpbmQsXG4gICAgbmF0aXZlQ3JlYXRlICAgICAgID0gT2JqZWN0LmNyZWF0ZTtcblxuICAvLyBOYWtlZCBmdW5jdGlvbiByZWZlcmVuY2UgZm9yIHN1cnJvZ2F0ZS1wcm90b3R5cGUtc3dhcHBpbmcuXG4gIHZhciBDdG9yID0gZnVuY3Rpb24oKXt9O1xuXG4gIC8vIENyZWF0ZSBhIHNhZmUgcmVmZXJlbmNlIHRvIHRoZSBVbmRlcnNjb3JlIG9iamVjdCBmb3IgdXNlIGJlbG93LlxuICB2YXIgXyA9IGZ1bmN0aW9uKG9iaikge1xuICAgIGlmIChvYmogaW5zdGFuY2VvZiBfKSByZXR1cm4gb2JqO1xuICAgIGlmICghKHRoaXMgaW5zdGFuY2VvZiBfKSkgcmV0dXJuIG5ldyBfKG9iaik7XG4gICAgdGhpcy5fd3JhcHBlZCA9IG9iajtcbiAgfTtcblxuICAvLyBFeHBvcnQgdGhlIFVuZGVyc2NvcmUgb2JqZWN0IGZvciAqKk5vZGUuanMqKiwgd2l0aFxuICAvLyBiYWNrd2FyZHMtY29tcGF0aWJpbGl0eSBmb3IgdGhlIG9sZCBgcmVxdWlyZSgpYCBBUEkuIElmIHdlJ3JlIGluXG4gIC8vIHRoZSBicm93c2VyLCBhZGQgYF9gIGFzIGEgZ2xvYmFsIG9iamVjdC5cbiAgaWYgKHR5cGVvZiBleHBvcnRzICE9PSAndW5kZWZpbmVkJykge1xuICAgIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykge1xuICAgICAgZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gXztcbiAgICB9XG4gICAgZXhwb3J0cy5fID0gXztcbiAgfSBlbHNlIHtcbiAgICByb290Ll8gPSBfO1xuICB9XG5cbiAgLy8gQ3VycmVudCB2ZXJzaW9uLlxuICBfLlZFUlNJT04gPSAnMS44LjMnO1xuXG4gIC8vIEludGVybmFsIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhbiBlZmZpY2llbnQgKGZvciBjdXJyZW50IGVuZ2luZXMpIHZlcnNpb25cbiAgLy8gb2YgdGhlIHBhc3NlZC1pbiBjYWxsYmFjaywgdG8gYmUgcmVwZWF0ZWRseSBhcHBsaWVkIGluIG90aGVyIFVuZGVyc2NvcmVcbiAgLy8gZnVuY3Rpb25zLlxuICB2YXIgb3B0aW1pemVDYiA9IGZ1bmN0aW9uKGZ1bmMsIGNvbnRleHQsIGFyZ0NvdW50KSB7XG4gICAgaWYgKGNvbnRleHQgPT09IHZvaWQgMCkgcmV0dXJuIGZ1bmM7XG4gICAgc3dpdGNoIChhcmdDb3VudCA9PSBudWxsID8gMyA6IGFyZ0NvdW50KSB7XG4gICAgICBjYXNlIDE6IHJldHVybiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICByZXR1cm4gZnVuYy5jYWxsKGNvbnRleHQsIHZhbHVlKTtcbiAgICAgIH07XG4gICAgICBjYXNlIDI6IHJldHVybiBmdW5jdGlvbih2YWx1ZSwgb3RoZXIpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmMuY2FsbChjb250ZXh0LCB2YWx1ZSwgb3RoZXIpO1xuICAgICAgfTtcbiAgICAgIGNhc2UgMzogcmV0dXJuIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbikge1xuICAgICAgICByZXR1cm4gZnVuYy5jYWxsKGNvbnRleHQsIHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbik7XG4gICAgICB9O1xuICAgICAgY2FzZSA0OiByZXR1cm4gZnVuY3Rpb24oYWNjdW11bGF0b3IsIHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbikge1xuICAgICAgICByZXR1cm4gZnVuYy5jYWxsKGNvbnRleHQsIGFjY3VtdWxhdG9yLCB2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pO1xuICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGZ1bmMuYXBwbHkoY29udGV4dCwgYXJndW1lbnRzKTtcbiAgICB9O1xuICB9O1xuXG4gIC8vIEEgbW9zdGx5LWludGVybmFsIGZ1bmN0aW9uIHRvIGdlbmVyYXRlIGNhbGxiYWNrcyB0aGF0IGNhbiBiZSBhcHBsaWVkXG4gIC8vIHRvIGVhY2ggZWxlbWVudCBpbiBhIGNvbGxlY3Rpb24sIHJldHVybmluZyB0aGUgZGVzaXJlZCByZXN1bHQg4oCUIGVpdGhlclxuICAvLyBpZGVudGl0eSwgYW4gYXJiaXRyYXJ5IGNhbGxiYWNrLCBhIHByb3BlcnR5IG1hdGNoZXIsIG9yIGEgcHJvcGVydHkgYWNjZXNzb3IuXG4gIHZhciBjYiA9IGZ1bmN0aW9uKHZhbHVlLCBjb250ZXh0LCBhcmdDb3VudCkge1xuICAgIGlmICh2YWx1ZSA9PSBudWxsKSByZXR1cm4gXy5pZGVudGl0eTtcbiAgICBpZiAoXy5pc0Z1bmN0aW9uKHZhbHVlKSkgcmV0dXJuIG9wdGltaXplQ2IodmFsdWUsIGNvbnRleHQsIGFyZ0NvdW50KTtcbiAgICBpZiAoXy5pc09iamVjdCh2YWx1ZSkpIHJldHVybiBfLm1hdGNoZXIodmFsdWUpO1xuICAgIHJldHVybiBfLnByb3BlcnR5KHZhbHVlKTtcbiAgfTtcbiAgXy5pdGVyYXRlZSA9IGZ1bmN0aW9uKHZhbHVlLCBjb250ZXh0KSB7XG4gICAgcmV0dXJuIGNiKHZhbHVlLCBjb250ZXh0LCBJbmZpbml0eSk7XG4gIH07XG5cbiAgLy8gQW4gaW50ZXJuYWwgZnVuY3Rpb24gZm9yIGNyZWF0aW5nIGFzc2lnbmVyIGZ1bmN0aW9ucy5cbiAgdmFyIGNyZWF0ZUFzc2lnbmVyID0gZnVuY3Rpb24oa2V5c0Z1bmMsIHVuZGVmaW5lZE9ubHkpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24ob2JqKSB7XG4gICAgICB2YXIgbGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICAgIGlmIChsZW5ndGggPCAyIHx8IG9iaiA9PSBudWxsKSByZXR1cm4gb2JqO1xuICAgICAgZm9yICh2YXIgaW5kZXggPSAxOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICB2YXIgc291cmNlID0gYXJndW1lbnRzW2luZGV4XSxcbiAgICAgICAgICAgIGtleXMgPSBrZXlzRnVuYyhzb3VyY2UpLFxuICAgICAgICAgICAgbCA9IGtleXMubGVuZ3RoO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgIHZhciBrZXkgPSBrZXlzW2ldO1xuICAgICAgICAgIGlmICghdW5kZWZpbmVkT25seSB8fCBvYmpba2V5XSA9PT0gdm9pZCAwKSBvYmpba2V5XSA9IHNvdXJjZVtrZXldO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gb2JqO1xuICAgIH07XG4gIH07XG5cbiAgLy8gQW4gaW50ZXJuYWwgZnVuY3Rpb24gZm9yIGNyZWF0aW5nIGEgbmV3IG9iamVjdCB0aGF0IGluaGVyaXRzIGZyb20gYW5vdGhlci5cbiAgdmFyIGJhc2VDcmVhdGUgPSBmdW5jdGlvbihwcm90b3R5cGUpIHtcbiAgICBpZiAoIV8uaXNPYmplY3QocHJvdG90eXBlKSkgcmV0dXJuIHt9O1xuICAgIGlmIChuYXRpdmVDcmVhdGUpIHJldHVybiBuYXRpdmVDcmVhdGUocHJvdG90eXBlKTtcbiAgICBDdG9yLnByb3RvdHlwZSA9IHByb3RvdHlwZTtcbiAgICB2YXIgcmVzdWx0ID0gbmV3IEN0b3I7XG4gICAgQ3Rvci5wcm90b3R5cGUgPSBudWxsO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgdmFyIHByb3BlcnR5ID0gZnVuY3Rpb24oa2V5KSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuIG9iaiA9PSBudWxsID8gdm9pZCAwIDogb2JqW2tleV07XG4gICAgfTtcbiAgfTtcblxuICAvLyBIZWxwZXIgZm9yIGNvbGxlY3Rpb24gbWV0aG9kcyB0byBkZXRlcm1pbmUgd2hldGhlciBhIGNvbGxlY3Rpb25cbiAgLy8gc2hvdWxkIGJlIGl0ZXJhdGVkIGFzIGFuIGFycmF5IG9yIGFzIGFuIG9iamVjdFxuICAvLyBSZWxhdGVkOiBodHRwOi8vcGVvcGxlLm1vemlsbGEub3JnL35qb3JlbmRvcmZmL2VzNi1kcmFmdC5odG1sI3NlYy10b2xlbmd0aFxuICAvLyBBdm9pZHMgYSB2ZXJ5IG5hc3R5IGlPUyA4IEpJVCBidWcgb24gQVJNLTY0LiAjMjA5NFxuICB2YXIgTUFYX0FSUkFZX0lOREVYID0gTWF0aC5wb3coMiwgNTMpIC0gMTtcbiAgdmFyIGdldExlbmd0aCA9IHByb3BlcnR5KCdsZW5ndGgnKTtcbiAgdmFyIGlzQXJyYXlMaWtlID0gZnVuY3Rpb24oY29sbGVjdGlvbikge1xuICAgIHZhciBsZW5ndGggPSBnZXRMZW5ndGgoY29sbGVjdGlvbik7XG4gICAgcmV0dXJuIHR5cGVvZiBsZW5ndGggPT0gJ251bWJlcicgJiYgbGVuZ3RoID49IDAgJiYgbGVuZ3RoIDw9IE1BWF9BUlJBWV9JTkRFWDtcbiAgfTtcblxuICAvLyBDb2xsZWN0aW9uIEZ1bmN0aW9uc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIFRoZSBjb3JuZXJzdG9uZSwgYW4gYGVhY2hgIGltcGxlbWVudGF0aW9uLCBha2EgYGZvckVhY2hgLlxuICAvLyBIYW5kbGVzIHJhdyBvYmplY3RzIGluIGFkZGl0aW9uIHRvIGFycmF5LWxpa2VzLiBUcmVhdHMgYWxsXG4gIC8vIHNwYXJzZSBhcnJheS1saWtlcyBhcyBpZiB0aGV5IHdlcmUgZGVuc2UuXG4gIF8uZWFjaCA9IF8uZm9yRWFjaCA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0ZWUsIGNvbnRleHQpIHtcbiAgICBpdGVyYXRlZSA9IG9wdGltaXplQ2IoaXRlcmF0ZWUsIGNvbnRleHQpO1xuICAgIHZhciBpLCBsZW5ndGg7XG4gICAgaWYgKGlzQXJyYXlMaWtlKG9iaikpIHtcbiAgICAgIGZvciAoaSA9IDAsIGxlbmd0aCA9IG9iai5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBpdGVyYXRlZShvYmpbaV0sIGksIG9iaik7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBrZXlzID0gXy5rZXlzKG9iaik7XG4gICAgICBmb3IgKGkgPSAwLCBsZW5ndGggPSBrZXlzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGl0ZXJhdGVlKG9ialtrZXlzW2ldXSwga2V5c1tpXSwgb2JqKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG9iajtcbiAgfTtcblxuICAvLyBSZXR1cm4gdGhlIHJlc3VsdHMgb2YgYXBwbHlpbmcgdGhlIGl0ZXJhdGVlIHRvIGVhY2ggZWxlbWVudC5cbiAgXy5tYXAgPSBfLmNvbGxlY3QgPSBmdW5jdGlvbihvYmosIGl0ZXJhdGVlLCBjb250ZXh0KSB7XG4gICAgaXRlcmF0ZWUgPSBjYihpdGVyYXRlZSwgY29udGV4dCk7XG4gICAgdmFyIGtleXMgPSAhaXNBcnJheUxpa2Uob2JqKSAmJiBfLmtleXMob2JqKSxcbiAgICAgICAgbGVuZ3RoID0gKGtleXMgfHwgb2JqKS5sZW5ndGgsXG4gICAgICAgIHJlc3VsdHMgPSBBcnJheShsZW5ndGgpO1xuICAgIGZvciAodmFyIGluZGV4ID0gMDsgaW5kZXggPCBsZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIHZhciBjdXJyZW50S2V5ID0ga2V5cyA/IGtleXNbaW5kZXhdIDogaW5kZXg7XG4gICAgICByZXN1bHRzW2luZGV4XSA9IGl0ZXJhdGVlKG9ialtjdXJyZW50S2V5XSwgY3VycmVudEtleSwgb2JqKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH07XG5cbiAgLy8gQ3JlYXRlIGEgcmVkdWNpbmcgZnVuY3Rpb24gaXRlcmF0aW5nIGxlZnQgb3IgcmlnaHQuXG4gIGZ1bmN0aW9uIGNyZWF0ZVJlZHVjZShkaXIpIHtcbiAgICAvLyBPcHRpbWl6ZWQgaXRlcmF0b3IgZnVuY3Rpb24gYXMgdXNpbmcgYXJndW1lbnRzLmxlbmd0aFxuICAgIC8vIGluIHRoZSBtYWluIGZ1bmN0aW9uIHdpbGwgZGVvcHRpbWl6ZSB0aGUsIHNlZSAjMTk5MS5cbiAgICBmdW5jdGlvbiBpdGVyYXRvcihvYmosIGl0ZXJhdGVlLCBtZW1vLCBrZXlzLCBpbmRleCwgbGVuZ3RoKSB7XG4gICAgICBmb3IgKDsgaW5kZXggPj0gMCAmJiBpbmRleCA8IGxlbmd0aDsgaW5kZXggKz0gZGlyKSB7XG4gICAgICAgIHZhciBjdXJyZW50S2V5ID0ga2V5cyA/IGtleXNbaW5kZXhdIDogaW5kZXg7XG4gICAgICAgIG1lbW8gPSBpdGVyYXRlZShtZW1vLCBvYmpbY3VycmVudEtleV0sIGN1cnJlbnRLZXksIG9iaik7XG4gICAgICB9XG4gICAgICByZXR1cm4gbWVtbztcbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24ob2JqLCBpdGVyYXRlZSwgbWVtbywgY29udGV4dCkge1xuICAgICAgaXRlcmF0ZWUgPSBvcHRpbWl6ZUNiKGl0ZXJhdGVlLCBjb250ZXh0LCA0KTtcbiAgICAgIHZhciBrZXlzID0gIWlzQXJyYXlMaWtlKG9iaikgJiYgXy5rZXlzKG9iaiksXG4gICAgICAgICAgbGVuZ3RoID0gKGtleXMgfHwgb2JqKS5sZW5ndGgsXG4gICAgICAgICAgaW5kZXggPSBkaXIgPiAwID8gMCA6IGxlbmd0aCAtIDE7XG4gICAgICAvLyBEZXRlcm1pbmUgdGhlIGluaXRpYWwgdmFsdWUgaWYgbm9uZSBpcyBwcm92aWRlZC5cbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMykge1xuICAgICAgICBtZW1vID0gb2JqW2tleXMgPyBrZXlzW2luZGV4XSA6IGluZGV4XTtcbiAgICAgICAgaW5kZXggKz0gZGlyO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGl0ZXJhdG9yKG9iaiwgaXRlcmF0ZWUsIG1lbW8sIGtleXMsIGluZGV4LCBsZW5ndGgpO1xuICAgIH07XG4gIH1cblxuICAvLyAqKlJlZHVjZSoqIGJ1aWxkcyB1cCBhIHNpbmdsZSByZXN1bHQgZnJvbSBhIGxpc3Qgb2YgdmFsdWVzLCBha2EgYGluamVjdGAsXG4gIC8vIG9yIGBmb2xkbGAuXG4gIF8ucmVkdWNlID0gXy5mb2xkbCA9IF8uaW5qZWN0ID0gY3JlYXRlUmVkdWNlKDEpO1xuXG4gIC8vIFRoZSByaWdodC1hc3NvY2lhdGl2ZSB2ZXJzaW9uIG9mIHJlZHVjZSwgYWxzbyBrbm93biBhcyBgZm9sZHJgLlxuICBfLnJlZHVjZVJpZ2h0ID0gXy5mb2xkciA9IGNyZWF0ZVJlZHVjZSgtMSk7XG5cbiAgLy8gUmV0dXJuIHRoZSBmaXJzdCB2YWx1ZSB3aGljaCBwYXNzZXMgYSB0cnV0aCB0ZXN0LiBBbGlhc2VkIGFzIGBkZXRlY3RgLlxuICBfLmZpbmQgPSBfLmRldGVjdCA9IGZ1bmN0aW9uKG9iaiwgcHJlZGljYXRlLCBjb250ZXh0KSB7XG4gICAgdmFyIGtleTtcbiAgICBpZiAoaXNBcnJheUxpa2Uob2JqKSkge1xuICAgICAga2V5ID0gXy5maW5kSW5kZXgob2JqLCBwcmVkaWNhdGUsIGNvbnRleHQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBrZXkgPSBfLmZpbmRLZXkob2JqLCBwcmVkaWNhdGUsIGNvbnRleHQpO1xuICAgIH1cbiAgICBpZiAoa2V5ICE9PSB2b2lkIDAgJiYga2V5ICE9PSAtMSkgcmV0dXJuIG9ialtrZXldO1xuICB9O1xuXG4gIC8vIFJldHVybiBhbGwgdGhlIGVsZW1lbnRzIHRoYXQgcGFzcyBhIHRydXRoIHRlc3QuXG4gIC8vIEFsaWFzZWQgYXMgYHNlbGVjdGAuXG4gIF8uZmlsdGVyID0gXy5zZWxlY3QgPSBmdW5jdGlvbihvYmosIHByZWRpY2F0ZSwgY29udGV4dCkge1xuICAgIHZhciByZXN1bHRzID0gW107XG4gICAgcHJlZGljYXRlID0gY2IocHJlZGljYXRlLCBjb250ZXh0KTtcbiAgICBfLmVhY2gob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGxpc3QpIHtcbiAgICAgIGlmIChwcmVkaWNhdGUodmFsdWUsIGluZGV4LCBsaXN0KSkgcmVzdWx0cy5wdXNoKHZhbHVlKTtcbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfTtcblxuICAvLyBSZXR1cm4gYWxsIHRoZSBlbGVtZW50cyBmb3Igd2hpY2ggYSB0cnV0aCB0ZXN0IGZhaWxzLlxuICBfLnJlamVjdCA9IGZ1bmN0aW9uKG9iaiwgcHJlZGljYXRlLCBjb250ZXh0KSB7XG4gICAgcmV0dXJuIF8uZmlsdGVyKG9iaiwgXy5uZWdhdGUoY2IocHJlZGljYXRlKSksIGNvbnRleHQpO1xuICB9O1xuXG4gIC8vIERldGVybWluZSB3aGV0aGVyIGFsbCBvZiB0aGUgZWxlbWVudHMgbWF0Y2ggYSB0cnV0aCB0ZXN0LlxuICAvLyBBbGlhc2VkIGFzIGBhbGxgLlxuICBfLmV2ZXJ5ID0gXy5hbGwgPSBmdW5jdGlvbihvYmosIHByZWRpY2F0ZSwgY29udGV4dCkge1xuICAgIHByZWRpY2F0ZSA9IGNiKHByZWRpY2F0ZSwgY29udGV4dCk7XG4gICAgdmFyIGtleXMgPSAhaXNBcnJheUxpa2Uob2JqKSAmJiBfLmtleXMob2JqKSxcbiAgICAgICAgbGVuZ3RoID0gKGtleXMgfHwgb2JqKS5sZW5ndGg7XG4gICAgZm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgdmFyIGN1cnJlbnRLZXkgPSBrZXlzID8ga2V5c1tpbmRleF0gOiBpbmRleDtcbiAgICAgIGlmICghcHJlZGljYXRlKG9ialtjdXJyZW50S2V5XSwgY3VycmVudEtleSwgb2JqKSkgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcblxuICAvLyBEZXRlcm1pbmUgaWYgYXQgbGVhc3Qgb25lIGVsZW1lbnQgaW4gdGhlIG9iamVjdCBtYXRjaGVzIGEgdHJ1dGggdGVzdC5cbiAgLy8gQWxpYXNlZCBhcyBgYW55YC5cbiAgXy5zb21lID0gXy5hbnkgPSBmdW5jdGlvbihvYmosIHByZWRpY2F0ZSwgY29udGV4dCkge1xuICAgIHByZWRpY2F0ZSA9IGNiKHByZWRpY2F0ZSwgY29udGV4dCk7XG4gICAgdmFyIGtleXMgPSAhaXNBcnJheUxpa2Uob2JqKSAmJiBfLmtleXMob2JqKSxcbiAgICAgICAgbGVuZ3RoID0gKGtleXMgfHwgb2JqKS5sZW5ndGg7XG4gICAgZm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgdmFyIGN1cnJlbnRLZXkgPSBrZXlzID8ga2V5c1tpbmRleF0gOiBpbmRleDtcbiAgICAgIGlmIChwcmVkaWNhdGUob2JqW2N1cnJlbnRLZXldLCBjdXJyZW50S2V5LCBvYmopKSByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9O1xuXG4gIC8vIERldGVybWluZSBpZiB0aGUgYXJyYXkgb3Igb2JqZWN0IGNvbnRhaW5zIGEgZ2l2ZW4gaXRlbSAodXNpbmcgYD09PWApLlxuICAvLyBBbGlhc2VkIGFzIGBpbmNsdWRlc2AgYW5kIGBpbmNsdWRlYC5cbiAgXy5jb250YWlucyA9IF8uaW5jbHVkZXMgPSBfLmluY2x1ZGUgPSBmdW5jdGlvbihvYmosIGl0ZW0sIGZyb21JbmRleCwgZ3VhcmQpIHtcbiAgICBpZiAoIWlzQXJyYXlMaWtlKG9iaikpIG9iaiA9IF8udmFsdWVzKG9iaik7XG4gICAgaWYgKHR5cGVvZiBmcm9tSW5kZXggIT0gJ251bWJlcicgfHwgZ3VhcmQpIGZyb21JbmRleCA9IDA7XG4gICAgcmV0dXJuIF8uaW5kZXhPZihvYmosIGl0ZW0sIGZyb21JbmRleCkgPj0gMDtcbiAgfTtcblxuICAvLyBJbnZva2UgYSBtZXRob2QgKHdpdGggYXJndW1lbnRzKSBvbiBldmVyeSBpdGVtIGluIGEgY29sbGVjdGlvbi5cbiAgXy5pbnZva2UgPSBmdW5jdGlvbihvYmosIG1ldGhvZCkge1xuICAgIHZhciBhcmdzID0gc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpO1xuICAgIHZhciBpc0Z1bmMgPSBfLmlzRnVuY3Rpb24obWV0aG9kKTtcbiAgICByZXR1cm4gXy5tYXAob2JqLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgdmFyIGZ1bmMgPSBpc0Z1bmMgPyBtZXRob2QgOiB2YWx1ZVttZXRob2RdO1xuICAgICAgcmV0dXJuIGZ1bmMgPT0gbnVsbCA/IGZ1bmMgOiBmdW5jLmFwcGx5KHZhbHVlLCBhcmdzKTtcbiAgICB9KTtcbiAgfTtcblxuICAvLyBDb252ZW5pZW5jZSB2ZXJzaW9uIG9mIGEgY29tbW9uIHVzZSBjYXNlIG9mIGBtYXBgOiBmZXRjaGluZyBhIHByb3BlcnR5LlxuICBfLnBsdWNrID0gZnVuY3Rpb24ob2JqLCBrZXkpIHtcbiAgICByZXR1cm4gXy5tYXAob2JqLCBfLnByb3BlcnR5KGtleSkpO1xuICB9O1xuXG4gIC8vIENvbnZlbmllbmNlIHZlcnNpb24gb2YgYSBjb21tb24gdXNlIGNhc2Ugb2YgYGZpbHRlcmA6IHNlbGVjdGluZyBvbmx5IG9iamVjdHNcbiAgLy8gY29udGFpbmluZyBzcGVjaWZpYyBga2V5OnZhbHVlYCBwYWlycy5cbiAgXy53aGVyZSA9IGZ1bmN0aW9uKG9iaiwgYXR0cnMpIHtcbiAgICByZXR1cm4gXy5maWx0ZXIob2JqLCBfLm1hdGNoZXIoYXR0cnMpKTtcbiAgfTtcblxuICAvLyBDb252ZW5pZW5jZSB2ZXJzaW9uIG9mIGEgY29tbW9uIHVzZSBjYXNlIG9mIGBmaW5kYDogZ2V0dGluZyB0aGUgZmlyc3Qgb2JqZWN0XG4gIC8vIGNvbnRhaW5pbmcgc3BlY2lmaWMgYGtleTp2YWx1ZWAgcGFpcnMuXG4gIF8uZmluZFdoZXJlID0gZnVuY3Rpb24ob2JqLCBhdHRycykge1xuICAgIHJldHVybiBfLmZpbmQob2JqLCBfLm1hdGNoZXIoYXR0cnMpKTtcbiAgfTtcblxuICAvLyBSZXR1cm4gdGhlIG1heGltdW0gZWxlbWVudCAob3IgZWxlbWVudC1iYXNlZCBjb21wdXRhdGlvbikuXG4gIF8ubWF4ID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRlZSwgY29udGV4dCkge1xuICAgIHZhciByZXN1bHQgPSAtSW5maW5pdHksIGxhc3RDb21wdXRlZCA9IC1JbmZpbml0eSxcbiAgICAgICAgdmFsdWUsIGNvbXB1dGVkO1xuICAgIGlmIChpdGVyYXRlZSA9PSBudWxsICYmIG9iaiAhPSBudWxsKSB7XG4gICAgICBvYmogPSBpc0FycmF5TGlrZShvYmopID8gb2JqIDogXy52YWx1ZXMob2JqKTtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBvYmoubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFsdWUgPSBvYmpbaV07XG4gICAgICAgIGlmICh2YWx1ZSA+IHJlc3VsdCkge1xuICAgICAgICAgIHJlc3VsdCA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGl0ZXJhdGVlID0gY2IoaXRlcmF0ZWUsIGNvbnRleHQpO1xuICAgICAgXy5lYWNoKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICAgIGNvbXB1dGVkID0gaXRlcmF0ZWUodmFsdWUsIGluZGV4LCBsaXN0KTtcbiAgICAgICAgaWYgKGNvbXB1dGVkID4gbGFzdENvbXB1dGVkIHx8IGNvbXB1dGVkID09PSAtSW5maW5pdHkgJiYgcmVzdWx0ID09PSAtSW5maW5pdHkpIHtcbiAgICAgICAgICByZXN1bHQgPSB2YWx1ZTtcbiAgICAgICAgICBsYXN0Q29tcHV0ZWQgPSBjb21wdXRlZDtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgLy8gUmV0dXJuIHRoZSBtaW5pbXVtIGVsZW1lbnQgKG9yIGVsZW1lbnQtYmFzZWQgY29tcHV0YXRpb24pLlxuICBfLm1pbiA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0ZWUsIGNvbnRleHQpIHtcbiAgICB2YXIgcmVzdWx0ID0gSW5maW5pdHksIGxhc3RDb21wdXRlZCA9IEluZmluaXR5LFxuICAgICAgICB2YWx1ZSwgY29tcHV0ZWQ7XG4gICAgaWYgKGl0ZXJhdGVlID09IG51bGwgJiYgb2JqICE9IG51bGwpIHtcbiAgICAgIG9iaiA9IGlzQXJyYXlMaWtlKG9iaikgPyBvYmogOiBfLnZhbHVlcyhvYmopO1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IG9iai5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICB2YWx1ZSA9IG9ialtpXTtcbiAgICAgICAgaWYgKHZhbHVlIDwgcmVzdWx0KSB7XG4gICAgICAgICAgcmVzdWx0ID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaXRlcmF0ZWUgPSBjYihpdGVyYXRlZSwgY29udGV4dCk7XG4gICAgICBfLmVhY2gob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGxpc3QpIHtcbiAgICAgICAgY29tcHV0ZWQgPSBpdGVyYXRlZSh2YWx1ZSwgaW5kZXgsIGxpc3QpO1xuICAgICAgICBpZiAoY29tcHV0ZWQgPCBsYXN0Q29tcHV0ZWQgfHwgY29tcHV0ZWQgPT09IEluZmluaXR5ICYmIHJlc3VsdCA9PT0gSW5maW5pdHkpIHtcbiAgICAgICAgICByZXN1bHQgPSB2YWx1ZTtcbiAgICAgICAgICBsYXN0Q29tcHV0ZWQgPSBjb21wdXRlZDtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgLy8gU2h1ZmZsZSBhIGNvbGxlY3Rpb24sIHVzaW5nIHRoZSBtb2Rlcm4gdmVyc2lvbiBvZiB0aGVcbiAgLy8gW0Zpc2hlci1ZYXRlcyBzaHVmZmxlXShodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0Zpc2hlcuKAk1lhdGVzX3NodWZmbGUpLlxuICBfLnNodWZmbGUgPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIgc2V0ID0gaXNBcnJheUxpa2Uob2JqKSA/IG9iaiA6IF8udmFsdWVzKG9iaik7XG4gICAgdmFyIGxlbmd0aCA9IHNldC5sZW5ndGg7XG4gICAgdmFyIHNodWZmbGVkID0gQXJyYXkobGVuZ3RoKTtcbiAgICBmb3IgKHZhciBpbmRleCA9IDAsIHJhbmQ7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICByYW5kID0gXy5yYW5kb20oMCwgaW5kZXgpO1xuICAgICAgaWYgKHJhbmQgIT09IGluZGV4KSBzaHVmZmxlZFtpbmRleF0gPSBzaHVmZmxlZFtyYW5kXTtcbiAgICAgIHNodWZmbGVkW3JhbmRdID0gc2V0W2luZGV4XTtcbiAgICB9XG4gICAgcmV0dXJuIHNodWZmbGVkO1xuICB9O1xuXG4gIC8vIFNhbXBsZSAqKm4qKiByYW5kb20gdmFsdWVzIGZyb20gYSBjb2xsZWN0aW9uLlxuICAvLyBJZiAqKm4qKiBpcyBub3Qgc3BlY2lmaWVkLCByZXR1cm5zIGEgc2luZ2xlIHJhbmRvbSBlbGVtZW50LlxuICAvLyBUaGUgaW50ZXJuYWwgYGd1YXJkYCBhcmd1bWVudCBhbGxvd3MgaXQgdG8gd29yayB3aXRoIGBtYXBgLlxuICBfLnNhbXBsZSA9IGZ1bmN0aW9uKG9iaiwgbiwgZ3VhcmQpIHtcbiAgICBpZiAobiA9PSBudWxsIHx8IGd1YXJkKSB7XG4gICAgICBpZiAoIWlzQXJyYXlMaWtlKG9iaikpIG9iaiA9IF8udmFsdWVzKG9iaik7XG4gICAgICByZXR1cm4gb2JqW18ucmFuZG9tKG9iai5sZW5ndGggLSAxKV07XG4gICAgfVxuICAgIHJldHVybiBfLnNodWZmbGUob2JqKS5zbGljZSgwLCBNYXRoLm1heCgwLCBuKSk7XG4gIH07XG5cbiAgLy8gU29ydCB0aGUgb2JqZWN0J3MgdmFsdWVzIGJ5IGEgY3JpdGVyaW9uIHByb2R1Y2VkIGJ5IGFuIGl0ZXJhdGVlLlxuICBfLnNvcnRCeSA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0ZWUsIGNvbnRleHQpIHtcbiAgICBpdGVyYXRlZSA9IGNiKGl0ZXJhdGVlLCBjb250ZXh0KTtcbiAgICByZXR1cm4gXy5wbHVjayhfLm1hcChvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgbGlzdCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICBpbmRleDogaW5kZXgsXG4gICAgICAgIGNyaXRlcmlhOiBpdGVyYXRlZSh2YWx1ZSwgaW5kZXgsIGxpc3QpXG4gICAgICB9O1xuICAgIH0pLnNvcnQoZnVuY3Rpb24obGVmdCwgcmlnaHQpIHtcbiAgICAgIHZhciBhID0gbGVmdC5jcml0ZXJpYTtcbiAgICAgIHZhciBiID0gcmlnaHQuY3JpdGVyaWE7XG4gICAgICBpZiAoYSAhPT0gYikge1xuICAgICAgICBpZiAoYSA+IGIgfHwgYSA9PT0gdm9pZCAwKSByZXR1cm4gMTtcbiAgICAgICAgaWYgKGEgPCBiIHx8IGIgPT09IHZvaWQgMCkgcmV0dXJuIC0xO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGxlZnQuaW5kZXggLSByaWdodC5pbmRleDtcbiAgICB9KSwgJ3ZhbHVlJyk7XG4gIH07XG5cbiAgLy8gQW4gaW50ZXJuYWwgZnVuY3Rpb24gdXNlZCBmb3IgYWdncmVnYXRlIFwiZ3JvdXAgYnlcIiBvcGVyYXRpb25zLlxuICB2YXIgZ3JvdXAgPSBmdW5jdGlvbihiZWhhdmlvcikge1xuICAgIHJldHVybiBmdW5jdGlvbihvYmosIGl0ZXJhdGVlLCBjb250ZXh0KSB7XG4gICAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgICBpdGVyYXRlZSA9IGNiKGl0ZXJhdGVlLCBjb250ZXh0KTtcbiAgICAgIF8uZWFjaChvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCkge1xuICAgICAgICB2YXIga2V5ID0gaXRlcmF0ZWUodmFsdWUsIGluZGV4LCBvYmopO1xuICAgICAgICBiZWhhdmlvcihyZXN1bHQsIHZhbHVlLCBrZXkpO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG4gIH07XG5cbiAgLy8gR3JvdXBzIHRoZSBvYmplY3QncyB2YWx1ZXMgYnkgYSBjcml0ZXJpb24uIFBhc3MgZWl0aGVyIGEgc3RyaW5nIGF0dHJpYnV0ZVxuICAvLyB0byBncm91cCBieSwgb3IgYSBmdW5jdGlvbiB0aGF0IHJldHVybnMgdGhlIGNyaXRlcmlvbi5cbiAgXy5ncm91cEJ5ID0gZ3JvdXAoZnVuY3Rpb24ocmVzdWx0LCB2YWx1ZSwga2V5KSB7XG4gICAgaWYgKF8uaGFzKHJlc3VsdCwga2V5KSkgcmVzdWx0W2tleV0ucHVzaCh2YWx1ZSk7IGVsc2UgcmVzdWx0W2tleV0gPSBbdmFsdWVdO1xuICB9KTtcblxuICAvLyBJbmRleGVzIHRoZSBvYmplY3QncyB2YWx1ZXMgYnkgYSBjcml0ZXJpb24sIHNpbWlsYXIgdG8gYGdyb3VwQnlgLCBidXQgZm9yXG4gIC8vIHdoZW4geW91IGtub3cgdGhhdCB5b3VyIGluZGV4IHZhbHVlcyB3aWxsIGJlIHVuaXF1ZS5cbiAgXy5pbmRleEJ5ID0gZ3JvdXAoZnVuY3Rpb24ocmVzdWx0LCB2YWx1ZSwga2V5KSB7XG4gICAgcmVzdWx0W2tleV0gPSB2YWx1ZTtcbiAgfSk7XG5cbiAgLy8gQ291bnRzIGluc3RhbmNlcyBvZiBhbiBvYmplY3QgdGhhdCBncm91cCBieSBhIGNlcnRhaW4gY3JpdGVyaW9uLiBQYXNzXG4gIC8vIGVpdGhlciBhIHN0cmluZyBhdHRyaWJ1dGUgdG8gY291bnQgYnksIG9yIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHRoZVxuICAvLyBjcml0ZXJpb24uXG4gIF8uY291bnRCeSA9IGdyb3VwKGZ1bmN0aW9uKHJlc3VsdCwgdmFsdWUsIGtleSkge1xuICAgIGlmIChfLmhhcyhyZXN1bHQsIGtleSkpIHJlc3VsdFtrZXldKys7IGVsc2UgcmVzdWx0W2tleV0gPSAxO1xuICB9KTtcblxuICAvLyBTYWZlbHkgY3JlYXRlIGEgcmVhbCwgbGl2ZSBhcnJheSBmcm9tIGFueXRoaW5nIGl0ZXJhYmxlLlxuICBfLnRvQXJyYXkgPSBmdW5jdGlvbihvYmopIHtcbiAgICBpZiAoIW9iaikgcmV0dXJuIFtdO1xuICAgIGlmIChfLmlzQXJyYXkob2JqKSkgcmV0dXJuIHNsaWNlLmNhbGwob2JqKTtcbiAgICBpZiAoaXNBcnJheUxpa2Uob2JqKSkgcmV0dXJuIF8ubWFwKG9iaiwgXy5pZGVudGl0eSk7XG4gICAgcmV0dXJuIF8udmFsdWVzKG9iaik7XG4gIH07XG5cbiAgLy8gUmV0dXJuIHRoZSBudW1iZXIgb2YgZWxlbWVudHMgaW4gYW4gb2JqZWN0LlxuICBfLnNpemUgPSBmdW5jdGlvbihvYmopIHtcbiAgICBpZiAob2JqID09IG51bGwpIHJldHVybiAwO1xuICAgIHJldHVybiBpc0FycmF5TGlrZShvYmopID8gb2JqLmxlbmd0aCA6IF8ua2V5cyhvYmopLmxlbmd0aDtcbiAgfTtcblxuICAvLyBTcGxpdCBhIGNvbGxlY3Rpb24gaW50byB0d28gYXJyYXlzOiBvbmUgd2hvc2UgZWxlbWVudHMgYWxsIHNhdGlzZnkgdGhlIGdpdmVuXG4gIC8vIHByZWRpY2F0ZSwgYW5kIG9uZSB3aG9zZSBlbGVtZW50cyBhbGwgZG8gbm90IHNhdGlzZnkgdGhlIHByZWRpY2F0ZS5cbiAgXy5wYXJ0aXRpb24gPSBmdW5jdGlvbihvYmosIHByZWRpY2F0ZSwgY29udGV4dCkge1xuICAgIHByZWRpY2F0ZSA9IGNiKHByZWRpY2F0ZSwgY29udGV4dCk7XG4gICAgdmFyIHBhc3MgPSBbXSwgZmFpbCA9IFtdO1xuICAgIF8uZWFjaChvYmosIGZ1bmN0aW9uKHZhbHVlLCBrZXksIG9iaikge1xuICAgICAgKHByZWRpY2F0ZSh2YWx1ZSwga2V5LCBvYmopID8gcGFzcyA6IGZhaWwpLnB1c2godmFsdWUpO1xuICAgIH0pO1xuICAgIHJldHVybiBbcGFzcywgZmFpbF07XG4gIH07XG5cbiAgLy8gQXJyYXkgRnVuY3Rpb25zXG4gIC8vIC0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIEdldCB0aGUgZmlyc3QgZWxlbWVudCBvZiBhbiBhcnJheS4gUGFzc2luZyAqKm4qKiB3aWxsIHJldHVybiB0aGUgZmlyc3QgTlxuICAvLyB2YWx1ZXMgaW4gdGhlIGFycmF5LiBBbGlhc2VkIGFzIGBoZWFkYCBhbmQgYHRha2VgLiBUaGUgKipndWFyZCoqIGNoZWNrXG4gIC8vIGFsbG93cyBpdCB0byB3b3JrIHdpdGggYF8ubWFwYC5cbiAgXy5maXJzdCA9IF8uaGVhZCA9IF8udGFrZSA9IGZ1bmN0aW9uKGFycmF5LCBuLCBndWFyZCkge1xuICAgIGlmIChhcnJheSA9PSBudWxsKSByZXR1cm4gdm9pZCAwO1xuICAgIGlmIChuID09IG51bGwgfHwgZ3VhcmQpIHJldHVybiBhcnJheVswXTtcbiAgICByZXR1cm4gXy5pbml0aWFsKGFycmF5LCBhcnJheS5sZW5ndGggLSBuKTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGV2ZXJ5dGhpbmcgYnV0IHRoZSBsYXN0IGVudHJ5IG9mIHRoZSBhcnJheS4gRXNwZWNpYWxseSB1c2VmdWwgb25cbiAgLy8gdGhlIGFyZ3VtZW50cyBvYmplY3QuIFBhc3NpbmcgKipuKiogd2lsbCByZXR1cm4gYWxsIHRoZSB2YWx1ZXMgaW5cbiAgLy8gdGhlIGFycmF5LCBleGNsdWRpbmcgdGhlIGxhc3QgTi5cbiAgXy5pbml0aWFsID0gZnVuY3Rpb24oYXJyYXksIG4sIGd1YXJkKSB7XG4gICAgcmV0dXJuIHNsaWNlLmNhbGwoYXJyYXksIDAsIE1hdGgubWF4KDAsIGFycmF5Lmxlbmd0aCAtIChuID09IG51bGwgfHwgZ3VhcmQgPyAxIDogbikpKTtcbiAgfTtcblxuICAvLyBHZXQgdGhlIGxhc3QgZWxlbWVudCBvZiBhbiBhcnJheS4gUGFzc2luZyAqKm4qKiB3aWxsIHJldHVybiB0aGUgbGFzdCBOXG4gIC8vIHZhbHVlcyBpbiB0aGUgYXJyYXkuXG4gIF8ubGFzdCA9IGZ1bmN0aW9uKGFycmF5LCBuLCBndWFyZCkge1xuICAgIGlmIChhcnJheSA9PSBudWxsKSByZXR1cm4gdm9pZCAwO1xuICAgIGlmIChuID09IG51bGwgfHwgZ3VhcmQpIHJldHVybiBhcnJheVthcnJheS5sZW5ndGggLSAxXTtcbiAgICByZXR1cm4gXy5yZXN0KGFycmF5LCBNYXRoLm1heCgwLCBhcnJheS5sZW5ndGggLSBuKSk7XG4gIH07XG5cbiAgLy8gUmV0dXJucyBldmVyeXRoaW5nIGJ1dCB0aGUgZmlyc3QgZW50cnkgb2YgdGhlIGFycmF5LiBBbGlhc2VkIGFzIGB0YWlsYCBhbmQgYGRyb3BgLlxuICAvLyBFc3BlY2lhbGx5IHVzZWZ1bCBvbiB0aGUgYXJndW1lbnRzIG9iamVjdC4gUGFzc2luZyBhbiAqKm4qKiB3aWxsIHJldHVyblxuICAvLyB0aGUgcmVzdCBOIHZhbHVlcyBpbiB0aGUgYXJyYXkuXG4gIF8ucmVzdCA9IF8udGFpbCA9IF8uZHJvcCA9IGZ1bmN0aW9uKGFycmF5LCBuLCBndWFyZCkge1xuICAgIHJldHVybiBzbGljZS5jYWxsKGFycmF5LCBuID09IG51bGwgfHwgZ3VhcmQgPyAxIDogbik7XG4gIH07XG5cbiAgLy8gVHJpbSBvdXQgYWxsIGZhbHN5IHZhbHVlcyBmcm9tIGFuIGFycmF5LlxuICBfLmNvbXBhY3QgPSBmdW5jdGlvbihhcnJheSkge1xuICAgIHJldHVybiBfLmZpbHRlcihhcnJheSwgXy5pZGVudGl0eSk7XG4gIH07XG5cbiAgLy8gSW50ZXJuYWwgaW1wbGVtZW50YXRpb24gb2YgYSByZWN1cnNpdmUgYGZsYXR0ZW5gIGZ1bmN0aW9uLlxuICB2YXIgZmxhdHRlbiA9IGZ1bmN0aW9uKGlucHV0LCBzaGFsbG93LCBzdHJpY3QsIHN0YXJ0SW5kZXgpIHtcbiAgICB2YXIgb3V0cHV0ID0gW10sIGlkeCA9IDA7XG4gICAgZm9yICh2YXIgaSA9IHN0YXJ0SW5kZXggfHwgMCwgbGVuZ3RoID0gZ2V0TGVuZ3RoKGlucHV0KTsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgdmFsdWUgPSBpbnB1dFtpXTtcbiAgICAgIGlmIChpc0FycmF5TGlrZSh2YWx1ZSkgJiYgKF8uaXNBcnJheSh2YWx1ZSkgfHwgXy5pc0FyZ3VtZW50cyh2YWx1ZSkpKSB7XG4gICAgICAgIC8vZmxhdHRlbiBjdXJyZW50IGxldmVsIG9mIGFycmF5IG9yIGFyZ3VtZW50cyBvYmplY3RcbiAgICAgICAgaWYgKCFzaGFsbG93KSB2YWx1ZSA9IGZsYXR0ZW4odmFsdWUsIHNoYWxsb3csIHN0cmljdCk7XG4gICAgICAgIHZhciBqID0gMCwgbGVuID0gdmFsdWUubGVuZ3RoO1xuICAgICAgICBvdXRwdXQubGVuZ3RoICs9IGxlbjtcbiAgICAgICAgd2hpbGUgKGogPCBsZW4pIHtcbiAgICAgICAgICBvdXRwdXRbaWR4KytdID0gdmFsdWVbaisrXTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICghc3RyaWN0KSB7XG4gICAgICAgIG91dHB1dFtpZHgrK10gPSB2YWx1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG91dHB1dDtcbiAgfTtcblxuICAvLyBGbGF0dGVuIG91dCBhbiBhcnJheSwgZWl0aGVyIHJlY3Vyc2l2ZWx5IChieSBkZWZhdWx0KSwgb3IganVzdCBvbmUgbGV2ZWwuXG4gIF8uZmxhdHRlbiA9IGZ1bmN0aW9uKGFycmF5LCBzaGFsbG93KSB7XG4gICAgcmV0dXJuIGZsYXR0ZW4oYXJyYXksIHNoYWxsb3csIGZhbHNlKTtcbiAgfTtcblxuICAvLyBSZXR1cm4gYSB2ZXJzaW9uIG9mIHRoZSBhcnJheSB0aGF0IGRvZXMgbm90IGNvbnRhaW4gdGhlIHNwZWNpZmllZCB2YWx1ZShzKS5cbiAgXy53aXRob3V0ID0gZnVuY3Rpb24oYXJyYXkpIHtcbiAgICByZXR1cm4gXy5kaWZmZXJlbmNlKGFycmF5LCBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSkpO1xuICB9O1xuXG4gIC8vIFByb2R1Y2UgYSBkdXBsaWNhdGUtZnJlZSB2ZXJzaW9uIG9mIHRoZSBhcnJheS4gSWYgdGhlIGFycmF5IGhhcyBhbHJlYWR5XG4gIC8vIGJlZW4gc29ydGVkLCB5b3UgaGF2ZSB0aGUgb3B0aW9uIG9mIHVzaW5nIGEgZmFzdGVyIGFsZ29yaXRobS5cbiAgLy8gQWxpYXNlZCBhcyBgdW5pcXVlYC5cbiAgXy51bmlxID0gXy51bmlxdWUgPSBmdW5jdGlvbihhcnJheSwgaXNTb3J0ZWQsIGl0ZXJhdGVlLCBjb250ZXh0KSB7XG4gICAgaWYgKCFfLmlzQm9vbGVhbihpc1NvcnRlZCkpIHtcbiAgICAgIGNvbnRleHQgPSBpdGVyYXRlZTtcbiAgICAgIGl0ZXJhdGVlID0gaXNTb3J0ZWQ7XG4gICAgICBpc1NvcnRlZCA9IGZhbHNlO1xuICAgIH1cbiAgICBpZiAoaXRlcmF0ZWUgIT0gbnVsbCkgaXRlcmF0ZWUgPSBjYihpdGVyYXRlZSwgY29udGV4dCk7XG4gICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgIHZhciBzZWVuID0gW107XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGdldExlbmd0aChhcnJheSk7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHZhbHVlID0gYXJyYXlbaV0sXG4gICAgICAgICAgY29tcHV0ZWQgPSBpdGVyYXRlZSA/IGl0ZXJhdGVlKHZhbHVlLCBpLCBhcnJheSkgOiB2YWx1ZTtcbiAgICAgIGlmIChpc1NvcnRlZCkge1xuICAgICAgICBpZiAoIWkgfHwgc2VlbiAhPT0gY29tcHV0ZWQpIHJlc3VsdC5wdXNoKHZhbHVlKTtcbiAgICAgICAgc2VlbiA9IGNvbXB1dGVkO1xuICAgICAgfSBlbHNlIGlmIChpdGVyYXRlZSkge1xuICAgICAgICBpZiAoIV8uY29udGFpbnMoc2VlbiwgY29tcHV0ZWQpKSB7XG4gICAgICAgICAgc2Vlbi5wdXNoKGNvbXB1dGVkKTtcbiAgICAgICAgICByZXN1bHQucHVzaCh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoIV8uY29udGFpbnMocmVzdWx0LCB2YWx1ZSkpIHtcbiAgICAgICAgcmVzdWx0LnB1c2godmFsdWUpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8vIFByb2R1Y2UgYW4gYXJyYXkgdGhhdCBjb250YWlucyB0aGUgdW5pb246IGVhY2ggZGlzdGluY3QgZWxlbWVudCBmcm9tIGFsbCBvZlxuICAvLyB0aGUgcGFzc2VkLWluIGFycmF5cy5cbiAgXy51bmlvbiA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBfLnVuaXEoZmxhdHRlbihhcmd1bWVudHMsIHRydWUsIHRydWUpKTtcbiAgfTtcblxuICAvLyBQcm9kdWNlIGFuIGFycmF5IHRoYXQgY29udGFpbnMgZXZlcnkgaXRlbSBzaGFyZWQgYmV0d2VlbiBhbGwgdGhlXG4gIC8vIHBhc3NlZC1pbiBhcnJheXMuXG4gIF8uaW50ZXJzZWN0aW9uID0gZnVuY3Rpb24oYXJyYXkpIHtcbiAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgdmFyIGFyZ3NMZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBnZXRMZW5ndGgoYXJyYXkpOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBpdGVtID0gYXJyYXlbaV07XG4gICAgICBpZiAoXy5jb250YWlucyhyZXN1bHQsIGl0ZW0pKSBjb250aW51ZTtcbiAgICAgIGZvciAodmFyIGogPSAxOyBqIDwgYXJnc0xlbmd0aDsgaisrKSB7XG4gICAgICAgIGlmICghXy5jb250YWlucyhhcmd1bWVudHNbal0sIGl0ZW0pKSBicmVhaztcbiAgICAgIH1cbiAgICAgIGlmIChqID09PSBhcmdzTGVuZ3RoKSByZXN1bHQucHVzaChpdGVtKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBUYWtlIHRoZSBkaWZmZXJlbmNlIGJldHdlZW4gb25lIGFycmF5IGFuZCBhIG51bWJlciBvZiBvdGhlciBhcnJheXMuXG4gIC8vIE9ubHkgdGhlIGVsZW1lbnRzIHByZXNlbnQgaW4ganVzdCB0aGUgZmlyc3QgYXJyYXkgd2lsbCByZW1haW4uXG4gIF8uZGlmZmVyZW5jZSA9IGZ1bmN0aW9uKGFycmF5KSB7XG4gICAgdmFyIHJlc3QgPSBmbGF0dGVuKGFyZ3VtZW50cywgdHJ1ZSwgdHJ1ZSwgMSk7XG4gICAgcmV0dXJuIF8uZmlsdGVyKGFycmF5LCBmdW5jdGlvbih2YWx1ZSl7XG4gICAgICByZXR1cm4gIV8uY29udGFpbnMocmVzdCwgdmFsdWUpO1xuICAgIH0pO1xuICB9O1xuXG4gIC8vIFppcCB0b2dldGhlciBtdWx0aXBsZSBsaXN0cyBpbnRvIGEgc2luZ2xlIGFycmF5IC0tIGVsZW1lbnRzIHRoYXQgc2hhcmVcbiAgLy8gYW4gaW5kZXggZ28gdG9nZXRoZXIuXG4gIF8uemlwID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIF8udW56aXAoYXJndW1lbnRzKTtcbiAgfTtcblxuICAvLyBDb21wbGVtZW50IG9mIF8uemlwLiBVbnppcCBhY2NlcHRzIGFuIGFycmF5IG9mIGFycmF5cyBhbmQgZ3JvdXBzXG4gIC8vIGVhY2ggYXJyYXkncyBlbGVtZW50cyBvbiBzaGFyZWQgaW5kaWNlc1xuICBfLnVuemlwID0gZnVuY3Rpb24oYXJyYXkpIHtcbiAgICB2YXIgbGVuZ3RoID0gYXJyYXkgJiYgXy5tYXgoYXJyYXksIGdldExlbmd0aCkubGVuZ3RoIHx8IDA7XG4gICAgdmFyIHJlc3VsdCA9IEFycmF5KGxlbmd0aCk7XG5cbiAgICBmb3IgKHZhciBpbmRleCA9IDA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICByZXN1bHRbaW5kZXhdID0gXy5wbHVjayhhcnJheSwgaW5kZXgpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8vIENvbnZlcnRzIGxpc3RzIGludG8gb2JqZWN0cy4gUGFzcyBlaXRoZXIgYSBzaW5nbGUgYXJyYXkgb2YgYFtrZXksIHZhbHVlXWBcbiAgLy8gcGFpcnMsIG9yIHR3byBwYXJhbGxlbCBhcnJheXMgb2YgdGhlIHNhbWUgbGVuZ3RoIC0tIG9uZSBvZiBrZXlzLCBhbmQgb25lIG9mXG4gIC8vIHRoZSBjb3JyZXNwb25kaW5nIHZhbHVlcy5cbiAgXy5vYmplY3QgPSBmdW5jdGlvbihsaXN0LCB2YWx1ZXMpIHtcbiAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGdldExlbmd0aChsaXN0KTsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAodmFsdWVzKSB7XG4gICAgICAgIHJlc3VsdFtsaXN0W2ldXSA9IHZhbHVlc1tpXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc3VsdFtsaXN0W2ldWzBdXSA9IGxpc3RbaV1bMV07XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgLy8gR2VuZXJhdG9yIGZ1bmN0aW9uIHRvIGNyZWF0ZSB0aGUgZmluZEluZGV4IGFuZCBmaW5kTGFzdEluZGV4IGZ1bmN0aW9uc1xuICBmdW5jdGlvbiBjcmVhdGVQcmVkaWNhdGVJbmRleEZpbmRlcihkaXIpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oYXJyYXksIHByZWRpY2F0ZSwgY29udGV4dCkge1xuICAgICAgcHJlZGljYXRlID0gY2IocHJlZGljYXRlLCBjb250ZXh0KTtcbiAgICAgIHZhciBsZW5ndGggPSBnZXRMZW5ndGgoYXJyYXkpO1xuICAgICAgdmFyIGluZGV4ID0gZGlyID4gMCA/IDAgOiBsZW5ndGggLSAxO1xuICAgICAgZm9yICg7IGluZGV4ID49IDAgJiYgaW5kZXggPCBsZW5ndGg7IGluZGV4ICs9IGRpcikge1xuICAgICAgICBpZiAocHJlZGljYXRlKGFycmF5W2luZGV4XSwgaW5kZXgsIGFycmF5KSkgcmV0dXJuIGluZGV4O1xuICAgICAgfVxuICAgICAgcmV0dXJuIC0xO1xuICAgIH07XG4gIH1cblxuICAvLyBSZXR1cm5zIHRoZSBmaXJzdCBpbmRleCBvbiBhbiBhcnJheS1saWtlIHRoYXQgcGFzc2VzIGEgcHJlZGljYXRlIHRlc3RcbiAgXy5maW5kSW5kZXggPSBjcmVhdGVQcmVkaWNhdGVJbmRleEZpbmRlcigxKTtcbiAgXy5maW5kTGFzdEluZGV4ID0gY3JlYXRlUHJlZGljYXRlSW5kZXhGaW5kZXIoLTEpO1xuXG4gIC8vIFVzZSBhIGNvbXBhcmF0b3IgZnVuY3Rpb24gdG8gZmlndXJlIG91dCB0aGUgc21hbGxlc3QgaW5kZXggYXQgd2hpY2hcbiAgLy8gYW4gb2JqZWN0IHNob3VsZCBiZSBpbnNlcnRlZCBzbyBhcyB0byBtYWludGFpbiBvcmRlci4gVXNlcyBiaW5hcnkgc2VhcmNoLlxuICBfLnNvcnRlZEluZGV4ID0gZnVuY3Rpb24oYXJyYXksIG9iaiwgaXRlcmF0ZWUsIGNvbnRleHQpIHtcbiAgICBpdGVyYXRlZSA9IGNiKGl0ZXJhdGVlLCBjb250ZXh0LCAxKTtcbiAgICB2YXIgdmFsdWUgPSBpdGVyYXRlZShvYmopO1xuICAgIHZhciBsb3cgPSAwLCBoaWdoID0gZ2V0TGVuZ3RoKGFycmF5KTtcbiAgICB3aGlsZSAobG93IDwgaGlnaCkge1xuICAgICAgdmFyIG1pZCA9IE1hdGguZmxvb3IoKGxvdyArIGhpZ2gpIC8gMik7XG4gICAgICBpZiAoaXRlcmF0ZWUoYXJyYXlbbWlkXSkgPCB2YWx1ZSkgbG93ID0gbWlkICsgMTsgZWxzZSBoaWdoID0gbWlkO1xuICAgIH1cbiAgICByZXR1cm4gbG93O1xuICB9O1xuXG4gIC8vIEdlbmVyYXRvciBmdW5jdGlvbiB0byBjcmVhdGUgdGhlIGluZGV4T2YgYW5kIGxhc3RJbmRleE9mIGZ1bmN0aW9uc1xuICBmdW5jdGlvbiBjcmVhdGVJbmRleEZpbmRlcihkaXIsIHByZWRpY2F0ZUZpbmQsIHNvcnRlZEluZGV4KSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGFycmF5LCBpdGVtLCBpZHgpIHtcbiAgICAgIHZhciBpID0gMCwgbGVuZ3RoID0gZ2V0TGVuZ3RoKGFycmF5KTtcbiAgICAgIGlmICh0eXBlb2YgaWR4ID09ICdudW1iZXInKSB7XG4gICAgICAgIGlmIChkaXIgPiAwKSB7XG4gICAgICAgICAgICBpID0gaWR4ID49IDAgPyBpZHggOiBNYXRoLm1heChpZHggKyBsZW5ndGgsIGkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGVuZ3RoID0gaWR4ID49IDAgPyBNYXRoLm1pbihpZHggKyAxLCBsZW5ndGgpIDogaWR4ICsgbGVuZ3RoICsgMTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChzb3J0ZWRJbmRleCAmJiBpZHggJiYgbGVuZ3RoKSB7XG4gICAgICAgIGlkeCA9IHNvcnRlZEluZGV4KGFycmF5LCBpdGVtKTtcbiAgICAgICAgcmV0dXJuIGFycmF5W2lkeF0gPT09IGl0ZW0gPyBpZHggOiAtMTtcbiAgICAgIH1cbiAgICAgIGlmIChpdGVtICE9PSBpdGVtKSB7XG4gICAgICAgIGlkeCA9IHByZWRpY2F0ZUZpbmQoc2xpY2UuY2FsbChhcnJheSwgaSwgbGVuZ3RoKSwgXy5pc05hTik7XG4gICAgICAgIHJldHVybiBpZHggPj0gMCA/IGlkeCArIGkgOiAtMTtcbiAgICAgIH1cbiAgICAgIGZvciAoaWR4ID0gZGlyID4gMCA/IGkgOiBsZW5ndGggLSAxOyBpZHggPj0gMCAmJiBpZHggPCBsZW5ndGg7IGlkeCArPSBkaXIpIHtcbiAgICAgICAgaWYgKGFycmF5W2lkeF0gPT09IGl0ZW0pIHJldHVybiBpZHg7XG4gICAgICB9XG4gICAgICByZXR1cm4gLTE7XG4gICAgfTtcbiAgfVxuXG4gIC8vIFJldHVybiB0aGUgcG9zaXRpb24gb2YgdGhlIGZpcnN0IG9jY3VycmVuY2Ugb2YgYW4gaXRlbSBpbiBhbiBhcnJheSxcbiAgLy8gb3IgLTEgaWYgdGhlIGl0ZW0gaXMgbm90IGluY2x1ZGVkIGluIHRoZSBhcnJheS5cbiAgLy8gSWYgdGhlIGFycmF5IGlzIGxhcmdlIGFuZCBhbHJlYWR5IGluIHNvcnQgb3JkZXIsIHBhc3MgYHRydWVgXG4gIC8vIGZvciAqKmlzU29ydGVkKiogdG8gdXNlIGJpbmFyeSBzZWFyY2guXG4gIF8uaW5kZXhPZiA9IGNyZWF0ZUluZGV4RmluZGVyKDEsIF8uZmluZEluZGV4LCBfLnNvcnRlZEluZGV4KTtcbiAgXy5sYXN0SW5kZXhPZiA9IGNyZWF0ZUluZGV4RmluZGVyKC0xLCBfLmZpbmRMYXN0SW5kZXgpO1xuXG4gIC8vIEdlbmVyYXRlIGFuIGludGVnZXIgQXJyYXkgY29udGFpbmluZyBhbiBhcml0aG1ldGljIHByb2dyZXNzaW9uLiBBIHBvcnQgb2ZcbiAgLy8gdGhlIG5hdGl2ZSBQeXRob24gYHJhbmdlKClgIGZ1bmN0aW9uLiBTZWVcbiAgLy8gW3RoZSBQeXRob24gZG9jdW1lbnRhdGlvbl0oaHR0cDovL2RvY3MucHl0aG9uLm9yZy9saWJyYXJ5L2Z1bmN0aW9ucy5odG1sI3JhbmdlKS5cbiAgXy5yYW5nZSA9IGZ1bmN0aW9uKHN0YXJ0LCBzdG9wLCBzdGVwKSB7XG4gICAgaWYgKHN0b3AgPT0gbnVsbCkge1xuICAgICAgc3RvcCA9IHN0YXJ0IHx8IDA7XG4gICAgICBzdGFydCA9IDA7XG4gICAgfVxuICAgIHN0ZXAgPSBzdGVwIHx8IDE7XG5cbiAgICB2YXIgbGVuZ3RoID0gTWF0aC5tYXgoTWF0aC5jZWlsKChzdG9wIC0gc3RhcnQpIC8gc3RlcCksIDApO1xuICAgIHZhciByYW5nZSA9IEFycmF5KGxlbmd0aCk7XG5cbiAgICBmb3IgKHZhciBpZHggPSAwOyBpZHggPCBsZW5ndGg7IGlkeCsrLCBzdGFydCArPSBzdGVwKSB7XG4gICAgICByYW5nZVtpZHhdID0gc3RhcnQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJhbmdlO1xuICB9O1xuXG4gIC8vIEZ1bmN0aW9uIChhaGVtKSBGdW5jdGlvbnNcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gRGV0ZXJtaW5lcyB3aGV0aGVyIHRvIGV4ZWN1dGUgYSBmdW5jdGlvbiBhcyBhIGNvbnN0cnVjdG9yXG4gIC8vIG9yIGEgbm9ybWFsIGZ1bmN0aW9uIHdpdGggdGhlIHByb3ZpZGVkIGFyZ3VtZW50c1xuICB2YXIgZXhlY3V0ZUJvdW5kID0gZnVuY3Rpb24oc291cmNlRnVuYywgYm91bmRGdW5jLCBjb250ZXh0LCBjYWxsaW5nQ29udGV4dCwgYXJncykge1xuICAgIGlmICghKGNhbGxpbmdDb250ZXh0IGluc3RhbmNlb2YgYm91bmRGdW5jKSkgcmV0dXJuIHNvdXJjZUZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgdmFyIHNlbGYgPSBiYXNlQ3JlYXRlKHNvdXJjZUZ1bmMucHJvdG90eXBlKTtcbiAgICB2YXIgcmVzdWx0ID0gc291cmNlRnVuYy5hcHBseShzZWxmLCBhcmdzKTtcbiAgICBpZiAoXy5pc09iamVjdChyZXN1bHQpKSByZXR1cm4gcmVzdWx0O1xuICAgIHJldHVybiBzZWxmO1xuICB9O1xuXG4gIC8vIENyZWF0ZSBhIGZ1bmN0aW9uIGJvdW5kIHRvIGEgZ2l2ZW4gb2JqZWN0IChhc3NpZ25pbmcgYHRoaXNgLCBhbmQgYXJndW1lbnRzLFxuICAvLyBvcHRpb25hbGx5KS4gRGVsZWdhdGVzIHRvICoqRUNNQVNjcmlwdCA1KioncyBuYXRpdmUgYEZ1bmN0aW9uLmJpbmRgIGlmXG4gIC8vIGF2YWlsYWJsZS5cbiAgXy5iaW5kID0gZnVuY3Rpb24oZnVuYywgY29udGV4dCkge1xuICAgIGlmIChuYXRpdmVCaW5kICYmIGZ1bmMuYmluZCA9PT0gbmF0aXZlQmluZCkgcmV0dXJuIG5hdGl2ZUJpbmQuYXBwbHkoZnVuYywgc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpKTtcbiAgICBpZiAoIV8uaXNGdW5jdGlvbihmdW5jKSkgdGhyb3cgbmV3IFR5cGVFcnJvcignQmluZCBtdXN0IGJlIGNhbGxlZCBvbiBhIGZ1bmN0aW9uJyk7XG4gICAgdmFyIGFyZ3MgPSBzbGljZS5jYWxsKGFyZ3VtZW50cywgMik7XG4gICAgdmFyIGJvdW5kID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gZXhlY3V0ZUJvdW5kKGZ1bmMsIGJvdW5kLCBjb250ZXh0LCB0aGlzLCBhcmdzLmNvbmNhdChzbGljZS5jYWxsKGFyZ3VtZW50cykpKTtcbiAgICB9O1xuICAgIHJldHVybiBib3VuZDtcbiAgfTtcblxuICAvLyBQYXJ0aWFsbHkgYXBwbHkgYSBmdW5jdGlvbiBieSBjcmVhdGluZyBhIHZlcnNpb24gdGhhdCBoYXMgaGFkIHNvbWUgb2YgaXRzXG4gIC8vIGFyZ3VtZW50cyBwcmUtZmlsbGVkLCB3aXRob3V0IGNoYW5naW5nIGl0cyBkeW5hbWljIGB0aGlzYCBjb250ZXh0LiBfIGFjdHNcbiAgLy8gYXMgYSBwbGFjZWhvbGRlciwgYWxsb3dpbmcgYW55IGNvbWJpbmF0aW9uIG9mIGFyZ3VtZW50cyB0byBiZSBwcmUtZmlsbGVkLlxuICBfLnBhcnRpYWwgPSBmdW5jdGlvbihmdW5jKSB7XG4gICAgdmFyIGJvdW5kQXJncyA9IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICB2YXIgYm91bmQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBwb3NpdGlvbiA9IDAsIGxlbmd0aCA9IGJvdW5kQXJncy5sZW5ndGg7XG4gICAgICB2YXIgYXJncyA9IEFycmF5KGxlbmd0aCk7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGFyZ3NbaV0gPSBib3VuZEFyZ3NbaV0gPT09IF8gPyBhcmd1bWVudHNbcG9zaXRpb24rK10gOiBib3VuZEFyZ3NbaV07XG4gICAgICB9XG4gICAgICB3aGlsZSAocG9zaXRpb24gPCBhcmd1bWVudHMubGVuZ3RoKSBhcmdzLnB1c2goYXJndW1lbnRzW3Bvc2l0aW9uKytdKTtcbiAgICAgIHJldHVybiBleGVjdXRlQm91bmQoZnVuYywgYm91bmQsIHRoaXMsIHRoaXMsIGFyZ3MpO1xuICAgIH07XG4gICAgcmV0dXJuIGJvdW5kO1xuICB9O1xuXG4gIC8vIEJpbmQgYSBudW1iZXIgb2YgYW4gb2JqZWN0J3MgbWV0aG9kcyB0byB0aGF0IG9iamVjdC4gUmVtYWluaW5nIGFyZ3VtZW50c1xuICAvLyBhcmUgdGhlIG1ldGhvZCBuYW1lcyB0byBiZSBib3VuZC4gVXNlZnVsIGZvciBlbnN1cmluZyB0aGF0IGFsbCBjYWxsYmFja3NcbiAgLy8gZGVmaW5lZCBvbiBhbiBvYmplY3QgYmVsb25nIHRvIGl0LlxuICBfLmJpbmRBbGwgPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIgaSwgbGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aCwga2V5O1xuICAgIGlmIChsZW5ndGggPD0gMSkgdGhyb3cgbmV3IEVycm9yKCdiaW5kQWxsIG11c3QgYmUgcGFzc2VkIGZ1bmN0aW9uIG5hbWVzJyk7XG4gICAgZm9yIChpID0gMTsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBrZXkgPSBhcmd1bWVudHNbaV07XG4gICAgICBvYmpba2V5XSA9IF8uYmluZChvYmpba2V5XSwgb2JqKTtcbiAgICB9XG4gICAgcmV0dXJuIG9iajtcbiAgfTtcblxuICAvLyBNZW1vaXplIGFuIGV4cGVuc2l2ZSBmdW5jdGlvbiBieSBzdG9yaW5nIGl0cyByZXN1bHRzLlxuICBfLm1lbW9pemUgPSBmdW5jdGlvbihmdW5jLCBoYXNoZXIpIHtcbiAgICB2YXIgbWVtb2l6ZSA9IGZ1bmN0aW9uKGtleSkge1xuICAgICAgdmFyIGNhY2hlID0gbWVtb2l6ZS5jYWNoZTtcbiAgICAgIHZhciBhZGRyZXNzID0gJycgKyAoaGFzaGVyID8gaGFzaGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykgOiBrZXkpO1xuICAgICAgaWYgKCFfLmhhcyhjYWNoZSwgYWRkcmVzcykpIGNhY2hlW2FkZHJlc3NdID0gZnVuYy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgcmV0dXJuIGNhY2hlW2FkZHJlc3NdO1xuICAgIH07XG4gICAgbWVtb2l6ZS5jYWNoZSA9IHt9O1xuICAgIHJldHVybiBtZW1vaXplO1xuICB9O1xuXG4gIC8vIERlbGF5cyBhIGZ1bmN0aW9uIGZvciB0aGUgZ2l2ZW4gbnVtYmVyIG9mIG1pbGxpc2Vjb25kcywgYW5kIHRoZW4gY2FsbHNcbiAgLy8gaXQgd2l0aCB0aGUgYXJndW1lbnRzIHN1cHBsaWVkLlxuICBfLmRlbGF5ID0gZnVuY3Rpb24oZnVuYywgd2FpdCkge1xuICAgIHZhciBhcmdzID0gc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpO1xuICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gZnVuYy5hcHBseShudWxsLCBhcmdzKTtcbiAgICB9LCB3YWl0KTtcbiAgfTtcblxuICAvLyBEZWZlcnMgYSBmdW5jdGlvbiwgc2NoZWR1bGluZyBpdCB0byBydW4gYWZ0ZXIgdGhlIGN1cnJlbnQgY2FsbCBzdGFjayBoYXNcbiAgLy8gY2xlYXJlZC5cbiAgXy5kZWZlciA9IF8ucGFydGlhbChfLmRlbGF5LCBfLCAxKTtcblxuICAvLyBSZXR1cm5zIGEgZnVuY3Rpb24sIHRoYXQsIHdoZW4gaW52b2tlZCwgd2lsbCBvbmx5IGJlIHRyaWdnZXJlZCBhdCBtb3N0IG9uY2VcbiAgLy8gZHVyaW5nIGEgZ2l2ZW4gd2luZG93IG9mIHRpbWUuIE5vcm1hbGx5LCB0aGUgdGhyb3R0bGVkIGZ1bmN0aW9uIHdpbGwgcnVuXG4gIC8vIGFzIG11Y2ggYXMgaXQgY2FuLCB3aXRob3V0IGV2ZXIgZ29pbmcgbW9yZSB0aGFuIG9uY2UgcGVyIGB3YWl0YCBkdXJhdGlvbjtcbiAgLy8gYnV0IGlmIHlvdSdkIGxpa2UgdG8gZGlzYWJsZSB0aGUgZXhlY3V0aW9uIG9uIHRoZSBsZWFkaW5nIGVkZ2UsIHBhc3NcbiAgLy8gYHtsZWFkaW5nOiBmYWxzZX1gLiBUbyBkaXNhYmxlIGV4ZWN1dGlvbiBvbiB0aGUgdHJhaWxpbmcgZWRnZSwgZGl0dG8uXG4gIF8udGhyb3R0bGUgPSBmdW5jdGlvbihmdW5jLCB3YWl0LCBvcHRpb25zKSB7XG4gICAgdmFyIGNvbnRleHQsIGFyZ3MsIHJlc3VsdDtcbiAgICB2YXIgdGltZW91dCA9IG51bGw7XG4gICAgdmFyIHByZXZpb3VzID0gMDtcbiAgICBpZiAoIW9wdGlvbnMpIG9wdGlvbnMgPSB7fTtcbiAgICB2YXIgbGF0ZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgIHByZXZpb3VzID0gb3B0aW9ucy5sZWFkaW5nID09PSBmYWxzZSA/IDAgOiBfLm5vdygpO1xuICAgICAgdGltZW91dCA9IG51bGw7XG4gICAgICByZXN1bHQgPSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgaWYgKCF0aW1lb3V0KSBjb250ZXh0ID0gYXJncyA9IG51bGw7XG4gICAgfTtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgbm93ID0gXy5ub3coKTtcbiAgICAgIGlmICghcHJldmlvdXMgJiYgb3B0aW9ucy5sZWFkaW5nID09PSBmYWxzZSkgcHJldmlvdXMgPSBub3c7XG4gICAgICB2YXIgcmVtYWluaW5nID0gd2FpdCAtIChub3cgLSBwcmV2aW91cyk7XG4gICAgICBjb250ZXh0ID0gdGhpcztcbiAgICAgIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICBpZiAocmVtYWluaW5nIDw9IDAgfHwgcmVtYWluaW5nID4gd2FpdCkge1xuICAgICAgICBpZiAodGltZW91dCkge1xuICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICAgICAgICB0aW1lb3V0ID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBwcmV2aW91cyA9IG5vdztcbiAgICAgICAgcmVzdWx0ID0gZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgICAgaWYgKCF0aW1lb3V0KSBjb250ZXh0ID0gYXJncyA9IG51bGw7XG4gICAgICB9IGVsc2UgaWYgKCF0aW1lb3V0ICYmIG9wdGlvbnMudHJhaWxpbmcgIT09IGZhbHNlKSB7XG4gICAgICAgIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGxhdGVyLCByZW1haW5pbmcpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuICB9O1xuXG4gIC8vIFJldHVybnMgYSBmdW5jdGlvbiwgdGhhdCwgYXMgbG9uZyBhcyBpdCBjb250aW51ZXMgdG8gYmUgaW52b2tlZCwgd2lsbCBub3RcbiAgLy8gYmUgdHJpZ2dlcmVkLiBUaGUgZnVuY3Rpb24gd2lsbCBiZSBjYWxsZWQgYWZ0ZXIgaXQgc3RvcHMgYmVpbmcgY2FsbGVkIGZvclxuICAvLyBOIG1pbGxpc2Vjb25kcy4gSWYgYGltbWVkaWF0ZWAgaXMgcGFzc2VkLCB0cmlnZ2VyIHRoZSBmdW5jdGlvbiBvbiB0aGVcbiAgLy8gbGVhZGluZyBlZGdlLCBpbnN0ZWFkIG9mIHRoZSB0cmFpbGluZy5cbiAgXy5kZWJvdW5jZSA9IGZ1bmN0aW9uKGZ1bmMsIHdhaXQsIGltbWVkaWF0ZSkge1xuICAgIHZhciB0aW1lb3V0LCBhcmdzLCBjb250ZXh0LCB0aW1lc3RhbXAsIHJlc3VsdDtcblxuICAgIHZhciBsYXRlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGxhc3QgPSBfLm5vdygpIC0gdGltZXN0YW1wO1xuXG4gICAgICBpZiAobGFzdCA8IHdhaXQgJiYgbGFzdCA+PSAwKSB7XG4gICAgICAgIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGxhdGVyLCB3YWl0IC0gbGFzdCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aW1lb3V0ID0gbnVsbDtcbiAgICAgICAgaWYgKCFpbW1lZGlhdGUpIHtcbiAgICAgICAgICByZXN1bHQgPSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgICAgIGlmICghdGltZW91dCkgY29udGV4dCA9IGFyZ3MgPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnRleHQgPSB0aGlzO1xuICAgICAgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgIHRpbWVzdGFtcCA9IF8ubm93KCk7XG4gICAgICB2YXIgY2FsbE5vdyA9IGltbWVkaWF0ZSAmJiAhdGltZW91dDtcbiAgICAgIGlmICghdGltZW91dCkgdGltZW91dCA9IHNldFRpbWVvdXQobGF0ZXIsIHdhaXQpO1xuICAgICAgaWYgKGNhbGxOb3cpIHtcbiAgICAgICAgcmVzdWx0ID0gZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgICAgY29udGV4dCA9IGFyZ3MgPSBudWxsO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG4gIH07XG5cbiAgLy8gUmV0dXJucyB0aGUgZmlyc3QgZnVuY3Rpb24gcGFzc2VkIGFzIGFuIGFyZ3VtZW50IHRvIHRoZSBzZWNvbmQsXG4gIC8vIGFsbG93aW5nIHlvdSB0byBhZGp1c3QgYXJndW1lbnRzLCBydW4gY29kZSBiZWZvcmUgYW5kIGFmdGVyLCBhbmRcbiAgLy8gY29uZGl0aW9uYWxseSBleGVjdXRlIHRoZSBvcmlnaW5hbCBmdW5jdGlvbi5cbiAgXy53cmFwID0gZnVuY3Rpb24oZnVuYywgd3JhcHBlcikge1xuICAgIHJldHVybiBfLnBhcnRpYWwod3JhcHBlciwgZnVuYyk7XG4gIH07XG5cbiAgLy8gUmV0dXJucyBhIG5lZ2F0ZWQgdmVyc2lvbiBvZiB0aGUgcGFzc2VkLWluIHByZWRpY2F0ZS5cbiAgXy5uZWdhdGUgPSBmdW5jdGlvbihwcmVkaWNhdGUpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gIXByZWRpY2F0ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH07XG4gIH07XG5cbiAgLy8gUmV0dXJucyBhIGZ1bmN0aW9uIHRoYXQgaXMgdGhlIGNvbXBvc2l0aW9uIG9mIGEgbGlzdCBvZiBmdW5jdGlvbnMsIGVhY2hcbiAgLy8gY29uc3VtaW5nIHRoZSByZXR1cm4gdmFsdWUgb2YgdGhlIGZ1bmN0aW9uIHRoYXQgZm9sbG93cy5cbiAgXy5jb21wb3NlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgdmFyIHN0YXJ0ID0gYXJncy5sZW5ndGggLSAxO1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBpID0gc3RhcnQ7XG4gICAgICB2YXIgcmVzdWx0ID0gYXJnc1tzdGFydF0uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIHdoaWxlIChpLS0pIHJlc3VsdCA9IGFyZ3NbaV0uY2FsbCh0aGlzLCByZXN1bHQpO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuICB9O1xuXG4gIC8vIFJldHVybnMgYSBmdW5jdGlvbiB0aGF0IHdpbGwgb25seSBiZSBleGVjdXRlZCBvbiBhbmQgYWZ0ZXIgdGhlIE50aCBjYWxsLlxuICBfLmFmdGVyID0gZnVuY3Rpb24odGltZXMsIGZ1bmMpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoLS10aW1lcyA8IDEpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIH1cbiAgICB9O1xuICB9O1xuXG4gIC8vIFJldHVybnMgYSBmdW5jdGlvbiB0aGF0IHdpbGwgb25seSBiZSBleGVjdXRlZCB1cCB0byAoYnV0IG5vdCBpbmNsdWRpbmcpIHRoZSBOdGggY2FsbC5cbiAgXy5iZWZvcmUgPSBmdW5jdGlvbih0aW1lcywgZnVuYykge1xuICAgIHZhciBtZW1vO1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICgtLXRpbWVzID4gMCkge1xuICAgICAgICBtZW1vID0gZnVuYy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgfVxuICAgICAgaWYgKHRpbWVzIDw9IDEpIGZ1bmMgPSBudWxsO1xuICAgICAgcmV0dXJuIG1lbW87XG4gICAgfTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGEgZnVuY3Rpb24gdGhhdCB3aWxsIGJlIGV4ZWN1dGVkIGF0IG1vc3Qgb25lIHRpbWUsIG5vIG1hdHRlciBob3dcbiAgLy8gb2Z0ZW4geW91IGNhbGwgaXQuIFVzZWZ1bCBmb3IgbGF6eSBpbml0aWFsaXphdGlvbi5cbiAgXy5vbmNlID0gXy5wYXJ0aWFsKF8uYmVmb3JlLCAyKTtcblxuICAvLyBPYmplY3QgRnVuY3Rpb25zXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS1cblxuICAvLyBLZXlzIGluIElFIDwgOSB0aGF0IHdvbid0IGJlIGl0ZXJhdGVkIGJ5IGBmb3Iga2V5IGluIC4uLmAgYW5kIHRodXMgbWlzc2VkLlxuICB2YXIgaGFzRW51bUJ1ZyA9ICF7dG9TdHJpbmc6IG51bGx9LnByb3BlcnR5SXNFbnVtZXJhYmxlKCd0b1N0cmluZycpO1xuICB2YXIgbm9uRW51bWVyYWJsZVByb3BzID0gWyd2YWx1ZU9mJywgJ2lzUHJvdG90eXBlT2YnLCAndG9TdHJpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICdwcm9wZXJ0eUlzRW51bWVyYWJsZScsICdoYXNPd25Qcm9wZXJ0eScsICd0b0xvY2FsZVN0cmluZyddO1xuXG4gIGZ1bmN0aW9uIGNvbGxlY3ROb25FbnVtUHJvcHMob2JqLCBrZXlzKSB7XG4gICAgdmFyIG5vbkVudW1JZHggPSBub25FbnVtZXJhYmxlUHJvcHMubGVuZ3RoO1xuICAgIHZhciBjb25zdHJ1Y3RvciA9IG9iai5jb25zdHJ1Y3RvcjtcbiAgICB2YXIgcHJvdG8gPSAoXy5pc0Z1bmN0aW9uKGNvbnN0cnVjdG9yKSAmJiBjb25zdHJ1Y3Rvci5wcm90b3R5cGUpIHx8IE9ialByb3RvO1xuXG4gICAgLy8gQ29uc3RydWN0b3IgaXMgYSBzcGVjaWFsIGNhc2UuXG4gICAgdmFyIHByb3AgPSAnY29uc3RydWN0b3InO1xuICAgIGlmIChfLmhhcyhvYmosIHByb3ApICYmICFfLmNvbnRhaW5zKGtleXMsIHByb3ApKSBrZXlzLnB1c2gocHJvcCk7XG5cbiAgICB3aGlsZSAobm9uRW51bUlkeC0tKSB7XG4gICAgICBwcm9wID0gbm9uRW51bWVyYWJsZVByb3BzW25vbkVudW1JZHhdO1xuICAgICAgaWYgKHByb3AgaW4gb2JqICYmIG9ialtwcm9wXSAhPT0gcHJvdG9bcHJvcF0gJiYgIV8uY29udGFpbnMoa2V5cywgcHJvcCkpIHtcbiAgICAgICAga2V5cy5wdXNoKHByb3ApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIFJldHJpZXZlIHRoZSBuYW1lcyBvZiBhbiBvYmplY3QncyBvd24gcHJvcGVydGllcy5cbiAgLy8gRGVsZWdhdGVzIHRvICoqRUNNQVNjcmlwdCA1KioncyBuYXRpdmUgYE9iamVjdC5rZXlzYFxuICBfLmtleXMgPSBmdW5jdGlvbihvYmopIHtcbiAgICBpZiAoIV8uaXNPYmplY3Qob2JqKSkgcmV0dXJuIFtdO1xuICAgIGlmIChuYXRpdmVLZXlzKSByZXR1cm4gbmF0aXZlS2V5cyhvYmopO1xuICAgIHZhciBrZXlzID0gW107XG4gICAgZm9yICh2YXIga2V5IGluIG9iaikgaWYgKF8uaGFzKG9iaiwga2V5KSkga2V5cy5wdXNoKGtleSk7XG4gICAgLy8gQWhlbSwgSUUgPCA5LlxuICAgIGlmIChoYXNFbnVtQnVnKSBjb2xsZWN0Tm9uRW51bVByb3BzKG9iaiwga2V5cyk7XG4gICAgcmV0dXJuIGtleXM7XG4gIH07XG5cbiAgLy8gUmV0cmlldmUgYWxsIHRoZSBwcm9wZXJ0eSBuYW1lcyBvZiBhbiBvYmplY3QuXG4gIF8uYWxsS2V5cyA9IGZ1bmN0aW9uKG9iaikge1xuICAgIGlmICghXy5pc09iamVjdChvYmopKSByZXR1cm4gW107XG4gICAgdmFyIGtleXMgPSBbXTtcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSBrZXlzLnB1c2goa2V5KTtcbiAgICAvLyBBaGVtLCBJRSA8IDkuXG4gICAgaWYgKGhhc0VudW1CdWcpIGNvbGxlY3ROb25FbnVtUHJvcHMob2JqLCBrZXlzKTtcbiAgICByZXR1cm4ga2V5cztcbiAgfTtcblxuICAvLyBSZXRyaWV2ZSB0aGUgdmFsdWVzIG9mIGFuIG9iamVjdCdzIHByb3BlcnRpZXMuXG4gIF8udmFsdWVzID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIGtleXMgPSBfLmtleXMob2JqKTtcbiAgICB2YXIgbGVuZ3RoID0ga2V5cy5sZW5ndGg7XG4gICAgdmFyIHZhbHVlcyA9IEFycmF5KGxlbmd0aCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgdmFsdWVzW2ldID0gb2JqW2tleXNbaV1dO1xuICAgIH1cbiAgICByZXR1cm4gdmFsdWVzO1xuICB9O1xuXG4gIC8vIFJldHVybnMgdGhlIHJlc3VsdHMgb2YgYXBwbHlpbmcgdGhlIGl0ZXJhdGVlIHRvIGVhY2ggZWxlbWVudCBvZiB0aGUgb2JqZWN0XG4gIC8vIEluIGNvbnRyYXN0IHRvIF8ubWFwIGl0IHJldHVybnMgYW4gb2JqZWN0XG4gIF8ubWFwT2JqZWN0ID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRlZSwgY29udGV4dCkge1xuICAgIGl0ZXJhdGVlID0gY2IoaXRlcmF0ZWUsIGNvbnRleHQpO1xuICAgIHZhciBrZXlzID0gIF8ua2V5cyhvYmopLFxuICAgICAgICAgIGxlbmd0aCA9IGtleXMubGVuZ3RoLFxuICAgICAgICAgIHJlc3VsdHMgPSB7fSxcbiAgICAgICAgICBjdXJyZW50S2V5O1xuICAgICAgZm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICBjdXJyZW50S2V5ID0ga2V5c1tpbmRleF07XG4gICAgICAgIHJlc3VsdHNbY3VycmVudEtleV0gPSBpdGVyYXRlZShvYmpbY3VycmVudEtleV0sIGN1cnJlbnRLZXksIG9iaik7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0cztcbiAgfTtcblxuICAvLyBDb252ZXJ0IGFuIG9iamVjdCBpbnRvIGEgbGlzdCBvZiBgW2tleSwgdmFsdWVdYCBwYWlycy5cbiAgXy5wYWlycyA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciBrZXlzID0gXy5rZXlzKG9iaik7XG4gICAgdmFyIGxlbmd0aCA9IGtleXMubGVuZ3RoO1xuICAgIHZhciBwYWlycyA9IEFycmF5KGxlbmd0aCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgcGFpcnNbaV0gPSBba2V5c1tpXSwgb2JqW2tleXNbaV1dXTtcbiAgICB9XG4gICAgcmV0dXJuIHBhaXJzO1xuICB9O1xuXG4gIC8vIEludmVydCB0aGUga2V5cyBhbmQgdmFsdWVzIG9mIGFuIG9iamVjdC4gVGhlIHZhbHVlcyBtdXN0IGJlIHNlcmlhbGl6YWJsZS5cbiAgXy5pbnZlcnQgPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgdmFyIGtleXMgPSBfLmtleXMob2JqKTtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0ga2V5cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgcmVzdWx0W29ialtrZXlzW2ldXV0gPSBrZXlzW2ldO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8vIFJldHVybiBhIHNvcnRlZCBsaXN0IG9mIHRoZSBmdW5jdGlvbiBuYW1lcyBhdmFpbGFibGUgb24gdGhlIG9iamVjdC5cbiAgLy8gQWxpYXNlZCBhcyBgbWV0aG9kc2BcbiAgXy5mdW5jdGlvbnMgPSBfLm1ldGhvZHMgPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIgbmFtZXMgPSBbXTtcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgICBpZiAoXy5pc0Z1bmN0aW9uKG9ialtrZXldKSkgbmFtZXMucHVzaChrZXkpO1xuICAgIH1cbiAgICByZXR1cm4gbmFtZXMuc29ydCgpO1xuICB9O1xuXG4gIC8vIEV4dGVuZCBhIGdpdmVuIG9iamVjdCB3aXRoIGFsbCB0aGUgcHJvcGVydGllcyBpbiBwYXNzZWQtaW4gb2JqZWN0KHMpLlxuICBfLmV4dGVuZCA9IGNyZWF0ZUFzc2lnbmVyKF8uYWxsS2V5cyk7XG5cbiAgLy8gQXNzaWducyBhIGdpdmVuIG9iamVjdCB3aXRoIGFsbCB0aGUgb3duIHByb3BlcnRpZXMgaW4gdGhlIHBhc3NlZC1pbiBvYmplY3QocylcbiAgLy8gKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL09iamVjdC9hc3NpZ24pXG4gIF8uZXh0ZW5kT3duID0gXy5hc3NpZ24gPSBjcmVhdGVBc3NpZ25lcihfLmtleXMpO1xuXG4gIC8vIFJldHVybnMgdGhlIGZpcnN0IGtleSBvbiBhbiBvYmplY3QgdGhhdCBwYXNzZXMgYSBwcmVkaWNhdGUgdGVzdFxuICBfLmZpbmRLZXkgPSBmdW5jdGlvbihvYmosIHByZWRpY2F0ZSwgY29udGV4dCkge1xuICAgIHByZWRpY2F0ZSA9IGNiKHByZWRpY2F0ZSwgY29udGV4dCk7XG4gICAgdmFyIGtleXMgPSBfLmtleXMob2JqKSwga2V5O1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBrZXlzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBrZXkgPSBrZXlzW2ldO1xuICAgICAgaWYgKHByZWRpY2F0ZShvYmpba2V5XSwga2V5LCBvYmopKSByZXR1cm4ga2V5O1xuICAgIH1cbiAgfTtcblxuICAvLyBSZXR1cm4gYSBjb3B5IG9mIHRoZSBvYmplY3Qgb25seSBjb250YWluaW5nIHRoZSB3aGl0ZWxpc3RlZCBwcm9wZXJ0aWVzLlxuICBfLnBpY2sgPSBmdW5jdGlvbihvYmplY3QsIG9pdGVyYXRlZSwgY29udGV4dCkge1xuICAgIHZhciByZXN1bHQgPSB7fSwgb2JqID0gb2JqZWN0LCBpdGVyYXRlZSwga2V5cztcbiAgICBpZiAob2JqID09IG51bGwpIHJldHVybiByZXN1bHQ7XG4gICAgaWYgKF8uaXNGdW5jdGlvbihvaXRlcmF0ZWUpKSB7XG4gICAgICBrZXlzID0gXy5hbGxLZXlzKG9iaik7XG4gICAgICBpdGVyYXRlZSA9IG9wdGltaXplQ2Iob2l0ZXJhdGVlLCBjb250ZXh0KTtcbiAgICB9IGVsc2Uge1xuICAgICAga2V5cyA9IGZsYXR0ZW4oYXJndW1lbnRzLCBmYWxzZSwgZmFsc2UsIDEpO1xuICAgICAgaXRlcmF0ZWUgPSBmdW5jdGlvbih2YWx1ZSwga2V5LCBvYmopIHsgcmV0dXJuIGtleSBpbiBvYmo7IH07XG4gICAgICBvYmogPSBPYmplY3Qob2JqKTtcbiAgICB9XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGtleXMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBrZXkgPSBrZXlzW2ldO1xuICAgICAgdmFyIHZhbHVlID0gb2JqW2tleV07XG4gICAgICBpZiAoaXRlcmF0ZWUodmFsdWUsIGtleSwgb2JqKSkgcmVzdWx0W2tleV0gPSB2YWx1ZTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAgLy8gUmV0dXJuIGEgY29weSBvZiB0aGUgb2JqZWN0IHdpdGhvdXQgdGhlIGJsYWNrbGlzdGVkIHByb3BlcnRpZXMuXG4gIF8ub21pdCA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0ZWUsIGNvbnRleHQpIHtcbiAgICBpZiAoXy5pc0Z1bmN0aW9uKGl0ZXJhdGVlKSkge1xuICAgICAgaXRlcmF0ZWUgPSBfLm5lZ2F0ZShpdGVyYXRlZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBrZXlzID0gXy5tYXAoZmxhdHRlbihhcmd1bWVudHMsIGZhbHNlLCBmYWxzZSwgMSksIFN0cmluZyk7XG4gICAgICBpdGVyYXRlZSA9IGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcbiAgICAgICAgcmV0dXJuICFfLmNvbnRhaW5zKGtleXMsIGtleSk7XG4gICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4gXy5waWNrKG9iaiwgaXRlcmF0ZWUsIGNvbnRleHQpO1xuICB9O1xuXG4gIC8vIEZpbGwgaW4gYSBnaXZlbiBvYmplY3Qgd2l0aCBkZWZhdWx0IHByb3BlcnRpZXMuXG4gIF8uZGVmYXVsdHMgPSBjcmVhdGVBc3NpZ25lcihfLmFsbEtleXMsIHRydWUpO1xuXG4gIC8vIENyZWF0ZXMgYW4gb2JqZWN0IHRoYXQgaW5oZXJpdHMgZnJvbSB0aGUgZ2l2ZW4gcHJvdG90eXBlIG9iamVjdC5cbiAgLy8gSWYgYWRkaXRpb25hbCBwcm9wZXJ0aWVzIGFyZSBwcm92aWRlZCB0aGVuIHRoZXkgd2lsbCBiZSBhZGRlZCB0byB0aGVcbiAgLy8gY3JlYXRlZCBvYmplY3QuXG4gIF8uY3JlYXRlID0gZnVuY3Rpb24ocHJvdG90eXBlLCBwcm9wcykge1xuICAgIHZhciByZXN1bHQgPSBiYXNlQ3JlYXRlKHByb3RvdHlwZSk7XG4gICAgaWYgKHByb3BzKSBfLmV4dGVuZE93bihyZXN1bHQsIHByb3BzKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8vIENyZWF0ZSBhIChzaGFsbG93LWNsb25lZCkgZHVwbGljYXRlIG9mIGFuIG9iamVjdC5cbiAgXy5jbG9uZSA9IGZ1bmN0aW9uKG9iaikge1xuICAgIGlmICghXy5pc09iamVjdChvYmopKSByZXR1cm4gb2JqO1xuICAgIHJldHVybiBfLmlzQXJyYXkob2JqKSA/IG9iai5zbGljZSgpIDogXy5leHRlbmQoe30sIG9iaik7XG4gIH07XG5cbiAgLy8gSW52b2tlcyBpbnRlcmNlcHRvciB3aXRoIHRoZSBvYmosIGFuZCB0aGVuIHJldHVybnMgb2JqLlxuICAvLyBUaGUgcHJpbWFyeSBwdXJwb3NlIG9mIHRoaXMgbWV0aG9kIGlzIHRvIFwidGFwIGludG9cIiBhIG1ldGhvZCBjaGFpbiwgaW5cbiAgLy8gb3JkZXIgdG8gcGVyZm9ybSBvcGVyYXRpb25zIG9uIGludGVybWVkaWF0ZSByZXN1bHRzIHdpdGhpbiB0aGUgY2hhaW4uXG4gIF8udGFwID0gZnVuY3Rpb24ob2JqLCBpbnRlcmNlcHRvcikge1xuICAgIGludGVyY2VwdG9yKG9iaik7XG4gICAgcmV0dXJuIG9iajtcbiAgfTtcblxuICAvLyBSZXR1cm5zIHdoZXRoZXIgYW4gb2JqZWN0IGhhcyBhIGdpdmVuIHNldCBvZiBga2V5OnZhbHVlYCBwYWlycy5cbiAgXy5pc01hdGNoID0gZnVuY3Rpb24ob2JqZWN0LCBhdHRycykge1xuICAgIHZhciBrZXlzID0gXy5rZXlzKGF0dHJzKSwgbGVuZ3RoID0ga2V5cy5sZW5ndGg7XG4gICAgaWYgKG9iamVjdCA9PSBudWxsKSByZXR1cm4gIWxlbmd0aDtcbiAgICB2YXIgb2JqID0gT2JqZWN0KG9iamVjdCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGtleSA9IGtleXNbaV07XG4gICAgICBpZiAoYXR0cnNba2V5XSAhPT0gb2JqW2tleV0gfHwgIShrZXkgaW4gb2JqKSkgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcblxuXG4gIC8vIEludGVybmFsIHJlY3Vyc2l2ZSBjb21wYXJpc29uIGZ1bmN0aW9uIGZvciBgaXNFcXVhbGAuXG4gIHZhciBlcSA9IGZ1bmN0aW9uKGEsIGIsIGFTdGFjaywgYlN0YWNrKSB7XG4gICAgLy8gSWRlbnRpY2FsIG9iamVjdHMgYXJlIGVxdWFsLiBgMCA9PT0gLTBgLCBidXQgdGhleSBhcmVuJ3QgaWRlbnRpY2FsLlxuICAgIC8vIFNlZSB0aGUgW0hhcm1vbnkgYGVnYWxgIHByb3Bvc2FsXShodHRwOi8vd2lraS5lY21hc2NyaXB0Lm9yZy9kb2t1LnBocD9pZD1oYXJtb255OmVnYWwpLlxuICAgIGlmIChhID09PSBiKSByZXR1cm4gYSAhPT0gMCB8fCAxIC8gYSA9PT0gMSAvIGI7XG4gICAgLy8gQSBzdHJpY3QgY29tcGFyaXNvbiBpcyBuZWNlc3NhcnkgYmVjYXVzZSBgbnVsbCA9PSB1bmRlZmluZWRgLlxuICAgIGlmIChhID09IG51bGwgfHwgYiA9PSBudWxsKSByZXR1cm4gYSA9PT0gYjtcbiAgICAvLyBVbndyYXAgYW55IHdyYXBwZWQgb2JqZWN0cy5cbiAgICBpZiAoYSBpbnN0YW5jZW9mIF8pIGEgPSBhLl93cmFwcGVkO1xuICAgIGlmIChiIGluc3RhbmNlb2YgXykgYiA9IGIuX3dyYXBwZWQ7XG4gICAgLy8gQ29tcGFyZSBgW1tDbGFzc11dYCBuYW1lcy5cbiAgICB2YXIgY2xhc3NOYW1lID0gdG9TdHJpbmcuY2FsbChhKTtcbiAgICBpZiAoY2xhc3NOYW1lICE9PSB0b1N0cmluZy5jYWxsKGIpKSByZXR1cm4gZmFsc2U7XG4gICAgc3dpdGNoIChjbGFzc05hbWUpIHtcbiAgICAgIC8vIFN0cmluZ3MsIG51bWJlcnMsIHJlZ3VsYXIgZXhwcmVzc2lvbnMsIGRhdGVzLCBhbmQgYm9vbGVhbnMgYXJlIGNvbXBhcmVkIGJ5IHZhbHVlLlxuICAgICAgY2FzZSAnW29iamVjdCBSZWdFeHBdJzpcbiAgICAgIC8vIFJlZ0V4cHMgYXJlIGNvZXJjZWQgdG8gc3RyaW5ncyBmb3IgY29tcGFyaXNvbiAoTm90ZTogJycgKyAvYS9pID09PSAnL2EvaScpXG4gICAgICBjYXNlICdbb2JqZWN0IFN0cmluZ10nOlxuICAgICAgICAvLyBQcmltaXRpdmVzIGFuZCB0aGVpciBjb3JyZXNwb25kaW5nIG9iamVjdCB3cmFwcGVycyBhcmUgZXF1aXZhbGVudDsgdGh1cywgYFwiNVwiYCBpc1xuICAgICAgICAvLyBlcXVpdmFsZW50IHRvIGBuZXcgU3RyaW5nKFwiNVwiKWAuXG4gICAgICAgIHJldHVybiAnJyArIGEgPT09ICcnICsgYjtcbiAgICAgIGNhc2UgJ1tvYmplY3QgTnVtYmVyXSc6XG4gICAgICAgIC8vIGBOYU5gcyBhcmUgZXF1aXZhbGVudCwgYnV0IG5vbi1yZWZsZXhpdmUuXG4gICAgICAgIC8vIE9iamVjdChOYU4pIGlzIGVxdWl2YWxlbnQgdG8gTmFOXG4gICAgICAgIGlmICgrYSAhPT0gK2EpIHJldHVybiArYiAhPT0gK2I7XG4gICAgICAgIC8vIEFuIGBlZ2FsYCBjb21wYXJpc29uIGlzIHBlcmZvcm1lZCBmb3Igb3RoZXIgbnVtZXJpYyB2YWx1ZXMuXG4gICAgICAgIHJldHVybiArYSA9PT0gMCA/IDEgLyArYSA9PT0gMSAvIGIgOiArYSA9PT0gK2I7XG4gICAgICBjYXNlICdbb2JqZWN0IERhdGVdJzpcbiAgICAgIGNhc2UgJ1tvYmplY3QgQm9vbGVhbl0nOlxuICAgICAgICAvLyBDb2VyY2UgZGF0ZXMgYW5kIGJvb2xlYW5zIHRvIG51bWVyaWMgcHJpbWl0aXZlIHZhbHVlcy4gRGF0ZXMgYXJlIGNvbXBhcmVkIGJ5IHRoZWlyXG4gICAgICAgIC8vIG1pbGxpc2Vjb25kIHJlcHJlc2VudGF0aW9ucy4gTm90ZSB0aGF0IGludmFsaWQgZGF0ZXMgd2l0aCBtaWxsaXNlY29uZCByZXByZXNlbnRhdGlvbnNcbiAgICAgICAgLy8gb2YgYE5hTmAgYXJlIG5vdCBlcXVpdmFsZW50LlxuICAgICAgICByZXR1cm4gK2EgPT09ICtiO1xuICAgIH1cblxuICAgIHZhciBhcmVBcnJheXMgPSBjbGFzc05hbWUgPT09ICdbb2JqZWN0IEFycmF5XSc7XG4gICAgaWYgKCFhcmVBcnJheXMpIHtcbiAgICAgIGlmICh0eXBlb2YgYSAhPSAnb2JqZWN0JyB8fCB0eXBlb2YgYiAhPSAnb2JqZWN0JykgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAvLyBPYmplY3RzIHdpdGggZGlmZmVyZW50IGNvbnN0cnVjdG9ycyBhcmUgbm90IGVxdWl2YWxlbnQsIGJ1dCBgT2JqZWN0YHMgb3IgYEFycmF5YHNcbiAgICAgIC8vIGZyb20gZGlmZmVyZW50IGZyYW1lcyBhcmUuXG4gICAgICB2YXIgYUN0b3IgPSBhLmNvbnN0cnVjdG9yLCBiQ3RvciA9IGIuY29uc3RydWN0b3I7XG4gICAgICBpZiAoYUN0b3IgIT09IGJDdG9yICYmICEoXy5pc0Z1bmN0aW9uKGFDdG9yKSAmJiBhQ3RvciBpbnN0YW5jZW9mIGFDdG9yICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXy5pc0Z1bmN0aW9uKGJDdG9yKSAmJiBiQ3RvciBpbnN0YW5jZW9mIGJDdG9yKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAmJiAoJ2NvbnN0cnVjdG9yJyBpbiBhICYmICdjb25zdHJ1Y3RvcicgaW4gYikpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgICAvLyBBc3N1bWUgZXF1YWxpdHkgZm9yIGN5Y2xpYyBzdHJ1Y3R1cmVzLiBUaGUgYWxnb3JpdGhtIGZvciBkZXRlY3RpbmcgY3ljbGljXG4gICAgLy8gc3RydWN0dXJlcyBpcyBhZGFwdGVkIGZyb20gRVMgNS4xIHNlY3Rpb24gMTUuMTIuMywgYWJzdHJhY3Qgb3BlcmF0aW9uIGBKT2AuXG5cbiAgICAvLyBJbml0aWFsaXppbmcgc3RhY2sgb2YgdHJhdmVyc2VkIG9iamVjdHMuXG4gICAgLy8gSXQncyBkb25lIGhlcmUgc2luY2Ugd2Ugb25seSBuZWVkIHRoZW0gZm9yIG9iamVjdHMgYW5kIGFycmF5cyBjb21wYXJpc29uLlxuICAgIGFTdGFjayA9IGFTdGFjayB8fCBbXTtcbiAgICBiU3RhY2sgPSBiU3RhY2sgfHwgW107XG4gICAgdmFyIGxlbmd0aCA9IGFTdGFjay5sZW5ndGg7XG4gICAgd2hpbGUgKGxlbmd0aC0tKSB7XG4gICAgICAvLyBMaW5lYXIgc2VhcmNoLiBQZXJmb3JtYW5jZSBpcyBpbnZlcnNlbHkgcHJvcG9ydGlvbmFsIHRvIHRoZSBudW1iZXIgb2ZcbiAgICAgIC8vIHVuaXF1ZSBuZXN0ZWQgc3RydWN0dXJlcy5cbiAgICAgIGlmIChhU3RhY2tbbGVuZ3RoXSA9PT0gYSkgcmV0dXJuIGJTdGFja1tsZW5ndGhdID09PSBiO1xuICAgIH1cblxuICAgIC8vIEFkZCB0aGUgZmlyc3Qgb2JqZWN0IHRvIHRoZSBzdGFjayBvZiB0cmF2ZXJzZWQgb2JqZWN0cy5cbiAgICBhU3RhY2sucHVzaChhKTtcbiAgICBiU3RhY2sucHVzaChiKTtcblxuICAgIC8vIFJlY3Vyc2l2ZWx5IGNvbXBhcmUgb2JqZWN0cyBhbmQgYXJyYXlzLlxuICAgIGlmIChhcmVBcnJheXMpIHtcbiAgICAgIC8vIENvbXBhcmUgYXJyYXkgbGVuZ3RocyB0byBkZXRlcm1pbmUgaWYgYSBkZWVwIGNvbXBhcmlzb24gaXMgbmVjZXNzYXJ5LlxuICAgICAgbGVuZ3RoID0gYS5sZW5ndGg7XG4gICAgICBpZiAobGVuZ3RoICE9PSBiLmxlbmd0aCkgcmV0dXJuIGZhbHNlO1xuICAgICAgLy8gRGVlcCBjb21wYXJlIHRoZSBjb250ZW50cywgaWdub3Jpbmcgbm9uLW51bWVyaWMgcHJvcGVydGllcy5cbiAgICAgIHdoaWxlIChsZW5ndGgtLSkge1xuICAgICAgICBpZiAoIWVxKGFbbGVuZ3RoXSwgYltsZW5ndGhdLCBhU3RhY2ssIGJTdGFjaykpIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gRGVlcCBjb21wYXJlIG9iamVjdHMuXG4gICAgICB2YXIga2V5cyA9IF8ua2V5cyhhKSwga2V5O1xuICAgICAgbGVuZ3RoID0ga2V5cy5sZW5ndGg7XG4gICAgICAvLyBFbnN1cmUgdGhhdCBib3RoIG9iamVjdHMgY29udGFpbiB0aGUgc2FtZSBudW1iZXIgb2YgcHJvcGVydGllcyBiZWZvcmUgY29tcGFyaW5nIGRlZXAgZXF1YWxpdHkuXG4gICAgICBpZiAoXy5rZXlzKGIpLmxlbmd0aCAhPT0gbGVuZ3RoKSByZXR1cm4gZmFsc2U7XG4gICAgICB3aGlsZSAobGVuZ3RoLS0pIHtcbiAgICAgICAgLy8gRGVlcCBjb21wYXJlIGVhY2ggbWVtYmVyXG4gICAgICAgIGtleSA9IGtleXNbbGVuZ3RoXTtcbiAgICAgICAgaWYgKCEoXy5oYXMoYiwga2V5KSAmJiBlcShhW2tleV0sIGJba2V5XSwgYVN0YWNrLCBiU3RhY2spKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgICAvLyBSZW1vdmUgdGhlIGZpcnN0IG9iamVjdCBmcm9tIHRoZSBzdGFjayBvZiB0cmF2ZXJzZWQgb2JqZWN0cy5cbiAgICBhU3RhY2sucG9wKCk7XG4gICAgYlN0YWNrLnBvcCgpO1xuICAgIHJldHVybiB0cnVlO1xuICB9O1xuXG4gIC8vIFBlcmZvcm0gYSBkZWVwIGNvbXBhcmlzb24gdG8gY2hlY2sgaWYgdHdvIG9iamVjdHMgYXJlIGVxdWFsLlxuICBfLmlzRXF1YWwgPSBmdW5jdGlvbihhLCBiKSB7XG4gICAgcmV0dXJuIGVxKGEsIGIpO1xuICB9O1xuXG4gIC8vIElzIGEgZ2l2ZW4gYXJyYXksIHN0cmluZywgb3Igb2JqZWN0IGVtcHR5P1xuICAvLyBBbiBcImVtcHR5XCIgb2JqZWN0IGhhcyBubyBlbnVtZXJhYmxlIG93bi1wcm9wZXJ0aWVzLlxuICBfLmlzRW1wdHkgPSBmdW5jdGlvbihvYmopIHtcbiAgICBpZiAob2JqID09IG51bGwpIHJldHVybiB0cnVlO1xuICAgIGlmIChpc0FycmF5TGlrZShvYmopICYmIChfLmlzQXJyYXkob2JqKSB8fCBfLmlzU3RyaW5nKG9iaikgfHwgXy5pc0FyZ3VtZW50cyhvYmopKSkgcmV0dXJuIG9iai5sZW5ndGggPT09IDA7XG4gICAgcmV0dXJuIF8ua2V5cyhvYmopLmxlbmd0aCA9PT0gMDtcbiAgfTtcblxuICAvLyBJcyBhIGdpdmVuIHZhbHVlIGEgRE9NIGVsZW1lbnQ/XG4gIF8uaXNFbGVtZW50ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuICEhKG9iaiAmJiBvYmoubm9kZVR5cGUgPT09IDEpO1xuICB9O1xuXG4gIC8vIElzIGEgZ2l2ZW4gdmFsdWUgYW4gYXJyYXk/XG4gIC8vIERlbGVnYXRlcyB0byBFQ01BNSdzIG5hdGl2ZSBBcnJheS5pc0FycmF5XG4gIF8uaXNBcnJheSA9IG5hdGl2ZUlzQXJyYXkgfHwgZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIHRvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbiAgfTtcblxuICAvLyBJcyBhIGdpdmVuIHZhcmlhYmxlIGFuIG9iamVjdD9cbiAgXy5pc09iamVjdCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciB0eXBlID0gdHlwZW9mIG9iajtcbiAgICByZXR1cm4gdHlwZSA9PT0gJ2Z1bmN0aW9uJyB8fCB0eXBlID09PSAnb2JqZWN0JyAmJiAhIW9iajtcbiAgfTtcblxuICAvLyBBZGQgc29tZSBpc1R5cGUgbWV0aG9kczogaXNBcmd1bWVudHMsIGlzRnVuY3Rpb24sIGlzU3RyaW5nLCBpc051bWJlciwgaXNEYXRlLCBpc1JlZ0V4cCwgaXNFcnJvci5cbiAgXy5lYWNoKFsnQXJndW1lbnRzJywgJ0Z1bmN0aW9uJywgJ1N0cmluZycsICdOdW1iZXInLCAnRGF0ZScsICdSZWdFeHAnLCAnRXJyb3InXSwgZnVuY3Rpb24obmFtZSkge1xuICAgIF9bJ2lzJyArIG5hbWVdID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gdG9TdHJpbmcuY2FsbChvYmopID09PSAnW29iamVjdCAnICsgbmFtZSArICddJztcbiAgICB9O1xuICB9KTtcblxuICAvLyBEZWZpbmUgYSBmYWxsYmFjayB2ZXJzaW9uIG9mIHRoZSBtZXRob2QgaW4gYnJvd3NlcnMgKGFoZW0sIElFIDwgOSksIHdoZXJlXG4gIC8vIHRoZXJlIGlzbid0IGFueSBpbnNwZWN0YWJsZSBcIkFyZ3VtZW50c1wiIHR5cGUuXG4gIGlmICghXy5pc0FyZ3VtZW50cyhhcmd1bWVudHMpKSB7XG4gICAgXy5pc0FyZ3VtZW50cyA9IGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuIF8uaGFzKG9iaiwgJ2NhbGxlZScpO1xuICAgIH07XG4gIH1cblxuICAvLyBPcHRpbWl6ZSBgaXNGdW5jdGlvbmAgaWYgYXBwcm9wcmlhdGUuIFdvcmsgYXJvdW5kIHNvbWUgdHlwZW9mIGJ1Z3MgaW4gb2xkIHY4LFxuICAvLyBJRSAxMSAoIzE2MjEpLCBhbmQgaW4gU2FmYXJpIDggKCMxOTI5KS5cbiAgaWYgKHR5cGVvZiAvLi8gIT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgSW50OEFycmF5ICE9ICdvYmplY3QnKSB7XG4gICAgXy5pc0Z1bmN0aW9uID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gdHlwZW9mIG9iaiA9PSAnZnVuY3Rpb24nIHx8IGZhbHNlO1xuICAgIH07XG4gIH1cblxuICAvLyBJcyBhIGdpdmVuIG9iamVjdCBhIGZpbml0ZSBudW1iZXI/XG4gIF8uaXNGaW5pdGUgPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gaXNGaW5pdGUob2JqKSAmJiAhaXNOYU4ocGFyc2VGbG9hdChvYmopKTtcbiAgfTtcblxuICAvLyBJcyB0aGUgZ2l2ZW4gdmFsdWUgYE5hTmA/IChOYU4gaXMgdGhlIG9ubHkgbnVtYmVyIHdoaWNoIGRvZXMgbm90IGVxdWFsIGl0c2VsZikuXG4gIF8uaXNOYU4gPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gXy5pc051bWJlcihvYmopICYmIG9iaiAhPT0gK29iajtcbiAgfTtcblxuICAvLyBJcyBhIGdpdmVuIHZhbHVlIGEgYm9vbGVhbj9cbiAgXy5pc0Jvb2xlYW4gPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gb2JqID09PSB0cnVlIHx8IG9iaiA9PT0gZmFsc2UgfHwgdG9TdHJpbmcuY2FsbChvYmopID09PSAnW29iamVjdCBCb29sZWFuXSc7XG4gIH07XG5cbiAgLy8gSXMgYSBnaXZlbiB2YWx1ZSBlcXVhbCB0byBudWxsP1xuICBfLmlzTnVsbCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiBvYmogPT09IG51bGw7XG4gIH07XG5cbiAgLy8gSXMgYSBnaXZlbiB2YXJpYWJsZSB1bmRlZmluZWQ/XG4gIF8uaXNVbmRlZmluZWQgPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gb2JqID09PSB2b2lkIDA7XG4gIH07XG5cbiAgLy8gU2hvcnRjdXQgZnVuY3Rpb24gZm9yIGNoZWNraW5nIGlmIGFuIG9iamVjdCBoYXMgYSBnaXZlbiBwcm9wZXJ0eSBkaXJlY3RseVxuICAvLyBvbiBpdHNlbGYgKGluIG90aGVyIHdvcmRzLCBub3Qgb24gYSBwcm90b3R5cGUpLlxuICBfLmhhcyA9IGZ1bmN0aW9uKG9iaiwga2V5KSB7XG4gICAgcmV0dXJuIG9iaiAhPSBudWxsICYmIGhhc093blByb3BlcnR5LmNhbGwob2JqLCBrZXkpO1xuICB9O1xuXG4gIC8vIFV0aWxpdHkgRnVuY3Rpb25zXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gUnVuIFVuZGVyc2NvcmUuanMgaW4gKm5vQ29uZmxpY3QqIG1vZGUsIHJldHVybmluZyB0aGUgYF9gIHZhcmlhYmxlIHRvIGl0c1xuICAvLyBwcmV2aW91cyBvd25lci4gUmV0dXJucyBhIHJlZmVyZW5jZSB0byB0aGUgVW5kZXJzY29yZSBvYmplY3QuXG4gIF8ubm9Db25mbGljdCA9IGZ1bmN0aW9uKCkge1xuICAgIHJvb3QuXyA9IHByZXZpb3VzVW5kZXJzY29yZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvLyBLZWVwIHRoZSBpZGVudGl0eSBmdW5jdGlvbiBhcm91bmQgZm9yIGRlZmF1bHQgaXRlcmF0ZWVzLlxuICBfLmlkZW50aXR5ID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH07XG5cbiAgLy8gUHJlZGljYXRlLWdlbmVyYXRpbmcgZnVuY3Rpb25zLiBPZnRlbiB1c2VmdWwgb3V0c2lkZSBvZiBVbmRlcnNjb3JlLlxuICBfLmNvbnN0YW50ID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfTtcbiAgfTtcblxuICBfLm5vb3AgPSBmdW5jdGlvbigpe307XG5cbiAgXy5wcm9wZXJ0eSA9IHByb3BlcnR5O1xuXG4gIC8vIEdlbmVyYXRlcyBhIGZ1bmN0aW9uIGZvciBhIGdpdmVuIG9iamVjdCB0aGF0IHJldHVybnMgYSBnaXZlbiBwcm9wZXJ0eS5cbiAgXy5wcm9wZXJ0eU9mID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIG9iaiA9PSBudWxsID8gZnVuY3Rpb24oKXt9IDogZnVuY3Rpb24oa2V5KSB7XG4gICAgICByZXR1cm4gb2JqW2tleV07XG4gICAgfTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGEgcHJlZGljYXRlIGZvciBjaGVja2luZyB3aGV0aGVyIGFuIG9iamVjdCBoYXMgYSBnaXZlbiBzZXQgb2ZcbiAgLy8gYGtleTp2YWx1ZWAgcGFpcnMuXG4gIF8ubWF0Y2hlciA9IF8ubWF0Y2hlcyA9IGZ1bmN0aW9uKGF0dHJzKSB7XG4gICAgYXR0cnMgPSBfLmV4dGVuZE93bih7fSwgYXR0cnMpO1xuICAgIHJldHVybiBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiBfLmlzTWF0Y2gob2JqLCBhdHRycyk7XG4gICAgfTtcbiAgfTtcblxuICAvLyBSdW4gYSBmdW5jdGlvbiAqKm4qKiB0aW1lcy5cbiAgXy50aW1lcyA9IGZ1bmN0aW9uKG4sIGl0ZXJhdGVlLCBjb250ZXh0KSB7XG4gICAgdmFyIGFjY3VtID0gQXJyYXkoTWF0aC5tYXgoMCwgbikpO1xuICAgIGl0ZXJhdGVlID0gb3B0aW1pemVDYihpdGVyYXRlZSwgY29udGV4dCwgMSk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBuOyBpKyspIGFjY3VtW2ldID0gaXRlcmF0ZWUoaSk7XG4gICAgcmV0dXJuIGFjY3VtO1xuICB9O1xuXG4gIC8vIFJldHVybiBhIHJhbmRvbSBpbnRlZ2VyIGJldHdlZW4gbWluIGFuZCBtYXggKGluY2x1c2l2ZSkuXG4gIF8ucmFuZG9tID0gZnVuY3Rpb24obWluLCBtYXgpIHtcbiAgICBpZiAobWF4ID09IG51bGwpIHtcbiAgICAgIG1heCA9IG1pbjtcbiAgICAgIG1pbiA9IDA7XG4gICAgfVxuICAgIHJldHVybiBtaW4gKyBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluICsgMSkpO1xuICB9O1xuXG4gIC8vIEEgKHBvc3NpYmx5IGZhc3Rlcikgd2F5IHRvIGdldCB0aGUgY3VycmVudCB0aW1lc3RhbXAgYXMgYW4gaW50ZWdlci5cbiAgXy5ub3cgPSBEYXRlLm5vdyB8fCBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gIH07XG5cbiAgIC8vIExpc3Qgb2YgSFRNTCBlbnRpdGllcyBmb3IgZXNjYXBpbmcuXG4gIHZhciBlc2NhcGVNYXAgPSB7XG4gICAgJyYnOiAnJmFtcDsnLFxuICAgICc8JzogJyZsdDsnLFxuICAgICc+JzogJyZndDsnLFxuICAgICdcIic6ICcmcXVvdDsnLFxuICAgIFwiJ1wiOiAnJiN4Mjc7JyxcbiAgICAnYCc6ICcmI3g2MDsnXG4gIH07XG4gIHZhciB1bmVzY2FwZU1hcCA9IF8uaW52ZXJ0KGVzY2FwZU1hcCk7XG5cbiAgLy8gRnVuY3Rpb25zIGZvciBlc2NhcGluZyBhbmQgdW5lc2NhcGluZyBzdHJpbmdzIHRvL2Zyb20gSFRNTCBpbnRlcnBvbGF0aW9uLlxuICB2YXIgY3JlYXRlRXNjYXBlciA9IGZ1bmN0aW9uKG1hcCkge1xuICAgIHZhciBlc2NhcGVyID0gZnVuY3Rpb24obWF0Y2gpIHtcbiAgICAgIHJldHVybiBtYXBbbWF0Y2hdO1xuICAgIH07XG4gICAgLy8gUmVnZXhlcyBmb3IgaWRlbnRpZnlpbmcgYSBrZXkgdGhhdCBuZWVkcyB0byBiZSBlc2NhcGVkXG4gICAgdmFyIHNvdXJjZSA9ICcoPzonICsgXy5rZXlzKG1hcCkuam9pbignfCcpICsgJyknO1xuICAgIHZhciB0ZXN0UmVnZXhwID0gUmVnRXhwKHNvdXJjZSk7XG4gICAgdmFyIHJlcGxhY2VSZWdleHAgPSBSZWdFeHAoc291cmNlLCAnZycpO1xuICAgIHJldHVybiBmdW5jdGlvbihzdHJpbmcpIHtcbiAgICAgIHN0cmluZyA9IHN0cmluZyA9PSBudWxsID8gJycgOiAnJyArIHN0cmluZztcbiAgICAgIHJldHVybiB0ZXN0UmVnZXhwLnRlc3Qoc3RyaW5nKSA/IHN0cmluZy5yZXBsYWNlKHJlcGxhY2VSZWdleHAsIGVzY2FwZXIpIDogc3RyaW5nO1xuICAgIH07XG4gIH07XG4gIF8uZXNjYXBlID0gY3JlYXRlRXNjYXBlcihlc2NhcGVNYXApO1xuICBfLnVuZXNjYXBlID0gY3JlYXRlRXNjYXBlcih1bmVzY2FwZU1hcCk7XG5cbiAgLy8gSWYgdGhlIHZhbHVlIG9mIHRoZSBuYW1lZCBgcHJvcGVydHlgIGlzIGEgZnVuY3Rpb24gdGhlbiBpbnZva2UgaXQgd2l0aCB0aGVcbiAgLy8gYG9iamVjdGAgYXMgY29udGV4dDsgb3RoZXJ3aXNlLCByZXR1cm4gaXQuXG4gIF8ucmVzdWx0ID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSwgZmFsbGJhY2spIHtcbiAgICB2YXIgdmFsdWUgPSBvYmplY3QgPT0gbnVsbCA/IHZvaWQgMCA6IG9iamVjdFtwcm9wZXJ0eV07XG4gICAgaWYgKHZhbHVlID09PSB2b2lkIDApIHtcbiAgICAgIHZhbHVlID0gZmFsbGJhY2s7XG4gICAgfVxuICAgIHJldHVybiBfLmlzRnVuY3Rpb24odmFsdWUpID8gdmFsdWUuY2FsbChvYmplY3QpIDogdmFsdWU7XG4gIH07XG5cbiAgLy8gR2VuZXJhdGUgYSB1bmlxdWUgaW50ZWdlciBpZCAodW5pcXVlIHdpdGhpbiB0aGUgZW50aXJlIGNsaWVudCBzZXNzaW9uKS5cbiAgLy8gVXNlZnVsIGZvciB0ZW1wb3JhcnkgRE9NIGlkcy5cbiAgdmFyIGlkQ291bnRlciA9IDA7XG4gIF8udW5pcXVlSWQgPSBmdW5jdGlvbihwcmVmaXgpIHtcbiAgICB2YXIgaWQgPSArK2lkQ291bnRlciArICcnO1xuICAgIHJldHVybiBwcmVmaXggPyBwcmVmaXggKyBpZCA6IGlkO1xuICB9O1xuXG4gIC8vIEJ5IGRlZmF1bHQsIFVuZGVyc2NvcmUgdXNlcyBFUkItc3R5bGUgdGVtcGxhdGUgZGVsaW1pdGVycywgY2hhbmdlIHRoZVxuICAvLyBmb2xsb3dpbmcgdGVtcGxhdGUgc2V0dGluZ3MgdG8gdXNlIGFsdGVybmF0aXZlIGRlbGltaXRlcnMuXG4gIF8udGVtcGxhdGVTZXR0aW5ncyA9IHtcbiAgICBldmFsdWF0ZSAgICA6IC88JShbXFxzXFxTXSs/KSU+L2csXG4gICAgaW50ZXJwb2xhdGUgOiAvPCU9KFtcXHNcXFNdKz8pJT4vZyxcbiAgICBlc2NhcGUgICAgICA6IC88JS0oW1xcc1xcU10rPyklPi9nXG4gIH07XG5cbiAgLy8gV2hlbiBjdXN0b21pemluZyBgdGVtcGxhdGVTZXR0aW5nc2AsIGlmIHlvdSBkb24ndCB3YW50IHRvIGRlZmluZSBhblxuICAvLyBpbnRlcnBvbGF0aW9uLCBldmFsdWF0aW9uIG9yIGVzY2FwaW5nIHJlZ2V4LCB3ZSBuZWVkIG9uZSB0aGF0IGlzXG4gIC8vIGd1YXJhbnRlZWQgbm90IHRvIG1hdGNoLlxuICB2YXIgbm9NYXRjaCA9IC8oLileLztcblxuICAvLyBDZXJ0YWluIGNoYXJhY3RlcnMgbmVlZCB0byBiZSBlc2NhcGVkIHNvIHRoYXQgdGhleSBjYW4gYmUgcHV0IGludG8gYVxuICAvLyBzdHJpbmcgbGl0ZXJhbC5cbiAgdmFyIGVzY2FwZXMgPSB7XG4gICAgXCInXCI6ICAgICAgXCInXCIsXG4gICAgJ1xcXFwnOiAgICAgJ1xcXFwnLFxuICAgICdcXHInOiAgICAgJ3InLFxuICAgICdcXG4nOiAgICAgJ24nLFxuICAgICdcXHUyMDI4JzogJ3UyMDI4JyxcbiAgICAnXFx1MjAyOSc6ICd1MjAyOSdcbiAgfTtcblxuICB2YXIgZXNjYXBlciA9IC9cXFxcfCd8XFxyfFxcbnxcXHUyMDI4fFxcdTIwMjkvZztcblxuICB2YXIgZXNjYXBlQ2hhciA9IGZ1bmN0aW9uKG1hdGNoKSB7XG4gICAgcmV0dXJuICdcXFxcJyArIGVzY2FwZXNbbWF0Y2hdO1xuICB9O1xuXG4gIC8vIEphdmFTY3JpcHQgbWljcm8tdGVtcGxhdGluZywgc2ltaWxhciB0byBKb2huIFJlc2lnJ3MgaW1wbGVtZW50YXRpb24uXG4gIC8vIFVuZGVyc2NvcmUgdGVtcGxhdGluZyBoYW5kbGVzIGFyYml0cmFyeSBkZWxpbWl0ZXJzLCBwcmVzZXJ2ZXMgd2hpdGVzcGFjZSxcbiAgLy8gYW5kIGNvcnJlY3RseSBlc2NhcGVzIHF1b3RlcyB3aXRoaW4gaW50ZXJwb2xhdGVkIGNvZGUuXG4gIC8vIE5COiBgb2xkU2V0dGluZ3NgIG9ubHkgZXhpc3RzIGZvciBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eS5cbiAgXy50ZW1wbGF0ZSA9IGZ1bmN0aW9uKHRleHQsIHNldHRpbmdzLCBvbGRTZXR0aW5ncykge1xuICAgIGlmICghc2V0dGluZ3MgJiYgb2xkU2V0dGluZ3MpIHNldHRpbmdzID0gb2xkU2V0dGluZ3M7XG4gICAgc2V0dGluZ3MgPSBfLmRlZmF1bHRzKHt9LCBzZXR0aW5ncywgXy50ZW1wbGF0ZVNldHRpbmdzKTtcblxuICAgIC8vIENvbWJpbmUgZGVsaW1pdGVycyBpbnRvIG9uZSByZWd1bGFyIGV4cHJlc3Npb24gdmlhIGFsdGVybmF0aW9uLlxuICAgIHZhciBtYXRjaGVyID0gUmVnRXhwKFtcbiAgICAgIChzZXR0aW5ncy5lc2NhcGUgfHwgbm9NYXRjaCkuc291cmNlLFxuICAgICAgKHNldHRpbmdzLmludGVycG9sYXRlIHx8IG5vTWF0Y2gpLnNvdXJjZSxcbiAgICAgIChzZXR0aW5ncy5ldmFsdWF0ZSB8fCBub01hdGNoKS5zb3VyY2VcbiAgICBdLmpvaW4oJ3wnKSArICd8JCcsICdnJyk7XG5cbiAgICAvLyBDb21waWxlIHRoZSB0ZW1wbGF0ZSBzb3VyY2UsIGVzY2FwaW5nIHN0cmluZyBsaXRlcmFscyBhcHByb3ByaWF0ZWx5LlxuICAgIHZhciBpbmRleCA9IDA7XG4gICAgdmFyIHNvdXJjZSA9IFwiX19wKz0nXCI7XG4gICAgdGV4dC5yZXBsYWNlKG1hdGNoZXIsIGZ1bmN0aW9uKG1hdGNoLCBlc2NhcGUsIGludGVycG9sYXRlLCBldmFsdWF0ZSwgb2Zmc2V0KSB7XG4gICAgICBzb3VyY2UgKz0gdGV4dC5zbGljZShpbmRleCwgb2Zmc2V0KS5yZXBsYWNlKGVzY2FwZXIsIGVzY2FwZUNoYXIpO1xuICAgICAgaW5kZXggPSBvZmZzZXQgKyBtYXRjaC5sZW5ndGg7XG5cbiAgICAgIGlmIChlc2NhcGUpIHtcbiAgICAgICAgc291cmNlICs9IFwiJytcXG4oKF9fdD0oXCIgKyBlc2NhcGUgKyBcIikpPT1udWxsPycnOl8uZXNjYXBlKF9fdCkpK1xcbidcIjtcbiAgICAgIH0gZWxzZSBpZiAoaW50ZXJwb2xhdGUpIHtcbiAgICAgICAgc291cmNlICs9IFwiJytcXG4oKF9fdD0oXCIgKyBpbnRlcnBvbGF0ZSArIFwiKSk9PW51bGw/Jyc6X190KStcXG4nXCI7XG4gICAgICB9IGVsc2UgaWYgKGV2YWx1YXRlKSB7XG4gICAgICAgIHNvdXJjZSArPSBcIic7XFxuXCIgKyBldmFsdWF0ZSArIFwiXFxuX19wKz0nXCI7XG4gICAgICB9XG5cbiAgICAgIC8vIEFkb2JlIFZNcyBuZWVkIHRoZSBtYXRjaCByZXR1cm5lZCB0byBwcm9kdWNlIHRoZSBjb3JyZWN0IG9mZmVzdC5cbiAgICAgIHJldHVybiBtYXRjaDtcbiAgICB9KTtcbiAgICBzb3VyY2UgKz0gXCInO1xcblwiO1xuXG4gICAgLy8gSWYgYSB2YXJpYWJsZSBpcyBub3Qgc3BlY2lmaWVkLCBwbGFjZSBkYXRhIHZhbHVlcyBpbiBsb2NhbCBzY29wZS5cbiAgICBpZiAoIXNldHRpbmdzLnZhcmlhYmxlKSBzb3VyY2UgPSAnd2l0aChvYmp8fHt9KXtcXG4nICsgc291cmNlICsgJ31cXG4nO1xuXG4gICAgc291cmNlID0gXCJ2YXIgX190LF9fcD0nJyxfX2o9QXJyYXkucHJvdG90eXBlLmpvaW4sXCIgK1xuICAgICAgXCJwcmludD1mdW5jdGlvbigpe19fcCs9X19qLmNhbGwoYXJndW1lbnRzLCcnKTt9O1xcblwiICtcbiAgICAgIHNvdXJjZSArICdyZXR1cm4gX19wO1xcbic7XG5cbiAgICB0cnkge1xuICAgICAgdmFyIHJlbmRlciA9IG5ldyBGdW5jdGlvbihzZXR0aW5ncy52YXJpYWJsZSB8fCAnb2JqJywgJ18nLCBzb3VyY2UpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGUuc291cmNlID0gc291cmNlO1xuICAgICAgdGhyb3cgZTtcbiAgICB9XG5cbiAgICB2YXIgdGVtcGxhdGUgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgICByZXR1cm4gcmVuZGVyLmNhbGwodGhpcywgZGF0YSwgXyk7XG4gICAgfTtcblxuICAgIC8vIFByb3ZpZGUgdGhlIGNvbXBpbGVkIHNvdXJjZSBhcyBhIGNvbnZlbmllbmNlIGZvciBwcmVjb21waWxhdGlvbi5cbiAgICB2YXIgYXJndW1lbnQgPSBzZXR0aW5ncy52YXJpYWJsZSB8fCAnb2JqJztcbiAgICB0ZW1wbGF0ZS5zb3VyY2UgPSAnZnVuY3Rpb24oJyArIGFyZ3VtZW50ICsgJyl7XFxuJyArIHNvdXJjZSArICd9JztcblxuICAgIHJldHVybiB0ZW1wbGF0ZTtcbiAgfTtcblxuICAvLyBBZGQgYSBcImNoYWluXCIgZnVuY3Rpb24uIFN0YXJ0IGNoYWluaW5nIGEgd3JhcHBlZCBVbmRlcnNjb3JlIG9iamVjdC5cbiAgXy5jaGFpbiA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciBpbnN0YW5jZSA9IF8ob2JqKTtcbiAgICBpbnN0YW5jZS5fY2hhaW4gPSB0cnVlO1xuICAgIHJldHVybiBpbnN0YW5jZTtcbiAgfTtcblxuICAvLyBPT1BcbiAgLy8gLS0tLS0tLS0tLS0tLS0tXG4gIC8vIElmIFVuZGVyc2NvcmUgaXMgY2FsbGVkIGFzIGEgZnVuY3Rpb24sIGl0IHJldHVybnMgYSB3cmFwcGVkIG9iamVjdCB0aGF0XG4gIC8vIGNhbiBiZSB1c2VkIE9PLXN0eWxlLiBUaGlzIHdyYXBwZXIgaG9sZHMgYWx0ZXJlZCB2ZXJzaW9ucyBvZiBhbGwgdGhlXG4gIC8vIHVuZGVyc2NvcmUgZnVuY3Rpb25zLiBXcmFwcGVkIG9iamVjdHMgbWF5IGJlIGNoYWluZWQuXG5cbiAgLy8gSGVscGVyIGZ1bmN0aW9uIHRvIGNvbnRpbnVlIGNoYWluaW5nIGludGVybWVkaWF0ZSByZXN1bHRzLlxuICB2YXIgcmVzdWx0ID0gZnVuY3Rpb24oaW5zdGFuY2UsIG9iaikge1xuICAgIHJldHVybiBpbnN0YW5jZS5fY2hhaW4gPyBfKG9iaikuY2hhaW4oKSA6IG9iajtcbiAgfTtcblxuICAvLyBBZGQgeW91ciBvd24gY3VzdG9tIGZ1bmN0aW9ucyB0byB0aGUgVW5kZXJzY29yZSBvYmplY3QuXG4gIF8ubWl4aW4gPSBmdW5jdGlvbihvYmopIHtcbiAgICBfLmVhY2goXy5mdW5jdGlvbnMob2JqKSwgZnVuY3Rpb24obmFtZSkge1xuICAgICAgdmFyIGZ1bmMgPSBfW25hbWVdID0gb2JqW25hbWVdO1xuICAgICAgXy5wcm90b3R5cGVbbmFtZV0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGFyZ3MgPSBbdGhpcy5fd3JhcHBlZF07XG4gICAgICAgIHB1c2guYXBwbHkoYXJncywgYXJndW1lbnRzKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdCh0aGlzLCBmdW5jLmFwcGx5KF8sIGFyZ3MpKTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH07XG5cbiAgLy8gQWRkIGFsbCBvZiB0aGUgVW5kZXJzY29yZSBmdW5jdGlvbnMgdG8gdGhlIHdyYXBwZXIgb2JqZWN0LlxuICBfLm1peGluKF8pO1xuXG4gIC8vIEFkZCBhbGwgbXV0YXRvciBBcnJheSBmdW5jdGlvbnMgdG8gdGhlIHdyYXBwZXIuXG4gIF8uZWFjaChbJ3BvcCcsICdwdXNoJywgJ3JldmVyc2UnLCAnc2hpZnQnLCAnc29ydCcsICdzcGxpY2UnLCAndW5zaGlmdCddLCBmdW5jdGlvbihuYW1lKSB7XG4gICAgdmFyIG1ldGhvZCA9IEFycmF5UHJvdG9bbmFtZV07XG4gICAgXy5wcm90b3R5cGVbbmFtZV0gPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBvYmogPSB0aGlzLl93cmFwcGVkO1xuICAgICAgbWV0aG9kLmFwcGx5KG9iaiwgYXJndW1lbnRzKTtcbiAgICAgIGlmICgobmFtZSA9PT0gJ3NoaWZ0JyB8fCBuYW1lID09PSAnc3BsaWNlJykgJiYgb2JqLmxlbmd0aCA9PT0gMCkgZGVsZXRlIG9ialswXTtcbiAgICAgIHJldHVybiByZXN1bHQodGhpcywgb2JqKTtcbiAgICB9O1xuICB9KTtcblxuICAvLyBBZGQgYWxsIGFjY2Vzc29yIEFycmF5IGZ1bmN0aW9ucyB0byB0aGUgd3JhcHBlci5cbiAgXy5lYWNoKFsnY29uY2F0JywgJ2pvaW4nLCAnc2xpY2UnXSwgZnVuY3Rpb24obmFtZSkge1xuICAgIHZhciBtZXRob2QgPSBBcnJheVByb3RvW25hbWVdO1xuICAgIF8ucHJvdG90eXBlW25hbWVdID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gcmVzdWx0KHRoaXMsIG1ldGhvZC5hcHBseSh0aGlzLl93cmFwcGVkLCBhcmd1bWVudHMpKTtcbiAgICB9O1xuICB9KTtcblxuICAvLyBFeHRyYWN0cyB0aGUgcmVzdWx0IGZyb20gYSB3cmFwcGVkIGFuZCBjaGFpbmVkIG9iamVjdC5cbiAgXy5wcm90b3R5cGUudmFsdWUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5fd3JhcHBlZDtcbiAgfTtcblxuICAvLyBQcm92aWRlIHVud3JhcHBpbmcgcHJveHkgZm9yIHNvbWUgbWV0aG9kcyB1c2VkIGluIGVuZ2luZSBvcGVyYXRpb25zXG4gIC8vIHN1Y2ggYXMgYXJpdGhtZXRpYyBhbmQgSlNPTiBzdHJpbmdpZmljYXRpb24uXG4gIF8ucHJvdG90eXBlLnZhbHVlT2YgPSBfLnByb3RvdHlwZS50b0pTT04gPSBfLnByb3RvdHlwZS52YWx1ZTtcblxuICBfLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAnJyArIHRoaXMuX3dyYXBwZWQ7XG4gIH07XG5cbiAgLy8gQU1EIHJlZ2lzdHJhdGlvbiBoYXBwZW5zIGF0IHRoZSBlbmQgZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBBTUQgbG9hZGVyc1xuICAvLyB0aGF0IG1heSBub3QgZW5mb3JjZSBuZXh0LXR1cm4gc2VtYW50aWNzIG9uIG1vZHVsZXMuIEV2ZW4gdGhvdWdoIGdlbmVyYWxcbiAgLy8gcHJhY3RpY2UgZm9yIEFNRCByZWdpc3RyYXRpb24gaXMgdG8gYmUgYW5vbnltb3VzLCB1bmRlcnNjb3JlIHJlZ2lzdGVyc1xuICAvLyBhcyBhIG5hbWVkIG1vZHVsZSBiZWNhdXNlLCBsaWtlIGpRdWVyeSwgaXQgaXMgYSBiYXNlIGxpYnJhcnkgdGhhdCBpc1xuICAvLyBwb3B1bGFyIGVub3VnaCB0byBiZSBidW5kbGVkIGluIGEgdGhpcmQgcGFydHkgbGliLCBidXQgbm90IGJlIHBhcnQgb2ZcbiAgLy8gYW4gQU1EIGxvYWQgcmVxdWVzdC4gVGhvc2UgY2FzZXMgY291bGQgZ2VuZXJhdGUgYW4gZXJyb3Igd2hlbiBhblxuICAvLyBhbm9ueW1vdXMgZGVmaW5lKCkgaXMgY2FsbGVkIG91dHNpZGUgb2YgYSBsb2FkZXIgcmVxdWVzdC5cbiAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgIGRlZmluZSgndW5kZXJzY29yZScsIFtdLCBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBfO1xuICAgIH0pO1xuICB9XG59LmNhbGwodGhpcykpO1xuIiwiLyohXG4gKiBqUXVlcnkgVUkgTW91c2UgMS4xMi4xXG4gKiBodHRwOi8vanF1ZXJ5dWkuY29tXG4gKlxuICogQ29weXJpZ2h0IGpRdWVyeSBGb3VuZGF0aW9uIGFuZCBvdGhlciBjb250cmlidXRvcnNcbiAqIFJlbGVhc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZS5cbiAqIGh0dHA6Ly9qcXVlcnkub3JnL2xpY2Vuc2VcbiAqL1xuXG4vLz4+bGFiZWw6IE1vdXNlXG4vLz4+Z3JvdXA6IFdpZGdldHNcbi8vPj5kZXNjcmlwdGlvbjogQWJzdHJhY3RzIG1vdXNlLWJhc2VkIGludGVyYWN0aW9ucyB0byBhc3Npc3QgaW4gY3JlYXRpbmcgY2VydGFpbiB3aWRnZXRzLlxuLy8+PmRvY3M6IGh0dHA6Ly9hcGkuanF1ZXJ5dWkuY29tL21vdXNlL1xuXG4oIGZ1bmN0aW9uKCBmYWN0b3J5ICkge1xuXHRpZiAoIHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kICkge1xuXG5cdFx0Ly8gQU1ELiBSZWdpc3RlciBhcyBhbiBhbm9ueW1vdXMgbW9kdWxlLlxuXHRcdGRlZmluZSggW1xuXHRcdFx0XCJqcXVlcnlcIixcblx0XHRcdFwiLi4vaWVcIixcblx0XHRcdFwiLi4vdmVyc2lvblwiLFxuXHRcdFx0XCIuLi93aWRnZXRcIlxuXHRcdF0sIGZhY3RvcnkgKTtcblx0fSBlbHNlIHtcblxuXHRcdC8vIEJyb3dzZXIgZ2xvYmFsc1xuXHRcdGZhY3RvcnkoIGpRdWVyeSApO1xuXHR9XG59KCBmdW5jdGlvbiggJCApIHtcblxudmFyIG1vdXNlSGFuZGxlZCA9IGZhbHNlO1xuJCggZG9jdW1lbnQgKS5vbiggXCJtb3VzZXVwXCIsIGZ1bmN0aW9uKCkge1xuXHRtb3VzZUhhbmRsZWQgPSBmYWxzZTtcbn0gKTtcblxucmV0dXJuICQud2lkZ2V0KCBcInVpLm1vdXNlXCIsIHtcblx0dmVyc2lvbjogXCIxLjEyLjFcIixcblx0b3B0aW9uczoge1xuXHRcdGNhbmNlbDogXCJpbnB1dCwgdGV4dGFyZWEsIGJ1dHRvbiwgc2VsZWN0LCBvcHRpb25cIixcblx0XHRkaXN0YW5jZTogMSxcblx0XHRkZWxheTogMFxuXHR9LFxuXHRfbW91c2VJbml0OiBmdW5jdGlvbigpIHtcblx0XHR2YXIgdGhhdCA9IHRoaXM7XG5cblx0XHR0aGlzLmVsZW1lbnRcblx0XHRcdC5vbiggXCJtb3VzZWRvd24uXCIgKyB0aGlzLndpZGdldE5hbWUsIGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHRcdFx0cmV0dXJuIHRoYXQuX21vdXNlRG93biggZXZlbnQgKTtcblx0XHRcdH0gKVxuXHRcdFx0Lm9uKCBcImNsaWNrLlwiICsgdGhpcy53aWRnZXROYW1lLCBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0XHRcdGlmICggdHJ1ZSA9PT0gJC5kYXRhKCBldmVudC50YXJnZXQsIHRoYXQud2lkZ2V0TmFtZSArIFwiLnByZXZlbnRDbGlja0V2ZW50XCIgKSApIHtcblx0XHRcdFx0XHQkLnJlbW92ZURhdGEoIGV2ZW50LnRhcmdldCwgdGhhdC53aWRnZXROYW1lICsgXCIucHJldmVudENsaWNrRXZlbnRcIiApO1xuXHRcdFx0XHRcdGV2ZW50LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fVxuXHRcdFx0fSApO1xuXG5cdFx0dGhpcy5zdGFydGVkID0gZmFsc2U7XG5cdH0sXG5cblx0Ly8gVE9ETzogbWFrZSBzdXJlIGRlc3Ryb3lpbmcgb25lIGluc3RhbmNlIG9mIG1vdXNlIGRvZXNuJ3QgbWVzcyB3aXRoXG5cdC8vIG90aGVyIGluc3RhbmNlcyBvZiBtb3VzZVxuXHRfbW91c2VEZXN0cm95OiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmVsZW1lbnQub2ZmKCBcIi5cIiArIHRoaXMud2lkZ2V0TmFtZSApO1xuXHRcdGlmICggdGhpcy5fbW91c2VNb3ZlRGVsZWdhdGUgKSB7XG5cdFx0XHR0aGlzLmRvY3VtZW50XG5cdFx0XHRcdC5vZmYoIFwibW91c2Vtb3ZlLlwiICsgdGhpcy53aWRnZXROYW1lLCB0aGlzLl9tb3VzZU1vdmVEZWxlZ2F0ZSApXG5cdFx0XHRcdC5vZmYoIFwibW91c2V1cC5cIiArIHRoaXMud2lkZ2V0TmFtZSwgdGhpcy5fbW91c2VVcERlbGVnYXRlICk7XG5cdFx0fVxuXHR9LFxuXG5cdF9tb3VzZURvd246IGZ1bmN0aW9uKCBldmVudCApIHtcblxuXHRcdC8vIGRvbid0IGxldCBtb3JlIHRoYW4gb25lIHdpZGdldCBoYW5kbGUgbW91c2VTdGFydFxuXHRcdGlmICggbW91c2VIYW5kbGVkICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHRoaXMuX21vdXNlTW92ZWQgPSBmYWxzZTtcblxuXHRcdC8vIFdlIG1heSBoYXZlIG1pc3NlZCBtb3VzZXVwIChvdXQgb2Ygd2luZG93KVxuXHRcdCggdGhpcy5fbW91c2VTdGFydGVkICYmIHRoaXMuX21vdXNlVXAoIGV2ZW50ICkgKTtcblxuXHRcdHRoaXMuX21vdXNlRG93bkV2ZW50ID0gZXZlbnQ7XG5cblx0XHR2YXIgdGhhdCA9IHRoaXMsXG5cdFx0XHRidG5Jc0xlZnQgPSAoIGV2ZW50LndoaWNoID09PSAxICksXG5cblx0XHRcdC8vIGV2ZW50LnRhcmdldC5ub2RlTmFtZSB3b3JrcyBhcm91bmQgYSBidWcgaW4gSUUgOCB3aXRoXG5cdFx0XHQvLyBkaXNhYmxlZCBpbnB1dHMgKCM3NjIwKVxuXHRcdFx0ZWxJc0NhbmNlbCA9ICggdHlwZW9mIHRoaXMub3B0aW9ucy5jYW5jZWwgPT09IFwic3RyaW5nXCIgJiYgZXZlbnQudGFyZ2V0Lm5vZGVOYW1lID9cblx0XHRcdFx0JCggZXZlbnQudGFyZ2V0ICkuY2xvc2VzdCggdGhpcy5vcHRpb25zLmNhbmNlbCApLmxlbmd0aCA6IGZhbHNlICk7XG5cdFx0aWYgKCAhYnRuSXNMZWZ0IHx8IGVsSXNDYW5jZWwgfHwgIXRoaXMuX21vdXNlQ2FwdHVyZSggZXZlbnQgKSApIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblxuXHRcdHRoaXMubW91c2VEZWxheU1ldCA9ICF0aGlzLm9wdGlvbnMuZGVsYXk7XG5cdFx0aWYgKCAhdGhpcy5tb3VzZURlbGF5TWV0ICkge1xuXHRcdFx0dGhpcy5fbW91c2VEZWxheVRpbWVyID0gc2V0VGltZW91dCggZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHRoYXQubW91c2VEZWxheU1ldCA9IHRydWU7XG5cdFx0XHR9LCB0aGlzLm9wdGlvbnMuZGVsYXkgKTtcblx0XHR9XG5cblx0XHRpZiAoIHRoaXMuX21vdXNlRGlzdGFuY2VNZXQoIGV2ZW50ICkgJiYgdGhpcy5fbW91c2VEZWxheU1ldCggZXZlbnQgKSApIHtcblx0XHRcdHRoaXMuX21vdXNlU3RhcnRlZCA9ICggdGhpcy5fbW91c2VTdGFydCggZXZlbnQgKSAhPT0gZmFsc2UgKTtcblx0XHRcdGlmICggIXRoaXMuX21vdXNlU3RhcnRlZCApIHtcblx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gQ2xpY2sgZXZlbnQgbWF5IG5ldmVyIGhhdmUgZmlyZWQgKEdlY2tvICYgT3BlcmEpXG5cdFx0aWYgKCB0cnVlID09PSAkLmRhdGEoIGV2ZW50LnRhcmdldCwgdGhpcy53aWRnZXROYW1lICsgXCIucHJldmVudENsaWNrRXZlbnRcIiApICkge1xuXHRcdFx0JC5yZW1vdmVEYXRhKCBldmVudC50YXJnZXQsIHRoaXMud2lkZ2V0TmFtZSArIFwiLnByZXZlbnRDbGlja0V2ZW50XCIgKTtcblx0XHR9XG5cblx0XHQvLyBUaGVzZSBkZWxlZ2F0ZXMgYXJlIHJlcXVpcmVkIHRvIGtlZXAgY29udGV4dFxuXHRcdHRoaXMuX21vdXNlTW92ZURlbGVnYXRlID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdFx0cmV0dXJuIHRoYXQuX21vdXNlTW92ZSggZXZlbnQgKTtcblx0XHR9O1xuXHRcdHRoaXMuX21vdXNlVXBEZWxlZ2F0ZSA9IGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHRcdHJldHVybiB0aGF0Ll9tb3VzZVVwKCBldmVudCApO1xuXHRcdH07XG5cblx0XHR0aGlzLmRvY3VtZW50XG5cdFx0XHQub24oIFwibW91c2Vtb3ZlLlwiICsgdGhpcy53aWRnZXROYW1lLCB0aGlzLl9tb3VzZU1vdmVEZWxlZ2F0ZSApXG5cdFx0XHQub24oIFwibW91c2V1cC5cIiArIHRoaXMud2lkZ2V0TmFtZSwgdGhpcy5fbW91c2VVcERlbGVnYXRlICk7XG5cblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0bW91c2VIYW5kbGVkID0gdHJ1ZTtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fSxcblxuXHRfbW91c2VNb3ZlOiBmdW5jdGlvbiggZXZlbnQgKSB7XG5cblx0XHQvLyBPbmx5IGNoZWNrIGZvciBtb3VzZXVwcyBvdXRzaWRlIHRoZSBkb2N1bWVudCBpZiB5b3UndmUgbW92ZWQgaW5zaWRlIHRoZSBkb2N1bWVudFxuXHRcdC8vIGF0IGxlYXN0IG9uY2UuIFRoaXMgcHJldmVudHMgdGhlIGZpcmluZyBvZiBtb3VzZXVwIGluIHRoZSBjYXNlIG9mIElFPDksIHdoaWNoIHdpbGxcblx0XHQvLyBmaXJlIGEgbW91c2Vtb3ZlIGV2ZW50IGlmIGNvbnRlbnQgaXMgcGxhY2VkIHVuZGVyIHRoZSBjdXJzb3IuIFNlZSAjNzc3OFxuXHRcdC8vIFN1cHBvcnQ6IElFIDw5XG5cdFx0aWYgKCB0aGlzLl9tb3VzZU1vdmVkICkge1xuXG5cdFx0XHQvLyBJRSBtb3VzZXVwIGNoZWNrIC0gbW91c2V1cCBoYXBwZW5lZCB3aGVuIG1vdXNlIHdhcyBvdXQgb2Ygd2luZG93XG5cdFx0XHRpZiAoICQudWkuaWUgJiYgKCAhZG9jdW1lbnQuZG9jdW1lbnRNb2RlIHx8IGRvY3VtZW50LmRvY3VtZW50TW9kZSA8IDkgKSAmJlxuXHRcdFx0XHRcdCFldmVudC5idXR0b24gKSB7XG5cdFx0XHRcdHJldHVybiB0aGlzLl9tb3VzZVVwKCBldmVudCApO1xuXG5cdFx0XHQvLyBJZnJhbWUgbW91c2V1cCBjaGVjayAtIG1vdXNldXAgb2NjdXJyZWQgaW4gYW5vdGhlciBkb2N1bWVudFxuXHRcdFx0fSBlbHNlIGlmICggIWV2ZW50LndoaWNoICkge1xuXG5cdFx0XHRcdC8vIFN1cHBvcnQ6IFNhZmFyaSA8PTggLSA5XG5cdFx0XHRcdC8vIFNhZmFyaSBzZXRzIHdoaWNoIHRvIDAgaWYgeW91IHByZXNzIGFueSBvZiB0aGUgZm9sbG93aW5nIGtleXNcblx0XHRcdFx0Ly8gZHVyaW5nIGEgZHJhZyAoIzE0NDYxKVxuXHRcdFx0XHRpZiAoIGV2ZW50Lm9yaWdpbmFsRXZlbnQuYWx0S2V5IHx8IGV2ZW50Lm9yaWdpbmFsRXZlbnQuY3RybEtleSB8fFxuXHRcdFx0XHRcdFx0ZXZlbnQub3JpZ2luYWxFdmVudC5tZXRhS2V5IHx8IGV2ZW50Lm9yaWdpbmFsRXZlbnQuc2hpZnRLZXkgKSB7XG5cdFx0XHRcdFx0dGhpcy5pZ25vcmVNaXNzaW5nV2hpY2ggPSB0cnVlO1xuXHRcdFx0XHR9IGVsc2UgaWYgKCAhdGhpcy5pZ25vcmVNaXNzaW5nV2hpY2ggKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMuX21vdXNlVXAoIGV2ZW50ICk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAoIGV2ZW50LndoaWNoIHx8IGV2ZW50LmJ1dHRvbiApIHtcblx0XHRcdHRoaXMuX21vdXNlTW92ZWQgPSB0cnVlO1xuXHRcdH1cblxuXHRcdGlmICggdGhpcy5fbW91c2VTdGFydGVkICkge1xuXHRcdFx0dGhpcy5fbW91c2VEcmFnKCBldmVudCApO1xuXHRcdFx0cmV0dXJuIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0fVxuXG5cdFx0aWYgKCB0aGlzLl9tb3VzZURpc3RhbmNlTWV0KCBldmVudCApICYmIHRoaXMuX21vdXNlRGVsYXlNZXQoIGV2ZW50ICkgKSB7XG5cdFx0XHR0aGlzLl9tb3VzZVN0YXJ0ZWQgPVxuXHRcdFx0XHQoIHRoaXMuX21vdXNlU3RhcnQoIHRoaXMuX21vdXNlRG93bkV2ZW50LCBldmVudCApICE9PSBmYWxzZSApO1xuXHRcdFx0KCB0aGlzLl9tb3VzZVN0YXJ0ZWQgPyB0aGlzLl9tb3VzZURyYWcoIGV2ZW50ICkgOiB0aGlzLl9tb3VzZVVwKCBldmVudCApICk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuICF0aGlzLl9tb3VzZVN0YXJ0ZWQ7XG5cdH0sXG5cblx0X21vdXNlVXA6IGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHR0aGlzLmRvY3VtZW50XG5cdFx0XHQub2ZmKCBcIm1vdXNlbW92ZS5cIiArIHRoaXMud2lkZ2V0TmFtZSwgdGhpcy5fbW91c2VNb3ZlRGVsZWdhdGUgKVxuXHRcdFx0Lm9mZiggXCJtb3VzZXVwLlwiICsgdGhpcy53aWRnZXROYW1lLCB0aGlzLl9tb3VzZVVwRGVsZWdhdGUgKTtcblxuXHRcdGlmICggdGhpcy5fbW91c2VTdGFydGVkICkge1xuXHRcdFx0dGhpcy5fbW91c2VTdGFydGVkID0gZmFsc2U7XG5cblx0XHRcdGlmICggZXZlbnQudGFyZ2V0ID09PSB0aGlzLl9tb3VzZURvd25FdmVudC50YXJnZXQgKSB7XG5cdFx0XHRcdCQuZGF0YSggZXZlbnQudGFyZ2V0LCB0aGlzLndpZGdldE5hbWUgKyBcIi5wcmV2ZW50Q2xpY2tFdmVudFwiLCB0cnVlICk7XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMuX21vdXNlU3RvcCggZXZlbnQgKTtcblx0XHR9XG5cblx0XHRpZiAoIHRoaXMuX21vdXNlRGVsYXlUaW1lciApIHtcblx0XHRcdGNsZWFyVGltZW91dCggdGhpcy5fbW91c2VEZWxheVRpbWVyICk7XG5cdFx0XHRkZWxldGUgdGhpcy5fbW91c2VEZWxheVRpbWVyO1xuXHRcdH1cblxuXHRcdHRoaXMuaWdub3JlTWlzc2luZ1doaWNoID0gZmFsc2U7XG5cdFx0bW91c2VIYW5kbGVkID0gZmFsc2U7XG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0fSxcblxuXHRfbW91c2VEaXN0YW5jZU1ldDogZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdHJldHVybiAoIE1hdGgubWF4KFxuXHRcdFx0XHRNYXRoLmFicyggdGhpcy5fbW91c2VEb3duRXZlbnQucGFnZVggLSBldmVudC5wYWdlWCApLFxuXHRcdFx0XHRNYXRoLmFicyggdGhpcy5fbW91c2VEb3duRXZlbnQucGFnZVkgLSBldmVudC5wYWdlWSApXG5cdFx0XHQpID49IHRoaXMub3B0aW9ucy5kaXN0YW5jZVxuXHRcdCk7XG5cdH0sXG5cblx0X21vdXNlRGVsYXlNZXQ6IGZ1bmN0aW9uKCAvKiBldmVudCAqLyApIHtcblx0XHRyZXR1cm4gdGhpcy5tb3VzZURlbGF5TWV0O1xuXHR9LFxuXG5cdC8vIFRoZXNlIGFyZSBwbGFjZWhvbGRlciBtZXRob2RzLCB0byBiZSBvdmVycmlkZW4gYnkgZXh0ZW5kaW5nIHBsdWdpblxuXHRfbW91c2VTdGFydDogZnVuY3Rpb24oIC8qIGV2ZW50ICovICkge30sXG5cdF9tb3VzZURyYWc6IGZ1bmN0aW9uKCAvKiBldmVudCAqLyApIHt9LFxuXHRfbW91c2VTdG9wOiBmdW5jdGlvbiggLyogZXZlbnQgKi8gKSB7fSxcblx0X21vdXNlQ2FwdHVyZTogZnVuY3Rpb24oIC8qIGV2ZW50ICovICkgeyByZXR1cm4gdHJ1ZTsgfVxufSApO1xuXG59ICkgKTtcbiIsIi8qIVxuICogalF1ZXJ5IFVJIERyYWdnYWJsZSAxLjEyLjFcbiAqIGh0dHA6Ly9qcXVlcnl1aS5jb21cbiAqXG4gKiBDb3B5cmlnaHQgalF1ZXJ5IEZvdW5kYXRpb24gYW5kIG90aGVyIGNvbnRyaWJ1dG9yc1xuICogUmVsZWFzZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlLlxuICogaHR0cDovL2pxdWVyeS5vcmcvbGljZW5zZVxuICovXG5cbi8vPj5sYWJlbDogRHJhZ2dhYmxlXG4vLz4+Z3JvdXA6IEludGVyYWN0aW9uc1xuLy8+PmRlc2NyaXB0aW9uOiBFbmFibGVzIGRyYWdnaW5nIGZ1bmN0aW9uYWxpdHkgZm9yIGFueSBlbGVtZW50LlxuLy8+PmRvY3M6IGh0dHA6Ly9hcGkuanF1ZXJ5dWkuY29tL2RyYWdnYWJsZS9cbi8vPj5kZW1vczogaHR0cDovL2pxdWVyeXVpLmNvbS9kcmFnZ2FibGUvXG4vLz4+Y3NzLnN0cnVjdHVyZTogLi4vLi4vdGhlbWVzL2Jhc2UvZHJhZ2dhYmxlLmNzc1xuXG4oIGZ1bmN0aW9uKCBmYWN0b3J5ICkge1xuXHRpZiAoIHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kICkge1xuXG5cdFx0Ly8gQU1ELiBSZWdpc3RlciBhcyBhbiBhbm9ueW1vdXMgbW9kdWxlLlxuXHRcdGRlZmluZSggW1xuXHRcdFx0XCJqcXVlcnlcIixcblx0XHRcdFwiLi9tb3VzZVwiLFxuXHRcdFx0XCIuLi9kYXRhXCIsXG5cdFx0XHRcIi4uL3BsdWdpblwiLFxuXHRcdFx0XCIuLi9zYWZlLWFjdGl2ZS1lbGVtZW50XCIsXG5cdFx0XHRcIi4uL3NhZmUtYmx1clwiLFxuXHRcdFx0XCIuLi9zY3JvbGwtcGFyZW50XCIsXG5cdFx0XHRcIi4uL3ZlcnNpb25cIixcblx0XHRcdFwiLi4vd2lkZ2V0XCJcblx0XHRdLCBmYWN0b3J5ICk7XG5cdH0gZWxzZSB7XG5cblx0XHQvLyBCcm93c2VyIGdsb2JhbHNcblx0XHRmYWN0b3J5KCBqUXVlcnkgKTtcblx0fVxufSggZnVuY3Rpb24oICQgKSB7XG5cbiQud2lkZ2V0KCBcInVpLmRyYWdnYWJsZVwiLCAkLnVpLm1vdXNlLCB7XG5cdHZlcnNpb246IFwiMS4xMi4xXCIsXG5cdHdpZGdldEV2ZW50UHJlZml4OiBcImRyYWdcIixcblx0b3B0aW9uczoge1xuXHRcdGFkZENsYXNzZXM6IHRydWUsXG5cdFx0YXBwZW5kVG86IFwicGFyZW50XCIsXG5cdFx0YXhpczogZmFsc2UsXG5cdFx0Y29ubmVjdFRvU29ydGFibGU6IGZhbHNlLFxuXHRcdGNvbnRhaW5tZW50OiBmYWxzZSxcblx0XHRjdXJzb3I6IFwiYXV0b1wiLFxuXHRcdGN1cnNvckF0OiBmYWxzZSxcblx0XHRncmlkOiBmYWxzZSxcblx0XHRoYW5kbGU6IGZhbHNlLFxuXHRcdGhlbHBlcjogXCJvcmlnaW5hbFwiLFxuXHRcdGlmcmFtZUZpeDogZmFsc2UsXG5cdFx0b3BhY2l0eTogZmFsc2UsXG5cdFx0cmVmcmVzaFBvc2l0aW9uczogZmFsc2UsXG5cdFx0cmV2ZXJ0OiBmYWxzZSxcblx0XHRyZXZlcnREdXJhdGlvbjogNTAwLFxuXHRcdHNjb3BlOiBcImRlZmF1bHRcIixcblx0XHRzY3JvbGw6IHRydWUsXG5cdFx0c2Nyb2xsU2Vuc2l0aXZpdHk6IDIwLFxuXHRcdHNjcm9sbFNwZWVkOiAyMCxcblx0XHRzbmFwOiBmYWxzZSxcblx0XHRzbmFwTW9kZTogXCJib3RoXCIsXG5cdFx0c25hcFRvbGVyYW5jZTogMjAsXG5cdFx0c3RhY2s6IGZhbHNlLFxuXHRcdHpJbmRleDogZmFsc2UsXG5cblx0XHQvLyBDYWxsYmFja3Ncblx0XHRkcmFnOiBudWxsLFxuXHRcdHN0YXJ0OiBudWxsLFxuXHRcdHN0b3A6IG51bGxcblx0fSxcblx0X2NyZWF0ZTogZnVuY3Rpb24oKSB7XG5cblx0XHRpZiAoIHRoaXMub3B0aW9ucy5oZWxwZXIgPT09IFwib3JpZ2luYWxcIiApIHtcblx0XHRcdHRoaXMuX3NldFBvc2l0aW9uUmVsYXRpdmUoKTtcblx0XHR9XG5cdFx0aWYgKCB0aGlzLm9wdGlvbnMuYWRkQ2xhc3NlcyApIHtcblx0XHRcdHRoaXMuX2FkZENsYXNzKCBcInVpLWRyYWdnYWJsZVwiICk7XG5cdFx0fVxuXHRcdHRoaXMuX3NldEhhbmRsZUNsYXNzTmFtZSgpO1xuXG5cdFx0dGhpcy5fbW91c2VJbml0KCk7XG5cdH0sXG5cblx0X3NldE9wdGlvbjogZnVuY3Rpb24oIGtleSwgdmFsdWUgKSB7XG5cdFx0dGhpcy5fc3VwZXIoIGtleSwgdmFsdWUgKTtcblx0XHRpZiAoIGtleSA9PT0gXCJoYW5kbGVcIiApIHtcblx0XHRcdHRoaXMuX3JlbW92ZUhhbmRsZUNsYXNzTmFtZSgpO1xuXHRcdFx0dGhpcy5fc2V0SGFuZGxlQ2xhc3NOYW1lKCk7XG5cdFx0fVxuXHR9LFxuXG5cdF9kZXN0cm95OiBmdW5jdGlvbigpIHtcblx0XHRpZiAoICggdGhpcy5oZWxwZXIgfHwgdGhpcy5lbGVtZW50ICkuaXMoIFwiLnVpLWRyYWdnYWJsZS1kcmFnZ2luZ1wiICkgKSB7XG5cdFx0XHR0aGlzLmRlc3Ryb3lPbkNsZWFyID0gdHJ1ZTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0dGhpcy5fcmVtb3ZlSGFuZGxlQ2xhc3NOYW1lKCk7XG5cdFx0dGhpcy5fbW91c2VEZXN0cm95KCk7XG5cdH0sXG5cblx0X21vdXNlQ2FwdHVyZTogZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdHZhciBvID0gdGhpcy5vcHRpb25zO1xuXG5cdFx0Ly8gQW1vbmcgb3RoZXJzLCBwcmV2ZW50IGEgZHJhZyBvbiBhIHJlc2l6YWJsZS1oYW5kbGVcblx0XHRpZiAoIHRoaXMuaGVscGVyIHx8IG8uZGlzYWJsZWQgfHxcblx0XHRcdFx0JCggZXZlbnQudGFyZ2V0ICkuY2xvc2VzdCggXCIudWktcmVzaXphYmxlLWhhbmRsZVwiICkubGVuZ3RoID4gMCApIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHQvL1F1aXQgaWYgd2UncmUgbm90IG9uIGEgdmFsaWQgaGFuZGxlXG5cdFx0dGhpcy5oYW5kbGUgPSB0aGlzLl9nZXRIYW5kbGUoIGV2ZW50ICk7XG5cdFx0aWYgKCAhdGhpcy5oYW5kbGUgKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0dGhpcy5fYmx1ckFjdGl2ZUVsZW1lbnQoIGV2ZW50ICk7XG5cblx0XHR0aGlzLl9ibG9ja0ZyYW1lcyggby5pZnJhbWVGaXggPT09IHRydWUgPyBcImlmcmFtZVwiIDogby5pZnJhbWVGaXggKTtcblxuXHRcdHJldHVybiB0cnVlO1xuXG5cdH0sXG5cblx0X2Jsb2NrRnJhbWVzOiBmdW5jdGlvbiggc2VsZWN0b3IgKSB7XG5cdFx0dGhpcy5pZnJhbWVCbG9ja3MgPSB0aGlzLmRvY3VtZW50LmZpbmQoIHNlbGVjdG9yICkubWFwKCBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBpZnJhbWUgPSAkKCB0aGlzICk7XG5cblx0XHRcdHJldHVybiAkKCBcIjxkaXY+XCIgKVxuXHRcdFx0XHQuY3NzKCBcInBvc2l0aW9uXCIsIFwiYWJzb2x1dGVcIiApXG5cdFx0XHRcdC5hcHBlbmRUbyggaWZyYW1lLnBhcmVudCgpIClcblx0XHRcdFx0Lm91dGVyV2lkdGgoIGlmcmFtZS5vdXRlcldpZHRoKCkgKVxuXHRcdFx0XHQub3V0ZXJIZWlnaHQoIGlmcmFtZS5vdXRlckhlaWdodCgpIClcblx0XHRcdFx0Lm9mZnNldCggaWZyYW1lLm9mZnNldCgpIClbIDAgXTtcblx0XHR9ICk7XG5cdH0sXG5cblx0X3VuYmxvY2tGcmFtZXM6IGZ1bmN0aW9uKCkge1xuXHRcdGlmICggdGhpcy5pZnJhbWVCbG9ja3MgKSB7XG5cdFx0XHR0aGlzLmlmcmFtZUJsb2Nrcy5yZW1vdmUoKTtcblx0XHRcdGRlbGV0ZSB0aGlzLmlmcmFtZUJsb2Nrcztcblx0XHR9XG5cdH0sXG5cblx0X2JsdXJBY3RpdmVFbGVtZW50OiBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0dmFyIGFjdGl2ZUVsZW1lbnQgPSAkLnVpLnNhZmVBY3RpdmVFbGVtZW50KCB0aGlzLmRvY3VtZW50WyAwIF0gKSxcblx0XHRcdHRhcmdldCA9ICQoIGV2ZW50LnRhcmdldCApO1xuXG5cdFx0Ly8gRG9uJ3QgYmx1ciBpZiB0aGUgZXZlbnQgb2NjdXJyZWQgb24gYW4gZWxlbWVudCB0aGF0IGlzIHdpdGhpblxuXHRcdC8vIHRoZSBjdXJyZW50bHkgZm9jdXNlZCBlbGVtZW50XG5cdFx0Ly8gU2VlICMxMDUyNywgIzEyNDcyXG5cdFx0aWYgKCB0YXJnZXQuY2xvc2VzdCggYWN0aXZlRWxlbWVudCApLmxlbmd0aCApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHQvLyBCbHVyIGFueSBlbGVtZW50IHRoYXQgY3VycmVudGx5IGhhcyBmb2N1cywgc2VlICM0MjYxXG5cdFx0JC51aS5zYWZlQmx1ciggYWN0aXZlRWxlbWVudCApO1xuXHR9LFxuXG5cdF9tb3VzZVN0YXJ0OiBmdW5jdGlvbiggZXZlbnQgKSB7XG5cblx0XHR2YXIgbyA9IHRoaXMub3B0aW9ucztcblxuXHRcdC8vQ3JlYXRlIGFuZCBhcHBlbmQgdGhlIHZpc2libGUgaGVscGVyXG5cdFx0dGhpcy5oZWxwZXIgPSB0aGlzLl9jcmVhdGVIZWxwZXIoIGV2ZW50ICk7XG5cblx0XHR0aGlzLl9hZGRDbGFzcyggdGhpcy5oZWxwZXIsIFwidWktZHJhZ2dhYmxlLWRyYWdnaW5nXCIgKTtcblxuXHRcdC8vQ2FjaGUgdGhlIGhlbHBlciBzaXplXG5cdFx0dGhpcy5fY2FjaGVIZWxwZXJQcm9wb3J0aW9ucygpO1xuXG5cdFx0Ly9JZiBkZG1hbmFnZXIgaXMgdXNlZCBmb3IgZHJvcHBhYmxlcywgc2V0IHRoZSBnbG9iYWwgZHJhZ2dhYmxlXG5cdFx0aWYgKCAkLnVpLmRkbWFuYWdlciApIHtcblx0XHRcdCQudWkuZGRtYW5hZ2VyLmN1cnJlbnQgPSB0aGlzO1xuXHRcdH1cblxuXHRcdC8qXG5cdFx0ICogLSBQb3NpdGlvbiBnZW5lcmF0aW9uIC1cblx0XHQgKiBUaGlzIGJsb2NrIGdlbmVyYXRlcyBldmVyeXRoaW5nIHBvc2l0aW9uIHJlbGF0ZWQgLSBpdCdzIHRoZSBjb3JlIG9mIGRyYWdnYWJsZXMuXG5cdFx0ICovXG5cblx0XHQvL0NhY2hlIHRoZSBtYXJnaW5zIG9mIHRoZSBvcmlnaW5hbCBlbGVtZW50XG5cdFx0dGhpcy5fY2FjaGVNYXJnaW5zKCk7XG5cblx0XHQvL1N0b3JlIHRoZSBoZWxwZXIncyBjc3MgcG9zaXRpb25cblx0XHR0aGlzLmNzc1Bvc2l0aW9uID0gdGhpcy5oZWxwZXIuY3NzKCBcInBvc2l0aW9uXCIgKTtcblx0XHR0aGlzLnNjcm9sbFBhcmVudCA9IHRoaXMuaGVscGVyLnNjcm9sbFBhcmVudCggdHJ1ZSApO1xuXHRcdHRoaXMub2Zmc2V0UGFyZW50ID0gdGhpcy5oZWxwZXIub2Zmc2V0UGFyZW50KCk7XG5cdFx0dGhpcy5oYXNGaXhlZEFuY2VzdG9yID0gdGhpcy5oZWxwZXIucGFyZW50cygpLmZpbHRlciggZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHJldHVybiAkKCB0aGlzICkuY3NzKCBcInBvc2l0aW9uXCIgKSA9PT0gXCJmaXhlZFwiO1xuXHRcdFx0fSApLmxlbmd0aCA+IDA7XG5cblx0XHQvL1RoZSBlbGVtZW50J3MgYWJzb2x1dGUgcG9zaXRpb24gb24gdGhlIHBhZ2UgbWludXMgbWFyZ2luc1xuXHRcdHRoaXMucG9zaXRpb25BYnMgPSB0aGlzLmVsZW1lbnQub2Zmc2V0KCk7XG5cdFx0dGhpcy5fcmVmcmVzaE9mZnNldHMoIGV2ZW50ICk7XG5cblx0XHQvL0dlbmVyYXRlIHRoZSBvcmlnaW5hbCBwb3NpdGlvblxuXHRcdHRoaXMub3JpZ2luYWxQb3NpdGlvbiA9IHRoaXMucG9zaXRpb24gPSB0aGlzLl9nZW5lcmF0ZVBvc2l0aW9uKCBldmVudCwgZmFsc2UgKTtcblx0XHR0aGlzLm9yaWdpbmFsUGFnZVggPSBldmVudC5wYWdlWDtcblx0XHR0aGlzLm9yaWdpbmFsUGFnZVkgPSBldmVudC5wYWdlWTtcblxuXHRcdC8vQWRqdXN0IHRoZSBtb3VzZSBvZmZzZXQgcmVsYXRpdmUgdG8gdGhlIGhlbHBlciBpZiBcImN1cnNvckF0XCIgaXMgc3VwcGxpZWRcblx0XHQoIG8uY3Vyc29yQXQgJiYgdGhpcy5fYWRqdXN0T2Zmc2V0RnJvbUhlbHBlciggby5jdXJzb3JBdCApICk7XG5cblx0XHQvL1NldCBhIGNvbnRhaW5tZW50IGlmIGdpdmVuIGluIHRoZSBvcHRpb25zXG5cdFx0dGhpcy5fc2V0Q29udGFpbm1lbnQoKTtcblxuXHRcdC8vVHJpZ2dlciBldmVudCArIGNhbGxiYWNrc1xuXHRcdGlmICggdGhpcy5fdHJpZ2dlciggXCJzdGFydFwiLCBldmVudCApID09PSBmYWxzZSApIHtcblx0XHRcdHRoaXMuX2NsZWFyKCk7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0Ly9SZWNhY2hlIHRoZSBoZWxwZXIgc2l6ZVxuXHRcdHRoaXMuX2NhY2hlSGVscGVyUHJvcG9ydGlvbnMoKTtcblxuXHRcdC8vUHJlcGFyZSB0aGUgZHJvcHBhYmxlIG9mZnNldHNcblx0XHRpZiAoICQudWkuZGRtYW5hZ2VyICYmICFvLmRyb3BCZWhhdmlvdXIgKSB7XG5cdFx0XHQkLnVpLmRkbWFuYWdlci5wcmVwYXJlT2Zmc2V0cyggdGhpcywgZXZlbnQgKTtcblx0XHR9XG5cblx0XHQvLyBFeGVjdXRlIHRoZSBkcmFnIG9uY2UgLSB0aGlzIGNhdXNlcyB0aGUgaGVscGVyIG5vdCB0byBiZSB2aXNpYmxlIGJlZm9yZSBnZXR0aW5nIGl0c1xuXHRcdC8vIGNvcnJlY3QgcG9zaXRpb25cblx0XHR0aGlzLl9tb3VzZURyYWcoIGV2ZW50LCB0cnVlICk7XG5cblx0XHQvLyBJZiB0aGUgZGRtYW5hZ2VyIGlzIHVzZWQgZm9yIGRyb3BwYWJsZXMsIGluZm9ybSB0aGUgbWFuYWdlciB0aGF0IGRyYWdnaW5nIGhhcyBzdGFydGVkXG5cdFx0Ly8gKHNlZSAjNTAwMylcblx0XHRpZiAoICQudWkuZGRtYW5hZ2VyICkge1xuXHRcdFx0JC51aS5kZG1hbmFnZXIuZHJhZ1N0YXJ0KCB0aGlzLCBldmVudCApO1xuXHRcdH1cblxuXHRcdHJldHVybiB0cnVlO1xuXHR9LFxuXG5cdF9yZWZyZXNoT2Zmc2V0czogZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdHRoaXMub2Zmc2V0ID0ge1xuXHRcdFx0dG9wOiB0aGlzLnBvc2l0aW9uQWJzLnRvcCAtIHRoaXMubWFyZ2lucy50b3AsXG5cdFx0XHRsZWZ0OiB0aGlzLnBvc2l0aW9uQWJzLmxlZnQgLSB0aGlzLm1hcmdpbnMubGVmdCxcblx0XHRcdHNjcm9sbDogZmFsc2UsXG5cdFx0XHRwYXJlbnQ6IHRoaXMuX2dldFBhcmVudE9mZnNldCgpLFxuXHRcdFx0cmVsYXRpdmU6IHRoaXMuX2dldFJlbGF0aXZlT2Zmc2V0KClcblx0XHR9O1xuXG5cdFx0dGhpcy5vZmZzZXQuY2xpY2sgPSB7XG5cdFx0XHRsZWZ0OiBldmVudC5wYWdlWCAtIHRoaXMub2Zmc2V0LmxlZnQsXG5cdFx0XHR0b3A6IGV2ZW50LnBhZ2VZIC0gdGhpcy5vZmZzZXQudG9wXG5cdFx0fTtcblx0fSxcblxuXHRfbW91c2VEcmFnOiBmdW5jdGlvbiggZXZlbnQsIG5vUHJvcGFnYXRpb24gKSB7XG5cblx0XHQvLyByZXNldCBhbnkgbmVjZXNzYXJ5IGNhY2hlZCBwcm9wZXJ0aWVzIChzZWUgIzUwMDkpXG5cdFx0aWYgKCB0aGlzLmhhc0ZpeGVkQW5jZXN0b3IgKSB7XG5cdFx0XHR0aGlzLm9mZnNldC5wYXJlbnQgPSB0aGlzLl9nZXRQYXJlbnRPZmZzZXQoKTtcblx0XHR9XG5cblx0XHQvL0NvbXB1dGUgdGhlIGhlbHBlcnMgcG9zaXRpb25cblx0XHR0aGlzLnBvc2l0aW9uID0gdGhpcy5fZ2VuZXJhdGVQb3NpdGlvbiggZXZlbnQsIHRydWUgKTtcblx0XHR0aGlzLnBvc2l0aW9uQWJzID0gdGhpcy5fY29udmVydFBvc2l0aW9uVG8oIFwiYWJzb2x1dGVcIiApO1xuXG5cdFx0Ly9DYWxsIHBsdWdpbnMgYW5kIGNhbGxiYWNrcyBhbmQgdXNlIHRoZSByZXN1bHRpbmcgcG9zaXRpb24gaWYgc29tZXRoaW5nIGlzIHJldHVybmVkXG5cdFx0aWYgKCAhbm9Qcm9wYWdhdGlvbiApIHtcblx0XHRcdHZhciB1aSA9IHRoaXMuX3VpSGFzaCgpO1xuXHRcdFx0aWYgKCB0aGlzLl90cmlnZ2VyKCBcImRyYWdcIiwgZXZlbnQsIHVpICkgPT09IGZhbHNlICkge1xuXHRcdFx0XHR0aGlzLl9tb3VzZVVwKCBuZXcgJC5FdmVudCggXCJtb3VzZXVwXCIsIGV2ZW50ICkgKTtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5wb3NpdGlvbiA9IHVpLnBvc2l0aW9uO1xuXHRcdH1cblxuXHRcdHRoaXMuaGVscGVyWyAwIF0uc3R5bGUubGVmdCA9IHRoaXMucG9zaXRpb24ubGVmdCArIFwicHhcIjtcblx0XHR0aGlzLmhlbHBlclsgMCBdLnN0eWxlLnRvcCA9IHRoaXMucG9zaXRpb24udG9wICsgXCJweFwiO1xuXG5cdFx0aWYgKCAkLnVpLmRkbWFuYWdlciApIHtcblx0XHRcdCQudWkuZGRtYW5hZ2VyLmRyYWcoIHRoaXMsIGV2ZW50ICk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9LFxuXG5cdF9tb3VzZVN0b3A6IGZ1bmN0aW9uKCBldmVudCApIHtcblxuXHRcdC8vSWYgd2UgYXJlIHVzaW5nIGRyb3BwYWJsZXMsIGluZm9ybSB0aGUgbWFuYWdlciBhYm91dCB0aGUgZHJvcFxuXHRcdHZhciB0aGF0ID0gdGhpcyxcblx0XHRcdGRyb3BwZWQgPSBmYWxzZTtcblx0XHRpZiAoICQudWkuZGRtYW5hZ2VyICYmICF0aGlzLm9wdGlvbnMuZHJvcEJlaGF2aW91ciApIHtcblx0XHRcdGRyb3BwZWQgPSAkLnVpLmRkbWFuYWdlci5kcm9wKCB0aGlzLCBldmVudCApO1xuXHRcdH1cblxuXHRcdC8vaWYgYSBkcm9wIGNvbWVzIGZyb20gb3V0c2lkZSAoYSBzb3J0YWJsZSlcblx0XHRpZiAoIHRoaXMuZHJvcHBlZCApIHtcblx0XHRcdGRyb3BwZWQgPSB0aGlzLmRyb3BwZWQ7XG5cdFx0XHR0aGlzLmRyb3BwZWQgPSBmYWxzZTtcblx0XHR9XG5cblx0XHRpZiAoICggdGhpcy5vcHRpb25zLnJldmVydCA9PT0gXCJpbnZhbGlkXCIgJiYgIWRyb3BwZWQgKSB8fFxuXHRcdFx0XHQoIHRoaXMub3B0aW9ucy5yZXZlcnQgPT09IFwidmFsaWRcIiAmJiBkcm9wcGVkICkgfHxcblx0XHRcdFx0dGhpcy5vcHRpb25zLnJldmVydCA9PT0gdHJ1ZSB8fCAoICQuaXNGdW5jdGlvbiggdGhpcy5vcHRpb25zLnJldmVydCApICYmXG5cdFx0XHRcdHRoaXMub3B0aW9ucy5yZXZlcnQuY2FsbCggdGhpcy5lbGVtZW50LCBkcm9wcGVkICkgKVxuXHRcdCkge1xuXHRcdFx0JCggdGhpcy5oZWxwZXIgKS5hbmltYXRlKFxuXHRcdFx0XHR0aGlzLm9yaWdpbmFsUG9zaXRpb24sXG5cdFx0XHRcdHBhcnNlSW50KCB0aGlzLm9wdGlvbnMucmV2ZXJ0RHVyYXRpb24sIDEwICksXG5cdFx0XHRcdGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdGlmICggdGhhdC5fdHJpZ2dlciggXCJzdG9wXCIsIGV2ZW50ICkgIT09IGZhbHNlICkge1xuXHRcdFx0XHRcdFx0dGhhdC5fY2xlYXIoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGlmICggdGhpcy5fdHJpZ2dlciggXCJzdG9wXCIsIGV2ZW50ICkgIT09IGZhbHNlICkge1xuXHRcdFx0XHR0aGlzLl9jbGVhcigpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBmYWxzZTtcblx0fSxcblxuXHRfbW91c2VVcDogZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdHRoaXMuX3VuYmxvY2tGcmFtZXMoKTtcblxuXHRcdC8vIElmIHRoZSBkZG1hbmFnZXIgaXMgdXNlZCBmb3IgZHJvcHBhYmxlcywgaW5mb3JtIHRoZSBtYW5hZ2VyIHRoYXQgZHJhZ2dpbmcgaGFzIHN0b3BwZWRcblx0XHQvLyAoc2VlICM1MDAzKVxuXHRcdGlmICggJC51aS5kZG1hbmFnZXIgKSB7XG5cdFx0XHQkLnVpLmRkbWFuYWdlci5kcmFnU3RvcCggdGhpcywgZXZlbnQgKTtcblx0XHR9XG5cblx0XHQvLyBPbmx5IG5lZWQgdG8gZm9jdXMgaWYgdGhlIGV2ZW50IG9jY3VycmVkIG9uIHRoZSBkcmFnZ2FibGUgaXRzZWxmLCBzZWUgIzEwNTI3XG5cdFx0aWYgKCB0aGlzLmhhbmRsZUVsZW1lbnQuaXMoIGV2ZW50LnRhcmdldCApICkge1xuXG5cdFx0XHQvLyBUaGUgaW50ZXJhY3Rpb24gaXMgb3Zlcjsgd2hldGhlciBvciBub3QgdGhlIGNsaWNrIHJlc3VsdGVkIGluIGEgZHJhZyxcblx0XHRcdC8vIGZvY3VzIHRoZSBlbGVtZW50XG5cdFx0XHR0aGlzLmVsZW1lbnQudHJpZ2dlciggXCJmb2N1c1wiICk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuICQudWkubW91c2UucHJvdG90eXBlLl9tb3VzZVVwLmNhbGwoIHRoaXMsIGV2ZW50ICk7XG5cdH0sXG5cblx0Y2FuY2VsOiBmdW5jdGlvbigpIHtcblxuXHRcdGlmICggdGhpcy5oZWxwZXIuaXMoIFwiLnVpLWRyYWdnYWJsZS1kcmFnZ2luZ1wiICkgKSB7XG5cdFx0XHR0aGlzLl9tb3VzZVVwKCBuZXcgJC5FdmVudCggXCJtb3VzZXVwXCIsIHsgdGFyZ2V0OiB0aGlzLmVsZW1lbnRbIDAgXSB9ICkgKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5fY2xlYXIoKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9LFxuXG5cdF9nZXRIYW5kbGU6IGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHRyZXR1cm4gdGhpcy5vcHRpb25zLmhhbmRsZSA/XG5cdFx0XHQhISQoIGV2ZW50LnRhcmdldCApLmNsb3Nlc3QoIHRoaXMuZWxlbWVudC5maW5kKCB0aGlzLm9wdGlvbnMuaGFuZGxlICkgKS5sZW5ndGggOlxuXHRcdFx0dHJ1ZTtcblx0fSxcblxuXHRfc2V0SGFuZGxlQ2xhc3NOYW1lOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmhhbmRsZUVsZW1lbnQgPSB0aGlzLm9wdGlvbnMuaGFuZGxlID9cblx0XHRcdHRoaXMuZWxlbWVudC5maW5kKCB0aGlzLm9wdGlvbnMuaGFuZGxlICkgOiB0aGlzLmVsZW1lbnQ7XG5cdFx0dGhpcy5fYWRkQ2xhc3MoIHRoaXMuaGFuZGxlRWxlbWVudCwgXCJ1aS1kcmFnZ2FibGUtaGFuZGxlXCIgKTtcblx0fSxcblxuXHRfcmVtb3ZlSGFuZGxlQ2xhc3NOYW1lOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLl9yZW1vdmVDbGFzcyggdGhpcy5oYW5kbGVFbGVtZW50LCBcInVpLWRyYWdnYWJsZS1oYW5kbGVcIiApO1xuXHR9LFxuXG5cdF9jcmVhdGVIZWxwZXI6IGZ1bmN0aW9uKCBldmVudCApIHtcblxuXHRcdHZhciBvID0gdGhpcy5vcHRpb25zLFxuXHRcdFx0aGVscGVySXNGdW5jdGlvbiA9ICQuaXNGdW5jdGlvbiggby5oZWxwZXIgKSxcblx0XHRcdGhlbHBlciA9IGhlbHBlcklzRnVuY3Rpb24gP1xuXHRcdFx0XHQkKCBvLmhlbHBlci5hcHBseSggdGhpcy5lbGVtZW50WyAwIF0sIFsgZXZlbnQgXSApICkgOlxuXHRcdFx0XHQoIG8uaGVscGVyID09PSBcImNsb25lXCIgP1xuXHRcdFx0XHRcdHRoaXMuZWxlbWVudC5jbG9uZSgpLnJlbW92ZUF0dHIoIFwiaWRcIiApIDpcblx0XHRcdFx0XHR0aGlzLmVsZW1lbnQgKTtcblxuXHRcdGlmICggIWhlbHBlci5wYXJlbnRzKCBcImJvZHlcIiApLmxlbmd0aCApIHtcblx0XHRcdGhlbHBlci5hcHBlbmRUbyggKCBvLmFwcGVuZFRvID09PSBcInBhcmVudFwiID9cblx0XHRcdFx0dGhpcy5lbGVtZW50WyAwIF0ucGFyZW50Tm9kZSA6XG5cdFx0XHRcdG8uYXBwZW5kVG8gKSApO1xuXHRcdH1cblxuXHRcdC8vIEh0dHA6Ly9idWdzLmpxdWVyeXVpLmNvbS90aWNrZXQvOTQ0NlxuXHRcdC8vIGEgaGVscGVyIGZ1bmN0aW9uIGNhbiByZXR1cm4gdGhlIG9yaWdpbmFsIGVsZW1lbnRcblx0XHQvLyB3aGljaCB3b3VsZG4ndCBoYXZlIGJlZW4gc2V0IHRvIHJlbGF0aXZlIGluIF9jcmVhdGVcblx0XHRpZiAoIGhlbHBlcklzRnVuY3Rpb24gJiYgaGVscGVyWyAwIF0gPT09IHRoaXMuZWxlbWVudFsgMCBdICkge1xuXHRcdFx0dGhpcy5fc2V0UG9zaXRpb25SZWxhdGl2ZSgpO1xuXHRcdH1cblxuXHRcdGlmICggaGVscGVyWyAwIF0gIT09IHRoaXMuZWxlbWVudFsgMCBdICYmXG5cdFx0XHRcdCEoIC8oZml4ZWR8YWJzb2x1dGUpLyApLnRlc3QoIGhlbHBlci5jc3MoIFwicG9zaXRpb25cIiApICkgKSB7XG5cdFx0XHRoZWxwZXIuY3NzKCBcInBvc2l0aW9uXCIsIFwiYWJzb2x1dGVcIiApO1xuXHRcdH1cblxuXHRcdHJldHVybiBoZWxwZXI7XG5cblx0fSxcblxuXHRfc2V0UG9zaXRpb25SZWxhdGl2ZTogZnVuY3Rpb24oKSB7XG5cdFx0aWYgKCAhKCAvXig/OnJ8YXxmKS8gKS50ZXN0KCB0aGlzLmVsZW1lbnQuY3NzKCBcInBvc2l0aW9uXCIgKSApICkge1xuXHRcdFx0dGhpcy5lbGVtZW50WyAwIF0uc3R5bGUucG9zaXRpb24gPSBcInJlbGF0aXZlXCI7XG5cdFx0fVxuXHR9LFxuXG5cdF9hZGp1c3RPZmZzZXRGcm9tSGVscGVyOiBmdW5jdGlvbiggb2JqICkge1xuXHRcdGlmICggdHlwZW9mIG9iaiA9PT0gXCJzdHJpbmdcIiApIHtcblx0XHRcdG9iaiA9IG9iai5zcGxpdCggXCIgXCIgKTtcblx0XHR9XG5cdFx0aWYgKCAkLmlzQXJyYXkoIG9iaiApICkge1xuXHRcdFx0b2JqID0geyBsZWZ0OiArb2JqWyAwIF0sIHRvcDogK29ialsgMSBdIHx8IDAgfTtcblx0XHR9XG5cdFx0aWYgKCBcImxlZnRcIiBpbiBvYmogKSB7XG5cdFx0XHR0aGlzLm9mZnNldC5jbGljay5sZWZ0ID0gb2JqLmxlZnQgKyB0aGlzLm1hcmdpbnMubGVmdDtcblx0XHR9XG5cdFx0aWYgKCBcInJpZ2h0XCIgaW4gb2JqICkge1xuXHRcdFx0dGhpcy5vZmZzZXQuY2xpY2subGVmdCA9IHRoaXMuaGVscGVyUHJvcG9ydGlvbnMud2lkdGggLSBvYmoucmlnaHQgKyB0aGlzLm1hcmdpbnMubGVmdDtcblx0XHR9XG5cdFx0aWYgKCBcInRvcFwiIGluIG9iaiApIHtcblx0XHRcdHRoaXMub2Zmc2V0LmNsaWNrLnRvcCA9IG9iai50b3AgKyB0aGlzLm1hcmdpbnMudG9wO1xuXHRcdH1cblx0XHRpZiAoIFwiYm90dG9tXCIgaW4gb2JqICkge1xuXHRcdFx0dGhpcy5vZmZzZXQuY2xpY2sudG9wID0gdGhpcy5oZWxwZXJQcm9wb3J0aW9ucy5oZWlnaHQgLSBvYmouYm90dG9tICsgdGhpcy5tYXJnaW5zLnRvcDtcblx0XHR9XG5cdH0sXG5cblx0X2lzUm9vdE5vZGU6IGZ1bmN0aW9uKCBlbGVtZW50ICkge1xuXHRcdHJldHVybiAoIC8oaHRtbHxib2R5KS9pICkudGVzdCggZWxlbWVudC50YWdOYW1lICkgfHwgZWxlbWVudCA9PT0gdGhpcy5kb2N1bWVudFsgMCBdO1xuXHR9LFxuXG5cdF9nZXRQYXJlbnRPZmZzZXQ6IGZ1bmN0aW9uKCkge1xuXG5cdFx0Ly9HZXQgdGhlIG9mZnNldFBhcmVudCBhbmQgY2FjaGUgaXRzIHBvc2l0aW9uXG5cdFx0dmFyIHBvID0gdGhpcy5vZmZzZXRQYXJlbnQub2Zmc2V0KCksXG5cdFx0XHRkb2N1bWVudCA9IHRoaXMuZG9jdW1lbnRbIDAgXTtcblxuXHRcdC8vIFRoaXMgaXMgYSBzcGVjaWFsIGNhc2Ugd2hlcmUgd2UgbmVlZCB0byBtb2RpZnkgYSBvZmZzZXQgY2FsY3VsYXRlZCBvbiBzdGFydCwgc2luY2UgdGhlXG5cdFx0Ly8gZm9sbG93aW5nIGhhcHBlbmVkOlxuXHRcdC8vIDEuIFRoZSBwb3NpdGlvbiBvZiB0aGUgaGVscGVyIGlzIGFic29sdXRlLCBzbyBpdCdzIHBvc2l0aW9uIGlzIGNhbGN1bGF0ZWQgYmFzZWQgb24gdGhlXG5cdFx0Ly8gbmV4dCBwb3NpdGlvbmVkIHBhcmVudFxuXHRcdC8vIDIuIFRoZSBhY3R1YWwgb2Zmc2V0IHBhcmVudCBpcyBhIGNoaWxkIG9mIHRoZSBzY3JvbGwgcGFyZW50LCBhbmQgdGhlIHNjcm9sbCBwYXJlbnQgaXNuJ3Rcblx0XHQvLyB0aGUgZG9jdW1lbnQsIHdoaWNoIG1lYW5zIHRoYXQgdGhlIHNjcm9sbCBpcyBpbmNsdWRlZCBpbiB0aGUgaW5pdGlhbCBjYWxjdWxhdGlvbiBvZiB0aGVcblx0XHQvLyBvZmZzZXQgb2YgdGhlIHBhcmVudCwgYW5kIG5ldmVyIHJlY2FsY3VsYXRlZCB1cG9uIGRyYWdcblx0XHRpZiAoIHRoaXMuY3NzUG9zaXRpb24gPT09IFwiYWJzb2x1dGVcIiAmJiB0aGlzLnNjcm9sbFBhcmVudFsgMCBdICE9PSBkb2N1bWVudCAmJlxuXHRcdFx0XHQkLmNvbnRhaW5zKCB0aGlzLnNjcm9sbFBhcmVudFsgMCBdLCB0aGlzLm9mZnNldFBhcmVudFsgMCBdICkgKSB7XG5cdFx0XHRwby5sZWZ0ICs9IHRoaXMuc2Nyb2xsUGFyZW50LnNjcm9sbExlZnQoKTtcblx0XHRcdHBvLnRvcCArPSB0aGlzLnNjcm9sbFBhcmVudC5zY3JvbGxUb3AoKTtcblx0XHR9XG5cblx0XHRpZiAoIHRoaXMuX2lzUm9vdE5vZGUoIHRoaXMub2Zmc2V0UGFyZW50WyAwIF0gKSApIHtcblx0XHRcdHBvID0geyB0b3A6IDAsIGxlZnQ6IDAgfTtcblx0XHR9XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0dG9wOiBwby50b3AgKyAoIHBhcnNlSW50KCB0aGlzLm9mZnNldFBhcmVudC5jc3MoIFwiYm9yZGVyVG9wV2lkdGhcIiApLCAxMCApIHx8IDAgKSxcblx0XHRcdGxlZnQ6IHBvLmxlZnQgKyAoIHBhcnNlSW50KCB0aGlzLm9mZnNldFBhcmVudC5jc3MoIFwiYm9yZGVyTGVmdFdpZHRoXCIgKSwgMTAgKSB8fCAwIClcblx0XHR9O1xuXG5cdH0sXG5cblx0X2dldFJlbGF0aXZlT2Zmc2V0OiBmdW5jdGlvbigpIHtcblx0XHRpZiAoIHRoaXMuY3NzUG9zaXRpb24gIT09IFwicmVsYXRpdmVcIiApIHtcblx0XHRcdHJldHVybiB7IHRvcDogMCwgbGVmdDogMCB9O1xuXHRcdH1cblxuXHRcdHZhciBwID0gdGhpcy5lbGVtZW50LnBvc2l0aW9uKCksXG5cdFx0XHRzY3JvbGxJc1Jvb3ROb2RlID0gdGhpcy5faXNSb290Tm9kZSggdGhpcy5zY3JvbGxQYXJlbnRbIDAgXSApO1xuXG5cdFx0cmV0dXJuIHtcblx0XHRcdHRvcDogcC50b3AgLSAoIHBhcnNlSW50KCB0aGlzLmhlbHBlci5jc3MoIFwidG9wXCIgKSwgMTAgKSB8fCAwICkgK1xuXHRcdFx0XHQoICFzY3JvbGxJc1Jvb3ROb2RlID8gdGhpcy5zY3JvbGxQYXJlbnQuc2Nyb2xsVG9wKCkgOiAwICksXG5cdFx0XHRsZWZ0OiBwLmxlZnQgLSAoIHBhcnNlSW50KCB0aGlzLmhlbHBlci5jc3MoIFwibGVmdFwiICksIDEwICkgfHwgMCApICtcblx0XHRcdFx0KCAhc2Nyb2xsSXNSb290Tm9kZSA/IHRoaXMuc2Nyb2xsUGFyZW50LnNjcm9sbExlZnQoKSA6IDAgKVxuXHRcdH07XG5cblx0fSxcblxuXHRfY2FjaGVNYXJnaW5zOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLm1hcmdpbnMgPSB7XG5cdFx0XHRsZWZ0OiAoIHBhcnNlSW50KCB0aGlzLmVsZW1lbnQuY3NzKCBcIm1hcmdpbkxlZnRcIiApLCAxMCApIHx8IDAgKSxcblx0XHRcdHRvcDogKCBwYXJzZUludCggdGhpcy5lbGVtZW50LmNzcyggXCJtYXJnaW5Ub3BcIiApLCAxMCApIHx8IDAgKSxcblx0XHRcdHJpZ2h0OiAoIHBhcnNlSW50KCB0aGlzLmVsZW1lbnQuY3NzKCBcIm1hcmdpblJpZ2h0XCIgKSwgMTAgKSB8fCAwICksXG5cdFx0XHRib3R0b206ICggcGFyc2VJbnQoIHRoaXMuZWxlbWVudC5jc3MoIFwibWFyZ2luQm90dG9tXCIgKSwgMTAgKSB8fCAwIClcblx0XHR9O1xuXHR9LFxuXG5cdF9jYWNoZUhlbHBlclByb3BvcnRpb25zOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmhlbHBlclByb3BvcnRpb25zID0ge1xuXHRcdFx0d2lkdGg6IHRoaXMuaGVscGVyLm91dGVyV2lkdGgoKSxcblx0XHRcdGhlaWdodDogdGhpcy5oZWxwZXIub3V0ZXJIZWlnaHQoKVxuXHRcdH07XG5cdH0sXG5cblx0X3NldENvbnRhaW5tZW50OiBmdW5jdGlvbigpIHtcblxuXHRcdHZhciBpc1VzZXJTY3JvbGxhYmxlLCBjLCBjZSxcblx0XHRcdG8gPSB0aGlzLm9wdGlvbnMsXG5cdFx0XHRkb2N1bWVudCA9IHRoaXMuZG9jdW1lbnRbIDAgXTtcblxuXHRcdHRoaXMucmVsYXRpdmVDb250YWluZXIgPSBudWxsO1xuXG5cdFx0aWYgKCAhby5jb250YWlubWVudCApIHtcblx0XHRcdHRoaXMuY29udGFpbm1lbnQgPSBudWxsO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGlmICggby5jb250YWlubWVudCA9PT0gXCJ3aW5kb3dcIiApIHtcblx0XHRcdHRoaXMuY29udGFpbm1lbnQgPSBbXG5cdFx0XHRcdCQoIHdpbmRvdyApLnNjcm9sbExlZnQoKSAtIHRoaXMub2Zmc2V0LnJlbGF0aXZlLmxlZnQgLSB0aGlzLm9mZnNldC5wYXJlbnQubGVmdCxcblx0XHRcdFx0JCggd2luZG93ICkuc2Nyb2xsVG9wKCkgLSB0aGlzLm9mZnNldC5yZWxhdGl2ZS50b3AgLSB0aGlzLm9mZnNldC5wYXJlbnQudG9wLFxuXHRcdFx0XHQkKCB3aW5kb3cgKS5zY3JvbGxMZWZ0KCkgKyAkKCB3aW5kb3cgKS53aWR0aCgpIC1cblx0XHRcdFx0XHR0aGlzLmhlbHBlclByb3BvcnRpb25zLndpZHRoIC0gdGhpcy5tYXJnaW5zLmxlZnQsXG5cdFx0XHRcdCQoIHdpbmRvdyApLnNjcm9sbFRvcCgpICtcblx0XHRcdFx0XHQoICQoIHdpbmRvdyApLmhlaWdodCgpIHx8IGRvY3VtZW50LmJvZHkucGFyZW50Tm9kZS5zY3JvbGxIZWlnaHQgKSAtXG5cdFx0XHRcdFx0dGhpcy5oZWxwZXJQcm9wb3J0aW9ucy5oZWlnaHQgLSB0aGlzLm1hcmdpbnMudG9wXG5cdFx0XHRdO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGlmICggby5jb250YWlubWVudCA9PT0gXCJkb2N1bWVudFwiICkge1xuXHRcdFx0dGhpcy5jb250YWlubWVudCA9IFtcblx0XHRcdFx0MCxcblx0XHRcdFx0MCxcblx0XHRcdFx0JCggZG9jdW1lbnQgKS53aWR0aCgpIC0gdGhpcy5oZWxwZXJQcm9wb3J0aW9ucy53aWR0aCAtIHRoaXMubWFyZ2lucy5sZWZ0LFxuXHRcdFx0XHQoICQoIGRvY3VtZW50ICkuaGVpZ2h0KCkgfHwgZG9jdW1lbnQuYm9keS5wYXJlbnROb2RlLnNjcm9sbEhlaWdodCApIC1cblx0XHRcdFx0XHR0aGlzLmhlbHBlclByb3BvcnRpb25zLmhlaWdodCAtIHRoaXMubWFyZ2lucy50b3Bcblx0XHRcdF07XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0aWYgKCBvLmNvbnRhaW5tZW50LmNvbnN0cnVjdG9yID09PSBBcnJheSApIHtcblx0XHRcdHRoaXMuY29udGFpbm1lbnQgPSBvLmNvbnRhaW5tZW50O1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGlmICggby5jb250YWlubWVudCA9PT0gXCJwYXJlbnRcIiApIHtcblx0XHRcdG8uY29udGFpbm1lbnQgPSB0aGlzLmhlbHBlclsgMCBdLnBhcmVudE5vZGU7XG5cdFx0fVxuXG5cdFx0YyA9ICQoIG8uY29udGFpbm1lbnQgKTtcblx0XHRjZSA9IGNbIDAgXTtcblxuXHRcdGlmICggIWNlICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGlzVXNlclNjcm9sbGFibGUgPSAvKHNjcm9sbHxhdXRvKS8udGVzdCggYy5jc3MoIFwib3ZlcmZsb3dcIiApICk7XG5cblx0XHR0aGlzLmNvbnRhaW5tZW50ID0gW1xuXHRcdFx0KCBwYXJzZUludCggYy5jc3MoIFwiYm9yZGVyTGVmdFdpZHRoXCIgKSwgMTAgKSB8fCAwICkgK1xuXHRcdFx0XHQoIHBhcnNlSW50KCBjLmNzcyggXCJwYWRkaW5nTGVmdFwiICksIDEwICkgfHwgMCApLFxuXHRcdFx0KCBwYXJzZUludCggYy5jc3MoIFwiYm9yZGVyVG9wV2lkdGhcIiApLCAxMCApIHx8IDAgKSArXG5cdFx0XHRcdCggcGFyc2VJbnQoIGMuY3NzKCBcInBhZGRpbmdUb3BcIiApLCAxMCApIHx8IDAgKSxcblx0XHRcdCggaXNVc2VyU2Nyb2xsYWJsZSA/IE1hdGgubWF4KCBjZS5zY3JvbGxXaWR0aCwgY2Uub2Zmc2V0V2lkdGggKSA6IGNlLm9mZnNldFdpZHRoICkgLVxuXHRcdFx0XHQoIHBhcnNlSW50KCBjLmNzcyggXCJib3JkZXJSaWdodFdpZHRoXCIgKSwgMTAgKSB8fCAwICkgLVxuXHRcdFx0XHQoIHBhcnNlSW50KCBjLmNzcyggXCJwYWRkaW5nUmlnaHRcIiApLCAxMCApIHx8IDAgKSAtXG5cdFx0XHRcdHRoaXMuaGVscGVyUHJvcG9ydGlvbnMud2lkdGggLVxuXHRcdFx0XHR0aGlzLm1hcmdpbnMubGVmdCAtXG5cdFx0XHRcdHRoaXMubWFyZ2lucy5yaWdodCxcblx0XHRcdCggaXNVc2VyU2Nyb2xsYWJsZSA/IE1hdGgubWF4KCBjZS5zY3JvbGxIZWlnaHQsIGNlLm9mZnNldEhlaWdodCApIDogY2Uub2Zmc2V0SGVpZ2h0ICkgLVxuXHRcdFx0XHQoIHBhcnNlSW50KCBjLmNzcyggXCJib3JkZXJCb3R0b21XaWR0aFwiICksIDEwICkgfHwgMCApIC1cblx0XHRcdFx0KCBwYXJzZUludCggYy5jc3MoIFwicGFkZGluZ0JvdHRvbVwiICksIDEwICkgfHwgMCApIC1cblx0XHRcdFx0dGhpcy5oZWxwZXJQcm9wb3J0aW9ucy5oZWlnaHQgLVxuXHRcdFx0XHR0aGlzLm1hcmdpbnMudG9wIC1cblx0XHRcdFx0dGhpcy5tYXJnaW5zLmJvdHRvbVxuXHRcdF07XG5cdFx0dGhpcy5yZWxhdGl2ZUNvbnRhaW5lciA9IGM7XG5cdH0sXG5cblx0X2NvbnZlcnRQb3NpdGlvblRvOiBmdW5jdGlvbiggZCwgcG9zICkge1xuXG5cdFx0aWYgKCAhcG9zICkge1xuXHRcdFx0cG9zID0gdGhpcy5wb3NpdGlvbjtcblx0XHR9XG5cblx0XHR2YXIgbW9kID0gZCA9PT0gXCJhYnNvbHV0ZVwiID8gMSA6IC0xLFxuXHRcdFx0c2Nyb2xsSXNSb290Tm9kZSA9IHRoaXMuX2lzUm9vdE5vZGUoIHRoaXMuc2Nyb2xsUGFyZW50WyAwIF0gKTtcblxuXHRcdHJldHVybiB7XG5cdFx0XHR0b3A6IChcblxuXHRcdFx0XHQvLyBUaGUgYWJzb2x1dGUgbW91c2UgcG9zaXRpb25cblx0XHRcdFx0cG9zLnRvcFx0K1xuXG5cdFx0XHRcdC8vIE9ubHkgZm9yIHJlbGF0aXZlIHBvc2l0aW9uZWQgbm9kZXM6IFJlbGF0aXZlIG9mZnNldCBmcm9tIGVsZW1lbnQgdG8gb2Zmc2V0IHBhcmVudFxuXHRcdFx0XHR0aGlzLm9mZnNldC5yZWxhdGl2ZS50b3AgKiBtb2QgK1xuXG5cdFx0XHRcdC8vIFRoZSBvZmZzZXRQYXJlbnQncyBvZmZzZXQgd2l0aG91dCBib3JkZXJzIChvZmZzZXQgKyBib3JkZXIpXG5cdFx0XHRcdHRoaXMub2Zmc2V0LnBhcmVudC50b3AgKiBtb2QgLVxuXHRcdFx0XHQoICggdGhpcy5jc3NQb3NpdGlvbiA9PT0gXCJmaXhlZFwiID9cblx0XHRcdFx0XHQtdGhpcy5vZmZzZXQuc2Nyb2xsLnRvcCA6XG5cdFx0XHRcdFx0KCBzY3JvbGxJc1Jvb3ROb2RlID8gMCA6IHRoaXMub2Zmc2V0LnNjcm9sbC50b3AgKSApICogbW9kIClcblx0XHRcdCksXG5cdFx0XHRsZWZ0OiAoXG5cblx0XHRcdFx0Ly8gVGhlIGFic29sdXRlIG1vdXNlIHBvc2l0aW9uXG5cdFx0XHRcdHBvcy5sZWZ0ICtcblxuXHRcdFx0XHQvLyBPbmx5IGZvciByZWxhdGl2ZSBwb3NpdGlvbmVkIG5vZGVzOiBSZWxhdGl2ZSBvZmZzZXQgZnJvbSBlbGVtZW50IHRvIG9mZnNldCBwYXJlbnRcblx0XHRcdFx0dGhpcy5vZmZzZXQucmVsYXRpdmUubGVmdCAqIG1vZCArXG5cblx0XHRcdFx0Ly8gVGhlIG9mZnNldFBhcmVudCdzIG9mZnNldCB3aXRob3V0IGJvcmRlcnMgKG9mZnNldCArIGJvcmRlcilcblx0XHRcdFx0dGhpcy5vZmZzZXQucGFyZW50LmxlZnQgKiBtb2RcdC1cblx0XHRcdFx0KCAoIHRoaXMuY3NzUG9zaXRpb24gPT09IFwiZml4ZWRcIiA/XG5cdFx0XHRcdFx0LXRoaXMub2Zmc2V0LnNjcm9sbC5sZWZ0IDpcblx0XHRcdFx0XHQoIHNjcm9sbElzUm9vdE5vZGUgPyAwIDogdGhpcy5vZmZzZXQuc2Nyb2xsLmxlZnQgKSApICogbW9kIClcblx0XHRcdClcblx0XHR9O1xuXG5cdH0sXG5cblx0X2dlbmVyYXRlUG9zaXRpb246IGZ1bmN0aW9uKCBldmVudCwgY29uc3RyYWluUG9zaXRpb24gKSB7XG5cblx0XHR2YXIgY29udGFpbm1lbnQsIGNvLCB0b3AsIGxlZnQsXG5cdFx0XHRvID0gdGhpcy5vcHRpb25zLFxuXHRcdFx0c2Nyb2xsSXNSb290Tm9kZSA9IHRoaXMuX2lzUm9vdE5vZGUoIHRoaXMuc2Nyb2xsUGFyZW50WyAwIF0gKSxcblx0XHRcdHBhZ2VYID0gZXZlbnQucGFnZVgsXG5cdFx0XHRwYWdlWSA9IGV2ZW50LnBhZ2VZO1xuXG5cdFx0Ly8gQ2FjaGUgdGhlIHNjcm9sbFxuXHRcdGlmICggIXNjcm9sbElzUm9vdE5vZGUgfHwgIXRoaXMub2Zmc2V0LnNjcm9sbCApIHtcblx0XHRcdHRoaXMub2Zmc2V0LnNjcm9sbCA9IHtcblx0XHRcdFx0dG9wOiB0aGlzLnNjcm9sbFBhcmVudC5zY3JvbGxUb3AoKSxcblx0XHRcdFx0bGVmdDogdGhpcy5zY3JvbGxQYXJlbnQuc2Nyb2xsTGVmdCgpXG5cdFx0XHR9O1xuXHRcdH1cblxuXHRcdC8qXG5cdFx0ICogLSBQb3NpdGlvbiBjb25zdHJhaW5pbmcgLVxuXHRcdCAqIENvbnN0cmFpbiB0aGUgcG9zaXRpb24gdG8gYSBtaXggb2YgZ3JpZCwgY29udGFpbm1lbnQuXG5cdFx0ICovXG5cblx0XHQvLyBJZiB3ZSBhcmUgbm90IGRyYWdnaW5nIHlldCwgd2Ugd29uJ3QgY2hlY2sgZm9yIG9wdGlvbnNcblx0XHRpZiAoIGNvbnN0cmFpblBvc2l0aW9uICkge1xuXHRcdFx0aWYgKCB0aGlzLmNvbnRhaW5tZW50ICkge1xuXHRcdFx0XHRpZiAoIHRoaXMucmVsYXRpdmVDb250YWluZXIgKSB7XG5cdFx0XHRcdFx0Y28gPSB0aGlzLnJlbGF0aXZlQ29udGFpbmVyLm9mZnNldCgpO1xuXHRcdFx0XHRcdGNvbnRhaW5tZW50ID0gW1xuXHRcdFx0XHRcdFx0dGhpcy5jb250YWlubWVudFsgMCBdICsgY28ubGVmdCxcblx0XHRcdFx0XHRcdHRoaXMuY29udGFpbm1lbnRbIDEgXSArIGNvLnRvcCxcblx0XHRcdFx0XHRcdHRoaXMuY29udGFpbm1lbnRbIDIgXSArIGNvLmxlZnQsXG5cdFx0XHRcdFx0XHR0aGlzLmNvbnRhaW5tZW50WyAzIF0gKyBjby50b3Bcblx0XHRcdFx0XHRdO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGNvbnRhaW5tZW50ID0gdGhpcy5jb250YWlubWVudDtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmICggZXZlbnQucGFnZVggLSB0aGlzLm9mZnNldC5jbGljay5sZWZ0IDwgY29udGFpbm1lbnRbIDAgXSApIHtcblx0XHRcdFx0XHRwYWdlWCA9IGNvbnRhaW5tZW50WyAwIF0gKyB0aGlzLm9mZnNldC5jbGljay5sZWZ0O1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmICggZXZlbnQucGFnZVkgLSB0aGlzLm9mZnNldC5jbGljay50b3AgPCBjb250YWlubWVudFsgMSBdICkge1xuXHRcdFx0XHRcdHBhZ2VZID0gY29udGFpbm1lbnRbIDEgXSArIHRoaXMub2Zmc2V0LmNsaWNrLnRvcDtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoIGV2ZW50LnBhZ2VYIC0gdGhpcy5vZmZzZXQuY2xpY2subGVmdCA+IGNvbnRhaW5tZW50WyAyIF0gKSB7XG5cdFx0XHRcdFx0cGFnZVggPSBjb250YWlubWVudFsgMiBdICsgdGhpcy5vZmZzZXQuY2xpY2subGVmdDtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoIGV2ZW50LnBhZ2VZIC0gdGhpcy5vZmZzZXQuY2xpY2sudG9wID4gY29udGFpbm1lbnRbIDMgXSApIHtcblx0XHRcdFx0XHRwYWdlWSA9IGNvbnRhaW5tZW50WyAzIF0gKyB0aGlzLm9mZnNldC5jbGljay50b3A7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0aWYgKCBvLmdyaWQgKSB7XG5cblx0XHRcdFx0Ly9DaGVjayBmb3IgZ3JpZCBlbGVtZW50cyBzZXQgdG8gMCB0byBwcmV2ZW50IGRpdmlkZSBieSAwIGVycm9yIGNhdXNpbmcgaW52YWxpZFxuXHRcdFx0XHQvLyBhcmd1bWVudCBlcnJvcnMgaW4gSUUgKHNlZSB0aWNrZXQgIzY5NTApXG5cdFx0XHRcdHRvcCA9IG8uZ3JpZFsgMSBdID8gdGhpcy5vcmlnaW5hbFBhZ2VZICsgTWF0aC5yb3VuZCggKCBwYWdlWSAtXG5cdFx0XHRcdFx0dGhpcy5vcmlnaW5hbFBhZ2VZICkgLyBvLmdyaWRbIDEgXSApICogby5ncmlkWyAxIF0gOiB0aGlzLm9yaWdpbmFsUGFnZVk7XG5cdFx0XHRcdHBhZ2VZID0gY29udGFpbm1lbnQgPyAoICggdG9wIC0gdGhpcy5vZmZzZXQuY2xpY2sudG9wID49IGNvbnRhaW5tZW50WyAxIF0gfHxcblx0XHRcdFx0XHR0b3AgLSB0aGlzLm9mZnNldC5jbGljay50b3AgPiBjb250YWlubWVudFsgMyBdICkgP1xuXHRcdFx0XHRcdFx0dG9wIDpcblx0XHRcdFx0XHRcdCggKCB0b3AgLSB0aGlzLm9mZnNldC5jbGljay50b3AgPj0gY29udGFpbm1lbnRbIDEgXSApID9cblx0XHRcdFx0XHRcdFx0dG9wIC0gby5ncmlkWyAxIF0gOiB0b3AgKyBvLmdyaWRbIDEgXSApICkgOiB0b3A7XG5cblx0XHRcdFx0bGVmdCA9IG8uZ3JpZFsgMCBdID8gdGhpcy5vcmlnaW5hbFBhZ2VYICtcblx0XHRcdFx0XHRNYXRoLnJvdW5kKCAoIHBhZ2VYIC0gdGhpcy5vcmlnaW5hbFBhZ2VYICkgLyBvLmdyaWRbIDAgXSApICogby5ncmlkWyAwIF0gOlxuXHRcdFx0XHRcdHRoaXMub3JpZ2luYWxQYWdlWDtcblx0XHRcdFx0cGFnZVggPSBjb250YWlubWVudCA/ICggKCBsZWZ0IC0gdGhpcy5vZmZzZXQuY2xpY2subGVmdCA+PSBjb250YWlubWVudFsgMCBdIHx8XG5cdFx0XHRcdFx0bGVmdCAtIHRoaXMub2Zmc2V0LmNsaWNrLmxlZnQgPiBjb250YWlubWVudFsgMiBdICkgP1xuXHRcdFx0XHRcdFx0bGVmdCA6XG5cdFx0XHRcdFx0XHQoICggbGVmdCAtIHRoaXMub2Zmc2V0LmNsaWNrLmxlZnQgPj0gY29udGFpbm1lbnRbIDAgXSApID9cblx0XHRcdFx0XHRcdFx0bGVmdCAtIG8uZ3JpZFsgMCBdIDogbGVmdCArIG8uZ3JpZFsgMCBdICkgKSA6IGxlZnQ7XG5cdFx0XHR9XG5cblx0XHRcdGlmICggby5heGlzID09PSBcInlcIiApIHtcblx0XHRcdFx0cGFnZVggPSB0aGlzLm9yaWdpbmFsUGFnZVg7XG5cdFx0XHR9XG5cblx0XHRcdGlmICggby5heGlzID09PSBcInhcIiApIHtcblx0XHRcdFx0cGFnZVkgPSB0aGlzLm9yaWdpbmFsUGFnZVk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHtcblx0XHRcdHRvcDogKFxuXG5cdFx0XHRcdC8vIFRoZSBhYnNvbHV0ZSBtb3VzZSBwb3NpdGlvblxuXHRcdFx0XHRwYWdlWSAtXG5cblx0XHRcdFx0Ly8gQ2xpY2sgb2Zmc2V0IChyZWxhdGl2ZSB0byB0aGUgZWxlbWVudClcblx0XHRcdFx0dGhpcy5vZmZzZXQuY2xpY2sudG9wIC1cblxuXHRcdFx0XHQvLyBPbmx5IGZvciByZWxhdGl2ZSBwb3NpdGlvbmVkIG5vZGVzOiBSZWxhdGl2ZSBvZmZzZXQgZnJvbSBlbGVtZW50IHRvIG9mZnNldCBwYXJlbnRcblx0XHRcdFx0dGhpcy5vZmZzZXQucmVsYXRpdmUudG9wIC1cblxuXHRcdFx0XHQvLyBUaGUgb2Zmc2V0UGFyZW50J3Mgb2Zmc2V0IHdpdGhvdXQgYm9yZGVycyAob2Zmc2V0ICsgYm9yZGVyKVxuXHRcdFx0XHR0aGlzLm9mZnNldC5wYXJlbnQudG9wICtcblx0XHRcdFx0KCB0aGlzLmNzc1Bvc2l0aW9uID09PSBcImZpeGVkXCIgP1xuXHRcdFx0XHRcdC10aGlzLm9mZnNldC5zY3JvbGwudG9wIDpcblx0XHRcdFx0XHQoIHNjcm9sbElzUm9vdE5vZGUgPyAwIDogdGhpcy5vZmZzZXQuc2Nyb2xsLnRvcCApIClcblx0XHRcdCksXG5cdFx0XHRsZWZ0OiAoXG5cblx0XHRcdFx0Ly8gVGhlIGFic29sdXRlIG1vdXNlIHBvc2l0aW9uXG5cdFx0XHRcdHBhZ2VYIC1cblxuXHRcdFx0XHQvLyBDbGljayBvZmZzZXQgKHJlbGF0aXZlIHRvIHRoZSBlbGVtZW50KVxuXHRcdFx0XHR0aGlzLm9mZnNldC5jbGljay5sZWZ0IC1cblxuXHRcdFx0XHQvLyBPbmx5IGZvciByZWxhdGl2ZSBwb3NpdGlvbmVkIG5vZGVzOiBSZWxhdGl2ZSBvZmZzZXQgZnJvbSBlbGVtZW50IHRvIG9mZnNldCBwYXJlbnRcblx0XHRcdFx0dGhpcy5vZmZzZXQucmVsYXRpdmUubGVmdCAtXG5cblx0XHRcdFx0Ly8gVGhlIG9mZnNldFBhcmVudCdzIG9mZnNldCB3aXRob3V0IGJvcmRlcnMgKG9mZnNldCArIGJvcmRlcilcblx0XHRcdFx0dGhpcy5vZmZzZXQucGFyZW50LmxlZnQgK1xuXHRcdFx0XHQoIHRoaXMuY3NzUG9zaXRpb24gPT09IFwiZml4ZWRcIiA/XG5cdFx0XHRcdFx0LXRoaXMub2Zmc2V0LnNjcm9sbC5sZWZ0IDpcblx0XHRcdFx0XHQoIHNjcm9sbElzUm9vdE5vZGUgPyAwIDogdGhpcy5vZmZzZXQuc2Nyb2xsLmxlZnQgKSApXG5cdFx0XHQpXG5cdFx0fTtcblxuXHR9LFxuXG5cdF9jbGVhcjogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5fcmVtb3ZlQ2xhc3MoIHRoaXMuaGVscGVyLCBcInVpLWRyYWdnYWJsZS1kcmFnZ2luZ1wiICk7XG5cdFx0aWYgKCB0aGlzLmhlbHBlclsgMCBdICE9PSB0aGlzLmVsZW1lbnRbIDAgXSAmJiAhdGhpcy5jYW5jZWxIZWxwZXJSZW1vdmFsICkge1xuXHRcdFx0dGhpcy5oZWxwZXIucmVtb3ZlKCk7XG5cdFx0fVxuXHRcdHRoaXMuaGVscGVyID0gbnVsbDtcblx0XHR0aGlzLmNhbmNlbEhlbHBlclJlbW92YWwgPSBmYWxzZTtcblx0XHRpZiAoIHRoaXMuZGVzdHJveU9uQ2xlYXIgKSB7XG5cdFx0XHR0aGlzLmRlc3Ryb3koKTtcblx0XHR9XG5cdH0sXG5cblx0Ly8gRnJvbSBub3cgb24gYnVsayBzdHVmZiAtIG1haW5seSBoZWxwZXJzXG5cblx0X3RyaWdnZXI6IGZ1bmN0aW9uKCB0eXBlLCBldmVudCwgdWkgKSB7XG5cdFx0dWkgPSB1aSB8fCB0aGlzLl91aUhhc2goKTtcblx0XHQkLnVpLnBsdWdpbi5jYWxsKCB0aGlzLCB0eXBlLCBbIGV2ZW50LCB1aSwgdGhpcyBdLCB0cnVlICk7XG5cblx0XHQvLyBBYnNvbHV0ZSBwb3NpdGlvbiBhbmQgb2Zmc2V0IChzZWUgIzY4ODQgKSBoYXZlIHRvIGJlIHJlY2FsY3VsYXRlZCBhZnRlciBwbHVnaW5zXG5cdFx0aWYgKCAvXihkcmFnfHN0YXJ0fHN0b3ApLy50ZXN0KCB0eXBlICkgKSB7XG5cdFx0XHR0aGlzLnBvc2l0aW9uQWJzID0gdGhpcy5fY29udmVydFBvc2l0aW9uVG8oIFwiYWJzb2x1dGVcIiApO1xuXHRcdFx0dWkub2Zmc2V0ID0gdGhpcy5wb3NpdGlvbkFicztcblx0XHR9XG5cdFx0cmV0dXJuICQuV2lkZ2V0LnByb3RvdHlwZS5fdHJpZ2dlci5jYWxsKCB0aGlzLCB0eXBlLCBldmVudCwgdWkgKTtcblx0fSxcblxuXHRwbHVnaW5zOiB7fSxcblxuXHRfdWlIYXNoOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0aGVscGVyOiB0aGlzLmhlbHBlcixcblx0XHRcdHBvc2l0aW9uOiB0aGlzLnBvc2l0aW9uLFxuXHRcdFx0b3JpZ2luYWxQb3NpdGlvbjogdGhpcy5vcmlnaW5hbFBvc2l0aW9uLFxuXHRcdFx0b2Zmc2V0OiB0aGlzLnBvc2l0aW9uQWJzXG5cdFx0fTtcblx0fVxuXG59ICk7XG5cbiQudWkucGx1Z2luLmFkZCggXCJkcmFnZ2FibGVcIiwgXCJjb25uZWN0VG9Tb3J0YWJsZVwiLCB7XG5cdHN0YXJ0OiBmdW5jdGlvbiggZXZlbnQsIHVpLCBkcmFnZ2FibGUgKSB7XG5cdFx0dmFyIHVpU29ydGFibGUgPSAkLmV4dGVuZCgge30sIHVpLCB7XG5cdFx0XHRpdGVtOiBkcmFnZ2FibGUuZWxlbWVudFxuXHRcdH0gKTtcblxuXHRcdGRyYWdnYWJsZS5zb3J0YWJsZXMgPSBbXTtcblx0XHQkKCBkcmFnZ2FibGUub3B0aW9ucy5jb25uZWN0VG9Tb3J0YWJsZSApLmVhY2goIGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIHNvcnRhYmxlID0gJCggdGhpcyApLnNvcnRhYmxlKCBcImluc3RhbmNlXCIgKTtcblxuXHRcdFx0aWYgKCBzb3J0YWJsZSAmJiAhc29ydGFibGUub3B0aW9ucy5kaXNhYmxlZCApIHtcblx0XHRcdFx0ZHJhZ2dhYmxlLnNvcnRhYmxlcy5wdXNoKCBzb3J0YWJsZSApO1xuXG5cdFx0XHRcdC8vIFJlZnJlc2hQb3NpdGlvbnMgaXMgY2FsbGVkIGF0IGRyYWcgc3RhcnQgdG8gcmVmcmVzaCB0aGUgY29udGFpbmVyQ2FjaGVcblx0XHRcdFx0Ly8gd2hpY2ggaXMgdXNlZCBpbiBkcmFnLiBUaGlzIGVuc3VyZXMgaXQncyBpbml0aWFsaXplZCBhbmQgc3luY2hyb25pemVkXG5cdFx0XHRcdC8vIHdpdGggYW55IGNoYW5nZXMgdGhhdCBtaWdodCBoYXZlIGhhcHBlbmVkIG9uIHRoZSBwYWdlIHNpbmNlIGluaXRpYWxpemF0aW9uLlxuXHRcdFx0XHRzb3J0YWJsZS5yZWZyZXNoUG9zaXRpb25zKCk7XG5cdFx0XHRcdHNvcnRhYmxlLl90cmlnZ2VyKCBcImFjdGl2YXRlXCIsIGV2ZW50LCB1aVNvcnRhYmxlICk7XG5cdFx0XHR9XG5cdFx0fSApO1xuXHR9LFxuXHRzdG9wOiBmdW5jdGlvbiggZXZlbnQsIHVpLCBkcmFnZ2FibGUgKSB7XG5cdFx0dmFyIHVpU29ydGFibGUgPSAkLmV4dGVuZCgge30sIHVpLCB7XG5cdFx0XHRpdGVtOiBkcmFnZ2FibGUuZWxlbWVudFxuXHRcdH0gKTtcblxuXHRcdGRyYWdnYWJsZS5jYW5jZWxIZWxwZXJSZW1vdmFsID0gZmFsc2U7XG5cblx0XHQkLmVhY2goIGRyYWdnYWJsZS5zb3J0YWJsZXMsIGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIHNvcnRhYmxlID0gdGhpcztcblxuXHRcdFx0aWYgKCBzb3J0YWJsZS5pc092ZXIgKSB7XG5cdFx0XHRcdHNvcnRhYmxlLmlzT3ZlciA9IDA7XG5cblx0XHRcdFx0Ly8gQWxsb3cgdGhpcyBzb3J0YWJsZSB0byBoYW5kbGUgcmVtb3ZpbmcgdGhlIGhlbHBlclxuXHRcdFx0XHRkcmFnZ2FibGUuY2FuY2VsSGVscGVyUmVtb3ZhbCA9IHRydWU7XG5cdFx0XHRcdHNvcnRhYmxlLmNhbmNlbEhlbHBlclJlbW92YWwgPSBmYWxzZTtcblxuXHRcdFx0XHQvLyBVc2UgX3N0b3JlZENTUyBUbyByZXN0b3JlIHByb3BlcnRpZXMgaW4gdGhlIHNvcnRhYmxlLFxuXHRcdFx0XHQvLyBhcyB0aGlzIGFsc28gaGFuZGxlcyByZXZlcnQgKCM5Njc1KSBzaW5jZSB0aGUgZHJhZ2dhYmxlXG5cdFx0XHRcdC8vIG1heSBoYXZlIG1vZGlmaWVkIHRoZW0gaW4gdW5leHBlY3RlZCB3YXlzICgjODgwOSlcblx0XHRcdFx0c29ydGFibGUuX3N0b3JlZENTUyA9IHtcblx0XHRcdFx0XHRwb3NpdGlvbjogc29ydGFibGUucGxhY2Vob2xkZXIuY3NzKCBcInBvc2l0aW9uXCIgKSxcblx0XHRcdFx0XHR0b3A6IHNvcnRhYmxlLnBsYWNlaG9sZGVyLmNzcyggXCJ0b3BcIiApLFxuXHRcdFx0XHRcdGxlZnQ6IHNvcnRhYmxlLnBsYWNlaG9sZGVyLmNzcyggXCJsZWZ0XCIgKVxuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdHNvcnRhYmxlLl9tb3VzZVN0b3AoIGV2ZW50ICk7XG5cblx0XHRcdFx0Ly8gT25jZSBkcmFnIGhhcyBlbmRlZCwgdGhlIHNvcnRhYmxlIHNob3VsZCByZXR1cm4gdG8gdXNpbmdcblx0XHRcdFx0Ly8gaXRzIG9yaWdpbmFsIGhlbHBlciwgbm90IHRoZSBzaGFyZWQgaGVscGVyIGZyb20gZHJhZ2dhYmxlXG5cdFx0XHRcdHNvcnRhYmxlLm9wdGlvbnMuaGVscGVyID0gc29ydGFibGUub3B0aW9ucy5faGVscGVyO1xuXHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHQvLyBQcmV2ZW50IHRoaXMgU29ydGFibGUgZnJvbSByZW1vdmluZyB0aGUgaGVscGVyLlxuXHRcdFx0XHQvLyBIb3dldmVyLCBkb24ndCBzZXQgdGhlIGRyYWdnYWJsZSB0byByZW1vdmUgdGhlIGhlbHBlclxuXHRcdFx0XHQvLyBlaXRoZXIgYXMgYW5vdGhlciBjb25uZWN0ZWQgU29ydGFibGUgbWF5IHlldCBoYW5kbGUgdGhlIHJlbW92YWwuXG5cdFx0XHRcdHNvcnRhYmxlLmNhbmNlbEhlbHBlclJlbW92YWwgPSB0cnVlO1xuXG5cdFx0XHRcdHNvcnRhYmxlLl90cmlnZ2VyKCBcImRlYWN0aXZhdGVcIiwgZXZlbnQsIHVpU29ydGFibGUgKTtcblx0XHRcdH1cblx0XHR9ICk7XG5cdH0sXG5cdGRyYWc6IGZ1bmN0aW9uKCBldmVudCwgdWksIGRyYWdnYWJsZSApIHtcblx0XHQkLmVhY2goIGRyYWdnYWJsZS5zb3J0YWJsZXMsIGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIGlubmVybW9zdEludGVyc2VjdGluZyA9IGZhbHNlLFxuXHRcdFx0XHRzb3J0YWJsZSA9IHRoaXM7XG5cblx0XHRcdC8vIENvcHkgb3ZlciB2YXJpYWJsZXMgdGhhdCBzb3J0YWJsZSdzIF9pbnRlcnNlY3RzV2l0aCB1c2VzXG5cdFx0XHRzb3J0YWJsZS5wb3NpdGlvbkFicyA9IGRyYWdnYWJsZS5wb3NpdGlvbkFicztcblx0XHRcdHNvcnRhYmxlLmhlbHBlclByb3BvcnRpb25zID0gZHJhZ2dhYmxlLmhlbHBlclByb3BvcnRpb25zO1xuXHRcdFx0c29ydGFibGUub2Zmc2V0LmNsaWNrID0gZHJhZ2dhYmxlLm9mZnNldC5jbGljaztcblxuXHRcdFx0aWYgKCBzb3J0YWJsZS5faW50ZXJzZWN0c1dpdGgoIHNvcnRhYmxlLmNvbnRhaW5lckNhY2hlICkgKSB7XG5cdFx0XHRcdGlubmVybW9zdEludGVyc2VjdGluZyA9IHRydWU7XG5cblx0XHRcdFx0JC5lYWNoKCBkcmFnZ2FibGUuc29ydGFibGVzLCBmdW5jdGlvbigpIHtcblxuXHRcdFx0XHRcdC8vIENvcHkgb3ZlciB2YXJpYWJsZXMgdGhhdCBzb3J0YWJsZSdzIF9pbnRlcnNlY3RzV2l0aCB1c2VzXG5cdFx0XHRcdFx0dGhpcy5wb3NpdGlvbkFicyA9IGRyYWdnYWJsZS5wb3NpdGlvbkFicztcblx0XHRcdFx0XHR0aGlzLmhlbHBlclByb3BvcnRpb25zID0gZHJhZ2dhYmxlLmhlbHBlclByb3BvcnRpb25zO1xuXHRcdFx0XHRcdHRoaXMub2Zmc2V0LmNsaWNrID0gZHJhZ2dhYmxlLm9mZnNldC5jbGljaztcblxuXHRcdFx0XHRcdGlmICggdGhpcyAhPT0gc29ydGFibGUgJiZcblx0XHRcdFx0XHRcdFx0dGhpcy5faW50ZXJzZWN0c1dpdGgoIHRoaXMuY29udGFpbmVyQ2FjaGUgKSAmJlxuXHRcdFx0XHRcdFx0XHQkLmNvbnRhaW5zKCBzb3J0YWJsZS5lbGVtZW50WyAwIF0sIHRoaXMuZWxlbWVudFsgMCBdICkgKSB7XG5cdFx0XHRcdFx0XHRpbm5lcm1vc3RJbnRlcnNlY3RpbmcgPSBmYWxzZTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRyZXR1cm4gaW5uZXJtb3N0SW50ZXJzZWN0aW5nO1xuXHRcdFx0XHR9ICk7XG5cdFx0XHR9XG5cblx0XHRcdGlmICggaW5uZXJtb3N0SW50ZXJzZWN0aW5nICkge1xuXG5cdFx0XHRcdC8vIElmIGl0IGludGVyc2VjdHMsIHdlIHVzZSBhIGxpdHRsZSBpc092ZXIgdmFyaWFibGUgYW5kIHNldCBpdCBvbmNlLFxuXHRcdFx0XHQvLyBzbyB0aGF0IHRoZSBtb3ZlLWluIHN0dWZmIGdldHMgZmlyZWQgb25seSBvbmNlLlxuXHRcdFx0XHRpZiAoICFzb3J0YWJsZS5pc092ZXIgKSB7XG5cdFx0XHRcdFx0c29ydGFibGUuaXNPdmVyID0gMTtcblxuXHRcdFx0XHRcdC8vIFN0b3JlIGRyYWdnYWJsZSdzIHBhcmVudCBpbiBjYXNlIHdlIG5lZWQgdG8gcmVhcHBlbmQgdG8gaXQgbGF0ZXIuXG5cdFx0XHRcdFx0ZHJhZ2dhYmxlLl9wYXJlbnQgPSB1aS5oZWxwZXIucGFyZW50KCk7XG5cblx0XHRcdFx0XHRzb3J0YWJsZS5jdXJyZW50SXRlbSA9IHVpLmhlbHBlclxuXHRcdFx0XHRcdFx0LmFwcGVuZFRvKCBzb3J0YWJsZS5lbGVtZW50IClcblx0XHRcdFx0XHRcdC5kYXRhKCBcInVpLXNvcnRhYmxlLWl0ZW1cIiwgdHJ1ZSApO1xuXG5cdFx0XHRcdFx0Ly8gU3RvcmUgaGVscGVyIG9wdGlvbiB0byBsYXRlciByZXN0b3JlIGl0XG5cdFx0XHRcdFx0c29ydGFibGUub3B0aW9ucy5faGVscGVyID0gc29ydGFibGUub3B0aW9ucy5oZWxwZXI7XG5cblx0XHRcdFx0XHRzb3J0YWJsZS5vcHRpb25zLmhlbHBlciA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIHVpLmhlbHBlclsgMCBdO1xuXHRcdFx0XHRcdH07XG5cblx0XHRcdFx0XHQvLyBGaXJlIHRoZSBzdGFydCBldmVudHMgb2YgdGhlIHNvcnRhYmxlIHdpdGggb3VyIHBhc3NlZCBicm93c2VyIGV2ZW50LFxuXHRcdFx0XHRcdC8vIGFuZCBvdXIgb3duIGhlbHBlciAoc28gaXQgZG9lc24ndCBjcmVhdGUgYSBuZXcgb25lKVxuXHRcdFx0XHRcdGV2ZW50LnRhcmdldCA9IHNvcnRhYmxlLmN1cnJlbnRJdGVtWyAwIF07XG5cdFx0XHRcdFx0c29ydGFibGUuX21vdXNlQ2FwdHVyZSggZXZlbnQsIHRydWUgKTtcblx0XHRcdFx0XHRzb3J0YWJsZS5fbW91c2VTdGFydCggZXZlbnQsIHRydWUsIHRydWUgKTtcblxuXHRcdFx0XHRcdC8vIEJlY2F1c2UgdGhlIGJyb3dzZXIgZXZlbnQgaXMgd2F5IG9mZiB0aGUgbmV3IGFwcGVuZGVkIHBvcnRsZXQsXG5cdFx0XHRcdFx0Ly8gbW9kaWZ5IG5lY2Vzc2FyeSB2YXJpYWJsZXMgdG8gcmVmbGVjdCB0aGUgY2hhbmdlc1xuXHRcdFx0XHRcdHNvcnRhYmxlLm9mZnNldC5jbGljay50b3AgPSBkcmFnZ2FibGUub2Zmc2V0LmNsaWNrLnRvcDtcblx0XHRcdFx0XHRzb3J0YWJsZS5vZmZzZXQuY2xpY2subGVmdCA9IGRyYWdnYWJsZS5vZmZzZXQuY2xpY2subGVmdDtcblx0XHRcdFx0XHRzb3J0YWJsZS5vZmZzZXQucGFyZW50LmxlZnQgLT0gZHJhZ2dhYmxlLm9mZnNldC5wYXJlbnQubGVmdCAtXG5cdFx0XHRcdFx0XHRzb3J0YWJsZS5vZmZzZXQucGFyZW50LmxlZnQ7XG5cdFx0XHRcdFx0c29ydGFibGUub2Zmc2V0LnBhcmVudC50b3AgLT0gZHJhZ2dhYmxlLm9mZnNldC5wYXJlbnQudG9wIC1cblx0XHRcdFx0XHRcdHNvcnRhYmxlLm9mZnNldC5wYXJlbnQudG9wO1xuXG5cdFx0XHRcdFx0ZHJhZ2dhYmxlLl90cmlnZ2VyKCBcInRvU29ydGFibGVcIiwgZXZlbnQgKTtcblxuXHRcdFx0XHRcdC8vIEluZm9ybSBkcmFnZ2FibGUgdGhhdCB0aGUgaGVscGVyIGlzIGluIGEgdmFsaWQgZHJvcCB6b25lLFxuXHRcdFx0XHRcdC8vIHVzZWQgc29sZWx5IGluIHRoZSByZXZlcnQgb3B0aW9uIHRvIGhhbmRsZSBcInZhbGlkL2ludmFsaWRcIi5cblx0XHRcdFx0XHRkcmFnZ2FibGUuZHJvcHBlZCA9IHNvcnRhYmxlLmVsZW1lbnQ7XG5cblx0XHRcdFx0XHQvLyBOZWVkIHRvIHJlZnJlc2hQb3NpdGlvbnMgb2YgYWxsIHNvcnRhYmxlcyBpbiB0aGUgY2FzZSB0aGF0XG5cdFx0XHRcdFx0Ly8gYWRkaW5nIHRvIG9uZSBzb3J0YWJsZSBjaGFuZ2VzIHRoZSBsb2NhdGlvbiBvZiB0aGUgb3RoZXIgc29ydGFibGVzICgjOTY3NSlcblx0XHRcdFx0XHQkLmVhY2goIGRyYWdnYWJsZS5zb3J0YWJsZXMsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0dGhpcy5yZWZyZXNoUG9zaXRpb25zKCk7XG5cdFx0XHRcdFx0fSApO1xuXG5cdFx0XHRcdFx0Ly8gSGFjayBzbyByZWNlaXZlL3VwZGF0ZSBjYWxsYmFja3Mgd29yayAobW9zdGx5KVxuXHRcdFx0XHRcdGRyYWdnYWJsZS5jdXJyZW50SXRlbSA9IGRyYWdnYWJsZS5lbGVtZW50O1xuXHRcdFx0XHRcdHNvcnRhYmxlLmZyb21PdXRzaWRlID0gZHJhZ2dhYmxlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKCBzb3J0YWJsZS5jdXJyZW50SXRlbSApIHtcblx0XHRcdFx0XHRzb3J0YWJsZS5fbW91c2VEcmFnKCBldmVudCApO1xuXG5cdFx0XHRcdFx0Ly8gQ29weSB0aGUgc29ydGFibGUncyBwb3NpdGlvbiBiZWNhdXNlIHRoZSBkcmFnZ2FibGUncyBjYW4gcG90ZW50aWFsbHkgcmVmbGVjdFxuXHRcdFx0XHRcdC8vIGEgcmVsYXRpdmUgcG9zaXRpb24sIHdoaWxlIHNvcnRhYmxlIGlzIGFsd2F5cyBhYnNvbHV0ZSwgd2hpY2ggdGhlIGRyYWdnZWRcblx0XHRcdFx0XHQvLyBlbGVtZW50IGhhcyBub3cgYmVjb21lLiAoIzg4MDkpXG5cdFx0XHRcdFx0dWkucG9zaXRpb24gPSBzb3J0YWJsZS5wb3NpdGlvbjtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHQvLyBJZiBpdCBkb2Vzbid0IGludGVyc2VjdCB3aXRoIHRoZSBzb3J0YWJsZSwgYW5kIGl0IGludGVyc2VjdGVkIGJlZm9yZSxcblx0XHRcdFx0Ly8gd2UgZmFrZSB0aGUgZHJhZyBzdG9wIG9mIHRoZSBzb3J0YWJsZSwgYnV0IG1ha2Ugc3VyZSBpdCBkb2Vzbid0IHJlbW92ZVxuXHRcdFx0XHQvLyB0aGUgaGVscGVyIGJ5IHVzaW5nIGNhbmNlbEhlbHBlclJlbW92YWwuXG5cdFx0XHRcdGlmICggc29ydGFibGUuaXNPdmVyICkge1xuXG5cdFx0XHRcdFx0c29ydGFibGUuaXNPdmVyID0gMDtcblx0XHRcdFx0XHRzb3J0YWJsZS5jYW5jZWxIZWxwZXJSZW1vdmFsID0gdHJ1ZTtcblxuXHRcdFx0XHRcdC8vIENhbGxpbmcgc29ydGFibGUncyBtb3VzZVN0b3Agd291bGQgdHJpZ2dlciBhIHJldmVydCxcblx0XHRcdFx0XHQvLyBzbyByZXZlcnQgbXVzdCBiZSB0ZW1wb3JhcmlseSBmYWxzZSB1bnRpbCBhZnRlciBtb3VzZVN0b3AgaXMgY2FsbGVkLlxuXHRcdFx0XHRcdHNvcnRhYmxlLm9wdGlvbnMuX3JldmVydCA9IHNvcnRhYmxlLm9wdGlvbnMucmV2ZXJ0O1xuXHRcdFx0XHRcdHNvcnRhYmxlLm9wdGlvbnMucmV2ZXJ0ID0gZmFsc2U7XG5cblx0XHRcdFx0XHRzb3J0YWJsZS5fdHJpZ2dlciggXCJvdXRcIiwgZXZlbnQsIHNvcnRhYmxlLl91aUhhc2goIHNvcnRhYmxlICkgKTtcblx0XHRcdFx0XHRzb3J0YWJsZS5fbW91c2VTdG9wKCBldmVudCwgdHJ1ZSApO1xuXG5cdFx0XHRcdFx0Ly8gUmVzdG9yZSBzb3J0YWJsZSBiZWhhdmlvcnMgdGhhdCB3ZXJlIG1vZGZpZWRcblx0XHRcdFx0XHQvLyB3aGVuIHRoZSBkcmFnZ2FibGUgZW50ZXJlZCB0aGUgc29ydGFibGUgYXJlYSAoIzk0ODEpXG5cdFx0XHRcdFx0c29ydGFibGUub3B0aW9ucy5yZXZlcnQgPSBzb3J0YWJsZS5vcHRpb25zLl9yZXZlcnQ7XG5cdFx0XHRcdFx0c29ydGFibGUub3B0aW9ucy5oZWxwZXIgPSBzb3J0YWJsZS5vcHRpb25zLl9oZWxwZXI7XG5cblx0XHRcdFx0XHRpZiAoIHNvcnRhYmxlLnBsYWNlaG9sZGVyICkge1xuXHRcdFx0XHRcdFx0c29ydGFibGUucGxhY2Vob2xkZXIucmVtb3ZlKCk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Ly8gUmVzdG9yZSBhbmQgcmVjYWxjdWxhdGUgdGhlIGRyYWdnYWJsZSdzIG9mZnNldCBjb25zaWRlcmluZyB0aGUgc29ydGFibGVcblx0XHRcdFx0XHQvLyBtYXkgaGF2ZSBtb2RpZmllZCB0aGVtIGluIHVuZXhwZWN0ZWQgd2F5cy4gKCM4ODA5LCAjMTA2NjkpXG5cdFx0XHRcdFx0dWkuaGVscGVyLmFwcGVuZFRvKCBkcmFnZ2FibGUuX3BhcmVudCApO1xuXHRcdFx0XHRcdGRyYWdnYWJsZS5fcmVmcmVzaE9mZnNldHMoIGV2ZW50ICk7XG5cdFx0XHRcdFx0dWkucG9zaXRpb24gPSBkcmFnZ2FibGUuX2dlbmVyYXRlUG9zaXRpb24oIGV2ZW50LCB0cnVlICk7XG5cblx0XHRcdFx0XHRkcmFnZ2FibGUuX3RyaWdnZXIoIFwiZnJvbVNvcnRhYmxlXCIsIGV2ZW50ICk7XG5cblx0XHRcdFx0XHQvLyBJbmZvcm0gZHJhZ2dhYmxlIHRoYXQgdGhlIGhlbHBlciBpcyBubyBsb25nZXIgaW4gYSB2YWxpZCBkcm9wIHpvbmVcblx0XHRcdFx0XHRkcmFnZ2FibGUuZHJvcHBlZCA9IGZhbHNlO1xuXG5cdFx0XHRcdFx0Ly8gTmVlZCB0byByZWZyZXNoUG9zaXRpb25zIG9mIGFsbCBzb3J0YWJsZXMganVzdCBpbiBjYXNlIHJlbW92aW5nXG5cdFx0XHRcdFx0Ly8gZnJvbSBvbmUgc29ydGFibGUgY2hhbmdlcyB0aGUgbG9jYXRpb24gb2Ygb3RoZXIgc29ydGFibGVzICgjOTY3NSlcblx0XHRcdFx0XHQkLmVhY2goIGRyYWdnYWJsZS5zb3J0YWJsZXMsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0dGhpcy5yZWZyZXNoUG9zaXRpb25zKCk7XG5cdFx0XHRcdFx0fSApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSApO1xuXHR9XG59ICk7XG5cbiQudWkucGx1Z2luLmFkZCggXCJkcmFnZ2FibGVcIiwgXCJjdXJzb3JcIiwge1xuXHRzdGFydDogZnVuY3Rpb24oIGV2ZW50LCB1aSwgaW5zdGFuY2UgKSB7XG5cdFx0dmFyIHQgPSAkKCBcImJvZHlcIiApLFxuXHRcdFx0byA9IGluc3RhbmNlLm9wdGlvbnM7XG5cblx0XHRpZiAoIHQuY3NzKCBcImN1cnNvclwiICkgKSB7XG5cdFx0XHRvLl9jdXJzb3IgPSB0LmNzcyggXCJjdXJzb3JcIiApO1xuXHRcdH1cblx0XHR0LmNzcyggXCJjdXJzb3JcIiwgby5jdXJzb3IgKTtcblx0fSxcblx0c3RvcDogZnVuY3Rpb24oIGV2ZW50LCB1aSwgaW5zdGFuY2UgKSB7XG5cdFx0dmFyIG8gPSBpbnN0YW5jZS5vcHRpb25zO1xuXHRcdGlmICggby5fY3Vyc29yICkge1xuXHRcdFx0JCggXCJib2R5XCIgKS5jc3MoIFwiY3Vyc29yXCIsIG8uX2N1cnNvciApO1xuXHRcdH1cblx0fVxufSApO1xuXG4kLnVpLnBsdWdpbi5hZGQoIFwiZHJhZ2dhYmxlXCIsIFwib3BhY2l0eVwiLCB7XG5cdHN0YXJ0OiBmdW5jdGlvbiggZXZlbnQsIHVpLCBpbnN0YW5jZSApIHtcblx0XHR2YXIgdCA9ICQoIHVpLmhlbHBlciApLFxuXHRcdFx0byA9IGluc3RhbmNlLm9wdGlvbnM7XG5cdFx0aWYgKCB0LmNzcyggXCJvcGFjaXR5XCIgKSApIHtcblx0XHRcdG8uX29wYWNpdHkgPSB0LmNzcyggXCJvcGFjaXR5XCIgKTtcblx0XHR9XG5cdFx0dC5jc3MoIFwib3BhY2l0eVwiLCBvLm9wYWNpdHkgKTtcblx0fSxcblx0c3RvcDogZnVuY3Rpb24oIGV2ZW50LCB1aSwgaW5zdGFuY2UgKSB7XG5cdFx0dmFyIG8gPSBpbnN0YW5jZS5vcHRpb25zO1xuXHRcdGlmICggby5fb3BhY2l0eSApIHtcblx0XHRcdCQoIHVpLmhlbHBlciApLmNzcyggXCJvcGFjaXR5XCIsIG8uX29wYWNpdHkgKTtcblx0XHR9XG5cdH1cbn0gKTtcblxuJC51aS5wbHVnaW4uYWRkKCBcImRyYWdnYWJsZVwiLCBcInNjcm9sbFwiLCB7XG5cdHN0YXJ0OiBmdW5jdGlvbiggZXZlbnQsIHVpLCBpICkge1xuXHRcdGlmICggIWkuc2Nyb2xsUGFyZW50Tm90SGlkZGVuICkge1xuXHRcdFx0aS5zY3JvbGxQYXJlbnROb3RIaWRkZW4gPSBpLmhlbHBlci5zY3JvbGxQYXJlbnQoIGZhbHNlICk7XG5cdFx0fVxuXG5cdFx0aWYgKCBpLnNjcm9sbFBhcmVudE5vdEhpZGRlblsgMCBdICE9PSBpLmRvY3VtZW50WyAwIF0gJiZcblx0XHRcdFx0aS5zY3JvbGxQYXJlbnROb3RIaWRkZW5bIDAgXS50YWdOYW1lICE9PSBcIkhUTUxcIiApIHtcblx0XHRcdGkub3ZlcmZsb3dPZmZzZXQgPSBpLnNjcm9sbFBhcmVudE5vdEhpZGRlbi5vZmZzZXQoKTtcblx0XHR9XG5cdH0sXG5cdGRyYWc6IGZ1bmN0aW9uKCBldmVudCwgdWksIGkgICkge1xuXG5cdFx0dmFyIG8gPSBpLm9wdGlvbnMsXG5cdFx0XHRzY3JvbGxlZCA9IGZhbHNlLFxuXHRcdFx0c2Nyb2xsUGFyZW50ID0gaS5zY3JvbGxQYXJlbnROb3RIaWRkZW5bIDAgXSxcblx0XHRcdGRvY3VtZW50ID0gaS5kb2N1bWVudFsgMCBdO1xuXG5cdFx0aWYgKCBzY3JvbGxQYXJlbnQgIT09IGRvY3VtZW50ICYmIHNjcm9sbFBhcmVudC50YWdOYW1lICE9PSBcIkhUTUxcIiApIHtcblx0XHRcdGlmICggIW8uYXhpcyB8fCBvLmF4aXMgIT09IFwieFwiICkge1xuXHRcdFx0XHRpZiAoICggaS5vdmVyZmxvd09mZnNldC50b3AgKyBzY3JvbGxQYXJlbnQub2Zmc2V0SGVpZ2h0ICkgLSBldmVudC5wYWdlWSA8XG5cdFx0XHRcdFx0XHRvLnNjcm9sbFNlbnNpdGl2aXR5ICkge1xuXHRcdFx0XHRcdHNjcm9sbFBhcmVudC5zY3JvbGxUb3AgPSBzY3JvbGxlZCA9IHNjcm9sbFBhcmVudC5zY3JvbGxUb3AgKyBvLnNjcm9sbFNwZWVkO1xuXHRcdFx0XHR9IGVsc2UgaWYgKCBldmVudC5wYWdlWSAtIGkub3ZlcmZsb3dPZmZzZXQudG9wIDwgby5zY3JvbGxTZW5zaXRpdml0eSApIHtcblx0XHRcdFx0XHRzY3JvbGxQYXJlbnQuc2Nyb2xsVG9wID0gc2Nyb2xsZWQgPSBzY3JvbGxQYXJlbnQuc2Nyb2xsVG9wIC0gby5zY3JvbGxTcGVlZDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRpZiAoICFvLmF4aXMgfHwgby5heGlzICE9PSBcInlcIiApIHtcblx0XHRcdFx0aWYgKCAoIGkub3ZlcmZsb3dPZmZzZXQubGVmdCArIHNjcm9sbFBhcmVudC5vZmZzZXRXaWR0aCApIC0gZXZlbnQucGFnZVggPFxuXHRcdFx0XHRcdFx0by5zY3JvbGxTZW5zaXRpdml0eSApIHtcblx0XHRcdFx0XHRzY3JvbGxQYXJlbnQuc2Nyb2xsTGVmdCA9IHNjcm9sbGVkID0gc2Nyb2xsUGFyZW50LnNjcm9sbExlZnQgKyBvLnNjcm9sbFNwZWVkO1xuXHRcdFx0XHR9IGVsc2UgaWYgKCBldmVudC5wYWdlWCAtIGkub3ZlcmZsb3dPZmZzZXQubGVmdCA8IG8uc2Nyb2xsU2Vuc2l0aXZpdHkgKSB7XG5cdFx0XHRcdFx0c2Nyb2xsUGFyZW50LnNjcm9sbExlZnQgPSBzY3JvbGxlZCA9IHNjcm9sbFBhcmVudC5zY3JvbGxMZWZ0IC0gby5zY3JvbGxTcGVlZDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0fSBlbHNlIHtcblxuXHRcdFx0aWYgKCAhby5heGlzIHx8IG8uYXhpcyAhPT0gXCJ4XCIgKSB7XG5cdFx0XHRcdGlmICggZXZlbnQucGFnZVkgLSAkKCBkb2N1bWVudCApLnNjcm9sbFRvcCgpIDwgby5zY3JvbGxTZW5zaXRpdml0eSApIHtcblx0XHRcdFx0XHRzY3JvbGxlZCA9ICQoIGRvY3VtZW50ICkuc2Nyb2xsVG9wKCAkKCBkb2N1bWVudCApLnNjcm9sbFRvcCgpIC0gby5zY3JvbGxTcGVlZCApO1xuXHRcdFx0XHR9IGVsc2UgaWYgKCAkKCB3aW5kb3cgKS5oZWlnaHQoKSAtICggZXZlbnQucGFnZVkgLSAkKCBkb2N1bWVudCApLnNjcm9sbFRvcCgpICkgPFxuXHRcdFx0XHRcdFx0by5zY3JvbGxTZW5zaXRpdml0eSApIHtcblx0XHRcdFx0XHRzY3JvbGxlZCA9ICQoIGRvY3VtZW50ICkuc2Nyb2xsVG9wKCAkKCBkb2N1bWVudCApLnNjcm9sbFRvcCgpICsgby5zY3JvbGxTcGVlZCApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGlmICggIW8uYXhpcyB8fCBvLmF4aXMgIT09IFwieVwiICkge1xuXHRcdFx0XHRpZiAoIGV2ZW50LnBhZ2VYIC0gJCggZG9jdW1lbnQgKS5zY3JvbGxMZWZ0KCkgPCBvLnNjcm9sbFNlbnNpdGl2aXR5ICkge1xuXHRcdFx0XHRcdHNjcm9sbGVkID0gJCggZG9jdW1lbnQgKS5zY3JvbGxMZWZ0KFxuXHRcdFx0XHRcdFx0JCggZG9jdW1lbnQgKS5zY3JvbGxMZWZ0KCkgLSBvLnNjcm9sbFNwZWVkXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0fSBlbHNlIGlmICggJCggd2luZG93ICkud2lkdGgoKSAtICggZXZlbnQucGFnZVggLSAkKCBkb2N1bWVudCApLnNjcm9sbExlZnQoKSApIDxcblx0XHRcdFx0XHRcdG8uc2Nyb2xsU2Vuc2l0aXZpdHkgKSB7XG5cdFx0XHRcdFx0c2Nyb2xsZWQgPSAkKCBkb2N1bWVudCApLnNjcm9sbExlZnQoXG5cdFx0XHRcdFx0XHQkKCBkb2N1bWVudCApLnNjcm9sbExlZnQoKSArIG8uc2Nyb2xsU3BlZWRcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHR9XG5cblx0XHRpZiAoIHNjcm9sbGVkICE9PSBmYWxzZSAmJiAkLnVpLmRkbWFuYWdlciAmJiAhby5kcm9wQmVoYXZpb3VyICkge1xuXHRcdFx0JC51aS5kZG1hbmFnZXIucHJlcGFyZU9mZnNldHMoIGksIGV2ZW50ICk7XG5cdFx0fVxuXG5cdH1cbn0gKTtcblxuJC51aS5wbHVnaW4uYWRkKCBcImRyYWdnYWJsZVwiLCBcInNuYXBcIiwge1xuXHRzdGFydDogZnVuY3Rpb24oIGV2ZW50LCB1aSwgaSApIHtcblxuXHRcdHZhciBvID0gaS5vcHRpb25zO1xuXG5cdFx0aS5zbmFwRWxlbWVudHMgPSBbXTtcblxuXHRcdCQoIG8uc25hcC5jb25zdHJ1Y3RvciAhPT0gU3RyaW5nID8gKCBvLnNuYXAuaXRlbXMgfHwgXCI6ZGF0YSh1aS1kcmFnZ2FibGUpXCIgKSA6IG8uc25hcCApXG5cdFx0XHQuZWFjaCggZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciAkdCA9ICQoIHRoaXMgKSxcblx0XHRcdFx0XHQkbyA9ICR0Lm9mZnNldCgpO1xuXHRcdFx0XHRpZiAoIHRoaXMgIT09IGkuZWxlbWVudFsgMCBdICkge1xuXHRcdFx0XHRcdGkuc25hcEVsZW1lbnRzLnB1c2goIHtcblx0XHRcdFx0XHRcdGl0ZW06IHRoaXMsXG5cdFx0XHRcdFx0XHR3aWR0aDogJHQub3V0ZXJXaWR0aCgpLCBoZWlnaHQ6ICR0Lm91dGVySGVpZ2h0KCksXG5cdFx0XHRcdFx0XHR0b3A6ICRvLnRvcCwgbGVmdDogJG8ubGVmdFxuXHRcdFx0XHRcdH0gKTtcblx0XHRcdFx0fVxuXHRcdFx0fSApO1xuXG5cdH0sXG5cdGRyYWc6IGZ1bmN0aW9uKCBldmVudCwgdWksIGluc3QgKSB7XG5cblx0XHR2YXIgdHMsIGJzLCBscywgcnMsIGwsIHIsIHQsIGIsIGksIGZpcnN0LFxuXHRcdFx0byA9IGluc3Qub3B0aW9ucyxcblx0XHRcdGQgPSBvLnNuYXBUb2xlcmFuY2UsXG5cdFx0XHR4MSA9IHVpLm9mZnNldC5sZWZ0LCB4MiA9IHgxICsgaW5zdC5oZWxwZXJQcm9wb3J0aW9ucy53aWR0aCxcblx0XHRcdHkxID0gdWkub2Zmc2V0LnRvcCwgeTIgPSB5MSArIGluc3QuaGVscGVyUHJvcG9ydGlvbnMuaGVpZ2h0O1xuXG5cdFx0Zm9yICggaSA9IGluc3Quc25hcEVsZW1lbnRzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tICkge1xuXG5cdFx0XHRsID0gaW5zdC5zbmFwRWxlbWVudHNbIGkgXS5sZWZ0IC0gaW5zdC5tYXJnaW5zLmxlZnQ7XG5cdFx0XHRyID0gbCArIGluc3Quc25hcEVsZW1lbnRzWyBpIF0ud2lkdGg7XG5cdFx0XHR0ID0gaW5zdC5zbmFwRWxlbWVudHNbIGkgXS50b3AgLSBpbnN0Lm1hcmdpbnMudG9wO1xuXHRcdFx0YiA9IHQgKyBpbnN0LnNuYXBFbGVtZW50c1sgaSBdLmhlaWdodDtcblxuXHRcdFx0aWYgKCB4MiA8IGwgLSBkIHx8IHgxID4gciArIGQgfHwgeTIgPCB0IC0gZCB8fCB5MSA+IGIgKyBkIHx8XG5cdFx0XHRcdFx0ISQuY29udGFpbnMoIGluc3Quc25hcEVsZW1lbnRzWyBpIF0uaXRlbS5vd25lckRvY3VtZW50LFxuXHRcdFx0XHRcdGluc3Quc25hcEVsZW1lbnRzWyBpIF0uaXRlbSApICkge1xuXHRcdFx0XHRpZiAoIGluc3Quc25hcEVsZW1lbnRzWyBpIF0uc25hcHBpbmcgKSB7XG5cdFx0XHRcdFx0KCBpbnN0Lm9wdGlvbnMuc25hcC5yZWxlYXNlICYmXG5cdFx0XHRcdFx0XHRpbnN0Lm9wdGlvbnMuc25hcC5yZWxlYXNlLmNhbGwoXG5cdFx0XHRcdFx0XHRcdGluc3QuZWxlbWVudCxcblx0XHRcdFx0XHRcdFx0ZXZlbnQsXG5cdFx0XHRcdFx0XHRcdCQuZXh0ZW5kKCBpbnN0Ll91aUhhc2goKSwgeyBzbmFwSXRlbTogaW5zdC5zbmFwRWxlbWVudHNbIGkgXS5pdGVtIH0gKVxuXHRcdFx0XHRcdFx0KSApO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGluc3Quc25hcEVsZW1lbnRzWyBpIF0uc25hcHBpbmcgPSBmYWxzZTtcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cblx0XHRcdGlmICggby5zbmFwTW9kZSAhPT0gXCJpbm5lclwiICkge1xuXHRcdFx0XHR0cyA9IE1hdGguYWJzKCB0IC0geTIgKSA8PSBkO1xuXHRcdFx0XHRicyA9IE1hdGguYWJzKCBiIC0geTEgKSA8PSBkO1xuXHRcdFx0XHRscyA9IE1hdGguYWJzKCBsIC0geDIgKSA8PSBkO1xuXHRcdFx0XHRycyA9IE1hdGguYWJzKCByIC0geDEgKSA8PSBkO1xuXHRcdFx0XHRpZiAoIHRzICkge1xuXHRcdFx0XHRcdHVpLnBvc2l0aW9uLnRvcCA9IGluc3QuX2NvbnZlcnRQb3NpdGlvblRvKCBcInJlbGF0aXZlXCIsIHtcblx0XHRcdFx0XHRcdHRvcDogdCAtIGluc3QuaGVscGVyUHJvcG9ydGlvbnMuaGVpZ2h0LFxuXHRcdFx0XHRcdFx0bGVmdDogMFxuXHRcdFx0XHRcdH0gKS50b3A7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKCBicyApIHtcblx0XHRcdFx0XHR1aS5wb3NpdGlvbi50b3AgPSBpbnN0Ll9jb252ZXJ0UG9zaXRpb25UbyggXCJyZWxhdGl2ZVwiLCB7XG5cdFx0XHRcdFx0XHR0b3A6IGIsXG5cdFx0XHRcdFx0XHRsZWZ0OiAwXG5cdFx0XHRcdFx0fSApLnRvcDtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoIGxzICkge1xuXHRcdFx0XHRcdHVpLnBvc2l0aW9uLmxlZnQgPSBpbnN0Ll9jb252ZXJ0UG9zaXRpb25UbyggXCJyZWxhdGl2ZVwiLCB7XG5cdFx0XHRcdFx0XHR0b3A6IDAsXG5cdFx0XHRcdFx0XHRsZWZ0OiBsIC0gaW5zdC5oZWxwZXJQcm9wb3J0aW9ucy53aWR0aFxuXHRcdFx0XHRcdH0gKS5sZWZ0O1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmICggcnMgKSB7XG5cdFx0XHRcdFx0dWkucG9zaXRpb24ubGVmdCA9IGluc3QuX2NvbnZlcnRQb3NpdGlvblRvKCBcInJlbGF0aXZlXCIsIHtcblx0XHRcdFx0XHRcdHRvcDogMCxcblx0XHRcdFx0XHRcdGxlZnQ6IHJcblx0XHRcdFx0XHR9ICkubGVmdDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRmaXJzdCA9ICggdHMgfHwgYnMgfHwgbHMgfHwgcnMgKTtcblxuXHRcdFx0aWYgKCBvLnNuYXBNb2RlICE9PSBcIm91dGVyXCIgKSB7XG5cdFx0XHRcdHRzID0gTWF0aC5hYnMoIHQgLSB5MSApIDw9IGQ7XG5cdFx0XHRcdGJzID0gTWF0aC5hYnMoIGIgLSB5MiApIDw9IGQ7XG5cdFx0XHRcdGxzID0gTWF0aC5hYnMoIGwgLSB4MSApIDw9IGQ7XG5cdFx0XHRcdHJzID0gTWF0aC5hYnMoIHIgLSB4MiApIDw9IGQ7XG5cdFx0XHRcdGlmICggdHMgKSB7XG5cdFx0XHRcdFx0dWkucG9zaXRpb24udG9wID0gaW5zdC5fY29udmVydFBvc2l0aW9uVG8oIFwicmVsYXRpdmVcIiwge1xuXHRcdFx0XHRcdFx0dG9wOiB0LFxuXHRcdFx0XHRcdFx0bGVmdDogMFxuXHRcdFx0XHRcdH0gKS50b3A7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKCBicyApIHtcblx0XHRcdFx0XHR1aS5wb3NpdGlvbi50b3AgPSBpbnN0Ll9jb252ZXJ0UG9zaXRpb25UbyggXCJyZWxhdGl2ZVwiLCB7XG5cdFx0XHRcdFx0XHR0b3A6IGIgLSBpbnN0LmhlbHBlclByb3BvcnRpb25zLmhlaWdodCxcblx0XHRcdFx0XHRcdGxlZnQ6IDBcblx0XHRcdFx0XHR9ICkudG9wO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmICggbHMgKSB7XG5cdFx0XHRcdFx0dWkucG9zaXRpb24ubGVmdCA9IGluc3QuX2NvbnZlcnRQb3NpdGlvblRvKCBcInJlbGF0aXZlXCIsIHtcblx0XHRcdFx0XHRcdHRvcDogMCxcblx0XHRcdFx0XHRcdGxlZnQ6IGxcblx0XHRcdFx0XHR9ICkubGVmdDtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoIHJzICkge1xuXHRcdFx0XHRcdHVpLnBvc2l0aW9uLmxlZnQgPSBpbnN0Ll9jb252ZXJ0UG9zaXRpb25UbyggXCJyZWxhdGl2ZVwiLCB7XG5cdFx0XHRcdFx0XHR0b3A6IDAsXG5cdFx0XHRcdFx0XHRsZWZ0OiByIC0gaW5zdC5oZWxwZXJQcm9wb3J0aW9ucy53aWR0aFxuXHRcdFx0XHRcdH0gKS5sZWZ0O1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGlmICggIWluc3Quc25hcEVsZW1lbnRzWyBpIF0uc25hcHBpbmcgJiYgKCB0cyB8fCBicyB8fCBscyB8fCBycyB8fCBmaXJzdCApICkge1xuXHRcdFx0XHQoIGluc3Qub3B0aW9ucy5zbmFwLnNuYXAgJiZcblx0XHRcdFx0XHRpbnN0Lm9wdGlvbnMuc25hcC5zbmFwLmNhbGwoXG5cdFx0XHRcdFx0XHRpbnN0LmVsZW1lbnQsXG5cdFx0XHRcdFx0XHRldmVudCxcblx0XHRcdFx0XHRcdCQuZXh0ZW5kKCBpbnN0Ll91aUhhc2goKSwge1xuXHRcdFx0XHRcdFx0XHRzbmFwSXRlbTogaW5zdC5zbmFwRWxlbWVudHNbIGkgXS5pdGVtXG5cdFx0XHRcdFx0XHR9ICkgKSApO1xuXHRcdFx0fVxuXHRcdFx0aW5zdC5zbmFwRWxlbWVudHNbIGkgXS5zbmFwcGluZyA9ICggdHMgfHwgYnMgfHwgbHMgfHwgcnMgfHwgZmlyc3QgKTtcblxuXHRcdH1cblxuXHR9XG59ICk7XG5cbiQudWkucGx1Z2luLmFkZCggXCJkcmFnZ2FibGVcIiwgXCJzdGFja1wiLCB7XG5cdHN0YXJ0OiBmdW5jdGlvbiggZXZlbnQsIHVpLCBpbnN0YW5jZSApIHtcblx0XHR2YXIgbWluLFxuXHRcdFx0byA9IGluc3RhbmNlLm9wdGlvbnMsXG5cdFx0XHRncm91cCA9ICQubWFrZUFycmF5KCAkKCBvLnN0YWNrICkgKS5zb3J0KCBmdW5jdGlvbiggYSwgYiApIHtcblx0XHRcdFx0cmV0dXJuICggcGFyc2VJbnQoICQoIGEgKS5jc3MoIFwiekluZGV4XCIgKSwgMTAgKSB8fCAwICkgLVxuXHRcdFx0XHRcdCggcGFyc2VJbnQoICQoIGIgKS5jc3MoIFwiekluZGV4XCIgKSwgMTAgKSB8fCAwICk7XG5cdFx0XHR9ICk7XG5cblx0XHRpZiAoICFncm91cC5sZW5ndGggKSB7IHJldHVybjsgfVxuXG5cdFx0bWluID0gcGFyc2VJbnQoICQoIGdyb3VwWyAwIF0gKS5jc3MoIFwiekluZGV4XCIgKSwgMTAgKSB8fCAwO1xuXHRcdCQoIGdyb3VwICkuZWFjaCggZnVuY3Rpb24oIGkgKSB7XG5cdFx0XHQkKCB0aGlzICkuY3NzKCBcInpJbmRleFwiLCBtaW4gKyBpICk7XG5cdFx0fSApO1xuXHRcdHRoaXMuY3NzKCBcInpJbmRleFwiLCAoIG1pbiArIGdyb3VwLmxlbmd0aCApICk7XG5cdH1cbn0gKTtcblxuJC51aS5wbHVnaW4uYWRkKCBcImRyYWdnYWJsZVwiLCBcInpJbmRleFwiLCB7XG5cdHN0YXJ0OiBmdW5jdGlvbiggZXZlbnQsIHVpLCBpbnN0YW5jZSApIHtcblx0XHR2YXIgdCA9ICQoIHVpLmhlbHBlciApLFxuXHRcdFx0byA9IGluc3RhbmNlLm9wdGlvbnM7XG5cblx0XHRpZiAoIHQuY3NzKCBcInpJbmRleFwiICkgKSB7XG5cdFx0XHRvLl96SW5kZXggPSB0LmNzcyggXCJ6SW5kZXhcIiApO1xuXHRcdH1cblx0XHR0LmNzcyggXCJ6SW5kZXhcIiwgby56SW5kZXggKTtcblx0fSxcblx0c3RvcDogZnVuY3Rpb24oIGV2ZW50LCB1aSwgaW5zdGFuY2UgKSB7XG5cdFx0dmFyIG8gPSBpbnN0YW5jZS5vcHRpb25zO1xuXG5cdFx0aWYgKCBvLl96SW5kZXggKSB7XG5cdFx0XHQkKCB1aS5oZWxwZXIgKS5jc3MoIFwiekluZGV4XCIsIG8uX3pJbmRleCApO1xuXHRcdH1cblx0fVxufSApO1xuXG5yZXR1cm4gJC51aS5kcmFnZ2FibGU7XG5cbn0gKSApO1xuIiwiLyohXG4gKiBqUXVlcnkgVUkgV2lkZ2V0IDEuMTIuMVxuICogaHR0cDovL2pxdWVyeXVpLmNvbVxuICpcbiAqIENvcHlyaWdodCBqUXVlcnkgRm91bmRhdGlvbiBhbmQgb3RoZXIgY29udHJpYnV0b3JzXG4gKiBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuXG4gKiBodHRwOi8vanF1ZXJ5Lm9yZy9saWNlbnNlXG4gKi9cblxuLy8+PmxhYmVsOiBXaWRnZXRcbi8vPj5ncm91cDogQ29yZVxuLy8+PmRlc2NyaXB0aW9uOiBQcm92aWRlcyBhIGZhY3RvcnkgZm9yIGNyZWF0aW5nIHN0YXRlZnVsIHdpZGdldHMgd2l0aCBhIGNvbW1vbiBBUEkuXG4vLz4+ZG9jczogaHR0cDovL2FwaS5qcXVlcnl1aS5jb20valF1ZXJ5LndpZGdldC9cbi8vPj5kZW1vczogaHR0cDovL2pxdWVyeXVpLmNvbS93aWRnZXQvXG5cbiggZnVuY3Rpb24oIGZhY3RvcnkgKSB7XG5cdGlmICggdHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQgKSB7XG5cblx0XHQvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXG5cdFx0ZGVmaW5lKCBbIFwianF1ZXJ5XCIsIFwiLi92ZXJzaW9uXCIgXSwgZmFjdG9yeSApO1xuXHR9IGVsc2Uge1xuXG5cdFx0Ly8gQnJvd3NlciBnbG9iYWxzXG5cdFx0ZmFjdG9yeSggalF1ZXJ5ICk7XG5cdH1cbn0oIGZ1bmN0aW9uKCAkICkge1xuXG52YXIgd2lkZ2V0VXVpZCA9IDA7XG52YXIgd2lkZ2V0U2xpY2UgPSBBcnJheS5wcm90b3R5cGUuc2xpY2U7XG5cbiQuY2xlYW5EYXRhID0gKCBmdW5jdGlvbiggb3JpZyApIHtcblx0cmV0dXJuIGZ1bmN0aW9uKCBlbGVtcyApIHtcblx0XHR2YXIgZXZlbnRzLCBlbGVtLCBpO1xuXHRcdGZvciAoIGkgPSAwOyAoIGVsZW0gPSBlbGVtc1sgaSBdICkgIT0gbnVsbDsgaSsrICkge1xuXHRcdFx0dHJ5IHtcblxuXHRcdFx0XHQvLyBPbmx5IHRyaWdnZXIgcmVtb3ZlIHdoZW4gbmVjZXNzYXJ5IHRvIHNhdmUgdGltZVxuXHRcdFx0XHRldmVudHMgPSAkLl9kYXRhKCBlbGVtLCBcImV2ZW50c1wiICk7XG5cdFx0XHRcdGlmICggZXZlbnRzICYmIGV2ZW50cy5yZW1vdmUgKSB7XG5cdFx0XHRcdFx0JCggZWxlbSApLnRyaWdnZXJIYW5kbGVyKCBcInJlbW92ZVwiICk7XG5cdFx0XHRcdH1cblxuXHRcdFx0Ly8gSHR0cDovL2J1Z3MuanF1ZXJ5LmNvbS90aWNrZXQvODIzNVxuXHRcdFx0fSBjYXRjaCAoIGUgKSB7fVxuXHRcdH1cblx0XHRvcmlnKCBlbGVtcyApO1xuXHR9O1xufSApKCAkLmNsZWFuRGF0YSApO1xuXG4kLndpZGdldCA9IGZ1bmN0aW9uKCBuYW1lLCBiYXNlLCBwcm90b3R5cGUgKSB7XG5cdHZhciBleGlzdGluZ0NvbnN0cnVjdG9yLCBjb25zdHJ1Y3RvciwgYmFzZVByb3RvdHlwZTtcblxuXHQvLyBQcm94aWVkUHJvdG90eXBlIGFsbG93cyB0aGUgcHJvdmlkZWQgcHJvdG90eXBlIHRvIHJlbWFpbiB1bm1vZGlmaWVkXG5cdC8vIHNvIHRoYXQgaXQgY2FuIGJlIHVzZWQgYXMgYSBtaXhpbiBmb3IgbXVsdGlwbGUgd2lkZ2V0cyAoIzg4NzYpXG5cdHZhciBwcm94aWVkUHJvdG90eXBlID0ge307XG5cblx0dmFyIG5hbWVzcGFjZSA9IG5hbWUuc3BsaXQoIFwiLlwiIClbIDAgXTtcblx0bmFtZSA9IG5hbWUuc3BsaXQoIFwiLlwiIClbIDEgXTtcblx0dmFyIGZ1bGxOYW1lID0gbmFtZXNwYWNlICsgXCItXCIgKyBuYW1lO1xuXG5cdGlmICggIXByb3RvdHlwZSApIHtcblx0XHRwcm90b3R5cGUgPSBiYXNlO1xuXHRcdGJhc2UgPSAkLldpZGdldDtcblx0fVxuXG5cdGlmICggJC5pc0FycmF5KCBwcm90b3R5cGUgKSApIHtcblx0XHRwcm90b3R5cGUgPSAkLmV4dGVuZC5hcHBseSggbnVsbCwgWyB7fSBdLmNvbmNhdCggcHJvdG90eXBlICkgKTtcblx0fVxuXG5cdC8vIENyZWF0ZSBzZWxlY3RvciBmb3IgcGx1Z2luXG5cdCQuZXhwclsgXCI6XCIgXVsgZnVsbE5hbWUudG9Mb3dlckNhc2UoKSBdID0gZnVuY3Rpb24oIGVsZW0gKSB7XG5cdFx0cmV0dXJuICEhJC5kYXRhKCBlbGVtLCBmdWxsTmFtZSApO1xuXHR9O1xuXG5cdCRbIG5hbWVzcGFjZSBdID0gJFsgbmFtZXNwYWNlIF0gfHwge307XG5cdGV4aXN0aW5nQ29uc3RydWN0b3IgPSAkWyBuYW1lc3BhY2UgXVsgbmFtZSBdO1xuXHRjb25zdHJ1Y3RvciA9ICRbIG5hbWVzcGFjZSBdWyBuYW1lIF0gPSBmdW5jdGlvbiggb3B0aW9ucywgZWxlbWVudCApIHtcblxuXHRcdC8vIEFsbG93IGluc3RhbnRpYXRpb24gd2l0aG91dCBcIm5ld1wiIGtleXdvcmRcblx0XHRpZiAoICF0aGlzLl9jcmVhdGVXaWRnZXQgKSB7XG5cdFx0XHRyZXR1cm4gbmV3IGNvbnN0cnVjdG9yKCBvcHRpb25zLCBlbGVtZW50ICk7XG5cdFx0fVxuXG5cdFx0Ly8gQWxsb3cgaW5zdGFudGlhdGlvbiB3aXRob3V0IGluaXRpYWxpemluZyBmb3Igc2ltcGxlIGluaGVyaXRhbmNlXG5cdFx0Ly8gbXVzdCB1c2UgXCJuZXdcIiBrZXl3b3JkICh0aGUgY29kZSBhYm92ZSBhbHdheXMgcGFzc2VzIGFyZ3MpXG5cdFx0aWYgKCBhcmd1bWVudHMubGVuZ3RoICkge1xuXHRcdFx0dGhpcy5fY3JlYXRlV2lkZ2V0KCBvcHRpb25zLCBlbGVtZW50ICk7XG5cdFx0fVxuXHR9O1xuXG5cdC8vIEV4dGVuZCB3aXRoIHRoZSBleGlzdGluZyBjb25zdHJ1Y3RvciB0byBjYXJyeSBvdmVyIGFueSBzdGF0aWMgcHJvcGVydGllc1xuXHQkLmV4dGVuZCggY29uc3RydWN0b3IsIGV4aXN0aW5nQ29uc3RydWN0b3IsIHtcblx0XHR2ZXJzaW9uOiBwcm90b3R5cGUudmVyc2lvbixcblxuXHRcdC8vIENvcHkgdGhlIG9iamVjdCB1c2VkIHRvIGNyZWF0ZSB0aGUgcHJvdG90eXBlIGluIGNhc2Ugd2UgbmVlZCB0b1xuXHRcdC8vIHJlZGVmaW5lIHRoZSB3aWRnZXQgbGF0ZXJcblx0XHRfcHJvdG86ICQuZXh0ZW5kKCB7fSwgcHJvdG90eXBlICksXG5cblx0XHQvLyBUcmFjayB3aWRnZXRzIHRoYXQgaW5oZXJpdCBmcm9tIHRoaXMgd2lkZ2V0IGluIGNhc2UgdGhpcyB3aWRnZXQgaXNcblx0XHQvLyByZWRlZmluZWQgYWZ0ZXIgYSB3aWRnZXQgaW5oZXJpdHMgZnJvbSBpdFxuXHRcdF9jaGlsZENvbnN0cnVjdG9yczogW11cblx0fSApO1xuXG5cdGJhc2VQcm90b3R5cGUgPSBuZXcgYmFzZSgpO1xuXG5cdC8vIFdlIG5lZWQgdG8gbWFrZSB0aGUgb3B0aW9ucyBoYXNoIGEgcHJvcGVydHkgZGlyZWN0bHkgb24gdGhlIG5ldyBpbnN0YW5jZVxuXHQvLyBvdGhlcndpc2Ugd2UnbGwgbW9kaWZ5IHRoZSBvcHRpb25zIGhhc2ggb24gdGhlIHByb3RvdHlwZSB0aGF0IHdlJ3JlXG5cdC8vIGluaGVyaXRpbmcgZnJvbVxuXHRiYXNlUHJvdG90eXBlLm9wdGlvbnMgPSAkLndpZGdldC5leHRlbmQoIHt9LCBiYXNlUHJvdG90eXBlLm9wdGlvbnMgKTtcblx0JC5lYWNoKCBwcm90b3R5cGUsIGZ1bmN0aW9uKCBwcm9wLCB2YWx1ZSApIHtcblx0XHRpZiAoICEkLmlzRnVuY3Rpb24oIHZhbHVlICkgKSB7XG5cdFx0XHRwcm94aWVkUHJvdG90eXBlWyBwcm9wIF0gPSB2YWx1ZTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0cHJveGllZFByb3RvdHlwZVsgcHJvcCBdID0gKCBmdW5jdGlvbigpIHtcblx0XHRcdGZ1bmN0aW9uIF9zdXBlcigpIHtcblx0XHRcdFx0cmV0dXJuIGJhc2UucHJvdG90eXBlWyBwcm9wIF0uYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuXHRcdFx0fVxuXG5cdFx0XHRmdW5jdGlvbiBfc3VwZXJBcHBseSggYXJncyApIHtcblx0XHRcdFx0cmV0dXJuIGJhc2UucHJvdG90eXBlWyBwcm9wIF0uYXBwbHkoIHRoaXMsIGFyZ3MgKTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgX19zdXBlciA9IHRoaXMuX3N1cGVyO1xuXHRcdFx0XHR2YXIgX19zdXBlckFwcGx5ID0gdGhpcy5fc3VwZXJBcHBseTtcblx0XHRcdFx0dmFyIHJldHVyblZhbHVlO1xuXG5cdFx0XHRcdHRoaXMuX3N1cGVyID0gX3N1cGVyO1xuXHRcdFx0XHR0aGlzLl9zdXBlckFwcGx5ID0gX3N1cGVyQXBwbHk7XG5cblx0XHRcdFx0cmV0dXJuVmFsdWUgPSB2YWx1ZS5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG5cblx0XHRcdFx0dGhpcy5fc3VwZXIgPSBfX3N1cGVyO1xuXHRcdFx0XHR0aGlzLl9zdXBlckFwcGx5ID0gX19zdXBlckFwcGx5O1xuXG5cdFx0XHRcdHJldHVybiByZXR1cm5WYWx1ZTtcblx0XHRcdH07XG5cdFx0fSApKCk7XG5cdH0gKTtcblx0Y29uc3RydWN0b3IucHJvdG90eXBlID0gJC53aWRnZXQuZXh0ZW5kKCBiYXNlUHJvdG90eXBlLCB7XG5cblx0XHQvLyBUT0RPOiByZW1vdmUgc3VwcG9ydCBmb3Igd2lkZ2V0RXZlbnRQcmVmaXhcblx0XHQvLyBhbHdheXMgdXNlIHRoZSBuYW1lICsgYSBjb2xvbiBhcyB0aGUgcHJlZml4LCBlLmcuLCBkcmFnZ2FibGU6c3RhcnRcblx0XHQvLyBkb24ndCBwcmVmaXggZm9yIHdpZGdldHMgdGhhdCBhcmVuJ3QgRE9NLWJhc2VkXG5cdFx0d2lkZ2V0RXZlbnRQcmVmaXg6IGV4aXN0aW5nQ29uc3RydWN0b3IgPyAoIGJhc2VQcm90b3R5cGUud2lkZ2V0RXZlbnRQcmVmaXggfHwgbmFtZSApIDogbmFtZVxuXHR9LCBwcm94aWVkUHJvdG90eXBlLCB7XG5cdFx0Y29uc3RydWN0b3I6IGNvbnN0cnVjdG9yLFxuXHRcdG5hbWVzcGFjZTogbmFtZXNwYWNlLFxuXHRcdHdpZGdldE5hbWU6IG5hbWUsXG5cdFx0d2lkZ2V0RnVsbE5hbWU6IGZ1bGxOYW1lXG5cdH0gKTtcblxuXHQvLyBJZiB0aGlzIHdpZGdldCBpcyBiZWluZyByZWRlZmluZWQgdGhlbiB3ZSBuZWVkIHRvIGZpbmQgYWxsIHdpZGdldHMgdGhhdFxuXHQvLyBhcmUgaW5oZXJpdGluZyBmcm9tIGl0IGFuZCByZWRlZmluZSBhbGwgb2YgdGhlbSBzbyB0aGF0IHRoZXkgaW5oZXJpdCBmcm9tXG5cdC8vIHRoZSBuZXcgdmVyc2lvbiBvZiB0aGlzIHdpZGdldC4gV2UncmUgZXNzZW50aWFsbHkgdHJ5aW5nIHRvIHJlcGxhY2Ugb25lXG5cdC8vIGxldmVsIGluIHRoZSBwcm90b3R5cGUgY2hhaW4uXG5cdGlmICggZXhpc3RpbmdDb25zdHJ1Y3RvciApIHtcblx0XHQkLmVhY2goIGV4aXN0aW5nQ29uc3RydWN0b3IuX2NoaWxkQ29uc3RydWN0b3JzLCBmdW5jdGlvbiggaSwgY2hpbGQgKSB7XG5cdFx0XHR2YXIgY2hpbGRQcm90b3R5cGUgPSBjaGlsZC5wcm90b3R5cGU7XG5cblx0XHRcdC8vIFJlZGVmaW5lIHRoZSBjaGlsZCB3aWRnZXQgdXNpbmcgdGhlIHNhbWUgcHJvdG90eXBlIHRoYXQgd2FzXG5cdFx0XHQvLyBvcmlnaW5hbGx5IHVzZWQsIGJ1dCBpbmhlcml0IGZyb20gdGhlIG5ldyB2ZXJzaW9uIG9mIHRoZSBiYXNlXG5cdFx0XHQkLndpZGdldCggY2hpbGRQcm90b3R5cGUubmFtZXNwYWNlICsgXCIuXCIgKyBjaGlsZFByb3RvdHlwZS53aWRnZXROYW1lLCBjb25zdHJ1Y3Rvcixcblx0XHRcdFx0Y2hpbGQuX3Byb3RvICk7XG5cdFx0fSApO1xuXG5cdFx0Ly8gUmVtb3ZlIHRoZSBsaXN0IG9mIGV4aXN0aW5nIGNoaWxkIGNvbnN0cnVjdG9ycyBmcm9tIHRoZSBvbGQgY29uc3RydWN0b3Jcblx0XHQvLyBzbyB0aGUgb2xkIGNoaWxkIGNvbnN0cnVjdG9ycyBjYW4gYmUgZ2FyYmFnZSBjb2xsZWN0ZWRcblx0XHRkZWxldGUgZXhpc3RpbmdDb25zdHJ1Y3Rvci5fY2hpbGRDb25zdHJ1Y3RvcnM7XG5cdH0gZWxzZSB7XG5cdFx0YmFzZS5fY2hpbGRDb25zdHJ1Y3RvcnMucHVzaCggY29uc3RydWN0b3IgKTtcblx0fVxuXG5cdCQud2lkZ2V0LmJyaWRnZSggbmFtZSwgY29uc3RydWN0b3IgKTtcblxuXHRyZXR1cm4gY29uc3RydWN0b3I7XG59O1xuXG4kLndpZGdldC5leHRlbmQgPSBmdW5jdGlvbiggdGFyZ2V0ICkge1xuXHR2YXIgaW5wdXQgPSB3aWRnZXRTbGljZS5jYWxsKCBhcmd1bWVudHMsIDEgKTtcblx0dmFyIGlucHV0SW5kZXggPSAwO1xuXHR2YXIgaW5wdXRMZW5ndGggPSBpbnB1dC5sZW5ndGg7XG5cdHZhciBrZXk7XG5cdHZhciB2YWx1ZTtcblxuXHRmb3IgKCA7IGlucHV0SW5kZXggPCBpbnB1dExlbmd0aDsgaW5wdXRJbmRleCsrICkge1xuXHRcdGZvciAoIGtleSBpbiBpbnB1dFsgaW5wdXRJbmRleCBdICkge1xuXHRcdFx0dmFsdWUgPSBpbnB1dFsgaW5wdXRJbmRleCBdWyBrZXkgXTtcblx0XHRcdGlmICggaW5wdXRbIGlucHV0SW5kZXggXS5oYXNPd25Qcm9wZXJ0eSgga2V5ICkgJiYgdmFsdWUgIT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0XHQvLyBDbG9uZSBvYmplY3RzXG5cdFx0XHRcdGlmICggJC5pc1BsYWluT2JqZWN0KCB2YWx1ZSApICkge1xuXHRcdFx0XHRcdHRhcmdldFsga2V5IF0gPSAkLmlzUGxhaW5PYmplY3QoIHRhcmdldFsga2V5IF0gKSA/XG5cdFx0XHRcdFx0XHQkLndpZGdldC5leHRlbmQoIHt9LCB0YXJnZXRbIGtleSBdLCB2YWx1ZSApIDpcblxuXHRcdFx0XHRcdFx0Ly8gRG9uJ3QgZXh0ZW5kIHN0cmluZ3MsIGFycmF5cywgZXRjLiB3aXRoIG9iamVjdHNcblx0XHRcdFx0XHRcdCQud2lkZ2V0LmV4dGVuZCgge30sIHZhbHVlICk7XG5cblx0XHRcdFx0Ly8gQ29weSBldmVyeXRoaW5nIGVsc2UgYnkgcmVmZXJlbmNlXG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dGFyZ2V0WyBrZXkgXSA9IHZhbHVlO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdHJldHVybiB0YXJnZXQ7XG59O1xuXG4kLndpZGdldC5icmlkZ2UgPSBmdW5jdGlvbiggbmFtZSwgb2JqZWN0ICkge1xuXHR2YXIgZnVsbE5hbWUgPSBvYmplY3QucHJvdG90eXBlLndpZGdldEZ1bGxOYW1lIHx8IG5hbWU7XG5cdCQuZm5bIG5hbWUgXSA9IGZ1bmN0aW9uKCBvcHRpb25zICkge1xuXHRcdHZhciBpc01ldGhvZENhbGwgPSB0eXBlb2Ygb3B0aW9ucyA9PT0gXCJzdHJpbmdcIjtcblx0XHR2YXIgYXJncyA9IHdpZGdldFNsaWNlLmNhbGwoIGFyZ3VtZW50cywgMSApO1xuXHRcdHZhciByZXR1cm5WYWx1ZSA9IHRoaXM7XG5cblx0XHRpZiAoIGlzTWV0aG9kQ2FsbCApIHtcblxuXHRcdFx0Ly8gSWYgdGhpcyBpcyBhbiBlbXB0eSBjb2xsZWN0aW9uLCB3ZSBuZWVkIHRvIGhhdmUgdGhlIGluc3RhbmNlIG1ldGhvZFxuXHRcdFx0Ly8gcmV0dXJuIHVuZGVmaW5lZCBpbnN0ZWFkIG9mIHRoZSBqUXVlcnkgaW5zdGFuY2Vcblx0XHRcdGlmICggIXRoaXMubGVuZ3RoICYmIG9wdGlvbnMgPT09IFwiaW5zdGFuY2VcIiApIHtcblx0XHRcdFx0cmV0dXJuVmFsdWUgPSB1bmRlZmluZWQ7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLmVhY2goIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdHZhciBtZXRob2RWYWx1ZTtcblx0XHRcdFx0XHR2YXIgaW5zdGFuY2UgPSAkLmRhdGEoIHRoaXMsIGZ1bGxOYW1lICk7XG5cblx0XHRcdFx0XHRpZiAoIG9wdGlvbnMgPT09IFwiaW5zdGFuY2VcIiApIHtcblx0XHRcdFx0XHRcdHJldHVyblZhbHVlID0gaW5zdGFuY2U7XG5cdFx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYgKCAhaW5zdGFuY2UgKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gJC5lcnJvciggXCJjYW5ub3QgY2FsbCBtZXRob2RzIG9uIFwiICsgbmFtZSArXG5cdFx0XHRcdFx0XHRcdFwiIHByaW9yIHRvIGluaXRpYWxpemF0aW9uOyBcIiArXG5cdFx0XHRcdFx0XHRcdFwiYXR0ZW1wdGVkIHRvIGNhbGwgbWV0aG9kICdcIiArIG9wdGlvbnMgKyBcIidcIiApO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmICggISQuaXNGdW5jdGlvbiggaW5zdGFuY2VbIG9wdGlvbnMgXSApIHx8IG9wdGlvbnMuY2hhckF0KCAwICkgPT09IFwiX1wiICkge1xuXHRcdFx0XHRcdFx0cmV0dXJuICQuZXJyb3IoIFwibm8gc3VjaCBtZXRob2QgJ1wiICsgb3B0aW9ucyArIFwiJyBmb3IgXCIgKyBuYW1lICtcblx0XHRcdFx0XHRcdFx0XCIgd2lkZ2V0IGluc3RhbmNlXCIgKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRtZXRob2RWYWx1ZSA9IGluc3RhbmNlWyBvcHRpb25zIF0uYXBwbHkoIGluc3RhbmNlLCBhcmdzICk7XG5cblx0XHRcdFx0XHRpZiAoIG1ldGhvZFZhbHVlICE9PSBpbnN0YW5jZSAmJiBtZXRob2RWYWx1ZSAhPT0gdW5kZWZpbmVkICkge1xuXHRcdFx0XHRcdFx0cmV0dXJuVmFsdWUgPSBtZXRob2RWYWx1ZSAmJiBtZXRob2RWYWx1ZS5qcXVlcnkgP1xuXHRcdFx0XHRcdFx0XHRyZXR1cm5WYWx1ZS5wdXNoU3RhY2soIG1ldGhvZFZhbHVlLmdldCgpICkgOlxuXHRcdFx0XHRcdFx0XHRtZXRob2RWYWx1ZTtcblx0XHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gKTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXG5cdFx0XHQvLyBBbGxvdyBtdWx0aXBsZSBoYXNoZXMgdG8gYmUgcGFzc2VkIG9uIGluaXRcblx0XHRcdGlmICggYXJncy5sZW5ndGggKSB7XG5cdFx0XHRcdG9wdGlvbnMgPSAkLndpZGdldC5leHRlbmQuYXBwbHkoIG51bGwsIFsgb3B0aW9ucyBdLmNvbmNhdCggYXJncyApICk7XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMuZWFjaCggZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBpbnN0YW5jZSA9ICQuZGF0YSggdGhpcywgZnVsbE5hbWUgKTtcblx0XHRcdFx0aWYgKCBpbnN0YW5jZSApIHtcblx0XHRcdFx0XHRpbnN0YW5jZS5vcHRpb24oIG9wdGlvbnMgfHwge30gKTtcblx0XHRcdFx0XHRpZiAoIGluc3RhbmNlLl9pbml0ICkge1xuXHRcdFx0XHRcdFx0aW5zdGFuY2UuX2luaXQoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0JC5kYXRhKCB0aGlzLCBmdWxsTmFtZSwgbmV3IG9iamVjdCggb3B0aW9ucywgdGhpcyApICk7XG5cdFx0XHRcdH1cblx0XHRcdH0gKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gcmV0dXJuVmFsdWU7XG5cdH07XG59O1xuXG4kLldpZGdldCA9IGZ1bmN0aW9uKCAvKiBvcHRpb25zLCBlbGVtZW50ICovICkge307XG4kLldpZGdldC5fY2hpbGRDb25zdHJ1Y3RvcnMgPSBbXTtcblxuJC5XaWRnZXQucHJvdG90eXBlID0ge1xuXHR3aWRnZXROYW1lOiBcIndpZGdldFwiLFxuXHR3aWRnZXRFdmVudFByZWZpeDogXCJcIixcblx0ZGVmYXVsdEVsZW1lbnQ6IFwiPGRpdj5cIixcblxuXHRvcHRpb25zOiB7XG5cdFx0Y2xhc3Nlczoge30sXG5cdFx0ZGlzYWJsZWQ6IGZhbHNlLFxuXG5cdFx0Ly8gQ2FsbGJhY2tzXG5cdFx0Y3JlYXRlOiBudWxsXG5cdH0sXG5cblx0X2NyZWF0ZVdpZGdldDogZnVuY3Rpb24oIG9wdGlvbnMsIGVsZW1lbnQgKSB7XG5cdFx0ZWxlbWVudCA9ICQoIGVsZW1lbnQgfHwgdGhpcy5kZWZhdWx0RWxlbWVudCB8fCB0aGlzIClbIDAgXTtcblx0XHR0aGlzLmVsZW1lbnQgPSAkKCBlbGVtZW50ICk7XG5cdFx0dGhpcy51dWlkID0gd2lkZ2V0VXVpZCsrO1xuXHRcdHRoaXMuZXZlbnROYW1lc3BhY2UgPSBcIi5cIiArIHRoaXMud2lkZ2V0TmFtZSArIHRoaXMudXVpZDtcblxuXHRcdHRoaXMuYmluZGluZ3MgPSAkKCk7XG5cdFx0dGhpcy5ob3ZlcmFibGUgPSAkKCk7XG5cdFx0dGhpcy5mb2N1c2FibGUgPSAkKCk7XG5cdFx0dGhpcy5jbGFzc2VzRWxlbWVudExvb2t1cCA9IHt9O1xuXG5cdFx0aWYgKCBlbGVtZW50ICE9PSB0aGlzICkge1xuXHRcdFx0JC5kYXRhKCBlbGVtZW50LCB0aGlzLndpZGdldEZ1bGxOYW1lLCB0aGlzICk7XG5cdFx0XHR0aGlzLl9vbiggdHJ1ZSwgdGhpcy5lbGVtZW50LCB7XG5cdFx0XHRcdHJlbW92ZTogZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdFx0XHRcdGlmICggZXZlbnQudGFyZ2V0ID09PSBlbGVtZW50ICkge1xuXHRcdFx0XHRcdFx0dGhpcy5kZXN0cm95KCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9ICk7XG5cdFx0XHR0aGlzLmRvY3VtZW50ID0gJCggZWxlbWVudC5zdHlsZSA/XG5cblx0XHRcdFx0Ly8gRWxlbWVudCB3aXRoaW4gdGhlIGRvY3VtZW50XG5cdFx0XHRcdGVsZW1lbnQub3duZXJEb2N1bWVudCA6XG5cblx0XHRcdFx0Ly8gRWxlbWVudCBpcyB3aW5kb3cgb3IgZG9jdW1lbnRcblx0XHRcdFx0ZWxlbWVudC5kb2N1bWVudCB8fCBlbGVtZW50ICk7XG5cdFx0XHR0aGlzLndpbmRvdyA9ICQoIHRoaXMuZG9jdW1lbnRbIDAgXS5kZWZhdWx0VmlldyB8fCB0aGlzLmRvY3VtZW50WyAwIF0ucGFyZW50V2luZG93ICk7XG5cdFx0fVxuXG5cdFx0dGhpcy5vcHRpb25zID0gJC53aWRnZXQuZXh0ZW5kKCB7fSxcblx0XHRcdHRoaXMub3B0aW9ucyxcblx0XHRcdHRoaXMuX2dldENyZWF0ZU9wdGlvbnMoKSxcblx0XHRcdG9wdGlvbnMgKTtcblxuXHRcdHRoaXMuX2NyZWF0ZSgpO1xuXG5cdFx0aWYgKCB0aGlzLm9wdGlvbnMuZGlzYWJsZWQgKSB7XG5cdFx0XHR0aGlzLl9zZXRPcHRpb25EaXNhYmxlZCggdGhpcy5vcHRpb25zLmRpc2FibGVkICk7XG5cdFx0fVxuXG5cdFx0dGhpcy5fdHJpZ2dlciggXCJjcmVhdGVcIiwgbnVsbCwgdGhpcy5fZ2V0Q3JlYXRlRXZlbnREYXRhKCkgKTtcblx0XHR0aGlzLl9pbml0KCk7XG5cdH0sXG5cblx0X2dldENyZWF0ZU9wdGlvbnM6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB7fTtcblx0fSxcblxuXHRfZ2V0Q3JlYXRlRXZlbnREYXRhOiAkLm5vb3AsXG5cblx0X2NyZWF0ZTogJC5ub29wLFxuXG5cdF9pbml0OiAkLm5vb3AsXG5cblx0ZGVzdHJveTogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHRoYXQgPSB0aGlzO1xuXG5cdFx0dGhpcy5fZGVzdHJveSgpO1xuXHRcdCQuZWFjaCggdGhpcy5jbGFzc2VzRWxlbWVudExvb2t1cCwgZnVuY3Rpb24oIGtleSwgdmFsdWUgKSB7XG5cdFx0XHR0aGF0Ll9yZW1vdmVDbGFzcyggdmFsdWUsIGtleSApO1xuXHRcdH0gKTtcblxuXHRcdC8vIFdlIGNhbiBwcm9iYWJseSByZW1vdmUgdGhlIHVuYmluZCBjYWxscyBpbiAyLjBcblx0XHQvLyBhbGwgZXZlbnQgYmluZGluZ3Mgc2hvdWxkIGdvIHRocm91Z2ggdGhpcy5fb24oKVxuXHRcdHRoaXMuZWxlbWVudFxuXHRcdFx0Lm9mZiggdGhpcy5ldmVudE5hbWVzcGFjZSApXG5cdFx0XHQucmVtb3ZlRGF0YSggdGhpcy53aWRnZXRGdWxsTmFtZSApO1xuXHRcdHRoaXMud2lkZ2V0KClcblx0XHRcdC5vZmYoIHRoaXMuZXZlbnROYW1lc3BhY2UgKVxuXHRcdFx0LnJlbW92ZUF0dHIoIFwiYXJpYS1kaXNhYmxlZFwiICk7XG5cblx0XHQvLyBDbGVhbiB1cCBldmVudHMgYW5kIHN0YXRlc1xuXHRcdHRoaXMuYmluZGluZ3Mub2ZmKCB0aGlzLmV2ZW50TmFtZXNwYWNlICk7XG5cdH0sXG5cblx0X2Rlc3Ryb3k6ICQubm9vcCxcblxuXHR3aWRnZXQ6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB0aGlzLmVsZW1lbnQ7XG5cdH0sXG5cblx0b3B0aW9uOiBmdW5jdGlvbigga2V5LCB2YWx1ZSApIHtcblx0XHR2YXIgb3B0aW9ucyA9IGtleTtcblx0XHR2YXIgcGFydHM7XG5cdFx0dmFyIGN1ck9wdGlvbjtcblx0XHR2YXIgaTtcblxuXHRcdGlmICggYXJndW1lbnRzLmxlbmd0aCA9PT0gMCApIHtcblxuXHRcdFx0Ly8gRG9uJ3QgcmV0dXJuIGEgcmVmZXJlbmNlIHRvIHRoZSBpbnRlcm5hbCBoYXNoXG5cdFx0XHRyZXR1cm4gJC53aWRnZXQuZXh0ZW5kKCB7fSwgdGhpcy5vcHRpb25zICk7XG5cdFx0fVxuXG5cdFx0aWYgKCB0eXBlb2Yga2V5ID09PSBcInN0cmluZ1wiICkge1xuXG5cdFx0XHQvLyBIYW5kbGUgbmVzdGVkIGtleXMsIGUuZy4sIFwiZm9vLmJhclwiID0+IHsgZm9vOiB7IGJhcjogX19fIH0gfVxuXHRcdFx0b3B0aW9ucyA9IHt9O1xuXHRcdFx0cGFydHMgPSBrZXkuc3BsaXQoIFwiLlwiICk7XG5cdFx0XHRrZXkgPSBwYXJ0cy5zaGlmdCgpO1xuXHRcdFx0aWYgKCBwYXJ0cy5sZW5ndGggKSB7XG5cdFx0XHRcdGN1ck9wdGlvbiA9IG9wdGlvbnNbIGtleSBdID0gJC53aWRnZXQuZXh0ZW5kKCB7fSwgdGhpcy5vcHRpb25zWyBrZXkgXSApO1xuXHRcdFx0XHRmb3IgKCBpID0gMDsgaSA8IHBhcnRzLmxlbmd0aCAtIDE7IGkrKyApIHtcblx0XHRcdFx0XHRjdXJPcHRpb25bIHBhcnRzWyBpIF0gXSA9IGN1ck9wdGlvblsgcGFydHNbIGkgXSBdIHx8IHt9O1xuXHRcdFx0XHRcdGN1ck9wdGlvbiA9IGN1ck9wdGlvblsgcGFydHNbIGkgXSBdO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGtleSA9IHBhcnRzLnBvcCgpO1xuXHRcdFx0XHRpZiAoIGFyZ3VtZW50cy5sZW5ndGggPT09IDEgKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGN1ck9wdGlvblsga2V5IF0gPT09IHVuZGVmaW5lZCA/IG51bGwgOiBjdXJPcHRpb25bIGtleSBdO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGN1ck9wdGlvblsga2V5IF0gPSB2YWx1ZTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGlmICggYXJndW1lbnRzLmxlbmd0aCA9PT0gMSApIHtcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy5vcHRpb25zWyBrZXkgXSA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IHRoaXMub3B0aW9uc1sga2V5IF07XG5cdFx0XHRcdH1cblx0XHRcdFx0b3B0aW9uc1sga2V5IF0gPSB2YWx1ZTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHR0aGlzLl9zZXRPcHRpb25zKCBvcHRpb25zICk7XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblxuXHRfc2V0T3B0aW9uczogZnVuY3Rpb24oIG9wdGlvbnMgKSB7XG5cdFx0dmFyIGtleTtcblxuXHRcdGZvciAoIGtleSBpbiBvcHRpb25zICkge1xuXHRcdFx0dGhpcy5fc2V0T3B0aW9uKCBrZXksIG9wdGlvbnNbIGtleSBdICk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cblx0X3NldE9wdGlvbjogZnVuY3Rpb24oIGtleSwgdmFsdWUgKSB7XG5cdFx0aWYgKCBrZXkgPT09IFwiY2xhc3Nlc1wiICkge1xuXHRcdFx0dGhpcy5fc2V0T3B0aW9uQ2xhc3NlcyggdmFsdWUgKTtcblx0XHR9XG5cblx0XHR0aGlzLm9wdGlvbnNbIGtleSBdID0gdmFsdWU7XG5cblx0XHRpZiAoIGtleSA9PT0gXCJkaXNhYmxlZFwiICkge1xuXHRcdFx0dGhpcy5fc2V0T3B0aW9uRGlzYWJsZWQoIHZhbHVlICk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cblx0X3NldE9wdGlvbkNsYXNzZXM6IGZ1bmN0aW9uKCB2YWx1ZSApIHtcblx0XHR2YXIgY2xhc3NLZXksIGVsZW1lbnRzLCBjdXJyZW50RWxlbWVudHM7XG5cblx0XHRmb3IgKCBjbGFzc0tleSBpbiB2YWx1ZSApIHtcblx0XHRcdGN1cnJlbnRFbGVtZW50cyA9IHRoaXMuY2xhc3Nlc0VsZW1lbnRMb29rdXBbIGNsYXNzS2V5IF07XG5cdFx0XHRpZiAoIHZhbHVlWyBjbGFzc0tleSBdID09PSB0aGlzLm9wdGlvbnMuY2xhc3Nlc1sgY2xhc3NLZXkgXSB8fFxuXHRcdFx0XHRcdCFjdXJyZW50RWxlbWVudHMgfHxcblx0XHRcdFx0XHQhY3VycmVudEVsZW1lbnRzLmxlbmd0aCApIHtcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cblx0XHRcdC8vIFdlIGFyZSBkb2luZyB0aGlzIHRvIGNyZWF0ZSBhIG5ldyBqUXVlcnkgb2JqZWN0IGJlY2F1c2UgdGhlIF9yZW1vdmVDbGFzcygpIGNhbGxcblx0XHRcdC8vIG9uIHRoZSBuZXh0IGxpbmUgaXMgZ29pbmcgdG8gZGVzdHJveSB0aGUgcmVmZXJlbmNlIHRvIHRoZSBjdXJyZW50IGVsZW1lbnRzIGJlaW5nXG5cdFx0XHQvLyB0cmFja2VkLiBXZSBuZWVkIHRvIHNhdmUgYSBjb3B5IG9mIHRoaXMgY29sbGVjdGlvbiBzbyB0aGF0IHdlIGNhbiBhZGQgdGhlIG5ldyBjbGFzc2VzXG5cdFx0XHQvLyBiZWxvdy5cblx0XHRcdGVsZW1lbnRzID0gJCggY3VycmVudEVsZW1lbnRzLmdldCgpICk7XG5cdFx0XHR0aGlzLl9yZW1vdmVDbGFzcyggY3VycmVudEVsZW1lbnRzLCBjbGFzc0tleSApO1xuXG5cdFx0XHQvLyBXZSBkb24ndCB1c2UgX2FkZENsYXNzKCkgaGVyZSwgYmVjYXVzZSB0aGF0IHVzZXMgdGhpcy5vcHRpb25zLmNsYXNzZXNcblx0XHRcdC8vIGZvciBnZW5lcmF0aW5nIHRoZSBzdHJpbmcgb2YgY2xhc3Nlcy4gV2Ugd2FudCB0byB1c2UgdGhlIHZhbHVlIHBhc3NlZCBpbiBmcm9tXG5cdFx0XHQvLyBfc2V0T3B0aW9uKCksIHRoaXMgaXMgdGhlIG5ldyB2YWx1ZSBvZiB0aGUgY2xhc3NlcyBvcHRpb24gd2hpY2ggd2FzIHBhc3NlZCB0b1xuXHRcdFx0Ly8gX3NldE9wdGlvbigpLiBXZSBwYXNzIHRoaXMgdmFsdWUgZGlyZWN0bHkgdG8gX2NsYXNzZXMoKS5cblx0XHRcdGVsZW1lbnRzLmFkZENsYXNzKCB0aGlzLl9jbGFzc2VzKCB7XG5cdFx0XHRcdGVsZW1lbnQ6IGVsZW1lbnRzLFxuXHRcdFx0XHRrZXlzOiBjbGFzc0tleSxcblx0XHRcdFx0Y2xhc3NlczogdmFsdWUsXG5cdFx0XHRcdGFkZDogdHJ1ZVxuXHRcdFx0fSApICk7XG5cdFx0fVxuXHR9LFxuXG5cdF9zZXRPcHRpb25EaXNhYmxlZDogZnVuY3Rpb24oIHZhbHVlICkge1xuXHRcdHRoaXMuX3RvZ2dsZUNsYXNzKCB0aGlzLndpZGdldCgpLCB0aGlzLndpZGdldEZ1bGxOYW1lICsgXCItZGlzYWJsZWRcIiwgbnVsbCwgISF2YWx1ZSApO1xuXG5cdFx0Ly8gSWYgdGhlIHdpZGdldCBpcyBiZWNvbWluZyBkaXNhYmxlZCwgdGhlbiBub3RoaW5nIGlzIGludGVyYWN0aXZlXG5cdFx0aWYgKCB2YWx1ZSApIHtcblx0XHRcdHRoaXMuX3JlbW92ZUNsYXNzKCB0aGlzLmhvdmVyYWJsZSwgbnVsbCwgXCJ1aS1zdGF0ZS1ob3ZlclwiICk7XG5cdFx0XHR0aGlzLl9yZW1vdmVDbGFzcyggdGhpcy5mb2N1c2FibGUsIG51bGwsIFwidWktc3RhdGUtZm9jdXNcIiApO1xuXHRcdH1cblx0fSxcblxuXHRlbmFibGU6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB0aGlzLl9zZXRPcHRpb25zKCB7IGRpc2FibGVkOiBmYWxzZSB9ICk7XG5cdH0sXG5cblx0ZGlzYWJsZTogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXMuX3NldE9wdGlvbnMoIHsgZGlzYWJsZWQ6IHRydWUgfSApO1xuXHR9LFxuXG5cdF9jbGFzc2VzOiBmdW5jdGlvbiggb3B0aW9ucyApIHtcblx0XHR2YXIgZnVsbCA9IFtdO1xuXHRcdHZhciB0aGF0ID0gdGhpcztcblxuXHRcdG9wdGlvbnMgPSAkLmV4dGVuZCgge1xuXHRcdFx0ZWxlbWVudDogdGhpcy5lbGVtZW50LFxuXHRcdFx0Y2xhc3NlczogdGhpcy5vcHRpb25zLmNsYXNzZXMgfHwge31cblx0XHR9LCBvcHRpb25zICk7XG5cblx0XHRmdW5jdGlvbiBwcm9jZXNzQ2xhc3NTdHJpbmcoIGNsYXNzZXMsIGNoZWNrT3B0aW9uICkge1xuXHRcdFx0dmFyIGN1cnJlbnQsIGk7XG5cdFx0XHRmb3IgKCBpID0gMDsgaSA8IGNsYXNzZXMubGVuZ3RoOyBpKysgKSB7XG5cdFx0XHRcdGN1cnJlbnQgPSB0aGF0LmNsYXNzZXNFbGVtZW50TG9va3VwWyBjbGFzc2VzWyBpIF0gXSB8fCAkKCk7XG5cdFx0XHRcdGlmICggb3B0aW9ucy5hZGQgKSB7XG5cdFx0XHRcdFx0Y3VycmVudCA9ICQoICQudW5pcXVlKCBjdXJyZW50LmdldCgpLmNvbmNhdCggb3B0aW9ucy5lbGVtZW50LmdldCgpICkgKSApO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGN1cnJlbnQgPSAkKCBjdXJyZW50Lm5vdCggb3B0aW9ucy5lbGVtZW50ICkuZ2V0KCkgKTtcblx0XHRcdFx0fVxuXHRcdFx0XHR0aGF0LmNsYXNzZXNFbGVtZW50TG9va3VwWyBjbGFzc2VzWyBpIF0gXSA9IGN1cnJlbnQ7XG5cdFx0XHRcdGZ1bGwucHVzaCggY2xhc3Nlc1sgaSBdICk7XG5cdFx0XHRcdGlmICggY2hlY2tPcHRpb24gJiYgb3B0aW9ucy5jbGFzc2VzWyBjbGFzc2VzWyBpIF0gXSApIHtcblx0XHRcdFx0XHRmdWxsLnB1c2goIG9wdGlvbnMuY2xhc3Nlc1sgY2xhc3Nlc1sgaSBdIF0gKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHRoaXMuX29uKCBvcHRpb25zLmVsZW1lbnQsIHtcblx0XHRcdFwicmVtb3ZlXCI6IFwiX3VudHJhY2tDbGFzc2VzRWxlbWVudFwiXG5cdFx0fSApO1xuXG5cdFx0aWYgKCBvcHRpb25zLmtleXMgKSB7XG5cdFx0XHRwcm9jZXNzQ2xhc3NTdHJpbmcoIG9wdGlvbnMua2V5cy5tYXRjaCggL1xcUysvZyApIHx8IFtdLCB0cnVlICk7XG5cdFx0fVxuXHRcdGlmICggb3B0aW9ucy5leHRyYSApIHtcblx0XHRcdHByb2Nlc3NDbGFzc1N0cmluZyggb3B0aW9ucy5leHRyYS5tYXRjaCggL1xcUysvZyApIHx8IFtdICk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGZ1bGwuam9pbiggXCIgXCIgKTtcblx0fSxcblxuXHRfdW50cmFja0NsYXNzZXNFbGVtZW50OiBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0dmFyIHRoYXQgPSB0aGlzO1xuXHRcdCQuZWFjaCggdGhhdC5jbGFzc2VzRWxlbWVudExvb2t1cCwgZnVuY3Rpb24oIGtleSwgdmFsdWUgKSB7XG5cdFx0XHRpZiAoICQuaW5BcnJheSggZXZlbnQudGFyZ2V0LCB2YWx1ZSApICE9PSAtMSApIHtcblx0XHRcdFx0dGhhdC5jbGFzc2VzRWxlbWVudExvb2t1cFsga2V5IF0gPSAkKCB2YWx1ZS5ub3QoIGV2ZW50LnRhcmdldCApLmdldCgpICk7XG5cdFx0XHR9XG5cdFx0fSApO1xuXHR9LFxuXG5cdF9yZW1vdmVDbGFzczogZnVuY3Rpb24oIGVsZW1lbnQsIGtleXMsIGV4dHJhICkge1xuXHRcdHJldHVybiB0aGlzLl90b2dnbGVDbGFzcyggZWxlbWVudCwga2V5cywgZXh0cmEsIGZhbHNlICk7XG5cdH0sXG5cblx0X2FkZENsYXNzOiBmdW5jdGlvbiggZWxlbWVudCwga2V5cywgZXh0cmEgKSB7XG5cdFx0cmV0dXJuIHRoaXMuX3RvZ2dsZUNsYXNzKCBlbGVtZW50LCBrZXlzLCBleHRyYSwgdHJ1ZSApO1xuXHR9LFxuXG5cdF90b2dnbGVDbGFzczogZnVuY3Rpb24oIGVsZW1lbnQsIGtleXMsIGV4dHJhLCBhZGQgKSB7XG5cdFx0YWRkID0gKCB0eXBlb2YgYWRkID09PSBcImJvb2xlYW5cIiApID8gYWRkIDogZXh0cmE7XG5cdFx0dmFyIHNoaWZ0ID0gKCB0eXBlb2YgZWxlbWVudCA9PT0gXCJzdHJpbmdcIiB8fCBlbGVtZW50ID09PSBudWxsICksXG5cdFx0XHRvcHRpb25zID0ge1xuXHRcdFx0XHRleHRyYTogc2hpZnQgPyBrZXlzIDogZXh0cmEsXG5cdFx0XHRcdGtleXM6IHNoaWZ0ID8gZWxlbWVudCA6IGtleXMsXG5cdFx0XHRcdGVsZW1lbnQ6IHNoaWZ0ID8gdGhpcy5lbGVtZW50IDogZWxlbWVudCxcblx0XHRcdFx0YWRkOiBhZGRcblx0XHRcdH07XG5cdFx0b3B0aW9ucy5lbGVtZW50LnRvZ2dsZUNsYXNzKCB0aGlzLl9jbGFzc2VzKCBvcHRpb25zICksIGFkZCApO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXG5cdF9vbjogZnVuY3Rpb24oIHN1cHByZXNzRGlzYWJsZWRDaGVjaywgZWxlbWVudCwgaGFuZGxlcnMgKSB7XG5cdFx0dmFyIGRlbGVnYXRlRWxlbWVudDtcblx0XHR2YXIgaW5zdGFuY2UgPSB0aGlzO1xuXG5cdFx0Ly8gTm8gc3VwcHJlc3NEaXNhYmxlZENoZWNrIGZsYWcsIHNodWZmbGUgYXJndW1lbnRzXG5cdFx0aWYgKCB0eXBlb2Ygc3VwcHJlc3NEaXNhYmxlZENoZWNrICE9PSBcImJvb2xlYW5cIiApIHtcblx0XHRcdGhhbmRsZXJzID0gZWxlbWVudDtcblx0XHRcdGVsZW1lbnQgPSBzdXBwcmVzc0Rpc2FibGVkQ2hlY2s7XG5cdFx0XHRzdXBwcmVzc0Rpc2FibGVkQ2hlY2sgPSBmYWxzZTtcblx0XHR9XG5cblx0XHQvLyBObyBlbGVtZW50IGFyZ3VtZW50LCBzaHVmZmxlIGFuZCB1c2UgdGhpcy5lbGVtZW50XG5cdFx0aWYgKCAhaGFuZGxlcnMgKSB7XG5cdFx0XHRoYW5kbGVycyA9IGVsZW1lbnQ7XG5cdFx0XHRlbGVtZW50ID0gdGhpcy5lbGVtZW50O1xuXHRcdFx0ZGVsZWdhdGVFbGVtZW50ID0gdGhpcy53aWRnZXQoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0ZWxlbWVudCA9IGRlbGVnYXRlRWxlbWVudCA9ICQoIGVsZW1lbnQgKTtcblx0XHRcdHRoaXMuYmluZGluZ3MgPSB0aGlzLmJpbmRpbmdzLmFkZCggZWxlbWVudCApO1xuXHRcdH1cblxuXHRcdCQuZWFjaCggaGFuZGxlcnMsIGZ1bmN0aW9uKCBldmVudCwgaGFuZGxlciApIHtcblx0XHRcdGZ1bmN0aW9uIGhhbmRsZXJQcm94eSgpIHtcblxuXHRcdFx0XHQvLyBBbGxvdyB3aWRnZXRzIHRvIGN1c3RvbWl6ZSB0aGUgZGlzYWJsZWQgaGFuZGxpbmdcblx0XHRcdFx0Ly8gLSBkaXNhYmxlZCBhcyBhbiBhcnJheSBpbnN0ZWFkIG9mIGJvb2xlYW5cblx0XHRcdFx0Ly8gLSBkaXNhYmxlZCBjbGFzcyBhcyBtZXRob2QgZm9yIGRpc2FibGluZyBpbmRpdmlkdWFsIHBhcnRzXG5cdFx0XHRcdGlmICggIXN1cHByZXNzRGlzYWJsZWRDaGVjayAmJlxuXHRcdFx0XHRcdFx0KCBpbnN0YW5jZS5vcHRpb25zLmRpc2FibGVkID09PSB0cnVlIHx8XG5cdFx0XHRcdFx0XHQkKCB0aGlzICkuaGFzQ2xhc3MoIFwidWktc3RhdGUtZGlzYWJsZWRcIiApICkgKSB7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiAoIHR5cGVvZiBoYW5kbGVyID09PSBcInN0cmluZ1wiID8gaW5zdGFuY2VbIGhhbmRsZXIgXSA6IGhhbmRsZXIgKVxuXHRcdFx0XHRcdC5hcHBseSggaW5zdGFuY2UsIGFyZ3VtZW50cyApO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBDb3B5IHRoZSBndWlkIHNvIGRpcmVjdCB1bmJpbmRpbmcgd29ya3Ncblx0XHRcdGlmICggdHlwZW9mIGhhbmRsZXIgIT09IFwic3RyaW5nXCIgKSB7XG5cdFx0XHRcdGhhbmRsZXJQcm94eS5ndWlkID0gaGFuZGxlci5ndWlkID1cblx0XHRcdFx0XHRoYW5kbGVyLmd1aWQgfHwgaGFuZGxlclByb3h5Lmd1aWQgfHwgJC5ndWlkKys7XG5cdFx0XHR9XG5cblx0XHRcdHZhciBtYXRjaCA9IGV2ZW50Lm1hdGNoKCAvXihbXFx3Oi1dKilcXHMqKC4qKSQvICk7XG5cdFx0XHR2YXIgZXZlbnROYW1lID0gbWF0Y2hbIDEgXSArIGluc3RhbmNlLmV2ZW50TmFtZXNwYWNlO1xuXHRcdFx0dmFyIHNlbGVjdG9yID0gbWF0Y2hbIDIgXTtcblxuXHRcdFx0aWYgKCBzZWxlY3RvciApIHtcblx0XHRcdFx0ZGVsZWdhdGVFbGVtZW50Lm9uKCBldmVudE5hbWUsIHNlbGVjdG9yLCBoYW5kbGVyUHJveHkgKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGVsZW1lbnQub24oIGV2ZW50TmFtZSwgaGFuZGxlclByb3h5ICk7XG5cdFx0XHR9XG5cdFx0fSApO1xuXHR9LFxuXG5cdF9vZmY6IGZ1bmN0aW9uKCBlbGVtZW50LCBldmVudE5hbWUgKSB7XG5cdFx0ZXZlbnROYW1lID0gKCBldmVudE5hbWUgfHwgXCJcIiApLnNwbGl0KCBcIiBcIiApLmpvaW4oIHRoaXMuZXZlbnROYW1lc3BhY2UgKyBcIiBcIiApICtcblx0XHRcdHRoaXMuZXZlbnROYW1lc3BhY2U7XG5cdFx0ZWxlbWVudC5vZmYoIGV2ZW50TmFtZSApLm9mZiggZXZlbnROYW1lICk7XG5cblx0XHQvLyBDbGVhciB0aGUgc3RhY2sgdG8gYXZvaWQgbWVtb3J5IGxlYWtzICgjMTAwNTYpXG5cdFx0dGhpcy5iaW5kaW5ncyA9ICQoIHRoaXMuYmluZGluZ3Mubm90KCBlbGVtZW50ICkuZ2V0KCkgKTtcblx0XHR0aGlzLmZvY3VzYWJsZSA9ICQoIHRoaXMuZm9jdXNhYmxlLm5vdCggZWxlbWVudCApLmdldCgpICk7XG5cdFx0dGhpcy5ob3ZlcmFibGUgPSAkKCB0aGlzLmhvdmVyYWJsZS5ub3QoIGVsZW1lbnQgKS5nZXQoKSApO1xuXHR9LFxuXG5cdF9kZWxheTogZnVuY3Rpb24oIGhhbmRsZXIsIGRlbGF5ICkge1xuXHRcdGZ1bmN0aW9uIGhhbmRsZXJQcm94eSgpIHtcblx0XHRcdHJldHVybiAoIHR5cGVvZiBoYW5kbGVyID09PSBcInN0cmluZ1wiID8gaW5zdGFuY2VbIGhhbmRsZXIgXSA6IGhhbmRsZXIgKVxuXHRcdFx0XHQuYXBwbHkoIGluc3RhbmNlLCBhcmd1bWVudHMgKTtcblx0XHR9XG5cdFx0dmFyIGluc3RhbmNlID0gdGhpcztcblx0XHRyZXR1cm4gc2V0VGltZW91dCggaGFuZGxlclByb3h5LCBkZWxheSB8fCAwICk7XG5cdH0sXG5cblx0X2hvdmVyYWJsZTogZnVuY3Rpb24oIGVsZW1lbnQgKSB7XG5cdFx0dGhpcy5ob3ZlcmFibGUgPSB0aGlzLmhvdmVyYWJsZS5hZGQoIGVsZW1lbnQgKTtcblx0XHR0aGlzLl9vbiggZWxlbWVudCwge1xuXHRcdFx0bW91c2VlbnRlcjogZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdFx0XHR0aGlzLl9hZGRDbGFzcyggJCggZXZlbnQuY3VycmVudFRhcmdldCApLCBudWxsLCBcInVpLXN0YXRlLWhvdmVyXCIgKTtcblx0XHRcdH0sXG5cdFx0XHRtb3VzZWxlYXZlOiBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0XHRcdHRoaXMuX3JlbW92ZUNsYXNzKCAkKCBldmVudC5jdXJyZW50VGFyZ2V0ICksIG51bGwsIFwidWktc3RhdGUtaG92ZXJcIiApO1xuXHRcdFx0fVxuXHRcdH0gKTtcblx0fSxcblxuXHRfZm9jdXNhYmxlOiBmdW5jdGlvbiggZWxlbWVudCApIHtcblx0XHR0aGlzLmZvY3VzYWJsZSA9IHRoaXMuZm9jdXNhYmxlLmFkZCggZWxlbWVudCApO1xuXHRcdHRoaXMuX29uKCBlbGVtZW50LCB7XG5cdFx0XHRmb2N1c2luOiBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0XHRcdHRoaXMuX2FkZENsYXNzKCAkKCBldmVudC5jdXJyZW50VGFyZ2V0ICksIG51bGwsIFwidWktc3RhdGUtZm9jdXNcIiApO1xuXHRcdFx0fSxcblx0XHRcdGZvY3Vzb3V0OiBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0XHRcdHRoaXMuX3JlbW92ZUNsYXNzKCAkKCBldmVudC5jdXJyZW50VGFyZ2V0ICksIG51bGwsIFwidWktc3RhdGUtZm9jdXNcIiApO1xuXHRcdFx0fVxuXHRcdH0gKTtcblx0fSxcblxuXHRfdHJpZ2dlcjogZnVuY3Rpb24oIHR5cGUsIGV2ZW50LCBkYXRhICkge1xuXHRcdHZhciBwcm9wLCBvcmlnO1xuXHRcdHZhciBjYWxsYmFjayA9IHRoaXMub3B0aW9uc1sgdHlwZSBdO1xuXG5cdFx0ZGF0YSA9IGRhdGEgfHwge307XG5cdFx0ZXZlbnQgPSAkLkV2ZW50KCBldmVudCApO1xuXHRcdGV2ZW50LnR5cGUgPSAoIHR5cGUgPT09IHRoaXMud2lkZ2V0RXZlbnRQcmVmaXggP1xuXHRcdFx0dHlwZSA6XG5cdFx0XHR0aGlzLndpZGdldEV2ZW50UHJlZml4ICsgdHlwZSApLnRvTG93ZXJDYXNlKCk7XG5cblx0XHQvLyBUaGUgb3JpZ2luYWwgZXZlbnQgbWF5IGNvbWUgZnJvbSBhbnkgZWxlbWVudFxuXHRcdC8vIHNvIHdlIG5lZWQgdG8gcmVzZXQgdGhlIHRhcmdldCBvbiB0aGUgbmV3IGV2ZW50XG5cdFx0ZXZlbnQudGFyZ2V0ID0gdGhpcy5lbGVtZW50WyAwIF07XG5cblx0XHQvLyBDb3B5IG9yaWdpbmFsIGV2ZW50IHByb3BlcnRpZXMgb3ZlciB0byB0aGUgbmV3IGV2ZW50XG5cdFx0b3JpZyA9IGV2ZW50Lm9yaWdpbmFsRXZlbnQ7XG5cdFx0aWYgKCBvcmlnICkge1xuXHRcdFx0Zm9yICggcHJvcCBpbiBvcmlnICkge1xuXHRcdFx0XHRpZiAoICEoIHByb3AgaW4gZXZlbnQgKSApIHtcblx0XHRcdFx0XHRldmVudFsgcHJvcCBdID0gb3JpZ1sgcHJvcCBdO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dGhpcy5lbGVtZW50LnRyaWdnZXIoIGV2ZW50LCBkYXRhICk7XG5cdFx0cmV0dXJuICEoICQuaXNGdW5jdGlvbiggY2FsbGJhY2sgKSAmJlxuXHRcdFx0Y2FsbGJhY2suYXBwbHkoIHRoaXMuZWxlbWVudFsgMCBdLCBbIGV2ZW50IF0uY29uY2F0KCBkYXRhICkgKSA9PT0gZmFsc2UgfHxcblx0XHRcdGV2ZW50LmlzRGVmYXVsdFByZXZlbnRlZCgpICk7XG5cdH1cbn07XG5cbiQuZWFjaCggeyBzaG93OiBcImZhZGVJblwiLCBoaWRlOiBcImZhZGVPdXRcIiB9LCBmdW5jdGlvbiggbWV0aG9kLCBkZWZhdWx0RWZmZWN0ICkge1xuXHQkLldpZGdldC5wcm90b3R5cGVbIFwiX1wiICsgbWV0aG9kIF0gPSBmdW5jdGlvbiggZWxlbWVudCwgb3B0aW9ucywgY2FsbGJhY2sgKSB7XG5cdFx0aWYgKCB0eXBlb2Ygb3B0aW9ucyA9PT0gXCJzdHJpbmdcIiApIHtcblx0XHRcdG9wdGlvbnMgPSB7IGVmZmVjdDogb3B0aW9ucyB9O1xuXHRcdH1cblxuXHRcdHZhciBoYXNPcHRpb25zO1xuXHRcdHZhciBlZmZlY3ROYW1lID0gIW9wdGlvbnMgP1xuXHRcdFx0bWV0aG9kIDpcblx0XHRcdG9wdGlvbnMgPT09IHRydWUgfHwgdHlwZW9mIG9wdGlvbnMgPT09IFwibnVtYmVyXCIgP1xuXHRcdFx0XHRkZWZhdWx0RWZmZWN0IDpcblx0XHRcdFx0b3B0aW9ucy5lZmZlY3QgfHwgZGVmYXVsdEVmZmVjdDtcblxuXHRcdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXHRcdGlmICggdHlwZW9mIG9wdGlvbnMgPT09IFwibnVtYmVyXCIgKSB7XG5cdFx0XHRvcHRpb25zID0geyBkdXJhdGlvbjogb3B0aW9ucyB9O1xuXHRcdH1cblxuXHRcdGhhc09wdGlvbnMgPSAhJC5pc0VtcHR5T2JqZWN0KCBvcHRpb25zICk7XG5cdFx0b3B0aW9ucy5jb21wbGV0ZSA9IGNhbGxiYWNrO1xuXG5cdFx0aWYgKCBvcHRpb25zLmRlbGF5ICkge1xuXHRcdFx0ZWxlbWVudC5kZWxheSggb3B0aW9ucy5kZWxheSApO1xuXHRcdH1cblxuXHRcdGlmICggaGFzT3B0aW9ucyAmJiAkLmVmZmVjdHMgJiYgJC5lZmZlY3RzLmVmZmVjdFsgZWZmZWN0TmFtZSBdICkge1xuXHRcdFx0ZWxlbWVudFsgbWV0aG9kIF0oIG9wdGlvbnMgKTtcblx0XHR9IGVsc2UgaWYgKCBlZmZlY3ROYW1lICE9PSBtZXRob2QgJiYgZWxlbWVudFsgZWZmZWN0TmFtZSBdICkge1xuXHRcdFx0ZWxlbWVudFsgZWZmZWN0TmFtZSBdKCBvcHRpb25zLmR1cmF0aW9uLCBvcHRpb25zLmVhc2luZywgY2FsbGJhY2sgKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0ZWxlbWVudC5xdWV1ZSggZnVuY3Rpb24oIG5leHQgKSB7XG5cdFx0XHRcdCQoIHRoaXMgKVsgbWV0aG9kIF0oKTtcblx0XHRcdFx0aWYgKCBjYWxsYmFjayApIHtcblx0XHRcdFx0XHRjYWxsYmFjay5jYWxsKCBlbGVtZW50WyAwIF0gKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRuZXh0KCk7XG5cdFx0XHR9ICk7XG5cdFx0fVxuXHR9O1xufSApO1xuXG5yZXR1cm4gJC53aWRnZXQ7XG5cbn0gKSApO1xuIiwiKCBmdW5jdGlvbiggZmFjdG9yeSApIHtcblx0aWYgKCB0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCApIHtcblxuXHRcdC8vIEFNRC4gUmVnaXN0ZXIgYXMgYW4gYW5vbnltb3VzIG1vZHVsZS5cblx0XHRkZWZpbmUoIFsgXCJqcXVlcnlcIiBdLCBmYWN0b3J5ICk7XG5cdH0gZWxzZSB7XG5cblx0XHQvLyBCcm93c2VyIGdsb2JhbHNcblx0XHRmYWN0b3J5KCBqUXVlcnkgKTtcblx0fVxufSAoIGZ1bmN0aW9uKCAkICkge1xuXG4kLnVpID0gJC51aSB8fCB7fTtcblxucmV0dXJuICQudWkudmVyc2lvbiA9IFwiMS4xMi4xXCI7XG5cbn0gKSApO1xuIiwiLyohXG4gKiBqUXVlcnkgVUkgU2Nyb2xsIFBhcmVudCAxLjEyLjFcbiAqIGh0dHA6Ly9qcXVlcnl1aS5jb21cbiAqXG4gKiBDb3B5cmlnaHQgalF1ZXJ5IEZvdW5kYXRpb24gYW5kIG90aGVyIGNvbnRyaWJ1dG9yc1xuICogUmVsZWFzZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlLlxuICogaHR0cDovL2pxdWVyeS5vcmcvbGljZW5zZVxuICovXG5cbi8vPj5sYWJlbDogc2Nyb2xsUGFyZW50XG4vLz4+Z3JvdXA6IENvcmVcbi8vPj5kZXNjcmlwdGlvbjogR2V0IHRoZSBjbG9zZXN0IGFuY2VzdG9yIGVsZW1lbnQgdGhhdCBpcyBzY3JvbGxhYmxlLlxuLy8+PmRvY3M6IGh0dHA6Ly9hcGkuanF1ZXJ5dWkuY29tL3Njcm9sbFBhcmVudC9cblxuKCBmdW5jdGlvbiggZmFjdG9yeSApIHtcblx0aWYgKCB0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCApIHtcblxuXHRcdC8vIEFNRC4gUmVnaXN0ZXIgYXMgYW4gYW5vbnltb3VzIG1vZHVsZS5cblx0XHRkZWZpbmUoIFsgXCJqcXVlcnlcIiwgXCIuL3ZlcnNpb25cIiBdLCBmYWN0b3J5ICk7XG5cdH0gZWxzZSB7XG5cblx0XHQvLyBCcm93c2VyIGdsb2JhbHNcblx0XHRmYWN0b3J5KCBqUXVlcnkgKTtcblx0fVxufSAoIGZ1bmN0aW9uKCAkICkge1xuXG5yZXR1cm4gJC5mbi5zY3JvbGxQYXJlbnQgPSBmdW5jdGlvbiggaW5jbHVkZUhpZGRlbiApIHtcblx0dmFyIHBvc2l0aW9uID0gdGhpcy5jc3MoIFwicG9zaXRpb25cIiApLFxuXHRcdGV4Y2x1ZGVTdGF0aWNQYXJlbnQgPSBwb3NpdGlvbiA9PT0gXCJhYnNvbHV0ZVwiLFxuXHRcdG92ZXJmbG93UmVnZXggPSBpbmNsdWRlSGlkZGVuID8gLyhhdXRvfHNjcm9sbHxoaWRkZW4pLyA6IC8oYXV0b3xzY3JvbGwpLyxcblx0XHRzY3JvbGxQYXJlbnQgPSB0aGlzLnBhcmVudHMoKS5maWx0ZXIoIGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIHBhcmVudCA9ICQoIHRoaXMgKTtcblx0XHRcdGlmICggZXhjbHVkZVN0YXRpY1BhcmVudCAmJiBwYXJlbnQuY3NzKCBcInBvc2l0aW9uXCIgKSA9PT0gXCJzdGF0aWNcIiApIHtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIG92ZXJmbG93UmVnZXgudGVzdCggcGFyZW50LmNzcyggXCJvdmVyZmxvd1wiICkgKyBwYXJlbnQuY3NzKCBcIm92ZXJmbG93LXlcIiApICtcblx0XHRcdFx0cGFyZW50LmNzcyggXCJvdmVyZmxvdy14XCIgKSApO1xuXHRcdH0gKS5lcSggMCApO1xuXG5cdHJldHVybiBwb3NpdGlvbiA9PT0gXCJmaXhlZFwiIHx8ICFzY3JvbGxQYXJlbnQubGVuZ3RoID9cblx0XHQkKCB0aGlzWyAwIF0ub3duZXJEb2N1bWVudCB8fCBkb2N1bWVudCApIDpcblx0XHRzY3JvbGxQYXJlbnQ7XG59O1xuXG59ICkgKTtcbiIsIiggZnVuY3Rpb24oIGZhY3RvcnkgKSB7XG5cdGlmICggdHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQgKSB7XG5cblx0XHQvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXG5cdFx0ZGVmaW5lKCBbIFwianF1ZXJ5XCIsIFwiLi92ZXJzaW9uXCIgXSwgZmFjdG9yeSApO1xuXHR9IGVsc2Uge1xuXG5cdFx0Ly8gQnJvd3NlciBnbG9iYWxzXG5cdFx0ZmFjdG9yeSggalF1ZXJ5ICk7XG5cdH1cbn0gKCBmdW5jdGlvbiggJCApIHtcbnJldHVybiAkLnVpLnNhZmVCbHVyID0gZnVuY3Rpb24oIGVsZW1lbnQgKSB7XG5cblx0Ly8gU3VwcG9ydDogSUU5IC0gMTAgb25seVxuXHQvLyBJZiB0aGUgPGJvZHk+IGlzIGJsdXJyZWQsIElFIHdpbGwgc3dpdGNoIHdpbmRvd3MsIHNlZSAjOTQyMFxuXHRpZiAoIGVsZW1lbnQgJiYgZWxlbWVudC5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpICE9PSBcImJvZHlcIiApIHtcblx0XHQkKCBlbGVtZW50ICkudHJpZ2dlciggXCJibHVyXCIgKTtcblx0fVxufTtcblxufSApICk7XG4iLCIoIGZ1bmN0aW9uKCBmYWN0b3J5ICkge1xuXHRpZiAoIHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kICkge1xuXG5cdFx0Ly8gQU1ELiBSZWdpc3RlciBhcyBhbiBhbm9ueW1vdXMgbW9kdWxlLlxuXHRcdGRlZmluZSggWyBcImpxdWVyeVwiLCBcIi4vdmVyc2lvblwiIF0sIGZhY3RvcnkgKTtcblx0fSBlbHNlIHtcblxuXHRcdC8vIEJyb3dzZXIgZ2xvYmFsc1xuXHRcdGZhY3RvcnkoIGpRdWVyeSApO1xuXHR9XG59ICggZnVuY3Rpb24oICQgKSB7XG5yZXR1cm4gJC51aS5zYWZlQWN0aXZlRWxlbWVudCA9IGZ1bmN0aW9uKCBkb2N1bWVudCApIHtcblx0dmFyIGFjdGl2ZUVsZW1lbnQ7XG5cblx0Ly8gU3VwcG9ydDogSUUgOSBvbmx5XG5cdC8vIElFOSB0aHJvd3MgYW4gXCJVbnNwZWNpZmllZCBlcnJvclwiIGFjY2Vzc2luZyBkb2N1bWVudC5hY3RpdmVFbGVtZW50IGZyb20gYW4gPGlmcmFtZT5cblx0dHJ5IHtcblx0XHRhY3RpdmVFbGVtZW50ID0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudDtcblx0fSBjYXRjaCAoIGVycm9yICkge1xuXHRcdGFjdGl2ZUVsZW1lbnQgPSBkb2N1bWVudC5ib2R5O1xuXHR9XG5cblx0Ly8gU3VwcG9ydDogSUUgOSAtIDExIG9ubHlcblx0Ly8gSUUgbWF5IHJldHVybiBudWxsIGluc3RlYWQgb2YgYW4gZWxlbWVudFxuXHQvLyBJbnRlcmVzdGluZ2x5LCB0aGlzIG9ubHkgc2VlbXMgdG8gb2NjdXIgd2hlbiBOT1QgaW4gYW4gaWZyYW1lXG5cdGlmICggIWFjdGl2ZUVsZW1lbnQgKSB7XG5cdFx0YWN0aXZlRWxlbWVudCA9IGRvY3VtZW50LmJvZHk7XG5cdH1cblxuXHQvLyBTdXBwb3J0OiBJRSAxMSBvbmx5XG5cdC8vIElFMTEgcmV0dXJucyBhIHNlZW1pbmdseSBlbXB0eSBvYmplY3QgaW4gc29tZSBjYXNlcyB3aGVuIGFjY2Vzc2luZ1xuXHQvLyBkb2N1bWVudC5hY3RpdmVFbGVtZW50IGZyb20gYW4gPGlmcmFtZT5cblx0aWYgKCAhYWN0aXZlRWxlbWVudC5ub2RlTmFtZSApIHtcblx0XHRhY3RpdmVFbGVtZW50ID0gZG9jdW1lbnQuYm9keTtcblx0fVxuXG5cdHJldHVybiBhY3RpdmVFbGVtZW50O1xufTtcblxufSApICk7XG4iLCIoIGZ1bmN0aW9uKCBmYWN0b3J5ICkge1xuXHRpZiAoIHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kICkge1xuXG5cdFx0Ly8gQU1ELiBSZWdpc3RlciBhcyBhbiBhbm9ueW1vdXMgbW9kdWxlLlxuXHRcdGRlZmluZSggWyBcImpxdWVyeVwiLCBcIi4vdmVyc2lvblwiIF0sIGZhY3RvcnkgKTtcblx0fSBlbHNlIHtcblxuXHRcdC8vIEJyb3dzZXIgZ2xvYmFsc1xuXHRcdGZhY3RvcnkoIGpRdWVyeSApO1xuXHR9XG59ICggZnVuY3Rpb24oICQgKSB7XG5cbi8vICQudWkucGx1Z2luIGlzIGRlcHJlY2F0ZWQuIFVzZSAkLndpZGdldCgpIGV4dGVuc2lvbnMgaW5zdGVhZC5cbnJldHVybiAkLnVpLnBsdWdpbiA9IHtcblx0YWRkOiBmdW5jdGlvbiggbW9kdWxlLCBvcHRpb24sIHNldCApIHtcblx0XHR2YXIgaSxcblx0XHRcdHByb3RvID0gJC51aVsgbW9kdWxlIF0ucHJvdG90eXBlO1xuXHRcdGZvciAoIGkgaW4gc2V0ICkge1xuXHRcdFx0cHJvdG8ucGx1Z2luc1sgaSBdID0gcHJvdG8ucGx1Z2luc1sgaSBdIHx8IFtdO1xuXHRcdFx0cHJvdG8ucGx1Z2luc1sgaSBdLnB1c2goIFsgb3B0aW9uLCBzZXRbIGkgXSBdICk7XG5cdFx0fVxuXHR9LFxuXHRjYWxsOiBmdW5jdGlvbiggaW5zdGFuY2UsIG5hbWUsIGFyZ3MsIGFsbG93RGlzY29ubmVjdGVkICkge1xuXHRcdHZhciBpLFxuXHRcdFx0c2V0ID0gaW5zdGFuY2UucGx1Z2luc1sgbmFtZSBdO1xuXG5cdFx0aWYgKCAhc2V0ICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGlmICggIWFsbG93RGlzY29ubmVjdGVkICYmICggIWluc3RhbmNlLmVsZW1lbnRbIDAgXS5wYXJlbnROb2RlIHx8XG5cdFx0XHRcdGluc3RhbmNlLmVsZW1lbnRbIDAgXS5wYXJlbnROb2RlLm5vZGVUeXBlID09PSAxMSApICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGZvciAoIGkgPSAwOyBpIDwgc2V0Lmxlbmd0aDsgaSsrICkge1xuXHRcdFx0aWYgKCBpbnN0YW5jZS5vcHRpb25zWyBzZXRbIGkgXVsgMCBdIF0gKSB7XG5cdFx0XHRcdHNldFsgaSBdWyAxIF0uYXBwbHkoIGluc3RhbmNlLmVsZW1lbnQsIGFyZ3MgKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cbn07XG5cbn0gKSApO1xuIiwiKCBmdW5jdGlvbiggZmFjdG9yeSApIHtcblx0aWYgKCB0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCApIHtcblxuXHRcdC8vIEFNRC4gUmVnaXN0ZXIgYXMgYW4gYW5vbnltb3VzIG1vZHVsZS5cblx0XHRkZWZpbmUoIFsgXCJqcXVlcnlcIiwgXCIuL3ZlcnNpb25cIiBdLCBmYWN0b3J5ICk7XG5cdH0gZWxzZSB7XG5cblx0XHQvLyBCcm93c2VyIGdsb2JhbHNcblx0XHRmYWN0b3J5KCBqUXVlcnkgKTtcblx0fVxufSAoIGZ1bmN0aW9uKCAkICkge1xuXG4vLyBUaGlzIGZpbGUgaXMgZGVwcmVjYXRlZFxucmV0dXJuICQudWkuaWUgPSAhIS9tc2llIFtcXHcuXSsvLmV4ZWMoIG5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKSApO1xufSApICk7XG4iLCIvKiFcbiAqIGpRdWVyeSBVSSA6ZGF0YSAxLjEyLjFcbiAqIGh0dHA6Ly9qcXVlcnl1aS5jb21cbiAqXG4gKiBDb3B5cmlnaHQgalF1ZXJ5IEZvdW5kYXRpb24gYW5kIG90aGVyIGNvbnRyaWJ1dG9yc1xuICogUmVsZWFzZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlLlxuICogaHR0cDovL2pxdWVyeS5vcmcvbGljZW5zZVxuICovXG5cbi8vPj5sYWJlbDogOmRhdGEgU2VsZWN0b3Jcbi8vPj5ncm91cDogQ29yZVxuLy8+PmRlc2NyaXB0aW9uOiBTZWxlY3RzIGVsZW1lbnRzIHdoaWNoIGhhdmUgZGF0YSBzdG9yZWQgdW5kZXIgdGhlIHNwZWNpZmllZCBrZXkuXG4vLz4+ZG9jczogaHR0cDovL2FwaS5qcXVlcnl1aS5jb20vZGF0YS1zZWxlY3Rvci9cblxuKCBmdW5jdGlvbiggZmFjdG9yeSApIHtcblx0aWYgKCB0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCApIHtcblxuXHRcdC8vIEFNRC4gUmVnaXN0ZXIgYXMgYW4gYW5vbnltb3VzIG1vZHVsZS5cblx0XHRkZWZpbmUoIFsgXCJqcXVlcnlcIiwgXCIuL3ZlcnNpb25cIiBdLCBmYWN0b3J5ICk7XG5cdH0gZWxzZSB7XG5cblx0XHQvLyBCcm93c2VyIGdsb2JhbHNcblx0XHRmYWN0b3J5KCBqUXVlcnkgKTtcblx0fVxufSAoIGZ1bmN0aW9uKCAkICkge1xucmV0dXJuICQuZXh0ZW5kKCAkLmV4cHJbIFwiOlwiIF0sIHtcblx0ZGF0YTogJC5leHByLmNyZWF0ZVBzZXVkbyA/XG5cdFx0JC5leHByLmNyZWF0ZVBzZXVkbyggZnVuY3Rpb24oIGRhdGFOYW1lICkge1xuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uKCBlbGVtICkge1xuXHRcdFx0XHRyZXR1cm4gISEkLmRhdGEoIGVsZW0sIGRhdGFOYW1lICk7XG5cdFx0XHR9O1xuXHRcdH0gKSA6XG5cblx0XHQvLyBTdXBwb3J0OiBqUXVlcnkgPDEuOFxuXHRcdGZ1bmN0aW9uKCBlbGVtLCBpLCBtYXRjaCApIHtcblx0XHRcdHJldHVybiAhISQuZGF0YSggZWxlbSwgbWF0Y2hbIDMgXSApO1xuXHRcdH1cbn0gKTtcbn0gKSApO1xuIl19
