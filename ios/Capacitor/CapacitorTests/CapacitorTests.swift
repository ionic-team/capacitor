import XCTest
@testable import Capacitor

class MockBridgeViewController: CAPBridgeViewController {
}

class BackgroundColorBridgeViewController: CAPBridgeViewController {
    let descriptor: InstanceDescriptor

    init(descriptor: InstanceDescriptor) {
        self.descriptor = descriptor
        super.init(nibName: nil, bundle: nil)
    }

    required init?(coder: NSCoder) {
        descriptor = InstanceDescriptor.init()
        super.init(coder: coder)
    }

    override func instanceDescriptor() -> InstanceDescriptor {
        return descriptor
    }
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

    func testConfiguredBackgroundCoversStatusBarSafeArea() {
        let descriptor = InstanceDescriptor.init()
        descriptor.backgroundColor = .red
        let controller = BackgroundColorBridgeViewController(descriptor: descriptor)

        controller.loadView()

        let statusBarBackground = controller.statusBarBackgroundView
        XCTAssertEqual(statusBarBackground?.superview, controller.webView)
        XCTAssertEqual(statusBarBackground?.backgroundColor, .red)
        XCTAssertFalse(statusBarBackground?.isUserInteractionEnabled ?? true)
    }
}
