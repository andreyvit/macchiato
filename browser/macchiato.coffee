# a simple shim for Object.keys
Object.keys ||= (o) ->
  throw new TypeError("Object.keys called on non-object")  if o != Object(o)
  p for p of o


Macchiato =
  baseUrl: (script for script in document.getElementsByTagName('SCRIPT') when script.src.match(/\/macchiato\.js$/))[0].src.replace(/\/macchiato.js$/, '')

  suite: (suiteName, testModule, options={}) ->
    rootDir = options.fixturesDir && ('..' for item in options.fixturesDir.split('/')).join('/')
    scripts = options.scripts || []
    suiteWindow = null

    QUnit.module suiteName

    test = (name, args..., func) ->
      if args.length > 2
        throw new Error("macchiato.test: max number of arguments is 4")
      if typeof args[0] is 'string'
        fixture = args.shift()
      if typeof args[0] is 'number'
        assertions = args.shift()
      if args.length > 0
        throw new Error("macchiato.test: wrong types of optional arguments")

      hasPerTestFixture = !!fixture
      fixture ||= options.fixture

      if fixture
        fixtureUrl = "../#{options.fixturesDir}/#{fixture}"
      else if scripts && scripts.length > 0
        fixtureUrl = "#{Macchiato.baseUrl}/empty.html"
        rootDir = '../../../..'
  
      scriptUrls = ("#{rootDir}/#{script}" for script in scripts)

      _doRunTest = (iframeWindow) ->
        try
          QUnit.expect(assertions) if assertions?
          func(iframeWindow)
          start()
        catch e
          ok false, "Error thrown: #{e}"
          start()
          throw e

      _doLoadScripts = (iframeWindow) ->
        suiteWindow = iframeWindow unless hasPerTestFixture

        Macchiato._loadScripts iframeWindow.document, scriptUrls, (errors) ->
          if errors
            return ok false, "Errors when loading scripts: #{JSON.stringify(errors)}"
          else
            _doRunTest iframeWindow

      QUnit.asyncTest name, ->
        if suiteWindow and not hasPerTestFixture
          _doRunTest suiteWindow
        else if fixtureUrl
          Macchiato._setupFixture fixtureUrl, _doLoadScripts
        else
          _doRunTest window

    for id in ['ok', 'equal', 'notEqual', 'deepEqual', 'notDeepEqual', 'strictEqual', 'notStrictEqual']
      test[id] = window[id]

    return test

  _setupFixture: (path, onReady) ->
    console.log "setupFixture(#{path})"

    loaded = (e) ->
      console.log "iframe.load(#{path})"
      $(this).unbind "load"
      doc = @contentDocument
      try
        canAccess = !!doc.location
      if canAccess
        onReady @contentWindow
      else
        ok false, "Cannot access an iframe. " + (if navigator.userAgent.indexOf("Chrome") > -1 then "Run Google Chrome with --allow-file-access-from-files to fix it." else "")
        QUnit.start()

    iframe = document.createElement("iframe")
    iframe.src = path
    iframe.id = path
    $(iframe).bind "load", loaded
    # document.getElementById("qunit-fixture").appendChild(iframe)
    document.body.appendChild(iframe)

    return iframe

  _loadScripts: (document, scripts, callback) ->
    docsLoaded = 0
    totalDocs = scripts.length
    errors = null
    
    scriptComplete = ->
      docsLoaded++
      if docsLoaded >= totalDocs
        callback errors

    for src in scripts
      do (src) ->
        script = document.createElement("script")
        script.onload = ->
          console.log "script.load(#{src})"
          scriptComplete()
        
        script.onerror = (e) ->
          console.log "script.error(#{src}, #{e})"
          errors ||= []
          errors.push e.error
          scriptComplete()
        
        script.src = src
        try
          document.documentElement.appendChild script
          console.log "#{script.readyState} - #{src}"
          if script.readyState is 'complete'
            scriptComplete()
        catch e
          console.log "script.errorCaught(#{src}, #{e})"
          errors ||= []
          errors.push e.error or e.message
          callback errors, window


# a shim for CommonJS require
window.require = require = (name) ->
  require.modules[name]

require.modules =
  macchiato: Macchiato
