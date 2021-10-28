;(function (window) {

/* global XMLHttpRequest,describe,it */

// backwards compatible version of (Array|String).prototype.includes
var includes = function (collection, element, startIndex) {
  if (!collection || !collection.length) {
    return false
  }

  // strings support indexOf already
  if (typeof collection === 'string') {
    return collection.indexOf(element, startIndex) !== -1
  }

  if (Array.prototype.indexOf) {
    return collection.indexOf(element, startIndex) !== -1
  }

  for (var i = startIndex || 0, len = collection.length; i < len; i++) {
    if (collection[i] === element) {
      return true
    }
  }
}

// Date.now polyfill for IE <= 8
if (!Date.now) {
  Date.now = function () {
    return +new Date()
  }
}

var formatError = function (error) {
  var stack = error.stack
  var message = error.message

  if (stack) {
    if (message && !includes(stack, message)) {
      stack = message + '\n' + stack
    }

    // remove mocha stack entries
    return stack.replace(/\n.+\/mocha\/mocha\.js\?\w*:[\d:]+\)?(?=(\n|$))/g, '')
  }

  return message
}

var processAssertionError = function (error_) {
  var error

  if (window.Mocha && error_.hasOwnProperty('showDiff')) {
    error = {
      name: error_.name,
      message: error_.message,
      showDiff: error_.showDiff
    }

    if (error.showDiff) {
      error.actual = window.Mocha.utils.stringify(error_.actual)
      error.expected = window.Mocha.utils.stringify(error_.expected)
    }
  }

  return error
}

// non-compliant version of Array::reduce.call (requires memo argument)
var arrayReduce = function (array, reducer, memo) {
  for (var i = 0, len = array.length; i < len; i++) {
    memo = reducer(memo, array[i])
  }
  return memo
}

var createMochaReporterNode = function () {
  var mochaRunnerNode = document.createElement('div')
  mochaRunnerNode.setAttribute('id', 'mocha')
  document.body.appendChild(mochaRunnerNode)
}

var haveMochaConfig = function (karma) {
  return karma.config && karma.config.mocha
}

var reportTestResult = function (karma, test) {
  var skipped = test.pending === true

  var result = {
    id: '',
    description: test.title,
    suite: [],
    success: test.state === 'passed',
    skipped: skipped,
    pending: skipped,
    time: skipped ? 0 : test.duration,
    log: test.$errors || [],
    assertionErrors: test.$assertionErrors || [],
    startTime: test.$startTime,
    endTime: Date.now()
  }

  var pointer = test.parent
  while (!pointer.root) {
    result.suite.unshift(pointer.title)
    pointer = pointer.parent
  }

  if (haveMochaConfig(karma) && karma.config.mocha.expose && karma.config.mocha.expose.forEach) {
    result.mocha = {}
    karma.config.mocha.expose.forEach(function (prop) {
      if (test.hasOwnProperty(prop)) {
        result.mocha[prop] = test[prop]
      }
    })
  }

  karma.result(result)
}

var createMochaReporterConstructor = function (tc, pathname) {
  var isDebugPage = /debug.html$/.test(pathname)

  // Set custom reporter on debug page
  if (isDebugPage && haveMochaConfig(tc) && tc.config.mocha.reporter) {
    createMochaReporterNode()
    return tc.config.mocha.reporter
  }

  // TODO(vojta): error formatting
  return function (runner) {
    // runner events
    // - start
    // - end
    // - suite
    // - suite end
    // - test
    // - test end
    // - pass
    // - fail
    // - pending

    runner.on('start', function () {
      tc.info({total: runner.total})
    })

    runner.on('end', function () {
      tc.complete({
        coverage: window.__coverage__
      })
    })

    runner.on('test', function (test) {
      test.$startTime = Date.now()
      test.$errors = []
      test.$assertionErrors = []
    })

    runner.on('pending', function (test) {
      test.pending = true
    })

    runner.on('fail', function (test, error) {
      var simpleError = formatError(error)
      var assertionError = processAssertionError(error)

      if (test.type === 'hook') {
        test.$errors = isDebugPage ? [error] : [simpleError]
        test.$assertionErrors = assertionError ? [assertionError] : []
        reportTestResult(tc, test)
      } else {
        test.$errors.push(isDebugPage ? error : simpleError)
        if (assertionError) test.$assertionErrors.push(assertionError)
      }
    })

    runner.on('test end', function (test) {
      reportTestResult(tc, test)
    })
  }
}
/* eslint-disable no-unused-vars */
var createMochaStartFn = function (mocha) {
  /* eslint-enable no-unused-vars */
  return function (config) {
    var clientArguments
    config = config || {}
    clientArguments = config.args

    if (clientArguments) {
      if (Object.prototype.toString.call(clientArguments) === '[object Array]') {
        arrayReduce(clientArguments, function (isGrepArg, arg) {
          if (isGrepArg) {
            mocha.grep(new RegExp(arg))
          } else if (arg === '--grep') {
            return true
          } else {
            var match = /--grep=(.*)/.exec(arg)

            if (match) {
              mocha.grep(new RegExp(match[1]))
            }
          }
          return false
        }, false)
      }

      /**
       * TODO(maksimrv): remove when karma-grunt plugin will pass
       * clientArguments how Array
       */
      if (clientArguments.grep) {
        mocha.grep(clientArguments.grep)
      }
    }

    Promise.all(
      [...document.documentElement.getElementsByTagName('script')]
        .map((el) => {
          if (el.type === 'module') {
            if (el.src) {
              // Await <script type="module" src="foobar"> thru cachable import()
              return $import$(el.src)
            } else {
              if (/await|import/.test(el.innerHTML)) {
                throw new Error('no idea how to await <script type="module"> without script.src')
              } else {
                // Seems no need to await
                return
              }
            }
          } else {
            // No need to await
            return
          }
        })
    ).then(
      (_allModules) => {
        mocha.run()
      },
      (e) => {
        describe('karma-mocha', () => {
          it('should not detect error', () => {
            throw e
          })
        })

        mocha.run()
      }
    )
  }
}

// Default configuration
var mochaConfig = {
  reporter: createMochaReporterConstructor(window.__karma__, window.location.pathname),
  ui: 'bdd',
  globals: ['__cov*']
}

// Pass options from client.mocha to mocha
/* eslint-disable no-unused-vars */
var createConfigObject = function (karma) {
  /* eslint-enable no-unused-vars */

  if (!karma.config || !karma.config.mocha) {
    return mochaConfig
  }

  // Copy all properties to mochaConfig
  for (var key in karma.config.mocha) {
    // except for reporter, require, or expose
    if (includes(['reporter', 'require', 'expose'], key)) {
      continue
    }

    // and merge the globals if they exist.
    if (key === 'globals') {
      mochaConfig.globals = mochaConfig.globals.concat(karma.config.mocha[key])
      continue
    } else if (key === 'rootHooks') {
      if (Object.keys(karma.config.mocha.rootHooks).length === 0) {
        throw new Error('your config mocha.rootHooks field seems not serializable, and deserialized into `{}`')
      } else if (karma.config.mocha.rootHooks.type === 'import' && typeof karma.config.mocha.rootHooks.value === 'string') {
        // FIXME: run `importSync()` as soon as possible, still racing and falling into sync xhr fallback.
        // `mocha.rootHooks.value` should be valid javascript resource in karma-server, in ESM format.
        // Eg: '/base/path/to/my/mochaHooks.mjs'
        // And '/base/' above is not a place holder when using default karma config.
        var mochaHooksProxy = importSync(karma.config.mocha.rootHooks.value).mochaHooks
        mochaConfig.rootHooks = karma.config.mocha.rootHooks = mochaHooksProxy
      } else {
        // Seem proposal https://github.com/mochajs/mocha/issues/4780
        throw new Error('karma-mocha not yet support deserialize your config mocha.rootHooks field.')
      }
    }

    mochaConfig[key] = karma.config.mocha[key]
  }
  return mochaConfig
}

// Workaround: eslint version too low, wrap `import()` to avoid `Unexpected token import`
// eslint-disable-next-line no-new-func
var $import$ = new Function('url', 'return import(url)')

// Use sync xhr when mocha race for pending `import()`
var importSyncFallback = function (url) {
  var response = new XMLHttpRequest()
  response.open('get', url, false)
  response.send(null)
  var exports = {}
  // eslint-disable-next-line no-new-func
  new Function('exports', response.responseText.replace(/export\s+(var|let|const)\s+/, 'exports.'))(exports)
  return exports
}

// De-Async `import()`, fallback to sync xhr.
// Sync load modules in browser way.
// Use two level `Proxy`, to satisfy `mocha.setup()` racing for `.mochaHooks`.
// To avoid fallback to sync xhr, should run `importSync()` as soon as possible.
var importSync = function (url) {
  var mod
  $import$(url)
    .then(
      function (x) {
        mod = x
      },
      function (e) {
        mod = e
      }
    )

  return new Proxy({}, {
    get (_target, prop, _receiver) {
      // allow proxy `var rootHooks = mod.mochaHooks`, let race comes later.
      return new Proxy({}, {
        get (_target, prop2, _receiver) {
          if (typeof mod === 'undefined') {
            console.warn('[' + importSync.name + '] detect racing ' + url + ' on export field ' + prop + ', fallback to sync xhr')
            mod = importSyncFallback(url)
          }

          if (typeof mod === 'undefined') {
            throw new Error('can not deasync, module ' + url + ' is still pending when reference path $.' + prop + '.' + prop2)
          } else if (mod instanceof Error) {
            throw mod
          } else if (!(prop in mod)) {
            throw new Error('module ' + url + ' has no export field ' + prop)
          } else {
            return mod[prop][prop2]
          }
        }
      })
    }
  })
}

  window.__karma__.start = createMochaStartFn(window.mocha)
  window.mocha.setup(createConfigObject(window.__karma__))
})(window)
