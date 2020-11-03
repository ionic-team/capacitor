export interface CapacitorConfig {
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
