const Command = require('./Command')
const Parser = require('string-to-argv.js')

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
   * CHANGED: Changed to use Kirkhammetz/string-to-argv.js
   * Keep this function separate for testing
   */
  parse(cmd) {
    return new Parser(cmd)
  }
  /**
   * Exec Command
   * @return {String}
   */
  exec(cmd) {

    /**
     * CHANGED: Wrote a simple parser in another branch, then splitted into an npm module. using it here
     */
    let argv
    try {
      argv = this.parse(cmd)
    } catch (e) {
      return `-fatal command: ${e.message || 'Some Error Occured while parsing the command string.'}`
    }

    //  X-check if command exist
    const command = this.ShellCommands[argv.command]
    if (!command) {
      return `-invalid shell: Command <${argv.command}> doesn't exist.\n`
    }

    //  get arguments array and execute command return error if throw
    let output
    try {
      output = command.exec(argv)
    } catch (e) {
      return `-fatal ${argv.command}: ${e.message}`
    }

    //  Format data and Return
    return this.format(output)
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
