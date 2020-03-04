import { logFatal, resolveNode, runTask } from '../common';
import { Config } from '../config';
import { copy } from 'fs-extra';
import { writeFileAsync } from '../util/fs';
import { join } from 'path';

// When a new version of Capacitor's PWA service worker is seen by the browser, immediately activate it after installation
const CAPACITOR_SERVICEWORKER_HEADER = `
// Timestamp: ${Date.now()}

self.addEventListener('installed', () => {
  self.skipWaiting();
});
`;

export async function copyWeb(config: Config) {
  let serviceWorker = '';
  let runtimePath: string | null = null;

  if (config.app.bundledWebRuntime) {
    runtimePath = resolveNode(config, '@capacitor/core', 'dist', 'capacitor.js');

    if (!runtimePath) {
      logFatal(`Unable to find node_modules/@capacitor/core/dist/capacitor.js. Are you sure`,
        '@capacitor/core is installed? This file is required for Capacitor to function');
      return;
    }
  }

  if (config.app.serviceWorker) {
    serviceWorker = CAPACITOR_SERVICEWORKER_HEADER;
      
    if (config.app.serviceWorker.combineWorkers) {
      serviceWorker += config.app.serviceWorker.combineWorkers.map(s => `importScripts('${s}');`).join('\n');
    }
  }

  return runTask(`Copying capacitor.js and service workers to web dir`, async () => {
    if (serviceWorker) {
      await writeFileAsync(join(config.app.webDirAbs, config.app.serviceWorker.name), serviceWorker);
    }

    if (config.app.bundledWebRuntime && runtimePath)
      await copy(runtimePath, join(config.app.webDirAbs, 'capacitor.js'));
  });
}
