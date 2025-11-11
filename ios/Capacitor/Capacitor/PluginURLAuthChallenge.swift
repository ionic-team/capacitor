@objc public class PluginURLAuthChallenge: NSObject {
    public var disposition: URLSession.AuthChallengeDisposition = .performDefaultHandling
    public var credential: URLCredential?

    public init(disposition: URLSession.AuthChallengeDisposition, credential: URLCredential?) {
        self.disposition = disposition
        self.credential = credential
    }
}
