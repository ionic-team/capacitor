import type { Config } from '../src/definitions';
import { logger } from '../src/log';
import { runCommand } from '../src/tasks/run';

jest.mock('../src/common', () => ({
  isValidPlatform: jest.fn().mockResolvedValue(true),
  resolvePlatform: jest.fn(),
  runPlatformHook: jest.fn(),
  selectPlatforms: jest.fn().mockResolvedValue(['android']),
  promptForPlatform: jest.fn(),
  getPlatformTargetName: jest.fn(),
}));
jest.mock('../src/cordova', () => ({
  getCordovaPlugins: jest.fn(),
  writeCordovaAndroidManifest: jest.fn(),
}));
jest.mock('../src/android/run', () => ({ runAndroid: jest.fn() }));
jest.mock('../src/ios/run', () => ({ runIOS: jest.fn() }));
jest.mock('../src/tasks/sync', () => ({ sync: jest.fn() }));
jest.mock('../src/util/livereload', () => ({
  CapLiveReloadHelper: {
    editCapConfigForLiveReload: jest.fn(),
    revertCapConfigForLiveReload: jest.fn(),
  },
}));
jest.mock('../src/errors', () => ({
  fatal: jest.fn((message: string) => {
    throw new Error(message);
  }),
  isFatal: jest.fn().mockReturnValue(false),
}));

/* eslint-disable @typescript-eslint/no-require-imports */
const { getCordovaPlugins, writeCordovaAndroidManifest } = require('../src/cordova');
const { runAndroid } = require('../src/android/run');
const { CapLiveReloadHelper } = require('../src/util/livereload');
/* eslint-enable @typescript-eslint/no-require-imports */

const config = {
  android: { name: 'android' },
  ios: { name: 'ios' },
  web: { name: 'web' },
} as unknown as Config;

const PLUGINS = [{ id: 'cordova-plugin-test' }];

describe('cap run: cleartext revert when the run fails', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getCordovaPlugins.mockResolvedValue(PLUGINS);
    writeCordovaAndroidManifest.mockResolvedValue(undefined);
    CapLiveReloadHelper.editCapConfigForLiveReload.mockResolvedValue(undefined);
    CapLiveReloadHelper.revertCapConfigForLiveReload.mockResolvedValue(undefined);
    runAndroid.mockRejectedValue(new Error('no device'));
  });

  it('reverts the cap config and the app cleartext configuration', async () => {
    await expect(runCommand(config, 'android', { url: 'http://localhost:8080' })).rejects.toThrow('no device');

    expect(writeCordovaAndroidManifest).toHaveBeenNthCalledWith(1, PLUGINS, config, 'android', true);
    expect(writeCordovaAndroidManifest).toHaveBeenNthCalledWith(2, PLUGINS, config, 'android', false);
    expect(CapLiveReloadHelper.revertCapConfigForLiveReload).toHaveBeenCalledTimes(1);
  });

  it('does not touch the manifest when live reload is not used', async () => {
    await expect(runCommand(config, 'android', {})).rejects.toThrow('no device');

    expect(writeCordovaAndroidManifest).not.toHaveBeenCalled();
    expect(CapLiveReloadHelper.revertCapConfigForLiveReload).not.toHaveBeenCalled();
  });

  it('does not touch the manifest when the failure happens before it was changed', async () => {
    getCordovaPlugins.mockRejectedValue(new Error('cannot read plugins'));

    await expect(runCommand(config, 'android', { url: 'http://localhost:8080' })).rejects.toThrow(
      'cannot read plugins',
    );

    expect(writeCordovaAndroidManifest).not.toHaveBeenCalled();
    expect(CapLiveReloadHelper.revertCapConfigForLiveReload).toHaveBeenCalledTimes(1);
  });

  it('still reports the original error when the revert itself fails', async () => {
    const warn = jest.spyOn(logger, 'warn').mockImplementation(() => undefined);
    writeCordovaAndroidManifest.mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error('disk error'));

    await expect(runCommand(config, 'android', { url: 'http://localhost:8080' })).rejects.toThrow('no device');

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('disk error'));
    warn.mockRestore();
  });
});
