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
    
    UIDevice.current.isBatteryMonitoringEnabled = true
    
    let memUsed = diagnostics.getMemoryUsage()
    let diskFree = diagnostics.getFreeDiskSize() ?? 0
    let diskTotal = diagnostics.getTotalDiskSize() ?? 0
    
    call.success([
      "memUsed": memUsed,
      "diskFree": diskFree,
      "diskTotal": diskTotal,
      "model": UIDevice.current.model,
      "osVersion": UIDevice.current.systemVersion,
      "appVersion": Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "",
      "platform": "ios",
      "manufacturer": "Apple",
      "uuid": UIDevice.current.identifierForVendor!.uuidString,
      "batteryLevel": UIDevice.current.batteryLevel,
      "isCharging": UIDevice.current.batteryState == .charging || UIDevice.current.batteryState == .full,
      "isVirtual": isSimulator
    ])
    
    UIDevice.current.isBatteryMonitoringEnabled = false
  }
  
  
  @objc func getAdvertisingIdentifier(_ call: CAPPluginCall) {

  }
  
  @objc func getMemoryUsage(_ call: CAPPluginCall) {
  }

}

