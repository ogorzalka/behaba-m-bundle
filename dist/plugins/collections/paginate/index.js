'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _utils = require('../../utils');

var log = (0, _utils.debug)('metalsmith:paginate');

var DEFAULTS = {
  pattern: '**/*'
};

exports['default'] = function (options) {
  options = (0, _utils.extend)({}, DEFAULTS, options);

  var _options = options;
  var pattern = _options.pattern;

  return function (files, metalsmith, done) {
    (0, _utils.each)(files, function (data, file) {
      var collection = data.collection;
      var paginate = data.paginate;

      var needsPagination = collection != null && paginate != null && collection.length > paginate;

      if (!(0, _utils.match)(file, pattern) || !needsPagination) {
        return;
      }

      var current = 0;
      var total = Math.ceil(collection.length / paginate);
      var pages = [data];

      (0, _utils.extend)(data, {
        current: current,
        total: total,
        pages: pages,
        collection: collection.slice(0, paginate)
      });

      (0, _utils.each)((0, _utils.range)(current + 1, total), function (i) {
        var next = (0, _utils.extend)({}, data, {
          path: data.path.replace(/\/([^\/]+)$/, '/' + (i + 1) + '/$1'),
          current: i,
          total: total,
          collection: collection.slice(i * paginate, (i + 1) * paginate)
        });

        pages.push(next);

        log('adding page %s with attributes %o', next.path, (0, _utils.omit)(next, 'collection', 'pages'));
        files[next.path] = next;
      });
    });

    done();
  };
};

module.exports = exports['default'];