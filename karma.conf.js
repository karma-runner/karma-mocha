module.exports = function (config) {
  config.set({
    frameworks: ['mocha', 'chai', 'sinon'],

    files: [
      'src/*.js',
      'test/**/*.js',
      {
        pattern: 'test/**/*.mjs',
        type: 'module'
      }
    ],
    exclude: [
      // exclude nodejs only stuff
      'test/lib/index.spec.js'
    ],

    browsers: process.env.TRAVIS ? ['Firefox'] : ['Chrome'],

    autoWatch: true,

    plugins: [
      require.resolve('./'),
      'karma-chai',
      'karma-sinon',
      'karma-firefox-launcher',
      'karma-chrome-launcher'
    ],

    client: {
      mocha: {
        rootHooks: {
          type: 'import',
          value: '/base/test/esm/mochaHooks.mjs'
        }
      },

      mocha$Unsupported: {
        rootHooks: {
          beforeAll () {
            throw new Error('not supported')
          }
        }
      }

    }
  })
}
