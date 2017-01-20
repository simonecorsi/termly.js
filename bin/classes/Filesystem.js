class Filesystem {
  constructor({ fs } = {}) {
    this.buildVirtualFs(fs)
  }

  buildVirtualFs(fs) {
    if (!fs && typeof fs !== 'object' && !Array.isArray(fs)) throw new Error('Virtual Filesystem provided not valid, initialization failed.')
    
  }

  //  Luke
  FileWalker(fs, path) {

  }
}
