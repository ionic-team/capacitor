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
  public let avocado: Avocado = Avocado()
  
  override func loadView() {
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
    
    self.avocado.setWebView(webView: webView!)
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
      let pluginId = dict["pluginId"] as! String
      let method = dict["methodName"] as! String
      let callbackId = dict["callbackId"] as! String
      
      
      print("Native: ", pluginId, method, callbackId)
      print(dict)
      
      self.avocado.handleJSCall2(call: JSCall(pluginId: pluginId, method: method, callbackId: callbackId))

    }
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

}

