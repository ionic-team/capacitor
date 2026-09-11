import { mkdirp, pathExists, remove, writeJSON } from 'fs-extra';
import { join } from 'path';
import tmp from 'tmp';

import { runHooks } from '../src/common';
import type { Config } from '../src/definitions';
import { getPlugins } from '../src/plugin';

jest.mock('../src/plugin', () => ({
  getPlugins: jest.fn(),
}));

const HOOK = 'capacitor:sync:before';

describe('runHooks', () => {
  let cleanupCallback: () => void;
  let workspaceDir: string;
  let appDir: string;
  let pluginDir: string;
  let config: Config;

  beforeEach(async () => {
    const tmpDir = tmp.dirSync({ unsafeCleanup: true });
    cleanupCallback = tmpDir.removeCallback;
    workspaceDir = tmpDir.name;
    appDir = join(workspaceDir, 'apps', 'mobile');
    pluginDir = join(workspaceDir, 'node_modules', 'test-plugin');

    await mkdirp(appDir);
    await mkdirp(pluginDir);
    await writeJSON(join(workspaceDir, 'nx.json'), {});
    await writeJSON(join(workspaceDir, 'package.json'), {
      scripts: {
        [HOOK]: markerCommand('root-hook-ran'),
      },
    });
    await writeJSON(join(appDir, 'package.json'), {
      scripts: {
        [HOOK]: markerCommand('app-hook-ran'),
      },
    });
    await writeJSON(join(pluginDir, 'package.json'), {
      scripts: {
        [HOOK]: markerCommand('plugin-hook-ran'),
      },
    });

    config = {
      app: {
        rootDir: appDir,
        webDirAbs: join(appDir, 'www'),
        extConfig: {},
      },
    } as Config;

    jest.mocked(getPlugins).mockResolvedValue([
      {
        id: 'test-plugin',
        name: 'test-plugin',
        version: '1.0.0',
        rootPath: pluginDir,
      },
    ]);
  });

  afterEach(() => {
    cleanupCallback();
    jest.resetAllMocks();
  });

  it('runs app and plugin hooks from their own packages in an Nx workspace', async () => {
    await runHooks(config, 'android', appDir, HOOK);

    expect(await pathExists(join(appDir, 'app-hook-ran'))).toBe(true);
    expect(await pathExists(join(pluginDir, 'plugin-hook-ran'))).toBe(true);
    expect(await pathExists(join(appDir, 'root-hook-ran'))).toBe(false);
    expect(await pathExists(join(pluginDir, 'root-hook-ran'))).toBe(false);
  });

  it('falls back to the Nx root hook when the app has no package', async () => {
    await remove(join(appDir, 'package.json'));
    jest.mocked(getPlugins).mockResolvedValue([]);

    await runHooks(config, 'android', appDir, HOOK);

    expect(await pathExists(join(appDir, 'root-hook-ran'))).toBe(true);
  });

  it('does not fall back to the Nx root hook for plugins', async () => {
    await writeJSON(join(pluginDir, 'package.json'), {});

    await runHooks(config, 'android', appDir, HOOK);

    expect(await pathExists(join(appDir, 'app-hook-ran'))).toBe(true);
    expect(await pathExists(join(pluginDir, 'root-hook-ran'))).toBe(false);
  });
});

function markerCommand(marker: string): string {
  return `node -e "require('fs').writeFileSync('${marker}', '')"`;
}
