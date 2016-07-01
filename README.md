# karma-mocha

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/karma-runner/karma-mocha)
 [![npm version](https://img.shields.io/npm/v/karma-mocha.svg?style=flat-square)](https://www.npmjs.com/package/karma-mocha) [![npm downloads](https://img.shields.io/npm/dm/karma-mocha.svg?style=flat-square)](https://www.npmjs.com/package/karma-mocha)

[![Build Status](https://img.shields.io/travis/karma-runner/karma-mocha/master.svg?style=flat-square)](https://travis-ci.org/karma-runner/karma-mocha) [![Dependency Status](https://img.shields.io/david/karma-runner/karma-mocha.svg?style=flat-square)](https://david-dm.org/karma-runner/karma-mocha) [![devDependency Status](https://img.shields.io/david/dev/karma-runner/karma-mocha.svg?style=flat-square)](https://david-dm.org/karma-runner/karma-mocha#info=devDependencies)

> Adapter for the [Mocha](http://mochajs.org/) testing framework.

## Installation

The easiest way is to keep `karma-mocha` as a devDependency in your `package.json`.
```json
{
  "devDependencies": {
    "karma-mocha": "~0.1"
  }
}
```

You can simple do it by:
```bash
npm install karma-mocha --save-dev
```

Instructions on how to install `karma` can be found [here.](http://karma-runner.github.io/0.12/intro/installation.html)

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
        // change Karma's debug.html to the mocha web reporter
        reporter: 'html',

        // require specific files after Mocha is initialized
        require: [require.resolve('bdd-lazy-var/bdd_lazy_var_global')],

        // custom ui, defined in required file above
        ui: 'bdd-lazy-var/global',
      }
    }
  });
};
```

If you want run only some tests matching a given pattern you can
do this in the following way

```sh
karma start &
karma run -- --grep=<pattern>
```

or

```js
module.exports = function(config) {
  config.set({
    ...
    client: {
      mocha:{
        grep: '<pattern>',
        ...
      }
      ...
    }
  });
};
```

The `grep` argument is passed directly to mocha.

If you already have a configuration for Mocha in an opts file
do this in your Karma configuration

```js
module.exports = function(config) {
  config.set({
    ...
    client: {
      mocha:{
        opts: './path/to/file.opts',
        ...
      }
      ...
    }
  });
};
```

The plugin reads the opts file. It generates a JS file with 
the configuration to provide to Mocha.

If you have a configuration in Mocha 

Note: currently the flag `--require` is not supported.
Note: if you define globals in your Karma config it will be merged with
the globals coming from the opts file.

## Internals

On the end of each test `karma-mocha` passes to `karma` result object with fields:

* `description` Test title.
* `suite` List of titles of test suites.
* `success` True if test is succeed, false otherwise.
* `skipped` True if test is skipped.
* `time` Test duration.
* `log` List of errors.
* `assertionErrors` List of additional error info: 
    * `name` Error name.
    * `message` Error message.
    * `actual` Actual data in assertion, serialized to string.
    * `expected` Expected data in assertion, serialized to string.
    * `showDiff` True if it is configured by assertion to show diff.

This object will be passed to test reporter.


----

For more information on Karma see the [homepage].


[homepage]: http://karma-runner.github.com
