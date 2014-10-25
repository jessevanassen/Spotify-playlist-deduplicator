module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON("package.json"),
		bower: {
			install: { },
			options: {
				copy: false
			}
		},
		jshint: {
			all: ["scripts/**/*.js", "text/**/*.js"]
		}
	});

	grunt.loadNpmTasks("grunt-bower-task");
	grunt.loadNpmTasks("grunt-contrib-jshint");

	grunt.registerTask("default", ["bower", "jshint"]);
	grunt.registerTask("build", ["jshint"]);
};
