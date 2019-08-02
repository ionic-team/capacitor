import Foundation


@objc(CAPFilesystemPlugin)
public class CAPFilesystemPlugin : CAPPlugin {
  let DEFAULT_DIRECTORY = "DOCUMENTS"
  
  /**
   * Get the SearchPathDirectory corresponding to the JS string
   */
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
   * Get the URL for this file, supporting file:// paths and
   * files with directory mappings.
   */
  func getFileUrl(_ path: String, _ directoryOption: String) -> URL? {
    if path.starts(with: "file://") {
      return URL(string: path)
    }
    
    let directory = getDirectory(directory: directoryOption)
    
    guard let dir = FileManager.default.urls(for: directory, in: .userDomainMask).first else {
      return nil
    }
    
    return dir.appendingPathComponent(path)
  }

  /**
   * Helper for handling errors
   */
  func handleError(_ call: CAPPluginCall, _ message: String, _ error: Error? = nil) {
    call.error(message, error)
  }
  
  /**
   * Read a file from the filesystem.
   */
  @objc func readFile(_ call: CAPPluginCall) {
    let encoding = call.getString("encoding")

    guard let file = call.get("path", String.self) else {
      handleError(call, "path must be provided and must be a string.")
      return
    }
    let directoryOption = call.get("directory", String.self, DEFAULT_DIRECTORY)!
    
    guard let fileUrl = getFileUrl(file, directoryOption) else {
      handleError(call, "Invalid path")
      return
    }

    do {
      if encoding != nil {
        let data = try String(contentsOf: fileUrl, encoding: .utf8)
        call.success([
          "data": data
        ])
      } else {
        let data = try Data(contentsOf: fileUrl)
        call.success([
          "data": data.base64EncodedString()
        ])
      }
    } catch let error as NSError {
      handleError(call, error.localizedDescription, error)
    }
  }

  /**
   * Write a file to the filesystem.
   */
  @objc func writeFile(_ call: CAPPluginCall) {
    let encoding = call.getString("encoding")
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

    guard let fileUrl = getFileUrl(file, directoryOption) else {
      handleError(call, "Invalid path")
      return
    }

    do {
      if encoding != nil {
        try data.write(to: fileUrl, atomically: false, encoding: .utf8)
      } else {
        let cleanData = getCleanData(data)
        if let base64Data = Data(base64Encoded: cleanData) {
          try base64Data.write(to: fileUrl)
        } else {
          handleError(call, "Unable to save file")
          return
        }
      }
      call.success()
    } catch let error as NSError {
      handleError(call, error.localizedDescription, error)
    }
  }

  /**
   * Append to a file.
   */
  @objc func appendFile(_ call: CAPPluginCall) {
    let encoding = call.getString("encoding")
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
    guard let fileUrl = getFileUrl(file, directoryOption) else {
      handleError(call, "Invalid path")
      return
    }

    do {
      if FileManager.default.fileExists(atPath: fileUrl.path) {
        let fileHandle = try FileHandle.init(forWritingTo: fileUrl)
        var writeData: Data? = nil
        if encoding != nil {
          guard let userData = data.data(using: .utf8) else {
            handleError(call, "Unable to encode data to utf-8")
            return
          }
          writeData = userData
        } else {
          let cleanData = getCleanData(data)
          if let base64Data = Data(base64Encoded: cleanData) {
            writeData = base64Data
          } else {
            handleError(call, "Unable to append file")
            return
          }
        }
        defer {
          fileHandle.closeFile()
        }
        fileHandle.seekToEndOfFile()
        fileHandle.write(writeData!)
        call.success()
      } else {
        self.writeFile(call)
      }
    } catch let error as NSError {
      handleError(call, error.localizedDescription, error)
    }
  }

  func getCleanData(_ data: String) -> String {
    let dataParts = data.split(separator: ",")
    var cleanData = data
    if dataParts.count > 0 {
      cleanData = String(dataParts.last!)
    }
    return cleanData
  }

