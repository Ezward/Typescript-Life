module.exports = function (grunt) {
    grunt.initConfig({
        less: {
            compile: {
                files: {'src/css/life.css': "src/less/life.less"}
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
            }
        },
        ts: {
            options: {
                target: 'ES5',
                module: 'AMD',
                sourcemap: true
            },
            compile: {
                src: 'src/ts/main.ts',
                out: 'src/js/life.ts.js'
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-ts');
    grunt.registerTask('default', ['watch']);
};
