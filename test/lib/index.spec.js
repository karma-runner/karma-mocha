var mock = require('mock-fs')
var expect = require('chai').expect
var initMocha = require('../../lib')['framework:mocha'][1]

describe('framework:mocha', function () {
  var files

  beforeEach(function () {
    files = createMockFiles()
  })

  it('should add adapter.js', function () {
    initMocha(files)

    expect(files[1].pattern).to.contain('adapter.js')
  })

  it('should add mocha.js', function () {
    initMocha(files)

    expect(files[0].pattern).to.contain('mocha.js')
  })

  it('should add required files', function () {
    var mochaConfig = {require: ['foo.js']}

    initMocha(files, createMochaConfig(mochaConfig))

    expect(files[1].pattern).to.contain('foo.js')
  })

  it('should add mocha.css if we define reporter in config', function () {
    var mochaConfig = {reporter: 'html'}

    initMocha(files, createMochaConfig(mochaConfig))

    expect(files[0].pattern).to.contain('mocha.css')
  })

  describe('load mocha.opts as a configuration file', function () {
    beforeEach(function () {
      mock({
        'test/mocha.opts': [
          '--sort',

          '--require should',
          '--reporter dot',
          '--ui bdd',
          '--globals foo',
          '--globals bar',
          '--timeout 100',
          '--slow 200',
          '--grep zoo',
          '--bail',
          '--ignoreLeaks'
        ].join('\n'),
        'test/foo.opts': '--ui tdd'
      })
    })

    afterEach(function () {
      mock.restore()
    })

    it('should read mocha options from test/mocha.opts file by default', function () {
      var config = createMochaConfig({opts: true})

      initMocha(files, config)

      expect(config.client.mocha.require).to.eql(['should'])
      expect(config.client.mocha.globals).to.eql(['foo', 'bar'])
      expect(config.client.mocha.reporter).to.equal('dot')
      expect(config.client.mocha.ui).to.equal('bdd')
    })

    it('should set only supported options', function () {
      var config = createMochaConfig({opts: true})

      initMocha(files, config)

      expect(config.client.mocha).to.eql({
        require: ['should'],

        ui: 'bdd',
        reporter: 'dot',
        globals: ['foo', 'bar'],
        grep: 'zoo',

        timeout: 100,
        slow: 200,
        bail: true,
        ignoreLeaks: true
      })
    })

    it('should rewrite options from mocha.opts by options from config', function () {
      var config = createMochaConfig({opts: true, ui: 'tdd', globals: ['zoo']})

      initMocha(files, config)

      expect(config.client.mocha.require).to.eql(['should'])
      expect(config.client.mocha.globals).to.eql(['zoo'])
      expect(config.client.mocha.reporter).to.equal('dot')
      expect(config.client.mocha.ui).to.equal('tdd')
    })

    it('should pass custom mocha.opts path', function () {
      var config = createMochaConfig({opts: 'test/foo.opts'})

      initMocha(files, config)

      expect(config.client.mocha.ui).to.equal('tdd')
    })
  })
})

function createMockFiles () {
  return []
}

function createMochaConfig (mochaConfig) {
  return {
    client: {
      mocha: mochaConfig
    }
  }
}
