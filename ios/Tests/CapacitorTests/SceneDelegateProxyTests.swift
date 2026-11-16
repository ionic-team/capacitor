import XCTest
@testable import Capacitor

class SceneDelegateProxyTests: XCTestCase {
    private var proxy = SceneDelegateProxy()
    private var observers: [NSObjectProtocol] = []
    private var received: [Notification] = []

    override func setUp() {
        super.setUp()
        proxy = SceneDelegateProxy()
        received = []
        ApplicationDelegateProxy.shared.lastURL = nil
    }

    override func tearDown() {
        observers.forEach { NotificationCenter.default.removeObserver($0) }
        observers = []
        ApplicationDelegateProxy.shared.lastURL = nil
        super.tearDown()
    }

    private func observe(_ names: Notification.Name...) {
        for name in names {
            observers.append(
                NotificationCenter.default.addObserver(forName: name, object: nil, queue: nil) { [weak self] notification in
                    self?.received.append(notification)
                }
            )
        }
    }

    private func count(of name: Notification.Name) -> Int {
        received.filter { $0.name == name }.count
    }

    func testHandleOpenURLRecordsLaunchURLForAppPlugin() {
        let url = URL(string: "myapp://deep/link")!

        proxy.handle(openURL: url)

        XCTAssertEqual(proxy.lastURL, url)
        XCTAssertEqual(ApplicationDelegateProxy.shared.lastURL, url)
    }

    func testHandleUserActivityRecordsLaunchURLForAppPlugin() {
        let url = URL(string: "https://example.com/path")!
        let activity = NSUserActivity(activityType: NSUserActivityTypeBrowsingWeb)
        activity.webpageURL = url

        proxy.handle(userActivity: activity)

        XCTAssertEqual(proxy.lastURL, url)
        XCTAssertEqual(ApplicationDelegateProxy.shared.lastURL, url)
    }

    func testHandleUserActivityIgnoresNonBrowsingActivity() {
        observe(.capacitorOpenUniversalLink, .capacitorSceneOpenUniversalLink)
        let activity = NSUserActivity(activityType: "com.example.other")
        activity.webpageURL = URL(string: "https://example.com/path")

        proxy.handle(userActivity: activity)
        proxy.bridgeViewDidAppear()

        XCTAssertNil(proxy.lastURL)
        XCTAssertNil(ApplicationDelegateProxy.shared.lastURL)
        XCTAssertEqual(received.count, 0)
    }

    func testOpenURLBeforeBridgeViewAppearsIsHeldThenDeliveredOnce() {
        observe(.capacitorOpenURL, .capacitorSceneOpenURL)
        let url = URL(string: "myapp://cold/start")!

        proxy.handle(openURL: url)

        XCTAssertEqual(received.count, 0)
        XCTAssertEqual(ApplicationDelegateProxy.shared.lastURL, url)

        proxy.bridgeViewDidAppear()

        XCTAssertEqual(count(of: .capacitorOpenURL), 1)
        XCTAssertEqual(count(of: .capacitorSceneOpenURL), 1)

        proxy.bridgeViewDidAppear()

        XCTAssertEqual(count(of: .capacitorOpenURL), 1)
        XCTAssertEqual(count(of: .capacitorSceneOpenURL), 1)
    }

    func testUniversalLinkBeforeBridgeViewAppearsIsHeldThenDelivered() {
        observe(.capacitorOpenUniversalLink, .capacitorSceneOpenUniversalLink)
        let url = URL(string: "https://example.com/cold")!
        let activity = NSUserActivity(activityType: NSUserActivityTypeBrowsingWeb)
        activity.webpageURL = url

        proxy.handle(userActivity: activity)

        XCTAssertEqual(received.count, 0)
        XCTAssertEqual(ApplicationDelegateProxy.shared.lastURL, url)

        proxy.bridgeViewDidAppear()

        XCTAssertEqual(count(of: .capacitorOpenUniversalLink), 1)
        XCTAssertEqual(count(of: .capacitorSceneOpenUniversalLink), 1)
    }

    func testOpenURLAfterBridgeViewAppearedPostsImmediately() {
        observe(.capacitorOpenURL, .capacitorSceneOpenURL)
        proxy.bridgeViewDidAppear()

        proxy.handle(openURL: URL(string: "myapp://warm/start")!)

        XCTAssertEqual(count(of: .capacitorOpenURL), 1)
        XCTAssertEqual(count(of: .capacitorSceneOpenURL), 1)
    }
}
