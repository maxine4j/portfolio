const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass');
const uglify = require('gulp-uglify');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const imagemin = require('gulp-imagemin');
const nunjucksRender = require('gulp-nunjucks-render');
const htmlmin = require('gulp-htmlmin');
const data = require('gulp-data');
const fs = require('fs');

const getJsonData = () => {
    return {
        data: {
            projects: JSON.parse(fs.readFileSync('./src/data/projects.json', 'utf8')) // require caches so use fs
        }
    }
}

gulp.task('sass', 
    () => gulp.src('./src/styles/**/*.scss')
        .pipe(sass())
        .pipe(autoprefixer({
            cascade: false
        }))
        .pipe(cleanCSS())
        .pipe(gulp.dest('./build/'))
        .pipe(browserSync.stream())
);

gulp.task('nunjucks', 
    () => gulp.src('./src/**/*.njk')
        .pipe(data(file => getJsonData()))
        .pipe(nunjucksRender({
            path: './src/',
        }))
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true
        }))
        .pipe(gulp.dest('./build/'))
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

// static serve and watch scss/njk
gulp.task('serve', 
    gulp.series(
        'sass', 
        'nunjucks-html-watch', 
        () => {
            browserSync.init({
                server: './build/',
            });

            gulp.watch('./src/styles/**/*.scss', gulp.task('sass'));
            gulp.watch('./src/**/*.njk', gulp.task('nunjucks-html-watch'));
            gulp.watch('./src/data/*.json', gulp.task('nunjucks-html-watch'))
        }
    )
);

gulp.task('compressJs', 
    () => gulp.src('./src/js/**/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('./build/'))
);

gulp.task('compressImage', 
    () => gulp.src('./src/img/**')
        .pipe(imagemin({
            progressive: true,
            optimizationLevel: 3
        }))
        .pipe(gulp.dest('./build/img'))
);

gulp.task('build', gulp.parallel('sass', 'compressImage', 'compressJs', 'nunjucks'));

gulp.task('default', gulp.series('build', 'serve'));
