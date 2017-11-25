import Foundation
import Dispatch
import WebKit

// @objc protocol AvocadoBridgeModule {}

public class Avocado {
  public var viewController: UIViewController
  
  public var webView: WKWebView?
  
  public var lastPlugin: Plugin?
  public var plugins =  [String:Plugin]()
  public var dispatchQueue = DispatchQueue(label: "avocado")
  	
  
  public init(_ vc: UIViewController, _ pluginIds: [String]) {
    self.viewController = vc

    //registerCorePlugins()
    registerPlugins()
  }
  
  func registerPlugins() {
    var numClasses = UInt32(0);
    let classes = objc_copyClassList(&numClasses)
    for i in 0..<Int(numClasses) {
      let c = classes![i]
      if class_conformsToProtocol(c, AvocadoBridgeModule.self) {
        let pluginType = c as! Plugin.Type
        registerModule(pluginType)
      }
    }
    
    let moduleClasses = AvocadoGetModuleClasses()
    print("These modules classes are ready")
    for module in moduleClasses! {
      print(module)
    }
  }
  
  func registerModule(_ pluginType: Plugin.Type) {
    let bridgeType = pluginType as! AvocadoBridgeModule.Type
    let m = pluginType.init(self, id: bridgeType.moduleId())
    print("Instantiated module", pluginType, m)
    registerPlugin(m)
  }
  
  public func isSimulator() -> Bool {
    var isSimulator = false
    #if arch(i386) || arch(x86_64)
      isSimulator = true
    #endif
    return isSimulator
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
  
  public func registerPlugin(_ plugin: Plugin) {
    print("Registering plugin", plugin.getId())
    self.plugins[plugin.getId()] = plugin
  }
  
  public func getPlugin(pluginId: String) -> Plugin? {
    print("Checking for plugin", pluginId, plugins)
    return self.plugins[pluginId]
  }
  
  /**
   * Handle a call from JavaScript. First, find the corresponding plugin,
   * construct a selector, and perform that selector on the plugin instance.
   */
  public func handleJSCall(call: JSCall) {
    // Create a selector to send to the plugin
    let selector = NSSelectorFromString("\(call.method):")
    
    // Get the plugin from the list of loaded, registered plugins
    if let plugin = self.getPlugin(pluginId: call.pluginId) {
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
    } else {
      print("Error! No plugin \(call.pluginId) registered. Double check the plugin id is correct.")
    }
  }
  
  /**
   * Send a successful result to the JavaScript layer.
   */
  public func toJs(result: JSResult) {
    let resultJson = result.toJson()
    
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
