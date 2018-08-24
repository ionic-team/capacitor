public typealias PluginCallErrorData = [String:Any]
public typealias PluginResultData = [String:Any]
public typealias PluginEventListener = CAPPluginCall

/**
 * Swift niceities for CAPPluginCall
 */
public extension CAPPluginCall {

  private static var UNIMPLEMENTED = "not implemented"

  public func get<T>(_ key: String, _ ofType: T.Type, _ defaultValue: T? = nil) -> T? {
    return self.options[key] as? T ?? defaultValue
  }
  
  public func getArray<T>(_ key: String, _ ofType: T.Type, _ defaultValue: [T]? = nil) -> [T]? {
    return self.options[key] as? [T] ?? defaultValue
  }
  
  public func getBool(_ key: String, _ defaultValue: Bool? = nil) -> Bool? {
    return self.options[key] as? Bool ?? defaultValue
  }
  
  public func getInt(_ key: String, _ defaultValue: Int? = nil) -> Int? {
    return self.options[key] as? Int ?? defaultValue
  }
  
  public func getFloat(_ key: String, _ defaultValue: Float? = nil) -> Float? {
    return self.options[key] as? Float ?? defaultValue
  }
  
  public func getDouble(_ key: String, _ defaultValue: Double? = nil) -> Double? {
    return self.options[key] as? Double ?? defaultValue
  }
  
  public func getString(_ key: String, _ defaultValue: String? = nil) -> String? {
    return self.options[key] as? String ?? defaultValue
  }
  
  public func getDate(_ key: String, _ defaultValue: Date? = nil) -> Date? {
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
  
  public func hasOption(_ key: String) -> Bool {
    return self.options.index(forKey: key) != nil
  }

  public func success() {
    successHandler(CAPPluginCallResult(), self)
  }
  
  public func success(_ data: PluginResultData = [:]) {
    successHandler(CAPPluginCallResult(data), self)
  }
  
  public func resolve() {
    successHandler(CAPPluginCallResult(), self)
  }
  
  public func resolve(_ data: PluginResultData = [:]) {
    successHandler(CAPPluginCallResult(data), self)
  }
  
  public func error(_ message: String, _ error: Error? = nil, _ data: PluginCallErrorData = [:]) {
    errorHandler(CAPPluginCallError(message: message, error: error, data: data))
  }
  
  public func reject(_ message: String, _ error: Error? = nil, _ data: PluginCallErrorData = [:]) {
    errorHandler(CAPPluginCallError(message: message, error: error, data: data))
  }

  public func unimplemented() {
    errorHandler(CAPPluginCallError(message: CAPPluginCall.UNIMPLEMENTED, error: nil, data: [:]))
  }
}

