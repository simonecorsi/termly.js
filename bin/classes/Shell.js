const Interpreter = require('./Interpreter')
const Filesystem = require('./Filesystem')

/**
 * Shell Class inherits from Interpreter
 *
 */
class Shell extends Interpreter{
  constructor({ filesystem = undefined, commands = undefined, user = 'root', hostname = 'my.host.me' } = {}) {
    super()

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

  /**
   * Pass control to Interpreter
   * @return output as [String]
   */
  run(cmd) {
    return this.exec(cmd)
  }
}

Object.defineProperty(Shell.prototype, 'fs', { writable: true, enumerable: false })
Object.defineProperty(Shell.prototype, 'ShellCommands', { writable: true, enumerable: false })

module.exports = Shell
