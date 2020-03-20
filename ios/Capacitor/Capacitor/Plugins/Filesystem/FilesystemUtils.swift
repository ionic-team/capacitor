import Foundation
import MobileCoreServices

enum FilesystemError: Error {
  case fileNotFound(String)
  case invalidPath(String)
  case parentFolderNotExists(String)
  case saveError(String)
}

class FilesystemUtils {
  /**
   * Get the SearchPathDirectory corresponding to the JS string
   */
  static func getDirectory(directory: String) -> FileManager.SearchPathDirectory {
    switch directory {
    case "DOCUMENTS":
      return .documentDirectory
    case "APPLICATION":
      return .applicationDirectory
    case "CACHE":
      return .cachesDirectory
    case "DOWNLOADS":
      return .downloadsDirectory
    default:
      return .documentDirectory
    }
  }

  /**
   * Get the URL for this file, supporting file:// paths and
   * files with directory mappings.
   */
  static func getFileUrl(_ path: String, _ directoryOption: String) -> URL? {
    if path.starts(with: "file://") {
      return URL(string: path)
    }
    
    let directory = FilesystemUtils.getDirectory(directory: directoryOption)
    
    guard let dir = FileManager.default.urls(for: directory, in: .userDomainMask).first else {
      return nil
    }
    
    return dir.appendingPathComponent(path)
  }

  static func createDirectoryForFile(_ fileUrl: URL, _ recursive: Bool) throws {
    if !FileManager.default.fileExists(atPath: fileUrl.deletingLastPathComponent().absoluteString) {
      if recursive {
        try FileManager.default.createDirectory(at: fileUrl.deletingLastPathComponent(), withIntermediateDirectories: recursive, attributes: nil)
      } else {
        throw FilesystemError.parentFolderNotExists("Parent folder doesn't exist")
      }
    }
  }
  
  /**
   * Read a file as a string at the given directory and with the given encoding
   */
  static func readFileString(_ path: String, _ directory: String, _ encoding: String?) throws -> String {
    guard let fileUrl = FilesystemUtils.getFileUrl(path, directory) else {
      throw FilesystemError.fileNotFound("No such file exists")
    }
    if encoding != nil {
      let data = try String(contentsOf: fileUrl, encoding: .utf8)
      return data
    } else {
      let data = try Data(contentsOf: fileUrl)
      return data.base64EncodedString()
    }
  }
  
  static func writeFileString(_ path: String, _ directory: String, _ encoding: String?, _ data: String, _ recursive: Bool = false) throws -> URL {
    
    guard let fileUrl = FilesystemUtils.getFileUrl(path, directory) else {
      throw FilesystemError.invalidPath("Invlid path")
    }
    
    if !FileManager.default.fileExists(atPath: fileUrl.deletingLastPathComponent().absoluteString) {
      if recursive {
        try FileManager.default.createDirectory(at: fileUrl.deletingLastPathComponent(), withIntermediateDirectories: recursive, attributes: nil)
      } else {
        throw FilesystemError.parentFolderNotExists("Parent folder doesn't exist")
      }
    }
    
    if encoding != nil {
      try data.write(to: fileUrl, atomically: false, encoding: .utf8)
    } else {
      let cleanData = getCleanBase64Data(data)
      if let base64Data = Data(base64Encoded: cleanData) {
        try base64Data.write(to: fileUrl)
      } else {
        throw FilesystemError.saveError("Unable to save file")
      }
    }
    
    return fileUrl
  }
  
  
  static func getCleanBase64Data(_ data: String) -> String {
    let dataParts = data.split(separator: ",")
    var cleanData = data
    if dataParts.count > 0 {
      cleanData = String(dataParts.last!)
    }
    return cleanData
  }
  
  static func mimeTypeForPath(path: String) -> String {
    let url = NSURL(fileURLWithPath: path)
    let pathExtension = url.pathExtension
    if let uti = UTTypeCreatePreferredIdentifierForTag(kUTTagClassFilenameExtension, pathExtension! as NSString, nil)?.takeRetainedValue() {
      if let mimetype = UTTypeCopyPreferredTagWithClass(uti, kUTTagClassMIMEType)?.takeRetainedValue() {
        return mimetype as String
      }
    }
    return "application/octet-stream"
  }
}
