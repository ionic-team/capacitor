import { Plugin, PluginListenerHandle } from './definitions';

declare global {
  interface PluginRegistry {
    Accessibility?: AccessibilityPlugin;
    App?: AppPlugin;
    Browser?: BrowserPlugin;
    Camera?: CameraPlugin;
    Clipboard?: ClipboardPlugin;
    Device?: DevicePlugin;
    Filesystem?: FilesystemPlugin;
    Geolocation?: GeolocationPlugin;
    Haptics?: HapticsPlugin;
    Keyboard?: KeyboardPlugin;
    LocalNotifications?: LocalNotificationsPlugin;
    Modals?: ModalsPlugin;
    Motion?: MotionPlugin;
    Network?: NetworkPlugin;
    Photos?: PhotosPlugin;
    SplashScreen?: SplashScreenPlugin;
    StatusBar?: StatusBarPlugin;
  }
}

export type ISODateString = string;

/**
 * CancellableCallback is a simple wrapper that a method will
 * return to make it easy to cancel any repeated callback the method
 * might have set up. For example: a geolocation watch.
 */
export interface CancellableCallback {
  /**
   * The cancel function for this method
   */
  cancel: Function;
}
//

export interface AccessibilityPlugin {
  /**
   * Check if a screen reader is enabled on the device
   */
  isScreenReaderEnabled(): Promise<ScreenReaderEnabledResult>;

  /**
   * Speak a string with a connected screen reader.
   * @param value the string to speak
   */
  speak(options: AccessibilitySpeakOptions): Promise<void>;

  /**
   * Listen for screen reader state change (on/off)
   */
  addListener(eventName: 'accessibilityScreenReaderStateChange', listenerFunc: ScreenReaderStateChangeCallback): PluginListenerHandle;
}

export interface AccessibilitySpeakOptions {
  /**
   * The string to speak
   */
  value: string;
  /**
   * The language to speak the string in, as its [ISO 639-1 Code](https://www.loc.gov/standards/iso639-2/php/code_list.php) (ex: "en").
   * Currently only supported on Android.
   */
  language?: string;
}

export interface ScreenReaderEnabledResult {
  value: boolean;
}
export type ScreenReaderStateChangeCallback = (err: any, state: ScreenReaderEnabledResult) => void;

//

export interface AppPlugin extends Plugin {
  /**
   * Check if an app can be opened with the given URL
   */
  canOpenUrl(options: { url: string }): Promise<{value: boolean}>;

  /**
   * Open an app with the given URL
   */
  openUrl(options: { url: string }): Promise<{completed: boolean}>;

  getLaunchUrl(): Promise<AppLaunchUrl>;

  /**
   * Listen for internal plugin errors if you'd like to have more diagnostics on
   * serious plugin runtime errors.
   */
  addListener(eventName: 'pluginError', listenerFunc: (err: any, info: any) => void): PluginListenerHandle;

  /**
   * Listen for changes in the App's active state (whether the app is in the foreground or background)
   */
  addListener(eventName: 'appStateChange', listenerFunc: (err: any, state: AppState) => void): PluginListenerHandle;

  /**
   * Listen for url open events for the app. This handles both custom URL scheme links as well
   * as URLs your app handles (Universal Links on iOS and App Links on Android)
   */
  addListener(eventName: 'appUrlOpen', listenerFunc: (err: any, data: AppUrlOpen) => void): PluginListenerHandle;
}

export interface AppState {
  isActive: boolean;
}

export interface AppUrlOpen {
  url: string;

  iosSourceApplication?: any;
  iosOpenInPlace?: boolean;
}

export interface AppLaunchUrl {
  url: string;
}

//

export interface BrowserPlugin extends Plugin {
  /**
   * Open a page with the given URL
   */
  open(options: BrowserOpenOptions): Promise<void>;

  /**
   * Hint to the browser that the given URLs will be accessed
   * to improve initial loading times.
   *
   * Only functional on Android, is a no-op on iOS
   */
  prefetch(options: BrowserPrefetchOptions): Promise<void>;

  /**
   * Close an open browser
   */
  close(): Promise<void>;

  addListener(eventName: 'browserFinished', listenerFunc: (err: any, info: any) => void): PluginListenerHandle;
  addListener(eventName: 'browserPageLoaded', listenerFunc: (err: any, info: any) => void): PluginListenerHandle;
}

export interface BrowserOpenOptions {
  /**
   * The URL to open the browser to
   */
  url: string;

  /**
   * A hex color to set the toolbar color to.
   */
  toolbarColor?: string;
}

