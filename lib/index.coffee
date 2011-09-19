path   = require 'path'
fs     = require 'fs'
jsdom  = require 'jsdom'
assert = require 'assert'


exports.suite = (suiteName, testModule, options={}) ->

  test = (name, args..., func) ->
    if args.length > 2
      throw new Error("macchiato.test: max number of arguments is 4")
    if typeof args[0] is 'string'
      fixture = args.shift()
    if typeof args[0] is 'number'
      expectedAssertionCount = args.shift()
    if args.length > 0
      throw new Error("macchiato.test: wrong types of optional arguments")

    fixture ||= options.fixture

    html = switch
      when !fixture          then '<html><body></body></html>'
      else                        path.join(options.fixturesDir, fixture)

    testModule.exports[name] = (beforeExit) ->
      jsdom.env
        html: html
        src:  [fs.readFileSync(file, 'utf8') for file in options.scripts]
        done: (errors, window) ->
          if errors
            throw new Error("Errors when loading DOM or scripts: #{JSON.stringify(errors)}")
          test._assertionCount = 0
          func(window)
          if expectedAssertionCount?
            assert.equal test._assertionCount, expectedAssertionCount, "Expected #{expectedAssertionCount} assertions, got #{test._assertionCount} in '#{suiteName}: #{name}'"

  for id in ['ok', 'equal', 'notEqual', 'deepEqual', 'notDeepEqual', 'strictEqual', 'notStrictEqual']
    do (id) ->
      test[id] = (args...) ->
        test._assertionCount += 1
        assert[id].apply(assert, args)
  test._assertionCount = 0  # in case someone uses these functions outside a test

  return test
