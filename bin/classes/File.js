/**
 * @class Single File Class
 * Simulate file properties
 */
class File {
  constructor({ name = '', type = 'file', content = ''} = {}) {
    this.uid = this.genUid()
    this.name = name
    this.type = type
    this.content = content
    this.user = 'root'
    this.group = 'root'

    if (this.type === 'file') {
      this.permission = 'rwxr--r--'
    } else {
      this.permission = 'drwxr-xr-x'
    }

  }

  genUid() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
  }
}

module.exports = File
