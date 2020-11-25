import XCTest
@testable import Capacitor

class MockBridgeViewController: CAPBridgeViewController {
}

class MockBridgeMessageHandler: CAPMessageHandlerWrapper {
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
        bridge = MockBridge(with: InstanceConfiguration(with: descriptor), delegate: MockBridgeViewController(), cordovaConfiguration: descriptor.cordovaConfiguration, messageHandler: MockBridgeMessageHandler())
    }

    override func tearDown() {
        // Put teardown code here. This method is called after the invocation of each test method in the class.
        super.tearDown()
    }
}
