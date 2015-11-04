'use strict';

(function () {
  'use strict';

  var nsg = require('node-sprite-generator'),
      createSprite = function createSprite(config, files, metalsmith, done) {

    nsg(config, done);

    /**
     * Looks up different key names on `metalsmith` to support
     * old versions (< v1) of Metalsmith. At some point, I will remove
     * support for < v1 and remove the key lookups
     */
    /*
    var directory = metalsmith.dir || metalsmith._directory,
       source = metalsmith._src || metalsmith._source,
       basePath = path.join(directory, source);
    each(Object.keys(files), compile.bind(null, config, basePath, files), done);
    */
  },
      plugin = function plugin(options) {
    var config = options || {};
    return createSprite.bind(null, config);
  };

  // exposing node-sass types for custom functions. see:
  // https://github.com/stevenschobert/metalsmith-sass/pull#21

  module.exports = plugin;
})();