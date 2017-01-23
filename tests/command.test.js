const { expect } = require('chai')
const Command = require('../bin/classes/Command')
const Shell = require('../bin/classes/Shell')

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

describe('Built-in commands tests', () => {
  /**
   * Help
   * @type Command
   */
  describe('Help Command', () => {
    const shell = new Shell()
    it('should return list of commands', () => {
      console.log(shell.exec('help'))
    })
  })

  /**
  * CD COMMAND
  * @type {Command}
  */
  describe('Change Directory Integration Test', () => {
    const shell = new Shell()
    it('should change directory', () => {
      shell.exec('cd /etc')
      expect(shell.fs.cwd).to.eql([ '/', 'etc' ])
    })

    it('should throw error if no path provided', () => {
      expect(shell.exec('cd')).to.match(/invalid/)
    })

    it('should throw error if not exist', () => {
      expect(shell.exec('cd /dontexist')).to.match(/File doesn\'t exist/)
    })

    it('should throw error if invalid', () => {
      expect(shell.exec('cd ///dontexist')).to.match(/invalid/)
    })

    it('should have changed current working dir', () => {
      shell.exec('cd /etc')
      expect(shell.fs.cwd).to.eql(['/', 'etc'])
    })
  })

  /**
  * LS COMMAND
  * @type {Command}
  */
  describe('List Directory Integration Test', () => {
    const shell = new Shell()
    it('should list directory', () => {
      expect(shell.exec('ls /etc')).to.match(/drwxr-xr-x\troot root\tapache2/g)
    })
    it('should list current dir if no args passed', () => {
      expect(shell.exec('ls')).to.have.length.above(15)
    })
    it('should list nested directory', () => {
      expect(shell.exec('ls /home/guest/docs')).to.have.length.above(15)
      expect(() => shell.exec('ls /home/guest/docs')).to.not.throw(Error).to.be.a('string')
    })
    it('should throw error if not exist', () => {
      expect(shell.exec('ls /dontexist')).to.match(/File doesn\'t exist/)
    })

    it('should throw error if invalid', () => {
      expect(shell.exec('ls ///dontexist')).to.match(/invalid/)
    })
  })
})
