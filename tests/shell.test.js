const { expect } = require('chai')
const Shell = require('../bin/classes/Shell')

describe('Shell Class', () => {
  let shellInstance
  it('should init', () => {
    shellInstance = new Shell()
    expect(shellInstance).to.exist
  })

  describe('Input parameters', () => {
    it('should init with env parameter', () => {
      const shell = new Shell({ env: { USER: 'testuser' }})
      expect(shell.env.USER).to.equal('testuser')
    })
    it('should init with env parameter', () => {
      const shell = new Shell({ env: { USER: 'testuser' }})
      expect(shell.env.USER).to.equal('testuser')
    })
  })

  it('should return error if command doesnt exist', () => {
    expect(() => shellInstance.run('test')()).to.throw(Error)
  })

  it('should run the arguments command and have all arguments parsed returned', () => {
    const out = shellInstance.run('arguments first second')
    const expected = {
      command: 'arguments',
      _: ['first', 'second'],
      raw: 'arguments first second'
    }
    // WATCH OUT, the json is parsed to have 2 space tabs for output, remove them
    expect(out).to.be.a('string')
    expect(JSON.parse(out.replace(/\n/g,''))).to.eql(expected)
  })

  it('should have initialized the builtin command with shell reference', () => {
    const cmd = Object.keys(shellInstance.ShellCommands)[0]
    expect(shellInstance.ShellCommands[cmd].shell).to.exist
  })

  it('should have initialized the virtual filesystem with default and saved reference', () => {
    expect(shellInstance.fs).to.exist
    expect(shellInstance.fs.FileSystem.content['file.h']).to.exist
  })

  it('should create a custom filesystem when passed in costructor', () => {
    const mock_fs = { file: 123, dir: { file2: 456 }}
    const shellInstance2 = new Shell({ filesystem: mock_fs })
    expect(shellInstance2).to.exist
    expect(shellInstance2.fs.FileSystem.content.file.content).to.exist.and.to.equal(123)
    expect(shellInstance2.fs.FileSystem.content.dir.content).to.exist.and.to.be.a('object')
  })

  it('should create a shell with custom commands', () => {
    const mock_cmds = {
      test: {
        name: 'test',
        fn: () => {
          return 'This is a user inserted command'
        }
      },
    }
    const shellInstance3 = new Shell({ commands: mock_cmds })
    expect(shellInstance3.ShellCommands).to.exist
    expect(shellInstance3.ShellCommands.test).to.exist
    expect(shellInstance3.run('test')).to.equal('This is a user inserted command')
  })

  it('should override builtin commands if user provide command with same name', () => {
    const mock_cmds = {
      help: {
        name: 'help',
        fn: () => {
          return 'This should override the buitin help.'
        }
      },
    }
    const shellInstance4 = new Shell({ commands: mock_cmds })
    expect(shellInstance4.ShellCommands).to.exist
    expect(shellInstance4.ShellCommands.help).to.exist
    expect(shellInstance4.run('help')).to.equal('This should override the buitin help.')
  })

})
