import Foundation
import AudioToolbox

// https://stackoverflow.com/questions/24263007/how-to-use-hex-color-values
extension UIColor {
    convenience init(r: Int, g: Int, b: Int, a: Int = 0xFF) {
        self.init(
            red: CGFloat(r) / 255.0,
            green: CGFloat(g) / 255.0,
            blue: CGFloat(b) / 255.0,
            alpha: CGFloat(a) / 255.0
        )
    }

    // let's suppose alpha is the first component (ARGB)
    convenience init(argb: UInt32) {
        self.init(
            red: CGFloat((argb >> 16) & 0xFF),
            green: CGFloat((argb >> 8) & 0xFF),
            blue: CGFloat(argb & 0xFF),
            alpha: CGFloat((argb >> 24) & 0xFF)
        )
    }

    // https://cocoacasts.com/from-hex-to-uicolor-and-back-in-swift
    convenience init?(hex: String) {
        let hexSanitized = hex.trimmingCharacters(in: .whitespacesAndNewlines).replacingOccurrences(of: "#", with: "")

        var argb: UInt32 = 0

        var r: CGFloat = 0.0
        var g: CGFloat = 0.0
        var b: CGFloat = 0.0
        var a: CGFloat = 1.0

        guard Scanner(string: hexSanitized).scanHexInt32(&argb) else { return nil }

        if ((hexSanitized.count) == 6) {
            r = CGFloat((argb & 0xFF0000) >> 16) / 255.0
            g = CGFloat((argb & 0x00FF00) >> 8) / 255.0
            b = CGFloat(argb & 0x0000FF) / 255.0

        } else if ((hexSanitized.count) == 8) {
            r = CGFloat((argb & 0xFF000000) >> 24) / 255.0
            g = CGFloat((argb & 0x00FF0000) >> 16) / 255.0
            b = CGFloat((argb & 0x0000FF00) >> 8) / 255.0
            a = CGFloat(argb & 0x000000FF) / 255.0

        } else {
            return nil
        }

        self.init(red: r, green: g, blue: b, alpha: a)
    }
}

@objc(CAPSplashScreenPlugin)
public class CAPSplashScreenPlugin : CAPPlugin {
  var imageView = UIImageView()
  var image: UIImage?
  var call: CAPPluginCall?
  var hideTask: Any?
  var isVisible: Bool = false

  let launchShowDuration = 3000
  let launchAutoHide = true

  let defaultFadeInDuration = 200
  let defaultFadeOutDuration = 200
  let defaultShowDuration = 3000
  let defaultAutoHide = true

  public override func load() {
    buildViews()
    showOnLaunch()
  }

  // Show the splash screen
  @objc public func show(_ call: CAPPluginCall) {
    self.call = call

    if image == nil {
      call.error("No image named \"Splash\" found. Please check your Assets.xcassets for a file named Splash")
      return
    }

    let showDuration = call.get("showDuration", Int.self, defaultShowDuration)!
    let fadeInDuration = call.get("fadeInDuration", Int.self, defaultFadeInDuration)!
    let fadeOutDuration = call.get("fadeOutDuration", Int.self, defaultFadeOutDuration)!
    let autoHide = call.get("autoHide", Bool.self, defaultAutoHide)!
    let backgroundColor = call.get("backgroundColor", String.self)

    showSplash(showDuration: showDuration, fadeInDuration: fadeInDuration, fadeOutDuration: fadeOutDuration, autoHide: autoHide, backgroundColor: backgroundColor, completion: {
      call.success()
    }, isLaunchSplash: false)
  }

  // Hide the splash screen
  @objc public func hide(_ call: CAPPluginCall) {
    self.call = call
    let fadeDuration = call.get("fadeOutDuration", Int.self, defaultFadeOutDuration)!
    hideSplash(fadeOutDuration: fadeDuration)
    call.success()
  }

  func buildViews() {
    // Find the image asset named "Splash"
    // TODO: Find a way to not hard code this?
    image = UIImage.init(named: "Splash")

    if image == nil {
      print("Unable to find splash screen image. Make sure an image called Splash exists in your assets")
    }

    // Observe for changes on fram and bounds to handle rotation resizing
    let parentView = self.bridge.viewController.view
    parentView?.addObserver(self, forKeyPath: "frame", options: .new, context: nil)
    parentView?.addObserver(self, forKeyPath: "bounds", options: .new, context: nil)

    self.updateSplashImageBounds()
  }

  func tearDown() {
    self.isVisible = false
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
    imageView.image = image
    imageView.frame = CGRect.init(origin: CGPoint.init(x: 0, y: 0), size: window.bounds.size)
    imageView.contentMode = .scaleAspectFill
  }

  public override func observeValue(forKeyPath keyPath: String?, of object: Any?, change: [NSKeyValueChangeKey : Any]?, context: UnsafeMutableRawPointer?) {
    updateSplashImageBounds()
  }

  func showOnLaunch() {
    self.bridge.viewController.view.addSubview(self.imageView)
    let launchShowDurationConfig = getConfigValue("launchShowDuration") as? Int ?? launchShowDuration
    let launchAutoHideConfig = getConfigValue("launchAutoHide") as? Bool ?? launchAutoHide
    let launchBackgroundColorConfig = getConfigValue("launchBackgroundColor") as? String ?? getConfigValue("backgroundColor") as? String ?? nil

    showSplash(showDuration: launchShowDurationConfig, fadeInDuration: 0, fadeOutDuration: defaultFadeOutDuration, autoHide: launchAutoHideConfig, backgroundColor: launchBackgroundColorConfig, completion: {
    }, isLaunchSplash: true)
  }

    func showSplash(showDuration: Int, fadeInDuration: Int, fadeOutDuration: Int, autoHide: Bool, backgroundColor: String?, completion: @escaping () -> Void, isLaunchSplash: Bool) {

    DispatchQueue.main.async {
      if (backgroundColor != nil) {
        self.imageView.backgroundColor = UIColor(hex: backgroundColor!)
      }

      if !isLaunchSplash {
        self.bridge.viewController.view.addSubview(self.imageView)
      }

      self.bridge.viewController.view.isUserInteractionEnabled = false

      UIView.transition(with: self.imageView, duration: TimeInterval(Double(fadeInDuration) / 1000), options: .curveLinear, animations: {
        self.imageView.alpha = 1
      }) { (finished: Bool) in
        self.isVisible = true

        if autoHide {
          self.hideTask = DispatchQueue.main.asyncAfter(deadline: DispatchTime.now() + (Double(showDuration) / 1000), execute: {
            self.hideSplash(fadeOutDuration: fadeOutDuration, isLaunchSplash: isLaunchSplash)
            completion()
          })
        }
      }
    }
  }

  func hideSplash(fadeOutDuration: Int) {
    self.hideSplash(fadeOutDuration: fadeOutDuration, isLaunchSplash: false);
  }

  func hideSplash(fadeOutDuration: Int, isLaunchSplash: Bool) {
    if(isLaunchSplash && isVisible) {
      print("SplashScreen.hideSplash: SplashScreen was automatically hidden after default timeout. " +
            "You should call `SplashScreen.hide()` as soon as your web app is loaded (or increase the timeout). " +
            "Read more at https://capacitor.ionicframework.com/docs/apis/splash-screen/#hiding-the-splash-screen");
    }
    if !isVisible { return }
    DispatchQueue.main.async {
      UIView.transition(with: self.imageView, duration: TimeInterval(Double(fadeOutDuration) / 1000), options: .curveLinear, animations: {
        self.imageView.alpha = 0
      }) { (finished: Bool) in
        self.tearDown()
      }
    }
  }
}
