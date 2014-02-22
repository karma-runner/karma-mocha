/**
 Tests for adapter/mocha.src.js
 These tests are executed in browser.
 */

describe('adapter mocha', function() {
  var Karma = window.__karma__.constructor;

  describe('reporter', function() {
    var runner, tc;

    beforeEach(function() {
      tc = new Karma(new MockSocket(), {});
      runner = new Emitter();
      reporter = new (createMochaReporterConstructor(tc))(runner);
    });


    describe('start', function() {

      it('should report total number of specs', function() {
        runner.total = 12;
        spyOn(tc, 'info');

        runner.emit('start');
        expect(tc.info).toHaveBeenCalledWith({total: 12});
      });
    });


    describe('end', function() {

      it('should report complete', function() {
        spyOn(tc, 'complete');

        runner.emit('end');
        expect(tc.complete).toHaveBeenCalled();
      });
    });


    describe('test end', function() {

      it('should report result', function() {
        spyOn(tc, 'result').andCallFake(function(result) {
          expect(result.id).toBeDefined();
          expect(result.description).toBe('should do something');
          expect(result.suite instanceof Array).toBe(true);
          expect(result.success).toBe(true);
          expect(result.skipped).toBe(false);
          expect(result.log instanceof Array).toBe(true);
          expect(result.time).toBe(123);
        });

        var mockMochaResult = {
          duration: 123,
          parent: {title: 'desc2', parent: {title: 'desc1', root: true}, root: false},
          state: "passed",
          title: 'should do something'
        };

        runner.emit('test', mockMochaResult);
        runner.emit('test end', mockMochaResult);

        expect(tc.result).toHaveBeenCalled();
      });


      it('should report time 0 for skipped tests', function () {
        spyOn(tc, 'result').andCallFake(function(result) {
          expect(result.skipped).toBe(true);
          expect(result.time).toBe(0);
        });

        var mockMochaResult = {
          pending: true,
          parent: {root: true}
        };

        runner.emit('test', mockMochaResult);
        runner.emit('test end', mockMochaResult);

        expect(tc.result).toHaveBeenCalled();
      });


      it('should report failed result', function() {
        spyOn(tc, 'result').andCallFake(function(result) {
          expect(result.success).toBe(false);
          expect(result.skipped).toBe(false);
          expect(result.log).toEqual(['Big trouble.', 'Another fail.']);
        });

        var mockMochaResult = {
          parent: {title: 'desc2', root: true},
          state: "failed",
          title: 'should do something'
        };

        runner.emit('test', mockMochaResult);
        runner.emit('fail', mockMochaResult, {message: 'Big trouble.'});
        runner.emit('pass', mockMochaResult);
        runner.emit('fail', mockMochaResult, {message: 'Another fail.'});
        runner.emit('test end', mockMochaResult);

        expect(tc.result).toHaveBeenCalled();
      });


      it('should report suites', function() {
        spyOn(tc, 'result').andCallFake(function(result) {
          expect(result.suite).toEqual(['desc1', 'desc2']);
        });

        var mockMochaResult = {
          parent: {title: 'desc2', parent: {title: 'desc1', parent: {root: true}, root: false}, root: false},
          title: 'should do something',
        };

        runner.emit('test', mockMochaResult);
        runner.emit('test end', mockMochaResult);

        expect(tc.result).toHaveBeenCalled();
      });
    });

    describe('fail', function() {
      it('should end test on hook failure', function() {
        spyOn(tc, 'result').andCallFake(function(result) {
          expect(result.success).toBe(false);
          expect(result.skipped).toBe(false);
          expect(result.log).toEqual(['hook failed']);
        });

        var mockMochaHook = {
          type: 'hook',
          title: 'scenario "before each" hook',
          parent: {title: 'desc1', root: true}
        };

        runner.emit('hook', mockMochaHook);
        runner.emit('fail', mockMochaHook, {message: 'hook failed'});

        expect(tc.result).toHaveBeenCalled();
      });

      it('should end the test only once on uncaught exceptions', function() {
        spyOn(tc, 'result').andCallFake(function(result) {
          expect(result.success).toBe(false);
          expect(result.skipped).toBe(false);
          expect(result.log).toEqual(['Uncaught error.']);
        });

        var mockMochaResult = {
          parent: {title: 'desc2', root: true},
          state: "failed",
          title: 'should do something'
        };

        runner.emit('test', mockMochaResult);
        runner.emit('fail', mockMochaResult, {message: 'Uncaught error.', uncaught: true});
        runner.emit('test end', mockMochaResult);

        expect(tc.result.calls.length).toBe(1);
      });
    });
  });

  describe('createMochaStartFn', function() {
    beforeEach(function() {
      this.mockMocha = {
        grep: function(){},
        run: function(){},
      };
    });

    it('should pass grep argument to mocha', function() {
      spyOn(this.mockMocha, 'grep');

      createMochaStartFn(this.mockMocha)({
        args: ['--grep', 'test']
      });

      expect(this.mockMocha.grep).toHaveBeenCalledWith('test');
    });

    it('should pass grep argument to mocha if we called the run with --grep=xxx', function() {
      spyOn(this.mockMocha, 'grep');

      createMochaStartFn(this.mockMocha)({
        args: ['--grep=test']
      });

      expect(this.mockMocha.grep).toHaveBeenCalledWith('test');
    });

    it('should pass grep argument to mocha if config.args contains property grep', function(){
        spyOn(this.mockMocha, 'grep');

        createMochaStartFn(this.mockMocha)({
            args: {
                grep: 'test'
            }
        });

        expect(this.mockMocha.grep).toHaveBeenCalledWith('test');
    });

    it('should not require client arguments', function() {
      var that = this;

      expect(function(){
        createMochaStartFn(that.mockMocha)({});
      }).not.toThrow();
    });
  });

  describe('createConfigObject', function() {
    beforeEach(function() {
      this.originalMochaConfig = mochaConfig;

      mochaConfig = {
        ui: 'bdd',
        globals: ['__cov']
      };

      this.karma = new Karma(new MockSocket(), {});
      this.karma.config = {};
    });

    afterEach(function() {
      mochaConfig = this.originalMochaConfig;
    });

    it('should return default config if karma does not define client config', function() {
      this.karma.config = null;

      expect(createConfigObject(this.karma)).toBe(mochaConfig);
    });

    it('should return default config if the client config havent properties mocha', function() {
      expect(createConfigObject(this.karma)).toBe(mochaConfig);
    });

    it('should pass client.mocha options to mocha config', function() {
      this.karma.config.mocha = {
        slow: 10
      };

      expect(createConfigObject(this.karma).slow).toBe(10);
    });

    it('should rewrite ui options from default config', function() {
      this.karma.config.mocha = {
        ui: 'tdd'
      };

      expect(createConfigObject(this.karma).ui).toBe('tdd');
    });

    it('should ignore propertie reporter from client config', function() {
      this.karma.config.mocha = {
        reporter: 'test'
      };

      expect(createConfigObject(this.karma).reporter).not.toBe('test');
    });

    it('should merge the globals from client config if they exist', function() {
      this.karma.config.mocha = {
        globals: ['test']
      };

      expect(createConfigObject(this.karma).globals).toEqual(['__cov', 'test']);
    });
  });
});
