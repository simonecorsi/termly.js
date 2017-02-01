const Interpreter = require('./Interpreter')
const Filesystem = require('./Filesystem')

/**
 * Shell Class inherits from Interpreter
 * Options:
 *  - filesystem {Object}
 *  - commands {Object}
 *  - user {String}
 *  - hostname {String}
 */
class Shell extends Interpreter{
  constructor({ filesystem = undefined, commands = undefined, user = 'root', hostname = 'my.host.me' } = {}) {
    super()

    this.polyfills()

    this.Classes = {
      Command: require('./Command'),
      File: require('./File')
    }

    /**
     * Create the virtual filesystem
     * @return reference to instance of @class Filesystem
     */
    this.fs = new Filesystem(filesystem, this)
    this.user = user
    this.hostname = hostname

    // Init builtin commands, @method in parent
    // pass shell reference
    this.ShellCommands = this.registerCommands(this)
    this.ShellCommands = {
      ...this.ShellCommands,
      ...this.registerCommands(this, commands),
    }
  }

  polyfills() {
    if (!global.Promise) {
      global.Promise = require('promise-polyfill').Promise
    }
    if (!global.fetch) {
      global.fetch = require('whatwg-fetch')
    }
    return true
  }

  /**
   * Pass control to Interpreter
   * @return [String] OR {Promise} to resolve from your wrapper.
   */
  run(cmd) {
    return this.exec(cmd)
  }
}

// Object.defineProperty(Shell.prototype, 'fs', { writable: true, enumerable: false })
// Object.defineProperty(Shell.prototype, 'ShellCommands', { writable: true, enumerable: false })

module.exports = Shell
