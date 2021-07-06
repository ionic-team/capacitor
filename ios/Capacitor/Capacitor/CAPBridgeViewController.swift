import UIKit
import WebKit
import Cordova

@objc open class CAPBridgeViewController: UIViewController {
    private var capacitorBridge: CapacitorBridge?
    public final var bridge: CAPBridgeProtocol? {
        return capacitorBridge
    }

    public fileprivate(set) var webView: WKWebView?

    public var isStatusBarVisible = true
    public var statusBarStyle: UIStatusBarStyle = .default
    public var statusBarAnimation: UIStatusBarAnimation = .slide
    @objc public var supportedOrientations: [Int] = []

    public lazy final var isNewBinary: Bool = {
        if let curVersionCode = Bundle.main.infoDictionary?["CFBundleVersion"] as? String,
           let curVersionName = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String {
            if let lastVersionCode = UserDefaults.standard.string(forKey: "lastBinaryVersionCode"),
               let lastVersionName = UserDefaults.standard.string(forKey: "lastBinaryVersionName") {
                return (curVersionCode.isEqual(lastVersionCode) == false || curVersionName.isEqual(lastVersionName) == false)
            }
            return true
        }
        return false
    }()

    override public final func loadView() {
        // load the configuration and set the logging flag
        let configDescriptor = instanceDescriptor()
        let configuration = InstanceConfiguration(with: configDescriptor, isDebug: CapacitorBridge.isDevEnvironment)
        CAPLog.enableLogging = configuration.loggingEnabled
        logWarnings(for: configDescriptor)

        if configDescriptor.instanceType == .fixed {
            updateBinaryVersion()
        }

        setStatusBarDefaults()
        setScreenOrientationDefaults()

        // get the web view
        let assetHandler = WebViewAssetHandler()
        assetHandler.setAssetPath(configuration.appLocation.path)
        let delegationHandler = WebViewDelegationHandler()
        prepareWebView(with: configuration, assetHandler: assetHandler, delegationHandler: delegationHandler)
        view = webView
        // create the bridge
        capacitorBridge = CapacitorBridge(with: configuration,
                                          delegate: self,
                                          cordovaConfiguration: configDescriptor.cordovaConfiguration,
                                          assetHandler: assetHandler,
                                          delegationHandler: delegationHandler)
        capacitorDidLoad()
    }

    override open func viewDidLoad() {
        super.viewDidLoad()
        self.becomeFirstResponder()
        loadWebView()
    }

    override open func canPerformUnwindSegueAction(_ action: Selector, from fromViewController: UIViewController, withSender sender: Any) -> Bool {
        return false
    }

    // MARK: - Initialization

    /**
     The InstanceDescriptor that should be used for the Capacitor environment.

     - Returns: `InstanceDescriptor`

     - Note: This is called early in the View Controller's lifecycle. Not all properties will be set at invocation.
     */
    open func instanceDescriptor() -> InstanceDescriptor {
        let descriptor = InstanceDescriptor.init()
        if !isNewBinary && !descriptor.cordovaDeployDisabled {
            if let persistedPath = UserDefaults.standard.string(forKey: "serverBasePath"), !persistedPath.isEmpty {
                if let libPath = NSSearchPathForDirectoriesInDomains(.libraryDirectory, .userDomainMask, true).first {
                    descriptor.appLocation = URL(fileURLWithPath: libPath, isDirectory: true)
                        .appendingPathComponent("NoCloud")
                        .appendingPathComponent("ionic_built_snapshots")
                        .appendingPathComponent(URL(fileURLWithPath: persistedPath, isDirectory: true).lastPathComponent)
                }
            }
        }
        return descriptor
    }

