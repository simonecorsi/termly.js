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
          fs = fs[node].content;
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
        return '-fatal command: Command execution produced an error ' + e.message;
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
 * and create your custom UI calling and displaying the Shell.run() commands
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
      console.log(_this.container);
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
      div.innerHTML += '<span class="terminal-info">guest@terminal.simonecorsi.me \u279C </span>';
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
      pre.innerHTML = out;
      this.container.appendChild(pre);
      return this.generateRow();
    }
  }, {
    key: 'submitHandler',
    value: function submitHandler(e) {
      e.stopPropagation();
      // RUN when ENTER is pressed
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

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

module.exports = _defineProperty({

  /**
   * Help
   * @return List of commands
   */
  help: {
    name: 'help',
    type: 'builtin',
    fn: function fn() {
      return 'Commands avaibles: ' + Object.keys(this.shell.ShellCommands).join(', ');
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
      for (var file in list) {
        if (list.hasOwnProperty(file)) {
          responseString += list[file].permission + '\t' + list[file].user + ' ' + list[file].group + '\t' + list[file].name + '\n';
        }
      }
      return responseString;
    }
  }

}, 'ls', {
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
    for (var file in list) {
      if (list.hasOwnProperty(file)) {
        responseString += list[file].permission + '\t' + list[file].user + ' ' + list[file].group + '\t' + list[file].name + '\n';
      }
    }
    return responseString;
  }
});

},{}],9:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJiaW4vYnJvd3Nlci10ZXJtaW5hbC5qcyIsImJpbi9jbGFzc2VzL0NvbW1hbmQuanMiLCJiaW4vY2xhc3Nlcy9GaWxlLmpzIiwiYmluL2NsYXNzZXMvRmlsZXN5c3RlbS5qcyIsImJpbi9jbGFzc2VzL0ludGVycHJldGVyLmpzIiwiYmluL2NsYXNzZXMvU2hlbGwuanMiLCJiaW4vY2xhc3Nlcy9UZXJtaW5hbC5qcyIsImJpbi9jb25maWdzL2J1aWx0aW4tY29tbWFuZHMuanMiLCJiaW4vY29uZmlncy9kZWZhdWx0LWZpbGVzeXN0ZW0uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7QUNBQTs7Ozs7O0FBTUEsT0FBTyxVQUFQLElBQXFCLFFBQVEsb0JBQVIsQ0FBckI7Ozs7Ozs7Ozs7O0FDTkE7Ozs7OztJQU1NLE87QUFDSixxQkFBK0Q7QUFBQSxtRkFBSCxFQUFHO0FBQUEsUUFBakQsSUFBaUQsUUFBakQsSUFBaUQ7QUFBQSxRQUEzQyxFQUEyQyxRQUEzQyxFQUEyQztBQUFBLHlCQUF2QyxJQUF1QztBQUFBLFFBQXZDLElBQXVDLDZCQUFoQyxLQUFnQztBQUFBLDBCQUF6QixLQUF5QjtBQUFBLFFBQXpCLEtBQXlCLDhCQUFqQixTQUFpQjs7QUFBQTs7QUFDN0QsUUFBSSxPQUFPLElBQVAsS0FBZ0IsUUFBcEIsRUFBOEIsTUFBTSxNQUFNLCtCQUFOLENBQU47QUFDOUIsUUFBSSxPQUFPLEVBQVAsS0FBYyxVQUFsQixFQUE4QixNQUFNLE1BQU0sd0NBQU4sQ0FBTjs7QUFFOUI7Ozs7QUFJQSxTQUFLLEVBQUwsR0FBVSxHQUFHLElBQUgsQ0FBUSxJQUFSLENBQVY7QUFDQSxTQUFLLElBQUwsR0FBWSxJQUFaO0FBQ0EsU0FBSyxJQUFMLEdBQVksSUFBWjs7QUFFQSxRQUFJLEtBQUosRUFBVztBQUNULFdBQUssS0FBTCxHQUFhLEtBQWI7QUFDRDtBQUNGOztBQUVEOzs7Ozs7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dUYsS0FBSyxJQUFMLEVBQVcsSUFBbEc7QUFDRDtBQUNGO0FBQ0QsV0FBTyxjQUFQO0FBQ0Q7QUFqQkMsQ0FoRk47Ozs7O0FDQUEsT0FBTyxPQUFQLEdBQWlCOztBQUVmLFlBQVUsbUJBRks7O0FBSWYsT0FBSztBQUNILGFBQVM7QUFDUCxzQkFBZ0I7QUFEVDtBQUROLEdBSlU7O0FBVWYsUUFBTTtBQUNKLFdBQU87QUFDTCxZQUFNO0FBQ0osb0JBQVksVUFEUjtBQUVKLHFCQUFhLFdBRlQ7QUFHSixxQkFBYTtBQUhUO0FBREQ7QUFESCxHQVZTOztBQW9CZixRQUFLO0FBQ0gsY0FBVSxtQkFEUDtBQUVILGtCQUFjO0FBQ1osY0FBUTtBQURJO0FBRlg7QUFwQlUsQ0FBakIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXG4gKiBTaGVsbCBPbmx5XG4gKiBAdHlwZSB7Q2xhc3N9XG4gKiBJbml0IHRoZSBzaGVsbCB3aXRoIGNvbW1hbmQgYW5kIGZpbGVzeXN0ZW1cbiAqIEBtZXRob2QgZXhlY3V0ZSgpIGV4cG9zZWQgdG8gcXVlcnkgdGhlIFNoZWxsIHdpdGggY29tbWFuZHNcbiAqL1xuZ2xvYmFsWydUZXJtaW5hbCddID0gcmVxdWlyZSgnLi9jbGFzc2VzL1Rlcm1pbmFsJylcbiIsIi8qKlxuICogQ29tbWFuZCBDbGFzc1xuICogQHBhcmFtIG5hbWUgW1N0cmluZ10sIGZuIFtGdW5jdGlvbl1cbiAqXG4gKiBkb24ndCBwYXNzIGFycm93IGZ1bmN0aW9uIGlmIHlvdSB3YW50IHRvIHVzZSB0aGlzIGluc2lkZSB5b3VyIGNvbW1hbmQgZnVuY3Rpb24gdG8gYWNjZXNzIHZhcmlvdXMgc2hhcmVkIHNoZWxsIG9iamVjdFxuICovXG5jbGFzcyBDb21tYW5kIHtcbiAgY29uc3RydWN0b3IoeyBuYW1lLCBmbiwgdHlwZSA9ICd1c3InLCBzaGVsbCA9IHVuZGVmaW5lZCB9ID0ge30pe1xuICAgIGlmICh0eXBlb2YgbmFtZSAhPT0gJ3N0cmluZycpIHRocm93IEVycm9yKCdDb21tYW5kIG5hbWUgbXVzdCBiZSBhIHN0cmluZycpXG4gICAgaWYgKHR5cGVvZiBmbiAhPT0gJ2Z1bmN0aW9uJykgdGhyb3cgRXJyb3IoJ0NvbW1hbmQgZnVuY3Rpb24gbXVzdCBiZS4uLiBhIGZ1bmN0aW9uJylcblxuICAgIC8qKlxuICAgICAqIHVzZSB3aG9sZSBmdW5jdGlvbiBpbnN0ZWFkIG9mIGFycm93IGlmIHlvdSB3YW50IHRvIGFjY2Vzc1xuICAgICAqIGNpcmN1bGFyIHJlZmVyZW5jZSBvZiBDb21tYW5kXG4gICAgICovXG4gICAgdGhpcy5mbiA9IGZuLmJpbmQodGhpcylcbiAgICB0aGlzLm5hbWUgPSBuYW1lXG4gICAgdGhpcy50eXBlID0gdHlwZVxuXG4gICAgaWYgKHNoZWxsKSB7XG4gICAgICB0aGlzLnNoZWxsID0gc2hlbGxcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRGlzcGF0Y2ggQ29tbWFuZCBFeGVjdXRpb25cbiAgICpcbiAgICogQHRpcCBkb24ndCB1c2UgYXJyb3cgZnVuY3Rpb24gaW4geW91IGNvbW1hbmQgaWYgeW91IHdhbnQgdGhlIGFyZ3VtZW50c1xuICAgKiBuZWl0aGVyIHN1cGVyIGFuZCBhcmd1bWVudHMgZ2V0IGJpbmRlZCBpbiBBRi5cbiAgICovXG4gIGV4ZWMoYXJncyA9IFtdKSB7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGFyZ3MpKSB0aHJvdyBFcnJvcignQ29tbWFuZCBleGVjIGFyZ3MgbXVzdCBiZSBpbiBhbiBhcnJheScpXG4gICAgaWYgKGFyZ3MubGVuZ3RoKSByZXR1cm4gdGhpcy5mbihhcmdzKVxuICAgIHJldHVybiB0aGlzLmZuKClcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENvbW1hbmRcbiIsIi8qKlxuICogQGNsYXNzIFNpbmdsZSBGaWxlIENsYXNzXG4gKiBTaW11bGF0ZSBmaWxlIHByb3BlcnRpZXNcbiAqL1xuY2xhc3MgRmlsZSB7XG4gIGNvbnN0cnVjdG9yKHsgbmFtZSA9ICcnLCB0eXBlID0gJ2ZpbGUnLCBjb250ZW50ID0gJyd9ID0ge30pIHtcbiAgICB0aGlzLnVpZCA9IHRoaXMuZ2VuVWlkKClcbiAgICB0aGlzLm5hbWUgPSBuYW1lXG4gICAgdGhpcy50eXBlID0gdHlwZVxuICAgIHRoaXMuY29udGVudCA9IGNvbnRlbnRcbiAgICB0aGlzLnVzZXIgPSAncm9vdCdcbiAgICB0aGlzLmdyb3VwID0gJ3Jvb3QnXG5cbiAgICBpZiAodGhpcy50eXBlID09PSAnZmlsZScpIHtcbiAgICAgIHRoaXMucGVybWlzc2lvbiA9ICdyd3hyLS1yLS0nXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucGVybWlzc2lvbiA9ICdkcnd4ci14ci14J1xuICAgIH1cblxuICB9XG5cbiAgZ2VuVWlkKCkge1xuICAgIGZ1bmN0aW9uIHM0KCkge1xuICAgICAgcmV0dXJuIE1hdGguZmxvb3IoKDEgKyBNYXRoLnJhbmRvbSgpKSAqIDB4MTAwMDApXG4gICAgICAgIC50b1N0cmluZygxNilcbiAgICAgICAgLnN1YnN0cmluZygxKTtcbiAgICB9XG4gICAgcmV0dXJuIHM0KCkgKyBzNCgpICsgJy0nICsgczQoKSArICctJyArIHM0KCkgKyAnLScgK1xuICAgICAgczQoKSArICctJyArIHM0KCkgKyBzNCgpICsgczQoKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGVcbiIsImNvbnN0IERFRkFVTFRfRlMgPSByZXF1aXJlKCcuLi9jb25maWdzL2RlZmF1bHQtZmlsZXN5c3RlbScpXG5jb25zdCBGaWxlID0gcmVxdWlyZSgnLi9GaWxlJylcblxuLyoqXG4gKiBAY2xhc3MgVmlydHVhbCBGaWxlc3lzdGVtXG4gKiBSZXByZXNlbnRlZCBhcyBhbiBvYmplY3Qgb2Ygbm9kZXNcbiAqL1xuY2xhc3MgRmlsZXN5c3RlbSB7XG4gIGNvbnN0cnVjdG9yKGZzID0gREVGQVVMVF9GUywgc2hlbGwgPSB7fSkge1xuICAgIHRoaXMuc2hlbGwgPSBzaGVsbFxuICAgIGlmICh0eXBlb2YgZnMgIT09ICdvYmplY3QnIHx8IEFycmF5LmlzQXJyYXkoZnMpKSB0aHJvdyBuZXcgRXJyb3IoJ1ZpcnR1YWwgRmlsZXN5c3RlbSBwcm92aWRlZCBub3QgdmFsaWQsIGluaXRpYWxpemF0aW9uIGZhaWxlZC4nKVxuXG4gICAgLy8gTm90IEJ5IFJlZmVyZW5jZS5cbiAgICAvLyBIQUNLOiBPYmplY3QgYXNzaWduIHJlZnVzZSB0byB3b3JrIGFzIGludGVuZGVkLlxuICAgIGZzID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShmcykpXG4gICAgdGhpcy5GaWxlU3lzdGVtID0gdGhpcy5pbml0RnMoZnMpXG5cbiAgICAvLyBDV0QgZm9yIGNvbW1hbmRzIHVzYWdlXG4gICAgdGhpcy5jd2QgPSBbJy8nXVxuICB9XG5cbiAgLyoqXG4gICAqIEluaXQgJiBQYXNzIENvbnRyb2wgdG8gcmVjdXJyc2l2ZSBmdW5jdGlvblxuICAgKiBAcmV0dXJuIG5ldyBGaWxlc3lzdGVtIGFzIG5vZGVzIG9mIG11bHRpcGxlIEBjbGFzcyBGaWxlXG4gICAqL1xuICBpbml0RnMoZnMpIHtcbiAgICB0aGlzLmJ1aWxkVmlydHVhbEZzKGZzKVxuICAgIHJldHVybiBmc1xuICB9XG5cbiAgLyoqXG4gICAqIFRyYXZlcnNlIGFsbCBub2RlIGFuZCBidWlsZCBhIHZpcnR1YWwgcmVwcmVzZW50YXRpb24gb2YgYSBmaWxlc3lzdGVtXG4gICAqIEVhY2ggbm9kZSBpcyBhIEZpbGUgaW5zdGFuY2UuXG4gICAqIEBwYXJhbSBNb2NrZWQgRmlsZXN5c3RlbSBhcyBPYmplY3RcbiAgICpcbiAgICovXG4gIGJ1aWxkVmlydHVhbEZzKG9iaikge1xuICAgIGZvciAobGV0IGtleSBpbiBvYmopIHtcbiAgICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICBpZiAodHlwZW9mIG9ialtrZXldID09PSAnb2JqZWN0JyAmJiAhQXJyYXkuaXNBcnJheShvYmpba2V5XSkpIHtcbiAgICAgICAgICBvYmpba2V5XSA9IG5ldyBGaWxlKHsgbmFtZToga2V5LCBjb250ZW50OiBvYmpba2V5XSwgdHlwZTogJ2RpcicgfSlcbiAgICAgICAgICB0aGlzLmJ1aWxkVmlydHVhbEZzKG9ialtrZXldLmNvbnRlbnQpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgb2JqW2tleV0gPSBuZXcgRmlsZSh7IG5hbWU6IGtleSwgY29udGVudDogb2JqW2tleV0gfSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYSBzdHJpbmdlZCBwYXRoIGFuZCByZXR1cm4gYXMgYXJyYXlcbiAgICogdGhyb3cgZXJyb3IgaWYgcGF0aCBmb3JtYXQgaXMgaW52YWxpZFxuICAgKiBSZWxhdGl2ZSBQYXRoIGdldHMgY29udmVydGVkIHVzaW5nIEN1cnJlbnQgV29ya2luZyBEaXJlY3RvcnlcbiAgICogQHBhcmFtIHBhdGgge1N0cmluZ31cbiAgICogQHJldHVybiBBcnJheVxuICAgKi9cbiAgcGF0aFN0cmluZ1RvQXJyYXkocGF0aCA9ICcnKSB7XG4gICAgaWYgKCFwYXRoLmxlbmd0aCkgdGhyb3cgbmV3IEVycm9yKCdQYXRoIGNhbm5vdCBiZSBlbXB0eScpXG5cbiAgICAvLyBDaGVjayBmb3IgaW52YWxpZCBwYXRoLCBlZy4gdHdvKyAvLyBpbiBhIHJvd1xuICAgIGlmIChwYXRoLm1hdGNoKC9cXC97Mix9L2cpKSB0aHJvdyBuZXcgRXJyb3IoYC1pbnZhbGlkIHBhdGg6ICR7cGF0aH1gKVxuXG4gICAgLy8gRm9ybWF0IGFuZCBDb21wb3NlciBhcnJheVxuICAgIGxldCBwYXRoQXJyYXkgPSBwYXRoLnNwbGl0KCcvJylcbiAgICBpZiAocGF0aEFycmF5WzBdID09PSAnJykgcGF0aEFycmF5WzBdID0gJy8nXG4gICAgaWYgKHBhdGhBcnJheVswXSA9PT0gJy4nKSBwYXRoQXJyYXkuc2hpZnQoKVxuICAgIGlmKHBhdGhBcnJheVtwYXRoQXJyYXkubGVuZ3RoIC0gMV0gPT09ICcnKSBwYXRoQXJyYXkucG9wKClcblxuICAgIC8vIGhhbmRsZSByZWxhdGl2ZSBwYXRoIHdpdGggY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeVxuICAgIGlmIChwYXRoQXJyYXlbMF0gIT09ICcvJykge1xuICAgICAgcGF0aEFycmF5ID0gdGhpcy5jd2QuY29uY2F0KHBhdGhBcnJheSlcbiAgICB9XG4gICAgcmV0dXJuIHBhdGhBcnJheVxuICB9XG5cbiAgLyoqXG4gICAqIFBhdGggZnJvbSBhcnJheSB0byBTdHJpbmdcbiAgICogRm9yIHByZXNlbnRhdGlvbmFsIHB1cnBvc2UuXG4gICAqIFRPRE9cbiAgICogQHBhcmFtIHBhdGggW0FycmF5XVxuICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAqL1xuICBwYXRoQXJyYXlUb1N0cmluZyhwYXRoID0gW10pIHtcblxuICB9XG5cbiAgLyoqXG4gICAqIEx1a2UuLiBmaWxlV2Fsa2VyXG4gICAqIEFjY2VwdHMgb25seSBBYnNvbHV0ZSBQYXRoLCB5b3UgbXVzdCBjb252ZXJ0IHBhdGhzIGJlZm9yZSBjYWxsaW5nIHVzaW5nIHBhdGhTdHJpbmdUb0FycmF5XG4gICAqIEBwYXJhbSBjYiBleGVjdXRlZCBvbiBlYWNoIGZpbGUgZm91bmRcbiAgICogQHBhcmFtIGZzIFtTaGVsbCBWaXJ0dWFsIEZpbGVzeXN0ZW1dXG4gICAqL1xuICBmaWxlV2Fsa2VyKHBhdGggPSBbJy8nXSwgZnMgPSB0aGlzLkZpbGVTeXN0ZW0pe1xuICAgIGlmICghQXJyYXkuaXNBcnJheShwYXRoKSkgdGhyb3cgbmV3IEVycm9yKCdQYXRoIG11c3QgYmUgYW4gYXJyYXkgb2Ygbm9kZXMsIHVzZSBGaWxlc3lzdGVtLnBhdGhTdHJpbmdUb0FycmF5KHtzdHJpbmd9KScpXG5cbiAgICAvLyBhdm9pZCBtb2RpZnlpbmcgZXh0ZXJuYWwgcGF0aCByZWZlcmVuY2VcbiAgICBwYXRoID0gcGF0aC5zbGljZSgwKVxuXG4gICAgLy8gVE9ETzpcbiAgICAvLyAgQ2hvb3NlOlxuICAgIC8vICAgIC0gR28gZnVsbCBwdXJlXG4gICAgLy8gICAgLSBXb3JrIG9uIHRoZSByZWZlcmVuY2Ugb2YgdGhlIGFjdHVhbCBub2RlXG4gICAgLy8gZnMgPSBPYmplY3QuYXNzaWduKGZzLCB7fSlcblxuICAgIC8vIEV4aXQgQ29uZGl0aW9uXG4gICAgaWYgKCFwYXRoLmxlbmd0aCkgcmV0dXJuIGZzXG5cbiAgICAvLyBHZXQgY3VycmVudCBub2RlXG4gICAgbGV0IG5vZGUgPSBwYXRoLnNoaWZ0KClcblxuICAgIC8vIEdvIGRlZXBlciBpZiBpdCdzIG5vdCB0aGUgcm9vdCBkaXJcbiAgICBpZiAobm9kZSAhPT0gJy8nKSB7XG4gICAgICAvLyBjaGVjayBpZiBub2RlIGV4aXN0XG4gICAgICBpZiAoZnNbbm9kZV0pIHtcbiAgICAgICAgZnMgPSBmc1tub2RlXS5jb250ZW50XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZpbGUgZG9lc25cXCd0IGV4aXN0JylcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZmlsZVdhbGtlcihwYXRoLCBmcylcbiAgfVxuXG4gIC8qKlxuICAgKiB0cmF2ZXJzZUZpbGVzXG4gICAqIGFjY2Vzc2luZyBhbGwgZmlsZSBhdCBsZWFzdCBvbmNlXG4gICAqIGNhbGxpbmcgcHJvdmlkZWQgY2FsbGJhY2sgb24gZWFjaFxuICAgKiBAcGFyYW0gY2IgZXhlY3V0ZWQgb24gZWFjaCBmaWxlIGZvdW5kXG4gICAqIEBwYXJhbSBmcyBbU2hlbGwgVmlydHVhbCBGaWxlc3lzdGVtXVxuICAgKi9cbiAgdHJhdmVyc2VGaWxlcyhjYiA9ICgpPT57fSwgZnMgPSB0aGlzLkZpbGVTeXN0ZW0pe1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzLnRyYXZlcnNlRmlsZXNcbiAgICBmb3IgKGxldCBub2RlIGluIGZzKSB7XG4gICAgICBpZiAoZnMuaGFzT3duUHJvcGVydHkobm9kZSkpIHtcbiAgICAgICAgaWYgKGZzW25vZGVdLnR5cGUgPT09ICdkaXInKSB0aGlzLnRyYXZlcnNlRmlsZXMoY2IsIGZzW25vZGVdLmNvbnRlbnQpXG4gICAgICAgIGVsc2UgY2IoZnNbbm9kZV0pXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIHRyYXZlcnNlRGlyc1xuICAgKiBhY2Nlc3NpbmcgYWxsIGRpcmVjdG9yeSBhdCBsZWFzdCBvbmNlXG4gICAqIGNhbGxpbmcgcHJvdmlkZWQgY2FsbGJhY2sgb24gZWFjaFxuICAgKiBAcGFyYW0gY2IgZXhlY3V0ZWQgb24gZWFjaCBmaWxlIGZvdW5kXG4gICAqIEBwYXJhbSBmcyBbU2hlbGwgVmlydHVhbCBGaWxlc3lzdGVtXVxuICAgKi9cbiAgdHJhdmVyc2VEaXJzKGNiID0gKCk9Pnt9LCBmcyA9IHRoaXMuRmlsZVN5c3RlbSl7XG4gICAgZm9yIChsZXQgbm9kZSBpbiBmcykge1xuICAgICAgaWYgKGZzLmhhc093blByb3BlcnR5KG5vZGUpKSB7XG4gICAgICAgIGlmIChmc1tub2RlXS50eXBlID09PSAnZGlyJykge1xuICAgICAgICAgIGNiKGZzW25vZGVdKVxuICAgICAgICAgIHRoaXMudHJhdmVyc2VEaXJzKGNiLCBmc1tub2RlXS5jb250ZW50KVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCBEaXJlY3RvcnkgTm9kZVxuICAgKiBQYXNzZWQgYXMgUmVmZXJlbmNlIG9yIEluc3RhbmNlLFxuICAgKiBkZXBlbmQgYnkgYSBsaW5lIGluIEBtZXRob2QgZmlsZVdhbGtlciwgc2VlIGNvbW1lbnQgdGhlcmUuXG4gICAqIEByZXR1cm4gRGlyZWN0b3J5IE5vZGUgT2JqZWN0XG4gICAqL1xuICBnZXROb2RlKHBhdGggPSAnJywgZmlsZVR5cGUpIHtcbiAgICBpZiAodHlwZW9mIHBhdGggIT09ICdzdHJpbmcnKSB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgaW5wdXQuJylcbiAgICBsZXQgcGF0aEFycmF5LCBub2RlXG4gICAgdHJ5IHtcbiAgICAgIHBhdGhBcnJheSA9IHRoaXMucGF0aFN0cmluZ1RvQXJyYXkocGF0aClcbiAgICAgIG5vZGUgPSB0aGlzLmZpbGVXYWxrZXIocGF0aEFycmF5KVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRocm93IGVcbiAgICB9XG4gICAgaWYgKGZpbGVUeXBlID09PSAnZGlyJyAmJiBub2RlLnR5cGUgPT09ICdmaWxlJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJdHMgYSBmaWxlIG5vdCBhIGRpcmVjdG9yeScpXG4gICAgfVxuICAgIGlmIChmaWxlVHlwZSA9PT0gJ2ZpbGUnICYmIG5vZGUudHlwZSA9PT0gJ2RpcicpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSXRzIGEgZGlyZWN0b3J5IG5vdCBhIGZpbGUnKVxuICAgIH1cbiAgICBpZiAoIW5vZGUgfHwgbm9kZS5jb250ZW50KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgUGF0aCwgZG9lbnQgZXhpc3QnKVxuICAgIH1cbiAgICByZXR1cm4geyBwYXRoLCBwYXRoQXJyYXkgLCBub2RlIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDaGFuZ2UgQ3VycmVudCBXb3JraW5nIERpcmVjdG9yeSBHcmFjZWZ1bGx5XG4gICAqIEByZXR1cm4gTWVzc2FnZSBTdHJpbmcuXG4gICAqL1xuICBjaGFuZ2VEaXIocGF0aCA9ICcnKSB7XG4gICAgbGV0IHJlc3VsdFxuICAgIHRyeSB7XG4gICAgICByZXN1bHQgPSB0aGlzLmdldE5vZGUocGF0aCwgJ2RpcicpXG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICB0aHJvdyBlcnJcbiAgICB9XG4gICAgdGhpcy5jd2QgPSByZXN1bHQucGF0aEFycmF5XG4gICAgcmV0dXJuIGBjaGFuZ2VkIGRpcmVjdG9yeS5gXG4gIH1cblxuICAvKipcbiAgICogTGlzdCBDdXJyZW50IFdvcmtpbmcgRGlyZWN0b3J5IEZpbGVzXG4gICAqIEByZXR1cm4ge31cbiAgICovXG4gIGxpc3REaXIocGF0aCA9ICcnKSB7XG4gICAgbGV0IHJlc3VsdFxuICAgIHRyeSB7XG4gICAgICByZXN1bHQgPSB0aGlzLmdldE5vZGUocGF0aCwgJ2RpcicpXG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICB0aHJvdyBlcnJcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdC5ub2RlXG4gIH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGVzeXN0ZW1cbiIsImNvbnN0IENvbW1hbmQgPSByZXF1aXJlKCcuL0NvbW1hbmQnKVxuXG4vKipcbiAqXG4gKiBJbnRlcnByZXRlclxuICogSXMgdGhlIHBhcmVudCBDbGFzcyBvZiB0aGUgTWFpbiBTaGVsbCBDbGFzc1xuICogLSBUaGlzIGNsYXNzIGlzIHRoZSBvbmUgdGhhdCBwYXJzZSBhbmQgcnVuIGV4ZWMgb2YgY29tbWFuZFxuICogLSBQYXJzaW5nIG9mIGJ1aWx0aW4gY29tbWFuZCBvbiBydW50aW1lIGhhcHBlbiBoZXJlXG4gKiAtIFdpbGwgcGFyc2UgY3VzdG9tIHVzZXIgQ29tbWFuZCB0b29cbiAqXG4gKi9cbmNsYXNzIEludGVycHJldGVyIHtcblxuICAvKipcbiAgICogUGFyc2UgQ29tbWFuZFxuICAgKiBAcmV0dXJuIEFycmF5IG9mIGFyZ3MgYXMgaW4gQ1xuICAgKi9cbiAgcGFyc2UoY21kKSB7XG4gICAgaWYgKHR5cGVvZiBjbWQgIT09ICdzdHJpbmcnKSB0aHJvdyBuZXcgRXJyb3IoJ0NvbW1hbmQgbXVzdCBiZSBhIHN0cmluZycpXG4gICAgaWYgKCFjbWQubGVuZ3RoKSB0aHJvdyBuZXcgRXJyb3IoJ0NvbW1hbmQgaXMgZW1wdHknKVxuICAgIHJldHVybiBjbWQuc3BsaXQoJyAnKVxuICB9XG5cbiAgLyoqXG4gICAqIEZvcm1hdCBPdXRwdXRcbiAgICogcmV0dXJuIGVycm9yIGlmIGZ1bmN0aW9uIGlzIHJldHVybmVkXG4gICAqIGNvbnZlcnQgZXZlcnl0aGluZyBlbHNlIHRvIGpzb24uXG4gICAqIEByZXR1cm4gSlNPTiBwYXJzZWRcbiAgICovXG4gIGZvcm1hdChvdXRwdXQpIHtcbiAgICBpZiAodHlwZW9mIG91dHB1dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuICctaW52YWxpZCBjb21tYW5kOiBDb21tYW5kIHJldHVybmVkIGludmFsaWQgZGF0YSB0eXBlLidcbiAgICB9XG4gICAgaWYgKG91dHB1dCA9PT0gdW5kZWZpbmVkIHx8IHR5cGVvZiBvdXRwdXQgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICByZXR1cm4gJy1pbnZhbGlkIGNvbW1hbmQ6IENvbW1hbmQgcmV0dXJuZWQgbm8gZGF0YS4nXG4gICAgfVxuICAgIHJldHVybiBvdXRwdXRcbiAgICAvLyB0cnkge1xuICAgIC8vICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KG91dHB1dClcbiAgICAvLyB9IGNhdGNoIChlKSB7XG4gICAgLy8gICByZXR1cm4gJy1pbnZhbGlkIGNvbW1hbmQ6IENvbW1hbmQgcmV0dXJuZWQgaW52YWxpZCBkYXRhIHR5cGU6ICcgKyBlLm1lc3NhZ2VcbiAgICAvLyB9XG4gIH1cblxuICAvKipcbiAgICogRXhlYyBDb21tYW5kXG4gICAqIEByZXR1cm4gSlNPTiBTdHJpbmcgd2l0aCBvdXRwdXRcbiAgICovXG4gIGV4ZWMoY21kKSB7XG5cbiAgICAvLyAgUGFyc2UgQ29tbWFuZCBTdHJpbmc6IFswXSA9IGNvbW1hbmQgbmFtZSwgWzErXSA9IGFyZ3VtZW50c1xuICAgIGxldCBwYXJzZWRcbiAgICB0cnkge1xuICAgICAgcGFyc2VkID0gdGhpcy5wYXJzZShjbWQpXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuICctZmF0YWwgY29tbWFuZDogJyArIGUubWVzc2FnZSB8fCAnU29tZSBFcnJvciBPY2N1cmVkJ1xuICAgIH1cblxuICAgIC8vICBYLWNoZWNrIGlmIGNvbW1hbmQgZXhpc3RcbiAgICBjb25zdCBjb21tYW5kID0gdGhpcy5TaGVsbENvbW1hbmRzW3BhcnNlZFswXV1cbiAgICBpZiAoIWNvbW1hbmQpIHtcbiAgICAgIHJldHVybiBgLWVycm9yIHNoZWxsOiBDb21tYW5kICR7cGFyc2VkWzBdfSBkb2Vzbid0IGV4aXN0LlxcbmBcbiAgICB9XG5cbiAgICAvLyAgZ2V0IGFyZ3VtZW50cyBhcnJheSBhbmQgZXhlY3V0ZSBjb21tYW5kIHJldHVybiBlcnJvciBpZiB0aHJvd1xuICAgIGNvbnN0IGFyZ3MgPSBwYXJzZWQuZmlsdGVyKChlLCBpKSA9PiBpID4gMClcbiAgICBsZXQgb3V0cHV0XG4gICAgdHJ5IHtcbiAgICAgIG91dHB1dCA9IGNvbW1hbmQuZXhlYyhhcmdzKVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiAnLWZhdGFsIGNvbW1hbmQ6IENvbW1hbmQgZXhlY3V0aW9uIHByb2R1Y2VkIGFuIGVycm9yICcgKyBlLm1lc3NhZ2VcbiAgICB9XG5cbiAgICAvLyAgRm9ybWF0IGRhdGEgYW5kIFJldHVyblxuICAgIHJldHVybiB0aGlzLmZvcm1hdChvdXRwdXQpXG4gIH1cblxuICAvKlxuICAgKiBHZW5lcmF0ZSBCdWlsdGluIENvbW1hbmQgTGlzdFxuICAgKi9cbiAgcmVnaXN0ZXJDb21tYW5kcyhTaGVsbFJlZmVyZW5jZSwgY3VzdG9tQ29tbWFuZHMgPSB1bmRlZmluZWQpIHtcbiAgICBsZXQgQmx1ZXByaW50cyA9IHJlcXVpcmUoJy4uL2NvbmZpZ3MvYnVpbHRpbi1jb21tYW5kcycpXG4gICAgLyoqXG4gICAgICogSWYgY3VzdG9tIGNvbW1hbmRzIGFyZSBwYXNzZWQgY2hlY2sgZm9yIHZhbGlkIHR5cGVcbiAgICAgKiBJZiBnb29kIHRvIGdvIGdlbmVyYXRlIHRob3NlIGNvbW1hbmRzXG4gICAgICovXG4gICAgaWYgKGN1c3RvbUNvbW1hbmRzKSB7XG4gICAgICBpZiAodHlwZW9mIGN1c3RvbUNvbW1hbmRzID09PSAnb2JqZWN0JyAmJiAhQXJyYXkuaXNBcnJheShjdXN0b21Db21tYW5kcykpIHtcbiAgICAgICAgQmx1ZXByaW50cyA9IGN1c3RvbUNvbW1hbmRzXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0N1c3RvbSBjb21tYW5kIHByb3ZpZGVkIGFyZSBub3QgaW4gYSB2YWxpZCBmb3JtYXQuJylcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBTaGVsbENvbW1hbmRzID0ge31cbiAgICBPYmplY3Qua2V5cyhCbHVlcHJpbnRzKS5tYXAoKGtleSkgPT4ge1xuICAgICAgY29uc3QgY21kID0gQmx1ZXByaW50c1trZXldXG4gICAgICBpZiAodHlwZW9mIGNtZC5uYW1lID09PSAnc3RyaW5nJyAmJiB0eXBlb2YgY21kLmZuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGNtZC5zaGVsbCA9IFNoZWxsUmVmZXJlbmNlXG4gICAgICAgIFNoZWxsQ29tbWFuZHNba2V5XSA9IG5ldyBDb21tYW5kKGNtZClcbiAgICAgIH1cbiAgICB9KVxuICAgIHJldHVybiBTaGVsbENvbW1hbmRzXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBJbnRlcnByZXRlclxuIiwiY29uc3QgSW50ZXJwcmV0ZXIgPSByZXF1aXJlKCcuL0ludGVycHJldGVyJylcbmNvbnN0IEZpbGVzeXN0ZW0gPSByZXF1aXJlKCcuL0ZpbGVzeXN0ZW0nKVxuXG4vKipcbiAqIFNoZWxsIENsYXNzIGluaGVyaXRzIGZyb20gSW50ZXJwcmV0ZXJcbiAqXG4gKi9cbmNsYXNzIFNoZWxsIGV4dGVuZHMgSW50ZXJwcmV0ZXJ7XG4gIGNvbnN0cnVjdG9yKHsgZmlsZXN5c3RlbSA9IHVuZGVmaW5lZCwgY29tbWFuZHMgPSB1bmRlZmluZWQsIHVzZXIgPSAncm9vdCcsIGhvc3RuYW1lID0gJ215Lmhvc3QubWUnIH0gPSB7fSkge1xuICAgIHN1cGVyKClcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSB0aGUgdmlydHVhbCBmaWxlc3lzdGVtXG4gICAgICogQHJldHVybiByZWZlcmVuY2UgdG8gaW5zdGFuY2Ugb2YgQGNsYXNzIEZpbGVzeXN0ZW1cbiAgICAgKi9cbiAgICB0aGlzLmZzID0gbmV3IEZpbGVzeXN0ZW0oZmlsZXN5c3RlbSwgdGhpcylcbiAgICB0aGlzLnVzZXIgPSB1c2VyXG4gICAgdGhpcy5ob3N0bmFtZSA9IGhvc3RuYW1lXG5cbiAgICAvLyBJbml0IGJ1aWx0aW4gY29tbWFuZHMsIEBtZXRob2QgaW4gcGFyZW50XG4gICAgLy8gcGFzcyBzaGVsbCByZWZlcmVuY2VcbiAgICB0aGlzLlNoZWxsQ29tbWFuZHMgPSB0aGlzLnJlZ2lzdGVyQ29tbWFuZHModGhpcylcbiAgICB0aGlzLlNoZWxsQ29tbWFuZHMgPSB7XG4gICAgICAuLi50aGlzLlNoZWxsQ29tbWFuZHMsXG4gICAgICAuLi50aGlzLnJlZ2lzdGVyQ29tbWFuZHModGhpcywgY29tbWFuZHMpLFxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBQYXNzIGNvbnRyb2wgdG8gSW50ZXJwcmV0ZXJcbiAgICogQHJldHVybiBvdXRwdXQgYXMgW1N0cmluZ11cbiAgICovXG4gIHJ1bihjbWQpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjKGNtZClcbiAgfVxufVxuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoU2hlbGwucHJvdG90eXBlLCAnZnMnLCB7IHdyaXRhYmxlOiB0cnVlLCBlbnVtZXJhYmxlOiBmYWxzZSB9KVxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFNoZWxsLnByb3RvdHlwZSwgJ1NoZWxsQ29tbWFuZHMnLCB7IHdyaXRhYmxlOiB0cnVlLCBlbnVtZXJhYmxlOiBmYWxzZSB9KVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNoZWxsXG4iLCJ2YXIgU2hlbGwgPSByZXF1aXJlKCcuL1NoZWxsJylcblxuLyoqXG4gKiBUZXJtaW5hbFxuICogV3JhcHBlciBvbiB0aGUgU2hlbGwgY2xhc3NcbiAqIFRoaXMgd2lsbCBvbmx5IGhhbmRsZSB0aGUgVUkgb2YgdGhlIHRlcm1pbmFsLlxuICogWW91IGNhbiB1c2UgaXQgb3IgdXNlIGRpcmVjdGx5IHRoZSBicm93c2VyLXNoZWxsLmpzXG4gKiBhbmQgY3JlYXRlIHlvdXIgY3VzdG9tIFVJIGNhbGxpbmcgYW5kIGRpc3BsYXlpbmcgdGhlIFNoZWxsLnJ1bigpIGNvbW1hbmRzXG4gKi9cbmNsYXNzIFRlcm1pbmFsIGV4dGVuZHMgU2hlbGx7XG4gIGNvbnN0cnVjdG9yKHNlbGVjdG9yID0gdW5kZWZpbmVkLCBvcHRpb25zID0ge30pIHtcblxuICAgIHN1cGVyKG9wdGlvbnMpIC8vIG11c3QgcGFzcyBvcHRpb24gaGVyZVxuXG4gICAgaWYgKCFzZWxlY3RvcikgdGhyb3cgbmV3IEVycm9yKCdObyB3cmFwcGVyIGVsZW1lbnQgc2VsZWN0b3IgcHJvdmlkZWQnKVxuICAgIHRyeSB7XG4gICAgICB0aGlzLmNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpXG4gICAgICBjb25zb2xlLmxvZyh0aGlzLmNvbnRhaW5lcilcbiAgICAgIGlmICghdGhpcy5jb250YWluZXIpIHRocm93IG5ldyBFcnJvcignbmV3IFRlcm1pbmFsKCk6IERPTSBlbGVtZW50IG5vdCBmb3VuZCcpXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCduZXcgVGVybWluYWwoKTogTm90IHZhbGlkIERPTSBzZWxlY3Rvci4nKVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmluaXQoKVxuICB9XG5cbiAgaW5pdCgpIHtcbiAgICB0aGlzLmdlbmVyYXRlUm93KClcbiAgICB0aGlzLmNvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKSA9PiB7XG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICBsZXQgaW5wdXQgPSB0aGlzLmNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcuY3VycmVudCAudGVybWluYWwtaW5wdXQnKVxuICAgICAgaWYgKGlucHV0KSBpbnB1dC5mb2N1cygpXG4gICAgfSlcbiAgfVxuXG4gIGdlbmVyYXRlUm93KCkge1xuICAgIHZhciB0aGF0ID0gdGhpc1xuXG4gICAgLy8gUmVtb3ZlIHByZXZpb3VzIGN1cnJlbnQgYWN0aXZlIHJvd1xuICAgIGxldCBjdXJyZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmN1cnJlbnQudGVybWluYWwtcm93JylcbiAgICBpZiAoY3VycmVudCkge1xuICAgICAgY3VycmVudC5jbGFzc0xpc3QucmVtb3ZlKCdjdXJyZW50JylcbiAgICB9XG5cbiAgICBsZXQgcHJldklucHV0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnRlcm1pbmFsLWlucHV0JylcbiAgICBpZiAocHJldklucHV0KSB7XG4gICAgICBwcmV2SW5wdXQucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5dXAnLCB0aGlzLnN1Ym1pdEhhbmRsZXIpXG4gICAgfVxuXG4gICAgY29uc3QgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICBkaXYuY2xhc3NMaXN0LmFkZCgnY3VycmVudCcsICd0ZXJtaW5hbC1yb3cnKVxuICAgIGRpdi5pbm5lckhUTUwgPSAnJ1xuICAgIGRpdi5pbm5lckhUTUwgKz0gYDxzcGFuIGNsYXNzPVwidGVybWluYWwtaW5mb1wiPmd1ZXN0QHRlcm1pbmFsLnNpbW9uZWNvcnNpLm1lIOKenCA8L3NwYW4+YFxuICAgIGRpdi5pbm5lckhUTUwgKz0gYDxpbnB1dCB0eXBlPVwidGV4dFwiIGNsYXNzPVwidGVybWluYWwtaW5wdXRcIiBzaXplPVwiMlwiIHN0eWxlPVwiY3Vyc29yOm5vbmU7XCI+YFxuXG4gICAgLy8gYWRkIG5ldyByb3cgYW5kIGZvY3VzIGl0XG4gICAgdGhpcy5jb250YWluZXIuYXBwZW5kQ2hpbGQoZGl2KVxuICAgIGxldCBpbnB1dCA9IHRoaXMuY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy5jdXJyZW50IC50ZXJtaW5hbC1pbnB1dCcpXG4gICAgaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBlID0+IHRoaXMuc3VibWl0SGFuZGxlcihlKSlcbiAgICBpbnB1dC5mb2N1cygpXG5cbiAgICByZXR1cm4gaW5wdXRcbiAgfVxuXG4gIGdlbmVyYXRlT3V0cHV0KG91dCA9ICcnKSB7XG4gICAgY29uc3QgcHJlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncHJlJylcbiAgICBwcmUuaW5uZXJIVE1MID0gb3V0XG4gICAgdGhpcy5jb250YWluZXIuYXBwZW5kQ2hpbGQocHJlKVxuICAgIHJldHVybiB0aGlzLmdlbmVyYXRlUm93KClcbiAgfVxuXG4gIHN1Ym1pdEhhbmRsZXIoZSkge1xuICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAvLyBSVU4gd2hlbiBFTlRFUiBpcyBwcmVzc2VkXG4gICAgaWYgKGV2ZW50LndoaWNoID09IDEzIHx8IGV2ZW50LmtleUNvZGUgPT0gMTMpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgY29uc3QgY29tbWFuZCA9IGUudGFyZ2V0LnZhbHVlLnRyaW0oKVxuICAgICAgLy8gRVhFQ1xuICAgICAgY29uc3Qgb3V0cHV0ID0gdGhpcy5ydW4oY29tbWFuZClcbiAgICAgIHJldHVybiB0aGlzLmdlbmVyYXRlT3V0cHV0KG91dHB1dClcbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBUZXJtaW5hbFxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgLyoqXG4gICAqIEhlbHBcbiAgICogQHJldHVybiBMaXN0IG9mIGNvbW1hbmRzXG4gICAqL1xuICBoZWxwOiB7XG4gICAgbmFtZTogJ2hlbHAnLFxuICAgIHR5cGU6ICdidWlsdGluJyxcbiAgICBmbjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gYENvbW1hbmRzIGF2YWlibGVzOiAke09iamVjdC5rZXlzKHRoaXMuc2hlbGwuU2hlbGxDb21tYW5kcykuam9pbignLCAnKX1gXG4gICAgfVxuICB9LFxuXG4gIHdob2FtaToge1xuICAgIG5hbWU6ICd3aG9hbWknLFxuICAgIHR5cGU6ICdidWlsdGluJyxcbiAgICBmbjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5zaGVsbC51c2VyXG4gICAgfSxcbiAgfSxcblxuICAvKipcbiAgICogUmV0dXJuIHBhc3NlZCBhcmd1bWVudHMsIGZvciB0ZXN0aW5nIHB1cnBvc2VzXG4gICAqL1xuICBhcmd1bWVudHM6IHtcbiAgICBuYW1lOiAnYXJndW1lbnRzJyxcbiAgICB0eXBlOiAnYnVpbHRpbicsXG4gICAgZm46IGFyZ3MgPT4gYXJnc1xuICB9LFxuXG4gIC8qKlxuICAgKiBDaGFuZ2UgRGlyZWN0b3J5XG4gICAqIEByZXR1cm4gU3VjY2Vzcy9GYWlsIE1lc3NhZ2UgU3RyaW5nXG4gICAqL1xuICBjZDoge1xuICAgIG5hbWU6ICdjZCcsXG4gICAgdHlwZTogJ2J1aWx0aW4nLFxuICAgIGZuOiBmdW5jdGlvbihwYXRoKSB7XG4gICAgICBpZiAoIXBhdGgpIHRocm93IG5ldyBFcnJvcignLWludmFsaWQgTm8gcGF0aCBwcm92aWRlZC4nKVxuICAgICAgcGF0aCA9IHBhdGguam9pbigpXG4gICAgICB0cnl7XG4gICAgICAgIHJldHVybiB0aGlzLnNoZWxsLmZzLmNoYW5nZURpcihwYXRoKVxuICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgIHRocm93IGVcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIGxzIENvbW1hbmRcbiAgICogTGlzdCBkaXJlY3RvcnkgZmlsZXNcbiAgICogQHBhcmFtIGFycmF5IG9mIGFyZ3NcbiAgICogQHJldHVybiBmb3JtYXR0ZWQgU3RyaW5nXG4gICAqL1xuICBsczoge1xuICAgIG5hbWU6ICdscycsXG4gICAgdHlwZTogJ2J1aWx0aW4nLFxuICAgIGZuOiBmdW5jdGlvbihwYXRoID0gWycuLyddICkge1xuICAgICAgcGF0aCA9IHBhdGguam9pbigpXG4gICAgICBsZXQgbGlzdCwgcmVzcG9uc2VTdHJpbmcgPSAnJ1xuICAgICAgdHJ5e1xuICAgICAgICBsaXN0ID0gdGhpcy5zaGVsbC5mcy5saXN0RGlyKHBhdGgpXG4gICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgdGhyb3cgZVxuICAgICAgfVxuICAgICAgZm9yIChsZXQgZmlsZSBpbiBsaXN0KSB7XG4gICAgICAgIGlmIChsaXN0Lmhhc093blByb3BlcnR5KGZpbGUpKSB7XG4gICAgICAgICAgcmVzcG9uc2VTdHJpbmcgKz0gYCR7bGlzdFtmaWxlXS5wZXJtaXNzaW9ufVxcdCR7bGlzdFtmaWxlXS51c2VyfSAke2xpc3RbZmlsZV0uZ3JvdXB9XFx0JHtsaXN0W2ZpbGVdLm5hbWV9XFxuYFxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzcG9uc2VTdHJpbmdcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIENBVCBDb21tYW5kXG4gICAqIFJlYWQgRmlsZVxuICAgKiBAcmV0dXJuIGZvcm1hdHRlZCBTdHJpbmdcbiAgICovXG4gIGxzOiB7XG4gICAgbmFtZTogJ2xzJyxcbiAgICB0eXBlOiAnYnVpbHRpbicsXG4gICAgZm46IGZ1bmN0aW9uKHBhdGggPSBbJy4vJ10pIHtcbiAgICAgIHBhdGggPSBwYXRoLmpvaW4oKVxuICAgICAgbGV0IGxpc3QsIHJlc3BvbnNlU3RyaW5nID0gJydcbiAgICAgIHRyeXtcbiAgICAgICAgbGlzdCA9IHRoaXMuc2hlbGwuZnMubGlzdERpcihwYXRoKVxuICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgIHRocm93IGVcbiAgICAgIH1cbiAgICAgIGZvciAobGV0IGZpbGUgaW4gbGlzdCkge1xuICAgICAgICBpZiAobGlzdC5oYXNPd25Qcm9wZXJ0eShmaWxlKSkge1xuICAgICAgICAgIHJlc3BvbnNlU3RyaW5nICs9IGAke2xpc3RbZmlsZV0ucGVybWlzc2lvbn1cXHQke2xpc3RbZmlsZV0udXNlcn0gJHtsaXN0W2ZpbGVdLmdyb3VwfVxcdCR7bGlzdFtmaWxlXS5uYW1lfVxcbmBcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3BvbnNlU3RyaW5nXG4gICAgfVxuICB9LFxuXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcblxuICAnZmlsZS5oJzogJyNpbmNsdWRlIDxub3BlLmg+JyxcblxuICBldGM6IHtcbiAgICBhcGFjaGUyOiB7XG4gICAgICAnYXBhY2hlMi5jb25mJzogJ05vdCBXaGF0IHlvdSB3ZXJlIGxvb2tpbmcgZm9yIDopJyxcbiAgICB9LFxuICB9LFxuXG4gIGhvbWU6IHtcbiAgICBndWVzdDoge1xuICAgICAgZG9jczoge1xuICAgICAgICAnbXlkb2MubWQnOiAnVGVzdEZpbGUnLFxuICAgICAgICAnbXlkb2MyLm1kJzogJ1Rlc3RGaWxlMicsXG4gICAgICAgICdteWRvYzMubWQnOiAnVGVzdEZpbGUzJyxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcblxuICByb290OntcbiAgICAnLnpzaHJjJzogJ25vdCBldmVuIGNsb3NlIDopJyxcbiAgICAnLm9oLW15LXpzaCc6IHtcbiAgICAgIHRoZW1lczoge30sXG4gICAgfSxcbiAgfSxcbn1cbiJdfQ==
