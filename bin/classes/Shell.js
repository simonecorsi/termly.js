const Interpreter = require('./Interpreter')

/**
 * Shell Class inherits from Interpreter
 *
 */
class Shell extends Interpreter{
  constructor({ filesystem, commands } = {}) {
    super(this)

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
