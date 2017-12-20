import { Plugin, PluginCallback, PluginListenerHandle } from './definitions';

declare global {
  interface PluginRegistry {
    Accessibility: AccessibilityPlugin;
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
    Photos: PhotosPlugin;
    SplashScreen: SplashScreenPlugin;
    StatusBar: StatusBarPlugin;
  }
}

export type ISODateString = string;

//

export interface AccessibilityPlugin {
  isScreenReaderEnabled(): Promise<ScreenReaderEnabledResult>;
  speak(value: string): Promise<void>;
  onScreenReaderStateChange(cb: ScreenReaderStateChangeCallback): void;
}
export interface ScreenReaderEnabledResult {
  value: boolean;
}
export type ScreenReaderStateChangeCallback = (err: any, state: ScreenReaderEnabledResult) => void;

//

export interface ActionSheetPlugin extends Plugin {
  show(): Promise<void>;
  hide(): Promise<void>;
}

//

export interface BatteryPlugin extends Plugin {
}

//

export interface BrowserPlugin extends Plugin {
  open(url: string): Promise<any>;
  close(options: any): Promise<any>;
}

//

export interface CameraPlugin extends Plugin {
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

export interface ClipboardPlugin extends Plugin {
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

export interface DevicePlugin extends Plugin {
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

export interface FilesystemPlugin extends Plugin {

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

export interface GeolocationPlugin extends Plugin {
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

export interface HapticsPlugin extends Plugin {
  impact(options: HapticsImpactOptions): void;
  vibrate(): void;
  selectionStart(): void;
  selectionChanged(): void;
  selectionEnd(): void;
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

export interface KeyboardPlugin extends Plugin {
  show(): Promise<void>;
  hide(): Promise<void>;
  setAccessoryBarVisible(isVisible: boolean): Promise<void>;
}

//

export interface LocalNotificationPending {
  id: string;
}

export interface LocalNotificationPendingList {
  notiifcations: LocalNotificationPending[];
}

export interface LocalNotificationScheduleResult extends LocalNotificationPendingList {
}

export interface LocalNotificationsPlugin extends Plugin {
  schedule(options: { notifications: LocalNotification[] }): Promise<LocalNotificationScheduleResult>;
  getPending(): Promise<LocalNotificationPendingList>;
  cancel(pending: LocalNotificationPendingList): Promise<void>;
}

export interface LocalNotification {
  title: string;
  body: string;
  id: string;
  schedule?: NotificationSchedule;
  actions?: [NotificationAction];
}

export interface NotificationSchedule {
  at?: Date;
  every?: 'year'|'month'|'two-weeks'|'week'|'day'|'hour'|'minute'|'second';
  on?: {
    year?: number;
    month?: number;
    day?: number;
    hour?: number;
    minute?: number;
  }
}

export interface NotificationAction {
  id: string;
  title: string;
}

//

export interface ModalsPlugin extends Plugin {
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

export interface MotionPlugin extends Plugin {
  addListener(eventName: 'accel', listenerFunc: (event: MotionEventResult) => void): PluginListenerHandle;
  addListener(eventName: 'orientation', listenerFunc: (event: MotionOrientationEventResult) => void): PluginListenerHandle;
}

export type MotionWatchOrientationCallback = (err: any, accel: MotionOrientationEventResult) => void;
export type MotionWatchAccelCallback = (err: any, accel: MotionEventResult) => void;

export interface MotionOrientationEventResult {
  alpha: number;
  beta: number;
  gamma: number;
}

export interface MotionEventResult {
  acceleration: {
    x: number;
    y: number;
    z: number;
  },
  accelerationIncludingGravity: {
    x: number;
    y: number;
    z: number;
  },
  rotationRate: {
    alpha: number;
    beta: number;
    gamma: number;
  },
  interval: number;
}


//

export interface NetworkPlugin extends Plugin {
  getStatus(): Promise<NetworkStatus>;
  onStatusChange(callback: NetworkStatusChangeCallback): void;
}

export interface NetworkStatus {
  connected: boolean;
  connectionType: string;
}

export type NetworkStatusChangeCallback = (err: any, status: NetworkStatus) => void;

//

export interface PhotosPlugin extends Plugin {
  getPhotos(): Promise<PhotosResult>;
  saveToPhotos(path: string): Promise<PhotosSaveResult>;
}

export interface PhotosResult {
}
export interface PhotosSaveResult {
  success: boolean;
}

//

export interface SplashScreenPlugin extends Plugin {
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

export interface StatusBarPlugin extends Plugin {
  
  setStyle(options: { style: StatusBarStyle }, callback: PluginCallback) : void;

  show() : Promise<void>;

  hide() : Promise<void>;
}

export enum StatusBarStyle {
  Dark = 'DARK',
  Light = 'LIGHT'
}