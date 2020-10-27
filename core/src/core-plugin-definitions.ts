/* eslint-disable */
import { Plugin, PluginListenerHandle } from './definitions';

export interface PluginRegistry {
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
   * Event called when an action is performed on a push notification.
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
