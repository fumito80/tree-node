"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const gulp_1 = require("gulp");
const ts = __importStar(require("gulp-typescript"));
const eslint = require('gulp-eslint');
function tsc() {
    return gulp_1.src('ts/**/*')
        .pipe(ts.createProject('tsconfig.json')())
        .pipe(gulp_1.dest('dist/js'));
}
exports.tsc = tsc;
function cp() {
    return gulp_1.src('src/**/*.*')
        .pipe(gulp_1.dest('dist'));
}
exports.cp = cp;
function lint() {
    return gulp_1.src('ts/**/*')
        .pipe(eslint())
        .pipe(eslint.failAfterError());
}
exports.lint = lint;
exports.build = gulp_1.parallel(cp, tsc);
exports.default = exports.build;
