import Foundation

public typealias PluginCallErrorData = [String:Any]
// Types for success and error callbacks to plugins
public typealias PluginSuccessCallback = (_ : PluginResult) -> Void
public typealias PluginErrorCallback = (_ error: PluginCallError) -> Void
public typealias PluginResultData = [String:Any]
public typealias PluginCallOptions = [String:Any]
public typealias PluginEventListener = PluginCall

/**
 * Base class for all plugins.
 *
 * Extends NSObject to allow for calling methods with selectors
 */
open class Plugin: NSObject {
  public var pluginId: String
  var bridge: Bridge
  
  var eventListeners = [String:[PluginEventListener]]()
  
  public required init(_ bridge: Bridge, id: String) {
    self.pluginId = id
    self.bridge = bridge
  }
  
  public func getId() -> String {
    return self.pluginId
  }
  
  // Called after init if the plugin wants to do
  // some loading so the plugin author doesn't
  // need to override init()
  public func load() {}
  
  public func addEventListener(_ eventName: String, _ listener: PluginEventListener) {
    if var listenersForEvent = eventListeners[eventName] {
      listenersForEvent.append(listener)
    } else {
      eventListeners[eventName] = [listener]
    }
  }
  
  public func removeEventListener(_ eventName: String, _ listener: PluginEventListener) {
    if var listenersForEvent = eventListeners[eventName] {
      if let index = listenersForEvent.index(of: listener) {
        listenersForEvent.remove(at: index)
      }
    }
  }
  
  public func notifyListeners(_ eventName: String, data: PluginResultData) {
    if let listenersForEvent = eventListeners[eventName] {
      for listener in listenersForEvent {
        print("Notifying listener for event", eventName, listener, data)
        listener.success(data)
      }
    }
  }
}


/**
 * A call down to a native plugin
 */
@objc public class PluginCall : NSObject {
  public var options: [String:Any] = [:]
  public var successCallback: PluginSuccessCallback
  public var errorCallback: PluginErrorCallback
  
  public init(options: [String:Any], success: @escaping PluginSuccessCallback, error: @escaping PluginErrorCallback) {
    self.options = options
    self.successCallback = success
    self.errorCallback = error
  }

  public func get<T>(_ key: String, _ ofType: T.Type, _ defaultValue: T? = nil) -> T? {
    return self.options[key] as? T ?? defaultValue
  }
  
  public func success(_ data: PluginResultData = [:]) {
    successCallback(PluginResult(data))
  }
  
  public func error(_ message: String, _ error: Error? = nil, _ data: PluginCallErrorData = [:]) {
    errorCallback(PluginCallError(message: message, error: error, data: data))
  }
}

/**
 * If a plugin call fails, this is the error object instance
 */

public class PluginCallError {
  public var message: String
  public var error: Error?
  public var data: PluginCallErrorData
  
  public init(message: String, error: Error? = nil, data: PluginCallErrorData = [:]) {
    self.message = message
    self.error = error
    self.data = data
  }
}

/**
 * Wrap the result of calling a native plugin
 */
public class PluginResult {
  var data: PluginResultData
  public init(_ data: PluginResultData = [:]) {
    self.data = data
  }
}

