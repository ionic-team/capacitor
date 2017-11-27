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
    self.bridge.viewController.present(alert, animated: true, completion: nil)
  }
}
