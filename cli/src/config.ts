import { accessSync, readFileSync } from 'fs';
import { isAbsolute, join } from 'path';
import { logFatal } from './common';
import { CliConfig, ExternalConfig, PackageJson } from './definitions';
import { currentId } from 'async_hooks';

let Package: PackageJson;
let ExtConfig: ExternalConfig;

export class Config implements CliConfig {

  android = {
    name: 'android',
    minVersion: '21',
    platformDir: '',
    webDir: 'app/src/main/assets/public',
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

  cli = {
    binDir: '',
    rootDir: '',
    assetsName: 'assets',
    assetsDir: '',
    package: Package,
    os: ''
  };

  app = {
    rootDir: '',
    webDir: 'public',
    symlinkWebDir: false,
    package: Package,
    extConfigName: 'capacitor.config.json',
    extConfigFilePath: '',
    extConfig: ExtConfig,
    assets: {
      templateName: 'app-template',
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
        this.cli.os = 'mac';
        break;
      case 'win32':
        this.cli.os = 'windows';
        break;
      case 'freebsd':
        // Sure, why not
        this.cli.os = 'freebsd';
        break;
      case 'linux':
        this.cli.os = 'linux';
        break;
    }
  }

  setCurrentWorkingDir(currentWorkingDir: string) {
    try {
      this.initAppConfig(currentWorkingDir);
      this.initAndroidConfig();
      this.initIosConfig();
      this.loadExternalConfig();
      this.mergeConfigData();

      // TODO: remove this code
      // Once Capacitor library is released as a cocoapods package, this code is not needed
      const capacitorRuntimePath = join(this.cli.assetsDir, 'Capacitor');
      this.ios.capacitorRuntimePod = `pod 'Capacitor', :path => '${capacitorRuntimePath}'`;

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
  }


  private initIosConfig() {
    this.platforms.push(this.ios.name);
    this.ios.platformDir = join(this.app.rootDir, this.ios.name);
    this.ios.assets.templateDir = join(this.cli.assetsDir, this.ios.assets.templateName);
    this.ios.webDir = join(this.ios.platformDir, this.ios.nativeProjectName, this.ios.webDir);
  }


  private loadExternalConfig() {
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


  private mergeConfigData() {
    const extConfig: ExternalConfig = this.app.extConfig || {};

    Object.assign(this.app, extConfig);

    if (!isAbsolute(this.app.webDir)) {
      this.app.webDir = join(this.app.rootDir, this.app.webDir);
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
        platformNotCreatedError(platformName);
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

    return platforms;
  }


  platformDirExists(platformName: any): string {
    let platformDir: any = null;

    try {
      let testDir = join(this.app.rootDir, platformName);
      accessSync(testDir);
      platformDir = testDir;
    } catch (e) {}

    return platformDir;
  }


  isValidPlatform(platform: any) {
    return this.platforms.includes(platform);
  }

}


function platformNotCreatedError(platformName: string) {
  logFatal(`"${platformName}" platform has not been created. Please use "capacitor create ${platformName}" command to first create the platform.`);
}


function loadPackageJson(dir: string): PackageJson {
  let p: any = null;

  try {
    p = require(join(dir, 'package.json'));
  } catch (e) {}

  return p;
}
