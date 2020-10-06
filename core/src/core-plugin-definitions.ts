/* eslint-disable */
import { Plugin, PluginListenerHandle } from './definitions';

export interface PluginRegistry {
  App: AppPlugin;
  BackgroundTask: BackgroundTaskPlugin;
  Geolocation: GeolocationPlugin;
  Keyboard: KeyboardPlugin;
  LocalNotifications: LocalNotificationsPlugin;
  PushNotifications: PushNotificationsPlugin;
  SplashScreen: SplashScreenPlugin;
  WebView: WebViewPlugin;

  [pluginName: string]: {
    [prop: string]: any;
  };
}

export type ISODateString = string;
export type CallbackID = string;

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

export interface AppPlugin extends Plugin {
  /**
   * Force exit the app. This should only be used in conjunction with the `backButton` handler for Android to
   * exit the app when navigation is complete.
   *
   * Ionic handles this itself so you shouldn't need to call this if using Ionic
   */
  exitApp(): never;
  /**
   * Check if an app can be opened with the given URL
   */
  canOpenUrl(options: { url: string }): Promise<{ value: boolean }>;

  /**
   * Open an app with the given URL
   */
  openUrl(options: { url: string }): Promise<{ completed: boolean }>;

  /**
   * Gets the current app state
   */
  getState(): Promise<AppState>;

  /**
   * Get the URL the app was launched with, if any
   */
  getLaunchUrl(): Promise<AppLaunchUrl>;

  /**
   * Listen for changes in the App's active state (whether the app is in the foreground or background)
   */
  addListener(
    eventName: 'appStateChange',
    listenerFunc: (state: AppState) => void,
  ): PluginListenerHandle;

  /**
   * Listen for url open events for the app. This handles both custom URL scheme links as well
   * as URLs your app handles (Universal Links on iOS and App Links on Android)
   */
  addListener(
    eventName: 'appUrlOpen',
    listenerFunc: (data: AppUrlOpen) => void,
  ): PluginListenerHandle;

  /**
   * If the app was launched with previously persisted plugin call data, such as on Android
   * when an activity returns to an app that was closed, this call will return any data
   * the app was launched with, converted into the form of a result from a plugin call.
   */
  addListener(
    eventName: 'appRestoredResult',
    listenerFunc: (data: AppRestoredResult) => void,
  ): PluginListenerHandle;

  /**
   * Listen for the hardware back button event (Android only). Listening for this event will disable the
   * default back button behaviour, so you might want to call `window.history.back()` manually.
   * If you want to close the app, call `App.exitApp()`.
   */
  addListener(
    eventName: 'backButton',
    listenerFunc: (data: BackButtonResult) => void,
  ): PluginListenerHandle;

  /**
   * Remove all native listeners for this plugin
   */
  removeAllListeners(): void;
}

export interface BackButtonResult {}

export interface AppState {
  isActive: boolean;
}

export interface AppUrlOpen {
  /**
   * The URL the app was opened with
   */
  url: string;

  /**
   * The source application opening the app (iOS only)
   * https://developer.apple.com/documentation/uikit/uiapplicationopenurloptionskey/1623128-sourceapplication
   */
  iosSourceApplication?: any;
  /**
   * Whether the app should open the passed document in-place
   * or must copy it first.
   * https://developer.apple.com/documentation/uikit/uiapplicationopenurloptionskey/1623123-openinplace
   */
  iosOpenInPlace?: boolean;
}

export interface AppLaunchUrl {
  url: string;
}

export interface AppRestoredResult {
  /**
   * The pluginId this result corresponds to. For example, `Camera`.
   */
  pluginId: string;
  /**
   * The methodName this result corresponds to. For example, `getPhoto`
   */
  methodName: string;
  /**
   * The result data passed from the plugin. This would be the result you'd
   * expect from normally calling the plugin method. For example, `CameraPhoto`
   */
  data?: any;
  /**
   * Boolean indicating if the plugin call succeeded
   */
  success: boolean;
  /**
   * If the plugin call didn't succeed, it will contain the error message
   */
  error?: {
    message: string;
  };
}

