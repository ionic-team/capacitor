import { readFileSync } from 'fs';
import { basename, join, resolve } from 'path';

import { logFatal, readJSON } from './common';
import { CliConfig, ExternalConfig, OS, PackageJson } from './definitions';

let Package: PackageJson;
let ExtConfig: ExternalConfig;

export class Config implements CliConfig {
  windows = {
    androidStudioPath:
      'C:\\Program Files\\Android\\Android Studio\\bin\\studio64.exe',
  };

  linux = {
    androidStudioPath: '/usr/local/android-studio/bin/studio.sh',
  };

  android = {
    name: 'android',
    minVersion: '21',
    platformDir: '',
    webDir: 'app/src/main/assets/public',
    webDirAbs: '',
    resDir: 'app/src/main/res',
    resDirAbs: '',
    assets: {
      templateName: 'android-template',
      pluginsFolderName: 'capacitor-cordova-android-plugins',
      templateDir: '',
      pluginsDir: '',
    },
  };

  ios = {
    name: 'ios',
    minVersion: '11.0',
    cordovaSwiftVersion: '5.0',
    platformDir: '',
    webDir: 'public',
    webDirAbs: '',
    nativeProjectName: 'App',
    assets: {
      templateName: 'ios-template',
      pluginsFolderName: 'capacitor-cordova-ios-plugins',
      templateDir: '',
      pluginsDir: '',
    },
  };

  web = {
    name: 'web',
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
    appId: '',
    appName: '',
    webDir: 'www',
    webDirAbs: '',
    package: Package,
    extConfigName: 'capacitor.config.json',
    extConfigFilePath: '',
    extConfig: ExtConfig,
    bundledWebRuntime: false,
  };

  constructor(
    os: NodeJS.Platform,
    currentWorkingDir: string,
    cliBinDir: string,
  ) {
    this.initOS(os);
    this.initCliConfig(cliBinDir);

    try {
      this.initAppConfig(resolve(currentWorkingDir));
      this.loadExternalConfig();
      this.mergeConfigData();

      // Post-merge
      this.initAndroidConfig();
      this.initIosConfig();
    } catch (e) {
      logFatal(`Unable to load config\n` + e.stack ?? e);
    }
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

  private initCliConfig(cliBinDir: string) {
    this.cli.binDir = cliBinDir;
    this.cli.rootDir = join(cliBinDir, '../');
    this.cli.assetsDir = join(this.cli.rootDir, this.cli.assetsName);
    this.cli.package = loadPackageJson(this.cli.rootDir);
  }

  private initAppConfig(currentWorkingDir: string) {
    this.app.rootDir = currentWorkingDir;
    this.app.package = loadPackageJson(currentWorkingDir);
  }

  private initAndroidConfig() {
    this.android.platformDir = resolve(this.app.rootDir, this.android.name);
    this.android.assets.templateDir = resolve(
      this.cli.assetsDir,
      this.android.assets.templateName,
    );
    this.android.assets.pluginsDir = resolve(
      this.cli.assetsDir,
      this.android.assets.pluginsFolderName,
    );
    this.android.webDirAbs = resolve(
      this.android.platformDir,
      this.android.webDir,
    );
    this.android.resDirAbs = resolve(
      this.android.platformDir,
      this.android.resDir,
    );
  }

  private initIosConfig() {
    this.ios.platformDir = resolve(this.app.rootDir, this.ios.name);
    this.ios.assets.templateDir = resolve(
      this.cli.assetsDir,
      this.ios.assets.templateName,
    );
    this.ios.assets.pluginsDir = resolve(
      this.cli.assetsDir,
      this.ios.assets.pluginsFolderName,
    );
    this.ios.webDirAbs = resolve(
      this.ios.platformDir,
      this.ios.nativeProjectName,
      this.ios.webDir,
    );
    if (
      this.app.extConfig &&
      this.app.extConfig.ios &&
      this.app.extConfig.ios.cordovaSwiftVersion
    ) {
      this.ios.cordovaSwiftVersion = this.app.extConfig.ios.cordovaSwiftVersion;
    }
    if (
      this.app.extConfig &&
      this.app.extConfig.ios &&
      this.app.extConfig.ios.minVersion
    ) {
      this.ios.minVersion = this.app.extConfig.ios.minVersion;
    }
  }

  private mergeConfigData() {
    const extConfig: ExternalConfig = this.app.extConfig || {};

    Object.assign(this.app, extConfig);

    // Build the absolute path to the web directory
    this.app.webDirAbs = resolve(this.app.rootDir, this.app.webDir);
  }

  loadExternalConfig() {
    this.app.extConfigFilePath = join(this.app.rootDir, this.app.extConfigName);

    try {
      const extConfigStr = readFileSync(this.app.extConfigFilePath, 'utf8');

      try {
        // we've got an capacitor.json file, let's parse it
        this.app.extConfig = JSON.parse(extConfigStr);
      } catch (e) {
        logFatal(
          `Error parsing ${basename(this.app.extConfigFilePath)}\n` + e.stack ??
            e,
        );
      }
    } catch {
      // it's ok if there's no capacitor.json file
    }
  }
}

function loadPackageJson(dir: string): PackageJson {
  let p: any = null;

  try {
    p = require(join(dir, 'package.json'));
  } catch (e) {}

  return p;
}
