const { expect } = require('chai')
const Command = require('../bin/classes/Command')

describe('Command Class', () => {
  let command
  it('should init', () => {
    command = new Command('cmd', () => {})
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

  
})
