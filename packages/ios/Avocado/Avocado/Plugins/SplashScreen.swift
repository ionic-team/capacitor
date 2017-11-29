import Foundation
import AudioToolbox

@objc(SplashScreen)
public class SplashScreen : Plugin {
  var imageView = UIImageView()
  var image: UIImage?
  
  
  public override func load() {
    buildViews()
  }
  
  // Show the splash screen
  @objc public func show(_ call: PluginCall) {
    showSplash()
    call.success()
  }
  
  // Hide the splash screen
  @objc public func hide(_ call: PluginCall) {
    hideSplash()
    call.success()
  }
  
  func buildViews() {
    // Find the image asset named "Splash"
    // TODO: Find a way to not hard code this?
    image = UIImage.init(named: "Splash")
    
    // Observe for changes on fram and bounds to handle rotation resizing
    let parentView = self.bridge.viewController.view
    parentView?.addObserver(self, forKeyPath: "frame", options: .new, context: nil)
    parentView?.addObserver(self, forKeyPath: "bounds", options: .new, context: nil)
    
    self.updateSplashImageBounds()
  }
  
  // Update the bounds for the splash image. This will also be called when
  // the parent view observers fire
  func updateSplashImageBounds() {
    guard let delegate = UIApplication.shared.delegate else {
      bridge.modulePrint(self, "Unable to find root window object for SplashScreen bounds. Please file an issue")
      return
    }

    guard let window = delegate.window as? UIWindow else {
      bridge.modulePrint(self, "Unable to find root window object for SplashScreen bounds. Please file an issue")
      return
    }
    
    imageView.image = image
    imageView.frame = CGRect.init(origin: CGPoint.init(x: 0, y: 0), size: window.bounds.size)
    imageView.contentMode = .scaleAspectFill
  }
  
  public override func observeValue(forKeyPath keyPath: String?, of object: Any?, change: [NSKeyValueChangeKey : Any]?, context: UnsafeMutableRawPointer?) {
    updateSplashImageBounds()
  }
  
  func showSplash() {
    bridge.viewController.view.addSubview(imageView)
    
    bridge.viewController.view.isUserInteractionEnabled = false
    
    // TODO: Fade in
  }
  
  func hideSplash() {
    bridge.viewController.view.isUserInteractionEnabled = true

    imageView.removeFromSuperview()
    
    // TODO: Fade out
  }
}

