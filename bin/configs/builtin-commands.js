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
    fn: function() {
      return this.shell
    }
  }

}
