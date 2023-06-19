import Foundation

public class CapacitorWKCookieObserver: NSObject, WKHTTPCookieStoreObserver {
    // Sync WKWebView Cookies to HTTPCookieStorage
    public func cookiesDidChange(in cookieStore: WKHTTPCookieStore) {
        DispatchQueue.main.async {
            cookieStore.getAllCookies { cookies in
                cookies.forEach { cookie in
                    HTTPCookieStorage.shared.setCookie(cookie)
                }
            }
        }
    }
}

public class CapacitorCookieManager {
    var config: InstanceConfiguration?

    init(_ capConfig: InstanceConfiguration?) {
        self.config = capConfig
    }

    public func getServerUrl() -> URL? {
        return self.config?.serverURL
    }

    private func isUrlSanitized(_ urlString: String) -> Bool {
        return urlString.isEmpty || urlString == getServerUrl()?.absoluteString || urlString.hasPrefix("http://") || urlString.hasPrefix("https://")
    }

    public func getServerUrl(_ urlString: String?) -> URL? {
        guard let urlString = urlString else {
            return getServerUrl()
        }

        if urlString.isEmpty {
            return getServerUrl()
        }

        let validUrlString = (isUrlSanitized(urlString)) ? urlString : "http://\(urlString)"

        guard let url = URL(string: validUrlString) else {
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

    public func setCookie(_ domain: String, _ action: String) {
        let url = getServerUrl(domain)!
        let jar = HTTPCookieStorage.shared
        let field = ["Set-Cookie": action]
        let cookies = HTTPCookie.cookies(withResponseHeaderFields: field, for: url)
        jar.setCookies(cookies, for: url, mainDocumentURL: nil)
        syncCookiesToWebView()
    }

    public func setCookie(_ url: URL, _ key: String, _ value: String, _ expires: String?, _ path: String?) {
        let jar = HTTPCookieStorage.shared
        let field = ["Set-Cookie": "\(key)=\(value); expires=\(expires ?? ""); path=\(path ?? "/")"]
        let cookies = HTTPCookie.cookies(withResponseHeaderFields: field, for: url)
        jar.setCookies(cookies, for: url, mainDocumentURL: nil)
        syncCookiesToWebView()
    }

    public func getCookiesAsMap(_ url: URL) -> [String: String] {
        syncCookiesToWebView()
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
        syncCookiesToWebView()
        let jar = HTTPCookieStorage.shared
        guard let url = self.getServerUrl() else { return "" }
        guard let cookies = jar.cookies(for: url) else { return "" }
        return cookies.map({"\($0.name)=\($0.value)"}).joined(separator: "; ")
    }

    public func deleteCookie(_ url: URL, _ key: String) {
        let jar = HTTPCookieStorage.shared
        if let cookie = jar.cookies(for: url)?.first(where: { (cookie) -> Bool in
            return cookie.name == key
        }) {
            jar.deleteCookie(cookie)
            DispatchQueue.main.async {
                WKWebsiteDataStore.default().httpCookieStore.delete(cookie)
            }
        }
    }

    public func clearCookies(_ url: URL) {
        let jar = HTTPCookieStorage.shared
        jar.cookies(for: url)?.forEach({ (cookie) in
            jar.deleteCookie(cookie)
            DispatchQueue.main.async {
                WKWebsiteDataStore.default().httpCookieStore.delete(cookie)
            }
        })
    }

    public func clearAllCookies() {
        let jar = HTTPCookieStorage.shared
        jar.cookies?.forEach({ (cookie) in
            jar.deleteCookie(cookie)
            DispatchQueue.main.async {
                WKWebsiteDataStore.default().httpCookieStore.delete(cookie)
            }
        })
    }

    public func syncCookiesToWebView() {
        if let cookies = HTTPCookieStorage.shared.cookies {
            for cookie in cookies {
                DispatchQueue.main.async {
                    WKWebsiteDataStore.default()
                        .httpCookieStore
                        .setCookie(cookie, completionHandler: nil)
                }

            }
        }
    }
}
