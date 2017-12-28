require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({32:[function(require,module,exports){
var bsn = require("bootstrap.native");

function findAncestor (el, cls) {
    while ((el = el.parentElement) && !el.classList.contains(cls));
    return el;
}

// initialize sidebar if it exists
if (document.querySelector('.bs-docs-sidebar')) {
    new bsn.ScrollSpy(document.body, {
        target: '.bs-docs-sidebar'
    });
    document.body.addEventListener('activate.bs.scrollspy', function (event) {
        [].forEach.call(document.querySelectorAll('.sidenav-group'), function (element) {
            element.classList.remove('group-active');
        });
        var group = findAncestor(event.relatedTarget, 'sidenav-group');
        group.classList.add('group-active');
    });
}

// initialize disqus if it exists
if (document.getElementById('disqus_thread')) {
    /* * * CONFIGURATION VARIABLES * * */
    var disqus_shortname = 'devileskdota';
    
    /* * * DON'T EDIT BELOW THIS LINE * * */
    (function() {
        var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
        dsq.src = '//' + disqus_shortname + '.disqus.com/embed.js';
        (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
    })();
}

[].forEach.call(document.querySelectorAll('link[href*="gist-embed"]'), function(element) {
    element.parentNode.removeChild(element);
});

if (document.getElementById('search-heroes')) {
    document.getElementById('search-heroes').addEventListener('keyup', function(event) {
        var searchVal = this.value.toLowerCase();
        var elems = document.querySelectorAll(".hero");
        for (var i = 0; i < elems.length; i++) {
            var el = elems[i];
            el.classList.remove("no-match");
        }
        
        [].filter.call(elems, function (element) {
            var s = element.querySelector('.portraits-sprite-64x84').title.toLowerCase();
            return element.getAttribute('href').toLowerCase().indexOf(searchVal) === -1 && s.indexOf(searchVal) === -1 && s.match(/\b(\w)/g).join('').indexOf(searchVal) === -1;
        }).forEach(function (element) {
            element.classList.add("no-match");
        });
    });
}

},{"bootstrap.native":1}]},{},[32])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9mYWN0b3ItYnVuZGxlL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBic24gPSByZXF1aXJlKFwiYm9vdHN0cmFwLm5hdGl2ZVwiKTtcblxuZnVuY3Rpb24gZmluZEFuY2VzdG9yIChlbCwgY2xzKSB7XG4gICAgd2hpbGUgKChlbCA9IGVsLnBhcmVudEVsZW1lbnQpICYmICFlbC5jbGFzc0xpc3QuY29udGFpbnMoY2xzKSk7XG4gICAgcmV0dXJuIGVsO1xufVxuXG4vLyBpbml0aWFsaXplIHNpZGViYXIgaWYgaXQgZXhpc3RzXG5pZiAoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmJzLWRvY3Mtc2lkZWJhcicpKSB7XG4gICAgbmV3IGJzbi5TY3JvbGxTcHkoZG9jdW1lbnQuYm9keSwge1xuICAgICAgICB0YXJnZXQ6ICcuYnMtZG9jcy1zaWRlYmFyJ1xuICAgIH0pO1xuICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcignYWN0aXZhdGUuYnMuc2Nyb2xsc3B5JywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIFtdLmZvckVhY2guY2FsbChkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuc2lkZW5hdi1ncm91cCcpLCBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdncm91cC1hY3RpdmUnKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHZhciBncm91cCA9IGZpbmRBbmNlc3RvcihldmVudC5yZWxhdGVkVGFyZ2V0LCAnc2lkZW5hdi1ncm91cCcpO1xuICAgICAgICBncm91cC5jbGFzc0xpc3QuYWRkKCdncm91cC1hY3RpdmUnKTtcbiAgICB9KTtcbn1cblxuLy8gaW5pdGlhbGl6ZSBkaXNxdXMgaWYgaXQgZXhpc3RzXG5pZiAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Rpc3F1c190aHJlYWQnKSkge1xuICAgIC8qICogKiBDT05GSUdVUkFUSU9OIFZBUklBQkxFUyAqICogKi9cbiAgICB2YXIgZGlzcXVzX3Nob3J0bmFtZSA9ICdkZXZpbGVza2RvdGEnO1xuICAgIFxuICAgIC8qICogKiBET04nVCBFRElUIEJFTE9XIFRISVMgTElORSAqICogKi9cbiAgICAoZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBkc3EgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTsgZHNxLnR5cGUgPSAndGV4dC9qYXZhc2NyaXB0JzsgZHNxLmFzeW5jID0gdHJ1ZTtcbiAgICAgICAgZHNxLnNyYyA9ICcvLycgKyBkaXNxdXNfc2hvcnRuYW1lICsgJy5kaXNxdXMuY29tL2VtYmVkLmpzJztcbiAgICAgICAgKGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF0gfHwgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2JvZHknKVswXSkuYXBwZW5kQ2hpbGQoZHNxKTtcbiAgICB9KSgpO1xufVxuXG5bXS5mb3JFYWNoLmNhbGwoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnbGlua1tocmVmKj1cImdpc3QtZW1iZWRcIl0nKSwgZnVuY3Rpb24oZWxlbWVudCkge1xuICAgIGVsZW1lbnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChlbGVtZW50KTtcbn0pO1xuXG5pZiAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlYXJjaC1oZXJvZXMnKSkge1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZWFyY2gtaGVyb2VzJykuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICB2YXIgc2VhcmNoVmFsID0gdGhpcy52YWx1ZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICB2YXIgZWxlbXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLmhlcm9cIik7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZWxlbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBlbCA9IGVsZW1zW2ldO1xuICAgICAgICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZShcIm5vLW1hdGNoXCIpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBbXS5maWx0ZXIuY2FsbChlbGVtcywgZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgICAgIHZhciBzID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yKCcucG9ydHJhaXRzLXNwcml0ZS02NHg4NCcpLnRpdGxlLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICByZXR1cm4gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2hyZWYnKS50b0xvd2VyQ2FzZSgpLmluZGV4T2Yoc2VhcmNoVmFsKSA9PT0gLTEgJiYgcy5pbmRleE9mKHNlYXJjaFZhbCkgPT09IC0xICYmIHMubWF0Y2goL1xcYihcXHcpL2cpLmpvaW4oJycpLmluZGV4T2Yoc2VhcmNoVmFsKSA9PT0gLTE7XG4gICAgICAgIH0pLmZvckVhY2goZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZChcIm5vLW1hdGNoXCIpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn1cbiJdfQ==
