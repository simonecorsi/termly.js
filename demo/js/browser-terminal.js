(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
'use strict';

/**
 * Shell Only
 * @type {Class}
 * Init the shell with command and filesystem
 * @method execute() exposed to query the Shell with commands
 */
global['Terminal'] = require('./classes/Terminal');

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./classes/Terminal":2}],2:[function(require,module,exports){
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Terminal
 * Wrapper on the Shell class
 * This will only handle the UI of the terminal.
 * You can use it or use directly the browser-shell.js
 * and create your custom UI calling and displaying the Shell.run() commands
 */
var Terminal = function Terminal(_ref) {
  var selector = _ref.selector;

  _classCallCheck(this, Terminal);

  if (!selector) throw new Error('No wrapper element selector provided');

  if (selector.match(/^\#.+/)) {
    try {
      this.container = document.getElementById(selector);
      if (this.container instanceof Node) throw new Error('Invalid DOM element');
    } catch (e) {
      throw new Error('Not valid DOM selector.');
    }
  }
};

module.exports = Terminal;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJiaW4vYnJvd3Nlci10ZXJtaW5hbC5qcyIsImJpbi9jbGFzc2VzL1Rlcm1pbmFsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7O0FDQUE7Ozs7OztBQU1BLE9BQU8sVUFBUCxJQUFxQixRQUFRLG9CQUFSLENBQXJCOzs7Ozs7Ozs7QUNOQTs7Ozs7OztJQU9NLFEsR0FDSix3QkFBMEI7QUFBQSxNQUFaLFFBQVksUUFBWixRQUFZOztBQUFBOztBQUN4QixNQUFJLENBQUMsUUFBTCxFQUFlLE1BQU0sSUFBSSxLQUFKLENBQVUsc0NBQVYsQ0FBTjs7QUFFZixNQUFJLFNBQVMsS0FBVCxDQUFlLE9BQWYsQ0FBSixFQUE2QjtBQUMzQixRQUFJO0FBQ0YsV0FBSyxTQUFMLEdBQWlCLFNBQVMsY0FBVCxDQUF3QixRQUF4QixDQUFqQjtBQUNBLFVBQUksS0FBSyxTQUFMLFlBQTBCLElBQTlCLEVBQW9DLE1BQU0sSUFBSSxLQUFKLENBQVUscUJBQVYsQ0FBTjtBQUNyQyxLQUhELENBR0UsT0FBTyxDQUFQLEVBQVU7QUFDVixZQUFNLElBQUksS0FBSixDQUFVLHlCQUFWLENBQU47QUFDRDtBQUNGO0FBQ0YsQzs7QUFHSCxPQUFPLE9BQVAsR0FBaUIsUUFBakIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXG4gKiBTaGVsbCBPbmx5XG4gKiBAdHlwZSB7Q2xhc3N9XG4gKiBJbml0IHRoZSBzaGVsbCB3aXRoIGNvbW1hbmQgYW5kIGZpbGVzeXN0ZW1cbiAqIEBtZXRob2QgZXhlY3V0ZSgpIGV4cG9zZWQgdG8gcXVlcnkgdGhlIFNoZWxsIHdpdGggY29tbWFuZHNcbiAqL1xuZ2xvYmFsWydUZXJtaW5hbCddID0gcmVxdWlyZSgnLi9jbGFzc2VzL1Rlcm1pbmFsJylcbiIsIi8qKlxuICogVGVybWluYWxcbiAqIFdyYXBwZXIgb24gdGhlIFNoZWxsIGNsYXNzXG4gKiBUaGlzIHdpbGwgb25seSBoYW5kbGUgdGhlIFVJIG9mIHRoZSB0ZXJtaW5hbC5cbiAqIFlvdSBjYW4gdXNlIGl0IG9yIHVzZSBkaXJlY3RseSB0aGUgYnJvd3Nlci1zaGVsbC5qc1xuICogYW5kIGNyZWF0ZSB5b3VyIGN1c3RvbSBVSSBjYWxsaW5nIGFuZCBkaXNwbGF5aW5nIHRoZSBTaGVsbC5ydW4oKSBjb21tYW5kc1xuICovXG5jbGFzcyBUZXJtaW5hbCB7XG4gIGNvbnN0cnVjdG9yKHsgc2VsZWN0b3IgfSkge1xuICAgIGlmICghc2VsZWN0b3IpIHRocm93IG5ldyBFcnJvcignTm8gd3JhcHBlciBlbGVtZW50IHNlbGVjdG9yIHByb3ZpZGVkJylcblxuICAgIGlmIChzZWxlY3Rvci5tYXRjaCgvXlxcIy4rLykpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHRoaXMuY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoc2VsZWN0b3IpXG4gICAgICAgIGlmICh0aGlzLmNvbnRhaW5lciBpbnN0YW5jZW9mIE5vZGUpIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBET00gZWxlbWVudCcpXG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTm90IHZhbGlkIERPTSBzZWxlY3Rvci4nKVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRlcm1pbmFsXG4iXX0=
