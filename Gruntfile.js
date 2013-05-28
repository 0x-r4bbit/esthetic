'use strict';

module.exports = function(grunt) {

  grunt.initConfig({

    // Import package manifest
    pkg: grunt.file.readJSON('package.json'),

    // Banner definitions
    meta: {
      banner: '/*\n' +
        ' *  <%= pkg.title || pkg.name %> - v<%= pkg.version %>\n' +
        ' *  <%= pkg.description %>\n' +
        ' *  <%= pkg.homepage %>\n' +
        ' *\n' +
        ' *  Made by <%= pkg.author.name %>\n' +
        ' *  Under <%= pkg.licenses[0].type %> License\n' +
        ' */\n'
    },

    // Concat definitions
    concat: {
      dist: {
        src: ['src/jquery.esthetic.js'],
        dest: 'dist/jquery.esthetic.js'
      },
      options: {
        banner: '<%= meta.banner %>'
      }
    },

    // Lint definitions
    jshint: {
      files: ['src/jquery.esthetic.js'],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    // Minify definitions
    uglify: {
      dist: {
        src: ['dist/jquery.esthetic.js'],
        dest: 'dist/jquery.esthetic.min.js'
      },
      options: {
        banner: '<%= meta.banner %>'
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', ['jshint', 'concat', 'uglify']);

};
