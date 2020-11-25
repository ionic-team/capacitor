import { readJSON, pathExists } from '@ionic/utils-fs';
import { dirname, join } from 'path';

import c from './colors';
import type { Config, PackageJson } from './definitions';
import { output, logger, logFatal } from './log';
import { resolveNode } from './util/node';

export type CheckFunction = () => Promise<string | null>;

export async function check(checks: CheckFunction[]): Promise<void> {
  const results = await Promise.all(checks.map(f => f()));
  const errors = results.filter(r => r != null) as string[];
  if (errors.length > 0) {
    throw errors.join('\n');
  }
}

export async function checkWebDir(config: Config): Promise<string | null> {
  const invalidFolders = ['', '.', '..', '../', './'];
  if (invalidFolders.includes(config.app.webDir)) {
    return `"${config.app.webDir}" is not a valid value for webDir`;
  }
  if (!(await pathExists(config.app.webDirAbs))) {
    return (
      `Could not find the web assets directory: ${config.app.webDirAbs}.\n` +
      `Please create it and make sure it has an ${c.strong(
        'index.html',
      )} file. You can change the path of this directory in ${c.strong(
        config.app.extConfigName,
      )} (${c.input(
        'webDir',
      )} option). You may need to compile the web assets for your app (typically ${c.input(
        'npm run build',
      )}).\n` +
      `More info: ${c.strong(
        'https://capacitorjs.com/docs/basics/building-your-app',
      )}`
    );
  }

  if (!(await pathExists(join(config.app.webDirAbs, 'index.html')))) {
    return (
      `The web assets directory (${
        config.app.webDirAbs
      }) must contain an ${c.strong('index.html')} file.\n` +
      `It will be the entry point for the web portion of the Capacitor app.`
    );
  }
  return null;
}

export async function checkPackage(): Promise<string | null> {
  if (!(await pathExists('package.json'))) {
    return (
      `The Capacitor CLI needs to run at the root of an npm package.\n` +
      `Make sure you have a package.json file in the directory where you run the Capacitor CLI.\n` +
      `More info: ${c.strong('https://docs.npmjs.com/cli/init')}`
    );
  }
  return null;
}

export async function checkCapacitorPlatform(
  config: Config,
  platform: string,
): Promise<string | null> {
  const pkg = await getCapacitorPackage(config, platform);

  if (!pkg) {
    return `Could not find the ${c.input(
      platform,
    )} platform. Does it need to be installed?\n`;
  }

  return null;
}

export async function checkAppConfig(config: Config): Promise<string | null> {
  if (!config.app.appId) {
    return (
      `Missing ${c.input('appId')} for new platform.\n` +
      `Please add it in ${config.app.extConfigName} or run ${c.input(
        'npx cap init',
      )}.`
    );
  }
  if (!config.app.appName) {
    return (
      `Missing ${c.input('appName')} for new platform.\n` +
      `Please add it in ${config.app.extConfigName} or run ${c.input(
        'npx cap init',
      )}.`
    );
  }

  const appIdError = await checkAppId(config, config.app.appId);
  if (appIdError) {
    return appIdError;
  }

  const appNameError = await checkAppName(config, config.app.appName);
  if (appNameError) {
    return appNameError;
  }

  return null;
}

export async function checkAppDir(
  config: Config,
  dir: string,
): Promise<string | null> {
  if (!/^\S*$/.test(dir)) {
    return `Your app directory should not contain spaces`;
  }
  return null;
}

export async function checkAppId(
  config: Config,
  id: string,
): Promise<string | null> {
  if (!id) {
    return `Invalid App ID. Must be in Java package form with no dashes (ex: com.example.app)`;
  }
  if (/^[a-z][a-z0-9_]*(\.[a-z0-9_]+)+$/.test(id.toLowerCase())) {
    return null;
  }
  return `Invalid App ID "${id}". Must be in Java package form with no dashes (ex: com.example.app)`;
}

export async function checkAppName(
  config: Config,
  name: string,
): Promise<string | null> {
  // We allow pretty much anything right now, have fun
  if (!name || !name.length) {
    return `Must provide an app name. For example: 'Spacebook'`;
  }
  return null;
}

