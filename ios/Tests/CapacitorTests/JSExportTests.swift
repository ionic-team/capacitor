import XCTest

@testable import Capacitor

class JSExportTests: XCTestCase {

    override func setUpWithError() throws {
        // Put setup code here. This method is called before the invocation of each test method in the class.
    }

    override func tearDownWithError() throws {
        // Put teardown code here. This method is called after the invocation of each test method in the class.
    }
    
    func testBridgeBundle() throws {
        let contentController = WKUserContentController()
        do {
            try Capacitor.JSExport.exportBridgeJS(userContentController: contentController)
        }
        catch {
            XCTFail()
        }
    }
}
