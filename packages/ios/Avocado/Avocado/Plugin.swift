//
//  Plugin.swift
//  Avocado
//
//  Created by Max Lynch on 11/18/17.
//  Copyright © 2017 Drifty Co. All rights reserved.
//

import Foundation

public typealias PluginCallErrorData = [String:Any]
// Types for success and error callbacks to plugins
public typealias PluginSuccessCallback = (_ : PluginResult) -> Void
public typealias PluginErrorCallback = (_ error: PluginCallError) -> Void
public typealias PluginResultData = [String:Any]
public typealias PluginCallOptions = [String:Any]

/**
 * Base class for all plugins.
 *
 * Extends NSObject to allow for calling methods with selectors
 */
public class Plugin: NSObject {
  public var pluginId: String
  var avocado: Avocado
  
  public init(_ avocado: Avocado, id: String) {
    self.pluginId = id
    self.avocado = avocado
  }
  
  public func getId() -> String {
    return self.pluginId
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
  
  public func get(_ key: String, defaultValue: Any? = nil) -> Any? {
    return self.options[key] ?? defaultValue
  }
  
  public func success(_ data: PluginResultData = [:]) {
    successCallback(PluginResult(data))
  }
  
  public func error(_ message: String, _ error: Error?, _ data: PluginCallErrorData = [:]) {
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

