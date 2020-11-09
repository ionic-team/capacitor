export interface CapacitorPluginClassConfig {
  Keyboard?: {
    /**
     * Configure the way the app is resized when the Keyboard appears.
     *
     * @since 1.0.0
     * @default native
     */
    resize?: 'none' | 'native' | 'body' | 'ionic';

    /**
     * Use the dark style keyboard instead of the regular one.
     *
     * @since 1.0.0
     */
    style?: 'dark';
  };

  LocalNotifications?: {
    /**
     * Set the default icon for the local notification.
     *
     * @since 1.0.0
     */
    smallIcon?: string;

    /**
     * Set the default color for local notification icons.
     *
     * @since 1.0.0
     */
    iconColor?: string;

    /**
     * Set the default notification sound on Android.
     *
     * On Android 26+ it sets the default channel sound and can't be
     * changed unless the app is uninstalled.
     *
     * @since 1.0.0
     */
    sound?: string;
  };

  PushNotifications?: {
    /**
     * Configure the way notifications are displayed when the app is in foreground on iOS.
     *
     * Provide an array of strings that you combine to configure what
     * happens when push notifications arrive while the app is in the
     * foreground.
     *
     * An empty Array can be provided if none of the previous options are
     * desired.
     *
     * @since 1.0.0
     * @default ['badge']
     */
    presentationOptions?: ('badge' | 'sound' | 'alert')[];
  };

  SplashScreen?: {
    /**
     * Set a duration in milliseconds for which the splash screen is shown.
     *
     * For best results, this should be set to `0` and then the splash
     * screen should be programmatically hidden using `hide()` whenever
     * your app is fully bootstrapped.
     *
     * @since 1.0.0
     * @default 3000
     */
    launchShowDuration?: number;

    /**
     * Automatically hide the splash screen.
     *
     * Set to `false` to make sure the splash never hides before the app
     * is fully loaded.
     *
     * @since 1.0.0
     * @default true
     */
    launchAutoHide?: boolean;

    /**
     * Show a spinner on the splash screen.
     *
     * @since 1.0.0
     * @default false
     */
    showSpinner?: boolean;

    /**
     * Customize the appearance of the spinner on Android.
     *
     * @since 1.0.0
     * @default large
     */
    androidSpinnerStyle?:
      | 'horizontal'
      | 'small'
      | 'large'
      | 'inverse'
      | 'smallInverse'
      | 'largeInverse';

    /**
     * Customize the appearance of the spinner on iOS.
     *
     * @since 1.0.0
     * @default large
     */
    iosSpinnerStyle?: 'small' | 'large';

    /**
     * Set the color of the spinner.
     *
     * Use #RRGGBB or #AARRGGBB format.
     *
     * @since 1.0.0
     */
    spinnerColor?: string;

    /**
     * Set the background color of the splash screen.
     *
     * Use #RRGGBB or #AARRGGBB format.
     *
     * @since 1.0.0
     */
    backgroundColor?: string;

    /**
     * Use a custom resource for the splash screen on Android.
     *
     * @since 1.0.0
     */
    androidSplashResourceName?: string;

    /**
     * Set a custom scaling type for the splash screen on Android.
     *
     * This will set the splash screen's
     * [`ImageView.ScaleType`](https://developer.android.com/reference/android/widget/ImageView.ScaleType).
     *
     * @since 1.0.0
     */
    androidScaleType?:
      | 'CENTER'
      | 'CENTER_CROP'
      | 'CENTER_INSIDE'
      | 'FIT_CENTER'
      | 'FIT_END'
      | 'FIT_START'
      | 'FIT_XY'
      | 'MATRIX';

    /**
     * @since 1.0.0
     */
    splashFullScreen?: boolean;

    /**
     * @since 1.0.0
     */
    splashImmersive?: boolean;
  };

  /**
   * Additional plugins configured by class name.
   *
   * @since 1.0.0
   */
  [key: string]:
    | {
        [key: string]: any;
      }
    | undefined;
}

export interface CapacitorConfig {
  /**
   * The unique identifier of your packaged app.
   *
   * This is also known as the Bundle ID in iOS and the Application ID in
   * Android. It must be in reverse domain name notation, generally
   * representing a domain name that you or your company owns.
   *
   * @since 1.0.0
   */
  appId?: string;

