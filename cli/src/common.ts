import { wordWrap } from '@ionic/cli-framework-output';
import { Config } from './config';
import { exec, spawn } from 'child_process';
import { setTimeout } from 'timers';
import { basename, dirname, join, parse, resolve } from 'path';
import {
  copyAsync,
  existsAsync,
  readFileAsync,
  renameAsync,
  writeFileAsync,
} from './util/fs';
import { existsSync, readFile } from 'fs';
import { emoji as _e } from './util/emoji';
import c from './colors';
import { output, logger } from './log';
import semver from 'semver';
import which from 'which';
import prompts, { Answers, PromptObject } from 'prompts';
import { PackageJson } from './definitions';

export type CheckFunction = (
  config: Config,
  ...args: any[]
) => Promise<string | null>;

export async function check(
  config: Config,
  checks: CheckFunction[],
): Promise<void> {
  const results = await Promise.all(checks.map(f => f(config)));
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
  if (!(await existsAsync(config.app.webDirAbs))) {
    return (
      `Could not find the web assets directory: ${config.app.webDirAbs}.\n` +
      `Please create it and make sure it has an ${c.strong(
        'index.html',
      )} file. You can change the path of this directory in ${c.strong(
        'capacitor.config.json',
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

  if (!(await existsAsync(join(config.app.webDirAbs, 'index.html')))) {
    return (
      `The web assets directory (${
        config.app.webDirAbs
      }) must contain an ${c.strong('index.html')} file.\n` +
      `It will be the entry point for the web portion of the Capacitor app.`
    );
  }
  return null;
}

export async function checkPackage(_config: Config): Promise<string | null> {
  if (!(await existsAsync('package.json'))) {
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
      `Please add it in capacitor.config.json or run ${c.input(
        'npx cap init',
      )}.`
    );
  }
  if (!config.app.appName) {
    return (
      `Missing ${c.input('appName')} for new platform.\n` +
      `Please add it in capacitor.config.json or run ${c.input(
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

export async function readJSON(path: string): Promise<any> {
  const data = await readFileAsync(path, 'utf8');
  return JSON.parse(data);
}

export function writePrettyJSON(path: string, data: any) {
  return writeFileAsync(path, JSON.stringify(data, null, '  ') + '\n');
}

export function readXML(path: string): Promise<any> {
  return new Promise((resolve, reject) => {
    readFile(path, 'utf8', async (err, xmlStr) => {
      if (err) {
        reject(`Unable to read: ${path}`);
      } else {
        const xml2js = await import('xml2js');
        xml2js.parseString(xmlStr, (err, result) => {
          if (err) {
            reject(`Error parsing: ${path}, ${err}`);
          } else {
            resolve(result);
          }
        });
      }
    });
  });
}

export function parseXML(xmlStr: string): any {
  const parseString = require('xml2js').parseString;
  var xmlObj;
  parseString(xmlStr, (err: any, result: any) => {
    if (!err) {
      xmlObj = result;
    }
  });
  return xmlObj;
}

export function writeXML(object: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    const xml2js = await import('xml2js');
    const builder = new xml2js.Builder({
      headless: true,
      explicitRoot: false,
      rootName: 'deleteme',
    });
    let xml = builder.buildObject(object);
    xml = xml.replace('<deleteme>', '').replace('</deleteme>', '');
    resolve(xml);
  });
}

export function buildXmlElement(configElement: any, rootName: string) {
  const xml2js = require('xml2js');
  const builder = new xml2js.Builder({
    headless: true,
    explicitRoot: false,
    rootName: rootName,
  });
  return builder.buildObject(configElement);
}

/**
 * Check for or create our main configuration file.
 * @param config
 */
export async function getOrCreateConfig(config: Config) {
  const configPath = join(config.app.rootDir, config.app.extConfigName);
  if (await existsAsync(configPath)) {
    return configPath;
  }

  await writePrettyJSON(config.app.extConfigFilePath, {
    appId: config.app.appId,
    appName: config.app.appName,
    bundledWebRuntime: config.app.bundledWebRuntime,
    webDir: basename(resolve(config.app.rootDir, config.app.webDir)),
    plugins: {
      SplashScreen: {
        launchShowDuration: 0,
      },
    },
  });

  // Store our newly created or found external config as the default
  config.loadExternalConfig();
}

export async function mergeConfig(config: Config, settings: any) {
  const configPath = join(config.app.rootDir, config.app.extConfigName);

  await writePrettyJSON(config.app.extConfigFilePath, {
    ...config.app.extConfig,
    ...settings,
  });

  // Store our newly created or found external config as the default
  config.loadExternalConfig();
}

export async function logPrompt<T extends string>(
  msg: string,
  prompt: PromptObject<T>,
): Promise<Answers<T>> {
  logger.log({
    msg: `${c.input('[?]')} ${wordWrap(msg, { indentation: 4 })}`,
    logger,
    format: false,
  });
  return prompts(prompt, { onCancel: () => process.exit(1) });
}

export function logSuccess(msg: string) {
  logger.msg(`${c.success('[success]')} ${msg}`);
}

export function logFatal(msg: string): never {
  logger.error(msg);
  return process.exit(1);
}

export async function isInstalled(command: string): Promise<boolean> {
  return new Promise<boolean>(resolve => {
    which(command, err => {
      if (err) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}

export function wait(time: number) {
  return new Promise(resolve => setTimeout(resolve, time));
}

export async function runPlatformHook(
  platformDir: string,
  hook: string,
): Promise<void> {
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

export function runCommand(command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(stdout + stderr);
      } else {
        resolve(stdout);
      }
    });
  });
}

export async function getCommandOutput(
  command: string,
): Promise<string | null> {
  try {
    return (await runCommand(command)).trim();
  } catch (e) {
    return null;
  }
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

export async function copyTemplate(src: string, dst: string) {
  await copyAsync(src, dst);
  await renameGitignore(dst);
}

export async function renameGitignore(dst: string) {
  // npm renames .gitignore to something else, so our templates
  // have .gitignore as gitignore, we need to rename it here.
  const gitignorePath = join(dst, 'gitignore');
  if (await existsAsync(gitignorePath)) {
    await renameAsync(gitignorePath, join(dst, '.gitignore'));
  }
}

export async function getCapacitorPackage(
  config: Config,
  name: string,
): Promise<PackageJson | null> {
  const packagePath = resolveNode(config, `@capacitor/${name}`, 'package.json');

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

export async function checkPlatformVersions(config: Config, platform: string) {
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
    const core = resolveNode(config, `@capacitor/${platform}`);

    if (core) {
      return core;
    }

    const community = resolveNode(config, `@capacitor-community/${platform}`);

    if (community) {
      return community;
    }
  }

  // third-party
  return resolveNode(config, platform);
}

export function resolveNode(
  config: Config,
  ...pathSegments: string[]
): string | null {
  const id = pathSegments[0];
  const path = pathSegments.slice(1);

  let modulePath;
  const starts = [config.app.rootDir];
  for (let start of starts) {
    modulePath = resolveNodeFrom(start, id);
    if (modulePath) {
      break;
    }
  }
  if (!modulePath) {
    return null;
  }

  return join(modulePath, ...path);
}

export function resolveNodeFrom(start: string, id: string): string | null {
  const rootPath = parse(start).root;
  let basePath = resolve(start);
  let modulePath;
  while (true) {
    modulePath = join(basePath, 'node_modules', id);
    if (existsSync(modulePath)) {
      return modulePath;
    }
    if (basePath === rootPath) {
      return null;
    }
    basePath = dirname(basePath);
  }
}
