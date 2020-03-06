public typealias PluginCallErrorData = [String:Any]
public typealias PluginResultData = [String:Any]
public typealias PluginEventListener = CAPPluginCall

/**
 * Swift niceties for CAPPluginCall
 */
@objc public extension CAPPluginCall {

  private static let UNIMPLEMENTED = "not implemented"

  @nonobjc func get<T>(_ key: String, _ ofType: T.Type, _ defaultValue: T? = nil) -> T? {
    return self.options[key] as? T ?? defaultValue
  }
  
  @nonobjc func getArray<T>(_ key: String, _ ofType: T.Type, _ defaultValue: [T]? = nil) -> [T]? {
    return self.options[key] as? [T] ?? defaultValue
  }
  
  @nonobjc func getBool(_ key: String, _ defaultValue: Bool? = nil) -> Bool? {
    return self.options[key] as? Bool ?? defaultValue
  }
  
  @nonobjc func getInt(_ key: String, _ defaultValue: Int? = nil) -> Int? {
    return self.options[key] as? Int ?? defaultValue
  }
  
  @nonobjc func getFloat(_ key: String, _ defaultValue: Float? = nil) -> Float? {
    if let floatValue = self.options[key] as? Float {
        return floatValue
    }
    if let doubleValue = self.options[key] as? Double {
        return Float(doubleValue)
    }
    return defaultValue
  }
  
  @nonobjc func getDouble(_ key: String, _ defaultValue: Double? = nil) -> Double? {
    return self.options[key] as? Double ?? defaultValue
  }
  
  func getString(_ key: String, _ defaultValue: String? = nil) -> String? {
    return self.options[key] as? String ?? defaultValue
  }
  
  func getDate(_ key: String, _ defaultValue: Date? = nil) -> Date? {
    guard let isoString = self.options[key] as? String else {
      return defaultValue
    }
    let dateFormatter = DateFormatter()
    dateFormatter.locale = Locale(identifier: "en_US_POSIX")
    dateFormatter.timeZone = TimeZone.autoupdatingCurrent
    dateFormatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSSZ"
    return dateFormatter.date(from: isoString)
  }
  
  func getObject(_ key: String, defaultValue: [String:Any]? = nil) -> [String:Any]? {
    return self.options[key] as? [String:Any] ?? defaultValue
  }
  
  func hasOption(_ key: String) -> Bool {
    return self.options.index(forKey: key) != nil
  }

  func success() {
    successHandler(CAPPluginCallResult(), self)
  }
  
  func success(_ data: PluginResultData = [:]) {
    successHandler(CAPPluginCallResult(data), self)
  }
  
  func resolve() {
    successHandler(CAPPluginCallResult(), self)
  }
  
  func resolve(_ data: PluginResultData = [:]) {
    successHandler(CAPPluginCallResult(data), self)
  }
  
  func error(_ message: String, _ error: Error? = nil, _ data: PluginCallErrorData = [:]) {
    errorHandler(CAPPluginCallError(message: message, code: nil, error: error, data: data))
  }

  func reject(_ message: String, _ code: String? = nil, _ error: Error? = nil, _ data: PluginCallErrorData = [:]) {
    errorHandler(CAPPluginCallError(message: message, code: code, error: error, data: data))
  }

  func unimplemented() {
    errorHandler(CAPPluginCallError(message: CAPPluginCall.UNIMPLEMENTED, code: nil, error: nil, data: [:]))
  }
}

