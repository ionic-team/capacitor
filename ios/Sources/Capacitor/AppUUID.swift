import CommonCrypto
import Foundation

private func hexString(_ iterator: Array<UInt8>.Iterator) -> String {
    return iterator.map { String(format: "%02x", $0) }.joined()
}

extension Data {
    public var sha256: String {
        var digest = [UInt8](repeating: 0, count: Int(CC_SHA256_DIGEST_LENGTH))
        self.withUnsafeBytes { bytes in
            _ = CC_SHA256(bytes.baseAddress, CC_LONG(self.count), &digest)
        }
        return hexString(digest.makeIterator())
    }
}

public class AppUUID {
    private static let key: String = "CapacitorAppUUID"

    public static func getAppUUID() -> String {
        assertAppUUID()
        return readUUID()
    }

    public static func regenerateAppUUID() {
        let uuid = generateUUID()
        writeUUID(uuid)
    }

    private static func assertAppUUID() {
        let uuid = readUUID()
        if uuid == "" {
            regenerateAppUUID()
        }
    }

    private static func generateUUID() -> String {
        let uuid: String = UUID.init().uuidString
        return uuid.data(using: .utf8)!.sha256
    }

    private static func readUUID() -> String {
        KeyValueStore.standard[key] ?? ""
    }

    private static func writeUUID(_ uuid: String) {
        KeyValueStore.standard[key] = uuid
    }

}
