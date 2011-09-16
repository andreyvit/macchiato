Object.keys ||= (o) ->
  throw new TypeError("Object.keys called on non-object")  if o != Object(o)
  p for own p of oq2

window.require = require = (name) ->
  require.modules[name]

require.modules =
  macchiato:
    suite: (options) ->
      rootDir = ('..' for item in options.fixturesDir.split('/')).join('/')
      scripts = ("#{rootDir}/#{script}" for script in options.scripts)

      test = (name, fixture, func) ->
        QUnit.asyncTest name, ->
          setupFixture "../#{options.fixturesDir}/#{fixture}", (iframeWindow) ->
            loadScripts iframeWindow.document, scripts, (errors) ->
              if errors
                return ok false, "Errors when loading scripts: #{JSON.stringify(errors)}"
              try
                func(iframeWindow)
                start()
              catch e
                ok false, "Error thrown: #{e}"
                start()
                throw e

      for id in ['ok', 'equal', 'notEqual', 'deepEqual', 'notDeepEqual', 'strictEqual', 'notStrictEqual']
        test[id] = window[id]

      return test


setupFixture = (path, onReady) ->
  console.log "setupFixture(#{path})"

  loaded = (e) ->
    console.log "iframe.load(#{path})"
    @removeEventListener "load", loaded, false
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
  iframe.addEventListener "load", loaded, false
  # document.getElementById("qunit-fixture").appendChild(iframe)
  document.body.appendChild(iframe)

  return iframe

loadScripts = (document, scripts, callback) ->
  docsLoaded = 0
  totalDocs = scripts.length
  errors = null
  
  scriptComplete = ->
    docsLoaded++
    if docsLoaded >= totalDocs
      callback errors

  scripts.forEach (src) ->
    script = document.createElement("script")
    script.onload = ->
      scriptComplete()
    
    script.onerror = (e) ->
      errors ||= []
      errors.push e.error
      scriptComplete()
    
    script.src = src
    try
      document.documentElement.appendChild script
    catch e
      errors ||= []
      errors.push e.error or e.message
      callback errors, window
