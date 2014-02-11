var gulp = require('gulp'),
	rename = require('gulp-rename'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify');

gulp.task('default', function() {
	
	return gulp.src(['js/*.js'])
		.pipe(concat('classic.js'))
		.pipe(gulp.dest('out'))
		.pipe(rename('classic.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('out'));
	
});
