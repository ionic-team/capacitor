import Foundation
import WebKit

// adopting a public protocol in an internal class is by design
// swiftlint:disable lower_acl_than_parent
@objc(CAPWebViewDelegationHandler)
internal class WebViewDelegationHandler: NSObject, WKNavigationDelegate, WKUIDelegate, WKScriptMessageHandler {
    weak var bridge: CapacitorBridge?
    fileprivate(set) var contentController = WKUserContentController()
    enum WebViewLoadingState {
        case unloaded
        case initialLoad(isOpaque: Bool)
        case subsequentLoad
    }
    fileprivate(set) var webViewLoadingState = WebViewLoadingState.unloaded

    private let handlerName = "bridge"

    init(bridge: CapacitorBridge? = nil) {
        super.init()
        self.bridge = bridge
        contentController.add(self, name: handlerName)
    }

    func cleanUp() {
        contentController.removeScriptMessageHandler(forName: handlerName)
    }

    func willLoadWebview(_ webView: WKWebView?) {
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
    public func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation!) {
        // Reset the bridge on each navigation
        bridge?.reset()
    }

    public func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        // post a notification for any listeners
        NotificationCenter.default.post(name: .capacitorDecidePolicyForNavigationAction, object: navigationAction)

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
        if navURL.absoluteString.contains(bridge.config.serverURL.absoluteString) == false, toplevelNavigation {
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
    public func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        if case .initialLoad(let isOpaque) = webViewLoadingState {
            webView.isOpaque = isOpaque
            webViewLoadingState = .subsequentLoad
        }
        CAPLog.print("⚡️  WebView loaded")
    }

    // The force unwrap is part of the protocol declaration, so we should keep it.
    // swiftlint:disable:next implicitly_unwrapped_optional
    public func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        if case .initialLoad(let isOpaque) = webViewLoadingState {
            webView.isOpaque = isOpaque
            webViewLoadingState = .subsequentLoad
        }
        CAPLog.print("⚡️  WebView failed to load")
        CAPLog.print("⚡️  Error: " + error.localizedDescription)
    }

    // The force unwrap is part of the protocol declaration, so we should keep it.
    // swiftlint:disable:next implicitly_unwrapped_optional
    public func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        CAPLog.print("⚡️  WebView failed provisional navigation")
        CAPLog.print("⚡️  Error: " + error.localizedDescription)
    }

    // MARK: - WKScriptMessageHandler

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
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

    public func webView(_ webView: WKWebView, runJavaScriptAlertPanelWithMessage message: String, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping () -> Void) {
        guard let viewController = bridge?.viewController else {
            return
        }

        let alertController = UIAlertController(title: nil, message: message, preferredStyle: .alert)

        alertController.addAction(UIAlertAction(title: "Ok", style: .default, handler: { (_) in
            completionHandler()
        }))

        viewController.present(alertController, animated: true, completion: nil)
    }

    public func webView(_ webView: WKWebView, runJavaScriptConfirmPanelWithMessage message: String, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping (Bool) -> Void) {
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

    public func webView(_ webView: WKWebView, runJavaScriptTextInputPanelWithPrompt prompt: String, defaultText: String?, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping (String?) -> Void) {
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

    public func webView(_ webView: WKWebView, createWebViewWith configuration: WKWebViewConfiguration, for navigationAction: WKNavigationAction, windowFeatures: WKWindowFeatures) -> WKWebView? {
        if let url = navigationAction.request.url {
            UIApplication.shared.open(url, options: [:], completionHandler: nil)
        }
        return nil
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
}
