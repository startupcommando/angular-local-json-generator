'use strict';
module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
 
        clean: ['dist/*'],

        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            all: ['Gruntfile.js','src/**/*.js', 'test/**/*.js']
        },

        uglify: {
            myTarget: {
                files: {
                    'dist/json-generator.min.js': ['src/json-generator.js']
                }
            }
        },

        karma: {  
            unit: {
                options: {
                    frameworks: ['jasmine'],
                    singleRun: true,
                    browsers: ['PhantomJS'],
                    files: [
                        'node_modules/jasmine-expect/dist/jasmine-matchers.js',
                        'bower_components/angular/angular.js',
                        'bower_components/angular-mocks/angular-mocks.js',
                        'bower_components/lodash/lodash.js',
                        'bower_components/moment/moment.js',
                        'src/**/*.js',
                        'test/**/*.js'
                    ]
                }
            }
        }
    });
 
    // load the tasks
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.registerTask('build', [
        'jshint',
        'karma',
        'clean',
        'uglify'
    ]);

    grunt.registerTask('default', ['build']);
};