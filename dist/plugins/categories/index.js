'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _utils = require('../../utils');

var log = (0, _utils.debug)('metalsmith:categories');

var DEFAULTS = {
  weights: ['s', 'm', 'l']
};

exports['default'] = function (options) {
  options = (0, _utils.extend)({}, DEFAULTS, options);

  var _options = options;
  var index = _options.index;
  var individual = _options.individual;
  var weights = _options.weights;

  return function (files, metalsmith, done) {
    var metadata = metalsmith.metadata();
    var collections = metadata.collections;

    var categories = (0, _utils.reduce)(collections[index.collection], function (memo, data) {
      (0, _utils.each)(data.categories, function (category) {
        if (memo[category] == null) {
          memo[category] = [];
        }

        memo[category].push(data);
      });

      return memo;
    }, {});

    var biggest = (0, _utils.max)((0, _utils.pluck)(categories, 'length'));

    log('adding index %s with attributes %o', index.path, (0, _utils.omit)(index, 'collection'));
    files[index.path] = index;

    index.collection = (0, _utils.map)(categories, function (items, category) {
      var slug = category.toLowerCase().replace(/\s+/, '-');
      var title = category.replace(/(.*)/, individual.title);
      var subtitle = category.replace(/(.*)/, individual.title);
      var file = slug.replace(/(.*)/, individual.path);
      var weight = Math.round((weights.length - 1) * items.length / biggest);

      return (0, _utils.extend)({}, individual, {
        path: file,
        name: category,
        title: title,
        subtitle: subtitle,
        collection: items,
        weight: weights[weight]
      });
    });

    var comparator = function comparator(a, b) {
      a = a.name;
      b = b.name;

      return a > b ? 1 : a < b ? -1 : 0;
    };

    log('sorting categories in index %s', index.path);
    index.collection.sort(comparator);

    (0, _utils.each)(index.collection, function (data) {
      log('adding category %s with attributes %o', data.path, (0, _utils.omit)(data, 'collection'));
      files[data.path] = data;
    });

    done();
  };
};

module.exports = exports['default'];