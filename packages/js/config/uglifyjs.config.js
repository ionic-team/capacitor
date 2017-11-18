
// https://www.npmjs.com/package/uglify-js

module.exports = {

  /**
   * sourceFile: The javascript file to minify
   */
  sourceFile: process.env.IONIC_OUTPUT_JS_FILE_NAME,

  /**
   * destFileName: file name for the minified js in the build dir
   */
  destFileName: process.env.IONIC_OUTPUT_JS_FILE_NAME,

  /**
   * inSourceMap: file name for the input source map
   */
  inSourceMap: process.env.IONIC_OUTPUT_JS_FILE_NAME + '.map',

  /**
   * outSourceMap: file name for the output source map
   */
  outSourceMap: process.env.IONIC_OUTPUT_JS_FILE_NAME + '.map',

  /**
   * mangle: uglify 2's mangle option
   */
  mangle: true,

  /**
   * compress: uglify 2's compress option
   */
  compress: true,

  /**
   * comments: uglify 2's comments option
   */
  comments: true
};