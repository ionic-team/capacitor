export type PlatformName = '' | 'mac' | 'windows' | 'linux';

export enum OS {
  Unknown = 'unknown',
  Mac = 'mac',
  Windows = 'windows',
  Linux = 'linux'
}

export interface PackageJson {
  name: string;
  version: string;
  dependencies: any;
  devDependencies: any;
}

export interface ExternalConfig {
  webDir?: string;
  startPage?: string;
  ios?: {
    cordovaSwiftVersion?: string;
    minVersion?: string;
    cordovaLinkerFlags?: string[];
  };
  npmClient?: string;
  cordova?: any;
  server?: {
    cleartext?: boolean;
  };
}

export interface AppPluginsConfig {
  [key: string]: any;
}

export interface CliConfigWindows {
  androidStudioPath?: string;
}

export interface CliConfigLinux {
  androidStudioPath?: string;
}

export interface CliConfigPlatformAssets {
  templateName: string;
  templateDir?: string;
}

export interface CliConfigPlatform {
  name: string;
  minVersion?: string;
  platformDir?: string;
  webDir?: string;
  assets?: CliConfigPlatformAssets;
}

export interface CliConfigPlatformIOS extends CliConfigPlatform {
  // The directory inside of app/ios/ that has the full xcode project files
  nativeProjectDir: string;
}

export interface CliConfigCli {
  binDir: string;
  rootDir: string;
  assetsName: string;
  assetsDir: string;
  package: PackageJson;
  os: OS;
}

export interface CliConfigApp {
  rootDir: string;
  appId: string;
  appName: string;
  webDir: string;
  webDirAbs: string;
  package: PackageJson;
  extConfigName: string;
  extConfigFilePath: string;
  extConfig: ExternalConfig;
  plugins: AppPluginsConfig;
  windowsAndroidStudioPath: string;
  linuxAndroidStudioPath: string;
  /**
   * Whether to use a bundled web runtime instead of relying on a bundler/module
   * loader. If you're not using something like rollup or webpack or dynamic ES
   * module imports, set this to "true" and import "capacitor.js" manually.
   */
  bundledWebRuntime: boolean;
  assets: CliConfigPlatformAssets;
}

export interface CliConfigPlugins {
  assets: CliConfigPlatformAssets;
}

export interface CliConfig {
  windows: CliConfigWindows;
  linux: CliConfigLinux;
  android: CliConfigPlatform;
  web: CliConfigPlatform;
  ios: CliConfigPlatform;
  cli: CliConfigCli;
  app: CliConfigApp;
  plugins: CliConfigPlugins;
}
