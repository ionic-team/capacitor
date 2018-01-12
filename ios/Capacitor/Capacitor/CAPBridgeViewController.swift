//
//  ViewController.swift
//  IonicRunner
//
//  Created by Max Lynch on 3/22/17.
//  Copyright © 2017 Max Lynch. All rights reserved.
//

import UIKit
import WebKit
import GCDWebServer

class CAPBridgeViewController: UIViewController, WKScriptMessageHandler, WKUIDelegate, WKNavigationDelegate {
  
  private var webView: WKWebView?
  private var webServer: GCDWebServer?
  
  // Construct the Capacitor runtime
  public var bridge: CAPBridge?
  
  override func loadView() {
    let webViewConfiguration = WKWebViewConfiguration()
    
    let o = WKUserContentController()
    o.add(self, name: "bridge")

    webViewConfiguration.userContentController = o
    
    configureWebView(configuration: webViewConfiguration)
    
    webView = WKWebView(frame: .zero, configuration: webViewConfiguration)
    webView?.scrollView.bounces = false
    webView?.uiDelegate = self
    webView?.navigationDelegate = self
    //If you want to implement the delegate
    //webView?.navigationDelegate = self
    webView?.configuration.preferences.setValue(true, forKey: "allowFileAccessFromFileURLs")
    view = webView
    
    bridge = CAPBridge(self, o)
  }
  
  override func viewDidLoad() {
    super.viewDidLoad()
    self.becomeFirstResponder()
    
    loadWebView()
  }
  
  public override func viewWillAppear(_ animated: Bool) {
    bridge!.willAppear()
  }
  
  func loadWebView() {
    if Bundle.main.path(forResource: "public/index", ofType: "html") == nil {
      print("⚡️  FATAL ERROR: Unable to load public/index.html")
      print("⚡️  This file is the root of your web app and must exist before")
      print("⚡️  Capacitor can run. Ensure you've run capacitor sync at least once")
      exit(1)
    }

    print("⚡️  Starting web server...")
    startWebServer()

    print("⚡️  Loading index.html...")
    let request = URLRequest(url: URL(string: "http://localhost:8081/")!)
    _ = webView?.load(request)
  }

  func startWebServer() {
    let publicPath = Bundle.main.path(forResource: "public", ofType: nil)
    GCDWebServer.setLogLevel(0)
    self.webServer = GCDWebServer.init()
    guard let webServer = self.webServer else {
      fatalError("Unable to create local web server")
    }
    
    webServer.addGETHandler(forBasePath: "/", directoryPath: publicPath!, indexFilename: "index.html", cacheAge: 3600, allowRangeRequests: true)
    
    // Optional config for SPAs to redirect all requests to index file? Not quite right, needs to rewrite instead of redirect
    //webServer.addHandler(forMethod: "GET", path: "/", request: GCDWebServerRequest.self, processBlock: { (req) -> GCDWebServerResponse? in
      //return GCDWebServerResponse(redirect: URL(string: "index.html")!, permanent: false)
    //})
    
    do {
      let options = [
        GCDWebServerOption_Port: 8081,
        GCDWebServerOption_BindToLocalhost: true,
        GCDWebServerOption_ServerName: "Capacitor"
      ] as [String : Any]
      try webServer.start(options: options)
    } catch {
      print(error)
    }
  }
  public func configureWebView(configuration: WKWebViewConfiguration) {
    configuration.allowsInlineMediaPlayback = true
    configuration.suppressesIncrementalRendering = false
    configuration.allowsAirPlayForMediaPlayback = true
    //configuration.mediaTypesRequiringUserActionForPlayback = WKAudiovisualMediaTypeNone
  }
  
