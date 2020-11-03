export interface CapacitorConfig {
  appId?: string;
  appName?: string;
  webDir?: string;
  bundledWebRuntime?: boolean;
  android?: {
    path?: string;
  };
  ios?: {
    path?: string;
    cordovaSwiftVersion?: string;
    minVersion?: string;
    cordovaLinkerFlags?: string[];
  };
  cordova?: {
    preferences?: { [key: string]: string | undefined };
  };
  plugins?: { [key: string]: any };
  server?: {
    cleartext?: boolean;
  };
}
