import Foundation
import Dispatch
import WebKit

@objc public class Bridge : AVCBridge {
  public var webView: WKWebView?
  
  public var lastPlugin: Plugin?
  
  // Map of all loaded and instantiated plugins by pluginId -> instance
  public var plugins =  [String:AVCPlugin]()
  // List of known plugins by pluginId -> Plugin Type
  public var knownPlugins = [String:AVCPlugin.Type]()
  
  // Dispatch queue for our operations
  // TODO: Unique label?
  public var dispatchQueue = DispatchQueue(label: "bridge")
  
  public init(_ vc: UIViewController, _ pluginIds: [String]) {
    super.init()
    self.viewController = vc
    self.registerPlugins()
  }
  
  public func willAppear() {
    if let splash = getOrLoadPlugin(pluginId: "com.avocadojs.plugin.splashscreen") as? SplashScreen {
      splash.showOnLaunch()
    }
  }
  
  func registerPlugins() {
    var numClasses = UInt32(0);
    let classes = objc_copyClassList(&numClasses)
    for i in 0..<Int(numClasses) {
      let c = classes![i]
      if class_conformsToProtocol(c, AvocadoBridgePlugin.self) {
        let moduleType = c as! AVCPlugin.Type
        registerPlugin(moduleType)
      }
    }
  }
  
  func registerPlugin(_ pluginType: AVCPlugin.Type) {
    let bridgeType = pluginType as! AvocadoBridgePlugin.Type
    knownPlugins[bridgeType.pluginId()] = pluginType
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
      print("Unable to load plugin \(pluginId). No such module found.")
      return nil
    }
    
    let bridgeType = pluginType as! AvocadoBridgePlugin.Type
    let p = pluginType.init(bridge: self, pluginId: bridgeType.pluginId())!
    p.load()
    self.plugins[bridgeType.pluginId()] = p
    return p
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
    guard let webView = self.webView else {
      return
    }
    webView.reload()
  }
  
  public func modulePrint(_ plugin: Plugin, _ items: Any...) {
    let output = items.map { "\($0)" }.joined(separator: " ")
    Swift.print(plugin.pluginId, "-", output)
  }
  
  public func alert(_ title: String, _ message: String, _ buttonTitle: String = "OK") {
    let alert = UIAlertController(title: title, message: message, preferredStyle: UIAlertControllerStyle.alert)
    alert.addAction(UIAlertAction(title: buttonTitle, style: UIAlertActionStyle.default, handler: nil))
    self.viewController.present(alert, animated: true, completion: nil)
  }
  
  public func setWebView(webView: WKWebView) {
    self.webView = webView
  }

  
  /**
   * Handle a call from JavaScript. First, find the corresponding plugin,
   * construct a selector, and perform that selector on the plugin instance.
   */
  public func handleJSCall(call: JSCall) {
    // Create a selector to send to the plugin
    let selector = NSSelectorFromString("\(call.method):")
    
    guard let plugin = self.getPlugin(pluginId: call.pluginId) ?? self.loadPlugin(pluginId: call.pluginId) else {
      print("Error loading plugin \(call.pluginId) for call. Check that the pluginId is correct")
      return
    }
    
    print("Calling method \(call.method) on plugin \(plugin.getId())")
    
    if !plugin.responds(to: selector) {
      print("Error: Plugin \(plugin.getId()) does not respond to method call \(call.method).")
      print("Ensure plugin method exists and uses @objc in its declaration")
      return
    }
    
    // Create a plugin call object and handle the success/error callbacks
    dispatchQueue.sync {
      //let startTime = CFAbsoluteTimeGetCurrent()
      
      let pluginCall = PluginCall(options: call.options, success: {(result: PluginResult) -> Void in
        self.toJs(result: JSResult(call: call, result: result.data))
      }, error: {(error: PluginCallError) -> Void in
        self.toJsError(error: JSResultError(call: call, message: error.message, error: error.data))
      })
      // Perform the plugin call
      plugin.perform(selector, with: pluginCall)
      
      //let timeElapsed = CFAbsoluteTimeGetCurrent() - startTime
      //print("Native call took", timeElapsed)
    }
  }
  
  /**
   * Send a successful result to the JavaScript layer.
   */
  public func toJs(result: JSResult) {
    let resultJson = result.toJson()
    print("TO JS", result.toJson())
    self.webView?.evaluateJavaScript("window.avocado.fromNative({ callbackId: '\(result.call.callbackId)', pluginId: '\(result.call.pluginId)', methodName: '\(result.call.method)', success: true, data: \(resultJson)})") { (result, error) in
      if error != nil && result != nil {
        print(result!)
      }
    }
  }
  
  /**
   * Send an error result to the JavaScript layer.
   */
  public func toJsError(error: JSResultError) {
    self.webView?.evaluateJavaScript("window.avocado.fromNative({ callbackId: '\(error.call.callbackId)', pluginId: '\(error.call.pluginId)', methodName: '\(error.call.method)', success: false, error: \(error.toJson())})") { (result, error) in
      if error != nil && result != nil {
        print(result!)
      }
    }
  }
}
