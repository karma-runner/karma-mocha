module.exports = (grunt) ->
  jshintOptions = require('./.jshintrc')

  merge = (object, properties) ->
    for key, val of properties
      object[key] = val
    object

  grunt.initConfig
    pkgFile: 'package.json'

    files:
      adapter: ['src/adapter.js']

    build:
      adapter: '<%= files.adapter %>'

    # JSHint options
    # http://www.jshint.com/options/
    jshint:
      adapter:
        files:
          src: '<%= files.adapter %>'
        options:
          browser: true
          strict: false
          unused: false
          undef: false
          camelcase: false

      options: merge(boss: true, jshintOptions)

    karma:
      adapter:
        configFile: 'karma.conf.js'
        autoWatch: false
        singleRun: true
        reporters: ['dots']

    'npm-publish':
      options:
        requires: ['build']

    'npm-contributors':
      options:
        commitMessage: 'chore: update contributors'

    bump:
      options:
        commitMessage: 'chore: release v%VERSION%'
        pushTo: 'upstream'

    jscs:
      all:
        files: src: '<%= files.adapter %>'
      options:
        config: '.jscs.json'

  grunt.loadTasks 'tasks'
  grunt.loadNpmTasks 'grunt-contrib-jshint'
  grunt.loadNpmTasks 'grunt-jscs-checker'
  grunt.loadNpmTasks 'grunt-karma'
  grunt.loadNpmTasks 'grunt-npm'
  grunt.loadNpmTasks 'grunt-bump'
  grunt.loadNpmTasks 'grunt-auto-release'

  grunt.registerTask 'default', ['build', 'jshint', 'jscs', 'test']
  grunt.registerTask 'test', ['karma']

  grunt.registerTask 'release', 'Build, bump and publish to NPM.', (type) ->
    grunt.task.run [
      'build',
      'npm-contributors',
      "bump:#{type||'patch'}",
      'npm-publish'
    ]
