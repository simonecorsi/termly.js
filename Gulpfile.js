const gulp = require('gulp')
const sass = require('gulp-sass')

gulp.task('scss', () => {
  return gulp.src('css/src/style.scss')
  .pipe(sass())
  .pipe(gulp.dest('css/'))
})

gulp.task('default', ['scss'])
