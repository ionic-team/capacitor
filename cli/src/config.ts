import { accessSync, readFileSync } from 'fs';
import { isAbsolute, join } from 'path';
import { logFatal } from './common';
import { CliConfig, ExternalConfig, OS, PackageJson } from './definitions';
import { currentId } from 'async_hooks';

let Package: PackageJson;
let ExtConfig: ExternalConfig;

export class Config implements CliConfig {
  windows = {
    androidStudioPath: 'C:\\Program Files\\Android Studio\\bin\\studio64.exe'
  };

  linux = {
    androidStudioPath: '/usr/local/android-studio/bin/studio.sh'
  };

  android = {
    name: 'android',
    minVersion: '21',
    platformDir: '',
    webDir: 'app/src/main/assets/public',
    resDir: 'app/src/main/res',
    assets: {
      templateName: 'android-template',
      templateDir: ''
    }
  };

  ios = {
    name: 'ios',
    minVersion: '10.0',
    platformDir: '',
    webDir: 'public',
    capacitorRuntimePod: `pod 'Capacitor'`,
    nativeProjectName: 'App',
    assets: {
      templateName: 'ios-template',
      templateDir: ''
    }
  };

  web = {
    name: 'web'
  };

  cli = {
    binDir: '',
    rootDir: '',
    assetsName: 'assets',
    assetsDir: '',
    package: Package,
    os: OS.Unknown,
  };

  app = {
    rootDir: '',
    webDir: 'public',
    symlinkWebDir: false,
    package: Package,
    windowsAndroidStudioPath: 'C:\\Program Files\\Android Studio\\bin\\studio64.exe',
    linuxAndroidStudioPath: '',
    extConfigName: 'capacitor.config.json',
    extConfigFilePath: '',
    extConfig: ExtConfig,
    bundledWebRuntime: false,
    assets: {
      templateName: 'app-template',
      templateDir: ''
    }
  };

  plugins = {
    assets: {
      templateName: 'plugin-template',
      templateDir: ''
    }
  };

  platforms: string[] = [];


  constructor(os: string, currentWorkingDir: string, cliBinDir: string) {
    this.initOS(os);
    this.initCliConfig(cliBinDir);
    this.setCurrentWorkingDir(currentWorkingDir);
  }

  initOS(os: string) {
    switch (os) {
      case 'darwin':
        this.cli.os = OS.Mac;
        break;
      case 'win32':
        this.cli.os = OS.Windows;
        break;
      case 'linux':
        this.cli.os = OS.Linux;
        break;
    }
  }

  setCurrentWorkingDir(currentWorkingDir: string) {
    try {
      this.initAppConfig(currentWorkingDir);
      this.initAndroidConfig();
      this.initIosConfig();
      this.initPluginsConfig();
      this.loadExternalConfig();
      this.mergeConfigData();

      // Post-merge
      this.initWindowsConfig();
      this.initLinuxConfig();

      this.platforms.push(this.web.name);
    } catch (e) {
      logFatal(`Unable to load config`, e);
    }
  }

  private initCliConfig(cliBinDir: string) {
    this.cli.binDir = cliBinDir;
    this.cli.rootDir = join(cliBinDir, '../');
    this.cli.assetsDir = join(this.cli.rootDir, this.cli.assetsName);
    this.cli.package = loadPackageJson(this.cli.rootDir);
  }


  private initAppConfig(currentWorkingDir: string) {
    this.app.rootDir = currentWorkingDir,
    this.app.package = loadPackageJson(currentWorkingDir);
    this.app.assets.templateDir = join(this.cli.assetsDir, this.app.assets.templateName);
  }


  private initAndroidConfig() {
    this.platforms.push(this.android.name);
    this.android.platformDir = join(this.app.rootDir, this.android.name);
    this.android.assets.templateDir = join(this.cli.assetsDir, this.android.assets.templateName);
    this.android.webDir = join(this.android.platformDir, this.android.webDir);
    this.android.resDir = join(this.android.platformDir, this.android.resDir);
  }


