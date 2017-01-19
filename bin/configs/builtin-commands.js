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

}
