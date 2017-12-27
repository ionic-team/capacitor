exports.config = {
  publicPath: 'build',
  bundles: [
    { components: ['avocado-site', 'site-header', 'landing-page', 'lazy-iframe', 'site-menu'] },
    { components: ['app-marked', 'document-component'] },
    { components: ['demos-page'] },
    { components: ['resources-page'] },
    { components: ['pwas-page'] }
  ],
  collections: [{ name: '@stencil/router' }]
};

exports.devServer = {
  root: 'www',
  watchGlob: '**/**'
};
