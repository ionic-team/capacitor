import { join } from 'path';

import type { Config } from '../src/definitions';
import { buildCommand } from '../src/tasks/build';
import type { BuildCommandOptions } from '../src/tasks/build';
import { runCommand } from '../src/util/subprocess';

jest.mock('../src/common', () => ({
  selectPlatforms: jest.fn().mockResolvedValue(['android']),
  runTask: jest.fn((_title, task) => task()),
}));
jest.mock('../src/log', () => ({ logSuccess: jest.fn() }));
jest.mock('../src/util/subprocess', () => ({ runCommand: jest.fn().mockResolvedValue('') }));

describe('Android build signing defaults', () => {
  beforeEach(() => jest.clearAllMocks());

  it.each([
    ['default bundle', {}, {}, 'AAB', 'jarsigner'],
    ['CLI APK', { androidreleasetype: 'APK' }, {}, 'APK', 'apksigner'],
    ['configured APK', {}, { releaseType: 'APK' }, 'APK', 'apksigner'],
    ['CLI AAB overrides configured APK', { androidreleasetype: 'AAB' }, { releaseType: 'APK' }, 'AAB', 'jarsigner'],
    ['CLI APK overrides configured AAB', { androidreleasetype: 'APK' }, { releaseType: 'AAB' }, 'APK', 'apksigner'],
    ['explicit CLI jarsigner', { androidreleasetype: 'APK', signingtype: 'jarsigner' }, {}, 'APK', 'jarsigner'],
    ['configured jarsigner', {}, { releaseType: 'APK', signingType: 'jarsigner' }, 'APK', 'jarsigner'],
    [
      'CLI signer overrides configured signer',
      { signingtype: 'apksigner' },
      { releaseType: 'APK', signingType: 'jarsigner' },
      'APK',
      'apksigner',
    ],
  ] as const)('%s', async (_name, cliOptions, configuredOptions, releaseType, signer) => {
    const config = {
      android: {
        name: 'android',
        platformDirAbs: '/test/android',
        appDirAbs: '/test/android/app',
        buildOptions: {
          keystorePath: 'test.jks',
          keystorePassword: 'test-password',
          keystoreAlias: 'test',
          keystoreAliasPassword: 'test-password',
          ...configuredOptions,
        },
      },
      ios: { name: 'ios', buildOptions: {} },
    } as Config;

    await buildCommand(config, 'android', { configuration: 'Release', ...cliOptions } as BuildCommandOptions);

    expect(runCommand).toHaveBeenCalledTimes(2);
    expect(runCommand).toHaveBeenNthCalledWith(
      1,
      './gradlew',
      [releaseType === 'APK' ? 'assembleRelease' : ':app:bundleRelease'],
      { cwd: '/test/android' },
    );
    expect(runCommand).toHaveBeenNthCalledWith(
      2,
      signer,
      expect.arrayContaining([
        join(
          '/test/android/app/build/outputs',
          releaseType === 'APK' ? 'apk' : 'bundle',
          'release',
          `app-release-signed.${releaseType.toLowerCase()}`,
        ),
      ]),
      { cwd: '/test/android' },
    );
  });
});
