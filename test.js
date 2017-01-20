const File = require('./bin/classes/File')

const fs = {

  file: 'Content',

  list: [1,2,3],

  etc: {
    apache2: {
      'apache2.conf': 'Not What you were looking for :)',
      'aye': {
        more: {
          inner: 'innerissimo'
        }
      }
    },
  },

  home: {
    guest: {
      docs: {
        mydoc: 'TestFile',
        mydoc2: 'TestFile2',
        mydoc3: 'TestFile3',
      },
    },
  },
}

function LukeFileWalker(obj) {
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
        obj[key] = new File({ name: key, content: obj[key], type: 'dir' })
        LukeFileWalker(obj[key].content)
      } else {
        obj[key] = new File({ name: key, content: obj[key] })
      }
    }
  }
}

LukeFileWalker(fs)
console.log(fs)
