import Foundation
import Dispatch
import WebKit
import Cordova

enum BridgeError: Error {
  case errorExportingCoreJS
}

@objc public class AVCBridge : NSObject {
  public var AVC_SITE = "https://avocado.ionicframework.com"
  
  public var webView: WKWebView
  @objc public var viewController: UIViewController
  
  public var lastPlugin: AVCPlugin?
  
  // Map of all loaded and instantiated plugins by pluginId -> instance
  public var plugins =  [String:AVCPlugin]()
  // List of known plugins by pluginId -> Plugin Type
  public var knownPlugins = [String:AVCPlugin.Type]()
  
  public var storedCalls = [String:AVCPluginCall]()
  
  private var isActive = true
  
  // Dispatch queue for our operations
  // TODO: Unique label?
  public var dispatchQueue = DispatchQueue(label: "bridge")
  
  public init(_ vc: UIViewController, _ webView: WKWebView) {
    self.viewController = vc
    self.webView = webView
    super.init()
    exportCoreJS()
    registerPlugins()
    bindObservers()
  }
  
  public func willAppear() {
    /*
    if let splash = getOrLoadPlugin(pluginId: "com.avocadojs.plugin.splashscreen") as? SplashScreen {
      splash.showOnLaunch()
    }*/
  }
  
  static func fatalError(_ error: Error, _ originalError: Error) {
    print("🥑 ❌  Avocado: FATAL ERROR")
    print("🥑 ❌  Error was: ", originalError.localizedDescription)
    switch error {
    case BridgeError.errorExportingCoreJS:
      print("🥑 ❌  Unable to export required Bridge JavaScript. Bridge will not function.")
      if let wke = originalError as? WKError {
        print("🥑 ❌ ", wke.userInfo)
      }
    default:
      print("🥑 ❌  Unknown error")
    }
    
    print("🥑 ❌  Please verify your installation or file an issue")
  }
  
