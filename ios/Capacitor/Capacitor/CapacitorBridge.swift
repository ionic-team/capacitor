import Foundation
import Dispatch
import WebKit
import Cordova

internal typealias CapacitorPlugin = CAPPlugin & CAPBridgedPlugin

struct RegistrationList: Codable {
    let packageClassList: Set<String>
}

/**
 An internal class adopting a public protocol means that we have a lot of `public` methods
 but that is by design not a mistake. And since the bridge is the center of the whole project
 its size/complexity is unavoidable.

 Quiet these warnings for the whole file.
 */
// swiftlint:disable lower_acl_than_parent
// swiftlint:disable file_length
// swiftlint:disable type_body_length
open class CapacitorBridge: NSObject, CAPBridgeProtocol {

    // this decision is needed before the bridge is instantiated,
    // so we need a class property to avoid duplication
    public static var isDevEnvironment: Bool {
        #if DEBUG
        return true
        #else
        // this is needed for SPM xcframework Capacitor.  Can eventually be removed when the SPM package moves to being source-based.
        if let debugValue = Bundle.main.object(forInfoDictionaryKey: "CAPACITOR_DEBUG") as? String, debugValue == "true" {
            return true
        }
        return false
        #endif
    }

    // MARK: - CAPBridgeProtocol: Properties

    public var webView: WKWebView? {
        return bridgeDelegate?.bridgedWebView
    }

    public let autoRegisterPlugins: Bool

    public var notificationRouter: NotificationRouter

    public var isSimEnvironment: Bool {
        #if targetEnvironment(simulator)
        return true
        #else
        return false
        #endif
    }

    public var isDevEnvironment: Bool {
        return CapacitorBridge.isDevEnvironment
    }

    public var userInterfaceStyle: UIUserInterfaceStyle {
        return viewController?.traitCollection.userInterfaceStyle ?? .unspecified
    }

    public var statusBarVisible: Bool {
        get {
            return !(viewController?.prefersStatusBarHidden ?? true)
        }
        set {
            DispatchQueue.main.async { [weak self] in
                (self?.viewController as? CAPBridgeViewController)?.setStatusBarVisible(newValue)
            }
        }
    }

    public var statusBarStyle: UIStatusBarStyle {
        get {
            return viewController?.preferredStatusBarStyle ?? .default
        }
        set {
            DispatchQueue.main.async { [weak self] in
                (self?.viewController as? CAPBridgeViewController)?.setStatusBarStyle(newValue)
            }
        }
    }

    public var statusBarAnimation: UIStatusBarAnimation {
        get {
            return (viewController as? CAPBridgeViewController)?.statusBarAnimation ?? .slide
        }
        set {
            DispatchQueue.main.async { [weak self] in
                (self?.viewController as? CAPBridgeViewController)?.setStatusBarAnimation(newValue)
            }
        }
    }

    var tmpWindow: UIWindow?
    static let tmpVCAppeared = Notification(name: Notification.Name(rawValue: "tmpViewControllerAppeared"))
    public static let capacitorSite = "https://capacitorjs.com/"
    public static let fileStartIdentifier = "/_capacitor_file_"
    public static let httpInterceptorStartIdentifier = "/_capacitor_http_interceptor_"
    @available(*, deprecated, message: "`httpsInterceptorStartIdentifier` is no longer required. All proxied requests are handled via `httpInterceptorStartIdentifier` instead")
    public static let httpsInterceptorStartIdentifier = "/_capacitor_https_interceptor_"
    public static let httpInterceptorUrlParam = "u"
    public static let defaultScheme = "capacitor"

    public private(set) var webViewAssetHandler: WebViewAssetHandler
    public private(set) var webViewDelegationHandler: WebViewDelegationHandler
    public private(set) weak var bridgeDelegate: CAPBridgeDelegate?
    @objc public var viewController: UIViewController? {
        return bridgeDelegate?.bridgedViewController
    }

