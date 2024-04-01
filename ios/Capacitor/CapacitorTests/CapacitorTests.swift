import XCTest
@testable import Capacitor

class MockBridgeViewController: CAPBridgeViewController {
}

class MockAssetHandler: WebViewAssetHandler {
}

class MockDelegationHandler: WebViewDelegationHandler {
}

class MockBridge: CapacitorBridge {
    override public func registerPlugins() {
        Swift.print("REGISTER PLUGINS")
    }
}

class CapacitorTests: XCTestCase {
    var bridge: MockBridge?

    override func setUp() {
        super.setUp()
        // Put setup code here. This method is called before the invocation of each test method in the class.
        let descriptor = InstanceDescriptor.init()
        bridge = MockBridge(with: InstanceConfiguration(with: descriptor, isDebug: true), delegate: MockBridgeViewController(), cordovaConfiguration: descriptor.cordovaConfiguration, assetHandler: MockAssetHandler(router: CapacitorRouter()), delegationHandler: MockDelegationHandler())
    }

    override func tearDown() {
        // Put teardown code here. This method is called after the invocation of each test method in the class.
        super.tearDown()
    }
}
