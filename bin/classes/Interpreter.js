const Command = require('./Command')

/**
 *
 * Interpreter
 * Is the parent Class of the Main Shell Class
 * - This class is the one that parse and run exec of command
 * - Parsing of builtin command on runtime happen here
 * - Will parse custom user Command too
 *
 */
class Interpreter {

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
    try {
      return JSON.stringify(output)
    } catch (e) {
      return '-invalid command: Command returned invalid data type: ' + e.message
    }
  }

  /**
   * Exec Command
   * @return JSON String with output
   */
  exec(cmd) {

    //  Parse Command String: [0] = command name, [1+] = arguments
    const parsed = this.parse(cmd)

    //  X-check if command exist
    const command = this.ShellCommands[parsed[0]]
    if (!command) {
      return "-error shell: Command doesn't exist.\n"
    }

    //  get arguments array and execute command return error if throw
    const args = parsed.filter((e, i) => i > 0)
    let output
    try {
      output = command.exec(args)
    } catch (e) {
      return '-fatal command: Command execution produced an error ' + e.message
    }

    //  Format data and Return
    return this.format(output)
  }

  /*
   * Generate Builtin Command List
   */
  initBuiltinCommand(ShellReference) {
    const Blueprints = require('../configs/builtin-commands')
    const ShellCommands = {}
    Object.keys(Blueprints).map((key) => {
      const cmd = Blueprints[key]
      if (typeof cmd.name === 'string' && typeof cmd.fn === 'function') {
        cmd.shell = ShellReference
        ShellCommands[key] = new Command(cmd)
      }
    })
    return ShellCommands
  }
}

module.exports = Interpreter