    var lastPlugin: CAPPlugin?

    @objc public var config: InstanceConfiguration
    // Map of all loaded and instantiated plugins by pluginId -> instance
    var plugins =  [String: CapacitorPlugin]()
    // Manager for getting Cordova plugins
    var cordovaPluginManager: CDVPluginManager?
    // Calls we are storing to resolve later
    var storedCalls = ConcurrentDictionary<CAPPluginCall>()
    // Whether to inject the Cordova files
    private var injectCordovaFiles = false
    private var cordovaParser: CDVConfigParser?
    private var injectMiscFiles: [String] = []
    private var canInjectJS: Bool = true

    // Background dispatch queue for plugin calls
    open private(set) var dispatchQueue = DispatchQueue(label: "bridge")
    // Array of block based observers
    var observers: [NSObjectProtocol] = []

    // MARK: - CAPBridgeProtocol: Deprecated

    public func getWebView() -> WKWebView? {
        return webView
    }

    public func isSimulator() -> Bool {
        return isSimEnvironment
    }

    public func isDevMode() -> Bool {
        return isDevEnvironment
    }

    public func getStatusBarVisible() -> Bool {
        return statusBarVisible
    }

    @nonobjc public func setStatusBarVisible(_ visible: Bool) {
        statusBarVisible = visible
    }

    public func getStatusBarStyle() -> UIStatusBarStyle {
        return statusBarStyle
    }
    @nonobjc public func setStatusBarStyle(_ style: UIStatusBarStyle) {
        statusBarStyle = style
    }

    public func getUserInterfaceStyle() -> UIUserInterfaceStyle {
        return userInterfaceStyle
    }

    public func getLocalUrl() -> String {
        return config.localURL.absoluteString
    }

    @nonobjc public func setStatusBarAnimation(_ animation: UIStatusBarAnimation) {
        statusBarAnimation = animation
    }

    public func setServerBasePath(_ path: String) {
        let url = URL(fileURLWithPath: path, isDirectory: true)
        guard FileManager.default.fileExists(atPath: url.path) else { return }
        config = config.updatingAppLocation(url)
        webViewAssetHandler.setAssetPath(url.path)
    }

    // MARK: - Static Methods

    /**
     Print a hopefully informative error message to the log when something
     particularly dreadful happens.
     */
    static func fatalError(_ error: Error, _ originalError: Error) {
        CAPLog.print("⚡️ ❌  Capacitor: FATAL ERROR")
        CAPLog.print("⚡️ ❌  Error was: ", originalError.localizedDescription)
        switch error {
        case CapacitorBridgeError.errorExportingCoreJS:
            CAPLog.print("⚡️ ❌  Unable to export required Bridge JavaScript. Bridge will not function.")
            CAPLog.print("⚡️ ❌  You should run \"npx capacitor copy\" to ensure the Bridge JS is added to your project.")
            if let wke = originalError as? WKError {
                CAPLog.print("⚡️ ❌ ", wke.userInfo)
            }
        default:
            CAPLog.print("⚡️ ❌  Unknown error")
        }

        CAPLog.print("⚡️ ❌  Please verify your installation or file an issue")
    }

    // MARK: - Initialization

    public init(with configuration: InstanceConfiguration, delegate bridgeDelegate: CAPBridgeDelegate, cordovaConfiguration: CDVConfigParser, assetHandler: WebViewAssetHandler, delegationHandler: WebViewDelegationHandler, autoRegisterPlugins: Bool = true) {
        self.bridgeDelegate = bridgeDelegate
        self.webViewAssetHandler = assetHandler
        self.webViewDelegationHandler = delegationHandler
        self.config = configuration
        self.cordovaParser = cordovaConfiguration
        self.notificationRouter = NotificationRouter()
        self.notificationRouter.handleApplicationNotifications = configuration.handleApplicationNotifications
        self.autoRegisterPlugins = autoRegisterPlugins
        super.init()

        self.webViewDelegationHandler.bridge = self

        exportCoreJS(localUrl: configuration.localURL.absoluteString)
        registerPlugins()
        setupCordovaCompatibility()
        exportMiscJS()
        canInjectJS = false
        observers.append(NotificationCenter.default.addObserver(forName: type(of: self).tmpVCAppeared.name, object: .none, queue: .none) { [weak self] _ in
            self?.tmpWindow = nil
        })

        self.setupWebDebugging(configuration: configuration)
    }

