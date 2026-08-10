//
//  InstanceConfiguration.swift
//  Capacitor
//
//  Copyright © 2024 Drifty Co. All rights reserved.
//

import Foundation
import UIKit

@objc(CAPInstanceConfiguration)
open class InstanceConfiguration: NSObject {
    // MARK: - Properties

    @objc public let appendedUserAgentString: String?
    @objc public let overridenUserAgentString: String?
    @objc public let backgroundColor: UIColor?
    @objc public let allowedNavigationHostnames: [String]
    @objc public let localURL: URL
    @objc public let serverURL: URL
    @objc public let errorPath: String?
    @objc public let pluginConfigurations: [String: Any]
    @objc public let loggingEnabled: Bool
    @objc public let scrollingEnabled: Bool
    @objc public let zoomingEnabled: Bool
    @objc public let allowLinkPreviews: Bool
    @objc public let handleApplicationNotifications: Bool
    @objc public let isWebDebuggable: Bool
    @objc public let hasInitialFocus: Bool
    @objc public let cordovaDeployDisabled: Bool
    @objc public let contentInsetAdjustmentBehavior: UIScrollView.ContentInsetAdjustmentBehavior
    @objc public let appLocation: URL
    @objc public let appStartPath: String?
    @objc public let limitsNavigationsToAppBoundDomains: Bool
    @objc public let preferredContentMode: String?
    @objc public let legacyConfig: [String: Any]

    // MARK: - Initialization

    @objc public init(with descriptor: InstanceDescriptor, isDebug: Bool) {
        descriptor.normalize()

        self.appendedUserAgentString = descriptor.appendedUserAgentString
        self.overridenUserAgentString = descriptor.overridenUserAgentString
        self.backgroundColor = descriptor.backgroundColor
        self.allowedNavigationHostnames = descriptor.allowedNavigationHostnames
        self.scrollingEnabled = descriptor.scrollingEnabled
        self.zoomingEnabled = descriptor.zoomingEnabled
        self.allowLinkPreviews = descriptor.allowLinkPreviews
        self.handleApplicationNotifications = descriptor.handleApplicationNotifications
        self.contentInsetAdjustmentBehavior = descriptor.contentInsetAdjustmentBehavior
        self.appLocation = descriptor.appLocation
        self.appStartPath = descriptor.appStartPath
        self.limitsNavigationsToAppBoundDomains = descriptor.limitsNavigationsToAppBoundDomains
        self.preferredContentMode = descriptor.preferredContentMode
        self.pluginConfigurations = descriptor.pluginConfigurations
        self.isWebDebuggable = descriptor.isWebDebuggable
        self.hasInitialFocus = descriptor.hasInitialFocus
        self.legacyConfig = descriptor.legacyConfig
        self.errorPath = descriptor.errorPath
        self.cordovaDeployDisabled = descriptor.cordovaDeployDisabled

        switch descriptor.loggingBehavior {
        case .production:
            self.loggingEnabled = true
        case .debug:
            self.loggingEnabled = isDebug
        case .none:
            self.loggingEnabled = false
        @unknown default:
            self.loggingEnabled = false
        }

        self.localURL = URL(string: "\(descriptor.urlScheme)://\(descriptor.urlHostname)")!

        if let serverURLString = descriptor.serverURL {
            self.serverURL = URL(string: serverURLString) ?? self.localURL
        } else {
            self.serverURL = self.localURL
        }

        super.init()
    }

    @objc public init(with configuration: InstanceConfiguration, andLocation location: URL) {
        self.appendedUserAgentString = configuration.appendedUserAgentString
        self.overridenUserAgentString = configuration.overridenUserAgentString
        self.backgroundColor = configuration.backgroundColor
        self.allowedNavigationHostnames = configuration.allowedNavigationHostnames
        self.localURL = configuration.localURL
        self.serverURL = configuration.serverURL
        self.errorPath = configuration.errorPath
        self.pluginConfigurations = configuration.pluginConfigurations
        self.loggingEnabled = configuration.loggingEnabled
        self.scrollingEnabled = configuration.scrollingEnabled
        self.zoomingEnabled = configuration.zoomingEnabled
        self.allowLinkPreviews = configuration.allowLinkPreviews
        self.handleApplicationNotifications = configuration.handleApplicationNotifications
        self.isWebDebuggable = configuration.isWebDebuggable
        self.hasInitialFocus = configuration.hasInitialFocus
        self.cordovaDeployDisabled = configuration.cordovaDeployDisabled
        self.contentInsetAdjustmentBehavior = configuration.contentInsetAdjustmentBehavior
        self.legacyConfig = configuration.legacyConfig
        self.appStartPath = configuration.appStartPath
        self.appLocation = location
        self.limitsNavigationsToAppBoundDomains = configuration.limitsNavigationsToAppBoundDomains
        self.preferredContentMode = configuration.preferredContentMode

        super.init()
    }

    @objc public func updatingAppLocation(_ location: URL) -> InstanceConfiguration {
        InstanceConfiguration(with: self, andLocation: location)
    }
}
