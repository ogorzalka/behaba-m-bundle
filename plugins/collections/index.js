'use strict';

import {debug, each, extend, match} from '../../utils';

let log = debug('metalsmith:collections');

const DEFAULTS = {
};

export default function (options) {
  options = extend({}, DEFAULTS, options);

  return function (files, metalsmith, done) {
    let metadata = metalsmith.metadata();
    let collections = {};

    each(options, function (option, key) {
      let collection = collections[key];
      if (collection == null) {
        collections[key] = collection = [];
      }

      let {pattern, index, sortBy, reverse} = option;

      each(files, function (data, file) {
        if (!match(file, pattern)) {
          return;
        }

        log('adding %s to collection \'%s\'', file, key);
        collection.push(data);
      });

      // Keep on chooglin' if there's nothing to sort by.
      if (sortBy == null) {
        return;
      }
      
      let convert = function (d) {
        // Converts the date in d to a date-object. The input can be:
        //   a date object: returned without modification
        //  an array      : Interpreted as [year,month,day]. NOTE: month is 0-11.
        //   a number     : Interpreted as number of milliseconds
        //                  since 1 Jan 1970 (a timestamp) 
        //   a string     : Any format supported by the javascript engine, like
        //                  "YYYY/MM/DD", "MM/DD/YYYY", "Jan 31 2009" etc.
        //  an object     : Interpreted as an object with year, month and date
        //                  attributes.  **NOTE** month is 0-11.
        return (
            d.constructor === Date ? d :
            d.constructor === Array ? new Date(d[0],d[1],d[2]) :
            d.constructor === Number ? new Date(d) :
            d.constructor === String ? new Date(d) :
            typeof d === "object" ? new Date(d.year,d.month,d.date) :
            NaN
        );
      };

      let comparator = function (a, b) {
        a = a[sortBy];
        b = b[sortBy];
        
        let res;
        
        if (sortBy == 'date') {
          res = isFinite(a=convert(a).valueOf()) && isFinite(b=convert(b).valueOf()) ? (a>b)-(a<b) : NaN;
        } else {
          res = (a > b) ? 1 : (a < b) ? -1 : 0;
        }
        return (reverse ? -1 : 1) * res;
      };

      log('sorting collection \'%s\' by field \'%s\'', key, sortBy);
      collection.sort(comparator);

      // Keep on chooglin' if we don't need to index.
      if (index == null) {
        return;
      }

      each(collection, function (item, i) {
        item.index = (i % index) + 1;
      });
    });

    metadata.collections = collections;

    done();
  };
}