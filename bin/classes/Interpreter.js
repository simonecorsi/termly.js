const Command = require('./Command')

class Interpreter {

  constructor() {
    this.ShellCommands = this.initBuiltinCommand()
  }

  /**
   * Parse Command
   * @return Array of args as in C
   */
  parse(cmd) {
    if (typeof cmd !== 'string') throw new Error('Command must be a string')
    if (!cmd.length) throw new Error('Command is empty')
    return cmd.split(' ')
  }

  /**
   * Format Output
   * return error if function is returned
   * convert everything else to json.
   * @return JSON parsed
   */
  format(output) {
    if (typeof output === 'function') {
      return '-invalid command: Command returned invalid data type.'
    }
    return JSON.stringify(output)
  }

  /**
   * Exec Command
   * @return string with output
   */
  exec(cmd) {
    // parse command
    // [0] = command name
    // [1+] = arguments
    const parsed = this.parse(cmd)

    // cross check if command exist
    const command = this.ShellCommands[parsed[0]]
    if (!command) {
      return "-error shell: Command doesn't exist.\n"
    }

    // execute command and return output
    const args = parsed.filter((e, i) => i > 0)
    let output
    try {
      output = command.exec(args)
    } catch (e) {
      return '-fatal command: Command execution produced an error.'
    }

    // Format and Return
    return this.format(output)
  }

  /*
   * Generate Builtin Command List
   */
  initBuiltinCommand() {
    const Blueprints = require('../configs/builtin-commands')
    const ShellCommands = {}
    Object.keys(Blueprints).map((key) => {
      const cmd = Blueprints[key]
      if (typeof cmd.name === 'string' && typeof cmd.fn === 'function') {
        ShellCommands[key] = new Command(cmd)
      }
    })
    return ShellCommands
  }
}

// Object.defineProperty()

module.exports = Interpreter