export async function wait(time: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, time));
}

export async function runPlatformHook(
  platformDir: string,
  hook: string,
): Promise<void> {
  const { spawn } = await import('child_process');
  const pkg = await readJSON(join(platformDir, 'package.json'));
  const cmd = pkg.scripts[hook];

  if (!cmd) {
    return;
  }

  return new Promise((resolve, reject) => {
    const p = spawn(cmd, {
      stdio: 'inherit',
      shell: true,
      cwd: platformDir,
      env: {
        INIT_CWD: platformDir,
        ...process.env,
      },
    });
    p.on('close', () => {
      resolve();
    });
    p.on('error', err => {
      reject(err);
    });
  });
}

export interface RunTaskOptions {
  spinner?: boolean;
}

export async function runTask<T>(
  title: string,
  fn: () => Promise<T>,
): Promise<T> {
  const chain = output.createTaskChain();
  chain.next(title);

  try {
    const value = await fn();
    chain.end();
    return value;
  } catch (e) {
    chain.fail();
    throw e;
  }
}

export async function getCapacitorPackage(
  config: Config,
  name: string,
): Promise<PackageJson | null> {
  const packagePath = resolveNode(
    config.app.rootDir,
    `@capacitor/${name}`,
    'package.json',
  );

  if (!packagePath) {
    return null;
  }

  return readJSON(packagePath);
}

export async function requireCapacitorPackage(
  config: Config,
  name: string,
): Promise<PackageJson> {
  const pkg = await getCapacitorPackage(config, name);

  if (!pkg) {
    logFatal(
      `Unable to find node_modules/@capacitor/${name}.\n` +
        `Are you sure ${c.strong(`@capacitor/${name}`)} is installed?`,
    );
  }
  return pkg;
}

export async function getCapacitorPackageVersion(
  config: Config,
  platform: string,
): Promise<string> {
  return (await requireCapacitorPackage(config, platform)).version;
}

export async function getCoreVersion(config: Config): Promise<string> {
  return getCapacitorPackageVersion(config, 'core');
}

export async function getCLIVersion(config: Config): Promise<string> {
  return getCapacitorPackageVersion(config, 'cli');
}

function getPlatformDirectory(config: Config, platform: string): string | null {
  switch (platform) {
    case 'android':
      return config.android.platformDirAbs;
    case 'ios':
      return config.ios.platformDirAbs;
    case 'web':
      return config.web.platformDirAbs;
  }

  return null;
}

export async function getProjectPlatformDirectory(
  config: Config,
  platform: string,
): Promise<string | null> {
  const platformPath = getPlatformDirectory(config, platform);

  if (platformPath && (await pathExists(platformPath))) {
    return platformPath;
  }

  return null;
}

export async function selectPlatforms(
  config: Config,
  selectedPlatformName?: string,
): Promise<string[]> {
  if (selectedPlatformName) {
    // already passed in a platform name
    const platformName = selectedPlatformName.toLowerCase().trim();

    if (!(await isValidPlatform(platformName))) {
      logFatal(`Invalid platform: ${c.input(platformName)}`);
    } else if (!(await getProjectPlatformDirectory(config, platformName))) {
      if (platformName === 'web') {
        logFatal(
          `Could not find the web platform directory.\n` +
            `Make sure ${c.strong(config.app.webDir)} exists.`,
        );
      }
      logFatal(
        `${c.strong(platformName)} platform has not been added yet.\n` +
          `Use ${c.input(
            `npx cap add ${platformName}`,
          )} to add the platform to your project.`,
      );
    }

    // return the platform in an string array
    return [platformName];
  }

  // wasn't given a platform name, so let's
  // get the platforms that have already been created
  return getAddedPlatforms(config);
}

export async function getKnownPlatforms(): Promise<string[]> {
  return ['web', 'android', 'ios'];
}

export async function isValidPlatform(platform: string): Promise<boolean> {
  return (await getKnownPlatforms()).includes(platform);
}

export async function getKnownCommunityPlatforms(): Promise<string[]> {
  return ['electron'];
}

export async function isValidCommunityPlatform(
  platform: string,
): Promise<boolean> {
  return (await getKnownCommunityPlatforms()).includes(platform);
}