//

export interface BackgroundTaskPlugin extends Plugin {
  /**
   * When the app is backgrounded, this method allows you to run a short-lived
   * background task that will ensure that you
   * can finish any work your app needs to do (such as finishing an upload
   * or network request). This is especially important on iOS as any operations
   * would normally be suspended without initiating a background task.
   *
   * This method should finish in less than 3 minutes or your app risks
   * being terminated by the OS.
   *
   * When you are finished, this callback _must_ call `BackgroundTask.finish({ taskId })`
   * where `taskId` is the value returned from `BackgroundTask.beforeExit()`
   * @param cb the task to run when the app is backgrounded but before it is terminated
   */
  beforeExit(cb: Function): CallbackID;

  /**
   * Notify the OS that the given task is finished and the OS can continue
   * backgrounding the app.
   */
  finish(options: { taskId: CallbackID }): void;
}

//

export interface GeolocationPlugin extends Plugin {
  /**
   * Get the current GPS location of the device
   */
  getCurrentPosition(
    options?: GeolocationOptions,
  ): Promise<GeolocationPosition>;
  /**
   * Set up a watch for location changes. Note that watching for location changes
   * can consume a large amount of energy. Be smart about listening only when you need to.
   */
  watchPosition(
    options: GeolocationOptions,
    callback: GeolocationWatchCallback,
  ): CallbackID;

  /**
   * Clear a given watch
   */
  clearWatch(options: { id: string }): Promise<void>;
}

export interface GeolocationPosition {
  /**
   * Creation timestamp for coords
   */
  timestamp: number;
  /**
   * The GPS coordinates along with the accuracy of the data
   */
  coords: {
    /**
     * Latitude in decimal degrees
     */
    latitude: number;
    /**
     * longitude in decimal degrees
     */
    longitude: number;
    /**
     * Accuracy level of the latitude and longitude coordinates in meters
     */
    accuracy: number;
    /**
     * Accuracy level of the altitude coordinate in meters (if available)
     */
    altitudeAccuracy?: number;
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
  enableHighAccuracy?: boolean; // default: false
  timeout?: number; // default: 10000
  maximumAge?: number; // default: 0
}

export type GeolocationWatchCallback = (
  position: GeolocationPosition,
  err?: any,
) => void;

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
  /**
   * Programmatically enable or disable the WebView scroll
   */
  setScroll(options: { isDisabled: boolean }): Promise<void>;
  /**
   * Programmatically set the keyboard style
   */
  setStyle(options: KeyboardStyleOptions): Promise<void>;
  /**
   * Programmatically set the resize mode
   */
  setResizeMode(options: KeyboardResizeOptions): Promise<void>;

  addListener(
    eventName: 'keyboardWillShow',
    listenerFunc: (info: KeyboardInfo) => void,
  ): PluginListenerHandle;
  addListener(
    eventName: 'keyboardDidShow',
    listenerFunc: (info: KeyboardInfo) => void,
  ): PluginListenerHandle;
  addListener(
    eventName: 'keyboardWillHide',
    listenerFunc: () => void,
  ): PluginListenerHandle;
  addListener(
    eventName: 'keyboardDidHide',
    listenerFunc: () => void,
  ): PluginListenerHandle;

  /**
   * Remove all native listeners for this plugin
   */
  removeAllListeners(): void;
}

export interface KeyboardInfo {
  keyboardHeight: number;
}

export interface KeyboardStyleOptions {
  style: KeyboardStyle;
}

export enum KeyboardStyle {
  Dark = 'DARK',
  Light = 'LIGHT',
}

export interface KeyboardResizeOptions {
  mode: KeyboardResize;
}

export enum KeyboardResize {
  Body = 'body',
  Ionic = 'ionic',
  Native = 'native',
  None = 'none',
}

//

export interface LocalNotificationRequest {
  id: string;
}

export interface LocalNotificationPendingList {
  notifications: LocalNotificationRequest[];
}

