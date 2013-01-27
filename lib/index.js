var createPattern = function(path) {
  return {pattern: path, included: true, served: true, watched: false};
};

var initMocha = function(files) {
  files.unshift(createPattern(__dirname + '/adapter.js'));
  files.unshift(createPattern(__dirname + '/mocha.js'));
};

initMocha.$inject = ['config.files'];

module.exports = {
  'framework:mocha': ['factory', initMocha]
};
