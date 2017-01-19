(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.DotaDrawableMap = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// https://d3js.org/d3-array/ Version 1.0.2. Copyright 2016 Mike Bostock.
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.d3 = global.d3 || {})));
}(this, (function (exports) { 'use strict';

var ascending = function(a, b) {
  return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
};

var bisector = function(compare) {
  if (compare.length === 1) compare = ascendingComparator(compare);
  return {
    left: function(a, x, lo, hi) {
      if (lo == null) lo = 0;
      if (hi == null) hi = a.length;
      while (lo < hi) {
        var mid = lo + hi >>> 1;
        if (compare(a[mid], x) < 0) lo = mid + 1;
        else hi = mid;
      }
      return lo;
    },
    right: function(a, x, lo, hi) {
      if (lo == null) lo = 0;
      if (hi == null) hi = a.length;
      while (lo < hi) {
        var mid = lo + hi >>> 1;
        if (compare(a[mid], x) > 0) hi = mid;
        else lo = mid + 1;
      }
      return lo;
    }
  };
};

function ascendingComparator(f) {
  return function(d, x) {
    return ascending(f(d), x);
  };
}

var ascendingBisect = bisector(ascending);
var bisectRight = ascendingBisect.right;
var bisectLeft = ascendingBisect.left;

var descending = function(a, b) {
  return b < a ? -1 : b > a ? 1 : b >= a ? 0 : NaN;
};

var number = function(x) {
  return x === null ? NaN : +x;
};

var variance = function(array, f) {
  var n = array.length,
      m = 0,
      a,
      d,
      s = 0,
      i = -1,
      j = 0;

  if (f == null) {
    while (++i < n) {
      if (!isNaN(a = number(array[i]))) {
        d = a - m;
        m += d / ++j;
        s += d * (a - m);
      }
    }
  }

  else {
    while (++i < n) {
      if (!isNaN(a = number(f(array[i], i, array)))) {
        d = a - m;
        m += d / ++j;
        s += d * (a - m);
      }
    }
  }

  if (j > 1) return s / (j - 1);
};

var deviation = function(array, f) {
  var v = variance(array, f);
  return v ? Math.sqrt(v) : v;
};

var extent = function(array, f) {
  var i = -1,
      n = array.length,
      a,
      b,
      c;

  if (f == null) {
    while (++i < n) if ((b = array[i]) != null && b >= b) { a = c = b; break; }
    while (++i < n) if ((b = array[i]) != null) {
      if (a > b) a = b;
      if (c < b) c = b;
    }
  }

  else {
    while (++i < n) if ((b = f(array[i], i, array)) != null && b >= b) { a = c = b; break; }
    while (++i < n) if ((b = f(array[i], i, array)) != null) {
      if (a > b) a = b;
      if (c < b) c = b;
    }
  }

  return [a, c];
};

var array = Array.prototype;

var slice = array.slice;
var map = array.map;

var constant = function(x) {
  return function() {
    return x;
  };
};

var identity = function(x) {
  return x;
};

var range = function(start, stop, step) {
  start = +start, stop = +stop, step = (n = arguments.length) < 2 ? (stop = start, start = 0, 1) : n < 3 ? 1 : +step;

  var i = -1,
      n = Math.max(0, Math.ceil((stop - start) / step)) | 0,
      range = new Array(n);

  while (++i < n) {
    range[i] = start + i * step;
  }

  return range;
};

var e10 = Math.sqrt(50);
var e5 = Math.sqrt(10);
var e2 = Math.sqrt(2);

var ticks = function(start, stop, count) {
  var step = tickStep(start, stop, count);
  return range(
    Math.ceil(start / step) * step,
    Math.floor(stop / step) * step + step / 2, // inclusive
    step
  );
};

function tickStep(start, stop, count) {
  var step0 = Math.abs(stop - start) / Math.max(0, count),
      step1 = Math.pow(10, Math.floor(Math.log(step0) / Math.LN10)),
      error = step0 / step1;
  if (error >= e10) step1 *= 10;
  else if (error >= e5) step1 *= 5;
  else if (error >= e2) step1 *= 2;
  return stop < start ? -step1 : step1;
}

var sturges = function(values) {
  return Math.ceil(Math.log(values.length) / Math.LN2) + 1;
};

var histogram = function() {
  var value = identity,
      domain = extent,
      threshold = sturges;

  function histogram(data) {
    var i,
        n = data.length,
        x,
        values = new Array(n);

    for (i = 0; i < n; ++i) {
      values[i] = value(data[i], i, data);
    }

    var xz = domain(values),
        x0 = xz[0],
        x1 = xz[1],
        tz = threshold(values, x0, x1);

    // Convert number of thresholds into uniform thresholds.
    if (!Array.isArray(tz)) tz = ticks(x0, x1, tz);

    // Remove any thresholds outside the domain.
    var m = tz.length;
    while (tz[0] <= x0) tz.shift(), --m;
    while (tz[m - 1] >= x1) tz.pop(), --m;

    var bins = new Array(m + 1),
        bin;

    // Initialize bins.
    for (i = 0; i <= m; ++i) {
      bin = bins[i] = [];
      bin.x0 = i > 0 ? tz[i - 1] : x0;
      bin.x1 = i < m ? tz[i] : x1;
    }

    // Assign data to bins by value, ignoring any outside the domain.
    for (i = 0; i < n; ++i) {
      x = values[i];
      if (x0 <= x && x <= x1) {
        bins[bisectRight(tz, x, 0, m)].push(data[i]);
      }
    }

    return bins;
  }

  histogram.value = function(_) {
    return arguments.length ? (value = typeof _ === "function" ? _ : constant(_), histogram) : value;
  };

  histogram.domain = function(_) {
    return arguments.length ? (domain = typeof _ === "function" ? _ : constant([_[0], _[1]]), histogram) : domain;
  };

  histogram.thresholds = function(_) {
    return arguments.length ? (threshold = typeof _ === "function" ? _ : Array.isArray(_) ? constant(slice.call(_)) : constant(_), histogram) : threshold;
  };

  return histogram;
};

var quantile = function(array, p, f) {
  if (f == null) f = number;
  if (!(n = array.length)) return;
  if ((p = +p) <= 0 || n < 2) return +f(array[0], 0, array);
  if (p >= 1) return +f(array[n - 1], n - 1, array);
  var n,
      h = (n - 1) * p,
      i = Math.floor(h),
      a = +f(array[i], i, array),
      b = +f(array[i + 1], i + 1, array);
  return a + (b - a) * (h - i);
};

var freedmanDiaconis = function(values, min, max) {
  values = map.call(values, number).sort(ascending);
  return Math.ceil((max - min) / (2 * (quantile(values, 0.75) - quantile(values, 0.25)) * Math.pow(values.length, -1 / 3)));
};

var scott = function(values, min, max) {
  return Math.ceil((max - min) / (3.5 * deviation(values) * Math.pow(values.length, -1 / 3)));
};

var max = function(array, f) {
  var i = -1,
      n = array.length,
      a,
      b;

  if (f == null) {
    while (++i < n) if ((b = array[i]) != null && b >= b) { a = b; break; }
    while (++i < n) if ((b = array[i]) != null && b > a) a = b;
  }

  else {
    while (++i < n) if ((b = f(array[i], i, array)) != null && b >= b) { a = b; break; }
    while (++i < n) if ((b = f(array[i], i, array)) != null && b > a) a = b;
  }

  return a;
};

var mean = function(array, f) {
  var s = 0,
      n = array.length,
      a,
      i = -1,
      j = n;

  if (f == null) {
    while (++i < n) if (!isNaN(a = number(array[i]))) s += a; else --j;
  }

  else {
    while (++i < n) if (!isNaN(a = number(f(array[i], i, array)))) s += a; else --j;
  }

  if (j) return s / j;
};

var median = function(array, f) {
  var numbers = [],
      n = array.length,
      a,
      i = -1;

  if (f == null) {
    while (++i < n) if (!isNaN(a = number(array[i]))) numbers.push(a);
  }

  else {
    while (++i < n) if (!isNaN(a = number(f(array[i], i, array)))) numbers.push(a);
  }

  return quantile(numbers.sort(ascending), 0.5);
};

var merge = function(arrays) {
  var n = arrays.length,
      m,
      i = -1,
      j = 0,
      merged,
      array;

  while (++i < n) j += arrays[i].length;
  merged = new Array(j);

  while (--n >= 0) {
    array = arrays[n];
    m = array.length;
    while (--m >= 0) {
      merged[--j] = array[m];
    }
  }

  return merged;
};

var min = function(array, f) {
  var i = -1,
      n = array.length,
      a,
      b;

  if (f == null) {
    while (++i < n) if ((b = array[i]) != null && b >= b) { a = b; break; }
    while (++i < n) if ((b = array[i]) != null && a > b) a = b;
  }

  else {
    while (++i < n) if ((b = f(array[i], i, array)) != null && b >= b) { a = b; break; }
    while (++i < n) if ((b = f(array[i], i, array)) != null && a > b) a = b;
  }

  return a;
};

var pairs = function(array) {
  var i = 0, n = array.length - 1, p = array[0], pairs = new Array(n < 0 ? 0 : n);
  while (i < n) pairs[i] = [p, p = array[++i]];
  return pairs;
};

var permute = function(array, indexes) {
  var i = indexes.length, permutes = new Array(i);
  while (i--) permutes[i] = array[indexes[i]];
  return permutes;
};

var scan = function(array, compare) {
  if (!(n = array.length)) return;
  var i = 0,
      n,
      j = 0,
      xi,
      xj = array[j];

  if (!compare) compare = ascending;

  while (++i < n) if (compare(xi = array[i], xj) < 0 || compare(xj, xj) !== 0) xj = xi, j = i;

  if (compare(xj, xj) === 0) return j;
};

var shuffle = function(array, i0, i1) {
  var m = (i1 == null ? array.length : i1) - (i0 = i0 == null ? 0 : +i0),
      t,
      i;

  while (m) {
    i = Math.random() * m-- | 0;
    t = array[m + i0];
    array[m + i0] = array[i + i0];
    array[i + i0] = t;
  }

  return array;
};

var sum = function(array, f) {
  var s = 0,
      n = array.length,
      a,
      i = -1;

  if (f == null) {
    while (++i < n) if (a = +array[i]) s += a; // Note: zero and null are equivalent.
  }

  else {
    while (++i < n) if (a = +f(array[i], i, array)) s += a;
  }

  return s;
};

var transpose = function(matrix) {
  if (!(n = matrix.length)) return [];
  for (var i = -1, m = min(matrix, length), transpose = new Array(m); ++i < m;) {
    for (var j = -1, n, row = transpose[i] = new Array(n); ++j < n;) {
      row[j] = matrix[j][i];
    }
  }
  return transpose;
};

function length(d) {
  return d.length;
}

var zip = function() {
  return transpose(arguments);
};

exports.bisect = bisectRight;
exports.bisectRight = bisectRight;
exports.bisectLeft = bisectLeft;
exports.ascending = ascending;
exports.bisector = bisector;
exports.descending = descending;
exports.deviation = deviation;
exports.extent = extent;
exports.histogram = histogram;
exports.thresholdFreedmanDiaconis = freedmanDiaconis;
exports.thresholdScott = scott;
exports.thresholdSturges = sturges;
exports.max = max;
exports.mean = mean;
exports.median = median;
exports.merge = merge;
exports.min = min;
exports.pairs = pairs;
exports.permute = permute;
exports.quantile = quantile;
exports.range = range;
exports.scan = scan;
exports.shuffle = shuffle;
exports.sum = sum;
exports.ticks = ticks;
exports.tickStep = tickStep;
exports.transpose = transpose;
exports.variance = variance;
exports.zip = zip;

Object.defineProperty(exports, '__esModule', { value: true });

})));

},{}],2:[function(require,module,exports){
// https://d3js.org/d3-collection/ Version 1.0.2. Copyright 2016 Mike Bostock.
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.d3 = global.d3 || {})));
}(this, (function (exports) { 'use strict';

var prefix = "$";

function Map() {}

Map.prototype = map.prototype = {
  constructor: Map,
  has: function(key) {
    return (prefix + key) in this;
  },
  get: function(key) {
    return this[prefix + key];
  },
  set: function(key, value) {
    this[prefix + key] = value;
    return this;
  },
  remove: function(key) {
    var property = prefix + key;
    return property in this && delete this[property];
  },
  clear: function() {
    for (var property in this) if (property[0] === prefix) delete this[property];
  },
  keys: function() {
    var keys = [];
    for (var property in this) if (property[0] === prefix) keys.push(property.slice(1));
    return keys;
  },
  values: function() {
    var values = [];
    for (var property in this) if (property[0] === prefix) values.push(this[property]);
    return values;
  },
  entries: function() {
    var entries = [];
    for (var property in this) if (property[0] === prefix) entries.push({key: property.slice(1), value: this[property]});
    return entries;
  },
  size: function() {
    var size = 0;
    for (var property in this) if (property[0] === prefix) ++size;
    return size;
  },
  empty: function() {
    for (var property in this) if (property[0] === prefix) return false;
    return true;
  },
  each: function(f) {
    for (var property in this) if (property[0] === prefix) f(this[property], property.slice(1), this);
  }
};

function map(object, f) {
  var map = new Map;

  // Copy constructor.
  if (object instanceof Map) object.each(function(value, key) { map.set(key, value); });

  // Index array by numeric index or specified key function.
  else if (Array.isArray(object)) {
    var i = -1,
        n = object.length,
        o;

    if (f == null) while (++i < n) map.set(i, object[i]);
    else while (++i < n) map.set(f(o = object[i], i, object), o);
  }

  // Convert object to map.
  else if (object) for (var key in object) map.set(key, object[key]);

  return map;
}

var nest = function() {
  var keys = [],
      sortKeys = [],
      sortValues,
      rollup,
      nest;

  function apply(array, depth, createResult, setResult) {
    if (depth >= keys.length) return rollup != null
        ? rollup(array) : (sortValues != null
        ? array.sort(sortValues)
        : array);

    var i = -1,
        n = array.length,
        key = keys[depth++],
        keyValue,
        value,
        valuesByKey = map(),
        values,
        result = createResult();

    while (++i < n) {
      if (values = valuesByKey.get(keyValue = key(value = array[i]) + "")) {
        values.push(value);
      } else {
        valuesByKey.set(keyValue, [value]);
      }
    }

    valuesByKey.each(function(values, key) {
      setResult(result, key, apply(values, depth, createResult, setResult));
    });

    return result;
  }

  function entries(map$$1, depth) {
    if (++depth > keys.length) return map$$1;
    var array, sortKey = sortKeys[depth - 1];
    if (rollup != null && depth >= keys.length) array = map$$1.entries();
    else array = [], map$$1.each(function(v, k) { array.push({key: k, values: entries(v, depth)}); });
    return sortKey != null ? array.sort(function(a, b) { return sortKey(a.key, b.key); }) : array;
  }

  return nest = {
    object: function(array) { return apply(array, 0, createObject, setObject); },
    map: function(array) { return apply(array, 0, createMap, setMap); },
    entries: function(array) { return entries(apply(array, 0, createMap, setMap), 0); },
    key: function(d) { keys.push(d); return nest; },
    sortKeys: function(order) { sortKeys[keys.length - 1] = order; return nest; },
    sortValues: function(order) { sortValues = order; return nest; },
    rollup: function(f) { rollup = f; return nest; }
  };
};

function createObject() {
  return {};
}

function setObject(object, key, value) {
  object[key] = value;
}

function createMap() {
  return map();
}

function setMap(map$$1, key, value) {
  map$$1.set(key, value);
}

function Set() {}

var proto = map.prototype;

Set.prototype = set.prototype = {
  constructor: Set,
  has: proto.has,
  add: function(value) {
    value += "";
    this[prefix + value] = value;
    return this;
  },
  remove: proto.remove,
  clear: proto.clear,
  values: proto.keys,
  size: proto.size,
  empty: proto.empty,
  each: proto.each
};

function set(object, f) {
  var set = new Set;

  // Copy constructor.
  if (object instanceof Set) object.each(function(value) { set.add(value); });

  // Otherwise, assume it’s an array.
  else if (object) {
    var i = -1, n = object.length;
    if (f == null) while (++i < n) set.add(object[i]);
    else while (++i < n) set.add(f(object[i], i, object));
  }

  return set;
}

var keys = function(map) {
  var keys = [];
  for (var key in map) keys.push(key);
  return keys;
};

var values = function(map) {
  var values = [];
  for (var key in map) values.push(map[key]);
  return values;
};

var entries = function(map) {
  var entries = [];
  for (var key in map) entries.push({key: key, value: map[key]});
  return entries;
};

exports.nest = nest;
exports.set = set;
exports.map = map;
exports.keys = keys;
exports.values = values;
exports.entries = entries;

Object.defineProperty(exports, '__esModule', { value: true });

})));

},{}],3:[function(require,module,exports){
// https://d3js.org/d3-color/ Version 1.0.2. Copyright 2016 Mike Bostock.
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.d3 = global.d3 || {})));
}(this, (function (exports) { 'use strict';

var define = function(constructor, factory, prototype) {
  constructor.prototype = factory.prototype = prototype;
  prototype.constructor = constructor;
};

function extend(parent, definition) {
  var prototype = Object.create(parent.prototype);
  for (var key in definition) prototype[key] = definition[key];
  return prototype;
}

function Color() {}

var darker = 0.7;
var brighter = 1 / darker;

var reI = "\\s*([+-]?\\d+)\\s*";
var reN = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)\\s*";
var reP = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)%\\s*";
var reHex3 = /^#([0-9a-f]{3})$/;
var reHex6 = /^#([0-9a-f]{6})$/;
var reRgbInteger = new RegExp("^rgb\\(" + [reI, reI, reI] + "\\)$");
var reRgbPercent = new RegExp("^rgb\\(" + [reP, reP, reP] + "\\)$");
var reRgbaInteger = new RegExp("^rgba\\(" + [reI, reI, reI, reN] + "\\)$");
var reRgbaPercent = new RegExp("^rgba\\(" + [reP, reP, reP, reN] + "\\)$");
var reHslPercent = new RegExp("^hsl\\(" + [reN, reP, reP] + "\\)$");
var reHslaPercent = new RegExp("^hsla\\(" + [reN, reP, reP, reN] + "\\)$");

var named = {
  aliceblue: 0xf0f8ff,
  antiquewhite: 0xfaebd7,
  aqua: 0x00ffff,
  aquamarine: 0x7fffd4,
  azure: 0xf0ffff,
  beige: 0xf5f5dc,
  bisque: 0xffe4c4,
  black: 0x000000,
  blanchedalmond: 0xffebcd,
  blue: 0x0000ff,
  blueviolet: 0x8a2be2,
  brown: 0xa52a2a,
  burlywood: 0xdeb887,
  cadetblue: 0x5f9ea0,
  chartreuse: 0x7fff00,
  chocolate: 0xd2691e,
  coral: 0xff7f50,
  cornflowerblue: 0x6495ed,
  cornsilk: 0xfff8dc,
  crimson: 0xdc143c,
  cyan: 0x00ffff,
  darkblue: 0x00008b,
  darkcyan: 0x008b8b,
  darkgoldenrod: 0xb8860b,
  darkgray: 0xa9a9a9,
  darkgreen: 0x006400,
  darkgrey: 0xa9a9a9,
  darkkhaki: 0xbdb76b,
  darkmagenta: 0x8b008b,
  darkolivegreen: 0x556b2f,
  darkorange: 0xff8c00,
  darkorchid: 0x9932cc,
  darkred: 0x8b0000,
  darksalmon: 0xe9967a,
  darkseagreen: 0x8fbc8f,
  darkslateblue: 0x483d8b,
  darkslategray: 0x2f4f4f,
  darkslategrey: 0x2f4f4f,
  darkturquoise: 0x00ced1,
  darkviolet: 0x9400d3,
  deeppink: 0xff1493,
  deepskyblue: 0x00bfff,
  dimgray: 0x696969,
  dimgrey: 0x696969,
  dodgerblue: 0x1e90ff,
  firebrick: 0xb22222,
  floralwhite: 0xfffaf0,
  forestgreen: 0x228b22,
  fuchsia: 0xff00ff,
  gainsboro: 0xdcdcdc,
  ghostwhite: 0xf8f8ff,
  gold: 0xffd700,
  goldenrod: 0xdaa520,
  gray: 0x808080,
  green: 0x008000,
  greenyellow: 0xadff2f,
  grey: 0x808080,
  honeydew: 0xf0fff0,
  hotpink: 0xff69b4,
  indianred: 0xcd5c5c,
  indigo: 0x4b0082,
  ivory: 0xfffff0,
  khaki: 0xf0e68c,
  lavender: 0xe6e6fa,
  lavenderblush: 0xfff0f5,
  lawngreen: 0x7cfc00,
  lemonchiffon: 0xfffacd,
  lightblue: 0xadd8e6,
  lightcoral: 0xf08080,
  lightcyan: 0xe0ffff,
  lightgoldenrodyellow: 0xfafad2,
  lightgray: 0xd3d3d3,
  lightgreen: 0x90ee90,
  lightgrey: 0xd3d3d3,
  lightpink: 0xffb6c1,
  lightsalmon: 0xffa07a,
  lightseagreen: 0x20b2aa,
  lightskyblue: 0x87cefa,
  lightslategray: 0x778899,
  lightslategrey: 0x778899,
  lightsteelblue: 0xb0c4de,
  lightyellow: 0xffffe0,
  lime: 0x00ff00,
  limegreen: 0x32cd32,
  linen: 0xfaf0e6,
  magenta: 0xff00ff,
  maroon: 0x800000,
  mediumaquamarine: 0x66cdaa,
  mediumblue: 0x0000cd,
  mediumorchid: 0xba55d3,
  mediumpurple: 0x9370db,
  mediumseagreen: 0x3cb371,
  mediumslateblue: 0x7b68ee,
  mediumspringgreen: 0x00fa9a,
  mediumturquoise: 0x48d1cc,
  mediumvioletred: 0xc71585,
  midnightblue: 0x191970,
  mintcream: 0xf5fffa,
  mistyrose: 0xffe4e1,
  moccasin: 0xffe4b5,
  navajowhite: 0xffdead,
  navy: 0x000080,
  oldlace: 0xfdf5e6,
  olive: 0x808000,
  olivedrab: 0x6b8e23,
  orange: 0xffa500,
  orangered: 0xff4500,
  orchid: 0xda70d6,
  palegoldenrod: 0xeee8aa,
  palegreen: 0x98fb98,
  paleturquoise: 0xafeeee,
  palevioletred: 0xdb7093,
  papayawhip: 0xffefd5,
  peachpuff: 0xffdab9,
  peru: 0xcd853f,
  pink: 0xffc0cb,
  plum: 0xdda0dd,
  powderblue: 0xb0e0e6,
  purple: 0x800080,
  rebeccapurple: 0x663399,
  red: 0xff0000,
  rosybrown: 0xbc8f8f,
  royalblue: 0x4169e1,
  saddlebrown: 0x8b4513,
  salmon: 0xfa8072,
  sandybrown: 0xf4a460,
  seagreen: 0x2e8b57,
  seashell: 0xfff5ee,
  sienna: 0xa0522d,
  silver: 0xc0c0c0,
  skyblue: 0x87ceeb,
  slateblue: 0x6a5acd,
  slategray: 0x708090,
  slategrey: 0x708090,
  snow: 0xfffafa,
  springgreen: 0x00ff7f,
  steelblue: 0x4682b4,
  tan: 0xd2b48c,
  teal: 0x008080,
  thistle: 0xd8bfd8,
  tomato: 0xff6347,
  turquoise: 0x40e0d0,
  violet: 0xee82ee,
  wheat: 0xf5deb3,
  white: 0xffffff,
  whitesmoke: 0xf5f5f5,
  yellow: 0xffff00,
  yellowgreen: 0x9acd32
};

define(Color, color, {
  displayable: function() {
    return this.rgb().displayable();
  },
  toString: function() {
    return this.rgb() + "";
  }
});

function color(format) {
  var m;
  format = (format + "").trim().toLowerCase();
  return (m = reHex3.exec(format)) ? (m = parseInt(m[1], 16), new Rgb((m >> 8 & 0xf) | (m >> 4 & 0x0f0), (m >> 4 & 0xf) | (m & 0xf0), ((m & 0xf) << 4) | (m & 0xf), 1)) // #f00
      : (m = reHex6.exec(format)) ? rgbn(parseInt(m[1], 16)) // #ff0000
      : (m = reRgbInteger.exec(format)) ? new Rgb(m[1], m[2], m[3], 1) // rgb(255, 0, 0)
      : (m = reRgbPercent.exec(format)) ? new Rgb(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, 1) // rgb(100%, 0%, 0%)
      : (m = reRgbaInteger.exec(format)) ? rgba(m[1], m[2], m[3], m[4]) // rgba(255, 0, 0, 1)
      : (m = reRgbaPercent.exec(format)) ? rgba(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, m[4]) // rgb(100%, 0%, 0%, 1)
      : (m = reHslPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, 1) // hsl(120, 50%, 50%)
      : (m = reHslaPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, m[4]) // hsla(120, 50%, 50%, 1)
      : named.hasOwnProperty(format) ? rgbn(named[format])
      : format === "transparent" ? new Rgb(NaN, NaN, NaN, 0)
      : null;
}

function rgbn(n) {
  return new Rgb(n >> 16 & 0xff, n >> 8 & 0xff, n & 0xff, 1);
}

function rgba(r, g, b, a) {
  if (a <= 0) r = g = b = NaN;
  return new Rgb(r, g, b, a);
}

function rgbConvert(o) {
  if (!(o instanceof Color)) o = color(o);
  if (!o) return new Rgb;
  o = o.rgb();
  return new Rgb(o.r, o.g, o.b, o.opacity);
}

function rgb(r, g, b, opacity) {
  return arguments.length === 1 ? rgbConvert(r) : new Rgb(r, g, b, opacity == null ? 1 : opacity);
}

function Rgb(r, g, b, opacity) {
  this.r = +r;
  this.g = +g;
  this.b = +b;
  this.opacity = +opacity;
}

define(Rgb, rgb, extend(Color, {
  brighter: function(k) {
    k = k == null ? brighter : Math.pow(brighter, k);
    return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
  },
  darker: function(k) {
    k = k == null ? darker : Math.pow(darker, k);
    return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
  },
  rgb: function() {
    return this;
  },
  displayable: function() {
    return (0 <= this.r && this.r <= 255)
        && (0 <= this.g && this.g <= 255)
        && (0 <= this.b && this.b <= 255)
        && (0 <= this.opacity && this.opacity <= 1);
  },
  toString: function() {
    var a = this.opacity; a = isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
    return (a === 1 ? "rgb(" : "rgba(")
        + Math.max(0, Math.min(255, Math.round(this.r) || 0)) + ", "
        + Math.max(0, Math.min(255, Math.round(this.g) || 0)) + ", "
        + Math.max(0, Math.min(255, Math.round(this.b) || 0))
        + (a === 1 ? ")" : ", " + a + ")");
  }
}));

function hsla(h, s, l, a) {
  if (a <= 0) h = s = l = NaN;
  else if (l <= 0 || l >= 1) h = s = NaN;
  else if (s <= 0) h = NaN;
  return new Hsl(h, s, l, a);
}

function hslConvert(o) {
  if (o instanceof Hsl) return new Hsl(o.h, o.s, o.l, o.opacity);
  if (!(o instanceof Color)) o = color(o);
  if (!o) return new Hsl;
  if (o instanceof Hsl) return o;
  o = o.rgb();
  var r = o.r / 255,
      g = o.g / 255,
      b = o.b / 255,
      min = Math.min(r, g, b),
      max = Math.max(r, g, b),
      h = NaN,
      s = max - min,
      l = (max + min) / 2;
  if (s) {
    if (r === max) h = (g - b) / s + (g < b) * 6;
    else if (g === max) h = (b - r) / s + 2;
    else h = (r - g) / s + 4;
    s /= l < 0.5 ? max + min : 2 - max - min;
    h *= 60;
  } else {
    s = l > 0 && l < 1 ? 0 : h;
  }
  return new Hsl(h, s, l, o.opacity);
}

function hsl(h, s, l, opacity) {
  return arguments.length === 1 ? hslConvert(h) : new Hsl(h, s, l, opacity == null ? 1 : opacity);
}

function Hsl(h, s, l, opacity) {
  this.h = +h;
  this.s = +s;
  this.l = +l;
  this.opacity = +opacity;
}

define(Hsl, hsl, extend(Color, {
  brighter: function(k) {
    k = k == null ? brighter : Math.pow(brighter, k);
    return new Hsl(this.h, this.s, this.l * k, this.opacity);
  },
  darker: function(k) {
    k = k == null ? darker : Math.pow(darker, k);
    return new Hsl(this.h, this.s, this.l * k, this.opacity);
  },
  rgb: function() {
    var h = this.h % 360 + (this.h < 0) * 360,
        s = isNaN(h) || isNaN(this.s) ? 0 : this.s,
        l = this.l,
        m2 = l + (l < 0.5 ? l : 1 - l) * s,
        m1 = 2 * l - m2;
    return new Rgb(
      hsl2rgb(h >= 240 ? h - 240 : h + 120, m1, m2),
      hsl2rgb(h, m1, m2),
      hsl2rgb(h < 120 ? h + 240 : h - 120, m1, m2),
      this.opacity
    );
  },
  displayable: function() {
    return (0 <= this.s && this.s <= 1 || isNaN(this.s))
        && (0 <= this.l && this.l <= 1)
        && (0 <= this.opacity && this.opacity <= 1);
  }
}));

/* From FvD 13.37, CSS Color Module Level 3 */
function hsl2rgb(h, m1, m2) {
  return (h < 60 ? m1 + (m2 - m1) * h / 60
      : h < 180 ? m2
      : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60
      : m1) * 255;
}

var deg2rad = Math.PI / 180;
var rad2deg = 180 / Math.PI;

var Kn = 18;
var Xn = 0.950470;
var Yn = 1;
var Zn = 1.088830;
var t0 = 4 / 29;
var t1 = 6 / 29;
var t2 = 3 * t1 * t1;
var t3 = t1 * t1 * t1;

function labConvert(o) {
  if (o instanceof Lab) return new Lab(o.l, o.a, o.b, o.opacity);
  if (o instanceof Hcl) {
    var h = o.h * deg2rad;
    return new Lab(o.l, Math.cos(h) * o.c, Math.sin(h) * o.c, o.opacity);
  }
  if (!(o instanceof Rgb)) o = rgbConvert(o);
  var b = rgb2xyz(o.r),
      a = rgb2xyz(o.g),
      l = rgb2xyz(o.b),
      x = xyz2lab((0.4124564 * b + 0.3575761 * a + 0.1804375 * l) / Xn),
      y = xyz2lab((0.2126729 * b + 0.7151522 * a + 0.0721750 * l) / Yn),
      z = xyz2lab((0.0193339 * b + 0.1191920 * a + 0.9503041 * l) / Zn);
  return new Lab(116 * y - 16, 500 * (x - y), 200 * (y - z), o.opacity);
}

function lab(l, a, b, opacity) {
  return arguments.length === 1 ? labConvert(l) : new Lab(l, a, b, opacity == null ? 1 : opacity);
}

function Lab(l, a, b, opacity) {
  this.l = +l;
  this.a = +a;
  this.b = +b;
  this.opacity = +opacity;
}

define(Lab, lab, extend(Color, {
  brighter: function(k) {
    return new Lab(this.l + Kn * (k == null ? 1 : k), this.a, this.b, this.opacity);
  },
  darker: function(k) {
    return new Lab(this.l - Kn * (k == null ? 1 : k), this.a, this.b, this.opacity);
  },
  rgb: function() {
    var y = (this.l + 16) / 116,
        x = isNaN(this.a) ? y : y + this.a / 500,
        z = isNaN(this.b) ? y : y - this.b / 200;
    y = Yn * lab2xyz(y);
    x = Xn * lab2xyz(x);
    z = Zn * lab2xyz(z);
    return new Rgb(
      xyz2rgb( 3.2404542 * x - 1.5371385 * y - 0.4985314 * z), // D65 -> sRGB
      xyz2rgb(-0.9692660 * x + 1.8760108 * y + 0.0415560 * z),
      xyz2rgb( 0.0556434 * x - 0.2040259 * y + 1.0572252 * z),
      this.opacity
    );
  }
}));

function xyz2lab(t) {
  return t > t3 ? Math.pow(t, 1 / 3) : t / t2 + t0;
}

function lab2xyz(t) {
  return t > t1 ? t * t * t : t2 * (t - t0);
}

function xyz2rgb(x) {
  return 255 * (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055);
}

function rgb2xyz(x) {
  return (x /= 255) <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
}

function hclConvert(o) {
  if (o instanceof Hcl) return new Hcl(o.h, o.c, o.l, o.opacity);
  if (!(o instanceof Lab)) o = labConvert(o);
  var h = Math.atan2(o.b, o.a) * rad2deg;
  return new Hcl(h < 0 ? h + 360 : h, Math.sqrt(o.a * o.a + o.b * o.b), o.l, o.opacity);
}

function hcl(h, c, l, opacity) {
  return arguments.length === 1 ? hclConvert(h) : new Hcl(h, c, l, opacity == null ? 1 : opacity);
}

function Hcl(h, c, l, opacity) {
  this.h = +h;
  this.c = +c;
  this.l = +l;
  this.opacity = +opacity;
}

define(Hcl, hcl, extend(Color, {
  brighter: function(k) {
    return new Hcl(this.h, this.c, this.l + Kn * (k == null ? 1 : k), this.opacity);
  },
  darker: function(k) {
    return new Hcl(this.h, this.c, this.l - Kn * (k == null ? 1 : k), this.opacity);
  },
  rgb: function() {
    return labConvert(this).rgb();
  }
}));

var A = -0.14861;
var B = +1.78277;
var C = -0.29227;
var D = -0.90649;
var E = +1.97294;
var ED = E * D;
var EB = E * B;
var BC_DA = B * C - D * A;

function cubehelixConvert(o) {
  if (o instanceof Cubehelix) return new Cubehelix(o.h, o.s, o.l, o.opacity);
  if (!(o instanceof Rgb)) o = rgbConvert(o);
  var r = o.r / 255,
      g = o.g / 255,
      b = o.b / 255,
      l = (BC_DA * b + ED * r - EB * g) / (BC_DA + ED - EB),
      bl = b - l,
      k = (E * (g - l) - C * bl) / D,
      s = Math.sqrt(k * k + bl * bl) / (E * l * (1 - l)), // NaN if l=0 or l=1
      h = s ? Math.atan2(k, bl) * rad2deg - 120 : NaN;
  return new Cubehelix(h < 0 ? h + 360 : h, s, l, o.opacity);
}

function cubehelix(h, s, l, opacity) {
  return arguments.length === 1 ? cubehelixConvert(h) : new Cubehelix(h, s, l, opacity == null ? 1 : opacity);
}

function Cubehelix(h, s, l, opacity) {
  this.h = +h;
  this.s = +s;
  this.l = +l;
  this.opacity = +opacity;
}

define(Cubehelix, cubehelix, extend(Color, {
  brighter: function(k) {
    k = k == null ? brighter : Math.pow(brighter, k);
    return new Cubehelix(this.h, this.s, this.l * k, this.opacity);
  },
  darker: function(k) {
    k = k == null ? darker : Math.pow(darker, k);
    return new Cubehelix(this.h, this.s, this.l * k, this.opacity);
  },
  rgb: function() {
    var h = isNaN(this.h) ? 0 : (this.h + 120) * deg2rad,
        l = +this.l,
        a = isNaN(this.s) ? 0 : this.s * l * (1 - l),
        cosh = Math.cos(h),
        sinh = Math.sin(h);
    return new Rgb(
      255 * (l + a * (A * cosh + B * sinh)),
      255 * (l + a * (C * cosh + D * sinh)),
      255 * (l + a * (E * cosh)),
      this.opacity
    );
  }
}));

exports.color = color;
exports.rgb = rgb;
exports.hsl = hsl;
exports.lab = lab;
exports.hcl = hcl;
exports.cubehelix = cubehelix;

Object.defineProperty(exports, '__esModule', { value: true });

})));

},{}],4:[function(require,module,exports){
// https://d3js.org/d3-format/ Version 1.0.2. Copyright 2016 Mike Bostock.
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.d3 = global.d3 || {})));
}(this, function (exports) { 'use strict';

  // Computes the decimal coefficient and exponent of the specified number x with
  // significant digits p, where x is positive and p is in [1, 21] or undefined.
  // For example, formatDecimal(1.23) returns ["123", 0].
  function formatDecimal(x, p) {
    if ((i = (x = p ? x.toExponential(p - 1) : x.toExponential()).indexOf("e")) < 0) return null; // NaN, ±Infinity
    var i, coefficient = x.slice(0, i);

    // The string returned by toExponential either has the form \d\.\d+e[-+]\d+
    // (e.g., 1.2e+3) or the form \de[-+]\d+ (e.g., 1e+3).
    return [
      coefficient.length > 1 ? coefficient[0] + coefficient.slice(2) : coefficient,
      +x.slice(i + 1)
    ];
  }

  function exponent(x) {
    return x = formatDecimal(Math.abs(x)), x ? x[1] : NaN;
  }

  function formatGroup(grouping, thousands) {
    return function(value, width) {
      var i = value.length,
          t = [],
          j = 0,
          g = grouping[0],
          length = 0;

      while (i > 0 && g > 0) {
        if (length + g + 1 > width) g = Math.max(1, width - length);
        t.push(value.substring(i -= g, i + g));
        if ((length += g + 1) > width) break;
        g = grouping[j = (j + 1) % grouping.length];
      }

      return t.reverse().join(thousands);
    };
  }

  function formatDefault(x, p) {
    x = x.toPrecision(p);

    out: for (var n = x.length, i = 1, i0 = -1, i1; i < n; ++i) {
      switch (x[i]) {
        case ".": i0 = i1 = i; break;
        case "0": if (i0 === 0) i0 = i; i1 = i; break;
        case "e": break out;
        default: if (i0 > 0) i0 = 0; break;
      }
    }

    return i0 > 0 ? x.slice(0, i0) + x.slice(i1 + 1) : x;
  }

  var prefixExponent;

  function formatPrefixAuto(x, p) {
    var d = formatDecimal(x, p);
    if (!d) return x + "";
    var coefficient = d[0],
        exponent = d[1],
        i = exponent - (prefixExponent = Math.max(-8, Math.min(8, Math.floor(exponent / 3))) * 3) + 1,
        n = coefficient.length;
    return i === n ? coefficient
        : i > n ? coefficient + new Array(i - n + 1).join("0")
        : i > 0 ? coefficient.slice(0, i) + "." + coefficient.slice(i)
        : "0." + new Array(1 - i).join("0") + formatDecimal(x, Math.max(0, p + i - 1))[0]; // less than 1y!
  }

  function formatRounded(x, p) {
    var d = formatDecimal(x, p);
    if (!d) return x + "";
    var coefficient = d[0],
        exponent = d[1];
    return exponent < 0 ? "0." + new Array(-exponent).join("0") + coefficient
        : coefficient.length > exponent + 1 ? coefficient.slice(0, exponent + 1) + "." + coefficient.slice(exponent + 1)
        : coefficient + new Array(exponent - coefficient.length + 2).join("0");
  }

  var formatTypes = {
    "": formatDefault,
    "%": function(x, p) { return (x * 100).toFixed(p); },
    "b": function(x) { return Math.round(x).toString(2); },
    "c": function(x) { return x + ""; },
    "d": function(x) { return Math.round(x).toString(10); },
    "e": function(x, p) { return x.toExponential(p); },
    "f": function(x, p) { return x.toFixed(p); },
    "g": function(x, p) { return x.toPrecision(p); },
    "o": function(x) { return Math.round(x).toString(8); },
    "p": function(x, p) { return formatRounded(x * 100, p); },
    "r": formatRounded,
    "s": formatPrefixAuto,
    "X": function(x) { return Math.round(x).toString(16).toUpperCase(); },
    "x": function(x) { return Math.round(x).toString(16); }
  };

  // [[fill]align][sign][symbol][0][width][,][.precision][type]
  var re = /^(?:(.)?([<>=^]))?([+\-\( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?([a-z%])?$/i;

  function formatSpecifier(specifier) {
    return new FormatSpecifier(specifier);
  }

  function FormatSpecifier(specifier) {
    if (!(match = re.exec(specifier))) throw new Error("invalid format: " + specifier);

    var match,
        fill = match[1] || " ",
        align = match[2] || ">",
        sign = match[3] || "-",
        symbol = match[4] || "",
        zero = !!match[5],
        width = match[6] && +match[6],
        comma = !!match[7],
        precision = match[8] && +match[8].slice(1),
        type = match[9] || "";

    // The "n" type is an alias for ",g".
    if (type === "n") comma = true, type = "g";

    // Map invalid types to the default format.
    else if (!formatTypes[type]) type = "";

    // If zero fill is specified, padding goes after sign and before digits.
    if (zero || (fill === "0" && align === "=")) zero = true, fill = "0", align = "=";

    this.fill = fill;
    this.align = align;
    this.sign = sign;
    this.symbol = symbol;
    this.zero = zero;
    this.width = width;
    this.comma = comma;
    this.precision = precision;
    this.type = type;
  }

  FormatSpecifier.prototype.toString = function() {
    return this.fill
        + this.align
        + this.sign
        + this.symbol
        + (this.zero ? "0" : "")
        + (this.width == null ? "" : Math.max(1, this.width | 0))
        + (this.comma ? "," : "")
        + (this.precision == null ? "" : "." + Math.max(0, this.precision | 0))
        + this.type;
  };

  var prefixes = ["y","z","a","f","p","n","µ","m","","k","M","G","T","P","E","Z","Y"];

  function identity(x) {
    return x;
  }

  function formatLocale(locale) {
    var group = locale.grouping && locale.thousands ? formatGroup(locale.grouping, locale.thousands) : identity,
        currency = locale.currency,
        decimal = locale.decimal;

    function newFormat(specifier) {
      specifier = formatSpecifier(specifier);

      var fill = specifier.fill,
          align = specifier.align,
          sign = specifier.sign,
          symbol = specifier.symbol,
          zero = specifier.zero,
          width = specifier.width,
          comma = specifier.comma,
          precision = specifier.precision,
          type = specifier.type;

      // Compute the prefix and suffix.
      // For SI-prefix, the suffix is lazily computed.
      var prefix = symbol === "$" ? currency[0] : symbol === "#" && /[boxX]/.test(type) ? "0" + type.toLowerCase() : "",
          suffix = symbol === "$" ? currency[1] : /[%p]/.test(type) ? "%" : "";

      // What format function should we use?
      // Is this an integer type?
      // Can this type generate exponential notation?
      var formatType = formatTypes[type],
          maybeSuffix = !type || /[defgprs%]/.test(type);

      // Set the default precision if not specified,
      // or clamp the specified precision to the supported range.
      // For significant precision, it must be in [1, 21].
      // For fixed precision, it must be in [0, 20].
      precision = precision == null ? (type ? 6 : 12)
          : /[gprs]/.test(type) ? Math.max(1, Math.min(21, precision))
          : Math.max(0, Math.min(20, precision));

      function format(value) {
        var valuePrefix = prefix,
            valueSuffix = suffix,
            i, n, c;

        if (type === "c") {
          valueSuffix = formatType(value) + valueSuffix;
          value = "";
        } else {
          value = +value;

          // Convert negative to positive, and compute the prefix.
          // Note that -0 is not less than 0, but 1 / -0 is!
          var valueNegative = (value < 0 || 1 / value < 0) && (value *= -1, true);

          // Perform the initial formatting.
          value = formatType(value, precision);

          // If the original value was negative, it may be rounded to zero during
          // formatting; treat this as (positive) zero.
          if (valueNegative) {
            i = -1, n = value.length;
            valueNegative = false;
            while (++i < n) {
              if (c = value.charCodeAt(i), (48 < c && c < 58)
                  || (type === "x" && 96 < c && c < 103)
                  || (type === "X" && 64 < c && c < 71)) {
                valueNegative = true;
                break;
              }
            }
          }

          // Compute the prefix and suffix.
          valuePrefix = (valueNegative ? (sign === "(" ? sign : "-") : sign === "-" || sign === "(" ? "" : sign) + valuePrefix;
          valueSuffix = valueSuffix + (type === "s" ? prefixes[8 + prefixExponent / 3] : "") + (valueNegative && sign === "(" ? ")" : "");

          // Break the formatted value into the integer “value” part that can be
          // grouped, and fractional or exponential “suffix” part that is not.
          if (maybeSuffix) {
            i = -1, n = value.length;
            while (++i < n) {
              if (c = value.charCodeAt(i), 48 > c || c > 57) {
                valueSuffix = (c === 46 ? decimal + value.slice(i + 1) : value.slice(i)) + valueSuffix;
                value = value.slice(0, i);
                break;
              }
            }
          }
        }

        // If the fill character is not "0", grouping is applied before padding.
        if (comma && !zero) value = group(value, Infinity);

        // Compute the padding.
        var length = valuePrefix.length + value.length + valueSuffix.length,
            padding = length < width ? new Array(width - length + 1).join(fill) : "";

        // If the fill character is "0", grouping is applied after padding.
        if (comma && zero) value = group(padding + value, padding.length ? width - valueSuffix.length : Infinity), padding = "";

        // Reconstruct the final output based on the desired alignment.
        switch (align) {
          case "<": return valuePrefix + value + valueSuffix + padding;
          case "=": return valuePrefix + padding + value + valueSuffix;
          case "^": return padding.slice(0, length = padding.length >> 1) + valuePrefix + value + valueSuffix + padding.slice(length);
        }
        return padding + valuePrefix + value + valueSuffix;
      }

      format.toString = function() {
        return specifier + "";
      };

      return format;
    }

    function formatPrefix(specifier, value) {
      var f = newFormat((specifier = formatSpecifier(specifier), specifier.type = "f", specifier)),
          e = Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3,
          k = Math.pow(10, -e),
          prefix = prefixes[8 + e / 3];
      return function(value) {
        return f(k * value) + prefix;
      };
    }

    return {
      format: newFormat,
      formatPrefix: formatPrefix
    };
  }

  var locale;
  defaultLocale({
    decimal: ".",
    thousands: ",",
    grouping: [3],
    currency: ["$", ""]
  });

  function defaultLocale(definition) {
    locale = formatLocale(definition);
    exports.format = locale.format;
    exports.formatPrefix = locale.formatPrefix;
    return locale;
  }

  function precisionFixed(step) {
    return Math.max(0, -exponent(Math.abs(step)));
  }

  function precisionPrefix(step, value) {
    return Math.max(0, Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3 - exponent(Math.abs(step)));
  }

  function precisionRound(step, max) {
    step = Math.abs(step), max = Math.abs(max) - step;
    return Math.max(0, exponent(max) - exponent(step)) + 1;
  }

  exports.formatDefaultLocale = defaultLocale;
  exports.formatLocale = formatLocale;
  exports.formatSpecifier = formatSpecifier;
  exports.precisionFixed = precisionFixed;
  exports.precisionPrefix = precisionPrefix;
  exports.precisionRound = precisionRound;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
},{}],5:[function(require,module,exports){
// https://d3js.org/d3-geo/ Version 1.4.0. Copyright 2016 Mike Bostock.
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('d3-array')) :
  typeof define === 'function' && define.amd ? define(['exports', 'd3-array'], factory) :
  (factory((global.d3 = global.d3 || {}),global.d3));
}(this, (function (exports,d3Array) { 'use strict';

// Adds floating point numbers with twice the normal precision.
// Reference: J. R. Shewchuk, Adaptive Precision Floating-Point Arithmetic and
// Fast Robust Geometric Predicates, Discrete & Computational Geometry 18(3)
// 305–363 (1997).
// Code adapted from GeographicLib by Charles F. F. Karney,
// http://geographiclib.sourceforge.net/

var adder = function() {
  return new Adder;
};

function Adder() {
  this.reset();
}

Adder.prototype = {
  constructor: Adder,
  reset: function() {
    this.s = // rounded value
    this.t = 0; // exact error
  },
  add: function(y) {
    add(temp, y, this.t);
    add(this, temp.s, this.s);
    if (this.s) this.t += temp.t;
    else this.s = temp.t;
  },
  valueOf: function() {
    return this.s;
  }
};

var temp = new Adder;

function add(adder, a, b) {
  var x = adder.s = a + b,
      bv = x - a,
      av = x - bv;
  adder.t = (a - av) + (b - bv);
}

var epsilon = 1e-6;
var epsilon2 = 1e-12;
var pi = Math.PI;
var halfPi = pi / 2;
var quarterPi = pi / 4;
var tau = pi * 2;

var degrees = 180 / pi;
var radians = pi / 180;

var abs = Math.abs;
var atan = Math.atan;
var atan2 = Math.atan2;
var cos = Math.cos;
var ceil = Math.ceil;
var exp = Math.exp;

var log = Math.log;
var pow = Math.pow;
var sin = Math.sin;
var sign = Math.sign || function(x) { return x > 0 ? 1 : x < 0 ? -1 : 0; };
var sqrt = Math.sqrt;
var tan = Math.tan;

function acos(x) {
  return x > 1 ? 0 : x < -1 ? pi : Math.acos(x);
}

function asin(x) {
  return x > 1 ? halfPi : x < -1 ? -halfPi : Math.asin(x);
}

function haversin(x) {
  return (x = sin(x / 2)) * x;
}

function noop() {}

function streamGeometry(geometry, stream) {
  if (geometry && streamGeometryType.hasOwnProperty(geometry.type)) {
    streamGeometryType[geometry.type](geometry, stream);
  }
}

var streamObjectType = {
  Feature: function(feature, stream) {
    streamGeometry(feature.geometry, stream);
  },
  FeatureCollection: function(object, stream) {
    var features = object.features, i = -1, n = features.length;
    while (++i < n) streamGeometry(features[i].geometry, stream);
  }
};

var streamGeometryType = {
  Sphere: function(object, stream) {
    stream.sphere();
  },
  Point: function(object, stream) {
    object = object.coordinates;
    stream.point(object[0], object[1], object[2]);
  },
  MultiPoint: function(object, stream) {
    var coordinates = object.coordinates, i = -1, n = coordinates.length;
    while (++i < n) object = coordinates[i], stream.point(object[0], object[1], object[2]);
  },
  LineString: function(object, stream) {
    streamLine(object.coordinates, stream, 0);
  },
  MultiLineString: function(object, stream) {
    var coordinates = object.coordinates, i = -1, n = coordinates.length;
    while (++i < n) streamLine(coordinates[i], stream, 0);
  },
  Polygon: function(object, stream) {
    streamPolygon(object.coordinates, stream);
  },
  MultiPolygon: function(object, stream) {
    var coordinates = object.coordinates, i = -1, n = coordinates.length;
    while (++i < n) streamPolygon(coordinates[i], stream);
  },
  GeometryCollection: function(object, stream) {
    var geometries = object.geometries, i = -1, n = geometries.length;
    while (++i < n) streamGeometry(geometries[i], stream);
  }
};

function streamLine(coordinates, stream, closed) {
  var i = -1, n = coordinates.length - closed, coordinate;
  stream.lineStart();
  while (++i < n) coordinate = coordinates[i], stream.point(coordinate[0], coordinate[1], coordinate[2]);
  stream.lineEnd();
}

function streamPolygon(coordinates, stream) {
  var i = -1, n = coordinates.length;
  stream.polygonStart();
  while (++i < n) streamLine(coordinates[i], stream, 1);
  stream.polygonEnd();
}

var geoStream = function(object, stream) {
  if (object && streamObjectType.hasOwnProperty(object.type)) {
    streamObjectType[object.type](object, stream);
  } else {
    streamGeometry(object, stream);
  }
};

var areaRingSum = adder();

var areaSum = adder();
var lambda00;
var phi00;
var lambda0;
var cosPhi0;
var sinPhi0;

var areaStream = {
  point: noop,
  lineStart: noop,
  lineEnd: noop,
  polygonStart: function() {
    areaRingSum.reset();
    areaStream.lineStart = areaRingStart;
    areaStream.lineEnd = areaRingEnd;
  },
  polygonEnd: function() {
    var areaRing = +areaRingSum;
    areaSum.add(areaRing < 0 ? tau + areaRing : areaRing);
    this.lineStart = this.lineEnd = this.point = noop;
  },
  sphere: function() {
    areaSum.add(tau);
  }
};

function areaRingStart() {
  areaStream.point = areaPointFirst;
}

function areaRingEnd() {
  areaPoint(lambda00, phi00);
}

function areaPointFirst(lambda, phi) {
  areaStream.point = areaPoint;
  lambda00 = lambda, phi00 = phi;
  lambda *= radians, phi *= radians;
  lambda0 = lambda, cosPhi0 = cos(phi = phi / 2 + quarterPi), sinPhi0 = sin(phi);
}

function areaPoint(lambda, phi) {
  lambda *= radians, phi *= radians;
  phi = phi / 2 + quarterPi; // half the angular distance from south pole

  // Spherical excess E for a spherical triangle with vertices: south pole,
  // previous point, current point.  Uses a formula derived from Cagnoli’s
  // theorem.  See Todhunter, Spherical Trig. (1871), Sec. 103, Eq. (2).
  var dLambda = lambda - lambda0,
      sdLambda = dLambda >= 0 ? 1 : -1,
      adLambda = sdLambda * dLambda,
      cosPhi = cos(phi),
      sinPhi = sin(phi),
      k = sinPhi0 * sinPhi,
      u = cosPhi0 * cosPhi + k * cos(adLambda),
      v = k * sdLambda * sin(adLambda);
  areaRingSum.add(atan2(v, u));

  // Advance the previous points.
  lambda0 = lambda, cosPhi0 = cosPhi, sinPhi0 = sinPhi;
}

var area = function(object) {
  areaSum.reset();
  geoStream(object, areaStream);
  return areaSum * 2;
};

function spherical(cartesian) {
  return [atan2(cartesian[1], cartesian[0]), asin(cartesian[2])];
}

function cartesian(spherical) {
  var lambda = spherical[0], phi = spherical[1], cosPhi = cos(phi);
  return [cosPhi * cos(lambda), cosPhi * sin(lambda), sin(phi)];
}

function cartesianDot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function cartesianCross(a, b) {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

// TODO return a
function cartesianAddInPlace(a, b) {
  a[0] += b[0], a[1] += b[1], a[2] += b[2];
}

function cartesianScale(vector, k) {
  return [vector[0] * k, vector[1] * k, vector[2] * k];
}

// TODO return d
function cartesianNormalizeInPlace(d) {
  var l = sqrt(d[0] * d[0] + d[1] * d[1] + d[2] * d[2]);
  d[0] /= l, d[1] /= l, d[2] /= l;
}

var lambda0$1;
var phi0;
var lambda1;
var phi1;
var lambda2;
var lambda00$1;
var phi00$1;
var p0;
var deltaSum = adder();
var ranges;
var range$1;

var boundsStream = {
  point: boundsPoint,
  lineStart: boundsLineStart,
  lineEnd: boundsLineEnd,
  polygonStart: function() {
    boundsStream.point = boundsRingPoint;
    boundsStream.lineStart = boundsRingStart;
    boundsStream.lineEnd = boundsRingEnd;
    deltaSum.reset();
    areaStream.polygonStart();
  },
  polygonEnd: function() {
    areaStream.polygonEnd();
    boundsStream.point = boundsPoint;
    boundsStream.lineStart = boundsLineStart;
    boundsStream.lineEnd = boundsLineEnd;
    if (areaRingSum < 0) lambda0$1 = -(lambda1 = 180), phi0 = -(phi1 = 90);
    else if (deltaSum > epsilon) phi1 = 90;
    else if (deltaSum < -epsilon) phi0 = -90;
    range$1[0] = lambda0$1, range$1[1] = lambda1;
  }
};

function boundsPoint(lambda, phi) {
  ranges.push(range$1 = [lambda0$1 = lambda, lambda1 = lambda]);
  if (phi < phi0) phi0 = phi;
  if (phi > phi1) phi1 = phi;
}

function linePoint(lambda, phi) {
  var p = cartesian([lambda * radians, phi * radians]);
  if (p0) {
    var normal = cartesianCross(p0, p),
        equatorial = [normal[1], -normal[0], 0],
        inflection = cartesianCross(equatorial, normal);
    cartesianNormalizeInPlace(inflection);
    inflection = spherical(inflection);
    var delta = lambda - lambda2,
        sign$$1 = delta > 0 ? 1 : -1,
        lambdai = inflection[0] * degrees * sign$$1,
        phii,
        antimeridian = abs(delta) > 180;
    if (antimeridian ^ (sign$$1 * lambda2 < lambdai && lambdai < sign$$1 * lambda)) {
      phii = inflection[1] * degrees;
      if (phii > phi1) phi1 = phii;
    } else if (lambdai = (lambdai + 360) % 360 - 180, antimeridian ^ (sign$$1 * lambda2 < lambdai && lambdai < sign$$1 * lambda)) {
      phii = -inflection[1] * degrees;
      if (phii < phi0) phi0 = phii;
    } else {
      if (phi < phi0) phi0 = phi;
      if (phi > phi1) phi1 = phi;
    }
    if (antimeridian) {
      if (lambda < lambda2) {
        if (angle(lambda0$1, lambda) > angle(lambda0$1, lambda1)) lambda1 = lambda;
      } else {
        if (angle(lambda, lambda1) > angle(lambda0$1, lambda1)) lambda0$1 = lambda;
      }
    } else {
      if (lambda1 >= lambda0$1) {
        if (lambda < lambda0$1) lambda0$1 = lambda;
        if (lambda > lambda1) lambda1 = lambda;
      } else {
        if (lambda > lambda2) {
          if (angle(lambda0$1, lambda) > angle(lambda0$1, lambda1)) lambda1 = lambda;
        } else {
          if (angle(lambda, lambda1) > angle(lambda0$1, lambda1)) lambda0$1 = lambda;
        }
      }
    }
  } else {
    boundsPoint(lambda, phi);
  }
  p0 = p, lambda2 = lambda;
}

function boundsLineStart() {
  boundsStream.point = linePoint;
}

function boundsLineEnd() {
  range$1[0] = lambda0$1, range$1[1] = lambda1;
  boundsStream.point = boundsPoint;
  p0 = null;
}

function boundsRingPoint(lambda, phi) {
  if (p0) {
    var delta = lambda - lambda2;
    deltaSum.add(abs(delta) > 180 ? delta + (delta > 0 ? 360 : -360) : delta);
  } else {
    lambda00$1 = lambda, phi00$1 = phi;
  }
  areaStream.point(lambda, phi);
  linePoint(lambda, phi);
}

function boundsRingStart() {
  areaStream.lineStart();
}

function boundsRingEnd() {
  boundsRingPoint(lambda00$1, phi00$1);
  areaStream.lineEnd();
  if (abs(deltaSum) > epsilon) lambda0$1 = -(lambda1 = 180);
  range$1[0] = lambda0$1, range$1[1] = lambda1;
  p0 = null;
}

// Finds the left-right distance between two longitudes.
// This is almost the same as (lambda1 - lambda0 + 360°) % 360°, except that we want
// the distance between ±180° to be 360°.
function angle(lambda0, lambda1) {
  return (lambda1 -= lambda0) < 0 ? lambda1 + 360 : lambda1;
}

function rangeCompare(a, b) {
  return a[0] - b[0];
}

function rangeContains(range$$1, x) {
  return range$$1[0] <= range$$1[1] ? range$$1[0] <= x && x <= range$$1[1] : x < range$$1[0] || range$$1[1] < x;
}

var bounds = function(feature) {
  var i, n, a, b, merged, deltaMax, delta;

  phi1 = lambda1 = -(lambda0$1 = phi0 = Infinity);
  ranges = [];
  geoStream(feature, boundsStream);

  // First, sort ranges by their minimum longitudes.
  if (n = ranges.length) {
    ranges.sort(rangeCompare);

    // Then, merge any ranges that overlap.
    for (i = 1, a = ranges[0], merged = [a]; i < n; ++i) {
      b = ranges[i];
      if (rangeContains(a, b[0]) || rangeContains(a, b[1])) {
        if (angle(a[0], b[1]) > angle(a[0], a[1])) a[1] = b[1];
        if (angle(b[0], a[1]) > angle(a[0], a[1])) a[0] = b[0];
      } else {
        merged.push(a = b);
      }
    }

    // Finally, find the largest gap between the merged ranges.
    // The final bounding box will be the inverse of this gap.
    for (deltaMax = -Infinity, n = merged.length - 1, i = 0, a = merged[n]; i <= n; a = b, ++i) {
      b = merged[i];
      if ((delta = angle(a[1], b[0])) > deltaMax) deltaMax = delta, lambda0$1 = b[0], lambda1 = a[1];
    }
  }

  ranges = range$1 = null;

  return lambda0$1 === Infinity || phi0 === Infinity
      ? [[NaN, NaN], [NaN, NaN]]
      : [[lambda0$1, phi0], [lambda1, phi1]];
};

var W0;
var W1;
var X0;
var Y0;
var Z0;
var X1;
var Y1;
var Z1;
var X2;
var Y2;
var Z2;
var lambda00$2;
var phi00$2;
var x0;
var y0;
var z0; // previous point

var centroidStream = {
  sphere: noop,
  point: centroidPoint,
  lineStart: centroidLineStart,
  lineEnd: centroidLineEnd,
  polygonStart: function() {
    centroidStream.lineStart = centroidRingStart;
    centroidStream.lineEnd = centroidRingEnd;
  },
  polygonEnd: function() {
    centroidStream.lineStart = centroidLineStart;
    centroidStream.lineEnd = centroidLineEnd;
  }
};

// Arithmetic mean of Cartesian vectors.
function centroidPoint(lambda, phi) {
  lambda *= radians, phi *= radians;
  var cosPhi = cos(phi);
  centroidPointCartesian(cosPhi * cos(lambda), cosPhi * sin(lambda), sin(phi));
}

function centroidPointCartesian(x, y, z) {
  ++W0;
  X0 += (x - X0) / W0;
  Y0 += (y - Y0) / W0;
  Z0 += (z - Z0) / W0;
}

function centroidLineStart() {
  centroidStream.point = centroidLinePointFirst;
}

function centroidLinePointFirst(lambda, phi) {
  lambda *= radians, phi *= radians;
  var cosPhi = cos(phi);
  x0 = cosPhi * cos(lambda);
  y0 = cosPhi * sin(lambda);
  z0 = sin(phi);
  centroidStream.point = centroidLinePoint;
  centroidPointCartesian(x0, y0, z0);
}

function centroidLinePoint(lambda, phi) {
  lambda *= radians, phi *= radians;
  var cosPhi = cos(phi),
      x = cosPhi * cos(lambda),
      y = cosPhi * sin(lambda),
      z = sin(phi),
      w = atan2(sqrt((w = y0 * z - z0 * y) * w + (w = z0 * x - x0 * z) * w + (w = x0 * y - y0 * x) * w), x0 * x + y0 * y + z0 * z);
  W1 += w;
  X1 += w * (x0 + (x0 = x));
  Y1 += w * (y0 + (y0 = y));
  Z1 += w * (z0 + (z0 = z));
  centroidPointCartesian(x0, y0, z0);
}

function centroidLineEnd() {
  centroidStream.point = centroidPoint;
}

// See J. E. Brock, The Inertia Tensor for a Spherical Triangle,
// J. Applied Mechanics 42, 239 (1975).
function centroidRingStart() {
  centroidStream.point = centroidRingPointFirst;
}

function centroidRingEnd() {
  centroidRingPoint(lambda00$2, phi00$2);
  centroidStream.point = centroidPoint;
}

function centroidRingPointFirst(lambda, phi) {
  lambda00$2 = lambda, phi00$2 = phi;
  lambda *= radians, phi *= radians;
  centroidStream.point = centroidRingPoint;
  var cosPhi = cos(phi);
  x0 = cosPhi * cos(lambda);
  y0 = cosPhi * sin(lambda);
  z0 = sin(phi);
  centroidPointCartesian(x0, y0, z0);
}

function centroidRingPoint(lambda, phi) {
  lambda *= radians, phi *= radians;
  var cosPhi = cos(phi),
      x = cosPhi * cos(lambda),
      y = cosPhi * sin(lambda),
      z = sin(phi),
      cx = y0 * z - z0 * y,
      cy = z0 * x - x0 * z,
      cz = x0 * y - y0 * x,
      m = sqrt(cx * cx + cy * cy + cz * cz),
      u = x0 * x + y0 * y + z0 * z,
      v = m && -acos(u) / m, // area weight
      w = atan2(m, u); // line weight
  X2 += v * cx;
  Y2 += v * cy;
  Z2 += v * cz;
  W1 += w;
  X1 += w * (x0 + (x0 = x));
  Y1 += w * (y0 + (y0 = y));
  Z1 += w * (z0 + (z0 = z));
  centroidPointCartesian(x0, y0, z0);
}

var centroid = function(object) {
  W0 = W1 =
  X0 = Y0 = Z0 =
  X1 = Y1 = Z1 =
  X2 = Y2 = Z2 = 0;
  geoStream(object, centroidStream);

  var x = X2,
      y = Y2,
      z = Z2,
      m = x * x + y * y + z * z;

  // If the area-weighted ccentroid is undefined, fall back to length-weighted ccentroid.
  if (m < epsilon2) {
    x = X1, y = Y1, z = Z1;
    // If the feature has zero length, fall back to arithmetic mean of point vectors.
    if (W1 < epsilon) x = X0, y = Y0, z = Z0;
    m = x * x + y * y + z * z;
    // If the feature still has an undefined ccentroid, then return.
    if (m < epsilon2) return [NaN, NaN];
  }

  return [atan2(y, x) * degrees, asin(z / sqrt(m)) * degrees];
};

var constant = function(x) {
  return function() {
    return x;
  };
};

var compose = function(a, b) {

  function compose(x, y) {
    return x = a(x, y), b(x[0], x[1]);
  }

  if (a.invert && b.invert) compose.invert = function(x, y) {
    return x = b.invert(x, y), x && a.invert(x[0], x[1]);
  };

  return compose;
};

function rotationIdentity(lambda, phi) {
  return [lambda > pi ? lambda - tau : lambda < -pi ? lambda + tau : lambda, phi];
}

rotationIdentity.invert = rotationIdentity;

function rotateRadians(deltaLambda, deltaPhi, deltaGamma) {
  return (deltaLambda %= tau) ? (deltaPhi || deltaGamma ? compose(rotationLambda(deltaLambda), rotationPhiGamma(deltaPhi, deltaGamma))
    : rotationLambda(deltaLambda))
    : (deltaPhi || deltaGamma ? rotationPhiGamma(deltaPhi, deltaGamma)
    : rotationIdentity);
}

function forwardRotationLambda(deltaLambda) {
  return function(lambda, phi) {
    return lambda += deltaLambda, [lambda > pi ? lambda - tau : lambda < -pi ? lambda + tau : lambda, phi];
  };
}

function rotationLambda(deltaLambda) {
  var rotation = forwardRotationLambda(deltaLambda);
  rotation.invert = forwardRotationLambda(-deltaLambda);
  return rotation;
}

function rotationPhiGamma(deltaPhi, deltaGamma) {
  var cosDeltaPhi = cos(deltaPhi),
      sinDeltaPhi = sin(deltaPhi),
      cosDeltaGamma = cos(deltaGamma),
      sinDeltaGamma = sin(deltaGamma);

  function rotation(lambda, phi) {
    var cosPhi = cos(phi),
        x = cos(lambda) * cosPhi,
        y = sin(lambda) * cosPhi,
        z = sin(phi),
        k = z * cosDeltaPhi + x * sinDeltaPhi;
    return [
      atan2(y * cosDeltaGamma - k * sinDeltaGamma, x * cosDeltaPhi - z * sinDeltaPhi),
      asin(k * cosDeltaGamma + y * sinDeltaGamma)
    ];
  }

  rotation.invert = function(lambda, phi) {
    var cosPhi = cos(phi),
        x = cos(lambda) * cosPhi,
        y = sin(lambda) * cosPhi,
        z = sin(phi),
        k = z * cosDeltaGamma - y * sinDeltaGamma;
    return [
      atan2(y * cosDeltaGamma + z * sinDeltaGamma, x * cosDeltaPhi + k * sinDeltaPhi),
      asin(k * cosDeltaPhi - x * sinDeltaPhi)
    ];
  };

  return rotation;
}

var rotation = function(rotate) {
  rotate = rotateRadians(rotate[0] * radians, rotate[1] * radians, rotate.length > 2 ? rotate[2] * radians : 0);

  function forward(coordinates) {
    coordinates = rotate(coordinates[0] * radians, coordinates[1] * radians);
    return coordinates[0] *= degrees, coordinates[1] *= degrees, coordinates;
  }

  forward.invert = function(coordinates) {
    coordinates = rotate.invert(coordinates[0] * radians, coordinates[1] * radians);
    return coordinates[0] *= degrees, coordinates[1] *= degrees, coordinates;
  };

  return forward;
};

// Generates a circle centered at [0°, 0°], with a given radius and precision.
function circleStream(stream, radius, delta, direction, t0, t1) {
  if (!delta) return;
  var cosRadius = cos(radius),
      sinRadius = sin(radius),
      step = direction * delta;
  if (t0 == null) {
    t0 = radius + direction * tau;
    t1 = radius - step / 2;
  } else {
    t0 = circleRadius(cosRadius, t0);
    t1 = circleRadius(cosRadius, t1);
    if (direction > 0 ? t0 < t1 : t0 > t1) t0 += direction * tau;
  }
  for (var point, t = t0; direction > 0 ? t > t1 : t < t1; t -= step) {
    point = spherical([cosRadius, -sinRadius * cos(t), -sinRadius * sin(t)]);
    stream.point(point[0], point[1]);
  }
}

// Returns the signed angle of a cartesian point relative to [cosRadius, 0, 0].
function circleRadius(cosRadius, point) {
  point = cartesian(point), point[0] -= cosRadius;
  cartesianNormalizeInPlace(point);
  var radius = acos(-point[1]);
  return ((-point[2] < 0 ? -radius : radius) + tau - epsilon) % tau;
}

var circle = function() {
  var center = constant([0, 0]),
      radius = constant(90),
      precision = constant(6),
      ring,
      rotate,
      stream = {point: point};

  function point(x, y) {
    ring.push(x = rotate(x, y));
    x[0] *= degrees, x[1] *= degrees;
  }

  function circle() {
    var c = center.apply(this, arguments),
        r = radius.apply(this, arguments) * radians,
        p = precision.apply(this, arguments) * radians;
    ring = [];
    rotate = rotateRadians(-c[0] * radians, -c[1] * radians, 0).invert;
    circleStream(stream, r, p, 1);
    c = {type: "Polygon", coordinates: [ring]};
    ring = rotate = null;
    return c;
  }

  circle.center = function(_) {
    return arguments.length ? (center = typeof _ === "function" ? _ : constant([+_[0], +_[1]]), circle) : center;
  };

  circle.radius = function(_) {
    return arguments.length ? (radius = typeof _ === "function" ? _ : constant(+_), circle) : radius;
  };

  circle.precision = function(_) {
    return arguments.length ? (precision = typeof _ === "function" ? _ : constant(+_), circle) : precision;
  };

  return circle;
};

var clipBuffer = function() {
  var lines = [],
      line;
  return {
    point: function(x, y) {
      line.push([x, y]);
    },
    lineStart: function() {
      lines.push(line = []);
    },
    lineEnd: noop,
    rejoin: function() {
      if (lines.length > 1) lines.push(lines.pop().concat(lines.shift()));
    },
    result: function() {
      var result = lines;
      lines = [];
      line = null;
      return result;
    }
  };
};

var clipLine = function(a, b, x0, y0, x1, y1) {
  var ax = a[0],
      ay = a[1],
      bx = b[0],
      by = b[1],
      t0 = 0,
      t1 = 1,
      dx = bx - ax,
      dy = by - ay,
      r;

  r = x0 - ax;
  if (!dx && r > 0) return;
  r /= dx;
  if (dx < 0) {
    if (r < t0) return;
    if (r < t1) t1 = r;
  } else if (dx > 0) {
    if (r > t1) return;
    if (r > t0) t0 = r;
  }

  r = x1 - ax;
  if (!dx && r < 0) return;
  r /= dx;
  if (dx < 0) {
    if (r > t1) return;
    if (r > t0) t0 = r;
  } else if (dx > 0) {
    if (r < t0) return;
    if (r < t1) t1 = r;
  }

  r = y0 - ay;
  if (!dy && r > 0) return;
  r /= dy;
  if (dy < 0) {
    if (r < t0) return;
    if (r < t1) t1 = r;
  } else if (dy > 0) {
    if (r > t1) return;
    if (r > t0) t0 = r;
  }

  r = y1 - ay;
  if (!dy && r < 0) return;
  r /= dy;
  if (dy < 0) {
    if (r > t1) return;
    if (r > t0) t0 = r;
  } else if (dy > 0) {
    if (r < t0) return;
    if (r < t1) t1 = r;
  }

  if (t0 > 0) a[0] = ax + t0 * dx, a[1] = ay + t0 * dy;
  if (t1 < 1) b[0] = ax + t1 * dx, b[1] = ay + t1 * dy;
  return true;
};

var pointEqual = function(a, b) {
  return abs(a[0] - b[0]) < epsilon && abs(a[1] - b[1]) < epsilon;
};

function Intersection(point, points, other, entry) {
  this.x = point;
  this.z = points;
  this.o = other; // another intersection
  this.e = entry; // is an entry?
  this.v = false; // visited
  this.n = this.p = null; // next & previous
}

// A generalized polygon clipping algorithm: given a polygon that has been cut
// into its visible line segments, and rejoins the segments by interpolating
// along the clip edge.
var clipPolygon = function(segments, compareIntersection, startInside, interpolate, stream) {
  var subject = [],
      clip = [],
      i,
      n;

  segments.forEach(function(segment) {
    if ((n = segment.length - 1) <= 0) return;
    var n, p0 = segment[0], p1 = segment[n], x;

    // If the first and last points of a segment are coincident, then treat as a
    // closed ring. TODO if all rings are closed, then the winding order of the
    // exterior ring should be checked.
    if (pointEqual(p0, p1)) {
      stream.lineStart();
      for (i = 0; i < n; ++i) stream.point((p0 = segment[i])[0], p0[1]);
      stream.lineEnd();
      return;
    }

    subject.push(x = new Intersection(p0, segment, null, true));
    clip.push(x.o = new Intersection(p0, null, x, false));
    subject.push(x = new Intersection(p1, segment, null, false));
    clip.push(x.o = new Intersection(p1, null, x, true));
  });

  if (!subject.length) return;

  clip.sort(compareIntersection);
  link(subject);
  link(clip);

  for (i = 0, n = clip.length; i < n; ++i) {
    clip[i].e = startInside = !startInside;
  }

  var start = subject[0],
      points,
      point;

  while (1) {
    // Find first unvisited intersection.
    var current = start,
        isSubject = true;
    while (current.v) if ((current = current.n) === start) return;
    points = current.z;
    stream.lineStart();
    do {
      current.v = current.o.v = true;
      if (current.e) {
        if (isSubject) {
          for (i = 0, n = points.length; i < n; ++i) stream.point((point = points[i])[0], point[1]);
        } else {
          interpolate(current.x, current.n.x, 1, stream);
        }
        current = current.n;
      } else {
        if (isSubject) {
          points = current.p.z;
          for (i = points.length - 1; i >= 0; --i) stream.point((point = points[i])[0], point[1]);
        } else {
          interpolate(current.x, current.p.x, -1, stream);
        }
        current = current.p;
      }
      current = current.o;
      points = current.z;
      isSubject = !isSubject;
    } while (!current.v);
    stream.lineEnd();
  }
};

function link(array) {
  if (!(n = array.length)) return;
  var n,
      i = 0,
      a = array[0],
      b;
  while (++i < n) {
    a.n = b = array[i];
    b.p = a;
    a = b;
  }
  a.n = b = array[0];
  b.p = a;
}

var clipMax = 1e9;
var clipMin = -clipMax;

// TODO Use d3-polygon’s polygonContains here for the ring check?
// TODO Eliminate duplicate buffering in clipBuffer and polygon.push?

function clipExtent(x0, y0, x1, y1) {

  function visible(x, y) {
    return x0 <= x && x <= x1 && y0 <= y && y <= y1;
  }

  function interpolate(from, to, direction, stream) {
    var a = 0, a1 = 0;
    if (from == null
        || (a = corner(from, direction)) !== (a1 = corner(to, direction))
        || comparePoint(from, to) < 0 ^ direction > 0) {
      do stream.point(a === 0 || a === 3 ? x0 : x1, a > 1 ? y1 : y0);
      while ((a = (a + direction + 4) % 4) !== a1);
    } else {
      stream.point(to[0], to[1]);
    }
  }

  function corner(p, direction) {
    return abs(p[0] - x0) < epsilon ? direction > 0 ? 0 : 3
        : abs(p[0] - x1) < epsilon ? direction > 0 ? 2 : 1
        : abs(p[1] - y0) < epsilon ? direction > 0 ? 1 : 0
        : direction > 0 ? 3 : 2; // abs(p[1] - y1) < epsilon
  }

  function compareIntersection(a, b) {
    return comparePoint(a.x, b.x);
  }

  function comparePoint(a, b) {
    var ca = corner(a, 1),
        cb = corner(b, 1);
    return ca !== cb ? ca - cb
        : ca === 0 ? b[1] - a[1]
        : ca === 1 ? a[0] - b[0]
        : ca === 2 ? a[1] - b[1]
        : b[0] - a[0];
  }

  return function(stream) {
    var activeStream = stream,
        bufferStream = clipBuffer(),
        segments,
        polygon,
        ring,
        x__, y__, v__, // first point
        x_, y_, v_, // previous point
        first,
        clean;

    var clipStream = {
      point: point,
      lineStart: lineStart,
      lineEnd: lineEnd,
      polygonStart: polygonStart,
      polygonEnd: polygonEnd
    };

    function point(x, y) {
      if (visible(x, y)) activeStream.point(x, y);
    }

    function polygonInside() {
      var winding = 0;

      for (var i = 0, n = polygon.length; i < n; ++i) {
        for (var ring = polygon[i], j = 1, m = ring.length, point = ring[0], a0, a1, b0 = point[0], b1 = point[1]; j < m; ++j) {
          a0 = b0, a1 = b1, point = ring[j], b0 = point[0], b1 = point[1];
          if (a1 <= y1) { if (b1 > y1 && (b0 - a0) * (y1 - a1) > (b1 - a1) * (x0 - a0)) ++winding; }
          else { if (b1 <= y1 && (b0 - a0) * (y1 - a1) < (b1 - a1) * (x0 - a0)) --winding; }
        }
      }

      return winding;
    }

    // Buffer geometry within a polygon and then clip it en masse.
    function polygonStart() {
      activeStream = bufferStream, segments = [], polygon = [], clean = true;
    }

    function polygonEnd() {
      var startInside = polygonInside(),
          cleanInside = clean && startInside,
          visible = (segments = d3Array.merge(segments)).length;
      if (cleanInside || visible) {
        stream.polygonStart();
        if (cleanInside) {
          stream.lineStart();
          interpolate(null, null, 1, stream);
          stream.lineEnd();
        }
        if (visible) {
          clipPolygon(segments, compareIntersection, startInside, interpolate, stream);
        }
        stream.polygonEnd();
      }
      activeStream = stream, segments = polygon = ring = null;
    }

    function lineStart() {
      clipStream.point = linePoint;
      if (polygon) polygon.push(ring = []);
      first = true;
      v_ = false;
      x_ = y_ = NaN;
    }

    // TODO rather than special-case polygons, simply handle them separately.
    // Ideally, coincident intersection points should be jittered to avoid
    // clipping issues.
    function lineEnd() {
      if (segments) {
        linePoint(x__, y__);
        if (v__ && v_) bufferStream.rejoin();
        segments.push(bufferStream.result());
      }
      clipStream.point = point;
      if (v_) activeStream.lineEnd();
    }

    function linePoint(x, y) {
      var v = visible(x, y);
      if (polygon) ring.push([x, y]);
      if (first) {
        x__ = x, y__ = y, v__ = v;
        first = false;
        if (v) {
          activeStream.lineStart();
          activeStream.point(x, y);
        }
      } else {
        if (v && v_) activeStream.point(x, y);
        else {
          var a = [x_ = Math.max(clipMin, Math.min(clipMax, x_)), y_ = Math.max(clipMin, Math.min(clipMax, y_))],
              b = [x = Math.max(clipMin, Math.min(clipMax, x)), y = Math.max(clipMin, Math.min(clipMax, y))];
          if (clipLine(a, b, x0, y0, x1, y1)) {
            if (!v_) {
              activeStream.lineStart();
              activeStream.point(a[0], a[1]);
            }
            activeStream.point(b[0], b[1]);
            if (!v) activeStream.lineEnd();
            clean = false;
          } else if (v) {
            activeStream.lineStart();
            activeStream.point(x, y);
            clean = false;
          }
        }
      }
      x_ = x, y_ = y, v_ = v;
    }

    return clipStream;
  };
}

var extent = function() {
  var x0 = 0,
      y0 = 0,
      x1 = 960,
      y1 = 500,
      cache,
      cacheStream,
      clip;

  return clip = {
    stream: function(stream) {
      return cache && cacheStream === stream ? cache : cache = clipExtent(x0, y0, x1, y1)(cacheStream = stream);
    },
    extent: function(_) {
      return arguments.length ? (x0 = +_[0][0], y0 = +_[0][1], x1 = +_[1][0], y1 = +_[1][1], cache = cacheStream = null, clip) : [[x0, y0], [x1, y1]];
    }
  };
};

var lengthSum = adder();
var lambda0$2;
var sinPhi0$1;
var cosPhi0$1;

var lengthStream = {
  sphere: noop,
  point: noop,
  lineStart: lengthLineStart,
  lineEnd: noop,
  polygonStart: noop,
  polygonEnd: noop
};

function lengthLineStart() {
  lengthStream.point = lengthPointFirst;
  lengthStream.lineEnd = lengthLineEnd;
}

function lengthLineEnd() {
  lengthStream.point = lengthStream.lineEnd = noop;
}

function lengthPointFirst(lambda, phi) {
  lambda *= radians, phi *= radians;
  lambda0$2 = lambda, sinPhi0$1 = sin(phi), cosPhi0$1 = cos(phi);
  lengthStream.point = lengthPoint;
}

function lengthPoint(lambda, phi) {
  lambda *= radians, phi *= radians;
  var sinPhi = sin(phi),
      cosPhi = cos(phi),
      delta = abs(lambda - lambda0$2),
      cosDelta = cos(delta),
      sinDelta = sin(delta),
      x = cosPhi * sinDelta,
      y = cosPhi0$1 * sinPhi - sinPhi0$1 * cosPhi * cosDelta,
      z = sinPhi0$1 * sinPhi + cosPhi0$1 * cosPhi * cosDelta;
  lengthSum.add(atan2(sqrt(x * x + y * y), z));
  lambda0$2 = lambda, sinPhi0$1 = sinPhi, cosPhi0$1 = cosPhi;
}

var length = function(object) {
  lengthSum.reset();
  geoStream(object, lengthStream);
  return +lengthSum;
};

var coordinates = [null, null];
var object = {type: "LineString", coordinates: coordinates};

var distance = function(a, b) {
  coordinates[0] = a;
  coordinates[1] = b;
  return length(object);
};

function graticuleX(y0, y1, dy) {
  var y = d3Array.range(y0, y1 - epsilon, dy).concat(y1);
  return function(x) { return y.map(function(y) { return [x, y]; }); };
}

function graticuleY(x0, x1, dx) {
  var x = d3Array.range(x0, x1 - epsilon, dx).concat(x1);
  return function(y) { return x.map(function(x) { return [x, y]; }); };
}

function graticule() {
  var x1, x0, X1, X0,
      y1, y0, Y1, Y0,
      dx = 10, dy = dx, DX = 90, DY = 360,
      x, y, X, Y,
      precision = 2.5;

  function graticule() {
    return {type: "MultiLineString", coordinates: lines()};
  }

  function lines() {
    return d3Array.range(ceil(X0 / DX) * DX, X1, DX).map(X)
        .concat(d3Array.range(ceil(Y0 / DY) * DY, Y1, DY).map(Y))
        .concat(d3Array.range(ceil(x0 / dx) * dx, x1, dx).filter(function(x) { return abs(x % DX) > epsilon; }).map(x))
        .concat(d3Array.range(ceil(y0 / dy) * dy, y1, dy).filter(function(y) { return abs(y % DY) > epsilon; }).map(y));
  }

  graticule.lines = function() {
    return lines().map(function(coordinates) { return {type: "LineString", coordinates: coordinates}; });
  };

  graticule.outline = function() {
    return {
      type: "Polygon",
      coordinates: [
        X(X0).concat(
        Y(Y1).slice(1),
        X(X1).reverse().slice(1),
        Y(Y0).reverse().slice(1))
      ]
    };
  };

  graticule.extent = function(_) {
    if (!arguments.length) return graticule.extentMinor();
    return graticule.extentMajor(_).extentMinor(_);
  };

  graticule.extentMajor = function(_) {
    if (!arguments.length) return [[X0, Y0], [X1, Y1]];
    X0 = +_[0][0], X1 = +_[1][0];
    Y0 = +_[0][1], Y1 = +_[1][1];
    if (X0 > X1) _ = X0, X0 = X1, X1 = _;
    if (Y0 > Y1) _ = Y0, Y0 = Y1, Y1 = _;
    return graticule.precision(precision);
  };

  graticule.extentMinor = function(_) {
    if (!arguments.length) return [[x0, y0], [x1, y1]];
    x0 = +_[0][0], x1 = +_[1][0];
    y0 = +_[0][1], y1 = +_[1][1];
    if (x0 > x1) _ = x0, x0 = x1, x1 = _;
    if (y0 > y1) _ = y0, y0 = y1, y1 = _;
    return graticule.precision(precision);
  };

  graticule.step = function(_) {
    if (!arguments.length) return graticule.stepMinor();
    return graticule.stepMajor(_).stepMinor(_);
  };

  graticule.stepMajor = function(_) {
    if (!arguments.length) return [DX, DY];
    DX = +_[0], DY = +_[1];
    return graticule;
  };

  graticule.stepMinor = function(_) {
    if (!arguments.length) return [dx, dy];
    dx = +_[0], dy = +_[1];
    return graticule;
  };

  graticule.precision = function(_) {
    if (!arguments.length) return precision;
    precision = +_;
    x = graticuleX(y0, y1, 90);
    y = graticuleY(x0, x1, precision);
    X = graticuleX(Y0, Y1, 90);
    Y = graticuleY(X0, X1, precision);
    return graticule;
  };

  return graticule
      .extentMajor([[-180, -90 + epsilon], [180, 90 - epsilon]])
      .extentMinor([[-180, -80 - epsilon], [180, 80 + epsilon]]);
}

function graticule10() {
  return graticule()();
}

var interpolate = function(a, b) {
  var x0 = a[0] * radians,
      y0 = a[1] * radians,
      x1 = b[0] * radians,
      y1 = b[1] * radians,
      cy0 = cos(y0),
      sy0 = sin(y0),
      cy1 = cos(y1),
      sy1 = sin(y1),
      kx0 = cy0 * cos(x0),
      ky0 = cy0 * sin(x0),
      kx1 = cy1 * cos(x1),
      ky1 = cy1 * sin(x1),
      d = 2 * asin(sqrt(haversin(y1 - y0) + cy0 * cy1 * haversin(x1 - x0))),
      k = sin(d);

  var interpolate = d ? function(t) {
    var B = sin(t *= d) / k,
        A = sin(d - t) / k,
        x = A * kx0 + B * kx1,
        y = A * ky0 + B * ky1,
        z = A * sy0 + B * sy1;
    return [
      atan2(y, x) * degrees,
      atan2(z, sqrt(x * x + y * y)) * degrees
    ];
  } : function() {
    return [x0 * degrees, y0 * degrees];
  };

  interpolate.distance = d;

  return interpolate;
};

var identity = function(x) {
  return x;
};

var areaSum$1 = adder();
var areaRingSum$1 = adder();
var x00;
var y00;
var x0$1;
var y0$1;

var areaStream$1 = {
  point: noop,
  lineStart: noop,
  lineEnd: noop,
  polygonStart: function() {
    areaStream$1.lineStart = areaRingStart$1;
    areaStream$1.lineEnd = areaRingEnd$1;
  },
  polygonEnd: function() {
    areaStream$1.lineStart = areaStream$1.lineEnd = areaStream$1.point = noop;
    areaSum$1.add(abs(areaRingSum$1));
    areaRingSum$1.reset();
  },
  result: function() {
    var area = areaSum$1 / 2;
    areaSum$1.reset();
    return area;
  }
};

function areaRingStart$1() {
  areaStream$1.point = areaPointFirst$1;
}

function areaPointFirst$1(x, y) {
  areaStream$1.point = areaPoint$1;
  x00 = x0$1 = x, y00 = y0$1 = y;
}

function areaPoint$1(x, y) {
  areaRingSum$1.add(y0$1 * x - x0$1 * y);
  x0$1 = x, y0$1 = y;
}

function areaRingEnd$1() {
  areaPoint$1(x00, y00);
}

var x0$2 = Infinity;
var y0$2 = x0$2;
var x1 = -x0$2;
var y1 = x1;

var boundsStream$1 = {
  point: boundsPoint$1,
  lineStart: noop,
  lineEnd: noop,
  polygonStart: noop,
  polygonEnd: noop,
  result: function() {
    var bounds = [[x0$2, y0$2], [x1, y1]];
    x1 = y1 = -(y0$2 = x0$2 = Infinity);
    return bounds;
  }
};

function boundsPoint$1(x, y) {
  if (x < x0$2) x0$2 = x;
  if (x > x1) x1 = x;
  if (y < y0$2) y0$2 = y;
  if (y > y1) y1 = y;
}

// TODO Enforce positive area for exterior, negative area for interior?

var X0$1 = 0;
var Y0$1 = 0;
var Z0$1 = 0;
var X1$1 = 0;
var Y1$1 = 0;
var Z1$1 = 0;
var X2$1 = 0;
var Y2$1 = 0;
var Z2$1 = 0;
var x00$1;
var y00$1;
var x0$3;
var y0$3;

var centroidStream$1 = {
  point: centroidPoint$1,
  lineStart: centroidLineStart$1,
  lineEnd: centroidLineEnd$1,
  polygonStart: function() {
    centroidStream$1.lineStart = centroidRingStart$1;
    centroidStream$1.lineEnd = centroidRingEnd$1;
  },
  polygonEnd: function() {
    centroidStream$1.point = centroidPoint$1;
    centroidStream$1.lineStart = centroidLineStart$1;
    centroidStream$1.lineEnd = centroidLineEnd$1;
  },
  result: function() {
    var centroid = Z2$1 ? [X2$1 / Z2$1, Y2$1 / Z2$1]
        : Z1$1 ? [X1$1 / Z1$1, Y1$1 / Z1$1]
        : Z0$1 ? [X0$1 / Z0$1, Y0$1 / Z0$1]
        : [NaN, NaN];
    X0$1 = Y0$1 = Z0$1 =
    X1$1 = Y1$1 = Z1$1 =
    X2$1 = Y2$1 = Z2$1 = 0;
    return centroid;
  }
};

function centroidPoint$1(x, y) {
  X0$1 += x;
  Y0$1 += y;
  ++Z0$1;
}

function centroidLineStart$1() {
  centroidStream$1.point = centroidPointFirstLine;
}

function centroidPointFirstLine(x, y) {
  centroidStream$1.point = centroidPointLine;
  centroidPoint$1(x0$3 = x, y0$3 = y);
}

function centroidPointLine(x, y) {
  var dx = x - x0$3, dy = y - y0$3, z = sqrt(dx * dx + dy * dy);
  X1$1 += z * (x0$3 + x) / 2;
  Y1$1 += z * (y0$3 + y) / 2;
  Z1$1 += z;
  centroidPoint$1(x0$3 = x, y0$3 = y);
}

function centroidLineEnd$1() {
  centroidStream$1.point = centroidPoint$1;
}

function centroidRingStart$1() {
  centroidStream$1.point = centroidPointFirstRing;
}

function centroidRingEnd$1() {
  centroidPointRing(x00$1, y00$1);
}

function centroidPointFirstRing(x, y) {
  centroidStream$1.point = centroidPointRing;
  centroidPoint$1(x00$1 = x0$3 = x, y00$1 = y0$3 = y);
}

function centroidPointRing(x, y) {
  var dx = x - x0$3,
      dy = y - y0$3,
      z = sqrt(dx * dx + dy * dy);

  X1$1 += z * (x0$3 + x) / 2;
  Y1$1 += z * (y0$3 + y) / 2;
  Z1$1 += z;

  z = y0$3 * x - x0$3 * y;
  X2$1 += z * (x0$3 + x);
  Y2$1 += z * (y0$3 + y);
  Z2$1 += z * 3;
  centroidPoint$1(x0$3 = x, y0$3 = y);
}

function PathContext(context) {
  this._context = context;
}

PathContext.prototype = {
  _radius: 4.5,
  pointRadius: function(_) {
    return this._radius = _, this;
  },
  polygonStart: function() {
    this._line = 0;
  },
  polygonEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._point = 0;
  },
  lineEnd: function() {
    if (this._line === 0) this._context.closePath();
    this._point = NaN;
  },
  point: function(x, y) {
    switch (this._point) {
      case 0: {
        this._context.moveTo(x, y);
        this._point = 1;
        break;
      }
      case 1: {
        this._context.lineTo(x, y);
        break;
      }
      default: {
        this._context.moveTo(x + this._radius, y);
        this._context.arc(x, y, this._radius, 0, tau);
        break;
      }
    }
  },
  result: noop
};

function PathString() {
  this._string = [];
}

PathString.prototype = {
  _circle: circle$1(4.5),
  pointRadius: function(_) {
    return this._circle = circle$1(_), this;
  },
  polygonStart: function() {
    this._line = 0;
  },
  polygonEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._point = 0;
  },
  lineEnd: function() {
    if (this._line === 0) this._string.push("Z");
    this._point = NaN;
  },
  point: function(x, y) {
    switch (this._point) {
      case 0: {
        this._string.push("M", x, ",", y);
        this._point = 1;
        break;
      }
      case 1: {
        this._string.push("L", x, ",", y);
        break;
      }
      default: {
        this._string.push("M", x, ",", y, this._circle);
        break;
      }
    }
  },
  result: function() {
    if (this._string.length) {
      var result = this._string.join("");
      this._string = [];
      return result;
    }
  }
};

function circle$1(radius) {
  return "m0," + radius
      + "a" + radius + "," + radius + " 0 1,1 0," + -2 * radius
      + "a" + radius + "," + radius + " 0 1,1 0," + 2 * radius
      + "z";
}

var index = function(projection, context) {
  var pointRadius = 4.5,
      projectionStream,
      contextStream;

  function path(object) {
    if (object) {
      if (typeof pointRadius === "function") contextStream.pointRadius(+pointRadius.apply(this, arguments));
      geoStream(object, projectionStream(contextStream));
    }
    return contextStream.result();
  }

  path.area = function(object) {
    geoStream(object, projectionStream(areaStream$1));
    return areaStream$1.result();
  };

  path.bounds = function(object) {
    geoStream(object, projectionStream(boundsStream$1));
    return boundsStream$1.result();
  };

  path.centroid = function(object) {
    geoStream(object, projectionStream(centroidStream$1));
    return centroidStream$1.result();
  };

  path.projection = function(_) {
    return arguments.length ? (projectionStream = _ == null ? (projection = null, identity) : (projection = _).stream, path) : projection;
  };

  path.context = function(_) {
    if (!arguments.length) return context;
    contextStream = _ == null ? (context = null, new PathString) : new PathContext(context = _);
    if (typeof pointRadius !== "function") contextStream.pointRadius(pointRadius);
    return path;
  };

  path.pointRadius = function(_) {
    if (!arguments.length) return pointRadius;
    pointRadius = typeof _ === "function" ? _ : (contextStream.pointRadius(+_), +_);
    return path;
  };

  return path.projection(projection).context(context);
};

var sum = adder();

var polygonContains = function(polygon, point) {
  var lambda = point[0],
      phi = point[1],
      normal = [sin(lambda), -cos(lambda), 0],
      angle = 0,
      winding = 0;

  sum.reset();

  for (var i = 0, n = polygon.length; i < n; ++i) {
    if (!(m = (ring = polygon[i]).length)) continue;
    var ring,
        m,
        point0 = ring[m - 1],
        lambda0 = point0[0],
        phi0 = point0[1] / 2 + quarterPi,
        sinPhi0 = sin(phi0),
        cosPhi0 = cos(phi0);

    for (var j = 0; j < m; ++j, lambda0 = lambda1, sinPhi0 = sinPhi1, cosPhi0 = cosPhi1, point0 = point1) {
      var point1 = ring[j],
          lambda1 = point1[0],
          phi1 = point1[1] / 2 + quarterPi,
          sinPhi1 = sin(phi1),
          cosPhi1 = cos(phi1),
          delta = lambda1 - lambda0,
          sign$$1 = delta >= 0 ? 1 : -1,
          absDelta = sign$$1 * delta,
          antimeridian = absDelta > pi,
          k = sinPhi0 * sinPhi1;

      sum.add(atan2(k * sign$$1 * sin(absDelta), cosPhi0 * cosPhi1 + k * cos(absDelta)));
      angle += antimeridian ? delta + sign$$1 * tau : delta;

      // Are the longitudes either side of the point’s meridian (lambda),
      // and are the latitudes smaller than the parallel (phi)?
      if (antimeridian ^ lambda0 >= lambda ^ lambda1 >= lambda) {
        var arc = cartesianCross(cartesian(point0), cartesian(point1));
        cartesianNormalizeInPlace(arc);
        var intersection = cartesianCross(normal, arc);
        cartesianNormalizeInPlace(intersection);
        var phiArc = (antimeridian ^ delta >= 0 ? -1 : 1) * asin(intersection[2]);
        if (phi > phiArc || phi === phiArc && (arc[0] || arc[1])) {
          winding += antimeridian ^ delta >= 0 ? 1 : -1;
        }
      }
    }
  }

  // First, determine whether the South pole is inside or outside:
  //
  // It is inside if:
  // * the polygon winds around it in a clockwise direction.
  // * the polygon does not (cumulatively) wind around it, but has a negative
  //   (counter-clockwise) area.
  //
  // Second, count the (signed) number of times a segment crosses a lambda
  // from the point to the South pole.  If it is zero, then the point is the
  // same side as the South pole.

  return (angle < -epsilon || angle < epsilon && sum < -epsilon) ^ (winding & 1);
};

var clip = function(pointVisible, clipLine, interpolate, start) {
  return function(rotate, sink) {
    var line = clipLine(sink),
        rotatedStart = rotate.invert(start[0], start[1]),
        ringBuffer = clipBuffer(),
        ringSink = clipLine(ringBuffer),
        polygonStarted = false,
        polygon,
        segments,
        ring;

    var clip = {
      point: point,
      lineStart: lineStart,
      lineEnd: lineEnd,
      polygonStart: function() {
        clip.point = pointRing;
        clip.lineStart = ringStart;
        clip.lineEnd = ringEnd;
        segments = [];
        polygon = [];
      },
      polygonEnd: function() {
        clip.point = point;
        clip.lineStart = lineStart;
        clip.lineEnd = lineEnd;
        segments = d3Array.merge(segments);
        var startInside = polygonContains(polygon, rotatedStart);
        if (segments.length) {
          if (!polygonStarted) sink.polygonStart(), polygonStarted = true;
          clipPolygon(segments, compareIntersection, startInside, interpolate, sink);
        } else if (startInside) {
          if (!polygonStarted) sink.polygonStart(), polygonStarted = true;
          sink.lineStart();
          interpolate(null, null, 1, sink);
          sink.lineEnd();
        }
        if (polygonStarted) sink.polygonEnd(), polygonStarted = false;
        segments = polygon = null;
      },
      sphere: function() {
        sink.polygonStart();
        sink.lineStart();
        interpolate(null, null, 1, sink);
        sink.lineEnd();
        sink.polygonEnd();
      }
    };

    function point(lambda, phi) {
      var point = rotate(lambda, phi);
      if (pointVisible(lambda = point[0], phi = point[1])) sink.point(lambda, phi);
    }

    function pointLine(lambda, phi) {
      var point = rotate(lambda, phi);
      line.point(point[0], point[1]);
    }

    function lineStart() {
      clip.point = pointLine;
      line.lineStart();
    }

    function lineEnd() {
      clip.point = point;
      line.lineEnd();
    }

    function pointRing(lambda, phi) {
      ring.push([lambda, phi]);
      var point = rotate(lambda, phi);
      ringSink.point(point[0], point[1]);
    }

    function ringStart() {
      ringSink.lineStart();
      ring = [];
    }

    function ringEnd() {
      pointRing(ring[0][0], ring[0][1]);
      ringSink.lineEnd();

      var clean = ringSink.clean(),
          ringSegments = ringBuffer.result(),
          i, n = ringSegments.length, m,
          segment,
          point;

      ring.pop();
      polygon.push(ring);
      ring = null;

      if (!n) return;

      // No intersections.
      if (clean & 1) {
        segment = ringSegments[0];
        if ((m = segment.length - 1) > 0) {
          if (!polygonStarted) sink.polygonStart(), polygonStarted = true;
          sink.lineStart();
          for (i = 0; i < m; ++i) sink.point((point = segment[i])[0], point[1]);
          sink.lineEnd();
        }
        return;
      }

      // Rejoin connected segments.
      // TODO reuse ringBuffer.rejoin()?
      if (n > 1 && clean & 2) ringSegments.push(ringSegments.pop().concat(ringSegments.shift()));

      segments.push(ringSegments.filter(validSegment));
    }

    return clip;
  };
};

function validSegment(segment) {
  return segment.length > 1;
}

// Intersections are sorted along the clip edge. For both antimeridian cutting
// and circle clipping, the same comparison is used.
function compareIntersection(a, b) {
  return ((a = a.x)[0] < 0 ? a[1] - halfPi - epsilon : halfPi - a[1])
       - ((b = b.x)[0] < 0 ? b[1] - halfPi - epsilon : halfPi - b[1]);
}

var clipAntimeridian = clip(
  function() { return true; },
  clipAntimeridianLine,
  clipAntimeridianInterpolate,
  [-pi, -halfPi]
);

// Takes a line and cuts into visible segments. Return values: 0 - there were
// intersections or the line was empty; 1 - no intersections; 2 - there were
// intersections, and the first and last segments should be rejoined.
function clipAntimeridianLine(stream) {
  var lambda0 = NaN,
      phi0 = NaN,
      sign0 = NaN,
      clean; // no intersections

  return {
    lineStart: function() {
      stream.lineStart();
      clean = 1;
    },
    point: function(lambda1, phi1) {
      var sign1 = lambda1 > 0 ? pi : -pi,
          delta = abs(lambda1 - lambda0);
      if (abs(delta - pi) < epsilon) { // line crosses a pole
        stream.point(lambda0, phi0 = (phi0 + phi1) / 2 > 0 ? halfPi : -halfPi);
        stream.point(sign0, phi0);
        stream.lineEnd();
        stream.lineStart();
        stream.point(sign1, phi0);
        stream.point(lambda1, phi0);
        clean = 0;
      } else if (sign0 !== sign1 && delta >= pi) { // line crosses antimeridian
        if (abs(lambda0 - sign0) < epsilon) lambda0 -= sign0 * epsilon; // handle degeneracies
        if (abs(lambda1 - sign1) < epsilon) lambda1 -= sign1 * epsilon;
        phi0 = clipAntimeridianIntersect(lambda0, phi0, lambda1, phi1);
        stream.point(sign0, phi0);
        stream.lineEnd();
        stream.lineStart();
        stream.point(sign1, phi0);
        clean = 0;
      }
      stream.point(lambda0 = lambda1, phi0 = phi1);
      sign0 = sign1;
    },
    lineEnd: function() {
      stream.lineEnd();
      lambda0 = phi0 = NaN;
    },
    clean: function() {
      return 2 - clean; // if intersections, rejoin first and last segments
    }
  };
}

function clipAntimeridianIntersect(lambda0, phi0, lambda1, phi1) {
  var cosPhi0,
      cosPhi1,
      sinLambda0Lambda1 = sin(lambda0 - lambda1);
  return abs(sinLambda0Lambda1) > epsilon
      ? atan((sin(phi0) * (cosPhi1 = cos(phi1)) * sin(lambda1)
          - sin(phi1) * (cosPhi0 = cos(phi0)) * sin(lambda0))
          / (cosPhi0 * cosPhi1 * sinLambda0Lambda1))
      : (phi0 + phi1) / 2;
}

function clipAntimeridianInterpolate(from, to, direction, stream) {
  var phi;
  if (from == null) {
    phi = direction * halfPi;
    stream.point(-pi, phi);
    stream.point(0, phi);
    stream.point(pi, phi);
    stream.point(pi, 0);
    stream.point(pi, -phi);
    stream.point(0, -phi);
    stream.point(-pi, -phi);
    stream.point(-pi, 0);
    stream.point(-pi, phi);
  } else if (abs(from[0] - to[0]) > epsilon) {
    var lambda = from[0] < to[0] ? pi : -pi;
    phi = direction * lambda / 2;
    stream.point(-lambda, phi);
    stream.point(0, phi);
    stream.point(lambda, phi);
  } else {
    stream.point(to[0], to[1]);
  }
}

var clipCircle = function(radius, delta) {
  var cr = cos(radius),
      smallRadius = cr > 0,
      notHemisphere = abs(cr) > epsilon; // TODO optimise for this common case

  function interpolate(from, to, direction, stream) {
    circleStream(stream, radius, delta, direction, from, to);
  }

  function visible(lambda, phi) {
    return cos(lambda) * cos(phi) > cr;
  }

  // Takes a line and cuts into visible segments. Return values used for polygon
  // clipping: 0 - there were intersections or the line was empty; 1 - no
  // intersections 2 - there were intersections, and the first and last segments
  // should be rejoined.
  function clipLine(stream) {
    var point0, // previous point
        c0, // code for previous point
        v0, // visibility of previous point
        v00, // visibility of first point
        clean; // no intersections
    return {
      lineStart: function() {
        v00 = v0 = false;
        clean = 1;
      },
      point: function(lambda, phi) {
        var point1 = [lambda, phi],
            point2,
            v = visible(lambda, phi),
            c = smallRadius
              ? v ? 0 : code(lambda, phi)
              : v ? code(lambda + (lambda < 0 ? pi : -pi), phi) : 0;
        if (!point0 && (v00 = v0 = v)) stream.lineStart();
        // Handle degeneracies.
        // TODO ignore if not clipping polygons.
        if (v !== v0) {
          point2 = intersect(point0, point1);
          if (pointEqual(point0, point2) || pointEqual(point1, point2)) {
            point1[0] += epsilon;
            point1[1] += epsilon;
            v = visible(point1[0], point1[1]);
          }
        }
        if (v !== v0) {
          clean = 0;
          if (v) {
            // outside going in
            stream.lineStart();
            point2 = intersect(point1, point0);
            stream.point(point2[0], point2[1]);
          } else {
            // inside going out
            point2 = intersect(point0, point1);
            stream.point(point2[0], point2[1]);
            stream.lineEnd();
          }
          point0 = point2;
        } else if (notHemisphere && point0 && smallRadius ^ v) {
          var t;
          // If the codes for two points are different, or are both zero,
          // and there this segment intersects with the small circle.
          if (!(c & c0) && (t = intersect(point1, point0, true))) {
            clean = 0;
            if (smallRadius) {
              stream.lineStart();
              stream.point(t[0][0], t[0][1]);
              stream.point(t[1][0], t[1][1]);
              stream.lineEnd();
            } else {
              stream.point(t[1][0], t[1][1]);
              stream.lineEnd();
              stream.lineStart();
              stream.point(t[0][0], t[0][1]);
            }
          }
        }
        if (v && (!point0 || !pointEqual(point0, point1))) {
          stream.point(point1[0], point1[1]);
        }
        point0 = point1, v0 = v, c0 = c;
      },
      lineEnd: function() {
        if (v0) stream.lineEnd();
        point0 = null;
      },
      // Rejoin first and last segments if there were intersections and the first
      // and last points were visible.
      clean: function() {
        return clean | ((v00 && v0) << 1);
      }
    };
  }

  // Intersects the great circle between a and b with the clip circle.
  function intersect(a, b, two) {
    var pa = cartesian(a),
        pb = cartesian(b);

    // We have two planes, n1.p = d1 and n2.p = d2.
    // Find intersection line p(t) = c1 n1 + c2 n2 + t (n1 ⨯ n2).
    var n1 = [1, 0, 0], // normal
        n2 = cartesianCross(pa, pb),
        n2n2 = cartesianDot(n2, n2),
        n1n2 = n2[0], // cartesianDot(n1, n2),
        determinant = n2n2 - n1n2 * n1n2;

    // Two polar points.
    if (!determinant) return !two && a;

    var c1 =  cr * n2n2 / determinant,
        c2 = -cr * n1n2 / determinant,
        n1xn2 = cartesianCross(n1, n2),
        A = cartesianScale(n1, c1),
        B = cartesianScale(n2, c2);
    cartesianAddInPlace(A, B);

    // Solve |p(t)|^2 = 1.
    var u = n1xn2,
        w = cartesianDot(A, u),
        uu = cartesianDot(u, u),
        t2 = w * w - uu * (cartesianDot(A, A) - 1);

    if (t2 < 0) return;

    var t = sqrt(t2),
        q = cartesianScale(u, (-w - t) / uu);
    cartesianAddInPlace(q, A);
    q = spherical(q);

    if (!two) return q;

    // Two intersection points.
    var lambda0 = a[0],
        lambda1 = b[0],
        phi0 = a[1],
        phi1 = b[1],
        z;

    if (lambda1 < lambda0) z = lambda0, lambda0 = lambda1, lambda1 = z;

    var delta = lambda1 - lambda0,
        polar = abs(delta - pi) < epsilon,
        meridian = polar || delta < epsilon;

    if (!polar && phi1 < phi0) z = phi0, phi0 = phi1, phi1 = z;

    // Check that the first point is between a and b.
    if (meridian
        ? polar
          ? phi0 + phi1 > 0 ^ q[1] < (abs(q[0] - lambda0) < epsilon ? phi0 : phi1)
          : phi0 <= q[1] && q[1] <= phi1
        : delta > pi ^ (lambda0 <= q[0] && q[0] <= lambda1)) {
      var q1 = cartesianScale(u, (-w + t) / uu);
      cartesianAddInPlace(q1, A);
      return [q, spherical(q1)];
    }
  }

  // Generates a 4-bit vector representing the location of a point relative to
  // the small circle's bounding box.
  function code(lambda, phi) {
    var r = smallRadius ? radius : pi - radius,
        code = 0;
    if (lambda < -r) code |= 1; // left
    else if (lambda > r) code |= 2; // right
    if (phi < -r) code |= 4; // below
    else if (phi > r) code |= 8; // above
    return code;
  }

  return clip(visible, clipLine, interpolate, smallRadius ? [0, -radius] : [-pi, radius - pi]);
};

var transform = function(methods) {
  return {
    stream: transformer(methods)
  };
};

function transformer(methods) {
  return function(stream) {
    var s = new TransformStream;
    for (var key in methods) s[key] = methods[key];
    s.stream = stream;
    return s;
  };
}

function TransformStream() {}

TransformStream.prototype = {
  constructor: TransformStream,
  point: function(x, y) { this.stream.point(x, y); },
  sphere: function() { this.stream.sphere(); },
  lineStart: function() { this.stream.lineStart(); },
  lineEnd: function() { this.stream.lineEnd(); },
  polygonStart: function() { this.stream.polygonStart(); },
  polygonEnd: function() { this.stream.polygonEnd(); }
};

function fitExtent(projection, extent, object) {
  var w = extent[1][0] - extent[0][0],
      h = extent[1][1] - extent[0][1],
      clip = projection.clipExtent && projection.clipExtent();

  projection
      .scale(150)
      .translate([0, 0]);

  if (clip != null) projection.clipExtent(null);

  geoStream(object, projection.stream(boundsStream$1));

  var b = boundsStream$1.result(),
      k = Math.min(w / (b[1][0] - b[0][0]), h / (b[1][1] - b[0][1])),
      x = +extent[0][0] + (w - k * (b[1][0] + b[0][0])) / 2,
      y = +extent[0][1] + (h - k * (b[1][1] + b[0][1])) / 2;

  if (clip != null) projection.clipExtent(clip);

  return projection
      .scale(k * 150)
      .translate([x, y]);
}

function fitSize(projection, size, object) {
  return fitExtent(projection, [[0, 0], size], object);
}

var maxDepth = 16;
var cosMinDistance = cos(30 * radians); // cos(minimum angular distance)

var resample = function(project, delta2) {
  return +delta2 ? resample$1(project, delta2) : resampleNone(project);
};

function resampleNone(project) {
  return transformer({
    point: function(x, y) {
      x = project(x, y);
      this.stream.point(x[0], x[1]);
    }
  });
}

function resample$1(project, delta2) {

  function resampleLineTo(x0, y0, lambda0, a0, b0, c0, x1, y1, lambda1, a1, b1, c1, depth, stream) {
    var dx = x1 - x0,
        dy = y1 - y0,
        d2 = dx * dx + dy * dy;
    if (d2 > 4 * delta2 && depth--) {
      var a = a0 + a1,
          b = b0 + b1,
          c = c0 + c1,
          m = sqrt(a * a + b * b + c * c),
          phi2 = asin(c /= m),
          lambda2 = abs(abs(c) - 1) < epsilon || abs(lambda0 - lambda1) < epsilon ? (lambda0 + lambda1) / 2 : atan2(b, a),
          p = project(lambda2, phi2),
          x2 = p[0],
          y2 = p[1],
          dx2 = x2 - x0,
          dy2 = y2 - y0,
          dz = dy * dx2 - dx * dy2;
      if (dz * dz / d2 > delta2 // perpendicular projected distance
          || abs((dx * dx2 + dy * dy2) / d2 - 0.5) > 0.3 // midpoint close to an end
          || a0 * a1 + b0 * b1 + c0 * c1 < cosMinDistance) { // angular distance
        resampleLineTo(x0, y0, lambda0, a0, b0, c0, x2, y2, lambda2, a /= m, b /= m, c, depth, stream);
        stream.point(x2, y2);
        resampleLineTo(x2, y2, lambda2, a, b, c, x1, y1, lambda1, a1, b1, c1, depth, stream);
      }
    }
  }
  return function(stream) {
    var lambda00, x00, y00, a00, b00, c00, // first point
        lambda0, x0, y0, a0, b0, c0; // previous point

    var resampleStream = {
      point: point,
      lineStart: lineStart,
      lineEnd: lineEnd,
      polygonStart: function() { stream.polygonStart(); resampleStream.lineStart = ringStart; },
      polygonEnd: function() { stream.polygonEnd(); resampleStream.lineStart = lineStart; }
    };

    function point(x, y) {
      x = project(x, y);
      stream.point(x[0], x[1]);
    }

    function lineStart() {
      x0 = NaN;
      resampleStream.point = linePoint;
      stream.lineStart();
    }

    function linePoint(lambda, phi) {
      var c = cartesian([lambda, phi]), p = project(lambda, phi);
      resampleLineTo(x0, y0, lambda0, a0, b0, c0, x0 = p[0], y0 = p[1], lambda0 = lambda, a0 = c[0], b0 = c[1], c0 = c[2], maxDepth, stream);
      stream.point(x0, y0);
    }

    function lineEnd() {
      resampleStream.point = point;
      stream.lineEnd();
    }

    function ringStart() {
      lineStart();
      resampleStream.point = ringPoint;
      resampleStream.lineEnd = ringEnd;
    }

    function ringPoint(lambda, phi) {
      linePoint(lambda00 = lambda, phi), x00 = x0, y00 = y0, a00 = a0, b00 = b0, c00 = c0;
      resampleStream.point = linePoint;
    }

    function ringEnd() {
      resampleLineTo(x0, y0, lambda0, a0, b0, c0, x00, y00, lambda00, a00, b00, c00, maxDepth, stream);
      resampleStream.lineEnd = lineEnd;
      lineEnd();
    }

    return resampleStream;
  };
}

var transformRadians = transformer({
  point: function(x, y) {
    this.stream.point(x * radians, y * radians);
  }
});

function projection(project) {
  return projectionMutator(function() { return project; })();
}

function projectionMutator(projectAt) {
  var project,
      k = 150, // scale
      x = 480, y = 250, // translate
      dx, dy, lambda = 0, phi = 0, // center
      deltaLambda = 0, deltaPhi = 0, deltaGamma = 0, rotate, projectRotate, // rotate
      theta = null, preclip = clipAntimeridian, // clip angle
      x0 = null, y0, x1, y1, postclip = identity, // clip extent
      delta2 = 0.5, projectResample = resample(projectTransform, delta2), // precision
      cache,
      cacheStream;

  function projection(point) {
    point = projectRotate(point[0] * radians, point[1] * radians);
    return [point[0] * k + dx, dy - point[1] * k];
  }

  function invert(point) {
    point = projectRotate.invert((point[0] - dx) / k, (dy - point[1]) / k);
    return point && [point[0] * degrees, point[1] * degrees];
  }

  function projectTransform(x, y) {
    return x = project(x, y), [x[0] * k + dx, dy - x[1] * k];
  }

  projection.stream = function(stream) {
    return cache && cacheStream === stream ? cache : cache = transformRadians(preclip(rotate, projectResample(postclip(cacheStream = stream))));
  };

  projection.clipAngle = function(_) {
    return arguments.length ? (preclip = +_ ? clipCircle(theta = _ * radians, 6 * radians) : (theta = null, clipAntimeridian), reset()) : theta * degrees;
  };

  projection.clipExtent = function(_) {
    return arguments.length ? (postclip = _ == null ? (x0 = y0 = x1 = y1 = null, identity) : clipExtent(x0 = +_[0][0], y0 = +_[0][1], x1 = +_[1][0], y1 = +_[1][1]), reset()) : x0 == null ? null : [[x0, y0], [x1, y1]];
  };

  projection.scale = function(_) {
    return arguments.length ? (k = +_, recenter()) : k;
  };

  projection.translate = function(_) {
    return arguments.length ? (x = +_[0], y = +_[1], recenter()) : [x, y];
  };

  projection.center = function(_) {
    return arguments.length ? (lambda = _[0] % 360 * radians, phi = _[1] % 360 * radians, recenter()) : [lambda * degrees, phi * degrees];
  };

  projection.rotate = function(_) {
    return arguments.length ? (deltaLambda = _[0] % 360 * radians, deltaPhi = _[1] % 360 * radians, deltaGamma = _.length > 2 ? _[2] % 360 * radians : 0, recenter()) : [deltaLambda * degrees, deltaPhi * degrees, deltaGamma * degrees];
  };

  projection.precision = function(_) {
    return arguments.length ? (projectResample = resample(projectTransform, delta2 = _ * _), reset()) : sqrt(delta2);
  };

  projection.fitExtent = function(extent, object) {
    return fitExtent(projection, extent, object);
  };

  projection.fitSize = function(size, object) {
    return fitSize(projection, size, object);
  };

  function recenter() {
    projectRotate = compose(rotate = rotateRadians(deltaLambda, deltaPhi, deltaGamma), project);
    var center = project(lambda, phi);
    dx = x - center[0] * k;
    dy = y + center[1] * k;
    return reset();
  }

  function reset() {
    cache = cacheStream = null;
    return projection;
  }

  return function() {
    project = projectAt.apply(this, arguments);
    projection.invert = project.invert && invert;
    return recenter();
  };
}

function conicProjection(projectAt) {
  var phi0 = 0,
      phi1 = pi / 3,
      m = projectionMutator(projectAt),
      p = m(phi0, phi1);

  p.parallels = function(_) {
    return arguments.length ? m(phi0 = _[0] * radians, phi1 = _[1] * radians) : [phi0 * degrees, phi1 * degrees];
  };

  return p;
}

function cylindricalEqualAreaRaw(phi0) {
  var cosPhi0 = cos(phi0);

  function forward(lambda, phi) {
    return [lambda * cosPhi0, sin(phi) / cosPhi0];
  }

  forward.invert = function(x, y) {
    return [x / cosPhi0, asin(y * cosPhi0)];
  };

  return forward;
}

function conicEqualAreaRaw(y0, y1) {
  var sy0 = sin(y0), n = (sy0 + sin(y1)) / 2;

  // Are the parallels symmetrical around the Equator?
  if (abs(n) < epsilon) return cylindricalEqualAreaRaw(y0);

  var c = 1 + sy0 * (2 * n - sy0), r0 = sqrt(c) / n;

  function project(x, y) {
    var r = sqrt(c - 2 * n * sin(y)) / n;
    return [r * sin(x *= n), r0 - r * cos(x)];
  }

  project.invert = function(x, y) {
    var r0y = r0 - y;
    return [atan2(x, abs(r0y)) / n * sign(r0y), asin((c - (x * x + r0y * r0y) * n * n) / (2 * n))];
  };

  return project;
}

var conicEqualArea = function() {
  return conicProjection(conicEqualAreaRaw)
      .scale(155.424)
      .center([0, 33.6442]);
};

var albers = function() {
  return conicEqualArea()
      .parallels([29.5, 45.5])
      .scale(1070)
      .translate([480, 250])
      .rotate([96, 0])
      .center([-0.6, 38.7]);
};

// The projections must have mutually exclusive clip regions on the sphere,
// as this will avoid emitting interleaving lines and polygons.
function multiplex(streams) {
  var n = streams.length;
  return {
    point: function(x, y) { var i = -1; while (++i < n) streams[i].point(x, y); },
    sphere: function() { var i = -1; while (++i < n) streams[i].sphere(); },
    lineStart: function() { var i = -1; while (++i < n) streams[i].lineStart(); },
    lineEnd: function() { var i = -1; while (++i < n) streams[i].lineEnd(); },
    polygonStart: function() { var i = -1; while (++i < n) streams[i].polygonStart(); },
    polygonEnd: function() { var i = -1; while (++i < n) streams[i].polygonEnd(); }
  };
}

// A composite projection for the United States, configured by default for
// 960×500. The projection also works quite well at 960×600 if you change the
// scale to 1285 and adjust the translate accordingly. The set of standard
// parallels for each region comes from USGS, which is published here:
// http://egsc.usgs.gov/isb/pubs/MapProjections/projections.html#albers
var albersUsa = function() {
  var cache,
      cacheStream,
      lower48 = albers(), lower48Point,
      alaska = conicEqualArea().rotate([154, 0]).center([-2, 58.5]).parallels([55, 65]), alaskaPoint, // EPSG:3338
      hawaii = conicEqualArea().rotate([157, 0]).center([-3, 19.9]).parallels([8, 18]), hawaiiPoint, // ESRI:102007
      point, pointStream = {point: function(x, y) { point = [x, y]; }};

  function albersUsa(coordinates) {
    var x = coordinates[0], y = coordinates[1];
    return point = null,
        (lower48Point.point(x, y), point)
        || (alaskaPoint.point(x, y), point)
        || (hawaiiPoint.point(x, y), point);
  }

  albersUsa.invert = function(coordinates) {
    var k = lower48.scale(),
        t = lower48.translate(),
        x = (coordinates[0] - t[0]) / k,
        y = (coordinates[1] - t[1]) / k;
    return (y >= 0.120 && y < 0.234 && x >= -0.425 && x < -0.214 ? alaska
        : y >= 0.166 && y < 0.234 && x >= -0.214 && x < -0.115 ? hawaii
        : lower48).invert(coordinates);
  };

  albersUsa.stream = function(stream) {
    return cache && cacheStream === stream ? cache : cache = multiplex([lower48.stream(cacheStream = stream), alaska.stream(stream), hawaii.stream(stream)]);
  };

  albersUsa.precision = function(_) {
    if (!arguments.length) return lower48.precision();
    lower48.precision(_), alaska.precision(_), hawaii.precision(_);
    return reset();
  };

  albersUsa.scale = function(_) {
    if (!arguments.length) return lower48.scale();
    lower48.scale(_), alaska.scale(_ * 0.35), hawaii.scale(_);
    return albersUsa.translate(lower48.translate());
  };

  albersUsa.translate = function(_) {
    if (!arguments.length) return lower48.translate();
    var k = lower48.scale(), x = +_[0], y = +_[1];

    lower48Point = lower48
        .translate(_)
        .clipExtent([[x - 0.455 * k, y - 0.238 * k], [x + 0.455 * k, y + 0.238 * k]])
        .stream(pointStream);

    alaskaPoint = alaska
        .translate([x - 0.307 * k, y + 0.201 * k])
        .clipExtent([[x - 0.425 * k + epsilon, y + 0.120 * k + epsilon], [x - 0.214 * k - epsilon, y + 0.234 * k - epsilon]])
        .stream(pointStream);

    hawaiiPoint = hawaii
        .translate([x - 0.205 * k, y + 0.212 * k])
        .clipExtent([[x - 0.214 * k + epsilon, y + 0.166 * k + epsilon], [x - 0.115 * k - epsilon, y + 0.234 * k - epsilon]])
        .stream(pointStream);

    return reset();
  };

  albersUsa.fitExtent = function(extent, object) {
    return fitExtent(albersUsa, extent, object);
  };

  albersUsa.fitSize = function(size, object) {
    return fitSize(albersUsa, size, object);
  };

  function reset() {
    cache = cacheStream = null;
    return albersUsa;
  }

  return albersUsa.scale(1070);
};

function azimuthalRaw(scale) {
  return function(x, y) {
    var cx = cos(x),
        cy = cos(y),
        k = scale(cx * cy);
    return [
      k * cy * sin(x),
      k * sin(y)
    ];
  }
}

function azimuthalInvert(angle) {
  return function(x, y) {
    var z = sqrt(x * x + y * y),
        c = angle(z),
        sc = sin(c),
        cc = cos(c);
    return [
      atan2(x * sc, z * cc),
      asin(z && y * sc / z)
    ];
  }
}

var azimuthalEqualAreaRaw = azimuthalRaw(function(cxcy) {
  return sqrt(2 / (1 + cxcy));
});

azimuthalEqualAreaRaw.invert = azimuthalInvert(function(z) {
  return 2 * asin(z / 2);
});

var azimuthalEqualArea = function() {
  return projection(azimuthalEqualAreaRaw)
      .scale(124.75)
      .clipAngle(180 - 1e-3);
};

var azimuthalEquidistantRaw = azimuthalRaw(function(c) {
  return (c = acos(c)) && c / sin(c);
});

azimuthalEquidistantRaw.invert = azimuthalInvert(function(z) {
  return z;
});

var azimuthalEquidistant = function() {
  return projection(azimuthalEquidistantRaw)
      .scale(79.4188)
      .clipAngle(180 - 1e-3);
};

function mercatorRaw(lambda, phi) {
  return [lambda, log(tan((halfPi + phi) / 2))];
}

mercatorRaw.invert = function(x, y) {
  return [x, 2 * atan(exp(y)) - halfPi];
};

var mercator = function() {
  return mercatorProjection(mercatorRaw)
      .scale(961 / tau);
};

function mercatorProjection(project) {
  var m = projection(project),
      scale = m.scale,
      translate = m.translate,
      clipExtent = m.clipExtent,
      clipAuto;

  m.scale = function(_) {
    return arguments.length ? (scale(_), clipAuto && m.clipExtent(null), m) : scale();
  };

  m.translate = function(_) {
    return arguments.length ? (translate(_), clipAuto && m.clipExtent(null), m) : translate();
  };

  m.clipExtent = function(_) {
    if (!arguments.length) return clipAuto ? null : clipExtent();
    if (clipAuto = _ == null) {
      var k = pi * scale(),
          t = translate();
      _ = [[t[0] - k, t[1] - k], [t[0] + k, t[1] + k]];
    }
    clipExtent(_);
    return m;
  };

  return m.clipExtent(null);
}

function tany(y) {
  return tan((halfPi + y) / 2);
}

function conicConformalRaw(y0, y1) {
  var cy0 = cos(y0),
      n = y0 === y1 ? sin(y0) : log(cy0 / cos(y1)) / log(tany(y1) / tany(y0)),
      f = cy0 * pow(tany(y0), n) / n;

  if (!n) return mercatorRaw;

  function project(x, y) {
    if (f > 0) { if (y < -halfPi + epsilon) y = -halfPi + epsilon; }
    else { if (y > halfPi - epsilon) y = halfPi - epsilon; }
    var r = f / pow(tany(y), n);
    return [r * sin(n * x), f - r * cos(n * x)];
  }

  project.invert = function(x, y) {
    var fy = f - y, r = sign(n) * sqrt(x * x + fy * fy);
    return [atan2(x, abs(fy)) / n * sign(fy), 2 * atan(pow(f / r, 1 / n)) - halfPi];
  };

  return project;
}

var conicConformal = function() {
  return conicProjection(conicConformalRaw)
      .scale(109.5)
      .parallels([30, 30]);
};

function equirectangularRaw(lambda, phi) {
  return [lambda, phi];
}

equirectangularRaw.invert = equirectangularRaw;

var equirectangular = function() {
  return projection(equirectangularRaw)
      .scale(152.63);
};

function conicEquidistantRaw(y0, y1) {
  var cy0 = cos(y0),
      n = y0 === y1 ? sin(y0) : (cy0 - cos(y1)) / (y1 - y0),
      g = cy0 / n + y0;

  if (abs(n) < epsilon) return equirectangularRaw;

  function project(x, y) {
    var gy = g - y, nx = n * x;
    return [gy * sin(nx), g - gy * cos(nx)];
  }

  project.invert = function(x, y) {
    var gy = g - y;
    return [atan2(x, abs(gy)) / n * sign(gy), g - sign(n) * sqrt(x * x + gy * gy)];
  };

  return project;
}

var conicEquidistant = function() {
  return conicProjection(conicEquidistantRaw)
      .scale(131.154)
      .center([0, 13.9389]);
};

function gnomonicRaw(x, y) {
  var cy = cos(y), k = cos(x) * cy;
  return [cy * sin(x) / k, sin(y) / k];
}

gnomonicRaw.invert = azimuthalInvert(atan);

var gnomonic = function() {
  return projection(gnomonicRaw)
      .scale(144.049)
      .clipAngle(60);
};

function scaleTranslate(kx, ky, tx, ty) {
  return kx === 1 && ky === 1 && tx === 0 && ty === 0 ? identity : transformer({
    point: function(x, y) {
      this.stream.point(x * kx + tx, y * ky + ty);
    }
  });
}

var identity$1 = function() {
  var k = 1, tx = 0, ty = 0, sx = 1, sy = 1, transform = identity, // scale, translate and reflect
      x0 = null, y0, x1, y1, clip = identity, // clip extent
      cache,
      cacheStream,
      projection;

  function reset() {
    cache = cacheStream = null;
    return projection;
  }

  return projection = {
    stream: function(stream) {
      return cache && cacheStream === stream ? cache : cache = transform(clip(cacheStream = stream));
    },
    clipExtent: function(_) {
      return arguments.length ? (clip = _ == null ? (x0 = y0 = x1 = y1 = null, identity) : clipExtent(x0 = +_[0][0], y0 = +_[0][1], x1 = +_[1][0], y1 = +_[1][1]), reset()) : x0 == null ? null : [[x0, y0], [x1, y1]];
    },
    scale: function(_) {
      return arguments.length ? (transform = scaleTranslate((k = +_) * sx, k * sy, tx, ty), reset()) : k;
    },
    translate: function(_) {
      return arguments.length ? (transform = scaleTranslate(k * sx, k * sy, tx = +_[0], ty = +_[1]), reset()) : [tx, ty];
    },
    reflectX: function(_) {
      return arguments.length ? (transform = scaleTranslate(k * (sx = _ ? -1 : 1), k * sy, tx, ty), reset()) : sx < 0;
    },
    reflectY: function(_) {
      return arguments.length ? (transform = scaleTranslate(k * sx, k * (sy = _ ? -1 : 1), tx, ty), reset()) : sy < 0;
    },
    fitExtent: function(extent, object) {
      return fitExtent(projection, extent, object);
    },
    fitSize: function(size, object) {
      return fitSize(projection, size, object);
    }
  };
};

function orthographicRaw(x, y) {
  return [cos(y) * sin(x), sin(y)];
}

orthographicRaw.invert = azimuthalInvert(asin);

var orthographic = function() {
  return projection(orthographicRaw)
      .scale(249.5)
      .clipAngle(90 + epsilon);
};

function stereographicRaw(x, y) {
  var cy = cos(y), k = 1 + cos(x) * cy;
  return [cy * sin(x) / k, sin(y) / k];
}

stereographicRaw.invert = azimuthalInvert(function(z) {
  return 2 * atan(z);
});

var stereographic = function() {
  return projection(stereographicRaw)
      .scale(250)
      .clipAngle(142);
};

function transverseMercatorRaw(lambda, phi) {
  return [log(tan((halfPi + phi) / 2)), -lambda];
}

transverseMercatorRaw.invert = function(x, y) {
  return [-y, 2 * atan(exp(x)) - halfPi];
};

var transverseMercator = function() {
  var m = mercatorProjection(transverseMercatorRaw),
      center = m.center,
      rotate = m.rotate;

  m.center = function(_) {
    return arguments.length ? center([-_[1], _[0]]) : (_ = center(), [_[1], -_[0]]);
  };

  m.rotate = function(_) {
    return arguments.length ? rotate([_[0], _[1], _.length > 2 ? _[2] + 90 : 90]) : (_ = rotate(), [_[0], _[1], _[2] - 90]);
  };

  return rotate([0, 0, 90])
      .scale(159.155);
};

exports.geoArea = area;
exports.geoBounds = bounds;
exports.geoCentroid = centroid;
exports.geoCircle = circle;
exports.geoClipExtent = extent;
exports.geoDistance = distance;
exports.geoGraticule = graticule;
exports.geoGraticule10 = graticule10;
exports.geoInterpolate = interpolate;
exports.geoLength = length;
exports.geoPath = index;
exports.geoAlbers = albers;
exports.geoAlbersUsa = albersUsa;
exports.geoAzimuthalEqualArea = azimuthalEqualArea;
exports.geoAzimuthalEqualAreaRaw = azimuthalEqualAreaRaw;
exports.geoAzimuthalEquidistant = azimuthalEquidistant;
exports.geoAzimuthalEquidistantRaw = azimuthalEquidistantRaw;
exports.geoConicConformal = conicConformal;
exports.geoConicConformalRaw = conicConformalRaw;
exports.geoConicEqualArea = conicEqualArea;
exports.geoConicEqualAreaRaw = conicEqualAreaRaw;
exports.geoConicEquidistant = conicEquidistant;
exports.geoConicEquidistantRaw = conicEquidistantRaw;
exports.geoEquirectangular = equirectangular;
exports.geoEquirectangularRaw = equirectangularRaw;
exports.geoGnomonic = gnomonic;
exports.geoGnomonicRaw = gnomonicRaw;
exports.geoIdentity = identity$1;
exports.geoProjection = projection;
exports.geoProjectionMutator = projectionMutator;
exports.geoMercator = mercator;
exports.geoMercatorRaw = mercatorRaw;
exports.geoOrthographic = orthographic;
exports.geoOrthographicRaw = orthographicRaw;
exports.geoStereographic = stereographic;
exports.geoStereographicRaw = stereographicRaw;
exports.geoTransverseMercator = transverseMercator;
exports.geoTransverseMercatorRaw = transverseMercatorRaw;
exports.geoRotation = rotation;
exports.geoStream = geoStream;
exports.geoTransform = transform;

Object.defineProperty(exports, '__esModule', { value: true });

})));

},{"d3-array":1}],6:[function(require,module,exports){
// https://d3js.org/d3-interpolate/ Version 1.1.3. Copyright 2017 Mike Bostock.
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('d3-color')) :
  typeof define === 'function' && define.amd ? define(['exports', 'd3-color'], factory) :
  (factory((global.d3 = global.d3 || {}),global.d3));
}(this, (function (exports,d3Color) { 'use strict';

function basis(t1, v0, v1, v2, v3) {
  var t2 = t1 * t1, t3 = t2 * t1;
  return ((1 - 3 * t1 + 3 * t2 - t3) * v0
      + (4 - 6 * t2 + 3 * t3) * v1
      + (1 + 3 * t1 + 3 * t2 - 3 * t3) * v2
      + t3 * v3) / 6;
}

var basis$1 = function(values) {
  var n = values.length - 1;
  return function(t) {
    var i = t <= 0 ? (t = 0) : t >= 1 ? (t = 1, n - 1) : Math.floor(t * n),
        v1 = values[i],
        v2 = values[i + 1],
        v0 = i > 0 ? values[i - 1] : 2 * v1 - v2,
        v3 = i < n - 1 ? values[i + 2] : 2 * v2 - v1;
    return basis((t - i / n) * n, v0, v1, v2, v3);
  };
};

var basisClosed = function(values) {
  var n = values.length;
  return function(t) {
    var i = Math.floor(((t %= 1) < 0 ? ++t : t) * n),
        v0 = values[(i + n - 1) % n],
        v1 = values[i % n],
        v2 = values[(i + 1) % n],
        v3 = values[(i + 2) % n];
    return basis((t - i / n) * n, v0, v1, v2, v3);
  };
};

var constant = function(x) {
  return function() {
    return x;
  };
};

function linear(a, d) {
  return function(t) {
    return a + t * d;
  };
}

function exponential(a, b, y) {
  return a = Math.pow(a, y), b = Math.pow(b, y) - a, y = 1 / y, function(t) {
    return Math.pow(a + t * b, y);
  };
}

function hue(a, b) {
  var d = b - a;
  return d ? linear(a, d > 180 || d < -180 ? d - 360 * Math.round(d / 360) : d) : constant(isNaN(a) ? b : a);
}

function gamma(y) {
  return (y = +y) === 1 ? nogamma : function(a, b) {
    return b - a ? exponential(a, b, y) : constant(isNaN(a) ? b : a);
  };
}

function nogamma(a, b) {
  var d = b - a;
  return d ? linear(a, d) : constant(isNaN(a) ? b : a);
}

var rgb$1 = ((function rgbGamma(y) {
  var color$$1 = gamma(y);

  function rgb$$1(start, end) {
    var r = color$$1((start = d3Color.rgb(start)).r, (end = d3Color.rgb(end)).r),
        g = color$$1(start.g, end.g),
        b = color$$1(start.b, end.b),
        opacity = nogamma(start.opacity, end.opacity);
    return function(t) {
      start.r = r(t);
      start.g = g(t);
      start.b = b(t);
      start.opacity = opacity(t);
      return start + "";
    };
  }

  rgb$$1.gamma = rgbGamma;

  return rgb$$1;
}))(1);

function rgbSpline(spline) {
  return function(colors) {
    var n = colors.length,
        r = new Array(n),
        g = new Array(n),
        b = new Array(n),
        i, color$$1;
    for (i = 0; i < n; ++i) {
      color$$1 = d3Color.rgb(colors[i]);
      r[i] = color$$1.r || 0;
      g[i] = color$$1.g || 0;
      b[i] = color$$1.b || 0;
    }
    r = spline(r);
    g = spline(g);
    b = spline(b);
    color$$1.opacity = 1;
    return function(t) {
      color$$1.r = r(t);
      color$$1.g = g(t);
      color$$1.b = b(t);
      return color$$1 + "";
    };
  };
}

var rgbBasis = rgbSpline(basis$1);
var rgbBasisClosed = rgbSpline(basisClosed);

var array = function(a, b) {
  var nb = b ? b.length : 0,
      na = a ? Math.min(nb, a.length) : 0,
      x = new Array(nb),
      c = new Array(nb),
      i;

  for (i = 0; i < na; ++i) x[i] = value(a[i], b[i]);
  for (; i < nb; ++i) c[i] = b[i];

  return function(t) {
    for (i = 0; i < na; ++i) c[i] = x[i](t);
    return c;
  };
};

var date = function(a, b) {
  var d = new Date;
  return a = +a, b -= a, function(t) {
    return d.setTime(a + b * t), d;
  };
};

var number = function(a, b) {
  return a = +a, b -= a, function(t) {
    return a + b * t;
  };
};

var object = function(a, b) {
  var i = {},
      c = {},
      k;

  if (a === null || typeof a !== "object") a = {};
  if (b === null || typeof b !== "object") b = {};

  for (k in b) {
    if (k in a) {
      i[k] = value(a[k], b[k]);
    } else {
      c[k] = b[k];
    }
  }

  return function(t) {
    for (k in i) c[k] = i[k](t);
    return c;
  };
};

var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g;
var reB = new RegExp(reA.source, "g");

function zero(b) {
  return function() {
    return b;
  };
}

function one(b) {
  return function(t) {
    return b(t) + "";
  };
}

var string = function(a, b) {
  var bi = reA.lastIndex = reB.lastIndex = 0, // scan index for next number in b
      am, // current match in a
      bm, // current match in b
      bs, // string preceding current number in b, if any
      i = -1, // index in s
      s = [], // string constants and placeholders
      q = []; // number interpolators

  // Coerce inputs to strings.
  a = a + "", b = b + "";

  // Interpolate pairs of numbers in a & b.
  while ((am = reA.exec(a))
      && (bm = reB.exec(b))) {
    if ((bs = bm.index) > bi) { // a string precedes the next number in b
      bs = b.slice(bi, bs);
      if (s[i]) s[i] += bs; // coalesce with previous string
      else s[++i] = bs;
    }
    if ((am = am[0]) === (bm = bm[0])) { // numbers in a & b match
      if (s[i]) s[i] += bm; // coalesce with previous string
      else s[++i] = bm;
    } else { // interpolate non-matching numbers
      s[++i] = null;
      q.push({i: i, x: number(am, bm)});
    }
    bi = reB.lastIndex;
  }

  // Add remains of b.
  if (bi < b.length) {
    bs = b.slice(bi);
    if (s[i]) s[i] += bs; // coalesce with previous string
    else s[++i] = bs;
  }

  // Special optimization for only a single match.
  // Otherwise, interpolate each of the numbers and rejoin the string.
  return s.length < 2 ? (q[0]
      ? one(q[0].x)
      : zero(b))
      : (b = q.length, function(t) {
          for (var i = 0, o; i < b; ++i) s[(o = q[i]).i] = o.x(t);
          return s.join("");
        });
};

var value = function(a, b) {
  var t = typeof b, c;
  return b == null || t === "boolean" ? constant(b)
      : (t === "number" ? number
      : t === "string" ? ((c = d3Color.color(b)) ? (b = c, rgb$1) : string)
      : b instanceof d3Color.color ? rgb$1
      : b instanceof Date ? date
      : Array.isArray(b) ? array
      : isNaN(b) ? object
      : number)(a, b);
};

var round = function(a, b) {
  return a = +a, b -= a, function(t) {
    return Math.round(a + b * t);
  };
};

var degrees = 180 / Math.PI;

var identity = {
  translateX: 0,
  translateY: 0,
  rotate: 0,
  skewX: 0,
  scaleX: 1,
  scaleY: 1
};

var decompose = function(a, b, c, d, e, f) {
  var scaleX, scaleY, skewX;
  if (scaleX = Math.sqrt(a * a + b * b)) a /= scaleX, b /= scaleX;
  if (skewX = a * c + b * d) c -= a * skewX, d -= b * skewX;
  if (scaleY = Math.sqrt(c * c + d * d)) c /= scaleY, d /= scaleY, skewX /= scaleY;
  if (a * d < b * c) a = -a, b = -b, skewX = -skewX, scaleX = -scaleX;
  return {
    translateX: e,
    translateY: f,
    rotate: Math.atan2(b, a) * degrees,
    skewX: Math.atan(skewX) * degrees,
    scaleX: scaleX,
    scaleY: scaleY
  };
};

var cssNode;
var cssRoot;
var cssView;
var svgNode;

function parseCss(value) {
  if (value === "none") return identity;
  if (!cssNode) cssNode = document.createElement("DIV"), cssRoot = document.documentElement, cssView = document.defaultView;
  cssNode.style.transform = value;
  value = cssView.getComputedStyle(cssRoot.appendChild(cssNode), null).getPropertyValue("transform");
  cssRoot.removeChild(cssNode);
  value = value.slice(7, -1).split(",");
  return decompose(+value[0], +value[1], +value[2], +value[3], +value[4], +value[5]);
}

function parseSvg(value) {
  if (value == null) return identity;
  if (!svgNode) svgNode = document.createElementNS("http://www.w3.org/2000/svg", "g");
  svgNode.setAttribute("transform", value);
  if (!(value = svgNode.transform.baseVal.consolidate())) return identity;
  value = value.matrix;
  return decompose(value.a, value.b, value.c, value.d, value.e, value.f);
}

function interpolateTransform(parse, pxComma, pxParen, degParen) {

  function pop(s) {
    return s.length ? s.pop() + " " : "";
  }

  function translate(xa, ya, xb, yb, s, q) {
    if (xa !== xb || ya !== yb) {
      var i = s.push("translate(", null, pxComma, null, pxParen);
      q.push({i: i - 4, x: number(xa, xb)}, {i: i - 2, x: number(ya, yb)});
    } else if (xb || yb) {
      s.push("translate(" + xb + pxComma + yb + pxParen);
    }
  }

  function rotate(a, b, s, q) {
    if (a !== b) {
      if (a - b > 180) b += 360; else if (b - a > 180) a += 360; // shortest path
      q.push({i: s.push(pop(s) + "rotate(", null, degParen) - 2, x: number(a, b)});
    } else if (b) {
      s.push(pop(s) + "rotate(" + b + degParen);
    }
  }

  function skewX(a, b, s, q) {
    if (a !== b) {
      q.push({i: s.push(pop(s) + "skewX(", null, degParen) - 2, x: number(a, b)});
    } else if (b) {
      s.push(pop(s) + "skewX(" + b + degParen);
    }
  }

  function scale(xa, ya, xb, yb, s, q) {
    if (xa !== xb || ya !== yb) {
      var i = s.push(pop(s) + "scale(", null, ",", null, ")");
      q.push({i: i - 4, x: number(xa, xb)}, {i: i - 2, x: number(ya, yb)});
    } else if (xb !== 1 || yb !== 1) {
      s.push(pop(s) + "scale(" + xb + "," + yb + ")");
    }
  }

  return function(a, b) {
    var s = [], // string constants and placeholders
        q = []; // number interpolators
    a = parse(a), b = parse(b);
    translate(a.translateX, a.translateY, b.translateX, b.translateY, s, q);
    rotate(a.rotate, b.rotate, s, q);
    skewX(a.skewX, b.skewX, s, q);
    scale(a.scaleX, a.scaleY, b.scaleX, b.scaleY, s, q);
    a = b = null; // gc
    return function(t) {
      var i = -1, n = q.length, o;
      while (++i < n) s[(o = q[i]).i] = o.x(t);
      return s.join("");
    };
  };
}

var interpolateTransformCss = interpolateTransform(parseCss, "px, ", "px)", "deg)");
var interpolateTransformSvg = interpolateTransform(parseSvg, ", ", ")", ")");

var rho = Math.SQRT2;
var rho2 = 2;
var rho4 = 4;
var epsilon2 = 1e-12;

function cosh(x) {
  return ((x = Math.exp(x)) + 1 / x) / 2;
}

function sinh(x) {
  return ((x = Math.exp(x)) - 1 / x) / 2;
}

function tanh(x) {
  return ((x = Math.exp(2 * x)) - 1) / (x + 1);
}

// p0 = [ux0, uy0, w0]
// p1 = [ux1, uy1, w1]
var zoom = function(p0, p1) {
  var ux0 = p0[0], uy0 = p0[1], w0 = p0[2],
      ux1 = p1[0], uy1 = p1[1], w1 = p1[2],
      dx = ux1 - ux0,
      dy = uy1 - uy0,
      d2 = dx * dx + dy * dy,
      i,
      S;

  // Special case for u0 ≅ u1.
  if (d2 < epsilon2) {
    S = Math.log(w1 / w0) / rho;
    i = function(t) {
      return [
        ux0 + t * dx,
        uy0 + t * dy,
        w0 * Math.exp(rho * t * S)
      ];
    };
  }

  // General case.
  else {
    var d1 = Math.sqrt(d2),
        b0 = (w1 * w1 - w0 * w0 + rho4 * d2) / (2 * w0 * rho2 * d1),
        b1 = (w1 * w1 - w0 * w0 - rho4 * d2) / (2 * w1 * rho2 * d1),
        r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0),
        r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1);
    S = (r1 - r0) / rho;
    i = function(t) {
      var s = t * S,
          coshr0 = cosh(r0),
          u = w0 / (rho2 * d1) * (coshr0 * tanh(rho * s + r0) - sinh(r0));
      return [
        ux0 + u * dx,
        uy0 + u * dy,
        w0 * coshr0 / cosh(rho * s + r0)
      ];
    };
  }

  i.duration = S * 1000;

  return i;
};

function hsl$1(hue$$1) {
  return function(start, end) {
    var h = hue$$1((start = d3Color.hsl(start)).h, (end = d3Color.hsl(end)).h),
        s = nogamma(start.s, end.s),
        l = nogamma(start.l, end.l),
        opacity = nogamma(start.opacity, end.opacity);
    return function(t) {
      start.h = h(t);
      start.s = s(t);
      start.l = l(t);
      start.opacity = opacity(t);
      return start + "";
    };
  }
}

var hsl$2 = hsl$1(hue);
var hslLong = hsl$1(nogamma);

function lab$1(start, end) {
  var l = nogamma((start = d3Color.lab(start)).l, (end = d3Color.lab(end)).l),
      a = nogamma(start.a, end.a),
      b = nogamma(start.b, end.b),
      opacity = nogamma(start.opacity, end.opacity);
  return function(t) {
    start.l = l(t);
    start.a = a(t);
    start.b = b(t);
    start.opacity = opacity(t);
    return start + "";
  };
}

function hcl$1(hue$$1) {
  return function(start, end) {
    var h = hue$$1((start = d3Color.hcl(start)).h, (end = d3Color.hcl(end)).h),
        c = nogamma(start.c, end.c),
        l = nogamma(start.l, end.l),
        opacity = nogamma(start.opacity, end.opacity);
    return function(t) {
      start.h = h(t);
      start.c = c(t);
      start.l = l(t);
      start.opacity = opacity(t);
      return start + "";
    };
  }
}

var hcl$2 = hcl$1(hue);
var hclLong = hcl$1(nogamma);

function cubehelix$1(hue$$1) {
  return (function cubehelixGamma(y) {
    y = +y;

    function cubehelix$$1(start, end) {
      var h = hue$$1((start = d3Color.cubehelix(start)).h, (end = d3Color.cubehelix(end)).h),
          s = nogamma(start.s, end.s),
          l = nogamma(start.l, end.l),
          opacity = nogamma(start.opacity, end.opacity);
      return function(t) {
        start.h = h(t);
        start.s = s(t);
        start.l = l(Math.pow(t, y));
        start.opacity = opacity(t);
        return start + "";
      };
    }

    cubehelix$$1.gamma = cubehelixGamma;

    return cubehelix$$1;
  })(1);
}

var cubehelix$2 = cubehelix$1(hue);
var cubehelixLong = cubehelix$1(nogamma);

var quantize = function(interpolator, n) {
  var samples = new Array(n);
  for (var i = 0; i < n; ++i) samples[i] = interpolator(i / (n - 1));
  return samples;
};

exports.interpolate = value;
exports.interpolateArray = array;
exports.interpolateBasis = basis$1;
exports.interpolateBasisClosed = basisClosed;
exports.interpolateDate = date;
exports.interpolateNumber = number;
exports.interpolateObject = object;
exports.interpolateRound = round;
exports.interpolateString = string;
exports.interpolateTransformCss = interpolateTransformCss;
exports.interpolateTransformSvg = interpolateTransformSvg;
exports.interpolateZoom = zoom;
exports.interpolateRgb = rgb$1;
exports.interpolateRgbBasis = rgbBasis;
exports.interpolateRgbBasisClosed = rgbBasisClosed;
exports.interpolateHsl = hsl$2;
exports.interpolateHslLong = hslLong;
exports.interpolateLab = lab$1;
exports.interpolateHcl = hcl$2;
exports.interpolateHclLong = hclLong;
exports.interpolateCubehelix = cubehelix$2;
exports.interpolateCubehelixLong = cubehelixLong;
exports.quantize = quantize;

Object.defineProperty(exports, '__esModule', { value: true });

})));

},{"d3-color":3}],7:[function(require,module,exports){
// https://d3js.org/d3-scale/ Version 1.0.4. Copyright 2016 Mike Bostock.
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('d3-array'), require('d3-collection'), require('d3-interpolate'), require('d3-format'), require('d3-time'), require('d3-time-format'), require('d3-color')) :
  typeof define === 'function' && define.amd ? define(['exports', 'd3-array', 'd3-collection', 'd3-interpolate', 'd3-format', 'd3-time', 'd3-time-format', 'd3-color'], factory) :
  (factory((global.d3 = global.d3 || {}),global.d3,global.d3,global.d3,global.d3,global.d3,global.d3,global.d3));
}(this, (function (exports,d3Array,d3Collection,d3Interpolate,d3Format,d3Time,d3TimeFormat,d3Color) { 'use strict';

var array = Array.prototype;

var map$1 = array.map;
var slice = array.slice;

var implicit = {name: "implicit"};

function ordinal(range$$1) {
  var index = d3Collection.map(),
      domain = [],
      unknown = implicit;

  range$$1 = range$$1 == null ? [] : slice.call(range$$1);

  function scale(d) {
    var key = d + "", i = index.get(key);
    if (!i) {
      if (unknown !== implicit) return unknown;
      index.set(key, i = domain.push(d));
    }
    return range$$1[(i - 1) % range$$1.length];
  }

  scale.domain = function(_) {
    if (!arguments.length) return domain.slice();
    domain = [], index = d3Collection.map();
    var i = -1, n = _.length, d, key;
    while (++i < n) if (!index.has(key = (d = _[i]) + "")) index.set(key, domain.push(d));
    return scale;
  };

  scale.range = function(_) {
    return arguments.length ? (range$$1 = slice.call(_), scale) : range$$1.slice();
  };

  scale.unknown = function(_) {
    return arguments.length ? (unknown = _, scale) : unknown;
  };

  scale.copy = function() {
    return ordinal()
        .domain(domain)
        .range(range$$1)
        .unknown(unknown);
  };

  return scale;
}

function band() {
  var scale = ordinal().unknown(undefined),
      domain = scale.domain,
      ordinalRange = scale.range,
      range$$1 = [0, 1],
      step,
      bandwidth,
      round = false,
      paddingInner = 0,
      paddingOuter = 0,
      align = 0.5;

  delete scale.unknown;

  function rescale() {
    var n = domain().length,
        reverse = range$$1[1] < range$$1[0],
        start = range$$1[reverse - 0],
        stop = range$$1[1 - reverse];
    step = (stop - start) / Math.max(1, n - paddingInner + paddingOuter * 2);
    if (round) step = Math.floor(step);
    start += (stop - start - step * (n - paddingInner)) * align;
    bandwidth = step * (1 - paddingInner);
    if (round) start = Math.round(start), bandwidth = Math.round(bandwidth);
    var values = d3Array.range(n).map(function(i) { return start + step * i; });
    return ordinalRange(reverse ? values.reverse() : values);
  }

  scale.domain = function(_) {
    return arguments.length ? (domain(_), rescale()) : domain();
  };

  scale.range = function(_) {
    return arguments.length ? (range$$1 = [+_[0], +_[1]], rescale()) : range$$1.slice();
  };

  scale.rangeRound = function(_) {
    return range$$1 = [+_[0], +_[1]], round = true, rescale();
  };

  scale.bandwidth = function() {
    return bandwidth;
  };

  scale.step = function() {
    return step;
  };

  scale.round = function(_) {
    return arguments.length ? (round = !!_, rescale()) : round;
  };

  scale.padding = function(_) {
    return arguments.length ? (paddingInner = paddingOuter = Math.max(0, Math.min(1, _)), rescale()) : paddingInner;
  };

  scale.paddingInner = function(_) {
    return arguments.length ? (paddingInner = Math.max(0, Math.min(1, _)), rescale()) : paddingInner;
  };

  scale.paddingOuter = function(_) {
    return arguments.length ? (paddingOuter = Math.max(0, Math.min(1, _)), rescale()) : paddingOuter;
  };

  scale.align = function(_) {
    return arguments.length ? (align = Math.max(0, Math.min(1, _)), rescale()) : align;
  };

  scale.copy = function() {
    return band()
        .domain(domain())
        .range(range$$1)
        .round(round)
        .paddingInner(paddingInner)
        .paddingOuter(paddingOuter)
        .align(align);
  };

  return rescale();
}

function pointish(scale) {
  var copy = scale.copy;

  scale.padding = scale.paddingOuter;
  delete scale.paddingInner;
  delete scale.paddingOuter;

  scale.copy = function() {
    return pointish(copy());
  };

  return scale;
}

function point() {
  return pointish(band().paddingInner(1));
}

var constant = function(x) {
  return function() {
    return x;
  };
};

var number = function(x) {
  return +x;
};

var unit = [0, 1];

function deinterpolateLinear(a, b) {
  return (b -= (a = +a))
      ? function(x) { return (x - a) / b; }
      : constant(b);
}

function deinterpolateClamp(deinterpolate) {
  return function(a, b) {
    var d = deinterpolate(a = +a, b = +b);
    return function(x) { return x <= a ? 0 : x >= b ? 1 : d(x); };
  };
}

function reinterpolateClamp(reinterpolate) {
  return function(a, b) {
    var r = reinterpolate(a = +a, b = +b);
    return function(t) { return t <= 0 ? a : t >= 1 ? b : r(t); };
  };
}

function bimap(domain, range$$1, deinterpolate, reinterpolate) {
  var d0 = domain[0], d1 = domain[1], r0 = range$$1[0], r1 = range$$1[1];
  if (d1 < d0) d0 = deinterpolate(d1, d0), r0 = reinterpolate(r1, r0);
  else d0 = deinterpolate(d0, d1), r0 = reinterpolate(r0, r1);
  return function(x) { return r0(d0(x)); };
}

function polymap(domain, range$$1, deinterpolate, reinterpolate) {
  var j = Math.min(domain.length, range$$1.length) - 1,
      d = new Array(j),
      r = new Array(j),
      i = -1;

  // Reverse descending domains.
  if (domain[j] < domain[0]) {
    domain = domain.slice().reverse();
    range$$1 = range$$1.slice().reverse();
  }

  while (++i < j) {
    d[i] = deinterpolate(domain[i], domain[i + 1]);
    r[i] = reinterpolate(range$$1[i], range$$1[i + 1]);
  }

  return function(x) {
    var i = d3Array.bisect(domain, x, 1, j) - 1;
    return r[i](d[i](x));
  };
}

function copy(source, target) {
  return target
      .domain(source.domain())
      .range(source.range())
      .interpolate(source.interpolate())
      .clamp(source.clamp());
}

// deinterpolate(a, b)(x) takes a domain value x in [a,b] and returns the corresponding parameter t in [0,1].
// reinterpolate(a, b)(t) takes a parameter t in [0,1] and returns the corresponding domain value x in [a,b].
function continuous(deinterpolate, reinterpolate) {
  var domain = unit,
      range$$1 = unit,
      interpolate$$1 = d3Interpolate.interpolate,
      clamp = false,
      piecewise,
      output,
      input;

  function rescale() {
    piecewise = Math.min(domain.length, range$$1.length) > 2 ? polymap : bimap;
    output = input = null;
    return scale;
  }

  function scale(x) {
    return (output || (output = piecewise(domain, range$$1, clamp ? deinterpolateClamp(deinterpolate) : deinterpolate, interpolate$$1)))(+x);
  }

  scale.invert = function(y) {
    return (input || (input = piecewise(range$$1, domain, deinterpolateLinear, clamp ? reinterpolateClamp(reinterpolate) : reinterpolate)))(+y);
  };

  scale.domain = function(_) {
    return arguments.length ? (domain = map$1.call(_, number), rescale()) : domain.slice();
  };

  scale.range = function(_) {
    return arguments.length ? (range$$1 = slice.call(_), rescale()) : range$$1.slice();
  };

  scale.rangeRound = function(_) {
    return range$$1 = slice.call(_), interpolate$$1 = d3Interpolate.interpolateRound, rescale();
  };

  scale.clamp = function(_) {
    return arguments.length ? (clamp = !!_, rescale()) : clamp;
  };

  scale.interpolate = function(_) {
    return arguments.length ? (interpolate$$1 = _, rescale()) : interpolate$$1;
  };

  return rescale();
}

var tickFormat = function(domain, count, specifier) {
  var start = domain[0],
      stop = domain[domain.length - 1],
      step = d3Array.tickStep(start, stop, count == null ? 10 : count),
      precision;
  specifier = d3Format.formatSpecifier(specifier == null ? ",f" : specifier);
  switch (specifier.type) {
    case "s": {
      var value = Math.max(Math.abs(start), Math.abs(stop));
      if (specifier.precision == null && !isNaN(precision = d3Format.precisionPrefix(step, value))) specifier.precision = precision;
      return d3Format.formatPrefix(specifier, value);
    }
    case "":
    case "e":
    case "g":
    case "p":
    case "r": {
      if (specifier.precision == null && !isNaN(precision = d3Format.precisionRound(step, Math.max(Math.abs(start), Math.abs(stop))))) specifier.precision = precision - (specifier.type === "e");
      break;
    }
    case "f":
    case "%": {
      if (specifier.precision == null && !isNaN(precision = d3Format.precisionFixed(step))) specifier.precision = precision - (specifier.type === "%") * 2;
      break;
    }
  }
  return d3Format.format(specifier);
};

function linearish(scale) {
  var domain = scale.domain;

  scale.ticks = function(count) {
    var d = domain();
    return d3Array.ticks(d[0], d[d.length - 1], count == null ? 10 : count);
  };

  scale.tickFormat = function(count, specifier) {
    return tickFormat(domain(), count, specifier);
  };

  scale.nice = function(count) {
    var d = domain(),
        i = d.length - 1,
        n = count == null ? 10 : count,
        start = d[0],
        stop = d[i],
        step = d3Array.tickStep(start, stop, n);

    if (step) {
      step = d3Array.tickStep(Math.floor(start / step) * step, Math.ceil(stop / step) * step, n);
      d[0] = Math.floor(start / step) * step;
      d[i] = Math.ceil(stop / step) * step;
      domain(d);
    }

    return scale;
  };

  return scale;
}

function linear() {
  var scale = continuous(deinterpolateLinear, d3Interpolate.interpolateNumber);

  scale.copy = function() {
    return copy(scale, linear());
  };

  return linearish(scale);
}

function identity() {
  var domain = [0, 1];

  function scale(x) {
    return +x;
  }

  scale.invert = scale;

  scale.domain = scale.range = function(_) {
    return arguments.length ? (domain = map$1.call(_, number), scale) : domain.slice();
  };

  scale.copy = function() {
    return identity().domain(domain);
  };

  return linearish(scale);
}

var nice = function(domain, interval) {
  domain = domain.slice();

  var i0 = 0,
      i1 = domain.length - 1,
      x0 = domain[i0],
      x1 = domain[i1],
      t;

  if (x1 < x0) {
    t = i0, i0 = i1, i1 = t;
    t = x0, x0 = x1, x1 = t;
  }

  domain[i0] = interval.floor(x0);
  domain[i1] = interval.ceil(x1);
  return domain;
};

function deinterpolate(a, b) {
  return (b = Math.log(b / a))
      ? function(x) { return Math.log(x / a) / b; }
      : constant(b);
}

function reinterpolate(a, b) {
  return a < 0
      ? function(t) { return -Math.pow(-b, t) * Math.pow(-a, 1 - t); }
      : function(t) { return Math.pow(b, t) * Math.pow(a, 1 - t); };
}

function pow10(x) {
  return isFinite(x) ? +("1e" + x) : x < 0 ? 0 : x;
}

function powp(base) {
  return base === 10 ? pow10
      : base === Math.E ? Math.exp
      : function(x) { return Math.pow(base, x); };
}

function logp(base) {
  return base === Math.E ? Math.log
      : base === 10 && Math.log10
      || base === 2 && Math.log2
      || (base = Math.log(base), function(x) { return Math.log(x) / base; });
}

function reflect(f) {
  return function(x) {
    return -f(-x);
  };
}

function log() {
  var scale = continuous(deinterpolate, reinterpolate).domain([1, 10]),
      domain = scale.domain,
      base = 10,
      logs = logp(10),
      pows = powp(10);

  function rescale() {
    logs = logp(base), pows = powp(base);
    if (domain()[0] < 0) logs = reflect(logs), pows = reflect(pows);
    return scale;
  }

  scale.base = function(_) {
    return arguments.length ? (base = +_, rescale()) : base;
  };

  scale.domain = function(_) {
    return arguments.length ? (domain(_), rescale()) : domain();
  };

  scale.ticks = function(count) {
    var d = domain(),
        u = d[0],
        v = d[d.length - 1],
        r;

    if (r = v < u) i = u, u = v, v = i;

    var i = logs(u),
        j = logs(v),
        p,
        k,
        t,
        n = count == null ? 10 : +count,
        z = [];

    if (!(base % 1) && j - i < n) {
      i = Math.round(i) - 1, j = Math.round(j) + 1;
      if (u > 0) for (; i < j; ++i) {
        for (k = 1, p = pows(i); k < base; ++k) {
          t = p * k;
          if (t < u) continue;
          if (t > v) break;
          z.push(t);
        }
      } else for (; i < j; ++i) {
        for (k = base - 1, p = pows(i); k >= 1; --k) {
          t = p * k;
          if (t < u) continue;
          if (t > v) break;
          z.push(t);
        }
      }
    } else {
      z = d3Array.ticks(i, j, Math.min(j - i, n)).map(pows);
    }

    return r ? z.reverse() : z;
  };

  scale.tickFormat = function(count, specifier) {
    if (specifier == null) specifier = base === 10 ? ".0e" : ",";
    if (typeof specifier !== "function") specifier = d3Format.format(specifier);
    if (count === Infinity) return specifier;
    if (count == null) count = 10;
    var k = Math.max(1, base * count / scale.ticks().length); // TODO fast estimate?
    return function(d) {
      var i = d / pows(Math.round(logs(d)));
      if (i * base < base - 0.5) i *= base;
      return i <= k ? specifier(d) : "";
    };
  };

  scale.nice = function() {
    return domain(nice(domain(), {
      floor: function(x) { return pows(Math.floor(logs(x))); },
      ceil: function(x) { return pows(Math.ceil(logs(x))); }
    }));
  };

  scale.copy = function() {
    return copy(scale, log().base(base));
  };

  return scale;
}

function raise(x, exponent) {
  return x < 0 ? -Math.pow(-x, exponent) : Math.pow(x, exponent);
}

function pow() {
  var exponent = 1,
      scale = continuous(deinterpolate, reinterpolate),
      domain = scale.domain;

  function deinterpolate(a, b) {
    return (b = raise(b, exponent) - (a = raise(a, exponent)))
        ? function(x) { return (raise(x, exponent) - a) / b; }
        : constant(b);
  }

  function reinterpolate(a, b) {
    b = raise(b, exponent) - (a = raise(a, exponent));
    return function(t) { return raise(a + b * t, 1 / exponent); };
  }

  scale.exponent = function(_) {
    return arguments.length ? (exponent = +_, domain(domain())) : exponent;
  };

  scale.copy = function() {
    return copy(scale, pow().exponent(exponent));
  };

  return linearish(scale);
}

function sqrt() {
  return pow().exponent(0.5);
}

function quantile$1() {
  var domain = [],
      range$$1 = [],
      thresholds = [];

  function rescale() {
    var i = 0, n = Math.max(1, range$$1.length);
    thresholds = new Array(n - 1);
    while (++i < n) thresholds[i - 1] = d3Array.quantile(domain, i / n);
    return scale;
  }

  function scale(x) {
    if (!isNaN(x = +x)) return range$$1[d3Array.bisect(thresholds, x)];
  }

  scale.invertExtent = function(y) {
    var i = range$$1.indexOf(y);
    return i < 0 ? [NaN, NaN] : [
      i > 0 ? thresholds[i - 1] : domain[0],
      i < thresholds.length ? thresholds[i] : domain[domain.length - 1]
    ];
  };

  scale.domain = function(_) {
    if (!arguments.length) return domain.slice();
    domain = [];
    for (var i = 0, n = _.length, d; i < n; ++i) if (d = _[i], d != null && !isNaN(d = +d)) domain.push(d);
    domain.sort(d3Array.ascending);
    return rescale();
  };

  scale.range = function(_) {
    return arguments.length ? (range$$1 = slice.call(_), rescale()) : range$$1.slice();
  };

  scale.quantiles = function() {
    return thresholds.slice();
  };

  scale.copy = function() {
    return quantile$1()
        .domain(domain)
        .range(range$$1);
  };

  return scale;
}

function quantize() {
  var x0 = 0,
      x1 = 1,
      n = 1,
      domain = [0.5],
      range$$1 = [0, 1];

  function scale(x) {
    if (x <= x) return range$$1[d3Array.bisect(domain, x, 0, n)];
  }

  function rescale() {
    var i = -1;
    domain = new Array(n);
    while (++i < n) domain[i] = ((i + 1) * x1 - (i - n) * x0) / (n + 1);
    return scale;
  }

  scale.domain = function(_) {
    return arguments.length ? (x0 = +_[0], x1 = +_[1], rescale()) : [x0, x1];
  };

  scale.range = function(_) {
    return arguments.length ? (n = (range$$1 = slice.call(_)).length - 1, rescale()) : range$$1.slice();
  };

  scale.invertExtent = function(y) {
    var i = range$$1.indexOf(y);
    return i < 0 ? [NaN, NaN]
        : i < 1 ? [x0, domain[0]]
        : i >= n ? [domain[n - 1], x1]
        : [domain[i - 1], domain[i]];
  };

  scale.copy = function() {
    return quantize()
        .domain([x0, x1])
        .range(range$$1);
  };

  return linearish(scale);
}

function threshold() {
  var domain = [0.5],
      range$$1 = [0, 1],
      n = 1;

  function scale(x) {
    if (x <= x) return range$$1[d3Array.bisect(domain, x, 0, n)];
  }

  scale.domain = function(_) {
    return arguments.length ? (domain = slice.call(_), n = Math.min(domain.length, range$$1.length - 1), scale) : domain.slice();
  };

  scale.range = function(_) {
    return arguments.length ? (range$$1 = slice.call(_), n = Math.min(domain.length, range$$1.length - 1), scale) : range$$1.slice();
  };

  scale.invertExtent = function(y) {
    var i = range$$1.indexOf(y);
    return [domain[i - 1], domain[i]];
  };

  scale.copy = function() {
    return threshold()
        .domain(domain)
        .range(range$$1);
  };

  return scale;
}

var durationSecond = 1000;
var durationMinute = durationSecond * 60;
var durationHour = durationMinute * 60;
var durationDay = durationHour * 24;
var durationWeek = durationDay * 7;
var durationMonth = durationDay * 30;
var durationYear = durationDay * 365;

function date(t) {
  return new Date(t);
}

function number$1(t) {
  return t instanceof Date ? +t : +new Date(+t);
}

function calendar(year, month, week, day, hour, minute, second, millisecond, format$$1) {
  var scale = continuous(deinterpolateLinear, d3Interpolate.interpolateNumber),
      invert = scale.invert,
      domain = scale.domain;

  var formatMillisecond = format$$1(".%L"),
      formatSecond = format$$1(":%S"),
      formatMinute = format$$1("%I:%M"),
      formatHour = format$$1("%I %p"),
      formatDay = format$$1("%a %d"),
      formatWeek = format$$1("%b %d"),
      formatMonth = format$$1("%B"),
      formatYear = format$$1("%Y");

  var tickIntervals = [
    [second,  1,      durationSecond],
    [second,  5,  5 * durationSecond],
    [second, 15, 15 * durationSecond],
    [second, 30, 30 * durationSecond],
    [minute,  1,      durationMinute],
    [minute,  5,  5 * durationMinute],
    [minute, 15, 15 * durationMinute],
    [minute, 30, 30 * durationMinute],
    [  hour,  1,      durationHour  ],
    [  hour,  3,  3 * durationHour  ],
    [  hour,  6,  6 * durationHour  ],
    [  hour, 12, 12 * durationHour  ],
    [   day,  1,      durationDay   ],
    [   day,  2,  2 * durationDay   ],
    [  week,  1,      durationWeek  ],
    [ month,  1,      durationMonth ],
    [ month,  3,  3 * durationMonth ],
    [  year,  1,      durationYear  ]
  ];

  function tickFormat(date) {
    return (second(date) < date ? formatMillisecond
        : minute(date) < date ? formatSecond
        : hour(date) < date ? formatMinute
        : day(date) < date ? formatHour
        : month(date) < date ? (week(date) < date ? formatDay : formatWeek)
        : year(date) < date ? formatMonth
        : formatYear)(date);
  }

  function tickInterval(interval, start, stop, step) {
    if (interval == null) interval = 10;

    // If a desired tick count is specified, pick a reasonable tick interval
    // based on the extent of the domain and a rough estimate of tick size.
    // Otherwise, assume interval is already a time interval and use it.
    if (typeof interval === "number") {
      var target = Math.abs(stop - start) / interval,
          i = d3Array.bisector(function(i) { return i[2]; }).right(tickIntervals, target);
      if (i === tickIntervals.length) {
        step = d3Array.tickStep(start / durationYear, stop / durationYear, interval);
        interval = year;
      } else if (i) {
        i = tickIntervals[target / tickIntervals[i - 1][2] < tickIntervals[i][2] / target ? i - 1 : i];
        step = i[1];
        interval = i[0];
      } else {
        step = d3Array.tickStep(start, stop, interval);
        interval = millisecond;
      }
    }

    return step == null ? interval : interval.every(step);
  }

  scale.invert = function(y) {
    return new Date(invert(y));
  };

  scale.domain = function(_) {
    return arguments.length ? domain(map$1.call(_, number$1)) : domain().map(date);
  };

  scale.ticks = function(interval, step) {
    var d = domain(),
        t0 = d[0],
        t1 = d[d.length - 1],
        r = t1 < t0,
        t;
    if (r) t = t0, t0 = t1, t1 = t;
    t = tickInterval(interval, t0, t1, step);
    t = t ? t.range(t0, t1 + 1) : []; // inclusive stop
    return r ? t.reverse() : t;
  };

  scale.tickFormat = function(count, specifier) {
    return specifier == null ? tickFormat : format$$1(specifier);
  };

  scale.nice = function(interval, step) {
    var d = domain();
    return (interval = tickInterval(interval, d[0], d[d.length - 1], step))
        ? domain(nice(d, interval))
        : scale;
  };

  scale.copy = function() {
    return copy(scale, calendar(year, month, week, day, hour, minute, second, millisecond, format$$1));
  };

  return scale;
}

var time = function() {
  return calendar(d3Time.timeYear, d3Time.timeMonth, d3Time.timeWeek, d3Time.timeDay, d3Time.timeHour, d3Time.timeMinute, d3Time.timeSecond, d3Time.timeMillisecond, d3TimeFormat.timeFormat).domain([new Date(2000, 0, 1), new Date(2000, 0, 2)]);
};

var utcTime = function() {
  return calendar(d3Time.utcYear, d3Time.utcMonth, d3Time.utcWeek, d3Time.utcDay, d3Time.utcHour, d3Time.utcMinute, d3Time.utcSecond, d3Time.utcMillisecond, d3TimeFormat.utcFormat).domain([Date.UTC(2000, 0, 1), Date.UTC(2000, 0, 2)]);
};

var colors = function(s) {
  return s.match(/.{6}/g).map(function(x) {
    return "#" + x;
  });
};

var category10 = colors("1f77b4ff7f0e2ca02cd627289467bd8c564be377c27f7f7fbcbd2217becf");

var category20b = colors("393b795254a36b6ecf9c9ede6379398ca252b5cf6bcedb9c8c6d31bd9e39e7ba52e7cb94843c39ad494ad6616be7969c7b4173a55194ce6dbdde9ed6");

var category20c = colors("3182bd6baed69ecae1c6dbefe6550dfd8d3cfdae6bfdd0a231a35474c476a1d99bc7e9c0756bb19e9ac8bcbddcdadaeb636363969696bdbdbdd9d9d9");

var category20 = colors("1f77b4aec7e8ff7f0effbb782ca02c98df8ad62728ff98969467bdc5b0d58c564bc49c94e377c2f7b6d27f7f7fc7c7c7bcbd22dbdb8d17becf9edae5");

var cubehelix$1 = d3Interpolate.interpolateCubehelixLong(d3Color.cubehelix(300, 0.5, 0.0), d3Color.cubehelix(-240, 0.5, 1.0));

var warm = d3Interpolate.interpolateCubehelixLong(d3Color.cubehelix(-100, 0.75, 0.35), d3Color.cubehelix(80, 1.50, 0.8));

var cool = d3Interpolate.interpolateCubehelixLong(d3Color.cubehelix(260, 0.75, 0.35), d3Color.cubehelix(80, 1.50, 0.8));

var rainbow = d3Color.cubehelix();

var rainbow$1 = function(t) {
  if (t < 0 || t > 1) t -= Math.floor(t);
  var ts = Math.abs(t - 0.5);
  rainbow.h = 360 * t - 100;
  rainbow.s = 1.5 - 1.5 * ts;
  rainbow.l = 0.8 - 0.9 * ts;
  return rainbow + "";
};

function ramp(range$$1) {
  var n = range$$1.length;
  return function(t) {
    return range$$1[Math.max(0, Math.min(n - 1, Math.floor(t * n)))];
  };
}

var viridis = ramp(colors("44015444025645045745055946075a46085c460a5d460b5e470d60470e6147106347116447136548146748166848176948186a481a6c481b6d481c6e481d6f481f70482071482173482374482475482576482677482878482979472a7a472c7a472d7b472e7c472f7d46307e46327e46337f463480453581453781453882443983443a83443b84433d84433e85423f854240864241864142874144874045884046883f47883f48893e49893e4a893e4c8a3d4d8a3d4e8a3c4f8a3c508b3b518b3b528b3a538b3a548c39558c39568c38588c38598c375a8c375b8d365c8d365d8d355e8d355f8d34608d34618d33628d33638d32648e32658e31668e31678e31688e30698e306a8e2f6b8e2f6c8e2e6d8e2e6e8e2e6f8e2d708e2d718e2c718e2c728e2c738e2b748e2b758e2a768e2a778e2a788e29798e297a8e297b8e287c8e287d8e277e8e277f8e27808e26818e26828e26828e25838e25848e25858e24868e24878e23888e23898e238a8d228b8d228c8d228d8d218e8d218f8d21908d21918c20928c20928c20938c1f948c1f958b1f968b1f978b1f988b1f998a1f9a8a1e9b8a1e9c891e9d891f9e891f9f881fa0881fa1881fa1871fa28720a38620a48621a58521a68522a78522a88423a98324aa8325ab8225ac8226ad8127ad8128ae8029af7f2ab07f2cb17e2db27d2eb37c2fb47c31b57b32b67a34b67935b77937b87838b9773aba763bbb753dbc743fbc7340bd7242be7144bf7046c06f48c16e4ac16d4cc26c4ec36b50c46a52c56954c56856c66758c7655ac8645cc8635ec96260ca6063cb5f65cb5e67cc5c69cd5b6ccd5a6ece5870cf5773d05675d05477d1537ad1517cd2507fd34e81d34d84d44b86d54989d5488bd6468ed64590d74393d74195d84098d83e9bd93c9dd93ba0da39a2da37a5db36a8db34aadc32addc30b0dd2fb2dd2db5de2bb8de29bade28bddf26c0df25c2df23c5e021c8e020cae11fcde11dd0e11cd2e21bd5e21ad8e219dae319dde318dfe318e2e418e5e419e7e419eae51aece51befe51cf1e51df4e61ef6e620f8e621fbe723fde725"));

var magma = ramp(colors("00000401000501010601010802010902020b02020d03030f03031204041405041606051806051a07061c08071e0907200a08220b09240c09260d0a290e0b2b100b2d110c2f120d31130d34140e36150e38160f3b180f3d19103f1a10421c10441d11471e114920114b21114e22115024125325125527125829115a2a115c2c115f2d11612f116331116533106734106936106b38106c390f6e3b0f703d0f713f0f72400f74420f75440f764510774710784910784a10794c117a4e117b4f127b51127c52137c54137d56147d57157e59157e5a167e5c167f5d177f5f187f601880621980641a80651a80671b80681c816a1c816b1d816d1d816e1e81701f81721f817320817521817621817822817922827b23827c23827e24828025828125818326818426818627818827818928818b29818c29818e2a81902a81912b81932b80942c80962c80982d80992d809b2e7f9c2e7f9e2f7fa02f7fa1307ea3307ea5317ea6317da8327daa337dab337cad347cae347bb0357bb2357bb3367ab5367ab73779b83779ba3878bc3978bd3977bf3a77c03a76c23b75c43c75c53c74c73d73c83e73ca3e72cc3f71cd4071cf4070d0416fd2426fd3436ed5446dd6456cd8456cd9466bdb476adc4869de4968df4a68e04c67e24d66e34e65e44f64e55064e75263e85362e95462ea5661eb5760ec5860ed5a5fee5b5eef5d5ef05f5ef1605df2625df2645cf3655cf4675cf4695cf56b5cf66c5cf66e5cf7705cf7725cf8745cf8765cf9785df9795df97b5dfa7d5efa7f5efa815ffb835ffb8560fb8761fc8961fc8a62fc8c63fc8e64fc9065fd9266fd9467fd9668fd9869fd9a6afd9b6bfe9d6cfe9f6dfea16efea36ffea571fea772fea973feaa74feac76feae77feb078feb27afeb47bfeb67cfeb77efeb97ffebb81febd82febf84fec185fec287fec488fec68afec88cfeca8dfecc8ffecd90fecf92fed194fed395fed597fed799fed89afdda9cfddc9efddea0fde0a1fde2a3fde3a5fde5a7fde7a9fde9aafdebacfcecaefceeb0fcf0b2fcf2b4fcf4b6fcf6b8fcf7b9fcf9bbfcfbbdfcfdbf"));

var inferno = ramp(colors("00000401000501010601010802010a02020c02020e03021004031204031405041706041907051b08051d09061f0a07220b07240c08260d08290e092b10092d110a30120a32140b34150b37160b39180c3c190c3e1b0c411c0c431e0c451f0c48210c4a230c4c240c4f260c51280b53290b552b0b572d0b592f0a5b310a5c320a5e340a5f3609613809623909633b09643d09653e0966400a67420a68440a68450a69470b6a490b6a4a0c6b4c0c6b4d0d6c4f0d6c510e6c520e6d540f6d550f6d57106e59106e5a116e5c126e5d126e5f136e61136e62146e64156e65156e67166e69166e6a176e6c186e6d186e6f196e71196e721a6e741a6e751b6e771c6d781c6d7a1d6d7c1d6d7d1e6d7f1e6c801f6c82206c84206b85216b87216b88226a8a226a8c23698d23698f24699025689225689326679526679727669827669a28659b29649d29649f2a63a02a63a22b62a32c61a52c60a62d60a82e5fa92e5eab2f5ead305dae305cb0315bb1325ab3325ab43359b63458b73557b93556ba3655bc3754bd3853bf3952c03a51c13a50c33b4fc43c4ec63d4dc73e4cc83f4bca404acb4149cc4248ce4347cf4446d04545d24644d34743d44842d54a41d74b3fd84c3ed94d3dda4e3cdb503bdd513ade5238df5337e05536e15635e25734e35933e45a31e55c30e65d2fe75e2ee8602de9612bea632aeb6429eb6628ec6726ed6925ee6a24ef6c23ef6e21f06f20f1711ff1731df2741cf3761bf37819f47918f57b17f57d15f67e14f68013f78212f78410f8850ff8870ef8890cf98b0bf98c0af98e09fa9008fa9207fa9407fb9606fb9706fb9906fb9b06fb9d07fc9f07fca108fca309fca50afca60cfca80dfcaa0ffcac11fcae12fcb014fcb216fcb418fbb61afbb81dfbba1ffbbc21fbbe23fac026fac228fac42afac62df9c72ff9c932f9cb35f8cd37f8cf3af7d13df7d340f6d543f6d746f5d949f5db4cf4dd4ff4df53f4e156f3e35af3e55df2e661f2e865f2ea69f1ec6df1ed71f1ef75f1f179f2f27df2f482f3f586f3f68af4f88ef5f992f6fa96f8fb9af9fc9dfafda1fcffa4"));

var plasma = ramp(colors("0d088710078813078916078a19068c1b068d1d068e20068f2206902406912605912805922a05932c05942e05952f059631059733059735049837049938049a3a049a3c049b3e049c3f049c41049d43039e44039e46039f48039f4903a04b03a14c02a14e02a25002a25102a35302a35502a45601a45801a45901a55b01a55c01a65e01a66001a66100a76300a76400a76600a76700a86900a86a00a86c00a86e00a86f00a87100a87201a87401a87501a87701a87801a87a02a87b02a87d03a87e03a88004a88104a78305a78405a78606a68707a68808a68a09a58b0aa58d0ba58e0ca48f0da4910ea3920fa39410a29511a19613a19814a099159f9a169f9c179e9d189d9e199da01a9ca11b9ba21d9aa31e9aa51f99a62098a72197a82296aa2395ab2494ac2694ad2793ae2892b02991b12a90b22b8fb32c8eb42e8db52f8cb6308bb7318ab83289ba3388bb3488bc3587bd3786be3885bf3984c03a83c13b82c23c81c33d80c43e7fc5407ec6417dc7427cc8437bc9447aca457acb4679cc4778cc4977cd4a76ce4b75cf4c74d04d73d14e72d24f71d35171d45270d5536fd5546ed6556dd7566cd8576bd9586ada5a6ada5b69db5c68dc5d67dd5e66de5f65de6164df6263e06363e16462e26561e26660e3685fe4695ee56a5de56b5de66c5ce76e5be76f5ae87059e97158e97257ea7457eb7556eb7655ec7754ed7953ed7a52ee7b51ef7c51ef7e50f07f4ff0804ef1814df1834cf2844bf3854bf3874af48849f48948f58b47f58c46f68d45f68f44f79044f79143f79342f89441f89540f9973ff9983ef99a3efa9b3dfa9c3cfa9e3bfb9f3afba139fba238fca338fca537fca636fca835fca934fdab33fdac33fdae32fdaf31fdb130fdb22ffdb42ffdb52efeb72dfeb82cfeba2cfebb2bfebd2afebe2afec029fdc229fdc328fdc527fdc627fdc827fdca26fdcb26fccd25fcce25fcd025fcd225fbd324fbd524fbd724fad824fada24f9dc24f9dd25f8df25f8e125f7e225f7e425f6e626f6e826f5e926f5eb27f4ed27f3ee27f3f027f2f227f1f426f1f525f0f724f0f921"));

function sequential(interpolator) {
  var x0 = 0,
      x1 = 1,
      clamp = false;

  function scale(x) {
    var t = (x - x0) / (x1 - x0);
    return interpolator(clamp ? Math.max(0, Math.min(1, t)) : t);
  }

  scale.domain = function(_) {
    return arguments.length ? (x0 = +_[0], x1 = +_[1], scale) : [x0, x1];
  };

  scale.clamp = function(_) {
    return arguments.length ? (clamp = !!_, scale) : clamp;
  };

  scale.interpolator = function(_) {
    return arguments.length ? (interpolator = _, scale) : interpolator;
  };

  scale.copy = function() {
    return sequential(interpolator).domain([x0, x1]).clamp(clamp);
  };

  return linearish(scale);
}

exports.scaleBand = band;
exports.scalePoint = point;
exports.scaleIdentity = identity;
exports.scaleLinear = linear;
exports.scaleLog = log;
exports.scaleOrdinal = ordinal;
exports.scaleImplicit = implicit;
exports.scalePow = pow;
exports.scaleSqrt = sqrt;
exports.scaleQuantile = quantile$1;
exports.scaleQuantize = quantize;
exports.scaleThreshold = threshold;
exports.scaleTime = time;
exports.scaleUtc = utcTime;
exports.schemeCategory10 = category10;
exports.schemeCategory20b = category20b;
exports.schemeCategory20c = category20c;
exports.schemeCategory20 = category20;
exports.interpolateCubehelixDefault = cubehelix$1;
exports.interpolateRainbow = rainbow$1;
exports.interpolateWarm = warm;
exports.interpolateCool = cool;
exports.interpolateViridis = viridis;
exports.interpolateMagma = magma;
exports.interpolateInferno = inferno;
exports.interpolatePlasma = plasma;
exports.scaleSequential = sequential;

Object.defineProperty(exports, '__esModule', { value: true });

})));

},{"d3-array":1,"d3-collection":2,"d3-color":3,"d3-format":4,"d3-interpolate":6,"d3-time":10,"d3-time-format":9}],8:[function(require,module,exports){
// https://d3js.org/d3-selection/ Version 1.0.3. Copyright 2016 Mike Bostock.
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.d3 = global.d3 || {})));
}(this, (function (exports) { 'use strict';

var xhtml = "http://www.w3.org/1999/xhtml";

var namespaces = {
  svg: "http://www.w3.org/2000/svg",
  xhtml: xhtml,
  xlink: "http://www.w3.org/1999/xlink",
  xml: "http://www.w3.org/XML/1998/namespace",
  xmlns: "http://www.w3.org/2000/xmlns/"
};

var namespace = function(name) {
  var prefix = name += "", i = prefix.indexOf(":");
  if (i >= 0 && (prefix = name.slice(0, i)) !== "xmlns") name = name.slice(i + 1);
  return namespaces.hasOwnProperty(prefix) ? {space: namespaces[prefix], local: name} : name;
};

function creatorInherit(name) {
  return function() {
    var document = this.ownerDocument,
        uri = this.namespaceURI;
    return uri === xhtml && document.documentElement.namespaceURI === xhtml
        ? document.createElement(name)
        : document.createElementNS(uri, name);
  };
}

function creatorFixed(fullname) {
  return function() {
    return this.ownerDocument.createElementNS(fullname.space, fullname.local);
  };
}

var creator = function(name) {
  var fullname = namespace(name);
  return (fullname.local
      ? creatorFixed
      : creatorInherit)(fullname);
};

var nextId = 0;

function local() {
  return new Local;
}

function Local() {
  this._ = "@" + (++nextId).toString(36);
}

Local.prototype = local.prototype = {
  constructor: Local,
  get: function(node) {
    var id = this._;
    while (!(id in node)) if (!(node = node.parentNode)) return;
    return node[id];
  },
  set: function(node, value) {
    return node[this._] = value;
  },
  remove: function(node) {
    return this._ in node && delete node[this._];
  },
  toString: function() {
    return this._;
  }
};

var matcher = function(selector) {
  return function() {
    return this.matches(selector);
  };
};

if (typeof document !== "undefined") {
  var element = document.documentElement;
  if (!element.matches) {
    var vendorMatches = element.webkitMatchesSelector
        || element.msMatchesSelector
        || element.mozMatchesSelector
        || element.oMatchesSelector;
    matcher = function(selector) {
      return function() {
        return vendorMatches.call(this, selector);
      };
    };
  }
}

var matcher$1 = matcher;

var filterEvents = {};

exports.event = null;

if (typeof document !== "undefined") {
  var element$1 = document.documentElement;
  if (!("onmouseenter" in element$1)) {
    filterEvents = {mouseenter: "mouseover", mouseleave: "mouseout"};
  }
}

function filterContextListener(listener, index, group) {
  listener = contextListener(listener, index, group);
  return function(event) {
    var related = event.relatedTarget;
    if (!related || (related !== this && !(related.compareDocumentPosition(this) & 8))) {
      listener.call(this, event);
    }
  };
}

function contextListener(listener, index, group) {
  return function(event1) {
    var event0 = exports.event; // Events can be reentrant (e.g., focus).
    exports.event = event1;
    try {
      listener.call(this, this.__data__, index, group);
    } finally {
      exports.event = event0;
    }
  };
}

function parseTypenames(typenames) {
  return typenames.trim().split(/^|\s+/).map(function(t) {
    var name = "", i = t.indexOf(".");
    if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
    return {type: t, name: name};
  });
}

function onRemove(typename) {
  return function() {
    var on = this.__on;
    if (!on) return;
    for (var j = 0, i = -1, m = on.length, o; j < m; ++j) {
      if (o = on[j], (!typename.type || o.type === typename.type) && o.name === typename.name) {
        this.removeEventListener(o.type, o.listener, o.capture);
      } else {
        on[++i] = o;
      }
    }
    if (++i) on.length = i;
    else delete this.__on;
  };
}

function onAdd(typename, value, capture) {
  var wrap = filterEvents.hasOwnProperty(typename.type) ? filterContextListener : contextListener;
  return function(d, i, group) {
    var on = this.__on, o, listener = wrap(value, i, group);
    if (on) for (var j = 0, m = on.length; j < m; ++j) {
      if ((o = on[j]).type === typename.type && o.name === typename.name) {
        this.removeEventListener(o.type, o.listener, o.capture);
        this.addEventListener(o.type, o.listener = listener, o.capture = capture);
        o.value = value;
        return;
      }
    }
    this.addEventListener(typename.type, listener, capture);
    o = {type: typename.type, name: typename.name, value: value, listener: listener, capture: capture};
    if (!on) this.__on = [o];
    else on.push(o);
  };
}

var selection_on = function(typename, value, capture) {
  var typenames = parseTypenames(typename + ""), i, n = typenames.length, t;

  if (arguments.length < 2) {
    var on = this.node().__on;
    if (on) for (var j = 0, m = on.length, o; j < m; ++j) {
      for (i = 0, o = on[j]; i < n; ++i) {
        if ((t = typenames[i]).type === o.type && t.name === o.name) {
          return o.value;
        }
      }
    }
    return;
  }

  on = value ? onAdd : onRemove;
  if (capture == null) capture = false;
  for (i = 0; i < n; ++i) this.each(on(typenames[i], value, capture));
  return this;
};

function customEvent(event1, listener, that, args) {
  var event0 = exports.event;
  event1.sourceEvent = exports.event;
  exports.event = event1;
  try {
    return listener.apply(that, args);
  } finally {
    exports.event = event0;
  }
}

var sourceEvent = function() {
  var current = exports.event, source;
  while (source = current.sourceEvent) current = source;
  return current;
};

var point = function(node, event) {
  var svg = node.ownerSVGElement || node;

  if (svg.createSVGPoint) {
    var point = svg.createSVGPoint();
    point.x = event.clientX, point.y = event.clientY;
    point = point.matrixTransform(node.getScreenCTM().inverse());
    return [point.x, point.y];
  }

  var rect = node.getBoundingClientRect();
  return [event.clientX - rect.left - node.clientLeft, event.clientY - rect.top - node.clientTop];
};

var mouse = function(node) {
  var event = sourceEvent();
  if (event.changedTouches) event = event.changedTouches[0];
  return point(node, event);
};

function none() {}

var selector = function(selector) {
  return selector == null ? none : function() {
    return this.querySelector(selector);
  };
};

var selection_select = function(select) {
  if (typeof select !== "function") select = selector(select);

  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
      if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
        if ("__data__" in node) subnode.__data__ = node.__data__;
        subgroup[i] = subnode;
      }
    }
  }

  return new Selection(subgroups, this._parents);
};

function empty() {
  return [];
}

var selectorAll = function(selector) {
  return selector == null ? empty : function() {
    return this.querySelectorAll(selector);
  };
};

var selection_selectAll = function(select) {
  if (typeof select !== "function") select = selectorAll(select);

  for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        subgroups.push(select.call(node, node.__data__, i, group));
        parents.push(node);
      }
    }
  }

  return new Selection(subgroups, parents);
};

var selection_filter = function(match) {
  if (typeof match !== "function") match = matcher$1(match);

  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
      if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
        subgroup.push(node);
      }
    }
  }

  return new Selection(subgroups, this._parents);
};

var sparse = function(update) {
  return new Array(update.length);
};

var selection_enter = function() {
  return new Selection(this._enter || this._groups.map(sparse), this._parents);
};

function EnterNode(parent, datum) {
  this.ownerDocument = parent.ownerDocument;
  this.namespaceURI = parent.namespaceURI;
  this._next = null;
  this._parent = parent;
  this.__data__ = datum;
}

EnterNode.prototype = {
  constructor: EnterNode,
  appendChild: function(child) { return this._parent.insertBefore(child, this._next); },
  insertBefore: function(child, next) { return this._parent.insertBefore(child, next); },
  querySelector: function(selector) { return this._parent.querySelector(selector); },
  querySelectorAll: function(selector) { return this._parent.querySelectorAll(selector); }
};

var constant = function(x) {
  return function() {
    return x;
  };
};

var keyPrefix = "$"; // Protect against keys like “__proto__”.

function bindIndex(parent, group, enter, update, exit, data) {
  var i = 0,
      node,
      groupLength = group.length,
      dataLength = data.length;

  // Put any non-null nodes that fit into update.
  // Put any null nodes into enter.
  // Put any remaining data into enter.
  for (; i < dataLength; ++i) {
    if (node = group[i]) {
      node.__data__ = data[i];
      update[i] = node;
    } else {
      enter[i] = new EnterNode(parent, data[i]);
    }
  }

  // Put any non-null nodes that don’t fit into exit.
  for (; i < groupLength; ++i) {
    if (node = group[i]) {
      exit[i] = node;
    }
  }
}

function bindKey(parent, group, enter, update, exit, data, key) {
  var i,
      node,
      nodeByKeyValue = {},
      groupLength = group.length,
      dataLength = data.length,
      keyValues = new Array(groupLength),
      keyValue;

  // Compute the key for each node.
  // If multiple nodes have the same key, the duplicates are added to exit.
  for (i = 0; i < groupLength; ++i) {
    if (node = group[i]) {
      keyValues[i] = keyValue = keyPrefix + key.call(node, node.__data__, i, group);
      if (keyValue in nodeByKeyValue) {
        exit[i] = node;
      } else {
        nodeByKeyValue[keyValue] = node;
      }
    }
  }

  // Compute the key for each datum.
  // If there a node associated with this key, join and add it to update.
  // If there is not (or the key is a duplicate), add it to enter.
  for (i = 0; i < dataLength; ++i) {
    keyValue = keyPrefix + key.call(parent, data[i], i, data);
    if (node = nodeByKeyValue[keyValue]) {
      update[i] = node;
      node.__data__ = data[i];
      nodeByKeyValue[keyValue] = null;
    } else {
      enter[i] = new EnterNode(parent, data[i]);
    }
  }

  // Add any remaining nodes that were not bound to data to exit.
  for (i = 0; i < groupLength; ++i) {
    if ((node = group[i]) && (nodeByKeyValue[keyValues[i]] === node)) {
      exit[i] = node;
    }
  }
}

var selection_data = function(value, key) {
  if (!value) {
    data = new Array(this.size()), j = -1;
    this.each(function(d) { data[++j] = d; });
    return data;
  }

  var bind = key ? bindKey : bindIndex,
      parents = this._parents,
      groups = this._groups;

  if (typeof value !== "function") value = constant(value);

  for (var m = groups.length, update = new Array(m), enter = new Array(m), exit = new Array(m), j = 0; j < m; ++j) {
    var parent = parents[j],
        group = groups[j],
        groupLength = group.length,
        data = value.call(parent, parent && parent.__data__, j, parents),
        dataLength = data.length,
        enterGroup = enter[j] = new Array(dataLength),
        updateGroup = update[j] = new Array(dataLength),
        exitGroup = exit[j] = new Array(groupLength);

    bind(parent, group, enterGroup, updateGroup, exitGroup, data, key);

    // Now connect the enter nodes to their following update node, such that
    // appendChild can insert the materialized enter node before this node,
    // rather than at the end of the parent node.
    for (var i0 = 0, i1 = 0, previous, next; i0 < dataLength; ++i0) {
      if (previous = enterGroup[i0]) {
        if (i0 >= i1) i1 = i0 + 1;
        while (!(next = updateGroup[i1]) && ++i1 < dataLength);
        previous._next = next || null;
      }
    }
  }

  update = new Selection(update, parents);
  update._enter = enter;
  update._exit = exit;
  return update;
};

var selection_exit = function() {
  return new Selection(this._exit || this._groups.map(sparse), this._parents);
};

var selection_merge = function(selection) {

  for (var groups0 = this._groups, groups1 = selection._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
    for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
      if (node = group0[i] || group1[i]) {
        merge[i] = node;
      }
    }
  }

  for (; j < m0; ++j) {
    merges[j] = groups0[j];
  }

  return new Selection(merges, this._parents);
};

var selection_order = function() {

  for (var groups = this._groups, j = -1, m = groups.length; ++j < m;) {
    for (var group = groups[j], i = group.length - 1, next = group[i], node; --i >= 0;) {
      if (node = group[i]) {
        if (next && next !== node.nextSibling) next.parentNode.insertBefore(node, next);
        next = node;
      }
    }
  }

  return this;
};

var selection_sort = function(compare) {
  if (!compare) compare = ascending;

  function compareNode(a, b) {
    return a && b ? compare(a.__data__, b.__data__) : !a - !b;
  }

  for (var groups = this._groups, m = groups.length, sortgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, sortgroup = sortgroups[j] = new Array(n), node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        sortgroup[i] = node;
      }
    }
    sortgroup.sort(compareNode);
  }

  return new Selection(sortgroups, this._parents).order();
};

function ascending(a, b) {
  return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
}

var selection_call = function() {
  var callback = arguments[0];
  arguments[0] = this;
  callback.apply(null, arguments);
  return this;
};

var selection_nodes = function() {
  var nodes = new Array(this.size()), i = -1;
  this.each(function() { nodes[++i] = this; });
  return nodes;
};

var selection_node = function() {

  for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
    for (var group = groups[j], i = 0, n = group.length; i < n; ++i) {
      var node = group[i];
      if (node) return node;
    }
  }

  return null;
};

var selection_size = function() {
  var size = 0;
  this.each(function() { ++size; });
  return size;
};

var selection_empty = function() {
  return !this.node();
};

var selection_each = function(callback) {

  for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
    for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
      if (node = group[i]) callback.call(node, node.__data__, i, group);
    }
  }

  return this;
};

function attrRemove(name) {
  return function() {
    this.removeAttribute(name);
  };
}

function attrRemoveNS(fullname) {
  return function() {
    this.removeAttributeNS(fullname.space, fullname.local);
  };
}

function attrConstant(name, value) {
  return function() {
    this.setAttribute(name, value);
  };
}

function attrConstantNS(fullname, value) {
  return function() {
    this.setAttributeNS(fullname.space, fullname.local, value);
  };
}

function attrFunction(name, value) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null) this.removeAttribute(name);
    else this.setAttribute(name, v);
  };
}

function attrFunctionNS(fullname, value) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null) this.removeAttributeNS(fullname.space, fullname.local);
    else this.setAttributeNS(fullname.space, fullname.local, v);
  };
}

var selection_attr = function(name, value) {
  var fullname = namespace(name);

  if (arguments.length < 2) {
    var node = this.node();
    return fullname.local
        ? node.getAttributeNS(fullname.space, fullname.local)
        : node.getAttribute(fullname);
  }

  return this.each((value == null
      ? (fullname.local ? attrRemoveNS : attrRemove) : (typeof value === "function"
      ? (fullname.local ? attrFunctionNS : attrFunction)
      : (fullname.local ? attrConstantNS : attrConstant)))(fullname, value));
};

var defaultView = function(node) {
  return (node.ownerDocument && node.ownerDocument.defaultView) // node is a Node
      || (node.document && node) // node is a Window
      || node.defaultView; // node is a Document
};

function styleRemove(name) {
  return function() {
    this.style.removeProperty(name);
  };
}

function styleConstant(name, value, priority) {
  return function() {
    this.style.setProperty(name, value, priority);
  };
}

function styleFunction(name, value, priority) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null) this.style.removeProperty(name);
    else this.style.setProperty(name, v, priority);
  };
}

var selection_style = function(name, value, priority) {
  var node;
  return arguments.length > 1
      ? this.each((value == null
            ? styleRemove : typeof value === "function"
            ? styleFunction
            : styleConstant)(name, value, priority == null ? "" : priority))
      : defaultView(node = this.node())
          .getComputedStyle(node, null)
          .getPropertyValue(name);
};

function propertyRemove(name) {
  return function() {
    delete this[name];
  };
}

function propertyConstant(name, value) {
  return function() {
    this[name] = value;
  };
}

function propertyFunction(name, value) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null) delete this[name];
    else this[name] = v;
  };
}

var selection_property = function(name, value) {
  return arguments.length > 1
      ? this.each((value == null
          ? propertyRemove : typeof value === "function"
          ? propertyFunction
          : propertyConstant)(name, value))
      : this.node()[name];
};

function classArray(string) {
  return string.trim().split(/^|\s+/);
}

function classList(node) {
  return node.classList || new ClassList(node);
}

function ClassList(node) {
  this._node = node;
  this._names = classArray(node.getAttribute("class") || "");
}

ClassList.prototype = {
  add: function(name) {
    var i = this._names.indexOf(name);
    if (i < 0) {
      this._names.push(name);
      this._node.setAttribute("class", this._names.join(" "));
    }
  },
  remove: function(name) {
    var i = this._names.indexOf(name);
    if (i >= 0) {
      this._names.splice(i, 1);
      this._node.setAttribute("class", this._names.join(" "));
    }
  },
  contains: function(name) {
    return this._names.indexOf(name) >= 0;
  }
};

function classedAdd(node, names) {
  var list = classList(node), i = -1, n = names.length;
  while (++i < n) list.add(names[i]);
}

function classedRemove(node, names) {
  var list = classList(node), i = -1, n = names.length;
  while (++i < n) list.remove(names[i]);
}

function classedTrue(names) {
  return function() {
    classedAdd(this, names);
  };
}

function classedFalse(names) {
  return function() {
    classedRemove(this, names);
  };
}

function classedFunction(names, value) {
  return function() {
    (value.apply(this, arguments) ? classedAdd : classedRemove)(this, names);
  };
}

var selection_classed = function(name, value) {
  var names = classArray(name + "");

  if (arguments.length < 2) {
    var list = classList(this.node()), i = -1, n = names.length;
    while (++i < n) if (!list.contains(names[i])) return false;
    return true;
  }

  return this.each((typeof value === "function"
      ? classedFunction : value
      ? classedTrue
      : classedFalse)(names, value));
};

function textRemove() {
  this.textContent = "";
}

function textConstant(value) {
  return function() {
    this.textContent = value;
  };
}

function textFunction(value) {
  return function() {
    var v = value.apply(this, arguments);
    this.textContent = v == null ? "" : v;
  };
}

var selection_text = function(value) {
  return arguments.length
      ? this.each(value == null
          ? textRemove : (typeof value === "function"
          ? textFunction
          : textConstant)(value))
      : this.node().textContent;
};

function htmlRemove() {
  this.innerHTML = "";
}

function htmlConstant(value) {
  return function() {
    this.innerHTML = value;
  };
}

function htmlFunction(value) {
  return function() {
    var v = value.apply(this, arguments);
    this.innerHTML = v == null ? "" : v;
  };
}

var selection_html = function(value) {
  return arguments.length
      ? this.each(value == null
          ? htmlRemove : (typeof value === "function"
          ? htmlFunction
          : htmlConstant)(value))
      : this.node().innerHTML;
};

function raise() {
  if (this.nextSibling) this.parentNode.appendChild(this);
}

var selection_raise = function() {
  return this.each(raise);
};

function lower() {
  if (this.previousSibling) this.parentNode.insertBefore(this, this.parentNode.firstChild);
}

var selection_lower = function() {
  return this.each(lower);
};

var selection_append = function(name) {
  var create = typeof name === "function" ? name : creator(name);
  return this.select(function() {
    return this.appendChild(create.apply(this, arguments));
  });
};

function constantNull() {
  return null;
}

var selection_insert = function(name, before) {
  var create = typeof name === "function" ? name : creator(name),
      select = before == null ? constantNull : typeof before === "function" ? before : selector(before);
  return this.select(function() {
    return this.insertBefore(create.apply(this, arguments), select.apply(this, arguments) || null);
  });
};

function remove() {
  var parent = this.parentNode;
  if (parent) parent.removeChild(this);
}

var selection_remove = function() {
  return this.each(remove);
};

var selection_datum = function(value) {
  return arguments.length
      ? this.property("__data__", value)
      : this.node().__data__;
};

function dispatchEvent(node, type, params) {
  var window = defaultView(node),
      event = window.CustomEvent;

  if (event) {
    event = new event(type, params);
  } else {
    event = window.document.createEvent("Event");
    if (params) event.initEvent(type, params.bubbles, params.cancelable), event.detail = params.detail;
    else event.initEvent(type, false, false);
  }

  node.dispatchEvent(event);
}

function dispatchConstant(type, params) {
  return function() {
    return dispatchEvent(this, type, params);
  };
}

function dispatchFunction(type, params) {
  return function() {
    return dispatchEvent(this, type, params.apply(this, arguments));
  };
}

var selection_dispatch = function(type, params) {
  return this.each((typeof params === "function"
      ? dispatchFunction
      : dispatchConstant)(type, params));
};

var root = [null];

function Selection(groups, parents) {
  this._groups = groups;
  this._parents = parents;
}

function selection() {
  return new Selection([[document.documentElement]], root);
}

Selection.prototype = selection.prototype = {
  constructor: Selection,
  select: selection_select,
  selectAll: selection_selectAll,
  filter: selection_filter,
  data: selection_data,
  enter: selection_enter,
  exit: selection_exit,
  merge: selection_merge,
  order: selection_order,
  sort: selection_sort,
  call: selection_call,
  nodes: selection_nodes,
  node: selection_node,
  size: selection_size,
  empty: selection_empty,
  each: selection_each,
  attr: selection_attr,
  style: selection_style,
  property: selection_property,
  classed: selection_classed,
  text: selection_text,
  html: selection_html,
  raise: selection_raise,
  lower: selection_lower,
  append: selection_append,
  insert: selection_insert,
  remove: selection_remove,
  datum: selection_datum,
  on: selection_on,
  dispatch: selection_dispatch
};

var select = function(selector) {
  return typeof selector === "string"
      ? new Selection([[document.querySelector(selector)]], [document.documentElement])
      : new Selection([[selector]], root);
};

var selectAll = function(selector) {
  return typeof selector === "string"
      ? new Selection([document.querySelectorAll(selector)], [document.documentElement])
      : new Selection([selector == null ? [] : selector], root);
};

var touch = function(node, touches, identifier) {
  if (arguments.length < 3) identifier = touches, touches = sourceEvent().changedTouches;

  for (var i = 0, n = touches ? touches.length : 0, touch; i < n; ++i) {
    if ((touch = touches[i]).identifier === identifier) {
      return point(node, touch);
    }
  }

  return null;
};

var touches = function(node, touches) {
  if (touches == null) touches = sourceEvent().touches;

  for (var i = 0, n = touches ? touches.length : 0, points = new Array(n); i < n; ++i) {
    points[i] = point(node, touches[i]);
  }

  return points;
};

exports.creator = creator;
exports.local = local;
exports.matcher = matcher$1;
exports.mouse = mouse;
exports.namespace = namespace;
exports.namespaces = namespaces;
exports.select = select;
exports.selectAll = selectAll;
exports.selection = selection;
exports.selector = selector;
exports.selectorAll = selectorAll;
exports.touch = touch;
exports.touches = touches;
exports.window = defaultView;
exports.customEvent = customEvent;

Object.defineProperty(exports, '__esModule', { value: true });

})));

},{}],9:[function(require,module,exports){
// https://d3js.org/d3-time-format/ Version 2.0.3. Copyright 2016 Mike Bostock.
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('d3-time')) :
  typeof define === 'function' && define.amd ? define(['exports', 'd3-time'], factory) :
  (factory((global.d3 = global.d3 || {}),global.d3));
}(this, (function (exports,d3Time) { 'use strict';

function localDate(d) {
  if (0 <= d.y && d.y < 100) {
    var date = new Date(-1, d.m, d.d, d.H, d.M, d.S, d.L);
    date.setFullYear(d.y);
    return date;
  }
  return new Date(d.y, d.m, d.d, d.H, d.M, d.S, d.L);
}

function utcDate(d) {
  if (0 <= d.y && d.y < 100) {
    var date = new Date(Date.UTC(-1, d.m, d.d, d.H, d.M, d.S, d.L));
    date.setUTCFullYear(d.y);
    return date;
  }
  return new Date(Date.UTC(d.y, d.m, d.d, d.H, d.M, d.S, d.L));
}

function newYear(y) {
  return {y: y, m: 0, d: 1, H: 0, M: 0, S: 0, L: 0};
}

function formatLocale(locale) {
  var locale_dateTime = locale.dateTime,
      locale_date = locale.date,
      locale_time = locale.time,
      locale_periods = locale.periods,
      locale_weekdays = locale.days,
      locale_shortWeekdays = locale.shortDays,
      locale_months = locale.months,
      locale_shortMonths = locale.shortMonths;

  var periodRe = formatRe(locale_periods),
      periodLookup = formatLookup(locale_periods),
      weekdayRe = formatRe(locale_weekdays),
      weekdayLookup = formatLookup(locale_weekdays),
      shortWeekdayRe = formatRe(locale_shortWeekdays),
      shortWeekdayLookup = formatLookup(locale_shortWeekdays),
      monthRe = formatRe(locale_months),
      monthLookup = formatLookup(locale_months),
      shortMonthRe = formatRe(locale_shortMonths),
      shortMonthLookup = formatLookup(locale_shortMonths);

  var formats = {
    "a": formatShortWeekday,
    "A": formatWeekday,
    "b": formatShortMonth,
    "B": formatMonth,
    "c": null,
    "d": formatDayOfMonth,
    "e": formatDayOfMonth,
    "H": formatHour24,
    "I": formatHour12,
    "j": formatDayOfYear,
    "L": formatMilliseconds,
    "m": formatMonthNumber,
    "M": formatMinutes,
    "p": formatPeriod,
    "S": formatSeconds,
    "U": formatWeekNumberSunday,
    "w": formatWeekdayNumber,
    "W": formatWeekNumberMonday,
    "x": null,
    "X": null,
    "y": formatYear,
    "Y": formatFullYear,
    "Z": formatZone,
    "%": formatLiteralPercent
  };

  var utcFormats = {
    "a": formatUTCShortWeekday,
    "A": formatUTCWeekday,
    "b": formatUTCShortMonth,
    "B": formatUTCMonth,
    "c": null,
    "d": formatUTCDayOfMonth,
    "e": formatUTCDayOfMonth,
    "H": formatUTCHour24,
    "I": formatUTCHour12,
    "j": formatUTCDayOfYear,
    "L": formatUTCMilliseconds,
    "m": formatUTCMonthNumber,
    "M": formatUTCMinutes,
    "p": formatUTCPeriod,
    "S": formatUTCSeconds,
    "U": formatUTCWeekNumberSunday,
    "w": formatUTCWeekdayNumber,
    "W": formatUTCWeekNumberMonday,
    "x": null,
    "X": null,
    "y": formatUTCYear,
    "Y": formatUTCFullYear,
    "Z": formatUTCZone,
    "%": formatLiteralPercent
  };

  var parses = {
    "a": parseShortWeekday,
    "A": parseWeekday,
    "b": parseShortMonth,
    "B": parseMonth,
    "c": parseLocaleDateTime,
    "d": parseDayOfMonth,
    "e": parseDayOfMonth,
    "H": parseHour24,
    "I": parseHour24,
    "j": parseDayOfYear,
    "L": parseMilliseconds,
    "m": parseMonthNumber,
    "M": parseMinutes,
    "p": parsePeriod,
    "S": parseSeconds,
    "U": parseWeekNumberSunday,
    "w": parseWeekdayNumber,
    "W": parseWeekNumberMonday,
    "x": parseLocaleDate,
    "X": parseLocaleTime,
    "y": parseYear,
    "Y": parseFullYear,
    "Z": parseZone,
    "%": parseLiteralPercent
  };

  // These recursive directive definitions must be deferred.
  formats.x = newFormat(locale_date, formats);
  formats.X = newFormat(locale_time, formats);
  formats.c = newFormat(locale_dateTime, formats);
  utcFormats.x = newFormat(locale_date, utcFormats);
  utcFormats.X = newFormat(locale_time, utcFormats);
  utcFormats.c = newFormat(locale_dateTime, utcFormats);

  function newFormat(specifier, formats) {
    return function(date) {
      var string = [],
          i = -1,
          j = 0,
          n = specifier.length,
          c,
          pad,
          format;

      if (!(date instanceof Date)) date = new Date(+date);

      while (++i < n) {
        if (specifier.charCodeAt(i) === 37) {
          string.push(specifier.slice(j, i));
          if ((pad = pads[c = specifier.charAt(++i)]) != null) c = specifier.charAt(++i);
          else pad = c === "e" ? " " : "0";
          if (format = formats[c]) c = format(date, pad);
          string.push(c);
          j = i + 1;
        }
      }

      string.push(specifier.slice(j, i));
      return string.join("");
    };
  }

  function newParse(specifier, newDate) {
    return function(string) {
      var d = newYear(1900),
          i = parseSpecifier(d, specifier, string += "", 0);
      if (i != string.length) return null;

      // The am-pm flag is 0 for AM, and 1 for PM.
      if ("p" in d) d.H = d.H % 12 + d.p * 12;

      // Convert day-of-week and week-of-year to day-of-year.
      if ("W" in d || "U" in d) {
        if (!("w" in d)) d.w = "W" in d ? 1 : 0;
        var day = "Z" in d ? utcDate(newYear(d.y)).getUTCDay() : newDate(newYear(d.y)).getDay();
        d.m = 0;
        d.d = "W" in d ? (d.w + 6) % 7 + d.W * 7 - (day + 5) % 7 : d.w + d.U * 7 - (day + 6) % 7;
      }

      // If a time zone is specified, all fields are interpreted as UTC and then
      // offset according to the specified time zone.
      if ("Z" in d) {
        d.H += d.Z / 100 | 0;
        d.M += d.Z % 100;
        return utcDate(d);
      }

      // Otherwise, all fields are in local time.
      return newDate(d);
    };
  }

  function parseSpecifier(d, specifier, string, j) {
    var i = 0,
        n = specifier.length,
        m = string.length,
        c,
        parse;

    while (i < n) {
      if (j >= m) return -1;
      c = specifier.charCodeAt(i++);
      if (c === 37) {
        c = specifier.charAt(i++);
        parse = parses[c in pads ? specifier.charAt(i++) : c];
        if (!parse || ((j = parse(d, string, j)) < 0)) return -1;
      } else if (c != string.charCodeAt(j++)) {
        return -1;
      }
    }

    return j;
  }

  function parsePeriod(d, string, i) {
    var n = periodRe.exec(string.slice(i));
    return n ? (d.p = periodLookup[n[0].toLowerCase()], i + n[0].length) : -1;
  }

  function parseShortWeekday(d, string, i) {
    var n = shortWeekdayRe.exec(string.slice(i));
    return n ? (d.w = shortWeekdayLookup[n[0].toLowerCase()], i + n[0].length) : -1;
  }

  function parseWeekday(d, string, i) {
    var n = weekdayRe.exec(string.slice(i));
    return n ? (d.w = weekdayLookup[n[0].toLowerCase()], i + n[0].length) : -1;
  }

  function parseShortMonth(d, string, i) {
    var n = shortMonthRe.exec(string.slice(i));
    return n ? (d.m = shortMonthLookup[n[0].toLowerCase()], i + n[0].length) : -1;
  }

  function parseMonth(d, string, i) {
    var n = monthRe.exec(string.slice(i));
    return n ? (d.m = monthLookup[n[0].toLowerCase()], i + n[0].length) : -1;
  }

  function parseLocaleDateTime(d, string, i) {
    return parseSpecifier(d, locale_dateTime, string, i);
  }

  function parseLocaleDate(d, string, i) {
    return parseSpecifier(d, locale_date, string, i);
  }

  function parseLocaleTime(d, string, i) {
    return parseSpecifier(d, locale_time, string, i);
  }

  function formatShortWeekday(d) {
    return locale_shortWeekdays[d.getDay()];
  }

  function formatWeekday(d) {
    return locale_weekdays[d.getDay()];
  }

  function formatShortMonth(d) {
    return locale_shortMonths[d.getMonth()];
  }

  function formatMonth(d) {
    return locale_months[d.getMonth()];
  }

  function formatPeriod(d) {
    return locale_periods[+(d.getHours() >= 12)];
  }

  function formatUTCShortWeekday(d) {
    return locale_shortWeekdays[d.getUTCDay()];
  }

  function formatUTCWeekday(d) {
    return locale_weekdays[d.getUTCDay()];
  }

  function formatUTCShortMonth(d) {
    return locale_shortMonths[d.getUTCMonth()];
  }

  function formatUTCMonth(d) {
    return locale_months[d.getUTCMonth()];
  }

  function formatUTCPeriod(d) {
    return locale_periods[+(d.getUTCHours() >= 12)];
  }

  return {
    format: function(specifier) {
      var f = newFormat(specifier += "", formats);
      f.toString = function() { return specifier; };
      return f;
    },
    parse: function(specifier) {
      var p = newParse(specifier += "", localDate);
      p.toString = function() { return specifier; };
      return p;
    },
    utcFormat: function(specifier) {
      var f = newFormat(specifier += "", utcFormats);
      f.toString = function() { return specifier; };
      return f;
    },
    utcParse: function(specifier) {
      var p = newParse(specifier, utcDate);
      p.toString = function() { return specifier; };
      return p;
    }
  };
}

var pads = {"-": "", "_": " ", "0": "0"};
var numberRe = /^\s*\d+/;
var percentRe = /^%/;
var requoteRe = /[\\\^\$\*\+\?\|\[\]\(\)\.\{\}]/g;

function pad(value, fill, width) {
  var sign = value < 0 ? "-" : "",
      string = (sign ? -value : value) + "",
      length = string.length;
  return sign + (length < width ? new Array(width - length + 1).join(fill) + string : string);
}

function requote(s) {
  return s.replace(requoteRe, "\\$&");
}

function formatRe(names) {
  return new RegExp("^(?:" + names.map(requote).join("|") + ")", "i");
}

function formatLookup(names) {
  var map = {}, i = -1, n = names.length;
  while (++i < n) map[names[i].toLowerCase()] = i;
  return map;
}

function parseWeekdayNumber(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 1));
  return n ? (d.w = +n[0], i + n[0].length) : -1;
}

function parseWeekNumberSunday(d, string, i) {
  var n = numberRe.exec(string.slice(i));
  return n ? (d.U = +n[0], i + n[0].length) : -1;
}

function parseWeekNumberMonday(d, string, i) {
  var n = numberRe.exec(string.slice(i));
  return n ? (d.W = +n[0], i + n[0].length) : -1;
}

function parseFullYear(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 4));
  return n ? (d.y = +n[0], i + n[0].length) : -1;
}

function parseYear(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 2));
  return n ? (d.y = +n[0] + (+n[0] > 68 ? 1900 : 2000), i + n[0].length) : -1;
}

function parseZone(d, string, i) {
  var n = /^(Z)|([+-]\d\d)(?:\:?(\d\d))?/.exec(string.slice(i, i + 6));
  return n ? (d.Z = n[1] ? 0 : -(n[2] + (n[3] || "00")), i + n[0].length) : -1;
}

function parseMonthNumber(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 2));
  return n ? (d.m = n[0] - 1, i + n[0].length) : -1;
}

function parseDayOfMonth(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 2));
  return n ? (d.d = +n[0], i + n[0].length) : -1;
}

function parseDayOfYear(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 3));
  return n ? (d.m = 0, d.d = +n[0], i + n[0].length) : -1;
}

function parseHour24(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 2));
  return n ? (d.H = +n[0], i + n[0].length) : -1;
}

function parseMinutes(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 2));
  return n ? (d.M = +n[0], i + n[0].length) : -1;
}

function parseSeconds(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 2));
  return n ? (d.S = +n[0], i + n[0].length) : -1;
}

function parseMilliseconds(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 3));
  return n ? (d.L = +n[0], i + n[0].length) : -1;
}

function parseLiteralPercent(d, string, i) {
  var n = percentRe.exec(string.slice(i, i + 1));
  return n ? i + n[0].length : -1;
}

function formatDayOfMonth(d, p) {
  return pad(d.getDate(), p, 2);
}

function formatHour24(d, p) {
  return pad(d.getHours(), p, 2);
}

function formatHour12(d, p) {
  return pad(d.getHours() % 12 || 12, p, 2);
}

function formatDayOfYear(d, p) {
  return pad(1 + d3Time.timeDay.count(d3Time.timeYear(d), d), p, 3);
}

function formatMilliseconds(d, p) {
  return pad(d.getMilliseconds(), p, 3);
}

function formatMonthNumber(d, p) {
  return pad(d.getMonth() + 1, p, 2);
}

function formatMinutes(d, p) {
  return pad(d.getMinutes(), p, 2);
}

function formatSeconds(d, p) {
  return pad(d.getSeconds(), p, 2);
}

function formatWeekNumberSunday(d, p) {
  return pad(d3Time.timeSunday.count(d3Time.timeYear(d), d), p, 2);
}

function formatWeekdayNumber(d) {
  return d.getDay();
}

function formatWeekNumberMonday(d, p) {
  return pad(d3Time.timeMonday.count(d3Time.timeYear(d), d), p, 2);
}

function formatYear(d, p) {
  return pad(d.getFullYear() % 100, p, 2);
}

function formatFullYear(d, p) {
  return pad(d.getFullYear() % 10000, p, 4);
}

function formatZone(d) {
  var z = d.getTimezoneOffset();
  return (z > 0 ? "-" : (z *= -1, "+"))
      + pad(z / 60 | 0, "0", 2)
      + pad(z % 60, "0", 2);
}

function formatUTCDayOfMonth(d, p) {
  return pad(d.getUTCDate(), p, 2);
}

function formatUTCHour24(d, p) {
  return pad(d.getUTCHours(), p, 2);
}

function formatUTCHour12(d, p) {
  return pad(d.getUTCHours() % 12 || 12, p, 2);
}

function formatUTCDayOfYear(d, p) {
  return pad(1 + d3Time.utcDay.count(d3Time.utcYear(d), d), p, 3);
}

function formatUTCMilliseconds(d, p) {
  return pad(d.getUTCMilliseconds(), p, 3);
}

function formatUTCMonthNumber(d, p) {
  return pad(d.getUTCMonth() + 1, p, 2);
}

function formatUTCMinutes(d, p) {
  return pad(d.getUTCMinutes(), p, 2);
}

function formatUTCSeconds(d, p) {
  return pad(d.getUTCSeconds(), p, 2);
}

function formatUTCWeekNumberSunday(d, p) {
  return pad(d3Time.utcSunday.count(d3Time.utcYear(d), d), p, 2);
}

function formatUTCWeekdayNumber(d) {
  return d.getUTCDay();
}

function formatUTCWeekNumberMonday(d, p) {
  return pad(d3Time.utcMonday.count(d3Time.utcYear(d), d), p, 2);
}

function formatUTCYear(d, p) {
  return pad(d.getUTCFullYear() % 100, p, 2);
}

function formatUTCFullYear(d, p) {
  return pad(d.getUTCFullYear() % 10000, p, 4);
}

function formatUTCZone() {
  return "+0000";
}

function formatLiteralPercent() {
  return "%";
}

var locale$1;





defaultLocale({
  dateTime: "%x, %X",
  date: "%-m/%-d/%Y",
  time: "%-I:%M:%S %p",
  periods: ["AM", "PM"],
  days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  shortDays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  shortMonths: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
});

function defaultLocale(definition) {
  locale$1 = formatLocale(definition);
  exports.timeFormat = locale$1.format;
  exports.timeParse = locale$1.parse;
  exports.utcFormat = locale$1.utcFormat;
  exports.utcParse = locale$1.utcParse;
  return locale$1;
}

var isoSpecifier = "%Y-%m-%dT%H:%M:%S.%LZ";

function formatIsoNative(date) {
  return date.toISOString();
}

var formatIso = Date.prototype.toISOString
    ? formatIsoNative
    : exports.utcFormat(isoSpecifier);

function parseIsoNative(string) {
  var date = new Date(string);
  return isNaN(date) ? null : date;
}

var parseIso = +new Date("2000-01-01T00:00:00.000Z")
    ? parseIsoNative
    : exports.utcParse(isoSpecifier);

exports.timeFormatDefaultLocale = defaultLocale;
exports.timeFormatLocale = formatLocale;
exports.isoFormat = formatIso;
exports.isoParse = parseIso;

Object.defineProperty(exports, '__esModule', { value: true });

})));

},{"d3-time":10}],10:[function(require,module,exports){
// https://d3js.org/d3-time/ Version 1.0.4. Copyright 2016 Mike Bostock.
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.d3 = global.d3 || {})));
}(this, (function (exports) { 'use strict';

var t0 = new Date;
var t1 = new Date;

function newInterval(floori, offseti, count, field) {

  function interval(date) {
    return floori(date = new Date(+date)), date;
  }

  interval.floor = interval;

  interval.ceil = function(date) {
    return floori(date = new Date(date - 1)), offseti(date, 1), floori(date), date;
  };

  interval.round = function(date) {
    var d0 = interval(date),
        d1 = interval.ceil(date);
    return date - d0 < d1 - date ? d0 : d1;
  };

  interval.offset = function(date, step) {
    return offseti(date = new Date(+date), step == null ? 1 : Math.floor(step)), date;
  };

  interval.range = function(start, stop, step) {
    var range = [];
    start = interval.ceil(start);
    step = step == null ? 1 : Math.floor(step);
    if (!(start < stop) || !(step > 0)) return range; // also handles Invalid Date
    do range.push(new Date(+start)); while (offseti(start, step), floori(start), start < stop)
    return range;
  };

  interval.filter = function(test) {
    return newInterval(function(date) {
      if (date >= date) while (floori(date), !test(date)) date.setTime(date - 1);
    }, function(date, step) {
      if (date >= date) while (--step >= 0) while (offseti(date, 1), !test(date)) {} // eslint-disable-line no-empty
    });
  };

  if (count) {
    interval.count = function(start, end) {
      t0.setTime(+start), t1.setTime(+end);
      floori(t0), floori(t1);
      return Math.floor(count(t0, t1));
    };

    interval.every = function(step) {
      step = Math.floor(step);
      return !isFinite(step) || !(step > 0) ? null
          : !(step > 1) ? interval
          : interval.filter(field
              ? function(d) { return field(d) % step === 0; }
              : function(d) { return interval.count(0, d) % step === 0; });
    };
  }

  return interval;
}

var millisecond = newInterval(function() {
  // noop
}, function(date, step) {
  date.setTime(+date + step);
}, function(start, end) {
  return end - start;
});

// An optimized implementation for this simple case.
millisecond.every = function(k) {
  k = Math.floor(k);
  if (!isFinite(k) || !(k > 0)) return null;
  if (!(k > 1)) return millisecond;
  return newInterval(function(date) {
    date.setTime(Math.floor(date / k) * k);
  }, function(date, step) {
    date.setTime(+date + step * k);
  }, function(start, end) {
    return (end - start) / k;
  });
};

var milliseconds = millisecond.range;

var durationSecond = 1e3;
var durationMinute = 6e4;
var durationHour = 36e5;
var durationDay = 864e5;
var durationWeek = 6048e5;

var second = newInterval(function(date) {
  date.setTime(Math.floor(date / durationSecond) * durationSecond);
}, function(date, step) {
  date.setTime(+date + step * durationSecond);
}, function(start, end) {
  return (end - start) / durationSecond;
}, function(date) {
  return date.getUTCSeconds();
});

var seconds = second.range;

var minute = newInterval(function(date) {
  date.setTime(Math.floor(date / durationMinute) * durationMinute);
}, function(date, step) {
  date.setTime(+date + step * durationMinute);
}, function(start, end) {
  return (end - start) / durationMinute;
}, function(date) {
  return date.getMinutes();
});

var minutes = minute.range;

var hour = newInterval(function(date) {
  var offset = date.getTimezoneOffset() * durationMinute % durationHour;
  if (offset < 0) offset += durationHour;
  date.setTime(Math.floor((+date - offset) / durationHour) * durationHour + offset);
}, function(date, step) {
  date.setTime(+date + step * durationHour);
}, function(start, end) {
  return (end - start) / durationHour;
}, function(date) {
  return date.getHours();
});

var hours = hour.range;

var day = newInterval(function(date) {
  date.setHours(0, 0, 0, 0);
}, function(date, step) {
  date.setDate(date.getDate() + step);
}, function(start, end) {
  return (end - start - (end.getTimezoneOffset() - start.getTimezoneOffset()) * durationMinute) / durationDay;
}, function(date) {
  return date.getDate() - 1;
});

var days = day.range;

function weekday(i) {
  return newInterval(function(date) {
    date.setDate(date.getDate() - (date.getDay() + 7 - i) % 7);
    date.setHours(0, 0, 0, 0);
  }, function(date, step) {
    date.setDate(date.getDate() + step * 7);
  }, function(start, end) {
    return (end - start - (end.getTimezoneOffset() - start.getTimezoneOffset()) * durationMinute) / durationWeek;
  });
}

var sunday = weekday(0);
var monday = weekday(1);
var tuesday = weekday(2);
var wednesday = weekday(3);
var thursday = weekday(4);
var friday = weekday(5);
var saturday = weekday(6);

var sundays = sunday.range;
var mondays = monday.range;
var tuesdays = tuesday.range;
var wednesdays = wednesday.range;
var thursdays = thursday.range;
var fridays = friday.range;
var saturdays = saturday.range;

var month = newInterval(function(date) {
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
}, function(date, step) {
  date.setMonth(date.getMonth() + step);
}, function(start, end) {
  return end.getMonth() - start.getMonth() + (end.getFullYear() - start.getFullYear()) * 12;
}, function(date) {
  return date.getMonth();
});

var months = month.range;

var year = newInterval(function(date) {
  date.setMonth(0, 1);
  date.setHours(0, 0, 0, 0);
}, function(date, step) {
  date.setFullYear(date.getFullYear() + step);
}, function(start, end) {
  return end.getFullYear() - start.getFullYear();
}, function(date) {
  return date.getFullYear();
});

// An optimized implementation for this simple case.
year.every = function(k) {
  return !isFinite(k = Math.floor(k)) || !(k > 0) ? null : newInterval(function(date) {
    date.setFullYear(Math.floor(date.getFullYear() / k) * k);
    date.setMonth(0, 1);
    date.setHours(0, 0, 0, 0);
  }, function(date, step) {
    date.setFullYear(date.getFullYear() + step * k);
  });
};

var years = year.range;

var utcMinute = newInterval(function(date) {
  date.setUTCSeconds(0, 0);
}, function(date, step) {
  date.setTime(+date + step * durationMinute);
}, function(start, end) {
  return (end - start) / durationMinute;
}, function(date) {
  return date.getUTCMinutes();
});

var utcMinutes = utcMinute.range;

var utcHour = newInterval(function(date) {
  date.setUTCMinutes(0, 0, 0);
}, function(date, step) {
  date.setTime(+date + step * durationHour);
}, function(start, end) {
  return (end - start) / durationHour;
}, function(date) {
  return date.getUTCHours();
});

var utcHours = utcHour.range;

var utcDay = newInterval(function(date) {
  date.setUTCHours(0, 0, 0, 0);
}, function(date, step) {
  date.setUTCDate(date.getUTCDate() + step);
}, function(start, end) {
  return (end - start) / durationDay;
}, function(date) {
  return date.getUTCDate() - 1;
});

var utcDays = utcDay.range;

function utcWeekday(i) {
  return newInterval(function(date) {
    date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 7 - i) % 7);
    date.setUTCHours(0, 0, 0, 0);
  }, function(date, step) {
    date.setUTCDate(date.getUTCDate() + step * 7);
  }, function(start, end) {
    return (end - start) / durationWeek;
  });
}

var utcSunday = utcWeekday(0);
var utcMonday = utcWeekday(1);
var utcTuesday = utcWeekday(2);
var utcWednesday = utcWeekday(3);
var utcThursday = utcWeekday(4);
var utcFriday = utcWeekday(5);
var utcSaturday = utcWeekday(6);

var utcSundays = utcSunday.range;
var utcMondays = utcMonday.range;
var utcTuesdays = utcTuesday.range;
var utcWednesdays = utcWednesday.range;
var utcThursdays = utcThursday.range;
var utcFridays = utcFriday.range;
var utcSaturdays = utcSaturday.range;

var utcMonth = newInterval(function(date) {
  date.setUTCDate(1);
  date.setUTCHours(0, 0, 0, 0);
}, function(date, step) {
  date.setUTCMonth(date.getUTCMonth() + step);
}, function(start, end) {
  return end.getUTCMonth() - start.getUTCMonth() + (end.getUTCFullYear() - start.getUTCFullYear()) * 12;
}, function(date) {
  return date.getUTCMonth();
});

var utcMonths = utcMonth.range;

var utcYear = newInterval(function(date) {
  date.setUTCMonth(0, 1);
  date.setUTCHours(0, 0, 0, 0);
}, function(date, step) {
  date.setUTCFullYear(date.getUTCFullYear() + step);
}, function(start, end) {
  return end.getUTCFullYear() - start.getUTCFullYear();
}, function(date) {
  return date.getUTCFullYear();
});

// An optimized implementation for this simple case.
utcYear.every = function(k) {
  return !isFinite(k = Math.floor(k)) || !(k > 0) ? null : newInterval(function(date) {
    date.setUTCFullYear(Math.floor(date.getUTCFullYear() / k) * k);
    date.setUTCMonth(0, 1);
    date.setUTCHours(0, 0, 0, 0);
  }, function(date, step) {
    date.setUTCFullYear(date.getUTCFullYear() + step * k);
  });
};

var utcYears = utcYear.range;

exports.timeInterval = newInterval;
exports.timeMillisecond = millisecond;
exports.timeMilliseconds = milliseconds;
exports.utcMillisecond = millisecond;
exports.utcMilliseconds = milliseconds;
exports.timeSecond = second;
exports.timeSeconds = seconds;
exports.utcSecond = second;
exports.utcSeconds = seconds;
exports.timeMinute = minute;
exports.timeMinutes = minutes;
exports.timeHour = hour;
exports.timeHours = hours;
exports.timeDay = day;
exports.timeDays = days;
exports.timeWeek = sunday;
exports.timeWeeks = sundays;
exports.timeSunday = sunday;
exports.timeSundays = sundays;
exports.timeMonday = monday;
exports.timeMondays = mondays;
exports.timeTuesday = tuesday;
exports.timeTuesdays = tuesdays;
exports.timeWednesday = wednesday;
exports.timeWednesdays = wednesdays;
exports.timeThursday = thursday;
exports.timeThursdays = thursdays;
exports.timeFriday = friday;
exports.timeFridays = fridays;
exports.timeSaturday = saturday;
exports.timeSaturdays = saturdays;
exports.timeMonth = month;
exports.timeMonths = months;
exports.timeYear = year;
exports.timeYears = years;
exports.utcMinute = utcMinute;
exports.utcMinutes = utcMinutes;
exports.utcHour = utcHour;
exports.utcHours = utcHours;
exports.utcDay = utcDay;
exports.utcDays = utcDays;
exports.utcWeek = utcSunday;
exports.utcWeeks = utcSundays;
exports.utcSunday = utcSunday;
exports.utcSundays = utcSundays;
exports.utcMonday = utcMonday;
exports.utcMondays = utcMondays;
exports.utcTuesday = utcTuesday;
exports.utcTuesdays = utcTuesdays;
exports.utcWednesday = utcWednesday;
exports.utcWednesdays = utcWednesdays;
exports.utcThursday = utcThursday;
exports.utcThursdays = utcThursdays;
exports.utcFriday = utcFriday;
exports.utcFridays = utcFridays;
exports.utcSaturday = utcSaturday;
exports.utcSaturdays = utcSaturdays;
exports.utcMonth = utcMonth;
exports.utcMonths = utcMonths;
exports.utcYear = utcYear;
exports.utcYears = utcYears;

Object.defineProperty(exports, '__esModule', { value: true });

})));

},{}],11:[function(require,module,exports){
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

},{}],12:[function(require,module,exports){
/*!
 * jQuery UI Disable Selection 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: disableSelection
//>>group: Core
//>>description: Disable selection of text content within the set of matched elements.
//>>docs: http://api.jqueryui.com/disableSelection/

// This file is deprecated
( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( [ "jquery", "./version" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
} ( function( $ ) {

return $.fn.extend( {
	disableSelection: ( function() {
		var eventType = "onselectstart" in document.createElement( "div" ) ?
			"selectstart" :
			"mousedown";

		return function() {
			return this.on( eventType + ".ui-disableSelection", function( event ) {
				event.preventDefault();
			} );
		};
	} )(),

	enableSelection: function() {
		return this.off( ".ui-disableSelection" );
	}
} );

} ) );

},{}],13:[function(require,module,exports){
( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( [ "jquery", "./version" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
} ( function( $ ) {

// Internal use only
return $.ui.escapeSelector = ( function() {
	var selectorEscape = /([!"#$%&'()*+,./:;<=>?@[\]^`{|}~])/g;
	return function( selector ) {
		return selector.replace( selectorEscape, "\\$1" );
	};
} )();

} ) );

},{}],14:[function(require,module,exports){
/*!
 * jQuery UI Focusable 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: :focusable Selector
//>>group: Core
//>>description: Selects elements which can be focused.
//>>docs: http://api.jqueryui.com/focusable-selector/

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( [ "jquery", "./version" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
} ( function( $ ) {

// Selectors
$.ui.focusable = function( element, hasTabindex ) {
	var map, mapName, img, focusableIfVisible, fieldset,
		nodeName = element.nodeName.toLowerCase();

	if ( "area" === nodeName ) {
		map = element.parentNode;
		mapName = map.name;
		if ( !element.href || !mapName || map.nodeName.toLowerCase() !== "map" ) {
			return false;
		}
		img = $( "img[usemap='#" + mapName + "']" );
		return img.length > 0 && img.is( ":visible" );
	}

	if ( /^(input|select|textarea|button|object)$/.test( nodeName ) ) {
		focusableIfVisible = !element.disabled;

		if ( focusableIfVisible ) {

			// Form controls within a disabled fieldset are disabled.
			// However, controls within the fieldset's legend do not get disabled.
			// Since controls generally aren't placed inside legends, we skip
			// this portion of the check.
			fieldset = $( element ).closest( "fieldset" )[ 0 ];
			if ( fieldset ) {
				focusableIfVisible = !fieldset.disabled;
			}
		}
	} else if ( "a" === nodeName ) {
		focusableIfVisible = element.href || hasTabindex;
	} else {
		focusableIfVisible = hasTabindex;
	}

	return focusableIfVisible && $( element ).is( ":visible" ) && visible( $( element ) );
};

// Support: IE 8 only
// IE 8 doesn't resolve inherit to visible/hidden for computed values
function visible( element ) {
	var visibility = element.css( "visibility" );
	while ( visibility === "inherit" ) {
		element = element.parent();
		visibility = element.css( "visibility" );
	}
	return visibility !== "hidden";
}

$.extend( $.expr[ ":" ], {
	focusable: function( element ) {
		return $.ui.focusable( element, $.attr( element, "tabindex" ) != null );
	}
} );

return $.ui.focusable;

} ) );

},{}],15:[function(require,module,exports){
/*!
 * jQuery UI Form Reset Mixin 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Form Reset Mixin
//>>group: Core
//>>description: Refresh input widgets when their form is reset
//>>docs: http://api.jqueryui.com/form-reset-mixin/

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( [
			"jquery",
			"./form",
			"./version"
		], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
}( function( $ ) {

return $.ui.formResetMixin = {
	_formResetHandler: function() {
		var form = $( this );

		// Wait for the form reset to actually happen before refreshing
		setTimeout( function() {
			var instances = form.data( "ui-form-reset-instances" );
			$.each( instances, function() {
				this.refresh();
			} );
		} );
	},

	_bindFormResetHandler: function() {
		this.form = this.element.form();
		if ( !this.form.length ) {
			return;
		}

		var instances = this.form.data( "ui-form-reset-instances" ) || [];
		if ( !instances.length ) {

			// We don't use _on() here because we use a single event handler per form
			this.form.on( "reset.ui-form-reset", this._formResetHandler );
		}
		instances.push( this );
		this.form.data( "ui-form-reset-instances", instances );
	},

	_unbindFormResetHandler: function() {
		if ( !this.form.length ) {
			return;
		}

		var instances = this.form.data( "ui-form-reset-instances" );
		instances.splice( $.inArray( this, instances ), 1 );
		if ( instances.length ) {
			this.form.data( "ui-form-reset-instances", instances );
		} else {
			this.form
				.removeData( "ui-form-reset-instances" )
				.off( "reset.ui-form-reset" );
		}
	}
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

// Support: IE8 Only
// IE8 does not support the form attribute and when it is supplied. It overwrites the form prop
// with a string, so we need to find the proper form.
return $.fn.form = function() {
	return typeof this[ 0 ].form === "string" ? this.closest( "form" ) : $( this[ 0 ].form );
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

// This file is deprecated
return $.ui.ie = !!/msie [\w.]+/.exec( navigator.userAgent.toLowerCase() );
} ) );

},{}],18:[function(require,module,exports){
/*!
 * jQuery UI Keycode 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Keycode
//>>group: Core
//>>description: Provide keycodes as keynames
//>>docs: http://api.jqueryui.com/jQuery.ui.keyCode/

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( [ "jquery", "./version" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
} ( function( $ ) {
return $.ui.keyCode = {
	BACKSPACE: 8,
	COMMA: 188,
	DELETE: 46,
	DOWN: 40,
	END: 35,
	ENTER: 13,
	ESCAPE: 27,
	HOME: 36,
	LEFT: 37,
	PAGE_DOWN: 34,
	PAGE_UP: 33,
	PERIOD: 190,
	RIGHT: 39,
	SPACE: 32,
	TAB: 9,
	UP: 38
};

} ) );

},{}],19:[function(require,module,exports){
/*!
 * jQuery UI Labels 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: labels
//>>group: Core
//>>description: Find all the labels associated with a given input
//>>docs: http://api.jqueryui.com/labels/

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( [ "jquery", "./version", "./escape-selector" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
} ( function( $ ) {

return $.fn.labels = function() {
	var ancestor, selector, id, labels, ancestors;

	// Check control.labels first
	if ( this[ 0 ].labels && this[ 0 ].labels.length ) {
		return this.pushStack( this[ 0 ].labels );
	}

	// Support: IE <= 11, FF <= 37, Android <= 2.3 only
	// Above browsers do not support control.labels. Everything below is to support them
	// as well as document fragments. control.labels does not work on document fragments
	labels = this.eq( 0 ).parents( "label" );

	// Look for the label based on the id
	id = this.attr( "id" );
	if ( id ) {

		// We don't search against the document in case the element
		// is disconnected from the DOM
		ancestor = this.eq( 0 ).parents().last();

		// Get a full set of top level ancestors
		ancestors = ancestor.add( ancestor.length ? ancestor.siblings() : this.siblings() );

		// Create a selector for the label based on the id
		selector = "label[for='" + $.ui.escapeSelector( id ) + "']";

		labels = labels.add( ancestors.find( selector ).addBack( selector ) );

	}

	// Return whatever we have found for labels
	return this.pushStack( labels );
};

} ) );

},{}],20:[function(require,module,exports){
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

},{}],21:[function(require,module,exports){
/*!
 * jQuery UI Position 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/position/
 */

//>>label: Position
//>>group: Core
//>>description: Positions elements relative to other elements.
//>>docs: http://api.jqueryui.com/position/
//>>demos: http://jqueryui.com/position/

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( [ "jquery", "./version" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
}( function( $ ) {
( function() {
var cachedScrollbarWidth,
	max = Math.max,
	abs = Math.abs,
	rhorizontal = /left|center|right/,
	rvertical = /top|center|bottom/,
	roffset = /[\+\-]\d+(\.[\d]+)?%?/,
	rposition = /^\w+/,
	rpercent = /%$/,
	_position = $.fn.position;

function getOffsets( offsets, width, height ) {
	return [
		parseFloat( offsets[ 0 ] ) * ( rpercent.test( offsets[ 0 ] ) ? width / 100 : 1 ),
		parseFloat( offsets[ 1 ] ) * ( rpercent.test( offsets[ 1 ] ) ? height / 100 : 1 )
	];
}

function parseCss( element, property ) {
	return parseInt( $.css( element, property ), 10 ) || 0;
}

function getDimensions( elem ) {
	var raw = elem[ 0 ];
	if ( raw.nodeType === 9 ) {
		return {
			width: elem.width(),
			height: elem.height(),
			offset: { top: 0, left: 0 }
		};
	}
	if ( $.isWindow( raw ) ) {
		return {
			width: elem.width(),
			height: elem.height(),
			offset: { top: elem.scrollTop(), left: elem.scrollLeft() }
		};
	}
	if ( raw.preventDefault ) {
		return {
			width: 0,
			height: 0,
			offset: { top: raw.pageY, left: raw.pageX }
		};
	}
	return {
		width: elem.outerWidth(),
		height: elem.outerHeight(),
		offset: elem.offset()
	};
}

$.position = {
	scrollbarWidth: function() {
		if ( cachedScrollbarWidth !== undefined ) {
			return cachedScrollbarWidth;
		}
		var w1, w2,
			div = $( "<div " +
				"style='display:block;position:absolute;width:50px;height:50px;overflow:hidden;'>" +
				"<div style='height:100px;width:auto;'></div></div>" ),
			innerDiv = div.children()[ 0 ];

		$( "body" ).append( div );
		w1 = innerDiv.offsetWidth;
		div.css( "overflow", "scroll" );

		w2 = innerDiv.offsetWidth;

		if ( w1 === w2 ) {
			w2 = div[ 0 ].clientWidth;
		}

		div.remove();

		return ( cachedScrollbarWidth = w1 - w2 );
	},
	getScrollInfo: function( within ) {
		var overflowX = within.isWindow || within.isDocument ? "" :
				within.element.css( "overflow-x" ),
			overflowY = within.isWindow || within.isDocument ? "" :
				within.element.css( "overflow-y" ),
			hasOverflowX = overflowX === "scroll" ||
				( overflowX === "auto" && within.width < within.element[ 0 ].scrollWidth ),
			hasOverflowY = overflowY === "scroll" ||
				( overflowY === "auto" && within.height < within.element[ 0 ].scrollHeight );
		return {
			width: hasOverflowY ? $.position.scrollbarWidth() : 0,
			height: hasOverflowX ? $.position.scrollbarWidth() : 0
		};
	},
	getWithinInfo: function( element ) {
		var withinElement = $( element || window ),
			isWindow = $.isWindow( withinElement[ 0 ] ),
			isDocument = !!withinElement[ 0 ] && withinElement[ 0 ].nodeType === 9,
			hasOffset = !isWindow && !isDocument;
		return {
			element: withinElement,
			isWindow: isWindow,
			isDocument: isDocument,
			offset: hasOffset ? $( element ).offset() : { left: 0, top: 0 },
			scrollLeft: withinElement.scrollLeft(),
			scrollTop: withinElement.scrollTop(),
			width: withinElement.outerWidth(),
			height: withinElement.outerHeight()
		};
	}
};

$.fn.position = function( options ) {
	if ( !options || !options.of ) {
		return _position.apply( this, arguments );
	}

	// Make a copy, we don't want to modify arguments
	options = $.extend( {}, options );

	var atOffset, targetWidth, targetHeight, targetOffset, basePosition, dimensions,
		target = $( options.of ),
		within = $.position.getWithinInfo( options.within ),
		scrollInfo = $.position.getScrollInfo( within ),
		collision = ( options.collision || "flip" ).split( " " ),
		offsets = {};

	dimensions = getDimensions( target );
	if ( target[ 0 ].preventDefault ) {

		// Force left top to allow flipping
		options.at = "left top";
	}
	targetWidth = dimensions.width;
	targetHeight = dimensions.height;
	targetOffset = dimensions.offset;

	// Clone to reuse original targetOffset later
	basePosition = $.extend( {}, targetOffset );

	// Force my and at to have valid horizontal and vertical positions
	// if a value is missing or invalid, it will be converted to center
	$.each( [ "my", "at" ], function() {
		var pos = ( options[ this ] || "" ).split( " " ),
			horizontalOffset,
			verticalOffset;

		if ( pos.length === 1 ) {
			pos = rhorizontal.test( pos[ 0 ] ) ?
				pos.concat( [ "center" ] ) :
				rvertical.test( pos[ 0 ] ) ?
					[ "center" ].concat( pos ) :
					[ "center", "center" ];
		}
		pos[ 0 ] = rhorizontal.test( pos[ 0 ] ) ? pos[ 0 ] : "center";
		pos[ 1 ] = rvertical.test( pos[ 1 ] ) ? pos[ 1 ] : "center";

		// Calculate offsets
		horizontalOffset = roffset.exec( pos[ 0 ] );
		verticalOffset = roffset.exec( pos[ 1 ] );
		offsets[ this ] = [
			horizontalOffset ? horizontalOffset[ 0 ] : 0,
			verticalOffset ? verticalOffset[ 0 ] : 0
		];

		// Reduce to just the positions without the offsets
		options[ this ] = [
			rposition.exec( pos[ 0 ] )[ 0 ],
			rposition.exec( pos[ 1 ] )[ 0 ]
		];
	} );

	// Normalize collision option
	if ( collision.length === 1 ) {
		collision[ 1 ] = collision[ 0 ];
	}

	if ( options.at[ 0 ] === "right" ) {
		basePosition.left += targetWidth;
	} else if ( options.at[ 0 ] === "center" ) {
		basePosition.left += targetWidth / 2;
	}

	if ( options.at[ 1 ] === "bottom" ) {
		basePosition.top += targetHeight;
	} else if ( options.at[ 1 ] === "center" ) {
		basePosition.top += targetHeight / 2;
	}

	atOffset = getOffsets( offsets.at, targetWidth, targetHeight );
	basePosition.left += atOffset[ 0 ];
	basePosition.top += atOffset[ 1 ];

	return this.each( function() {
		var collisionPosition, using,
			elem = $( this ),
			elemWidth = elem.outerWidth(),
			elemHeight = elem.outerHeight(),
			marginLeft = parseCss( this, "marginLeft" ),
			marginTop = parseCss( this, "marginTop" ),
			collisionWidth = elemWidth + marginLeft + parseCss( this, "marginRight" ) +
				scrollInfo.width,
			collisionHeight = elemHeight + marginTop + parseCss( this, "marginBottom" ) +
				scrollInfo.height,
			position = $.extend( {}, basePosition ),
			myOffset = getOffsets( offsets.my, elem.outerWidth(), elem.outerHeight() );

		if ( options.my[ 0 ] === "right" ) {
			position.left -= elemWidth;
		} else if ( options.my[ 0 ] === "center" ) {
			position.left -= elemWidth / 2;
		}

		if ( options.my[ 1 ] === "bottom" ) {
			position.top -= elemHeight;
		} else if ( options.my[ 1 ] === "center" ) {
			position.top -= elemHeight / 2;
		}

		position.left += myOffset[ 0 ];
		position.top += myOffset[ 1 ];

		collisionPosition = {
			marginLeft: marginLeft,
			marginTop: marginTop
		};

		$.each( [ "left", "top" ], function( i, dir ) {
			if ( $.ui.position[ collision[ i ] ] ) {
				$.ui.position[ collision[ i ] ][ dir ]( position, {
					targetWidth: targetWidth,
					targetHeight: targetHeight,
					elemWidth: elemWidth,
					elemHeight: elemHeight,
					collisionPosition: collisionPosition,
					collisionWidth: collisionWidth,
					collisionHeight: collisionHeight,
					offset: [ atOffset[ 0 ] + myOffset[ 0 ], atOffset [ 1 ] + myOffset[ 1 ] ],
					my: options.my,
					at: options.at,
					within: within,
					elem: elem
				} );
			}
		} );

		if ( options.using ) {

			// Adds feedback as second argument to using callback, if present
			using = function( props ) {
				var left = targetOffset.left - position.left,
					right = left + targetWidth - elemWidth,
					top = targetOffset.top - position.top,
					bottom = top + targetHeight - elemHeight,
					feedback = {
						target: {
							element: target,
							left: targetOffset.left,
							top: targetOffset.top,
							width: targetWidth,
							height: targetHeight
						},
						element: {
							element: elem,
							left: position.left,
							top: position.top,
							width: elemWidth,
							height: elemHeight
						},
						horizontal: right < 0 ? "left" : left > 0 ? "right" : "center",
						vertical: bottom < 0 ? "top" : top > 0 ? "bottom" : "middle"
					};
				if ( targetWidth < elemWidth && abs( left + right ) < targetWidth ) {
					feedback.horizontal = "center";
				}
				if ( targetHeight < elemHeight && abs( top + bottom ) < targetHeight ) {
					feedback.vertical = "middle";
				}
				if ( max( abs( left ), abs( right ) ) > max( abs( top ), abs( bottom ) ) ) {
					feedback.important = "horizontal";
				} else {
					feedback.important = "vertical";
				}
				options.using.call( this, props, feedback );
			};
		}

		elem.offset( $.extend( position, { using: using } ) );
	} );
};

$.ui.position = {
	fit: {
		left: function( position, data ) {
			var within = data.within,
				withinOffset = within.isWindow ? within.scrollLeft : within.offset.left,
				outerWidth = within.width,
				collisionPosLeft = position.left - data.collisionPosition.marginLeft,
				overLeft = withinOffset - collisionPosLeft,
				overRight = collisionPosLeft + data.collisionWidth - outerWidth - withinOffset,
				newOverRight;

			// Element is wider than within
			if ( data.collisionWidth > outerWidth ) {

				// Element is initially over the left side of within
				if ( overLeft > 0 && overRight <= 0 ) {
					newOverRight = position.left + overLeft + data.collisionWidth - outerWidth -
						withinOffset;
					position.left += overLeft - newOverRight;

				// Element is initially over right side of within
				} else if ( overRight > 0 && overLeft <= 0 ) {
					position.left = withinOffset;

				// Element is initially over both left and right sides of within
				} else {
					if ( overLeft > overRight ) {
						position.left = withinOffset + outerWidth - data.collisionWidth;
					} else {
						position.left = withinOffset;
					}
				}

			// Too far left -> align with left edge
			} else if ( overLeft > 0 ) {
				position.left += overLeft;

			// Too far right -> align with right edge
			} else if ( overRight > 0 ) {
				position.left -= overRight;

			// Adjust based on position and margin
			} else {
				position.left = max( position.left - collisionPosLeft, position.left );
			}
		},
		top: function( position, data ) {
			var within = data.within,
				withinOffset = within.isWindow ? within.scrollTop : within.offset.top,
				outerHeight = data.within.height,
				collisionPosTop = position.top - data.collisionPosition.marginTop,
				overTop = withinOffset - collisionPosTop,
				overBottom = collisionPosTop + data.collisionHeight - outerHeight - withinOffset,
				newOverBottom;

			// Element is taller than within
			if ( data.collisionHeight > outerHeight ) {

				// Element is initially over the top of within
				if ( overTop > 0 && overBottom <= 0 ) {
					newOverBottom = position.top + overTop + data.collisionHeight - outerHeight -
						withinOffset;
					position.top += overTop - newOverBottom;

				// Element is initially over bottom of within
				} else if ( overBottom > 0 && overTop <= 0 ) {
					position.top = withinOffset;

				// Element is initially over both top and bottom of within
				} else {
					if ( overTop > overBottom ) {
						position.top = withinOffset + outerHeight - data.collisionHeight;
					} else {
						position.top = withinOffset;
					}
				}

			// Too far up -> align with top
			} else if ( overTop > 0 ) {
				position.top += overTop;

			// Too far down -> align with bottom edge
			} else if ( overBottom > 0 ) {
				position.top -= overBottom;

			// Adjust based on position and margin
			} else {
				position.top = max( position.top - collisionPosTop, position.top );
			}
		}
	},
	flip: {
		left: function( position, data ) {
			var within = data.within,
				withinOffset = within.offset.left + within.scrollLeft,
				outerWidth = within.width,
				offsetLeft = within.isWindow ? within.scrollLeft : within.offset.left,
				collisionPosLeft = position.left - data.collisionPosition.marginLeft,
				overLeft = collisionPosLeft - offsetLeft,
				overRight = collisionPosLeft + data.collisionWidth - outerWidth - offsetLeft,
				myOffset = data.my[ 0 ] === "left" ?
					-data.elemWidth :
					data.my[ 0 ] === "right" ?
						data.elemWidth :
						0,
				atOffset = data.at[ 0 ] === "left" ?
					data.targetWidth :
					data.at[ 0 ] === "right" ?
						-data.targetWidth :
						0,
				offset = -2 * data.offset[ 0 ],
				newOverRight,
				newOverLeft;

			if ( overLeft < 0 ) {
				newOverRight = position.left + myOffset + atOffset + offset + data.collisionWidth -
					outerWidth - withinOffset;
				if ( newOverRight < 0 || newOverRight < abs( overLeft ) ) {
					position.left += myOffset + atOffset + offset;
				}
			} else if ( overRight > 0 ) {
				newOverLeft = position.left - data.collisionPosition.marginLeft + myOffset +
					atOffset + offset - offsetLeft;
				if ( newOverLeft > 0 || abs( newOverLeft ) < overRight ) {
					position.left += myOffset + atOffset + offset;
				}
			}
		},
		top: function( position, data ) {
			var within = data.within,
				withinOffset = within.offset.top + within.scrollTop,
				outerHeight = within.height,
				offsetTop = within.isWindow ? within.scrollTop : within.offset.top,
				collisionPosTop = position.top - data.collisionPosition.marginTop,
				overTop = collisionPosTop - offsetTop,
				overBottom = collisionPosTop + data.collisionHeight - outerHeight - offsetTop,
				top = data.my[ 1 ] === "top",
				myOffset = top ?
					-data.elemHeight :
					data.my[ 1 ] === "bottom" ?
						data.elemHeight :
						0,
				atOffset = data.at[ 1 ] === "top" ?
					data.targetHeight :
					data.at[ 1 ] === "bottom" ?
						-data.targetHeight :
						0,
				offset = -2 * data.offset[ 1 ],
				newOverTop,
				newOverBottom;
			if ( overTop < 0 ) {
				newOverBottom = position.top + myOffset + atOffset + offset + data.collisionHeight -
					outerHeight - withinOffset;
				if ( newOverBottom < 0 || newOverBottom < abs( overTop ) ) {
					position.top += myOffset + atOffset + offset;
				}
			} else if ( overBottom > 0 ) {
				newOverTop = position.top - data.collisionPosition.marginTop + myOffset + atOffset +
					offset - offsetTop;
				if ( newOverTop > 0 || abs( newOverTop ) < overBottom ) {
					position.top += myOffset + atOffset + offset;
				}
			}
		}
	},
	flipfit: {
		left: function() {
			$.ui.position.flip.left.apply( this, arguments );
			$.ui.position.fit.left.apply( this, arguments );
		},
		top: function() {
			$.ui.position.flip.top.apply( this, arguments );
			$.ui.position.fit.top.apply( this, arguments );
		}
	}
};

} )();

return $.ui.position;

} ) );

},{}],22:[function(require,module,exports){
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

},{}],23:[function(require,module,exports){
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

},{}],24:[function(require,module,exports){
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

},{}],25:[function(require,module,exports){
/*!
 * jQuery UI Tabbable 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: :tabbable Selector
//>>group: Core
//>>description: Selects elements which can be tabbed to.
//>>docs: http://api.jqueryui.com/tabbable-selector/

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( [ "jquery", "./version", "./focusable" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
} ( function( $ ) {

return $.extend( $.expr[ ":" ], {
	tabbable: function( element ) {
		var tabIndex = $.attr( element, "tabindex" ),
			hasTabindex = tabIndex != null;
		return ( !hasTabindex || tabIndex >= 0 ) && $.ui.focusable( element, hasTabindex );
	}
} );

} ) );

},{}],26:[function(require,module,exports){
/*!
 * jQuery UI Unique ID 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: uniqueId
//>>group: Core
//>>description: Functions to generate and remove uniqueId's
//>>docs: http://api.jqueryui.com/uniqueId/

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( [ "jquery", "./version" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
} ( function( $ ) {

return $.fn.extend( {
	uniqueId: ( function() {
		var uuid = 0;

		return function() {
			return this.each( function() {
				if ( !this.id ) {
					this.id = "ui-id-" + ( ++uuid );
				}
			} );
		};
	} )(),

	removeUniqueId: function() {
		return this.each( function() {
			if ( /^ui-id-\d+$/.test( this.id ) ) {
				$( this ).removeAttr( "id" );
			}
		} );
	}
} );

} ) );

},{}],27:[function(require,module,exports){
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

},{}],28:[function(require,module,exports){
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

},{}],29:[function(require,module,exports){
/*!
 * jQuery UI Button 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Button
//>>group: Widgets
//>>description: Enhances a form with themeable buttons.
//>>docs: http://api.jqueryui.com/button/
//>>demos: http://jqueryui.com/button/
//>>css.structure: ../../themes/base/core.css
//>>css.structure: ../../themes/base/button.css
//>>css.theme: ../../themes/base/theme.css

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( [
			"jquery",

			// These are only for backcompat
			// TODO: Remove after 1.12
			"./controlgroup",
			"./checkboxradio",

			"../keycode",
			"../widget"
		], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
}( function( $ ) {

$.widget( "ui.button", {
	version: "1.12.1",
	defaultElement: "<button>",
	options: {
		classes: {
			"ui-button": "ui-corner-all"
		},
		disabled: null,
		icon: null,
		iconPosition: "beginning",
		label: null,
		showLabel: true
	},

	_getCreateOptions: function() {
		var disabled,

			// This is to support cases like in jQuery Mobile where the base widget does have
			// an implementation of _getCreateOptions
			options = this._super() || {};

		this.isInput = this.element.is( "input" );

		disabled = this.element[ 0 ].disabled;
		if ( disabled != null ) {
			options.disabled = disabled;
		}

		this.originalLabel = this.isInput ? this.element.val() : this.element.html();
		if ( this.originalLabel ) {
			options.label = this.originalLabel;
		}

		return options;
	},

	_create: function() {
		if ( !this.option.showLabel & !this.options.icon ) {
			this.options.showLabel = true;
		}

		// We have to check the option again here even though we did in _getCreateOptions,
		// because null may have been passed on init which would override what was set in
		// _getCreateOptions
		if ( this.options.disabled == null ) {
			this.options.disabled = this.element[ 0 ].disabled || false;
		}

		this.hasTitle = !!this.element.attr( "title" );

		// Check to see if the label needs to be set or if its already correct
		if ( this.options.label && this.options.label !== this.originalLabel ) {
			if ( this.isInput ) {
				this.element.val( this.options.label );
			} else {
				this.element.html( this.options.label );
			}
		}
		this._addClass( "ui-button", "ui-widget" );
		this._setOption( "disabled", this.options.disabled );
		this._enhance();

		if ( this.element.is( "a" ) ) {
			this._on( {
				"keyup": function( event ) {
					if ( event.keyCode === $.ui.keyCode.SPACE ) {
						event.preventDefault();

						// Support: PhantomJS <= 1.9, IE 8 Only
						// If a native click is available use it so we actually cause navigation
						// otherwise just trigger a click event
						if ( this.element[ 0 ].click ) {
							this.element[ 0 ].click();
						} else {
							this.element.trigger( "click" );
						}
					}
				}
			} );
		}
	},

	_enhance: function() {
		if ( !this.element.is( "button" ) ) {
			this.element.attr( "role", "button" );
		}

		if ( this.options.icon ) {
			this._updateIcon( "icon", this.options.icon );
			this._updateTooltip();
		}
	},

	_updateTooltip: function() {
		this.title = this.element.attr( "title" );

		if ( !this.options.showLabel && !this.title ) {
			this.element.attr( "title", this.options.label );
		}
	},

	_updateIcon: function( option, value ) {
		var icon = option !== "iconPosition",
			position = icon ? this.options.iconPosition : value,
			displayBlock = position === "top" || position === "bottom";

		// Create icon
		if ( !this.icon ) {
			this.icon = $( "<span>" );

			this._addClass( this.icon, "ui-button-icon", "ui-icon" );

			if ( !this.options.showLabel ) {
				this._addClass( "ui-button-icon-only" );
			}
		} else if ( icon ) {

			// If we are updating the icon remove the old icon class
			this._removeClass( this.icon, null, this.options.icon );
		}

		// If we are updating the icon add the new icon class
		if ( icon ) {
			this._addClass( this.icon, null, value );
		}

		this._attachIcon( position );

		// If the icon is on top or bottom we need to add the ui-widget-icon-block class and remove
		// the iconSpace if there is one.
		if ( displayBlock ) {
			this._addClass( this.icon, null, "ui-widget-icon-block" );
			if ( this.iconSpace ) {
				this.iconSpace.remove();
			}
		} else {

			// Position is beginning or end so remove the ui-widget-icon-block class and add the
			// space if it does not exist
			if ( !this.iconSpace ) {
				this.iconSpace = $( "<span> </span>" );
				this._addClass( this.iconSpace, "ui-button-icon-space" );
			}
			this._removeClass( this.icon, null, "ui-wiget-icon-block" );
			this._attachIconSpace( position );
		}
	},

	_destroy: function() {
		this.element.removeAttr( "role" );

		if ( this.icon ) {
			this.icon.remove();
		}
		if ( this.iconSpace ) {
			this.iconSpace.remove();
		}
		if ( !this.hasTitle ) {
			this.element.removeAttr( "title" );
		}
	},

	_attachIconSpace: function( iconPosition ) {
		this.icon[ /^(?:end|bottom)/.test( iconPosition ) ? "before" : "after" ]( this.iconSpace );
	},

	_attachIcon: function( iconPosition ) {
		this.element[ /^(?:end|bottom)/.test( iconPosition ) ? "append" : "prepend" ]( this.icon );
	},

	_setOptions: function( options ) {
		var newShowLabel = options.showLabel === undefined ?
				this.options.showLabel :
				options.showLabel,
			newIcon = options.icon === undefined ? this.options.icon : options.icon;

		if ( !newShowLabel && !newIcon ) {
			options.showLabel = true;
		}
		this._super( options );
	},

	_setOption: function( key, value ) {
		if ( key === "icon" ) {
			if ( value ) {
				this._updateIcon( key, value );
			} else if ( this.icon ) {
				this.icon.remove();
				if ( this.iconSpace ) {
					this.iconSpace.remove();
				}
			}
		}

		if ( key === "iconPosition" ) {
			this._updateIcon( key, value );
		}

		// Make sure we can't end up with a button that has neither text nor icon
		if ( key === "showLabel" ) {
				this._toggleClass( "ui-button-icon-only", null, !value );
				this._updateTooltip();
		}

		if ( key === "label" ) {
			if ( this.isInput ) {
				this.element.val( value );
			} else {

				// If there is an icon, append it, else nothing then append the value
				// this avoids removal of the icon when setting label text
				this.element.html( value );
				if ( this.icon ) {
					this._attachIcon( this.options.iconPosition );
					this._attachIconSpace( this.options.iconPosition );
				}
			}
		}

		this._super( key, value );

		if ( key === "disabled" ) {
			this._toggleClass( null, "ui-state-disabled", value );
			this.element[ 0 ].disabled = value;
			if ( value ) {
				this.element.blur();
			}
		}
	},

	refresh: function() {

		// Make sure to only check disabled if its an element that supports this otherwise
		// check for the disabled class to determine state
		var isDisabled = this.element.is( "input, button" ) ?
			this.element[ 0 ].disabled : this.element.hasClass( "ui-button-disabled" );

		if ( isDisabled !== this.options.disabled ) {
			this._setOptions( { disabled: isDisabled } );
		}

		this._updateTooltip();
	}
} );

// DEPRECATED
if ( $.uiBackCompat !== false ) {

	// Text and Icons options
	$.widget( "ui.button", $.ui.button, {
		options: {
			text: true,
			icons: {
				primary: null,
				secondary: null
			}
		},

		_create: function() {
			if ( this.options.showLabel && !this.options.text ) {
				this.options.showLabel = this.options.text;
			}
			if ( !this.options.showLabel && this.options.text ) {
				this.options.text = this.options.showLabel;
			}
			if ( !this.options.icon && ( this.options.icons.primary ||
					this.options.icons.secondary ) ) {
				if ( this.options.icons.primary ) {
					this.options.icon = this.options.icons.primary;
				} else {
					this.options.icon = this.options.icons.secondary;
					this.options.iconPosition = "end";
				}
			} else if ( this.options.icon ) {
				this.options.icons.primary = this.options.icon;
			}
			this._super();
		},

		_setOption: function( key, value ) {
			if ( key === "text" ) {
				this._super( "showLabel", value );
				return;
			}
			if ( key === "showLabel" ) {
				this.options.text = value;
			}
			if ( key === "icon" ) {
				this.options.icons.primary = value;
			}
			if ( key === "icons" ) {
				if ( value.primary ) {
					this._super( "icon", value.primary );
					this._super( "iconPosition", "beginning" );
				} else if ( value.secondary ) {
					this._super( "icon", value.secondary );
					this._super( "iconPosition", "end" );
				}
			}
			this._superApply( arguments );
		}
	} );

	$.fn.button = ( function( orig ) {
		return function() {
			if ( !this.length || ( this.length && this[ 0 ].tagName !== "INPUT" ) ||
					( this.length && this[ 0 ].tagName === "INPUT" && (
						this.attr( "type" ) !== "checkbox" && this.attr( "type" ) !== "radio"
					) ) ) {
				return orig.apply( this, arguments );
			}
			if ( !$.ui.checkboxradio ) {
				$.error( "Checkboxradio widget missing" );
			}
			if ( arguments.length === 0 ) {
				return this.checkboxradio( {
					"icon": false
				} );
			}
			return this.checkboxradio.apply( this, arguments );
		};
	} )( $.fn.button );

	$.fn.buttonset = function() {
		if ( !$.ui.controlgroup ) {
			$.error( "Controlgroup widget missing" );
		}
		if ( arguments[ 0 ] === "option" && arguments[ 1 ] === "items" && arguments[ 2 ] ) {
			return this.controlgroup.apply( this,
				[ arguments[ 0 ], "items.button", arguments[ 2 ] ] );
		}
		if ( arguments[ 0 ] === "option" && arguments[ 1 ] === "items" ) {
			return this.controlgroup.apply( this, [ arguments[ 0 ], "items.button" ] );
		}
		if ( typeof arguments[ 0 ] === "object" && arguments[ 0 ].items ) {
			arguments[ 0 ].items = {
				button: arguments[ 0 ].items
			};
		}
		return this.controlgroup.apply( this, arguments );
	};
}

return $.ui.button;

} ) );

},{}],30:[function(require,module,exports){
/*!
 * jQuery UI Checkboxradio 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Checkboxradio
//>>group: Widgets
//>>description: Enhances a form with multiple themeable checkboxes or radio buttons.
//>>docs: http://api.jqueryui.com/checkboxradio/
//>>demos: http://jqueryui.com/checkboxradio/
//>>css.structure: ../../themes/base/core.css
//>>css.structure: ../../themes/base/button.css
//>>css.structure: ../../themes/base/checkboxradio.css
//>>css.theme: ../../themes/base/theme.css

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( [
			"jquery",
			"../escape-selector",
			"../form-reset-mixin",
			"../labels",
			"../widget"
		], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
}( function( $ ) {

$.widget( "ui.checkboxradio", [ $.ui.formResetMixin, {
	version: "1.12.1",
	options: {
		disabled: null,
		label: null,
		icon: true,
		classes: {
			"ui-checkboxradio-label": "ui-corner-all",
			"ui-checkboxradio-icon": "ui-corner-all"
		}
	},

	_getCreateOptions: function() {
		var disabled, labels;
		var that = this;
		var options = this._super() || {};

		// We read the type here, because it makes more sense to throw a element type error first,
		// rather then the error for lack of a label. Often if its the wrong type, it
		// won't have a label (e.g. calling on a div, btn, etc)
		this._readType();

		labels = this.element.labels();

		// If there are multiple labels, use the last one
		this.label = $( labels[ labels.length - 1 ] );
		if ( !this.label.length ) {
			$.error( "No label found for checkboxradio widget" );
		}

		this.originalLabel = "";

		// We need to get the label text but this may also need to make sure it does not contain the
		// input itself.
		this.label.contents().not( this.element[ 0 ] ).each( function() {

			// The label contents could be text, html, or a mix. We concat each element to get a
			// string representation of the label, without the input as part of it.
			that.originalLabel += this.nodeType === 3 ? $( this ).text() : this.outerHTML;
		} );

		// Set the label option if we found label text
		if ( this.originalLabel ) {
			options.label = this.originalLabel;
		}

		disabled = this.element[ 0 ].disabled;
		if ( disabled != null ) {
			options.disabled = disabled;
		}
		return options;
	},

	_create: function() {
		var checked = this.element[ 0 ].checked;

		this._bindFormResetHandler();

		if ( this.options.disabled == null ) {
			this.options.disabled = this.element[ 0 ].disabled;
		}

		this._setOption( "disabled", this.options.disabled );
		this._addClass( "ui-checkboxradio", "ui-helper-hidden-accessible" );
		this._addClass( this.label, "ui-checkboxradio-label", "ui-button ui-widget" );

		if ( this.type === "radio" ) {
			this._addClass( this.label, "ui-checkboxradio-radio-label" );
		}

		if ( this.options.label && this.options.label !== this.originalLabel ) {
			this._updateLabel();
		} else if ( this.originalLabel ) {
			this.options.label = this.originalLabel;
		}

		this._enhance();

		if ( checked ) {
			this._addClass( this.label, "ui-checkboxradio-checked", "ui-state-active" );
			if ( this.icon ) {
				this._addClass( this.icon, null, "ui-state-hover" );
			}
		}

		this._on( {
			change: "_toggleClasses",
			focus: function() {
				this._addClass( this.label, null, "ui-state-focus ui-visual-focus" );
			},
			blur: function() {
				this._removeClass( this.label, null, "ui-state-focus ui-visual-focus" );
			}
		} );
	},

	_readType: function() {
		var nodeName = this.element[ 0 ].nodeName.toLowerCase();
		this.type = this.element[ 0 ].type;
		if ( nodeName !== "input" || !/radio|checkbox/.test( this.type ) ) {
			$.error( "Can't create checkboxradio on element.nodeName=" + nodeName +
				" and element.type=" + this.type );
		}
	},

	// Support jQuery Mobile enhanced option
	_enhance: function() {
		this._updateIcon( this.element[ 0 ].checked );
	},

	widget: function() {
		return this.label;
	},

	_getRadioGroup: function() {
		var group;
		var name = this.element[ 0 ].name;
		var nameSelector = "input[name='" + $.ui.escapeSelector( name ) + "']";

		if ( !name ) {
			return $( [] );
		}

		if ( this.form.length ) {
			group = $( this.form[ 0 ].elements ).filter( nameSelector );
		} else {

			// Not inside a form, check all inputs that also are not inside a form
			group = $( nameSelector ).filter( function() {
				return $( this ).form().length === 0;
			} );
		}

		return group.not( this.element );
	},

	_toggleClasses: function() {
		var checked = this.element[ 0 ].checked;
		this._toggleClass( this.label, "ui-checkboxradio-checked", "ui-state-active", checked );

		if ( this.options.icon && this.type === "checkbox" ) {
			this._toggleClass( this.icon, null, "ui-icon-check ui-state-checked", checked )
				._toggleClass( this.icon, null, "ui-icon-blank", !checked );
		}

		if ( this.type === "radio" ) {
			this._getRadioGroup()
				.each( function() {
					var instance = $( this ).checkboxradio( "instance" );

					if ( instance ) {
						instance._removeClass( instance.label,
							"ui-checkboxradio-checked", "ui-state-active" );
					}
				} );
		}
	},

	_destroy: function() {
		this._unbindFormResetHandler();

		if ( this.icon ) {
			this.icon.remove();
			this.iconSpace.remove();
		}
	},

	_setOption: function( key, value ) {

		// We don't allow the value to be set to nothing
		if ( key === "label" && !value ) {
			return;
		}

		this._super( key, value );

		if ( key === "disabled" ) {
			this._toggleClass( this.label, null, "ui-state-disabled", value );
			this.element[ 0 ].disabled = value;

			// Don't refresh when setting disabled
			return;
		}
		this.refresh();
	},

	_updateIcon: function( checked ) {
		var toAdd = "ui-icon ui-icon-background ";

		if ( this.options.icon ) {
			if ( !this.icon ) {
				this.icon = $( "<span>" );
				this.iconSpace = $( "<span> </span>" );
				this._addClass( this.iconSpace, "ui-checkboxradio-icon-space" );
			}

			if ( this.type === "checkbox" ) {
				toAdd += checked ? "ui-icon-check ui-state-checked" : "ui-icon-blank";
				this._removeClass( this.icon, null, checked ? "ui-icon-blank" : "ui-icon-check" );
			} else {
				toAdd += "ui-icon-blank";
			}
			this._addClass( this.icon, "ui-checkboxradio-icon", toAdd );
			if ( !checked ) {
				this._removeClass( this.icon, null, "ui-icon-check ui-state-checked" );
			}
			this.icon.prependTo( this.label ).after( this.iconSpace );
		} else if ( this.icon !== undefined ) {
			this.icon.remove();
			this.iconSpace.remove();
			delete this.icon;
		}
	},

	_updateLabel: function() {

		// Remove the contents of the label ( minus the icon, icon space, and input )
		var contents = this.label.contents().not( this.element[ 0 ] );
		if ( this.icon ) {
			contents = contents.not( this.icon[ 0 ] );
		}
		if ( this.iconSpace ) {
			contents = contents.not( this.iconSpace[ 0 ] );
		}
		contents.remove();

		this.label.append( this.options.label );
	},

	refresh: function() {
		var checked = this.element[ 0 ].checked,
			isDisabled = this.element[ 0 ].disabled;

		this._updateIcon( checked );
		this._toggleClass( this.label, "ui-checkboxradio-checked", "ui-state-active", checked );
		if ( this.options.label !== null ) {
			this._updateLabel();
		}

		if ( isDisabled !== this.options.disabled ) {
			this._setOptions( { "disabled": isDisabled } );
		}
	}

} ] );

return $.ui.checkboxradio;

} ) );

},{}],31:[function(require,module,exports){
/*!
 * jQuery UI Controlgroup 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Controlgroup
//>>group: Widgets
//>>description: Visually groups form control widgets
//>>docs: http://api.jqueryui.com/controlgroup/
//>>demos: http://jqueryui.com/controlgroup/
//>>css.structure: ../../themes/base/core.css
//>>css.structure: ../../themes/base/controlgroup.css
//>>css.theme: ../../themes/base/theme.css

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( [
			"jquery",
			"../widget"
		], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
}( function( $ ) {
var controlgroupCornerRegex = /ui-corner-([a-z]){2,6}/g;

return $.widget( "ui.controlgroup", {
	version: "1.12.1",
	defaultElement: "<div>",
	options: {
		direction: "horizontal",
		disabled: null,
		onlyVisible: true,
		items: {
			"button": "input[type=button], input[type=submit], input[type=reset], button, a",
			"controlgroupLabel": ".ui-controlgroup-label",
			"checkboxradio": "input[type='checkbox'], input[type='radio']",
			"selectmenu": "select",
			"spinner": ".ui-spinner-input"
		}
	},

	_create: function() {
		this._enhance();
	},

	// To support the enhanced option in jQuery Mobile, we isolate DOM manipulation
	_enhance: function() {
		this.element.attr( "role", "toolbar" );
		this.refresh();
	},

	_destroy: function() {
		this._callChildMethod( "destroy" );
		this.childWidgets.removeData( "ui-controlgroup-data" );
		this.element.removeAttr( "role" );
		if ( this.options.items.controlgroupLabel ) {
			this.element
				.find( this.options.items.controlgroupLabel )
				.find( ".ui-controlgroup-label-contents" )
				.contents().unwrap();
		}
	},

	_initWidgets: function() {
		var that = this,
			childWidgets = [];

		// First we iterate over each of the items options
		$.each( this.options.items, function( widget, selector ) {
			var labels;
			var options = {};

			// Make sure the widget has a selector set
			if ( !selector ) {
				return;
			}

			if ( widget === "controlgroupLabel" ) {
				labels = that.element.find( selector );
				labels.each( function() {
					var element = $( this );

					if ( element.children( ".ui-controlgroup-label-contents" ).length ) {
						return;
					}
					element.contents()
						.wrapAll( "<span class='ui-controlgroup-label-contents'></span>" );
				} );
				that._addClass( labels, null, "ui-widget ui-widget-content ui-state-default" );
				childWidgets = childWidgets.concat( labels.get() );
				return;
			}

			// Make sure the widget actually exists
			if ( !$.fn[ widget ] ) {
				return;
			}

			// We assume everything is in the middle to start because we can't determine
			// first / last elements until all enhancments are done.
			if ( that[ "_" + widget + "Options" ] ) {
				options = that[ "_" + widget + "Options" ]( "middle" );
			} else {
				options = { classes: {} };
			}

			// Find instances of this widget inside controlgroup and init them
			that.element
				.find( selector )
				.each( function() {
					var element = $( this );
					var instance = element[ widget ]( "instance" );

					// We need to clone the default options for this type of widget to avoid
					// polluting the variable options which has a wider scope than a single widget.
					var instanceOptions = $.widget.extend( {}, options );

					// If the button is the child of a spinner ignore it
					// TODO: Find a more generic solution
					if ( widget === "button" && element.parent( ".ui-spinner" ).length ) {
						return;
					}

					// Create the widget if it doesn't exist
					if ( !instance ) {
						instance = element[ widget ]()[ widget ]( "instance" );
					}
					if ( instance ) {
						instanceOptions.classes =
							that._resolveClassesValues( instanceOptions.classes, instance );
					}
					element[ widget ]( instanceOptions );

					// Store an instance of the controlgroup to be able to reference
					// from the outermost element for changing options and refresh
					var widgetElement = element[ widget ]( "widget" );
					$.data( widgetElement[ 0 ], "ui-controlgroup-data",
						instance ? instance : element[ widget ]( "instance" ) );

					childWidgets.push( widgetElement[ 0 ] );
				} );
		} );

		this.childWidgets = $( $.unique( childWidgets ) );
		this._addClass( this.childWidgets, "ui-controlgroup-item" );
	},

	_callChildMethod: function( method ) {
		this.childWidgets.each( function() {
			var element = $( this ),
				data = element.data( "ui-controlgroup-data" );
			if ( data && data[ method ] ) {
				data[ method ]();
			}
		} );
	},

	_updateCornerClass: function( element, position ) {
		var remove = "ui-corner-top ui-corner-bottom ui-corner-left ui-corner-right ui-corner-all";
		var add = this._buildSimpleOptions( position, "label" ).classes.label;

		this._removeClass( element, null, remove );
		this._addClass( element, null, add );
	},

	_buildSimpleOptions: function( position, key ) {
		var direction = this.options.direction === "vertical";
		var result = {
			classes: {}
		};
		result.classes[ key ] = {
			"middle": "",
			"first": "ui-corner-" + ( direction ? "top" : "left" ),
			"last": "ui-corner-" + ( direction ? "bottom" : "right" ),
			"only": "ui-corner-all"
		}[ position ];

		return result;
	},

	_spinnerOptions: function( position ) {
		var options = this._buildSimpleOptions( position, "ui-spinner" );

		options.classes[ "ui-spinner-up" ] = "";
		options.classes[ "ui-spinner-down" ] = "";

		return options;
	},

	_buttonOptions: function( position ) {
		return this._buildSimpleOptions( position, "ui-button" );
	},

	_checkboxradioOptions: function( position ) {
		return this._buildSimpleOptions( position, "ui-checkboxradio-label" );
	},

	_selectmenuOptions: function( position ) {
		var direction = this.options.direction === "vertical";
		return {
			width: direction ? "auto" : false,
			classes: {
				middle: {
					"ui-selectmenu-button-open": "",
					"ui-selectmenu-button-closed": ""
				},
				first: {
					"ui-selectmenu-button-open": "ui-corner-" + ( direction ? "top" : "tl" ),
					"ui-selectmenu-button-closed": "ui-corner-" + ( direction ? "top" : "left" )
				},
				last: {
					"ui-selectmenu-button-open": direction ? "" : "ui-corner-tr",
					"ui-selectmenu-button-closed": "ui-corner-" + ( direction ? "bottom" : "right" )
				},
				only: {
					"ui-selectmenu-button-open": "ui-corner-top",
					"ui-selectmenu-button-closed": "ui-corner-all"
				}

			}[ position ]
		};
	},

	_resolveClassesValues: function( classes, instance ) {
		var result = {};
		$.each( classes, function( key ) {
			var current = instance.options.classes[ key ] || "";
			current = $.trim( current.replace( controlgroupCornerRegex, "" ) );
			result[ key ] = ( current + " " + classes[ key ] ).replace( /\s+/g, " " );
		} );
		return result;
	},

	_setOption: function( key, value ) {
		if ( key === "direction" ) {
			this._removeClass( "ui-controlgroup-" + this.options.direction );
		}

		this._super( key, value );
		if ( key === "disabled" ) {
			this._callChildMethod( value ? "disable" : "enable" );
			return;
		}

		this.refresh();
	},

	refresh: function() {
		var children,
			that = this;

		this._addClass( "ui-controlgroup ui-controlgroup-" + this.options.direction );

		if ( this.options.direction === "horizontal" ) {
			this._addClass( null, "ui-helper-clearfix" );
		}
		this._initWidgets();

		children = this.childWidgets;

		// We filter here because we need to track all childWidgets not just the visible ones
		if ( this.options.onlyVisible ) {
			children = children.filter( ":visible" );
		}

		if ( children.length ) {

			// We do this last because we need to make sure all enhancment is done
			// before determining first and last
			$.each( [ "first", "last" ], function( index, value ) {
				var instance = children[ value ]().data( "ui-controlgroup-data" );

				if ( instance && that[ "_" + instance.widgetName + "Options" ] ) {
					var options = that[ "_" + instance.widgetName + "Options" ](
						children.length === 1 ? "only" : value
					);
					options.classes = that._resolveClassesValues( options.classes, instance );
					instance.element[ instance.widgetName ]( options );
				} else {
					that._updateCornerClass( children[ value ](), value );
				}
			} );

			// Finally call the refresh method on each of the child widgets.
			this._callChildMethod( "refresh" );
		}
	}
} );
} ) );

},{}],32:[function(require,module,exports){
/*!
 * jQuery UI Dialog 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Dialog
//>>group: Widgets
//>>description: Displays customizable dialog windows.
//>>docs: http://api.jqueryui.com/dialog/
//>>demos: http://jqueryui.com/dialog/
//>>css.structure: ../../themes/base/core.css
//>>css.structure: ../../themes/base/dialog.css
//>>css.theme: ../../themes/base/theme.css

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( [
			"jquery",
			"./button",
			"./draggable",
			"./mouse",
			"./resizable",
			"../focusable",
			"../keycode",
			"../position",
			"../safe-active-element",
			"../safe-blur",
			"../tabbable",
			"../unique-id",
			"../version",
			"../widget"
		], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
}( function( $ ) {

$.widget( "ui.dialog", {
	version: "1.12.1",
	options: {
		appendTo: "body",
		autoOpen: true,
		buttons: [],
		classes: {
			"ui-dialog": "ui-corner-all",
			"ui-dialog-titlebar": "ui-corner-all"
		},
		closeOnEscape: true,
		closeText: "Close",
		draggable: true,
		hide: null,
		height: "auto",
		maxHeight: null,
		maxWidth: null,
		minHeight: 150,
		minWidth: 150,
		modal: false,
		position: {
			my: "center",
			at: "center",
			of: window,
			collision: "fit",

			// Ensure the titlebar is always visible
			using: function( pos ) {
				var topOffset = $( this ).css( pos ).offset().top;
				if ( topOffset < 0 ) {
					$( this ).css( "top", pos.top - topOffset );
				}
			}
		},
		resizable: true,
		show: null,
		title: null,
		width: 300,

		// Callbacks
		beforeClose: null,
		close: null,
		drag: null,
		dragStart: null,
		dragStop: null,
		focus: null,
		open: null,
		resize: null,
		resizeStart: null,
		resizeStop: null
	},

	sizeRelatedOptions: {
		buttons: true,
		height: true,
		maxHeight: true,
		maxWidth: true,
		minHeight: true,
		minWidth: true,
		width: true
	},

	resizableRelatedOptions: {
		maxHeight: true,
		maxWidth: true,
		minHeight: true,
		minWidth: true
	},

	_create: function() {
		this.originalCss = {
			display: this.element[ 0 ].style.display,
			width: this.element[ 0 ].style.width,
			minHeight: this.element[ 0 ].style.minHeight,
			maxHeight: this.element[ 0 ].style.maxHeight,
			height: this.element[ 0 ].style.height
		};
		this.originalPosition = {
			parent: this.element.parent(),
			index: this.element.parent().children().index( this.element )
		};
		this.originalTitle = this.element.attr( "title" );
		if ( this.options.title == null && this.originalTitle != null ) {
			this.options.title = this.originalTitle;
		}

		// Dialogs can't be disabled
		if ( this.options.disabled ) {
			this.options.disabled = false;
		}

		this._createWrapper();

		this.element
			.show()
			.removeAttr( "title" )
			.appendTo( this.uiDialog );

		this._addClass( "ui-dialog-content", "ui-widget-content" );

		this._createTitlebar();
		this._createButtonPane();

		if ( this.options.draggable && $.fn.draggable ) {
			this._makeDraggable();
		}
		if ( this.options.resizable && $.fn.resizable ) {
			this._makeResizable();
		}

		this._isOpen = false;

		this._trackFocus();
	},

	_init: function() {
		if ( this.options.autoOpen ) {
			this.open();
		}
	},

	_appendTo: function() {
		var element = this.options.appendTo;
		if ( element && ( element.jquery || element.nodeType ) ) {
			return $( element );
		}
		return this.document.find( element || "body" ).eq( 0 );
	},

	_destroy: function() {
		var next,
			originalPosition = this.originalPosition;

		this._untrackInstance();
		this._destroyOverlay();

		this.element
			.removeUniqueId()
			.css( this.originalCss )

			// Without detaching first, the following becomes really slow
			.detach();

		this.uiDialog.remove();

		if ( this.originalTitle ) {
			this.element.attr( "title", this.originalTitle );
		}

		next = originalPosition.parent.children().eq( originalPosition.index );

		// Don't try to place the dialog next to itself (#8613)
		if ( next.length && next[ 0 ] !== this.element[ 0 ] ) {
			next.before( this.element );
		} else {
			originalPosition.parent.append( this.element );
		}
	},

	widget: function() {
		return this.uiDialog;
	},

	disable: $.noop,
	enable: $.noop,

	close: function( event ) {
		var that = this;

		if ( !this._isOpen || this._trigger( "beforeClose", event ) === false ) {
			return;
		}

		this._isOpen = false;
		this._focusedElement = null;
		this._destroyOverlay();
		this._untrackInstance();

		if ( !this.opener.filter( ":focusable" ).trigger( "focus" ).length ) {

			// Hiding a focused element doesn't trigger blur in WebKit
			// so in case we have nothing to focus on, explicitly blur the active element
			// https://bugs.webkit.org/show_bug.cgi?id=47182
			$.ui.safeBlur( $.ui.safeActiveElement( this.document[ 0 ] ) );
		}

		this._hide( this.uiDialog, this.options.hide, function() {
			that._trigger( "close", event );
		} );
	},

	isOpen: function() {
		return this._isOpen;
	},

	moveToTop: function() {
		this._moveToTop();
	},

	_moveToTop: function( event, silent ) {
		var moved = false,
			zIndices = this.uiDialog.siblings( ".ui-front:visible" ).map( function() {
				return +$( this ).css( "z-index" );
			} ).get(),
			zIndexMax = Math.max.apply( null, zIndices );

		if ( zIndexMax >= +this.uiDialog.css( "z-index" ) ) {
			this.uiDialog.css( "z-index", zIndexMax + 1 );
			moved = true;
		}

		if ( moved && !silent ) {
			this._trigger( "focus", event );
		}
		return moved;
	},

	open: function() {
		var that = this;
		if ( this._isOpen ) {
			if ( this._moveToTop() ) {
				this._focusTabbable();
			}
			return;
		}

		this._isOpen = true;
		this.opener = $( $.ui.safeActiveElement( this.document[ 0 ] ) );

		this._size();
		this._position();
		this._createOverlay();
		this._moveToTop( null, true );

		// Ensure the overlay is moved to the top with the dialog, but only when
		// opening. The overlay shouldn't move after the dialog is open so that
		// modeless dialogs opened after the modal dialog stack properly.
		if ( this.overlay ) {
			this.overlay.css( "z-index", this.uiDialog.css( "z-index" ) - 1 );
		}

		this._show( this.uiDialog, this.options.show, function() {
			that._focusTabbable();
			that._trigger( "focus" );
		} );

		// Track the dialog immediately upon openening in case a focus event
		// somehow occurs outside of the dialog before an element inside the
		// dialog is focused (#10152)
		this._makeFocusTarget();

		this._trigger( "open" );
	},

	_focusTabbable: function() {

		// Set focus to the first match:
		// 1. An element that was focused previously
		// 2. First element inside the dialog matching [autofocus]
		// 3. Tabbable element inside the content element
		// 4. Tabbable element inside the buttonpane
		// 5. The close button
		// 6. The dialog itself
		var hasFocus = this._focusedElement;
		if ( !hasFocus ) {
			hasFocus = this.element.find( "[autofocus]" );
		}
		if ( !hasFocus.length ) {
			hasFocus = this.element.find( ":tabbable" );
		}
		if ( !hasFocus.length ) {
			hasFocus = this.uiDialogButtonPane.find( ":tabbable" );
		}
		if ( !hasFocus.length ) {
			hasFocus = this.uiDialogTitlebarClose.filter( ":tabbable" );
		}
		if ( !hasFocus.length ) {
			hasFocus = this.uiDialog;
		}
		hasFocus.eq( 0 ).trigger( "focus" );
	},

	_keepFocus: function( event ) {
		function checkFocus() {
			var activeElement = $.ui.safeActiveElement( this.document[ 0 ] ),
				isActive = this.uiDialog[ 0 ] === activeElement ||
					$.contains( this.uiDialog[ 0 ], activeElement );
			if ( !isActive ) {
				this._focusTabbable();
			}
		}
		event.preventDefault();
		checkFocus.call( this );

		// support: IE
		// IE <= 8 doesn't prevent moving focus even with event.preventDefault()
		// so we check again later
		this._delay( checkFocus );
	},

	_createWrapper: function() {
		this.uiDialog = $( "<div>" )
			.hide()
			.attr( {

				// Setting tabIndex makes the div focusable
				tabIndex: -1,
				role: "dialog"
			} )
			.appendTo( this._appendTo() );

		this._addClass( this.uiDialog, "ui-dialog", "ui-widget ui-widget-content ui-front" );
		this._on( this.uiDialog, {
			keydown: function( event ) {
				if ( this.options.closeOnEscape && !event.isDefaultPrevented() && event.keyCode &&
						event.keyCode === $.ui.keyCode.ESCAPE ) {
					event.preventDefault();
					this.close( event );
					return;
				}

				// Prevent tabbing out of dialogs
				if ( event.keyCode !== $.ui.keyCode.TAB || event.isDefaultPrevented() ) {
					return;
				}
				var tabbables = this.uiDialog.find( ":tabbable" ),
					first = tabbables.filter( ":first" ),
					last = tabbables.filter( ":last" );

				if ( ( event.target === last[ 0 ] || event.target === this.uiDialog[ 0 ] ) &&
						!event.shiftKey ) {
					this._delay( function() {
						first.trigger( "focus" );
					} );
					event.preventDefault();
				} else if ( ( event.target === first[ 0 ] ||
						event.target === this.uiDialog[ 0 ] ) && event.shiftKey ) {
					this._delay( function() {
						last.trigger( "focus" );
					} );
					event.preventDefault();
				}
			},
			mousedown: function( event ) {
				if ( this._moveToTop( event ) ) {
					this._focusTabbable();
				}
			}
		} );

		// We assume that any existing aria-describedby attribute means
		// that the dialog content is marked up properly
		// otherwise we brute force the content as the description
		if ( !this.element.find( "[aria-describedby]" ).length ) {
			this.uiDialog.attr( {
				"aria-describedby": this.element.uniqueId().attr( "id" )
			} );
		}
	},

	_createTitlebar: function() {
		var uiDialogTitle;

		this.uiDialogTitlebar = $( "<div>" );
		this._addClass( this.uiDialogTitlebar,
			"ui-dialog-titlebar", "ui-widget-header ui-helper-clearfix" );
		this._on( this.uiDialogTitlebar, {
			mousedown: function( event ) {

				// Don't prevent click on close button (#8838)
				// Focusing a dialog that is partially scrolled out of view
				// causes the browser to scroll it into view, preventing the click event
				if ( !$( event.target ).closest( ".ui-dialog-titlebar-close" ) ) {

					// Dialog isn't getting focus when dragging (#8063)
					this.uiDialog.trigger( "focus" );
				}
			}
		} );

		// Support: IE
		// Use type="button" to prevent enter keypresses in textboxes from closing the
		// dialog in IE (#9312)
		this.uiDialogTitlebarClose = $( "<button type='button'></button>" )
			.button( {
				label: $( "<a>" ).text( this.options.closeText ).html(),
				icon: "ui-icon-closethick",
				showLabel: false
			} )
			.appendTo( this.uiDialogTitlebar );

		this._addClass( this.uiDialogTitlebarClose, "ui-dialog-titlebar-close" );
		this._on( this.uiDialogTitlebarClose, {
			click: function( event ) {
				event.preventDefault();
				this.close( event );
			}
		} );

		uiDialogTitle = $( "<span>" ).uniqueId().prependTo( this.uiDialogTitlebar );
		this._addClass( uiDialogTitle, "ui-dialog-title" );
		this._title( uiDialogTitle );

		this.uiDialogTitlebar.prependTo( this.uiDialog );

		this.uiDialog.attr( {
			"aria-labelledby": uiDialogTitle.attr( "id" )
		} );
	},

	_title: function( title ) {
		if ( this.options.title ) {
			title.text( this.options.title );
		} else {
			title.html( "&#160;" );
		}
	},

	_createButtonPane: function() {
		this.uiDialogButtonPane = $( "<div>" );
		this._addClass( this.uiDialogButtonPane, "ui-dialog-buttonpane",
			"ui-widget-content ui-helper-clearfix" );

		this.uiButtonSet = $( "<div>" )
			.appendTo( this.uiDialogButtonPane );
		this._addClass( this.uiButtonSet, "ui-dialog-buttonset" );

		this._createButtons();
	},

	_createButtons: function() {
		var that = this,
			buttons = this.options.buttons;

		// If we already have a button pane, remove it
		this.uiDialogButtonPane.remove();
		this.uiButtonSet.empty();

		if ( $.isEmptyObject( buttons ) || ( $.isArray( buttons ) && !buttons.length ) ) {
			this._removeClass( this.uiDialog, "ui-dialog-buttons" );
			return;
		}

		$.each( buttons, function( name, props ) {
			var click, buttonOptions;
			props = $.isFunction( props ) ?
				{ click: props, text: name } :
				props;

			// Default to a non-submitting button
			props = $.extend( { type: "button" }, props );

			// Change the context for the click callback to be the main element
			click = props.click;
			buttonOptions = {
				icon: props.icon,
				iconPosition: props.iconPosition,
				showLabel: props.showLabel,

				// Deprecated options
				icons: props.icons,
				text: props.text
			};

			delete props.click;
			delete props.icon;
			delete props.iconPosition;
			delete props.showLabel;

			// Deprecated options
			delete props.icons;
			if ( typeof props.text === "boolean" ) {
				delete props.text;
			}

			$( "<button></button>", props )
				.button( buttonOptions )
				.appendTo( that.uiButtonSet )
				.on( "click", function() {
					click.apply( that.element[ 0 ], arguments );
				} );
		} );
		this._addClass( this.uiDialog, "ui-dialog-buttons" );
		this.uiDialogButtonPane.appendTo( this.uiDialog );
	},

	_makeDraggable: function() {
		var that = this,
			options = this.options;

		function filteredUi( ui ) {
			return {
				position: ui.position,
				offset: ui.offset
			};
		}

		this.uiDialog.draggable( {
			cancel: ".ui-dialog-content, .ui-dialog-titlebar-close",
			handle: ".ui-dialog-titlebar",
			containment: "document",
			start: function( event, ui ) {
				that._addClass( $( this ), "ui-dialog-dragging" );
				that._blockFrames();
				that._trigger( "dragStart", event, filteredUi( ui ) );
			},
			drag: function( event, ui ) {
				that._trigger( "drag", event, filteredUi( ui ) );
			},
			stop: function( event, ui ) {
				var left = ui.offset.left - that.document.scrollLeft(),
					top = ui.offset.top - that.document.scrollTop();

				options.position = {
					my: "left top",
					at: "left" + ( left >= 0 ? "+" : "" ) + left + " " +
						"top" + ( top >= 0 ? "+" : "" ) + top,
					of: that.window
				};
				that._removeClass( $( this ), "ui-dialog-dragging" );
				that._unblockFrames();
				that._trigger( "dragStop", event, filteredUi( ui ) );
			}
		} );
	},

	_makeResizable: function() {
		var that = this,
			options = this.options,
			handles = options.resizable,

			// .ui-resizable has position: relative defined in the stylesheet
			// but dialogs have to use absolute or fixed positioning
			position = this.uiDialog.css( "position" ),
			resizeHandles = typeof handles === "string" ?
				handles :
				"n,e,s,w,se,sw,ne,nw";

		function filteredUi( ui ) {
			return {
				originalPosition: ui.originalPosition,
				originalSize: ui.originalSize,
				position: ui.position,
				size: ui.size
			};
		}

		this.uiDialog.resizable( {
			cancel: ".ui-dialog-content",
			containment: "document",
			alsoResize: this.element,
			maxWidth: options.maxWidth,
			maxHeight: options.maxHeight,
			minWidth: options.minWidth,
			minHeight: this._minHeight(),
			handles: resizeHandles,
			start: function( event, ui ) {
				that._addClass( $( this ), "ui-dialog-resizing" );
				that._blockFrames();
				that._trigger( "resizeStart", event, filteredUi( ui ) );
			},
			resize: function( event, ui ) {
				that._trigger( "resize", event, filteredUi( ui ) );
			},
			stop: function( event, ui ) {
				var offset = that.uiDialog.offset(),
					left = offset.left - that.document.scrollLeft(),
					top = offset.top - that.document.scrollTop();

				options.height = that.uiDialog.height();
				options.width = that.uiDialog.width();
				options.position = {
					my: "left top",
					at: "left" + ( left >= 0 ? "+" : "" ) + left + " " +
						"top" + ( top >= 0 ? "+" : "" ) + top,
					of: that.window
				};
				that._removeClass( $( this ), "ui-dialog-resizing" );
				that._unblockFrames();
				that._trigger( "resizeStop", event, filteredUi( ui ) );
			}
		} )
			.css( "position", position );
	},

	_trackFocus: function() {
		this._on( this.widget(), {
			focusin: function( event ) {
				this._makeFocusTarget();
				this._focusedElement = $( event.target );
			}
		} );
	},

	_makeFocusTarget: function() {
		this._untrackInstance();
		this._trackingInstances().unshift( this );
	},

	_untrackInstance: function() {
		var instances = this._trackingInstances(),
			exists = $.inArray( this, instances );
		if ( exists !== -1 ) {
			instances.splice( exists, 1 );
		}
	},

	_trackingInstances: function() {
		var instances = this.document.data( "ui-dialog-instances" );
		if ( !instances ) {
			instances = [];
			this.document.data( "ui-dialog-instances", instances );
		}
		return instances;
	},

	_minHeight: function() {
		var options = this.options;

		return options.height === "auto" ?
			options.minHeight :
			Math.min( options.minHeight, options.height );
	},

	_position: function() {

		// Need to show the dialog to get the actual offset in the position plugin
		var isVisible = this.uiDialog.is( ":visible" );
		if ( !isVisible ) {
			this.uiDialog.show();
		}
		this.uiDialog.position( this.options.position );
		if ( !isVisible ) {
			this.uiDialog.hide();
		}
	},

	_setOptions: function( options ) {
		var that = this,
			resize = false,
			resizableOptions = {};

		$.each( options, function( key, value ) {
			that._setOption( key, value );

			if ( key in that.sizeRelatedOptions ) {
				resize = true;
			}
			if ( key in that.resizableRelatedOptions ) {
				resizableOptions[ key ] = value;
			}
		} );

		if ( resize ) {
			this._size();
			this._position();
		}
		if ( this.uiDialog.is( ":data(ui-resizable)" ) ) {
			this.uiDialog.resizable( "option", resizableOptions );
		}
	},

	_setOption: function( key, value ) {
		var isDraggable, isResizable,
			uiDialog = this.uiDialog;

		if ( key === "disabled" ) {
			return;
		}

		this._super( key, value );

		if ( key === "appendTo" ) {
			this.uiDialog.appendTo( this._appendTo() );
		}

		if ( key === "buttons" ) {
			this._createButtons();
		}

		if ( key === "closeText" ) {
			this.uiDialogTitlebarClose.button( {

				// Ensure that we always pass a string
				label: $( "<a>" ).text( "" + this.options.closeText ).html()
			} );
		}

		if ( key === "draggable" ) {
			isDraggable = uiDialog.is( ":data(ui-draggable)" );
			if ( isDraggable && !value ) {
				uiDialog.draggable( "destroy" );
			}

			if ( !isDraggable && value ) {
				this._makeDraggable();
			}
		}

		if ( key === "position" ) {
			this._position();
		}

		if ( key === "resizable" ) {

			// currently resizable, becoming non-resizable
			isResizable = uiDialog.is( ":data(ui-resizable)" );
			if ( isResizable && !value ) {
				uiDialog.resizable( "destroy" );
			}

			// Currently resizable, changing handles
			if ( isResizable && typeof value === "string" ) {
				uiDialog.resizable( "option", "handles", value );
			}

			// Currently non-resizable, becoming resizable
			if ( !isResizable && value !== false ) {
				this._makeResizable();
			}
		}

		if ( key === "title" ) {
			this._title( this.uiDialogTitlebar.find( ".ui-dialog-title" ) );
		}
	},

	_size: function() {

		// If the user has resized the dialog, the .ui-dialog and .ui-dialog-content
		// divs will both have width and height set, so we need to reset them
		var nonContentHeight, minContentHeight, maxContentHeight,
			options = this.options;

		// Reset content sizing
		this.element.show().css( {
			width: "auto",
			minHeight: 0,
			maxHeight: "none",
			height: 0
		} );

		if ( options.minWidth > options.width ) {
			options.width = options.minWidth;
		}

		// Reset wrapper sizing
		// determine the height of all the non-content elements
		nonContentHeight = this.uiDialog.css( {
			height: "auto",
			width: options.width
		} )
			.outerHeight();
		minContentHeight = Math.max( 0, options.minHeight - nonContentHeight );
		maxContentHeight = typeof options.maxHeight === "number" ?
			Math.max( 0, options.maxHeight - nonContentHeight ) :
			"none";

		if ( options.height === "auto" ) {
			this.element.css( {
				minHeight: minContentHeight,
				maxHeight: maxContentHeight,
				height: "auto"
			} );
		} else {
			this.element.height( Math.max( 0, options.height - nonContentHeight ) );
		}

		if ( this.uiDialog.is( ":data(ui-resizable)" ) ) {
			this.uiDialog.resizable( "option", "minHeight", this._minHeight() );
		}
	},

	_blockFrames: function() {
		this.iframeBlocks = this.document.find( "iframe" ).map( function() {
			var iframe = $( this );

			return $( "<div>" )
				.css( {
					position: "absolute",
					width: iframe.outerWidth(),
					height: iframe.outerHeight()
				} )
				.appendTo( iframe.parent() )
				.offset( iframe.offset() )[ 0 ];
		} );
	},

	_unblockFrames: function() {
		if ( this.iframeBlocks ) {
			this.iframeBlocks.remove();
			delete this.iframeBlocks;
		}
	},

	_allowInteraction: function( event ) {
		if ( $( event.target ).closest( ".ui-dialog" ).length ) {
			return true;
		}

		// TODO: Remove hack when datepicker implements
		// the .ui-front logic (#8989)
		return !!$( event.target ).closest( ".ui-datepicker" ).length;
	},

	_createOverlay: function() {
		if ( !this.options.modal ) {
			return;
		}

		// We use a delay in case the overlay is created from an
		// event that we're going to be cancelling (#2804)
		var isOpening = true;
		this._delay( function() {
			isOpening = false;
		} );

		if ( !this.document.data( "ui-dialog-overlays" ) ) {

			// Prevent use of anchors and inputs
			// Using _on() for an event handler shared across many instances is
			// safe because the dialogs stack and must be closed in reverse order
			this._on( this.document, {
				focusin: function( event ) {
					if ( isOpening ) {
						return;
					}

					if ( !this._allowInteraction( event ) ) {
						event.preventDefault();
						this._trackingInstances()[ 0 ]._focusTabbable();
					}
				}
			} );
		}

		this.overlay = $( "<div>" )
			.appendTo( this._appendTo() );

		this._addClass( this.overlay, null, "ui-widget-overlay ui-front" );
		this._on( this.overlay, {
			mousedown: "_keepFocus"
		} );
		this.document.data( "ui-dialog-overlays",
			( this.document.data( "ui-dialog-overlays" ) || 0 ) + 1 );
	},

	_destroyOverlay: function() {
		if ( !this.options.modal ) {
			return;
		}

		if ( this.overlay ) {
			var overlays = this.document.data( "ui-dialog-overlays" ) - 1;

			if ( !overlays ) {
				this._off( this.document, "focusin" );
				this.document.removeData( "ui-dialog-overlays" );
			} else {
				this.document.data( "ui-dialog-overlays", overlays );
			}

			this.overlay.remove();
			this.overlay = null;
		}
	}
} );

// DEPRECATED
// TODO: switch return back to widget declaration at top of file when this is removed
if ( $.uiBackCompat !== false ) {

	// Backcompat for dialogClass option
	$.widget( "ui.dialog", $.ui.dialog, {
		options: {
			dialogClass: ""
		},
		_createWrapper: function() {
			this._super();
			this.uiDialog.addClass( this.options.dialogClass );
		},
		_setOption: function( key, value ) {
			if ( key === "dialogClass" ) {
				this.uiDialog
					.removeClass( this.options.dialogClass )
					.addClass( value );
			}
			this._superApply( arguments );
		}
	} );
}

return $.ui.dialog;

} ) );

},{}],33:[function(require,module,exports){
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

},{}],34:[function(require,module,exports){
/*!
 * jQuery UI Menu 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Menu
//>>group: Widgets
//>>description: Creates nestable menus.
//>>docs: http://api.jqueryui.com/menu/
//>>demos: http://jqueryui.com/menu/
//>>css.structure: ../../themes/base/core.css
//>>css.structure: ../../themes/base/menu.css
//>>css.theme: ../../themes/base/theme.css

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( [
			"jquery",
			"../keycode",
			"../position",
			"../safe-active-element",
			"../unique-id",
			"../version",
			"../widget"
		], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
}( function( $ ) {

return $.widget( "ui.menu", {
	version: "1.12.1",
	defaultElement: "<ul>",
	delay: 300,
	options: {
		icons: {
			submenu: "ui-icon-caret-1-e"
		},
		items: "> *",
		menus: "ul",
		position: {
			my: "left top",
			at: "right top"
		},
		role: "menu",

		// Callbacks
		blur: null,
		focus: null,
		select: null
	},

	_create: function() {
		this.activeMenu = this.element;

		// Flag used to prevent firing of the click handler
		// as the event bubbles up through nested menus
		this.mouseHandled = false;
		this.element
			.uniqueId()
			.attr( {
				role: this.options.role,
				tabIndex: 0
			} );

		this._addClass( "ui-menu", "ui-widget ui-widget-content" );
		this._on( {

			// Prevent focus from sticking to links inside menu after clicking
			// them (focus should always stay on UL during navigation).
			"mousedown .ui-menu-item": function( event ) {
				event.preventDefault();
			},
			"click .ui-menu-item": function( event ) {
				var target = $( event.target );
				var active = $( $.ui.safeActiveElement( this.document[ 0 ] ) );
				if ( !this.mouseHandled && target.not( ".ui-state-disabled" ).length ) {
					this.select( event );

					// Only set the mouseHandled flag if the event will bubble, see #9469.
					if ( !event.isPropagationStopped() ) {
						this.mouseHandled = true;
					}

					// Open submenu on click
					if ( target.has( ".ui-menu" ).length ) {
						this.expand( event );
					} else if ( !this.element.is( ":focus" ) &&
							active.closest( ".ui-menu" ).length ) {

						// Redirect focus to the menu
						this.element.trigger( "focus", [ true ] );

						// If the active item is on the top level, let it stay active.
						// Otherwise, blur the active item since it is no longer visible.
						if ( this.active && this.active.parents( ".ui-menu" ).length === 1 ) {
							clearTimeout( this.timer );
						}
					}
				}
			},
			"mouseenter .ui-menu-item": function( event ) {

				// Ignore mouse events while typeahead is active, see #10458.
				// Prevents focusing the wrong item when typeahead causes a scroll while the mouse
				// is over an item in the menu
				if ( this.previousFilter ) {
					return;
				}

				var actualTarget = $( event.target ).closest( ".ui-menu-item" ),
					target = $( event.currentTarget );

				// Ignore bubbled events on parent items, see #11641
				if ( actualTarget[ 0 ] !== target[ 0 ] ) {
					return;
				}

				// Remove ui-state-active class from siblings of the newly focused menu item
				// to avoid a jump caused by adjacent elements both having a class with a border
				this._removeClass( target.siblings().children( ".ui-state-active" ),
					null, "ui-state-active" );
				this.focus( event, target );
			},
			mouseleave: "collapseAll",
			"mouseleave .ui-menu": "collapseAll",
			focus: function( event, keepActiveItem ) {

				// If there's already an active item, keep it active
				// If not, activate the first item
				var item = this.active || this.element.find( this.options.items ).eq( 0 );

				if ( !keepActiveItem ) {
					this.focus( event, item );
				}
			},
			blur: function( event ) {
				this._delay( function() {
					var notContained = !$.contains(
						this.element[ 0 ],
						$.ui.safeActiveElement( this.document[ 0 ] )
					);
					if ( notContained ) {
						this.collapseAll( event );
					}
				} );
			},
			keydown: "_keydown"
		} );

		this.refresh();

		// Clicks outside of a menu collapse any open menus
		this._on( this.document, {
			click: function( event ) {
				if ( this._closeOnDocumentClick( event ) ) {
					this.collapseAll( event );
				}

				// Reset the mouseHandled flag
				this.mouseHandled = false;
			}
		} );
	},

	_destroy: function() {
		var items = this.element.find( ".ui-menu-item" )
				.removeAttr( "role aria-disabled" ),
			submenus = items.children( ".ui-menu-item-wrapper" )
				.removeUniqueId()
				.removeAttr( "tabIndex role aria-haspopup" );

		// Destroy (sub)menus
		this.element
			.removeAttr( "aria-activedescendant" )
			.find( ".ui-menu" ).addBack()
				.removeAttr( "role aria-labelledby aria-expanded aria-hidden aria-disabled " +
					"tabIndex" )
				.removeUniqueId()
				.show();

		submenus.children().each( function() {
			var elem = $( this );
			if ( elem.data( "ui-menu-submenu-caret" ) ) {
				elem.remove();
			}
		} );
	},

	_keydown: function( event ) {
		var match, prev, character, skip,
			preventDefault = true;

		switch ( event.keyCode ) {
		case $.ui.keyCode.PAGE_UP:
			this.previousPage( event );
			break;
		case $.ui.keyCode.PAGE_DOWN:
			this.nextPage( event );
			break;
		case $.ui.keyCode.HOME:
			this._move( "first", "first", event );
			break;
		case $.ui.keyCode.END:
			this._move( "last", "last", event );
			break;
		case $.ui.keyCode.UP:
			this.previous( event );
			break;
		case $.ui.keyCode.DOWN:
			this.next( event );
			break;
		case $.ui.keyCode.LEFT:
			this.collapse( event );
			break;
		case $.ui.keyCode.RIGHT:
			if ( this.active && !this.active.is( ".ui-state-disabled" ) ) {
				this.expand( event );
			}
			break;
		case $.ui.keyCode.ENTER:
		case $.ui.keyCode.SPACE:
			this._activate( event );
			break;
		case $.ui.keyCode.ESCAPE:
			this.collapse( event );
			break;
		default:
			preventDefault = false;
			prev = this.previousFilter || "";
			skip = false;

			// Support number pad values
			character = event.keyCode >= 96 && event.keyCode <= 105 ?
				( event.keyCode - 96 ).toString() : String.fromCharCode( event.keyCode );

			clearTimeout( this.filterTimer );

			if ( character === prev ) {
				skip = true;
			} else {
				character = prev + character;
			}

			match = this._filterMenuItems( character );
			match = skip && match.index( this.active.next() ) !== -1 ?
				this.active.nextAll( ".ui-menu-item" ) :
				match;

			// If no matches on the current filter, reset to the last character pressed
			// to move down the menu to the first item that starts with that character
			if ( !match.length ) {
				character = String.fromCharCode( event.keyCode );
				match = this._filterMenuItems( character );
			}

			if ( match.length ) {
				this.focus( event, match );
				this.previousFilter = character;
				this.filterTimer = this._delay( function() {
					delete this.previousFilter;
				}, 1000 );
			} else {
				delete this.previousFilter;
			}
		}

		if ( preventDefault ) {
			event.preventDefault();
		}
	},

	_activate: function( event ) {
		if ( this.active && !this.active.is( ".ui-state-disabled" ) ) {
			if ( this.active.children( "[aria-haspopup='true']" ).length ) {
				this.expand( event );
			} else {
				this.select( event );
			}
		}
	},

	refresh: function() {
		var menus, items, newSubmenus, newItems, newWrappers,
			that = this,
			icon = this.options.icons.submenu,
			submenus = this.element.find( this.options.menus );

		this._toggleClass( "ui-menu-icons", null, !!this.element.find( ".ui-icon" ).length );

		// Initialize nested menus
		newSubmenus = submenus.filter( ":not(.ui-menu)" )
			.hide()
			.attr( {
				role: this.options.role,
				"aria-hidden": "true",
				"aria-expanded": "false"
			} )
			.each( function() {
				var menu = $( this ),
					item = menu.prev(),
					submenuCaret = $( "<span>" ).data( "ui-menu-submenu-caret", true );

				that._addClass( submenuCaret, "ui-menu-icon", "ui-icon " + icon );
				item
					.attr( "aria-haspopup", "true" )
					.prepend( submenuCaret );
				menu.attr( "aria-labelledby", item.attr( "id" ) );
			} );

		this._addClass( newSubmenus, "ui-menu", "ui-widget ui-widget-content ui-front" );

		menus = submenus.add( this.element );
		items = menus.find( this.options.items );

		// Initialize menu-items containing spaces and/or dashes only as dividers
		items.not( ".ui-menu-item" ).each( function() {
			var item = $( this );
			if ( that._isDivider( item ) ) {
				that._addClass( item, "ui-menu-divider", "ui-widget-content" );
			}
		} );

		// Don't refresh list items that are already adapted
		newItems = items.not( ".ui-menu-item, .ui-menu-divider" );
		newWrappers = newItems.children()
			.not( ".ui-menu" )
				.uniqueId()
				.attr( {
					tabIndex: -1,
					role: this._itemRole()
				} );
		this._addClass( newItems, "ui-menu-item" )
			._addClass( newWrappers, "ui-menu-item-wrapper" );

		// Add aria-disabled attribute to any disabled menu item
		items.filter( ".ui-state-disabled" ).attr( "aria-disabled", "true" );

		// If the active item has been removed, blur the menu
		if ( this.active && !$.contains( this.element[ 0 ], this.active[ 0 ] ) ) {
			this.blur();
		}
	},

	_itemRole: function() {
		return {
			menu: "menuitem",
			listbox: "option"
		}[ this.options.role ];
	},

	_setOption: function( key, value ) {
		if ( key === "icons" ) {
			var icons = this.element.find( ".ui-menu-icon" );
			this._removeClass( icons, null, this.options.icons.submenu )
				._addClass( icons, null, value.submenu );
		}
		this._super( key, value );
	},

	_setOptionDisabled: function( value ) {
		this._super( value );

		this.element.attr( "aria-disabled", String( value ) );
		this._toggleClass( null, "ui-state-disabled", !!value );
	},

	focus: function( event, item ) {
		var nested, focused, activeParent;
		this.blur( event, event && event.type === "focus" );

		this._scrollIntoView( item );

		this.active = item.first();

		focused = this.active.children( ".ui-menu-item-wrapper" );
		this._addClass( focused, null, "ui-state-active" );

		// Only update aria-activedescendant if there's a role
		// otherwise we assume focus is managed elsewhere
		if ( this.options.role ) {
			this.element.attr( "aria-activedescendant", focused.attr( "id" ) );
		}

		// Highlight active parent menu item, if any
		activeParent = this.active
			.parent()
				.closest( ".ui-menu-item" )
					.children( ".ui-menu-item-wrapper" );
		this._addClass( activeParent, null, "ui-state-active" );

		if ( event && event.type === "keydown" ) {
			this._close();
		} else {
			this.timer = this._delay( function() {
				this._close();
			}, this.delay );
		}

		nested = item.children( ".ui-menu" );
		if ( nested.length && event && ( /^mouse/.test( event.type ) ) ) {
			this._startOpening( nested );
		}
		this.activeMenu = item.parent();

		this._trigger( "focus", event, { item: item } );
	},

	_scrollIntoView: function( item ) {
		var borderTop, paddingTop, offset, scroll, elementHeight, itemHeight;
		if ( this._hasScroll() ) {
			borderTop = parseFloat( $.css( this.activeMenu[ 0 ], "borderTopWidth" ) ) || 0;
			paddingTop = parseFloat( $.css( this.activeMenu[ 0 ], "paddingTop" ) ) || 0;
			offset = item.offset().top - this.activeMenu.offset().top - borderTop - paddingTop;
			scroll = this.activeMenu.scrollTop();
			elementHeight = this.activeMenu.height();
			itemHeight = item.outerHeight();

			if ( offset < 0 ) {
				this.activeMenu.scrollTop( scroll + offset );
			} else if ( offset + itemHeight > elementHeight ) {
				this.activeMenu.scrollTop( scroll + offset - elementHeight + itemHeight );
			}
		}
	},

	blur: function( event, fromFocus ) {
		if ( !fromFocus ) {
			clearTimeout( this.timer );
		}

		if ( !this.active ) {
			return;
		}

		this._removeClass( this.active.children( ".ui-menu-item-wrapper" ),
			null, "ui-state-active" );

		this._trigger( "blur", event, { item: this.active } );
		this.active = null;
	},

	_startOpening: function( submenu ) {
		clearTimeout( this.timer );

		// Don't open if already open fixes a Firefox bug that caused a .5 pixel
		// shift in the submenu position when mousing over the caret icon
		if ( submenu.attr( "aria-hidden" ) !== "true" ) {
			return;
		}

		this.timer = this._delay( function() {
			this._close();
			this._open( submenu );
		}, this.delay );
	},

	_open: function( submenu ) {
		var position = $.extend( {
			of: this.active
		}, this.options.position );

		clearTimeout( this.timer );
		this.element.find( ".ui-menu" ).not( submenu.parents( ".ui-menu" ) )
			.hide()
			.attr( "aria-hidden", "true" );

		submenu
			.show()
			.removeAttr( "aria-hidden" )
			.attr( "aria-expanded", "true" )
			.position( position );
	},

	collapseAll: function( event, all ) {
		clearTimeout( this.timer );
		this.timer = this._delay( function() {

			// If we were passed an event, look for the submenu that contains the event
			var currentMenu = all ? this.element :
				$( event && event.target ).closest( this.element.find( ".ui-menu" ) );

			// If we found no valid submenu ancestor, use the main menu to close all
			// sub menus anyway
			if ( !currentMenu.length ) {
				currentMenu = this.element;
			}

			this._close( currentMenu );

			this.blur( event );

			// Work around active item staying active after menu is blurred
			this._removeClass( currentMenu.find( ".ui-state-active" ), null, "ui-state-active" );

			this.activeMenu = currentMenu;
		}, this.delay );
	},

	// With no arguments, closes the currently active menu - if nothing is active
	// it closes all menus.  If passed an argument, it will search for menus BELOW
	_close: function( startMenu ) {
		if ( !startMenu ) {
			startMenu = this.active ? this.active.parent() : this.element;
		}

		startMenu.find( ".ui-menu" )
			.hide()
			.attr( "aria-hidden", "true" )
			.attr( "aria-expanded", "false" );
	},

	_closeOnDocumentClick: function( event ) {
		return !$( event.target ).closest( ".ui-menu" ).length;
	},

	_isDivider: function( item ) {

		// Match hyphen, em dash, en dash
		return !/[^\-\u2014\u2013\s]/.test( item.text() );
	},

	collapse: function( event ) {
		var newItem = this.active &&
			this.active.parent().closest( ".ui-menu-item", this.element );
		if ( newItem && newItem.length ) {
			this._close();
			this.focus( event, newItem );
		}
	},

	expand: function( event ) {
		var newItem = this.active &&
			this.active
				.children( ".ui-menu " )
					.find( this.options.items )
						.first();

		if ( newItem && newItem.length ) {
			this._open( newItem.parent() );

			// Delay so Firefox will not hide activedescendant change in expanding submenu from AT
			this._delay( function() {
				this.focus( event, newItem );
			} );
		}
	},

	next: function( event ) {
		this._move( "next", "first", event );
	},

	previous: function( event ) {
		this._move( "prev", "last", event );
	},

	isFirstItem: function() {
		return this.active && !this.active.prevAll( ".ui-menu-item" ).length;
	},

	isLastItem: function() {
		return this.active && !this.active.nextAll( ".ui-menu-item" ).length;
	},

	_move: function( direction, filter, event ) {
		var next;
		if ( this.active ) {
			if ( direction === "first" || direction === "last" ) {
				next = this.active
					[ direction === "first" ? "prevAll" : "nextAll" ]( ".ui-menu-item" )
					.eq( -1 );
			} else {
				next = this.active
					[ direction + "All" ]( ".ui-menu-item" )
					.eq( 0 );
			}
		}
		if ( !next || !next.length || !this.active ) {
			next = this.activeMenu.find( this.options.items )[ filter ]();
		}

		this.focus( event, next );
	},

	nextPage: function( event ) {
		var item, base, height;

		if ( !this.active ) {
			this.next( event );
			return;
		}
		if ( this.isLastItem() ) {
			return;
		}
		if ( this._hasScroll() ) {
			base = this.active.offset().top;
			height = this.element.height();
			this.active.nextAll( ".ui-menu-item" ).each( function() {
				item = $( this );
				return item.offset().top - base - height < 0;
			} );

			this.focus( event, item );
		} else {
			this.focus( event, this.activeMenu.find( this.options.items )
				[ !this.active ? "first" : "last" ]() );
		}
	},

	previousPage: function( event ) {
		var item, base, height;
		if ( !this.active ) {
			this.next( event );
			return;
		}
		if ( this.isFirstItem() ) {
			return;
		}
		if ( this._hasScroll() ) {
			base = this.active.offset().top;
			height = this.element.height();
			this.active.prevAll( ".ui-menu-item" ).each( function() {
				item = $( this );
				return item.offset().top - base + height > 0;
			} );

			this.focus( event, item );
		} else {
			this.focus( event, this.activeMenu.find( this.options.items ).first() );
		}
	},

	_hasScroll: function() {
		return this.element.outerHeight() < this.element.prop( "scrollHeight" );
	},

	select: function( event ) {

		// TODO: It should never be possible to not have an active item at this
		// point, but the tests don't trigger mouseenter before click.
		this.active = this.active || $( event.target ).closest( ".ui-menu-item" );
		var ui = { item: this.active };
		if ( !this.active.has( ".ui-menu" ).length ) {
			this.collapseAll( event, true );
		}
		this._trigger( "select", event, ui );
	},

	_filterMenuItems: function( character ) {
		var escapedCharacter = character.replace( /[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&" ),
			regex = new RegExp( "^" + escapedCharacter, "i" );

		return this.activeMenu
			.find( this.options.items )

				// Only match on items, not dividers or other content (#10571)
				.filter( ".ui-menu-item" )
					.filter( function() {
						return regex.test(
							$.trim( $( this ).children( ".ui-menu-item-wrapper" ).text() ) );
					} );
	}
} );

} ) );

},{}],35:[function(require,module,exports){
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

},{}],36:[function(require,module,exports){
/*!
 * jQuery UI Resizable 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Resizable
//>>group: Interactions
//>>description: Enables resize functionality for any element.
//>>docs: http://api.jqueryui.com/resizable/
//>>demos: http://jqueryui.com/resizable/
//>>css.structure: ../../themes/base/core.css
//>>css.structure: ../../themes/base/resizable.css
//>>css.theme: ../../themes/base/theme.css

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( [
			"jquery",
			"./mouse",
			"../disable-selection",
			"../plugin",
			"../version",
			"../widget"
		], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
}( function( $ ) {

$.widget( "ui.resizable", $.ui.mouse, {
	version: "1.12.1",
	widgetEventPrefix: "resize",
	options: {
		alsoResize: false,
		animate: false,
		animateDuration: "slow",
		animateEasing: "swing",
		aspectRatio: false,
		autoHide: false,
		classes: {
			"ui-resizable-se": "ui-icon ui-icon-gripsmall-diagonal-se"
		},
		containment: false,
		ghost: false,
		grid: false,
		handles: "e,s,se",
		helper: false,
		maxHeight: null,
		maxWidth: null,
		minHeight: 10,
		minWidth: 10,

		// See #7960
		zIndex: 90,

		// Callbacks
		resize: null,
		start: null,
		stop: null
	},

	_num: function( value ) {
		return parseFloat( value ) || 0;
	},

	_isNumber: function( value ) {
		return !isNaN( parseFloat( value ) );
	},

	_hasScroll: function( el, a ) {

		if ( $( el ).css( "overflow" ) === "hidden" ) {
			return false;
		}

		var scroll = ( a && a === "left" ) ? "scrollLeft" : "scrollTop",
			has = false;

		if ( el[ scroll ] > 0 ) {
			return true;
		}

		// TODO: determine which cases actually cause this to happen
		// if the element doesn't have the scroll set, see if it's possible to
		// set the scroll
		el[ scroll ] = 1;
		has = ( el[ scroll ] > 0 );
		el[ scroll ] = 0;
		return has;
	},

	_create: function() {

		var margins,
			o = this.options,
			that = this;
		this._addClass( "ui-resizable" );

		$.extend( this, {
			_aspectRatio: !!( o.aspectRatio ),
			aspectRatio: o.aspectRatio,
			originalElement: this.element,
			_proportionallyResizeElements: [],
			_helper: o.helper || o.ghost || o.animate ? o.helper || "ui-resizable-helper" : null
		} );

		// Wrap the element if it cannot hold child nodes
		if ( this.element[ 0 ].nodeName.match( /^(canvas|textarea|input|select|button|img)$/i ) ) {

			this.element.wrap(
				$( "<div class='ui-wrapper' style='overflow: hidden;'></div>" ).css( {
					position: this.element.css( "position" ),
					width: this.element.outerWidth(),
					height: this.element.outerHeight(),
					top: this.element.css( "top" ),
					left: this.element.css( "left" )
				} )
			);

			this.element = this.element.parent().data(
				"ui-resizable", this.element.resizable( "instance" )
			);

			this.elementIsWrapper = true;

			margins = {
				marginTop: this.originalElement.css( "marginTop" ),
				marginRight: this.originalElement.css( "marginRight" ),
				marginBottom: this.originalElement.css( "marginBottom" ),
				marginLeft: this.originalElement.css( "marginLeft" )
			};

			this.element.css( margins );
			this.originalElement.css( "margin", 0 );

			// support: Safari
			// Prevent Safari textarea resize
			this.originalResizeStyle = this.originalElement.css( "resize" );
			this.originalElement.css( "resize", "none" );

			this._proportionallyResizeElements.push( this.originalElement.css( {
				position: "static",
				zoom: 1,
				display: "block"
			} ) );

			// Support: IE9
			// avoid IE jump (hard set the margin)
			this.originalElement.css( margins );

			this._proportionallyResize();
		}

		this._setupHandles();

		if ( o.autoHide ) {
			$( this.element )
				.on( "mouseenter", function() {
					if ( o.disabled ) {
						return;
					}
					that._removeClass( "ui-resizable-autohide" );
					that._handles.show();
				} )
				.on( "mouseleave", function() {
					if ( o.disabled ) {
						return;
					}
					if ( !that.resizing ) {
						that._addClass( "ui-resizable-autohide" );
						that._handles.hide();
					}
				} );
		}

		this._mouseInit();
	},

	_destroy: function() {

		this._mouseDestroy();

		var wrapper,
			_destroy = function( exp ) {
				$( exp )
					.removeData( "resizable" )
					.removeData( "ui-resizable" )
					.off( ".resizable" )
					.find( ".ui-resizable-handle" )
						.remove();
			};

		// TODO: Unwrap at same DOM position
		if ( this.elementIsWrapper ) {
			_destroy( this.element );
			wrapper = this.element;
			this.originalElement.css( {
				position: wrapper.css( "position" ),
				width: wrapper.outerWidth(),
				height: wrapper.outerHeight(),
				top: wrapper.css( "top" ),
				left: wrapper.css( "left" )
			} ).insertAfter( wrapper );
			wrapper.remove();
		}

		this.originalElement.css( "resize", this.originalResizeStyle );
		_destroy( this.originalElement );

		return this;
	},

	_setOption: function( key, value ) {
		this._super( key, value );

		switch ( key ) {
		case "handles":
			this._removeHandles();
			this._setupHandles();
			break;
		default:
			break;
		}
	},

	_setupHandles: function() {
		var o = this.options, handle, i, n, hname, axis, that = this;
		this.handles = o.handles ||
			( !$( ".ui-resizable-handle", this.element ).length ?
				"e,s,se" : {
					n: ".ui-resizable-n",
					e: ".ui-resizable-e",
					s: ".ui-resizable-s",
					w: ".ui-resizable-w",
					se: ".ui-resizable-se",
					sw: ".ui-resizable-sw",
					ne: ".ui-resizable-ne",
					nw: ".ui-resizable-nw"
				} );

		this._handles = $();
		if ( this.handles.constructor === String ) {

			if ( this.handles === "all" ) {
				this.handles = "n,e,s,w,se,sw,ne,nw";
			}

			n = this.handles.split( "," );
			this.handles = {};

			for ( i = 0; i < n.length; i++ ) {

				handle = $.trim( n[ i ] );
				hname = "ui-resizable-" + handle;
				axis = $( "<div>" );
				this._addClass( axis, "ui-resizable-handle " + hname );

				axis.css( { zIndex: o.zIndex } );

				this.handles[ handle ] = ".ui-resizable-" + handle;
				this.element.append( axis );
			}

		}

		this._renderAxis = function( target ) {

			var i, axis, padPos, padWrapper;

			target = target || this.element;

			for ( i in this.handles ) {

				if ( this.handles[ i ].constructor === String ) {
					this.handles[ i ] = this.element.children( this.handles[ i ] ).first().show();
				} else if ( this.handles[ i ].jquery || this.handles[ i ].nodeType ) {
					this.handles[ i ] = $( this.handles[ i ] );
					this._on( this.handles[ i ], { "mousedown": that._mouseDown } );
				}

				if ( this.elementIsWrapper &&
						this.originalElement[ 0 ]
							.nodeName
							.match( /^(textarea|input|select|button)$/i ) ) {
					axis = $( this.handles[ i ], this.element );

					padWrapper = /sw|ne|nw|se|n|s/.test( i ) ?
						axis.outerHeight() :
						axis.outerWidth();

					padPos = [ "padding",
						/ne|nw|n/.test( i ) ? "Top" :
						/se|sw|s/.test( i ) ? "Bottom" :
						/^e$/.test( i ) ? "Right" : "Left" ].join( "" );

					target.css( padPos, padWrapper );

					this._proportionallyResize();
				}

				this._handles = this._handles.add( this.handles[ i ] );
			}
		};

		// TODO: make renderAxis a prototype function
		this._renderAxis( this.element );

		this._handles = this._handles.add( this.element.find( ".ui-resizable-handle" ) );
		this._handles.disableSelection();

		this._handles.on( "mouseover", function() {
			if ( !that.resizing ) {
				if ( this.className ) {
					axis = this.className.match( /ui-resizable-(se|sw|ne|nw|n|e|s|w)/i );
				}
				that.axis = axis && axis[ 1 ] ? axis[ 1 ] : "se";
			}
		} );

		if ( o.autoHide ) {
			this._handles.hide();
			this._addClass( "ui-resizable-autohide" );
		}
	},

	_removeHandles: function() {
		this._handles.remove();
	},

	_mouseCapture: function( event ) {
		var i, handle,
			capture = false;

		for ( i in this.handles ) {
			handle = $( this.handles[ i ] )[ 0 ];
			if ( handle === event.target || $.contains( handle, event.target ) ) {
				capture = true;
			}
		}

		return !this.options.disabled && capture;
	},

	_mouseStart: function( event ) {

		var curleft, curtop, cursor,
			o = this.options,
			el = this.element;

		this.resizing = true;

		this._renderProxy();

		curleft = this._num( this.helper.css( "left" ) );
		curtop = this._num( this.helper.css( "top" ) );

		if ( o.containment ) {
			curleft += $( o.containment ).scrollLeft() || 0;
			curtop += $( o.containment ).scrollTop() || 0;
		}

		this.offset = this.helper.offset();
		this.position = { left: curleft, top: curtop };

		this.size = this._helper ? {
				width: this.helper.width(),
				height: this.helper.height()
			} : {
				width: el.width(),
				height: el.height()
			};

		this.originalSize = this._helper ? {
				width: el.outerWidth(),
				height: el.outerHeight()
			} : {
				width: el.width(),
				height: el.height()
			};

		this.sizeDiff = {
			width: el.outerWidth() - el.width(),
			height: el.outerHeight() - el.height()
		};

		this.originalPosition = { left: curleft, top: curtop };
		this.originalMousePosition = { left: event.pageX, top: event.pageY };

		this.aspectRatio = ( typeof o.aspectRatio === "number" ) ?
			o.aspectRatio :
			( ( this.originalSize.width / this.originalSize.height ) || 1 );

		cursor = $( ".ui-resizable-" + this.axis ).css( "cursor" );
		$( "body" ).css( "cursor", cursor === "auto" ? this.axis + "-resize" : cursor );

		this._addClass( "ui-resizable-resizing" );
		this._propagate( "start", event );
		return true;
	},

	_mouseDrag: function( event ) {

		var data, props,
			smp = this.originalMousePosition,
			a = this.axis,
			dx = ( event.pageX - smp.left ) || 0,
			dy = ( event.pageY - smp.top ) || 0,
			trigger = this._change[ a ];

		this._updatePrevProperties();

		if ( !trigger ) {
			return false;
		}

		data = trigger.apply( this, [ event, dx, dy ] );

		this._updateVirtualBoundaries( event.shiftKey );
		if ( this._aspectRatio || event.shiftKey ) {
			data = this._updateRatio( data, event );
		}

		data = this._respectSize( data, event );

		this._updateCache( data );

		this._propagate( "resize", event );

		props = this._applyChanges();

		if ( !this._helper && this._proportionallyResizeElements.length ) {
			this._proportionallyResize();
		}

		if ( !$.isEmptyObject( props ) ) {
			this._updatePrevProperties();
			this._trigger( "resize", event, this.ui() );
			this._applyChanges();
		}

		return false;
	},

	_mouseStop: function( event ) {

		this.resizing = false;
		var pr, ista, soffseth, soffsetw, s, left, top,
			o = this.options, that = this;

		if ( this._helper ) {

			pr = this._proportionallyResizeElements;
			ista = pr.length && ( /textarea/i ).test( pr[ 0 ].nodeName );
			soffseth = ista && this._hasScroll( pr[ 0 ], "left" ) ? 0 : that.sizeDiff.height;
			soffsetw = ista ? 0 : that.sizeDiff.width;

			s = {
				width: ( that.helper.width()  - soffsetw ),
				height: ( that.helper.height() - soffseth )
			};
			left = ( parseFloat( that.element.css( "left" ) ) +
				( that.position.left - that.originalPosition.left ) ) || null;
			top = ( parseFloat( that.element.css( "top" ) ) +
				( that.position.top - that.originalPosition.top ) ) || null;

			if ( !o.animate ) {
				this.element.css( $.extend( s, { top: top, left: left } ) );
			}

			that.helper.height( that.size.height );
			that.helper.width( that.size.width );

			if ( this._helper && !o.animate ) {
				this._proportionallyResize();
			}
		}

		$( "body" ).css( "cursor", "auto" );

		this._removeClass( "ui-resizable-resizing" );

		this._propagate( "stop", event );

		if ( this._helper ) {
			this.helper.remove();
		}

		return false;

	},

	_updatePrevProperties: function() {
		this.prevPosition = {
			top: this.position.top,
			left: this.position.left
		};
		this.prevSize = {
			width: this.size.width,
			height: this.size.height
		};
	},

	_applyChanges: function() {
		var props = {};

		if ( this.position.top !== this.prevPosition.top ) {
			props.top = this.position.top + "px";
		}
		if ( this.position.left !== this.prevPosition.left ) {
			props.left = this.position.left + "px";
		}
		if ( this.size.width !== this.prevSize.width ) {
			props.width = this.size.width + "px";
		}
		if ( this.size.height !== this.prevSize.height ) {
			props.height = this.size.height + "px";
		}

		this.helper.css( props );

		return props;
	},

	_updateVirtualBoundaries: function( forceAspectRatio ) {
		var pMinWidth, pMaxWidth, pMinHeight, pMaxHeight, b,
			o = this.options;

		b = {
			minWidth: this._isNumber( o.minWidth ) ? o.minWidth : 0,
			maxWidth: this._isNumber( o.maxWidth ) ? o.maxWidth : Infinity,
			minHeight: this._isNumber( o.minHeight ) ? o.minHeight : 0,
			maxHeight: this._isNumber( o.maxHeight ) ? o.maxHeight : Infinity
		};

		if ( this._aspectRatio || forceAspectRatio ) {
			pMinWidth = b.minHeight * this.aspectRatio;
			pMinHeight = b.minWidth / this.aspectRatio;
			pMaxWidth = b.maxHeight * this.aspectRatio;
			pMaxHeight = b.maxWidth / this.aspectRatio;

			if ( pMinWidth > b.minWidth ) {
				b.minWidth = pMinWidth;
			}
			if ( pMinHeight > b.minHeight ) {
				b.minHeight = pMinHeight;
			}
			if ( pMaxWidth < b.maxWidth ) {
				b.maxWidth = pMaxWidth;
			}
			if ( pMaxHeight < b.maxHeight ) {
				b.maxHeight = pMaxHeight;
			}
		}
		this._vBoundaries = b;
	},

	_updateCache: function( data ) {
		this.offset = this.helper.offset();
		if ( this._isNumber( data.left ) ) {
			this.position.left = data.left;
		}
		if ( this._isNumber( data.top ) ) {
			this.position.top = data.top;
		}
		if ( this._isNumber( data.height ) ) {
			this.size.height = data.height;
		}
		if ( this._isNumber( data.width ) ) {
			this.size.width = data.width;
		}
	},

	_updateRatio: function( data ) {

		var cpos = this.position,
			csize = this.size,
			a = this.axis;

		if ( this._isNumber( data.height ) ) {
			data.width = ( data.height * this.aspectRatio );
		} else if ( this._isNumber( data.width ) ) {
			data.height = ( data.width / this.aspectRatio );
		}

		if ( a === "sw" ) {
			data.left = cpos.left + ( csize.width - data.width );
			data.top = null;
		}
		if ( a === "nw" ) {
			data.top = cpos.top + ( csize.height - data.height );
			data.left = cpos.left + ( csize.width - data.width );
		}

		return data;
	},

	_respectSize: function( data ) {

		var o = this._vBoundaries,
			a = this.axis,
			ismaxw = this._isNumber( data.width ) && o.maxWidth && ( o.maxWidth < data.width ),
			ismaxh = this._isNumber( data.height ) && o.maxHeight && ( o.maxHeight < data.height ),
			isminw = this._isNumber( data.width ) && o.minWidth && ( o.minWidth > data.width ),
			isminh = this._isNumber( data.height ) && o.minHeight && ( o.minHeight > data.height ),
			dw = this.originalPosition.left + this.originalSize.width,
			dh = this.originalPosition.top + this.originalSize.height,
			cw = /sw|nw|w/.test( a ), ch = /nw|ne|n/.test( a );
		if ( isminw ) {
			data.width = o.minWidth;
		}
		if ( isminh ) {
			data.height = o.minHeight;
		}
		if ( ismaxw ) {
			data.width = o.maxWidth;
		}
		if ( ismaxh ) {
			data.height = o.maxHeight;
		}

		if ( isminw && cw ) {
			data.left = dw - o.minWidth;
		}
		if ( ismaxw && cw ) {
			data.left = dw - o.maxWidth;
		}
		if ( isminh && ch ) {
			data.top = dh - o.minHeight;
		}
		if ( ismaxh && ch ) {
			data.top = dh - o.maxHeight;
		}

		// Fixing jump error on top/left - bug #2330
		if ( !data.width && !data.height && !data.left && data.top ) {
			data.top = null;
		} else if ( !data.width && !data.height && !data.top && data.left ) {
			data.left = null;
		}

		return data;
	},

	_getPaddingPlusBorderDimensions: function( element ) {
		var i = 0,
			widths = [],
			borders = [
				element.css( "borderTopWidth" ),
				element.css( "borderRightWidth" ),
				element.css( "borderBottomWidth" ),
				element.css( "borderLeftWidth" )
			],
			paddings = [
				element.css( "paddingTop" ),
				element.css( "paddingRight" ),
				element.css( "paddingBottom" ),
				element.css( "paddingLeft" )
			];

		for ( ; i < 4; i++ ) {
			widths[ i ] = ( parseFloat( borders[ i ] ) || 0 );
			widths[ i ] += ( parseFloat( paddings[ i ] ) || 0 );
		}

		return {
			height: widths[ 0 ] + widths[ 2 ],
			width: widths[ 1 ] + widths[ 3 ]
		};
	},

	_proportionallyResize: function() {

		if ( !this._proportionallyResizeElements.length ) {
			return;
		}

		var prel,
			i = 0,
			element = this.helper || this.element;

		for ( ; i < this._proportionallyResizeElements.length; i++ ) {

			prel = this._proportionallyResizeElements[ i ];

			// TODO: Seems like a bug to cache this.outerDimensions
			// considering that we are in a loop.
			if ( !this.outerDimensions ) {
				this.outerDimensions = this._getPaddingPlusBorderDimensions( prel );
			}

			prel.css( {
				height: ( element.height() - this.outerDimensions.height ) || 0,
				width: ( element.width() - this.outerDimensions.width ) || 0
			} );

		}

	},

	_renderProxy: function() {

		var el = this.element, o = this.options;
		this.elementOffset = el.offset();

		if ( this._helper ) {

			this.helper = this.helper || $( "<div style='overflow:hidden;'></div>" );

			this._addClass( this.helper, this._helper );
			this.helper.css( {
				width: this.element.outerWidth(),
				height: this.element.outerHeight(),
				position: "absolute",
				left: this.elementOffset.left + "px",
				top: this.elementOffset.top + "px",
				zIndex: ++o.zIndex //TODO: Don't modify option
			} );

			this.helper
				.appendTo( "body" )
				.disableSelection();

		} else {
			this.helper = this.element;
		}

	},

	_change: {
		e: function( event, dx ) {
			return { width: this.originalSize.width + dx };
		},
		w: function( event, dx ) {
			var cs = this.originalSize, sp = this.originalPosition;
			return { left: sp.left + dx, width: cs.width - dx };
		},
		n: function( event, dx, dy ) {
			var cs = this.originalSize, sp = this.originalPosition;
			return { top: sp.top + dy, height: cs.height - dy };
		},
		s: function( event, dx, dy ) {
			return { height: this.originalSize.height + dy };
		},
		se: function( event, dx, dy ) {
			return $.extend( this._change.s.apply( this, arguments ),
				this._change.e.apply( this, [ event, dx, dy ] ) );
		},
		sw: function( event, dx, dy ) {
			return $.extend( this._change.s.apply( this, arguments ),
				this._change.w.apply( this, [ event, dx, dy ] ) );
		},
		ne: function( event, dx, dy ) {
			return $.extend( this._change.n.apply( this, arguments ),
				this._change.e.apply( this, [ event, dx, dy ] ) );
		},
		nw: function( event, dx, dy ) {
			return $.extend( this._change.n.apply( this, arguments ),
				this._change.w.apply( this, [ event, dx, dy ] ) );
		}
	},

	_propagate: function( n, event ) {
		$.ui.plugin.call( this, n, [ event, this.ui() ] );
		( n !== "resize" && this._trigger( n, event, this.ui() ) );
	},

	plugins: {},

	ui: function() {
		return {
			originalElement: this.originalElement,
			element: this.element,
			helper: this.helper,
			position: this.position,
			size: this.size,
			originalSize: this.originalSize,
			originalPosition: this.originalPosition
		};
	}

} );

/*
 * Resizable Extensions
 */

$.ui.plugin.add( "resizable", "animate", {

	stop: function( event ) {
		var that = $( this ).resizable( "instance" ),
			o = that.options,
			pr = that._proportionallyResizeElements,
			ista = pr.length && ( /textarea/i ).test( pr[ 0 ].nodeName ),
			soffseth = ista && that._hasScroll( pr[ 0 ], "left" ) ? 0 : that.sizeDiff.height,
			soffsetw = ista ? 0 : that.sizeDiff.width,
			style = {
				width: ( that.size.width - soffsetw ),
				height: ( that.size.height - soffseth )
			},
			left = ( parseFloat( that.element.css( "left" ) ) +
				( that.position.left - that.originalPosition.left ) ) || null,
			top = ( parseFloat( that.element.css( "top" ) ) +
				( that.position.top - that.originalPosition.top ) ) || null;

		that.element.animate(
			$.extend( style, top && left ? { top: top, left: left } : {} ), {
				duration: o.animateDuration,
				easing: o.animateEasing,
				step: function() {

					var data = {
						width: parseFloat( that.element.css( "width" ) ),
						height: parseFloat( that.element.css( "height" ) ),
						top: parseFloat( that.element.css( "top" ) ),
						left: parseFloat( that.element.css( "left" ) )
					};

					if ( pr && pr.length ) {
						$( pr[ 0 ] ).css( { width: data.width, height: data.height } );
					}

					// Propagating resize, and updating values for each animation step
					that._updateCache( data );
					that._propagate( "resize", event );

				}
			}
		);
	}

} );

$.ui.plugin.add( "resizable", "containment", {

	start: function() {
		var element, p, co, ch, cw, width, height,
			that = $( this ).resizable( "instance" ),
			o = that.options,
			el = that.element,
			oc = o.containment,
			ce = ( oc instanceof $ ) ?
				oc.get( 0 ) :
				( /parent/.test( oc ) ) ? el.parent().get( 0 ) : oc;

		if ( !ce ) {
			return;
		}

		that.containerElement = $( ce );

		if ( /document/.test( oc ) || oc === document ) {
			that.containerOffset = {
				left: 0,
				top: 0
			};
			that.containerPosition = {
				left: 0,
				top: 0
			};

			that.parentData = {
				element: $( document ),
				left: 0,
				top: 0,
				width: $( document ).width(),
				height: $( document ).height() || document.body.parentNode.scrollHeight
			};
		} else {
			element = $( ce );
			p = [];
			$( [ "Top", "Right", "Left", "Bottom" ] ).each( function( i, name ) {
				p[ i ] = that._num( element.css( "padding" + name ) );
			} );

			that.containerOffset = element.offset();
			that.containerPosition = element.position();
			that.containerSize = {
				height: ( element.innerHeight() - p[ 3 ] ),
				width: ( element.innerWidth() - p[ 1 ] )
			};

			co = that.containerOffset;
			ch = that.containerSize.height;
			cw = that.containerSize.width;
			width = ( that._hasScroll ( ce, "left" ) ? ce.scrollWidth : cw );
			height = ( that._hasScroll ( ce ) ? ce.scrollHeight : ch ) ;

			that.parentData = {
				element: ce,
				left: co.left,
				top: co.top,
				width: width,
				height: height
			};
		}
	},

	resize: function( event ) {
		var woset, hoset, isParent, isOffsetRelative,
			that = $( this ).resizable( "instance" ),
			o = that.options,
			co = that.containerOffset,
			cp = that.position,
			pRatio = that._aspectRatio || event.shiftKey,
			cop = {
				top: 0,
				left: 0
			},
			ce = that.containerElement,
			continueResize = true;

		if ( ce[ 0 ] !== document && ( /static/ ).test( ce.css( "position" ) ) ) {
			cop = co;
		}

		if ( cp.left < ( that._helper ? co.left : 0 ) ) {
			that.size.width = that.size.width +
				( that._helper ?
					( that.position.left - co.left ) :
					( that.position.left - cop.left ) );

			if ( pRatio ) {
				that.size.height = that.size.width / that.aspectRatio;
				continueResize = false;
			}
			that.position.left = o.helper ? co.left : 0;
		}

		if ( cp.top < ( that._helper ? co.top : 0 ) ) {
			that.size.height = that.size.height +
				( that._helper ?
					( that.position.top - co.top ) :
					that.position.top );

			if ( pRatio ) {
				that.size.width = that.size.height * that.aspectRatio;
				continueResize = false;
			}
			that.position.top = that._helper ? co.top : 0;
		}

		isParent = that.containerElement.get( 0 ) === that.element.parent().get( 0 );
		isOffsetRelative = /relative|absolute/.test( that.containerElement.css( "position" ) );

		if ( isParent && isOffsetRelative ) {
			that.offset.left = that.parentData.left + that.position.left;
			that.offset.top = that.parentData.top + that.position.top;
		} else {
			that.offset.left = that.element.offset().left;
			that.offset.top = that.element.offset().top;
		}

		woset = Math.abs( that.sizeDiff.width +
			( that._helper ?
				that.offset.left - cop.left :
				( that.offset.left - co.left ) ) );

		hoset = Math.abs( that.sizeDiff.height +
			( that._helper ?
				that.offset.top - cop.top :
				( that.offset.top - co.top ) ) );

		if ( woset + that.size.width >= that.parentData.width ) {
			that.size.width = that.parentData.width - woset;
			if ( pRatio ) {
				that.size.height = that.size.width / that.aspectRatio;
				continueResize = false;
			}
		}

		if ( hoset + that.size.height >= that.parentData.height ) {
			that.size.height = that.parentData.height - hoset;
			if ( pRatio ) {
				that.size.width = that.size.height * that.aspectRatio;
				continueResize = false;
			}
		}

		if ( !continueResize ) {
			that.position.left = that.prevPosition.left;
			that.position.top = that.prevPosition.top;
			that.size.width = that.prevSize.width;
			that.size.height = that.prevSize.height;
		}
	},

	stop: function() {
		var that = $( this ).resizable( "instance" ),
			o = that.options,
			co = that.containerOffset,
			cop = that.containerPosition,
			ce = that.containerElement,
			helper = $( that.helper ),
			ho = helper.offset(),
			w = helper.outerWidth() - that.sizeDiff.width,
			h = helper.outerHeight() - that.sizeDiff.height;

		if ( that._helper && !o.animate && ( /relative/ ).test( ce.css( "position" ) ) ) {
			$( this ).css( {
				left: ho.left - cop.left - co.left,
				width: w,
				height: h
			} );
		}

		if ( that._helper && !o.animate && ( /static/ ).test( ce.css( "position" ) ) ) {
			$( this ).css( {
				left: ho.left - cop.left - co.left,
				width: w,
				height: h
			} );
		}
	}
} );

$.ui.plugin.add( "resizable", "alsoResize", {

	start: function() {
		var that = $( this ).resizable( "instance" ),
			o = that.options;

		$( o.alsoResize ).each( function() {
			var el = $( this );
			el.data( "ui-resizable-alsoresize", {
				width: parseFloat( el.width() ), height: parseFloat( el.height() ),
				left: parseFloat( el.css( "left" ) ), top: parseFloat( el.css( "top" ) )
			} );
		} );
	},

	resize: function( event, ui ) {
		var that = $( this ).resizable( "instance" ),
			o = that.options,
			os = that.originalSize,
			op = that.originalPosition,
			delta = {
				height: ( that.size.height - os.height ) || 0,
				width: ( that.size.width - os.width ) || 0,
				top: ( that.position.top - op.top ) || 0,
				left: ( that.position.left - op.left ) || 0
			};

			$( o.alsoResize ).each( function() {
				var el = $( this ), start = $( this ).data( "ui-resizable-alsoresize" ), style = {},
					css = el.parents( ui.originalElement[ 0 ] ).length ?
							[ "width", "height" ] :
							[ "width", "height", "top", "left" ];

				$.each( css, function( i, prop ) {
					var sum = ( start[ prop ] || 0 ) + ( delta[ prop ] || 0 );
					if ( sum && sum >= 0 ) {
						style[ prop ] = sum || null;
					}
				} );

				el.css( style );
			} );
	},

	stop: function() {
		$( this ).removeData( "ui-resizable-alsoresize" );
	}
} );

$.ui.plugin.add( "resizable", "ghost", {

	start: function() {

		var that = $( this ).resizable( "instance" ), cs = that.size;

		that.ghost = that.originalElement.clone();
		that.ghost.css( {
			opacity: 0.25,
			display: "block",
			position: "relative",
			height: cs.height,
			width: cs.width,
			margin: 0,
			left: 0,
			top: 0
		} );

		that._addClass( that.ghost, "ui-resizable-ghost" );

		// DEPRECATED
		// TODO: remove after 1.12
		if ( $.uiBackCompat !== false && typeof that.options.ghost === "string" ) {

			// Ghost option
			that.ghost.addClass( this.options.ghost );
		}

		that.ghost.appendTo( that.helper );

	},

	resize: function() {
		var that = $( this ).resizable( "instance" );
		if ( that.ghost ) {
			that.ghost.css( {
				position: "relative",
				height: that.size.height,
				width: that.size.width
			} );
		}
	},

	stop: function() {
		var that = $( this ).resizable( "instance" );
		if ( that.ghost && that.helper ) {
			that.helper.get( 0 ).removeChild( that.ghost.get( 0 ) );
		}
	}

} );

$.ui.plugin.add( "resizable", "grid", {

	resize: function() {
		var outerDimensions,
			that = $( this ).resizable( "instance" ),
			o = that.options,
			cs = that.size,
			os = that.originalSize,
			op = that.originalPosition,
			a = that.axis,
			grid = typeof o.grid === "number" ? [ o.grid, o.grid ] : o.grid,
			gridX = ( grid[ 0 ] || 1 ),
			gridY = ( grid[ 1 ] || 1 ),
			ox = Math.round( ( cs.width - os.width ) / gridX ) * gridX,
			oy = Math.round( ( cs.height - os.height ) / gridY ) * gridY,
			newWidth = os.width + ox,
			newHeight = os.height + oy,
			isMaxWidth = o.maxWidth && ( o.maxWidth < newWidth ),
			isMaxHeight = o.maxHeight && ( o.maxHeight < newHeight ),
			isMinWidth = o.minWidth && ( o.minWidth > newWidth ),
			isMinHeight = o.minHeight && ( o.minHeight > newHeight );

		o.grid = grid;

		if ( isMinWidth ) {
			newWidth += gridX;
		}
		if ( isMinHeight ) {
			newHeight += gridY;
		}
		if ( isMaxWidth ) {
			newWidth -= gridX;
		}
		if ( isMaxHeight ) {
			newHeight -= gridY;
		}

		if ( /^(se|s|e)$/.test( a ) ) {
			that.size.width = newWidth;
			that.size.height = newHeight;
		} else if ( /^(ne)$/.test( a ) ) {
			that.size.width = newWidth;
			that.size.height = newHeight;
			that.position.top = op.top - oy;
		} else if ( /^(sw)$/.test( a ) ) {
			that.size.width = newWidth;
			that.size.height = newHeight;
			that.position.left = op.left - ox;
		} else {
			if ( newHeight - gridY <= 0 || newWidth - gridX <= 0 ) {
				outerDimensions = that._getPaddingPlusBorderDimensions( this );
			}

			if ( newHeight - gridY > 0 ) {
				that.size.height = newHeight;
				that.position.top = op.top - oy;
			} else {
				newHeight = gridY - outerDimensions.height;
				that.size.height = newHeight;
				that.position.top = op.top + os.height - newHeight;
			}
			if ( newWidth - gridX > 0 ) {
				that.size.width = newWidth;
				that.position.left = op.left - ox;
			} else {
				newWidth = gridX - outerDimensions.width;
				that.size.width = newWidth;
				that.position.left = op.left + os.width - newWidth;
			}
		}
	}

} );

return $.ui.resizable;

} ) );

},{}],37:[function(require,module,exports){
/*!
 * jQuery UI Selectmenu 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Selectmenu
//>>group: Widgets
// jscs:disable maximumLineLength
//>>description: Duplicates and extends the functionality of a native HTML select element, allowing it to be customizable in behavior and appearance far beyond the limitations of a native select.
// jscs:enable maximumLineLength
//>>docs: http://api.jqueryui.com/selectmenu/
//>>demos: http://jqueryui.com/selectmenu/
//>>css.structure: ../../themes/base/core.css
//>>css.structure: ../../themes/base/selectmenu.css, ../../themes/base/button.css
//>>css.theme: ../../themes/base/theme.css

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( [
			"jquery",
			"./menu",
			"../escape-selector",
			"../form-reset-mixin",
			"../keycode",
			"../labels",
			"../position",
			"../unique-id",
			"../version",
			"../widget"
		], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
}( function( $ ) {

return $.widget( "ui.selectmenu", [ $.ui.formResetMixin, {
	version: "1.12.1",
	defaultElement: "<select>",
	options: {
		appendTo: null,
		classes: {
			"ui-selectmenu-button-open": "ui-corner-top",
			"ui-selectmenu-button-closed": "ui-corner-all"
		},
		disabled: null,
		icons: {
			button: "ui-icon-triangle-1-s"
		},
		position: {
			my: "left top",
			at: "left bottom",
			collision: "none"
		},
		width: false,

		// Callbacks
		change: null,
		close: null,
		focus: null,
		open: null,
		select: null
	},

	_create: function() {
		var selectmenuId = this.element.uniqueId().attr( "id" );
		this.ids = {
			element: selectmenuId,
			button: selectmenuId + "-button",
			menu: selectmenuId + "-menu"
		};

		this._drawButton();
		this._drawMenu();
		this._bindFormResetHandler();

		this._rendered = false;
		this.menuItems = $();
	},

	_drawButton: function() {
		var icon,
			that = this,
			item = this._parseOption(
				this.element.find( "option:selected" ),
				this.element[ 0 ].selectedIndex
			);

		// Associate existing label with the new button
		this.labels = this.element.labels().attr( "for", this.ids.button );
		this._on( this.labels, {
			click: function( event ) {
				this.button.focus();
				event.preventDefault();
			}
		} );

		// Hide original select element
		this.element.hide();

		// Create button
		this.button = $( "<span>", {
			tabindex: this.options.disabled ? -1 : 0,
			id: this.ids.button,
			role: "combobox",
			"aria-expanded": "false",
			"aria-autocomplete": "list",
			"aria-owns": this.ids.menu,
			"aria-haspopup": "true",
			title: this.element.attr( "title" )
		} )
			.insertAfter( this.element );

		this._addClass( this.button, "ui-selectmenu-button ui-selectmenu-button-closed",
			"ui-button ui-widget" );

		icon = $( "<span>" ).appendTo( this.button );
		this._addClass( icon, "ui-selectmenu-icon", "ui-icon " + this.options.icons.button );
		this.buttonItem = this._renderButtonItem( item )
			.appendTo( this.button );

		if ( this.options.width !== false ) {
			this._resizeButton();
		}

		this._on( this.button, this._buttonEvents );
		this.button.one( "focusin", function() {

			// Delay rendering the menu items until the button receives focus.
			// The menu may have already been rendered via a programmatic open.
			if ( !that._rendered ) {
				that._refreshMenu();
			}
		} );
	},

	_drawMenu: function() {
		var that = this;

		// Create menu
		this.menu = $( "<ul>", {
			"aria-hidden": "true",
			"aria-labelledby": this.ids.button,
			id: this.ids.menu
		} );

		// Wrap menu
		this.menuWrap = $( "<div>" ).append( this.menu );
		this._addClass( this.menuWrap, "ui-selectmenu-menu", "ui-front" );
		this.menuWrap.appendTo( this._appendTo() );

		// Initialize menu widget
		this.menuInstance = this.menu
			.menu( {
				classes: {
					"ui-menu": "ui-corner-bottom"
				},
				role: "listbox",
				select: function( event, ui ) {
					event.preventDefault();

					// Support: IE8
					// If the item was selected via a click, the text selection
					// will be destroyed in IE
					that._setSelection();

					that._select( ui.item.data( "ui-selectmenu-item" ), event );
				},
				focus: function( event, ui ) {
					var item = ui.item.data( "ui-selectmenu-item" );

					// Prevent inital focus from firing and check if its a newly focused item
					if ( that.focusIndex != null && item.index !== that.focusIndex ) {
						that._trigger( "focus", event, { item: item } );
						if ( !that.isOpen ) {
							that._select( item, event );
						}
					}
					that.focusIndex = item.index;

					that.button.attr( "aria-activedescendant",
						that.menuItems.eq( item.index ).attr( "id" ) );
				}
			} )
			.menu( "instance" );

		// Don't close the menu on mouseleave
		this.menuInstance._off( this.menu, "mouseleave" );

		// Cancel the menu's collapseAll on document click
		this.menuInstance._closeOnDocumentClick = function() {
			return false;
		};

		// Selects often contain empty items, but never contain dividers
		this.menuInstance._isDivider = function() {
			return false;
		};
	},

	refresh: function() {
		this._refreshMenu();
		this.buttonItem.replaceWith(
			this.buttonItem = this._renderButtonItem(

				// Fall back to an empty object in case there are no options
				this._getSelectedItem().data( "ui-selectmenu-item" ) || {}
			)
		);
		if ( this.options.width === null ) {
			this._resizeButton();
		}
	},

	_refreshMenu: function() {
		var item,
			options = this.element.find( "option" );

		this.menu.empty();

		this._parseOptions( options );
		this._renderMenu( this.menu, this.items );

		this.menuInstance.refresh();
		this.menuItems = this.menu.find( "li" )
			.not( ".ui-selectmenu-optgroup" )
				.find( ".ui-menu-item-wrapper" );

		this._rendered = true;

		if ( !options.length ) {
			return;
		}

		item = this._getSelectedItem();

		// Update the menu to have the correct item focused
		this.menuInstance.focus( null, item );
		this._setAria( item.data( "ui-selectmenu-item" ) );

		// Set disabled state
		this._setOption( "disabled", this.element.prop( "disabled" ) );
	},

	open: function( event ) {
		if ( this.options.disabled ) {
			return;
		}

		// If this is the first time the menu is being opened, render the items
		if ( !this._rendered ) {
			this._refreshMenu();
		} else {

			// Menu clears focus on close, reset focus to selected item
			this._removeClass( this.menu.find( ".ui-state-active" ), null, "ui-state-active" );
			this.menuInstance.focus( null, this._getSelectedItem() );
		}

		// If there are no options, don't open the menu
		if ( !this.menuItems.length ) {
			return;
		}

		this.isOpen = true;
		this._toggleAttr();
		this._resizeMenu();
		this._position();

		this._on( this.document, this._documentClick );

		this._trigger( "open", event );
	},

	_position: function() {
		this.menuWrap.position( $.extend( { of: this.button }, this.options.position ) );
	},

	close: function( event ) {
		if ( !this.isOpen ) {
			return;
		}

		this.isOpen = false;
		this._toggleAttr();

		this.range = null;
		this._off( this.document );

		this._trigger( "close", event );
	},

	widget: function() {
		return this.button;
	},

	menuWidget: function() {
		return this.menu;
	},

	_renderButtonItem: function( item ) {
		var buttonItem = $( "<span>" );

		this._setText( buttonItem, item.label );
		this._addClass( buttonItem, "ui-selectmenu-text" );

		return buttonItem;
	},

	_renderMenu: function( ul, items ) {
		var that = this,
			currentOptgroup = "";

		$.each( items, function( index, item ) {
			var li;

			if ( item.optgroup !== currentOptgroup ) {
				li = $( "<li>", {
					text: item.optgroup
				} );
				that._addClass( li, "ui-selectmenu-optgroup", "ui-menu-divider" +
					( item.element.parent( "optgroup" ).prop( "disabled" ) ?
						" ui-state-disabled" :
						"" ) );

				li.appendTo( ul );

				currentOptgroup = item.optgroup;
			}

			that._renderItemData( ul, item );
		} );
	},

	_renderItemData: function( ul, item ) {
		return this._renderItem( ul, item ).data( "ui-selectmenu-item", item );
	},

	_renderItem: function( ul, item ) {
		var li = $( "<li>" ),
			wrapper = $( "<div>", {
				title: item.element.attr( "title" )
			} );

		if ( item.disabled ) {
			this._addClass( li, null, "ui-state-disabled" );
		}
		this._setText( wrapper, item.label );

		return li.append( wrapper ).appendTo( ul );
	},

	_setText: function( element, value ) {
		if ( value ) {
			element.text( value );
		} else {
			element.html( "&#160;" );
		}
	},

	_move: function( direction, event ) {
		var item, next,
			filter = ".ui-menu-item";

		if ( this.isOpen ) {
			item = this.menuItems.eq( this.focusIndex ).parent( "li" );
		} else {
			item = this.menuItems.eq( this.element[ 0 ].selectedIndex ).parent( "li" );
			filter += ":not(.ui-state-disabled)";
		}

		if ( direction === "first" || direction === "last" ) {
			next = item[ direction === "first" ? "prevAll" : "nextAll" ]( filter ).eq( -1 );
		} else {
			next = item[ direction + "All" ]( filter ).eq( 0 );
		}

		if ( next.length ) {
			this.menuInstance.focus( event, next );
		}
	},

	_getSelectedItem: function() {
		return this.menuItems.eq( this.element[ 0 ].selectedIndex ).parent( "li" );
	},

	_toggle: function( event ) {
		this[ this.isOpen ? "close" : "open" ]( event );
	},

	_setSelection: function() {
		var selection;

		if ( !this.range ) {
			return;
		}

		if ( window.getSelection ) {
			selection = window.getSelection();
			selection.removeAllRanges();
			selection.addRange( this.range );

		// Support: IE8
		} else {
			this.range.select();
		}

		// Support: IE
		// Setting the text selection kills the button focus in IE, but
		// restoring the focus doesn't kill the selection.
		this.button.focus();
	},

	_documentClick: {
		mousedown: function( event ) {
			if ( !this.isOpen ) {
				return;
			}

			if ( !$( event.target ).closest( ".ui-selectmenu-menu, #" +
					$.ui.escapeSelector( this.ids.button ) ).length ) {
				this.close( event );
			}
		}
	},

	_buttonEvents: {

		// Prevent text selection from being reset when interacting with the selectmenu (#10144)
		mousedown: function() {
			var selection;

			if ( window.getSelection ) {
				selection = window.getSelection();
				if ( selection.rangeCount ) {
					this.range = selection.getRangeAt( 0 );
				}

			// Support: IE8
			} else {
				this.range = document.selection.createRange();
			}
		},

		click: function( event ) {
			this._setSelection();
			this._toggle( event );
		},

		keydown: function( event ) {
			var preventDefault = true;
			switch ( event.keyCode ) {
			case $.ui.keyCode.TAB:
			case $.ui.keyCode.ESCAPE:
				this.close( event );
				preventDefault = false;
				break;
			case $.ui.keyCode.ENTER:
				if ( this.isOpen ) {
					this._selectFocusedItem( event );
				}
				break;
			case $.ui.keyCode.UP:
				if ( event.altKey ) {
					this._toggle( event );
				} else {
					this._move( "prev", event );
				}
				break;
			case $.ui.keyCode.DOWN:
				if ( event.altKey ) {
					this._toggle( event );
				} else {
					this._move( "next", event );
				}
				break;
			case $.ui.keyCode.SPACE:
				if ( this.isOpen ) {
					this._selectFocusedItem( event );
				} else {
					this._toggle( event );
				}
				break;
			case $.ui.keyCode.LEFT:
				this._move( "prev", event );
				break;
			case $.ui.keyCode.RIGHT:
				this._move( "next", event );
				break;
			case $.ui.keyCode.HOME:
			case $.ui.keyCode.PAGE_UP:
				this._move( "first", event );
				break;
			case $.ui.keyCode.END:
			case $.ui.keyCode.PAGE_DOWN:
				this._move( "last", event );
				break;
			default:
				this.menu.trigger( event );
				preventDefault = false;
			}

			if ( preventDefault ) {
				event.preventDefault();
			}
		}
	},

	_selectFocusedItem: function( event ) {
		var item = this.menuItems.eq( this.focusIndex ).parent( "li" );
		if ( !item.hasClass( "ui-state-disabled" ) ) {
			this._select( item.data( "ui-selectmenu-item" ), event );
		}
	},

	_select: function( item, event ) {
		var oldIndex = this.element[ 0 ].selectedIndex;

		// Change native select element
		this.element[ 0 ].selectedIndex = item.index;
		this.buttonItem.replaceWith( this.buttonItem = this._renderButtonItem( item ) );
		this._setAria( item );
		this._trigger( "select", event, { item: item } );

		if ( item.index !== oldIndex ) {
			this._trigger( "change", event, { item: item } );
		}

		this.close( event );
	},

	_setAria: function( item ) {
		var id = this.menuItems.eq( item.index ).attr( "id" );

		this.button.attr( {
			"aria-labelledby": id,
			"aria-activedescendant": id
		} );
		this.menu.attr( "aria-activedescendant", id );
	},

	_setOption: function( key, value ) {
		if ( key === "icons" ) {
			var icon = this.button.find( "span.ui-icon" );
			this._removeClass( icon, null, this.options.icons.button )
				._addClass( icon, null, value.button );
		}

		this._super( key, value );

		if ( key === "appendTo" ) {
			this.menuWrap.appendTo( this._appendTo() );
		}

		if ( key === "width" ) {
			this._resizeButton();
		}
	},

	_setOptionDisabled: function( value ) {
		this._super( value );

		this.menuInstance.option( "disabled", value );
		this.button.attr( "aria-disabled", value );
		this._toggleClass( this.button, null, "ui-state-disabled", value );

		this.element.prop( "disabled", value );
		if ( value ) {
			this.button.attr( "tabindex", -1 );
			this.close();
		} else {
			this.button.attr( "tabindex", 0 );
		}
	},

	_appendTo: function() {
		var element = this.options.appendTo;

		if ( element ) {
			element = element.jquery || element.nodeType ?
				$( element ) :
				this.document.find( element ).eq( 0 );
		}

		if ( !element || !element[ 0 ] ) {
			element = this.element.closest( ".ui-front, dialog" );
		}

		if ( !element.length ) {
			element = this.document[ 0 ].body;
		}

		return element;
	},

	_toggleAttr: function() {
		this.button.attr( "aria-expanded", this.isOpen );

		// We can't use two _toggleClass() calls here, because we need to make sure
		// we always remove classes first and add them second, otherwise if both classes have the
		// same theme class, it will be removed after we add it.
		this._removeClass( this.button, "ui-selectmenu-button-" +
			( this.isOpen ? "closed" : "open" ) )
			._addClass( this.button, "ui-selectmenu-button-" +
				( this.isOpen ? "open" : "closed" ) )
			._toggleClass( this.menuWrap, "ui-selectmenu-open", null, this.isOpen );

		this.menu.attr( "aria-hidden", !this.isOpen );
	},

	_resizeButton: function() {
		var width = this.options.width;

		// For `width: false`, just remove inline style and stop
		if ( width === false ) {
			this.button.css( "width", "" );
			return;
		}

		// For `width: null`, match the width of the original element
		if ( width === null ) {
			width = this.element.show().outerWidth();
			this.element.hide();
		}

		this.button.outerWidth( width );
	},

	_resizeMenu: function() {
		this.menu.outerWidth( Math.max(
			this.button.outerWidth(),

			// Support: IE10
			// IE10 wraps long text (possibly a rounding bug)
			// so we add 1px to avoid the wrapping
			this.menu.width( "" ).outerWidth() + 1
		) );
	},

	_getCreateOptions: function() {
		var options = this._super();

		options.disabled = this.element.prop( "disabled" );

		return options;
	},

	_parseOptions: function( options ) {
		var that = this,
			data = [];
		options.each( function( index, item ) {
			data.push( that._parseOption( $( item ), index ) );
		} );
		this.items = data;
	},

	_parseOption: function( option, index ) {
		var optgroup = option.parent( "optgroup" );

		return {
			element: option,
			index: index,
			value: option.val(),
			label: option.text(),
			optgroup: optgroup.attr( "label" ) || "",
			disabled: optgroup.prop( "disabled" ) || option.prop( "disabled" )
		};
	},

	_destroy: function() {
		this._unbindFormResetHandler();
		this.menuWrap.remove();
		this.button.remove();
		this.element.show();
		this.element.removeUniqueId();
		this.labels.attr( "for", this.ids.element );
	}
} ] );

} ) );

},{}],38:[function(require,module,exports){
/*!
 * jQuery UI Spinner 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Spinner
//>>group: Widgets
//>>description: Displays buttons to easily input numbers via the keyboard or mouse.
//>>docs: http://api.jqueryui.com/spinner/
//>>demos: http://jqueryui.com/spinner/
//>>css.structure: ../../themes/base/core.css
//>>css.structure: ../../themes/base/spinner.css
//>>css.theme: ../../themes/base/theme.css

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( [
			"jquery",
			"./button",
			"../version",
			"../keycode",
			"../safe-active-element",
			"../widget"
		], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
}( function( $ ) {

function spinnerModifer( fn ) {
	return function() {
		var previous = this.element.val();
		fn.apply( this, arguments );
		this._refresh();
		if ( previous !== this.element.val() ) {
			this._trigger( "change" );
		}
	};
}

$.widget( "ui.spinner", {
	version: "1.12.1",
	defaultElement: "<input>",
	widgetEventPrefix: "spin",
	options: {
		classes: {
			"ui-spinner": "ui-corner-all",
			"ui-spinner-down": "ui-corner-br",
			"ui-spinner-up": "ui-corner-tr"
		},
		culture: null,
		icons: {
			down: "ui-icon-triangle-1-s",
			up: "ui-icon-triangle-1-n"
		},
		incremental: true,
		max: null,
		min: null,
		numberFormat: null,
		page: 10,
		step: 1,

		change: null,
		spin: null,
		start: null,
		stop: null
	},

	_create: function() {

		// handle string values that need to be parsed
		this._setOption( "max", this.options.max );
		this._setOption( "min", this.options.min );
		this._setOption( "step", this.options.step );

		// Only format if there is a value, prevents the field from being marked
		// as invalid in Firefox, see #9573.
		if ( this.value() !== "" ) {

			// Format the value, but don't constrain.
			this._value( this.element.val(), true );
		}

		this._draw();
		this._on( this._events );
		this._refresh();

		// Turning off autocomplete prevents the browser from remembering the
		// value when navigating through history, so we re-enable autocomplete
		// if the page is unloaded before the widget is destroyed. #7790
		this._on( this.window, {
			beforeunload: function() {
				this.element.removeAttr( "autocomplete" );
			}
		} );
	},

	_getCreateOptions: function() {
		var options = this._super();
		var element = this.element;

		$.each( [ "min", "max", "step" ], function( i, option ) {
			var value = element.attr( option );
			if ( value != null && value.length ) {
				options[ option ] = value;
			}
		} );

		return options;
	},

	_events: {
		keydown: function( event ) {
			if ( this._start( event ) && this._keydown( event ) ) {
				event.preventDefault();
			}
		},
		keyup: "_stop",
		focus: function() {
			this.previous = this.element.val();
		},
		blur: function( event ) {
			if ( this.cancelBlur ) {
				delete this.cancelBlur;
				return;
			}

			this._stop();
			this._refresh();
			if ( this.previous !== this.element.val() ) {
				this._trigger( "change", event );
			}
		},
		mousewheel: function( event, delta ) {
			if ( !delta ) {
				return;
			}
			if ( !this.spinning && !this._start( event ) ) {
				return false;
			}

			this._spin( ( delta > 0 ? 1 : -1 ) * this.options.step, event );
			clearTimeout( this.mousewheelTimer );
			this.mousewheelTimer = this._delay( function() {
				if ( this.spinning ) {
					this._stop( event );
				}
			}, 100 );
			event.preventDefault();
		},
		"mousedown .ui-spinner-button": function( event ) {
			var previous;

			// We never want the buttons to have focus; whenever the user is
			// interacting with the spinner, the focus should be on the input.
			// If the input is focused then this.previous is properly set from
			// when the input first received focus. If the input is not focused
			// then we need to set this.previous based on the value before spinning.
			previous = this.element[ 0 ] === $.ui.safeActiveElement( this.document[ 0 ] ) ?
				this.previous : this.element.val();
			function checkFocus() {
				var isActive = this.element[ 0 ] === $.ui.safeActiveElement( this.document[ 0 ] );
				if ( !isActive ) {
					this.element.trigger( "focus" );
					this.previous = previous;

					// support: IE
					// IE sets focus asynchronously, so we need to check if focus
					// moved off of the input because the user clicked on the button.
					this._delay( function() {
						this.previous = previous;
					} );
				}
			}

			// Ensure focus is on (or stays on) the text field
			event.preventDefault();
			checkFocus.call( this );

			// Support: IE
			// IE doesn't prevent moving focus even with event.preventDefault()
			// so we set a flag to know when we should ignore the blur event
			// and check (again) if focus moved off of the input.
			this.cancelBlur = true;
			this._delay( function() {
				delete this.cancelBlur;
				checkFocus.call( this );
			} );

			if ( this._start( event ) === false ) {
				return;
			}

			this._repeat( null, $( event.currentTarget )
				.hasClass( "ui-spinner-up" ) ? 1 : -1, event );
		},
		"mouseup .ui-spinner-button": "_stop",
		"mouseenter .ui-spinner-button": function( event ) {

			// button will add ui-state-active if mouse was down while mouseleave and kept down
			if ( !$( event.currentTarget ).hasClass( "ui-state-active" ) ) {
				return;
			}

			if ( this._start( event ) === false ) {
				return false;
			}
			this._repeat( null, $( event.currentTarget )
				.hasClass( "ui-spinner-up" ) ? 1 : -1, event );
		},

		// TODO: do we really want to consider this a stop?
		// shouldn't we just stop the repeater and wait until mouseup before
		// we trigger the stop event?
		"mouseleave .ui-spinner-button": "_stop"
	},

	// Support mobile enhanced option and make backcompat more sane
	_enhance: function() {
		this.uiSpinner = this.element
			.attr( "autocomplete", "off" )
			.wrap( "<span>" )
			.parent()

				// Add buttons
				.append(
					"<a></a><a></a>"
				);
	},

	_draw: function() {
		this._enhance();

		this._addClass( this.uiSpinner, "ui-spinner", "ui-widget ui-widget-content" );
		this._addClass( "ui-spinner-input" );

		this.element.attr( "role", "spinbutton" );

		// Button bindings
		this.buttons = this.uiSpinner.children( "a" )
			.attr( "tabIndex", -1 )
			.attr( "aria-hidden", true )
			.button( {
				classes: {
					"ui-button": ""
				}
			} );

		// TODO: Right now button does not support classes this is already updated in button PR
		this._removeClass( this.buttons, "ui-corner-all" );

		this._addClass( this.buttons.first(), "ui-spinner-button ui-spinner-up" );
		this._addClass( this.buttons.last(), "ui-spinner-button ui-spinner-down" );
		this.buttons.first().button( {
			"icon": this.options.icons.up,
			"showLabel": false
		} );
		this.buttons.last().button( {
			"icon": this.options.icons.down,
			"showLabel": false
		} );

		// IE 6 doesn't understand height: 50% for the buttons
		// unless the wrapper has an explicit height
		if ( this.buttons.height() > Math.ceil( this.uiSpinner.height() * 0.5 ) &&
				this.uiSpinner.height() > 0 ) {
			this.uiSpinner.height( this.uiSpinner.height() );
		}
	},

	_keydown: function( event ) {
		var options = this.options,
			keyCode = $.ui.keyCode;

		switch ( event.keyCode ) {
		case keyCode.UP:
			this._repeat( null, 1, event );
			return true;
		case keyCode.DOWN:
			this._repeat( null, -1, event );
			return true;
		case keyCode.PAGE_UP:
			this._repeat( null, options.page, event );
			return true;
		case keyCode.PAGE_DOWN:
			this._repeat( null, -options.page, event );
			return true;
		}

		return false;
	},

	_start: function( event ) {
		if ( !this.spinning && this._trigger( "start", event ) === false ) {
			return false;
		}

		if ( !this.counter ) {
			this.counter = 1;
		}
		this.spinning = true;
		return true;
	},

	_repeat: function( i, steps, event ) {
		i = i || 500;

		clearTimeout( this.timer );
		this.timer = this._delay( function() {
			this._repeat( 40, steps, event );
		}, i );

		this._spin( steps * this.options.step, event );
	},

	_spin: function( step, event ) {
		var value = this.value() || 0;

		if ( !this.counter ) {
			this.counter = 1;
		}

		value = this._adjustValue( value + step * this._increment( this.counter ) );

		if ( !this.spinning || this._trigger( "spin", event, { value: value } ) !== false ) {
			this._value( value );
			this.counter++;
		}
	},

	_increment: function( i ) {
		var incremental = this.options.incremental;

		if ( incremental ) {
			return $.isFunction( incremental ) ?
				incremental( i ) :
				Math.floor( i * i * i / 50000 - i * i / 500 + 17 * i / 200 + 1 );
		}

		return 1;
	},

	_precision: function() {
		var precision = this._precisionOf( this.options.step );
		if ( this.options.min !== null ) {
			precision = Math.max( precision, this._precisionOf( this.options.min ) );
		}
		return precision;
	},

	_precisionOf: function( num ) {
		var str = num.toString(),
			decimal = str.indexOf( "." );
		return decimal === -1 ? 0 : str.length - decimal - 1;
	},

	_adjustValue: function( value ) {
		var base, aboveMin,
			options = this.options;

		// Make sure we're at a valid step
		// - find out where we are relative to the base (min or 0)
		base = options.min !== null ? options.min : 0;
		aboveMin = value - base;

		// - round to the nearest step
		aboveMin = Math.round( aboveMin / options.step ) * options.step;

		// - rounding is based on 0, so adjust back to our base
		value = base + aboveMin;

		// Fix precision from bad JS floating point math
		value = parseFloat( value.toFixed( this._precision() ) );

		// Clamp the value
		if ( options.max !== null && value > options.max ) {
			return options.max;
		}
		if ( options.min !== null && value < options.min ) {
			return options.min;
		}

		return value;
	},

	_stop: function( event ) {
		if ( !this.spinning ) {
			return;
		}

		clearTimeout( this.timer );
		clearTimeout( this.mousewheelTimer );
		this.counter = 0;
		this.spinning = false;
		this._trigger( "stop", event );
	},

	_setOption: function( key, value ) {
		var prevValue, first, last;

		if ( key === "culture" || key === "numberFormat" ) {
			prevValue = this._parse( this.element.val() );
			this.options[ key ] = value;
			this.element.val( this._format( prevValue ) );
			return;
		}

		if ( key === "max" || key === "min" || key === "step" ) {
			if ( typeof value === "string" ) {
				value = this._parse( value );
			}
		}
		if ( key === "icons" ) {
			first = this.buttons.first().find( ".ui-icon" );
			this._removeClass( first, null, this.options.icons.up );
			this._addClass( first, null, value.up );
			last = this.buttons.last().find( ".ui-icon" );
			this._removeClass( last, null, this.options.icons.down );
			this._addClass( last, null, value.down );
		}

		this._super( key, value );
	},

	_setOptionDisabled: function( value ) {
		this._super( value );

		this._toggleClass( this.uiSpinner, null, "ui-state-disabled", !!value );
		this.element.prop( "disabled", !!value );
		this.buttons.button( value ? "disable" : "enable" );
	},

	_setOptions: spinnerModifer( function( options ) {
		this._super( options );
	} ),

	_parse: function( val ) {
		if ( typeof val === "string" && val !== "" ) {
			val = window.Globalize && this.options.numberFormat ?
				Globalize.parseFloat( val, 10, this.options.culture ) : +val;
		}
		return val === "" || isNaN( val ) ? null : val;
	},

	_format: function( value ) {
		if ( value === "" ) {
			return "";
		}
		return window.Globalize && this.options.numberFormat ?
			Globalize.format( value, this.options.numberFormat, this.options.culture ) :
			value;
	},

	_refresh: function() {
		this.element.attr( {
			"aria-valuemin": this.options.min,
			"aria-valuemax": this.options.max,

			// TODO: what should we do with values that can't be parsed?
			"aria-valuenow": this._parse( this.element.val() )
		} );
	},

	isValid: function() {
		var value = this.value();

		// Null is invalid
		if ( value === null ) {
			return false;
		}

		// If value gets adjusted, it's invalid
		return value === this._adjustValue( value );
	},

	// Update the value without triggering change
	_value: function( value, allowAny ) {
		var parsed;
		if ( value !== "" ) {
			parsed = this._parse( value );
			if ( parsed !== null ) {
				if ( !allowAny ) {
					parsed = this._adjustValue( parsed );
				}
				value = this._format( parsed );
			}
		}
		this.element.val( value );
		this._refresh();
	},

	_destroy: function() {
		this.element
			.prop( "disabled", false )
			.removeAttr( "autocomplete role aria-valuemin aria-valuemax aria-valuenow" );

		this.uiSpinner.replaceWith( this.element );
	},

	stepUp: spinnerModifer( function( steps ) {
		this._stepUp( steps );
	} ),
	_stepUp: function( steps ) {
		if ( this._start() ) {
			this._spin( ( steps || 1 ) * this.options.step );
			this._stop();
		}
	},

	stepDown: spinnerModifer( function( steps ) {
		this._stepDown( steps );
	} ),
	_stepDown: function( steps ) {
		if ( this._start() ) {
			this._spin( ( steps || 1 ) * -this.options.step );
			this._stop();
		}
	},

	pageUp: spinnerModifer( function( pages ) {
		this._stepUp( ( pages || 1 ) * this.options.page );
	} ),

	pageDown: spinnerModifer( function( pages ) {
		this._stepDown( ( pages || 1 ) * this.options.page );
	} ),

	value: function( newVal ) {
		if ( !arguments.length ) {
			return this._parse( this.element.val() );
		}
		spinnerModifer( this._value ).call( this, newVal );
	},

	widget: function() {
		return this.uiSpinner;
	}
} );

// DEPRECATED
// TODO: switch return back to widget declaration at top of file when this is removed
if ( $.uiBackCompat !== false ) {

	// Backcompat for spinner html extension points
	$.widget( "ui.spinner", $.ui.spinner, {
		_enhance: function() {
			this.uiSpinner = this.element
				.attr( "autocomplete", "off" )
				.wrap( this._uiSpinnerHtml() )
				.parent()

					// Add buttons
					.append( this._buttonHtml() );
		},
		_uiSpinnerHtml: function() {
			return "<span>";
		},

		_buttonHtml: function() {
			return "<a></a><a></a>";
		}
	} );
}

return $.ui.spinner;

} ) );

},{}],39:[function(require,module,exports){
/*!
 * jQuery UI Tooltip 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Tooltip
//>>group: Widgets
//>>description: Shows additional information for any element on hover or focus.
//>>docs: http://api.jqueryui.com/tooltip/
//>>demos: http://jqueryui.com/tooltip/
//>>css.structure: ../../themes/base/core.css
//>>css.structure: ../../themes/base/tooltip.css
//>>css.theme: ../../themes/base/theme.css

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( [
			"jquery",
			"../keycode",
			"../position",
			"../unique-id",
			"../version",
			"../widget"
		], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
}( function( $ ) {

$.widget( "ui.tooltip", {
	version: "1.12.1",
	options: {
		classes: {
			"ui-tooltip": "ui-corner-all ui-widget-shadow"
		},
		content: function() {

			// support: IE<9, Opera in jQuery <1.7
			// .text() can't accept undefined, so coerce to a string
			var title = $( this ).attr( "title" ) || "";

			// Escape title, since we're going from an attribute to raw HTML
			return $( "<a>" ).text( title ).html();
		},
		hide: true,

		// Disabled elements have inconsistent behavior across browsers (#8661)
		items: "[title]:not([disabled])",
		position: {
			my: "left top+15",
			at: "left bottom",
			collision: "flipfit flip"
		},
		show: true,
		track: false,

		// Callbacks
		close: null,
		open: null
	},

	_addDescribedBy: function( elem, id ) {
		var describedby = ( elem.attr( "aria-describedby" ) || "" ).split( /\s+/ );
		describedby.push( id );
		elem
			.data( "ui-tooltip-id", id )
			.attr( "aria-describedby", $.trim( describedby.join( " " ) ) );
	},

	_removeDescribedBy: function( elem ) {
		var id = elem.data( "ui-tooltip-id" ),
			describedby = ( elem.attr( "aria-describedby" ) || "" ).split( /\s+/ ),
			index = $.inArray( id, describedby );

		if ( index !== -1 ) {
			describedby.splice( index, 1 );
		}

		elem.removeData( "ui-tooltip-id" );
		describedby = $.trim( describedby.join( " " ) );
		if ( describedby ) {
			elem.attr( "aria-describedby", describedby );
		} else {
			elem.removeAttr( "aria-describedby" );
		}
	},

	_create: function() {
		this._on( {
			mouseover: "open",
			focusin: "open"
		} );

		// IDs of generated tooltips, needed for destroy
		this.tooltips = {};

		// IDs of parent tooltips where we removed the title attribute
		this.parents = {};

		// Append the aria-live region so tooltips announce correctly
		this.liveRegion = $( "<div>" )
			.attr( {
				role: "log",
				"aria-live": "assertive",
				"aria-relevant": "additions"
			} )
			.appendTo( this.document[ 0 ].body );
		this._addClass( this.liveRegion, null, "ui-helper-hidden-accessible" );

		this.disabledTitles = $( [] );
	},

	_setOption: function( key, value ) {
		var that = this;

		this._super( key, value );

		if ( key === "content" ) {
			$.each( this.tooltips, function( id, tooltipData ) {
				that._updateContent( tooltipData.element );
			} );
		}
	},

	_setOptionDisabled: function( value ) {
		this[ value ? "_disable" : "_enable" ]();
	},

	_disable: function() {
		var that = this;

		// Close open tooltips
		$.each( this.tooltips, function( id, tooltipData ) {
			var event = $.Event( "blur" );
			event.target = event.currentTarget = tooltipData.element[ 0 ];
			that.close( event, true );
		} );

		// Remove title attributes to prevent native tooltips
		this.disabledTitles = this.disabledTitles.add(
			this.element.find( this.options.items ).addBack()
				.filter( function() {
					var element = $( this );
					if ( element.is( "[title]" ) ) {
						return element
							.data( "ui-tooltip-title", element.attr( "title" ) )
							.removeAttr( "title" );
					}
				} )
		);
	},

	_enable: function() {

		// restore title attributes
		this.disabledTitles.each( function() {
			var element = $( this );
			if ( element.data( "ui-tooltip-title" ) ) {
				element.attr( "title", element.data( "ui-tooltip-title" ) );
			}
		} );
		this.disabledTitles = $( [] );
	},

	open: function( event ) {
		var that = this,
			target = $( event ? event.target : this.element )

				// we need closest here due to mouseover bubbling,
				// but always pointing at the same event target
				.closest( this.options.items );

		// No element to show a tooltip for or the tooltip is already open
		if ( !target.length || target.data( "ui-tooltip-id" ) ) {
			return;
		}

		if ( target.attr( "title" ) ) {
			target.data( "ui-tooltip-title", target.attr( "title" ) );
		}

		target.data( "ui-tooltip-open", true );

		// Kill parent tooltips, custom or native, for hover
		if ( event && event.type === "mouseover" ) {
			target.parents().each( function() {
				var parent = $( this ),
					blurEvent;
				if ( parent.data( "ui-tooltip-open" ) ) {
					blurEvent = $.Event( "blur" );
					blurEvent.target = blurEvent.currentTarget = this;
					that.close( blurEvent, true );
				}
				if ( parent.attr( "title" ) ) {
					parent.uniqueId();
					that.parents[ this.id ] = {
						element: this,
						title: parent.attr( "title" )
					};
					parent.attr( "title", "" );
				}
			} );
		}

		this._registerCloseHandlers( event, target );
		this._updateContent( target, event );
	},

	_updateContent: function( target, event ) {
		var content,
			contentOption = this.options.content,
			that = this,
			eventType = event ? event.type : null;

		if ( typeof contentOption === "string" || contentOption.nodeType ||
				contentOption.jquery ) {
			return this._open( event, target, contentOption );
		}

		content = contentOption.call( target[ 0 ], function( response ) {

			// IE may instantly serve a cached response for ajax requests
			// delay this call to _open so the other call to _open runs first
			that._delay( function() {

				// Ignore async response if tooltip was closed already
				if ( !target.data( "ui-tooltip-open" ) ) {
					return;
				}

				// JQuery creates a special event for focusin when it doesn't
				// exist natively. To improve performance, the native event
				// object is reused and the type is changed. Therefore, we can't
				// rely on the type being correct after the event finished
				// bubbling, so we set it back to the previous value. (#8740)
				if ( event ) {
					event.type = eventType;
				}
				this._open( event, target, response );
			} );
		} );
		if ( content ) {
			this._open( event, target, content );
		}
	},

	_open: function( event, target, content ) {
		var tooltipData, tooltip, delayedShow, a11yContent,
			positionOption = $.extend( {}, this.options.position );

		if ( !content ) {
			return;
		}

		// Content can be updated multiple times. If the tooltip already
		// exists, then just update the content and bail.
		tooltipData = this._find( target );
		if ( tooltipData ) {
			tooltipData.tooltip.find( ".ui-tooltip-content" ).html( content );
			return;
		}

		// If we have a title, clear it to prevent the native tooltip
		// we have to check first to avoid defining a title if none exists
		// (we don't want to cause an element to start matching [title])
		//
		// We use removeAttr only for key events, to allow IE to export the correct
		// accessible attributes. For mouse events, set to empty string to avoid
		// native tooltip showing up (happens only when removing inside mouseover).
		if ( target.is( "[title]" ) ) {
			if ( event && event.type === "mouseover" ) {
				target.attr( "title", "" );
			} else {
				target.removeAttr( "title" );
			}
		}

		tooltipData = this._tooltip( target );
		tooltip = tooltipData.tooltip;
		this._addDescribedBy( target, tooltip.attr( "id" ) );
		tooltip.find( ".ui-tooltip-content" ).html( content );

		// Support: Voiceover on OS X, JAWS on IE <= 9
		// JAWS announces deletions even when aria-relevant="additions"
		// Voiceover will sometimes re-read the entire log region's contents from the beginning
		this.liveRegion.children().hide();
		a11yContent = $( "<div>" ).html( tooltip.find( ".ui-tooltip-content" ).html() );
		a11yContent.removeAttr( "name" ).find( "[name]" ).removeAttr( "name" );
		a11yContent.removeAttr( "id" ).find( "[id]" ).removeAttr( "id" );
		a11yContent.appendTo( this.liveRegion );

		function position( event ) {
			positionOption.of = event;
			if ( tooltip.is( ":hidden" ) ) {
				return;
			}
			tooltip.position( positionOption );
		}
		if ( this.options.track && event && /^mouse/.test( event.type ) ) {
			this._on( this.document, {
				mousemove: position
			} );

			// trigger once to override element-relative positioning
			position( event );
		} else {
			tooltip.position( $.extend( {
				of: target
			}, this.options.position ) );
		}

		tooltip.hide();

		this._show( tooltip, this.options.show );

		// Handle tracking tooltips that are shown with a delay (#8644). As soon
		// as the tooltip is visible, position the tooltip using the most recent
		// event.
		// Adds the check to add the timers only when both delay and track options are set (#14682)
		if ( this.options.track && this.options.show && this.options.show.delay ) {
			delayedShow = this.delayedShow = setInterval( function() {
				if ( tooltip.is( ":visible" ) ) {
					position( positionOption.of );
					clearInterval( delayedShow );
				}
			}, $.fx.interval );
		}

		this._trigger( "open", event, { tooltip: tooltip } );
	},

	_registerCloseHandlers: function( event, target ) {
		var events = {
			keyup: function( event ) {
				if ( event.keyCode === $.ui.keyCode.ESCAPE ) {
					var fakeEvent = $.Event( event );
					fakeEvent.currentTarget = target[ 0 ];
					this.close( fakeEvent, true );
				}
			}
		};

		// Only bind remove handler for delegated targets. Non-delegated
		// tooltips will handle this in destroy.
		if ( target[ 0 ] !== this.element[ 0 ] ) {
			events.remove = function() {
				this._removeTooltip( this._find( target ).tooltip );
			};
		}

		if ( !event || event.type === "mouseover" ) {
			events.mouseleave = "close";
		}
		if ( !event || event.type === "focusin" ) {
			events.focusout = "close";
		}
		this._on( true, target, events );
	},

	close: function( event ) {
		var tooltip,
			that = this,
			target = $( event ? event.currentTarget : this.element ),
			tooltipData = this._find( target );

		// The tooltip may already be closed
		if ( !tooltipData ) {

			// We set ui-tooltip-open immediately upon open (in open()), but only set the
			// additional data once there's actually content to show (in _open()). So even if the
			// tooltip doesn't have full data, we always remove ui-tooltip-open in case we're in
			// the period between open() and _open().
			target.removeData( "ui-tooltip-open" );
			return;
		}

		tooltip = tooltipData.tooltip;

		// Disabling closes the tooltip, so we need to track when we're closing
		// to avoid an infinite loop in case the tooltip becomes disabled on close
		if ( tooltipData.closing ) {
			return;
		}

		// Clear the interval for delayed tracking tooltips
		clearInterval( this.delayedShow );

		// Only set title if we had one before (see comment in _open())
		// If the title attribute has changed since open(), don't restore
		if ( target.data( "ui-tooltip-title" ) && !target.attr( "title" ) ) {
			target.attr( "title", target.data( "ui-tooltip-title" ) );
		}

		this._removeDescribedBy( target );

		tooltipData.hiding = true;
		tooltip.stop( true );
		this._hide( tooltip, this.options.hide, function() {
			that._removeTooltip( $( this ) );
		} );

		target.removeData( "ui-tooltip-open" );
		this._off( target, "mouseleave focusout keyup" );

		// Remove 'remove' binding only on delegated targets
		if ( target[ 0 ] !== this.element[ 0 ] ) {
			this._off( target, "remove" );
		}
		this._off( this.document, "mousemove" );

		if ( event && event.type === "mouseleave" ) {
			$.each( this.parents, function( id, parent ) {
				$( parent.element ).attr( "title", parent.title );
				delete that.parents[ id ];
			} );
		}

		tooltipData.closing = true;
		this._trigger( "close", event, { tooltip: tooltip } );
		if ( !tooltipData.hiding ) {
			tooltipData.closing = false;
		}
	},

	_tooltip: function( element ) {
		var tooltip = $( "<div>" ).attr( "role", "tooltip" ),
			content = $( "<div>" ).appendTo( tooltip ),
			id = tooltip.uniqueId().attr( "id" );

		this._addClass( content, "ui-tooltip-content" );
		this._addClass( tooltip, "ui-tooltip", "ui-widget ui-widget-content" );

		tooltip.appendTo( this._appendTo( element ) );

		return this.tooltips[ id ] = {
			element: element,
			tooltip: tooltip
		};
	},

	_find: function( target ) {
		var id = target.data( "ui-tooltip-id" );
		return id ? this.tooltips[ id ] : null;
	},

	_removeTooltip: function( tooltip ) {
		tooltip.remove();
		delete this.tooltips[ tooltip.attr( "id" ) ];
	},

	_appendTo: function( target ) {
		var element = target.closest( ".ui-front, dialog" );

		if ( !element.length ) {
			element = this.document[ 0 ].body;
		}

		return element;
	},

	_destroy: function() {
		var that = this;

		// Close open tooltips
		$.each( this.tooltips, function( id, tooltipData ) {

			// Delegate to close method to handle common cleanup
			var event = $.Event( "blur" ),
				element = tooltipData.element;
			event.target = event.currentTarget = element[ 0 ];
			that.close( event, true );

			// Remove immediately; destroying an open tooltip doesn't use the
			// hide animation
			$( "#" + id ).remove();

			// Restore the title
			if ( element.data( "ui-tooltip-title" ) ) {

				// If the title attribute has changed since open(), don't restore
				if ( !element.attr( "title" ) ) {
					element.attr( "title", element.data( "ui-tooltip-title" ) );
				}
				element.removeData( "ui-tooltip-title" );
			}
		} );
		this.liveRegion.remove();
	}
} );

// DEPRECATED
// TODO: Switch return back to widget declaration at top of file when this is removed
if ( $.uiBackCompat !== false ) {

	// Backcompat for tooltipClass option
	$.widget( "ui.tooltip", $.ui.tooltip, {
		options: {
			tooltipClass: null
		},
		_tooltip: function() {
			var tooltipData = this._superApply( arguments );
			if ( this.options.tooltipClass ) {
				tooltipData.tooltip.addClass( this.options.tooltipClass );
			}
			return tooltipData;
		}
	} );
}

return $.ui.tooltip;

} ) );

},{}],40:[function(require,module,exports){
!function(e,r){if("object"==typeof exports&&"object"==typeof module)module.exports=r();else if("function"==typeof define&&define.amd)define([],r);else{var t=r();for(var n in t)("object"==typeof exports?exports:e)[n]=t[n]}}(this,function(){return function(e){function r(n){if(t[n])return t[n].exports;var o=t[n]={exports:{},id:n,loaded:!1};return e[n].call(o.exports,o,o.exports,r),o.loaded=!0,o.exports}var t={};return r.m=e,r.c=t,r.p="",r(0)}([function(e,r,t){e.exports=t(1)},function(e,r,t){"use strict";function n(){var e="undefined"==typeof JSON?{}:JSON;o.setupJSON(e)}var o=t(2),i=t(3);n();var a=window._rollbarConfig,s=a&&a.globalAlias||"Rollbar",u=window[s]&&"undefined"!=typeof window[s].shimId;!u&&a?o.wrapper.init(a):(window.Rollbar=o.wrapper,window.RollbarNotifier=i.Notifier),e.exports=o.wrapper},function(e,r,t){"use strict";function n(e,r,t){!t[4]&&window._rollbarWrappedError&&(t[4]=window._rollbarWrappedError,window._rollbarWrappedError=null),e.uncaughtError.apply(e,t),r&&r.apply(window,t)}function o(e,r){if(r.hasOwnProperty&&r.hasOwnProperty("addEventListener")){var t=r.addEventListener;r.addEventListener=function(r,n,o){t.call(this,r,e.wrap(n),o)};var n=r.removeEventListener;r.removeEventListener=function(e,r,t){n.call(this,e,r&&r._wrapped||r,t)}}}var i=t(3),a=t(8),s=i.Notifier;window._rollbarWrappedError=null;var u={};u.init=function(e,r){var t=new s(r);if(t.configure(e),e.captureUncaught){var i;r&&a.isType(r._rollbarOldOnError,"function")?i=r._rollbarOldOnError:window.onerror&&!window.onerror.belongsToShim&&(i=window.onerror),window.onerror=function(){var e=Array.prototype.slice.call(arguments,0);n(t,i,e)};var u,c,l=["EventTarget","Window","Node","ApplicationCache","AudioTrackList","ChannelMergerNode","CryptoOperation","EventSource","FileReader","HTMLUnknownElement","IDBDatabase","IDBRequest","IDBTransaction","KeyOperation","MediaController","MessagePort","ModalWindow","Notification","SVGElementInstance","Screen","TextTrack","TextTrackCue","TextTrackList","WebSocket","WebSocketWorker","Worker","XMLHttpRequest","XMLHttpRequestEventTarget","XMLHttpRequestUpload"];for(u=0;u<l.length;++u)c=l[u],window[c]&&window[c].prototype&&o(t,window[c].prototype)}return e.captureUnhandledRejections&&(r&&a.isType(r._unhandledRejectionHandler,"function")&&window.removeEventListener("unhandledrejection",r._unhandledRejectionHandler),t._unhandledRejectionHandler=function(e){var r=e.reason,n=e.promise,o=e.detail;!r&&o&&(r=o.reason,n=o.promise),t.unhandledRejection(r,n)},window.addEventListener("unhandledrejection",t._unhandledRejectionHandler)),window.Rollbar=t,s.processPayloads(),t},e.exports={wrapper:u,setupJSON:i.setupJSON}},function(e,r,t){"use strict";function n(e){E=e,w.setupJSON(e)}function o(e,r){return function(){var t=r||this;try{return e.apply(t,arguments)}catch(n){console.error("[Rollbar]:",n)}}}function i(){h||(h=setTimeout(f,1e3))}function a(){return _}function s(e){_=_||this;var r="https://"+s.DEFAULT_ENDPOINT;this.options={enabled:!0,endpoint:r,environment:"production",scrubFields:g([],s.DEFAULT_SCRUB_FIELDS),checkIgnore:null,logLevel:s.DEFAULT_LOG_LEVEL,reportLevel:s.DEFAULT_REPORT_LEVEL,uncaughtErrorLevel:s.DEFAULT_UNCAUGHT_ERROR_LEVEL,payload:{}},this.lastError=null,this.plugins={},this.parentNotifier=e,e&&(e.hasOwnProperty("shimId")?e.notifier=this:this.configure(e.options))}function u(e){window._rollbarPayloadQueue.push(e),i()}function c(e){return o(function(){var r=this._getLogArgs(arguments);return this._log(e||r.level||this.options.logLevel||s.DEFAULT_LOG_LEVEL,r.message,r.err,r.custom,r.callback)})}function l(e,r){e||(e=r?E.stringify(r):"");var t={body:e};return r&&(t.extra=g(!0,{},r)),{message:t}}function p(e,r,t){var n=m.guessErrorClass(r.message),o=r.name||n[0],i=n[1],a={exception:{"class":o,message:i}};if(e&&(a.exception.description=e||"uncaught exception"),r.stack){var s,u,c,p,f,d,h,w;for(a.frames=[],h=0;h<r.stack.length;++h)s=r.stack[h],u={filename:s.url?v.sanitizeUrl(s.url):"(unknown)",lineno:s.line||null,method:s.func&&"?"!==s.func?s.func:"[anonymous]",colno:s.column},c=p=f=null,d=s.context?s.context.length:0,d&&(w=Math.floor(d/2),p=s.context.slice(0,w),c=s.context[w],f=s.context.slice(w)),c&&(u.code=c),(p||f)&&(u.context={},p&&p.length&&(u.context.pre=p),f&&f.length&&(u.context.post=f)),s.args&&(u.args=s.args),a.frames.push(u);return a.frames.reverse(),t&&(a.extra=g(!0,{},t)),{trace:a}}return l(o+": "+i,t)}function f(){var e;try{for(;e=window._rollbarPayloadQueue.shift();)d(e)}finally{h=void 0}}function d(e){var r=e.endpointUrl,t=e.accessToken,n=e.payload,o=e.callback||function(){},i=(new Date).getTime();i-L>=6e4&&(L=i,R=0);var a=window._globalRollbarOptions.maxItems,c=window._globalRollbarOptions.itemsPerMinute,l=function(){return!n.ignoreRateLimit&&a>=1&&T>=a},p=function(){return!n.ignoreRateLimit&&c>=1&&R>=c};return l()?void o(new Error(a+" max items reached")):p()?void o(new Error(c+" items per minute reached")):(T++,R++,l()&&_._log(_.options.uncaughtErrorLevel,"maxItems has been hit. Ignoring errors for the remainder of the current page load.",null,{maxItems:a},null,!1,!0),n.ignoreRateLimit&&delete n.ignoreRateLimit,void y.post(r,t,n,function(r,t){return r?(r instanceof b&&(e.callback=function(){},setTimeout(function(){u(e)},s.RETRY_DELAY)),o(r)):o(null,t)}))}var h,g=t(4),m=t(5),v=t(8),w=t(10),y=w.XHR,b=w.ConnectionError,E=null;s.NOTIFIER_VERSION="1.9.2",s.DEFAULT_ENDPOINT="api.rollbar.com/api/1/",s.DEFAULT_SCRUB_FIELDS=["pw","pass","passwd","password","secret","confirm_password","confirmPassword","password_confirmation","passwordConfirmation","access_token","accessToken","secret_key","secretKey","secretToken"],s.DEFAULT_LOG_LEVEL="debug",s.DEFAULT_REPORT_LEVEL="debug",s.DEFAULT_UNCAUGHT_ERROR_LEVEL="error",s.DEFAULT_ITEMS_PER_MIN=60,s.DEFAULT_MAX_ITEMS=0,s.LEVELS={debug:0,info:1,warning:2,error:3,critical:4},s.RETRY_DELAY=1e4,window._rollbarPayloadQueue=window._rollbarPayloadQueue||[],window._globalRollbarOptions={startTime:(new Date).getTime(),maxItems:s.DEFAULT_MAX_ITEMS,itemsPerMinute:s.DEFAULT_ITEMS_PER_MIN};var _,x=s.prototype;x._getLogArgs=function(e){for(var r,t,n,i,a,u,c=this.options.logLevel||s.DEFAULT_LOG_LEVEL,l=[],p=0;p<e.length;++p)u=e[p],a=v.typeName(u),"string"===a?r?l.push(u):r=u:"function"===a?i=o(u,this):"date"===a?l.push(u):"error"===a||u instanceof Error||"undefined"!=typeof DOMException&&u instanceof DOMException?t?l.push(u):t=u:"object"!==a&&"array"!==a||(n?l.push(u):n=u);return l.length&&(n=n||{},n.extraArgs=l),{level:c,message:r,err:t,custom:n,callback:i}},x._route=function(e){var r=this.options.endpoint,t=/\/$/.test(r),n=/^\//.test(e);return t&&n?e=e.substring(1):t||n||(e="/"+e),r+e},x._processShimQueue=function(e){for(var r,t,n,o,i,a,u,c={};t=e.shift();)r=t.shim,n=t.method,o=t.args,i=r.parentShim,u=c[r.shimId],u||(i?(a=c[i.shimId],u=new s(a)):u=this,c[r.shimId]=u),u[n]&&v.isType(u[n],"function")&&u[n].apply(u,o)},x._buildPayload=function(e,r,t,n,o){var i=this.options.accessToken,a=this.options.environment,u=g(!0,{},this.options.payload),c=v.uuid4();if(void 0===s.LEVELS[r])throw new Error("Invalid level");if(!t&&!n&&!o)throw new Error("No message, stack info or custom data");var l={environment:a,endpoint:this.options.endpoint,uuid:c,level:r,platform:"browser",framework:"browser-js",language:"javascript",body:this._buildBody(t,n,o),request:{url:window.location.href,query_string:window.location.search,user_ip:"$remote_ip"},client:{runtime_ms:e.getTime()-window._globalRollbarOptions.startTime,timestamp:Math.round(e.getTime()/1e3),javascript:{browser:window.navigator.userAgent,language:window.navigator.language,cookie_enabled:window.navigator.cookieEnabled,screen:{width:window.screen.width,height:window.screen.height},plugins:this._getBrowserPlugins()}},server:{},notifier:{name:"rollbar-browser-js",version:s.NOTIFIER_VERSION}};u.body&&delete u.body;var p={access_token:i,data:g(!0,l,u)};return this._scrub(p.data),p},x._buildBody=function(e,r,t){var n;return n=r?p(e,r,t):l(e,t)},x._getBrowserPlugins=function(){if(!this._browserPlugins){var e,r,t=window.navigator.plugins||[],n=t.length,o=[];for(r=0;r<n;++r)e=t[r],o.push({name:e.name,description:e.description});this._browserPlugins=o}return this._browserPlugins},x._scrub=function(e){function r(e,r,t,n,o,i){return r+v.redact(i)}function t(e){var t;if(v.isType(e,"string"))for(t=0;t<s.length;++t)e=e.replace(s[t],r);return e}function n(e,r){var t;for(t=0;t<a.length;++t)if(a[t].test(e)){r=v.redact(r);break}return r}function o(e,r){var o=n(e,r);return o===r?t(o):o}var i=this.options.scrubFields,a=this._getScrubFieldRegexs(i),s=this._getScrubQueryParamRegexs(i);return v.traverse(e,o),e},x._getScrubFieldRegexs=function(e){for(var r,t=[],n=0;n<e.length;++n)r="\\[?(%5[bB])?"+e[n]+"\\[?(%5[bB])?\\]?(%5[dD])?",t.push(new RegExp(r,"i"));return t},x._getScrubQueryParamRegexs=function(e){for(var r,t=[],n=0;n<e.length;++n)r="\\[?(%5[bB])?"+e[n]+"\\[?(%5[bB])?\\]?(%5[dD])?",t.push(new RegExp("("+r+"=)([^&\\n]+)","igm"));return t},x._urlIsWhitelisted=function(e){var r,t,n,o,i,a,s,u,c,l;try{if(r=this.options.hostWhiteList,t=e&&e.data&&e.data.body&&e.data.body.trace,!r||0===r.length)return!0;if(!t)return!0;for(s=r.length,i=t.frames.length,c=0;c<i;c++){if(n=t.frames[c],o=n.filename,!v.isType(o,"string"))return!0;for(l=0;l<s;l++)if(a=r[l],u=new RegExp(a),u.test(o))return!0}}catch(p){return this.configure({hostWhiteList:null}),console.error("[Rollbar]: Error while reading your configuration's hostWhiteList option. Removing custom hostWhiteList.",p),!0}return!1},x._messageIsIgnored=function(e){var r,t,n,o,i,a,s,u,c;try{if(i=!1,n=this.options.ignoredMessages,!n||0===n.length)return!1;if(s=e&&e.data&&e.data.body,u=s&&s.trace&&s.trace.exception&&s.trace.exception.message,c=s&&s.message&&s.message.body,r=u||c,!r)return!1;for(o=n.length,t=0;t<o&&(a=new RegExp(n[t],"gi"),!(i=a.test(r)));t++);}catch(l){this.configure({ignoredMessages:null}),console.error("[Rollbar]: Error while reading your configuration's ignoredMessages option. Removing custom ignoredMessages.")}return i},x._enqueuePayload=function(e,r,t,n){var o={callback:n,accessToken:this.options.accessToken,endpointUrl:this._route("item/"),payload:e},i=function(){if(n){var e="This item was not sent to Rollbar because it was ignored. This can happen if a custom checkIgnore() function was used or if the item's level was less than the notifier' reportLevel. See https://rollbar.com/docs/notifier/rollbar.js/configuration for more details.";n(null,{err:0,result:{id:null,uuid:null,message:e}})}};if(this._internalCheckIgnore(r,t,e))return void i();try{if(v.isType(this.options.checkIgnore,"function")&&this.options.checkIgnore(r,t,e))return void i()}catch(a){this.configure({checkIgnore:null}),console.error("[Rollbar]: Error while calling custom checkIgnore() function. Removing custom checkIgnore().",a)}if(this._urlIsWhitelisted(e)&&!this._messageIsIgnored(e)){if(this.options.verbose){if(e.data&&e.data.body&&e.data.body.trace){var s=e.data.body.trace,c=s.exception.message;console.error("[Rollbar]: ",c)}console.info("[Rollbar]: ",o)}v.isType(this.options.logFunction,"function")&&this.options.logFunction(o);try{v.isType(this.options.transform,"function")&&this.options.transform(e)}catch(a){this.configure({transform:null}),console.error("[Rollbar]: Error while calling custom transform() function. Removing custom transform().",a)}this.options.enabled&&u(o)}},x._internalCheckIgnore=function(e,r,t){var n=r[0],o=s.LEVELS[n]||0,i=s.LEVELS[this.options.reportLevel]||0;if(o<i)return!0;var a=this.options?this.options.plugins:{};if(a&&a.jquery&&a.jquery.ignoreAjaxErrors)try{return!!t.data.body.message.extra.isAjax}catch(u){return!1}return!1},x._log=function(e,r,t,n,o,i,a){var s=null;if(t)try{if(s=t._savedStackTrace?t._savedStackTrace:m.parse(t),t===this.lastError)return;this.lastError=t}catch(u){console.error("[Rollbar]: Error while parsing the error object.",u),r=t.message||t.description||r||String(t),t=null}var c=this._buildPayload(new Date,e,r,s,n);a&&(c.ignoreRateLimit=!0),this._enqueuePayload(c,!!i,[e,r,t,n],o)},x.log=c(),x.debug=c("debug"),x.info=c("info"),x.warn=c("warning"),x.warning=c("warning"),x.error=c("error"),x.critical=c("critical"),x.uncaughtError=o(function(e,r,t,n,o,i){if(i=i||null,o&&v.isType(o,"error"))return void this._log(this.options.uncaughtErrorLevel,e,o,i,null,!0);if(r&&v.isType(r,"error"))return void this._log(this.options.uncaughtErrorLevel,e,r,i,null,!0);var a={url:r||"",line:t};a.func=m.guessFunctionName(a.url,a.line),a.context=m.gatherContext(a.url,a.line);var s={mode:"onerror",message:o?String(o):e||"uncaught exception",url:document.location.href,stack:[a],useragent:navigator.userAgent},u=this._buildPayload(new Date,this.options.uncaughtErrorLevel,e,s,i);this._enqueuePayload(u,!0,[this.options.uncaughtErrorLevel,e,r,t,n,o])}),x.unhandledRejection=o(function(e,r){if(null==e)return void _._log(_.options.uncaughtErrorLevel,"unhandled rejection was null or undefined!",null,{},null,!1,!1);var t=e.message||(e?String(e):"unhandled rejection"),n=e._rollbarContext||r._rollbarContext||null;if(e&&v.isType(e,"error"))return void this._log(this.options.uncaughtErrorLevel,t,e,n,null,!0);var o={url:"",line:0};o.func=m.guessFunctionName(o.url,o.line),o.context=m.gatherContext(o.url,o.line);var i={mode:"unhandledrejection",message:t,url:document.location.href,stack:[o],useragent:navigator.userAgent},a=this._buildPayload(new Date,this.options.uncaughtErrorLevel,t,i,n);this._enqueuePayload(a,!0,[this.options.uncaughtErrorLevel,t,o.url,o.line,0,e,r])}),x.global=o(function(e){e=e||{};var r={startTime:e.startTime,maxItems:e.maxItems,itemsPerMinute:e.itemsPerMinute};g(!0,window._globalRollbarOptions,r),void 0!==e.maxItems&&(T=0),void 0!==e.itemsPerMinute&&(R=0)}),x.configure=o(function(e,r){var t=g(!0,{},e);g(!r,this.options,t),this.global(t)}),x.scope=o(function(e){var r=new s(this);return g(!0,r.options.payload,e),r}),x.wrap=function(e,r){try{var t;if(t=v.isType(r,"function")?r:function(){return r||{}},!v.isType(e,"function"))return e;if(e._isWrap)return e;if(!e._wrapped){e._wrapped=function(){try{return e.apply(this,arguments)}catch(r){throw"string"==typeof r&&(r=new String(r)),r.stack||(r._savedStackTrace=m.parse(r)),r._rollbarContext=t()||{},r._rollbarContext._wrappedSource=e.toString(),window._rollbarWrappedError=r,r}},e._wrapped._isWrap=!0;for(var n in e)e.hasOwnProperty(n)&&(e._wrapped[n]=e[n])}return e._wrapped}catch(o){return e}},x.loadFull=function(){console.error("[Rollbar]: Unexpected Rollbar.loadFull() called on a Notifier instance")},s.processPayloads=function(e){return e?void f():void i()};var L=(new Date).getTime(),T=0,R=0;e.exports={Notifier:s,setupJSON:n,topLevelNotifier:a}},function(e,r){"use strict";var t=Object.prototype.hasOwnProperty,n=Object.prototype.toString,o=function(e){return"function"==typeof Array.isArray?Array.isArray(e):"[object Array]"===n.call(e)},i=function(e){if(!e||"[object Object]"!==n.call(e))return!1;var r=t.call(e,"constructor"),o=e.constructor&&e.constructor.prototype&&t.call(e.constructor.prototype,"isPrototypeOf");if(e.constructor&&!r&&!o)return!1;var i;for(i in e);return"undefined"==typeof i||t.call(e,i)};e.exports=function a(){var e,r,t,n,s,u,c=arguments[0],l=1,p=arguments.length,f=!1;for("boolean"==typeof c?(f=c,c=arguments[1]||{},l=2):("object"!=typeof c&&"function"!=typeof c||null==c)&&(c={});l<p;++l)if(e=arguments[l],null!=e)for(r in e)t=c[r],n=e[r],c!==n&&(f&&n&&(i(n)||(s=o(n)))?(s?(s=!1,u=t&&o(t)?t:[]):u=t&&i(t)?t:{},c[r]=a(f,u,n)):"undefined"!=typeof n&&(c[r]=n));return c}},function(e,r,t){"use strict";function n(){return l}function o(){return null}function i(e){var r={};return r._stackFrame=e,r.url=e.fileName,r.line=e.lineNumber,r.func=e.functionName,r.column=e.columnNumber,r.args=e.args,r.context=o(r.url,r.line),r}function a(e){function r(){var r=[];try{r=c.parse(e)}catch(t){r=[]}for(var n=[],o=0;o<r.length;o++)n.push(new i(r[o]));return n}return{stack:r(),message:e.message,name:e.name}}function s(e){return new a(e)}function u(e){if(!e)return["Unknown error. There was no error message to display.",""];var r=e.match(p),t="(unknown)";return r&&(t=r[r.length-1],e=e.replace((r[r.length-2]||"")+t+":",""),e=e.replace(/(^[\s]+|[\s]+$)/g,"")),[t,e]}var c=t(6),l="?",p=new RegExp("^(([a-zA-Z0-9-_$ ]*): *)?(Uncaught )?([a-zA-Z0-9-_$ ]*): ");e.exports={guessFunctionName:n,guessErrorClass:u,gatherContext:o,parse:s,Stack:a,Frame:i}},function(e,r,t){var n,o,i;!function(a,s){"use strict";o=[t(7)],n=s,i="function"==typeof n?n.apply(r,o):n,!(void 0!==i&&(e.exports=i))}(this,function(e){"use strict";function r(e,r,t){if("function"==typeof Array.prototype.map)return e.map(r,t);for(var n=new Array(e.length),o=0;o<e.length;o++)n[o]=r.call(t,e[o]);return n}function t(e,r,t){if("function"==typeof Array.prototype.filter)return e.filter(r,t);for(var n=[],o=0;o<e.length;o++)r.call(t,e[o])&&n.push(e[o]);return n}var n=/(^|@)\S+\:\d+/,o=/^\s*at .*(\S+\:\d+|\(native\))/m,i=/^(eval@)?(\[native code\])?$/;return{parse:function(e){if("undefined"!=typeof e.stacktrace||"undefined"!=typeof e["opera#sourceloc"])return this.parseOpera(e);if(e.stack&&e.stack.match(o))return this.parseV8OrIE(e);if(e.stack)return this.parseFFOrSafari(e);throw new Error("Cannot parse given Error object")},extractLocation:function(e){if(e.indexOf(":")===-1)return[e];var r=e.replace(/[\(\)\s]/g,"").split(":"),t=r.pop(),n=r[r.length-1];if(!isNaN(parseFloat(n))&&isFinite(n)){var o=r.pop();return[r.join(":"),o,t]}return[r.join(":"),t,void 0]},parseV8OrIE:function(n){var i=t(n.stack.split("\n"),function(e){return!!e.match(o)},this);return r(i,function(r){r.indexOf("(eval ")>-1&&(r=r.replace(/eval code/g,"eval").replace(/(\(eval at [^\()]*)|(\)\,.*$)/g,""));var t=r.replace(/^\s+/,"").replace(/\(eval code/g,"(").split(/\s+/).slice(1),n=this.extractLocation(t.pop()),o=t.join(" ")||void 0,i="eval"===n[0]?void 0:n[0];return new e(o,(void 0),i,n[1],n[2],r)},this)},parseFFOrSafari:function(n){var o=t(n.stack.split("\n"),function(e){return!e.match(i)},this);return r(o,function(r){if(r.indexOf(" > eval")>-1&&(r=r.replace(/ line (\d+)(?: > eval line \d+)* > eval\:\d+\:\d+/g,":$1")),r.indexOf("@")===-1&&r.indexOf(":")===-1)return new e(r);var t=r.split("@"),n=this.extractLocation(t.pop()),o=t.shift()||void 0;return new e(o,(void 0),n[0],n[1],n[2],r)},this)},parseOpera:function(e){return!e.stacktrace||e.message.indexOf("\n")>-1&&e.message.split("\n").length>e.stacktrace.split("\n").length?this.parseOpera9(e):e.stack?this.parseOpera11(e):this.parseOpera10(e)},parseOpera9:function(r){for(var t=/Line (\d+).*script (?:in )?(\S+)/i,n=r.message.split("\n"),o=[],i=2,a=n.length;i<a;i+=2){var s=t.exec(n[i]);s&&o.push(new e((void 0),(void 0),s[2],s[1],(void 0),n[i]))}return o},parseOpera10:function(r){for(var t=/Line (\d+).*script (?:in )?(\S+)(?:: In function (\S+))?$/i,n=r.stacktrace.split("\n"),o=[],i=0,a=n.length;i<a;i+=2){var s=t.exec(n[i]);s&&o.push(new e(s[3]||void 0,(void 0),s[2],s[1],(void 0),n[i]))}return o},parseOpera11:function(o){var i=t(o.stack.split("\n"),function(e){return!!e.match(n)&&!e.match(/^Error created at/)},this);return r(i,function(r){var t,n=r.split("@"),o=this.extractLocation(n.pop()),i=n.shift()||"",a=i.replace(/<anonymous function(: (\w+))?>/,"$2").replace(/\([^\)]*\)/g,"")||void 0;i.match(/\(([^\)]*)\)/)&&(t=i.replace(/^[^\(]+\(([^\)]*)\)$/,"$1"));var s=void 0===t||"[arguments not available]"===t?void 0:t.split(",");return new e(a,s,o[0],o[1],o[2],r)},this)}}})},function(e,r,t){var n,o,i;!function(t,a){"use strict";o=[],n=a,i="function"==typeof n?n.apply(r,o):n,!(void 0!==i&&(e.exports=i))}(this,function(){"use strict";function e(e){return!isNaN(parseFloat(e))&&isFinite(e)}function r(e,r,t,n,o,i){void 0!==e&&this.setFunctionName(e),void 0!==r&&this.setArgs(r),void 0!==t&&this.setFileName(t),void 0!==n&&this.setLineNumber(n),void 0!==o&&this.setColumnNumber(o),void 0!==i&&this.setSource(i)}return r.prototype={getFunctionName:function(){return this.functionName},setFunctionName:function(e){this.functionName=String(e)},getArgs:function(){return this.args},setArgs:function(e){if("[object Array]"!==Object.prototype.toString.call(e))throw new TypeError("Args must be an Array");this.args=e},getFileName:function(){return this.fileName},setFileName:function(e){this.fileName=String(e)},getLineNumber:function(){return this.lineNumber},setLineNumber:function(r){if(!e(r))throw new TypeError("Line Number must be a Number");this.lineNumber=Number(r)},getColumnNumber:function(){return this.columnNumber},setColumnNumber:function(r){if(!e(r))throw new TypeError("Column Number must be a Number");this.columnNumber=Number(r)},getSource:function(){return this.source},setSource:function(e){this.source=String(e)},toString:function(){var r=this.getFunctionName()||"{anonymous}",t="("+(this.getArgs()||[]).join(",")+")",n=this.getFileName()?"@"+this.getFileName():"",o=e(this.getLineNumber())?":"+this.getLineNumber():"",i=e(this.getColumnNumber())?":"+this.getColumnNumber():"";return r+t+n+o+i}},r})},function(e,r,t){"use strict";function n(e){return{}.toString.call(e).match(/\s([a-zA-Z]+)/)[1].toLowerCase()}function o(e,r){return n(e)===r}function i(e){if(!o(e,"string"))throw new Error("received invalid input");for(var r=l,t=r.parser[r.strictMode?"strict":"loose"].exec(e),n={},i=14;i--;)n[r.key[i]]=t[i]||"";return n[r.q.name]={},n[r.key[12]].replace(r.q.parser,function(e,t,o){t&&(n[r.q.name][t]=o)}),n}function a(e){var r=i(e);return""===r.anchor&&(r.source=r.source.replace("#","")),e=r.source.replace("?"+r.query,"")}function s(e,r){var t,n,i,a=o(e,"object"),u=o(e,"array"),c=[];if(a)for(t in e)e.hasOwnProperty(t)&&c.push(t);else if(u)for(i=0;i<e.length;++i)c.push(i);for(i=0;i<c.length;++i)t=c[i],n=e[t],a=o(n,"object"),u=o(n,"array"),a||u?e[t]=s(n,r):e[t]=r(t,n);return e}function u(e){return e=String(e),new Array(e.length+1).join("*")}function c(){var e=(new Date).getTime(),r="xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(r){var t=(e+16*Math.random())%16|0;return e=Math.floor(e/16),("x"===r?t:7&t|8).toString(16)});return r}t(9);var l={strictMode:!1,key:["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],q:{name:"queryKey",parser:/(?:^|&)([^&=]*)=?([^&]*)/g},parser:{strict:/^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,loose:/^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/}},p={isType:o,parseUri:i,parseUriOptions:l,redact:u,sanitizeUrl:a,traverse:s,typeName:n,uuid4:c};e.exports=p},function(e,r){!function(e){"use strict";e.console=e.console||{};for(var r,t,n=e.console,o={},i=function(){},a="memory".split(","),s="assert,clear,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,markTimeline,profile,profiles,profileEnd,show,table,time,timeEnd,timeline,timelineEnd,timeStamp,trace,warn".split(",");r=a.pop();)n[r]||(n[r]=o);for(;t=s.pop();)n[t]||(n[t]=i)}("undefined"==typeof window?this:window)},function(e,r,t){"use strict";function n(e){a=e}function o(e){this.name="Connection Error",this.message=e,this.stack=(new Error).stack}var i=t(8),a=null;o.prototype=Object.create(Error.prototype),o.prototype.constructor=o;var s={XMLHttpFactories:[function(){return new XMLHttpRequest},function(){return new ActiveXObject("Msxml2.XMLHTTP")},function(){return new ActiveXObject("Msxml3.XMLHTTP")},function(){return new ActiveXObject("Microsoft.XMLHTTP")}],createXMLHTTPObject:function(){var e,r=!1,t=s.XMLHttpFactories,n=t.length;for(e=0;e<n;e++)try{r=t[e]();break}catch(o){}return r},post:function(e,r,t,n){if(!i.isType(t,"object"))throw new Error("Expected an object to POST");t=a.stringify(t),n=n||function(){};var u=s.createXMLHTTPObject();if(u)try{try{var c=function(){try{if(c&&4===u.readyState){c=void 0;var e=a.parse(u.responseText);200===u.status?n(null,e):i.isType(u.status,"number")&&u.status>=400&&u.status<600?(403==u.status&&console.error("[Rollbar]:"+e.message),n(new Error(String(u.status)))):n(new o("XHR response had no status code (likely connection failure)"))}}catch(r){var t;t=r&&r.stack?r:new Error(r),n(t)}};u.open("POST",e,!0),u.setRequestHeader&&(u.setRequestHeader("Content-Type","application/json"),u.setRequestHeader("X-Rollbar-Access-Token",r)),u.onreadystatechange=c,u.send(t)}catch(l){if("undefined"!=typeof XDomainRequest){"http:"===window.location.href.substring(0,5)&&"https"===e.substring(0,5)&&(e="http"+e.substring(5));var p=function(){n(new o("Request timed out"))},f=function(){n(new Error("Error during request"))},d=function(){n(null,a.parse(u.responseText))};u=new XDomainRequest,u.onprogress=function(){},u.ontimeout=p,u.onerror=f,u.onload=d,u.open("POST",e,!0),u.send(t)}}}catch(h){n(h)}}};e.exports={XHR:s,setupJSON:n,ConnectionError:o}}])});
},{}],41:[function(require,module,exports){
var OpenLayers = require("./OpenLayers.js");
console.log(OpenLayers);
/**
 * Class: OpenLayers.Control.UndoRedo
 * Instance of this class can be used to undo and redo vector edits.
 */
 
module.exports = OpenLayers.Class(OpenLayers.Control, {
	/**
	 * APIProperty: currentEditIndex
	 * {integer} - sequence number for editing the feature[s] 
	 */
	currentEditIndex: 0,
	/**
	 * Property: undoFeatures
	 * {array} - stack of the edit features
	 */
	undoFeatures: [],
	/**
	 * Property: redoFeatures
	 * {array} - stack of the undo features
	 */
	redoFeatures: [],
	/**
	 * Property: isEditMulty
	 * {boolean} - true if in one action multiple features are edited 
	 */
	isEditMulty: false,
	
	/**
	 * constructor: UndoRedo
	 * Parameters:
	 * layers - array of {<OpenLayers.Layers.Vector>}
	 */
	initialize: function (layers) {
        console.log('initialize', this, layers);
		if (!(layers instanceof Array)) {
			layers = [layers];
		}
		for(var i = 0; i < layers.length; i++) {
            console.log('registering handlers');
            layers[i].events.register("sketchstarted", this, this.onSketchStarted);
			layers[i].events.register("featureadded", this, this.onInsert);
            layers[i].events.register("beforefeatureremoved", this, this.onDelete);
            layers[i].events.register("beforefeaturemodified", this, this.onUpdate);
            layers[i].events.register("afterfeaturemodified", this, this.onUpdateCompleted);
		}
	},
    
	/**
	 * Method: onEdit
	 * on any edit operation performed this has to be triggered
	 * i.e. on insert, delete, update 
	 * Parameters: 
	 * feature - {<OpenLayers.Feature.Vector>}
	 * editType - {string} edit type done "Insert","Delete","Update"
	 * component - {string} layer or any other identifier
	 * Returns: 
	 */	 
	onEdit: function (feature, editType, component) {
		console.log("Updating undo stack as there is - " + editType, feature, component);
		if (component == undefined) {
			component = feature.layer.name;
		}
		if (this.undoFeatures[this.currentEditIndex] == undefined) {
			this.undoFeatures[this.currentEditIndex] = {};
			this.undoFeatures[this.currentEditIndex][component] = {"Insert": [], "Update": [], "Delete": []};
		}
		if (feature.fid == undefined) {
			feature.fid = feature.id;
		}	
		this.undoFeatures[this.currentEditIndex][component][editType].push(feature);
		this.redoFeatures.splice(0, this.redoFeatures.length);
	},
	
	/** 
	 * Method: onSketchStarted
	 * event handler for sketchstarted
	 */
	onSketchStarted: function (event) {
		this.increaseEditIndex();
		console.log("currentEditIndex: " + this.currentEditIndex);
		return true;
	},
	
	/**
	 * Method: onInsert
	 * event handler for featureadded 
	 */
	onInsert: function (event) {	
		var feature = event.feature.clone();
		if (event.feature.fid == undefined) {
			event.feature.fid = event.feature.id;
		}
		feature.fid = event.feature.fid;
		feature.state = event.feature.state;
		feature.layer = event.feature.layer;
		this.onEdit(feature, "Insert", feature.layer.name);
        return true;
	},
	
	/**
	 * Method: onDelete
	 * event handler for beforefeatureremoved 
	 */
	onDelete: function (event) {
        this.increaseEditIndex();
		this.onEdit(event.feature, "Delete", event.feature.layer.name);
        return true;
	},
	
	/**
	 * Method: onUpdate
	 * event handler for beforefeaturemodified
	 */
	onUpdate: function (event) {
        this.increaseEditIndex();
		console.log("old feature geometry: ", event.feature.geometry);
		var feature = event.feature.clone();
		feature.fid = event.feature.fid;
		feature.state = event.feature.state;
		feature.layer = event.feature.layer;
		this.onEdit(feature, "Update", feature.layer.name);
	},
	
	/**
	 * Method: onUpdateCompleted
	 * event handler for afterfeaturemodified
	 */
	onUpdateCompleted: function (event) {
        console.log("onUpdateCompleted", event.modified);
        if (!event.modified) {
            this.getUndoData();
        }
	},
	
	/**
	 * Method: increaseEditIndex
	 * increase the editIndex
	 */
	increaseEditIndex: function () {
		if (this.currentEditIndex < this.undoFeatures.length ) {
        	this.currentEditIndex += 1;
        }
	},
	
	/**
	 * Method: getUndoData
	 * returns the last edited data
	 */ 
	getUndoData: function () {
		var data = this.undoFeatures.pop();
        if (data) {
            this.currentEditIndex -= 1;
        }
		return data;
	},
	
	/**
     * Method: getRedoData
	 * returns the last redo data
	 */
	getRedoData: function() {
		var data = this.redoFeatures.pop();
        if (data) {
            this.currentEditIndex += 1;
        }
		return data;
	},
	
	/**
	 * APIMethod: resetEditIndex
	 * reset the editIndex to 0 and empty both undo and redo stack
	 */
	resetEditIndex: function () {
		this.currentEditIndex = 0;
		this.undoFeatures.splice(0, this.undoFeatures.length);
		this.redoFeatures.splice(0, this.redoFeatures.length);
	},
	
	/**
	 * APIMethod: undo
	 * perform undo operation 
	 */
	undo: function () {	
		var data = this.getUndoData();
		console.log("undo data :", data);
        if (data) {
            for (var component in data) {
                console.log("component: " + component);
                var layer = this.map.getLayersByName(component)[0];
                console.log("got layer, name: " + layer.name);
                for (var editType in data[component]) {
                    console.log("editType : " + editType);
                    for (var i = 0; i < data[component][editType].length;i++) {
                        var feature = data[component][editType][i];
                        console.log("features before undo: " + layer.features.length, feature);
                        switch (editType) {
                            case "Insert":
                                //layer.drawFeature(feature, {display : "none"});
                                var insertedFeature = layer.getFeatureByFid(feature.fid);
                                console.log("undo Insert", insertedFeature, feature, feature.fid);
                                layer.eraseFeatures(insertedFeature);
                                console.log('after erase', insertedFeature, layer.features.length);
                                OpenLayers.Util.removeItem(layer.features, insertedFeature);
                                console.log('OpenLayers.Util.removeItem', insertedFeature, layer.features.length);
                                break;
                            case "Delete":
                                console.log("undo Delete", feature);
                                // layer.features.push(feature);
                                // layer.drawFeature(feature);
                                layer.addFeatures([feature], {silent: true});
                                break;
                            case "Update":
                                console.log("undo Update");
                                var updatedFeature = layer.getFeatureByFid(feature.fid);
                                console.log("old feature geometry: ", feature.geometry);
                                console.log("updated feature geometry: ", updatedFeature.geometry);
                                //layer.drawFeature(updatedFeature, {display : "none"});
                                layer.eraseFeatures(updatedFeature);
                                OpenLayers.Util.removeItem(layer.features, updatedFeature);						
                                //layer.removeFeatures(updatedFeature);
                                console.log("old feature geometry: " + feature.geometry);
                                //layer.features.push(feature);
                                //layer.drawFeature(feature);
                                layer.addFeatures([feature], {silent: true});
                                data[component][editType][i] = updatedFeature;
                                break;
                            default:
                                console.log("unknown");
                                break;				
                        }
                        console.log("features after undo: " + layer.features.length, feature);
                    }
                }
            }
            this.redoFeatures.push(data);
        }
	},
	
	/**
	 * APIMethod:  redo
	 * perform redo operation
	 */
	redo: function () {
		var data = this.getRedoData();
        console.log("redo data :", data);
        if (data) {
            for (var component in data) {
                console.log("component: " + component);
                var layer = this.map.getLayersByName(component)[0];
                console.log("got layer, name: " + layer.name);
                for (var editType in data[component]) {
                    console.log("editType : " + editType);
                    for (var i = 0; i < data[component][editType].length; i++) {
                        var feature = data[component][editType][i];
                        console.log("features before redo: " + layer.features.length);	
                        switch (editType) {
                            case "Insert":
                                console.log("redo Insert", feature);
                                // layer.features.push(feature);
                                // layer.drawFeature(feature);
                                layer.addFeatures([feature], {silent: true});
                                break;
                            case "Delete":
                                console.log("redo Delete");
                                var deleteFeature = layer.getFeatureByFid(feature.fid)
                                layer.eraseFeatures(deleteFeature);
                                OpenLayers.Util.removeItem(layer.features, deleteFeature);	
                                break;
                            case "Update":
                                console.log("redo Update");
                                var oldFeature = layer.getFeatureByFid(feature.fid);
                                console.log("old feature id: " + oldFeature.id);
                                layer.eraseFeatures(oldFeature);
                                OpenLayers.Util.removeItem(layer.features, oldFeature);
                                console.log("updated feature id: " + oldFeature.id);
                                //layer.features.push(feature);
                                //layer.drawFeature(feature);
                                layer.addFeatures([feature], {silent: true});
                                data[component][editType][i] = oldFeature;
                                break;
                            default:
                                break; 
                        }
                    }
                }
            }
            this.undoFeatures.push(data);
        }
	},

	CLASS_NAME : "OpenLayers.Control.UndoRedo"
});
},{"./OpenLayers.js":42}],42:[function(require,module,exports){
(function (global){
/*

  OpenLayers.js -- OpenLayers Map Viewer Library

  Copyright (c) 2006-2015 by OpenLayers Contributors
  Published under the 2-clause BSD license.
  See https://raw.githubusercontent.com/openlayers/ol2/master/license.txt for the full text of the license, and https://raw.githubusercontent.com/openlayers/ol2/master/authors.txt for full list of contributors.

  Includes compressed code under the following licenses:

  (For uncompressed versions of the code used, please see the
  OpenLayers Github repository: <https://github.com/openlayers/ol2>)

*/

/**
 * Contains XMLHttpRequest.js <http://code.google.com/p/xmlhttprequest/>
 * Copyright 2007 Sergey Ilinsky (http://www.ilinsky.com)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 */

/**
 * OpenLayers.Util.pagePosition is based on Yahoo's getXY method, which is
 * Copyright (c) 2006, Yahoo! Inc.
 * All rights reserved.
 *
 * Redistribution and use of this software in source and binary forms, with or
 * without modification, are permitted provided that the following conditions
 * are met:
 *
 * * Redistributions of source code must retain the above copyright notice,
 *   this list of conditions and the following disclaimer.
 *
 * * Redistributions in binary form must reproduce the above copyright notice,
 *   this list of conditions and the following disclaimer in the documentation
 *   and/or other materials provided with the distribution.
 *
 * * Neither the name of Yahoo! Inc. nor the names of its contributors may be
 *   used to endorse or promote products derived from this software without
 *   specific prior written permission of Yahoo! Inc.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */
var $jscomp={scope:{}};$jscomp.defineProperty="function"==typeof Object.defineProperties?Object.defineProperty:function(a,b,c){if(c.get||c.set)throw new TypeError("ES3 does not support getters and setters.");a!=Array.prototype&&a!=Object.prototype&&(a[b]=c.value)};$jscomp.getGlobal=function(a){return"undefined"!=typeof window&&window===a?a:"undefined"!=typeof global&&null!=global?global:a};$jscomp.global=$jscomp.getGlobal(this);
$jscomp.polyfill=function(a,b,c,d){if(b){c=$jscomp.global;a=a.split(".");for(d=0;d<a.length-1;d++){var e=a[d];e in c||(c[e]={});c=c[e]}a=a[a.length-1];d=c[a];b=b(d);b!=d&&null!=b&&$jscomp.defineProperty(c,a,{configurable:!0,writable:!0,value:b})}};$jscomp.polyfill("Array.prototype.fill",function(a){return a?a:function(a,c,d){var b=this.length||0;0>c&&(c=Math.max(0,b+c));if(null==d||d>b)d=b;d=Number(d);0>d&&(d=Math.max(0,b+d));for(c=Number(c||0);c<d;c++)this[c]=a;return this}},"es6-impl","es3");
$jscomp.checkStringArgs=function(a,b,c){if(null==a)throw new TypeError("The 'this' value for String.prototype."+c+" must not be null or undefined");if(b instanceof RegExp)throw new TypeError("First argument to String.prototype."+c+" must not be a regular expression");return a+""};
$jscomp.polyfill("String.prototype.startsWith",function(a){return a?a:function(a,c){var b=$jscomp.checkStringArgs(this,a,"startsWith");a+="";for(var e=b.length,f=a.length,g=Math.max(0,Math.min(c|0,b.length)),h=0;h<f&&g<e;)if(b[g++]!=a[h++])return!1;return h>=f}},"es6-impl","es3");
var OpenLayers={VERSION_NUMBER:"Release 2.14 dev",singleFile:!0,_getScriptLocation:function(){for(var a=/(^|(.*?\/))(OpenLayers[^\/]*?\.js)(\?|$)/,b=document.getElementsByTagName("script"),c,d="",e=0,f=b.length;e<f;e++)if(c=b[e].getAttribute("src"))if(c=c.match(a)){d=c[1];break}return function(){return d}}(),ImgPath:""};OpenLayers.Class=function(){var a=arguments.length,b=arguments[0],c=arguments[a-1],d="function"==typeof c.initialize?c.initialize:function(){b.prototype.initialize.apply(this,arguments)};1<a?(a=[d,b].concat(Array.prototype.slice.call(arguments).slice(1,a-1),c),OpenLayers.inherit.apply(null,a)):d.prototype=c;return d};
OpenLayers.inherit=function(a,b){var c=function(){};c.prototype=b.prototype;a.prototype=new c;var d,e,c=2;for(d=arguments.length;c<d;c++)e=arguments[c],"function"===typeof e&&(e=e.prototype),OpenLayers.Util.extend(a.prototype,e)};OpenLayers.Util=OpenLayers.Util||{};OpenLayers.Util.extend=function(a,b){a=a||{};if(b){for(var c in b){var d=b[c];void 0!==d&&(a[c]=d)}"function"==typeof window.Event&&b instanceof window.Event||!b.hasOwnProperty||!b.hasOwnProperty("toString")||(a.toString=b.toString)}return a};OpenLayers.String={startsWith:function(a,b){return 0==a.indexOf(b)},contains:function(a,b){return-1!=a.indexOf(b)},trim:function(a){return a.replace(/^\s\s*/,"").replace(/\s\s*$/,"")},camelize:function(a){a=a.split("-");for(var b=a[0],c=1,d=a.length;c<d;c++)var e=a[c],b=b+(e.charAt(0).toUpperCase()+e.substring(1));return b},format:function(a,b,c){b||(b=window);return a.replace(OpenLayers.String.tokenRegEx,function(a,e){for(var d,g=e.split(/\.+/),h=0;h<g.length;h++){0==h&&(d=b);if(void 0===d)break;
d=d[g[h]]}"function"==typeof d&&(d=c?d.apply(null,c):d());return"undefined"==typeof d?"undefined":d})},tokenRegEx:/\$\{([\w.]+?)\}/g,numberRegEx:/^([+-]?)(?=\d|\.\d)\d*(\.\d*)?([Ee]([+-]?\d+))?$/,isNumeric:function(a){return OpenLayers.String.numberRegEx.test(a)},numericIf:function(a,b){var c=a;!0===b&&null!=a&&a.replace&&(a=a.replace(/^\s*|\s*$/g,""));return OpenLayers.String.isNumeric(a)?parseFloat(a):c}};
OpenLayers.Number={decimalSeparator:".",thousandsSeparator:",",limitSigDigs:function(a,b){var c=0;0<b&&(c=parseFloat(a.toPrecision(b)));return c},format:function(a,b,c,d){b="undefined"!=typeof b?b:0;c="undefined"!=typeof c?c:OpenLayers.Number.thousandsSeparator;d="undefined"!=typeof d?d:OpenLayers.Number.decimalSeparator;null!=b&&(a=parseFloat(a.toFixed(b)));var e=a.toString().split(".");1==e.length&&null==b&&(b=0);a=e[0];if(c)for(var f=/(-?[0-9]+)([0-9]{3})/;f.test(a);)a=a.replace(f,"$1"+c+"$2");
0==b?b=a:(c=1<e.length?e[1]:"0",null!=b&&(c+=Array(b-c.length+1).join("0")),b=a+d+c);return b},zeroPad:function(a,b,c){for(a=a.toString(c||10);a.length<b;)a="0"+a;return a}};OpenLayers.Function={bind:function(a,b){var c=Array.prototype.slice.call(arguments,2);return function(){var d=c.concat(Array.prototype.slice.call(arguments,0));return a.apply(b,d)}},bindAsEventListener:function(a,b){return function(c){return a.call(b,c||window.event)}},False:function(){return!1},True:function(){return!0},Void:function(){}};
OpenLayers.Array={filter:function(a,b,c){var d=[];if(Array.prototype.filter)d=a.filter(b,c);else{var e=a.length;if("function"!=typeof b)throw new TypeError;for(var f=0;f<e;f++)if(f in a){var g=a[f];b.call(c,g,f,a)&&d.push(g)}}return d}};OpenLayers.Bounds=OpenLayers.Class({left:null,bottom:null,right:null,top:null,centerLonLat:null,initialize:function(a,b,c,d){OpenLayers.Util.isArray(a)&&(d=a[3],c=a[2],b=a[1],a=a[0]);null!=a&&(this.left=OpenLayers.Util.toFloat(a));null!=b&&(this.bottom=OpenLayers.Util.toFloat(b));null!=c&&(this.right=OpenLayers.Util.toFloat(c));null!=d&&(this.top=OpenLayers.Util.toFloat(d))},clone:function(){return new OpenLayers.Bounds(this.left,this.bottom,this.right,this.top)},equals:function(a){var b=!1;null!=
a&&(b=this.left==a.left&&this.right==a.right&&this.top==a.top&&this.bottom==a.bottom);return b},toString:function(){return[this.left,this.bottom,this.right,this.top].join()},toArray:function(a){return!0===a?[this.bottom,this.left,this.top,this.right]:[this.left,this.bottom,this.right,this.top]},toBBOX:function(a,b){null==a&&(a=6);var c=Math.pow(10,a),d=Math.round(this.left*c)/c,e=Math.round(this.bottom*c)/c,f=Math.round(this.right*c)/c,c=Math.round(this.top*c)/c;return!0===b?e+","+d+","+c+","+f:d+
","+e+","+f+","+c},toGeometry:function(){return new OpenLayers.Geometry.Polygon([new OpenLayers.Geometry.LinearRing([new OpenLayers.Geometry.Point(this.left,this.bottom),new OpenLayers.Geometry.Point(this.right,this.bottom),new OpenLayers.Geometry.Point(this.right,this.top),new OpenLayers.Geometry.Point(this.left,this.top)])])},getWidth:function(){return this.right-this.left},getHeight:function(){return this.top-this.bottom},getSize:function(){return new OpenLayers.Size(this.getWidth(),this.getHeight())},
getCenterPixel:function(){return new OpenLayers.Pixel((this.left+this.right)/2,(this.bottom+this.top)/2)},getCenterLonLat:function(){this.centerLonLat||(this.centerLonLat=new OpenLayers.LonLat((this.left+this.right)/2,(this.bottom+this.top)/2));return this.centerLonLat},scale:function(a,b){null==b&&(b=this.getCenterLonLat());var c,d;"OpenLayers.LonLat"==b.CLASS_NAME?(c=b.lon,d=b.lat):(c=b.x,d=b.y);return new OpenLayers.Bounds((this.left-c)*a+c,(this.bottom-d)*a+d,(this.right-c)*a+c,(this.top-d)*a+
d)},add:function(a,b){if(null==a||null==b)throw new TypeError("Bounds.add cannot receive null values");return new OpenLayers.Bounds(this.left+a,this.bottom+b,this.right+a,this.top+b)},extend:function(a){if(a)switch(a.CLASS_NAME){case "OpenLayers.LonLat":this.extendXY(a.lon,a.lat);break;case "OpenLayers.Geometry.Point":this.extendXY(a.x,a.y);break;case "OpenLayers.Bounds":this.centerLonLat=null;if(null==this.left||a.left<this.left)this.left=a.left;if(null==this.bottom||a.bottom<this.bottom)this.bottom=
a.bottom;if(null==this.right||a.right>this.right)this.right=a.right;if(null==this.top||a.top>this.top)this.top=a.top}},extendXY:function(a,b){this.centerLonLat=null;if(null==this.left||a<this.left)this.left=a;if(null==this.bottom||b<this.bottom)this.bottom=b;if(null==this.right||a>this.right)this.right=a;if(null==this.top||b>this.top)this.top=b},containsLonLat:function(a,b){"boolean"===typeof b&&(b={inclusive:b});b=b||{};var c=this.contains(a.lon,a.lat,b.inclusive),d=b.worldBounds;d&&!c&&(c=d.getWidth(),
c=this.containsLonLat({lon:a.lon-Math.round((a.lon-(d.left+d.right)/2)/c)*c,lat:a.lat},{inclusive:b.inclusive}));return c},containsPixel:function(a,b){return this.contains(a.x,a.y,b)},contains:function(a,b,c){null==c&&(c=!0);if(null==a||null==b)return!1;a=OpenLayers.Util.toFloat(a);b=OpenLayers.Util.toFloat(b);return c?a>=this.left&&a<=this.right&&b>=this.bottom&&b<=this.top:a>this.left&&a<this.right&&b>this.bottom&&b<this.top},intersectsBounds:function(a,b){"boolean"===typeof b&&(b={inclusive:b});
b=b||{};if(b.worldBounds){var c=this.wrapDateLine(b.worldBounds);a=a.wrapDateLine(b.worldBounds)}else c=this;null==b.inclusive&&(b.inclusive=!0);var d=!1,e=c.left==a.right||c.right==a.left||c.top==a.bottom||c.bottom==a.top;if(b.inclusive||!e)var d=a.top>=c.bottom&&a.top<=c.top||c.top>a.bottom&&c.top<a.top,e=a.left>=c.left&&a.left<=c.right||c.left>=a.left&&c.left<=a.right,f=a.right>=c.left&&a.right<=c.right||c.right>=a.left&&c.right<=a.right,d=(a.bottom>=c.bottom&&a.bottom<=c.top||c.bottom>=a.bottom&&
c.bottom<=a.top||d)&&(e||f);if(b.worldBounds&&!d){var g=b.worldBounds,e=g.getWidth(),f=!g.containsBounds(c),g=!g.containsBounds(a);f&&!g?(a=a.add(-e,0),d=c.intersectsBounds(a,{inclusive:b.inclusive})):g&&!f&&(c=c.add(-e,0),d=a.intersectsBounds(c,{inclusive:b.inclusive}))}return d},containsBounds:function(a,b,c){null==b&&(b=!1);null==c&&(c=!0);var d=this.contains(a.left,a.bottom,c),e=this.contains(a.right,a.bottom,c),f=this.contains(a.left,a.top,c);a=this.contains(a.right,a.top,c);return b?d||e||f||
a:d&&e&&f&&a},determineQuadrant:function(a){var b="",c=this.getCenterLonLat(),b=b+(a.lat<c.lat?"b":"t");return b+=a.lon<c.lon?"l":"r"},transform:function(a,b){this.centerLonLat=null;var c=OpenLayers.Projection.transform({x:this.left,y:this.bottom},a,b),d=OpenLayers.Projection.transform({x:this.right,y:this.bottom},a,b),e=OpenLayers.Projection.transform({x:this.left,y:this.top},a,b),f=OpenLayers.Projection.transform({x:this.right,y:this.top},a,b);this.left=Math.min(c.x,e.x);this.bottom=Math.min(c.y,
d.y);this.right=Math.max(d.x,f.x);this.top=Math.max(e.y,f.y);return this},wrapDateLine:function(a,b){b=b||{};var c=b.leftTolerance||0,d=b.rightTolerance||0,e=this.clone();if(a){for(var f=a.getWidth();e.left<a.left&&e.right-d<=a.left;)e=e.add(f,0);for(;e.left+c>=a.right&&e.right>a.right;)e=e.add(-f,0);c=e.left+c;c<a.right&&c>a.left&&e.right-d>a.right&&(e=e.add(-f,0))}return e},CLASS_NAME:"OpenLayers.Bounds"});
OpenLayers.Bounds.fromString=function(a,b){var c=a.split(",");return OpenLayers.Bounds.fromArray(c,b)};OpenLayers.Bounds.fromArray=function(a,b){return!0===b?new OpenLayers.Bounds(a[1],a[0],a[3],a[2]):new OpenLayers.Bounds(a[0],a[1],a[2],a[3])};OpenLayers.Bounds.fromSize=function(a){return new OpenLayers.Bounds(0,a.h,a.w,0)};OpenLayers.Bounds.oppositeQuadrant=function(a){var b;b=""+("t"==a.charAt(0)?"b":"t");return b+="l"==a.charAt(1)?"r":"l"};OpenLayers.Element={visible:function(a){return"none"!=OpenLayers.Util.getElement(a).style.display},toggle:function(){for(var a=0,b=arguments.length;a<b;a++){var c=OpenLayers.Util.getElement(arguments[a]),d=OpenLayers.Element.visible(c)?"none":"";c.style.display=d}},remove:function(a){a=OpenLayers.Util.getElement(a);a.parentNode.removeChild(a)},getHeight:function(a){a=OpenLayers.Util.getElement(a);return a.offsetHeight},hasClass:function(a,b){var c=a.className;return!!c&&(new RegExp("(^|\\s)"+b+"(\\s|$)")).test(c)},
addClass:function(a,b){OpenLayers.Element.hasClass(a,b)||(a.className+=(a.className?" ":"")+b);return a},removeClass:function(a,b){var c=a.className;c&&(a.className=OpenLayers.String.trim(c.replace(new RegExp("(^|\\s+)"+b+"(\\s+|$)")," ")));return a},toggleClass:function(a,b){OpenLayers.Element.hasClass(a,b)?OpenLayers.Element.removeClass(a,b):OpenLayers.Element.addClass(a,b);return a},getStyle:function(a,b){a=OpenLayers.Util.getElement(a);var c=null;if(a&&a.style){c=a.style[OpenLayers.String.camelize(b)];
c||(document.defaultView&&document.defaultView.getComputedStyle?c=(c=document.defaultView.getComputedStyle(a,null))?c.getPropertyValue(b):null:a.currentStyle&&(c=a.currentStyle[OpenLayers.String.camelize(b)]));var d=["left","top","right","bottom"];window.opera&&-1!=OpenLayers.Util.indexOf(d,b)&&"static"==OpenLayers.Element.getStyle(a,"position")&&(c="auto")}return"auto"==c?null:c}};OpenLayers.LonLat=OpenLayers.Class({lon:0,lat:0,initialize:function(a,b){OpenLayers.Util.isArray(a)&&(b=a[1],a=a[0]);this.lon=OpenLayers.Util.toFloat(a);this.lat=OpenLayers.Util.toFloat(b)},toString:function(){return"lon="+this.lon+",lat="+this.lat},toShortString:function(){return this.lon+", "+this.lat},clone:function(){return new OpenLayers.LonLat(this.lon,this.lat)},add:function(a,b){if(null==a||null==b)throw new TypeError("LonLat.add cannot receive null values");return new OpenLayers.LonLat(this.lon+
OpenLayers.Util.toFloat(a),this.lat+OpenLayers.Util.toFloat(b))},equals:function(a){var b=!1;null!=a&&(b=this.lon==a.lon&&this.lat==a.lat||isNaN(this.lon)&&isNaN(this.lat)&&isNaN(a.lon)&&isNaN(a.lat));return b},transform:function(a,b){var c=OpenLayers.Projection.transform({x:this.lon,y:this.lat},a,b);this.lon=c.x;this.lat=c.y;return this},wrapDateLine:function(a){var b=this.clone();if(a){for(;b.lon<a.left;)b.lon+=a.getWidth();for(;b.lon>a.right;)b.lon-=a.getWidth()}return b},CLASS_NAME:"OpenLayers.LonLat"});
OpenLayers.LonLat.fromString=function(a){a=a.split(",");return new OpenLayers.LonLat(a[0],a[1])};OpenLayers.LonLat.fromArray=function(a){var b=OpenLayers.Util.isArray(a);return new OpenLayers.LonLat(b&&a[0],b&&a[1])};OpenLayers.Pixel=OpenLayers.Class({x:0,y:0,initialize:function(a,b){this.x=parseFloat(a);this.y=parseFloat(b)},toString:function(){return"x="+this.x+",y="+this.y},clone:function(){return new OpenLayers.Pixel(this.x,this.y)},equals:function(a){var b=!1;null!=a&&(b=this.x==a.x&&this.y==a.y||isNaN(this.x)&&isNaN(this.y)&&isNaN(a.x)&&isNaN(a.y));return b},distanceTo:function(a){return Math.sqrt(Math.pow(this.x-a.x,2)+Math.pow(this.y-a.y,2))},add:function(a,b){if(null==a||null==b)throw new TypeError("Pixel.add cannot receive null values");
return new OpenLayers.Pixel(this.x+a,this.y+b)},offset:function(a){var b=this.clone();a&&(b=this.add(a.x,a.y));return b},CLASS_NAME:"OpenLayers.Pixel"});OpenLayers.Size=OpenLayers.Class({w:0,h:0,initialize:function(a,b){this.w=parseFloat(a);this.h=parseFloat(b)},toString:function(){return"w="+this.w+",h="+this.h},clone:function(){return new OpenLayers.Size(this.w,this.h)},equals:function(a){var b=!1;null!=a&&(b=this.w==a.w&&this.h==a.h||isNaN(this.w)&&isNaN(this.h)&&isNaN(a.w)&&isNaN(a.h));return b},CLASS_NAME:"OpenLayers.Size"});OpenLayers.Console={log:function(){},debug:function(){},info:function(){},warn:function(){},error:function(){},userError:function(a){alert(a)},assert:function(){},dir:function(){},dirxml:function(){},trace:function(){},group:function(){},groupEnd:function(){},time:function(){},timeEnd:function(){},profile:function(){},profileEnd:function(){},count:function(){},CLASS_NAME:"OpenLayers.Console"};
(function(){for(var a=document.getElementsByTagName("script"),b=0,c=a.length;b<c;++b)if(-1!=a[b].src.indexOf("firebug.js")&&console){OpenLayers.Util.extend(OpenLayers.Console,console);break}})();OpenLayers.Lang={code:null,defaultCode:"en",getCode:function(){OpenLayers.Lang.code||OpenLayers.Lang.setCode();return OpenLayers.Lang.code},setCode:function(a){var b;a||(a="msie"==OpenLayers.BROWSER_NAME?navigator.userLanguage:navigator.language);a=a.split("-");a[0]=a[0].toLowerCase();"object"==typeof OpenLayers.Lang[a[0]]&&(b=a[0]);if(a[1]){var c=a[0]+"-"+a[1].toUpperCase();"object"==typeof OpenLayers.Lang[c]&&(b=c)}b||(OpenLayers.Console.warn("Failed to find OpenLayers.Lang."+a.join("-")+" dictionary, falling back to default language"),
b=OpenLayers.Lang.defaultCode);OpenLayers.Lang.code=b},translate:function(a,b){var c=OpenLayers.Lang[OpenLayers.Lang.getCode()];(c=c&&c[a])||(c=a);b&&(c=OpenLayers.String.format(c,b));return c}};OpenLayers.i18n=OpenLayers.Lang.translate;OpenLayers.Util=OpenLayers.Util||{};OpenLayers.Util.getElement=function(){for(var a=[],b=0,c=arguments.length;b<c;b++){var d=arguments[b];"string"==typeof d&&(d=document.getElementById(d));if(1==arguments.length)return d;a.push(d)}return a};OpenLayers.Util.isElement=function(a){return!(!a||1!==a.nodeType)};OpenLayers.Util.isArray=function(a){return"[object Array]"===Object.prototype.toString.call(a)};OpenLayers.Util.removeItem=function(a,b){for(var c=a.length-1;0<=c;c--)a[c]==b&&a.splice(c,1);return a};
OpenLayers.Util.indexOf=function(a,b){if("function"==typeof a.indexOf)return a.indexOf(b);for(var c=0,d=a.length;c<d;c++)if(a[c]==b)return c;return-1};OpenLayers.Util.dotless=/\./g;
OpenLayers.Util.modifyDOMElement=function(a,b,c,d,e,f,g,h){b&&(a.id=b.replace(OpenLayers.Util.dotless,"_"));c&&(a.style.left=c.x+"px",a.style.top=c.y+"px");d&&(a.style.width=d.w+"px",a.style.height=d.h+"px");e&&(a.style.position=e);f&&(a.style.border=f);g&&(a.style.overflow=g);0<=parseFloat(h)&&1>parseFloat(h)?(a.style.filter="alpha(opacity="+100*h+")",a.style.opacity=h):1==parseFloat(h)&&(a.style.filter="",a.style.opacity="")};
OpenLayers.Util.createDiv=function(a,b,c,d,e,f,g,h){var k=document.createElement("div");d&&(k.style.backgroundImage="url("+d+")");a||(a=OpenLayers.Util.createUniqueID("OpenLayersDiv"));e||(e="absolute");OpenLayers.Util.modifyDOMElement(k,a,b,c,e,f,g,h);return k};
OpenLayers.Util.createImage=function(a,b,c,d,e,f,g,h){var k=document.createElement("img");a||(a=OpenLayers.Util.createUniqueID("OpenLayersDiv"));e||(e="relative");OpenLayers.Util.modifyDOMElement(k,a,b,c,e,f,null,g);h&&(b=function(){k.style.display="";OpenLayers.Event.stopObservingElement(k)},k.style.display="none",OpenLayers.Event.observe(k,"load",b),OpenLayers.Event.observe(k,"error",b));k.style.alt=a;k.galleryImg="no";d&&(k.src=d);return k};OpenLayers.IMAGE_RELOAD_ATTEMPTS=0;
OpenLayers.Util.alphaHackNeeded=null;OpenLayers.Util.alphaHack=function(){if(null==OpenLayers.Util.alphaHackNeeded){var a=navigator.appVersion.split("MSIE"),a=parseFloat(a[1]),b=!1;try{b=!!document.body.filters}catch(c){}OpenLayers.Util.alphaHackNeeded=b&&5.5<=a&&7>a}return OpenLayers.Util.alphaHackNeeded};
OpenLayers.Util.modifyAlphaImageDiv=function(a,b,c,d,e,f,g,h,k){OpenLayers.Util.modifyDOMElement(a,b,c,d,f,null,null,k);b=a.childNodes[0];e&&(b.src=e);OpenLayers.Util.modifyDOMElement(b,a.id+"_innerImage",null,d,"relative",g);OpenLayers.Util.alphaHack()&&("none"!=a.style.display&&(a.style.display="inline-block"),null==h&&(h="scale"),a.style.filter="progid:DXImageTransform.Microsoft.AlphaImageLoader(src='"+b.src+"', sizingMethod='"+h+"')",0<=parseFloat(a.style.opacity)&&1>parseFloat(a.style.opacity)&&
(a.style.filter+=" alpha(opacity="+100*a.style.opacity+")"),b.style.filter="alpha(opacity=0)")};OpenLayers.Util.createAlphaImageDiv=function(a,b,c,d,e,f,g,h,k){var l=OpenLayers.Util.createDiv();k=OpenLayers.Util.createImage(null,null,null,null,null,null,null,k);k.className="olAlphaImg";l.appendChild(k);OpenLayers.Util.modifyAlphaImageDiv(l,a,b,c,d,e,f,g,h);return l};OpenLayers.Util.upperCaseObject=function(a){var b={},c;for(c in a)b[c.toUpperCase()]=a[c];return b};
OpenLayers.Util.applyDefaults=function(a,b){a=a||{};var c="function"==typeof window.Event&&b instanceof window.Event,d;for(d in b)if(void 0===a[d]||!c&&b.hasOwnProperty&&b.hasOwnProperty(d)&&!a.hasOwnProperty(d))a[d]=b[d];!c&&b&&b.hasOwnProperty&&b.hasOwnProperty("toString")&&!a.hasOwnProperty("toString")&&(a.toString=b.toString);return a};
OpenLayers.Util.getParameterString=function(a){var b=[],c;for(c in a){var d=a[c];if(null!=d&&"function"!=typeof d){if("object"==typeof d&&d.constructor==Array){for(var e=[],f,g=0,h=d.length;g<h;g++)f=d[g],e.push(encodeURIComponent(null===f||void 0===f?"":f));d=e.join(",")}else d=encodeURIComponent(d);b.push(encodeURIComponent(c)+"="+d)}}return b.join("&")};OpenLayers.Util.urlAppend=function(a,b){var c=a;if(b)var d=(a+" ").split(/[?&]/),c=c+(" "===d.pop()?b:d.length?"&"+b:"?"+b);return c};
OpenLayers.Util.getImagesLocation=function(){return OpenLayers.ImgPath||OpenLayers._getScriptLocation()+"img/"};OpenLayers.Util.getImageLocation=function(a){return OpenLayers.Util.getImagesLocation()+a};OpenLayers.Util.Try=function(){for(var a=null,b=0,c=arguments.length;b<c;b++){var d=arguments[b];try{a=d();break}catch(e){}}return a};
OpenLayers.Util.getXmlNodeValue=function(a){var b=null;OpenLayers.Util.Try(function(){b=a.text;b||(b=a.textContent);b||(b=a.firstChild.nodeValue)},function(){b=a.textContent});return b};OpenLayers.Util.mouseLeft=function(a,b){for(var c=a.relatedTarget?a.relatedTarget:a.toElement;c!=b&&null!=c;)c=c.parentNode;return c!=b};OpenLayers.Util.DEFAULT_PRECISION=14;OpenLayers.Util.toFloat=function(a,b){null==b&&(b=OpenLayers.Util.DEFAULT_PRECISION);"number"!==typeof a&&(a=parseFloat(a));return 0===b?a:parseFloat(a.toPrecision(b))};
OpenLayers.Util.rad=function(a){return a*Math.PI/180};OpenLayers.Util.deg=function(a){return 180*a/Math.PI};OpenLayers.Util.VincentyConstants={a:6378137,b:6356752.3142,f:1/298.257223563};
OpenLayers.Util.distVincenty=function(a,b){for(var c=OpenLayers.Util.VincentyConstants,d=c.a,e=c.b,c=c.f,f=OpenLayers.Util.rad(b.lon-a.lon),g=Math.atan((1-c)*Math.tan(OpenLayers.Util.rad(a.lat))),h=Math.atan((1-c)*Math.tan(OpenLayers.Util.rad(b.lat))),k=Math.sin(g),g=Math.cos(g),l=Math.sin(h),h=Math.cos(h),m=f,q=2*Math.PI,n=20;1E-12<Math.abs(m-q)&&0<--n;){var p=Math.sin(m),r=Math.cos(m),t=Math.sqrt(h*p*h*p+(g*l-k*h*r)*(g*l-k*h*r));if(0==t)return 0;var r=k*l+g*h*r,u=Math.atan2(t,r),v=Math.asin(g*h*
p/t),w=Math.cos(v)*Math.cos(v),p=r-2*k*l/w,x=c/16*w*(4+c*(4-3*w)),q=m,m=f+(1-x)*c*Math.sin(v)*(u+x*t*(p+x*r*(-1+2*p*p)))}if(0==n)return NaN;d=w*(d*d-e*e)/(e*e);c=d/1024*(256+d*(-128+d*(74-47*d)));return(e*(1+d/16384*(4096+d*(-768+d*(320-175*d))))*(u-c*t*(p+c/4*(r*(-1+2*p*p)-c/6*p*(-3+4*t*t)*(-3+4*p*p))))).toFixed(3)/1E3};
OpenLayers.Util.destinationVincenty=function(a,b,c){var d=OpenLayers.Util,e=d.VincentyConstants,f=e.a,g=e.b,e=e.f,h=a.lon,k=a.lat;a=d.rad(b);b=Math.sin(a);a=Math.cos(a);for(var l=(1-e)*Math.tan(d.rad(k)),k=1/Math.sqrt(1+l*l),m=l*k,q=Math.atan2(l,a),l=k*b,n=1-l*l,f=n*(f*f-g*g)/(g*g),p=1+f/16384*(4096+f*(-768+f*(320-175*f))),r=f/1024*(256+f*(-128+f*(74-47*f))),f=c/(g*p),t=2*Math.PI;1E-12<Math.abs(f-t);)var u=Math.cos(2*q+f),v=Math.sin(f),w=Math.cos(f),x=r*v*(u+r/4*(w*(-1+2*u*u)-r/6*u*(-3+4*v*v)*(-3+
4*u*u))),t=f,f=c/(g*p)+x;c=m*v-k*w*a;c=Math.atan2(m*w+k*v*a,(1-e)*Math.sqrt(l*l+c*c));g=e/16*n*(4+e*(4-3*n));return new OpenLayers.LonLat(h+d.deg(Math.atan2(v*b,k*w-m*v*a)-(1-g)*e*l*(f+g*v*(u+g*w*(-1+2*u*u)))),d.deg(c))};
OpenLayers.Util.getParameters=function(a,b){b=b||{};a=null===a||void 0===a?window.location.href:a;var c="";if(OpenLayers.String.contains(a,"?"))var d=a.indexOf("?")+1,c=OpenLayers.String.contains(a,"#")?a.indexOf("#"):a.length,c=a.substring(d,c);for(var d={},c=c.split(/[&;]/),e=0,f=c.length;e<f;++e){var g=c[e].split("=");if(g[0]){var h=g[0];try{h=decodeURIComponent(h)}catch(k){h=unescape(h)}g=(g[1]||"").replace(/\+/g," ");try{g=decodeURIComponent(g)}catch(k){g=unescape(g)}!1!==b.splitArgs&&(g=g.split(","));
1==g.length&&(g=g[0]);d[h]=g}}return d};OpenLayers.Util.lastSeqID=0;OpenLayers.Util.createUniqueID=function(a){a=null==a?"id_":a.replace(OpenLayers.Util.dotless,"_");OpenLayers.Util.lastSeqID+=1;return a+OpenLayers.Util.lastSeqID};OpenLayers.INCHES_PER_UNIT={inches:1,ft:12,mi:63360,m:39.37,km:39370,dd:4374754,yd:36};OpenLayers.INCHES_PER_UNIT["in"]=OpenLayers.INCHES_PER_UNIT.inches;OpenLayers.INCHES_PER_UNIT.degrees=OpenLayers.INCHES_PER_UNIT.dd;OpenLayers.INCHES_PER_UNIT.nmi=1852*OpenLayers.INCHES_PER_UNIT.m;
OpenLayers.METERS_PER_INCH=.0254000508001016;
OpenLayers.Util.extend(OpenLayers.INCHES_PER_UNIT,{Inch:OpenLayers.INCHES_PER_UNIT.inches,Meter:1/OpenLayers.METERS_PER_INCH,Foot:.3048006096012192/OpenLayers.METERS_PER_INCH,IFoot:.3048/OpenLayers.METERS_PER_INCH,ClarkeFoot:.3047972651151/OpenLayers.METERS_PER_INCH,SearsFoot:.30479947153867626/OpenLayers.METERS_PER_INCH,GoldCoastFoot:.3047997101815088/OpenLayers.METERS_PER_INCH,IInch:.0254/OpenLayers.METERS_PER_INCH,MicroInch:2.54E-5/OpenLayers.METERS_PER_INCH,Mil:2.54E-8/OpenLayers.METERS_PER_INCH,
Centimeter:.01/OpenLayers.METERS_PER_INCH,Kilometer:1E3/OpenLayers.METERS_PER_INCH,Yard:.9144018288036576/OpenLayers.METERS_PER_INCH,SearsYard:.914398414616029/OpenLayers.METERS_PER_INCH,IndianYard:.9143985307444408/OpenLayers.METERS_PER_INCH,IndianYd37:.91439523/OpenLayers.METERS_PER_INCH,IndianYd62:.9143988/OpenLayers.METERS_PER_INCH,IndianYd75:.9143985/OpenLayers.METERS_PER_INCH,IndianFoot:.30479951/OpenLayers.METERS_PER_INCH,IndianFt37:.30479841/OpenLayers.METERS_PER_INCH,IndianFt62:.3047996/
OpenLayers.METERS_PER_INCH,IndianFt75:.3047995/OpenLayers.METERS_PER_INCH,Mile:1609.3472186944373/OpenLayers.METERS_PER_INCH,IYard:.9144/OpenLayers.METERS_PER_INCH,IMile:1609.344/OpenLayers.METERS_PER_INCH,NautM:1852/OpenLayers.METERS_PER_INCH,"Lat-66":110943.31648893273/OpenLayers.METERS_PER_INCH,"Lat-83":110946.25736872235/OpenLayers.METERS_PER_INCH,Decimeter:.1/OpenLayers.METERS_PER_INCH,Millimeter:.001/OpenLayers.METERS_PER_INCH,Dekameter:10/OpenLayers.METERS_PER_INCH,Decameter:10/OpenLayers.METERS_PER_INCH,
Hectometer:100/OpenLayers.METERS_PER_INCH,GermanMeter:1.0000135965/OpenLayers.METERS_PER_INCH,CaGrid:.999738/OpenLayers.METERS_PER_INCH,ClarkeChain:20.1166194976/OpenLayers.METERS_PER_INCH,GunterChain:20.11684023368047/OpenLayers.METERS_PER_INCH,BenoitChain:20.116782494375872/OpenLayers.METERS_PER_INCH,SearsChain:20.11676512155/OpenLayers.METERS_PER_INCH,ClarkeLink:.201166194976/OpenLayers.METERS_PER_INCH,GunterLink:.2011684023368047/OpenLayers.METERS_PER_INCH,BenoitLink:.20116782494375873/OpenLayers.METERS_PER_INCH,
SearsLink:.2011676512155/OpenLayers.METERS_PER_INCH,Rod:5.02921005842012/OpenLayers.METERS_PER_INCH,IntnlChain:20.1168/OpenLayers.METERS_PER_INCH,IntnlLink:.201168/OpenLayers.METERS_PER_INCH,Perch:5.02921005842012/OpenLayers.METERS_PER_INCH,Pole:5.02921005842012/OpenLayers.METERS_PER_INCH,Furlong:201.1684023368046/OpenLayers.METERS_PER_INCH,Rood:3.778266898/OpenLayers.METERS_PER_INCH,CapeFoot:.3047972615/OpenLayers.METERS_PER_INCH,Brealey:375/OpenLayers.METERS_PER_INCH,ModAmFt:.304812252984506/OpenLayers.METERS_PER_INCH,
Fathom:1.8288/OpenLayers.METERS_PER_INCH,"NautM-UK":1853.184/OpenLayers.METERS_PER_INCH,"50kilometers":5E4/OpenLayers.METERS_PER_INCH,"150kilometers":15E4/OpenLayers.METERS_PER_INCH});
OpenLayers.Util.extend(OpenLayers.INCHES_PER_UNIT,{mm:OpenLayers.INCHES_PER_UNIT.Meter/1E3,cm:OpenLayers.INCHES_PER_UNIT.Meter/100,dm:100*OpenLayers.INCHES_PER_UNIT.Meter,km:1E3*OpenLayers.INCHES_PER_UNIT.Meter,kmi:OpenLayers.INCHES_PER_UNIT.nmi,fath:OpenLayers.INCHES_PER_UNIT.Fathom,ch:OpenLayers.INCHES_PER_UNIT.IntnlChain,link:OpenLayers.INCHES_PER_UNIT.IntnlLink,"us-in":OpenLayers.INCHES_PER_UNIT.inches,"us-ft":OpenLayers.INCHES_PER_UNIT.Foot,"us-yd":OpenLayers.INCHES_PER_UNIT.Yard,"us-ch":OpenLayers.INCHES_PER_UNIT.GunterChain,
"us-mi":OpenLayers.INCHES_PER_UNIT.Mile,"ind-yd":OpenLayers.INCHES_PER_UNIT.IndianYd37,"ind-ft":OpenLayers.INCHES_PER_UNIT.IndianFt37,"ind-ch":20.11669506/OpenLayers.METERS_PER_INCH});OpenLayers.DOTS_PER_INCH=72;OpenLayers.Util.normalizeScale=function(a){return 1<a?1/a:a};OpenLayers.Util.getResolutionFromScale=function(a,b){var c;a&&(null==b&&(b="degrees"),c=1/(OpenLayers.Util.normalizeScale(a)*OpenLayers.INCHES_PER_UNIT[b]*OpenLayers.DOTS_PER_INCH));return c};
OpenLayers.Util.getScaleFromResolution=function(a,b){null==b&&(b="degrees");return a*OpenLayers.INCHES_PER_UNIT[b]*OpenLayers.DOTS_PER_INCH};
OpenLayers.Util.pagePosition=function(a){var b=[0,0],c=OpenLayers.Util.getViewportElement();if(!a||a==window||a==c)return b;var d=OpenLayers.IS_GECKO&&document.getBoxObjectFor&&"absolute"==OpenLayers.Element.getStyle(a,"position")&&(""==a.style.top||""==a.style.left);if(a.getBoundingClientRect)a=a.getBoundingClientRect(),d=window.pageYOffset||c.scrollTop,b[0]=a.left+(window.pageXOffset||c.scrollLeft),b[1]=a.top+d;else if(document.getBoxObjectFor&&!d)a=document.getBoxObjectFor(a),c=document.getBoxObjectFor(c),
b[0]=a.screenX-c.screenX,b[1]=a.screenY-c.screenY;else{b[0]=a.offsetLeft;b[1]=a.offsetTop;c=a.offsetParent;if(c!=a)for(;c;)b[0]+=c.offsetLeft,b[1]+=c.offsetTop,c=c.offsetParent;d=OpenLayers.BROWSER_NAME;if("opera"==d||"safari"==d&&"absolute"==OpenLayers.Element.getStyle(a,"position"))b[1]-=document.body.offsetTop;for(c=a.offsetParent;c&&c!=document.body;){b[0]-=c.scrollLeft;if("opera"!=d||"TR"!=c.tagName)b[1]-=c.scrollTop;c=c.offsetParent}}return b};
OpenLayers.Util.getViewportElement=function(){var a=arguments.callee.viewportElement;void 0==a&&(a="msie"==OpenLayers.BROWSER_NAME&&"CSS1Compat"!=document.compatMode?document.body:document.documentElement,arguments.callee.viewportElement=a);return a};
OpenLayers.Util.isEquivalentUrl=function(a,b,c){c=c||{};OpenLayers.Util.applyDefaults(c,{ignoreCase:!0,ignorePort80:!0,ignoreHash:!0,splitArgs:!1});a=OpenLayers.Util.createUrlObject(a,c);b=OpenLayers.Util.createUrlObject(b,c);for(var d in a)if("args"!==d&&a[d]!=b[d])return!1;for(d in a.args){if(a.args[d]!=b.args[d])return!1;delete b.args[d]}for(d in b.args)return!1;return!0};
OpenLayers.Util.createUrlObject=function(a,b){b=b||{};if(!/^\w+:\/\//.test(a)){var c=window.location,d=c.port?":"+c.port:"",d=c.protocol+"//"+c.host.split(":").shift()+d;0===a.indexOf("/")?a=d+a:(c=c.pathname.split("/"),c.pop(),a=d+c.join("/")+"/"+a)}b.ignoreCase&&(a=a.toLowerCase());c=document.createElement("a");c.href=a;d={};d.host=c.host.split(":").shift();d.protocol=c.protocol;d.port=b.ignorePort80?"80"==c.port||"0"==c.port?"":c.port:""==c.port||"0"==c.port?"80":c.port;d.hash=b.ignoreHash||"#"===
c.hash?"":c.hash;var e=c.search;e||(e=a.indexOf("?"),e=-1!=e?a.substr(e):"");d.args=OpenLayers.Util.getParameters(e,{splitArgs:b.splitArgs});d.pathname="/"==c.pathname.charAt(0)?c.pathname:"/"+c.pathname;return d};OpenLayers.Util.removeTail=function(a){var b=a.indexOf("?"),c=a.indexOf("#");return-1==b?-1!=c?a.substr(0,c):a:-1!=c?a.substr(0,Math.min(b,c)):a.substr(0,b)};OpenLayers.IS_GECKO=function(){var a=navigator.userAgent.toLowerCase();return-1==a.indexOf("webkit")&&-1!=a.indexOf("gecko")}();
OpenLayers.CANVAS_SUPPORTED=function(){var a=document.createElement("canvas");return!(!a.getContext||!a.getContext("2d"))}();OpenLayers.BROWSER_NAME=function(){var a="",b=navigator.userAgent.toLowerCase();-1!=b.indexOf("opera")?a="opera":-1!=b.indexOf("msie")?a="msie":-1!=b.indexOf("safari")?a="safari":-1!=b.indexOf("mozilla")&&(a=-1!=b.indexOf("firefox")?"firefox":"mozilla");return a}();OpenLayers.Util.getBrowserName=function(){return OpenLayers.BROWSER_NAME};
OpenLayers.Util.getRenderedDimensions=function(a,b,c){var d,e,f=document.createElement("div");f.style.visibility="hidden";for(var g=c&&c.containerElement?c.containerElement:document.body,h=!1,k=null,l=g;l&&"body"!=l.tagName.toLowerCase();){var m=OpenLayers.Element.getStyle(l,"position");if("absolute"==m){h=!0;break}else if(m&&"static"!=m)break;l=l.parentNode}!h||0!==g.clientHeight&&0!==g.clientWidth||(k=document.createElement("div"),k.style.visibility="hidden",k.style.position="absolute",k.style.overflow=
"visible",k.style.width=document.body.clientWidth+"px",k.style.height=document.body.clientHeight+"px",k.appendChild(f));f.style.position="absolute";b&&(b.w?(d=b.w,f.style.width=d+"px"):b.h&&(e=b.h,f.style.height=e+"px"));c&&c.displayClass&&(f.className=c.displayClass);b=document.createElement("div");b.innerHTML=a;b.style.overflow="visible";if(b.childNodes)for(a=0,c=b.childNodes.length;a<c;a++)b.childNodes[a].style&&(b.childNodes[a].style.overflow="visible");f.appendChild(b);k?g.appendChild(k):g.appendChild(f);
d||(d=parseInt(b.scrollWidth),f.style.width=d+"px");e||(e=parseInt(b.scrollHeight));f.removeChild(b);k?(k.removeChild(f),g.removeChild(k)):g.removeChild(f);return new OpenLayers.Size(d,e)};
OpenLayers.Util.getScrollbarWidth=function(){var a=OpenLayers.Util._scrollbarWidth;if(null==a){var b,c;b=document.createElement("div");b.style.position="absolute";b.style.top="-1000px";b.style.left="-1000px";b.style.width="100px";b.style.height="50px";b.style.overflow="hidden";c=document.createElement("div");c.style.width="100%";c.style.height="200px";b.appendChild(c);document.body.appendChild(b);a=c.offsetWidth;b.style.overflow="scroll";b=c.offsetWidth;document.body.removeChild(document.body.lastChild);
OpenLayers.Util._scrollbarWidth=a-b;a=OpenLayers.Util._scrollbarWidth}return a};
OpenLayers.Util.getFormattedLonLat=function(a,b,c){c||(c="dms");a=(a+540)%360-180;var d=Math.abs(a),e=Math.floor(d),f=d=(d-e)/(1/60),d=Math.floor(d),f=Math.round((f-d)/(1/60)*10),f=f/10;60<=f&&(f-=60,d+=1,60<=d&&(d-=60,e+=1));10>e&&(e="0"+e);e+="\u00b0";0<=c.indexOf("dm")&&(10>d&&(d="0"+d),e+=d+"'",0<=c.indexOf("dms")&&(10>f&&(f="0"+f),e+=f+'"'));return e="lon"==b?e+(0>a?OpenLayers.i18n("W"):OpenLayers.i18n("E")):e+(0>a?OpenLayers.i18n("S"):OpenLayers.i18n("N"))};
OpenLayers.Util.getConstructor=function(a){var b=a.split(".");a="OpenLayers"===b[0]?OpenLayers:window[b[0]];for(var c=1,d=b.length;c<d;++c)a=a[b[c]];return a};OpenLayers.Event={observers:!1,KEY_SPACE:32,KEY_BACKSPACE:8,KEY_TAB:9,KEY_RETURN:13,KEY_ESC:27,KEY_LEFT:37,KEY_UP:38,KEY_RIGHT:39,KEY_DOWN:40,KEY_DELETE:46,element:function(a){return a.target||a.srcElement},isSingleTouch:function(a){return a.touches&&1==a.touches.length},isMultiTouch:function(a){return a.touches&&1<a.touches.length},isTouchEvent:function(a){return 0===(""+a.type).indexOf("touch")||"pointerType"in a&&(a.pointerType===a.MSPOINTER_TYPE_TOUCH||"touch"===a.pointerType)},isLeftClick:function(a){return a.which&&
1==a.which||a.button&&1==a.button},isRightClick:function(a){return a.which&&3==a.which||a.button&&2==a.button},stop:function(a,b){b||OpenLayers.Event.preventDefault(a);a.stopPropagation?a.stopPropagation():a.cancelBubble=!0},preventDefault:function(a){a.preventDefault?a.preventDefault():a.returnValue=!1},findElement:function(a,b){for(var c=OpenLayers.Event.element(a);c.parentNode&&(!c.tagName||c.tagName.toUpperCase()!=b.toUpperCase());)c=c.parentNode;return c},observe:function(a,b,c,d){a=OpenLayers.Util.getElement(a);
d=d||!1;"keypress"==b&&(navigator.appVersion.match(/Konqueror|Safari|KHTML/)||a.attachEvent)&&(b="keydown");this.observers||(this.observers={});if(!a._eventCacheID){var e="eventCacheID_";a.id&&(e=a.id+"_"+e);a._eventCacheID=OpenLayers.Util.createUniqueID(e)}e=a._eventCacheID;this.observers[e]||(this.observers[e]=[]);this.observers[e].push({element:a,name:b,observer:c,useCapture:d});a.addEventListener?a.addEventListener(b,c,d):a.attachEvent&&a.attachEvent("on"+b,c)},stopObservingElement:function(a){a=
OpenLayers.Util.getElement(a)._eventCacheID;this._removeElementObservers(OpenLayers.Event.observers[a])},_removeElementObservers:function(a){if(a)for(var b=a.length-1;0<=b;b--){var c=a[b];OpenLayers.Event.stopObserving.apply(this,[c.element,c.name,c.observer,c.useCapture])}},stopObserving:function(a,b,c,d){d=d||!1;a=OpenLayers.Util.getElement(a);var e=a._eventCacheID;"keypress"==b&&(navigator.appVersion.match(/Konqueror|Safari|KHTML/)||a.detachEvent)&&(b="keydown");var f=!1,g=OpenLayers.Event.observers[e];
if(g)for(var h=0;!f&&h<g.length;){var k=g[h];if(k.name==b&&k.observer==c&&k.useCapture==d){g.splice(h,1);0==g.length&&delete OpenLayers.Event.observers[e];f=!0;break}h++}f&&(a.removeEventListener?a.removeEventListener(b,c,d):a&&a.detachEvent&&a.detachEvent("on"+b,c));return f},unloadCache:function(){if(OpenLayers.Event&&OpenLayers.Event.observers){for(var a in OpenLayers.Event.observers)OpenLayers.Event._removeElementObservers.apply(this,[OpenLayers.Event.observers[a]]);OpenLayers.Event.observers=
!1}},CLASS_NAME:"OpenLayers.Event"};OpenLayers.Event.observe(window,"unload",OpenLayers.Event.unloadCache,!1);
OpenLayers.Events=OpenLayers.Class({BROWSER_EVENTS:"mouseover mouseout mousedown mouseup mousemove click dblclick rightclick dblrightclick resize focus blur touchstart touchmove touchend keydown".split(" "),TOUCH_MODEL_POINTER:"pointer",TOUCH_MODEL_MSPOINTER:"MSPointer",TOUCH_MODEL_TOUCH:"touch",listeners:null,object:null,element:null,eventHandler:null,fallThrough:null,includeXY:!1,extensions:null,extensionCount:null,clearMouseListener:null,initialize:function(a,b,c,d,e){OpenLayers.Util.extend(this,
e);this.object=a;this.fallThrough=d;this.listeners={};this.extensions={};this.extensionCount={};this._pointerTouches=[];null!=b&&this.attachToElement(b)},destroy:function(){for(var a in this.extensions)"boolean"!==typeof this.extensions[a]&&this.extensions[a].destroy();this.extensions=null;this.element&&(OpenLayers.Event.stopObservingElement(this.element),this.element.hasScrollEvent&&OpenLayers.Event.stopObserving(window,"scroll",this.clearMouseListener));this.eventHandler=this.fallThrough=this.object=
this.listeners=this.element=null},addEventType:function(a){},attachToElement:function(a){this.element?OpenLayers.Event.stopObservingElement(this.element):(this.eventHandler=OpenLayers.Function.bindAsEventListener(this.handleBrowserEvent,this),this.clearMouseListener=OpenLayers.Function.bind(this.clearMouseCache,this));this.element=a;for(var b=this.getTouchModel(),c,d=0,e=this.BROWSER_EVENTS.length;d<e;d++)c=this.BROWSER_EVENTS[d],b!==this.TOUCH_MODEL_POINTER&&b!==this.TOUCH_MODEL_MSPOINTER||0!==c.indexOf("touch")?
OpenLayers.Event.observe(a,c,this.eventHandler):this.addPointerTouchListener(a,c,this.eventHandler);OpenLayers.Event.observe(a,"dragstart",OpenLayers.Event.stop)},on:function(a){for(var b in a)"scope"!=b&&a.hasOwnProperty(b)&&this.register(b,a.scope,a[b])},register:function(a,b,c,d){a in OpenLayers.Events&&!this.extensions[a]&&(this.extensions[a]=new OpenLayers.Events[a](this));if(null!=c){null==b&&(b=this.object);var e=this.listeners[a];e||(e=[],this.listeners[a]=e,this.extensionCount[a]=0);b={obj:b,
func:c};d?(e.splice(this.extensionCount[a],0,b),"object"===typeof d&&d.extension&&this.extensionCount[a]++):e.push(b)}},registerPriority:function(a,b,c){this.register(a,b,c,!0)},un:function(a){for(var b in a)"scope"!=b&&a.hasOwnProperty(b)&&this.unregister(b,a.scope,a[b])},unregister:function(a,b,c){null==b&&(b=this.object);a=this.listeners[a];if(null!=a)for(var d=0,e=a.length;d<e;d++)if(a[d].obj==b&&a[d].func==c){a.splice(d,1);break}},remove:function(a){null!=this.listeners[a]&&(this.listeners[a]=
[])},triggerEvent:function(a,b){var c=this.listeners[a];if(c&&0!=c.length){null==b&&(b={});b.object=this.object;b.element=this.element;b.type||(b.type=a);for(var c=c.slice(),d,e=0,f=c.length;e<f&&(d=c[e],d=d.func.apply(d.obj,[b]),void 0==d||0!=d);e++);this.fallThrough||OpenLayers.Event.stop(b,!0);return d}},handleBrowserEvent:function(a){var b=a.type,c=this.listeners[b];if(c&&0!=c.length){if((c=a.touches)&&c[0]){for(var d=0,e=0,f=c.length,g,h=0;h<f;++h)g=this.getTouchClientXY(c[h]),d+=g.clientX,e+=
g.clientY;a.clientX=d/f;a.clientY=e/f}this.includeXY&&(a.xy=this.getMousePosition(a));this.triggerEvent(b,a)}},getTouchClientXY:function(a){var b=window.olMockWin||window,c=b.pageXOffset,b=b.pageYOffset,d=a.clientX,e=a.clientY;if(0===a.pageY&&Math.floor(e)>Math.floor(a.pageY)||0===a.pageX&&Math.floor(d)>Math.floor(a.pageX))d-=c,e-=b;else if(e<a.pageY-b||d<a.pageX-c)d=a.pageX-c,e=a.pageY-b;a.olClientX=d;a.olClientY=e;return{clientX:d,clientY:e}},clearMouseCache:function(){this.element.scrolls=null;
this.element.lefttop=null;this.element.offsets=null},getMousePosition:function(a){this.includeXY?this.element.hasScrollEvent||(OpenLayers.Event.observe(window,"scroll",this.clearMouseListener),this.element.hasScrollEvent=!0):this.clearMouseCache();if(!this.element.scrolls){var b=OpenLayers.Util.getViewportElement();this.element.scrolls=[window.pageXOffset||b.scrollLeft,window.pageYOffset||b.scrollTop]}this.element.lefttop||(this.element.lefttop=[document.documentElement.clientLeft||0,document.documentElement.clientTop||
0]);this.element.offsets||(this.element.offsets=OpenLayers.Util.pagePosition(this.element));return new OpenLayers.Pixel(a.clientX+this.element.scrolls[0]-this.element.offsets[0]-this.element.lefttop[0],a.clientY+this.element.scrolls[1]-this.element.offsets[1]-this.element.lefttop[1])},getTouchModel:function(){"_TOUCH_MODEL"in OpenLayers.Events||(OpenLayers.Events._TOUCH_MODEL=window.PointerEvent&&"pointer"||window.MSPointerEvent&&"MSPointer"||"ontouchdown"in document&&"touch"||null);return OpenLayers.Events._TOUCH_MODEL},
addPointerTouchListener:function(a,b,c){function d(a){c(OpenLayers.Util.applyDefaults({stopPropagation:function(){for(var a=e.length-1;0<=a;--a)e[a].stopPropagation()},preventDefault:function(){for(var a=e.length-1;0<=a;--a)e[a].preventDefault()},type:b},a))}var e=this._pointerTouches;switch(b){case "touchstart":return this.addPointerTouchListenerStart(a,b,d);case "touchend":return this.addPointerTouchListenerEnd(a,b,d);case "touchmove":return this.addPointerTouchListenerMove(a,b,d);default:throw"Unknown touch event type";
}},addPointerTouchListenerStart:function(a,b,c){var d=this._pointerTouches;OpenLayers.Event.observe(a,this.getTouchModel()===this.TOUCH_MODEL_MSPOINTER?"MSPointerDown":"pointerdown",function(a){if(OpenLayers.Event.isTouchEvent(a)){for(var b=!1,e=0,h=d.length;e<h;++e)if(d[e].pointerId==a.pointerId){b=!0;break}b||d.push(a);a.touches=d.slice();c(a)}});OpenLayers.Event.observe(a,this.getTouchModel()===this.TOUCH_MODEL_MSPOINTER?"MSPointerOut":"pointerout",function(a){if(OpenLayers.Event.isTouchEvent(a))for(var b=
0,c=d.length;b<c;++b)if(d[b].pointerId==a.pointerId){0!=this.clientWidth&&0!=this.clientHeight&&(Math.ceil(a.clientX)>=this.clientWidth||Math.ceil(a.clientY)>=this.clientHeight)&&d.splice(b,1);break}})},addPointerTouchListenerMove:function(a,b,c){var d=this._pointerTouches;OpenLayers.Event.observe(a,this.getTouchModel()===this.TOUCH_MODEL_MSPOINTER?"MSPointerMove":"pointermove",function(a){if(OpenLayers.Event.isTouchEvent(a)&&(1!=d.length||d[0].pageX!=a.pageX||d[0].pageY!=a.pageY)){for(var b=0,e=
d.length;b<e;++b)if(d[b].pointerId==a.pointerId){d[b]=a;break}a.touches=d.slice();c(a)}})},addPointerTouchListenerEnd:function(a,b,c){var d=this._pointerTouches;OpenLayers.Event.observe(a,this.getTouchModel()===this.TOUCH_MODEL_MSPOINTER?"MSPointerUp":"pointerup",function(a){if(OpenLayers.Event.isTouchEvent(a)){for(var b=0,e=d.length;b<e;++b)if(d[b].pointerId==a.pointerId){d.splice(b,1);break}a.touches=d.slice();c(a)}})},CLASS_NAME:"OpenLayers.Events"});OpenLayers.Handler=OpenLayers.Class({id:null,control:null,map:null,keyMask:null,active:!1,evt:null,touch:!1,initialize:function(a,b,c){OpenLayers.Util.extend(this,c);this.control=a;this.callbacks=b;(a=this.map||a.map)&&this.setMap(a);this.id=OpenLayers.Util.createUniqueID(this.CLASS_NAME+"_")},setMap:function(a){this.map=a},checkModifiers:function(a){return null==this.keyMask?!0:((a.shiftKey?OpenLayers.Handler.MOD_SHIFT:0)|(a.ctrlKey?OpenLayers.Handler.MOD_CTRL:0)|(a.altKey?OpenLayers.Handler.MOD_ALT:
0)|(a.metaKey?OpenLayers.Handler.MOD_META:0))==this.keyMask},activate:function(){if(this.active)return!1;for(var a=OpenLayers.Events.prototype.BROWSER_EVENTS,b=0,c=a.length;b<c;b++)this[a[b]]&&this.register(a[b],this[a[b]]);return this.active=!0},deactivate:function(){if(!this.active)return!1;for(var a=OpenLayers.Events.prototype.BROWSER_EVENTS,b=0,c=a.length;b<c;b++)this[a[b]]&&this.unregister(a[b],this[a[b]]);this.active=this.touch=!1;return!0},startTouch:function(){if(!this.touch){this.touch=!0;
for(var a="mousedown mouseup mousemove click dblclick mouseout".split(" "),b=0,c=a.length;b<c;b++)this[a[b]]&&this.unregister(a[b],this[a[b]])}},callback:function(a,b){a&&this.callbacks[a]&&this.callbacks[a].apply(this.control,b)},register:function(a,b){this.map.events.registerPriority(a,this,b);this.map.events.registerPriority(a,this,this.setEvent)},unregister:function(a,b){this.map.events.unregister(a,this,b);this.map.events.unregister(a,this,this.setEvent)},setEvent:function(a){this.evt=a;return!0},
destroy:function(){this.deactivate();this.control=this.map=null},CLASS_NAME:"OpenLayers.Handler"});OpenLayers.Handler.MOD_NONE=0;OpenLayers.Handler.MOD_SHIFT=1;OpenLayers.Handler.MOD_CTRL=2;OpenLayers.Handler.MOD_ALT=4;OpenLayers.Handler.MOD_META=8;OpenLayers.Util=OpenLayers.Util||{};
OpenLayers.Util.vendorPrefix=function(){function a(a){return a?a.replace(/([A-Z])/g,function(a){return"-"+a.toLowerCase()}).replace(/^ms-/,"-ms-"):null}function b(a,b){if(void 0===g[b]){var c,e=0,f=d.length,h="undefined"!==typeof a.cssText;for(g[b]=null;e<f;e++)if((c=d[e])?(h||(c=c.toLowerCase()),c=c+b.charAt(0).toUpperCase()+b.slice(1)):c=b,void 0!==a[c]){g[b]=c;break}}return g[b]}function c(a){return b(e,a)}var d=["","O","ms","Moz","Webkit"],e=document.createElement("div").style,f={},g={};return{css:function(b){if(void 0===
f[b]){var d=b.replace(/(-[\s\S])/g,function(a){return a.charAt(1).toUpperCase()}),d=c(d);f[b]=a(d)}return f[b]},js:b,style:c,cssCache:f,jsCache:g}}();OpenLayers.Animation=function(a){var b=OpenLayers.Util.vendorPrefix.js(a,"requestAnimationFrame"),c=!!b,d=function(){var c=a[b]||function(b,c){a.setTimeout(b,16)};return function(b,d){c.apply(a,[b,d])}}(),e=0,f={};return{isNative:c,requestFrame:d,start:function(a,b,c){b=0<b?b:Number.POSITIVE_INFINITY;var g=++e,h=+new Date;f[g]=function(){f[g]&&+new Date-h<=b?(a(),f[g]&&d(f[g],c)):delete f[g]};d(f[g],c);return g},stop:function(a){delete f[a]}}}(window);OpenLayers.Tween=OpenLayers.Class({easing:null,begin:null,finish:null,duration:null,callbacks:null,time:null,minFrameRate:null,startTime:null,animationId:null,playing:!1,initialize:function(a){this.easing=a?a:OpenLayers.Easing.Expo.easeOut},start:function(a,b,c,d){this.playing=!0;this.begin=a;this.finish=b;this.duration=c;this.callbacks=d.callbacks;this.minFrameRate=d.minFrameRate||30;this.time=0;this.startTime=(new Date).getTime();OpenLayers.Animation.stop(this.animationId);this.animationId=null;
this.callbacks&&this.callbacks.start&&this.callbacks.start.call(this,this.begin);this.animationId=OpenLayers.Animation.start(OpenLayers.Function.bind(this.play,this))},stop:function(){this.playing&&(this.callbacks&&this.callbacks.done&&this.callbacks.done.call(this,this.finish),OpenLayers.Animation.stop(this.animationId),this.animationId=null,this.playing=!1)},play:function(){var a={},b;for(b in this.begin){var c=this.begin[b],d=this.finish[b];if(null==c||null==d||isNaN(c)||isNaN(d))throw new TypeError("invalid value for Tween");
a[b]=this.easing.apply(this,[this.time,c,d-c,this.duration])}this.time++;this.callbacks&&this.callbacks.eachStep&&((new Date).getTime()-this.startTime)/this.time<=1E3/this.minFrameRate&&this.callbacks.eachStep.call(this,a);this.time>this.duration&&this.stop()},CLASS_NAME:"OpenLayers.Tween"});OpenLayers.Easing={CLASS_NAME:"OpenLayers.Easing"};OpenLayers.Easing.Linear={easeIn:function(a,b,c,d){return c*a/d+b},easeOut:function(a,b,c,d){return c*a/d+b},easeInOut:function(a,b,c,d){return c*a/d+b},CLASS_NAME:"OpenLayers.Easing.Linear"};
OpenLayers.Easing.Expo={easeIn:function(a,b,c,d){return 0==a?b:c*Math.pow(2,10*(a/d-1))+b},easeOut:function(a,b,c,d){return a==d?b+c:c*(-Math.pow(2,-10*a/d)+1)+b},easeInOut:function(a,b,c,d){return 0==a?b:a==d?b+c:1>(a/=d/2)?c/2*Math.pow(2,10*(a-1))+b:c/2*(-Math.pow(2,-10*--a)+2)+b},CLASS_NAME:"OpenLayers.Easing.Expo"};
OpenLayers.Easing.Quad={easeIn:function(a,b,c,d){return c*(a/=d)*a+b},easeOut:function(a,b,c,d){return-c*(a/=d)*(a-2)+b},easeInOut:function(a,b,c,d){return 1>(a/=d/2)?c/2*a*a+b:-c/2*(--a*(a-2)-1)+b},CLASS_NAME:"OpenLayers.Easing.Quad"};OpenLayers.Projection=OpenLayers.Class({proj:null,projCode:null,titleRegEx:/\+title=[^\+]*/,initialize:function(a,b){OpenLayers.Util.extend(this,b);this.projCode=a;"object"==typeof Proj4js&&(this.proj=new Proj4js.Proj(a))},getCode:function(){return this.proj?this.proj.srsCode:this.projCode},getUnits:function(){return this.proj?this.proj.units:null},toString:function(){return this.getCode()},equals:function(a){var b=!1;a&&(a instanceof OpenLayers.Projection||(a=new OpenLayers.Projection(a)),"object"==
typeof Proj4js&&this.proj.defData&&a.proj.defData?b=this.proj.defData.replace(this.titleRegEx,"")==a.proj.defData.replace(this.titleRegEx,""):a.getCode&&(b=this.getCode(),a=a.getCode(),b=b==a||!!OpenLayers.Projection.transforms[b]&&OpenLayers.Projection.transforms[b][a]===OpenLayers.Projection.nullTransform));return b},destroy:function(){delete this.proj;delete this.projCode},CLASS_NAME:"OpenLayers.Projection"});OpenLayers.Projection.transforms={};
OpenLayers.Projection.defaults={"EPSG:4326":{units:"degrees",maxExtent:[-180,-90,180,90],worldExtent:[-180,-90,180,90],yx:!0},"CRS:84":{units:"degrees",maxExtent:[-180,-90,180,90],worldExtent:[-180,-90,180,90]},"EPSG:900913":{units:"m",maxExtent:[-2.003750834E7,-2.003750834E7,2.003750834E7,2.003750834E7],worldExtent:[-180,-89,180,89]}};
OpenLayers.Projection.addTransform=function(a,b,c){if(c===OpenLayers.Projection.nullTransform){var d=OpenLayers.Projection.defaults[a];d&&!OpenLayers.Projection.defaults[b]&&(OpenLayers.Projection.defaults[b]=d)}OpenLayers.Projection.transforms[a]||(OpenLayers.Projection.transforms[a]={});OpenLayers.Projection.transforms[a][b]=c};
OpenLayers.Projection.transform=function(a,b,c){if(b&&c)if(b instanceof OpenLayers.Projection||(b=new OpenLayers.Projection(b)),c instanceof OpenLayers.Projection||(c=new OpenLayers.Projection(c)),b.proj&&c.proj)a=Proj4js.transform(b.proj,c.proj,a);else{b=b.getCode();c=c.getCode();var d=OpenLayers.Projection.transforms;if(d[b]&&d[b][c])d[b][c](a)}return a};OpenLayers.Projection.nullTransform=function(a){return a};
(function(){function a(a){a.x=180*a.x/2.003750834E7;a.y=180/Math.PI*(2*Math.atan(Math.exp(a.y/2.003750834E7*Math.PI))-Math.PI/2);return a}function b(a){a.x=2.003750834E7*a.x/180;a.y=Math.max(-2.003750834E7,Math.min(Math.log(Math.tan((90+a.y)*Math.PI/360))/Math.PI*2.003750834E7,2.003750834E7));return a}function c(c,d){var e=OpenLayers.Projection.addTransform,f=OpenLayers.Projection.nullTransform,g,h,n,p,r;g=0;for(h=d.length;g<h;++g)for(n=d[g],e(c,n,b),e(n,c,a),r=g+1;r<h;++r)p=d[r],e(n,p,f),e(p,n,f)}
var d=["EPSG:900913","EPSG:3857","EPSG:102113","EPSG:102100","OSGEO:41001"],e=["CRS:84","urn:ogc:def:crs:EPSG:6.6:4326","EPSG:4326"],f;for(f=d.length-1;0<=f;--f)c(d[f],e);for(f=e.length-1;0<=f;--f)c(e[f],d)})();OpenLayers.Map=OpenLayers.Class({Z_INDEX_BASE:{BaseLayer:100,Overlay:325,Feature:725,Popup:750,Control:1E3},id:null,fractionalZoom:!1,events:null,allOverlays:!1,div:null,dragging:!1,size:null,viewPortDiv:null,layerContainerOrigin:null,layerContainerDiv:null,layers:null,controls:null,popups:null,baseLayer:null,center:null,resolution:null,zoom:0,panRatio:1.5,options:null,tileSize:null,projection:"EPSG:4326",units:null,resolutions:null,maxResolution:null,minResolution:null,maxScale:null,minScale:null,
maxExtent:null,minExtent:null,restrictedExtent:null,numZoomLevels:16,theme:null,displayProjection:null,fallThrough:!1,autoUpdateSize:!0,eventListeners:null,panTween:null,panMethod:OpenLayers.Easing.Expo.easeOut,panDuration:50,zoomTween:null,zoomMethod:OpenLayers.Easing.Quad.easeOut,zoomDuration:20,paddingForPopups:null,layerContainerOriginPx:null,minPx:null,maxPx:null,initialize:function(a,b){var c=OpenLayers.Util.isElement(a);1!==arguments.length||"object"!==typeof a||c||(a=(b=a)&&b.div);this.tileSize=
new OpenLayers.Size(OpenLayers.Map.TILE_WIDTH,OpenLayers.Map.TILE_HEIGHT);this.paddingForPopups=new OpenLayers.Bounds(15,15,15,15);this.theme=OpenLayers._getScriptLocation()+"theme/default/style.css";this.options=OpenLayers.Util.extend({},b);OpenLayers.Util.extend(this,b);OpenLayers.Util.applyDefaults(this,OpenLayers.Projection.defaults[this.projection instanceof OpenLayers.Projection?this.projection.projCode:this.projection]);!this.maxExtent||this.maxExtent instanceof OpenLayers.Bounds||(this.maxExtent=
new OpenLayers.Bounds(this.maxExtent));!this.minExtent||this.minExtent instanceof OpenLayers.Bounds||(this.minExtent=new OpenLayers.Bounds(this.minExtent));!this.restrictedExtent||this.restrictedExtent instanceof OpenLayers.Bounds||(this.restrictedExtent=new OpenLayers.Bounds(this.restrictedExtent));!this.center||this.center instanceof OpenLayers.LonLat||(this.center=new OpenLayers.LonLat(this.center));this.layers=[];this.id=OpenLayers.Util.createUniqueID("OpenLayers.Map_");this.div=OpenLayers.Util.getElement(a);
this.div||(this.div=document.createElement("div"),this.div.style.height="1px",this.div.style.width="1px");OpenLayers.Element.addClass(this.div,"olMap");c=this.id+"_OpenLayers_ViewPort";this.viewPortDiv=OpenLayers.Util.createDiv(c,null,null,null,"relative",null,"hidden");this.viewPortDiv.style.width="100%";this.viewPortDiv.style.height="100%";this.viewPortDiv.className="olMapViewport";this.div.appendChild(this.viewPortDiv);this.events=new OpenLayers.Events(this,this.viewPortDiv,null,this.fallThrough,
{includeXY:!0});OpenLayers.TileManager&&null!==this.tileManager&&(this.tileManager instanceof OpenLayers.TileManager||(this.tileManager=new OpenLayers.TileManager(this.tileManager)),this.tileManager.addMap(this));c=this.id+"_OpenLayers_Container";this.layerContainerDiv=OpenLayers.Util.createDiv(c);this.layerContainerDiv.style.zIndex=this.Z_INDEX_BASE.Popup-1;this.layerContainerOriginPx={x:0,y:0};this.applyTransform();this.viewPortDiv.appendChild(this.layerContainerDiv);this.updateSize();if(this.eventListeners instanceof
Object)this.events.on(this.eventListeners);!0===this.autoUpdateSize&&(this.updateSizeDestroy=OpenLayers.Function.bind(this.updateSize,this),OpenLayers.Event.observe(window,"resize",this.updateSizeDestroy));if(this.theme){for(var c=!0,d=document.getElementsByTagName("link"),e=0,f=d.length;e<f;++e)if(OpenLayers.Util.isEquivalentUrl(d.item(e).href,this.theme)){c=!1;break}c&&(c=document.createElement("link"),c.setAttribute("rel","stylesheet"),c.setAttribute("type","text/css"),c.setAttribute("href",this.theme),
document.getElementsByTagName("head")[0].appendChild(c))}null==this.controls&&(this.controls=[],null!=OpenLayers.Control&&(OpenLayers.Control.Navigation?this.controls.push(new OpenLayers.Control.Navigation):OpenLayers.Control.TouchNavigation&&this.controls.push(new OpenLayers.Control.TouchNavigation),OpenLayers.Control.Zoom?this.controls.push(new OpenLayers.Control.Zoom):OpenLayers.Control.PanZoom&&this.controls.push(new OpenLayers.Control.PanZoom),OpenLayers.Control.ArgParser&&this.controls.push(new OpenLayers.Control.ArgParser),
OpenLayers.Control.Attribution&&this.controls.push(new OpenLayers.Control.Attribution)));e=0;for(f=this.controls.length;e<f;e++)this.addControlToMap(this.controls[e]);this.popups=[];this.unloadDestroy=OpenLayers.Function.bind(this.destroy,this);OpenLayers.Event.observe(window,"unload",this.unloadDestroy);b&&b.layers&&(delete this.center,delete this.zoom,this.addLayers(b.layers),b.center&&!this.getCenter()&&this.setCenter(b.center,b.zoom));this.panMethod&&(this.panTween=new OpenLayers.Tween(this.panMethod));
this.zoomMethod&&this.applyTransform.transform&&(this.zoomTween=new OpenLayers.Tween(this.zoomMethod))},getViewport:function(){return this.viewPortDiv},render:function(a){this.div=OpenLayers.Util.getElement(a);OpenLayers.Element.addClass(this.div,"olMap");this.viewPortDiv.parentNode.removeChild(this.viewPortDiv);this.div.appendChild(this.viewPortDiv);this.updateSize()},unloadDestroy:null,updateSizeDestroy:null,destroy:function(){if(!this.unloadDestroy)return!1;this.panTween&&(this.panTween.stop(),
this.panTween=null);this.zoomTween&&(this.zoomTween.stop(),this.zoomTween=null);OpenLayers.Event.stopObserving(window,"unload",this.unloadDestroy);this.unloadDestroy=null;this.updateSizeDestroy&&OpenLayers.Event.stopObserving(window,"resize",this.updateSizeDestroy);this.paddingForPopups=null;if(null!=this.controls){for(var a=this.controls.length-1;0<=a;--a)this.controls[a].destroy();this.controls=null}if(null!=this.layers){for(a=this.layers.length-1;0<=a;--a)this.layers[a].destroy(!1);this.layers=
null}this.viewPortDiv&&this.viewPortDiv.parentNode&&this.viewPortDiv.parentNode.removeChild(this.viewPortDiv);this.viewPortDiv=null;this.tileManager&&(this.tileManager.removeMap(this),this.tileManager=null);this.eventListeners&&(this.events.un(this.eventListeners),this.eventListeners=null);this.events.destroy();this.options=this.events=null},setOptions:function(a){var b=this.minPx&&a.restrictedExtent!=this.restrictedExtent;OpenLayers.Util.extend(this,a);b&&this.moveTo(this.getCachedCenter(),this.zoom,
{forceZoomChange:!0})},getTileSize:function(){return this.tileSize},getBy:function(a,b,c){var d="function"==typeof c.test;return OpenLayers.Array.filter(this[a],function(a){return a[b]==c||d&&c.test(a[b])})},getLayersBy:function(a,b){return this.getBy("layers",a,b)},getLayersByName:function(a){return this.getLayersBy("name",a)},getLayersByClass:function(a){return this.getLayersBy("CLASS_NAME",a)},getControlsBy:function(a,b){return this.getBy("controls",a,b)},getControlsByClass:function(a){return this.getControlsBy("CLASS_NAME",
a)},getLayer:function(a){for(var b=null,c=0,d=this.layers.length;c<d;c++){var e=this.layers[c];if(e.id==a){b=e;break}}return b},setLayerZIndex:function(a,b){a.setZIndex(this.Z_INDEX_BASE[a.isBaseLayer?"BaseLayer":"Overlay"]+5*b)},resetLayersZIndex:function(){for(var a=0,b=this.layers.length;a<b;a++)this.setLayerZIndex(this.layers[a],a)},addLayer:function(a){for(var b=0,c=this.layers.length;b<c;b++)if(this.layers[b]==a)return!1;if(!1===this.events.triggerEvent("preaddlayer",{layer:a}))return!1;this.allOverlays&&
(a.isBaseLayer=!1);a.div.className="olLayerDiv";a.div.style.overflow="";this.setLayerZIndex(a,this.layers.length);a.isFixed?this.viewPortDiv.appendChild(a.div):this.layerContainerDiv.appendChild(a.div);this.layers.push(a);a.setMap(this);a.isBaseLayer||this.allOverlays&&!this.baseLayer?null==this.baseLayer?this.setBaseLayer(a):a.setVisibility(!1):a.redraw();this.events.triggerEvent("addlayer",{layer:a});a.events.triggerEvent("added",{map:this,layer:a});a.afterAdd();return!0},addLayers:function(a){for(var b=
0,c=a.length;b<c;b++)this.addLayer(a[b])},removeLayer:function(a,b){if(!1!==this.events.triggerEvent("preremovelayer",{layer:a})){null==b&&(b=!0);a.isFixed?this.viewPortDiv.removeChild(a.div):this.layerContainerDiv.removeChild(a.div);OpenLayers.Util.removeItem(this.layers,a);a.removeMap(this);a.map=null;if(this.baseLayer==a&&(this.baseLayer=null,b))for(var c=0,d=this.layers.length;c<d;c++){var e=this.layers[c];if(e.isBaseLayer||this.allOverlays){this.setBaseLayer(e);break}}this.resetLayersZIndex();
this.events.triggerEvent("removelayer",{layer:a});a.events.triggerEvent("removed",{map:this,layer:a})}},getNumLayers:function(){return this.layers.length},getLayerIndex:function(a){return OpenLayers.Util.indexOf(this.layers,a)},setLayerIndex:function(a,b){var c=this.getLayerIndex(a);0>b?b=0:b>this.layers.length&&(b=this.layers.length);if(c!=b){this.layers.splice(c,1);this.layers.splice(b,0,a);for(var c=0,d=this.layers.length;c<d;c++)this.setLayerZIndex(this.layers[c],c);this.events.triggerEvent("changelayer",
{layer:a,property:"order"});this.allOverlays&&(0===b?this.setBaseLayer(a):this.baseLayer!==this.layers[0]&&this.setBaseLayer(this.layers[0]))}},raiseLayer:function(a,b){var c=this.getLayerIndex(a)+b;this.setLayerIndex(a,c)},setBaseLayer:function(a){if(a!=this.baseLayer&&-1!=OpenLayers.Util.indexOf(this.layers,a)){var b=this.getCachedCenter(),c=this.getResolution(),d=OpenLayers.Util.getResolutionFromScale(this.getScale(),a.units);null==this.baseLayer||this.allOverlays||this.baseLayer.setVisibility(!1);
this.baseLayer=a;if(!this.allOverlays||this.baseLayer.visibility)this.baseLayer.setVisibility(!0),!1===this.baseLayer.inRange&&this.baseLayer.redraw();null!=b&&(a=this.getZoomForResolution(d||this.resolution,!0),this.setCenter(b,a,!1,c!=d));this.events.triggerEvent("changebaselayer",{layer:this.baseLayer})}},addControl:function(a,b){this.controls.push(a);this.addControlToMap(a,b)},addControls:function(a,b){for(var c=1===arguments.length?[]:b,d=0,e=a.length;d<e;d++)this.addControl(a[d],c[d]?c[d]:null)},
addControlToMap:function(a,b){a.outsideViewport=null!=a.div;this.displayProjection&&!a.displayProjection&&(a.displayProjection=this.displayProjection);a.setMap(this);var c=a.draw(b);c&&!a.outsideViewport&&(c.style.zIndex=this.Z_INDEX_BASE.Control+this.controls.length,this.viewPortDiv.appendChild(c));a.autoActivate&&a.activate()},getControl:function(a){for(var b=null,c=0,d=this.controls.length;c<d;c++){var e=this.controls[c];if(e.id==a){b=e;break}}return b},removeControl:function(a){a&&a==this.getControl(a.id)&&
(a.div&&a.div.parentNode==this.viewPortDiv&&this.viewPortDiv.removeChild(a.div),OpenLayers.Util.removeItem(this.controls,a))},addPopup:function(a,b){if(b)for(var c=this.popups.length-1;0<=c;--c)this.removePopup(this.popups[c]);a.map=this;this.popups.push(a);if(c=a.draw())c.style.zIndex=this.Z_INDEX_BASE.Popup+this.popups.length,this.layerContainerDiv.appendChild(c)},removePopup:function(a){OpenLayers.Util.removeItem(this.popups,a);if(a.div)try{this.layerContainerDiv.removeChild(a.div)}catch(b){}a.map=
null},getSize:function(){var a=null;null!=this.size&&(a=this.size.clone());return a},updateSize:function(){var a=this.getCurrentSize();if(a&&!isNaN(a.h)&&!isNaN(a.w)){this.events.clearMouseCache();var b=this.getSize();null==b&&(this.size=b=a);if(!a.equals(b)){this.size=a;a=0;for(b=this.layers.length;a<b;a++)this.layers[a].onMapResize();a=this.getCachedCenter();null!=this.baseLayer&&null!=a&&(b=this.getZoom(),this.zoom=null,this.setCenter(a,b))}}this.events.triggerEvent("updatesize")},getCurrentSize:function(){var a=
new OpenLayers.Size(this.div.clientWidth,this.div.clientHeight);if(0==a.w&&0==a.h||isNaN(a.w)&&isNaN(a.h))a.w=this.div.offsetWidth,a.h=this.div.offsetHeight;if(0==a.w&&0==a.h||isNaN(a.w)&&isNaN(a.h))a.w=parseInt(this.div.style.width),a.h=parseInt(this.div.style.height);return a},calculateBounds:function(a,b){var c=null;null==a&&(a=this.getCachedCenter());null==b&&(b=this.getResolution());if(null!=a&&null!=b)var c=this.size.w*b/2,d=this.size.h*b/2,c=new OpenLayers.Bounds(a.lon-c,a.lat-d,a.lon+c,a.lat+
d);return c},getCenter:function(){var a=null,b=this.getCachedCenter();b&&(a=b.clone());return a},getCachedCenter:function(){!this.center&&this.size&&(this.center=this.getLonLatFromViewPortPx({x:this.size.w/2,y:this.size.h/2}));return this.center},getZoom:function(){return this.zoom},pan:function(a,b,c){c=OpenLayers.Util.applyDefaults(c,{animate:!0,dragging:!1});if(c.dragging)0==a&&0==b||this.moveByPx(a,b);else{var d=this.getViewPortPxFromLonLat(this.getCachedCenter());a=d.add(a,b);if(this.dragging||
!a.equals(d))d=this.getLonLatFromViewPortPx(a),c.animate?this.panTo(d):(this.moveTo(d),this.dragging&&(this.dragging=!1,this.events.triggerEvent("moveend")))}},panTo:function(a){if(this.panTween&&this.getExtent().scale(this.panRatio).containsLonLat(a)){var b=this.getCachedCenter();if(!a.equals(b)){var b=this.getPixelFromLonLat(b),c=this.getPixelFromLonLat(a),d=0,e=0;this.panTween.start({x:0,y:0},{x:c.x-b.x,y:c.y-b.y},this.panDuration,{callbacks:{eachStep:OpenLayers.Function.bind(function(a){this.moveByPx(a.x-
d,a.y-e);d=Math.round(a.x);e=Math.round(a.y)},this),done:OpenLayers.Function.bind(function(b){this.moveTo(a);this.dragging=!1;this.events.triggerEvent("moveend")},this)}})}}else this.setCenter(a)},setCenter:function(a,b,c,d){this.panTween&&this.panTween.stop();this.zoomTween&&this.zoomTween.stop();this.moveTo(a,b,{dragging:c,forceZoomChange:d})},moveByPx:function(a,b){var c=this.size.w/2,d=this.size.h/2,e=c+a,f=d+b,g=this.baseLayer.wrapDateLine,h=0,k=0;this.restrictedExtent&&(h=c,k=d,g=!1);a=g||e<=
this.maxPx.x-h&&e>=this.minPx.x+h?Math.round(a):0;b=f<=this.maxPx.y-k&&f>=this.minPx.y+k?Math.round(b):0;if(a||b){this.dragging||(this.dragging=!0,this.events.triggerEvent("movestart"));this.center=null;a&&(this.layerContainerOriginPx.x-=a,this.minPx.x-=a,this.maxPx.x-=a);b&&(this.layerContainerOriginPx.y-=b,this.minPx.y-=b,this.maxPx.y-=b);this.applyTransform();d=0;for(e=this.layers.length;d<e;++d)c=this.layers[d],c.visibility&&(c===this.baseLayer||c.inRange)&&(c.moveByPx(a,b),c.events.triggerEvent("move"));
this.events.triggerEvent("move")}},adjustZoom:function(a){if(this.baseLayer&&this.baseLayer.wrapDateLine){var b=this.baseLayer.resolutions,c=this.getMaxExtent().getWidth()/this.size.w;if(this.getResolutionForZoom(a)>c)if(this.fractionalZoom)a=this.getZoomForResolution(c);else for(var d=a|0,e=b.length;d<e;++d)if(b[d]<=c){a=d;break}}return a},getMinZoom:function(){return this.adjustZoom(0)},moveTo:function(a,b,c){null==a||a instanceof OpenLayers.LonLat||(a=new OpenLayers.LonLat(a));c||(c={});null!=
b&&(b=parseFloat(b),this.fractionalZoom||(b=Math.round(b)));var d=b;b=this.adjustZoom(b);b!==d&&(a=this.getCenter());var d=c.dragging||this.dragging,e=c.forceZoomChange;this.getCachedCenter()||this.isValidLonLat(a)||(a=this.maxExtent.getCenterLonLat(),this.center=a.clone());if(null!=this.restrictedExtent){null==a&&(a=this.center);null==b&&(b=this.getZoom());var f=this.getResolutionForZoom(b),f=this.calculateBounds(a,f);if(!this.restrictedExtent.containsBounds(f)){var g=this.restrictedExtent.getCenterLonLat();
f.getWidth()>this.restrictedExtent.getWidth()?a=new OpenLayers.LonLat(g.lon,a.lat):f.left<this.restrictedExtent.left?a=a.add(this.restrictedExtent.left-f.left,0):f.right>this.restrictedExtent.right&&(a=a.add(this.restrictedExtent.right-f.right,0));f.getHeight()>this.restrictedExtent.getHeight()?a=new OpenLayers.LonLat(a.lon,g.lat):f.bottom<this.restrictedExtent.bottom?a=a.add(0,this.restrictedExtent.bottom-f.bottom):f.top>this.restrictedExtent.top&&(a=a.add(0,this.restrictedExtent.top-f.top))}}e=
e||this.isValidZoomLevel(b)&&b!=this.getZoom();f=this.isValidLonLat(a)&&!a.equals(this.center);if(e||f||d){d||this.events.triggerEvent("movestart",{zoomChanged:e});f&&(!e&&this.center&&this.centerLayerContainer(a),this.center=a.clone());a=e?this.getResolutionForZoom(b):this.getResolution();if(e||null==this.layerContainerOrigin){this.layerContainerOrigin=this.getCachedCenter();this.layerContainerOriginPx.x=0;this.layerContainerOriginPx.y=0;this.applyTransform();var f=this.getMaxExtent({restricted:!0}),
h=f.getCenterLonLat(),g=this.center.lon-h.lon,h=h.lat-this.center.lat,k=Math.round(f.getWidth()/a),l=Math.round(f.getHeight()/a);this.minPx={x:(this.size.w-k)/2-g/a,y:(this.size.h-l)/2-h/a};this.maxPx={x:this.minPx.x+Math.round(f.getWidth()/a),y:this.minPx.y+Math.round(f.getHeight()/a)}}e&&(this.zoom=b,this.resolution=a);a=this.getExtent();this.baseLayer.visibility&&(this.baseLayer.moveTo(a,e,c.dragging),c.dragging||this.baseLayer.events.triggerEvent("moveend",{zoomChanged:e}));a=this.baseLayer.getExtent();
for(b=this.layers.length-1;0<=b;--b)f=this.layers[b],f===this.baseLayer||f.isBaseLayer||(g=f.calculateInRange(),f.inRange!=g&&((f.inRange=g)||f.display(!1),this.events.triggerEvent("changelayer",{layer:f,property:"visibility"})),g&&f.visibility&&(f.moveTo(a,e,c.dragging),c.dragging||f.events.triggerEvent("moveend",{zoomChanged:e})));this.events.triggerEvent("move");d||this.events.triggerEvent("moveend");if(e){b=0;for(c=this.popups.length;b<c;b++)this.popups[b].updatePosition();this.events.triggerEvent("zoomend")}}},
centerLayerContainer:function(a){var b=this.getViewPortPxFromLonLat(this.layerContainerOrigin),c=this.getViewPortPxFromLonLat(a);if(null!=b&&null!=c){var d=this.layerContainerOriginPx.x;a=this.layerContainerOriginPx.y;var e=Math.round(b.x-c.x),b=Math.round(b.y-c.y);this.applyTransform(this.layerContainerOriginPx.x=e,this.layerContainerOriginPx.y=b);d-=e;a-=b;this.minPx.x-=d;this.maxPx.x-=d;this.minPx.y-=a;this.maxPx.y-=a}},isValidZoomLevel:function(a){return null!=a&&0<=a&&a<this.getNumZoomLevels()},
isValidLonLat:function(a){var b=!1;null!=a&&(b=this.getMaxExtent(),b=b.containsLonLat(a,{worldBounds:this.baseLayer.wrapDateLine&&b}));return b},getProjection:function(){var a=this.getProjectionObject();return a?a.getCode():null},getProjectionObject:function(){var a=null;null!=this.baseLayer&&(a=this.baseLayer.projection);return a},getMaxResolution:function(){var a=null;null!=this.baseLayer&&(a=this.baseLayer.maxResolution);return a},getMaxExtent:function(a){var b=null;a&&a.restricted&&this.restrictedExtent?
b=this.restrictedExtent:null!=this.baseLayer&&(b=this.baseLayer.maxExtent);return b},getNumZoomLevels:function(){var a=null;null!=this.baseLayer&&(a=this.baseLayer.numZoomLevels);return a},getExtent:function(){var a=null;null!=this.baseLayer&&(a=this.baseLayer.getExtent());return a},getResolution:function(){var a=null;null!=this.baseLayer?a=this.baseLayer.getResolution():!0===this.allOverlays&&0<this.layers.length&&(a=this.layers[0].getResolution());return a},getUnits:function(){var a=null;null!=
this.baseLayer&&(a=this.baseLayer.units);return a},getScale:function(){var a=null;null!=this.baseLayer&&(a=this.getResolution(),a=OpenLayers.Util.getScaleFromResolution(a,this.baseLayer.units));return a},getZoomForExtent:function(a,b){var c=null;null!=this.baseLayer&&(c=this.baseLayer.getZoomForExtent(a,b));return c},getResolutionForZoom:function(a){var b=null;this.baseLayer&&(b=this.baseLayer.getResolutionForZoom(a));return b},getZoomForResolution:function(a,b){var c=null;null!=this.baseLayer&&(c=
this.baseLayer.getZoomForResolution(a,b));return c},zoomTo:function(a,b){var c=this;if(c.isValidZoomLevel(a)){c.baseLayer.wrapDateLine&&(a=c.adjustZoom(a));var d=b?c.getZoomTargetCenter(b,c.getResolutionForZoom(a)):c.getCenter();d&&c.events.triggerEvent("zoomstart",{center:d,zoom:a});if(c.zoomTween){c.zoomTween.stop();var e=c.getResolution(),f=c.getResolutionForZoom(a),e={scale:e/f};b||(f=c.getSize(),b={x:f.w/2,y:f.h/2});c.zoomTween.start({scale:1},e,c.zoomDuration,{minFrameRate:50,callbacks:{eachStep:function(a){var d=
c.layerContainerOriginPx;a=a.scale;c.applyTransform(d.x+((a-1)*(d.x-b.x)|0),d.y+((a-1)*(d.y-b.y)|0),a)},done:function(a){c.applyTransform();var e=c.getResolution()/a.scale,f=c.getZoomForResolution(e,!0);a=1===a.scale?d:c.getZoomTargetCenter(b,e);c.moveTo(a,f)}}})}else c.setCenter(d,a)}},zoomIn:function(){this.zoomTween&&this.zoomTween.stop();this.zoomTo(this.getZoom()+1)},zoomOut:function(){this.zoomTween&&this.zoomTween.stop();this.zoomTo(this.getZoom()-1)},zoomToExtent:function(a,b){a instanceof
OpenLayers.Bounds||(a=new OpenLayers.Bounds(a));var c=a.getCenterLonLat();if(this.baseLayer.wrapDateLine){c=this.getMaxExtent();for(a=a.clone();a.right<a.left;)a.right+=c.getWidth();c=a.getCenterLonLat().wrapDateLine(c)}this.setCenter(c,this.getZoomForExtent(a,b))},zoomToMaxExtent:function(a){a=this.getMaxExtent({restricted:a?a.restricted:!0});this.zoomToExtent(a)},zoomToScale:function(a,b){var c=OpenLayers.Util.getResolutionFromScale(a,this.baseLayer.units),d=this.size.w*c/2,c=this.size.h*c/2,e=
this.getCachedCenter(),d=new OpenLayers.Bounds(e.lon-d,e.lat-c,e.lon+d,e.lat+c);this.zoomToExtent(d,b)},getLonLatFromViewPortPx:function(a){var b=null;null!=this.baseLayer&&(b=this.baseLayer.getLonLatFromViewPortPx(a));return b},getViewPortPxFromLonLat:function(a){var b=null;null!=this.baseLayer&&(b=this.baseLayer.getViewPortPxFromLonLat(a));return b},getZoomTargetCenter:function(a,b){var c=null,d=this.getSize(),e=d.w/2-a.x,d=a.y-d.h/2,f=this.getLonLatFromPixel(a);f&&(c=new OpenLayers.LonLat(f.lon+
e*b,f.lat+d*b));return c},getLonLatFromPixel:function(a){return this.getLonLatFromViewPortPx(a)},getPixelFromLonLat:function(a){a=this.getViewPortPxFromLonLat(a);a.x=Math.round(a.x);a.y=Math.round(a.y);return a},getGeodesicPixelSize:function(a){var b=a?this.getLonLatFromPixel(a):this.getCachedCenter()||new OpenLayers.LonLat(0,0),c=this.getResolution();a=b.add(-c/2,0);var d=b.add(c/2,0),e=b.add(0,-c/2),b=b.add(0,c/2),c=new OpenLayers.Projection("EPSG:4326"),f=this.getProjectionObject()||c;f.equals(c)||
(a.transform(f,c),d.transform(f,c),e.transform(f,c),b.transform(f,c));return new OpenLayers.Size(OpenLayers.Util.distVincenty(a,d),OpenLayers.Util.distVincenty(e,b))},getViewPortPxFromLayerPx:function(a){var b=null;null!=a&&(b=a.add(this.layerContainerOriginPx.x,this.layerContainerOriginPx.y));return b},getLayerPxFromViewPortPx:function(a){var b=null;null!=a&&(b=a.add(-this.layerContainerOriginPx.x,-this.layerContainerOriginPx.y),isNaN(b.x)||isNaN(b.y))&&(b=null);return b},getLonLatFromLayerPx:function(a){a=
this.getViewPortPxFromLayerPx(a);return this.getLonLatFromViewPortPx(a)},getLayerPxFromLonLat:function(a){a=this.getPixelFromLonLat(a);return this.getLayerPxFromViewPortPx(a)},applyTransform:function(a,b,c){c=c||1;var d=this.layerContainerOriginPx,e=1!==c;a=a||d.x;b=b||d.y;var f=this.layerContainerDiv.style,g=this.applyTransform.transform,h=this.applyTransform.template;if(void 0===g&&(g=OpenLayers.Util.vendorPrefix.style("transform"),this.applyTransform.transform=g)){var k=OpenLayers.Element.getStyle(this.viewPortDiv,
OpenLayers.Util.vendorPrefix.css("transform"));k&&"none"===k||(h=["translate3d(",",0) ","scale3d(",",1)"],f[g]=[h[0],"0,0",h[1]].join(""));h&&~f[g].indexOf(h[0])||(h=["translate(",") ","scale(",")"]);this.applyTransform.template=h}null===g||"translate3d("!==h[0]&&!0!==e?(f.left=a+"px",f.top=b+"px",null!==g&&(f[g]="")):(!0===e&&"translate("===h[0]&&(a-=d.x,b-=d.y,f.left=d.x+"px",f.top=d.y+"px"),f[g]=[h[0],a,"px,",b,"px",h[1],h[2],c,",",c,h[3]].join(""))},CLASS_NAME:"OpenLayers.Map"});
OpenLayers.Map.TILE_WIDTH=256;OpenLayers.Map.TILE_HEIGHT=256;OpenLayers.Icon=OpenLayers.Class({url:null,size:null,offset:null,calculateOffset:null,imageDiv:null,px:null,initialize:function(a,b,c,d){this.url=a;this.size=b||{w:20,h:20};this.offset=c||{x:-(this.size.w/2),y:-(this.size.h/2)};this.calculateOffset=d;a=OpenLayers.Util.createUniqueID("OL_Icon_");this.imageDiv=OpenLayers.Util.createAlphaImageDiv(a)},destroy:function(){this.erase();OpenLayers.Event.stopObservingElement(this.imageDiv.firstChild);this.imageDiv.innerHTML="";this.imageDiv=null},clone:function(){return new OpenLayers.Icon(this.url,
this.size,this.offset,this.calculateOffset)},setSize:function(a){null!=a&&(this.size=a);this.draw()},setUrl:function(a){null!=a&&(this.url=a);this.draw()},draw:function(a){OpenLayers.Util.modifyAlphaImageDiv(this.imageDiv,null,null,this.size,this.url,"absolute");this.moveTo(a);return this.imageDiv},erase:function(){null!=this.imageDiv&&null!=this.imageDiv.parentNode&&OpenLayers.Element.remove(this.imageDiv)},setOpacity:function(a){OpenLayers.Util.modifyAlphaImageDiv(this.imageDiv,null,null,null,null,
null,null,null,a)},moveTo:function(a){null!=a&&(this.px=a);null!=this.imageDiv&&(null==this.px?this.display(!1):(this.calculateOffset&&(this.offset=this.calculateOffset(this.size)),OpenLayers.Util.modifyAlphaImageDiv(this.imageDiv,null,{x:this.px.x+this.offset.x,y:this.px.y+this.offset.y})))},display:function(a){this.imageDiv.style.display=a?"":"none"},isDrawn:function(){return this.imageDiv&&this.imageDiv.parentNode&&11!=this.imageDiv.parentNode.nodeType},CLASS_NAME:"OpenLayers.Icon"});OpenLayers.Marker=OpenLayers.Class({icon:null,lonlat:null,events:null,map:null,initialize:function(a,b){this.lonlat=a;var c=b?b:OpenLayers.Marker.defaultIcon();null==this.icon?this.icon=c:(this.icon.url=c.url,this.icon.size=c.size,this.icon.offset=c.offset,this.icon.calculateOffset=c.calculateOffset);this.events=new OpenLayers.Events(this,this.icon.imageDiv)},destroy:function(){this.erase();this.map=null;this.events.destroy();this.events=null;null!=this.icon&&(this.icon.destroy(),this.icon=null)},
draw:function(a){return this.icon.draw(a)},erase:function(){null!=this.icon&&this.icon.erase()},moveTo:function(a){null!=a&&null!=this.icon&&this.icon.moveTo(a);this.lonlat=this.map.getLonLatFromLayerPx(a)},isDrawn:function(){return this.icon&&this.icon.isDrawn()},onScreen:function(){var a=!1;this.map&&(a=this.map.getExtent().containsLonLat(this.lonlat));return a},inflate:function(a){this.icon&&this.icon.setSize({w:this.icon.size.w*a,h:this.icon.size.h*a})},setOpacity:function(a){this.icon.setOpacity(a)},
setUrl:function(a){this.icon.setUrl(a)},display:function(a){this.icon.display(a)},CLASS_NAME:"OpenLayers.Marker"});OpenLayers.Marker.defaultIcon=function(){return new OpenLayers.Icon(OpenLayers.Util.getImageLocation("marker.png"),{w:21,h:25},{x:-10.5,y:-25})};OpenLayers.Layer=OpenLayers.Class({id:null,name:null,div:null,opacity:1,alwaysInRange:null,RESOLUTION_PROPERTIES:"scales resolutions maxScale minScale maxResolution minResolution numZoomLevels maxZoomLevel".split(" "),events:null,map:null,isBaseLayer:!1,alpha:!1,displayInLayerSwitcher:!0,visibility:!0,attribution:null,inRange:!1,imageSize:null,options:null,eventListeners:null,gutter:0,projection:null,units:null,scales:null,resolutions:null,maxExtent:null,minExtent:null,maxResolution:null,minResolution:null,
numZoomLevels:null,minScale:null,maxScale:null,displayOutsideMaxExtent:!1,wrapDateLine:!1,metadata:null,initialize:function(a,b){this.metadata={};b=OpenLayers.Util.extend({},b);null!=this.alwaysInRange&&(b.alwaysInRange=this.alwaysInRange);this.addOptions(b);this.name=a;if(null==this.id&&(this.id=OpenLayers.Util.createUniqueID(this.CLASS_NAME+"_"),this.div=OpenLayers.Util.createDiv(this.id),this.div.style.width="100%",this.div.style.height="100%",this.div.dir="ltr",this.events=new OpenLayers.Events(this,
this.div),this.eventListeners instanceof Object))this.events.on(this.eventListeners)},destroy:function(a){null==a&&(a=!0);null!=this.map&&this.map.removeLayer(this,a);this.options=this.div=this.name=this.map=this.projection=null;this.events&&(this.eventListeners&&this.events.un(this.eventListeners),this.events.destroy());this.events=this.eventListeners=null},clone:function(a){null==a&&(a=new OpenLayers.Layer(this.name,this.getOptions()));OpenLayers.Util.applyDefaults(a,this);a.map=null;return a},
getOptions:function(){var a={},b;for(b in this.options)a[b]=this[b];return a},setName:function(a){a!=this.name&&(this.name=a,null!=this.map&&this.map.events.triggerEvent("changelayer",{layer:this,property:"name"}))},addOptions:function(a,b){null==this.options&&(this.options={});a&&("string"==typeof a.projection&&(a.projection=new OpenLayers.Projection(a.projection)),a.projection&&OpenLayers.Util.applyDefaults(a,OpenLayers.Projection.defaults[a.projection.getCode()]),!a.maxExtent||a.maxExtent instanceof
OpenLayers.Bounds||(a.maxExtent=new OpenLayers.Bounds(a.maxExtent)),!a.minExtent||a.minExtent instanceof OpenLayers.Bounds||(a.minExtent=new OpenLayers.Bounds(a.minExtent)));OpenLayers.Util.extend(this.options,a);OpenLayers.Util.extend(this,a);this.projection&&this.projection.getUnits()&&(this.units=this.projection.getUnits());if(this.map){var c=this.map.getResolution(),d=this.RESOLUTION_PROPERTIES.concat(["projection","units","minExtent","maxExtent"]),e;for(e in a)if(a.hasOwnProperty(e)&&0<=OpenLayers.Util.indexOf(d,
e)){this.initResolutions();b&&this.map.baseLayer===this&&(this.map.setCenter(this.map.getCenter(),this.map.getZoomForResolution(c),!1,!0),this.map.events.triggerEvent("changebaselayer",{layer:this}));break}}},onMapResize:function(){},redraw:function(){var a=!1;if(this.map){this.inRange=this.calculateInRange();var b=this.getExtent();b&&this.inRange&&this.visibility&&(this.moveTo(b,!0,!1),this.events.triggerEvent("moveend",{zoomChanged:!0}),a=!0)}return a},moveTo:function(a,b,c){a=this.visibility;this.isBaseLayer||
(a=a&&this.inRange);this.display(a)},moveByPx:function(a,b){},setMap:function(a){null==this.map&&(this.map=a,this.maxExtent=this.maxExtent||this.map.maxExtent,this.minExtent=this.minExtent||this.map.minExtent,this.projection=this.projection||this.map.projection,"string"==typeof this.projection&&(this.projection=new OpenLayers.Projection(this.projection)),this.projection&&this.projection.getUnits()?this.units=this.projection.getUnits():this.units=this.units||this.map.units,this.initResolutions(),this.isBaseLayer||
(this.inRange=this.calculateInRange(),this.div.style.display=this.visibility&&this.inRange?"":"none"),this.setTileSize())},afterAdd:function(){},removeMap:function(a){},getImageSize:function(a){return this.imageSize||this.tileSize},setTileSize:function(a){this.tileSize=a=a?a:this.tileSize?this.tileSize:this.map.getTileSize();this.gutter&&(this.imageSize=new OpenLayers.Size(a.w+2*this.gutter,a.h+2*this.gutter))},getVisibility:function(){return this.visibility},setVisibility:function(a){a!=this.visibility&&
(this.visibility=a,this.display(a),this.redraw(),null!=this.map&&this.map.events.triggerEvent("changelayer",{layer:this,property:"visibility"}),this.events.triggerEvent("visibilitychanged"))},display:function(a){a!=("none"!=this.div.style.display)&&(this.div.style.display=a&&this.calculateInRange()?"block":"none")},calculateInRange:function(){var a=!1;this.alwaysInRange?a=!0:this.map&&(a=this.map.getResolution(),a=a>=this.minResolution&&a<=this.maxResolution);return a},setIsBaseLayer:function(a){a!=
this.isBaseLayer&&(this.isBaseLayer=a,null!=this.map&&this.map.events.triggerEvent("changebaselayer",{layer:this}))},initResolutions:function(){var a,b,c,d={},e=!0;a=0;for(b=this.RESOLUTION_PROPERTIES.length;a<b;a++)c=this.RESOLUTION_PROPERTIES[a],d[c]=this.options[c],e&&this.options[c]&&(e=!1);null==this.options.alwaysInRange&&(this.alwaysInRange=e);null==d.resolutions&&(d.resolutions=this.resolutionsFromScales(d.scales));null==d.resolutions&&(d.resolutions=this.calculateResolutions(d));if(null==
d.resolutions){a=0;for(b=this.RESOLUTION_PROPERTIES.length;a<b;a++)c=this.RESOLUTION_PROPERTIES[a],d[c]=null!=this.options[c]?this.options[c]:this.map[c];null==d.resolutions&&(d.resolutions=this.resolutionsFromScales(d.scales));null==d.resolutions&&(d.resolutions=this.calculateResolutions(d))}var f;this.options.maxResolution&&"auto"!==this.options.maxResolution&&(f=this.options.maxResolution);this.options.minScale&&(f=OpenLayers.Util.getResolutionFromScale(this.options.minScale,this.units));var g;
this.options.minResolution&&"auto"!==this.options.minResolution&&(g=this.options.minResolution);this.options.maxScale&&(g=OpenLayers.Util.getResolutionFromScale(this.options.maxScale,this.units));d.resolutions&&(d.resolutions.sort(function(a,b){return b-a}),f||(f=d.resolutions[0]),g||(g=d.resolutions[d.resolutions.length-1]));if(this.resolutions=d.resolutions){b=this.resolutions.length;this.scales=Array(b);for(a=0;a<b;a++)this.scales[a]=OpenLayers.Util.getScaleFromResolution(this.resolutions[a],this.units);
this.numZoomLevels=b}if(this.minResolution=g)this.maxScale=OpenLayers.Util.getScaleFromResolution(g,this.units);if(this.maxResolution=f)this.minScale=OpenLayers.Util.getScaleFromResolution(f,this.units)},resolutionsFromScales:function(a){if(null!=a){var b,c,d;d=a.length;b=Array(d);for(c=0;c<d;c++)b[c]=OpenLayers.Util.getResolutionFromScale(a[c],this.units);return b}},calculateResolutions:function(a){var b,c,d=a.maxResolution;null!=a.minScale?d=OpenLayers.Util.getResolutionFromScale(a.minScale,this.units):
"auto"==d&&null!=this.maxExtent&&(b=this.map.getSize(),c=this.maxExtent.getWidth()/b.w,b=this.maxExtent.getHeight()/b.h,d=Math.max(c,b));c=a.minResolution;null!=a.maxScale?c=OpenLayers.Util.getResolutionFromScale(a.maxScale,this.units):"auto"==a.minResolution&&null!=this.minExtent&&(b=this.map.getSize(),c=this.minExtent.getWidth()/b.w,b=this.minExtent.getHeight()/b.h,c=Math.max(c,b));"number"!==typeof d&&"number"!==typeof c&&null!=this.maxExtent&&(d=this.map.getTileSize(),d=Math.max(this.maxExtent.getWidth()/
d.w,this.maxExtent.getHeight()/d.h));b=a.maxZoomLevel;a=a.numZoomLevels;"number"===typeof c&&"number"===typeof d&&void 0===a?a=Math.floor(Math.log(d/c)/Math.log(2))+1:void 0===a&&null!=b&&(a=b+1);if(!("number"!==typeof a||0>=a||"number"!==typeof d&&"number"!==typeof c)){b=Array(a);var e=2;"number"==typeof c&&"number"==typeof d&&(e=Math.pow(d/c,1/(a-1)));var f;if("number"===typeof d)for(f=0;f<a;f++)b[f]=d/Math.pow(e,f);else for(f=0;f<a;f++)b[a-1-f]=c*Math.pow(e,f);return b}},getResolution:function(){var a=
this.map.getZoom();return this.getResolutionForZoom(a)},getExtent:function(){return this.map.calculateBounds()},getZoomForExtent:function(a,b){var c=this.map.getSize(),c=Math.max(a.getWidth()/c.w,a.getHeight()/c.h);return this.getZoomForResolution(c,b)},getDataExtent:function(){},getResolutionForZoom:function(a){a=Math.max(0,Math.min(a,this.resolutions.length-1));if(this.map.fractionalZoom){var b=Math.floor(a);a=this.resolutions[b]-(a-b)*(this.resolutions[b]-this.resolutions[Math.ceil(a)])}else a=
this.resolutions[Math.round(a)];return a},getZoomForResolution:function(a,b){var c,d;if(this.map.fractionalZoom){var e=0,f=this.resolutions[e],g=this.resolutions[this.resolutions.length-1],h;c=0;for(d=this.resolutions.length;c<d;++c)if(h=this.resolutions[c],h>=a&&(f=h,e=c),h<=a){g=h;break}c=f-g;c=0<c?e+(f-a)/c:e}else{f=Number.POSITIVE_INFINITY;c=0;for(d=this.resolutions.length;c<d;c++)if(b){e=Math.abs(this.resolutions[c]-a);if(e>f)break;f=e}else if(this.resolutions[c]<a)break;c=Math.max(0,c-1)}return c},
getLonLatFromViewPortPx:function(a){var b=null,c=this.map;if(null!=a&&c.minPx){var b=c.getResolution(),d=c.getMaxExtent({restricted:!0}),b=new OpenLayers.LonLat((a.x-c.minPx.x)*b+d.left,(c.minPx.y-a.y)*b+d.top);this.wrapDateLine&&(b=b.wrapDateLine(this.maxExtent))}return b},getViewPortPxFromLonLat:function(a,b){var c=null;null!=a&&(b=b||this.map.getResolution(),c=this.map.calculateBounds(null,b),c=new OpenLayers.Pixel(1/b*(a.lon-c.left),1/b*(c.top-a.lat)));return c},setOpacity:function(a){if(a!=this.opacity){this.opacity=
a;for(var b=this.div.childNodes,c=0,d=b.length;c<d;++c){var e=b[c].firstChild||b[c],f=b[c].lastChild;f&&"iframe"===f.nodeName.toLowerCase()&&(e=f.parentNode);OpenLayers.Util.modifyDOMElement(e,null,null,null,null,null,null,a)}null!=this.map&&this.map.events.triggerEvent("changelayer",{layer:this,property:"opacity"})}},getZIndex:function(){return this.div.style.zIndex},setZIndex:function(a){this.div.style.zIndex=a},adjustBounds:function(a){if(this.gutter){var b=this.gutter*this.map.getResolution();
a=new OpenLayers.Bounds(a.left-b,a.bottom-b,a.right+b,a.top+b)}this.wrapDateLine&&(b={rightTolerance:this.getResolution(),leftTolerance:this.getResolution()},a=a.wrapDateLine(this.maxExtent,b));return a},CLASS_NAME:"OpenLayers.Layer"});OpenLayers.Layer.HTTPRequest=OpenLayers.Class(OpenLayers.Layer,{URL_HASH_FACTOR:(Math.sqrt(5)-1)/2,url:null,params:null,reproject:!1,initialize:function(a,b,c,d){OpenLayers.Layer.prototype.initialize.apply(this,[a,d]);this.url=b;this.params||(this.params=OpenLayers.Util.extend({},c))},destroy:function(){this.params=this.url=null;OpenLayers.Layer.prototype.destroy.apply(this,arguments)},clone:function(a){null==a&&(a=new OpenLayers.Layer.HTTPRequest(this.name,this.url,this.params,this.getOptions()));
return a=OpenLayers.Layer.prototype.clone.apply(this,[a])},setUrl:function(a){this.url=a},mergeNewParams:function(a){this.params=OpenLayers.Util.extend(this.params,a);a=this.redraw();null!=this.map&&this.map.events.triggerEvent("changelayer",{layer:this,property:"params"});return a},redraw:function(a){return a?(this.events.triggerEvent("refresh"),this.mergeNewParams({_olSalt:Math.random()})):OpenLayers.Layer.prototype.redraw.apply(this,[])},selectUrl:function(a,b){for(var c=1,d=0,e=a.length;d<e;d++)c*=
a.charCodeAt(d)*this.URL_HASH_FACTOR,c-=Math.floor(c);return b[Math.floor(c*b.length)]},getFullRequestString:function(a,b){var c=b||this.url,d=OpenLayers.Util.extend({},this.params),d=OpenLayers.Util.extend(d,a),e=OpenLayers.Util.getParameterString(d);OpenLayers.Util.isArray(c)&&(c=this.selectUrl(e,c));var e=OpenLayers.Util.upperCaseObject(OpenLayers.Util.getParameters(c)),f;for(f in d)f.toUpperCase()in e&&delete d[f];e=OpenLayers.Util.getParameterString(d);return OpenLayers.Util.urlAppend(c,e)},
CLASS_NAME:"OpenLayers.Layer.HTTPRequest"});OpenLayers.Tile=OpenLayers.Class({events:null,eventListeners:null,id:null,layer:null,url:null,bounds:null,size:null,position:null,isLoading:!1,initialize:function(a,b,c,d,e,f){this.layer=a;this.position=b.clone();this.setBounds(c);this.url=d;e&&(this.size=e.clone());this.id=OpenLayers.Util.createUniqueID("Tile_");OpenLayers.Util.extend(this,f);this.events=new OpenLayers.Events(this);if(this.eventListeners instanceof Object)this.events.on(this.eventListeners)},unload:function(){this.isLoading&&(this.isLoading=
!1,this.events.triggerEvent("unload"))},destroy:function(){this.position=this.size=this.bounds=this.layer=null;this.eventListeners&&this.events.un(this.eventListeners);this.events.destroy();this.events=this.eventListeners=null},draw:function(a){a||this.clear();var b=this.shouldDraw();b&&!a&&!1===this.events.triggerEvent("beforedraw")&&(b=null);return b},shouldDraw:function(){var a=!1,b=this.layer.maxExtent;if(b){var c=this.layer.map,c=c.baseLayer.wrapDateLine&&c.getMaxExtent();this.bounds.intersectsBounds(b,
{inclusive:!1,worldBounds:c})&&(a=!0)}return a||this.layer.displayOutsideMaxExtent},setBounds:function(a){a=a.clone();if(this.layer.map.baseLayer.wrapDateLine){var b=this.layer.map.getMaxExtent(),c=this.layer.map.getResolution();a=a.wrapDateLine(b,{leftTolerance:c,rightTolerance:c})}this.bounds=a},moveTo:function(a,b,c){null==c&&(c=!0);this.setBounds(a);this.position=b.clone();c&&this.draw()},clear:function(a){},CLASS_NAME:"OpenLayers.Tile"});OpenLayers.Tile.Image=OpenLayers.Class(OpenLayers.Tile,{url:null,imgDiv:null,frame:null,imageReloadAttempts:null,layerAlphaHack:null,asyncRequestId:null,maxGetUrlLength:null,canvasContext:null,crossOriginKeyword:null,initialize:function(a,b,c,d,e,f){OpenLayers.Tile.prototype.initialize.apply(this,arguments);this.url=d;this.layerAlphaHack=this.layer.alpha&&OpenLayers.Util.alphaHack();if(null!=this.maxGetUrlLength||this.layer.gutter||this.layerAlphaHack)this.frame=document.createElement("div"),this.frame.style.position=
"absolute",this.frame.style.overflow="hidden";null!=this.maxGetUrlLength&&OpenLayers.Util.extend(this,OpenLayers.Tile.Image.IFrame)},destroy:function(){this.imgDiv&&(this.clear(),this.frame=this.imgDiv=null);this.asyncRequestId=null;OpenLayers.Tile.prototype.destroy.apply(this,arguments)},draw:function(){var a=OpenLayers.Tile.prototype.draw.apply(this,arguments);a?(this.layer!=this.layer.map.baseLayer&&this.layer.reproject&&(this.bounds=this.getBoundsFromBaseLayer(this.position)),this.isLoading?this._loadEvent=
"reload":(this.isLoading=!0,this._loadEvent="loadstart"),this.renderTile(),this.positionTile()):!1===a&&this.unload();return a},renderTile:function(){if(this.layer.async){var a=this.asyncRequestId=(this.asyncRequestId||0)+1;this.layer.getURLasync(this.bounds,function(b){a==this.asyncRequestId&&(this.url=b,this.initImage())},this)}else this.url=this.layer.getURL(this.bounds),this.initImage()},positionTile:function(){var a=this.getTile().style,b=this.frame?this.size:this.layer.getImageSize(this.bounds),
c=1;this.layer instanceof OpenLayers.Layer.Grid&&(c=this.layer.getServerResolution()/this.layer.map.getResolution());a.left=this.position.x+"px";a.top=this.position.y+"px";a.width=Math.round(c*b.w)+"px";a.height=Math.round(c*b.h)+"px"},clear:function(){OpenLayers.Tile.prototype.clear.apply(this,arguments);var a=this.imgDiv;if(a){var b=this.getTile();b.parentNode===this.layer.div&&this.layer.div.removeChild(b);this.setImgSrc();!0===this.layerAlphaHack&&(a.style.filter="");OpenLayers.Element.removeClass(a,
"olImageLoadError")}this.canvasContext=null},getImage:function(){if(!this.imgDiv){this.imgDiv=OpenLayers.Tile.Image.IMAGE.cloneNode(!1);var a=this.imgDiv.style;if(this.frame){var b=0,c=0;this.layer.gutter&&(b=this.layer.gutter/this.layer.tileSize.w*100,c=this.layer.gutter/this.layer.tileSize.h*100);a.left=-b+"%";a.top=-c+"%";a.width=2*b+100+"%";a.height=2*c+100+"%"}a.visibility="hidden";a.opacity=0;1>this.layer.opacity&&(a.filter="alpha(opacity="+100*this.layer.opacity+")");a.position="absolute";
this.layerAlphaHack&&(a.paddingTop=a.height,a.height="0",a.width="100%");this.frame&&this.frame.appendChild(this.imgDiv)}return this.imgDiv},setImage:function(a){this.imgDiv=a},initImage:function(){if(this.url||this.imgDiv){this.events.triggerEvent("beforeload");this.layer.div.appendChild(this.getTile());this.events.triggerEvent(this._loadEvent);var a=this.getImage(),b=a.getAttribute("src")||"";this.url&&OpenLayers.Util.isEquivalentUrl(b,this.url)?this._loadTimeout=window.setTimeout(OpenLayers.Function.bind(this.onImageLoad,
this),0):(this.stopLoading(),this.crossOriginKeyword&&a.removeAttribute("crossorigin"),OpenLayers.Event.observe(a,"load",OpenLayers.Function.bind(this.onImageLoad,this)),OpenLayers.Event.observe(a,"error",OpenLayers.Function.bind(this.onImageError,this)),this.imageReloadAttempts=0,this.setImgSrc(this.url))}else this.isLoading=!1},setImgSrc:function(a){var b=this.imgDiv;a?(b.style.visibility="hidden",b.style.opacity=0,this.crossOriginKeyword&&("data:"!==a.substr(0,5)?b.setAttribute("crossorigin",this.crossOriginKeyword):
b.removeAttribute("crossorigin")),b.src=a):(this.stopLoading(),this.imgDiv=null,b.parentNode&&b.parentNode.removeChild(b))},getTile:function(){return this.frame?this.frame:this.getImage()},createBackBuffer:function(){if(this.imgDiv&&!this.isLoading){var a;this.frame?(a=this.frame.cloneNode(!1),a.appendChild(this.imgDiv)):a=this.imgDiv;this.imgDiv=null;return a}},onImageLoad:function(){var a=this.imgDiv;this.stopLoading();a.style.visibility="inherit";a.style.opacity=this.layer.opacity;this.isLoading=
!1;this.canvasContext=null;this.events.triggerEvent("loadend");!0===this.layerAlphaHack&&(a.style.filter="progid:DXImageTransform.Microsoft.AlphaImageLoader(src='"+a.src+"', sizingMethod='scale')")},onImageError:function(){var a=this.imgDiv;null!=a.src&&(this.imageReloadAttempts++,this.imageReloadAttempts<=OpenLayers.IMAGE_RELOAD_ATTEMPTS?this.setImgSrc(this.layer.getURL(this.bounds)):(OpenLayers.Element.addClass(a,"olImageLoadError"),this.events.triggerEvent("loaderror"),this.onImageLoad()))},stopLoading:function(){OpenLayers.Event.stopObservingElement(this.imgDiv);
window.clearTimeout(this._loadTimeout);delete this._loadTimeout},getCanvasContext:function(){if(OpenLayers.CANVAS_SUPPORTED&&this.imgDiv&&!this.isLoading){if(!this.canvasContext){var a=document.createElement("canvas");a.width=this.size.w;a.height=this.size.h;this.canvasContext=a.getContext("2d");this.canvasContext.drawImage(this.imgDiv,0,0)}return this.canvasContext}},CLASS_NAME:"OpenLayers.Tile.Image"});
OpenLayers.Tile.Image.IMAGE=function(){var a=new Image;a.className="olTileImage";a.galleryImg="no";return a}();OpenLayers.Layer.Grid=OpenLayers.Class(OpenLayers.Layer.HTTPRequest,{tileSize:null,tileOriginCorner:"bl",tileOrigin:null,tileOptions:null,tileClass:OpenLayers.Tile.Image,grid:null,singleTile:!1,ratio:1.5,buffer:0,transitionEffect:"resize",numLoadingTiles:0,serverResolutions:null,loading:!1,backBuffer:null,gridResolution:null,backBufferResolution:null,backBufferLonLat:null,backBufferTimerId:null,removeBackBufferDelay:null,className:null,gridLayout:null,rowSign:null,transitionendEvents:["transitionend",
"webkitTransitionEnd","otransitionend","oTransitionEnd"],initialize:function(a,b,c,d){OpenLayers.Layer.HTTPRequest.prototype.initialize.apply(this,arguments);this.grid=[];this._removeBackBuffer=OpenLayers.Function.bind(this.removeBackBuffer,this);this.initProperties();this.rowSign="t"===this.tileOriginCorner.substr(0,1)?1:-1},initProperties:function(){void 0===this.options.removeBackBufferDelay&&(this.removeBackBufferDelay=this.singleTile?0:2500);void 0===this.options.className&&(this.className=this.singleTile?
"olLayerGridSingleTile":"olLayerGrid")},setMap:function(a){OpenLayers.Layer.HTTPRequest.prototype.setMap.call(this,a);OpenLayers.Element.addClass(this.div,this.className)},removeMap:function(a){this.removeBackBuffer()},destroy:function(){this.removeBackBuffer();this.clearGrid();this.tileSize=this.grid=null;OpenLayers.Layer.HTTPRequest.prototype.destroy.apply(this,arguments)},clearGrid:function(){if(this.grid){for(var a=0,b=this.grid.length;a<b;a++)for(var c=this.grid[a],d=0,e=c.length;d<e;d++)this.destroyTile(c[d]);
this.grid=[];this.gridLayout=this.gridResolution=null}},addOptions:function(a,b){var c=void 0!==a.singleTile&&a.singleTile!==this.singleTile;OpenLayers.Layer.HTTPRequest.prototype.addOptions.apply(this,arguments);this.map&&c&&(this.initProperties(),this.clearGrid(),this.tileSize=this.options.tileSize,this.setTileSize(),this.visibility&&this.moveTo(null,!0))},clone:function(a){null==a&&(a=new OpenLayers.Layer.Grid(this.name,this.url,this.params,this.getOptions()));a=OpenLayers.Layer.HTTPRequest.prototype.clone.apply(this,
[a]);null!=this.tileSize&&(a.tileSize=this.tileSize.clone());a.grid=[];a.gridResolution=null;a.backBuffer=null;a.backBufferTimerId=null;a.loading=!1;a.numLoadingTiles=0;return a},moveTo:function(a,b,c){OpenLayers.Layer.HTTPRequest.prototype.moveTo.apply(this,arguments);a=a||this.map.getExtent();if(null!=a){var d=!this.grid.length||b,e=this.getTilesBounds(),f=this.map.getResolution();this.getServerResolution(f);if(this.singleTile){if(d||!c&&!e.containsBounds(a))b&&"resize"!==this.transitionEffect&&
this.removeBackBuffer(),b&&"resize"!==this.transitionEffect||this.applyBackBuffer(f),this.initSingleTile(a)}else(d=d||!e.intersectsBounds(a,{worldBounds:this.map.baseLayer.wrapDateLine&&this.map.getMaxExtent()}))?(!b||"resize"!==this.transitionEffect&&this.gridResolution!==f||this.applyBackBuffer(f),this.initGriddedTiles(a)):this.moveGriddedTiles()}},getTileData:function(a){var b=null,c=a.lon,d=a.lat,e=this.grid.length;if(this.map&&e){var f=this.map.getResolution();a=this.tileSize.w;var g=this.tileSize.h,
h=this.grid[0][0].bounds,k=h.left,h=h.top;if(c<k&&this.map.baseLayer.wrapDateLine)var l=this.map.getMaxExtent().getWidth(),c=c+l*Math.ceil((k-c)/l);c=(c-k)/(f*a);d=(h-d)/(f*g);f=Math.floor(c);k=Math.floor(d);0<=k&&k<e&&(e=this.grid[k][f])&&(b={tile:e,i:Math.floor((c-f)*a),j:Math.floor((d-k)*g)})}return b},destroyTile:function(a){this.removeTileMonitoringHooks(a);a.destroy()},getServerResolution:function(a){var b=Number.POSITIVE_INFINITY;a=a||this.map.getResolution();if(this.serverResolutions&&-1===
OpenLayers.Util.indexOf(this.serverResolutions,a)){var c,d,e,f;for(c=this.serverResolutions.length-1;0<=c;c--){e=this.serverResolutions[c];d=Math.abs(e-a);if(d>b)break;b=d;f=e}a=f}return a},getServerZoom:function(){var a=this.getServerResolution();return this.serverResolutions?OpenLayers.Util.indexOf(this.serverResolutions,a):this.map.getZoomForResolution(a)+(this.zoomOffset||0)},applyBackBuffer:function(a){null!==this.backBufferTimerId&&this.removeBackBuffer();var b=this.backBuffer;if(!b){b=this.createBackBuffer();
if(!b)return;a===this.gridResolution?this.div.insertBefore(b,this.div.firstChild):this.map.baseLayer.div.parentNode.insertBefore(b,this.map.baseLayer.div);this.backBuffer=b;var c=this.grid[0][0].bounds;this.backBufferLonLat={lon:c.left,lat:c.top};this.backBufferResolution=this.gridResolution}for(var c=this.backBufferResolution/a,d=b.childNodes,e,f=d.length-1;0<=f;--f)e=d[f],e.style.top=(c*e._i*b._th|0)+"px",e.style.left=(c*e._j*b._tw|0)+"px",e.style.width=Math.round(c*e._w)+"px",e.style.height=Math.round(c*
e._h)+"px";a=this.getViewPortPxFromLonLat(this.backBufferLonLat,a);c=this.map.layerContainerOriginPx.y;b.style.left=Math.round(a.x-this.map.layerContainerOriginPx.x)+"px";b.style.top=Math.round(a.y-c)+"px"},createBackBuffer:function(){var a;if(0<this.grid.length){a=document.createElement("div");a.id=this.div.id+"_bb";a.className="olBackBuffer";a.style.position="absolute";var b=this.map;a.style.zIndex="resize"===this.transitionEffect?this.getZIndex()-1:b.Z_INDEX_BASE.BaseLayer-(b.getNumLayers()-b.getLayerIndex(this));
for(var b=0,c=this.grid.length;b<c;b++)for(var d=0,e=this.grid[b].length;d<e;d++){var f=this.grid[b][d],g=this.grid[b][d].createBackBuffer();g&&(g._i=b,g._j=d,g._w=this.singleTile?this.getImageSize(f.bounds).w:f.size.w,g._h=f.size.h,g.id=f.id+"_bb",a.appendChild(g))}a._tw=this.tileSize.w;a._th=this.tileSize.h}return a},removeBackBuffer:function(){if(this._transitionElement){for(var a=this.transitionendEvents.length-1;0<=a;--a)OpenLayers.Event.stopObserving(this._transitionElement,this.transitionendEvents[a],
this._removeBackBuffer);delete this._transitionElement}this.backBuffer&&(this.backBuffer.parentNode&&this.backBuffer.parentNode.removeChild(this.backBuffer),this.backBufferResolution=this.backBuffer=null,null!==this.backBufferTimerId&&(window.clearTimeout(this.backBufferTimerId),this.backBufferTimerId=null))},moveByPx:function(a,b){this.singleTile||this.moveGriddedTiles()},setTileSize:function(a){this.singleTile&&(a=this.map.getSize(),a.h=parseInt(a.h*this.ratio,10),a.w=parseInt(a.w*this.ratio,10));
OpenLayers.Layer.HTTPRequest.prototype.setTileSize.apply(this,[a])},getTilesBounds:function(){var a=null,b=this.grid.length;if(b)var a=this.grid[b-1][0].bounds,b=this.grid[0].length*a.getWidth(),c=this.grid.length*a.getHeight(),a=new OpenLayers.Bounds(a.left,a.bottom,a.left+b,a.bottom+c);return a},initSingleTile:function(a){this.events.triggerEvent("retile");var b=a.getCenterLonLat(),c=a.getWidth()*this.ratio;a=a.getHeight()*this.ratio;b=new OpenLayers.Bounds(b.lon-c/2,b.lat-a/2,b.lon+c/2,b.lat+a/
2);this.gridResolution=this.getServerResolution();(c=this.maxExtent)&&(!this.displayOutsideMaxExtent||this.map.baseLayer.wrapDateLine&&this.maxExtent.equals(this.map.getMaxExtent()))&&(b.left=Math.max(b.left,c.left),b.right=Math.min(b.right,c.right));c=this.map.getLayerPxFromLonLat({lon:b.left,lat:b.top});this.grid.length||(this.grid[0]=[]);(a=this.grid[0][0])?a.moveTo(b,c):(a=this.addTile(b,c),this.addTileMonitoringHooks(a),a.draw(),this.grid[0][0]=a);this.removeExcessTiles(1,1)},calculateGridLayout:function(a,
b,c){var d=c*this.tileSize.w;c*=this.tileSize.h;var e=Math.floor((a.left-b.lon)/d)-this.buffer,f=this.rowSign;a=Math[~f?"floor":"ceil"](f*(b.lat-a.top+c)/c)-this.buffer*f;return{tilelon:d,tilelat:c,startcol:e,startrow:a}},getImageSize:function(a){var b=OpenLayers.Layer.HTTPRequest.prototype.getImageSize.apply(this,arguments);this.singleTile&&(b=new OpenLayers.Size(Math.round(a.getWidth()/this.gridResolution),b.h));return b},getTileOrigin:function(){var a=this.tileOrigin;if(!a)var a=this.getMaxExtent(),
b={tl:["left","top"],tr:["right","top"],bl:["left","bottom"],br:["right","bottom"]}[this.tileOriginCorner],a=new OpenLayers.LonLat(a[b[0]],a[b[1]]);return a},getTileBoundsForGridIndex:function(a,b){var c=this.getTileOrigin(),d=this.gridLayout,e=d.tilelon,f=d.tilelat,g=d.startcol,d=d.startrow,h=this.rowSign;return new OpenLayers.Bounds(c.lon+(g+b)*e,c.lat-(d+a*h)*f*h,c.lon+(g+b+1)*e,c.lat-(d+(a-1)*h)*f*h)},initGriddedTiles:function(a){this.events.triggerEvent("retile");var b=this.map.getSize(),c=this.getTileOrigin(),
d=this.map.getResolution(),e=this.getServerResolution(),f=d/e,d=this.tileSize.w/f,f=this.tileSize.h/f,g=Math.ceil(b.h/f)+2*this.buffer+1,b=Math.ceil(b.w/d)+2*this.buffer+1;this.gridLayout=e=this.calculateGridLayout(a,c,e);var c=e.tilelon,h=e.tilelat,e=this.map.layerContainerOriginPx.x,k=this.map.layerContainerOriginPx.y,l=this.getTileBoundsForGridIndex(0,0),m=this.map.getViewPortPxFromLonLat(new OpenLayers.LonLat(l.left,l.top));m.x=Math.round(m.x)-e;m.y=Math.round(m.y)-k;var e=[],k=this.map.getCenter(),
q=0;do{var n=this.grid[q];n||(n=[],this.grid.push(n));var p=0;do{var l=this.getTileBoundsForGridIndex(q,p),r=m.clone();r.x+=p*Math.round(d);r.y+=q*Math.round(f);var t=n[p];t?t.moveTo(l,r,!1):(t=this.addTile(l,r),this.addTileMonitoringHooks(t),n.push(t));r=l.getCenterLonLat();e.push({tile:t,distance:Math.pow(r.lon-k.lon,2)+Math.pow(r.lat-k.lat,2)});p+=1}while(l.right<=a.right+c*this.buffer||p<b);q+=1}while(l.bottom>=a.bottom-h*this.buffer||q<g);this.removeExcessTiles(q,p);this.gridResolution=d=this.getServerResolution();
e.sort(function(a,b){return a.distance-b.distance});a=0;for(d=e.length;a<d;++a)e[a].tile.draw()},getMaxExtent:function(){return this.maxExtent},addTile:function(a,b){var c=new this.tileClass(this,b,a,null,this.tileSize,this.tileOptions);this.events.triggerEvent("addtile",{tile:c});return c},addTileMonitoringHooks:function(a){a.onLoadStart=function(){!1===this.loading&&(this.loading=!0,this.events.triggerEvent("loadstart"));this.events.triggerEvent("tileloadstart",{tile:a});this.numLoadingTiles++;
!this.singleTile&&this.backBuffer&&this.gridResolution===this.backBufferResolution&&OpenLayers.Element.addClass(a.getTile(),"olTileReplacing")};a.onLoadEnd=function(b){this.numLoadingTiles--;b="unload"===b.type;this.events.triggerEvent("tileloaded",{tile:a,aborted:b});if(!this.singleTile&&!b&&this.backBuffer&&this.gridResolution===this.backBufferResolution){var c=a.getTile();if("none"===OpenLayers.Element.getStyle(c,"display")){var d=document.getElementById(a.id+"_bb");d&&d.parentNode.removeChild(d)}OpenLayers.Element.removeClass(c,
"olTileReplacing")}if(0===this.numLoadingTiles){if(this.backBuffer)if(0===this.backBuffer.childNodes.length)this.removeBackBuffer();else{this._transitionElement=b?this.div.lastChild:a.imgDiv;b=this.transitionendEvents;if(this._transitionElement)for(c=b.length-1;0<=c;--c)OpenLayers.Event.observe(this._transitionElement,b[c],this._removeBackBuffer);this.backBufferTimerId=window.setTimeout(this._removeBackBuffer,this.removeBackBufferDelay)}this.loading=!1;this.events.triggerEvent("loadend")}};a.onLoadError=
function(){this.events.triggerEvent("tileerror",{tile:a})};a.events.on({loadstart:a.onLoadStart,loadend:a.onLoadEnd,unload:a.onLoadEnd,loaderror:a.onLoadError,scope:this})},removeTileMonitoringHooks:function(a){a.unload();a.events.un({loadstart:a.onLoadStart,loadend:a.onLoadEnd,unload:a.onLoadEnd,loaderror:a.onLoadError,scope:this})},moveGriddedTiles:function(){for(var a=this.buffer+1;;){var b=this.grid[0][0],c=b.position.x+this.map.layerContainerOriginPx.x,b=b.position.y+this.map.layerContainerOriginPx.y,
d=this.getServerResolution()/this.map.getResolution(),d={w:Math.round(this.tileSize.w*d),h:Math.round(this.tileSize.h*d)};if(c>-d.w*(a-1))this.shiftColumn(!0,d);else if(c<-d.w*a)this.shiftColumn(!1,d);else if(b>-d.h*(a-1))this.shiftRow(!0,d);else if(b<-d.h*a)this.shiftRow(!1,d);else break}},shiftRow:function(a,b){var c=this.grid,d=a?0:c.length-1,e=a?-1:1;this.gridLayout.startrow+=e*this.rowSign;for(var f=c[d],g=c[a?"pop":"shift"](),h=0,k=g.length;h<k;h++){var l=g[h],m=f[h].position.clone();m.y+=b.h*
e;l.moveTo(this.getTileBoundsForGridIndex(d,h),m)}c[a?"unshift":"push"](g)},shiftColumn:function(a,b){var c=this.grid,d=a?0:c[0].length-1,e=a?-1:1;this.gridLayout.startcol+=e;for(var f=0,g=c.length;f<g;f++){var h=c[f],k=h[d].position.clone(),l=h[a?"pop":"shift"]();k.x+=b.w*e;l.moveTo(this.getTileBoundsForGridIndex(f,d),k);h[a?"unshift":"push"](l)}},removeExcessTiles:function(a,b){for(var c,d;this.grid.length>a;){var e=this.grid.pop();c=0;for(d=e.length;c<d;c++){var f=e[c];this.destroyTile(f)}}c=0;
for(d=this.grid.length;c<d;c++)for(;this.grid[c].length>b;)e=this.grid[c],f=e.pop(),this.destroyTile(f)},onMapResize:function(){this.singleTile&&(this.clearGrid(),this.setTileSize())},getTileBounds:function(a){var b=this.maxExtent,c=this.getResolution(),d=c*this.tileSize.w,c=c*this.tileSize.h,e=this.getLonLatFromViewPortPx(a);a=b.left+d*Math.floor((e.lon-b.left)/d);b=b.bottom+c*Math.floor((e.lat-b.bottom)/c);return new OpenLayers.Bounds(a,b,a+d,b+c)},CLASS_NAME:"OpenLayers.Layer.Grid"});OpenLayers.TileManager=OpenLayers.Class({cacheSize:256,tilesPerFrame:2,frameDelay:16,moveDelay:100,zoomDelay:200,maps:null,tileQueueId:null,tileQueue:null,tileCache:null,tileCacheIndex:null,initialize:function(a){OpenLayers.Util.extend(this,a);this.maps=[];this.tileQueueId={};this.tileQueue={};this.tileCache={};this.tileCacheIndex=[]},addMap:function(a){if(!this._destroyed&&OpenLayers.Layer.Grid){this.maps.push(a);this.tileQueue[a.id]=[];for(var b=0,c=a.layers.length;b<c;++b)this.addLayer({layer:a.layers[b]});
a.events.on({move:this.move,zoomend:this.zoomEnd,changelayer:this.changeLayer,addlayer:this.addLayer,preremovelayer:this.removeLayer,scope:this})}},removeMap:function(a){if(!this._destroyed&&OpenLayers.Layer.Grid){window.clearTimeout(this.tileQueueId[a.id]);if(a.layers)for(var b=0,c=a.layers.length;b<c;++b)this.removeLayer({layer:a.layers[b]});a.events&&a.events.un({move:this.move,zoomend:this.zoomEnd,changelayer:this.changeLayer,addlayer:this.addLayer,preremovelayer:this.removeLayer,scope:this});
delete this.tileQueue[a.id];delete this.tileQueueId[a.id];OpenLayers.Util.removeItem(this.maps,a)}},move:function(a){this.updateTimeout(a.object,this.moveDelay,!0)},zoomEnd:function(a){this.updateTimeout(a.object,this.zoomDelay)},changeLayer:function(a){"visibility"!==a.property&&"params"!==a.property||this.updateTimeout(a.object,0)},addLayer:function(a){a=a.layer;if(a instanceof OpenLayers.Layer.Grid){a.events.on({addtile:this.addTile,refresh:this.handleLayerRefresh,retile:this.clearTileQueue,scope:this});
var b,c,d;for(b=a.grid.length-1;0<=b;--b)for(c=a.grid[b].length-1;0<=c;--c)d=a.grid[b][c],this.addTile({tile:d}),d.url&&!d.imgDiv&&this.manageTileCache({object:d})}},removeLayer:function(a){a=a.layer;if(a instanceof OpenLayers.Layer.Grid&&(this.clearTileQueue({object:a}),a.events&&a.events.un({addtile:this.addTile,refresh:this.handleLayerRefresh,retile:this.clearTileQueue,scope:this}),a.grid)){var b,c,d;for(b=a.grid.length-1;0<=b;--b)for(c=a.grid[b].length-1;0<=c;--c)d=a.grid[b][c],this.unloadTile({object:d})}},
handleLayerRefresh:function(a){a=a.object;if(a.grid){var b,c,d;for(b=a.grid.length-1;0<=b;--b)for(c=a.grid[b].length-1;0<=c;--c)d=a.grid[b][c],OpenLayers.Util.removeItem(this.tileCacheIndex,d.url),delete this.tileCache[d.url]}},updateTimeout:function(a,b,c){window.clearTimeout(this.tileQueueId[a.id]);var d=this.tileQueue[a.id];if(!c||d.length)this.tileQueueId[a.id]=window.setTimeout(OpenLayers.Function.bind(function(){this.drawTilesFromQueue(a);d.length&&this.updateTimeout(a,this.frameDelay)},this),
b)},addTile:function(a){if(a.tile instanceof OpenLayers.Tile.Image){if(!a.tile.layer.singleTile)a.tile.events.on({beforedraw:this.queueTileDraw,beforeload:this.manageTileCache,loadend:this.addToCache,unload:this.unloadTile,scope:this})}else this.removeLayer({layer:a.tile.layer})},unloadTile:function(a){a=a.object;a.events.un({beforedraw:this.queueTileDraw,beforeload:this.manageTileCache,loadend:this.addToCache,unload:this.unloadTile,scope:this});OpenLayers.Util.removeItem(this.tileQueue[a.layer.map.id],
a)},queueTileDraw:function(a){a=a.object;var b=!1,c=a.layer,d=c.getURL(a.bounds),e=this.tileCache[d];e&&"olTileImage"!==e.className&&(delete this.tileCache[d],OpenLayers.Util.removeItem(this.tileCacheIndex,d),e=null);!c.url||!c.async&&e||(b=this.tileQueue[c.map.id],~OpenLayers.Util.indexOf(b,a)||b.push(a),b=!0);return!b},drawTilesFromQueue:function(a){var b=this.tileQueue[a.id],c=this.tilesPerFrame;for(a=a.zoomTween&&a.zoomTween.playing;!a&&b.length&&c;)b.shift().draw(!0),--c},manageTileCache:function(a){a=
a.object;var b=this.tileCache[a.url];b&&(b.parentNode&&OpenLayers.Element.hasClass(b.parentNode,"olBackBuffer")&&(b.parentNode.removeChild(b),b.id=null),b.parentNode||(b.style.visibility="hidden",b.style.opacity=0,a.setImage(b),OpenLayers.Util.removeItem(this.tileCacheIndex,a.url),this.tileCacheIndex.push(a.url)))},addToCache:function(a){a=a.object;this.tileCache[a.url]||OpenLayers.Element.hasClass(a.imgDiv,"olImageLoadError")||(this.tileCacheIndex.length>=this.cacheSize&&(delete this.tileCache[this.tileCacheIndex[0]],
this.tileCacheIndex.shift()),this.tileCache[a.url]=a.imgDiv,this.tileCacheIndex.push(a.url))},clearTileQueue:function(a){a=a.object;for(var b=this.tileQueue[a.map.id],c=b.length-1;0<=c;--c)b[c].layer===a&&b.splice(c,1)},destroy:function(){for(var a=this.maps.length-1;0<=a;--a)this.removeMap(this.maps[a]);this.tileCacheIndex=this.tileCache=this.tileQueueId=this.tileQueue=this.maps=null;this._destroyed=!0}});OpenLayers.Kinetic=OpenLayers.Class({threshold:0,deceleration:.0035,nbPoints:100,delay:200,points:void 0,timerId:void 0,initialize:function(a){OpenLayers.Util.extend(this,a)},begin:function(){OpenLayers.Animation.stop(this.timerId);this.timerId=void 0;this.points=[]},update:function(a){this.points.unshift({xy:a,tick:(new Date).getTime()});this.points.length>this.nbPoints&&this.points.pop()},end:function(a){for(var b,c=(new Date).getTime(),d=0,e=this.points.length,f;d<e;d++){f=this.points[d];if(c-
f.tick>this.delay)break;b=f}if(b&&(d=(new Date).getTime()-b.tick,c=Math.sqrt(Math.pow(a.x-b.xy.x,2)+Math.pow(a.y-b.xy.y,2)),d=c/d,!(0==d||d<this.threshold)))return c=Math.asin((a.y-b.xy.y)/c),b.xy.x<=a.x&&(c=Math.PI-c),{speed:d,theta:c}},move:function(a,b){var c=a.speed,d=Math.cos(a.theta),e=-Math.sin(a.theta),f=(new Date).getTime(),g=0,h=0;this.timerId=OpenLayers.Animation.start(OpenLayers.Function.bind(function(){if(null!=this.timerId){var a=(new Date).getTime()-f,l=-this.deceleration*Math.pow(a,
2)/2+c*a,m=l*d,l=l*e,q,n;q=!1;0>=-this.deceleration*a+c&&(OpenLayers.Animation.stop(this.timerId),this.timerId=null,q=!0);a=m-g;n=l-h;g=m;h=l;b(a,n,q)}},this))},CLASS_NAME:"OpenLayers.Kinetic"});OpenLayers.Strategy=OpenLayers.Class({layer:null,options:null,active:null,autoActivate:!0,autoDestroy:!0,initialize:function(a){OpenLayers.Util.extend(this,a);this.options=a;this.active=!1},destroy:function(){this.deactivate();this.options=this.layer=null},setLayer:function(a){this.layer=a},activate:function(){return this.active?!1:this.active=!0},deactivate:function(){return this.active?(this.active=!1,!0):!1},CLASS_NAME:"OpenLayers.Strategy"});OpenLayers.Strategy.Fixed=OpenLayers.Class(OpenLayers.Strategy,{preload:!1,activate:function(){var a=OpenLayers.Strategy.prototype.activate.apply(this,arguments);if(a)if(this.layer.events.on({refresh:this.load,scope:this}),1==this.layer.visibility||this.preload)this.load();else this.layer.events.on({visibilitychanged:this.load,scope:this});return a},deactivate:function(){var a=OpenLayers.Strategy.prototype.deactivate.call(this);a&&this.layer.events.un({refresh:this.load,visibilitychanged:this.load,
scope:this});return a},load:function(a){var b=this.layer;b.events.triggerEvent("loadstart",{filter:b.filter});b.protocol.read(OpenLayers.Util.applyDefaults({callback:this.merge,filter:b.filter,scope:this},a));b.events.un({visibilitychanged:this.load,scope:this})},merge:function(a){var b=this.layer;b.destroyFeatures();var c=a.features;if(c&&0<c.length){var d=b.projection,e=b.map.getProjectionObject();if(!e.equals(d))for(var f,g=0,h=c.length;g<h;++g)(f=c[g].geometry)&&f.transform(d,e);b.addFeatures(c)}b.events.triggerEvent("loadend",
{response:a})},CLASS_NAME:"OpenLayers.Strategy.Fixed"});OpenLayers.Layer.Markers=OpenLayers.Class(OpenLayers.Layer,{isBaseLayer:!1,markers:null,drawn:!1,initialize:function(a,b){OpenLayers.Layer.prototype.initialize.apply(this,arguments);this.markers=[]},destroy:function(){this.clearMarkers();this.markers=null;OpenLayers.Layer.prototype.destroy.apply(this,arguments)},setOpacity:function(a){if(a!=this.opacity){this.opacity=a;a=0;for(var b=this.markers.length;a<b;a++)this.markers[a].setOpacity(this.opacity)}},moveTo:function(a,b,c){OpenLayers.Layer.prototype.moveTo.apply(this,
arguments);if(b||!this.drawn){for(var d=0,e=this.markers.length;d<e;d++)this.drawMarker(this.markers[d]);this.drawn=!0}},addMarker:function(a){this.markers.push(a);1>this.opacity&&a.setOpacity(this.opacity);this.map&&this.map.getExtent()&&(a.map=this.map,this.drawMarker(a))},removeMarker:function(a){this.markers&&this.markers.length&&(OpenLayers.Util.removeItem(this.markers,a),a.erase())},clearMarkers:function(){if(null!=this.markers)for(;0<this.markers.length;)this.removeMarker(this.markers[0])},
drawMarker:function(a){var b=this.map.getLayerPxFromLonLat(a.lonlat);null==b?a.display(!1):a.isDrawn()?a.icon&&a.icon.moveTo(b):(a=a.draw(b),this.div.appendChild(a))},getDataExtent:function(){var a=null;if(this.markers&&0<this.markers.length)for(var a=new OpenLayers.Bounds,b=0,c=this.markers.length;b<c;b++)a.extend(this.markers[b].lonlat);return a},CLASS_NAME:"OpenLayers.Layer.Markers"});OpenLayers.Layer.Zoomify=OpenLayers.Class(OpenLayers.Layer.Grid,{size:null,isBaseLayer:!0,standardTileSize:256,tileOriginCorner:"tl",numberOfTiers:0,tileCountUpToTier:null,tierSizeInTiles:null,tierImageSize:null,initialize:function(a,b,c,d){this.initializeZoomify(c);OpenLayers.Layer.Grid.prototype.initialize.apply(this,[a,b,{},d])},initializeZoomify:function(a){var b=a.clone();this.size=a.clone();a=new OpenLayers.Size(Math.ceil(b.w/this.standardTileSize),Math.ceil(b.h/this.standardTileSize));this.tierSizeInTiles=
[a];for(this.tierImageSize=[b];b.w>this.standardTileSize||b.h>this.standardTileSize;)b=new OpenLayers.Size(Math.floor(b.w/2),Math.floor(b.h/2)),a=new OpenLayers.Size(Math.ceil(b.w/this.standardTileSize),Math.ceil(b.h/this.standardTileSize)),this.tierSizeInTiles.push(a),this.tierImageSize.push(b);this.tierSizeInTiles.reverse();this.tierImageSize.reverse();this.numberOfTiers=this.tierSizeInTiles.length;b=[1];this.tileCountUpToTier=[0];for(a=1;a<this.numberOfTiers;a++)b.unshift(Math.pow(2,a)),this.tileCountUpToTier.push(this.tierSizeInTiles[a-
1].w*this.tierSizeInTiles[a-1].h+this.tileCountUpToTier[a-1]);this.serverResolutions||(this.serverResolutions=b)},destroy:function(){OpenLayers.Layer.Grid.prototype.destroy.apply(this,arguments);this.tileCountUpToTier.length=0;this.tierSizeInTiles.length=0;this.tierImageSize.length=0},clone:function(a){null==a&&(a=new OpenLayers.Layer.Zoomify(this.name,this.url,this.size,this.options));return a=OpenLayers.Layer.Grid.prototype.clone.apply(this,[a])},createBackBuffer:function(){var a=OpenLayers.Layer.Grid.prototype.createBackBuffer.apply(this,
arguments);if(a)for(var b,c=a.childNodes.length-1;0<=c;--c)b=a.childNodes[c],b._w=b.width,b._h=b.height;return a},getURL:function(a){a=this.adjustBounds(a);var b=this.getServerResolution(),c=Math.round((a.left-this.tileOrigin.lon)/(b*this.tileSize.w));a=Math.round((this.tileOrigin.lat-a.top)/(b*this.tileSize.h));b=this.getZoomForResolution(b);c="TileGroup"+Math.floor((c+a*this.tierSizeInTiles[b].w+this.tileCountUpToTier[b])/256)+"/"+b+"-"+c+"-"+a+".jpg";b=this.url;OpenLayers.Util.isArray(b)&&(b=this.selectUrl(c,
b));return b+c},getImageSize:function(){if(0<arguments.length){var a=this.adjustBounds(arguments[0]),b=this.getServerResolution(),c=Math.round((a.left-this.tileOrigin.lon)/(b*this.tileSize.w)),a=Math.round((this.tileOrigin.lat-a.top)/(b*this.tileSize.h)),b=this.getZoomForResolution(b),d=this.standardTileSize,e=this.standardTileSize;c==this.tierSizeInTiles[b].w-1&&(d=this.tierImageSize[b].w%this.standardTileSize,0==d&&(d=this.standardTileSize));a==this.tierSizeInTiles[b].h-1&&(e=this.tierImageSize[b].h%
this.standardTileSize,0==e&&(e=this.standardTileSize));c==this.tierSizeInTiles[b].w&&(d=Math.ceil(this.size.w/Math.pow(2,this.numberOfTiers-1-b)-this.tierImageSize[b].w));a==this.tierSizeInTiles[b].h&&(e=Math.ceil(this.size.h/Math.pow(2,this.numberOfTiers-1-b)-this.tierImageSize[b].h));return new OpenLayers.Size(d,e)}return this.tileSize},setMap:function(a){OpenLayers.Layer.Grid.prototype.setMap.apply(this,arguments);this.tileOrigin=new OpenLayers.LonLat(this.map.maxExtent.left,this.map.maxExtent.top)},
CLASS_NAME:"OpenLayers.Layer.Zoomify"});OpenLayers.Renderer=OpenLayers.Class({container:null,root:null,extent:null,locked:!1,size:null,resolution:null,map:null,featureDx:0,initialize:function(a,b){this.container=OpenLayers.Util.getElement(a);OpenLayers.Util.extend(this,b)},destroy:function(){this.map=this.resolution=this.size=this.extent=this.container=null},supported:function(){return!1},setExtent:function(a,b){this.extent=a.clone();if(this.map.baseLayer&&this.map.baseLayer.wrapDateLine){var c=a.getWidth()/this.map.getExtent().getWidth();
a=a.scale(1/c);this.extent=a.wrapDateLine(this.map.getMaxExtent()).scale(c)}b&&(this.resolution=null);return!0},setSize:function(a){this.size=a.clone();this.resolution=null},getResolution:function(){return this.resolution=this.resolution||this.map.getResolution()},drawFeature:function(a,b){null==b&&(b=a.style);if(a.geometry){var c=a.geometry.getBounds();if(c){var d;this.map.baseLayer&&this.map.baseLayer.wrapDateLine&&(d=this.map.getMaxExtent());c.intersectsBounds(this.extent,{worldBounds:d})?this.calculateFeatureDx(c,
d):b={display:"none"};c=this.drawGeometry(a.geometry,b,a.id);if("none"!=b.display&&b.label&&!1!==c){d=a.geometry.getCentroid();if(b.labelXOffset||b.labelYOffset){var e=isNaN(b.labelXOffset)?0:b.labelXOffset,f=isNaN(b.labelYOffset)?0:b.labelYOffset,g=this.getResolution();d.move(e*g,f*g)}this.drawText(a.id,b,d)}else this.removeText(a.id);return c}}},calculateFeatureDx:function(a,b){this.featureDx=0;if(b){var c=b.getWidth();this.featureDx=Math.round(((a.left+a.right)/2-(this.extent.left+this.extent.right)/
2)/c)*c}},drawGeometry:function(a,b,c){},drawText:function(a,b,c){},removeText:function(a){},clear:function(){},getFeatureIdFromEvent:function(a){},eraseFeatures:function(a){OpenLayers.Util.isArray(a)||(a=[a]);for(var b=0,c=a.length;b<c;++b){var d=a[b];this.eraseGeometry(d.geometry,d.id);this.removeText(d.id)}},eraseGeometry:function(a,b){},moveRoot:function(a){},getRenderLayerId:function(){return this.container.id},applyDefaultSymbolizer:function(a){var b=OpenLayers.Util.extend({},OpenLayers.Renderer.defaultSymbolizer);
!1===a.stroke&&(delete b.strokeWidth,delete b.strokeColor);!1===a.fill&&delete b.fillColor;OpenLayers.Util.extend(b,a);return b},CLASS_NAME:"OpenLayers.Renderer"});OpenLayers.Renderer.defaultSymbolizer={fillColor:"#000000",strokeColor:"#000000",strokeWidth:2,fillOpacity:1,strokeOpacity:1,pointRadius:0,labelAlign:"cm"};
OpenLayers.Renderer.symbol={star:[350,75,379,161,469,161,397,215,423,301,350,250,277,301,303,215,231,161,321,161,350,75],cross:[4,0,6,0,6,4,10,4,10,6,6,6,6,10,4,10,4,6,0,6,0,4,4,4,4,0],x:[0,0,25,0,50,35,75,0,100,0,65,50,100,100,75,100,50,65,25,100,0,100,35,50,0,0],square:[0,0,0,1,1,1,1,0,0,0],triangle:[0,10,10,10,5,0,0,10]};OpenLayers.Feature=OpenLayers.Class({layer:null,id:null,lonlat:null,data:null,marker:null,popupClass:null,popup:null,initialize:function(a,b,c){this.layer=a;this.lonlat=b;this.data=null!=c?c:{};this.id=OpenLayers.Util.createUniqueID(this.CLASS_NAME+"_")},destroy:function(){null!=this.layer&&null!=this.layer.map&&null!=this.popup&&this.layer.map.removePopup(this.popup);null!=this.layer&&null!=this.marker&&this.layer.removeMarker(this.marker);this.data=this.lonlat=this.id=this.layer=null;null!=this.marker&&
(this.destroyMarker(this.marker),this.marker=null);null!=this.popup&&(this.destroyPopup(this.popup),this.popup=null)},onScreen:function(){var a=!1;null!=this.layer&&null!=this.layer.map&&(a=this.layer.map.getExtent().containsLonLat(this.lonlat));return a},createMarker:function(){null!=this.lonlat&&(this.marker=new OpenLayers.Marker(this.lonlat,this.data.icon));return this.marker},destroyMarker:function(){this.marker.destroy()},createPopup:function(a){null!=this.lonlat&&(this.popup||(this.popup=new (this.popupClass?
this.popupClass:OpenLayers.Popup.Anchored)(this.id+"_popup",this.lonlat,this.data.popupSize,this.data.popupContentHTML,this.marker?this.marker.icon:null,a)),null!=this.data.overflow&&(this.popup.contentDiv.style.overflow=this.data.overflow),this.popup.feature=this);return this.popup},destroyPopup:function(){this.popup&&(this.popup.feature=null,this.popup.destroy(),this.popup=null)},CLASS_NAME:"OpenLayers.Feature"});OpenLayers.State={UNKNOWN:"Unknown",INSERT:"Insert",UPDATE:"Update",DELETE:"Delete"};
OpenLayers.Feature.Vector=OpenLayers.Class(OpenLayers.Feature,{fid:null,geometry:null,attributes:null,bounds:null,state:null,style:null,url:null,renderIntent:"default",modified:null,initialize:function(a,b,c){OpenLayers.Feature.prototype.initialize.apply(this,[null,null,b]);this.lonlat=null;this.geometry=a?a:null;this.state=null;this.attributes={};b&&(this.attributes=OpenLayers.Util.extend(this.attributes,b));this.style=c?c:null},destroy:function(){this.layer&&(this.layer.removeFeatures(this),this.layer=
null);this.modified=this.geometry=null;OpenLayers.Feature.prototype.destroy.apply(this,arguments)},clone:function(){return new OpenLayers.Feature.Vector(this.geometry?this.geometry.clone():null,this.attributes,this.style)},onScreen:function(a){var b=!1;this.layer&&this.layer.map&&(b=this.layer.map.getExtent(),a?(a=this.geometry.getBounds(),b=b.intersectsBounds(a)):b=b.toGeometry().intersects(this.geometry));return b},getVisibility:function(){return!(this.style&&"none"==this.style.display||!this.layer||
this.layer&&this.layer.styleMap&&"none"==this.layer.styleMap.createSymbolizer(this,this.renderIntent).display||this.layer&&!this.layer.getVisibility())},createMarker:function(){return null},destroyMarker:function(){},createPopup:function(){return null},atPoint:function(a,b,c){var d=!1;this.geometry&&(d=this.geometry.atPoint(a,b,c));return d},destroyPopup:function(){},move:function(a){if(this.layer&&this.geometry.move){a="OpenLayers.LonLat"==a.CLASS_NAME?this.layer.getViewPortPxFromLonLat(a):a;var b=
this.layer.getViewPortPxFromLonLat(this.geometry.getBounds().getCenterLonLat()),c=this.layer.map.getResolution();this.geometry.move(c*(a.x-b.x),c*(b.y-a.y));this.layer.drawFeature(this);return b}},toState:function(a){if(a==OpenLayers.State.UPDATE)switch(this.state){case OpenLayers.State.UNKNOWN:case OpenLayers.State.DELETE:this.state=a}else if(a==OpenLayers.State.INSERT)switch(this.state){case OpenLayers.State.UNKNOWN:break;default:this.state=a}else if(a==OpenLayers.State.DELETE)switch(this.state){case OpenLayers.State.UNKNOWN:case OpenLayers.State.UPDATE:this.state=
a}else a==OpenLayers.State.UNKNOWN&&(this.state=a)},CLASS_NAME:"OpenLayers.Feature.Vector"});
OpenLayers.Feature.Vector.style={"default":{fillColor:"#ee9900",fillOpacity:.4,hoverFillColor:"white",hoverFillOpacity:.8,strokeColor:"#ee9900",strokeOpacity:1,strokeWidth:1,strokeLinecap:"round",strokeDashstyle:"solid",hoverStrokeColor:"red",hoverStrokeOpacity:1,hoverStrokeWidth:.2,pointRadius:6,hoverPointRadius:1,hoverPointUnit:"%",pointerEvents:"visiblePainted",cursor:"inherit",fontColor:"#000000",labelAlign:"cm",labelOutlineColor:"white",labelOutlineWidth:3},select:{fillColor:"blue",fillOpacity:.4,
hoverFillColor:"white",hoverFillOpacity:.8,strokeColor:"blue",strokeOpacity:1,strokeWidth:2,strokeLinecap:"round",strokeDashstyle:"solid",hoverStrokeColor:"red",hoverStrokeOpacity:1,hoverStrokeWidth:.2,pointRadius:6,hoverPointRadius:1,hoverPointUnit:"%",pointerEvents:"visiblePainted",cursor:"pointer",fontColor:"#000000",labelAlign:"cm",labelOutlineColor:"white",labelOutlineWidth:3},temporary:{fillColor:"#66cccc",fillOpacity:.2,hoverFillColor:"white",hoverFillOpacity:.8,strokeColor:"#66cccc",strokeOpacity:1,
strokeLinecap:"round",strokeWidth:2,strokeDashstyle:"solid",hoverStrokeColor:"red",hoverStrokeOpacity:1,hoverStrokeWidth:.2,pointRadius:6,hoverPointRadius:1,hoverPointUnit:"%",pointerEvents:"visiblePainted",cursor:"inherit",fontColor:"#000000",labelAlign:"cm",labelOutlineColor:"white",labelOutlineWidth:3},"delete":{display:"none"}};OpenLayers.Style=OpenLayers.Class({id:null,name:null,title:null,description:null,layerName:null,isDefault:!1,rules:null,context:null,defaultStyle:null,defaultsPerSymbolizer:!1,propertyStyles:null,initialize:function(a,b){OpenLayers.Util.extend(this,b);this.rules=[];b&&b.rules&&this.addRules(b.rules);this.setDefaultStyle(a||OpenLayers.Feature.Vector.style["default"]);this.id=OpenLayers.Util.createUniqueID(this.CLASS_NAME+"_")},destroy:function(){for(var a=0,b=this.rules.length;a<b;a++)this.rules[a].destroy(),
this.rules[a]=null;this.defaultStyle=this.rules=null},createSymbolizer:function(a){for(var b=this.defaultsPerSymbolizer?{}:this.createLiterals(OpenLayers.Util.extend({},this.defaultStyle),a),c=this.rules,d,e=[],f=!1,g=0,h=c.length;g<h;g++)d=c[g],d.evaluate(a)&&(d instanceof OpenLayers.Rule&&d.elseFilter?e.push(d):(f=!0,this.applySymbolizer(d,b,a)));if(0==f&&0<e.length)for(f=!0,g=0,h=e.length;g<h;g++)this.applySymbolizer(e[g],b,a);0<c.length&&0==f&&(b.display="none");null!=b.label&&"string"!==typeof b.label&&
(b.label=String(b.label));return b},applySymbolizer:function(a,b,c){var d=c.geometry?this.getSymbolizerPrefix(c.geometry):OpenLayers.Style.SYMBOLIZER_PREFIXES[0];a=a.symbolizer[d]||a.symbolizer;!0===this.defaultsPerSymbolizer&&(d=this.defaultStyle,OpenLayers.Util.applyDefaults(a,{pointRadius:d.pointRadius}),!0!==a.stroke&&!0!==a.graphic||OpenLayers.Util.applyDefaults(a,{strokeWidth:d.strokeWidth,strokeColor:d.strokeColor,strokeOpacity:d.strokeOpacity,strokeDashstyle:d.strokeDashstyle,strokeLinecap:d.strokeLinecap}),
!0!==a.fill&&!0!==a.graphic||OpenLayers.Util.applyDefaults(a,{fillColor:d.fillColor,fillOpacity:d.fillOpacity}),!0===a.graphic&&OpenLayers.Util.applyDefaults(a,{pointRadius:this.defaultStyle.pointRadius,externalGraphic:this.defaultStyle.externalGraphic,graphicName:this.defaultStyle.graphicName,graphicOpacity:this.defaultStyle.graphicOpacity,graphicWidth:this.defaultStyle.graphicWidth,graphicHeight:this.defaultStyle.graphicHeight,graphicXOffset:this.defaultStyle.graphicXOffset,graphicYOffset:this.defaultStyle.graphicYOffset}));
return this.createLiterals(OpenLayers.Util.extend(b,a),c)},createLiterals:function(a,b){var c=OpenLayers.Util.extend({},b.attributes||b.data);OpenLayers.Util.extend(c,this.context);for(var d in this.propertyStyles)a[d]=OpenLayers.Style.createLiteral(a[d],c,b,d);return a},findPropertyStyles:function(){var a={};this.addPropertyStyles(a,this.defaultStyle);for(var b=this.rules,c,d,e=0,f=b.length;e<f;e++){c=b[e].symbolizer;for(var g in c)if(d=c[g],"object"==typeof d)this.addPropertyStyles(a,d);else{this.addPropertyStyles(a,
c);break}}return a},addPropertyStyles:function(a,b){var c,d;for(d in b)c=b[d],"string"==typeof c&&c.match(/\$\{\w+\}/)&&(a[d]=!0);return a},addRules:function(a){Array.prototype.push.apply(this.rules,a);this.propertyStyles=this.findPropertyStyles()},setDefaultStyle:function(a){this.defaultStyle=a;this.propertyStyles=this.findPropertyStyles()},getSymbolizerPrefix:function(a){for(var b=OpenLayers.Style.SYMBOLIZER_PREFIXES,c=0,d=b.length;c<d;c++)if(-1!=a.CLASS_NAME.indexOf(b[c]))return b[c]},clone:function(){var a=
OpenLayers.Util.extend({},this);if(this.rules){a.rules=[];for(var b=0,c=this.rules.length;b<c;++b)a.rules.push(this.rules[b].clone())}a.context=this.context&&OpenLayers.Util.extend({},this.context);b=OpenLayers.Util.extend({},this.defaultStyle);return new OpenLayers.Style(b,a)},CLASS_NAME:"OpenLayers.Style"});OpenLayers.Style.createLiteral=function(a,b,c,d){"string"==typeof a&&-1!=a.indexOf("${")&&(a=OpenLayers.String.format(a,b,[c,d]),a=isNaN(a)||!a?a:parseFloat(a));return a};
OpenLayers.Style.SYMBOLIZER_PREFIXES=["Point","Line","Polygon","Text","Raster"];OpenLayers.StyleMap=OpenLayers.Class({styles:null,extendDefault:!0,initialize:function(a,b){this.styles={"default":new OpenLayers.Style(OpenLayers.Feature.Vector.style["default"]),select:new OpenLayers.Style(OpenLayers.Feature.Vector.style.select),temporary:new OpenLayers.Style(OpenLayers.Feature.Vector.style.temporary),"delete":new OpenLayers.Style(OpenLayers.Feature.Vector.style["delete"])};if(a instanceof OpenLayers.Style)this.styles["default"]=a,this.styles.select=a,this.styles.temporary=a,this.styles["delete"]=
a;else if("object"==typeof a)for(var c in a)if(a[c]instanceof OpenLayers.Style)this.styles[c]=a[c];else if("object"==typeof a[c])this.styles[c]=new OpenLayers.Style(a[c]);else{this.styles["default"]=new OpenLayers.Style(a);this.styles.select=new OpenLayers.Style(a);this.styles.temporary=new OpenLayers.Style(a);this.styles["delete"]=new OpenLayers.Style(a);break}OpenLayers.Util.extend(this,b)},destroy:function(){for(var a in this.styles)this.styles[a].destroy();this.styles=null},createSymbolizer:function(a,
b){a||(a=new OpenLayers.Feature.Vector);this.styles[b]||(b="default");a.renderIntent=b;var c={};this.extendDefault&&"default"!=b&&(c=this.styles["default"].createSymbolizer(a));return OpenLayers.Util.extend(c,this.styles[b].createSymbolizer(a))},addUniqueValueRules:function(a,b,c,d){var e=[],f;for(f in c)e.push(new OpenLayers.Rule({symbolizer:c[f],context:d,filter:new OpenLayers.Filter.Comparison({type:OpenLayers.Filter.Comparison.EQUAL_TO,property:b,value:f})}));this.styles[a].addRules(e)},CLASS_NAME:"OpenLayers.StyleMap"});OpenLayers.Layer.Vector=OpenLayers.Class(OpenLayers.Layer,{isBaseLayer:!1,isFixed:!1,features:null,filter:null,selectedFeatures:null,unrenderedFeatures:null,reportError:!0,style:null,styleMap:null,strategies:null,protocol:null,renderers:["SVG","VML","Canvas"],renderer:null,rendererOptions:null,geometryType:null,drawn:!1,ratio:1,initialize:function(a,b){OpenLayers.Layer.prototype.initialize.apply(this,arguments);this.renderer&&this.renderer.supported()||this.assignRenderer();this.renderer&&this.renderer.supported()||
(this.renderer=null,this.displayError());this.styleMap||(this.styleMap=new OpenLayers.StyleMap);this.features=[];this.selectedFeatures=[];this.unrenderedFeatures={};if(this.strategies)for(var c=0,d=this.strategies.length;c<d;c++)this.strategies[c].setLayer(this)},destroy:function(){if(this.strategies){var a,b,c;b=0;for(c=this.strategies.length;b<c;b++)a=this.strategies[b],a.autoDestroy&&a.destroy();this.strategies=null}this.protocol&&(this.protocol.autoDestroy&&this.protocol.destroy(),this.protocol=
null);this.destroyFeatures();this.unrenderedFeatures=this.selectedFeatures=this.features=null;this.renderer&&this.renderer.destroy();this.drawn=this.geometryType=this.renderer=null;OpenLayers.Layer.prototype.destroy.apply(this,arguments)},clone:function(a){null==a&&(a=new OpenLayers.Layer.Vector(this.name,this.getOptions()));a=OpenLayers.Layer.prototype.clone.apply(this,[a]);for(var b=this.features,c=b.length,d=Array(c),e=0;e<c;++e)d[e]=b[e].clone();a.features=d;return a},refresh:function(a){this.calculateInRange()&&
this.visibility&&this.events.triggerEvent("refresh",a)},assignRenderer:function(){for(var a=0,b=this.renderers.length;a<b;a++){var c=this.renderers[a];if((c="function"==typeof c?c:OpenLayers.Renderer[c])&&c.prototype.supported()){this.renderer=new c(this.div,this.rendererOptions);break}}},displayError:function(){this.reportError&&OpenLayers.Console.userError(OpenLayers.i18n("browserNotSupported",{renderers:this.renderers.join("\n")}))},setMap:function(a){OpenLayers.Layer.prototype.setMap.apply(this,
arguments);if(this.renderer){this.renderer.map=this.map;var b=this.map.getSize();b.w*=this.ratio;b.h*=this.ratio;this.renderer.setSize(b)}else this.map.removeLayer(this)},afterAdd:function(){if(this.strategies){var a,b,c;b=0;for(c=this.strategies.length;b<c;b++)a=this.strategies[b],a.autoActivate&&a.activate()}},removeMap:function(a){this.drawn=!1;if(this.strategies){var b,c;b=0;for(c=this.strategies.length;b<c;b++)a=this.strategies[b],a.autoActivate&&a.deactivate()}},onMapResize:function(){OpenLayers.Layer.prototype.onMapResize.apply(this,
arguments);var a=this.map.getSize();a.w*=this.ratio;a.h*=this.ratio;this.renderer.setSize(a)},moveTo:function(a,b,c){OpenLayers.Layer.prototype.moveTo.apply(this,arguments);var d=!0;if(!c){this.renderer.root.style.visibility="hidden";var d=this.map.getSize(),e=d.w,d=d.h,e=e/2*this.ratio-e/2,d=d/2*this.ratio-d/2,e=e+this.map.layerContainerOriginPx.x,e=-Math.round(e),d=d+this.map.layerContainerOriginPx.y,d=-Math.round(d);this.div.style.left=e+"px";this.div.style.top=d+"px";e=this.map.getExtent().scale(this.ratio);
d=this.renderer.setExtent(e,b);this.renderer.root.style.visibility="visible";!0===OpenLayers.IS_GECKO&&(this.div.scrollLeft=this.div.scrollLeft);if(!b&&d)for(var f in this.unrenderedFeatures)e=this.unrenderedFeatures[f],this.drawFeature(e)}if(!this.drawn||b||!d)for(this.drawn=!0,f=0,d=this.features.length;f<d;f++)this.renderer.locked=f!==d-1,e=this.features[f],this.drawFeature(e)},display:function(a){OpenLayers.Layer.prototype.display.apply(this,arguments);var b=this.div.style.display;b!=this.renderer.root.style.display&&
(this.renderer.root.style.display=b)},addFeatures:function(a,b){OpenLayers.Util.isArray(a)||(a=[a]);var c=!b||!b.silent;if(c){var d={features:a};if(!1===this.events.triggerEvent("beforefeaturesadded",d))return;a=d.features}for(var d=[],e=0,f=a.length;e<f;e++){this.renderer.locked=e!=a.length-1?!0:!1;var g=a[e];if(this.geometryType&&!(g.geometry instanceof this.geometryType))throw new TypeError("addFeatures: component should be an "+this.geometryType.prototype.CLASS_NAME);g.layer=this;!g.style&&this.style&&
(g.style=OpenLayers.Util.extend({},this.style));if(c){if(!1===this.events.triggerEvent("beforefeatureadded",{feature:g}))continue;this.preFeatureInsert(g)}d.push(g);this.features.push(g);this.drawFeature(g);c&&(this.events.triggerEvent("featureadded",{feature:g}),this.onFeatureInsert(g))}c&&this.events.triggerEvent("featuresadded",{features:d})},removeFeatures:function(a,b){if(a&&0!==a.length){if(a===this.features)return this.removeAllFeatures(b);OpenLayers.Util.isArray(a)||(a=[a]);a===this.selectedFeatures&&
(a=a.slice());var c=!b||!b.silent;c&&this.events.triggerEvent("beforefeaturesremoved",{features:a});for(var d=a.length-1;0<=d;d--){this.renderer.locked=0!=d&&a[d-1].geometry?!0:!1;var e=a[d];delete this.unrenderedFeatures[e.id];c&&this.events.triggerEvent("beforefeatureremoved",{feature:e});this.features=OpenLayers.Util.removeItem(this.features,e);e.layer=null;e.geometry&&this.renderer.eraseFeatures(e);-1!=OpenLayers.Util.indexOf(this.selectedFeatures,e)&&OpenLayers.Util.removeItem(this.selectedFeatures,
e);c&&this.events.triggerEvent("featureremoved",{feature:e})}c&&this.events.triggerEvent("featuresremoved",{features:a})}},removeAllFeatures:function(a){a=!a||!a.silent;var b=this.features;a&&this.events.triggerEvent("beforefeaturesremoved",{features:b});for(var c,d=b.length-1;0<=d;d--)c=b[d],a&&this.events.triggerEvent("beforefeatureremoved",{feature:c}),c.layer=null,a&&this.events.triggerEvent("featureremoved",{feature:c});this.renderer.clear();this.features=[];this.unrenderedFeatures={};this.selectedFeatures=
[];a&&this.events.triggerEvent("featuresremoved",{features:b})},destroyFeatures:function(a,b){void 0==a&&(a=this.features);if(a){this.removeFeatures(a,b);for(var c=a.length-1;0<=c;c--)a[c].destroy()}},drawFeature:function(a,b){if(this.drawn){if("object"!=typeof b){b||a.state!==OpenLayers.State.DELETE||(b="delete");var c=b||a.renderIntent;(b=a.style||this.style)||(b=this.styleMap.createSymbolizer(a,c))}c=this.renderer.drawFeature(a,b);!1===c||null===c?this.unrenderedFeatures[a.id]=a:delete this.unrenderedFeatures[a.id]}},
eraseFeatures:function(a){this.renderer.eraseFeatures(a)},getFeatureFromEvent:function(a){if(!this.renderer)throw Error("getFeatureFromEvent called on layer with no renderer. This usually means you destroyed a layer, but not some handler which is associated with it.");var b=null;(a=this.renderer.getFeatureIdFromEvent(a))&&(b="string"===typeof a?this.getFeatureById(a):a);return b},getFeatureBy:function(a,b){for(var c=null,d=0,e=this.features.length;d<e;++d)if(this.features[d][a]==b){c=this.features[d];
break}return c},getFeatureById:function(a){return this.getFeatureBy("id",a)},getFeatureByFid:function(a){return this.getFeatureBy("fid",a)},getFeaturesByAttribute:function(a,b){var c,d,e=this.features.length,f=[];for(c=0;c<e;c++)(d=this.features[c])&&d.attributes&&d.attributes[a]===b&&f.push(d);return f},onFeatureInsert:function(a){},preFeatureInsert:function(a){},getDataExtent:function(){var a=null,b=this.features;if(b&&0<b.length)for(var c,d=0,e=b.length;d<e;d++)if(c=b[d].geometry)null===a&&(a=
new OpenLayers.Bounds),a.extend(c.getBounds());return a},CLASS_NAME:"OpenLayers.Layer.Vector"});OpenLayers.Layer.TMS=OpenLayers.Class(OpenLayers.Layer.Grid,{serviceVersion:"1.0.0",layername:null,type:null,isBaseLayer:!0,tileOrigin:null,serverResolutions:null,zoomOffset:0,initialize:function(a,b,c){var d=[];d.push(a,b,{},c);OpenLayers.Layer.Grid.prototype.initialize.apply(this,d)},clone:function(a){null==a&&(a=new OpenLayers.Layer.TMS(this.name,this.url,this.getOptions()));return a=OpenLayers.Layer.Grid.prototype.clone.apply(this,[a])},getURL:function(a){a=this.adjustBounds(a);var b=this.getServerResolution(),
c=Math.round((a.left-this.tileOrigin.lon)/(b*this.tileSize.w));a=Math.round((a.bottom-this.tileOrigin.lat)/(b*this.tileSize.h));b=this.getServerZoom();c=this.serviceVersion+"/"+this.layername+"/"+b+"/"+c+"/"+a+"."+this.type;a=this.url;OpenLayers.Util.isArray(a)&&(a=this.selectUrl(c,a));return a+c},setMap:function(a){OpenLayers.Layer.Grid.prototype.setMap.apply(this,arguments);this.tileOrigin||(this.tileOrigin=new OpenLayers.LonLat(this.map.maxExtent.left,this.map.maxExtent.bottom))},CLASS_NAME:"OpenLayers.Layer.TMS"});OpenLayers.Protocol=OpenLayers.Class({format:null,options:null,autoDestroy:!0,defaultFilter:null,initialize:function(a){a=a||{};OpenLayers.Util.extend(this,a);this.options=a},mergeWithDefaultFilter:function(a){return a&&this.defaultFilter?new OpenLayers.Filter.Logical({type:OpenLayers.Filter.Logical.AND,filters:[this.defaultFilter,a]}):a||this.defaultFilter||void 0},destroy:function(){this.format=this.options=null},read:function(a){a=a||{};a.filter=this.mergeWithDefaultFilter(a.filter)},create:function(){},
update:function(){},"delete":function(){},commit:function(){},abort:function(a){},createCallback:function(a,b,c){return OpenLayers.Function.bind(function(){a.apply(this,[b,c])},this)},CLASS_NAME:"OpenLayers.Protocol"});OpenLayers.Protocol.Response=OpenLayers.Class({code:null,requestType:null,last:!0,features:null,data:null,reqFeatures:null,priv:null,error:null,initialize:function(a){OpenLayers.Util.extend(this,a)},success:function(){return 0<this.code},CLASS_NAME:"OpenLayers.Protocol.Response"});
OpenLayers.Protocol.Response.SUCCESS=1;OpenLayers.Protocol.Response.FAILURE=0;OpenLayers.ProxyHost="";OpenLayers.Request||(OpenLayers.Request={});
OpenLayers.Util.extend(OpenLayers.Request,{DEFAULT_CONFIG:{method:"GET",url:window.location.href,async:!0,user:void 0,password:void 0,params:null,proxy:OpenLayers.ProxyHost,headers:{},data:null,callback:function(){},success:null,failure:null,scope:null},URL_SPLIT_REGEX:/([^:]*:)\/\/([^:]*:?[^@]*@)?([^:\/\?]*):?([^\/\?]*)/,events:new OpenLayers.Events(this),makeSameOrigin:function(a,b){var c=0!==a.indexOf("http"),d=!c&&a.match(this.URL_SPLIT_REGEX);if(d){var e=window.location,c=d[1]==e.protocol&&d[3]==
e.hostname,d=d[4],e=e.port;if(80!=d&&""!=d||"80"!=e&&""!=e)c=c&&d==e}c||b&&(a="function"==typeof b?b(a):b+encodeURIComponent(a));return a},issue:function(a){var b=OpenLayers.Util.extend(this.DEFAULT_CONFIG,{proxy:OpenLayers.ProxyHost});a=a||{};a.headers=a.headers||{};a=OpenLayers.Util.applyDefaults(a,b);a.headers=OpenLayers.Util.applyDefaults(a.headers,b.headers);var b=!1,c;for(c in a.headers)a.headers.hasOwnProperty(c)&&"x-requested-with"===c.toLowerCase()&&(b=!0);!1===b&&(a.headers["X-Requested-With"]=
"XMLHttpRequest");var d=new OpenLayers.Request.XMLHttpRequest,e=OpenLayers.Util.urlAppend(a.url,OpenLayers.Util.getParameterString(a.params||{})),e=OpenLayers.Request.makeSameOrigin(e,a.proxy);d.open(a.method,e,a.async,a.user,a.password);for(var f in a.headers)d.setRequestHeader(f,a.headers[f]);var g=this.events,h=this;d.onreadystatechange=function(){d.readyState==OpenLayers.Request.XMLHttpRequest.DONE&&!1!==g.triggerEvent("complete",{request:d,config:a,requestUrl:e})&&h.runCallbacks({request:d,config:a,
requestUrl:e})};!1===a.async?d.send(a.data):window.setTimeout(function(){0!==d.readyState&&d.send(a.data)},0);return d},runCallbacks:function(a){var b=a.request,c=a.config,d=c.scope?OpenLayers.Function.bind(c.callback,c.scope):c.callback,e;c.success&&(e=c.scope?OpenLayers.Function.bind(c.success,c.scope):c.success);var f;c.failure&&(f=c.scope?OpenLayers.Function.bind(c.failure,c.scope):c.failure);"file:"==OpenLayers.Util.createUrlObject(c.url).protocol&&b.responseText&&(b.status=200);d(b);if(!b.status||
200<=b.status&&300>b.status)this.events.triggerEvent("success",a),e&&e(b);b.status&&(200>b.status||300<=b.status)&&(this.events.triggerEvent("failure",a),f&&f(b))},GET:function(a){a=OpenLayers.Util.extend(a,{method:"GET"});return OpenLayers.Request.issue(a)},POST:function(a){a=OpenLayers.Util.extend(a,{method:"POST"});a.headers=a.headers?a.headers:{};"CONTENT-TYPE"in OpenLayers.Util.upperCaseObject(a.headers)||(a.headers["Content-Type"]="application/xml");return OpenLayers.Request.issue(a)},PUT:function(a){a=
OpenLayers.Util.extend(a,{method:"PUT"});a.headers=a.headers?a.headers:{};"CONTENT-TYPE"in OpenLayers.Util.upperCaseObject(a.headers)||(a.headers["Content-Type"]="application/xml");return OpenLayers.Request.issue(a)},DELETE:function(a){a=OpenLayers.Util.extend(a,{method:"DELETE"});return OpenLayers.Request.issue(a)},HEAD:function(a){a=OpenLayers.Util.extend(a,{method:"HEAD"});return OpenLayers.Request.issue(a)},OPTIONS:function(a){a=OpenLayers.Util.extend(a,{method:"OPTIONS"});return OpenLayers.Request.issue(a)}});(function(){function a(){this._object=f&&!k?new f:new window.ActiveXObject("Microsoft.XMLHTTP");this._listeners=[]}function b(){return new a}function c(a){b.onreadystatechange&&b.onreadystatechange.apply(a);a.dispatchEvent({type:"readystatechange",bubbles:!1,cancelable:!1,timeStamp:new Date+0})}function d(a){try{a.responseText=a._object.responseText}catch(r){}try{var b;var c=a._object,d=c.responseXML,e=c.responseText;h&&e&&d&&!d.documentElement&&c.getResponseHeader("Content-Type").match(/[^\/]+\/[^\+]+\+xml/)&&
(d=new window.ActiveXObject("Microsoft.XMLDOM"),d.async=!1,d.validateOnParse=!1,d.loadXML(e));b=d&&(h&&0!=d.parseError||!d.documentElement||d.documentElement&&"parsererror"==d.documentElement.tagName)?null:d;a.responseXML=b}catch(r){}try{a.status=a._object.status}catch(r){}try{a.statusText=a._object.statusText}catch(r){}}function e(a){a._object.onreadystatechange=new window.Function}var f=window.XMLHttpRequest,g=!!window.controllers,h=window.document.all&&!window.opera,k=h&&window.navigator.userAgent.match(/MSIE 7.0/);
b.prototype=a.prototype;g&&f.wrapped&&(b.wrapped=f.wrapped);b.UNSENT=0;b.OPENED=1;b.HEADERS_RECEIVED=2;b.LOADING=3;b.DONE=4;b.prototype.readyState=b.UNSENT;b.prototype.responseText="";b.prototype.responseXML=null;b.prototype.status=0;b.prototype.statusText="";b.prototype.priority="NORMAL";b.prototype.onreadystatechange=null;b.onreadystatechange=null;b.onopen=null;b.onsend=null;b.onabort=null;b.prototype.open=function(a,f,k,n,p){delete this._headers;3>arguments.length&&(k=!0);this._async=k;var l=this,
m=this.readyState,q;h&&k&&(q=function(){m!=b.DONE&&(e(l),l.abort())},window.attachEvent("onunload",q));b.onopen&&b.onopen.apply(this,arguments);4<arguments.length?this._object.open(a,f,k,n,p):3<arguments.length?this._object.open(a,f,k,n):this._object.open(a,f,k);this.readyState=b.OPENED;c(this);this._object.onreadystatechange=function(){if(!g||k)l.readyState=l._object.readyState,d(l),l._aborted?l.readyState=b.UNSENT:(l.readyState==b.DONE&&(delete l._data,e(l),h&&k&&window.detachEvent("onunload",q)),
m!=l.readyState&&c(l),m=l.readyState)}};b.prototype.send=function(a){b.onsend&&b.onsend.apply(this,arguments);arguments.length||(a=null);a&&a.nodeType&&(a=window.XMLSerializer?(new window.XMLSerializer).serializeToString(a):a.xml,this._headers["Content-Type"]||this._object.setRequestHeader("Content-Type","application/xml"));this._data=a;a:if(this._object.send(this._data),g&&!this._async)for(this.readyState=b.OPENED,d(this);this.readyState<b.DONE;)if(this.readyState++,c(this),this._aborted)break a};
b.prototype.abort=function(){b.onabort&&b.onabort.apply(this,arguments);this.readyState>b.UNSENT&&(this._aborted=!0);this._object.abort();e(this);this.readyState=b.UNSENT;delete this._data};b.prototype.getAllResponseHeaders=function(){return this._object.getAllResponseHeaders()};b.prototype.getResponseHeader=function(a){return this._object.getResponseHeader(a)};b.prototype.setRequestHeader=function(a,b){this._headers||(this._headers={});this._headers[a]=b;return this._object.setRequestHeader(a,b)};
b.prototype.addEventListener=function(a,b,c){for(var d=0,e;e=this._listeners[d];d++)if(e[0]==a&&e[1]==b&&e[2]==c)return;this._listeners.push([a,b,c])};b.prototype.removeEventListener=function(a,b,c){for(var d=0,e;(e=this._listeners[d])&&(e[0]!=a||e[1]!=b||e[2]!=c);d++);e&&this._listeners.splice(d,1)};b.prototype.dispatchEvent=function(a){a={type:a.type,target:this,currentTarget:this,eventPhase:2,bubbles:a.bubbles,cancelable:a.cancelable,timeStamp:a.timeStamp,stopPropagation:function(){},preventDefault:function(){},
initEvent:function(){}};"readystatechange"==a.type&&this.onreadystatechange&&(this.onreadystatechange.handleEvent||this.onreadystatechange).apply(this,[a]);for(var b=0,c;c=this._listeners[b];b++)c[0]!=a.type||c[2]||(c[1].handleEvent||c[1]).apply(this,[a])};b.prototype.toString=function(){return"[object XMLHttpRequest]"};b.toString=function(){return"[XMLHttpRequest]"};window.Function.prototype.apply||(window.Function.prototype.apply=function(a,b){b||(b=[]);a.__func=this;a.__func(b[0],b[1],b[2],b[3],
b[4]);delete a.__func});OpenLayers.Request||(OpenLayers.Request={});OpenLayers.Request.XMLHttpRequest=b})();OpenLayers.Protocol.HTTP=OpenLayers.Class(OpenLayers.Protocol,{url:null,headers:null,params:null,callback:null,scope:null,readWithPOST:!1,updateWithPOST:!1,deleteWithPOST:!1,wildcarded:!1,srsInBBOX:!1,initialize:function(a){a=a||{};this.params={};this.headers={};OpenLayers.Protocol.prototype.initialize.apply(this,arguments);if(!this.filterToParams&&OpenLayers.Format.QueryStringFilter){var b=new OpenLayers.Format.QueryStringFilter({wildcarded:this.wildcarded,srsInBBOX:this.srsInBBOX});this.filterToParams=
function(a,d){return b.write(a,d)}}},destroy:function(){this.headers=this.params=null;OpenLayers.Protocol.prototype.destroy.apply(this)},read:function(a){OpenLayers.Protocol.prototype.read.apply(this,arguments);a=a||{};a.params=OpenLayers.Util.applyDefaults(a.params,this.options.params);a=OpenLayers.Util.applyDefaults(a,this.options);a.filter&&this.filterToParams&&(a.params=this.filterToParams(a.filter,a.params));var b=void 0!==a.readWithPOST?a.readWithPOST:this.readWithPOST,c=new OpenLayers.Protocol.Response({requestType:"read"});
b?(b=a.headers||{},b["Content-Type"]="application/x-www-form-urlencoded",c.priv=OpenLayers.Request.POST({url:a.url,callback:this.createCallback(this.handleRead,c,a),data:OpenLayers.Util.getParameterString(a.params),headers:b})):c.priv=OpenLayers.Request.GET({url:a.url,callback:this.createCallback(this.handleRead,c,a),params:a.params,headers:a.headers});return c},handleRead:function(a,b){this.handleResponse(a,b)},create:function(a,b){b=OpenLayers.Util.applyDefaults(b,this.options);var c=new OpenLayers.Protocol.Response({reqFeatures:a,
requestType:"create"});c.priv=OpenLayers.Request.POST({url:b.url,callback:this.createCallback(this.handleCreate,c,b),headers:b.headers,data:this.format.write(a)});return c},handleCreate:function(a,b){this.handleResponse(a,b)},update:function(a,b){b=b||{};var c=b.url||a.url||this.options.url+"/"+a.fid;b=OpenLayers.Util.applyDefaults(b,this.options);var d=new OpenLayers.Protocol.Response({reqFeatures:a,requestType:"update"});d.priv=OpenLayers.Request[this.updateWithPOST?"POST":"PUT"]({url:c,callback:this.createCallback(this.handleUpdate,
d,b),headers:b.headers,data:this.format.write(a)});return d},handleUpdate:function(a,b){this.handleResponse(a,b)},"delete":function(a,b){b=b||{};var c=b.url||a.url||this.options.url+"/"+a.fid;b=OpenLayers.Util.applyDefaults(b,this.options);var d=new OpenLayers.Protocol.Response({reqFeatures:a,requestType:"delete"}),e=this.deleteWithPOST?"POST":"DELETE",c={url:c,callback:this.createCallback(this.handleDelete,d,b),headers:b.headers};this.deleteWithPOST&&(c.data=this.format.write(a));d.priv=OpenLayers.Request[e](c);
return d},handleDelete:function(a,b){this.handleResponse(a,b)},handleResponse:function(a,b){var c=a.priv;b.callback&&(200<=c.status&&300>c.status?("delete"!=a.requestType&&(a.features=this.parseFeatures(c)),a.code=OpenLayers.Protocol.Response.SUCCESS):a.code=OpenLayers.Protocol.Response.FAILURE,b.callback.call(b.scope,a))},parseFeatures:function(a){var b=a.responseXML;b&&b.documentElement||(b=a.responseText);return!b||0>=b.length?null:this.format.read(b)},commit:function(a,b){function c(a){for(var b=
a.features?a.features.length:0,c=Array(b),e=0;e<b;++e)c[e]=a.features[e].fid;r.insertIds=c;d.apply(this,[a])}function d(a){this.callUserCallback(a,b);p=p&&a.success();f++;f>=n&&b.callback&&(r.code=p?OpenLayers.Protocol.Response.SUCCESS:OpenLayers.Protocol.Response.FAILURE,b.callback.apply(b.scope,[r]))}b=OpenLayers.Util.applyDefaults(b,this.options);var e=[],f=0,g={};g[OpenLayers.State.INSERT]=[];g[OpenLayers.State.UPDATE]=[];g[OpenLayers.State.DELETE]=[];for(var h,k,l=[],m=0,q=a.length;m<q;++m)if(h=
a[m],k=g[h.state])k.push(h),l.push(h);var n=(0<g[OpenLayers.State.INSERT].length?1:0)+g[OpenLayers.State.UPDATE].length+g[OpenLayers.State.DELETE].length,p=!0,r=new OpenLayers.Protocol.Response({reqFeatures:l});h=g[OpenLayers.State.INSERT];0<h.length&&e.push(this.create(h,OpenLayers.Util.applyDefaults({callback:c,scope:this},b.create)));h=g[OpenLayers.State.UPDATE];for(m=h.length-1;0<=m;--m)e.push(this.update(h[m],OpenLayers.Util.applyDefaults({callback:d,scope:this},b.update)));h=g[OpenLayers.State.DELETE];
for(m=h.length-1;0<=m;--m)e.push(this["delete"](h[m],OpenLayers.Util.applyDefaults({callback:d,scope:this},b["delete"])));return e},abort:function(a){a&&a.priv.abort()},callUserCallback:function(a,b){var c=b[a.requestType];c&&c.callback&&c.callback.call(c.scope,a)},CLASS_NAME:"OpenLayers.Protocol.HTTP"});OpenLayers.Handler.Click=OpenLayers.Class(OpenLayers.Handler,{delay:300,single:!0,"double":!1,pixelTolerance:0,dblclickTolerance:13,stopSingle:!1,stopDouble:!1,timerId:null,down:null,last:null,first:null,rightclickTimerId:null,touchstart:function(a){this.startTouch();this.down=this.getEventInfo(a);this.last=this.getEventInfo(a);return!0},touchmove:function(a){this.last=this.getEventInfo(a);return!0},touchend:function(a){this.down&&(a.xy=this.last.xy,a.lastTouches=this.last.touches,this.handleSingle(a),
this.down=null);return!0},mousedown:function(a){this.down=this.getEventInfo(a);this.last=this.getEventInfo(a);return!0},mouseup:function(a){var b=!0;this.checkModifiers(a)&&this.control.handleRightClicks&&OpenLayers.Event.isRightClick(a)&&(b=this.rightclick(a));return b},rightclick:function(a){if(this.passesTolerance(a)){if(null!=this.rightclickTimerId)return this.clearTimer(),this.callback("dblrightclick",[a]),!this.stopDouble;a=this["double"]?OpenLayers.Util.extend({},a):this.callback("rightclick",
[a]);a=OpenLayers.Function.bind(this.delayedRightCall,this,a);this.rightclickTimerId=window.setTimeout(a,this.delay)}return!this.stopSingle},delayedRightCall:function(a){this.rightclickTimerId=null;a&&this.callback("rightclick",[a])},click:function(a){this.last||(this.last=this.getEventInfo(a));this.handleSingle(a);return!this.stopSingle},dblclick:function(a){this.handleDouble(a);return!this.stopDouble},handleDouble:function(a){this.passesDblclickTolerance(a)&&(this["double"]&&this.callback("dblclick",
[a]),this.clearTimer())},handleSingle:function(a){this.passesTolerance(a)&&(null!=this.timerId?(this.last.touches&&1===this.last.touches.length&&(this["double"]&&OpenLayers.Event.preventDefault(a),this.handleDouble(a)),this.last.touches&&2===this.last.touches.length||this.clearTimer()):(this.first=this.getEventInfo(a),a=this.single?OpenLayers.Util.extend({},a):null,this.queuePotentialClick(a)))},queuePotentialClick:function(a){this.timerId=window.setTimeout(OpenLayers.Function.bind(this.delayedCall,
this,a),this.delay)},passesTolerance:function(a){var b=!0;if(null!=this.pixelTolerance&&this.down&&this.down.xy&&(b=this.pixelTolerance>=this.down.xy.distanceTo(a.xy))&&this.touch&&this.down.touches.length===this.last.touches.length){a=0;for(var c=this.down.touches.length;a<c;++a)if(this.getTouchDistance(this.down.touches[a],this.last.touches[a])>this.pixelTolerance){b=!1;break}}return b},getTouchDistance:function(a,b){return Math.sqrt(Math.pow(a.clientX-b.clientX,2)+Math.pow(a.clientY-b.clientY,
2))},passesDblclickTolerance:function(a){a=!0;this.down&&this.first&&(a=this.down.xy.distanceTo(this.first.xy)<=this.dblclickTolerance);return a},clearTimer:function(){null!=this.timerId&&(window.clearTimeout(this.timerId),this.timerId=null);null!=this.rightclickTimerId&&(window.clearTimeout(this.rightclickTimerId),this.rightclickTimerId=null)},delayedCall:function(a){this.timerId=null;a&&this.callback("click",[a])},getEventInfo:function(a){var b;if(a.touches){var c=a.touches.length;b=Array(c);for(var d,
e=0;e<c;e++)d=a.touches[e],b[e]={clientX:d.olClientX,clientY:d.olClientY}}return{xy:a.xy,touches:b}},deactivate:function(){var a=!1;OpenLayers.Handler.prototype.deactivate.apply(this,arguments)&&(this.clearTimer(),this.last=this.first=this.down=null,a=!0);return a},CLASS_NAME:"OpenLayers.Handler.Click"});OpenLayers.Geometry=OpenLayers.Class({id:null,parent:null,bounds:null,initialize:function(){this.id=OpenLayers.Util.createUniqueID(this.CLASS_NAME+"_")},destroy:function(){this.bounds=this.id=null},clone:function(){return new OpenLayers.Geometry},setBounds:function(a){a&&(this.bounds=a.clone())},clearBounds:function(){this.bounds=null;this.parent&&this.parent.clearBounds()},extendBounds:function(a){this.getBounds()?this.bounds.extend(a):this.setBounds(a)},getBounds:function(){null==this.bounds&&this.calculateBounds();
return this.bounds},calculateBounds:function(){},distanceTo:function(a,b){},getVertices:function(a){},atPoint:function(a,b,c){var d=!1;null!=this.getBounds()&&null!=a&&(b=null!=b?b:0,c=null!=c?c:0,d=(new OpenLayers.Bounds(this.bounds.left-b,this.bounds.bottom-c,this.bounds.right+b,this.bounds.top+c)).containsLonLat(a));return d},getLength:function(){return 0},getArea:function(){return 0},getCentroid:function(){return null},toString:function(){return OpenLayers.Format&&OpenLayers.Format.WKT?OpenLayers.Format.WKT.prototype.write(new OpenLayers.Feature.Vector(this)):
Object.prototype.toString.call(this)},CLASS_NAME:"OpenLayers.Geometry"});OpenLayers.Geometry.fromWKT=function(a){var b;if(OpenLayers.Format&&OpenLayers.Format.WKT){var c=OpenLayers.Geometry.fromWKT.format;c||(c=new OpenLayers.Format.WKT,OpenLayers.Geometry.fromWKT.format=c);a=c.read(a);if(a instanceof OpenLayers.Feature.Vector)b=a.geometry;else if(OpenLayers.Util.isArray(a)){b=a.length;for(var c=Array(b),d=0;d<b;++d)c[d]=a[d].geometry;b=new OpenLayers.Geometry.Collection(c)}}return b};
OpenLayers.Geometry.segmentsIntersect=function(a,b,c){var d=c&&c.point;c=c&&c.tolerance;var e=!1,f=a.x1-b.x1,g=a.y1-b.y1,h=a.x2-a.x1,k=a.y2-a.y1,l=b.y2-b.y1,m=b.x2-b.x1,q=l*h-m*k,l=m*g-l*f,g=h*g-k*f;0==q?0==l&&0==g&&(e=!0):(f=l/q,q=g/q,0<=f&&1>=f&&0<=q&&1>=q&&(d?(h=a.x1+f*h,q=a.y1+f*k,e=new OpenLayers.Geometry.Point(h,q)):e=!0));if(c)if(e){if(d)a:for(a=[a,b],b=0;2>b;++b)for(f=a[b],k=1;3>k;++k)if(h=f["x"+k],q=f["y"+k],d=Math.sqrt(Math.pow(h-e.x,2)+Math.pow(q-e.y,2)),d<c){e.x=h;e.y=q;break a}}else a:for(a=
[a,b],b=0;2>b;++b)for(h=a[b],q=a[(b+1)%2],k=1;3>k;++k)if(f={x:h["x"+k],y:h["y"+k]},g=OpenLayers.Geometry.distanceToSegment(f,q),g.distance<c){e=d?new OpenLayers.Geometry.Point(f.x,f.y):!0;break a}return e};OpenLayers.Geometry.distanceToSegment=function(a,b){var c=OpenLayers.Geometry.distanceSquaredToSegment(a,b);c.distance=Math.sqrt(c.distance);return c};
OpenLayers.Geometry.distanceSquaredToSegment=function(a,b){var c=a.x,d=a.y,e=b.x1,f=b.y1,g=b.x2,h=b.y2,k=g-e,l=h-f,m=0==k&&0==l?0:(k*(c-e)+l*(d-f))/(Math.pow(k,2)+Math.pow(l,2));0>=m||(1<=m?(e=g,f=h):(e+=m*k,f+=m*l));return{distance:Math.pow(e-c,2)+Math.pow(f-d,2),x:e,y:f,along:m}};OpenLayers.Geometry.Point=OpenLayers.Class(OpenLayers.Geometry,{x:null,y:null,initialize:function(a,b){OpenLayers.Geometry.prototype.initialize.apply(this,arguments);this.x=parseFloat(a);this.y=parseFloat(b)},clone:function(a){null==a&&(a=new OpenLayers.Geometry.Point(this.x,this.y));OpenLayers.Util.applyDefaults(a,this);return a},calculateBounds:function(){this.bounds=new OpenLayers.Bounds(this.x,this.y,this.x,this.y)},distanceTo:function(a,b){var c=!(b&&!1===b.edge)&&b&&b.details,d,e,f,g,h;a instanceof
OpenLayers.Geometry.Point?(e=this.x,f=this.y,g=a.x,h=a.y,d=Math.sqrt(Math.pow(e-g,2)+Math.pow(f-h,2)),d=c?{x0:e,y0:f,x1:g,y1:h,distance:d}:d):(d=a.distanceTo(this,b),c&&(d={x0:d.x1,y0:d.y1,x1:d.x0,y1:d.y0,distance:d.distance}));return d},equals:function(a){var b=!1;null!=a&&(b=this.x==a.x&&this.y==a.y||isNaN(this.x)&&isNaN(this.y)&&isNaN(a.x)&&isNaN(a.y));return b},toShortString:function(){return this.x+", "+this.y},move:function(a,b){this.x+=a;this.y+=b;this.clearBounds()},rotate:function(a,b){a*=
Math.PI/180;var c=this.distanceTo(b),d=a+Math.atan2(this.y-b.y,this.x-b.x);this.x=b.x+c*Math.cos(d);this.y=b.y+c*Math.sin(d);this.clearBounds()},getCentroid:function(){return new OpenLayers.Geometry.Point(this.x,this.y)},resize:function(a,b,c){this.x=b.x+a*(void 0==c?1:c)*(this.x-b.x);this.y=b.y+a*(this.y-b.y);this.clearBounds();return this},intersects:function(a){return"OpenLayers.Geometry.Point"==a.CLASS_NAME?this.equals(a):a.intersects(this)},transform:function(a,b){a&&b&&(OpenLayers.Projection.transform(this,
a,b),this.bounds=null);return this},getVertices:function(a){return[this]},CLASS_NAME:"OpenLayers.Geometry.Point"});OpenLayers.Handler.Point=OpenLayers.Class(OpenLayers.Handler,{point:null,layer:null,multi:!1,citeCompliant:!1,mouseDown:!1,stoppedDown:null,lastDown:null,lastUp:null,persist:!1,stopDown:!1,stopUp:!1,layerOptions:null,pixelTolerance:5,lastTouchPx:null,initialize:function(a,b,c){c&&c.layerOptions&&c.layerOptions.styleMap||(this.style=OpenLayers.Util.extend(OpenLayers.Feature.Vector.style["default"],{}));OpenLayers.Handler.prototype.initialize.apply(this,arguments)},activate:function(){if(!OpenLayers.Handler.prototype.activate.apply(this,
arguments))return!1;var a=OpenLayers.Util.extend({displayInLayerSwitcher:!1,calculateInRange:OpenLayers.Function.True,wrapDateLine:this.citeCompliant},this.layerOptions);this.layer=new OpenLayers.Layer.Vector(this.CLASS_NAME,a);this.map.addLayer(this.layer);return!0},createFeature:function(a){a=this.layer.getLonLatFromViewPortPx(a);a=new OpenLayers.Geometry.Point(a.lon,a.lat);this.point=new OpenLayers.Feature.Vector(a);this.callback("create",[this.point.geometry,this.point]);this.point.geometry.clearBounds();
this.layer.addFeatures([this.point],{silent:!0})},deactivate:function(){if(!OpenLayers.Handler.prototype.deactivate.apply(this,arguments))return!1;this.cancel();null!=this.layer.map&&(this.destroyFeature(!0),this.layer.destroy(!1));this.layer=null;return!0},destroyFeature:function(a){!this.layer||!a&&this.persist||this.layer.destroyFeatures();this.point=null},destroyPersistedFeature:function(){var a=this.layer;a&&1<a.features.length&&this.layer.features[0].destroy()},finalize:function(a){this.mouseDown=
!1;this.lastTouchPx=this.lastUp=this.lastDown=null;this.callback(a?"cancel":"done",[this.geometryClone()]);this.destroyFeature(a)},cancel:function(){this.finalize(!0)},click:function(a){OpenLayers.Event.stop(a);return!1},dblclick:function(a){OpenLayers.Event.stop(a);return!1},modifyFeature:function(a){this.point||this.createFeature(a);a=this.layer.getLonLatFromViewPortPx(a);this.point.geometry.x=a.lon;this.point.geometry.y=a.lat;this.callback("modify",[this.point.geometry,this.point,!1]);this.point.geometry.clearBounds();
this.drawFeature()},drawFeature:function(){this.layer.drawFeature(this.point,this.style)},getGeometry:function(){var a=this.point&&this.point.geometry;a&&this.multi&&(a=new OpenLayers.Geometry.MultiPoint([a]));return a},geometryClone:function(){var a=this.getGeometry();return a&&a.clone()},mousedown:function(a){return this.down(a)},touchstart:function(a){this.startTouch();this.lastTouchPx=a.xy;return this.down(a)},mousemove:function(a){return this.move(a)},touchmove:function(a){this.lastTouchPx=a.xy;
return this.move(a)},mouseup:function(a){return this.up(a)},touchend:function(a){a.xy=this.lastTouchPx;return this.up(a)},down:function(a){this.mouseDown=!0;this.lastDown=a.xy;this.touch||this.modifyFeature(a.xy);this.stoppedDown=this.stopDown;return!this.stopDown},move:function(a){this.touch||this.mouseDown&&!this.stoppedDown||this.modifyFeature(a.xy);return!0},up:function(a){this.mouseDown=!1;this.stoppedDown=this.stopDown;return!this.checkModifiers(a)||this.lastUp&&this.lastUp.equals(a.xy)||!this.lastDown||
!this.passesTolerance(this.lastDown,a.xy,this.pixelTolerance)?!0:(this.touch&&this.modifyFeature(a.xy),this.persist&&this.destroyPersistedFeature(),this.lastUp=a.xy,this.finalize(),!this.stopUp)},mouseout:function(a){OpenLayers.Util.mouseLeft(a,this.map.viewPortDiv)&&(this.stoppedDown=this.stopDown,this.mouseDown=!1)},passesTolerance:function(a,b,c){var d=!0;null!=c&&a&&b&&a.distanceTo(b)>c&&(d=!1);return d},CLASS_NAME:"OpenLayers.Handler.Point"});OpenLayers.Geometry.Collection=OpenLayers.Class(OpenLayers.Geometry,{components:null,componentTypes:null,initialize:function(a){OpenLayers.Geometry.prototype.initialize.apply(this,arguments);this.components=[];null!=a&&this.addComponents(a)},destroy:function(){this.components.length=0;this.components=null;OpenLayers.Geometry.prototype.destroy.apply(this,arguments)},clone:function(){for(var a=new (OpenLayers.Util.getConstructor(this.CLASS_NAME)),b=0,c=this.components.length;b<c;b++)a.addComponent(this.components[b].clone());
OpenLayers.Util.applyDefaults(a,this);return a},getComponentsString:function(){for(var a=[],b=0,c=this.components.length;b<c;b++)a.push(this.components[b].toShortString());return a.join(",")},calculateBounds:function(){this.bounds=null;var a=new OpenLayers.Bounds,b=this.components;if(b)for(var c=0,d=b.length;c<d;c++)a.extend(b[c].getBounds());null!=a.left&&null!=a.bottom&&null!=a.right&&null!=a.top&&this.setBounds(a)},addComponents:function(a){OpenLayers.Util.isArray(a)||(a=[a]);for(var b=0,c=a.length;b<
c;b++)this.addComponent(a[b])},addComponent:function(a,b){var c=!1;if(a&&(null==this.componentTypes||-1<OpenLayers.Util.indexOf(this.componentTypes,a.CLASS_NAME))){if(null!=b&&b<this.components.length){var c=this.components.slice(0,b),d=this.components.slice(b,this.components.length);c.push(a);this.components=c.concat(d)}else this.components.push(a);a.parent=this;this.clearBounds();c=!0}return c},removeComponents:function(a){var b=!1;OpenLayers.Util.isArray(a)||(a=[a]);for(var c=a.length-1;0<=c;--c)b=
this.removeComponent(a[c])||b;return b},removeComponent:function(a){OpenLayers.Util.removeItem(this.components,a);this.clearBounds();return!0},getLength:function(){for(var a=0,b=0,c=this.components.length;b<c;b++)a+=this.components[b].getLength();return a},getArea:function(){for(var a=0,b=0,c=this.components.length;b<c;b++)a+=this.components[b].getArea();return a},getGeodesicArea:function(a){for(var b=0,c=0,d=this.components.length;c<d;c++)b+=this.components[c].getGeodesicArea(a);return b},getCentroid:function(a){if(!a)return this.components.length&&
this.components[0].getCentroid();a=this.components.length;if(!a)return!1;for(var b=[],c=[],d=0,e=Number.MAX_VALUE,f,g=0;g<a;++g){f=this.components[g];var h=f.getArea();f=f.getCentroid(!0);isNaN(h)||isNaN(f.x)||isNaN(f.y)||(b.push(h),d+=h,e=h<e&&0<h?h:e,c.push(f))}a=b.length;if(0===d){for(g=0;g<a;++g)b[g]=1;d=b.length}else{for(g=0;g<a;++g)b[g]/=e;d/=e}for(var k=e=0,g=0;g<a;++g)f=c[g],h=b[g],e+=f.x*h,k+=f.y*h;return new OpenLayers.Geometry.Point(e/d,k/d)},getGeodesicLength:function(a){for(var b=0,c=
0,d=this.components.length;c<d;c++)b+=this.components[c].getGeodesicLength(a);return b},move:function(a,b){for(var c=0,d=this.components.length;c<d;c++)this.components[c].move(a,b)},rotate:function(a,b){for(var c=0,d=this.components.length;c<d;++c)this.components[c].rotate(a,b)},resize:function(a,b,c){for(var d=0;d<this.components.length;++d)this.components[d].resize(a,b,c);return this},distanceTo:function(a,b){for(var c=!(b&&!1===b.edge)&&b&&b.details,d,e,f,g=Number.POSITIVE_INFINITY,h=0,k=this.components.length;h<
k&&!(d=this.components[h].distanceTo(a,b),f=c?d.distance:d,f<g&&(g=f,e=d,0==g));++h);return e},equals:function(a){var b=!0;if(a&&a.CLASS_NAME&&this.CLASS_NAME==a.CLASS_NAME)if(OpenLayers.Util.isArray(a.components)&&a.components.length==this.components.length)for(var c=0,d=this.components.length;c<d;++c){if(!this.components[c].equals(a.components[c])){b=!1;break}}else b=!1;else b=!1;return b},transform:function(a,b){if(a&&b){for(var c=0,d=this.components.length;c<d;c++)this.components[c].transform(a,
b);this.bounds=null}return this},intersects:function(a){for(var b=!1,c=0,d=this.components.length;c<d&&!(b=a.intersects(this.components[c]));++c);return b},getVertices:function(a){for(var b=[],c=0,d=this.components.length;c<d;++c)Array.prototype.push.apply(b,this.components[c].getVertices(a));return b},CLASS_NAME:"OpenLayers.Geometry.Collection"});OpenLayers.Geometry.MultiPoint=OpenLayers.Class(OpenLayers.Geometry.Collection,{componentTypes:["OpenLayers.Geometry.Point"],addPoint:function(a,b){this.addComponent(a,b)},removePoint:function(a){this.removeComponent(a)},CLASS_NAME:"OpenLayers.Geometry.MultiPoint"});OpenLayers.Geometry.Curve=OpenLayers.Class(OpenLayers.Geometry.MultiPoint,{componentTypes:["OpenLayers.Geometry.Point"],getLength:function(){var a=0;if(this.components&&1<this.components.length)for(var b=1,c=this.components.length;b<c;b++)a+=this.components[b-1].distanceTo(this.components[b]);return a},getGeodesicLength:function(a){var b=this;if(a){var c=new OpenLayers.Projection("EPSG:4326");c.equals(a)||(b=this.clone().transform(a,c))}a=0;if(b.components&&1<b.components.length)for(var d,e=1,f=b.components.length;e<
f;e++)c=b.components[e-1],d=b.components[e],a+=OpenLayers.Util.distVincenty({lon:c.x,lat:c.y},{lon:d.x,lat:d.y});return 1E3*a},CLASS_NAME:"OpenLayers.Geometry.Curve"});OpenLayers.Geometry.LineString=OpenLayers.Class(OpenLayers.Geometry.Curve,{removeComponent:function(a){var b=this.components&&2<this.components.length;b&&OpenLayers.Geometry.Collection.prototype.removeComponent.apply(this,arguments);return b},intersects:function(a){var b=!1,c=a.CLASS_NAME;if("OpenLayers.Geometry.LineString"==c||"OpenLayers.Geometry.LinearRing"==c||"OpenLayers.Geometry.Point"==c){var d=this.getSortedSegments();a="OpenLayers.Geometry.Point"==c?[{x1:a.x,y1:a.y,x2:a.x,y2:a.y}]:a.getSortedSegments();
var e,f,g,h,k,l,m,q=0,n=d.length;a:for(;q<n;++q){c=d[q];e=c.x1;f=c.x2;g=c.y1;h=c.y2;var p=0,r=a.length;for(;p<r;++p){k=a[p];if(k.x1>f)break;if(!(k.x2<e||(l=k.y1,m=k.y2,Math.min(l,m)>Math.max(g,h)||Math.max(l,m)<Math.min(g,h)||!OpenLayers.Geometry.segmentsIntersect(c,k)))){b=!0;break a}}}}else b=a.intersects(this);return b},getSortedSegments:function(){for(var a=this.components.length-1,b=Array(a),c,d,e=0;e<a;++e)c=this.components[e],d=this.components[e+1],b[e]=c.x<d.x?{x1:c.x,y1:c.y,x2:d.x,y2:d.y}:
{x1:d.x,y1:d.y,x2:c.x,y2:c.y};return b.sort(function(a,b){return a.x1-b.x1})},splitWithSegment:function(a,b){for(var c=!(b&&!1===b.edge),d=b&&b.tolerance,e=[],f=this.getVertices(),g=[],h=[],k=!1,l,m,q,n={point:!0,tolerance:d},p=null,r=0,t=f.length-2;r<=t;++r)if(d=f[r],g.push(d.clone()),l=f[r+1],m={x1:d.x,y1:d.y,x2:l.x,y2:l.y},m=OpenLayers.Geometry.segmentsIntersect(a,m,n),m instanceof OpenLayers.Geometry.Point&&((q=m.x===a.x1&&m.y===a.y1||m.x===a.x2&&m.y===a.y2||m.equals(d)||m.equals(l)?!0:!1)||c))m.equals(h[h.length-
1])||h.push(m.clone()),0===r&&m.equals(d)||m.equals(l)||(k=!0,m.equals(d)||g.push(m),e.push(new OpenLayers.Geometry.LineString(g)),g=[m.clone()]);k&&(g.push(l.clone()),e.push(new OpenLayers.Geometry.LineString(g)));if(0<h.length)var u=a.x1<a.x2?1:-1,v=a.y1<a.y2?1:-1,p={lines:e,points:h.sort(function(a,b){return u*a.x-u*b.x||v*a.y-v*b.y})};return p},split:function(a,b){var c=null,d=b&&b.mutual,e,f,g,h;if(a instanceof OpenLayers.Geometry.LineString){var k=this.getVertices(),l,m,q,n,p,r=[];g=[];for(var t=
0,u=k.length-2;t<=u;++t){l=k[t];m=k[t+1];q={x1:l.x,y1:l.y,x2:m.x,y2:m.y};h=h||[a];d&&r.push(l.clone());for(var v=0;v<h.length;++v)if(n=h[v].splitWithSegment(q,b))if(p=n.lines,0<p.length&&(p.unshift(v,1),Array.prototype.splice.apply(h,p),v+=p.length-2),d)for(var w=0,x=n.points.length;w<x;++w)p=n.points[w],p.equals(l)||(r.push(p),g.push(new OpenLayers.Geometry.LineString(r)),r=p.equals(m)?[]:[p.clone()])}d&&0<g.length&&0<r.length&&(r.push(m.clone()),g.push(new OpenLayers.Geometry.LineString(r)))}else c=
a.splitWith(this,b);h&&1<h.length?f=!0:h=[];g&&1<g.length?e=!0:g=[];if(f||e)c=d?[g,h]:h;return c},splitWith:function(a,b){return a.split(this,b)},getVertices:function(a){return!0===a?[this.components[0],this.components[this.components.length-1]]:!1===a?this.components.slice(1,this.components.length-1):this.components.slice()},distanceTo:function(a,b){var c=!(b&&!1===b.edge)&&b&&b.details,d,e={},f=Number.POSITIVE_INFINITY;if(a instanceof OpenLayers.Geometry.Point)for(var g=this.getSortedSegments(),
h=a.x,k=a.y,l,m=0,q=g.length;m<q&&!(l=g[m],d=OpenLayers.Geometry.distanceToSegment(a,l),d.distance<f&&(f=d.distance,e=c?{distance:f,x0:d.x,y0:d.y,x1:h,y1:k,index:m,indexDistance:(new OpenLayers.Geometry.Point(l.x1,l.y1)).distanceTo(a)}:f,0===f));++m);else if(a instanceof OpenLayers.Geometry.LineString){var g=this.getSortedSegments(),h=a.getSortedSegments(),n,p,r=h.length,t={point:!0},m=0,q=g.length;a:for(;m<q;++m){k=g[m];l=k.x1;p=k.y1;for(var u=0;u<r;++u)if(d=h[u],n=OpenLayers.Geometry.segmentsIntersect(k,
d,t)){f=0;e={distance:0,x0:n.x,y0:n.y,x1:n.x,y1:n.y};break a}else d=OpenLayers.Geometry.distanceToSegment({x:l,y:p},d),d.distance<f&&(f=d.distance,e={distance:f,x0:l,y0:p,x1:d.x,y1:d.y})}c||(e=e.distance);0!==f&&k&&(d=a.distanceTo(new OpenLayers.Geometry.Point(k.x2,k.y2),b),m=c?d.distance:d,m<f&&(e=c?{distance:f,x0:d.x1,y0:d.y1,x1:d.x0,y1:d.y0}:m))}else e=a.distanceTo(this,b),c&&(e={distance:e.distance,x0:e.x1,y0:e.y1,x1:e.x0,y1:e.y0});return e},simplify:function(a){if(this&&null!==this){var b=this.getVertices();
if(3>b.length)return this;var c=function(a,b,d,k){for(var f=0,g=0,h=b,n;h<d;h++){n=a[b];var p=a[d],r=a[h];n=Math.abs(.5*(n.x*p.y+p.x*r.y+r.x*n.y-p.x*n.y-r.x*p.y-n.x*r.y))/Math.sqrt(Math.pow(n.x-p.x,2)+Math.pow(n.y-p.y,2))*2;n>f&&(f=n,g=h)}f>k&&g!=b&&(e.push(g),c(a,b,g,k),c(a,g,d,k))},d=b.length-1,e=[];e.push(0);for(e.push(d);b[0].equals(b[d]);)d--,e.push(d);c(b,0,d,a);a=[];e.sort(function(a,b){return a-b});for(d=0;d<e.length;d++)a.push(b[e[d]]);return new OpenLayers.Geometry.LineString(a)}return this},
CLASS_NAME:"OpenLayers.Geometry.LineString"});
OpenLayers.Geometry.LineString.geodesic=function(a,b,c){for(var d=[],e=a(0),f=a(1),g=b(e),h=b(f),k=[f,e],l=[h,g],m=[1,0],q={},n=1E5,p,r,t,u,v;0<--n&&0<m.length;)t=m.pop(),e=k.pop(),g=l.pop(),f=t.toString(),f in q||(d.push(g),q[f]=!0),u=m.pop(),f=k.pop(),h=l.pop(),v=(t+u)/2,p=a(v),r=b(p),OpenLayers.Geometry.distanceSquaredToSegment(r,{x1:g.x,y1:g.y,x2:h.x,y2:h.y}).distance<c?(d.push(h),f=u.toString(),q[f]=!0):(m.push(u,v,v,t),l.push(h,r,r,g),k.push(f,p,p,e));return new OpenLayers.Geometry.LineString(d)};
OpenLayers.Geometry.LineString.geodesicMeridian=function(a,b,c,d,e){var f=new OpenLayers.Projection("EPSG:4326");return OpenLayers.Geometry.LineString.geodesic(function(d){return new OpenLayers.Geometry.Point(a,b+(c-b)*d)},function(a){return a.transform(f,d)},e)};
OpenLayers.Geometry.LineString.geodesicParallel=function(a,b,c,d,e){var f=new OpenLayers.Projection("EPSG:4326");return OpenLayers.Geometry.LineString.geodesic(function(d){return new OpenLayers.Geometry.Point(b+(c-b)*d,a)},function(a){return a.transform(f,d)},e)};OpenLayers.Handler.Path=OpenLayers.Class(OpenLayers.Handler.Point,{line:null,maxVertices:null,doubleTouchTolerance:20,freehand:!1,freehandToggle:"shiftKey",timerId:null,redoStack:null,createFeature:function(a){a=this.layer.getLonLatFromViewPortPx(a);a=new OpenLayers.Geometry.Point(a.lon,a.lat);this.point=new OpenLayers.Feature.Vector(a);this.line=new OpenLayers.Feature.Vector(new OpenLayers.Geometry.LineString([this.point.geometry]));this.callback("create",[this.point.geometry,this.getSketch()]);
this.point.geometry.clearBounds();this.layer.addFeatures([this.line,this.point],{silent:!0})},destroyFeature:function(a){OpenLayers.Handler.Point.prototype.destroyFeature.call(this,a);this.line=null},destroyPersistedFeature:function(){var a=this.layer;a&&2<a.features.length&&this.layer.features[0].destroy()},removePoint:function(){this.point&&this.layer.removeFeatures([this.point])},addPoint:function(a){this.layer.removeFeatures([this.point]);a=this.layer.getLonLatFromViewPortPx(a);this.point=new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(a.lon,
a.lat));this.line.geometry.addComponent(this.point.geometry,this.line.geometry.components.length);this.layer.addFeatures([this.point]);this.callback("point",[this.point.geometry,this.getGeometry()]);this.callback("modify",[this.point.geometry,this.getSketch()]);this.drawFeature();delete this.redoStack},insertXY:function(a,b){this.line.geometry.addComponent(new OpenLayers.Geometry.Point(a,b),this.getCurrentPointIndex());this.drawFeature();delete this.redoStack},insertDeltaXY:function(a,b){var c=this.getCurrentPointIndex()-
1,c=this.line.geometry.components[c];!c||isNaN(c.x)||isNaN(c.y)||this.insertXY(c.x+a,c.y+b)},insertDirectionLength:function(a,b){a*=Math.PI/180;this.insertDeltaXY(b*Math.cos(a),b*Math.sin(a))},insertDeflectionLength:function(a,b){var c=this.getCurrentPointIndex()-1;if(0<c){var d=this.line.geometry.components[c],c=this.line.geometry.components[c-1];this.insertDirectionLength(180*Math.atan2(d.y-c.y,d.x-c.x)/Math.PI+a,b)}},getCurrentPointIndex:function(){return this.line.geometry.components.length-1},
undo:function(){var a=this.line.geometry,b=a.components,c=this.getCurrentPointIndex()-1,d=b[c],e=a.removeComponent(d);e&&(this.touch&&0<c&&(b=a.components,a=b[c-1],c=this.getCurrentPointIndex(),b=b[c],b.x=a.x,b.y=a.y),this.redoStack||(this.redoStack=[]),this.redoStack.push(d),this.drawFeature());return e},redo:function(){var a=this.redoStack&&this.redoStack.pop();a&&(this.line.geometry.addComponent(a,this.getCurrentPointIndex()),this.drawFeature());return!!a},freehandMode:function(a){return this.freehandToggle&&
a[this.freehandToggle]?!this.freehand:this.freehand},modifyFeature:function(a,b){this.line||this.createFeature(a);var c=this.layer.getLonLatFromViewPortPx(a);this.point.geometry.x=c.lon;this.point.geometry.y=c.lat;this.callback("modify",[this.point.geometry,this.getSketch(),b]);this.point.geometry.clearBounds();this.drawFeature()},drawFeature:function(){this.layer.drawFeature(this.line,this.style);this.layer.drawFeature(this.point,this.style)},getSketch:function(){return this.line},getGeometry:function(){var a=
this.line&&this.line.geometry;a&&this.multi&&(a=new OpenLayers.Geometry.MultiLineString([a]));return a},touchstart:function(a){if(this.timerId&&this.passesTolerance(this.lastTouchPx,a.xy,this.doubleTouchTolerance))return this.finishGeometry(),window.clearTimeout(this.timerId),this.timerId=null,!1;this.timerId&&(window.clearTimeout(this.timerId),this.timerId=null);this.timerId=window.setTimeout(OpenLayers.Function.bind(function(){this.timerId=null},this),300);return OpenLayers.Handler.Point.prototype.touchstart.call(this,
a)},down:function(a){var b=this.stopDown;this.freehandMode(a)&&(b=!0,this.touch&&(this.modifyFeature(a.xy,!!this.lastUp),OpenLayers.Event.stop(a)));this.touch||this.lastDown&&this.passesTolerance(this.lastDown,a.xy,this.pixelTolerance)||this.modifyFeature(a.xy,!!this.lastUp);this.mouseDown=!0;this.lastDown=a.xy;this.stoppedDown=b;return!b},move:function(a){if(this.stoppedDown&&this.freehandMode(a))return this.persist&&this.destroyPersistedFeature(),this.maxVertices&&this.line&&this.line.geometry.components.length===
this.maxVertices?(this.removePoint(),this.finalize()):this.addPoint(a.xy),!1;this.touch||this.mouseDown&&!this.stoppedDown||this.modifyFeature(a.xy,!!this.lastUp);return!0},up:function(a){!this.mouseDown||this.lastUp&&this.lastUp.equals(a.xy)||(this.stoppedDown&&this.freehandMode(a)?(this.persist&&this.destroyPersistedFeature(),this.removePoint(),this.finalize()):this.passesTolerance(this.lastDown,a.xy,this.pixelTolerance)&&(this.touch&&this.modifyFeature(a.xy),null==this.lastUp&&this.persist&&this.destroyPersistedFeature(),
this.addPoint(a.xy),this.lastUp=a.xy,this.line.geometry.components.length===this.maxVertices+1&&this.finishGeometry()));this.stoppedDown=this.stopDown;this.mouseDown=!1;return!this.stopUp},finishGeometry:function(){this.line.geometry.removeComponent(this.line.geometry.components[this.line.geometry.components.length-1]);this.removePoint();this.finalize()},dblclick:function(a){this.freehandMode(a)||this.finishGeometry();return!1},CLASS_NAME:"OpenLayers.Handler.Path"});OpenLayers.Geometry.LinearRing=OpenLayers.Class(OpenLayers.Geometry.LineString,{componentTypes:["OpenLayers.Geometry.Point"],addComponent:function(a,b){var c=!1,d=this.components.pop();null==b&&a.equals(d)||(c=OpenLayers.Geometry.Collection.prototype.addComponent.apply(this,arguments));OpenLayers.Geometry.Collection.prototype.addComponent.apply(this,[this.components[0]]);return c},removeComponent:function(a){var b=this.components&&3<this.components.length;b&&(this.components.pop(),OpenLayers.Geometry.Collection.prototype.removeComponent.apply(this,
arguments),OpenLayers.Geometry.Collection.prototype.addComponent.apply(this,[this.components[0]]));return b},move:function(a,b){for(var c=0,d=this.components.length;c<d-1;c++)this.components[c].move(a,b)},rotate:function(a,b){for(var c=0,d=this.components.length;c<d-1;++c)this.components[c].rotate(a,b)},resize:function(a,b,c){for(var d=0,e=this.components.length;d<e-1;++d)this.components[d].resize(a,b,c);return this},transform:function(a,b){if(a&&b){for(var c=0,d=this.components.length;c<d-1;c++)this.components[c].transform(a,
b);this.bounds=null}return this},getCentroid:function(){if(this.components){var a=this.components.length;if(0<a&&2>=a)return this.components[0].clone();if(2<a){var b=0,c=0,d=this.components[0].x,e=this.components[0].y,f=-1*this.getArea();if(0!=f){for(var g=0;g<a-1;g++)var h=this.components[g],k=this.components[g+1],b=b+(h.x+k.x-2*d)*((h.x-d)*(k.y-e)-(k.x-d)*(h.y-e)),c=c+(h.y+k.y-2*e)*((h.x-d)*(k.y-e)-(k.x-d)*(h.y-e));b=d+b/(6*f);a=e+c/(6*f)}else{for(g=0;g<a-1;g++)b+=this.components[g].x,c+=this.components[g].y;
b/=a-1;a=c/(a-1)}return new OpenLayers.Geometry.Point(b,a)}return null}},getArea:function(){var a=0;if(this.components&&2<this.components.length){for(var b=a=0,c=this.components.length;b<c-1;b++)var d=this.components[b],e=this.components[b+1],a=a+(d.x+e.x)*(e.y-d.y);a=-a/2}return a},getGeodesicArea:function(a){var b=this;if(a){var c=new OpenLayers.Projection("EPSG:4326");c.equals(a)||(b=this.clone().transform(a,c))}a=0;c=b.components&&b.components.length;if(2<c){for(var d,e,f=0;f<c-1;f++)d=b.components[f],
e=b.components[f+1],a+=OpenLayers.Util.rad(e.x-d.x)*(2+Math.sin(OpenLayers.Util.rad(d.y))+Math.sin(OpenLayers.Util.rad(e.y)));a=a*OpenLayers.Util.VincentyConstants.a*OpenLayers.Util.VincentyConstants.a/2}return a},containsPoint:function(a){var b=OpenLayers.Number.limitSigDigs,c=b(a.x,14);a=b(a.y,14);for(var d=this.components.length-1,e,f,g,h,k,l=0,m=0;m<d;++m)if(e=this.components[m],g=b(e.x,14),e=b(e.y,14),f=this.components[m+1],h=b(f.x,14),f=b(f.y,14),e==f){if(a==e&&(g<=h&&c>=g&&c<=h||g>=h&&c<=g&&
c>=h)){l=-1;break}}else{k=b((h-g)/(f-e)*(a-f)+h,14);if(k==c&&(e<f&&a>=e&&a<=f||e>f&&a<=e&&a>=f)){l=-1;break}k<=c||g!=h&&(k<Math.min(g,h)||k>Math.max(g,h))||(e<f&&a>=e&&a<f||e>f&&a<e&&a>=f)&&++l}return-1==l?1:!!(l&1)},intersects:function(a){var b=!1;if("OpenLayers.Geometry.Point"==a.CLASS_NAME)b=this.containsPoint(a);else if("OpenLayers.Geometry.LineString"==a.CLASS_NAME)b=a.intersects(this);else if("OpenLayers.Geometry.LinearRing"==a.CLASS_NAME)b=OpenLayers.Geometry.LineString.prototype.intersects.apply(this,
[a]);else for(var c=0,d=a.components.length;c<d&&!(b=a.components[c].intersects(this));++c);return b},getVertices:function(a){return!0===a?[]:this.components.slice(0,this.components.length-1)},CLASS_NAME:"OpenLayers.Geometry.LinearRing"});OpenLayers.Geometry.Polygon=OpenLayers.Class(OpenLayers.Geometry.Collection,{componentTypes:["OpenLayers.Geometry.LinearRing"],getArea:function(){var a=0;if(this.components&&0<this.components.length)for(var a=a+Math.abs(this.components[0].getArea()),b=1,c=this.components.length;b<c;b++)a-=Math.abs(this.components[b].getArea());return a},getGeodesicArea:function(a){var b=0;if(this.components&&0<this.components.length)for(var b=b+Math.abs(this.components[0].getGeodesicArea(a)),c=1,d=this.components.length;c<
d;c++)b-=Math.abs(this.components[c].getGeodesicArea(a));return b},containsPoint:function(a){var b=this.components.length,c=!1;if(0<b&&(c=this.components[0].containsPoint(a),1!==c&&c&&1<b))for(var d,e=1;e<b;++e)if(d=this.components[e].containsPoint(a)){c=1===d?1:!1;break}return c},intersects:function(a){var b=!1,c,d;if("OpenLayers.Geometry.Point"==a.CLASS_NAME)b=this.containsPoint(a);else if("OpenLayers.Geometry.LineString"==a.CLASS_NAME||"OpenLayers.Geometry.LinearRing"==a.CLASS_NAME){c=0;for(d=
this.components.length;c<d&&!(b=a.intersects(this.components[c]));++c);if(!b)for(c=0,d=a.components.length;c<d&&!(b=this.containsPoint(a.components[c]));++c);}else for(c=0,d=a.components.length;c<d&&!(b=this.intersects(a.components[c]));++c);if(!b&&"OpenLayers.Geometry.Polygon"==a.CLASS_NAME){var e=this.components[0];c=0;for(d=e.components.length;c<d&&!(b=a.containsPoint(e.components[c]));++c);}return b},distanceTo:function(a,b){return b&&!1===b.edge&&this.intersects(a)?0:OpenLayers.Geometry.Collection.prototype.distanceTo.apply(this,
[a,b])},CLASS_NAME:"OpenLayers.Geometry.Polygon"});OpenLayers.Geometry.Polygon.createRegularPolygon=function(a,b,c,d){var e=Math.PI*(1/c-.5);d&&(e+=d/180*Math.PI);for(var f,g=[],h=0;h<c;++h)f=e+2*h*Math.PI/c,d=a.x+b*Math.cos(f),f=a.y+b*Math.sin(f),g.push(new OpenLayers.Geometry.Point(d,f));a=new OpenLayers.Geometry.LinearRing(g);return new OpenLayers.Geometry.Polygon([a])};OpenLayers.Handler.Polygon=OpenLayers.Class(OpenLayers.Handler.Path,{holeModifier:null,drawingHole:!1,polygon:null,createFeature:function(a){a=this.layer.getLonLatFromViewPortPx(a);a=new OpenLayers.Geometry.Point(a.lon,a.lat);this.point=new OpenLayers.Feature.Vector(a);this.line=new OpenLayers.Feature.Vector(new OpenLayers.Geometry.LinearRing([this.point.geometry]));this.polygon=new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Polygon([this.line.geometry]));this.callback("create",[this.point.geometry,
this.getSketch()]);this.point.geometry.clearBounds();this.layer.addFeatures([this.polygon,this.point],{silent:!0})},addPoint:function(a){if(!this.drawingHole&&this.holeModifier&&this.evt&&this.evt[this.holeModifier])for(var b=this.point.geometry,c=this.control.layer.features,d,e=c.length-1;0<=e;--e)if(d=c[e].geometry,(d instanceof OpenLayers.Geometry.Polygon||d instanceof OpenLayers.Geometry.MultiPolygon)&&d.intersects(b)){b=c[e];this.control.layer.removeFeatures([b],{silent:!0});this.control.layer.events.registerPriority("sketchcomplete",
this,this.finalizeInteriorRing);this.control.layer.events.registerPriority("sketchmodified",this,this.enforceTopology);b.geometry.addComponent(this.line.geometry);this.polygon=b;this.drawingHole=!0;break}OpenLayers.Handler.Path.prototype.addPoint.apply(this,arguments)},getCurrentPointIndex:function(){return this.line.geometry.components.length-2},enforceTopology:function(a){a=a.vertex;var b=this.line.geometry.components;this.polygon.geometry.intersects(a)||(b=b[b.length-3],a.x=b.x,a.y=b.y)},finishGeometry:function(){this.line.geometry.removeComponent(this.line.geometry.components[this.line.geometry.components.length-
2]);this.removePoint();this.finalize()},finalizeInteriorRing:function(){var a=this.line.geometry,b=0!==a.getArea();if(b){for(var c=this.polygon.geometry.components,d=c.length-2;0<=d;--d)if(a.intersects(c[d])){b=!1;break}if(b)a:for(d=c.length-2;0<d;--d)for(var e=c[d].components,f=0,g=e.length;f<g;++f)if(a.containsPoint(e[f])){b=!1;break a}}b?this.polygon.state!==OpenLayers.State.INSERT&&(this.polygon.state=OpenLayers.State.UPDATE):this.polygon.geometry.removeComponent(a);this.restoreFeature();return!1},
cancel:function(){this.drawingHole&&(this.polygon.geometry.removeComponent(this.line.geometry),this.restoreFeature(!0));return OpenLayers.Handler.Path.prototype.cancel.apply(this,arguments)},restoreFeature:function(a){this.control.layer.events.unregister("sketchcomplete",this,this.finalizeInteriorRing);this.control.layer.events.unregister("sketchmodified",this,this.enforceTopology);this.layer.removeFeatures([this.polygon],{silent:!0});this.control.layer.addFeatures([this.polygon],{silent:!0});this.drawingHole=
!1;a||this.control.layer.events.triggerEvent("sketchcomplete",{feature:this.polygon})},destroyFeature:function(a){OpenLayers.Handler.Path.prototype.destroyFeature.call(this,a);this.polygon=null},drawFeature:function(){this.layer.drawFeature(this.polygon,this.style);this.layer.drawFeature(this.point,this.style)},getSketch:function(){return this.polygon},getGeometry:function(){var a=this.polygon&&this.polygon.geometry;a&&this.multi&&(a=new OpenLayers.Geometry.MultiPolygon([a]));return a},CLASS_NAME:"OpenLayers.Handler.Polygon"});OpenLayers.Handler.Drag=OpenLayers.Class(OpenLayers.Handler,{started:!1,stopDown:!0,dragging:!1,last:null,start:null,lastMoveEvt:null,oldOnselectstart:null,interval:0,timeoutId:null,documentDrag:!1,documentEvents:null,initialize:function(a,b,c){OpenLayers.Handler.prototype.initialize.apply(this,arguments);if(!0===this.documentDrag){var d=this;this._docMove=function(a){d.mousemove({xy:{x:a.clientX,y:a.clientY},element:document})};this._docUp=function(a){d.mouseup({xy:{x:a.clientX,y:a.clientY}})}}},
dragstart:function(a){var b=!0;this.dragging=!1;this.checkModifiers(a)&&this._pointerId==a.pointerId&&(OpenLayers.Event.isLeftClick(a)||OpenLayers.Event.isSingleTouch(a))?(this.started=!0,this.last=this.start=a.xy,OpenLayers.Element.addClass(this.map.viewPortDiv,"olDragDown"),this.down(a),this.callback("down",[a.xy]),OpenLayers.Event.preventDefault(a),this.oldOnselectstart||(this.oldOnselectstart=document.onselectstart?document.onselectstart:OpenLayers.Function.True),document.onselectstart=OpenLayers.Function.False,
b=!this.stopDown):(delete this._pointerId,this.started=!1,this.last=this.start=null);return b},dragmove:function(a){this.lastMoveEvt=a;!this.started||this._pointerId!=a.pointerId||this.timeoutId||a.xy.x==this.last.x&&a.xy.y==this.last.y||(!0===this.documentDrag&&this.documentEvents&&(a.element===document?(this.adjustXY(a),this.setEvent(a)):this.removeDocumentEvents()),0<this.interval&&(this.timeoutId=setTimeout(OpenLayers.Function.bind(this.removeTimeout,this),this.interval)),this.dragging=!0,this.move(a),
this.callback("move",[a.xy]),this.oldOnselectstart||(this.oldOnselectstart=document.onselectstart,document.onselectstart=OpenLayers.Function.False),this.last=a.xy);return!0},dragend:function(a){if(this.started&&this._pointerId==a.pointerId){!0===this.documentDrag&&this.documentEvents&&(this.adjustXY(a),this.removeDocumentEvents());var b=this.start!=this.last;this.dragging=this.started=!1;delete this._pointerId;OpenLayers.Element.removeClass(this.map.viewPortDiv,"olDragDown");this.up(a);this.callback("up",
[a.xy]);b&&this.callback("done",[a.xy]);document.onselectstart=this.oldOnselectstart}return!0},down:function(a){},move:function(a){},up:function(a){},out:function(a){},mousedown:function(a){return this.dragstart(a)},touchstart:function(a){this.startTouch();"_pointerId"in this||(this._pointerId=a.pointerId);return this.dragstart(a)},mousemove:function(a){return this.dragmove(a)},touchmove:function(a){return this.dragmove(a)},removeTimeout:function(){this.timeoutId=null;this.dragging&&this.mousemove(this.lastMoveEvt)},
mouseup:function(a){return this.dragend(a)},touchend:function(a){a.xy=this.last;return this.dragend(a)},mouseout:function(a){if(this.started&&OpenLayers.Util.mouseLeft(a,this.map.viewPortDiv))if(!0===this.documentDrag)this.addDocumentEvents();else{var b=this.start!=this.last;this.dragging=this.started=!1;OpenLayers.Element.removeClass(this.map.viewPortDiv,"olDragDown");this.out(a);this.callback("out",[]);b&&this.callback("done",[a.xy]);document.onselectstart&&(document.onselectstart=this.oldOnselectstart)}return!0},
click:function(a){return this.start==this.last},activate:function(){var a=!1;OpenLayers.Handler.prototype.activate.apply(this,arguments)&&(this.dragging=!1,a=!0);return a},deactivate:function(){var a=!1;OpenLayers.Handler.prototype.deactivate.apply(this,arguments)&&(this.dragging=this.started=!1,this.last=this.start=null,a=!0,OpenLayers.Element.removeClass(this.map.viewPortDiv,"olDragDown"));return a},adjustXY:function(a){var b=OpenLayers.Util.pagePosition(this.map.viewPortDiv);a.xy.x-=b[0];a.xy.y-=
b[1]},addDocumentEvents:function(){OpenLayers.Element.addClass(document.body,"olDragDown");this.documentEvents=!0;OpenLayers.Event.observe(document,"mousemove",this._docMove);OpenLayers.Event.observe(document,"mouseup",this._docUp)},removeDocumentEvents:function(){OpenLayers.Element.removeClass(document.body,"olDragDown");this.documentEvents=!1;OpenLayers.Event.stopObserving(document,"mousemove",this._docMove);OpenLayers.Event.stopObserving(document,"mouseup",this._docUp)},CLASS_NAME:"OpenLayers.Handler.Drag"});OpenLayers.Handler.RegularPolygon=OpenLayers.Class(OpenLayers.Handler.Drag,{sides:4,radius:null,snapAngle:null,snapToggle:"shiftKey",layerOptions:null,persist:!1,irregular:!1,citeCompliant:!1,angle:null,fixedRadius:!1,feature:null,layer:null,origin:null,initialize:function(a,b,c){c&&c.layerOptions&&c.layerOptions.styleMap||(this.style=OpenLayers.Util.extend(OpenLayers.Feature.Vector.style["default"],{}));OpenLayers.Handler.Drag.prototype.initialize.apply(this,[a,b,c]);this.options=c?c:{}},setOptions:function(a){OpenLayers.Util.extend(this.options,
a);OpenLayers.Util.extend(this,a)},activate:function(){var a=!1;OpenLayers.Handler.Drag.prototype.activate.apply(this,arguments)&&(a=OpenLayers.Util.extend({displayInLayerSwitcher:!1,calculateInRange:OpenLayers.Function.True,wrapDateLine:this.citeCompliant},this.layerOptions),this.layer=new OpenLayers.Layer.Vector(this.CLASS_NAME,a),this.map.addLayer(this.layer),a=!0);return a},deactivate:function(){var a=!1;OpenLayers.Handler.Drag.prototype.deactivate.apply(this,arguments)&&(this.dragging&&this.cancel(),
null!=this.layer.map&&(this.layer.destroy(!1),this.feature&&this.feature.destroy()),this.feature=this.layer=null,a=!0);return a},down:function(a){this.fixedRadius=!!this.radius;a=this.layer.getLonLatFromViewPortPx(a.xy);this.origin=new OpenLayers.Geometry.Point(a.lon,a.lat);if(!this.fixedRadius||this.irregular)this.radius=this.map.getResolution();this.persist&&this.clear();this.feature=new OpenLayers.Feature.Vector;this.createGeometry();this.callback("create",[this.origin,this.feature]);this.layer.addFeatures([this.feature],
{silent:!0});this.layer.drawFeature(this.feature,this.style)},move:function(a){var b=this.layer.getLonLatFromViewPortPx(a.xy),b=new OpenLayers.Geometry.Point(b.lon,b.lat);this.irregular?(a=Math.sqrt(2)*Math.abs(b.y-this.origin.y)/2,this.radius=Math.max(this.map.getResolution()/2,a)):this.fixedRadius?this.origin=b:(this.calculateAngle(b,a),this.radius=Math.max(this.map.getResolution()/2,b.distanceTo(this.origin)));this.modifyGeometry();this.irregular&&(a=b.x-this.origin.x,b=b.y-this.origin.y,this.feature.geometry.resize(1,
this.origin,0==b?a/(this.radius*Math.sqrt(2)):a/b),this.feature.geometry.move(a/2,b/2));this.layer.drawFeature(this.feature,this.style)},up:function(a){this.finalize();this.start==this.last&&this.callback("done",[a.xy])},out:function(a){this.finalize()},createGeometry:function(){this.angle=Math.PI*(1/this.sides-.5);this.snapAngle&&(this.angle+=Math.PI/180*this.snapAngle);this.feature.geometry=OpenLayers.Geometry.Polygon.createRegularPolygon(this.origin,this.radius,this.sides,this.snapAngle)},modifyGeometry:function(){var a,
b,c=this.feature.geometry.components[0];c.components.length!=this.sides+1&&(this.createGeometry(),c=this.feature.geometry.components[0]);for(var d=0;d<this.sides;++d)b=c.components[d],a=this.angle+2*d*Math.PI/this.sides,b.x=this.origin.x+this.radius*Math.cos(a),b.y=this.origin.y+this.radius*Math.sin(a),b.clearBounds()},calculateAngle:function(a,b){var c=Math.atan2(a.y-this.origin.y,a.x-this.origin.x);if(this.snapAngle&&this.snapToggle&&!b[this.snapToggle]){var d=Math.PI/180*this.snapAngle;this.angle=
Math.round(c/d)*d}else this.angle=c},cancel:function(){this.callback("cancel",null);this.finalize()},finalize:function(){this.origin=null;this.radius=this.options.radius},clear:function(){this.layer&&(this.layer.renderer.clear(),this.layer.destroyFeatures())},callback:function(a,b){this.callbacks[a]&&this.callbacks[a].apply(this.control,[this.feature.geometry.clone()]);this.persist||"done"!=a&&"cancel"!=a||this.clear()},CLASS_NAME:"OpenLayers.Handler.RegularPolygon"});OpenLayers.ElementsIndexer=OpenLayers.Class({maxZIndex:null,order:null,indices:null,compare:null,initialize:function(a){this.compare=a?OpenLayers.ElementsIndexer.IndexingMethods.Z_ORDER_Y_ORDER:OpenLayers.ElementsIndexer.IndexingMethods.Z_ORDER_DRAWING_ORDER;this.clear()},insert:function(a){this.exists(a)&&this.remove(a);var b=a.id;this.determineZIndex(a);for(var c=-1,d=this.order.length,e;1<d-c;)e=parseInt((c+d)/2),0<this.compare(this,a,OpenLayers.Util.getElement(this.order[e]))?c=e:d=e;this.order.splice(d,
0,b);this.indices[b]=this.getZIndex(a);return this.getNextElement(d)},remove:function(a){a=a.id;var b=OpenLayers.Util.indexOf(this.order,a);0<=b&&(this.order.splice(b,1),delete this.indices[a],this.maxZIndex=0<this.order.length?this.indices[this.order[this.order.length-1]]:0)},clear:function(){this.order=[];this.indices={};this.maxZIndex=0},exists:function(a){return null!=this.indices[a.id]},getZIndex:function(a){return a._style.graphicZIndex},determineZIndex:function(a){var b=a._style.graphicZIndex;
null==b?(b=this.maxZIndex,a._style.graphicZIndex=b):b>this.maxZIndex&&(this.maxZIndex=b)},getNextElement:function(a){a+=1;for(var b=void 0;a<this.order.length&&void 0==b;a++)b=OpenLayers.Util.getElement(this.order[a]);return b||null},CLASS_NAME:"OpenLayers.ElementsIndexer"});
OpenLayers.ElementsIndexer.IndexingMethods={Z_ORDER:function(a,b,c){b=a.getZIndex(b);var d=0;c&&(a=a.getZIndex(c),d=b-a);return d},Z_ORDER_DRAWING_ORDER:function(a,b,c){a=OpenLayers.ElementsIndexer.IndexingMethods.Z_ORDER(a,b,c);c&&0==a&&(a=1);return a},Z_ORDER_Y_ORDER:function(a,b,c){a=OpenLayers.ElementsIndexer.IndexingMethods.Z_ORDER(a,b,c);c&&0===a&&(b=c._boundsBottom-b._boundsBottom,a=0===b?1:b);return a}};
OpenLayers.Renderer.Elements=OpenLayers.Class(OpenLayers.Renderer,{rendererRoot:null,root:null,vectorRoot:null,textRoot:null,xmlns:null,xOffset:0,indexer:null,BACKGROUND_ID_SUFFIX:"_background",LABEL_ID_SUFFIX:"_label",LABEL_OUTLINE_SUFFIX:"_outline",initialize:function(a,b){OpenLayers.Renderer.prototype.initialize.apply(this,arguments);this.rendererRoot=this.createRenderRoot();this.root=this.createRoot("_root");this.vectorRoot=this.createRoot("_vroot");this.textRoot=this.createRoot("_troot");this.root.appendChild(this.vectorRoot);
this.root.appendChild(this.textRoot);this.rendererRoot.appendChild(this.root);this.container.appendChild(this.rendererRoot);b&&(b.zIndexing||b.yOrdering)&&(this.indexer=new OpenLayers.ElementsIndexer(b.yOrdering))},destroy:function(){this.clear();this.xmlns=this.root=this.rendererRoot=null;OpenLayers.Renderer.prototype.destroy.apply(this,arguments)},clear:function(){var a,b=this.vectorRoot;if(b)for(;a=b.firstChild;)b.removeChild(a);if(b=this.textRoot)for(;a=b.firstChild;)b.removeChild(a);this.indexer&&
this.indexer.clear()},setExtent:function(a,b){var c=OpenLayers.Renderer.prototype.setExtent.apply(this,arguments),d=this.getResolution();if(this.map.baseLayer&&this.map.baseLayer.wrapDateLine){var e,f=a.getWidth()/this.map.getExtent().getWidth();a=a.scale(1/f);f=this.map.getMaxExtent();f.right>a.left&&f.right<a.right?e=!0:f.left>a.left&&f.left<a.right&&(e=!1);if(e!==this.rightOfDateLine||b)c=!1,this.xOffset=!0===e?f.getWidth()/d:0;this.rightOfDateLine=e}return c},getNodeType:function(a,b){},drawGeometry:function(a,
b,c){var d=a.CLASS_NAME,e=!0;if("OpenLayers.Geometry.Collection"==d||"OpenLayers.Geometry.MultiPoint"==d||"OpenLayers.Geometry.MultiLineString"==d||"OpenLayers.Geometry.MultiPolygon"==d){for(var d=0,f=a.components.length;d<f;d++)e=this.drawGeometry(a.components[d],b,c)&&e;return e}d=e=!1;"none"!=b.display&&(b.backgroundGraphic?this.redrawBackgroundNode(a.id,a,b,c):d=!0,e=this.redrawNode(a.id,a,b,c));0==e&&(b=document.getElementById(a.id))&&(b._style.backgroundGraphic&&(d=!0),b.parentNode.removeChild(b));
d&&(b=document.getElementById(a.id+this.BACKGROUND_ID_SUFFIX))&&b.parentNode.removeChild(b);return e},redrawNode:function(a,b,c,d){c=this.applyDefaultSymbolizer(c);a=this.nodeFactory(a,this.getNodeType(b,c));a._featureId=d;a._boundsBottom=b.getBounds().bottom;a._geometryClass=b.CLASS_NAME;a._style=c;b=this.drawGeometryNode(a,b,c);if(!1===b)return!1;a=b.node;this.indexer?(c=this.indexer.insert(a))?this.vectorRoot.insertBefore(a,c):this.vectorRoot.appendChild(a):a.parentNode!==this.vectorRoot&&this.vectorRoot.appendChild(a);
this.postDraw(a);return b.complete},redrawBackgroundNode:function(a,b,c,d){c=OpenLayers.Util.extend({},c);c.externalGraphic=c.backgroundGraphic;c.graphicXOffset=c.backgroundXOffset;c.graphicYOffset=c.backgroundYOffset;c.graphicZIndex=c.backgroundGraphicZIndex;c.graphicWidth=c.backgroundWidth||c.graphicWidth;c.graphicHeight=c.backgroundHeight||c.graphicHeight;c.backgroundGraphic=null;c.backgroundXOffset=null;c.backgroundYOffset=null;c.backgroundGraphicZIndex=null;return this.redrawNode(a+this.BACKGROUND_ID_SUFFIX,
b,c,null)},drawGeometryNode:function(a,b,c){c=c||a._style;var d={isFilled:void 0===c.fill?!0:c.fill,isStroked:void 0===c.stroke?!!c.strokeWidth:c.stroke},e;switch(b.CLASS_NAME){case "OpenLayers.Geometry.Point":!1===c.graphic&&(d.isFilled=!1,d.isStroked=!1);e=this.drawPoint(a,b);break;case "OpenLayers.Geometry.LineString":d.isFilled=!1;e=this.drawLineString(a,b);break;case "OpenLayers.Geometry.LinearRing":e=this.drawLinearRing(a,b);break;case "OpenLayers.Geometry.Polygon":e=this.drawPolygon(a,b);break;
case "OpenLayers.Geometry.Rectangle":e=this.drawRectangle(a,b)}a._options=d;return 0!=e?{node:this.setStyle(a,c,d,b),complete:e}:!1},postDraw:function(a){},drawPoint:function(a,b){},drawLineString:function(a,b){},drawLinearRing:function(a,b){},drawPolygon:function(a,b){},drawRectangle:function(a,b){},drawCircle:function(a,b){},removeText:function(a){var b=document.getElementById(a+this.LABEL_ID_SUFFIX);b&&this.textRoot.removeChild(b);(a=document.getElementById(a+this.LABEL_OUTLINE_SUFFIX))&&this.textRoot.removeChild(a)},
getFeatureIdFromEvent:function(a){var b=a.target,c=b&&b.correspondingUseElement;return(c?c:b||a.srcElement)._featureId},eraseGeometry:function(a,b){if("OpenLayers.Geometry.MultiPoint"==a.CLASS_NAME||"OpenLayers.Geometry.MultiLineString"==a.CLASS_NAME||"OpenLayers.Geometry.MultiPolygon"==a.CLASS_NAME||"OpenLayers.Geometry.Collection"==a.CLASS_NAME)for(var c=0,d=a.components.length;c<d;c++)this.eraseGeometry(a.components[c],b);else(c=OpenLayers.Util.getElement(a.id))&&c.parentNode&&(c.geometry&&(c.geometry.destroy(),
c.geometry=null),c.parentNode.removeChild(c),this.indexer&&this.indexer.remove(c),c._style.backgroundGraphic&&(c=OpenLayers.Util.getElement(a.id+this.BACKGROUND_ID_SUFFIX))&&c.parentNode&&c.parentNode.removeChild(c))},nodeFactory:function(a,b){var c=OpenLayers.Util.getElement(a);c?this.nodeTypeCompare(c,b)||(c.parentNode.removeChild(c),c=this.nodeFactory(a,b)):c=this.createNode(b,a);return c},nodeTypeCompare:function(a,b){},createNode:function(a,b){},moveRoot:function(a){var b=this.root;a.root.parentNode==
this.rendererRoot&&(b=a.root);b.parentNode.removeChild(b);a.rendererRoot.appendChild(b)},getRenderLayerId:function(){return this.root.parentNode.parentNode.id},isComplexSymbol:function(a){return"circle"!=a&&!!a},CLASS_NAME:"OpenLayers.Renderer.Elements"});OpenLayers.Renderer.SVG=OpenLayers.Class(OpenLayers.Renderer.Elements,{xmlns:"http://www.w3.org/2000/svg",xlinkns:"http://www.w3.org/1999/xlink",MAX_PIXEL:15E3,translationParameters:null,symbolMetrics:null,initialize:function(a){this.supported()&&(OpenLayers.Renderer.Elements.prototype.initialize.apply(this,arguments),this.translationParameters={x:0,y:0},this.symbolMetrics={})},supported:function(){return document.implementation&&(document.implementation.hasFeature("org.w3c.svg","1.0")||document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#SVG",
"1.1")||document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure","1.1"))},inValidRange:function(a,b,c){a+=c?0:this.translationParameters.x;b+=c?0:this.translationParameters.y;return a>=-this.MAX_PIXEL&&a<=this.MAX_PIXEL&&b>=-this.MAX_PIXEL&&b<=this.MAX_PIXEL},setExtent:function(a,b){var c=OpenLayers.Renderer.Elements.prototype.setExtent.apply(this,arguments),d=this.getResolution(),e=-a.left/d,d=a.top/d;if(b)return this.left=e,this.top=d,this.rendererRoot.setAttributeNS(null,
"viewBox","0 0 "+this.size.w+" "+this.size.h),this.translate(this.xOffset,0),!0;(e=this.translate(e-this.left+this.xOffset,d-this.top))||this.setExtent(a,!0);return c&&e},translate:function(a,b){if(this.inValidRange(a,b,!0)){var c="";if(a||b)c="translate("+a+","+b+")";this.root.setAttributeNS(null,"transform",c);this.translationParameters={x:a,y:b};return!0}return!1},setSize:function(a){OpenLayers.Renderer.prototype.setSize.apply(this,arguments);this.rendererRoot.setAttributeNS(null,"width",this.size.w);
this.rendererRoot.setAttributeNS(null,"height",this.size.h)},getNodeType:function(a,b){var c=null;switch(a.CLASS_NAME){case "OpenLayers.Geometry.Point":c=b.externalGraphic?"image":this.isComplexSymbol(b.graphicName)?"svg":"circle";break;case "OpenLayers.Geometry.Rectangle":c="rect";break;case "OpenLayers.Geometry.LineString":c="polyline";break;case "OpenLayers.Geometry.LinearRing":c="polygon";break;case "OpenLayers.Geometry.Polygon":case "OpenLayers.Geometry.Curve":c="path"}return c},setStyle:function(a,
b,c){b=b||a._style;c=c||a._options;var d=b.title||b.graphicTitle;if(d){a.setAttributeNS(null,"title",d);var e=a.getElementsByTagName("title");0<e.length?e[0].firstChild.textContent=d:(e=this.nodeFactory(null,"title"),e.textContent=d,a.appendChild(e))}var e=parseFloat(a.getAttributeNS(null,"r")),d=1,f;if("OpenLayers.Geometry.Point"==a._geometryClass&&e){a.style.visibility="";if(!1===b.graphic)a.style.visibility="hidden";else if(b.externalGraphic){f=this.getPosition(a);b.graphicWidth&&b.graphicHeight&&
a.setAttributeNS(null,"preserveAspectRatio","none");var e=b.graphicWidth||b.graphicHeight,g=b.graphicHeight||b.graphicWidth,e=e?e:2*b.pointRadius,g=g?g:2*b.pointRadius,h=void 0!=b.graphicYOffset?b.graphicYOffset:-(.5*g),k=b.graphicOpacity||b.fillOpacity;a.setAttributeNS(null,"x",(f.x+(void 0!=b.graphicXOffset?b.graphicXOffset:-(.5*e))).toFixed());a.setAttributeNS(null,"y",(f.y+h).toFixed());a.setAttributeNS(null,"width",e);a.setAttributeNS(null,"height",g);a.setAttributeNS(this.xlinkns,"xlink:href",
b.externalGraphic);a.setAttributeNS(null,"style","opacity: "+k);a.onclick=OpenLayers.Event.preventDefault}else if(this.isComplexSymbol(b.graphicName)){var e=3*b.pointRadius,g=2*e,l=this.importSymbol(b.graphicName);f=this.getPosition(a);d=3*this.symbolMetrics[l.id][0]/g;h=a.parentNode;k=a.nextSibling;h&&h.removeChild(a);a.firstChild&&a.removeChild(a.firstChild);a.appendChild(l.firstChild.cloneNode(!0));a.setAttributeNS(null,"viewBox",l.getAttributeNS(null,"viewBox"));a.setAttributeNS(null,"width",
g);a.setAttributeNS(null,"height",g);a.setAttributeNS(null,"x",f.x-e);a.setAttributeNS(null,"y",f.y-e);k?h.insertBefore(a,k):h&&h.appendChild(a)}else a.setAttributeNS(null,"r",b.pointRadius);e=b.rotation;void 0===e&&void 0===a._rotation||!f||(a._rotation=e,e|=0,"svg"!==a.nodeName?a.setAttributeNS(null,"transform","rotate("+e+" "+f.x+" "+f.y+")"):(f=this.symbolMetrics[l.id],a.firstChild.setAttributeNS(null,"transform","rotate("+e+" "+f[1]+" "+f[2]+")")))}c.isFilled?(a.setAttributeNS(null,"fill",b.fillColor),
a.setAttributeNS(null,"fill-opacity",b.fillOpacity)):a.setAttributeNS(null,"fill","none");c.isStroked?(a.setAttributeNS(null,"stroke",b.strokeColor),a.setAttributeNS(null,"stroke-opacity",b.strokeOpacity),a.setAttributeNS(null,"stroke-width",b.strokeWidth*d),a.setAttributeNS(null,"stroke-linecap",b.strokeLinecap||"round"),a.setAttributeNS(null,"stroke-linejoin","round"),b.strokeDashstyle&&a.setAttributeNS(null,"stroke-dasharray",this.dashStyle(b,d))):a.setAttributeNS(null,"stroke","none");b.pointerEvents&&
a.setAttributeNS(null,"pointer-events",b.pointerEvents);null!=b.cursor&&a.setAttributeNS(null,"cursor",b.cursor);return a},dashStyle:function(a,b){var c=a.strokeWidth*b,d=a.strokeDashstyle;switch(d){case "solid":return"none";case "dot":return[1,4*c].join();case "dash":return[4*c,4*c].join();case "dashdot":return[4*c,4*c,1,4*c].join();case "longdash":return[8*c,4*c].join();case "longdashdot":return[8*c,4*c,1,4*c].join();default:return OpenLayers.String.trim(d).replace(/\s+/g,",")}},createNode:function(a,
b){var c=document.createElementNS(this.xmlns,a);b&&c.setAttributeNS(null,"id",b);c.setAttribute("class"," ");return c},nodeTypeCompare:function(a,b){return b==a.nodeName},createRenderRoot:function(){var a=this.nodeFactory(this.container.id+"_svgRoot","svg");a.style.display="block";return a},createRoot:function(a){return this.nodeFactory(this.container.id+a,"g")},createDefs:function(){var a=this.nodeFactory(this.container.id+"_defs","defs");this.rendererRoot.appendChild(a);return a},drawPoint:function(a,
b){return this.drawCircle(a,b,1)},drawCircle:function(a,b,c){var d=this.getResolution(),e=(b.x-this.featureDx)/d+this.left;b=this.top-b.y/d;return this.inValidRange(e,b)?(a.setAttributeNS(null,"cx",e),a.setAttributeNS(null,"cy",b),a.setAttributeNS(null,"r",c),a):!1},drawLineString:function(a,b){var c=this.getComponentsString(b.components);return c.path?(a.setAttributeNS(null,"points",c.path),c.complete?a:null):!1},drawLinearRing:function(a,b){var c=this.getComponentsString(b.components);return c.path?
(a.setAttributeNS(null,"points",c.path),c.complete?a:null):!1},drawPolygon:function(a,b){for(var c="",d=!0,e=!0,f,g,h=0,k=b.components.length;h<k;h++)c+=" M",f=this.getComponentsString(b.components[h].components," "),(g=f.path)?(c+=" "+g,e=f.complete&&e):d=!1;return d?(a.setAttributeNS(null,"d",c+" z"),a.setAttributeNS(null,"fill-rule","evenodd"),e?a:null):!1},drawRectangle:function(a,b){var c=this.getResolution(),d=(b.x-this.featureDx)/c+this.left,e=this.top-b.y/c;return this.inValidRange(d,e)?(a.setAttributeNS(null,
"x",d),a.setAttributeNS(null,"y",e),a.setAttributeNS(null,"width",b.width/c),a.setAttributeNS(null,"height",b.height/c),a):!1},drawText:function(a,b,c){var d=!!b.labelOutlineWidth;if(d){var e=OpenLayers.Util.extend({},b);e.fontColor=e.labelOutlineColor;e.fontStrokeColor=e.labelOutlineColor;e.fontStrokeWidth=b.labelOutlineWidth;b.labelOutlineOpacity&&(e.fontOpacity=b.labelOutlineOpacity);delete e.labelOutlineWidth;this.drawText(a,e,c)}var f=this.getResolution(),e=(c.x-this.featureDx)/f+this.left,g=
c.y/f-this.top,d=d?this.LABEL_OUTLINE_SUFFIX:this.LABEL_ID_SUFFIX,f=this.nodeFactory(a+d,"text");f.setAttributeNS(null,"x",e);f.setAttributeNS(null,"y",-g);b.fontColor&&f.setAttributeNS(null,"fill",b.fontColor);b.fontStrokeColor&&f.setAttributeNS(null,"stroke",b.fontStrokeColor);b.fontStrokeWidth&&f.setAttributeNS(null,"stroke-width",b.fontStrokeWidth);b.fontOpacity&&f.setAttributeNS(null,"opacity",b.fontOpacity);b.fontFamily&&f.setAttributeNS(null,"font-family",b.fontFamily);b.fontSize&&f.setAttributeNS(null,
"font-size",b.fontSize);b.fontWeight&&f.setAttributeNS(null,"font-weight",b.fontWeight);b.fontStyle&&f.setAttributeNS(null,"font-style",b.fontStyle);!0===b.labelSelect?(f.setAttributeNS(null,"pointer-events","visible"),f._featureId=a):f.setAttributeNS(null,"pointer-events","none");g=b.labelAlign||OpenLayers.Renderer.defaultSymbolizer.labelAlign;f.setAttributeNS(null,"text-anchor",OpenLayers.Renderer.SVG.LABEL_ALIGN[g[0]]||"middle");!0===OpenLayers.IS_GECKO&&f.setAttributeNS(null,"dominant-baseline",
OpenLayers.Renderer.SVG.LABEL_ALIGN[g[1]]||"central");for(var h=b.label.split("\n"),k=h.length;f.childNodes.length>k;)f.removeChild(f.lastChild);for(var l=0;l<k;l++){var m=this.nodeFactory(a+d+"_tspan_"+l,"tspan");!0===b.labelSelect&&(m._featureId=a,m._geometry=c,m._geometryClass=c.CLASS_NAME);!1===OpenLayers.IS_GECKO&&m.setAttributeNS(null,"baseline-shift",OpenLayers.Renderer.SVG.LABEL_VSHIFT[g[1]]||"-35%");m.setAttribute("x",e);if(0==l){var q=OpenLayers.Renderer.SVG.LABEL_VFACTOR[g[1]];null==q&&
(q=-.5);m.setAttribute("dy",q*(k-1)+"em")}else m.setAttribute("dy","1em");m.textContent=""===h[l]?" ":h[l];m.parentNode||f.appendChild(m)}f.parentNode||this.textRoot.appendChild(f)},getComponentsString:function(a,b){for(var c=[],d=!0,e=a.length,f=[],g,h=0;h<e;h++)g=a[h],c.push(g),(g=this.getShortString(g))?f.push(g):(0<h&&this.getShortString(a[h-1])&&f.push(this.clipLine(a[h],a[h-1])),h<e-1&&this.getShortString(a[h+1])&&f.push(this.clipLine(a[h],a[h+1])),d=!1);return{path:f.join(b||","),complete:d}},
clipLine:function(a,b){if(b.equals(a))return"";var c=this.getResolution(),d=this.MAX_PIXEL-this.translationParameters.x,e=this.MAX_PIXEL-this.translationParameters.y,f=(b.x-this.featureDx)/c+this.left,g=this.top-b.y/c,h=(a.x-this.featureDx)/c+this.left,c=this.top-a.y/c,k;if(h<-d||h>d)k=(c-g)/(h-f),h=0>h?-d:d,c=g+(h-f)*k;if(c<-e||c>e)k=(h-f)/(c-g),c=0>c?-e:e,h=f+(c-g)*k;return h+","+c},getShortString:function(a){var b=this.getResolution(),c=(a.x-this.featureDx)/b+this.left;a=this.top-a.y/b;return this.inValidRange(c,
a)?c+","+a:!1},getPosition:function(a){return{x:parseFloat(a.getAttributeNS(null,"cx")),y:parseFloat(a.getAttributeNS(null,"cy"))}},importSymbol:function(a){this.defs||(this.defs=this.createDefs());var b=this.container.id+"-"+a,c=document.getElementById(b);if(null!=c)return c;var d=OpenLayers.Renderer.symbol[a];if(!d)throw Error(a+" is not a valid symbol name");a=this.nodeFactory(b,"symbol");var e=this.nodeFactory(null,"polygon");a.appendChild(e);for(var c=new OpenLayers.Bounds(Number.MAX_VALUE,Number.MAX_VALUE,
0,0),f=[],g,h,k=0;k<d.length;k+=2)g=d[k],h=d[k+1],c.left=Math.min(c.left,g),c.bottom=Math.min(c.bottom,h),c.right=Math.max(c.right,g),c.top=Math.max(c.top,h),f.push(g,",",h);e.setAttributeNS(null,"points",f.join(" "));d=c.getWidth();e=c.getHeight();a.setAttributeNS(null,"viewBox",[c.left-d,c.bottom-e,3*d,3*e].join(" "));this.symbolMetrics[b]=[Math.max(d,e),c.getCenterLonLat().lon,c.getCenterLonLat().lat];this.defs.appendChild(a);return a},getFeatureIdFromEvent:function(a){var b=OpenLayers.Renderer.Elements.prototype.getFeatureIdFromEvent.apply(this,
arguments);b||(b=a.target,b=b.parentNode&&b!=this.rendererRoot?b.parentNode._featureId:void 0);return b},CLASS_NAME:"OpenLayers.Renderer.SVG"});OpenLayers.Renderer.SVG.LABEL_ALIGN={l:"start",r:"end",b:"bottom",t:"hanging"};OpenLayers.Renderer.SVG.LABEL_VSHIFT={t:"-70%",b:"0"};OpenLayers.Renderer.SVG.LABEL_VFACTOR={t:0,b:-1};OpenLayers.Renderer.SVG.preventDefault=function(a){OpenLayers.Event.preventDefault(a)};OpenLayers.Renderer.Canvas=OpenLayers.Class(OpenLayers.Renderer,{hitDetection:!0,hitOverflow:0,canvas:null,features:null,pendingRedraw:!1,cachedSymbolBounds:{},initialize:function(a,b){OpenLayers.Renderer.prototype.initialize.apply(this,arguments);this.root=document.createElement("canvas");this.container.appendChild(this.root);this.canvas=this.root.getContext("2d");this._clearRectId=OpenLayers.Util.createUniqueID();this.features={};this.hitDetection&&(this.hitCanvas=document.createElement("canvas"),
this.hitContext=this.hitCanvas.getContext("2d"))},setExtent:function(){OpenLayers.Renderer.prototype.setExtent.apply(this,arguments);return!1},eraseGeometry:function(a,b){this.eraseFeatures(this.features[b][0])},supported:function(){return OpenLayers.CANVAS_SUPPORTED},setSize:function(a){this.size=a.clone();var b=this.root;b.style.width=a.w+"px";b.style.height=a.h+"px";b.width=a.w;b.height=a.h;this.resolution=null;this.hitDetection&&(b=this.hitCanvas,b.style.width=a.w+"px",b.style.height=a.h+"px",
b.width=a.w,b.height=a.h)},drawFeature:function(a,b){var c;if(a.geometry){b=this.applyDefaultSymbolizer(b||a.style);c=a.geometry.getBounds();var d;this.map.baseLayer&&this.map.baseLayer.wrapDateLine&&(d=this.map.getMaxExtent());d=c&&c.intersectsBounds(this.extent,{worldBounds:d});(c="none"!==b.display&&!!c&&d)?this.features[a.id]=[a,b]:delete this.features[a.id];this.pendingRedraw=!0}this.pendingRedraw&&!this.locked&&(this.redraw(),this.pendingRedraw=!1);return c},drawGeometry:function(a,b,c){var d=
a.CLASS_NAME;if("OpenLayers.Geometry.Collection"==d||"OpenLayers.Geometry.MultiPoint"==d||"OpenLayers.Geometry.MultiLineString"==d||"OpenLayers.Geometry.MultiPolygon"==d)for(var d=this.map.baseLayer&&this.map.baseLayer.wrapDateLine&&this.map.getMaxExtent(),e=0;e<a.components.length;e++)this.calculateFeatureDx(a.components[e].getBounds(),d),this.drawGeometry(a.components[e],b,c);else switch(a.CLASS_NAME){case "OpenLayers.Geometry.Point":this.drawPoint(a,b,c);break;case "OpenLayers.Geometry.LineString":this.drawLineString(a,
b,c);break;case "OpenLayers.Geometry.LinearRing":this.drawLinearRing(a,b,c);break;case "OpenLayers.Geometry.Polygon":this.drawPolygon(a,b,c)}},drawExternalGraphic:function(a,b,c){var d=new Image,e=b.title||b.graphicTitle;e&&(d.title=e);var f=b.graphicWidth||b.graphicHeight,g=b.graphicHeight||b.graphicWidth,f=f?f:2*b.pointRadius,g=g?g:2*b.pointRadius,h=void 0!=b.graphicXOffset?b.graphicXOffset:-(.5*f),k=void 0!=b.graphicYOffset?b.graphicYOffset:-(.5*g),l=this._clearRectId,m=b.graphicOpacity||b.fillOpacity;
d.onload=OpenLayers.Function.bind(function(){if(this.features[c]&&l===this._clearRectId){var b=this.getLocalXY(a),e=b[0],b=b[1];if(!isNaN(e)&&!isNaN(b)){var e=e+h|0,b=b+k|0,p=this.canvas;p.globalAlpha=m;var r=OpenLayers.Renderer.Canvas.drawImageScaleFactor||(OpenLayers.Renderer.Canvas.drawImageScaleFactor=/android 2.1/.test(navigator.userAgent.toLowerCase())?320/window.screen.width:1);p.drawImage(d,e*r,b*r,f*r,g*r);this.hitDetection&&(this.setHitContextStyle("fill",c),this.hitContext.fillRect(e,b,
f,g))}}},this);d.src=b.externalGraphic;d.complete&&(d.onload(),d.onload=null)},drawNamedSymbol:function(a,b,c){var d,e,f,g;f=Math.PI/180;var h=OpenLayers.Renderer.symbol[b.graphicName];if(!h)throw Error(b.graphicName+" is not a valid symbol name");if(!(!h.length||2>h.length||(a=this.getLocalXY(a),e=a[0],g=a[1],isNaN(e)||isNaN(g)))){this.canvas.lineCap="round";this.canvas.lineJoin="round";this.hitDetection&&(this.hitContext.lineCap="round",this.hitContext.lineJoin="round");if(b.graphicName in this.cachedSymbolBounds)d=
this.cachedSymbolBounds[b.graphicName];else{d=new OpenLayers.Bounds;for(a=0;a<h.length;a+=2)d.extend(new OpenLayers.LonLat(h[a],h[a+1]));this.cachedSymbolBounds[b.graphicName]=d}this.canvas.save();this.hitDetection&&this.hitContext.save();this.canvas.translate(e,g);this.hitDetection&&this.hitContext.translate(e,g);a=f*b.rotation;isNaN(a)||(this.canvas.rotate(a),this.hitDetection&&this.hitContext.rotate(a));f=2*b.pointRadius/Math.max(d.getWidth(),d.getHeight());this.canvas.scale(f,f);this.hitDetection&&
this.hitContext.scale(f,f);a=d.getCenterLonLat().lon;d=d.getCenterLonLat().lat;this.canvas.translate(-a,-d);this.hitDetection&&this.hitContext.translate(-a,-d);g=b.strokeWidth;b.strokeWidth=g/f;if(!1!==b.fill){this.setCanvasStyle("fill",b);this.canvas.beginPath();for(a=0;a<h.length;a+=2)d=h[a],e=h[a+1],0==a&&this.canvas.moveTo(d,e),this.canvas.lineTo(d,e);this.canvas.closePath();this.canvas.fill();if(this.hitDetection){this.setHitContextStyle("fill",c,b);this.hitContext.beginPath();for(a=0;a<h.length;a+=
2)d=h[a],e=h[a+1],0==a&&this.canvas.moveTo(d,e),this.hitContext.lineTo(d,e);this.hitContext.closePath();this.hitContext.fill()}}if(!1!==b.stroke){this.setCanvasStyle("stroke",b);this.canvas.beginPath();for(a=0;a<h.length;a+=2)d=h[a],e=h[a+1],0==a&&this.canvas.moveTo(d,e),this.canvas.lineTo(d,e);this.canvas.closePath();this.canvas.stroke();if(this.hitDetection){this.setHitContextStyle("stroke",c,b,f);this.hitContext.beginPath();for(a=0;a<h.length;a+=2)d=h[a],e=h[a+1],0==a&&this.hitContext.moveTo(d,
e),this.hitContext.lineTo(d,e);this.hitContext.closePath();this.hitContext.stroke()}}b.strokeWidth=g;this.canvas.restore();this.hitDetection&&this.hitContext.restore();this.setCanvasStyle("reset")}},setCanvasStyle:function(a,b){"fill"===a?(this.canvas.globalAlpha=b.fillOpacity,this.canvas.fillStyle=b.fillColor):"stroke"===a?(this.canvas.globalAlpha=b.strokeOpacity,this.canvas.strokeStyle=b.strokeColor,this.canvas.lineWidth=b.strokeWidth):(this.canvas.globalAlpha=0,this.canvas.lineWidth=1)},featureIdToHex:function(a){a=
Number(a.split("_").pop())+1;16777216<=a&&(this.hitOverflow=a-16777215,a=a%16777216+1);a="000000"+a.toString(16);var b=a.length;return a="#"+a.substring(b-6,b)},setHitContextStyle:function(a,b,c,d){b=this.featureIdToHex(b);"fill"==a?(this.hitContext.globalAlpha=1,this.hitContext.fillStyle=b):"stroke"==a?(this.hitContext.globalAlpha=1,this.hitContext.strokeStyle=b,"undefined"===typeof d?this.hitContext.lineWidth=c.strokeWidth+2:isNaN(d)||(this.hitContext.lineWidth=c.strokeWidth+2/d)):(this.hitContext.globalAlpha=
0,this.hitContext.lineWidth=1)},drawPoint:function(a,b,c){if(!1!==b.graphic)if(b.externalGraphic)this.drawExternalGraphic(a,b,c);else if(b.graphicName&&"circle"!=b.graphicName)this.drawNamedSymbol(a,b,c);else{var d=this.getLocalXY(a);a=d[0];d=d[1];if(!isNaN(a)&&!isNaN(d)){var e=2*Math.PI,f=b.pointRadius;!1!==b.fill&&(this.setCanvasStyle("fill",b),this.canvas.beginPath(),this.canvas.arc(a,d,f,0,e,!0),this.canvas.fill(),this.hitDetection&&(this.setHitContextStyle("fill",c,b),this.hitContext.beginPath(),
this.hitContext.arc(a,d,f,0,e,!0),this.hitContext.fill()));!1!==b.stroke&&(this.setCanvasStyle("stroke",b),this.canvas.beginPath(),this.canvas.arc(a,d,f,0,e,!0),this.canvas.stroke(),this.hitDetection&&(this.setHitContextStyle("stroke",c,b),this.hitContext.beginPath(),this.hitContext.arc(a,d,f,0,e,!0),this.hitContext.stroke()),this.setCanvasStyle("reset"))}}},drawLineString:function(a,b,c){b=OpenLayers.Util.applyDefaults({fill:!1},b);this.drawLinearRing(a,b,c)},drawLinearRing:function(a,b,c){!1!==
b.fill&&(this.setCanvasStyle("fill",b),this.renderPath(this.canvas,a,b,c,"fill"),this.hitDetection&&(this.setHitContextStyle("fill",c,b),this.renderPath(this.hitContext,a,b,c,"fill")));!1!==b.stroke&&(this.setCanvasStyle("stroke",b),this.renderPath(this.canvas,a,b,c,"stroke"),this.hitDetection&&(this.setHitContextStyle("stroke",c,b),this.renderPath(this.hitContext,a,b,c,"stroke")));this.setCanvasStyle("reset")},renderPath:function(a,b,c,d,e){b=b.components;c=b.length;a.beginPath();d=this.getLocalXY(b[0]);
var f=d[1];if(!isNaN(d[0])&&!isNaN(f)){a.moveTo(d[0],d[1]);for(d=1;d<c;++d)f=this.getLocalXY(b[d]),a.lineTo(f[0],f[1]);"fill"===e?a.fill():a.stroke()}},drawPolygon:function(a,b,c){a=a.components;var d=a.length;this.drawLinearRing(a[0],b,c);for(var e=1;e<d;++e)this.canvas.globalCompositeOperation="destination-out",this.hitDetection&&(this.hitContext.globalCompositeOperation="destination-out"),this.drawLinearRing(a[e],OpenLayers.Util.applyDefaults({stroke:!1,fillOpacity:1},b),c),this.canvas.globalCompositeOperation=
"source-over",this.hitDetection&&(this.hitContext.globalCompositeOperation="source-over"),this.drawLinearRing(a[e],OpenLayers.Util.applyDefaults({fill:!1},b),c)},drawText:function(a,b){var c=this.getLocalXY(a);this.setCanvasStyle("reset");this.canvas.fillStyle=b.fontColor;this.canvas.globalAlpha=b.fontOpacity||1;var d=[b.fontStyle?b.fontStyle:"normal","normal",b.fontWeight?b.fontWeight:"normal",b.fontSize?b.fontSize:"1em",b.fontFamily?b.fontFamily:"sans-serif"].join(" "),e=b.label.split("\n"),f=e.length;
if(this.canvas.fillText){this.canvas.font=d;this.canvas.textAlign=OpenLayers.Renderer.Canvas.LABEL_ALIGN[b.labelAlign[0]]||"center";this.canvas.textBaseline=OpenLayers.Renderer.Canvas.LABEL_ALIGN[b.labelAlign[1]]||"middle";var g=OpenLayers.Renderer.Canvas.LABEL_FACTOR[b.labelAlign[1]];null==g&&(g=-.5);d=this.canvas.measureText("Mg").height||this.canvas.measureText("xx").width;c[1]+=d*g*(f-1);for(g=0;g<f;g++)b.labelOutlineWidth&&(this.canvas.save(),this.canvas.globalAlpha=b.labelOutlineOpacity||b.fontOpacity||
1,this.canvas.strokeStyle=b.labelOutlineColor,this.canvas.lineWidth=b.labelOutlineWidth,this.canvas.strokeText(e[g],c[0],c[1]+d*g+1),this.canvas.restore()),this.canvas.fillText(e[g],c[0],c[1]+d*g)}else if(this.canvas.mozDrawText){this.canvas.mozTextStyle=d;var h=OpenLayers.Renderer.Canvas.LABEL_FACTOR[b.labelAlign[0]];null==h&&(h=-.5);g=OpenLayers.Renderer.Canvas.LABEL_FACTOR[b.labelAlign[1]];null==g&&(g=-.5);d=this.canvas.mozMeasureText("xx");c[1]+=d*(1+g*f);for(g=0;g<f;g++){var k=c[0]+h*this.canvas.mozMeasureText(e[g]),
l=c[1]+g*d;this.canvas.translate(k,l);this.canvas.mozDrawText(e[g]);this.canvas.translate(-k,-l)}}this.setCanvasStyle("reset")},getLocalXY:function(a){var b=this.getResolution(),c=this.extent;return[(a.x-this.featureDx)/b+-c.left/b,c.top/b-a.y/b]},clear:function(){this.clearCanvas();this.features={}},clearCanvas:function(){var a=this.root.height,b=this.root.width;this.canvas.clearRect(0,0,b,a);this._clearRectId=OpenLayers.Util.createUniqueID();this.hitDetection&&this.hitContext.clearRect(0,0,b,a)},
getFeatureIdFromEvent:function(a){var b;if(this.hitDetection&&"none"!==this.root.style.display&&!this.map.dragging&&(a=a.xy,a=this.hitContext.getImageData(a.x|0,a.y|0,1,1).data,255===a[3]&&(a=a[2]+256*(a[1]+256*a[0])))){a="OpenLayers_Feature_Vector_"+(a-1+this.hitOverflow);try{b=this.features[a][0]}catch(c){}}return b},eraseFeatures:function(a){OpenLayers.Util.isArray(a)||(a=[a]);for(var b=0;b<a.length;++b)delete this.features[a[b].id];this.redraw()},redraw:function(){if(!this.locked){this.clearCanvas();
var a=[],b,c,d,e=this.map.baseLayer&&this.map.baseLayer.wrapDateLine&&this.map.getMaxExtent(),f;for(f in this.features)this.features.hasOwnProperty(f)&&(b=this.features[f][0],c=b.geometry,this.calculateFeatureDx(c.getBounds(),e),d=this.features[f][1],this.drawGeometry(c,d,b.id),d.label&&a.push([b,d]));c=0;for(d=a.length;c<d;++c)b=a[c],this.drawText(b[0].geometry.getCentroid(),b[1])}},CLASS_NAME:"OpenLayers.Renderer.Canvas"});OpenLayers.Renderer.Canvas.LABEL_ALIGN={l:"left",r:"right",t:"top",b:"bottom"};
OpenLayers.Renderer.Canvas.LABEL_FACTOR={l:0,r:-1,t:0,b:-1};OpenLayers.Renderer.Canvas.drawImageScaleFactor=null;OpenLayers.Popup=OpenLayers.Class({events:null,id:"",lonlat:null,div:null,contentSize:null,size:null,contentHTML:null,backgroundColor:"",opacity:"",border:"",contentDiv:null,groupDiv:null,closeDiv:null,autoSize:!1,minSize:null,maxSize:null,displayClass:"olPopup",contentDisplayClass:"olPopupContent",padding:0,disableFirefoxOverflowHack:!1,fixPadding:function(){"number"==typeof this.padding&&(this.padding=new OpenLayers.Bounds(this.padding,this.padding,this.padding,this.padding))},panMapIfOutOfView:!1,
keepInMap:!1,closeOnMove:!1,map:null,initialize:function(a,b,c,d,e,f){null==a&&(a=OpenLayers.Util.createUniqueID(this.CLASS_NAME+"_"));this.id=a;this.lonlat=b;this.contentSize=null!=c?c:new OpenLayers.Size(OpenLayers.Popup.WIDTH,OpenLayers.Popup.HEIGHT);null!=d&&(this.contentHTML=d);this.backgroundColor=OpenLayers.Popup.COLOR;this.opacity=OpenLayers.Popup.OPACITY;this.border=OpenLayers.Popup.BORDER;this.div=OpenLayers.Util.createDiv(this.id,null,null,null,null,null,"hidden");this.div.className=this.displayClass;
this.groupDiv=OpenLayers.Util.createDiv(this.id+"_GroupDiv",null,null,null,"relative",null,"hidden");a=this.div.id+"_contentDiv";this.contentDiv=OpenLayers.Util.createDiv(a,null,this.contentSize.clone(),null,"relative");this.contentDiv.className=this.contentDisplayClass;this.groupDiv.appendChild(this.contentDiv);this.div.appendChild(this.groupDiv);e&&this.addCloseBox(f);this.registerEvents()},destroy:function(){this.border=this.opacity=this.backgroundColor=this.contentHTML=this.size=this.lonlat=this.id=
null;this.closeOnMove&&this.map&&this.map.events.unregister("movestart",this,this.hide);this.events.destroy();this.events=null;this.closeDiv&&(OpenLayers.Event.stopObservingElement(this.closeDiv),this.groupDiv.removeChild(this.closeDiv));this.closeDiv=null;this.div.removeChild(this.groupDiv);this.groupDiv=null;null!=this.map&&this.map.removePopup(this);this.panMapIfOutOfView=this.padding=this.maxSize=this.minSize=this.autoSize=this.div=this.map=null},draw:function(a){null==a&&null!=this.lonlat&&null!=
this.map&&(a=this.map.getLayerPxFromLonLat(this.lonlat));this.closeOnMove&&this.map.events.register("movestart",this,this.hide);this.disableFirefoxOverflowHack||"firefox"!=OpenLayers.BROWSER_NAME||(this.map.events.register("movestart",this,function(){var a=document.defaultView.getComputedStyle(this.contentDiv,null).getPropertyValue("overflow");"hidden"!=a&&(this.contentDiv._oldOverflow=a,this.contentDiv.style.overflow="hidden")}),this.map.events.register("moveend",this,function(){var a=this.contentDiv._oldOverflow;
a&&(this.contentDiv.style.overflow=a,this.contentDiv._oldOverflow=null)}));this.moveTo(a);this.autoSize||this.size||this.setSize(this.contentSize);this.setBackgroundColor();this.setOpacity();this.setBorder();this.setContentHTML();this.panMapIfOutOfView&&this.panIntoView();return this.div},updatePosition:function(){if(this.lonlat&&this.map){var a=this.map.getLayerPxFromLonLat(this.lonlat);a&&this.moveTo(a)}},moveTo:function(a){null!=a&&null!=this.div&&(this.div.style.left=a.x+"px",this.div.style.top=
a.y+"px")},visible:function(){return OpenLayers.Element.visible(this.div)},toggle:function(){this.visible()?this.hide():this.show()},show:function(){this.div.style.display="";this.panMapIfOutOfView&&this.panIntoView()},hide:function(){this.div.style.display="none"},setSize:function(a){this.size=a.clone();var b=this.getContentDivPadding(),c=b.left+b.right,d=b.top+b.bottom;this.fixPadding();c+=this.padding.left+this.padding.right;d+=this.padding.top+this.padding.bottom;if(this.closeDiv)var e=parseInt(this.closeDiv.style.width),
c=c+(e+b.right);this.size.w+=c;this.size.h+=d;"msie"==OpenLayers.BROWSER_NAME&&(this.contentSize.w+=b.left+b.right,this.contentSize.h+=b.bottom+b.top);null!=this.div&&(this.div.style.width=this.size.w+"px",this.div.style.height=this.size.h+"px");null!=this.contentDiv&&(this.contentDiv.style.width=a.w+"px",this.contentDiv.style.height=a.h+"px")},updateSize:function(){var a="<div class='"+this.contentDisplayClass+"'>"+this.contentDiv.innerHTML+"</div>",b=this.map?this.map.div:document.body,c=OpenLayers.Util.getRenderedDimensions(a,
null,{displayClass:this.displayClass,containerElement:b}),d=this.getSafeContentSize(c);d.equals(c)?d=c:(c={w:d.w<c.w?d.w:null,h:d.h<c.h?d.h:null},c.w&&c.h||(a=OpenLayers.Util.getRenderedDimensions(a,c,{displayClass:this.contentDisplayClass,containerElement:b}),"hidden"!=OpenLayers.Element.getStyle(this.contentDiv,"overflow")&&a.equals(d)&&(d=OpenLayers.Util.getScrollbarWidth(),c.w?a.h+=d:a.w+=d),d=this.getSafeContentSize(a)));this.setSize(d)},setBackgroundColor:function(a){void 0!=a&&(this.backgroundColor=
a);null!=this.div&&(this.div.style.backgroundColor=this.backgroundColor)},setOpacity:function(a){void 0!=a&&(this.opacity=a);null!=this.div&&(this.div.style.opacity=this.opacity,this.div.style.filter="alpha(opacity="+100*this.opacity+")")},setBorder:function(a){void 0!=a&&(this.border=a);null!=this.div&&(this.div.style.border=this.border)},setContentHTML:function(a){null!=a&&(this.contentHTML=a);null!=this.contentDiv&&null!=this.contentHTML&&this.contentHTML!=this.contentDiv.innerHTML&&(this.contentDiv.innerHTML=
this.contentHTML,this.autoSize&&(this.registerImageListeners(),this.updateSize()))},registerImageListeners:function(){for(var a=function(){null!==this.popup.id&&(this.popup.updateSize(),this.popup.visible()&&this.popup.panMapIfOutOfView&&this.popup.panIntoView(),OpenLayers.Event.stopObserving(this.img,"load",this.img._onImgLoad))},b=this.contentDiv.getElementsByTagName("img"),c=0,d=b.length;c<d;c++){var e=b[c];if(0==e.width||0==e.height)e._onImgLoad=OpenLayers.Function.bind(a,{popup:this,img:e}),
OpenLayers.Event.observe(e,"load",e._onImgLoad)}},getSafeContentSize:function(a){a=a.clone();var b=this.getContentDivPadding(),c=b.left+b.right,d=b.top+b.bottom;this.fixPadding();c+=this.padding.left+this.padding.right;d+=this.padding.top+this.padding.bottom;if(this.closeDiv)var e=parseInt(this.closeDiv.style.width),c=c+(e+b.right);this.minSize&&(a.w=Math.max(a.w,this.minSize.w-c),a.h=Math.max(a.h,this.minSize.h-d));this.maxSize&&(a.w=Math.min(a.w,this.maxSize.w-c),a.h=Math.min(a.h,this.maxSize.h-
d));if(this.map&&this.map.size){e=b=0;if(this.keepInMap&&!this.panMapIfOutOfView)switch(e=this.map.getPixelFromLonLat(this.lonlat),this.relativePosition){case "tr":b=e.x;e=this.map.size.h-e.y;break;case "tl":b=this.map.size.w-e.x;e=this.map.size.h-e.y;break;case "bl":b=this.map.size.w-e.x;e=e.y;break;case "br":b=e.x;e=e.y;break;default:b=e.x,e=this.map.size.h-e.y}d=this.map.size.h-this.map.paddingForPopups.top-this.map.paddingForPopups.bottom-d-e;a.w=Math.min(a.w,this.map.size.w-this.map.paddingForPopups.left-
this.map.paddingForPopups.right-c-b);a.h=Math.min(a.h,d)}return a},getContentDivPadding:function(){var a=this._contentDivPadding;a||(null==this.div.parentNode&&(this.div.style.display="none",document.body.appendChild(this.div)),this._contentDivPadding=a=new OpenLayers.Bounds(OpenLayers.Element.getStyle(this.contentDiv,"padding-left"),OpenLayers.Element.getStyle(this.contentDiv,"padding-bottom"),OpenLayers.Element.getStyle(this.contentDiv,"padding-right"),OpenLayers.Element.getStyle(this.contentDiv,
"padding-top")),this.div.parentNode==document.body&&(document.body.removeChild(this.div),this.div.style.display=""));return a},addCloseBox:function(a){this.closeDiv=OpenLayers.Util.createDiv(this.id+"_close",null,{w:17,h:17});this.closeDiv.className="olPopupCloseBox";var b=this.getContentDivPadding();this.closeDiv.style.right=b.right+"px";this.closeDiv.style.top=b.top+"px";this.groupDiv.appendChild(this.closeDiv);a=a||function(a){this.hide();OpenLayers.Event.stop(a)};OpenLayers.Event.observe(this.closeDiv,
"touchend",OpenLayers.Function.bindAsEventListener(a,this));OpenLayers.Event.observe(this.closeDiv,"click",OpenLayers.Function.bindAsEventListener(a,this))},panIntoView:function(){var a=this.map.getSize(),b=this.map.getViewPortPxFromLayerPx(new OpenLayers.Pixel(parseInt(this.div.style.left),parseInt(this.div.style.top))),c=b.clone();b.x<this.map.paddingForPopups.left?c.x=this.map.paddingForPopups.left:b.x+this.size.w>a.w-this.map.paddingForPopups.right&&(c.x=a.w-this.map.paddingForPopups.right-this.size.w);
b.y<this.map.paddingForPopups.top?c.y=this.map.paddingForPopups.top:b.y+this.size.h>a.h-this.map.paddingForPopups.bottom&&(c.y=a.h-this.map.paddingForPopups.bottom-this.size.h);this.map.pan(b.x-c.x,b.y-c.y)},registerEvents:function(){this.events=new OpenLayers.Events(this,this.div,null,!0);this.events.on({mousedown:this.onmousedown,mousemove:this.onmousemove,mouseup:this.onmouseup,click:this.onclick,mouseout:this.onmouseout,dblclick:this.ondblclick,touchstart:function(a){OpenLayers.Event.stop(a,!0)},
scope:this})},onmousedown:function(a){this.mousedown=!0;OpenLayers.Event.stop(a,!0)},onmousemove:function(a){this.mousedown&&OpenLayers.Event.stop(a,!0)},onmouseup:function(a){this.mousedown&&(this.mousedown=!1,OpenLayers.Event.stop(a,!0))},onclick:function(a){OpenLayers.Event.stop(a,!0)},onmouseout:function(a){this.mousedown=!1},ondblclick:function(a){OpenLayers.Event.stop(a,!0)},CLASS_NAME:"OpenLayers.Popup"});OpenLayers.Popup.WIDTH=200;OpenLayers.Popup.HEIGHT=200;OpenLayers.Popup.COLOR="white";
OpenLayers.Popup.OPACITY=1;OpenLayers.Popup.BORDER="0px";OpenLayers.Popup.Anchored=OpenLayers.Class(OpenLayers.Popup,{relativePosition:null,keepInMap:!0,anchor:null,initialize:function(a,b,c,d,e,f,g){OpenLayers.Popup.prototype.initialize.apply(this,[a,b,c,d,f,g]);this.anchor=null!=e?e:{size:new OpenLayers.Size(0,0),offset:new OpenLayers.Pixel(0,0)}},destroy:function(){this.relativePosition=this.anchor=null;OpenLayers.Popup.prototype.destroy.apply(this,arguments)},show:function(){this.updatePosition();OpenLayers.Popup.prototype.show.apply(this,arguments)},
moveTo:function(a){var b=this.relativePosition;this.relativePosition=this.calculateRelativePosition(a);OpenLayers.Popup.prototype.moveTo.call(this,this.calculateNewPx(a));this.relativePosition!=b&&this.updateRelativePosition()},setSize:function(a){OpenLayers.Popup.prototype.setSize.apply(this,arguments);if(this.lonlat&&this.map){var b=this.map.getLayerPxFromLonLat(this.lonlat);this.moveTo(b)}},calculateRelativePosition:function(a){a=this.map.getLonLatFromLayerPx(a);a=this.map.getExtent().determineQuadrant(a);
return OpenLayers.Bounds.oppositeQuadrant(a)},updateRelativePosition:function(){},calculateNewPx:function(a){a=a.offset(this.anchor.offset);var b=this.size||this.contentSize,c="t"==this.relativePosition.charAt(0);a.y+=c?-b.h:this.anchor.size.h;c="l"==this.relativePosition.charAt(1);a.x+=c?-b.w:this.anchor.size.w;return a},CLASS_NAME:"OpenLayers.Popup.Anchored"});OpenLayers.Popup.Framed=OpenLayers.Class(OpenLayers.Popup.Anchored,{imageSrc:null,imageSize:null,isAlphaImage:!1,positionBlocks:null,blocks:null,fixedRelativePosition:!1,initialize:function(a,b,c,d,e,f,g){OpenLayers.Popup.Anchored.prototype.initialize.apply(this,arguments);this.fixedRelativePosition&&(this.updateRelativePosition(),this.calculateRelativePosition=function(a){return this.relativePosition});this.contentDiv.style.position="absolute";this.contentDiv.style.zIndex=1;f&&(this.closeDiv.style.zIndex=
1);this.groupDiv.style.position="absolute";this.groupDiv.style.top="0px";this.groupDiv.style.left="0px";this.groupDiv.style.height="100%";this.groupDiv.style.width="100%"},destroy:function(){this.isAlphaImage=this.imageSize=this.imageSrc=null;this.fixedRelativePosition=!1;this.positionBlocks=null;for(var a=0;a<this.blocks.length;a++){var b=this.blocks[a];b.image&&b.div.removeChild(b.image);b.image=null;b.div&&this.groupDiv.removeChild(b.div);b.div=null}this.blocks=null;OpenLayers.Popup.Anchored.prototype.destroy.apply(this,
arguments)},setBackgroundColor:function(a){},setBorder:function(){},setOpacity:function(a){},setSize:function(a){OpenLayers.Popup.Anchored.prototype.setSize.apply(this,arguments);this.updateBlocks()},updateRelativePosition:function(){this.padding=this.positionBlocks[this.relativePosition].padding;if(this.closeDiv){var a=this.getContentDivPadding();this.closeDiv.style.right=a.right+this.padding.right+"px";this.closeDiv.style.top=a.top+this.padding.top+"px"}this.updateBlocks()},calculateNewPx:function(a){var b=
OpenLayers.Popup.Anchored.prototype.calculateNewPx.apply(this,arguments);return b=b.offset(this.positionBlocks[this.relativePosition].offset)},createBlocks:function(){this.blocks=[];var a=null,b;for(b in this.positionBlocks){a=b;break}a=this.positionBlocks[a];for(b=0;b<a.blocks.length;b++){var c={};this.blocks.push(c);c.div=OpenLayers.Util.createDiv(this.id+"_FrameDecorationDiv_"+b,null,null,null,"absolute",null,"hidden",null);c.image=(this.isAlphaImage?OpenLayers.Util.createAlphaImageDiv:OpenLayers.Util.createImage)(this.id+
"_FrameDecorationImg_"+b,null,this.imageSize,this.imageSrc,"absolute",null,null,null);c.div.appendChild(c.image);this.groupDiv.appendChild(c.div)}},updateBlocks:function(){this.blocks||this.createBlocks();if(this.size&&this.relativePosition){for(var a=this.positionBlocks[this.relativePosition],b=0;b<a.blocks.length;b++){var c=a.blocks[b],d=this.blocks[b],e=c.anchor.left,f=c.anchor.bottom,g=c.anchor.right,h=c.anchor.top,k=isNaN(c.size.w)?this.size.w-(g+e):c.size.w,l=isNaN(c.size.h)?this.size.h-(f+
h):c.size.h;d.div.style.width=(0>k?0:k)+"px";d.div.style.height=(0>l?0:l)+"px";d.div.style.left=null!=e?e+"px":"";d.div.style.bottom=null!=f?f+"px":"";d.div.style.right=null!=g?g+"px":"";d.div.style.top=null!=h?h+"px":"";d.image.style.left=c.position.x+"px";d.image.style.top=c.position.y+"px"}this.contentDiv.style.left=this.padding.left+"px";this.contentDiv.style.top=this.padding.top+"px"}},CLASS_NAME:"OpenLayers.Popup.Framed"});OpenLayers.Popup.FramedCloud=OpenLayers.Class(OpenLayers.Popup.Framed,{contentDisplayClass:"olFramedCloudPopupContent",autoSize:!0,panMapIfOutOfView:!0,imageSize:new OpenLayers.Size(1276,736),isAlphaImage:!1,fixedRelativePosition:!1,positionBlocks:{tl:{offset:new OpenLayers.Pixel(44,0),padding:new OpenLayers.Bounds(8,40,8,9),blocks:[{size:new OpenLayers.Size("auto","auto"),anchor:new OpenLayers.Bounds(0,51,22,0),position:new OpenLayers.Pixel(0,0)},{size:new OpenLayers.Size(22,"auto"),anchor:new OpenLayers.Bounds(null,
50,0,0),position:new OpenLayers.Pixel(-1238,0)},{size:new OpenLayers.Size("auto",19),anchor:new OpenLayers.Bounds(0,32,22,null),position:new OpenLayers.Pixel(0,-631)},{size:new OpenLayers.Size(22,18),anchor:new OpenLayers.Bounds(null,32,0,null),position:new OpenLayers.Pixel(-1238,-632)},{size:new OpenLayers.Size(81,35),anchor:new OpenLayers.Bounds(null,0,0,null),position:new OpenLayers.Pixel(0,-688)}]},tr:{offset:new OpenLayers.Pixel(-45,0),padding:new OpenLayers.Bounds(8,40,8,9),blocks:[{size:new OpenLayers.Size("auto",
"auto"),anchor:new OpenLayers.Bounds(0,51,22,0),position:new OpenLayers.Pixel(0,0)},{size:new OpenLayers.Size(22,"auto"),anchor:new OpenLayers.Bounds(null,50,0,0),position:new OpenLayers.Pixel(-1238,0)},{size:new OpenLayers.Size("auto",19),anchor:new OpenLayers.Bounds(0,32,22,null),position:new OpenLayers.Pixel(0,-631)},{size:new OpenLayers.Size(22,19),anchor:new OpenLayers.Bounds(null,32,0,null),position:new OpenLayers.Pixel(-1238,-631)},{size:new OpenLayers.Size(81,35),anchor:new OpenLayers.Bounds(0,
0,null,null),position:new OpenLayers.Pixel(-215,-687)}]},bl:{offset:new OpenLayers.Pixel(45,0),padding:new OpenLayers.Bounds(8,9,8,40),blocks:[{size:new OpenLayers.Size("auto","auto"),anchor:new OpenLayers.Bounds(0,21,22,32),position:new OpenLayers.Pixel(0,0)},{size:new OpenLayers.Size(22,"auto"),anchor:new OpenLayers.Bounds(null,21,0,32),position:new OpenLayers.Pixel(-1238,0)},{size:new OpenLayers.Size("auto",21),anchor:new OpenLayers.Bounds(0,0,22,null),position:new OpenLayers.Pixel(0,-629)},{size:new OpenLayers.Size(22,
21),anchor:new OpenLayers.Bounds(null,0,0,null),position:new OpenLayers.Pixel(-1238,-629)},{size:new OpenLayers.Size(81,33),anchor:new OpenLayers.Bounds(null,null,0,0),position:new OpenLayers.Pixel(-101,-674)}]},br:{offset:new OpenLayers.Pixel(-44,0),padding:new OpenLayers.Bounds(8,9,8,40),blocks:[{size:new OpenLayers.Size("auto","auto"),anchor:new OpenLayers.Bounds(0,21,22,32),position:new OpenLayers.Pixel(0,0)},{size:new OpenLayers.Size(22,"auto"),anchor:new OpenLayers.Bounds(null,21,0,32),position:new OpenLayers.Pixel(-1238,
0)},{size:new OpenLayers.Size("auto",21),anchor:new OpenLayers.Bounds(0,0,22,null),position:new OpenLayers.Pixel(0,-629)},{size:new OpenLayers.Size(22,21),anchor:new OpenLayers.Bounds(null,0,0,null),position:new OpenLayers.Pixel(-1238,-629)},{size:new OpenLayers.Size(81,33),anchor:new OpenLayers.Bounds(0,null,null,0),position:new OpenLayers.Pixel(-311,-674)}]}},minSize:new OpenLayers.Size(105,10),maxSize:new OpenLayers.Size(1200,660),initialize:function(a,b,c,d,e,f,g){this.imageSrc=OpenLayers.Util.getImageLocation("cloud-popup-relative.png");
OpenLayers.Popup.Framed.prototype.initialize.apply(this,arguments);this.contentDiv.className=this.contentDisplayClass},CLASS_NAME:"OpenLayers.Popup.FramedCloud"});OpenLayers.Control=OpenLayers.Class({id:null,map:null,div:null,type:null,allowSelection:!1,displayClass:"",title:"",autoActivate:!1,active:null,handlerOptions:null,handler:null,eventListeners:null,events:null,initialize:function(a){this.displayClass=this.CLASS_NAME.replace("OpenLayers.","ol").replace(/\./g,"");OpenLayers.Util.extend(this,a);this.events=new OpenLayers.Events(this);if(this.eventListeners instanceof Object)this.events.on(this.eventListeners);null==this.id&&(this.id=OpenLayers.Util.createUniqueID(this.CLASS_NAME+
"_"))},destroy:function(){this.events&&(this.eventListeners&&this.events.un(this.eventListeners),this.events.destroy(),this.events=null);this.eventListeners=null;this.handler&&(this.handler.destroy(),this.handler=null);if(this.handlers){for(var a in this.handlers)this.handlers.hasOwnProperty(a)&&"function"==typeof this.handlers[a].destroy&&this.handlers[a].destroy();this.handlers=null}this.map&&(this.map.removeControl(this),this.map=null);this.div=null},setMap:function(a){this.map=a;this.handler&&
this.handler.setMap(a)},draw:function(a){null==this.div&&(this.div=OpenLayers.Util.createDiv(this.id),this.div.className=this.displayClass,this.allowSelection||(this.div.className+=" olControlNoSelect",this.div.setAttribute("unselectable","on",0),this.div.onselectstart=OpenLayers.Function.False),""!=this.title&&(this.div.title=this.title));null!=a&&(this.position=a.clone());this.moveTo(this.position);return this.div},moveTo:function(a){null!=a&&null!=this.div&&(this.div.style.left=a.x+"px",this.div.style.top=
a.y+"px")},activate:function(){if(this.active)return!1;this.handler&&this.handler.activate();this.active=!0;this.map&&OpenLayers.Element.addClass(this.map.viewPortDiv,this.displayClass.replace(/ /g,"")+"Active");this.events.triggerEvent("activate");return!0},deactivate:function(){return this.active?(this.handler&&this.handler.deactivate(),this.active=!1,this.map&&OpenLayers.Element.removeClass(this.map.viewPortDiv,this.displayClass.replace(/ /g,"")+"Active"),this.events.triggerEvent("deactivate"),
!0):!1},CLASS_NAME:"OpenLayers.Control"});OpenLayers.Control.TYPE_BUTTON=1;OpenLayers.Control.TYPE_TOGGLE=2;OpenLayers.Control.TYPE_TOOL=3;OpenLayers.Handler.Box=OpenLayers.Class(OpenLayers.Handler,{dragHandler:null,boxDivClassName:"olHandlerBoxZoomBox",boxOffsets:null,initialize:function(a,b,c){OpenLayers.Handler.prototype.initialize.apply(this,arguments);this.dragHandler=new OpenLayers.Handler.Drag(this,{down:this.startBox,move:this.moveBox,out:this.removeBox,up:this.endBox},{keyMask:this.keyMask})},destroy:function(){OpenLayers.Handler.prototype.destroy.apply(this,arguments);this.dragHandler&&(this.dragHandler.destroy(),this.dragHandler=
null)},setMap:function(a){OpenLayers.Handler.prototype.setMap.apply(this,arguments);this.dragHandler&&this.dragHandler.setMap(a)},startBox:function(a){this.callback("start",[]);this.zoomBox=OpenLayers.Util.createDiv("zoomBox",{x:-9999,y:-9999});this.zoomBox.className=this.boxDivClassName;this.zoomBox.style.zIndex=this.map.Z_INDEX_BASE.Popup-1;this.map.viewPortDiv.appendChild(this.zoomBox);OpenLayers.Element.addClass(this.map.viewPortDiv,"olDrawBox")},moveBox:function(a){var b=this.dragHandler.start.x,
c=this.dragHandler.start.y,d=Math.abs(b-a.x),e=Math.abs(c-a.y),f=this.getBoxOffsets();this.zoomBox.style.width=d+f.width+1+"px";this.zoomBox.style.height=e+f.height+1+"px";this.zoomBox.style.left=(a.x<b?b-d-f.left:b-f.left)+"px";this.zoomBox.style.top=(a.y<c?c-e-f.top:c-f.top)+"px"},endBox:function(a){if(5<Math.abs(this.dragHandler.start.x-a.x)||5<Math.abs(this.dragHandler.start.y-a.y)){var b=this.dragHandler.start;a=new OpenLayers.Bounds(Math.min(b.x,a.x),Math.max(b.y,a.y),Math.max(b.x,a.x),Math.min(b.y,
a.y))}else a=this.dragHandler.start.clone();this.removeBox();this.callback("done",[a])},removeBox:function(){this.map.viewPortDiv.removeChild(this.zoomBox);this.boxOffsets=this.zoomBox=null;OpenLayers.Element.removeClass(this.map.viewPortDiv,"olDrawBox")},activate:function(){return OpenLayers.Handler.prototype.activate.apply(this,arguments)?(this.dragHandler.activate(),!0):!1},deactivate:function(){return OpenLayers.Handler.prototype.deactivate.apply(this,arguments)?(this.dragHandler.deactivate()&&
this.zoomBox&&this.removeBox(),!0):!1},getBoxOffsets:function(){if(!this.boxOffsets){var a=document.createElement("div");a.style.position="absolute";a.style.border="1px solid black";a.style.width="3px";document.body.appendChild(a);var b=3==a.clientWidth;document.body.removeChild(a);var a=parseInt(OpenLayers.Element.getStyle(this.zoomBox,"border-left-width")),c=parseInt(OpenLayers.Element.getStyle(this.zoomBox,"border-right-width")),d=parseInt(OpenLayers.Element.getStyle(this.zoomBox,"border-top-width")),
e=parseInt(OpenLayers.Element.getStyle(this.zoomBox,"border-bottom-width"));this.boxOffsets={left:a,right:c,top:d,bottom:e,width:!1===b?a+c:0,height:!1===b?d+e:0}}return this.boxOffsets},CLASS_NAME:"OpenLayers.Handler.Box"});OpenLayers.Control.ZoomBox=OpenLayers.Class(OpenLayers.Control,{type:OpenLayers.Control.TYPE_TOOL,out:!1,keyMask:null,alwaysZoom:!1,zoomOnClick:!0,draw:function(){this.handler=new OpenLayers.Handler.Box(this,{done:this.zoomBox},{keyMask:this.keyMask})},zoomBox:function(a){if(a instanceof OpenLayers.Bounds){var b,c=a.getCenterPixel();if(this.out){b=Math.min(this.map.size.h/(a.bottom-a.top),this.map.size.w/(a.right-a.left));var d=this.map.getExtent(),e=this.map.getLonLatFromPixel(c),f=e.lon-d.getWidth()/
2*b;a=e.lon+d.getWidth()/2*b;var g=e.lat-d.getHeight()/2*b;b=e.lat+d.getHeight()/2*b;b=new OpenLayers.Bounds(f,g,a,b)}else f=this.map.getLonLatFromPixel({x:a.left,y:a.bottom}),a=this.map.getLonLatFromPixel({x:a.right,y:a.top}),b=new OpenLayers.Bounds(f.lon,f.lat,a.lon,a.lat);f=this.map.getZoom();g=this.map.getSize();a=g.w/2;g=g.h/2;b=this.map.getZoomForExtent(b);d=this.map.getResolution();e=this.map.getResolutionForZoom(b);d==e?this.map.setCenter(this.map.getLonLatFromPixel(c)):this.map.zoomTo(b,
{x:(d*c.x-e*a)/(d-e),y:(d*c.y-e*g)/(d-e)});f==this.map.getZoom()&&1==this.alwaysZoom&&this.map.zoomTo(f+(this.out?-1:1))}else this.zoomOnClick&&(this.out?this.map.zoomTo(this.map.getZoom()-1,a):this.map.zoomTo(this.map.getZoom()+1,a))},CLASS_NAME:"OpenLayers.Control.ZoomBox"});OpenLayers.Control.DragPan=OpenLayers.Class(OpenLayers.Control,{type:OpenLayers.Control.TYPE_TOOL,panned:!1,interval:0,documentDrag:!1,kinetic:null,enableKinetic:!0,kineticInterval:10,draw:function(){if(this.enableKinetic&&OpenLayers.Kinetic){var a={interval:this.kineticInterval};"object"===typeof this.enableKinetic&&(a=OpenLayers.Util.extend(a,this.enableKinetic));this.kinetic=new OpenLayers.Kinetic(a)}this.handler=new OpenLayers.Handler.Drag(this,{move:this.panMap,done:this.panMapDone,down:this.panMapStart},
{interval:this.interval,documentDrag:this.documentDrag})},panMapStart:function(){this.kinetic&&this.kinetic.begin()},panMap:function(a){this.kinetic&&this.kinetic.update(a);this.panned=!0;this.map.pan(this.handler.last.x-a.x,this.handler.last.y-a.y,{dragging:!0,animate:!1})},panMapDone:function(a){if(this.panned){var b=null;this.kinetic&&(b=this.kinetic.end(a));this.map.pan(this.handler.last.x-a.x,this.handler.last.y-a.y,{dragging:!!b,animate:!1});if(b){var c=this;this.kinetic.move(b,function(a,b,
f){c.map.pan(a,b,{dragging:!f,animate:!1})})}this.panned=!1}},CLASS_NAME:"OpenLayers.Control.DragPan"});OpenLayers.Handler.MouseWheel=OpenLayers.Class(OpenLayers.Handler,{wheelListener:null,interval:0,maxDelta:Number.POSITIVE_INFINITY,delta:0,cumulative:!0,initialize:function(a,b,c){OpenLayers.Handler.prototype.initialize.apply(this,arguments);this.wheelListener=OpenLayers.Function.bindAsEventListener(this.onWheelEvent,this)},destroy:function(){OpenLayers.Handler.prototype.destroy.apply(this,arguments);this.wheelListener=null},onWheelEvent:function(a){if(this.map&&this.checkModifiers(a)){for(var b=
!1,c=!1,d=!1,e=OpenLayers.Event.element(a);null!=e&&!d&&!b;){if(!b)try{var f,b=(f=e.currentStyle?e.currentStyle.overflow:document.defaultView.getComputedStyle(e,null).getPropertyValue("overflow"))&&"auto"==f||"scroll"==f}catch(l){}if(!c&&(c=OpenLayers.Element.hasClass(e,"olScrollable"),!c))for(var d=0,g=this.map.layers.length;d<g;d++){var h=this.map.layers[d];if(e==h.div||e==h.pane){c=!0;break}}d=e==this.map.div;e=e.parentNode}if(!b&&d){if(c)if(b=0,a.wheelDelta?(b=a.wheelDelta,0===b%160&&(b*=.75),
b/=120):a.detail&&(b=-(a.detail/Math.abs(a.detail))),this.delta+=b,window.clearTimeout(this._timeoutId),this.interval&&Math.abs(this.delta)<this.maxDelta){var k=OpenLayers.Util.extend({},a);this._timeoutId=window.setTimeout(OpenLayers.Function.bind(function(){this.wheelZoom(k)},this),this.interval)}else this.wheelZoom(a);OpenLayers.Event.stop(a)}}},wheelZoom:function(a){var b=this.delta;this.delta=0;b&&(a.xy=this.map.events.getMousePosition(a),0>b?this.callback("down",[a,this.cumulative?Math.max(-this.maxDelta,
b):-1]):this.callback("up",[a,this.cumulative?Math.min(this.maxDelta,b):1]))},activate:function(a){if(OpenLayers.Handler.prototype.activate.apply(this,arguments)){var b=this.wheelListener;OpenLayers.Event.observe(window,"DOMMouseScroll",b);OpenLayers.Event.observe(window,"mousewheel",b);OpenLayers.Event.observe(document,"mousewheel",b);return!0}return!1},deactivate:function(a){if(OpenLayers.Handler.prototype.deactivate.apply(this,arguments)){var b=this.wheelListener;OpenLayers.Event.stopObserving(window,
"DOMMouseScroll",b);OpenLayers.Event.stopObserving(window,"mousewheel",b);OpenLayers.Event.stopObserving(document,"mousewheel",b);return!0}return!1},CLASS_NAME:"OpenLayers.Handler.MouseWheel"});OpenLayers.Control.Navigation=OpenLayers.Class(OpenLayers.Control,{dragPan:null,dragPanOptions:null,pinchZoom:null,pinchZoomOptions:null,documentDrag:!1,zoomBox:null,zoomBoxEnabled:!0,zoomWheelEnabled:!0,mouseWheelOptions:null,handleRightClicks:!1,zoomBoxKeyMask:OpenLayers.Handler.MOD_SHIFT,autoActivate:!0,initialize:function(a){this.handlers={};OpenLayers.Control.prototype.initialize.apply(this,arguments)},destroy:function(){this.deactivate();this.dragPan&&this.dragPan.destroy();this.dragPan=null;
this.zoomBox&&this.zoomBox.destroy();this.zoomBox=null;this.pinchZoom&&this.pinchZoom.destroy();this.pinchZoom=null;OpenLayers.Control.prototype.destroy.apply(this,arguments)},activate:function(){this.dragPan.activate();this.zoomWheelEnabled&&this.handlers.wheel.activate();this.handlers.click.activate();this.zoomBoxEnabled&&this.zoomBox.activate();this.pinchZoom&&this.pinchZoom.activate();return OpenLayers.Control.prototype.activate.apply(this,arguments)},deactivate:function(){this.pinchZoom&&this.pinchZoom.deactivate();
this.zoomBox.deactivate();this.dragPan.deactivate();this.handlers.click.deactivate();this.handlers.wheel.deactivate();return OpenLayers.Control.prototype.deactivate.apply(this,arguments)},draw:function(){this.handleRightClicks&&(this.map.viewPortDiv.oncontextmenu=OpenLayers.Function.False);this.handlers.click=new OpenLayers.Handler.Click(this,{click:this.defaultClick,dblclick:this.defaultDblClick,dblrightclick:this.defaultDblRightClick},{"double":!0,stopDouble:!0});this.dragPan=new OpenLayers.Control.DragPan(OpenLayers.Util.extend({map:this.map,
documentDrag:this.documentDrag},this.dragPanOptions));this.zoomBox=new OpenLayers.Control.ZoomBox({map:this.map,keyMask:this.zoomBoxKeyMask});this.dragPan.draw();this.zoomBox.draw();this.handlers.wheel=new OpenLayers.Handler.MouseWheel(this,{up:this.wheelUp,down:this.wheelDown},OpenLayers.Util.extend(this.map.fractionalZoom?{}:{cumulative:!1,interval:50,maxDelta:6},this.mouseWheelOptions));OpenLayers.Control.PinchZoom&&(this.pinchZoom=new OpenLayers.Control.PinchZoom(OpenLayers.Util.extend({map:this.map},
this.pinchZoomOptions)))},defaultClick:function(a){a.lastTouches&&2==a.lastTouches.length&&this.map.zoomOut()},defaultDblClick:function(a){this.map.zoomTo(this.map.zoom+1,a.xy)},defaultDblRightClick:function(a){this.map.zoomTo(this.map.zoom-1,a.xy)},wheelChange:function(a,b){this.map.fractionalZoom||(b=Math.round(b));var c=this.map.getZoom(),d;d=Math.max(c+b,0);d=Math.min(d,this.map.getNumZoomLevels());d!==c&&this.map.zoomTo(d,a.xy)},wheelUp:function(a,b){this.wheelChange(a,b||1)},wheelDown:function(a,
b){this.wheelChange(a,b||-1)},disableZoomBox:function(){this.zoomBoxEnabled=!1;this.zoomBox.deactivate()},enableZoomBox:function(){this.zoomBoxEnabled=!0;this.active&&this.zoomBox.activate()},disableZoomWheel:function(){this.zoomWheelEnabled=!1;this.handlers.wheel.deactivate()},enableZoomWheel:function(){this.zoomWheelEnabled=!0;this.active&&this.handlers.wheel.activate()},CLASS_NAME:"OpenLayers.Control.Navigation"});OpenLayers.Events.buttonclick=OpenLayers.Class({target:null,events:"mousedown mouseup click dblclick touchstart touchmove touchend keydown".split(" "),startRegEx:/^mousedown|touchstart$/,cancelRegEx:/^touchmove$/,completeRegEx:/^mouseup|touchend$/,isDeviceTouchCapable:"ontouchstart"in window||window.DocumentTouch&&document instanceof window.DocumentTouch,initialize:function(a){this.target=a;for(a=this.events.length-1;0<=a;--a)this.target.register(this.events[a],this,this.buttonClick,{extension:!0})},
destroy:function(){for(var a=this.events.length-1;0<=a;--a)this.target.unregister(this.events[a],this,this.buttonClick);delete this.target},getPressedButton:function(a){var b=3,c;do{if(OpenLayers.Element.hasClass(a,"olButton")){c=a;break}a=a.parentNode}while(0<--b&&a);return c},ignore:function(a){var b=3,c=!1;do{if("a"===a.nodeName.toLowerCase()){c=!0;break}a=a.parentNode}while(0<--b&&a);return c},buttonClick:function(a){var b=!0,c=OpenLayers.Event.element(a);if(c&&(OpenLayers.Event.isLeftClick(a)&&
!this.isDeviceTouchCapable||!~a.type.indexOf("mouse")))if(c=this.getPressedButton(c)){if("keydown"===a.type)switch(a.keyCode){case OpenLayers.Event.KEY_RETURN:case OpenLayers.Event.KEY_SPACE:this.target.triggerEvent("buttonclick",{buttonElement:c}),OpenLayers.Event.stop(a),b=!1}else if(this.startEvt){if(this.completeRegEx.test(a.type)){var b=OpenLayers.Util.pagePosition(c),d=OpenLayers.Util.getViewportElement(),e=window.pageYOffset||d.scrollTop;b[0]-=window.pageXOffset||d.scrollLeft;b[1]-=e;this.target.triggerEvent("buttonclick",
{buttonElement:c,buttonXY:{x:this.startEvt.clientX-b[0],y:this.startEvt.clientY-b[1]}})}this.cancelRegEx.test(a.type)&&a.touches&&this.startEvt.touches&&4<(4<Math.abs(a.touches[0].olClientX-this.startEvt.touches[0].olClientX)||Math.abs(a.touches[0].olClientY-this.startEvt.touches[0].olClientY))&&delete this.startEvt;OpenLayers.Event.stop(a);b=!1}this.startRegEx.test(a.type)&&(this.startEvt=a,OpenLayers.Event.stop(a),b=!1)}else b=!this.ignore(OpenLayers.Event.element(a)),delete this.startEvt;return b}});OpenLayers.Control.Zoom=OpenLayers.Class(OpenLayers.Control,{zoomInText:"+",zoomInId:"olZoomInLink",zoomOutText:"\u2212",zoomOutId:"olZoomOutLink",draw:function(){var a=OpenLayers.Control.prototype.draw.apply(this),b=this.getOrCreateLinks(a),c=b.zoomIn,b=b.zoomOut,d=this.map.events;b.parentNode!==a&&(d=this.events,d.attachToElement(b.parentNode));d.register("buttonclick",this,this.onZoomClick);this.zoomInLink=c;this.zoomOutLink=b;return a},getOrCreateLinks:function(a){var b=document.getElementById(this.zoomInId),
c=document.getElementById(this.zoomOutId);b||(b=document.createElement("a"),b.href="#zoomIn",b.appendChild(document.createTextNode(this.zoomInText)),b.className="olControlZoomIn",a.appendChild(b));OpenLayers.Element.addClass(b,"olButton");c||(c=document.createElement("a"),c.href="#zoomOut",c.appendChild(document.createTextNode(this.zoomOutText)),c.className="olControlZoomOut",a.appendChild(c));OpenLayers.Element.addClass(c,"olButton");return{zoomIn:b,zoomOut:c}},onZoomClick:function(a){a=a.buttonElement;
a===this.zoomInLink?this.map.zoomIn():a===this.zoomOutLink&&this.map.zoomOut()},destroy:function(){this.map&&this.map.events.unregister("buttonclick",this,this.onZoomClick);delete this.zoomInLink;delete this.zoomOutLink;OpenLayers.Control.prototype.destroy.apply(this)},CLASS_NAME:"OpenLayers.Control.Zoom"});OpenLayers.Control.MousePosition=OpenLayers.Class(OpenLayers.Control,{autoActivate:!0,element:null,prefix:"",separator:", ",suffix:"",numDigits:5,granularity:10,emptyString:null,lastXy:null,displayProjection:null,destroy:function(){this.deactivate();OpenLayers.Control.prototype.destroy.apply(this,arguments)},activate:function(){return OpenLayers.Control.prototype.activate.apply(this,arguments)?(this.map.events.register("mousemove",this,this.redraw),this.map.events.register("mouseout",this,this.reset),
this.redraw(),!0):!1},deactivate:function(){return OpenLayers.Control.prototype.deactivate.apply(this,arguments)?(this.map.events.unregister("mousemove",this,this.redraw),this.map.events.unregister("mouseout",this,this.reset),this.element.innerHTML="",!0):!1},draw:function(){OpenLayers.Control.prototype.draw.apply(this,arguments);this.element||(this.div.left="",this.div.top="",this.element=this.div);return this.div},redraw:function(a){var b;if(null==a)this.reset();else if(null==this.lastXy||Math.abs(a.xy.x-
this.lastXy.x)>this.granularity||Math.abs(a.xy.y-this.lastXy.y)>this.granularity)this.lastXy=a.xy;else if(b=this.map.getLonLatFromPixel(a.xy))this.displayProjection&&b.transform(this.map.getProjectionObject(),this.displayProjection),this.lastXy=a.xy,a=this.formatOutput(b),a!=this.element.innerHTML&&(this.element.innerHTML=a)},reset:function(a){null!=this.emptyString&&(this.element.innerHTML=this.emptyString)},formatOutput:function(a){var b=parseInt(this.numDigits);return this.prefix+a.lon.toFixed(b)+
this.separator+a.lat.toFixed(b)+this.suffix},CLASS_NAME:"OpenLayers.Control.MousePosition"});OpenLayers.Control.DrawFeature=OpenLayers.Class(OpenLayers.Control,{layer:null,callbacks:null,multi:!1,featureAdded:function(){},initialize:function(a,b,c){OpenLayers.Control.prototype.initialize.apply(this,[c]);this.callbacks=OpenLayers.Util.extend({done:this.drawFeature,modify:function(a,b){this.layer.events.triggerEvent("sketchmodified",{vertex:a,feature:b})},create:function(a,b){this.layer.events.triggerEvent("sketchstarted",{vertex:a,feature:b})}},this.callbacks);this.layer=a;this.handlerOptions=
this.handlerOptions||{};this.handlerOptions.layerOptions=OpenLayers.Util.applyDefaults(this.handlerOptions.layerOptions,{renderers:a.renderers,rendererOptions:a.rendererOptions});"multi"in this.handlerOptions||(this.handlerOptions.multi=this.multi);if(a=this.layer.styleMap&&this.layer.styleMap.styles.temporary)this.handlerOptions.layerOptions=OpenLayers.Util.applyDefaults(this.handlerOptions.layerOptions,{styleMap:new OpenLayers.StyleMap({"default":a})});this.handler=new b(this,this.callbacks,this.handlerOptions)},
drawFeature:function(a){a=new OpenLayers.Feature.Vector(a);!1!==this.layer.events.triggerEvent("sketchcomplete",{feature:a})&&(a.state=OpenLayers.State.INSERT,this.layer.addFeatures([a]),this.featureAdded(a),this.events.triggerEvent("featureadded",{feature:a}))},insertXY:function(a,b){this.handler&&this.handler.line&&this.handler.insertXY(a,b)},insertDeltaXY:function(a,b){this.handler&&this.handler.line&&this.handler.insertDeltaXY(a,b)},insertDirectionLength:function(a,b){this.handler&&this.handler.line&&
this.handler.insertDirectionLength(a,b)},insertDeflectionLength:function(a,b){this.handler&&this.handler.line&&this.handler.insertDeflectionLength(a,b)},undo:function(){return this.handler.undo&&this.handler.undo()},redo:function(){return this.handler.redo&&this.handler.redo()},finishSketch:function(){this.handler.finishGeometry()},cancel:function(){this.handler.cancel()},CLASS_NAME:"OpenLayers.Control.DrawFeature"});OpenLayers.Handler.Keyboard=OpenLayers.Class(OpenLayers.Handler,{KEY_EVENTS:["keydown","keyup"],eventListener:null,observeElement:null,initialize:function(a,b,c){OpenLayers.Handler.prototype.initialize.apply(this,arguments);this.eventListener=OpenLayers.Function.bindAsEventListener(this.handleKeyEvent,this)},destroy:function(){this.deactivate();this.eventListener=null;OpenLayers.Handler.prototype.destroy.apply(this,arguments)},activate:function(){if(OpenLayers.Handler.prototype.activate.apply(this,
arguments)){this.observeElement=this.observeElement||document;for(var a=0,b=this.KEY_EVENTS.length;a<b;a++)OpenLayers.Event.observe(this.observeElement,this.KEY_EVENTS[a],this.eventListener);return!0}return!1},deactivate:function(){var a=!1;if(OpenLayers.Handler.prototype.deactivate.apply(this,arguments)){for(var a=0,b=this.KEY_EVENTS.length;a<b;a++)OpenLayers.Event.stopObserving(this.observeElement,this.KEY_EVENTS[a],this.eventListener);a=!0}return a},handleKeyEvent:function(a){this.checkModifiers(a)&&
this.callback(a.type,[a])},CLASS_NAME:"OpenLayers.Handler.Keyboard"});OpenLayers.Control.KeyboardDefaults=OpenLayers.Class(OpenLayers.Control,{autoActivate:!0,slideFactor:75,observeElement:null,draw:function(){this.handler=new OpenLayers.Handler.Keyboard(this,{keydown:this.defaultKeyPress},{observeElement:this.observeElement||document})},defaultKeyPress:function(a){var b,c=!0;b=OpenLayers.Event.element(a);if(!b||"INPUT"!=b.tagName&&"TEXTAREA"!=b.tagName&&"SELECT"!=b.tagName){switch(a.keyCode){case OpenLayers.Event.KEY_LEFT:this.map.pan(-this.slideFactor,0);break;case OpenLayers.Event.KEY_RIGHT:this.map.pan(this.slideFactor,
0);break;case OpenLayers.Event.KEY_UP:this.map.pan(0,-this.slideFactor);break;case OpenLayers.Event.KEY_DOWN:this.map.pan(0,this.slideFactor);break;case 33:b=this.map.getSize();this.map.pan(0,-.75*b.h);break;case 34:b=this.map.getSize();this.map.pan(0,.75*b.h);break;case 35:b=this.map.getSize();this.map.pan(.75*b.w,0);break;case 36:b=this.map.getSize();this.map.pan(-.75*b.w,0);break;case 43:case 61:case 187:case 107:this.map.zoomIn();break;case 45:case 109:case 189:case 95:this.map.zoomOut();break;
default:c=!1}c&&OpenLayers.Event.stop(a)}},CLASS_NAME:"OpenLayers.Control.KeyboardDefaults"});OpenLayers.Control.Measure=OpenLayers.Class(OpenLayers.Control,{callbacks:null,displaySystem:"metric",geodesic:!1,displaySystemUnits:{geographic:["dd"],english:["mi","ft","in"],metric:["km","m"]},partialDelay:300,delayedTrigger:null,persist:!1,immediate:!1,initialize:function(a,b){OpenLayers.Control.prototype.initialize.apply(this,[b]);var c={done:this.measureComplete,point:this.measurePartial};this.immediate&&(c.modify=this.measureImmediate);this.callbacks=OpenLayers.Util.extend(c,this.callbacks);
this.handlerOptions=OpenLayers.Util.extend({persist:this.persist},this.handlerOptions);this.handler=new a(this,this.callbacks,this.handlerOptions)},deactivate:function(){this.cancelDelay();return OpenLayers.Control.prototype.deactivate.apply(this,arguments)},cancel:function(){this.cancelDelay();this.handler.cancel()},setImmediate:function(a){(this.immediate=a)?this.callbacks.modify=this.measureImmediate:delete this.callbacks.modify},updateHandler:function(a,b){var c=this.active;c&&this.deactivate();
this.handler=new a(this,this.callbacks,b);c&&this.activate()},measureComplete:function(a){this.cancelDelay();this.measure(a,"measure")},measurePartial:function(a,b){this.cancelDelay();b=b.clone();this.handler.freehandMode(this.handler.evt)?this.measure(b,"measurepartial"):this.delayedTrigger=window.setTimeout(OpenLayers.Function.bind(function(){this.delayedTrigger=null;this.measure(b,"measurepartial")},this),this.partialDelay)},measureImmediate:function(a,b,c){c&&!this.handler.freehandMode(this.handler.evt)&&
(this.cancelDelay(),this.measure(b.geometry,"measurepartial"))},cancelDelay:function(){null!==this.delayedTrigger&&(window.clearTimeout(this.delayedTrigger),this.delayedTrigger=null)},measure:function(a,b){var c,d;-1<a.CLASS_NAME.indexOf("LineString")?(c=this.getBestLength(a),d=1):(c=this.getBestArea(a),d=2);this.events.triggerEvent(b,{measure:c[0],units:c[1],order:d,geometry:a})},getBestArea:function(a){for(var b=this.displaySystemUnits[this.displaySystem],c,d,e=0,f=b.length;e<f&&!(c=b[e],d=this.getArea(a,
c),1<d);++e);return[d,c]},getArea:function(a,b){var c,d;this.geodesic?(c=a.getGeodesicArea(this.map.getProjectionObject()),d="m"):(c=a.getArea(),d=this.map.getUnits());var e=OpenLayers.INCHES_PER_UNIT[b];e&&(c*=Math.pow(OpenLayers.INCHES_PER_UNIT[d]/e,2));return c},getBestLength:function(a){for(var b=this.displaySystemUnits[this.displaySystem],c,d,e=0,f=b.length;e<f&&!(c=b[e],d=this.getLength(a,c),1<d);++e);return[d,c]},getLength:function(a,b){var c,d;this.geodesic?(c=a.getGeodesicLength(this.map.getProjectionObject()),
d="m"):(c=a.getLength(),d=this.map.getUnits());var e=OpenLayers.INCHES_PER_UNIT[b];e&&(c*=OpenLayers.INCHES_PER_UNIT[d]/e);return c},CLASS_NAME:"OpenLayers.Control.Measure"});OpenLayers.Control.LayerSwitcher=OpenLayers.Class(OpenLayers.Control,{layerStates:null,layersDiv:null,baseLayersDiv:null,baseLayers:null,dataLbl:null,dataLayersDiv:null,dataLayers:null,minimizeDiv:null,maximizeDiv:null,ascending:!0,initialize:function(a){OpenLayers.Control.prototype.initialize.apply(this,arguments);this.layerStates=[]},destroy:function(){this.clearLayersArray("base");this.clearLayersArray("data");this.map.events.un({buttonclick:this.onButtonClick,addlayer:this.redraw,changelayer:this.redraw,
removelayer:this.redraw,changebaselayer:this.redraw,scope:this});this.events.unregister("buttonclick",this,this.onButtonClick);OpenLayers.Control.prototype.destroy.apply(this,arguments)},setMap:function(a){OpenLayers.Control.prototype.setMap.apply(this,arguments);this.map.events.on({addlayer:this.redraw,changelayer:this.redraw,removelayer:this.redraw,changebaselayer:this.redraw,scope:this});this.outsideViewport?(this.events.attachToElement(this.div),this.events.register("buttonclick",this,this.onButtonClick)):
this.map.events.register("buttonclick",this,this.onButtonClick)},draw:function(){OpenLayers.Control.prototype.draw.apply(this);this.loadContents();this.outsideViewport||this.minimizeControl();this.redraw();return this.div},onButtonClick:function(a){a=a.buttonElement;a===this.minimizeDiv?this.minimizeControl():a===this.maximizeDiv?this.maximizeControl():a._layerSwitcher===this.id&&(a["for"]&&(a=document.getElementById(a["for"])),a.disabled||("radio"==a.type?(a.checked=!0,this.map.setBaseLayer(this.map.getLayer(a._layer))):
(a.checked=!a.checked,this.updateMap())))},clearLayersArray:function(a){this[a+"LayersDiv"].innerHTML="";this[a+"Layers"]=[]},checkRedraw:function(){if(!this.layerStates.length||this.map.layers.length!=this.layerStates.length)return!0;for(var a=0,b=this.layerStates.length;a<b;a++){var c=this.layerStates[a],d=this.map.layers[a];if(c.name!=d.name||c.inRange!=d.inRange||c.id!=d.id||c.visibility!=d.visibility)return!0}return!1},redraw:function(){if(!this.checkRedraw())return this.div;this.clearLayersArray("base");
this.clearLayersArray("data");var a=!1,b=!1,c=this.map.layers.length;this.layerStates=Array(c);for(var d=0;d<c;d++){var e=this.map.layers[d];this.layerStates[d]={name:e.name,visibility:e.visibility,inRange:e.inRange,id:e.id}}var f=this.map.layers.slice();this.ascending||f.reverse();d=0;for(c=f.length;d<c;d++){var e=f[d],g=e.isBaseLayer;if(e.displayInLayerSwitcher){g?b=!0:a=!0;var h=g?e==this.map.baseLayer:e.getVisibility(),k=document.createElement("input"),l=OpenLayers.Util.createUniqueID(this.id+
"_input_");k.id=l;k.name=g?this.id+"_baseLayers":e.name;k.type=g?"radio":"checkbox";k.value=e.name;k.checked=h;k.defaultChecked=h;k.className="olButton";k._layer=e.id;k._layerSwitcher=this.id;g||e.inRange||(k.disabled=!0);h=document.createElement("label");h["for"]=k.id;OpenLayers.Element.addClass(h,"labelSpan olButton");h._layer=e.id;h._layerSwitcher=this.id;g||e.inRange||(h.style.color="gray");h.innerHTML=e.name;h.style.verticalAlign=g?"bottom":"baseline";l=document.createElement("br");(g?this.baseLayers:
this.dataLayers).push({layer:e,inputElem:k,labelSpan:h});e=g?this.baseLayersDiv:this.dataLayersDiv;e.appendChild(k);e.appendChild(h);e.appendChild(l)}}this.dataLbl.style.display=a?"":"none";this.baseLbl.style.display=b?"":"none";return this.div},updateMap:function(){for(var a=0,b=this.baseLayers.length;a<b;a++){var c=this.baseLayers[a];c.inputElem.checked&&this.map.setBaseLayer(c.layer,!1)}a=0;for(b=this.dataLayers.length;a<b;a++)c=this.dataLayers[a],c.layer.setVisibility(c.inputElem.checked)},maximizeControl:function(a){this.div.style.width=
"";this.div.style.height="";this.showControls(!1);null!=a&&OpenLayers.Event.stop(a)},minimizeControl:function(a){this.div.style.width="0px";this.div.style.height="0px";this.showControls(!0);null!=a&&OpenLayers.Event.stop(a)},showControls:function(a){this.maximizeDiv.style.display=a?"":"none";this.minimizeDiv.style.display=a?"none":"";this.layersDiv.style.display=a?"none":""},loadContents:function(){this.layersDiv=document.createElement("div");this.layersDiv.id=this.id+"_layersDiv";OpenLayers.Element.addClass(this.layersDiv,
"layersDiv");this.baseLbl=document.createElement("div");this.baseLbl.innerHTML=OpenLayers.i18n("Base Layer");OpenLayers.Element.addClass(this.baseLbl,"baseLbl");this.baseLayersDiv=document.createElement("div");OpenLayers.Element.addClass(this.baseLayersDiv,"baseLayersDiv");this.dataLbl=document.createElement("div");this.dataLbl.innerHTML=OpenLayers.i18n("Overlays");OpenLayers.Element.addClass(this.dataLbl,"dataLbl");this.dataLayersDiv=document.createElement("div");OpenLayers.Element.addClass(this.dataLayersDiv,
"dataLayersDiv");this.ascending?(this.layersDiv.appendChild(this.baseLbl),this.layersDiv.appendChild(this.baseLayersDiv),this.layersDiv.appendChild(this.dataLbl),this.layersDiv.appendChild(this.dataLayersDiv)):(this.layersDiv.appendChild(this.dataLbl),this.layersDiv.appendChild(this.dataLayersDiv),this.layersDiv.appendChild(this.baseLbl),this.layersDiv.appendChild(this.baseLayersDiv));this.div.appendChild(this.layersDiv);var a=OpenLayers.Util.getImageLocation("layer-switcher-maximize.png");this.maximizeDiv=
OpenLayers.Util.createAlphaImageDiv("OpenLayers_Control_MaximizeDiv",null,null,a,"absolute");OpenLayers.Element.addClass(this.maximizeDiv,"maximizeDiv olButton");this.maximizeDiv.style.display="none";this.div.appendChild(this.maximizeDiv);a=OpenLayers.Util.getImageLocation("layer-switcher-minimize.png");this.minimizeDiv=OpenLayers.Util.createAlphaImageDiv("OpenLayers_Control_MinimizeDiv",null,null,a,"absolute");OpenLayers.Element.addClass(this.minimizeDiv,"minimizeDiv olButton");this.minimizeDiv.style.display=
"none";this.div.appendChild(this.minimizeDiv)},CLASS_NAME:"OpenLayers.Control.LayerSwitcher"});OpenLayers.Control.ModifyFeature=OpenLayers.Class(OpenLayers.Control,{bySegment:!1,documentDrag:!1,geometryTypes:null,clickout:!0,toggle:!0,standalone:!1,layer:null,feature:null,vertex:null,vertices:null,virtualVertices:null,handlers:null,deleteCodes:null,virtualStyle:null,vertexRenderIntent:null,mode:null,createVertices:!0,modified:!1,radiusHandle:null,dragHandle:null,onModificationStart:function(){},onModification:function(){},onModificationEnd:function(){},initialize:function(a,b){b=b||{};this.layer=
a;this.vertices=[];this.virtualVertices=[];this.virtualStyle=OpenLayers.Util.extend({},this.layer.style||this.layer.styleMap.createSymbolizer(null,b.vertexRenderIntent));this.virtualStyle.fillOpacity=.3;this.virtualStyle.strokeOpacity=.3;this.deleteCodes=[46,68];this.mode=OpenLayers.Control.ModifyFeature.RESHAPE;OpenLayers.Control.prototype.initialize.apply(this,[b]);OpenLayers.Util.isArray(this.deleteCodes)||(this.deleteCodes=[this.deleteCodes]);var c=this,d={documentDrag:this.documentDrag,setEvent:function(a){var b=
c.feature;c._lastVertex=b?b.layer.getFeatureFromEvent(a):null;OpenLayers.Handler.Drag.prototype.setEvent.apply(this,arguments)},stopDown:!1};this.handlers={keyboard:new OpenLayers.Handler.Keyboard(this,{keydown:this.handleKeypress}),drag:new OpenLayers.Handler.Drag(this,{down:function(a){this.vertex=null;(a=this.layer.getFeatureFromEvent(this.handlers.drag.evt))?this.dragStart(a):this.clickout&&(this._unselect=this.feature)},move:function(a){delete this._unselect;this.vertex&&this.dragVertex(this.vertex,
a)},up:function(){this.handlers.drag.stopDown=!1;this._unselect&&(this.unselectFeature(this._unselect),delete this._unselect)},done:function(a){this.vertex&&this.dragComplete(this.vertex)}},d)};if(this.bySegment){if(!window.rbush)throw Error("The rbush library is required");if(OpenLayers.Control.ModifyFeature.BySegment)OpenLayers.Util.extend(this,OpenLayers.Control.ModifyFeature.BySegment);else throw Error("OpenLayers.Control.ModifyFeature.BySegment is missing from the build");}},createVirtualVertex:function(a,
b){var c=new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point((a.x+b.x)/2,(a.y+b.y)/2),null,this.virtualStyle);c._sketch=!0;return c},destroy:function(){this.map&&this.map.events.un({removelayer:this.handleMapEvents,changelayer:this.handleMapEvents,scope:this});this.layer=null;OpenLayers.Control.prototype.destroy.apply(this,[])},activate:function(){return OpenLayers.Control.prototype.activate.apply(this,arguments)?(this.moveLayerToTop(),this.map.events.on({removelayer:this.handleMapEvents,
changelayer:this.handleMapEvents,scope:this}),this._lastVertex=null,this.handlers.keyboard.activate()&&this.handlers.drag.activate()):!1},deactivate:function(){var a=!1;OpenLayers.Control.prototype.deactivate.apply(this,arguments)&&(this.moveLayerBack(),this.map.events.un({removelayer:this.handleMapEvents,changelayer:this.handleMapEvents,scope:this}),this.layer.removeFeatures(this.vertices,{silent:!0}),this.layer.removeFeatures(this.virtualVertices,{silent:!0}),this.vertices=[],this.handlers.drag.deactivate(),
this.handlers.keyboard.deactivate(),(a=this.feature)&&a.geometry&&a.layer&&this.unselectFeature(a),a=!0);return a},beforeSelectFeature:function(a){return this.layer.events.triggerEvent("beforefeaturemodified",{feature:a})},selectFeature:function(a){var b=OpenLayers.Util.indexOf;this.feature===a||this.geometryTypes&&-1==b(this.geometryTypes,a.geometry.CLASS_NAME)||(!1!==this.beforeSelectFeature(a)&&(this.feature&&this.unselectFeature(this.feature),this.feature=a,-1==b(this.layer.selectedFeatures,a)&&
this.layer.selectedFeatures.push(a),this.layer.drawFeature(a,"select"),this.modified=!1,this.resetVertices(),this.onModificationStart(this.feature)),b=a.modified,!a.geometry||b&&b.geometry||(this._originalGeometry=a.geometry.clone()))},unselectFeature:function(a){this.layer.removeFeatures(this.vertices,{silent:!0});this.vertices=[];this.layer.destroyFeatures(this.virtualVertices,{silent:!0});this.virtualVertices=[];this.dragHandle&&(this.layer.destroyFeatures([this.dragHandle],{silent:!0}),delete this.dragHandle);
this.radiusHandle&&(this.layer.destroyFeatures([this.radiusHandle],{silent:!0}),delete this.radiusHandle);this.layer.drawFeature(this.feature,"default");this.feature=null;OpenLayers.Util.removeItem(this.layer.selectedFeatures,a);this.onModificationEnd(a);this.layer.events.triggerEvent("afterfeaturemodified",{feature:a,modified:this.modified});this.modified=!1},dragStart:function(a){var b="OpenLayers.Geometry.Point"==a.geometry.CLASS_NAME;this.standalone||(a._sketch||!b)&&a._sketch||(this.toggle&&
this.feature===a&&(this._unselect=a),this.selectFeature(a));this.feature&&(a._sketch||b&&a===this.feature)&&(this.vertex=a,this.handlers.drag.stopDown=!0)},dragVertex:function(a,b){var c=this.map.getLonLatFromViewPortPx(b),d=a.geometry;d.move(c.lon-d.x,c.lat-d.y);this.modified=!0;"OpenLayers.Geometry.Point"==this.feature.geometry.CLASS_NAME?this.layer.events.triggerEvent("vertexmodified",{vertex:a.geometry,feature:this.feature,pixel:b}):(a._index?(-1==a._index&&(a._index=OpenLayers.Util.indexOf(a.geometry.parent.components,
a._next)),a.geometry.parent.addComponent(a.geometry,a._index),delete a._index,OpenLayers.Util.removeItem(this.virtualVertices,a),this.vertices.push(a)):a==this.dragHandle?(this.layer.removeFeatures(this.vertices,{silent:!0}),this.vertices=[],this.radiusHandle&&(this.layer.destroyFeatures([this.radiusHandle],{silent:!0}),this.radiusHandle=null)):a!==this.radiusHandle&&this.layer.events.triggerEvent("vertexmodified",{vertex:a.geometry,feature:this.feature,pixel:b}),0<this.virtualVertices.length&&(this.layer.destroyFeatures(this.virtualVertices,
{silent:!0}),this.virtualVertices=[]),this.layer.drawFeature(this.feature,this.standalone?void 0:"select"));this.layer.drawFeature(a)},dragComplete:function(a){this.resetVertices();this.setFeatureState();this.onModification(this.feature);this.layer.events.triggerEvent("featuremodified",{feature:this.feature})},setFeatureState:function(){if(this.feature.state!=OpenLayers.State.INSERT&&this.feature.state!=OpenLayers.State.DELETE&&(this.feature.state=OpenLayers.State.UPDATE,this.modified&&this._originalGeometry)){var a=
this.feature;a.modified=OpenLayers.Util.extend(a.modified,{geometry:this._originalGeometry});delete this._originalGeometry}},resetVertices:function(){0<this.vertices.length&&(this.layer.removeFeatures(this.vertices,{silent:!0}),this.vertices=[]);0<this.virtualVertices.length&&(this.layer.removeFeatures(this.virtualVertices,{silent:!0}),this.virtualVertices=[]);this.dragHandle&&(this.layer.destroyFeatures([this.dragHandle],{silent:!0}),this.dragHandle=null);this.radiusHandle&&(this.layer.destroyFeatures([this.radiusHandle],
{silent:!0}),this.radiusHandle=null);this.feature&&"OpenLayers.Geometry.Point"!=this.feature.geometry.CLASS_NAME&&(this.mode&OpenLayers.Control.ModifyFeature.DRAG&&this.collectDragHandle(),this.mode&(OpenLayers.Control.ModifyFeature.ROTATE|OpenLayers.Control.ModifyFeature.RESIZE)&&this.collectRadiusHandle(),this.mode&OpenLayers.Control.ModifyFeature.RESHAPE&&(this.mode&OpenLayers.Control.ModifyFeature.RESIZE||this.collectVertices()))},handleKeypress:function(a){var b=a.keyCode;this.feature&&-1!=OpenLayers.Util.indexOf(this.deleteCodes,
b)&&(b=this._lastVertex)&&-1!=OpenLayers.Util.indexOf(this.vertices,b)&&!this.handlers.drag.dragging&&b.geometry.parent&&(b.geometry.parent.removeComponent(b.geometry),this.layer.events.triggerEvent("vertexremoved",{vertex:b.geometry,feature:this.feature,pixel:a.xy}),this.layer.drawFeature(this.feature,this.standalone?void 0:"select"),this.modified=!0,this.resetVertices(),this.setFeatureState(),this.onModification(this.feature),this.layer.events.triggerEvent("featuremodified",{feature:this.feature}))},
collectVertices:function(){function a(c){var d,e,f;if("OpenLayers.Geometry.Point"==c.CLASS_NAME)e=new OpenLayers.Feature.Vector(c),e._sketch=!0,e.renderIntent=b.vertexRenderIntent,b.vertices.push(e);else{f=c.components.length;"OpenLayers.Geometry.LinearRing"==c.CLASS_NAME&&--f;for(d=0;d<f;++d)e=c.components[d],"OpenLayers.Geometry.Point"==e.CLASS_NAME?(e=new OpenLayers.Feature.Vector(e),e._sketch=!0,e.renderIntent=b.vertexRenderIntent,b.vertices.push(e)):a(e);if(b.createVertices&&"OpenLayers.Geometry.MultiPoint"!=
c.CLASS_NAME)for(d=0,f=c.components.length;d<f-1;++d){e=c.components[d];var g=c.components[d+1];"OpenLayers.Geometry.Point"==e.CLASS_NAME&&"OpenLayers.Geometry.Point"==g.CLASS_NAME&&(e=b.createVirtualVertex.call(b,e,g),e.geometry.parent=c,e._index=d+1,b.virtualVertices.push(e))}}}this.vertices=[];this.virtualVertices=[];var b=this;a.call(this,this.feature.geometry);this.layer.addFeatures(this.virtualVertices,{silent:!0});this.layer.addFeatures(this.vertices,{silent:!0})},collectDragHandle:function(){var a=
this.feature.geometry,b=a.getBounds().getCenterLonLat(),b=new OpenLayers.Geometry.Point(b.lon,b.lat),c=new OpenLayers.Feature.Vector(b);b.move=function(b,c){OpenLayers.Geometry.Point.prototype.move.call(this,b,c);a.move(b,c)};c._sketch=!0;this.dragHandle=c;this.dragHandle.renderIntent=this.vertexRenderIntent;this.layer.addFeatures([this.dragHandle],{silent:!0})},collectRadiusHandle:function(){var a=this.feature.geometry,b=a.getBounds(),c=b.getCenterLonLat(),d=new OpenLayers.Geometry.Point(c.lon,c.lat),
b=new OpenLayers.Geometry.Point(b.right,b.bottom),c=new OpenLayers.Feature.Vector(b),e=this.mode&OpenLayers.Control.ModifyFeature.RESIZE,f=this.mode&OpenLayers.Control.ModifyFeature.RESHAPE,g=this.mode&OpenLayers.Control.ModifyFeature.ROTATE;b.move=function(b,c){OpenLayers.Geometry.Point.prototype.move.call(this,b,c);var h=this.x-d.x,k=this.y-d.y,q=h-b,n=k-c;g&&a.rotate(180/Math.PI*(Math.atan2(k,h)-Math.atan2(n,q)),d);if(e){var p;f?(k/=n,p=h/q/k):k=Math.sqrt(h*h+k*k)/Math.sqrt(q*q+n*n);a.resize(k,
d,p)}};c._sketch=!0;this.radiusHandle=c;this.radiusHandle.renderIntent=this.vertexRenderIntent;this.layer.addFeatures([this.radiusHandle],{silent:!0})},setMap:function(a){this.handlers.drag.setMap(a);OpenLayers.Control.prototype.setMap.apply(this,arguments)},handleMapEvents:function(a){"removelayer"!=a.type&&"order"!=a.property||this.moveLayerToTop()},moveLayerToTop:function(){var a=Math.max(this.map.Z_INDEX_BASE.Feature-1,this.layer.getZIndex())+1;this.layer.setZIndex(a)},moveLayerBack:function(){var a=
this.layer.getZIndex()-1;a>=this.map.Z_INDEX_BASE.Feature?this.layer.setZIndex(a):this.map.setLayerZIndex(this.layer,this.map.getLayerIndex(this.layer))},CLASS_NAME:"OpenLayers.Control.ModifyFeature"});OpenLayers.Control.ModifyFeature.RESHAPE=1;OpenLayers.Control.ModifyFeature.RESIZE=2;OpenLayers.Control.ModifyFeature.ROTATE=4;OpenLayers.Control.ModifyFeature.DRAG=8;OpenLayers.Handler.Feature=OpenLayers.Class(OpenLayers.Handler,{EVENTMAP:{click:{"in":"click",out:"clickout"},mousemove:{"in":"over",out:"out"},dblclick:{"in":"dblclick",out:null},mousedown:{"in":null,out:null},mouseup:{"in":null,out:null},touchstart:{"in":"click",out:"clickout"}},feature:null,lastFeature:null,down:null,up:null,clickTolerance:4,geometryTypes:null,stopClick:!0,stopDown:!0,stopUp:!1,initialize:function(a,b,c,d){OpenLayers.Handler.prototype.initialize.apply(this,[a,c,d]);this.layer=
b},touchstart:function(a){this.startTouch();return OpenLayers.Event.isMultiTouch(a)?!0:this.mousedown(a)},touchmove:function(a){OpenLayers.Event.preventDefault(a)},mousedown:function(a){if(OpenLayers.Event.isLeftClick(a)||OpenLayers.Event.isSingleTouch(a))this.down=a.xy;return this.handle(a)?!this.stopDown:!0},mouseup:function(a){this.up=a.xy;return this.handle(a)?!this.stopUp:!0},click:function(a){return this.handle(a)?!this.stopClick:!0},mousemove:function(a){if(!this.callbacks.over&&!this.callbacks.out)return!0;
this.handle(a);return!0},dblclick:function(a){return!this.handle(a)},geometryTypeMatches:function(a){return null==this.geometryTypes||-1<OpenLayers.Util.indexOf(this.geometryTypes,a.geometry.CLASS_NAME)},handle:function(a){this.feature&&!this.feature.layer&&(this.feature=null);var b=a.type,c=!1,d=!!this.feature,e="click"==b||"dblclick"==b||"touchstart"==b;(this.feature=this.layer.getFeatureFromEvent(a))&&!this.feature.layer&&(this.feature=null);this.lastFeature&&!this.lastFeature.layer&&(this.lastFeature=
null);this.feature?("touchstart"===b&&OpenLayers.Event.preventDefault(a),a=this.feature!=this.lastFeature,this.geometryTypeMatches(this.feature)?(d&&a?(this.lastFeature&&this.triggerCallback(b,"out",[this.lastFeature]),this.triggerCallback(b,"in",[this.feature])):d&&!e||this.triggerCallback(b,"in",[this.feature]),this.lastFeature=this.feature,c=!0):(this.lastFeature&&(d&&a||e)&&this.triggerCallback(b,"out",[this.lastFeature]),this.feature=null)):this.lastFeature&&(d||e)&&this.triggerCallback(b,"out",
[this.lastFeature]);return c},triggerCallback:function(a,b,c){if(b=this.EVENTMAP[a][b])"click"==a&&this.up&&this.down?(Math.sqrt(Math.pow(this.up.x-this.down.x,2)+Math.pow(this.up.y-this.down.y,2))<=this.clickTolerance&&this.callback(b,c),this.up=this.down=null):this.callback(b,c)},activate:function(){var a=!1;OpenLayers.Handler.prototype.activate.apply(this,arguments)&&(this.moveLayerToTop(),this.map.events.on({removelayer:this.handleMapEvents,changelayer:this.handleMapEvents,scope:this}),a=!0);
return a},deactivate:function(){var a=!1;OpenLayers.Handler.prototype.deactivate.apply(this,arguments)&&(this.moveLayerBack(),this.up=this.down=this.lastFeature=this.feature=null,this.map.events.un({removelayer:this.handleMapEvents,changelayer:this.handleMapEvents,scope:this}),a=!0);return a},handleMapEvents:function(a){"removelayer"!=a.type&&"order"!=a.property||this.moveLayerToTop()},moveLayerToTop:function(){var a=Math.max(this.map.Z_INDEX_BASE.Feature-1,this.layer.getZIndex())+1;this.layer.setZIndex(a)},
moveLayerBack:function(){var a=this.layer.getZIndex()-1;a>=this.map.Z_INDEX_BASE.Feature?this.layer.setZIndex(a):this.map.setLayerZIndex(this.layer,this.map.getLayerIndex(this.layer))},CLASS_NAME:"OpenLayers.Handler.Feature"});OpenLayers.Layer.Vector.RootContainer=OpenLayers.Class(OpenLayers.Layer.Vector,{displayInLayerSwitcher:!1,layers:null,display:function(){},getFeatureFromEvent:function(a){for(var b=this.layers,c,d=0;d<b.length;d++)if(c=b[d].getFeatureFromEvent(a))return c},setMap:function(a){OpenLayers.Layer.Vector.prototype.setMap.apply(this,arguments);this.collectRoots();a.events.register("changelayer",this,this.handleChangeLayer)},removeMap:function(a){a.events.unregister("changelayer",this,this.handleChangeLayer);
this.resetRoots();OpenLayers.Layer.Vector.prototype.removeMap.apply(this,arguments)},collectRoots:function(){for(var a,b=0;b<this.map.layers.length;++b)a=this.map.layers[b],-1!=OpenLayers.Util.indexOf(this.layers,a)&&a.renderer.moveRoot(this.renderer)},resetRoots:function(){for(var a,b=0;b<this.layers.length;++b)a=this.layers[b],this.renderer&&a.renderer.getRenderLayerId()==this.id&&this.renderer.moveRoot(a.renderer)},handleChangeLayer:function(a){var b=a.layer;"order"==a.property&&-1!=OpenLayers.Util.indexOf(this.layers,
b)&&(this.resetRoots(),this.collectRoots())},CLASS_NAME:"OpenLayers.Layer.Vector.RootContainer"});OpenLayers.Control.SelectFeature=OpenLayers.Class(OpenLayers.Control,{multipleKey:null,toggleKey:null,multiple:!1,clickout:!0,toggle:!1,hover:!1,highlightOnly:!1,box:!1,onBeforeSelect:function(){},onSelect:function(){},onUnselect:function(){},scope:null,geometryTypes:null,layer:null,layers:null,callbacks:null,selectStyle:null,renderIntent:"select",handlers:null,initialize:function(a,b){OpenLayers.Control.prototype.initialize.apply(this,[b]);null===this.scope&&(this.scope=this);this.initLayer(a);var c=
{click:this.clickFeature,clickout:this.clickoutFeature};this.hover&&(c.over=this.overFeature,c.out=this.outFeature);this.callbacks=OpenLayers.Util.extend(c,this.callbacks);this.handlers={feature:new OpenLayers.Handler.Feature(this,this.layer,this.callbacks,{geometryTypes:this.geometryTypes})};this.box&&(this.handlers.box=new OpenLayers.Handler.Box(this,{done:this.selectBox},{boxDivClassName:"olHandlerBoxSelectFeature"}))},initLayer:function(a){OpenLayers.Util.isArray(a)?(this.layers=a,this.layer=
new OpenLayers.Layer.Vector.RootContainer(this.id+"_container",{layers:a})):this.layer=a},destroy:function(){this.active&&this.layers&&this.map.removeLayer(this.layer);OpenLayers.Control.prototype.destroy.apply(this,arguments);this.layers&&this.layer.destroy()},activate:function(){this.active||(this.layers&&this.map.addLayer(this.layer),this.handlers.feature.activate(),this.box&&this.handlers.box&&this.handlers.box.activate());return OpenLayers.Control.prototype.activate.apply(this,arguments)},deactivate:function(){this.active&&
(this.handlers.feature.deactivate(),this.handlers.box&&this.handlers.box.deactivate(),this.layers&&this.map.removeLayer(this.layer));return OpenLayers.Control.prototype.deactivate.apply(this,arguments)},unselectAll:function(a){var b=this.layers||[this.layer],c,d,e,f;for(e=0;e<b.length;++e)if(c=b[e],f=0,null!=c.selectedFeatures)for(;c.selectedFeatures.length>f;)d=c.selectedFeatures[f],a&&a.except==d?++f:this.unselect(d)},clickFeature:function(a){this.hover||(-1<OpenLayers.Util.indexOf(a.layer.selectedFeatures,
a)?this.toggleSelect()?this.unselect(a):this.multipleSelect()||this.unselectAll({except:a}):(this.multipleSelect()||this.unselectAll({except:a}),this.select(a)))},multipleSelect:function(){return this.multiple||this.handlers.feature.evt&&this.handlers.feature.evt[this.multipleKey]},toggleSelect:function(){return this.toggle||this.handlers.feature.evt&&this.handlers.feature.evt[this.toggleKey]},clickoutFeature:function(a){!this.hover&&this.clickout&&this.unselectAll()},overFeature:function(a){var b=
a.layer;this.hover&&(this.highlightOnly?this.highlight(a):-1==OpenLayers.Util.indexOf(b.selectedFeatures,a)&&this.select(a))},outFeature:function(a){if(this.hover)if(this.highlightOnly){if(a._lastHighlighter==this.id)if(a._prevHighlighter&&a._prevHighlighter!=this.id){delete a._lastHighlighter;var b=this.map.getControl(a._prevHighlighter);b&&b.highlight(a)}else this.unhighlight(a)}else this.unselect(a)},highlight:function(a){var b=a.layer;!1!==this.events.triggerEvent("beforefeaturehighlighted",{feature:a})&&
(a._prevHighlighter=a._lastHighlighter,a._lastHighlighter=this.id,b.drawFeature(a,this.selectStyle||this.renderIntent),this.events.triggerEvent("featurehighlighted",{feature:a}))},unhighlight:function(a){var b=a.layer;void 0==a._prevHighlighter?delete a._lastHighlighter:(a._prevHighlighter!=this.id&&(a._lastHighlighter=a._prevHighlighter),delete a._prevHighlighter);b.drawFeature(a,a.style||a.layer.style||"default");this.events.triggerEvent("featureunhighlighted",{feature:a})},select:function(a){var b=
this.onBeforeSelect.call(this.scope,a),c=a.layer;!1!==b&&(b=c.events.triggerEvent("beforefeatureselected",{feature:a}),!1!==b&&(c.selectedFeatures.push(a),this.highlight(a),this.handlers.feature.lastFeature||(this.handlers.feature.lastFeature=c.selectedFeatures[0]),c.events.triggerEvent("featureselected",{feature:a}),this.onSelect.call(this.scope,a)))},unselect:function(a){var b=a.layer;this.unhighlight(a);OpenLayers.Util.removeItem(b.selectedFeatures,a);b.events.triggerEvent("featureunselected",
{feature:a});this.onUnselect.call(this.scope,a)},selectBox:function(a){if(a instanceof OpenLayers.Bounds){var b=this.map.getLonLatFromPixel({x:a.left,y:a.bottom});a=this.map.getLonLatFromPixel({x:a.right,y:a.top});b=new OpenLayers.Bounds(b.lon,b.lat,a.lon,a.lat);this.multipleSelect()||this.unselectAll();a=this.multiple;this.multiple=!0;var c=this.layers||[this.layer];this.events.triggerEvent("boxselectionstart",{layers:c});for(var d,e=0;e<c.length;++e){d=c[e];for(var f=0,g=d.features.length;f<g;++f){var h=
d.features[f];h.getVisibility()&&(null==this.geometryTypes||-1<OpenLayers.Util.indexOf(this.geometryTypes,h.geometry.CLASS_NAME))&&b.toGeometry().intersects(h.geometry)&&-1==OpenLayers.Util.indexOf(d.selectedFeatures,h)&&this.select(h)}}this.multiple=a;this.events.triggerEvent("boxselectionend",{layers:c})}},setMap:function(a){this.handlers.feature.setMap(a);this.box&&this.handlers.box.setMap(a);OpenLayers.Control.prototype.setMap.apply(this,arguments)},setLayer:function(a){var b=this.active;this.unselectAll();
this.deactivate();this.layers&&(this.layer.destroy(),this.layers=null);this.initLayer(a);this.handlers.feature.layer=this.layer;b&&this.activate()},addLayer:function(a){var b=this.active;this.deactivate();null==this.layers?null!=this.layer?(this.layers=[this.layer],this.layers.push(a)):this.layers=[a]:this.layers.push(a);this.initLayer(this.layers);this.handlers.feature.layer=this.layer;b&&this.activate()},CLASS_NAME:"OpenLayers.Control.SelectFeature"});OpenLayers.Handler.Pinch=OpenLayers.Class(OpenLayers.Handler,{started:!1,stopDown:!1,pinching:!1,last:null,start:null,touchstart:function(a){var b=!0;this.pinching=!1;if(OpenLayers.Event.isMultiTouch(a))this.started=!0,this.last=this.start={distance:this.getDistance(a.touches),delta:0,scale:1},this.callback("start",[a,this.start]),b=!this.stopDown;else{if(this.started)return!1;this.started=!1;this.last=this.start=null}OpenLayers.Event.preventDefault(a);return b},touchmove:function(a){if(this.started&&
OpenLayers.Event.isMultiTouch(a)){this.pinching=!0;var b=this.getPinchData(a);this.callback("move",[a,b]);this.last=b;OpenLayers.Event.stop(a)}else if(this.started)return!1;return!0},touchend:function(a){return this.started&&!OpenLayers.Event.isMultiTouch(a)?(this.pinching=this.started=!1,this.callback("done",[a,this.start,this.last]),this.last=this.start=null,!1):!0},activate:function(){var a=!1;OpenLayers.Handler.prototype.activate.apply(this,arguments)&&(this.pinching=!1,a=!0);return a},deactivate:function(){var a=
!1;OpenLayers.Handler.prototype.deactivate.apply(this,arguments)&&(this.pinching=this.started=!1,this.last=this.start=null,a=!0);return a},getDistance:function(a){var b=a[0];a=a[1];return Math.sqrt(Math.pow(b.olClientX-a.olClientX,2)+Math.pow(b.olClientY-a.olClientY,2))},getPinchData:function(a){a=this.getDistance(a.touches);return{distance:a,delta:this.last.distance-a,scale:a/this.start.distance}},CLASS_NAME:"OpenLayers.Handler.Pinch"});OpenLayers.Control.PinchZoom=OpenLayers.Class(OpenLayers.Control,{type:OpenLayers.Control.TYPE_TOOL,pinchOrigin:null,currentCenter:null,autoActivate:!0,preserveCenter:!1,initialize:function(a){OpenLayers.Control.prototype.initialize.apply(this,arguments);this.handler=new OpenLayers.Handler.Pinch(this,{start:this.pinchStart,move:this.pinchMove,done:this.pinchDone},this.handlerOptions)},pinchStart:function(a,b){var c=this.preserveCenter?this.map.getPixelFromLonLat(this.map.getCenter()):a.xy;this.currentCenter=
this.pinchOrigin=c},pinchMove:function(a,b){var c=b.scale,d=this.map.layerContainerOriginPx,e=this.pinchOrigin,f=this.preserveCenter?this.map.getPixelFromLonLat(this.map.getCenter()):a.xy;this.map.applyTransform(Math.round(d.x+f.x-e.x+(c-1)*(d.x-e.x)),Math.round(d.y+f.y-e.y+(c-1)*(d.y-e.y)),c);this.currentCenter=f},pinchDone:function(a,b,c){this.map.applyTransform();a=this.map.getZoomForResolution(this.map.getResolution()/c.scale,!0);if(a!==this.map.getZoom()||!this.currentCenter.equals(this.pinchOrigin)){b=
this.map.getResolutionForZoom(a);c=this.map.getLonLatFromPixel(this.pinchOrigin);var d=this.currentCenter,e=this.map.getSize();c.lon+=b*(e.w/2-d.x);c.lat-=b*(e.h/2-d.y);this.map.div.clientWidth=this.map.div.clientWidth;this.map.setCenter(c,a)}},CLASS_NAME:"OpenLayers.Control.PinchZoom"});OpenLayers.Control.TouchNavigation=OpenLayers.Class(OpenLayers.Control,{dragPan:null,dragPanOptions:null,pinchZoom:null,pinchZoomOptions:null,clickHandlerOptions:null,documentDrag:!1,autoActivate:!0,initialize:function(a){this.handlers={};OpenLayers.Control.prototype.initialize.apply(this,arguments)},destroy:function(){this.deactivate();this.dragPan&&this.dragPan.destroy();this.dragPan=null;this.pinchZoom&&(this.pinchZoom.destroy(),delete this.pinchZoom);OpenLayers.Control.prototype.destroy.apply(this,
arguments)},activate:function(){return OpenLayers.Control.prototype.activate.apply(this,arguments)?(this.dragPan.activate(),this.handlers.click.activate(),this.pinchZoom.activate(),!0):!1},deactivate:function(){return OpenLayers.Control.prototype.deactivate.apply(this,arguments)?(this.dragPan.deactivate(),this.handlers.click.deactivate(),this.pinchZoom.deactivate(),!0):!1},draw:function(){var a={click:this.defaultClick,dblclick:this.defaultDblClick},b=OpenLayers.Util.extend({"double":!0,stopDouble:!0,
pixelTolerance:2},this.clickHandlerOptions);this.handlers.click=new OpenLayers.Handler.Click(this,a,b);this.dragPan=new OpenLayers.Control.DragPan(OpenLayers.Util.extend({map:this.map,documentDrag:this.documentDrag},this.dragPanOptions));this.dragPan.draw();this.pinchZoom=new OpenLayers.Control.PinchZoom(OpenLayers.Util.extend({map:this.map},this.pinchZoomOptions))},defaultClick:function(a){a.lastTouches&&2==a.lastTouches.length&&this.map.zoomOut()},defaultDblClick:function(a){this.map.zoomTo(this.map.zoom+
1,a.xy)},CLASS_NAME:"OpenLayers.Control.TouchNavigation"});OpenLayers.Format=OpenLayers.Class({options:null,externalProjection:null,internalProjection:null,data:null,keepData:!1,initialize:function(a){OpenLayers.Util.extend(this,a);this.options=a},destroy:function(){},read:function(a){throw Error("Read not implemented.");},write:function(a){throw Error("Write not implemented.");},CLASS_NAME:"OpenLayers.Format"});OpenLayers.Format.JSON=OpenLayers.Class(OpenLayers.Format,{indent:"    ",space:" ",newline:"\n",level:0,pretty:!1,nativeJSON:function(){return!(!window.JSON||"function"!=typeof JSON.parse||"function"!=typeof JSON.stringify)}(),read:function(a,b){var c;if(this.nativeJSON)c=JSON.parse(a,b);else try{if(/^[\],:{}\s]*$/.test(a.replace(/\\["\\\/bfnrtu]/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:\s*\[)+/g,""))&&(c=eval("("+a+")"),"function"===
typeof b)){var d=function(a,c){if(c&&"object"===typeof c)for(var e in c)c.hasOwnProperty(e)&&(c[e]=d(e,c[e]));return b(a,c)};c=d("",c)}}catch(e){}this.keepData&&(this.data=c);return c},write:function(a,b){this.pretty=!!b;var c=null,d=typeof a;if(this.serialize[d])try{c=!this.pretty&&this.nativeJSON?JSON.stringify(a):this.serialize[d].apply(this,[a])}catch(e){OpenLayers.Console.error("Trouble serializing: "+e)}return c},writeIndent:function(){var a=[];if(this.pretty)for(var b=0;b<this.level;++b)a.push(this.indent);
return a.join("")},writeNewline:function(){return this.pretty?this.newline:""},writeSpace:function(){return this.pretty?this.space:""},serialize:{object:function(a){if(null==a)return"null";if(a.constructor==Date)return this.serialize.date.apply(this,[a]);if(a.constructor==Array)return this.serialize.array.apply(this,[a]);var b=["{"];this.level+=1;var c,d,e,f=!1;for(c in a)a.hasOwnProperty(c)&&(d=OpenLayers.Format.JSON.prototype.write.apply(this,[c,this.pretty]),e=OpenLayers.Format.JSON.prototype.write.apply(this,
[a[c],this.pretty]),null!=d&&null!=e&&(f&&b.push(","),b.push(this.writeNewline(),this.writeIndent(),d,":",this.writeSpace(),e),f=!0));--this.level;b.push(this.writeNewline(),this.writeIndent(),"}");return b.join("")},array:function(a){var b,c=["["];this.level+=1;for(var d=0,e=a.length;d<e;++d)b=OpenLayers.Format.JSON.prototype.write.apply(this,[a[d],this.pretty]),null!=b&&(0<d&&c.push(","),c.push(this.writeNewline(),this.writeIndent(),b));--this.level;c.push(this.writeNewline(),this.writeIndent(),
"]");return c.join("")},string:function(a){var b={"\b":"\\b","\t":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"};return/["\\\x00-\x1f]/.test(a)?'"'+a.replace(/([\x00-\x1f\\"])/g,function(a,d){var c=b[d];if(c)return c;c=d.charCodeAt();return"\\u00"+Math.floor(c/16).toString(16)+(c%16).toString(16)})+'"':'"'+a+'"'},number:function(a){return isFinite(a)?String(a):"null"},"boolean":function(a){return String(a)},date:function(a){function b(a){return 10>a?"0"+a:a}return'"'+a.getFullYear()+
"-"+b(a.getMonth()+1)+"-"+b(a.getDate())+"T"+b(a.getHours())+":"+b(a.getMinutes())+":"+b(a.getSeconds())+'"'}},CLASS_NAME:"OpenLayers.Format.JSON"});OpenLayers.Geometry.MultiLineString=OpenLayers.Class(OpenLayers.Geometry.Collection,{componentTypes:["OpenLayers.Geometry.LineString"],split:function(a,b){for(var c=null,d=b&&b.mutual,e,f,g,h,k=[],l=[a],m=0,q=this.components.length;m<q;++m){f=this.components[m];g=!1;for(var n=0;n<l.length;++n)if(e=f.split(l[n],b)){if(d){g=e[0];for(var p=0,r=g.length;p<r;++p)0===p&&k.length?k[k.length-1].addComponent(g[p]):k.push(new OpenLayers.Geometry.MultiLineString([g[p]]));g=!0;e=e[1]}if(e.length){e.unshift(n,
1);Array.prototype.splice.apply(l,e);break}}g||(k.length?k[k.length-1].addComponent(f.clone()):k=[new OpenLayers.Geometry.MultiLineString(f.clone())])}k&&1<k.length?g=!0:k=[];l&&1<l.length?h=!0:l=[];if(g||h)c=d?[k,l]:l;return c},splitWith:function(a,b){var c=null,d=b&&b.mutual,e,f,g,h,k,l;if(a instanceof OpenLayers.Geometry.LineString){l=[];k=[a];for(var m=0,q=this.components.length;m<q;++m){g=!1;f=this.components[m];for(var n=0;n<k.length;++n)if(e=k[n].split(f,b)){d&&(g=e[0],g.length&&(g.unshift(n,
1),Array.prototype.splice.apply(k,g),n+=g.length-2),e=e[1],0===e.length&&(e=[f.clone()]));g=0;for(var p=e.length;g<p;++g)0===g&&l.length?l[l.length-1].addComponent(e[g]):l.push(new OpenLayers.Geometry.MultiLineString([e[g]]));g=!0}g||(l.length?l[l.length-1].addComponent(f.clone()):l=[new OpenLayers.Geometry.MultiLineString([f.clone()])])}}else c=a.split(this);k&&1<k.length?h=!0:k=[];l&&1<l.length?g=!0:l=[];if(h||g)c=d?[k,l]:l;return c},CLASS_NAME:"OpenLayers.Geometry.MultiLineString"});OpenLayers.Geometry.MultiPolygon=OpenLayers.Class(OpenLayers.Geometry.Collection,{componentTypes:["OpenLayers.Geometry.Polygon"],CLASS_NAME:"OpenLayers.Geometry.MultiPolygon"});OpenLayers.Format.GeoJSON=OpenLayers.Class(OpenLayers.Format.JSON,{ignoreExtraDims:!1,read:function(a,b,c){b=b?b:"FeatureCollection";var d=null;c="string"==typeof a?OpenLayers.Format.JSON.prototype.read.apply(this,[a,c]):a;if(!c)OpenLayers.Console.error("Bad JSON: "+a);else if("string"!=typeof c.type)OpenLayers.Console.error("Bad GeoJSON - no type: "+a);else if(this.isValidType(c,b))switch(b){case "Geometry":try{d=this.parseGeometry(c)}catch(f){OpenLayers.Console.error(f)}break;case "Feature":try{d=
this.parseFeature(c),d.type="Feature"}catch(f){OpenLayers.Console.error(f)}break;case "FeatureCollection":switch(d=[],c.type){case "Feature":try{d.push(this.parseFeature(c))}catch(f){d=null,OpenLayers.Console.error(f)}break;case "FeatureCollection":a=0;for(b=c.features.length;a<b;++a)try{d.push(this.parseFeature(c.features[a]))}catch(f){d=null,OpenLayers.Console.error(f)}break;default:try{var e=this.parseGeometry(c);d.push(new OpenLayers.Feature.Vector(e))}catch(f){d=null,OpenLayers.Console.error(f)}}}return d},
isValidType:function(a,b){var c=!1;switch(b){case "Geometry":-1==OpenLayers.Util.indexOf("Point MultiPoint LineString MultiLineString Polygon MultiPolygon Box GeometryCollection".split(" "),a.type)?OpenLayers.Console.error("Unsupported geometry type: "+a.type):c=!0;break;case "FeatureCollection":c=!0;break;default:a.type==b?c=!0:OpenLayers.Console.error("Cannot convert types from "+a.type+" to "+b)}return c},parseFeature:function(a){var b,c,d;c=a.properties?a.properties:{};d=a.geometry&&a.geometry.bbox||
a.bbox;try{b=this.parseGeometry(a.geometry)}catch(e){throw e;}b=new OpenLayers.Feature.Vector(b,c);d&&(b.bounds=OpenLayers.Bounds.fromArray(d));a.id&&(b.fid=a.id);return b},parseGeometry:function(a){if(null==a)return null;var b,c=!1;if("GeometryCollection"==a.type){if(!OpenLayers.Util.isArray(a.geometries))throw"GeometryCollection must have geometries array: "+a;b=a.geometries.length;for(var c=Array(b),d=0;d<b;++d)c[d]=this.parseGeometry.apply(this,[a.geometries[d]]);b=new OpenLayers.Geometry.Collection(c);
c=!0}else{if(!OpenLayers.Util.isArray(a.coordinates))throw"Geometry must have coordinates array: "+a;if(!this.parseCoords[a.type.toLowerCase()])throw"Unsupported geometry type: "+a.type;try{b=this.parseCoords[a.type.toLowerCase()].apply(this,[a.coordinates])}catch(e){throw e;}}this.internalProjection&&this.externalProjection&&!c&&b.transform(this.externalProjection,this.internalProjection);return b},parseCoords:{point:function(a){if(0==this.ignoreExtraDims&&2!=a.length)throw"Only 2D points are supported: "+
a;return new OpenLayers.Geometry.Point(a[0],a[1])},multipoint:function(a){for(var b=[],c=null,d=0,e=a.length;d<e;++d){try{c=this.parseCoords.point.apply(this,[a[d]])}catch(f){throw f;}b.push(c)}return new OpenLayers.Geometry.MultiPoint(b)},linestring:function(a){for(var b=[],c=null,d=0,e=a.length;d<e;++d){try{c=this.parseCoords.point.apply(this,[a[d]])}catch(f){throw f;}b.push(c)}return new OpenLayers.Geometry.LineString(b)},multilinestring:function(a){for(var b=[],c=null,d=0,e=a.length;d<e;++d){try{c=
this.parseCoords.linestring.apply(this,[a[d]])}catch(f){throw f;}b.push(c)}return new OpenLayers.Geometry.MultiLineString(b)},polygon:function(a){for(var b=[],c,d,e=0,f=a.length;e<f;++e){try{d=this.parseCoords.linestring.apply(this,[a[e]])}catch(g){throw g;}c=new OpenLayers.Geometry.LinearRing(d.components);b.push(c)}return new OpenLayers.Geometry.Polygon(b)},multipolygon:function(a){for(var b=[],c=null,d=0,e=a.length;d<e;++d){try{c=this.parseCoords.polygon.apply(this,[a[d]])}catch(f){throw f;}b.push(c)}return new OpenLayers.Geometry.MultiPolygon(b)},
box:function(a){if(2!=a.length)throw"GeoJSON box coordinates must have 2 elements";return new OpenLayers.Geometry.Polygon([new OpenLayers.Geometry.LinearRing([new OpenLayers.Geometry.Point(a[0][0],a[0][1]),new OpenLayers.Geometry.Point(a[1][0],a[0][1]),new OpenLayers.Geometry.Point(a[1][0],a[1][1]),new OpenLayers.Geometry.Point(a[0][0],a[1][1]),new OpenLayers.Geometry.Point(a[0][0],a[0][1])])])}},write:function(a,b){var c={type:null};if(OpenLayers.Util.isArray(a)){c.type="FeatureCollection";var d=
a.length;c.features=Array(d);for(var e=0;e<d;++e){var f=a[e];if(!f instanceof OpenLayers.Feature.Vector)throw"FeatureCollection only supports collections of features: "+f;c.features[e]=this.extract.feature.apply(this,[f])}}else 0==a.CLASS_NAME.indexOf("OpenLayers.Geometry")?c=this.extract.geometry.apply(this,[a]):a instanceof OpenLayers.Feature.Vector&&(c=this.extract.feature.apply(this,[a]),a.layer&&a.layer.projection&&(c.crs=this.createCRSObject(a)));return OpenLayers.Format.JSON.prototype.write.apply(this,
[c,b])},createCRSObject:function(a){a=a.layer.projection.toString();var b={};a.match(/epsg:/i)&&(a=parseInt(a.substring(a.indexOf(":")+1)),b=4326==a?{type:"name",properties:{name:"urn:ogc:def:crs:OGC:1.3:CRS84"}}:{type:"name",properties:{name:"EPSG:"+a}});return b},extract:{feature:function(a){var b=this.extract.geometry.apply(this,[a.geometry]),b={type:"Feature",properties:a.attributes,geometry:b};null!=a.fid&&(b.id=a.fid);return b},geometry:function(a){if(null==a)return null;this.internalProjection&&
this.externalProjection&&(a=a.clone(),a.transform(this.internalProjection,this.externalProjection));var b=a.CLASS_NAME.split(".")[2];a=this.extract[b.toLowerCase()].apply(this,[a]);return"Collection"==b?{type:"GeometryCollection",geometries:a}:{type:b,coordinates:a}},point:function(a){return[a.x,a.y]},multipoint:function(a){for(var b=[],c=0,d=a.components.length;c<d;++c)b.push(this.extract.point.apply(this,[a.components[c]]));return b},linestring:function(a){for(var b=[],c=0,d=a.components.length;c<
d;++c)b.push(this.extract.point.apply(this,[a.components[c]]));return b},multilinestring:function(a){for(var b=[],c=0,d=a.components.length;c<d;++c)b.push(this.extract.linestring.apply(this,[a.components[c]]));return b},polygon:function(a){for(var b=[],c=0,d=a.components.length;c<d;++c)b.push(this.extract.linestring.apply(this,[a.components[c]]));return b},multipolygon:function(a){for(var b=[],c=0,d=a.components.length;c<d;++c)b.push(this.extract.polygon.apply(this,[a.components[c]]));return b},collection:function(a){for(var b=
a.components.length,c=Array(b),d=0;d<b;++d)c[d]=this.extract.geometry.apply(this,[a.components[d]]);return c}},CLASS_NAME:"OpenLayers.Format.GeoJSON"});OpenLayers.Date={dateRegEx:/^(?:(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?)?(?:(?:T(\d{1,2}):(\d{2}):(\d{2}(?:\.\d+)?)(Z|(?:[+-]\d{1,2}(?::(\d{2}))?)))|Z)?$/,toISOString:function(){return"toISOString"in Date.prototype?function(a){return a.toISOString()}:function(a){return isNaN(a.getTime())?"Invalid Date":a.getUTCFullYear()+"-"+OpenLayers.Number.zeroPad(a.getUTCMonth()+1,2)+"-"+OpenLayers.Number.zeroPad(a.getUTCDate(),2)+"T"+OpenLayers.Number.zeroPad(a.getUTCHours(),2)+":"+OpenLayers.Number.zeroPad(a.getUTCMinutes(),
2)+":"+OpenLayers.Number.zeroPad(a.getUTCSeconds(),2)+"."+OpenLayers.Number.zeroPad(a.getUTCMilliseconds(),3)+"Z"}}(),parse:function(a){var b;if((a=a.match(this.dateRegEx))&&(a[1]||a[7])){b=parseInt(a[1],10)||0;var c=parseInt(a[2],10)-1||0,d=parseInt(a[3],10)||1;b=new Date(Date.UTC(b,c,d));if(c=a[7]){var d=parseInt(a[4],10),e=parseInt(a[5],10),f=parseFloat(a[6]),g=f|0;b.setUTCHours(d,e,g,Math.round(1E3*(f-g)));"Z"!==c&&(c=parseInt(c,10),a=parseInt(a[8],10)||0,a=-1E3*(3600*c+60*a),b=new Date(b.getTime()+
a))}}else b=new Date("invalid");return b}};OpenLayers.Format.XML=OpenLayers.Class(OpenLayers.Format,{namespaces:null,namespaceAlias:null,defaultPrefix:null,readers:{},writers:{},xmldom:null,initialize:function(a){OpenLayers.Format.XML.supportActiveX&&(this.xmldom=new ActiveXObject("Microsoft.XMLDOM"));OpenLayers.Format.prototype.initialize.apply(this,[a]);this.namespaces=OpenLayers.Util.extend({},this.namespaces);this.namespaceAlias={};for(var b in this.namespaces)this.namespaceAlias[this.namespaces[b]]=b},destroy:function(){this.xmldom=null;
OpenLayers.Format.prototype.destroy.apply(this,arguments)},setNamespace:function(a,b){this.namespaces[a]=b;this.namespaceAlias[b]=a},read:function(a){var b=a.indexOf("<");0<b&&(a=a.substring(b));b=OpenLayers.Util.Try(OpenLayers.Function.bind(function(){var b;b=OpenLayers.Format.XML.supportActiveX&&!this.xmldom?new ActiveXObject("Microsoft.XMLDOM"):this.xmldom;b.loadXML(a);return b},this),function(){return(new DOMParser).parseFromString(a,"text/xml")},function(){var b=new XMLHttpRequest;b.open("GET",
"data:text/xml;charset=utf-8,"+encodeURIComponent(a),!1);b.overrideMimeType&&b.overrideMimeType("text/xml");b.send(null);return b.responseXML});this.keepData&&(this.data=b);return b},write:function(a){if(this.xmldom)a=a.xml;else{var b=new XMLSerializer;if(1==a.nodeType){var c=document.implementation.createDocument("","",null);c.importNode&&(a=c.importNode(a,!0));c.appendChild(a);a=b.serializeToString(c)}else a=b.serializeToString(a)}return a},createElementNS:function(a,b){return this.xmldom?"string"==
typeof a?this.xmldom.createNode(1,b,a):this.xmldom.createNode(1,b,""):document.createElementNS(a,b)},createDocumentFragment:function(){return this.xmldom?this.xmldom.createDocumentFragment():document.createDocumentFragment()},createTextNode:function(a){"string"!==typeof a&&(a=String(a));return this.xmldom?this.xmldom.createTextNode(a):document.createTextNode(a)},getElementsByTagNameNS:function(a,b,c){var d=[];if(a.getElementsByTagNameNS)d=a.getElementsByTagNameNS(b,c);else{a=a.getElementsByTagName("*");
for(var e,f,g=0,h=a.length;g<h;++g)if(e=a[g],f=e.prefix?e.prefix+":"+c:c,"*"==c||f==e.nodeName)"*"!=b&&b!=e.namespaceURI||d.push(e)}return d},getAttributeNodeNS:function(a,b,c){var d=null;if(a.getAttributeNodeNS)d=a.getAttributeNodeNS(b,c);else{a=a.attributes;for(var e,f,g=0,h=a.length;g<h;++g)if(e=a[g],e.namespaceURI==b&&(f=e.prefix?e.prefix+":"+c:c,f==e.nodeName)){d=e;break}}return d},getAttributeNS:function(a,b,c){var d="";if(a.getAttributeNS)d=a.getAttributeNS(b,c)||"";else if(a=this.getAttributeNodeNS(a,
b,c))d=a.nodeValue;return d},getChildValue:function(a,b){var c=b||"";if(a)for(var d=a.firstChild;d;d=d.nextSibling)switch(d.nodeType){case 3:case 4:c+=d.nodeValue}return c},isSimpleContent:function(a){var b=!0;for(a=a.firstChild;a;a=a.nextSibling)if(1===a.nodeType){b=!1;break}return b},contentType:function(a){var b=!1,c=!1,d=OpenLayers.Format.XML.CONTENT_TYPE.EMPTY;for(a=a.firstChild;a;a=a.nextSibling){switch(a.nodeType){case 1:c=!0;break;case 8:break;default:b=!0}if(c&&b)break}if(c&&b)d=OpenLayers.Format.XML.CONTENT_TYPE.MIXED;
else{if(c)return OpenLayers.Format.XML.CONTENT_TYPE.COMPLEX;if(b)return OpenLayers.Format.XML.CONTENT_TYPE.SIMPLE}return d},hasAttributeNS:function(a,b,c){return a.hasAttributeNS?a.hasAttributeNS(b,c):!!this.getAttributeNodeNS(a,b,c)},setAttributeNS:function(a,b,c,d){if(a.setAttributeNS)a.setAttributeNS(b,c,d);else if(this.xmldom)b?(b=a.ownerDocument.createNode(2,c,b),b.nodeValue=d,a.setAttributeNode(b)):a.setAttribute(c,d);else throw"setAttributeNS not implemented";},createElementNSPlus:function(a,
b){b=b||{};var c=b.uri||this.namespaces[b.prefix];c||(c=a.indexOf(":"),c=this.namespaces[a.substring(0,c)]);c||(c=this.namespaces[this.defaultPrefix]);c=this.createElementNS(c,a);b.attributes&&this.setAttributes(c,b.attributes);var d=b.value;null!=d&&c.appendChild(this.createTextNode(d));return c},setAttributes:function(a,b){var c,d,e;for(e in b)null!=b[e]&&b[e].toString&&(c=b[e].toString(),d=this.namespaces[e.substring(0,e.indexOf(":"))]||null,this.setAttributeNS(a,d,e,c))},getFirstElementChild:function(a){if(a.firstElementChild)return a.firstElementChild;
for(a=a.firstChild;1!=a.nodeType&&(a=a.nextSibling););return a},readNode:function(a,b){b||(b={});var c=this.readers[a.namespaceURI?this.namespaceAlias[a.namespaceURI]:this.defaultPrefix];if(c){var d=a.localName||a.nodeName.split(":").pop();(c=c[d]||c["*"])&&c.apply(this,[a,b])}return b},readChildNodes:function(a,b){b||(b={});for(var c=a.childNodes,d,e=0,f=c.length;e<f;++e)d=c[e],1==d.nodeType&&this.readNode(d,b);return b},writeNode:function(a,b,c){var d,e=a.indexOf(":");0<e?(d=a.substring(0,e),a=
a.substring(e+1)):d=c?this.namespaceAlias[c.namespaceURI]:this.defaultPrefix;b=this.writers[d][a].apply(this,[b]);c&&c.appendChild(b);return b},getChildEl:function(a,b,c){return a&&this.getThisOrNextEl(a.firstChild,b,c)},getNextEl:function(a,b,c){return a&&this.getThisOrNextEl(a.nextSibling,b,c)},getThisOrNextEl:function(a,b,c){a:for(;a;a=a.nextSibling)switch(a.nodeType){case 1:if(!(b&&b!==(a.localName||a.nodeName.split(":").pop())||c&&c!==a.namespaceURI))break a;a=null;break a;case 3:if(/^\s*$/.test(a.nodeValue))break;
case 4:case 6:case 12:case 10:case 11:a=null;break a}return a||null},lookupNamespaceURI:function(a,b){var c=null;if(a)if(a.lookupNamespaceURI)c=a.lookupNamespaceURI(b);else a:switch(a.nodeType){case 1:if(null!==a.namespaceURI&&a.prefix===b){c=a.namespaceURI;break a}if(c=a.attributes.length)for(var d,e=0;e<c;++e)if(d=a.attributes[e],"xmlns"===d.prefix&&d.name==="xmlns:"+b){c=d.value||null;break a}else if("xmlns"===d.name&&null===b){c=d.value||null;break a}c=this.lookupNamespaceURI(a.parentNode,b);
break a;case 2:c=this.lookupNamespaceURI(a.ownerElement,b);break a;case 9:c=this.lookupNamespaceURI(a.documentElement,b);break a;case 6:case 12:case 10:case 11:break a;default:c=this.lookupNamespaceURI(a.parentNode,b)}return c},getXMLDoc:function(){OpenLayers.Format.XML.document||this.xmldom||(document.implementation&&document.implementation.createDocument?OpenLayers.Format.XML.document=document.implementation.createDocument("","",null):!this.xmldom&&OpenLayers.Format.XML.supportActiveX&&(this.xmldom=
new ActiveXObject("Microsoft.XMLDOM")));return OpenLayers.Format.XML.document||this.xmldom},CLASS_NAME:"OpenLayers.Format.XML"});OpenLayers.Format.XML.CONTENT_TYPE={EMPTY:0,SIMPLE:1,COMPLEX:2,MIXED:3};OpenLayers.Format.XML.lookupNamespaceURI=OpenLayers.Function.bind(OpenLayers.Format.XML.prototype.lookupNamespaceURI,OpenLayers.Format.XML.prototype);OpenLayers.Format.XML.document=null;
OpenLayers.Format.XML.supportActiveX=function(){return Object.getOwnPropertyDescriptor&&Object.getOwnPropertyDescriptor(window,"ActiveXObject")||"ActiveXObject"in window}();OpenLayers.Format.KML=OpenLayers.Class(OpenLayers.Format.XML,{namespaces:{kml:"http://www.opengis.net/kml/2.2",gx:"http://www.google.com/kml/ext/2.2"},kmlns:"http://earth.google.com/kml/2.0",placemarksDesc:"No description available",foldersName:"OpenLayers export",foldersDesc:"Exported on "+new Date,extractAttributes:!0,kvpAttributes:!1,extractStyles:!1,extractTracks:!1,trackAttributes:null,internalns:null,features:null,styles:null,styleBaseUrl:"",fetched:null,maxDepth:0,initialize:function(a){this.regExes=
{trimSpace:/^\s*|\s*$/g,removeSpace:/\s*/g,splitSpace:/\s+/,trimComma:/\s*,\s*/g,kmlColor:/(\w{2})(\w{2})(\w{2})(\w{2})/,kmlIconPalette:/root:\/\/icons\/palette-(\d+)(\.\w+)/,straightBracket:/\$\[(.*?)\]/g};this.externalProjection=new OpenLayers.Projection("EPSG:4326");OpenLayers.Format.XML.prototype.initialize.apply(this,[a])},read:function(a){this.features=[];this.styles={};this.fetched={};return this.parseData(a,{depth:0,styleBaseUrl:this.styleBaseUrl})},parseData:function(a,b){"string"==typeof a&&
(a=OpenLayers.Format.XML.prototype.read.apply(this,[a]));for(var c=["Link","NetworkLink","Style","StyleMap","Placemark"],d=0,e=c.length;d<e;++d){var f=c[d],g=this.getElementsByTagNameNS(a,"*",f);if(0!=g.length)switch(f.toLowerCase()){case "link":case "networklink":this.parseLinks(g,b);break;case "style":this.extractStyles&&this.parseStyles(g,b);break;case "stylemap":this.extractStyles&&this.parseStyleMaps(g,b);break;case "placemark":this.parseFeatures(g,b)}}return this.features},parseLinks:function(a,
b){if(b.depth>=this.maxDepth)return!1;var c=OpenLayers.Util.extend({},b);c.depth++;for(var d=0,e=a.length;d<e;d++){var f=this.parseProperty(a[d],"*","href");f&&!this.fetched[f]&&(this.fetched[f]=!0,(f=this.fetchLink(f))&&this.parseData(f,c))}},fetchLink:function(a){if(a=OpenLayers.Request.GET({url:a,async:!1}))return a.responseText},parseStyles:function(a,b){for(var c=0,d=a.length;c<d;c++){var e=this.parseStyle(a[c]);e&&(this.styles[(b.styleBaseUrl||"")+"#"+e.id]=e)}},parseKmlColor:function(a){var b=
null;a&&(a=a.match(this.regExes.kmlColor))&&(b={color:"#"+a[4]+a[3]+a[2],opacity:parseInt(a[1],16)/255});return b},parseStyle:function(a){for(var b={},c=["LineStyle","PolyStyle","IconStyle","BalloonStyle","LabelStyle"],d,e,f=0,g=c.length;f<g;++f)if(d=c[f],e=this.getElementsByTagNameNS(a,"*",d)[0])switch(d.toLowerCase()){case "linestyle":d=this.parseProperty(e,"*","color");if(d=this.parseKmlColor(d))b.strokeColor=d.color,b.strokeOpacity=d.opacity;(d=this.parseProperty(e,"*","width"))&&(b.strokeWidth=
d);break;case "polystyle":d=this.parseProperty(e,"*","color");if(d=this.parseKmlColor(d))b.fillOpacity=d.opacity,b.fillColor=d.color;"0"==this.parseProperty(e,"*","fill")&&(b.fillColor="none");"0"==this.parseProperty(e,"*","outline")&&(b.strokeWidth="0");break;case "iconstyle":var h=parseFloat(this.parseProperty(e,"*","scale")||1);d=32*h;var k=32*h,l=this.getElementsByTagNameNS(e,"*","Icon")[0];if(l){var m=this.parseProperty(l,"*","href");if(m){var q=this.parseProperty(l,"*","w"),n=this.parseProperty(l,
"*","h");!OpenLayers.String.startsWith(m,"http://maps.google.com/mapfiles/kml")||q||n||(n=q=64,h/=2);q=q||n;n=n||q;q&&(d=parseInt(q)*h);n&&(k=parseInt(n)*h);if(n=m.match(this.regExes.kmlIconPalette))q=n[1],n=n[2],m=this.parseProperty(l,"*","x"),l=this.parseProperty(l,"*","y"),m="http://maps.google.com/mapfiles/kml/pal"+q+"/icon"+(8*(l?7-l/32:7)+(m?m/32:0))+n;b.graphicOpacity=1;b.externalGraphic=m}}if(e=this.getElementsByTagNameNS(e,"*","hotSpot")[0])m=parseFloat(e.getAttribute("x")),l=parseFloat(e.getAttribute("y")),
q=e.getAttribute("xunits"),"pixels"==q?b.graphicXOffset=-m*h:"insetPixels"==q?b.graphicXOffset=-d+m*h:"fraction"==q&&(b.graphicXOffset=-d*m),e=e.getAttribute("yunits"),"pixels"==e?b.graphicYOffset=-k+l*h+1:"insetPixels"==e?b.graphicYOffset=-(l*h)+1:"fraction"==e&&(b.graphicYOffset=-k*(1-l)+1);b.graphicWidth=d;b.graphicHeight=k;break;case "balloonstyle":(e=OpenLayers.Util.getXmlNodeValue(e))&&(b.balloonStyle=e.replace(this.regExes.straightBracket,"${$1}"));break;case "labelstyle":if(d=this.parseProperty(e,
"*","color"),d=this.parseKmlColor(d))b.fontColor=d.color,b.fontOpacity=d.opacity}!b.strokeColor&&b.fillColor&&(b.strokeColor=b.fillColor);(a=a.getAttribute("id"))&&b&&(b.id=a);return b},parseStyleMaps:function(a,b){for(var c=0,d=a.length;c<d;c++)for(var e=a[c],f=this.getElementsByTagNameNS(e,"*","Pair"),e=e.getAttribute("id"),g=0,h=f.length;g<h;g++){var k=f[g],l=this.parseProperty(k,"*","key");(k=this.parseProperty(k,"*","styleUrl"))&&"normal"==l&&(this.styles[(b.styleBaseUrl||"")+"#"+e]=this.styles[(b.styleBaseUrl||
"")+k])}},parseFeatures:function(a,b){for(var c=[],d=0,e=a.length;d<e;d++){var f=a[d],g=this.parseFeature.apply(this,[f]);if(g){this.extractStyles&&g.attributes&&g.attributes.styleUrl&&(g.style=this.getStyle(g.attributes.styleUrl,b));if(this.extractStyles){var h=this.getElementsByTagNameNS(f,"*","Style")[0];h&&(h=this.parseStyle(h))&&(g.style=OpenLayers.Util.extend(g.style,h))}this.extractTracks?(f=this.getElementsByTagNameNS(f,this.namespaces.gx,"Track"))&&0<f.length&&(g={features:[],feature:g},
this.readNode(f[0],g),0<g.features.length&&c.push.apply(c,g.features)):c.push(g)}else throw"Bad Placemark: "+d;}this.features=this.features.concat(c)},readers:{kml:{when:function(a,b){b.whens.push(OpenLayers.Date.parse(this.getChildValue(a)))},_trackPointAttribute:function(a,b){var c=a.nodeName.split(":").pop();b.attributes[c].push(this.getChildValue(a))}},gx:{Track:function(a,b){var c={whens:[],points:[],angles:[]};if(this.trackAttributes){var d;c.attributes={};for(var e=0,f=this.trackAttributes.length;e<
f;++e)d=this.trackAttributes[e],c.attributes[d]=[],d in this.readers.kml||(this.readers.kml[d]=this.readers.kml._trackPointAttribute)}this.readChildNodes(a,c);if(c.whens.length!==c.points.length)throw Error("gx:Track with unequal number of when ("+c.whens.length+") and gx:coord ("+c.points.length+") elements.");var g=0<c.angles.length;if(g&&c.whens.length!==c.angles.length)throw Error("gx:Track with unequal number of when ("+c.whens.length+") and gx:angles ("+c.angles.length+") elements.");for(var h,
e=0,f=c.whens.length;e<f;++e){h=b.feature.clone();h.fid=b.feature.fid||b.feature.id;d=c.points[e];h.geometry=d;"z"in d&&(h.attributes.altitude=d.z);this.internalProjection&&this.externalProjection&&h.geometry.transform(this.externalProjection,this.internalProjection);if(this.trackAttributes)for(var k=0,l=this.trackAttributes.length;k<l;++k)d=this.trackAttributes[k],h.attributes[d]=c.attributes[d][e];h.attributes.when=c.whens[e];h.attributes.trackId=b.feature.id;g&&(d=c.angles[e],h.attributes.heading=
parseFloat(d[0]),h.attributes.tilt=parseFloat(d[1]),h.attributes.roll=parseFloat(d[2]));b.features.push(h)}},coord:function(a,b){var c=this.getChildValue(a).replace(this.regExes.trimSpace,"").split(/\s+/),d=new OpenLayers.Geometry.Point(c[0],c[1]);2<c.length&&(d.z=parseFloat(c[2]));b.points.push(d)},angles:function(a,b){var c=this.getChildValue(a).replace(this.regExes.trimSpace,"").split(/\s+/);b.angles.push(c)}}},parseFeature:function(a){for(var b=["MultiGeometry","Polygon","LineString","Point"],
c,d,e,f=0,g=b.length;f<g;++f)if(c=b[f],this.internalns=a.namespaceURI?a.namespaceURI:this.kmlns,d=this.getElementsByTagNameNS(a,this.internalns,c),0<d.length){if(b=this.parseGeometry[c.toLowerCase()])e=b.apply(this,[d[0]]),this.internalProjection&&this.externalProjection&&e.transform(this.externalProjection,this.internalProjection);else throw new TypeError("Unsupported geometry type: "+c);break}var h;this.extractAttributes&&(h=this.parseAttributes(a));c=new OpenLayers.Feature.Vector(e,h);a=a.getAttribute("id")||
a.getAttribute("name");null!=a&&(c.fid=a);return c},getStyle:function(a,b){var c=OpenLayers.Util.removeTail(a),d=OpenLayers.Util.extend({},b);d.depth++;d.styleBaseUrl=c;!this.styles[a]&&!OpenLayers.String.startsWith(a,"#")&&d.depth<=this.maxDepth&&!this.fetched[c]&&(c=this.fetchLink(c))&&this.parseData(c,d);return OpenLayers.Util.extend({},this.styles[a])},parseGeometry:{point:function(a){a=this.getElementsByTagNameNS(a,this.internalns,"coordinates");var b=[];if(0<a.length)var c=a[0].firstChild.nodeValue,
c=c.replace(this.regExes.removeSpace,""),b=c.split(",");if(1<b.length)2==b.length&&(b[2]=null),c=new OpenLayers.Geometry.Point(b[0],b[1],b[2]);else throw"Bad coordinate string: "+c;return c},linestring:function(a,b){var c=this.getElementsByTagNameNS(a,this.internalns,"coordinates"),d=null;if(0<c.length){for(var c=this.getChildValue(c[0]),c=c.replace(this.regExes.trimSpace,""),c=c.replace(this.regExes.trimComma,","),d=c.split(this.regExes.splitSpace),e=d.length,f=Array(e),g,h,k=0;k<e;++k)if(g=d[k].split(","),
h=g.length,1<h)2==g.length&&(g[2]=null),f[k]=new OpenLayers.Geometry.Point(g[0],g[1],g[2]);else throw"Bad LineString point coordinates: "+d[k];if(e)d=b?new OpenLayers.Geometry.LinearRing(f):new OpenLayers.Geometry.LineString(f);else throw"Bad LineString coordinates: "+c;}return d},polygon:function(a){a=this.getElementsByTagNameNS(a,this.internalns,"LinearRing");var b=a.length,c=Array(b);if(0<b)for(var d=0,e=a.length;d<e;++d)if(b=this.parseGeometry.linestring.apply(this,[a[d],!0]))c[d]=b;else throw"Bad LinearRing geometry: "+
d;return new OpenLayers.Geometry.Polygon(c)},multigeometry:function(a){for(var b,c=[],d=a.childNodes,e=0,f=d.length;e<f;++e)a=d[e],1==a.nodeType&&(b=a.prefix?a.nodeName.split(":")[1]:a.nodeName,(b=this.parseGeometry[b.toLowerCase()])&&c.push(b.apply(this,[a])));return new OpenLayers.Geometry.Collection(c)}},parseAttributes:function(a){var b={},c=a.getElementsByTagName("ExtendedData");c.length&&(b=this.parseExtendedData(c[0]));var d,e,f;a=a.childNodes;for(var c=0,g=a.length;c<g;++c)if(d=a[c],1==d.nodeType&&
(e=d.childNodes,1<=e.length&&3>=e.length)){switch(e.length){case 1:f=e[0];break;case 2:f=e[0];e=e[1];f=3==f.nodeType||4==f.nodeType?f:e;break;default:f=e[1]}if(3==f.nodeType||4==f.nodeType)if(d=d.prefix?d.nodeName.split(":")[1]:d.nodeName,f=OpenLayers.Util.getXmlNodeValue(f))f=f.replace(this.regExes.trimSpace,""),b[d]=f}return b},parseExtendedData:function(a){var b={},c,d,e,f,g=a.getElementsByTagName("Data");c=0;for(d=g.length;c<d;c++){e=g[c];f=e.getAttribute("name");var h={},k=e.getElementsByTagName("value");
k.length&&(h.value=this.getChildValue(k[0]));this.kvpAttributes?b[f]=h.value:(e=e.getElementsByTagName("displayName"),e.length&&(h.displayName=this.getChildValue(e[0])),b[f]=h)}a=a.getElementsByTagName("SimpleData");c=0;for(d=a.length;c<d;c++)h={},e=a[c],f=e.getAttribute("name"),h.value=this.getChildValue(e),this.kvpAttributes?b[f]=h.value:(h.displayName=f,b[f]=h);return b},parseProperty:function(a,b,c){var d;a=this.getElementsByTagNameNS(a,b,c);try{d=OpenLayers.Util.getXmlNodeValue(a[0])}catch(e){d=
null}return d},write:function(a){OpenLayers.Util.isArray(a)||(a=[a]);for(var b=this.createElementNS(this.kmlns,"kml"),c=this.createFolderXML(),d=0,e=a.length;d<e;++d)c.appendChild(this.createPlacemarkXML(a[d]));b.appendChild(c);return OpenLayers.Format.XML.prototype.write.apply(this,[b])},createFolderXML:function(){var a=this.createElementNS(this.kmlns,"Folder");if(this.foldersName){var b=this.createElementNS(this.kmlns,"name"),c=this.createTextNode(this.foldersName);b.appendChild(c);a.appendChild(b)}this.foldersDesc&&
(b=this.createElementNS(this.kmlns,"description"),c=this.createTextNode(this.foldersDesc),b.appendChild(c),a.appendChild(b));return a},createPlacemarkXML:function(a){var b=this.createElementNS(this.kmlns,"name"),c=a.style&&a.style.label?a.style.label:a.id;b.appendChild(this.createTextNode(a.attributes.name||c));var d=this.createElementNS(this.kmlns,"description");d.appendChild(this.createTextNode(a.attributes.description||this.placemarksDesc));c=this.createElementNS(this.kmlns,"Placemark");null!=
a.fid&&c.setAttribute("id",a.fid);c.appendChild(b);c.appendChild(d);a.attributes&&(b=this.buildExtendedData(a.attributes))&&c.appendChild(b);a=this.buildGeometryNode(a.geometry);c.appendChild(a);return c},buildGeometryNode:function(a){var b=a.CLASS_NAME,b=b.substring(b.lastIndexOf(".")+1),b=this.buildGeometry[b.toLowerCase()],c=null;b&&(c=b.apply(this,[a]));return c},buildGeometry:{point:function(a){var b=this.createElementNS(this.kmlns,"Point");b.appendChild(this.buildCoordinatesNode(a));return b},
multipoint:function(a){return this.buildGeometry.collection.apply(this,[a])},linestring:function(a){var b=this.createElementNS(this.kmlns,"LineString");b.appendChild(this.buildCoordinatesNode(a));return b},multilinestring:function(a){return this.buildGeometry.collection.apply(this,[a])},linearring:function(a){var b=this.createElementNS(this.kmlns,"LinearRing");b.appendChild(this.buildCoordinatesNode(a));return b},polygon:function(a){var b=this.createElementNS(this.kmlns,"Polygon");a=a.components;
for(var c,d,e=0,f=a.length;e<f;++e)c=0==e?"outerBoundaryIs":"innerBoundaryIs",c=this.createElementNS(this.kmlns,c),d=this.buildGeometry.linearring.apply(this,[a[e]]),c.appendChild(d),b.appendChild(c);return b},multipolygon:function(a){return this.buildGeometry.collection.apply(this,[a])},collection:function(a){for(var b=this.createElementNS(this.kmlns,"MultiGeometry"),c,d=0,e=a.components.length;d<e;++d)(c=this.buildGeometryNode.apply(this,[a.components[d]]))&&b.appendChild(c);return b}},buildCoordinatesNode:function(a){var b=
this.createElementNS(this.kmlns,"coordinates"),c;if(c=a.components){for(var d=c.length,e=Array(d),f=0;f<d;++f)a=c[f],e[f]=this.buildCoordinates(a);c=e.join(" ")}else c=this.buildCoordinates(a);c=this.createTextNode(c);b.appendChild(c);return b},buildCoordinates:function(a){this.internalProjection&&this.externalProjection&&(a=a.clone(),a.transform(this.internalProjection,this.externalProjection));return a.x+","+a.y},buildExtendedData:function(a){var b=this.createElementNS(this.kmlns,"ExtendedData"),
c;for(c in a)if(a[c]&&"name"!=c&&"description"!=c&&"styleUrl"!=c){var d=this.createElementNS(this.kmlns,"Data");d.setAttribute("name",c);var e=this.createElementNS(this.kmlns,"value");if("object"==typeof a[c]){if(a[c].value&&e.appendChild(this.createTextNode(a[c].value)),a[c].displayName){var f=this.createElementNS(this.kmlns,"displayName");f.appendChild(this.getXMLDoc().createCDATASection(a[c].displayName));d.appendChild(f)}}else e.appendChild(this.createTextNode(a[c]));d.appendChild(e);b.appendChild(d)}return this.isSimpleContent(b)?
null:b},CLASS_NAME:"OpenLayers.Format.KML"});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],43:[function(require,module,exports){
/*!
 * ==========================================================
 *  COLOR PICKER PLUGIN 1.1.0
 * ==========================================================
 * Author: Taufik Nurrohman <http://latitudu.com>
 * License: MIT
 * ----------------------------------------------------------
 */

var CP = function(target, how) {

    var w = window,
        d = document,
        r = this,
        _ = false,
        hooks = {},
        picker = d.createElement('div');

    function isset(x) {
        return typeof x !== "undefined";
    }

    function edge(a, b, c) {
        if (a < b) return b;
        if (a > c) return c;
        return a;
    }

    // trigger color picker panel on click by default
    if (!isset(how)) {
        how = ["mousedown", "touchstart"];
    }

    // [h, s, v] ... 0 <= h, s, v <= 1
    function HSV2RGB(a) {
        var h = +a[0],
            s = +a[1],
            v = +a[2],
            r, g, b, i, f, p, q, t;
        i = Math.floor(h * 6);
        f = h * 6 - i;
        p = v * (1 - s);
        q = v * (1 - f * s);
        t = v * (1 - (1 - f) * s);
        if (isNaN(i)) i = 0;
        if (isNaN(q)) q = 0;
        if (isNaN(t)) t = 0;
        switch (i % 6) {
            case 0:
                r = v, g = t, b = p;
                break;
            case 1:
                r = q, g = v, b = p;
                break;
            case 2:
                r = p, g = v, b = t;
                break;
            case 3:
                r = p, g = q, b = v;
                break;
            case 4:
                r = t, g = p, b = v;
                break;
            case 5:
                r = v, g = p, b = q;
                break;
        }
        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }

    function HSV2HEX(a) {
        return RGB2HEX(HSV2RGB(a));
    }

    // [r, g, b] ... 0 <= r, g, b <= 255
    function RGB2HSV(a) {
        var r = +a[0],
            g = +a[1],
            b = +a[2],
            max = Math.max(r, g, b),
            min = Math.min(r, g, b),
            d = max - min,
            h, s = (max === 0 ? 0 : d / max),
            v = max / 255;
        switch (max) {
            case min:
                h = 0;
                break;
            case r:
                h = (g - b) + d * (g < b ? 6 : 0);
                h /= 6 * d;
                break;
            case g:
                h = (b - r) + d * 2;
                h /= 6 * d;
                break;
            case b:
                h = (r - g) + d * 4;
                h /= 6 * d;
                break;
        }
        return [h, s, v];
    }

    function RGB2HEX(a) {
        var s = +a[2] | (+a[1] << 8) | (+a[0] << 16);
        s = '000000' + s.toString(16);
        return s.slice(-6);
    }

    // rrggbb or rgb
    function HEX2HSV(s) {
        return RGB2HSV(HEX2RGB(s));
    }

    function HEX2RGB(s) {
        if (s.length === 3) {
            s = s.replace(/./g, '$&$&');
        }
        return [parseInt(s[0] + s[1], 16), parseInt(s[2] + s[3], 16), parseInt(s[4] + s[5], 16)];
    }

    // convert range from `0` to `360` and `0` to `100` in color into range from `0` to `1`
    function _2HSV_pri(a) {
        return [+a[0] / 360, +a[1] / 100, +a[2] / 100];
    }

    // convert range from `0` to `1` into `0` to `360` and `0` to `100` in color
    function _2HSV_pub(a) {
        return [Math.round(+a[0] * 360), Math.round(+a[1] * 100), Math.round(+a[2] * 100)];
    }

    // *
    r.parse = function(x) {
        if (typeof x === "object") return x;
        var rgb = /\s*rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)\s*$/i.exec(x),
            hsv = /\s*hsv\s*\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)\s*$/i.exec(x),
            hex = x[0] === '#' && x.match(/^#([\da-f]{3}|[\da-f]{6})$/);
        if (hex) {
            return HEX2HSV(x.slice(1));
        } else if (hsv) {
            return _2HSV_pri([+hsv[1], +hsv[2], +hsv[3]]);
        } else if (rgb) {
            return RGB2HSV([+rgb[1], +rgb[2], +rgb[3]]);
        }
        return [0, 1, 1]; // default is red
    };

    // add event
    function on(ev, el, fn) {
        return el.addEventListener(ev, fn, false);
    }

    // remove event
    function off(ev, el, fn) {
        return el.removeEventListener(ev, fn);
    }

    // get mouse/finger coordinate
    function point(el, e) {
        var x = !!e.touches ? e.touches[0].pageX : e.pageX,
            y = !!e.touches ? e.touches[0].pageY : e.pageY,
            left = offset(el).l,
            top = offset(el).t;
        while (el = el.offsetParent) {
            left += offset(el).l;
            top += offset(el).t;
        }
        return {
            x: x - left,
            y: y - top
        };
    }

    // get position
    function offset(el) {
        return {
            l: el.offsetLeft,
            t: el.offsetTop
        };
    }

    // get closest parent
    function closest(a, b) {
        while ((a = a.parentElement) && a !== b);
        return a;
    }

    // prevent default
    function prevent(e) {
        if (e) e.preventDefault();
    }

    // get dimension
    function size(el) {
        return {
            w: el.offsetWidth,
            h: el.offsetHeight
        };
    }

    // get color data
    function get_data(a) {
        return _ || (isset(a) ? a : false);
    }

    // set color data
    function set_data(a) {
        _ = a;
    }

    // add hook
    function add(ev, fn, id) {
        if (!isset(ev)) return hooks;
        if (!isset(fn)) return hooks[ev];
        if (!isset(hooks[ev])) hooks[ev] = {};
        if (!isset(id)) id = Object.keys(hooks[ev]).length;
        return hooks[ev][id] = fn, r;
    }

    // remove hook
    function remove(ev, id) {
        if (!isset(ev)) return hooks = {}, r;
        if (!isset(id)) return hooks[ev] = {}, r;
        return delete hooks[ev][id], r;
    }

    // trigger hook
    function trigger(ev, a, id) {
        if (!isset(hooks[ev])) return r;
        if (!isset(id)) {
            for (var i in hooks[ev]) {
                hooks[ev][i].apply(r, a);
            }
        } else {
            if (isset(hooks[ev][id])) {
                hooks[ev][id].apply(r, a);
            }
        }
        return r;
    }

    // initialize data ...
    set_data(r.parse(target.getAttribute('data-color') || target.value || [0, 1, 1]));

    // generate color picker pane ...
    picker.className = 'color-picker';
    picker.innerHTML = '<div class="color-picker-control"><span class="color-picker-h"><i></i></span><span class="color-picker-sv"><i></i></span></div>';
    var b = d.body,
        h = d.documentElement,
        c = picker.firstChild.children,
        HSV = get_data([0, 1, 1]), // default is red
        H = c[0],
        SV = c[1],
        H_point = H.firstChild,
        SV_point = SV.firstChild,
        start_H = false,
        start_SV = false,
        drag_H = false,
        drag_SV = false,
        left = 0,
        top = 0,
        P_W = 0,
        P_H = 0,
        v = HSV2HEX(HSV),
        set, exit;

    // on update ...
    function trigger_(k, x) {
        if (!k || k === "h") {
            trigger("change:h", x);
        }
        if (!k || k === "sv") {
            trigger("change:sv", x);
        }
        trigger("change", x);
    }

    // delay
    function delay(fn, t) {
        return w.setTimeout(fn, t);
    }

    // is visible?
    function visible() {
        return picker.parentNode;
    }

    // fit to window
    function fit() {
        var w_W = /* w.innerWidth */ size(h).w,
            w_H = w.innerHeight,
            w_L = Math.max(b.scrollLeft, h.scrollLeft),
            w_T = Math.max(b.scrollTop, h.scrollTop),
            width = w_W + w_L,
            height = w_H + w_T;
        left = offset(target).l;
        top = offset(target).t + size(target).h;
        if (left + P_W > width) {
            left = width - P_W;
        }
        if (top + P_H > height) {
            top = height - P_H;
        }
        picker.style.left = left + 'px';
        picker.style.top = top + 'px';
        return trigger("fit", [r]), r;
    };

    // create
    function create(first, bucket) {
        if (!first) {
            (bucket || b).appendChild(picker), r.visible = true;
        }
        P_W = size(picker).w;
        P_H = size(picker).h;
        var H_H = size(H).h,
            SV_W = size(SV).w,
            SV_H = size(SV).h,
            H_point_H = size(H_point).h,
            SV_point_W = size(SV_point).w,
            SV_point_H = size(SV_point).h;
        if (first) {
            picker.style.left = '-9999px';
            picker.style.top = '-9999px';
            function click(e) {
                var t = e.target,
                    is_target = t === target || closest(t, target) === target;
                if (is_target) {
                    create();
                } else {
                    exit();
                }
                trigger(is_target ? "enter" : "exit", [r]);
            }
            if (how !== false) {
                var i = how.length;
                while (i--) on(how[i], target, click);
            }
            r.create = function() {
                return create(1), trigger("create", [r]), r;
            };
            r.destroy = function() {
                if (how !== false) {
                    var i = how.length;
                    while (i--) off(how[i], target, click);
                }
                exit(), set_data(false);
                return trigger("destroy", [r]), r;
            };
        } else {
            fit();
        }
        set = function() {
            HSV = get_data(HSV), color();
            H_point.style.top = (H_H - (H_point_H / 2) - (H_H * +HSV[0])) + 'px';
            SV_point.style.right = (SV_W - (SV_point_W / 2) - (SV_W * +HSV[1])) + 'px';
            SV_point.style.top = (SV_H - (SV_point_H / 2) - (SV_H * +HSV[2])) + 'px';
        };
        exit = function(e) {
            if (visible()) {
                visible().removeChild(picker);
                r.visible = false;
            }
            off("touchstart", H, down_H);
            off("mousedown", H, down_H);
            off("touchstart", SV, down_SV);
            off("mousedown", SV, down_SV);
            off("touchmove", d, move);
            off("mousemove", d, move);
            off("touchend", d, stop);
            off("mouseup", d, stop);
            off("resize", w, fit);
            return r;
        };
        function color(e) {
            var a = HSV2RGB(HSV),
                b = HSV2RGB([HSV[0], 1, 1]);
            SV.style.backgroundColor = 'rgb(' + b.join(',') + ')';
            set_data(HSV);
            prevent(e);
        };
        set();
        function do_H(e) {
            var y = edge(point(H, e).y, 0, H_H);
            HSV[0] = (H_H - y) / H_H;
            H_point.style.top = (y - (H_point_H / 2)) + 'px';
            color(e);
        }
        function do_SV(e) {
            var o = point(SV, e),
                x = edge(o.x, 0, SV_W),
                y = edge(o.y, 0, SV_H);
            HSV[1] = 1 - ((SV_W - x) / SV_W);
            HSV[2] = (SV_H - y) / SV_H;
            SV_point.style.right = (SV_W - x - (SV_point_W / 2)) + 'px';
            SV_point.style.top = (y - (SV_point_H / 2)) + 'px';
            color(e);
        }
        function move(e) {
            if (drag_H) {
                do_H(e), v = HSV2HEX(HSV);
                if (!start_H) {
                    trigger("drag:h", [v, r]);
                    trigger("drag", [v, r]);
                    trigger_("h", [v, r]);
                }
            }
            if (drag_SV) {
                do_SV(e), v = HSV2HEX(HSV);
                if (!start_SV) {
                    trigger("drag:sv", [v, r]);
                    trigger("drag", [v, r]);
                    trigger_("sv", [v, r]);
                }
            }
            start_H = false,
            start_SV = false;
        }
        function stop(e) {
            var t = e.target,
                k = drag_H ? "h" : "sv",
                a = [HSV2HEX(HSV), r],
                is_target = t === target || closest(t, target) === target,
                is_picker = t === picker || closest(t, picker) === picker;
            if (!is_target && !is_picker) {
                // click outside the target or picker element to exit
                if (visible() && how !== false) exit(), trigger("exit", [r]), trigger_(0, a);
            } else {
                if (is_picker) {
                    trigger("stop:" + k, a);
                    trigger("stop", a);
                    trigger_(k, a);
                }
            }
            drag_H = false,
            drag_SV = false;
        }
        function down_H(e) {
            start_H = true,
            drag_H = true,
            move(e), prevent(e);
            trigger("start:h", [v, r]);
            trigger("start", [v, r]);
            trigger_("h", [v, r]);
        }
        function down_SV(e) {
            start_SV = true,
            drag_SV = true,
            move(e), prevent(e);
            trigger("start:sv", [v, r]);
            trigger("start", [v, r]);
            trigger_("sv", [v, r]);
        }
        if (!first) {
            on("touchstart", H, down_H);
            on("mousedown", H, down_H);
            on("touchstart", SV, down_SV);
            on("mousedown", SV, down_SV);
            on("touchmove", d, move);
            on("mousemove", d, move);
            on("touchend", d, stop);
            on("mouseup", d, stop);
            on("resize", w, fit);
        }
    } create(1);

    delay(function() {
        var a = [HSV2HEX(HSV), r];
        trigger("create", a);
        trigger_(0, a);
    }, 0);

    // register to global ...
    r.target = target;
    r.picker = picker;
    r.visible = false;
    r.on = add;
    r.off = remove;
    r.trigger = trigger;
    r.fit = fit;
    r.set = function(a) {
        if (!isset(a)) return get_data();
        if (typeof a === "string") {
            a = r.parse(a);
        }
        return set_data(a), set(), r;
    };
    r.HSV2RGB = function(a) {
        return HSV2RGB(_2HSV_pri(a));
    };
    r._HSV2RGB = HSV2RGB;
    r.HSV2HEX = function(a) {
        return HSV2HEX(_2HSV_pri(a));
    };
    r._HSV2HEX = HSV2HEX;
    r.RGB2HSV = function(a) {
        return _2HSV_pub(RGB2HSV(a));
    };
    r._RGB2HSV = RGB2HSV;
    r.RGB2HEX = RGB2HEX;
    r.HEX2HSV = function(s) {
        return _2HSV_pub(HEX2HSV(s));
    };
    r._HEX2HSV = HEX2HSV;
    r.HEX2RGB = HEX2RGB;
    r.hooks = hooks;
    r.enter = function(bucket) {
        return create(0, bucket);
    };
    r.exit = exit;

    // return the global object
    return r;

};

module.exports = CP;
},{}],44:[function(require,module,exports){
/***********************************
 * COORDINATE CONVERSION FUNCTIONS *
 ***********************************/

var getTileRadius = function (r) {
    return parseInt(Math.floor(r / 64));
}

var lerp = function (minVal, maxVal, pos_r) {
    return pos_r * (maxVal - minVal) + minVal;
}

var reverseLerp = function (minVal, maxVal, pos) {
    return (pos - minVal) / (maxVal - minVal);
}

var latLonToWorld = function (map_x_boundaries, map_y_boundaries, map_w, map_h, x, y) {
    var x_r = lerp(map_x_boundaries[0], map_x_boundaries[1], x / map_w),
        y_r = lerp(map_y_boundaries[0], map_y_boundaries[1], (map_h - y) / map_h);

    return {
        x: x_r,
        y: y_r
    };
}

var worldToLatLon = function (map_x_boundaries, map_y_boundaries, map_w, map_h, x_r, y_r) {
    var x = reverseLerp(map_x_boundaries[0], map_x_boundaries[1], x_r) * map_w,
        y = map_h - reverseLerp(map_y_boundaries[0], map_y_boundaries[1], y_r) * map_h;

    return {
        x: x,
        y: y
    };
}

var getScaledRadius = function (map_x_boundaries, map_w, r) {
    return r / (map_x_boundaries[1] - map_x_boundaries[0]) * map_w
}

var calculateDistance = function (scale, order, units, measure) {
    if (order == 1) {
        if (units == "km") {
            return measure * scale * 1000;
        } else {
            return measure * scale;
        }
    } else {
        return measure * scale;
    }
}

module.exports = {
    getTileRadius: getTileRadius,
    lerp: lerp,
    reverseLerp: reverseLerp,
    latLonToWorld: latLonToWorld,
    worldToLatLon: worldToLatLon,
    getScaledRadius: getScaledRadius,
    calculateDistance: calculateDistance
}
},{}],45:[function(require,module,exports){
var OpenLayers = require("./OpenLayers.js");
var d3scaleLinear = require("d3-scale").scaleLinear;
var d3geoTransform = require("d3-geo").geoTransform;
var d3geoPath = require("d3-geo").geoPath;
var d3select = require("d3-selection").select;

module.exports = OpenLayers.Class(OpenLayers.Control, {

    width: 1024,
    height: 1024,
    x: null,
    y: null,
    id: "export-svg",
    yExtent: [0, 16384],
    xExtent: [0, 16384],
    projection: null,
    path: null,
    svg: null,
 
    stylePropMap: {
        fillColor: 'fill',
        fillOpacity: 'fill-opacity',
        strokeColor: 'stroke',
        strokeWidth: 'stroke-width',
        strokeOpacity: 'stroke-opacity',
        graphicOpacity: 'opacity'
    },
    
    imagesToLoad: 0,
    layer: null,
    
    initialize: function(map, layer, div, map_tile_path, options) {
        OpenLayers.Control.prototype.initialize.apply(this, [options]);
        this.map = map;
        this.layer = layer;
        this.div = div;
        this.map_tile_path = map_tile_path;
        console.log("EXPORTMAP CONTROL", this.map);
        this.x = d3scaleLinear().range([0, this.width]);
        this.y = d3scaleLinear().range([0, this.height]);
        var self = this;
        this.projection = d3geoTransform({
            point: function(px, py) {
                this.stream.point(self.x(px), self.height - self.y(py));
            }
        })
        this.path = d3geoPath().projection(this.projection);
        this.x.domain(this.xExtent);
        this.y.domain(this.yExtent);
        
        this.div.addEventListener('click', this.doExport.bind(this), false);
        var self = this;
        this.setStyle = function (d) {
            console.log(this, d3select(this), self, d);
            for (var p in self.stylePropMap) {
                if (d.properties.style[p]) {
                    console.log(p);
                    var val = d.properties.style[p];
                    if (p == 'strokeWidth') {
                        val = self.x(val);
                    }
                    if (p == 'fillColor' && d.geometry.type == 'LineString') val = 'none';
                    d3select(this).style(self.stylePropMap[p], val);
                }
                else if (p == 'fillColor') {
                    console.log('fillColor none', d.geometry.type);
                    d3select(this).style(self.stylePropMap[p], "none");
                }
                else {
                    //console.log(p);
                }
            }
            if (d.properties.style.externalGraphic) {
                console.log('imagesToLoad', self.imagesToLoad);
                var val = d.properties.style.externalGraphic;
                console.log('externalGraphic', val);
                
                if (val.indexOf('ward_sentry') == -1 && val.indexOf('ward_observer') == -1) {
                    var yPos = self.height - self.y(d.geometry.coordinates[1]) - self.x(d.properties.style.graphicHeight) / 2;
                }
                else {
                    var yPos = self.height - self.y(d.geometry.coordinates[1]) - self.x(d.properties.style.graphicHeight);
                }
                d3select(this).attr("xlink:href", val)
                    .attr('x', self.x(d.geometry.coordinates[0]) - self.x(d.properties.style.graphicHeight) / 2)
                    .attr('y', yPos)
                    .attr('width', self.x(d.properties.style.graphicHeight))
                    .attr('height', self.x(d.properties.style.graphicHeight));
                self.imagesToLoad++;
                var d3this = this;
                self.getImageBase64(val, function (data) {
                    d3select(d3this)
                        .attr("href", "data:image/png;base64," + data); // replace link by data URI
                    self.imagesToLoad--;
                    self.imageLoadFinished();
                })
            }
        }
    },
    
    imageLoadFinished: function (callback) {
        if (this.imagesToLoad == 0) {
            this.download_png();
        }
    },

    featureFilter: function (e) {
        return function(d) {
            console.log(d.geometry.type);
            return d.geometry.type == e;
        }
    },
    
    createSVG: function (data) {
        console.log(data);
        if (this.svg) this.svg.remove();
        this.svg = d3select("body").append("svg")
            .attr("id", this.id)
            .attr("width", this.width)
            .attr("height", this.height);
            
        // add index of element as zIndex so they can be ordered properly later
        data.features.forEach(function (d, i) {
            d.zIndex = i;
            console.log(d);
        });

        // background element
        console.log(this.map.baseLayer);
        var background = this.map_tile_path + this.map.baseLayer.map_patch + "/" + this.map.baseLayer.map_id + "/dotamap" + (this.map.baseLayer.map_id == 'default' ? '' : '_' + this.map.baseLayer.map_id) + "5_25.jpg";
        this.svg.append("image")
            .attr("class", "background")
            .attr("xlink:href", background)
            .attr('width', this.width)
            .attr('height', this.height);
        this.imagesToLoad = 1;
        var self = this;
        this.getImageBase64(background, function (data) {
            d3select("#" + self.id + " .background")
                .attr("href", "data:image/png;base64," + data); // replace link by data URI
            self.imagesToLoad--;
            self.imageLoadFinished();
        })
                
        this.svg.selectAll("g").data(data.features.filter(this.featureFilter('Polygon'))).enter().append("path")
            .attr("class", "node")
            .attr("d", this.path)
            .each(this.setStyle);

        this.svg.selectAll("g").data(data.features.filter(this.featureFilter('LineString'))).enter().append("path")
            .attr("class", "node")
            .attr("d", this.path)
            .each(this.setStyle);

        this.svg.selectAll("g").data(data.features.filter(this.featureFilter('Point'))).enter().append("image")
            .attr("class", "node")
            .attr("d", this.path)
            .each(this.setStyle);
            
        // sort by zIndex
        this.svg.selectAll(".node").sort(function (a, b) {
            console.log(a, b);
            if (a.zIndex > b.zIndex) return 1;
            if (a.zIndex < b.zIndex) return -1;
            return 0;
        });
    },
    
    converterEngine: function (input) { // fn BLOB => Binary => Base64 ?
        var uInt8Array = new Uint8Array(input),
            i = uInt8Array.length;
        var biStr = []; //new Array(i);
        while (i--) {
            biStr[i] = String.fromCharCode(uInt8Array[i]);
        }
        var base64 = window.btoa(biStr.join(''));
        //console.log("2. base64 produced >>> " + base64); // print-check conversion result
        return base64;
    },

    getImageBase64: function (url, callback) {
        // 1. Loading file from url:
        var xhr = new XMLHttpRequest(url);
        xhr.open('GET', url, true); // url is the url of a PNG image.
        xhr.responseType = 'arraybuffer';
        xhr.callback = callback;
        var self = this;
        xhr.onload = function (e) {
            if (this.status == 200) { // 2. When loaded, do:
                //console.log("1:Loaded response >>> " + this.response); // print-check xhr response 
                var imgBase64 = self.converterEngine(this.response); // convert BLOB to base64
                this.callback(imgBase64); //execute callback function with data
            }
        };
        xhr.send();
    },
    
    download_png: function () {
        console.log('download_png', d3select("svg"), this.svg, d3select("svg") == this.svg);
        var contents = this.svg.attr("version", 1.1)
            .attr("xmlns", "http://www.w3.org/2000/svg")
            .node().outerHTML;
        var src = 'data:image/svg+xml;utf8,' + contents;
        
        var canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        var context = canvas.getContext("2d");

        var image = new Image;
        image.src = src;
        var self = this;
        image.onload = function() {
            context.drawImage(image, 0, 0, this.width, this.height);
            self.downloadCanvas(canvas);
        };
    },

    dataURLtoBlob: function (dataurl) {
        var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], {type:mime});
    },

    downloadCanvas: function (_canvasObject) {
        var link = document.createElement("a");
        var imgData = _canvasObject.toDataURL({format: 'png', multiplier: 4});
        var strDataURI = imgData.substr(22, imgData.length);
        var blob = this.dataURLtoBlob(imgData);
        var objurl = URL.createObjectURL(blob);

        link.download = "image.png";

        link.href = objurl;

        document.body.appendChild(link); // Required for FF
        link.click();
        document.body.removeChild(link); // Required for FF
    },
    
    doExport: function () {
        var parser = new OpenLayers.Format.GeoJSON()
        console.log('this.layer.features', this.layer, this.layer.features);
        var data = JSON.parse(parser.write(this.layer.features));
        console.log(data, this.layer.features);
        this.createSVG(data, this.download_png);
    },

    CLASS_NAME: "OpenLayers.Control.ExportMap"
});
},{"./OpenLayers.js":42,"d3-geo":5,"d3-scale":7,"d3-selection":8}],46:[function(require,module,exports){
(function (global){
var rollbar = require('./rollbar');

var $ = (typeof window !== "undefined" ? window['$'] : typeof global !== "undefined" ? global['$'] : null);
require("jquery-ui/ui/version");
require("jquery-ui/ui/safe-active-element");
require("jquery-ui/ui/widget");
require("jquery-ui/ui/escape-selector");
require("jquery-ui/ui/form");
require("jquery-ui/ui/form-reset-mixin");
require("jquery-ui/ui/keycode");
require("jquery-ui/ui/labels");
require("jquery-ui/ui/position");
require("jquery-ui/ui/unique-id");
require("jquery-ui/ui/focusable");
require("jquery-ui/ui/safe-blur");
require("jquery-ui/ui/tabbable");
require("jquery-ui/ui/plugin");
require("jquery-ui/ui/data");
require("jquery-ui/ui/ie");
require("jquery-ui/ui/scroll-parent");
require("jquery-ui/ui/disable-selection");

require("jquery-ui/ui/widgets/button");
require("jquery-ui/ui/widgets/menu");
require("jquery-ui/ui/widgets/mouse");
require("jquery-ui/ui/widgets/draggable");
require("jquery-ui/ui/widgets/resizable");

var spinner = require("jquery-ui/ui/widgets/spinner");
var selectmenu = require("jquery-ui/ui/widgets/selectmenu");
var dialog = require("jquery-ui/ui/widgets/dialog");
var checkboxradio = require("jquery-ui/ui/widgets/checkboxradio");
var controlgroup = require("jquery-ui/ui/widgets/controlgroup");
var tooltip = require("jquery-ui/ui/widgets/tooltip");

var CP = require("./color-picker.js");
var OpenLayers = require("./OpenLayers.js");
var UndoRedo = require("./OpenLayers.Control.UndoRedo");
var querystringutil = require("./querystringutil");
var coordinateconversion = require("./coordinateconversion");
var CustomLayerSwitcher = require("./layerswitcher");
var widgets = require("./widgets");
var ExportMap = require("./exportmap");
var ShareMap = require("./sharemap");
var SaveMap = require("./savemap");

var sprite_manifest = require("./sprite_manifest.json");
sprite_manifest.heroes = sprite_manifest.heroes.sort(function (a, b) {
    if (a.name < b.name) return -1;
    if (a.name > b.name) return 1;
    return 0;
});
sprite_manifest.other = sprite_manifest.other.sort(function (a, b) {
    if (a.name < b.name) return -1;
    if (a.name > b.name) return 1;
    return 0;
});

var latLonToWorld = coordinateconversion.latLonToWorld
var worldToLatLon = coordinateconversion.worldToLatLon
var calculateDistance = coordinateconversion.calculateDistance
var formatDegree = widgets.formatDegree;
var formatPercent = widgets.formatPercent;
var getParameterByName = querystringutil.getParameterByName;
var setQueryString = querystringutil.setQueryString;

console.log('ExportMap', ExportMap);

    var IMG_DIR = "images/",
        map_w = 16384,
        map_h = 16384,
        map_x_boundaries = [-8475.58617377, 9327.49124559],
        map_y_boundaries = [9028.52473332, -8836.61406266],
        scale = Math.abs(map_x_boundaries[1] - map_x_boundaries[0])/map_w,
        imageToDota = latLonToWorld.bind(null, map_x_boundaries, map_y_boundaries, map_w, map_h),
        dotaToImage = worldToLatLon.bind(null, map_x_boundaries, map_y_boundaries, map_w, map_h),
        map = new OpenLayers.Map("map", {
            theme: null,
            maxExtent: new OpenLayers.Bounds(0, 0, map_w, map_h),
            numZoomLevels: 5,
            maxResolution: Math.pow(2, 5-1 ),
            units: "m",
            controls: [
                new OpenLayers.Control.Navigation(),
                new OpenLayers.Control.Zoom({
                    zoomInId: "zoom-in",
                    zoomOutId: "zoom-out"
                })
            ]
        }),
        baseLayers = [
            baseLayerFactory('700', 'default', '7.00 Default', map_tile_path),
            baseLayerFactory('687', 'default', '6.87 Default', map_tile_path),
            baseLayerFactory('687', 'desert', '7.00 Desert', map_tile_path),
            baseLayerFactory('687', 'immortalgardens', '7.00 Immortal Gardens', map_tile_path)
        ],
        layerSwitcher = new CustomLayerSwitcher({
            ascending: false
        }, function (evt) {
            var button = evt.buttonElement;
            if (button === this.maximizeDiv) {
                OpenLayers.Element.removeClass(this.div, "minimized");
                if (isSmallScreen()) {
                    minimizeControlList();
                }
            }
        }),
        defaultHandlerOptions = {
            regularpolygon: {
                snapAngle: 15,
                sides: 4,
                radius: 1000
            }
        },
        defaultStyles = {
            brush: {
                strokeWidth: 50,
                strokeColor: '#ff0000',
                strokeOpacity: 1,
                pointRadius: 1,
                fillColor: '#ff0000'
            },
            icon: {
                externalGraphic: "",
                graphicHeight: 512,
                graphicOpacity: 1
            },
            line: {
                strokeWidth: 25,
                strokeColor: '#00ff00',
                strokeOpacity: 1,
                pointRadius: 1,
                fillColor: '#00ff00'
            },
            polygon: {
                strokeWidth: 10,
                strokeColor: '#0000ff',
                strokeOpacity: 1,
                pointRadius: 1,
                fillColor: '#ff00ff',
                fillOpacity: 0.5
            },
            regularpolygon: {
                strokeWidth: 20,
                strokeColor: '#00ffff',
                strokeOpacity: 1,
                pointRadius: 1,
                fillColor: '#aa00ff',
                fillOpacity: 1
            },
            modify: {
                strokeWidth: 2,
                strokeColor: '#ff0000',
                strokeOpacity: 1,
                pointRadius: 50,
                fillColor: '#ff0000',
                graphicName: "cross"
            },
            selectfeature: {
                strokeWidth: 2,
                strokeColor: '#ff0000',
                strokeOpacity: 1,
                pointRadius: 50,
                fillColor: '#ff0000',
                graphicName: "cross"
            },
            measure: {
                strokeWidth: 2,
                strokeColor: '#ff0000',
                strokeOpacity: 1,
                pointRadius: 50,
                fillColor: '#ff0000',
                graphicName: "cross"
            }
        },
        strokeTools = ['brush', 'line', 'polygon', 'regularpolygon'],
        activeTool,
        renderer = OpenLayers.Util.getParameters(window.location.href).renderer,
        saveHandlerUrl = 'save.php';

    function baseLayerFactory(map_patch, map_id, name, map_tile_path) {
        var layer = new OpenLayers.Layer.TMS(name, map_tile_path, {
            type: "jpg",
            getURL: getMyURL(map_patch, map_id)
        })
        layer.map_patch = map_patch;
        layer.map_id = map_id;
        return layer;
    }
    /********************
     * CONTROL HANDLERS *
     ********************/

    function toggleModifyControl() {
        console.log(this.value);
        drawControls.modify.mode = OpenLayers.Control.ModifyFeature.RESHAPE;
        switch (this.value) {
            case 'reshape':
                drawControls.modify.mode = OpenLayers.Control.ModifyFeature.RESHAPE;
            break;
            case 'rotate':
                drawControls.modify.mode = OpenLayers.Control.ModifyFeature.ROTATE;
            break;
            case 'scale':
                drawControls.modify.mode |= OpenLayers.Control.ModifyFeature.RESIZE;
                drawControls.modify.mode &= ~OpenLayers.Control.ModifyFeature.RESHAPE;
            break;
            case 'skew':
                drawControls.modify.mode |= OpenLayers.Control.ModifyFeature.RESIZE;
            break;
            case 'drag':
                drawControls.modify.mode = OpenLayers.Control.ModifyFeature.DRAG;
            break;
        }
        console.log('drawControls.modify', drawControls.modify);
        var feature = drawControls.modify.feature;
        if (feature) {
            drawControls.modify.unselectFeature(feature);
            drawControls.modify.selectFeature(feature);
        }
    }
    
    function toggleControl() {
        var control;
        var tools = Object.keys(defaultStyles);
        $('#toolbar').hide();
        for (var key in drawControls) {
            control = drawControls[key];
            console.log(this.value, key, this.checked);
            if (this.value == key && this.checked) {
                control.activate();
                map.updateSize();
                console.log(key);
                if (tools.indexOf(key) != -1) {
                    $('#toolbar').show();
                    updateTools(key);
                    /*if (key == 'modify') {
                        vectors.events.register("beforefeaturemodified", drawControls[key], onBeforeFeatureModified);
                        vectors.events.register("afterfeaturemodified", drawControls[key], onFeatureModified);
                    }
                    else {
                        vectors.events.register("sketchcomplete", drawControls[key], onSketchCompletedHandlers[key]);
                    }*/
                }
            } else {
                control.deactivate();
                if (tools.indexOf(key) != -1) {
                    /*if (key == 'modify') {
                        vectors.events.unregister("beforefeaturemodified", drawControls[key], onBeforeFeatureModified);
                        vectors.events.unregister("afterfeaturemodified", drawControls[key], onFeatureModified);
                    }
                    else {
                        vectors.events.unregister("sketchcomplete", drawControls[key], onSketchCompletedHandlers[key]);
                    }*/
                }
            }
        }
        if (this.value == 'modify') {
            console.log("layer selected features", vectors.selectedFeatures);
            if (vectors.selectedFeatures.length) {
                drawControls.modify.selectFeature(vectors.selectedFeatures[0]);
            }
        }
    }
    
    function updateTools(value) {
        console.log("updateTools", value);
        activeTool = value;
        $(".tool-radiobutton").checkboxradio("refresh");
        $('.tool-setting').hide();
        $('.' + value + '-tool-group').css('display', 'inline-block');
    }

    // creates url for tiles. OpenLayers TMS Layer getURL property is set to this
    function getMyURL(patch, baseLayer) {
        return function(bounds) {
            //console.log('getMyURL', baseLayer);
            var res = this.map.getResolution(),
                x = Math.round((bounds.left - this.maxExtent.left) / (res * this.tileSize.w)),
                y = Math.round((this.maxExtent.top - bounds.top) / (res * this.tileSize.h)),
                z = map.getZoom(),
                path = z + "/tile_" + x + "_" + y + "." + this.type,
                url = this.url;

            if (url instanceof Array) {
                url = this.selectUrl(path, url)
            }
            return url + patch + '/' + baseLayer + '/' + path
        }
    }

    // Initialize map settings based on query string values
    function parseQueryString() {
        var id = getParameterByName('id');
        if (id) {
            $.get('save/' + id + '.json', function (data) {
                console.log(data);
                var parser = new OpenLayers.Format.GeoJSON()
                vectors.addFeatures(parser.read(data));
            });
            map.zoomTo(parseInt(zoom));
        }
        
        var zoom = getParameterByName('zoom');
        if (zoom) {
            map.zoomTo(parseInt(zoom));
        }
        var worldX = getParameterByName('x');
        var worldY = getParameterByName('y');
        if (worldX && worldY) {
            var lonlat = dotaToImage(worldX, worldY);
            map.setCenter(new OpenLayers.LonLat(lonlat.x, lonlat.y), undefined, false, false);
        }
        
        var baseLayerName = getParameterByName('BaseLayer');
        if (baseLayerName) {
            for (var i = 0; i < baseLayers.length; i++) {
                var layer = baseLayers[i];
                var layerName = layer.name.replace(/ /g, '');
                if (baseLayerName === layerName) {
                    map.setBaseLayer(layer);
                    break;
                }
            }
        }
    }

    /******************
     * STROKE UI INIT *
     ******************/

    strokeTools.forEach(function (key) {
        initStrokeWidth(key);
        initStrokeOpacity(key);
        initStrokeColor(key);
    });
    initStrokeOpacity('polygon', true);
    initStrokeColor('polygon', true);
    initStrokeOpacity('regularpolygon', true);
    initStrokeColor('regularpolygon', true);
    initDegreeSpinner('regularpolygon', 'snap-angle', 'snapAngle');
    initSpinner('regularpolygon', 'side-count', 'sides', {
        min: 3,
        step: 1
    });
    initSpinner('regularpolygon', 'radius', 'radius', {
        min: 1,
        step: 1
    });
    
    $('#regularpolygon-snap').checkboxradio({icon: false}).change(function () {
        var key = 'regularpolygon';
        var prop = 'snapAngle';
        var v;
        if (this.checked) {
            v = $(this).data('snapAngle');
            $('#regularpolygon-snap-angle').degreespinner( "enable" );
        }
        else {
            v = null;
            $(this).data('snapAngle', defaultHandlerOptions[key][prop])
            defaultHandlerOptions[key][prop] = null;
            $('#regularpolygon-snap-angle').degreespinner( "disable" );
        }
        defaultHandlerOptions[key][prop] = v;
        updateHandlerOption(key, prop, v);
    }).data('snapAngle', defaultHandlerOptions.regularpolygon.snapAngle);
    
    $('#regularpolygon-fixed-radius').checkboxradio({icon: false}).change(function () {
        var key = 'regularpolygon';
        var prop = 'radius';
        var v;
        if (this.checked) {
            v = $(this).data('radius');
            $('#regularpolygon-radius').spinner( "enable" );
            $('#regularpolygon-irregular').prop('checked', false).checkboxradio( "refresh" );
            updateHandlerOption('regularpolygon', 'irregular', false);
        }
        else {
            v = null;
            $(this).data('radius', defaultHandlerOptions[key][prop])
            defaultHandlerOptions[key][prop] = null;
            $('#regularpolygon-radius').spinner( "disable" );
        }
        defaultHandlerOptions[key][prop] = v;
        updateHandlerOption(key, prop, v);
    }).data('radius', defaultHandlerOptions.regularpolygon.radius);
    
    $('#regularpolygon-irregular').checkboxradio({icon: false}).change(function () {
        var key = 'regularpolygon';
        var prop = 'irregular';
        var v = this.checked;
        if (this.checked) {
            $('#regularpolygon-fixed-radius').prop('checked', false).checkboxradio( "refresh" );
            $('#regularpolygon-radius').spinner( "disable" );
        }
        else {
            
        }
        /*if (this.checked) {
            v = $(this).data('snapAngle');
            $('#regularpolygon-snap-angle').degreespinner( "enable" );
        }
        else {
            v = null;
            $(this).data('snapAngle', defaultHandlerOptions[key][prop])
            defaultHandlerOptions[key][prop] = null;
            $('#regularpolygon-snap-angle').degreespinner( "disable" );
        }
        defaultHandlerOptions[key][prop] = v;*/
        updateHandlerOption(key, prop, v);
    });
    
    // stroke width spinner
    function initStrokeWidth(key) {
        $('#' + key + '-stroke-width').spinner({
            min: 1,
            step: 1,
            change: function (event, ui) {
                var v = parseInt(this.value);
                if (isNaN(v)) {
                    v = parseInt(defaultStyles[key].strokeWidth);
                }
                else {
                    defaultStyles[key].strokeWidth = v;
                }
                $(this).val(v);
            },
            stop: function (event, ui) {
                var v = parseInt(this.value);
                if (!isNaN(v)) {
                    defaultStyles[key].strokeWidth = v;
                }
            }
        }).val(defaultStyles[key].strokeWidth);
    }
    
    // stroke opacity spinner
    function initStrokeOpacity(key, isFill) {
        var target = isFill ? 'fill' : 'stroke';
        var strokeOpacityPreview = document.querySelector('#' + key + '-' + target + '-opacity-icon .opacity-preview-icon');
        $('#' + key + '-' + target + '-opacity').percentspinner({
            min: 0,
            max: 100,
            step: 1,
            change: function (event, ui) {
                var v = parseInt(this.value);
                if (isNaN(v)) {
                    v = parseInt(defaultStyles[key][target + 'Opacity'] * 100);
                }
                else {
                    defaultStyles[key][target + 'Opacity'] = v/100;
                    strokeOpacityPreview.style.opacity = defaultStyles[key][target + 'Opacity'];
                }
                $(this).val(formatPercent(v));
            },
            spin: function(event, ui) {
                strokeOpacityPreview.style.opacity = ui.value/100;
            },
            stop: function (event, ui) {
                var v = parseInt(this.value);
                if (!isNaN(v)) {
                    defaultStyles[key][target + 'Opacity'] = v/100;
                    strokeOpacityPreview.style.opacity = defaultStyles[key][target + 'Opacity'];
                }
            }
        }).val(formatPercent(defaultStyles[key][target + 'Opacity']*100));
    }
    
    // stroke color picker
    function initStrokeColor(key, isFill) {
        var target = isFill ? 'fill' : 'stroke';
        var colorPreview = document.getElementById(key + '-' + target + '-color-preview');
        var colorPicker = new CP(document.getElementById(key + '-' + target + '-color-picker'));
        colorPicker.set(defaultStyles[key][target + 'Color']);
        colorPicker.on("enter", function() {
            var color = '#' + this._HSV2HEX(this.set());
            colorPreview.title = color;
            colorPreview.style.backgroundColor = color;
        });
        colorPicker.on("change", function(color) {
            this.target.value = '#' + color;
            colorPreview.style.backgroundColor = '#' + color;
            defaultStyles[key][target + 'Color'] = '#' + color;
        });
        colorPicker.on("exit", function() {
            this.target.value = colorPreview.title;
        });
        $(colorPreview).click(function () {
            if (!colorPicker.visible) {
                colorPicker.enter();
            }
        });
        
        var closeButton = document.createElement('button');
        closeButton.innerHTML = 'Close';
        closeButton.className = 'color-picker-close tool-button';
        closeButton.addEventListener("click", function() {
            colorPicker.exit();
        }, false);
        colorPicker.picker.appendChild(closeButton);
    }
    
    function initDegreeSpinner(key, name, prop) {
        $('#' + key + '-' + name).degreespinner({
            min: 0,
            max: 360,
            step: 1,
            change: function (event, ui) {
                var v = parseInt(this.value);
                if (isNaN(v)) {
                    v = parseInt(defaultHandlerOptions[key][prop]);
                }
                else {
                    defaultHandlerOptions[key][prop] = v;
                    updateHandlerOption(key, prop, v);
                }
                $(this).val(formatDegree(v));
            },
            stop: function (event, ui) {
                var v = parseInt(this.value);
                if (!isNaN(v)) {
                    defaultHandlerOptions[key][prop] = v;
                    updateHandlerOption(key, prop, v);
                }
            }
        }).val(formatDegree(defaultHandlerOptions[key][prop]));
    }
    
    function initSpinner(key, name, prop, options, spinnerType, formatFunction) {
        var spinnerType = spinnerType || 'spinner';
        var formatFunction = formatFunction || identity;
        $('#' + key + '-' + name)[spinnerType](OpenLayers.Util.extend({
            change: function (event, ui) {
                var v = parseInt(this.value);
                if (isNaN(v)) {
                    v = parseInt(defaultHandlerOptions[key][prop]);
                }
                else {
                    defaultHandlerOptions[key][prop] = v;
                    updateHandlerOption(key, prop, v);
                }
                $(this).val(formatFunction(v));
            },
            stop: function (event, ui) {
                var v = parseInt(this.value);
                if (!isNaN(v)) {
                    defaultHandlerOptions[key][prop] = v;
                    updateHandlerOption(key, prop, v);
                }
            }
        }, options)).val(formatFunction(defaultHandlerOptions[key][prop]));
    }
    
    function identity(v) { return v };
    
    function updateHandlerOption(key, prop, value) {
        var option = {};
        option[prop] = value;
        drawControls[key].handler.setOptions(option);
    }
    
    /****************
     * ICON UI INIT *
     ****************/
     
     // marker size spinner
    $('#marker-size').spinner({
        min: 32,
        step: 32,
        change: function (event, ui) {
            var v = parseInt(this.value);
            if (isNaN(v)) {
                v = parseInt(defaultStyles.icon.graphicHeight);
            }
            else {
                defaultStyles.icon.graphicHeight = v;
            }
            $(this).val(v);
        },
        stop: function (event, ui) {
            var v = parseInt(this.value);
            if (!isNaN(v)) {
                defaultStyles.icon.graphicHeight = v;
            }
        }
    }).val(defaultStyles.icon.graphicHeight);
    
    // marker opacity spinner
    var markerOpacityPreview = document.querySelector('#marker-opacity-icon .opacity-preview-icon');
    $('#marker-opacity').percentspinner({
        min: 0,
        max: 100,
        step: 1,
        change: function (event, ui) {
            var v = parseInt(this.value);
            if (isNaN(v)) {
                v = parseInt(defaultStyles.icon.graphicOpacity * 100);
            }
            else {
                defaultStyles.icon.graphicOpacity = v/100;
                markerOpacityPreview.style.opacity = defaultStyles.icon.graphicOpacity;
            }
            $(this).val(formatPercent(v));
        },
        spin: function(event, ui) {
            markerOpacityPreview.style.opacity = ui.value/100;
        },
        stop: function (event, ui) {
            var v = parseInt(this.value);
            if (!isNaN(v)) {
                defaultStyles.icon.graphicOpacity = v/100;
                markerOpacityPreview.style.opacity = defaultStyles.icon.graphicOpacity;
            }
        }
    }).val(formatPercent(defaultStyles.icon.graphicOpacity*100));
    
    // icon select dropdown
    var img_root = '/media/images/miniheroes/';
    for (var i = 0; i < sprite_manifest.heroes.length; i++) {
        var $option = $('<option value="' + img_root + sprite_manifest.heroes[i].file + '">').text(sprite_manifest.heroes[i].name).attr("data-class", 'miniheroes-sprite-' + sprite_manifest.heroes[i].id);
        $('#marker-image-dropdown').append($option);
    }
    for (var i = 0; i < sprite_manifest.other.length; i++) {
        var $option = $('<option value="' + img_root + sprite_manifest.other[i].file + '">').text(sprite_manifest.other[i].name).attr("data-class", 'miniheroes-sprite-' + sprite_manifest.other[i].id);
        $('#marker-image-dropdown').append($option);
    }
    
    var $markerList = $('#marker-list');
    $( "#marker-image-dropdown" ).iconselectmenu({
        change: function( event, ui ) {
            console.log('change', event, ui);
            defaultStyles.icon.externalGraphic = ui.item.value;
            var iconClass = ui.item.element.attr("data-class");
            console.log('iconClass', iconClass);
            var bInList = false;
            $markerList.children().each(function (i) {
                if ($(this).hasClass(iconClass)) {
                    console.log('hasClass');
                    $(this).prependTo('#marker-list');
                    bInList = true;
                    return false;
                }
            });
            if (bInList) return;
            
            addIcon(iconClass, ui.item.value);
            
            var len = $markerList.children().length;
            while (len > 10) {
                $('div:last-child', $markerList).remove();
                len--;
            }
        }
    });
    
    function addIcon(iconClass, value) {
        var $icon = $('<div>')
            .addClass("selectmenu-icon " + iconClass);
        $icon.click(function () {
            console.log('click', value);
            defaultStyles.icon.externalGraphic = value;
            $('#marker-image-dropdown').val(value).iconselectmenu( "refresh" );
        });
        $markerList.prepend($icon);
    }
    
    defaultStyles.icon.externalGraphic = $('#marker-image-dropdown > option')[0].value;
    addIcon($('#marker-image-dropdown > option').attr("data-class"), defaultStyles.icon.externalGraphic);
    
    /********************
     * INITITIALIZATION *
     ********************/
     
    // listen to key presses
    OpenLayers.Event.observe(document, "keydown", function(evt) {
        var handled = false;
        console.log(evt.keyCode);
        switch (evt.keyCode) {
            case 90: // z
                if (evt.metaKey || evt.ctrlKey) {
                    console.log(vectors.features);
                    drawUndo();
                    handled = true;
                }
                break;
            case 89: // y
                if (evt.metaKey || evt.ctrlKey) {
                    drawRedo();
                    handled = true;
                }
                break;
            case 27: // esc
                handled = true;
                break;
            case 46: // esc
                if (activeTool == 'modify') modifyDeleteFeature();
                break;
        }
        if (handled) {
            OpenLayers.Event.stop(evt);
        }
    });
    
    OpenLayers.ImgPath = IMG_DIR;
    
    // Start setting up the map, adding controls and layers
    baseLayers.forEach(function(layer) {
        map.addLayer(layer);
    });
    
    function getStyle(key) {
        return OpenLayers.Util.applyDefaults({}, defaultStyles[key]);
    }
    
    function createStrokeStyleContext(key) {
        return {
            getPointRadius: function(feature) {
                return (feature.attributes.style ? feature.attributes.style.pointRadius : getStyle(key).pointRadius) / map.getResolution();
            },
            getStrokeWidth: function(feature) {
                return (feature.attributes.style ? feature.attributes.style.strokeWidth : getStyle(key).strokeWidth) / map.getResolution();
            },
            getStrokeColor: function(feature) {
                return feature.attributes.style ? feature.attributes.style.strokeColor : getStyle(key).strokeColor;
            },
            getStrokeOpacity: function(feature) {
                return feature.attributes.style ? feature.attributes.style.strokeOpacity : getStyle(key).strokeOpacity;
            }
        }
    }
    
    function createFillStyleContext(key) {
        return {
            getFillColor: function(feature) {
                return feature.attributes.style ? feature.attributes.style.fillColor : getStyle(key).fillColor;
            },
            getFillOpacity: function(feature) {
                return feature.attributes.style ? feature.attributes.style.fillOpacity : getStyle(key).fillOpacity;
            }
        }
    }
    
    // Returns style property stored in feature attribute or get current default style property
    var styleContexts = {
        brush: createStrokeStyleContext('brush'),
        line: createStrokeStyleContext('line'),
        polygon: OpenLayers.Util.extend(createStrokeStyleContext('polygon'), createFillStyleContext('polygon')),
        regularpolygon: OpenLayers.Util.extend(createStrokeStyleContext('regularpolygon'), createFillStyleContext('regularpolygon')),
        icon: {
            getGraphicHeight: function(feature) {
                return (feature.attributes.style ? feature.attributes.style.graphicHeight : getStyle('icon').graphicHeight) / map.getResolution();
            },
            getGraphicOpacity: function(feature) {
                return feature.attributes.style ? feature.attributes.style.graphicOpacity : getStyle('icon').graphicOpacity;
            },
            getGraphicYOffset: function(feature) {
                var externalGraphic = getStyle('icon').externalGraphic
                if (externalGraphic.indexOf('ward_sentry') == -1 && externalGraphic.indexOf('ward_observer') == -1) {
                    return -getStyle('icon').graphicHeight / map.getResolution() / 2;
                }
                else {
                    return -getStyle('icon').graphicHeight / map.getResolution();
                }
            },
            getExternalGraphic: function(feature) {
                return feature.attributes.style ? feature.attributes.style.externalGraphic : getStyle('icon').externalGraphic;
            }
        },
        modify: OpenLayers.Util.extend(createStrokeStyleContext('modify'), {
            getGraphicName: function(feature) {
                console.log('getGraphicName modify', feature.attributes.style ? feature.attributes.style.graphicName : getStyle('modify').graphicName);
                return feature.attributes.style ? feature.attributes.style.graphicName : getStyle('modify').graphicName;
            },
            getExternalGraphic: function(feature) {
                return "";
            }
        })
    }
    
    var styleTemplates = {
        brush: {
            pointRadius: "${getPointRadius}",
            strokeWidth: "${getStrokeWidth}",
            strokeColor: "${getStrokeColor}",
            strokeOpacity: "${getStrokeOpacity}"
        },
        line: {
            pointRadius: "${getPointRadius}",
            strokeWidth: "${getStrokeWidth}",
            strokeColor: "${getStrokeColor}",
            strokeOpacity: "${getStrokeOpacity}"
        },
        polygon: {
            pointRadius: "${getPointRadius}",
            strokeWidth: "${getStrokeWidth}",
            strokeColor: "${getStrokeColor}",
            strokeOpacity: "${getStrokeOpacity}",
            fillColor: "${getFillColor}",
            fillOpacity: "${getFillOpacity}"
        },
        regularpolygon: {
            pointRadius: "${getPointRadius}",
            strokeWidth: "${getStrokeWidth}",
            strokeColor: "${getStrokeColor}",
            strokeOpacity: "${getStrokeOpacity}",
            fillColor: "${getFillColor}",
            fillOpacity: "${getFillOpacity}"
        },
        icon: {
            graphicOpacity: "${getGraphicOpacity}",
            externalGraphic: "${getExternalGraphic}",
            graphicYOffset: "${getGraphicYOffset}",
            graphicHeight: "${getGraphicHeight}"
        },
        modify: {
            pointRadius: "${getPointRadius}",
            strokeWidth: "${getStrokeWidth}",
            strokeColor: "${getStrokeColor}",
            strokeOpacity: "${getStrokeOpacity}",
            externalGraphic: "${getExternalGraphic}",
            graphicName: "${getGraphicName}"
        }
    }

    // Collection of all style objects
    var styles = {
        select: OpenLayers.Feature.Vector.style.select,
        virtual: {
            strokeColor: "#ee9900",
            fillColor: "#ee9900",
            strokeOpacity: 0.3,
            strokeWidth: 2,
            pointRadius: 8,
            fillOpacity: 0.3,
            graphicName: "circle"
        },
        vertex: new OpenLayers.Style(OpenLayers.Util.applyDefaults({
            strokeWidth: 2,
            pointRadius: 8,
            graphicName: "circle",
            externalGraphic: ""
        }, OpenLayers.Feature.Vector.style['default']), {extendDefault: false})
    };
    
    // Styles used by control temporary layers
    for (var k in defaultStyles) {
        if (defaultStyles.hasOwnProperty(k)) {
            styles[k] = new OpenLayers.Style(styleTemplates[k], {context: styleContexts[k]});
        }
    }
    var zIndexCounter = 0;
    // Custom default style returns feature attribute style values first with fallback to active tool value
    styles['default'] = new OpenLayers.Style({
        pointRadius: "${getPointRadius}",
        strokeWidth: "${getStrokeWidth}",
        strokeColor: "${getStrokeColor}",
        strokeOpacity: "${getStrokeOpacity}",
        fillColor: "${getFillColor}",
        fillOpacity: "${getFillOpacity}",
        graphicOpacity: "${getGraphicOpacity}",
        externalGraphic: "${getExternalGraphic}",
        graphicYOffset: "${getGraphicYOffset}",
        graphicHeight: "${getGraphicHeight}",
        graphicName: "${getGraphicName}",
        graphicZIndex: "${getGraphicZIndex}"
    },
    {
        extendDefault: true,
        context: {
            getPointRadius: function (feature) {
                return (feature.attributes.style ? feature.attributes.style.pointRadius : getStyle(activeTool).pointRadius) / map.getResolution();
            },
            getStrokeWidth: function (feature) {
                return (feature.attributes.style ? feature.attributes.style.strokeWidth : getStyle(activeTool).strokeWidth) / map.getResolution();
            },
            getStrokeColor: function (feature) {
                return feature.attributes.style ? feature.attributes.style.strokeColor : getStyle(activeTool).strokeColor;
            },
            getStrokeOpacity: function (feature) {
                return feature.attributes.style ? feature.attributes.style.strokeOpacity : getStyle(activeTool).strokeOpacity;
            },
            getFillColor: function (feature) {
                return feature.attributes.style ? feature.attributes.style.fillColor : getStyle(activeTool).fillColor;
            },
            getFillOpacity: function (feature) {
                return feature.attributes.style ? feature.attributes.style.fillOpacity : getStyle(activeTool).fillOpacity;
            },
            getGraphicHeight: function (feature) {
                if (feature.attributes.style) {
                    return feature.attributes.style.graphicHeight / map.getResolution();
                }
                else if (getStyle(activeTool).graphicHeight) {
                    return getStyle(activeTool).graphicHeight / map.getResolution();
                }
                else {
                    return OpenLayers.Feature.Vector.style['default'].graphicHeight;
                }
                return (feature.attributes.style ? feature.attributes.style.graphicHeight : getStyle(activeTool).graphicHeight) / map.getResolution();
            },
            getGraphicOpacity: function (feature) {
                return feature.attributes.style ? feature.attributes.style.graphicOpacity : getStyle(activeTool).graphicOpacity;
            },
            getGraphicYOffset: function (feature) {
                if (feature.attributes.style) {
                    var externalGraphic = feature.attributes.style.externalGraphic;
                    var graphicHeight = feature.attributes.style.graphicHeight;
                }
                else if (getStyle(activeTool).getGraphicYOffset) {
                    var externalGraphic = getStyle(activeTool).externalGraphic;
                    var graphicHeight = getStyle(activeTool).graphicHeight;
                }
                else {
                    return OpenLayers.Feature.Vector.style['default'].getGraphicYOffset;
                }
                if (!externalGraphic || !graphicHeight) return OpenLayers.Feature.Vector.style['default'].getGraphicYOffset;
                
                if (externalGraphic.indexOf('ward_sentry') == -1 && externalGraphic.indexOf('ward_observer') == -1) {
                    return -graphicHeight / map.getResolution() / 2;
                }
                else {
                    return -graphicHeight / map.getResolution();
                }
            },
            getExternalGraphic: function (feature) {
                if (feature.attributes.style) {
                    return feature.attributes.style.externalGraphic;
                }
                else if (getStyle(activeTool).externalGraphic) {
                    return getStyle(activeTool).externalGraphic;
                }
                else {
                    return OpenLayers.Feature.Vector.style['default'].externalGraphic;
                }
                return feature.attributes.style ? feature.attributes.style.externalGraphic : getStyle(activeTool).externalGraphic;
            },
            getGraphicName: function (feature) {
                if (feature.attributes.style) {
                    return feature.attributes.style.graphicName;
                }
                else if (getStyle(activeTool).graphicName) {
                    return getStyle(activeTool).graphicName;
                }
                else {
                    return OpenLayers.Feature.Vector.style['default'].graphicName;
                }
                return feature.attributes.style ? feature.attributes.style.graphicName : getStyle(activeTool).graphicName;
            },
            getGraphicZIndex: function (feature) {
                console.log("graphicZIndex", feature);
                if (feature.attributes.hasOwnProperty('zIndex')) {
                    console.log("graphicZIndex feature.attributes", feature.attributes.zIndex);
                    return feature.attributes.zIndex;
                }
                feature.attributes.zIndex = ++zIndexCounter;
                console.log("graphicZIndex new feature.attributes", feature.attributes.zIndex);
                return feature.attributes.zIndex;
            }
        }
    });
    renderer = renderer ? [renderer] : OpenLayers.Layer.Vector.prototype.renderers;
    var vectors = new OpenLayers.Layer.Vector("Canvas", {
        styleMap: new OpenLayers.StyleMap({
            'default': styles['default'],
            select: styles.select,
            vertex: styles.vertex
        }),
        rendererOptions: { zIndexing: true },
        renderers: ["Canvas"]//renderer //["Canvas"]
    });
    map.addLayer(vectors);
    
    // X/Y coordinate update control
    var coordinateControl = new OpenLayers.Control.MousePosition();
    coordinateControl.formatOutput = function (lonlat) {
        var worldXY = imageToDota(lonlat.lon, lonlat.lat);
        return worldXY.x.toFixed(0) + ', ' + worldXY.y.toFixed(0);
    };
    map.addControl(coordinateControl);
    
    map.addControl(new OpenLayers.Control.TouchNavigation({
        dragPanOptions: {
            enableKinetic: true
        }
    }));
    map.addControl(new OpenLayers.Control.KeyboardDefaults());
    map.addControl(layerSwitcher);
    layerSwitcher.maximizeControl();
    if (!map.getCenter()) {
        map.zoomToMaxExtent();
    }

    // Controls configuration
    var drawControls = {
        brush: new OpenLayers.Control.DrawFeature(vectors, OpenLayers.Handler.Path,
        {
            handlerOptions: {
                freehand: true,
                layerOptions: {
                    styleMap: new OpenLayers.StyleMap(styles.brush)
                }
            }
        }),
        icon: new OpenLayers.Control.DrawFeature(vectors, OpenLayers.Handler.Point,
        {
            handlerOptions: {
                layerOptions: {
                    styleMap: new OpenLayers.StyleMap(styles.icon)
                }
            }
        }),
        line: new OpenLayers.Control.DrawFeature(vectors, OpenLayers.Handler.Path,
        {
            handlerOptions: {
                freehand: false,
                layerOptions: {
                    styleMap: new OpenLayers.StyleMap(styles.line)
                }
            }
        }),
        polygon: new OpenLayers.Control.DrawFeature(vectors, OpenLayers.Handler.Polygon,
        {
            handlerOptions: {
                layerOptions: {
                    styleMap: new OpenLayers.StyleMap(styles.polygon)
                }
            }
        }),
        regularpolygon: new OpenLayers.Control.DrawFeature(vectors, OpenLayers.Handler.RegularPolygon,
        {
            handlerOptions: OpenLayers.Util.extend(defaultHandlerOptions.regularpolygon, {
                layerOptions: {
                    styleMap: new OpenLayers.StyleMap(styles.regularpolygon)
                }
            })
        }),
        modify: new OpenLayers.Control.ModifyFeature(vectors, {vertexRenderIntent: "vertex", virtualStyle: styles.virtual}),
        selectfeature: new OpenLayers.Control.SelectFeature(vectors),
        measure: new OpenLayers.Control.Measure(OpenLayers.Handler.Path, {persist: true, immediate: true})
    };
    
    $('#measure-cancel').click(function () {
        drawControls.measure.cancel();
        $('#measure-distance').val("");
    });
    drawControls.measure.events.register("measurepartial", drawControls.measure, handleMeasurements);
    drawControls.measure.events.register("measure", drawControls.measure, handleMeasurements);
    
    function handleMeasurements(event) {
        console.log('handleMeasurements', event);
        displayMeasure(document.getElementById('measure-distance'), event.order, event.units, event.measure);
    }
    
    function displayMeasure(element, order, units, measure) {
        console.log('displayMeasure(element, order, units, measure)', element, order, units, measure);
        var val = calculateDistance(scale, order, units, measure);
        var out = "";
        if(order == 1) {
            out += val.toFixed(0) + " units";
        } else {
            out += val.toFixed(0) + " units<sup>2</" + "sup>";
        }
        element.value = out;
    }
    
    function createSketchCompletedHandler(key) {
        return function (event) {
            if (drawControls[key].active) {
                console.log('createSketchCompletedHandler', key);
                //event.feature.attributes.renderIntent = key;
                //event.feature.renderIntent = key;
                event.feature.attributes.style = getStyle(key);
            }
        }
    }
    
    var onSketchCompletedHandlers = {
        brush: createSketchCompletedHandler('brush'),
        icon: createSketchCompletedHandler('icon'),
        line: createSketchCompletedHandler('line'),
        polygon: createSketchCompletedHandler('polygon'),
        regularpolygon: createSketchCompletedHandler('regularpolygon')
    }

    // Modifying feature resets renderIntent to 'default'. Reset it to stored renderIntent and redraw feature.
    function onFeatureModified(event) {
        console.log("onFeatureModified");
        document.getElementById('draw-undo').disabled = false;
        document.getElementById('draw-redo').disabled = false;
        
    }
    function onBeforeFeatureModified(event) {
        console.log("onBeforeFeatureModified");
        document.getElementById('draw-undo').disabled = true;
        document.getElementById('draw-redo').disabled = true;
    }

    // Add controls to map
    for (var key in drawControls) {
        map.addControl(drawControls[key]);
        if (key == 'modify') {
            vectors.events.register("beforefeaturemodified", drawControls[key], onBeforeFeatureModified);
            vectors.events.register("afterfeaturemodified", drawControls[key], onFeatureModified);
        }
        else {
            vectors.events.register("sketchcomplete", drawControls[key], onSketchCompletedHandlers[key]);
        }
    }
            
    var historyControl = new UndoRedo([vectors]);
    map.addControl(historyControl);
            
    var exportControl = new ExportMap(map, vectors, document.getElementById('export'), map_tile_path);
    map.addControl(exportControl);
            
    var shareControl = new ShareMap(map, vectors, document.getElementById('share'), map_tile_path);
    map.addControl(shareControl);
            
    var saveControl = new SaveMap(map, vectors, document.getElementById('save'), saveHandlerUrl);
    map.addControl(saveControl);
    
    var measureControl = new OpenLayers.Control.Measure(OpenLayers.Handler.Path);
    map.addControl(measureControl);
    vectors.events.register("featureselected", drawControls.selectfeature, function (event) {
        console.log("featureselected", event);
        if (event.feature.geometry.CLASS_NAME.indexOf('LineString') > -1) {
            var data = measureControl.getBestLength(event.feature.geometry)
            console.log('distance', data);
            displayMeasure(document.getElementById('selectfeature-distance'), 1, data[1], data[0]);
        }
        else {
            console.log('area', measureControl.getBestArea(event.feature.geometry));
        }
    });
    
    // map position/zoom tracking querystring update
    map.events.register("zoomend", map, function(){
        setQueryString('zoom', map.zoom);
    });
    map.events.register("moveend", map, function(){
        var worldXY = imageToDota(map.center.lon, map.center.lat);
        setQueryString('x', worldXY.x.toFixed(0));
        setQueryString('y', worldXY.y.toFixed(0));
    });

    // Show/hide controls panel
    document.getElementById("controls-max").addEventListener("click", function(e) {
        $('#controls-container').removeClass('minimized');
        if (isSmallScreen()) {
            layerSwitcher.minimizeControl();
        }
        if (e) e.preventDefault();
    }, false);
    function minimizeControlList(e) {
        $('#controls-container').addClass('minimized');
        if (e) e.preventDefault();
    }
    document.getElementById("controls-min").addEventListener("click", minimizeControlList, false);
    
    // Check screen size
    function isSmallScreen() {
        return ((window.innerWidth > 0) ? window.innerWidth : screen.width) <= 768;
    }
    // Initially hide controls if screen is small
    if (isSmallScreen()) {
        minimizeControlList.call(document.getElementById("controls-min"));
        layerSwitcher.minimizeControl();
    }

    // tool switcher ui initialize
    $(".tool-radiobutton").checkboxradio({
        icon: false
    }).change(toggleControl);
    $("#map-tools").controlgroup({direction: "vertical"});
    
    $(".modify-tool-radiobutton").checkboxradio({
        icon: false
    }).change(toggleModifyControl);
    $(".tool-radiogroup").controlgroup();
    
    // undo/redo logic
    vectors.redoStack = [];
    function drawUndo() {
        console.log('undo');
        drawControls.selectfeature.unselectAll();
        historyControl.undo();
    }
    function drawRedo() {
        drawControls.selectfeature.unselectAll();
        historyControl.redo();
    }
    
    // undo/redo ui listen
    $('#draw-undo').click(drawUndo);
    $('#draw-redo').click(drawRedo);
    
    $('#modify-delete').click(modifyDeleteFeature);
    
    function modifyDeleteFeature() {
        var feature = drawControls.modify.feature;
        if (feature) {
            drawControls.modify.unselectFeature(feature);
            vectors.removeFeatures([feature]);
        }
    }
    
    // start jquery ui tooltips
    $( document ).tooltip();
    
    parseQueryString();
    
    $('.controls-container').show();
    
    $(".link-modal").dialog({
        autoOpen: false,
        modal: true,
        width: 'auto',
        buttons: {
            Ok: function() {
                $( this ).dialog( "close" );
            }
        }
    });
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./OpenLayers.Control.UndoRedo":41,"./OpenLayers.js":42,"./color-picker.js":43,"./coordinateconversion":44,"./exportmap":45,"./layerswitcher":47,"./querystringutil":48,"./rollbar":49,"./savemap":50,"./sharemap":51,"./sprite_manifest.json":52,"./widgets":53,"jquery-ui/ui/data":11,"jquery-ui/ui/disable-selection":12,"jquery-ui/ui/escape-selector":13,"jquery-ui/ui/focusable":14,"jquery-ui/ui/form":16,"jquery-ui/ui/form-reset-mixin":15,"jquery-ui/ui/ie":17,"jquery-ui/ui/keycode":18,"jquery-ui/ui/labels":19,"jquery-ui/ui/plugin":20,"jquery-ui/ui/position":21,"jquery-ui/ui/safe-active-element":22,"jquery-ui/ui/safe-blur":23,"jquery-ui/ui/scroll-parent":24,"jquery-ui/ui/tabbable":25,"jquery-ui/ui/unique-id":26,"jquery-ui/ui/version":27,"jquery-ui/ui/widget":28,"jquery-ui/ui/widgets/button":29,"jquery-ui/ui/widgets/checkboxradio":30,"jquery-ui/ui/widgets/controlgroup":31,"jquery-ui/ui/widgets/dialog":32,"jquery-ui/ui/widgets/draggable":33,"jquery-ui/ui/widgets/menu":34,"jquery-ui/ui/widgets/mouse":35,"jquery-ui/ui/widgets/resizable":36,"jquery-ui/ui/widgets/selectmenu":37,"jquery-ui/ui/widgets/spinner":38,"jquery-ui/ui/widgets/tooltip":39}],47:[function(require,module,exports){
var OpenLayers = require("./OpenLayers.js");

module.exports = OpenLayers.Class(OpenLayers.Control.LayerSwitcher, {
    
    onButtonClickCallback: null,
    
    initialize: function(options, onButtonClickCallback) {
        OpenLayers.Control.LayerSwitcher.prototype.initialize.apply(this, arguments);
        this.onButtonClickCallback = onButtonClickCallback;
    },
    
    onButtonClick: function(evt) {
        if (this.onButtonClickCallback) this.onButtonClickCallback(evt);
        return OpenLayers.Control.LayerSwitcher.prototype.onButtonClick.apply(this, arguments);
    },
    
    maximizeControl: function(e) {
        OpenLayers.Element.removeClass(this.div, "minimized");
        
        this.showControls(false);

        if (e != null) {
            OpenLayers.Event.stop(e);
        }
    },

    minimizeControl: function(e) {
        OpenLayers.Element.addClass(this.div, "minimized");

        this.showControls(true);

        if (e != null) {
            OpenLayers.Event.stop(e);
        }
    },
    
    loadContents: function() {

        // layers list div
        this.layersDiv = document.createElement("div");
        this.layersDiv.id = this.id + "_layersDiv";
        OpenLayers.Element.addClass(this.layersDiv, "layersDiv");

        this.baseLbl = document.createElement("div");
        this.baseLbl.innerHTML = OpenLayers.i18n("Base Layer");
        OpenLayers.Element.addClass(this.baseLbl, "baseLbl");

        this.baseLayersDiv = document.createElement("div");
        OpenLayers.Element.addClass(this.baseLayersDiv, "baseLayersDiv");

        this.dataLbl = document.createElement("div");
        this.dataLbl.innerHTML = OpenLayers.i18n("Overlays");
        OpenLayers.Element.addClass(this.dataLbl, "dataLbl");

        this.dataLayersDiv = document.createElement("div");
        OpenLayers.Element.addClass(this.dataLayersDiv, "dataLayersDiv");

        if (this.ascending) {
            this.layersDiv.appendChild(this.baseLbl);
            this.layersDiv.appendChild(this.baseLayersDiv);
            this.layersDiv.appendChild(this.dataLbl);
            this.layersDiv.appendChild(this.dataLayersDiv);
        } else {
            this.layersDiv.appendChild(this.dataLbl);
            this.layersDiv.appendChild(this.dataLayersDiv);
            this.layersDiv.appendChild(this.baseLbl);
            this.layersDiv.appendChild(this.baseLayersDiv);
        }

        this.div.appendChild(this.layersDiv);

        // maximize button div
        this.maximizeDiv = document.createElement("div");
        OpenLayers.Element.addClass(this.maximizeDiv, "OpenLayers_Control_MaximizeDiv maximizeDiv olButton");
        this.maximizeDiv.style.display = "none";

        this.div.appendChild(this.maximizeDiv);

        // minimize button div
        this.minimizeDiv = document.createElement("div");
        OpenLayers.Element.addClass(this.minimizeDiv, "OpenLayers_Control_MinimizeDiv minimizeDiv olButton");
        this.minimizeDiv.style.display = "none";

        this.minimizeDiv.innerHTML = '&times;';		
        
        var bars = document.createElement("i");
        OpenLayers.Element.addClass(bars, "fa fa-bars");
        this.maximizeDiv.appendChild(bars);
        
        this.div.appendChild(this.minimizeDiv);
    },
    
    CLASS_NAME : "OpenLayers.Control.LayerSwitcher"
});
},{"./OpenLayers.js":42}],48:[function(require,module,exports){
/***********************************
 * QUERY STRING FUNCTIONS *
 ***********************************/

var trim = (function() {
    "use strict";

    function escapeRegex(string) {
        return string.replace(/[\[\](){}?*+\^$\\.|\-]/g, "\\$&");
    }

    return function trim(str, characters, flags) {
        flags = flags || "g";
        if (typeof str !== "string" || typeof characters !== "string" || typeof flags !== "string") {
            throw new TypeError("argument must be string");
        }

        if (!/^[gi]*$/.test(flags)) {
            throw new TypeError("Invalid flags supplied '" + flags.match(new RegExp("[^gi]*")) + "'");
        }

        characters = escapeRegex(characters);

        return str.replace(new RegExp("^[" + characters + "]+|[" + characters + "]+$", flags), '');
    };
}());

var getParameterByName = function (name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

var setQueryString = function (key, value) {
    history.pushState(null, "", updateQueryString(key, value));
}

var addQueryStringValue = function (key, value) {
    console.log('addQueryStringValue', key, value);
    var qs = getParameterByName(key);
    qs = trim(trim(qs, ' ;') + ';' + value, ' ;');
    history.pushState(null, "", updateQueryString(key, qs));
}

var removeQueryStringValue = function (key, value) {
    console.log('removeQueryStringValue', key, value);
    var qs = getParameterByName(key);
    qs = trim(trim(qs, ' ;').replace(value, '').replace(/;;/g, ''), ' ;');
    history.pushState(null, "", updateQueryString(key, qs != '' ? qs : null));
}

var updateQueryString = function (key, value, url) {
    if (!url) url = window.location.href;
    var re = new RegExp("([?&])" + key + "=.*?(&|#|$)(.*)", "gi"),
        hash;

    if (re.test(url)) {
        if (typeof value !== 'undefined' && value !== null)
            return url.replace(re, '$1' + key + "=" + value + '$2$3');
        else {
            hash = url.split('#');
            url = hash[0].replace(re, '$1$3').replace(/(&|\?)$/, '');
            if (typeof hash[1] !== 'undefined' && hash[1] !== null)
                url += '#' + hash[1];
            return url;
        }
    } else {
        if (typeof value !== 'undefined' && value !== null) {
            var separator = url.indexOf('?') !== -1 ? '&' : '?';
            hash = url.split('#');
            url = hash[0] + separator + key + '=' + value;
            if (typeof hash[1] !== 'undefined' && hash[1] !== null)
                url += '#' + hash[1];
            return url;
        } else {
            return url;
        }
    }
}

module.exports = {
    trim: trim,
    getParameterByName: getParameterByName,
    setQueryString: setQueryString,
    addQueryStringValue: addQueryStringValue,
    removeQueryStringValue: removeQueryStringValue,
    updateQueryString: updateQueryString
}
},{}],49:[function(require,module,exports){
var Rollbar = require("rollbar-browser");

var rollbarConfig = {
    accessToken: "",
    captureUncaught: true,
    payload: {
        environment: "production",
        client: {
            javascript: {
                source_map_enabled: true,
                code_version: "563eb9367533eac6d1595fec5d78744411f4419c",
                // Optionally have Rollbar guess which frames the error was thrown from
                // when the browser does not provide line and column numbers.
                guess_uncaught_frames: true
            }
        }
    }
};

var rollbar = Rollbar.init(rollbarConfig);

module.exports = rollbar;
},{"rollbar-browser":40}],50:[function(require,module,exports){
(function (global){
var OpenLayers = require("./OpenLayers.js");
var $ = (typeof window !== "undefined" ? window['$'] : typeof global !== "undefined" ? global['$'] : null);
var setQueryString = require("./querystringutil").setQueryString;

module.exports = OpenLayers.Class(OpenLayers.Control, {

    layer: null,
    
    save: function () {
        // var parser = new OpenLayers.Format.GeoJSON()
        // var serialized = parser.write(this.layer.features);
        // console.log('savemap', {'data': serialized});
        // var request = new XMLHttpRequest();
        // request.open('POST', this.url, true);
        // request.setRequestHeader('Accept', 'application/json, text/javascript, */*; q=0.01');
        // request.setRequestHeader('Content-Type', 'application/json;charset=UTF-8"');
        
        // request.onload = function() {
            // if (request.status >= 200 && request.status < 400) {
                // Success!
                // var data = request.responseText;            
                // var saveLink = [location.protocol, '//', location.host, location.pathname].join('') + '?id=' + data.file;
                // console.log(saveLink);
            // }
            // else {
                // We reached our target server, but it returned an error
                // alert("Save request failed.");
            // }
        // };

        // request.onerror = function() {
            // There was a connection error of some sort
            // alert("Save request failed.");
        // };

        // request.send('{"data":' + serialized + '}');
        
        var parser = new OpenLayers.Format.GeoJSON()
        var serialized = parser.write(this.layer.features);
        console.log('savedrawing', {'data': serialized});
        $("#save-link").hide();
        $("#save-container").removeClass("has-link");
        $.ajax({
            type: "POST",
            url: this.url,
            data: {'data': serialized},
            dataType: "json",
            success: function (data){
                if (data.error) {
                    alert("Save request failed.");
                }
                else {
                    var saveLink = [location.protocol, '//', location.host, location.pathname].join('') + '?id=' + data.file;
                    console.log(saveLink);
                    setQueryString("id", data.file);
                    $("#save-container").addClass("has-link");
                    $("#save-link-message").attr("href", saveLink);
                    $("#save-link-message").text(saveLink);
                    $("#save-link").off("click").fadeIn();
                    $("#save-link").click(function () {
                        $("#save-link-modal").dialog("open");
                    });
                }
            },
            failure: function (errMsg) {
                alert("Save request failed.");
            }
        });
    },
    
    initialize: function(map, layer, div, url, options) {
        OpenLayers.Control.prototype.initialize.apply(this, [options]);
        this.map = map;
        this.layer = layer;
        this.div = div;
        this.url = url;
        this.div.addEventListener('click', this.save.bind(this), false);
    },

    CLASS_NAME: "OpenLayers.Control.SaveMap"
});
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./OpenLayers.js":42,"./querystringutil":48}],51:[function(require,module,exports){
(function (global){
var OpenLayers = require("./OpenLayers.js");
var ExportMap = require("./exportmap");
var $ = (typeof window !== "undefined" ? window['$'] : typeof global !== "undefined" ? global['$'] : null);

module.exports = OpenLayers.Class(ExportMap, {
    
    id: "share-svg",
    
    doExport: function () {
        $("#share-link").hide();
        $("#share-container").removeClass("has-link");
        ExportMap.prototype.doExport.call(this);
    },
    
    downloadCanvas: function (_canvasObject) {
        try {
            var img = _canvasObject.toDataURL('image/jpeg', .8).split(',')[1];
        } catch (e) {
            var img = _canvasObject.toDataURL().split(',')[1];
        }
        console.log('window', window);
        console.log('this', this);
        console.log('global', global);
        //w.document.write(img);
        // upload to imgur using jquery/CORS
        // https://developer.mozilla.org/En/HTTP_access_control
        $.ajax({
            url: 'https://api.imgur.com/3/image',
            type: 'POST',
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', 'Client-ID ' + 'e6d3cc2364556b2');
            },
            data: {
                type: 'base64',
                // get your key here, quick and fast http://imgur.com/register/api_anon
                //key: 'e6d3cc2364556b2',
                //name: 'neon.jpg',
                //title: 'test title',
                //caption: 'test caption',
                image: img
            },
            dataType: 'json',
            success: function (data){                
                $("#share-container").addClass("has-link");
                $("#share-link-message").attr("href", data.data.link);
                $("#share-link-message").text(data.data.link);
                $("#share-link").off("click").fadeIn();
                $("#share-link").click(function () {
                    $("#share-link-modal").dialog("open");
                });
            },
            failure: function (errMsg) {
                alert('Could not reach api.imgur.com. Sorry :(');
            }
        });
    },
    
    CLASS_NAME: "OpenLayers.Control.ShareMap"
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./OpenLayers.js":42,"./exportmap":45}],52:[function(require,module,exports){
module.exports={
    "heroes": [
        {
            "file": "abaddon.png", 
            "id": "abaddon", 
            "name": "Abaddon"
        }, 
        {
            "file": "alchemist.png", 
            "id": "alchemist", 
            "name": "Alchemist"
        }, 
        {
            "file": "ancient_apparition.png", 
            "id": "ancient_apparition", 
            "name": "Ancient Apparition"
        }, 
        {
            "file": "antimage.png", 
            "id": "antimage", 
            "name": "Anti-Mage"
        }, 
        {
            "file": "arc_warden.png", 
            "id": "arc_warden", 
            "name": "Arc Warden"
        }, 
        {
            "file": "axe.png", 
            "id": "axe", 
            "name": "Axe"
        }, 
        {
            "file": "bane.png", 
            "id": "bane", 
            "name": "Bane"
        }, 
        {
            "file": "batrider.png", 
            "id": "batrider", 
            "name": "Batrider"
        }, 
        {
            "file": "beastmaster.png", 
            "id": "beastmaster", 
            "name": "Beastmaster"
        }, 
        {
            "file": "bloodseeker.png", 
            "id": "bloodseeker", 
            "name": "Bloodseeker"
        }, 
        {
            "file": "bounty_hunter.png", 
            "id": "bounty_hunter", 
            "name": "Bounty Hunter"
        }, 
        {
            "file": "brewmaster.png", 
            "id": "brewmaster", 
            "name": "Brewmaster"
        }, 
        {
            "file": "bristleback.png", 
            "id": "bristleback", 
            "name": "Bristleback"
        }, 
        {
            "file": "broodmother.png", 
            "id": "broodmother", 
            "name": "Broodmother"
        }, 
        {
            "file": "centaur.png", 
            "id": "centaur", 
            "name": "Centaur Warrunner"
        }, 
        {
            "file": "chaos_knight.png", 
            "id": "chaos_knight", 
            "name": "Chaos Knight"
        }, 
        {
            "file": "chen.png", 
            "id": "chen", 
            "name": "Chen"
        }, 
        {
            "file": "clinkz.png", 
            "id": "clinkz", 
            "name": "Clinkz"
        }, 
        {
            "file": "rattletrap.png", 
            "id": "rattletrap", 
            "name": "Clockwerk"
        }, 
        {
            "file": "crystal_maiden.png", 
            "id": "crystal_maiden", 
            "name": "Crystal Maiden"
        }, 
        {
            "file": "crystal_maiden_alt1.png", 
            "id": "crystal_maiden_alt1", 
            "name": "Crystal Maiden Alt"
        }, 
        {
            "file": "dark_seer.png", 
            "id": "dark_seer", 
            "name": "Dark Seer"
        }, 
        {
            "file": "dazzle.png", 
            "id": "dazzle", 
            "name": "Dazzle"
        }, 
        {
            "file": "death_prophet.png", 
            "id": "death_prophet", 
            "name": "Death Prophet"
        }, 
        {
            "file": "disruptor.png", 
            "id": "disruptor", 
            "name": "Disruptor"
        }, 
        {
            "file": "doom_bringer.png", 
            "id": "doom_bringer", 
            "name": "Doom"
        }, 
        {
            "file": "dragon_knight.png", 
            "id": "dragon_knight", 
            "name": "Dragon Knight"
        }, 
        {
            "file": "drow_ranger.png", 
            "id": "drow_ranger", 
            "name": "Drow Ranger"
        }, 
        {
            "file": "earth_spirit.png", 
            "id": "earth_spirit", 
            "name": "Earth Spirit"
        }, 
        {
            "file": "earthshaker.png", 
            "id": "earthshaker", 
            "name": "Earthshaker"
        }, 
        {
            "file": "elder_titan.png", 
            "id": "elder_titan", 
            "name": "Elder Titan"
        }, 
        {
            "file": "ember_spirit.png", 
            "id": "ember_spirit", 
            "name": "Ember Spirit"
        }, 
        {
            "file": "enchantress.png", 
            "id": "enchantress", 
            "name": "Enchantress"
        }, 
        {
            "file": "enigma.png", 
            "id": "enigma", 
            "name": "Enigma"
        }, 
        {
            "file": "faceless_void.png", 
            "id": "faceless_void", 
            "name": "Faceless Void"
        }, 
        {
            "file": "gyrocopter.png", 
            "id": "gyrocopter", 
            "name": "Gyrocopter"
        }, 
        {
            "file": "huskar.png", 
            "id": "huskar", 
            "name": "Huskar"
        }, 
        {
            "file": "invoker.png", 
            "id": "invoker", 
            "name": "Invoker"
        }, 
        {
            "file": "wisp.png", 
            "id": "wisp", 
            "name": "Io"
        }, 
        {
            "file": "jakiro.png", 
            "id": "jakiro", 
            "name": "Jakiro"
        }, 
        {
            "file": "juggernaut.png", 
            "id": "juggernaut", 
            "name": "Juggernaut"
        }, 
        {
            "file": "keeper_of_the_light.png", 
            "id": "keeper_of_the_light", 
            "name": "Keeper of the Light"
        }, 
        {
            "file": "kunkka.png", 
            "id": "kunkka", 
            "name": "Kunkka"
        }, 
        {
            "file": "legion_commander.png", 
            "id": "legion_commander", 
            "name": "Legion Commander"
        }, 
        {
            "file": "legion_commander_alt1.png", 
            "id": "legion_commander_alt1", 
            "name": "Legion Commander Alt"
        }, 
        {
            "file": "leshrac.png", 
            "id": "leshrac", 
            "name": "Leshrac"
        }, 
        {
            "file": "lich.png", 
            "id": "lich", 
            "name": "Lich"
        }, 
        {
            "file": "life_stealer.png", 
            "id": "life_stealer", 
            "name": "Lifestealer"
        }, 
        {
            "file": "lina.png", 
            "id": "lina", 
            "name": "Lina"
        }, 
        {
            "file": "lina_alt1.png", 
            "id": "lina_alt1", 
            "name": "Lina Alt"
        }, 
        {
            "file": "lion.png", 
            "id": "lion", 
            "name": "Lion"
        }, 
        {
            "file": "lone_druid.png", 
            "id": "lone_druid", 
            "name": "Lone Druid"
        }, 
        {
            "file": "luna.png", 
            "id": "luna", 
            "name": "Luna"
        }, 
        {
            "file": "lycan.png", 
            "id": "lycan", 
            "name": "Lycan"
        }, 
        {
            "file": "magnataur.png", 
            "id": "magnataur", 
            "name": "Magnus"
        }, 
        {
            "file": "medusa.png", 
            "id": "medusa", 
            "name": "Medusa"
        }, 
        {
            "file": "meepo.png", 
            "id": "meepo", 
            "name": "Meepo"
        }, 
        {
            "file": "mirana.png", 
            "id": "mirana", 
            "name": "Mirana"
        }, 
        {
            "file": "morphling.png", 
            "id": "morphling", 
            "name": "Morphling"
        }, 
        {
            "file": "naga_siren.png", 
            "id": "naga_siren", 
            "name": "Naga Siren"
        }, 
        {
            "file": "furion.png", 
            "id": "furion", 
            "name": "Nature's Prophet"
        }, 
        {
            "file": "necrolyte.png", 
            "id": "necrolyte", 
            "name": "Necrophos"
        }, 
        {
            "file": "night_stalker.png", 
            "id": "night_stalker", 
            "name": "Night Stalker"
        }, 
        {
            "file": "nyx_assassin.png", 
            "id": "nyx_assassin", 
            "name": "Nyx Assassin"
        }, 
        {
            "file": "ogre_magi.png", 
            "id": "ogre_magi", 
            "name": "Ogre Magi"
        }, 
        {
            "file": "omniknight.png", 
            "id": "omniknight", 
            "name": "Omniknight"
        }, 
        {
            "file": "oracle.png", 
            "id": "oracle", 
            "name": "Oracle"
        }, 
        {
            "file": "obsidian_destroyer.png", 
            "id": "obsidian_destroyer", 
            "name": "Outworld Devourer"
        }, 
        {
            "file": "phantom_assassin.png", 
            "id": "phantom_assassin", 
            "name": "Phantom Assassin"
        }, 
        {
            "file": "phantom_assassin_alt1.png", 
            "id": "phantom_assassin_alt1", 
            "name": "Phantom Assassin Alt"
        }, 
        {
            "file": "phantom_lancer.png", 
            "id": "phantom_lancer", 
            "name": "Phantom Lancer"
        }, 
        {
            "file": "phoenix.png", 
            "id": "phoenix", 
            "name": "Phoenix"
        }, 
        {
            "file": "puck.png", 
            "id": "puck", 
            "name": "Puck"
        }, 
        {
            "file": "pudge.png", 
            "id": "pudge", 
            "name": "Pudge"
        }, 
        {
            "file": "pugna.png", 
            "id": "pugna", 
            "name": "Pugna"
        }, 
        {
            "file": "queenofpain.png", 
            "id": "queenofpain", 
            "name": "Queen of Pain"
        }, 
        {
            "file": "razor.png", 
            "id": "razor", 
            "name": "Razor"
        }, 
        {
            "file": "riki.png", 
            "id": "riki", 
            "name": "Riki"
        }, 
        {
            "file": "rubick.png", 
            "id": "rubick", 
            "name": "Rubick"
        }, 
        {
            "file": "sand_king.png", 
            "id": "sand_king", 
            "name": "Sand King"
        }, 
        {
            "file": "shadow_demon.png", 
            "id": "shadow_demon", 
            "name": "Shadow Demon"
        }, 
        {
            "file": "nevermore.png", 
            "id": "nevermore", 
            "name": "Shadow Fiend"
        }, 
        {
            "file": "nevermore_alt1.png", 
            "id": "nevermore_alt1", 
            "name": "Shadow Fiend Alt"
        }, 
        {
            "file": "shadow_shaman.png", 
            "id": "shadow_shaman", 
            "name": "Shadow Shaman"
        }, 
        {
            "file": "silencer.png", 
            "id": "silencer", 
            "name": "Silencer"
        }, 
        {
            "file": "skywrath_mage.png", 
            "id": "skywrath_mage", 
            "name": "Skywrath Mage"
        }, 
        {
            "file": "slardar.png", 
            "id": "slardar", 
            "name": "Slardar"
        }, 
        {
            "file": "slark.png", 
            "id": "slark", 
            "name": "Slark"
        }, 
        {
            "file": "sniper.png", 
            "id": "sniper", 
            "name": "Sniper"
        }, 
        {
            "file": "spectre.png", 
            "id": "spectre", 
            "name": "Spectre"
        }, 
        {
            "file": "spirit_breaker.png", 
            "id": "spirit_breaker", 
            "name": "Spirit Breaker"
        }, 
        {
            "file": "storm_spirit.png", 
            "id": "storm_spirit", 
            "name": "Storm Spirit"
        }, 
        {
            "file": "sven.png", 
            "id": "sven", 
            "name": "Sven"
        }, 
        {
            "file": "techies.png", 
            "id": "techies", 
            "name": "Techies"
        }, 
        {
            "file": "techies_alt1.png", 
            "id": "techies_alt1", 
            "name": "Techies Alt"
        }, 
        {
            "file": "templar_assassin.png", 
            "id": "templar_assassin", 
            "name": "Templar Assassin"
        }, 
        {
            "file": "terrorblade.png", 
            "id": "terrorblade", 
            "name": "Terrorblade"
        }, 
        {
            "file": "terrorblade_alt1.png", 
            "id": "terrorblade_alt1", 
            "name": "Terrorblade Alt"
        }, 
        {
            "file": "tidehunter.png", 
            "id": "tidehunter", 
            "name": "Tidehunter"
        }, 
        {
            "file": "shredder.png", 
            "id": "shredder", 
            "name": "Timbersaw"
        }, 
        {
            "file": "tinker.png", 
            "id": "tinker", 
            "name": "Tinker"
        }, 
        {
            "file": "tiny.png", 
            "id": "tiny", 
            "name": "Tiny"
        }, 
        {
            "file": "treant.png", 
            "id": "treant", 
            "name": "Treant Protector"
        }, 
        {
            "file": "troll_warlord.png", 
            "id": "troll_warlord", 
            "name": "Troll Warlord"
        }, 
        {
            "file": "tusk.png", 
            "id": "tusk", 
            "name": "Tusk"
        }, 
        {
            "file": "abyssal_underlord.png", 
            "id": "abyssal_underlord", 
            "name": "Underlord"
        }, 
        {
            "file": "undying.png", 
            "id": "undying", 
            "name": "Undying"
        }, 
        {
            "file": "ursa.png", 
            "id": "ursa", 
            "name": "Ursa"
        }, 
        {
            "file": "vengefulspirit.png", 
            "id": "vengefulspirit", 
            "name": "Vengeful Spirit"
        }, 
        {
            "file": "venomancer.png", 
            "id": "venomancer", 
            "name": "Venomancer"
        }, 
        {
            "file": "viper.png", 
            "id": "viper", 
            "name": "Viper"
        }, 
        {
            "file": "visage.png", 
            "id": "visage", 
            "name": "Visage"
        }, 
        {
            "file": "warlock.png", 
            "id": "warlock", 
            "name": "Warlock"
        }, 
        {
            "file": "weaver.png", 
            "id": "weaver", 
            "name": "Weaver"
        }, 
        {
            "file": "windrunner.png", 
            "id": "windrunner", 
            "name": "Windranger"
        }, 
        {
            "file": "winter_wyvern.png", 
            "id": "winter_wyvern", 
            "name": "Winter Wyvern"
        }, 
        {
            "file": "witch_doctor.png", 
            "id": "witch_doctor", 
            "name": "Witch Doctor"
        }, 
        {
            "file": "skeleton_king.png", 
            "id": "skeleton_king", 
            "name": "Wraith King"
        }, 
        {
            "file": "zuus.png", 
            "id": "zuus", 
            "name": "Zeus"
        }, 
        {
            "file": "zuus_alt1.png", 
            "id": "zuus_alt1", 
            "name": "Zeus Alt"
        }, 
        {
            "file": "monkey_king.png", 
            "id": "monkey_king", 
            "name": "Monkey King"
        }
    ], 
    "other": [
        {
            "file": "ward_observer.png", 
            "id": "ward_observer", 
            "name": "Observer Ward"
        }, 
        {
            "file": "bm_earth.png", 
            "id": "bm_earth", 
            "name": "Primal Split - Earth"
        }, 
        {
            "file": "bm_fire.png", 
            "id": "bm_fire", 
            "name": "Primal Split - Fire"
        }, 
        {
            "file": "bm_storm.png", 
            "id": "bm_storm", 
            "name": "Primal Split - Storm"
        }, 
        {
            "file": "roshan.png", 
            "id": "roshan", 
            "name": "Roshan"
        }, 
        {
            "file": "ward_sentry.png", 
            "id": "ward_sentry", 
            "name": "Sentry Ward"
        }
    ]
}
},{}],53:[function(require,module,exports){
(function (global){
var $ = (typeof window !== "undefined" ? window['$'] : typeof global !== "undefined" ? global['$'] : null);
require("jquery-ui/ui/version");
require("jquery-ui/ui/safe-active-element");
require("jquery-ui/ui/widget");
require("jquery-ui/ui/escape-selector");
require("jquery-ui/ui/form-reset-mixin");
require("jquery-ui/ui/keycode");
require("jquery-ui/ui/labels");
require("jquery-ui/ui/position");
require("jquery-ui/ui/unique-id");
require("jquery-ui/ui/widgets/button");
require("jquery-ui/ui/widgets/menu");
var spinner = require("jquery-ui/ui/widgets/spinner");
var selectmenu = require("jquery-ui/ui/widgets/selectmenu");

/**************
 * UI WIDGETS *
 **************/

var formatDegree = function (value) {
    return value + '\u00B0';
}

var degreespinner = $.widget( "ui.degreespinner", $.ui.spinner, {
    _format: formatDegree,
    _parse: function(value) { return parseFloat(value); }
})

var formatPercent = function (value) {
    return value + '%';
}

var percentspinner = $.widget( "ui.percentspinner", $.ui.spinner, {
    _format: formatPercent,
    _parse: function(value) { return parseFloat(value); }
});

var iconselectmenu = $.widget("custom.iconselectmenu", $.ui.selectmenu, {
    _renderItem: function(ul, item) {
        var li = $("<li>"),
            wrapper = $("<div>");

        if (item.disabled) {
            li.addClass("ui-state-disabled");
        }

        $("<div>", {
                "class": 'selectmenu-label',
                text: item.label
            })
            .appendTo(wrapper);
            
        $("<div>", {
                style: item.element.attr("data-style"),
                "class": "selectmenu-icon " + item.element.attr("data-class")
            })
            .appendTo(wrapper);

        return li.append(wrapper).appendTo(ul);
    }
});

module.exports = {
    formatDegree: formatDegree,
    degreespinner: degreespinner,
    formatPercent: formatPercent,
    percentspinner: percentspinner,
    iconselectmenu: iconselectmenu
};
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"jquery-ui/ui/escape-selector":13,"jquery-ui/ui/form-reset-mixin":15,"jquery-ui/ui/keycode":18,"jquery-ui/ui/labels":19,"jquery-ui/ui/position":21,"jquery-ui/ui/safe-active-element":22,"jquery-ui/ui/unique-id":26,"jquery-ui/ui/version":27,"jquery-ui/ui/widget":28,"jquery-ui/ui/widgets/button":29,"jquery-ui/ui/widgets/menu":34,"jquery-ui/ui/widgets/selectmenu":37,"jquery-ui/ui/widgets/spinner":38}]},{},[46])(46)
});
//# sourceMappingURL=bundle-563eb93.js.map
