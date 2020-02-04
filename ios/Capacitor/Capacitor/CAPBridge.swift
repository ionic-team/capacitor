import Foundation
import Dispatch
import WebKit
import Cordova

enum BridgeError: Error {
  case errorExportingCoreJS
}

@objc public class CAPBridge : NSObject {

  public static let statusBarTappedNotification = Notification(name: Notification.Name(rawValue: "statusBarTappedNotification"))
  public static var CAP_SITE = "https://capacitor.ionicframework.com/"
  public static var CAP_FILE_START = "/_capacitor_file_"
  public static let CAP_DEFAULT_SCHEME = "capacitor"

  // The last URL that caused the app to open
  private static var lastUrl: URL?
  
  public var userContentController: WKUserContentController
  public var bridgeDelegate: CAPBridgeDelegate
  @objc public var viewController: UIViewController {
    return bridgeDelegate.bridgedViewController!
  }
  
  private var localUrl: String?

  public var lastPlugin: CAPPlugin?
  
  @objc public var config: CAPConfig
  // Map of all loaded and instantiated plugins by pluginId -> instance
  public var plugins =  [String:CAPPlugin]()
  // List of known plugins by pluginId -> Plugin Type
  public var knownPlugins = [String:CAPPlugin.Type]()
  // Manager for getting Cordova plugins
  public var cordovaPluginManager: CDVPluginManager?
  // Calls we are storing to resolve later
  public var storedCalls = [String:CAPPluginCall]()
  // Scheme to use when serving content
  public var scheme: String
  // Whether the app is active
  private var isActive = true

  // Background dispatch queue for plugin calls
  public var dispatchQueue = DispatchQueue(label: "bridge")

  public var notificationsDelegate : CAPUNUserNotificationCenterDelegate

  public init(_ bridgeDelegate: CAPBridgeDelegate, _ userContentController: WKUserContentController, _ config: CAPConfig, _ scheme: String) {
    self.bridgeDelegate = bridgeDelegate
    self.userContentController = userContentController
    self.notificationsDelegate = CAPUNUserNotificationCenterDelegate()
    self.config = config
    self.scheme = scheme

    super.init()

    self.notificationsDelegate.bridge = self;
    localUrl = "\(self.scheme)://\(config.getString("server.hostname") ?? "localhost")"
    exportCoreJS(localUrl: localUrl!)
    registerPlugins()
    setupCordovaCompatibility()
    bindObservers()
  }
  
  public func setStatusBarVisible(_ isStatusBarVisible: Bool) {
    guard let bridgeVC = self.viewController as? CAPBridgeViewController else {
      return
    }
    DispatchQueue.main.async {
      bridgeVC.setStatusBarVisible(isStatusBarVisible)
    }
  }
  
  public func setStatusBarStyle(_ statusBarStyle: UIStatusBarStyle) {
    guard let bridgeVC = self.viewController as? CAPBridgeViewController else {
      return
    }
    DispatchQueue.main.async {
      bridgeVC.setStatusBarStyle(statusBarStyle)
    }
  }

  public func getStatusBarVisible() -> Bool {
    guard let bridgeVC = self.viewController as? CAPBridgeViewController else {
      return false
    }
    return !bridgeVC.prefersStatusBarHidden
  }
    
  public func getStatusBarStyle() -> UIStatusBarStyle {
    guard let bridgeVC = self.viewController as? CAPBridgeViewController else {
      return UIStatusBarStyle.default
    }
    return bridgeVC.preferredStatusBarStyle
  }

  @available(iOS 12.0, *)
  public func getUserInterfaceStyle() -> UIUserInterfaceStyle {
    guard let bridgeVC = self.viewController as? CAPBridgeViewController else {
      return UIUserInterfaceStyle.unspecified
    }
    return bridgeVC.traitCollection.userInterfaceStyle
  }
  
  /**
   * Get the last URL that triggered an open or continue activity event.
   */
  public static func getLastUrl() -> URL? {
    return lastUrl
  }
  
  /**
   * Handle an openUrl action and dispatch a notification.
   */
  public static func handleOpenUrl(_ url: URL, _ options: [UIApplication.OpenURLOptionsKey : Any]) -> Bool {
    NotificationCenter.default.post(name: Notification.Name(CAPNotifications.URLOpen.name()), object: [
      "url": url,
      "options": options
    ])
    NotificationCenter.default.post(name: NSNotification.Name.CDVPluginHandleOpenURL, object: url)
    CAPBridge.lastUrl = url
    return true
  }
  
