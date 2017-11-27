import Foundation

/**
 * Implement three common modal types: alert, confirm, and prompt
 */
@objc(Modals)
public class Modals : Plugin {
  @objc public func alert(_ call: PluginCall) {
    guard let title = call.options["title"] as? String else {
      call.error("title must be provided")
      return
    }
    let message = call.options["message"] as? String
    let buttonTitle = call.options["buttonTitle"] as? String ?? "OK"
    
    let alert = UIAlertController(title: title, message: message, preferredStyle: UIAlertControllerStyle.alert)
    alert.addAction(UIAlertAction(title: buttonTitle, style: UIAlertActionStyle.default, handler: nil))
    self.bridge.viewController.present(alert, animated: true, completion: nil)
    
    // Call success immediately
    call.success()
  }
  
  @objc public func confirm(_ call: PluginCall) {
    guard let title = call.options["title"] as? String else {
      call.error("title must be provided")
      return
    }
    let message = call.options["message"] as? String ?? ""
    let okButtonTitle = call.options["okButtonTitle"] as? String ?? "OK"
    let cancelButtonTitle = call.options["cancelButtonTitle"] as? String ?? "Cancel"
    
    let alert = UIAlertController(title: title, message: message, preferredStyle: UIAlertControllerStyle.alert)
    alert.addAction(UIAlertAction(title: okButtonTitle, style: UIAlertActionStyle.default, handler: { (action) -> Void in
      call.success([
        "value": true
      ])
    }))
    alert.addAction(UIAlertAction(title: cancelButtonTitle, style: UIAlertActionStyle.default, handler: { (action) -> Void in
      call.success([
        "value": false
      ])
    }))
    self.bridge.viewController.present(alert, animated: true, completion: nil)
  }
  
  @objc public func prompt (_ call: PluginCall) {
    guard let title = call.options["title"] as? String else {
      call.error("title must be provided")
      return
    }
    let message = call.options["message"] as? String ?? ""
    let okButtonTitle = call.options["okButtonTitle"] as? String ?? "OK"
    let cancelButtonTitle = call.options["cancelButtonTitle"] as? String ?? "Cancel"
    let inputPlaceholder = call.options["inputPlaceholder"] as? String ?? ""
    
    let alert = UIAlertController(title: title, message: message, preferredStyle: UIAlertControllerStyle.alert)
    
    alert.addTextField { (textField) in
      textField.text = inputPlaceholder
    }
    
    alert.addAction(UIAlertAction(title: okButtonTitle, style: UIAlertActionStyle.default, handler: { (action) -> Void in
      let textField = alert.textFields![0] as UITextField
      call.success([
        "value": textField.text,
        "cancelled": false
      ])
    }))
    alert.addAction(UIAlertAction(title: cancelButtonTitle, style: UIAlertActionStyle.default, handler: { (action) -> Void in
      call.success([
        "value": "",
        "cancelled": true
      ])
    }))
    
    self.bridge.viewController.present(alert, animated: true, completion: nil)
  }
}



