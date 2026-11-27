import UIKit
import WebKit
import XCTest

@testable import Capacitor

private class StubScriptMessage: WKScriptMessage {
    private let stubbedBody: Any
    private let stubbedFrameInfo: WKFrameInfo
    private static var retained: [StubScriptMessage] = []

    private init(body: Any, frameInfo: WKFrameInfo) {
        self.stubbedBody = body
        self.stubbedFrameInfo = frameInfo
        super.init()
    }

    static func make(body: Any, isMainFrame: Bool) -> StubScriptMessage {
        let message = StubScriptMessage(
            body: body,
            frameInfo: isMainFrame ? StubFrameInfo.main : StubFrameInfo.subframe
        )
        retained.append(message)
        return message
    }

    override var body: Any { stubbedBody }
    override var frameInfo: WKFrameInfo { stubbedFrameInfo }
}

private class RecordingBridgeViewController: CAPBridgeViewController {
    var presentedControllers: [UIViewController] = []

    override func present(_ viewControllerToPresent: UIViewController, animated flag: Bool, completion: (() -> Void)? = nil) {
        presentedControllers.append(viewControllerToPresent)
        completion?()
    }
}

class WebViewDelegationHandlerTests: XCTestCase {
    private var bridge: MockBridge!
    private var handler: WebViewDelegationHandler!
    private var viewController: RecordingBridgeViewController?
    private let webView = WKWebView()

    override func setUp() {
        super.setUp()
        let descriptor = InstanceDescriptor()
        handler = WebViewDelegationHandler()
        let vc = RecordingBridgeViewController()
        viewController = vc
        bridge = MockBridge(
            with: InstanceConfiguration(with: descriptor, isDebug: true),
            delegate: vc,
            assetHandler: MockAssetHandler(router: CapacitorRouter()),
            delegationHandler: handler
        )
    }

    func testSubframeScriptMessageIsIgnored() {
        var received: [String: Any]?
        bridge.registerCallInterceptor("test.interceptor") { received = $0 }

        let message = StubScriptMessage.make(body: ["type": "test.interceptor"], isMainFrame: false)
        handler.userContentController(handler.contentController, didReceive: message)

        XCTAssertNil(received)
    }

    func testMainFrameScriptMessageIsDispatched() {
        var received: [String: Any]?
        bridge.registerCallInterceptor("test.interceptor") { received = $0 }

        let message = StubScriptMessage.make(body: ["type": "test.interceptor"], isMainFrame: true)
        handler.userContentController(handler.contentController, didReceive: message)

        XCTAssertEqual(received?["type"] as? String, "test.interceptor")
    }

    func testSubframePromptDoesNotInvokeCookiesBridge() {
        var completionCalled = false
        handler.webView(
            webView,
            runJavaScriptTextInputPanelWithPrompt: #"{"type":"CapacitorCookies.get"}"#,
            defaultText: nil,
            initiatedByFrame: StubFrameInfo.subframe
        ) { _ in
            completionCalled = true
        }

        XCTAssertFalse(completionCalled)
        XCTAssertEqual(viewController?.presentedControllers.count, 1)
    }

    func testSubframeCookiePromptCompletesOnceWithNilWhenNoPresenter() {
        // bridge.bridgeDelegate is weak, so releasing viewController leaves the bridge alive
        // with a nil viewController.
        viewController = nil
        XCTAssertNotNil(handler.bridge)
        XCTAssertNil(handler.bridge?.viewController)

        var completions: [String?] = []
        handler.webView(
            webView,
            runJavaScriptTextInputPanelWithPrompt: #"{"type":"CapacitorCookies.get"}"#,
            defaultText: nil,
            initiatedByFrame: StubFrameInfo.subframe
        ) { result in
            completions.append(result)
        }

        XCTAssertEqual(completions, [nil])
    }

    func testConfirmCompletesOnceWithFalseWhenNoPresenter() {
        viewController = nil
        XCTAssertNil(handler.bridge?.viewController)

        var completions: [Bool] = []
        handler.webView(
            webView,
            runJavaScriptConfirmPanelWithMessage: "Continue?",
            initiatedByFrame: StubFrameInfo.main
        ) { result in
            completions.append(result)
        }

        XCTAssertEqual(completions, [false])
    }

    func testMainFramePromptHandlesCapacitorCookiesGet() {
        var result: String?
        handler.webView(
            webView,
            runJavaScriptTextInputPanelWithPrompt: #"{"type":"CapacitorCookies.get"}"#,
            defaultText: nil,
            initiatedByFrame: StubFrameInfo.main
        ) { result = $0 }

        XCTAssertNotNil(result)
        XCTAssertEqual(viewController?.presentedControllers.count, 0)
    }
}
