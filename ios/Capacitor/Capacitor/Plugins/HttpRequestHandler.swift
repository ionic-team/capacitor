import Foundation

/// See https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/responseType
public enum ResponseType: String {
    case arrayBuffer = "arraybuffer"
    case blob = "blob"
    case document = "document"
    case json = "json"
    case text = "text"

    public static let `default`: ResponseType = .text

    public init(string: String?) {
        guard let string = string else {
            self = .default
            return
        }

        guard let responseType = ResponseType(rawValue: string.lowercased()) else {
            self = .default
            return
        }

        self = responseType
    }
}

/// Helper that safely parses JSON Data. Otherwise returns an error (without throwing)
/// - Parameters:
///     - data: The JSON Data to parse
/// - Returns: The parsed value or an error
func tryParseJson(_ data: Data) -> Any {
    do {
        return try JSONSerialization.jsonObject(with: data, options: [.mutableContainers, .fragmentsAllowed])
    } catch {
        return error.localizedDescription
    }
}

/// Helper to convert the headers dictionary to lower case keys. This allows case-insensitive querying in the bridge javascript.
/// - Parameters:
///     - headers: The headers as dictionary. The type is unspecific because the incoming headers are coming from the
///       allHeaderFields property of the HttpResponse.
/// - Returns: The modified headers dictionary with lowercase keys
private func lowerCaseHeaderDictionary(_ headers: [AnyHashable: Any]) -> [String: Any] {
    // Lowercases the key of the headers dictionary.
    return Dictionary(uniqueKeysWithValues: headers.map({ (key: AnyHashable, value: Any) in
        return (String(describing: key).lowercased(), value)
    }))
}

open class HttpRequestHandler {
    open class CapacitorHttpRequestBuilder {
        public var url: URL?
        public var method: String?
        public var params: [String: String]?
        open var request: CapacitorUrlRequest?

        public init() { }

        /// Set the URL of the HttpRequest
        /// - Throws: an error of URLError if the urlString cannot be parsed
        /// - Parameters:
        ///     - urlString: The URL value to parse
        /// - Returns: self to continue chaining functions
        public func setUrl(_ urlString: String) throws -> CapacitorHttpRequestBuilder {
            guard let url = URL(string: urlString) else {
                throw URLError(.badURL)
            }
            self.url = url
            return self
        }

        public func setMethod(_ method: String) -> CapacitorHttpRequestBuilder {
            self.method = method
            return self
        }

        public func setUrlParams(_ params: [String: Any], _ shouldEncodeUrlParams: Bool = true) -> CapacitorHttpRequestBuilder {
            if params.count != 0 {
                // swiftlint:disable force_cast
                var cmps = URLComponents(url: url!, resolvingAgainstBaseURL: true)
                if cmps?.queryItems == nil {
                    cmps?.queryItems = []
                }

                if shouldEncodeUrlParams {
                    var urlSafeParams: [URLQueryItem] = []
                    for (key, value) in params {
                        if let arr = value as? [String] {
                            arr.forEach { str in
                                urlSafeParams.append(URLQueryItem(name: key, value: str))
                            }
                        } else {
                            urlSafeParams.append(URLQueryItem(name: key, value: (value as! String)))
                        }
                    }
                    cmps!.queryItems?.append(contentsOf: urlSafeParams)
                } else {
                    cmps?.query = params.flatMap { key, value -> [String] in
                        if let arrayValue = value as? [String] {
                            return arrayValue.map { "\(key)=\($0)" }
                        } else {
                            return ["\(key)=\(value)"]
                        }
                    }.joined(separator: "&")
                }
                url = cmps!.url!
            }
            return self
        }

        open func openConnection() -> CapacitorHttpRequestBuilder {
            request = CapacitorUrlRequest(url!, method: method!)
            return self
        }

        public func build() -> CapacitorUrlRequest {
            return request!
        }
    }

    public static func setCookiesFromResponse(_ response: HTTPURLResponse, _ config: InstanceConfiguration?) {
        let headers = response.allHeaderFields
        if let cookies = headers["Set-Cookie"] as? String {
            for cookie in cookies.components(separatedBy: ",") {
                let domainComponents = cookie.lowercased().components(separatedBy: "domain=")
                if domainComponents.count > 1 {
                    CapacitorCookieManager(config).setCookie(
                        domainComponents[1].components(separatedBy: ";")[0],
                        cookie
                    )
                } else {
                    CapacitorCookieManager(config).setCookie("", cookie)
                }
            }
        }
        CapacitorCookieManager(config).syncCookiesToWebView()
    }

