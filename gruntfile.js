module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

clean : {
    all : {
        src : [ "build/**" ]
    }
},

        // COPY DEV CODE INTO BUILD
        copy: {

            main: {
                files: {
                    'build/': ['**','!node_modules/**', '!package.json', '!README.md', '!gruntfile.js' ]
                }

            }
        },


        cssmin : {
          css: {
   				 	src: 'build/css/excel.css',
    				dest: 'build/css/excel.css',

  					},

  					  css1: {
   				 	src: 'build/css/flyout.css',
    				dest: 'build/css/flyout.css',
    				
  					},

  					  					  css2: {
   				 	src: 'build/css/theme.css',
    				dest: 'build/css/theme.css',
    				
  					},

  					  					  					  css3: {
   				 	src: 'build/css/theme-modern.css',
    				dest: 'build/css/theme-modern.css',
    				
  					}


        },



uglify : {
        js: {
            files: {
                'build/js/main.js' : [ 'build/js/main.js' ],
                'build/js/flyout.js' : [ 'build/js/flyout.js' ],
                'build/js/settings.js' : [ 'build/js/settings.js' ]
            }
        }
    },



compress: {
  main: {
    options: {
      archive: 'build/archive.zip',
      mode:'zip'
      
      
    },
    files: [
      {cwd:'build/', src: ['**'], dest: ''}, // includes files in path
    ]
  }
},

rename: {
        moveThis: {
            src: 'build/archive.zip',
            dest: 'build/ExcelGadget.gadget'
        }
    }


    });



   grunt.loadNpmTasks('grunt-contrib-copy');
   grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-rename');
     grunt.registerTask('default', [ 'clean', 'copy', 'cssmin', 'uglify', 'compress', 'rename' ]);
     grunt.registerTask('clear', [ 'clean' ]);
   
};