import Foundation
import Dispatch
import WebKit
import Cordova

/**
 An internal class adopting a public protocol means that we have a lot of `public` methods
 but that is by design not a mistake. And since the bridge is the center of the whole project
 its size/complexity is unavoidable.

 Quiet these warnings for the whole file.
 */
// swiftlint:disable lower_acl_than_parent
// swiftlint:disable file_length
// swiftlint:disable type_body_length
internal class CapacitorBridge: NSObject, CAPBridgeProtocol {

    // this decision is needed before the bridge is instantiated,
    // so we need a class property to avoid duplication
    internal static var isDevEnvironment: Bool {
        #if DEBUG
        return true
        #else
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
    public static let defaultScheme = "capacitor"

    var webViewAssetHandler: WebViewAssetHandler
    var webViewDelegationHandler: WebViewDelegationHandler
    weak var bridgeDelegate: CAPBridgeDelegate?
    @objc public var viewController: UIViewController? {
        return bridgeDelegate?.bridgedViewController
    }

    var lastPlugin: CAPPlugin?

    @objc public internal(set) var config: InstanceConfiguration
    // Map of all loaded and instantiated plugins by pluginId -> instance
    var plugins =  [String: CAPPlugin]()
    // List of known plugins by pluginId -> Plugin Type
    var knownPlugins = [String: CAPPlugin.Type]()
    // Manager for getting Cordova plugins
    var cordovaPluginManager: CDVPluginManager?
    // Calls we are storing to resolve later
    var storedCalls = [String: CAPPluginCall]()
    // Whether to inject the Cordova files
    private var injectCordovaFiles = false
    private var cordovaParser: CDVConfigParser?

    // Background dispatch queue for plugin calls
    var dispatchQueue = DispatchQueue(label: "bridge")
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

    init(with configuration: InstanceConfiguration, delegate bridgeDelegate: CAPBridgeDelegate, cordovaConfiguration: CDVConfigParser, assetHandler: WebViewAssetHandler, delegationHandler: WebViewDelegationHandler, autoRegisterPlugins: Bool = true) {
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
        observers.append(NotificationCenter.default.addObserver(forName: type(of: self).tmpVCAppeared.name, object: .none, queue: .none) { [weak self] _ in
            self?.tmpWindow = nil
        })
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
        storedCalls = [String: CAPPluginCall]()
    }

    /**
     Register all plugins that have been declared
     */
    func registerPlugins() {
        if autoRegisterPlugins {
            let classCount = objc_getClassList(nil, 0)
            let classes = UnsafeMutablePointer<AnyClass?>.allocate(capacity: Int(classCount))

            let releasingClasses = AutoreleasingUnsafeMutablePointer<AnyClass>(classes)
            let numClasses: Int32 = objc_getClassList(releasingClasses, classCount)

            for classIndex in 0..<Int(numClasses) {
                if let aClass: AnyClass = classes[classIndex] {
                    if class_getSuperclass(aClass) == CDVPlugin.self {
                        injectCordovaFiles = true
                    }
                    if class_conformsToProtocol(aClass, CAPBridgedPlugin.self),
                       let pluginType = aClass as? CAPPlugin.Type,
                       let bridgeType = aClass as? CAPBridgedPlugin.Type {
                        if aClass is CAPInstancePlugin.Type { continue }
                        registerPlugin(bridgeType.jsName(), pluginType)
                    }
                }
            }
            classes.deallocate()
        } else {
            // register core plugins only
            [CAPHttpPlugin.self, CAPConsolePlugin.self, CAPWebViewPlugin.self, CAPCookiesPlugin.self]
                .forEach { registerPluginType($0) }
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
        guard let bridgedType = pluginType as? CAPBridgedPlugin.Type else { return }
        registerPlugin(bridgedType.jsName(), pluginType)
    }

    public func registerPluginInstance(_ pluginInstance: CAPPlugin) {
        guard
            let pluginInstance = pluginInstance as? (CAPPlugin & CAPBridgedPlugin),
            let pluginClass = pluginInstance.classForCoder as? (CAPPlugin & CAPBridgedPlugin).Type
        else { return }

        let jsName = pluginClass.jsName()!

        knownPlugins[jsName] = pluginClass
        if plugins[jsName] != nil {
            CAPLog.print("⚡️  Overriding existing registered plugin \(pluginClass)")
        }
        plugins[jsName] = pluginInstance
        pluginInstance.load(as: pluginClass, on: self)

        JSExport.exportJS(
            userContentController: webViewDelegationHandler.contentController,
            pluginClassName: jsName,
            pluginType: pluginClass
        )
    }

    /**
     Register a single plugin.
     */
    func registerPlugin(_ jsName: String, _ pluginType: CAPPlugin.Type) {
        // let bridgeType = pluginType as! CAPBridgedPlugin.Type
        knownPlugins[jsName] = pluginType
        JSExport.exportJS(userContentController: webViewDelegationHandler.contentController, pluginClassName: jsName, pluginType: pluginType)
        _ = loadPlugin(pluginName: jsName)
    }

    /**
     - parameter pluginId: the ID of the plugin
     - returns: the plugin, if found
     */
    func getOrLoadPlugin(pluginName: String) -> CAPPlugin? {
        guard let plugin = self.plugin(withName: pluginName) ?? self.loadPlugin(pluginName: pluginName) else {
            return nil
        }
        return plugin
    }

    func loadPlugin(pluginName: String) -> CAPPlugin? {
        guard let pluginType = knownPlugins[pluginName], let bridgeType = pluginType as? CAPBridgedPlugin.Type else {
            CAPLog.print("⚡️  Unable to load plugin \(pluginName). No such module found.")
            return nil
        }

        let plugin = pluginType.init(bridge: self, pluginId: bridgeType.pluginId(), pluginName: bridgeType.jsName())
        plugin.load()
        self.plugins[bridgeType.jsName()] = plugin
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
        storedCalls.removeValue(forKey: withID)
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

    /**
     Handle a call from JavaScript. First, find the corresponding plugin, construct a selector,
     and perform that selector on the plugin instance.

     Quiet the length warning because we don't want to refactor the function at this time.
     */
    // swiftlint:disable:next function_body_length
    func handleJSCall(call: JSCall) {
        guard let plugin = self.plugin(withName: call.pluginId) ?? self.loadPlugin(pluginName: call.pluginId) else {
            CAPLog.print("⚡️  Error loading plugin \(call.pluginId) for call. Check that the pluginId is correct")
            return
        }
        guard let pluginType = knownPlugins[plugin.getId()] else {
            return
        }

        let selector: Selector
        if call.method == "addListener" || call.method == "removeListener" {
            selector = NSSelectorFromString(call.method + ":")
        } else {
            guard let bridgeType = pluginType as? CAPBridgedPlugin.Type, let method = bridgeType.getMethod(call.method) else {
                CAPLog.print("⚡️  Error calling method \(call.method) on plugin \(call.pluginId): No method found.")
                CAPLog.print("⚡️  Ensure plugin method exists and uses @objc in its declaration, and has been defined")
                return
            }

            // CAPLog.print("\n⚡️  Calling method \"\(call.method)\" on plugin \"\(plugin.getId()!)\"")

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

            let pluginCall = CAPPluginCall(callbackId: call.callbackId,
                                           options: JSTypes.coerceDictionaryToJSObject(call.options,
                                                                                       formattingDatesAsStrings: plugin.shouldStringifyDatesInCalls) ?? [:],
                                           success: {(result: CAPPluginCallResult?, pluginCall: CAPPluginCall?) -> Void in
                                            if let result = result {
                                                self?.toJs(result: JSResult(call: call, callResult: result), save: pluginCall?.keepAlive ?? false)
                                            } else {
                                                self?.toJs(result: JSResult(call: call, result: .dictionary([:])), save: pluginCall?.keepAlive ?? false)
                                            }
                                           }, error: {(error: CAPPluginCallError?) -> Void in
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

    @objc public func showAlertWith(title: String, message: String, buttonTitle: String) {
        let alert = UIAlertController(title: title, message: message, preferredStyle: UIAlertController.Style.alert)
        alert.addAction(UIAlertAction(title: buttonTitle, style: UIAlertAction.Style.default, handler: nil))
        self.viewController?.present(alert, animated: true, completion: nil)
    }

    @objc public func presentVC(_ viewControllerToPresent: UIViewController, animated flag: Bool, completion: (() -> Void)? = nil) {
        if viewControllerToPresent.modalPresentationStyle == .popover {
            self.viewController?.present(viewControllerToPresent, animated: flag, completion: completion)
        } else {
            self.tmpWindow = UIWindow.init(frame: UIScreen.main.bounds)
            self.tmpWindow?.rootViewController = TmpViewController.init()
            self.tmpWindow?.makeKeyAndVisible()
            self.tmpWindow?.rootViewController?.present(viewControllerToPresent, animated: flag, completion: completion)
        }
    }

    @objc public func dismissVC(animated flag: Bool, completion: (() -> Void)? = nil) {
        if self.tmpWindow == nil {
            self.viewController?.dismiss(animated: flag, completion: completion)
        } else {
            self.tmpWindow?.rootViewController?.dismiss(animated: flag, completion: completion)
            self.tmpWindow = nil
        }
    }
}
