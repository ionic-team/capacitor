//
//  Vibration.swift
//  Avocado
//
//  Created by Max Lynch on 11/19/17.
//  Copyright © 2017 Drifty Co. All rights reserved.
//

import Foundation

public class Haptics: Plugin {
  public init(_ avocado: Avocado) {
    super.init(avocado: avocado, id: "com.avocadojs.plugin.vibration")
  }
  
  @objc public func impact(_ call: PluginCall) {
    let generator = UIImpactFeedbackGenerator(style: .heavy)
    generator.impactOccurred()
  }
}
