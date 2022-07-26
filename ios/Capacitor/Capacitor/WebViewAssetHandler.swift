import Foundation
import MobileCoreServices

@objc(CAPWebViewAssetHandler)
internal class WebViewAssetHandler: NSObject, WKURLSchemeHandler {
    private var router: Router

    init(router: Router) {
        self.router = router
        super.init()
    }

    func setAssetPath(_ assetPath: String) {
        router.basePath = assetPath
    }

    func webView(_ webView: WKWebView, start urlSchemeTask: WKURLSchemeTask) {
        let startPath: String
        let url = urlSchemeTask.request.url!
        let stringToLoad = url.path

        if stringToLoad.starts(with: CapacitorBridge.fileStartIdentifier) {
            startPath = stringToLoad.replacingOccurrences(of: CapacitorBridge.fileStartIdentifier, with: "")
        } else {
            startPath = router.route(for: stringToLoad)
        }

        let localUrl = URL.init(string: url.absoluteString)!
        let fileUrl = URL.init(fileURLWithPath: startPath)

        do {
            var data = Data()
            let mimeType = mimeTypeForExtension(pathExtension: url.pathExtension)
            var headers =  [
                "Content-Type": mimeType,
                "Cache-Control": "no-cache"
            ]
            if let rangeString = urlSchemeTask.request.value(forHTTPHeaderField: "Range"),
               let totalSize = try fileUrl.resourceValues(forKeys: [.fileSizeKey]).fileSize,
               isMediaExtension(pathExtension: url.pathExtension) {
                let fileHandle = try FileHandle(forReadingFrom: fileUrl)
                let parts = rangeString.components(separatedBy: "=")
                let streamParts = parts[1].components(separatedBy: "-")
                let fromRange = Int(streamParts[0]) ?? 0
                var toRange = totalSize - 1
                if streamParts.count > 1 {
                    toRange = Int(streamParts[1]) ?? toRange
                }
                let rangeLength = toRange - fromRange + 1
                try fileHandle.seek(toOffset: UInt64(fromRange))
                data = fileHandle.readData(ofLength: rangeLength)
                headers["Accept-Ranges"] = "bytes"
                headers["Content-Range"] = "bytes \(fromRange)-\(toRange)/\(totalSize)"
                headers["Content-Length"] = String(data.count)
                let response = HTTPURLResponse(url: localUrl, statusCode: 206, httpVersion: nil, headerFields: headers)
                urlSchemeTask.didReceive(response!)
                try fileHandle.close()
            } else {
                if !stringToLoad.contains("cordova.js") {
                    if isMediaExtension(pathExtension: url.pathExtension) {
                        data = try Data(contentsOf: fileUrl, options: Data.ReadingOptions.mappedIfSafe)
                    } else {
                        data = try Data(contentsOf: fileUrl)
                    }
                }
                let urlResponse = URLResponse(url: localUrl, mimeType: mimeType, expectedContentLength: data.count, textEncodingName: nil)
                let httpResponse = HTTPURLResponse(url: localUrl, statusCode: 200, httpVersion: nil, headerFields: headers)
                if isMediaExtension(pathExtension: url.pathExtension) {
                    urlSchemeTask.didReceive(urlResponse)
                } else {
                    urlSchemeTask.didReceive(httpResponse!)
                }
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