export interface BrowserPrefetchOptions {
  urls: string[];
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
  /**
   * The quality of image to return as JPEG, from 0-100
   */
  quality?: number;
  /**
   * Whether to allow the user to crop or make small edits (platform specific)
   */
  allowEditing?: boolean;
  /**
   * How the data should be returned. Currently, only base64 is supported
   */
  resultType: 'base64'
  /**
   * Whether to save the photo to the gallery/photostream
   */
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
   * @param options options for the file write
   * @return a promise that resolves with the file write result
   */
  writeFile(options: FileWriteOptions) : Promise<FileWriteResult>;

  /**
   * Append to a file on disk in the specified location on device
   * @param options options for the file append
   * @return a promise that resolves with the file write result
   */
  appendFile(options: FileAppendOptions) : Promise<FileAppendResult>;

  /**
   * Read a file from disk
   * @param options options for the file read
   * @return a promise that resolves with the read file data result
   */
  readFile(options: FileReadOptions) : Promise<FileReadResult>;

  /**
   * Delete a file from disk
   * @param options options for the file delete
   * @return a promise that resolves with the deleted file data result
   */
  deleteFile(options: FileDeleteOptions) : Promise<FileDeleteResult>;

  /**
   * Create a directory.
   * @param options options for the mkdir
   * @return a promise that resolves with the mkdir result
   */
  mkdir(options: MkdirOptions) : Promise<MkdirResult>;

  /**
   * Remove a directory
   * @param options the options for the directory remove
   */
  rmdir(options: RmdirOptions) : Promise<RmdirResult>;

  /**
   * Return a list of files from the directory (not recursive)
   * @param options the options for the readdir operation
   * @return a promise that resolves with the readdir directory listing result
   */
  readdir(options: ReaddirOptions) : Promise<ReaddirResult>;

  /**
   * Return data about a file
   * @param options the options for the stat operation
   * @return a promise that resolves with the file stat result
   */
  stat(options: StatOptions) : Promise<StatResult>;
}

export enum FilesystemDirectory {
  /**
   * The Application directory
   */
  Application = 'APPLICATION',
  /**
   * The Documents directory
   */
  Documents = 'DOCUMENTS',
  /**
   * The Data directory
   */
  Data = 'DATA',
  /**
   * The Cache directory
   */
  Cache = 'CACHE',
  /**
   * The external directory (Android only)
   */
  External = 'EXTERNAL',
  /**
   * The external storage directory (Android only)
   */
  ExternalStorage = 'EXTERNAL_STORAGE'
}

export enum FilesystemEncoding {
  UTF8 = 'utf8',
  ASCII = 'ascii',
  UTF16 = 'utf18'
};

export interface FileWriteOptions {
  /**
   * the filename to write
   */
  path: string;
  /**
   * The data to write
   */
  data: string;
  /**
   * The FilesystemDirectory to store the file in
   */
  directory: FilesystemDirectory;
  /**
   * The encoding to write the file in (defautls to utf8)
   */
  encoding: FilesystemEncoding;
}

export interface FileAppendOptions {
  /**
   * the filename to write
   */
  path: string;
  /**
   * The data to write
   */
  data: string;
  /**
   * The FilesystemDirectory to store the file in
   */
  directory: FilesystemDirectory;
  /**
   * The encoding to write the file in (defautls to utf8)
   */
  encoding: FilesystemEncoding;
}

export interface FileReadOptions {
  /**
   * the filename to read
   */
  path: string;
  /**
   * The FilesystemDirectory to read the file from
   */
  directory: FilesystemDirectory;
  /**
   * The encoding to read the file in (defautls to utf8)
   */
  encoding: FilesystemEncoding;
}

export interface FileDeleteOptions {
  /**
   * the filename to delete
   */
  path: string;
  /**
   * The FilesystemDirectory to delete the file from
   */
  directory: FilesystemDirectory;
}

export interface MkdirOptions {
  /**
   * The path of the new directory
   */
  path: string;
  /**
   * The FilesystemDirectory to make the new directory in
   */
  directory: FilesystemDirectory;
  /**
   * Whether to create any missing parent directories as well
   */
  createIntermediateDirectories: boolean;
}

export interface RmdirOptions {
  /**
   * The path of the directory to remove
   */
  path: string;
  /**
   * The FilesystemDirectory to remove the directory from
   */
  directory: FilesystemDirectory;
}

export interface ReaddirOptions {
  /**
   * The path of the directory to remove
   */
  path: string;
  /**
   * The FilesystemDirectory to remove the directory from
   */
  directory: FilesystemDirectory;
}

