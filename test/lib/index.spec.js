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

    initMocha(files, mochaConfig)

    expect(files[1].pattern).to.contain('foo.js')
  })

  it('should add mocha.css if we define reporter in config', function () {
    var mochaConfig = {reporter: 'html'}

    initMocha(files, mochaConfig)

    expect(files[0].pattern).to.contain('mocha.css')
  })
})

function createMockFiles () {
  return []
}
