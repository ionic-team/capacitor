import Foundation

public typealias DeviceInfo = [String:Any]

@objc(CAPDevicePlugin)
public class CAPDevicePlugin: CAPPlugin {
  let diagnostics: Diagnostics = Diagnostics()

  @objc func getInfo(_ call: CAPPluginCall) {
    var isSimulator = false
    #if arch(i386) || arch(x86_64)
      isSimulator = true
    #endif

    let memUsed = diagnostics.getMemoryUsage()
    let diskFree = diagnostics.getFreeDiskSize() ?? 0
    let diskTotal = diagnostics.getTotalDiskSize() ?? 0

    call.success([
      "memUsed": memUsed,
      "diskFree": diskFree,
      "diskTotal": diskTotal,
      "name": UIDevice.current.name,
      "model": UIDevice.current.model,
      "operatingSystem": "ios",
      "osVersion": UIDevice.current.systemVersion,
      "appVersion": Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "",
      "appBuild": Bundle.main.infoDictionary?["CFBundleVersion"] as? String ?? "",
      "appId": Bundle.main.infoDictionary?["CFBundleIdentifier"] as? String ?? "",
      "appName": Bundle.main.infoDictionary?["CFBundleDisplayName"] as? String ?? "",
      "platform": "ios",
      "manufacturer": "Apple",
      "uuid": UIDevice.current.identifierForVendor!.uuidString,
      "isVirtual": isSimulator
    ])
  }

  @objc func getBatteryInfo(_ call: CAPPluginCall) {
    UIDevice.current.isBatteryMonitoringEnabled = true

    call.success([
      "batteryLevel": UIDevice.current.batteryLevel,
      "isCharging": UIDevice.current.batteryState == .charging || UIDevice.current.batteryState == .full
    ])

    UIDevice.current.isBatteryMonitoringEnabled = false
  }

  @objc func getLanguageCode(_ call: CAPPluginCall) {
    let code = String(Locale.preferredLanguages[0].prefix(2))
    call.success([
      "value": code
    ])
  }
  
  @objc func getAdvertisingIdentifier(_ call: CAPPluginCall) {
  }
  
  @objc func getMemoryUsage(_ call: CAPPluginCall) {
  }

}

