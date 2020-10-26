export const enum OS {
  Unknown = 'unknown',
  Mac = 'mac',
  Windows = 'windows',
  Linux = 'linux',
}

export interface PackageJson {
  readonly name: string;
  readonly version: string;
  readonly dependencies?: { readonly [key: string]: string | undefined };
  readonly devDependencies?: { readonly [key: string]: string | undefined };
}

export interface ExternalConfig {
  readonly windowsAndroidStudioPath?: string;
  readonly linuxAndroidStudioPath?: string;
  readonly appId?: string;
  readonly appName?: string;
  readonly webDir?: string;
  readonly bundledWebRuntime?: boolean;
  readonly android?: {
    readonly path?: string;
  };
  readonly ios?: {
    readonly path?: string;
    readonly cordovaSwiftVersion?: string;
    readonly minVersion?: string;
    readonly cordovaLinkerFlags?: string[];
  };
  readonly cordova?: {
    readonly preferences?: { readonly [key: string]: string | undefined };
  };
  readonly plugins?: { readonly [key: string]: any };
  readonly server?: {
    readonly cleartext?: boolean;
  };
}

export interface WindowsConfig {
  readonly androidStudioPath: string;
}

export interface LinuxConfig {
  readonly androidStudioPath: string;
}

export interface PlatformConfig {
  readonly name: string;
  readonly platformDir: string;
  readonly platformDirAbs: string;
}

export interface PlatformAssetsConfig {
  readonly templateName: string;
  readonly pluginsFolderName: string;
  readonly templateDir: string;
  readonly pluginsDir: string;
}

export interface CLIConfig {
  readonly rootDir: string;
  readonly assetsName: string;
  readonly assetsDir: string;
  readonly package: PackageJson;
  readonly os: OS;
}

export interface AppConfig {
  readonly rootDir: string;
  readonly appId: string;
  readonly appName: string;
  readonly webDir: string;
  readonly webDirAbs: string;
  readonly package: PackageJson;
  readonly extConfigName: string;
  readonly extConfigFilePath: string;
  readonly extConfig: ExternalConfig;
  /**
   * Whether to use a bundled web runtime instead of relying on a bundler/module
   * loader. If you're not using something like rollup or webpack or dynamic ES
   * module imports, set this to "true" and import "capacitor.js" manually.
   */
  readonly bundledWebRuntime: boolean;
}

export interface AndroidConfig extends PlatformConfig {
  readonly minVersion: string;
  readonly webDir: string;
  readonly webDirAbs: string;
  readonly resDir: string;
  readonly resDirAbs: string;
  readonly buildOutputDir: string;
  readonly buildOutputDirAbs: string;
  readonly assets: PlatformAssetsConfig;
}

export interface IOSConfig extends PlatformConfig {
  readonly minVersion: string;
  readonly cordovaSwiftVersion: string;
  readonly webDir: string;
  readonly webDirAbs: string;
  readonly nativeProjectName: string;
  readonly assets: PlatformAssetsConfig;
}

export type WebConfig = PlatformConfig;

export interface Config {
  readonly windows: WindowsConfig;
  readonly linux: LinuxConfig;
  readonly android: AndroidConfig;
  readonly ios: IOSConfig;
  readonly web: WebConfig;
  readonly cli: CLIConfig;
  readonly app: AppConfig;
}
