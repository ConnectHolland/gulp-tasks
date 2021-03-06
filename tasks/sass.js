'use strict';

module.exports = function(gulp, config) {

    var shelljs = require('shelljs');
    var util = require('gulp-util');
    var scssLint = util.noop;
    // Check if linting is available and not disabled
    var lintConfig = (typeof config.sass.linting === "object") ? config.sass.linting : {};

    if (shelljs.which('scss-lint') !== null && lintConfig.enabled !== false) {
        scssLint = require('gulp-scss-lint');

        // Find the correct config file for the linter
        var configfile = __dirname + '/sass/.scss-lint.yml';
        if (shelljs.test('-f', lintConfig.configfile)) {
            configfile = lintConfig.configfile;
        } else if (shelljs.test('-f', '.scss-lint.yml')) {
            configfile = '.scss-lint.yml';
        }

        util.log(util.colors.green("SCSS linting is enabled:"),"using:", util.colors.bold(configfile));

    } else {
        if (lintConfig.enabled === false) {
            util.log(util.colors.red("SCSS linting is disabled"),"this feature is disabled in the config.json");
        } else {
            util.log(util.colors.red("SCSS linting is disabled"),"to enable this feature please install scss_lint '", util.colors.green("gem install scss_lint"), "'");
        }
    }

    return function() {
        /* define required plugins */
        var sourcemaps = require('gulp-sourcemaps');
        var sass = require('gulp-sass');
        var plumber = require('gulp-plumber');
        var autoprefixer = require('gulp-autoprefixer');
        var gulpIf = require('gulp-if');
        var moreCss = require('gulp-more-css');

        /* function to run on execution */
        return gulp.src(config.sass.src)
            .pipe(plumber({
                errorHandler: function (err) {
                    util.log(util.colors.red('Sass has encountered an error'));
                    util.log(err.messageFormatted);
                    this.emit('end');
                }
            }))
            .pipe(
                scssLint({
                    'config': configfile
                })
            )
            .pipe(sourcemaps.init())
            .pipe(sass({
                    includePaths : config.sass.includePaths
            }))
            .pipe(autoprefixer({
                browsers: config.sass.autoprefix,
                cascade: true,
                remove: true
            }))
            .pipe(
                gulpIf(config.production,
                    moreCss({
                        radical: false
                    }),
                    sourcemaps.write('../maps')
                )
            )
            .pipe(gulp.dest(config.sass.dest));

    };
};
