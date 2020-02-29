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
    
    guard let url = URL(string: urlValue) else {
      return call.reject("Invalid URL")
    }
    
    switch method {
    case "GET", "HEAD":
      get(call, url, method)
    case "DELETE", "PATCH", "POST", "PUT":
      mutate(call, url, method)
    default:
      call.reject("Unknown method")
    }
  }
  
  // Handle GET operations
  func get(_ call: CAPPluginCall, _ url: URL, _ method: String) {
    var request = URLRequest(url: url)
    request.httpMethod = method
    let task = URLSession.shared.dataTask(with: request) { (data, response, error) in
      if error != nil {
        CAPLog.print("Error on GET", data, response, error)
        call.reject("Error", error, [:])
        return
      }
      
      let res = response as! HTTPURLResponse
     
      call.resolve(self.buildResponse(data, res))
    }
    
    task.resume()
  }
  
  // Handle mutation operations: DELETE, PATCH, POST, and PUT
  func mutate(_ call: CAPPluginCall, _ url: URL, _ method: String) {
    let data = call.getObject("data")
    
    var request = URLRequest(url: url)
    request.httpMethod = method
    
    let headers = (call.getObject("headers") ?? [:]) as [String:Any]
    
    let contentType = getRequestHeader(headers, "Content-Type") as? String
    
    if contentType != nil {
      request.setValue(contentType, forHTTPHeaderField: "Content-Type")
    }
    
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
        CAPLog.print("Error on mutate  ", data, response, error)
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
    }
    // TODO: Handle other response content types, including binary
    /*
    else {
      ret["data"] =
    }*/
    
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
      return try setRequestDataFormUrlEncoded(request, data)
    } else if contentType.contains("multipart/form-data") {
      return try setRequestDataMultipartFormData(request, data)
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
}
