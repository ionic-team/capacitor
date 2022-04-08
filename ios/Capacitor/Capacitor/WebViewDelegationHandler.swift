import Foundation
import WebKit
import MobileCoreServices

// adopting a public protocol in an internal class is by design
// swiftlint:disable lower_acl_than_parent
@objc(CAPWebViewDelegationHandler)
open class WebViewDelegationHandler: NSObject, WKNavigationDelegate, WKUIDelegate, WKScriptMessageHandler, UIScrollViewDelegate, WKDownloadDelegate,
                                     UIDocumentPickerDelegate {
    public internal(set) weak var bridge: CapacitorBridge?
    open fileprivate(set) var contentController = WKUserContentController()
    enum WebViewLoadingState {
        case unloaded
        case initialLoad(isOpaque: Bool)
        case subsequentLoad
    }

    fileprivate(set) var webViewLoadingState = WebViewLoadingState.unloaded

    private let handlerName = "bridge"

    struct PendingDownload {
        let pathSelectionCallback: ((URL?) -> Void)
        let proposedFileName: String
        let downloadId: Int
    }
    private var pendingDownload: PendingDownload?

    override public init() {
        super.init()
        contentController.add(self, name: handlerName)
    }

    open func cleanUp() {
        contentController.removeScriptMessageHandler(forName: handlerName)
    }

    open func willLoadWebview(_ webView: WKWebView?) {
        // Set the webview to be not opaque on the inital load. This prevents
        // the webview from showing a white background, which is its default
        // loading display, as that can appear as a screen flash. The opacity
        // might have been set by something else, like a plugin, so we want
        // to save the current value so it can be reset on success or failure.
        if let webView = webView, case .unloaded = webViewLoadingState {
            webViewLoadingState = .initialLoad(isOpaque: webView.isOpaque)
            webView.isOpaque = false
        }
    }

    // MARK: - WKNavigationDelegate

    // The force unwrap is part of the protocol declaration, so we should keep it.
    // swiftlint:disable:next implicitly_unwrapped_optional
    open func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation!) {
        // Reset the bridge on each navigation
        bridge?.reset()
    }

    // TODO: remove once Xcode 12 support is dropped
    #if compiler(>=5.5)
    @available(iOS 15, *)
    open func webView(
        _ webView: WKWebView,
        requestMediaCapturePermissionFor origin: WKSecurityOrigin,
        initiatedByFrame frame: WKFrameInfo,
        type: WKMediaCaptureType,
        decisionHandler: @escaping (WKPermissionDecision) -> Void
    ) {
        decisionHandler(.grant)
    }
    #endif

    open func webView(_ webView: WKWebView,
                      requestDeviceOrientationAndMotionPermissionFor origin: WKSecurityOrigin,
                      initiatedByFrame frame: WKFrameInfo,
                      decisionHandler: @escaping (WKPermissionDecision) -> Void) {
        decisionHandler(.grant)
    }

    open func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        // post a notification for any listeners
        NotificationCenter.default.post(name: .capacitorDecidePolicyForNavigationAction, object: navigationAction)

        // check if we can detect file download on iOS >= 14.5
        if #available(iOS 14.5, *) {
            if navigationAction.shouldPerformDownload {
                decisionHandler(.download)
                return
            }
        }

        // sanity check, these shouldn't ever be nil in practice
        guard let bridge = bridge, let navURL = navigationAction.request.url else {
            decisionHandler(.allow)
            return
        }

        // first, give plugins the chance to handle the decision
        for pluginObject in bridge.plugins {
            let plugin = pluginObject.value
            let selector = NSSelectorFromString("shouldOverrideLoad:")
            if plugin.responds(to: selector) {
                let shouldOverrideLoad = plugin.shouldOverrideLoad(navigationAction)
                if shouldOverrideLoad != nil {
                    if shouldOverrideLoad == true {
                        decisionHandler(.cancel)
                        return
                    } else if shouldOverrideLoad == false {
                        decisionHandler(.allow)
                        return
                    }
                }
            }
        }

        // next, check if this is covered by the allowedNavigation configuration
        if let host = navURL.host, bridge.config.shouldAllowNavigation(to: host) {
            decisionHandler(.allow)
            return
        }

        // otherwise, is this a new window or a main frame navigation but to an outside source
        let toplevelNavigation = (navigationAction.targetFrame == nil || navigationAction.targetFrame?.isMainFrame == true)

        // Check if the url being navigated to is configured as an application url (whether local or remote)
        let isApplicationNavigation = navURL.absoluteString.starts(with: bridge.config.serverURL.absoluteString) ||
            navURL.absoluteString.starts(with: bridge.config.localURL.absoluteString)

        if !isApplicationNavigation, toplevelNavigation {
            // disallow and let the system handle it
            if UIApplication.shared.applicationState == .active {
                UIApplication.shared.open(navURL, options: [:], completionHandler: nil)
            }
            decisionHandler(.cancel)
            return
        }

        // fallthrough to allowing it
        decisionHandler(.allow)
    }

    // The force unwrap is part of the protocol declaration, so we should keep it.
    // swiftlint:disable:next implicitly_unwrapped_optional
    open func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        if case .initialLoad(let isOpaque) = webViewLoadingState {
            webView.isOpaque = isOpaque
            webViewLoadingState = .subsequentLoad
        }
        CAPLog.print("⚡️  WebView loaded")
    }

    // The force unwrap is part of the protocol declaration, so we should keep it.
    // swiftlint:disable:next implicitly_unwrapped_optional
    open func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        if case .initialLoad(let isOpaque) = webViewLoadingState {
            webView.isOpaque = isOpaque
            webViewLoadingState = .subsequentLoad
        }

        if let errorURL = bridge?.config.errorPathURL {
            webView.load(URLRequest(url: errorURL))
        }

        CAPLog.print("⚡️  WebView failed to load")
        CAPLog.print("⚡️  Error: " + error.localizedDescription)
    }

    // The force unwrap is part of the protocol declaration, so we should keep it.
    // swiftlint:disable:next implicitly_unwrapped_optional
    open func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        if let errorURL = bridge?.config.errorPathURL {
            webView.load(URLRequest(url: errorURL))
        }

        CAPLog.print("⚡️  WebView failed provisional navigation")
        CAPLog.print("⚡️  Error: " + error.localizedDescription)
    }

    // Make sure we do handle file downloads if webview can display it
    public func webView(_ webView: WKWebView, decidePolicyFor navigationResponse: WKNavigationResponse, decisionHandler: @escaping (WKNavigationResponsePolicy) -> Void) {
        // Check if webview can properly display the file
        if navigationResponse.canShowMIMEType {
            let isBlob = navigationResponse.response.url?.absoluteString.starts(with: "blob:") ?? false
            guard #available(iOS 14.5, *), isBlob else {
                decisionHandler(.allow)
                return
            }
        }
        // Download support for iOS >= 14.5
        if #available(iOS 14.5, *) {
            decisionHandler(.download)
            return
        }
        // Deny if not recognize until now and webView can not
        // show the specified MIME type
        decisionHandler(.cancel)
    }

    open func webViewWebContentProcessDidTerminate(_ webView: WKWebView) {
        CAPLog.print("⚡️  WebView process terminated")
        bridge?.reset()
        webView.reload()
    }

    // MARK: - WKScriptMessageHandler

    open func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard let bridge = bridge else {
            return
        }

        let body = message.body
        if let dict = body as? [String: Any] {
            let type = dict["type"] as? String ?? ""

            if type == "js.error" {
                if let error = dict["error"] as? [String: Any] {
                    logJSError(error)
                }
            } else if type == "message" {
                let pluginId = dict["pluginId"] as? String ?? ""
                let method = dict["methodName"] as? String ?? ""
                let callbackId = dict["callbackId"] as? String ?? ""

                let options = dict["options"] as? [String: Any] ?? [:]

                if pluginId != "Console" {
                    CAPLog.print("⚡️  To Native -> ", pluginId, method, callbackId)
                }

                bridge.handleJSCall(call: JSCall(options: options, pluginId: pluginId, method: method, callbackId: callbackId))
            } else if type == "cordova" {
                let pluginId = dict["service"] as? String ?? ""
                let method = dict["action"] as? String ?? ""
                let callbackId = dict["callbackId"] as? String ?? ""

                let args = dict["actionArgs"] as? Array ?? []
                let options = ["options": args]

                CAPLog.print("To Native Cordova -> ", pluginId, method, callbackId, options)

                bridge.handleCordovaJSCall(call: JSCall(options: options, pluginId: pluginId, method: method, callbackId: callbackId))
            }
        }
    }

    // MARK: - WKUIDelegate

    open func webView(_ webView: WKWebView, runJavaScriptAlertPanelWithMessage message: String, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping () -> Void) {
        guard var viewController = bridge?.viewController else {
            completionHandler()
            return
        }

        if let presentedVC = viewController.presentedViewController, !presentedVC.isBeingDismissed {
            viewController = presentedVC
        }

        let alertController = UIAlertController(title: nil, message: message, preferredStyle: .alert)

        alertController.addAction(UIAlertAction(title: "Ok", style: .default, handler: { (_) in
            completionHandler()
        }))

        viewController.present(alertController, animated: true, completion: nil)
    }

    open func webView(_ webView: WKWebView, runJavaScriptConfirmPanelWithMessage message: String, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping (Bool) -> Void) {
        guard let viewController = bridge?.viewController else {
            return
        }

        let alertController = UIAlertController(title: nil, message: message, preferredStyle: .alert)

        alertController.addAction(UIAlertAction(title: "Cancel", style: .default, handler: { (_) in
            completionHandler(false)
        }))

        alertController.addAction(UIAlertAction(title: "Ok", style: .default, handler: { (_) in
            completionHandler(true)
        }))

        viewController.present(alertController, animated: true, completion: nil)
    }

    open func webView(_ webView: WKWebView, runJavaScriptTextInputPanelWithPrompt prompt: String, defaultText: String?, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping (String?) -> Void) {

        // Check if this is synchronous cookie or http call
        do {
            if let dataFromString = prompt.data(using: .utf8, allowLossyConversion: false) {
                if let payload = try JSONSerialization.jsonObject(with: dataFromString, options: .fragmentsAllowed) as? [String: AnyObject] {
                    let type = payload["type"] as? String

                    if type == "CapacitorCookies.get" {
                        completionHandler(CapacitorCookieManager(bridge!.config).getCookies())
                        // Don't present prompt
                        return
                    } else if type == "CapacitorCookies.set" {
                        // swiftlint:disable force_cast
                        let action = payload["action"] as! String
                        let domain = payload["domain"] as! String
                        CapacitorCookieManager(bridge!.config).setCookie(domain, action)
                        completionHandler("")
                        // swiftlint:enable force_cast
                        // Don't present prompt
                        return
                    } else if type == "CapacitorCookies.isEnabled" {
                        let pluginConfig = bridge!.config.getPluginConfig("CapacitorCookies")
                        completionHandler(String(pluginConfig.getBoolean("enabled", false)))
                        // Don't present prompt
                        return
                    } else if type == "CapacitorHttp" {
                        let pluginConfig = bridge!.config.getPluginConfig("CapacitorHttp")
                        completionHandler(String(pluginConfig.getBoolean("enabled", false)))
                        // Don't present prompt
                        return
                    }
                }
            }
        } catch {
            // Continue with regular prompt
        }

        guard let viewController = bridge?.viewController else {
            return
        }

        let alertController = UIAlertController(title: nil, message: prompt, preferredStyle: .alert)

        alertController.addTextField { (textField) in
            textField.text = defaultText
        }

        alertController.addAction(UIAlertAction(title: "Cancel", style: .default, handler: { (_) in
            completionHandler(nil)
        }))

        alertController.addAction(UIAlertAction(title: "Ok", style: .default, handler: { (_) in
            if let text = alertController.textFields?.first?.text {
                completionHandler(text)
            } else {
                completionHandler(defaultText)
            }
        }))

        viewController.present(alertController, animated: true, completion: nil)
    }

    open func webView(_ webView: WKWebView, createWebViewWith configuration: WKWebViewConfiguration, for navigationAction: WKNavigationAction, windowFeatures: WKWindowFeatures) -> WKWebView? {
        if let url = navigationAction.request.url {
            UIApplication.shared.open(url, options: [:], completionHandler: nil)
        }
        return nil
    }

    // MARK: - WKDownloadDelegate

    @available(iOS 14.5, *)
    public func download(_ download: WKDownload, decideDestinationUsing response: URLResponse, suggestedFilename: String, completionHandler: @escaping (URL?) -> Void) {
        // Add pending download
        self.pendingDownload = PendingDownload(pathSelectionCallback: completionHandler,
                                               proposedFileName: suggestedFilename,
                                               downloadId: download.hash)

        // Ask for document selection (it will cal the completion handler)
        let documentPicker = UIDocumentPickerViewController(documentTypes: [String(kUTTypeFolder)], in: .open)
        documentPicker.delegate = self
        bridge?.viewController?.present(documentPicker, animated: true)
    }
    @available(iOS 14.5, *)
    public func downloadDidFinish(_ download: WKDownload) {
        CAPLog.print("⚡️  Download finished")
        // notify
        NotificationCenter.default.post(name: .capacitorDidReceiveFileDownloadUpdate, object: [
            "id": String(download.hash),
            "status": FileDownloadNotificationStatus.completed
        ])
    }
    @available(iOS 14.5, *)
    public func download(_ download: WKDownload, didFailWithError error: Error, resumeData: Data?) {
        CAPLog.print("⚡️  Download failed")
        CAPLog.print("⚡️  Error: " + error.localizedDescription)
        // notify
        NotificationCenter.default.post(name: .capacitorDidReceiveFileDownloadUpdate, object: [
            "id": String(download.hash),
            "error": error.localizedDescription,
            "status": FileDownloadNotificationStatus.failed
        ])
    }

    // MARK: - UIDocumentPickerDelegate

    func documentPickerWasCancelled(_ controller: UIDocumentPickerViewController) {
        guard self.pendingDownload == nil else {
            // cancel download
            self.pendingDownload?.pathSelectionCallback(nil)
            // empty refs
            self.pendingDownload = nil
            return
        }
    }

    func documentPicker(_ controller: UIDocumentPickerViewController, didPickDocumentAt url: URL) {
        if let pendingDownload = self.pendingDownload {
            // Generate unique file name on the choosen directory
            let fileName: URL = self.getUniqueDownloadFileURL(url, suggestedFilename: pendingDownload.proposedFileName, optionalSuffix: nil)
            pendingDownload.pathSelectionCallback(fileName)
            // Notify
            NotificationCenter.default.post(name: .capacitorDidReceiveFileDownloadUpdate, object: [
                "id": String(pendingDownload.downloadId), "status": FileDownloadNotificationStatus.started
            ])
            // empty refs
            self.pendingDownload = nil
            return
        }
    }

    // MARK: - UIScrollViewDelegate

    // disable zooming in WKWebView ScrollView
    open func scrollViewWillBeginZooming(_ scrollView: UIScrollView, with view: UIView?) {
        scrollView.pinchGestureRecognizer?.isEnabled = false
    }

    // MARK: - Private

    private func logJSError(_ error: [String: Any]) {
        let message = error["message"] ?? "No message"
        let url = error["url"] as? String ?? ""
        let line = error["line"] ?? ""
        let col = error["col"] ?? ""
        var filename = ""
        if let filenameIndex = url.range(of: "/", options: .backwards)?.lowerBound {
            let index = url.index(after: filenameIndex)
            filename = String(url[index...])
        }

        CAPLog.print("\n⚡️  ------ STARTUP JS ERROR ------\n")
        CAPLog.print("⚡️  \(message)")
        CAPLog.print("⚡️  URL: \(url)")
        CAPLog.print("⚡️  \(filename):\(line):\(col)")
        CAPLog.print("\n⚡️  See above for help with debugging blank-screen issues")
    }

    private func getUniqueDownloadFileURL(_ documentsFolderURL: URL, suggestedFilename: String, optionalSuffix: Int?) -> URL {
        var suffix = ""
        if let optionalSuffix = optionalSuffix { suffix = String(optionalSuffix) }
        var fileComps = suggestedFilename.split(separator: ".")
        var fileName = ""
        if fileComps.count > 1 {
            let fileExtension = "." + String(fileComps.popLast() ?? "")
            fileName = fileComps.joined(separator: ".") + suffix + fileExtension
        } else {
            fileName = suggestedFilename + suffix
        }
        // Check if file with generated name exists
        let documentURL = documentsFolderURL.appendingPathComponent(fileName, isDirectory: false)
        if fileName == "" || FileManager.default.fileExists(atPath: documentURL.path) {
            var randSuffix = 1
            if let optionalSuffix = optionalSuffix { randSuffix = optionalSuffix + 1; }
            return self.getUniqueDownloadFileURL(documentsFolderURL, suggestedFilename: suggestedFilename, optionalSuffix: randSuffix)
        }
        return documentURL
    }
}
