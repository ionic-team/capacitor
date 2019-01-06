//
//  ViewController.swift
//  IonicRunner
//
//  Created by Max Lynch on 3/22/17.
//  Copyright © 2017 Max Lynch. All rights reserved.
//

import UIKit
import WebKit

public class CAPBridgeViewController: UIViewController, CAPBridgeDelegate, WKScriptMessageHandler, WKUIDelegate, WKNavigationDelegate {
  
  private var webView: WKWebView?
  
  public var bridgedWebView: WKWebView? {
    return webView
  }
  
  public var bridgedViewController: UIViewController? {
    return self
  }
  
  private var hostname: String?
  private var allowNavigationConfig: [String]?
  private var basePath: String = ""
  
  private var isStatusBarVisible = true
  private var statusBarStyle: UIStatusBarStyle = .default
  @objc public var supportedOrientations: Array<Int> = []
  
  // Construct the Capacitor runtime
  public var bridge: CAPBridge?
  
  
  override public func loadView() {
    setStatusBarDefaults()
    setScreenOrientationDefaults()

    let webViewConfiguration = WKWebViewConfiguration()

    webViewConfiguration.setURLSchemeHandler(CAPAssetHandler(), forURLScheme: CAPBridge.CAP_SCHEME)
    webViewConfiguration.setURLSchemeHandler(CAPAssetHandler(), forURLScheme: CAPBridge.CAP_FILE_SCHEME)
    
    let o = WKUserContentController()
    o.add(self, name: "bridge")

    webViewConfiguration.userContentController = o
    
    configureWebView(configuration: webViewConfiguration)
    
    webView = WKWebView(frame: .zero, configuration: webViewConfiguration)
    webView?.scrollView.bounces = false
    
    webView?.scrollView.contentInsetAdjustmentBehavior = .never
    
    webView?.uiDelegate = self
    webView?.navigationDelegate = self
    //If you want to implement the delegate
    //webView?.navigationDelegate = self
    webView?.configuration.preferences.setValue(true, forKey: "allowFileAccessFromFileURLs")
    view = webView
    
    setKeyboardRequiresUserInteraction(false)
    
    bridge = CAPBridge(self, o)
    if let scrollEnabled = CAPConfig.getValue("ios.scrollEnabled") as? Bool {
        webView?.scrollView.isScrollEnabled = scrollEnabled
    }
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

    hostname = CAPConfig.getString("server.url") ?? "\(bridge!.getLocalUrl())"
    allowNavigationConfig = CAPConfig.getValue("server.allowNavigation") as? Array<String>


    print("⚡️  Loading app at \(hostname!)...")
    let request = URLRequest(url: URL(string: hostname!)!)
    _ = webView?.load(request)
  }

  func setServerPath(path: String) {

    self.basePath = path

  }

  public func setStatusBarDefaults() {
    if let plist = Bundle.main.infoDictionary {
      if let statusBarHidden = plist["UIStatusBarHidden"] as? Bool {
        if (statusBarHidden) {
          self.isStatusBarVisible = false
        }
      }
        
      if let statusBarStyle = plist["UIStatusBarStyle"] as? String {
        if (statusBarStyle != "UIStatusBarStyleDefault") {
          self.statusBarStyle = .lightContent
        }
      }
    }
  }

  public func setScreenOrientationDefaults() {
    if let plist = Bundle.main.infoDictionary {
      if let orientations = plist["UISupportedInterfaceOrientations"] as? Array<String> {
        for orientation in orientations {
          if orientation == "UIInterfaceOrientationPortrait" {
            self.supportedOrientations.append(UIInterfaceOrientation.portrait.rawValue)
          }
          if orientation == "UIInterfaceOrientationPortraitUpsideDown" {
            self.supportedOrientations.append(UIInterfaceOrientation.portraitUpsideDown.rawValue)
          }
          if orientation == "UIInterfaceOrientationLandscapeLeft" {
            self.supportedOrientations.append(UIInterfaceOrientation.landscapeLeft.rawValue)
          }
          if orientation == "UIInterfaceOrientationLandscapeRight" {
            self.supportedOrientations.append(UIInterfaceOrientation.landscapeRight.rawValue)
          }
        }
        if self.supportedOrientations.count == 0 {
          self.supportedOrientations.append(UIInterfaceOrientation.portrait.rawValue)
        }
      }
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
    if let allowNavigation = allowNavigationConfig, let requestHost = navUrl.host {
      for pattern in allowNavigation {
        if matchHost(host: requestHost, pattern: pattern) {
          decisionHandler(.allow)
          return
        }
      }
    }
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

  func matchHost(host: String, pattern: String) -> Bool {
    var host = host.split(separator: ".")
    var pattern = pattern.split(separator: ".")

    if host.count != pattern.count {
      return false
    }

    if host == pattern {
      return true
    }

    let wildcards = pattern.enumerated().filter { $0.element == "*" }
    for wildcard in wildcards.reversed() {
      host.remove(at: wildcard.offset)
      pattern.remove(at: wildcard.offset)
    }

    return host == pattern
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


  public func getServerBasePath() -> String {
    return self.basePath
  }

  public func setServerBasePath(path: String) {
    setServerPath(path: path)
    let request = URLRequest(url: URL(string: hostname!)!)
    _ = getWebView().load(request)
  }

  override open var preferredInterfaceOrientationForPresentation: UIInterfaceOrientation {
    return UIApplication.shared.statusBarOrientation
  }

  override public var supportedInterfaceOrientations: UIInterfaceOrientationMask {
    var ret = 0
    if self.supportedOrientations.contains(UIInterfaceOrientation.portrait.rawValue) {
      ret = ret | (1 << UIInterfaceOrientation.portrait.rawValue)
    }
    if self.supportedOrientations.contains(UIInterfaceOrientation.portraitUpsideDown.rawValue) {
      ret = ret | (1 << UIInterfaceOrientation.portraitUpsideDown.rawValue)
    }
    if self.supportedOrientations.contains(UIInterfaceOrientation.landscapeRight.rawValue) {
      ret = ret | (1 << UIInterfaceOrientation.landscapeRight.rawValue)
    }
    if self.supportedOrientations.contains(UIInterfaceOrientation.landscapeLeft.rawValue) {
      ret = ret | (1 << UIInterfaceOrientation.landscapeLeft.rawValue)
    }
    return UIInterfaceOrientationMask.init(rawValue: UInt(ret))
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

