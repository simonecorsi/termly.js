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
    this.FileSystem = this.initFs(fs)

    this.cwd = ['/']
  }

  initFs(fs) {
    this.buildVirtualFs(fs)
    return fs
  }

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

  pathStringToArray(path = '') {
    if (!path.length) throw new Error('Path cannot be empty')

    // Check for invalid path, eg. two+ // in a row
    if (path.match(/\/{2,}/g)) throw new Error(`-invalid path: ${path}`)

    // Format and Composer array
    let pathArray = path.split('/')
    if (pathArray[0] === '') pathArray[0] = '/'
    if (pathArray[0] === '.') pathArray.shift()
    if(pathArray[pathArray.length - 1] === '') pathArray.pop()
    return pathArray
  }

  /**
   * Luke.. fileWalker
   * @param cb executed on each file found
   * @param fs [Shell Virtual Filesystem]
   */
  fileWalker(path = ['/'], fs = this.FileSystem){
    if (!Array.isArray(path)) throw new Error('Path must be an array of nodes, use Filesystem.pathStringToArray({string})')

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
}

module.exports = Filesystem
