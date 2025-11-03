struct CertLIstEntry {
    let fileName: String
    let extensionOfFile: String
}

extension CapacitorBridge {
    public func isDomainExcludedFromPinning(host: String, scheme: String) -> Bool {
        print("Checking Excluded Domains: \(config.sslPinningExcludedDomains)")
        
        let isExcluded = config.sslPinningExcludedDomains.contains { domain in
            guard let domain = domain as? String else {
                print("Invalid URL in Excluded Domains: \(domain)")
                return false
            }
            guard let excludedDomainURL = URL(string: domain) else {
                print("Invalid URL in Excluded Domains: \(domain)")
                return false
            }
            guard excludedDomainURL.scheme != nil else {
                print("The excluded domain string needs to include a protocol: \(domain)")
                return false
            }
            guard let excludedHost = excludedDomainURL.host else {
                return false
            }
                        
            return excludedHost == host && excludedDomainURL.scheme == scheme
        }
        
        return isExcluded
    }
}


