# karma-mocha [![Build Status](https://travis-ci.org/karma-runner/karma-mocha.png?branch=master)](https://travis-ci.org/karma-runner/karma-mocha)

> Adapter for the [Mocha](http://visionmedia.github.io/mocha/) testing framework.

## Installation

The easiest way is to keep `karma-mocha` as a devDependency in your `package.json`.
```json
{
  "devDependencies": {
    "karma": "~0.10",
    "karma-mocha": "~0.1"
  }
}
```

You can simple do it by:
```bash
npm install karma-mocha --save-dev
```

## Configuration
Following code shows the default configuration...
```js
// karma.conf.js
module.exports = function(config) {
  config.set({
    frameworks: ['mocha'],

    files: [
      '*.js'
    ]
  });
};
```

If you want to pass configuration options directly to mocha you can
do this in the following way

```js
// karma.conf.js
module.exports = function(config) {
  config.set({
    frameworks: ['mocha'],

    files: [
      '*.js'
    ],

    client: {
      mocha: {
        ui: 'tdd'
      }
    }
  });
};
```

Or if you ues karma with grunt, you should add the mocha configuration
to the Gruntfile.js like this, because the plugin grunt-karma would
overwrite this value

```js
// Gruntfile.js

grunt.initConfig({
  karma: {
    test: {
      client: {
        mocha: {
          bail: true,
          ui: 'bdd'
        }
      },
      configFile: 'karma.conf.js'
    }
  }
});
```


----

For more information on Karma see the [homepage].


[homepage]: http://karma-runner.github.com
