import WebKit
import XCTest

@testable import Capacitor

private class StubFrameInfo: WKFrameInfo {
    override var isMainFrame: Bool { false }
}

private class StubNavigationAction: WKNavigationAction {
    private let stubbedRequest: URLRequest
    private let stubbedTargetFrame: WKFrameInfo?
    init(url: String, subframe: Bool = false) {
        self.stubbedRequest = URLRequest(url: URL(string: url)!)
        self.stubbedTargetFrame = subframe ? StubFrameInfo() : nil
        super.init()
    }
    override var request: URLRequest { stubbedRequest }
    override var targetFrame: WKFrameInfo? { stubbedTargetFrame }
}

// The proxy path shares the app's origin, so the origin guard alone would allow it.
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

    // decidePolicyFor also fires for subframes, and a same-origin iframe gets the bridge too.
    func testBlocksSubframeNavigationToInterceptorPath() {
        let interceptorURL = "capacitor://localhost\(CapacitorBridge.httpInterceptorStartIdentifier)?u=https://example.com/payload.html"
        var decision: WKNavigationActionPolicy?
        handler.webView(webView, decidePolicyFor: StubNavigationAction(url: interceptorURL, subframe: true)) { decision = $0 }
        XCTAssertEqual(decision, .cancel)
    }

    func testAllowsInAppNavigation() {
        XCTAssertEqual(policy(for: "capacitor://localhost/index.html"), .allow)
    }
}
