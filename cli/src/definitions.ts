export interface PackageJson {
  name: string;
  version: string;
}


export interface ExternalConfig {
  webDir: string;
  startPage: string;
}

export interface CliConfigPlatformAssets {
  templateName: string;
  templateDir?: string;
}

export interface CliConfigPlatform {
  name: string;
  minVersion: string;
  platformDir: string;
  webDir: string;
  assets: CliConfigPlatformAssets;
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
  package: PackageJson
}

export interface CliConfigApp {
  rootDir: string;
  webDir: string;
  symlinkWebDir: boolean;
  package: PackageJson,
  extConfigName: string;
  extConfigFilePath: string;
  extConfig: ExternalConfig,
  assets: CliConfigPlatformAssets;
}


export interface CliConfig {
  android: CliConfigPlatform;
  ios: CliConfigPlatform;
  cli: CliConfigCli;
  app: CliConfigApp;
}