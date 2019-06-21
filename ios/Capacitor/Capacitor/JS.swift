import Foundation

enum JSProcessingError: LocalizedError {
  case jsonSerializeError(call: JSCall)
  var errorDescription: String? {
    switch self {
    case .jsonSerializeError(call: let call):
      return "Unable to JSON serialize plugin data result for plugin \(call.pluginId) and method \(call.method)"
    }
  }
}

typealias JSObject = [String:Any]
typealias JSArray = [JSObject]

public class JSDate {
  static func toString(_ date: Date) -> String {
    let formatter = ISO8601DateFormatter()
    return formatter.string(from: date)
  }
}

/**
 * A call originating from JavaScript land
 */
public class JSCall {
  public var options: [String:Any] = [:]
  public var pluginId: String = ""
  public var method: String = ""
  public var callbackId: String = ""
  
  public init(options: [String:Any], pluginId: String, method: String, callbackId: String) {
    self.options = options
    self.pluginId = pluginId
    self.method = method
    self.callbackId = callbackId
  }
}

public typealias JSResultBody = [String:Any]

/**
 * A result of processing a JSCall, contains
 * a reference to the original call and the new result.
 */
public class JSResult {
  public var call: JSCall
  public var result: JSResultBody
  
  public init(call: JSCall, result: JSResultBody) {
    self.call = call
    self.result = result
  }
  
  public func toJson() throws -> String {
    do {
      if JSONSerialization.isValidJSONObject(result) {
        let theJSONData = try JSONSerialization.data(withJSONObject: result, options: [])
        
        return String(data: theJSONData,
                      encoding: .utf8)!
      } else {
        CAPLog.print("[Capacitor Plugin Error] - \(call.pluginId) - \(call.method) - Unable to serialize plugin response as JSON." +
          "Ensure that all data passed to success callback from module method is JSON serializable!")
        throw JSProcessingError.jsonSerializeError(call: call)
      }
    } catch let error as JSProcessingError {
      throw error
    } catch {
      CAPLog.print("Unable to serialize plugin response as JSON: \(error.localizedDescription)")
    }
    
    return "{}"
  }
}

public class JSResultError {
  var call: JSCall
  var error: JSResultBody
  var message: String
  var errorMessage: String
  
  public init(call: JSCall, message: String, errorMessage: String, error: JSResultBody) {
    self.call = call
    self.message = message
    self.errorMessage = errorMessage
    self.error = error
  }
  
  /**
   * Return a linkable error that we can use to help users find help for common exceptions,
   * much like AngularJS back in the day.
   */
  func getLinkableError(_ message: String) -> String? {
    guard let data = message.data(using: .utf8)?.base64EncodedString() else {
      return nil
    }
    
    return "\(CAPBridge.CAP_SITE)error/ios?m=\(data)"
  }
  
  public func toJson() -> String {
    var jsonResponse = "{}"
    
    error["message"] = self.message
    error["errorMessage"] = self.errorMessage
    //error["_exlink"] = getLinkableError(self.message)
    
    if let theJSONData = try? JSONSerialization.data(withJSONObject: error, options: []) {
      jsonResponse = String(data: theJSONData,
                            encoding: .utf8)!
      CAPLog.print("ERROR MESSAGE: ", jsonResponse.prefix(512))
    }
    
    return jsonResponse
  }
}
