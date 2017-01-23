/**
 * Command Class
 * @param name [String], fn [Function]
 *
 * don't pass arrow function if you want to use this inside your command function to access various shared shell object
 */
class Command {
  constructor({ name, fn, type = 'usr', shell = undefined, man = ''} = {}){
    if (typeof name !== 'string') throw Error('Command name must be a string')
    if (typeof fn !== 'function') throw Error('Command function must be... a function')

    /**
     * use whole function instead of arrow if you want to access
     * circular reference of Command
     */
    this.fn = fn.bind(this)
    this.name = name
    this.type = type
    this.man = man

    if (shell) {
      this.shell = shell
    }
  }

  /**
   * Dispatch Command Execution
   *
   * @tip don't use arrow function in you command if you want the arguments
   * neither super and arguments get binded in AF.
   */
  exec(args = []) {
    if (!Array.isArray(args)) throw Error('Command exec args must be in an array')
    if (args.length) return this.fn(args)
    return this.fn()
  }
}

module.exports = Command