export interface StatOptions {
  /**
   * The path of the directory to remove
   */
  path: string;
  /**
   * The FilesystemDirectory to remove the directory from
   */
  directory: FilesystemDirectory;
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
  getCurrentPosition(options?: GeolocationOptions): Promise<GeolocationPosition>;
  /**
   * Set up a watch for location changes. Note that watching for location changes
   * can consume a large amount of energy. Be smart about listening only when you need to.
   */
  watchPosition(options: GeolocationOptions, callback: GeolocationWatchCallback) : void;

  /**
   * Clear a given watch
   */
  /*
  clearWatch(options: { id: string }): Promise<void>;
  */
}

export interface GeolocationPosition {
  /**
   * The GPS coordinates along with the accuracy of the data
   */
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number;
    /**
     * The altitude the user is at (if available)
     */
    altitude?: number;
    /**
     * The speed the user is traveling (if available)
     */
    speed?: number;
    /**
     * The heading the user is facing (if available)
     */
    heading?: number;
  };
}

export interface GeolocationOptions {
  enableHighAccuracy?: boolean, // default: false
  timeout?: number, // default: 10000,
  maximumAge?: number // default: 0
  /**
   * Whether your app needs altitude data or not. This can impact the
   * sensor the device uses, increasing energy consumption.
   * Note: altitude information may not be available even when 
   * passing true here. Similarly, altitude data maybe be returned
   * even if this value is false, in the case where doing so requires
   * no increased energy consumption.
   * 
   * Default: false
   */
  requireAltitude?: boolean, // default: false
}

export type GeolocationWatchCallback = (err: any, position: GeolocationPosition) => void;

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
  setAccessoryBarVisible(options: { isVisible: boolean }): Promise<void>;
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
  };
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
  /**
   * Show an alert modal
   */
  alert(options: AlertOptions): Promise<void>;
  /**
   * Show a prompt modal
   */
  prompt(options: PromptOptions): Promise<PromptResult>;
  /**
   * Show a confirmation modal
   */
  confirm(options: ConfirmOptions): Promise<ConfirmResult>;

  /**
   * Show an Action Sheet style modal with various options for the user
   * to select.
   */
  showActions(options: ActionSheetOptions): Promise<ActionSheetResult>;
   
  /**
   * Show a Share modal for sharing content in your app with other apps
   */
  showSharing(options: any): Promise<any>;
}

export interface AlertOptions {
  title: string,
  message: string,
  buttonTitle?: string
}

export interface PromptOptions {
  title: string,
  message: string,
  okButtonTitle?: string,
  cancelButtonTitle?: string,
  inputPlaceholder?: string
}

export interface ConfirmOptions {
  title: string,
  message: string,
  okButtonTitle?: string,
  cancelButtonTitle?: string
}

export interface PromptResult {
  value: string;
  cancelled: boolean;
}

export interface ConfirmResult {
  value: boolean;
}

export interface ActionSheetOptions {
  title: string;
  message?: string;
  options: ActionSheetOption[];
}

export enum ActionSheetOptionStyle {
  Default = 'DEFAULT',
  Destructive = 'DESTRUCTIVE'
};
export interface ActionSheetOption {
  title: string;
  style?: ActionSheetOptionStyle
}

export interface ActionSheetResult {
  option: ActionSheetOption;
}

export interface ShareSheetOptions {
  message?: string;
  url?: string;
  subject?: string;
}

//

export interface MotionPlugin extends Plugin {
  /**
   * Listen for accelerometer data
   */
  addListener(eventName: 'accel', listenerFunc: (event: MotionEventResult) => void): PluginListenerHandle;
  /**
   * Listen for device orientation change (compass heading, etc.)
   */
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
  /**
   * Query the current network status
   */
  getStatus(): Promise<NetworkStatus>;

  /**
   * Listen for network status change events
   */
  addListener(eventName: 'networkStatusChange', listenerFunc: (err: any, status: NetworkStatus) => void): PluginListenerHandle;
}

export interface NetworkStatus {
  connected: boolean;
  connectionType: 'wifi' | 'cellular' | 'none';
}

export type NetworkStatusChangeCallback = (err: any, status: NetworkStatus) => void;

//

export interface PhotosPlugin extends Plugin {
  /**
   * Get photos from the user's photo library
   */
  getPhotos(options?: PhotosFetchOptions): Promise<PhotosResult>;
  /**
   * Get albums from the user's photo library
   */
  getAlbums(options?: PhotosAlbumsFetchOptions): Promise<PhotosAlbumsResult>;
  /**
   * Save a photo the the user's photo library
   */
  savePhoto(options?: PhotosSaveOptions): Promise<PhotosSaveResult>;
  /**
   * Create an album in the user's photo library
   */
  createAlbum(options: PhotosCreateAlbumOptions): Promise<void>;
}

