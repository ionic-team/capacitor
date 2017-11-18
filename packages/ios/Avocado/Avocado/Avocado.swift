//
//  Avocado.swift
//  Avocado
//
//  Created by Max Lynch on 11/18/17.
//  Copyright © 2017 Drifty Co. All rights reserved.
//

import Foundation
import WebKit

public class Avocado {
  public var webView: WKWebView?
  
  public var lastPlugin: Plugin?
  
  public init() {
    let device = Device()
    let geo = Geolocation()
    self.registerPlugin(plugin: device)
    self.registerPlugin(plugin: geo)
  }
  
  public func setWebView(webView: WKWebView) {
    self.webView = webView
  }
  
  public func registerPlugin(plugin: Plugin) {
  }
  
  public func handleJSCall(call: JSCall) {
    // TODO: Don't hard code
    print("Handling JS Call")
    if call.pluginId == "geolocation" {
      print("Geolocation")
      // TODO: Temporary strong reference
      let pluginCall = PluginCall(success: {(result: PluginResult) -> Void in
        let data = result.data
        let coords = data["coords"]! as! [String:Any]
        print("In Callback - ", coords["latitude"]!, coords["longitude"]!)
        self.toJs(result: JSResult(call: call, result: result.data))
      }, error: {(error: PluginCallError) -> Void in
        print("Here's where to handle the plugin call error")
        self.toJsError(error: JSResultError(call: call, error: error.data))
      })
    
      self.lastPlugin = Geolocation()
      (self.lastPlugin as! Geolocation).getCurrentPosition(call: pluginCall)
    }
  }
  
  
  public func toJs(result: JSResult) {
    print("Serializing data", result);

    self.webView?.evaluateJavaScript("window.avocado.fromNative({ callbackId: '\(result.call.callbackId)', pluginId: '\(result.call.pluginId)', methodName: '\(result.call.method)', data: '\(result.toJson())'})") { (result, error) in
      if error != nil && result != nil {
        print(result!)
      }
    }

  }
  
  public func toJsError(error: JSResultError) {
    self.webView?.evaluateJavaScript("window.avocado.fromNative({ callbackId: '\(error.call.callbackId)', pluginId: '\(error.call.pluginId)', methodName: '\(error.call.method)', success: false, error: '\(error.toJson())'})") { (result, error) in
      if error != nil && result != nil {
        print(result!)
      }
    }
  }
}
