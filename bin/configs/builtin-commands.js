const { name, version, description, repository, author, license } = require('../../package.json')
module.exports = {

  /**
   * Help
   * @return List of commands
   */
  help: {
    name: 'help',
    type: 'builtin',
    man: 'List of available commands',
    fn: function help() {
      return `Commands available: ${Object.keys(this.shell.ShellCommands).join(', ')}`
    }
  },

  whoami: {
    name: 'whoami',
    type: 'builtin',
    man: 'Current user',
    fn: function whoami() {
      return this.shell.user
    },
  },

  about: {
    name: 'about',
    type: 'builtin',
    man: 'About this project',
    fn: function about() {
      let str = ''
      str += `name: ${name}\n`
      str += `version: ${version}\n`
      str += `description: ${description}\n`
      str += `repository: ${repository}\n`
      str += `author: ${author}\n`
      str += `license: ${license}\n`
      return str
    }
  },

  /**
   * Return passed arguments, for testing purposes
   */
  arguments: {
    name: 'arguments',
    type: 'builtin',
    man: 'Return argument passed, used for testing purpose',
    fn: args => args
  },

  /**
   * Change Directory
   * @return Success/Fail Message String
   */
  cd: {
    name: 'cd',
    type: 'builtin',
    man: 'Change directory, pass absolute or relative path: eg. cd /etc, cd / cd/my/nested/dir',
    fn: function cd(path) {
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
    man: 'list directory files, pass absolute/relative path, if empty list current directory',
    fn: function ls(path = ['./'] ) {
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
    man: 'Return file content, take one argument: file path (relative/absolute)',
    fn: function(path = ['./']) {
      path = path.join()
      let file, responseString = ''
      try{
        file = this.shell.fs.readFile(path)
      } catch(e) {
        throw e
      }
      return file.content
    }
  },

  /**
   * Man
   * Return command manual info
   * @return {string}
   */
  man: {
    name: 'man',
    type: 'builtin',
    man: 'Command manual, takes one argument, command name',
    fn: function man(args) {
      if (!args || !args[0]) throw new Error('man: no command provided.')
      let command = args[0]
      if (!this.shell.ShellCommands[command]) throw new Error('command doesn\'t exist.')
      if (!this.shell.ShellCommands[command].man) throw new Error('no manual entry for this command.')
      return this.shell.ShellCommands[command].man
    },
  },

  /**
   * HTTP
   * Return command manual info
   * @return {string}
   */
  http: {
    name: 'http',
    type: 'builtin',
    man: 'Send http requests.\n syntax: http METHOD URL.\neg: http GET www.google.com\nGET Method can be omitted',
    fn: function http(args = []) {
      console.log(args)
      return
      if (!args || !args.length) throw new Error(`http: no parameters provided, provide URL and/or method \n help: ${this.shell.ShellCommands['http'].man}`)
      return fetch('http://www.google.com', {
        method: 'POST'
      }).then((res) => {
        if (res.ok) return res.json()
        throw new Error(`Request Failer (${res.status || 500}): ${res.statusText || 'Some Error Occured.'}`)
      }).catch((err) => {
        throw new Error(`Request Failer (${err.status || 500}): ${err.statusText || 'Some Error Occured.'}`)
      })
    },
  },

}
