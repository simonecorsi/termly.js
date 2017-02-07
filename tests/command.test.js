const { expect } = require('chai')
const Command = require('../bin/classes/Command')
const Shell = require('../bin/classes/Shell')
const Parser = require('string-to-argv.js')

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

  it('should throw errror when calling exec if args are not an Object (not an array)', () => {
    expect(() => command.exec('')).to.throw(Error)
    expect(() => command.exec(123)).to.throw(Error)
    expect(() => command.exec([])).to.throw(Error)
    expect(() => command.exec(() => {})).to.throw(Error)
  })

  it('should execute the function passed', () => {
    const cmd_output = "this is the help command output"
    const cmd = new Command({ name: 'help', fn: () => cmd_output})
    expect(cmd.exec()).to.equal(cmd_output)
  })

  it('should execute the function passing the correct arguments', () => {
    const cmd = new Command({
      name: 'arguments',
      type: 'builtin',
      fn: args => args
    })
    const out = cmd.exec(new Parser('arguments first second'))
    expect(out).to.have.property('command', cmd.name)
    expect(out).to.have.property('_').that.is.a('array').that.eql([ 'first', 'second' ])
  })

  it('should execute the function with correct arguments [check flags]', () => {
    const cmd = new Command({
      name: 'arguments',
      type: 'builtin',
      fn: args => args
    })
    const out = cmd.exec(new Parser('arguments -p --string="asd" --path path second'))
    expect(out).to.have.property('command', cmd.name)
    expect(out).to.have.property('p', true)
    expect(out).to.have.property('string', 'asd')
    expect(out).to.have.property('path', 'path')
    expect(out).to.have.property('_').that.is.a('array').that.eql([ 'second' ])
  })

  it('should command function must have this binded to Command Constructor', () => {
    const cmd = new Command({ name:'help', fn: function() { return this instanceof Command }})
    expect(cmd.exec()).to.equal(true)
  })
})

describe('Built-in commands tests - ', () => {
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
  describe('Change Directory Integration Test:', () => {
    const shell = new Shell()
    it('should change directory', () => {
      expect(() => shell.exec('cd /etc')).to.not.throw(Error)
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

  /**
  * CAT COMMAND
  * @type {Command}
  */
  describe('List Directory Integration Test', () => {
    const shell = new Shell()
    it('should cat a file', () => {
      // console.log(shell.exec('cat'))
      expect(shell.exec('cat file.h')).to.equal('#include <nope.h>')
      expect(shell.exec('cat ./file.h')).to.equal('#include <nope.h>')
      expect(shell.exec('cat /file.h')).to.equal('#include <nope.h>')
      // NESTED
      expect(shell.exec('cat etc/apache2/apache2.conf')).to.equal('Not What you were looking for :)')
      expect(shell.exec('cat ./etc/apache2/apache2.conf')).to.equal('Not What you were looking for :)')
      expect(shell.exec('cat /etc/apache2/apache2.conf')).to.equal('Not What you were looking for :)')
    })
  })

  describe('printenv Integration', () => {
    const shell = new Shell()
    it('should print the environments variables', () => {
      expect(shell.exec('printenv')).to.eql('USER=root\nHOSTNAME=my.host.me\n')
    })
  })

  describe('EXPORT command Integration', () => {
    const shell = new Shell()
    it('should return an error with no value', () => {
      expect(shell.exec('export')).to.match(/-fatal export.*/)
    })

    it('should set unquoted value', () => {
      expect(shell.env).to.not.have.property('TEST_VALUE')
      shell.exec('export TEST_VALUE=123')
      expect(shell.env.TEST_VALUE).to.exist
      expect(shell.env.TEST_VALUE).to.equal('123')
    })

    it('should set quoted value', () => {
      expect(shell.env).to.not.have.property('TEST_QUOTED_VALUE')
      shell.exec('export TEST_QUOTED_VALUE="123 asd"')
      expect(shell.env.TEST_QUOTED_VALUE).to.exist
      expect(shell.env.TEST_QUOTED_VALUE).to.equal('123 asd')
    })
  })

  /**
  * HTTP REQUESTS COMMAND
  * @type {Command}
  */
  describe('List Directory Integration Test', () => {
    const shell = new Shell()
    it('should return error if no params are provided', () => expect(shell.exec('http')).to.match(/-fatal/))
    it('should return error if less than 2 params passed [method, url]', () => expect(shell.exec('http get')).to.match(/-fatal/))
    it('[TODO Sinon or Mock XMLHttpRequest] should do a basic GET request')
  })
})