    /**
     The WKWebViewConfiguration to use for the webview.

     - Parameter instanceConfiguration: the configuration that will define the capacitor environment.

     - Returns: `WKWebViewConfiguration`

     It is recommended to call super's implementation and modify the result, rather than creating a new object.
     */
    open func webViewConfiguration(for instanceConfiguration: InstanceConfiguration) -> WKWebViewConfiguration {
        let webViewConfiguration = WKWebViewConfiguration()
        webViewConfiguration.allowsInlineMediaPlayback = true
        webViewConfiguration.suppressesIncrementalRendering = false
        webViewConfiguration.allowsAirPlayForMediaPlayback = true
        webViewConfiguration.mediaTypesRequiringUserActionForPlayback = []
        if #available(iOS 14.0, *) {
            webViewConfiguration.limitsNavigationsToAppBoundDomains = instanceConfiguration.limitsNavigationsToAppBoundDomains
        }
        if let appendUserAgent = instanceConfiguration.appendedUserAgentString {
            if let appName = webViewConfiguration.applicationNameForUserAgent {
                webViewConfiguration.applicationNameForUserAgent = "\(appName)  \(appendUserAgent)"
            } else {
                webViewConfiguration.applicationNameForUserAgent = appendUserAgent
            }
        }
        return webViewConfiguration
    }

    /**
     Returns a WKWebView initialized with the frame and configuration.

     Subclasses can override this method to return a subclass of WKWebView if needed.
     */
    open func webView(with frame: CGRect, configuration: WKWebViewConfiguration) -> WKWebView {
        return WKWebView(frame: frame, configuration: configuration)
    }

    /**
     Allows any additional configuration to be performed. The `webView` and `bridge` properties will be set by this point.

     - Note: This is called before the webview has been added to the view hierarchy. Not all operations may be possible at
     this time.
     */
    open func capacitorDidLoad() {
    }

    public final func loadWebView() {
        guard let bridge = capacitorBridge else {
            return
        }

        guard FileManager.default.fileExists(atPath: bridge.config.appStartFileURL.path) else {
            fatalLoadError()
        }

        let url = bridge.config.appStartServerURL
        CAPLog.print("⚡️  Loading app at \(url.absoluteString)...")
        bridge.webViewDelegationHandler.willLoadWebview(webView)
        _ = webView?.load(URLRequest(url: url))
    }

    // MARK: - System Integration

    open func setStatusBarDefaults() {
        if let plist = Bundle.main.infoDictionary {
            if let statusBarHidden = plist["UIStatusBarHidden"] as? Bool {
                if statusBarHidden {
                    self.isStatusBarVisible = false
                }
            }
            if let statusBarStyle = plist["UIStatusBarStyle"] as? String {
                if statusBarStyle == "UIStatusBarStyleDarkContent" {
                    if #available(iOS 13.0, *) {
                        self.statusBarStyle = .darkContent
                    } else {
                        self.statusBarStyle = .default
                    }
                } else if statusBarStyle != "UIStatusBarStyleDefault" {
                    self.statusBarStyle = .lightContent
                }
            }
        }
    }

    open func setScreenOrientationDefaults() {
        if let plist = Bundle.main.infoDictionary {
            if let orientations = plist["UISupportedInterfaceOrientations"] as? [String] {
                for orientation in orientations {
                    if orientation == "UIInterfaceOrientationPortrait" {
                        self.supportedOrientations.append(UIInterfaceOrientation.portrait.rawValue)
                    }
                    if orientation == "UIInterfaceOrientationPortraitUpsideDown" {
                        self.supportedOrientations.append(UIInterfaceOrientation.portraitUpsideDown.rawValue)
                    }
                    if orientation == "UIInterfaceOrientationLandscapeLeft" {
                        self.supportedOrientations.append(UIInterfaceOrientation.landscapeLeft.rawValue)
                    }
                    if orientation == "UIInterfaceOrientationLandscapeRight" {
                        self.supportedOrientations.append(UIInterfaceOrientation.landscapeRight.rawValue)
                    }
                }
                if self.supportedOrientations.count == 0 {
                    self.supportedOrientations.append(UIInterfaceOrientation.portrait.rawValue)
                }
            }
        }
    }

    override open var prefersStatusBarHidden: Bool {
        return !isStatusBarVisible
    }

    override open var preferredStatusBarStyle: UIStatusBarStyle {
        return statusBarStyle
    }

    override open var preferredStatusBarUpdateAnimation: UIStatusBarAnimation {
        return statusBarAnimation
    }

    open func setStatusBarVisible(_ isStatusBarVisible: Bool) {
        self.isStatusBarVisible = isStatusBarVisible
        UIView.animate(withDuration: 0.2, animations: {
            self.setNeedsStatusBarAppearanceUpdate()
        })
    }

    open func setStatusBarStyle(_ statusBarStyle: UIStatusBarStyle) {
        self.statusBarStyle = statusBarStyle
        UIView.animate(withDuration: 0.2, animations: {
            self.setNeedsStatusBarAppearanceUpdate()
        })
    }

    open func setStatusBarAnimation(_ statusBarAnimation: UIStatusBarAnimation) {
        self.statusBarAnimation = statusBarAnimation
    }

    override open var supportedInterfaceOrientations: UIInterfaceOrientationMask {
        var ret = 0
        if self.supportedOrientations.contains(UIInterfaceOrientation.portrait.rawValue) {
            ret = ret | (1 << UIInterfaceOrientation.portrait.rawValue)
        }
        if self.supportedOrientations.contains(UIInterfaceOrientation.portraitUpsideDown.rawValue) {
            ret = ret | (1 << UIInterfaceOrientation.portraitUpsideDown.rawValue)
        }
        if self.supportedOrientations.contains(UIInterfaceOrientation.landscapeRight.rawValue) {
            ret = ret | (1 << UIInterfaceOrientation.landscapeRight.rawValue)
        }
        if self.supportedOrientations.contains(UIInterfaceOrientation.landscapeLeft.rawValue) {
            ret = ret | (1 << UIInterfaceOrientation.landscapeLeft.rawValue)
        }
        return UIInterfaceOrientationMask.init(rawValue: UInt(ret))
    }
}