    deinit {
        // the message handler needs to removed to avoid any retain cycles
        webViewDelegationHandler.cleanUp()
        for observer in observers {
            NotificationCenter.default.removeObserver(observer)
        }
    }

    // MARK: - Plugins
    /**
     Export core JavaScript to the webview
     */
    func exportCoreJS(localUrl: String) {
        do {
            try JSExport.exportCapacitorGlobalJS(userContentController: webViewDelegationHandler.contentController,
                                                 isDebug: isDevEnvironment,
                                                 loggingEnabled: config.loggingEnabled,
                                                 localUrl: localUrl)
            try JSExport.exportBridgeJS(userContentController: webViewDelegationHandler.contentController)
        } catch {
            type(of: self).fatalError(error, error)
        }
    }

    /**
     Export misc JavaScript to the webview
     */
    func exportMiscJS() {
        JSExport.exportMiscFileJS(paths: injectMiscFiles, userContentController: webViewDelegationHandler.contentController)
        injectMiscFiles.removeAll()
    }

    /**
     Set up our Cordova compat by loading all known Cordova plugins and injecting their JS.
     */
    func setupCordovaCompatibility() {
        if injectCordovaFiles {
            exportCordovaJS()
            registerCordovaPlugins()
        } else {
            observers.append(NotificationCenter.default.addObserver(forName: UIApplication.willEnterForegroundNotification, object: nil, queue: OperationQueue.main) { [weak self] (_) in
                self?.triggerDocumentJSEvent(eventName: "resume")
            })
            observers.append(NotificationCenter.default.addObserver(forName: UIApplication.didEnterBackgroundNotification, object: nil, queue: OperationQueue.main) { [weak self] (_) in
                self?.triggerDocumentJSEvent(eventName: "pause")
            })
        }
    }

    /**
     Export the core Cordova JS runtime
     */
    func exportCordovaJS() {
        do {
            try JSExport.exportCordovaJS(userContentController: webViewDelegationHandler.contentController)
        } catch {
            type(of: self).fatalError(error, error)
        }
    }

    /**
     Reset the state of the bridge between navigations to avoid
     sending data back to the page from a previous page.
     */
    func reset() {
        storedCalls.withLock { $0.removeAll() }
        removeAllPluginListeners()
    }

    /**
     Register all plugins that have been declared
     */
    func registerPlugins() {
        var pluginList: [AnyClass] = [CAPHttpPlugin.self, CAPConsolePlugin.self, CAPWebViewPlugin.self, CAPCookiesPlugin.self]

        if autoRegisterPlugins {
            do {
                if let pluginJSON = Bundle.main.url(forResource: "capacitor.config", withExtension: "json") {
                    let pluginData = try Data(contentsOf: pluginJSON)
                    let registrationList = try JSONDecoder().decode(RegistrationList.self, from: pluginData)

                    for plugin in registrationList.packageClassList {
                        if let pluginClass = NSClassFromString(plugin) {
                            if pluginClass == CDVPlugin.self {
                                injectCordovaFiles = true
                            } else {
                                pluginList.append(pluginClass)
                            }
                        }
                    }
                }
            } catch {
                CAPLog.print("Error registering plugins: \(error)")
            }
        }

        for plugin in pluginList {
            if plugin is CAPInstancePlugin.Type { continue }
            if let capPlugin = plugin as? CapacitorPlugin.Type {
                registerPlugin(capPlugin)
            }
        }
    }

