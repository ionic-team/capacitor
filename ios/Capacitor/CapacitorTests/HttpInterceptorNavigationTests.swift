import WebKit
import XCTest

@testable import Capacitor

private class StubNavigationAction: WKNavigationAction {
    private let stubbedRequest: URLRequest
    init(url: String) {
        self.stubbedRequest = URLRequest(url: URL(string: url)!)
        super.init()
    }
    override var request: URLRequest { stubbedRequest }
    override var targetFrame: WKFrameInfo? { nil }
}

// A frame navigation to the internal HTTP proxy path must be blocked. Because the app is served at
// capacitor://localhost, such a URL shares the app's origin, so the origin-based navigation guard
// alone would allow it and render proxied content at the app origin.
class HttpInterceptorNavigationTests: XCTestCase {
    private var bridge: MockBridge!
    private var handler: WebViewDelegationHandler!
    private let webView = WKWebView()

    override func setUp() {
        super.setUp()
        let descriptor = InstanceDescriptor()
        handler = WebViewDelegationHandler()
        bridge = MockBridge(
            with: InstanceConfiguration(with: descriptor, isDebug: true),
            delegate: MockBridgeViewController(),
            cordovaConfiguration: descriptor.cordovaConfiguration,
            assetHandler: MockAssetHandler(router: CapacitorRouter()),
            delegationHandler: handler
        )
    }

    private func policy(for url: String) -> WKNavigationActionPolicy {
        var decision: WKNavigationActionPolicy?
        handler.webView(webView, decidePolicyFor: StubNavigationAction(url: url)) { decision = $0 }
        return decision!
    }

    func testBlocksNavigationToInterceptorPath() {
        let interceptorURL = "capacitor://localhost\(CapacitorBridge.httpInterceptorStartIdentifier)?u=https://example.com/payload.html"
        XCTAssertEqual(policy(for: interceptorURL), .cancel)
    }

    func testAllowsInAppNavigation() {
        XCTAssertEqual(policy(for: "capacitor://localhost/index.html"), .allow)
    }
}
