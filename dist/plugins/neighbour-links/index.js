'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _utils = require('../../utils');

var log = (0, _utils.debug)('metalsmith:neighbour-links');

var DEFAULTS = {};

exports['default'] = function (options) {
  options = (0, _utils.extend)({}, DEFAULTS, options);

  return function (files, metalsmith, done) {
    var metadata = metalsmith.metadata();

    (0, _utils.each)(options, function (option, key) {

      var collection = metadata.collections[key];
      var pattern = option.pattern;
      var index = option.index;
      var sortBy = option.sortBy;
      var reverse = option.reverse;

      var next;
      var previous;

      (0, _utils.each)(collection, function (col, i) {

        if (!(0, _utils.match)(col.path, pattern) || collection == null) {
          return;
        }

        if (option.reverse == true) {
          if (option.loop == true) {
            previous = i == collection.length - 1 ? collection[0] : collection[i + 1];
            next = i == 0 ? collection[collection.length - 1] : collection[i - 1];
          } else {
            previous = i == collection.length - 1 ? false : collection[i + 1];
            next = i == 0 ? false : collection[i - 1];
          }
        } else {
          if (option.loop == true) {
            next = i == collection.length - 1 ? collection[0] : collection[i + 1];
            previous = i == 0 ? collection[collection.length - 1] : collection[i - 1];
          } else {
            next = i == collection.length - 1 ? false : collection[i + 1];
            previous = i == 0 ? false : collection[i - 1];
          }
        }

        files[col.path.replace('.md', '.html')] = (0, _utils.extend)({
          next: next,
          previous: previous
        }, files[col.path.replace('.md', '.html')]);
      });
    });

    done();
  };
};

module.exports = exports['default'];