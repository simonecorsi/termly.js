var pkjson = require('../package.json');


var COMMANDS = {
  help: function () {
    var command_list = [];
    for(var key in this){
      if(this.hasOwnProperty(key)) command_list.push(key);
    }
    return command_list;
  },
  about: {
    name: pkjson.name || '',
    version: pkjson.version || '',
    author: pkjson.author || '',
    repository: pkjson.repository || '',
    license: pkjson.license || '',
  },
  clear: function () {
    return "SGCLEAR";
  },
  exit: function () {
    return "SGEXIT";
  },
  ls:function () {
    return this.__filesystem.__ls();
  },
  cat:function (argv) {
    return this.__filesystem.__cat( argv );
  },
  cd:function (argv) {
    return this.__filesystem.__cd( argv );
  },
  pwd:function () {
    return this.__filesystem.__pwd();
  }
}

COMMANDS.__proto__.__filesystem = require('./filesystem');
COMMANDS.__proto__.__initFS = function (custom_filesystem) {
  COMMANDS.__filesystem.__initFS(custom_filesystem);
}

module.exports = COMMANDS;


// recursive traversing
