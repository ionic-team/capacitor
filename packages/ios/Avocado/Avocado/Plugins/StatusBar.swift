//
//  StatusBar.swift
//  Avocado
//
//  Created by Max Lynch on 11/19/17.
//  Copyright © 2017 Drifty Co. All rights reserved.
//

import Foundation

public class StatusBar: Plugin {
  public init(_ avocado: Avocado) {
    super.init(avocado: avocado, id: "com.avocadojs.plugin.statusbar")
  }
  
  @objc public func setStyle(_ call: PluginCall) {
    let options = call.options

    if let style = options["style"] as? String {
      if style == "DARK" {
        UIApplication.shared.statusBarStyle = .lightContent
      } else if style == "LIGHT" {
        UIApplication.shared.statusBarStyle = .default
      }
    }
    
    call.successCallback(PluginResult(data: [:]))
  }
}
