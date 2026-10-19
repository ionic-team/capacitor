import { Command, Option } from 'commander';
import { pathExists } from 'fs-extra';

import type { Config, IOSConfig } from '../src/definitions';
import { getIOSPackageManager, getTelemetryArguments, getTelemetryError, getTelemetryOptions } from '../src/telemetry';

jest.mock('fs-extra', () => ({
  pathExists: jest.fn(),
}));

const mockedPathExists = pathExists as unknown as jest.Mock;

function makeConfig(ios: Partial<IOSConfig>): Config {
  return { ios } as unknown as Config;
}

describe('getIOSPackageManager', () => {
  beforeEach(() => {
    mockedPathExists.mockReset();
  });

  it('returns "unknown" when the iOS platform directory does not exist', async () => {
    mockedPathExists.mockResolvedValueOnce(false);

    const result = await getIOSPackageManager(
      makeConfig({
        platformDirAbs: '/tmp/no-such-dir/ios',
        packageManager: Promise.resolve('SPM'),
      }),
    );

    expect(result).toBe('unknown');
    expect(mockedPathExists).toHaveBeenCalledWith('/tmp/no-such-dir/ios');
  });

  it('returns the resolved package manager when iOS is present', async () => {
    mockedPathExists.mockResolvedValueOnce(true);

    const result = await getIOSPackageManager(
      makeConfig({
        platformDirAbs: '/tmp/app/ios',
        packageManager: Promise.resolve('SPM'),
      }),
    );

    expect(result).toBe('SPM');
  });

  it('returns "unknown" when packageManager resolution throws', async () => {
    mockedPathExists.mockResolvedValueOnce(true);

    const result = await getIOSPackageManager(
      makeConfig({
        platformDirAbs: '/tmp/app/ios',
        packageManager: Promise.reject(new Error('boom')),
      }),
    );

    expect(result).toBe('unknown');
  });
});

const KEYSTORE_PASS = 'SuperSecret123';
const KEYSTORE_ALIAS_PASS = 'AliasSecret456';
const KEYSTORE_PATH = '/Users/me/release.keystore';
const XCODE_TEAM_ID = 'ABCDE12345';
const PROVISIONING_PROFILE = 'Acme Internal';

function captureCommand(configure: (program: Command) => Command, argv: string[]): Command {
  let captured: Command | undefined;

  const program = new Command();
  program.exitOverride();
  configure(program).action((...actionArgs: any[]) => {
    captured = actionArgs[actionArgs.length - 1];
  });

  program.parse(argv, { from: 'user' });

  if (!captured) {
    throw new Error('command action did not run');
  }

  return captured;
}

function captureBuild(argv: string[]): Command {
  return captureCommand(
    (program) =>
      program
        .command('build <platform>')
        .option('--keystorepath <keystorePath>', 'Path to the keystore')
        .option('--keystorepass <keystorePass>', 'Password to the keystore')
        .option('--keystorealias <keystoreAlias>', 'Key Alias in the keystore')
        .option('--keystorealiaspass <keystoreAliasPass>', 'Password for the Key Alias')
        .addOption(new Option('--androidreleasetype <androidreleasetype>').choices(['AAB', 'APK']))
        .addOption(new Option('--signing-type <signingtype>').choices(['apksigner', 'jarsigner']))
        .addOption(new Option('--xcode-team-id <xcodeTeamID>'))
        .addOption(
          new Option('--xcode-export-method <xcodeExportMethod>').choices(['app-store-connect', 'release-testing']),
        )
        .addOption(new Option('--xcode-signing-style <xcodeSigningStyle>').choices(['automatic', 'manual']))
        .addOption(new Option('--xcode-provisioning-profile <xcodeProvisioningProfile>')),
    argv,
  );
}

function captureRun(argv: string[]): Command {
  return captureCommand(
    (program) =>
      program
        .command('run [platform]')
        .option('--list', 'list targets, then quit')
        .option('--target <id>', 'use a specific target')
        .option('--no-sync', 'do not run sync'),
    argv,
  );
}

function captureInit(argv: string[]): Command {
  return captureCommand(
    (program) => program.command('init [appName] [appId]').option('--web-dir <value>', 'Directory of web assets'),
    argv,
  );
}