  /**
   * Delete a file.
   */
  @objc func deleteFile(_ call: CAPPluginCall) {
    //let encoding = call.get("encoding") as? String ?? "utf8"
    // TODO: Allow them to switch encoding
    guard let file = call.get("path", String.self) else {
      handleError(call, "path must be provided and must be a string.")
      return
    }
    
    let directoryOption = call.get("directory", String.self) ?? DEFAULT_DIRECTORY
    guard let fileUrl = getFileUrl(file, directoryOption) else {
      handleError(call, "Invalid path")
      return
    }
    
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
    guard let fileUrl = getFileUrl(path, directoryOption) else {
      handleError(call, "Invalid path")
      return
    }
    
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
    guard let fileUrl = getFileUrl(path, directoryOption) else {
      handleError(call, "Invalid path")
      return
    }
    
    let recursiveOption = call.get("recursive", Bool.self, false)!
    
    do {
      let directoryContents = try FileManager.default.contentsOfDirectory(at: fileUrl, includingPropertiesForKeys: nil, options: [])
      if (directoryContents.count != 0 && !recursiveOption) {
        handleError(call, "Folder is not empty")
        return
      }
    } catch {
      handleError(call, error.localizedDescription, error)
    }
    
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
    guard let fileUrl = getFileUrl(path, directoryOption) else {
      handleError(call, "Invalid path")
      return
    }
    
    do {

      let directoryContents = try FileManager.default.contentsOfDirectory(at: fileUrl, includingPropertiesForKeys: nil, options: [])
      
      let directoryPathStrings = directoryContents.map {(url: URL) -> String in
        return url.lastPathComponent
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
    guard let fileUrl = getFileUrl(path, directoryOption) else {
      handleError(call, "Invalid path")
      return
    }
    
    do {
      let attr = try FileManager.default.attributesOfItem(atPath: fileUrl.path)
      call.success([
        "type": attr[.type] as! String,
        "size": attr[.size] as! UInt64,
        "ctime": (attr[.creationDate] as! Date).timeIntervalSince1970,
        "mtime": (attr[.modificationDate] as! Date).timeIntervalSince1970,
        "uri": fileUrl.absoluteString
      ])
    } catch {
      handleError(call, error.localizedDescription, error)
    }
  }
  
  @objc func getUri(_ call: CAPPluginCall) {
    guard let path = call.get("path", String.self) else {
      handleError(call, "path must be provided and must be a string.")
      return
    }
    
    let directoryOption = call.get("directory", String.self, DEFAULT_DIRECTORY)!
    guard let fileUrl = getFileUrl(path, directoryOption) else {
      handleError(call, "Invalid path")
      return
    }
    
    call.success([
      "uri": fileUrl.absoluteString
    ])
    
  }

  /**
   * Rename a file or directory.
   */
  @objc func rename(_ call: CAPPluginCall) {
    _copy(call: call, doRename: true);
  }
  
  /**
   * Copy a file or directory.
   */
  @objc func copy(_ call: CAPPluginCall) {
    _copy(call: call, doRename: false);
  }

  /**
   * Copy or rename a file or directory.
   */
  private func _copy(call: CAPPluginCall, doRename: Bool) {
    guard let from = call.get("from", String.self), let to = call.get("to", String.self) else {
      handleError(call, "Both to and from must be provided")
      return
    }
    
    let directoryOption = call.get("directory", String.self, DEFAULT_DIRECTORY)!
    var toDirectoryOption = call.get("toDirectory", String.self, "")!
    
    if (toDirectoryOption == "") {
      toDirectoryOption = directoryOption;
    }
    
    guard let fromUrl = getFileUrl(from, directoryOption) else {
      handleError(call, "Invalid from path")
      return
    }
    
    guard let toUrl = getFileUrl(to, toDirectoryOption) else {
      handleError(call, "Invalid to path")
      return
    }
    
    if (fromUrl == toUrl) {
      call.success()
      return
    }
    
    do {
      var isDir : ObjCBool = false
      if FileManager.default.fileExists(atPath: toUrl.path, isDirectory: &isDir) {
        if (!isDir.boolValue) {
          try? FileManager.default.removeItem(at: toUrl)
        }
      }
      
      if (doRename) {
        try FileManager.default.moveItem(at: fromUrl, to: toUrl)
      } else {
        try FileManager.default.copyItem(at: fromUrl, to: toUrl);
      }
      call.success()
    } catch let error as NSError {
      handleError(call, error.localizedDescription, error)
    }
  }
}