export async function promptForPlatform(
  platforms: string[],
  promptMessage: string,
  selectedPlatformName?: string,
): Promise<string> {
  const { prompt } = await import('prompts');

  if (!selectedPlatformName) {
    const answers = await prompt(
      [
        {
          type: 'select',
          name: 'mode',
          message: promptMessage,
          choices: platforms.map(p => ({ title: p, value: p })),
        },
      ],
      { onCancel: () => process.exit(1) },
    );

    return answers.mode.toLowerCase().trim();
  }

  const platformName = selectedPlatformName.toLowerCase().trim();

  if (!(await isValidPlatform(platformName))) {
    const knownPlatforms = await getKnownPlatforms();

    logFatal(
      `Invalid platform: ${c.input(platformName)}.\n` +
        `Valid platforms include: ${knownPlatforms.join(', ')}`,
    );
  }

  return platformName;
}

export interface PlatformTarget {
  id: string;
  platform: string;
  virtual: boolean;
  sdkVersion: string;
  name?: string;
  model?: string;
}

export async function promptForPlatformTarget(
  targets: PlatformTarget[],
  selectedTarget?: string,
): Promise<PlatformTarget> {
  const { prompt } = await import('prompts');

  if (!selectedTarget) {
    if (targets.length === 1) {
      return targets[0];
    } else {
      const answers = await prompt(
        [
          {
            type: 'select',
            name: 'target',
            message: 'Please choose a target device:',
            choices: targets.map(t => ({
              title: `${getPlatformTargetName(t)} (${t.id})`,
              value: t,
            })),
          },
        ],
        { onCancel: () => process.exit(1) },
      );

      return answers.target;
    }
  }

  const targetID = selectedTarget.trim();
  const target = targets.find(t => t.id === targetID);

  if (!target) {
    logFatal(
      `Invalid target ID: ${c.input(targetID)}.\n` +
        `Valid targets are: ${targets.map(t => t.id).join(', ')}`,
    );
  }

  return target;
}

export function getPlatformTargetName(target: PlatformTarget): string {
  return `${target.name ?? target.model ?? target.id ?? '?'}${
    target.virtual
      ? ` (${target.platform === 'ios' ? 'simulator' : 'emulator'})`
      : ''
  }`;
}

export async function getAddedPlatforms(config: Config): Promise<string[]> {
  const platforms: string[] = [];

  if (await getProjectPlatformDirectory(config, config.android.name)) {
    platforms.push(config.android.name);
  }

  if (await getProjectPlatformDirectory(config, config.ios.name)) {
    platforms.push(config.ios.name);
  }

  platforms.push(config.web.name);

  return platforms;
}

export async function checkPlatformVersions(
  config: Config,
  platform: string,
): Promise<void> {
  const semver = await import('semver');
  const coreVersion = await getCoreVersion(config);
  const platformVersion = await getCapacitorPackageVersion(config, platform);

  if (
    semver.diff(coreVersion, platformVersion) === 'minor' ||
    semver.diff(coreVersion, platformVersion) === 'major'
  ) {
    logger.warn(
      `${c.strong('@capacitor/core')}${c.weak(
        `@${coreVersion}`,
      )} version doesn't match ${c.strong(`@capacitor/${platform}`)}${c.weak(
        `@${platformVersion}`,
      )} version.\n` +
        `Consider updating to a matching version, e.g. w/ ${c.input(
          `npm install @capacitor/core@${platformVersion}`,
        )}`,
    );
  }
}

export function resolvePlatform(
  config: Config,
  platform: string,
): string | null {
  if (platform[0] !== '@') {
    const core = resolveNode(
      config.app.rootDir,
      `@capacitor/${platform}`,
      'package.json',
    );

    if (core) {
      return dirname(core);
    }

    const community = resolveNode(
      config.app.rootDir,
      `@capacitor-community/${platform}`,
      'package.json',
    );

    if (community) {
      return dirname(community);
    }
  }

  // third-party
  const thirdParty = resolveNode(config.app.rootDir, platform, 'package.json');

  if (thirdParty) {
    return dirname(thirdParty);
  }

  return null;
}
