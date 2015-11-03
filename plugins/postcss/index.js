'use strict';

import postcss from 'postcss';
import pcimport from 'postcss-import';
import pcprops from 'postcss-custom-properties';
import pcmedia from 'postcss-custom-media';
import pcsvgfallback from 'postcss-svg-fallback';
import pccalc from 'postcss-calc';
import pccolor from 'postcss-color-function';
import pcprefix from 'autoprefixer';

import {parallel} from 'async';
import {debug, extend, map, match} from '../../utils';

let log = debug('metalsmith:postcss');

const DEFAULTS = {
  pattern: '**/*.css'
};

export default function (options) {
  options = extend({}, DEFAULTS, options);

  let {pattern} = options;

  let processor = function (contents, callback) {
    try {
      let result = postcss([
          pcimport(options['import']),
          pcprops(options['props']),
          pcmedia(options['media']),
          pcsvgfallback(),
          pccalc(),
          pccolor(),
          pcprefix()
        ])
        .process(contents);

      callback(null, result);
    } catch (err) {
      callback(err);
    }
  };

  return function (files, metalsmith, done) {
    let tasks = map(files, function (data, file) {
      return function (callback) {
        if (!match(file, pattern)) {
          return callback();
        }

        let contents = data.contents.toString();
        let processed = function (err, contents) {
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

    parallel(tasks, function (err) {
      if (err) {
        return done(err);
      }

      done();
    });
  };
}
