import { mkdirSync, mkdtempSync, symlinkSync, writeFileSync } from 'fs';
import { remove } from 'fs-extra';
import { tmpdir } from 'os';
import { dirname, join } from 'path';

import { run } from './util';

const APP_ID = 'com.example.app';
const appDirs: string[] = [];

function makeApp(packageType: 'module' | 'commonjs', configFile: string, configContents: string): string {
  const dir = mkdtempSync(join(tmpdir(), 'cap-config-'));
  appDirs.push(dir);
  writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'app', type: packageType }));
  writeFileSync(join(dir, configFile), configContents);
  // the CLI needs TypeScript installed in the app to load a .ts config
  mkdirSync(join(dir, 'node_modules'));
  symlinkSync(dirname(require.resolve('typescript/package.json')), join(dir, 'node_modules', 'typescript'));
  return dir;
}

async function loadAppId(dir: string): Promise<string> {
  const config = JSON.parse(await run(dir, 'config --json'));
  return config.app.appId;
}

describe('loading capacitor.config by package type', () => {
  jest.setTimeout(30000);

  afterAll(() => Promise.all(appDirs.map((dir) => remove(dir))));

  describe('"type": "module"', () => {
    it('loads a .ts config that uses import.meta', async () => {
      const dir = makeApp(
        'module',
        'capacitor.config.ts',
        `
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: '${APP_ID}',
  webDir: new URL('www', import.meta.url).pathname,
};

export default config;
`,
      );
      expect(await loadAppId(dir)).toBe(APP_ID);
    });

    it('loads a .ts config with top-level await', async () => {
      const dir = makeApp(
        'module',
        'capacitor.config.ts',
        `
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: await Promise.resolve('${APP_ID}'),
  webDir: 'www',
};

export default config;
`,
      );
      expect(await loadAppId(dir)).toBe(APP_ID);
    });

    it('still loads a .ts config that uses __dirname', async () => {
      const dir = makeApp(
        'module',
        'capacitor.config.ts',
        `
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: '${APP_ID}',
  webDir: __dirname + '/www',
};

export default config;
`,
      );
      expect(await loadAppId(dir)).toBe(APP_ID);
    });

    it('loads the default export of a .js config', async () => {
      const dir = makeApp(
        'module',
        'capacitor.config.js',
        `
export default {
  appId: '${APP_ID}',
  webDir: 'www',
};
`,
      );
      expect(await loadAppId(dir)).toBe(APP_ID);
    });

    it('loads a .js config with top-level await', async () => {
      const dir = makeApp(
        'module',
        'capacitor.config.js',
        `
export default {
  appId: await Promise.resolve('${APP_ID}'),
  webDir: 'www',
};
`,
      );
      expect(await loadAppId(dir)).toBe(APP_ID);
    });
  });

  describe('CommonJS', () => {
    it('loads a .ts config that uses __dirname', async () => {
      const dir = makeApp(
        'commonjs',
        'capacitor.config.ts',
        `
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: '${APP_ID}',
  webDir: __dirname + '/www',
};

export default config;
`,
      );
      expect(await loadAppId(dir)).toBe(APP_ID);
    });

    it('loads a .js config', async () => {
      const dir = makeApp(
        'commonjs',
        'capacitor.config.js',
        `
module.exports = {
  appId: '${APP_ID}',
  webDir: 'www',
};
`,
      );
      expect(await loadAppId(dir)).toBe(APP_ID);
    });
  });
});
