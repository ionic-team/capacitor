extension Data: CapacitorExtension {}
public extension CapacitorExtensionTypeWrapper where T == Data {

    static func data(base64EncodedOrDataUrl: String) -> Data? {
        if isBase64DataUrl(base64EncodedOrDataUrl) {
            if let url = URL(string: base64EncodedOrDataUrl) {
                do {
                    return try T(contentsOf: url)
                } catch {
                    return nil
                }
            }
            return nil
        } else {
            return T(base64Encoded: base64EncodedOrDataUrl)
        }
    }

    private static func isBase64DataUrl(_ base64EncodedOrDataUrl: String) -> Bool {
        return  base64EncodedOrDataUrl.starts(with: "data:") && base64EncodedOrDataUrl.contains("base64,")
    }
}
