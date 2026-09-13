import { buildAndroid } from '../src/android/build';
import type { AndroidConfig, Config } from '../src/definitions';
import type { BuildCommandOptions } from '../src/tasks/build';
import { runCommand } from '../src/util/subprocess';

jest.mock('../src/util/subprocess', () => ({
  runCommand: jest.fn(),
}));

const mockedRunCommand = runCommand as jest.MockedFunction<typeof runCommand>;

function makeConfig(android: Partial<AndroidConfig>): Config {
  return { android } as unknown as Config;
}

const config = makeConfig({
  platformDirAbs: '/tmp/app/android',
  appDirAbs: '/tmp/app/android/app',
});

const signingOptions: BuildCommandOptions = {
  keystorepath: '/tmp/release.keystore',
  keystorepass: 'store-password',
  keystorealias: 'release',
  keystorealiaspass: 'key-password',
  configuration: 'Release',
};

describe('buildAndroid', () => {
  beforeEach(() => {
    mockedRunCommand.mockReset();
  });

  it('rejects apksigner for AAB before running external commands', async () => {
    await expect(
      buildAndroid(config, {
        ...signingOptions,
        signingtype: 'apksigner',
      }),
    ).rejects.toBe(
      'apksigner cannot sign Android App Bundles. Use jarsigner by setting android.buildOptions.signingType to "jarsigner" or passing "--signing-type jarsigner". Alternatively, build an APK by setting android.buildOptions.releaseType to "APK" or passing "--androidreleasetype APK".',
    );
    expect(mockedRunCommand).not.toHaveBeenCalled();
  });

  it.each<{
    name: string;
    options: Partial<BuildCommandOptions>;
    gradleTask: string;
    signingTool: 'apksigner' | 'jarsigner';
    unsignedArtifact: string;
    signedArtifact: string;
  }>([
    {
      name: 'uses jarsigner for the default AAB build',
      options: {},
      gradleTask: ':app:bundleRelease',
      signingTool: 'jarsigner',
      unsignedArtifact: '/tmp/app/android/app/build/outputs/bundle/release/app-release.aab',
      signedArtifact: '/tmp/app/android/app/build/outputs/bundle/release/app-release-signed.aab',
    },
    {
      name: 'uses jarsigner for an explicit AAB build',
      options: { androidreleasetype: 'AAB', signingtype: 'jarsigner' },
      gradleTask: ':app:bundleRelease',
      signingTool: 'jarsigner',
      unsignedArtifact: '/tmp/app/android/app/build/outputs/bundle/release/app-release.aab',
      signedArtifact: '/tmp/app/android/app/build/outputs/bundle/release/app-release-signed.aab',
    },
    {
      name: 'uses apksigner for an APK build when requested',
      options: { androidreleasetype: 'APK', signingtype: 'apksigner' },
      gradleTask: 'assembleRelease',
      signingTool: 'apksigner',
      unsignedArtifact: '/tmp/app/android/app/build/outputs/apk/release/app-release-unsigned.apk',
      signedArtifact: '/tmp/app/android/app/build/outputs/apk/release/app-release-signed.apk',
    },
    {
      name: 'uses jarsigner for an APK build when requested',
      options: { androidreleasetype: 'APK', signingtype: 'jarsigner' },
      gradleTask: 'assembleRelease',
      signingTool: 'jarsigner',
      unsignedArtifact: '/tmp/app/android/app/build/outputs/apk/release/app-release-unsigned.apk',
      signedArtifact: '/tmp/app/android/app/build/outputs/apk/release/app-release-signed.apk',
    },
  ])('$name', async ({ options, gradleTask, signingTool, unsignedArtifact, signedArtifact }) => {
    await expect(buildAndroid(config, { ...signingOptions, ...options })).resolves.toBeUndefined();

    expect(mockedRunCommand).toHaveBeenCalledTimes(2);
    expect(mockedRunCommand).toHaveBeenNthCalledWith(1, './gradlew', [gradleTask], {
      cwd: '/tmp/app/android',
    });
    expect(mockedRunCommand).toHaveBeenNthCalledWith(
      2,
      signingTool,
      expect.arrayContaining([unsignedArtifact, signedArtifact]),
      { cwd: '/tmp/app/android' },
    );
  });
});
