const Interpreter = require('./Interpreter')
const Filesystem = require('./Filesystem')

/**
 * Shell Class inherits from Interpreter
 *
 */
class Shell extends Interpreter{
  constructor({ filesystem = undefined, commands = undefined } = {}) {
    super()

    /**
     * Create the virtual filesystem
     */
    this.fs = new Filesystem(filesystem)

    /**
     * [cwd description]
     * @type {Array}
     */
    this.cwd = ['/']

    // Init builtin commands, @method in parent
    // pass shell reference
    this.ShellCommands = this.registerCommands(this)
    this.ShellCommands = this.registerCommands(this, commands)
  }

  /**
   * Pass control to Interpreter
   * @return output as [String]
   */
  execute(cmd) {
    return this.exec(cmd)
  }

}

module.exports = Shell
