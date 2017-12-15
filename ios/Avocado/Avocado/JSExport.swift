/**
 * PluginExport handles defining JS APIs that map to registered
 * plugins and are responsible for proxying calls to our bridge.
 */
public class JSExport {
  static let CATCHALL_OPTIONS_PARAM = "_options"
  static let CALLBACK_PARAM = "_callback"
  
  public static func exportAvocadoJS(webView: WKWebView) throws {
    guard let jsUrl = Bundle(for: self).url(forResource: "avc", withExtension: "js") else {
      print("ERROR: Required avc.js file in Avocado not found. Bridge will not function!")
      throw BridgeError.errorExportingCoreJS
    }
    
    do {
      let data = try String(contentsOf: jsUrl, encoding: .utf8)
      webView.evaluateJavaScript(data) { (result, error) in
        if error != nil {
          Bridge.fatalError(BridgeError.errorExportingCoreJS, error!)
        }
      }
    } catch {
      print("ERROR: Unable to read required avc.js file from Avocado framework. Bridge will not function!")
      throw BridgeError.errorExportingCoreJS
    }
  }
  
  /**
   * Export the JS required to implement the given plugin.
   */
  public static func exportJS(webView: WKWebView, pluginClassName: String, pluginType: AVCPlugin.Type) {
    var lines = [String]()
    
    lines.append("""
      (function(w) {
      w.Avocado = w.Avocado || {};
      w.Avocado.Plugins = w.Avocado.Plugins || {};
      var a = w.Avocado; var p = a.Plugins;
      p['\(pluginClassName)'] = {}
      """)
    let bridgeType = pluginType as! AVCBridgedPlugin.Type
    let methods = bridgeType.pluginMethods() as! [AVCPluginMethod]
    for method in methods {
      lines.append(generateMethod(pluginClassName: pluginClassName, method: method))
    }
    
    lines.append("""
    })(window);
    """)
    
    let js = lines.joined(separator: "\n")
    
    webView.evaluateJavaScript(js) { (result, error) in
      if error != nil {
        print("ERROR EXPORTTING PLUGIN JS", js)
      } else if result != nil {
        print(result!)
      }
    }
  }
  
  private static func generateMethod(pluginClassName: String, method: AVCPluginMethod) -> String {
    let methodName = method.name!
    let returnType = method.returnType!
    let args = method.args!
    var paramList = args.map { $0.name } as! [String]
    
    
    // If no arguments were specified for this function, add the catch-all
    // options argument which takes a full object and converts each
    // key/value pair into an option for plugin call.
    if args.count == 0 {
      paramList.append(CATCHALL_OPTIONS_PARAM)
    }
    
    // Automatically add the _callback param if returning data through a callback
    if returnType == AVCPluginReturnCallback {
      paramList.append(CALLBACK_PARAM)
    }
    
    // Create a param string of the form "param1, param2, param3"
    let paramString = paramList.joined(separator: ", ")
    
    // Generate the argument object that will be sent on each call
    let argObjectString = args.count == 0 ? CATCHALL_OPTIONS_PARAM : generateArgObject(method: method)
    
    var lines = [String]()
    
    // Create the function declaration
    lines.append("p['\(pluginClassName)']['\(method.name!)'] = function(\(paramString)) {")
    
    // Create the call to Avocado...
    if returnType == AVCPluginReturnNone {
      // ...using none
      lines.append("""
        return window.Avocado.nativeCallback('\(pluginClassName)', '\(methodName)', \(argObjectString));
        """)
    } else if returnType == AVCPluginReturnPromise {
      
      // ...using a promise
      lines.append("""
        return window.Avocado.nativePromise('\(pluginClassName)', '\(methodName)', \(argObjectString));
      """)
    } else if returnType == AVCPluginReturnCallback {
      // ...using a callback
      lines.append("""
        return window.Avocado.nativeCallback('\(pluginClassName)', '\(methodName)', \(argObjectString), \(CALLBACK_PARAM));
        """)
    } else {
      print("Error: plugin method return type \(returnType) is not supported!")
    }
    
    // Close the function
    lines.append("}")
    return lines.joined(separator: "\n")
  }
  
  /**
   * Generate an argument object of the form:
   * {
   *   "key": "value"
   * }
   */
  private static func generateArgObject(method: AVCPluginMethod) -> String {
    let args = method.args!
    var lines = [String]()
    
    // Object start
    lines.append("{")

    for arg in args {
      lines.append("\(arg.name!): \(arg.name!),")
    }

    lines.append("}")
    return lines.joined(separator: "\n")
  }
}
