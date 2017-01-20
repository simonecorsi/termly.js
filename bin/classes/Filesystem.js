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

  //  Luke
  FileWalker(fs){
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
          FileWalker(obj[key])
        }
      }
    }
  }
}

module.exports = Filesystem
