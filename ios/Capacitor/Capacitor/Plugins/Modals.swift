import Foundation

/**
 * Implement three common modal types: alert, confirm, and prompt
 */
@objc(CAPModalsPlugin)
public class CAPModalsPlugin : CAPPlugin {
  @objc public func alert(_ call: CAPPluginCall) {
    guard let title = call.options["title"] as? String else {
      call.error("title must be provided")
      return
    }
    let message = call.options["message"] as? String
    let buttonTitle = call.options["buttonTitle"] as? String ?? "OK"
    
    let alert = UIAlertController(title: title, message: message, preferredStyle: UIAlertController.Style.alert)
    alert.addAction(UIAlertAction(title: buttonTitle, style: UIAlertAction.Style.default, handler: { (action) -> Void in
      call.success()
    }))
    
    DispatchQueue.main.async { [weak self] in
      self?.bridge?.viewController?.present(alert, animated: true, completion: nil)
    }
  }
  
  @objc public func confirm(_ call: CAPPluginCall) {
    guard let title = call.options["title"] as? String else {
      call.error("title must be provided")
      return
    }
    let message = call.options["message"] as? String ?? ""
    let okButtonTitle = call.options["okButtonTitle"] as? String ?? "OK"
    let cancelButtonTitle = call.options["cancelButtonTitle"] as? String ?? "Cancel"
    
    let alert = UIAlertController(title: title, message: message, preferredStyle: UIAlertController.Style.alert)
    alert.addAction(UIAlertAction(title: okButtonTitle, style: UIAlertAction.Style.default, handler: { (action) -> Void in
      call.success([
        "value": true
      ])
    }))
    alert.addAction(UIAlertAction(title: cancelButtonTitle, style: UIAlertAction.Style.default, handler: { (action) -> Void in
      call.success([
        "value": false
      ])
    }))
    
    DispatchQueue.main.async { [weak self] in
      self?.bridge?.viewController?.present(alert, animated: true, completion: nil)
    }
  }
  
  @objc public func prompt (_ call: CAPPluginCall) {
    guard let title = call.options["title"] as? String else {
      call.error("title must be provided")
      return
    }
    let message = call.options["message"] as? String ?? ""
    let okButtonTitle = call.options["okButtonTitle"] as? String ?? "OK"
    let cancelButtonTitle = call.options["cancelButtonTitle"] as? String ?? "Cancel"
    let inputPlaceholder = call.options["inputPlaceholder"] as? String ?? ""
    let inputText = call.options["inputText"] as? String ?? ""
    
    let alert = UIAlertController(title: title, message: message, preferredStyle: UIAlertController.Style.alert)
    
    DispatchQueue.main.async { [weak self] in
      
      alert.addTextField { (textField) in
        textField.placeholder = inputPlaceholder
        textField.text = inputText
      }
      
      alert.addAction(UIAlertAction(title: okButtonTitle, style: UIAlertAction.Style.default, handler: { (action) -> Void in
        let textField = alert.textFields![0] as UITextField
        call.success([
          "value": textField.text ?? "",
          "cancelled": false
        ])
      }))
      alert.addAction(UIAlertAction(title: cancelButtonTitle, style: UIAlertAction.Style.default, handler: { (action) -> Void in
        call.success([
          "value": "",
          "cancelled": true
        ])
      }))
      
      self?.bridge?.viewController?.present(alert, animated: true, completion: nil)
    }
  }
  
  @objc func showActions(_ call: CAPPluginCall) {
    guard let title = call.options["title"] as? String else {
      call.error("title must be provided")
      return
    }
    let message = call.options["message"] as? String ?? ""

    let options = call.getArray("options", JSObject.self) ?? []
    
    DispatchQueue.main.async { [weak self] in
      if let alertController = self?.buildActionSheet(call, title: title, message: message, options: options) {
        self?.bridge?.viewController?.present(alertController, animated: true, completion: nil)
      }
    }
  }
  
 
  func buildActionSheet(_ call: CAPPluginCall, title: String, message: String, options: JSArray) -> UIAlertController {
    let controller = UIAlertController(title: title, message: message, preferredStyle: .actionSheet)
    
    for (index, option) in options.enumerated() {
      let style = option["style"] as? String ?? "DEFAULT"
      let title = option["title"] as? String ?? ""
      var buttonStyle: UIAlertAction.Style = .default
      if style == "DESTRUCTIVE" {
        buttonStyle = .destructive
      } else if style == "CANCEL" {
        buttonStyle = .cancel
      }
      let action = UIAlertAction(title: title, style: buttonStyle, handler: { (action) -> Void in
        call.success([
          "index": index
        ])
      })
      
      controller.addAction(action)
    }
    self.setCenteredPopover(controller)
    
    return controller
  }
}
