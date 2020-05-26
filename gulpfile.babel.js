import gulp from 'gulp'
/** rollup typescript2 */
import rolluptypescript2 from 'rollup-plugin-typescript2'
/** rollup */
import rollupEach from 'gulp-rollup-each'
/** sass 编译 */
import sass from 'gulp-sass'
/** 压缩js */
import uglify from 'gulp-uglify'
/** 编译es6 */
import rollupBabel from 'rollup-plugin-babel'
/** 从 node_modules 加载模块 */
import rollupPluginNodeResolve from 'rollup-plugin-node-resolve'
/** 加载 CommonJS 模块 */
import rollupResolveCommonjs from 'rollup-plugin-commonjs'
/** sourceMaps */
import sourceMaps from 'gulp-sourcemaps'
/** css 前缀补全 */
import autoprefixer from 'gulp-autoprefixer'
/** 重命名 */
import rename from 'gulp-rename'
/** 生成哈希值 */
import rev from 'gulp-rev'
/** 更新静态引用资源哈希值 */
import revCollector from 'gulp-rev-collector'
import path from 'path'


/** 项目根目录 */
const basePath = path.join(__dirname, 'src')
/** 临时输出目录 */
const tmpPath = path.join(__dirname, '.tmp')
/** 最终输出目录 */
const buildPath = path.join(__dirname, 'dist')

const CF = {
  get urlAssets() {
    return process.env.NODE_ENV === 'production' ? 'http://172.16.10.152:8000/' : '/'
  }
}

/**
 * 添加版本号
 * @param {string} patch
 * @returns {(manifest_value: string) => string}
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

/**
 * @param {import('gulp-rename').ParsedPath} path
 */
function removeEsmName(path) {
  path.basename = path.basename.replace('.esm', '')
}

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

/** CSS 添加hash值 rev-manifest */
gulp.task('CssHash', () => {
  return gulp.src([
    `${buildPath}/css/**/*.css`,
  ])
  .pipe(rev())
  .pipe(rev.manifest())
  .pipe(gulp.dest(`${buildPath}/css`))
})

/** JS 添加hash值 rev-manifest */
gulp.task('JsHash', () => {
  return gulp.src([
    `${buildPath}/js/**/*.js`,
  ])
  .pipe(rev())
  .pipe(rev.manifest())
  .pipe(gulp.dest(`${buildPath}/js`))
})

/** 更新静态引用资源哈希值 */
gulp.task('AssetsVersion', () => {
  return gulp.src([
    `${buildPath}/**/*.json`,
    `${basePath}/**/*.html`,
  ])
  .pipe(revCollector({
    replaceReved: true,
    dirReplacements: {
      './css': version(CF.urlAssets + 'css'),
      './js': version(CF.urlAssets + 'js')
    },
  }))
  .pipe(gulp.dest(`${buildPath}`));
})

/** 自动化更新静态引用资源哈希值 */
gulp.task('UpdateVersion', gulp.series(
  gulp.parallel([
    'CssHash',
    'JsHash'
  ]),
  'AssetsVersion',
))

gulp.task('CompileTS', () => {
  return gulp.src([
    `${basePath}/ts/**/*.ts`
  ])
  .pipe(sourceMaps.init())
  .pipe(rollupEach({
    output: {
      format: 'iife',
      globals: {
        jQuery: '$',
        Swiper: 'Swiper'
      },
    },
    external: ['jQuery', 'Swiper'],
    plugins: [
      rolluptypescript2({
        tsconfig: `${basePath}/tsconfig.json`,
        cacheRoot: tmpPath
      })
    ],
  }))
  .pipe(uglify())
  .pipe(rename({ extname: '.js', suffix: '.min' }))
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

gulp.task('buildCoreJS', () => {
  return gulp.src([
    `${basePath}/js/core-js3.esm.js`,
  ])
  .pipe(sourceMaps.init())
  .pipe(rollupEach({
    output: {
      format: 'iife',
    },
    plugins: [
      rollupPluginNodeResolve({
        mainFields: 'main',
      }),
      rollupResolveCommonjs({
        include: 'node_modules/**',
      }),
    ],
  }))
  .pipe(rename(removeEsmName))
  .pipe(sourceMaps.write('.'))
  .pipe(gulp.dest(`${tmpPath}/js`))
})

gulp.task('CompileES6', () => {
  return gulp.src([
    `${basePath}/js/**/*.esm.js`,
    `!${basePath}/js/core-js3.esm.js`,
  ])
  .pipe(sourceMaps.init())
  .pipe(rollupEach({
    output: {
      format: 'iife',
      globals: {
        jQuery: '$',
        Swiper: 'Swiper'
      },
    },
    external: ['jQuery', 'Swiper'],
    plugins: [
      rollupBabel({
        presets: [
          [
            '@babel/env', {
              modules: false,
              useBuiltIns: 'entry',
              corejs: 3
            }
          ]
        ],
      }),
    ]
  }))
  .pipe(rename(removeEsmName))
  .pipe(sourceMaps.write('.'))
  .pipe(gulp.dest(`${tmpPath}/js`))
})

gulp.task('default', gulp.series([
  gulp.parallel([
    'CompileSCSS',
    'CompileTS',
    'MoveJSlib',
    'MoveCSSlib',
  ]),
  'UpdateVersion',
]))
// gulp.watch([])
