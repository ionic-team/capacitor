import Foundation

public enum InstanceDescriptorDefaults {
    static let scheme = "capacitor"
    static let hostname = "localhost"
}

private extension InstanceLoggingBehavior {
    static func behavior(from: String) -> InstanceLoggingBehavior? {
        switch from.lowercased() {
        case "none":
            return InstanceLoggingBehavior.none
        case "debug":
            return InstanceLoggingBehavior.debug
        case "production":
            return InstanceLoggingBehavior.production
        default:
            return nil
        }
    }
}

/**
 The purpose of this function is to hide the messy details of parsing the configuration(s) so
 the complexity is worth it. And the name starts with an underscore to match the convention of
 private APIs in Obj-C (from which it is called).
 */
internal extension InstanceDescriptor {
    // swiftlint:disable cyclomatic_complexity
    // swiftlint:disable function_body_length
    // swiftlint:disable:next identifier_name
    @objc func _parseConfiguration(at capacitorURL: URL?, cordovaConfiguration cordovaURL: URL?) {
        // sanity check that the app directory is valid
        var isDirectory: ObjCBool = ObjCBool(false)
        if warnings.contains(.missingAppDir) == false,
           (FileManager.default.fileExists(atPath: appLocation.path, isDirectory: &isDirectory) == false || isDirectory.boolValue == false) {
            warnings.update(with: .missingAppDir)
        }

        // parse the capacitor configuration
        var config: JSObject?
        if let capacitorURL = capacitorURL,
           FileManager.default.fileExists(atPath: capacitorURL.path, isDirectory: &isDirectory),
           isDirectory.boolValue == false {
            do {
                let contents = try Data(contentsOf: capacitorURL)
                config = JSTypes.coerceDictionaryToJSObject(try JSONSerialization.jsonObject(with: contents) as? [String: Any])
            } catch {
                warnings.update(with: .invalidFile)
            }
        } else {
            warnings.update(with: .missingFile)
        }

        // parse the cordova configuration
        var configParser: XMLParser?
        if let cordovaURL = cordovaURL,
           FileManager.default.fileExists(atPath: cordovaURL.path, isDirectory: &isDirectory),
           isDirectory.boolValue == false {
            configParser = XMLParser(contentsOf: cordovaURL)
        } else {
            warnings.update(with: .missingCordovaFile)
            // we don't want to break up string literals
            // swiftlint:disable:next line_length
            if let cordovaXML = "<?xml version='1.0' encoding='utf-8'?><widget version=\"1.0.0\" xmlns=\"http://www.w3.org/ns/widgets\" xmlns:cdv=\"http://cordova.apache.org/ns/1.0\"><access origin=\"*\" /></widget>".data(using: .utf8) {
                configParser = XMLParser(data: cordovaXML)
            }
        }
        configParser?.delegate = cordovaConfiguration
        configParser?.parse()

        // extract our configuration values
        if let config = config {
            // to be removed
            legacyConfig = config

            if let agentString = (config[keyPath: "ios.appendUserAgent"] as? String) ?? (config[keyPath: "appendUserAgent"] as? String) {
                appendedUserAgentString = agentString
            }
            if let agentString = (config[keyPath: "ios.overrideUserAgent"] as? String) ?? (config[keyPath: "overrideUserAgent"] as? String) {
                overridenUserAgentString = agentString
            }
            if let colorString = (config[keyPath: "ios.backgroundColor"] as? String) ?? (config[keyPath: "backgroundColor"] as? String),
               let color = UIColor.capacitor.color(fromHex: colorString) {
                backgroundColor = color
            }
            if let allowNav = config[keyPath: "server.allowNavigation"] as? [String] {
                allowedNavigationHostnames = allowNav
            }
            if let scheme = (config[keyPath: "server.iosScheme"] as? String)?.lowercased() {
                urlScheme = scheme
            }
            if let host = config[keyPath: "server.hostname"] as? String {
                urlHostname = host
            }
            if let urlString = config[keyPath: "server.url"] as? String {
                serverURL = urlString
            }
            if let errorPathString = (config[keyPath: "server.errorPath"] as? String) {
                errorPath = errorPathString
            }
            if let insetBehavior = config[keyPath: "ios.contentInset"] as? String {
                let availableInsets: [String: UIScrollView.ContentInsetAdjustmentBehavior] = ["automatic": .automatic,
                                                                                              "scrollableAxes": .scrollableAxes,
                                                                                              "never": .never,
                                                                                              "always": .always]
                if let option = availableInsets[insetBehavior] {
                    contentInsetAdjustmentBehavior = option
                }
            }
            if let allowPreviews = config[keyPath: "ios.allowsLinkPreview"] as? Bool {
                allowLinkPreviews = allowPreviews
            }
            if let scrollEnabled = config[keyPath: "ios.scrollEnabled"] as? Bool {
                scrollingEnabled = scrollEnabled
            }
            if let pluginConfig = config[keyPath: "plugins"] as? JSObject {
                pluginConfigurations = pluginConfig
            }
            if let value = (config[keyPath: "ios.loggingBehavior"] as? String) ?? (config[keyPath: "loggingBehavior"] as? String) {
                if let behavior = InstanceLoggingBehavior.behavior(from: value) {
                    loggingBehavior = behavior
                }
            }
            if let limitsNavigations = config[keyPath: "ios.limitsNavigationsToAppBoundDomains"] as? Bool {
                limitsNavigationsToAppBoundDomains = limitsNavigations
            }
            if let preferredMode = (config[keyPath: "ios.preferredContentMode"] as? String) {
                preferredContentMode = preferredMode
            }
            if let handleNotifications = config[keyPath: "ios.handleApplicationNotifications"] as? Bool {
                handleApplicationNotifications = handleNotifications
            }
            if let webContentsDebuggingEnabled = config[keyPath: "ios.webContentsDebuggingEnabled"] as? Bool {
                isWebDebuggable = webContentsDebuggingEnabled
            } else {
                #if DEBUG
                isWebDebuggable = true
                #endif
            }
        }
    }
    // swiftlint:enable cyclomatic_complexity
    // swiftlint:enable function_body_length
}

