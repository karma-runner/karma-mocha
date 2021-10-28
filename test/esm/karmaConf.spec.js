/* global describe,it,expect */

describe('karma.conf.js', function () {
  it('should already run /base/test/esm/mochaHooks.mjs beforeAll()', function () {
    expect(
      typeof window.__UNIT_TESTS__
    ).not.eq('undefined')
  })

  it('should custom rootHooks deserialization when it have function', function () {
    // defined in karma.confi.js
    expect(
      typeof window.__karma__.config.mocha$Unsupported
    ).eq('object')

    // karma defauult deserialization got `{}`
    expect(
      Object.keys(window.__karma__.config.mocha$Unsupported.rootHooks).length
    ).to.eq(0)
  })
})
