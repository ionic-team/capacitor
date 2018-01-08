public typealias PluginCallErrorData = [String:Any]
public typealias PluginResultData = [String:Any]
public typealias PluginEventListener = CAPPluginCall

/**
 * Swift niceities for CAPPluginCall
 */
public extension CAPPluginCall {

  public func get<T>(_ key: String, _ ofType: T.Type, _ defaultValue: T? = nil) -> T? {
    return self.options[key] as? T ?? defaultValue
  }
  
  public func getArray<T>(_ key: String, _ ofType: T.Type, _ defaultValue: [T]? = nil) -> [T]? {
    return self.options[key] as? [T] ?? defaultValue
  }
  
  public func getBool(_ key: String, defaultValue: Bool?) -> Bool? {
    return self.options[key] as? Bool ?? defaultValue
  }
  
  public func getInt(_ key: String, defaultValue: Int?) -> Int? {
    return self.options[key] as? Int ?? defaultValue
  }
  
  public func getString(_ key: String, defaultValue: String? = nil) -> String? {
    return self.options[key] as? String ?? defaultValue
  }
  
  public func getDate(_ key: String, defaultValue: Date? = nil) -> Date? {
    guard let isoString = self.options[key] as? String else {
      return defaultValue
    }
    let dateFormatter = DateFormatter()
    dateFormatter.locale = Locale(identifier: "en_US_POSIX")
    dateFormatter.timeZone = TimeZone.autoupdatingCurrent
    dateFormatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSSZ"
    return dateFormatter.date(from: isoString)
  }
  
  public func getObject(_ key: String, defaultValue: [String:Any]? = nil) -> [String:Any]? {
    return self.options[key] as? [String:Any] ?? defaultValue
  }

  public func success() {
    successHandler(CAPPluginCallResult())
  }
  
  public func success(_ data: PluginResultData = [:]) {
    successHandler(CAPPluginCallResult(data))
  }
  
  public func error(_ message: String, _ error: Error? = nil, _ data: PluginCallErrorData = [:]) {
    errorHandler(CAPPluginCallError(message: message, error: error, data: data))
  }
}

