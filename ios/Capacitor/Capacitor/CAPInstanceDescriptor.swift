import Foundation

public enum InstanceDescriptorDefaults {
    static let scheme = "capacitor"
    static let hostname = "localhost"
}

internal extension InstanceDescriptor {
    // swiftlint:disable:next identifier_name
    @objc func _parseConfiguration(at capacitorURL: URL?, cordovaConfiguration cordovaURL: URL?) {
        // sanity check that the app directory is valid
        var isDirectory: ObjCBool = ObjCBool(false)
        if warnings.contains(.missingAppDir) == false, (FileManager.default.fileExists(atPath: appLocation.path, isDirectory: &isDirectory) == false || isDirectory.boolValue == false) {
            warnings.update(with: .missingAppDir)
        }

        // parse the capacitor configuration
        var config: JSObject?
        if let capacitorURL = capacitorURL, FileManager.default.fileExists(atPath: capacitorURL.path, isDirectory: &isDirectory), isDirectory.boolValue == false {
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
        if let cordovaURL = cordovaURL, FileManager.default.fileExists(atPath: cordovaURL.path, isDirectory: &isDirectory), isDirectory.boolValue == false {
            configParser = XMLParser(contentsOf: cordovaURL)
        } else {
            warnings.update(with: .missingCordovaFile)
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
            if let hideLogs = (config[keyPath: "ios.hideLogs"] as? Bool) ?? (config[keyPath: "hideLogs"] as? Bool) {
                enableLogging = !hideLogs
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
                enableScrolling = scrollEnabled
            }
            if let pluginConfig = config[keyPath: "plugins"] as? JSObject {
                pluginConfigurations = pluginConfig
            }
        }
    }
}

extension InstanceDescriptor {
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
        if let server = serverURL, let _ = URL(string: server) {
            urlValid = true
        }
        if !urlValid {
            serverURL = nil
        }
        // if the plugin configuration was programmatically modified, the necessary type information may have been lost.
        // so perform a coercion here to make sure that casting will work as expected
        pluginConfigurations = JSTypes.coerceDictionaryToJSObject(pluginConfigurations) ?? [:]
        legacyConfig = JSTypes.coerceDictionaryToJSObject(legacyConfig) ?? [:]
    }
}