// MARK: - Application Path

extension CAPBridgeViewController {
    @objc public func getServerBasePath() -> String {
        return bridge?.config.appLocation.path ?? ""
    }

    @objc public func setServerBasePath(path: String) {
        let url = URL(fileURLWithPath: path, isDirectory: true)
        guard let capBridge = capacitorBridge, FileManager.default.fileExists(atPath: url.path) else {
            return
        }
        capBridge.config = capBridge.config.updatingAppLocation(url)
        capBridge.webViewAssetHandler.setAssetPath(url.path)
        if let url = capacitorBridge?.config.serverURL {
            DispatchQueue.main.async { [weak self] in
                _ = self?.webView?.load(URLRequest(url: url))
            }
        }
    }
}

// MARK: - Private

extension CAPBridgeViewController {
    private func prepareWebView(with configuration: InstanceConfiguration, assetHandler: WebViewAssetHandler, delegationHandler: WebViewDelegationHandler) {
        // set the cookie policy
        HTTPCookieStorage.shared.cookieAcceptPolicy = HTTPCookie.AcceptPolicy.always
        // setup the web view configuration
        let webConfig = webViewConfiguration(for: configuration)
        webConfig.setURLSchemeHandler(assetHandler, forURLScheme: configuration.localURL.scheme ?? InstanceDescriptorDefaults.scheme)
        webConfig.userContentController = delegationHandler.contentController
        // create the web view and set its properties
        let aWebView = webView(with: .zero, configuration: webConfig)
        aWebView.scrollView.bounces = false
        aWebView.scrollView.contentInsetAdjustmentBehavior = configuration.contentInsetAdjustmentBehavior
        aWebView.allowsLinkPreview = configuration.allowLinkPreviews
        aWebView.configuration.preferences.setValue(true, forKey: "allowFileAccessFromFileURLs")
        aWebView.scrollView.isScrollEnabled = configuration.scrollingEnabled
        if let overrideUserAgent = configuration.overridenUserAgentString {
            aWebView.customUserAgent = overrideUserAgent
        }
        if let backgroundColor = configuration.backgroundColor {
            aWebView.backgroundColor = backgroundColor
            aWebView.scrollView.backgroundColor = backgroundColor
        } else if #available(iOS 13, *) {
            // Use the system background colors if background is not set by user
            aWebView.backgroundColor = UIColor.systemBackground
            aWebView.scrollView.backgroundColor = UIColor.systemBackground
        }
        aWebView.capacitor.setKeyboardShouldRequireUserInteraction(false)
        // set our ivar
        webView = aWebView
        // set our delegates
        aWebView.uiDelegate = delegationHandler
        aWebView.navigationDelegate = delegationHandler
    }

    private func updateBinaryVersion() {
        guard isNewBinary else {
            return
        }
        guard let versionCode = Bundle.main.infoDictionary?["CFBundleVersion"] as? String,
              let versionName = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String else {
            return
        }
        let prefs = UserDefaults.standard
        prefs.set(versionCode, forKey: "lastBinaryVersionCode")
        prefs.set(versionName, forKey: "lastBinaryVersionName")
        prefs.set("", forKey: "serverBasePath")
        prefs.synchronize()
    }

    private func logWarnings(for descriptor: InstanceDescriptor) {
        if descriptor.warnings.contains(.missingAppDir) {
            CAPLog.print("⚡️  ERROR: Unable to find application directory at: \"\(descriptor.appLocation.absoluteString)\"!")
        }
        if descriptor.instanceType == .fixed {
            if descriptor.warnings.contains(.missingFile) {
                CAPLog.print("Unable to find capacitor.config.json, make sure it exists and run npx cap copy.")
            }
            if descriptor.warnings.contains(.invalidFile) {
                CAPLog.print("Unable to parse capacitor.config.json. Make sure it's valid JSON.")
            }
            if descriptor.warnings.contains(.missingCordovaFile) {
                CAPLog.print("Unable to find config.xml, make sure it exists and run npx cap copy.")
            }
            if descriptor.warnings.contains(.invalidCordovaFile) {
                CAPLog.print("Unable to parse config.xml. Make sure it's valid XML.")
            }
        }
    }

    private func printLoadError() {
        let fullStartPath = bridge?.config.appStartFileURL.path ?? ""

        CAPLog.print("⚡️  ERROR: Unable to load \(fullStartPath)")
        CAPLog.print("⚡️  This file is the root of your web app and must exist before")
        CAPLog.print("⚡️  Capacitor can run. Ensure you've run capacitor copy at least")
        CAPLog.print("⚡️  or, if embedding, that this directory exists as a resource directory.")
    }

    private func fatalLoadError() -> Never {
        printLoadError()
        exit(1)
    }
}

extension CAPBridgeViewController: CAPBridgeDelegate {
    internal var bridgedWebView: WKWebView? {
        return webView
    }

    internal var bridgedViewController: UIViewController? {
        return self
    }
}
