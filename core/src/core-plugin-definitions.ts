import { Plugin, PluginCallback, PluginListenerHandle } from './definitions';

declare global {
  interface PluginRegistry {
    Accessibility: AccessibilityPlugin;
    AppState: AppStatePlugin;
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
  /**
   * Check if a screen reader is enabled on the device
   */
  isScreenReaderEnabled(): Promise<ScreenReaderEnabledResult>;

  /**
   * Speak a string with a connected screen reader.
   */
  speak(value: string): Promise<void>;

  /**
   * Listen for screen reader state change (on/off)
   */
  addListener(eventName: 'accessibilityScreenReaderStateChange', listenerFunc: ScreenReaderStateChangeCallback): PluginListenerHandle;
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

export interface AppStatePlugin extends Plugin {
  /**
   * Listen for internal plugin errors if you'd like to have more diagnostics on
   * serious plugin runtime errors.
   */
  addListener(eventName: 'pluginError', listenerFunc: (err: any, info: any) => void): PluginListenerHandle;

  /**
   * Listen for changes in the App's active state (whether the app is in the foreground or background)
   */
  addListener(eventName: 'appStateChanged', listenerFunc: (err: any, state: AppStateState) => void): PluginListenerHandle;
}

export interface AppStateState {
  isActive: boolean;
}

//

export interface BrowserPlugin extends Plugin {
  /**
   * Open a page with the given URL
   */
  open(url: string): Promise<void>;

  /**
   * Close an open browser
   */
  close(): Promise<void>;

  addListener(eventName: 'browserFinished', listenerFunc: (err: any, info: any) => void): PluginListenerHandle;
  addListener(eventName: 'browserPageLoaded', listenerFunc: (err: any, info: any) => void): PluginListenerHandle;
}

//

export interface CameraPlugin extends Plugin {
  /**
   * Prompt the user to pick a photo from an album, or take a new photo
   * with the camera.
   */
  getPhoto(options: CameraOptions): Promise<CameraPhoto>;
}

export interface CameraOptions {
  // The quality of image to return as JPEG, from 0-100
  quality?: number;
  // Whether to allow the user to crop or make small edits (platform specific)
  allowEditing?: boolean;
  // How the data should be returned. Currently, only base64 is supported
  resultType: 'base64'
  // Whether to save the photo to the gallery/photostream
  saveToGallery?: boolean;
}

export interface CameraPhoto {
  base64_data: string;
  format: string;
}

//

export interface ClipboardPlugin extends Plugin {
  /**
   * Set a value on the clipboard (the "copy" action)
   */
  set(options: ClipboardSet): Promise<void>;
  /**
   * Get a value from the clipboard (the "paste" action)
   */
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
  /**
   * Return information about the underlying device/os/platform
   */
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
  /**
   * Get the current GPS location of the device
   */
  getCurrentPosition(options?: GeolocationOptions): Promise<GeolocationPositon>;
  /**
   * Set up a watch for location changes.
   */
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
  /**
   * Trigger a haptics "impact" feedback
   */
  impact(options: HapticsImpactOptions): void;
  /**
   * Vibrate the device
   */
  vibrate(): void;
  /**
   * Trigger a selection started haptic hint
   */
  selectionStart(): void;
  /**
   * Trigger a selection changed haptic hint. If a selection was
   * started already, this will cause the device to provide haptic
   * feedback (on iOS at least)
   */
  selectionChanged(): void;
  /**
   * If selectionStart() was called, selectionEnd() ends the selection.
   * For example, call this when a user has lifted their finger from a control
   */
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
  /**
   * Show the keyboard. This method is alpha and may have issues
   */
  show(): Promise<void>;
  /**
   * Hide the keyboard.
   */
  hide(): Promise<void>;
  /**
   * Set whether the accessory bar should be visible on the keyboard. We recommend disabling
   * the accessory bar for short forms (login, signup, etc.) to provide a cleaner UI
   */
  setAccessoryBarVisible(isVisible: boolean): Promise<void>;
}

//

export interface LocalNotificationRequest {
  id: string;
  options: any;
}

export interface LocalNotificationPendingList {
  notifications: LocalNotificationRequest[];
}

export interface LocalNotificationScheduleResult extends LocalNotificationPendingList {
}

export interface LocalNotificationActionType {
  id: string;
  actions?: LocalNotificationAction[];
  iosHiddenPreviewsBodyPlaceholder?: string; // >= iOS 11 only
  iosCustomDismissAction?: boolean;
  iosAllowInCarPlay?: boolean;
  iosHiddenPreviewsShowTitle?: boolean; // >= iOS 11 only
  iosHiddenPreviewsShowSubtitle?: boolean; // >= iOS 11 only
}

export interface LocalNotificationAction {
  id: string;
  title: string;
  requiresAuthentication?: boolean;
  foreground?: boolean;
  destructive?: boolean;
  input?: boolean;
  inputButtonTitle?: string;
  inputPlaceholder?: string;
}

export interface LocalNotificationAttachment {
  id: string;
  url: string;
  options?: LocalNotificationAttachmentOptions;
}

export interface LocalNotificationAttachmentOptions {
  iosUNNotificationAttachmentOptionsTypeHintKey?: string;
  iosUNNotificationAttachmentOptionsThumbnailHiddenKey?: string; 
  iosUNNotificationAttachmentOptionsThumbnailClippingRectKey?: string;
  iosUNNotificationAttachmentOptionsThumbnailTimeKey?: string;
}

export interface LocalNotification {
  title: string;
  body: string;
  id: string;
  schedule?: LocalNotificationSchedule;
  sound?: string;
  attachments?: LocalNotificationAttachment[];
  actionTypeId?: string;
  extra?: any;
}

export interface LocalNotificationSchedule {
  at?: Date;
  repeats?: boolean;
  every?: 'year'|'month'|'two-weeks'|'week'|'day'|'hour'|'minute'|'second';
  on?: {
    year?: number;
    month?: number;
    day?: number;
    hour?: number;
    minute?: number;
  }
}

export interface LocalNotificationActionPerformed {
  actionId: string;
  inputValue?: string;
  notificationRequest: any;
}

export interface LocalNotificationsPlugin extends Plugin {
  schedule(options: { notifications: LocalNotification[] }): Promise<LocalNotificationScheduleResult>;
  getPending(): Promise<LocalNotificationPendingList>;
  registerActionTypes(options: { types: LocalNotificationActionType[] }): Promise<void>;
  cancel(pending: LocalNotificationPendingList): Promise<void>;
  addListener(eventName: 'localNotificationReceived', listenerFunc: (err: any, notification: LocalNotification) => void): PluginListenerHandle;
  addListener(eventName: 'localNotificationActionPerformed', listenerFunc: (err: any, notification: LocalNotificationActionPerformed) => void): PluginListenerHandle;
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
  };
  accelerationIncludingGravity: {
    x: number;
    y: number;
    z: number;
  };
  rotationRate: {
    alpha: number;
    beta: number;
    gamma: number;
  };
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
  getPhotos(options?: PhotosFetchOptions): Promise<PhotosResult>;
  getAlbums(options?: PhotosAlbumsFetchOptions): Promise<PhotosAlbumsResult>;
  savePhoto(options?: PhotosSaveOptions): Promise<PhotosSaveResult>;
  createAlbum(options: PhotosCreateAlbumOptions): Promise<void>;
}

export interface PhotosFetchOptions {
  quantity?: number;
  thumbnailWidth?: number;
  thumbnailHeight?: number;
  thumbnailQuality?: number;
  types?: string;
  albumIdentifier?: string;
}

export interface PhotoAsset {
  // Platform-specific identifier
  identifier: string;
  data: string;
  creationDate: string;
  fullWidth: number;
  fullHeight: number;
  thumbnailWidth: number;
  thumbnailHeight: number;
  location: PhotoLocation;
}

export interface PhotoLocation {
  latitude: number;
  longitude: number;
  heading: number;
  altitude: number;
  speed: number;
}

export interface PhotosResult {
  photos: PhotoAsset[];
}

export interface PhotosSaveOptions {
  data: string;
  albumIdentifier?: string;
}

export interface PhotosSaveResult {
  success: boolean;
}

export interface PhotosAlbumsFetchOptions {
  // Whether to load cloud shared albums
  loadShared: boolean;
}
export interface PhotosAlbumsResult {
  albums: PhotosAlbum[];
}
export interface PhotosAlbum {
  identifier: string;
  name: string;
  count: number;
  type: string;
}

export interface PhotosCreateAlbumOptions {
  name: string;
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