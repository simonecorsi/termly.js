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

  /**
   * Luke.. fileWalker
   * @param cb executed on each file found
   * @param fs [Shell Virtual Filesystem]
   */
  fileWalker(path = ['/'], fs = this.FileSystem){
    if (!Array.isArray(path)) throw new Error('Path must be an array of nodes')

    // Exit Condition
    if (!path.length) return fs

    //  is a relative path
    if (path[0].length && (path[0] !== '/' || path[0] === './')) {

    }

    //  It's an absolute path

    let currentNode = path.shift()

    //  Root listing requested
    if (currentNode === '/' && !path.length) {
      return fs
    } else {
      fs = fs[ path[0] ]
    }

    console.log(this.FileSystem)

    // Walk Again
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
