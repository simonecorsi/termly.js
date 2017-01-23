const DEFAULT_FS = require('../configs/default-filesystem')
const File = require('./File')

/**
 * @class Virtual Filesystem
 * Represented as an object of nodes
 */
class Filesystem {
  constructor(fs = DEFAULT_FS, shell = {}) {
    this.shell = shell
    if (typeof fs !== 'object' || Array.isArray(fs)) throw new Error('Virtual Filesystem provided not valid, initialization failed.')

    // Not By Reference.
    // HACK: Object assign refuse to work as intended.
    fs = JSON.parse(JSON.stringify(fs))
    this.FileSystem = this.initFs(fs)

    // CWD for commands usage
    this.cwd = ['/']
  }

  /**
   * Init & Pass Control to recurrsive function
   * @return new Filesystem as nodes of multiple @class File
   */
  initFs(fs) {
    this.buildVirtualFs(fs)
    return fs
  }

  /**
   * Traverse all node and build a virtual representation of a filesystem
   * Each node is a File instance.
   * @param Mocked Filesystem as Object
   *
   */
  buildVirtualFs(obj) {
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
          obj[key] = new File({ name: key, content: obj[key], type: 'dir' })
          this.buildVirtualFs(obj[key].content)
        } else {
          obj[key] = new File({ name: key, content: obj[key] })
        }
      }
    }
  }

  /**
   * Get a stringed path and return as array
   * throw error if path format is invalid
   * Relative Path gets converted using Current Working Directory
   * @param path {String}
   * @return Array
   */
  pathStringToArray(path = '') {
    if (!path.length) throw new Error('Path cannot be empty')

    // Check for invalid path, eg. two+ // in a row
    if (path.match(/\/{2,}/g)) throw new Error(`-invalid path: ${path}`)

    // Format and Composer array
    let pathArray = path.split('/')
    if (pathArray[0] === '') pathArray[0] = '/'
    if (pathArray[0] === '.') pathArray.shift()
    if(pathArray[pathArray.length - 1] === '') pathArray.pop()

    // handle relative path with current working directory
    if (pathArray[0] !== '/') {
      pathArray = this.cwd.concat(pathArray)
    }
    return pathArray
  }

  /**
   * Path from array to String
   * For presentational purpose.
   * TODO
   * @param path [Array]
   * @return {String}
   */
  pathArrayToString(path = []) {

  }

  /**
   * Luke.. fileWalker
   * Accepts only Absolute Path, you must convert paths before calling using pathStringToArray
   * @param cb executed on each file found
   * @param fs [Shell Virtual Filesystem]
   */
  fileWalker(path = ['/'], fs = this.FileSystem){
    if (!Array.isArray(path)) throw new Error('Path must be an array of nodes, use Filesystem.pathStringToArray({string})')

    // Pure Func Wannabe
    path = path.slice(0)
    fs = Object.assign(fs, {})

    // Exit Condition
    if (!path.length) return fs

    // Get current node
    let node = path.shift()

    // Go deeper if it's not the root dir
    if (node !== '/') {
      // check if node exist
      if (fs[node]) {
        fs = fs[node].content
      } else {
        throw new Error('File doesn\'t exist')
      }
    }
    return this.fileWalker(path, fs)
  }

  /**
   * traverseFiles
   * accessing all file at least once
   * calling provided callback on each
   * @param cb executed on each file found
   * @param fs [Shell Virtual Filesystem]
   */
  traverseFiles(cb = ()=>{}, fs = this.FileSystem){
    const self = this.traverseFiles
    for (let node in fs) {
      if (fs.hasOwnProperty(node)) {
        if (fs[node].type === 'dir') this.traverseFiles(cb, fs[node].content)
        else cb(fs[node])
      }
    }
  }

  /**
   * traverseDirs
   * accessing all directory at least once
   * calling provided callback on each
   * @param cb executed on each file found
   * @param fs [Shell Virtual Filesystem]
   */
  traverseDirs(cb = ()=>{}, fs = this.FileSystem){
    for (let node in fs) {
      if (fs.hasOwnProperty(node)) {
        if (fs[node].type === 'dir') {
          cb(fs[node])
          this.traverseDirs(cb, fs[node].content)
        }
      }
    }
  }

  /**
   * Get Directory Node Reference
   * @return Directory Node Referenced Object
   */
  getNodeReference(path = '') {
    if (typeof path !== 'string') throw new Error('Invalid input.')
    let pathArray, dir
    try {
      pathArray = this.pathStringToArray(path)
      dir = this.fileWalker(pathArray)
    } catch (e) {
      throw e
    }
    if (dir.type === 'file') {
      throw new Error('Its a file not a directory')
    }
    if (!dir || dir.content) {
      throw new Error('Invalid Path, doent exist')
    }
    return { path, pathArray , dir }
  }

  /**
   * Change Current Working Directory Gracefully
   */
  changeDir(path = '') {
    if (typeof path !== 'string') throw new Error('Invalid input.')
    let pathArray, dir
    try {
      pathArray = this.pathStringToArray(path)
      dir = this.fileWalker(pathArray)
    } catch (e) {
      throw e
    }
    if (dir.type === 'file') {
      throw new Error('Its a file not a directory')
    }
    if (!dir || dir.content) {
      throw new Error('Invalid Path, doent exist')
    }
    this.cwd = pathArray
    return `changed directory.`
  }
}

module.exports = Filesystem
