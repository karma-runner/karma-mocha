module.exports = function (config) {
  config.set({
    frameworks: ['mocha', 'chai', 'sinon'],

    files: [
      'src/*.js',
      'test/*.js'
    ],

    browsers: process.env.TRAVIS ? ['Firefox'] : ['Chrome'],

    autoWatch: true
  })
}
