import Foundation
import AudioToolbox

@objc(CAPHttpPlugin)
public class CAPHttpPlugin: CAPPlugin {

  @objc public func request(_ call: CAPPluginCall) {
    guard let urlValue = call.getString("url") else {
      return call.reject("Must provide a URL")
    }
    guard let method = call.getString("method") else {
      return call.reject("Must provide a method. One of GET, DELETE, HEAD PATCH, POST, or PUT")
    }
    
    let headers = (call.getObject("headers") ?? [:]) as [String:String]
    
    let params = (call.getObject("params") ?? [:]) as [String:String]
    
    guard var url = URL(string: urlValue) else {
      return call.reject("Invalid URL")
    }
    
    
    switch method {
    case "GET", "HEAD":
      get(call, &url, method, headers, params)
    case "DELETE", "PATCH", "POST", "PUT":
      mutate(call, url, method, headers)
    default:
      call.reject("Unknown method")
    }
  }

  
  @objc public func downloadFile(_ call: CAPPluginCall) {
    guard let urlValue = call.getString("url") else {
      return call.reject("Must provide a URL")
    }
    guard let filePath = call.getString("filePath") else {
      return call.reject("Must provide a file path to download the file to")
    }
    
    let fileDirectory = call.getString("fileDirectory") ?? "DOCUMENTS"
    
    guard let url = URL(string: urlValue) else {
      return call.reject("Invalid URL")
    }
    
    let task = URLSession.shared.downloadTask(with: url) { (downloadLocation, response, error) in
      if error != nil {
        CAPLog.print("Error on download file", downloadLocation, response, error)
        call.reject("Error", error, [:])
        return
      }
      
      guard let location = downloadLocation else {
        call.reject("Unable to get file after downloading")
        return
      }
      
      // TODO: Move to abstracted FS operations
      let fileManager = FileManager.default
      
      let foundDir = FilesystemUtils.getDirectory(directory: fileDirectory)
      let dir = fileManager.urls(for: foundDir, in: .userDomainMask).first
      
      do {
        let dest = dir!.appendingPathComponent(filePath)
        print("File Dest", dest.absoluteString)
        
        try FilesystemUtils.createDirectoryForFile(dest, true)
        
        try fileManager.moveItem(at: location, to: dest)
        call.resolve([
          "path": dest.absoluteString
        ])
      } catch let e {
        call.reject("Unable to download file", e)
        return
      }
      
      
      CAPLog.print("Downloaded file", location)
      call.resolve()
    }
    
    task.resume()
  }
  
  @objc public func uploadFile(_ call: CAPPluginCall) {
    guard let urlValue = call.getString("url") else {
      return call.reject("Must provide a URL")
    }
    guard let filePath = call.getString("filePath") else {
      return call.reject("Must provide a file path to download the file to")
    }
    let name = call.getString("name") ?? "file"
    
    let fileDirectory = call.getString("fileDirectory") ?? "DOCUMENTS"
    
    guard let url = URL(string: urlValue) else {
      return call.reject("Invalid URL")
    }
    
    guard let fileUrl = FilesystemUtils.getFileUrl(filePath, fileDirectory) else {
      return call.reject("Unable to get file URL")
    }
   
    var request = URLRequest.init(url: url)
    request.httpMethod = "POST"
    
    let boundary = UUID().uuidString
    
    var fullFormData: Data?
    do {
      fullFormData = try generateFullMultipartRequestBody(fileUrl, name, boundary)
    } catch let e {
      return call.reject("Unable to read file to upload", e)
    }


    request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")
    
    let task = URLSession.shared.uploadTask(with: request, from: fullFormData) { (data, response, error) in
      if error != nil {
        CAPLog.print("Error on upload file", data, response, error)
        call.reject("Error", error, [:])
        return
      }
      
      let res = response as! HTTPURLResponse
      
      //CAPLog.print("Uploaded file", location)
      call.resolve()
    }
    
    task.resume()
  }
  
