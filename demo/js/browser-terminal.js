(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
'use strict';

/**
 * Shell Only
 * @type {Class}
 * Init the shell with command and filesystem
 * @method execute() exposed to query the Shell with commands
 */
global['Terminal'] = require('./classes/Terminal');

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./classes/Terminal":7}],2:[function(require,module,exports){
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

},{"../configs/default-filesystem":9,"./File":3}],5:[function(require,module,exports){
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

},{"../configs/builtin-commands":8,"./Command":2}],6:[function(require,module,exports){
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

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Shell = require('./Shell');

/**
 * Terminal
 * Wrapper on the Shell class
 * This will only handle the UI of the terminal.
 * You can use it or use directly the browser-shell.js
 * and create your custom UI calling and displaying the @method run() commands
 * ___________
 * Options:
 *  - filesystem {Object}
 *  - commands {Object}
 *  - user {String}
 *  - hostname {String}
 */

var Terminal = function (_Shell) {
  _inherits(Terminal, _Shell);

  function Terminal() {
    var selector = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;

    var _ret;

    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Terminal);

    // must pass option here

    var _this = _possibleConstructorReturn(this, (Terminal.__proto__ || Object.getPrototypeOf(Terminal)).call(this, options));

    if (!selector) throw new Error('No wrapper element selector provided');
    try {
      _this.container = document.querySelector(selector);
      if (!_this.container) throw new Error('new Terminal(): DOM element not found');
    } catch (e) {
      throw new Error('new Terminal(): Not valid DOM selector.');
    }

    return _ret = _this.init(), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(Terminal, [{
    key: 'init',
    value: function init() {
      var _this2 = this;

      this.generateRow();
      this.container.addEventListener('click', function (e) {
        e.stopPropagation();
        var input = _this2.container.querySelector('.current .terminal-input');
        if (input) input.focus();
      });
    }
  }, {
    key: 'generateRow',
    value: function generateRow() {
      var _this3 = this;

      var that = this;

      // Remove previous current active row
      var current = document.querySelector('.current.terminal-row');
      if (current) {
        current.classList.remove('current');
      }

      var prevInput = document.querySelector('.terminal-input');
      if (prevInput) {
        prevInput.removeEventListener('keyup', this.submitHandler);
      }

      var div = document.createElement('div');
      div.classList.add('current', 'terminal-row');
      div.innerHTML = '';
      div.innerHTML += '<span class="terminal-info">' + this.user + '@' + this.hostname + ' - ' + this.fs.getCurrentDirectory() + ' \u279C </span>';
      div.innerHTML += '<input type="text" class="terminal-input" size="2" style="cursor:none;">';

      // add new row and focus it
      this.container.appendChild(div);
      var input = this.container.querySelector('.current .terminal-input');
      input.addEventListener('keyup', function (e) {
        return _this3.submitHandler(e);
      });
      input.focus();

      return input;
    }
  }, {
    key: 'generateOutput',
    value: function generateOutput() {
      var out = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

      var pre = document.createElement('pre');
      pre.textContent = out;
      this.container.appendChild(pre);
      return this.generateRow();
    }
  }, {
    key: 'submitHandler',
    value: function submitHandler(e) {
      e.stopPropagation();
      // RUN when ENTER is pressed
      e.target.size = e.target.value.length + 2 || 3;
      if (event.which == 13 || event.keyCode == 13) {
        e.preventDefault();
        var command = e.target.value.trim();
        // EXEC
        var output = this.run(command);
        return this.generateOutput(output);
      }
    }
  }]);

  return Terminal;
}(Shell);

module.exports = Terminal;

},{"./Shell":6}],8:[function(require,module,exports){
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

},{"../../package.json":10}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
module.exports={
  "name": "browser-terminal.js",
  "version": "0.2.6",
  "description": "Simple Browser Terminal in pure js, usable for web presentation of CLI tools and whatever you want it to do!",
  "main": "terminal.js",
  "scripts": {
    "test": "mocha --compilers babel-core/register tests/",
    "build": "npm run build:dev && npm run build:prod",
    "build:dev": "gulp browserify",
    "build:prod": "gulp browserify-production"
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJiaW4vYnJvd3Nlci10ZXJtaW5hbC5qcyIsImJpbi9jbGFzc2VzL0NvbW1hbmQuanMiLCJiaW4vY2xhc3Nlcy9GaWxlLmpzIiwiYmluL2NsYXNzZXMvRmlsZXN5c3RlbS5qcyIsImJpbi9jbGFzc2VzL0ludGVycHJldGVyLmpzIiwiYmluL2NsYXNzZXMvU2hlbGwuanMiLCJiaW4vY2xhc3Nlcy9UZXJtaW5hbC5qcyIsImJpbi9jb25maWdzL2J1aWx0aW4tY29tbWFuZHMuanMiLCJiaW4vY29uZmlncy9kZWZhdWx0LWZpbGVzeXN0ZW0uanMiLCJwYWNrYWdlLmpzb24iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7QUNBQTs7Ozs7O0FBTUEsT0FBTyxVQUFQLElBQXFCLFFBQVEsb0JBQVIsQ0FBckI7Ozs7Ozs7Ozs7O0FDTkE7Ozs7OztJQU1NLE87QUFDSixxQkFBd0U7QUFBQSxtRkFBSCxFQUFHO0FBQUEsUUFBMUQsSUFBMEQsUUFBMUQsSUFBMEQ7QUFBQSxRQUFwRCxFQUFvRCxRQUFwRCxFQUFvRDtBQUFBLHlCQUFoRCxJQUFnRDtBQUFBLFFBQWhELElBQWdELDZCQUF6QyxLQUF5QztBQUFBLDBCQUFsQyxLQUFrQztBQUFBLFFBQWxDLEtBQWtDLDhCQUExQixTQUEwQjtBQUFBLHdCQUFmLEdBQWU7QUFBQSxRQUFmLEdBQWUsNEJBQVQsRUFBUzs7QUFBQTs7QUFDdEUsUUFBSSxPQUFPLElBQVAsS0FBZ0IsUUFBcEIsRUFBOEIsTUFBTSxNQUFNLCtCQUFOLENBQU47QUFDOUIsUUFBSSxPQUFPLEVBQVAsS0FBYyxVQUFsQixFQUE4QixNQUFNLE1BQU0sd0NBQU4sQ0FBTjs7QUFFOUI7Ozs7QUFJQSxTQUFLLEVBQUwsR0FBVSxHQUFHLElBQUgsQ0FBUSxJQUFSLENBQVY7QUFDQSxTQUFLLElBQUwsR0FBWSxJQUFaO0FBQ0EsU0FBSyxJQUFMLEdBQVksSUFBWjtBQUNBLFNBQUss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Q1Asc0JBQWdCO0FBRFQ7QUFETixHQUpVOztBQVVmLFFBQU07QUFDSixXQUFPO0FBQ0wsWUFBTTtBQUNKLG9CQUFZLFVBRFI7QUFFSixxQkFBYSxXQUZUO0FBR0oscUJBQWE7QUFIVDtBQUREO0FBREgsR0FWUzs7QUFvQmYsUUFBSztBQUNILGNBQVUsbUJBRFA7QUFFSCxrQkFBYztBQUNaLGNBQVE7QUFESTtBQUZYO0FBcEJVLENBQWpCOzs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXG4gKiBTaGVsbCBPbmx5XG4gKiBAdHlwZSB7Q2xhc3N9XG4gKiBJbml0IHRoZSBzaGVsbCB3aXRoIGNvbW1hbmQgYW5kIGZpbGVzeXN0ZW1cbiAqIEBtZXRob2QgZXhlY3V0ZSgpIGV4cG9zZWQgdG8gcXVlcnkgdGhlIFNoZWxsIHdpdGggY29tbWFuZHNcbiAqL1xuZ2xvYmFsWydUZXJtaW5hbCddID0gcmVxdWlyZSgnLi9jbGFzc2VzL1Rlcm1pbmFsJylcbiIsIi8qKlxuICogQ29tbWFuZCBDbGFzc1xuICogQHBhcmFtIG5hbWUgW1N0cmluZ10sIGZuIFtGdW5jdGlvbl1cbiAqXG4gKiBkb24ndCBwYXNzIGFycm93IGZ1bmN0aW9uIGlmIHlvdSB3YW50IHRvIHVzZSB0aGlzIGluc2lkZSB5b3VyIGNvbW1hbmQgZnVuY3Rpb24gdG8gYWNjZXNzIHZhcmlvdXMgc2hhcmVkIHNoZWxsIG9iamVjdFxuICovXG5jbGFzcyBDb21tYW5kIHtcbiAgY29uc3RydWN0b3IoeyBuYW1lLCBmbiwgdHlwZSA9ICd1c3InLCBzaGVsbCA9IHVuZGVmaW5lZCwgbWFuID0gJyd9ID0ge30pe1xuICAgIGlmICh0eXBlb2YgbmFtZSAhPT0gJ3N0cmluZycpIHRocm93IEVycm9yKCdDb21tYW5kIG5hbWUgbXVzdCBiZSBhIHN0cmluZycpXG4gICAgaWYgKHR5cGVvZiBmbiAhPT0gJ2Z1bmN0aW9uJykgdGhyb3cgRXJyb3IoJ0NvbW1hbmQgZnVuY3Rpb24gbXVzdCBiZS4uLiBhIGZ1bmN0aW9uJylcblxuICAgIC8qKlxuICAgICAqIHVzZSB3aG9sZSBmdW5jdGlvbiBpbnN0ZWFkIG9mIGFycm93IGlmIHlvdSB3YW50IHRvIGFjY2Vzc1xuICAgICAqIGNpcmN1bGFyIHJlZmVyZW5jZSBvZiBDb21tYW5kXG4gICAgICovXG4gICAgdGhpcy5mbiA9IGZuLmJpbmQodGhpcylcbiAgICB0aGlzLm5hbWUgPSBuYW1lXG4gICAgdGhpcy50eXBlID0gdHlwZVxuICAgIHRoaXMubWFuID0gbWFuXG5cbiAgICBpZiAoc2hlbGwpIHtcbiAgICAgIHRoaXMuc2hlbGwgPSBzaGVsbFxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBEaXNwYXRjaCBDb21tYW5kIEV4ZWN1dGlvblxuICAgKlxuICAgKiBAdGlwIGRvbid0IHVzZSBhcnJvdyBmdW5jdGlvbiBpbiB5b3UgY29tbWFuZCBpZiB5b3Ugd2FudCB0aGUgYXJndW1lbnRzXG4gICAqIG5laXRoZXIgc3VwZXIgYW5kIGFyZ3VtZW50cyBnZXQgYmluZGVkIGluIEFGLlxuICAgKi9cbiAgZXhlYyhhcmdzID0gW10pIHtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoYXJncykpIHRocm93IEVycm9yKCdDb21tYW5kIGV4ZWMgYXJncyBtdXN0IGJlIGluIGFuIGFycmF5JylcbiAgICBpZiAoYXJncy5sZW5ndGgpIHJldHVybiB0aGlzLmZuKGFyZ3MpXG4gICAgcmV0dXJuIHRoaXMuZm4oKVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ29tbWFuZFxuIiwiLyoqXG4gKiBAY2xhc3MgU2luZ2xlIEZpbGUgQ2xhc3NcbiAqIFNpbXVsYXRlIGZpbGUgcHJvcGVydGllc1xuICovXG5jbGFzcyBGaWxlIHtcbiAgY29uc3RydWN0b3IoeyBuYW1lID0gJycsIHR5cGUgPSAnZmlsZScsIGNvbnRlbnQgPSAnJ30gPSB7fSkge1xuICAgIHRoaXMudWlkID0gdGhpcy5nZW5VaWQoKVxuICAgIHRoaXMubmFtZSA9IG5hbWVcbiAgICB0aGlzLnR5cGUgPSB0eXBlXG4gICAgdGhpcy5jb250ZW50ID0gY29udGVudFxuICAgIHRoaXMudXNlciA9ICdyb290J1xuICAgIHRoaXMuZ3JvdXAgPSAncm9vdCdcblxuICAgIGlmICh0aGlzLnR5cGUgPT09ICdmaWxlJykge1xuICAgICAgdGhpcy5wZXJtaXNzaW9uID0gJ3J3eHItLXItLSdcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5wZXJtaXNzaW9uID0gJ2Ryd3hyLXhyLXgnXG4gICAgfVxuXG4gIH1cblxuICBnZW5VaWQoKSB7XG4gICAgZnVuY3Rpb24gczQoKSB7XG4gICAgICByZXR1cm4gTWF0aC5mbG9vcigoMSArIE1hdGgucmFuZG9tKCkpICogMHgxMDAwMClcbiAgICAgICAgLnRvU3RyaW5nKDE2KVxuICAgICAgICAuc3Vic3RyaW5nKDEpO1xuICAgIH1cbiAgICByZXR1cm4gczQoKSArIHM0KCkgKyAnLScgKyBzNCgpICsgJy0nICsgczQoKSArICctJyArXG4gICAgICBzNCgpICsgJy0nICsgczQoKSArIHM0KCkgKyBzNCgpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRmlsZVxuIiwiY29uc3QgREVGQVVMVF9GUyA9IHJlcXVpcmUoJy4uL2NvbmZpZ3MvZGVmYXVsdC1maWxlc3lzdGVtJylcbmNvbnN0IEZpbGUgPSByZXF1aXJlKCcuL0ZpbGUnKVxuXG4vKipcbiAqIEBjbGFzcyBWaXJ0dWFsIEZpbGVzeXN0ZW1cbiAqIFJlcHJlc2VudGVkIGFzIGFuIG9iamVjdCBvZiBub2Rlc1xuICovXG5jbGFzcyBGaWxlc3lzdGVtIHtcbiAgY29uc3RydWN0b3IoZnMgPSBERUZBVUxUX0ZTLCBzaGVsbCA9IHt9KSB7XG4gICAgdGhpcy5zaGVsbCA9IHNoZWxsXG4gICAgaWYgKHR5cGVvZiBmcyAhPT0gJ29iamVjdCcgfHwgQXJyYXkuaXNBcnJheShmcykpIHRocm93IG5ldyBFcnJvcignVmlydHVhbCBGaWxlc3lzdGVtIHByb3ZpZGVkIG5vdCB2YWxpZCwgaW5pdGlhbGl6YXRpb24gZmFpbGVkLicpXG5cbiAgICAvLyBOb3QgQnkgUmVmZXJlbmNlLlxuICAgIC8vIEhBQ0s6IE9iamVjdCBhc3NpZ24gcmVmdXNlIHRvIHdvcmsgYXMgaW50ZW5kZWQuXG4gICAgZnMgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGZzKSlcbiAgICB0aGlzLkZpbGVTeXN0ZW0gPSB0aGlzLmluaXRGcyhmcylcblxuICAgIC8vIENXRCBmb3IgY29tbWFuZHMgdXNhZ2VcbiAgICB0aGlzLmN3ZCA9IFsnLyddXG4gIH1cblxuICAvKipcbiAgICogSW5pdCAmIFBhc3MgQ29udHJvbCB0byByZWN1cnJzaXZlIGZ1bmN0aW9uXG4gICAqIEByZXR1cm4gbmV3IEZpbGVzeXN0ZW0gYXMgbm9kZXMgb2YgbXVsdGlwbGUgQGNsYXNzIEZpbGVcbiAgICovXG4gIGluaXRGcyhmcykge1xuICAgIHRoaXMuYnVpbGRWaXJ0dWFsRnMoZnMpXG4gICAgcmV0dXJuIGZzXG4gIH1cblxuICAvKipcbiAgICogVHJhdmVyc2UgYWxsIG5vZGUgYW5kIGJ1aWxkIGEgdmlydHVhbCByZXByZXNlbnRhdGlvbiBvZiBhIGZpbGVzeXN0ZW1cbiAgICogRWFjaCBub2RlIGlzIGEgRmlsZSBpbnN0YW5jZS5cbiAgICogQHBhcmFtIE1vY2tlZCBGaWxlc3lzdGVtIGFzIE9iamVjdFxuICAgKlxuICAgKi9cbiAgYnVpbGRWaXJ0dWFsRnMob2JqKSB7XG4gICAgZm9yIChsZXQga2V5IGluIG9iaikge1xuICAgICAgaWYgKG9iai5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgIGlmICh0eXBlb2Ygb2JqW2tleV0gPT09ICdvYmplY3QnICYmICFBcnJheS5pc0FycmF5KG9ialtrZXldKSkge1xuICAgICAgICAgIG9ialtrZXldID0gbmV3IEZpbGUoeyBuYW1lOiBrZXksIGNvbnRlbnQ6IG9ialtrZXldLCB0eXBlOiAnZGlyJyB9KVxuICAgICAgICAgIHRoaXMuYnVpbGRWaXJ0dWFsRnMob2JqW2tleV0uY29udGVudClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBvYmpba2V5XSA9IG5ldyBGaWxlKHsgbmFtZToga2V5LCBjb250ZW50OiBvYmpba2V5XSB9KVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhIHN0cmluZ2VkIHBhdGggYW5kIHJldHVybiBhcyBhcnJheVxuICAgKiB0aHJvdyBlcnJvciBpZiBwYXRoIGZvcm1hdCBpcyBpbnZhbGlkXG4gICAqIFJlbGF0aXZlIFBhdGggZ2V0cyBjb252ZXJ0ZWQgdXNpbmcgQ3VycmVudCBXb3JraW5nIERpcmVjdG9yeVxuICAgKiBAcGFyYW0gcGF0aCB7U3RyaW5nfVxuICAgKiBAcmV0dXJuIEFycmF5XG4gICAqL1xuICBwYXRoU3RyaW5nVG9BcnJheShwYXRoID0gJycpIHtcbiAgICBpZiAoIXBhdGgubGVuZ3RoKSB0aHJvdyBuZXcgRXJyb3IoJ1BhdGggY2Fubm90IGJlIGVtcHR5JylcblxuICAgIC8vIENoZWNrIGZvciBpbnZhbGlkIHBhdGgsIGVnLiB0d28rIC8vIGluIGEgcm93XG4gICAgaWYgKHBhdGgubWF0Y2goL1xcL3syLH0vZykpIHRocm93IG5ldyBFcnJvcihgLWludmFsaWQgcGF0aDogJHtwYXRofWApXG5cbiAgICAvLyBGb3JtYXQgYW5kIENvbXBvc2VyIGFycmF5XG4gICAgbGV0IHBhdGhBcnJheSA9IHBhdGguc3BsaXQoJy8nKVxuICAgIGlmIChwYXRoQXJyYXlbMF0gPT09ICcnKSBwYXRoQXJyYXlbMF0gPSAnLydcbiAgICBpZiAocGF0aEFycmF5WzBdID09PSAnLicpIHBhdGhBcnJheS5zaGlmdCgpXG4gICAgaWYocGF0aEFycmF5W3BhdGhBcnJheS5sZW5ndGggLSAxXSA9PT0gJycpIHBhdGhBcnJheS5wb3AoKVxuICAgIC8vIGhhbmRsZSByZWxhdGl2ZSBwYXRoIHdpdGggY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeVxuICAgIGlmIChwYXRoQXJyYXlbMF0gIT09ICcvJykge1xuICAgICAgcGF0aEFycmF5ID0gdGhpcy5jd2QuY29uY2F0KHBhdGhBcnJheSlcbiAgICB9XG4gICAgcmV0dXJuIHBhdGhBcnJheVxuICB9XG5cbiAgLyoqXG4gICAqIFBhdGggZnJvbSBhcnJheSB0byBTdHJpbmdcbiAgICogRm9yIHByZXNlbnRhdGlvbmFsIHB1cnBvc2UuXG4gICAqIFRPRE9cbiAgICogQHBhcmFtIHBhdGggW0FycmF5XVxuICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAqL1xuICBwYXRoQXJyYXlUb1N0cmluZyhwYXRoID0gW10pIHtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkocGF0aCkpIHRocm93IG5ldyBFcnJvcignLWZhdGFsIGZpbGVzeXN0ZW06IHBhdGggbXVzdCBiZSBhbiBhcnJheScpXG4gICAgaWYgKCFwYXRoLmxlbmd0aCkgdGhyb3cgbmV3IEVycm9yKCctaW52YWxpZCBmaWxlc3lzdGVtOiBwYXRoIG5vdCBwcm92aWRlZCcpXG4gICAgbGV0IG91dHB1dCA9IHBhdGguam9pbignLycpXG4gICAgLy8gcmVtb3ZlIC8gbXVsdGlwbGUgb2NjdXJyZW5jZVxuICAgIHJldHVybiBvdXRwdXQucmVwbGFjZSgvXFwvezIsfS9nLCAnLycpXG4gIH1cblxuICAvKipcbiAgICogTHVrZS4uIGZpbGVXYWxrZXJcbiAgICogQWNjZXB0cyBvbmx5IEFic29sdXRlIFBhdGgsIHlvdSBtdXN0IGNvbnZlcnQgcGF0aHMgYmVmb3JlIGNhbGxpbmcgdXNpbmcgcGF0aFN0cmluZ1RvQXJyYXlcbiAgICogQHBhcmFtIGNiIGV4ZWN1dGVkIG9uIGVhY2ggZmlsZSBmb3VuZFxuICAgKiBAcGFyYW0gZnMgW1NoZWxsIFZpcnR1YWwgRmlsZXN5c3RlbV1cbiAgICovXG4gIGZpbGVXYWxrZXIocGF0aCA9IFsnLyddLCBmcyA9IHRoaXMuRmlsZVN5c3RlbSl7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KHBhdGgpKSB0aHJvdyBuZXcgRXJyb3IoJ1BhdGggbXVzdCBiZSBhbiBhcnJheSBvZiBub2RlcywgdXNlIEZpbGVzeXN0ZW0ucGF0aFN0cmluZ1RvQXJyYXkoe3N0cmluZ30pJylcblxuICAgIC8vIGF2b2lkIG1vZGlmeWluZyBleHRlcm5hbCBwYXRoIHJlZmVyZW5jZVxuICAgIHBhdGggPSBwYXRoLnNsaWNlKDApXG5cbiAgICAvLyBUT0RPOlxuICAgIC8vICBDaG9vc2U6XG4gICAgLy8gICAgLSBHbyBmdWxsIHB1cmVcbiAgICAvLyAgICAtIFdvcmsgb24gdGhlIHJlZmVyZW5jZSBvZiB0aGUgYWN0dWFsIG5vZGVcbiAgICAvLyBmcyA9IE9iamVjdC5hc3NpZ24oZnMsIHt9KVxuXG4gICAgLy8gRXhpdCBDb25kaXRpb25cbiAgICBpZiAoIXBhdGgubGVuZ3RoKSByZXR1cm4gZnNcblxuICAgIC8vIEdldCBjdXJyZW50IG5vZGVcbiAgICBsZXQgbm9kZSA9IHBhdGguc2hpZnQoKVxuXG4gICAgLy8gR28gZGVlcGVyIGlmIGl0J3Mgbm90IHRoZSByb290IGRpclxuICAgIGlmIChub2RlICE9PSAnLycpIHtcbiAgICAgIC8vIGNoZWNrIGlmIG5vZGUgZXhpc3RcbiAgICAgIGlmIChmc1tub2RlXSkge1xuICAgICAgICAvLyByZXR1cm4gZmlsZSBvciBmb2xkZXJcbiAgICAgICAgZnMgPSBmc1tub2RlXS50eXBlID09PSAnZGlyJyA/IGZzW25vZGVdLmNvbnRlbnQgOiBmc1tub2RlXVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGaWxlIGRvZXNuXFwndCBleGlzdCcpXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmZpbGVXYWxrZXIocGF0aCwgZnMpXG4gIH1cblxuICAvKipcbiAgICogdHJhdmVyc2VGaWxlc1xuICAgKiBhY2Nlc3NpbmcgYWxsIGZpbGUgYXQgbGVhc3Qgb25jZVxuICAgKiBjYWxsaW5nIHByb3ZpZGVkIGNhbGxiYWNrIG9uIGVhY2hcbiAgICogQHBhcmFtIGNiIGV4ZWN1dGVkIG9uIGVhY2ggZmlsZSBmb3VuZFxuICAgKiBAcGFyYW0gZnMgW1NoZWxsIFZpcnR1YWwgRmlsZXN5c3RlbV1cbiAgICovXG4gIHRyYXZlcnNlRmlsZXMoY2IgPSAoKT0+e30sIGZzID0gdGhpcy5GaWxlU3lzdGVtKXtcbiAgICBjb25zdCBzZWxmID0gdGhpcy50cmF2ZXJzZUZpbGVzXG4gICAgZm9yIChsZXQgbm9kZSBpbiBmcykge1xuICAgICAgaWYgKGZzLmhhc093blByb3BlcnR5KG5vZGUpKSB7XG4gICAgICAgIGlmIChmc1tub2RlXS50eXBlID09PSAnZGlyJykgdGhpcy50cmF2ZXJzZUZpbGVzKGNiLCBmc1tub2RlXS5jb250ZW50KVxuICAgICAgICBlbHNlIGNiKGZzW25vZGVdKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiB0cmF2ZXJzZURpcnNcbiAgICogYWNjZXNzaW5nIGFsbCBkaXJlY3RvcnkgYXQgbGVhc3Qgb25jZVxuICAgKiBjYWxsaW5nIHByb3ZpZGVkIGNhbGxiYWNrIG9uIGVhY2hcbiAgICogQHBhcmFtIGNiIGV4ZWN1dGVkIG9uIGVhY2ggZmlsZSBmb3VuZFxuICAgKiBAcGFyYW0gZnMgW1NoZWxsIFZpcnR1YWwgRmlsZXN5c3RlbV1cbiAgICovXG4gIHRyYXZlcnNlRGlycyhjYiA9ICgpPT57fSwgZnMgPSB0aGlzLkZpbGVTeXN0ZW0pe1xuICAgIGZvciAobGV0IG5vZGUgaW4gZnMpIHtcbiAgICAgIGlmIChmcy5oYXNPd25Qcm9wZXJ0eShub2RlKSkge1xuICAgICAgICBpZiAoZnNbbm9kZV0udHlwZSA9PT0gJ2RpcicpIHtcbiAgICAgICAgICBjYihmc1tub2RlXSlcbiAgICAgICAgICB0aGlzLnRyYXZlcnNlRGlycyhjYiwgZnNbbm9kZV0uY29udGVudClcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgRGlyZWN0b3J5IE5vZGVcbiAgICogUGFzc2VkIGFzIFJlZmVyZW5jZSBvciBJbnN0YW5jZSxcbiAgICogZGVwZW5kIGJ5IGEgbGluZSBpbiBAbWV0aG9kIGZpbGVXYWxrZXIsIHNlZSBjb21tZW50IHRoZXJlLlxuICAgKiBAcmV0dXJuIERpcmVjdG9yeSBOb2RlIE9iamVjdFxuICAgKi9cbiAgZ2V0Tm9kZShwYXRoID0gJycsIGZpbGVUeXBlKSB7XG4gICAgaWYgKHR5cGVvZiBwYXRoICE9PSAnc3RyaW5nJykgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGlucHV0LicpXG4gICAgbGV0IHBhdGhBcnJheSwgbm9kZVxuXG4gICAgdHJ5IHtcbiAgICAgIHBhdGhBcnJheSA9IHRoaXMucGF0aFN0cmluZ1RvQXJyYXkocGF0aClcbiAgICAgIG5vZGUgPSB0aGlzLmZpbGVXYWxrZXIocGF0aEFycmF5KVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRocm93IGVcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBFUlJPUiBIQU5ETElOR1xuICAgICAqL1xuXG4gICAgLy8gSGFuZGxlIExpc3Qgb24gYSBmaWxlXG4gICAgaWYgKGZpbGVUeXBlID09PSAnZGlyJyAmJiBub2RlLnR5cGUgPT09ICdmaWxlJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJdHMgYSBmaWxlIG5vdCBhIGRpcmVjdG9yeScpXG4gICAgfVxuICAgIC8vIEhhbmRsZSByZWFkZmlsZSBvbiBhIGRpclxuICAgIGlmIChmaWxlVHlwZSA9PT0gJ2ZpbGUnICYmIG5vZGUudHlwZSA9PT0gJ2RpcicpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSXRzIGEgZGlyZWN0b3J5IG5vdCBhIGZpbGUnKVxuICAgIH1cbiAgICAvLyBoYW5kbGUgcmVhZGZpbGUgb24gbm9uIGV4aXN0aW5nIGZpbGVcbiAgICBpZiAoZmlsZVR5cGUgPT09ICdmaWxlJyAmJiAhbm9kZS50eXBlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgZmlsZSBwYXRoJylcbiAgICB9XG4gICAgLy8gaGFuZGxlIGludmFsaWQgLyBub25leGlzdGluZyBwYXRoXG4gICAgaWYgKCFub2RlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgcGF0aCwgZmlsZS9mb2xkZXIgZG9lc25cXCd0IGV4aXN0JylcbiAgICB9XG5cbiAgICByZXR1cm4geyBwYXRoLCBwYXRoQXJyYXkgLCBub2RlIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDaGFuZ2UgQ3VycmVudCBXb3JraW5nIERpcmVjdG9yeSBHcmFjZWZ1bGx5XG4gICAqIEByZXR1cm4gTWVzc2FnZSBTdHJpbmcuXG4gICAqL1xuICBjaGFuZ2VEaXIocGF0aCA9ICcnKSB7XG4gICAgbGV0IHJlc3VsdFxuICAgIHRyeSB7XG4gICAgICByZXN1bHQgPSB0aGlzLmdldE5vZGUocGF0aCwgJ2RpcicpXG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICB0aHJvdyBlcnJcbiAgICB9XG4gICAgdGhpcy5jd2QgPSByZXN1bHQucGF0aEFycmF5XG4gICAgcmV0dXJuIGBjaGFuZ2VkIGRpcmVjdG9yeS5gXG4gIH1cblxuICAvKipcbiAgICogTGlzdCBDdXJyZW50IFdvcmtpbmcgRGlyZWN0b3J5IEZpbGVzXG4gICAqIEByZXR1cm4ge31cbiAgICovXG4gIGxpc3REaXIocGF0aCA9ICcnKSB7XG4gICAgbGV0IHJlc3VsdFxuICAgIHRyeSB7XG4gICAgICByZXN1bHQgPSB0aGlzLmdldE5vZGUocGF0aCwgJ2RpcicpXG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICB0aHJvdyBlcnJcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdC5ub2RlXG4gIH1cblxuICByZWFkRmlsZShwYXRoID0gJycpIHtcbiAgICBsZXQgcmVzdWx0XG4gICAgdHJ5IHtcbiAgICAgIHJlc3VsdCA9IHRoaXMuZ2V0Tm9kZShwYXRoLCAnZmlsZScpXG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICB0aHJvdyBlcnJcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdC5ub2RlXG4gIH1cblxuICBnZXRDdXJyZW50RGlyZWN0b3J5KCkge1xuICAgIGxldCBjd2RBc1N0cmluZ1xuICAgIHRyeSB7XG4gICAgICBjd2RBc1N0cmluZyA9IHRoaXMucGF0aEFycmF5VG9TdHJpbmcodGhpcy5jd2QpXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuICctaW52YWxpZCBmaWxlc3lzdGVtOiBBbiBlcnJvciBvY2N1cmVkIHdoaWxlIHBhcnNpbmcgY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeSB0byBzdHJpbmcuJ1xuICAgIH1cbiAgICByZXR1cm4gY3dkQXNTdHJpbmdcbiAgfVxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gRmlsZXN5c3RlbVxuIiwiY29uc3QgQ29tbWFuZCA9IHJlcXVpcmUoJy4vQ29tbWFuZCcpXG5cbi8qKlxuICpcbiAqIEludGVycHJldGVyXG4gKiBJcyB0aGUgcGFyZW50IENsYXNzIG9mIHRoZSBNYWluIFNoZWxsIENsYXNzXG4gKiAtIFRoaXMgY2xhc3MgaXMgdGhlIG9uZSB0aGF0IHBhcnNlIGFuZCBydW4gZXhlYyBvZiBjb21tYW5kXG4gKiAtIFBhcnNpbmcgb2YgYnVpbHRpbiBjb21tYW5kIG9uIHJ1bnRpbWUgaGFwcGVuIGhlcmVcbiAqIC0gV2lsbCBwYXJzZSBjdXN0b20gdXNlciBDb21tYW5kIHRvb1xuICpcbiAqL1xuY2xhc3MgSW50ZXJwcmV0ZXIge1xuXG4gIC8qKlxuICAgKiBQYXJzZSBDb21tYW5kXG4gICAqIEByZXR1cm4gQXJyYXkgb2YgYXJncyBhcyBpbiBDXG4gICAqL1xuICBwYXJzZShjbWQpIHtcbiAgICBpZiAodHlwZW9mIGNtZCAhPT0gJ3N0cmluZycpIHRocm93IG5ldyBFcnJvcignQ29tbWFuZCBtdXN0IGJlIGEgc3RyaW5nJylcbiAgICBpZiAoIWNtZC5sZW5ndGgpIHRocm93IG5ldyBFcnJvcignQ29tbWFuZCBpcyBlbXB0eScpXG4gICAgcmV0dXJuIGNtZC5zcGxpdCgnICcpXG4gIH1cblxuICAvKipcbiAgICogRm9ybWF0IE91dHB1dFxuICAgKiByZXR1cm4gZXJyb3IgaWYgZnVuY3Rpb24gaXMgcmV0dXJuZWRcbiAgICogY29udmVydCBldmVyeXRoaW5nIGVsc2UgdG8ganNvbi5cbiAgICogQHJldHVybiBKU09OIHBhcnNlZFxuICAgKi9cbiAgZm9ybWF0KG91dHB1dCkge1xuICAgIGlmICh0eXBlb2Ygb3V0cHV0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gJy1pbnZhbGlkIGNvbW1hbmQ6IENvbW1hbmQgcmV0dXJuZWQgaW52YWxpZCBkYXRhIHR5cGUuJ1xuICAgIH1cbiAgICBpZiAob3V0cHV0ID09PSB1bmRlZmluZWQgfHwgdHlwZW9mIG91dHB1dCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHJldHVybiAnLWludmFsaWQgY29tbWFuZDogQ29tbWFuZCByZXR1cm5lZCBubyBkYXRhLidcbiAgICB9XG4gICAgcmV0dXJuIG91dHB1dFxuICAgIC8vIHRyeSB7XG4gICAgLy8gICByZXR1cm4gSlNPTi5zdHJpbmdpZnkob3V0cHV0KVxuICAgIC8vIH0gY2F0Y2ggKGUpIHtcbiAgICAvLyAgIHJldHVybiAnLWludmFsaWQgY29tbWFuZDogQ29tbWFuZCByZXR1cm5lZCBpbnZhbGlkIGRhdGEgdHlwZTogJyArIGUubWVzc2FnZVxuICAgIC8vIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBFeGVjIENvbW1hbmRcbiAgICogQHJldHVybiBKU09OIFN0cmluZyB3aXRoIG91dHB1dFxuICAgKi9cbiAgZXhlYyhjbWQpIHtcblxuICAgIC8vICBQYXJzZSBDb21tYW5kIFN0cmluZzogWzBdID0gY29tbWFuZCBuYW1lLCBbMStdID0gYXJndW1lbnRzXG4gICAgbGV0IHBhcnNlZFxuICAgIHRyeSB7XG4gICAgICBwYXJzZWQgPSB0aGlzLnBhcnNlKGNtZClcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4gJy1mYXRhbCBjb21tYW5kOiAnICsgZS5tZXNzYWdlIHx8ICdTb21lIEVycm9yIE9jY3VyZWQnXG4gICAgfVxuXG4gICAgLy8gIFgtY2hlY2sgaWYgY29tbWFuZCBleGlzdFxuICAgIGNvbnN0IGNvbW1hbmQgPSB0aGlzLlNoZWxsQ29tbWFuZHNbcGFyc2VkWzBdXVxuICAgIGlmICghY29tbWFuZCkge1xuICAgICAgcmV0dXJuIGAtZXJyb3Igc2hlbGw6IENvbW1hbmQgJHtwYXJzZWRbMF19IGRvZXNuJ3QgZXhpc3QuXFxuYFxuICAgIH1cblxuICAgIC8vICBnZXQgYXJndW1lbnRzIGFycmF5IGFuZCBleGVjdXRlIGNvbW1hbmQgcmV0dXJuIGVycm9yIGlmIHRocm93XG4gICAgY29uc3QgYXJncyA9IHBhcnNlZC5maWx0ZXIoKGUsIGkpID0+IGkgPiAwKVxuICAgIGxldCBvdXRwdXRcbiAgICB0cnkge1xuICAgICAgb3V0cHV0ID0gY29tbWFuZC5leGVjKGFyZ3MpXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuICctZmF0YWwgY29tbWFuZDogJyArIGUubWVzc2FnZVxuICAgIH1cblxuICAgIC8vICBGb3JtYXQgZGF0YSBhbmQgUmV0dXJuXG4gICAgcmV0dXJuIHRoaXMuZm9ybWF0KG91dHB1dClcbiAgfVxuXG4gIC8qXG4gICAqIEdlbmVyYXRlIEJ1aWx0aW4gQ29tbWFuZCBMaXN0XG4gICAqL1xuICByZWdpc3RlckNvbW1hbmRzKFNoZWxsUmVmZXJlbmNlLCBjdXN0b21Db21tYW5kcyA9IHVuZGVmaW5lZCkge1xuICAgIGxldCBCbHVlcHJpbnRzID0gcmVxdWlyZSgnLi4vY29uZmlncy9idWlsdGluLWNvbW1hbmRzJylcbiAgICAvKipcbiAgICAgKiBJZiBjdXN0b20gY29tbWFuZHMgYXJlIHBhc3NlZCBjaGVjayBmb3IgdmFsaWQgdHlwZVxuICAgICAqIElmIGdvb2QgdG8gZ28gZ2VuZXJhdGUgdGhvc2UgY29tbWFuZHNcbiAgICAgKi9cbiAgICBpZiAoY3VzdG9tQ29tbWFuZHMpIHtcbiAgICAgIGlmICh0eXBlb2YgY3VzdG9tQ29tbWFuZHMgPT09ICdvYmplY3QnICYmICFBcnJheS5pc0FycmF5KGN1c3RvbUNvbW1hbmRzKSkge1xuICAgICAgICBCbHVlcHJpbnRzID0gY3VzdG9tQ29tbWFuZHNcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQ3VzdG9tIGNvbW1hbmQgcHJvdmlkZWQgYXJlIG5vdCBpbiBhIHZhbGlkIGZvcm1hdC4nKVxuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IFNoZWxsQ29tbWFuZHMgPSB7fVxuICAgIE9iamVjdC5rZXlzKEJsdWVwcmludHMpLm1hcCgoa2V5KSA9PiB7XG4gICAgICBjb25zdCBjbWQgPSBCbHVlcHJpbnRzW2tleV1cbiAgICAgIGlmICh0eXBlb2YgY21kLm5hbWUgPT09ICdzdHJpbmcnICYmIHR5cGVvZiBjbWQuZm4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgY21kLnNoZWxsID0gU2hlbGxSZWZlcmVuY2VcbiAgICAgICAgU2hlbGxDb21tYW5kc1trZXldID0gbmV3IENvbW1hbmQoY21kKVxuICAgICAgfVxuICAgIH0pXG4gICAgcmV0dXJuIFNoZWxsQ29tbWFuZHNcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEludGVycHJldGVyXG4iLCJjb25zdCBJbnRlcnByZXRlciA9IHJlcXVpcmUoJy4vSW50ZXJwcmV0ZXInKVxuY29uc3QgRmlsZXN5c3RlbSA9IHJlcXVpcmUoJy4vRmlsZXN5c3RlbScpXG5cbi8qKlxuICogU2hlbGwgQ2xhc3MgaW5oZXJpdHMgZnJvbSBJbnRlcnByZXRlclxuICogT3B0aW9uczpcbiAqICAtIGZpbGVzeXN0ZW0ge09iamVjdH1cbiAqICAtIGNvbW1hbmRzIHtPYmplY3R9XG4gKiAgLSB1c2VyIHtTdHJpbmd9XG4gKiAgLSBob3N0bmFtZSB7U3RyaW5nfVxuICovXG5jbGFzcyBTaGVsbCBleHRlbmRzIEludGVycHJldGVye1xuICBjb25zdHJ1Y3Rvcih7IGZpbGVzeXN0ZW0gPSB1bmRlZmluZWQsIGNvbW1hbmRzID0gdW5kZWZpbmVkLCB1c2VyID0gJ3Jvb3QnLCBob3N0bmFtZSA9ICdteS5ob3N0Lm1lJyB9ID0ge30pIHtcbiAgICBzdXBlcigpXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIHRoZSB2aXJ0dWFsIGZpbGVzeXN0ZW1cbiAgICAgKiBAcmV0dXJuIHJlZmVyZW5jZSB0byBpbnN0YW5jZSBvZiBAY2xhc3MgRmlsZXN5c3RlbVxuICAgICAqL1xuICAgIHRoaXMuZnMgPSBuZXcgRmlsZXN5c3RlbShmaWxlc3lzdGVtLCB0aGlzKVxuICAgIHRoaXMudXNlciA9IHVzZXJcbiAgICB0aGlzLmhvc3RuYW1lID0gaG9zdG5hbWVcblxuICAgIC8vIEluaXQgYnVpbHRpbiBjb21tYW5kcywgQG1ldGhvZCBpbiBwYXJlbnRcbiAgICAvLyBwYXNzIHNoZWxsIHJlZmVyZW5jZVxuICAgIHRoaXMuU2hlbGxDb21tYW5kcyA9IHRoaXMucmVnaXN0ZXJDb21tYW5kcyh0aGlzKVxuICAgIHRoaXMuU2hlbGxDb21tYW5kcyA9IHtcbiAgICAgIC4uLnRoaXMuU2hlbGxDb21tYW5kcyxcbiAgICAgIC4uLnRoaXMucmVnaXN0ZXJDb21tYW5kcyh0aGlzLCBjb21tYW5kcyksXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFBhc3MgY29udHJvbCB0byBJbnRlcnByZXRlclxuICAgKiBAcmV0dXJuIG91dHB1dCBhcyBbU3RyaW5nXVxuICAgKi9cbiAgcnVuKGNtZCkge1xuICAgIHJldHVybiB0aGlzLmV4ZWMoY21kKVxuICB9XG59XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShTaGVsbC5wcm90b3R5cGUsICdmcycsIHsgd3JpdGFibGU6IHRydWUsIGVudW1lcmFibGU6IGZhbHNlIH0pXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoU2hlbGwucHJvdG90eXBlLCAnU2hlbGxDb21tYW5kcycsIHsgd3JpdGFibGU6IHRydWUsIGVudW1lcmFibGU6IGZhbHNlIH0pXG5cbm1vZHVsZS5leHBvcnRzID0gU2hlbGxcbiIsInZhciBTaGVsbCA9IHJlcXVpcmUoJy4vU2hlbGwnKVxuXG4vKipcbiAqIFRlcm1pbmFsXG4gKiBXcmFwcGVyIG9uIHRoZSBTaGVsbCBjbGFzc1xuICogVGhpcyB3aWxsIG9ubHkgaGFuZGxlIHRoZSBVSSBvZiB0aGUgdGVybWluYWwuXG4gKiBZb3UgY2FuIHVzZSBpdCBvciB1c2UgZGlyZWN0bHkgdGhlIGJyb3dzZXItc2hlbGwuanNcbiAqIGFuZCBjcmVhdGUgeW91ciBjdXN0b20gVUkgY2FsbGluZyBhbmQgZGlzcGxheWluZyB0aGUgQG1ldGhvZCBydW4oKSBjb21tYW5kc1xuICogX19fX19fX19fX19cbiAqIE9wdGlvbnM6XG4gKiAgLSBmaWxlc3lzdGVtIHtPYmplY3R9XG4gKiAgLSBjb21tYW5kcyB7T2JqZWN0fVxuICogIC0gdXNlciB7U3RyaW5nfVxuICogIC0gaG9zdG5hbWUge1N0cmluZ31cbiAqL1xuY2xhc3MgVGVybWluYWwgZXh0ZW5kcyBTaGVsbHtcbiAgY29uc3RydWN0b3Ioc2VsZWN0b3IgPSB1bmRlZmluZWQsIG9wdGlvbnMgPSB7fSkge1xuICAgIHN1cGVyKG9wdGlvbnMpIC8vIG11c3QgcGFzcyBvcHRpb24gaGVyZVxuXG4gICAgaWYgKCFzZWxlY3RvcikgdGhyb3cgbmV3IEVycm9yKCdObyB3cmFwcGVyIGVsZW1lbnQgc2VsZWN0b3IgcHJvdmlkZWQnKVxuICAgIHRyeSB7XG4gICAgICB0aGlzLmNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpXG4gICAgICBpZiAoIXRoaXMuY29udGFpbmVyKSB0aHJvdyBuZXcgRXJyb3IoJ25ldyBUZXJtaW5hbCgpOiBET00gZWxlbWVudCBub3QgZm91bmQnKVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignbmV3IFRlcm1pbmFsKCk6IE5vdCB2YWxpZCBET00gc2VsZWN0b3IuJylcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5pbml0KClcbiAgfVxuXG4gIGluaXQoKSB7XG4gICAgdGhpcy5nZW5lcmF0ZVJvdygpXG4gICAgdGhpcy5jb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgbGV0IGlucHV0ID0gdGhpcy5jb250YWluZXIucXVlcnlTZWxlY3RvcignLmN1cnJlbnQgLnRlcm1pbmFsLWlucHV0JylcbiAgICAgIGlmIChpbnB1dCkgaW5wdXQuZm9jdXMoKVxuICAgIH0pXG4gIH1cblxuICBnZW5lcmF0ZVJvdygpIHtcbiAgICB2YXIgdGhhdCA9IHRoaXNcblxuICAgIC8vIFJlbW92ZSBwcmV2aW91cyBjdXJyZW50IGFjdGl2ZSByb3dcbiAgICBsZXQgY3VycmVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jdXJyZW50LnRlcm1pbmFsLXJvdycpXG4gICAgaWYgKGN1cnJlbnQpIHtcbiAgICAgIGN1cnJlbnQuY2xhc3NMaXN0LnJlbW92ZSgnY3VycmVudCcpXG4gICAgfVxuXG4gICAgbGV0IHByZXZJbnB1dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy50ZXJtaW5hbC1pbnB1dCcpXG4gICAgaWYgKHByZXZJbnB1dCkge1xuICAgICAgcHJldklucHV0LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleXVwJywgdGhpcy5zdWJtaXRIYW5kbGVyKVxuICAgIH1cblxuICAgIGNvbnN0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgZGl2LmNsYXNzTGlzdC5hZGQoJ2N1cnJlbnQnLCAndGVybWluYWwtcm93JylcbiAgICBkaXYuaW5uZXJIVE1MID0gJydcbiAgICBkaXYuaW5uZXJIVE1MICs9IGA8c3BhbiBjbGFzcz1cInRlcm1pbmFsLWluZm9cIj4ke3RoaXMudXNlcn1AJHt0aGlzLmhvc3RuYW1lfSAtICR7dGhpcy5mcy5nZXRDdXJyZW50RGlyZWN0b3J5KCl9IOKenCA8L3NwYW4+YFxuICAgIGRpdi5pbm5lckhUTUwgKz0gYDxpbnB1dCB0eXBlPVwidGV4dFwiIGNsYXNzPVwidGVybWluYWwtaW5wdXRcIiBzaXplPVwiMlwiIHN0eWxlPVwiY3Vyc29yOm5vbmU7XCI+YFxuXG4gICAgLy8gYWRkIG5ldyByb3cgYW5kIGZvY3VzIGl0XG4gICAgdGhpcy5jb250YWluZXIuYXBwZW5kQ2hpbGQoZGl2KVxuICAgIGxldCBpbnB1dCA9IHRoaXMuY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy5jdXJyZW50IC50ZXJtaW5hbC1pbnB1dCcpXG4gICAgaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBlID0+IHRoaXMuc3VibWl0SGFuZGxlcihlKSlcbiAgICBpbnB1dC5mb2N1cygpXG5cbiAgICByZXR1cm4gaW5wdXRcbiAgfVxuXG4gIGdlbmVyYXRlT3V0cHV0KG91dCA9ICcnKSB7XG4gICAgY29uc3QgcHJlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncHJlJylcbiAgICBwcmUudGV4dENvbnRlbnQgPSBvdXRcbiAgICB0aGlzLmNvbnRhaW5lci5hcHBlbmRDaGlsZChwcmUpXG4gICAgcmV0dXJuIHRoaXMuZ2VuZXJhdGVSb3coKVxuICB9XG5cbiAgc3VibWl0SGFuZGxlcihlKSB7XG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuICAgIC8vIFJVTiB3aGVuIEVOVEVSIGlzIHByZXNzZWRcbiAgICBlLnRhcmdldC5zaXplID0gZS50YXJnZXQudmFsdWUubGVuZ3RoICsgMiB8fCAzXG4gICAgaWYgKGV2ZW50LndoaWNoID09IDEzIHx8IGV2ZW50LmtleUNvZGUgPT0gMTMpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgY29uc3QgY29tbWFuZCA9IGUudGFyZ2V0LnZhbHVlLnRyaW0oKVxuICAgICAgLy8gRVhFQ1xuICAgICAgY29uc3Qgb3V0cHV0ID0gdGhpcy5ydW4oY29tbWFuZClcbiAgICAgIHJldHVybiB0aGlzLmdlbmVyYXRlT3V0cHV0KG91dHB1dClcbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBUZXJtaW5hbFxuIiwiY29uc3QgeyBuYW1lLCB2ZXJzaW9uLCBkZXNjcmlwdGlvbiwgcmVwb3NpdG9yeSwgYXV0aG9yLCBsaWNlbnNlIH0gPSByZXF1aXJlKCcuLi8uLi9wYWNrYWdlLmpzb24nKVxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgLyoqXG4gICAqIEhlbHBcbiAgICogQHJldHVybiBMaXN0IG9mIGNvbW1hbmRzXG4gICAqL1xuICBoZWxwOiB7XG4gICAgbmFtZTogJ2hlbHAnLFxuICAgIHR5cGU6ICdidWlsdGluJyxcbiAgICBtYW46ICdMaXN0IG9mIGF2YWlibGUgY29tbWFuZHMnLFxuICAgIGZuOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBgQ29tbWFuZHMgYXZhaWJsZTogJHtPYmplY3Qua2V5cyh0aGlzLnNoZWxsLlNoZWxsQ29tbWFuZHMpLmpvaW4oJywgJyl9YFxuICAgIH1cbiAgfSxcblxuICB3aG9hbWk6IHtcbiAgICBuYW1lOiAnd2hvYW1pJyxcbiAgICB0eXBlOiAnYnVpbHRpbicsXG4gICAgbWFuOiAnQ3VycmVudCB1c2VyJyxcbiAgICBmbjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5zaGVsbC51c2VyXG4gICAgfSxcbiAgfSxcblxuICBhYm91dDoge1xuICAgIG5hbWU6ICdhYm91dCcsXG4gICAgdHlwZTogJ2J1aWx0aW4nLFxuICAgIG1hbjogJ0Fib3V0IHRoaXMgcHJvamVjdCcsXG4gICAgZm46IGZ1bmN0aW9uKCkge1xuICAgICAgbGV0IHN0ciA9ICcnXG4gICAgICBzdHIgKz0gYG5hbWU6ICR7bmFtZX1cXG5gXG4gICAgICBzdHIgKz0gYHZlcnNpb246ICR7dmVyc2lvbn1cXG5gXG4gICAgICBzdHIgKz0gYGRlc2NyaXB0aW9uOiAke2Rlc2NyaXB0aW9ufVxcbmBcbiAgICAgIHN0ciArPSBgcmVwb3NpdG9yeTogJHtyZXBvc2l0b3J5fVxcbmBcbiAgICAgIHN0ciArPSBgYXV0aG9yOiAke2F1dGhvcn1cXG5gXG4gICAgICBzdHIgKz0gYGxpY2Vuc2U6ICR7bGljZW5zZX1cXG5gXG4gICAgICByZXR1cm4gc3RyXG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBSZXR1cm4gcGFzc2VkIGFyZ3VtZW50cywgZm9yIHRlc3RpbmcgcHVycG9zZXNcbiAgICovXG4gIGFyZ3VtZW50czoge1xuICAgIG5hbWU6ICdhcmd1bWVudHMnLFxuICAgIHR5cGU6ICdidWlsdGluJyxcbiAgICBtYW46ICdSZXR1cm4gYXJndW1lbnQgcGFzc2VkLCB1c2VkIGZvciB0ZXN0aW5nIHB1cnBvc2UnLFxuICAgIGZuOiBhcmdzID0+IGFyZ3NcbiAgfSxcblxuICAvKipcbiAgICogQ2hhbmdlIERpcmVjdG9yeVxuICAgKiBAcmV0dXJuIFN1Y2Nlc3MvRmFpbCBNZXNzYWdlIFN0cmluZ1xuICAgKi9cbiAgY2Q6IHtcbiAgICBuYW1lOiAnY2QnLFxuICAgIHR5cGU6ICdidWlsdGluJyxcbiAgICBtYW46ICdDaGFuZ2UgZGlyZWN0b3J5LCBwYXNzIGFic29sdXRlIG9yIHJlbGF0aXZlIHBhdGg6IGVnLiBjZCAvZXRjLCBjZCAvIGNkL215L25lc3RlZC9kaXInLFxuICAgIGZuOiBmdW5jdGlvbihwYXRoKSB7XG4gICAgICBpZiAoIXBhdGgpIHRocm93IG5ldyBFcnJvcignLWludmFsaWQgTm8gcGF0aCBwcm92aWRlZC4nKVxuICAgICAgcGF0aCA9IHBhdGguam9pbigpXG4gICAgICB0cnl7XG4gICAgICAgIHJldHVybiB0aGlzLnNoZWxsLmZzLmNoYW5nZURpcihwYXRoKVxuICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgIHRocm93IGVcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIGxzIENvbW1hbmRcbiAgICogTGlzdCBkaXJlY3RvcnkgZmlsZXNcbiAgICogQHBhcmFtIGFycmF5IG9mIGFyZ3NcbiAgICogQHJldHVybiBmb3JtYXR0ZWQgU3RyaW5nXG4gICAqL1xuICBsczoge1xuICAgIG5hbWU6ICdscycsXG4gICAgdHlwZTogJ2J1aWx0aW4nLFxuICAgIG1hbjogJ2xpc3QgZGlyZWN0b3J5IGZpbGVzLCBwYXNzIGFic29sdXRlL3JlbGF0aXZlIHBhdGgsIGlmIGVtcHR5IGxpc3QgY3VycmVudCBkaXJlY3RvcnknLFxuICAgIGZuOiBmdW5jdGlvbihwYXRoID0gWycuLyddICkge1xuICAgICAgcGF0aCA9IHBhdGguam9pbigpXG4gICAgICBsZXQgbGlzdCwgcmVzcG9uc2VTdHJpbmcgPSAnJ1xuICAgICAgdHJ5e1xuICAgICAgICBsaXN0ID0gdGhpcy5zaGVsbC5mcy5saXN0RGlyKHBhdGgpXG4gICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgdGhyb3cgZVxuICAgICAgfVxuICAgICAgZm9yIChsZXQgZmlsZSBpbiBsaXN0KSB7XG4gICAgICAgIGlmIChsaXN0Lmhhc093blByb3BlcnR5KGZpbGUpKSB7XG4gICAgICAgICAgcmVzcG9uc2VTdHJpbmcgKz0gYCR7bGlzdFtmaWxlXS5wZXJtaXNzaW9ufVxcdCR7bGlzdFtmaWxlXS51c2VyfSAke2xpc3RbZmlsZV0uZ3JvdXB9XFx0JHtsaXN0W2ZpbGVdLm5hbWV9XFxuYFxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzcG9uc2VTdHJpbmdcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIENBVCBDb21tYW5kXG4gICAqIFJlYWQgRmlsZVxuICAgKiBAcmV0dXJuIGZvcm1hdHRlZCBTdHJpbmdcbiAgICovXG4gIGNhdDoge1xuICAgIG5hbWU6ICdjYXQnLFxuICAgIHR5cGU6ICdidWlsdGluJyxcbiAgICBtYW46ICdSZXR1cm4gZmlsZSBjb250ZW50LCB0YWtlIG9uZSBhcmd1bWVudDogZmlsZSBwYXRoIChyZWxhdGl2ZS9hYnNvbHV0ZSknLFxuICAgIGZuOiBmdW5jdGlvbihwYXRoID0gWycuLyddKSB7XG4gICAgICBwYXRoID0gcGF0aC5qb2luKClcbiAgICAgIGxldCBmaWxlLCByZXNwb25zZVN0cmluZyA9ICcnXG4gICAgICB0cnl7XG4gICAgICAgIGZpbGUgPSB0aGlzLnNoZWxsLmZzLnJlYWRGaWxlKHBhdGgpXG4gICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgdGhyb3cgZVxuICAgICAgfVxuICAgICAgcmV0dXJuIGZpbGUuY29udGVudFxuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogTWFuXG4gICAqIFJldHVybiBjb21tYW5kIG1hbnVhbCBpbmZvXG4gICAqIEByZXR1cm4ge3N0cmluZ31cbiAgICovXG4gIG1hbjoge1xuICAgIG5hbWU6ICdtYW4nLFxuICAgIHR5cGU6ICdidWlsdGluJyxcbiAgICBtYW46ICdDb21tYW5kIG1hbnVhbCwgdGFrZXMgb25lIGFyZ3VtZW50LCBjb21tYW5kIG5hbWUnLFxuICAgIGZuOiBmdW5jdGlvbihhcmdzKSB7XG4gICAgICBpZiAoIWFyZ3MgfHwgIWFyZ3NbMF0pIHRocm93IG5ldyBFcnJvcignbWFuOiBubyBjb21tYW5kIHByb3ZpZGVkLicpXG4gICAgICBsZXQgY29tbWFuZCA9IGFyZ3NbMF1cbiAgICAgIGlmICghdGhpcy5zaGVsbC5TaGVsbENvbW1hbmRzW2NvbW1hbmRdKSB0aHJvdyBuZXcgRXJyb3IoJ2NvbW1hbmQgZG9lc25cXCd0IGV4aXN0LicpXG4gICAgICBpZiAoIXRoaXMuc2hlbGwuU2hlbGxDb21tYW5kc1tjb21tYW5kXS5tYW4pIHRocm93IG5ldyBFcnJvcignbm8gbWFudWFsIGVudHJ5IGZvciB0aGlzIGNvbW1hbmQuJylcbiAgICAgIHJldHVybiB0aGlzLnNoZWxsLlNoZWxsQ29tbWFuZHNbY29tbWFuZF0ubWFuXG4gICAgfSxcbiAgfSxcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuXG4gICdmaWxlLmgnOiAnI2luY2x1ZGUgPG5vcGUuaD4nLFxuXG4gIGV0Yzoge1xuICAgIGFwYWNoZTI6IHtcbiAgICAgICdhcGFjaGUyLmNvbmYnOiAnTm90IFdoYXQgeW91IHdlcmUgbG9va2luZyBmb3IgOiknLFxuICAgIH0sXG4gIH0sXG5cbiAgaG9tZToge1xuICAgIGd1ZXN0OiB7XG4gICAgICBkb2NzOiB7XG4gICAgICAgICdteWRvYy5tZCc6ICdUZXN0RmlsZScsXG4gICAgICAgICdteWRvYzIubWQnOiAnVGVzdEZpbGUyJyxcbiAgICAgICAgJ215ZG9jMy5tZCc6ICdUZXN0RmlsZTMnLFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuXG4gIHJvb3Q6e1xuICAgICcuenNocmMnOiAnbm90IGV2ZW4gY2xvc2UgOiknLFxuICAgICcub2gtbXktenNoJzoge1xuICAgICAgdGhlbWVzOiB7fSxcbiAgICB9LFxuICB9LFxufVxuIiwibW9kdWxlLmV4cG9ydHM9e1xuICBcIm5hbWVcIjogXCJicm93c2VyLXRlcm1pbmFsLmpzXCIsXG4gIFwidmVyc2lvblwiOiBcIjAuMi42XCIsXG4gIFwiZGVzY3JpcHRpb25cIjogXCJTaW1wbGUgQnJvd3NlciBUZXJtaW5hbCBpbiBwdXJlIGpzLCB1c2FibGUgZm9yIHdlYiBwcmVzZW50YXRpb24gb2YgQ0xJIHRvb2xzIGFuZCB3aGF0ZXZlciB5b3Ugd2FudCBpdCB0byBkbyFcIixcbiAgXCJtYWluXCI6IFwidGVybWluYWwuanNcIixcbiAgXCJzY3JpcHRzXCI6IHtcbiAgICBcInRlc3RcIjogXCJtb2NoYSAtLWNvbXBpbGVycyBiYWJlbC1jb3JlL3JlZ2lzdGVyIHRlc3RzL1wiLFxuICAgIFwiYnVpbGRcIjogXCJucG0gcnVuIGJ1aWxkOmRldiAmJiBucG0gcnVuIGJ1aWxkOnByb2RcIixcbiAgICBcImJ1aWxkOmRldlwiOiBcImd1bHAgYnJvd3NlcmlmeVwiLFxuICAgIFwiYnVpbGQ6cHJvZFwiOiBcImd1bHAgYnJvd3NlcmlmeS1wcm9kdWN0aW9uXCJcbiAgfSxcbiAgXCJrZXl3b3Jkc1wiOiBbXG4gICAgXCJ0ZXJtaW5hbFwiLFxuICAgIFwiamF2YXNjcmlwdFwiLFxuICAgIFwic2ltdWxhdG9yXCIsXG4gICAgXCJicm93c2VyXCIsXG4gICAgXCJwcmVzZW50YXRpb25cIixcbiAgICBcIm1vY2t1cFwiLFxuICAgIFwiY29tbWFuZHNcIixcbiAgICBcImZha2VcIlxuICBdLFxuICBcInJlcG9zaXRvcnlcIjogXCJodHRwczovL2dpdGh1Yi5jb20vS2lya2hhbW1ldHovYnJvd3Nlci10ZXJtaW5hbC5qc1wiLFxuICBcImF1dGhvclwiOiBcIlNpbW9uZSBDb3JzaVwiLFxuICBcImxpY2Vuc2VcIjogXCJJU0NcIixcbiAgXCJkZXZEZXBlbmRlbmNpZXNcIjoge1xuICAgIFwiYmFiZWxpZnlcIjogXCJeNy4zLjBcIixcbiAgICBcImJyb3dzZXJpZnlcIjogXCJeMTMuMy4wXCIsXG4gICAgXCJjaGFsa1wiOiBcIl4xLjEuM1wiLFxuICAgIFwiZ3VscFwiOiBcIl4zLjkuMVwiLFxuICAgIFwiZ3VscC1yZW5hbWVcIjogXCJeMS4yLjJcIixcbiAgICBcImd1bHAtc291cmNlbWFwc1wiOiBcIl4yLjQuMFwiLFxuICAgIFwiZ3VscC11Z2xpZnlcIjogXCJeMi4wLjBcIixcbiAgICBcImd1bHAtdXRpbFwiOiBcIl4zLjAuOFwiLFxuICAgIFwidWdsaWZ5LWpzXCI6IFwiXjIuNi40XCIsXG4gICAgXCJ1dGlscy1tZXJnZVwiOiBcIl4xLjAuMFwiLFxuICAgIFwidmlueWwtYnVmZmVyXCI6IFwiXjEuMC4wXCIsXG4gICAgXCJ2aW55bC1zb3VyY2Utc3RyZWFtXCI6IFwiXjEuMS4wXCIsXG4gICAgXCJ3YXRjaGlmeVwiOiBcIl4zLjguMFwiXG4gIH0sXG4gIFwiZGVwZW5kZW5jaWVzXCI6IHtcbiAgICBcImJhYmVsXCI6IFwiXjYuNS4yXCIsXG4gICAgXCJiYWJlbC1jb3JlXCI6IFwiXjYuMjEuMFwiLFxuICAgIFwiYmFiZWwtcG9seWZpbGxcIjogXCJeNi4yMi4wXCIsXG4gICAgXCJiYWJlbC1wcmVzZXQtZXMyMDE1XCI6IFwiXjYuMTguMFwiLFxuICAgIFwiYmFiZWwtcHJlc2V0LXN0YWdlLTNcIjogXCJeNi4xNy4wXCIsXG4gICAgXCJiYWJlbGlmeVwiOiBcIl43LjMuMFwiLFxuICAgIFwiY2hhaVwiOiBcIl4zLjUuMFwiLFxuICAgIFwibW9jaGFcIjogXCJeMy4yLjBcIlxuICB9XG59XG4iXX0=
