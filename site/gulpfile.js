var gulp = require('gulp');
var markdown = require('gulp-markdown');
var hljs = require('highlight.js');
var rename = require('gulp-rename');
gulp.task('default', function() {
  return gulp
    .src('./docs-md/**/*.md')
    .pipe(
      markdown({
        highlight: function(code, lang) {
          if (!lang) {
            return code;
          }
          return hljs.highlight(lang, code).value;
        }
      })
    )
    .pipe(rename(function(path) {
      path.extname = '.html';
    }))
    .pipe(gulp.dest('./src/assets/docs-content'));
});
