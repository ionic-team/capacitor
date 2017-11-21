import Foundation

public class Filesystem : Plugin {
  public init(_ avocado: Avocado) {
    super.init(avocado, id: "com.avocadojs.plugin.fs")
  }
  
  
  @objc public func readFile(_ call: PluginCall) {
    //let encoding = call.get("encoding") as? String ?? "utf8"
    // TODO: Allow them to switch encoding
    if let file = call.get("file") as? String {
      if let dir = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first {
        let fileUrl = dir.appendingPathComponent(file)
        do {
          let data = try String(contentsOf: fileUrl, encoding: .utf8)
          call.successCallback(PluginResult([
            "data": data
          ]))
        } catch let error as NSError {
          call.errorCallback(PluginCallError(message: error.localizedDescription, error: error, data: [:]))
        }
      }
    }
  }
  
  @objc public func writeFile(_ call: PluginCall) {
    //let encoding = call.get("encoding") as? String ?? "utf8"
    // TODO: Allow them to switch encoding
    if let file = call.get("file") as? String, let data = call.get("data") as? String {
      if let dir = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first {
        let fileUrl = dir.appendingPathComponent(file)
        do {
          try data.write(to: fileUrl, atomically: false, encoding: .utf8)
          call.successCallback(PluginResult())
        } catch let error as NSError {
          call.errorCallback(PluginCallError(message: error.localizedDescription, error: error, data: [:]))
        }
      }
    }
  }
}

