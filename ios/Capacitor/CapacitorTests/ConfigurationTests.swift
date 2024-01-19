import XCTest

@testable import Capacitor

class ConfigurationTests: XCTestCase {
    enum ConfigFile: String, CaseIterable {
        case flat = "flat"
        case nested = "hierarchy"
        case server = "server"
        case invalid = "bad"
        case deprecated = "hidinglogs"
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
        XCTAssertTrue(descriptor.scrollingEnabled)
        XCTAssertEqual(descriptor.loggingBehavior, .debug)
        XCTAssertTrue(descriptor.allowLinkPreviews)
        XCTAssertEqual(descriptor.contentInsetAdjustmentBehavior, .never)
    }
    
    func testDeprecatedParsing() throws {
        let url = Bundle.main.url(forResource: "configurations", withExtension: "")!
        let descriptor = InstanceDescriptor.init(at: url, configuration: ConfigurationTests.files[.deprecated], cordovaConfiguration: nil)
        #warning("Is this supposed to fail?")
        XCTExpectFailure {
            XCTAssertEqual(descriptor.loggingBehavior, .none)
        }
    }
    
    func testDeprecatedOverrideParsing() throws {
        let url = Bundle.main.url(forResource: "configurations", withExtension: "")!
        let descriptor = InstanceDescriptor.init(at: url, configuration: ConfigurationTests.files[.server], cordovaConfiguration: nil)
        XCTAssertEqual(descriptor.loggingBehavior, .production)
    }
    
    func testTopLevelParsing() throws {
        let url = Bundle.main.url(forResource: "configurations", withExtension: "")!
        let descriptor = InstanceDescriptor.init(at: url, configuration: ConfigurationTests.files[.flat], cordovaConfiguration: nil)
        XCTAssertEqual(descriptor.backgroundColor, UIColor(red: 1, green: 1, blue: 1, alpha: 1))
        XCTAssertEqual(descriptor.overridenUserAgentString, "level 1 override")
        XCTAssertEqual(descriptor.appendedUserAgentString, "level 1 append")
        XCTAssertEqual(descriptor.loggingBehavior, .debug)
    }
    
    func testNestedParsing() throws {
        let url = Bundle.main.url(forResource: "configurations", withExtension: "")!
        let descriptor = InstanceDescriptor.init(at: url, configuration: ConfigurationTests.files[.nested], cordovaConfiguration: nil)
        XCTAssertEqual(descriptor.backgroundColor, UIColor(red: 0, green: 0, blue: 0, alpha: 1))
        XCTAssertEqual(descriptor.overridenUserAgentString, "level 2 override")
        XCTAssertEqual(descriptor.appendedUserAgentString, "level 2 append")
        XCTAssertEqual(descriptor.loggingBehavior, .none)
        XCTAssertFalse(descriptor.scrollingEnabled)
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
        XCTAssertEqual(descriptor.loggingBehavior, .debug)
        XCTAssertEqual(descriptor.contentInsetAdjustmentBehavior, .never)
    }
    
    func testBadDataTransformation() throws {
        let url = Bundle.main.url(forResource: "configurations", withExtension: "")!
        let descriptor = InstanceDescriptor.init(at: url, configuration: ConfigurationTests.files[.invalid], cordovaConfiguration: nil)
        let configuration = InstanceConfiguration(with: descriptor, isDebug: true)
        #warning("Address this. These tests haven't been run during CI since maybe ever?")
        XCTExpectFailure {
            XCTAssertEqual(configuration.serverURL, URL(string: "capacitor://myhost"), "Invalid server.url and invalid ioScheme were not ignored")
        }
    }
    
    func testServerTransformation() throws {
        let url = Bundle.main.url(forResource: "configurations", withExtension: "")!
        let descriptor = InstanceDescriptor.init(at: url, configuration: ConfigurationTests.files[.server], cordovaConfiguration: nil)
        let configuration = InstanceConfiguration(with: descriptor, isDebug: true)
        XCTAssertEqual(configuration.serverURL, URL(string: "http://192.168.100.1:2057"))
        XCTAssertEqual(configuration.localURL, URL(string: "override://myhost"))
    }
    