export interface PhotosFetchOptions {
  /**
   * The number of photos to fetch, sorted by last created date descending
   */
  quantity?: number;
  /**
   * The width of thumbnail to return
   */
  thumbnailWidth?: number;
  /**
   * The height of thumbnail to return
   */
  thumbnailHeight?: number;
  /**
   * The quality of thumbnail to return as JPEG (0-100)
   */
  thumbnailQuality?: number;
  /**
   * Which types of assets to return (currently only supports "photos")
   */
  types?: string;
  /**
   * Which album identifier to query in (get identifier with getAlbums())
   */
  albumIdentifier?: string;
}

export interface PhotoAsset {
  /**
   * Platform-specific identifier
   */
  identifier: string;
  /**
   * Data for a photo asset as a base64 encoded string (JPEG only supported)
   */
  data: string;
  /**
   * ISO date string for creation date of asset
   */
  creationDate: string;
  /**
   * Full width of original asset
   */
  fullWidth: number;
  /**
   * Full height of original asset
   */
  fullHeight: number;
  /**
   * Width of thumbnail preview
   */
  thumbnailWidth: number;
  /**
   * Height of thumbnail preview
   */
  thumbnailHeight: number;
  /**
   * Location metadata for the asset
   */
  location: PhotoLocation;
}

export interface PhotoLocation {
  /**
   * GPS latitude image was taken at
   */
  latitude: number;
  /**
   * GPS longitude image was taken at
   */
  longitude: number;
  /**
   * Heading of user at time image was taken
   */
  heading: number;
  /**
   * Altitude of user at time image was taken
   */
  altitude: number;
  /**
   * Speed of user at time image was taken
   */
  speed: number;
}

export interface PhotosResult {
  /**
   * The list of photos returned from the library
   */
  photos: PhotoAsset[];
}

export interface PhotosSaveOptions {
  /**
   * The base64-encoded JPEG data for a photo (note: do not add HTML data-uri type prefix)
   */
  data: string;
  /**
   * The optional album identifier to save this photo in
   */
  albumIdentifier?: string;
}

export interface PhotosSaveResult {
  /**
   * Whether the photo was created
   */
  success: boolean;
}

export interface PhotosAlbumsFetchOptions {
  /**
   * Whether to load cloud shared albums
   */
  loadShared: boolean;
}
export interface PhotosAlbumsResult {
  /**
   * The list of albums returned from the query
   */
  albums: PhotosAlbum[];
}
export interface PhotosAlbum {
  /**
   * Local identifier for the album
   */
  identifier: string;
  /**
   * Name of the album
   */
  name: string;
  /** 
   * Number of items in the album
   */
  count: number;
  /**
   * The type of album
   */
  type: PhotosAlbumType;
}

export interface PhotosCreateAlbumOptions {
  name: string;
}

export enum PhotosAlbumType {
  /**
   * Album is a "smart" album (such as Favorites or Recently Added)
   */
  Smart = 'smart',
  /**
   * Album is a cloud-shared album
   */
  Shared = 'shared',
  /**
   * Album is a user-created album
   */
  User = 'user'
}

//

export interface SplashScreenPlugin extends Plugin {
  /**
   * Show the splash screen
   */
  show(options?: SplashScreenShowOptions, callback?: Function) : void;
  /**
   * Hide the splash screen
   */
  hide(options?: SplashScreenHideOptions, callback?: Function) : void;
}

export interface SplashScreenShowOptions {
  /**
   * Whether to auto hide the splash after showDuration
   */
  autoHide?: boolean;
  /**
   * How long (in ms) to fade in. Default is 200ms
   */
  fadeInDuration?: number;
  /**
   * How long (in ms) to fade out. Default is 200ms
   */
  fadeOutDuration?: number;
  /**
  * How long to show the splash screen when authHide is enabled (in ms)
  * Default is 3000ms
  */
  showDuration?: number;
}

export interface SplashScreenHideOptions {
  /**
   * How long (in ms) to fade out. Default is 200ms
   */
  fadeOutDuration?: number;
}

//

export interface StatusBarPlugin extends Plugin {
  /**
   *  Set the current style of the status bar
   */
  setStyle(options: StatusBarStyleOptions): Promise<void>;
  /**
   * Show the status bar
   */
  show() : Promise<void>;
  /**
   *  Hide the status bar
   */
  hide() : Promise<void>;
}

export interface StatusBarStyleOptions {
  style: StatusBarStyle;
}

export enum StatusBarStyle {
  Dark = 'DARK',
  Light = 'LIGHT'
}