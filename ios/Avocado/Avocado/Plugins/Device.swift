import Foundation
import AdSupport

public typealias DeviceInfo = [String:Any]

@objc(Device)
public class Device: AVCPlugin {
  let diagnostics: Diagnostics = Diagnostics()
  
  @objc func getInfo(_ call: AVCPluginCall) {
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
      "platform": "ios",
      "manufacturer": "Apple",
      "uuid": UIDevice.current.identifierForVendor!.uuidString,
      "battery": UIDevice.current.batteryLevel,
      "isVirtual": isSimulator
    ])
  }
  
  @objc func getAdvertisingIdentifier(_ call: AVCPluginCall) {
    guard ASIdentifierManager.shared().isAdvertisingTrackingEnabled else {
      call.error("User has disabled ad tracking")
      return
    }
    
    call.success([
      "id": ASIdentifierManager.shared().advertisingIdentifier.uuidString
    ])
  }
  
  @objc func getMemoryUsage(_ call: AVCPluginCall) {
  }

}

