import Foundation

/**
 * Implement three common modal types: alert, confirm, and prompt
 */
@objc(Modals)
public class Modals : AVCPlugin {
  @objc public func alert(_ call: AVCPluginCall) {
    guard let title = call.options["title"] as? String else {
      call.error("title must be provided")
      return
    }
    let message = call.options["message"] as? String
    let buttonTitle = call.options["buttonTitle"] as? String ?? "OK"
    
    let alert = UIAlertController(title: title, message: message, preferredStyle: UIAlertControllerStyle.alert)
    alert.addAction(UIAlertAction(title: buttonTitle, style: UIAlertActionStyle.default, handler: nil))
    
    DispatchQueue.main.async {
      self.bridge.viewController.present(alert, animated: true, completion: nil)
    }
    
    // Call success immediately
    call.success()
  }
  
  @objc public func confirm(_ call: AVCPluginCall) {
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
  
  @objc public func prompt (_ call: AVCPluginCall) {
    guard let title = call.options["title"] as? String else {
      call.error("title must be provided")
      return
    }
    let message = call.options["message"] as? String ?? ""
    let okButtonTitle = call.options["okButtonTitle"] as? String ?? "OK"
    let cancelButtonTitle = call.options["cancelButtonTitle"] as? String ?? "Cancel"
    let inputPlaceholder = call.options["inputPlaceholder"] as? String ?? ""
    
    let alert = UIAlertController(title: title, message: message, preferredStyle: UIAlertControllerStyle.alert)
    
    DispatchQueue.main.async {
      
      alert.addTextField { (textField) in
        textField.text = inputPlaceholder
      }
      
      alert.addAction(UIAlertAction(title: okButtonTitle, style: UIAlertActionStyle.default, handler: { (action) -> Void in
        let textField = alert.textFields![0] as UITextField
        call.success([
          "value": textField.text ?? "",
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
  
  @objc func showActions(_ call: AVCPluginCall) {
    guard let title = call.options["title"] as? String else {
      call.error("title must be provided")
      return
    }
    let message = call.options["message"] as? String ?? ""

    let options = call.getArray("options", JSObject.self) ?? []
    
    DispatchQueue.main.async {
      let alertController = self.buildActionSheet(call, title: title, message: message, options: options)

      self.bridge.viewController.present(alertController, animated: true, completion: nil)
    }
  }
  
 
  func buildActionSheet(_ call: AVCPluginCall, title: String, message: String, options: JSArray) -> UIAlertController {
    let controller = UIAlertController(title: title, message: message, preferredStyle: .actionSheet)
    
    for (index, option) in options.enumerated() {
      let style = option["style"] as? String ?? "DEFAULT"
      let title = option["title"] as? String ?? ""
      
      let action = UIAlertAction(title: title, style: style == "DESTRUCTIVE" ? .destructive : .default, handler: { (action) -> Void in
        call.success([
          "index": index
        ])
      })
      
      controller.addAction(action)
    }
    
    return controller
  }
  
  @objc func showSharing(_ call: AVCPluginCall) {
    var items = [Any]()
    
    if let message = call.options["message"] as? String {
      items.append(message)
    }
    
    if let url = call.options["url"] as? String {
      let urlObj = URL(string: url)
      items.append(urlObj!)
    }
    
    let subject = call.getString("subject")
    
    if items.count == 0 {
      call.error("Must provide at least url or message")
      return
    }
    
    DispatchQueue.main.async {
      let actionController = UIActivityViewController(activityItems: items, applicationActivities: nil)
      
      if subject != nil {
        // https://stackoverflow.com/questions/17020288/how-to-set-a-mail-subject-in-uiactivityviewcontroller
        actionController.setValue(subject, forKey: "subject")
      }
      
      actionController.completionWithItemsHandler = { (activityType, completed, _ returnedItems, activityError) in
        print("COMPLETEION", activityType, completed, returnedItems, activityError)
        if activityError != nil {
          call.error("Error sharing item", activityError)
          return
        }
        
        // TODO: Support returnedItems
        
        call.success([
          "completed": completed,
          "activityType": activityType?.rawValue
        ])
      }
      
      self.bridge.viewController.present(actionController, animated: true, completion: nil)
    }
  }
}
