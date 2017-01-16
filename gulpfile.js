var gulp = require('gulp');
var RevAll = require('gulp-rev-all');

gulp.task('asset-rev', function () {

  return gulp
    .src(['assets/**'])
    .pipe(gulp.dest('content/media'))
    .pipe(RevAll.revision({includeFilesInManifest: ['.css', '.js', '.png', '.jpg', '.dmx', '.webm']}))
    .pipe(gulp.dest('content/media'))
    .pipe(RevAll.manifestFile())
    .pipe(gulp.dest('.'));

});