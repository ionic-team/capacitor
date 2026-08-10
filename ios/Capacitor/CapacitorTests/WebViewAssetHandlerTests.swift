//
//  WebViewAssetHandlerTests.swift
//  CapacitorTests
//

import WebKit
import XCTest
@testable import Capacitor

class WebViewAssetHandlerTests: XCTestCase {

    // A stub protocol that starts a request but never completes it, so the only
    // way `stopLoading` fires is the session cancelling the task.
    final class HangingURLProtocol: URLProtocol {
        static var onStartLoading: (() -> Void)?
        static var onStopLoading: (() -> Void)?

        override class func canInit(with request: URLRequest) -> Bool { true }
        override class func canonicalRequest(for request: URLRequest) -> URLRequest { request }
        override func startLoading() { HangingURLProtocol.onStartLoading?() }
        override func stopLoading() { HangingURLProtocol.onStopLoading?() }
    }

    final class MockURLSchemeTask: NSObject, WKURLSchemeTask {
        let request: URLRequest
        init(request: URLRequest) { self.request = request }
        func didReceive(_ response: URLResponse) {}
        func didReceive(_ data: Data) {}
        func didFinish() {}
        func didFailWithError(_ error: Error) {}
    }

    override func tearDown() {
        HangingURLProtocol.onStartLoading = nil
        HangingURLProtocol.onStopLoading = nil
        super.tearDown()
    }

    // When WebKit stops a scheme task (e.g. an AbortSignal timeout), the handler
    // must cancel the underlying URLSession task so its connection is released.
    func testStopCancelsInFlightProxiedRequest() {
        let configuration = URLSessionConfiguration.ephemeral
        configuration.protocolClasses = [HangingURLProtocol.self]

        let handler = WebViewAssetHandler(router: CapacitorRouter())
        handler.urlSession = URLSession(configuration: configuration)

        let started = expectation(description: "proxied request started")
        let cancelled = expectation(description: "proxied request cancelled")
        HangingURLProtocol.onStartLoading = { started.fulfill() }
        HangingURLProtocol.onStopLoading = { cancelled.fulfill() }

        // Build an interceptor URL exactly as the JS bridge does for a GET.
        let target = "https://example.com/api/next"
        let encoded = target.addingPercentEncoding(withAllowedCharacters: .alphanumerics)!
        let interceptorURL = URL(string: "capacitor://localhost"
            + CapacitorBridge.httpInterceptorStartIdentifier
            + "?" + CapacitorBridge.httpInterceptorUrlParam + "=" + encoded)!
        let schemeTask = MockURLSchemeTask(request: URLRequest(url: interceptorURL))
        let webView = WKWebView()

        handler.webView(webView, start: schemeTask)
        wait(for: [started], timeout: 5)

        handler.webView(webView, stop: schemeTask)
        wait(for: [cancelled], timeout: 5)
    }
}
