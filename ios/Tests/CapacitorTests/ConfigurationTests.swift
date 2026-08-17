import Foundation
import Testing
import UIKit
@testable import Capacitor

struct ConfigurationTests {
    enum ConfigFile: String, CaseIterable {
        case flat = "flat"
        case nested = "hierarchy"
        case server = "server"
        case invalid = "bad"
        case deprecated = "hidinglogs"
        case nonparsable = "nonjson"
    }

    private static let configFiles = loadConfigFiles()

    private static func loadConfigFiles() -> [ConfigFile: URL] {
        var files: [ConfigFile: URL] = [:]
        for file in ConfigFile.allCases {
            if let url = Bundle.module.url(forResource: file.rawValue, withExtension: "json", subdirectory: "configurations") {
                files[file] = url
            }
        }
        return files
    }

    private func getConfigURL() -> URL {
        Bundle.module.resourceURL?.appendingPathComponent("configurations") ??
        Bundle.module.resourceURL ?? Bundle.main.resourceURL ?? URL(fileURLWithPath: "/")
    }

    @Test func defaultErrors() throws {
        let descriptor = InstanceDescriptor.init()
        #expect(descriptor.warnings.contains(.missingAppDir))
        #expect(descriptor.warnings.contains(.missingFile))
    }

    @Test func missingAppDetection() throws {
        var url = getConfigURL()
        url.appendPathComponent("app", isDirectory: true)
        let descriptor = InstanceDescriptor.init(at: url, configuration: nil, cordovaConfiguration: nil)
        #expect(descriptor.warnings.contains(.missingAppDir))
    }

    @Test func failedParsing() throws {
        let url = getConfigURL()
        let descriptor = InstanceDescriptor.init(at: url, configuration: Self.configFiles[.nonparsable], cordovaConfiguration: nil)
        #expect(descriptor.warnings.contains(.invalidFile))
    }

    @Test func defaults() throws {
        let url = getConfigURL()
        let descriptor = InstanceDescriptor.init(at: url, configuration: nil, cordovaConfiguration: nil)
        #expect(descriptor.backgroundColor == nil)
        #expect(descriptor.urlScheme == "capacitor")
        #expect(descriptor.urlHostname == "localhost")
        #expect(descriptor.serverURL == nil)
        #expect(descriptor.scrollingEnabled == true)
        #expect(descriptor.loggingBehavior == .debug)
        #expect(descriptor.allowLinkPreviews == true)
        #expect(descriptor.contentInsetAdjustmentBehavior == .never)
    }

    @Test func deprecatedParsing() throws {
        let url = getConfigURL()
        let descriptor = InstanceDescriptor.init(at: url, configuration: Self.configFiles[.deprecated], cordovaConfiguration: nil)
        #expect(descriptor.loggingBehavior != .none)
    }

    @Test func deprecatedOverrideParsing() throws {
        let url = getConfigURL()
        let descriptor = InstanceDescriptor.init(at: url, configuration: Self.configFiles[.server], cordovaConfiguration: nil)
        #expect(descriptor.loggingBehavior == .production)
    }

    @Test func topLevelParsing() throws {
        let url = getConfigURL()
        let descriptor = InstanceDescriptor.init(at: url, configuration: Self.configFiles[.flat], cordovaConfiguration: nil)
        #expect(descriptor.backgroundColor == UIColor(red: 1, green: 1, blue: 1, alpha: 1))
        #expect(descriptor.overridenUserAgentString == "level 1 override")
        #expect(descriptor.appendedUserAgentString == "level 1 append")
        #expect(descriptor.loggingBehavior == .debug)
    }

    @Test func nestedParsing() throws {
        let url = getConfigURL()
        let descriptor = InstanceDescriptor.init(at: url, configuration: Self.configFiles[.nested], cordovaConfiguration: nil)
        #expect(descriptor.backgroundColor == UIColor(red: 0, green: 0, blue: 0, alpha: 1))
        #expect(descriptor.overridenUserAgentString == "level 2 override")
        #expect(descriptor.appendedUserAgentString == "level 2 append")
        #expect(descriptor.loggingBehavior == .none)
        #expect(descriptor.scrollingEnabled == false)
        #expect(descriptor.contentInsetAdjustmentBehavior == .scrollableAxes)
    }

    @Test func serverParsing() throws {
        let url = getConfigURL()
        let descriptor = InstanceDescriptor.init(at: url, configuration: Self.configFiles[.server], cordovaConfiguration: nil)
        #expect(descriptor.urlScheme == "override")
        #expect(descriptor.urlHostname == "myhost")
        #expect(descriptor.serverURL == "http://192.168.100.1:2057")
    }