  @objc public func setCookie(_ call: CAPPluginCall) {
  
    guard let key = call.getString("key") else {
      return call.reject("Must provide key")
    }
    guard let value = call.getString("value") else {
      return call.reject("Must provide value")
    }
    guard let urlString = call.getString("url") else {
      return call.reject("Must provide URL")
    }
    
    guard let url = URL(string: urlString) else {
      return call.reject("Invalid URL")
    }
    
    let jar = HTTPCookieStorage.shared
    let field = ["Set-Cookie": "\(key)=\(value)"]
    let cookies = HTTPCookie.cookies(withResponseHeaderFields: field, for: url)
    jar.setCookies(cookies, for: url, mainDocumentURL: url)
    
    call.resolve()
  }
  
  @objc public func getCookies(_ call: CAPPluginCall) {
    guard let urlString = call.getString("url") else {
      return call.reject("Must provide URL")
    }
    
    guard let url = URL(string: urlString) else {
      return call.reject("Invalid URL")
    }
    
    let jar = HTTPCookieStorage.shared
    guard let cookies = jar.cookies(for: url) else {
      return call.resolve([
        "value": []
      ])
    }
    
    let c = cookies.map { (cookie: HTTPCookie) -> [String:String] in
      return [
        "key": cookie.name,
        "value": cookie.value
      ]
    }
    
    call.resolve([
      "value": c
    ])
  }
  
  @objc public func deleteCookie(_ call: CAPPluginCall) {
    guard let urlString = call.getString("url") else {
      return call.reject("Must provide URL")
    }
    guard let key = call.getString("key") else {
      return call.reject("Must provide key")
    }
    guard let url = URL(string: urlString) else {
      return call.reject("Invalid URL")
    }
    
    let jar = HTTPCookieStorage.shared
    
    let cookie = jar.cookies(for: url)?.first(where: { (cookie) -> Bool in
      return cookie.name == key
    })
    if cookie != nil {
      jar.deleteCookie(cookie!)
    }
    
    call.resolve()
  }
  
  @objc public func clearCookies(_ call: CAPPluginCall) {
    guard let urlString = call.getString("url") else {
      return call.reject("Must provide URL")
    }
    guard let url = URL(string: urlString) else {
      return call.reject("Invalid URL")
    }
    let jar = HTTPCookieStorage.shared
    jar.cookies(for: url)?.forEach({ (cookie) in
      jar.deleteCookie(cookie)
    })
    call.resolve()
  }

  
  /* PRIVATE */
  
  // Handle GET operations
  func get(_ call: CAPPluginCall, _ url: inout URL, _ method: String, _ headers: [String:String], _ params: [String:String]) {
    setUrlQuery(&url, params)
    
    var request = URLRequest(url: url)
    
    request.httpMethod = method
    
    setRequestHeaders(&request, headers)

    let task = URLSession.shared.dataTask(with: request) { (data, response, error) in
      if error != nil {
        call.reject("Error", error, [:])
        return
      }
      
      let res = response as! HTTPURLResponse
     
      call.resolve(self.buildResponse(data, res))
    }
    
    task.resume()
  }
  
  func setUrlQuery(_ url: inout URL, _ params: [String:String]) {
    var cmps = URLComponents(url: url, resolvingAgainstBaseURL: true)
    cmps!.queryItems = params.map({ (key, value) -> URLQueryItem in
      return URLQueryItem(name: key, value: value)
    })
    url = cmps!.url!
  }
  
  func setRequestHeaders(_ request: inout URLRequest, _ headers: [String:String]) {
    headers.keys.forEach { (key) in
      guard let value = headers[key] else {
        return
      }
      request.addValue(value, forHTTPHeaderField: key)
    }
  }
  
