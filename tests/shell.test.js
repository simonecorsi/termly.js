const { expect } = require('chai')
const Shell = require('../bin/classes/Shell')

describe('Shell Class', () => {
  let shellInstance
  it('should init', () => {
    shellInstance = new Shell()
    expect(shellInstance).to.exist
  })

  it('should return error if command doesnt exist', () => {
    expect(shellInstance.execute('test')).to.match(/-error/)
  })

  it('should run the arguments command and have all arguments parsed returned', () => {
    const out = JSON.parse(shellInstance.execute('arguments first second'))
    expect(out[0]).to.equal('first')
    expect(out[1]).to.equal('second')
  })

})
