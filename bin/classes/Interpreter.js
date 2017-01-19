class Interpreter {
  constructor() {

  }
  parseCommand(cmd) {
    if (typeof cmd !== 'string') throw new Error('Command must be a string')
    if (!cmd.length) throw new Error('Command is empty')
    return cmd.split(' ')
  }

  exec(args) {
    if (typeof args !== 'array') throw new Error('Wrong Input, ARGS must be an array')
    if (!args.length) throw new Error('Error, arguments cannot be empty')
  }

  /*
   *  BUILTIN SHELL COMMANDS *
   */
}

// Object.defineProperty()

module.exports = Interpreter