describe('getTelemetryOptions', () => {
  it('reports no free-form option value in the payload', () => {
    const cmd = captureBuild([
      'build',
      'android',
      '--keystorepath',
      KEYSTORE_PATH,
      '--keystorepass',
      KEYSTORE_PASS,
      '--keystorealias',
      'upload',
      '--keystorealiaspass',
      KEYSTORE_ALIAS_PASS,
      '--xcode-team-id',
      XCODE_TEAM_ID,
    ]);

    const payload = JSON.stringify({
      arguments: getTelemetryArguments(cmd),
      options: JSON.stringify(getTelemetryOptions(cmd)),
    });

    for (const secret of [KEYSTORE_PASS, KEYSTORE_ALIAS_PASS, KEYSTORE_PATH, XCODE_TEAM_ID, 'upload']) {
      expect(payload).not.toContain(secret);
    }
  });

  it('keeps every option name while nulling non-allowlisted values', () => {
    const cmd = captureBuild([
      'build',
      'android',
      '--keystorepath',
      KEYSTORE_PATH,
      '--keystorepass',
      KEYSTORE_PASS,
      '--keystorealiaspass',
      KEYSTORE_ALIAS_PASS,
      '--androidreleasetype',
      'AAB',
      '--signing-type',
      'jarsigner',
    ]);

    expect(getTelemetryOptions(cmd)).toEqual({
      keystorepath: null,
      keystorepass: null,
      keystorealiaspass: null,
      androidreleasetype: 'AAB',
      signingType: 'jarsigner',
    });
  });

  it('keeps allowlisted iOS option values while nulling the rest', () => {
    const cmd = captureBuild([
      'build',
      'ios',
      '--xcode-team-id',
      XCODE_TEAM_ID,
      '--xcode-export-method',
      'release-testing',
      '--xcode-signing-style',
      'manual',
      '--xcode-provisioning-profile',
      PROVISIONING_PROFILE,
    ]);

    expect(getTelemetryOptions(cmd)).toEqual({
      xcodeTeamId: null,
      xcodeExportMethod: 'release-testing',
      xcodeSigningStyle: 'manual',
      xcodeProvisioningProfile: null,
    });
  });

  it('nulls an allowlisted option name carrying a value that is not an allowlisted choice', () => {
    const cmd = captureCommand(
      (program) => program.command('build <platform>').option('--androidreleasetype <androidreleasetype>'),
      ['build', 'android', '--androidreleasetype', KEYSTORE_PATH],
    );

    expect(getTelemetryOptions(cmd)).toEqual({ androidreleasetype: null });
  });

  it('keeps boolean values, including negated options', () => {
    const cmd = captureRun(['run', 'android', '--list', '--no-sync', '--target', 'emulator-5554']);

    expect(getTelemetryOptions(cmd)).toEqual({
      list: true,
      sync: false,
      target: null,
    });
  });
});

describe('getTelemetryError', () => {
  it('reports null when the command succeeded', () => {
    expect(getTelemetryError(captureBuild(['build', 'android']), undefined)).toBeNull();
  });

  it('scrubs redacted option values out of rethrown subprocess output', () => {
    const cmd = captureBuild([
      'build',
      'ios',
      '--xcode-team-id',
      XCODE_TEAM_ID,
      '--xcode-signing-style',
      'manual',
      '--xcode-provisioning-profile',
      PROVISIONING_PROFILE,
    ]);

    const error = getTelemetryError(
      cmd,
      [
        'Build settings from command line:',
        `    DEVELOPMENT_TEAM = ${XCODE_TEAM_ID}`,
        `    PROVISIONING_PROFILE_SPECIFIER = ${PROVISIONING_PROFILE}`,
        '',
        'xcodebuild: error: Unable to find a destination.',
      ].join('\n'),
    );

    expect(error).not.toContain(XCODE_TEAM_ID);
    expect(error).not.toContain(PROVISIONING_PROFILE);
    expect(error).toContain('xcodebuild: error: Unable to find a destination.');
    expect(error).toContain('<redacted>');
  });

  it('scrubs the keystore path and alias a failed signing run echoes back', () => {
    const cmd = captureBuild([
      'build',
      'android',
      '--keystorepath',
      KEYSTORE_PATH,
      '--keystorepass',
      KEYSTORE_PASS,
      '--keystorealias',
      'upload',
    ]);

    const error = getTelemetryError(cmd, `jarsigner: unable to open ${KEYSTORE_PATH} for alias upload`);

    for (const secret of [KEYSTORE_PATH, KEYSTORE_PASS, 'upload']) {
      expect(error).not.toContain(secret);
    }
  });

  it('truncates long output so a failed build cannot ship its whole log', () => {
    const error = getTelemetryError(captureBuild(['build', 'android']), 'x'.repeat(10_000));

    expect(error).toHaveLength(500);
  });

  it('prefers the error message when there is one', () => {
    const cmd = captureBuild(['build', 'android', '--keystorepass', KEYSTORE_PASS]);

    expect(getTelemetryError(cmd, new Error('android platform has not been added'))).toBe(
      'android platform has not been added',
    );
  });
});

describe('getTelemetryArguments', () => {
  it('reports allowlisted platform arguments', () => {
    expect(getTelemetryArguments(captureBuild(['build', 'android']))).toBe('android');
  });

  it('drops user-supplied arguments such as the app name and identifier', () => {
    expect(getTelemetryArguments(captureInit(['init', 'My Secret App', 'com.example.internal']))).toBe('');
  });
});
