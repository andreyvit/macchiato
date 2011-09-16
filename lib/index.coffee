path   = require 'path'
fs     = require 'fs'
jsdom  = require 'jsdom'
assert = require 'assert'


exports.suite = (options) ->

  test = (name, fixture, func) ->
    unless func?
      func = assertions
      assertions = null

    fixturePath = path.join(options.fixturesDir, fixture)

    options.module.exports[name] = (beforeExit) ->
      jsdom.env
        html: fixturePath
        src:  [fs.readFileSync(file, 'utf8') for file in options.scripts]
        done: (errors, window) ->
          if errors
            throw new Error("Errors when loading DOM or scripts: #{JSON.stringify(errors)}")
          func(window)

  for id in ['ok', 'equal', 'notEqual', 'deepEqual', 'notDeepEqual', 'strictEqual', 'notStrictEqual']
    test[id] = assert[id]

  return test