  func bindObservers() {
    let appStatePlugin = getOrLoadPlugin(pluginId: "AppState") as? AppState
    
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
      try JSExport.exportAvocadoJS(webView: self.webView)
    } catch {
      AVCBridge.fatalError(error, error)
    }
  }
  
  func registerPlugins() {
    var numClasses = UInt32(0);
    let classes = objc_copyClassList(&numClasses)
    for i in 0..<Int(numClasses) {
      let c: AnyClass = classes![i]
      if class_conformsToProtocol(c, AVCBridgedPlugin.self) {
        let pluginClassName = NSStringFromClass(c)
        let pluginType = c as! AVCPlugin.Type
        registerPlugin(pluginClassName, pluginType)
      }
    }
  }
  
  func registerPlugin(_ pluginClassName: String, _ pluginType: AVCPlugin.Type) {
    let bridgeType = pluginType as! AVCBridgedPlugin.Type
    knownPlugins[bridgeType.pluginId()] = pluginType
    JSExport.exportJS(webView: self.webView, pluginClassName: pluginClassName, pluginType: pluginType)
  }
  
  public func getOrLoadPlugin(pluginId: String) -> AVCPlugin? {
    guard let plugin = self.getPlugin(pluginId: pluginId) ?? self.loadPlugin(pluginId: pluginId) else {
      return nil
    }
    return plugin
  }
  
  public func getPlugin(pluginId: String) -> AVCPlugin? {
    return self.plugins[pluginId]
  }
  
  public func loadPlugin(pluginId: String) -> AVCPlugin? {
    guard let pluginType = knownPlugins[pluginId] else {
      print("🥑  Unable to load plugin \(pluginId). No such module found.")
      return nil
    }
    
    let bridgeType = pluginType as! AVCBridgedPlugin.Type
    let p = pluginType.init(bridge: self, pluginId: bridgeType.pluginId())
    p!.load()
    self.plugins[bridgeType.pluginId()] = p
    return p
  }
  
  public func defineJS(_ pluginType: AVCPlugin.Type) {
    var mc: CUnsignedInt = 0
    var mlist = class_copyMethodList(pluginType, &mc)
    let olist = mlist
    print("\(mc) methods")
    
    for i in (0..<mc) {
      
      let sel = sel_getName(method_getName(mlist!.pointee))
      print("Method #\(i): \(method_getName(mlist!.pointee))")
      print(String(cString: sel))
      mlist = mlist!.successor()
    }
    free(olist)
  }
  
  
  func savePluginCall(_ call: AVCPluginCall) {
    storedCalls[call.callbackId] = call
  }
  
  @objc public func getSavedCall(callbackId: String) -> AVCPluginCall? {
    return storedCalls[callbackId]
  }
  
  @objc public func removeSavedCall(callbackId: String) {
    storedCalls.removeValue(forKey: callbackId)
  }
  
  public func getDispatchQueue() -> DispatchQueue {
    return self.dispatchQueue
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
    webView.reload()
  }
  
  public func modulePrint(_ plugin: AVCPlugin, _ items: Any...) {
    let output = items.map { "\($0)" }.joined(separator: " ")
    Swift.print("🥑 ", plugin.pluginId, "-", output)
  }
  
  public func alert(_ title: String, _ message: String, _ buttonTitle: String = "OK") {
    let alert = UIAlertController(title: title, message: message, preferredStyle: UIAlertControllerStyle.alert)
    alert.addAction(UIAlertAction(title: buttonTitle, style: UIAlertActionStyle.default, handler: nil))
    self.viewController.present(alert, animated: true, completion: nil)
  }
  
  public func setWebView(webView: WKWebView) {
    self.webView = webView
  }

  func docLink(_ url: String) -> String {
    return "\(AVC_SITE)/docs/\(url)"
  }
  
  /**
   * Handle a call from JavaScript. First, find the corresponding plugin,
   * construct a selector, and perform that selector on the plugin instance.
   */
  public func handleJSCall(call: JSCall) {
    guard let plugin = self.getPlugin(pluginId: call.pluginId) ?? self.loadPlugin(pluginId: call.pluginId) else {
      print("🥑  Error loading plugin \(call.pluginId) for call. Check that the pluginId is correct")
      return
    }
    guard let pluginType = knownPlugins[plugin.getId()] else {
      return
    }
    
    var selector: Selector? = nil
    if call.method == "addListener" || call.method == "removeListener" {
      selector = NSSelectorFromString(call.method + ":")
    } else {
      let bridgeType = pluginType as! AVCBridgedPlugin.Type
      guard let method = bridgeType.getMethod(call.method) else {
        print("🥑  Error calling method \(call.method) on plugin \(call.pluginId): No method found.")
        print("🥑  Ensure plugin method exists and uses @objc in its declaration, and has been defined")
        return
      }
      
      //print("\n🥑  Calling method \"\(call.method)\" on plugin \"\(plugin.getId()!)\"")
      
      selector = method.getSelector()
    }
    
    if !plugin.responds(to: selector) {
      print("🥑  Error: Plugin \(plugin.getId()!) does not respond to method call \"\(call.method)\" using selector \"\(selector!)\".")
      print("🥑  Ensure plugin method exists, uses @objc in its declaration, and arguments match selector without callbacks in AVC_PLUGIN_METHOD.")
      print("🥑  Learn more: \(docLink(DocLinks.AVCPluginMethodSelector.rawValue))")
      return
    }
    
    // Create a plugin call object and handle the success/error callbacks
    dispatchQueue.async {
      //let startTime = CFAbsoluteTimeGetCurrent()
      
      let pluginCall = AVCPluginCall(callbackId: call.callbackId, options: call.options, success: {(result: AVCPluginCallResult?) -> Void in
        if result != nil {
          self.toJs(result: JSResult(call: call, result: result!.data ?? [:]))
        } else {
          self.toJs(result: JSResult(call: call, result: [:]))
        }
      }, error: {(error: AVCPluginCallError?) -> Void in
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
    let selector = NSSelectorFromString("\(call.method):")
    var className = call.pluginId
    var vcClass = NSClassFromString(call.pluginId) as? CDVPlugin.Type
    if vcClass == nil {
      className = "CDV\(call.pluginId)"
      vcClass = NSClassFromString(className) as? CDVPlugin.Type
    }
    if vcClass == nil {
      print("Error: Plugin class not found")
      return
    }

    // Init the plugin and configure it
    let plugin = vcClass!.init()
    plugin.viewController = self.viewController
    plugin.commandDelegate = CDVCommandDelegateImpl.init(webView: self.webView)
    plugin.webView = self.webView as! UIView

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
      print("🥑  TO JS", resultJson.prefix(256))
      
      DispatchQueue.main.async {
        self.webView.evaluateJavaScript("window.Avocado.fromNative({ callbackId: '\(result.call.callbackId)', pluginId: '\(result.call.pluginId)', methodName: '\(result.call.method)', success: true, data: \(resultJson)})") { (result, error) in
          if error != nil && result != nil {
            print(result!)
          }
        }
      }
    } catch {
      if let jsError = error as? JSProcessingError {
        let appState = getOrLoadPlugin(pluginId: "AppState") as! AppState
        
        appState.firePluginError(jsError)
      }
    }

  }
  
  /**
   * Send an error result to the JavaScript layer.
   */
  public func toJsError(error: JSResultError) {
    DispatchQueue.main.async {
      self.webView.evaluateJavaScript("window.Avocado.fromNative({ callbackId: '\(error.call.callbackId)', pluginId: '\(error.call.pluginId)', methodName: '\(error.call.method)', success: false, error: \(error.toJson())})") { (result, error) in
        if error != nil && result != nil {
          print(result!)
        }
      }
    }
  }
  
  /**
   * Eval JS for a specific plugin.
   */
  @objc public func evalWithPlugin(_ plugin: AVCPlugin, js: String) {
    let wrappedJs = """
    window.Avocado.withPlugin('\(plugin.getId())', function(plugin) {
      if(!plugin) { console.error('Unable to execute JS in plugin, no such plugin found for id \(plugin.getId())'); }
      \(js)
    });
    """
    
    DispatchQueue.main.async {
      self.webView.evaluateJavaScript(wrappedJs, completionHandler: { (result, error) in
        if error != nil {
          print("🥑  JS Eval error", error!.localizedDescription)
        }
      })
    }
  }
}

