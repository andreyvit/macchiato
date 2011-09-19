(function() {
  var Macchiato, require, script;
  var __slice = Array.prototype.slice;
  Object.keys || (Object.keys = function(o) {
    var p, _results;
    if (o !== Object(o)) {
      throw new TypeError("Object.keys called on non-object");
    }
    _results = [];
    for (p in o) {
      _results.push(p);
    }
    return _results;
  });
  Macchiato = {
    baseUrl: ((function() {
      var _i, _len, _ref, _results;
      _ref = document.getElementsByTagName('SCRIPT');
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        script = _ref[_i];
        if (script.src.match(/\/macchiato\.js$/)) {
          _results.push(script);
        }
      }
      return _results;
    })())[0].src.replace(/\/macchiato.js$/, ''),
    suite: function(suiteName, testModule, options) {
      var id, item, rootDir, scripts, suiteWindow, test, _i, _len, _ref;
      if (options == null) {
        options = {};
      }
      rootDir = options.fixturesDir && ((function() {
        var _i, _len, _ref, _results;
        _ref = options.fixturesDir.split('/');
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          item = _ref[_i];
          _results.push('..');
        }
        return _results;
      })()).join('/');
      scripts = options.scripts || [];
      suiteWindow = null;
      QUnit.module(suiteName);
      test = function() {
        var args, assertions, fixture, fixtureUrl, func, hasPerTestFixture, name, script, scriptUrls, _doLoadScripts, _doRunTest, _i;
        name = arguments[0], args = 3 <= arguments.length ? __slice.call(arguments, 1, _i = arguments.length - 1) : (_i = 1, []), func = arguments[_i++];
        if (args.length > 2) {
          throw new Error("macchiato.test: max number of arguments is 4");
        }
        if (typeof args[0] === 'string') {
          fixture = args.shift();
        }
        if (typeof args[0] === 'number') {
          assertions = args.shift();
        }
        if (args.length > 0) {
          throw new Error("macchiato.test: wrong types of optional arguments");
        }
        hasPerTestFixture = !!fixture;
        fixture || (fixture = options.fixture);
        if (fixture) {
          fixtureUrl = "../" + options.fixturesDir + "/" + fixture;
        } else if (scripts && scripts.length > 0) {
          fixtureUrl = "" + Macchiato.baseUrl + "/empty.html";
          rootDir = '../../../..';
        }
        scriptUrls = (function() {
          var _j, _len, _results;
          _results = [];
          for (_j = 0, _len = scripts.length; _j < _len; _j++) {
            script = scripts[_j];
            _results.push("" + rootDir + "/" + script);
          }
          return _results;
        })();
        _doRunTest = function(iframeWindow) {
          try {
            if (assertions != null) {
              QUnit.expect(assertions);
            }
            func(iframeWindow);
            return start();
          } catch (e) {
            ok(false, "Error thrown: " + e);
            start();
            throw e;
          }
        };
        _doLoadScripts = function(iframeWindow) {
          if (!hasPerTestFixture) {
            suiteWindow = iframeWindow;
          }
          return Macchiato._loadScripts(iframeWindow.document, scriptUrls, function(errors) {
            if (errors) {
              return ok(false, "Errors when loading scripts: " + (JSON.stringify(errors)));
            } else {
              return _doRunTest(iframeWindow);
            }
          });
        };
        return QUnit.asyncTest(name, function() {
          if (suiteWindow && !hasPerTestFixture) {
            return _doRunTest(suiteWindow);
          } else if (fixtureUrl) {
            return Macchiato._setupFixture(fixtureUrl, _doLoadScripts);
          } else {
            return _doRunTest(window);
          }
        });
      };
      _ref = ['ok', 'equal', 'notEqual', 'deepEqual', 'notDeepEqual', 'strictEqual', 'notStrictEqual'];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        id = _ref[_i];
        test[id] = window[id];
      }
      return test;
    },
    _setupFixture: function(path, onReady) {
      var iframe, loaded;
      console.log("setupFixture(" + path + ")");
      loaded = function(e) {
        var canAccess, doc;
        console.log("iframe.load(" + path + ")");
        $(this).unbind("load");
        doc = this.contentDocument;
        try {
          canAccess = !!doc.location;
        } catch (_e) {}
        if (canAccess) {
          return onReady(this.contentWindow);
        } else {
          ok(false, "Cannot access an iframe. " + (navigator.userAgent.indexOf("Chrome") > -1 ? "Run Google Chrome with --allow-file-access-from-files to fix it." : ""));
          return QUnit.start();
        }
      };
      iframe = document.createElement("iframe");
      iframe.src = path;
      iframe.id = path;
      $(iframe).bind("load", loaded);
      document.body.appendChild(iframe);
      return iframe;
    },
    _loadScripts: function(document, scripts, callback) {
      var docsLoaded, errors, scriptComplete, src, totalDocs, _i, _len, _results;
      docsLoaded = 0;
      totalDocs = scripts.length;
      errors = null;
      scriptComplete = function() {
        docsLoaded++;
        if (docsLoaded >= totalDocs) {
          return callback(errors);
        }
      };
      _results = [];
      for (_i = 0, _len = scripts.length; _i < _len; _i++) {
        src = scripts[_i];
        _results.push((function(src) {
          script = document.createElement("script");
          script.onload = function() {
            console.log("script.load(" + src + ")");
            return scriptComplete();
          };
          script.onerror = function(e) {
            console.log("script.error(" + src + ", " + e + ")");
            errors || (errors = []);
            errors.push(e.error);
            return scriptComplete();
          };
          script.src = src;
          try {
            document.documentElement.appendChild(script);
            console.log("" + script.readyState + " - " + src);
            if (script.readyState === 'complete') {
              return scriptComplete();
            }
          } catch (e) {
            console.log("script.errorCaught(" + src + ", " + e + ")");
            errors || (errors = []);
            errors.push(e.error || e.message);
            return callback(errors, window);
          }
        })(src));
      }
      return _results;
    }
  };
  window.require = require = function(name) {
    return require.modules[name];
  };
  require.modules = {
    macchiato: Macchiato
  };
}).call(this);
