(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Command Class
 * @param name [String], fn [Function]
 *
 * don't pass arrow function if you want to use this inside your command function to access various shared shell object
 */
var Command = function () {
  function Command() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        name = _ref.name,
        fn = _ref.fn,
        _ref$type = _ref.type,
        type = _ref$type === undefined ? 'usr' : _ref$type,
        _ref$shell = _ref.shell,
        shell = _ref$shell === undefined ? undefined : _ref$shell,
        _ref$man = _ref.man,
        man = _ref$man === undefined ? '' : _ref$man;

    _classCallCheck(this, Command);

    if (typeof name !== 'string') throw Error('Command name must be a string');
    if (typeof fn !== 'function') throw Error('Command function must be... a function');

    /**
     * use whole function instead of arrow if you want to access
     * circular reference of Command
     */
    this.fn = fn.bind(this);
    this.name = name;
    this.type = type;
    this.man = man;

    if (shell) {
      this.shell = shell;
    }
  }

  /**
   * Dispatch Command Execution
   *
   * @tip don't use arrow function in you command if you want the arguments
   * neither super and arguments get binded in AF.
   */


  _createClass(Command, [{
    key: 'exec',
    value: function exec() {
      var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      if (!Array.isArray(args)) throw Error('Command exec args must be in an array');
      if (args.length) return this.fn(args);
      return this.fn();
    }
  }]);

  return Command;
}();

module.exports = Command;

},{}],2:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @class Single File Class
 * Simulate file properties
 */
var File = function () {
  function File() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$name = _ref.name,
        name = _ref$name === undefined ? '' : _ref$name,
        _ref$type = _ref.type,
        type = _ref$type === undefined ? 'file' : _ref$type,
        _ref$content = _ref.content,
        content = _ref$content === undefined ? '' : _ref$content;

    _classCallCheck(this, File);

    this.uid = this.genUid();
    this.name = name;
    this.type = type;
    this.content = content;
    this.user = 'root';
    this.group = 'root';

    if (this.type === 'file') {
      this.permission = 'rwxr--r--';
    } else {
      this.permission = 'drwxr-xr-x';
    }
  }

  _createClass(File, [{
    key: 'genUid',
    value: function genUid() {
      function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
      }
      return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    }
  }]);

  return File;
}();

module.exports = File;

},{}],3:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DEFAULT_FS = require('../configs/default-filesystem');
var File = require('./File');

/**
 * @class Virtual Filesystem
 * Represented as an object of nodes
 */

var Filesystem = function () {
  function Filesystem() {
    var fs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : DEFAULT_FS;
    var shell = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Filesystem);

    this.shell = shell;
    if ((typeof fs === 'undefined' ? 'undefined' : _typeof(fs)) !== 'object' || Array.isArray(fs)) throw new Error('Virtual Filesystem provided not valid, initialization failed.');

    // Not By Reference.
    // HACK: Object assign refuse to work as intended.
    fs = JSON.parse(JSON.stringify(fs));
    this.FileSystem = this.initFs(fs);

    // CWD for commands usage
    this.cwd = ['/'];
  }

  /**
   * Init & Pass Control to recurrsive function
   * @return new Filesystem as nodes of multiple @class File
   */


  _createClass(Filesystem, [{
    key: 'initFs',
    value: function initFs(fs) {
      this.buildVirtualFs(fs);
      return fs;
    }

    /**
     * Traverse all node and build a virtual representation of a filesystem
     * Each node is a File instance.
     * @param Mocked Filesystem as Object
     *
     */

  }, {
    key: 'buildVirtualFs',
    value: function buildVirtualFs(obj) {
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (_typeof(obj[key]) === 'object' && !Array.isArray(obj[key])) {
            obj[key] = new File({ name: key, content: obj[key], type: 'dir' });
            this.buildVirtualFs(obj[key].content);
          } else {
            obj[key] = new File({ name: key, content: obj[key] });
          }
        }
      }
    }

    /**
     * Get a stringed path and return as array
     * throw error if path format is invalid
     * Relative Path gets converted using Current Working Directory
     * @param path {String}
     * @return Array
     */

  }, {
    key: 'pathStringToArray',
    value: function pathStringToArray() {
      var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

      if (!path.length) throw new Error('Path cannot be empty');

      // Check for invalid path, eg. two+ // in a row
      if (path.match(/\/{2,}/g)) throw new Error('-invalid path: ' + path);

      // Format and Composer array
      var pathArray = path.split('/');
      if (pathArray[0] === '') pathArray[0] = '/';
      if (pathArray[0] === '.') pathArray.shift();
      if (pathArray[pathArray.length - 1] === '') pathArray.pop();
      // handle relative path with current working directory
      if (pathArray[0] !== '/') {
        pathArray = this.cwd.concat(pathArray);
      }
      return pathArray;
    }

    /**
     * Path from array to String
     * For presentational purpose.
     * TODO
     * @param path [Array]
     * @return {String}
     */

  }, {
    key: 'pathArrayToString',
    value: function pathArrayToString() {
      var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      if (!Array.isArray(path)) throw new Error('-fatal filesystem: path must be an array');
      if (!path.length) throw new Error('-invalid filesystem: path not provided');
      var output = path.join('/');
      // remove / multiple occurrence
      return output.replace(/\/{2,}/g, '/');
    }

    /**
     * Luke.. fileWalker
     * Accepts only Absolute Path, you must convert paths before calling using pathStringToArray
     * @param cb executed on each file found
     * @param fs [Shell Virtual Filesystem]
     */

  }, {
    key: 'fileWalker',
    value: function fileWalker() {
      var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : ['/'];
      var fs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.FileSystem;

      if (!Array.isArray(path)) throw new Error('Path must be an array of nodes, use Filesystem.pathStringToArray({string})');

      // avoid modifying external path reference
      path = path.slice(0);

      // TODO:
      //  Choose:
      //    - Go full pure
      //    - Work on the reference of the actual node
      // fs = Object.assign(fs, {})

      // Exit Condition
      if (!path.length) return fs;

      // Get current node
      var node = path.shift();

      // Go deeper if it's not the root dir
      if (node !== '/') {
        // check if node exist
        if (fs[node]) {
          // return file or folder
          fs = fs[node].type === 'dir' ? fs[node].content : fs[node];
        } else {
          throw new Error('File doesn\'t exist');
        }
      }
      return this.fileWalker(path, fs);
    }

    /**
     * traverseFiles
     * accessing all file at least once
     * calling provided callback on each
     * @param cb executed on each file found
     * @param fs [Shell Virtual Filesystem]
     */

  }, {
    key: 'traverseFiles',
    value: function traverseFiles() {
      var cb = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};
      var fs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.FileSystem;

      var self = this.traverseFiles;
      for (var node in fs) {
        if (fs.hasOwnProperty(node)) {
          if (fs[node].type === 'dir') this.traverseFiles(cb, fs[node].content);else cb(fs[node]);
        }
      }
    }

    /**
     * traverseDirs
     * accessing all directory at least once
     * calling provided callback on each
     * @param cb executed on each file found
     * @param fs [Shell Virtual Filesystem]
     */

  }, {
    key: 'traverseDirs',
    value: function traverseDirs() {
      var cb = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};
      var fs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.FileSystem;

      for (var node in fs) {
        if (fs.hasOwnProperty(node)) {
          if (fs[node].type === 'dir') {
            cb(fs[node]);
            this.traverseDirs(cb, fs[node].content);
          }
        }
      }
    }

    /**
     * Get Directory Node
     * Passed as Reference or Instance,
     * depend by a line in @method fileWalker, see comment there.
     * @return Directory Node Object
     */

  }, {
    key: 'getNode',
    value: function getNode() {
      var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
      var fileType = arguments[1];

      if (typeof path !== 'string') throw new Error('Invalid input.');
      var pathArray = void 0,
          node = void 0;

      try {
        pathArray = this.pathStringToArray(path);
        node = this.fileWalker(pathArray);
      } catch (e) {
        throw e;
      }

      /**
       * ERROR HANDLING
       */

      // Handle List on a file
      if (fileType === 'dir' && node.type === 'file') {
        throw new Error('Its a file not a directory');
      }
      // Handle readfile on a dir
      if (fileType === 'file' && node.type === 'dir') {
        throw new Error('Its a directory not a file');
      }
      // handle readfile on non existing file
      if (fileType === 'file' && !node.type) {
        throw new Error('Invalid file path');
      }
      // handle invalid / nonexisting path
      if (!node) {
        throw new Error('Invalid path, file/folder doesn\'t exist');
      }

      return { path: path, pathArray: pathArray, node: node };
    }

    /**
     * Change Current Working Directory Gracefully
     * @return Message String.
     */

  }, {
    key: 'changeDir',
    value: function changeDir() {
      var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

      var result = void 0;
      try {
        result = this.getNode(path, 'dir');
      } catch (err) {
        throw err;
      }
      this.cwd = result.pathArray;
      return 'changed directory.';
    }

    /**
     * List Current Working Directory Files
     * @return {}
     */

  }, {
    key: 'listDir',
    value: function listDir() {
      var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

      var result = void 0;
      try {
        result = this.getNode(path, 'dir');
      } catch (err) {
        throw err;
      }
      return result.node;
    }
  }, {
    key: 'readFile',
    value: function readFile() {
      var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

      var result = void 0;
      try {
        result = this.getNode(path, 'file');
      } catch (err) {
        throw err;
      }
      return result.node;
    }
  }, {
    key: 'getCurrentDirectory',
    value: function getCurrentDirectory() {
      var cwdAsString = void 0;
      try {
        cwdAsString = this.pathArrayToString(this.cwd);
      } catch (e) {
        return '-invalid filesystem: An error occured while parsing current working directory to string.';
      }
      return cwdAsString;
    }
  }]);

  return Filesystem;
}();

module.exports = Filesystem;

},{"../configs/default-filesystem":7,"./File":2}],4:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Command = require('./Command');

/**
 *
 * Interpreter
 * Is the parent Class of the Main Shell Class
 * - This class is the one that parse and run exec of command
 * - Parsing of builtin command on runtime happen here
 * - Will parse custom user Command too
 *
 */

var Interpreter = function () {
  function Interpreter() {
    _classCallCheck(this, Interpreter);
  }

  _createClass(Interpreter, [{
    key: 'parse',


    /**
     * Parse Command
     * String is splitted by spaces
     * @return Array of args as in C
     * ---
     *   IDEA: Regexp every word is an argument, to proide something else you must enclose
     *   it in single or double quotes.
     *   To pass a json use single quotes since the json starndard requires double quotes in it
     *   @return cmd.match(/[^\s"']+|"([^"]*)"|'([^']*)'/g)
     * ---
     */
    value: function parse(cmd) {
      if (typeof cmd !== 'string') throw new Error('Command must be a string');
      if (!cmd.length) throw new Error('Command is empty');
      return cmd.split(' ');
    }

    /**
     * Format Output
     * return error if function is returned
     * convert everything else to json.
     * @return JSON parsed
     */

  }, {
    key: 'format',
    value: function format(output) {
      if (typeof output === 'function') {
        return '-invalid command: Command returned invalid data type.';
      }
      if (output === undefined || typeof output === 'undefined') {
        return '-invalid command: Command returned no data.';
      }
      return output;
      // try {
      //   return JSON.stringify(output)
      // } catch (e) {
      //   return '-invalid command: Command returned invalid data type: ' + e.message
      // }
    }

    /**
     * Exec Command
     * @return {String}
     */

  }, {
    key: 'exec',
    value: function exec(cmd) {

      //  Parse Command String: [0] = command name, [1+] = arguments
      var parsed = void 0;
      try {
        parsed = this.parse(cmd);
      } catch (e) {
        return '-fatal command: ' + e.message || 'Some Error Occured';
      }

      //  X-check if command exist
      var command = this.ShellCommands[parsed[0]];
      if (!command) {
        return '-error shell: Command <' + parsed[0] + '> doesn\'t exist.\n';
      }

      //  get arguments array and execute command return error if throw
      var args = parsed.filter(function (e, i) {
        return i > 0;
      });
      var output = void 0;
      try {
        output = command.exec(args);
      } catch (e) {
        return '-fatal command: ' + e.message;
      }

      //  Format data and Return
      return this.format(output);
    }

    /*
     * Generate Builtin Command List
     */

  }, {
    key: 'registerCommands',
    value: function registerCommands(ShellReference) {
      var customCommands = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;

      var Blueprints = require('../configs/builtin-commands');
      /**
       * If custom commands are passed check for valid type
       * If good to go generate those commands
       */
      if (customCommands) {
        if ((typeof customCommands === 'undefined' ? 'undefined' : _typeof(customCommands)) === 'object' && !Array.isArray(customCommands)) {
          Blueprints = customCommands;
        } else {
          throw new Error('Custom command provided are not in a valid format.');
        }
      }

      var ShellCommands = {};
      Object.keys(Blueprints).map(function (key) {
        var cmd = Blueprints[key];
        if (typeof cmd.name === 'string' && typeof cmd.fn === 'function') {
          cmd.shell = ShellReference;
          ShellCommands[key] = new Command(cmd);
        }
      });
      return ShellCommands;
    }
  }]);

  return Interpreter;
}();

