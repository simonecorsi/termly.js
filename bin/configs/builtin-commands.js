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
    fn: function cd(argv) {
      if (!argv['_'].length) throw new Error('-invalid No path provided.')
      const path = argv['_'].join()
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
    fn: function ls(argv = { _: ['./'] } ) {
      if (!argv['_'].length) argv['_'].push('.')
      let path = argv['_'].join()
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
    fn: function(argv = { _: ['./'] } ) {
      let path = argv['_'].join()
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
   * Return Data from an HTTP request
   * FIXME: NEED FIX TO WORK WITH THE NEW ARGV STRUCTURE
   * @return {string}
   */
  http: {
    name: 'http',
    type: 'builtin',
    man: 'Send http requests.\n syntax: http METHOD [property:data,] URL.\neg: http GET http://jsonplaceholder.typicode.com/\nhttp POST title:MyTitle http://jsonplaceholder.typicode.com/posts',
    fn: function http(args = {}) {
      if (!args || !args.length || args.length < 2) throw new Error(`http: no parameters provided, provide URL and/or method \n help: ${this.shell.ShellCommands['http'].man}`)

      // Get Method and URL
      let method, url
      method = args[0].toUpperCase()
      url = args[args.length - 1]

      /*
       * Build Payload
       * If args > 2 there are values in beetween method and url
       * format prop:value
       * FIXME Space not allowed, must change how commands arguments are parsed
       */
      let payload = {}
      if (args.length > 2) {
        args.map((e, i, array) => {
          if (i != 0 && i !== args.length - 1) {
            let parse = e.split(':')
            payload[parse[0]] = parse[1]
          }
        })
      }
      let request = {
        method,
        headers: { "Content-Type": "application/json" },
      }
      if (method !== 'GET') request.body = JSON.stringify(payload)
      return fetch(url, request).then((res) => {
        if (res.ok) return res.json()
        throw new Error(`Request Failed (${res.status || 500}): ${res.statusText || 'Some Error Occured.'}`)
      }).catch((err) => {
        console.log(err)
      })
    },
  },

}
