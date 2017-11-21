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
  
  @objc func readFile(_ call: PluginCall) {
    //let encoding = call.get("encoding") as? String ?? "utf8"
    // TODO: Allow them to switch encoding
    guard let file = call.get("file") as? String else {
      handleError(call, "File must be provided and must be a string.")
      return
    }
      
    let directoryOption = call.get("directory") as? String ?? DEFAULT_DIRECTORY
    let directory = getDirectory(directory: directoryOption)

    guard let dir = FileManager.default.urls(for: directory, in: .userDomainMask).first else {
      handleError(call, "Invalid device directory '\(directoryOption)'")
      return
    }

    let fileUrl = dir.appendingPathComponent(file)
    do {
      let data = try String(contentsOf: fileUrl, encoding: .utf8)
      call.success([
        "data": data
      ])
    } catch let error as NSError {
      handleError(call, error.localizedDescription, error)
    }
  }
  
  @objc func writeFile(_ call: PluginCall) {
    //let encoding = call.get("encoding") as? String ?? "utf8"
    // TODO: Allow them to switch encoding
    guard let file = call.get("file") as? String else {
      handleError(call, "File must be provided and must be a string.")
      return
    }
    
    guard let data = call.get("data") as? String else {
      handleError(call, "Data must be provided and must be a string.")
      return
    }
      
    let directoryOption = call.get("directory") as? String ?? DEFAULT_DIRECTORY
    let directory = getDirectory(directory: directoryOption)
    
    guard let dir = FileManager.default.urls(for: directory, in: .userDomainMask).first else {
      handleError(call, "Invalid device directory '\(directoryOption)'")
      return
    }
    
    let fileUrl = dir.appendingPathComponent(file)
    do {
      try data.write(to: fileUrl, atomically: false, encoding: .utf8)
      call.success()
    } catch let error as NSError {
      handleError(call, error.localizedDescription, error)
    }
  }
  
  @objc func mkdir(_ call: PluginCall) {
    guard let path = call.get("path") as? String else {
      handleError(call, "Path must be provided and must be a string.")
      return
    }
    
    let intermediateDirectories = call.get("intermediateDirectories") as? Bool ?? false
    let directoryOption = call.get("directory") as? String ?? DEFAULT_DIRECTORY
    let directory = getDirectory(directory: directoryOption)
    
    guard let dir = FileManager.default.urls(for: directory, in: .userDomainMask).first else {
      handleError(call, "Invalid device directory '\(directoryOption)'")
      return
    }
    
    let fileUrl = dir.appendingPathComponent(path)
    
    do {
      try FileManager.default.createDirectory(at: fileUrl, withIntermediateDirectories: intermediateDirectories, attributes: nil)
      call.success()
    } catch let error as NSError {
      handleError(call, error.localizedDescription, error)
    }
  }
  
  func handleError(_ call: PluginCall, _ message: String, _ error: Error? = nil) {
    call.error(message, error)
  }
}

