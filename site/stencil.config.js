exports.config = {
  serviceWorker: false,
  bundles: [
    { components: ['capacitor-site', 'site-header', 'landing-page', 'lazy-iframe', 'site-menu'] },
    { components: ['app-marked', 'document-component', 'doc-snippet', 'plugin-api', 'avc-code-type', 'anchor-link'] },
    { components: ['demos-page'] },
    { components: ['resources-page'] },
    { components: ['pwas-page'] }
  ],
  collections: [{ name: '@stencil/router' }],
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
