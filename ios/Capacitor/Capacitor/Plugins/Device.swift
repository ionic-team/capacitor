import Foundation

public typealias DeviceInfo = [String:Any]

@objc(Device)
public class Device: CAPPlugin {
  let diagnostics: Diagnostics = Diagnostics()
  
  @objc func getInfo(_ call: CAPPluginCall) {
    print("Getting info")
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
      "model": UIDevice.current.model,
      "osVersion": UIDevice.current.systemVersion,
      "appVersion": Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "",
      "platform": "ios",
      "manufacturer": "Apple",
      "uuid": UIDevice.current.identifierForVendor!.uuidString,
      "battery": UIDevice.current.batteryLevel,
      "isVirtual": isSimulator
    ])
  }
  
  
  @objc func getAdvertisingIdentifier(_ call: CAPPluginCall) {

  }
  
  @objc func getMemoryUsage(_ call: CAPPluginCall) {
  }

}

