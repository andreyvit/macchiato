(function() {
  var assert, fs, jsdom, path;
  var __slice = Array.prototype.slice;
  path = require('path');
  fs = require('fs');
  jsdom = require('jsdom');
  assert = require('assert');
  exports.suite = function(suiteName, testModule, options) {
    var id, test, _fn, _i, _len, _ref;
    if (options == null) {
      options = {};
    }
    test = function() {
      var args, expectedAssertionCount, fixture, func, html, name, _i;
      name = arguments[0], args = 3 <= arguments.length ? __slice.call(arguments, 1, _i = arguments.length - 1) : (_i = 1, []), func = arguments[_i++];
      if (args.length > 2) {
        throw new Error("macchiato.test: max number of arguments is 4");
      }
      if (typeof args[0] === 'string') {
        fixture = args.shift();
      }
      if (typeof args[0] === 'number') {
        expectedAssertionCount = args.shift();
      }
      if (args.length > 0) {
        throw new Error("macchiato.test: wrong types of optional arguments");
      }
      fixture || (fixture = options.fixture);
      html = (function() {
        switch (false) {
          case !!fixture:
            return '<html><body></body></html>';
          default:
            return path.join(options.fixturesDir, fixture);
        }
      })();
      return testModule.exports[name] = function(beforeExit) {
        var file;
        return jsdom.env({
          html: html,
          src: [
            (function() {
              var _j, _len, _ref, _results;
              _ref = options.scripts;
              _results = [];
              for (_j = 0, _len = _ref.length; _j < _len; _j++) {
                file = _ref[_j];
                _results.push(fs.readFileSync(file, 'utf8'));
              }
              return _results;
            })()
          ],
          done: function(errors, window) {
            if (errors) {
              throw new Error("Errors when loading DOM or scripts: " + (JSON.stringify(errors)));
            }
            test._assertionCount = 0;
            func(window);
            if (expectedAssertionCount != null) {
              return assert.equal(test._assertionCount, expectedAssertionCount, "Expected " + expectedAssertionCount + " assertions, got " + test._assertionCount + " in '" + suiteName + ": " + name + "'");
            }
          }
        });
      };
    };
    _ref = ['ok', 'equal', 'notEqual', 'deepEqual', 'notDeepEqual', 'strictEqual', 'notStrictEqual'];
    _fn = function(id) {
      return test[id] = function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        test._assertionCount += 1;
        return assert[id].apply(assert, args);
      };
    };
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      id = _ref[_i];
      _fn(id);
    }
    test._assertionCount = 0;
    return test;
  };
}).call(this);
