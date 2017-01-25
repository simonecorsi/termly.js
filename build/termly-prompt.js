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

},{"../configs/builtin-commands":7,"./Command":1}],5:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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
        // if is a {Promise} resolve it ad parse as json
        if (output['then']) {
          return output.then(function (res) {
            if ((typeof res === 'undefined' ? 'undefined' : _typeof(res)) === 'object') {
              try {
                res = JSON.stringify(res, null, 2);
              } catch (e) {
                return _this4.generateOutput('-fatal http: Response received but had a problem parsing it.');
              }
            }
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
  "version": "2.1.0",
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJiaW4vY2xhc3Nlcy9Db21tYW5kLmpzIiwiYmluL2NsYXNzZXMvRmlsZS5qcyIsImJpbi9jbGFzc2VzL0ZpbGVzeXN0ZW0uanMiLCJiaW4vY2xhc3Nlcy9JbnRlcnByZXRlci5qcyIsImJpbi9jbGFzc2VzL1Byb21wdC5qcyIsImJpbi9jbGFzc2VzL1NoZWxsLmpzIiwiYmluL2NvbmZpZ3MvYnVpbHRpbi1jb21tYW5kcy5qcyIsImJpbi9jb25maWdzL2RlZmF1bHQtZmlsZXN5c3RlbS5qcyIsImJpbi90ZXJtbHktcHJvbXB0LmpzIiwibm9kZV9tb2R1bGVzL3Byb21pc2UtcG9seWZpbGwvcHJvbWlzZS5qcyIsIm5vZGVfbW9kdWxlcy93aGF0d2ctZmV0Y2gvZmV0Y2guanMiLCJwYWNrYWdlLmpzb24iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7QUNBQTs7Ozs7O0lBTU0sTztBQUNKLHFCQUF3RTtBQUFBLG1GQUFILEVBQUc7QUFBQSxRQUExRCxJQUEwRCxRQUExRCxJQUEwRDtBQUFBLFFBQXBELEVBQW9ELFFBQXBELEVBQW9EO0FBQUEseUJBQWhELElBQWdEO0FBQUEsUUFBaEQsSUFBZ0QsNkJBQXpDLEtBQXlDO0FBQUEsMEJBQWxDLEtBQWtDO0FBQUEsUUFBbEMsS0FBa0MsOEJBQTFCLFNBQTBCO0FBQUEsd0JBQWYsR0FBZTtBQUFBLFFBQWYsR0FBZSw0QkFBVCxFQUFTOztBQUFBOztBQUN0RSxRQUFJLE9BQU8sSUFBUCxLQUFnQixRQUFwQixFQUE4QixNQUFNLE1BQU0sK0JBQU4sQ0FBTjtBQUM5QixRQUFJLE9BQU8sRUFBUCxLQUFjLFVBQWxCLEVBQThCLE1BQU0sTUFBTSx3Q0FBTixDQUFOOztBQUU5Qjs7OztBQUlBLFNBQUssRUFBTCxHQUFVLEdBQUcsSUFBSCxDQUFRLElBQVIsQ0FBVjtBQUNBLFNBQUssSUFBTCxHQUFZLElBQVo7QUFDQSxTQUFLLElBQUws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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMWNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcbiAqIENvbW1hbmQgQ2xhc3NcbiAqIEBwYXJhbSBuYW1lIFtTdHJpbmddLCBmbiBbRnVuY3Rpb25dXG4gKlxuICogZG9uJ3QgcGFzcyBhcnJvdyBmdW5jdGlvbiBpZiB5b3Ugd2FudCB0byB1c2UgdGhpcyBpbnNpZGUgeW91ciBjb21tYW5kIGZ1bmN0aW9uIHRvIGFjY2VzcyB2YXJpb3VzIHNoYXJlZCBzaGVsbCBvYmplY3RcbiAqL1xuY2xhc3MgQ29tbWFuZCB7XG4gIGNvbnN0cnVjdG9yKHsgbmFtZSwgZm4sIHR5cGUgPSAndXNyJywgc2hlbGwgPSB1bmRlZmluZWQsIG1hbiA9ICcnfSA9IHt9KXtcbiAgICBpZiAodHlwZW9mIG5hbWUgIT09ICdzdHJpbmcnKSB0aHJvdyBFcnJvcignQ29tbWFuZCBuYW1lIG11c3QgYmUgYSBzdHJpbmcnKVxuICAgIGlmICh0eXBlb2YgZm4gIT09ICdmdW5jdGlvbicpIHRocm93IEVycm9yKCdDb21tYW5kIGZ1bmN0aW9uIG11c3QgYmUuLi4gYSBmdW5jdGlvbicpXG5cbiAgICAvKipcbiAgICAgKiB1c2Ugd2hvbGUgZnVuY3Rpb24gaW5zdGVhZCBvZiBhcnJvdyBpZiB5b3Ugd2FudCB0byBhY2Nlc3NcbiAgICAgKiBjaXJjdWxhciByZWZlcmVuY2Ugb2YgQ29tbWFuZFxuICAgICAqL1xuICAgIHRoaXMuZm4gPSBmbi5iaW5kKHRoaXMpXG4gICAgdGhpcy5uYW1lID0gbmFtZVxuICAgIHRoaXMudHlwZSA9IHR5cGVcbiAgICB0aGlzLm1hbiA9IG1hblxuXG4gICAgaWYgKHNoZWxsKSB7XG4gICAgICB0aGlzLnNoZWxsID0gc2hlbGxcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRGlzcGF0Y2ggQ29tbWFuZCBFeGVjdXRpb25cbiAgICpcbiAgICogQHRpcCBkb24ndCB1c2UgYXJyb3cgZnVuY3Rpb24gaW4geW91IGNvbW1hbmQgaWYgeW91IHdhbnQgdGhlIGFyZ3VtZW50c1xuICAgKiBuZWl0aGVyIHN1cGVyIGFuZCBhcmd1bWVudHMgZ2V0IGJpbmRlZCBpbiBBRi5cbiAgICovXG4gIGV4ZWMoYXJncyA9IFtdKSB7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGFyZ3MpKSB0aHJvdyBFcnJvcignQ29tbWFuZCBleGVjIGFyZ3MgbXVzdCBiZSBpbiBhbiBhcnJheScpXG4gICAgaWYgKGFyZ3MubGVuZ3RoKSByZXR1cm4gdGhpcy5mbihhcmdzKVxuICAgIHJldHVybiB0aGlzLmZuKClcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENvbW1hbmRcbiIsIi8qKlxuICogQGNsYXNzIFNpbmdsZSBGaWxlIENsYXNzXG4gKiBTaW11bGF0ZSBmaWxlIHByb3BlcnRpZXNcbiAqL1xuY2xhc3MgRmlsZSB7XG4gIGNvbnN0cnVjdG9yKHsgbmFtZSA9ICcnLCB0eXBlID0gJ2ZpbGUnLCBjb250ZW50ID0gJyd9ID0ge30pIHtcbiAgICB0aGlzLnVpZCA9IHRoaXMuZ2VuVWlkKClcbiAgICB0aGlzLm5hbWUgPSBuYW1lXG4gICAgdGhpcy50eXBlID0gdHlwZVxuICAgIHRoaXMuY29udGVudCA9IGNvbnRlbnRcbiAgICB0aGlzLnVzZXIgPSAncm9vdCdcbiAgICB0aGlzLmdyb3VwID0gJ3Jvb3QnXG5cbiAgICBpZiAodGhpcy50eXBlID09PSAnZmlsZScpIHtcbiAgICAgIHRoaXMucGVybWlzc2lvbiA9ICdyd3hyLS1yLS0nXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucGVybWlzc2lvbiA9ICdkcnd4ci14ci14J1xuICAgIH1cblxuICB9XG5cbiAgZ2VuVWlkKCkge1xuICAgIGZ1bmN0aW9uIHM0KCkge1xuICAgICAgcmV0dXJuIE1hdGguZmxvb3IoKDEgKyBNYXRoLnJhbmRvbSgpKSAqIDB4MTAwMDApXG4gICAgICAgIC50b1N0cmluZygxNilcbiAgICAgICAgLnN1YnN0cmluZygxKTtcbiAgICB9XG4gICAgcmV0dXJuIHM0KCkgKyBzNCgpICsgJy0nICsgczQoKSArICctJyArIHM0KCkgKyAnLScgK1xuICAgICAgczQoKSArICctJyArIHM0KCkgKyBzNCgpICsgczQoKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGVcbiIsImNvbnN0IERFRkFVTFRfRlMgPSByZXF1aXJlKCcuLi9jb25maWdzL2RlZmF1bHQtZmlsZXN5c3RlbScpXG5jb25zdCBGaWxlID0gcmVxdWlyZSgnLi9GaWxlJylcblxuLyoqXG4gKiBAY2xhc3MgVmlydHVhbCBGaWxlc3lzdGVtXG4gKiBSZXByZXNlbnRlZCBhcyBhbiBvYmplY3Qgb2Ygbm9kZXNcbiAqL1xuY2xhc3MgRmlsZXN5c3RlbSB7XG4gIGNvbnN0cnVjdG9yKGZzID0gREVGQVVMVF9GUywgc2hlbGwgPSB7fSkge1xuICAgIHRoaXMuc2hlbGwgPSBzaGVsbFxuICAgIGlmICh0eXBlb2YgZnMgIT09ICdvYmplY3QnIHx8IEFycmF5LmlzQXJyYXkoZnMpKSB0aHJvdyBuZXcgRXJyb3IoJ1ZpcnR1YWwgRmlsZXN5c3RlbSBwcm92aWRlZCBub3QgdmFsaWQsIGluaXRpYWxpemF0aW9uIGZhaWxlZC4nKVxuXG4gICAgLy8gTm90IEJ5IFJlZmVyZW5jZS5cbiAgICAvLyBIQUNLOiBPYmplY3QgYXNzaWduIHJlZnVzZSB0byB3b3JrIGFzIGludGVuZGVkLlxuICAgIGZzID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShmcykpXG4gICAgdGhpcy5GaWxlU3lzdGVtID0gdGhpcy5pbml0RnMoZnMpXG5cbiAgICAvLyBDV0QgZm9yIGNvbW1hbmRzIHVzYWdlXG4gICAgdGhpcy5jd2QgPSBbJy8nXVxuICB9XG5cbiAgLyoqXG4gICAqIEluaXQgJiBQYXNzIENvbnRyb2wgdG8gcmVjdXJyc2l2ZSBmdW5jdGlvblxuICAgKiBAcmV0dXJuIG5ldyBGaWxlc3lzdGVtIGFzIG5vZGVzIG9mIG11bHRpcGxlIEBjbGFzcyBGaWxlXG4gICAqL1xuICBpbml0RnMoZnMpIHtcbiAgICB0aGlzLmJ1aWxkVmlydHVhbEZzKGZzKVxuICAgIHJldHVybiBmc1xuICB9XG5cbiAgLyoqXG4gICAqIFRyYXZlcnNlIGFsbCBub2RlIGFuZCBidWlsZCBhIHZpcnR1YWwgcmVwcmVzZW50YXRpb24gb2YgYSBmaWxlc3lzdGVtXG4gICAqIEVhY2ggbm9kZSBpcyBhIEZpbGUgaW5zdGFuY2UuXG4gICAqIEBwYXJhbSBNb2NrZWQgRmlsZXN5c3RlbSBhcyBPYmplY3RcbiAgICpcbiAgICovXG4gIGJ1aWxkVmlydHVhbEZzKG9iaikge1xuICAgIGZvciAobGV0IGtleSBpbiBvYmopIHtcbiAgICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICBpZiAodHlwZW9mIG9ialtrZXldID09PSAnb2JqZWN0JyAmJiAhQXJyYXkuaXNBcnJheShvYmpba2V5XSkpIHtcbiAgICAgICAgICBvYmpba2V5XSA9IG5ldyBGaWxlKHsgbmFtZToga2V5LCBjb250ZW50OiBvYmpba2V5XSwgdHlwZTogJ2RpcicgfSlcbiAgICAgICAgICB0aGlzLmJ1aWxkVmlydHVhbEZzKG9ialtrZXldLmNvbnRlbnQpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgb2JqW2tleV0gPSBuZXcgRmlsZSh7IG5hbWU6IGtleSwgY29udGVudDogb2JqW2tleV0gfSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYSBzdHJpbmdlZCBwYXRoIGFuZCByZXR1cm4gYXMgYXJyYXlcbiAgICogdGhyb3cgZXJyb3IgaWYgcGF0aCBmb3JtYXQgaXMgaW52YWxpZFxuICAgKiBSZWxhdGl2ZSBQYXRoIGdldHMgY29udmVydGVkIHVzaW5nIEN1cnJlbnQgV29ya2luZyBEaXJlY3RvcnlcbiAgICogQHBhcmFtIHBhdGgge1N0cmluZ31cbiAgICogQHJldHVybiBBcnJheVxuICAgKi9cbiAgcGF0aFN0cmluZ1RvQXJyYXkocGF0aCA9ICcnKSB7XG4gICAgaWYgKCFwYXRoLmxlbmd0aCkgdGhyb3cgbmV3IEVycm9yKCdQYXRoIGNhbm5vdCBiZSBlbXB0eScpXG5cbiAgICAvLyBDaGVjayBmb3IgaW52YWxpZCBwYXRoLCBlZy4gdHdvKyAvLyBpbiBhIHJvd1xuICAgIGlmIChwYXRoLm1hdGNoKC9cXC97Mix9L2cpKSB0aHJvdyBuZXcgRXJyb3IoYC1pbnZhbGlkIHBhdGg6ICR7cGF0aH1gKVxuXG4gICAgLy8gRm9ybWF0IGFuZCBDb21wb3NlciBhcnJheVxuICAgIGxldCBwYXRoQXJyYXkgPSBwYXRoLnNwbGl0KCcvJylcbiAgICBpZiAocGF0aEFycmF5WzBdID09PSAnJykgcGF0aEFycmF5WzBdID0gJy8nXG4gICAgaWYgKHBhdGhBcnJheVswXSA9PT0gJy4nKSBwYXRoQXJyYXkuc2hpZnQoKVxuICAgIGlmKHBhdGhBcnJheVtwYXRoQXJyYXkubGVuZ3RoIC0gMV0gPT09ICcnKSBwYXRoQXJyYXkucG9wKClcbiAgICAvLyBoYW5kbGUgcmVsYXRpdmUgcGF0aCB3aXRoIGN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnlcbiAgICBpZiAocGF0aEFycmF5WzBdICE9PSAnLycpIHtcbiAgICAgIHBhdGhBcnJheSA9IHRoaXMuY3dkLmNvbmNhdChwYXRoQXJyYXkpXG4gICAgfVxuICAgIHJldHVybiBwYXRoQXJyYXlcbiAgfVxuXG4gIC8qKlxuICAgKiBQYXRoIGZyb20gYXJyYXkgdG8gU3RyaW5nXG4gICAqIEZvciBwcmVzZW50YXRpb25hbCBwdXJwb3NlLlxuICAgKiBUT0RPXG4gICAqIEBwYXJhbSBwYXRoIFtBcnJheV1cbiAgICogQHJldHVybiB7U3RyaW5nfVxuICAgKi9cbiAgcGF0aEFycmF5VG9TdHJpbmcocGF0aCA9IFtdKSB7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KHBhdGgpKSB0aHJvdyBuZXcgRXJyb3IoJy1mYXRhbCBmaWxlc3lzdGVtOiBwYXRoIG11c3QgYmUgYW4gYXJyYXknKVxuICAgIGlmICghcGF0aC5sZW5ndGgpIHRocm93IG5ldyBFcnJvcignLWludmFsaWQgZmlsZXN5c3RlbTogcGF0aCBub3QgcHJvdmlkZWQnKVxuICAgIGxldCBvdXRwdXQgPSBwYXRoLmpvaW4oJy8nKVxuICAgIC8vIHJlbW92ZSAvIG11bHRpcGxlIG9jY3VycmVuY2VcbiAgICByZXR1cm4gb3V0cHV0LnJlcGxhY2UoL1xcL3syLH0vZywgJy8nKVxuICB9XG5cbiAgLyoqXG4gICAqIEx1a2UuLiBmaWxlV2Fsa2VyXG4gICAqIEFjY2VwdHMgb25seSBBYnNvbHV0ZSBQYXRoLCB5b3UgbXVzdCBjb252ZXJ0IHBhdGhzIGJlZm9yZSBjYWxsaW5nIHVzaW5nIHBhdGhTdHJpbmdUb0FycmF5XG4gICAqIEBwYXJhbSBjYiBleGVjdXRlZCBvbiBlYWNoIGZpbGUgZm91bmRcbiAgICogQHBhcmFtIGZzIFtTaGVsbCBWaXJ0dWFsIEZpbGVzeXN0ZW1dXG4gICAqL1xuICBmaWxlV2Fsa2VyKHBhdGggPSBbJy8nXSwgZnMgPSB0aGlzLkZpbGVTeXN0ZW0pe1xuICAgIGlmICghQXJyYXkuaXNBcnJheShwYXRoKSkgdGhyb3cgbmV3IEVycm9yKCdQYXRoIG11c3QgYmUgYW4gYXJyYXkgb2Ygbm9kZXMsIHVzZSBGaWxlc3lzdGVtLnBhdGhTdHJpbmdUb0FycmF5KHtzdHJpbmd9KScpXG5cbiAgICAvLyBhdm9pZCBtb2RpZnlpbmcgZXh0ZXJuYWwgcGF0aCByZWZlcmVuY2VcbiAgICBwYXRoID0gcGF0aC5zbGljZSgwKVxuXG4gICAgLy8gVE9ETzpcbiAgICAvLyAgQ2hvb3NlOlxuICAgIC8vICAgIC0gR28gZnVsbCBwdXJlXG4gICAgLy8gICAgLSBXb3JrIG9uIHRoZSByZWZlcmVuY2Ugb2YgdGhlIGFjdHVhbCBub2RlXG4gICAgLy8gZnMgPSBPYmplY3QuYXNzaWduKGZzLCB7fSlcblxuICAgIC8vIEV4aXQgQ29uZGl0aW9uXG4gICAgaWYgKCFwYXRoLmxlbmd0aCkgcmV0dXJuIGZzXG5cbiAgICAvLyBHZXQgY3VycmVudCBub2RlXG4gICAgbGV0IG5vZGUgPSBwYXRoLnNoaWZ0KClcblxuICAgIC8vIEdvIGRlZXBlciBpZiBpdCdzIG5vdCB0aGUgcm9vdCBkaXJcbiAgICBpZiAobm9kZSAhPT0gJy8nKSB7XG4gICAgICAvLyBjaGVjayBpZiBub2RlIGV4aXN0XG4gICAgICBpZiAoZnNbbm9kZV0pIHtcbiAgICAgICAgLy8gcmV0dXJuIGZpbGUgb3IgZm9sZGVyXG4gICAgICAgIGZzID0gZnNbbm9kZV0udHlwZSA9PT0gJ2RpcicgPyBmc1tub2RlXS5jb250ZW50IDogZnNbbm9kZV1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignRmlsZSBkb2VzblxcJ3QgZXhpc3QnKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5maWxlV2Fsa2VyKHBhdGgsIGZzKVxuICB9XG5cbiAgLyoqXG4gICAqIHRyYXZlcnNlRmlsZXNcbiAgICogYWNjZXNzaW5nIGFsbCBmaWxlIGF0IGxlYXN0IG9uY2VcbiAgICogY2FsbGluZyBwcm92aWRlZCBjYWxsYmFjayBvbiBlYWNoXG4gICAqIEBwYXJhbSBjYiBleGVjdXRlZCBvbiBlYWNoIGZpbGUgZm91bmRcbiAgICogQHBhcmFtIGZzIFtTaGVsbCBWaXJ0dWFsIEZpbGVzeXN0ZW1dXG4gICAqL1xuICB0cmF2ZXJzZUZpbGVzKGNiID0gKCk9Pnt9LCBmcyA9IHRoaXMuRmlsZVN5c3RlbSl7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXMudHJhdmVyc2VGaWxlc1xuICAgIGZvciAobGV0IG5vZGUgaW4gZnMpIHtcbiAgICAgIGlmIChmcy5oYXNPd25Qcm9wZXJ0eShub2RlKSkge1xuICAgICAgICBpZiAoZnNbbm9kZV0udHlwZSA9PT0gJ2RpcicpIHRoaXMudHJhdmVyc2VGaWxlcyhjYiwgZnNbbm9kZV0uY29udGVudClcbiAgICAgICAgZWxzZSBjYihmc1tub2RlXSlcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogdHJhdmVyc2VEaXJzXG4gICAqIGFjY2Vzc2luZyBhbGwgZGlyZWN0b3J5IGF0IGxlYXN0IG9uY2VcbiAgICogY2FsbGluZyBwcm92aWRlZCBjYWxsYmFjayBvbiBlYWNoXG4gICAqIEBwYXJhbSBjYiBleGVjdXRlZCBvbiBlYWNoIGZpbGUgZm91bmRcbiAgICogQHBhcmFtIGZzIFtTaGVsbCBWaXJ0dWFsIEZpbGVzeXN0ZW1dXG4gICAqL1xuICB0cmF2ZXJzZURpcnMoY2IgPSAoKT0+e30sIGZzID0gdGhpcy5GaWxlU3lzdGVtKXtcbiAgICBmb3IgKGxldCBub2RlIGluIGZzKSB7XG4gICAgICBpZiAoZnMuaGFzT3duUHJvcGVydHkobm9kZSkpIHtcbiAgICAgICAgaWYgKGZzW25vZGVdLnR5cGUgPT09ICdkaXInKSB7XG4gICAgICAgICAgY2IoZnNbbm9kZV0pXG4gICAgICAgICAgdGhpcy50cmF2ZXJzZURpcnMoY2IsIGZzW25vZGVdLmNvbnRlbnQpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2V0IERpcmVjdG9yeSBOb2RlXG4gICAqIFBhc3NlZCBhcyBSZWZlcmVuY2Ugb3IgSW5zdGFuY2UsXG4gICAqIGRlcGVuZCBieSBhIGxpbmUgaW4gQG1ldGhvZCBmaWxlV2Fsa2VyLCBzZWUgY29tbWVudCB0aGVyZS5cbiAgICogQHJldHVybiBEaXJlY3RvcnkgTm9kZSBPYmplY3RcbiAgICovXG4gIGdldE5vZGUocGF0aCA9ICcnLCBmaWxlVHlwZSkge1xuICAgIGlmICh0eXBlb2YgcGF0aCAhPT0gJ3N0cmluZycpIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBpbnB1dC4nKVxuICAgIGxldCBwYXRoQXJyYXksIG5vZGVcblxuICAgIHRyeSB7XG4gICAgICBwYXRoQXJyYXkgPSB0aGlzLnBhdGhTdHJpbmdUb0FycmF5KHBhdGgpXG4gICAgICBub2RlID0gdGhpcy5maWxlV2Fsa2VyKHBhdGhBcnJheSlcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB0aHJvdyBlXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRVJST1IgSEFORExJTkdcbiAgICAgKi9cblxuICAgIC8vIEhhbmRsZSBMaXN0IG9uIGEgZmlsZVxuICAgIGlmIChmaWxlVHlwZSA9PT0gJ2RpcicgJiYgbm9kZS50eXBlID09PSAnZmlsZScpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSXRzIGEgZmlsZSBub3QgYSBkaXJlY3RvcnknKVxuICAgIH1cbiAgICAvLyBIYW5kbGUgcmVhZGZpbGUgb24gYSBkaXJcbiAgICBpZiAoZmlsZVR5cGUgPT09ICdmaWxlJyAmJiBub2RlLnR5cGUgPT09ICdkaXInKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0l0cyBhIGRpcmVjdG9yeSBub3QgYSBmaWxlJylcbiAgICB9XG4gICAgLy8gaGFuZGxlIHJlYWRmaWxlIG9uIG5vbiBleGlzdGluZyBmaWxlXG4gICAgaWYgKGZpbGVUeXBlID09PSAnZmlsZScgJiYgIW5vZGUudHlwZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGZpbGUgcGF0aCcpXG4gICAgfVxuICAgIC8vIGhhbmRsZSBpbnZhbGlkIC8gbm9uZXhpc3RpbmcgcGF0aFxuICAgIGlmICghbm9kZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHBhdGgsIGZpbGUvZm9sZGVyIGRvZXNuXFwndCBleGlzdCcpXG4gICAgfVxuXG4gICAgcmV0dXJuIHsgcGF0aCwgcGF0aEFycmF5ICwgbm9kZSB9XG4gIH1cblxuICAvKipcbiAgICogQ2hhbmdlIEN1cnJlbnQgV29ya2luZyBEaXJlY3RvcnkgR3JhY2VmdWxseVxuICAgKiBAcmV0dXJuIE1lc3NhZ2UgU3RyaW5nLlxuICAgKi9cbiAgY2hhbmdlRGlyKHBhdGggPSAnJykge1xuICAgIGxldCByZXN1bHRcbiAgICB0cnkge1xuICAgICAgcmVzdWx0ID0gdGhpcy5nZXROb2RlKHBhdGgsICdkaXInKVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgdGhyb3cgZXJyXG4gICAgfVxuICAgIHRoaXMuY3dkID0gcmVzdWx0LnBhdGhBcnJheVxuICAgIHJldHVybiBgY2hhbmdlZCBkaXJlY3RvcnkuYFxuICB9XG5cbiAgLyoqXG4gICAqIExpc3QgQ3VycmVudCBXb3JraW5nIERpcmVjdG9yeSBGaWxlc1xuICAgKiBAcmV0dXJuIHt9XG4gICAqL1xuICBsaXN0RGlyKHBhdGggPSAnJykge1xuICAgIGxldCByZXN1bHRcbiAgICB0cnkge1xuICAgICAgcmVzdWx0ID0gdGhpcy5nZXROb2RlKHBhdGgsICdkaXInKVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgdGhyb3cgZXJyXG4gICAgfVxuICAgIHJldHVybiByZXN1bHQubm9kZVxuICB9XG5cbiAgcmVhZEZpbGUocGF0aCA9ICcnKSB7XG4gICAgbGV0IHJlc3VsdFxuICAgIHRyeSB7XG4gICAgICByZXN1bHQgPSB0aGlzLmdldE5vZGUocGF0aCwgJ2ZpbGUnKVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgdGhyb3cgZXJyXG4gICAgfVxuICAgIHJldHVybiByZXN1bHQubm9kZVxuICB9XG5cbiAgZ2V0Q3VycmVudERpcmVjdG9yeSgpIHtcbiAgICBsZXQgY3dkQXNTdHJpbmdcbiAgICB0cnkge1xuICAgICAgY3dkQXNTdHJpbmcgPSB0aGlzLnBhdGhBcnJheVRvU3RyaW5nKHRoaXMuY3dkKVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiAnLWludmFsaWQgZmlsZXN5c3RlbTogQW4gZXJyb3Igb2NjdXJlZCB3aGlsZSBwYXJzaW5nIGN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnkgdG8gc3RyaW5nLidcbiAgICB9XG4gICAgcmV0dXJuIGN3ZEFzU3RyaW5nXG4gIH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGVzeXN0ZW1cbiIsImNvbnN0IENvbW1hbmQgPSByZXF1aXJlKCcuL0NvbW1hbmQnKVxuXG4vKipcbiAqXG4gKiBJbnRlcnByZXRlclxuICogSXMgdGhlIHBhcmVudCBDbGFzcyBvZiB0aGUgTWFpbiBTaGVsbCBDbGFzc1xuICogLSBUaGlzIGNsYXNzIGlzIHRoZSBvbmUgdGhhdCBwYXJzZSBhbmQgcnVuIGV4ZWMgb2YgY29tbWFuZFxuICogLSBQYXJzaW5nIG9mIGJ1aWx0aW4gY29tbWFuZCBvbiBydW50aW1lIGhhcHBlbiBoZXJlXG4gKiAtIFdpbGwgcGFyc2UgY3VzdG9tIHVzZXIgQ29tbWFuZCB0b29cbiAqXG4gKi9cbmNsYXNzIEludGVycHJldGVyIHtcblxuICAvKipcbiAgICogUGFyc2UgQ29tbWFuZFxuICAgKiBTdHJpbmcgaXMgc3BsaXR0ZWQgYnkgc3BhY2VzXG4gICAqIEByZXR1cm4gQXJyYXkgb2YgYXJncyBhcyBpbiBDXG4gICAqIC0tLVxuICAgKiAgIElERUE6IFJlZ2V4cCBldmVyeSB3b3JkIGlzIGFuIGFyZ3VtZW50LCB0byBwcm9pZGUgc29tZXRoaW5nIGVsc2UgeW91IG11c3QgZW5jbG9zZVxuICAgKiAgIGl0IGluIHNpbmdsZSBvciBkb3VibGUgcXVvdGVzLlxuICAgKiAgIFRvIHBhc3MgYSBqc29uIHVzZSBzaW5nbGUgcXVvdGVzIHNpbmNlIHRoZSBqc29uIHN0YXJuZGFyZCByZXF1aXJlcyBkb3VibGUgcXVvdGVzIGluIGl0XG4gICAqICAgQHJldHVybiBjbWQubWF0Y2goL1teXFxzXCInXSt8XCIoW15cIl0qKVwifCcoW14nXSopJy9nKVxuICAgKiAtLS1cbiAgICovXG4gIHBhcnNlKGNtZCkge1xuICAgIGlmICh0eXBlb2YgY21kICE9PSAnc3RyaW5nJykgdGhyb3cgbmV3IEVycm9yKCdDb21tYW5kIG11c3QgYmUgYSBzdHJpbmcnKVxuICAgIGlmICghY21kLmxlbmd0aCkgdGhyb3cgbmV3IEVycm9yKCdDb21tYW5kIGlzIGVtcHR5JylcbiAgICByZXR1cm4gY21kLnNwbGl0KCcgJylcbiAgfVxuXG4gIC8qKlxuICAgKiBGb3JtYXQgT3V0cHV0XG4gICAqIHJldHVybiBlcnJvciBpZiBmdW5jdGlvbiBpcyByZXR1cm5lZFxuICAgKiBjb252ZXJ0IGV2ZXJ5dGhpbmcgZWxzZSB0byBqc29uLlxuICAgKiBAcmV0dXJuIEpTT04gcGFyc2VkXG4gICAqL1xuICBmb3JtYXQob3V0cHV0KSB7XG4gICAgaWYgKHR5cGVvZiBvdXRwdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiAnLWludmFsaWQgY29tbWFuZDogQ29tbWFuZCByZXR1cm5lZCBpbnZhbGlkIGRhdGEgdHlwZS4nXG4gICAgfVxuICAgIGlmIChvdXRwdXQgPT09IHVuZGVmaW5lZCB8fCB0eXBlb2Ygb3V0cHV0ID09PSAndW5kZWZpbmVkJykge1xuICAgICAgcmV0dXJuICctaW52YWxpZCBjb21tYW5kOiBDb21tYW5kIHJldHVybmVkIG5vIGRhdGEuJ1xuICAgIH1cbiAgICByZXR1cm4gb3V0cHV0XG4gICAgLy8gdHJ5IHtcbiAgICAvLyAgIHJldHVybiBKU09OLnN0cmluZ2lmeShvdXRwdXQpXG4gICAgLy8gfSBjYXRjaCAoZSkge1xuICAgIC8vICAgcmV0dXJuICctaW52YWxpZCBjb21tYW5kOiBDb21tYW5kIHJldHVybmVkIGludmFsaWQgZGF0YSB0eXBlOiAnICsgZS5tZXNzYWdlXG4gICAgLy8gfVxuICB9XG5cbiAgLyoqXG4gICAqIEV4ZWMgQ29tbWFuZFxuICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAqL1xuICBleGVjKGNtZCkge1xuXG4gICAgLy8gIFBhcnNlIENvbW1hbmQgU3RyaW5nOiBbMF0gPSBjb21tYW5kIG5hbWUsIFsxK10gPSBhcmd1bWVudHNcbiAgICBsZXQgcGFyc2VkXG4gICAgdHJ5IHtcbiAgICAgIHBhcnNlZCA9IHRoaXMucGFyc2UoY21kKVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiAnLWZhdGFsIGNvbW1hbmQ6ICcgKyBlLm1lc3NhZ2UgfHwgJ1NvbWUgRXJyb3IgT2NjdXJlZCdcbiAgICB9XG5cbiAgICAvLyAgWC1jaGVjayBpZiBjb21tYW5kIGV4aXN0XG4gICAgY29uc3QgY29tbWFuZCA9IHRoaXMuU2hlbGxDb21tYW5kc1twYXJzZWRbMF1dXG4gICAgaWYgKCFjb21tYW5kKSB7XG4gICAgICByZXR1cm4gYC1lcnJvciBzaGVsbDogQ29tbWFuZCA8JHtwYXJzZWRbMF19PiBkb2Vzbid0IGV4aXN0LlxcbmBcbiAgICB9XG5cbiAgICAvLyAgZ2V0IGFyZ3VtZW50cyBhcnJheSBhbmQgZXhlY3V0ZSBjb21tYW5kIHJldHVybiBlcnJvciBpZiB0aHJvd1xuICAgIGNvbnN0IGFyZ3MgPSBwYXJzZWQuZmlsdGVyKChlLCBpKSA9PiBpID4gMClcbiAgICBsZXQgb3V0cHV0XG4gICAgdHJ5IHtcbiAgICAgIG91dHB1dCA9IGNvbW1hbmQuZXhlYyhhcmdzKVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiAnLWZhdGFsIGNvbW1hbmQ6ICcgKyBlLm1lc3NhZ2VcbiAgICB9XG5cbiAgICAvLyAgRm9ybWF0IGRhdGEgYW5kIFJldHVyblxuICAgIHJldHVybiB0aGlzLmZvcm1hdChvdXRwdXQpXG4gIH1cblxuICAvKlxuICAgKiBHZW5lcmF0ZSBCdWlsdGluIENvbW1hbmQgTGlzdFxuICAgKi9cbiAgcmVnaXN0ZXJDb21tYW5kcyhTaGVsbFJlZmVyZW5jZSwgY3VzdG9tQ29tbWFuZHMgPSB1bmRlZmluZWQpIHtcbiAgICBsZXQgQmx1ZXByaW50cyA9IHJlcXVpcmUoJy4uL2NvbmZpZ3MvYnVpbHRpbi1jb21tYW5kcycpXG4gICAgLyoqXG4gICAgICogSWYgY3VzdG9tIGNvbW1hbmRzIGFyZSBwYXNzZWQgY2hlY2sgZm9yIHZhbGlkIHR5cGVcbiAgICAgKiBJZiBnb29kIHRvIGdvIGdlbmVyYXRlIHRob3NlIGNvbW1hbmRzXG4gICAgICovXG4gICAgaWYgKGN1c3RvbUNvbW1hbmRzKSB7XG4gICAgICBpZiAodHlwZW9mIGN1c3RvbUNvbW1hbmRzID09PSAnb2JqZWN0JyAmJiAhQXJyYXkuaXNBcnJheShjdXN0b21Db21tYW5kcykpIHtcbiAgICAgICAgQmx1ZXByaW50cyA9IGN1c3RvbUNvbW1hbmRzXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0N1c3RvbSBjb21tYW5kIHByb3ZpZGVkIGFyZSBub3QgaW4gYSB2YWxpZCBmb3JtYXQuJylcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBTaGVsbENvbW1hbmRzID0ge31cbiAgICBPYmplY3Qua2V5cyhCbHVlcHJpbnRzKS5tYXAoKGtleSkgPT4ge1xuICAgICAgY29uc3QgY21kID0gQmx1ZXByaW50c1trZXldXG4gICAgICBpZiAodHlwZW9mIGNtZC5uYW1lID09PSAnc3RyaW5nJyAmJiB0eXBlb2YgY21kLmZuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGNtZC5zaGVsbCA9IFNoZWxsUmVmZXJlbmNlXG4gICAgICAgIFNoZWxsQ29tbWFuZHNba2V5XSA9IG5ldyBDb21tYW5kKGNtZClcbiAgICAgIH1cbiAgICB9KVxuICAgIHJldHVybiBTaGVsbENvbW1hbmRzXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBJbnRlcnByZXRlclxuIiwidmFyIFNoZWxsID0gcmVxdWlyZSgnLi9TaGVsbCcpXG5cbi8qKlxuICogVGVybWluYWxcbiAqIFdyYXBwZXIgb24gdGhlIFNoZWxsIGNsYXNzXG4gKiBUaGlzIHdpbGwgb25seSBoYW5kbGUgdGhlIFVJIG9mIHRoZSB0ZXJtaW5hbC5cbiAqIFlvdSBjYW4gdXNlIGl0IG9yIHVzZSBkaXJlY3RseSB0aGUgYnJvd3Nlci1zaGVsbC5qc1xuICogYW5kIGNyZWF0ZSB5b3VyIGN1c3RvbSBVSSBjYWxsaW5nIGFuZCBkaXNwbGF5aW5nIHRoZSBAbWV0aG9kIHJ1bigpIGNvbW1hbmRzXG4gKiBfX19fX19fX19fX1xuICogT3B0aW9uczpcbiAqICAtIGZpbGVzeXN0ZW0ge09iamVjdH1cbiAqICAtIGNvbW1hbmRzIHtPYmplY3R9XG4gKiAgLSB1c2VyIHtTdHJpbmd9XG4gKiAgLSBob3N0bmFtZSB7U3RyaW5nfVxuICovXG5jbGFzcyBUZXJtaW5hbCBleHRlbmRzIFNoZWxse1xuICBjb25zdHJ1Y3RvcihzZWxlY3RvciA9IHVuZGVmaW5lZCwgb3B0aW9ucyA9IHt9KSB7XG4gICAgc3VwZXIob3B0aW9ucykgLy8gbXVzdCBwYXNzIG9wdGlvbiBoZXJlXG5cbiAgICBpZiAoIXNlbGVjdG9yKSB0aHJvdyBuZXcgRXJyb3IoJ05vIHdyYXBwZXIgZWxlbWVudCBzZWxlY3RvciBwcm92aWRlZCcpXG4gICAgdHJ5IHtcbiAgICAgIHRoaXMuY29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3RvcilcbiAgICAgIGlmICghdGhpcy5jb250YWluZXIpIHRocm93IG5ldyBFcnJvcignbmV3IFRlcm1pbmFsKCk6IERPTSBlbGVtZW50IG5vdCBmb3VuZCcpXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCduZXcgVGVybWluYWwoKTogTm90IHZhbGlkIERPTSBzZWxlY3Rvci4nKVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmluaXQoKVxuICB9XG5cbiAgaW5pdCgpIHtcbiAgICB0aGlzLmdlbmVyYXRlUm93KClcbiAgICB0aGlzLmNvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKSA9PiB7XG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICBsZXQgaW5wdXQgPSB0aGlzLmNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcuY3VycmVudCAudGVybWluYWwtaW5wdXQnKVxuICAgICAgaWYgKGlucHV0KSBpbnB1dC5mb2N1cygpXG4gICAgfSlcbiAgfVxuXG4gIGdlbmVyYXRlUm93KCkge1xuICAgIHZhciB0aGF0ID0gdGhpc1xuXG4gICAgLy8gUmVtb3ZlIHByZXZpb3VzIGN1cnJlbnQgYWN0aXZlIHJvd1xuICAgIGxldCBjdXJyZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmN1cnJlbnQudGVybWluYWwtcm93JylcbiAgICBpZiAoY3VycmVudCkge1xuICAgICAgY3VycmVudC5jbGFzc0xpc3QucmVtb3ZlKCdjdXJyZW50JylcbiAgICB9XG5cbiAgICBsZXQgcHJldklucHV0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnRlcm1pbmFsLWlucHV0JylcbiAgICBpZiAocHJldklucHV0KSB7XG4gICAgICBwcmV2SW5wdXQucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5dXAnLCB0aGlzLnN1Ym1pdEhhbmRsZXIpXG4gICAgfVxuXG4gICAgY29uc3QgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICBkaXYuY2xhc3NMaXN0LmFkZCgnY3VycmVudCcsICd0ZXJtaW5hbC1yb3cnKVxuICAgIGRpdi5pbm5lckhUTUwgPSAnJ1xuICAgIGRpdi5pbm5lckhUTUwgKz0gYDxzcGFuIGNsYXNzPVwidGVybWluYWwtaW5mb1wiPiR7dGhpcy51c2VyfUAke3RoaXMuaG9zdG5hbWV9IC0gJHt0aGlzLmZzLmdldEN1cnJlbnREaXJlY3RvcnkoKX0g4p6cIDwvc3Bhbj5gXG4gICAgZGl2LmlubmVySFRNTCArPSBgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgY2xhc3M9XCJ0ZXJtaW5hbC1pbnB1dFwiIHNpemU9XCIyXCIgc3R5bGU9XCJjdXJzb3I6bm9uZTtcIj5gXG5cbiAgICAvLyBhZGQgbmV3IHJvdyBhbmQgZm9jdXMgaXRcbiAgICB0aGlzLmNvbnRhaW5lci5hcHBlbmRDaGlsZChkaXYpXG4gICAgbGV0IGlucHV0ID0gdGhpcy5jb250YWluZXIucXVlcnlTZWxlY3RvcignLmN1cnJlbnQgLnRlcm1pbmFsLWlucHV0JylcbiAgICBpbnB1dC5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIGUgPT4gdGhpcy5zdWJtaXRIYW5kbGVyKGUpKVxuICAgIGlucHV0LmZvY3VzKClcblxuICAgIHJldHVybiBpbnB1dFxuICB9XG5cbiAgZ2VuZXJhdGVPdXRwdXQob3V0ID0gJycpIHtcbiAgICBjb25zdCBwcmUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwcmUnKVxuICAgIHByZS50ZXh0Q29udGVudCA9IG91dFxuICAgIHRoaXMuY29udGFpbmVyLmFwcGVuZENoaWxkKHByZSlcbiAgICByZXR1cm4gdGhpcy5nZW5lcmF0ZVJvdygpXG4gIH1cblxuICBjbGVhcigpIHtcbiAgICB0aGlzLmNvbnRhaW5lci5pbm5lckhUTUwgPSAnJ1xuICAgIHJldHVybiB0aGlzLmdlbmVyYXRlUm93KClcbiAgfVxuXG4gIHN1Ym1pdEhhbmRsZXIoZSkge1xuICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAvLyBSVU4gd2hlbiBFTlRFUiBpcyBwcmVzc2VkXG4gICAgZS50YXJnZXQuc2l6ZSA9IGUudGFyZ2V0LnZhbHVlLmxlbmd0aCArIDIgfHwgM1xuICAgIGlmIChldmVudC53aGljaCA9PSAxMyB8fCBldmVudC5rZXlDb2RlID09IDEzKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIGNvbnN0IGNvbW1hbmQgPSBlLnRhcmdldC52YWx1ZS50cmltKClcblxuICAgICAgaWYgKGNvbW1hbmQgPT09ICdjbGVhcicpIHJldHVybiB0aGlzLmNsZWFyKClcblxuICAgICAgLy8gRVhFQ1xuICAgICAgY29uc3Qgb3V0cHV0ID0gdGhpcy5ydW4oY29tbWFuZClcbiAgICAgIC8vIGlmIGlzIGEge1Byb21pc2V9IHJlc29sdmUgaXQgYWQgcGFyc2UgYXMganNvblxuICAgICAgaWYgKG91dHB1dFsndGhlbiddKSB7XG4gICAgICAgIHJldHVybiBvdXRwdXQudGhlbihyZXMgPT4ge1xuICAgICAgICAgIGlmICh0eXBlb2YgcmVzID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgcmVzID0gSlNPTi5zdHJpbmdpZnkocmVzLCBudWxsLCAyKVxuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICByZXR1cm4gdGhpcy5nZW5lcmF0ZU91dHB1dCgnLWZhdGFsIGh0dHA6IFJlc3BvbnNlIHJlY2VpdmVkIGJ1dCBoYWQgYSBwcm9ibGVtIHBhcnNpbmcgaXQuJylcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHRoaXMuZ2VuZXJhdGVPdXRwdXQocmVzKVxuICAgICAgICB9KS5jYXRjaChlcnIgPT4gdGhpcy5nZW5lcmF0ZU91dHB1dChlcnIubWVzc2FnZSkpXG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5nZW5lcmF0ZU91dHB1dChvdXRwdXQpXG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gVGVybWluYWxcbiIsImNvbnN0IEludGVycHJldGVyID0gcmVxdWlyZSgnLi9JbnRlcnByZXRlcicpXG5jb25zdCBGaWxlc3lzdGVtID0gcmVxdWlyZSgnLi9GaWxlc3lzdGVtJylcblxuLyoqXG4gKiBTaGVsbCBDbGFzcyBpbmhlcml0cyBmcm9tIEludGVycHJldGVyXG4gKiBPcHRpb25zOlxuICogIC0gZmlsZXN5c3RlbSB7T2JqZWN0fVxuICogIC0gY29tbWFuZHMge09iamVjdH1cbiAqICAtIHVzZXIge1N0cmluZ31cbiAqICAtIGhvc3RuYW1lIHtTdHJpbmd9XG4gKi9cbmNsYXNzIFNoZWxsIGV4dGVuZHMgSW50ZXJwcmV0ZXJ7XG4gIGNvbnN0cnVjdG9yKHsgZmlsZXN5c3RlbSA9IHVuZGVmaW5lZCwgY29tbWFuZHMgPSB1bmRlZmluZWQsIHVzZXIgPSAncm9vdCcsIGhvc3RuYW1lID0gJ215Lmhvc3QubWUnIH0gPSB7fSkge1xuICAgIHN1cGVyKClcblxuICAgIHRoaXMucG9seWZpbGxzKClcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSB0aGUgdmlydHVhbCBmaWxlc3lzdGVtXG4gICAgICogQHJldHVybiByZWZlcmVuY2UgdG8gaW5zdGFuY2Ugb2YgQGNsYXNzIEZpbGVzeXN0ZW1cbiAgICAgKi9cbiAgICB0aGlzLmZzID0gbmV3IEZpbGVzeXN0ZW0oZmlsZXN5c3RlbSwgdGhpcylcbiAgICB0aGlzLnVzZXIgPSB1c2VyXG4gICAgdGhpcy5ob3N0bmFtZSA9IGhvc3RuYW1lXG5cbiAgICAvLyBJbml0IGJ1aWx0aW4gY29tbWFuZHMsIEBtZXRob2QgaW4gcGFyZW50XG4gICAgLy8gcGFzcyBzaGVsbCByZWZlcmVuY2VcbiAgICB0aGlzLlNoZWxsQ29tbWFuZHMgPSB0aGlzLnJlZ2lzdGVyQ29tbWFuZHModGhpcylcbiAgICB0aGlzLlNoZWxsQ29tbWFuZHMgPSB7XG4gICAgICAuLi50aGlzLlNoZWxsQ29tbWFuZHMsXG4gICAgICAuLi50aGlzLnJlZ2lzdGVyQ29tbWFuZHModGhpcywgY29tbWFuZHMpLFxuICAgIH1cbiAgfVxuXG4gIHBvbHlmaWxscygpIHtcbiAgICBpZiAoIWdsb2JhbC5Qcm9taXNlKSB7XG4gICAgICBnbG9iYWwuUHJvbWlzZSA9IHJlcXVpcmUoJ3Byb21pc2UtcG9seWZpbGwnKS5Qcm9taXNlXG4gICAgfVxuICAgIGlmICghZ2xvYmFsLmZldGNoKSB7XG4gICAgICBnbG9iYWwuZmV0Y2ggPSByZXF1aXJlKCd3aGF0d2ctZmV0Y2gnKVxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgLyoqXG4gICAqIFBhc3MgY29udHJvbCB0byBJbnRlcnByZXRlclxuICAgKiBAcmV0dXJuIFtTdHJpbmddIE9SIHtQcm9taXNlfSB0byByZXNvbHZlIGZyb20geW91ciB3cmFwcGVyLlxuICAgKi9cbiAgcnVuKGNtZCkge1xuICAgIHJldHVybiB0aGlzLmV4ZWMoY21kKVxuICB9XG59XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShTaGVsbC5wcm90b3R5cGUsICdmcycsIHsgd3JpdGFibGU6IHRydWUsIGVudW1lcmFibGU6IGZhbHNlIH0pXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoU2hlbGwucHJvdG90eXBlLCAnU2hlbGxDb21tYW5kcycsIHsgd3JpdGFibGU6IHRydWUsIGVudW1lcmFibGU6IGZhbHNlIH0pXG5cbm1vZHVsZS5leHBvcnRzID0gU2hlbGxcbiIsImNvbnN0IHsgbmFtZSwgdmVyc2lvbiwgZGVzY3JpcHRpb24sIHJlcG9zaXRvcnksIGF1dGhvciwgbGljZW5zZSB9ID0gcmVxdWlyZSgnLi4vLi4vcGFja2FnZS5qc29uJylcbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIC8qKlxuICAgKiBIZWxwXG4gICAqIEByZXR1cm4gTGlzdCBvZiBjb21tYW5kc1xuICAgKi9cbiAgaGVscDoge1xuICAgIG5hbWU6ICdoZWxwJyxcbiAgICB0eXBlOiAnYnVpbHRpbicsXG4gICAgbWFuOiAnTGlzdCBvZiBhdmFpbGFibGUgY29tbWFuZHMnLFxuICAgIGZuOiBmdW5jdGlvbiBoZWxwKCkge1xuICAgICAgcmV0dXJuIGBDb21tYW5kcyBhdmFpbGFibGU6ICR7T2JqZWN0LmtleXModGhpcy5zaGVsbC5TaGVsbENvbW1hbmRzKS5qb2luKCcsICcpfWBcbiAgICB9XG4gIH0sXG5cbiAgd2hvYW1pOiB7XG4gICAgbmFtZTogJ3dob2FtaScsXG4gICAgdHlwZTogJ2J1aWx0aW4nLFxuICAgIG1hbjogJ0N1cnJlbnQgdXNlcicsXG4gICAgZm46IGZ1bmN0aW9uIHdob2FtaSgpIHtcbiAgICAgIHJldHVybiB0aGlzLnNoZWxsLnVzZXJcbiAgICB9LFxuICB9LFxuXG4gIGFib3V0OiB7XG4gICAgbmFtZTogJ2Fib3V0JyxcbiAgICB0eXBlOiAnYnVpbHRpbicsXG4gICAgbWFuOiAnQWJvdXQgdGhpcyBwcm9qZWN0JyxcbiAgICBmbjogZnVuY3Rpb24gYWJvdXQoKSB7XG4gICAgICBsZXQgc3RyID0gJydcbiAgICAgIHN0ciArPSBgbmFtZTogJHtuYW1lfVxcbmBcbiAgICAgIHN0ciArPSBgdmVyc2lvbjogJHt2ZXJzaW9ufVxcbmBcbiAgICAgIHN0ciArPSBgZGVzY3JpcHRpb246ICR7ZGVzY3JpcHRpb259XFxuYFxuICAgICAgc3RyICs9IGByZXBvc2l0b3J5OiAke3JlcG9zaXRvcnl9XFxuYFxuICAgICAgc3RyICs9IGBhdXRob3I6ICR7YXV0aG9yfVxcbmBcbiAgICAgIHN0ciArPSBgbGljZW5zZTogJHtsaWNlbnNlfVxcbmBcbiAgICAgIHJldHVybiBzdHJcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIFJldHVybiBwYXNzZWQgYXJndW1lbnRzLCBmb3IgdGVzdGluZyBwdXJwb3Nlc1xuICAgKi9cbiAgYXJndW1lbnRzOiB7XG4gICAgbmFtZTogJ2FyZ3VtZW50cycsXG4gICAgdHlwZTogJ2J1aWx0aW4nLFxuICAgIG1hbjogJ1JldHVybiBhcmd1bWVudCBwYXNzZWQsIHVzZWQgZm9yIHRlc3RpbmcgcHVycG9zZScsXG4gICAgZm46IGFyZ3MgPT4gYXJnc1xuICB9LFxuXG4gIC8qKlxuICAgKiBDaGFuZ2UgRGlyZWN0b3J5XG4gICAqIEByZXR1cm4gU3VjY2Vzcy9GYWlsIE1lc3NhZ2UgU3RyaW5nXG4gICAqL1xuICBjZDoge1xuICAgIG5hbWU6ICdjZCcsXG4gICAgdHlwZTogJ2J1aWx0aW4nLFxuICAgIG1hbjogJ0NoYW5nZSBkaXJlY3RvcnksIHBhc3MgYWJzb2x1dGUgb3IgcmVsYXRpdmUgcGF0aDogZWcuIGNkIC9ldGMsIGNkIC8gY2QvbXkvbmVzdGVkL2RpcicsXG4gICAgZm46IGZ1bmN0aW9uIGNkKHBhdGgpIHtcbiAgICAgIGlmICghcGF0aCkgdGhyb3cgbmV3IEVycm9yKCctaW52YWxpZCBObyBwYXRoIHByb3ZpZGVkLicpXG4gICAgICBwYXRoID0gcGF0aC5qb2luKClcbiAgICAgIHRyeXtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2hlbGwuZnMuY2hhbmdlRGlyKHBhdGgpXG4gICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgdGhyb3cgZVxuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogbHMgQ29tbWFuZFxuICAgKiBMaXN0IGRpcmVjdG9yeSBmaWxlc1xuICAgKiBAcGFyYW0gYXJyYXkgb2YgYXJnc1xuICAgKiBAcmV0dXJuIGZvcm1hdHRlZCBTdHJpbmdcbiAgICovXG4gIGxzOiB7XG4gICAgbmFtZTogJ2xzJyxcbiAgICB0eXBlOiAnYnVpbHRpbicsXG4gICAgbWFuOiAnbGlzdCBkaXJlY3RvcnkgZmlsZXMsIHBhc3MgYWJzb2x1dGUvcmVsYXRpdmUgcGF0aCwgaWYgZW1wdHkgbGlzdCBjdXJyZW50IGRpcmVjdG9yeScsXG4gICAgZm46IGZ1bmN0aW9uIGxzKHBhdGggPSBbJy4vJ10gKSB7XG4gICAgICBwYXRoID0gcGF0aC5qb2luKClcbiAgICAgIGxldCBsaXN0LCByZXNwb25zZVN0cmluZyA9ICcnXG4gICAgICB0cnl7XG4gICAgICAgIGxpc3QgPSB0aGlzLnNoZWxsLmZzLmxpc3REaXIocGF0aClcbiAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICB0aHJvdyBlXG4gICAgICB9XG4gICAgICBmb3IgKGxldCBmaWxlIGluIGxpc3QpIHtcbiAgICAgICAgaWYgKGxpc3QuaGFzT3duUHJvcGVydHkoZmlsZSkpIHtcbiAgICAgICAgICByZXNwb25zZVN0cmluZyArPSBgJHtsaXN0W2ZpbGVdLnBlcm1pc3Npb259XFx0JHtsaXN0W2ZpbGVdLnVzZXJ9ICR7bGlzdFtmaWxlXS5ncm91cH1cXHQke2xpc3RbZmlsZV0ubmFtZX1cXG5gXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiByZXNwb25zZVN0cmluZ1xuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogQ0FUIENvbW1hbmRcbiAgICogUmVhZCBGaWxlXG4gICAqIEByZXR1cm4gZm9ybWF0dGVkIFN0cmluZ1xuICAgKi9cbiAgY2F0OiB7XG4gICAgbmFtZTogJ2NhdCcsXG4gICAgdHlwZTogJ2J1aWx0aW4nLFxuICAgIG1hbjogJ1JldHVybiBmaWxlIGNvbnRlbnQsIHRha2Ugb25lIGFyZ3VtZW50OiBmaWxlIHBhdGggKHJlbGF0aXZlL2Fic29sdXRlKScsXG4gICAgZm46IGZ1bmN0aW9uKHBhdGggPSBbJy4vJ10pIHtcbiAgICAgIHBhdGggPSBwYXRoLmpvaW4oKVxuICAgICAgbGV0IGZpbGUsIHJlc3BvbnNlU3RyaW5nID0gJydcbiAgICAgIHRyeXtcbiAgICAgICAgZmlsZSA9IHRoaXMuc2hlbGwuZnMucmVhZEZpbGUocGF0aClcbiAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICB0aHJvdyBlXG4gICAgICB9XG4gICAgICByZXR1cm4gZmlsZS5jb250ZW50XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBNYW5cbiAgICogUmV0dXJuIGNvbW1hbmQgbWFudWFsIGluZm9cbiAgICogQHJldHVybiB7c3RyaW5nfVxuICAgKi9cbiAgbWFuOiB7XG4gICAgbmFtZTogJ21hbicsXG4gICAgdHlwZTogJ2J1aWx0aW4nLFxuICAgIG1hbjogJ0NvbW1hbmQgbWFudWFsLCB0YWtlcyBvbmUgYXJndW1lbnQsIGNvbW1hbmQgbmFtZScsXG4gICAgZm46IGZ1bmN0aW9uIG1hbihhcmdzKSB7XG4gICAgICBpZiAoIWFyZ3MgfHwgIWFyZ3NbMF0pIHRocm93IG5ldyBFcnJvcignbWFuOiBubyBjb21tYW5kIHByb3ZpZGVkLicpXG4gICAgICBsZXQgY29tbWFuZCA9IGFyZ3NbMF1cbiAgICAgIGlmICghdGhpcy5zaGVsbC5TaGVsbENvbW1hbmRzW2NvbW1hbmRdKSB0aHJvdyBuZXcgRXJyb3IoJ2NvbW1hbmQgZG9lc25cXCd0IGV4aXN0LicpXG4gICAgICBpZiAoIXRoaXMuc2hlbGwuU2hlbGxDb21tYW5kc1tjb21tYW5kXS5tYW4pIHRocm93IG5ldyBFcnJvcignbm8gbWFudWFsIGVudHJ5IGZvciB0aGlzIGNvbW1hbmQuJylcbiAgICAgIHJldHVybiB0aGlzLnNoZWxsLlNoZWxsQ29tbWFuZHNbY29tbWFuZF0ubWFuXG4gICAgfSxcbiAgfSxcblxuICAvKipcbiAgICogSFRUUFxuICAgKiBSZXR1cm4gRGF0YSBmcm9tIGFuIEhUVFAgcmVxdWVzdFxuICAgKiBGSVhNRTogTkVFRCBGSVhTIEZPUiBGT1JNIERBVEEgV0lUSCBTUEFDRVNcbiAgICogQHJldHVybiB7c3RyaW5nfVxuICAgKi9cbiAgaHR0cDoge1xuICAgIG5hbWU6ICdodHRwJyxcbiAgICB0eXBlOiAnYnVpbHRpbicsXG4gICAgbWFuOiAnU2VuZCBodHRwIHJlcXVlc3RzLlxcbiBzeW50YXg6IGh0dHAgTUVUSE9EIFtwcm9wZXJ0eTpkYXRhLF0gVVJMLlxcbmVnOiBodHRwIEdFVCBodHRwOi8vanNvbnBsYWNlaG9sZGVyLnR5cGljb2RlLmNvbS9cXG5odHRwIFBPU1QgdGl0bGU6TXlUaXRsZSBodHRwOi8vanNvbnBsYWNlaG9sZGVyLnR5cGljb2RlLmNvbS9wb3N0cycsXG4gICAgZm46IGZ1bmN0aW9uIGh0dHAoYXJncyA9IFtdKSB7XG4gICAgICBpZiAoIWFyZ3MgfHwgIWFyZ3MubGVuZ3RoIHx8IGFyZ3MubGVuZ3RoIDwgMikgdGhyb3cgbmV3IEVycm9yKGBodHRwOiBubyBwYXJhbWV0ZXJzIHByb3ZpZGVkLCBwcm92aWRlIFVSTCBhbmQvb3IgbWV0aG9kIFxcbiBoZWxwOiAke3RoaXMuc2hlbGwuU2hlbGxDb21tYW5kc1snaHR0cCddLm1hbn1gKVxuXG4gICAgICAvLyBHZXQgTWV0aG9kIGFuZCBVUkxcbiAgICAgIGxldCBtZXRob2QsIHVybFxuICAgICAgbWV0aG9kID0gYXJnc1swXS50b1VwcGVyQ2FzZSgpXG4gICAgICB1cmwgPSBhcmdzW2FyZ3MubGVuZ3RoIC0gMV1cblxuICAgICAgLypcbiAgICAgICAqIEJ1aWxkIFBheWxvYWRcbiAgICAgICAqIElmIGFyZ3MgPiAyIHRoZXJlIGFyZSB2YWx1ZXMgaW4gYmVldHdlZW4gbWV0aG9kIGFuZCB1cmxcbiAgICAgICAqIGZvcm1hdCBwcm9wOnZhbHVlXG4gICAgICAgKiBGSVhNRSBTcGFjZSBub3QgYWxsb3dlZCwgbXVzdCBjaGFuZ2UgaG93IGNvbW1hbmRzIGFyZ3VtZW50cyBhcmUgcGFyc2VkXG4gICAgICAgKi9cbiAgICAgIGxldCBwYXlsb2FkID0ge31cbiAgICAgIGlmIChhcmdzLmxlbmd0aCA+IDIpIHtcbiAgICAgICAgYXJncy5tYXAoKGUsIGksIGFycmF5KSA9PiB7XG4gICAgICAgICAgaWYgKGkgIT0gMCAmJiBpICE9PSBhcmdzLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgIGxldCBwYXJzZSA9IGUuc3BsaXQoJzonKVxuICAgICAgICAgICAgcGF5bG9hZFtwYXJzZVswXV0gPSBwYXJzZVsxXVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICAgIGxldCByZXF1ZXN0ID0ge1xuICAgICAgICBtZXRob2QsXG4gICAgICAgIGhlYWRlcnM6IHsgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIgfSxcbiAgICAgIH1cbiAgICAgIGlmIChtZXRob2QgIT09ICdHRVQnKSByZXF1ZXN0LmJvZHkgPSBKU09OLnN0cmluZ2lmeShwYXlsb2FkKVxuICAgICAgcmV0dXJuIGZldGNoKHVybCwgcmVxdWVzdCkudGhlbigocmVzKSA9PiB7XG4gICAgICAgIGlmIChyZXMub2spIHJldHVybiByZXMuanNvbigpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgUmVxdWVzdCBGYWlsZWQgKCR7cmVzLnN0YXR1cyB8fCA1MDB9KTogJHtyZXMuc3RhdHVzVGV4dCB8fCAnU29tZSBFcnJvciBPY2N1cmVkLid9YClcbiAgICAgIH0pXG4gICAgfSxcbiAgfSxcblxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgJ2ZpbGUuaCc6ICcjaW5jbHVkZSA8bm9wZS5oPicsXG5cbiAgZXRjOiB7XG4gICAgYXBhY2hlMjoge1xuICAgICAgJ2FwYWNoZTIuY29uZic6ICdOb3QgV2hhdCB5b3Ugd2VyZSBsb29raW5nIGZvciA6KScsXG4gICAgfSxcbiAgfSxcblxuICBob21lOiB7XG4gICAgZ3Vlc3Q6IHtcbiAgICAgIGRvY3M6IHtcbiAgICAgICAgJ215ZG9jLm1kJzogJ1Rlc3RGaWxlJyxcbiAgICAgICAgJ215ZG9jMi5tZCc6ICdUZXN0RmlsZTInLFxuICAgICAgICAnbXlkb2MzLm1kJzogJ1Rlc3RGaWxlMycsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG5cbiAgcm9vdDp7XG4gICAgJy56c2hyYyc6ICdub3QgZXZlbiBjbG9zZSA6KScsXG4gICAgJy5vaC1teS16c2gnOiB7XG4gICAgICB0aGVtZXM6IHt9LFxuICAgIH0sXG4gIH0sXG59XG4iLCIvKipcbiAqIFNoZWxsIE9ubHlcbiAqIEB0eXBlIHtDbGFzc31cbiAqIEluaXQgdGhlIHNoZWxsIHdpdGggY29tbWFuZCBhbmQgZmlsZXN5c3RlbVxuICogQG1ldGhvZCBleGVjdXRlKCkgZXhwb3NlZCB0byBxdWVyeSB0aGUgU2hlbGwgd2l0aCBjb21tYW5kc1xuICovXG5nbG9iYWxbJ1Rlcm1seVByb21wdCddID0gcmVxdWlyZSgnLi9jbGFzc2VzL1Byb21wdCcpXG4iLCIoZnVuY3Rpb24gKHJvb3QpIHtcblxuICAvLyBTdG9yZSBzZXRUaW1lb3V0IHJlZmVyZW5jZSBzbyBwcm9taXNlLXBvbHlmaWxsIHdpbGwgYmUgdW5hZmZlY3RlZCBieVxuICAvLyBvdGhlciBjb2RlIG1vZGlmeWluZyBzZXRUaW1lb3V0IChsaWtlIHNpbm9uLnVzZUZha2VUaW1lcnMoKSlcbiAgdmFyIHNldFRpbWVvdXRGdW5jID0gc2V0VGltZW91dDtcblxuICBmdW5jdGlvbiBub29wKCkge31cbiAgXG4gIC8vIFBvbHlmaWxsIGZvciBGdW5jdGlvbi5wcm90b3R5cGUuYmluZFxuICBmdW5jdGlvbiBiaW5kKGZuLCB0aGlzQXJnKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgIGZuLmFwcGx5KHRoaXNBcmcsIGFyZ3VtZW50cyk7XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIFByb21pc2UoZm4pIHtcbiAgICBpZiAodHlwZW9mIHRoaXMgIT09ICdvYmplY3QnKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdQcm9taXNlcyBtdXN0IGJlIGNvbnN0cnVjdGVkIHZpYSBuZXcnKTtcbiAgICBpZiAodHlwZW9mIGZuICE9PSAnZnVuY3Rpb24nKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdub3QgYSBmdW5jdGlvbicpO1xuICAgIHRoaXMuX3N0YXRlID0gMDtcbiAgICB0aGlzLl9oYW5kbGVkID0gZmFsc2U7XG4gICAgdGhpcy5fdmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5fZGVmZXJyZWRzID0gW107XG5cbiAgICBkb1Jlc29sdmUoZm4sIHRoaXMpO1xuICB9XG5cbiAgZnVuY3Rpb24gaGFuZGxlKHNlbGYsIGRlZmVycmVkKSB7XG4gICAgd2hpbGUgKHNlbGYuX3N0YXRlID09PSAzKSB7XG4gICAgICBzZWxmID0gc2VsZi5fdmFsdWU7XG4gICAgfVxuICAgIGlmIChzZWxmLl9zdGF0ZSA9PT0gMCkge1xuICAgICAgc2VsZi5fZGVmZXJyZWRzLnB1c2goZGVmZXJyZWQpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBzZWxmLl9oYW5kbGVkID0gdHJ1ZTtcbiAgICBQcm9taXNlLl9pbW1lZGlhdGVGbihmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgY2IgPSBzZWxmLl9zdGF0ZSA9PT0gMSA/IGRlZmVycmVkLm9uRnVsZmlsbGVkIDogZGVmZXJyZWQub25SZWplY3RlZDtcbiAgICAgIGlmIChjYiA9PT0gbnVsbCkge1xuICAgICAgICAoc2VsZi5fc3RhdGUgPT09IDEgPyByZXNvbHZlIDogcmVqZWN0KShkZWZlcnJlZC5wcm9taXNlLCBzZWxmLl92YWx1ZSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHZhciByZXQ7XG4gICAgICB0cnkge1xuICAgICAgICByZXQgPSBjYihzZWxmLl92YWx1ZSk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHJlamVjdChkZWZlcnJlZC5wcm9taXNlLCBlKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgcmVzb2x2ZShkZWZlcnJlZC5wcm9taXNlLCByZXQpO1xuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVzb2x2ZShzZWxmLCBuZXdWYWx1ZSkge1xuICAgIHRyeSB7XG4gICAgICAvLyBQcm9taXNlIFJlc29sdXRpb24gUHJvY2VkdXJlOiBodHRwczovL2dpdGh1Yi5jb20vcHJvbWlzZXMtYXBsdXMvcHJvbWlzZXMtc3BlYyN0aGUtcHJvbWlzZS1yZXNvbHV0aW9uLXByb2NlZHVyZVxuICAgICAgaWYgKG5ld1ZhbHVlID09PSBzZWxmKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdBIHByb21pc2UgY2Fubm90IGJlIHJlc29sdmVkIHdpdGggaXRzZWxmLicpO1xuICAgICAgaWYgKG5ld1ZhbHVlICYmICh0eXBlb2YgbmV3VmFsdWUgPT09ICdvYmplY3QnIHx8IHR5cGVvZiBuZXdWYWx1ZSA9PT0gJ2Z1bmN0aW9uJykpIHtcbiAgICAgICAgdmFyIHRoZW4gPSBuZXdWYWx1ZS50aGVuO1xuICAgICAgICBpZiAobmV3VmFsdWUgaW5zdGFuY2VvZiBQcm9taXNlKSB7XG4gICAgICAgICAgc2VsZi5fc3RhdGUgPSAzO1xuICAgICAgICAgIHNlbGYuX3ZhbHVlID0gbmV3VmFsdWU7XG4gICAgICAgICAgZmluYWxlKHNlbGYpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdGhlbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIGRvUmVzb2x2ZShiaW5kKHRoZW4sIG5ld1ZhbHVlKSwgc2VsZik7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBzZWxmLl9zdGF0ZSA9IDE7XG4gICAgICBzZWxmLl92YWx1ZSA9IG5ld1ZhbHVlO1xuICAgICAgZmluYWxlKHNlbGYpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJlamVjdChzZWxmLCBlKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiByZWplY3Qoc2VsZiwgbmV3VmFsdWUpIHtcbiAgICBzZWxmLl9zdGF0ZSA9IDI7XG4gICAgc2VsZi5fdmFsdWUgPSBuZXdWYWx1ZTtcbiAgICBmaW5hbGUoc2VsZik7XG4gIH1cblxuICBmdW5jdGlvbiBmaW5hbGUoc2VsZikge1xuICAgIGlmIChzZWxmLl9zdGF0ZSA9PT0gMiAmJiBzZWxmLl9kZWZlcnJlZHMubGVuZ3RoID09PSAwKSB7XG4gICAgICBQcm9taXNlLl9pbW1lZGlhdGVGbihmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCFzZWxmLl9oYW5kbGVkKSB7XG4gICAgICAgICAgUHJvbWlzZS5fdW5oYW5kbGVkUmVqZWN0aW9uRm4oc2VsZi5fdmFsdWUpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gc2VsZi5fZGVmZXJyZWRzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBoYW5kbGUoc2VsZiwgc2VsZi5fZGVmZXJyZWRzW2ldKTtcbiAgICB9XG4gICAgc2VsZi5fZGVmZXJyZWRzID0gbnVsbDtcbiAgfVxuXG4gIGZ1bmN0aW9uIEhhbmRsZXIob25GdWxmaWxsZWQsIG9uUmVqZWN0ZWQsIHByb21pc2UpIHtcbiAgICB0aGlzLm9uRnVsZmlsbGVkID0gdHlwZW9mIG9uRnVsZmlsbGVkID09PSAnZnVuY3Rpb24nID8gb25GdWxmaWxsZWQgOiBudWxsO1xuICAgIHRoaXMub25SZWplY3RlZCA9IHR5cGVvZiBvblJlamVjdGVkID09PSAnZnVuY3Rpb24nID8gb25SZWplY3RlZCA6IG51bGw7XG4gICAgdGhpcy5wcm9taXNlID0gcHJvbWlzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUYWtlIGEgcG90ZW50aWFsbHkgbWlzYmVoYXZpbmcgcmVzb2x2ZXIgZnVuY3Rpb24gYW5kIG1ha2Ugc3VyZVxuICAgKiBvbkZ1bGZpbGxlZCBhbmQgb25SZWplY3RlZCBhcmUgb25seSBjYWxsZWQgb25jZS5cbiAgICpcbiAgICogTWFrZXMgbm8gZ3VhcmFudGVlcyBhYm91dCBhc3luY2hyb255LlxuICAgKi9cbiAgZnVuY3Rpb24gZG9SZXNvbHZlKGZuLCBzZWxmKSB7XG4gICAgdmFyIGRvbmUgPSBmYWxzZTtcbiAgICB0cnkge1xuICAgICAgZm4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIGlmIChkb25lKSByZXR1cm47XG4gICAgICAgIGRvbmUgPSB0cnVlO1xuICAgICAgICByZXNvbHZlKHNlbGYsIHZhbHVlKTtcbiAgICAgIH0sIGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgICAgaWYgKGRvbmUpIHJldHVybjtcbiAgICAgICAgZG9uZSA9IHRydWU7XG4gICAgICAgIHJlamVjdChzZWxmLCByZWFzb24pO1xuICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgIGlmIChkb25lKSByZXR1cm47XG4gICAgICBkb25lID0gdHJ1ZTtcbiAgICAgIHJlamVjdChzZWxmLCBleCk7XG4gICAgfVxuICB9XG5cbiAgUHJvbWlzZS5wcm90b3R5cGVbJ2NhdGNoJ10gPSBmdW5jdGlvbiAob25SZWplY3RlZCkge1xuICAgIHJldHVybiB0aGlzLnRoZW4obnVsbCwgb25SZWplY3RlZCk7XG4gIH07XG5cbiAgUHJvbWlzZS5wcm90b3R5cGUudGhlbiA9IGZ1bmN0aW9uIChvbkZ1bGZpbGxlZCwgb25SZWplY3RlZCkge1xuICAgIHZhciBwcm9tID0gbmV3ICh0aGlzLmNvbnN0cnVjdG9yKShub29wKTtcblxuICAgIGhhbmRsZSh0aGlzLCBuZXcgSGFuZGxlcihvbkZ1bGZpbGxlZCwgb25SZWplY3RlZCwgcHJvbSkpO1xuICAgIHJldHVybiBwcm9tO1xuICB9O1xuXG4gIFByb21pc2UuYWxsID0gZnVuY3Rpb24gKGFycikge1xuICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJyKTtcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICBpZiAoYXJncy5sZW5ndGggPT09IDApIHJldHVybiByZXNvbHZlKFtdKTtcbiAgICAgIHZhciByZW1haW5pbmcgPSBhcmdzLmxlbmd0aDtcblxuICAgICAgZnVuY3Rpb24gcmVzKGksIHZhbCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGlmICh2YWwgJiYgKHR5cGVvZiB2YWwgPT09ICdvYmplY3QnIHx8IHR5cGVvZiB2YWwgPT09ICdmdW5jdGlvbicpKSB7XG4gICAgICAgICAgICB2YXIgdGhlbiA9IHZhbC50aGVuO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiB0aGVuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgIHRoZW4uY2FsbCh2YWwsIGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgICAgICAgICAgICByZXMoaSwgdmFsKTtcbiAgICAgICAgICAgICAgfSwgcmVqZWN0KTtcbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBhcmdzW2ldID0gdmFsO1xuICAgICAgICAgIGlmICgtLXJlbWFpbmluZyA9PT0gMCkge1xuICAgICAgICAgICAgcmVzb2x2ZShhcmdzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGV4KSB7XG4gICAgICAgICAgcmVqZWN0KGV4KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgcmVzKGksIGFyZ3NbaV0pO1xuICAgICAgfVxuICAgIH0pO1xuICB9O1xuXG4gIFByb21pc2UucmVzb2x2ZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlLmNvbnN0cnVjdG9yID09PSBQcm9taXNlKSB7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlKSB7XG4gICAgICByZXNvbHZlKHZhbHVlKTtcbiAgICB9KTtcbiAgfTtcblxuICBQcm9taXNlLnJlamVjdCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICByZWplY3QodmFsdWUpO1xuICAgIH0pO1xuICB9O1xuXG4gIFByb21pc2UucmFjZSA9IGZ1bmN0aW9uICh2YWx1ZXMpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHZhbHVlcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICB2YWx1ZXNbaV0udGhlbihyZXNvbHZlLCByZWplY3QpO1xuICAgICAgfVxuICAgIH0pO1xuICB9O1xuXG4gIC8vIFVzZSBwb2x5ZmlsbCBmb3Igc2V0SW1tZWRpYXRlIGZvciBwZXJmb3JtYW5jZSBnYWluc1xuICBQcm9taXNlLl9pbW1lZGlhdGVGbiA9ICh0eXBlb2Ygc2V0SW1tZWRpYXRlID09PSAnZnVuY3Rpb24nICYmIGZ1bmN0aW9uIChmbikgeyBzZXRJbW1lZGlhdGUoZm4pOyB9KSB8fFxuICAgIGZ1bmN0aW9uIChmbikge1xuICAgICAgc2V0VGltZW91dEZ1bmMoZm4sIDApO1xuICAgIH07XG5cbiAgUHJvbWlzZS5fdW5oYW5kbGVkUmVqZWN0aW9uRm4gPSBmdW5jdGlvbiBfdW5oYW5kbGVkUmVqZWN0aW9uRm4oZXJyKSB7XG4gICAgaWYgKHR5cGVvZiBjb25zb2xlICE9PSAndW5kZWZpbmVkJyAmJiBjb25zb2xlKSB7XG4gICAgICBjb25zb2xlLndhcm4oJ1Bvc3NpYmxlIFVuaGFuZGxlZCBQcm9taXNlIFJlamVjdGlvbjonLCBlcnIpOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWNvbnNvbGVcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIFNldCB0aGUgaW1tZWRpYXRlIGZ1bmN0aW9uIHRvIGV4ZWN1dGUgY2FsbGJhY2tzXG4gICAqIEBwYXJhbSBmbiB7ZnVuY3Rpb259IEZ1bmN0aW9uIHRvIGV4ZWN1dGVcbiAgICogQGRlcHJlY2F0ZWRcbiAgICovXG4gIFByb21pc2UuX3NldEltbWVkaWF0ZUZuID0gZnVuY3Rpb24gX3NldEltbWVkaWF0ZUZuKGZuKSB7XG4gICAgUHJvbWlzZS5faW1tZWRpYXRlRm4gPSBmbjtcbiAgfTtcblxuICAvKipcbiAgICogQ2hhbmdlIHRoZSBmdW5jdGlvbiB0byBleGVjdXRlIG9uIHVuaGFuZGxlZCByZWplY3Rpb25cbiAgICogQHBhcmFtIHtmdW5jdGlvbn0gZm4gRnVuY3Rpb24gdG8gZXhlY3V0ZSBvbiB1bmhhbmRsZWQgcmVqZWN0aW9uXG4gICAqIEBkZXByZWNhdGVkXG4gICAqL1xuICBQcm9taXNlLl9zZXRVbmhhbmRsZWRSZWplY3Rpb25GbiA9IGZ1bmN0aW9uIF9zZXRVbmhhbmRsZWRSZWplY3Rpb25Gbihmbikge1xuICAgIFByb21pc2UuX3VuaGFuZGxlZFJlamVjdGlvbkZuID0gZm47XG4gIH07XG4gIFxuICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IFByb21pc2U7XG4gIH0gZWxzZSBpZiAoIXJvb3QuUHJvbWlzZSkge1xuICAgIHJvb3QuUHJvbWlzZSA9IFByb21pc2U7XG4gIH1cblxufSkodGhpcyk7XG4iLCIoZnVuY3Rpb24oc2VsZikge1xuICAndXNlIHN0cmljdCc7XG5cbiAgaWYgKHNlbGYuZmV0Y2gpIHtcbiAgICByZXR1cm5cbiAgfVxuXG4gIHZhciBzdXBwb3J0ID0ge1xuICAgIHNlYXJjaFBhcmFtczogJ1VSTFNlYXJjaFBhcmFtcycgaW4gc2VsZixcbiAgICBpdGVyYWJsZTogJ1N5bWJvbCcgaW4gc2VsZiAmJiAnaXRlcmF0b3InIGluIFN5bWJvbCxcbiAgICBibG9iOiAnRmlsZVJlYWRlcicgaW4gc2VsZiAmJiAnQmxvYicgaW4gc2VsZiAmJiAoZnVuY3Rpb24oKSB7XG4gICAgICB0cnkge1xuICAgICAgICBuZXcgQmxvYigpXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG4gICAgfSkoKSxcbiAgICBmb3JtRGF0YTogJ0Zvcm1EYXRhJyBpbiBzZWxmLFxuICAgIGFycmF5QnVmZmVyOiAnQXJyYXlCdWZmZXInIGluIHNlbGZcbiAgfVxuXG4gIGlmIChzdXBwb3J0LmFycmF5QnVmZmVyKSB7XG4gICAgdmFyIHZpZXdDbGFzc2VzID0gW1xuICAgICAgJ1tvYmplY3QgSW50OEFycmF5XScsXG4gICAgICAnW29iamVjdCBVaW50OEFycmF5XScsXG4gICAgICAnW29iamVjdCBVaW50OENsYW1wZWRBcnJheV0nLFxuICAgICAgJ1tvYmplY3QgSW50MTZBcnJheV0nLFxuICAgICAgJ1tvYmplY3QgVWludDE2QXJyYXldJyxcbiAgICAgICdbb2JqZWN0IEludDMyQXJyYXldJyxcbiAgICAgICdbb2JqZWN0IFVpbnQzMkFycmF5XScsXG4gICAgICAnW29iamVjdCBGbG9hdDMyQXJyYXldJyxcbiAgICAgICdbb2JqZWN0IEZsb2F0NjRBcnJheV0nXG4gICAgXVxuXG4gICAgdmFyIGlzRGF0YVZpZXcgPSBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiBvYmogJiYgRGF0YVZpZXcucHJvdG90eXBlLmlzUHJvdG90eXBlT2Yob2JqKVxuICAgIH1cblxuICAgIHZhciBpc0FycmF5QnVmZmVyVmlldyA9IEFycmF5QnVmZmVyLmlzVmlldyB8fCBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiBvYmogJiYgdmlld0NsYXNzZXMuaW5kZXhPZihPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKSkgPiAtMVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIG5vcm1hbGl6ZU5hbWUobmFtZSkge1xuICAgIGlmICh0eXBlb2YgbmFtZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIG5hbWUgPSBTdHJpbmcobmFtZSlcbiAgICB9XG4gICAgaWYgKC9bXmEtejAtOVxcLSMkJSYnKisuXFxeX2B8fl0vaS50ZXN0KG5hbWUpKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIGNoYXJhY3RlciBpbiBoZWFkZXIgZmllbGQgbmFtZScpXG4gICAgfVxuICAgIHJldHVybiBuYW1lLnRvTG93ZXJDYXNlKClcbiAgfVxuXG4gIGZ1bmN0aW9uIG5vcm1hbGl6ZVZhbHVlKHZhbHVlKSB7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHZhbHVlID0gU3RyaW5nKHZhbHVlKVxuICAgIH1cbiAgICByZXR1cm4gdmFsdWVcbiAgfVxuXG4gIC8vIEJ1aWxkIGEgZGVzdHJ1Y3RpdmUgaXRlcmF0b3IgZm9yIHRoZSB2YWx1ZSBsaXN0XG4gIGZ1bmN0aW9uIGl0ZXJhdG9yRm9yKGl0ZW1zKSB7XG4gICAgdmFyIGl0ZXJhdG9yID0ge1xuICAgICAgbmV4dDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IGl0ZW1zLnNoaWZ0KClcbiAgICAgICAgcmV0dXJuIHtkb25lOiB2YWx1ZSA9PT0gdW5kZWZpbmVkLCB2YWx1ZTogdmFsdWV9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHN1cHBvcnQuaXRlcmFibGUpIHtcbiAgICAgIGl0ZXJhdG9yW1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGl0ZXJhdG9yXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGl0ZXJhdG9yXG4gIH1cblxuICBmdW5jdGlvbiBIZWFkZXJzKGhlYWRlcnMpIHtcbiAgICB0aGlzLm1hcCA9IHt9XG5cbiAgICBpZiAoaGVhZGVycyBpbnN0YW5jZW9mIEhlYWRlcnMpIHtcbiAgICAgIGhlYWRlcnMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwgbmFtZSkge1xuICAgICAgICB0aGlzLmFwcGVuZChuYW1lLCB2YWx1ZSlcbiAgICAgIH0sIHRoaXMpXG5cbiAgICB9IGVsc2UgaWYgKGhlYWRlcnMpIHtcbiAgICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGhlYWRlcnMpLmZvckVhY2goZnVuY3Rpb24obmFtZSkge1xuICAgICAgICB0aGlzLmFwcGVuZChuYW1lLCBoZWFkZXJzW25hbWVdKVxuICAgICAgfSwgdGhpcylcbiAgICB9XG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5hcHBlbmQgPSBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICAgIG5hbWUgPSBub3JtYWxpemVOYW1lKG5hbWUpXG4gICAgdmFsdWUgPSBub3JtYWxpemVWYWx1ZSh2YWx1ZSlcbiAgICB2YXIgb2xkVmFsdWUgPSB0aGlzLm1hcFtuYW1lXVxuICAgIHRoaXMubWFwW25hbWVdID0gb2xkVmFsdWUgPyBvbGRWYWx1ZSsnLCcrdmFsdWUgOiB2YWx1ZVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGVbJ2RlbGV0ZSddID0gZnVuY3Rpb24obmFtZSkge1xuICAgIGRlbGV0ZSB0aGlzLm1hcFtub3JtYWxpemVOYW1lKG5hbWUpXVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24obmFtZSkge1xuICAgIG5hbWUgPSBub3JtYWxpemVOYW1lKG5hbWUpXG4gICAgcmV0dXJuIHRoaXMuaGFzKG5hbWUpID8gdGhpcy5tYXBbbmFtZV0gOiBudWxsXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5oYXMgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMubWFwLmhhc093blByb3BlcnR5KG5vcm1hbGl6ZU5hbWUobmFtZSkpXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICAgIHRoaXMubWFwW25vcm1hbGl6ZU5hbWUobmFtZSldID0gbm9ybWFsaXplVmFsdWUodmFsdWUpXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5mb3JFYWNoID0gZnVuY3Rpb24oY2FsbGJhY2ssIHRoaXNBcmcpIHtcbiAgICBmb3IgKHZhciBuYW1lIGluIHRoaXMubWFwKSB7XG4gICAgICBpZiAodGhpcy5tYXAuaGFzT3duUHJvcGVydHkobmFtZSkpIHtcbiAgICAgICAgY2FsbGJhY2suY2FsbCh0aGlzQXJnLCB0aGlzLm1hcFtuYW1lXSwgbmFtZSwgdGhpcylcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5rZXlzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGl0ZW1zID0gW11cbiAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24odmFsdWUsIG5hbWUpIHsgaXRlbXMucHVzaChuYW1lKSB9KVxuICAgIHJldHVybiBpdGVyYXRvckZvcihpdGVtcylcbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLnZhbHVlcyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpdGVtcyA9IFtdXG4gICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlKSB7IGl0ZW1zLnB1c2godmFsdWUpIH0pXG4gICAgcmV0dXJuIGl0ZXJhdG9yRm9yKGl0ZW1zKVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuZW50cmllcyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpdGVtcyA9IFtdXG4gICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlLCBuYW1lKSB7IGl0ZW1zLnB1c2goW25hbWUsIHZhbHVlXSkgfSlcbiAgICByZXR1cm4gaXRlcmF0b3JGb3IoaXRlbXMpXG4gIH1cblxuICBpZiAoc3VwcG9ydC5pdGVyYWJsZSkge1xuICAgIEhlYWRlcnMucHJvdG90eXBlW1N5bWJvbC5pdGVyYXRvcl0gPSBIZWFkZXJzLnByb3RvdHlwZS5lbnRyaWVzXG4gIH1cblxuICBmdW5jdGlvbiBjb25zdW1lZChib2R5KSB7XG4gICAgaWYgKGJvZHkuYm9keVVzZWQpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgVHlwZUVycm9yKCdBbHJlYWR5IHJlYWQnKSlcbiAgICB9XG4gICAgYm9keS5ib2R5VXNlZCA9IHRydWVcbiAgfVxuXG4gIGZ1bmN0aW9uIGZpbGVSZWFkZXJSZWFkeShyZWFkZXIpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICByZWFkZXIub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJlc29sdmUocmVhZGVyLnJlc3VsdClcbiAgICAgIH1cbiAgICAgIHJlYWRlci5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJlamVjdChyZWFkZXIuZXJyb3IpXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlYWRCbG9iQXNBcnJheUJ1ZmZlcihibG9iKSB7XG4gICAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKClcbiAgICB2YXIgcHJvbWlzZSA9IGZpbGVSZWFkZXJSZWFkeShyZWFkZXIpXG4gICAgcmVhZGVyLnJlYWRBc0FycmF5QnVmZmVyKGJsb2IpXG4gICAgcmV0dXJuIHByb21pc2VcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlYWRCbG9iQXNUZXh0KGJsb2IpIHtcbiAgICB2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKVxuICAgIHZhciBwcm9taXNlID0gZmlsZVJlYWRlclJlYWR5KHJlYWRlcilcbiAgICByZWFkZXIucmVhZEFzVGV4dChibG9iKVxuICAgIHJldHVybiBwcm9taXNlXG4gIH1cblxuICBmdW5jdGlvbiByZWFkQXJyYXlCdWZmZXJBc1RleHQoYnVmKSB7XG4gICAgdmFyIHZpZXcgPSBuZXcgVWludDhBcnJheShidWYpXG4gICAgdmFyIGNoYXJzID0gbmV3IEFycmF5KHZpZXcubGVuZ3RoKVxuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB2aWV3Lmxlbmd0aDsgaSsrKSB7XG4gICAgICBjaGFyc1tpXSA9IFN0cmluZy5mcm9tQ2hhckNvZGUodmlld1tpXSlcbiAgICB9XG4gICAgcmV0dXJuIGNoYXJzLmpvaW4oJycpXG4gIH1cblxuICBmdW5jdGlvbiBidWZmZXJDbG9uZShidWYpIHtcbiAgICBpZiAoYnVmLnNsaWNlKSB7XG4gICAgICByZXR1cm4gYnVmLnNsaWNlKDApXG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciB2aWV3ID0gbmV3IFVpbnQ4QXJyYXkoYnVmLmJ5dGVMZW5ndGgpXG4gICAgICB2aWV3LnNldChuZXcgVWludDhBcnJheShidWYpKVxuICAgICAgcmV0dXJuIHZpZXcuYnVmZmVyXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gQm9keSgpIHtcbiAgICB0aGlzLmJvZHlVc2VkID0gZmFsc2VcblxuICAgIHRoaXMuX2luaXRCb2R5ID0gZnVuY3Rpb24oYm9keSkge1xuICAgICAgdGhpcy5fYm9keUluaXQgPSBib2R5XG4gICAgICBpZiAoIWJvZHkpIHtcbiAgICAgICAgdGhpcy5fYm9keVRleHQgPSAnJ1xuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgYm9keSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgdGhpcy5fYm9keVRleHQgPSBib2R5XG4gICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuYmxvYiAmJiBCbG9iLnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGJvZHkpKSB7XG4gICAgICAgIHRoaXMuX2JvZHlCbG9iID0gYm9keVxuICAgICAgfSBlbHNlIGlmIChzdXBwb3J0LmZvcm1EYXRhICYmIEZvcm1EYXRhLnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGJvZHkpKSB7XG4gICAgICAgIHRoaXMuX2JvZHlGb3JtRGF0YSA9IGJvZHlcbiAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5zZWFyY2hQYXJhbXMgJiYgVVJMU2VhcmNoUGFyYW1zLnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGJvZHkpKSB7XG4gICAgICAgIHRoaXMuX2JvZHlUZXh0ID0gYm9keS50b1N0cmluZygpXG4gICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuYXJyYXlCdWZmZXIgJiYgc3VwcG9ydC5ibG9iICYmIGlzRGF0YVZpZXcoYm9keSkpIHtcbiAgICAgICAgdGhpcy5fYm9keUFycmF5QnVmZmVyID0gYnVmZmVyQ2xvbmUoYm9keS5idWZmZXIpXG4gICAgICAgIC8vIElFIDEwLTExIGNhbid0IGhhbmRsZSBhIERhdGFWaWV3IGJvZHkuXG4gICAgICAgIHRoaXMuX2JvZHlJbml0ID0gbmV3IEJsb2IoW3RoaXMuX2JvZHlBcnJheUJ1ZmZlcl0pXG4gICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuYXJyYXlCdWZmZXIgJiYgKEFycmF5QnVmZmVyLnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGJvZHkpIHx8IGlzQXJyYXlCdWZmZXJWaWV3KGJvZHkpKSkge1xuICAgICAgICB0aGlzLl9ib2R5QXJyYXlCdWZmZXIgPSBidWZmZXJDbG9uZShib2R5KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCd1bnN1cHBvcnRlZCBCb2R5SW5pdCB0eXBlJylcbiAgICAgIH1cblxuICAgICAgaWYgKCF0aGlzLmhlYWRlcnMuZ2V0KCdjb250ZW50LXR5cGUnKSkge1xuICAgICAgICBpZiAodHlwZW9mIGJvZHkgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgdGhpcy5oZWFkZXJzLnNldCgnY29udGVudC10eXBlJywgJ3RleHQvcGxhaW47Y2hhcnNldD1VVEYtOCcpXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fYm9keUJsb2IgJiYgdGhpcy5fYm9keUJsb2IudHlwZSkge1xuICAgICAgICAgIHRoaXMuaGVhZGVycy5zZXQoJ2NvbnRlbnQtdHlwZScsIHRoaXMuX2JvZHlCbG9iLnR5cGUpXG4gICAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5zZWFyY2hQYXJhbXMgJiYgVVJMU2VhcmNoUGFyYW1zLnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGJvZHkpKSB7XG4gICAgICAgICAgdGhpcy5oZWFkZXJzLnNldCgnY29udGVudC10eXBlJywgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZDtjaGFyc2V0PVVURi04JylcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChzdXBwb3J0LmJsb2IpIHtcbiAgICAgIHRoaXMuYmxvYiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcmVqZWN0ZWQgPSBjb25zdW1lZCh0aGlzKVxuICAgICAgICBpZiAocmVqZWN0ZWQpIHtcbiAgICAgICAgICByZXR1cm4gcmVqZWN0ZWRcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLl9ib2R5QmxvYikge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcy5fYm9keUJsb2IpXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fYm9keUFycmF5QnVmZmVyKSB7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShuZXcgQmxvYihbdGhpcy5fYm9keUFycmF5QnVmZmVyXSkpXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fYm9keUZvcm1EYXRhKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjb3VsZCBub3QgcmVhZCBGb3JtRGF0YSBib2R5IGFzIGJsb2InKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobmV3IEJsb2IoW3RoaXMuX2JvZHlUZXh0XSkpXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5hcnJheUJ1ZmZlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5fYm9keUFycmF5QnVmZmVyKSB7XG4gICAgICAgICAgcmV0dXJuIGNvbnN1bWVkKHRoaXMpIHx8IFByb21pc2UucmVzb2x2ZSh0aGlzLl9ib2R5QXJyYXlCdWZmZXIpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuYmxvYigpLnRoZW4ocmVhZEJsb2JBc0FycmF5QnVmZmVyKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy50ZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcmVqZWN0ZWQgPSBjb25zdW1lZCh0aGlzKVxuICAgICAgaWYgKHJlamVjdGVkKSB7XG4gICAgICAgIHJldHVybiByZWplY3RlZFxuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5fYm9keUJsb2IpIHtcbiAgICAgICAgcmV0dXJuIHJlYWRCbG9iQXNUZXh0KHRoaXMuX2JvZHlCbG9iKVxuICAgICAgfSBlbHNlIGlmICh0aGlzLl9ib2R5QXJyYXlCdWZmZXIpIHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShyZWFkQXJyYXlCdWZmZXJBc1RleHQodGhpcy5fYm9keUFycmF5QnVmZmVyKSlcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5fYm9keUZvcm1EYXRhKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignY291bGQgbm90IHJlYWQgRm9ybURhdGEgYm9keSBhcyB0ZXh0JylcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcy5fYm9keVRleHQpXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHN1cHBvcnQuZm9ybURhdGEpIHtcbiAgICAgIHRoaXMuZm9ybURhdGEgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGV4dCgpLnRoZW4oZGVjb2RlKVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuanNvbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMudGV4dCgpLnRoZW4oSlNPTi5wYXJzZSlcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLy8gSFRUUCBtZXRob2RzIHdob3NlIGNhcGl0YWxpemF0aW9uIHNob3VsZCBiZSBub3JtYWxpemVkXG4gIHZhciBtZXRob2RzID0gWydERUxFVEUnLCAnR0VUJywgJ0hFQUQnLCAnT1BUSU9OUycsICdQT1NUJywgJ1BVVCddXG5cbiAgZnVuY3Rpb24gbm9ybWFsaXplTWV0aG9kKG1ldGhvZCkge1xuICAgIHZhciB1cGNhc2VkID0gbWV0aG9kLnRvVXBwZXJDYXNlKClcbiAgICByZXR1cm4gKG1ldGhvZHMuaW5kZXhPZih1cGNhc2VkKSA+IC0xKSA/IHVwY2FzZWQgOiBtZXRob2RcbiAgfVxuXG4gIGZ1bmN0aW9uIFJlcXVlc3QoaW5wdXQsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxuICAgIHZhciBib2R5ID0gb3B0aW9ucy5ib2R5XG5cbiAgICBpZiAoaW5wdXQgaW5zdGFuY2VvZiBSZXF1ZXN0KSB7XG4gICAgICBpZiAoaW5wdXQuYm9keVVzZWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQWxyZWFkeSByZWFkJylcbiAgICAgIH1cbiAgICAgIHRoaXMudXJsID0gaW5wdXQudXJsXG4gICAgICB0aGlzLmNyZWRlbnRpYWxzID0gaW5wdXQuY3JlZGVudGlhbHNcbiAgICAgIGlmICghb3B0aW9ucy5oZWFkZXJzKSB7XG4gICAgICAgIHRoaXMuaGVhZGVycyA9IG5ldyBIZWFkZXJzKGlucHV0LmhlYWRlcnMpXG4gICAgICB9XG4gICAgICB0aGlzLm1ldGhvZCA9IGlucHV0Lm1ldGhvZFxuICAgICAgdGhpcy5tb2RlID0gaW5wdXQubW9kZVxuICAgICAgaWYgKCFib2R5ICYmIGlucHV0Ll9ib2R5SW5pdCAhPSBudWxsKSB7XG4gICAgICAgIGJvZHkgPSBpbnB1dC5fYm9keUluaXRcbiAgICAgICAgaW5wdXQuYm9keVVzZWQgPSB0cnVlXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMudXJsID0gU3RyaW5nKGlucHV0KVxuICAgIH1cblxuICAgIHRoaXMuY3JlZGVudGlhbHMgPSBvcHRpb25zLmNyZWRlbnRpYWxzIHx8IHRoaXMuY3JlZGVudGlhbHMgfHwgJ29taXQnXG4gICAgaWYgKG9wdGlvbnMuaGVhZGVycyB8fCAhdGhpcy5oZWFkZXJzKSB7XG4gICAgICB0aGlzLmhlYWRlcnMgPSBuZXcgSGVhZGVycyhvcHRpb25zLmhlYWRlcnMpXG4gICAgfVxuICAgIHRoaXMubWV0aG9kID0gbm9ybWFsaXplTWV0aG9kKG9wdGlvbnMubWV0aG9kIHx8IHRoaXMubWV0aG9kIHx8ICdHRVQnKVxuICAgIHRoaXMubW9kZSA9IG9wdGlvbnMubW9kZSB8fCB0aGlzLm1vZGUgfHwgbnVsbFxuICAgIHRoaXMucmVmZXJyZXIgPSBudWxsXG5cbiAgICBpZiAoKHRoaXMubWV0aG9kID09PSAnR0VUJyB8fCB0aGlzLm1ldGhvZCA9PT0gJ0hFQUQnKSAmJiBib2R5KSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdCb2R5IG5vdCBhbGxvd2VkIGZvciBHRVQgb3IgSEVBRCByZXF1ZXN0cycpXG4gICAgfVxuICAgIHRoaXMuX2luaXRCb2R5KGJvZHkpXG4gIH1cblxuICBSZXF1ZXN0LnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgUmVxdWVzdCh0aGlzLCB7IGJvZHk6IHRoaXMuX2JvZHlJbml0IH0pXG4gIH1cblxuICBmdW5jdGlvbiBkZWNvZGUoYm9keSkge1xuICAgIHZhciBmb3JtID0gbmV3IEZvcm1EYXRhKClcbiAgICBib2R5LnRyaW0oKS5zcGxpdCgnJicpLmZvckVhY2goZnVuY3Rpb24oYnl0ZXMpIHtcbiAgICAgIGlmIChieXRlcykge1xuICAgICAgICB2YXIgc3BsaXQgPSBieXRlcy5zcGxpdCgnPScpXG4gICAgICAgIHZhciBuYW1lID0gc3BsaXQuc2hpZnQoKS5yZXBsYWNlKC9cXCsvZywgJyAnKVxuICAgICAgICB2YXIgdmFsdWUgPSBzcGxpdC5qb2luKCc9JykucmVwbGFjZSgvXFwrL2csICcgJylcbiAgICAgICAgZm9ybS5hcHBlbmQoZGVjb2RlVVJJQ29tcG9uZW50KG5hbWUpLCBkZWNvZGVVUklDb21wb25lbnQodmFsdWUpKVxuICAgICAgfVxuICAgIH0pXG4gICAgcmV0dXJuIGZvcm1cbiAgfVxuXG4gIGZ1bmN0aW9uIHBhcnNlSGVhZGVycyhyYXdIZWFkZXJzKSB7XG4gICAgdmFyIGhlYWRlcnMgPSBuZXcgSGVhZGVycygpXG4gICAgcmF3SGVhZGVycy5zcGxpdCgvXFxyP1xcbi8pLmZvckVhY2goZnVuY3Rpb24obGluZSkge1xuICAgICAgdmFyIHBhcnRzID0gbGluZS5zcGxpdCgnOicpXG4gICAgICB2YXIga2V5ID0gcGFydHMuc2hpZnQoKS50cmltKClcbiAgICAgIGlmIChrZXkpIHtcbiAgICAgICAgdmFyIHZhbHVlID0gcGFydHMuam9pbignOicpLnRyaW0oKVxuICAgICAgICBoZWFkZXJzLmFwcGVuZChrZXksIHZhbHVlKVxuICAgICAgfVxuICAgIH0pXG4gICAgcmV0dXJuIGhlYWRlcnNcbiAgfVxuXG4gIEJvZHkuY2FsbChSZXF1ZXN0LnByb3RvdHlwZSlcblxuICBmdW5jdGlvbiBSZXNwb25zZShib2R5SW5pdCwgb3B0aW9ucykge1xuICAgIGlmICghb3B0aW9ucykge1xuICAgICAgb3B0aW9ucyA9IHt9XG4gICAgfVxuXG4gICAgdGhpcy50eXBlID0gJ2RlZmF1bHQnXG4gICAgdGhpcy5zdGF0dXMgPSAnc3RhdHVzJyBpbiBvcHRpb25zID8gb3B0aW9ucy5zdGF0dXMgOiAyMDBcbiAgICB0aGlzLm9rID0gdGhpcy5zdGF0dXMgPj0gMjAwICYmIHRoaXMuc3RhdHVzIDwgMzAwXG4gICAgdGhpcy5zdGF0dXNUZXh0ID0gJ3N0YXR1c1RleHQnIGluIG9wdGlvbnMgPyBvcHRpb25zLnN0YXR1c1RleHQgOiAnT0snXG4gICAgdGhpcy5oZWFkZXJzID0gbmV3IEhlYWRlcnMob3B0aW9ucy5oZWFkZXJzKVxuICAgIHRoaXMudXJsID0gb3B0aW9ucy51cmwgfHwgJydcbiAgICB0aGlzLl9pbml0Qm9keShib2R5SW5pdClcbiAgfVxuXG4gIEJvZHkuY2FsbChSZXNwb25zZS5wcm90b3R5cGUpXG5cbiAgUmVzcG9uc2UucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBSZXNwb25zZSh0aGlzLl9ib2R5SW5pdCwge1xuICAgICAgc3RhdHVzOiB0aGlzLnN0YXR1cyxcbiAgICAgIHN0YXR1c1RleHQ6IHRoaXMuc3RhdHVzVGV4dCxcbiAgICAgIGhlYWRlcnM6IG5ldyBIZWFkZXJzKHRoaXMuaGVhZGVycyksXG4gICAgICB1cmw6IHRoaXMudXJsXG4gICAgfSlcbiAgfVxuXG4gIFJlc3BvbnNlLmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHJlc3BvbnNlID0gbmV3IFJlc3BvbnNlKG51bGwsIHtzdGF0dXM6IDAsIHN0YXR1c1RleHQ6ICcnfSlcbiAgICByZXNwb25zZS50eXBlID0gJ2Vycm9yJ1xuICAgIHJldHVybiByZXNwb25zZVxuICB9XG5cbiAgdmFyIHJlZGlyZWN0U3RhdHVzZXMgPSBbMzAxLCAzMDIsIDMwMywgMzA3LCAzMDhdXG5cbiAgUmVzcG9uc2UucmVkaXJlY3QgPSBmdW5jdGlvbih1cmwsIHN0YXR1cykge1xuICAgIGlmIChyZWRpcmVjdFN0YXR1c2VzLmluZGV4T2Yoc3RhdHVzKSA9PT0gLTEpIHtcbiAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdJbnZhbGlkIHN0YXR1cyBjb2RlJylcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFJlc3BvbnNlKG51bGwsIHtzdGF0dXM6IHN0YXR1cywgaGVhZGVyczoge2xvY2F0aW9uOiB1cmx9fSlcbiAgfVxuXG4gIHNlbGYuSGVhZGVycyA9IEhlYWRlcnNcbiAgc2VsZi5SZXF1ZXN0ID0gUmVxdWVzdFxuICBzZWxmLlJlc3BvbnNlID0gUmVzcG9uc2VcblxuICBzZWxmLmZldGNoID0gZnVuY3Rpb24oaW5wdXQsIGluaXQpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICB2YXIgcmVxdWVzdCA9IG5ldyBSZXF1ZXN0KGlucHV0LCBpbml0KVxuICAgICAgdmFyIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpXG5cbiAgICAgIHhoci5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG9wdGlvbnMgPSB7XG4gICAgICAgICAgc3RhdHVzOiB4aHIuc3RhdHVzLFxuICAgICAgICAgIHN0YXR1c1RleHQ6IHhoci5zdGF0dXNUZXh0LFxuICAgICAgICAgIGhlYWRlcnM6IHBhcnNlSGVhZGVycyh4aHIuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCkgfHwgJycpXG4gICAgICAgIH1cbiAgICAgICAgb3B0aW9ucy51cmwgPSAncmVzcG9uc2VVUkwnIGluIHhociA/IHhoci5yZXNwb25zZVVSTCA6IG9wdGlvbnMuaGVhZGVycy5nZXQoJ1gtUmVxdWVzdC1VUkwnKVxuICAgICAgICB2YXIgYm9keSA9ICdyZXNwb25zZScgaW4geGhyID8geGhyLnJlc3BvbnNlIDogeGhyLnJlc3BvbnNlVGV4dFxuICAgICAgICByZXNvbHZlKG5ldyBSZXNwb25zZShib2R5LCBvcHRpb25zKSlcbiAgICAgIH1cblxuICAgICAgeGhyLm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVqZWN0KG5ldyBUeXBlRXJyb3IoJ05ldHdvcmsgcmVxdWVzdCBmYWlsZWQnKSlcbiAgICAgIH1cblxuICAgICAgeGhyLm9udGltZW91dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZWplY3QobmV3IFR5cGVFcnJvcignTmV0d29yayByZXF1ZXN0IGZhaWxlZCcpKVxuICAgICAgfVxuXG4gICAgICB4aHIub3BlbihyZXF1ZXN0Lm1ldGhvZCwgcmVxdWVzdC51cmwsIHRydWUpXG5cbiAgICAgIGlmIChyZXF1ZXN0LmNyZWRlbnRpYWxzID09PSAnaW5jbHVkZScpIHtcbiAgICAgICAgeGhyLndpdGhDcmVkZW50aWFscyA9IHRydWVcbiAgICAgIH1cblxuICAgICAgaWYgKCdyZXNwb25zZVR5cGUnIGluIHhociAmJiBzdXBwb3J0LmJsb2IpIHtcbiAgICAgICAgeGhyLnJlc3BvbnNlVHlwZSA9ICdibG9iJ1xuICAgICAgfVxuXG4gICAgICByZXF1ZXN0LmhlYWRlcnMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwgbmFtZSkge1xuICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihuYW1lLCB2YWx1ZSlcbiAgICAgIH0pXG5cbiAgICAgIHhoci5zZW5kKHR5cGVvZiByZXF1ZXN0Ll9ib2R5SW5pdCA9PT0gJ3VuZGVmaW5lZCcgPyBudWxsIDogcmVxdWVzdC5fYm9keUluaXQpXG4gICAgfSlcbiAgfVxuICBzZWxmLmZldGNoLnBvbHlmaWxsID0gdHJ1ZVxufSkodHlwZW9mIHNlbGYgIT09ICd1bmRlZmluZWQnID8gc2VsZiA6IHRoaXMpO1xuIiwibW9kdWxlLmV4cG9ydHM9e1xuICBcIm5hbWVcIjogXCJ0ZXJtbHkuanNcIixcbiAgXCJ2ZXJzaW9uXCI6IFwiMi4xLjBcIixcbiAgXCJkZXNjcmlwdGlvblwiOiBcIlNpbXBsZSwgRXh0ZW5zaWJsZSwgTGlnaHR3ZWlnaHQgSmF2YXNjcmlwdCBCcm93c2VyIFRlcm1pbmFsIFNpbXVsYXRvciFcIixcbiAgXCJtYWluXCI6IFwiZGlzdC90ZXJtbHkubWluLmpzXCIsXG4gIFwic2NyaXB0c1wiOiB7XG4gICAgXCJ0ZXN0XCI6IFwibW9jaGEgLS1jb21waWxlcnMgYmFiZWwtY29yZS9yZWdpc3RlciB0ZXN0cy9cIixcbiAgICBcImJ1aWxkXCI6IFwiZ3VscFwiXG4gIH0sXG4gIFwia2V5d29yZHNcIjogW1xuICAgIFwidGVybWluYWxcIixcbiAgICBcImphdmFzY3JpcHRcIixcbiAgICBcInNpbXVsYXRvclwiLFxuICAgIFwiYnJvd3NlclwiLFxuICAgIFwicHJlc2VudGF0aW9uXCIsXG4gICAgXCJtb2NrdXBcIixcbiAgICBcImRlbW9cIixcbiAgICBcImNsaVwiLFxuICAgIFwicHJvbXB0XCIsXG4gICAgXCJjb21tYW5kc1wiLFxuICAgIFwibm8gZGVwZW5jeVwiLFxuICAgIFwibGlnaHR3ZWlnaHRcIixcbiAgICBcImpzXCIsXG4gICAgXCJ2YW5pbGxhXCJcbiAgXSxcbiAgXCJyZXBvc2l0b3J5XCI6IFwiaHR0cHM6Ly9naXRodWIuY29tL0tpcmtoYW1tZXR6L3Rlcm1seS5qc1wiLFxuICBcImF1dGhvclwiOiBcIlNpbW9uZSBDb3JzaVwiLFxuICBcImxpY2Vuc2VcIjogXCJJU0NcIixcbiAgXCJkZXZEZXBlbmRlbmNpZXNcIjoge1xuICAgIFwiYmFiZWxcIjogXCJeNi41LjJcIixcbiAgICBcImJhYmVsLWNvcmVcIjogXCJeNi4yMS4wXCIsXG4gICAgXCJiYWJlbC1wb2x5ZmlsbFwiOiBcIl42LjIyLjBcIixcbiAgICBcImJhYmVsLXByZXNldC1lczIwMTVcIjogXCJeNi4xOC4wXCIsXG4gICAgXCJiYWJlbC1wcmVzZXQtc3RhZ2UtM1wiOiBcIl42LjE3LjBcIixcbiAgICBcImJhYmVsaWZ5XCI6IFwiXjcuMy4wXCIsXG4gICAgXCJicm93c2VyaWZ5XCI6IFwiXjEzLjMuMFwiLFxuICAgIFwiY2hhaVwiOiBcIl4zLjUuMFwiLFxuICAgIFwiY2hhbGtcIjogXCJeMS4xLjNcIixcbiAgICBcImd1bHBcIjogXCJeMy45LjFcIixcbiAgICBcImd1bHAtcmVuYW1lXCI6IFwiXjEuMi4yXCIsXG4gICAgXCJndWxwLXNvdXJjZW1hcHNcIjogXCJeMi40LjBcIixcbiAgICBcImd1bHAtdWdsaWZ5XCI6IFwiXjIuMC4wXCIsXG4gICAgXCJndWxwLXV0aWxcIjogXCJeMy4wLjhcIixcbiAgICBcIm1vY2hhXCI6IFwiXjMuMi4wXCIsXG4gICAgXCJwcm9taXNlLXBvbHlmaWxsXCI6IFwiXjYuMC4yXCIsXG4gICAgXCJ1Z2xpZnktanNcIjogXCJeMi42LjRcIixcbiAgICBcInV0aWxzLW1lcmdlXCI6IFwiXjEuMC4wXCIsXG4gICAgXCJ2aW55bC1idWZmZXJcIjogXCJeMS4wLjBcIixcbiAgICBcInZpbnlsLXNvdXJjZS1zdHJlYW1cIjogXCJeMS4xLjBcIixcbiAgICBcIndhdGNoaWZ5XCI6IFwiXjMuOC4wXCIsXG4gICAgXCJ3aGF0d2ctZmV0Y2hcIjogXCJeMi4wLjJcIlxuICB9XG59XG4iXX0=
