(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports={
  "name": "browser-terminal.js",
  "version": "0.1.1",
  "description": "Simple Browser Terminal in pure js for presentational purpose",
  "main": "terminal.js",
  "scripts": {
    "start": "npm run build",
    "build": " browserify ./src/terminal.js -o ./terminal.js && uglifyjs terminal.js > terminal.min.js",
    "watch": "watchify --verbose --debug ./src/terminal.js -o 'uglifyjs -cm > terminal.min.js'"
  },
  "keywords": [
    "terminal",
    "javascript",
    "simulator",
    "browser",
    "presentation",
    "mockup",
    "commands",
    "fake"
  ],
  "repository": "https://github.com/Kirkhammetz/browser-terminal.js",
  "author": "Simone Corsi",
  "license": "ISC",
  "devDependencies": {
    "axios": "^0.12.0",
    "browserify": "^13.0.1",
    "uglify-js": "^2.6.4",
    "watchify": "^3.7.0"
  }
}

},{}],2:[function(require,module,exports){
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

},{"../package.json":1,"./filesystem":3}],3:[function(require,module,exports){
// *FILESYSTEM
var FS = {
  var:{
    www: {
      "anotherfile": "WELLCOME"
    },
    inner: {},
  },
  etc:{
    apache2: {
      "apache2.conf": "Not what you are looking for"
    }
  },
  "thisisafile.md": "What did you expect?"
};

FS.__initFS = function (custom_filesystem) {
  if(custom_filesystem) FS = custom_filesystem;
}

FS.__proto__.pwd = '/';
FS.__proto__.__pwd = function () {
  return this.pwd;
}
FS.__proto__.setCurrentDir = function (cd) {
  this.__proto__.pwd = '/' + cd;
}

FS.__proto__.getCurrentDirIstance = function () {
  var path = FS.__pwd().split("/");
  path.shift();
  if(path[0] !== ''){
    var current_dir = this.getNode(FS, path)
    return Object.assign({}, current_dir);
  }else{
    return Object.assign({}, FS);
  }
}

FS.__proto__.__filetype = function (file) {
  if(typeof file === 'string') return 'FILE';
  if(typeof file === 'object' && !Array.isArray(file)) return 'DIR';
  if(typeof file === 'object' && Array.isArray(file)) return 'LIST';
}

FS.__proto__.getNode = function(fs, path){
  if ( path.length === 0 || !path ) {
    console.error('no path provided')
    return null;
  }
  var fs = Object.assign({}, fs);
  var path = Object.assign([], path);
  if ( path.length === 1) {
    if( !fs ){
      console.error('path '+ path[0] +' dont exists');
      return null;
    }
    if( fs && !fs[ path[0] ] ){
        console.error('path '+ path[0] +' dont exists');
        return null;
    }
    if( FS.__filetype( fs[ path[0] ] ) === 'FILE' ) {
      console.error('its a file');
      return null;
    }
    //return fs[ path[0] ];
    return Object.assign({}, fs[ path[0] ]);
  }
  fs = fs[path[0]] ? fs[path[0]] : null;
  path.shift();
  return FS.getNode(fs, path);
}


// COMMANDS
//------------------------------------------------
FS.__proto__.__ls = function () {
  var ls = "";
  var that = this;
  var current_dir = FS.getCurrentDirIstance();

  for(var key in current_dir){
    if(current_dir.hasOwnProperty(key)){
      var stat = '';
      if(that.__filetype(current_dir[key]) === 'DIR'){
        stat = formatDirRow(key);
      } else if(that.__filetype(current_dir[key]) === 'FILE'){
        stat = formatFileRow(key);
      } else{
        stat = formatFileRow(key);
      }
      ls += stat + "\n";
    }
  }
  return ls;
}

FS.__proto__.__cat = function (argv) {
  var that = this;
  var current_dir = FS.getCurrentDirIstance();
  if(!argv) return "cat need 1 input file.";
  var file = current_dir[argv[0]] || null;
  //get file if exist
  if(!file) return "File not found.";
  if( that.__filetype(file) === 'DIR') return 'Is a directory.';
  return file;
}


FS.__proto__.__cd = function (argv) {
  if(!argv) return "Path argument expected.";
  if(argv.length > 1 ) return "Too many arguments";
  var path = argv[0];

  // GO BACK
  if(path === '..'){
    return 'go back 1 dir'
  }

  // IF PATH IS ABSOLUTE
  if(path[0] === '/') {
    path = path.split('/');
    path.shift();

    // IF CD INTO ROOT DIR
    if(path[0] === ''){
      FS.setCurrentDir('');
      return argv;
    }
  }else{
    // IF PATH IS RELATIVE
    path = FS.__pwd().length === 1  ? FS.__pwd() + path : FS.__pwd() + '/' + path;
    path = path.split('/');
    path.shift();
  }

  var node = FS.getNode(FS, path);
  if(node){
    this.setCurrentDir( path.join("/") );
    return 'Changed current dir to: ' + this.__pwd();
  }else{
    return "Path dont exists or is a file";
  }
  return this.__pwd();
}



module.exports = FS;

//** HELPERS
function formatFileRow(file) {
  return "-r--r--r-- guest guest " + file;
}
function formatDirRow(dir) {
  return "dr-xr-xr-x guest guest " + dir;
}

},{}],4:[function(require,module,exports){
(function (window, document, undefined) {
  var Terminal = {
    init: function ( terminal_container, custom_commands, custom_filesystem ) {
      this.Commands = require('./commands');
      this.Commands.__initFS(custom_filesystem || null);
      if(custom_commands) this.addCustomCommands(custom_commands);
      this.terminal_container = terminal_container;
      this.generateRow( terminal_container );
      window.addEventListener('click', function () {
        document.getElementsByClassName('current')[0].children[1].focus();
      });
    },
    generateTerminalRow:function () {
      var that = this;
      return '\
        <span class="terminal_info">guest@'+ (location.hostname ? location.hostname : 'localhost') +' \
        ➜ '+ that.Commands.pwd() +' </span> \
        <input type="text" class="terminal_input" size="1" style="cursor:none;"> \
      ';
    },
    addCustomCommands:function (custom_commands) {
      for(var key in custom_commands){
        if(custom_commands.hasOwnProperty(key) && !this.Commands[key]){
          this.Commands[key] = custom_commands[key];
        }
      }
    },
    generateRow: function ( terminal_container ) {
      var that = this;
      var terminal_row, current, input;
      terminal_row = document.createElement('div');
      current = document.querySelectorAll(".current")[0];
      if(current){
        current.children[1].disabled = true;
        current.className = 'terminal_row';
      }
      terminal_row.className = 'current terminal_row';
      terminal_row.innerHTML = this.generateTerminalRow();
      terminal_container.appendChild(terminal_row);
      current = terminal_container.querySelector('.current');
      input = current.children[1];
      input.focus();
      input.addEventListener('keyup', that.consoleTypingHandler );
    },
    getSTDIN: function (command) {
      var argv = command.trim().split(" ");
      var res = this.parseCommand(argv);
      if(!!res) this.sendSTDOUT(res);
    },
    sendSTDOUT: function (message, exit) {
      var res = document.createElement('pre');
      res.innerText = message;
      this.terminal_container.appendChild(res);
      if(!exit) this.generateRow(this.terminal_container);
    },
    parseCommand:function (argv) {
      var that = this;
      var Commands = this.Commands;
      command = argv.shift();

      for(var key in Commands){
        if(Commands.hasOwnProperty(key) && command === key){
          var stdout;
          var res = (typeof Commands[key] === 'function') ? Commands[key]( argv.length ? argv : null ) : Commands[key] ;
          switch (true) {
            case (typeof res === 'string' && res === 'SGEXIT'):
              that.exitHandler();
              return null;
              break;
            case (typeof res === 'string' && res === 'SGCLEAR'):
              that.clearHandler();
              return null;
              break;
            case (typeof res === 'string'):
              stdout = res;
              break;
            case (typeof res === 'object' && Array.isArray(res)):
              res.unshift("");
              stdout = res.join('\n').replace( new RegExp( '\n', 'g' ), '\n- ' );
              break;
            case (typeof res === 'object' && !Array.isArray(res)):
              stdout = JSON.stringify(res, null, 2);
              break;
            default:
              return res;
          }
          return stdout;
        }
      }
      return "Command not found: type help for list of commands.";
    },
    exitHandler: function () {
      this.sendSTDOUT('Bye bye!', true);
      setTimeout(function () {
        location.reload();
      },1000)
    },
    clearHandler: function () {
      this.terminal_container.innerHTML = '';
      this.init( this.terminal_container ) ;
    },
    consoleTypingHandler: function (e) {
      var input = this;
      var size = input.size;
      var value = input.value;
      var key = e.which || e.keyCode;
      if (key === 13){
        Terminal.getSTDIN(input.value);
        return;
      }
      if( key >= 32 && key <= 126 ){
        input.size = value.length + 2;
      }
      if( key === 8){
        input.size = value.length ? value.length : 1;
      }
    },
  };
  window.Terminal = Terminal;
})(window, window.document)

},{"./commands":2}]},{},[4]);
