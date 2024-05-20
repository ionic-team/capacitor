import Capacitor

public class CordovaPlugin: CAPPlugin, CAPBridgedPlugin {
    public let jsName = "__CordovaPlugin"
    public let pluginMethods: [CAPPluginMethod] = []
    public var identifier: String { jsName }

    public override func load() {
        injectJavascript()
        configureRuntime()
    }

    func configureRuntime() {
        let parser = CDVConfigParser()
        guard let pluginManager = CDVPluginManager(
            parser: parser,
            viewController: bridge?.viewController,
            webView: bridge?.webView
        ) else { return }


        for plugin in parser.startupPluginNames.compactMap({ $0 as? String }) {
            _ = pluginManager.getCommandInstance(plugin)
        }

        guard let bridge, let webView = bridge.webView else { return }

        exportCordovaPluginsJS(userContentController: webView.configuration.userContentController)

        bridge.registerCallInterceptor("cordova") { [pluginManager] dict in
            let pluginId = dict["service"] as? String ?? ""
            let method = dict["action"] as? String ?? ""
            let callbackId = dict["callbackId"] as? String ?? ""

            let args = dict["actionArgs"] as? Array ?? []
            let options = ["options": args]

            CAPLog.print("To Native Cordova -> ", pluginId, method, callbackId, options)

            if let plugin = pluginManager.getCommandInstance(pluginId.lowercased()) {
                let selector = NSSelectorFromString("\(method):")
                if !plugin.responds(to: selector) {
                    CAPLog.print("Error: Plugin \(plugin.className ?? "") does not respond to method call \(selector).")
                    CAPLog.print("Ensure plugin method exists and uses @objc in its declaration")
                    return
                }

                let arguments = options["options"] ?? []
                let pluginCall = CDVInvokedUrlCommand(
                    arguments: arguments,
                    callbackId: callbackId,
                    className: plugin.className,
                    methodName: method
                )

                plugin.perform(selector, with: pluginCall)

            } else {
                CAPLog.print("Error: Cordova Plugin mapping not found")
                return
            }
        }
        
        if (parser.settings?["DisableDeploy".lowercased()] as? NSString)?.boolValue ?? false {
            // TODO: Ensure that the previously persisted base path will be loaded
//            bridge.usePersistedBasePath()
        }
    }


    func injectJavascript() {
        guard let cordovaUrl = Bundle.main.url(forResource: "public/cordova", withExtension: "js") else {
            fatalError("ERROR: Required cordova.js file not found. Cordova plugins will not function!")
        }

        guard let cordovaPluginsUrl = Bundle.main.url(forResource: "public/cordova_plugins", withExtension: "js") else {
            fatalError("ERROR: Required cordova_plugins.js file not found. Cordova plugins  will not function!")
        }

        guard let webView = bridge?.webView else { return }

        injectFile(fileURL: cordovaUrl, userContentController: webView.configuration.userContentController)
        injectFile(fileURL: cordovaPluginsUrl, userContentController: webView.configuration.userContentController)
    }

    func exportCordovaPluginsJS(userContentController: WKUserContentController) {
        if let pluginsJSFolder = Bundle.main.url(forResource: "public/plugins", withExtension: nil) {
            self.injectFilesForFolder(folder: pluginsJSFolder, userContentController: userContentController)
        }
    }

    func injectFile(fileURL: URL, userContentController: WKUserContentController) {
        do {
            let data = try String(contentsOf: fileURL, encoding: .utf8)
            let userScript = WKUserScript(source: data, injectionTime: .atDocumentStart, forMainFrameOnly: true)
            userContentController.addUserScript(userScript)
        } catch {
            fatalError("Unable to inject js file")
        }
    }

    func injectFilesForFolder(folder: URL, userContentController: WKUserContentController) {
        let fileManager = FileManager.default
        do {
            let fileURLs = try fileManager.contentsOfDirectory(at: folder, includingPropertiesForKeys: nil, options: [])
            for fileURL in fileURLs {
                if fileURL.hasDirectoryPath {
                    injectFilesForFolder(folder: fileURL, userContentController: userContentController)
                } else {
                    injectFile(fileURL: fileURL, userContentController: userContentController)
                }
            }
        } catch {
            CAPLog.print("Error while enumerating files")
        }
    }
}