  private initIosConfig() {
    this.platforms.push(this.ios.name);
    this.ios.platformDir = join(this.app.rootDir, this.ios.name);
    this.ios.assets.templateDir = join(this.cli.assetsDir, this.ios.assets.templateName);
    this.ios.webDir = join(this.ios.platformDir, this.ios.nativeProjectName, this.ios.webDir);
  }

  private initWindowsConfig() {
    this.windows.androidStudioPath = this.app.windowsAndroidStudioPath && this.app.windowsAndroidStudioPath;
  }

  private initLinuxConfig() {
    this.linux.androidStudioPath = this.app.linuxAndroidStudioPath && this.app.linuxAndroidStudioPath;
  }

  private initPluginsConfig() {
    this.plugins.assets.templateDir = join(this.cli.assetsDir, this.plugins.assets.templateName);
  }

  private mergeConfigData() {
    const extConfig: ExternalConfig = this.app.extConfig || {};

    Object.assign(this.app, extConfig);

    if (!isAbsolute(this.app.webDir)) {
      this.app.webDir = join(this.app.rootDir, this.app.webDir);
    }
  }

  loadExternalConfig() {
    this.app.extConfigFilePath = join(this.app.rootDir, this.app.extConfigName);

    try {
      const extConfigStr = readFileSync(this.app.extConfigFilePath, 'utf-8');

      try {
        // we've got an capacitor.json file, let's parse it
        this.app.extConfig = JSON.parse(extConfigStr);
      } catch (e) {
        logFatal(`error parsing: ${this.app.extConfigFilePath}`);
      }

    } catch {
      // it's ok if there's no capacitor.json file
    }
  }

  foundExternalConfig(): boolean {
    return !!this.app.extConfig;
  }

  selectPlatforms(selectedPlatformName?: string) {
    if (selectedPlatformName) {
      // already passed in a platform name
      const platformName = selectedPlatformName.toLowerCase().trim();

      if (!this.isValidPlatform(platformName)) {
        logFatal(`Invalid platform: ${platformName}`);

      } else if (!this.platformDirExists(platformName)) {
        this.platformNotCreatedError(platformName);
      }

      // return the platform in an string array
      return [platformName];
    }

    // wasn't given a platform name, so let's
    // get the platforms that have already been created
    return this.getExistingPlatforms();
  }


  async askPlatform(selectedPlatformName: string, promptMessage: string): Promise<string> {
    if (!selectedPlatformName) {
      const inquirer = await import('inquirer');

      const answer = await inquirer.prompt({
        type: 'list',
        name: 'mode',
        message: promptMessage,
        choices: this.platforms
      });

      return answer.mode.toLowerCase().trim();
    }

    const platformName = selectedPlatformName.toLowerCase().trim();

    if (!this.isValidPlatform(platformName)) {
      logFatal(`Invalid platform: "${platformName}". Valid platforms include: ${this.platforms.join(', ')}`);
    }

    return platformName;
  }


  getExistingPlatforms() {
    const platforms: string[] = [];

    if (this.platformDirExists(this.android.name)) {
      platforms.push(this.android.name);
    }

    if (this.platformDirExists(this.ios.name)) {
      platforms.push(this.ios.name);
    }

    platforms.push(this.web.name);

    return platforms;
  }

  platformDirExists(platformName: any): string {
    let platformDir: any = null;

    try {
      let testDir = join(this.app.rootDir, platformName);
      if (platformName === 'web') {
        testDir = this.app.webDir;
      }
      accessSync(testDir);
      platformDir = testDir;
    } catch (e) {}

    return platformDir;
  }

  isValidPlatform(platform: any) {
    return this.platforms.includes(platform);
  }

  platformNotCreatedError(platformName: string) {
    const chalk = require('chalk');
    if (platformName === 'web') {
      logFatal(`Could not find the web platform directory. Make sure ${chalk.bold(this.app.webDir)} exists.`);
    }
    logFatal(`${chalk.bold(platformName)}" platform has not been created. Use "capacitor add ${platformName}" to add the platform project.`);
  }
}

function loadPackageJson(dir: string): PackageJson {
  let p: any = null;

  try {
    p = require(join(dir, 'package.json'));
  } catch (e) {}

  return p;
}
