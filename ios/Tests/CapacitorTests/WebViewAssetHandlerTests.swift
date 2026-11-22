import Foundation
import WebKit
import XCTest

@testable import Capacitor

private final class StubSchemeTask: NSObject, WKURLSchemeTask {
    let request: URLRequest
    var response: URLResponse?
    var data = Data()
    var error: Error?
    var finished = false

    init(_ request: URLRequest) {
        self.request = request
        super.init()
    }

    func didReceive(_ response: URLResponse) {
        self.response = response
    }

    func didReceive(_ data: Data) {
        self.data.append(data)
    }

    func didFinish() {
        finished = true
    }

    func didFailWithError(_ error: Error) {
        self.error = error
    }
}

private struct SPAFallbackRouter: Router {
    var basePath: String = ""
    var overrides: [String: String] = [:]

    func route(for path: String) -> String {
        if let mapped = overrides[path] {
            return basePath + mapped
        }
        let candidate = basePath + path
        if FileManager.default.fileExists(atPath: candidate), path != "/" {
            return candidate
        }
        return basePath + "/index.html"
    }
}

class WebViewAssetHandlerTests: XCTestCase {
    private let indexData = Data("<!doctype html><title>App</title>".utf8)

    private func withHandler(
        overrides: [String: String] = [:],
        _ body: (WebViewAssetHandler, URL) throws -> Void
    ) throws {
        let directory = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString)
        try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
        defer { try? FileManager.default.removeItem(at: directory) }

        try indexData.write(to: directory.appendingPathComponent("index.html"))
        let handler = WebViewAssetHandler(router: SPAFallbackRouter(overrides: overrides))
        handler.setAssetPath(directory.path)
        try body(handler, directory)
    }

    private func load(_ path: String, with handler: WebViewAssetHandler) -> StubSchemeTask {
        let url = URL(string: "capacitor://localhost\(path)")!
        let task = StubSchemeTask(URLRequest(url: url))
        handler.webView(WKWebView(), start: task)
        return task
    }

    func testCustomRouterDotSuffixedRoutesServeIndexHTMLWithHTMLMimeType() throws {
        let routes = [
            "/explore/example.com",
            "/watch/clip.mp4",
            "/explore/mycordova.js"
        ]
        try withHandler { handler, _ in
            for route in routes {
                let task = load(route, with: handler)
                XCTAssertNil(task.error, route)
                XCTAssertTrue(task.finished, route)
                XCTAssertEqual(task.data, indexData, route)
                XCTAssertEqual(task.response?.mimeType, "text/html", route)
                XCTAssertTrue(task.response is HTTPURLResponse, route)
            }
        }
    }

    func testCordovaJSRequestReturnsEmptyJavaScriptStubWhenRouterFallsBackToIndexHTML() throws {
        try withHandler { handler, _ in
            let task = load("/cordova.js", with: handler)
            XCTAssertNil(task.error)
            XCTAssertTrue(task.finished)
            XCTAssertTrue(task.data.isEmpty)
            XCTAssertEqual(task.response?.mimeType, handler.mimeTypeForExtension(pathExtension: "js"))
            XCTAssertTrue(task.response is HTTPURLResponse)
        }
    }

    func testNestedCordovaJSRequestReturnsEmptyJavaScriptStub() throws {
        try withHandler { handler, _ in
            let task = load("/room/cordova.js", with: handler)
            XCTAssertNil(task.error)
            XCTAssertTrue(task.finished)
            XCTAssertTrue(task.data.isEmpty)
            XCTAssertEqual(task.response?.mimeType, handler.mimeTypeForExtension(pathExtension: "js"))
            XCTAssertTrue(task.response is HTTPURLResponse)
        }
    }

    func testCordovaJSRequestReturnsEmptyJavaScriptStubWhenCordovaJSExistsOnDisk() throws {
        try withHandler { handler, directory in
            let cordovaData = Data("console.log('cordova');".utf8)
            try cordovaData.write(to: directory.appendingPathComponent("cordova.js"))

            let task = load("/cordova.js", with: handler)
            XCTAssertNil(task.error)
            XCTAssertTrue(task.finished)
            XCTAssertTrue(task.data.isEmpty)
            XCTAssertEqual(task.response?.mimeType, handler.mimeTypeForExtension(pathExtension: "js"))
            XCTAssertTrue(task.response is HTTPURLResponse)
        }
    }

    func testRouterMappingOtherPathToFileNamedCordovaJSServesFileContents() throws {
        let overrides = ["/vendor/runtime.js": "/cordova.js"]
        try withHandler(overrides: overrides) { handler, directory in
            let runtimeData = Data("window.runtimeLoaded = true;".utf8)
            try runtimeData.write(to: directory.appendingPathComponent("cordova.js"))

            let task = load("/vendor/runtime.js", with: handler)
            XCTAssertNil(task.error)
            XCTAssertTrue(task.finished)
            XCTAssertEqual(task.data, runtimeData)
            XCTAssertEqual(task.response?.mimeType, handler.mimeTypeForExtension(pathExtension: "js"))
            XCTAssertTrue(task.response is HTTPURLResponse)
        }
    }

    func testExtensionlessResolvedFileFallsBackToRequestURLExtension() throws {
        let overrides = [
            "/app.js": "/app-bundle",
            "/clip.mp4": "/clip-blob"
        ]
        try withHandler(overrides: overrides) { handler, directory in
            let jsData = Data("window.loaded = true;".utf8)
            try jsData.write(to: directory.appendingPathComponent("app-bundle"))
            let jsTask = load("/app.js", with: handler)
            XCTAssertNil(jsTask.error)
            XCTAssertTrue(jsTask.finished)
            XCTAssertEqual(jsTask.data, jsData)
            XCTAssertEqual(jsTask.response?.mimeType, handler.mimeTypeForExtension(pathExtension: "js"))
            XCTAssertTrue(jsTask.response is HTTPURLResponse)

            let mp4Data = Data([0, 1, 2, 3])
            try mp4Data.write(to: directory.appendingPathComponent("clip-blob"))
            let mp4Task = load("/clip.mp4", with: handler)
            XCTAssertNil(mp4Task.error)
            XCTAssertTrue(mp4Task.finished)
            XCTAssertEqual(mp4Task.data, mp4Data)
            XCTAssertEqual(mp4Task.response?.mimeType, "video/mp4")
            XCTAssertFalse(mp4Task.response is HTTPURLResponse)
        }
    }

    func testStaticAndMediaFilesKeepResolvedMimeTypeAndResponse() throws {
        try withHandler { handler, directory in
            let jsData = Data("window.loaded = true;".utf8)
            try jsData.write(to: directory.appendingPathComponent("app.js"))
            let jsTask = load("/app.js", with: handler)
            XCTAssertNil(jsTask.error)
            XCTAssertTrue(jsTask.finished)
            XCTAssertEqual(jsTask.data, jsData)
            XCTAssertEqual(jsTask.response?.mimeType, handler.mimeTypeForExtension(pathExtension: "js"))
            XCTAssertTrue(jsTask.response is HTTPURLResponse)

            let mp4Data = Data([0, 1, 2, 3])
            try mp4Data.write(to: directory.appendingPathComponent("clip.mp4"))
            let mp4Task = load("/clip.mp4", with: handler)
            XCTAssertNil(mp4Task.error)
            XCTAssertTrue(mp4Task.finished)
            XCTAssertEqual(mp4Task.data, mp4Data)
            XCTAssertEqual(mp4Task.response?.mimeType, "video/mp4")
            XCTAssertFalse(mp4Task.response is HTTPURLResponse)
        }
    }
}
