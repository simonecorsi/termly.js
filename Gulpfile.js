let gulp = require('gulp')

let browserify = require('browserify')
let watchify = require('watchify')
let babelify = require('babelify')

let source = require('vinyl-source-stream')
let buffer = require('vinyl-buffer')
let merge = require('utils-merge')

let rename = require('gulp-rename')
let uglify = require('gulp-uglify')
let sourcemaps = require('gulp-sourcemaps')


/* nicer browserify errors */
let gutil = require('gulp-util')
let chalk = require('chalk')

function map_error(err) {
  if (err.fileName) {
    // regular error
    gutil.log(chalk.red(err.name)
      + ': '
      + chalk.yellow(err.fileName.replace(__dirname + '/bin/', ''))
      + ': '
      + 'Line '
      + chalk.magenta(err.lineNumber)
      + ' & '
      + 'Column '
      + chalk.magenta(err.columnNumber || err.column)
      + ': '
      + chalk.blue(err.description))
  } else {
    // browserify error..
    gutil.log(chalk.red(err.name)
      + ': '
      + chalk.yellow(err.message))
  }

  this.end()
}

function developBundler(bundler, name) {
  return bundler.bundle()
    .on('error', map_error)
    .pipe(source(name + '.js'))
    .pipe(buffer())
    .pipe(gulp.dest('./build/'))
    .pipe(rename(name + '.min.js'))
    .pipe(sourcemaps.init({ loadMaps: true }))
      // capture sourcemaps from transforms
      .pipe(uglify())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./build/'))
}

function bundleProduction(bundler, name) {
  return bundler.bundle()
    .on('error', map_error)
    .pipe(source('./bin/' + name + '.js'))
    .pipe(buffer())
    .pipe(rename(name + '.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./dist/'))
}


gulp.task('shell', function () {
  let bundler = browserify('./bin/termly.js', { debug: true }).transform(babelify, {/* options */ })
  return developBundler(bundler, 'termly')
})

gulp.task('terminal', function () {
  let bundler = browserify('./bin/termly-prompt.js', { debug: true }).transform(babelify, {/* options */ })
  return developBundler(bundler, 'termly-prompt')
})

// Without sourcemaps
gulp.task('production-build', function () {
  let shellBundle = browserify('./bin/termly.js').transform(babelify, {/* options */ })
  let terminalBundle = browserify('./bin/termly-prompt.js').transform(babelify, {/* options */ })

  bundleProduction(shellBundle, 'termly')
  bundleProduction(terminalBundle, 'termly-prompt')
})

gulp.task('default', ['shell', 'terminal', 'production-build'])
