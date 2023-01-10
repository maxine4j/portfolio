const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass')(require('sass'));
const terser = require('gulp-terser');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const imagemin = require('gulp-imagemin');
const nunjucksRender = require('gulp-nunjucks-render');
const htmlmin = require('gulp-htmlmin');
const data = require('gulp-data');
const getData = require('./dataParser');

gulp.task('compressJs', 
    () => gulp.src('./src/js/**/*.js')
        .pipe(terser())
        .pipe(gulp.dest('./dist/'))
);

gulp.task('compressImage', 
    () => gulp.src('./src/img/**')
        .pipe(imagemin({
            progressive: true,
            optimizationLevel: 3
        }))
        .pipe(gulp.dest('./dist/img'))
);

gulp.task('sass', 
    () => gulp.src('./src/styles/**/*.scss')
        .pipe(sass())
        .pipe(autoprefixer({
            cascade: false
        }))
        .pipe(cleanCSS())
        .pipe(gulp.dest('./dist/'))
        .pipe(browserSync.stream())
);

gulp.task('nunjucks', 
    () => gulp.src('./src/**/*.njk')
        .pipe(data(file => getData()))
        .pipe(nunjucksRender({
            path: './src/',
        }))
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true
        }))
        .pipe(gulp.dest('./dist/'))
);

// ensure we run nunjucks before reloading
gulp.task('nunjucks-html-watch', 
    gulp.series(
        'nunjucks', 
        (done) => {
            browserSync.reload();
            done();
        }
    )
);

// ensure we run compressJs before reloading
gulp.task('js-watch', 
    gulp.series(
        'compressJs', 
        (done) => {
            browserSync.reload();
            done();
        }
    )
);

// ensure we run compressImage before reloading
gulp.task('img-watch', 
    gulp.series(
        'compressImage', 
        (done) => {
            browserSync.reload();
            done();
        }
    )
);
// static serve and watch scss/njk
gulp.task('serve', 
    gulp.series(
        'sass', 
        'nunjucks-html-watch', 
        () => {
            browserSync.init({
                server: './dist/',
            });
            gulp.watch('./src/styles/**/*.scss', gulp.task('sass'));
            gulp.watch('./src/js/**/*.js', gulp.task('js-watch'));
            gulp.watch('./src/**/*.njk', gulp.task('nunjucks-html-watch'));
            gulp.watch('./src/data/**/*.json', gulp.task('nunjucks-html-watch'));
            gulp.watch('./src/img/**/*', gulp.task('img-watch'));
        }
    )
);

gulp.task(
    'copy-favicon', 
    () => gulp.src('./src/favicon.ico')
        .pipe(gulp.dest('./dist/'))
);

gulp.task(
    'copy-content', 
    () => gulp.src('./src/content/**/*')
        .pipe(gulp.dest('./dist/content/'))
);

gulp.task(
    'copy-cname', 
    () => gulp.src('./CNAME')
        .pipe(gulp.dest('./dist/CNAME'))
);

gulp.task('build', gulp.parallel('copy-cname', 'copy-content', 'copy-favicon', 'sass', 'compressImage', 'compressJs', 'nunjucks'));

gulp.task('default', gulp.series('build', 'serve'));
