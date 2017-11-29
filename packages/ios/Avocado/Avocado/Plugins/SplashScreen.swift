import Foundation
import AudioToolbox

@objc(SplashScreen)
public class SplashScreen : Plugin {
  var imageView = UIImageView()
  
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
    
    guard let delegate = UIApplication.shared.delegate else {
      bridge.modulePrint(self, "Unable to find root window object for SplashScreen bounds. Please file an issue")
      return
    }
    
    guard let window = delegate.window as? UIWindow else {
      bridge.modulePrint(self, "Unable to find root window object for SplashScreen bounds. Please file an issue")
      return
    }
    
    print("Building splash view")
    let image = UIImage.init(named: "Splash")
    
    //imageView.alpha = 0
    imageView.image = image
    imageView.frame = CGRect.init(origin: CGPoint.init(x: 0, y: 0), size: window.bounds.size)
    imageView.backgroundColor = UIColor.red
    print("Image frame", imageView.frame)
    imageView.contentMode = .scaleAspectFill
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

