import WebKit
import XCTest

@testable import Capacitor

private class StubSchemeTask: NSObject, WKURLSchemeTask {
    let request: URLRequest
    private(set) var response: URLResponse?
    private(set) var body = Data()
    private(set) var failure: Error?

    init(url: String) {
        self.request = URLRequest(url: URL(string: url)!)
        super.init()
    }

    func didReceive(_ response: URLResponse) { self.response = response }
    func didReceive(_ data: Data) { body.append(data) }
    func didFinish() {}
    func didFailWithError(_ error: Error) { failure = error }
}

// `URL.path` decodes %2F, so the web view's own dot-segment removal does not apply to an encoded
// traversal. The handler must not let it leave the app's base path.
class BasePathTraversalTests: XCTestCase {
    private var root: URL!
    private var handler: WebViewAssetHandler!
    private let webView = WKWebView()

    override func setUpWithError() throws {
        root = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString)
        let publicDir = root.appendingPathComponent("public")
        try FileManager.default.createDirectory(at: publicDir.appendingPathComponent("sub"), withIntermediateDirectories: true)
        try "app".write(to: publicDir.appendingPathComponent("index.html"), atomically: true, encoding: .utf8)
        try "secret".write(to: root.appendingPathComponent("secret.txt"), atomically: true, encoding: .utf8)
        handler = WebViewAssetHandler(router: CapacitorRouter())
        handler.setAssetPath(publicDir.path)
    }

    override func tearDownWithError() throws {
        try? FileManager.default.removeItem(at: root)
    }

    private func load(_ path: String) -> StubSchemeTask {
        let task = StubSchemeTask(url: "capacitor://localhost\(path)")
        handler.webView(webView, start: task)
        return task
    }

    func testServesAppAsset() {
        let task = load("/index.html")
        XCTAssertNil(task.failure)
        XCTAssertEqual(String(data: task.body, encoding: .utf8), "app")
    }

    func testRefusesEncodedTraversalOutOfBasePath() {
        let task = load("/..%2Fsecret.txt")
        XCTAssertNotNil(task.failure)
        XCTAssertTrue(task.body.isEmpty)
    }

    func testRefusesEncodedTraversalInsideASubpath() {
        let task = load("/sub%2F..%2F..%2Fsecret.txt")
        XCTAssertNotNil(task.failure)
        XCTAssertTrue(task.body.isEmpty)
    }

    func testRefusesEncodedDotSegments() {
        let task = load("/%2e%2e%2Fsecret.txt")
        XCTAssertNotNil(task.failure)
        XCTAssertTrue(task.body.isEmpty)
    }
}
