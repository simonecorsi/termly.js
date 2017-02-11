const { expect } = require('chai')
const Filesystem = require('../bin/classes/Filesystem')

describe('Filesystem Class', () => {
  let fsInstance
  it('should init', () => {
    fsInstance = new Filesystem()
    expect(fsInstance).to.exist
  })

  describe('Instantiation', () => {

    it('should throw an error if invalid data is passed to costructor', () => {
      expect(() => new Filesystem(123)).to.throw(Error)
      expect(() => new Filesystem("123")).to.throw(Error)
      expect(() => new Filesystem([])).to.throw(Error)
      expect(() => new Filesystem(() => {})).to.throw(Error)
    })

    it('should have built the virtual fs', () => {
      const rootDir = fsInstance.FileSystem.content
      expect(fsInstance.FileSystem).to.exist
      expect(rootDir.etc.content.apache2.content).to.be.a('object')
    })

    it('should create a custom filesystem when passed in costructor', () => {
      const mock_fs = { file: 123, dir: { file2: 456 }}
      const fsIntance2 = new Filesystem(mock_fs)
      const rootDir = fsIntance2.FileSystem.content
      expect(fsIntance2).to.exist
      expect(rootDir.file.content).to.exist.and.to.equal(123)
      expect(rootDir.dir.content).to.exist.and.to.be.a('object')
    })

  })

  describe('pathStringToArray', () => {
    it('should throw errror if no path is provided', () => {
      expect(() => fsInstance.pathStringToArray()).to.throw(Error)
    })
    it('should translate stringed path to an array', () => {
      expect(fsInstance.pathStringToArray('/etc/apache2')).to.eql(['/', 'etc', 'apache2'])
      expect(fsInstance.pathStringToArray('etc/apache2')).to.eql(['/', 'etc', 'apache2'])
      expect(fsInstance.pathStringToArray('etc/apache2/')).to.eql(['/', 'etc', 'apache2'])
      expect(fsInstance.pathStringToArray('./etc/apache2/')).to.eql(['/',  'etc', 'apache2'])
      expect(() => fsInstance.pathStringToArray('./etc//apache2/')).to.throw(Error)
    })
  })

  describe('FileWalker Filesystem function', () => {
    it('should throw error if node dont exist', () => {
      expect(() => fsInstance.fileWalker(['test'])).to.throw(Error)
    })
    it('should return root dir if no value is passed', () => {
      expect(fsInstance.fileWalker([])).to.equal(fsInstance.FileSystem.content)
    })
    it('should return root if / passed', () => {
      expect(fsInstance.fileWalker(['/'])).to.equal(fsInstance.FileSystem.content)
    })
    it('should walk if file is not in root', () => {
      expect(fsInstance.fileWalker(['/', 'etc'])).to.equal(fsInstance.FileSystem.content.etc.content)
    })
    it('should throw error in deeper level too', () => {
      expect(() => fsInstance.fileWalker(['/', 'etc', 'vars'])).to.throw(Error)
    })
  })

  describe('getNode function', () => {
    it('should throw error if invalid value is passed, only string accepted', () => {
      expect(() => fsInstance.getNode([])).to.throw(Error)
    })
    it('should throw error if invalid path', () => {
      expect(() => fsInstance.getNode('//etc')).to.throw(Error)
    })
    it('should throw error if path dont exist', () => {
      expect(() => fsInstance.getNode('/notexist')).to.throw(Error)
    })
    it('should work and return path as array and dir node reference', () => {
      expect(fsInstance.getNode('/etc')).to.exist.to.have.property('node')
      expect(fsInstance.getNode('/etc')).to.exist.to.have.property('path')
      expect(fsInstance.getNode('/etc')).to.exist.to.have.property('pathArray')
    })
  })

  describe('Bultin Change Directory function', () => {
    it('should change the current working directory', () => {
      fsInstance.changeDir('/etc')
      expect(fsInstance.cwd).to.eql(['/', 'etc'])
    })
    it('should throw error if invalid path', () => {
      expect(() => fsInstance.changeDir('///etc')).to.throw(Error).to.match(/invalid/)
    })
    it('should throw error if path not exist', () => {
      expect(() => fsInstance.changeDir('/etc/idontexist')).to.throw(Error).to.match(/exist/)
    })
  })

  describe('Bultin List Directory function', () => {
    it('should throw error if invalid path', () => {
      expect(() => fsInstance.listDir('///etc')).to.throw(Error).to.match(/invalid/)
    })
    it('should throw error if path not exist', () => {
      expect(() => fsInstance.listDir('/etc/idontexist')).to.throw(Error).to.match(/exist/)
    })
    it('should list the current working directory', () => {
      expect(fsInstance.listDir('/etc')).to.exist.to.be.a('object').to.have.property('apache2')
    })
  })


})
