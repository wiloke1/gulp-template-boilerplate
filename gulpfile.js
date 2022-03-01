const gulp = require("gulp");
const sass = require("gulp-sass")(require("sass"));
const browserSync = require("browser-sync").create();
const sourcemaps = require("gulp-sourcemaps");
const sassGlob = require("gulp-sass-glob");
const fs = require("fs-extra");

const isDev = process.env.NODE_ENV === "development";
const config = {
  port: 3000,
  input: "src",
  styles: "styles",
  img: "img",
  js: "js",
  output: {
    dev: "dev",
    prod: "build",
  },
};

/**
 * Compile all scss files in the src/scss folder and output them to the build/css folder
 * @param cb - A callback function that runs when the task is complete.
 */
function compileScss(cb) {
  if (isDev) {
    gulp
      .src(`${config.input}/${config.styles}/*.scss`)
      .pipe(sourcemaps.init())
      .pipe(sassGlob())
      .pipe(sass())
      .pipe(sourcemaps.write())
      .pipe(gulp.dest(`${config.output.dev}/${config.styles}`))
      .pipe(browserSync.stream());
  }
  gulp
    .src(`${config.input}/${config.styles}/*.scss`)
    .pipe(sassGlob())
    .pipe(sass().on("error", sass.logError))
    .pipe(gulp.dest(`${config.output.prod}/${config.styles}`))
    .pipe(browserSync.stream());
  cb();
}

/**
 * Compiles all the HTML files in the src directory and puts them in the build directory
 * @param cb - A callback function that runs after the task has completed.
 */
function compileHtml(cb) {
  gulp
    .src(`${config.input}/*.html`)
    .pipe(gulp.dest(isDev ? config.output.dev : config.output.prod));
  cb();
}

/**
 * It takes all the JavaScript files in the src/js folder and compiles them into the build/js folder
 */
function compileJs(cb) {
  gulp
    .src(`${config.input}/${config.js}/*.js`)
    .pipe(
      gulp.dest(
        isDev
          ? `${config.output.dev}/${config.js}`
          : `${config.output.prod}/${config.js}`
      )
    );
  cb();
}

/**
 * Copy all images from the src/img directory to the build/img directory
 * @param cb - A callback function that runs after the task has completed.
 */
function copyImages(cb) {
  gulp
    .src(`${config.input}/${config.img}/**/*`)
    .pipe(
      gulp.dest(
        isDev
          ? `${config.output.dev}/${config.img}`
          : `${config.output.prod}/${config.img}`
      )
    );
  cb();
}

/**
 * Watch the files in the src/scss folder and when they change, run the compileScss function
 * @param cb - A callback function that runs after the watch task is complete.
 */
function watchFiles() {
  try {
    gulp.watch(`${config.input}/${config.styles}/**/*.scss`, compileScss);
    gulp.watch(`${config.input}/${config.img}/**/*`, copyImages);
    gulp
      .watch(`${config.input}/${config.js}/**/*`, compileJs)
      .on("change", browserSync.reload);
    gulp
      .watch(`${config.input}/*.html`, compileHtml)
      .on("change", browserSync.reload);
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
    port: config.port,
    server: {
      baseDir: isDev ? config.output.dev : config.output.prod,
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
  fs.removeSync(config.output.dev);
  return gulp.series(
    handleBrowserSync,
    gulp.parallel(compileScss, compileHtml, compileJs, copyImages)
  );
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
  fs.removeSync(config.output.prod);
  return gulp.parallel(compileScss, compileHtml, compileJs, copyImages);
}

gulp.task("dev", dev());
gulp.task("build", build());
