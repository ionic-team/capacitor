import Foundation
import Dispatch
import WebKit
import Cordova

enum BridgeError: Error {
  case errorExportingCoreJS
}

@objc public class CAPBridge : NSObject {
  public static var CAP_SITE = "https://getcapacitor.com/"
  
  public var userContentController: WKUserContentController
  @objc public var viewController: UIViewController
  
  public var lastPlugin: CAPPlugin?
  
  // Map of all loaded and instantiated plugins by pluginId -> instance
  public var plugins =  [String:CAPPlugin]()
  // List of known plugins by pluginId -> Plugin Type
  public var knownPlugins = [String:CAPPlugin.Type]()
  // List of known cordova plugins
  public var cordovaPlugins = [String:CDVPlugin]()
  public var cordovaPluginsMapping = NSMutableDictionary()
  // Calls we are storing to resolve later
  public var storedCalls = [String:CAPPluginCall]()
  // Whether the app is active
  private var isActive = true
  
  // Background dispatch queue for plugin calls
  public var dispatchQueue = DispatchQueue(label: "bridge")
  
  public init(_ vc: UIViewController, _ userContentController: WKUserContentController) {
    self.viewController = vc
    self.userContentController = userContentController
    super.init()
    exportCoreJS()
    setupCordovaCompatibility()
    registerPlugins()
    bindObservers()
  }
  
  public func willAppear() {
    if let splash = getOrLoadPlugin(pluginName: "SplashScreen") as? CAPSplashScreenPlugin {
      splash.showOnLaunch()
    }
  }
  
  /**
   * Handle an openUrl action and dispatch a notification.
   */
  public static func handleOpenUrl(_ url: URL, _ options: [UIApplicationOpenURLOptionsKey : Any]) -> Bool {
    NotificationCenter.default.post(name: Notification.Name(CAPNotifications.URLOpen.name()), object: [
      "url": url,
      "options": options
    ])
    return true
  }
  
  /**
   * Handle continueUserActivity, for now this just provides universal link responding support.
   */
  public static func handleContinueActivity(_ userActivity: NSUserActivity, _ restorationHandler: @escaping ([Any]?) -> Void) -> Bool {
    // TODO: Support other types, emit to rest of plugins
    if userActivity.activityType != NSUserActivityTypeBrowsingWeb || userActivity.webpageURL == nil {
      return false
    }
    
    let url = userActivity.webpageURL
    
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
    print("⚡️ ❌  Capacitor: FATAL ERROR")
    print("⚡️ ❌  Error was: ", originalError.localizedDescription)
    switch error {
    case BridgeError.errorExportingCoreJS:
      print("⚡️ ❌  Unable to export required Bridge JavaScript. Bridge will not function.")
      print("⚡️ ❌  You should run \"npx capacitor copy\" to ensure the Bridge JS is added to your project.")
      if let wke = originalError as? WKError {
        print("⚡️ ❌ ", wke.userInfo)
      }
    default:
      print("⚡️ ❌  Unknown error")
    }
    
    print("⚡️ ❌  Please verify your installation or file an issue")
  }
  