  /**
   * The human-friendly name of your app.
   *
   * This should be what you'd see in the App Store, but can be changed after
   * within each native platform after it is generated.
   *
   * @since 1.0.0
   */
  appName?: string;

  /**
   * The directory of your compiled web assets.
   *
   * This directory should contain the final `index.html` of your app.
   *
   * @since 1.0.0
   */
  webDir?: string;

  /**
   * Whether to copy the Capacitor runtime bundle or not.
   *
   * If your app is not using a bundler, set this to `true`, then Capacitor
   * will create a `capacitor.js` file that you'll need to add as a script in
   * your `index.html` file.
   *
   * @since 1.0.0
   * @default false
   */
  bundledWebRuntime?: boolean;

  /**
   * Hide or show the native logs for iOS and Android.
   *
   * @since 2.1.0
   * @default false
   */
  hideLogs?: boolean;

  /**
   * User agent of Capacitor Web View.
   *
   * @since 1.4.0
   */
  overrideUserAgent?: string;

  /**
   * String to append to the original user agent of Capacitor Web View.
   *
   * This is disregarded if `overrideUserAgent` is used.
   *
   * @since 1.4.0
   */
  appendUserAgent?: string;

  /**
   * Background color of the Capacitor Web View.
   *
   * @since 1.1.0
   */
  backgroundColor?: string;

  android?: {
    /**
     * Specify a custom path to the native Android project.
     *
     * @since 3.0.0
     * @default android
     */
    path?: string;

    /**
     * User agent of Capacitor Web View on Android.
     *
     * Overrides global `overrideUserAgent` option.
     *
     * @since 1.4.0
     */
    overrideUserAgent?: string;

    /**
     * String to append to the original user agent of Capacitor Web View for Android.
     *
     * Overrides global `appendUserAgent` option.
     *
     * This is disregarded if `overrideUserAgent` is used.
     *
     * @since 1.4.0
     */
    appendUserAgent?: string;

    /**
     * Background color of the Capacitor Web View for Android.
     *
     * Overrides global `backgroundColor` option.
     *
     * @since 1.1.0
     */
    backgroundColor?: string;

    /**
     * Enable mixed content in the Capacitor Web View for Android.
     *
     * [Mixed
     * content](https://developer.mozilla.org/en-US/docs/Web/Security/Mixed_content)
     * is disabled by default for security. During development, you may need to
     * enable it to allow the Web View to load files from different schemes.
     *
     * **This is not intended for use in production.**
     *
     * @since 1.0.0
     * @default false
     */
    allowMixedContent?: boolean;

    /**
     * This enables a simpler keyboard which may have some limitations.
     *
     * This will capture JS keys using an alternative
     * [`InputConnection`](https://developer.android.com/reference/android/view/inputmethod/InputConnection).
     *
     * @since 1.0.0
     * @default false
     */
    captureInput?: boolean;

    /**
     * Always enable debuggable web content.
     *
     * This is automatically enabled during development.
     *
     * @since 1.0.0
     * @default false
     */
    webContentsDebuggingEnabled?: boolean;

    /**
     * Hide or show the native logs for Android.
     *
     * Overrides global `hideLogs` option.
     *
     * @since 2.1.0
     * @default false
     */
    hideLogs?: boolean;
  };

