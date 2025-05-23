import { prettyPath } from '@ionic/utils-terminal';
import { readJSON, pathExists } from 'fs-extra';
import { dirname, join } from 'path';

import c from './colors';
import type { Config, PackageJson } from './definitions';
import { fatal } from './errors';
import { output, logger } from './log';
import { getPlugins } from './plugin';
import { findNXMonorepoRoot, isNXMonorepo } from './util/monorepotools';
import { resolveNode } from './util/node';
import { runCommand } from './util/subprocess';

export type CheckFunction = () => Promise<string | null>;

export async function check(checks: CheckFunction[]): Promise<void> {
  const results = await Promise.all(checks.map((f) => f()));
  const errors = results.filter((r) => r != null) as string[];
  if (errors.length > 0) {
    throw errors.join('\n');
  }
}

export async function checkWebDir(config: Config): Promise<string | null> {
  // We can skip checking the web dir if a server URL is set.
  if (config.app.extConfig.server?.url) {
    return null;
  }

  const invalidFolders = ['', '.', '..', '../', './'];
  if (invalidFolders.includes(config.app.webDir)) {
    return `"${config.app.webDir}" is not a valid value for webDir`;
  }
  if (!(await pathExists(config.app.webDirAbs))) {
    return (
      `Could not find the web assets directory: ${c.strong(prettyPath(config.app.webDirAbs))}.\n` +
      `Please create it and make sure it has an ${c.strong(
        'index.html',
      )} file. You can change the path of this directory in ${c.strong(config.app.extConfigName)} (${c.input(
        'webDir',
      )} option). You may need to compile the web assets for your app (typically ${c.input(
        'npm run build',
      )}). More info: ${c.strong('https://capacitorjs.com/docs/basics/workflow#sync-your-project')}`
    );
  }

  if (!(await pathExists(join(config.app.webDirAbs, 'index.html')))) {
    return (
      `The web assets directory (${c.strong(
        prettyPath(config.app.webDirAbs),
      )}) must contain an ${c.strong('index.html')} file.\n` +
      `It will be the entry point for the web portion of the Capacitor app.`
    );
  }
  return null;
}

export async function checkPackage(): Promise<string | null> {
  if (!(await pathExists('package.json'))) {
    if (await pathExists('project.json')) {
      return null;
    } else {
      return (
        `The Capacitor CLI needs to run at the root of an npm package or in a valid NX monorepo.\n` +
        `Make sure you have a package.json or project.json file in the directory where you run the Capacitor CLI.\n` +
        `More info: ${c.strong('https://docs.npmjs.com/cli/init')}`
      );
    }
  }
  return null;
}

export async function checkCapacitorPlatform(config: Config, platform: string): Promise<string | null> {
  const pkg = await getCapacitorPackage(config, platform);

  if (!pkg) {
    return (
      `Could not find the ${c.input(platform)} platform.\n` +
      `You must install it in your project first, e.g. w/ ${c.input(`npm install @capacitor/${platform}`)}`
    );
  }

  return null;
}

