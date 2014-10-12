module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON("package.json"),
		bower: {
			install: {
				"angular": "*"
			}
		},
		jshint: {
			all: ["scripts/**/*.js", "text/**/*.js"]
		}
	});

	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-bower-task");

	grunt.registerTask("default", ["bower", "jshint"]);
	grunt.registerTask("build", ["jshint"]);
};
