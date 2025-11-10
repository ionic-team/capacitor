@objc public class PluginURLAuthChallenge: NSObject {
    public var response: URLSession.AuthChallengeDisposition = .performDefaultHandling
    public var credential: URLCredential?
    
    public init(disposition: URLSession.AuthChallengeDisposition, credential: URLCredential?) {
        self.response = disposition
        self.credential = credential
    }
}
