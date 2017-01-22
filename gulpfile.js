var gulp = require('gulp');
var RevAll = require('gulp-rev-all');
var imagemin = require('gulp-imagemin');

gulp.task('assetrev', function () {

  return gulp
    .src(['assets/**'])
    .pipe(gulp.dest('content/media'))
    .pipe(RevAll.revision({includeFilesInManifest: ['.css', '.js', '.png', '.jpg', '.dmx', '.webm']}))
    .pipe(gulp.dest('content/media'))
    .pipe(RevAll.manifestFile())
    .pipe(gulp.dest('.'));

});

gulp.task('imagemin', ['imagemin-blog'], function () {

    return gulp.src('assets/images/*.png')
        .pipe(imagemin())
        .pipe(gulp.dest('assets/images'))

});

gulp.task('imagemin-blog', function () {

    return gulp.src('assets/images/blog/**/*.png')
        .pipe(imagemin())
        .pipe(gulp.dest('assets/images/blog'))

});