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

  it('should have initialized the builtin command with shell reference', () => {
    const cmd = Object.keys(shellInstance.ShellCommands)[0]
    expect(shellInstance.ShellCommands[cmd].shell).to.exist
  })

  it('should have initialized the virtual filesystem with default and saved reference', () => {
    expect(shellInstance.fs).to.exist
    expect(shellInstance.fs.FileSystem.file).to.exist
  })

  it('should create a custom filesystem when passed in costructor', () => {
    const mock_fs = { file: 123, dir: { file2: 456 }}
    const shellInstance2 = new Shell({ filesystem: mock_fs })
    expect(shellInstance2).to.exist
    expect(shellInstance2.fs.FileSystem.file.content).to.exist.and.to.equal(123)
    expect(shellInstance2.fs.FileSystem.dir.content).to.exist.and.to.be.a('object')
  })

  it('should create a shell with custom commands', () => {
    const mock_cmds = {}
    const shellInstance3 = new Shell({ commands: mock_cmds })
    console.log(shellInstance3.ShellCommands)
    shellInstance3.exec('test')
  })

})
