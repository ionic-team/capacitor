//
//  Vibration.swift
//  Avocado
//
//  Created by Max Lynch on 11/19/17.
//  Copyright © 2017 Drifty Co. All rights reserved.
//

import Foundation
import AudioToolbox

public class Haptics: Plugin {
  public init(_ avocado: Avocado) {
    super.init(avocado: avocado, id: "com.avocadojs.plugin.haptics")
  }
  
  @objc public func impact(_ call: PluginCall) {
    if let style = call.options["style"] as? String {
      print("Style", style)
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
  
  @objc public func vibrate(_ call: PluginCall) {
    AudioServicesPlayAlertSound(kSystemSoundID_Vibrate)
  }
}
