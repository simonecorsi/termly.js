// *FILESYSTEM
var FS = {
  var:{
    www: {
      "anotherfile": "WELLCOME"
    },
    inner: {},
  },
  etc:{
    apache2: {
      "apache2.conf": "Not what you are looking for"
    }
  },
  "thisisafile.md": "What did you expect?"
};

FS.__initFS = function (custom_filesystem) {
  if(custom_filesystem) FS = custom_filesystem;
}

FS.__proto__.pwd = '/';
FS.__proto__.__pwd = function () {
  return this.pwd;
}
FS.__proto__.setCurrentDir = function (cd) {
  this.__proto__.pwd = '/' + cd;
}

FS.__proto__.getCurrentDirIstance = function () {
  var path = FS.__pwd().split("/");
  path.shift();
  if(path[0] !== ''){
    var current_dir = this.getNode(FS, path)
    return Object.assign({}, current_dir);
  }else{
    return Object.assign({}, FS);
  }
}

FS.__proto__.__filetype = function (file) {
  if(typeof file === 'string') return 'FILE';
  if(typeof file === 'object' && !Array.isArray(file)) return 'DIR';
  if(typeof file === 'object' && Array.isArray(file)) return 'LIST';
}

FS.__proto__.getNode = function(fs, path){
  if ( path.length === 0 || !path ) {
    console.error('no path provided')
    return null;
  }
  var fs = Object.assign({}, fs);
  var path = Object.assign([], path);
  if ( path.length === 1) {
    if( !fs ){
      console.error('path '+ path[0] +' dont exists');
      return null;
    }
    if( fs && !fs[ path[0] ] ){
        console.error('path '+ path[0] +' dont exists');
        return null;
    }
    if( FS.__filetype( fs[ path[0] ] ) === 'FILE' || FS.__filetype( fs[ path[0] ] ) === 'LIST' ) {
      console.error('its a file');
      return null;
    }
    //return fs[ path[0] ];
    return Object.assign({}, fs[ path[0] ]);
  }
  fs = fs[path[0]] ? fs[path[0]] : null;
  path.shift();
  return FS.getNode(fs, path);
}


// COMMANDS
//------------------------------------------------
FS.__proto__.__ls = function () {
  var ls = "";
  var that = this;
  var current_dir = FS.getCurrentDirIstance();

  for(var key in current_dir){
    if(current_dir.hasOwnProperty(key)){
      var stat = '';
      if(that.__filetype(current_dir[key]) === 'DIR'){
        stat = formatDirRow(key);
      } else if(that.__filetype(current_dir[key]) === 'FILE'){
        stat = formatFileRow(key);
      } else{
        stat = formatFileRow(key);
      }
      ls += stat + "\n";
    }
  }
  return ls;
}

FS.__proto__.__cat = function (argv) {
  var that = this;
  var current_dir = FS.getCurrentDirIstance();
  if(!argv) return "cat need 1 input file.";
  var file = current_dir[argv[0]] || null;
  //get file if exist
  if(!file) return "File not found.";
  if( that.__filetype(file) === 'DIR') return 'Is a directory.';
  return file;
}


FS.__proto__.__cd = function (argv) {
  if(!argv) return "Path argument expected.";
  if(argv.length > 1 ) return "Too many arguments";
  var path = argv[0];

  // GO BACK
  if(path === '..'){
    if(this.__pwd() === '/' ) return "Currently in root directory."
    path = this.__pwd().split('/');
    path.shift();
    path.pop();
    //handle back in ROOT
    if(!path.length){
      FS.setCurrentDir('');
      return this.__pwd();
    }
  }else {
    // IF PATH IS ABSOLUTE
    if(path[0] === '/') {
      path = path.split('/');
      path.shift();

      // IF CD INTO ROOT DIR
      if(path[0] === ''){
        FS.setCurrentDir('');
        return this.__pwd();
      }
    }else{
      // IF PATH IS RELATIVE
      path = FS.__pwd().length === 1  ? FS.__pwd() + path : FS.__pwd() + '/' + path;
      path = path.split('/');
      path.shift();
    }

  }

  //console.log(path);

  var node = FS.getNode(FS, path);
  if(node){
    this.setCurrentDir( path.join("/") );
    return 'Changed current dir to: ' + this.__pwd();
  }else{
    return "Path dont exists or is a file";
  }
  return this.__pwd();
}



module.exports = FS;

//** HELPERS
function formatFileRow(file) {
  return "-r--r--r-- guest guest " + file;
}
function formatDirRow(dir) {
  return "dr-xr-xr-x guest guest " + dir;
}