export type LocalNotificationScheduleResult = LocalNotificationPendingList;

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
  id: number;
  schedule?: LocalNotificationSchedule;
  /**
   * Name of the audio file with extension.
   * On iOS the file should be in the app bundle.
   * On Android the file should be on res/raw folder.
   * Doesn't work on Android version 26+ (Android O and newer), for
   * Recommended format is .wav because is supported by both platforms.
   */
  sound?: string;
  /**
   * Android-only: set a custom statusbar icon.
   * If set, it overrides default icon from capacitor.config.json
   */
  smallIcon?: string;
  /**
   * Android only: set the color of the notification icon
   */
  iconColor?: string;
  attachments?: LocalNotificationAttachment[];
  actionTypeId?: string;
  extra?: any;
  /**
   * iOS only: set the thread identifier for notification grouping
   */
  threadIdentifier?: string;
  /**
   * iOS 12+ only: set the summary argument for notification grouping
   */
  summaryArgument?: string;
  /**
   * Android only: set the group identifier for notification grouping, like
   * threadIdentifier on iOS.
   */
  group?: string;
  /**
   * Android only: designate this notification as the summary for a group
   * (should be used with the `group` property).
   */
  groupSummary?: boolean;
  /**
   * Android only: set the notification channel on which local notification
   * will generate. If channel with the given name does not exist then the
   * notification will not fire. If not provided, it will use the default channel.
   */
  channelId?: string;
  /**
   * Android only: set the notification ongoing.
   * If set to true the notification can't be swiped away.
   */
  ongoing?: boolean;
  /**
   * Android only: set the notification to be removed automatically when the user clicks on it
   */
  autoCancel?: boolean;
}

export interface LocalNotificationSchedule {
  at?: Date;
  repeats?: boolean;
  every?:
    | 'year'
    | 'month'
    | 'two-weeks'
    | 'week'
    | 'day'
    | 'hour'
    | 'minute'
    | 'second';
  count?: number;
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
  notification: LocalNotification;
}

export interface LocalNotificationEnabledResult {
  /**
   * Whether the device has Local Notifications enabled or not
   */
  value: boolean;
}

export interface NotificationPermissionResponse {
  granted: boolean;
}

export interface LocalNotificationsPlugin extends Plugin {
  schedule(options: {
    notifications: LocalNotification[];
  }): Promise<LocalNotificationScheduleResult>;
  getPending(): Promise<LocalNotificationPendingList>;
  registerActionTypes(options: {
    types: LocalNotificationActionType[];
  }): Promise<void>;
  cancel(pending: LocalNotificationPendingList): Promise<void>;
  areEnabled(): Promise<LocalNotificationEnabledResult>;
  createChannel(channel: NotificationChannel): Promise<void>;
  deleteChannel(channel: NotificationChannel): Promise<void>;
  listChannels(): Promise<NotificationChannelList>;
  requestPermission(): Promise<NotificationPermissionResponse>;
  addListener(
    eventName: 'localNotificationReceived',
    listenerFunc: (notification: LocalNotification) => void,
  ): PluginListenerHandle;
  addListener(
    eventName: 'localNotificationActionPerformed',
    listenerFunc: (
      notificationAction: LocalNotificationActionPerformed,
    ) => void,
  ): PluginListenerHandle;

  /**
   * Remove all native listeners for this plugin
   */
  removeAllListeners(): void;
}

//

export interface PushNotification {
  title?: string;
  subtitle?: string;
  body?: string;
  id: string;
  badge?: number;
  notification?: any;
  data: any;
  click_action?: string;
  link?: string;
  /**
   * Android only: set the group identifier for notification grouping, like
   * threadIdentifier on iOS.
   */
  group?: string;
  /**
   * Android only: designate this notification as the summary for a group
   * (should be used with the `group` property).
   */
  groupSummary?: boolean;
}

export interface PushNotificationActionPerformed {
  actionId: string;
  inputValue?: string;
  notification: PushNotification;
}

export interface PushNotificationToken {
  value: string;
}

