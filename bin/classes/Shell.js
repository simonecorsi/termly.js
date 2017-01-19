const Interpreter = require('./Interpreter')

/**
 * Shell Class inherits from Interpreter
 *
 * Interpreter Methods
 * @method parseCommand(cmd = [String])
 */
class Shell extends Interpreter{
  constructor({ filesystem, commands } = {}) {
    super()
    console.log(this.ShellCommands)
    /**
     * [cwd description]
     * @type {Array}
     */
    this.cwd = ['/']
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
