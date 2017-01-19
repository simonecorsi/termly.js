const { expect } = require('chai')
const Command = require('../bin/classes/Command')

describe('Command Class', () => {
  let command
  it('should init', () => {
    command = new Command({ name:'cmd', fn: () => {} })
    expect(command).to.exist
  })

  it('should throw error if name is not provided', () => {
    expect(() => new Command()).to.throw(Error)
  })

  it('should throw error if function is not provided', () => {
    expect(() => new Command('mycommand')).to.throw(Error)
  })

  it('should throw errror when calling exec if args are not an array', () => {
    expect(() => command.exec('')).to.throw(Error)
    expect(() => command.exec(123)).to.throw(Error)
    expect(() => command.exec({})).to.throw(Error)
    expect(() => command.exec(() => {})).to.throw(Error)
  })

  it('should execute the function passed', () => {
    const cmd_output = "this is the help command output"
    const cmd = new Command({ name: 'help', fn: () => cmd_output})
    expect(cmd.exec()).to.equal(cmd_output)
  })

  it('should execute the function when arguments are passed', () => {
    const cmd = new Command({
      name: 'arguments',
      type: 'builtin',
      fn: args => args
    })
    const out = cmd.exec(['first', 'second'])
    expect(out).to.deep.equal(['first', 'second'])
  })

  it('should command function must have this binded to Command Constructor', () => {
    const cmd = new Command({ name:'help', fn: function() { return this instanceof Command }})
    expect(cmd.exec()).to.equal(true)
  })


})
