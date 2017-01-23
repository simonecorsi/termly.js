const { expect } = require('chai')
const Filesystem = require('../bin/classes/Filesystem')

describe('Filesystem Class', () => {
  let fsInstance

  it('should init', () => {
    fsInstance = new Filesystem()
    expect(fsInstance).to.exist
  })

  it('should throw an error if invalid data is passed to costructor', () => {
    expect(() => new Filesystem(123)).to.throw(Error)
    expect(() => new Filesystem("123")).to.throw(Error)
    expect(() => new Filesystem([])).to.throw(Error)
    expect(() => new Filesystem(() => {})).to.throw(Error)
  })

  it('should have built the virtual fs', () => {
    expect(fsInstance.FileSystem).to.exist
    expect(fsInstance.FileSystem.etc.content.apache2.content).to.be.a('object')
  })

  it('should create a custom filesystem when passed in costructor', () => {
    const mock_fs = { file: 123, dir: { file2: 456 }}
    const fsIntance2 = new Filesystem(mock_fs)
    expect(fsIntance2).to.exist
    expect(fsIntance2.FileSystem.file.content).to.exist.and.to.equal(123)
    expect(fsIntance2.FileSystem.dir.content).to.exist.and.to.be.a('object')
  })

  it('should traverse the FS files and calling callabck on every file', () => {
    let c = 0
    fsInstance.traverseFiles((file) => c++, undefined)
    expect(c).to.equal(6)
  })

  it('should traverse the FS Dirs and calling callabck on every file', () => {
    let c = 0
    fsInstance.traverseDirs((dir) => c++)
    expect(c).to.equal(8)
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
      expect(fsInstance.fileWalker([])).to.equal(fsInstance.FileSystem)
    })
    it('should return root if / passed', () => {
      expect(fsInstance.fileWalker(['/'])).to.equal(fsInstance.FileSystem)
    })
    it('should walk if file is not in root', () => {
      expect(fsInstance.fileWalker(['/', 'etc'])).to.equal(fsInstance.FileSystem.etc.content)
    })
    it('should throw error in deeper level too', () => {
      expect(() => fsInstance.fileWalker(['/', 'etc', 'vars'])).to.throw(Error)
    })
  })

  describe('getNodeReference function', () => {
    it('should throw error if invalid path', () => {
      expect(() => fsInstance.getNodeReference('//etc')).to.throw(Error)
    })
    it('should throw error if path dont exist', () => {
      expect(() => fsInstance.getNodeReference('/notexist')).to.throw(Error)
    })
    it('should work and return path as array and dir node reference', () => {
      // fsInstance.getNodeReference()
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


})
