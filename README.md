Macchiato: DOM tests that run everywhere
========================================

[![Greenkeeper badge](https://badges.greenkeeper.io/andreyvit/macchiato.svg)](https://greenkeeper.io/)

Macchiato provides an API similar to QUnit, running tests using either QUnit (inside the browser) or Express+jsdom (in Node.js).

Why would you want to run tests both on jsdom and on a real web browser?

* Using Node.js, jsdom and Express is crazy-fast and provides a great command-line experience (together with coverage reports), best option for continuous testing.
* Occasionally, you still want to run your tests on all web browsers you support. QUnit provides a great UI for that, and is compatible with js-test-driver for automation.


How do I start?
---------------

A typical test case:

    var test = require('macchiato').suite({
        module: module,
        scripts: ['web/js/Q.js'],
        fixturesDir: 'test/fixtures'
    });

    test('simple tool activation', 'test.html', function(w) {
        var called = false, args = null;
        w.Q.constructors["Q_great_tool"] = function() { called = true; args = arguments; };
        w.Q.activate(w.document.body);

        test.ok(called, 'Tool constructor is called');
        test.equal(args.length, 2, 'Tool constructor must be called with 2 arguments');
        test.equal(args[0], 'Q_superb_', 'Argument 1 must be a correct prefix');
        test.deepEqual(Object.keys(args[1]), [], 'Argument 2 must be an empty options object');
    });

Put your tests under `test` folder, for example `test/something.js`. Expresso expects to be called from a parent directory of the test folder, and insists on the test folder being called `test`.

To run tests inside the browser, add the following file into the test directory:

    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8" />
        <title>My Test Suite</title>
        <link rel="stylesheet" href="qunit/qunit.css" type="text/css" media="screen">
        <script type="text/javascript" src="qunit/qunit.js"></script>
        <script src="node_modules/macchiato/browser/macchiato.js"></script>
        <script type="text/javascript" src="tools2.js"></script>
    </head>
    <body>
        <h1 id="qunit-header">My Test Suite</h1>
        <h2 id="qunit-banner"></h2>
        <div id="qunit-testrunner-toolbar"></div>
        <h2 id="qunit-userAgent"></h2>
        <ol id="qunit-tests"></ol>
        <div id="qunit-fixture"></div>
    </body>
    </html>

then download QUnit and put `qunit.js` and `qunit.css` under `test/qunit/`.
