import Foundation

@objc(Modals)
public class Modals : Plugin {
  @objc public func alert(_ call: PluginCall) {
    guard let title = call.options["title"] as? String else {
      call.error("title must be provided")
      return
    }
    guard let message = call.options["message"] as? String else {
      call.error("nessage must be provided")
      return
    }
    guard let buttonTitle = call.options["buttonTitle"] as? String else {
      call.error("buttonTitle must be provided")
      return
    }
    
    let alert = UIAlertController(title: title, message: message, preferredStyle: UIAlertControllerStyle.alert)
    alert.addAction(UIAlertAction(title: buttonTitle, style: UIAlertActionStyle.default, handler: nil))
    self.bridge.viewController.present(alert, animated: true, completion: nil)
    call.success()
  }
}



