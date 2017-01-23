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
        shell = _ref$shell === undefined ? undefined : _ref$shell;

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
      if (fileType === 'dir' && node.type === 'file') {
        throw new Error('Its a file not a directory');
      }
      if (fileType === 'file' && node.type === 'dir') {
        throw new Error('Its a directory not a file');
      }
      if (!node || node.content) {
        throw new Error('Invalid Path, doent exist');
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
 *
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

module.exports = {

  /**
   * Help
   * @return List of commands
   */
  help: {
    name: 'help',
    type: 'builtin',
    fn: function fn() {
      return 'Commands avaible: ' + Object.keys(this.shell.ShellCommands).join(', ');
    }
  },

  whoami: {
    name: 'whoami',
    type: 'builtin',
    fn: function fn() {
      return this.shell.user;
    }
  },

  /**
   * Return passed arguments, for testing purposes
   */
  arguments: {
    name: 'arguments',
    type: 'builtin',
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
      for (var _file in list) {
        if (list.hasOwnProperty(_file)) {
          responseString += list[_file].permission + '\t' + list[_file].user + ' ' + list[_file].group + '\t' + list[_file].name + '\n';
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
    fn: function fn() {
      var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : ['./'];

      path = path.join();
      console.log(path);
      var list = void 0,
          responseString = '';
      try {
        file = this.shell.fs.readFile(path);
      } catch (e) {
        throw e;
      }
      console.log(file);
      return responseString;
    }
  }

};

},{}],8:[function(require,module,exports){
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

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJiaW4vYnJvd3Nlci1zaGVsbC5qcyIsImJpbi9jbGFzc2VzL0NvbW1hbmQuanMiLCJiaW4vY2xhc3Nlcy9GaWxlLmpzIiwiYmluL2NsYXNzZXMvRmlsZXN5c3RlbS5qcyIsImJpbi9jbGFzc2VzL0ludGVycHJldGVyLmpzIiwiYmluL2NsYXNzZXMvU2hlbGwuanMiLCJiaW4vY29uZmlncy9idWlsdGluLWNvbW1hbmRzLmpzIiwiYmluL2NvbmZpZ3MvZGVmYXVsdC1maWxlc3lzdGVtLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7O0FDQUE7Ozs7OztBQU1BLE9BQU8sT0FBUCxJQUFrQixRQUFRLGlCQUFSLENBQWxCOzs7Ozs7Ozs7OztBQ05BOzs7Ozs7SUFNTSxPO0FBQ0oscUJBQStEO0FBQUEsbUZBQUgsRUFBRztBQUFBLFFBQWpELElBQWlELFFBQWpELElBQWlEO0FBQUEsUUFBM0MsRUFBMkMsUUFBM0MsRUFBMkM7QUFBQSx5QkFBdkMsSUFBdUM7QUFBQSxRQUF2QyxJQUF1Qyw2QkFBaEMsS0FBZ0M7QUFBQSwwQkFBekIsS0FBeUI7QUFBQSxRQUF6QixLQUF5Qiw4QkFBakIsU0FBaUI7O0FBQUE7O0FBQzdELFFBQUksT0FBTyxJQUFQLEtBQWdCLFFBQXBCLEVBQThCLE1BQU0sTUFBTSwrQkFBTixDQUFOO0FBQzlCLFFBQUksT0FBTyxFQUFQLEtBQWMsVUFBbEIsRUFBOEIsTUFBTSxNQUFNLHdDQUFOLENBQU47O0FBRTlCOzs7O0FBSUEsU0FBSyxFQUFMLEdBQVUsR0FBRyxJQUFILENBQVEsSUFBUixDQUFWO0FBQ0EsU0FBSyxJQUFMLEdBQVksSUFBWjtBQUNBLFNBQUssSUFBTCxHQUFZLElBQVo7O0FBRUEsUUFBSSxLQUFKLEVBQVc7QUFDVCxXQUFLLEtBQUwsR0FBYSxLQUFiO0FBQ0Q7QUFDRjs7QUFFRDs7Ozs7Ozs7OzsyQkFNZ0I7QUFBQSxVQUFYLElBQVcsdUVB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b0IsS0FBcEIsQ0FBSixFQUErQjtBQUM3Qiw0QkFBcUIsS0FBSyxLQUFMLEVBQVcsVUFBaEMsVUFBK0MsS0FBSyxLQUFMLEVBQVcsSUFBMUQsU0FBa0UsS0FBSyxLQUFMLEVBQVcsS0FBN0UsVUFBdUYsS0FBSyxLQUFMLEVBQVcsSUFBbEc7QUFDRDtBQUNGO0FBQ0QsYUFBTyxjQUFQO0FBQ0Q7QUFqQkMsR0F2RFc7O0FBMkVmOzs7OztBQUtBLE9BQUs7QUFDSCxVQUFNLEtBREg7QUFFSCxVQUFNLFNBRkg7QUFHSCxRQUFJLGNBQXdCO0FBQUEsVUFBZixJQUFlLHVFQUFSLENBQUMsSUFBRCxDQUFROztBQUMxQixhQUFPLEtBQUssSUFBTCxFQUFQO0FBQ0EsY0FBUSxHQUFSLENBQVksSUFBWjtBQUNBLFVBQUksYUFBSjtBQUFBLFVBQVUsaUJBQWlCLEVBQTNCO0FBQ0EsVUFBRztBQUNELGVBQU8sS0FBSyxLQUFMLENBQVcsRUFBWCxDQUFjLFFBQWQsQ0FBdUIsSUFBdkIsQ0FBUDtBQUNELE9BRkQsQ0FFRSxPQUFNLENBQU4sRUFBUztBQUNULGNBQU0sQ0FBTjtBQUNEO0FBQ0QsY0FBUSxHQUFSLENBQVksSUFBWjtBQUNBLGFBQU8sY0FBUDtBQUNEO0FBZEU7O0FBaEZVLENBQWpCOzs7OztBQ0FBLE9BQU8sT0FBUCxHQUFpQjs7QUFFZixZQUFVLG1CQUZLOztBQUlmLE9BQUs7QUFDSCxhQUFTO0FBQ1Asc0JBQWdCO0FBRFQ7QUFETixHQUpVOztBQVVmLFFBQU07QUFDSixXQUFPO0FBQ0wsWUFBTTtBQUNKLG9CQUFZLFVBRFI7QUFFSixxQkFBYSxXQUZUO0FBR0oscUJBQWE7QUFIVDtBQUREO0FBREgsR0FWUzs7QUFvQmYsUUFBSztBQUNILGNBQVUsbUJBRFA7QUFFSCxrQkFBYztBQUNaLGNBQVE7QUFESTtBQUZYO0FBcEJVLENBQWpCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxuICogU2hlbGwgT25seVxuICogQHR5cGUge0NsYXNzfVxuICogSW5pdCB0aGUgc2hlbGwgd2l0aCBjb21tYW5kIGFuZCBmaWxlc3lzdGVtXG4gKiBAbWV0aG9kIGV4ZWN1dGUoKSBleHBvc2VkIHRvIHF1ZXJ5IHRoZSBTaGVsbCB3aXRoIGNvbW1hbmRzXG4gKi9cbmdsb2JhbFsnU2hlbGwnXSA9IHJlcXVpcmUoJy4vY2xhc3Nlcy9TaGVsbCcpXG4iLCIvKipcbiAqIENvbW1hbmQgQ2xhc3NcbiAqIEBwYXJhbSBuYW1lIFtTdHJpbmddLCBmbiBbRnVuY3Rpb25dXG4gKlxuICogZG9uJ3QgcGFzcyBhcnJvdyBmdW5jdGlvbiBpZiB5b3Ugd2FudCB0byB1c2UgdGhpcyBpbnNpZGUgeW91ciBjb21tYW5kIGZ1bmN0aW9uIHRvIGFjY2VzcyB2YXJpb3VzIHNoYXJlZCBzaGVsbCBvYmplY3RcbiAqL1xuY2xhc3MgQ29tbWFuZCB7XG4gIGNvbnN0cnVjdG9yKHsgbmFtZSwgZm4sIHR5cGUgPSAndXNyJywgc2hlbGwgPSB1bmRlZmluZWQgfSA9IHt9KXtcbiAgICBpZiAodHlwZW9mIG5hbWUgIT09ICdzdHJpbmcnKSB0aHJvdyBFcnJvcignQ29tbWFuZCBuYW1lIG11c3QgYmUgYSBzdHJpbmcnKVxuICAgIGlmICh0eXBlb2YgZm4gIT09ICdmdW5jdGlvbicpIHRocm93IEVycm9yKCdDb21tYW5kIGZ1bmN0aW9uIG11c3QgYmUuLi4gYSBmdW5jdGlvbicpXG5cbiAgICAvKipcbiAgICAgKiB1c2Ugd2hvbGUgZnVuY3Rpb24gaW5zdGVhZCBvZiBhcnJvdyBpZiB5b3Ugd2FudCB0byBhY2Nlc3NcbiAgICAgKiBjaXJjdWxhciByZWZlcmVuY2Ugb2YgQ29tbWFuZFxuICAgICAqL1xuICAgIHRoaXMuZm4gPSBmbi5iaW5kKHRoaXMpXG4gICAgdGhpcy5uYW1lID0gbmFtZVxuICAgIHRoaXMudHlwZSA9IHR5cGVcblxuICAgIGlmIChzaGVsbCkge1xuICAgICAgdGhpcy5zaGVsbCA9IHNoZWxsXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIERpc3BhdGNoIENvbW1hbmQgRXhlY3V0aW9uXG4gICAqXG4gICAqIEB0aXAgZG9uJ3QgdXNlIGFycm93IGZ1bmN0aW9uIGluIHlvdSBjb21tYW5kIGlmIHlvdSB3YW50IHRoZSBhcmd1bWVudHNcbiAgICogbmVpdGhlciBzdXBlciBhbmQgYXJndW1lbnRzIGdldCBiaW5kZWQgaW4gQUYuXG4gICAqL1xuICBleGVjKGFyZ3MgPSBbXSkge1xuICAgIGlmICghQXJyYXkuaXNBcnJheShhcmdzKSkgdGhyb3cgRXJyb3IoJ0NvbW1hbmQgZXhlYyBhcmdzIG11c3QgYmUgaW4gYW4gYXJyYXknKVxuICAgIGlmIChhcmdzLmxlbmd0aCkgcmV0dXJuIHRoaXMuZm4oYXJncylcbiAgICByZXR1cm4gdGhpcy5mbigpXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBDb21tYW5kXG4iLCIvKipcbiAqIEBjbGFzcyBTaW5nbGUgRmlsZSBDbGFzc1xuICogU2ltdWxhdGUgZmlsZSBwcm9wZXJ0aWVzXG4gKi9cbmNsYXNzIEZpbGUge1xuICBjb25zdHJ1Y3Rvcih7IG5hbWUgPSAnJywgdHlwZSA9ICdmaWxlJywgY29udGVudCA9ICcnfSA9IHt9KSB7XG4gICAgdGhpcy51aWQgPSB0aGlzLmdlblVpZCgpXG4gICAgdGhpcy5uYW1lID0gbmFtZVxuICAgIHRoaXMudHlwZSA9IHR5cGVcbiAgICB0aGlzLmNvbnRlbnQgPSBjb250ZW50XG4gICAgdGhpcy51c2VyID0gJ3Jvb3QnXG4gICAgdGhpcy5ncm91cCA9ICdyb290J1xuXG4gICAgaWYgKHRoaXMudHlwZSA9PT0gJ2ZpbGUnKSB7XG4gICAgICB0aGlzLnBlcm1pc3Npb24gPSAncnd4ci0tci0tJ1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnBlcm1pc3Npb24gPSAnZHJ3eHIteHIteCdcbiAgICB9XG5cbiAgfVxuXG4gIGdlblVpZCgpIHtcbiAgICBmdW5jdGlvbiBzNCgpIHtcbiAgICAgIHJldHVybiBNYXRoLmZsb29yKCgxICsgTWF0aC5yYW5kb20oKSkgKiAweDEwMDAwKVxuICAgICAgICAudG9TdHJpbmcoMTYpXG4gICAgICAgIC5zdWJzdHJpbmcoMSk7XG4gICAgfVxuICAgIHJldHVybiBzNCgpICsgczQoKSArICctJyArIHM0KCkgKyAnLScgKyBzNCgpICsgJy0nICtcbiAgICAgIHM0KCkgKyAnLScgKyBzNCgpICsgczQoKSArIHM0KCk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGaWxlXG4iLCJjb25zdCBERUZBVUxUX0ZTID0gcmVxdWlyZSgnLi4vY29uZmlncy9kZWZhdWx0LWZpbGVzeXN0ZW0nKVxuY29uc3QgRmlsZSA9IHJlcXVpcmUoJy4vRmlsZScpXG5cbi8qKlxuICogQGNsYXNzIFZpcnR1YWwgRmlsZXN5c3RlbVxuICogUmVwcmVzZW50ZWQgYXMgYW4gb2JqZWN0IG9mIG5vZGVzXG4gKi9cbmNsYXNzIEZpbGVzeXN0ZW0ge1xuICBjb25zdHJ1Y3RvcihmcyA9IERFRkFVTFRfRlMsIHNoZWxsID0ge30pIHtcbiAgICB0aGlzLnNoZWxsID0gc2hlbGxcbiAgICBpZiAodHlwZW9mIGZzICE9PSAnb2JqZWN0JyB8fCBBcnJheS5pc0FycmF5KGZzKSkgdGhyb3cgbmV3IEVycm9yKCdWaXJ0dWFsIEZpbGVzeXN0ZW0gcHJvdmlkZWQgbm90IHZhbGlkLCBpbml0aWFsaXphdGlvbiBmYWlsZWQuJylcblxuICAgIC8vIE5vdCBCeSBSZWZlcmVuY2UuXG4gICAgLy8gSEFDSzogT2JqZWN0IGFzc2lnbiByZWZ1c2UgdG8gd29yayBhcyBpbnRlbmRlZC5cbiAgICBmcyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoZnMpKVxuICAgIHRoaXMuRmlsZVN5c3RlbSA9IHRoaXMuaW5pdEZzKGZzKVxuXG4gICAgLy8gQ1dEIGZvciBjb21tYW5kcyB1c2FnZVxuICAgIHRoaXMuY3dkID0gWycvJ11cbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0ICYgUGFzcyBDb250cm9sIHRvIHJlY3VycnNpdmUgZnVuY3Rpb25cbiAgICogQHJldHVybiBuZXcgRmlsZXN5c3RlbSBhcyBub2RlcyBvZiBtdWx0aXBsZSBAY2xhc3MgRmlsZVxuICAgKi9cbiAgaW5pdEZzKGZzKSB7XG4gICAgdGhpcy5idWlsZFZpcnR1YWxGcyhmcylcbiAgICByZXR1cm4gZnNcbiAgfVxuXG4gIC8qKlxuICAgKiBUcmF2ZXJzZSBhbGwgbm9kZSBhbmQgYnVpbGQgYSB2aXJ0dWFsIHJlcHJlc2VudGF0aW9uIG9mIGEgZmlsZXN5c3RlbVxuICAgKiBFYWNoIG5vZGUgaXMgYSBGaWxlIGluc3RhbmNlLlxuICAgKiBAcGFyYW0gTW9ja2VkIEZpbGVzeXN0ZW0gYXMgT2JqZWN0XG4gICAqXG4gICAqL1xuICBidWlsZFZpcnR1YWxGcyhvYmopIHtcbiAgICBmb3IgKGxldCBrZXkgaW4gb2JqKSB7XG4gICAgICBpZiAob2JqLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBvYmpba2V5XSA9PT0gJ29iamVjdCcgJiYgIUFycmF5LmlzQXJyYXkob2JqW2tleV0pKSB7XG4gICAgICAgICAgb2JqW2tleV0gPSBuZXcgRmlsZSh7IG5hbWU6IGtleSwgY29udGVudDogb2JqW2tleV0sIHR5cGU6ICdkaXInIH0pXG4gICAgICAgICAgdGhpcy5idWlsZFZpcnR1YWxGcyhvYmpba2V5XS5jb250ZW50KVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG9ialtrZXldID0gbmV3IEZpbGUoeyBuYW1lOiBrZXksIGNvbnRlbnQ6IG9ialtrZXldIH0pXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2V0IGEgc3RyaW5nZWQgcGF0aCBhbmQgcmV0dXJuIGFzIGFycmF5XG4gICAqIHRocm93IGVycm9yIGlmIHBhdGggZm9ybWF0IGlzIGludmFsaWRcbiAgICogUmVsYXRpdmUgUGF0aCBnZXRzIGNvbnZlcnRlZCB1c2luZyBDdXJyZW50IFdvcmtpbmcgRGlyZWN0b3J5XG4gICAqIEBwYXJhbSBwYXRoIHtTdHJpbmd9XG4gICAqIEByZXR1cm4gQXJyYXlcbiAgICovXG4gIHBhdGhTdHJpbmdUb0FycmF5KHBhdGggPSAnJykge1xuICAgIGlmICghcGF0aC5sZW5ndGgpIHRocm93IG5ldyBFcnJvcignUGF0aCBjYW5ub3QgYmUgZW1wdHknKVxuXG4gICAgLy8gQ2hlY2sgZm9yIGludmFsaWQgcGF0aCwgZWcuIHR3bysgLy8gaW4gYSByb3dcbiAgICBpZiAocGF0aC5tYXRjaCgvXFwvezIsfS9nKSkgdGhyb3cgbmV3IEVycm9yKGAtaW52YWxpZCBwYXRoOiAke3BhdGh9YClcblxuICAgIC8vIEZvcm1hdCBhbmQgQ29tcG9zZXIgYXJyYXlcbiAgICBsZXQgcGF0aEFycmF5ID0gcGF0aC5zcGxpdCgnLycpXG4gICAgaWYgKHBhdGhBcnJheVswXSA9PT0gJycpIHBhdGhBcnJheVswXSA9ICcvJ1xuICAgIGlmIChwYXRoQXJyYXlbMF0gPT09ICcuJykgcGF0aEFycmF5LnNoaWZ0KClcbiAgICBpZihwYXRoQXJyYXlbcGF0aEFycmF5Lmxlbmd0aCAtIDFdID09PSAnJykgcGF0aEFycmF5LnBvcCgpXG5cbiAgICAvLyBoYW5kbGUgcmVsYXRpdmUgcGF0aCB3aXRoIGN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnlcbiAgICBpZiAocGF0aEFycmF5WzBdICE9PSAnLycpIHtcbiAgICAgIHBhdGhBcnJheSA9IHRoaXMuY3dkLmNvbmNhdChwYXRoQXJyYXkpXG4gICAgfVxuICAgIHJldHVybiBwYXRoQXJyYXlcbiAgfVxuXG4gIC8qKlxuICAgKiBQYXRoIGZyb20gYXJyYXkgdG8gU3RyaW5nXG4gICAqIEZvciBwcmVzZW50YXRpb25hbCBwdXJwb3NlLlxuICAgKiBUT0RPXG4gICAqIEBwYXJhbSBwYXRoIFtBcnJheV1cbiAgICogQHJldHVybiB7U3RyaW5nfVxuICAgKi9cbiAgcGF0aEFycmF5VG9TdHJpbmcocGF0aCA9IFtdKSB7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KHBhdGgpKSB0aHJvdyBuZXcgRXJyb3IoJy1mYXRhbCBmaWxlc3lzdGVtOiBwYXRoIG11c3QgYmUgYW4gYXJyYXknKVxuICAgIGlmICghcGF0aC5sZW5ndGgpIHRocm93IG5ldyBFcnJvcignLWludmFsaWQgZmlsZXN5c3RlbTogcGF0aCBub3QgcHJvdmlkZWQnKVxuICAgIGxldCBvdXRwdXQgPSBwYXRoLmpvaW4oJy8nKVxuICAgIC8vIHJlbW92ZSAvIG11bHRpcGxlIG9jY3VycmVuY2VcbiAgICByZXR1cm4gb3V0cHV0LnJlcGxhY2UoL1xcL3syLH0vZywgJy8nKVxuICB9XG5cbiAgLyoqXG4gICAqIEx1a2UuLiBmaWxlV2Fsa2VyXG4gICAqIEFjY2VwdHMgb25seSBBYnNvbHV0ZSBQYXRoLCB5b3UgbXVzdCBjb252ZXJ0IHBhdGhzIGJlZm9yZSBjYWxsaW5nIHVzaW5nIHBhdGhTdHJpbmdUb0FycmF5XG4gICAqIEBwYXJhbSBjYiBleGVjdXRlZCBvbiBlYWNoIGZpbGUgZm91bmRcbiAgICogQHBhcmFtIGZzIFtTaGVsbCBWaXJ0dWFsIEZpbGVzeXN0ZW1dXG4gICAqL1xuICBmaWxlV2Fsa2VyKHBhdGggPSBbJy8nXSwgZnMgPSB0aGlzLkZpbGVTeXN0ZW0pe1xuICAgIGlmICghQXJyYXkuaXNBcnJheShwYXRoKSkgdGhyb3cgbmV3IEVycm9yKCdQYXRoIG11c3QgYmUgYW4gYXJyYXkgb2Ygbm9kZXMsIHVzZSBGaWxlc3lzdGVtLnBhdGhTdHJpbmdUb0FycmF5KHtzdHJpbmd9KScpXG5cbiAgICAvLyBhdm9pZCBtb2RpZnlpbmcgZXh0ZXJuYWwgcGF0aCByZWZlcmVuY2VcbiAgICBwYXRoID0gcGF0aC5zbGljZSgwKVxuXG4gICAgLy8gVE9ETzpcbiAgICAvLyAgQ2hvb3NlOlxuICAgIC8vICAgIC0gR28gZnVsbCBwdXJlXG4gICAgLy8gICAgLSBXb3JrIG9uIHRoZSByZWZlcmVuY2Ugb2YgdGhlIGFjdHVhbCBub2RlXG4gICAgLy8gZnMgPSBPYmplY3QuYXNzaWduKGZzLCB7fSlcblxuICAgIC8vIEV4aXQgQ29uZGl0aW9uXG4gICAgaWYgKCFwYXRoLmxlbmd0aCkgcmV0dXJuIGZzXG5cbiAgICAvLyBHZXQgY3VycmVudCBub2RlXG4gICAgbGV0IG5vZGUgPSBwYXRoLnNoaWZ0KClcblxuICAgIC8vIEdvIGRlZXBlciBpZiBpdCdzIG5vdCB0aGUgcm9vdCBkaXJcbiAgICBpZiAobm9kZSAhPT0gJy8nKSB7XG4gICAgICAvLyBjaGVjayBpZiBub2RlIGV4aXN0XG4gICAgICBpZiAoZnNbbm9kZV0pIHtcbiAgICAgICAgLy8gcmV0dXJuIGZpbGUgb3IgZm9sZGVyXG4gICAgICAgIGZzID0gZnNbbm9kZV0udHlwZSA9PT0gJ2RpcicgPyBmc1tub2RlXS5jb250ZW50IDogZnNbbm9kZV1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignRmlsZSBkb2VzblxcJ3QgZXhpc3QnKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5maWxlV2Fsa2VyKHBhdGgsIGZzKVxuICB9XG5cbiAgLyoqXG4gICAqIHRyYXZlcnNlRmlsZXNcbiAgICogYWNjZXNzaW5nIGFsbCBmaWxlIGF0IGxlYXN0IG9uY2VcbiAgICogY2FsbGluZyBwcm92aWRlZCBjYWxsYmFjayBvbiBlYWNoXG4gICAqIEBwYXJhbSBjYiBleGVjdXRlZCBvbiBlYWNoIGZpbGUgZm91bmRcbiAgICogQHBhcmFtIGZzIFtTaGVsbCBWaXJ0dWFsIEZpbGVzeXN0ZW1dXG4gICAqL1xuICB0cmF2ZXJzZUZpbGVzKGNiID0gKCk9Pnt9LCBmcyA9IHRoaXMuRmlsZVN5c3RlbSl7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXMudHJhdmVyc2VGaWxlc1xuICAgIGZvciAobGV0IG5vZGUgaW4gZnMpIHtcbiAgICAgIGlmIChmcy5oYXNPd25Qcm9wZXJ0eShub2RlKSkge1xuICAgICAgICBpZiAoZnNbbm9kZV0udHlwZSA9PT0gJ2RpcicpIHRoaXMudHJhdmVyc2VGaWxlcyhjYiwgZnNbbm9kZV0uY29udGVudClcbiAgICAgICAgZWxzZSBjYihmc1tub2RlXSlcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogdHJhdmVyc2VEaXJzXG4gICAqIGFjY2Vzc2luZyBhbGwgZGlyZWN0b3J5IGF0IGxlYXN0IG9uY2VcbiAgICogY2FsbGluZyBwcm92aWRlZCBjYWxsYmFjayBvbiBlYWNoXG4gICAqIEBwYXJhbSBjYiBleGVjdXRlZCBvbiBlYWNoIGZpbGUgZm91bmRcbiAgICogQHBhcmFtIGZzIFtTaGVsbCBWaXJ0dWFsIEZpbGVzeXN0ZW1dXG4gICAqL1xuICB0cmF2ZXJzZURpcnMoY2IgPSAoKT0+e30sIGZzID0gdGhpcy5GaWxlU3lzdGVtKXtcbiAgICBmb3IgKGxldCBub2RlIGluIGZzKSB7XG4gICAgICBpZiAoZnMuaGFzT3duUHJvcGVydHkobm9kZSkpIHtcbiAgICAgICAgaWYgKGZzW25vZGVdLnR5cGUgPT09ICdkaXInKSB7XG4gICAgICAgICAgY2IoZnNbbm9kZV0pXG4gICAgICAgICAgdGhpcy50cmF2ZXJzZURpcnMoY2IsIGZzW25vZGVdLmNvbnRlbnQpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2V0IERpcmVjdG9yeSBOb2RlXG4gICAqIFBhc3NlZCBhcyBSZWZlcmVuY2Ugb3IgSW5zdGFuY2UsXG4gICAqIGRlcGVuZCBieSBhIGxpbmUgaW4gQG1ldGhvZCBmaWxlV2Fsa2VyLCBzZWUgY29tbWVudCB0aGVyZS5cbiAgICogQHJldHVybiBEaXJlY3RvcnkgTm9kZSBPYmplY3RcbiAgICovXG4gIGdldE5vZGUocGF0aCA9ICcnLCBmaWxlVHlwZSkge1xuICAgIGlmICh0eXBlb2YgcGF0aCAhPT0gJ3N0cmluZycpIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBpbnB1dC4nKVxuICAgIGxldCBwYXRoQXJyYXksIG5vZGVcbiAgICB0cnkge1xuICAgICAgcGF0aEFycmF5ID0gdGhpcy5wYXRoU3RyaW5nVG9BcnJheShwYXRoKVxuICAgICAgbm9kZSA9IHRoaXMuZmlsZVdhbGtlcihwYXRoQXJyYXkpXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhyb3cgZVxuICAgIH1cbiAgICBpZiAoZmlsZVR5cGUgPT09ICdkaXInICYmIG5vZGUudHlwZSA9PT0gJ2ZpbGUnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0l0cyBhIGZpbGUgbm90IGEgZGlyZWN0b3J5JylcbiAgICB9XG4gICAgaWYgKGZpbGVUeXBlID09PSAnZmlsZScgJiYgbm9kZS50eXBlID09PSAnZGlyJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJdHMgYSBkaXJlY3Rvcnkgbm90IGEgZmlsZScpXG4gICAgfVxuICAgIGlmICghbm9kZSB8fCBub2RlLmNvbnRlbnQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBQYXRoLCBkb2VudCBleGlzdCcpXG4gICAgfVxuICAgIHJldHVybiB7IHBhdGgsIHBhdGhBcnJheSAsIG5vZGUgfVxuICB9XG5cbiAgLyoqXG4gICAqIENoYW5nZSBDdXJyZW50IFdvcmtpbmcgRGlyZWN0b3J5IEdyYWNlZnVsbHlcbiAgICogQHJldHVybiBNZXNzYWdlIFN0cmluZy5cbiAgICovXG4gIGNoYW5nZURpcihwYXRoID0gJycpIHtcbiAgICBsZXQgcmVzdWx0XG4gICAgdHJ5IHtcbiAgICAgIHJlc3VsdCA9IHRoaXMuZ2V0Tm9kZShwYXRoLCAnZGlyJylcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIHRocm93IGVyclxuICAgIH1cbiAgICB0aGlzLmN3ZCA9IHJlc3VsdC5wYXRoQXJyYXlcbiAgICByZXR1cm4gYGNoYW5nZWQgZGlyZWN0b3J5LmBcbiAgfVxuXG4gIC8qKlxuICAgKiBMaXN0IEN1cnJlbnQgV29ya2luZyBEaXJlY3RvcnkgRmlsZXNcbiAgICogQHJldHVybiB7fVxuICAgKi9cbiAgbGlzdERpcihwYXRoID0gJycpIHtcbiAgICBsZXQgcmVzdWx0XG4gICAgdHJ5IHtcbiAgICAgIHJlc3VsdCA9IHRoaXMuZ2V0Tm9kZShwYXRoLCAnZGlyJylcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIHRocm93IGVyclxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0Lm5vZGVcbiAgfVxuXG4gIHJlYWRGaWxlKHBhdGggPSAnJykge1xuICAgIGxldCByZXN1bHRcbiAgICB0cnkge1xuICAgICAgcmVzdWx0ID0gdGhpcy5nZXROb2RlKHBhdGgsICdmaWxlJylcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIHRocm93IGVyclxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0Lm5vZGVcbiAgfVxuXG4gIGdldEN1cnJlbnREaXJlY3RvcnkoKSB7XG4gICAgbGV0IGN3ZEFzU3RyaW5nXG4gICAgdHJ5IHtcbiAgICAgIGN3ZEFzU3RyaW5nID0gdGhpcy5wYXRoQXJyYXlUb1N0cmluZyh0aGlzLmN3ZClcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4gJy1pbnZhbGlkIGZpbGVzeXN0ZW06IEFuIGVycm9yIG9jY3VyZWQgd2hpbGUgcGFyc2luZyBjdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5IHRvIHN0cmluZy4nXG4gICAgfVxuICAgIHJldHVybiBjd2RBc1N0cmluZ1xuICB9XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGaWxlc3lzdGVtXG4iLCJjb25zdCBDb21tYW5kID0gcmVxdWlyZSgnLi9Db21tYW5kJylcblxuLyoqXG4gKlxuICogSW50ZXJwcmV0ZXJcbiAqIElzIHRoZSBwYXJlbnQgQ2xhc3Mgb2YgdGhlIE1haW4gU2hlbGwgQ2xhc3NcbiAqIC0gVGhpcyBjbGFzcyBpcyB0aGUgb25lIHRoYXQgcGFyc2UgYW5kIHJ1biBleGVjIG9mIGNvbW1hbmRcbiAqIC0gUGFyc2luZyBvZiBidWlsdGluIGNvbW1hbmQgb24gcnVudGltZSBoYXBwZW4gaGVyZVxuICogLSBXaWxsIHBhcnNlIGN1c3RvbSB1c2VyIENvbW1hbmQgdG9vXG4gKlxuICovXG5jbGFzcyBJbnRlcnByZXRlciB7XG5cbiAgLyoqXG4gICAqIFBhcnNlIENvbW1hbmRcbiAgICogQHJldHVybiBBcnJheSBvZiBhcmdzIGFzIGluIENcbiAgICovXG4gIHBhcnNlKGNtZCkge1xuICAgIGlmICh0eXBlb2YgY21kICE9PSAnc3RyaW5nJykgdGhyb3cgbmV3IEVycm9yKCdDb21tYW5kIG11c3QgYmUgYSBzdHJpbmcnKVxuICAgIGlmICghY21kLmxlbmd0aCkgdGhyb3cgbmV3IEVycm9yKCdDb21tYW5kIGlzIGVtcHR5JylcbiAgICByZXR1cm4gY21kLnNwbGl0KCcgJylcbiAgfVxuXG4gIC8qKlxuICAgKiBGb3JtYXQgT3V0cHV0XG4gICAqIHJldHVybiBlcnJvciBpZiBmdW5jdGlvbiBpcyByZXR1cm5lZFxuICAgKiBjb252ZXJ0IGV2ZXJ5dGhpbmcgZWxzZSB0byBqc29uLlxuICAgKiBAcmV0dXJuIEpTT04gcGFyc2VkXG4gICAqL1xuICBmb3JtYXQob3V0cHV0KSB7XG4gICAgaWYgKHR5cGVvZiBvdXRwdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiAnLWludmFsaWQgY29tbWFuZDogQ29tbWFuZCByZXR1cm5lZCBpbnZhbGlkIGRhdGEgdHlwZS4nXG4gICAgfVxuICAgIGlmIChvdXRwdXQgPT09IHVuZGVmaW5lZCB8fCB0eXBlb2Ygb3V0cHV0ID09PSAndW5kZWZpbmVkJykge1xuICAgICAgcmV0dXJuICctaW52YWxpZCBjb21tYW5kOiBDb21tYW5kIHJldHVybmVkIG5vIGRhdGEuJ1xuICAgIH1cbiAgICByZXR1cm4gb3V0cHV0XG4gICAgLy8gdHJ5IHtcbiAgICAvLyAgIHJldHVybiBKU09OLnN0cmluZ2lmeShvdXRwdXQpXG4gICAgLy8gfSBjYXRjaCAoZSkge1xuICAgIC8vICAgcmV0dXJuICctaW52YWxpZCBjb21tYW5kOiBDb21tYW5kIHJldHVybmVkIGludmFsaWQgZGF0YSB0eXBlOiAnICsgZS5tZXNzYWdlXG4gICAgLy8gfVxuICB9XG5cbiAgLyoqXG4gICAqIEV4ZWMgQ29tbWFuZFxuICAgKiBAcmV0dXJuIEpTT04gU3RyaW5nIHdpdGggb3V0cHV0XG4gICAqL1xuICBleGVjKGNtZCkge1xuXG4gICAgLy8gIFBhcnNlIENvbW1hbmQgU3RyaW5nOiBbMF0gPSBjb21tYW5kIG5hbWUsIFsxK10gPSBhcmd1bWVudHNcbiAgICBsZXQgcGFyc2VkXG4gICAgdHJ5IHtcbiAgICAgIHBhcnNlZCA9IHRoaXMucGFyc2UoY21kKVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiAnLWZhdGFsIGNvbW1hbmQ6ICcgKyBlLm1lc3NhZ2UgfHwgJ1NvbWUgRXJyb3IgT2NjdXJlZCdcbiAgICB9XG5cbiAgICAvLyAgWC1jaGVjayBpZiBjb21tYW5kIGV4aXN0XG4gICAgY29uc3QgY29tbWFuZCA9IHRoaXMuU2hlbGxDb21tYW5kc1twYXJzZWRbMF1dXG4gICAgaWYgKCFjb21tYW5kKSB7XG4gICAgICByZXR1cm4gYC1lcnJvciBzaGVsbDogQ29tbWFuZCAke3BhcnNlZFswXX0gZG9lc24ndCBleGlzdC5cXG5gXG4gICAgfVxuXG4gICAgLy8gIGdldCBhcmd1bWVudHMgYXJyYXkgYW5kIGV4ZWN1dGUgY29tbWFuZCByZXR1cm4gZXJyb3IgaWYgdGhyb3dcbiAgICBjb25zdCBhcmdzID0gcGFyc2VkLmZpbHRlcigoZSwgaSkgPT4gaSA+IDApXG4gICAgbGV0IG91dHB1dFxuICAgIHRyeSB7XG4gICAgICBvdXRwdXQgPSBjb21tYW5kLmV4ZWMoYXJncylcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4gJy1mYXRhbCBjb21tYW5kOiAnICsgZS5tZXNzYWdlXG4gICAgfVxuXG4gICAgLy8gIEZvcm1hdCBkYXRhIGFuZCBSZXR1cm5cbiAgICByZXR1cm4gdGhpcy5mb3JtYXQob3V0cHV0KVxuICB9XG5cbiAgLypcbiAgICogR2VuZXJhdGUgQnVpbHRpbiBDb21tYW5kIExpc3RcbiAgICovXG4gIHJlZ2lzdGVyQ29tbWFuZHMoU2hlbGxSZWZlcmVuY2UsIGN1c3RvbUNvbW1hbmRzID0gdW5kZWZpbmVkKSB7XG4gICAgbGV0IEJsdWVwcmludHMgPSByZXF1aXJlKCcuLi9jb25maWdzL2J1aWx0aW4tY29tbWFuZHMnKVxuICAgIC8qKlxuICAgICAqIElmIGN1c3RvbSBjb21tYW5kcyBhcmUgcGFzc2VkIGNoZWNrIGZvciB2YWxpZCB0eXBlXG4gICAgICogSWYgZ29vZCB0byBnbyBnZW5lcmF0ZSB0aG9zZSBjb21tYW5kc1xuICAgICAqL1xuICAgIGlmIChjdXN0b21Db21tYW5kcykge1xuICAgICAgaWYgKHR5cGVvZiBjdXN0b21Db21tYW5kcyA9PT0gJ29iamVjdCcgJiYgIUFycmF5LmlzQXJyYXkoY3VzdG9tQ29tbWFuZHMpKSB7XG4gICAgICAgIEJsdWVwcmludHMgPSBjdXN0b21Db21tYW5kc1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDdXN0b20gY29tbWFuZCBwcm92aWRlZCBhcmUgbm90IGluIGEgdmFsaWQgZm9ybWF0LicpXG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgU2hlbGxDb21tYW5kcyA9IHt9XG4gICAgT2JqZWN0LmtleXMoQmx1ZXByaW50cykubWFwKChrZXkpID0+IHtcbiAgICAgIGNvbnN0IGNtZCA9IEJsdWVwcmludHNba2V5XVxuICAgICAgaWYgKHR5cGVvZiBjbWQubmFtZSA9PT0gJ3N0cmluZycgJiYgdHlwZW9mIGNtZC5mbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBjbWQuc2hlbGwgPSBTaGVsbFJlZmVyZW5jZVxuICAgICAgICBTaGVsbENvbW1hbmRzW2tleV0gPSBuZXcgQ29tbWFuZChjbWQpXG4gICAgICB9XG4gICAgfSlcbiAgICByZXR1cm4gU2hlbGxDb21tYW5kc1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gSW50ZXJwcmV0ZXJcbiIsImNvbnN0IEludGVycHJldGVyID0gcmVxdWlyZSgnLi9JbnRlcnByZXRlcicpXG5jb25zdCBGaWxlc3lzdGVtID0gcmVxdWlyZSgnLi9GaWxlc3lzdGVtJylcblxuLyoqXG4gKiBTaGVsbCBDbGFzcyBpbmhlcml0cyBmcm9tIEludGVycHJldGVyXG4gKlxuICovXG5jbGFzcyBTaGVsbCBleHRlbmRzIEludGVycHJldGVye1xuICBjb25zdHJ1Y3Rvcih7IGZpbGVzeXN0ZW0gPSB1bmRlZmluZWQsIGNvbW1hbmRzID0gdW5kZWZpbmVkLCB1c2VyID0gJ3Jvb3QnLCBob3N0bmFtZSA9ICdteS5ob3N0Lm1lJyB9ID0ge30pIHtcbiAgICBzdXBlcigpXG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgdGhlIHZpcnR1YWwgZmlsZXN5c3RlbVxuICAgICAqIEByZXR1cm4gcmVmZXJlbmNlIHRvIGluc3RhbmNlIG9mIEBjbGFzcyBGaWxlc3lzdGVtXG4gICAgICovXG4gICAgdGhpcy5mcyA9IG5ldyBGaWxlc3lzdGVtKGZpbGVzeXN0ZW0sIHRoaXMpXG4gICAgdGhpcy51c2VyID0gdXNlclxuICAgIHRoaXMuaG9zdG5hbWUgPSBob3N0bmFtZVxuXG4gICAgLy8gSW5pdCBidWlsdGluIGNvbW1hbmRzLCBAbWV0aG9kIGluIHBhcmVudFxuICAgIC8vIHBhc3Mgc2hlbGwgcmVmZXJlbmNlXG4gICAgdGhpcy5TaGVsbENvbW1hbmRzID0gdGhpcy5yZWdpc3RlckNvbW1hbmRzKHRoaXMpXG4gICAgdGhpcy5TaGVsbENvbW1hbmRzID0ge1xuICAgICAgLi4udGhpcy5TaGVsbENvbW1hbmRzLFxuICAgICAgLi4udGhpcy5yZWdpc3RlckNvbW1hbmRzKHRoaXMsIGNvbW1hbmRzKSxcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUGFzcyBjb250cm9sIHRvIEludGVycHJldGVyXG4gICAqIEByZXR1cm4gb3V0cHV0IGFzIFtTdHJpbmddXG4gICAqL1xuICBydW4oY21kKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlYyhjbWQpXG4gIH1cbn1cblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFNoZWxsLnByb3RvdHlwZSwgJ2ZzJywgeyB3cml0YWJsZTogdHJ1ZSwgZW51bWVyYWJsZTogZmFsc2UgfSlcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShTaGVsbC5wcm90b3R5cGUsICdTaGVsbENvbW1hbmRzJywgeyB3cml0YWJsZTogdHJ1ZSwgZW51bWVyYWJsZTogZmFsc2UgfSlcblxubW9kdWxlLmV4cG9ydHMgPSBTaGVsbFxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgLyoqXG4gICAqIEhlbHBcbiAgICogQHJldHVybiBMaXN0IG9mIGNvbW1hbmRzXG4gICAqL1xuICBoZWxwOiB7XG4gICAgbmFtZTogJ2hlbHAnLFxuICAgIHR5cGU6ICdidWlsdGluJyxcbiAgICBmbjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gYENvbW1hbmRzIGF2YWlibGU6ICR7T2JqZWN0LmtleXModGhpcy5zaGVsbC5TaGVsbENvbW1hbmRzKS5qb2luKCcsICcpfWBcbiAgICB9XG4gIH0sXG5cbiAgd2hvYW1pOiB7XG4gICAgbmFtZTogJ3dob2FtaScsXG4gICAgdHlwZTogJ2J1aWx0aW4nLFxuICAgIGZuOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLnNoZWxsLnVzZXJcbiAgICB9LFxuICB9LFxuXG4gIC8qKlxuICAgKiBSZXR1cm4gcGFzc2VkIGFyZ3VtZW50cywgZm9yIHRlc3RpbmcgcHVycG9zZXNcbiAgICovXG4gIGFyZ3VtZW50czoge1xuICAgIG5hbWU6ICdhcmd1bWVudHMnLFxuICAgIHR5cGU6ICdidWlsdGluJyxcbiAgICBmbjogYXJncyA9PiBhcmdzXG4gIH0sXG5cbiAgLyoqXG4gICAqIENoYW5nZSBEaXJlY3RvcnlcbiAgICogQHJldHVybiBTdWNjZXNzL0ZhaWwgTWVzc2FnZSBTdHJpbmdcbiAgICovXG4gIGNkOiB7XG4gICAgbmFtZTogJ2NkJyxcbiAgICB0eXBlOiAnYnVpbHRpbicsXG4gICAgZm46IGZ1bmN0aW9uKHBhdGgpIHtcbiAgICAgIGlmICghcGF0aCkgdGhyb3cgbmV3IEVycm9yKCctaW52YWxpZCBObyBwYXRoIHByb3ZpZGVkLicpXG4gICAgICBwYXRoID0gcGF0aC5qb2luKClcbiAgICAgIHRyeXtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2hlbGwuZnMuY2hhbmdlRGlyKHBhdGgpXG4gICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgdGhyb3cgZVxuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogbHMgQ29tbWFuZFxuICAgKiBMaXN0IGRpcmVjdG9yeSBmaWxlc1xuICAgKiBAcGFyYW0gYXJyYXkgb2YgYXJnc1xuICAgKiBAcmV0dXJuIGZvcm1hdHRlZCBTdHJpbmdcbiAgICovXG4gIGxzOiB7XG4gICAgbmFtZTogJ2xzJyxcbiAgICB0eXBlOiAnYnVpbHRpbicsXG4gICAgZm46IGZ1bmN0aW9uKHBhdGggPSBbJy4vJ10gKSB7XG4gICAgICBwYXRoID0gcGF0aC5qb2luKClcbiAgICAgIGxldCBsaXN0LCByZXNwb25zZVN0cmluZyA9ICcnXG4gICAgICB0cnl7XG4gICAgICAgIGxpc3QgPSB0aGlzLnNoZWxsLmZzLmxpc3REaXIocGF0aClcbiAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICB0aHJvdyBlXG4gICAgICB9XG4gICAgICBmb3IgKGxldCBmaWxlIGluIGxpc3QpIHtcbiAgICAgICAgaWYgKGxpc3QuaGFzT3duUHJvcGVydHkoZmlsZSkpIHtcbiAgICAgICAgICByZXNwb25zZVN0cmluZyArPSBgJHtsaXN0W2ZpbGVdLnBlcm1pc3Npb259XFx0JHtsaXN0W2ZpbGVdLnVzZXJ9ICR7bGlzdFtmaWxlXS5ncm91cH1cXHQke2xpc3RbZmlsZV0ubmFtZX1cXG5gXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiByZXNwb25zZVN0cmluZ1xuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogQ0FUIENvbW1hbmRcbiAgICogUmVhZCBGaWxlXG4gICAqIEByZXR1cm4gZm9ybWF0dGVkIFN0cmluZ1xuICAgKi9cbiAgY2F0OiB7XG4gICAgbmFtZTogJ2NhdCcsXG4gICAgdHlwZTogJ2J1aWx0aW4nLFxuICAgIGZuOiBmdW5jdGlvbihwYXRoID0gWycuLyddKSB7XG4gICAgICBwYXRoID0gcGF0aC5qb2luKClcbiAgICAgIGNvbnNvbGUubG9nKHBhdGgpXG4gICAgICBsZXQgbGlzdCwgcmVzcG9uc2VTdHJpbmcgPSAnJ1xuICAgICAgdHJ5e1xuICAgICAgICBmaWxlID0gdGhpcy5zaGVsbC5mcy5yZWFkRmlsZShwYXRoKVxuICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgIHRocm93IGVcbiAgICAgIH1cbiAgICAgIGNvbnNvbGUubG9nKGZpbGUpXG4gICAgICByZXR1cm4gcmVzcG9uc2VTdHJpbmdcbiAgICB9XG4gIH0sXG5cbn1cbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuXG4gICdmaWxlLmgnOiAnI2luY2x1ZGUgPG5vcGUuaD4nLFxuXG4gIGV0Yzoge1xuICAgIGFwYWNoZTI6IHtcbiAgICAgICdhcGFjaGUyLmNvbmYnOiAnTm90IFdoYXQgeW91IHdlcmUgbG9va2luZyBmb3IgOiknLFxuICAgIH0sXG4gIH0sXG5cbiAgaG9tZToge1xuICAgIGd1ZXN0OiB7XG4gICAgICBkb2NzOiB7XG4gICAgICAgICdteWRvYy5tZCc6ICdUZXN0RmlsZScsXG4gICAgICAgICdteWRvYzIubWQnOiAnVGVzdEZpbGUyJyxcbiAgICAgICAgJ215ZG9jMy5tZCc6ICdUZXN0RmlsZTMnLFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuXG4gIHJvb3Q6e1xuICAgICcuenNocmMnOiAnbm90IGV2ZW4gY2xvc2UgOiknLFxuICAgICcub2gtbXktenNoJzoge1xuICAgICAgdGhlbWVzOiB7fSxcbiAgICB9LFxuICB9LFxufVxuIl19
