
// https://www.npmjs.com/package/clean-css

module.exports = {
  /**
   * sourceFileName: the file name of the src css file
   */
  sourceFileName: process.env.IONIC_OUTPUT_CSS_FILE_NAME,

  /**
   * destFileName: the file name for the generated minified file
   */
  destFileName: process.env.IONIC_OUTPUT_CSS_FILE_NAME

};
