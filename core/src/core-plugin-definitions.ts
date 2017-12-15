import { PluginCallback } from './definitions';

declare global {
  interface PluginRegistry {
    Browser: BrowserPlugin;
    Camera: CameraPlugin;
    Clipboard: ClipboardPlugin;
    Device: DevicePlugin;
    Filesystem: FilesystemPlugin;
    Geolocation: GeolocationPlugin;
    Haptics: HapticsPlugin;
    Keyboard: KeyboardPlugin;
    LocalNotifications: LocalNotificationsPlugin;
    Modals: ModalsPlugin;
    Motion: MotionPlugin;
    Network: NetworkPlugin;
    SplashScreen: SplashScreenPlugin;
    StatusBar: StatusBarPlugin;
  }
}
//

export interface BrowserPlugin {
  open(url: string): Promise<any>;
  close(options: any): Promise<any>;
}

//

export interface CameraPlugin {
  getPhoto(options: CameraOptions): Promise<CameraPhoto>;
}

export interface CameraOptions {
  quality?: number; // default: 100
  allowEditing?: boolean; // default: false
  resultType: 'base64' | 'uri';
  saveToGallery?: boolean; // default: true
}

export interface CameraPhoto {
  base64_data: string;
  format: string;
}

//

export interface ClipboardPlugin {
  set(options: ClipboardSet): Promise<void>;
  get(options: ClipboardGet): Promise<ClipboardGetResult>;
}

export interface ClipboardSet {
  string?: string;
  image?: string;
  url?: string;
  label?: string; // Android only
}

export interface ClipboardGet {
  type: 'string' | 'url' | 'image';
}

export interface ClipboardGetResult {
  value: string;
}

//

export interface DevicePlugin {
  getInfo(): Promise<DeviceInfo>;
}

export interface DeviceInfo {
  model: string;
  platform: string;
  uuid: string;
  version: string;
  manufacturer: string;
  isVirtual: boolean;
  serial: string;
}

//

export interface FilesystemPlugin {

  /**
   * Write a file to disk in the specified location on device
   * @param file the filename to write
   * @param data the data to write
   * @param directory the FilesystemDirectory to store the file in
   * @param encoding the encoding to write the file in (defaults to utf8)
   */
  writeFile(file: string, data: string, directory: FilesystemDirectory, encoding: string) : Promise<FileWriteResult>;

  /**
   * Append to a file on disk in the specified location on device
   * @param file the filename to write
   * @param data the data to write
   * @param directory the FilesystemDirectory to store the file in
   * @param encoding the encoding to write the file in (defaults to utf8)
   */
  appendFile(file: string, data: string, directory: FilesystemDirectory, encoding: string) : Promise<FileAppendResult>;

  /**
   * Read a file from disk
   * @param file the filename to write
   * @param directory the FilesystemDirectory to store the file in
   * @param encoding the encoding to write the file in (defaults to utf8)
   */
  readFile(file: string, directory: FilesystemDirectory, encoding: string) : Promise<FileReadResult>;

  /**
   * Delete a file from disk
   * @param file the filename to write
   * @param directory the FilesystemDirectory to store the file in
   */
  deleteFile(file: string, directory: FilesystemDirectory) : Promise<FileDeleteResult>;

  /**
   * Create a directory.
   * @param path the path of the directory to create
   * @param directory the FilesystemDirectory where the new directory will live under
   * @param createIntermediateDirectories whether to create missing parent directories
   */
  mkdir(path: string, directory: FilesystemDirectory, createIntermediateDirectories: boolean) : Promise<MkdirResult>;

  /**
   * Remove a directory
   * @param path the path of directory to remove
   * @param directory the FilesystemDirectory to remove the directory under
   */
  rmdir(path: string, directory: FilesystemDirectory) : Promise<RmdirResult>;

  /**
   * Return a list of files from the directory (not recursive)
   * @param path the directory path to read
   * @param directory the FilesystemDirectory to read the directory under
   */
  readdir(path: string, directory: FilesystemDirectory) : Promise<ReaddirResult>;

  /**
   * Return data about a file
   * @param path the path of the file
   * @param directory the FilesystemDirectory where the file lives
   */
  stat(path: string, directory: FilesystemDirectory) : Promise<StatResult>;
}

