// *FILESYSTEM
const FS = {
  var:{
    www: {
      "test": "asd"
    }
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

FS.__proto__.pwd = '/';
FS.__proto__.__pwd = function () {
  return this.pwd;
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


FS.__proto__.__cd = function (argv) {
  if(!argv) return "Path argument expected.";
  if(argv.length > 1 ) return "Too many arguments";
  var path = argv[0];

  // GO BACK
  if(path === '..'){
    return 'go back 1 dir'
  }

  // START FROM ROOT
  if(path[0] === '/') {
    return "start from root"
  }

  // relative path
  path = path.split('/');
  return FS.getNode(FS, path);

  //this.pwd = "/var/";
  return argv;
}


FS.__proto__.getNode = function(fs, path){
  if ( path.length === 0 || !path ) return "No path provided";
  var fs = Object.assign({}, fs);
  var path = Object.assign([], path);


  if ( path.length === 1) {
    if( !fs ) return 'path '+ path[0] +' dont exists' ;
    if( fs && !fs[ path[0] ] ) return 'path '+ path[0] +' dont exists' ;

    if( FS.__filetype( fs[ path[0] ] ) === 'FILE' ) return 'Is a file';

    return fs[ path[0] ];
  }

  fs = fs[path[0]] ? fs[path[0]] : null;
  path.shift();
  return FS.getNode(fs, path);
}


module.exports = FS;

//** HELPERS
function formatFileRow(file) {
  return "-r--r--r-- guest guest " + file;
}
function formatDirRow(dir) {
  return "dr-xr-xr-x guest guest " + dir;
}
