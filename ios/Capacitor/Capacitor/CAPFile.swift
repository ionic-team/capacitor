/**
 * CAPFileManager helps map file schemes to physical files, whether they are on
 * disk, in a bundle, or in another location.
 */
@objc public class CAPFileManager: NSObject {
    public static func get(path: String) -> URL? {
        let handlers: [String: CAPFileResolver.Type] = [
            "res://": CAPFileResolverResource.self,
            "file://": CAPFileResolverFile.self,
            "base64:": CAPFileResolverNotImplemented.self
        ]

        for (handlerPrefix, handler) in handlers {
            if path.hasPrefix(handlerPrefix) {
                return handler.resolve(path: path)
            }
        }

        return nil
    }

    public static func getPortablePath(host: String, uri: URL?) -> String? {
        if let uri = uri {
            let uriWithoutFile = uri.absoluteString.replacingOccurrences(of: "file://", with: "")
            return host + CapacitorBridge.fileStartIdentifier + uriWithoutFile
        }
        return nil
    }
}

private protocol CAPFileResolver {
    static func resolve(path: String) -> URL?
}

private class CAPFileResolverFile: CAPFileResolver {
    static func resolve(path: String) -> URL? {
        let manager = FileManager.default
        let absPath = path.replacingOccurrences(of: "file:///", with: "")
        if !manager.fileExists(atPath: absPath) {
            return nil
        }
        return URL(fileURLWithPath: absPath)
    }

}

private class CAPFileResolverResource: CAPFileResolver {
    static func resolve(path: String) -> URL? {
        let manager = FileManager.default
        let bundle = Bundle.main
        let resourcePath = bundle.resourcePath

        var absPath = path.replacingOccurrences(of: "res://", with: "")
        absPath = resourcePath! + "/" + absPath
        if !manager.fileExists(atPath: absPath) {
            return nil
        }
        return URL(fileURLWithPath: absPath)
    }
}

private class CAPFileResolverNotImplemented: CAPFileResolver {
    static func resolve(path: String) -> URL? {
        return nil
    }
}
