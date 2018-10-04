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

public class CAPBridgeViewController: UIViewController, CAPBridgeDelegate, WKScriptMessageHandler, WKUIDelegate, WKNavigationDelegate {
  
  private var webView: WKWebView?
  private var webServer: GCDWebServer?
  
  public var bridgedWebView: WKWebView? {
    return webView
  }
  
  public var bridgedViewController: UIViewController? {
    return self
  }
  
  private var hostname: String?
  private var basePath: String = ""
  
  private var isStatusBarVisible = true
  private var statusBarStyle: UIStatusBarStyle = .default
  
  // Construct the Capacitor runtime
  public var bridge: CAPBridge?
  
  
  override public func loadView() {
    let webViewConfiguration = WKWebViewConfiguration()
    
    let o = WKUserContentController()
    o.add(self, name: "bridge")

    webViewConfiguration.userContentController = o
    
    configureWebView(configuration: webViewConfiguration)
    
    webView = WKWebView(frame: .zero, configuration: webViewConfiguration)
    webView?.scrollView.bounces = false
    if #available(iOS 11.0, *) {
        webView?.scrollView.contentInsetAdjustmentBehavior = UIScrollView.ContentInsetAdjustmentBehavior.never
    }
    webView?.uiDelegate = self
    webView?.navigationDelegate = self
    //If you want to implement the delegate
    //webView?.navigationDelegate = self
    webView?.configuration.preferences.setValue(true, forKey: "allowFileAccessFromFileURLs")
    view = webView
    
    setKeyboardRequiresUserInteraction(false)
    
