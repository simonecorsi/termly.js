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
     * Init Virtual FS and get reference
     */
    this.fs = new Filesystem(filesystem)

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
