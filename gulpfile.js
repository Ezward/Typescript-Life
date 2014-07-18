var gulp = require('gulp');
var tsc = require('gulp-tsc');
var tap = require('gulp-tap');
var watch = require('gulp-watch');

var outFile = "life.js";

gulp.task('compile-typescript', function () {
    return gulp.src(['src/ts/*.ts'])
        .pipe(tap(function(file, t) {
            console.log(file.path);
            gulp.src([file.path])
            .pipe(tsc({ out: file.path.replace('.ts', '.js'), target: "ES5", sourcemap: true, noImplicitAny: true }))        
            .pipe(gulp.dest('.'));
        }));
});

gulp.task('typescript-watch', function () {
    watch({ glob: 'src/ts/*.ts' })
       .pipe(tap(function (file, t) {
           console.log(file.path);
           gulp.src([file.path])
            .pipe(tsc({ out: "src/js/outFile", target: "ES5", sourcemap: true, noImplicitAny: true }))            
           .pipe(gulp.dest('.'));
       }));
});