    bridge = CAPBridge(self, o)
  }
  
  override public func viewDidLoad() {
    super.viewDidLoad()
    self.becomeFirstResponder()
    
    loadWebView()
    bridge!.didLoad()
  }
  
  public override func viewWillAppear(_ animated: Bool) {
    bridge!.willAppear()
  }
  
  func loadWebView() {
    if Bundle.main.path(forResource: "public/index", ofType: "html") == nil {
      print("⚡️  FATAL ERROR: Unable to load public/index.html")
      print("⚡️  This file is the root of your web app and must exist before")
      print("⚡️  Capacitor can run. Ensure you've run capacitor copy at least once")
      
      exit(1)
    }

    hostname = CAPConfig.getString("server.url") ?? "\(bridge!.getLocalUrl())/"

    initWebServer()

    print("⚡️  Loading app at \(hostname!)...")
    let request = URLRequest(url: URL(string: hostname!)!)
    _ = webView?.load(request)
  }
  
  func initWebServer() {
    GCDWebServer.setLogLevel(3)
    self.webServer = GCDWebServer.init()

    var startPath = Bundle.main.path(forResource: "public", ofType: nil)

    let defaults = UserDefaults.standard
    let persistedPath = defaults.string(forKey: "serverBasePath")
    if (persistedPath != nil && !persistedPath!.isEmpty) {
      startPath = persistedPath
    }

    setServerPath(path: startPath!)

    startServer()
  }

  func startServer() {
    do {
      let options = [
        GCDWebServerOption_Port: bridge!.getPort(),
        GCDWebServerOption_BindToLocalhost: true,
        GCDWebServerOption_ServerName: "Capacitor"
        ] as [String : Any]
      try self.getWebServer().start(options: options)
    } catch {
      print(error)
    }
  }

  func setServerPath(path: String) {
    let webServer = getWebServer()
    self.basePath = path
    let restart = webServer.isRunning

    if (restart) {
      webServer.stop()
    }

    webServer.addGETHandler(forBasePath: "/", directoryPath: path, indexFilename: "index.html", cacheAge: 0, allowRangeRequests: true)

    webServer.addHandler(forMethod: "GET", pathRegex: "_capacitor_/", request: GCDWebServerFileRequest.self) { (request, block) in
      let urlToRemove = "\(self.bridge!.getLocalUrl())/_capacitor_/"
      var absUrl = request.url.absoluteString.replacingOccurrences(of: urlToRemove, with: "")

      if let range = absUrl.range(of: "?") {
        absUrl.removeSubrange(range.lowerBound..<absUrl.endIndex)
      }

      let fileManager = FileManager.default
      if !fileManager.fileExists(atPath: absUrl) {
        let response = GCDWebServerResponse(statusCode: 404)
        block(response)
      } else {
        var fileResponse = GCDWebServerFileResponse(file: absUrl, byteRange: request.byteRange)
        fileResponse?.setValue("bytes", forAdditionalHeader: "Accept-Ranges")
        block(fileResponse)
      }
    }

    webServer.addHandler(forMethod: "GET", pathRegex: "cordova.js", request: GCDWebServerFileRequest.self) { (request, block) in
      block(GCDWebServerResponse())
    }

    if (restart) {
     startServer()
    }

  }

  public func configureWebView(configuration: WKWebViewConfiguration) {
    configuration.allowsInlineMediaPlayback = true
    configuration.suppressesIncrementalRendering = false
    configuration.allowsAirPlayForMediaPlayback = true
    //configuration.mediaTypesRequiringUserActionForPlayback = WKAudiovisualMediaTypeNone
  }

  public func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation!) {
    // Reset the bridge on each navigation
    bridge!.reset()
  }

  public func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
    let navUrl = navigationAction.request.url!
    if let scheme = navUrl.scheme {
      let validSchemes = ["tel", "mailto", "facetime", "sms", "maps", "itms-services", "http", "https"]
      if validSchemes.contains(scheme) && navUrl.absoluteString.range(of: hostname!) == nil && (navigationAction.targetFrame == nil || (navigationAction.targetFrame?.isMainFrame)!) {
        UIApplication.shared.open(navUrl, options: [:], completionHandler: nil)
        decisionHandler(.cancel)
        return
      }
    }

    // TODO: Allow plugins to handle this. See
    // https://github.com/ionic-team/cordova-plugin-ionic-webview/blob/608d64191405b233c01a939f5755f8b1fdd97f8c/src/ios/CDVWKWebViewEngine.m#L609
    decisionHandler(.allow)
  }

  public func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
    print("⚡️  WebView loaded")
  }

  public func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
    print("⚡️  WebView failed to load")
    print("⚡️  Error: " + error.localizedDescription)
  }

  public func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
    print("⚡️  WebView failed provisional navigation")
    print("⚡️  Error: " + error.localizedDescription)
  }

  public override func canPerformUnwindSegueAction(_ action: Selector, from fromViewController: UIViewController, withSender sender: Any) -> Bool {
    return false
  }

  public func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
    guard let bridge = bridge else {
      return
    }
    self.userContentController(userContentController, didReceive: message, bridge: bridge)
  }

  typealias ClosureType =  @convention(c) (Any, Selector, UnsafeRawPointer, Bool, Bool, Any?) -> Void
  typealias NewClosureType =  @convention(c) (Any, Selector, UnsafeRawPointer, Bool, Bool, Bool, Any?) -> Void
  func setKeyboardRequiresUserInteraction( _ value: Bool) {
    let frameworkName = "WK"
    let className = "ContentView"
    guard let wkc = NSClassFromString(frameworkName + className) else {
      return
    }

    let oldSelector: Selector = sel_getUid("_startAssistingNode:userIsInteracting:blurPreviousNode:userObject:")
    let newSelector: Selector = sel_getUid("_startAssistingNode:userIsInteracting:blurPreviousNode:changingActivityState:userObject:")

    if let method = class_getInstanceMethod(wkc, oldSelector) {
      let originalImp: IMP = method_getImplementation(method)
      let original: ClosureType = unsafeBitCast(originalImp, to: ClosureType.self)
      let block : @convention(block) (Any, UnsafeRawPointer, Bool, Bool, Any?) -> Void = { (me, arg0, arg1, arg2, arg3) in
        original(me, oldSelector, arg0, !value, arg2, arg3)
      }
      let imp: IMP = imp_implementationWithBlock(block)
      method_setImplementation(method, imp)
    }

    if let method = class_getInstanceMethod(wkc, newSelector) {
      let originalImp: IMP = method_getImplementation(method)
      let original: NewClosureType = unsafeBitCast(originalImp, to: NewClosureType.self)
      let block : @convention(block) (Any, UnsafeRawPointer, Bool, Bool, Bool, Any?) -> Void = { (me, arg0, arg1, arg2, arg3, arg4) in
        original(me, newSelector, arg0, !value, arg2, arg3, arg4)
      }
      let imp: IMP = imp_implementationWithBlock(block)
      method_setImplementation(method, imp)
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

  override public func didReceiveMemoryWarning() {
    super.didReceiveMemoryWarning()
    // Dispose of any resources that can be recreated.
  }

  override public func motionEnded(_ motion: UIEventSubtype, with event: UIEvent?) {
    if bridge != nil {
      if motion == .motionShake && bridge!.isDevMode() {
        bridge!.showDevMode()
      }
    }
  }

  // We are willing to become first responder to get shake motion
  override public var canBecomeFirstResponder: Bool {
    get {
      return true
    }
  }

  override public var prefersStatusBarHidden: Bool {
    get {
      return !isStatusBarVisible
    }
  }

  override public var preferredStatusBarStyle: UIStatusBarStyle {
    get {
      return statusBarStyle
    }
  }

  override public var preferredStatusBarUpdateAnimation: UIStatusBarAnimation {
    get {
      return .slide
    }
  }

  public func setStatusBarVisible(_ isStatusBarVisible: Bool) {
    self.isStatusBarVisible = isStatusBarVisible
    UIView.animate(withDuration: 0.2, animations: {
      self.setNeedsStatusBarAppearanceUpdate()
    })
  }

  public func setStatusBarStyle(_ statusBarStyle: UIStatusBarStyle) {
    self.statusBarStyle = statusBarStyle
    UIView.animate(withDuration: 0.2, animations: {
      self.setNeedsStatusBarAppearanceUpdate()
    })
  }

  public func webView(_ webView: WKWebView, runJavaScriptAlertPanelWithMessage message: String, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping () -> Void) {

    let alertController = UIAlertController(title: nil, message: message, preferredStyle: .alert)

    alertController.addAction(UIAlertAction(title: "Ok", style: .default, handler: { (action) in
      completionHandler()
    }))

    self.present(alertController, animated: true, completion: nil)
  }

  public func webView(_ webView: WKWebView, runJavaScriptConfirmPanelWithMessage message: String, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping (Bool) -> Void) {

    let alertController = UIAlertController(title: nil, message: message, preferredStyle: .alert)

    alertController.addAction(UIAlertAction(title: "Ok", style: .default, handler: { (action) in
      completionHandler(true)
    }))

    alertController.addAction(UIAlertAction(title: "Cancel", style: .default, handler: { (action) in
      completionHandler(false)
    }))

    self.present(alertController, animated: true, completion: nil)
  }

  public func webView(_ webView: WKWebView, runJavaScriptTextInputPanelWithPrompt prompt: String, defaultText: String?, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping (String?) -> Void) {
    
    let alertController = UIAlertController(title: nil, message: prompt, preferredStyle: .alert)
    
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

  public func webView(_ webView: WKWebView, createWebViewWith configuration: WKWebViewConfiguration, for navigationAction: WKNavigationAction, windowFeatures: WKWindowFeatures) -> WKWebView? {
    if (navigationAction.request.url != nil) {
      UIApplication.shared.open(navigationAction.request.url!, options: [:], completionHandler: nil)
    }
    return nil
  }

  public func getWebView() -> WKWebView {
    return self.webView!
  }

  public func getWebServer() -> GCDWebServer {
    return self.webServer!
  }

  public func getServerBasePath() -> String {
    return self.basePath
  }

  public func setServerBasePath(path: String) {
    setServerPath(path: path)
    let request = URLRequest(url: URL(string: hostname!)!)
    _ = getWebView().load(request)
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

