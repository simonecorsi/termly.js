// *FILESYSTEM
const FS = {
  var:{
    www: {}
  },
  etc:{
    apache2: {}
  },
  "test.md": "asd"
}

FS.__proto__.__ls = function () {
  var that = this;
  var ls = [];
  for(var key in that){
    if(that.hasOwnProperty(key)){
      var stat = '';
      if(that.__filetype(that[key]) === 'DIR'){
        stat = formatDirRow(key)
      } else if(that.__filetype(that[key]) === 'FILE'){
        stat = formatFileRow(key)
      }
      ls.push(stat);
    }
  }
  return ls;
}

FS.__proto__.__filetype = function (file) {
  if(typeof file === 'string') return 'FILE';
  if(typeof file === 'object') return 'DIR';
}

FS.__proto__.__cat = function (argv) {
  var that = this;
  if(!argv) return "cat need 1 input file.";
  //get file if exist
  var file = FS[argv[0]] || null;
  if(!file) return "File not found.";
  if( that.__filetype(file) === 'DIR') return 'Is a directory.';

  return FS[argv[0]];

}

module.exports = FS;

//** HELPERS
function formatFileRow(file) {
  return "-r--r--r-- guest guest " + file;
}
function formatDirRow(dir) {
  return "dr-xr-xr-x guest guest " + dir;
}
