const { expect } = require('chai')
const Shell = require('../bin/classes/Shell')

describe('Shell Class', () => {
  let shellInstance
  it('should init', () => {
    shellInstance = new Shell()
    expect(shellInstance).to.exist
  })

  it('[parseCommand] should accept only STRINGS', () => {
    expect(shellInstance.parseCommand.bind(shellInstance, '')).to.throw(Error)
    expect(shellInstance.parseCommand.bind(shellInstance, 123)).to.throw(Error)
    expect(shellInstance.parseCommand.bind(shellInstance, {})).to.throw(Error)
    expect(shellInstance.parseCommand.bind(shellInstance, [])).to.throw(Error)
    expect(shellInstance.parseCommand.bind(shellInstance, () => {})).to.throw(Error)
    expect(shellInstance.parseCommand.bind(shellInstance)).to.throw(Error)
  })

  it('[execute] should return error object if wrong input', () => {
    expect(shellInstance.execute('')).to.be.a('object')
    expect(shellInstance.execute('').state).to.equal('error')

    expect(shellInstance.execute(123)).to.be.a('object')
    expect(shellInstance.execute(123).state).to.equal('error')

    expect(shellInstance.execute({})).to.be.a('object')
    expect(shellInstance.execute({}).state).to.equal('error')

    expect(shellInstance.execute([])).to.be.a('object')
    expect(shellInstance.execute([]).state).to.equal('error')

    expect(shellInstance.execute(() => {})).to.be.a('object')
    expect(shellInstance.execute(() => {}).state).to.equal('error')
  })
})
