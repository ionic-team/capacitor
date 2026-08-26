import Foundation
import WebKit

/// URL Scheme Handler for intercepting and serving Capacitor blob URLs.
///
/// `blob` is a reserved WebKit scheme, so this handler is registered for `capacitorblob`.
@available(iOS 11.0, *)
@objc public class CAPBlobURLSchemeHandler: NSObject, WKURLSchemeHandler {

    /// The URL scheme this handler serves (`capacitorblob`).
    @objc public static let scheme = CAPBlobStore.scheme

    /// Register a CAPBlobURLSchemeHandler on the given WKWebViewConfiguration.
    ///
    /// Call this during WKWebView setup:
    ///
    ///     CAPBlobURLSchemeHandler.register(with: configuration)
    @objc public static func register(with configuration: WKWebViewConfiguration) {
        configuration.setURLSchemeHandler(CAPBlobURLSchemeHandler(), forURLScheme: CAPBlobURLSchemeHandler.scheme)
    }

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
