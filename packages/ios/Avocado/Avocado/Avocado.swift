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
  public var plugins =  [String:Plugin]()
  
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
    self.plugins[plugin.getId()] = plugin
    print("Plugins", self.plugins)
  }
  
  public func getPlugin(pluginName: String) -> Plugin? {
    return self.plugins[pluginName]
  }
  
  public func handleJSCall(call: JSCall) {
    // Create a selector to send to the plugin
    let selector = NSSelectorFromString("\(call.method):")
    
    // Get the plugin from the list of loaded, registered plugins
    if let plugin = self.getPlugin(pluginName: call.pluginId) {
      print("Calling method \(call.method) on plugin \(plugin.getId())")
      
      if !plugin.responds(to: selector) {
        print("Error: Plugin \(plugin.getId()) does not respond to method call \(call.method).")
        print("Ensure plugin method uses @objc in its declaration")
        return
      }
      
      // Create a plugin call object and handle the success/error callbacks
      let pluginCall = PluginCall(success: {(result: PluginResult) -> Void in
        self.toJs(result: JSResult(call: call, result: result.data))
      }, error: {(error: PluginCallError) -> Void in
        self.toJsError(error: JSResultError(call: call, error: error.data))
      })
      
      // Perform the plugin call
      // TODO: Different thread?
      plugin.perform(selector, with: pluginCall)
    }
  }
  
  public func toJs(result: JSResult) {
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
