import Foundation
import MobileCoreServices

class CAPAssetHandler: NSObject, WKURLSchemeHandler {

  private var basePath: String = ""

  func setAssetPath(_ assetPath: String) {
    self.basePath = assetPath;
  }

  func webView(_ webView: WKWebView, start urlSchemeTask: WKURLSchemeTask) {
      var startPath = self.basePath
      let url = urlSchemeTask.request.url!
      let stringToLoad = url.path

      if stringToLoad.starts(with: CAPBridge.CAP_FILE_START) {
        startPath = stringToLoad.replacingOccurrences(of: CAPBridge.CAP_FILE_START, with: "")
      } else if stringToLoad.isEmpty || url.pathExtension.isEmpty {
        startPath.append("/index.html")
      } else {
        startPath.append(stringToLoad)
      }
      let localUrl = URL.init(string: url.absoluteString)!
      let fileUrl = URL.init(fileURLWithPath: startPath)

      // CORS support
      let origin = urlSchemeTask.request.value(forHTTPHeaderField: "origin")
      var headers =  origin != nil ? [
        "Access-Control-Allow-Origin": origin!,
        "Access-Control-Allow-Methods": "GET, OPTIONS",
      ] : [String: String]()

      do {
        switch urlSchemeTask.request.httpMethod {
        case "GET":
          var data = Data()
          if !stringToLoad.contains("cordova.js") {
            if isMediaExtension(pathExtension: url.pathExtension) {
              data = try Data(contentsOf: fileUrl, options: Data.ReadingOptions.mappedIfSafe)
            } else {
              data = try Data(contentsOf: fileUrl)
            }
          }
          let mimeType = mimeTypeForExtension(pathExtension: url.pathExtension)
          let expectedContentLength = data.count

          headers["Content-Type"] = mimeType
          headers["Cache-Control"] = "no-cache"

          let urlResponse = URLResponse(url: localUrl, mimeType: mimeType, expectedContentLength: expectedContentLength, textEncodingName: nil)
          let httpResponse = HTTPURLResponse(url: localUrl, statusCode: 200, httpVersion: nil, headerFields: headers)
          if isMediaExtension(pathExtension: url.pathExtension) {
              urlSchemeTask.didReceive(urlResponse)
          } else {
              urlSchemeTask.didReceive(httpResponse!)
          }
          urlSchemeTask.didReceive(data)
        case "OPTIONS":
          // CORS preflight
          let response = HTTPURLResponse(url: localUrl, statusCode: 200, httpVersion: nil, headerFields: headers)
          urlSchemeTask.didReceive(response!)

        default:
          // method not allowed
          let response = HTTPURLResponse(url: localUrl, statusCode: 405, httpVersion: nil, headerFields: headers)
          urlSchemeTask.didReceive(response!)
        }
      } catch let error as NSError {
        urlSchemeTask.didFailWithError(error)
        return
      }
      urlSchemeTask.didFinish()
  }

  func webView(_ webView: WKWebView, stop urlSchemeTask: WKURLSchemeTask) {
    CAPLog.print("scheme stop")
  }

  func mimeTypeForExtension(pathExtension: String) -> String {
    if !pathExtension.isEmpty {
    if let uti = UTTypeCreatePreferredIdentifierForTag(kUTTagClassFilenameExtension, pathExtension as NSString, nil)?.takeRetainedValue() {
        if let mimetype = UTTypeCopyPreferredTagWithClass(uti, kUTTagClassMIMEType)?.takeRetainedValue() {
          return mimetype as String
        }
      }
      return "application/octet-stream"
    }
    return "text/html"
  }

  func isMediaExtension(pathExtension: String) -> Bool {
    let mediaExtensions = ["m4v", "mov", "mp4",
                           "aac", "ac3", "aiff", "au", "flac", "m4a", "mp3", "wav"]
    if mediaExtensions.contains(pathExtension.lowercased()) {
      return true
    }
    return false
  }
}
