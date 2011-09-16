(function() {
  var loadScripts, require, setupFixture;
  var __hasProp = Object.prototype.hasOwnProperty;
  Object.keys || (Object.keys = function(o) {
    var p, _results;
    if (o !== Object(o)) {
      throw new TypeError("Object.keys called on non-object");
    }
    _results = [];
    for (p in oq2) {
      if (!__hasProp.call(oq2, p)) continue;
      _results.push(p);
    }
    return _results;
  });
  window.require = require = function(name) {
    return require.modules[name];
  };
  require.modules = {
    macchiato: {
      suite: function(options) {
        var id, item, rootDir, script, scripts, test, _i, _len, _ref;
        rootDir = ((function() {
          var _i, _len, _ref, _results;
          _ref = options.fixturesDir.split('/');
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            item = _ref[_i];
            _results.push('..');
          }
          return _results;
        })()).join('/');
        scripts = (function() {
          var _i, _len, _ref, _results;
          _ref = options.scripts;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            script = _ref[_i];
            _results.push("" + rootDir + "/" + script);
          }
          return _results;
        })();
        test = function(name, fixture, func) {
          return QUnit.asyncTest(name, function() {
            return setupFixture("../" + options.fixturesDir + "/" + fixture, function(iframeWindow) {
              return loadScripts(iframeWindow.document, scripts, function(errors) {
                if (errors) {
                  return ok(false, "Errors when loading scripts: " + (JSON.stringify(errors)));
                }
                try {
                  func(iframeWindow);
                  return start();
                } catch (e) {
                  ok(false, "Error thrown: " + e);
                  start();
                  throw e;
                }
              });
            });
          });
        };
        _ref = ['ok', 'equal', 'notEqual', 'deepEqual', 'notDeepEqual', 'strictEqual', 'notStrictEqual'];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          id = _ref[_i];
          test[id] = window[id];
        }
        return test;
      }
    }
  };
  setupFixture = function(path, onReady) {
    var iframe, loaded;
    console.log("setupFixture(" + path + ")");
    loaded = function(e) {
      var canAccess, doc;
      console.log("iframe.load(" + path + ")");
      this.removeEventListener("load", loaded, false);
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
    iframe.addEventListener("load", loaded, false);
    document.body.appendChild(iframe);
    return iframe;
  };
  loadScripts = function(document, scripts, callback) {
    var docsLoaded, errors, scriptComplete, totalDocs;
    docsLoaded = 0;
    totalDocs = scripts.length;
    errors = null;
    scriptComplete = function() {
      docsLoaded++;
      if (docsLoaded >= totalDocs) {
        return callback(errors);
      }
    };
    return scripts.forEach(function(src) {
      var script;
      script = document.createElement("script");
      script.onload = function() {
        return scriptComplete();
      };
      script.onerror = function(e) {
        errors || (errors = []);
        errors.push(e.error);
        return scriptComplete();
      };
      script.src = src;
      try {
        return document.documentElement.appendChild(script);
      } catch (e) {
        errors || (errors = []);
        errors.push(e.error || e.message);
        return callback(errors, window);
      }
    });
  };
}).call(this);
