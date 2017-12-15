public typealias PluginCallErrorData = [String:Any]
public typealias PluginResultData = [String:Any]
public typealias PluginEventListener = AVCPluginCall

/**
 * Swift niceities for AVCPluginCall
 */
public extension AVCPluginCall {

  public func get<T>(_ key: String, _ ofType: T.Type, _ defaultValue: T? = nil) -> T? {
    return self.options[key] as? T ?? defaultValue
  }
  
  public func getBool(_ key: String, defaultValue: NSNumber?) -> NSNumber? {
    return self.options[key] as? NSNumber ?? defaultValue
  }
  
  public func getString(_ key: String, defaultValue: String? = nil) -> String? {
    return self.options[key] as? String ?? defaultValue
  }
  
  public func getObject(_ key: String, defaultValue: [String:Any]? = nil) -> [String:Any]? {
    return self.options[key] as? [String:Any] ?? defaultValue
  }
  
  public func success() {
    successHandler(AVCPluginCallResult())
  }
  
  public func success(_ data: PluginResultData = [:]) {
    successHandler(AVCPluginCallResult(data))
  }
  
  public func error(_ message: String, _ error: Error? = nil, _ data: PluginCallErrorData = [:]) {
    errorHandler(AVCPluginCallError(message: message, error: error, data: data))
  }
}

