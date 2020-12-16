//
//  ViewController.swift
//  IonicRunner
//

import UIKit
import WebKit
import Cordova

public class CAPBridgeViewController: UIViewController, CAPBridgeDelegate {

    private var webView: WKWebView?

    public var bridgedWebView: WKWebView? {
        return webView
    }

    public var bridgedViewController: UIViewController? {
        return self
    }
    private var hostname: String?
    private var allowNavigationConfig: [String]?
    private var basePath: String = ""
    private let assetsFolder = "public"

    private var isStatusBarVisible = true
    private var statusBarStyle: UIStatusBarStyle = .default
    private(set) var statusBarAnimation: UIStatusBarAnimation = .slide
    @objc public var supportedOrientations: [Int] = []

    @objc public var startDir = ""

    // Construct the Capacitor runtime
    private var capacitorBridge: CapacitorBridge?
    var bridge: CAPBridgeProtocol? {
        return capacitorBridge
    }

    override public func loadView() {
        // load the configuration and set the logging flag
        let configDescriptor = InstanceDescriptor.init()
        let configuration = InstanceConfiguration(with: configDescriptor)
        CAPLog.enableLogging = configuration.enableLogging
        logWarnings(for: configDescriptor)

        // get the starting path and configure our environment
        guard let startPath = self.getStartPath(deployDisabled: configuration.cordovaDeployDisabled) else {
            return
        }
        setStatusBarDefaults()
        setScreenOrientationDefaults()

        // get the web view
        let assetHandler = WebViewAssetHandler()
        assetHandler.setAssetPath(startPath)
        let delegationHandler = WebViewDelegationHandler()
        webView = prepareWebView(with: configuration, assetHandler: assetHandler, delegationHandler: delegationHandler)
        view = webView
        // create the bridge
        capacitorBridge = CapacitorBridge(with: configuration,
                                          delegate: self,
                                          cordovaConfiguration: configDescriptor.cordovaConfiguration,
                                          assetHandler: assetHandler,
                                          delegationHandler: delegationHandler)
    }

    private func prepareWebView(with configuration: InstanceConfiguration, assetHandler: WebViewAssetHandler, delegationHandler: WebViewDelegationHandler) -> WKWebView {
        // set the cookie policy
        HTTPCookieStorage.shared.cookieAcceptPolicy = HTTPCookie.AcceptPolicy.always
        // setup the web view configuration
        let webViewConfiguration = WKWebViewConfiguration()
        webViewConfiguration.allowsInlineMediaPlayback = true
        webViewConfiguration.suppressesIncrementalRendering = false
        webViewConfiguration.allowsAirPlayForMediaPlayback = true
        webViewConfiguration.mediaTypesRequiringUserActionForPlayback = []
        if let appendUserAgent = configuration.appendedUserAgentString {
            webViewConfiguration.applicationNameForUserAgent = appendUserAgent
        }
        webViewConfiguration.setURLSchemeHandler(assetHandler, forURLScheme: configuration.localURL.scheme ?? InstanceDescriptorDefaults.scheme)
        webViewConfiguration.userContentController = delegationHandler.contentController
        // create the web view and set its properties
        let webView = WKWebView(frame: .zero, configuration: webViewConfiguration)
        webView.scrollView.bounces = false
        webView.scrollView.contentInsetAdjustmentBehavior = configuration.contentInsetAdjustmentBehavior
        webView.uiDelegate = delegationHandler
        webView.navigationDelegate = delegationHandler
        webView.allowsLinkPreview = configuration.allowLinkPreviews
        webView.configuration.preferences.setValue(true, forKey: "allowFileAccessFromFileURLs")
        webView.scrollView.isScrollEnabled = configuration.enableScrolling
        if let overrideUserAgent = configuration.overridenUserAgentString {
            webView.customUserAgent = overrideUserAgent
        }
        if let backgroundColor = configuration.backgroundColor {
            webView.backgroundColor = backgroundColor
            webView.scrollView.backgroundColor = backgroundColor
        } else if #available(iOS 13, *) {
            // Use the system background colors if background is not set by user
            webView.backgroundColor = UIColor.systemBackground
            webView.scrollView.backgroundColor = UIColor.systemBackground
        }
        webView.capacitor.setKeyboardShouldRequireUserInteraction(false)
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

    private func getStartPath(deployDisabled: Bool = false) -> String? {
        var resourcesPath = assetsFolder
        if !startDir.isEmpty {
            resourcesPath = URL(fileURLWithPath: resourcesPath).appendingPathComponent(startDir).relativePath
        }

        guard var startPath = Bundle.main.path(forResource: resourcesPath, ofType: nil) else {
            printLoadError()
            return nil
        }

        if !deployDisabled && !isNewBinary() {
            let defaults = UserDefaults.standard
            let persistedPath = defaults.string(forKey: "serverBasePath")
            if persistedPath != nil && !persistedPath!.isEmpty {
                let libPath = NSSearchPathForDirectoriesInDomains(.libraryDirectory, .userDomainMask, true)[0]
                let cordovaDataDirectory = (libPath as NSString).appendingPathComponent("NoCloud")
                let snapshots = (cordovaDataDirectory as NSString).appendingPathComponent("ionic_built_snapshots")
                startPath = (snapshots as NSString).appendingPathComponent((persistedPath! as NSString).lastPathComponent)
            }
        }

        self.basePath = startPath
        return startPath
    }

