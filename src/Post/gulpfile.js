var gulp = require('gulp');

var libs = './wwwroot/libs/';

gulp.task('restore:core-js', function() {
    gulp.src([
        'node_modules/core-js/**/*.js'
    ]).pipe(gulp.dest(libs + 'core-js'));
});

gulp.task('restore:zone.js', function () {
    gulp.src([
        'node_modules/zone.js/**/*.js'
    ]).pipe(gulp.dest(libs + 'zone.js'));
});

gulp.task('restore:systemjs', function () {
    gulp.src([
        'node_modules/systemjs/**/*.js'
    ]).pipe(gulp.dest(libs + 'systemjs'));
});

gulp.task('restore:rxjs', function () {
    gulp.src([
        'node_modules/rxjs/**/*.js'
    ]).pipe(gulp.dest(libs + 'rxjs'));
});

gulp.task('restore:angular-in-memory-web-api', function () {
    gulp.src([
        'node_modules/angular-in-memory-web-api/**/*.js'
    ]).pipe(gulp.dest(libs + 'angular-in-memory-web-api'));
});

gulp.task('restore:angular', function () {
    gulp.src([
        'node_modules/@angular/**/*.js'
    ]).pipe(gulp.dest(libs + '@angular'));
});

gulp.task('restore:bootstrap', function () {
    gulp.src([
        'node_modules/bootstrap/dist/**/*.*'
    ]).pipe(gulp.dest(libs + 'bootstrap'));
});

gulp.task('restore', [
    'restore:core-js',
    'restore:zone.js',
    'restore:systemjs',
    'restore:rxjs',
    'restore:angular-in-memory-web-api',
    'restore:angular',
    'restore:bootstrap'
]);