    public static func buildResponse(_ data: Data?, _ response: HTTPURLResponse, responseType: ResponseType = .default) -> [String: Any] {
        var output = [:] as [String: Any]

        output["status"] = response.statusCode

        // HTTP Headers are case insensitive. The allHeaderFields dictionary returned by Apple Foundation Code has its keys capitalized.
        // According to the documentation at https://developer.apple.com/documentation/foundation/httpurlresponse/1417930-allheaderfields
        // "HTTP headers are case insensitive. To simplify your code, URL Loading System canonicalizes certain header field names into
        // their standard form. For example, if the server sends a content-length header, it’s automatically adjusted to be Content-Length."
        // To handle the case insevitivy, we are converting the header keys to lower case here. When querying for headers in the native bridge,
        // we are lowercasing the key as well.
        output["headers"] = lowerCaseHeaderDictionary(response.allHeaderFields)
        output["url"] = response.url?.absoluteString

        guard let data = data else {
            output["data"] = ""
            return output
        }

        let contentType = (response.allHeaderFields["Content-Type"] as? String ?? "application/default").lowercased()

        if contentType.contains("application/json") || responseType == .json {
            output["data"] = tryParseJson(data)
        } else if responseType == .arrayBuffer || responseType == .blob {
            output["data"] = data.base64EncodedString()
        } else if responseType == .document || responseType == .text || responseType == .default {
            output["data"] = String(data: data, encoding: .utf8)
        }

        return output
    }

    public static func request(_ call: CAPPluginCall, _ httpMethod: String?, _ config: InstanceConfiguration?) throws {
        guard var urlString = call.getString("url") else { throw URLError(.badURL) }
        let method = httpMethod ?? call.getString("method", "GET")

        var headers = (call.getObject("headers") ?? [:]) as [String: Any]
        let params = (call.getObject("params") ?? [:]) as [String: Any]
        let responseType = call.getString("responseType") ?? "text"
        let connectTimeout = call.getDouble("connectTimeout")
        let shouldEncodeUrlParams = call.getBool("shouldEncodeUrlParams", true)
        let readTimeout = call.getDouble("readTimeout")
        let dataType = call.getString("dataType") ?? "any"

        if urlString == urlString.removingPercentEncoding {
            guard let encodedUrlString = urlString.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed)  else { throw URLError(.badURL) }
            urlString = encodedUrlString
        }

        let request = try CapacitorHttpRequestBuilder()
            .setUrl(urlString)
            .setMethod(method)
            .setUrlParams(params, shouldEncodeUrlParams)
            .openConnection()
            .build()

        if let userAgentString = config?.overridenUserAgentString, headers["User-Agent"] == nil, headers["user-agent"] == nil {
            headers["User-Agent"] = userAgentString
        }

        request.setRequestHeaders(headers)

        // Timeouts in iOS are in seconds. So read the value in millis and divide by 1000
        let timeout = (connectTimeout ?? readTimeout ?? 600000.0) / 1000.0
        request.setTimeout(timeout)

        if let data = call.options["data"] as? JSValue {
            do {
                try request.setRequestBody(data, dataType)
            } catch {
                // Explicitly reject if the http request body was not set successfully,
                // so as to not send a known malformed request, and to provide the developer with additional context.
                call.reject(error.localizedDescription, (error as NSError).domain, error, nil)
                return
            }
        }

        let urlRequest = request.getUrlRequest()
        let urlSession = request.getUrlSession(call)
        let task = urlSession.dataTask(with: urlRequest) { (data, response, error) in
            urlSession.invalidateAndCancel()

            if let error = error {
                call.reject(error.localizedDescription, (error as NSError).domain, error, nil)
                return
            }

            setCookiesFromResponse(response as! HTTPURLResponse, config)

            let type = ResponseType(rawValue: responseType) ?? .default
            call.resolve(self.buildResponse(data, response as! HTTPURLResponse, responseType: type))
        }

        task.resume()
    }
}
