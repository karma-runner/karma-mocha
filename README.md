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

## Custom Configuration -- (not currently possible until someone creates a way to pass the mocha.conf.js file to mocha... );
If you want to customize your mocha experience you can do something like:

```js
// In your mocha.conf.js file change the options in the Configuration object:

var Configuration = {
	// show colors?
	colors : [true]
	// enable node's debugger? (synonym for node --debug)
	,   debug: [false]
	//  do you want to pass in a given comma-delimited global [names]?
	,	    globals : ["none"]
	// do you want to only run tests matching <pattern>? blank for all
	,   grep : ["none"]
	//  do you want to use growl for notifications? (I think this is UNIX only...)
	,   growl : [false]
	//  (I have no idea what leaks are)
	,   ignoreLeaks : [true]
	//  if grep has values and if matches are found, do you want to invert the matches?
	,   invert : ["none"]
	// dot | doc | spec | json | progress | list | tap | landing | xunit | html-cov | json-cov | min | json-stream | markdown | nyan <-- as in nyan cat.
	,   reporter : ["dot"]
	//  set test-case timeout in milliseconds
	,   timeout : 2000
	// bdd | tdd | exports
	,   ui : ["bdd"]
};

//don't mess with the stuff below this 
```


----

For more information on Karma see the [homepage].


[homepage]: http://karma-runner.github.com
