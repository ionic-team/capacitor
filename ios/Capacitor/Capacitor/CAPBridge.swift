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
  
  public var cordovaPlugins = [String:CDVPlugin]()

  public var storedCalls = [String:CAPPluginCall]()
  
  private var isActive = true
  
  // Dispatch queue for our operations
  // TODO: Unique label?
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
    /*
    if let splash = getOrLoadPlugin(pluginId: "com.avocadojs.plugin.splashscreen") as? SplashScreen {
      splash.showOnLaunch()
    }*/
  }
  
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
  
  static func fatalError(_ error: Error, _ originalError: Error) {
    print("⚡️ ❌  Capacitor: FATAL ERROR")
    print("⚡️ ❌  Error was: ", originalError.localizedDescription)
    switch error {
    case BridgeError.errorExportingCoreJS:
      print("⚡️ ❌  Unable to export required Bridge JavaScript. Bridge will not function.")
      if let wke = originalError as? WKError {
        print("⚡️ ❌ ", wke.userInfo)
      }
    default:
      print("⚡️ ❌  Unknown error")
    }
    
    print("⚡️ ❌  Please verify your installation or file an issue")
  }
  
  func bindObservers() {
    let appStatePlugin = getOrLoadPlugin(pluginId: "App") as? App
    
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
  
  func isAppActive() -> Bool {
    return isActive
  }

  func exportCoreJS() {
    do {
      try JSExport.exportCapacitorJS(userContentController: self.userContentController)
    } catch {
      CAPBridge.fatalError(error, error)
    }
  }

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

  func exportCordovaJS() {
    do {
      try JSExport.exportCordovaJS(userContentController: self.userContentController)
    } catch {
      CAPBridge.fatalError(error, error)
    }
  }
  
  func registerPlugins() {
    var numClasses = UInt32(0);
    let classes = objc_copyClassList(&numClasses)
    for i in 0..<Int(numClasses) {
      let c: AnyClass = classes![i]
      if class_conformsToProtocol(c, CAPBridgedPlugin.self) {
        let pluginClassName = NSStringFromClass(c)
        let pluginType = c as! CAPPlugin.Type
        registerPlugin(pluginClassName, pluginType)
      }
    }
  }
  
  func registerPlugin(_ pluginClassName: String, _ pluginType: CAPPlugin.Type) {
    let bridgeType = pluginType as! CAPBridgedPlugin.Type
    knownPlugins[bridgeType.pluginId()] = pluginType
    JSExport.exportJS(userContentController: self.userContentController, pluginClassName: pluginClassName, pluginType: pluginType)
    _ = loadPlugin(pluginId: bridgeType.pluginId())
  }
  
  public func getOrLoadPlugin(pluginId: String) -> CAPPlugin? {
    guard let plugin = self.getPlugin(pluginId: pluginId) ?? self.loadPlugin(pluginId: pluginId) else {
      return nil
    }
    return plugin
  }
  
  public func getPlugin(pluginId: String) -> CAPPlugin? {
    return self.plugins[pluginId]
  }
  
  public func loadPlugin(pluginId: String) -> CAPPlugin? {
    guard let pluginType = knownPlugins[pluginId] else {
      print("⚡️  Unable to load plugin \(pluginId). No such module found.")
      return nil
    }
    
    let bridgeType = pluginType as! CAPBridgedPlugin.Type
    let p = pluginType.init(bridge: self, pluginId: bridgeType.pluginId())
    p!.load()
    self.plugins[bridgeType.pluginId()] = p
    return p
  }
  
  func savePluginCall(_ call: CAPPluginCall) {
    storedCalls[call.callbackId] = call
  }
  
  @objc public func getSavedCall(callbackId: String) -> CAPPluginCall? {
    return storedCalls[callbackId]
  }
  
  @objc public func removeSavedCall(callbackId: String) {
    storedCalls.removeValue(forKey: callbackId)
  }
  
  public func getDispatchQueue() -> DispatchQueue {
    return self.dispatchQueue
  }
  
  func registerCordovaPlugins() {
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
    return true
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
    guard let plugin = self.getPlugin(pluginId: call.pluginId) ?? self.loadPlugin(pluginId: call.pluginId) else {
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
      
      let pluginCall = CAPPluginCall(callbackId: call.callbackId, options: call.options, success: {(result: CAPPluginCallResult?) -> Void in
        if result != nil {
          self.toJs(result: JSResult(call: call, result: result!.data ?? [:]))
        } else {
          self.toJs(result: JSResult(call: call, result: [:]))
        }
      }, error: {(error: CAPPluginCallError?) -> Void in
        let description = error?.error?.localizedDescription ?? ""
        self.toJsError(error: JSResultError(call: call, message: error!.message, errorMessage: description, error: error!.data))
      })!
      
      plugin.perform(selector, with: pluginCall)
      
      if pluginCall.save {
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
    var className: String
    if let firstPlugin = cordovaPlugins.first(where: { $0.key ==  call.pluginId ||  $0.key == "CDV\(call.pluginId)" }) {
      className = firstPlugin.key
      plugin = firstPlugin.value
    } else {
      className = call.pluginId
      vcClass = NSClassFromString(call.pluginId) as? CDVPlugin.Type
      if vcClass == nil {
        className = "CDV\(call.pluginId)"
        vcClass = NSClassFromString(className) as? CDVPlugin.Type
      }
      if vcClass == nil {
        print("Error: Plugin class not found")
        return
      }
      plugin = vcClass!.init()
      cordovaPlugins[className] = plugin
    }

    plugin.viewController = self.viewController
    plugin.commandDelegate = CDVCommandDelegateImpl.init(webView: self.getWebView())
    plugin.webView = self.getWebView() as! UIView

    let selector = NSSelectorFromString("\(call.method):")
    if !plugin.responds(to: selector) {
      print("Error: Plugin \(call.pluginId) does not respond to method call \(selector).")
      print("Ensure plugin method exists and uses @objc in its declaration")
      return
    }

    dispatchQueue.sync {
      let arguments = call.options["options"] as! [Any]
      let pluginCall = CDVInvokedUrlCommand(arguments: arguments, callbackId: call.callbackId, className: className, methodName: call.method)
      plugin.perform(selector, with: pluginCall)
    }
  }
  
  /**
   * Send a successful result to the JavaScript layer.
   */
  public func toJs(result: JSResult) {
    do {
      let resultJson = try result.toJson()
      print("⚡️  TO JS", resultJson.prefix(256))
      
      DispatchQueue.main.async {
        self.getWebView().evaluateJavaScript("window.Capacitor.fromNative({ callbackId: '\(result.call.callbackId)', pluginId: '\(result.call.pluginId)', methodName: '\(result.call.method)', success: true, data: \(resultJson)})") { (result, error) in
          if error != nil && result != nil {
            print(result!)
          }
        }
      }
    } catch {
      if let jsError = error as? JSProcessingError {
        let appState = getOrLoadPlugin(pluginId: "App") as! App
        
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

