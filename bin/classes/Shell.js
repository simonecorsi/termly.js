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
    this.fs = new Filesystem(filesystem, this)

    /**
     * Reference to Filesystem current working directory
     * @type {Array}
     */
    this.cwd = this.fs.cwd

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

module.exports = Shell
