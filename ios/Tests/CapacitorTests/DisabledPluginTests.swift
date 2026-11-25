import XCTest
@testable import Capacitor

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

    // An enabled but disabled CapacitorHttp must not be patched in, or fetch would call a plugin that isn't there.
    func testDisabledWinsOverEnabledForPatching() {
        let source = handler.contentController.userScripts.map(\.source).joined()

        XCTAssertTrue(source.contains("httpEnabled: false"))
        XCTAssertTrue(source.contains("cookiesEnabled: false"))
    }
}
