import XCTest
@testable import Capacitor

class SpySystemBarsPlugin: CAPSystemBarsPlugin {
    var notifiedEvents: [String] = []

    override func notifyListeners(_ eventName: String, data: [String: Any]?) {
        notifiedEvents.append(eventName)
    }
}

class SystemBarsTests: XCTestCase {
    private func makePlugin() -> SpySystemBarsPlugin {
        let descriptor = InstanceDescriptor.init()
        let bridge = MockBridge(
            with: InstanceConfiguration(with: descriptor, isDebug: true),
            delegate: MockBridgeViewController(),
            cordovaConfiguration: descriptor.cordovaConfiguration,
            assetHandler: MockAssetHandler(router: CapacitorRouter()),
            delegationHandler: MockDelegationHandler()
        )
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
}
