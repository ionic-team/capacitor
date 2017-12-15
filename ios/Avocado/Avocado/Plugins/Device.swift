import Foundation

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
  
  @objc func getMemoryUsage(_ call: AVCPluginCall) {
  }

}

