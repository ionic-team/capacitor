//
//  Device.swift
//  avocado-ios
//
//  Copyright © 2017 Drifty Co. All rights reserved.
//

import Foundation

public typealias DeviceInfo = [String:Any]

public class Device: Plugin {
  public init() {
    super.init(name: "Device")
  }
  
  func getInfo() -> DeviceInfo {
    return [
      "model": UIDevice.current.model,
      "osVersion": UIDevice.current.systemVersion,
      "platform": "ios",
      "manufacturer": "Apple",
      "uuid": UIDevice.current.identifierForVendor!.uuidString,
      "battery": UIDevice.current.batteryLevel
    ]
  }
}
