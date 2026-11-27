import WebKit
import XCTest
@testable import Capacitor

private class RecordingSchemeTask: NSObject, WKURLSchemeTask {
    let request: URLRequest
    private(set) var failure: Error?

    init(url: URL) {
        self.request = URLRequest(url: url)
        super.init()
    }

    func didReceive(_ response: URLResponse) {}
    func didReceive(_ data: Data) {}
    func didFinish() {}
    func didFailWithError(_ error: Error) { failure = error }
}

class DisabledPluginTests: XCTestCase {
    private var bridge: MockBridge!
    private var handler: WebViewDelegationHandler!

    override func setUp() {
        super.setUp()
        let descriptor = InstanceDescriptor()
        descriptor.pluginConfigurations = [
            "CapacitorCookies": ["disabled": true],
            "CapacitorHttp": ["enabled": true, "disabled": true]
        ]
        handler = WebViewDelegationHandler()
        bridge = MockBridge(
            with: InstanceConfiguration(with: descriptor, isDebug: true),
            delegate: MockBridgeViewController(),
            assetHandler: MockAssetHandler(router: CapacitorRouter()),
            delegationHandler: handler
        )
    }

    func testDisabledPluginTypeIsNotRegistered() {
        bridge.registerPlugin(CAPCookiesPlugin.self)
        bridge.registerPlugin(CAPWebViewPlugin.self)

        XCTAssertNil(bridge.plugin(withName: "CapacitorCookies"))
        XCTAssertNotNil(bridge.plugin(withName: "WebView"))
    }

    func testDisabledPluginInstanceIsNotRegistered() {
        bridge.registerPluginInstance(CAPCookiesPlugin())

        XCTAssertNil(bridge.plugin(withName: "CapacitorCookies"))
    }

    // Page scripts can also reach a plugin by its class name, which loads it on demand.
    func testDisabledPluginIsNotLoadedByClassName() {
        bridge.handleJSCall(call: JSCall(options: [:], pluginId: "CAPCookiesPlugin", method: "getCookies", callbackId: "1"))
        bridge.handleJSCall(call: JSCall(options: [:], pluginId: "CAPWebViewPlugin", method: "noSuchMethod", callbackId: "2"))

        XCTAssertNil(bridge.plugin(withName: "CapacitorCookies"))
        XCTAssertNotNil(bridge.plugin(withName: "WebView"))
    }

    // disabled wins over enabled for the HTTP interceptor too, so page scripts can't reach it directly.
    func testDisabledHttpPluginIsNotServedByTheInterceptor() throws {
        let assetHandler = WebViewAssetHandler(router: CapacitorRouter())
        assetHandler.setConfiguration(bridge.config)
        let url = try XCTUnwrap(URL(string: "capacitor://localhost\(CapacitorBridge.httpInterceptorStartIdentifier)?u=https%3A%2F%2Fexample.com"))
        let task = RecordingSchemeTask(url: url)

        assetHandler.webView(WKWebView(), start: task)

        XCTAssertEqual((task.failure as? URLError)?.code, .unsupportedURL)
    }

    // An enabled but disabled CapacitorHttp must not be patched in, or fetch would call a plugin that isn't there.
    func testDisabledWinsOverEnabledForPatching() {
        let source = handler.contentController.userScripts.map(\.source).joined()

        XCTAssertTrue(source.contains("httpEnabled: false"))
        XCTAssertTrue(source.contains("cookiesEnabled: false"))
    }
}