export enum FilesystemDirectory {
  Application = 'APPLICATION',
  Documents = 'DOCUMENTS',
  Data = 'DATA',
  Cache = 'CACHE',
  External = 'EXTERNAL', // Android only
  ExternalStorage = 'EXTERNAL_STORAGE' // Android only
}

export interface FileReadResult {
  data: string;
}
export interface FileDeleteResult {
}
export interface FileWriteResult {
}
export interface FileAppendResult {
}
export interface MkdirResult {
}
export interface RmdirResult {
}
export interface ReaddirResult {
  files: string[];
}
export interface StatResult {
  type: string;
  size: number;
  ctime: number;
  mtime: number;
}

//

export interface GeolocationPlugin {
  getCurrentPosition(options?: GeolocationOptions): Promise<GeolocationPositon>;
  watchPosition(options: GeolocationOptions, callback: GeolocationWatchCallback) : void;
}
export interface GeolocationPositon {
  coords: {
    latitude: number;
    longitude: number;
  };
}
export interface GeolocationOptions {
  
}

export type GeolocationWatchCallback = (err: any, position: GeolocationPositon) => void;

//

export interface HapticsPlugin {
  impact(options: HapticsImpactOptions) : void;
  vibrate() : void;
  selectionStart() : void;
  selectionChanged() : void;
  selectionEnd() : void;
}

export interface HapticsImpactOptions {
  style: HapticsImpactStyle;
}

export enum HapticsImpactStyle {
  Heavy = 'HEAVY',
  Medium = 'MEDIUM',
  Light = 'LIGHT'
}

export interface VibrateOptions {
  duration?: number;
}

//

export interface KeyboardPlugin {
  show(): Promise<void>;
  hide(): Promise<void>;
  setAccessoryBarVisible(isVisible: boolean): Promise<void>;
}

//

export interface LocalNotificationsPlugin {
  schedule(notification: LocalNotification) : Promise<void>;
}
export interface NotificationScheduleAt {
  month?: number;
  day?: number;
  year?: number;
  hour?: number;
  minute?: number;
  second?: number;
}

export interface LocalNotification {
  title: string;
  body: string;
  identifier: string;
  scheduleAt?: NotificationScheduleAt;
}

//

export interface ModalsPlugin {
  alert(options: {
          title: string,
          message: string,
          buttonTitle?: string
        }): Promise<void>;

  prompt(options: {
          title: string,
          message: string,
          okButtonTitle?: string,
          cancelButtonTitle?: string,
          inputPlaceholder?: string
        }): Promise<PromptResult>;

  confirm(options: {
            title: string,
            message: string,
            okButtonTitle?: string,
            cancelButtonTitle?: string
          }): Promise<ConfirmResult>;
}

export interface PromptResult {
  value: string;
  cancelled: boolean;
}

export interface ConfirmResult {
  value: boolean;
}

//

export interface MotionPlugin {
  watchAccel(callback: MotionWatchAccelCallback) : void;
}

export interface MotionAccel {
  x: number;
  y: number;
  z: number;
}

export type MotionWatchAccelCallback = (err: any, accel: MotionAccel) => void;

//

export interface NetworkPlugin {
  getStatus(): Promise<NetworkStatus>;
  onStatusChange(callback: NetworkStatusChangeCallback): void;
}

export interface NetworkStatus {
  connected: boolean;
  connectionType: string;
}

export type NetworkStatusChangeCallback = (err: any, status: NetworkStatus) => void;

//

export interface SplashScreenPlugin {
  show(options?: SplashScreenShowOptions, callback?: Function) : void;
  hide(options?: SplashScreenHideOptions, callback?: Function) : void;
}

export interface SplashScreenShowOptions {
  autoHide?: boolean;
  fadeInDuration?: number;
  fadeOutDuration?: number;
  showDuration?: number;
}

export interface SplashScreenHideOptions {
  fadeOutDuration?: number;
}

//

export interface StatusBarPlugin {
  
  setStyle(options: { style: StatusBarStyle }, callback: PluginCallback) : void;

  show() : Promise<void>;

  hide() : Promise<void>;
}

export enum StatusBarStyle {
  Dark = 'DARK',
  Light = 'LIGHT'
}