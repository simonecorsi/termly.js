var package = require('../package.json');


var COMMANDS = {
  help: function () {
    var command_list = [];
    for(var key in this){
      if(this.hasOwnProperty(key)) command_list.push(key);
    }
    return command_list;
  },
  about: {
    name: package.name || '',
    version: package.version || '',
    author: package.author || '',
    repository: package.repository || '',
    license: package.license || '',
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
}

COMMANDS.__proto__.__filesystem = require('./filesystem');;

module.exports = COMMANDS;
