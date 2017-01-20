
/**
 * @class Single File Class
 */
class File {
  constructor({ type = 'file', permission = 'rwxrwxrwx',  content = ''} = {}) {
    this.type = type
    this.permission = permission
  }
}
