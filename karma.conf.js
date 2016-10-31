module.exports = function (config) {
  config.set({
    frameworks: ['mocha', 'chai', 'sinon'],

    files: [
      'src/*.js',
      'test/*.js'
    ],

    browsers: process.env.TRAVIS ? ['Firefox'] : ['Chrome'],

    autoWatch: true,

    client: {
      mocha: {
        opts: './test/mocha.opts'
      }
    },
    
    plugins: [
      require.resolve('./'),
      'karma-chai',
      'karma-sinon',
      'karma-firefox-launcher',
      'karma-chrome-launcher'
    ]
  })
}
