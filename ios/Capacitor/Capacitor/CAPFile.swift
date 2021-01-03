/**
 * CAPFileManager helps map file schemes to physical files, whether they are on
 * disk, in a bundle, or in another location.
 */
@objc public class CAPFileManager: NSObject {
    @available(*, deprecated, message: "Use portablePath(fromLocalURL:) on the Bridge")
    public static func getPortablePath(host: String, uri: URL?) -> String? {
        if let uri = uri {
            let uriWithoutFile = uri.absoluteString.replacingOccurrences(of: "file://", with: "")
            return host + CapacitorBridge.fileStartIdentifier + uriWithoutFile
        }
        return nil
    }
}
