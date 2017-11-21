import Foundation

public class Filesystem : Plugin {
  let DEFAULT_DIRECTORY = "DOCUMENTS"
  
  public init(_ avocado: Avocado) {
    super.init(avocado, id: "com.avocadojs.plugin.fs")
  }
  
  func getDirectory(directory: String) -> FileManager.SearchPathDirectory {
    switch directory {
    case "DOCUMENTS":
      return .documentDirectory
    case "APPLICATION":
      return .applicationDirectory
    case "CACHE":
      return .cachesDirectory
    default:
      return .documentDirectory
    }
  }
  
  @objc public func readFile(_ call: PluginCall) {
    //let encoding = call.get("encoding") as? String ?? "utf8"
    // TODO: Allow them to switch encoding
    if let file = call.get("file") as? String {
      
      let directoryOption = call.get("directory") as? String ?? DEFAULT_DIRECTORY
      let directory = getDirectory(directory: directoryOption)
      
      if let dir = FileManager.default.urls(for: directory, in: .userDomainMask).first {
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
      
      let directoryOption = call.get("directory") as? String ?? DEFAULT_DIRECTORY
      let directory = getDirectory(directory: directoryOption)
      
      if let dir = FileManager.default.urls(for: directory, in: .userDomainMask).first {
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

