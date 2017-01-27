/**
 * Command Class
 * @param name [String], fn [Function]
 *
 * @NB don't pass arrow function if you want to use [this] inside your command function to access various shared shell circular references
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
   */
  exec(argv = {}) {
    if (typeof argv !== 'object' || Array.isArray(argv)) throw Error('Command exec ARGV Must be an [Object]')
    if (Object.keys(argv).length) return this.fn(argv)
    return this.fn()
  }
}

module.exports = Command
