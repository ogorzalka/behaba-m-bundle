"use strict";

var moment = require('moment');

Object.defineProperty(exports, "__esModule", {
  value: true
});

function getFileExtension(filename) {
  return (/[.]/.exec(filename)) ? /[^.]+$/.exec(filename) : undefined;
}

exports["default"] = function () {
  return function (files) {
    var explodePath, slug;
    
    moment.locale('fr');

    Object.keys(files).forEach(function (filename) {
      if (!files[filename].filename) {
        
        if (getFileExtension(filename) == 'html') {
          explodePath = filename.split('/');
          
          if (explodePath.length == 2 && explodePath[explodePath.length-1] == 'index.html') {
            slug = explodePath[explodePath.length-1].replace('.html', '');
          } else {
            if (explodePath[explodePath.length-1] == 'index.html') {
              slug = explodePath[explodePath.length-2].replace(/^[0-9]{4}-[0-9]{2}-[0-9]{2}-/, '');
            }
          }
          files[filename].slug = slug;
          
          files[filename].postdate = moment(files[filename].date, "YYYY-MM-DD").fromNow();
        }
      }
    });
  };
};

module.exports = exports['default'];