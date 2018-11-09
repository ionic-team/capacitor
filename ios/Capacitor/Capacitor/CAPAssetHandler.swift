import Foundation

@available(iOS 11.0, *)
class CAPAssetHandler: NSObject, WKURLSchemeHandler {
    
    func webView(_ webView: WKWebView, start urlSchemeTask: WKURLSchemeTask) {
        var startPath = ""
        var stringToLoad = urlSchemeTask.request.url!.absoluteString
        let scheme = urlSchemeTask.request.url?.scheme
        if scheme == "capacitor" {
            startPath = Bundle.main.path(forResource: "public", ofType: nil)!
            stringToLoad = stringToLoad.replacingOccurrences(of: "capacitor://localhost/", with: "")
            if stringToLoad.isEmpty {
                startPath.append("/index.html")
            } else {
                startPath.append("/\(stringToLoad)")
            }
        } else {
            stringToLoad = stringToLoad.replacingOccurrences(of: "\(scheme!)://", with: "")
            if !stringToLoad.isEmpty {
                startPath = stringToLoad
            }
        }

        let localUrl = URL.init(string: "https://localhost:8080/")!
        let fileUrl = URL.init(fileURLWithPath: startPath)
        var mimeType = "text/html"
        var expectedContentLength = -1

        do {
            var data = Data()
            if !stringToLoad.contains("cordova.js") {
                data = try Data(contentsOf: fileUrl)
            }
            if stringToLoad.contains(".mp4") {
                mimeType = "video/mp4"
                expectedContentLength = data.count
            }
            let urlResponse = URLResponse(url: localUrl, mimeType: mimeType,
                                          expectedContentLength: expectedContentLength, textEncodingName: nil)
            urlSchemeTask.didReceive(urlResponse)
            urlSchemeTask.didReceive(data)
        } catch {
            print("error getting data")
        }
        urlSchemeTask.didFinish()
    }

    func webView(_ webView: WKWebView, stop urlSchemeTask: WKURLSchemeTask) {
        print("scheme stop")
    }
}
