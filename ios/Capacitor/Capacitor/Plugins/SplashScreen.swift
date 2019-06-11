import AudioToolbox
import Foundation

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

    if hexSanitized.count == 6 {
      r = CGFloat((argb & 0xFF0000) >> 16) / 255.0
      g = CGFloat((argb & 0x00FF00) >> 8) / 255.0
      b = CGFloat(argb & 0x0000FF) / 255.0

    } else if hexSanitized.count == 8 {
      r = CGFloat((argb & 0xFF00_0000) >> 24) / 255.0
      g = CGFloat((argb & 0x00FF_0000) >> 16) / 255.0
      b = CGFloat((argb & 0x0000_FF00) >> 8) / 255.0
      a = CGFloat(argb & 0x0000_00FF) / 255.0

    } else {
      return nil
    }

    self.init(red: r, green: g, blue: b, alpha: a)
  }
}

@objc(CAPSplashScreenPlugin)
public class CAPSplashScreenPlugin: CAPPlugin {
  var imageView = UIImageView()
  var image: UIImage?
  var spinner = UIActivityIndicatorView()
  var showSpinner: Bool = true
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
    let spinnerStyle = call.get("spinnerStyle", String.self)
    let spinnerColor = call.get("spinnerColor", String.self)
    showSpinner = call.get("showSpinner", Bool.self, false)!

    showSplash(showDuration: showDuration, fadeInDuration: fadeInDuration, fadeOutDuration: fadeOutDuration, autoHide: autoHide, spinnerStyle: spinnerStyle, spinnerColor: spinnerColor, completion: {
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
    image = UIImage(named: "Splash")

    if image == nil {
      print("Unable to find splash screen image. Make sure an image called Splash exists in your assets")
    }

    // Observe for changes on frame and bounds to handle rotation resizing
    let parentView = bridge.viewController.view
    parentView?.addObserver(self, forKeyPath: "frame", options: .new, context: nil)
    parentView?.addObserver(self, forKeyPath: "bounds", options: .new, context: nil)

    updateSplashImageBounds()

    if showSpinner {
      spinner.translatesAutoresizingMaskIntoConstraints = false
      spinner.startAnimating()
    }
  }

  func tearDown() {
    isVisible = false
    bridge.viewController.view.isUserInteractionEnabled = true
    imageView.removeFromSuperview()

    if showSpinner {
      spinner.removeFromSuperview()
    }
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
    imageView.frame = CGRect(origin: CGPoint(x: 0, y: 0), size: window.bounds.size)
    imageView.contentMode = .scaleAspectFill
  }

  public override func observeValue(forKeyPath keyPath: String?, of object: Any?, change _: [NSKeyValueChangeKey: Any]?, context: UnsafeMutableRawPointer?) {
    updateSplashImageBounds()
  }

  func showOnLaunch() {
    let launchShowDurationConfig = getConfigValue("launchShowDuration") as? Int ?? getConfigValue("showDuration") as? Int ?? launchShowDuration
    let launchAutoHideConfig = getConfigValue("launchAutoHide") as? Bool ?? getConfigValue("autoHide") as? Bool ?? launchAutoHide
    let launchSpinnerStyleConfig = getConfigValue("launchSpinnerStyle") as? String ?? getConfigValue("spinnerStyle") as? String ?? nil
    let launchSpinnerColorConfig = getConfigValue("launchSpinnerColor") as? String ?? getConfigValue("spinnerColor") as? String ?? nil
    showSpinner = getConfigValue("launchShowSpinner") as? Bool ?? getConfigValue("showSpinner") as? Bool ?? false

    let view = bridge.viewController.view
    view?.addSubview(imageView)

    if showSpinner {
      view?.addSubview(spinner)
      spinner.centerXAnchor.constraint(equalTo: view!.centerXAnchor).isActive = true
      spinner.centerYAnchor.constraint(equalTo: view!.centerYAnchor).isActive = true
    }

    showSplash(showDuration: launchShowDurationConfig, fadeInDuration: 0, fadeOutDuration: defaultFadeOutDuration, autoHide: launchAutoHideConfig, spinnerStyle: launchSpinnerStyleConfig, spinnerColor: launchSpinnerColorConfig, completion: {}, isLaunchSplash: true)
  }

  func showSplash(showDuration: Int, fadeInDuration: Int, fadeOutDuration: Int, autoHide: Bool, spinnerStyle: String?, spinnerColor: String?, completion: @escaping () -> Void, isLaunchSplash: Bool) {
    DispatchQueue.main.async {
      let view = self.bridge.viewController.view

      if self.showSpinner {
        if spinnerStyle != nil {
          if #available(iOS 13.0, *) {
            switch spinnerStyle {
            case "large":
              self.spinner.style = .large
            case "medium":
              self.spinner.style = .medium
            default:
              self.spinner.style = .medium
            }
          } else {
            switch spinnerStyle {
            case "whiteLarge":
              self.spinner.style = .whiteLarge
            case "white":
              self.spinner.style = .white
            case "gray":
              self.spinner.style = .gray
            default:
              self.spinner.style = .gray
            }
          }
        }

        if spinnerColor != nil {
          self.spinner.color = UIColor(hex: spinnerColor!)
        }
      }

      if !isLaunchSplash {
        view?.addSubview(self.imageView)

        if self.showSpinner {
          view?.addSubview(self.spinner)
          self.spinner.centerXAnchor.constraint(equalTo: view!.centerXAnchor).isActive = true
          self.spinner.centerYAnchor.constraint(equalTo: view!.centerYAnchor).isActive = true
        }
      }

      view?.isUserInteractionEnabled = false

      UIView.transition(with: self.imageView, duration: TimeInterval(Double(fadeInDuration) / 1000), options: .curveLinear, animations: {
        self.imageView.alpha = 1

        if self.showSpinner {
          self.spinner.alpha = 1
        }
      }) { (finished: Bool) in
        self.isVisible = true

        if autoHide {
          self.hideTask = DispatchQueue.main.asyncAfter(deadline: DispatchTime.now() + (Double(showDuration) / 1000)) {
            self.hideSplash(fadeOutDuration: fadeOutDuration, isLaunchSplash: isLaunchSplash)
            completion()
          }
        }
      }
    }
  }

  func hideSplash(fadeOutDuration: Int) {
    hideSplash(fadeOutDuration: fadeOutDuration, isLaunchSplash: false)
  }

  func hideSplash(fadeOutDuration: Int, isLaunchSplash: Bool) {
    if isLaunchSplash, isVisible {
      print("SplashScreen.hideSplash: SplashScreen was automatically hidden after default timeout. " +
        "You should call `SplashScreen.hide()` as soon as your web app is loaded (or increase the timeout). " +
        "Read more at https://capacitor.ionicframework.com/docs/apis/splash-screen/#hiding-the-splash-screen")
    }
    if !isVisible { return }
    DispatchQueue.main.async {
      UIView.transition(with: self.imageView, duration: TimeInterval(Double(fadeOutDuration) / 1000), options: .curveLinear, animations: {
        self.imageView.alpha = 0

        if self.showSpinner {
          self.spinner.alpha = 0
        }
      }) { (finished: Bool) in
        self.tearDown()
      }
    }
  }
}