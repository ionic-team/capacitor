import Foundation
import AudioToolbox

@objc(SplashScreen)
public class SplashScreen : Plugin {
  var imageView = UIImageView()
  var image: UIImage?
  var call: PluginCall?
  
  let defaultDuration = 200
  
  public override func load() {
    buildViews()
  }
  
  // Show the splash screen
  @objc public func show(_ call: PluginCall) {
    self.call = call
    showSplash()
    call.success()
  }
  
  // Hide the splash screen
  @objc public func hide(_ call: PluginCall) {
    self.call = call
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
  
  func tearDown() {
    bridge.viewController.view.isUserInteractionEnabled = true
    self.imageView.removeFromSuperview()
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
    
    imageView.alpha = 0
    imageView.image = image
    imageView.frame = CGRect.init(origin: CGPoint.init(x: 0, y: 0), size: window.bounds.size)
    imageView.contentMode = .scaleAspectFill
  }
  
  public override func observeValue(forKeyPath keyPath: String?, of object: Any?, change: [NSKeyValueChangeKey : Any]?, context: UnsafeMutableRawPointer?) {
    updateSplashImageBounds()
  }
  
  func showSplash() {
    guard let call = self.call else {
      return
    }
    
    bridge.viewController.view.addSubview(imageView)
    
    bridge.viewController.view.isUserInteractionEnabled = false
    
    let duration = call.get("duration", Int.self, defaultDuration)!
    
    // TODO: Fade in
    UIView.transition(with: imageView, duration: TimeInterval(Double(duration) / 1000), options: .curveLinear, animations: {
      self.imageView.alpha = 1
    }) { (finished: Bool) in
      
    }
  }
  
  func hideSplash() {
    guard let call = self.call else {
      return
    }
    
    let duration = call.get("duration", Int.self, defaultDuration)!
    UIView.transition(with: imageView, duration: TimeInterval(Double(duration) / 1000), options: .curveLinear, animations: {
      self.imageView.alpha = 0
    }) { (finished: Bool) in
      self.tearDown()
    }
  }
}

