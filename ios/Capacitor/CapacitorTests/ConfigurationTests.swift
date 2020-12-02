import XCTest

@testable import Capacitor

class ConfigurationTests: XCTestCase {
    enum ConfigFile: String, CaseIterable {
        case flat = "flat"
        case nested = "hierarchy"
        case server = "server"
        case invalid = "bad"
        case nonparsable = "nonjson"
    }
    static var files: [ConfigFile: URL] = [:]
    
    override class func setUp() {
        for file in ConfigFile.allCases {
            if let url = Bundle.main.url(forResource: file.rawValue, withExtension: "json", subdirectory: "configurations") {
                files[file] = url
            }
        }
    }
    
    override func setUpWithError() throws {
        XCTAssert(ConfigurationTests.files.count == ConfigFile.allCases.count, "Not all configuration files were located")
    }

    override func tearDownWithError() throws {
        // Put teardown code here. This method is called after the invocation of each test method in the class.
    }
    
    func testDefaultErrors() throws {
        let descriptor = InstanceDescriptor.init()
        XCTAssertTrue(descriptor.warnings.contains(.missingAppDir))
        XCTAssertTrue(descriptor.warnings.contains(.missingFile))
        XCTAssertTrue(descriptor.warnings.contains(.missingCordovaFile))
    }
    
    func testMissingAppDetection() throws {
        var url = Bundle.main.resourceURL!
        url.appendPathComponent("app", isDirectory: true)
        let descriptor = InstanceDescriptor.init(at: url, configuration: nil, cordovaConfiguration: nil)
        XCTAssertTrue(descriptor.warnings.contains(.missingAppDir), "A missing app directory was ignored")
    }
    
    func testFailedParsing() throws {
        let url = Bundle.main.url(forResource: "configurations", withExtension: "")!
        let descriptor = InstanceDescriptor.init(at: url, configuration: ConfigurationTests.files[.nonparsable], cordovaConfiguration: nil)
        XCTAssertTrue(descriptor.warnings.contains(.invalidFile))
    }
    
    func testDefaults() throws {
        let url = Bundle.main.url(forResource: "configurations", withExtension: "")!
        let descriptor = InstanceDescriptor.init(at: url, configuration: nil, cordovaConfiguration: nil)
        XCTAssertNil(descriptor.backgroundColor)
        XCTAssertEqual(descriptor.urlScheme, "capacitor")
        XCTAssertEqual(descriptor.urlHostname, "localhost")
        XCTAssertNil(descriptor.serverURL)
        XCTAssertTrue(descriptor.enableScrolling)
        XCTAssertTrue(descriptor.enableLogging)
        XCTAssertTrue(descriptor.allowLinkPreviews)
        XCTAssertEqual(descriptor.contentInsetAdjustmentBehavior, .never)
    }
    
    func testTopLevelParsing() throws {
        let url = Bundle.main.url(forResource: "configurations", withExtension: "")!
        let descriptor = InstanceDescriptor.init(at: url, configuration: ConfigurationTests.files[.flat], cordovaConfiguration: nil)
        XCTAssertEqual(descriptor.backgroundColor, UIColor(red: 1, green: 1, blue: 1, alpha: 1))
        XCTAssertEqual(descriptor.overridenUserAgentString, "level 1 override")
        XCTAssertEqual(descriptor.appendedUserAgentString, "level 1 append")
        XCTAssertFalse(descriptor.enableLogging)
    }
    
    func testNestedParsing() throws {
        let url = Bundle.main.url(forResource: "configurations", withExtension: "")!
        let descriptor = InstanceDescriptor.init(at: url, configuration: ConfigurationTests.files[.nested], cordovaConfiguration: nil)
        XCTAssertEqual(descriptor.backgroundColor, UIColor(red: 0, green: 0, blue: 0, alpha: 1))
        XCTAssertEqual(descriptor.overridenUserAgentString, "level 2 override")
        XCTAssertEqual(descriptor.appendedUserAgentString, "level 2 append")
        XCTAssertTrue(descriptor.enableLogging)
        XCTAssertFalse(descriptor.enableScrolling)
        XCTAssertEqual(descriptor.contentInsetAdjustmentBehavior, .scrollableAxes)
    }
    
    func testServerParsing() throws {
        let url = Bundle.main.url(forResource: "configurations", withExtension: "")!
        let descriptor = InstanceDescriptor.init(at: url, configuration: ConfigurationTests.files[.server], cordovaConfiguration: nil)
        XCTAssertEqual(descriptor.urlScheme, "override")
        XCTAssertEqual(descriptor.urlHostname, "myhost")
        XCTAssertEqual(descriptor.serverURL, "http://192.168.100.1:2057")
    }
    
    func testBadDataParsing() throws {
        let url = Bundle.main.url(forResource: "configurations", withExtension: "")!
        let descriptor = InstanceDescriptor.init(at: url, configuration: ConfigurationTests.files[.invalid], cordovaConfiguration: nil)
        XCTAssertNil(descriptor.backgroundColor)
        XCTAssertTrue(descriptor.enableLogging)
        XCTAssertEqual(descriptor.contentInsetAdjustmentBehavior, .never)
    }
    
    func testBadDataTransformation() throws {
        let url = Bundle.main.url(forResource: "configurations", withExtension: "")!
        let descriptor = InstanceDescriptor.init(at: url, configuration: ConfigurationTests.files[.invalid], cordovaConfiguration: nil)
        let configuration = InstanceConfiguration(with: descriptor)
        XCTAssertEqual(configuration.serverURL, URL(string: "capacitor://myhost"), "Invalid server.url and invalid ioScheme were not ignored")
    }
    
    func testServerTransformation() throws {
        let url = Bundle.main.url(forResource: "configurations", withExtension: "")!
        let descriptor = InstanceDescriptor.init(at: url, configuration: ConfigurationTests.files[.server], cordovaConfiguration: nil)
        let configuration = InstanceConfiguration(with: descriptor)
        XCTAssertEqual(configuration.serverURL, URL(string: "http://192.168.100.1:2057"))
        XCTAssertEqual(configuration.localURL, URL(string: "override://myhost"))
    }
    
    func testPluginConfig() throws {
        let url = Bundle.main.url(forResource: "configurations", withExtension: "")!
        let descriptor = InstanceDescriptor.init(at: url, configuration: ConfigurationTests.files[.flat], cordovaConfiguration: nil)
        let configuration = InstanceConfiguration(with: descriptor)
        let value = configuration.getPluginConfigValue("SplashScreen", "launchShowDuration") as? Int
        XCTAssertNotNil(value)
        XCTAssertTrue(value == 1)
    }
    
    func testLegacyConfig() throws {
        let url = Bundle.main.url(forResource: "configurations", withExtension: "")!
        let descriptor = InstanceDescriptor.init(at: url, configuration: ConfigurationTests.files[.nested], cordovaConfiguration: nil)
        let configuration = InstanceConfiguration(with: descriptor)
        var value = configuration.getValue("overrideUserAgent") as? String
        XCTAssertEqual(value, "level 1 override")
        value = configuration.getValue("ios.overrideUserAgent") as? String
        XCTAssertEqual(value, "level 2 override")
    }
}
