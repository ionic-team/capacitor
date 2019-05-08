import { Config } from '@stencil/core';
import { sass } from '@stencil/sass';

export const config:Config = {
  plugins: [
    sass()
  ],
  globalStyle: 'src/global/style.scss',
  outputTargets: [
    {
      type: 'www',
      serviceWorker: null
      /*
      serviceWorker: {
        skipWaiting: false,
        clientsClaim: true
      }
      */
    }
  ],
  enableCache: false,
  copy: [
    { src: 'robots.txt' }
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
