"use strict";

var debug = require('debug')('document-color'),
    ColorScheme = require('color-scheme');

exports["default"] = function () {
  return function (files) {
    
    function encode(s, d)
    {
        var hash = (d+s).split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);
        
        var deg = hash.toString().substring(0, 3).replace('-', '');
        if (deg <= 360) {
          var deg = 360/(deg/360);
        }
        
        return deg;
    };

    Object.keys(files).forEach(function (filename) {
      if (!files[filename].filename) {
        var scheme = new ColorScheme;
        if (typeof files[filename].slug != 'undefined' && typeof files[filename].excerpt != 'undefined') {
          var hue = encode(files[filename].slug, files[filename].excerpt);
          scheme
            .from_hue(hue) 
            .scheme('tetrade')     // Use the 'triade' scheme, that is, colors 
                                  // selected from 3 points equidistant around 
                                  // the color wheel. 
            .variation('pastel');   // Use the 'soft' color variation 
          files[filename].colors = scheme.colors();

        }
      }
    });
  };
};

module.exports = exports["default"];