  /**
   * Bind notification center observers to watch for app active/inactive status
   */
  func bindObservers() {
    let appStatePlugin = getOrLoadPlugin(pluginName: "App") as? CAPAppPlugin
    
    NotificationCenter.default.addObserver(forName: .UIApplicationDidBecomeActive, object: nil, queue: OperationQueue.main) { (notification) in
      print("APP ACTIVE")
      self.isActive = true
      appStatePlugin?.fireChange(isActive: self.isActive)
    }
    NotificationCenter.default.addObserver(forName: .UIApplicationDidEnterBackground, object: nil, queue: OperationQueue.main) { (notification) in
      print("APP INACTIVE")
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
  func exportCoreJS() {
    do {
      try JSExport.exportCapacitorGlobalJS(userContentController: self.userContentController, isDebug: isDevMode())
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
    let bridgeType = pluginType as! CAPBridgedPlugin.Type
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
      print("⚡️  Unable to load plugin \(pluginName). No such module found.")
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
    let cordovaParser = CDVConfigParser.init();
    let configUrl = Bundle.main.url(forResource: "config", withExtension: "xml")
    let configParser = XMLParser(contentsOf: configUrl!)!;
    configParser.delegate = cordovaParser
    configParser.parse()
    cordovaPluginsMapping = cordovaParser.pluginsDict
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
  
  public func showDevMode() {
    let devMode = DevMode(self)
    devMode.show()
  }
  
  public func reload() {
    self.getWebView().reload()
  }

  
  public func modulePrint(_ plugin: CAPPlugin, _ items: Any...) {
    let output = items.map { "\($0)" }.joined(separator: " ")
    Swift.print("⚡️ ", plugin.pluginId, "-", output)
  }
  
  public func alert(_ title: String, _ message: String, _ buttonTitle: String = "OK") {
    let alert = UIAlertController(title: title, message: message, preferredStyle: UIAlertControllerStyle.alert)
    alert.addAction(UIAlertAction(title: buttonTitle, style: UIAlertActionStyle.default, handler: nil))
    self.viewController.present(alert, animated: true, completion: nil)
  }

  func docLink(_ url: String) -> String {
    return "\(CAPBridge.CAP_SITE)/docs/\(url)"
  }
  
  /**
   * Handle a call from JavaScript. First, find the corresponding plugin,
   * construct a selector, and perform that selector on the plugin instance.
   */
  public func handleJSCall(call: JSCall) {
    guard let plugin = self.getPlugin(pluginName: call.pluginId) ?? self.loadPlugin(pluginName: call.pluginId) else {
      print("⚡️  Error loading plugin \(call.pluginId) for call. Check that the pluginId is correct")
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
        print("⚡️  Error calling method \(call.method) on plugin \(call.pluginId): No method found.")
        print("⚡️  Ensure plugin method exists and uses @objc in its declaration, and has been defined")
        return
      }
      
      //print("\n⚡️  Calling method \"\(call.method)\" on plugin \"\(plugin.getId()!)\"")
      
      selector = method.selector
    }
    
    if !plugin.responds(to: selector) {
      print("⚡️  Error: Plugin \(plugin.getId()!) does not respond to method call \"\(call.method)\" using selector \"\(selector!)\".")
      print("⚡️  Ensure plugin method exists, uses @objc in its declaration, and arguments match selector without callbacks in CAP_PLUGIN_METHOD.")
      print("⚡️  Learn more: \(docLink(DocLinks.CAPPluginMethodSelector.rawValue))")
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
      //print("Native call took", timeElapsed)
    }
  }

  /**
   * Handle a Cordova call from JavaScript. First, find the corresponding plugin,
   * construct a selector, and perform that selector on the plugin instance.
   */
  public func handleCordovaJSCall(call: JSCall) {
    // Create a selector to send to the plugin
    var vcClass: CDVPlugin.Type?
    let plugin: CDVPlugin
    if let className = cordovaPluginsMapping.object(forKey: call.pluginId.lowercased()) as? String {
      if let firstPlugin = cordovaPlugins.first(where: { $0.key ==  className }) {
        plugin = firstPlugin.value
      } else {
        vcClass = NSClassFromString(className) as? CDVPlugin.Type
        if vcClass == nil {
          print("Error: Cordova Plugin class not found")
          return
        }
        plugin = vcClass!.init()
        cordovaPlugins[className] = plugin
        plugin.pluginInitialize()
      }

      plugin.viewController = self.viewController
      plugin.commandDelegate = CDVCommandDelegateImpl.init(webView: self.getWebView())
      plugin.webView = self.getWebView() as UIView

      let selector = NSSelectorFromString("\(call.method):")
      if !plugin.responds(to: selector) {
        print("Error: Plugin \(className) does not respond to method call \(selector).")
        print("Ensure plugin method exists and uses @objc in its declaration")
        return
      }

      dispatchQueue.sync {
        let arguments = call.options["options"] as! [Any]
        let pluginCall = CDVInvokedUrlCommand(arguments: arguments, callbackId: call.callbackId, className: className, methodName: call.method)
        plugin.perform(selector, with: pluginCall)
      }
    } else {
      print("Error: Cordova Plugin mapping not found")
      return
    }
  }
  
  /**
   * Send a successful result to the JavaScript layer.
   */
  public func toJs(result: JSResult, save: Bool) {
    do {
      let resultJson = try result.toJson()
      print("⚡️  TO JS", resultJson.prefix(256))
      
      DispatchQueue.main.async {
        self.getWebView().evaluateJavaScript("""
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
            print(result!)
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
      self.getWebView().evaluateJavaScript("window.Capacitor.fromNative({ callbackId: '\(error.call.callbackId)', pluginId: '\(error.call.pluginId)', methodName: '\(error.call.method)', success: false, error: \(error.toJson())})") { (result, error) in
        if error != nil && result != nil {
          print(result!)
        }
      }
    }
  }
  
  /**
   * Eval JS for a specific plugin.
   */
  @objc public func evalWithPlugin(_ plugin: CAPPlugin, js: String) {
    let wrappedJs = """
    window.Capacitor.withPlugin('\(plugin.getId())', function(plugin) {
      if(!plugin) { console.error('Unable to execute JS in plugin, no such plugin found for id \(plugin.getId())'); }
      \(js)
    });
    """
    
    DispatchQueue.main.async {
      self.getWebView().evaluateJavaScript(wrappedJs, completionHandler: { (result, error) in
        if error != nil {
          print("⚡️  JS Eval error", error!.localizedDescription)
        }
      })
    }
  }
  
  func getWebView() -> WKWebView {
    let vc = self.viewController as! CAPBridgeViewController
    return vc.getWebView()
  }
}

