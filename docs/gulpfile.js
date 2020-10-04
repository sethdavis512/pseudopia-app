const { src, dest, watch, series } = require('gulp');
const minify = require('gulp-clean-css');
const postcss = require('gulp-postcss');
const purge = require('gulp-purgecss');
const rename = require('gulp-rename');
const bytes = require('bytes');
const tailwindcss = require('tailwindcss');
const { reload, init: browserInit } = require('browser-sync').create();

const PATHS = {
    config: 'tailwind.config.js',
    css: 'src/styles.css',
    dist: '.',
    html: './index.html',
    htmlGlob: './*.html'
};

const watchArr = [PATHS.css, PATHS.config, PATHS.htmlGlob];

function compileCSS() {
    return src(PATHS.css)
        .pipe(postcss([tailwindcss(PATHS.config), require('autoprefixer')]))
        .pipe(
            purge({
                content: [PATHS.htmlGlob],
                defaultExtractor: content =>
                  content.match(/[\w-/:]+(?<!:)/g) || []
            })
        )
        .pipe(
            minify({ compatibility: 'ie8', debug: true }, details => {
                console.log(
                    `${details.name}: ${bytes(details.stats.originalSize)}`
                );
                console.log(
                    `${details.name}: ${bytes(details.stats.minifiedSize)}`
                );
            })
        )
        .pipe(rename({ extname: '.min.css' }))
        .pipe(dest(PATHS.dist));
}

function browser() {
    browserInit({
        server: {
            baseDir: PATHS.dist
        }
    });

    watch(watchArr).on('change', series(compileCSS, reload));
}

exports.default = series(compileCSS, browser);
