import Foundation

class DevMode {
  var bridge: Bridge
  init(_ bridge: Bridge) {
    self.bridge = bridge
  }
  
  func show() {
    let alert = UIAlertController(title: "Avocado Dev Mode", message: nil, preferredStyle: UIAlertControllerStyle.actionSheet)
    alert.addAction(UIAlertAction(title: "Reload", style: .destructive, handler: { (action: UIAlertAction) in
      print("Reloading")
      self.bridge.reload()
    }))
    alert.addAction(UIAlertAction(title: "Cancel", style: .cancel, handler: { (action: UIAlertAction) in
      alert.dismiss(animated: true, completion: nil)
    }))
    self.bridge.viewController.present(alert, animated: true, completion: nil)
  }
}
