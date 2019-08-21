import { logFatal, resolveNode, runTask } from '../common';
import { Config } from '../config';
import { copy } from 'fs-extra';
import { writeFileAsync } from '../util/fs';
import { join } from 'path';

const FIREBASE_SERVICEWORKER_TEMPLATE = `
  (function() {
    importScripts('./firebase-app.js');
    importScripts('./firebase-messaging.js');

    firebase.initializeApp({
      messagingSenderId: '[SENDER_ID]'
    });

    const messaging = firebase.messaging();

    self.addEventListener('push', (event) => {
      event.stopImmediatePropagation();
    });
    
    self.addEventListener('pushsubscriptionchange', e => {
      event.stopImmediatePropagation();
    });
  })();
`;

export async function copyWeb(config: Config) {
  let serviceWorker = '';
  let runtimePath: string | null = null;
  let firebasePath: string | null = null;
  let firebaseMessagingPath: string | null = null;

  if (config.app.bundledWebRuntime) {
    runtimePath = resolveNode(config, '@capacitor/core', 'dist', 'capacitor.js');

    if (!runtimePath) {
      logFatal(`Unable to find node_modules/@capacitor/core/dist/capacitor.js. Are you sure`,
        '@capacitor/core is installed? This file is required for Capacitor to function');
      return;
    }
  }

  if (config.app.serviceWorker) {
    const firebaseConfigKeys = Object.keys(config.app.serviceWorker.firebaseConfig);
    const missingFirebaseValues = firebaseConfigKeys.filter(k => !(config.app.serviceWorker.firebaseConfig as any)[k]);

    if (missingFirebaseValues.length > 0 && missingFirebaseValues.length < firebaseConfigKeys.length) {
      logFatal(`Firebase values missing: ${missingFirebaseValues.join(', ')}. `,
        'Check your capacitor.config.json');
      return;
    }
    else if (missingFirebaseValues.length === 0) {
      serviceWorker += FIREBASE_SERVICEWORKER_TEMPLATE.replace('[SENDER_ID]', config.app.serviceWorker.firebaseConfig.messagingSenderId);

      firebasePath = resolveNode(config, 'firebase', 'firebase-app.js');
      firebaseMessagingPath = resolveNode(config, 'firebase', 'firebase-messaging.js');

      if (!firebasePath || !firebaseMessagingPath) {
        logFatal(`Unable to find node_modules/firebase/firebase-app.js. Are you sure`,
          'firebase is installed? (Run "npm i firebase" if you want firebase for PWA)');
      }
    }
      
    if (config.app.serviceWorker.combineOtherWorker)
      serviceWorker += `importScripts('${config.app.serviceWorker.combineOtherWorker}');`;
  }

  return runTask(`Copying capacitor.js and service workers to web dir`, async () => {
    if (serviceWorker) {
      await writeFileAsync(join(config.app.webDirAbs, config.app.serviceWorker.name), serviceWorker);

      if (firebasePath)
        await copy(firebasePath, join(config.app.webDirAbs, 'firebase-app.js'));

      if (firebaseMessagingPath)
        await copy(firebaseMessagingPath, join(config.app.webDirAbs, 'firebase-messaging.js'));
    }

    if (config.app.bundledWebRuntime && runtimePath)
      await copy(runtimePath, join(config.app.webDirAbs, 'capacitor.js'));
  });
}