  func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
    //print("⚡️  WebView loaded")
  }
  
  func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
    print("⚡️  WebView failed to load")
    print("⚡️  Error: " + error.localizedDescription)
  }
  
  func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
    print("⚡️  WebView failed provisional navigation")
    print("⚡️  Error: " + error.localizedDescription)
  }
  
  public override func canPerformUnwindSegueAction(_ action: Selector, from fromViewController: UIViewController, withSender sender: Any) -> Bool {
    return false
  }
  
  public func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
    let body = message.body
    if let dict = body as? [String:Any] {
      let type = dict["type"] as? String ?? ""
      
      if type == "js.error" {
        if let error = dict["error"] as! [String:Any]? {
          handleJSStartupError(error)
        }
      } else if type == "message" {
        let pluginId = dict["pluginId"] as? String ?? ""
        let method = dict["methodName"] as? String ?? ""
        let callbackId = dict["callbackId"] as? String ?? ""
        
        let options = dict["options"] as? [String:Any] ?? [:]
        
        print("⚡️  To Native -> ", pluginId, method, callbackId, options)
        
        self.bridge!.handleJSCall(call: JSCall(options: options, pluginId: pluginId, method: method, callbackId: callbackId))
      } else if type == "cordova" {
        let pluginId = dict["service"] as? String ?? ""
        let method = dict["action"] as? String ?? ""
        let callbackId = dict["callbackId"] as? String ?? ""
        
        let args = dict["actionArgs"] as? Array ?? []
        let options = ["options":args]
        
        print("To Native Cordova -> ", pluginId, method, callbackId, options)
        
        self.bridge!.handleCordovaJSCall(call: JSCall(options: options, pluginId: pluginId, method: method, callbackId: callbackId))
      }
    }
  }
  
  func handleJSStartupError(_ error: [String:Any]) {
    let message = error["message"] ?? "No message"
    let url = error["url"] as? String ?? ""
    let line = error["line"] ?? ""
    let col = error["col"] ?? ""
    var filename = ""
    if let filenameIndex = url.range(of: "/", options: .backwards)?.lowerBound {
      let index = url.index(after: filenameIndex)
      filename = String(url[index...])
    }
    
    print("\n⚡️  ------ STARTUP JS ERROR ------\n")
    print("⚡️  \(message)")
    print("⚡️  URL: \(url)")
    print("⚡️  \(filename):\(line):\(col)")
    print("\n⚡️  See above for help with debugging blank-screen issues")
  }
  
  override func didReceiveMemoryWarning() {
    super.didReceiveMemoryWarning()
    // Dispose of any resources that can be recreated.
  }
  
  override func motionEnded(_ motion: UIEventSubtype, with event: UIEvent?) {
    if motion == .motionShake {
      bridge?.showDevMode()
    }
  }
  
  // We are willing to become first responder to get shake motion
  override var canBecomeFirstResponder: Bool {
    get {
      return true
    }
  }
  
  func webView(_ webView: WKWebView, runJavaScriptAlertPanelWithMessage message: String, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping () -> Void) {
    
    let alertController = UIAlertController(title: nil, message: message, preferredStyle: .alert)
    
    alertController.addAction(UIAlertAction(title: "Ok", style: .default, handler: { (action) in
      completionHandler()
    }))
    
    self.present(alertController, animated: true, completion: nil)
  }
  
  func webView(_ webView: WKWebView, runJavaScriptConfirmPanelWithMessage message: String, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping (Bool) -> Void) {
    
    let alertController = UIAlertController(title: nil, message: message, preferredStyle: .alert)
    
    alertController.addAction(UIAlertAction(title: "Ok", style: .default, handler: { (action) in
      completionHandler(true)
    }))
    
    alertController.addAction(UIAlertAction(title: "Cancel", style: .default, handler: { (action) in
      completionHandler(false)
    }))
    
    self.present(alertController, animated: true, completion: nil)
  }
  
  func webView(_ webView: WKWebView, runJavaScriptTextInputPanelWithPrompt prompt: String, defaultText: String?, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping (String?) -> Void) {
    
    let alertController = UIAlertController(title: nil, message: prompt, preferredStyle: .actionSheet)
    
    alertController.addTextField { (textField) in
      textField.text = defaultText
    }
    
    alertController.addAction(UIAlertAction(title: "Ok", style: .default, handler: { (action) in
      if let text = alertController.textFields?.first?.text {
        completionHandler(text)
      } else {
        completionHandler(defaultText)
      }
      
    }))
    
    alertController.addAction(UIAlertAction(title: "Cancel", style: .default, handler: { (action) in
      
      completionHandler(nil)
      
    }))
    
    self.present(alertController, animated: true, completion: nil)
  }
  
  public func getWebView() -> WKWebView {
    return self.webView!
  }
  
  /**
   * Add hooks to detect failed HTTP requests
   
   func webView(webView: WKWebView,
   didFailProvisionalNavigation navigation: WKNavigation!,
   withError error: NSError) {
   if error.code == -1001 { // TIMED OUT:
   // CODE to handle TIMEOUT
   } else if error.code == -1003 { // SERVER CANNOT BE FOUND
   // CODE to handle SERVER not found
   } else if error.code == -1100 { // URL NOT FOUND ON SERVER
   // CODE to handle URL not found
   }
   }
   */
  
}

