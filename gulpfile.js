const fs = require('fs')
const argv = require('minimist')(process.argv.slice(2));
const gulp = require('gulp')
const log = require('fancy-log')
const PluginError = require('plugin-error')
const htmlmin = require('gulp-htmlmin')
const cssmin = require('gulp-cssmin')
const uglify = require('gulp-uglify')
const del = require('del')
const imagemin = require('gulp-imagemin')
const webpack = require('webpack')

const conf = require('./gulp/config')
const buildPath = './public'
const notProduction = process.env.NODE_ENV !== 'production'

const cloneGlob = conf.static.path + '/**/*.+(ttf|svg|eot|woff|woff2|ico|otf)'
const imageGlob = conf.static.path + '/**/*.+(jpeg|jpg|png)'
const jsGlob = conf.static.path + '/**/*.js'
const htmlGlob = conf.static.path + '/**/*.+(html|htm)'
const cssGlob = conf.static.path + '/**/*.css'

gulp.task('clean', function () {
  return del.sync([buildPath])
})

gulp.task('clone', function () {
  return gulp.src(cloneGlob)
    .pipe(gulp.dest(buildPath))
})

gulp.task('webpack', function (callback) {
  webpack(conf.webpack, function (err, stats) {
    if (err) {
      throw new PluginError('webpack', err)
    }
    log('[webpack]', stats.toString({}))
    callback()
  })
})

gulp.task('min:image', function () {
  const task = gulp.src(imageGlob)
  if (notProduction) {
    return task.pipe(gulp.dest(buildPath))
  }

  return gulp.src(imageGlob)
    .pipe(imagemin({
      interlaced: true,
      progressive: true,
      optimizationLevel: 5
    }))
    .pipe(gulp.dest(buildPath))
})

gulp.task('min:js', function () {
  const task = gulp.src(jsGlob)
  if (notProduction) {
    return task.pipe(gulp.dest(buildPath))
  }
  return task
    .pipe(uglify())
    .pipe(gulp.dest(buildPath))
})

gulp.task('min:css', function () {
  const task = gulp.src(cssGlob)
  if (notProduction) {
    return task.pipe(gulp.dest(buildPath))
  }
  return task.pipe(cssmin())
    .pipe(gulp.dest(buildPath))
})

gulp.task('min:html', function () {
  const task = gulp.src(htmlGlob)
  if (notProduction) {
    return task.pipe(gulp.dest(buildPath))
  }

  return task.pipe(htmlmin({
    collapseWhitespace: true
  }))
    .pipe(gulp.dest(buildPath))
})

gulp.task('static', ['clone', 'min:image', 'min:js', 'min:css', 'min:html'])

gulp.task('build', ['clean', 'static', 'webpack'])

gulp.task('watch', function () {
  gulp.start('static')
  gulp.watch(cloneGlob, ['clone'])
  gulp.watch(imageGlob, ['min:image'])
  gulp.watch(cssGlob, ['min:css'])
  gulp.watch(jsGlob, ['min:js'])
  gulp.watch(htmlGlob, ['min:html'])
})

gulp.task('listen', function () {

  const host = argv.host || '0.0.0.0'
  const port = argv.port || 3000
  const config = conf.webpack
  for (const name of Object.keys(config.entry)) {
    config.entry[name].unshift(`webpack-dev-server/client?http://localhost:${port}/`)
    config.entry[name].unshift(`webpack/hot/dev-server`)
  }

  config.plugins.push(new webpack.HotModuleReplacementPlugin());

  const compiler = webpack(config)
  compiler.devtool = 'source-map'

  const webpackDevServer = require('webpack-dev-server')
  const server = new webpackDevServer(compiler, conf['webpack-dev-server'])
  server.listen(port, host, function () {
    const app = server.listeningApp;
    const httpListen = host + ':' + port;
    log('[webpack-dev-server]', 'Http Listen in ' + httpListen)
  })
})

gulp.task('app:start', ['listen', 'watch'])

