//
//  InstanceDescriptor.swift
//  Capacitor
//
//  Copyright © 2024 Drifty Co. All rights reserved.
//

import Foundation
import UIKit
import WebKit

@objc(CAPInstanceDescriptor)
open class InstanceDescriptor: NSObject {
    // MARK: - Properties

    @objc public var appendedUserAgentString: String?
    @objc public var overridenUserAgentString: String?
    @objc public var backgroundColor: UIColor?
    @objc public var allowedNavigationHostnames: [String] = []
    @objc public var urlScheme: String = InstanceDescriptorDefaults.scheme
    @objc public var urlHostname: String = InstanceDescriptorDefaults.hostname
    @objc public var serverURL: String?
    @objc public var errorPath: String?
    @objc public var pluginConfigurations: [String: Any] = [:]
    @objc public var loggingBehavior: InstanceLoggingBehavior = .debug
    @objc public var scrollingEnabled: Bool = true
    @objc public var zoomingEnabled: Bool = false
    @objc public var allowLinkPreviews: Bool = true
    @objc public var handleApplicationNotifications: Bool = true
    @objc public var isWebDebuggable: Bool = false
    @objc public var hasInitialFocus: Bool = true
    @objc public var contentInsetAdjustmentBehavior: UIScrollView.ContentInsetAdjustmentBehavior = .never
    @objc public var appLocation: URL
    @objc public var appStartPath: String?
    @objc public var limitsNavigationsToAppBoundDomains: Bool = false
    @objc public var preferredContentMode: String?
    @objc public var cordovaConfiguration: NSObject
    public var warnings: InstanceWarning = []
    public let instanceType: InstanceType
    @objc public var legacyConfig: [String: Any] = [:]

    // MARK: - Initialization

    @objc public override init() {
        self.instanceType = .fixed
        let publicURL = Bundle.main.url(forResource: "public", withExtension: nil)
        self.appLocation = publicURL ?? Bundle.main.resourceURL ?? URL(fileURLWithPath: "/")
        self.cordovaConfiguration = NSObject()

        super.init()

        setDefaults(withAppLocation: publicURL)
        _parseConfiguration(
            at: Bundle.main.url(forResource: "capacitor.config", withExtension: "json"),
            cordovaConfiguration: Bundle.main.url(forResource: "config", withExtension: "xml")
        )
    }

    @objc public init(at appURL: URL, configuration configURL: URL?, cordovaConfiguration cordovaURL: URL?) {
        self.instanceType = .variable
        self.appLocation = appURL
        self.cordovaConfiguration = NSObject()

        super.init()

        setDefaults(withAppLocation: appURL)
        _parseConfiguration(at: configURL, cordovaConfiguration: cordovaURL)
    }

    // MARK: - Private

    private func setDefaults(withAppLocation location: URL?) {
        allowedNavigationHostnames = []
        urlScheme = InstanceDescriptorDefaults.scheme
        urlHostname = InstanceDescriptorDefaults.hostname
        pluginConfigurations = [:]
        legacyConfig = [:]
        loggingBehavior = .debug
        scrollingEnabled = true
        zoomingEnabled = false
        allowLinkPreviews = true
        handleApplicationNotifications = true
        isWebDebuggable = false
        hasInitialFocus = true
        contentInsetAdjustmentBehavior = .never
        limitsNavigationsToAppBoundDomains = false

        if let location = location {
            appLocation = location
        } else {
            warnings.insert(.missingAppDir)
            appLocation = Bundle.main.resourceURL?.appendingPathComponent("public") ?? URL(fileURLWithPath: "/")
        }
    }
}
