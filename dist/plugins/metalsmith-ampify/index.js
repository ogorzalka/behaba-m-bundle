'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var cheerio = require('cheerio');
var fs = require('fs');
var _path = require('path');
var sizeOf = require('image-size');
var request = require('sync-request');
var _utils = require('../../utils');
var _ = require('lodash');

var DEFAULTS = {
  pattern: '**',
  directory: 'templates'
};


exports["default"] = function (options) {
  options = _utils.extend({}, DEFAULTS, options);

  var _options = options;
  var pattern = _options.pattern;
  var template = _options.template;

  var ampify = function (html, folder, base_href) {
    try {
      var tags = {
        amp: ['img', 'video']
      };

      var $, round;
      var options = options || {};

      options.normalizeWhitespace = options.normalizeWhitespace || false;
      options.xmlMode = options.xmlMode || false;
      options.decodeEntities = options.decodeEntities || false;

      options.cwd = options.cwd || '';
      options.round = options.round || true;

      $ = cheerio.load(html, options);

      if (options.round) {
        round = function(numb) { return Math.round(numb / 5) * 5; }
      }
      else {
        round = function(numb) { return numb; }
      }
      // img dimensions
      $('img:not(width):not(height)').each(function() {
        var src = $(this).attr('src');
        if (src.indexOf('//') === -1) {
          var image = './source/' + folder + '/' + $(this).attr('src');

          if (fs.existsSync(image)) {
            var size = sizeOf(image);
            $(this).attr({
                width: round(size.width),
                height: round(size.height),
                src: base_href+$(this).attr('src'),
                layout: 'responsive'
            });
          }
        }
        else if (src.indexOf('//') != -1) {
          var imageUrl = this.attribs.src;
          var response = request('GET', imageUrl);
          if (response.statusCode === 200) {
            var size = sizeOf(response.body);
            $(this).attr({
              width: round(size.width),
              height: round(size.height)
            });
          }
        };
      });

      //
      $(tags.amp.join(',')).each(function() {
        this.name = 'amp-' + this.name;
      });

      html = $.html();


      return html;
    } catch (err) {
      return html;
    }
  };


  return function(files, metalsmith, done){

    // loop through all files, building an object with data about all tags

    var amp_files = _.reduce(files,function(amp_file,amp_datas,path){

      if (_utils.match(path, pattern) && typeof amp_datas.date != 'undefined') {

        var filename = 'amp'+amp_datas.link + 'index.html';
        var str = amp_datas.contents;
        amp_file[filename] = {};
        amp_file[filename].contents = ampify(str, _path.dirname(path), amp_datas.link);
        amp_file[filename].title = amp_datas.title;
        amp_file[filename].template = template;
        amp_file[filename].canonical = amp_datas.link;
        files[path].amp_link = '/amp'+amp_datas.link;
        amp_file[filename].permalink = '/amp'+amp_datas.link;
        return amp_file;

      } else {
        return amp_file;
      }
    },{});

    _.extend(files,amp_files);

    done();
  };
};

module.exports = exports["default"];
