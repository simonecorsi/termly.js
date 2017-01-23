(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
'use strict';

/**
 * Shell Only
 * @type {Class}
 * Init the shell with command and filesystem
 * @method execute() exposed to query the Shell with commands
 */
global['Shell'] = require('./classes/Shell');

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./classes/Shell":6}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
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

},{"../configs/default-filesystem":8,"./File":3}],5:[function(require,module,exports){
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
     * @return Array of args as in C
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
     * @return JSON String with output
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
        return '-error shell: Command ' + parsed[0] + ' doesn\'t exist.\n';
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

},{"../configs/builtin-commands":7,"./Command":2}],6:[function(require,module,exports){
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

    /**
     * Create the virtual filesystem
     * @return reference to instance of @class Filesystem
     */
    var _this = _possibleConstructorReturn(this, (Shell.__proto__ || Object.getPrototypeOf(Shell)).call(this));

    _this.fs = new Filesystem(filesystem, _this);
    _this.user = user;
    _this.hostname = hostname;

    // Init builtin commands, @method in parent
    // pass shell reference
    _this.ShellCommands = _this.registerCommands(_this);
    _this.ShellCommands = _extends({}, _this.ShellCommands, _this.registerCommands(_this, commands));
    return _this;
  }

  /**
   * Pass control to Interpreter
   * @return output as [String]
   */


  _createClass(Shell, [{
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

},{"./Filesystem":4,"./Interpreter":5}],7:[function(require,module,exports){
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
    man: 'List of avaible commands',
    fn: function fn() {
      return 'Commands avaible: ' + Object.keys(this.shell.ShellCommands).join(', ');
    }
  },

  whoami: {
    name: 'whoami',
    type: 'builtin',
    man: 'Current user',
    fn: function fn() {
      return this.shell.user;
    }
  },

  about: {
    name: 'about',
    type: 'builtin',
    man: 'About this project',
    fn: function fn() {
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
    fn: function fn(path) {
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
    fn: function fn() {
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
    fn: function fn(args) {
      if (!args || !args[0]) throw new Error('man: no command provided.');
      var command = args[0];
      if (!this.shell.ShellCommands[command]) throw new Error('command doesn\'t exist.');
      if (!this.shell.ShellCommands[command].man) throw new Error('no manual entry for this command.');
      return this.shell.ShellCommands[command].man;
    }
  }
};

},{"../../package.json":9}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
module.exports={
  "name": "browser-terminal.js",
  "version": "2.0.0",
  "description": "Simple Browser Terminal in pure js, usable for web presentation of CLI tools and whatever you want it to do!",
  "main": "terminal.js",
  "scripts": {
    "test": "mocha --compilers babel-core/register tests/",
    "build": "npm run build:dev && npm run build:prod",
    "build:dev": "gulp",
    "build:prod": "gulp production"
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
    "babelify": "^7.3.0",
    "browserify": "^13.3.0",
    "chalk": "^1.1.3",
    "gulp": "^3.9.1",
    "gulp-rename": "^1.2.2",
    "gulp-sourcemaps": "^2.4.0",
    "gulp-uglify": "^2.0.0",
    "gulp-util": "^3.0.8",
    "uglify-js": "^2.6.4",
    "utils-merge": "^1.0.0",
    "vinyl-buffer": "^1.0.0",
    "vinyl-source-stream": "^1.1.0",
    "watchify": "^3.8.0"
  },
  "dependencies": {
    "babel": "^6.5.2",
    "babel-core": "^6.21.0",
    "babel-polyfill": "^6.22.0",
    "babel-preset-es2015": "^6.18.0",
    "babel-preset-stage-3": "^6.17.0",
    "babelify": "^7.3.0",
    "chai": "^3.5.0",
    "mocha": "^3.2.0"
  }
}

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJiaW4vYnJvd3Nlci1zaGVsbC5qcyIsImJpbi9jbGFzc2VzL0NvbW1hbmQuanMiLCJiaW4vY2xhc3Nlcy9GaWxlLmpzIiwiYmluL2NsYXNzZXMvRmlsZXN5c3RlbS5qcyIsImJpbi9jbGFzc2VzL0ludGVycHJldGVyLmpzIiwiYmluL2NsYXNzZXMvU2hlbGwuanMiLCJiaW4vY29uZmlncy9idWlsdGluLWNvbW1hbmRzLmpzIiwiYmluL2NvbmZpZ3MvZGVmYXVsdC1maWxlc3lzdGVtLmpzIiwicGFja2FnZS5qc29uIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7O0FDQUE7Ozs7OztBQU1BLE9BQU8sT0FBUCxJQUFrQixRQUFRLGlCQUFSLENBQWxCOzs7Ozs7Ozs7OztBQ05BOzs7Ozs7SUFNTSxPO0FBQ0oscUJBQXdFO0FBQUEsbUZBQUgsRUFBRztBQUFBLFFBQTFELElBQTBELFFBQTFELElBQTBEO0FBQUEsUUFBcEQsRUFBb0QsUUFBcEQsRUFBb0Q7QUFBQSx5QkFBaEQsSUFBZ0Q7QUFBQSxRQUFoRCxJQUFnRCw2QkFBekMsS0FBeUM7QUFBQSwwQkFBbEMsS0FBa0M7QUFBQSxRQUFsQyxLQUFrQyw4QkFBMUIsU0FBMEI7QUFBQSx3QkFBZixHQUFlO0FBQUEsUUFBZixHQUFlLDRCQUFULEVBQVM7O0FBQUE7O0FBQ3RFLFFBQUksT0FBTyxJQUFQLEtBQWdCLFFBQXBCLEVBQThCLE1BQU0sTUFBTSwrQkFBTixDQUFOO0FBQzlCLFFBQUksT0FBTyxFQUFQLEtBQWMsVUFBbEIsRUFBOEIsTUFBTSxNQUFNLHdDQUFOLENBQU47O0FBRTlCOzs7O0FBSUEsU0FBSyxFQUFMLEdBQVUsR0FBRyxJQUFILENBQVEsSUFBUixDQUFWO0FBQ0EsU0FBSyxJQUFMLEdBQVksSUFBWjtBQUNBLFNBQUssSUFBTCxHQUFZLElBQVo7QUFDQSxTQUFLLEdBQUwsR0FBVyxHQUFYOztBQUVBLFFBQUksS0FB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QUFFSCxrQkFBYztBQUNaLGNBQVE7QUFESTtBQUZYO0FBcEJVLENBQWpCOzs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXG4gKiBTaGVsbCBPbmx5XG4gKiBAdHlwZSB7Q2xhc3N9XG4gKiBJbml0IHRoZSBzaGVsbCB3aXRoIGNvbW1hbmQgYW5kIGZpbGVzeXN0ZW1cbiAqIEBtZXRob2QgZXhlY3V0ZSgpIGV4cG9zZWQgdG8gcXVlcnkgdGhlIFNoZWxsIHdpdGggY29tbWFuZHNcbiAqL1xuZ2xvYmFsWydTaGVsbCddID0gcmVxdWlyZSgnLi9jbGFzc2VzL1NoZWxsJylcbiIsIi8qKlxuICogQ29tbWFuZCBDbGFzc1xuICogQHBhcmFtIG5hbWUgW1N0cmluZ10sIGZuIFtGdW5jdGlvbl1cbiAqXG4gKiBkb24ndCBwYXNzIGFycm93IGZ1bmN0aW9uIGlmIHlvdSB3YW50IHRvIHVzZSB0aGlzIGluc2lkZSB5b3VyIGNvbW1hbmQgZnVuY3Rpb24gdG8gYWNjZXNzIHZhcmlvdXMgc2hhcmVkIHNoZWxsIG9iamVjdFxuICovXG5jbGFzcyBDb21tYW5kIHtcbiAgY29uc3RydWN0b3IoeyBuYW1lLCBmbiwgdHlwZSA9ICd1c3InLCBzaGVsbCA9IHVuZGVmaW5lZCwgbWFuID0gJyd9ID0ge30pe1xuICAgIGlmICh0eXBlb2YgbmFtZSAhPT0gJ3N0cmluZycpIHRocm93IEVycm9yKCdDb21tYW5kIG5hbWUgbXVzdCBiZSBhIHN0cmluZycpXG4gICAgaWYgKHR5cGVvZiBmbiAhPT0gJ2Z1bmN0aW9uJykgdGhyb3cgRXJyb3IoJ0NvbW1hbmQgZnVuY3Rpb24gbXVzdCBiZS4uLiBhIGZ1bmN0aW9uJylcblxuICAgIC8qKlxuICAgICAqIHVzZSB3aG9sZSBmdW5jdGlvbiBpbnN0ZWFkIG9mIGFycm93IGlmIHlvdSB3YW50IHRvIGFjY2Vzc1xuICAgICAqIGNpcmN1bGFyIHJlZmVyZW5jZSBvZiBDb21tYW5kXG4gICAgICovXG4gICAgdGhpcy5mbiA9IGZuLmJpbmQodGhpcylcbiAgICB0aGlzLm5hbWUgPSBuYW1lXG4gICAgdGhpcy50eXBlID0gdHlwZVxuICAgIHRoaXMubWFuID0gbWFuXG5cbiAgICBpZiAoc2hlbGwpIHtcbiAgICAgIHRoaXMuc2hlbGwgPSBzaGVsbFxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBEaXNwYXRjaCBDb21tYW5kIEV4ZWN1dGlvblxuICAgKlxuICAgKiBAdGlwIGRvbid0IHVzZSBhcnJvdyBmdW5jdGlvbiBpbiB5b3UgY29tbWFuZCBpZiB5b3Ugd2FudCB0aGUgYXJndW1lbnRzXG4gICAqIG5laXRoZXIgc3VwZXIgYW5kIGFyZ3VtZW50cyBnZXQgYmluZGVkIGluIEFGLlxuICAgKi9cbiAgZXhlYyhhcmdzID0gW10pIHtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoYXJncykpIHRocm93IEVycm9yKCdDb21tYW5kIGV4ZWMgYXJncyBtdXN0IGJlIGluIGFuIGFycmF5JylcbiAgICBpZiAoYXJncy5sZW5ndGgpIHJldHVybiB0aGlzLmZuKGFyZ3MpXG4gICAgcmV0dXJuIHRoaXMuZm4oKVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ29tbWFuZFxuIiwiLyoqXG4gKiBAY2xhc3MgU2luZ2xlIEZpbGUgQ2xhc3NcbiAqIFNpbXVsYXRlIGZpbGUgcHJvcGVydGllc1xuICovXG5jbGFzcyBGaWxlIHtcbiAgY29uc3RydWN0b3IoeyBuYW1lID0gJycsIHR5cGUgPSAnZmlsZScsIGNvbnRlbnQgPSAnJ30gPSB7fSkge1xuICAgIHRoaXMudWlkID0gdGhpcy5nZW5VaWQoKVxuICAgIHRoaXMubmFtZSA9IG5hbWVcbiAgICB0aGlzLnR5cGUgPSB0eXBlXG4gICAgdGhpcy5jb250ZW50ID0gY29udGVudFxuICAgIHRoaXMudXNlciA9ICdyb290J1xuICAgIHRoaXMuZ3JvdXAgPSAncm9vdCdcblxuICAgIGlmICh0aGlzLnR5cGUgPT09ICdmaWxlJykge1xuICAgICAgdGhpcy5wZXJtaXNzaW9uID0gJ3J3eHItLXItLSdcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5wZXJtaXNzaW9uID0gJ2Ryd3hyLXhyLXgnXG4gICAgfVxuXG4gIH1cblxuICBnZW5VaWQoKSB7XG4gICAgZnVuY3Rpb24gczQoKSB7XG4gICAgICByZXR1cm4gTWF0aC5mbG9vcigoMSArIE1hdGgucmFuZG9tKCkpICogMHgxMDAwMClcbiAgICAgICAgLnRvU3RyaW5nKDE2KVxuICAgICAgICAuc3Vic3RyaW5nKDEpO1xuICAgIH1cbiAgICByZXR1cm4gczQoKSArIHM0KCkgKyAnLScgKyBzNCgpICsgJy0nICsgczQoKSArICctJyArXG4gICAgICBzNCgpICsgJy0nICsgczQoKSArIHM0KCkgKyBzNCgpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRmlsZVxuIiwiY29uc3QgREVGQVVMVF9GUyA9IHJlcXVpcmUoJy4uL2NvbmZpZ3MvZGVmYXVsdC1maWxlc3lzdGVtJylcbmNvbnN0IEZpbGUgPSByZXF1aXJlKCcuL0ZpbGUnKVxuXG4vKipcbiAqIEBjbGFzcyBWaXJ0dWFsIEZpbGVzeXN0ZW1cbiAqIFJlcHJlc2VudGVkIGFzIGFuIG9iamVjdCBvZiBub2Rlc1xuICovXG5jbGFzcyBGaWxlc3lzdGVtIHtcbiAgY29uc3RydWN0b3IoZnMgPSBERUZBVUxUX0ZTLCBzaGVsbCA9IHt9KSB7XG4gICAgdGhpcy5zaGVsbCA9IHNoZWxsXG4gICAgaWYgKHR5cGVvZiBmcyAhPT0gJ29iamVjdCcgfHwgQXJyYXkuaXNBcnJheShmcykpIHRocm93IG5ldyBFcnJvcignVmlydHVhbCBGaWxlc3lzdGVtIHByb3ZpZGVkIG5vdCB2YWxpZCwgaW5pdGlhbGl6YXRpb24gZmFpbGVkLicpXG5cbiAgICAvLyBOb3QgQnkgUmVmZXJlbmNlLlxuICAgIC8vIEhBQ0s6IE9iamVjdCBhc3NpZ24gcmVmdXNlIHRvIHdvcmsgYXMgaW50ZW5kZWQuXG4gICAgZnMgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGZzKSlcbiAgICB0aGlzLkZpbGVTeXN0ZW0gPSB0aGlzLmluaXRGcyhmcylcblxuICAgIC8vIENXRCBmb3IgY29tbWFuZHMgdXNhZ2VcbiAgICB0aGlzLmN3ZCA9IFsnLyddXG4gIH1cblxuICAvKipcbiAgICogSW5pdCAmIFBhc3MgQ29udHJvbCB0byByZWN1cnJzaXZlIGZ1bmN0aW9uXG4gICAqIEByZXR1cm4gbmV3IEZpbGVzeXN0ZW0gYXMgbm9kZXMgb2YgbXVsdGlwbGUgQGNsYXNzIEZpbGVcbiAgICovXG4gIGluaXRGcyhmcykge1xuICAgIHRoaXMuYnVpbGRWaXJ0dWFsRnMoZnMpXG4gICAgcmV0dXJuIGZzXG4gIH1cblxuICAvKipcbiAgICogVHJhdmVyc2UgYWxsIG5vZGUgYW5kIGJ1aWxkIGEgdmlydHVhbCByZXByZXNlbnRhdGlvbiBvZiBhIGZpbGVzeXN0ZW1cbiAgICogRWFjaCBub2RlIGlzIGEgRmlsZSBpbnN0YW5jZS5cbiAgICogQHBhcmFtIE1vY2tlZCBGaWxlc3lzdGVtIGFzIE9iamVjdFxuICAgKlxuICAgKi9cbiAgYnVpbGRWaXJ0dWFsRnMob2JqKSB7XG4gICAgZm9yIChsZXQga2V5IGluIG9iaikge1xuICAgICAgaWYgKG9iai5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgIGlmICh0eXBlb2Ygb2JqW2tleV0gPT09ICdvYmplY3QnICYmICFBcnJheS5pc0FycmF5KG9ialtrZXldKSkge1xuICAgICAgICAgIG9ialtrZXldID0gbmV3IEZpbGUoeyBuYW1lOiBrZXksIGNvbnRlbnQ6IG9ialtrZXldLCB0eXBlOiAnZGlyJyB9KVxuICAgICAgICAgIHRoaXMuYnVpbGRWaXJ0dWFsRnMob2JqW2tleV0uY29udGVudClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBvYmpba2V5XSA9IG5ldyBGaWxlKHsgbmFtZToga2V5LCBjb250ZW50OiBvYmpba2V5XSB9KVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhIHN0cmluZ2VkIHBhdGggYW5kIHJldHVybiBhcyBhcnJheVxuICAgKiB0aHJvdyBlcnJvciBpZiBwYXRoIGZvcm1hdCBpcyBpbnZhbGlkXG4gICAqIFJlbGF0aXZlIFBhdGggZ2V0cyBjb252ZXJ0ZWQgdXNpbmcgQ3VycmVudCBXb3JraW5nIERpcmVjdG9yeVxuICAgKiBAcGFyYW0gcGF0aCB7U3RyaW5nfVxuICAgKiBAcmV0dXJuIEFycmF5XG4gICAqL1xuICBwYXRoU3RyaW5nVG9BcnJheShwYXRoID0gJycpIHtcbiAgICBpZiAoIXBhdGgubGVuZ3RoKSB0aHJvdyBuZXcgRXJyb3IoJ1BhdGggY2Fubm90IGJlIGVtcHR5JylcblxuICAgIC8vIENoZWNrIGZvciBpbnZhbGlkIHBhdGgsIGVnLiB0d28rIC8vIGluIGEgcm93XG4gICAgaWYgKHBhdGgubWF0Y2goL1xcL3syLH0vZykpIHRocm93IG5ldyBFcnJvcihgLWludmFsaWQgcGF0aDogJHtwYXRofWApXG5cbiAgICAvLyBGb3JtYXQgYW5kIENvbXBvc2VyIGFycmF5XG4gICAgbGV0IHBhdGhBcnJheSA9IHBhdGguc3BsaXQoJy8nKVxuICAgIGlmIChwYXRoQXJyYXlbMF0gPT09ICcnKSBwYXRoQXJyYXlbMF0gPSAnLydcbiAgICBpZiAocGF0aEFycmF5WzBdID09PSAnLicpIHBhdGhBcnJheS5zaGlmdCgpXG4gICAgaWYocGF0aEFycmF5W3BhdGhBcnJheS5sZW5ndGggLSAxXSA9PT0gJycpIHBhdGhBcnJheS5wb3AoKVxuICAgIC8vIGhhbmRsZSByZWxhdGl2ZSBwYXRoIHdpdGggY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeVxuICAgIGlmIChwYXRoQXJyYXlbMF0gIT09ICcvJykge1xuICAgICAgcGF0aEFycmF5ID0gdGhpcy5jd2QuY29uY2F0KHBhdGhBcnJheSlcbiAgICB9XG4gICAgcmV0dXJuIHBhdGhBcnJheVxuICB9XG5cbiAgLyoqXG4gICAqIFBhdGggZnJvbSBhcnJheSB0byBTdHJpbmdcbiAgICogRm9yIHByZXNlbnRhdGlvbmFsIHB1cnBvc2UuXG4gICAqIFRPRE9cbiAgICogQHBhcmFtIHBhdGggW0FycmF5XVxuICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAqL1xuICBwYXRoQXJyYXlUb1N0cmluZyhwYXRoID0gW10pIHtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkocGF0aCkpIHRocm93IG5ldyBFcnJvcignLWZhdGFsIGZpbGVzeXN0ZW06IHBhdGggbXVzdCBiZSBhbiBhcnJheScpXG4gICAgaWYgKCFwYXRoLmxlbmd0aCkgdGhyb3cgbmV3IEVycm9yKCctaW52YWxpZCBmaWxlc3lzdGVtOiBwYXRoIG5vdCBwcm92aWRlZCcpXG4gICAgbGV0IG91dHB1dCA9IHBhdGguam9pbignLycpXG4gICAgLy8gcmVtb3ZlIC8gbXVsdGlwbGUgb2NjdXJyZW5jZVxuICAgIHJldHVybiBvdXRwdXQucmVwbGFjZSgvXFwvezIsfS9nLCAnLycpXG4gIH1cblxuICAvKipcbiAgICogTHVrZS4uIGZpbGVXYWxrZXJcbiAgICogQWNjZXB0cyBvbmx5IEFic29sdXRlIFBhdGgsIHlvdSBtdXN0IGNvbnZlcnQgcGF0aHMgYmVmb3JlIGNhbGxpbmcgdXNpbmcgcGF0aFN0cmluZ1RvQXJyYXlcbiAgICogQHBhcmFtIGNiIGV4ZWN1dGVkIG9uIGVhY2ggZmlsZSBmb3VuZFxuICAgKiBAcGFyYW0gZnMgW1NoZWxsIFZpcnR1YWwgRmlsZXN5c3RlbV1cbiAgICovXG4gIGZpbGVXYWxrZXIocGF0aCA9IFsnLyddLCBmcyA9IHRoaXMuRmlsZVN5c3RlbSl7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KHBhdGgpKSB0aHJvdyBuZXcgRXJyb3IoJ1BhdGggbXVzdCBiZSBhbiBhcnJheSBvZiBub2RlcywgdXNlIEZpbGVzeXN0ZW0ucGF0aFN0cmluZ1RvQXJyYXkoe3N0cmluZ30pJylcblxuICAgIC8vIGF2b2lkIG1vZGlmeWluZyBleHRlcm5hbCBwYXRoIHJlZmVyZW5jZVxuICAgIHBhdGggPSBwYXRoLnNsaWNlKDApXG5cbiAgICAvLyBUT0RPOlxuICAgIC8vICBDaG9vc2U6XG4gICAgLy8gICAgLSBHbyBmdWxsIHB1cmVcbiAgICAvLyAgICAtIFdvcmsgb24gdGhlIHJlZmVyZW5jZSBvZiB0aGUgYWN0dWFsIG5vZGVcbiAgICAvLyBmcyA9IE9iamVjdC5hc3NpZ24oZnMsIHt9KVxuXG4gICAgLy8gRXhpdCBDb25kaXRpb25cbiAgICBpZiAoIXBhdGgubGVuZ3RoKSByZXR1cm4gZnNcblxuICAgIC8vIEdldCBjdXJyZW50IG5vZGVcbiAgICBsZXQgbm9kZSA9IHBhdGguc2hpZnQoKVxuXG4gICAgLy8gR28gZGVlcGVyIGlmIGl0J3Mgbm90IHRoZSByb290IGRpclxuICAgIGlmIChub2RlICE9PSAnLycpIHtcbiAgICAgIC8vIGNoZWNrIGlmIG5vZGUgZXhpc3RcbiAgICAgIGlmIChmc1tub2RlXSkge1xuICAgICAgICAvLyByZXR1cm4gZmlsZSBvciBmb2xkZXJcbiAgICAgICAgZnMgPSBmc1tub2RlXS50eXBlID09PSAnZGlyJyA/IGZzW25vZGVdLmNvbnRlbnQgOiBmc1tub2RlXVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGaWxlIGRvZXNuXFwndCBleGlzdCcpXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmZpbGVXYWxrZXIocGF0aCwgZnMpXG4gIH1cblxuICAvKipcbiAgICogdHJhdmVyc2VGaWxlc1xuICAgKiBhY2Nlc3NpbmcgYWxsIGZpbGUgYXQgbGVhc3Qgb25jZVxuICAgKiBjYWxsaW5nIHByb3ZpZGVkIGNhbGxiYWNrIG9uIGVhY2hcbiAgICogQHBhcmFtIGNiIGV4ZWN1dGVkIG9uIGVhY2ggZmlsZSBmb3VuZFxuICAgKiBAcGFyYW0gZnMgW1NoZWxsIFZpcnR1YWwgRmlsZXN5c3RlbV1cbiAgICovXG4gIHRyYXZlcnNlRmlsZXMoY2IgPSAoKT0+e30sIGZzID0gdGhpcy5GaWxlU3lzdGVtKXtcbiAgICBjb25zdCBzZWxmID0gdGhpcy50cmF2ZXJzZUZpbGVzXG4gICAgZm9yIChsZXQgbm9kZSBpbiBmcykge1xuICAgICAgaWYgKGZzLmhhc093blByb3BlcnR5KG5vZGUpKSB7XG4gICAgICAgIGlmIChmc1tub2RlXS50eXBlID09PSAnZGlyJykgdGhpcy50cmF2ZXJzZUZpbGVzKGNiLCBmc1tub2RlXS5jb250ZW50KVxuICAgICAgICBlbHNlIGNiKGZzW25vZGVdKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiB0cmF2ZXJzZURpcnNcbiAgICogYWNjZXNzaW5nIGFsbCBkaXJlY3RvcnkgYXQgbGVhc3Qgb25jZVxuICAgKiBjYWxsaW5nIHByb3ZpZGVkIGNhbGxiYWNrIG9uIGVhY2hcbiAgICogQHBhcmFtIGNiIGV4ZWN1dGVkIG9uIGVhY2ggZmlsZSBmb3VuZFxuICAgKiBAcGFyYW0gZnMgW1NoZWxsIFZpcnR1YWwgRmlsZXN5c3RlbV1cbiAgICovXG4gIHRyYXZlcnNlRGlycyhjYiA9ICgpPT57fSwgZnMgPSB0aGlzLkZpbGVTeXN0ZW0pe1xuICAgIGZvciAobGV0IG5vZGUgaW4gZnMpIHtcbiAgICAgIGlmIChmcy5oYXNPd25Qcm9wZXJ0eShub2RlKSkge1xuICAgICAgICBpZiAoZnNbbm9kZV0udHlwZSA9PT0gJ2RpcicpIHtcbiAgICAgICAgICBjYihmc1tub2RlXSlcbiAgICAgICAgICB0aGlzLnRyYXZlcnNlRGlycyhjYiwgZnNbbm9kZV0uY29udGVudClcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgRGlyZWN0b3J5IE5vZGVcbiAgICogUGFzc2VkIGFzIFJlZmVyZW5jZSBvciBJbnN0YW5jZSxcbiAgICogZGVwZW5kIGJ5IGEgbGluZSBpbiBAbWV0aG9kIGZpbGVXYWxrZXIsIHNlZSBjb21tZW50IHRoZXJlLlxuICAgKiBAcmV0dXJuIERpcmVjdG9yeSBOb2RlIE9iamVjdFxuICAgKi9cbiAgZ2V0Tm9kZShwYXRoID0gJycsIGZpbGVUeXBlKSB7XG4gICAgaWYgKHR5cGVvZiBwYXRoICE9PSAnc3RyaW5nJykgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGlucHV0LicpXG4gICAgbGV0IHBhdGhBcnJheSwgbm9kZVxuXG4gICAgdHJ5IHtcbiAgICAgIHBhdGhBcnJheSA9IHRoaXMucGF0aFN0cmluZ1RvQXJyYXkocGF0aClcbiAgICAgIG5vZGUgPSB0aGlzLmZpbGVXYWxrZXIocGF0aEFycmF5KVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRocm93IGVcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBFUlJPUiBIQU5ETElOR1xuICAgICAqL1xuXG4gICAgLy8gSGFuZGxlIExpc3Qgb24gYSBmaWxlXG4gICAgaWYgKGZpbGVUeXBlID09PSAnZGlyJyAmJiBub2RlLnR5cGUgPT09ICdmaWxlJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJdHMgYSBmaWxlIG5vdCBhIGRpcmVjdG9yeScpXG4gICAgfVxuICAgIC8vIEhhbmRsZSByZWFkZmlsZSBvbiBhIGRpclxuICAgIGlmIChmaWxlVHlwZSA9PT0gJ2ZpbGUnICYmIG5vZGUudHlwZSA9PT0gJ2RpcicpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSXRzIGEgZGlyZWN0b3J5IG5vdCBhIGZpbGUnKVxuICAgIH1cbiAgICAvLyBoYW5kbGUgcmVhZGZpbGUgb24gbm9uIGV4aXN0aW5nIGZpbGVcbiAgICBpZiAoZmlsZVR5cGUgPT09ICdmaWxlJyAmJiAhbm9kZS50eXBlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgZmlsZSBwYXRoJylcbiAgICB9XG4gICAgLy8gaGFuZGxlIGludmFsaWQgLyBub25leGlzdGluZyBwYXRoXG4gICAgaWYgKCFub2RlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgcGF0aCwgZmlsZS9mb2xkZXIgZG9lc25cXCd0IGV4aXN0JylcbiAgICB9XG5cbiAgICByZXR1cm4geyBwYXRoLCBwYXRoQXJyYXkgLCBub2RlIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDaGFuZ2UgQ3VycmVudCBXb3JraW5nIERpcmVjdG9yeSBHcmFjZWZ1bGx5XG4gICAqIEByZXR1cm4gTWVzc2FnZSBTdHJpbmcuXG4gICAqL1xuICBjaGFuZ2VEaXIocGF0aCA9ICcnKSB7XG4gICAgbGV0IHJlc3VsdFxuICAgIHRyeSB7XG4gICAgICByZXN1bHQgPSB0aGlzLmdldE5vZGUocGF0aCwgJ2RpcicpXG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICB0aHJvdyBlcnJcbiAgICB9XG4gICAgdGhpcy5jd2QgPSByZXN1bHQucGF0aEFycmF5XG4gICAgcmV0dXJuIGBjaGFuZ2VkIGRpcmVjdG9yeS5gXG4gIH1cblxuICAvKipcbiAgICogTGlzdCBDdXJyZW50IFdvcmtpbmcgRGlyZWN0b3J5IEZpbGVzXG4gICAqIEByZXR1cm4ge31cbiAgICovXG4gIGxpc3REaXIocGF0aCA9ICcnKSB7XG4gICAgbGV0IHJlc3VsdFxuICAgIHRyeSB7XG4gICAgICByZXN1bHQgPSB0aGlzLmdldE5vZGUocGF0aCwgJ2RpcicpXG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICB0aHJvdyBlcnJcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdC5ub2RlXG4gIH1cblxuICByZWFkRmlsZShwYXRoID0gJycpIHtcbiAgICBsZXQgcmVzdWx0XG4gICAgdHJ5IHtcbiAgICAgIHJlc3VsdCA9IHRoaXMuZ2V0Tm9kZShwYXRoLCAnZmlsZScpXG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICB0aHJvdyBlcnJcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdC5ub2RlXG4gIH1cblxuICBnZXRDdXJyZW50RGlyZWN0b3J5KCkge1xuICAgIGxldCBjd2RBc1N0cmluZ1xuICAgIHRyeSB7XG4gICAgICBjd2RBc1N0cmluZyA9IHRoaXMucGF0aEFycmF5VG9TdHJpbmcodGhpcy5jd2QpXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuICctaW52YWxpZCBmaWxlc3lzdGVtOiBBbiBlcnJvciBvY2N1cmVkIHdoaWxlIHBhcnNpbmcgY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeSB0byBzdHJpbmcuJ1xuICAgIH1cbiAgICByZXR1cm4gY3dkQXNTdHJpbmdcbiAgfVxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gRmlsZXN5c3RlbVxuIiwiY29uc3QgQ29tbWFuZCA9IHJlcXVpcmUoJy4vQ29tbWFuZCcpXG5cbi8qKlxuICpcbiAqIEludGVycHJldGVyXG4gKiBJcyB0aGUgcGFyZW50IENsYXNzIG9mIHRoZSBNYWluIFNoZWxsIENsYXNzXG4gKiAtIFRoaXMgY2xhc3MgaXMgdGhlIG9uZSB0aGF0IHBhcnNlIGFuZCBydW4gZXhlYyBvZiBjb21tYW5kXG4gKiAtIFBhcnNpbmcgb2YgYnVpbHRpbiBjb21tYW5kIG9uIHJ1bnRpbWUgaGFwcGVuIGhlcmVcbiAqIC0gV2lsbCBwYXJzZSBjdXN0b20gdXNlciBDb21tYW5kIHRvb1xuICpcbiAqL1xuY2xhc3MgSW50ZXJwcmV0ZXIge1xuXG4gIC8qKlxuICAgKiBQYXJzZSBDb21tYW5kXG4gICAqIEByZXR1cm4gQXJyYXkgb2YgYXJncyBhcyBpbiBDXG4gICAqL1xuICBwYXJzZShjbWQpIHtcbiAgICBpZiAodHlwZW9mIGNtZCAhPT0gJ3N0cmluZycpIHRocm93IG5ldyBFcnJvcignQ29tbWFuZCBtdXN0IGJlIGEgc3RyaW5nJylcbiAgICBpZiAoIWNtZC5sZW5ndGgpIHRocm93IG5ldyBFcnJvcignQ29tbWFuZCBpcyBlbXB0eScpXG4gICAgcmV0dXJuIGNtZC5zcGxpdCgnICcpXG4gIH1cblxuICAvKipcbiAgICogRm9ybWF0IE91dHB1dFxuICAgKiByZXR1cm4gZXJyb3IgaWYgZnVuY3Rpb24gaXMgcmV0dXJuZWRcbiAgICogY29udmVydCBldmVyeXRoaW5nIGVsc2UgdG8ganNvbi5cbiAgICogQHJldHVybiBKU09OIHBhcnNlZFxuICAgKi9cbiAgZm9ybWF0KG91dHB1dCkge1xuICAgIGlmICh0eXBlb2Ygb3V0cHV0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gJy1pbnZhbGlkIGNvbW1hbmQ6IENvbW1hbmQgcmV0dXJuZWQgaW52YWxpZCBkYXRhIHR5cGUuJ1xuICAgIH1cbiAgICBpZiAob3V0cHV0ID09PSB1bmRlZmluZWQgfHwgdHlwZW9mIG91dHB1dCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHJldHVybiAnLWludmFsaWQgY29tbWFuZDogQ29tbWFuZCByZXR1cm5lZCBubyBkYXRhLidcbiAgICB9XG4gICAgcmV0dXJuIG91dHB1dFxuICAgIC8vIHRyeSB7XG4gICAgLy8gICByZXR1cm4gSlNPTi5zdHJpbmdpZnkob3V0cHV0KVxuICAgIC8vIH0gY2F0Y2ggKGUpIHtcbiAgICAvLyAgIHJldHVybiAnLWludmFsaWQgY29tbWFuZDogQ29tbWFuZCByZXR1cm5lZCBpbnZhbGlkIGRhdGEgdHlwZTogJyArIGUubWVzc2FnZVxuICAgIC8vIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBFeGVjIENvbW1hbmRcbiAgICogQHJldHVybiBKU09OIFN0cmluZyB3aXRoIG91dHB1dFxuICAgKi9cbiAgZXhlYyhjbWQpIHtcblxuICAgIC8vICBQYXJzZSBDb21tYW5kIFN0cmluZzogWzBdID0gY29tbWFuZCBuYW1lLCBbMStdID0gYXJndW1lbnRzXG4gICAgbGV0IHBhcnNlZFxuICAgIHRyeSB7XG4gICAgICBwYXJzZWQgPSB0aGlzLnBhcnNlKGNtZClcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4gJy1mYXRhbCBjb21tYW5kOiAnICsgZS5tZXNzYWdlIHx8ICdTb21lIEVycm9yIE9jY3VyZWQnXG4gICAgfVxuXG4gICAgLy8gIFgtY2hlY2sgaWYgY29tbWFuZCBleGlzdFxuICAgIGNvbnN0IGNvbW1hbmQgPSB0aGlzLlNoZWxsQ29tbWFuZHNbcGFyc2VkWzBdXVxuICAgIGlmICghY29tbWFuZCkge1xuICAgICAgcmV0dXJuIGAtZXJyb3Igc2hlbGw6IENvbW1hbmQgJHtwYXJzZWRbMF19IGRvZXNuJ3QgZXhpc3QuXFxuYFxuICAgIH1cblxuICAgIC8vICBnZXQgYXJndW1lbnRzIGFycmF5IGFuZCBleGVjdXRlIGNvbW1hbmQgcmV0dXJuIGVycm9yIGlmIHRocm93XG4gICAgY29uc3QgYXJncyA9IHBhcnNlZC5maWx0ZXIoKGUsIGkpID0+IGkgPiAwKVxuICAgIGxldCBvdXRwdXRcbiAgICB0cnkge1xuICAgICAgb3V0cHV0ID0gY29tbWFuZC5leGVjKGFyZ3MpXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuICctZmF0YWwgY29tbWFuZDogJyArIGUubWVzc2FnZVxuICAgIH1cblxuICAgIC8vICBGb3JtYXQgZGF0YSBhbmQgUmV0dXJuXG4gICAgcmV0dXJuIHRoaXMuZm9ybWF0KG91dHB1dClcbiAgfVxuXG4gIC8qXG4gICAqIEdlbmVyYXRlIEJ1aWx0aW4gQ29tbWFuZCBMaXN0XG4gICAqL1xuICByZWdpc3RlckNvbW1hbmRzKFNoZWxsUmVmZXJlbmNlLCBjdXN0b21Db21tYW5kcyA9IHVuZGVmaW5lZCkge1xuICAgIGxldCBCbHVlcHJpbnRzID0gcmVxdWlyZSgnLi4vY29uZmlncy9idWlsdGluLWNvbW1hbmRzJylcbiAgICAvKipcbiAgICAgKiBJZiBjdXN0b20gY29tbWFuZHMgYXJlIHBhc3NlZCBjaGVjayBmb3IgdmFsaWQgdHlwZVxuICAgICAqIElmIGdvb2QgdG8gZ28gZ2VuZXJhdGUgdGhvc2UgY29tbWFuZHNcbiAgICAgKi9cbiAgICBpZiAoY3VzdG9tQ29tbWFuZHMpIHtcbiAgICAgIGlmICh0eXBlb2YgY3VzdG9tQ29tbWFuZHMgPT09ICdvYmplY3QnICYmICFBcnJheS5pc0FycmF5KGN1c3RvbUNvbW1hbmRzKSkge1xuICAgICAgICBCbHVlcHJpbnRzID0gY3VzdG9tQ29tbWFuZHNcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQ3VzdG9tIGNvbW1hbmQgcHJvdmlkZWQgYXJlIG5vdCBpbiBhIHZhbGlkIGZvcm1hdC4nKVxuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IFNoZWxsQ29tbWFuZHMgPSB7fVxuICAgIE9iamVjdC5rZXlzKEJsdWVwcmludHMpLm1hcCgoa2V5KSA9PiB7XG4gICAgICBjb25zdCBjbWQgPSBCbHVlcHJpbnRzW2tleV1cbiAgICAgIGlmICh0eXBlb2YgY21kLm5hbWUgPT09ICdzdHJpbmcnICYmIHR5cGVvZiBjbWQuZm4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgY21kLnNoZWxsID0gU2hlbGxSZWZlcmVuY2VcbiAgICAgICAgU2hlbGxDb21tYW5kc1trZXldID0gbmV3IENvbW1hbmQoY21kKVxuICAgICAgfVxuICAgIH0pXG4gICAgcmV0dXJuIFNoZWxsQ29tbWFuZHNcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEludGVycHJldGVyXG4iLCJjb25zdCBJbnRlcnByZXRlciA9IHJlcXVpcmUoJy4vSW50ZXJwcmV0ZXInKVxuY29uc3QgRmlsZXN5c3RlbSA9IHJlcXVpcmUoJy4vRmlsZXN5c3RlbScpXG5cbi8qKlxuICogU2hlbGwgQ2xhc3MgaW5oZXJpdHMgZnJvbSBJbnRlcnByZXRlclxuICogT3B0aW9uczpcbiAqICAtIGZpbGVzeXN0ZW0ge09iamVjdH1cbiAqICAtIGNvbW1hbmRzIHtPYmplY3R9XG4gKiAgLSB1c2VyIHtTdHJpbmd9XG4gKiAgLSBob3N0bmFtZSB7U3RyaW5nfVxuICovXG5jbGFzcyBTaGVsbCBleHRlbmRzIEludGVycHJldGVye1xuICBjb25zdHJ1Y3Rvcih7IGZpbGVzeXN0ZW0gPSB1bmRlZmluZWQsIGNvbW1hbmRzID0gdW5kZWZpbmVkLCB1c2VyID0gJ3Jvb3QnLCBob3N0bmFtZSA9ICdteS5ob3N0Lm1lJyB9ID0ge30pIHtcbiAgICBzdXBlcigpXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIHRoZSB2aXJ0dWFsIGZpbGVzeXN0ZW1cbiAgICAgKiBAcmV0dXJuIHJlZmVyZW5jZSB0byBpbnN0YW5jZSBvZiBAY2xhc3MgRmlsZXN5c3RlbVxuICAgICAqL1xuICAgIHRoaXMuZnMgPSBuZXcgRmlsZXN5c3RlbShmaWxlc3lzdGVtLCB0aGlzKVxuICAgIHRoaXMudXNlciA9IHVzZXJcbiAgICB0aGlzLmhvc3RuYW1lID0gaG9zdG5hbWVcblxuICAgIC8vIEluaXQgYnVpbHRpbiBjb21tYW5kcywgQG1ldGhvZCBpbiBwYXJlbnRcbiAgICAvLyBwYXNzIHNoZWxsIHJlZmVyZW5jZVxuICAgIHRoaXMuU2hlbGxDb21tYW5kcyA9IHRoaXMucmVnaXN0ZXJDb21tYW5kcyh0aGlzKVxuICAgIHRoaXMuU2hlbGxDb21tYW5kcyA9IHtcbiAgICAgIC4uLnRoaXMuU2hlbGxDb21tYW5kcyxcbiAgICAgIC4uLnRoaXMucmVnaXN0ZXJDb21tYW5kcyh0aGlzLCBjb21tYW5kcyksXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFBhc3MgY29udHJvbCB0byBJbnRlcnByZXRlclxuICAgKiBAcmV0dXJuIG91dHB1dCBhcyBbU3RyaW5nXVxuICAgKi9cbiAgcnVuKGNtZCkge1xuICAgIHJldHVybiB0aGlzLmV4ZWMoY21kKVxuICB9XG59XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShTaGVsbC5wcm90b3R5cGUsICdmcycsIHsgd3JpdGFibGU6IHRydWUsIGVudW1lcmFibGU6IGZhbHNlIH0pXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoU2hlbGwucHJvdG90eXBlLCAnU2hlbGxDb21tYW5kcycsIHsgd3JpdGFibGU6IHRydWUsIGVudW1lcmFibGU6IGZhbHNlIH0pXG5cbm1vZHVsZS5leHBvcnRzID0gU2hlbGxcbiIsImNvbnN0IHsgbmFtZSwgdmVyc2lvbiwgZGVzY3JpcHRpb24sIHJlcG9zaXRvcnksIGF1dGhvciwgbGljZW5zZSB9ID0gcmVxdWlyZSgnLi4vLi4vcGFja2FnZS5qc29uJylcbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIC8qKlxuICAgKiBIZWxwXG4gICAqIEByZXR1cm4gTGlzdCBvZiBjb21tYW5kc1xuICAgKi9cbiAgaGVscDoge1xuICAgIG5hbWU6ICdoZWxwJyxcbiAgICB0eXBlOiAnYnVpbHRpbicsXG4gICAgbWFuOiAnTGlzdCBvZiBhdmFpYmxlIGNvbW1hbmRzJyxcbiAgICBmbjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gYENvbW1hbmRzIGF2YWlibGU6ICR7T2JqZWN0LmtleXModGhpcy5zaGVsbC5TaGVsbENvbW1hbmRzKS5qb2luKCcsICcpfWBcbiAgICB9XG4gIH0sXG5cbiAgd2hvYW1pOiB7XG4gICAgbmFtZTogJ3dob2FtaScsXG4gICAgdHlwZTogJ2J1aWx0aW4nLFxuICAgIG1hbjogJ0N1cnJlbnQgdXNlcicsXG4gICAgZm46IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuc2hlbGwudXNlclxuICAgIH0sXG4gIH0sXG5cbiAgYWJvdXQ6IHtcbiAgICBuYW1lOiAnYWJvdXQnLFxuICAgIHR5cGU6ICdidWlsdGluJyxcbiAgICBtYW46ICdBYm91dCB0aGlzIHByb2plY3QnLFxuICAgIGZuOiBmdW5jdGlvbigpIHtcbiAgICAgIGxldCBzdHIgPSAnJ1xuICAgICAgc3RyICs9IGBuYW1lOiAke25hbWV9XFxuYFxuICAgICAgc3RyICs9IGB2ZXJzaW9uOiAke3ZlcnNpb259XFxuYFxuICAgICAgc3RyICs9IGBkZXNjcmlwdGlvbjogJHtkZXNjcmlwdGlvbn1cXG5gXG4gICAgICBzdHIgKz0gYHJlcG9zaXRvcnk6ICR7cmVwb3NpdG9yeX1cXG5gXG4gICAgICBzdHIgKz0gYGF1dGhvcjogJHthdXRob3J9XFxuYFxuICAgICAgc3RyICs9IGBsaWNlbnNlOiAke2xpY2Vuc2V9XFxuYFxuICAgICAgcmV0dXJuIHN0clxuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogUmV0dXJuIHBhc3NlZCBhcmd1bWVudHMsIGZvciB0ZXN0aW5nIHB1cnBvc2VzXG4gICAqL1xuICBhcmd1bWVudHM6IHtcbiAgICBuYW1lOiAnYXJndW1lbnRzJyxcbiAgICB0eXBlOiAnYnVpbHRpbicsXG4gICAgbWFuOiAnUmV0dXJuIGFyZ3VtZW50IHBhc3NlZCwgdXNlZCBmb3IgdGVzdGluZyBwdXJwb3NlJyxcbiAgICBmbjogYXJncyA9PiBhcmdzXG4gIH0sXG5cbiAgLyoqXG4gICAqIENoYW5nZSBEaXJlY3RvcnlcbiAgICogQHJldHVybiBTdWNjZXNzL0ZhaWwgTWVzc2FnZSBTdHJpbmdcbiAgICovXG4gIGNkOiB7XG4gICAgbmFtZTogJ2NkJyxcbiAgICB0eXBlOiAnYnVpbHRpbicsXG4gICAgbWFuOiAnQ2hhbmdlIGRpcmVjdG9yeSwgcGFzcyBhYnNvbHV0ZSBvciByZWxhdGl2ZSBwYXRoOiBlZy4gY2QgL2V0YywgY2QgLyBjZC9teS9uZXN0ZWQvZGlyJyxcbiAgICBmbjogZnVuY3Rpb24ocGF0aCkge1xuICAgICAgaWYgKCFwYXRoKSB0aHJvdyBuZXcgRXJyb3IoJy1pbnZhbGlkIE5vIHBhdGggcHJvdmlkZWQuJylcbiAgICAgIHBhdGggPSBwYXRoLmpvaW4oKVxuICAgICAgdHJ5e1xuICAgICAgICByZXR1cm4gdGhpcy5zaGVsbC5mcy5jaGFuZ2VEaXIocGF0aClcbiAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICB0aHJvdyBlXG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBscyBDb21tYW5kXG4gICAqIExpc3QgZGlyZWN0b3J5IGZpbGVzXG4gICAqIEBwYXJhbSBhcnJheSBvZiBhcmdzXG4gICAqIEByZXR1cm4gZm9ybWF0dGVkIFN0cmluZ1xuICAgKi9cbiAgbHM6IHtcbiAgICBuYW1lOiAnbHMnLFxuICAgIHR5cGU6ICdidWlsdGluJyxcbiAgICBtYW46ICdsaXN0IGRpcmVjdG9yeSBmaWxlcywgcGFzcyBhYnNvbHV0ZS9yZWxhdGl2ZSBwYXRoLCBpZiBlbXB0eSBsaXN0IGN1cnJlbnQgZGlyZWN0b3J5JyxcbiAgICBmbjogZnVuY3Rpb24ocGF0aCA9IFsnLi8nXSApIHtcbiAgICAgIHBhdGggPSBwYXRoLmpvaW4oKVxuICAgICAgbGV0IGxpc3QsIHJlc3BvbnNlU3RyaW5nID0gJydcbiAgICAgIHRyeXtcbiAgICAgICAgbGlzdCA9IHRoaXMuc2hlbGwuZnMubGlzdERpcihwYXRoKVxuICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgIHRocm93IGVcbiAgICAgIH1cbiAgICAgIGZvciAobGV0IGZpbGUgaW4gbGlzdCkge1xuICAgICAgICBpZiAobGlzdC5oYXNPd25Qcm9wZXJ0eShmaWxlKSkge1xuICAgICAgICAgIHJlc3BvbnNlU3RyaW5nICs9IGAke2xpc3RbZmlsZV0ucGVybWlzc2lvbn1cXHQke2xpc3RbZmlsZV0udXNlcn0gJHtsaXN0W2ZpbGVdLmdyb3VwfVxcdCR7bGlzdFtmaWxlXS5uYW1lfVxcbmBcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3BvbnNlU3RyaW5nXG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBDQVQgQ29tbWFuZFxuICAgKiBSZWFkIEZpbGVcbiAgICogQHJldHVybiBmb3JtYXR0ZWQgU3RyaW5nXG4gICAqL1xuICBjYXQ6IHtcbiAgICBuYW1lOiAnY2F0JyxcbiAgICB0eXBlOiAnYnVpbHRpbicsXG4gICAgbWFuOiAnUmV0dXJuIGZpbGUgY29udGVudCwgdGFrZSBvbmUgYXJndW1lbnQ6IGZpbGUgcGF0aCAocmVsYXRpdmUvYWJzb2x1dGUpJyxcbiAgICBmbjogZnVuY3Rpb24ocGF0aCA9IFsnLi8nXSkge1xuICAgICAgcGF0aCA9IHBhdGguam9pbigpXG4gICAgICBsZXQgZmlsZSwgcmVzcG9uc2VTdHJpbmcgPSAnJ1xuICAgICAgdHJ5e1xuICAgICAgICBmaWxlID0gdGhpcy5zaGVsbC5mcy5yZWFkRmlsZShwYXRoKVxuICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgIHRocm93IGVcbiAgICAgIH1cbiAgICAgIHJldHVybiBmaWxlLmNvbnRlbnRcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIE1hblxuICAgKiBSZXR1cm4gY29tbWFuZCBtYW51YWwgaW5mb1xuICAgKiBAcmV0dXJuIHtzdHJpbmd9XG4gICAqL1xuICBtYW46IHtcbiAgICBuYW1lOiAnbWFuJyxcbiAgICB0eXBlOiAnYnVpbHRpbicsXG4gICAgbWFuOiAnQ29tbWFuZCBtYW51YWwsIHRha2VzIG9uZSBhcmd1bWVudCwgY29tbWFuZCBuYW1lJyxcbiAgICBmbjogZnVuY3Rpb24oYXJncykge1xuICAgICAgaWYgKCFhcmdzIHx8ICFhcmdzWzBdKSB0aHJvdyBuZXcgRXJyb3IoJ21hbjogbm8gY29tbWFuZCBwcm92aWRlZC4nKVxuICAgICAgbGV0IGNvbW1hbmQgPSBhcmdzWzBdXG4gICAgICBpZiAoIXRoaXMuc2hlbGwuU2hlbGxDb21tYW5kc1tjb21tYW5kXSkgdGhyb3cgbmV3IEVycm9yKCdjb21tYW5kIGRvZXNuXFwndCBleGlzdC4nKVxuICAgICAgaWYgKCF0aGlzLnNoZWxsLlNoZWxsQ29tbWFuZHNbY29tbWFuZF0ubWFuKSB0aHJvdyBuZXcgRXJyb3IoJ25vIG1hbnVhbCBlbnRyeSBmb3IgdGhpcyBjb21tYW5kLicpXG4gICAgICByZXR1cm4gdGhpcy5zaGVsbC5TaGVsbENvbW1hbmRzW2NvbW1hbmRdLm1hblxuICAgIH0sXG4gIH0sXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcblxuICAnZmlsZS5oJzogJyNpbmNsdWRlIDxub3BlLmg+JyxcblxuICBldGM6IHtcbiAgICBhcGFjaGUyOiB7XG4gICAgICAnYXBhY2hlMi5jb25mJzogJ05vdCBXaGF0IHlvdSB3ZXJlIGxvb2tpbmcgZm9yIDopJyxcbiAgICB9LFxuICB9LFxuXG4gIGhvbWU6IHtcbiAgICBndWVzdDoge1xuICAgICAgZG9jczoge1xuICAgICAgICAnbXlkb2MubWQnOiAnVGVzdEZpbGUnLFxuICAgICAgICAnbXlkb2MyLm1kJzogJ1Rlc3RGaWxlMicsXG4gICAgICAgICdteWRvYzMubWQnOiAnVGVzdEZpbGUzJyxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcblxuICByb290OntcbiAgICAnLnpzaHJjJzogJ25vdCBldmVuIGNsb3NlIDopJyxcbiAgICAnLm9oLW15LXpzaCc6IHtcbiAgICAgIHRoZW1lczoge30sXG4gICAgfSxcbiAgfSxcbn1cbiIsIm1vZHVsZS5leHBvcnRzPXtcbiAgXCJuYW1lXCI6IFwiYnJvd3Nlci10ZXJtaW5hbC5qc1wiLFxuICBcInZlcnNpb25cIjogXCIyLjAuMFwiLFxuICBcImRlc2NyaXB0aW9uXCI6IFwiU2ltcGxlIEJyb3dzZXIgVGVybWluYWwgaW4gcHVyZSBqcywgdXNhYmxlIGZvciB3ZWIgcHJlc2VudGF0aW9uIG9mIENMSSB0b29scyBhbmQgd2hhdGV2ZXIgeW91IHdhbnQgaXQgdG8gZG8hXCIsXG4gIFwibWFpblwiOiBcInRlcm1pbmFsLmpzXCIsXG4gIFwic2NyaXB0c1wiOiB7XG4gICAgXCJ0ZXN0XCI6IFwibW9jaGEgLS1jb21waWxlcnMgYmFiZWwtY29yZS9yZWdpc3RlciB0ZXN0cy9cIixcbiAgICBcImJ1aWxkXCI6IFwibnBtIHJ1biBidWlsZDpkZXYgJiYgbnBtIHJ1biBidWlsZDpwcm9kXCIsXG4gICAgXCJidWlsZDpkZXZcIjogXCJndWxwXCIsXG4gICAgXCJidWlsZDpwcm9kXCI6IFwiZ3VscCBwcm9kdWN0aW9uXCJcbiAgfSxcbiAgXCJrZXl3b3Jkc1wiOiBbXG4gICAgXCJ0ZXJtaW5hbFwiLFxuICAgIFwiamF2YXNjcmlwdFwiLFxuICAgIFwic2ltdWxhdG9yXCIsXG4gICAgXCJicm93c2VyXCIsXG4gICAgXCJwcmVzZW50YXRpb25cIixcbiAgICBcIm1vY2t1cFwiLFxuICAgIFwiY29tbWFuZHNcIixcbiAgICBcImZha2VcIlxuICBdLFxuICBcInJlcG9zaXRvcnlcIjogXCJodHRwczovL2dpdGh1Yi5jb20vS2lya2hhbW1ldHovYnJvd3Nlci10ZXJtaW5hbC5qc1wiLFxuICBcImF1dGhvclwiOiBcIlNpbW9uZSBDb3JzaVwiLFxuICBcImxpY2Vuc2VcIjogXCJJU0NcIixcbiAgXCJkZXZEZXBlbmRlbmNpZXNcIjoge1xuICAgIFwiYmFiZWxpZnlcIjogXCJeNy4zLjBcIixcbiAgICBcImJyb3dzZXJpZnlcIjogXCJeMTMuMy4wXCIsXG4gICAgXCJjaGFsa1wiOiBcIl4xLjEuM1wiLFxuICAgIFwiZ3VscFwiOiBcIl4zLjkuMVwiLFxuICAgIFwiZ3VscC1yZW5hbWVcIjogXCJeMS4yLjJcIixcbiAgICBcImd1bHAtc291cmNlbWFwc1wiOiBcIl4yLjQuMFwiLFxuICAgIFwiZ3VscC11Z2xpZnlcIjogXCJeMi4wLjBcIixcbiAgICBcImd1bHAtdXRpbFwiOiBcIl4zLjAuOFwiLFxuICAgIFwidWdsaWZ5LWpzXCI6IFwiXjIuNi40XCIsXG4gICAgXCJ1dGlscy1tZXJnZVwiOiBcIl4xLjAuMFwiLFxuICAgIFwidmlueWwtYnVmZmVyXCI6IFwiXjEuMC4wXCIsXG4gICAgXCJ2aW55bC1zb3VyY2Utc3RyZWFtXCI6IFwiXjEuMS4wXCIsXG4gICAgXCJ3YXRjaGlmeVwiOiBcIl4zLjguMFwiXG4gIH0sXG4gIFwiZGVwZW5kZW5jaWVzXCI6IHtcbiAgICBcImJhYmVsXCI6IFwiXjYuNS4yXCIsXG4gICAgXCJiYWJlbC1jb3JlXCI6IFwiXjYuMjEuMFwiLFxuICAgIFwiYmFiZWwtcG9seWZpbGxcIjogXCJeNi4yMi4wXCIsXG4gICAgXCJiYWJlbC1wcmVzZXQtZXMyMDE1XCI6IFwiXjYuMTguMFwiLFxuICAgIFwiYmFiZWwtcHJlc2V0LXN0YWdlLTNcIjogXCJeNi4xNy4wXCIsXG4gICAgXCJiYWJlbGlmeVwiOiBcIl43LjMuMFwiLFxuICAgIFwiY2hhaVwiOiBcIl4zLjUuMFwiLFxuICAgIFwibW9jaGFcIjogXCJeMy4yLjBcIlxuICB9XG59XG4iXX0=
