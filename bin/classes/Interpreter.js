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
   * String is splitted by spaces
   * @return Array of args as in C
   * ---
   *   IDEA: Regexp every word is an argument, to proide something else you must enclose
   *   it in single or double quotes.
   *   To pass a json use single quotes since the json starndard requires double quotes in it
   *   @return cmd.match(/[^\s"']+|"([^"]*)"|'([^']*)'/g)
   * ---
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
    if (output === undefined || typeof output === 'undefined') {
      return '-invalid command: Command returned no data.'
    }
    return output
    // try {
    //   return JSON.stringify(output)
    // } catch (e) {
    //   return '-invalid command: Command returned invalid data type: ' + e.message
    // }
  }

  /**
   * Exec Command
   * @return {String}
   */
  exec(cmd) {

    //  Parse Command String: [0] = command name, [1+] = arguments
    let parsed
    try {
      parsed = this.parse(cmd)
    } catch (e) {
      return '-fatal command: ' + e.message || 'Some Error Occured'
    }

    //  X-check if command exist
    const command = this.ShellCommands[parsed[0]]
    if (!command) {
      return `-error shell: Command <${parsed[0]}> doesn't exist.\n`
    }

    //  get arguments array and execute command return error if throw
    const args = parsed.filter((e, i) => i > 0)
    let output
    try {
      output = command.exec(args)
    } catch (e) {
      return '-fatal command: ' + e.message
    }

    //  Format data and Return
    return this.format(output)
  }

  /*
   * Generate Builtin Command List
   */
  registerCommands(ShellReference, customCommands = undefined) {
    let Blueprints = require('../configs/builtin-commands')
    /**
     * If custom commands are passed check for valid type
     * If good to go generate those commands
     */
    if (customCommands) {
      if (typeof customCommands === 'object' && !Array.isArray(customCommands)) {
        Blueprints = customCommands
      } else {
        throw new Error('Custom command provided are not in a valid format.')
      }
    }

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
