module.exports = {
  help: {
    name: 'help',
    type: 'builtin',
    fn: () => {
      return 'This is the help.'
    }
  },

  arguments: {
    name: 'arguments',
    type: 'builtin',
    fn: args => args
  },

  cd: {
    name: 'cd',
    type: 'builtin',
    fn: function(path) {
      path = path.join()
      return this.shell.fs.changeDir(path)
    }
  }

}
