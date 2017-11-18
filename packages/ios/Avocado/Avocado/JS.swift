//
//  Plugin.swift
//  Avocado
//
//  Created by Max Lynch on 11/18/17.
//  Copyright © 2017 Drifty Co. All rights reserved.
//

import Foundation

/**
 * A call originating from JavaScript land
 */
public class JSCall {
  public var pluginId: String = ""
  public var method: String = ""
  public var callbackId: String = ""
  
  public init(pluginId: String, method: String, callbackId: String) {
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
  
  public func toJson() -> String {
    var jsonResponse = "{}"
    
    if let theJSONData = try? JSONSerialization.data(withJSONObject: result, options: []) {
      jsonResponse = String(data: theJSONData,
                            encoding: .ascii)!
    }
    
    return jsonResponse
  }
}

public class JSResultError {
  public var call: JSCall
  public var error: JSResultBody
  
  public init(call: JSCall, error: JSResultBody) {
    self.call = call
    self.error = error
  }
  
  public func toJson() -> String {
    var jsonResponse = "{}"
    
    if let theJSONData = try? JSONSerialization.data(withJSONObject: error, options: []) {
      jsonResponse = String(data: theJSONData,
                            encoding: .ascii)!
    }
    
    return jsonResponse
  }
}
