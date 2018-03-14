const sass = require('@stencil/sass');

exports.config = {
  serviceWorker: false,
  collections: [{ name: '@stencil/router' }],
  plugins: [
    sass()
  ]
  /*
  plugins: [{
    name: 'version-replace',
    transform(sourceText, importee) {
      if (importee.indexOf('.tsx') >= 0) {
        console.log('TRANSFORMING', importee);
        if (sourceText.indexOf('CAPACITOR_VERSION') >= 0) {
          console.log('\t found version!', sourceText);
        }
        const replaced = sourceText.replace('CAPACITOR_VERSION', sourceText);
        return Promise.resolve({
          code: replaced
        });
      }
      return Promise.resolve({
        code: sourceText
      });
    }
  }]
  */
};

exports.devServer = {
  root: 'www',
  watchGlob: '**/**'
};