    func testPluginConfig() throws {
        let url = Bundle.main.url(forResource: "configurations", withExtension: "")!
        let descriptor = InstanceDescriptor.init(at: url, configuration: ConfigurationTests.files[.flat], cordovaConfiguration: nil)
        let configuration = InstanceConfiguration(with: descriptor, isDebug: true)
        let value = configuration.getPluginConfigValue("SplashScreen", "launchShowDuration") as? Int
        XCTAssertNotNil(value)
        XCTAssertTrue(value == 1)
    }
    
    func testLegacyConfig() throws {
        let url = Bundle.main.url(forResource: "configurations", withExtension: "")!
        let descriptor = InstanceDescriptor.init(at: url, configuration: ConfigurationTests.files[.nested], cordovaConfiguration: nil)
        let configuration = InstanceConfiguration(with: descriptor, isDebug: true)
        var value = configuration.getValue("overrideUserAgent") as? String
        XCTAssertEqual(value, "level 1 override")
        value = configuration.getValue("ios.overrideUserAgent") as? String
        XCTAssertEqual(value, "level 2 override")
    }
    
    func testNavigationRules() throws {
        let url = Bundle.main.url(forResource: "configurations", withExtension: "")!
        let descriptor = InstanceDescriptor.init(at: url, configuration: ConfigurationTests.files[.server], cordovaConfiguration: nil)
        let configuration = InstanceConfiguration(with: descriptor, isDebug: true)
        XCTAssertTrue(configuration.shouldAllowNavigation(to: "ionic.io"))
        XCTAssertTrue(configuration.shouldAllowNavigation(to: "ionic.io".uppercased()))
        XCTAssertTrue(configuration.shouldAllowNavigation(to: "test.capacitorjs.com"))
        XCTAssertTrue(configuration.shouldAllowNavigation(to: "192.168.0.1"))
        XCTAssertTrue(configuration.shouldAllowNavigation(to: "subdomain.test.ionicframework.com"))
        XCTAssertTrue(configuration.shouldAllowNavigation(to: "wildcard1.wildcard2.example.com"))
        XCTAssertFalse(configuration.shouldAllowNavigation(to: "wildcard1.example.com"))
        XCTAssertFalse(configuration.shouldAllowNavigation(to: "google.com"))
        XCTAssertFalse(configuration.shouldAllowNavigation(to: "192.168.0.2"))
        XCTAssertFalse(configuration.shouldAllowNavigation(to: "ionicframework.com"))
    }
    
    func testNoLoggingTransformation() throws {
        let url = Bundle.main.url(forResource: "configurations", withExtension: "")!
        let descriptor = InstanceDescriptor.init(at: url, configuration: nil, cordovaConfiguration: nil)
        descriptor.loggingBehavior = .none
        var configuration = InstanceConfiguration(with: descriptor, isDebug: false)
        XCTAssertFalse(configuration.loggingEnabled)
        configuration = InstanceConfiguration(with: descriptor, isDebug: true)
        XCTAssertFalse(configuration.loggingEnabled)
    }
    
    func testDebugLoggingTransformation() throws {
        let url = Bundle.main.url(forResource: "configurations", withExtension: "")!
        let descriptor = InstanceDescriptor.init(at: url, configuration: nil, cordovaConfiguration: nil)
        descriptor.loggingBehavior = .debug
        var configuration = InstanceConfiguration(with: descriptor, isDebug: false)
        XCTAssertFalse(configuration.loggingEnabled)
        configuration = InstanceConfiguration(with: descriptor, isDebug: true)
        XCTAssertTrue(configuration.loggingEnabled)
    }
    
    func testProductionLoggingTransformation() throws {
        let url = Bundle.main.url(forResource: "configurations", withExtension: "")!
        let descriptor = InstanceDescriptor.init(at: url, configuration: nil, cordovaConfiguration: nil)
        descriptor.loggingBehavior = .production
        var configuration = InstanceConfiguration(with: descriptor, isDebug: false)
        XCTAssertTrue(configuration.loggingEnabled)
        configuration = InstanceConfiguration(with: descriptor, isDebug: true)
        XCTAssertTrue(configuration.loggingEnabled)
    }
}
