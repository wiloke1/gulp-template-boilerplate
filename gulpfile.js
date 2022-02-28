const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const browserSync = require('browser-sync').create();
const sourcemaps = require('gulp-sourcemaps');
const sassGlob = require('gulp-sass-glob');

const isDev = process.env.NODE_ENV === "development";

/**
 * Compile all scss files in the src/scss folder and output them to the build/css folder
 * @param cb - A callback function that runs when the task is complete.
 */
function compileScss(cb) {
  if (isDev) {
    gulp
      .src('./src/scss/*.scss')
      .pipe(sourcemaps.init())
      .pipe(sassGlob())
      .pipe(sass())
      .pipe(sourcemaps.write())
      .pipe(gulp.dest('./.dev/css'))
      .pipe(browserSync.stream());
  }
  gulp
    .src('./src/scss/*.scss')
    .pipe(sassGlob())
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./build/css'))
    .pipe(browserSync.stream());
  cb();
}

/**
 * Compiles all the HTML files in the src directory and puts them in the build directory
 * @param cb - A callback function that runs after the task has completed.
 */
function compileHtml(cb) {
  gulp.src('./src/*.html').pipe(gulp.dest(isDev ? './.dev' : './build'));
  cb();
}

/**
 * Copy all images from the src/img directory to the build/img directory
 * @param cb - A callback function that runs after the task has completed.
 */
function copyImages(cb) {
  gulp.src('./src/img/**/*').pipe(gulp.dest(isDev ? './.dev/img' : './build/img'));
  cb();
}

/**
 * Watch the files in the src/scss folder and when they change, run the compileScss function
 * @param cb - A callback function that runs after the watch task is complete.
 */
function watchFiles() {
  try {
    gulp.watch('./src/scss/**/*.scss', compileScss);
    gulp.watch('./src/img/**/*', copyImages);
    gulp.watch('./src/*.html', compileHtml).on('change', browserSync.reload);
  } catch (err) {
    console.log(err);
  }
}

/**
 * Start the browserSync server and watch the files in the build folder
 * @param cb - A callback function that runs after the browserSync instance is initialized.
 */
function handleBrowserSync(cb) {
  browserSync.init({
    port: 3000,
    server: {
      baseDir: isDev ? './.dev' : './build'
    },
    logConnections: true,
    logFileChanges: true,
    notify: true,
    open: isDev,
  });
  watchFiles();
  cb();
}



/**
 * This function is a gulp task that runs the following tasks in parallel:
 *
 * handleBrowserSync
 * compileScss
 * compileHtml
 * copyImages
 * @returns The dev task is returning the handleBrowserSync function, which is being returned from the
 * gulp.series function.
 */
function dev() {
  return gulp.series(handleBrowserSync, gulp.parallel(compileScss, compileHtml, copyImages));
}

/**
 * Build the project by running the following tasks in parallel:
 *
 * Compile the Sass files.
 * Compile the HTML files.
 * Copy the images
 * @returns The build function returns a gulp.parallel task.
 */
function build() {
  return gulp.parallel(compileScss, compileHtml, copyImages);
}

gulp.task('dev', dev());
gulp.task('build', build());
