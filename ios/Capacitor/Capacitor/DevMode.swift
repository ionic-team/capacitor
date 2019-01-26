import Foundation

/**
 * DevMode manages a simple alert popup with developer options for reloading the app,
 * among other things.
 */
class DevMode {
  var bridge: CAPBridge
  init(_ bridge: CAPBridge) {
    self.bridge = bridge
  }
  
  func show() {
    let alert = UIAlertController(title: "Capacitor Dev Menu", message: nil, preferredStyle: UIAlertController.Style.actionSheet)

    alert.addAction(UIAlertAction(title: "Reload", style: .destructive, handler: { (action: UIAlertAction) in
      print("Reloading")
      self.bridge.reload()
    }))

    alert.addAction(UIAlertAction(title: "Cancel", style: .cancel, handler: { (action: UIAlertAction) in
      alert.dismiss(animated: true, completion: nil)
    }))

    alert.popoverPresentationController?.sourceRect = CGRect(x: self.bridge.viewController.view.center.x, y: self.bridge.viewController.view.center.y, width: 0, height: 0)
    alert.popoverPresentationController?.sourceView = self.bridge.viewController.view
    alert.popoverPresentationController?.permittedArrowDirections = .init(rawValue: 0)

    UIApplication.shared.keyWindow?.rootViewController?.present(alert, animated: true, completion: nil)
  }
}
