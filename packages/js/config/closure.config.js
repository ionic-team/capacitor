
// https://developers.google.com/closure/compiler/docs/gettingstarted_app

module.exports = {

  /**
   * pathToJavaExecutable: The absolute path to the java executable
   * Note: if the executable is on the OS's PATH, often times
   * `java` will suffice. Verify by running `java --version`
   */
  pathToJavaExecutable: 'java',
  pathToClosureJar: process.env.IONIC_CLOSURE_JAR,
  optimization: 'ADVANCED_OPTIMIZATIONS',
  languageIn: `ECMASCRIPT6`,
  languageOut: 'ECMASCRIPT5',
  debug: false
};