import Foundation

public class CapacitorCookieManager {
    var config: InstanceConfiguration?

    init(_ capConfig: InstanceConfiguration?) {
        self.config = capConfig
    }

    public func getServerUrl() -> URL? {
        return self.config?.serverURL
    }

    public func getServerUrl(_ call: CAPPluginCall) -> URL? {
        guard let urlString = call.getString("url") else {
            return getServerUrl()
        }

        guard let url = URL(string: urlString) else {
            return getServerUrl()
        }

        return url
    }

    public func encode(_ value: String) -> String {
        return value.addingPercentEncoding(withAllowedCharacters: .urlPathAllowed)!
    }

    public func decode(_ value: String) -> String {
        return value.removingPercentEncoding!
    }

    public func setCookie(_ key: String, _ value: String) {
        let url = getServerUrl()!
        let jar = HTTPCookieStorage.shared
        let field = ["Set-Cookie": "\(key)=\(value)"]
        let cookies = HTTPCookie.cookies(withResponseHeaderFields: field, for: url)
        jar.setCookies(cookies, for: url, mainDocumentURL: url)
    }

    public func setCookie(_ url: URL, _ key: String, _ value: String) {
        let jar = HTTPCookieStorage.shared
        let field = ["Set-Cookie": "\(key)=\(value)"]
        let cookies = HTTPCookie.cookies(withResponseHeaderFields: field, for: url)
        jar.setCookies(cookies, for: url, mainDocumentURL: url)
    }

    public func getCookiesAsMap(_ url: URL) -> [String: String] {
        var cookiesMap: [String: String] = [:]
        let jar = HTTPCookieStorage.shared
        if let cookies = jar.cookies(for: url) {
            for cookie in cookies {
                cookiesMap[cookie.name] = cookie.value
            }
        }
        return cookiesMap
    }

    public func getCookies() -> String {
        let jar = HTTPCookieStorage.shared
        guard let url = self.getServerUrl() else { return "" }
        guard let cookies = jar.cookies(for: url) else { return "" }
        return cookies.map({"\($0.name)=\($0.value)"}).joined(separator: ";")
    }

    public func deleteCookie(_ url: URL, _ key: String) {
        let jar = HTTPCookieStorage.shared
        let cookie = jar.cookies(for: url)?.first(where: { (cookie) -> Bool in
            return cookie.name == key
        })

        if cookie != nil { jar.deleteCookie(cookie!) }
    }

    public func clearCookies(_ url: URL) {
        let jar = HTTPCookieStorage.shared
        jar.cookies(for: url)?.forEach({ (cookie) in jar.deleteCookie(cookie) })
    }

    public func clearAllCookies() {
        let jar = HTTPCookieStorage.shared
        jar.cookies?.forEach({ (cookie) in jar.deleteCookie(cookie) })
    }
}
