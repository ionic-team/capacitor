import Foundation

@available(iOS 11.0, *)
class CAPAssetHandler: NSObject, WKURLSchemeHandler {
    
    func webView(_ webView: WKWebView, start urlSchemeTask: WKURLSchemeTask) {
        var startPath = ""
        let url = urlSchemeTask.request.url!
        let stringToLoad = url.path
        let scheme = url.scheme

        if scheme == "capacitor" {
            startPath = Bundle.main.path(forResource: "public", ofType: nil)!
            if stringToLoad.isEmpty || url.pathExtension.isEmpty {
                startPath.append("/index.html")
            } else {
                startPath.append(stringToLoad)
            }
        } else {
            if !stringToLoad.isEmpty {
                startPath = stringToLoad
            }
        }

        let localUrl = URL.init(string: url.absoluteString)!
        let fileUrl = URL.init(fileURLWithPath: startPath)
        var mimeType = "text/html"
        var expectedContentLength = -1

        do {
            var data = Data()
            if !stringToLoad.contains("cordova.js") {
                data = try Data(contentsOf: fileUrl)
            }
            if url.pathExtension == "mp4" {
                mimeType = "video/mp4"
            }
            if url.pathExtension == "svg" {
                mimeType = "image/svg+xml"
            }
            expectedContentLength = data.count
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
