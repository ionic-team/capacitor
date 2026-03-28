import Foundation
import WebKit

/// URL Scheme Handler for intercepting and serving Capacitor blob URLs
@available(iOS 11.0, *)
@objc public class CAPBlobURLSchemeHandler: NSObject, WKURLSchemeHandler {

    // MARK: - WKURLSchemeHandler

    public func webView(_ webView: WKWebView, start urlSchemeTask: WKURLSchemeTask) {
        guard let url = urlSchemeTask.request.url else {
            urlSchemeTask.didFailWithError(NSError(
                domain: "CAPBlobURLSchemeHandler",
                code: -1,
                userInfo: [NSLocalizedDescriptionKey: "Invalid URL"]
            ))
            return
        }

        // Convert blob:capacitor://uuid to the format our BlobStore expects
        let blobUrl = url.absoluteString

        guard let (data, mimeType) = CAPBlobStore.shared.retrieve(blobUrl: blobUrl) else {
            CAPLog.print("⚠️  BlobURLSchemeHandler: Blob not found for \(blobUrl)")
            urlSchemeTask.didFailWithError(NSError(
                domain: "CAPBlobURLSchemeHandler",
                code: 404,
                userInfo: [NSLocalizedDescriptionKey: "Blob not found"]
            ))
            return
        }

        // Create HTTP response
        let response = URLResponse(
            url: url,
            mimeType: mimeType,
            expectedContentLength: data.count,
            textEncodingName: nil
        )

        urlSchemeTask.didReceive(response)
        urlSchemeTask.didReceive(data)
        urlSchemeTask.didFinish()

        CAPLog.print("✅ BlobURLSchemeHandler: Served \(data.count) bytes for \(blobUrl)")
    }

    public func webView(_ webView: WKWebView, stop urlSchemeTask: WKURLSchemeTask) {
        // Request was cancelled, nothing to clean up
    }
}