    @Test func badDataParsing() throws {
        let url = getConfigURL()
        let descriptor = InstanceDescriptor.init(at: url, configuration: Self.configFiles[.invalid], cordovaConfiguration: nil)
        #expect(descriptor.backgroundColor == nil)
        #expect(descriptor.loggingBehavior == .debug)
        #expect(descriptor.contentInsetAdjustmentBehavior == .never)
    }

    @Test func badDataTransformation() throws {
        let url = getConfigURL()
        let descriptor = InstanceDescriptor.init(at: url, configuration: Self.configFiles[.invalid], cordovaConfiguration: nil)
        let configuration = InstanceConfiguration(with: descriptor, isDebug: true)
        #expect(configuration.serverURL != URL(string: "capacitor://myhost"))
    }

    @Test func serverTransformation() throws {
        let url = getConfigURL()
        let descriptor = InstanceDescriptor.init(at: url, configuration: Self.configFiles[.server], cordovaConfiguration: nil)
        let configuration = InstanceConfiguration(with: descriptor, isDebug: true)
        #expect(configuration.serverURL == URL(string: "http://192.168.100.1:2057"))
        #expect(configuration.localURL == URL(string: "override://myhost"))
    }

    @Test func pluginConfig() throws {
        let url = getConfigURL()
        let descriptor = InstanceDescriptor.init(at: url, configuration: Self.configFiles[.flat], cordovaConfiguration: nil)
        let configuration = InstanceConfiguration(with: descriptor, isDebug: true)
        let value = configuration.getPluginConfig("SplashScreen").getInt("launchShowDuration", 0)
        #expect(value == 1)
    }

    @Test func legacyConfig() throws {
        let url = getConfigURL()
        let flatDescriptor = InstanceDescriptor.init(at: url, configuration: Self.configFiles[.flat], cordovaConfiguration: nil)
        let flatConfiguration = InstanceConfiguration(with: flatDescriptor, isDebug: true)
        #expect(flatConfiguration.overridenUserAgentString == "level 1 override")

        let nestedDescriptor = InstanceDescriptor.init(at: url, configuration: Self.configFiles[.nested], cordovaConfiguration: nil)
        let nestedConfiguration = InstanceConfiguration(with: nestedDescriptor, isDebug: true)
        #expect(nestedConfiguration.overridenUserAgentString == "level 2 override")
    }

    @Test func navigationRules() throws {
        let url = getConfigURL()
        let descriptor = InstanceDescriptor.init(at: url, configuration: Self.configFiles[.server], cordovaConfiguration: nil)
        let configuration = InstanceConfiguration(with: descriptor, isDebug: true)
        #expect(configuration.shouldAllowNavigation(to: "ionic.io") == true)
        #expect(configuration.shouldAllowNavigation(to: "ionic.io".uppercased()) == true)
        #expect(configuration.shouldAllowNavigation(to: "test.capacitorjs.com") == true)
        #expect(configuration.shouldAllowNavigation(to: "192.168.0.1") == true)
        #expect(configuration.shouldAllowNavigation(to: "subdomain.test.ionicframework.com") == true)
        #expect(configuration.shouldAllowNavigation(to: "wildcard1.wildcard2.example.com") == true)
        #expect(configuration.shouldAllowNavigation(to: "wildcard1.example.com") == false)
        #expect(configuration.shouldAllowNavigation(to: "google.com") == false)
        #expect(configuration.shouldAllowNavigation(to: "192.168.0.2") == false)
        #expect(configuration.shouldAllowNavigation(to: "ionicframework.com") == false)
    }

    @Test func noLoggingTransformation() throws {
        let url = getConfigURL()
        let descriptor = InstanceDescriptor.init(at: url, configuration: nil, cordovaConfiguration: nil)
        descriptor.loggingBehavior = .none
        var configuration = InstanceConfiguration(with: descriptor, isDebug: false)
        #expect(configuration.loggingEnabled == false)
        configuration = InstanceConfiguration(with: descriptor, isDebug: true)
        #expect(configuration.loggingEnabled == false)
    }

    @Test func debugLoggingTransformation() throws {
        let url = getConfigURL()
        let descriptor = InstanceDescriptor.init(at: url, configuration: nil, cordovaConfiguration: nil)
        descriptor.loggingBehavior = .debug
        var configuration = InstanceConfiguration(with: descriptor, isDebug: false)
        #expect(configuration.loggingEnabled == false)
        configuration = InstanceConfiguration(with: descriptor, isDebug: true)
        #expect(configuration.loggingEnabled == true)
    }

    @Test func productionLoggingTransformation() throws {
        let url = getConfigURL()
        let descriptor = InstanceDescriptor.init(at: url, configuration: nil, cordovaConfiguration: nil)
        descriptor.loggingBehavior = .production
        var configuration = InstanceConfiguration(with: descriptor, isDebug: false)
        #expect(configuration.loggingEnabled == true)
        configuration = InstanceConfiguration(with: descriptor, isDebug: true)
        #expect(configuration.loggingEnabled == true)
    }
}
