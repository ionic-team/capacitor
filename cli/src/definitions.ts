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
  appId?: string;
  appName?: string;
  webDir?: string;
  bundledWebRuntime?: boolean;
  ios?: {
    cordovaSwiftVersion?: string;
    minVersion?: string;
    cordovaLinkerFlags?: string[];
  };
  cordova?: {
    preferences?: { [key: string]: string | undefined };
  };
  server?: {
    cleartext?: boolean;
  };
}

export interface WindowsConfig {
  androidStudioPath: string;
}

export interface LinuxConfig {
  androidStudioPath: string;
}

export interface PlatformAssetsConfig {
  templateName: string;
  pluginsFolderName: string;
  templateDir: string;
  pluginsDir: string;
}

export interface CLIConfig {
  rootDir: string;
  assetsName: string;
  assetsDir: string;
  package: PackageJson;
  os: OS;
}

export interface AppConfig {
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

export interface AndroidConfig {
  name: string;
  minVersion: string;
  platformDir: string;
  webDir: string;
  webDirAbs: string;
  resDir: string;
  resDirAbs: string;
  assets: PlatformAssetsConfig;
}

export interface IOSConfig {
  name: string;
  minVersion: string;
  cordovaSwiftVersion: string;
  platformDir: string;
  webDir: string;
  webDirAbs: string;
  nativeProjectName: string;
  assets: PlatformAssetsConfig;
}

export interface Config {
  windows: WindowsConfig;
  linux: LinuxConfig;
  android: AndroidConfig;
  ios: IOSConfig;
  web: {
    name: string;
  };
  cli: CLIConfig;
  app: AppConfig;
}
