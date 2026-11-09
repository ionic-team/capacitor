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

public class CapacitorRedirectCookies: NSObject, URLSessionTaskDelegate {
    public private(set) var cookies: [HTTPCookie] = []

    public func urlSession(_ session: URLSession, task: URLSessionTask, willPerformHTTPRedirection response: HTTPURLResponse, newRequest request: URLRequest, completionHandler: @escaping (URLRequest?) -> Void) {
        cookies += HttpRequestHandler.responseCookies(response)
        completionHandler(request)
    }
}

public class CapacitorCookieManager {
    var config: InstanceConfiguration?

    init(_ capConfig: InstanceConfiguration?) {
        self.config = capConfig
    }

    public func getServerUrl() -> URL? {
        return self.config?.serverURL ?? self.config?.localURL
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
        CapacitorCookieManager.setCookiesInWebView(cookies)
    }

    public func setCookie(_ url: URL, _ key: String, _ value: String, _ expires: String?, _ path: String?, completion: (() -> Void)? = nil) {
        let jar = HTTPCookieStorage.shared
        let field = ["Set-Cookie": "\(key)=\(value); expires=\(expires ?? ""); path=\(path ?? "/")"]
        let cookies = HTTPCookie.cookies(withResponseHeaderFields: field, for: url)
        jar.setCookies(cookies, for: url, mainDocumentURL: nil)
        CapacitorCookieManager.setCookiesInWebView(cookies, completion: completion)
    }

    public func getCookiesAsMap(_ url: URL) -> [String: String] {
        var cookiesMap: [String: String] = [:]
        let jar = HTTPCookieStorage.shared
        if let cookies = jar.cookies(for: url) {
            for cookie in cookies {
                if !cookie.isHTTPOnly {
                    cookiesMap[cookie.name] = cookie.value
                }
            }
        }
        return cookiesMap
    }

    public func getCookies() -> String {
        let jar = HTTPCookieStorage.shared
        guard let url = self.getServerUrl() else { return "" }
        guard let cookies = jar.cookies(for: url) else { return "" }
        let filteredCookies = cookies.filter { !$0.isHTTPOnly }
        return filteredCookies.map({"\($0.name)=\($0.value)"}).joined(separator: "; ")
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

    public static func setCookiesInWebView(_ cookies: [HTTPCookie], completion: (() -> Void)? = nil) {
        DispatchQueue.main.async {
            let cookieStore = WKWebsiteDataStore.default().httpCookieStore
            let group = DispatchGroup()
            for cookie in cookies {
                group.enter()
                cookieStore.setCookie(cookie) {
                    group.leave()
                }
            }
            group.notify(queue: .main) {
                completion?()
            }
        }
    }

    public static func copyWebViewCookies(for url: URL?, completion: @escaping () -> Void) {
        guard let host = url?.host?.lowercased() else {
            completion()
            return
        }
        DispatchQueue.main.async {
            WKWebsiteDataStore.default().httpCookieStore.getAllCookies { cookies in
                let jar = HTTPCookieStorage.shared
                let webCookies = cookies.filter { isDomain($0.domain, matching: host) }
                let webKeys = Set(webCookies.map(cookieKey))
                jar.cookies?
                    .filter { isDomain($0.domain, matching: host) && !webKeys.contains(cookieKey($0)) }
                    .forEach(jar.deleteCookie)
                webCookies.forEach(jar.setCookie)
                completion()
            }
        }
    }

    private static func isDomain(_ cookieDomain: String, matching host: String) -> Bool {
        let domain = cookieDomain.lowercased()
        let bareDomain = domain.hasPrefix(".") ? String(domain.dropFirst()) : domain
        return host == bareDomain || host.hasSuffix("." + bareDomain)
    }

    private static func cookieKey(_ cookie: HTTPCookie) -> String {
        return "\(cookie.name)\t\(cookie.domain.lowercased())\t\(cookie.path)"
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
