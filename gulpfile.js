var gulp = require('gulp');
var runSequence = require('run-sequence');
var del = require('del');
var vinylPaths = require('vinyl-paths');
var to5 = require('gulp-6to5');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var assign = Object.assign || require('object.assign');
var fs = require('fs');
var browserSync = require('browser-sync');
var changed = require('gulp-changed');
var plumber = require('gulp-plumber');

var path = {
  source:'src/modules/**/*.js',
  html:'src/modules/**/*.html',
  styles:'src/styles/**/*.css',
  index:'src/index.html',
  deps: 'jspm_packages/**',
  jspmConfig: 'config.js',
  output:'dist/',
  doc: 'doc/'
};

var compilerOptions = {
  filename: '',
  filenameRelative: '',
  blacklist: [],
  whitelist: [],
  modules: '',
  sourceMap: true,
  sourceMapName: '',
  sourceFileName: '',
  sourceRoot: '',
  moduleRoot: '',
  moduleIds: false,
  runtime: false,
  experimental: false,
  format: {
    comments: false,
    compact: false,
    indent: {
      parentheses: true,
      adjustMultilineComment: true,
      style: ' ',
      base: 0
    }
  }
};

var jshintConfig = {
  esnext:true
};

gulp.task('clean', function() {
 return gulp.src([path.output])
    .pipe(vinylPaths(del));
});

gulp.task('build-system', function () {
  return gulp.src(path.source)
    .pipe(plumber())
    .pipe(changed(path.output, {extension: '.js'}))
    .pipe(to5(assign({}, compilerOptions, {modules:'system'})))
    .pipe(gulp.dest(path.output + '/modules'));
});

gulp.task('build-html', function () {
  return gulp.src(path.html)
    .pipe(changed(path.output, {extension: '.html'}))
    .pipe(gulp.dest(path.output + '/modules'));
});

gulp.task('build-styles', function () {
  return gulp.src(path.styles)
    .pipe(gulp.dest(path.output + '/styles'));
});

gulp.task('build-index', function () {
  return gulp.src(path.index)
    .pipe(gulp.dest(path.output));
});

gulp.task('build-deps', function () {
  return gulp.src(path.deps)
    .pipe(gulp.dest(path.output  + '/deps'));
});

gulp.task('build-jspm-config', function () {
  return gulp.src(path.jspmConfig)
    .pipe(gulp.dest(path.output));
});

gulp.task('lint', function() {
  return gulp.src(path.source)
    .pipe(jshint(jshintConfig))
    .pipe(jshint.reporter(stylish));
});

gulp.task('build', function(callback) {
  return runSequence(
    'clean',
    ['lint', 'build-system', 'build-html', 'build-styles', 'build-index', 'build-deps', 'build-jspm-config'],
    callback
  );
});

gulp.task('serve', ['build'], function(done) {
  browserSync({
    open: false,
    port: 9000,
    server: {
      baseDir: [path.output],
      middleware: function (req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        next();
      }
    }
  }, done);
});

function reportChange(event){
  console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
}

gulp.task('watch', ['serve'], function() {
  gulp.watch(path.source, ['build-system', browserSync.reload]).on('change', reportChange);
  gulp.watch(path.html, ['build-html', browserSync.reload]).on('change', reportChange);
  gulp.watch(path.styles, ['build-styles', browserSync.reload]).on('change', reportChange);
  gulp.watch(path.index, ['build-index', browserSync.reload]).on('change', reportChange);
});

