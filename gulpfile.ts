import { src, dest, series, parallel } from 'gulp';
import * as ts from 'gulp-typescript';
const eslint = require('gulp-eslint');

export function tsc() {
  return src('ts/**/*')
    .pipe(ts.createProject('tsconfig.json')())
    .pipe(dest('dist/js'));
}

export function cp() {
  return src('src/**/*.*')
    .pipe(dest('dist'));
}

export function lint() {
  return src('ts/**/*')
    .pipe(eslint())
    .pipe(eslint.failAfterError());
}

export const build = parallel(cp, tsc);

export default build;