  // Handle mutation operations: DELETE, PATCH, POST, and PUT
  func mutate(_ call: CAPPluginCall, _ url: URL, _ method: String, _ headers: [String:String]) {
    let data = call.getObject("data")
    
    var request = URLRequest(url: url)
    request.httpMethod = method
  
    setRequestHeaders(&request, headers)
    
    let contentType = getRequestHeader(headers, "Content-Type") as? String
    
    if data != nil && contentType != nil {
      do {
        request.httpBody = try getRequestData(request, data!, contentType!)
      } catch let e {
        call.reject("Unable to set request data", e)
        return
      }
    }

    let task = URLSession.shared.dataTask(with: request) { (data, response, error) in
      if error != nil {
        call.reject("Error", error, [:])
        return
      }
      
      let res = response as! HTTPURLResponse
     
      call.resolve(self.buildResponse(data, res))
    }
    
    task.resume()
  }

  func buildResponse(_ data: Data?, _ response: HTTPURLResponse) -> [String:Any] {
    
    var ret = [:] as [String:Any]
    
    ret["status"] = response.statusCode
    ret["headers"] = response.allHeaderFields
    
    let contentType = response.allHeaderFields["Content-Type"] as? String

    if data != nil && contentType != nil && contentType!.contains("application/json") {
      if let json = try? JSONSerialization.jsonObject(with: data!, options: .mutableContainers) as? [String: Any] {
        print("Got json")
        print(json)
          // handle json...
        ret["data"] = json
      }
    } else {
      if (data != nil) {
        ret["data"] = String(data: data!, encoding: .utf8);
      } else {
        ret["data"] = ""
      }
    }
    
    return ret
  }
  
  func getRequestHeader(_ headers: [String:Any], _ header: String) -> Any? {
    var normalizedHeaders = [:] as [String:Any]
    headers.keys.forEach { (key) in
      normalizedHeaders[key.lowercased()] = headers[key]
    }
    return normalizedHeaders[header.lowercased()]
  }
  
  func getRequestData(_ request: URLRequest, _ data: [String:Any], _ contentType: String) throws -> Data? {
    if contentType.contains("application/json") {
      return try setRequestDataJson(request, data)
    } else if contentType.contains("application/x-www-form-urlencoded") {
      return setRequestDataFormUrlEncoded(request, data)
    } else if contentType.contains("multipart/form-data") {
      return setRequestDataMultipartFormData(request, data)
    }
    return nil
  }
  
  func setRequestDataJson(_ request: URLRequest, _ data: [String:Any]) throws -> Data? {
    let jsonData = try JSONSerialization.data(withJSONObject: data)
    return jsonData
  }
  
  func setRequestDataFormUrlEncoded(_ request: URLRequest, _ data: [String:Any]) -> Data? {
    guard var components = URLComponents(url: request.url!, resolvingAgainstBaseURL: false) else {
      return nil
    }
    components.queryItems = []
    data.keys.forEach { (key) in
      components.queryItems?.append(URLQueryItem(name: key, value: "\(data[key] ?? "")"))
    }
    
    if components.query != nil {
      return Data(components.query!.utf8)
    }
    
    return nil
  }
  
  func setRequestDataMultipartFormData(_ request: URLRequest, _ data: [String:Any]) -> Data? {
    return nil
  }
  
  
  func generateFullMultipartRequestBody(_ url: URL, _ name: String, _ boundary: String) throws -> Data {
    var data = Data()
    
    let fileData = try Data(contentsOf: url)

    
    let fname = url.lastPathComponent
    let mimeType = FilesystemUtils.mimeTypeForPath(path: fname)
    data.append("\r\n--\(boundary)\r\n".data(using: .utf8)!)
    data.append("Content-Disposition: form-data; name=\"\(name)\"; filename=\"\(fname)\"\r\n".data(using: .utf8)!)
    data.append("Content-Type: \(mimeType)\r\n\r\n".data(using: .utf8)!)
    data.append(fileData)
    data.append("\r\n--\(boundary)--\r\n".data(using: .utf8)!)
    
    return data
  }
}
