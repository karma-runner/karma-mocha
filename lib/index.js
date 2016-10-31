var fs = require('fs')
var path = require('path')

var createPattern = function (path) {
  return { pattern: path, included: true, served: true, watched: false }
}

var createConfiguration = function (optsPath) {
  var config = {}
  var options = fs.readFileSync(optsPath)
  var trim = /^[\s\uFEFF\xA0\-]+|[\s\uFEFF\xA0]+$/g

  options.toString().split('\n').forEach(function (option) {
    // split key, value
    var prop = option.split(' ')
    // trim the key
    var key = prop[0].replace(trim, '')
    // no support for bootstrap at this time
    if (key !== 'require') {
      if (key === 'delay') {
        config[key] = ''
      } else if (key === 'globals') {
        if (!config['globals']) {
          config['globals'] = []
        }
        config['globals'].push(prop[1].replace(trim, ''))
      } else {
        config[key] = prop[1].replace(trim, '')
      }
    }
  })

  return config
}

var initMocha = function (files, mochaConfig) {
  var mochaPath = path.dirname(require.resolve('mocha'))
  files.unshift(createPattern(path.join(__dirname, 'adapter.js')))

  if (mochaConfig && mochaConfig.require && mochaConfig.require.map) {
    mochaConfig.require.map(function (requirePath) {
      return files.unshift(createPattern(requirePath))
    })
  }

  files.unshift(createPattern(path.join(mochaPath, 'mocha.js')))

  if (mochaConfig) {
    if (mochaConfig.reporter) {
      files.unshift(createPattern(path.join(mochaPath, 'mocha.css')))
    }

    if (mochaConfig.opts) {
      var config = createConfiguration(mochaConfig.opts)
      var configPath = path.join(__dirname, 'config.js')
      // create wrapper. avoid using grunt task for stability.
      var data = ';(function (window) {' +
        'window.__mochaOptsConfig = JSON.parse(\'' + JSON.stringify(config) + '\')' +
        ' })(window)'
      fs.writeFileSync(configPath, data, {
        encoding: 'utf8',
        flag: 'w'
      })
      // provide options to the browser
      files.unshift(createPattern(configPath))
    }
  }
}

initMocha.$inject = ['config.files', 'config.client.mocha', 'config.mocha']

module.exports = {
  'framework:mocha': ['factory', initMocha]
}
