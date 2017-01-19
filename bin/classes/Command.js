/**
 * Command Class
 * @param name [String], fn [Function]
 */
class Command {
  constructor(name, fn) {
    if (typeof name !== 'string') throw Error('Command name must be a string')
    if (typeof fn !== 'function') throw Error('Command function must be... a function')
    this.name = name
    this.fn = fn
  }

  /**
   * Command Executor
   */
  exec(args = []) {
    if (typeof args !== 'undefined' && typeof args !== 'array') throw Error('Command exec args must be in an array')

  }
}

module.exports = Command
