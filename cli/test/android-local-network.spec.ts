import { mkdirp, readFile, remove, writeFile } from 'fs-extra';
import { join } from 'path';

import { grantAndroidLocalNetworkPermission, setAndroidLocalNetworkDeclaration } from '../src/android/local-network';
import type { Config } from '../src/definitions';
import { runCommand } from '../src/util/subprocess';

import { mktmp } from './util';

jest.mock('../src/util/subprocess', () => ({
  runCommand: jest.fn(),
}));

const MANIFEST = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <application
        android:allowBackup="true"
        android:label="@string/app_name">
    </application>

    <uses-permission android:name="android.permission.INTERNET" />
</manifest>
`;

const PERMISSION = 'android.permission.ACCESS_LOCAL_NETWORK';

describe('setAndroidLocalNetworkDeclaration', () => {
  let tmp: Awaited<ReturnType<typeof mktmp>>;
  let config: Config;
  let manifestPath: string;

  beforeEach(async () => {
    tmp = await mktmp();
    const srcMainDirAbs = join(tmp.path, 'android', 'app', 'src', 'main');
    manifestPath = join(srcMainDirAbs, 'AndroidManifest.xml');
    await mkdirp(srcMainDirAbs);
    await writeFile(manifestPath, MANIFEST);
    config = { android: { srcMainDirAbs } } as unknown as Config;
  });

  afterEach(() => remove(tmp.path));

  it('declares the permission with a marker and reverts to the exact original manifest', async () => {
    expect(await setAndroidLocalNetworkDeclaration(config, true)).toBe(true);

    const declared = await readFile(manifestPath, 'utf-8');
    expect(declared).toContain('<!-- capacitor:local-network -->');
    expect(declared).toContain(`<uses-permission android:name="${PERMISSION}" />`);
    expect(declared.indexOf(PERMISSION)).toBeLessThan(declared.indexOf('</manifest>'));

    expect(await setAndroidLocalNetworkDeclaration(config, false)).toBe(true);
    expect(await readFile(manifestPath, 'utf-8')).toBe(MANIFEST);
  });

  it('leaves a declaration the app already has, and never removes it', async () => {
    const own = MANIFEST.replace('</manifest>', `    <uses-permission android:name="${PERMISSION}" />\n</manifest>`);
    await writeFile(manifestPath, own);

    expect(await setAndroidLocalNetworkDeclaration(config, true)).toBe(false);
    expect(await readFile(manifestPath, 'utf-8')).toBe(own);

    expect(await setAndroidLocalNetworkDeclaration(config, false)).toBe(false);
    expect(await readFile(manifestPath, 'utf-8')).toBe(own);
  });

  it('does nothing on revert when the CLI added nothing', async () => {
    expect(await setAndroidLocalNetworkDeclaration(config, false)).toBe(false);
    expect(await readFile(manifestPath, 'utf-8')).toBe(MANIFEST);
  });

  it('takes ownership of a declaration left behind by an interrupted build, so the next revert removes it', async () => {
    await setAndroidLocalNetworkDeclaration(config, true);
    const leftover = await readFile(manifestPath, 'utf-8');

    expect(await setAndroidLocalNetworkDeclaration(config, true)).toBe(true);
    expect(await readFile(manifestPath, 'utf-8')).toBe(leftover);

    expect(await setAndroidLocalNetworkDeclaration(config, false)).toBe(true);
    expect(await readFile(manifestPath, 'utf-8')).toBe(MANIFEST);
  });

  it('does nothing when the manifest does not exist', async () => {
    const emptyConfig = { android: { srcMainDirAbs: join(tmp.path, 'nope') } } as unknown as Config;

    expect(await setAndroidLocalNetworkDeclaration(emptyConfig, true)).toBe(false);
    expect(await setAndroidLocalNetworkDeclaration(emptyConfig, false)).toBe(false);
  });
});

describe('grantAndroidLocalNetworkPermission', () => {
  const config = { app: { appId: 'com.example.app' } } as unknown as Config;
  const run = runCommand as jest.Mock;

  const commandsRun = (): string[] => run.mock.calls.map(([, args]) => (args as string[]).join(' '));

  beforeEach(() => {
    run.mockReset();
  });

  it('grants the permission and relaunches the app on Android 17', async () => {
    run.mockImplementation(async (_cmd: string, args: string[]) => (args.includes('getprop') ? '37\n' : ''));

    await grantAndroidLocalNetworkPermission(config, 'device-1');

    expect(commandsRun()).toEqual([
      '-s device-1 shell getprop ro.build.version.sdk',
      `-s device-1 shell pm grant com.example.app ${PERMISSION}`,
      '-s device-1 shell am force-stop com.example.app',
      '-s device-1 shell monkey -p com.example.app -c android.intent.category.LAUNCHER 1',
    ]);
  });

  it('does nothing below Android 17', async () => {
    run.mockImplementation(async () => '31\n');

    await grantAndroidLocalNetworkPermission(config, 'device-1');

    expect(commandsRun()).toEqual(['-s device-1 shell getprop ro.build.version.sdk']);
  });

  it('warns instead of failing when adb fails', async () => {
    run.mockRejectedValue('adb: device offline');

    await expect(grantAndroidLocalNetworkPermission(config, 'device-1')).resolves.toBeUndefined();
  });
});
