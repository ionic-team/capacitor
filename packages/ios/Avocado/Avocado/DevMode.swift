import Foundation

class DevMode {
  init(_ bridge: Bridge) {
  }
  
  func show() {
    let alert = UIAlertController(title: "Avocado Dev Mode", message: nil, preferredStyle: .actionSheet)
    alert.addAction(UIAlertAction(title: "Reload", style: .destructive, handler: { (action: UIAlertAction) in
      print("Reloading")
    }))
  }
}
