const { expect } = require('chai')
const Interpreter = require('../bin/classes/Interpreter')

describe('Interpreter Class', () => {
  let interpreter
  it('should init', () => {
    interpreter = new Interpreter()
    expect(interpreter).to.exist
  })

  it('[parse] should accept only STRINGS', () => {
    expect(interpreter.parse.bind(interpreter, '')).to.throw(Error)
    expect(interpreter.parse.bind(interpreter, 123)).to.throw(Error)
    expect(interpreter.parse.bind(interpreter, {})).to.throw(Error)
    expect(interpreter.parse.bind(interpreter, [])).to.throw(Error)
    expect(interpreter.parse.bind(interpreter, () => {})).to.throw(Error)
    expect(interpreter.parse.bind(interpreter)).to.throw(Error)
  })

  // LEGACY
  // it('should parse a command and return an array of ARGS', () => {
  //   expect(interpreter.parse('command'))
  //     .to.be.a('array')
  //     .to.have.length(1)
  //
  //   expect(interpreter.parse('command arg1 arg2'))
  //     .to.be.a('array')
  //     .to.have.length(3)
  // })

  it('should parse a command and return an Object of ARGS', () => {
    expect(interpreter.parse('command'))
      .to.be.a('object')
      .to.include.keys('raw', 'command')

      expect(interpreter.parse('command --verbose -p --long=asd --longwithstring="asdasd" '))
        .to.be.a('object')
        .to.include.keys('raw', 'command', 'verbose', 'p', 'long', 'longwithstring')

      expect(interpreter.parse('command --verbose -p --long=asd --longwithstring="test" dest/'))
      .to.eql({
        command: 'command',
        raw: 'command --verbose -p --long=asd --longwithstring=\"test\" dest/',
        verbose: true,
        p: true,
        long: 'asd',
        longwithstring: 'test',
        _:['dest/']
      })
  })

})
