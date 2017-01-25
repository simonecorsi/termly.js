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

},{"./Filesystem":3,"./Interpreter":4}],6:[function(require,module,exports){
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
    fn: function fn() {
      return 'Commands available: ' + Object.keys(this.shell.ShellCommands).join(', ');
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

},{"../../package.json":9}],7:[function(require,module,exports){
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
    "es6-promise": "^4.0.5",
    "gulp": "^3.9.1",
    "gulp-rename": "^1.2.2",
    "gulp-sourcemaps": "^2.4.0",
    "gulp-uglify": "^2.0.0",
    "gulp-util": "^3.0.8",
    "mocha": "^3.2.0",
    "uglify-js": "^2.6.4",
    "utils-merge": "^1.0.0",
    "vinyl-buffer": "^1.0.0",
    "vinyl-source-stream": "^1.1.0",
    "watchify": "^3.8.0"
  }
}

},{}]},{},[8])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJiaW4vY2xhc3Nlcy9Db21tYW5kLmpzIiwiYmluL2NsYXNzZXMvRmlsZS5qcyIsImJpbi9jbGFzc2VzL0ZpbGVzeXN0ZW0uanMiLCJiaW4vY2xhc3Nlcy9JbnRlcnByZXRlci5qcyIsImJpbi9jbGFzc2VzL1NoZWxsLmpzIiwiYmluL2NvbmZpZ3MvYnVpbHRpbi1jb21tYW5kcy5qcyIsImJpbi9jb25maWdzL2RlZmF1bHQtZmlsZXN5c3RlbS5qcyIsImJpbi90ZXJtbHkuanMiLCJwYWNrYWdlLmpzb24iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7QUNBQTs7Ozs7O0lBTU0sTztBQUNKLHFCQUF3RTtBQUFBLG1GQUFILEVBQUc7QUFBQSxRQUExRCxJQUEwRCxRQUExRCxJQUEwRDtBQUFBLFFBQXBELEVBQW9ELFFBQXBELEVBQW9EO0FBQUEseUJBQWhELElBQWdEO0FBQUEsUUFBaEQsSUFBZ0QsNkJBQXpDLEtBQXlDO0FBQUEsMEJBQWxDLEtBQWtDO0FBQUEsUUFBbEMsS0FBa0MsOEJBQTFCLFNBQTBCO0FBQUEsd0JBQWYsR0FBZTtBQUFBLFFBQWYsR0FBZSw0QkFBVCxFQUFTOztBQUFBOztBQUN0RSxRQUFJLE9BQU8sSUFBUCxLQUFnQixRQUFwQixFQUE4QixNQUFNLE1BQU0sK0JBQU4sQ0FBTjtBQUM5QixRQUFJLE9BQU8sRUFBUCxLQUFjLFVBQWxCLEVBQThCLE1BQU0sTUFBTSx3Q0FBTixDQUFOOztBQUU5Qjs7OztBQUlBLFNBQUssRUFBTCxHQUFVLEdBQUcsSUFBSCxDQUFRLElBQVIsQ0FBVjtBQUNBLFNBQUssSUFBTCxHQUFZLElBQVo7QUFDQSxTQUFLLElBQUwsR0FBWSxJQUFaO0FBQ0EsU0FBSyxHQUFMLEdBQVcsR0FBWDs7QUFFQSxRQUFJLEtBQUosRUFBVztBQUNULFdBQUssS0FBTCxHQUFhLEtBQWI7QUFDRDtBQUNGOztBQUVEOzs7Ozs7Ozs7OzJCQU1n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LE9BQU8sUUFBUCxJQUFtQixRQUFRLGlCQUFSLENBQW5COzs7OztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXG4gKiBDb21tYW5kIENsYXNzXG4gKiBAcGFyYW0gbmFtZSBbU3RyaW5nXSwgZm4gW0Z1bmN0aW9uXVxuICpcbiAqIGRvbid0IHBhc3MgYXJyb3cgZnVuY3Rpb24gaWYgeW91IHdhbnQgdG8gdXNlIHRoaXMgaW5zaWRlIHlvdXIgY29tbWFuZCBmdW5jdGlvbiB0byBhY2Nlc3MgdmFyaW91cyBzaGFyZWQgc2hlbGwgb2JqZWN0XG4gKi9cbmNsYXNzIENvbW1hbmQge1xuICBjb25zdHJ1Y3Rvcih7IG5hbWUsIGZuLCB0eXBlID0gJ3VzcicsIHNoZWxsID0gdW5kZWZpbmVkLCBtYW4gPSAnJ30gPSB7fSl7XG4gICAgaWYgKHR5cGVvZiBuYW1lICE9PSAnc3RyaW5nJykgdGhyb3cgRXJyb3IoJ0NvbW1hbmQgbmFtZSBtdXN0IGJlIGEgc3RyaW5nJylcbiAgICBpZiAodHlwZW9mIGZuICE9PSAnZnVuY3Rpb24nKSB0aHJvdyBFcnJvcignQ29tbWFuZCBmdW5jdGlvbiBtdXN0IGJlLi4uIGEgZnVuY3Rpb24nKVxuXG4gICAgLyoqXG4gICAgICogdXNlIHdob2xlIGZ1bmN0aW9uIGluc3RlYWQgb2YgYXJyb3cgaWYgeW91IHdhbnQgdG8gYWNjZXNzXG4gICAgICogY2lyY3VsYXIgcmVmZXJlbmNlIG9mIENvbW1hbmRcbiAgICAgKi9cbiAgICB0aGlzLmZuID0gZm4uYmluZCh0aGlzKVxuICAgIHRoaXMubmFtZSA9IG5hbWVcbiAgICB0aGlzLnR5cGUgPSB0eXBlXG4gICAgdGhpcy5tYW4gPSBtYW5cblxuICAgIGlmIChzaGVsbCkge1xuICAgICAgdGhpcy5zaGVsbCA9IHNoZWxsXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIERpc3BhdGNoIENvbW1hbmQgRXhlY3V0aW9uXG4gICAqXG4gICAqIEB0aXAgZG9uJ3QgdXNlIGFycm93IGZ1bmN0aW9uIGluIHlvdSBjb21tYW5kIGlmIHlvdSB3YW50IHRoZSBhcmd1bWVudHNcbiAgICogbmVpdGhlciBzdXBlciBhbmQgYXJndW1lbnRzIGdldCBiaW5kZWQgaW4gQUYuXG4gICAqL1xuICBleGVjKGFyZ3MgPSBbXSkge1xuICAgIGlmICghQXJyYXkuaXNBcnJheShhcmdzKSkgdGhyb3cgRXJyb3IoJ0NvbW1hbmQgZXhlYyBhcmdzIG11c3QgYmUgaW4gYW4gYXJyYXknKVxuICAgIGlmIChhcmdzLmxlbmd0aCkgcmV0dXJuIHRoaXMuZm4oYXJncylcbiAgICByZXR1cm4gdGhpcy5mbigpXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBDb21tYW5kXG4iLCIvKipcbiAqIEBjbGFzcyBTaW5nbGUgRmlsZSBDbGFzc1xuICogU2ltdWxhdGUgZmlsZSBwcm9wZXJ0aWVzXG4gKi9cbmNsYXNzIEZpbGUge1xuICBjb25zdHJ1Y3Rvcih7IG5hbWUgPSAnJywgdHlwZSA9ICdmaWxlJywgY29udGVudCA9ICcnfSA9IHt9KSB7XG4gICAgdGhpcy51aWQgPSB0aGlzLmdlblVpZCgpXG4gICAgdGhpcy5uYW1lID0gbmFtZVxuICAgIHRoaXMudHlwZSA9IHR5cGVcbiAgICB0aGlzLmNvbnRlbnQgPSBjb250ZW50XG4gICAgdGhpcy51c2VyID0gJ3Jvb3QnXG4gICAgdGhpcy5ncm91cCA9ICdyb290J1xuXG4gICAgaWYgKHRoaXMudHlwZSA9PT0gJ2ZpbGUnKSB7XG4gICAgICB0aGlzLnBlcm1pc3Npb24gPSAncnd4ci0tci0tJ1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnBlcm1pc3Npb24gPSAnZHJ3eHIteHIteCdcbiAgICB9XG5cbiAgfVxuXG4gIGdlblVpZCgpIHtcbiAgICBmdW5jdGlvbiBzNCgpIHtcbiAgICAgIHJldHVybiBNYXRoLmZsb29yKCgxICsgTWF0aC5yYW5kb20oKSkgKiAweDEwMDAwKVxuICAgICAgICAudG9TdHJpbmcoMTYpXG4gICAgICAgIC5zdWJzdHJpbmcoMSk7XG4gICAgfVxuICAgIHJldHVybiBzNCgpICsgczQoKSArICctJyArIHM0KCkgKyAnLScgKyBzNCgpICsgJy0nICtcbiAgICAgIHM0KCkgKyAnLScgKyBzNCgpICsgczQoKSArIHM0KCk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGaWxlXG4iLCJjb25zdCBERUZBVUxUX0ZTID0gcmVxdWlyZSgnLi4vY29uZmlncy9kZWZhdWx0LWZpbGVzeXN0ZW0nKVxuY29uc3QgRmlsZSA9IHJlcXVpcmUoJy4vRmlsZScpXG5cbi8qKlxuICogQGNsYXNzIFZpcnR1YWwgRmlsZXN5c3RlbVxuICogUmVwcmVzZW50ZWQgYXMgYW4gb2JqZWN0IG9mIG5vZGVzXG4gKi9cbmNsYXNzIEZpbGVzeXN0ZW0ge1xuICBjb25zdHJ1Y3RvcihmcyA9IERFRkFVTFRfRlMsIHNoZWxsID0ge30pIHtcbiAgICB0aGlzLnNoZWxsID0gc2hlbGxcbiAgICBpZiAodHlwZW9mIGZzICE9PSAnb2JqZWN0JyB8fCBBcnJheS5pc0FycmF5KGZzKSkgdGhyb3cgbmV3IEVycm9yKCdWaXJ0dWFsIEZpbGVzeXN0ZW0gcHJvdmlkZWQgbm90IHZhbGlkLCBpbml0aWFsaXphdGlvbiBmYWlsZWQuJylcblxuICAgIC8vIE5vdCBCeSBSZWZlcmVuY2UuXG4gICAgLy8gSEFDSzogT2JqZWN0IGFzc2lnbiByZWZ1c2UgdG8gd29yayBhcyBpbnRlbmRlZC5cbiAgICBmcyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoZnMpKVxuICAgIHRoaXMuRmlsZVN5c3RlbSA9IHRoaXMuaW5pdEZzKGZzKVxuXG4gICAgLy8gQ1dEIGZvciBjb21tYW5kcyB1c2FnZVxuICAgIHRoaXMuY3dkID0gWycvJ11cbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0ICYgUGFzcyBDb250cm9sIHRvIHJlY3VycnNpdmUgZnVuY3Rpb25cbiAgICogQHJldHVybiBuZXcgRmlsZXN5c3RlbSBhcyBub2RlcyBvZiBtdWx0aXBsZSBAY2xhc3MgRmlsZVxuICAgKi9cbiAgaW5pdEZzKGZzKSB7XG4gICAgdGhpcy5idWlsZFZpcnR1YWxGcyhmcylcbiAgICByZXR1cm4gZnNcbiAgfVxuXG4gIC8qKlxuICAgKiBUcmF2ZXJzZSBhbGwgbm9kZSBhbmQgYnVpbGQgYSB2aXJ0dWFsIHJlcHJlc2VudGF0aW9uIG9mIGEgZmlsZXN5c3RlbVxuICAgKiBFYWNoIG5vZGUgaXMgYSBGaWxlIGluc3RhbmNlLlxuICAgKiBAcGFyYW0gTW9ja2VkIEZpbGVzeXN0ZW0gYXMgT2JqZWN0XG4gICAqXG4gICAqL1xuICBidWlsZFZpcnR1YWxGcyhvYmopIHtcbiAgICBmb3IgKGxldCBrZXkgaW4gb2JqKSB7XG4gICAgICBpZiAob2JqLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBvYmpba2V5XSA9PT0gJ29iamVjdCcgJiYgIUFycmF5LmlzQXJyYXkob2JqW2tleV0pKSB7XG4gICAgICAgICAgb2JqW2tleV0gPSBuZXcgRmlsZSh7IG5hbWU6IGtleSwgY29udGVudDogb2JqW2tleV0sIHR5cGU6ICdkaXInIH0pXG4gICAgICAgICAgdGhpcy5idWlsZFZpcnR1YWxGcyhvYmpba2V5XS5jb250ZW50KVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG9ialtrZXldID0gbmV3IEZpbGUoeyBuYW1lOiBrZXksIGNvbnRlbnQ6IG9ialtrZXldIH0pXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2V0IGEgc3RyaW5nZWQgcGF0aCBhbmQgcmV0dXJuIGFzIGFycmF5XG4gICAqIHRocm93IGVycm9yIGlmIHBhdGggZm9ybWF0IGlzIGludmFsaWRcbiAgICogUmVsYXRpdmUgUGF0aCBnZXRzIGNvbnZlcnRlZCB1c2luZyBDdXJyZW50IFdvcmtpbmcgRGlyZWN0b3J5XG4gICAqIEBwYXJhbSBwYXRoIHtTdHJpbmd9XG4gICAqIEByZXR1cm4gQXJyYXlcbiAgICovXG4gIHBhdGhTdHJpbmdUb0FycmF5KHBhdGggPSAnJykge1xuICAgIGlmICghcGF0aC5sZW5ndGgpIHRocm93IG5ldyBFcnJvcignUGF0aCBjYW5ub3QgYmUgZW1wdHknKVxuXG4gICAgLy8gQ2hlY2sgZm9yIGludmFsaWQgcGF0aCwgZWcuIHR3bysgLy8gaW4gYSByb3dcbiAgICBpZiAocGF0aC5tYXRjaCgvXFwvezIsfS9nKSkgdGhyb3cgbmV3IEVycm9yKGAtaW52YWxpZCBwYXRoOiAke3BhdGh9YClcblxuICAgIC8vIEZvcm1hdCBhbmQgQ29tcG9zZXIgYXJyYXlcbiAgICBsZXQgcGF0aEFycmF5ID0gcGF0aC5zcGxpdCgnLycpXG4gICAgaWYgKHBhdGhBcnJheVswXSA9PT0gJycpIHBhdGhBcnJheVswXSA9ICcvJ1xuICAgIGlmIChwYXRoQXJyYXlbMF0gPT09ICcuJykgcGF0aEFycmF5LnNoaWZ0KClcbiAgICBpZihwYXRoQXJyYXlbcGF0aEFycmF5Lmxlbmd0aCAtIDFdID09PSAnJykgcGF0aEFycmF5LnBvcCgpXG4gICAgLy8gaGFuZGxlIHJlbGF0aXZlIHBhdGggd2l0aCBjdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5XG4gICAgaWYgKHBhdGhBcnJheVswXSAhPT0gJy8nKSB7XG4gICAgICBwYXRoQXJyYXkgPSB0aGlzLmN3ZC5jb25jYXQocGF0aEFycmF5KVxuICAgIH1cbiAgICByZXR1cm4gcGF0aEFycmF5XG4gIH1cblxuICAvKipcbiAgICogUGF0aCBmcm9tIGFycmF5IHRvIFN0cmluZ1xuICAgKiBGb3IgcHJlc2VudGF0aW9uYWwgcHVycG9zZS5cbiAgICogVE9ET1xuICAgKiBAcGFyYW0gcGF0aCBbQXJyYXldXG4gICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICovXG4gIHBhdGhBcnJheVRvU3RyaW5nKHBhdGggPSBbXSkge1xuICAgIGlmICghQXJyYXkuaXNBcnJheShwYXRoKSkgdGhyb3cgbmV3IEVycm9yKCctZmF0YWwgZmlsZXN5c3RlbTogcGF0aCBtdXN0IGJlIGFuIGFycmF5JylcbiAgICBpZiAoIXBhdGgubGVuZ3RoKSB0aHJvdyBuZXcgRXJyb3IoJy1pbnZhbGlkIGZpbGVzeXN0ZW06IHBhdGggbm90IHByb3ZpZGVkJylcbiAgICBsZXQgb3V0cHV0ID0gcGF0aC5qb2luKCcvJylcbiAgICAvLyByZW1vdmUgLyBtdWx0aXBsZSBvY2N1cnJlbmNlXG4gICAgcmV0dXJuIG91dHB1dC5yZXBsYWNlKC9cXC97Mix9L2csICcvJylcbiAgfVxuXG4gIC8qKlxuICAgKiBMdWtlLi4gZmlsZVdhbGtlclxuICAgKiBBY2NlcHRzIG9ubHkgQWJzb2x1dGUgUGF0aCwgeW91IG11c3QgY29udmVydCBwYXRocyBiZWZvcmUgY2FsbGluZyB1c2luZyBwYXRoU3RyaW5nVG9BcnJheVxuICAgKiBAcGFyYW0gY2IgZXhlY3V0ZWQgb24gZWFjaCBmaWxlIGZvdW5kXG4gICAqIEBwYXJhbSBmcyBbU2hlbGwgVmlydHVhbCBGaWxlc3lzdGVtXVxuICAgKi9cbiAgZmlsZVdhbGtlcihwYXRoID0gWycvJ10sIGZzID0gdGhpcy5GaWxlU3lzdGVtKXtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkocGF0aCkpIHRocm93IG5ldyBFcnJvcignUGF0aCBtdXN0IGJlIGFuIGFycmF5IG9mIG5vZGVzLCB1c2UgRmlsZXN5c3RlbS5wYXRoU3RyaW5nVG9BcnJheSh7c3RyaW5nfSknKVxuXG4gICAgLy8gYXZvaWQgbW9kaWZ5aW5nIGV4dGVybmFsIHBhdGggcmVmZXJlbmNlXG4gICAgcGF0aCA9IHBhdGguc2xpY2UoMClcblxuICAgIC8vIFRPRE86XG4gICAgLy8gIENob29zZTpcbiAgICAvLyAgICAtIEdvIGZ1bGwgcHVyZVxuICAgIC8vICAgIC0gV29yayBvbiB0aGUgcmVmZXJlbmNlIG9mIHRoZSBhY3R1YWwgbm9kZVxuICAgIC8vIGZzID0gT2JqZWN0LmFzc2lnbihmcywge30pXG5cbiAgICAvLyBFeGl0IENvbmRpdGlvblxuICAgIGlmICghcGF0aC5sZW5ndGgpIHJldHVybiBmc1xuXG4gICAgLy8gR2V0IGN1cnJlbnQgbm9kZVxuICAgIGxldCBub2RlID0gcGF0aC5zaGlmdCgpXG5cbiAgICAvLyBHbyBkZWVwZXIgaWYgaXQncyBub3QgdGhlIHJvb3QgZGlyXG4gICAgaWYgKG5vZGUgIT09ICcvJykge1xuICAgICAgLy8gY2hlY2sgaWYgbm9kZSBleGlzdFxuICAgICAgaWYgKGZzW25vZGVdKSB7XG4gICAgICAgIC8vIHJldHVybiBmaWxlIG9yIGZvbGRlclxuICAgICAgICBmcyA9IGZzW25vZGVdLnR5cGUgPT09ICdkaXInID8gZnNbbm9kZV0uY29udGVudCA6IGZzW25vZGVdXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZpbGUgZG9lc25cXCd0IGV4aXN0JylcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZmlsZVdhbGtlcihwYXRoLCBmcylcbiAgfVxuXG4gIC8qKlxuICAgKiB0cmF2ZXJzZUZpbGVzXG4gICAqIGFjY2Vzc2luZyBhbGwgZmlsZSBhdCBsZWFzdCBvbmNlXG4gICAqIGNhbGxpbmcgcHJvdmlkZWQgY2FsbGJhY2sgb24gZWFjaFxuICAgKiBAcGFyYW0gY2IgZXhlY3V0ZWQgb24gZWFjaCBmaWxlIGZvdW5kXG4gICAqIEBwYXJhbSBmcyBbU2hlbGwgVmlydHVhbCBGaWxlc3lzdGVtXVxuICAgKi9cbiAgdHJhdmVyc2VGaWxlcyhjYiA9ICgpPT57fSwgZnMgPSB0aGlzLkZpbGVTeXN0ZW0pe1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzLnRyYXZlcnNlRmlsZXNcbiAgICBmb3IgKGxldCBub2RlIGluIGZzKSB7XG4gICAgICBpZiAoZnMuaGFzT3duUHJvcGVydHkobm9kZSkpIHtcbiAgICAgICAgaWYgKGZzW25vZGVdLnR5cGUgPT09ICdkaXInKSB0aGlzLnRyYXZlcnNlRmlsZXMoY2IsIGZzW25vZGVdLmNvbnRlbnQpXG4gICAgICAgIGVsc2UgY2IoZnNbbm9kZV0pXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIHRyYXZlcnNlRGlyc1xuICAgKiBhY2Nlc3NpbmcgYWxsIGRpcmVjdG9yeSBhdCBsZWFzdCBvbmNlXG4gICAqIGNhbGxpbmcgcHJvdmlkZWQgY2FsbGJhY2sgb24gZWFjaFxuICAgKiBAcGFyYW0gY2IgZXhlY3V0ZWQgb24gZWFjaCBmaWxlIGZvdW5kXG4gICAqIEBwYXJhbSBmcyBbU2hlbGwgVmlydHVhbCBGaWxlc3lzdGVtXVxuICAgKi9cbiAgdHJhdmVyc2VEaXJzKGNiID0gKCk9Pnt9LCBmcyA9IHRoaXMuRmlsZVN5c3RlbSl7XG4gICAgZm9yIChsZXQgbm9kZSBpbiBmcykge1xuICAgICAgaWYgKGZzLmhhc093blByb3BlcnR5KG5vZGUpKSB7XG4gICAgICAgIGlmIChmc1tub2RlXS50eXBlID09PSAnZGlyJykge1xuICAgICAgICAgIGNiKGZzW25vZGVdKVxuICAgICAgICAgIHRoaXMudHJhdmVyc2VEaXJzKGNiLCBmc1tub2RlXS5jb250ZW50KVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCBEaXJlY3RvcnkgTm9kZVxuICAgKiBQYXNzZWQgYXMgUmVmZXJlbmNlIG9yIEluc3RhbmNlLFxuICAgKiBkZXBlbmQgYnkgYSBsaW5lIGluIEBtZXRob2QgZmlsZVdhbGtlciwgc2VlIGNvbW1lbnQgdGhlcmUuXG4gICAqIEByZXR1cm4gRGlyZWN0b3J5IE5vZGUgT2JqZWN0XG4gICAqL1xuICBnZXROb2RlKHBhdGggPSAnJywgZmlsZVR5cGUpIHtcbiAgICBpZiAodHlwZW9mIHBhdGggIT09ICdzdHJpbmcnKSB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgaW5wdXQuJylcbiAgICBsZXQgcGF0aEFycmF5LCBub2RlXG5cbiAgICB0cnkge1xuICAgICAgcGF0aEFycmF5ID0gdGhpcy5wYXRoU3RyaW5nVG9BcnJheShwYXRoKVxuICAgICAgbm9kZSA9IHRoaXMuZmlsZVdhbGtlcihwYXRoQXJyYXkpXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhyb3cgZVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEVSUk9SIEhBTkRMSU5HXG4gICAgICovXG5cbiAgICAvLyBIYW5kbGUgTGlzdCBvbiBhIGZpbGVcbiAgICBpZiAoZmlsZVR5cGUgPT09ICdkaXInICYmIG5vZGUudHlwZSA9PT0gJ2ZpbGUnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0l0cyBhIGZpbGUgbm90IGEgZGlyZWN0b3J5JylcbiAgICB9XG4gICAgLy8gSGFuZGxlIHJlYWRmaWxlIG9uIGEgZGlyXG4gICAgaWYgKGZpbGVUeXBlID09PSAnZmlsZScgJiYgbm9kZS50eXBlID09PSAnZGlyJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJdHMgYSBkaXJlY3Rvcnkgbm90IGEgZmlsZScpXG4gICAgfVxuICAgIC8vIGhhbmRsZSByZWFkZmlsZSBvbiBub24gZXhpc3RpbmcgZmlsZVxuICAgIGlmIChmaWxlVHlwZSA9PT0gJ2ZpbGUnICYmICFub2RlLnR5cGUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBmaWxlIHBhdGgnKVxuICAgIH1cbiAgICAvLyBoYW5kbGUgaW52YWxpZCAvIG5vbmV4aXN0aW5nIHBhdGhcbiAgICBpZiAoIW5vZGUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBwYXRoLCBmaWxlL2ZvbGRlciBkb2VzblxcJ3QgZXhpc3QnKVxuICAgIH1cblxuICAgIHJldHVybiB7IHBhdGgsIHBhdGhBcnJheSAsIG5vZGUgfVxuICB9XG5cbiAgLyoqXG4gICAqIENoYW5nZSBDdXJyZW50IFdvcmtpbmcgRGlyZWN0b3J5IEdyYWNlZnVsbHlcbiAgICogQHJldHVybiBNZXNzYWdlIFN0cmluZy5cbiAgICovXG4gIGNoYW5nZURpcihwYXRoID0gJycpIHtcbiAgICBsZXQgcmVzdWx0XG4gICAgdHJ5IHtcbiAgICAgIHJlc3VsdCA9IHRoaXMuZ2V0Tm9kZShwYXRoLCAnZGlyJylcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIHRocm93IGVyclxuICAgIH1cbiAgICB0aGlzLmN3ZCA9IHJlc3VsdC5wYXRoQXJyYXlcbiAgICByZXR1cm4gYGNoYW5nZWQgZGlyZWN0b3J5LmBcbiAgfVxuXG4gIC8qKlxuICAgKiBMaXN0IEN1cnJlbnQgV29ya2luZyBEaXJlY3RvcnkgRmlsZXNcbiAgICogQHJldHVybiB7fVxuICAgKi9cbiAgbGlzdERpcihwYXRoID0gJycpIHtcbiAgICBsZXQgcmVzdWx0XG4gICAgdHJ5IHtcbiAgICAgIHJlc3VsdCA9IHRoaXMuZ2V0Tm9kZShwYXRoLCAnZGlyJylcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIHRocm93IGVyclxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0Lm5vZGVcbiAgfVxuXG4gIHJlYWRGaWxlKHBhdGggPSAnJykge1xuICAgIGxldCByZXN1bHRcbiAgICB0cnkge1xuICAgICAgcmVzdWx0ID0gdGhpcy5nZXROb2RlKHBhdGgsICdmaWxlJylcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIHRocm93IGVyclxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0Lm5vZGVcbiAgfVxuXG4gIGdldEN1cnJlbnREaXJlY3RvcnkoKSB7XG4gICAgbGV0IGN3ZEFzU3RyaW5nXG4gICAgdHJ5IHtcbiAgICAgIGN3ZEFzU3RyaW5nID0gdGhpcy5wYXRoQXJyYXlUb1N0cmluZyh0aGlzLmN3ZClcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4gJy1pbnZhbGlkIGZpbGVzeXN0ZW06IEFuIGVycm9yIG9jY3VyZWQgd2hpbGUgcGFyc2luZyBjdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5IHRvIHN0cmluZy4nXG4gICAgfVxuICAgIHJldHVybiBjd2RBc1N0cmluZ1xuICB9XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGaWxlc3lzdGVtXG4iLCJjb25zdCBDb21tYW5kID0gcmVxdWlyZSgnLi9Db21tYW5kJylcblxuLyoqXG4gKlxuICogSW50ZXJwcmV0ZXJcbiAqIElzIHRoZSBwYXJlbnQgQ2xhc3Mgb2YgdGhlIE1haW4gU2hlbGwgQ2xhc3NcbiAqIC0gVGhpcyBjbGFzcyBpcyB0aGUgb25lIHRoYXQgcGFyc2UgYW5kIHJ1biBleGVjIG9mIGNvbW1hbmRcbiAqIC0gUGFyc2luZyBvZiBidWlsdGluIGNvbW1hbmQgb24gcnVudGltZSBoYXBwZW4gaGVyZVxuICogLSBXaWxsIHBhcnNlIGN1c3RvbSB1c2VyIENvbW1hbmQgdG9vXG4gKlxuICovXG5jbGFzcyBJbnRlcnByZXRlciB7XG5cbiAgLyoqXG4gICAqIFBhcnNlIENvbW1hbmRcbiAgICogQHJldHVybiBBcnJheSBvZiBhcmdzIGFzIGluIENcbiAgICovXG4gIHBhcnNlKGNtZCkge1xuICAgIGlmICh0eXBlb2YgY21kICE9PSAnc3RyaW5nJykgdGhyb3cgbmV3IEVycm9yKCdDb21tYW5kIG11c3QgYmUgYSBzdHJpbmcnKVxuICAgIGlmICghY21kLmxlbmd0aCkgdGhyb3cgbmV3IEVycm9yKCdDb21tYW5kIGlzIGVtcHR5JylcbiAgICByZXR1cm4gY21kLnNwbGl0KCcgJylcbiAgfVxuXG4gIC8qKlxuICAgKiBGb3JtYXQgT3V0cHV0XG4gICAqIHJldHVybiBlcnJvciBpZiBmdW5jdGlvbiBpcyByZXR1cm5lZFxuICAgKiBjb252ZXJ0IGV2ZXJ5dGhpbmcgZWxzZSB0byBqc29uLlxuICAgKiBAcmV0dXJuIEpTT04gcGFyc2VkXG4gICAqL1xuICBmb3JtYXQob3V0cHV0KSB7XG4gICAgaWYgKHR5cGVvZiBvdXRwdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiAnLWludmFsaWQgY29tbWFuZDogQ29tbWFuZCByZXR1cm5lZCBpbnZhbGlkIGRhdGEgdHlwZS4nXG4gICAgfVxuICAgIGlmIChvdXRwdXQgPT09IHVuZGVmaW5lZCB8fCB0eXBlb2Ygb3V0cHV0ID09PSAndW5kZWZpbmVkJykge1xuICAgICAgcmV0dXJuICctaW52YWxpZCBjb21tYW5kOiBDb21tYW5kIHJldHVybmVkIG5vIGRhdGEuJ1xuICAgIH1cbiAgICByZXR1cm4gb3V0cHV0XG4gICAgLy8gdHJ5IHtcbiAgICAvLyAgIHJldHVybiBKU09OLnN0cmluZ2lmeShvdXRwdXQpXG4gICAgLy8gfSBjYXRjaCAoZSkge1xuICAgIC8vICAgcmV0dXJuICctaW52YWxpZCBjb21tYW5kOiBDb21tYW5kIHJldHVybmVkIGludmFsaWQgZGF0YSB0eXBlOiAnICsgZS5tZXNzYWdlXG4gICAgLy8gfVxuICB9XG5cbiAgLyoqXG4gICAqIEV4ZWMgQ29tbWFuZFxuICAgKiBAcmV0dXJuIEpTT04gU3RyaW5nIHdpdGggb3V0cHV0XG4gICAqL1xuICBleGVjKGNtZCkge1xuXG4gICAgLy8gIFBhcnNlIENvbW1hbmQgU3RyaW5nOiBbMF0gPSBjb21tYW5kIG5hbWUsIFsxK10gPSBhcmd1bWVudHNcbiAgICBsZXQgcGFyc2VkXG4gICAgdHJ5IHtcbiAgICAgIHBhcnNlZCA9IHRoaXMucGFyc2UoY21kKVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiAnLWZhdGFsIGNvbW1hbmQ6ICcgKyBlLm1lc3NhZ2UgfHwgJ1NvbWUgRXJyb3IgT2NjdXJlZCdcbiAgICB9XG5cbiAgICAvLyAgWC1jaGVjayBpZiBjb21tYW5kIGV4aXN0XG4gICAgY29uc3QgY29tbWFuZCA9IHRoaXMuU2hlbGxDb21tYW5kc1twYXJzZWRbMF1dXG4gICAgaWYgKCFjb21tYW5kKSB7XG4gICAgICByZXR1cm4gYC1lcnJvciBzaGVsbDogQ29tbWFuZCA8JHtwYXJzZWRbMF19PiBkb2Vzbid0IGV4aXN0LlxcbmBcbiAgICB9XG5cbiAgICAvLyAgZ2V0IGFyZ3VtZW50cyBhcnJheSBhbmQgZXhlY3V0ZSBjb21tYW5kIHJldHVybiBlcnJvciBpZiB0aHJvd1xuICAgIGNvbnN0IGFyZ3MgPSBwYXJzZWQuZmlsdGVyKChlLCBpKSA9PiBpID4gMClcbiAgICBsZXQgb3V0cHV0XG4gICAgdHJ5IHtcbiAgICAgIG91dHB1dCA9IGNvbW1hbmQuZXhlYyhhcmdzKVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiAnLWZhdGFsIGNvbW1hbmQ6ICcgKyBlLm1lc3NhZ2VcbiAgICB9XG5cbiAgICAvLyAgRm9ybWF0IGRhdGEgYW5kIFJldHVyblxuICAgIHJldHVybiB0aGlzLmZvcm1hdChvdXRwdXQpXG4gIH1cblxuICAvKlxuICAgKiBHZW5lcmF0ZSBCdWlsdGluIENvbW1hbmQgTGlzdFxuICAgKi9cbiAgcmVnaXN0ZXJDb21tYW5kcyhTaGVsbFJlZmVyZW5jZSwgY3VzdG9tQ29tbWFuZHMgPSB1bmRlZmluZWQpIHtcbiAgICBsZXQgQmx1ZXByaW50cyA9IHJlcXVpcmUoJy4uL2NvbmZpZ3MvYnVpbHRpbi1jb21tYW5kcycpXG4gICAgLyoqXG4gICAgICogSWYgY3VzdG9tIGNvbW1hbmRzIGFyZSBwYXNzZWQgY2hlY2sgZm9yIHZhbGlkIHR5cGVcbiAgICAgKiBJZiBnb29kIHRvIGdvIGdlbmVyYXRlIHRob3NlIGNvbW1hbmRzXG4gICAgICovXG4gICAgaWYgKGN1c3RvbUNvbW1hbmRzKSB7XG4gICAgICBpZiAodHlwZW9mIGN1c3RvbUNvbW1hbmRzID09PSAnb2JqZWN0JyAmJiAhQXJyYXkuaXNBcnJheShjdXN0b21Db21tYW5kcykpIHtcbiAgICAgICAgQmx1ZXByaW50cyA9IGN1c3RvbUNvbW1hbmRzXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0N1c3RvbSBjb21tYW5kIHByb3ZpZGVkIGFyZSBub3QgaW4gYSB2YWxpZCBmb3JtYXQuJylcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBTaGVsbENvbW1hbmRzID0ge31cbiAgICBPYmplY3Qua2V5cyhCbHVlcHJpbnRzKS5tYXAoKGtleSkgPT4ge1xuICAgICAgY29uc3QgY21kID0gQmx1ZXByaW50c1trZXldXG4gICAgICBpZiAodHlwZW9mIGNtZC5uYW1lID09PSAnc3RyaW5nJyAmJiB0eXBlb2YgY21kLmZuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGNtZC5zaGVsbCA9IFNoZWxsUmVmZXJlbmNlXG4gICAgICAgIFNoZWxsQ29tbWFuZHNba2V5XSA9IG5ldyBDb21tYW5kKGNtZClcbiAgICAgIH1cbiAgICB9KVxuICAgIHJldHVybiBTaGVsbENvbW1hbmRzXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBJbnRlcnByZXRlclxuIiwiY29uc3QgSW50ZXJwcmV0ZXIgPSByZXF1aXJlKCcuL0ludGVycHJldGVyJylcbmNvbnN0IEZpbGVzeXN0ZW0gPSByZXF1aXJlKCcuL0ZpbGVzeXN0ZW0nKVxuXG4vKipcbiAqIFNoZWxsIENsYXNzIGluaGVyaXRzIGZyb20gSW50ZXJwcmV0ZXJcbiAqIE9wdGlvbnM6XG4gKiAgLSBmaWxlc3lzdGVtIHtPYmplY3R9XG4gKiAgLSBjb21tYW5kcyB7T2JqZWN0fVxuICogIC0gdXNlciB7U3RyaW5nfVxuICogIC0gaG9zdG5hbWUge1N0cmluZ31cbiAqL1xuY2xhc3MgU2hlbGwgZXh0ZW5kcyBJbnRlcnByZXRlcntcbiAgY29uc3RydWN0b3IoeyBmaWxlc3lzdGVtID0gdW5kZWZpbmVkLCBjb21tYW5kcyA9IHVuZGVmaW5lZCwgdXNlciA9ICdyb290JywgaG9zdG5hbWUgPSAnbXkuaG9zdC5tZScgfSA9IHt9KSB7XG4gICAgc3VwZXIoKVxuICAgIC8qKlxuICAgICAqIENyZWF0ZSB0aGUgdmlydHVhbCBmaWxlc3lzdGVtXG4gICAgICogQHJldHVybiByZWZlcmVuY2UgdG8gaW5zdGFuY2Ugb2YgQGNsYXNzIEZpbGVzeXN0ZW1cbiAgICAgKi9cbiAgICB0aGlzLmZzID0gbmV3IEZpbGVzeXN0ZW0oZmlsZXN5c3RlbSwgdGhpcylcbiAgICB0aGlzLnVzZXIgPSB1c2VyXG4gICAgdGhpcy5ob3N0bmFtZSA9IGhvc3RuYW1lXG5cbiAgICAvLyBJbml0IGJ1aWx0aW4gY29tbWFuZHMsIEBtZXRob2QgaW4gcGFyZW50XG4gICAgLy8gcGFzcyBzaGVsbCByZWZlcmVuY2VcbiAgICB0aGlzLlNoZWxsQ29tbWFuZHMgPSB0aGlzLnJlZ2lzdGVyQ29tbWFuZHModGhpcylcbiAgICB0aGlzLlNoZWxsQ29tbWFuZHMgPSB7XG4gICAgICAuLi50aGlzLlNoZWxsQ29tbWFuZHMsXG4gICAgICAuLi50aGlzLnJlZ2lzdGVyQ29tbWFuZHModGhpcywgY29tbWFuZHMpLFxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBQYXNzIGNvbnRyb2wgdG8gSW50ZXJwcmV0ZXJcbiAgICogQHJldHVybiBvdXRwdXQgYXMgW1N0cmluZ11cbiAgICovXG4gIHJ1bihjbWQpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjKGNtZClcbiAgfVxufVxuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoU2hlbGwucHJvdG90eXBlLCAnZnMnLCB7IHdyaXRhYmxlOiB0cnVlLCBlbnVtZXJhYmxlOiBmYWxzZSB9KVxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFNoZWxsLnByb3RvdHlwZSwgJ1NoZWxsQ29tbWFuZHMnLCB7IHdyaXRhYmxlOiB0cnVlLCBlbnVtZXJhYmxlOiBmYWxzZSB9KVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNoZWxsXG4iLCJjb25zdCB7IG5hbWUsIHZlcnNpb24sIGRlc2NyaXB0aW9uLCByZXBvc2l0b3J5LCBhdXRob3IsIGxpY2Vuc2UgfSA9IHJlcXVpcmUoJy4uLy4uL3BhY2thZ2UuanNvbicpXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICAvKipcbiAgICogSGVscFxuICAgKiBAcmV0dXJuIExpc3Qgb2YgY29tbWFuZHNcbiAgICovXG4gIGhlbHA6IHtcbiAgICBuYW1lOiAnaGVscCcsXG4gICAgdHlwZTogJ2J1aWx0aW4nLFxuICAgIG1hbjogJ0xpc3Qgb2YgYXZhaWxhYmxlIGNvbW1hbmRzJyxcbiAgICBmbjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gYENvbW1hbmRzIGF2YWlsYWJsZTogJHtPYmplY3Qua2V5cyh0aGlzLnNoZWxsLlNoZWxsQ29tbWFuZHMpLmpvaW4oJywgJyl9YFxuICAgIH1cbiAgfSxcblxuICB3aG9hbWk6IHtcbiAgICBuYW1lOiAnd2hvYW1pJyxcbiAgICB0eXBlOiAnYnVpbHRpbicsXG4gICAgbWFuOiAnQ3VycmVudCB1c2VyJyxcbiAgICBmbjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5zaGVsbC51c2VyXG4gICAgfSxcbiAgfSxcblxuICBhYm91dDoge1xuICAgIG5hbWU6ICdhYm91dCcsXG4gICAgdHlwZTogJ2J1aWx0aW4nLFxuICAgIG1hbjogJ0Fib3V0IHRoaXMgcHJvamVjdCcsXG4gICAgZm46IGZ1bmN0aW9uKCkge1xuICAgICAgbGV0IHN0ciA9ICcnXG4gICAgICBzdHIgKz0gYG5hbWU6ICR7bmFtZX1cXG5gXG4gICAgICBzdHIgKz0gYHZlcnNpb246ICR7dmVyc2lvbn1cXG5gXG4gICAgICBzdHIgKz0gYGRlc2NyaXB0aW9uOiAke2Rlc2NyaXB0aW9ufVxcbmBcbiAgICAgIHN0ciArPSBgcmVwb3NpdG9yeTogJHtyZXBvc2l0b3J5fVxcbmBcbiAgICAgIHN0ciArPSBgYXV0aG9yOiAke2F1dGhvcn1cXG5gXG4gICAgICBzdHIgKz0gYGxpY2Vuc2U6ICR7bGljZW5zZX1cXG5gXG4gICAgICByZXR1cm4gc3RyXG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBSZXR1cm4gcGFzc2VkIGFyZ3VtZW50cywgZm9yIHRlc3RpbmcgcHVycG9zZXNcbiAgICovXG4gIGFyZ3VtZW50czoge1xuICAgIG5hbWU6ICdhcmd1bWVudHMnLFxuICAgIHR5cGU6ICdidWlsdGluJyxcbiAgICBtYW46ICdSZXR1cm4gYXJndW1lbnQgcGFzc2VkLCB1c2VkIGZvciB0ZXN0aW5nIHB1cnBvc2UnLFxuICAgIGZuOiBhcmdzID0+IGFyZ3NcbiAgfSxcblxuICAvKipcbiAgICogQ2hhbmdlIERpcmVjdG9yeVxuICAgKiBAcmV0dXJuIFN1Y2Nlc3MvRmFpbCBNZXNzYWdlIFN0cmluZ1xuICAgKi9cbiAgY2Q6IHtcbiAgICBuYW1lOiAnY2QnLFxuICAgIHR5cGU6ICdidWlsdGluJyxcbiAgICBtYW46ICdDaGFuZ2UgZGlyZWN0b3J5LCBwYXNzIGFic29sdXRlIG9yIHJlbGF0aXZlIHBhdGg6IGVnLiBjZCAvZXRjLCBjZCAvIGNkL215L25lc3RlZC9kaXInLFxuICAgIGZuOiBmdW5jdGlvbihwYXRoKSB7XG4gICAgICBpZiAoIXBhdGgpIHRocm93IG5ldyBFcnJvcignLWludmFsaWQgTm8gcGF0aCBwcm92aWRlZC4nKVxuICAgICAgcGF0aCA9IHBhdGguam9pbigpXG4gICAgICB0cnl7XG4gICAgICAgIHJldHVybiB0aGlzLnNoZWxsLmZzLmNoYW5nZURpcihwYXRoKVxuICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgIHRocm93IGVcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIGxzIENvbW1hbmRcbiAgICogTGlzdCBkaXJlY3RvcnkgZmlsZXNcbiAgICogQHBhcmFtIGFycmF5IG9mIGFyZ3NcbiAgICogQHJldHVybiBmb3JtYXR0ZWQgU3RyaW5nXG4gICAqL1xuICBsczoge1xuICAgIG5hbWU6ICdscycsXG4gICAgdHlwZTogJ2J1aWx0aW4nLFxuICAgIG1hbjogJ2xpc3QgZGlyZWN0b3J5IGZpbGVzLCBwYXNzIGFic29sdXRlL3JlbGF0aXZlIHBhdGgsIGlmIGVtcHR5IGxpc3QgY3VycmVudCBkaXJlY3RvcnknLFxuICAgIGZuOiBmdW5jdGlvbihwYXRoID0gWycuLyddICkge1xuICAgICAgcGF0aCA9IHBhdGguam9pbigpXG4gICAgICBsZXQgbGlzdCwgcmVzcG9uc2VTdHJpbmcgPSAnJ1xuICAgICAgdHJ5e1xuICAgICAgICBsaXN0ID0gdGhpcy5zaGVsbC5mcy5saXN0RGlyKHBhdGgpXG4gICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgdGhyb3cgZVxuICAgICAgfVxuICAgICAgZm9yIChsZXQgZmlsZSBpbiBsaXN0KSB7XG4gICAgICAgIGlmIChsaXN0Lmhhc093blByb3BlcnR5KGZpbGUpKSB7XG4gICAgICAgICAgcmVzcG9uc2VTdHJpbmcgKz0gYCR7bGlzdFtmaWxlXS5wZXJtaXNzaW9ufVxcdCR7bGlzdFtmaWxlXS51c2VyfSAke2xpc3RbZmlsZV0uZ3JvdXB9XFx0JHtsaXN0W2ZpbGVdLm5hbWV9XFxuYFxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzcG9uc2VTdHJpbmdcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIENBVCBDb21tYW5kXG4gICAqIFJlYWQgRmlsZVxuICAgKiBAcmV0dXJuIGZvcm1hdHRlZCBTdHJpbmdcbiAgICovXG4gIGNhdDoge1xuICAgIG5hbWU6ICdjYXQnLFxuICAgIHR5cGU6ICdidWlsdGluJyxcbiAgICBtYW46ICdSZXR1cm4gZmlsZSBjb250ZW50LCB0YWtlIG9uZSBhcmd1bWVudDogZmlsZSBwYXRoIChyZWxhdGl2ZS9hYnNvbHV0ZSknLFxuICAgIGZuOiBmdW5jdGlvbihwYXRoID0gWycuLyddKSB7XG4gICAgICBwYXRoID0gcGF0aC5qb2luKClcbiAgICAgIGxldCBmaWxlLCByZXNwb25zZVN0cmluZyA9ICcnXG4gICAgICB0cnl7XG4gICAgICAgIGZpbGUgPSB0aGlzLnNoZWxsLmZzLnJlYWRGaWxlKHBhdGgpXG4gICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgdGhyb3cgZVxuICAgICAgfVxuICAgICAgcmV0dXJuIGZpbGUuY29udGVudFxuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogTWFuXG4gICAqIFJldHVybiBjb21tYW5kIG1hbnVhbCBpbmZvXG4gICAqIEByZXR1cm4ge3N0cmluZ31cbiAgICovXG4gIG1hbjoge1xuICAgIG5hbWU6ICdtYW4nLFxuICAgIHR5cGU6ICdidWlsdGluJyxcbiAgICBtYW46ICdDb21tYW5kIG1hbnVhbCwgdGFrZXMgb25lIGFyZ3VtZW50LCBjb21tYW5kIG5hbWUnLFxuICAgIGZuOiBmdW5jdGlvbihhcmdzKSB7XG4gICAgICBpZiAoIWFyZ3MgfHwgIWFyZ3NbMF0pIHRocm93IG5ldyBFcnJvcignbWFuOiBubyBjb21tYW5kIHByb3ZpZGVkLicpXG4gICAgICBsZXQgY29tbWFuZCA9IGFyZ3NbMF1cbiAgICAgIGlmICghdGhpcy5zaGVsbC5TaGVsbENvbW1hbmRzW2NvbW1hbmRdKSB0aHJvdyBuZXcgRXJyb3IoJ2NvbW1hbmQgZG9lc25cXCd0IGV4aXN0LicpXG4gICAgICBpZiAoIXRoaXMuc2hlbGwuU2hlbGxDb21tYW5kc1tjb21tYW5kXS5tYW4pIHRocm93IG5ldyBFcnJvcignbm8gbWFudWFsIGVudHJ5IGZvciB0aGlzIGNvbW1hbmQuJylcbiAgICAgIHJldHVybiB0aGlzLnNoZWxsLlNoZWxsQ29tbWFuZHNbY29tbWFuZF0ubWFuXG4gICAgfSxcbiAgfSxcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuXG4gICdmaWxlLmgnOiAnI2luY2x1ZGUgPG5vcGUuaD4nLFxuXG4gIGV0Yzoge1xuICAgIGFwYWNoZTI6IHtcbiAgICAgICdhcGFjaGUyLmNvbmYnOiAnTm90IFdoYXQgeW91IHdlcmUgbG9va2luZyBmb3IgOiknLFxuICAgIH0sXG4gIH0sXG5cbiAgaG9tZToge1xuICAgIGd1ZXN0OiB7XG4gICAgICBkb2NzOiB7XG4gICAgICAgICdteWRvYy5tZCc6ICdUZXN0RmlsZScsXG4gICAgICAgICdteWRvYzIubWQnOiAnVGVzdEZpbGUyJyxcbiAgICAgICAgJ215ZG9jMy5tZCc6ICdUZXN0RmlsZTMnLFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuXG4gIHJvb3Q6e1xuICAgICcuenNocmMnOiAnbm90IGV2ZW4gY2xvc2UgOiknLFxuICAgICcub2gtbXktenNoJzoge1xuICAgICAgdGhlbWVzOiB7fSxcbiAgICB9LFxuICB9LFxufVxuIiwiLyoqXG4gKiBTaGVsbCBPbmx5XG4gKiBAdHlwZSB7Q2xhc3N9XG4gKiBJbml0IHRoZSBzaGVsbCB3aXRoIGNvbW1hbmQgYW5kIGZpbGVzeXN0ZW1cbiAqIEBtZXRob2QgZXhlY3V0ZSgpIGV4cG9zZWQgdG8gcXVlcnkgdGhlIFNoZWxsIHdpdGggY29tbWFuZHNcbiAqL1xuZ2xvYmFsWydUZXJtbHknXSA9IHJlcXVpcmUoJy4vY2xhc3Nlcy9TaGVsbCcpXG4iLCJtb2R1bGUuZXhwb3J0cz17XG4gIFwibmFtZVwiOiBcInRlcm1seS5qc1wiLFxuICBcInZlcnNpb25cIjogXCIyLjAuMFwiLFxuICBcImRlc2NyaXB0aW9uXCI6IFwiU2ltcGxlLCBFeHRlbnNpYmxlLCBMaWdodHdlaWdodCBKYXZhc2NyaXB0IEJyb3dzZXIgVGVybWluYWwgU2ltdWxhdG9yIVwiLFxuICBcIm1haW5cIjogXCJkaXN0L3Rlcm1seS5taW4uanNcIixcbiAgXCJzY3JpcHRzXCI6IHtcbiAgICBcInRlc3RcIjogXCJtb2NoYSAtLWNvbXBpbGVycyBiYWJlbC1jb3JlL3JlZ2lzdGVyIHRlc3RzL1wiLFxuICAgIFwiYnVpbGRcIjogXCJndWxwXCJcbiAgfSxcbiAgXCJrZXl3b3Jkc1wiOiBbXG4gICAgXCJ0ZXJtaW5hbFwiLFxuICAgIFwiamF2YXNjcmlwdFwiLFxuICAgIFwic2ltdWxhdG9yXCIsXG4gICAgXCJicm93c2VyXCIsXG4gICAgXCJwcmVzZW50YXRpb25cIixcbiAgICBcIm1vY2t1cFwiLFxuICAgIFwiZGVtb1wiLFxuICAgIFwiY2xpXCIsXG4gICAgXCJwcm9tcHRcIixcbiAgICBcImNvbW1hbmRzXCIsXG4gICAgXCJubyBkZXBlbmN5XCIsXG4gICAgXCJsaWdodHdlaWdodFwiLFxuICAgIFwianNcIixcbiAgICBcInZhbmlsbGFcIlxuICBdLFxuICBcInJlcG9zaXRvcnlcIjogXCJodHRwczovL2dpdGh1Yi5jb20vS2lya2hhbW1ldHovdGVybWx5LmpzXCIsXG4gIFwiYXV0aG9yXCI6IFwiU2ltb25lIENvcnNpXCIsXG4gIFwibGljZW5zZVwiOiBcIklTQ1wiLFxuICBcImRldkRlcGVuZGVuY2llc1wiOiB7XG4gICAgXCJiYWJlbFwiOiBcIl42LjUuMlwiLFxuICAgIFwiYmFiZWwtY29yZVwiOiBcIl42LjIxLjBcIixcbiAgICBcImJhYmVsLXBvbHlmaWxsXCI6IFwiXjYuMjIuMFwiLFxuICAgIFwiYmFiZWwtcHJlc2V0LWVzMjAxNVwiOiBcIl42LjE4LjBcIixcbiAgICBcImJhYmVsLXByZXNldC1zdGFnZS0zXCI6IFwiXjYuMTcuMFwiLFxuICAgIFwiYmFiZWxpZnlcIjogXCJeNy4zLjBcIixcbiAgICBcImJyb3dzZXJpZnlcIjogXCJeMTMuMy4wXCIsXG4gICAgXCJjaGFpXCI6IFwiXjMuNS4wXCIsXG4gICAgXCJjaGFsa1wiOiBcIl4xLjEuM1wiLFxuICAgIFwiZXM2LXByb21pc2VcIjogXCJeNC4wLjVcIixcbiAgICBcImd1bHBcIjogXCJeMy45LjFcIixcbiAgICBcImd1bHAtcmVuYW1lXCI6IFwiXjEuMi4yXCIsXG4gICAgXCJndWxwLXNvdXJjZW1hcHNcIjogXCJeMi40LjBcIixcbiAgICBcImd1bHAtdWdsaWZ5XCI6IFwiXjIuMC4wXCIsXG4gICAgXCJndWxwLXV0aWxcIjogXCJeMy4wLjhcIixcbiAgICBcIm1vY2hhXCI6IFwiXjMuMi4wXCIsXG4gICAgXCJ1Z2xpZnktanNcIjogXCJeMi42LjRcIixcbiAgICBcInV0aWxzLW1lcmdlXCI6IFwiXjEuMC4wXCIsXG4gICAgXCJ2aW55bC1idWZmZXJcIjogXCJeMS4wLjBcIixcbiAgICBcInZpbnlsLXNvdXJjZS1zdHJlYW1cIjogXCJeMS4xLjBcIixcbiAgICBcIndhdGNoaWZ5XCI6IFwiXjMuOC4wXCJcbiAgfVxufVxuIl19
