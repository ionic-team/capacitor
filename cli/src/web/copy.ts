import { logFatal, readJSON, resolveNode, runCommand, runTask } from '../common';
import { Config } from '../config';
import { copy } from 'fs-extra';
import { writeFileAsync } from '../util/fs';
import { join } from 'path';
import { getDependencies } from '../plugin';
import chalk from 'chalk';

const NPM_PRECAPCOPYWEB_SCRIPT = 'precapcopyweb';

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

  const deps = config.app.package ? getDependencies(config) : [];

  await runTask(`Scan for web plugins and run ${NPM_PRECAPCOPYWEB_SCRIPT} npm scripts`, async () => {
    await Promise.all(
      deps.map(async p => {
        const rootPath = resolveNode(config, p);

        if (!rootPath) {
          logFatal(`Unable to find node_modules/${p}. Are you sure ${p} is installed?`);
          return null;
        }

        const packagePath = join(rootPath, 'package.json');
        const meta = await readJSON(packagePath);

        if (meta.scripts && meta.scripts[NPM_PRECAPCOPYWEB_SCRIPT]) {
          await runTask(chalk`  {white {bold ${p}}}: running ${NPM_PRECAPCOPYWEB_SCRIPT} npm script`, async () => {
            await runCommand(`npm explore ${p} -- npm run ${NPM_PRECAPCOPYWEB_SCRIPT}`);
          });
        }
      })
    );
  });

  if (config.app.bundledWebRuntime) {
    runtimePath = resolveNode(config, '@capacitor/core', 'dist', 'capacitor.js');

    if (!runtimePath) {
      logFatal(`Unable to find node_modules/@capacitor/core/dist/capacitor.js. Are you sure`,
        '@capacitor/core is installed? This file is required for Capacitor to function');
      return;
    }

    await runTask(`Copying capacitor.js to web dir`, async () => {
      if (runtimePath)
        await copy(runtimePath, join(config.app.webDirAbs, 'capacitor.js'));
    });
  }

  if (config.app.serviceWorker) {
    serviceWorker = CAPACITOR_SERVICEWORKER_HEADER;

    if (config.app.serviceWorker.combineWorkers) {
      serviceWorker += config.app.serviceWorker.combineWorkers.map(s => `importScripts('${s}');`).join('\n');
    }

    await runTask(`Copying ${config.app.serviceWorker.name} to web dir`, async () => {
      await writeFileAsync(join(config.app.webDirAbs, config.app.serviceWorker.name), serviceWorker);
    });
  }
}
