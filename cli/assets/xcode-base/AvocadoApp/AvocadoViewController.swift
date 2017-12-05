//
//  ViewController.swift
//  IonicRunner
//
//  Created by Max Lynch on 3/22/17.
//  Copyright © 2017 Max Lynch. All rights reserved.
//

import UIKit
import WebKit
import Avocado

class AvocadoViewController: UIViewController, WKScriptMessageHandler, WKUIDelegate {

  private var webView: WKWebView?
  
  // Construct the avocado runtime
  public var bridge: Bridge?
  
  override func loadView() {
    bridge = Bridge(self,[])
    
    let webViewConfiguration = WKWebViewConfiguration()
    
    let o = WKUserContentController()
    o.add(self, name: "avocado")
    webViewConfiguration.userContentController = o
    
    configureWebView(configuration: webViewConfiguration)
    
    webView = WKWebView(frame: .zero, configuration: webViewConfiguration)
    webView?.scrollView.bounces = false
    webView?.uiDelegate = self
    //If you want to implement the delegate
    //webView?.navigationDelegate = self
    
    view = webView
    
    self.bridge!.setWebView(webView: webView!)
  }
  
  override func viewDidLoad() {
    super.viewDidLoad()
    
    /*
    if let url = URL(string: "https://google.com") {
      let req = URLRequest(url: url)
      webView?.load(req)
    }
 */
    
    let index = Bundle.main.path(forResource: "www/index", ofType: "html");
    
    let indexPath = "file://" + index!;
    let indexUrl = URL(fileURLWithPath: indexPath);
    let indexDir = "file://" + indexUrl.deletingLastPathComponent().path;
    
    if let url = URL(string: indexPath) {
      _ = webView?.loadFileURL(url, allowingReadAccessTo: URL(string: indexDir)!)
    }
  }
  
  public func configureWebView(configuration: WKWebViewConfiguration) {
    configuration.allowsInlineMediaPlayback = true
    configuration.suppressesIncrementalRendering = false
    configuration.allowsAirPlayForMediaPlayback = true
    //configuration.mediaTypesRequiringUserActionForPlayback = WKAudiovisualMediaTypeNone
  }
  
  public func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
    let body = message.body
    if let dict = body as? [String:Any] {
      let type = dict["type"] as? String ?? ""
      
      if type == "js.error" {
        print("JS ERORR")
        if let error = dict["error"] as! [String:Any]? {
          handleJSStartupError(error)
        }
      } else if type == "message" {
        let pluginId = dict["pluginId"] as? String ?? ""
        let method = dict["methodName"] as? String ?? ""
        let callbackId = dict["callbackId"] as? String ?? ""
        
        let options = dict["options"] as! [String:Any]? ?? [:]
        
        print("To Native -> ", pluginId, method, callbackId, options)
        
        self.bridge!.handleJSCall(call: JSCall(options: options, pluginId: pluginId, method: method, callbackId: callbackId))
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
    
    print("\n------ STARTUP JS ERROR ------\n")
    print("\(message)")
    print("URL: \(url)")
    print("\(filename):\(line):\(col)")
    print("\nSee above for help with debugging blank-screen issues")
  }

  override func didReceiveMemoryWarning() {
    super.didReceiveMemoryWarning()
    // Dispose of any resources that can be recreated.
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

