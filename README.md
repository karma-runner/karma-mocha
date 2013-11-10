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

## Custom Configuration
If you want to customize your mocha experience you can do something like:

```js
// In your karma.conf.js

module.exports = function(config) {
var OPTIONS = {
                grep
            ,   ui
            ,   reporter
            ,   timeout
            ,   invert
            ,   ignoreLeaks
            ,   growl
            ,   globals
	}
  config.set({
    frameworks: ['mocha'],

    files: [
      '*.js'
    ],
    mocha.theMagicMethodThatIsUsedToInsertUserConfiguredVariables(OPTIONS);
  });
};

```


----

For more information on Karma see the [homepage].


[homepage]: http://karma-runner.github.com