export async function checkAppConfig(config: Config): Promise<string | null> {
  if (!config.app.appId) {
    return (
      `Missing ${c.input('appId')} for new platform.\n` +
      `Please add it in ${config.app.extConfigName} or run ${c.input('npx cap init')}.`
    );
  }
  if (!config.app.appName) {
    return (
      `Missing ${c.input('appName')} for new platform.\n` +
      `Please add it in ${config.app.extConfigName} or run ${c.input('npx cap init')}.`
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

export async function checkAppDir(config: Config, dir: string): Promise<string | null> {
  if (!/^\S*$/.test(dir)) {
    return `Your app directory should not contain spaces`;
  }
  return null;
}

export async function checkAppId(config: Config, id: string): Promise<string | null> {
  if (!id) {
    return `Invalid App ID. App ID is required and cannot be blank.`;
  }
  if (/^[a-zA-Z][\w]*(?:\.[a-zA-Z][\w]*)+$/.test(id.toLowerCase())) {
    return null;
  }
  return `
    Invalid App ID "${id}". Your App ID must meet the following requirements to be valid on both iOS and Android:
    - Must be in Java package form with no dashes (ex: com.example.app)
    - It must have at least two segments (one or more dots).
    - Each segment must start with a letter.
    - All characters must be alphanumeric or an underscore [a-zA-Z][a-zA-Z0-9]+.

    If you would like to skip validation, run "cap init" with the "--skip-appid-validation" flag.
  `;
}

export async function checkAppName(config: Config, name: string): Promise<string | null> {
  // We allow pretty much anything right now, have fun
  if (!name?.length) {
    return `Must provide an app name. For example: 'Spacebook'`;
  }
  return null;
}

export async function wait(time: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, time));
}

export async function runHooks(config: Config, platformName: string, dir: string, hook: string): Promise<void> {
  await runPlatformHook(config, platformName, dir, hook);

  const allPlugins = await getPlugins(config, platformName);

  for (const p of allPlugins) {
    await runPlatformHook(config, platformName, p.rootPath, hook);
  }
}

export async function runPlatformHook(
  config: Config,
  platformName: string,
  platformDir: string,
  hook: string,
): Promise<void> {
  const { spawn } = await import('child_process');
  let pkg;
  if (isNXMonorepo(platformDir)) {
    pkg = await readJSON(join(findNXMonorepoRoot(platformDir), 'package.json'));
  } else {
    pkg = await readJSON(join(platformDir, 'package.json'));
  }
  const cmd = pkg.scripts?.[hook];

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
        CAPACITOR_ROOT_DIR: config.app.rootDir,
        CAPACITOR_WEB_DIR: config.app.webDirAbs,
        CAPACITOR_CONFIG: JSON.stringify(config.app.extConfig),
        CAPACITOR_PLATFORM_NAME: platformName,
        ...process.env,
      },
    });
    p.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(
          new Error(`${hook} hook on ${platformName} failed with error code: ${code} while running command: ${cmd}`),
        );
      }
    });
    p.on('error', (err) => {
      reject(err);
    });
  });
}

export interface RunTaskOptions {
  spinner?: boolean;
}