extension InstanceDescriptor {
    @objc public var cordovaDeployDisabled: Bool {
        return (cordovaConfiguration.settings?["DisableDeploy".lowercased()] as? NSString)?.boolValue ?? false
    }

    @objc public func normalize() {
        // first, make sure the scheme is valid
        var schemeValid = false
        if let scheme = urlScheme, WKWebView.handlesURLScheme(scheme) == false,
           scheme.range(of: "^[a-z][a-z0-9.+-]*$", options: [.regularExpression, .caseInsensitive], range: nil, locale: nil) != nil {
            schemeValid = true
        }
        if !schemeValid {
            // reset to the default
            urlScheme = InstanceDescriptorDefaults.scheme
        }
        // make sure we have a hostname
        if urlHostname == nil {
            urlHostname = InstanceDescriptorDefaults.hostname
        }
        // now validate the server.url
        var urlValid = false
        if let server = serverURL, URL(string: server) != nil {
            urlValid = true
        }
        if !urlValid {
            serverURL = nil
        }
        // reset the path if it's not valid
        if let path = appStartPath?.trimmingCharacters(in: .whitespacesAndNewlines), path.isEmpty {
            appStartPath = nil
        }
        // if the plugin configuration was programmatically modified, the necessary type information may have been lost.
        // so perform a coercion here to make sure that casting will work as expected
        pluginConfigurations = JSTypes.coerceDictionaryToJSObject(pluginConfigurations) ?? [:]
        legacyConfig = JSTypes.coerceDictionaryToJSObject(legacyConfig) ?? [:]
    }
}
