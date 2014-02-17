var gulp = require('gulp'),
	rename = require('gulp-rename'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify'),
	mocha = require('gulp-mocha');

gulp.task('default', ['build', 'test']);

gulp.task('build', function() {
	
	return gulp.src(['js/*.js'])
		.pipe(concat('classic.js'))
		.pipe(gulp.dest('out'))
		.pipe(rename('classic.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('out'));
	
});

gulp.task('test', function() {
	
	return gulp.src(['test/*.js'])
		.pipe(mocha({ reporter: 'dot' }));
	
});
