import Foundation

public protocol CAPBridgeDelegate {
  var bridgedWebView: WKWebView? { get }
  var bridgedViewController: UIViewController? { get }
}

extension CAPBridgeDelegate {
  public func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage, bridge: CAPBridge) {
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
        
        if pluginId != "Console" {
          CAPLog.print("⚡️  To Native -> ", pluginId, method, callbackId)
        }
        
        bridge.handleJSCall(call: JSCall(options: options, pluginId: pluginId, method: method, callbackId: callbackId))
      } else if type == "cordova" {
        let pluginId = dict["service"] as? String ?? ""
        let method = dict["action"] as? String ?? ""
        let callbackId = dict["callbackId"] as? String ?? ""
        
        let args = dict["actionArgs"] as? Array ?? []
        let options = ["options":args]
        
        CAPLog.print("To Native Cordova -> ", pluginId, method, callbackId, options)
        
        bridge.handleCordovaJSCall(call: JSCall(options: options, pluginId: pluginId, method: method, callbackId: callbackId))
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
    
    CAPLog.print("\n⚡️  ------ STARTUP JS ERROR ------\n")
    CAPLog.print("⚡️  \(message)")
    CAPLog.print("⚡️  URL: \(url)")
    CAPLog.print("⚡️  \(filename):\(line):\(col)")
    CAPLog.print("\n⚡️  See above for help with debugging blank-screen issues")
  }
}
