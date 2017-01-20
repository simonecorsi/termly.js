const DEFAULT_FS = require('../configs/default-filesystem')
const File = require('./File')

/**
 * @class Virtual Filesystem
 * Represented as an object of nodes
 */
class Filesystem {
  constructor(fs = DEFAULT_FS) {
    if (typeof fs !== 'object' || Array.isArray(fs)) throw new Error('Virtual Filesystem provided not valid, initialization failed.')
    this.FileSystem = this.initFs(fs)
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
   * accessing all file at least once
   * calling provided callback on each
   * @param cb executed on each file found
   * @param fs [Shell Virtual Filesystem]
   */
  fileWalker(cb = ()=>{}, fs = this.FileSystem){
    for (let node in fs) {
      if (fs.hasOwnProperty(node)) {
        if (fs[node].type === 'dir') this.fileWalker(cb, fs[node].content)
        else cb(fs[node])
      }
    }
  }

  /**
   * Dir Walker
   * accessing all directory at least once
   * calling provided callback on each
   * @param cb executed on each file found
   * @param fs [Shell Virtual Filesystem]
   */
  dirWalker(cb = ()=>{}, fs = this.FileSystem){
    for (let node in fs) {
      if (fs.hasOwnProperty(node)) {
        if (fs[node].type === 'dir') {
          cb(fs[node])
          this.dirWalker(cb, fs[node].content)
        }
      }
    }
  }
}

module.exports = Filesystem
