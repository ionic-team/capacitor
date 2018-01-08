import Foundation

class DevMode {
  var bridge: CAPBridge
  init(_ bridge: CAPBridge) {
    self.bridge = bridge
  }
  
  func show() {
    let alert = UIAlertController(title: "Capacitor Dev Menu", message: nil, preferredStyle: UIAlertControllerStyle.actionSheet)
    
    alert.addAction(UIAlertAction(title: "Reload", style: .destructive, handler: { (action: UIAlertAction) in
      print("Reloading")
      self.bridge.reload()
    }))
    
    alert.addAction(UIAlertAction(title: "Cancel", style: .cancel, handler: { (action: UIAlertAction) in
      alert.dismiss(animated: true, completion: nil)
    }))
    
    UIApplication.shared.keyWindow?.rootViewController?.present(alert, animated: true, completion: nil)
  }
}
