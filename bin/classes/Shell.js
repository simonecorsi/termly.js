const Interpreter = require('./Interpreter')

/**
 * Shell Class inherits from Interpreter
 *
 */
class Shell extends Interpreter{
  constructor({ filesystem, commands } = {}) {
    super()

    /**
     * [cwd description]
     * @type {Array}
     */
    this.cwd = ['/']

    // Init builtin commands, @method in parent
    // pass shell reference
    this.ShellCommands = this.initBuiltinCommand(this)
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
