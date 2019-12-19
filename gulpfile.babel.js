import gulp from 'gulp'
/** rollup typescript2 */
import rolluptypescript2 from 'rollup-plugin-typescript2'
/** rollup */
import rollupEach from 'gulp-rollup-each'
/** sass 编译 */
import sass from 'gulp-sass'
/** sourceMaps */
import sourceMaps from 'gulp-sourcemaps'
/** css 前缀补全 */
import autoprefixer from 'gulp-autoprefixer'
/** 重命名 */
import rename from 'gulp-rename'
import rev from 'gulp-rev'
import revCollector from 'gulp-rev-collector'
import path from 'path'


/** 项目根目录 */
const basePath = path.join(__dirname, 'src')
/** 临时输出目录 */
const tmpPath = path.join(__dirname, '.tmp')
/** 最终输出目录 */
const buildPath = path.join(__dirname, 'dist')


/** 编译 scss */
gulp.task('CompileSCSS', () => {
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

gulp.task('AddCSSrev', () => {
  return gulp.src([
    `${buildPath}/css/**/*.css`,
  ])
  .pipe(rev())
  .pipe(rev.manifest())
  .pipe(gulp.dest(`${buildPath}/css`))
})

gulp.task('AddJSrev', () => {
  return gulp.src([
    `${buildPath}/js/**/*.js`,
  ])
  .pipe(rev())
  .pipe(rev.manifest())
  .pipe(gulp.dest(`${buildPath}/js`))
})

/**
 * 添加版本号
 * @param {string} patch 
 */
function version(patch) {
  return (manifest_value) => {
    const result = manifest_value.match(/([^-]+)-(\w+)(.+)/);
    const fileNamePatch = result[1];
    const ver = result[2];
    const ext = result[3];
    return `${patch}/${fileNamePatch}${ext}?v=${ver}`
  }
}

gulp.task('AddHTMLrev', () => {
  return gulp.src([
    `${buildPath}/**/*.json`,
    `${basePath}/**/*.html`,
  ])
  .pipe(revCollector({
    replaceReved: true,
    dirReplacements: {
      './css': version('/css'),
      './js': version('/js')
    },
  }))
  .pipe(gulp.dest(`${buildPath}`));
})

gulp.task('CompileTS', () => {
  return gulp.src([
    `${basePath}/ts/**/*.ts`
  ])
  .pipe(sourceMaps.init())
  .pipe(rollupEach({
    output: {
      format: 'amd'
    },
    plugins: [
      rolluptypescript2({
        tsconfig: `${basePath}/tsconfig.json`,
        cacheRoot: tmpPath
      })
    ],
  }))
  .pipe(rename((opts) => {
    opts.extname = '.js';
  }))
  .pipe(sourceMaps.write('.'))
  .pipe(gulp.dest(`${buildPath}/js`))
})

gulp.task('MoveJSlib', () => {
  return gulp.src(`${basePath}/js/lib/**/*.js`)
  .pipe(gulp.dest(`${buildPath}/js/lib`))
})

gulp.task('MoveCSSlib', () => {
  return gulp.src(`${basePath}/css/lib/**/*.css`)
  .pipe(gulp.dest(`${buildPath}/css/lib`))
})

gulp.task('watch', () => {
  return gulp.watch([
    `${basePath}/scss/**/*.scss`,
    `${basePath}/ts/**/*.ts`,
  ], gulp.series(['CompileSCSS', 'CompileTS']))
})

gulp.task('default', gulp.parallel([
  'CompileSCSS',
  'CompileTS',
  'MoveJSlib',
  'MoveCSSlib',
]))
// gulp.watch([])
