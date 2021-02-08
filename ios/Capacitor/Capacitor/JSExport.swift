internal struct PluginHeaderMethod: Codable {
    let name: String
    let rtype: String?
}

internal struct PluginHeader: Codable {
    let name: String
    let methods: [PluginHeaderMethod]
}

/**
 * PluginExport handles defining JS APIs that map to registered
 * plugins and are responsible for proxying calls to our bridge.
 */
internal class JSExport {
    static let catchallOptionsParameter = "_options"
    static let callbackParameter = "_callback"

    public static func exportCapacitorGlobalJS(userContentController: WKUserContentController, isDebug: Bool, localUrl: String) throws {
        let data = "window.Capacitor = { DEBUG: \(isDebug), Plugins: {} }; window.WEBVIEW_SERVER_URL = '\(localUrl)';"
        let userScript = WKUserScript(source: data, injectionTime: .atDocumentStart, forMainFrameOnly: true)
        userContentController.addUserScript(userScript)
    }

    public static func exportCordovaJS(userContentController: WKUserContentController) throws {
        guard let cordovaUrl = Bundle.main.url(forResource: "public/cordova", withExtension: "js") else {
            CAPLog.print("ERROR: Required cordova.js file not found. Cordova plugins will not function!")
            throw CapacitorBridgeError.errorExportingCoreJS
        }
        guard let cordovaPluginsUrl = Bundle.main.url(forResource: "public/cordova_plugins", withExtension: "js") else {
            CAPLog.print("ERROR: Required cordova_plugins.js file not found. Cordova plugins  will not function!")
            throw CapacitorBridgeError.errorExportingCoreJS
        }
        do {
            try self.injectFile(fileURL: cordovaUrl, userContentController: userContentController)
            try self.injectFile(fileURL: cordovaPluginsUrl, userContentController: userContentController)
        } catch {
            CAPLog.print("ERROR: Unable to read required cordova files. Cordova plugins will not function!")
            throw CapacitorBridgeError.errorExportingCoreJS
        }
    }

    /**
     * Export the JS required to implement the given plugin.
     */
    public static func exportJS(userContentController: WKUserContentController, pluginClassName: String, pluginType: CAPPlugin.Type) {
        if let data = try? JSONEncoder().encode(createPluginHeader(pluginClassName: pluginClassName, pluginType: pluginType)), let header = String(data: data, encoding: .utf8) {
            let js = """
                (function(w) {
                var a = (w.Capacitor = w.Capacitor || {});
                var h = (a.PluginHeaders = a.PluginHeaders || []);
                h.push(\(header));
                })(window);
                """
            let userScript = WKUserScript(source: js, injectionTime: .atDocumentStart, forMainFrameOnly: true)
            userContentController.addUserScript(userScript)
        }
    }

    private static func createPluginHeader(pluginClassName: String, pluginType: CAPPlugin.Type) -> PluginHeader? {
        if let bridgeType = pluginType as? CAPBridgedPlugin.Type, let pluginMethods = bridgeType.pluginMethods() as? [CAPPluginMethod] {
            let methods = [
                PluginHeaderMethod(name: "addListener", rtype: nil),
                PluginHeaderMethod(name: "removeListener", rtype: nil),
                PluginHeaderMethod(name: "removeAllListeners", rtype: nil),
                PluginHeaderMethod(name: "checkPermissions", rtype: "promise"),
                PluginHeaderMethod(name: "requestPermissions", rtype: "promise")
            ]
            return PluginHeader(name: pluginClassName, methods: methods + pluginMethods.map { createPluginHeaderMethod(method: $0) })
        }

        return nil
    }

    private static func createPluginHeaderMethod(method: CAPPluginMethod) -> PluginHeaderMethod {
        var rtype = method.returnType
        if rtype == "none" {
            rtype = nil
        }
        return PluginHeaderMethod(name: method.name, rtype: rtype)
    }

    public static func exportCordovaPluginsJS(userContentController: WKUserContentController) throws {
        if let pluginsJSFolder = Bundle.main.url(forResource: "public/plugins", withExtension: nil) {
            self.injectFilesForFolder(folder: pluginsJSFolder, userContentController: userContentController)
        }
    }

    static func injectFilesForFolder(folder: URL, userContentController: WKUserContentController) {
        let fileManager = FileManager.default
        do {
            let fileURLs = try fileManager.contentsOfDirectory(at: folder, includingPropertiesForKeys: nil, options: [])
            for fileURL in fileURLs {
                if fileURL.hasDirectoryPath {
                    injectFilesForFolder(folder: fileURL, userContentController: userContentController)
                } else {
                    try self.injectFile(fileURL: fileURL, userContentController: userContentController)
                }
            }
        } catch {
            CAPLog.print("Error while enumerating files")
        }
    }

    static func injectFile(fileURL: URL, userContentController: WKUserContentController) throws {
        do {
            let data = try String(contentsOf: fileURL, encoding: .utf8)
            let userScript = WKUserScript(source: data, injectionTime: .atDocumentStart, forMainFrameOnly: true)
            userContentController.addUserScript(userScript)
        } catch {
            CAPLog.print("Unable to inject js file")
        }
    }
}
