//
//  Avocado.swift
//  Avocado
//
//  Created by Max Lynch
//  Copyright © 2017 Drifty Co. All rights reserved.
//

import Foundation
import WebKit

public class Avocado {
  public var webView: WKWebView?
  
  public var lastPlugin: Plugin?
  public var plugins =  [String:Plugin]()
  
  public init() {
    registerCorePlugins()
  }
  
  func registerCorePlugins() {
    let device = Device(self)
    let geo = Geolocation(self)
    let statusbar = StatusBar(self)
    let haptics = Haptics(self)
    self.registerPlugin(device)
    self.registerPlugin(geo)
    self.registerPlugin(statusbar)
    self.registerPlugin(haptics)
  }
  
  public func setWebView(webView: WKWebView) {
    self.webView = webView
  }
  
  public func registerPlugin(_ plugin: Plugin) {
    self.plugins[plugin.getId()] = plugin
  }
  
  public func getPlugin(pluginName: String) -> Plugin? {
    return self.plugins[pluginName]
  }
  
  /**
   * Handle a call from JavaScript. First, find the corresponding plugin,
   * construct a selector, and perform that selector on the plugin instance.
   */
  public func handleJSCall(call: JSCall) {
    // Create a selector to send to the plugin
    let selector = NSSelectorFromString("\(call.method):")
    
    // Get the plugin from the list of loaded, registered plugins
    if let plugin = self.getPlugin(pluginName: call.pluginId) {
      print("Calling method \(call.method) on plugin \(plugin.getId())")
      
      if !plugin.responds(to: selector) {
        print("Error: Plugin \(plugin.getId()) does not respond to method call \(call.method).")
        print("Ensure plugin method exists and uses @objc in its declaration")
        return
      }
      
      // Create a plugin call object and handle the success/error callbacks
      let pluginCall = PluginCall(options: call.options, success: {(result: PluginResult) -> Void in
        self.toJs(result: JSResult(call: call, result: result.data))
      }, error: {(error: PluginCallError) -> Void in
        self.toJsError(error: JSResultError(call: call, error: error.data))
      })
      
      // Perform the plugin call
      // TODO: Different thread?
      plugin.perform(selector, with: pluginCall)
    }
  }
  
  /**
   * Send a successful result to the JavaScript layer.
   */
  public func toJs(result: JSResult) {
    print(result.toJson())
    self.webView?.evaluateJavaScript("window.avocado.fromNative({ callbackId: '\(result.call.callbackId)', pluginId: '\(result.call.pluginId)', methodName: '\(result.call.method)', success: true, data: \(result.toJson())})") { (result, error) in
      if error != nil && result != nil {
        print(result!)
      }
    }
  }
  
  /**
   * Send an error result to the JavaScript layer.
   */
  public func toJsError(error: JSResultError) {
    self.webView?.evaluateJavaScript("window.avocado.fromNative({ callbackId: '\(error.call.callbackId)', pluginId: '\(error.call.pluginId)', methodName: '\(error.call.method)', success: false, error: '\(error.toJson())'})") { (result, error) in
      if error != nil && result != nil {
        print(result!)
      }
    }
  }
}
