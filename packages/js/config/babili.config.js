
// https://www.npmjs.com/package/babili

module.exports = {
  /**
   * sourceFile: The javascript file to minify
   */
  sourceFile: process.env.IONIC_OUTPUT_JS_FILE_NAME,

  /**
   * destFileName: file name for the minified js in the build dir
   */
  destFileName: process.env.IONIC_OUTPUT_JS_FILE_NAME,
}