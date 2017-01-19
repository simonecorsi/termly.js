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

    /**
     * Parse commands to array of args
     */
    let args
    try {
      args = this.parseCommand(cmd)
    } catch (e) {
      return {
        state: 'error',
        output: e.message || 'Error parsing command, Wrong input.',
        command: cmd,
      }
    }

    /**
     * Send To Interpreter
     */
    let output
    try {
      this.exec(args)
    } catch (e) {
      return {
        state: 'error',
        output: e.message || 'Error executing command.',
        command: args[0],
        args,
      }
    }
    return {
      state: 'done',
      output,
    }
  }

}

module.exports = Shell
