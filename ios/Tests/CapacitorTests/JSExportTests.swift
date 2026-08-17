import Testing
import WebKit
@testable import Capacitor

struct JSExportTests {
    @Test func bridgeBundleExports() throws {
        let contentController = WKUserContentController()
        try Capacitor.JSExport.exportBridgeJS(userContentController: contentController)
    }
}
