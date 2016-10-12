'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _postcss = require('postcss');

var _postcss2 = _interopRequireDefault(_postcss);

var _postcssMoveMedia = require('postcss-move-media');

var _postcssMoveMedia2 = _interopRequireDefault(_postcssMoveMedia);

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
      (0, _postcss2['default'])().use(_postcssMoveMedia2['default']).use(_autoprefixer2['default']).process(contents).then(function (processor) {
        var result = processor.toString();
        callback(null, result);
      });
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