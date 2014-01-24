module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		concat: {
			js : {
				src : [ 'js/*' ],
				dest : 'out/classic.js'
			}
		},
		uglify : {
			js: {
				files: {
					'out/classic.min.js' : [ 'out/classic.js' ]
				}
			}
    	}
	});
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.registerTask('default', [ 'concat:js', 'uglify:js' ]);
};
