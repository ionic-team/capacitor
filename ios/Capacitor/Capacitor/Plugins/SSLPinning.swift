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

@objc(SSLPinningHttpRequestHandlerClass)
class SSLPinningHttpRequestHandlerClass: NSObject {
    @objc class func request(_ params: [String: Any]) {
        guard let call = params["call"] as? CAPPluginCall else { fatalError("No Plugin Call") }
        
        guard let plugin = params["plugin"] as? CAPSSLPinningPlugin else {
            call.reject("plugin is not initialized")
            return
        }
        
        let httpMethod = params["httpMethod"] as? String
        
        if !plugin.enabled {
            do {
                try HttpRequestHandler.request(call, httpMethod, plugin.bridge?.config)
            } catch let error {
                call.reject(error.localizedDescription)
            }
            return
        }
        
        guard let urlString = call.getString("url")?.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed),
        let url = URL(string: urlString),
        let host = url.host,
        let scheme = url.scheme else {
            call.reject("invalid url string")
            return
        }
        
        
        if plugin.isDomainExcludedFromPinning(host: host, scheme: scheme) {
            CAPLog.print("SSL Pinning: Domain Excluded from SSL Pinning. Performing normal request.")
            do {
                try HttpRequestHandler.request(call, httpMethod, plugin.bridge?.config)
            } catch let error {
                call.reject(error.localizedDescription)
            }
            return
        }
        
        
        do {
            try SSLPinningHttpRequestHandler.sslRequest(call, httpMethod, plugin)
        } catch let error {
            call.reject(error.localizedDescription)
        }
    }
}

public class SSLPinningHttpRequestHandler: HttpRequestHandler {
    public class SSLCapacitorHttpRequestBuilder: CapacitorHttpRequestBuilder {
        override init() {
            super.init();
        }
        
        public override func openConnection() -> CapacitorHttpRequestBuilder {
            request = SSLCapacitorUrlRequest(url!, method: method!)
            return self
        }
    }
    
    public static func sslRequest(_ call: CAPPluginCall, _ httpMethod: String?, _ plugin: CAPSSLPinningPlugin?) throws {
        guard let urlString = call.getString("url")?.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) else { throw URLError(.badURL) }
        let method = httpMethod ?? call.getString("method", "GET")
        
        // swiftlint:disable force_cast
        let headers = (call.getObject("headers") ?? [:])
        let params = (call.getObject("params") ?? [:]) as [String: Any]
        let responseType = call.getString("responseType") ?? "text"
        let connectTimeout = call.getDouble("connectTimeout")
        let readTimeout = call.getDouble("readTimeout")
        
        let request = try SSLCapacitorHttpRequestBuilder()
            .setUrl(urlString)
            .setMethod(method)
            .setUrlParams(params)
            .openConnection()
            .build() as! SSLCapacitorUrlRequest
        
        request.setRequestHeaders(headers)
        
        let timeout = (connectTimeout ?? readTimeout ?? 600000.0) / 1000.0
        request.setTimeout(timeout)
        
        if let data = call.options["data"] as? JSValue {
            do {
                try request.setRequestBody(data)
            } catch {
                call.reject(error.localizedDescription, (error as NSError).domain, error, nil)
                return
            }
        }
        
        let urlRequest = request.getUrlRequest()
        let urlSession = request.getSSLUrlSession(call, plugin)
        let task = urlSession.dataTask(with: urlRequest, completionHandler: {(data, response, error) -> Void in
            if let error = error {
                call.reject(error.localizedDescription, (error as NSError).domain, error, nil)
                return
            }
            
            setCookiesFromResponse(response as! HTTPURLResponse, plugin?.bridge?.config)
            
            let type = ResponseType(rawValue: responseType) ?? .default
            call.resolve(self.buildResponse(data, response as! HTTPURLResponse, responseType: type))
        })
        
        task.resume()
    }
}

public class SSLCapacitorUrlRequest: CapacitorUrlRequest {
    public func getSSLUrlSession(_ call: CAPPluginCall, _ plugin: CAPSSLPinningPlugin?) -> URLSession {
        return URLSession(
            configuration: URLSessionConfiguration.default,
            delegate: URLSessionPinningDelegate(plugin),
            delegateQueue: nil
        )
    }
}

class URLSessionPinningDelegate: NSObject, URLSessionDelegate {
    weak var plugin: CAPSSLPinningPlugin? = nil
    
    init(_ pluginInstance: CAPSSLPinningPlugin?) {
        self.plugin = pluginInstance
        super.init()
    }
    
    func urlSession(_ session: URLSession, didReceive challenge: URLAuthenticationChallenge, completionHandler: @escaping (URLSession.AuthChallengeDisposition, URLCredential?) -> Void) {
        guard
            challenge.protectionSpace.authenticationMethod == NSURLAuthenticationMethodServerTrust,
            let serverTrust = challenge.protectionSpace.serverTrust
        else {
            completionHandler(URLSession.AuthChallengeDisposition.cancelAuthenticationChallenge, nil)
            return
        }
        
        guard let plugin = self.plugin else {
            fatalError("No config set up.")
        }
        
        if plugin.certs.isEmpty{
            CAPLog.print("SSL Pinning: No certificates configured.")
            completionHandler(.cancelAuthenticationChallenge, nil)
            return
        }
        
        for certEntry in plugin.certs {
            CAPLog.print("SSL Pinning: Trying " + certEntry.fileName)
            if plugin.tryCertificate(certEntry, challenge, serverTrust) {
                completionHandler(.useCredential, URLCredential(trust:serverTrust))
                return
            }
        }
        
        completionHandler(.cancelAuthenticationChallenge, nil)
        return
    }
}
