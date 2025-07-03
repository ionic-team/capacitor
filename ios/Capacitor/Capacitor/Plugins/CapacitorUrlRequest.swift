import Foundation

open class CapacitorUrlRequest: NSObject, URLSessionTaskDelegate {
    public var request: URLRequest
    public var headers: [String: String]

    public enum CapacitorUrlRequestError: Error {
        case serializationError(String?)
    }

    public init(_ url: URL, method: String) {
        request = URLRequest(url: url)
        request.httpMethod = method
        headers = [:]
        if let lang = Locale.autoupdatingCurrent.languageCode {
            if let country = Locale.autoupdatingCurrent.regionCode {
                headers["Accept-Language"] = "\(lang)-\(country),\(lang);q=0.5"
            } else {
                headers["Accept-Language"] = "\(lang);q=0.5"
            }
            request.addValue(headers["Accept-Language"]!, forHTTPHeaderField: "Accept-Language")
        }
    }

    public func getRequestDataAsJson(_ data: JSValue) throws -> Data? {
        // We need to check if the JSON is valid before attempting to serialize, as JSONSerialization.data will not throw an exception that can be caught, and will cause the application to crash if it fails.
        if JSONSerialization.isValidJSONObject(data) {
            return try JSONSerialization.data(withJSONObject: data)
        } else {
            throw CapacitorUrlRequest.CapacitorUrlRequestError.serializationError("[ data ] argument for request of content-type [ application/json ] must be serializable to JSON")
        }
    }

    public func getRequestDataAsFormUrlEncoded(_ data: JSValue) throws -> Data? {
        guard var components = URLComponents(url: request.url!, resolvingAgainstBaseURL: false) else { return nil }
        components.queryItems = []

        guard let obj = data as? JSObject else {
            // Throw, other data types explicitly not supported
            throw CapacitorUrlRequestError.serializationError("[ data ] argument for request with content-type [ multipart/form-data ] may only be a plain javascript object")
        }

        let allowed = CharacterSet(charactersIn: "-._*").union(.alphanumerics)

        obj.keys.forEach { (key: String) in
            let value = obj[key] as? String ?? ""
            components.queryItems?.append(URLQueryItem(name: key.addingPercentEncoding(withAllowedCharacters: allowed)?.replacingOccurrences(of: "%20", with: "+") ?? key, value: value.addingPercentEncoding(withAllowedCharacters: allowed)?.replacingOccurrences(of: "%20", with: "+")))
        }

        if components.query != nil {
            return Data(components.query!.utf8)
        }

        return nil
    }

    public func getRequestDataAsMultipartFormData(_ data: JSValue, _ contentType: String) throws -> Data {
        guard let obj = data as? JSObject else {
            // Throw, other data types explicitly not supported.
            throw CapacitorUrlRequestError.serializationError("[ data ] argument for request with content-type [ application/x-www-form-urlencoded ] may only be a plain javascript object")
        }

        let strings: [String: String] = obj.compactMapValues { any in
            any as? String
        }

        var data = Data()
        var boundary = UUID().uuidString
        if contentType.contains("="), let contentBoundary = contentType.components(separatedBy: "=").last {
            boundary = contentBoundary
        } else {
            overrideContentType(boundary)
        }
        strings.forEach { key, value in
            data.append("\r\n--\(boundary)\r\n".data(using: .utf8)!)
            data.append("Content-Disposition: form-data; name=\"\(key)\"\r\n\r\n".data(using: .utf8)!)
            data.append(value.data(using: .utf8)!)
        }
        data.append("\r\n--\(boundary)--\r\n".data(using: .utf8)!)

        return data
    }

    private func overrideContentType(_ boundary: String) {
        let contentType = "multipart/form-data; boundary=\(boundary)"
        request.setValue(contentType, forHTTPHeaderField: "Content-Type")
        headers["Content-Type"] = contentType
    }

    public func getRequestDataAsString(_ data: JSValue) throws -> Data {
        guard let stringData = data as? String else {
            throw CapacitorUrlRequestError.serializationError("[ data ] argument could not be parsed as string")
        }
        return Data(stringData.utf8)
    }

    public func getRequestHeader(_ index: String) -> Any? {
        var normalized = [:] as [String: Any]
        self.headers.keys.forEach { (key: String) in
            normalized[key.lowercased()] = self.headers[key]
        }

        return normalized[index.lowercased()]
    }

