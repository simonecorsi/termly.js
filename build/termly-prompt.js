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

},{"../configs/default-filesystem":8,"./File":2}],4:[function(require,module,exports){
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

},{"../configs/builtin-commands":7,"./Command":1}],5:[function(require,module,exports){
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

},{"./Shell":5}],7:[function(require,module,exports){
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

},{"../../package.json":10}],8:[function(require,module,exports){
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

},{"./classes/Terminal":6}],10:[function(require,module,exports){
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
    "watchify": "^3.8.0",
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

},{}]},{},[9])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJiaW4vY2xhc3Nlcy9Db21tYW5kLmpzIiwiYmluL2NsYXNzZXMvRmlsZS5qcyIsImJpbi9jbGFzc2VzL0ZpbGVzeXN0ZW0uanMiLCJiaW4vY2xhc3Nlcy9JbnRlcnByZXRlci5qcyIsImJpbi9jbGFzc2VzL1NoZWxsLmpzIiwiYmluL2NsYXNzZXMvVGVybWluYWwuanMiLCJiaW4vY29uZmlncy9idWlsdGluLWNvbW1hbmRzLmpzIiwiYmluL2NvbmZpZ3MvZGVmYXVsdC1maWxlc3lzdGVtLmpzIiwiYmluL3Rlcm1seS1wcm9tcHQuanMiLCJwYWNrYWdlLmpzb24iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7QUNBQTs7Ozs7O0lBTU0sTztBQUNKLHFCQUF3RTtBQUFBLG1GQUFILEVBQUc7QUFBQSxRQUExRCxJQUEwRCxRQUExRCxJQUEwRDtBQUFBLFFBQXBELEVBQW9ELFFBQXBELEVBQW9EO0FBQUEseUJBQWhELElBQWdEO0FBQUEsUUFBaEQsSUFBZ0QsNkJBQXpDLEtBQXlDO0FBQUEsMEJBQWxDLEtBQWtDO0FBQUEsUUFBbEMsS0FBa0MsOEJBQTFCLFNBQTBCO0FBQUEsd0JBQWYsR0FBZTtBQUFBLFFBQWYsR0FBZSw0QkFBVCxFQUFTOztBQUFBOztBQUN0RSxRQUFJLE9BQU8sSUFBUCxLQUFnQixRQUFwQixFQUE4QixNQUFNLE1BQU0sK0JBQU4sQ0FBTjtBQUM5QixRQUFJLE9BQU8sRUFBUCxLQUFjLFVBQWxCLEVBQThCLE1BQU0sTUFBTSx3Q0FBTixDQUFOOztBQUU5Qjs7OztBQUlBLFNBQUssRUFBTCxHQUFVLEdBQUcsSUFBSCxDQUFRLElBQVIsQ0FBVjtBQUNBLFNBQUssSUFBTCxHQUFZLElBQVo7QUFDQSxTQUFLLElBQUwsR0FBWSxJQUFaO0FBQ0EsU0FBSyxHQUFMLEdBQVcsR0FBWDs7QUFFQSxRQUFJLEtBQUosRUFBVztBQUNULFdBQUssS0FBTCxHQUFhLEtB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Q0osb0JBQVksVUFEUjtBQUVKLHFCQUFhLFdBRlQ7QUFHSixxQkFBYTtBQUhUO0FBREQ7QUFESCxHQVZTOztBQW9CZixRQUFLO0FBQ0gsY0FBVSxtQkFEUDtBQUVILGtCQUFjO0FBQ1osY0FBUTtBQURJO0FBRlg7QUFwQlUsQ0FBakI7Ozs7OztBQ0FBOzs7Ozs7QUFNQSxPQUFPLFVBQVAsSUFBcUIsUUFBUSxvQkFBUixDQUFyQjs7Ozs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxuICogQ29tbWFuZCBDbGFzc1xuICogQHBhcmFtIG5hbWUgW1N0cmluZ10sIGZuIFtGdW5jdGlvbl1cbiAqXG4gKiBkb24ndCBwYXNzIGFycm93IGZ1bmN0aW9uIGlmIHlvdSB3YW50IHRvIHVzZSB0aGlzIGluc2lkZSB5b3VyIGNvbW1hbmQgZnVuY3Rpb24gdG8gYWNjZXNzIHZhcmlvdXMgc2hhcmVkIHNoZWxsIG9iamVjdFxuICovXG5jbGFzcyBDb21tYW5kIHtcbiAgY29uc3RydWN0b3IoeyBuYW1lLCBmbiwgdHlwZSA9ICd1c3InLCBzaGVsbCA9IHVuZGVmaW5lZCwgbWFuID0gJyd9ID0ge30pe1xuICAgIGlmICh0eXBlb2YgbmFtZSAhPT0gJ3N0cmluZycpIHRocm93IEVycm9yKCdDb21tYW5kIG5hbWUgbXVzdCBiZSBhIHN0cmluZycpXG4gICAgaWYgKHR5cGVvZiBmbiAhPT0gJ2Z1bmN0aW9uJykgdGhyb3cgRXJyb3IoJ0NvbW1hbmQgZnVuY3Rpb24gbXVzdCBiZS4uLiBhIGZ1bmN0aW9uJylcblxuICAgIC8qKlxuICAgICAqIHVzZSB3aG9sZSBmdW5jdGlvbiBpbnN0ZWFkIG9mIGFycm93IGlmIHlvdSB3YW50IHRvIGFjY2Vzc1xuICAgICAqIGNpcmN1bGFyIHJlZmVyZW5jZSBvZiBDb21tYW5kXG4gICAgICovXG4gICAgdGhpcy5mbiA9IGZuLmJpbmQodGhpcylcbiAgICB0aGlzLm5hbWUgPSBuYW1lXG4gICAgdGhpcy50eXBlID0gdHlwZVxuICAgIHRoaXMubWFuID0gbWFuXG5cbiAgICBpZiAoc2hlbGwpIHtcbiAgICAgIHRoaXMuc2hlbGwgPSBzaGVsbFxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBEaXNwYXRjaCBDb21tYW5kIEV4ZWN1dGlvblxuICAgKlxuICAgKiBAdGlwIGRvbid0IHVzZSBhcnJvdyBmdW5jdGlvbiBpbiB5b3UgY29tbWFuZCBpZiB5b3Ugd2FudCB0aGUgYXJndW1lbnRzXG4gICAqIG5laXRoZXIgc3VwZXIgYW5kIGFyZ3VtZW50cyBnZXQgYmluZGVkIGluIEFGLlxuICAgKi9cbiAgZXhlYyhhcmdzID0gW10pIHtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoYXJncykpIHRocm93IEVycm9yKCdDb21tYW5kIGV4ZWMgYXJncyBtdXN0IGJlIGluIGFuIGFycmF5JylcbiAgICBpZiAoYXJncy5sZW5ndGgpIHJldHVybiB0aGlzLmZuKGFyZ3MpXG4gICAgcmV0dXJuIHRoaXMuZm4oKVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ29tbWFuZFxuIiwiLyoqXG4gKiBAY2xhc3MgU2luZ2xlIEZpbGUgQ2xhc3NcbiAqIFNpbXVsYXRlIGZpbGUgcHJvcGVydGllc1xuICovXG5jbGFzcyBGaWxlIHtcbiAgY29uc3RydWN0b3IoeyBuYW1lID0gJycsIHR5cGUgPSAnZmlsZScsIGNvbnRlbnQgPSAnJ30gPSB7fSkge1xuICAgIHRoaXMudWlkID0gdGhpcy5nZW5VaWQoKVxuICAgIHRoaXMubmFtZSA9IG5hbWVcbiAgICB0aGlzLnR5cGUgPSB0eXBlXG4gICAgdGhpcy5jb250ZW50ID0gY29udGVudFxuICAgIHRoaXMudXNlciA9ICdyb290J1xuICAgIHRoaXMuZ3JvdXAgPSAncm9vdCdcblxuICAgIGlmICh0aGlzLnR5cGUgPT09ICdmaWxlJykge1xuICAgICAgdGhpcy5wZXJtaXNzaW9uID0gJ3J3eHItLXItLSdcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5wZXJtaXNzaW9uID0gJ2Ryd3hyLXhyLXgnXG4gICAgfVxuXG4gIH1cblxuICBnZW5VaWQoKSB7XG4gICAgZnVuY3Rpb24gczQoKSB7XG4gICAgICByZXR1cm4gTWF0aC5mbG9vcigoMSArIE1hdGgucmFuZG9tKCkpICogMHgxMDAwMClcbiAgICAgICAgLnRvU3RyaW5nKDE2KVxuICAgICAgICAuc3Vic3RyaW5nKDEpO1xuICAgIH1cbiAgICByZXR1cm4gczQoKSArIHM0KCkgKyAnLScgKyBzNCgpICsgJy0nICsgczQoKSArICctJyArXG4gICAgICBzNCgpICsgJy0nICsgczQoKSArIHM0KCkgKyBzNCgpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRmlsZVxuIiwiY29uc3QgREVGQVVMVF9GUyA9IHJlcXVpcmUoJy4uL2NvbmZpZ3MvZGVmYXVsdC1maWxlc3lzdGVtJylcbmNvbnN0IEZpbGUgPSByZXF1aXJlKCcuL0ZpbGUnKVxuXG4vKipcbiAqIEBjbGFzcyBWaXJ0dWFsIEZpbGVzeXN0ZW1cbiAqIFJlcHJlc2VudGVkIGFzIGFuIG9iamVjdCBvZiBub2Rlc1xuICovXG5jbGFzcyBGaWxlc3lzdGVtIHtcbiAgY29uc3RydWN0b3IoZnMgPSBERUZBVUxUX0ZTLCBzaGVsbCA9IHt9KSB7XG4gICAgdGhpcy5zaGVsbCA9IHNoZWxsXG4gICAgaWYgKHR5cGVvZiBmcyAhPT0gJ29iamVjdCcgfHwgQXJyYXkuaXNBcnJheShmcykpIHRocm93IG5ldyBFcnJvcignVmlydHVhbCBGaWxlc3lzdGVtIHByb3ZpZGVkIG5vdCB2YWxpZCwgaW5pdGlhbGl6YXRpb24gZmFpbGVkLicpXG5cbiAgICAvLyBOb3QgQnkgUmVmZXJlbmNlLlxuICAgIC8vIEhBQ0s6IE9iamVjdCBhc3NpZ24gcmVmdXNlIHRvIHdvcmsgYXMgaW50ZW5kZWQuXG4gICAgZnMgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGZzKSlcbiAgICB0aGlzLkZpbGVTeXN0ZW0gPSB0aGlzLmluaXRGcyhmcylcblxuICAgIC8vIENXRCBmb3IgY29tbWFuZHMgdXNhZ2VcbiAgICB0aGlzLmN3ZCA9IFsnLyddXG4gIH1cblxuICAvKipcbiAgICogSW5pdCAmIFBhc3MgQ29udHJvbCB0byByZWN1cnJzaXZlIGZ1bmN0aW9uXG4gICAqIEByZXR1cm4gbmV3IEZpbGVzeXN0ZW0gYXMgbm9kZXMgb2YgbXVsdGlwbGUgQGNsYXNzIEZpbGVcbiAgICovXG4gIGluaXRGcyhmcykge1xuICAgIHRoaXMuYnVpbGRWaXJ0dWFsRnMoZnMpXG4gICAgcmV0dXJuIGZzXG4gIH1cblxuICAvKipcbiAgICogVHJhdmVyc2UgYWxsIG5vZGUgYW5kIGJ1aWxkIGEgdmlydHVhbCByZXByZXNlbnRhdGlvbiBvZiBhIGZpbGVzeXN0ZW1cbiAgICogRWFjaCBub2RlIGlzIGEgRmlsZSBpbnN0YW5jZS5cbiAgICogQHBhcmFtIE1vY2tlZCBGaWxlc3lzdGVtIGFzIE9iamVjdFxuICAgKlxuICAgKi9cbiAgYnVpbGRWaXJ0dWFsRnMob2JqKSB7XG4gICAgZm9yIChsZXQga2V5IGluIG9iaikge1xuICAgICAgaWYgKG9iai5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgIGlmICh0eXBlb2Ygb2JqW2tleV0gPT09ICdvYmplY3QnICYmICFBcnJheS5pc0FycmF5KG9ialtrZXldKSkge1xuICAgICAgICAgIG9ialtrZXldID0gbmV3IEZpbGUoeyBuYW1lOiBrZXksIGNvbnRlbnQ6IG9ialtrZXldLCB0eXBlOiAnZGlyJyB9KVxuICAgICAgICAgIHRoaXMuYnVpbGRWaXJ0dWFsRnMob2JqW2tleV0uY29udGVudClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBvYmpba2V5XSA9IG5ldyBGaWxlKHsgbmFtZToga2V5LCBjb250ZW50OiBvYmpba2V5XSB9KVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhIHN0cmluZ2VkIHBhdGggYW5kIHJldHVybiBhcyBhcnJheVxuICAgKiB0aHJvdyBlcnJvciBpZiBwYXRoIGZvcm1hdCBpcyBpbnZhbGlkXG4gICAqIFJlbGF0aXZlIFBhdGggZ2V0cyBjb252ZXJ0ZWQgdXNpbmcgQ3VycmVudCBXb3JraW5nIERpcmVjdG9yeVxuICAgKiBAcGFyYW0gcGF0aCB7U3RyaW5nfVxuICAgKiBAcmV0dXJuIEFycmF5XG4gICAqL1xuICBwYXRoU3RyaW5nVG9BcnJheShwYXRoID0gJycpIHtcbiAgICBpZiAoIXBhdGgubGVuZ3RoKSB0aHJvdyBuZXcgRXJyb3IoJ1BhdGggY2Fubm90IGJlIGVtcHR5JylcblxuICAgIC8vIENoZWNrIGZvciBpbnZhbGlkIHBhdGgsIGVnLiB0d28rIC8vIGluIGEgcm93XG4gICAgaWYgKHBhdGgubWF0Y2goL1xcL3syLH0vZykpIHRocm93IG5ldyBFcnJvcihgLWludmFsaWQgcGF0aDogJHtwYXRofWApXG5cbiAgICAvLyBGb3JtYXQgYW5kIENvbXBvc2VyIGFycmF5XG4gICAgbGV0IHBhdGhBcnJheSA9IHBhdGguc3BsaXQoJy8nKVxuICAgIGlmIChwYXRoQXJyYXlbMF0gPT09ICcnKSBwYXRoQXJyYXlbMF0gPSAnLydcbiAgICBpZiAocGF0aEFycmF5WzBdID09PSAnLicpIHBhdGhBcnJheS5zaGlmdCgpXG4gICAgaWYocGF0aEFycmF5W3BhdGhBcnJheS5sZW5ndGggLSAxXSA9PT0gJycpIHBhdGhBcnJheS5wb3AoKVxuICAgIC8vIGhhbmRsZSByZWxhdGl2ZSBwYXRoIHdpdGggY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeVxuICAgIGlmIChwYXRoQXJyYXlbMF0gIT09ICcvJykge1xuICAgICAgcGF0aEFycmF5ID0gdGhpcy5jd2QuY29uY2F0KHBhdGhBcnJheSlcbiAgICB9XG4gICAgcmV0dXJuIHBhdGhBcnJheVxuICB9XG5cbiAgLyoqXG4gICAqIFBhdGggZnJvbSBhcnJheSB0byBTdHJpbmdcbiAgICogRm9yIHByZXNlbnRhdGlvbmFsIHB1cnBvc2UuXG4gICAqIFRPRE9cbiAgICogQHBhcmFtIHBhdGggW0FycmF5XVxuICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAqL1xuICBwYXRoQXJyYXlUb1N0cmluZyhwYXRoID0gW10pIHtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkocGF0aCkpIHRocm93IG5ldyBFcnJvcignLWZhdGFsIGZpbGVzeXN0ZW06IHBhdGggbXVzdCBiZSBhbiBhcnJheScpXG4gICAgaWYgKCFwYXRoLmxlbmd0aCkgdGhyb3cgbmV3IEVycm9yKCctaW52YWxpZCBmaWxlc3lzdGVtOiBwYXRoIG5vdCBwcm92aWRlZCcpXG4gICAgbGV0IG91dHB1dCA9IHBhdGguam9pbignLycpXG4gICAgLy8gcmVtb3ZlIC8gbXVsdGlwbGUgb2NjdXJyZW5jZVxuICAgIHJldHVybiBvdXRwdXQucmVwbGFjZSgvXFwvezIsfS9nLCAnLycpXG4gIH1cblxuICAvKipcbiAgICogTHVrZS4uIGZpbGVXYWxrZXJcbiAgICogQWNjZXB0cyBvbmx5IEFic29sdXRlIFBhdGgsIHlvdSBtdXN0IGNvbnZlcnQgcGF0aHMgYmVmb3JlIGNhbGxpbmcgdXNpbmcgcGF0aFN0cmluZ1RvQXJyYXlcbiAgICogQHBhcmFtIGNiIGV4ZWN1dGVkIG9uIGVhY2ggZmlsZSBmb3VuZFxuICAgKiBAcGFyYW0gZnMgW1NoZWxsIFZpcnR1YWwgRmlsZXN5c3RlbV1cbiAgICovXG4gIGZpbGVXYWxrZXIocGF0aCA9IFsnLyddLCBmcyA9IHRoaXMuRmlsZVN5c3RlbSl7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KHBhdGgpKSB0aHJvdyBuZXcgRXJyb3IoJ1BhdGggbXVzdCBiZSBhbiBhcnJheSBvZiBub2RlcywgdXNlIEZpbGVzeXN0ZW0ucGF0aFN0cmluZ1RvQXJyYXkoe3N0cmluZ30pJylcblxuICAgIC8vIGF2b2lkIG1vZGlmeWluZyBleHRlcm5hbCBwYXRoIHJlZmVyZW5jZVxuICAgIHBhdGggPSBwYXRoLnNsaWNlKDApXG5cbiAgICAvLyBUT0RPOlxuICAgIC8vICBDaG9vc2U6XG4gICAgLy8gICAgLSBHbyBmdWxsIHB1cmVcbiAgICAvLyAgICAtIFdvcmsgb24gdGhlIHJlZmVyZW5jZSBvZiB0aGUgYWN0dWFsIG5vZGVcbiAgICAvLyBmcyA9IE9iamVjdC5hc3NpZ24oZnMsIHt9KVxuXG4gICAgLy8gRXhpdCBDb25kaXRpb25cbiAgICBpZiAoIXBhdGgubGVuZ3RoKSByZXR1cm4gZnNcblxuICAgIC8vIEdldCBjdXJyZW50IG5vZGVcbiAgICBsZXQgbm9kZSA9IHBhdGguc2hpZnQoKVxuXG4gICAgLy8gR28gZGVlcGVyIGlmIGl0J3Mgbm90IHRoZSByb290IGRpclxuICAgIGlmIChub2RlICE9PSAnLycpIHtcbiAgICAgIC8vIGNoZWNrIGlmIG5vZGUgZXhpc3RcbiAgICAgIGlmIChmc1tub2RlXSkge1xuICAgICAgICAvLyByZXR1cm4gZmlsZSBvciBmb2xkZXJcbiAgICAgICAgZnMgPSBmc1tub2RlXS50eXBlID09PSAnZGlyJyA/IGZzW25vZGVdLmNvbnRlbnQgOiBmc1tub2RlXVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGaWxlIGRvZXNuXFwndCBleGlzdCcpXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmZpbGVXYWxrZXIocGF0aCwgZnMpXG4gIH1cblxuICAvKipcbiAgICogdHJhdmVyc2VGaWxlc1xuICAgKiBhY2Nlc3NpbmcgYWxsIGZpbGUgYXQgbGVhc3Qgb25jZVxuICAgKiBjYWxsaW5nIHByb3ZpZGVkIGNhbGxiYWNrIG9uIGVhY2hcbiAgICogQHBhcmFtIGNiIGV4ZWN1dGVkIG9uIGVhY2ggZmlsZSBmb3VuZFxuICAgKiBAcGFyYW0gZnMgW1NoZWxsIFZpcnR1YWwgRmlsZXN5c3RlbV1cbiAgICovXG4gIHRyYXZlcnNlRmlsZXMoY2IgPSAoKT0+e30sIGZzID0gdGhpcy5GaWxlU3lzdGVtKXtcbiAgICBjb25zdCBzZWxmID0gdGhpcy50cmF2ZXJzZUZpbGVzXG4gICAgZm9yIChsZXQgbm9kZSBpbiBmcykge1xuICAgICAgaWYgKGZzLmhhc093blByb3BlcnR5KG5vZGUpKSB7XG4gICAgICAgIGlmIChmc1tub2RlXS50eXBlID09PSAnZGlyJykgdGhpcy50cmF2ZXJzZUZpbGVzKGNiLCBmc1tub2RlXS5jb250ZW50KVxuICAgICAgICBlbHNlIGNiKGZzW25vZGVdKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiB0cmF2ZXJzZURpcnNcbiAgICogYWNjZXNzaW5nIGFsbCBkaXJlY3RvcnkgYXQgbGVhc3Qgb25jZVxuICAgKiBjYWxsaW5nIHByb3ZpZGVkIGNhbGxiYWNrIG9uIGVhY2hcbiAgICogQHBhcmFtIGNiIGV4ZWN1dGVkIG9uIGVhY2ggZmlsZSBmb3VuZFxuICAgKiBAcGFyYW0gZnMgW1NoZWxsIFZpcnR1YWwgRmlsZXN5c3RlbV1cbiAgICovXG4gIHRyYXZlcnNlRGlycyhjYiA9ICgpPT57fSwgZnMgPSB0aGlzLkZpbGVTeXN0ZW0pe1xuICAgIGZvciAobGV0IG5vZGUgaW4gZnMpIHtcbiAgICAgIGlmIChmcy5oYXNPd25Qcm9wZXJ0eShub2RlKSkge1xuICAgICAgICBpZiAoZnNbbm9kZV0udHlwZSA9PT0gJ2RpcicpIHtcbiAgICAgICAgICBjYihmc1tub2RlXSlcbiAgICAgICAgICB0aGlzLnRyYXZlcnNlRGlycyhjYiwgZnNbbm9kZV0uY29udGVudClcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgRGlyZWN0b3J5IE5vZGVcbiAgICogUGFzc2VkIGFzIFJlZmVyZW5jZSBvciBJbnN0YW5jZSxcbiAgICogZGVwZW5kIGJ5IGEgbGluZSBpbiBAbWV0aG9kIGZpbGVXYWxrZXIsIHNlZSBjb21tZW50IHRoZXJlLlxuICAgKiBAcmV0dXJuIERpcmVjdG9yeSBOb2RlIE9iamVjdFxuICAgKi9cbiAgZ2V0Tm9kZShwYXRoID0gJycsIGZpbGVUeXBlKSB7XG4gICAgaWYgKHR5cGVvZiBwYXRoICE9PSAnc3RyaW5nJykgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGlucHV0LicpXG4gICAgbGV0IHBhdGhBcnJheSwgbm9kZVxuXG4gICAgdHJ5IHtcbiAgICAgIHBhdGhBcnJheSA9IHRoaXMucGF0aFN0cmluZ1RvQXJyYXkocGF0aClcbiAgICAgIG5vZGUgPSB0aGlzLmZpbGVXYWxrZXIocGF0aEFycmF5KVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRocm93IGVcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBFUlJPUiBIQU5ETElOR1xuICAgICAqL1xuXG4gICAgLy8gSGFuZGxlIExpc3Qgb24gYSBmaWxlXG4gICAgaWYgKGZpbGVUeXBlID09PSAnZGlyJyAmJiBub2RlLnR5cGUgPT09ICdmaWxlJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJdHMgYSBmaWxlIG5vdCBhIGRpcmVjdG9yeScpXG4gICAgfVxuICAgIC8vIEhhbmRsZSByZWFkZmlsZSBvbiBhIGRpclxuICAgIGlmIChmaWxlVHlwZSA9PT0gJ2ZpbGUnICYmIG5vZGUudHlwZSA9PT0gJ2RpcicpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSXRzIGEgZGlyZWN0b3J5IG5vdCBhIGZpbGUnKVxuICAgIH1cbiAgICAvLyBoYW5kbGUgcmVhZGZpbGUgb24gbm9uIGV4aXN0aW5nIGZpbGVcbiAgICBpZiAoZmlsZVR5cGUgPT09ICdmaWxlJyAmJiAhbm9kZS50eXBlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgZmlsZSBwYXRoJylcbiAgICB9XG4gICAgLy8gaGFuZGxlIGludmFsaWQgLyBub25leGlzdGluZyBwYXRoXG4gICAgaWYgKCFub2RlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgcGF0aCwgZmlsZS9mb2xkZXIgZG9lc25cXCd0IGV4aXN0JylcbiAgICB9XG5cbiAgICByZXR1cm4geyBwYXRoLCBwYXRoQXJyYXkgLCBub2RlIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDaGFuZ2UgQ3VycmVudCBXb3JraW5nIERpcmVjdG9yeSBHcmFjZWZ1bGx5XG4gICAqIEByZXR1cm4gTWVzc2FnZSBTdHJpbmcuXG4gICAqL1xuICBjaGFuZ2VEaXIocGF0aCA9ICcnKSB7XG4gICAgbGV0IHJlc3VsdFxuICAgIHRyeSB7XG4gICAgICByZXN1bHQgPSB0aGlzLmdldE5vZGUocGF0aCwgJ2RpcicpXG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICB0aHJvdyBlcnJcbiAgICB9XG4gICAgdGhpcy5jd2QgPSByZXN1bHQucGF0aEFycmF5XG4gICAgcmV0dXJuIGBjaGFuZ2VkIGRpcmVjdG9yeS5gXG4gIH1cblxuICAvKipcbiAgICogTGlzdCBDdXJyZW50IFdvcmtpbmcgRGlyZWN0b3J5IEZpbGVzXG4gICAqIEByZXR1cm4ge31cbiAgICovXG4gIGxpc3REaXIocGF0aCA9ICcnKSB7XG4gICAgbGV0IHJlc3VsdFxuICAgIHRyeSB7XG4gICAgICByZXN1bHQgPSB0aGlzLmdldE5vZGUocGF0aCwgJ2RpcicpXG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICB0aHJvdyBlcnJcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdC5ub2RlXG4gIH1cblxuICByZWFkRmlsZShwYXRoID0gJycpIHtcbiAgICBsZXQgcmVzdWx0XG4gICAgdHJ5IHtcbiAgICAgIHJlc3VsdCA9IHRoaXMuZ2V0Tm9kZShwYXRoLCAnZmlsZScpXG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICB0aHJvdyBlcnJcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdC5ub2RlXG4gIH1cblxuICBnZXRDdXJyZW50RGlyZWN0b3J5KCkge1xuICAgIGxldCBjd2RBc1N0cmluZ1xuICAgIHRyeSB7XG4gICAgICBjd2RBc1N0cmluZyA9IHRoaXMucGF0aEFycmF5VG9TdHJpbmcodGhpcy5jd2QpXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuICctaW52YWxpZCBmaWxlc3lzdGVtOiBBbiBlcnJvciBvY2N1cmVkIHdoaWxlIHBhcnNpbmcgY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeSB0byBzdHJpbmcuJ1xuICAgIH1cbiAgICByZXR1cm4gY3dkQXNTdHJpbmdcbiAgfVxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gRmlsZXN5c3RlbVxuIiwiY29uc3QgQ29tbWFuZCA9IHJlcXVpcmUoJy4vQ29tbWFuZCcpXG5cbi8qKlxuICpcbiAqIEludGVycHJldGVyXG4gKiBJcyB0aGUgcGFyZW50IENsYXNzIG9mIHRoZSBNYWluIFNoZWxsIENsYXNzXG4gKiAtIFRoaXMgY2xhc3MgaXMgdGhlIG9uZSB0aGF0IHBhcnNlIGFuZCBydW4gZXhlYyBvZiBjb21tYW5kXG4gKiAtIFBhcnNpbmcgb2YgYnVpbHRpbiBjb21tYW5kIG9uIHJ1bnRpbWUgaGFwcGVuIGhlcmVcbiAqIC0gV2lsbCBwYXJzZSBjdXN0b20gdXNlciBDb21tYW5kIHRvb1xuICpcbiAqL1xuY2xhc3MgSW50ZXJwcmV0ZXIge1xuXG4gIC8qKlxuICAgKiBQYXJzZSBDb21tYW5kXG4gICAqIEByZXR1cm4gQXJyYXkgb2YgYXJncyBhcyBpbiBDXG4gICAqL1xuICBwYXJzZShjbWQpIHtcbiAgICBpZiAodHlwZW9mIGNtZCAhPT0gJ3N0cmluZycpIHRocm93IG5ldyBFcnJvcignQ29tbWFuZCBtdXN0IGJlIGEgc3RyaW5nJylcbiAgICBpZiAoIWNtZC5sZW5ndGgpIHRocm93IG5ldyBFcnJvcignQ29tbWFuZCBpcyBlbXB0eScpXG4gICAgcmV0dXJuIGNtZC5zcGxpdCgnICcpXG4gIH1cblxuICAvKipcbiAgICogRm9ybWF0IE91dHB1dFxuICAgKiByZXR1cm4gZXJyb3IgaWYgZnVuY3Rpb24gaXMgcmV0dXJuZWRcbiAgICogY29udmVydCBldmVyeXRoaW5nIGVsc2UgdG8ganNvbi5cbiAgICogQHJldHVybiBKU09OIHBhcnNlZFxuICAgKi9cbiAgZm9ybWF0KG91dHB1dCkge1xuICAgIGlmICh0eXBlb2Ygb3V0cHV0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gJy1pbnZhbGlkIGNvbW1hbmQ6IENvbW1hbmQgcmV0dXJuZWQgaW52YWxpZCBkYXRhIHR5cGUuJ1xuICAgIH1cbiAgICBpZiAob3V0cHV0ID09PSB1bmRlZmluZWQgfHwgdHlwZW9mIG91dHB1dCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHJldHVybiAnLWludmFsaWQgY29tbWFuZDogQ29tbWFuZCByZXR1cm5lZCBubyBkYXRhLidcbiAgICB9XG4gICAgcmV0dXJuIG91dHB1dFxuICAgIC8vIHRyeSB7XG4gICAgLy8gICByZXR1cm4gSlNPTi5zdHJpbmdpZnkob3V0cHV0KVxuICAgIC8vIH0gY2F0Y2ggKGUpIHtcbiAgICAvLyAgIHJldHVybiAnLWludmFsaWQgY29tbWFuZDogQ29tbWFuZCByZXR1cm5lZCBpbnZhbGlkIGRhdGEgdHlwZTogJyArIGUubWVzc2FnZVxuICAgIC8vIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBFeGVjIENvbW1hbmRcbiAgICogQHJldHVybiBKU09OIFN0cmluZyB3aXRoIG91dHB1dFxuICAgKi9cbiAgZXhlYyhjbWQpIHtcblxuICAgIC8vICBQYXJzZSBDb21tYW5kIFN0cmluZzogWzBdID0gY29tbWFuZCBuYW1lLCBbMStdID0gYXJndW1lbnRzXG4gICAgbGV0IHBhcnNlZFxuICAgIHRyeSB7XG4gICAgICBwYXJzZWQgPSB0aGlzLnBhcnNlKGNtZClcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4gJy1mYXRhbCBjb21tYW5kOiAnICsgZS5tZXNzYWdlIHx8ICdTb21lIEVycm9yIE9jY3VyZWQnXG4gICAgfVxuXG4gICAgLy8gIFgtY2hlY2sgaWYgY29tbWFuZCBleGlzdFxuICAgIGNvbnN0IGNvbW1hbmQgPSB0aGlzLlNoZWxsQ29tbWFuZHNbcGFyc2VkWzBdXVxuICAgIGlmICghY29tbWFuZCkge1xuICAgICAgcmV0dXJuIGAtZXJyb3Igc2hlbGw6IENvbW1hbmQgPCR7cGFyc2VkWzBdfT4gZG9lc24ndCBleGlzdC5cXG5gXG4gICAgfVxuXG4gICAgLy8gIGdldCBhcmd1bWVudHMgYXJyYXkgYW5kIGV4ZWN1dGUgY29tbWFuZCByZXR1cm4gZXJyb3IgaWYgdGhyb3dcbiAgICBjb25zdCBhcmdzID0gcGFyc2VkLmZpbHRlcigoZSwgaSkgPT4gaSA+IDApXG4gICAgbGV0IG91dHB1dFxuICAgIHRyeSB7XG4gICAgICBvdXRwdXQgPSBjb21tYW5kLmV4ZWMoYXJncylcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4gJy1mYXRhbCBjb21tYW5kOiAnICsgZS5tZXNzYWdlXG4gICAgfVxuXG4gICAgLy8gIEZvcm1hdCBkYXRhIGFuZCBSZXR1cm5cbiAgICByZXR1cm4gdGhpcy5mb3JtYXQob3V0cHV0KVxuICB9XG5cbiAgLypcbiAgICogR2VuZXJhdGUgQnVpbHRpbiBDb21tYW5kIExpc3RcbiAgICovXG4gIHJlZ2lzdGVyQ29tbWFuZHMoU2hlbGxSZWZlcmVuY2UsIGN1c3RvbUNvbW1hbmRzID0gdW5kZWZpbmVkKSB7XG4gICAgbGV0IEJsdWVwcmludHMgPSByZXF1aXJlKCcuLi9jb25maWdzL2J1aWx0aW4tY29tbWFuZHMnKVxuICAgIC8qKlxuICAgICAqIElmIGN1c3RvbSBjb21tYW5kcyBhcmUgcGFzc2VkIGNoZWNrIGZvciB2YWxpZCB0eXBlXG4gICAgICogSWYgZ29vZCB0byBnbyBnZW5lcmF0ZSB0aG9zZSBjb21tYW5kc1xuICAgICAqL1xuICAgIGlmIChjdXN0b21Db21tYW5kcykge1xuICAgICAgaWYgKHR5cGVvZiBjdXN0b21Db21tYW5kcyA9PT0gJ29iamVjdCcgJiYgIUFycmF5LmlzQXJyYXkoY3VzdG9tQ29tbWFuZHMpKSB7XG4gICAgICAgIEJsdWVwcmludHMgPSBjdXN0b21Db21tYW5kc1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDdXN0b20gY29tbWFuZCBwcm92aWRlZCBhcmUgbm90IGluIGEgdmFsaWQgZm9ybWF0LicpXG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgU2hlbGxDb21tYW5kcyA9IHt9XG4gICAgT2JqZWN0LmtleXMoQmx1ZXByaW50cykubWFwKChrZXkpID0+IHtcbiAgICAgIGNvbnN0IGNtZCA9IEJsdWVwcmludHNba2V5XVxuICAgICAgaWYgKHR5cGVvZiBjbWQubmFtZSA9PT0gJ3N0cmluZycgJiYgdHlwZW9mIGNtZC5mbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBjbWQuc2hlbGwgPSBTaGVsbFJlZmVyZW5jZVxuICAgICAgICBTaGVsbENvbW1hbmRzW2tleV0gPSBuZXcgQ29tbWFuZChjbWQpXG4gICAgICB9XG4gICAgfSlcbiAgICByZXR1cm4gU2hlbGxDb21tYW5kc1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gSW50ZXJwcmV0ZXJcbiIsImNvbnN0IEludGVycHJldGVyID0gcmVxdWlyZSgnLi9JbnRlcnByZXRlcicpXG5jb25zdCBGaWxlc3lzdGVtID0gcmVxdWlyZSgnLi9GaWxlc3lzdGVtJylcblxuLyoqXG4gKiBTaGVsbCBDbGFzcyBpbmhlcml0cyBmcm9tIEludGVycHJldGVyXG4gKiBPcHRpb25zOlxuICogIC0gZmlsZXN5c3RlbSB7T2JqZWN0fVxuICogIC0gY29tbWFuZHMge09iamVjdH1cbiAqICAtIHVzZXIge1N0cmluZ31cbiAqICAtIGhvc3RuYW1lIHtTdHJpbmd9XG4gKi9cbmNsYXNzIFNoZWxsIGV4dGVuZHMgSW50ZXJwcmV0ZXJ7XG4gIGNvbnN0cnVjdG9yKHsgZmlsZXN5c3RlbSA9IHVuZGVmaW5lZCwgY29tbWFuZHMgPSB1bmRlZmluZWQsIHVzZXIgPSAncm9vdCcsIGhvc3RuYW1lID0gJ215Lmhvc3QubWUnIH0gPSB7fSkge1xuICAgIHN1cGVyKClcbiAgICAvKipcbiAgICAgKiBDcmVhdGUgdGhlIHZpcnR1YWwgZmlsZXN5c3RlbVxuICAgICAqIEByZXR1cm4gcmVmZXJlbmNlIHRvIGluc3RhbmNlIG9mIEBjbGFzcyBGaWxlc3lzdGVtXG4gICAgICovXG4gICAgdGhpcy5mcyA9IG5ldyBGaWxlc3lzdGVtKGZpbGVzeXN0ZW0sIHRoaXMpXG4gICAgdGhpcy51c2VyID0gdXNlclxuICAgIHRoaXMuaG9zdG5hbWUgPSBob3N0bmFtZVxuXG4gICAgLy8gSW5pdCBidWlsdGluIGNvbW1hbmRzLCBAbWV0aG9kIGluIHBhcmVudFxuICAgIC8vIHBhc3Mgc2hlbGwgcmVmZXJlbmNlXG4gICAgdGhpcy5TaGVsbENvbW1hbmRzID0gdGhpcy5yZWdpc3RlckNvbW1hbmRzKHRoaXMpXG4gICAgdGhpcy5TaGVsbENvbW1hbmRzID0ge1xuICAgICAgLi4udGhpcy5TaGVsbENvbW1hbmRzLFxuICAgICAgLi4udGhpcy5yZWdpc3RlckNvbW1hbmRzKHRoaXMsIGNvbW1hbmRzKSxcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUGFzcyBjb250cm9sIHRvIEludGVycHJldGVyXG4gICAqIEByZXR1cm4gb3V0cHV0IGFzIFtTdHJpbmddXG4gICAqL1xuICBydW4oY21kKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlYyhjbWQpXG4gIH1cbn1cblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFNoZWxsLnByb3RvdHlwZSwgJ2ZzJywgeyB3cml0YWJsZTogdHJ1ZSwgZW51bWVyYWJsZTogZmFsc2UgfSlcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShTaGVsbC5wcm90b3R5cGUsICdTaGVsbENvbW1hbmRzJywgeyB3cml0YWJsZTogdHJ1ZSwgZW51bWVyYWJsZTogZmFsc2UgfSlcblxubW9kdWxlLmV4cG9ydHMgPSBTaGVsbFxuIiwidmFyIFNoZWxsID0gcmVxdWlyZSgnLi9TaGVsbCcpXG5cbi8qKlxuICogVGVybWluYWxcbiAqIFdyYXBwZXIgb24gdGhlIFNoZWxsIGNsYXNzXG4gKiBUaGlzIHdpbGwgb25seSBoYW5kbGUgdGhlIFVJIG9mIHRoZSB0ZXJtaW5hbC5cbiAqIFlvdSBjYW4gdXNlIGl0IG9yIHVzZSBkaXJlY3RseSB0aGUgYnJvd3Nlci1zaGVsbC5qc1xuICogYW5kIGNyZWF0ZSB5b3VyIGN1c3RvbSBVSSBjYWxsaW5nIGFuZCBkaXNwbGF5aW5nIHRoZSBAbWV0aG9kIHJ1bigpIGNvbW1hbmRzXG4gKiBfX19fX19fX19fX1xuICogT3B0aW9uczpcbiAqICAtIGZpbGVzeXN0ZW0ge09iamVjdH1cbiAqICAtIGNvbW1hbmRzIHtPYmplY3R9XG4gKiAgLSB1c2VyIHtTdHJpbmd9XG4gKiAgLSBob3N0bmFtZSB7U3RyaW5nfVxuICovXG5jbGFzcyBUZXJtaW5hbCBleHRlbmRzIFNoZWxse1xuICBjb25zdHJ1Y3RvcihzZWxlY3RvciA9IHVuZGVmaW5lZCwgb3B0aW9ucyA9IHt9KSB7XG4gICAgc3VwZXIob3B0aW9ucykgLy8gbXVzdCBwYXNzIG9wdGlvbiBoZXJlXG5cbiAgICBpZiAoIXNlbGVjdG9yKSB0aHJvdyBuZXcgRXJyb3IoJ05vIHdyYXBwZXIgZWxlbWVudCBzZWxlY3RvciBwcm92aWRlZCcpXG4gICAgdHJ5IHtcbiAgICAgIHRoaXMuY29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3RvcilcbiAgICAgIGlmICghdGhpcy5jb250YWluZXIpIHRocm93IG5ldyBFcnJvcignbmV3IFRlcm1pbmFsKCk6IERPTSBlbGVtZW50IG5vdCBmb3VuZCcpXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCduZXcgVGVybWluYWwoKTogTm90IHZhbGlkIERPTSBzZWxlY3Rvci4nKVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmluaXQoKVxuICB9XG5cbiAgaW5pdCgpIHtcbiAgICB0aGlzLmdlbmVyYXRlUm93KClcbiAgICB0aGlzLmNvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKSA9PiB7XG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICBsZXQgaW5wdXQgPSB0aGlzLmNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcuY3VycmVudCAudGVybWluYWwtaW5wdXQnKVxuICAgICAgaWYgKGlucHV0KSBpbnB1dC5mb2N1cygpXG4gICAgfSlcbiAgfVxuXG4gIGdlbmVyYXRlUm93KCkge1xuICAgIHZhciB0aGF0ID0gdGhpc1xuXG4gICAgLy8gUmVtb3ZlIHByZXZpb3VzIGN1cnJlbnQgYWN0aXZlIHJvd1xuICAgIGxldCBjdXJyZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmN1cnJlbnQudGVybWluYWwtcm93JylcbiAgICBpZiAoY3VycmVudCkge1xuICAgICAgY3VycmVudC5jbGFzc0xpc3QucmVtb3ZlKCdjdXJyZW50JylcbiAgICB9XG5cbiAgICBsZXQgcHJldklucHV0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnRlcm1pbmFsLWlucHV0JylcbiAgICBpZiAocHJldklucHV0KSB7XG4gICAgICBwcmV2SW5wdXQucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5dXAnLCB0aGlzLnN1Ym1pdEhhbmRsZXIpXG4gICAgfVxuXG4gICAgY29uc3QgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICBkaXYuY2xhc3NMaXN0LmFkZCgnY3VycmVudCcsICd0ZXJtaW5hbC1yb3cnKVxuICAgIGRpdi5pbm5lckhUTUwgPSAnJ1xuICAgIGRpdi5pbm5lckhUTUwgKz0gYDxzcGFuIGNsYXNzPVwidGVybWluYWwtaW5mb1wiPiR7dGhpcy51c2VyfUAke3RoaXMuaG9zdG5hbWV9IC0gJHt0aGlzLmZzLmdldEN1cnJlbnREaXJlY3RvcnkoKX0g4p6cIDwvc3Bhbj5gXG4gICAgZGl2LmlubmVySFRNTCArPSBgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgY2xhc3M9XCJ0ZXJtaW5hbC1pbnB1dFwiIHNpemU9XCIyXCIgc3R5bGU9XCJjdXJzb3I6bm9uZTtcIj5gXG5cbiAgICAvLyBhZGQgbmV3IHJvdyBhbmQgZm9jdXMgaXRcbiAgICB0aGlzLmNvbnRhaW5lci5hcHBlbmRDaGlsZChkaXYpXG4gICAgbGV0IGlucHV0ID0gdGhpcy5jb250YWluZXIucXVlcnlTZWxlY3RvcignLmN1cnJlbnQgLnRlcm1pbmFsLWlucHV0JylcbiAgICBpbnB1dC5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIGUgPT4gdGhpcy5zdWJtaXRIYW5kbGVyKGUpKVxuICAgIGlucHV0LmZvY3VzKClcblxuICAgIHJldHVybiBpbnB1dFxuICB9XG5cbiAgZ2VuZXJhdGVPdXRwdXQob3V0ID0gJycpIHtcbiAgICBjb25zdCBwcmUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwcmUnKVxuICAgIHByZS50ZXh0Q29udGVudCA9IG91dFxuICAgIHRoaXMuY29udGFpbmVyLmFwcGVuZENoaWxkKHByZSlcbiAgICByZXR1cm4gdGhpcy5nZW5lcmF0ZVJvdygpXG4gIH1cblxuICBzdWJtaXRIYW5kbGVyKGUpIHtcbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG4gICAgLy8gUlVOIHdoZW4gRU5URVIgaXMgcHJlc3NlZFxuICAgIGUudGFyZ2V0LnNpemUgPSBlLnRhcmdldC52YWx1ZS5sZW5ndGggKyAyIHx8IDNcbiAgICBpZiAoZXZlbnQud2hpY2ggPT0gMTMgfHwgZXZlbnQua2V5Q29kZSA9PSAxMykge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICBjb25zdCBjb21tYW5kID0gZS50YXJnZXQudmFsdWUudHJpbSgpXG4gICAgICAvLyBFWEVDXG4gICAgICBjb25zdCBvdXRwdXQgPSB0aGlzLnJ1bihjb21tYW5kKVxuICAgICAgcmV0dXJuIHRoaXMuZ2VuZXJhdGVPdXRwdXQob3V0cHV0KVxuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRlcm1pbmFsXG4iLCJjb25zdCB7IG5hbWUsIHZlcnNpb24sIGRlc2NyaXB0aW9uLCByZXBvc2l0b3J5LCBhdXRob3IsIGxpY2Vuc2UgfSA9IHJlcXVpcmUoJy4uLy4uL3BhY2thZ2UuanNvbicpXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICAvKipcbiAgICogSGVscFxuICAgKiBAcmV0dXJuIExpc3Qgb2YgY29tbWFuZHNcbiAgICovXG4gIGhlbHA6IHtcbiAgICBuYW1lOiAnaGVscCcsXG4gICAgdHlwZTogJ2J1aWx0aW4nLFxuICAgIG1hbjogJ0xpc3Qgb2YgYXZhaWxhYmxlIGNvbW1hbmRzJyxcbiAgICBmbjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gYENvbW1hbmRzIGF2YWlsYWJsZTogJHtPYmplY3Qua2V5cyh0aGlzLnNoZWxsLlNoZWxsQ29tbWFuZHMpLmpvaW4oJywgJyl9YFxuICAgIH1cbiAgfSxcblxuICB3aG9hbWk6IHtcbiAgICBuYW1lOiAnd2hvYW1pJyxcbiAgICB0eXBlOiAnYnVpbHRpbicsXG4gICAgbWFuOiAnQ3VycmVudCB1c2VyJyxcbiAgICBmbjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5zaGVsbC51c2VyXG4gICAgfSxcbiAgfSxcblxuICBhYm91dDoge1xuICAgIG5hbWU6ICdhYm91dCcsXG4gICAgdHlwZTogJ2J1aWx0aW4nLFxuICAgIG1hbjogJ0Fib3V0IHRoaXMgcHJvamVjdCcsXG4gICAgZm46IGZ1bmN0aW9uKCkge1xuICAgICAgbGV0IHN0ciA9ICcnXG4gICAgICBzdHIgKz0gYG5hbWU6ICR7bmFtZX1cXG5gXG4gICAgICBzdHIgKz0gYHZlcnNpb246ICR7dmVyc2lvbn1cXG5gXG4gICAgICBzdHIgKz0gYGRlc2NyaXB0aW9uOiAke2Rlc2NyaXB0aW9ufVxcbmBcbiAgICAgIHN0ciArPSBgcmVwb3NpdG9yeTogJHtyZXBvc2l0b3J5fVxcbmBcbiAgICAgIHN0ciArPSBgYXV0aG9yOiAke2F1dGhvcn1cXG5gXG4gICAgICBzdHIgKz0gYGxpY2Vuc2U6ICR7bGljZW5zZX1cXG5gXG4gICAgICByZXR1cm4gc3RyXG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBSZXR1cm4gcGFzc2VkIGFyZ3VtZW50cywgZm9yIHRlc3RpbmcgcHVycG9zZXNcbiAgICovXG4gIGFyZ3VtZW50czoge1xuICAgIG5hbWU6ICdhcmd1bWVudHMnLFxuICAgIHR5cGU6ICdidWlsdGluJyxcbiAgICBtYW46ICdSZXR1cm4gYXJndW1lbnQgcGFzc2VkLCB1c2VkIGZvciB0ZXN0aW5nIHB1cnBvc2UnLFxuICAgIGZuOiBhcmdzID0+IGFyZ3NcbiAgfSxcblxuICAvKipcbiAgICogQ2hhbmdlIERpcmVjdG9yeVxuICAgKiBAcmV0dXJuIFN1Y2Nlc3MvRmFpbCBNZXNzYWdlIFN0cmluZ1xuICAgKi9cbiAgY2Q6IHtcbiAgICBuYW1lOiAnY2QnLFxuICAgIHR5cGU6ICdidWlsdGluJyxcbiAgICBtYW46ICdDaGFuZ2UgZGlyZWN0b3J5LCBwYXNzIGFic29sdXRlIG9yIHJlbGF0aXZlIHBhdGg6IGVnLiBjZCAvZXRjLCBjZCAvIGNkL215L25lc3RlZC9kaXInLFxuICAgIGZuOiBmdW5jdGlvbihwYXRoKSB7XG4gICAgICBpZiAoIXBhdGgpIHRocm93IG5ldyBFcnJvcignLWludmFsaWQgTm8gcGF0aCBwcm92aWRlZC4nKVxuICAgICAgcGF0aCA9IHBhdGguam9pbigpXG4gICAgICB0cnl7XG4gICAgICAgIHJldHVybiB0aGlzLnNoZWxsLmZzLmNoYW5nZURpcihwYXRoKVxuICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgIHRocm93IGVcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIGxzIENvbW1hbmRcbiAgICogTGlzdCBkaXJlY3RvcnkgZmlsZXNcbiAgICogQHBhcmFtIGFycmF5IG9mIGFyZ3NcbiAgICogQHJldHVybiBmb3JtYXR0ZWQgU3RyaW5nXG4gICAqL1xuICBsczoge1xuICAgIG5hbWU6ICdscycsXG4gICAgdHlwZTogJ2J1aWx0aW4nLFxuICAgIG1hbjogJ2xpc3QgZGlyZWN0b3J5IGZpbGVzLCBwYXNzIGFic29sdXRlL3JlbGF0aXZlIHBhdGgsIGlmIGVtcHR5IGxpc3QgY3VycmVudCBkaXJlY3RvcnknLFxuICAgIGZuOiBmdW5jdGlvbihwYXRoID0gWycuLyddICkge1xuICAgICAgcGF0aCA9IHBhdGguam9pbigpXG4gICAgICBsZXQgbGlzdCwgcmVzcG9uc2VTdHJpbmcgPSAnJ1xuICAgICAgdHJ5e1xuICAgICAgICBsaXN0ID0gdGhpcy5zaGVsbC5mcy5saXN0RGlyKHBhdGgpXG4gICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgdGhyb3cgZVxuICAgICAgfVxuICAgICAgZm9yIChsZXQgZmlsZSBpbiBsaXN0KSB7XG4gICAgICAgIGlmIChsaXN0Lmhhc093blByb3BlcnR5KGZpbGUpKSB7XG4gICAgICAgICAgcmVzcG9uc2VTdHJpbmcgKz0gYCR7bGlzdFtmaWxlXS5wZXJtaXNzaW9ufVxcdCR7bGlzdFtmaWxlXS51c2VyfSAke2xpc3RbZmlsZV0uZ3JvdXB9XFx0JHtsaXN0W2ZpbGVdLm5hbWV9XFxuYFxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzcG9uc2VTdHJpbmdcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIENBVCBDb21tYW5kXG4gICAqIFJlYWQgRmlsZVxuICAgKiBAcmV0dXJuIGZvcm1hdHRlZCBTdHJpbmdcbiAgICovXG4gIGNhdDoge1xuICAgIG5hbWU6ICdjYXQnLFxuICAgIHR5cGU6ICdidWlsdGluJyxcbiAgICBtYW46ICdSZXR1cm4gZmlsZSBjb250ZW50LCB0YWtlIG9uZSBhcmd1bWVudDogZmlsZSBwYXRoIChyZWxhdGl2ZS9hYnNvbHV0ZSknLFxuICAgIGZuOiBmdW5jdGlvbihwYXRoID0gWycuLyddKSB7XG4gICAgICBwYXRoID0gcGF0aC5qb2luKClcbiAgICAgIGxldCBmaWxlLCByZXNwb25zZVN0cmluZyA9ICcnXG4gICAgICB0cnl7XG4gICAgICAgIGZpbGUgPSB0aGlzLnNoZWxsLmZzLnJlYWRGaWxlKHBhdGgpXG4gICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgdGhyb3cgZVxuICAgICAgfVxuICAgICAgcmV0dXJuIGZpbGUuY29udGVudFxuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogTWFuXG4gICAqIFJldHVybiBjb21tYW5kIG1hbnVhbCBpbmZvXG4gICAqIEByZXR1cm4ge3N0cmluZ31cbiAgICovXG4gIG1hbjoge1xuICAgIG5hbWU6ICdtYW4nLFxuICAgIHR5cGU6ICdidWlsdGluJyxcbiAgICBtYW46ICdDb21tYW5kIG1hbnVhbCwgdGFrZXMgb25lIGFyZ3VtZW50LCBjb21tYW5kIG5hbWUnLFxuICAgIGZuOiBmdW5jdGlvbihhcmdzKSB7XG4gICAgICBpZiAoIWFyZ3MgfHwgIWFyZ3NbMF0pIHRocm93IG5ldyBFcnJvcignbWFuOiBubyBjb21tYW5kIHByb3ZpZGVkLicpXG4gICAgICBsZXQgY29tbWFuZCA9IGFyZ3NbMF1cbiAgICAgIGlmICghdGhpcy5zaGVsbC5TaGVsbENvbW1hbmRzW2NvbW1hbmRdKSB0aHJvdyBuZXcgRXJyb3IoJ2NvbW1hbmQgZG9lc25cXCd0IGV4aXN0LicpXG4gICAgICBpZiAoIXRoaXMuc2hlbGwuU2hlbGxDb21tYW5kc1tjb21tYW5kXS5tYW4pIHRocm93IG5ldyBFcnJvcignbm8gbWFudWFsIGVudHJ5IGZvciB0aGlzIGNvbW1hbmQuJylcbiAgICAgIHJldHVybiB0aGlzLnNoZWxsLlNoZWxsQ29tbWFuZHNbY29tbWFuZF0ubWFuXG4gICAgfSxcbiAgfSxcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuXG4gICdmaWxlLmgnOiAnI2luY2x1ZGUgPG5vcGUuaD4nLFxuXG4gIGV0Yzoge1xuICAgIGFwYWNoZTI6IHtcbiAgICAgICdhcGFjaGUyLmNvbmYnOiAnTm90IFdoYXQgeW91IHdlcmUgbG9va2luZyBmb3IgOiknLFxuICAgIH0sXG4gIH0sXG5cbiAgaG9tZToge1xuICAgIGd1ZXN0OiB7XG4gICAgICBkb2NzOiB7XG4gICAgICAgICdteWRvYy5tZCc6ICdUZXN0RmlsZScsXG4gICAgICAgICdteWRvYzIubWQnOiAnVGVzdEZpbGUyJyxcbiAgICAgICAgJ215ZG9jMy5tZCc6ICdUZXN0RmlsZTMnLFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuXG4gIHJvb3Q6e1xuICAgICcuenNocmMnOiAnbm90IGV2ZW4gY2xvc2UgOiknLFxuICAgICcub2gtbXktenNoJzoge1xuICAgICAgdGhlbWVzOiB7fSxcbiAgICB9LFxuICB9LFxufVxuIiwiLyoqXG4gKiBTaGVsbCBPbmx5XG4gKiBAdHlwZSB7Q2xhc3N9XG4gKiBJbml0IHRoZSBzaGVsbCB3aXRoIGNvbW1hbmQgYW5kIGZpbGVzeXN0ZW1cbiAqIEBtZXRob2QgZXhlY3V0ZSgpIGV4cG9zZWQgdG8gcXVlcnkgdGhlIFNoZWxsIHdpdGggY29tbWFuZHNcbiAqL1xuZ2xvYmFsWydUZXJtaW5hbCddID0gcmVxdWlyZSgnLi9jbGFzc2VzL1Rlcm1pbmFsJylcbiIsIm1vZHVsZS5leHBvcnRzPXtcbiAgXCJuYW1lXCI6IFwidGVybWx5LmpzXCIsXG4gIFwidmVyc2lvblwiOiBcIjIuMC4wXCIsXG4gIFwiZGVzY3JpcHRpb25cIjogXCJTaW1wbGUsIEV4dGVuc2libGUsIExpZ2h0d2VpZ2h0IEphdmFzY3JpcHQgQnJvd3NlciBUZXJtaW5hbCBTaW11bGF0b3IhXCIsXG4gIFwibWFpblwiOiBcImRpc3QvdGVybWx5Lm1pbi5qc1wiLFxuICBcInNjcmlwdHNcIjoge1xuICAgIFwidGVzdFwiOiBcIm1vY2hhIC0tY29tcGlsZXJzIGJhYmVsLWNvcmUvcmVnaXN0ZXIgdGVzdHMvXCIsXG4gICAgXCJidWlsZFwiOiBcImd1bHBcIlxuICB9LFxuICBcImtleXdvcmRzXCI6IFtcbiAgICBcInRlcm1pbmFsXCIsXG4gICAgXCJqYXZhc2NyaXB0XCIsXG4gICAgXCJzaW11bGF0b3JcIixcbiAgICBcImJyb3dzZXJcIixcbiAgICBcInByZXNlbnRhdGlvblwiLFxuICAgIFwibW9ja3VwXCIsXG4gICAgXCJkZW1vXCIsXG4gICAgXCJjbGlcIixcbiAgICBcInByb21wdFwiLFxuICAgIFwiY29tbWFuZHNcIixcbiAgICBcIm5vIGRlcGVuY3lcIixcbiAgICBcImxpZ2h0d2VpZ2h0XCIsXG4gICAgXCJqc1wiLFxuICAgIFwidmFuaWxsYVwiXG4gIF0sXG4gIFwicmVwb3NpdG9yeVwiOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9LaXJraGFtbWV0ei90ZXJtbHkuanNcIixcbiAgXCJhdXRob3JcIjogXCJTaW1vbmUgQ29yc2lcIixcbiAgXCJsaWNlbnNlXCI6IFwiSVNDXCIsXG4gIFwiZGV2RGVwZW5kZW5jaWVzXCI6IHtcbiAgICBcImJhYmVsaWZ5XCI6IFwiXjcuMy4wXCIsXG4gICAgXCJicm93c2VyaWZ5XCI6IFwiXjEzLjMuMFwiLFxuICAgIFwiY2hhbGtcIjogXCJeMS4xLjNcIixcbiAgICBcImd1bHBcIjogXCJeMy45LjFcIixcbiAgICBcImd1bHAtcmVuYW1lXCI6IFwiXjEuMi4yXCIsXG4gICAgXCJndWxwLXNvdXJjZW1hcHNcIjogXCJeMi40LjBcIixcbiAgICBcImd1bHAtdWdsaWZ5XCI6IFwiXjIuMC4wXCIsXG4gICAgXCJndWxwLXV0aWxcIjogXCJeMy4wLjhcIixcbiAgICBcInVnbGlmeS1qc1wiOiBcIl4yLjYuNFwiLFxuICAgIFwidXRpbHMtbWVyZ2VcIjogXCJeMS4wLjBcIixcbiAgICBcInZpbnlsLWJ1ZmZlclwiOiBcIl4xLjAuMFwiLFxuICAgIFwidmlueWwtc291cmNlLXN0cmVhbVwiOiBcIl4xLjEuMFwiLFxuICAgIFwid2F0Y2hpZnlcIjogXCJeMy44LjBcIixcbiAgICBcImJhYmVsXCI6IFwiXjYuNS4yXCIsXG4gICAgXCJiYWJlbC1jb3JlXCI6IFwiXjYuMjEuMFwiLFxuICAgIFwiYmFiZWwtcG9seWZpbGxcIjogXCJeNi4yMi4wXCIsXG4gICAgXCJiYWJlbC1wcmVzZXQtZXMyMDE1XCI6IFwiXjYuMTguMFwiLFxuICAgIFwiYmFiZWwtcHJlc2V0LXN0YWdlLTNcIjogXCJeNi4xNy4wXCIsXG4gICAgXCJiYWJlbGlmeVwiOiBcIl43LjMuMFwiLFxuICAgIFwiY2hhaVwiOiBcIl4zLjUuMFwiLFxuICAgIFwibW9jaGFcIjogXCJeMy4yLjBcIlxuICB9XG59XG4iXX0=
