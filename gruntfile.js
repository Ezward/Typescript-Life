var module = module || {};
module.exports = function (grunt) {
    "use strict";
    
    grunt.initConfig({
        less: {
            compile: {
                files: {'src/css/life.css': 'src/less/life.less'}
            }
        },
        watch: {
            less: {
                files: ['src/less/*.less'],
                tasks: ['less']
            },
            ts: {
                files: ['src/ts/*.ts'],
                tasks: ['ts:compile']
            },
            dart2js: {
                files: ['src/dart/*.dart'],
                tasks: ['dart2js:compile']
            }
        },
        ts: {
            options: {
                target: 'ES5',
                module: 'AMD',
                sourcemap: true
            },
            compile: {
                src: 'src/ts/LifeRunner.ts',
                out: 'src/js/life.ts.js'
            }
        },
        dart2js: {
            //
            // options: assumes dart2js executable is in default location
            //
            options: {
                "dart2js_bin": (process.platform == 'win32') 
                    ? (process.env['USERPROFILE'] + "/dart/dart-sdk/bin/dart2js.bat") 
                    : (process.env['USER'] + "/dart/dart-sdk/bin/dart2js")
            },
            compile: {
                files: {'src/js/life.dart.js': 'src/dart/main.dart'}
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-ts');
    grunt.loadNpmTasks('grunt-dart2js');
    grunt.registerTask('default', ['watch']);
};
