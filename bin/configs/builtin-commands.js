module.exports = {

  /**
   * Help
   * @return List of commands
   */
  help: {
    name: 'help',
    type: 'builtin',
    fn: function() {
      return `Commands avaible: ${Object.keys(this.shell.ShellCommands).join(', ')}`
    }
  },

  whoami: {
    name: 'whoami',
    type: 'builtin',
    fn: function() {
      return this.shell.user
    },
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
   * @return Success/Fail Message String
   */
  cd: {
    name: 'cd',
    type: 'builtin',
    fn: function(path) {
      if (!path) throw new Error('-invalid No path provided.')
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
   * @param array of args
   * @return formatted String
   */
  ls: {
    name: 'ls',
    type: 'builtin',
    fn: function(path = ['./'] ) {
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

  /**
   * CAT Command
   * Read File
   * @return formatted String
   */
  cat: {
    name: 'cat',
    type: 'builtin',
    fn: function(path = ['./']) {
      path = path.join()
      let list, responseString = ''
      try{
        file = this.shell.fs.readFile(path)
      } catch(e) {
        throw e
      }
      console.log(file)
      return responseString
    }
  },

}
