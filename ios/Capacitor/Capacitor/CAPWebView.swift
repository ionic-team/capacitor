import Foundation
import WebKit
import UIKit

open class CAPWebView: UIView {
    var webView: WKWebView!
        
    private var capacitorBridge: CapacitorBridge?
    public final var bridge: CAPBridgeProtocol? {
        return capacitorBridge
    }
    
    required public init?(coder: NSCoder) {
        super.init(coder: coder)
        initView()
    }
    
    override public init(frame: CGRect) {
        super.init(frame: frame)
        initView()
    }
    
//    override public init(frame: CGRect, configuration: WKWebViewConfiguration) {
//        super.init(frame: frame, configuration: configuration)
//        initView()
//    }
    
    func initView () {
//         load the configuration and set the logging flag
        let configDescriptor = instanceDescriptor()
        let configuration = InstanceConfiguration(with: configDescriptor, isDebug: CapacitorBridge.isDevEnvironment)
        CAPLog.enableLogging = configuration.loggingEnabled
        logWarnings(for: configDescriptor)

        if configDescriptor.instanceType == .fixed {
            updateBinaryVersion()
        }
        // get the web view
        let assetHandler = WebViewAssetHandler()
        assetHandler.setAssetPath(configuration.appLocation.path)
        let delegationHandler = WebViewDelegationHandler()
        prepareWebView(with: configuration, assetHandler: assetHandler, delegationHandler: delegationHandler)
        self.addSubview(webView)
        //        view = webView
//        // create the bridge
        capacitorBridge = CapacitorBridge(with: configuration,
                                          delegate: self,
                                          cordovaConfiguration: configDescriptor.cordovaConfiguration,
                                          assetHandler: assetHandler,
                                          delegationHandler: delegationHandler)
        capacitorDidLoad()
        
        guard let bridge = capacitorBridge else {
            return
        }

        guard FileManager.default.fileExists(atPath: bridge.config.appStartFileURL.path) else {
            fatalLoadError()
        }

        let url = bridge.config.appStartServerURL
        CAPLog.print("⚡️  Loading app at \(url.absoluteString)")
        bridge.webViewDelegationHandler.willLoadWebview(webView)
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
    

    
}

extension CAPWebView {
    
    open func webViewConfiguration(for instanceConfiguration: InstanceConfiguration) -> WKWebViewConfiguration {
        let webViewConfiguration = WKWebViewConfiguration()
        webViewConfiguration.allowsInlineMediaPlayback = true
        webViewConfiguration.suppressesIncrementalRendering = false
        webViewConfiguration.allowsAirPlayForMediaPlayback = true
        webViewConfiguration.mediaTypesRequiringUserActionForPlayback = []
        if let appendUserAgent = instanceConfiguration.appendedUserAgentString {
            if let appName = webViewConfiguration.applicationNameForUserAgent {
                webViewConfiguration.applicationNameForUserAgent = "\(appName)  \(appendUserAgent)"
            } else {
                webViewConfiguration.applicationNameForUserAgent = appendUserAgent
            }
        }
       return webViewConfiguration
    }
    
    private func prepareWebView(with configuration: InstanceConfiguration, assetHandler: WebViewAssetHandler, delegationHandler: WebViewDelegationHandler) {
        // set the cookie policy
        HTTPCookieStorage.shared.cookieAcceptPolicy = HTTPCookie.AcceptPolicy.always
        // setup the web view configuration
        let webViewConfig = webViewConfiguration(for: configuration)
        webViewConfig.setURLSchemeHandler(assetHandler, forURLScheme: configuration.localURL.scheme ?? InstanceDescriptorDefaults.scheme)
        webViewConfig.userContentController = delegationHandler.contentController
        // create the web view and set its properties
        let aWebView = WKWebView(frame: self.frame, configuration: webViewConfig)
        aWebView.scrollView.bounces = false
        aWebView.scrollView.contentInsetAdjustmentBehavior = configuration.contentInsetAdjustmentBehavior
        aWebView.allowsLinkPreview = configuration.allowLinkPreviews
        aWebView.configuration.preferences.setValue(true, forKey: "allowFileAccessFromFileURLs")
        aWebView.scrollView.isScrollEnabled = configuration.scrollingEnabled
        if let overrideUserAgent = configuration.overridenUserAgentString {
            aWebView.customUserAgent = overrideUserAgent
        }
        if let backgroundColor = configuration.backgroundColor {
            self.backgroundColor = backgroundColor
            aWebView.backgroundColor = backgroundColor
            aWebView.scrollView.backgroundColor = backgroundColor
        } else if #available(iOS 13, *) {
            // Use the system background colors if background is not set by user
            self.backgroundColor = UIColor.systemBackground
            aWebView.backgroundColor = UIColor.systemBackground
            aWebView.scrollView.backgroundColor = UIColor.systemBackground
        }
//        self.capacitor .capacitor.setKeyboardShouldRequireUserInteraction(false)
        // set our ivar
//        webView = aWebView
        // set our delegates
        aWebView.uiDelegate = delegationHandler
        aWebView.navigationDelegate = delegationHandler
        webView = aWebView
    }
    
//    open func webView(with frame: CGRect, configuration: WKWebViewConfiguration) -> WKWebView {
//        return WKWebView(frame: frame, configuration: configuration)
//    }
//
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
        let fullStartPath = capacitorBridge?.config.appStartFileURL.path ?? ""

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
        while(!(object is UIViewController) && object != nil) {
            object = object?.next
        }
        return object as? UIViewController
    }
}

