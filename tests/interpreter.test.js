const { expect } = require('chai')
const Interpreter = require('../bin/classes/Interpreter')

describe('Interpreter Class', () => {
  let interpreter
  it('should init', () => {
    interpreter = new Interpreter()
    expect(interpreter).to.exist
  })

  it('[parseCommand] should accept only STRINGS', () => {
    expect(interpreter.parseCommand.bind(interpreter, '')).to.throw(Error)
    expect(interpreter.parseCommand.bind(interpreter, 123)).to.throw(Error)
    expect(interpreter.parseCommand.bind(interpreter, {})).to.throw(Error)
    expect(interpreter.parseCommand.bind(interpreter, [])).to.throw(Error)
    expect(interpreter.parseCommand.bind(interpreter, () => {})).to.throw(Error)
    expect(interpreter.parseCommand.bind(interpreter)).to.throw(Error)
  })

  it('should parse a command and return an array of ARGS', () => {
    expect(interpreter.parseCommand('command'))
      .to.be.a('array')
      .to.have.length(1)

    expect(interpreter.parseCommand('command arg1 arg2'))
      .to.be.a('array')
      .to.have.length(3)
  })

})
