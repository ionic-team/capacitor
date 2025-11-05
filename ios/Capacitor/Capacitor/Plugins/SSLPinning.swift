import Foundation

@objc(CAPSSLPinningPlugin)
public class CAPSSLPinningPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "CAPSSLPinningPlugin"
    public let jsName = "SSLPinning"
    public let pluginMethods: [CAPPluginMethod] = []
    
    struct CertListEntry {
        let fileName: String
        let extensionOfFile: String
    }
    
    var enabled: Bool = false
    var excludedDomains: [String] = []
    var certs: [CertListEntry] = []
    
    public override func load() {
        self.enabled = getConfig().getBoolean("enabled", false)
        if let excludedDomains = getConfig().getArray("excludedDomains") as? [String] {
            self.excludedDomains = excludedDomains
        }
        
        if let certs = getConfig().getArray("certs") as? [String] {
            self.certs = loadCertificates(certs)
        }
                
    }
    
    private func loadCertificates(_ certs: [String]) -> [CertListEntry] {
        if certs.isEmpty {
            CAPLog.print("SSL Pinning: No certificates configured")
            return []
        }
        
        CAPLog.print("SSL Pinning: Loading certificates: \(certs)")
        var certList: [CertListEntry] = []
        
        for pathOfCert in certs {
            let file = URL(fileURLWithPath: pathOfCert)
            let cert = CertListEntry(
                fileName: file.deletingPathExtension().lastPathComponent,
                extensionOfFile: file.pathExtension
            )
            guard Bundle.main.path(forResource: cert.fileName, ofType: cert.extensionOfFile, inDirectory: "public/certs") != nil else {
                CAPLog.print("SSL Pinning: Certificate not found: \(cert.fileName).\(cert.extensionOfFile)")
                continue
            }
            
            certList.append(cert)
        }
        
        return certList
    }
    
    internal func isDomainExcludedFromPinning(host: String, scheme: String) -> Bool {
        CAPLog.print("SSL Pinning: Checking Excluded Domains: \(excludedDomains)")

        let isExcluded = excludedDomains.contains { domain in            
            guard let excludedDomainURL = URL(string: domain) else {
                CAPLog.print("SSL Pinning: Invalid URL in Excluded Domains: \(domain)")
                return false
            }
            guard excludedDomainURL.scheme != nil else {
                CAPLog.print("SSL Pinning: The excluded domain string needs to include a protocol: \(domain)")
                return false
            }
            guard let excludedHost = excludedDomainURL.host else {
                return false
            }

            return excludedHost == host && excludedDomainURL.scheme == scheme
        }

        return isExcluded
    }
    
    internal func tryCertificate(_ cert: CertListEntry, _ challenge: URLAuthenticationChallenge, _ serverTrust: SecTrust) -> Bool {
        let filePath = Bundle.main.path(forResource: cert.fileName, ofType: cert.extensionOfFile, inDirectory: "public/certs")!
        let data = try! Data(contentsOf: URL(fileURLWithPath: filePath))
        var certificate = SecCertificateCreateWithData(nil, data as CFData)
        if certificate == nil {
            let certText = try! String(contentsOf: URL(fileURLWithPath: filePath), encoding: .utf8)
            let certData = Data(base64Encoded: certText.replacingOccurrences(of: "-----BEGIN CERTIFICATE-----", with: "").replacingOccurrences(of: "-----END CERTIFICATE-----", with: ""), options: .ignoreUnknownCharacters)
            certificate = SecCertificateCreateWithData(nil, certData! as CFData)
        }
        guard let certificate = certificate else {
            CAPLog.print("\(cert.fileName).\(cert.extensionOfFile) failed to load")
            return false
        }
        
        
        let serverCertificate: SecCertificate?
        
        if #available(iOS 15, *) {
            serverCertificate = (SecTrustCopyCertificateChain(serverTrust) as? [SecCertificate])?.first
        } else {
            serverCertificate = SecTrustGetCertificateAtIndex(serverTrust, 0)
        }
        
        guard
            self.validate(trust: serverTrust, with: SecPolicyCreateBasicX509()),
            let serverCertificate = serverCertificate
        else {
            return false
        }
        
        let serverCertKey = self.publicKey(for: serverCertificate)
        let bundledCertKey = self.publicKey(for: certificate)
        if serverCertKey != bundledCertKey {
            return false
        }

        return true
    }
    
    private func validate(trust: SecTrust, with policy: SecPolicy) -> Bool {
        let status = SecTrustSetPolicies(trust, policy)
        guard status == errSecSuccess else { return false }
        
        return SecTrustEvaluateWithError(trust, nil)
    }

    private func publicKey(for certificate: SecCertificate) -> SecKey? {
        var publicKey: SecKey?
        
        var trust: SecTrust?
        let trustCreationStatus = SecTrustCreateWithCertificates(certificate, SecPolicyCreateBasicX509(), &trust)
        
        if let trust = trust, trustCreationStatus == errSecSuccess {
            if #available(iOS 14, *) {
                publicKey = SecTrustCopyKey(trust)
            } else {
                publicKey = SecTrustCopyPublicKey(trust)
            }
        }
        
        return publicKey
    }
    
    
    
}

//extension WebViewDelegationHandler {
//    open func webView(_ webView: WKWebView, didReceive challenge: URLAuthenticationChallenge, completionHandler: @escaping @MainActor (URLSession.AuthChallengeDisposition, URLCredential?) -> Void) {
//        guard
//            let bridge = bridge,
//            let sslPinningPlugin = bridge.plugin(withName: "CAPSSLPinningPlugin") as? CAPSSLPinningPlugin,
//            sslPinningPlugin.enabled
//        else {
//            completionHandler(.rejectProtectionSpace, nil)
//            return
//        }
//        
//        if sslPinningPlugin.isDomainExcludedFromPinning(
//            host: challenge.protectionSpace.host,
//            scheme: challenge.protectionSpace.protocol ?? ""
//        ) {
//            CAPLog.print("SSL Pinning: Domain Excluded from SSL Pinning. Performing normal request.")
//            completionHandler(.rejectProtectionSpace, nil)
//            return
//        }
//        
//        guard
//            challenge.protectionSpace.authenticationMethod == NSURLAuthenticationMethodServerTrust,
//            let serverTrust = challenge.protectionSpace.serverTrust else {
//            completionHandler(.cancelAuthenticationChallenge, nil)
//            return
//        }
//        
//        for certEntry in sslPinningPlugin.certs {
//            CAPLog.print("SSL Pinning: Trying " + certEntry.fileName)
//            if sslPinningPlugin.tryCertificate(certEntry, challenge, serverTrust) {
//                completionHandler(.useCredential, URLCredential(trust:serverTrust))
//                return
//            }
//        }
//        
//        completionHandler(.rejectProtectionSpace, nil)
//    }
//}
