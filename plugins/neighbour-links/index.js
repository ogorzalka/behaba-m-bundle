'use strict';

import {debug, each, extend, match} from '../../utils';

let log = debug('metalsmith:neighbour-links');

const DEFAULTS = {
};

export default function (options) {
  options = extend({}, DEFAULTS, options);

  return function (files, metalsmith, done) {
    let metadata = metalsmith.metadata();

    each(options, function (option, key) {

      let collection = metadata.collections[key];
      let {pattern, index, sortBy, reverse} = option;
      
      var next;
      var previous;

      
      each(collection, function (col, i) {

        if (!match(col.path, pattern) || collection == null) {
          return;
        }
        
        if (option.reverse == true) {
          if (option.loop == true) {
            previous = (i == collection.length - 1) ? collection[0] : collection[i+1];
            next = (i == 0) ? collection[collection.length - 1] : collection[i-1];
          } else {
            previous = (i == collection.length - 1) ? false : collection[i+1];
            next = (i == 0) ? false : collection[i-1];
          }
        } else {
          if (option.loop == true) {
            next = (i == collection.length - 1) ? collection[0] : collection[i+1];
            previous = (i == 0) ? collection[collection.length - 1] : collection[i-1];
          } else {
            next = (i == collection.length - 1) ? false : collection[i+1];
            previous = (i == 0) ? false : collection[i-1];
          }
        }

        files[col.path.replace('.md', '.html')] = extend({
          next: next,
          previous: previous
        }, files[col.path.replace('.md', '.html')]);
      });

    });

    done();
  };
}