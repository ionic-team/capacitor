import Foundation
import AudioToolbox

public class Haptics: Plugin {
  var selectionFeedbackGenerator: UISelectionFeedbackGenerator?
  
  public init(_ avocado: Avocado) {
    super.init(avocado, id: "com.avocadojs.plugin.haptics")
  }
  
  @objc public func impact(_ call: PluginCall) {
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
  
  @objc public func selectionStart(_ call: PluginCall) {
    selectionFeedbackGenerator = UISelectionFeedbackGenerator()
    selectionFeedbackGenerator?.prepare()
  }
  
  @objc public func selectionChanged(_ call: PluginCall) {
    if let generator = selectionFeedbackGenerator {
      generator.selectionChanged()
      generator.prepare()
    }
  }
  
  @objc public func selectionEnd(_ call: PluginCall) {
    selectionFeedbackGenerator = nil
  }
  
  @objc public func vibrate(_ call: PluginCall) {
    AudioServicesPlayAlertSound(kSystemSoundID_Vibrate)
  }
}
