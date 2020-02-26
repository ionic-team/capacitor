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
        print("Error on GET", data, response, error)
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
    
    if data != nil && contentType != nil {
      do {
        try setRequestData(request, data!, contentType!)
      } catch let e {
        call.reject("Unable to set request data", e)
        return
      }
    }

    let task = URLSession.shared.dataTask(with: request) { (data, response, error) in
      if error != nil {
        print("Error on mutate  ", data, response, error)
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
  
  func setRequestData(_ request: URLRequest, _ data: [String:Any], _ contentType: String) throws {
    if contentType.contains("application/json") {
      try setRequestDataJson(request, data)
    } else if contentType.contains("application/x-www-form-urlencoded") {
      setRequestDataFormUrlEncoded(request, data)
    } else if contentType.contains("multipart/form-data") {
      setRequestDataMultipartFormData(request, data)
    }
  }
  
  func setRequestDataJson(_ request: URLRequest, _ data: [String:Any]) throws {
    var req = request
    let jsonData = try JSONSerialization.data(withJSONObject: data)
    req.httpBody = jsonData
  }
  
  func setRequestDataFormUrlEncoded(_ request: URLRequest, _ data: [String:Any]) {
    
  }
  
  func setRequestDataMultipartFormData(_ request: URLRequest, _ data: [String:Any]) {
    
  }
}
