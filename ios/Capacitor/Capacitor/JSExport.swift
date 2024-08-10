internal struct PluginHeaderMethod: Codable {
    let name: String
    let rtype: String?
}

internal struct PluginHeader: Codable {
    let name: String
    let methods: [PluginHeaderMethod]
}

/**
 JSExport handles defining JS APIs that map to registered plugins and are responsible for proxying calls to our bridge.
 */
internal class JSExport {
    static let catchallOptionsParameter = "_options"
    static let callbackParameter = "_callback"

    static func exportCapacitorGlobalJS(userContentController: WKUserContentController, isDebug: Bool, loggingEnabled: Bool, localUrl: String) throws {
        let data = "window.Capacitor = { DEBUG: \(isDebug), isLoggingEnabled: \(loggingEnabled), Plugins: {} }; window.WEBVIEW_SERVER_URL = '\(localUrl)';"
        let userScript = WKUserScript(source: data, injectionTime: .atDocumentStart, forMainFrameOnly: true)
        userContentController.addUserScript(userScript)
    }

    static func exportBridgeJS(userContentController: WKUserContentController) throws {
        let capBundle = Bundle(for: Self.self)
        guard let jsUrl = capBundle.url(forResource: "native-bridge", withExtension: "js") else {
            CAPLog.print("ERROR: Required native-bridge.js file in Capacitor not found. Bridge will not function!")
            throw CapacitorBridgeError.errorExportingCoreJS
        }
        do {
            try self.injectFile(fileURL: jsUrl, userContentController: userContentController)
        } catch {
            CAPLog.print("ERROR: Unable to read required native-bridge.js file from the Capacitor framework. Bridge will not function!")
            throw CapacitorBridgeError.errorExportingCoreJS
        }
    }

    static func exportCordovaJS(userContentController: WKUserContentController) throws {
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
     Export the JS required to implement the given plugin.
     */
    static func exportJS(for plugin: CapacitorPlugin, in userContentController: WKUserContentController) {
        var lines = [String]()

        lines.append("""
                    (function(w) {
                    var a = (w.Capacitor = w.Capacitor || {});
                    var p = (a.Plugins = a.Plugins || {});
                    var t = (p['\(plugin.jsName)'] = {});
                    t.addListener = function(eventName, callback) {
                    return w.Capacitor.addListener('\(plugin.jsName)', eventName, callback);
                    }
                    t.removeAllListeners = function() {
                    return w.Capacitor.nativePromise('\(plugin.jsName)', 'removeAllListeners');
                    }
                    """)

        for method in plugin.pluginMethods {
            lines.append(generateMethod(pluginClassName: plugin.jsName, method: method))
        }

        lines.append("""
            })(window);
            """)
        if let data = try? JSONEncoder().encode(createPluginHeader(for: plugin)),
           let header = String(data: data, encoding: .utf8) {
            lines.append("""
                (function(w) {
                var a = (w.Capacitor = w.Capacitor || {});
                var h = (a.PluginHeaders = a.PluginHeaders || []);
                h.push(\(header));
                })(window);
                """)
        }
        let js = lines.joined(separator: "\n")
        let userScript = WKUserScript(source: js, injectionTime: .atDocumentStart, forMainFrameOnly: true)
        userContentController.addUserScript(userScript)
    }

    private static func createPluginHeader(for plugin: CapacitorPlugin) -> PluginHeader? {
        let methods = [
            PluginHeaderMethod(name: "addListener", rtype: nil),
            PluginHeaderMethod(name: "removeListener", rtype: nil),
            PluginHeaderMethod(name: "removeAllListeners", rtype: "promise"),
            PluginHeaderMethod(name: "checkPermissions", rtype: "promise"),
            PluginHeaderMethod(name: "requestPermissions", rtype: "promise")
        ]

        return PluginHeader(
            name: plugin.jsName,
            methods: methods + plugin.pluginMethods.map(createPluginHeaderMethod)
        )

    }

    private static func createPluginHeaderMethod(method: CAPPluginMethod) -> PluginHeaderMethod {
        var rtype = method.returnType
        if rtype == "none" {
            rtype = nil
        }
        return PluginHeaderMethod(name: method.name, rtype: rtype)
    }

    private static func generateMethod(pluginClassName: String, method: CAPPluginMethod) -> String {
        let methodName = method.name!
        let returnType = method.returnType!
        var paramList = [String]()

        // add the catch-all
        // options argument which takes a full object and converts each
        // key/value pair into an option for plugin call.
        paramList.append(catchallOptionsParameter)

        // Automatically add the _callback param if returning data through a callback
        if returnType == CAPPluginReturnCallback {
            paramList.append(callbackParameter)
        }

        // Create a param string of the form "param1, param2, param3"
        let paramString = paramList.joined(separator: ", ")

        // Generate the argument object that will be sent on each call
        let argObjectString = catchallOptionsParameter

        var lines = [String]()

        // Create the function declaration
        lines.append("t['\(method.name!)'] = function(\(paramString)) {")

        // Create the call to Capacitor ...
        if returnType == CAPPluginReturnNone {
            // ...using none
            lines.append("""
                    return w.Capacitor.nativeCallback('\(pluginClassName)', '\(methodName)', \(argObjectString));
                    """)
        } else if returnType == CAPPluginReturnPromise {

            // ...using a promise
            lines.append("""
                    return w.Capacitor.nativePromise('\(pluginClassName)', '\(methodName)', \(argObjectString));
                    """)
        } else if returnType == CAPPluginReturnCallback {
            // ...using a callback
            lines.append("""
                    return w.Capacitor.nativeCallback('\(pluginClassName)', '\(methodName)', \(argObjectString), \(callbackParameter));
                    """)
        } else {
            CAPLog.print("Error: plugin method return type \(returnType) is not supported!")
        }

        // Close the function
        lines.append("}")
        return lines.joined(separator: "\n")
    }

    static func exportCordovaPluginsJS(userContentController: WKUserContentController) throws {
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
