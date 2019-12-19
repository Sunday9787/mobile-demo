import gulp from 'gulp'
/** sass 编译 */
import sass from 'gulp-sass'/** sourceMaps */
import sourceMaps from 'gulp-sourcemaps'
/** css 前缀补全 */
import autoprefixer from 'gulp-autoprefixer'
import path from 'path'


/** 项目根目录 */
const basePath = path.join(__dirname, 'src')
/** 临时输出目录 */
const tmpPath = path.join(__dirname, '.tmp')
/** 最终输出目录 */
const buildPath = path.join(__dirname, 'dist', 'assets')


/** 编译 scss */
gulp.task('sass', () => {
  return gulp.src([
    `${basePath}/scss/**/*.scss`,
    `!${basePath}/scss/**/_*.scss`
  ])
  .pipe(sourceMaps.init())
  .pipe(sass.sync({ outputStyle: 'expanded' }).on('error', sass.logError))
  .pipe(autoprefixer())
  .pipe(sourceMaps.write('.'))
  .pipe(gulp.dest(`${buildPath}/css`))
})

gulp.task('watch', () => {
  return gulp.watch(`${basePath}/scss/**/*.scss`, gulp.series(['sass']))
})

gulp.task('default', gulp.series([
  'sass'
]))

// gulp.watch([])
