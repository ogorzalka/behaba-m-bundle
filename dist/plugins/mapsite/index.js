'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _utils = require('../../utils');

var identity = require('lodash.identity');
var is = require('is');
var match = require('multimatch');
var path = require('path');
var pick = require('lodash.pick');
var S = require('string');
var slash = require('slash');
var sm = require('sitemap');

var log = (0, _utils.debug)('metalsmith:mapsite');

var DEFAULTS = {
  output: 'sitemap.xml',
  pattern: '**/*.html'
};

exports['default'] = function (options) {
  options = (0, _utils.extend)({}, DEFAULTS, options);

  var _options = options;
  var changefreq = _options.changefreq;
  var hostname = _options.hostname;
  var lastmod = _options.lastmod;
  var contentFolder = _options.contentFolder;
  var omitExtension = _options.omitExtension;
  var omitIndex = _options.omitIndex;
  var output = _options.output;
  var pattern = _options.pattern;
  var priority = _options.priority;

  return function (files, metalsmith, done) {
    // Create sitemap object
    var sitemap = sm.createSitemap({
      hostname: hostname
    });

    // Checks whether files should be processed
    function check(file, frontmatter) {
      // Only process files that match the pattern
      if (!match(file, pattern)[0]) {
        return false;
      }

      // Don't process private files
      if (frontmatter['private']) {
        return false;
      }

      return true;
    }

    // Builds a url
    function buildUrl(file, frontmatter) {
      // Convert any windows backslash paths to slash paths
      var normalizedFile = slash(file);

      // Frontmatter settings take precedence
      if (is.string(frontmatter.canonical)) {
        return frontmatter.canonical;
      }

      // Remove index.html if necessary
      if (omitIndex && path.basename(normalizedFile) === 'index.html') {
        return S(normalizedFile).chompRight('index.html').s;
      }

      // Remove extension if necessary
      if (omitExtension) {
        return S(normalizedFile).chompRight(path.extname(normalizedFile)).s;
      }

      // Remove some expression (ex. folder)
      if (contentFolder) {
        return S(normalizedFile).replace(contentFolder, '');
      }

      // Otherwise just use the normalized 'file' entry
      return normalizedFile;
    }

    Object.keys(files).forEach(function (file) {
      // Get the current file's frontmatter
      var frontmatter = files[file];

      // Only process files that pass the check
      if (!check(file, frontmatter)) {
        return;
      }

      // Create the sitemap entry (reject keys with falsy values)
      var entry = pick({
        changefreq: frontmatter.changefreq || changefreq,
        priority: frontmatter.priority || priority,
        lastmod: frontmatter.lastmod || lastmod
      }, identity);

      // Add the url (which is allowed to be falsy)
      entry.url = buildUrl(file, frontmatter);

      // Add the entry to the sitemap
      sitemap.add(entry);
    });

    // Create sitemap in files
    files[output] = {
      contents: new Buffer(sitemap.toString())
    };

    done();
  };
};

module.exports = exports['default'];