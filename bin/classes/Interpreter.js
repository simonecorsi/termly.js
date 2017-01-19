class Interpreter {

  parse(cmd) {
    if (typeof cmd !== 'string') throw new Error('Command must be a string')
    if (!cmd.length) throw new Error('Command is empty')
    return cmd.split(' ')
  }

  exec(cmd) {
    // parse command
    // [0] = command name
    // [1+] = arguments
    const parsed = this.parse(cmd)

    // cross check if command exist

    // execute command

    // return output

  }

  /*
   *  BUILTIN SHELL COMMANDS *
   */
}

// Object.defineProperty()

module.exports = Interpreter
