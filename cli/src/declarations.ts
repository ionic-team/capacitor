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
   * @deprecated 3.0.0
   * @default false
   */
  hideLogs?: boolean;

  /**
   * The build configuration (as defined by the native app) under which Capacitor
   * will send statements to the log system. This applies to log statements in
   * native code as well as statements redirected from JavaScript (`console.debug`,
   * `console.error`, etc.). Enabling logging will let statements render in the
   * Xcode and Android Studio windows but can leak information on device if enabled
   * in released builds.
   *
   * 'none' = logs are never produced
   * 'debug' = logs are produced in debug builds but not production builds
   * 'production' = logs are always produced
   *
   * @since 3.0.0
   * @default debug
   */
  loggingBehavior?: 'none' | 'debug' | 'production';

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
     * @deprecated 3.0.0
     * @default false
     */
    hideLogs?: boolean;

    /**
     * The build configuration under which Capacitor will generate logs on Android.
     *
     * Overrides global `loggingBehavior` option.
     *
     * @since 3.0.0
     * @default debug
     */
    loggingBehavior?: 'none' | 'debug' | 'production';

    /**
     * Allowlist of plugins to include during `npx cap sync` for Android.
     *
     * Overrides global `includePlugins` option.
     *
     * @since 3.0.0
     */
    includePlugins?: string[];

    /**
     * Android flavor to use.
     *
     * If the app has flavors declared in the `build.gradle`
     * configure the flavor you want to run with `npx cap run` command.
     *
     * @since 3.1.0
     */
    flavor?: string;
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
     * iOS build scheme to use.
     *
     * Usually this matches your app's target in Xcode. You can use the
     * following command to list schemes:
     *
     * ```shell
     * xcodebuild -workspace ios/App/App.xcworkspace -list
     * ```
     *
     * @since 3.0.0
     * @default App
     */
    scheme?: string;

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
     * @deprecated 3.0.0
     * @default false
     */
    hideLogs?: boolean;

    /**
     * The build configuration under which Capacitor will generate logs on iOS.
     *
     * Overrides global `loggingBehavior` option.
     *
     * @since 3.0.0
     * @default debug
     */
    loggingBehavior?: 'none' | 'debug' | 'production';

    /**
     * Allowlist of plugins to include during `npx cap sync` for iOS.
     *
     * Overrides global `includePlugins` option.
     *
     * @since 3.0.0
     */
    includePlugins?: string[];

    /**
     * Sets WKWebView configuration for limitsNavigationsToAppBoundDomains.
     *
     * If the Info.plist file includes `WKAppBoundDomains` key, it's recommended to
     * set this option to true, otherwise some features won't work.
     * But as side effect, it blocks navigation outside the domains in the
     * `WKAppBoundDomains` list.
     * `localhost` (or the value configured as `server.hostname`) also needs to be
     * added to the `WKAppBoundDomains` list.
     *
     * @since 3.1.0
     * @default false
     */
    limitsNavigationsToAppBoundDomains?: boolean;
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
   * This is an object with configuration values specified by plugin class
   * name.
   *
   * @since 1.0.0
   */
  plugins?: PluginsConfig;

  /**
   * Allowlist of plugins to include during `npx cap sync`.
   *
   * This should be an array of strings representing the npm package name of
   * plugins to include when running `npx cap sync`. If unset, Capacitor will
   * inspect `package.json` for a list of potential plugins.
   *
   * @since 3.0.0
   */
  includePlugins?: string[];
}

export interface PluginsConfig {
  /**
   * Plugin configuration by class name.
   *
   * @since 1.0.0
   */
  [key: string]:
    | {
        [key: string]: any;
      }
    | undefined;
}