  ios?: {
    /**
     * Specify a custom path to the native iOS project.
     *
     * @since 3.0.0
     * @default ios
     */
    path?: string;

    /**
     * User agent of Capacitor Web View on iOS.
     *
     * Overrides global `overrideUserAgent` option.
     *
     * @since 1.4.0
     */
    overrideUserAgent?: string;

    /**
     * String to append to the original user agent of Capacitor Web View for iOS.
     *
     * Overrides global `appendUserAgent` option.
     *
     * This is disregarded if `overrideUserAgent` is used.
     *
     * @since 1.4.0
     */
    appendUserAgent?: string;

    /**
     * Background color of the Capacitor Web View for iOS.
     *
     * Overrides global `backgroundColor` option.
     *
     * @since 1.1.0
     */
    backgroundColor?: string;

    /**
     * Configure the scroll view's content inset adjustment behavior.
     *
     * This will set the
     * [`contentInsetAdjustmentBehavior`](https://developer.apple.com/documentation/uikit/uiscrollview/2902261-contentinsetadjustmentbehavior)
     * property on the Web View's
     * [`UIScrollView`](https://developer.apple.com/documentation/uikit/uiscrollview).
     *
     * @since 2.0.0
     * @default never
     */
    contentInset?: 'automatic' | 'scrollableAxes' | 'never' | 'always';

    /**
     * Configure whether the scroll view is scrollable.
     *
     * This will set the
     * [`isScrollEnabled`](https://developer.apple.com/documentation/uikit/uiscrollview/1619395-isscrollenabled)
     * property on the Web View's
     * [`UIScrollView`](https://developer.apple.com/documentation/uikit/uiscrollview).
     *
     * @since 1.0.0
     */
    scrollEnabled?: boolean;

    /**
     * Configure the Swift version to be used in Cordova plugins.
     *
     * @since 1.0.0
     * @default 5.1
     */
    cordovaSwiftVersion?: string;

    /**
     * Configure the minimum iOS version supported.
     *
     * @since 1.0.0
     * @default 11.0
     */
    minVersion?: string;

    /**
     * Configure custom linker flags for compiling Cordova plugins.
     *
     * @since 1.0.0
     * @default []
     */
    cordovaLinkerFlags?: string[];

    /**
     * Allow destination previews when pressing on links.
     *
     * This will set the
     * [`allowsLinkPreview`](https://developer.apple.com/documentation/webkit/wkwebview/1415000-allowslinkpreview)
     * property on the Web View, instead of using the default value.
     *
     * @since 2.0.0
     */
    allowsLinkPreview?: boolean;

    /**
     * Hide or show the native logs for iOS.
     *
     * Overrides global `hideLogs` option.
     *
     * @since 1.1.0
     * @default false
     */
    hideLogs?: boolean;
  };

  server?: {
    /**
     * Configure the local hostname of the device.
     *
     * It is recommended to keep this as `localhost` as it allows the use of
     * Web APIs that would otherwise require a [secure
     * context](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts)
     * such as
     * [`navigator.geolocation`](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/geolocation)
     * and
     * [`MediaDevices.getUserMedia`](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia).
     *
     * @since 1.0.0
     * @default localhost
     */
    hostname?: string;

    /**
     * Configure the local scheme on iOS.
     *
     * This can be useful when migrating from
     * [`cordova-plugin-ionic-webview`](https://github.com/ionic-team/cordova-plugin-ionic-webview),
     * where the default scheme on iOS is `ionic`.
     *
     * @since 1.2.0
     * @default capacitor
     */
    iosScheme?: string;

    /**
     * Configure the local scheme on Android.
     *
     * @since 1.2.0
     * @default http
     */
    androidScheme?: string;

    /**
     * Load an external URL in the Web View.
     *
     * This is intended for use with live-reload servers.
     *
     * **This is not intended for use in production.**
     *
     * @since 1.0.0
     */
    url?: string;

    /**
     * Allow cleartext traffic in the Web View.
     *
     * On Android, all cleartext traffic is disabled by default as of API 28.
     *
     * This is intended for use with live-reload servers where unencrypted HTTP
     * traffic is often used.
     *
     * **This is not intended for use in production.**
     *
     * @since 1.5.0
     * @default false
     */
    cleartext?: boolean;

    /**
     * Set additional URLs the Web View can navigate to.
     *
     * By default, all external URLs are opened in the external browser (not
     * the Web View).
     *
     * **This is not intended for use in production.**
     *
     * @since 1.0.0
     * @default []
     */
    allowNavigation?: string[];
  };

  cordova?: {
    /**
     * Configure Cordova preferences.
     *
     * @since 1.3.0
     */
    preferences?: { [key: string]: string | undefined };
  };

  /**
   * Configure plugins.
   *
   * This should be an array of strings representing the npm package name of
   * plugins to include when running `npx cap sync`. If unset, Capacitor will
   * inspect `package.json` for a list of potential plugins.
   *
   * This can also be an object with configuration values specified by plugin
   * class name, but this usage is deprecated and you should rename the key to
   * `pluginsConfig`.
   *
   * @since 1.0.0
   */
  plugins?: string[] | CapacitorPluginClassConfig;

  /**
   * Plugin configuration values specified by class name.
   *
   * @since 3.0.0
   */
  pluginsConfig?: CapacitorPluginClassConfig;
}
