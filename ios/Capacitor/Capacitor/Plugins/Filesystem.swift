import Foundation


@objc(Filesystem)
public class Filesystem : CAPPlugin {
  let DEFAULT_DIRECTORY = "DOCUMENTS"
  
  // Get the SearchPathDirectory corresponding to the JS string
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
  
  
  /**
   * Read a file from the filesystem.
   */
  @objc func readFile(_ call: CAPPluginCall) {
    //let encoding = call.get("encoding") as? String ?? "utf8"
    // TODO: Allow them to switch encoding
    guard let file = call.get("path", String.self) else {
      handleError(call, "path must be provided and must be a string.")
      return
    }
      
    let directoryOption = call.get("directory", String.self, DEFAULT_DIRECTORY)!
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
  
  
  /**
   * Write a file to the filesystem.
   */
  @objc func writeFile(_ call: CAPPluginCall) {
    //let encoding = call.get("encoding") as? String ?? "utf8"
    // TODO: Allow them to switch encoding
    guard let file = call.get("path", String.self) else {
      handleError(call, "path must be provided and must be a string.")
      return
    }
    
    guard let data = call.get("data", String.self) else {
      handleError(call, "Data must be provided and must be a string.")
      return
    }
      
    let directoryOption = call.get("directory", String.self) ?? DEFAULT_DIRECTORY
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


  /**
   * Append to a file.
   */
  @objc func appendFile(_ call: CAPPluginCall) {
    //let encoding = call.get("encoding") as? String ?? "utf8"
    // TODO: Allow them to switch encoding
    guard let file = call.get("path", String.self) else {
      handleError(call, "path must be provided and must be a string.")
      return
    }
    
    guard let data = call.get("data", String.self) else {
      handleError(call, "Data must be provided and must be a string.")
      return
    }
    
    let directoryOption = call.get("directory", String.self) ?? DEFAULT_DIRECTORY
    let directory = getDirectory(directory: directoryOption)
    
    guard let dir = FileManager.default.urls(for: directory, in: .userDomainMask).first else {
      handleError(call, "Invalid device directory '\(directoryOption)'")
      return
    }
    
    let fileUrl = dir.appendingPathComponent(file)
    
    do {
      if FileManager.default.fileExists(atPath: fileUrl.path) {
        let fileHandle = try FileHandle.init(forWritingTo: fileUrl)
        
        guard let writeData = data.data(using: .utf8) else {
          handleError(call, "Unable to encode data to utf-8")
          return
        }
        
        defer {
          fileHandle.closeFile()
        }
        fileHandle.seekToEndOfFile()
        fileHandle.write(writeData)
      } else {
        try data.write(to: fileUrl, atomically: false, encoding: .utf8)
      }
      call.success()
    } catch let error as NSError {
      handleError(call, error.localizedDescription, error)
    }
  }
  
  /**
   * Append to a file.
   */
  @objc func deleteFile(_ call: CAPPluginCall) {
    //let encoding = call.get("encoding") as? String ?? "utf8"
    // TODO: Allow them to switch encoding
    guard let file = call.get("path", String.self) else {
      handleError(call, "path must be provided and must be a string.")
      return
    }
    
    let directoryOption = call.get("directory", String.self) ?? DEFAULT_DIRECTORY
    let directory = getDirectory(directory: directoryOption)
    
    guard let dir = FileManager.default.urls(for: directory, in: .userDomainMask).first else {
      handleError(call, "Invalid device directory '\(directoryOption)'")
      return
    }
    
    let fileUrl = dir.appendingPathComponent(file)
    
    do {
      
      if FileManager.default.fileExists(atPath: fileUrl.path) {
        try FileManager.default.removeItem(atPath: fileUrl.path)
      }
      call.success()
    } catch let error as NSError {
      handleError(call, error.localizedDescription, error)
    }
  }
  
  /**
   * Make a new directory, optionally creating parent folders first.
   */
  @objc func mkdir(_ call: CAPPluginCall) {
    guard let path = call.get("path", String.self) else {
      handleError(call, "path must be provided and must be a string.")
      return
    }
    
    let createIntermediateDirectories = call.get("createIntermediateDirectories", Bool.self, false)!
    let directoryOption = call.get("directory", String.self, DEFAULT_DIRECTORY)!
    let directory = getDirectory(directory: directoryOption)
    
    guard let dir = FileManager.default.urls(for: directory, in: .userDomainMask).first else {
      handleError(call, "Invalid device directory '\(directoryOption)'")
      return
    }
    
    let fileUrl = dir.appendingPathComponent(path)
    
    do {
      try FileManager.default.createDirectory(at: fileUrl, withIntermediateDirectories: createIntermediateDirectories, attributes: nil)
      call.success()
    } catch let error as NSError {
      handleError(call, error.localizedDescription, error)
    }
  }
  
  
  /**
   * Remove a directory.
   */
  @objc func rmdir(_ call: CAPPluginCall) {
    guard let path = call.get("path", String.self) else {
      handleError(call, "path must be provided and must be a string.")
      return
    }
    
    let directoryOption = call.get("directory", String.self, DEFAULT_DIRECTORY)!
    let directory = getDirectory(directory: directoryOption)
    
    guard let dir = FileManager.default.urls(for: directory, in: .userDomainMask).first else {
      handleError(call, "Invalid device directory '\(directoryOption)'")
      return
    }
    
    let fileUrl = dir.appendingPathComponent(path)
    
    do {
      try FileManager.default.removeItem(at: fileUrl)
      call.success()
    } catch let error as NSError {
      handleError(call, error.localizedDescription, error)
    }
  }
  
  
  /**
   * Read the contents of a directory.
   */
  @objc func readdir(_ call: CAPPluginCall) {
    guard let path = call.get("path", String.self) else {
      handleError(call, "path must be provided and must be a string.")
      return
    }
    
    let directoryOption = call.get("directory", String.self, DEFAULT_DIRECTORY)!
    let directory = getDirectory(directory: directoryOption)
    
    guard let dir = FileManager.default.urls(for: directory, in: .userDomainMask).first else {
      handleError(call, "Invalid device directory '\(directoryOption)'")
      return
    }
    
    let dirUrl = dir.appendingPathComponent(path)
    
    do {

      let directoryContents = try FileManager.default.contentsOfDirectory(at: dirUrl, includingPropertiesForKeys: nil, options: [])
      
      let directoryPathStrings = directoryContents.map {(url: URL) -> String in
        return url.path
      }
      
      call.success([
        "files": directoryPathStrings
      ])
    } catch {
      handleError(call, error.localizedDescription, error)
    }
  }
  
  @objc func stat(_ call: CAPPluginCall) {
    guard let path = call.get("path", String.self) else {
      handleError(call, "path must be provided and must be a string.")
      return
    }
    
    let directoryOption = call.get("directory", String.self, DEFAULT_DIRECTORY)!
    let directory = getDirectory(directory: directoryOption)
    
    guard let dir = FileManager.default.urls(for: directory, in: .userDomainMask).first else {
      handleError(call, "Invalid device directory '\(directoryOption)'")
      return
    }
    
    let pathUrl = dir.appendingPathComponent(path)
    
    do {
      let attr = try FileManager.default.attributesOfItem(atPath: pathUrl.path)
      call.success([
        "type": attr[.type] as! String,
        "size": attr[.size] as! UInt64,
        "ctime": (attr[.creationDate] as! Date).timeIntervalSince1970,
        "mtime": (attr[.modificationDate] as! Date).timeIntervalSince1970
      ])
    } catch {
      handleError(call, error.localizedDescription, error)
    }
  }

  // Helper function for handling errors
  func handleError(_ call: CAPPluginCall, _ message: String, _ error: Error? = nil) {
    call.error(message, error)
  }
}

