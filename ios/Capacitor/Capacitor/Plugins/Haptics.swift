import Foundation
import AudioToolbox

@objc(CAPHapticsPlugin)
public class CAPHapticsPlugin: CAPPlugin {
  var selectionFeedbackGenerator: UISelectionFeedbackGenerator?
  
  @objc public func impact(_ call: CAPPluginCall) {
    DispatchQueue.main.async {
      if let style = call.options["style"] as? String {
        var impactStyle = UIImpactFeedbackStyle.heavy
        if style == "MEDIUM" {
          impactStyle = UIImpactFeedbackStyle.medium
        } else if style == "LIGHT" {
          impactStyle = UIImpactFeedbackStyle.light
        }
        
        let generator = UIImpactFeedbackGenerator(style: impactStyle)
        generator.impactOccurred()
      } else {
        let generator = UIImpactFeedbackGenerator(style: .heavy)
        generator.impactOccurred()
      }
    }
  }
  
  @objc public func selectionStart(_ call: CAPPluginCall) {
    DispatchQueue.main.async {
      self.selectionFeedbackGenerator = UISelectionFeedbackGenerator()
      self.selectionFeedbackGenerator?.prepare()
    }
  }
  
  @objc public func selectionChanged(_ call: CAPPluginCall) {
    DispatchQueue.main.async {
      if let generator = self.selectionFeedbackGenerator {
        generator.selectionChanged()
        generator.prepare()
      }
    }
  }
  
  @objc public func selectionEnd(_ call: CAPPluginCall) {
    selectionFeedbackGenerator = nil
  }
  
  @objc public func vibrate(_ call: CAPPluginCall) {
    DispatchQueue.main.async {
      AudioServicesPlayAlertSound(kSystemSoundID_Vibrate)
    }
  }
}
