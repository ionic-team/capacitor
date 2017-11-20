import Foundation

public typealias DeviceInfo = [String:Any]

public class Device: Plugin {
  public init(_ avocado: Avocado) {
    super.init(avocado, id: "com.avocadojs.plugin.device")
  }
  
  @objc public func getInfo(_ call: PluginCall) {
    var isSimulator = false
    #if arch(i386) || arch(x86_64)
      isSimulator = true
    #endif
    
    call.successCallback(PluginResult(data: [
      "model": UIDevice.current.model,
      "osVersion": UIDevice.current.systemVersion,
      "platform": "ios",
      "manufacturer": "Apple",
      "uuid": UIDevice.current.identifierForVendor!.uuidString,
      "battery": UIDevice.current.batteryLevel,
      "isVirtual": isSimulator
    ]))
  }
}
