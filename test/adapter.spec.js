/**
 Tests for adapter/mocha.src.js
 These tests are executed in browser.
 */

/* globals
 createMochaReporterConstructor,
 createMochaReporterNode,
 createMochaStartFn,
 createConfigObject,
 mochaConfig: true,
 formatError: true,
 processAssertionError: true,
 MockSocket: true,
 Emitter: true,
 sinon: true,
 expect: true,
 describe: true,
 beforeEach: true,
 afterEach: true,
 it: true
 */
describe('adapter mocha', function () {
  var Karma = window.__karma__.constructor
  var sandbox

  beforeEach(function () {
    sandbox = sinon.sandbox.create()
  })

  afterEach(function () {
    sandbox.restore()
  })

  describe('createMochaReporterConstructor', function () {
    beforeEach(function () {
      this.karma = new Karma(function (method, args) { })
      this.karma.config = {
        mocha: {
          reporter: 'html'
        }
      }

      sandbox.stub(window, 'createMochaReporterNode')
    })

    it('should take reporter from client config on debug page', function () {
      expect(createMochaReporterConstructor(this.karma, '/debug.html')).to.equal('html')
    })

    it('should create node for mocha reporter', function () {
      createMochaReporterConstructor(this.karma, '/debug.html')

      expect(createMochaReporterNode.called).to.equal(true)
    })

    it('should define console reporter if does not pass reporter in config', function () {
      this.karma.config.mocha.reporter = null

      expect(createMochaReporterConstructor(this.karma, '/debug.html')).not.to.equal(null)
    })
  })

  describe('reporter', function () {
    var runner, tc

    beforeEach(function () {
      tc = new Karma(function (method, args) { })
      runner = new Emitter()
      var reporter = new (createMochaReporterConstructor(tc))(runner) // eslint-disable-line
    })

    describe('start', function () {
      it('should report total number of specs', function () {
        runner.total = 12
        sandbox.spy(tc, 'info')

        runner.emit('start')
        expect(tc.info.getCall(0).args).to.deep.eq([{total: 12}])
      })
    })

    describe('end', function () {
      it('should report complete', function () {
        sandbox.spy(tc, 'complete')

        runner.emit('end')
        expect(tc.complete.called).to.eq(true)
      })
    })

    describe('test end', function () {
      it('should report result', function () {
        var beforeStartTime = Date.now()
        var DURATION = 200

        sandbox.stub(tc, 'result', function (result) {
          var afterEndTime = Date.now()
          expect(result.id).to.not.be.undefined
          expect(result.description).to.eq('should do something')
          expect(result.suite instanceof Array).to.eq(true)
          expect(result.success).to.eq(true)
          expect(result.skipped).to.to.eql(false)
          expect(result.log instanceof Array).to.eq(true)
          expect(result.assertionErrors instanceof Array).to.eq(true)
          expect(result.startTime).to.be.at.least(beforeStartTime)
          expect(result.endTime - result.startTime).to.be.at.least(DURATION)
          expect(result.endTime).to.be.at.most(afterEndTime)
          expect(result.time).to.eq(DURATION)
        })

        var mockMochaResult = {
          duration: DURATION,
          parent: {title: 'desc2', parent: {title: 'desc1', root: true}, root: false},
          state: 'passed',
          title: 'should do something'
        }

        runner.emit('test', mockMochaResult)
        // wait at least 200ms to get different start and end times
        var afterStartTime = Date.now()
        while (Date.now() - afterStartTime < DURATION) {}
        runner.emit('test end', mockMochaResult)

        expect(tc.result.called).to.eq(true)
      })

      it('should report skipped result', function () {
        sandbox.stub(tc, 'result', function (result) {
          expect(result.skipped).to.eq(true)
        })

        var mockMochaResult = {
          parent: {root: true}
        }

        runner.emit('pending', mockMochaResult)
        runner.emit('test end', mockMochaResult)

        expect(tc.result.called).to.eq(true)
      })

      it('should report time 0 for skipped tests', function () {
        sandbox.stub(tc, 'result', function (result) {
          expect(result.skipped).to.eq(true)
          expect(result.time).to.eq(0)
        })

        var mockMochaResult = {
          pending: true,
          parent: {root: true}
        }

        runner.emit('test', mockMochaResult)
        runner.emit('test end', mockMochaResult)

        expect(tc.result.called).to.eq(true)
      })

      it('should report failed result', function () {
        sandbox.stub(tc, 'result', function (result) {
          expect(result.success).to.to.eql(false)
          expect(result.skipped).to.to.eql(false)
          expect(result.log).to.deep.eq(['Big trouble.', 'Another fail.'])
          expect(result.assertionErrors).to.be.empty
        })

        var mockMochaResult = {
          parent: {title: 'desc2', root: true},
          state: 'failed',
          title: 'should do something'
        }

        runner.emit('test', mockMochaResult)
        runner.emit('fail', mockMochaResult, {message: 'Big trouble.'})
        runner.emit('pass', mockMochaResult)
        runner.emit('fail', mockMochaResult, {message: 'Another fail.'})
        runner.emit('test end', mockMochaResult)

        expect(tc.result.called).to.eq(true)
      })

      it('should report failed mocha result', function () {
        sandbox.stub(tc, 'result', function (result) {
          expect(result.log).to.deep.eq(['Big trouble.', 'Another fail.'])
          expect(result.assertionErrors).to.deep.eq([{
            name: 'AssertionError',
            message: 'Big trouble.',
            showDiff: false
          }])
        })

        var mockMochaResult = {
          parent: {title: 'desc2', root: true},
          state: 'failed',
          title: 'should do something'
        }

        runner.emit('test', mockMochaResult)
        runner.emit('fail', mockMochaResult, {
          name: 'AssertionError',
          message: 'Big trouble.',
          showDiff: false,
          actual: 1,
          expected: 2
        })
        runner.emit('fail', mockMochaResult, {message: 'Another fail.'})
        runner.emit('test end', mockMochaResult)

        expect(tc.result.called).to.eq(true)
      })

      it('should report suites', function () {
        sandbox.stub(tc, 'result', function (result) {
          expect(result.suite).to.deep.eq(['desc1', 'desc2'])
        })

        var mockMochaResult = {
          parent: {title: 'desc2', parent: {title: 'desc1', parent: {root: true}, root: false}, root: false},
          title: 'should do something'
        }

        runner.emit('test', mockMochaResult)
        runner.emit('test end', mockMochaResult)

        expect(tc.result.called).to.eq(true)
      })

      it('should report mocha properties through the `expose` option', function () {
        tc.config = {
          mocha: {
            expose: ['body', 'hello']
          }
        }

        sandbox.stub(tc, 'result', function (result) {
          expect(result.mocha.body).to.eq('function(){ expect(false).to.be(true) }')
          expect(result.mocha.hello).to.eq('world')
        })

        var mockMochaResult = {
          parent: {title: 'desc2', root: true},
          title: 'should do something',
          body: 'function(){ expect(false).to.be(true) }',
          hello: 'world'
        }

        runner.emit('test end', mockMochaResult)

        expect(tc.result.called).to.eq(true)
      })

      it('should not report mocha properties if `expose` is not configured', function () {
        sandbox.stub(tc, 'result', function (result) {
          expect(result.mocha).to.not.exist
        })

        var mockMochaResult = {
          parent: {title: 'desc2', root: true},
          title: 'should do something',
          body: 'function(){ expect(false).to.be(true) }',
          hello: 'world'
        }

        runner.emit('test end', mockMochaResult)

        expect(tc.result.called).to.eq(true)
      })
    })

    describe('fail', function () {
      it('should end test on hook failure', function () {
        sandbox.stub(tc, 'result', function (result) {
          expect(result.success).to.to.eql(false)
          expect(result.skipped).to.to.eql(false)
          expect(result.log).to.deep.eq(['hook failed'])
        })

        var mockMochaHook = {
          type: 'hook',
          title: 'scenario "before each" hook',
          parent: {title: 'desc1', root: true}
        }

        runner.emit('hook', mockMochaHook)
        runner.emit('fail', mockMochaHook, {message: 'hook failed'})

        expect(tc.result.called).to.eq(true)
      })

      it('should end the test only once on uncaught exceptions', function () {
        sandbox.stub(tc, 'result', function (result) {
          expect(result.success).to.to.eql(false)
          expect(result.skipped).to.to.eql(false)
          expect(result.log).to.deep.eq(['Uncaught error.'])
        })

        var mockMochaResult = {
          parent: {title: 'desc2', root: true},
          state: 'failed',
          title: 'should do something'
        }

        runner.emit('test', mockMochaResult)
        runner.emit('fail', mockMochaResult, {message: 'Uncaught error.', uncaught: true})
        runner.emit('test end', mockMochaResult)

        expect(tc.result.called).to.eq(true)
      })

      it('should remove mocha stack entries', function () {
        sandbox.stub(tc, 'result', function (result) {
          var log = result.log[0]
          expect(log).to.not.contain('/mocha/mocha.js')
          expect(log).to.contain('/spec/controllers/list/formCtrlSpec.js')
        })

        var mockMochaResult = {
          parent: {root: true}
        }

        var stack =
          'at $httpBackend (http://localhost:8080/base/app/bower_components/angular-mocks/angular-mocks.js?506e0a37bcd764ec63da3fd7005bf56592b3df32:1149)\n' +
          'at sendReq (http://localhost:8080/base/app/bower_components/angular/angular.js?7deca05396a4331b08f812e4962ef9df1d9de0b5:8408)\n' +
          'at http://localhost:8080/base/app/bower_components/angular/angular.js?7deca05396a4331b08f812e4962ef9df1d9de0b5:8125\n' +
          'at http://localhost:8080/base/test/client/spec/controllers/list/formCtrlSpec.js?67eaca0f801cf45a86802a262618a6cfdc6a47be:110\n' +
          'at invoke (http://localhost:8080/base/app/bower_components/angular/angular.js?7deca05396a4331b08f812e4962ef9df1d9de0b5:4068)\n' +
          'at workFn (http://localhost:8080/base/app/bower_components/angular-mocks/angular-mocks.js?506e0a37bcd764ec63da3fd7005bf56592b3df32:2194)\n' +
          'at callFn (http://localhost:8080/base/node_modules/mocha/mocha.js?529c1ea3966a13c21efca5afe9a2317dafcd8abc:4338)\n' +
          'at http://localhost:8080/base/node_modules/mocha/mocha.js?529c1ea3966a13c21efca5afe9a2317dafcd8abc:4331\n' +
          'at next (http://localhost:8080/base/node_modules/mocha/mocha.js?529c1ea3966a13c21efca5afe9a2317dafcd8abc:4653)\n' +
          'at http://localhost:8080/base/node_modules/mocha/mocha.js?529c1ea3966a13c21efca5afe9a2317dafcd8abc:4663\n' +
          'at next (http://localhost:8080/base/node_modules/mocha/mocha.js?529c1ea3966a13c21efca5afe9a2317dafcd8abc:4601)\n'

        runner.emit('test', mockMochaResult)
        runner.emit('fail', mockMochaResult, {message: 'Another fail.', stack: stack})
        runner.emit('test end', mockMochaResult)

        expect(tc.result.called).to.eq(true)
      })

      it('should not remove escaped strings containing mocha stack entries', function () {
        sandbox.stub(tc, 'result', function (result) {
          var log = result.log[0]
          expect(log).to.contain('something important that contains an escaped mocha stack trace')
        })

        var mockMochaResult = {
          parent: {root: true}
        }

        var stack =
          'something important that contains an escaped mocha stack trace at workFn (http://localhost:8080/base/app/bower_components/angular-mocks/angular-mocks.js?506e0a37bcd764ec63da3fd7005bf56592b3df32:2194)\\n at callFn (http://localhost:8080/base/node_modules/mocha/mocha.js?312499f61e38c4f82b2789b388ced378202a1e75:4471:21)\\n    at Hook.Runnable.run (http://localhost:8080/base/node_modules/mocha/mocha.js?312499f61e38c4f82b2789b388ced378202a1e75:4464:7)\\n\n' +
          'at $httpBackend (http://localhost:8080/base/app/bower_components/angular-mocks/angular-mocks.js?506e0a37bcd764ec63da3fd7005bf56592b3df32:1149)\n' +
          'at sendReq (http://localhost:8080/base/app/bower_components/angular/angular.js?7deca05396a4331b08f812e4962ef9df1d9de0b5:8408)\n' +
          'at http://localhost:8080/base/app/bower_components/angular/angular.js?7deca05396a4331b08f812e4962ef9df1d9de0b5:8125\n' +
          'at http://localhost:8080/base/test/client/spec/controllers/list/formCtrlSpec.js?67eaca0f801cf45a86802a262618a6cfdc6a47be:110\n' +
          'at invoke (http://localhost:8080/base/app/bower_components/angular/angular.js?7deca05396a4331b08f812e4962ef9df1d9de0b5:4068)\n' +
          'at workFn (http://localhost:8080/base/app/bower_components/angular-mocks/angular-mocks.js?506e0a37bcd764ec63da3fd7005bf56592b3df32:2194)\n' +
          'at callFn (http://localhost:8080/base/node_modules/mocha/mocha.js?529c1ea3966a13c21efca5afe9a2317dafcd8abc:4338)\n' +
          'at http://localhost:8080/base/node_modules/mocha/mocha.js?529c1ea3966a13c21efca5afe9a2317dafcd8abc:4331\n' +
          'at next (http://localhost:8080/base/node_modules/mocha/mocha.js?529c1ea3966a13c21efca5afe9a2317dafcd8abc:4653)\n' +
          'at http://localhost:8080/base/node_modules/mocha/mocha.js?529c1ea3966a13c21efca5afe9a2317dafcd8abc:4663\n' +
          'at next (http://localhost:8080/base/node_modules/mocha/mocha.js?529c1ea3966a13c21efca5afe9a2317dafcd8abc:4601)\n'

        runner.emit('test', mockMochaResult)
        runner.emit('fail', mockMochaResult, {message: 'Another fail.', stack: stack})
        runner.emit('test end', mockMochaResult)

        expect(tc.result.called).to.eq(true)
      })
    })
  })

  describe('createMochaStartFn', function () {
    beforeEach(function () {
      this.mockMocha = {
        grep: function () {
        },
        run: function () {
        }
      }
    })

    it('should pass grep argument to mocha', function () {
      sandbox.spy(this.mockMocha, 'grep')

      createMochaStartFn(this.mockMocha)({
        args: ['--grep', 'test test']
      })

      expect(this.mockMocha.grep.getCall(0).args).to.deep.eq([/test test/])
    })

    it('should pass grep argument to mocha if we called the run with --grep=xxx', function () {
      sandbox.spy(this.mockMocha, 'grep')

      createMochaStartFn(this.mockMocha)({
        args: ['--grep=test test']
      })

      expect(this.mockMocha.grep.getCall(0).args).to.deep.eq([/test test/])
    })

    it('should pass grep argument to mocha if config.args contains property grep', function () {
      sandbox.spy(this.mockMocha, 'grep')

      createMochaStartFn(this.mockMocha)({
        args: {
          grep: 'test'
        }
      })

      expect(this.mockMocha.grep.getCall(0).args).to.deep.eq(['test'])
    })

    it('should not require client arguments', function () {
      var that = this

      expect(function () {
        createMochaStartFn(that.mockMocha)({})
      }).to.not.throw()
    })
  })

  describe('createConfigObject', function () {
    beforeEach(function () {
      this.originalMochaConfig = mochaConfig

      mochaConfig = {
        ui: 'bdd',
        globals: ['__cov']
      }

      this.karma = new Karma(new MockSocket(), null, null, null, {search: ''})
      this.karma.config = {}
    })

    afterEach(function () {
      mochaConfig = this.originalMochaConfig
    })

    it('should return default config if karma does not define client config', function () {
      this.karma.config = null

      expect(createConfigObject(this.karma)).to.eq(mochaConfig)
    })

    it('should return default config if the client config havent properties mocha', function () {
      expect(createConfigObject(this.karma)).to.eq(mochaConfig)
    })

    it('should pass client.mocha options to mocha config', function () {
      this.karma.config.mocha = {
        slow: 10
      }

      expect(createConfigObject(this.karma).slow).to.eq(10)
    })

    it('should rewrite ui options from default config', function () {
      this.karma.config.mocha = {
        ui: 'tdd'
      }

      expect(createConfigObject(this.karma).ui).to.eq('tdd')
    })

    it('should ignore propertie reporter from client config', function () {
      this.karma.config.mocha = {
        reporter: 'test'
      }

      expect(createConfigObject(this.karma).reporter).not.to.eq('test')
    })

    it('should ignore property require from client config', function () {
      this.karma.config.mocha = {
        require: 'test'
      }

      expect(createConfigObject(this.karma).require).not.to.eq('test')
    })

    it('should ignore property expose from client config', function () {
      this.karma.config.mocha = {
        expose: 'body'
      }

      expect(createConfigObject(this.karma).expose).not.to.eq('body')
    })

    it('should merge the globals from client config if they exist', function () {
      this.karma.config.mocha = {
        globals: ['test']
      }

      expect(createConfigObject(this.karma).globals).to.deep.eq(['__cov', 'test'])
    })
  })

  describe('formatError', function () {
    it('should properly format exceptions that contains \n in their message', function () {
      var errLines = formatError(new Error('foo\nbar')).split('\n')
      expect(errLines[0]).to.contain('foo')
      expect(errLines[1]).to.equal('bar')
      expect(errLines[2]).to.not.contain('foo')
    })
  })

  describe('processAssertionError', function () {
    it('should create object from mocha error', function () {
      var err = new Error()
      err.name = 'AssertionError'
      err.message = 'expected \'something\' to deeply equal \'something else\''
      err.showDiff = true
      err.actual = {baz: 'baz', foo: null, bar: function () {}}
      err.expected = {baz: 42, foo: undefined}

      var error = processAssertionError(err)

      expect(Object.keys(error)).to.be.eql(['name', 'message', 'showDiff', 'actual', 'expected'])
      expect(error.name).to.equal('AssertionError')
      expect(error.message).to.equal('expected \'something\' to deeply equal \'something else\'')
      expect(error.showDiff).to.be.true
      expect(error.actual).to.equal('{\n  "bar": [Function]\n  "baz": "baz"\n  "foo": [null]\n}')
      expect(error.expected).to.equal('{\n  "baz": 42\n  "foo": [undefined]\n}')
    })

    it('should not create object from simple error', function () {
      var err = new Error('Something wrong')

      var error = processAssertionError(err)

      expect(error).to.be.undefined
    })

    it('should not pass actual and expected if showDiff is off', function () {
      var err = new Error()
      err.message = 'expected \'something\' to deeply equal \'something else\''
      err.showDiff = false
      err.actual = {baz: 'baz', foo: null, bar: function () {}}
      err.expected = {baz: 42, foo: undefined}

      var error = processAssertionError(err)

      expect(Object.keys(error)).to.be.eql(['name', 'message', 'showDiff'])
      expect(error.name).to.equal('Error')
      expect(error.message).to.equal('expected \'something\' to deeply equal \'something else\'')
      expect(error.showDiff).to.be.false
      expect(error).to.not.have.property('actual')
      expect(error).to.not.have.property('expected')
    })
  })
})