module.exports = Interpreter;

},{"../configs/builtin-commands":6,"./Command":1}],5:[function(require,module,exports){
(function (global){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Interpreter = require('./Interpreter');
var Filesystem = require('./Filesystem');

/**
 * Shell Class inherits from Interpreter
 * Options:
 *  - filesystem {Object}
 *  - commands {Object}
 *  - user {String}
 *  - hostname {String}
 */

var Shell = function (_Interpreter) {
  _inherits(Shell, _Interpreter);

  function Shell() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$filesystem = _ref.filesystem,
        filesystem = _ref$filesystem === undefined ? undefined : _ref$filesystem,
        _ref$commands = _ref.commands,
        commands = _ref$commands === undefined ? undefined : _ref$commands,
        _ref$user = _ref.user,
        user = _ref$user === undefined ? 'root' : _ref$user,
        _ref$hostname = _ref.hostname,
        hostname = _ref$hostname === undefined ? 'my.host.me' : _ref$hostname;

    _classCallCheck(this, Shell);

    var _this = _possibleConstructorReturn(this, (Shell.__proto__ || Object.getPrototypeOf(Shell)).call(this));

    _this.polyfills();

    /**
     * Create the virtual filesystem
     * @return reference to instance of @class Filesystem
     */
    _this.fs = new Filesystem(filesystem, _this);
    _this.user = user;
    _this.hostname = hostname;

    // Init builtin commands, @method in parent
    // pass shell reference
    _this.ShellCommands = _this.registerCommands(_this);
    _this.ShellCommands = _extends({}, _this.ShellCommands, _this.registerCommands(_this, commands));
    return _this;
  }

  _createClass(Shell, [{
    key: 'polyfills',
    value: function polyfills() {
      if (!global.Promise) {
        global.Promise = require('promise-polyfill').Promise;
      }
      if (!global.fetch) {
        global.fetch = require('whatwg-fetch');
      }
      return true;
    }

    /**
     * Pass control to Interpreter
     * @return [String] OR {Promise} to resolve from your wrapper.
     */

  }, {
    key: 'run',
    value: function run(cmd) {
      return this.exec(cmd);
    }
  }]);

  return Shell;
}(Interpreter);

Object.defineProperty(Shell.prototype, 'fs', { writable: true, enumerable: false });
Object.defineProperty(Shell.prototype, 'ShellCommands', { writable: true, enumerable: false });

module.exports = Shell;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./Filesystem":3,"./Interpreter":4,"promise-polyfill":9,"whatwg-fetch":10}],6:[function(require,module,exports){
'use strict';

var _require = require('../../package.json'),
    name = _require.name,
    version = _require.version,
    description = _require.description,
    repository = _require.repository,
    author = _require.author,
    license = _require.license;

module.exports = {

  /**
   * Help
   * @return List of commands
   */
  help: {
    name: 'help',
    type: 'builtin',
    man: 'List of available commands',
    fn: function help() {
      return 'Commands available: ' + Object.keys(this.shell.ShellCommands).join(', ');
    }
  },

  whoami: {
    name: 'whoami',
    type: 'builtin',
    man: 'Current user',
    fn: function whoami() {
      return this.shell.user;
    }
  },

  about: {
    name: 'about',
    type: 'builtin',
    man: 'About this project',
    fn: function about() {
      var str = '';
      str += 'name: ' + name + '\n';
      str += 'version: ' + version + '\n';
      str += 'description: ' + description + '\n';
      str += 'repository: ' + repository + '\n';
      str += 'author: ' + author + '\n';
      str += 'license: ' + license + '\n';
      return str;
    }
  },

  /**
   * Return passed arguments, for testing purposes
   */
  arguments: {
    name: 'arguments',
    type: 'builtin',
    man: 'Return argument passed, used for testing purpose',
    fn: function fn(args) {
      return args;
    }
  },

  /**
   * Change Directory
   * @return Success/Fail Message String
   */
  cd: {
    name: 'cd',
    type: 'builtin',
    man: 'Change directory, pass absolute or relative path: eg. cd /etc, cd / cd/my/nested/dir',
    fn: function cd(path) {
      if (!path) throw new Error('-invalid No path provided.');
      path = path.join();
      try {
        return this.shell.fs.changeDir(path);
      } catch (e) {
        throw e;
      }
    }
  },

  /**
   * ls Command
   * List directory files
   * @param array of args
   * @return formatted String
   */
  ls: {
    name: 'ls',
    type: 'builtin',
    man: 'list directory files, pass absolute/relative path, if empty list current directory',
    fn: function ls() {
      var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : ['./'];

      path = path.join();
      var list = void 0,
          responseString = '';
      try {
        list = this.shell.fs.listDir(path);
      } catch (e) {
        throw e;
      }
      for (var file in list) {
        if (list.hasOwnProperty(file)) {
          responseString += list[file].permission + '\t' + list[file].user + ' ' + list[file].group + '\t' + list[file].name + '\n';
        }
      }
      return responseString;
    }
  },

  /**
   * CAT Command
   * Read File
   * @return formatted String
   */
  cat: {
    name: 'cat',
    type: 'builtin',
    man: 'Return file content, take one argument: file path (relative/absolute)',
    fn: function fn() {
      var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : ['./'];

      path = path.join();
      var file = void 0,
          responseString = '';
      try {
        file = this.shell.fs.readFile(path);
      } catch (e) {
        throw e;
      }
      return file.content;
    }
  },

  /**
   * Man
   * Return command manual info
   * @return {string}
   */
  man: {
    name: 'man',
    type: 'builtin',
    man: 'Command manual, takes one argument, command name',
    fn: function man(args) {
      if (!args || !args[0]) throw new Error('man: no command provided.');
      var command = args[0];
      if (!this.shell.ShellCommands[command]) throw new Error('command doesn\'t exist.');
      if (!this.shell.ShellCommands[command].man) throw new Error('no manual entry for this command.');
      return this.shell.ShellCommands[command].man;
    }
  },

  /**
   * HTTP
   * Return Data from an HTTP request
   * FIXME: NEED FIXS FOR FORM DATA WITH SPACES
   * @return {string}
   */
  http: {
    name: 'http',
    type: 'builtin',
    man: 'Send http requests.\n syntax: http METHOD [property:data,] URL.\neg: http GET http://jsonplaceholder.typicode.com/\nhttp POST title:MyTitle http://jsonplaceholder.typicode.com/posts',
    fn: function http() {
      var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      if (!args || !args.length || args.length < 2) throw new Error('http: no parameters provided, provide URL and/or method \n help: ' + this.shell.ShellCommands['http'].man);

      // Get Method and URL
      var method = void 0,
          url = void 0;
      method = args[0].toUpperCase();
      url = args[args.length - 1];

      /*
       * Build Payload
       * If args > 2 there are values in beetween method and url
       * format prop:value
       * FIXME Space not allowed, must change how commands arguments are parsed
       */
      var payload = {};
      if (args.length > 2) {
        args.map(function (e, i, array) {
          if (i != 0 && i !== args.length - 1) {
            var parse = e.split(':');
            payload[parse[0]] = parse[1];
          }
        });
      }
      var request = {
        method: method,
        headers: { "Content-Type": "application/json" }
      };
      if (method !== 'GET') request.body = JSON.stringify(payload);
      return fetch(url, request).then(function (res) {
        if (res.ok) return res.json();
        throw new Error('Request Failed (' + (res.status || 500) + '): ' + (res.statusText || 'Some Error Occured.'));
      }).catch(function (err) {
        console.log(err);
      });
    }
  }

};

},{"../../package.json":11}],7:[function(require,module,exports){
'use strict';

module.exports = {

  'file.h': '#include <nope.h>',

  etc: {
    apache2: {
      'apache2.conf': 'Not What you were looking for :)'
    }
  },

  home: {
    guest: {
      docs: {
        'mydoc.md': 'TestFile',
        'mydoc2.md': 'TestFile2',
        'mydoc3.md': 'TestFile3'
      }
    }
  },

  root: {
    '.zshrc': 'not even close :)',
    '.oh-my-zsh': {
      themes: {}
    }
  }
};

},{}],8:[function(require,module,exports){
(function (global){
'use strict';

/**
 * Shell Only
 * @type {Class}
 * Init the shell with command and filesystem
 * @method execute() exposed to query the Shell with commands
 */
global['Termly'] = require('./classes/Shell');

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./classes/Shell":5}],9:[function(require,module,exports){
(function (root) {

  // Store setTimeout reference so promise-polyfill will be unaffected by
  // other code modifying setTimeout (like sinon.useFakeTimers())
  var setTimeoutFunc = setTimeout;

  function noop() {}
  
  // Polyfill for Function.prototype.bind
  function bind(fn, thisArg) {
    return function () {
      fn.apply(thisArg, arguments);
    };
  }

  function Promise(fn) {
    if (typeof this !== 'object') throw new TypeError('Promises must be constructed via new');
    if (typeof fn !== 'function') throw new TypeError('not a function');
    this._state = 0;
    this._handled = false;
    this._value = undefined;
    this._deferreds = [];

    doResolve(fn, this);
  }

  function handle(self, deferred) {
    while (self._state === 3) {
      self = self._value;
    }
    if (self._state === 0) {
      self._deferreds.push(deferred);
      return;
    }
    self._handled = true;
    Promise._immediateFn(function () {
      var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected;
      if (cb === null) {
        (self._state === 1 ? resolve : reject)(deferred.promise, self._value);
        return;
      }
      var ret;
      try {
        ret = cb(self._value);
      } catch (e) {
        reject(deferred.promise, e);
        return;
      }
      resolve(deferred.promise, ret);
    });
  }

  function resolve(self, newValue) {
    try {
      // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
      if (newValue === self) throw new TypeError('A promise cannot be resolved with itself.');
      if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
        var then = newValue.then;
        if (newValue instanceof Promise) {
          self._state = 3;
          self._value = newValue;
          finale(self);
          return;
        } else if (typeof then === 'function') {
          doResolve(bind(then, newValue), self);
          return;
        }
      }
      self._state = 1;
      self._value = newValue;
      finale(self);
    } catch (e) {
      reject(self, e);
    }
  }

  function reject(self, newValue) {
    self._state = 2;
    self._value = newValue;
    finale(self);
  }

  function finale(self) {
    if (self._state === 2 && self._deferreds.length === 0) {
      Promise._immediateFn(function() {
        if (!self._handled) {
          Promise._unhandledRejectionFn(self._value);
        }
      });
    }

    for (var i = 0, len = self._deferreds.length; i < len; i++) {
      handle(self, self._deferreds[i]);
    }
    self._deferreds = null;
  }

  function Handler(onFulfilled, onRejected, promise) {
    this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
    this.onRejected = typeof onRejected === 'function' ? onRejected : null;
    this.promise = promise;
  }

  /**
   * Take a potentially misbehaving resolver function and make sure
   * onFulfilled and onRejected are only called once.
   *
   * Makes no guarantees about asynchrony.
   */
  function doResolve(fn, self) {
    var done = false;
    try {
      fn(function (value) {
        if (done) return;
        done = true;
        resolve(self, value);
      }, function (reason) {
        if (done) return;
        done = true;
        reject(self, reason);
      });
    } catch (ex) {
      if (done) return;
      done = true;
      reject(self, ex);
    }
  }

  Promise.prototype['catch'] = function (onRejected) {
    return this.then(null, onRejected);
  };

  Promise.prototype.then = function (onFulfilled, onRejected) {
    var prom = new (this.constructor)(noop);

    handle(this, new Handler(onFulfilled, onRejected, prom));
    return prom;
  };

  Promise.all = function (arr) {
    var args = Array.prototype.slice.call(arr);

    return new Promise(function (resolve, reject) {
      if (args.length === 0) return resolve([]);
      var remaining = args.length;

      function res(i, val) {
        try {
          if (val && (typeof val === 'object' || typeof val === 'function')) {
            var then = val.then;
            if (typeof then === 'function') {
              then.call(val, function (val) {
                res(i, val);
              }, reject);
              return;
            }
          }
          args[i] = val;
          if (--remaining === 0) {
            resolve(args);
          }
        } catch (ex) {
          reject(ex);
        }
      }

      for (var i = 0; i < args.length; i++) {
        res(i, args[i]);
      }
    });
  };

  Promise.resolve = function (value) {
    if (value && typeof value === 'object' && value.constructor === Promise) {
      return value;
    }

    return new Promise(function (resolve) {
      resolve(value);
    });
  };

  Promise.reject = function (value) {
    return new Promise(function (resolve, reject) {
      reject(value);
    });
  };

  Promise.race = function (values) {
    return new Promise(function (resolve, reject) {
      for (var i = 0, len = values.length; i < len; i++) {
        values[i].then(resolve, reject);
      }
    });
  };

  // Use polyfill for setImmediate for performance gains
  Promise._immediateFn = (typeof setImmediate === 'function' && function (fn) { setImmediate(fn); }) ||
    function (fn) {
      setTimeoutFunc(fn, 0);
    };

  Promise._unhandledRejectionFn = function _unhandledRejectionFn(err) {
    if (typeof console !== 'undefined' && console) {
      console.warn('Possible Unhandled Promise Rejection:', err); // eslint-disable-line no-console
    }
  };

  /**
   * Set the immediate function to execute callbacks
   * @param fn {function} Function to execute
   * @deprecated
   */
  Promise._setImmediateFn = function _setImmediateFn(fn) {
    Promise._immediateFn = fn;
  };

  /**
   * Change the function to execute on unhandled rejection
   * @param {function} fn Function to execute on unhandled rejection
   * @deprecated
   */
  Promise._setUnhandledRejectionFn = function _setUnhandledRejectionFn(fn) {
    Promise._unhandledRejectionFn = fn;
  };
  
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Promise;
  } else if (!root.Promise) {
    root.Promise = Promise;
  }

})(this);

},{}],10:[function(require,module,exports){
(function(self) {
  'use strict';

  if (self.fetch) {
    return
  }

  var support = {
    searchParams: 'URLSearchParams' in self,
    iterable: 'Symbol' in self && 'iterator' in Symbol,
    blob: 'FileReader' in self && 'Blob' in self && (function() {
      try {
        new Blob()
        return true
      } catch(e) {
        return false
      }
    })(),
    formData: 'FormData' in self,
    arrayBuffer: 'ArrayBuffer' in self
  }

  if (support.arrayBuffer) {
    var viewClasses = [
      '[object Int8Array]',
      '[object Uint8Array]',
      '[object Uint8ClampedArray]',
      '[object Int16Array]',
      '[object Uint16Array]',
      '[object Int32Array]',
      '[object Uint32Array]',
      '[object Float32Array]',
      '[object Float64Array]'
    ]

    var isDataView = function(obj) {
      return obj && DataView.prototype.isPrototypeOf(obj)
    }

    var isArrayBufferView = ArrayBuffer.isView || function(obj) {
      return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1
    }
  }

  function normalizeName(name) {
    if (typeof name !== 'string') {
      name = String(name)
    }
    if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
      throw new TypeError('Invalid character in header field name')
    }
    return name.toLowerCase()
  }

  function normalizeValue(value) {
    if (typeof value !== 'string') {
      value = String(value)
    }
    return value
  }

  // Build a destructive iterator for the value list
  function iteratorFor(items) {
    var iterator = {
      next: function() {
        var value = items.shift()
        return {done: value === undefined, value: value}
      }
    }

    if (support.iterable) {
      iterator[Symbol.iterator] = function() {
        return iterator
      }
    }

    return iterator
  }

  function Headers(headers) {
    this.map = {}

    if (headers instanceof Headers) {
      headers.forEach(function(value, name) {
        this.append(name, value)
      }, this)

    } else if (headers) {
      Object.getOwnPropertyNames(headers).forEach(function(name) {
        this.append(name, headers[name])
      }, this)
    }
  }

  Headers.prototype.append = function(name, value) {
    name = normalizeName(name)
    value = normalizeValue(value)
    var oldValue = this.map[name]
    this.map[name] = oldValue ? oldValue+','+value : value
  }

  Headers.prototype['delete'] = function(name) {
    delete this.map[normalizeName(name)]
  }

  Headers.prototype.get = function(name) {
    name = normalizeName(name)
    return this.has(name) ? this.map[name] : null
  }

  Headers.prototype.has = function(name) {
    return this.map.hasOwnProperty(normalizeName(name))
  }

  Headers.prototype.set = function(name, value) {
    this.map[normalizeName(name)] = normalizeValue(value)
  }

  Headers.prototype.forEach = function(callback, thisArg) {
    for (var name in this.map) {
      if (this.map.hasOwnProperty(name)) {
        callback.call(thisArg, this.map[name], name, this)
      }
    }
  }

  Headers.prototype.keys = function() {
    var items = []
    this.forEach(function(value, name) { items.push(name) })
    return iteratorFor(items)
  }

  Headers.prototype.values = function() {
    var items = []
    this.forEach(function(value) { items.push(value) })
    return iteratorFor(items)
  }

  Headers.prototype.entries = function() {
    var items = []
    this.forEach(function(value, name) { items.push([name, value]) })
    return iteratorFor(items)
  }

  if (support.iterable) {
    Headers.prototype[Symbol.iterator] = Headers.prototype.entries
  }

  function consumed(body) {
    if (body.bodyUsed) {
      return Promise.reject(new TypeError('Already read'))
    }
    body.bodyUsed = true
  }

  function fileReaderReady(reader) {
    return new Promise(function(resolve, reject) {
      reader.onload = function() {
        resolve(reader.result)
      }
      reader.onerror = function() {
        reject(reader.error)
      }
    })
  }

  function readBlobAsArrayBuffer(blob) {
    var reader = new FileReader()
    var promise = fileReaderReady(reader)
    reader.readAsArrayBuffer(blob)
    return promise
  }

  function readBlobAsText(blob) {
    var reader = new FileReader()
    var promise = fileReaderReady(reader)
    reader.readAsText(blob)
    return promise
  }

  function readArrayBufferAsText(buf) {
    var view = new Uint8Array(buf)
    var chars = new Array(view.length)

    for (var i = 0; i < view.length; i++) {
      chars[i] = String.fromCharCode(view[i])
    }
    return chars.join('')
  }

  function bufferClone(buf) {
    if (buf.slice) {
      return buf.slice(0)
    } else {
      var view = new Uint8Array(buf.byteLength)
      view.set(new Uint8Array(buf))
      return view.buffer
    }
  }

  function Body() {
    this.bodyUsed = false

    this._initBody = function(body) {
      this._bodyInit = body
      if (!body) {
        this._bodyText = ''
      } else if (typeof body === 'string') {
        this._bodyText = body
      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
        this._bodyBlob = body
      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
        this._bodyFormData = body
      } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
        this._bodyText = body.toString()
      } else if (support.arrayBuffer && support.blob && isDataView(body)) {
        this._bodyArrayBuffer = bufferClone(body.buffer)
        // IE 10-11 can't handle a DataView body.
        this._bodyInit = new Blob([this._bodyArrayBuffer])
      } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
        this._bodyArrayBuffer = bufferClone(body)
      } else {
        throw new Error('unsupported BodyInit type')
      }

      if (!this.headers.get('content-type')) {
        if (typeof body === 'string') {
          this.headers.set('content-type', 'text/plain;charset=UTF-8')
        } else if (this._bodyBlob && this._bodyBlob.type) {
          this.headers.set('content-type', this._bodyBlob.type)
        } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
          this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8')
        }
      }
    }

    if (support.blob) {
      this.blob = function() {
        var rejected = consumed(this)
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return Promise.resolve(this._bodyBlob)
        } else if (this._bodyArrayBuffer) {
          return Promise.resolve(new Blob([this._bodyArrayBuffer]))
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as blob')
        } else {
          return Promise.resolve(new Blob([this._bodyText]))
        }
      }

      this.arrayBuffer = function() {
        if (this._bodyArrayBuffer) {
          return consumed(this) || Promise.resolve(this._bodyArrayBuffer)
        } else {
          return this.blob().then(readBlobAsArrayBuffer)
        }
      }
    }

    this.text = function() {
      var rejected = consumed(this)
      if (rejected) {
        return rejected
      }

      if (this._bodyBlob) {
        return readBlobAsText(this._bodyBlob)
      } else if (this._bodyArrayBuffer) {
        return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer))
      } else if (this._bodyFormData) {
        throw new Error('could not read FormData body as text')
      } else {
        return Promise.resolve(this._bodyText)
      }
    }

    if (support.formData) {
      this.formData = function() {
        return this.text().then(decode)
      }
    }

    this.json = function() {
      return this.text().then(JSON.parse)
    }

    return this
  }

  // HTTP methods whose capitalization should be normalized
  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT']

  function normalizeMethod(method) {
    var upcased = method.toUpperCase()
    return (methods.indexOf(upcased) > -1) ? upcased : method
  }

  function Request(input, options) {
    options = options || {}
    var body = options.body

    if (input instanceof Request) {
      if (input.bodyUsed) {
        throw new TypeError('Already read')
      }
      this.url = input.url
      this.credentials = input.credentials
      if (!options.headers) {
        this.headers = new Headers(input.headers)
      }
      this.method = input.method
      this.mode = input.mode
      if (!body && input._bodyInit != null) {
        body = input._bodyInit
        input.bodyUsed = true
      }
    } else {
      this.url = String(input)
    }

    this.credentials = options.credentials || this.credentials || 'omit'
    if (options.headers || !this.headers) {
      this.headers = new Headers(options.headers)
    }
    this.method = normalizeMethod(options.method || this.method || 'GET')
    this.mode = options.mode || this.mode || null
    this.referrer = null

    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
      throw new TypeError('Body not allowed for GET or HEAD requests')
    }
    this._initBody(body)
  }

  Request.prototype.clone = function() {
    return new Request(this, { body: this._bodyInit })
  }

  function decode(body) {
    var form = new FormData()
    body.trim().split('&').forEach(function(bytes) {
      if (bytes) {
        var split = bytes.split('=')
        var name = split.shift().replace(/\+/g, ' ')
        var value = split.join('=').replace(/\+/g, ' ')
        form.append(decodeURIComponent(name), decodeURIComponent(value))
      }
    })
    return form
  }

  function parseHeaders(rawHeaders) {
    var headers = new Headers()
    rawHeaders.split(/\r?\n/).forEach(function(line) {
      var parts = line.split(':')
      var key = parts.shift().trim()
      if (key) {
        var value = parts.join(':').trim()
        headers.append(key, value)
      }
    })
    return headers
  }

  Body.call(Request.prototype)

  function Response(bodyInit, options) {
    if (!options) {
      options = {}
    }

    this.type = 'default'
    this.status = 'status' in options ? options.status : 200
    this.ok = this.status >= 200 && this.status < 300
    this.statusText = 'statusText' in options ? options.statusText : 'OK'
    this.headers = new Headers(options.headers)
    this.url = options.url || ''
    this._initBody(bodyInit)
  }

  Body.call(Response.prototype)

  Response.prototype.clone = function() {
    return new Response(this._bodyInit, {
      status: this.status,
      statusText: this.statusText,
      headers: new Headers(this.headers),
      url: this.url
    })
  }

  Response.error = function() {
    var response = new Response(null, {status: 0, statusText: ''})
    response.type = 'error'
    return response
  }

  var redirectStatuses = [301, 302, 303, 307, 308]

  Response.redirect = function(url, status) {
    if (redirectStatuses.indexOf(status) === -1) {
      throw new RangeError('Invalid status code')
    }

    return new Response(null, {status: status, headers: {location: url}})
  }

  self.Headers = Headers
  self.Request = Request
  self.Response = Response

  self.fetch = function(input, init) {
    return new Promise(function(resolve, reject) {
      var request = new Request(input, init)
      var xhr = new XMLHttpRequest()

      xhr.onload = function() {
        var options = {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: parseHeaders(xhr.getAllResponseHeaders() || '')
        }
        options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL')
        var body = 'response' in xhr ? xhr.response : xhr.responseText
        resolve(new Response(body, options))
      }

      xhr.onerror = function() {
        reject(new TypeError('Network request failed'))
      }

      xhr.ontimeout = function() {
        reject(new TypeError('Network request failed'))
      }

      xhr.open(request.method, request.url, true)

      if (request.credentials === 'include') {
        xhr.withCredentials = true
      }

      if ('responseType' in xhr && support.blob) {
        xhr.responseType = 'blob'
      }

      request.headers.forEach(function(value, name) {
        xhr.setRequestHeader(name, value)
      })

      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit)
    })
  }
  self.fetch.polyfill = true
})(typeof self !== 'undefined' ? self : this);

},{}],11:[function(require,module,exports){
module.exports={
  "name": "termly.js",
  "version": "2.0.0",
  "description": "Simple, Extensible, Lightweight Javascript Browser Terminal Simulator!",
  "main": "dist/termly.min.js",
  "scripts": {
    "test": "mocha --compilers babel-core/register tests/",
    "build": "gulp"
  },
  "keywords": [
    "terminal",
    "javascript",
    "simulator",
    "browser",
    "presentation",
    "mockup",
    "demo",
    "cli",
    "prompt",
    "commands",
    "no depency",
    "lightweight",
    "js",
    "vanilla"
  ],
  "repository": "https://github.com/Kirkhammetz/termly.js",
  "author": "Simone Corsi",
  "license": "ISC",
  "devDependencies": {
    "babel": "^6.5.2",
    "babel-core": "^6.21.0",
    "babel-polyfill": "^6.22.0",
    "babel-preset-es2015": "^6.18.0",
    "babel-preset-stage-3": "^6.17.0",
    "babelify": "^7.3.0",
    "browserify": "^13.3.0",
    "chai": "^3.5.0",
    "chalk": "^1.1.3",
    "gulp": "^3.9.1",
    "gulp-rename": "^1.2.2",
    "gulp-sourcemaps": "^2.4.0",
    "gulp-uglify": "^2.0.0",
    "gulp-util": "^3.0.8",
    "mocha": "^3.2.0",
    "promise-polyfill": "^6.0.2",
    "uglify-js": "^2.6.4",
    "utils-merge": "^1.0.0",
    "vinyl-buffer": "^1.0.0",
    "vinyl-source-stream": "^1.1.0",
    "watchify": "^3.8.0",
    "whatwg-fetch": "^2.0.2"
  }
}

},{}]},{},[8])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJiaW4vY2xhc3Nlcy9Db21tYW5kLmpzIiwiYmluL2NsYXNzZXMvRmlsZS5qcyIsImJpbi9jbGFzc2VzL0ZpbGVzeXN0ZW0uanMiLCJiaW4vY2xhc3Nlcy9JbnRlcnByZXRlci5qcyIsImJpbi9jbGFzc2VzL1NoZWxsLmpzIiwiYmluL2NvbmZpZ3MvYnVpbHRpbi1jb21tYW5kcy5qcyIsImJpbi9jb25maWdzL2RlZmF1bHQtZmlsZXN5c3RlbS5qcyIsImJpbi90ZXJtbHkuanMiLCJub2RlX21vZHVsZXMvcHJvbWlzZS1wb2x5ZmlsbC9wcm9taXNlLmpzIiwibm9kZV9tb2R1bGVzL3doYXR3Zy1mZXRjaC9mZXRjaC5qcyIsInBhY2thZ2UuanNvbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7OztBQ0FBOzs7Ozs7SUFNTSxPO0FBQ0oscUJBQXdFO0FBQUEsbUZBQUgsRUFBRztBQUFBLFFBQTFELElBQTBELFFBQTFELElBQTBEO0FBQUEsUUFBcEQsRUFBb0QsUUFBcEQsRUFBb0Q7QUFBQSx5QkFBaEQsSUFBZ0Q7QUFBQSxRQUFoRCxJQUFnRCw2QkFBekMsS0FBeUM7QUFBQSwwQkFBbEMsS0FBa0M7QUFBQSxRQUFsQyxLQUFrQyw4QkFBMUIsU0FBMEI7QUFBQSx3QkFBZixHQUFlO0FBQUEsUUFBZixHQUFlLDRCQUFULEVBQVM7O0FBQUE7O0FBQ3RFLFFBQUksT0FBTyxJQUFQLEtBQWdCLFFBQXBCLEVBQThCLE1BQU0sTUFBTSwrQkFBTixDQUFOO0FBQzlCLFFBQUksT0FBTyxFQUFQLEtBQWMsVUFBbEIsRUFBOEIsTUFBTSxNQUFNLHdDQUFOLENBQU47O0FBRTlCOzs7O0FBSUEsU0FBSyxFQUFMLEdBQVUsR0FBRyxJQUFILENBQVEsSUFBUixDQUFWO0FBQ0EsU0FBSyxJQUFMLEdBQVksSUFBWjtBQUNBLFNBQUssSUFBTCxHQUFZLElBQVo7QUFDQSxTQUFLLEdBQUwsR0FBVyxH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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDek9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxY0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxuICogQ29tbWFuZCBDbGFzc1xuICogQHBhcmFtIG5hbWUgW1N0cmluZ10sIGZuIFtGdW5jdGlvbl1cbiAqXG4gKiBkb24ndCBwYXNzIGFycm93IGZ1bmN0aW9uIGlmIHlvdSB3YW50IHRvIHVzZSB0aGlzIGluc2lkZSB5b3VyIGNvbW1hbmQgZnVuY3Rpb24gdG8gYWNjZXNzIHZhcmlvdXMgc2hhcmVkIHNoZWxsIG9iamVjdFxuICovXG5jbGFzcyBDb21tYW5kIHtcbiAgY29uc3RydWN0b3IoeyBuYW1lLCBmbiwgdHlwZSA9ICd1c3InLCBzaGVsbCA9IHVuZGVmaW5lZCwgbWFuID0gJyd9ID0ge30pe1xuICAgIGlmICh0eXBlb2YgbmFtZSAhPT0gJ3N0cmluZycpIHRocm93IEVycm9yKCdDb21tYW5kIG5hbWUgbXVzdCBiZSBhIHN0cmluZycpXG4gICAgaWYgKHR5cGVvZiBmbiAhPT0gJ2Z1bmN0aW9uJykgdGhyb3cgRXJyb3IoJ0NvbW1hbmQgZnVuY3Rpb24gbXVzdCBiZS4uLiBhIGZ1bmN0aW9uJylcblxuICAgIC8qKlxuICAgICAqIHVzZSB3aG9sZSBmdW5jdGlvbiBpbnN0ZWFkIG9mIGFycm93IGlmIHlvdSB3YW50IHRvIGFjY2Vzc1xuICAgICAqIGNpcmN1bGFyIHJlZmVyZW5jZSBvZiBDb21tYW5kXG4gICAgICovXG4gICAgdGhpcy5mbiA9IGZuLmJpbmQodGhpcylcbiAgICB0aGlzLm5hbWUgPSBuYW1lXG4gICAgdGhpcy50eXBlID0gdHlwZVxuICAgIHRoaXMubWFuID0gbWFuXG5cbiAgICBpZiAoc2hlbGwpIHtcbiAgICAgIHRoaXMuc2hlbGwgPSBzaGVsbFxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBEaXNwYXRjaCBDb21tYW5kIEV4ZWN1dGlvblxuICAgKlxuICAgKiBAdGlwIGRvbid0IHVzZSBhcnJvdyBmdW5jdGlvbiBpbiB5b3UgY29tbWFuZCBpZiB5b3Ugd2FudCB0aGUgYXJndW1lbnRzXG4gICAqIG5laXRoZXIgc3VwZXIgYW5kIGFyZ3VtZW50cyBnZXQgYmluZGVkIGluIEFGLlxuICAgKi9cbiAgZXhlYyhhcmdzID0gW10pIHtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoYXJncykpIHRocm93IEVycm9yKCdDb21tYW5kIGV4ZWMgYXJncyBtdXN0IGJlIGluIGFuIGFycmF5JylcbiAgICBpZiAoYXJncy5sZW5ndGgpIHJldHVybiB0aGlzLmZuKGFyZ3MpXG4gICAgcmV0dXJuIHRoaXMuZm4oKVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ29tbWFuZFxuIiwiLyoqXG4gKiBAY2xhc3MgU2luZ2xlIEZpbGUgQ2xhc3NcbiAqIFNpbXVsYXRlIGZpbGUgcHJvcGVydGllc1xuICovXG5jbGFzcyBGaWxlIHtcbiAgY29uc3RydWN0b3IoeyBuYW1lID0gJycsIHR5cGUgPSAnZmlsZScsIGNvbnRlbnQgPSAnJ30gPSB7fSkge1xuICAgIHRoaXMudWlkID0gdGhpcy5nZW5VaWQoKVxuICAgIHRoaXMubmFtZSA9IG5hbWVcbiAgICB0aGlzLnR5cGUgPSB0eXBlXG4gICAgdGhpcy5jb250ZW50ID0gY29udGVudFxuICAgIHRoaXMudXNlciA9ICdyb290J1xuICAgIHRoaXMuZ3JvdXAgPSAncm9vdCdcblxuICAgIGlmICh0aGlzLnR5cGUgPT09ICdmaWxlJykge1xuICAgICAgdGhpcy5wZXJtaXNzaW9uID0gJ3J3eHItLXItLSdcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5wZXJtaXNzaW9uID0gJ2Ryd3hyLXhyLXgnXG4gICAgfVxuXG4gIH1cblxuICBnZW5VaWQoKSB7XG4gICAgZnVuY3Rpb24gczQoKSB7XG4gICAgICByZXR1cm4gTWF0aC5mbG9vcigoMSArIE1hdGgucmFuZG9tKCkpICogMHgxMDAwMClcbiAgICAgICAgLnRvU3RyaW5nKDE2KVxuICAgICAgICAuc3Vic3RyaW5nKDEpO1xuICAgIH1cbiAgICByZXR1cm4gczQoKSArIHM0KCkgKyAnLScgKyBzNCgpICsgJy0nICsgczQoKSArICctJyArXG4gICAgICBzNCgpICsgJy0nICsgczQoKSArIHM0KCkgKyBzNCgpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRmlsZVxuIiwiY29uc3QgREVGQVVMVF9GUyA9IHJlcXVpcmUoJy4uL2NvbmZpZ3MvZGVmYXVsdC1maWxlc3lzdGVtJylcbmNvbnN0IEZpbGUgPSByZXF1aXJlKCcuL0ZpbGUnKVxuXG4vKipcbiAqIEBjbGFzcyBWaXJ0dWFsIEZpbGVzeXN0ZW1cbiAqIFJlcHJlc2VudGVkIGFzIGFuIG9iamVjdCBvZiBub2Rlc1xuICovXG5jbGFzcyBGaWxlc3lzdGVtIHtcbiAgY29uc3RydWN0b3IoZnMgPSBERUZBVUxUX0ZTLCBzaGVsbCA9IHt9KSB7XG4gICAgdGhpcy5zaGVsbCA9IHNoZWxsXG4gICAgaWYgKHR5cGVvZiBmcyAhPT0gJ29iamVjdCcgfHwgQXJyYXkuaXNBcnJheShmcykpIHRocm93IG5ldyBFcnJvcignVmlydHVhbCBGaWxlc3lzdGVtIHByb3ZpZGVkIG5vdCB2YWxpZCwgaW5pdGlhbGl6YXRpb24gZmFpbGVkLicpXG5cbiAgICAvLyBOb3QgQnkgUmVmZXJlbmNlLlxuICAgIC8vIEhBQ0s6IE9iamVjdCBhc3NpZ24gcmVmdXNlIHRvIHdvcmsgYXMgaW50ZW5kZWQuXG4gICAgZnMgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGZzKSlcbiAgICB0aGlzLkZpbGVTeXN0ZW0gPSB0aGlzLmluaXRGcyhmcylcblxuICAgIC8vIENXRCBmb3IgY29tbWFuZHMgdXNhZ2VcbiAgICB0aGlzLmN3ZCA9IFsnLyddXG4gIH1cblxuICAvKipcbiAgICogSW5pdCAmIFBhc3MgQ29udHJvbCB0byByZWN1cnJzaXZlIGZ1bmN0aW9uXG4gICAqIEByZXR1cm4gbmV3IEZpbGVzeXN0ZW0gYXMgbm9kZXMgb2YgbXVsdGlwbGUgQGNsYXNzIEZpbGVcbiAgICovXG4gIGluaXRGcyhmcykge1xuICAgIHRoaXMuYnVpbGRWaXJ0dWFsRnMoZnMpXG4gICAgcmV0dXJuIGZzXG4gIH1cblxuICAvKipcbiAgICogVHJhdmVyc2UgYWxsIG5vZGUgYW5kIGJ1aWxkIGEgdmlydHVhbCByZXByZXNlbnRhdGlvbiBvZiBhIGZpbGVzeXN0ZW1cbiAgICogRWFjaCBub2RlIGlzIGEgRmlsZSBpbnN0YW5jZS5cbiAgICogQHBhcmFtIE1vY2tlZCBGaWxlc3lzdGVtIGFzIE9iamVjdFxuICAgKlxuICAgKi9cbiAgYnVpbGRWaXJ0dWFsRnMob2JqKSB7XG4gICAgZm9yIChsZXQga2V5IGluIG9iaikge1xuICAgICAgaWYgKG9iai5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgIGlmICh0eXBlb2Ygb2JqW2tleV0gPT09ICdvYmplY3QnICYmICFBcnJheS5pc0FycmF5KG9ialtrZXldKSkge1xuICAgICAgICAgIG9ialtrZXldID0gbmV3IEZpbGUoeyBuYW1lOiBrZXksIGNvbnRlbnQ6IG9ialtrZXldLCB0eXBlOiAnZGlyJyB9KVxuICAgICAgICAgIHRoaXMuYnVpbGRWaXJ0dWFsRnMob2JqW2tleV0uY29udGVudClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBvYmpba2V5XSA9IG5ldyBGaWxlKHsgbmFtZToga2V5LCBjb250ZW50OiBvYmpba2V5XSB9KVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhIHN0cmluZ2VkIHBhdGggYW5kIHJldHVybiBhcyBhcnJheVxuICAgKiB0aHJvdyBlcnJvciBpZiBwYXRoIGZvcm1hdCBpcyBpbnZhbGlkXG4gICAqIFJlbGF0aXZlIFBhdGggZ2V0cyBjb252ZXJ0ZWQgdXNpbmcgQ3VycmVudCBXb3JraW5nIERpcmVjdG9yeVxuICAgKiBAcGFyYW0gcGF0aCB7U3RyaW5nfVxuICAgKiBAcmV0dXJuIEFycmF5XG4gICAqL1xuICBwYXRoU3RyaW5nVG9BcnJheShwYXRoID0gJycpIHtcbiAgICBpZiAoIXBhdGgubGVuZ3RoKSB0aHJvdyBuZXcgRXJyb3IoJ1BhdGggY2Fubm90IGJlIGVtcHR5JylcblxuICAgIC8vIENoZWNrIGZvciBpbnZhbGlkIHBhdGgsIGVnLiB0d28rIC8vIGluIGEgcm93XG4gICAgaWYgKHBhdGgubWF0Y2goL1xcL3syLH0vZykpIHRocm93IG5ldyBFcnJvcihgLWludmFsaWQgcGF0aDogJHtwYXRofWApXG5cbiAgICAvLyBGb3JtYXQgYW5kIENvbXBvc2VyIGFycmF5XG4gICAgbGV0IHBhdGhBcnJheSA9IHBhdGguc3BsaXQoJy8nKVxuICAgIGlmIChwYXRoQXJyYXlbMF0gPT09ICcnKSBwYXRoQXJyYXlbMF0gPSAnLydcbiAgICBpZiAocGF0aEFycmF5WzBdID09PSAnLicpIHBhdGhBcnJheS5zaGlmdCgpXG4gICAgaWYocGF0aEFycmF5W3BhdGhBcnJheS5sZW5ndGggLSAxXSA9PT0gJycpIHBhdGhBcnJheS5wb3AoKVxuICAgIC8vIGhhbmRsZSByZWxhdGl2ZSBwYXRoIHdpdGggY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeVxuICAgIGlmIChwYXRoQXJyYXlbMF0gIT09ICcvJykge1xuICAgICAgcGF0aEFycmF5ID0gdGhpcy5jd2QuY29uY2F0KHBhdGhBcnJheSlcbiAgICB9XG4gICAgcmV0dXJuIHBhdGhBcnJheVxuICB9XG5cbiAgLyoqXG4gICAqIFBhdGggZnJvbSBhcnJheSB0byBTdHJpbmdcbiAgICogRm9yIHByZXNlbnRhdGlvbmFsIHB1cnBvc2UuXG4gICAqIFRPRE9cbiAgICogQHBhcmFtIHBhdGggW0FycmF5XVxuICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAqL1xuICBwYXRoQXJyYXlUb1N0cmluZyhwYXRoID0gW10pIHtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkocGF0aCkpIHRocm93IG5ldyBFcnJvcignLWZhdGFsIGZpbGVzeXN0ZW06IHBhdGggbXVzdCBiZSBhbiBhcnJheScpXG4gICAgaWYgKCFwYXRoLmxlbmd0aCkgdGhyb3cgbmV3IEVycm9yKCctaW52YWxpZCBmaWxlc3lzdGVtOiBwYXRoIG5vdCBwcm92aWRlZCcpXG4gICAgbGV0IG91dHB1dCA9IHBhdGguam9pbignLycpXG4gICAgLy8gcmVtb3ZlIC8gbXVsdGlwbGUgb2NjdXJyZW5jZVxuICAgIHJldHVybiBvdXRwdXQucmVwbGFjZSgvXFwvezIsfS9nLCAnLycpXG4gIH1cblxuICAvKipcbiAgICogTHVrZS4uIGZpbGVXYWxrZXJcbiAgICogQWNjZXB0cyBvbmx5IEFic29sdXRlIFBhdGgsIHlvdSBtdXN0IGNvbnZlcnQgcGF0aHMgYmVmb3JlIGNhbGxpbmcgdXNpbmcgcGF0aFN0cmluZ1RvQXJyYXlcbiAgICogQHBhcmFtIGNiIGV4ZWN1dGVkIG9uIGVhY2ggZmlsZSBmb3VuZFxuICAgKiBAcGFyYW0gZnMgW1NoZWxsIFZpcnR1YWwgRmlsZXN5c3RlbV1cbiAgICovXG4gIGZpbGVXYWxrZXIocGF0aCA9IFsnLyddLCBmcyA9IHRoaXMuRmlsZVN5c3RlbSl7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KHBhdGgpKSB0aHJvdyBuZXcgRXJyb3IoJ1BhdGggbXVzdCBiZSBhbiBhcnJheSBvZiBub2RlcywgdXNlIEZpbGVzeXN0ZW0ucGF0aFN0cmluZ1RvQXJyYXkoe3N0cmluZ30pJylcblxuICAgIC8vIGF2b2lkIG1vZGlmeWluZyBleHRlcm5hbCBwYXRoIHJlZmVyZW5jZVxuICAgIHBhdGggPSBwYXRoLnNsaWNlKDApXG5cbiAgICAvLyBUT0RPOlxuICAgIC8vICBDaG9vc2U6XG4gICAgLy8gICAgLSBHbyBmdWxsIHB1cmVcbiAgICAvLyAgICAtIFdvcmsgb24gdGhlIHJlZmVyZW5jZSBvZiB0aGUgYWN0dWFsIG5vZGVcbiAgICAvLyBmcyA9IE9iamVjdC5hc3NpZ24oZnMsIHt9KVxuXG4gICAgLy8gRXhpdCBDb25kaXRpb25cbiAgICBpZiAoIXBhdGgubGVuZ3RoKSByZXR1cm4gZnNcblxuICAgIC8vIEdldCBjdXJyZW50IG5vZGVcbiAgICBsZXQgbm9kZSA9IHBhdGguc2hpZnQoKVxuXG4gICAgLy8gR28gZGVlcGVyIGlmIGl0J3Mgbm90IHRoZSByb290IGRpclxuICAgIGlmIChub2RlICE9PSAnLycpIHtcbiAgICAgIC8vIGNoZWNrIGlmIG5vZGUgZXhpc3RcbiAgICAgIGlmIChmc1tub2RlXSkge1xuICAgICAgICAvLyByZXR1cm4gZmlsZSBvciBmb2xkZXJcbiAgICAgICAgZnMgPSBmc1tub2RlXS50eXBlID09PSAnZGlyJyA/IGZzW25vZGVdLmNvbnRlbnQgOiBmc1tub2RlXVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGaWxlIGRvZXNuXFwndCBleGlzdCcpXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmZpbGVXYWxrZXIocGF0aCwgZnMpXG4gIH1cblxuICAvKipcbiAgICogdHJhdmVyc2VGaWxlc1xuICAgKiBhY2Nlc3NpbmcgYWxsIGZpbGUgYXQgbGVhc3Qgb25jZVxuICAgKiBjYWxsaW5nIHByb3ZpZGVkIGNhbGxiYWNrIG9uIGVhY2hcbiAgICogQHBhcmFtIGNiIGV4ZWN1dGVkIG9uIGVhY2ggZmlsZSBmb3VuZFxuICAgKiBAcGFyYW0gZnMgW1NoZWxsIFZpcnR1YWwgRmlsZXN5c3RlbV1cbiAgICovXG4gIHRyYXZlcnNlRmlsZXMoY2IgPSAoKT0+e30sIGZzID0gdGhpcy5GaWxlU3lzdGVtKXtcbiAgICBjb25zdCBzZWxmID0gdGhpcy50cmF2ZXJzZUZpbGVzXG4gICAgZm9yIChsZXQgbm9kZSBpbiBmcykge1xuICAgICAgaWYgKGZzLmhhc093blByb3BlcnR5KG5vZGUpKSB7XG4gICAgICAgIGlmIChmc1tub2RlXS50eXBlID09PSAnZGlyJykgdGhpcy50cmF2ZXJzZUZpbGVzKGNiLCBmc1tub2RlXS5jb250ZW50KVxuICAgICAgICBlbHNlIGNiKGZzW25vZGVdKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiB0cmF2ZXJzZURpcnNcbiAgICogYWNjZXNzaW5nIGFsbCBkaXJlY3RvcnkgYXQgbGVhc3Qgb25jZVxuICAgKiBjYWxsaW5nIHByb3ZpZGVkIGNhbGxiYWNrIG9uIGVhY2hcbiAgICogQHBhcmFtIGNiIGV4ZWN1dGVkIG9uIGVhY2ggZmlsZSBmb3VuZFxuICAgKiBAcGFyYW0gZnMgW1NoZWxsIFZpcnR1YWwgRmlsZXN5c3RlbV1cbiAgICovXG4gIHRyYXZlcnNlRGlycyhjYiA9ICgpPT57fSwgZnMgPSB0aGlzLkZpbGVTeXN0ZW0pe1xuICAgIGZvciAobGV0IG5vZGUgaW4gZnMpIHtcbiAgICAgIGlmIChmcy5oYXNPd25Qcm9wZXJ0eShub2RlKSkge1xuICAgICAgICBpZiAoZnNbbm9kZV0udHlwZSA9PT0gJ2RpcicpIHtcbiAgICAgICAgICBjYihmc1tub2RlXSlcbiAgICAgICAgICB0aGlzLnRyYXZlcnNlRGlycyhjYiwgZnNbbm9kZV0uY29udGVudClcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgRGlyZWN0b3J5IE5vZGVcbiAgICogUGFzc2VkIGFzIFJlZmVyZW5jZSBvciBJbnN0YW5jZSxcbiAgICogZGVwZW5kIGJ5IGEgbGluZSBpbiBAbWV0aG9kIGZpbGVXYWxrZXIsIHNlZSBjb21tZW50IHRoZXJlLlxuICAgKiBAcmV0dXJuIERpcmVjdG9yeSBOb2RlIE9iamVjdFxuICAgKi9cbiAgZ2V0Tm9kZShwYXRoID0gJycsIGZpbGVUeXBlKSB7XG4gICAgaWYgKHR5cGVvZiBwYXRoICE9PSAnc3RyaW5nJykgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGlucHV0LicpXG4gICAgbGV0IHBhdGhBcnJheSwgbm9kZVxuXG4gICAgdHJ5IHtcbiAgICAgIHBhdGhBcnJheSA9IHRoaXMucGF0aFN0cmluZ1RvQXJyYXkocGF0aClcbiAgICAgIG5vZGUgPSB0aGlzLmZpbGVXYWxrZXIocGF0aEFycmF5KVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRocm93IGVcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBFUlJPUiBIQU5ETElOR1xuICAgICAqL1xuXG4gICAgLy8gSGFuZGxlIExpc3Qgb24gYSBmaWxlXG4gICAgaWYgKGZpbGVUeXBlID09PSAnZGlyJyAmJiBub2RlLnR5cGUgPT09ICdmaWxlJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJdHMgYSBmaWxlIG5vdCBhIGRpcmVjdG9yeScpXG4gICAgfVxuICAgIC8vIEhhbmRsZSByZWFkZmlsZSBvbiBhIGRpclxuICAgIGlmIChmaWxlVHlwZSA9PT0gJ2ZpbGUnICYmIG5vZGUudHlwZSA9PT0gJ2RpcicpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSXRzIGEgZGlyZWN0b3J5IG5vdCBhIGZpbGUnKVxuICAgIH1cbiAgICAvLyBoYW5kbGUgcmVhZGZpbGUgb24gbm9uIGV4aXN0aW5nIGZpbGVcbiAgICBpZiAoZmlsZVR5cGUgPT09ICdmaWxlJyAmJiAhbm9kZS50eXBlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgZmlsZSBwYXRoJylcbiAgICB9XG4gICAgLy8gaGFuZGxlIGludmFsaWQgLyBub25leGlzdGluZyBwYXRoXG4gICAgaWYgKCFub2RlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgcGF0aCwgZmlsZS9mb2xkZXIgZG9lc25cXCd0IGV4aXN0JylcbiAgICB9XG5cbiAgICByZXR1cm4geyBwYXRoLCBwYXRoQXJyYXkgLCBub2RlIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDaGFuZ2UgQ3VycmVudCBXb3JraW5nIERpcmVjdG9yeSBHcmFjZWZ1bGx5XG4gICAqIEByZXR1cm4gTWVzc2FnZSBTdHJpbmcuXG4gICAqL1xuICBjaGFuZ2VEaXIocGF0aCA9ICcnKSB7XG4gICAgbGV0IHJlc3VsdFxuICAgIHRyeSB7XG4gICAgICByZXN1bHQgPSB0aGlzLmdldE5vZGUocGF0aCwgJ2RpcicpXG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICB0aHJvdyBlcnJcbiAgICB9XG4gICAgdGhpcy5jd2QgPSByZXN1bHQucGF0aEFycmF5XG4gICAgcmV0dXJuIGBjaGFuZ2VkIGRpcmVjdG9yeS5gXG4gIH1cblxuICAvKipcbiAgICogTGlzdCBDdXJyZW50IFdvcmtpbmcgRGlyZWN0b3J5IEZpbGVzXG4gICAqIEByZXR1cm4ge31cbiAgICovXG4gIGxpc3REaXIocGF0aCA9ICcnKSB7XG4gICAgbGV0IHJlc3VsdFxuICAgIHRyeSB7XG4gICAgICByZXN1bHQgPSB0aGlzLmdldE5vZGUocGF0aCwgJ2RpcicpXG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICB0aHJvdyBlcnJcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdC5ub2RlXG4gIH1cblxuICByZWFkRmlsZShwYXRoID0gJycpIHtcbiAgICBsZXQgcmVzdWx0XG4gICAgdHJ5IHtcbiAgICAgIHJlc3VsdCA9IHRoaXMuZ2V0Tm9kZShwYXRoLCAnZmlsZScpXG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICB0aHJvdyBlcnJcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdC5ub2RlXG4gIH1cblxuICBnZXRDdXJyZW50RGlyZWN0b3J5KCkge1xuICAgIGxldCBjd2RBc1N0cmluZ1xuICAgIHRyeSB7XG4gICAgICBjd2RBc1N0cmluZyA9IHRoaXMucGF0aEFycmF5VG9TdHJpbmcodGhpcy5jd2QpXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuICctaW52YWxpZCBmaWxlc3lzdGVtOiBBbiBlcnJvciBvY2N1cmVkIHdoaWxlIHBhcnNpbmcgY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeSB0byBzdHJpbmcuJ1xuICAgIH1cbiAgICByZXR1cm4gY3dkQXNTdHJpbmdcbiAgfVxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gRmlsZXN5c3RlbVxuIiwiY29uc3QgQ29tbWFuZCA9IHJlcXVpcmUoJy4vQ29tbWFuZCcpXG5cbi8qKlxuICpcbiAqIEludGVycHJldGVyXG4gKiBJcyB0aGUgcGFyZW50IENsYXNzIG9mIHRoZSBNYWluIFNoZWxsIENsYXNzXG4gKiAtIFRoaXMgY2xhc3MgaXMgdGhlIG9uZSB0aGF0IHBhcnNlIGFuZCBydW4gZXhlYyBvZiBjb21tYW5kXG4gKiAtIFBhcnNpbmcgb2YgYnVpbHRpbiBjb21tYW5kIG9uIHJ1bnRpbWUgaGFwcGVuIGhlcmVcbiAqIC0gV2lsbCBwYXJzZSBjdXN0b20gdXNlciBDb21tYW5kIHRvb1xuICpcbiAqL1xuY2xhc3MgSW50ZXJwcmV0ZXIge1xuXG4gIC8qKlxuICAgKiBQYXJzZSBDb21tYW5kXG4gICAqIFN0cmluZyBpcyBzcGxpdHRlZCBieSBzcGFjZXNcbiAgICogQHJldHVybiBBcnJheSBvZiBhcmdzIGFzIGluIENcbiAgICogLS0tXG4gICAqICAgSURFQTogUmVnZXhwIGV2ZXJ5IHdvcmQgaXMgYW4gYXJndW1lbnQsIHRvIHByb2lkZSBzb21ldGhpbmcgZWxzZSB5b3UgbXVzdCBlbmNsb3NlXG4gICAqICAgaXQgaW4gc2luZ2xlIG9yIGRvdWJsZSBxdW90ZXMuXG4gICAqICAgVG8gcGFzcyBhIGpzb24gdXNlIHNpbmdsZSBxdW90ZXMgc2luY2UgdGhlIGpzb24gc3Rhcm5kYXJkIHJlcXVpcmVzIGRvdWJsZSBxdW90ZXMgaW4gaXRcbiAgICogICBAcmV0dXJuIGNtZC5tYXRjaCgvW15cXHNcIiddK3xcIihbXlwiXSopXCJ8JyhbXiddKiknL2cpXG4gICAqIC0tLVxuICAgKi9cbiAgcGFyc2UoY21kKSB7XG4gICAgaWYgKHR5cGVvZiBjbWQgIT09ICdzdHJpbmcnKSB0aHJvdyBuZXcgRXJyb3IoJ0NvbW1hbmQgbXVzdCBiZSBhIHN0cmluZycpXG4gICAgaWYgKCFjbWQubGVuZ3RoKSB0aHJvdyBuZXcgRXJyb3IoJ0NvbW1hbmQgaXMgZW1wdHknKVxuICAgIHJldHVybiBjbWQuc3BsaXQoJyAnKVxuICB9XG5cbiAgLyoqXG4gICAqIEZvcm1hdCBPdXRwdXRcbiAgICogcmV0dXJuIGVycm9yIGlmIGZ1bmN0aW9uIGlzIHJldHVybmVkXG4gICAqIGNvbnZlcnQgZXZlcnl0aGluZyBlbHNlIHRvIGpzb24uXG4gICAqIEByZXR1cm4gSlNPTiBwYXJzZWRcbiAgICovXG4gIGZvcm1hdChvdXRwdXQpIHtcbiAgICBpZiAodHlwZW9mIG91dHB1dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuICctaW52YWxpZCBjb21tYW5kOiBDb21tYW5kIHJldHVybmVkIGludmFsaWQgZGF0YSB0eXBlLidcbiAgICB9XG4gICAgaWYgKG91dHB1dCA9PT0gdW5kZWZpbmVkIHx8IHR5cGVvZiBvdXRwdXQgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICByZXR1cm4gJy1pbnZhbGlkIGNvbW1hbmQ6IENvbW1hbmQgcmV0dXJuZWQgbm8gZGF0YS4nXG4gICAgfVxuICAgIHJldHVybiBvdXRwdXRcbiAgICAvLyB0cnkge1xuICAgIC8vICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KG91dHB1dClcbiAgICAvLyB9IGNhdGNoIChlKSB7XG4gICAgLy8gICByZXR1cm4gJy1pbnZhbGlkIGNvbW1hbmQ6IENvbW1hbmQgcmV0dXJuZWQgaW52YWxpZCBkYXRhIHR5cGU6ICcgKyBlLm1lc3NhZ2VcbiAgICAvLyB9XG4gIH1cblxuICAvKipcbiAgICogRXhlYyBDb21tYW5kXG4gICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICovXG4gIGV4ZWMoY21kKSB7XG5cbiAgICAvLyAgUGFyc2UgQ29tbWFuZCBTdHJpbmc6IFswXSA9IGNvbW1hbmQgbmFtZSwgWzErXSA9IGFyZ3VtZW50c1xuICAgIGxldCBwYXJzZWRcbiAgICB0cnkge1xuICAgICAgcGFyc2VkID0gdGhpcy5wYXJzZShjbWQpXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuICctZmF0YWwgY29tbWFuZDogJyArIGUubWVzc2FnZSB8fCAnU29tZSBFcnJvciBPY2N1cmVkJ1xuICAgIH1cblxuICAgIC8vICBYLWNoZWNrIGlmIGNvbW1hbmQgZXhpc3RcbiAgICBjb25zdCBjb21tYW5kID0gdGhpcy5TaGVsbENvbW1hbmRzW3BhcnNlZFswXV1cbiAgICBpZiAoIWNvbW1hbmQpIHtcbiAgICAgIHJldHVybiBgLWVycm9yIHNoZWxsOiBDb21tYW5kIDwke3BhcnNlZFswXX0+IGRvZXNuJ3QgZXhpc3QuXFxuYFxuICAgIH1cblxuICAgIC8vICBnZXQgYXJndW1lbnRzIGFycmF5IGFuZCBleGVjdXRlIGNvbW1hbmQgcmV0dXJuIGVycm9yIGlmIHRocm93XG4gICAgY29uc3QgYXJncyA9IHBhcnNlZC5maWx0ZXIoKGUsIGkpID0+IGkgPiAwKVxuICAgIGxldCBvdXRwdXRcbiAgICB0cnkge1xuICAgICAgb3V0cHV0ID0gY29tbWFuZC5leGVjKGFyZ3MpXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuICctZmF0YWwgY29tbWFuZDogJyArIGUubWVzc2FnZVxuICAgIH1cblxuICAgIC8vICBGb3JtYXQgZGF0YSBhbmQgUmV0dXJuXG4gICAgcmV0dXJuIHRoaXMuZm9ybWF0KG91dHB1dClcbiAgfVxuXG4gIC8qXG4gICAqIEdlbmVyYXRlIEJ1aWx0aW4gQ29tbWFuZCBMaXN0XG4gICAqL1xuICByZWdpc3RlckNvbW1hbmRzKFNoZWxsUmVmZXJlbmNlLCBjdXN0b21Db21tYW5kcyA9IHVuZGVmaW5lZCkge1xuICAgIGxldCBCbHVlcHJpbnRzID0gcmVxdWlyZSgnLi4vY29uZmlncy9idWlsdGluLWNvbW1hbmRzJylcbiAgICAvKipcbiAgICAgKiBJZiBjdXN0b20gY29tbWFuZHMgYXJlIHBhc3NlZCBjaGVjayBmb3IgdmFsaWQgdHlwZVxuICAgICAqIElmIGdvb2QgdG8gZ28gZ2VuZXJhdGUgdGhvc2UgY29tbWFuZHNcbiAgICAgKi9cbiAgICBpZiAoY3VzdG9tQ29tbWFuZHMpIHtcbiAgICAgIGlmICh0eXBlb2YgY3VzdG9tQ29tbWFuZHMgPT09ICdvYmplY3QnICYmICFBcnJheS5pc0FycmF5KGN1c3RvbUNvbW1hbmRzKSkge1xuICAgICAgICBCbHVlcHJpbnRzID0gY3VzdG9tQ29tbWFuZHNcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQ3VzdG9tIGNvbW1hbmQgcHJvdmlkZWQgYXJlIG5vdCBpbiBhIHZhbGlkIGZvcm1hdC4nKVxuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IFNoZWxsQ29tbWFuZHMgPSB7fVxuICAgIE9iamVjdC5rZXlzKEJsdWVwcmludHMpLm1hcCgoa2V5KSA9PiB7XG4gICAgICBjb25zdCBjbWQgPSBCbHVlcHJpbnRzW2tleV1cbiAgICAgIGlmICh0eXBlb2YgY21kLm5hbWUgPT09ICdzdHJpbmcnICYmIHR5cGVvZiBjbWQuZm4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgY21kLnNoZWxsID0gU2hlbGxSZWZlcmVuY2VcbiAgICAgICAgU2hlbGxDb21tYW5kc1trZXldID0gbmV3IENvbW1hbmQoY21kKVxuICAgICAgfVxuICAgIH0pXG4gICAgcmV0dXJuIFNoZWxsQ29tbWFuZHNcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEludGVycHJldGVyXG4iLCJjb25zdCBJbnRlcnByZXRlciA9IHJlcXVpcmUoJy4vSW50ZXJwcmV0ZXInKVxuY29uc3QgRmlsZXN5c3RlbSA9IHJlcXVpcmUoJy4vRmlsZXN5c3RlbScpXG5cbi8qKlxuICogU2hlbGwgQ2xhc3MgaW5oZXJpdHMgZnJvbSBJbnRlcnByZXRlclxuICogT3B0aW9uczpcbiAqICAtIGZpbGVzeXN0ZW0ge09iamVjdH1cbiAqICAtIGNvbW1hbmRzIHtPYmplY3R9XG4gKiAgLSB1c2VyIHtTdHJpbmd9XG4gKiAgLSBob3N0bmFtZSB7U3RyaW5nfVxuICovXG5jbGFzcyBTaGVsbCBleHRlbmRzIEludGVycHJldGVye1xuICBjb25zdHJ1Y3Rvcih7IGZpbGVzeXN0ZW0gPSB1bmRlZmluZWQsIGNvbW1hbmRzID0gdW5kZWZpbmVkLCB1c2VyID0gJ3Jvb3QnLCBob3N0bmFtZSA9ICdteS5ob3N0Lm1lJyB9ID0ge30pIHtcbiAgICBzdXBlcigpXG5cbiAgICB0aGlzLnBvbHlmaWxscygpXG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgdGhlIHZpcnR1YWwgZmlsZXN5c3RlbVxuICAgICAqIEByZXR1cm4gcmVmZXJlbmNlIHRvIGluc3RhbmNlIG9mIEBjbGFzcyBGaWxlc3lzdGVtXG4gICAgICovXG4gICAgdGhpcy5mcyA9IG5ldyBGaWxlc3lzdGVtKGZpbGVzeXN0ZW0sIHRoaXMpXG4gICAgdGhpcy51c2VyID0gdXNlclxuICAgIHRoaXMuaG9zdG5hbWUgPSBob3N0bmFtZVxuXG4gICAgLy8gSW5pdCBidWlsdGluIGNvbW1hbmRzLCBAbWV0aG9kIGluIHBhcmVudFxuICAgIC8vIHBhc3Mgc2hlbGwgcmVmZXJlbmNlXG4gICAgdGhpcy5TaGVsbENvbW1hbmRzID0gdGhpcy5yZWdpc3RlckNvbW1hbmRzKHRoaXMpXG4gICAgdGhpcy5TaGVsbENvbW1hbmRzID0ge1xuICAgICAgLi4udGhpcy5TaGVsbENvbW1hbmRzLFxuICAgICAgLi4udGhpcy5yZWdpc3RlckNvbW1hbmRzKHRoaXMsIGNvbW1hbmRzKSxcbiAgICB9XG4gIH1cblxuICBwb2x5ZmlsbHMoKSB7XG4gICAgaWYgKCFnbG9iYWwuUHJvbWlzZSkge1xuICAgICAgZ2xvYmFsLlByb21pc2UgPSByZXF1aXJlKCdwcm9taXNlLXBvbHlmaWxsJykuUHJvbWlzZVxuICAgIH1cbiAgICBpZiAoIWdsb2JhbC5mZXRjaCkge1xuICAgICAgZ2xvYmFsLmZldGNoID0gcmVxdWlyZSgnd2hhdHdnLWZldGNoJylcbiAgICB9XG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIC8qKlxuICAgKiBQYXNzIGNvbnRyb2wgdG8gSW50ZXJwcmV0ZXJcbiAgICogQHJldHVybiBbU3RyaW5nXSBPUiB7UHJvbWlzZX0gdG8gcmVzb2x2ZSBmcm9tIHlvdXIgd3JhcHBlci5cbiAgICovXG4gIHJ1bihjbWQpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjKGNtZClcbiAgfVxufVxuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoU2hlbGwucHJvdG90eXBlLCAnZnMnLCB7IHdyaXRhYmxlOiB0cnVlLCBlbnVtZXJhYmxlOiBmYWxzZSB9KVxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFNoZWxsLnByb3RvdHlwZSwgJ1NoZWxsQ29tbWFuZHMnLCB7IHdyaXRhYmxlOiB0cnVlLCBlbnVtZXJhYmxlOiBmYWxzZSB9KVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNoZWxsXG4iLCJjb25zdCB7IG5hbWUsIHZlcnNpb24sIGRlc2NyaXB0aW9uLCByZXBvc2l0b3J5LCBhdXRob3IsIGxpY2Vuc2UgfSA9IHJlcXVpcmUoJy4uLy4uL3BhY2thZ2UuanNvbicpXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICAvKipcbiAgICogSGVscFxuICAgKiBAcmV0dXJuIExpc3Qgb2YgY29tbWFuZHNcbiAgICovXG4gIGhlbHA6IHtcbiAgICBuYW1lOiAnaGVscCcsXG4gICAgdHlwZTogJ2J1aWx0aW4nLFxuICAgIG1hbjogJ0xpc3Qgb2YgYXZhaWxhYmxlIGNvbW1hbmRzJyxcbiAgICBmbjogZnVuY3Rpb24gaGVscCgpIHtcbiAgICAgIHJldHVybiBgQ29tbWFuZHMgYXZhaWxhYmxlOiAke09iamVjdC5rZXlzKHRoaXMuc2hlbGwuU2hlbGxDb21tYW5kcykuam9pbignLCAnKX1gXG4gICAgfVxuICB9LFxuXG4gIHdob2FtaToge1xuICAgIG5hbWU6ICd3aG9hbWknLFxuICAgIHR5cGU6ICdidWlsdGluJyxcbiAgICBtYW46ICdDdXJyZW50IHVzZXInLFxuICAgIGZuOiBmdW5jdGlvbiB3aG9hbWkoKSB7XG4gICAgICByZXR1cm4gdGhpcy5zaGVsbC51c2VyXG4gICAgfSxcbiAgfSxcblxuICBhYm91dDoge1xuICAgIG5hbWU6ICdhYm91dCcsXG4gICAgdHlwZTogJ2J1aWx0aW4nLFxuICAgIG1hbjogJ0Fib3V0IHRoaXMgcHJvamVjdCcsXG4gICAgZm46IGZ1bmN0aW9uIGFib3V0KCkge1xuICAgICAgbGV0IHN0ciA9ICcnXG4gICAgICBzdHIgKz0gYG5hbWU6ICR7bmFtZX1cXG5gXG4gICAgICBzdHIgKz0gYHZlcnNpb246ICR7dmVyc2lvbn1cXG5gXG4gICAgICBzdHIgKz0gYGRlc2NyaXB0aW9uOiAke2Rlc2NyaXB0aW9ufVxcbmBcbiAgICAgIHN0ciArPSBgcmVwb3NpdG9yeTogJHtyZXBvc2l0b3J5fVxcbmBcbiAgICAgIHN0ciArPSBgYXV0aG9yOiAke2F1dGhvcn1cXG5gXG4gICAgICBzdHIgKz0gYGxpY2Vuc2U6ICR7bGljZW5zZX1cXG5gXG4gICAgICByZXR1cm4gc3RyXG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBSZXR1cm4gcGFzc2VkIGFyZ3VtZW50cywgZm9yIHRlc3RpbmcgcHVycG9zZXNcbiAgICovXG4gIGFyZ3VtZW50czoge1xuICAgIG5hbWU6ICdhcmd1bWVudHMnLFxuICAgIHR5cGU6ICdidWlsdGluJyxcbiAgICBtYW46ICdSZXR1cm4gYXJndW1lbnQgcGFzc2VkLCB1c2VkIGZvciB0ZXN0aW5nIHB1cnBvc2UnLFxuICAgIGZuOiBhcmdzID0+IGFyZ3NcbiAgfSxcblxuICAvKipcbiAgICogQ2hhbmdlIERpcmVjdG9yeVxuICAgKiBAcmV0dXJuIFN1Y2Nlc3MvRmFpbCBNZXNzYWdlIFN0cmluZ1xuICAgKi9cbiAgY2Q6IHtcbiAgICBuYW1lOiAnY2QnLFxuICAgIHR5cGU6ICdidWlsdGluJyxcbiAgICBtYW46ICdDaGFuZ2UgZGlyZWN0b3J5LCBwYXNzIGFic29sdXRlIG9yIHJlbGF0aXZlIHBhdGg6IGVnLiBjZCAvZXRjLCBjZCAvIGNkL215L25lc3RlZC9kaXInLFxuICAgIGZuOiBmdW5jdGlvbiBjZChwYXRoKSB7XG4gICAgICBpZiAoIXBhdGgpIHRocm93IG5ldyBFcnJvcignLWludmFsaWQgTm8gcGF0aCBwcm92aWRlZC4nKVxuICAgICAgcGF0aCA9IHBhdGguam9pbigpXG4gICAgICB0cnl7XG4gICAgICAgIHJldHVybiB0aGlzLnNoZWxsLmZzLmNoYW5nZURpcihwYXRoKVxuICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgIHRocm93IGVcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIGxzIENvbW1hbmRcbiAgICogTGlzdCBkaXJlY3RvcnkgZmlsZXNcbiAgICogQHBhcmFtIGFycmF5IG9mIGFyZ3NcbiAgICogQHJldHVybiBmb3JtYXR0ZWQgU3RyaW5nXG4gICAqL1xuICBsczoge1xuICAgIG5hbWU6ICdscycsXG4gICAgdHlwZTogJ2J1aWx0aW4nLFxuICAgIG1hbjogJ2xpc3QgZGlyZWN0b3J5IGZpbGVzLCBwYXNzIGFic29sdXRlL3JlbGF0aXZlIHBhdGgsIGlmIGVtcHR5IGxpc3QgY3VycmVudCBkaXJlY3RvcnknLFxuICAgIGZuOiBmdW5jdGlvbiBscyhwYXRoID0gWycuLyddICkge1xuICAgICAgcGF0aCA9IHBhdGguam9pbigpXG4gICAgICBsZXQgbGlzdCwgcmVzcG9uc2VTdHJpbmcgPSAnJ1xuICAgICAgdHJ5e1xuICAgICAgICBsaXN0ID0gdGhpcy5zaGVsbC5mcy5saXN0RGlyKHBhdGgpXG4gICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgdGhyb3cgZVxuICAgICAgfVxuICAgICAgZm9yIChsZXQgZmlsZSBpbiBsaXN0KSB7XG4gICAgICAgIGlmIChsaXN0Lmhhc093blByb3BlcnR5KGZpbGUpKSB7XG4gICAgICAgICAgcmVzcG9uc2VTdHJpbmcgKz0gYCR7bGlzdFtmaWxlXS5wZXJtaXNzaW9ufVxcdCR7bGlzdFtmaWxlXS51c2VyfSAke2xpc3RbZmlsZV0uZ3JvdXB9XFx0JHtsaXN0W2ZpbGVdLm5hbWV9XFxuYFxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzcG9uc2VTdHJpbmdcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIENBVCBDb21tYW5kXG4gICAqIFJlYWQgRmlsZVxuICAgKiBAcmV0dXJuIGZvcm1hdHRlZCBTdHJpbmdcbiAgICovXG4gIGNhdDoge1xuICAgIG5hbWU6ICdjYXQnLFxuICAgIHR5cGU6ICdidWlsdGluJyxcbiAgICBtYW46ICdSZXR1cm4gZmlsZSBjb250ZW50LCB0YWtlIG9uZSBhcmd1bWVudDogZmlsZSBwYXRoIChyZWxhdGl2ZS9hYnNvbHV0ZSknLFxuICAgIGZuOiBmdW5jdGlvbihwYXRoID0gWycuLyddKSB7XG4gICAgICBwYXRoID0gcGF0aC5qb2luKClcbiAgICAgIGxldCBmaWxlLCByZXNwb25zZVN0cmluZyA9ICcnXG4gICAgICB0cnl7XG4gICAgICAgIGZpbGUgPSB0aGlzLnNoZWxsLmZzLnJlYWRGaWxlKHBhdGgpXG4gICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgdGhyb3cgZVxuICAgICAgfVxuICAgICAgcmV0dXJuIGZpbGUuY29udGVudFxuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogTWFuXG4gICAqIFJldHVybiBjb21tYW5kIG1hbnVhbCBpbmZvXG4gICAqIEByZXR1cm4ge3N0cmluZ31cbiAgICovXG4gIG1hbjoge1xuICAgIG5hbWU6ICdtYW4nLFxuICAgIHR5cGU6ICdidWlsdGluJyxcbiAgICBtYW46ICdDb21tYW5kIG1hbnVhbCwgdGFrZXMgb25lIGFyZ3VtZW50LCBjb21tYW5kIG5hbWUnLFxuICAgIGZuOiBmdW5jdGlvbiBtYW4oYXJncykge1xuICAgICAgaWYgKCFhcmdzIHx8ICFhcmdzWzBdKSB0aHJvdyBuZXcgRXJyb3IoJ21hbjogbm8gY29tbWFuZCBwcm92aWRlZC4nKVxuICAgICAgbGV0IGNvbW1hbmQgPSBhcmdzWzBdXG4gICAgICBpZiAoIXRoaXMuc2hlbGwuU2hlbGxDb21tYW5kc1tjb21tYW5kXSkgdGhyb3cgbmV3IEVycm9yKCdjb21tYW5kIGRvZXNuXFwndCBleGlzdC4nKVxuICAgICAgaWYgKCF0aGlzLnNoZWxsLlNoZWxsQ29tbWFuZHNbY29tbWFuZF0ubWFuKSB0aHJvdyBuZXcgRXJyb3IoJ25vIG1hbnVhbCBlbnRyeSBmb3IgdGhpcyBjb21tYW5kLicpXG4gICAgICByZXR1cm4gdGhpcy5zaGVsbC5TaGVsbENvbW1hbmRzW2NvbW1hbmRdLm1hblxuICAgIH0sXG4gIH0sXG5cbiAgLyoqXG4gICAqIEhUVFBcbiAgICogUmV0dXJuIERhdGEgZnJvbSBhbiBIVFRQIHJlcXVlc3RcbiAgICogRklYTUU6IE5FRUQgRklYUyBGT1IgRk9STSBEQVRBIFdJVEggU1BBQ0VTXG4gICAqIEByZXR1cm4ge3N0cmluZ31cbiAgICovXG4gIGh0dHA6IHtcbiAgICBuYW1lOiAnaHR0cCcsXG4gICAgdHlwZTogJ2J1aWx0aW4nLFxuICAgIG1hbjogJ1NlbmQgaHR0cCByZXF1ZXN0cy5cXG4gc3ludGF4OiBodHRwIE1FVEhPRCBbcHJvcGVydHk6ZGF0YSxdIFVSTC5cXG5lZzogaHR0cCBHRVQgaHR0cDovL2pzb25wbGFjZWhvbGRlci50eXBpY29kZS5jb20vXFxuaHR0cCBQT1NUIHRpdGxlOk15VGl0bGUgaHR0cDovL2pzb25wbGFjZWhvbGRlci50eXBpY29kZS5jb20vcG9zdHMnLFxuICAgIGZuOiBmdW5jdGlvbiBodHRwKGFyZ3MgPSBbXSkge1xuICAgICAgaWYgKCFhcmdzIHx8ICFhcmdzLmxlbmd0aCB8fCBhcmdzLmxlbmd0aCA8IDIpIHRocm93IG5ldyBFcnJvcihgaHR0cDogbm8gcGFyYW1ldGVycyBwcm92aWRlZCwgcHJvdmlkZSBVUkwgYW5kL29yIG1ldGhvZCBcXG4gaGVscDogJHt0aGlzLnNoZWxsLlNoZWxsQ29tbWFuZHNbJ2h0dHAnXS5tYW59YClcblxuICAgICAgLy8gR2V0IE1ldGhvZCBhbmQgVVJMXG4gICAgICBsZXQgbWV0aG9kLCB1cmxcbiAgICAgIG1ldGhvZCA9IGFyZ3NbMF0udG9VcHBlckNhc2UoKVxuICAgICAgdXJsID0gYXJnc1thcmdzLmxlbmd0aCAtIDFdXG5cbiAgICAgIC8qXG4gICAgICAgKiBCdWlsZCBQYXlsb2FkXG4gICAgICAgKiBJZiBhcmdzID4gMiB0aGVyZSBhcmUgdmFsdWVzIGluIGJlZXR3ZWVuIG1ldGhvZCBhbmQgdXJsXG4gICAgICAgKiBmb3JtYXQgcHJvcDp2YWx1ZVxuICAgICAgICogRklYTUUgU3BhY2Ugbm90IGFsbG93ZWQsIG11c3QgY2hhbmdlIGhvdyBjb21tYW5kcyBhcmd1bWVudHMgYXJlIHBhcnNlZFxuICAgICAgICovXG4gICAgICBsZXQgcGF5bG9hZCA9IHt9XG4gICAgICBpZiAoYXJncy5sZW5ndGggPiAyKSB7XG4gICAgICAgIGFyZ3MubWFwKChlLCBpLCBhcnJheSkgPT4ge1xuICAgICAgICAgIGlmIChpICE9IDAgJiYgaSAhPT0gYXJncy5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICBsZXQgcGFyc2UgPSBlLnNwbGl0KCc6JylcbiAgICAgICAgICAgIHBheWxvYWRbcGFyc2VbMF1dID0gcGFyc2VbMV1cbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgICBsZXQgcmVxdWVzdCA9IHtcbiAgICAgICAgbWV0aG9kLFxuICAgICAgICBoZWFkZXJzOiB7IFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiIH0sXG4gICAgICB9XG4gICAgICBpZiAobWV0aG9kICE9PSAnR0VUJykgcmVxdWVzdC5ib2R5ID0gSlNPTi5zdHJpbmdpZnkocGF5bG9hZClcbiAgICAgIHJldHVybiBmZXRjaCh1cmwsIHJlcXVlc3QpLnRoZW4oKHJlcykgPT4ge1xuICAgICAgICBpZiAocmVzLm9rKSByZXR1cm4gcmVzLmpzb24oKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFJlcXVlc3QgRmFpbGVkICgke3Jlcy5zdGF0dXMgfHwgNTAwfSk6ICR7cmVzLnN0YXR1c1RleHQgfHwgJ1NvbWUgRXJyb3IgT2NjdXJlZC4nfWApXG4gICAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycilcbiAgICAgIH0pXG4gICAgfSxcbiAgfSxcblxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgJ2ZpbGUuaCc6ICcjaW5jbHVkZSA8bm9wZS5oPicsXG5cbiAgZXRjOiB7XG4gICAgYXBhY2hlMjoge1xuICAgICAgJ2FwYWNoZTIuY29uZic6ICdOb3QgV2hhdCB5b3Ugd2VyZSBsb29raW5nIGZvciA6KScsXG4gICAgfSxcbiAgfSxcblxuICBob21lOiB7XG4gICAgZ3Vlc3Q6IHtcbiAgICAgIGRvY3M6IHtcbiAgICAgICAgJ215ZG9jLm1kJzogJ1Rlc3RGaWxlJyxcbiAgICAgICAgJ215ZG9jMi5tZCc6ICdUZXN0RmlsZTInLFxuICAgICAgICAnbXlkb2MzLm1kJzogJ1Rlc3RGaWxlMycsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG5cbiAgcm9vdDp7XG4gICAgJy56c2hyYyc6ICdub3QgZXZlbiBjbG9zZSA6KScsXG4gICAgJy5vaC1teS16c2gnOiB7XG4gICAgICB0aGVtZXM6IHt9LFxuICAgIH0sXG4gIH0sXG59XG4iLCIvKipcbiAqIFNoZWxsIE9ubHlcbiAqIEB0eXBlIHtDbGFzc31cbiAqIEluaXQgdGhlIHNoZWxsIHdpdGggY29tbWFuZCBhbmQgZmlsZXN5c3RlbVxuICogQG1ldGhvZCBleGVjdXRlKCkgZXhwb3NlZCB0byBxdWVyeSB0aGUgU2hlbGwgd2l0aCBjb21tYW5kc1xuICovXG5nbG9iYWxbJ1Rlcm1seSddID0gcmVxdWlyZSgnLi9jbGFzc2VzL1NoZWxsJylcbiIsIihmdW5jdGlvbiAocm9vdCkge1xuXG4gIC8vIFN0b3JlIHNldFRpbWVvdXQgcmVmZXJlbmNlIHNvIHByb21pc2UtcG9seWZpbGwgd2lsbCBiZSB1bmFmZmVjdGVkIGJ5XG4gIC8vIG90aGVyIGNvZGUgbW9kaWZ5aW5nIHNldFRpbWVvdXQgKGxpa2Ugc2lub24udXNlRmFrZVRpbWVycygpKVxuICB2YXIgc2V0VGltZW91dEZ1bmMgPSBzZXRUaW1lb3V0O1xuXG4gIGZ1bmN0aW9uIG5vb3AoKSB7fVxuICBcbiAgLy8gUG9seWZpbGwgZm9yIEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kXG4gIGZ1bmN0aW9uIGJpbmQoZm4sIHRoaXNBcmcpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgZm4uYXBwbHkodGhpc0FyZywgYXJndW1lbnRzKTtcbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gUHJvbWlzZShmbikge1xuICAgIGlmICh0eXBlb2YgdGhpcyAhPT0gJ29iamVjdCcpIHRocm93IG5ldyBUeXBlRXJyb3IoJ1Byb21pc2VzIG11c3QgYmUgY29uc3RydWN0ZWQgdmlhIG5ldycpO1xuICAgIGlmICh0eXBlb2YgZm4gIT09ICdmdW5jdGlvbicpIHRocm93IG5ldyBUeXBlRXJyb3IoJ25vdCBhIGZ1bmN0aW9uJyk7XG4gICAgdGhpcy5fc3RhdGUgPSAwO1xuICAgIHRoaXMuX2hhbmRsZWQgPSBmYWxzZTtcbiAgICB0aGlzLl92YWx1ZSA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLl9kZWZlcnJlZHMgPSBbXTtcblxuICAgIGRvUmVzb2x2ZShmbiwgdGhpcyk7XG4gIH1cblxuICBmdW5jdGlvbiBoYW5kbGUoc2VsZiwgZGVmZXJyZWQpIHtcbiAgICB3aGlsZSAoc2VsZi5fc3RhdGUgPT09IDMpIHtcbiAgICAgIHNlbGYgPSBzZWxmLl92YWx1ZTtcbiAgICB9XG4gICAgaWYgKHNlbGYuX3N0YXRlID09PSAwKSB7XG4gICAgICBzZWxmLl9kZWZlcnJlZHMucHVzaChkZWZlcnJlZCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHNlbGYuX2hhbmRsZWQgPSB0cnVlO1xuICAgIFByb21pc2UuX2ltbWVkaWF0ZUZuKGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBjYiA9IHNlbGYuX3N0YXRlID09PSAxID8gZGVmZXJyZWQub25GdWxmaWxsZWQgOiBkZWZlcnJlZC5vblJlamVjdGVkO1xuICAgICAgaWYgKGNiID09PSBudWxsKSB7XG4gICAgICAgIChzZWxmLl9zdGF0ZSA9PT0gMSA/IHJlc29sdmUgOiByZWplY3QpKGRlZmVycmVkLnByb21pc2UsIHNlbGYuX3ZhbHVlKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdmFyIHJldDtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldCA9IGNiKHNlbGYuX3ZhbHVlKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgcmVqZWN0KGRlZmVycmVkLnByb21pc2UsIGUpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICByZXNvbHZlKGRlZmVycmVkLnByb21pc2UsIHJldCk7XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiByZXNvbHZlKHNlbGYsIG5ld1ZhbHVlKSB7XG4gICAgdHJ5IHtcbiAgICAgIC8vIFByb21pc2UgUmVzb2x1dGlvbiBQcm9jZWR1cmU6IGh0dHBzOi8vZ2l0aHViLmNvbS9wcm9taXNlcy1hcGx1cy9wcm9taXNlcy1zcGVjI3RoZS1wcm9taXNlLXJlc29sdXRpb24tcHJvY2VkdXJlXG4gICAgICBpZiAobmV3VmFsdWUgPT09IHNlbGYpIHRocm93IG5ldyBUeXBlRXJyb3IoJ0EgcHJvbWlzZSBjYW5ub3QgYmUgcmVzb2x2ZWQgd2l0aCBpdHNlbGYuJyk7XG4gICAgICBpZiAobmV3VmFsdWUgJiYgKHR5cGVvZiBuZXdWYWx1ZSA9PT0gJ29iamVjdCcgfHwgdHlwZW9mIG5ld1ZhbHVlID09PSAnZnVuY3Rpb24nKSkge1xuICAgICAgICB2YXIgdGhlbiA9IG5ld1ZhbHVlLnRoZW47XG4gICAgICAgIGlmIChuZXdWYWx1ZSBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgICAgICBzZWxmLl9zdGF0ZSA9IDM7XG4gICAgICAgICAgc2VsZi5fdmFsdWUgPSBuZXdWYWx1ZTtcbiAgICAgICAgICBmaW5hbGUoc2VsZik7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGVuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgZG9SZXNvbHZlKGJpbmQodGhlbiwgbmV3VmFsdWUpLCBzZWxmKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHNlbGYuX3N0YXRlID0gMTtcbiAgICAgIHNlbGYuX3ZhbHVlID0gbmV3VmFsdWU7XG4gICAgICBmaW5hbGUoc2VsZik7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmVqZWN0KHNlbGYsIGUpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHJlamVjdChzZWxmLCBuZXdWYWx1ZSkge1xuICAgIHNlbGYuX3N0YXRlID0gMjtcbiAgICBzZWxmLl92YWx1ZSA9IG5ld1ZhbHVlO1xuICAgIGZpbmFsZShzZWxmKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZpbmFsZShzZWxmKSB7XG4gICAgaWYgKHNlbGYuX3N0YXRlID09PSAyICYmIHNlbGYuX2RlZmVycmVkcy5sZW5ndGggPT09IDApIHtcbiAgICAgIFByb21pc2UuX2ltbWVkaWF0ZUZuKGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoIXNlbGYuX2hhbmRsZWQpIHtcbiAgICAgICAgICBQcm9taXNlLl91bmhhbmRsZWRSZWplY3Rpb25GbihzZWxmLl92YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBzZWxmLl9kZWZlcnJlZHMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGhhbmRsZShzZWxmLCBzZWxmLl9kZWZlcnJlZHNbaV0pO1xuICAgIH1cbiAgICBzZWxmLl9kZWZlcnJlZHMgPSBudWxsO1xuICB9XG5cbiAgZnVuY3Rpb24gSGFuZGxlcihvbkZ1bGZpbGxlZCwgb25SZWplY3RlZCwgcHJvbWlzZSkge1xuICAgIHRoaXMub25GdWxmaWxsZWQgPSB0eXBlb2Ygb25GdWxmaWxsZWQgPT09ICdmdW5jdGlvbicgPyBvbkZ1bGZpbGxlZCA6IG51bGw7XG4gICAgdGhpcy5vblJlamVjdGVkID0gdHlwZW9mIG9uUmVqZWN0ZWQgPT09ICdmdW5jdGlvbicgPyBvblJlamVjdGVkIDogbnVsbDtcbiAgICB0aGlzLnByb21pc2UgPSBwcm9taXNlO1xuICB9XG5cbiAgLyoqXG4gICAqIFRha2UgYSBwb3RlbnRpYWxseSBtaXNiZWhhdmluZyByZXNvbHZlciBmdW5jdGlvbiBhbmQgbWFrZSBzdXJlXG4gICAqIG9uRnVsZmlsbGVkIGFuZCBvblJlamVjdGVkIGFyZSBvbmx5IGNhbGxlZCBvbmNlLlxuICAgKlxuICAgKiBNYWtlcyBubyBndWFyYW50ZWVzIGFib3V0IGFzeW5jaHJvbnkuXG4gICAqL1xuICBmdW5jdGlvbiBkb1Jlc29sdmUoZm4sIHNlbGYpIHtcbiAgICB2YXIgZG9uZSA9IGZhbHNlO1xuICAgIHRyeSB7XG4gICAgICBmbihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgaWYgKGRvbmUpIHJldHVybjtcbiAgICAgICAgZG9uZSA9IHRydWU7XG4gICAgICAgIHJlc29sdmUoc2VsZiwgdmFsdWUpO1xuICAgICAgfSwgZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgICBpZiAoZG9uZSkgcmV0dXJuO1xuICAgICAgICBkb25lID0gdHJ1ZTtcbiAgICAgICAgcmVqZWN0KHNlbGYsIHJlYXNvbik7XG4gICAgICB9KTtcbiAgICB9IGNhdGNoIChleCkge1xuICAgICAgaWYgKGRvbmUpIHJldHVybjtcbiAgICAgIGRvbmUgPSB0cnVlO1xuICAgICAgcmVqZWN0KHNlbGYsIGV4KTtcbiAgICB9XG4gIH1cblxuICBQcm9taXNlLnByb3RvdHlwZVsnY2F0Y2gnXSA9IGZ1bmN0aW9uIChvblJlamVjdGVkKSB7XG4gICAgcmV0dXJuIHRoaXMudGhlbihudWxsLCBvblJlamVjdGVkKTtcbiAgfTtcblxuICBQcm9taXNlLnByb3RvdHlwZS50aGVuID0gZnVuY3Rpb24gKG9uRnVsZmlsbGVkLCBvblJlamVjdGVkKSB7XG4gICAgdmFyIHByb20gPSBuZXcgKHRoaXMuY29uc3RydWN0b3IpKG5vb3ApO1xuXG4gICAgaGFuZGxlKHRoaXMsIG5ldyBIYW5kbGVyKG9uRnVsZmlsbGVkLCBvblJlamVjdGVkLCBwcm9tKSk7XG4gICAgcmV0dXJuIHByb207XG4gIH07XG5cbiAgUHJvbWlzZS5hbGwgPSBmdW5jdGlvbiAoYXJyKSB7XG4gICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcnIpO1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIGlmIChhcmdzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHJlc29sdmUoW10pO1xuICAgICAgdmFyIHJlbWFpbmluZyA9IGFyZ3MubGVuZ3RoO1xuXG4gICAgICBmdW5jdGlvbiByZXMoaSwgdmFsKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgaWYgKHZhbCAmJiAodHlwZW9mIHZhbCA9PT0gJ29iamVjdCcgfHwgdHlwZW9mIHZhbCA9PT0gJ2Z1bmN0aW9uJykpIHtcbiAgICAgICAgICAgIHZhciB0aGVuID0gdmFsLnRoZW47XG4gICAgICAgICAgICBpZiAodHlwZW9mIHRoZW4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgdGhlbi5jYWxsKHZhbCwgZnVuY3Rpb24gKHZhbCkge1xuICAgICAgICAgICAgICAgIHJlcyhpLCB2YWwpO1xuICAgICAgICAgICAgICB9LCByZWplY3QpO1xuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGFyZ3NbaV0gPSB2YWw7XG4gICAgICAgICAgaWYgKC0tcmVtYWluaW5nID09PSAwKSB7XG4gICAgICAgICAgICByZXNvbHZlKGFyZ3MpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgICAgICByZWplY3QoZXgpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkrKykge1xuICAgICAgICByZXMoaSwgYXJnc1tpXSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG5cbiAgUHJvbWlzZS5yZXNvbHZlID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgaWYgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUuY29uc3RydWN0b3IgPT09IFByb21pc2UpIHtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUpIHtcbiAgICAgIHJlc29sdmUodmFsdWUpO1xuICAgIH0pO1xuICB9O1xuXG4gIFByb21pc2UucmVqZWN0ID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHJlamVjdCh2YWx1ZSk7XG4gICAgfSk7XG4gIH07XG5cbiAgUHJvbWlzZS5yYWNlID0gZnVuY3Rpb24gKHZhbHVlcykge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gdmFsdWVzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIHZhbHVlc1tpXS50aGVuKHJlc29sdmUsIHJlamVjdCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG5cbiAgLy8gVXNlIHBvbHlmaWxsIGZvciBzZXRJbW1lZGlhdGUgZm9yIHBlcmZvcm1hbmNlIGdhaW5zXG4gIFByb21pc2UuX2ltbWVkaWF0ZUZuID0gKHR5cGVvZiBzZXRJbW1lZGlhdGUgPT09ICdmdW5jdGlvbicgJiYgZnVuY3Rpb24gKGZuKSB7IHNldEltbWVkaWF0ZShmbik7IH0pIHx8XG4gICAgZnVuY3Rpb24gKGZuKSB7XG4gICAgICBzZXRUaW1lb3V0RnVuYyhmbiwgMCk7XG4gICAgfTtcblxuICBQcm9taXNlLl91bmhhbmRsZWRSZWplY3Rpb25GbiA9IGZ1bmN0aW9uIF91bmhhbmRsZWRSZWplY3Rpb25GbihlcnIpIHtcbiAgICBpZiAodHlwZW9mIGNvbnNvbGUgIT09ICd1bmRlZmluZWQnICYmIGNvbnNvbGUpIHtcbiAgICAgIGNvbnNvbGUud2FybignUG9zc2libGUgVW5oYW5kbGVkIFByb21pc2UgUmVqZWN0aW9uOicsIGVycik7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tY29uc29sZVxuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogU2V0IHRoZSBpbW1lZGlhdGUgZnVuY3Rpb24gdG8gZXhlY3V0ZSBjYWxsYmFja3NcbiAgICogQHBhcmFtIGZuIHtmdW5jdGlvbn0gRnVuY3Rpb24gdG8gZXhlY3V0ZVxuICAgKiBAZGVwcmVjYXRlZFxuICAgKi9cbiAgUHJvbWlzZS5fc2V0SW1tZWRpYXRlRm4gPSBmdW5jdGlvbiBfc2V0SW1tZWRpYXRlRm4oZm4pIHtcbiAgICBQcm9taXNlLl9pbW1lZGlhdGVGbiA9IGZuO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDaGFuZ2UgdGhlIGZ1bmN0aW9uIHRvIGV4ZWN1dGUgb24gdW5oYW5kbGVkIHJlamVjdGlvblxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBmbiBGdW5jdGlvbiB0byBleGVjdXRlIG9uIHVuaGFuZGxlZCByZWplY3Rpb25cbiAgICogQGRlcHJlY2F0ZWRcbiAgICovXG4gIFByb21pc2UuX3NldFVuaGFuZGxlZFJlamVjdGlvbkZuID0gZnVuY3Rpb24gX3NldFVuaGFuZGxlZFJlamVjdGlvbkZuKGZuKSB7XG4gICAgUHJvbWlzZS5fdW5oYW5kbGVkUmVqZWN0aW9uRm4gPSBmbjtcbiAgfTtcbiAgXG4gIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gUHJvbWlzZTtcbiAgfSBlbHNlIGlmICghcm9vdC5Qcm9taXNlKSB7XG4gICAgcm9vdC5Qcm9taXNlID0gUHJvbWlzZTtcbiAgfVxuXG59KSh0aGlzKTtcbiIsIihmdW5jdGlvbihzZWxmKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICBpZiAoc2VsZi5mZXRjaCkge1xuICAgIHJldHVyblxuICB9XG5cbiAgdmFyIHN1cHBvcnQgPSB7XG4gICAgc2VhcmNoUGFyYW1zOiAnVVJMU2VhcmNoUGFyYW1zJyBpbiBzZWxmLFxuICAgIGl0ZXJhYmxlOiAnU3ltYm9sJyBpbiBzZWxmICYmICdpdGVyYXRvcicgaW4gU3ltYm9sLFxuICAgIGJsb2I6ICdGaWxlUmVhZGVyJyBpbiBzZWxmICYmICdCbG9iJyBpbiBzZWxmICYmIChmdW5jdGlvbigpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIG5ldyBCbG9iKClcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIH1cbiAgICB9KSgpLFxuICAgIGZvcm1EYXRhOiAnRm9ybURhdGEnIGluIHNlbGYsXG4gICAgYXJyYXlCdWZmZXI6ICdBcnJheUJ1ZmZlcicgaW4gc2VsZlxuICB9XG5cbiAgaWYgKHN1cHBvcnQuYXJyYXlCdWZmZXIpIHtcbiAgICB2YXIgdmlld0NsYXNzZXMgPSBbXG4gICAgICAnW29iamVjdCBJbnQ4QXJyYXldJyxcbiAgICAgICdbb2JqZWN0IFVpbnQ4QXJyYXldJyxcbiAgICAgICdbb2JqZWN0IFVpbnQ4Q2xhbXBlZEFycmF5XScsXG4gICAgICAnW29iamVjdCBJbnQxNkFycmF5XScsXG4gICAgICAnW29iamVjdCBVaW50MTZBcnJheV0nLFxuICAgICAgJ1tvYmplY3QgSW50MzJBcnJheV0nLFxuICAgICAgJ1tvYmplY3QgVWludDMyQXJyYXldJyxcbiAgICAgICdbb2JqZWN0IEZsb2F0MzJBcnJheV0nLFxuICAgICAgJ1tvYmplY3QgRmxvYXQ2NEFycmF5XSdcbiAgICBdXG5cbiAgICB2YXIgaXNEYXRhVmlldyA9IGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuIG9iaiAmJiBEYXRhVmlldy5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihvYmopXG4gICAgfVxuXG4gICAgdmFyIGlzQXJyYXlCdWZmZXJWaWV3ID0gQXJyYXlCdWZmZXIuaXNWaWV3IHx8IGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuIG9iaiAmJiB2aWV3Q2xhc3Nlcy5pbmRleE9mKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopKSA+IC0xXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gbm9ybWFsaXplTmFtZShuYW1lKSB7XG4gICAgaWYgKHR5cGVvZiBuYW1lICE9PSAnc3RyaW5nJykge1xuICAgICAgbmFtZSA9IFN0cmluZyhuYW1lKVxuICAgIH1cbiAgICBpZiAoL1teYS16MC05XFwtIyQlJicqKy5cXF5fYHx+XS9pLnRlc3QobmFtZSkpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgY2hhcmFjdGVyIGluIGhlYWRlciBmaWVsZCBuYW1lJylcbiAgICB9XG4gICAgcmV0dXJuIG5hbWUudG9Mb3dlckNhc2UoKVxuICB9XG5cbiAgZnVuY3Rpb24gbm9ybWFsaXplVmFsdWUodmFsdWUpIHtcbiAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJykge1xuICAgICAgdmFsdWUgPSBTdHJpbmcodmFsdWUpXG4gICAgfVxuICAgIHJldHVybiB2YWx1ZVxuICB9XG5cbiAgLy8gQnVpbGQgYSBkZXN0cnVjdGl2ZSBpdGVyYXRvciBmb3IgdGhlIHZhbHVlIGxpc3RcbiAgZnVuY3Rpb24gaXRlcmF0b3JGb3IoaXRlbXMpIHtcbiAgICB2YXIgaXRlcmF0b3IgPSB7XG4gICAgICBuZXh0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHZhbHVlID0gaXRlbXMuc2hpZnQoKVxuICAgICAgICByZXR1cm4ge2RvbmU6IHZhbHVlID09PSB1bmRlZmluZWQsIHZhbHVlOiB2YWx1ZX1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoc3VwcG9ydC5pdGVyYWJsZSkge1xuICAgICAgaXRlcmF0b3JbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gaXRlcmF0b3JcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gaXRlcmF0b3JcbiAgfVxuXG4gIGZ1bmN0aW9uIEhlYWRlcnMoaGVhZGVycykge1xuICAgIHRoaXMubWFwID0ge31cblxuICAgIGlmIChoZWFkZXJzIGluc3RhbmNlb2YgSGVhZGVycykge1xuICAgICAgaGVhZGVycy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlLCBuYW1lKSB7XG4gICAgICAgIHRoaXMuYXBwZW5kKG5hbWUsIHZhbHVlKVxuICAgICAgfSwgdGhpcylcblxuICAgIH0gZWxzZSBpZiAoaGVhZGVycykge1xuICAgICAgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoaGVhZGVycykuZm9yRWFjaChmdW5jdGlvbihuYW1lKSB7XG4gICAgICAgIHRoaXMuYXBwZW5kKG5hbWUsIGhlYWRlcnNbbmFtZV0pXG4gICAgICB9LCB0aGlzKVxuICAgIH1cbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmFwcGVuZCA9IGZ1bmN0aW9uKG5hbWUsIHZhbHVlKSB7XG4gICAgbmFtZSA9IG5vcm1hbGl6ZU5hbWUobmFtZSlcbiAgICB2YWx1ZSA9IG5vcm1hbGl6ZVZhbHVlKHZhbHVlKVxuICAgIHZhciBvbGRWYWx1ZSA9IHRoaXMubWFwW25hbWVdXG4gICAgdGhpcy5tYXBbbmFtZV0gPSBvbGRWYWx1ZSA/IG9sZFZhbHVlKycsJyt2YWx1ZSA6IHZhbHVlXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZVsnZGVsZXRlJ10gPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgZGVsZXRlIHRoaXMubWFwW25vcm1hbGl6ZU5hbWUobmFtZSldXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgbmFtZSA9IG5vcm1hbGl6ZU5hbWUobmFtZSlcbiAgICByZXR1cm4gdGhpcy5oYXMobmFtZSkgPyB0aGlzLm1hcFtuYW1lXSA6IG51bGxcbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmhhcyA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5tYXAuaGFzT3duUHJvcGVydHkobm9ybWFsaXplTmFtZShuYW1lKSlcbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uKG5hbWUsIHZhbHVlKSB7XG4gICAgdGhpcy5tYXBbbm9ybWFsaXplTmFtZShuYW1lKV0gPSBub3JtYWxpemVWYWx1ZSh2YWx1ZSlcbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmZvckVhY2ggPSBmdW5jdGlvbihjYWxsYmFjaywgdGhpc0FyZykge1xuICAgIGZvciAodmFyIG5hbWUgaW4gdGhpcy5tYXApIHtcbiAgICAgIGlmICh0aGlzLm1hcC5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgICBjYWxsYmFjay5jYWxsKHRoaXNBcmcsIHRoaXMubWFwW25hbWVdLCBuYW1lLCB0aGlzKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmtleXMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaXRlbXMgPSBbXVxuICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwgbmFtZSkgeyBpdGVtcy5wdXNoKG5hbWUpIH0pXG4gICAgcmV0dXJuIGl0ZXJhdG9yRm9yKGl0ZW1zKVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUudmFsdWVzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGl0ZW1zID0gW11cbiAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24odmFsdWUpIHsgaXRlbXMucHVzaCh2YWx1ZSkgfSlcbiAgICByZXR1cm4gaXRlcmF0b3JGb3IoaXRlbXMpXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5lbnRyaWVzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGl0ZW1zID0gW11cbiAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24odmFsdWUsIG5hbWUpIHsgaXRlbXMucHVzaChbbmFtZSwgdmFsdWVdKSB9KVxuICAgIHJldHVybiBpdGVyYXRvckZvcihpdGVtcylcbiAgfVxuXG4gIGlmIChzdXBwb3J0Lml0ZXJhYmxlKSB7XG4gICAgSGVhZGVycy5wcm90b3R5cGVbU3ltYm9sLml0ZXJhdG9yXSA9IEhlYWRlcnMucHJvdG90eXBlLmVudHJpZXNcbiAgfVxuXG4gIGZ1bmN0aW9uIGNvbnN1bWVkKGJvZHkpIHtcbiAgICBpZiAoYm9keS5ib2R5VXNlZCkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBUeXBlRXJyb3IoJ0FscmVhZHkgcmVhZCcpKVxuICAgIH1cbiAgICBib2R5LmJvZHlVc2VkID0gdHJ1ZVxuICB9XG5cbiAgZnVuY3Rpb24gZmlsZVJlYWRlclJlYWR5KHJlYWRlcikge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVzb2x2ZShyZWFkZXIucmVzdWx0KVxuICAgICAgfVxuICAgICAgcmVhZGVyLm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVqZWN0KHJlYWRlci5lcnJvcilcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgZnVuY3Rpb24gcmVhZEJsb2JBc0FycmF5QnVmZmVyKGJsb2IpIHtcbiAgICB2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKVxuICAgIHZhciBwcm9taXNlID0gZmlsZVJlYWRlclJlYWR5KHJlYWRlcilcbiAgICByZWFkZXIucmVhZEFzQXJyYXlCdWZmZXIoYmxvYilcbiAgICByZXR1cm4gcHJvbWlzZVxuICB9XG5cbiAgZnVuY3Rpb24gcmVhZEJsb2JBc1RleHQoYmxvYikge1xuICAgIHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpXG4gICAgdmFyIHByb21pc2UgPSBmaWxlUmVhZGVyUmVhZHkocmVhZGVyKVxuICAgIHJlYWRlci5yZWFkQXNUZXh0KGJsb2IpXG4gICAgcmV0dXJuIHByb21pc2VcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlYWRBcnJheUJ1ZmZlckFzVGV4dChidWYpIHtcbiAgICB2YXIgdmlldyA9IG5ldyBVaW50OEFycmF5KGJ1ZilcbiAgICB2YXIgY2hhcnMgPSBuZXcgQXJyYXkodmlldy5sZW5ndGgpXG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHZpZXcubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNoYXJzW2ldID0gU3RyaW5nLmZyb21DaGFyQ29kZSh2aWV3W2ldKVxuICAgIH1cbiAgICByZXR1cm4gY2hhcnMuam9pbignJylcbiAgfVxuXG4gIGZ1bmN0aW9uIGJ1ZmZlckNsb25lKGJ1Zikge1xuICAgIGlmIChidWYuc2xpY2UpIHtcbiAgICAgIHJldHVybiBidWYuc2xpY2UoMClcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHZpZXcgPSBuZXcgVWludDhBcnJheShidWYuYnl0ZUxlbmd0aClcbiAgICAgIHZpZXcuc2V0KG5ldyBVaW50OEFycmF5KGJ1ZikpXG4gICAgICByZXR1cm4gdmlldy5idWZmZXJcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBCb2R5KCkge1xuICAgIHRoaXMuYm9keVVzZWQgPSBmYWxzZVxuXG4gICAgdGhpcy5faW5pdEJvZHkgPSBmdW5jdGlvbihib2R5KSB7XG4gICAgICB0aGlzLl9ib2R5SW5pdCA9IGJvZHlcbiAgICAgIGlmICghYm9keSkge1xuICAgICAgICB0aGlzLl9ib2R5VGV4dCA9ICcnXG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBib2R5ID09PSAnc3RyaW5nJykge1xuICAgICAgICB0aGlzLl9ib2R5VGV4dCA9IGJvZHlcbiAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5ibG9iICYmIEJsb2IucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYm9keSkpIHtcbiAgICAgICAgdGhpcy5fYm9keUJsb2IgPSBib2R5XG4gICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuZm9ybURhdGEgJiYgRm9ybURhdGEucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYm9keSkpIHtcbiAgICAgICAgdGhpcy5fYm9keUZvcm1EYXRhID0gYm9keVxuICAgICAgfSBlbHNlIGlmIChzdXBwb3J0LnNlYXJjaFBhcmFtcyAmJiBVUkxTZWFyY2hQYXJhbXMucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYm9keSkpIHtcbiAgICAgICAgdGhpcy5fYm9keVRleHQgPSBib2R5LnRvU3RyaW5nKClcbiAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5hcnJheUJ1ZmZlciAmJiBzdXBwb3J0LmJsb2IgJiYgaXNEYXRhVmlldyhib2R5KSkge1xuICAgICAgICB0aGlzLl9ib2R5QXJyYXlCdWZmZXIgPSBidWZmZXJDbG9uZShib2R5LmJ1ZmZlcilcbiAgICAgICAgLy8gSUUgMTAtMTEgY2FuJ3QgaGFuZGxlIGEgRGF0YVZpZXcgYm9keS5cbiAgICAgICAgdGhpcy5fYm9keUluaXQgPSBuZXcgQmxvYihbdGhpcy5fYm9keUFycmF5QnVmZmVyXSlcbiAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5hcnJheUJ1ZmZlciAmJiAoQXJyYXlCdWZmZXIucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYm9keSkgfHwgaXNBcnJheUJ1ZmZlclZpZXcoYm9keSkpKSB7XG4gICAgICAgIHRoaXMuX2JvZHlBcnJheUJ1ZmZlciA9IGJ1ZmZlckNsb25lKGJvZHkpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3Vuc3VwcG9ydGVkIEJvZHlJbml0IHR5cGUnKVxuICAgICAgfVxuXG4gICAgICBpZiAoIXRoaXMuaGVhZGVycy5nZXQoJ2NvbnRlbnQtdHlwZScpKSB7XG4gICAgICAgIGlmICh0eXBlb2YgYm9keSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICB0aGlzLmhlYWRlcnMuc2V0KCdjb250ZW50LXR5cGUnLCAndGV4dC9wbGFpbjtjaGFyc2V0PVVURi04JylcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9ib2R5QmxvYiAmJiB0aGlzLl9ib2R5QmxvYi50eXBlKSB7XG4gICAgICAgICAgdGhpcy5oZWFkZXJzLnNldCgnY29udGVudC10eXBlJywgdGhpcy5fYm9keUJsb2IudHlwZSlcbiAgICAgICAgfSBlbHNlIGlmIChzdXBwb3J0LnNlYXJjaFBhcmFtcyAmJiBVUkxTZWFyY2hQYXJhbXMucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYm9keSkpIHtcbiAgICAgICAgICB0aGlzLmhlYWRlcnMuc2V0KCdjb250ZW50LXR5cGUnLCAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkO2NoYXJzZXQ9VVRGLTgnKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHN1cHBvcnQuYmxvYikge1xuICAgICAgdGhpcy5ibG9iID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciByZWplY3RlZCA9IGNvbnN1bWVkKHRoaXMpXG4gICAgICAgIGlmIChyZWplY3RlZCkge1xuICAgICAgICAgIHJldHVybiByZWplY3RlZFxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuX2JvZHlCbG9iKSB7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLl9ib2R5QmxvYilcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9ib2R5QXJyYXlCdWZmZXIpIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG5ldyBCbG9iKFt0aGlzLl9ib2R5QXJyYXlCdWZmZXJdKSlcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9ib2R5Rm9ybURhdGEpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NvdWxkIG5vdCByZWFkIEZvcm1EYXRhIGJvZHkgYXMgYmxvYicpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShuZXcgQmxvYihbdGhpcy5fYm9keVRleHRdKSlcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLmFycmF5QnVmZmVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLl9ib2R5QXJyYXlCdWZmZXIpIHtcbiAgICAgICAgICByZXR1cm4gY29uc3VtZWQodGhpcykgfHwgUHJvbWlzZS5yZXNvbHZlKHRoaXMuX2JvZHlBcnJheUJ1ZmZlcilcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5ibG9iKCkudGhlbihyZWFkQmxvYkFzQXJyYXlCdWZmZXIpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnRleHQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciByZWplY3RlZCA9IGNvbnN1bWVkKHRoaXMpXG4gICAgICBpZiAocmVqZWN0ZWQpIHtcbiAgICAgICAgcmV0dXJuIHJlamVjdGVkXG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLl9ib2R5QmxvYikge1xuICAgICAgICByZXR1cm4gcmVhZEJsb2JBc1RleHQodGhpcy5fYm9keUJsb2IpXG4gICAgICB9IGVsc2UgaWYgKHRoaXMuX2JvZHlBcnJheUJ1ZmZlcikge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHJlYWRBcnJheUJ1ZmZlckFzVGV4dCh0aGlzLl9ib2R5QXJyYXlCdWZmZXIpKVxuICAgICAgfSBlbHNlIGlmICh0aGlzLl9ib2R5Rm9ybURhdGEpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjb3VsZCBub3QgcmVhZCBGb3JtRGF0YSBib2R5IGFzIHRleHQnKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLl9ib2R5VGV4dClcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoc3VwcG9ydC5mb3JtRGF0YSkge1xuICAgICAgdGhpcy5mb3JtRGF0YSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy50ZXh0KCkudGhlbihkZWNvZGUpXG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5qc29uID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy50ZXh0KCkudGhlbihKU09OLnBhcnNlKVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvLyBIVFRQIG1ldGhvZHMgd2hvc2UgY2FwaXRhbGl6YXRpb24gc2hvdWxkIGJlIG5vcm1hbGl6ZWRcbiAgdmFyIG1ldGhvZHMgPSBbJ0RFTEVURScsICdHRVQnLCAnSEVBRCcsICdPUFRJT05TJywgJ1BPU1QnLCAnUFVUJ11cblxuICBmdW5jdGlvbiBub3JtYWxpemVNZXRob2QobWV0aG9kKSB7XG4gICAgdmFyIHVwY2FzZWQgPSBtZXRob2QudG9VcHBlckNhc2UoKVxuICAgIHJldHVybiAobWV0aG9kcy5pbmRleE9mKHVwY2FzZWQpID4gLTEpID8gdXBjYXNlZCA6IG1ldGhvZFxuICB9XG5cbiAgZnVuY3Rpb24gUmVxdWVzdChpbnB1dCwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XG4gICAgdmFyIGJvZHkgPSBvcHRpb25zLmJvZHlcblxuICAgIGlmIChpbnB1dCBpbnN0YW5jZW9mIFJlcXVlc3QpIHtcbiAgICAgIGlmIChpbnB1dC5ib2R5VXNlZCkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdBbHJlYWR5IHJlYWQnKVxuICAgICAgfVxuICAgICAgdGhpcy51cmwgPSBpbnB1dC51cmxcbiAgICAgIHRoaXMuY3JlZGVudGlhbHMgPSBpbnB1dC5jcmVkZW50aWFsc1xuICAgICAgaWYgKCFvcHRpb25zLmhlYWRlcnMpIHtcbiAgICAgICAgdGhpcy5oZWFkZXJzID0gbmV3IEhlYWRlcnMoaW5wdXQuaGVhZGVycylcbiAgICAgIH1cbiAgICAgIHRoaXMubWV0aG9kID0gaW5wdXQubWV0aG9kXG4gICAgICB0aGlzLm1vZGUgPSBpbnB1dC5tb2RlXG4gICAgICBpZiAoIWJvZHkgJiYgaW5wdXQuX2JvZHlJbml0ICE9IG51bGwpIHtcbiAgICAgICAgYm9keSA9IGlucHV0Ll9ib2R5SW5pdFxuICAgICAgICBpbnB1dC5ib2R5VXNlZCA9IHRydWVcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy51cmwgPSBTdHJpbmcoaW5wdXQpXG4gICAgfVxuXG4gICAgdGhpcy5jcmVkZW50aWFscyA9IG9wdGlvbnMuY3JlZGVudGlhbHMgfHwgdGhpcy5jcmVkZW50aWFscyB8fCAnb21pdCdcbiAgICBpZiAob3B0aW9ucy5oZWFkZXJzIHx8ICF0aGlzLmhlYWRlcnMpIHtcbiAgICAgIHRoaXMuaGVhZGVycyA9IG5ldyBIZWFkZXJzKG9wdGlvbnMuaGVhZGVycylcbiAgICB9XG4gICAgdGhpcy5tZXRob2QgPSBub3JtYWxpemVNZXRob2Qob3B0aW9ucy5tZXRob2QgfHwgdGhpcy5tZXRob2QgfHwgJ0dFVCcpXG4gICAgdGhpcy5tb2RlID0gb3B0aW9ucy5tb2RlIHx8IHRoaXMubW9kZSB8fCBudWxsXG4gICAgdGhpcy5yZWZlcnJlciA9IG51bGxcblxuICAgIGlmICgodGhpcy5tZXRob2QgPT09ICdHRVQnIHx8IHRoaXMubWV0aG9kID09PSAnSEVBRCcpICYmIGJvZHkpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0JvZHkgbm90IGFsbG93ZWQgZm9yIEdFVCBvciBIRUFEIHJlcXVlc3RzJylcbiAgICB9XG4gICAgdGhpcy5faW5pdEJvZHkoYm9keSlcbiAgfVxuXG4gIFJlcXVlc3QucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBSZXF1ZXN0KHRoaXMsIHsgYm9keTogdGhpcy5fYm9keUluaXQgfSlcbiAgfVxuXG4gIGZ1bmN0aW9uIGRlY29kZShib2R5KSB7XG4gICAgdmFyIGZvcm0gPSBuZXcgRm9ybURhdGEoKVxuICAgIGJvZHkudHJpbSgpLnNwbGl0KCcmJykuZm9yRWFjaChmdW5jdGlvbihieXRlcykge1xuICAgICAgaWYgKGJ5dGVzKSB7XG4gICAgICAgIHZhciBzcGxpdCA9IGJ5dGVzLnNwbGl0KCc9JylcbiAgICAgICAgdmFyIG5hbWUgPSBzcGxpdC5zaGlmdCgpLnJlcGxhY2UoL1xcKy9nLCAnICcpXG4gICAgICAgIHZhciB2YWx1ZSA9IHNwbGl0LmpvaW4oJz0nKS5yZXBsYWNlKC9cXCsvZywgJyAnKVxuICAgICAgICBmb3JtLmFwcGVuZChkZWNvZGVVUklDb21wb25lbnQobmFtZSksIGRlY29kZVVSSUNvbXBvbmVudCh2YWx1ZSkpXG4gICAgICB9XG4gICAgfSlcbiAgICByZXR1cm4gZm9ybVxuICB9XG5cbiAgZnVuY3Rpb24gcGFyc2VIZWFkZXJzKHJhd0hlYWRlcnMpIHtcbiAgICB2YXIgaGVhZGVycyA9IG5ldyBIZWFkZXJzKClcbiAgICByYXdIZWFkZXJzLnNwbGl0KC9cXHI/XFxuLykuZm9yRWFjaChmdW5jdGlvbihsaW5lKSB7XG4gICAgICB2YXIgcGFydHMgPSBsaW5lLnNwbGl0KCc6JylcbiAgICAgIHZhciBrZXkgPSBwYXJ0cy5zaGlmdCgpLnRyaW0oKVxuICAgICAgaWYgKGtleSkge1xuICAgICAgICB2YXIgdmFsdWUgPSBwYXJ0cy5qb2luKCc6JykudHJpbSgpXG4gICAgICAgIGhlYWRlcnMuYXBwZW5kKGtleSwgdmFsdWUpXG4gICAgICB9XG4gICAgfSlcbiAgICByZXR1cm4gaGVhZGVyc1xuICB9XG5cbiAgQm9keS5jYWxsKFJlcXVlc3QucHJvdG90eXBlKVxuXG4gIGZ1bmN0aW9uIFJlc3BvbnNlKGJvZHlJbml0LCBvcHRpb25zKSB7XG4gICAgaWYgKCFvcHRpb25zKSB7XG4gICAgICBvcHRpb25zID0ge31cbiAgICB9XG5cbiAgICB0aGlzLnR5cGUgPSAnZGVmYXVsdCdcbiAgICB0aGlzLnN0YXR1cyA9ICdzdGF0dXMnIGluIG9wdGlvbnMgPyBvcHRpb25zLnN0YXR1cyA6IDIwMFxuICAgIHRoaXMub2sgPSB0aGlzLnN0YXR1cyA+PSAyMDAgJiYgdGhpcy5zdGF0dXMgPCAzMDBcbiAgICB0aGlzLnN0YXR1c1RleHQgPSAnc3RhdHVzVGV4dCcgaW4gb3B0aW9ucyA/IG9wdGlvbnMuc3RhdHVzVGV4dCA6ICdPSydcbiAgICB0aGlzLmhlYWRlcnMgPSBuZXcgSGVhZGVycyhvcHRpb25zLmhlYWRlcnMpXG4gICAgdGhpcy51cmwgPSBvcHRpb25zLnVybCB8fCAnJ1xuICAgIHRoaXMuX2luaXRCb2R5KGJvZHlJbml0KVxuICB9XG5cbiAgQm9keS5jYWxsKFJlc3BvbnNlLnByb3RvdHlwZSlcblxuICBSZXNwb25zZS5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IFJlc3BvbnNlKHRoaXMuX2JvZHlJbml0LCB7XG4gICAgICBzdGF0dXM6IHRoaXMuc3RhdHVzLFxuICAgICAgc3RhdHVzVGV4dDogdGhpcy5zdGF0dXNUZXh0LFxuICAgICAgaGVhZGVyczogbmV3IEhlYWRlcnModGhpcy5oZWFkZXJzKSxcbiAgICAgIHVybDogdGhpcy51cmxcbiAgICB9KVxuICB9XG5cbiAgUmVzcG9uc2UuZXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgcmVzcG9uc2UgPSBuZXcgUmVzcG9uc2UobnVsbCwge3N0YXR1czogMCwgc3RhdHVzVGV4dDogJyd9KVxuICAgIHJlc3BvbnNlLnR5cGUgPSAnZXJyb3InXG4gICAgcmV0dXJuIHJlc3BvbnNlXG4gIH1cblxuICB2YXIgcmVkaXJlY3RTdGF0dXNlcyA9IFszMDEsIDMwMiwgMzAzLCAzMDcsIDMwOF1cblxuICBSZXNwb25zZS5yZWRpcmVjdCA9IGZ1bmN0aW9uKHVybCwgc3RhdHVzKSB7XG4gICAgaWYgKHJlZGlyZWN0U3RhdHVzZXMuaW5kZXhPZihzdGF0dXMpID09PSAtMSkge1xuICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0ludmFsaWQgc3RhdHVzIGNvZGUnKVxuICAgIH1cblxuICAgIHJldHVybiBuZXcgUmVzcG9uc2UobnVsbCwge3N0YXR1czogc3RhdHVzLCBoZWFkZXJzOiB7bG9jYXRpb246IHVybH19KVxuICB9XG5cbiAgc2VsZi5IZWFkZXJzID0gSGVhZGVyc1xuICBzZWxmLlJlcXVlc3QgPSBSZXF1ZXN0XG4gIHNlbGYuUmVzcG9uc2UgPSBSZXNwb25zZVxuXG4gIHNlbGYuZmV0Y2ggPSBmdW5jdGlvbihpbnB1dCwgaW5pdCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHZhciByZXF1ZXN0ID0gbmV3IFJlcXVlc3QoaW5wdXQsIGluaXQpXG4gICAgICB2YXIgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcblxuICAgICAgeGhyLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgb3B0aW9ucyA9IHtcbiAgICAgICAgICBzdGF0dXM6IHhoci5zdGF0dXMsXG4gICAgICAgICAgc3RhdHVzVGV4dDogeGhyLnN0YXR1c1RleHQsXG4gICAgICAgICAgaGVhZGVyczogcGFyc2VIZWFkZXJzKHhoci5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSB8fCAnJylcbiAgICAgICAgfVxuICAgICAgICBvcHRpb25zLnVybCA9ICdyZXNwb25zZVVSTCcgaW4geGhyID8geGhyLnJlc3BvbnNlVVJMIDogb3B0aW9ucy5oZWFkZXJzLmdldCgnWC1SZXF1ZXN0LVVSTCcpXG4gICAgICAgIHZhciBib2R5ID0gJ3Jlc3BvbnNlJyBpbiB4aHIgPyB4aHIucmVzcG9uc2UgOiB4aHIucmVzcG9uc2VUZXh0XG4gICAgICAgIHJlc29sdmUobmV3IFJlc3BvbnNlKGJvZHksIG9wdGlvbnMpKVxuICAgICAgfVxuXG4gICAgICB4aHIub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZWplY3QobmV3IFR5cGVFcnJvcignTmV0d29yayByZXF1ZXN0IGZhaWxlZCcpKVxuICAgICAgfVxuXG4gICAgICB4aHIub250aW1lb3V0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJlamVjdChuZXcgVHlwZUVycm9yKCdOZXR3b3JrIHJlcXVlc3QgZmFpbGVkJykpXG4gICAgICB9XG5cbiAgICAgIHhoci5vcGVuKHJlcXVlc3QubWV0aG9kLCByZXF1ZXN0LnVybCwgdHJ1ZSlcblxuICAgICAgaWYgKHJlcXVlc3QuY3JlZGVudGlhbHMgPT09ICdpbmNsdWRlJykge1xuICAgICAgICB4aHIud2l0aENyZWRlbnRpYWxzID0gdHJ1ZVxuICAgICAgfVxuXG4gICAgICBpZiAoJ3Jlc3BvbnNlVHlwZScgaW4geGhyICYmIHN1cHBvcnQuYmxvYikge1xuICAgICAgICB4aHIucmVzcG9uc2VUeXBlID0gJ2Jsb2InXG4gICAgICB9XG5cbiAgICAgIHJlcXVlc3QuaGVhZGVycy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlLCBuYW1lKSB7XG4gICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKG5hbWUsIHZhbHVlKVxuICAgICAgfSlcblxuICAgICAgeGhyLnNlbmQodHlwZW9mIHJlcXVlc3QuX2JvZHlJbml0ID09PSAndW5kZWZpbmVkJyA/IG51bGwgOiByZXF1ZXN0Ll9ib2R5SW5pdClcbiAgICB9KVxuICB9XG4gIHNlbGYuZmV0Y2gucG9seWZpbGwgPSB0cnVlXG59KSh0eXBlb2Ygc2VsZiAhPT0gJ3VuZGVmaW5lZCcgPyBzZWxmIDogdGhpcyk7XG4iLCJtb2R1bGUuZXhwb3J0cz17XG4gIFwibmFtZVwiOiBcInRlcm1seS5qc1wiLFxuICBcInZlcnNpb25cIjogXCIyLjAuMFwiLFxuICBcImRlc2NyaXB0aW9uXCI6IFwiU2ltcGxlLCBFeHRlbnNpYmxlLCBMaWdodHdlaWdodCBKYXZhc2NyaXB0IEJyb3dzZXIgVGVybWluYWwgU2ltdWxhdG9yIVwiLFxuICBcIm1haW5cIjogXCJkaXN0L3Rlcm1seS5taW4uanNcIixcbiAgXCJzY3JpcHRzXCI6IHtcbiAgICBcInRlc3RcIjogXCJtb2NoYSAtLWNvbXBpbGVycyBiYWJlbC1jb3JlL3JlZ2lzdGVyIHRlc3RzL1wiLFxuICAgIFwiYnVpbGRcIjogXCJndWxwXCJcbiAgfSxcbiAgXCJrZXl3b3Jkc1wiOiBbXG4gICAgXCJ0ZXJtaW5hbFwiLFxuICAgIFwiamF2YXNjcmlwdFwiLFxuICAgIFwic2ltdWxhdG9yXCIsXG4gICAgXCJicm93c2VyXCIsXG4gICAgXCJwcmVzZW50YXRpb25cIixcbiAgICBcIm1vY2t1cFwiLFxuICAgIFwiZGVtb1wiLFxuICAgIFwiY2xpXCIsXG4gICAgXCJwcm9tcHRcIixcbiAgICBcImNvbW1hbmRzXCIsXG4gICAgXCJubyBkZXBlbmN5XCIsXG4gICAgXCJsaWdodHdlaWdodFwiLFxuICAgIFwianNcIixcbiAgICBcInZhbmlsbGFcIlxuICBdLFxuICBcInJlcG9zaXRvcnlcIjogXCJodHRwczovL2dpdGh1Yi5jb20vS2lya2hhbW1ldHovdGVybWx5LmpzXCIsXG4gIFwiYXV0aG9yXCI6IFwiU2ltb25lIENvcnNpXCIsXG4gIFwibGljZW5zZVwiOiBcIklTQ1wiLFxuICBcImRldkRlcGVuZGVuY2llc1wiOiB7XG4gICAgXCJiYWJlbFwiOiBcIl42LjUuMlwiLFxuICAgIFwiYmFiZWwtY29yZVwiOiBcIl42LjIxLjBcIixcbiAgICBcImJhYmVsLXBvbHlmaWxsXCI6IFwiXjYuMjIuMFwiLFxuICAgIFwiYmFiZWwtcHJlc2V0LWVzMjAxNVwiOiBcIl42LjE4LjBcIixcbiAgICBcImJhYmVsLXByZXNldC1zdGFnZS0zXCI6IFwiXjYuMTcuMFwiLFxuICAgIFwiYmFiZWxpZnlcIjogXCJeNy4zLjBcIixcbiAgICBcImJyb3dzZXJpZnlcIjogXCJeMTMuMy4wXCIsXG4gICAgXCJjaGFpXCI6IFwiXjMuNS4wXCIsXG4gICAgXCJjaGFsa1wiOiBcIl4xLjEuM1wiLFxuICAgIFwiZ3VscFwiOiBcIl4zLjkuMVwiLFxuICAgIFwiZ3VscC1yZW5hbWVcIjogXCJeMS4yLjJcIixcbiAgICBcImd1bHAtc291cmNlbWFwc1wiOiBcIl4yLjQuMFwiLFxuICAgIFwiZ3VscC11Z2xpZnlcIjogXCJeMi4wLjBcIixcbiAgICBcImd1bHAtdXRpbFwiOiBcIl4zLjAuOFwiLFxuICAgIFwibW9jaGFcIjogXCJeMy4yLjBcIixcbiAgICBcInByb21pc2UtcG9seWZpbGxcIjogXCJeNi4wLjJcIixcbiAgICBcInVnbGlmeS1qc1wiOiBcIl4yLjYuNFwiLFxuICAgIFwidXRpbHMtbWVyZ2VcIjogXCJeMS4wLjBcIixcbiAgICBcInZpbnlsLWJ1ZmZlclwiOiBcIl4xLjAuMFwiLFxuICAgIFwidmlueWwtc291cmNlLXN0cmVhbVwiOiBcIl4xLjEuMFwiLFxuICAgIFwid2F0Y2hpZnlcIjogXCJeMy44LjBcIixcbiAgICBcIndoYXR3Zy1mZXRjaFwiOiBcIl4yLjAuMlwiXG4gIH1cbn1cbiJdfQ==
