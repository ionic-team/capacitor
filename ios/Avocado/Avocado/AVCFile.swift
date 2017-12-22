public class AVCFile {
  var url: URL
  
  public init(url: URL) {
    self.url = url
  }
}

/**
 * AVCFileManager helps map file schemes to physical files, whether they are on
 * disk, in a bundle, or in another location.
 */
@objc public class AVCFileManager: NSObject {
  static func get(path: String) -> AVCFile? {
    let handlers: [String:AVCFileResolver.Type] = [
      "res://": AVCFileResolverResource.self,
      "file://": AVCFileResolverFile.self,
      "base64:": AVCFileResolverNotImplemented.self
    ]

    for (handlerPrefix, handler) in handlers {
      if path.hasPrefix(handlerPrefix) {
        return handler.resolve(path: path)
      }
    }
    
    return nil
  }
}

private protocol AVCFileResolver {
  static func resolve(path: String) -> AVCFile?
}

private class AVCFileResolverFile: AVCFileResolver {
  public static func resolve(path: String) -> AVCFile? {
    let manager = FileManager.default
    let absPath = path.replacingOccurrences(of: "file:///", with: "")
    if !manager.fileExists(atPath: absPath) {
      return nil
    }
    return AVCFile(url: URL(fileURLWithPath: absPath))
  }
  
}

private class AVCFileResolverResource: AVCFileResolver {
  public static func resolve(path: String) -> AVCFile? {
    let manager = FileManager.default
    let bundle = Bundle.main
    let resourcePath = bundle.resourcePath
    
    var absPath = path.replacingOccurrences(of: "res://", with: "")
    absPath = resourcePath! + "/" + absPath
    if !manager.fileExists(atPath: absPath) {
      return nil
    }
    return AVCFile(url: URL(fileURLWithPath: absPath))
  }
}

private class AVCFileResolverNotImplemented: AVCFileResolver {
  public static func resolve(path: String) -> AVCFile? {
    return nil
  }
}
