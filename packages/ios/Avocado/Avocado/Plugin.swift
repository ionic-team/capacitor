//
//  Plugin.swift
//  Avocado
//
//  Created by Max Lynch on 11/18/17.
//  Copyright © 2017 Drifty Co. All rights reserved.
//

import Foundation


/**
 * Base class for all plugins.
 *
 * Extends NSObject to allow for calling methods with selectors
 */
public class Plugin: NSObject {
  public var pluginId: String
  var avocado: Avocado
  
  public init(avocado: Avocado, id: String) {
    self.pluginId = id
    self.avocado = avocado
  }
  
  public func getId() -> String {
    return self.pluginId
  }
}

// Types for success and error callbacks to plugins
public typealias PluginSuccessCallback = (_ : PluginResult) -> Void
public typealias PluginErrorCallback = (_ error: PluginCallError) -> Void

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
}

/**
 * If a plugin call fails, this is the error object instance
 */
public typealias PluinCallErrorData = [String:Any]
public class PluginCallError {
  public var message: String
  public var error: Error
  public var data: PluinCallErrorData
  
  public init(message: String, error: Error, data: PluinCallErrorData) {
    self.message = message
    self.error = error
    self.data = data
  }
}

public typealias PluginCallOptions = [String:Any]

/**
 * Wrap the result of calling a native plugin
 */
public typealias PluginResultData = [String:Any]

public class PluginResult {
  var data: PluginResultData
  public init(data: PluginResultData) {
    self.data = data
  }
}

