export const enum OS {
  Unknown = 'unknown',
  Mac = 'mac',
  Windows = 'windows',
  Linux = 'linux',
}

export interface PackageJson {
  name: string;
  version: string;
  dependencies?: { [key: string]: string | undefined };
  devDependencies?: { [key: string]: string | undefined };
}

export interface ExternalConfig {
  ios?: {
    cordovaSwiftVersion?: string;
    minVersion?: string;
    cordovaLinkerFlags?: string[];
  };
  cordova?: {
    preferences: { [key: string]: string | undefined };
  };
  server?: {
    cleartext?: boolean;
  };
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
  /**
   * Whether to use a bundled web runtime instead of relying on a bundler/module
   * loader. If you're not using something like rollup or webpack or dynamic ES
   * module imports, set this to "true" and import "capacitor.js" manually.
   */
  bundledWebRuntime: boolean;
}

export interface CliConfig {
  windows: CliConfigWindows;
  linux: CliConfigLinux;
  android: CliConfigPlatform;
  web: CliConfigPlatform;
  ios: CliConfigPlatform;
  cli: CliConfigCli;
  app: CliConfigApp;
}