    public func getRequestDataFromFormData(_ data: JSValue, _ contentType: String) throws -> Data? {
        guard let list = data as? JSArray else {
            // Throw, other data types explicitly not supported.
            throw CapacitorUrlRequestError.serializationError("Data must be an array for FormData")
        }
        var data = Data()
        var boundary = UUID().uuidString
        if contentType.contains("="), let contentBoundary = contentType.components(separatedBy: "=").last {
            boundary = contentBoundary
        } else {
            overrideContentType(boundary)
        }
        for entry in list {
            guard let item = entry as? [String: String] else {
                throw CapacitorUrlRequestError.serializationError("Data must be an array for FormData")
            }

            let type = item["type"]
            let key = item["key"]
            let value = item["value"]!

            if type == "base64File" {
                let fileName = item["fileName"]
                let fileContentType = item["contentType"]

                data.append("--\(boundary)\r\n".data(using: .utf8)!)
                data.append("Content-Disposition: form-data; name=\"\(key!)\"; filename=\"\(fileName!)\"\r\n".data(using: .utf8)!)
                data.append("Content-Type: \(fileContentType!)\r\n".data(using: .utf8)!)
                data.append("Content-Transfer-Encoding: binary\r\n".data(using: .utf8)!)
                data.append("\r\n".data(using: .utf8)!)

                data.append(Data(base64Encoded: value)!)

                data.append("\r\n".data(using: .utf8)!)
            } else if type == "string" {
                data.append("--\(boundary)\r\n".data(using: .utf8)!)
                data.append("Content-Disposition: form-data; name=\"\(key!)\"\r\n".data(using: .utf8)!)
                data.append("\r\n".data(using: .utf8)!)
                data.append(value.data(using: .utf8)!)
                data.append("\r\n".data(using: .utf8)!)
            }
        }
        data.append("--\(boundary)--\r\n".data(using: .utf8)!)

        return data
    }

    public func getRequestData(_ body: JSValue, _ contentType: String, _ dataType: String? = nil) throws -> Data? {
        if dataType == "file" {
            guard let stringData = body as? String else {
                throw CapacitorUrlRequestError.serializationError("[ data ] argument could not be parsed as string")
            }
            return Data(base64Encoded: stringData)
        } else if dataType == "formData" {
            return try getRequestDataFromFormData(body, contentType)
        }

        // If data can be parsed directly as a string, return that without processing.
        if let strVal = try? getRequestDataAsString(body) {
            return strVal
        } else if contentType.contains("application/json") {
            return try getRequestDataAsJson(body)
        } else if contentType.contains("application/x-www-form-urlencoded") {
            return try getRequestDataAsFormUrlEncoded(body)
        } else if contentType.contains("multipart/form-data") {
            return try getRequestDataAsMultipartFormData(body, contentType)
        } else {
            throw CapacitorUrlRequestError.serializationError("[ data ] argument could not be parsed for content type [ \(contentType) ]")
        }
    }

    @available(*, deprecated, message: "Use newer function with passed headers of type [String: Any]")
    public func setRequestHeaders(_ headers: [String: String]) {
        headers.keys.forEach { (key: String) in
            let value = headers[key]
            request.addValue(value!, forHTTPHeaderField: key)
            self.headers[key] = value
        }
    }

    public func setRequestHeaders(_ headers: [String: Any]) {
        headers.keys.forEach { (key: String) in
            let value = headers[key]
            request.setValue("\(value!)", forHTTPHeaderField: key)
            self.headers[key] = "\(value!)"
        }
    }

    public func setRequestBody(_ body: JSValue, _ dataType: String? = nil) throws {
        let contentType = self.getRequestHeader("Content-Type") as? String

        if contentType != nil {
            request.httpBody = try getRequestData(body, contentType!, dataType)
        }
    }

    public func setContentType(_ data: String?) {
        request.setValue(data, forHTTPHeaderField: "Content-Type")
    }

    public func setTimeout(_ timeout: TimeInterval) {
        request.timeoutInterval = timeout
    }

    public func getUrlRequest() -> URLRequest {
        return request
    }

    open func urlSession(_ session: URLSession, task: URLSessionTask, willPerformHTTPRedirection response: HTTPURLResponse, newRequest request: URLRequest, completionHandler: @escaping (URLRequest?) -> Void) {
        completionHandler(nil)
    }

    open func getUrlSession(_ call: CAPPluginCall) -> URLSession {
        let disableRedirects = call.getBool("disableRedirects") ?? false
        if !disableRedirects {
            return URLSession.shared
        }
        return URLSession(configuration: URLSessionConfiguration.default, delegate: self, delegateQueue: nil)
    }
}
