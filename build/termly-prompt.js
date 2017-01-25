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
    key: 'clear',
    value: function clear() {
      this.container.innerHTML = '';
      return this.generateRow();
    }
  }, {
    key: 'submitHandler',
    value: function submitHandler(e) {
      var _this4 = this;

      e.stopPropagation();
      // RUN when ENTER is pressed
      e.target.size = e.target.value.length + 2 || 3;
      if (event.which == 13 || event.keyCode == 13) {
        e.preventDefault();
        var command = e.target.value.trim();

        if (command === 'clear') return this.clear();

        // EXEC
        var output = this.run(command);
        // if is a {Promise} resolve it
        if (output['then']) {
          return output.then(function (res) {
            return _this4.generateOutput(res);
          }).catch(function (err) {
            return _this4.generateOutput(err.message);
          });
        }
        return this.generateOutput(output);
      }
    }
  }]);

  return Terminal;
}(Shell);

module.exports = Terminal;

},{"./Shell":6}],6:[function(require,module,exports){
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

},{"./Filesystem":3,"./Interpreter":4,"promise-polyfill":10,"whatwg-fetch":11}],7:[function(require,module,exports){
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
   * Return command manual info
   * @return {string}
   */
  http: {
    name: 'http',
    type: 'builtin',
    man: 'Send http requests.\n syntax: http METHOD URL.\neg: http GET www.google.com\nGET Method can be omitted',
    fn: function http() {
      var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      console.log(args);
      return;
      if (!args || !args.length) throw new Error('http: no parameters provided, provide URL and/or method \n help: ' + this.shell.ShellCommands['http'].man);
      return fetch('http://www.google.com', {
        method: 'POST'
      }).then(function (res) {
        if (res.ok) return res.json();
        throw new Error('Request Failer (' + (res.status || 500) + '): ' + (res.statusText || 'Some Error Occured.'));
      }).catch(function (err) {
        throw new Error('Request Failer (' + (err.status || 500) + '): ' + (err.statusText || 'Some Error Occured.'));
      });
    }
  }

};

},{"../../package.json":12}],8:[function(require,module,exports){
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
global['TermlyPrompt'] = require('./classes/Prompt');

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./classes/Prompt":5}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
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

},{}],12:[function(require,module,exports){
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

},{}]},{},[9])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJiaW4vY2xhc3Nlcy9Db21tYW5kLmpzIiwiYmluL2NsYXNzZXMvRmlsZS5qcyIsImJpbi9jbGFzc2VzL0ZpbGVzeXN0ZW0uanMiLCJiaW4vY2xhc3Nlcy9JbnRlcnByZXRlci5qcyIsImJpbi9jbGFzc2VzL1Byb21wdC5qcyIsImJpbi9jbGFzc2VzL1NoZWxsLmpzIiwiYmluL2NvbmZpZ3MvYnVpbHRpbi1jb21tYW5kcy5qcyIsImJpbi9jb25maWdzL2RlZmF1bHQtZmlsZXN5c3RlbS5qcyIsImJpbi90ZXJtbHktcHJvbXB0LmpzIiwibm9kZV9tb2R1bGVzL3Byb21pc2UtcG9seWZpbGwvcHJvbWlzZS5qcyIsIm5vZGVfbW9kdWxlcy93aGF0d2ctZmV0Y2gvZmV0Y2guanMiLCJwYWNrYWdlLmpzb24iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7QUNBQTs7Ozs7O0lBTU0sTztBQUNKLHFCQUF3RTtBQUFBLG1GQUFILEVBQUc7QUFBQSxRQUExRCxJQUEwRCxRQUExRCxJQUEwRDtBQUFBLFFBQXBELEVBQW9ELFFBQXBELEVBQW9EO0FBQUEseUJBQWhELElBQWdEO0FBQUEsUUFBaEQsSUFBZ0QsNkJBQXpDLEtBQXlDO0FBQUEsMEJBQWxDLEtBQWtDO0FBQUEsUUFBbEMsS0FBa0MsOEJBQTFCLFNBQTBCO0FBQUEsd0JBQWYsR0FBZTtBQUFBLFFBQWYsR0FBZSw0QkFBVCxFQUFTOztBQUFBOztBQUN0RSxRQUFJLE9BQU8sSUFBUCxLQUFnQixRQUFwQixFQUE4QixNQUFNLE1BQU0sK0JBQU4sQ0FBTjtBQUM5QixRQUFJLE9BQU8sRUFBUCxLQUFjLFVBQWxCLEVBQThCLE1BQU0sTUFBTSx3Q0FBTixDQUFOOztBQUU5Qjs7OztBQUlBLFNBQUssRUFBTCxHQUFVLEdBQUcsSUFBSCxDQUFRLElBQVIsQ0FBVjtBQUNBLFNBQUssSUFBTCxHQUFZLElBQVo7QUFDQSxTQUFLLElBQUwsR0FBWSxJQUFaO0FBQ0EsU0FBSyxHQUFMLEdBQVcsR0FBWDs7QUFFQSxRQUFJLEtBQUosRUFBVztBQUNULFdBQUssS0FBTCxHQUFhLEtBQWI7QUFDRDtBQUNGOztBQUVEOzs7Ozs7Ozs7OzJCQU1nQjtBQUFBLFVBQVgsSUFBVyx1RUFBSixFQUFJOztBQUNkLFVBQUksQ0FBQyxNQUFNLE9BQU4sQ0FBYyxJQUFkLENBQUwsRUFBMEIsTUFBTSxNQUFNLHVDQUFOLENBQU47QUFDMUIsVUFBSSxLQUFLLE1BQVQsRUFBaUIsT0FBTyxLQUFLLEVBQUwsQ0FBUSxJQUFSLENBQVA7QUFDakIsYUFBTyxLQUFLLEVBQUwsRUFBUDtBQUNEOzs7Ozs7QUFHSCxPQUFPLE9BQVAsR0FBaUIsT0FBakI7Ozs7Ozs7OztBQ3RDQTs7OztJQUlNLEk7QUFDSixrQkFBNEQ7QUFBQSxtRkFBSixFQUFJO0FBQUEseUJBQTlDLElBQThDO0FBQUEsUUFBOUMsSUFBOEMsNkJBQXZDLEVBQXVDO0FBQUEseUJBQW5DLElBQW1DO0FBQUEsUUFBbkMsSUFBbUMsNkJBQTVCLE1BQTRCO0FBQUEsNEJBQXBCLE9BQW9CO0FBQUEsUUFBcEIsT0FBb0IsZ0NBQVYsRUFBVTs7QUFBQTs7QUFDMUQsU0FBSyxHQUFMLEdBQVcsS0FBSyxNQUFMLEVBQVg7QUFDQSxTQUFLLElBQUwsR0FBWSxJQUFaO0FBQ0EsU0FBSyxJQUFMLEdBQVksSUFBWjtBQUNBLFNBQUssT0FBTCxHQUFlLE9BQWY7QUFDQSxTQUFLLElBQUwsR0FBWSxNQUFaO0FBQ0EsU0FBSyxLQUFMLEdBQWEsTUFBYjs7QUFFQSxRQUFJLEtBQUssSUFBTCxLQUFjLE1BQWxCLEVBQTBCO0FBQ3hCLFdBQUssVUFBTCxHQUFrQixXQUFsQjtBQUNELEtBRkQsTUFFTztBQUNMLFdBQUssVUFBTCxHQUFrQixZQUFsQjtBQUNEO0FBRUY7Ozs7NkJBRVE7QUFDUCxlQUFTLEVBQVQsR0FBYztBQUNaLGVBQU8sS0FBSyxLQUFMLENBQVcsQ0FBQyxJQUFJLEtBQUssTUFBTCxFQUFMLElBQXNCLE9BQWpDLEVBQ0osUUFESSxDQUNLLEVBREwsRUFFSixTQUZJLENBRU0sQ0FGTixDQUFQO0FBR0Q7QUFDRCxhQUFPLE9BQU8sSUFBUCxHQUFjLEdBQWQsR0FBb0IsSUFBcEIsR0FBMkIsR0FBM0IsR0FBaUMsSUFBakMsR0FBd0MsR0FBeEMsR0FDTCxJQURLLEdBQ0UsR0FERixHQUNRLElBRFIsR0FDZSxJQURmLEdBQ3NCLElBRDdCO0FBRUQ7Ozs7OztBQUdILE9BQU8sT0FBUCxHQUFpQixJQUFqQjs7Ozs7Ozs7Ozs7QUNoQ0EsSUFBTSxhQUFhLFFBQVEsK0JBQVIsQ0FBbkI7QUFDQSxJQUFNLE9BQU8sUUFBUSxRQUFSLENBQWI7O0FBRUE7Ozs7O0lBSU0sVTtBQUNKLHdCQUF5QztBQUFBLFFBQTdCLEVBQTZCLHVFQUF4QixVQUF3QjtBQUFBLFFBQVosS0FBWSx1RUFBSixFQUFJOztBQUFBOztBQUN2QyxTQUFLLEtBQUwsR0FBYSxLQUFiO0FBQ0EsUUFBSSxRQUFPLEVBQVAseUNBQU8sRUFBUCxPQUFjLFFBQWQsSUFBMEIsTUFBTSxPQUFOLENBQWMsRUFBZCxDQUE5QixFQUFpRCxNQUFNLElBQUksS0FBSixDQUFVLCtEQUFWLENBQU47O0FBRWpEO0FBQ0E7QUFDQSxTQUFLLEtBQUssS0FBTCxDQUFXLEtBQUssU0FBTCxDQUFlLEVBQWYsQ0FBWCxDQUFMO0FBQ0EsU0FBSyxVQUFMLEdBQWtCLEtBQUssTUFBTCxDQUFZLEVBQVosQ0FBbEI7O0FBRUE7QUFDQSxTQUFLLEdBQUwsR0FBVyxDQUFDLEdBQUQsQ0FBWDtBQUNEOztBQUVEOzs7Ozs7OzsyQkFJTyxFLEVBQUk7QUFDVCxXQUFLLGNBQUwsQ0FBb0IsRUFBcEI7QUFDQSxhQUFPLEVBQVA7QUFDRDs7QUFFRDs7Ozs7Ozs7O21DQU1lLEcsRUFBSztBQUNsQixXQUFLLElBQUksR0FBVCxJQUFnQixHQUFoQixFQUFxQjtBQUNuQixZQUFJLElBQUksY0FBSixDQUFtQixHQUFuQixDQUFKLEVBQTZCO0FBQzNCLGNBQUksUUFBTyxJQUFJLEdBQUosQ0FBUCxNQUFvQixRQUFwQixJQUFnQyxDQUFDLE1BQU0sT0FBTixDQUFjLElBQUksR0FBSixDQUFkLENBQXJDLEVBQThEO0FBQzVELGdCQUFJLEdBQUosSUFBVyxJQUFJLElBQUosQ0FBUyxFQUFFLE1BQU0sR0FBUixFQUFhLFNBQVMsSUFBSSxHQUFKLENBQXRCLEVBQWdDLE1BQU0sS0FBdEMsRUFBVCxDQUFYO0FBQ0EsaUJBQUssY0FBTCxDQUFvQixJQUFJLEdBQUosRUFBUyxPQUE3QjtBQUNELFdBSEQsTUFHTztBQUNMLGdCQUFJLEdBQUosSUFBVyxJQUFJLElBQUosQ0FBUyxFQUFFLE1BQU0sR0FBUixFQUFhLFNBQVMsSUFBSSxHQUFKLENBQXRCLEVBQVQsQ0FBWDtBQUNEO0FBQ0Y7QUFDRjtBQUNGOztBQUVEOzs7Ozs7Ozs7O3dDQU82QjtBQUFBLFVBQVgsSUFBVyx1RUFBSixFQUFJOztBQUMzQixVQUFJLENBQUMsS0FBSyxNQUFWLEVBQWtCLE1BQU0sSUFBSSxLQUFKLENBQVUsc0JBQVYsQ0FBTjs7QUFFbEI7QUFDQSxVQUFJLEtBQUssS0FBTCxDQUFXLFNBQVgsQ0FBSixFQUEyQixNQUFNLElBQUksS0FBSixxQkFBNEIsSUFBNUIsQ0FBTjs7QUFFM0I7QUFDQSxVQUFJLFlBQVksS0FBSyxLQUFMLENBQVcsR0FBWCxDQUFoQjtBQUNBLFVBQUksVUFBVSxDQUFWLE1BQWlCLEVBQXJCLEVBQXlCLFVBQVUsQ0FBVixJQUFlLEdBQWY7QUFDekIsVUFBSSxVQUFVLENBQVYsTUFBaUIsR0FBckIsRUFBMEIsVUFBVSxLQUFWO0FBQzFCLFVBQUcsVUFBVSxVQUFVLE1BQVYsR0FBbUIsQ0FBN0IsTUFBb0MsRUFBdkMsRUFBMkMsVUFBVSxHQUFWO0FBQzNDO0FBQ0EsVUFBSSxVQUFVLENBQVYsTUFBaUIsR0FBckIsRUFBMEI7QUFDeEIsb0JBQVksS0FBSyxHQUFMLENBQVMsTUFBVCxDQUFnQixTQUFoQixDQUFaO0FBQ0Q7QUFDRCxhQUFPLFNBQVA7QUFDRDs7QUFFRDs7Ozs7Ozs7Ozt3Q0FPNkI7QUFBQSxVQUFYLElBQVcsdUVBQUosRUFBSTs7QUFDM0IsVUFBSSxDQUFDLE1BQU0sT0FBTixDQUFjLElBQWQsQ0FBTCxFQUEwQixNQUFNLElBQUksS0FBSixDQUFVLDBDQUFWLENBQU47QUFDMUIsVUFBSSxDQUFDLEtBQUssTUFBVixFQUFrQixNQUFNLElBQUksS0FBSixDQUFVLHdDQUFWLENBQU47QUFDbEIsVUFBSSxTQUFTLEtBQUssSUFBTCxDQUFVLEdBQVYsQ0FBYjtBQUNBO0FBQ0EsYUFBTyxPQUFPLE9BQVAsQ0FBZSxTQUFmLEVBQTBCLEdBQTFCLENBQVA7QUFDRDs7QUFFRDs7Ozs7Ozs7O2lDQU04QztBQUFBLFVBQW5DLElBQW1DLHVFQUE1QixDQUFDLEdBQUQsQ0FBNEI7QUFBQSxVQUFyQixFQUFxQix1RUFBaEIsS0FBSyxVQUFXOztBQUM1QyxVQUFJLENBQUMsTUFBTSxPQUFOLENBQWMsSUFBZCxDQUFMLEVBQTBCLE1BQU0sSUFBSSxLQUFKLENBQVUsNEVBQVYsQ0FBTjs7QUFFMUI7QUFDQSxhQUFPLEtBQUssS0FBTCxDQUFXLENBQVgsQ0FBUDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsVUFBSSxDQUFDLEtBQUssTUFBVixFQUFrQixPQUFPLEVBQVA7O0FBRWxCO0FBQ0EsVUFBSSxPQUFPLEtBQUssS0FBTCxFQUFYOztBQUVBO0FBQ0EsVUFBSSxTQUFTLEdBQWIsRUFBa0I7QUFDaEI7QUFDQSxZQUFJLEdBQUcsSUFBSCxDQUFKLEVBQWM7QUFDWjtBQUNBLGVBQUssR0FBRyxJQUFILEVBQVMsSUFBVCxLQUFrQixLQUFsQixHQUEwQixHQUFHLElBQUgsRUFBUyxPQUFuQyxHQUE2QyxHQUFHLElBQUgsQ0FBbEQ7QUFDRCxTQUhELE1BR087QUFDTCxnQkFBTSxJQUFJLEtBQUosQ0FBVSxxQkFBVixDQUFOO0FBQ0Q7QUFDRjtBQUNELGFBQU8sS0FBSyxVQUFMLENBQWdCLElBQWhCLEVBQXNCLEVBQXRCLENBQVA7QUFDRDs7QUFFRDs7Ozs7Ozs7OztvQ0FPZ0Q7QUFBQSxVQUFsQyxFQUFrQyx1RUFBN0IsWUFBSSxDQUFFLENBQXVCO0FBQUEsVUFBckIsRUFBcUIsdUVBQWhCLEtBQUssVUFBVzs7QUFDOUMsVUFBTSxPQUFPLEtBQUssYUFBbEI7QUFDQSxXQUFLLElBQUksSUFBVCxJQUFpQixFQUFqQixFQUFxQjtBQUNuQixZQUFJLEdBQUcsY0FBSCxDQUFrQixJQUFsQixDQUFKLEVBQTZCO0FBQzNCLGNBQUksR0FBRyxJQUFILEVBQVMsSUFBVCxLQUFrQixLQUF0QixFQUE2QixLQUFLLGFBQUwsQ0FBbUIsRUFBbkIsRUFBdUIsR0FBRyxJQUFILEVBQVMsT0FBaEMsRUFBN0IsS0FDSyxHQUFHLEdBQUcsSUFBSCxDQUFIO0FBQ047QUFDRjtBQUNGOztBQUVEOzs7Ozs7Ozs7O21DQU8rQztBQUFBLFVBQWxDLEVBQWtDLHVFQUE3QixZQUFJLENBQUUsQ0FBdUI7QUFBQSxVQUFyQixFQUFxQix1RUFBaEIsS0FBSyxVQUFXOztBQUM3QyxXQUFLLElBQUksSUFBVCxJQUFpQixFQUFqQixFQUFxQjtBQUNuQixZQUFJLEdBQUcsY0FBSCxDQUFrQixJQUFsQixDQUFKLEVBQTZCO0FBQzNCLGNBQUksR0FBRyxJQUFILEVBQVMsSUFBVCxLQUFrQixLQUF0QixFQUE2QjtBQUMzQixlQUFHLEdBQUcsSUFBSCxDQUFIO0FBQ0EsaUJBQUssWUFBTCxDQUFrQixFQUFsQixFQUFzQixHQUFHLElBQUgsRUFBUyxPQUEvQjtBQUNEO0FBQ0Y7QUFDRjtBQUNGOztBQUVEOzs7Ozs7Ozs7OEJBTTZCO0FBQUEsVUFBckIsSUFBcUIsdUVBQWQsRUFBYztBQUFBLFVBQVYsUUFBVTs7QUFDM0IsVUFBSSxPQUFPLElBQVAsS0FBZ0IsUUFBcEIsRUFBOEIsTUFBTSxJQUFJLEtBQUosQ0FBVSxnQkFBVixDQUFOO0FBQzlCLFVBQUksa0JBQUo7QUFBQSxVQUFlLGFBQWY7O0FBRUEsVUFBSTtBQUNGLG9CQUFZLEtBQUssaUJBQUwsQ0FBdUIsSUFBdkIsQ0FBWjtBQUNBLGVBQU8sS0FBSyxVQUFMLENBQWdCLFNBQWhCLENBQVA7QUFDRCxPQUhELENBR0UsT0FBTyxDQUFQLEVBQVU7QUFDVixjQUFNLENBQU47QUFDRDs7QUFFRDs7OztBQUlBO0FBQ0EsVUFBSSxhQUFhLEtBQWIsSUFBc0IsS0FBSyxJQUFMLEtBQWMsTUFBeEMsRUFBZ0Q7QUFDOUMsY0FBTSxJQUFJLEtBQUosQ0FBVSw0QkFBVixDQUFOO0FBQ0Q7QUFDRDtBQUNBLFVBQUksYUFBYSxNQUFiLElBQXVCLEtBQUssSUFBTCxLQUFjLEtBQXpDLEVBQWdEO0FBQzlDLGNBQU0sSUFBSSxLQUFKLENBQVUsNEJBQVYsQ0FBTjtBQUNEO0FBQ0Q7QUFDQSxVQUFJLGFBQWEsTUFBYixJQUF1QixDQUFDLEtBQUssSUFBakMsRUFBdUM7QUFDckMsY0FBTSxJQUFJLEtBQUosQ0FBVSxtQkFBVixDQUFOO0FBQ0Q7QUFDRDtBQUNBLFVBQUksQ0FBQyxJQUFMLEVBQVc7QUFDVCxjQUFNLElBQUksS0FBSixDQUFVLDBDQUFWLENBQU47QUFDRDs7QUFFRCxhQUFPLEVBQUUsVUFBRixFQUFRLG9CQUFSLEVBQW9CLFVBQXBCLEVBQVA7QUFDRDs7QUFFRDs7Ozs7OztnQ0FJcUI7QUFBQSxVQUFYLElBQVcsdUVBQUosRUFBSTs7QUFDbkIsVUFBSSxlQUFKO0FBQ0EsVUFBSTtBQUNGLGlCQUFTLEtBQUssT0FBTCxDQUFhLElBQWIsRUFBbUIsS0FBbkIsQ0FBVDtBQUNELE9BRkQsQ0FFRSxPQUFPLEdBQVAsRUFBWTtBQUNaLGNBQU0sR0FBTjtBQUNEO0FBQ0QsV0FBSyxHQUFMLEdBQVcsT0FBTyxTQUFsQjtBQUNBO0FBQ0Q7O0FBRUQ7Ozs7Ozs7OEJBSW1CO0FBQUEsVUFBWCxJQUFXLHVFQUFKLEVBQUk7O0FBQ2pCLFVBQUksZUFBSjtBQUNBLFVBQUk7QUFDRixpQkFBUyxLQUFLLE9BQUwsQ0FBYSxJQUFiLEVBQW1CLEtBQW5CLENBQVQ7QUFDRCxPQUZELENBRUUsT0FBTyxHQUFQLEVBQVk7QUFDWixjQUFNLEdBQU47QUFDRDtBQUNELGFBQU8sT0FBTyxJQUFkO0FBQ0Q7OzsrQkFFbUI7QUFBQSxVQUFYLElBQVcsdUVBQUosRUFBSTs7QUFDbEIsVUFBSSxlQUFKO0FBQ0EsVUFBSTtBQUNGLGlCQUFTLEtBQUssT0FBTCxDQUFhLElBQWIsRUFBbUIsTUFBbkIsQ0FBVDtBQUNELE9BRkQsQ0FFRSxPQUFPLEdBQVAsRUFBWTtBQUNaLGNBQU0sR0FBTjtBQUNEO0FBQ0QsYUFBTyxPQUFPLElBQWQ7QUFDRDs7OzBDQUVxQjtBQUNwQixVQUFJLG9CQUFKO0FBQ0EsVUFBSTtBQUNGLHNCQUFjLEtBQUssaUJBQUwsQ0FBdUIsS0FBSyxHQUE1QixDQUFkO0FBQ0QsT0FGRCxDQUVFLE9BQU8sQ0FBUCxFQUFVO0FBQ1YsZUFBTywwRkFBUDtBQUNEO0FBQ0QsYUFBTyxXQUFQO0FBQ0Q7Ozs7OztBQUlILE9BQU8sT0FBUCxHQUFpQixVQUFqQjs7Ozs7Ozs7Ozs7QUM3UEEsSUFBTSxVQUFVLFFBQVEsV0FBUixDQUFoQjs7QUFFQTs7Ozs7Ozs7OztJQVNNLFc7Ozs7Ozs7OztBQUVKOzs7OzBCQUlNLEcsRUFBSztBQUNULFVBQUksT0FBTyxHQUFQLEtBQWUsUUFBbkIsRUFBNkIsTUFBTSxJQUFJLEtBQUosQ0FBVSwwQkFBVixDQUFOO0FBQzdCLFVBQUksQ0FBQyxJQUFJLE1BQVQsRUFBaUIsTUFBTSxJQUFJLEtBQUosQ0FBVSxrQkFBVixDQUFOO0FBQ2pCLGFBQU8sSUFBSSxLQUFKLENBQVUsR0FBVixDQUFQO0FBQ0Q7O0FBRUQ7Ozs7Ozs7OzsyQkFNTyxNLEVBQVE7QUFDYixVQUFJLE9BQU8sTUFBUCxLQUFrQixVQUF0QixFQUFrQztBQUNoQyxlQUFPLHVEQUFQO0FBQ0Q7QUFDRCxVQUFJLFdBQVcsU0FBWCxJQUF3QixPQUFPLE1BQVAsS0FBa0IsV0FBOUMsRUFBMkQ7QUFDekQsZUFBTyw2Q0FBUDtBQUNEO0FBQ0QsYUFBTyxNQUFQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNEOztBQUVEOzs7Ozs7O3lCQUlLLEcsRUFBSzs7QUFFUjtBQUNBLFVBQUksZUFBSjtBQUNBLFVBQUk7QUFDRixpQkFBUyxLQUFLLEtBQUwsQ0FBVyxHQUFYLENBQVQ7QUFDRCxPQUZELENBRUUsT0FBTyxDQUFQLEVBQVU7QUFDVixlQUFPLHFCQUFxQixFQUFFLE9BQXZCLElBQWtDLG9CQUF6QztBQUNEOztBQUVEO0FBQ0EsVUFBTSxVQUFVLEtBQUssYUFBTCxDQUFtQixPQUFPLENBQVAsQ0FBbkIsQ0FBaEI7QUFDQSxVQUFJLENBQUMsT0FBTCxFQUFjO0FBQ1osMkNBQWlDLE9BQU8sQ0FBUCxDQUFqQztBQUNEOztBQUVEO0FBQ0EsVUFBTSxPQUFPLE9BQU8sTUFBUCxDQUFjLFVBQUMsQ0FBRCxFQUFJLENBQUo7QUFBQSxlQUFVLElBQUksQ0FBZDtBQUFBLE9BQWQsQ0FBYjtBQUNBLFVBQUksZUFBSjtBQUNBLFVBQUk7QUFDRixpQkFBUyxRQUFRLElBQVIsQ0FBYSxJQUFiLENBQVQ7QUFDRCxPQUZELENBRUUsT0FBTyxDQUFQLEVBQVU7QUFDVixlQUFPLHFCQUFxQixFQUFFLE9BQTlCO0FBQ0Q7O0FBRUQ7QUFDQSxhQUFPLEtBQUssTUFBTCxDQUFZLE1BQVosQ0FBUDtBQUNEOztBQUVEOzs7Ozs7cUNBR2lCLGMsRUFBNEM7QUFBQSxVQUE1QixjQUE0Qix1RUFBWCxTQUFXOztBQUMzRCxVQUFJLGFBQWEsUUFBUSw2QkFBUixDQUFqQjtBQUNBOzs7O0FBSUEsVUFBSSxjQUFKLEVBQW9CO0FBQ2xCLFlBQUksUUFBTyxjQUFQLHlDQUFPLGNBQVAsT0FBMEIsUUFBMUIsSUFBc0MsQ0FBQyxNQUFNLE9BQU4sQ0FBYyxjQUFkLENBQTNDLEVBQTBFO0FBQ3hFLHVCQUFhLGNBQWI7QUFDRCxTQUZELE1BRU87QUFDTCxnQkFBTSxJQUFJLEtBQUosQ0FBVSxvREFBVixDQUFOO0FBQ0Q7QUFDRjs7QUFFRCxVQUFNLGdCQUFnQixFQUF0QjtBQUNBLGFBQU8sSUFBUCxDQUFZLFVBQVosRUFBd0IsR0FBeEIsQ0FBNEIsVUFBQyxHQUFELEVBQVM7QUFDbkMsWUFBTSxNQUFNLFdBQVcsR0FBWCxDQUFaO0FBQ0EsWUFBSSxPQUFPLElBQUksSUFBWCxLQUFvQixRQUFwQixJQUFnQyxPQUFPLElBQUksRUFBWCxLQUFrQixVQUF0RCxFQUFrRTtBQUNoRSxjQUFJLEtBQUosR0FBWSxjQUFaO0FBQ0Esd0JBQWMsR0FBZCxJQUFxQixJQUFJLE9BQUosQ0FBWSxHQUFaLENBQXJCO0FBQ0Q7QUFDRixPQU5EO0FBT0EsYUFBTyxhQUFQO0FBQ0Q7Ozs7OztBQUdILE9BQU8sT0FBUCxHQUFpQixXQUFqQjs7Ozs7Ozs7Ozs7OztBQzFHQSxJQUFJLFFBQVEsUUFBUSxTQUFSLENBQVo7O0FBRUE7Ozs7Ozs7Ozs7Ozs7O0lBYU0sUTs7O0FBQ0osc0JBQWdEO0FBQUEsUUFBcEMsUUFBb0MsdUVBQXpCLFNBQXlCOztBQUFBOztBQUFBLFFBQWQsT0FBYyx1RUFBSixFQUFJOztBQUFBOztBQUMvQjs7QUFEK0Isb0hBQ3hDLE9BRHdDOztBQUc5QyxRQUFJLENBQUMsUUFBTCxFQUFlLE1BQU0sSUFBSSxLQUFKLENBQVUsc0NBQVYsQ0FBTjtBQUNmLFFBQUk7QUFDRixZQUFLLFNBQUwsR0FBaUIsU0FBUyxhQUFULENBQXVCLFFBQXZCLENBQWpCO0FBQ0EsVUFBSSxDQUFDLE1BQUssU0FBVixFQUFxQixNQUFNLElBQUksS0FBSixDQUFVLHVDQUFWLENBQU47QUFDdEIsS0FIRCxDQUdFLE9BQU8sQ0FBUCxFQUFVO0FBQ1YsWUFBTSxJQUFJLEtBQUosQ0FBVSx5Q0FBVixDQUFOO0FBQ0Q7O0FBRUQsa0JBQU8sTUFBSyxJQUFMLEVBQVA7QUFDRDs7OzsyQkFFTTtBQUFBOztBQUNMLFdBQUssV0FBTDtBQUNBLFdBQUssU0FBTCxDQUFlLGdCQUFmLENBQWdDLE9BQWhDLEVBQXlDLFVBQUMsQ0FBRCxFQUFPO0FBQzlDLFVBQUUsZUFBRjtBQUNBLFlBQUksUUFBUSxPQUFLLFNBQUwsQ0FBZSxhQUFmLENBQTZCLDBCQUE3QixDQUFaO0FBQ0EsWUFBSSxLQUFKLEVBQVcsTUFBTSxLQUFOO0FBQ1osT0FKRDtBQUtEOzs7a0NBRWE7QUFBQTs7QUFDWixVQUFJLE9BQU8sSUFBWDs7QUFFQTtBQUNBLFVBQUksVUFBVSxTQUFTLGFBQVQsQ0FBdUIsdUJBQXZCLENBQWQ7QUFDQSxVQUFJLE9BQUosRUFBYTtBQUNYLGdCQUFRLFNBQVIsQ0FBa0IsTUFBbEIsQ0FBeUIsU0FBekI7QUFDRDs7QUFFRCxVQUFJLFlBQVksU0FBUyxhQUFULENBQXVCLGlCQUF2QixDQUFoQjtBQUNBLFVBQUksU0FBSixFQUFlO0FBQ2Isa0JBQVUsbUJBQVYsQ0FBOEIsT0FBOUIsRUFBdUMsS0FBSyxhQUE1QztBQUNEOztBQUVELFVBQU0sTUFBTSxTQUFTLGFBQVQsQ0FBdUIsS0FBdkIsQ0FBWjtBQUNBLFVBQUksU0FBSixDQUFjLEdBQWQsQ0FBa0IsU0FBbEIsRUFBNkIsY0FBN0I7QUFDQSxVQUFJLFNBQUosR0FBZ0IsRUFBaEI7QUFDQSxVQUFJLFNBQUoscUNBQWdELEtBQUssSUFBckQsU0FBNkQsS0FBSyxRQUFsRSxXQUFnRixLQUFLLEVBQUwsQ0FBUSxtQkFBUixFQUFoRjtBQUNBLFVBQUksU0FBSjs7QUFFQTtBQUNBLFdBQUssU0FBTCxDQUFlLFdBQWYsQ0FBMkIsR0FBM0I7QUFDQSxVQUFJLFFBQVEsS0FBSyxTQUFMLENBQWUsYUFBZixDQUE2QiwwQkFBN0IsQ0FBWjtBQUNBLFlBQU0sZ0JBQU4sQ0FBdUIsT0FBdkIsRUFBZ0M7QUFBQSxlQUFLLE9BQUssYUFBTCxDQUFtQixDQUFuQixDQUFMO0FBQUEsT0FBaEM7QUFDQSxZQUFNLEtBQU47O0FBRUEsYUFBTyxLQUFQO0FBQ0Q7OztxQ0FFd0I7QUFBQSxVQUFWLEdBQVUsdUVBQUosRUFBSTs7QUFDdkIsVUFBTSxNQUFNLFNBQVMsYUFBVCxDQUF1QixLQUF2QixDQUFaO0FBQ0EsVUFBSSxXQUFKLEdBQWtCLEdBQWxCO0FBQ0EsV0FBSyxTQUFMLENBQWUsV0FBZixDQUEyQixHQUEzQjtBQUNBLGFBQU8sS0FBSyxXQUFMLEVBQVA7QUFDRDs7OzRCQUVPO0FBQ04sV0FBSyxTQUFMLENBQWUsU0FBZixHQUEyQixFQUEzQjtBQUNBLGFBQU8sS0FBSyxXQUFMLEVBQVA7QUFDRDs7O2tDQUVhLEMsRUFBRztBQUFBOztBQUNmLFFBQUUsZUFBRjtBQUNBO0FBQ0EsUUFBRSxNQUFGLENBQVMsSUFBVCxHQUFnQixFQUFFLE1BQUYsQ0FBUyxLQUFULENBQWUsTUFBZixHQUF3QixDQUF4QixJQUE2QixDQUE3QztBQUNBLFVBQUksTUFBTSxLQUFOLElBQWUsRUFBZixJQUFxQixNQUFNLE9BQU4sSUFBaUIsRUFBMUMsRUFBOEM7QUFDNUMsVUFBRSxjQUFGO0FBQ0EsWUFBTSxVQUFVLEVBQUUsTUFBRixDQUFTLEtBQVQsQ0FBZSxJQUFmLEVBQWhCOztBQUVBLFlBQUksWUFBWSxPQUFoQixFQUF5QixPQUFPLEtBQUssS0FBTCxFQUFQOztBQUV6QjtBQUNBLFlBQU0sU0FBUyxLQUFLLEdBQUwsQ0FBUyxPQUFULENBQWY7QUFDQTtBQUNBLFlBQUksT0FBTyxNQUFQLENBQUosRUFBb0I7QUFDbEIsaUJBQU8sT0FBTyxJQUFQLENBQVk7QUFBQSxtQkFBTyxPQUFLLGNBQUwsQ0FBb0IsR0FBcEIsQ0FBUDtBQUFBLFdBQVosRUFBNkMsS0FBN0MsQ0FBbUQ7QUFBQSxtQkFBTyxPQUFLLGNBQUwsQ0FBb0IsSUFBSSxPQUF4QixDQUFQO0FBQUEsV0FBbkQsQ0FBUDtBQUNEO0FBQ0QsZUFBTyxLQUFLLGNBQUwsQ0FBb0IsTUFBcEIsQ0FBUDtBQUNEO0FBQ0Y7Ozs7RUFuRm9CLEs7O0FBc0Z2QixPQUFPLE9BQVAsR0FBaUIsUUFBakI7Ozs7Ozs7Ozs7Ozs7Ozs7QUNyR0EsSUFBTSxjQUFjLFFBQVEsZUFBUixDQUFwQjtBQUNBLElBQU0sYUFBYSxRQUFRLGNBQVIsQ0FBbkI7O0FBRUE7Ozs7Ozs7OztJQVFNLEs7OztBQUNKLG1CQUEyRztBQUFBLG1GQUFKLEVBQUk7QUFBQSwrQkFBN0YsVUFBNkY7QUFBQSxRQUE3RixVQUE2RixtQ0FBaEYsU0FBZ0Y7QUFBQSw2QkFBckUsUUFBcUU7QUFBQSxRQUFyRSxRQUFxRSxpQ0FBMUQsU0FBMEQ7QUFBQSx5QkFBL0MsSUFBK0M7QUFBQSxRQUEvQyxJQUErQyw2QkFBeEMsTUFBd0M7QUFBQSw2QkFBaEMsUUFBZ0M7QUFBQSxRQUFoQyxRQUFnQyxpQ0FBckIsWUFBcUI7O0FBQUE7O0FBQUE7O0FBR3pHLFVBQUssU0FBTDs7QUFFQTs7OztBQUlBLFVBQUssRUFBTCxHQUFVLElBQUksVUFBSixDQUFlLFVBQWYsUUFBVjtBQUNBLFVBQUssSUFBTCxHQUFZLElBQVo7QUFDQSxVQUFLLFFBQUwsR0FBZ0IsUUFBaEI7O0FBRUE7QUFDQTtBQUNBLFVBQUssYUFBTCxHQUFxQixNQUFLLGdCQUFMLE9BQXJCO0FBQ0EsVUFBSyxhQUFMLGdCQUNLLE1BQUssYUFEVixFQUVLLE1BQUssZ0JBQUwsUUFBNEIsUUFBNUIsQ0FGTDtBQWhCeUc7QUFvQjFHOzs7O2dDQUVXO0FBQ1YsVUFBSSxDQUFDLE9BQU8sT0FBWixFQUFxQjtBQUNuQixlQUFPLE9BQVAsR0FBaUIsUUFBUSxrQkFBUixFQUE0QixPQUE3QztBQUNEO0FBQ0QsVUFBSSxDQUFDLE9BQU8sS0FBWixFQUFtQjtBQUNqQixlQUFPLEtBQVAsR0FBZSxRQUFRLGNBQVIsQ0FBZjtBQUNEO0FBQ0QsYUFBTyxJQUFQO0FBQ0Q7O0FBRUQ7Ozs7Ozs7d0JBSUksRyxFQUFLO0FBQ1AsYUFBTyxLQUFLLElBQUwsQ0FBVSxHQUFWLENBQVA7QUFDRDs7OztFQXZDaUIsVzs7QUEwQ3BCLE9BQU8sY0FBUCxDQUFzQixNQUFNLFNBQTVCLEVBQXVDLElBQXZDLEVBQTZDLEVBQUUsVUFBVSxJQUFaLEVBQWtCLFlBQVksS0FBOUIsRUFBN0M7QUFDQSxPQUFPLGNBQVAsQ0FBc0IsTUFBTSxTQUE1QixFQUF1QyxlQUF2QyxFQUF3RCxFQUFFLFVBQVUsSUFBWixFQUFrQixZQUFZLEtBQTlCLEVBQXhEOztBQUVBLE9BQU8sT0FBUCxHQUFpQixLQUFqQjs7Ozs7OztlQ3hEb0UsUUFBUSxvQkFBUixDO0lBQTVELEksWUFBQSxJO0lBQU0sTyxZQUFBLE87SUFBUyxXLFlBQUEsVztJQUFhLFUsWUFBQSxVO0lBQVksTSxZQUFBLE07SUFBUSxPLFlBQUEsTzs7QUFDeEQsT0FBTyxPQUFQLEdBQWlCOztBQUVmOzs7O0FBSUEsUUFBTTtBQUNKLFVBQU0sTUFERjtBQUVKLFVBQU0sU0FGRjtBQUdKLFNBQUssNEJBSEQ7QUFJSixRQUFJLFNBQVMsSUFBVCxHQUFnQjtBQUNsQixzQ0FBOEIsT0FBTyxJQUFQLENBQVksS0FBSyxLQUFMLENBQVcsYUFBdkIsRUFBc0MsSUFBdEMsQ0FBMkMsSUFBM0MsQ0FBOUI7QUFDRDtBQU5HLEdBTlM7O0FBZWYsVUFBUTtBQUNOLFVBQU0sUUFEQTtBQUVOLFVBQU0sU0FGQTtBQUdOLFNBQUssY0FIQztBQUlOLFFBQUksU0FBUyxNQUFULEdBQWtCO0FBQ3BCLGFBQU8sS0FBSyxLQUFMLENBQVcsSUFBbEI7QUFDRDtBQU5LLEdBZk87O0FBd0JmLFNBQU87QUFDTCxVQUFNLE9BREQ7QUFFTCxVQUFNLFNBRkQ7QUFHTCxTQUFLLG9CQUhBO0FBSUwsUUFBSSxTQUFTLEtBQVQsR0FBaUI7QUFDbkIsVUFBSSxNQUFNLEVBQVY7QUFDQSx3QkFBZ0IsSUFBaEI7QUFDQSwyQkFBbUIsT0FBbkI7QUFDQSwrQkFBdUIsV0FBdkI7QUFDQSw4QkFBc0IsVUFBdEI7QUFDQSwwQkFBa0IsTUFBbEI7QUFDQSwyQkFBbUIsT0FBbkI7QUFDQSxhQUFPLEdBQVA7QUFDRDtBQWJJLEdBeEJROztBQXdDZjs7O0FBR0EsYUFBVztBQUNULFVBQU0sV0FERztBQUVULFVBQU0sU0FGRztBQUdULFNBQUssa0RBSEk7QUFJVCxRQUFJO0FBQUEsYUFBUSxJQUFSO0FBQUE7QUFKSyxHQTNDSTs7QUFrRGY7Ozs7QUFJQSxNQUFJO0FBQ0YsVUFBTSxJQURKO0FBRUYsVUFBTSxTQUZKO0FBR0YsU0FBSyxzRkFISDtBQUlGLFFBQUksU0FBUyxFQUFULENBQVksSUFBWixFQUFrQjtBQUNwQixVQUFJLENBQUMsSUFBTCxFQUFXLE1BQU0sSUFBSSxLQUFKLENBQVUsNEJBQVYsQ0FBTjtBQUNYLGFBQU8sS0FBSyxJQUFMLEVBQVA7QUFDQSxVQUFHO0FBQ0QsZUFBTyxLQUFLLEtBQUwsQ0FBVyxFQUFYLENBQWMsU0FBZCxDQUF3QixJQUF4QixDQUFQO0FBQ0QsT0FGRCxDQUVFLE9BQU0sQ0FBTixFQUFTO0FBQ1QsY0FBTSxDQUFOO0FBQ0Q7QUFDRjtBQVpDLEdBdERXOztBQXFFZjs7Ozs7O0FBTUEsTUFBSTtBQUNGLFVBQU0sSUFESjtBQUVGLFVBQU0sU0FGSjtBQUdGLFNBQUssb0ZBSEg7QUFJRixRQUFJLFNBQVMsRUFBVCxHQUE0QjtBQUFBLFVBQWhCLElBQWdCLHVFQUFULENBQUMsSUFBRCxDQUFTOztBQUM5QixhQUFPLEtBQUssSUFBTCxFQUFQO0FBQ0EsVUFBSSxhQUFKO0FBQUEsVUFBVSxpQkFBaUIsRUFBM0I7QUFDQSxVQUFHO0FBQ0QsZUFBTyxLQUFLLEtBQUwsQ0FBVyxFQUFYLENBQWMsT0FBZCxDQUFzQixJQUF0QixDQUFQO0FBQ0QsT0FGRCxDQUVFLE9BQU0sQ0FBTixFQUFTO0FBQ1QsY0FBTSxDQUFOO0FBQ0Q7QUFDRCxXQUFLLElBQUksSUFBVCxJQUFpQixJQUFqQixFQUF1QjtBQUNyQixZQUFJLEtBQUssY0FBTCxDQUFvQixJQUFwQixDQUFKLEVBQStCO0FBQzdCLDRCQUFxQixLQUFLLElBQUwsRUFBVyxVQUFoQyxVQUErQyxLQUFLLElBQUwsRUFBVyxJQUExRCxTQUFrRSxLQUFLLElBQUwsRUFBVyxLQUE3RSxVQUF1RixLQUFLLElBQUwsRUFBVyxJQUFsRztBQUNEO0FBQ0Y7QUFDRCxhQUFPLGNBQVA7QUFDRDtBQWxCQyxHQTNFVzs7QUFnR2Y7Ozs7O0FBS0EsT0FBSztBQUNILFVBQU0sS0FESDtBQUVILFVBQU0sU0FGSDtBQUdILFNBQUssdUVBSEY7QUFJSCxRQUFJLGNBQXdCO0FBQUEsVUFBZixJQUFlLHVFQUFSLENBQUMsSUFBRCxDQUFROztBQUMxQixhQUFPLEtBQUssSUFBTCxFQUFQO0FBQ0EsVUFBSSxhQUFKO0FBQUEsVUFBVSxpQkFBaUIsRUFBM0I7QUFDQSxVQUFHO0FBQ0QsZUFBTyxLQUFLLEtBQUwsQ0FBVyxFQUFYLENBQWMsUUFBZCxDQUF1QixJQUF2QixDQUFQO0FBQ0QsT0FGRCxDQUVFLE9BQU0sQ0FBTixFQUFTO0FBQ1QsY0FBTSxDQUFOO0FBQ0Q7QUFDRCxhQUFPLEtBQUssT0FBWjtBQUNEO0FBYkUsR0FyR1U7O0FBcUhmOzs7OztBQUtBLE9BQUs7QUFDSCxVQUFNLEtBREg7QUFFSCxVQUFNLFNBRkg7QUFHSCxTQUFLLGtEQUhGO0FBSUgsUUFBSSxTQUFTLEdBQVQsQ0FBYSxJQUFiLEVBQW1CO0FBQ3JCLFVBQUksQ0FBQyxJQUFELElBQVMsQ0FBQyxLQUFLLENBQUwsQ0FBZCxFQUF1QixNQUFNLElBQUksS0FBSixDQUFVLDJCQUFWLENBQU47QUFDdkIsVUFBSSxVQUFVLEtBQUssQ0FBTCxDQUFkO0FBQ0EsVUFBSSxDQUFDLEtBQUssS0FBTCxDQUFXLGFBQVgsQ0FBeUIsT0FBekIsQ0FBTCxFQUF3QyxNQUFNLElBQUksS0FBSixDQUFVLHlCQUFWLENBQU47QUFDeEMsVUFBSSxDQUFDLEtBQUssS0FBTCxDQUFXLGFBQVgsQ0FBeUIsT0FBekIsRUFBa0MsR0FBdkMsRUFBNEMsTUFBTSxJQUFJLEtBQUosQ0FBVSxtQ0FBVixDQUFOO0FBQzVDLGFBQU8sS0FBSyxLQUFMLENBQVcsYUFBWCxDQUF5QixPQUF6QixFQUFrQyxHQUF6QztBQUNEO0FBVkUsR0ExSFU7O0FBdUlmOzs7OztBQUtBLFFBQU07QUFDSixVQUFNLE1BREY7QUFFSixVQUFNLFNBRkY7QUFHSixTQUFLLHdHQUhEO0FBSUosUUFBSSxTQUFTLElBQVQsR0FBeUI7QUFBQSxVQUFYLElBQVcsdUVBQUosRUFBSTs7QUFDM0IsY0FBUSxHQUFSLENBQVksSUFBWjtBQUNBO0FBQ0EsVUFBSSxDQUFDLElBQUQsSUFBUyxDQUFDLEtBQUssTUFBbkIsRUFBMkIsTUFBTSxJQUFJLEtBQUosdUVBQThFLEtBQUssS0FBTCxDQUFXLGFBQVgsQ0FBeUIsTUFBekIsRUFBaUMsR0FBL0csQ0FBTjtBQUMzQixhQUFPLE1BQU0sdUJBQU4sRUFBK0I7QUFDcEMsZ0JBQVE7QUFENEIsT0FBL0IsRUFFSixJQUZJLENBRUMsVUFBQyxHQUFELEVBQVM7QUFDZixZQUFJLElBQUksRUFBUixFQUFZLE9BQU8sSUFBSSxJQUFKLEVBQVA7QUFDWixjQUFNLElBQUksS0FBSix1QkFBNkIsSUFBSSxNQUFKLElBQWMsR0FBM0MsYUFBb0QsSUFBSSxVQUFKLElBQWtCLHFCQUF0RSxFQUFOO0FBQ0QsT0FMTSxFQUtKLEtBTEksQ0FLRSxVQUFDLEdBQUQsRUFBUztBQUNoQixjQUFNLElBQUksS0FBSix1QkFBNkIsSUFBSSxNQUFKLElBQWMsR0FBM0MsYUFBb0QsSUFBSSxVQUFKLElBQWtCLHFCQUF0RSxFQUFOO0FBQ0QsT0FQTSxDQUFQO0FBUUQ7QUFoQkc7O0FBNUlTLENBQWpCOzs7OztBQ0RBLE9BQU8sT0FBUCxHQUFpQjs7QUFFZixZQUFVLG1CQUZLOztBQUlmLE9BQUs7QUFDSCxhQUFTO0FBQ1Asc0JBQWdCO0FBRFQ7QUFETixHQUpVOztBQVVmLFFBQU07QUFDSixXQUFPO0FBQ0wsWUFBTTtBQUNKLG9CQUFZLFVBRFI7QUFFSixxQkFBYSxXQUZUO0FBR0oscUJBQWE7QUFIVDtBQUREO0FBREgsR0FWUzs7QUFvQmYsUUFBSztBQUNILGNBQVUsbUJBRFA7QUFFSCxrQkFBYztBQUNaLGNBQVE7QUFESTtBQUZYO0FBcEJVLENBQWpCOzs7Ozs7QUNBQTs7Ozs7O0FBTUEsT0FBTyxjQUFQLElBQXlCLFFBQVEsa0JBQVIsQ0FBekI7Ozs7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMWNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcbiAqIENvbW1hbmQgQ2xhc3NcbiAqIEBwYXJhbSBuYW1lIFtTdHJpbmddLCBmbiBbRnVuY3Rpb25dXG4gKlxuICogZG9uJ3QgcGFzcyBhcnJvdyBmdW5jdGlvbiBpZiB5b3Ugd2FudCB0byB1c2UgdGhpcyBpbnNpZGUgeW91ciBjb21tYW5kIGZ1bmN0aW9uIHRvIGFjY2VzcyB2YXJpb3VzIHNoYXJlZCBzaGVsbCBvYmplY3RcbiAqL1xuY2xhc3MgQ29tbWFuZCB7XG4gIGNvbnN0cnVjdG9yKHsgbmFtZSwgZm4sIHR5cGUgPSAndXNyJywgc2hlbGwgPSB1bmRlZmluZWQsIG1hbiA9ICcnfSA9IHt9KXtcbiAgICBpZiAodHlwZW9mIG5hbWUgIT09ICdzdHJpbmcnKSB0aHJvdyBFcnJvcignQ29tbWFuZCBuYW1lIG11c3QgYmUgYSBzdHJpbmcnKVxuICAgIGlmICh0eXBlb2YgZm4gIT09ICdmdW5jdGlvbicpIHRocm93IEVycm9yKCdDb21tYW5kIGZ1bmN0aW9uIG11c3QgYmUuLi4gYSBmdW5jdGlvbicpXG5cbiAgICAvKipcbiAgICAgKiB1c2Ugd2hvbGUgZnVuY3Rpb24gaW5zdGVhZCBvZiBhcnJvdyBpZiB5b3Ugd2FudCB0byBhY2Nlc3NcbiAgICAgKiBjaXJjdWxhciByZWZlcmVuY2Ugb2YgQ29tbWFuZFxuICAgICAqL1xuICAgIHRoaXMuZm4gPSBmbi5iaW5kKHRoaXMpXG4gICAgdGhpcy5uYW1lID0gbmFtZVxuICAgIHRoaXMudHlwZSA9IHR5cGVcbiAgICB0aGlzLm1hbiA9IG1hblxuXG4gICAgaWYgKHNoZWxsKSB7XG4gICAgICB0aGlzLnNoZWxsID0gc2hlbGxcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRGlzcGF0Y2ggQ29tbWFuZCBFeGVjdXRpb25cbiAgICpcbiAgICogQHRpcCBkb24ndCB1c2UgYXJyb3cgZnVuY3Rpb24gaW4geW91IGNvbW1hbmQgaWYgeW91IHdhbnQgdGhlIGFyZ3VtZW50c1xuICAgKiBuZWl0aGVyIHN1cGVyIGFuZCBhcmd1bWVudHMgZ2V0IGJpbmRlZCBpbiBBRi5cbiAgICovXG4gIGV4ZWMoYXJncyA9IFtdKSB7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGFyZ3MpKSB0aHJvdyBFcnJvcignQ29tbWFuZCBleGVjIGFyZ3MgbXVzdCBiZSBpbiBhbiBhcnJheScpXG4gICAgaWYgKGFyZ3MubGVuZ3RoKSByZXR1cm4gdGhpcy5mbihhcmdzKVxuICAgIHJldHVybiB0aGlzLmZuKClcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENvbW1hbmRcbiIsIi8qKlxuICogQGNsYXNzIFNpbmdsZSBGaWxlIENsYXNzXG4gKiBTaW11bGF0ZSBmaWxlIHByb3BlcnRpZXNcbiAqL1xuY2xhc3MgRmlsZSB7XG4gIGNvbnN0cnVjdG9yKHsgbmFtZSA9ICcnLCB0eXBlID0gJ2ZpbGUnLCBjb250ZW50ID0gJyd9ID0ge30pIHtcbiAgICB0aGlzLnVpZCA9IHRoaXMuZ2VuVWlkKClcbiAgICB0aGlzLm5hbWUgPSBuYW1lXG4gICAgdGhpcy50eXBlID0gdHlwZVxuICAgIHRoaXMuY29udGVudCA9IGNvbnRlbnRcbiAgICB0aGlzLnVzZXIgPSAncm9vdCdcbiAgICB0aGlzLmdyb3VwID0gJ3Jvb3QnXG5cbiAgICBpZiAodGhpcy50eXBlID09PSAnZmlsZScpIHtcbiAgICAgIHRoaXMucGVybWlzc2lvbiA9ICdyd3hyLS1yLS0nXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucGVybWlzc2lvbiA9ICdkcnd4ci14ci14J1xuICAgIH1cblxuICB9XG5cbiAgZ2VuVWlkKCkge1xuICAgIGZ1bmN0aW9uIHM0KCkge1xuICAgICAgcmV0dXJuIE1hdGguZmxvb3IoKDEgKyBNYXRoLnJhbmRvbSgpKSAqIDB4MTAwMDApXG4gICAgICAgIC50b1N0cmluZygxNilcbiAgICAgICAgLnN1YnN0cmluZygxKTtcbiAgICB9XG4gICAgcmV0dXJuIHM0KCkgKyBzNCgpICsgJy0nICsgczQoKSArICctJyArIHM0KCkgKyAnLScgK1xuICAgICAgczQoKSArICctJyArIHM0KCkgKyBzNCgpICsgczQoKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGVcbiIsImNvbnN0IERFRkFVTFRfRlMgPSByZXF1aXJlKCcuLi9jb25maWdzL2RlZmF1bHQtZmlsZXN5c3RlbScpXG5jb25zdCBGaWxlID0gcmVxdWlyZSgnLi9GaWxlJylcblxuLyoqXG4gKiBAY2xhc3MgVmlydHVhbCBGaWxlc3lzdGVtXG4gKiBSZXByZXNlbnRlZCBhcyBhbiBvYmplY3Qgb2Ygbm9kZXNcbiAqL1xuY2xhc3MgRmlsZXN5c3RlbSB7XG4gIGNvbnN0cnVjdG9yKGZzID0gREVGQVVMVF9GUywgc2hlbGwgPSB7fSkge1xuICAgIHRoaXMuc2hlbGwgPSBzaGVsbFxuICAgIGlmICh0eXBlb2YgZnMgIT09ICdvYmplY3QnIHx8IEFycmF5LmlzQXJyYXkoZnMpKSB0aHJvdyBuZXcgRXJyb3IoJ1ZpcnR1YWwgRmlsZXN5c3RlbSBwcm92aWRlZCBub3QgdmFsaWQsIGluaXRpYWxpemF0aW9uIGZhaWxlZC4nKVxuXG4gICAgLy8gTm90IEJ5IFJlZmVyZW5jZS5cbiAgICAvLyBIQUNLOiBPYmplY3QgYXNzaWduIHJlZnVzZSB0byB3b3JrIGFzIGludGVuZGVkLlxuICAgIGZzID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShmcykpXG4gICAgdGhpcy5GaWxlU3lzdGVtID0gdGhpcy5pbml0RnMoZnMpXG5cbiAgICAvLyBDV0QgZm9yIGNvbW1hbmRzIHVzYWdlXG4gICAgdGhpcy5jd2QgPSBbJy8nXVxuICB9XG5cbiAgLyoqXG4gICAqIEluaXQgJiBQYXNzIENvbnRyb2wgdG8gcmVjdXJyc2l2ZSBmdW5jdGlvblxuICAgKiBAcmV0dXJuIG5ldyBGaWxlc3lzdGVtIGFzIG5vZGVzIG9mIG11bHRpcGxlIEBjbGFzcyBGaWxlXG4gICAqL1xuICBpbml0RnMoZnMpIHtcbiAgICB0aGlzLmJ1aWxkVmlydHVhbEZzKGZzKVxuICAgIHJldHVybiBmc1xuICB9XG5cbiAgLyoqXG4gICAqIFRyYXZlcnNlIGFsbCBub2RlIGFuZCBidWlsZCBhIHZpcnR1YWwgcmVwcmVzZW50YXRpb24gb2YgYSBmaWxlc3lzdGVtXG4gICAqIEVhY2ggbm9kZSBpcyBhIEZpbGUgaW5zdGFuY2UuXG4gICAqIEBwYXJhbSBNb2NrZWQgRmlsZXN5c3RlbSBhcyBPYmplY3RcbiAgICpcbiAgICovXG4gIGJ1aWxkVmlydHVhbEZzKG9iaikge1xuICAgIGZvciAobGV0IGtleSBpbiBvYmopIHtcbiAgICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICBpZiAodHlwZW9mIG9ialtrZXldID09PSAnb2JqZWN0JyAmJiAhQXJyYXkuaXNBcnJheShvYmpba2V5XSkpIHtcbiAgICAgICAgICBvYmpba2V5XSA9IG5ldyBGaWxlKHsgbmFtZToga2V5LCBjb250ZW50OiBvYmpba2V5XSwgdHlwZTogJ2RpcicgfSlcbiAgICAgICAgICB0aGlzLmJ1aWxkVmlydHVhbEZzKG9ialtrZXldLmNvbnRlbnQpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgb2JqW2tleV0gPSBuZXcgRmlsZSh7IG5hbWU6IGtleSwgY29udGVudDogb2JqW2tleV0gfSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYSBzdHJpbmdlZCBwYXRoIGFuZCByZXR1cm4gYXMgYXJyYXlcbiAgICogdGhyb3cgZXJyb3IgaWYgcGF0aCBmb3JtYXQgaXMgaW52YWxpZFxuICAgKiBSZWxhdGl2ZSBQYXRoIGdldHMgY29udmVydGVkIHVzaW5nIEN1cnJlbnQgV29ya2luZyBEaXJlY3RvcnlcbiAgICogQHBhcmFtIHBhdGgge1N0cmluZ31cbiAgICogQHJldHVybiBBcnJheVxuICAgKi9cbiAgcGF0aFN0cmluZ1RvQXJyYXkocGF0aCA9ICcnKSB7XG4gICAgaWYgKCFwYXRoLmxlbmd0aCkgdGhyb3cgbmV3IEVycm9yKCdQYXRoIGNhbm5vdCBiZSBlbXB0eScpXG5cbiAgICAvLyBDaGVjayBmb3IgaW52YWxpZCBwYXRoLCBlZy4gdHdvKyAvLyBpbiBhIHJvd1xuICAgIGlmIChwYXRoLm1hdGNoKC9cXC97Mix9L2cpKSB0aHJvdyBuZXcgRXJyb3IoYC1pbnZhbGlkIHBhdGg6ICR7cGF0aH1gKVxuXG4gICAgLy8gRm9ybWF0IGFuZCBDb21wb3NlciBhcnJheVxuICAgIGxldCBwYXRoQXJyYXkgPSBwYXRoLnNwbGl0KCcvJylcbiAgICBpZiAocGF0aEFycmF5WzBdID09PSAnJykgcGF0aEFycmF5WzBdID0gJy8nXG4gICAgaWYgKHBhdGhBcnJheVswXSA9PT0gJy4nKSBwYXRoQXJyYXkuc2hpZnQoKVxuICAgIGlmKHBhdGhBcnJheVtwYXRoQXJyYXkubGVuZ3RoIC0gMV0gPT09ICcnKSBwYXRoQXJyYXkucG9wKClcbiAgICAvLyBoYW5kbGUgcmVsYXRpdmUgcGF0aCB3aXRoIGN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnlcbiAgICBpZiAocGF0aEFycmF5WzBdICE9PSAnLycpIHtcbiAgICAgIHBhdGhBcnJheSA9IHRoaXMuY3dkLmNvbmNhdChwYXRoQXJyYXkpXG4gICAgfVxuICAgIHJldHVybiBwYXRoQXJyYXlcbiAgfVxuXG4gIC8qKlxuICAgKiBQYXRoIGZyb20gYXJyYXkgdG8gU3RyaW5nXG4gICAqIEZvciBwcmVzZW50YXRpb25hbCBwdXJwb3NlLlxuICAgKiBUT0RPXG4gICAqIEBwYXJhbSBwYXRoIFtBcnJheV1cbiAgICogQHJldHVybiB7U3RyaW5nfVxuICAgKi9cbiAgcGF0aEFycmF5VG9TdHJpbmcocGF0aCA9IFtdKSB7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KHBhdGgpKSB0aHJvdyBuZXcgRXJyb3IoJy1mYXRhbCBmaWxlc3lzdGVtOiBwYXRoIG11c3QgYmUgYW4gYXJyYXknKVxuICAgIGlmICghcGF0aC5sZW5ndGgpIHRocm93IG5ldyBFcnJvcignLWludmFsaWQgZmlsZXN5c3RlbTogcGF0aCBub3QgcHJvdmlkZWQnKVxuICAgIGxldCBvdXRwdXQgPSBwYXRoLmpvaW4oJy8nKVxuICAgIC8vIHJlbW92ZSAvIG11bHRpcGxlIG9jY3VycmVuY2VcbiAgICByZXR1cm4gb3V0cHV0LnJlcGxhY2UoL1xcL3syLH0vZywgJy8nKVxuICB9XG5cbiAgLyoqXG4gICAqIEx1a2UuLiBmaWxlV2Fsa2VyXG4gICAqIEFjY2VwdHMgb25seSBBYnNvbHV0ZSBQYXRoLCB5b3UgbXVzdCBjb252ZXJ0IHBhdGhzIGJlZm9yZSBjYWxsaW5nIHVzaW5nIHBhdGhTdHJpbmdUb0FycmF5XG4gICAqIEBwYXJhbSBjYiBleGVjdXRlZCBvbiBlYWNoIGZpbGUgZm91bmRcbiAgICogQHBhcmFtIGZzIFtTaGVsbCBWaXJ0dWFsIEZpbGVzeXN0ZW1dXG4gICAqL1xuICBmaWxlV2Fsa2VyKHBhdGggPSBbJy8nXSwgZnMgPSB0aGlzLkZpbGVTeXN0ZW0pe1xuICAgIGlmICghQXJyYXkuaXNBcnJheShwYXRoKSkgdGhyb3cgbmV3IEVycm9yKCdQYXRoIG11c3QgYmUgYW4gYXJyYXkgb2Ygbm9kZXMsIHVzZSBGaWxlc3lzdGVtLnBhdGhTdHJpbmdUb0FycmF5KHtzdHJpbmd9KScpXG5cbiAgICAvLyBhdm9pZCBtb2RpZnlpbmcgZXh0ZXJuYWwgcGF0aCByZWZlcmVuY2VcbiAgICBwYXRoID0gcGF0aC5zbGljZSgwKVxuXG4gICAgLy8gVE9ETzpcbiAgICAvLyAgQ2hvb3NlOlxuICAgIC8vICAgIC0gR28gZnVsbCBwdXJlXG4gICAgLy8gICAgLSBXb3JrIG9uIHRoZSByZWZlcmVuY2Ugb2YgdGhlIGFjdHVhbCBub2RlXG4gICAgLy8gZnMgPSBPYmplY3QuYXNzaWduKGZzLCB7fSlcblxuICAgIC8vIEV4aXQgQ29uZGl0aW9uXG4gICAgaWYgKCFwYXRoLmxlbmd0aCkgcmV0dXJuIGZzXG5cbiAgICAvLyBHZXQgY3VycmVudCBub2RlXG4gICAgbGV0IG5vZGUgPSBwYXRoLnNoaWZ0KClcblxuICAgIC8vIEdvIGRlZXBlciBpZiBpdCdzIG5vdCB0aGUgcm9vdCBkaXJcbiAgICBpZiAobm9kZSAhPT0gJy8nKSB7XG4gICAgICAvLyBjaGVjayBpZiBub2RlIGV4aXN0XG4gICAgICBpZiAoZnNbbm9kZV0pIHtcbiAgICAgICAgLy8gcmV0dXJuIGZpbGUgb3IgZm9sZGVyXG4gICAgICAgIGZzID0gZnNbbm9kZV0udHlwZSA9PT0gJ2RpcicgPyBmc1tub2RlXS5jb250ZW50IDogZnNbbm9kZV1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignRmlsZSBkb2VzblxcJ3QgZXhpc3QnKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5maWxlV2Fsa2VyKHBhdGgsIGZzKVxuICB9XG5cbiAgLyoqXG4gICAqIHRyYXZlcnNlRmlsZXNcbiAgICogYWNjZXNzaW5nIGFsbCBmaWxlIGF0IGxlYXN0IG9uY2VcbiAgICogY2FsbGluZyBwcm92aWRlZCBjYWxsYmFjayBvbiBlYWNoXG4gICAqIEBwYXJhbSBjYiBleGVjdXRlZCBvbiBlYWNoIGZpbGUgZm91bmRcbiAgICogQHBhcmFtIGZzIFtTaGVsbCBWaXJ0dWFsIEZpbGVzeXN0ZW1dXG4gICAqL1xuICB0cmF2ZXJzZUZpbGVzKGNiID0gKCk9Pnt9LCBmcyA9IHRoaXMuRmlsZVN5c3RlbSl7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXMudHJhdmVyc2VGaWxlc1xuICAgIGZvciAobGV0IG5vZGUgaW4gZnMpIHtcbiAgICAgIGlmIChmcy5oYXNPd25Qcm9wZXJ0eShub2RlKSkge1xuICAgICAgICBpZiAoZnNbbm9kZV0udHlwZSA9PT0gJ2RpcicpIHRoaXMudHJhdmVyc2VGaWxlcyhjYiwgZnNbbm9kZV0uY29udGVudClcbiAgICAgICAgZWxzZSBjYihmc1tub2RlXSlcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogdHJhdmVyc2VEaXJzXG4gICAqIGFjY2Vzc2luZyBhbGwgZGlyZWN0b3J5IGF0IGxlYXN0IG9uY2VcbiAgICogY2FsbGluZyBwcm92aWRlZCBjYWxsYmFjayBvbiBlYWNoXG4gICAqIEBwYXJhbSBjYiBleGVjdXRlZCBvbiBlYWNoIGZpbGUgZm91bmRcbiAgICogQHBhcmFtIGZzIFtTaGVsbCBWaXJ0dWFsIEZpbGVzeXN0ZW1dXG4gICAqL1xuICB0cmF2ZXJzZURpcnMoY2IgPSAoKT0+e30sIGZzID0gdGhpcy5GaWxlU3lzdGVtKXtcbiAgICBmb3IgKGxldCBub2RlIGluIGZzKSB7XG4gICAgICBpZiAoZnMuaGFzT3duUHJvcGVydHkobm9kZSkpIHtcbiAgICAgICAgaWYgKGZzW25vZGVdLnR5cGUgPT09ICdkaXInKSB7XG4gICAgICAgICAgY2IoZnNbbm9kZV0pXG4gICAgICAgICAgdGhpcy50cmF2ZXJzZURpcnMoY2IsIGZzW25vZGVdLmNvbnRlbnQpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2V0IERpcmVjdG9yeSBOb2RlXG4gICAqIFBhc3NlZCBhcyBSZWZlcmVuY2Ugb3IgSW5zdGFuY2UsXG4gICAqIGRlcGVuZCBieSBhIGxpbmUgaW4gQG1ldGhvZCBmaWxlV2Fsa2VyLCBzZWUgY29tbWVudCB0aGVyZS5cbiAgICogQHJldHVybiBEaXJlY3RvcnkgTm9kZSBPYmplY3RcbiAgICovXG4gIGdldE5vZGUocGF0aCA9ICcnLCBmaWxlVHlwZSkge1xuICAgIGlmICh0eXBlb2YgcGF0aCAhPT0gJ3N0cmluZycpIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBpbnB1dC4nKVxuICAgIGxldCBwYXRoQXJyYXksIG5vZGVcblxuICAgIHRyeSB7XG4gICAgICBwYXRoQXJyYXkgPSB0aGlzLnBhdGhTdHJpbmdUb0FycmF5KHBhdGgpXG4gICAgICBub2RlID0gdGhpcy5maWxlV2Fsa2VyKHBhdGhBcnJheSlcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB0aHJvdyBlXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRVJST1IgSEFORExJTkdcbiAgICAgKi9cblxuICAgIC8vIEhhbmRsZSBMaXN0IG9uIGEgZmlsZVxuICAgIGlmIChmaWxlVHlwZSA9PT0gJ2RpcicgJiYgbm9kZS50eXBlID09PSAnZmlsZScpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSXRzIGEgZmlsZSBub3QgYSBkaXJlY3RvcnknKVxuICAgIH1cbiAgICAvLyBIYW5kbGUgcmVhZGZpbGUgb24gYSBkaXJcbiAgICBpZiAoZmlsZVR5cGUgPT09ICdmaWxlJyAmJiBub2RlLnR5cGUgPT09ICdkaXInKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0l0cyBhIGRpcmVjdG9yeSBub3QgYSBmaWxlJylcbiAgICB9XG4gICAgLy8gaGFuZGxlIHJlYWRmaWxlIG9uIG5vbiBleGlzdGluZyBmaWxlXG4gICAgaWYgKGZpbGVUeXBlID09PSAnZmlsZScgJiYgIW5vZGUudHlwZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGZpbGUgcGF0aCcpXG4gICAgfVxuICAgIC8vIGhhbmRsZSBpbnZhbGlkIC8gbm9uZXhpc3RpbmcgcGF0aFxuICAgIGlmICghbm9kZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHBhdGgsIGZpbGUvZm9sZGVyIGRvZXNuXFwndCBleGlzdCcpXG4gICAgfVxuXG4gICAgcmV0dXJuIHsgcGF0aCwgcGF0aEFycmF5ICwgbm9kZSB9XG4gIH1cblxuICAvKipcbiAgICogQ2hhbmdlIEN1cnJlbnQgV29ya2luZyBEaXJlY3RvcnkgR3JhY2VmdWxseVxuICAgKiBAcmV0dXJuIE1lc3NhZ2UgU3RyaW5nLlxuICAgKi9cbiAgY2hhbmdlRGlyKHBhdGggPSAnJykge1xuICAgIGxldCByZXN1bHRcbiAgICB0cnkge1xuICAgICAgcmVzdWx0ID0gdGhpcy5nZXROb2RlKHBhdGgsICdkaXInKVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgdGhyb3cgZXJyXG4gICAgfVxuICAgIHRoaXMuY3dkID0gcmVzdWx0LnBhdGhBcnJheVxuICAgIHJldHVybiBgY2hhbmdlZCBkaXJlY3RvcnkuYFxuICB9XG5cbiAgLyoqXG4gICAqIExpc3QgQ3VycmVudCBXb3JraW5nIERpcmVjdG9yeSBGaWxlc1xuICAgKiBAcmV0dXJuIHt9XG4gICAqL1xuICBsaXN0RGlyKHBhdGggPSAnJykge1xuICAgIGxldCByZXN1bHRcbiAgICB0cnkge1xuICAgICAgcmVzdWx0ID0gdGhpcy5nZXROb2RlKHBhdGgsICdkaXInKVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgdGhyb3cgZXJyXG4gICAgfVxuICAgIHJldHVybiByZXN1bHQubm9kZVxuICB9XG5cbiAgcmVhZEZpbGUocGF0aCA9ICcnKSB7XG4gICAgbGV0IHJlc3VsdFxuICAgIHRyeSB7XG4gICAgICByZXN1bHQgPSB0aGlzLmdldE5vZGUocGF0aCwgJ2ZpbGUnKVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgdGhyb3cgZXJyXG4gICAgfVxuICAgIHJldHVybiByZXN1bHQubm9kZVxuICB9XG5cbiAgZ2V0Q3VycmVudERpcmVjdG9yeSgpIHtcbiAgICBsZXQgY3dkQXNTdHJpbmdcbiAgICB0cnkge1xuICAgICAgY3dkQXNTdHJpbmcgPSB0aGlzLnBhdGhBcnJheVRvU3RyaW5nKHRoaXMuY3dkKVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiAnLWludmFsaWQgZmlsZXN5c3RlbTogQW4gZXJyb3Igb2NjdXJlZCB3aGlsZSBwYXJzaW5nIGN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnkgdG8gc3RyaW5nLidcbiAgICB9XG4gICAgcmV0dXJuIGN3ZEFzU3RyaW5nXG4gIH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGVzeXN0ZW1cbiIsImNvbnN0IENvbW1hbmQgPSByZXF1aXJlKCcuL0NvbW1hbmQnKVxuXG4vKipcbiAqXG4gKiBJbnRlcnByZXRlclxuICogSXMgdGhlIHBhcmVudCBDbGFzcyBvZiB0aGUgTWFpbiBTaGVsbCBDbGFzc1xuICogLSBUaGlzIGNsYXNzIGlzIHRoZSBvbmUgdGhhdCBwYXJzZSBhbmQgcnVuIGV4ZWMgb2YgY29tbWFuZFxuICogLSBQYXJzaW5nIG9mIGJ1aWx0aW4gY29tbWFuZCBvbiBydW50aW1lIGhhcHBlbiBoZXJlXG4gKiAtIFdpbGwgcGFyc2UgY3VzdG9tIHVzZXIgQ29tbWFuZCB0b29cbiAqXG4gKi9cbmNsYXNzIEludGVycHJldGVyIHtcblxuICAvKipcbiAgICogUGFyc2UgQ29tbWFuZFxuICAgKiBAcmV0dXJuIEFycmF5IG9mIGFyZ3MgYXMgaW4gQ1xuICAgKi9cbiAgcGFyc2UoY21kKSB7XG4gICAgaWYgKHR5cGVvZiBjbWQgIT09ICdzdHJpbmcnKSB0aHJvdyBuZXcgRXJyb3IoJ0NvbW1hbmQgbXVzdCBiZSBhIHN0cmluZycpXG4gICAgaWYgKCFjbWQubGVuZ3RoKSB0aHJvdyBuZXcgRXJyb3IoJ0NvbW1hbmQgaXMgZW1wdHknKVxuICAgIHJldHVybiBjbWQuc3BsaXQoJyAnKVxuICB9XG5cbiAgLyoqXG4gICAqIEZvcm1hdCBPdXRwdXRcbiAgICogcmV0dXJuIGVycm9yIGlmIGZ1bmN0aW9uIGlzIHJldHVybmVkXG4gICAqIGNvbnZlcnQgZXZlcnl0aGluZyBlbHNlIHRvIGpzb24uXG4gICAqIEByZXR1cm4gSlNPTiBwYXJzZWRcbiAgICovXG4gIGZvcm1hdChvdXRwdXQpIHtcbiAgICBpZiAodHlwZW9mIG91dHB1dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuICctaW52YWxpZCBjb21tYW5kOiBDb21tYW5kIHJldHVybmVkIGludmFsaWQgZGF0YSB0eXBlLidcbiAgICB9XG4gICAgaWYgKG91dHB1dCA9PT0gdW5kZWZpbmVkIHx8IHR5cGVvZiBvdXRwdXQgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICByZXR1cm4gJy1pbnZhbGlkIGNvbW1hbmQ6IENvbW1hbmQgcmV0dXJuZWQgbm8gZGF0YS4nXG4gICAgfVxuICAgIHJldHVybiBvdXRwdXRcbiAgICAvLyB0cnkge1xuICAgIC8vICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KG91dHB1dClcbiAgICAvLyB9IGNhdGNoIChlKSB7XG4gICAgLy8gICByZXR1cm4gJy1pbnZhbGlkIGNvbW1hbmQ6IENvbW1hbmQgcmV0dXJuZWQgaW52YWxpZCBkYXRhIHR5cGU6ICcgKyBlLm1lc3NhZ2VcbiAgICAvLyB9XG4gIH1cblxuICAvKipcbiAgICogRXhlYyBDb21tYW5kXG4gICAqIEByZXR1cm4gSlNPTiBTdHJpbmcgd2l0aCBvdXRwdXRcbiAgICovXG4gIGV4ZWMoY21kKSB7XG5cbiAgICAvLyAgUGFyc2UgQ29tbWFuZCBTdHJpbmc6IFswXSA9IGNvbW1hbmQgbmFtZSwgWzErXSA9IGFyZ3VtZW50c1xuICAgIGxldCBwYXJzZWRcbiAgICB0cnkge1xuICAgICAgcGFyc2VkID0gdGhpcy5wYXJzZShjbWQpXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuICctZmF0YWwgY29tbWFuZDogJyArIGUubWVzc2FnZSB8fCAnU29tZSBFcnJvciBPY2N1cmVkJ1xuICAgIH1cblxuICAgIC8vICBYLWNoZWNrIGlmIGNvbW1hbmQgZXhpc3RcbiAgICBjb25zdCBjb21tYW5kID0gdGhpcy5TaGVsbENvbW1hbmRzW3BhcnNlZFswXV1cbiAgICBpZiAoIWNvbW1hbmQpIHtcbiAgICAgIHJldHVybiBgLWVycm9yIHNoZWxsOiBDb21tYW5kIDwke3BhcnNlZFswXX0+IGRvZXNuJ3QgZXhpc3QuXFxuYFxuICAgIH1cblxuICAgIC8vICBnZXQgYXJndW1lbnRzIGFycmF5IGFuZCBleGVjdXRlIGNvbW1hbmQgcmV0dXJuIGVycm9yIGlmIHRocm93XG4gICAgY29uc3QgYXJncyA9IHBhcnNlZC5maWx0ZXIoKGUsIGkpID0+IGkgPiAwKVxuICAgIGxldCBvdXRwdXRcbiAgICB0cnkge1xuICAgICAgb3V0cHV0ID0gY29tbWFuZC5leGVjKGFyZ3MpXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuICctZmF0YWwgY29tbWFuZDogJyArIGUubWVzc2FnZVxuICAgIH1cblxuICAgIC8vICBGb3JtYXQgZGF0YSBhbmQgUmV0dXJuXG4gICAgcmV0dXJuIHRoaXMuZm9ybWF0KG91dHB1dClcbiAgfVxuXG4gIC8qXG4gICAqIEdlbmVyYXRlIEJ1aWx0aW4gQ29tbWFuZCBMaXN0XG4gICAqL1xuICByZWdpc3RlckNvbW1hbmRzKFNoZWxsUmVmZXJlbmNlLCBjdXN0b21Db21tYW5kcyA9IHVuZGVmaW5lZCkge1xuICAgIGxldCBCbHVlcHJpbnRzID0gcmVxdWlyZSgnLi4vY29uZmlncy9idWlsdGluLWNvbW1hbmRzJylcbiAgICAvKipcbiAgICAgKiBJZiBjdXN0b20gY29tbWFuZHMgYXJlIHBhc3NlZCBjaGVjayBmb3IgdmFsaWQgdHlwZVxuICAgICAqIElmIGdvb2QgdG8gZ28gZ2VuZXJhdGUgdGhvc2UgY29tbWFuZHNcbiAgICAgKi9cbiAgICBpZiAoY3VzdG9tQ29tbWFuZHMpIHtcbiAgICAgIGlmICh0eXBlb2YgY3VzdG9tQ29tbWFuZHMgPT09ICdvYmplY3QnICYmICFBcnJheS5pc0FycmF5KGN1c3RvbUNvbW1hbmRzKSkge1xuICAgICAgICBCbHVlcHJpbnRzID0gY3VzdG9tQ29tbWFuZHNcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQ3VzdG9tIGNvbW1hbmQgcHJvdmlkZWQgYXJlIG5vdCBpbiBhIHZhbGlkIGZvcm1hdC4nKVxuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IFNoZWxsQ29tbWFuZHMgPSB7fVxuICAgIE9iamVjdC5rZXlzKEJsdWVwcmludHMpLm1hcCgoa2V5KSA9PiB7XG4gICAgICBjb25zdCBjbWQgPSBCbHVlcHJpbnRzW2tleV1cbiAgICAgIGlmICh0eXBlb2YgY21kLm5hbWUgPT09ICdzdHJpbmcnICYmIHR5cGVvZiBjbWQuZm4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgY21kLnNoZWxsID0gU2hlbGxSZWZlcmVuY2VcbiAgICAgICAgU2hlbGxDb21tYW5kc1trZXldID0gbmV3IENvbW1hbmQoY21kKVxuICAgICAgfVxuICAgIH0pXG4gICAgcmV0dXJuIFNoZWxsQ29tbWFuZHNcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEludGVycHJldGVyXG4iLCJ2YXIgU2hlbGwgPSByZXF1aXJlKCcuL1NoZWxsJylcblxuLyoqXG4gKiBUZXJtaW5hbFxuICogV3JhcHBlciBvbiB0aGUgU2hlbGwgY2xhc3NcbiAqIFRoaXMgd2lsbCBvbmx5IGhhbmRsZSB0aGUgVUkgb2YgdGhlIHRlcm1pbmFsLlxuICogWW91IGNhbiB1c2UgaXQgb3IgdXNlIGRpcmVjdGx5IHRoZSBicm93c2VyLXNoZWxsLmpzXG4gKiBhbmQgY3JlYXRlIHlvdXIgY3VzdG9tIFVJIGNhbGxpbmcgYW5kIGRpc3BsYXlpbmcgdGhlIEBtZXRob2QgcnVuKCkgY29tbWFuZHNcbiAqIF9fX19fX19fX19fXG4gKiBPcHRpb25zOlxuICogIC0gZmlsZXN5c3RlbSB7T2JqZWN0fVxuICogIC0gY29tbWFuZHMge09iamVjdH1cbiAqICAtIHVzZXIge1N0cmluZ31cbiAqICAtIGhvc3RuYW1lIHtTdHJpbmd9XG4gKi9cbmNsYXNzIFRlcm1pbmFsIGV4dGVuZHMgU2hlbGx7XG4gIGNvbnN0cnVjdG9yKHNlbGVjdG9yID0gdW5kZWZpbmVkLCBvcHRpb25zID0ge30pIHtcbiAgICBzdXBlcihvcHRpb25zKSAvLyBtdXN0IHBhc3Mgb3B0aW9uIGhlcmVcblxuICAgIGlmICghc2VsZWN0b3IpIHRocm93IG5ldyBFcnJvcignTm8gd3JhcHBlciBlbGVtZW50IHNlbGVjdG9yIHByb3ZpZGVkJylcbiAgICB0cnkge1xuICAgICAgdGhpcy5jb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKVxuICAgICAgaWYgKCF0aGlzLmNvbnRhaW5lcikgdGhyb3cgbmV3IEVycm9yKCduZXcgVGVybWluYWwoKTogRE9NIGVsZW1lbnQgbm90IGZvdW5kJylcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ25ldyBUZXJtaW5hbCgpOiBOb3QgdmFsaWQgRE9NIHNlbGVjdG9yLicpXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuaW5pdCgpXG4gIH1cblxuICBpbml0KCkge1xuICAgIHRoaXMuZ2VuZXJhdGVSb3coKVxuICAgIHRoaXMuY29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGUpID0+IHtcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgIGxldCBpbnB1dCA9IHRoaXMuY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy5jdXJyZW50IC50ZXJtaW5hbC1pbnB1dCcpXG4gICAgICBpZiAoaW5wdXQpIGlucHV0LmZvY3VzKClcbiAgICB9KVxuICB9XG5cbiAgZ2VuZXJhdGVSb3coKSB7XG4gICAgdmFyIHRoYXQgPSB0aGlzXG5cbiAgICAvLyBSZW1vdmUgcHJldmlvdXMgY3VycmVudCBhY3RpdmUgcm93XG4gICAgbGV0IGN1cnJlbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuY3VycmVudC50ZXJtaW5hbC1yb3cnKVxuICAgIGlmIChjdXJyZW50KSB7XG4gICAgICBjdXJyZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2N1cnJlbnQnKVxuICAgIH1cblxuICAgIGxldCBwcmV2SW5wdXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcudGVybWluYWwtaW5wdXQnKVxuICAgIGlmIChwcmV2SW5wdXQpIHtcbiAgICAgIHByZXZJbnB1dC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXl1cCcsIHRoaXMuc3VibWl0SGFuZGxlcilcbiAgICB9XG5cbiAgICBjb25zdCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIGRpdi5jbGFzc0xpc3QuYWRkKCdjdXJyZW50JywgJ3Rlcm1pbmFsLXJvdycpXG4gICAgZGl2LmlubmVySFRNTCA9ICcnXG4gICAgZGl2LmlubmVySFRNTCArPSBgPHNwYW4gY2xhc3M9XCJ0ZXJtaW5hbC1pbmZvXCI+JHt0aGlzLnVzZXJ9QCR7dGhpcy5ob3N0bmFtZX0gLSAke3RoaXMuZnMuZ2V0Q3VycmVudERpcmVjdG9yeSgpfSDinpwgPC9zcGFuPmBcbiAgICBkaXYuaW5uZXJIVE1MICs9IGA8aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzcz1cInRlcm1pbmFsLWlucHV0XCIgc2l6ZT1cIjJcIiBzdHlsZT1cImN1cnNvcjpub25lO1wiPmBcblxuICAgIC8vIGFkZCBuZXcgcm93IGFuZCBmb2N1cyBpdFxuICAgIHRoaXMuY29udGFpbmVyLmFwcGVuZENoaWxkKGRpdilcbiAgICBsZXQgaW5wdXQgPSB0aGlzLmNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcuY3VycmVudCAudGVybWluYWwtaW5wdXQnKVxuICAgIGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgZSA9PiB0aGlzLnN1Ym1pdEhhbmRsZXIoZSkpXG4gICAgaW5wdXQuZm9jdXMoKVxuXG4gICAgcmV0dXJuIGlucHV0XG4gIH1cblxuICBnZW5lcmF0ZU91dHB1dChvdXQgPSAnJykge1xuICAgIGNvbnN0IHByZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3ByZScpXG4gICAgcHJlLnRleHRDb250ZW50ID0gb3V0XG4gICAgdGhpcy5jb250YWluZXIuYXBwZW5kQ2hpbGQocHJlKVxuICAgIHJldHVybiB0aGlzLmdlbmVyYXRlUm93KClcbiAgfVxuXG4gIGNsZWFyKCkge1xuICAgIHRoaXMuY29udGFpbmVyLmlubmVySFRNTCA9ICcnXG4gICAgcmV0dXJuIHRoaXMuZ2VuZXJhdGVSb3coKVxuICB9XG5cbiAgc3VibWl0SGFuZGxlcihlKSB7XG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuICAgIC8vIFJVTiB3aGVuIEVOVEVSIGlzIHByZXNzZWRcbiAgICBlLnRhcmdldC5zaXplID0gZS50YXJnZXQudmFsdWUubGVuZ3RoICsgMiB8fCAzXG4gICAgaWYgKGV2ZW50LndoaWNoID09IDEzIHx8IGV2ZW50LmtleUNvZGUgPT0gMTMpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgY29uc3QgY29tbWFuZCA9IGUudGFyZ2V0LnZhbHVlLnRyaW0oKVxuXG4gICAgICBpZiAoY29tbWFuZCA9PT0gJ2NsZWFyJykgcmV0dXJuIHRoaXMuY2xlYXIoKVxuXG4gICAgICAvLyBFWEVDXG4gICAgICBjb25zdCBvdXRwdXQgPSB0aGlzLnJ1bihjb21tYW5kKVxuICAgICAgLy8gaWYgaXMgYSB7UHJvbWlzZX0gcmVzb2x2ZSBpdFxuICAgICAgaWYgKG91dHB1dFsndGhlbiddKSB7XG4gICAgICAgIHJldHVybiBvdXRwdXQudGhlbihyZXMgPT4gdGhpcy5nZW5lcmF0ZU91dHB1dChyZXMpKS5jYXRjaChlcnIgPT4gdGhpcy5nZW5lcmF0ZU91dHB1dChlcnIubWVzc2FnZSkpXG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5nZW5lcmF0ZU91dHB1dChvdXRwdXQpXG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gVGVybWluYWxcbiIsImNvbnN0IEludGVycHJldGVyID0gcmVxdWlyZSgnLi9JbnRlcnByZXRlcicpXG5jb25zdCBGaWxlc3lzdGVtID0gcmVxdWlyZSgnLi9GaWxlc3lzdGVtJylcblxuLyoqXG4gKiBTaGVsbCBDbGFzcyBpbmhlcml0cyBmcm9tIEludGVycHJldGVyXG4gKiBPcHRpb25zOlxuICogIC0gZmlsZXN5c3RlbSB7T2JqZWN0fVxuICogIC0gY29tbWFuZHMge09iamVjdH1cbiAqICAtIHVzZXIge1N0cmluZ31cbiAqICAtIGhvc3RuYW1lIHtTdHJpbmd9XG4gKi9cbmNsYXNzIFNoZWxsIGV4dGVuZHMgSW50ZXJwcmV0ZXJ7XG4gIGNvbnN0cnVjdG9yKHsgZmlsZXN5c3RlbSA9IHVuZGVmaW5lZCwgY29tbWFuZHMgPSB1bmRlZmluZWQsIHVzZXIgPSAncm9vdCcsIGhvc3RuYW1lID0gJ215Lmhvc3QubWUnIH0gPSB7fSkge1xuICAgIHN1cGVyKClcblxuICAgIHRoaXMucG9seWZpbGxzKClcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSB0aGUgdmlydHVhbCBmaWxlc3lzdGVtXG4gICAgICogQHJldHVybiByZWZlcmVuY2UgdG8gaW5zdGFuY2Ugb2YgQGNsYXNzIEZpbGVzeXN0ZW1cbiAgICAgKi9cbiAgICB0aGlzLmZzID0gbmV3IEZpbGVzeXN0ZW0oZmlsZXN5c3RlbSwgdGhpcylcbiAgICB0aGlzLnVzZXIgPSB1c2VyXG4gICAgdGhpcy5ob3N0bmFtZSA9IGhvc3RuYW1lXG5cbiAgICAvLyBJbml0IGJ1aWx0aW4gY29tbWFuZHMsIEBtZXRob2QgaW4gcGFyZW50XG4gICAgLy8gcGFzcyBzaGVsbCByZWZlcmVuY2VcbiAgICB0aGlzLlNoZWxsQ29tbWFuZHMgPSB0aGlzLnJlZ2lzdGVyQ29tbWFuZHModGhpcylcbiAgICB0aGlzLlNoZWxsQ29tbWFuZHMgPSB7XG4gICAgICAuLi50aGlzLlNoZWxsQ29tbWFuZHMsXG4gICAgICAuLi50aGlzLnJlZ2lzdGVyQ29tbWFuZHModGhpcywgY29tbWFuZHMpLFxuICAgIH1cbiAgfVxuXG4gIHBvbHlmaWxscygpIHtcbiAgICBpZiAoIWdsb2JhbC5Qcm9taXNlKSB7XG4gICAgICBnbG9iYWwuUHJvbWlzZSA9IHJlcXVpcmUoJ3Byb21pc2UtcG9seWZpbGwnKS5Qcm9taXNlXG4gICAgfVxuICAgIGlmICghZ2xvYmFsLmZldGNoKSB7XG4gICAgICBnbG9iYWwuZmV0Y2ggPSByZXF1aXJlKCd3aGF0d2ctZmV0Y2gnKVxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgLyoqXG4gICAqIFBhc3MgY29udHJvbCB0byBJbnRlcnByZXRlclxuICAgKiBAcmV0dXJuIFtTdHJpbmddIE9SIHtQcm9taXNlfSB0byByZXNvbHZlIGZyb20geW91ciB3cmFwcGVyLlxuICAgKi9cbiAgcnVuKGNtZCkge1xuICAgIHJldHVybiB0aGlzLmV4ZWMoY21kKVxuICB9XG59XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShTaGVsbC5wcm90b3R5cGUsICdmcycsIHsgd3JpdGFibGU6IHRydWUsIGVudW1lcmFibGU6IGZhbHNlIH0pXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoU2hlbGwucHJvdG90eXBlLCAnU2hlbGxDb21tYW5kcycsIHsgd3JpdGFibGU6IHRydWUsIGVudW1lcmFibGU6IGZhbHNlIH0pXG5cbm1vZHVsZS5leHBvcnRzID0gU2hlbGxcbiIsImNvbnN0IHsgbmFtZSwgdmVyc2lvbiwgZGVzY3JpcHRpb24sIHJlcG9zaXRvcnksIGF1dGhvciwgbGljZW5zZSB9ID0gcmVxdWlyZSgnLi4vLi4vcGFja2FnZS5qc29uJylcbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIC8qKlxuICAgKiBIZWxwXG4gICAqIEByZXR1cm4gTGlzdCBvZiBjb21tYW5kc1xuICAgKi9cbiAgaGVscDoge1xuICAgIG5hbWU6ICdoZWxwJyxcbiAgICB0eXBlOiAnYnVpbHRpbicsXG4gICAgbWFuOiAnTGlzdCBvZiBhdmFpbGFibGUgY29tbWFuZHMnLFxuICAgIGZuOiBmdW5jdGlvbiBoZWxwKCkge1xuICAgICAgcmV0dXJuIGBDb21tYW5kcyBhdmFpbGFibGU6ICR7T2JqZWN0LmtleXModGhpcy5zaGVsbC5TaGVsbENvbW1hbmRzKS5qb2luKCcsICcpfWBcbiAgICB9XG4gIH0sXG5cbiAgd2hvYW1pOiB7XG4gICAgbmFtZTogJ3dob2FtaScsXG4gICAgdHlwZTogJ2J1aWx0aW4nLFxuICAgIG1hbjogJ0N1cnJlbnQgdXNlcicsXG4gICAgZm46IGZ1bmN0aW9uIHdob2FtaSgpIHtcbiAgICAgIHJldHVybiB0aGlzLnNoZWxsLnVzZXJcbiAgICB9LFxuICB9LFxuXG4gIGFib3V0OiB7XG4gICAgbmFtZTogJ2Fib3V0JyxcbiAgICB0eXBlOiAnYnVpbHRpbicsXG4gICAgbWFuOiAnQWJvdXQgdGhpcyBwcm9qZWN0JyxcbiAgICBmbjogZnVuY3Rpb24gYWJvdXQoKSB7XG4gICAgICBsZXQgc3RyID0gJydcbiAgICAgIHN0ciArPSBgbmFtZTogJHtuYW1lfVxcbmBcbiAgICAgIHN0ciArPSBgdmVyc2lvbjogJHt2ZXJzaW9ufVxcbmBcbiAgICAgIHN0ciArPSBgZGVzY3JpcHRpb246ICR7ZGVzY3JpcHRpb259XFxuYFxuICAgICAgc3RyICs9IGByZXBvc2l0b3J5OiAke3JlcG9zaXRvcnl9XFxuYFxuICAgICAgc3RyICs9IGBhdXRob3I6ICR7YXV0aG9yfVxcbmBcbiAgICAgIHN0ciArPSBgbGljZW5zZTogJHtsaWNlbnNlfVxcbmBcbiAgICAgIHJldHVybiBzdHJcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIFJldHVybiBwYXNzZWQgYXJndW1lbnRzLCBmb3IgdGVzdGluZyBwdXJwb3Nlc1xuICAgKi9cbiAgYXJndW1lbnRzOiB7XG4gICAgbmFtZTogJ2FyZ3VtZW50cycsXG4gICAgdHlwZTogJ2J1aWx0aW4nLFxuICAgIG1hbjogJ1JldHVybiBhcmd1bWVudCBwYXNzZWQsIHVzZWQgZm9yIHRlc3RpbmcgcHVycG9zZScsXG4gICAgZm46IGFyZ3MgPT4gYXJnc1xuICB9LFxuXG4gIC8qKlxuICAgKiBDaGFuZ2UgRGlyZWN0b3J5XG4gICAqIEByZXR1cm4gU3VjY2Vzcy9GYWlsIE1lc3NhZ2UgU3RyaW5nXG4gICAqL1xuICBjZDoge1xuICAgIG5hbWU6ICdjZCcsXG4gICAgdHlwZTogJ2J1aWx0aW4nLFxuICAgIG1hbjogJ0NoYW5nZSBkaXJlY3RvcnksIHBhc3MgYWJzb2x1dGUgb3IgcmVsYXRpdmUgcGF0aDogZWcuIGNkIC9ldGMsIGNkIC8gY2QvbXkvbmVzdGVkL2RpcicsXG4gICAgZm46IGZ1bmN0aW9uIGNkKHBhdGgpIHtcbiAgICAgIGlmICghcGF0aCkgdGhyb3cgbmV3IEVycm9yKCctaW52YWxpZCBObyBwYXRoIHByb3ZpZGVkLicpXG4gICAgICBwYXRoID0gcGF0aC5qb2luKClcbiAgICAgIHRyeXtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2hlbGwuZnMuY2hhbmdlRGlyKHBhdGgpXG4gICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgdGhyb3cgZVxuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogbHMgQ29tbWFuZFxuICAgKiBMaXN0IGRpcmVjdG9yeSBmaWxlc1xuICAgKiBAcGFyYW0gYXJyYXkgb2YgYXJnc1xuICAgKiBAcmV0dXJuIGZvcm1hdHRlZCBTdHJpbmdcbiAgICovXG4gIGxzOiB7XG4gICAgbmFtZTogJ2xzJyxcbiAgICB0eXBlOiAnYnVpbHRpbicsXG4gICAgbWFuOiAnbGlzdCBkaXJlY3RvcnkgZmlsZXMsIHBhc3MgYWJzb2x1dGUvcmVsYXRpdmUgcGF0aCwgaWYgZW1wdHkgbGlzdCBjdXJyZW50IGRpcmVjdG9yeScsXG4gICAgZm46IGZ1bmN0aW9uIGxzKHBhdGggPSBbJy4vJ10gKSB7XG4gICAgICBwYXRoID0gcGF0aC5qb2luKClcbiAgICAgIGxldCBsaXN0LCByZXNwb25zZVN0cmluZyA9ICcnXG4gICAgICB0cnl7XG4gICAgICAgIGxpc3QgPSB0aGlzLnNoZWxsLmZzLmxpc3REaXIocGF0aClcbiAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICB0aHJvdyBlXG4gICAgICB9XG4gICAgICBmb3IgKGxldCBmaWxlIGluIGxpc3QpIHtcbiAgICAgICAgaWYgKGxpc3QuaGFzT3duUHJvcGVydHkoZmlsZSkpIHtcbiAgICAgICAgICByZXNwb25zZVN0cmluZyArPSBgJHtsaXN0W2ZpbGVdLnBlcm1pc3Npb259XFx0JHtsaXN0W2ZpbGVdLnVzZXJ9ICR7bGlzdFtmaWxlXS5ncm91cH1cXHQke2xpc3RbZmlsZV0ubmFtZX1cXG5gXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiByZXNwb25zZVN0cmluZ1xuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogQ0FUIENvbW1hbmRcbiAgICogUmVhZCBGaWxlXG4gICAqIEByZXR1cm4gZm9ybWF0dGVkIFN0cmluZ1xuICAgKi9cbiAgY2F0OiB7XG4gICAgbmFtZTogJ2NhdCcsXG4gICAgdHlwZTogJ2J1aWx0aW4nLFxuICAgIG1hbjogJ1JldHVybiBmaWxlIGNvbnRlbnQsIHRha2Ugb25lIGFyZ3VtZW50OiBmaWxlIHBhdGggKHJlbGF0aXZlL2Fic29sdXRlKScsXG4gICAgZm46IGZ1bmN0aW9uKHBhdGggPSBbJy4vJ10pIHtcbiAgICAgIHBhdGggPSBwYXRoLmpvaW4oKVxuICAgICAgbGV0IGZpbGUsIHJlc3BvbnNlU3RyaW5nID0gJydcbiAgICAgIHRyeXtcbiAgICAgICAgZmlsZSA9IHRoaXMuc2hlbGwuZnMucmVhZEZpbGUocGF0aClcbiAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICB0aHJvdyBlXG4gICAgICB9XG4gICAgICByZXR1cm4gZmlsZS5jb250ZW50XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBNYW5cbiAgICogUmV0dXJuIGNvbW1hbmQgbWFudWFsIGluZm9cbiAgICogQHJldHVybiB7c3RyaW5nfVxuICAgKi9cbiAgbWFuOiB7XG4gICAgbmFtZTogJ21hbicsXG4gICAgdHlwZTogJ2J1aWx0aW4nLFxuICAgIG1hbjogJ0NvbW1hbmQgbWFudWFsLCB0YWtlcyBvbmUgYXJndW1lbnQsIGNvbW1hbmQgbmFtZScsXG4gICAgZm46IGZ1bmN0aW9uIG1hbihhcmdzKSB7XG4gICAgICBpZiAoIWFyZ3MgfHwgIWFyZ3NbMF0pIHRocm93IG5ldyBFcnJvcignbWFuOiBubyBjb21tYW5kIHByb3ZpZGVkLicpXG4gICAgICBsZXQgY29tbWFuZCA9IGFyZ3NbMF1cbiAgICAgIGlmICghdGhpcy5zaGVsbC5TaGVsbENvbW1hbmRzW2NvbW1hbmRdKSB0aHJvdyBuZXcgRXJyb3IoJ2NvbW1hbmQgZG9lc25cXCd0IGV4aXN0LicpXG4gICAgICBpZiAoIXRoaXMuc2hlbGwuU2hlbGxDb21tYW5kc1tjb21tYW5kXS5tYW4pIHRocm93IG5ldyBFcnJvcignbm8gbWFudWFsIGVudHJ5IGZvciB0aGlzIGNvbW1hbmQuJylcbiAgICAgIHJldHVybiB0aGlzLnNoZWxsLlNoZWxsQ29tbWFuZHNbY29tbWFuZF0ubWFuXG4gICAgfSxcbiAgfSxcblxuICAvKipcbiAgICogSFRUUFxuICAgKiBSZXR1cm4gY29tbWFuZCBtYW51YWwgaW5mb1xuICAgKiBAcmV0dXJuIHtzdHJpbmd9XG4gICAqL1xuICBodHRwOiB7XG4gICAgbmFtZTogJ2h0dHAnLFxuICAgIHR5cGU6ICdidWlsdGluJyxcbiAgICBtYW46ICdTZW5kIGh0dHAgcmVxdWVzdHMuXFxuIHN5bnRheDogaHR0cCBNRVRIT0QgVVJMLlxcbmVnOiBodHRwIEdFVCB3d3cuZ29vZ2xlLmNvbVxcbkdFVCBNZXRob2QgY2FuIGJlIG9taXR0ZWQnLFxuICAgIGZuOiBmdW5jdGlvbiBodHRwKGFyZ3MgPSBbXSkge1xuICAgICAgY29uc29sZS5sb2coYXJncylcbiAgICAgIHJldHVyblxuICAgICAgaWYgKCFhcmdzIHx8ICFhcmdzLmxlbmd0aCkgdGhyb3cgbmV3IEVycm9yKGBodHRwOiBubyBwYXJhbWV0ZXJzIHByb3ZpZGVkLCBwcm92aWRlIFVSTCBhbmQvb3IgbWV0aG9kIFxcbiBoZWxwOiAke3RoaXMuc2hlbGwuU2hlbGxDb21tYW5kc1snaHR0cCddLm1hbn1gKVxuICAgICAgcmV0dXJuIGZldGNoKCdodHRwOi8vd3d3Lmdvb2dsZS5jb20nLCB7XG4gICAgICAgIG1ldGhvZDogJ1BPU1QnXG4gICAgICB9KS50aGVuKChyZXMpID0+IHtcbiAgICAgICAgaWYgKHJlcy5vaykgcmV0dXJuIHJlcy5qc29uKClcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBSZXF1ZXN0IEZhaWxlciAoJHtyZXMuc3RhdHVzIHx8IDUwMH0pOiAke3Jlcy5zdGF0dXNUZXh0IHx8ICdTb21lIEVycm9yIE9jY3VyZWQuJ31gKVxuICAgICAgfSkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFJlcXVlc3QgRmFpbGVyICgke2Vyci5zdGF0dXMgfHwgNTAwfSk6ICR7ZXJyLnN0YXR1c1RleHQgfHwgJ1NvbWUgRXJyb3IgT2NjdXJlZC4nfWApXG4gICAgICB9KVxuICAgIH0sXG4gIH0sXG5cbn1cbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuXG4gICdmaWxlLmgnOiAnI2luY2x1ZGUgPG5vcGUuaD4nLFxuXG4gIGV0Yzoge1xuICAgIGFwYWNoZTI6IHtcbiAgICAgICdhcGFjaGUyLmNvbmYnOiAnTm90IFdoYXQgeW91IHdlcmUgbG9va2luZyBmb3IgOiknLFxuICAgIH0sXG4gIH0sXG5cbiAgaG9tZToge1xuICAgIGd1ZXN0OiB7XG4gICAgICBkb2NzOiB7XG4gICAgICAgICdteWRvYy5tZCc6ICdUZXN0RmlsZScsXG4gICAgICAgICdteWRvYzIubWQnOiAnVGVzdEZpbGUyJyxcbiAgICAgICAgJ215ZG9jMy5tZCc6ICdUZXN0RmlsZTMnLFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuXG4gIHJvb3Q6e1xuICAgICcuenNocmMnOiAnbm90IGV2ZW4gY2xvc2UgOiknLFxuICAgICcub2gtbXktenNoJzoge1xuICAgICAgdGhlbWVzOiB7fSxcbiAgICB9LFxuICB9LFxufVxuIiwiLyoqXG4gKiBTaGVsbCBPbmx5XG4gKiBAdHlwZSB7Q2xhc3N9XG4gKiBJbml0IHRoZSBzaGVsbCB3aXRoIGNvbW1hbmQgYW5kIGZpbGVzeXN0ZW1cbiAqIEBtZXRob2QgZXhlY3V0ZSgpIGV4cG9zZWQgdG8gcXVlcnkgdGhlIFNoZWxsIHdpdGggY29tbWFuZHNcbiAqL1xuZ2xvYmFsWydUZXJtbHlQcm9tcHQnXSA9IHJlcXVpcmUoJy4vY2xhc3Nlcy9Qcm9tcHQnKVxuIiwiKGZ1bmN0aW9uIChyb290KSB7XG5cbiAgLy8gU3RvcmUgc2V0VGltZW91dCByZWZlcmVuY2Ugc28gcHJvbWlzZS1wb2x5ZmlsbCB3aWxsIGJlIHVuYWZmZWN0ZWQgYnlcbiAgLy8gb3RoZXIgY29kZSBtb2RpZnlpbmcgc2V0VGltZW91dCAobGlrZSBzaW5vbi51c2VGYWtlVGltZXJzKCkpXG4gIHZhciBzZXRUaW1lb3V0RnVuYyA9IHNldFRpbWVvdXQ7XG5cbiAgZnVuY3Rpb24gbm9vcCgpIHt9XG4gIFxuICAvLyBQb2x5ZmlsbCBmb3IgRnVuY3Rpb24ucHJvdG90eXBlLmJpbmRcbiAgZnVuY3Rpb24gYmluZChmbiwgdGhpc0FyZykge1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICBmbi5hcHBseSh0aGlzQXJnLCBhcmd1bWVudHMpO1xuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBQcm9taXNlKGZuKSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzICE9PSAnb2JqZWN0JykgdGhyb3cgbmV3IFR5cGVFcnJvcignUHJvbWlzZXMgbXVzdCBiZSBjb25zdHJ1Y3RlZCB2aWEgbmV3Jyk7XG4gICAgaWYgKHR5cGVvZiBmbiAhPT0gJ2Z1bmN0aW9uJykgdGhyb3cgbmV3IFR5cGVFcnJvcignbm90IGEgZnVuY3Rpb24nKTtcbiAgICB0aGlzLl9zdGF0ZSA9IDA7XG4gICAgdGhpcy5faGFuZGxlZCA9IGZhbHNlO1xuICAgIHRoaXMuX3ZhbHVlID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuX2RlZmVycmVkcyA9IFtdO1xuXG4gICAgZG9SZXNvbHZlKGZuLCB0aGlzKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGhhbmRsZShzZWxmLCBkZWZlcnJlZCkge1xuICAgIHdoaWxlIChzZWxmLl9zdGF0ZSA9PT0gMykge1xuICAgICAgc2VsZiA9IHNlbGYuX3ZhbHVlO1xuICAgIH1cbiAgICBpZiAoc2VsZi5fc3RhdGUgPT09IDApIHtcbiAgICAgIHNlbGYuX2RlZmVycmVkcy5wdXNoKGRlZmVycmVkKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgc2VsZi5faGFuZGxlZCA9IHRydWU7XG4gICAgUHJvbWlzZS5faW1tZWRpYXRlRm4oZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGNiID0gc2VsZi5fc3RhdGUgPT09IDEgPyBkZWZlcnJlZC5vbkZ1bGZpbGxlZCA6IGRlZmVycmVkLm9uUmVqZWN0ZWQ7XG4gICAgICBpZiAoY2IgPT09IG51bGwpIHtcbiAgICAgICAgKHNlbGYuX3N0YXRlID09PSAxID8gcmVzb2x2ZSA6IHJlamVjdCkoZGVmZXJyZWQucHJvbWlzZSwgc2VsZi5fdmFsdWUpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB2YXIgcmV0O1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0ID0gY2Ioc2VsZi5fdmFsdWUpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICByZWplY3QoZGVmZXJyZWQucHJvbWlzZSwgZSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHJlc29sdmUoZGVmZXJyZWQucHJvbWlzZSwgcmV0KTtcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlc29sdmUoc2VsZiwgbmV3VmFsdWUpIHtcbiAgICB0cnkge1xuICAgICAgLy8gUHJvbWlzZSBSZXNvbHV0aW9uIFByb2NlZHVyZTogaHR0cHM6Ly9naXRodWIuY29tL3Byb21pc2VzLWFwbHVzL3Byb21pc2VzLXNwZWMjdGhlLXByb21pc2UtcmVzb2x1dGlvbi1wcm9jZWR1cmVcbiAgICAgIGlmIChuZXdWYWx1ZSA9PT0gc2VsZikgdGhyb3cgbmV3IFR5cGVFcnJvcignQSBwcm9taXNlIGNhbm5vdCBiZSByZXNvbHZlZCB3aXRoIGl0c2VsZi4nKTtcbiAgICAgIGlmIChuZXdWYWx1ZSAmJiAodHlwZW9mIG5ld1ZhbHVlID09PSAnb2JqZWN0JyB8fCB0eXBlb2YgbmV3VmFsdWUgPT09ICdmdW5jdGlvbicpKSB7XG4gICAgICAgIHZhciB0aGVuID0gbmV3VmFsdWUudGhlbjtcbiAgICAgICAgaWYgKG5ld1ZhbHVlIGluc3RhbmNlb2YgUHJvbWlzZSkge1xuICAgICAgICAgIHNlbGYuX3N0YXRlID0gMztcbiAgICAgICAgICBzZWxmLl92YWx1ZSA9IG5ld1ZhbHVlO1xuICAgICAgICAgIGZpbmFsZShzZWxmKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoZW4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICBkb1Jlc29sdmUoYmluZCh0aGVuLCBuZXdWYWx1ZSksIHNlbGYpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgc2VsZi5fc3RhdGUgPSAxO1xuICAgICAgc2VsZi5fdmFsdWUgPSBuZXdWYWx1ZTtcbiAgICAgIGZpbmFsZShzZWxmKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZWplY3Qoc2VsZiwgZSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gcmVqZWN0KHNlbGYsIG5ld1ZhbHVlKSB7XG4gICAgc2VsZi5fc3RhdGUgPSAyO1xuICAgIHNlbGYuX3ZhbHVlID0gbmV3VmFsdWU7XG4gICAgZmluYWxlKHNlbGYpO1xuICB9XG5cbiAgZnVuY3Rpb24gZmluYWxlKHNlbGYpIHtcbiAgICBpZiAoc2VsZi5fc3RhdGUgPT09IDIgJiYgc2VsZi5fZGVmZXJyZWRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgUHJvbWlzZS5faW1tZWRpYXRlRm4oZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICghc2VsZi5faGFuZGxlZCkge1xuICAgICAgICAgIFByb21pc2UuX3VuaGFuZGxlZFJlamVjdGlvbkZuKHNlbGYuX3ZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHNlbGYuX2RlZmVycmVkcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgaGFuZGxlKHNlbGYsIHNlbGYuX2RlZmVycmVkc1tpXSk7XG4gICAgfVxuICAgIHNlbGYuX2RlZmVycmVkcyA9IG51bGw7XG4gIH1cblxuICBmdW5jdGlvbiBIYW5kbGVyKG9uRnVsZmlsbGVkLCBvblJlamVjdGVkLCBwcm9taXNlKSB7XG4gICAgdGhpcy5vbkZ1bGZpbGxlZCA9IHR5cGVvZiBvbkZ1bGZpbGxlZCA9PT0gJ2Z1bmN0aW9uJyA/IG9uRnVsZmlsbGVkIDogbnVsbDtcbiAgICB0aGlzLm9uUmVqZWN0ZWQgPSB0eXBlb2Ygb25SZWplY3RlZCA9PT0gJ2Z1bmN0aW9uJyA/IG9uUmVqZWN0ZWQgOiBudWxsO1xuICAgIHRoaXMucHJvbWlzZSA9IHByb21pc2U7XG4gIH1cblxuICAvKipcbiAgICogVGFrZSBhIHBvdGVudGlhbGx5IG1pc2JlaGF2aW5nIHJlc29sdmVyIGZ1bmN0aW9uIGFuZCBtYWtlIHN1cmVcbiAgICogb25GdWxmaWxsZWQgYW5kIG9uUmVqZWN0ZWQgYXJlIG9ubHkgY2FsbGVkIG9uY2UuXG4gICAqXG4gICAqIE1ha2VzIG5vIGd1YXJhbnRlZXMgYWJvdXQgYXN5bmNocm9ueS5cbiAgICovXG4gIGZ1bmN0aW9uIGRvUmVzb2x2ZShmbiwgc2VsZikge1xuICAgIHZhciBkb25lID0gZmFsc2U7XG4gICAgdHJ5IHtcbiAgICAgIGZuKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICBpZiAoZG9uZSkgcmV0dXJuO1xuICAgICAgICBkb25lID0gdHJ1ZTtcbiAgICAgICAgcmVzb2x2ZShzZWxmLCB2YWx1ZSk7XG4gICAgICB9LCBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICAgIGlmIChkb25lKSByZXR1cm47XG4gICAgICAgIGRvbmUgPSB0cnVlO1xuICAgICAgICByZWplY3Qoc2VsZiwgcmVhc29uKTtcbiAgICAgIH0pO1xuICAgIH0gY2F0Y2ggKGV4KSB7XG4gICAgICBpZiAoZG9uZSkgcmV0dXJuO1xuICAgICAgZG9uZSA9IHRydWU7XG4gICAgICByZWplY3Qoc2VsZiwgZXgpO1xuICAgIH1cbiAgfVxuXG4gIFByb21pc2UucHJvdG90eXBlWydjYXRjaCddID0gZnVuY3Rpb24gKG9uUmVqZWN0ZWQpIHtcbiAgICByZXR1cm4gdGhpcy50aGVuKG51bGwsIG9uUmVqZWN0ZWQpO1xuICB9O1xuXG4gIFByb21pc2UucHJvdG90eXBlLnRoZW4gPSBmdW5jdGlvbiAob25GdWxmaWxsZWQsIG9uUmVqZWN0ZWQpIHtcbiAgICB2YXIgcHJvbSA9IG5ldyAodGhpcy5jb25zdHJ1Y3Rvcikobm9vcCk7XG5cbiAgICBoYW5kbGUodGhpcywgbmV3IEhhbmRsZXIob25GdWxmaWxsZWQsIG9uUmVqZWN0ZWQsIHByb20pKTtcbiAgICByZXR1cm4gcHJvbTtcbiAgfTtcblxuICBQcm9taXNlLmFsbCA9IGZ1bmN0aW9uIChhcnIpIHtcbiAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFycik7XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgaWYgKGFyZ3MubGVuZ3RoID09PSAwKSByZXR1cm4gcmVzb2x2ZShbXSk7XG4gICAgICB2YXIgcmVtYWluaW5nID0gYXJncy5sZW5ndGg7XG5cbiAgICAgIGZ1bmN0aW9uIHJlcyhpLCB2YWwpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBpZiAodmFsICYmICh0eXBlb2YgdmFsID09PSAnb2JqZWN0JyB8fCB0eXBlb2YgdmFsID09PSAnZnVuY3Rpb24nKSkge1xuICAgICAgICAgICAgdmFyIHRoZW4gPSB2YWwudGhlbjtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdGhlbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICB0aGVuLmNhbGwodmFsLCBmdW5jdGlvbiAodmFsKSB7XG4gICAgICAgICAgICAgICAgcmVzKGksIHZhbCk7XG4gICAgICAgICAgICAgIH0sIHJlamVjdCk7XG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgYXJnc1tpXSA9IHZhbDtcbiAgICAgICAgICBpZiAoLS1yZW1haW5pbmcgPT09IDApIHtcbiAgICAgICAgICAgIHJlc29sdmUoYXJncyk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChleCkge1xuICAgICAgICAgIHJlamVjdChleCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHJlcyhpLCBhcmdzW2ldKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcblxuICBQcm9taXNlLnJlc29sdmUgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICBpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZS5jb25zdHJ1Y3RvciA9PT0gUHJvbWlzZSkge1xuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSkge1xuICAgICAgcmVzb2x2ZSh2YWx1ZSk7XG4gICAgfSk7XG4gIH07XG5cbiAgUHJvbWlzZS5yZWplY3QgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgcmVqZWN0KHZhbHVlKTtcbiAgICB9KTtcbiAgfTtcblxuICBQcm9taXNlLnJhY2UgPSBmdW5jdGlvbiAodmFsdWVzKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSB2YWx1ZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgdmFsdWVzW2ldLnRoZW4ocmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcblxuICAvLyBVc2UgcG9seWZpbGwgZm9yIHNldEltbWVkaWF0ZSBmb3IgcGVyZm9ybWFuY2UgZ2FpbnNcbiAgUHJvbWlzZS5faW1tZWRpYXRlRm4gPSAodHlwZW9mIHNldEltbWVkaWF0ZSA9PT0gJ2Z1bmN0aW9uJyAmJiBmdW5jdGlvbiAoZm4pIHsgc2V0SW1tZWRpYXRlKGZuKTsgfSkgfHxcbiAgICBmdW5jdGlvbiAoZm4pIHtcbiAgICAgIHNldFRpbWVvdXRGdW5jKGZuLCAwKTtcbiAgICB9O1xuXG4gIFByb21pc2UuX3VuaGFuZGxlZFJlamVjdGlvbkZuID0gZnVuY3Rpb24gX3VuaGFuZGxlZFJlamVjdGlvbkZuKGVycikge1xuICAgIGlmICh0eXBlb2YgY29uc29sZSAhPT0gJ3VuZGVmaW5lZCcgJiYgY29uc29sZSkge1xuICAgICAgY29uc29sZS53YXJuKCdQb3NzaWJsZSBVbmhhbmRsZWQgUHJvbWlzZSBSZWplY3Rpb246JywgZXJyKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1jb25zb2xlXG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBTZXQgdGhlIGltbWVkaWF0ZSBmdW5jdGlvbiB0byBleGVjdXRlIGNhbGxiYWNrc1xuICAgKiBAcGFyYW0gZm4ge2Z1bmN0aW9ufSBGdW5jdGlvbiB0byBleGVjdXRlXG4gICAqIEBkZXByZWNhdGVkXG4gICAqL1xuICBQcm9taXNlLl9zZXRJbW1lZGlhdGVGbiA9IGZ1bmN0aW9uIF9zZXRJbW1lZGlhdGVGbihmbikge1xuICAgIFByb21pc2UuX2ltbWVkaWF0ZUZuID0gZm47XG4gIH07XG5cbiAgLyoqXG4gICAqIENoYW5nZSB0aGUgZnVuY3Rpb24gdG8gZXhlY3V0ZSBvbiB1bmhhbmRsZWQgcmVqZWN0aW9uXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IGZuIEZ1bmN0aW9uIHRvIGV4ZWN1dGUgb24gdW5oYW5kbGVkIHJlamVjdGlvblxuICAgKiBAZGVwcmVjYXRlZFxuICAgKi9cbiAgUHJvbWlzZS5fc2V0VW5oYW5kbGVkUmVqZWN0aW9uRm4gPSBmdW5jdGlvbiBfc2V0VW5oYW5kbGVkUmVqZWN0aW9uRm4oZm4pIHtcbiAgICBQcm9taXNlLl91bmhhbmRsZWRSZWplY3Rpb25GbiA9IGZuO1xuICB9O1xuICBcbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBQcm9taXNlO1xuICB9IGVsc2UgaWYgKCFyb290LlByb21pc2UpIHtcbiAgICByb290LlByb21pc2UgPSBQcm9taXNlO1xuICB9XG5cbn0pKHRoaXMpO1xuIiwiKGZ1bmN0aW9uKHNlbGYpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIGlmIChzZWxmLmZldGNoKSB7XG4gICAgcmV0dXJuXG4gIH1cblxuICB2YXIgc3VwcG9ydCA9IHtcbiAgICBzZWFyY2hQYXJhbXM6ICdVUkxTZWFyY2hQYXJhbXMnIGluIHNlbGYsXG4gICAgaXRlcmFibGU6ICdTeW1ib2wnIGluIHNlbGYgJiYgJ2l0ZXJhdG9yJyBpbiBTeW1ib2wsXG4gICAgYmxvYjogJ0ZpbGVSZWFkZXInIGluIHNlbGYgJiYgJ0Jsb2InIGluIHNlbGYgJiYgKGZ1bmN0aW9uKCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgbmV3IEJsb2IoKVxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuICAgIH0pKCksXG4gICAgZm9ybURhdGE6ICdGb3JtRGF0YScgaW4gc2VsZixcbiAgICBhcnJheUJ1ZmZlcjogJ0FycmF5QnVmZmVyJyBpbiBzZWxmXG4gIH1cblxuICBpZiAoc3VwcG9ydC5hcnJheUJ1ZmZlcikge1xuICAgIHZhciB2aWV3Q2xhc3NlcyA9IFtcbiAgICAgICdbb2JqZWN0IEludDhBcnJheV0nLFxuICAgICAgJ1tvYmplY3QgVWludDhBcnJheV0nLFxuICAgICAgJ1tvYmplY3QgVWludDhDbGFtcGVkQXJyYXldJyxcbiAgICAgICdbb2JqZWN0IEludDE2QXJyYXldJyxcbiAgICAgICdbb2JqZWN0IFVpbnQxNkFycmF5XScsXG4gICAgICAnW29iamVjdCBJbnQzMkFycmF5XScsXG4gICAgICAnW29iamVjdCBVaW50MzJBcnJheV0nLFxuICAgICAgJ1tvYmplY3QgRmxvYXQzMkFycmF5XScsXG4gICAgICAnW29iamVjdCBGbG9hdDY0QXJyYXldJ1xuICAgIF1cblxuICAgIHZhciBpc0RhdGFWaWV3ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gb2JqICYmIERhdGFWaWV3LnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKG9iailcbiAgICB9XG5cbiAgICB2YXIgaXNBcnJheUJ1ZmZlclZpZXcgPSBBcnJheUJ1ZmZlci5pc1ZpZXcgfHwgZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gb2JqICYmIHZpZXdDbGFzc2VzLmluZGV4T2YoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikpID4gLTFcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBub3JtYWxpemVOYW1lKG5hbWUpIHtcbiAgICBpZiAodHlwZW9mIG5hbWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICBuYW1lID0gU3RyaW5nKG5hbWUpXG4gICAgfVxuICAgIGlmICgvW15hLXowLTlcXC0jJCUmJyorLlxcXl9gfH5dL2kudGVzdChuYW1lKSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSW52YWxpZCBjaGFyYWN0ZXIgaW4gaGVhZGVyIGZpZWxkIG5hbWUnKVxuICAgIH1cbiAgICByZXR1cm4gbmFtZS50b0xvd2VyQ2FzZSgpXG4gIH1cblxuICBmdW5jdGlvbiBub3JtYWxpemVWYWx1ZSh2YWx1ZSkge1xuICAgIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICB2YWx1ZSA9IFN0cmluZyh2YWx1ZSlcbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlXG4gIH1cblxuICAvLyBCdWlsZCBhIGRlc3RydWN0aXZlIGl0ZXJhdG9yIGZvciB0aGUgdmFsdWUgbGlzdFxuICBmdW5jdGlvbiBpdGVyYXRvckZvcihpdGVtcykge1xuICAgIHZhciBpdGVyYXRvciA9IHtcbiAgICAgIG5leHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgdmFsdWUgPSBpdGVtcy5zaGlmdCgpXG4gICAgICAgIHJldHVybiB7ZG9uZTogdmFsdWUgPT09IHVuZGVmaW5lZCwgdmFsdWU6IHZhbHVlfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChzdXBwb3J0Lml0ZXJhYmxlKSB7XG4gICAgICBpdGVyYXRvcltTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBpdGVyYXRvclxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBpdGVyYXRvclxuICB9XG5cbiAgZnVuY3Rpb24gSGVhZGVycyhoZWFkZXJzKSB7XG4gICAgdGhpcy5tYXAgPSB7fVxuXG4gICAgaWYgKGhlYWRlcnMgaW5zdGFuY2VvZiBIZWFkZXJzKSB7XG4gICAgICBoZWFkZXJzLmZvckVhY2goZnVuY3Rpb24odmFsdWUsIG5hbWUpIHtcbiAgICAgICAgdGhpcy5hcHBlbmQobmFtZSwgdmFsdWUpXG4gICAgICB9LCB0aGlzKVxuXG4gICAgfSBlbHNlIGlmIChoZWFkZXJzKSB7XG4gICAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhoZWFkZXJzKS5mb3JFYWNoKGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgICAgdGhpcy5hcHBlbmQobmFtZSwgaGVhZGVyc1tuYW1lXSlcbiAgICAgIH0sIHRoaXMpXG4gICAgfVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuYXBwZW5kID0gZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgICBuYW1lID0gbm9ybWFsaXplTmFtZShuYW1lKVxuICAgIHZhbHVlID0gbm9ybWFsaXplVmFsdWUodmFsdWUpXG4gICAgdmFyIG9sZFZhbHVlID0gdGhpcy5tYXBbbmFtZV1cbiAgICB0aGlzLm1hcFtuYW1lXSA9IG9sZFZhbHVlID8gb2xkVmFsdWUrJywnK3ZhbHVlIDogdmFsdWVcbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlWydkZWxldGUnXSA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICBkZWxldGUgdGhpcy5tYXBbbm9ybWFsaXplTmFtZShuYW1lKV1cbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICBuYW1lID0gbm9ybWFsaXplTmFtZShuYW1lKVxuICAgIHJldHVybiB0aGlzLmhhcyhuYW1lKSA/IHRoaXMubWFwW25hbWVdIDogbnVsbFxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuaGFzID0gZnVuY3Rpb24obmFtZSkge1xuICAgIHJldHVybiB0aGlzLm1hcC5oYXNPd25Qcm9wZXJ0eShub3JtYWxpemVOYW1lKG5hbWUpKVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgICB0aGlzLm1hcFtub3JtYWxpemVOYW1lKG5hbWUpXSA9IG5vcm1hbGl6ZVZhbHVlKHZhbHVlKVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuZm9yRWFjaCA9IGZ1bmN0aW9uKGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gICAgZm9yICh2YXIgbmFtZSBpbiB0aGlzLm1hcCkge1xuICAgICAgaWYgKHRoaXMubWFwLmhhc093blByb3BlcnR5KG5hbWUpKSB7XG4gICAgICAgIGNhbGxiYWNrLmNhbGwodGhpc0FyZywgdGhpcy5tYXBbbmFtZV0sIG5hbWUsIHRoaXMpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUua2V5cyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpdGVtcyA9IFtdXG4gICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlLCBuYW1lKSB7IGl0ZW1zLnB1c2gobmFtZSkgfSlcbiAgICByZXR1cm4gaXRlcmF0b3JGb3IoaXRlbXMpXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS52YWx1ZXMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaXRlbXMgPSBbXVxuICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSkgeyBpdGVtcy5wdXNoKHZhbHVlKSB9KVxuICAgIHJldHVybiBpdGVyYXRvckZvcihpdGVtcylcbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmVudHJpZXMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaXRlbXMgPSBbXVxuICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwgbmFtZSkgeyBpdGVtcy5wdXNoKFtuYW1lLCB2YWx1ZV0pIH0pXG4gICAgcmV0dXJuIGl0ZXJhdG9yRm9yKGl0ZW1zKVxuICB9XG5cbiAgaWYgKHN1cHBvcnQuaXRlcmFibGUpIHtcbiAgICBIZWFkZXJzLnByb3RvdHlwZVtTeW1ib2wuaXRlcmF0b3JdID0gSGVhZGVycy5wcm90b3R5cGUuZW50cmllc1xuICB9XG5cbiAgZnVuY3Rpb24gY29uc3VtZWQoYm9keSkge1xuICAgIGlmIChib2R5LmJvZHlVc2VkKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IFR5cGVFcnJvcignQWxyZWFkeSByZWFkJykpXG4gICAgfVxuICAgIGJvZHkuYm9keVVzZWQgPSB0cnVlXG4gIH1cblxuICBmdW5jdGlvbiBmaWxlUmVhZGVyUmVhZHkocmVhZGVyKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgcmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXNvbHZlKHJlYWRlci5yZXN1bHQpXG4gICAgICB9XG4gICAgICByZWFkZXIub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZWplY3QocmVhZGVyLmVycm9yKVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICBmdW5jdGlvbiByZWFkQmxvYkFzQXJyYXlCdWZmZXIoYmxvYikge1xuICAgIHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpXG4gICAgdmFyIHByb21pc2UgPSBmaWxlUmVhZGVyUmVhZHkocmVhZGVyKVxuICAgIHJlYWRlci5yZWFkQXNBcnJheUJ1ZmZlcihibG9iKVxuICAgIHJldHVybiBwcm9taXNlXG4gIH1cblxuICBmdW5jdGlvbiByZWFkQmxvYkFzVGV4dChibG9iKSB7XG4gICAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKClcbiAgICB2YXIgcHJvbWlzZSA9IGZpbGVSZWFkZXJSZWFkeShyZWFkZXIpXG4gICAgcmVhZGVyLnJlYWRBc1RleHQoYmxvYilcbiAgICByZXR1cm4gcHJvbWlzZVxuICB9XG5cbiAgZnVuY3Rpb24gcmVhZEFycmF5QnVmZmVyQXNUZXh0KGJ1Zikge1xuICAgIHZhciB2aWV3ID0gbmV3IFVpbnQ4QXJyYXkoYnVmKVxuICAgIHZhciBjaGFycyA9IG5ldyBBcnJheSh2aWV3Lmxlbmd0aClcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdmlldy5sZW5ndGg7IGkrKykge1xuICAgICAgY2hhcnNbaV0gPSBTdHJpbmcuZnJvbUNoYXJDb2RlKHZpZXdbaV0pXG4gICAgfVxuICAgIHJldHVybiBjaGFycy5qb2luKCcnKVxuICB9XG5cbiAgZnVuY3Rpb24gYnVmZmVyQ2xvbmUoYnVmKSB7XG4gICAgaWYgKGJ1Zi5zbGljZSkge1xuICAgICAgcmV0dXJuIGJ1Zi5zbGljZSgwKVxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgdmlldyA9IG5ldyBVaW50OEFycmF5KGJ1Zi5ieXRlTGVuZ3RoKVxuICAgICAgdmlldy5zZXQobmV3IFVpbnQ4QXJyYXkoYnVmKSlcbiAgICAgIHJldHVybiB2aWV3LmJ1ZmZlclxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIEJvZHkoKSB7XG4gICAgdGhpcy5ib2R5VXNlZCA9IGZhbHNlXG5cbiAgICB0aGlzLl9pbml0Qm9keSA9IGZ1bmN0aW9uKGJvZHkpIHtcbiAgICAgIHRoaXMuX2JvZHlJbml0ID0gYm9keVxuICAgICAgaWYgKCFib2R5KSB7XG4gICAgICAgIHRoaXMuX2JvZHlUZXh0ID0gJydcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGJvZHkgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRoaXMuX2JvZHlUZXh0ID0gYm9keVxuICAgICAgfSBlbHNlIGlmIChzdXBwb3J0LmJsb2IgJiYgQmxvYi5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSkge1xuICAgICAgICB0aGlzLl9ib2R5QmxvYiA9IGJvZHlcbiAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5mb3JtRGF0YSAmJiBGb3JtRGF0YS5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSkge1xuICAgICAgICB0aGlzLl9ib2R5Rm9ybURhdGEgPSBib2R5XG4gICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuc2VhcmNoUGFyYW1zICYmIFVSTFNlYXJjaFBhcmFtcy5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSkge1xuICAgICAgICB0aGlzLl9ib2R5VGV4dCA9IGJvZHkudG9TdHJpbmcoKVxuICAgICAgfSBlbHNlIGlmIChzdXBwb3J0LmFycmF5QnVmZmVyICYmIHN1cHBvcnQuYmxvYiAmJiBpc0RhdGFWaWV3KGJvZHkpKSB7XG4gICAgICAgIHRoaXMuX2JvZHlBcnJheUJ1ZmZlciA9IGJ1ZmZlckNsb25lKGJvZHkuYnVmZmVyKVxuICAgICAgICAvLyBJRSAxMC0xMSBjYW4ndCBoYW5kbGUgYSBEYXRhVmlldyBib2R5LlxuICAgICAgICB0aGlzLl9ib2R5SW5pdCA9IG5ldyBCbG9iKFt0aGlzLl9ib2R5QXJyYXlCdWZmZXJdKVxuICAgICAgfSBlbHNlIGlmIChzdXBwb3J0LmFycmF5QnVmZmVyICYmIChBcnJheUJ1ZmZlci5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSB8fCBpc0FycmF5QnVmZmVyVmlldyhib2R5KSkpIHtcbiAgICAgICAgdGhpcy5fYm9keUFycmF5QnVmZmVyID0gYnVmZmVyQ2xvbmUoYm9keSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcigndW5zdXBwb3J0ZWQgQm9keUluaXQgdHlwZScpXG4gICAgICB9XG5cbiAgICAgIGlmICghdGhpcy5oZWFkZXJzLmdldCgnY29udGVudC10eXBlJykpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBib2R5ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIHRoaXMuaGVhZGVycy5zZXQoJ2NvbnRlbnQtdHlwZScsICd0ZXh0L3BsYWluO2NoYXJzZXQ9VVRGLTgnKVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2JvZHlCbG9iICYmIHRoaXMuX2JvZHlCbG9iLnR5cGUpIHtcbiAgICAgICAgICB0aGlzLmhlYWRlcnMuc2V0KCdjb250ZW50LXR5cGUnLCB0aGlzLl9ib2R5QmxvYi50eXBlKVxuICAgICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuc2VhcmNoUGFyYW1zICYmIFVSTFNlYXJjaFBhcmFtcy5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSkge1xuICAgICAgICAgIHRoaXMuaGVhZGVycy5zZXQoJ2NvbnRlbnQtdHlwZScsICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQ7Y2hhcnNldD1VVEYtOCcpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoc3VwcG9ydC5ibG9iKSB7XG4gICAgICB0aGlzLmJsb2IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHJlamVjdGVkID0gY29uc3VtZWQodGhpcylcbiAgICAgICAgaWYgKHJlamVjdGVkKSB7XG4gICAgICAgICAgcmV0dXJuIHJlamVjdGVkXG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5fYm9keUJsb2IpIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMuX2JvZHlCbG9iKVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2JvZHlBcnJheUJ1ZmZlcikge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobmV3IEJsb2IoW3RoaXMuX2JvZHlBcnJheUJ1ZmZlcl0pKVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2JvZHlGb3JtRGF0YSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignY291bGQgbm90IHJlYWQgRm9ybURhdGEgYm9keSBhcyBibG9iJylcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG5ldyBCbG9iKFt0aGlzLl9ib2R5VGV4dF0pKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMuYXJyYXlCdWZmZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMuX2JvZHlBcnJheUJ1ZmZlcikge1xuICAgICAgICAgIHJldHVybiBjb25zdW1lZCh0aGlzKSB8fCBQcm9taXNlLnJlc29sdmUodGhpcy5fYm9keUFycmF5QnVmZmVyKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB0aGlzLmJsb2IoKS50aGVuKHJlYWRCbG9iQXNBcnJheUJ1ZmZlcilcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMudGV4dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHJlamVjdGVkID0gY29uc3VtZWQodGhpcylcbiAgICAgIGlmIChyZWplY3RlZCkge1xuICAgICAgICByZXR1cm4gcmVqZWN0ZWRcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuX2JvZHlCbG9iKSB7XG4gICAgICAgIHJldHVybiByZWFkQmxvYkFzVGV4dCh0aGlzLl9ib2R5QmxvYilcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5fYm9keUFycmF5QnVmZmVyKSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUocmVhZEFycmF5QnVmZmVyQXNUZXh0KHRoaXMuX2JvZHlBcnJheUJ1ZmZlcikpXG4gICAgICB9IGVsc2UgaWYgKHRoaXMuX2JvZHlGb3JtRGF0YSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NvdWxkIG5vdCByZWFkIEZvcm1EYXRhIGJvZHkgYXMgdGV4dCcpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMuX2JvZHlUZXh0KVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChzdXBwb3J0LmZvcm1EYXRhKSB7XG4gICAgICB0aGlzLmZvcm1EYXRhID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRleHQoKS50aGVuKGRlY29kZSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmpzb24gPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLnRleHQoKS50aGVuKEpTT04ucGFyc2UpXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIC8vIEhUVFAgbWV0aG9kcyB3aG9zZSBjYXBpdGFsaXphdGlvbiBzaG91bGQgYmUgbm9ybWFsaXplZFxuICB2YXIgbWV0aG9kcyA9IFsnREVMRVRFJywgJ0dFVCcsICdIRUFEJywgJ09QVElPTlMnLCAnUE9TVCcsICdQVVQnXVxuXG4gIGZ1bmN0aW9uIG5vcm1hbGl6ZU1ldGhvZChtZXRob2QpIHtcbiAgICB2YXIgdXBjYXNlZCA9IG1ldGhvZC50b1VwcGVyQ2FzZSgpXG4gICAgcmV0dXJuIChtZXRob2RzLmluZGV4T2YodXBjYXNlZCkgPiAtMSkgPyB1cGNhc2VkIDogbWV0aG9kXG4gIH1cblxuICBmdW5jdGlvbiBSZXF1ZXN0KGlucHV0LCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge31cbiAgICB2YXIgYm9keSA9IG9wdGlvbnMuYm9keVxuXG4gICAgaWYgKGlucHV0IGluc3RhbmNlb2YgUmVxdWVzdCkge1xuICAgICAgaWYgKGlucHV0LmJvZHlVc2VkKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0FscmVhZHkgcmVhZCcpXG4gICAgICB9XG4gICAgICB0aGlzLnVybCA9IGlucHV0LnVybFxuICAgICAgdGhpcy5jcmVkZW50aWFscyA9IGlucHV0LmNyZWRlbnRpYWxzXG4gICAgICBpZiAoIW9wdGlvbnMuaGVhZGVycykge1xuICAgICAgICB0aGlzLmhlYWRlcnMgPSBuZXcgSGVhZGVycyhpbnB1dC5oZWFkZXJzKVxuICAgICAgfVxuICAgICAgdGhpcy5tZXRob2QgPSBpbnB1dC5tZXRob2RcbiAgICAgIHRoaXMubW9kZSA9IGlucHV0Lm1vZGVcbiAgICAgIGlmICghYm9keSAmJiBpbnB1dC5fYm9keUluaXQgIT0gbnVsbCkge1xuICAgICAgICBib2R5ID0gaW5wdXQuX2JvZHlJbml0XG4gICAgICAgIGlucHV0LmJvZHlVc2VkID0gdHJ1ZVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnVybCA9IFN0cmluZyhpbnB1dClcbiAgICB9XG5cbiAgICB0aGlzLmNyZWRlbnRpYWxzID0gb3B0aW9ucy5jcmVkZW50aWFscyB8fCB0aGlzLmNyZWRlbnRpYWxzIHx8ICdvbWl0J1xuICAgIGlmIChvcHRpb25zLmhlYWRlcnMgfHwgIXRoaXMuaGVhZGVycykge1xuICAgICAgdGhpcy5oZWFkZXJzID0gbmV3IEhlYWRlcnMob3B0aW9ucy5oZWFkZXJzKVxuICAgIH1cbiAgICB0aGlzLm1ldGhvZCA9IG5vcm1hbGl6ZU1ldGhvZChvcHRpb25zLm1ldGhvZCB8fCB0aGlzLm1ldGhvZCB8fCAnR0VUJylcbiAgICB0aGlzLm1vZGUgPSBvcHRpb25zLm1vZGUgfHwgdGhpcy5tb2RlIHx8IG51bGxcbiAgICB0aGlzLnJlZmVycmVyID0gbnVsbFxuXG4gICAgaWYgKCh0aGlzLm1ldGhvZCA9PT0gJ0dFVCcgfHwgdGhpcy5tZXRob2QgPT09ICdIRUFEJykgJiYgYm9keSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQm9keSBub3QgYWxsb3dlZCBmb3IgR0VUIG9yIEhFQUQgcmVxdWVzdHMnKVxuICAgIH1cbiAgICB0aGlzLl9pbml0Qm9keShib2R5KVxuICB9XG5cbiAgUmVxdWVzdC5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IFJlcXVlc3QodGhpcywgeyBib2R5OiB0aGlzLl9ib2R5SW5pdCB9KVxuICB9XG5cbiAgZnVuY3Rpb24gZGVjb2RlKGJvZHkpIHtcbiAgICB2YXIgZm9ybSA9IG5ldyBGb3JtRGF0YSgpXG4gICAgYm9keS50cmltKCkuc3BsaXQoJyYnKS5mb3JFYWNoKGZ1bmN0aW9uKGJ5dGVzKSB7XG4gICAgICBpZiAoYnl0ZXMpIHtcbiAgICAgICAgdmFyIHNwbGl0ID0gYnl0ZXMuc3BsaXQoJz0nKVxuICAgICAgICB2YXIgbmFtZSA9IHNwbGl0LnNoaWZ0KCkucmVwbGFjZSgvXFwrL2csICcgJylcbiAgICAgICAgdmFyIHZhbHVlID0gc3BsaXQuam9pbignPScpLnJlcGxhY2UoL1xcKy9nLCAnICcpXG4gICAgICAgIGZvcm0uYXBwZW5kKGRlY29kZVVSSUNvbXBvbmVudChuYW1lKSwgZGVjb2RlVVJJQ29tcG9uZW50KHZhbHVlKSlcbiAgICAgIH1cbiAgICB9KVxuICAgIHJldHVybiBmb3JtXG4gIH1cblxuICBmdW5jdGlvbiBwYXJzZUhlYWRlcnMocmF3SGVhZGVycykge1xuICAgIHZhciBoZWFkZXJzID0gbmV3IEhlYWRlcnMoKVxuICAgIHJhd0hlYWRlcnMuc3BsaXQoL1xccj9cXG4vKS5mb3JFYWNoKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgIHZhciBwYXJ0cyA9IGxpbmUuc3BsaXQoJzonKVxuICAgICAgdmFyIGtleSA9IHBhcnRzLnNoaWZ0KCkudHJpbSgpXG4gICAgICBpZiAoa2V5KSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IHBhcnRzLmpvaW4oJzonKS50cmltKClcbiAgICAgICAgaGVhZGVycy5hcHBlbmQoa2V5LCB2YWx1ZSlcbiAgICAgIH1cbiAgICB9KVxuICAgIHJldHVybiBoZWFkZXJzXG4gIH1cblxuICBCb2R5LmNhbGwoUmVxdWVzdC5wcm90b3R5cGUpXG5cbiAgZnVuY3Rpb24gUmVzcG9uc2UoYm9keUluaXQsIG9wdGlvbnMpIHtcbiAgICBpZiAoIW9wdGlvbnMpIHtcbiAgICAgIG9wdGlvbnMgPSB7fVxuICAgIH1cblxuICAgIHRoaXMudHlwZSA9ICdkZWZhdWx0J1xuICAgIHRoaXMuc3RhdHVzID0gJ3N0YXR1cycgaW4gb3B0aW9ucyA/IG9wdGlvbnMuc3RhdHVzIDogMjAwXG4gICAgdGhpcy5vayA9IHRoaXMuc3RhdHVzID49IDIwMCAmJiB0aGlzLnN0YXR1cyA8IDMwMFxuICAgIHRoaXMuc3RhdHVzVGV4dCA9ICdzdGF0dXNUZXh0JyBpbiBvcHRpb25zID8gb3B0aW9ucy5zdGF0dXNUZXh0IDogJ09LJ1xuICAgIHRoaXMuaGVhZGVycyA9IG5ldyBIZWFkZXJzKG9wdGlvbnMuaGVhZGVycylcbiAgICB0aGlzLnVybCA9IG9wdGlvbnMudXJsIHx8ICcnXG4gICAgdGhpcy5faW5pdEJvZHkoYm9keUluaXQpXG4gIH1cblxuICBCb2R5LmNhbGwoUmVzcG9uc2UucHJvdG90eXBlKVxuXG4gIFJlc3BvbnNlLnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgUmVzcG9uc2UodGhpcy5fYm9keUluaXQsIHtcbiAgICAgIHN0YXR1czogdGhpcy5zdGF0dXMsXG4gICAgICBzdGF0dXNUZXh0OiB0aGlzLnN0YXR1c1RleHQsXG4gICAgICBoZWFkZXJzOiBuZXcgSGVhZGVycyh0aGlzLmhlYWRlcnMpLFxuICAgICAgdXJsOiB0aGlzLnVybFxuICAgIH0pXG4gIH1cblxuICBSZXNwb25zZS5lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciByZXNwb25zZSA9IG5ldyBSZXNwb25zZShudWxsLCB7c3RhdHVzOiAwLCBzdGF0dXNUZXh0OiAnJ30pXG4gICAgcmVzcG9uc2UudHlwZSA9ICdlcnJvcidcbiAgICByZXR1cm4gcmVzcG9uc2VcbiAgfVxuXG4gIHZhciByZWRpcmVjdFN0YXR1c2VzID0gWzMwMSwgMzAyLCAzMDMsIDMwNywgMzA4XVxuXG4gIFJlc3BvbnNlLnJlZGlyZWN0ID0gZnVuY3Rpb24odXJsLCBzdGF0dXMpIHtcbiAgICBpZiAocmVkaXJlY3RTdGF0dXNlcy5pbmRleE9mKHN0YXR1cykgPT09IC0xKSB7XG4gICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignSW52YWxpZCBzdGF0dXMgY29kZScpXG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBSZXNwb25zZShudWxsLCB7c3RhdHVzOiBzdGF0dXMsIGhlYWRlcnM6IHtsb2NhdGlvbjogdXJsfX0pXG4gIH1cblxuICBzZWxmLkhlYWRlcnMgPSBIZWFkZXJzXG4gIHNlbGYuUmVxdWVzdCA9IFJlcXVlc3RcbiAgc2VsZi5SZXNwb25zZSA9IFJlc3BvbnNlXG5cbiAgc2VsZi5mZXRjaCA9IGZ1bmN0aW9uKGlucHV0LCBpbml0KSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgdmFyIHJlcXVlc3QgPSBuZXcgUmVxdWVzdChpbnB1dCwgaW5pdClcbiAgICAgIHZhciB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxuXG4gICAgICB4aHIub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBvcHRpb25zID0ge1xuICAgICAgICAgIHN0YXR1czogeGhyLnN0YXR1cyxcbiAgICAgICAgICBzdGF0dXNUZXh0OiB4aHIuc3RhdHVzVGV4dCxcbiAgICAgICAgICBoZWFkZXJzOiBwYXJzZUhlYWRlcnMoeGhyLmdldEFsbFJlc3BvbnNlSGVhZGVycygpIHx8ICcnKVxuICAgICAgICB9XG4gICAgICAgIG9wdGlvbnMudXJsID0gJ3Jlc3BvbnNlVVJMJyBpbiB4aHIgPyB4aHIucmVzcG9uc2VVUkwgOiBvcHRpb25zLmhlYWRlcnMuZ2V0KCdYLVJlcXVlc3QtVVJMJylcbiAgICAgICAgdmFyIGJvZHkgPSAncmVzcG9uc2UnIGluIHhociA/IHhoci5yZXNwb25zZSA6IHhoci5yZXNwb25zZVRleHRcbiAgICAgICAgcmVzb2x2ZShuZXcgUmVzcG9uc2UoYm9keSwgb3B0aW9ucykpXG4gICAgICB9XG5cbiAgICAgIHhoci5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJlamVjdChuZXcgVHlwZUVycm9yKCdOZXR3b3JrIHJlcXVlc3QgZmFpbGVkJykpXG4gICAgICB9XG5cbiAgICAgIHhoci5vbnRpbWVvdXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVqZWN0KG5ldyBUeXBlRXJyb3IoJ05ldHdvcmsgcmVxdWVzdCBmYWlsZWQnKSlcbiAgICAgIH1cblxuICAgICAgeGhyLm9wZW4ocmVxdWVzdC5tZXRob2QsIHJlcXVlc3QudXJsLCB0cnVlKVxuXG4gICAgICBpZiAocmVxdWVzdC5jcmVkZW50aWFscyA9PT0gJ2luY2x1ZGUnKSB7XG4gICAgICAgIHhoci53aXRoQ3JlZGVudGlhbHMgPSB0cnVlXG4gICAgICB9XG5cbiAgICAgIGlmICgncmVzcG9uc2VUeXBlJyBpbiB4aHIgJiYgc3VwcG9ydC5ibG9iKSB7XG4gICAgICAgIHhoci5yZXNwb25zZVR5cGUgPSAnYmxvYidcbiAgICAgIH1cblxuICAgICAgcmVxdWVzdC5oZWFkZXJzLmZvckVhY2goZnVuY3Rpb24odmFsdWUsIG5hbWUpIHtcbiAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIobmFtZSwgdmFsdWUpXG4gICAgICB9KVxuXG4gICAgICB4aHIuc2VuZCh0eXBlb2YgcmVxdWVzdC5fYm9keUluaXQgPT09ICd1bmRlZmluZWQnID8gbnVsbCA6IHJlcXVlc3QuX2JvZHlJbml0KVxuICAgIH0pXG4gIH1cbiAgc2VsZi5mZXRjaC5wb2x5ZmlsbCA9IHRydWVcbn0pKHR5cGVvZiBzZWxmICE9PSAndW5kZWZpbmVkJyA/IHNlbGYgOiB0aGlzKTtcbiIsIm1vZHVsZS5leHBvcnRzPXtcbiAgXCJuYW1lXCI6IFwidGVybWx5LmpzXCIsXG4gIFwidmVyc2lvblwiOiBcIjIuMC4wXCIsXG4gIFwiZGVzY3JpcHRpb25cIjogXCJTaW1wbGUsIEV4dGVuc2libGUsIExpZ2h0d2VpZ2h0IEphdmFzY3JpcHQgQnJvd3NlciBUZXJtaW5hbCBTaW11bGF0b3IhXCIsXG4gIFwibWFpblwiOiBcImRpc3QvdGVybWx5Lm1pbi5qc1wiLFxuICBcInNjcmlwdHNcIjoge1xuICAgIFwidGVzdFwiOiBcIm1vY2hhIC0tY29tcGlsZXJzIGJhYmVsLWNvcmUvcmVnaXN0ZXIgdGVzdHMvXCIsXG4gICAgXCJidWlsZFwiOiBcImd1bHBcIlxuICB9LFxuICBcImtleXdvcmRzXCI6IFtcbiAgICBcInRlcm1pbmFsXCIsXG4gICAgXCJqYXZhc2NyaXB0XCIsXG4gICAgXCJzaW11bGF0b3JcIixcbiAgICBcImJyb3dzZXJcIixcbiAgICBcInByZXNlbnRhdGlvblwiLFxuICAgIFwibW9ja3VwXCIsXG4gICAgXCJkZW1vXCIsXG4gICAgXCJjbGlcIixcbiAgICBcInByb21wdFwiLFxuICAgIFwiY29tbWFuZHNcIixcbiAgICBcIm5vIGRlcGVuY3lcIixcbiAgICBcImxpZ2h0d2VpZ2h0XCIsXG4gICAgXCJqc1wiLFxuICAgIFwidmFuaWxsYVwiXG4gIF0sXG4gIFwicmVwb3NpdG9yeVwiOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9LaXJraGFtbWV0ei90ZXJtbHkuanNcIixcbiAgXCJhdXRob3JcIjogXCJTaW1vbmUgQ29yc2lcIixcbiAgXCJsaWNlbnNlXCI6IFwiSVNDXCIsXG4gIFwiZGV2RGVwZW5kZW5jaWVzXCI6IHtcbiAgICBcImJhYmVsXCI6IFwiXjYuNS4yXCIsXG4gICAgXCJiYWJlbC1jb3JlXCI6IFwiXjYuMjEuMFwiLFxuICAgIFwiYmFiZWwtcG9seWZpbGxcIjogXCJeNi4yMi4wXCIsXG4gICAgXCJiYWJlbC1wcmVzZXQtZXMyMDE1XCI6IFwiXjYuMTguMFwiLFxuICAgIFwiYmFiZWwtcHJlc2V0LXN0YWdlLTNcIjogXCJeNi4xNy4wXCIsXG4gICAgXCJiYWJlbGlmeVwiOiBcIl43LjMuMFwiLFxuICAgIFwiYnJvd3NlcmlmeVwiOiBcIl4xMy4zLjBcIixcbiAgICBcImNoYWlcIjogXCJeMy41LjBcIixcbiAgICBcImNoYWxrXCI6IFwiXjEuMS4zXCIsXG4gICAgXCJndWxwXCI6IFwiXjMuOS4xXCIsXG4gICAgXCJndWxwLXJlbmFtZVwiOiBcIl4xLjIuMlwiLFxuICAgIFwiZ3VscC1zb3VyY2VtYXBzXCI6IFwiXjIuNC4wXCIsXG4gICAgXCJndWxwLXVnbGlmeVwiOiBcIl4yLjAuMFwiLFxuICAgIFwiZ3VscC11dGlsXCI6IFwiXjMuMC44XCIsXG4gICAgXCJtb2NoYVwiOiBcIl4zLjIuMFwiLFxuICAgIFwicHJvbWlzZS1wb2x5ZmlsbFwiOiBcIl42LjAuMlwiLFxuICAgIFwidWdsaWZ5LWpzXCI6IFwiXjIuNi40XCIsXG4gICAgXCJ1dGlscy1tZXJnZVwiOiBcIl4xLjAuMFwiLFxuICAgIFwidmlueWwtYnVmZmVyXCI6IFwiXjEuMC4wXCIsXG4gICAgXCJ2aW55bC1zb3VyY2Utc3RyZWFtXCI6IFwiXjEuMS4wXCIsXG4gICAgXCJ3YXRjaGlmeVwiOiBcIl4zLjguMFwiLFxuICAgIFwid2hhdHdnLWZldGNoXCI6IFwiXjIuMC4yXCJcbiAgfVxufVxuIl19
