// Mocha configuration (TODO  have karma init autogenerate this)
// These are the default setttings

"use strict";

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

var finalConfig = (function removeExtraProperties(configurationObject){
	var configuration = configurationObject;
	if ( configuration ){
		for (var i in configuration){

			if (configuration.hasOwnProperty(configuration[i])) {
				if(configuration[i] === "none"){
					console.log(" deleting : " + i );
					delete configuration[i];
					console.log (i + " : " + configuration[i]);
				} else {
					console.log (i + " : " + configuration[i]);
				}
			}

		}
	} else {
		configuration =  "";
	}
	return configuration;
})(Configuration);


module.exports = function(config) {

	config.set( finalConfig );
	console.log(finalConfig);
};