export async function runTask<T>(title: string, fn: () => Promise<T>): Promise<T> {
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

export async function getCapacitorPackage(config: Config, name: string): Promise<PackageJson | null> {
  const packagePath = resolveNode(config.app.rootDir, `@capacitor/${name}`, 'package.json');

  if (!packagePath) {
    return null;
  }

  return readJSON(packagePath);
}

export async function requireCapacitorPackage(config: Config, name: string): Promise<PackageJson> {
  const pkg = await getCapacitorPackage(config, name);

  if (!pkg) {
    fatal(
      `Unable to find node_modules/@capacitor/${name}.\n` +
        `Are you sure ${c.strong(`@capacitor/${name}`)} is installed?`,
    );
  }
  return pkg;
}

export async function getCapacitorPackageVersion(config: Config, platform: string): Promise<string> {
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

export async function getProjectPlatformDirectory(config: Config, platform: string): Promise<string | null> {
  const platformPath = getPlatformDirectory(config, platform);

  if (platformPath && (await pathExists(platformPath))) {
    return platformPath;
  }

  return null;
}

export async function selectPlatforms(config: Config, selectedPlatformName?: string): Promise<string[]> {
  if (selectedPlatformName) {
    // already passed in a platform name
    const platformName = selectedPlatformName.toLowerCase().trim();

    if (!(await isValidPlatform(platformName))) {
      fatal(`Invalid platform: ${c.input(platformName)}`);
    } else if (!(await getProjectPlatformDirectory(config, platformName))) {
      if (platformName === 'web') {
        fatal(`Could not find the web platform directory.\n` + `Make sure ${c.strong(config.app.webDir)} exists.`);
      }
      fatal(
        `${c.strong(platformName)} platform has not been added yet.\n` +
          `See the docs for adding the ${c.strong(platformName)} platform: ${c.strong(
            `https://capacitorjs.com/docs/${platformName}#adding-the-${platformName}-platform`,
          )}`,
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

export async function isValidCommunityPlatform(platform: string): Promise<boolean> {
  return (await getKnownCommunityPlatforms()).includes(platform);
}

export async function getKnownEnterprisePlatforms(): Promise<string[]> {
  return ['windows'];
}

export async function isValidEnterprisePlatform(platform: string): Promise<boolean> {
  return (await getKnownEnterprisePlatforms()).includes(platform);
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
          choices: platforms.map((p) => ({ title: p, value: p })),
        },
      ],
      { onCancel: () => process.exit(1) },
    );

    return answers.mode.toLowerCase().trim();
  }

  const platformName = selectedPlatformName.toLowerCase().trim();

  if (!(await isValidPlatform(platformName))) {
    const knownPlatforms = await getKnownPlatforms();

    fatal(`Invalid platform: ${c.input(platformName)}.\n` + `Valid platforms include: ${knownPlatforms.join(', ')}`);
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
  const validTargets = targets.filter((t) => t.id !== undefined);
  if (!selectedTarget) {
    if (validTargets.length === 1) {
      return validTargets[0];
    } else {
      const answers = await prompt(
        [
          {
            type: 'select',
            name: 'target',
            message: 'Please choose a target device:',
            choices: validTargets.map((t) => ({
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
  const target = targets.find((t) => t.id === targetID);

  if (!target) {
    fatal(`Invalid target ID: ${c.input(targetID)}.\n` + `Valid targets are: ${targets.map((t) => t.id).join(', ')}`);
  }

  return target;
}

export function getPlatformTargetName(target: PlatformTarget): string {
  return `${target.name ?? target.model ?? target.id ?? '?'}${
    target.virtual ? ` (${target.platform === 'ios' ? 'simulator' : 'emulator'})` : ''
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

export async function checkPlatformVersions(config: Config, platform: string): Promise<void> {
  const semver = await import('semver');
  const coreVersion = await getCoreVersion(config);
  const platformVersion = await getCapacitorPackageVersion(config, platform);

  if (semver.diff(coreVersion, platformVersion) === 'minor' || semver.diff(coreVersion, platformVersion) === 'major') {
    logger.warn(
      `${c.strong('@capacitor/core')}${c.weak(
        `@${coreVersion}`,
      )} version doesn't match ${c.strong(`@capacitor/${platform}`)}${c.weak(`@${platformVersion}`)} version.\n` +
        `Consider updating to a matching version, e.g. w/ ${c.input(`npm install @capacitor/core@${platformVersion}`)}`,
    );
  }
}

export function resolvePlatform(config: Config, platform: string): string | null {
  if (platform[0] !== '@') {
    const core = resolveNode(config.app.rootDir, `@capacitor/${platform}`, 'package.json');

    if (core) {
      return dirname(core);
    }

    const community = resolveNode(config.app.rootDir, `@capacitor-community/${platform}`, 'package.json');

    if (community) {
      return dirname(community);
    }

    const enterprise = resolveNode(config.app.rootDir, `@ionic-enterprise/capacitor-${platform}`, 'package.json');

    if (enterprise) {
      return dirname(enterprise);
    }
  }

  // third-party
  const thirdParty = resolveNode(config.app.rootDir, platform, 'package.json');

  if (thirdParty) {
    return dirname(thirdParty);
  }

  return null;
}

export async function checkJDKMajorVersion(): Promise<number> {
  try {
    const string = await runCommand('java', ['--version']);
    const versionRegex = RegExp(/([0-9]+)\.?([0-9]*)\.?([0-9]*)/);
    const versionMatch = versionRegex.exec(string);

    if (versionMatch === null) {
      return -1;
    }

    const firstVersionNumber = parseInt(versionMatch[1]);
    const secondVersionNumber = parseInt(versionMatch[2]);

    if (typeof firstVersionNumber === 'number' && firstVersionNumber != 1) {
      return firstVersionNumber;
    } else if (typeof secondVersionNumber === 'number' && firstVersionNumber == 1 && secondVersionNumber < 9) {
      return secondVersionNumber;
    } else {
      return -1;
    }
  } catch (e) {
    return -1;
  }
}

export function parseApkNameFromFlavor(flavor: string): string {
  const convertedName = flavor.replace(/([A-Z])/g, '$1').toLowerCase();
  return `app-${convertedName ? `${convertedName}-` : ''}debug.apk`;
}
