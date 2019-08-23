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

      if stringToLoad.isEmpty || url.pathExtension.isEmpty {
        startPath.append("/index.html")
      } else if stringToLoad.starts(with: CAPBridge.CAP_FILE_START) {
        startPath = stringToLoad.replacingOccurrences(of: CAPBridge.CAP_FILE_START, with: "")
      } else {
        startPath.append(stringToLoad)
      }
      let localUrl = URL.init(string: url.absoluteString)!
      let fileUrl = URL.init(fileURLWithPath: startPath)

      do {
        var data = Data()
        if !stringToLoad.contains("cordova.js") {
          data = try Data(contentsOf: fileUrl)
        }
        let mimeType = mimeTypeForExtension(pathExtension: url.pathExtension)
        let expectedContentLength = data.count
        let headers =  [
          "Content-Type": mimeType,
          "Cache-Control": "no-cache"
        ]
        let urlResponse = URLResponse(url: localUrl, mimeType: mimeType, expectedContentLength: expectedContentLength, textEncodingName: nil)
        let httpResponse = HTTPURLResponse(url: localUrl, statusCode: 200, httpVersion: nil, headerFields: headers)
        if isMediaExtension(pathExtension: url.pathExtension) {
            urlSchemeTask.didReceive(urlResponse)
        } else {
            urlSchemeTask.didReceive(httpResponse!)
        }
        urlSchemeTask.didReceive(data)
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
