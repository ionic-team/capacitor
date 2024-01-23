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
   * It's deprecated and will be removed in Capacitor 6
   *
   * @since 1.0.0
   * @deprecated 5.0.0
   * @default false
   */
  bundledWebRuntime?: boolean;

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

  /**
   * Enable zooming within the Capacitor Web View.
   *
   * @default false
   * @since 6.0.0
   */
  zoomEnabled?: boolean;

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
     * Enable zooming within the Capacitor Web View for Android.
     *
     * @default false
     * @since 6.0.0
     */
    zoomEnabled?: boolean;

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

    /**
     * Whether to give the webview initial focus.
     *
     * @since 3.5.1
     * @default true
     */
    initialFocus?: boolean;

    /**
     * The minimum supported webview version on Android supported by your app.
     *
     * The minimum supported cannot be lower than version `55`, which is required for Capacitor.
     *
     * If the device uses a lower WebView version, an error message will be shown on Logcat.
     * If `server.errorPath` is configured, the WebView will redirect to that file, so can be
     * used to show a custom error.
     *
     * @since 4.0.0
     * @default 60
     */
    minWebViewVersion?: number;

    /**
     * The minimum supported Huawei webview version on Android supported by your app.
     *
     * The minimum supported cannot be lower than version `10`, which is required for Capacitor.
     *
     * If the device uses a lower WebView version, an error message will be shown on Logcat.
     * If `server.errorPath` is configured, the WebView will redirect to that file, so can be
     * used to show a custom error.
     *
     * @since 4.6.4
     * @default 10
     */
    minHuaweiWebViewVersion?: number;

    buildOptions?: {
      /**
       * Path to your keystore
       *
       * @since 4.4.0
       */
      keystorePath?: string;

      /**
       * Password to your keystore
       *
       * @since 4.4.0
       */
      keystorePassword?: string;

      /**
       * Alias in the keystore to use
       *
       * @since 4.4.0
       */
      keystoreAlias?: string;

      /**
       * Password for the alias in the keystore to use
       *
       * @since 4.4.0
       */
      keystoreAliasPassword?: string;

      /**
       * Bundle type for your release build
       *
       * @since 4.4.0
       * @default "AAB"
       */
      releaseType?: 'AAB' | 'APK';

      /**
       * Program to sign your build with
       *
       * @since 5.1.0
       * @default "jarsigner"
       */
      signingType?: 'apksigner' | 'jarsigner';
    };

    /**
     * Use legacy [addJavascriptInterface](https://developer.android.com/reference/android/webkit/WebView#addJavascriptInterface(java.lang.Object,%20java.lang.String))
     * instead of the new and more secure [addWebMessageListener](https://developer.android.com/reference/androidx/webkit/WebViewCompat#addWebMessageListener(android.webkit.WebView,java.lang.String,java.util.Set%3Cjava.lang.String%3E,androidx.webkit.WebViewCompat.WebMessageListener))
     *
     * @since 4.5.0
     * @default false
     */
    useLegacyBridge?: boolean;
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
     * Enable zooming within the Capacitor Web View for iOS.
     *
     * @default false
     * @since 6.0.0
     */
    zoomEnabled?: boolean;

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

    /**
     * The content mode for the web view to use when it loads and renders web content.
     *
     * - 'recommended': The content mode that is appropriate for the current device.
     * - 'desktop': The content mode that represents a desktop experience.
     * - 'mobile': The content mode that represents a mobile experience.
     *
     * @since 4.0.0
     * @default recommended
     */
    preferredContentMode?: 'recommended' | 'desktop' | 'mobile';

    /**
     * Configure if Capacitor will handle local/push notifications.
     * Set to false if you want to use your own UNUserNotificationCenter to handle notifications.
     *
     * @since 4.5.0
     * @default true
     */
    handleApplicationNotifications?: boolean;

    /**
     * Using Xcode 14.3, on iOS 16.4 and greater, enable debuggable web content for release builds.
     *
     * If not set, it's `true` for development builds.
     *
     * @since 4.8.0
     * @default false
     */
    webContentsDebuggingEnabled?: boolean;
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
     * [Can't be set to schemes that the WKWebView already handles, such as http or https](https://developer.apple.com/documentation/webkit/wkwebviewconfiguration/2875766-seturlschemehandler)
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
     * Custom schemes on Android are unable to change the URL path as of Webview 117. Changing this value from anything other than `http` or `https` can result in your
     * application unable to resolve routing. If you must change this for some reason, consider using a hash-based url strategy, but there are no guarentees that this
     * will continue to work long term as allowing non-standard schemes to modify query parameters and url fragments is only allowed for compatibility reasons.
     * https://ionic.io/blog/capacitor-android-customscheme-issue-with-chrome-117
     *
     * @since 1.2.0
     * @default https
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

    /**
     * Specify path to a local html page to display in case of errors.
     * On Android the html file won't have access to Capacitor plugins.
     *
     * @since 4.0.0
     * @default null
     */
    errorPath?: string;
  };

  cordova?: {
    /**
     * Populates <access> tags in the config.xml with the origin set to
     * the values entered here.
     * If not provided, a single <access origin="*" /> tag gets included.
     * It only has effect on a few Cordova plugins that respect the whitelist.
     *
     * @since 3.3.0
     */
    accessOrigins?: string[];

    /**
     * Configure Cordova preferences.
     *
     * @since 1.3.0
     */
    preferences?: { [key: string]: string | undefined };

    /**
     * List of Cordova plugins that need to be static but are not
     * already in the static plugin list.
     *
     * @since 3.3.0
     */
    staticPlugins?: string[];
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

  /**
   * Capacitor Cookies plugin configuration
   *
   * @since 4.3.0
   */
  CapacitorCookies?: {
    /**
     * Enable CapacitorCookies to override the global `document.cookie` on native.
     *
     * @default false
     */
    enabled?: boolean;
  };

  /**
   * Capacitor Http plugin configuration
   *
   * @since 4.3.0
   */
  CapacitorHttp?: {
    /**
     * Enable CapacitorHttp to override the global `fetch` and `XMLHttpRequest` on native.
     *
     * @default false
     */
    enabled?: boolean;
  };
}