    public func registerPluginType(_ pluginType: CAPPlugin.Type) {
        if autoRegisterPlugins { return }
        if pluginType is CAPInstancePlugin.Type {
            Swift.fatalError("""

            ⚡️ ❌  Cannot register class \(pluginType): CAPInstancePlugin through registerPluginType(_:).
            ⚡️ ❌  Use `registerPluginInstance(_:)` to register subclasses of CAPInstancePlugin.
            """)
        }
        guard let bridgedType = pluginType as? CapacitorPlugin.Type else { return }
        registerPlugin(bridgedType)
    }

    public func registerPluginInstance(_ pluginInstance: CAPPlugin) {
        guard let pluginInstance = pluginInstance as? CapacitorPlugin else {
            CAPLog.print("""

            ⚡️  Plugin \(pluginInstance.classForCoder) must conform to CAPBridgedPlugin.
            ⚡️  Not loading plugin \(pluginInstance.classForCoder)
            """)
            return
        }

        if plugins[pluginInstance.jsName] != nil {
            CAPLog.print("⚡️  Overriding existing registered plugin \(pluginInstance.classForCoder)")
        }
        plugins[pluginInstance.jsName] = pluginInstance
        pluginInstance.load(on: self)

        JSExport.exportJS(for: pluginInstance, in: webViewDelegationHandler.contentController)
    }

    /**
     Register a single plugin.
     */
    func registerPlugin(_ pluginType: CapacitorPlugin.Type) {
        if let plugin = loadPlugin(type: pluginType) {
            JSExport.exportJS(for: plugin, in: webViewDelegationHandler.contentController)
        }
    }

    func loadPlugin(type: CAPPlugin.Type) -> CapacitorPlugin? {
        guard let plugin = type.init() as? CapacitorPlugin else {
            CAPLog.print("⚡️  Unable to load plugin \(type.classForCoder()). No such module found.")
            return nil
        }
        plugin.load(on: self)
        plugins[plugin.jsName] = plugin
        return plugin
    }

    // MARK: - CAPBridgeProtocol: Plugin Access

    @objc public func plugin(withName: String) -> CAPPlugin? {
        return self.plugins[withName]
    }

    // MARK: - CAPBridgeProtocol: Call Management

    @objc public func saveCall(_ call: CAPPluginCall) {
        storedCalls[call.callbackId] = call
    }

    @objc public func savedCall(withID: String) -> CAPPluginCall? {
        return storedCalls[withID]
    }

    @objc public func releaseCall(_ call: CAPPluginCall) {
        releaseCall(withID: call.callbackId)
    }

    @objc public func releaseCall(withID: String) {
        _ = storedCalls.withLock { $0.removeValue(forKey: withID) }
    }

    // MARK: - Deprecated Versions

    @objc public func getSavedCall(_ callbackId: String) -> CAPPluginCall? {
        return savedCall(withID: callbackId)
    }

    @objc public func releaseCall(callbackId: String) {
        releaseCall(withID: callbackId)
    }

    // MARK: - Internal

    func getDispatchQueue() -> DispatchQueue {
        return self.dispatchQueue
    }

    func registerCordovaPlugins() {
        guard let cordovaParser = cordovaParser else {
            return
        }
        cordovaPluginManager = CDVPluginManager.init(parser: cordovaParser, viewController: self.viewController, webView: self.getWebView())
        if cordovaParser.startupPluginNames.count > 0 {
            for pluginName in cordovaParser.startupPluginNames {
                _ = cordovaPluginManager?.getCommandInstance(pluginName as? String)
            }
        }
        do {
            try JSExport.exportCordovaPluginsJS(userContentController: webViewDelegationHandler.contentController)
        } catch {
            type(of: self).fatalError(error, error)
        }
    }

    func reload() {
        self.getWebView()?.reload()
    }

