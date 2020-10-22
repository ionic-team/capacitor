import XCTest
@testable import Capacitor

class MockBridgeViewController: CAPBridgeViewController {
}

class MockBridgeMessageHandler: CAPMessageHandlerWrapper {
}

class MockConfig: CAPConfig {
}

class MockBridge: CAPBridge {
    override public func registerPlugins() {
        print("REGISTER PLUGINS")
    }
}
class CapacitorTests: XCTestCase {
    var bridge: MockBridge?
    
    override func setUp() {
        super.setUp()
        // Put setup code here. This method is called before the invocation of each test method in the class.
        bridge = MockBridge(MockBridgeViewController(), MockBridgeMessageHandler(), MockConfig(), MockBridge.defaultScheme)
    }

    override func tearDown() {
        // Put teardown code here. This method is called after the invocation of each test method in the class.
        super.tearDown()
    }

    func testExample() {
        // This is an example of a functional test case.
        // Use XCTAssert and related functions to verify your tests produce the correct results.
    }

    func testPerformanceExample() {
        // This is an example of a performance test case.
        self.measure {
            // Put the code you want to measure the time of here.
        }
    }

}
