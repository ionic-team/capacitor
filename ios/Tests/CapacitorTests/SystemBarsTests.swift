import XCTest
@testable import Capacitor

class SpySystemBarsPlugin: CAPSystemBarsPlugin {
    var notifiedEvents: [String] = []

    override func notifyListeners(_ eventName: String, data: [String: Any]?) {
        notifiedEvents.append(eventName)
    }
}

class SystemBarsTests: XCTestCase {
    private let viewController = MockBridgeViewController()
    private lazy var bridge = MockBridge(
        with: InstanceConfiguration(with: InstanceDescriptor.init(), isDebug: true),
        delegate: viewController,
        assetHandler: MockAssetHandler(router: CapacitorRouter()),
        delegationHandler: MockDelegationHandler()
    )

    private func makePlugin() -> SpySystemBarsPlugin {
        return SpySystemBarsPlugin(bridge: bridge, pluginId: "SystemBars", pluginName: "SystemBars")
    }

    func testStatusBarTapNotifiesStatusTapListeners() {
        let plugin = makePlugin()
        plugin.load()

        NotificationCenter.default.post(name: .capacitorStatusBarTapped, object: nil)

        XCTAssertEqual(plugin.notifiedEvents, ["statusTap"])
    }

    func testDeallocatedPluginStopsObservingStatusBarTaps() {
        weak var weakPlugin: SpySystemBarsPlugin?
        autoreleasepool {
            let plugin = makePlugin()
            plugin.load()
            weakPlugin = plugin
        }

        XCTAssertNil(weakPlugin)
        NotificationCenter.default.post(name: .capacitorStatusBarTapped, object: nil)
    }

    func testStyleFromStatusBarStyle() {
        XCTAssertEqual(CAPSystemBarsPlugin.style(from: .lightContent), .dark)
        XCTAssertEqual(CAPSystemBarsPlugin.style(from: .darkContent), .light)
        XCTAssertEqual(CAPSystemBarsPlugin.style(from: .default), .defaultStyle)
    }

    func testGetStyleReturnsStyleSetBySetStyle() {
        let plugin = makePlugin()
        let resolved = expectation(description: "getStyle resolves")
        var style: String?
        let call: CAPPluginCall = CAPPluginCall(callbackId: "test", methodName: "getStyle", options: [:], success: { result, _ in
            style = result?.data?["style"] as? String
            resolved.fulfill()
        }, error: { _ in })

        plugin.setStyle(style: "DARK")
        plugin.getStyle(call)

        wait(for: [resolved], timeout: 1)
        XCTAssertEqual(style, "DARK")
    }
}