    func docLink(_ url: String) -> String {
        return "\(type(of: self).capacitorSite)docs/\(url)"
    }

    private func setupWebDebugging(configuration: InstanceConfiguration) {
        let isWebDebuggable = configuration.isWebDebuggable
        if isWebDebuggable, #unavailable(iOS 16.4) {
            CAPLog.print("⚡️ Warning: isWebDebuggable only functions as intended on iOS 16.4 and above.")
        }

        if #available(iOS 16.4, *) {
            self.webView?.isInspectable = isWebDebuggable
        }
    }

    /**
     Handle a call from JavaScript. First, find the corresponding plugin, construct a selector,
     and perform that selector on the plugin instance.

     Quiet the length warning because we don't want to refactor the function at this time.
     */
    // swiftlint:disable:next function_body_length
    func handleJSCall(call: JSCall) {
        let load = {
            NSClassFromString(call.pluginId)
                .flatMap { $0 as? CAPPlugin.Type }
                .flatMap(self.loadPlugin(type:))
        }

        guard let plugin = plugins[call.pluginId] ?? load() else {
            CAPLog.print("⚡️  Error loading plugin \(call.pluginId) for call. Check that the pluginId is correct")
            return
        }

        let selector: Selector
        if call.method == "addListener" || call.method == "removeListener" || call.method == "removeAllListeners" {
            selector = NSSelectorFromString(call.method + ":")
        } else {
            guard let method = plugin.getMethod(named: call.method) else {
                CAPLog.print("⚡️  Error calling method \(call.method) on plugin \(call.pluginId): No method found.")
                CAPLog.print("⚡️  Ensure plugin method exists and uses @objc in its declaration, and has been defined")
                return
            }

            selector = method.selector
        }

        if !plugin.responds(to: selector) {
            // we don't want to break up string literals
            // swiftlint:disable line_length
            CAPLog.print("⚡️  Error: Plugin \(plugin.getId()) does not respond to method call \"\(call.method)\" using selector \"\(selector)\".")
            CAPLog.print("⚡️  Ensure plugin method exists, uses @objc in its declaration, and arguments match selector without callbacks in CAP_PLUGIN_METHOD.")
            CAPLog.print("⚡️  Learn more: \(docLink(DocLinks.CAPPluginMethodSelector.rawValue))")
            // swiftlint:enable line_length
            return
        }

        // Create a plugin call object and handle the success/error callbacks
        dispatchQueue.async { [weak self] in
            // let startTime = CFAbsoluteTimeGetCurrent()

            let pluginCall = CAPPluginCall(callbackId: call.callbackId, methodName: call.method,
                                           options: JSTypes.coerceDictionaryToJSObject(call.options,
                                                                                       formattingDatesAsStrings: plugin.shouldStringifyDatesInCalls) ?? [:],
                                           success: {(result: CAPPluginCallResult?, pluginCall: CAPPluginCall?) in
                                            if let result = result {
                                                self?.toJs(result: JSResult(call: call, callResult: result), save: pluginCall?.keepAlive ?? false)
                                            } else {
                                                self?.toJs(result: JSResult(call: call, result: .dictionary([:])), save: pluginCall?.keepAlive ?? false)
                                            }
                                           }, error: {(error: CAPPluginCallError?) in
                                            if let error = error {
                                                self?.toJsError(error: JSResultError(call: call, callError: error))
                                            } else {
                                                self?.toJsError(error: JSResultError(call: call,
                                                                                     errorMessage: "",
                                                                                     errorDescription: "",
                                                                                     errorCode: nil,
                                                                                     result: .dictionary([:])))
                                            }
                                           })

            if let pluginCall = pluginCall {
                plugin.perform(selector, with: pluginCall)
                if pluginCall.keepAlive {
                    self?.saveCall(pluginCall)
                }
            }

            // let timeElapsed = CFAbsoluteTimeGetCurrent() - startTime
            // CAPLog.print("Native call took", timeElapsed)
        }
    }

    /**
     Handle a Cordova call from JavaScript. First, find the corresponding plugin,
     construct a selector, and perform that selector on the plugin instance.
     */
    func handleCordovaJSCall(call: JSCall) {
        // Create a selector to send to the plugin

        if let plugin = self.cordovaPluginManager?.getCommandInstance(call.pluginId.lowercased()) {
            let selector = NSSelectorFromString("\(call.method):")
            if !plugin.responds(to: selector) {
                CAPLog.print("Error: Plugin \(plugin.className ?? "") does not respond to method call \(selector).")
                CAPLog.print("Ensure plugin method exists and uses @objc in its declaration")
                return
            }

            let arguments: [Any] = call.options["options"] as? [Any] ?? []
            let pluginCall = CDVInvokedUrlCommand(arguments: arguments,
                                                  callbackId: call.callbackId,
                                                  className: plugin.className,
                                                  methodName: call.method)
            plugin.perform(selector, with: pluginCall)

        } else {
            CAPLog.print("Error: Cordova Plugin mapping not found")
            return
        }
    }

    func removeAllPluginListeners() {
        for plugin in plugins.values {
            plugin.perform(#selector(CAPPlugin.removeAllListeners(_:)), with: nil)
        }
    }

    /**
     Send a successful result to the JavaScript layer.
     */
    func toJs(result: JSResultProtocol, save: Bool) {
        let resultJson = result.jsonPayload()
        CAPLog.print("⚡️  TO JS", resultJson.prefix(256))

        DispatchQueue.main.async {
            self.webView?.evaluateJavaScript("""
             window.Capacitor.fromNative({
             callbackId: '\(result.callbackID)',
             pluginId: '\(result.pluginID)',
             methodName: '\(result.methodName)',
             save: \(save),
             success: true,
             data: \(resultJson)
             })
            """) { (_, error) in
                if let error = error {
                    CAPLog.print(error)
                }
            }
        }
    }

    /**
     Send an error result to the JavaScript layer.
     */
    func toJsError(error: JSResultProtocol) {
        DispatchQueue.main.async {
            self.webView?.evaluateJavaScript("window.Capacitor.fromNative({ callbackId: '\(error.callbackID)', pluginId: '\(error.pluginID)', methodName: '\(error.methodName)', success: false, error: \(error.jsonPayload())})") { (_, error) in
                if let error = error {
                    CAPLog.print(error)
                }
            }
        }
    }

    // MARK: - CAPBridgeProtocol: JavaScript Handling

    /**
     Inject JavaScript from an external file before the WebView loads.

     `path` is relative to the public folder
     */
    public func injectScriptBeforeLoad(path: String) {
        if canInjectJS {
            injectMiscFiles.append(path)
        }
    }

    /**
     Eval JS for a specific plugin.

     `js` is a short name but needs to be preserved for backwards compatibility.
     */
    // swiftlint:disable:next identifier_name
    @objc public func evalWithPlugin(_ plugin: CAPPlugin, js: String) {
        let wrappedJs = """
        window.Capacitor.withPlugin('\(plugin.getId())', function(plugin) {
        if(!plugin) { console.error('Unable to execute JS in plugin, no such plugin found for id \(plugin.getId())'); }
        \(js)
        });
        """

        DispatchQueue.main.async {
            self.getWebView()?.evaluateJavaScript(wrappedJs, completionHandler: { (_, error) in
                if let error = error {
                    CAPLog.print("⚡️  JS Eval error", error.localizedDescription)
                }
            })
        }
    }

    /**
     Eval JS in the web view

     `js` is a short name but needs to be preserved for backwards compatibility.
     */
    // swiftlint:disable:next identifier_name
    @objc public func eval(js: String) {
        DispatchQueue.main.async {
            self.getWebView()?.evaluateJavaScript(js, completionHandler: { (_, error) in
                if let error = error {
                    CAPLog.print("⚡️  JS Eval error", error.localizedDescription)
                }
            })
        }
    }

    @objc public func triggerJSEvent(eventName: String, target: String) {
        self.eval(js: "window.Capacitor.triggerEvent('\(eventName)', '\(target)')")
    }

    @objc public func triggerJSEvent(eventName: String, target: String, data: String) {
        self.eval(js: "window.Capacitor.triggerEvent('\(eventName)', '\(target)', \(data))")
    }

    @objc public func triggerWindowJSEvent(eventName: String) {
        self.triggerJSEvent(eventName: eventName, target: "window")
    }

    @objc public func triggerWindowJSEvent(eventName: String, data: String) {
        self.triggerJSEvent(eventName: eventName, target: "window", data: data)
    }

    @objc public func triggerDocumentJSEvent(eventName: String) {
        self.triggerJSEvent(eventName: eventName, target: "document")
    }

    @objc public func triggerDocumentJSEvent(eventName: String, data: String) {
        self.triggerJSEvent(eventName: eventName, target: "document", data: data)
    }

    public func logToJs(_ message: String, _ level: String = "log") {
        DispatchQueue.main.async {
            self.getWebView()?.evaluateJavaScript("window.Capacitor.logJs('\(message)', '\(level)')") { (result, error) in
                if error != nil, let result = result {
                    CAPLog.print(result)
                }
            }
        }
    }

    // MARK: - CAPBridgeProtocol: Paths, Files, Assets

    /**
     Translate a URL from the web view into a file URL for native iOS.

     The web view may be handling several different types of URLs:
     - res:// (shortcut scheme to web assets)
     - file:// (fully qualified URL to file on the local device)
     - base64:// (to be implemented)
     - [web view scheme]:// (already converted once to load in the web view, to be implemented)
     */
    public func localURL(fromWebURL webURL: URL?) -> URL? {
        guard let inputURL = webURL else {
            return nil
        }

        let url: URL

        switch inputURL.scheme {
        case "res":
            url = config.appLocation.appendingPathComponent(inputURL.path)
        case "file":
            url = inputURL
        default:
            return nil
        }

        return url
    }

    /**
     Translate a file URL for native iOS into a URL to load in the web view.
     */
    public func portablePath(fromLocalURL localURL: URL?) -> URL? {
        guard let inputURL = localURL else {
            return nil
        }

        return self.config.localURL.appendingPathComponent(CapacitorBridge.fileStartIdentifier).appendingPathComponent(inputURL.path)
    }

    // MARK: - CAPBridgeProtocol: View Presentation

    @objc open func showAlertWith(title: String, message: String, buttonTitle: String) {
        let alert = UIAlertController(title: title, message: message, preferredStyle: UIAlertController.Style.alert)
        alert.addAction(UIAlertAction(title: buttonTitle, style: UIAlertAction.Style.default, handler: nil))
        self.viewController?.present(alert, animated: true, completion: nil)
    }

    @objc open func presentVC(_ viewControllerToPresent: UIViewController, animated flag: Bool, completion: (() -> Void)? = nil) {
        if viewControllerToPresent.modalPresentationStyle == .popover {
            self.viewController?.present(viewControllerToPresent, animated: flag, completion: completion)
        } else {
            self.tmpWindow = UIWindow.init(frame: UIScreen.main.bounds)
            self.tmpWindow?.rootViewController = TmpViewController.init()
            self.tmpWindow?.makeKeyAndVisible()
            self.tmpWindow?.rootViewController?.present(viewControllerToPresent, animated: flag, completion: completion)
        }
    }

    @objc open func dismissVC(animated flag: Bool, completion: (() -> Void)? = nil) {
        if self.tmpWindow == nil {
            self.viewController?.dismiss(animated: flag, completion: completion)
        } else {
            self.tmpWindow?.rootViewController?.dismiss(animated: flag, completion: completion)
            self.tmpWindow = nil
        }
    }
}
