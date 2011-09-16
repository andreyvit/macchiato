(function() {
  var assert, fs, jsdom, path;
  path = require('path');
  fs = require('fs');
  jsdom = require('jsdom');
  assert = require('assert');
  exports.suite = function(options) {
    var id, test, _i, _len, _ref;
    test = function(name, fixture, func) {
      var assertions, fixturePath;
      if (func == null) {
        func = assertions;
        assertions = null;
      }
      fixturePath = path.join(options.fixturesDir, fixture);
      return options.module.exports[name] = function(beforeExit) {
        var file;
        return jsdom.env({
          html: fixturePath,
          src: [
            (function() {
              var _i, _len, _ref, _results;
              _ref = options.scripts;
              _results = [];
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                file = _ref[_i];
                _results.push(fs.readFileSync(file, 'utf8'));
              }
              return _results;
            })()
          ],
          done: function(errors, window) {
            if (errors) {
              throw new Error("Errors when loading DOM or scripts: " + (JSON.stringify(errors)));
            }
            return func(window);
          }
        });
      };
    };
    _ref = ['ok', 'equal', 'notEqual', 'deepEqual', 'notDeepEqual', 'strictEqual', 'notStrictEqual'];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      id = _ref[_i];
      test[id] = assert[id];
    }
    return test;
  };
}).call(this);
