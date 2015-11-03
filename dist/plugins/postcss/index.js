'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _postcss = require('postcss');

var _postcss2 = _interopRequireDefault(_postcss);

var _postcssSvgFallback = require('postcss-svg-fallback');

var _postcssSvgFallback2 = _interopRequireDefault(_postcssSvgFallback);

var _autoprefixer = require('autoprefixer');

var _autoprefixer2 = _interopRequireDefault(_autoprefixer);

var _async = require('async');

var _utils = require('../../utils');

var log = (0, _utils.debug)('metalsmith:postcss');

var DEFAULTS = {
  pattern: '**/*.css'
};

exports['default'] = function (options) {
  options = (0, _utils.extend)({}, DEFAULTS, options);

  var _options = options;
  var pattern = _options.pattern;

  var processor = function processor(contents, callback) {
    try {
      var result = (0, _postcss2['default'])([(0, _postcssSvgFallback2['default'])(options['svg_fallback']), (0, _autoprefixer2['default'])()]).process(contents);

      callback(null, result);
    } catch (err) {
      callback(err);
    }
  };

  return function (files, metalsmith, done) {
    var tasks = (0, _utils.map)(files, function (data, file) {
      return function (callback) {
        if (!(0, _utils.match)(file, pattern)) {
          return callback();
        }

        var contents = data.contents.toString();
        var processed = function processed(err, contents) {
          if (err) {
            return callback(err);
          }

          data.contents = contents;
          callback();
        };

        log('processing %s', file);
        processor(contents, processed);
      };
    });

    (0, _async.parallel)(tasks, function (err) {
      if (err) {
        return done(err);
      }

      done();
    });
  };
};

module.exports = exports['default'];