  /**
   * Handle continueUserActivity, for now this just provides universal link responding support.
   */
  public static func handleContinueActivity(_ userActivity: NSUserActivity, _ restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
    // TODO: Support other types, emit to rest of plugins
    if userActivity.activityType != NSUserActivityTypeBrowsingWeb || userActivity.webpageURL == nil {
      return false
    }
    
    let url = userActivity.webpageURL
    CAPBridge.lastUrl = url
    NotificationCenter.default.post(name: Notification.Name(CAPNotifications.UniversalLinkOpen.name()), object: [
      "url": url
    ])
    return true
  }
  
  public static func handleAppBecameActive(_ application: UIApplication) {
    // no-op for now
  }
  
  /**
   * Print a hopefully informative error message to the log when something
   * particularly dreadful happens.
   */
  static func fatalError(_ error: Error, _ originalError: Error) {
    CAPLog.print("⚡️ ❌  Capacitor: FATAL ERROR")
    CAPLog.print("⚡️ ❌  Error was: ", originalError.localizedDescription)
    switch error {
    case BridgeError.errorExportingCoreJS:
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
  
  /**
   * Bind notification center observers to watch for app active/inactive status
   */
  func bindObservers() {
    let appStatePlugin = getOrLoadPlugin(pluginName: "App") as? CAPAppPlugin
    
    NotificationCenter.default.addObserver(forName: UIApplication.didBecomeActiveNotification, object: nil, queue: OperationQueue.main) { (notification) in
      CAPLog.print("APP ACTIVE")
      self.isActive = true
      appStatePlugin?.fireChange(isActive: self.isActive)
    }
    NotificationCenter.default.addObserver(forName: UIApplication.willResignActiveNotification, object: nil, queue: OperationQueue.main) { (notification) in
      CAPLog.print("APP INACTIVE")
      self.isActive = false
      appStatePlugin?.fireChange(isActive: self.isActive)
    }
  }
  
  /**
   * - Returns: whether the app is currently active
   */
  func isAppActive() -> Bool {
    return isActive
  }

  /**
   * Export core JavaScript to the webview
   */
  func exportCoreJS(localUrl: String) {
    do {
      try JSExport.exportCapacitorGlobalJS(userContentController: self.userContentController, isDebug: isDevMode(), localUrl: localUrl)
      try JSExport.exportCapacitorJS(userContentController: self.userContentController)
    } catch {
      CAPBridge.fatalError(error, error)
    }
  }

  /**
   * Set up our Cordova compat by loading all known Cordova plugins and injecting
   * their JS.
   */
  func setupCordovaCompatibility() {
    var injectCordovaFiles = false
    var numClasses = UInt32(0);
    let classes = objc_copyClassList(&numClasses)
    for i in 0..<Int(numClasses) {
      let c: AnyClass = classes![i]
      if class_getSuperclass(c) == CDVPlugin.self {
        injectCordovaFiles = true
        break
      }
    }
    if injectCordovaFiles {
      exportCordovaJS()
      registerCordovaPlugins()
    }
  }

  /**
   * Export the core Cordova JS runtime
   */
  func exportCordovaJS() {
    do {
      try JSExport.exportCordovaJS(userContentController: self.userContentController)
    } catch {
      CAPBridge.fatalError(error, error)
    }
  }
  
  /**
   * Reset the state of the bridge between navigations to avoid
   * sending data back to the page from a previous page.
   */
  func reset() {
    storedCalls = [String:CAPPluginCall]()
  }
  
  /**
   * Register all plugins that have been declared
   */
  func registerPlugins() {
    var numClasses = UInt32(0);
    let classes = objc_copyClassList(&numClasses)
    for i in 0..<Int(numClasses) {
      let c: AnyClass = classes![i]
      if class_conformsToProtocol(c, CAPBridgedPlugin.self) {
        let pluginClassName = NSStringFromClass(c)
        let pluginType = c as! CAPPlugin.Type
        let bridgeType = c as! CAPBridgedPlugin.Type
        
        registerPlugin(pluginClassName, bridgeType.jsName(), pluginType)
      }
    }
  }
  
  /**
   * Register a single plugin.
   */
  func registerPlugin(_ pluginClassName: String, _ jsName: String, _ pluginType: CAPPlugin.Type) {
    // let bridgeType = pluginType as! CAPBridgedPlugin.Type
    knownPlugins[jsName] = pluginType
    JSExport.exportJS(userContentController: self.userContentController, pluginClassName: jsName, pluginType: pluginType)
    _ = loadPlugin(pluginName: jsName)
  }
  
  /**
   * - parameter pluginId: the ID of the plugin
   * - returns: the plugin, if found
   */
  public func getOrLoadPlugin(pluginName: String) -> CAPPlugin? {
    guard let plugin = self.getPlugin(pluginName: pluginName) ?? self.loadPlugin(pluginName: pluginName) else {
      return nil
    }
    return plugin
  }
  
  public func getPlugin(pluginName: String) -> CAPPlugin? {
    return self.plugins[pluginName]
  }
  
  public func loadPlugin(pluginName: String) -> CAPPlugin? {
    guard let pluginType = knownPlugins[pluginName] else {
      CAPLog.print("⚡️  Unable to load plugin \(pluginName). No such module found.")
      return nil
    }
    
    let bridgeType = pluginType as! CAPBridgedPlugin.Type
    let p = pluginType.init(bridge: self, pluginId: bridgeType.pluginId(), pluginName: bridgeType.jsName())
    p!.load()
    self.plugins[bridgeType.jsName()] = p
    return p
  }
  
  func savePluginCall(_ call: CAPPluginCall) {
    storedCalls[call.callbackId] = call
  }
  
  @objc public func getSavedCall(_ callbackId: String) -> CAPPluginCall? {
    return storedCalls[callbackId]
  }
  
  @objc public func releaseCall(_ call: CAPPluginCall) {
    storedCalls.removeValue(forKey: call.callbackId)
  }
  
  @objc public func releaseCall(callbackId: String) {
    storedCalls.removeValue(forKey: callbackId)
  }
  
  public func getDispatchQueue() -> DispatchQueue {
    return self.dispatchQueue
  }
  
  func registerCordovaPlugins() {
    guard let bridgeVC = self.viewController as? CAPBridgeViewController else {
        return
    }
    cordovaPluginManager = CDVPluginManager.init(parser: bridgeVC.cordovaParser, viewController: self.viewController, webView: self.getWebView())
    if bridgeVC.cordovaParser.startupPluginNames.count > 0 {
      for pluginName in bridgeVC.cordovaParser.startupPluginNames {
        _ = cordovaPluginManager?.getCommandInstance(pluginName as? String)
      }
    }
    do {
      try JSExport.exportCordovaPluginsJS(userContentController: self.userContentController)
    } catch {
      CAPBridge.fatalError(error, error)
    }
  }
  
  public func isSimulator() -> Bool {
    var isSimulator = false
    #if arch(i386) || arch(x86_64)
      isSimulator = true
    #endif
    return isSimulator
  }
  
  public func isDevMode() -> Bool {
    #if DEBUG
      return true
    #else
      return false
    #endif
  }

  public func reload() {
    self.getWebView()?.reload()
  }
  
  public func modulePrint(_ plugin: CAPPlugin, _ items: Any...) {
    let output = items.map { "\($0)" }.joined(separator: " ")
    CAPLog.print("⚡️ ", plugin.pluginId, "-", output)
  }
  
  public func alert(_ title: String, _ message: String, _ buttonTitle: String = "OK") {
    let alert = UIAlertController(title: title, message: message, preferredStyle: UIAlertController.Style.alert)
    alert.addAction(UIAlertAction(title: buttonTitle, style: UIAlertAction.Style.default, handler: nil))
    self.viewController.present(alert, animated: true, completion: nil)
  }

  func docLink(_ url: String) -> String {
    return "\(CAPBridge.CAP_SITE)docs/\(url)"
  }
  
  /**
   * Handle a call from JavaScript. First, find the corresponding plugin,
   * construct a selector, and perform that selector on the plugin instance.
   */
  public func handleJSCall(call: JSCall) {
    guard let plugin = self.getPlugin(pluginName: call.pluginId) ?? self.loadPlugin(pluginName: call.pluginId) else {
      CAPLog.print("⚡️  Error loading plugin \(call.pluginId) for call. Check that the pluginId is correct")
      return
    }
    guard let pluginType = knownPlugins[plugin.getId()] else {
      return
    }
    
    var selector: Selector? = nil
    if call.method == "addListener" || call.method == "removeListener" {
      selector = NSSelectorFromString(call.method + ":")
    } else {
      let bridgeType = pluginType as! CAPBridgedPlugin.Type
      guard let method = bridgeType.getMethod(call.method) else {
        CAPLog.print("⚡️  Error calling method \(call.method) on plugin \(call.pluginId): No method found.")
        CAPLog.print("⚡️  Ensure plugin method exists and uses @objc in its declaration, and has been defined")
        return
      }
      
      //CAPLog.print("\n⚡️  Calling method \"\(call.method)\" on plugin \"\(plugin.getId()!)\"")
      
      selector = method.selector
    }
    
    if !plugin.responds(to: selector) {
      CAPLog.print("⚡️  Error: Plugin \(plugin.getId()!) does not respond to method call \"\(call.method)\" using selector \"\(selector!)\".")
      CAPLog.print("⚡️  Ensure plugin method exists, uses @objc in its declaration, and arguments match selector without callbacks in CAP_PLUGIN_METHOD.")
      CAPLog.print("⚡️  Learn more: \(docLink(DocLinks.CAPPluginMethodSelector.rawValue))")
      return
    }
    
    // Create a plugin call object and handle the success/error callbacks
    dispatchQueue.async {
      //let startTime = CFAbsoluteTimeGetCurrent()
      
      let pluginCall = CAPPluginCall(callbackId: call.callbackId, options: call.options, success: {(result: CAPPluginCallResult?, pluginCall: CAPPluginCall?) -> Void in
        if result != nil {
          self.toJs(result: JSResult(call: call, result: result!.data ?? [:]), save: pluginCall?.isSaved ?? false)
        } else {
          self.toJs(result: JSResult(call: call, result: [:]), save: pluginCall?.isSaved ?? false)
        }
      }, error: {(error: CAPPluginCallError?) -> Void in
        let description = error?.error?.localizedDescription ?? ""
        self.toJsError(error: JSResultError(call: call, message: error!.message, errorMessage: description, error: error!.data))
      })!
      
      plugin.perform(selector, with: pluginCall)
      
      if pluginCall.isSaved {
        self.savePluginCall(pluginCall)
      }
      
      //let timeElapsed = CFAbsoluteTimeGetCurrent() - startTime
      //CAPLog.print("Native call took", timeElapsed)
    }
  }

  /**
   * Handle a Cordova call from JavaScript. First, find the corresponding plugin,
   * construct a selector, and perform that selector on the plugin instance.
   */
  public func handleCordovaJSCall(call: JSCall) {
    // Create a selector to send to the plugin

    if let plugin = self.cordovaPluginManager?.getCommandInstance(call.pluginId.lowercased()) {
      let selector = NSSelectorFromString("\(call.method):")
      if !plugin.responds(to: selector) {
        CAPLog.print("Error: Plugin \(plugin.className!) does not respond to method call \(selector).")
        CAPLog.print("Ensure plugin method exists and uses @objc in its declaration")
        return
      }

      let arguments = call.options["options"] as! [Any]
      let pluginCall = CDVInvokedUrlCommand(arguments: arguments, callbackId: call.callbackId, className: plugin.className, methodName: call.method)
      plugin.perform(selector, with: pluginCall)

    } else {
      CAPLog.print("Error: Cordova Plugin mapping not found")
      return
    }
  }
  
  /**
   * Send a successful result to the JavaScript layer.
   */
  public func toJs(result: JSResult, save: Bool) {
    do {
      let resultJson = try result.toJson()
      CAPLog.print("⚡️  TO JS", resultJson.prefix(256))
      
      DispatchQueue.main.async {
        self.getWebView()?.evaluateJavaScript("""
          window.Capacitor.fromNative({
            callbackId: '\(result.call.callbackId)',
            pluginId: '\(result.call.pluginId)',
            methodName: '\(result.call.method)',
            save: \(save),
            success: true,
            data: \(resultJson)
          })
          """) { (result, error) in
          if error != nil && result != nil {
            CAPLog.print(result!)
          }
        }
      }
    } catch {
      if let jsError = error as? JSProcessingError {
        let appState = getOrLoadPlugin(pluginName: "App") as! CAPAppPlugin
        
        appState.firePluginError(jsError)
      }
    }

  }
  
  /**
   * Send an error result to the JavaScript layer.
   */
  public func toJsError(error: JSResultError) {
    DispatchQueue.main.async {
      self.getWebView()?.evaluateJavaScript("window.Capacitor.fromNative({ callbackId: '\(error.call.callbackId)', pluginId: '\(error.call.pluginId)', methodName: '\(error.call.method)', success: false, error: \(error.toJson())})") { (result, error) in
        if error != nil && result != nil {
          CAPLog.print(result!)
        }
      }
    }
  }
  
  /**
   * Eval JS for a specific plugin.
   */
  @objc public func evalWithPlugin(_ plugin: CAPPlugin, js: String) {
    let wrappedJs = """
    window.Capacitor.withPlugin('\(plugin.getId()!)', function(plugin) {
      if(!plugin) { console.error('Unable to execute JS in plugin, no such plugin found for id \(plugin.getId()!)'); }
      \(js)
    });
    """
    
    DispatchQueue.main.async {
      self.getWebView()?.evaluateJavaScript(wrappedJs, completionHandler: { (result, error) in
        if error != nil {
          CAPLog.print("⚡️  JS Eval error", error!.localizedDescription)
        }
      })
    }
  }
  
  /**
   * Eval JS in the web view
   */
  @objc public func eval(js: String) {
    DispatchQueue.main.async {
      self.getWebView()?.evaluateJavaScript(js, completionHandler: { (result, error) in
        if error != nil {
          CAPLog.print("⚡️  JS Eval error", error!.localizedDescription)
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
        if error != nil && result != nil {
          CAPLog.print(result!)
        }
      }
    }
  }
  
  @objc public func getWebView() -> WKWebView? {
    return self.bridgeDelegate.bridgedWebView
  }

  public func getLocalUrl() -> String {
    return localUrl!
  }

}

