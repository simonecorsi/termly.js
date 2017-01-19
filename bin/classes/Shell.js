const Interpreter = require('./Interpreter')

/**
 * Shell Class inherits from Interpreter
 *
 * Interpreter Methods
 * @method parseCommand(cmd = [String])
 */
class Shell extends Interpreter{
  constructor(filesystem = {}, commands = {}) {
    super()
    this.cwd = ['/']
  }

  execute(cmd) {
    return this.exec(cmd)
  }

}

module.exports = Shell
