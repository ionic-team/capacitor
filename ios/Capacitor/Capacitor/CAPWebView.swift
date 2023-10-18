import Foundation
import WebKit
import UIKit

open class CAPWebView: UIView {
    lazy var webView: WKWebView = createWebView(
        with: configuration,
        assetHandler: assetHandler,
        delegationHandler: delegationHandler
    )

    private lazy var capacitorBridge = CapacitorBridge(
        with: configuration,
        delegate: self,
        cordovaConfiguration: configDescriptor.cordovaConfiguration,
        assetHandler: assetHandler,
        delegationHandler: delegationHandler,
        autoRegisterPlugins: autoRegisterPlugins
    )

    public final var bridge: CAPBridgeProtocol {
        return capacitorBridge
    }

    private lazy var configDescriptor = instanceDescriptor()
    private lazy var configuration = InstanceConfiguration(with: configDescriptor, isDebug: CapacitorBridge.isDevEnvironment)

    private lazy var assetHandler: WebViewAssetHandler = {
        let handler = WebViewAssetHandler(router: router)
        handler.setAssetPath(configuration.appLocation.path)
        handler.setServerUrl(configuration.serverURL)
        return handler
    }()

    private lazy var delegationHandler = WebViewDelegationHandler()
    private let autoRegisterPlugins: Bool

    open var router: Router { _Router() }

    public required init?(coder: NSCoder) {
        autoRegisterPlugins = true
        super.init(coder: coder)
        setup()
    }

    public init(autoRegisterPlugins: Bool = true) {
        self.autoRegisterPlugins = autoRegisterPlugins
        super.init(frame: .zero)
        setup()
    }

    private func setup() {
        CAPLog.enableLogging = configuration.loggingEnabled
        logWarnings(for: configDescriptor)

        if configDescriptor.instanceType == .fixed { updateBinaryVersion() }

        addSubview(webView)
        webView.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            webView.topAnchor.constraint(equalTo: topAnchor),
            webView.bottomAnchor.constraint(equalTo: bottomAnchor),
            webView.leadingAnchor.constraint(equalTo: leadingAnchor),
            webView.trailingAnchor.constraint(equalTo: trailingAnchor)
        ])

        guard FileManager.default.fileExists(atPath: bridge.config.appStartFileURL.path) else { fatalLoadError() }
        capacitorDidLoad()

        let url = bridge.config.appStartServerURL
        CAPLog.print("⚡️  Loading app at \(url.absoluteString)")
        capacitorBridge.webViewDelegationHandler.willLoadWebview(webView)
        _ = webView.load(URLRequest(url: url))
    }

    public lazy final var isNewBinary: Bool = {
        if let curVersionCode = Bundle.main.infoDictionary?["CFBundleVersion"] as? String,
           let curVersionName = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String {
            if let lastVersionCode = UserDefaults.standard.string(forKey: "lastBinaryVersionCode"),
               let lastVersionName = UserDefaults.standard.string(forKey: "lastBinaryVersionName") {
                return (curVersionCode.isEqual(lastVersionCode) == false || curVersionName.isEqual(lastVersionName) == false)
            }
        }
        return false
    }()

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
     Allows any additional configuration to be performed. The `webView` and `bridge` properties will be set by this point.

     - Note: This is called before the webview has been added to the view hierarchy. Not all operations may be possible at
     this time.
     */
    open func capacitorDidLoad() {
    }

    open func loadInitialContext(_ userContentController: WKUserContentController) {
        CAPLog.print("in loadInitialContext base")
    }

    public func setServerBasePath(path: String) {
        let url = URL(fileURLWithPath: path, isDirectory: true)
        guard FileManager.default.fileExists(atPath: url.path) else { return }

        capacitorBridge.config = capacitorBridge.config.updatingAppLocation(url)
        capacitorBridge.webViewAssetHandler.setAssetPath(url.path)

        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            _ = self.webView.load(URLRequest(url: self.capacitorBridge.config.serverURL))
        }
    }
}

extension CAPWebView {

    public func webViewConfiguration(for instanceConfiguration: InstanceConfiguration) -> WKWebViewConfiguration {
        let webViewConfiguration = WKWebViewConfiguration()
        webViewConfiguration.websiteDataStore.httpCookieStore.add(CapacitorWKCookieObserver())
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

        if let preferredContentMode = instanceConfiguration.preferredContentMode {
            var mode = WKWebpagePreferences.ContentMode.recommended
            if preferredContentMode == "mobile" {
                mode = WKWebpagePreferences.ContentMode.mobile
            } else if preferredContentMode == "desktop" {
                mode = WKWebpagePreferences.ContentMode.desktop
            }
            webViewConfiguration.defaultWebpagePreferences.preferredContentMode = mode
        }

        return webViewConfiguration
    }

    private func createWebView(with configuration: InstanceConfiguration, assetHandler: WebViewAssetHandler, delegationHandler: WebViewDelegationHandler) -> WKWebView {
        // set the cookie policy
        HTTPCookieStorage.shared.cookieAcceptPolicy = HTTPCookie.AcceptPolicy.always
        // setup the web view configuration
        let webViewConfig = webViewConfiguration(for: configuration)
        webViewConfig.setURLSchemeHandler(assetHandler, forURLScheme: configuration.localURL.scheme ?? InstanceDescriptorDefaults.scheme)
        webViewConfig.userContentController = delegationHandler.contentController
        // create the web view and set its properties
        loadInitialContext(webViewConfig.userContentController)
        let webView = WKWebView(frame: .zero, configuration: webViewConfig)
        webView.scrollView.bounces = false
        webView.scrollView.contentInsetAdjustmentBehavior = configuration.contentInsetAdjustmentBehavior
        webView.allowsLinkPreview = configuration.allowLinkPreviews
        webView.scrollView.isScrollEnabled = configuration.scrollingEnabled

        if let overrideUserAgent = configuration.overridenUserAgentString {
            webView.customUserAgent = overrideUserAgent
        }

        if let backgroundColor = configuration.backgroundColor {
            self.backgroundColor = backgroundColor
            webView.backgroundColor = backgroundColor
            webView.scrollView.backgroundColor = backgroundColor
        } else {
            // Use the system background colors if background is not set by user
            self.backgroundColor = UIColor.systemBackground
            webView.backgroundColor = UIColor.systemBackground
            webView.scrollView.backgroundColor = UIColor.systemBackground
        }

        // set our delegates
        webView.uiDelegate = delegationHandler
        webView.navigationDelegate = delegationHandler
        return webView
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

    private func fatalLoadError() -> Never {
        printLoadError()
        exit(1)
    }

    private func printLoadError() {
        let fullStartPath = capacitorBridge.config.appStartFileURL.path

        CAPLog.print("⚡️  ERROR: Unable to load \(fullStartPath)")
        CAPLog.print("⚡️  This file is the root of your web app and must exist before")
        CAPLog.print("⚡️  Capacitor can run. Ensure you've run capacitor copy at least")
        CAPLog.print("⚡️  or, if embedding, that this directory exists as a resource directory.")
    }
}

extension CAPWebView: CAPBridgeDelegate {
    internal var bridgedWebView: WKWebView? {
        return webView
    }

    internal var bridgedViewController: UIViewController? {
        // search for the parent view controller
        var object = self.next
        while !(object is UIViewController) && object != nil {
            object = object?.next
        }
        return object as? UIViewController
    }
}
