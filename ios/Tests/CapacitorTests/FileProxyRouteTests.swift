import WebKit
import XCTest

@testable import Capacitor

private class StubNavigationAction: WKNavigationAction {
    private let stubbedRequest: URLRequest
    private let stubbedTargetFrame: WKFrameInfo?
    init(url: String, subframe: Bool) {
        self.stubbedRequest = URLRequest(url: URL(string: url)!)
        self.stubbedTargetFrame = subframe ? StubFrameInfo.subframe : nil
        super.init()
    }
    override var request: URLRequest { stubbedRequest }
    override var targetFrame: WKFrameInfo? { stubbedTargetFrame }
}

private class StubSchemeTask: NSObject, WKURLSchemeTask {
    let request: URLRequest
    private(set) var response: URLResponse?
    private(set) var finished = false
    private(set) var failure: Error?

    init(url: String) {
        self.request = URLRequest(url: URL(string: url)!)
        super.init()
    }

    func didReceive(_ response: URLResponse) { self.response = response }
    func didReceive(_ data: Data) {}
    func didFinish() { finished = true }
    func didFailWithError(_ error: Error) { failure = error }
}

// The file route is served at the app's origin, so a document loaded through it would run with the
// app's privileges. Navigation to it is blocked, and its responses are kept inert.
class FileProxyRouteTests: XCTestCase {
    private var bridge: MockBridge!
    private var handler: WebViewDelegationHandler!
    private let webView = WKWebView()
    private let fileURL = "capacitor://localhost\(CapacitorBridge.fileStartIdentifier)/tmp/poc.html"

    override func setUp() {
        super.setUp()
        handler = WebViewDelegationHandler()
        bridge = MockBridge(
            with: InstanceConfiguration(with: InstanceDescriptor(), isDebug: true),
            delegate: MockBridgeViewController(),
            assetHandler: MockAssetHandler(router: CapacitorRouter()),
            delegationHandler: handler
        )
    }

    private func policy(for url: String, subframe: Bool) -> WKNavigationActionPolicy {
        var decision: WKNavigationActionPolicy?
        handler.webView(webView, decidePolicyFor: StubNavigationAction(url: url, subframe: subframe)) { decision = $0 }
        return decision!
    }

    func testIsInternalProxyPath() {
        XCTAssertTrue(CapacitorBridge.isInternalProxyPath("/_capacitor_file_/tmp/a.html"))
        XCTAssertTrue(CapacitorBridge.isInternalProxyPath("/_capacitor_http_interceptor_"))
        XCTAssertFalse(CapacitorBridge.isInternalProxyPath("/index.html"))
        XCTAssertFalse(CapacitorBridge.isInternalProxyPath("/assets/_capacitor_file_/a.html"))
    }

    func testBlocksNavigationToFileRoute() {
        XCTAssertEqual(policy(for: fileURL, subframe: false), .cancel)
    }

    // A same-origin iframe gets the bridge, so subframes must be blocked too.
    func testBlocksSubframeNavigationToFileRoute() {
        XCTAssertEqual(policy(for: fileURL, subframe: true), .cancel)
    }

    func testAllowsInAppNavigation() {
        XCTAssertEqual(policy(for: "capacitor://localhost/index.html", subframe: false), .allow)
        XCTAssertEqual(policy(for: "capacitor://localhost/index.html", subframe: true), .allow)
    }

    func testFileRouteResponseIsSandboxed() throws {
        let dir = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString)
        try FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        defer { try? FileManager.default.removeItem(at: dir) }
        let file = dir.appendingPathComponent("page.html")
        try "<html></html>".write(to: file, atomically: true, encoding: .utf8)

        let task = StubSchemeTask(url: "capacitor://localhost\(CapacitorBridge.fileStartIdentifier)\(file.path)")
        WebViewAssetHandler(router: CapacitorRouter()).webView(webView, start: task)

        let response = try XCTUnwrap(task.response as? HTTPURLResponse)
        XCTAssertEqual(response.statusCode, 200)
        XCTAssertEqual(response.value(forHTTPHeaderField: "Content-Security-Policy"), "sandbox; frame-ancestors 'none'")
    }

    func testAppAssetResponseIsNotSandboxed() throws {
        let dir = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString)
        try FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        defer { try? FileManager.default.removeItem(at: dir) }
        try "<html></html>".write(to: dir.appendingPathComponent("index.html"), atomically: true, encoding: .utf8)

        let assetHandler = WebViewAssetHandler(router: CapacitorRouter())
        assetHandler.setAssetPath(dir.path)
        let task = StubSchemeTask(url: "capacitor://localhost/index.html")
        assetHandler.webView(webView, start: task)

        let response = try XCTUnwrap(task.response as? HTTPURLResponse)
        XCTAssertEqual(response.statusCode, 200)
        XCTAssertNil(response.value(forHTTPHeaderField: "Content-Security-Policy"))
    }
}