    func isNewBinary() -> Bool {
        if let plist = Bundle.main.infoDictionary {
            if let versionCode = plist["CFBundleVersion"] as? String, let versionName = plist["CFBundleShortVersionString"] as? String {
                let prefs = UserDefaults.standard
                let lastVersionCode = prefs.string(forKey: "lastBinaryVersionCode")
                let lastVersionName = prefs.string(forKey: "lastBinaryVersionName")
                if !versionCode.isEqual(lastVersionCode) || !versionName.isEqual(lastVersionName) {
                    prefs.set(versionCode, forKey: "lastBinaryVersionCode")
                    prefs.set(versionName, forKey: "lastBinaryVersionName")
                    prefs.set("", forKey: "serverBasePath")
                    prefs.synchronize()
                    return true
                }
            }
        }
        return false
    }

    override public func viewDidLoad() {
        super.viewDidLoad()
        self.becomeFirstResponder()
        loadWebView()
    }

    func printLoadError() {
        let fullStartPath = URL(fileURLWithPath: assetsFolder).appendingPathComponent(startDir)

        CAPLog.print("⚡️  ERROR: Unable to load \(fullStartPath.relativePath)/index.html")
        CAPLog.print("⚡️  This file is the root of your web app and must exist before")
        CAPLog.print("⚡️  Capacitor can run. Ensure you've run capacitor copy at least")
        CAPLog.print("⚡️  or, if embedding, that this directory exists as a resource directory.")
    }

    func fatalLoadError() -> Never {
        printLoadError()
        exit(1)
    }

    func loadWebView() {
        if let webView = webView {
            capacitorBridge?.webViewDelegationHandler.willLoadWebview(webView)
        }

        let fullStartPath = URL(fileURLWithPath: assetsFolder).appendingPathComponent(startDir).appendingPathComponent("index")
        if Bundle.main.path(forResource: fullStartPath.relativePath, ofType: "html") == nil {
            fatalLoadError()
        }

        guard let url = bridge?.config.serverURL else {
            CAPLog.print("⚡️  Unable to load app: Missing URL!")
            return
        }
        hostname = url.absoluteString

        CAPLog.print("⚡️  Loading app at \(hostname!)...")
        _ = webView?.load(URLRequest(url: url))
    }

    func setServerPath(path: String) {
        self.basePath = path
        capacitorBridge?.webViewAssetHandler.setAssetPath(path)
    }

    public func setStatusBarDefaults() {
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

    public func setScreenOrientationDefaults() {
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

    override public func canPerformUnwindSegueAction(_ action: Selector, from fromViewController: UIViewController, withSender sender: Any) -> Bool {
        return false
    }

    override public func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }

    override public var prefersStatusBarHidden: Bool {
        get {
            return !isStatusBarVisible
        }
    }

    override public var preferredStatusBarStyle: UIStatusBarStyle {
        get {
            return statusBarStyle
        }
    }

    override public var preferredStatusBarUpdateAnimation: UIStatusBarAnimation {
        get {
            return statusBarAnimation
        }
    }

    public func setStatusBarVisible(_ isStatusBarVisible: Bool) {
        self.isStatusBarVisible = isStatusBarVisible
        UIView.animate(withDuration: 0.2, animations: {
            self.setNeedsStatusBarAppearanceUpdate()
        })
    }

    public func setStatusBarStyle(_ statusBarStyle: UIStatusBarStyle) {
        self.statusBarStyle = statusBarStyle
        UIView.animate(withDuration: 0.2, animations: {
            self.setNeedsStatusBarAppearanceUpdate()
        })
    }

    public func setStatusBarAnimation(_ statusBarAnimation: UIStatusBarAnimation) {
        self.statusBarAnimation = statusBarAnimation
    }

    public func getWebView() -> WKWebView {
        return self.webView!
    }

    public func getServerBasePath() -> String {
        return self.basePath
    }

    public func setServerBasePath(path: String) {
        setServerPath(path: path)
        let request = URLRequest(url: URL(string: hostname!)!)
        DispatchQueue.main.async {
            _ = self.getWebView().load(request)
        }
    }

    override public var supportedInterfaceOrientations: UIInterfaceOrientationMask {
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

    /**
     * Add hooks to detect failed HTTP requests

     func webView(webView: WKWebView,
     didFailProvisionalNavigation navigation: WKNavigation!,
     withError error: NSError) {
     if error.code == -1001 { // TIMED OUT:
     // CODE to handle TIMEOUT
     } else if error.code == -1003 { // SERVER CANNOT BE FOUND
     // CODE to handle SERVER not found
     } else if error.code == -1100 { // URL NOT FOUND ON SERVER
     // CODE to handle URL not found
     }
     }
     */

}
