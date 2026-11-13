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

final class CapacitorWebViewCookies: NSObject, WKHTTPCookieStoreObserver {
    static let shared = CapacitorWebViewCookies()

    private struct CookieKey: Hashable {
        let name: String
        let domain: String
        let path: String

        init(_ cookie: HTTPCookie) {
            name = cookie.name
            domain = cookie.domain.lowercased()
            path = cookie.path
        }
    }

    private let marker = HTTPCookie(properties: [
        .name: "capacitorWebViewCookies",
        .value: "1",
        .domain: "capacitor-webview-cookies.invalid",
        .path: "/"
    ])
    private let cookieStore = WKWebsiteDataStore.default().httpCookieStore
    private let processStore = WKWebsiteDataStore.nonPersistent()
    private var snapshot: [CookieKey: HTTPCookie]?
    private var readers: [([HTTPCookie]?) -> Void] = []
    private var isReading = false
    private var foregroundObserver: NSObjectProtocol?

    override private init() {
        super.init()
        foregroundObserver = NotificationCenter.default.addObserver(
            forName: UIApplication.willEnterForegroundNotification,
            object: nil,
            queue: .main
        ) { [weak self] _ in
            self?.read { _ in }
        }
        read { _ in }
    }

    func cookiesDidChange(in cookieStore: WKHTTPCookieStore) {
        read { _ in }
    }

    func read(_ reader: @escaping ([HTTPCookie]?) -> Void) {
        readers.append(reader)
        if !isReading {
            loadForReaders()
        }
    }

    private func loadForReaders() {
        let batch = readers
        readers = []
        isReading = true
        load { cookies in
            batch.forEach { $0(cookies) }
            self.isReading = false
            if !self.readers.isEmpty {
                self.loadForReaders()
            }
        }
    }

    private func load(_ reader: @escaping ([HTTPCookie]?) -> Void) {
        cookieStore.getAllCookies { cookies in
            guard let marker = self.marker, !cookies.contains(where: self.isMarker) else {
                reader(self.apply(cookies))
                return
            }
            self.cookieStore.setCookie(marker) {
                self.recover(marker, reader)
            }
        }
    }

    private func recover(_ marker: HTTPCookie, _ reader: @escaping ([HTTPCookie]?) -> Void) {
        cookieStore.getAllCookies { cookies in
            guard cookies.contains(where: self.isMarker) else {
                reader(nil)
                return
            }
            let processCookieStore = self.processStore.httpCookieStore
            processCookieStore.getAllCookies { processCookies in
                processCookieStore.setCookie(marker, completionHandler: nil)
                let keys = Set(cookies.map(CookieKey.init))
                let lost = (self.snapshot ?? [:]).values.filter { cookie in
                    processCookies.isEmpty && cookie.expiresDate == nil && !keys.contains(CookieKey(cookie))
                }
                if !lost.isEmpty {
                    CAPLog.print("⚡️  Restored \(lost.count) session cookies after a WebKit network process restart")
                }
                CapacitorCookieManager.setCookiesInWebView(lost) {
                    self.cookieStore.remove(self)
                    self.cookieStore.add(self)
                    reader(self.apply(cookies + lost))
                }
            }
        }
    }

    private func apply(_ cookies: [HTTPCookie]) -> [HTTPCookie] {
        let cookies = cookies.filter { !isMarker($0) }
        let current = Dictionary(cookies.map { (CookieKey($0), $0) }, uniquingKeysWith: { _, last in last })
        if let previous = snapshot {
            let jar = HTTPCookieStorage.shared
            let changed = current.filter { key, cookie in
                previous[key]?.value != cookie.value || previous[key]?.expiresDate != cookie.expiresDate
            }
            changed.values.forEach(jar.setCookie)
            previous.filter { current[$0.key] == nil }.values.forEach(jar.deleteCookie)
        }
        snapshot = current
        return cookies
    }

    private func isMarker(_ cookie: HTTPCookie) -> Bool {
        return cookie.name == marker?.name && cookie.domain == marker?.domain
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

    public func deleteCookie(_ url: URL, _ key: String, completion: (() -> Void)? = nil) {
        CapacitorCookieManager.copyWebViewCookies(for: url) {
            let cookie = HTTPCookieStorage.shared.cookies(for: url)?.first(where: { $0.name == key })
            CapacitorCookieManager.deleteCookies(cookie.map { [$0] } ?? [], completion: completion)
        }
    }

    public func clearCookies(_ url: URL, completion: (() -> Void)? = nil) {
        CapacitorCookieManager.copyWebViewCookies(for: url) {
            CapacitorCookieManager.deleteCookies(HTTPCookieStorage.shared.cookies(for: url) ?? [], completion: completion)
        }
    }

    public func clearAllCookies(completion: (() -> Void)? = nil) {
        DispatchQueue.main.async {
            CapacitorWebViewCookies.shared.read { cookies in
                CapacitorCookieManager.deleteCookies((cookies ?? []) + (HTTPCookieStorage.shared.cookies ?? []), completion: completion)
            }
        }
    }

    private static func deleteCookies(_ cookies: [HTTPCookie], completion: (() -> Void)?) {
        DispatchQueue.main.async {
            cookies.forEach(HTTPCookieStorage.shared.deleteCookie)
            let cookieStore = WKWebsiteDataStore.default().httpCookieStore
            let group = DispatchGroup()
            for cookie in cookies {
                group.enter()
                cookieStore.delete(cookie) {
                    group.leave()
                }
            }
            group.notify(queue: .main) {
                CapacitorWebViewCookies.shared.read { _ in
                    completion?()
                }
            }
        }
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
            CapacitorWebViewCookies.shared.read { cookies in
                guard let cookies = cookies else {
                    completion()
                    return
                }
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

    static func isDomain(_ cookieDomain: String, matching host: String) -> Bool {
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
