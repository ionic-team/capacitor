public class AVCFile {
  var url: URL
  
  public init(url: URL) {
    self.url = url
  }
}

@objc public class AVCFileManager: NSObject {
  static func get(path: String) -> AVCFile? {
    let handlers: [String:AVCFileResolver.Type] = [
      "file:///": AVCFileResolverFile.self,
      "res://": AVCFileResolverResource.self,
      "file://": AVCFileResolverFile.self,
      "base64:": AVCFileResolverFile.self
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
