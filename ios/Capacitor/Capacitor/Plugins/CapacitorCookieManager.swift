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

    public func setCookie(_ url: URL, _ key: String, _ value: String) {
        let jar = HTTPCookieStorage.shared
        let cookieProperties: [HTTPCookiePropertyKey: Any] = [
            .name: key,
            .value: value,
            .domain: url.absoluteString,
            .originURL: url.absoluteString,
            .path: "/",
            .version: "0",
            .expires: Date().addingTimeInterval(2629743)
        ]

        if let cookie = HTTPCookie(properties: cookieProperties) {
            jar.setCookie(cookie)
        }
    }

    public func getCookies() -> String {
        let jar = HTTPCookieStorage.shared
        guard let url = self.getServerUrl() else { return "" }
        guard let cookies = jar.cookies(for: url) else { return "" }
        return cookies.map({"\($0.name):\($0.value)"}).joined(separator: ";")
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
