module.exports = {

  /**
   * Return Help Message
   */
  help: {
    name: 'help',
    type: 'builtin',
    fn: () => {
      return 'This is the help.'
    }
  },

  /**
   * Return passed arguments, for testing purposes
   */
  arguments: {
    name: 'arguments',
    type: 'builtin',
    fn: args => args
  },

  /**
   * Change Directory
   * @type Success/Fail Message String
   */
  cd: {
    name: 'cd',
    type: 'builtin',
    fn: function(path) {
      path = path.join()
      try{
        return this.shell.fs.changeDir(path)
      } catch(e) {
        throw e
      }
    }
  },

  /**
   * ls Command
   * List directory files
   * @type formatted String
   */
  ls: {
    name: 'ls',
    type: 'builtin',
    fn: function(path) {
      path = path.join()
      let list, responseString = ''
      try{
        list = this.shell.fs.listDir(path)
      } catch(e) {
        throw e
      }
      for (let file in list) {
        if (list.hasOwnProperty(file)) {
          responseString += `${list[file].permission}\t${list[file].user} ${list[file].group}\t${list[file].name}\n`
        }
      }
      return responseString
    }

  },

}
