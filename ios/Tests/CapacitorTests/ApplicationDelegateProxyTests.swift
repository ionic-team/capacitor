import XCTest
@testable import Capacitor

class ApplicationDelegateProxyTests: XCTestCase {
    /// Stands in for the SwiftUI hosting controller: the bridge is a child, not the root.
    private final class HostViewController: UIViewController {
        var stubbedPresentedViewController: UIViewController?
        override var presentedViewController: UIViewController? { stubbedPresentedViewController }
    }

    private final class LandscapeViewController: UIViewController {
        override var supportedInterfaceOrientations: UIInterfaceOrientationMask { .landscape }
    }

    private func window(hosting bridge: CAPBridgeViewController?) -> (UIWindow, HostViewController) {
        let host = HostViewController()
        if let bridge {
            host.addChild(bridge)
            bridge.didMove(toParent: host)
        }
        let window = UIWindow(frame: CGRect(x: 0, y: 0, width: 400, height: 800))
        window.rootViewController = host
        return (window, host)
    }

    func testReturnsTheOrientationsOfABridgeNestedUnderTheRootViewController() {
        let bridge = CAPBridgeViewController()
        bridge.supportedOrientations = [UIInterfaceOrientation.landscapeLeft.rawValue]
        let (window, _) = window(hosting: bridge)

        XCTAssertEqual(ApplicationDelegateProxy.supportedInterfaceOrientations(for: window), .landscapeLeft)
    }

    func testFollowsALockAppliedAfterLaunch() {
        let bridge = CAPBridgeViewController()
        bridge.supportedOrientations = [UIInterfaceOrientation.portrait.rawValue, UIInterfaceOrientation.landscapeLeft.rawValue]
        let (window, _) = window(hosting: bridge)

        bridge.supportedOrientations = [UIInterfaceOrientation.portrait.rawValue]

        XCTAssertEqual(ApplicationDelegateProxy.supportedInterfaceOrientations(for: window), .portrait)
    }

    func testFallsBackToInfoPlistWithoutABridge() {
        let (window, _) = window(hosting: nil)

        XCTAssertEqual(
            ApplicationDelegateProxy.supportedInterfaceOrientations(for: window),
            ApplicationDelegateProxy.infoPlistInterfaceOrientations
        )
        XCTAssertEqual(
            ApplicationDelegateProxy.supportedInterfaceOrientations(for: nil),
            ApplicationDelegateProxy.infoPlistInterfaceOrientations
        )
    }

    func testLetsAFullScreenPresentationDecide() {
        let bridge = CAPBridgeViewController()
        bridge.supportedOrientations = [UIInterfaceOrientation.portrait.rawValue]
        let (window, host) = window(hosting: bridge)
        let presented = UIViewController()
        presented.modalPresentationStyle = .fullScreen
        host.stubbedPresentedViewController = presented

        XCTAssertEqual(
            ApplicationDelegateProxy.supportedInterfaceOrientations(for: window),
            ApplicationDelegateProxy.infoPlistInterfaceOrientations
        )
    }

    func testKeepsTheBridgeOrientationsUnderASheet() {
        let bridge = CAPBridgeViewController()
        bridge.supportedOrientations = [UIInterfaceOrientation.portrait.rawValue]
        let (window, host) = window(hosting: bridge)
        let presented = UIViewController()
        presented.modalPresentationStyle = .pageSheet
        host.stubbedPresentedViewController = presented

        XCTAssertEqual(ApplicationDelegateProxy.supportedInterfaceOrientations(for: window), .portrait)
    }

    func testFallsBackToInfoPlistWhenTheBridgeAllowsNoOrientation() {
        let bridge = CAPBridgeViewController()
        // What `ScreenOrientation.lock('any')` stores.
        bridge.supportedOrientations = [UIInterfaceOrientation.unknown.rawValue]
        let (window, _) = window(hosting: bridge)

        XCTAssertEqual(
            ApplicationDelegateProxy.supportedInterfaceOrientations(for: window),
            ApplicationDelegateProxy.infoPlistInterfaceOrientations
        )
    }

    func testLetsACustomPresentationWithNoOrientationInCommonDecide() {
        let bridge = CAPBridgeViewController()
        bridge.supportedOrientations = [UIInterfaceOrientation.portrait.rawValue]
        let (window, host) = window(hosting: bridge)
        let presented = LandscapeViewController()
        presented.modalPresentationStyle = .custom
        host.stubbedPresentedViewController = presented

        XCTAssertEqual(
            ApplicationDelegateProxy.supportedInterfaceOrientations(for: window),
            ApplicationDelegateProxy.infoPlistInterfaceOrientations
        )
    }

    func testKeepsTheBridgeOrientationsUnderAnAlert() {
        let bridge = CAPBridgeViewController()
        bridge.supportedOrientations = [UIInterfaceOrientation.portrait.rawValue]
        let (window, host) = window(hosting: bridge)
        host.stubbedPresentedViewController = UIAlertController(title: nil, message: nil, preferredStyle: .alert)

        XCTAssertEqual(ApplicationDelegateProxy.supportedInterfaceOrientations(for: window), .portrait)
    }
}
