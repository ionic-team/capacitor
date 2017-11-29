import Foundation
import AudioToolbox

@objc(SplashScreen)
public class SplashScreen : Plugin {
  var imageView = UIImageView()
  var image: UIImage?
  
  
  public override func load() {
    buildViews()
  }
  
  @objc public func show(_ call: PluginCall) {
    showSplash()
    call.success()
  }
  
  @objc public func hide(_ call: PluginCall) {
    hideSplash()
    call.success()
  }
  
  func buildViews() {
    guard let launchImage = Bundle.main.object(forInfoDictionaryKey: "UILaunchStoryboardName") as? String else {
      bridge.modulePrint(self, "No Launch Storyboard found. SplashScreen plugin requires it.")
      return
    }
    
    print("Building splash view")
    image = UIImage.init(named: "Splash")
    
    // TODO: Handle rotation for screens/ipad
    let parentView = self.bridge.viewController.view
    parentView?.addObserver(self, forKeyPath: "frame", options: .new, context: nil)
    parentView?.addObserver(self, forKeyPath: "bounds", options: .new, context: nil)
    
    self.updateSplashImageBounds()
  }
  
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
    print("Updating splash image bounds")
    updateSplashImageBounds()
  }
  
  func showSplash() {
    bridge.viewController.view.addSubview(imageView)
    
    bridge.viewController.view.isUserInteractionEnabled = false
  }
  
  func hideSplash() {
    bridge.viewController.view.isUserInteractionEnabled = true

    imageView.removeFromSuperview()
  }
}