export interface PushNotificationDeliveredList {
  notifications: PushNotification[];
}

export interface NotificationChannel {
  id: string;
  name: string;
  description?: string;
  sound?: string;
  importance: 1 | 2 | 3 | 4 | 5;
  visibility?: -1 | 0 | 1;
  lights?: boolean;
  lightColor?: string;
  vibration?: boolean;
}

export interface NotificationChannelList {
  channels: NotificationChannel[];
}

export interface PushNotificationsPlugin extends Plugin {
  /**
   * Register the app to receive push notifications.
   * Will trigger registration event with the push token
   * or registrationError if there was some problem.
   * Doesn't prompt the user for notification permissions, use requestPermission() first.
   */
  register(): Promise<void>;
  /**
   * On iOS it prompts the user to allow displaying notifications
   * and return if the permission was granted or not.
   * On Android there is no such prompt, so just return as granted.
   */
  requestPermission(): Promise<NotificationPermissionResponse>;
  /**
   * Returns the notifications that are visible on the notifications screen.
   */
  getDeliveredNotifications(): Promise<PushNotificationDeliveredList>;
  /**
   * Removes the specified notifications from the notifications screen.
   * @param delivered list of delivered notifications.
   */
  removeDeliveredNotifications(
    delivered: PushNotificationDeliveredList,
  ): Promise<void>;
  /**
   * Removes all the notifications from the notifications screen.
   */
  removeAllDeliveredNotifications(): Promise<void>;
  /**
   * On Android O or newer (SDK 26+) creates a notification channel.
   * @param channel to create.
   */
  createChannel(channel: NotificationChannel): Promise<void>;
  /**
   * On Android O or newer (SDK 26+) deletes a notification channel.
   * @param channel to delete.
   */
  deleteChannel(channel: NotificationChannel): Promise<void>;
  /**
   * On Android O or newer (SDK 26+) list the available notification channels.
   */
  listChannels(): Promise<NotificationChannelList>;
  /**
   * Event called when the push notification registration finished without problems.
   * Provides the push notification token.
   * @param eventName registration.
   * @param listenerFunc callback with the push token.
   */
  addListener(
    eventName: 'registration',
    listenerFunc: (token: PushNotificationToken) => void,
  ): PluginListenerHandle;
  /**
   * Event called when the push notification registration finished with problems.
   * Provides an error with the registration problem.
   * @param eventName registrationError.
   * @param listenerFunc callback with the registration error.
   */
  addListener(
    eventName: 'registrationError',
    listenerFunc: (error: any) => void,
  ): PluginListenerHandle;
  /**
   * Event called when the device receives a push notification.
   * @param eventName pushNotificationReceived.
   * @param listenerFunc callback with the received notification.
   */
  addListener(
    eventName: 'pushNotificationReceived',
    listenerFunc: (notification: PushNotification) => void,
  ): PluginListenerHandle;
  /**
   * Event called when an action is performed on a pusn notification.
   * @param eventName pushNotificationActionPerformed.
   * @param listenerFunc callback with the notification action.
   */
  addListener(
    eventName: 'pushNotificationActionPerformed',
    listenerFunc: (notification: PushNotificationActionPerformed) => void,
  ): PluginListenerHandle;
  /**
   * Remove all native listeners for this plugin.
   */
  removeAllListeners(): void;
}

//

export interface SplashScreenPlugin extends Plugin {
  /**
   * Show the splash screen
   */
  show(options?: SplashScreenShowOptions, callback?: Function): Promise<void>;
  /**
   * Hide the splash screen
   */
  hide(options?: SplashScreenHideOptions, callback?: Function): Promise<void>;
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
   * How long to show the splash screen when autoHide is enabled (in ms)
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

export interface WebViewPlugin extends Plugin {
  setServerBasePath(options: WebViewPath): Promise<void>;
  getServerBasePath(): Promise<WebViewPath>;
  persistServerBasePath(): Promise<void>;
}

export interface WebViewPath {
  path: string;
}
