'use strict';

import {debug, each, extend, map, max, omit, pluck, reduce} from '../../utils';

let log = debug('metalsmith:categories');

const DEFAULTS = {
  weights: ['s', 'm', 'l']
};

export default function (options) {
  options = extend({}, DEFAULTS, options);

  let {index, individual, weights} = options;

  return function (files, metalsmith, done) {
    var metadata = metalsmith.metadata();
    var collections = metadata.collections;

    let categories = reduce(collections[index.collection], function (memo, data) {
      each(data.categories, function (category) {
        if (memo[category] == null) {
          memo[category] = [];
        }

        memo[category].push(data);
      });

      return memo;
    }, {});

    let biggest = max(pluck(categories, 'length'));

    log('adding index %s with attributes %o', index.path, omit(index, 'collection'));
    files[index.path] = index;

    index.collection = map(categories, function (items, category) {
      let slug = category.toLowerCase().replace(/\s+/, '-');
      let title = category.replace(/(.*)/, individual.title);
      let subtitle = category.replace(/(.*)/, individual.title);
      let file = slug.replace(/(.*)/, individual.path);
      let weight = Math.round((weights.length - 1) * items.length / biggest);

      return extend({}, individual, {
        path: file,
        name: category,
        title: title,
        subtitle: subtitle,
        collection: items,
        weight: weights[weight]
      });
    });

    let comparator = function (a, b) {
      a = a.name;
      b = b.name;

      return (a > b) ? 1 : (a < b) ? -1 : 0;
    };
    
    log('sorting categories in index %s', index.path);
    index.collection.sort(comparator);
    
    each(index.collection, function (data) {
      log('adding category %s with attributes %o', data.path, omit(data, 'collection'));
      files[data.path] = data;
    });

    done();
  };
}
