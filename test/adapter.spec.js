/**
 Tests for adapter/mocha.src.js
 These tests are executed in browser.
 */

describe('adapter mocha', function() {
  var Karma = window.__karma__.constructor;
  var sandbox;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('createMochaReporterConstructor', function(){
    beforeEach(function() {
      this.karma = new Karma(new MockSocket(), null, null, null, {search: ''});
      this.karma.config = {
        mocha: {
          reporter: 'html'
        }
      };

      sandbox.stub(window, 'createMochaReporterNode');
    });

    it('should take reporter from client config on debug page', function(){
      expect(createMochaReporterConstructor(this.karma, '/debug.html')).to.equal('html');
    });

    it('should create node for mocha reporter', function(){
      createMochaReporterConstructor(this.karma, '/debug.html');

      expect(createMochaReporterNode.called).to.equal(true);
    });

    it('should define console reporter if does not pass reporter in config', function(){
      this.karma.config.mocha.reporter = null;

      expect(createMochaReporterConstructor(this.karma, '/debug.html')).not.to.equal(null);
    });
  });

  describe('reporter', function() {
    var runner, tc;

    beforeEach(function() {
      tc = new Karma(new MockSocket(), null, null, null, {search: ''});
      runner = new Emitter();
      reporter = new (createMochaReporterConstructor(tc))(runner);
    });


    describe('start', function() {

      it('should report total number of specs', function() {
        runner.total = 12;
        sandbox.spy(tc, 'info');

        runner.emit('start');
        expect(tc.info.getCall(0).args).to.deep.eq([{total: 12}]);
      });
    });


    describe('end', function() {

      it('should report complete', function() {
        sandbox.spy(tc, 'complete');

        runner.emit('end');
        expect(tc.complete.called).to.eq(true);
      });
    });


    describe('test end', function() {

      it('should report result', function() {
        sandbox.stub(tc, 'result', function(result) {
          expect(result.id).to.not.be.undefined;
          expect(result.description).to.eq('should do something');
          expect(result.suite instanceof Array).to.eq(true);
          expect(result.success).to.eq(true);
          expect(result.skipped).to.to.eql(false);
          expect(result.log instanceof Array).to.eq(true);
          expect(result.time).to.eq(123);
        });

        var mockMochaResult = {
          duration: 123,
          parent: {title: 'desc2', parent: {title: 'desc1', root: true}, root: false},
          state: 'passed',
          title: 'should do something'
        };

        runner.emit('test', mockMochaResult);
        runner.emit('test end', mockMochaResult);

        expect(tc.result.called).to.eq(true);
      });


      it('should report time 0 for skipped tests', function() {
        sandbox.stub(tc, 'result', function(result) {
          expect(result.skipped).to.eq(true);
          expect(result.time).to.eq(0);
        });

        var mockMochaResult = {
          pending: true,
          parent: {root: true}
        };

        runner.emit('test', mockMochaResult);
        runner.emit('test end', mockMochaResult);

        expect(tc.result.called).to.eq(true);
      });


      it('should report failed result', function() {
        sandbox.stub(tc, 'result', function(result) {
          expect(result.success).to.to.eql(false);
          expect(result.skipped).to.to.eql(false);
          expect(result.log).to.deep.eq(['Big trouble.', 'Another fail.']);
        });

        var mockMochaResult = {
          parent: {title: 'desc2', root: true},
          state: 'failed',
          title: 'should do something'
        };

        runner.emit('test', mockMochaResult);
        runner.emit('fail', mockMochaResult, {message: 'Big trouble.'});
        runner.emit('pass', mockMochaResult);
        runner.emit('fail', mockMochaResult, {message: 'Another fail.'});
        runner.emit('test end', mockMochaResult);

        expect(tc.result.called).to.eq(true);
      });


      it('should report suites', function() {
        sandbox.stub(tc, 'result', function(result) {
          expect(result.suite).to.deep.eq(['desc1', 'desc2']);
        });

        var mockMochaResult = {
          parent: {title: 'desc2', parent: {title: 'desc1', parent: {root: true}, root: false}, root: false},
          title: 'should do something',
        };

        runner.emit('test', mockMochaResult);
        runner.emit('test end', mockMochaResult);

        expect(tc.result.called).to.eq(true);
      });
    });

    describe('fail', function() {
      it('should end test on hook failure', function() {
        sandbox.stub(tc, 'result', function(result) {
          expect(result.success).to.to.eql(false);
          expect(result.skipped).to.to.eql(false);
          expect(result.log).to.deep.eq(['hook failed']);
        });

        var mockMochaHook = {
          type: 'hook',
          title: 'scenario "before each" hook',
          parent: {title: 'desc1', root: true}
        };

        runner.emit('hook', mockMochaHook);
        runner.emit('fail', mockMochaHook, {message: 'hook failed'});

        expect(tc.result.called).to.eq(true);
      });

      it('should end the test only once on uncaught exceptions', function() {
        sandbox.stub(tc, 'result', function(result) {
          expect(result.success).to.to.eql(false);
          expect(result.skipped).to.to.eql(false);
          expect(result.log).to.deep.eq(['Uncaught error.']);
        });

        var mockMochaResult = {
          parent: {title: 'desc2', root: true},
          state: 'failed',
          title: 'should do something'
        };

        runner.emit('test', mockMochaResult);
        runner.emit('fail', mockMochaResult, {message: 'Uncaught error.', uncaught: true});
        runner.emit('test end', mockMochaResult);

        expect(tc.result.called).to.eq(true);
      });
    });
  });

  describe('createMochaStartFn', function() {
    beforeEach(function() {
      this.mockMocha = {
        grep: function(){},
        run: function(){}
      };
    });

    it('should pass grep argument to mocha', function() {
      sandbox.spy(this.mockMocha, 'grep');

      createMochaStartFn(this.mockMocha)({
        args: ['--grep', 'test']
      });

      expect(this.mockMocha.grep.getCall(0).args).to.deep.eq(['test']);
    });

    it('should pass grep argument to mocha if we called the run with --grep=xxx', function() {
      sandbox.spy(this.mockMocha, 'grep');

      createMochaStartFn(this.mockMocha)({
        args: ['--grep=test']
      });

      expect(this.mockMocha.grep.getCall(0).args).to.deep.eq(['test']);
    });

    it('should pass grep argument to mocha if config.args contains property grep', function(){
        sandbox.spy(this.mockMocha, 'grep');

        createMochaStartFn(this.mockMocha)({
            args: {
                grep: 'test'
            }
        });

      expect(this.mockMocha.grep.getCall(0).args).to.deep.eq(['test']);
    });

    it('should not require client arguments', function() {
      var that = this;

      expect(function(){
        createMochaStartFn(that.mockMocha)({});
      }).to.not.throw();
    });
  });

  describe('createConfigObject', function() {
    beforeEach(function() {
      this.originalMochaConfig = mochaConfig;

      mochaConfig = {
        ui: 'bdd',
        globals: ['__cov']
      };

      this.karma = new Karma(new MockSocket(), null, null, null, {search: ''});
      this.karma.config = {};
    });

    afterEach(function() {
      mochaConfig = this.originalMochaConfig;
    });

    it('should return default config if karma does not define client config', function() {
      this.karma.config = null;

      expect(createConfigObject(this.karma)).to.eq(mochaConfig);
    });

    it('should return default config if the client config havent properties mocha', function() {
      expect(createConfigObject(this.karma)).to.eq(mochaConfig);
    });

    it('should pass client.mocha options to mocha config', function() {
      this.karma.config.mocha = {
        slow: 10
      };

      expect(createConfigObject(this.karma).slow).to.eq(10);
    });

    it('should rewrite ui options from default config', function() {
      this.karma.config.mocha = {
        ui: 'tdd'
      };

      expect(createConfigObject(this.karma).ui).to.eq('tdd');
    });

    it('should ignore propertie reporter from client config', function() {
      this.karma.config.mocha = {
        reporter: 'test'
      };

      expect(createConfigObject(this.karma).reporter).not.to.eq('test');
    });

    it('should merge the globals from client config if they exist', function() {
      this.karma.config.mocha = {
        globals: ['test']
      };

      expect(createConfigObject(this.karma).globals).to.deep.eq(['__cov', 'test']);
    });
  });
});
