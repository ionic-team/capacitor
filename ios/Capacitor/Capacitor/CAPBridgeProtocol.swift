import Foundation
import WebKit

@objc public protocol CAPBridgeProtocol: NSObjectProtocol {
    // MARK: - Environment Properties
    var viewController: UIViewController? { get }
    var config: InstanceConfiguration { get }
    var webView: WKWebView? { get }
    var notificationRouter: NotificationRouter { get }
    var isSimEnvironment: Bool { get }
    var isDevEnvironment: Bool { get }
    var userInterfaceStyle: UIUserInterfaceStyle { get }
    var autoRegisterPlugins: Bool { get }
    var statusBarVisible: Bool { get set }
    var statusBarStyle: UIStatusBarStyle { get set }
    var statusBarAnimation: UIStatusBarAnimation { get set }

    // MARK: - Deprecated
    @available(*, deprecated, renamed: "webView")
    func getWebView() -> WKWebView?

    @available(*, deprecated, renamed: "isSimEnvironment")
    func isSimulator() -> Bool

    @available(*, deprecated, renamed: "isDevEnvironment")
    func isDevMode() -> Bool

    @available(*, deprecated, renamed: "statusBarVisible")
    func getStatusBarVisible() -> Bool

    @available(*, deprecated, renamed: "statusBarStyle")
    func getStatusBarStyle() -> UIStatusBarStyle

    @available(*, deprecated, renamed: "userInterfaceStyle")
    func getUserInterfaceStyle() -> UIUserInterfaceStyle

    @available(*, deprecated, message: "Moved - equivalent is found on config.localURL")
    func getLocalUrl() -> String

    @available(*, deprecated, renamed: "savedCall(withID:)")
    func getSavedCall(_ callbackId: String) -> CAPPluginCall?

    @available(*, deprecated, renamed: "releaseCall(withID:)")
    func releaseCall(callbackId: String)

    // MARK: - Plugin Access
    func plugin(withName: String) -> CAPPlugin?

    // MARK: - Call Management
    func saveCall(_ call: CAPPluginCall)
    func savedCall(withID: String) -> CAPPluginCall?
    func releaseCall(_ call: CAPPluginCall)
    func releaseCall(withID: String)

    // MARK: - JavaScript Handling
    // `js` is a short name but needs to be preserved for backwards compatibility.
    // swiftlint:disable identifier_name
    func evalWithPlugin(_ plugin: CAPPlugin, js: String)
    func eval(js: String)
    // swiftlint:enable identifier_name

    func triggerJSEvent(eventName: String, target: String)
    func triggerJSEvent(eventName: String, target: String, data: String)

    func triggerWindowJSEvent(eventName: String)
    func triggerWindowJSEvent(eventName: String, data: String)

    func triggerDocumentJSEvent(eventName: String)
    func triggerDocumentJSEvent(eventName: String, data: String)

    // MARK: - Paths, Files, Assets
    func localURL(fromWebURL webURL: URL?) -> URL?
    func portablePath(fromLocalURL localURL: URL?) -> URL?
    func setServerBasePath(_ path: String)

    // MARK: - Plugins
    func registerPluginType(_ pluginType: CAPPlugin.Type)
    func registerPluginInstance(_ pluginInstance: CAPPlugin)

    // MARK: - View Presentation
    func showAlertWith(title: String, message: String, buttonTitle: String)
    func presentVC(_ viewControllerToPresent: UIViewController, animated flag: Bool, completion: (() -> Void)?)
    func dismissVC(animated flag: Bool, completion: (() -> Void)?)
}

/*
 Extensions to Obj-C protocols are not exposed to Obj-C code because of limitations in the runtime.
 Therefore these methods are implicitly Swift-only.

 The deprecated methods are declared here because they can be defined without colliding with the synthesized Obj-C setters
 for the respective properties (e.g. `setStatusBarVisible:` for 'statusBarVisible`).
 */
extension CAPBridgeProtocol {
    // variadic parameters cannot be exposed to Obj-C
    @available(*, deprecated, message: "Use CAPLog directly")
    public func modulePrint(_ plugin: CAPPlugin, _ items: Any...) {
        let output = items.map { String(describing: $0) }.joined(separator: " ")
        CAPLog.print("⚡️ ", plugin.pluginId, "-", output)
    }

    // default arguments are not permitted in protocol declarations
    public func alert(_ title: String, _ message: String, _ buttonTitle: String = "OK") {
        showAlertWith(title: title, message: message, buttonTitle: buttonTitle)
    }

    @available(*, deprecated, renamed: "statusBarVisible")
    public func setStatusBarVisible(_ visible: Bool) {
        statusBarVisible = visible
    }

    @available(*, deprecated, renamed: "statusBarStyle")
    public func setStatusBarStyle(_ style: UIStatusBarStyle) {
        statusBarStyle = style
    }

    @available(*, deprecated, renamed: "statusBarAnimation")
    public func setStatusBarAnimation(_ animation: UIStatusBarAnimation) {
        statusBarAnimation = animation
    }
}

/*
 Error(s) potentially exported by the bridge.
 */
public enum CapacitorBridgeError: Error {
    case errorExportingCoreJS
}

extension CapacitorBridgeError: CustomNSError {
    public static var errorDomain: String { "CapacitorBridge" }
    public var errorCode: Int {
        switch self {
        case .errorExportingCoreJS:
            return 0
        }
    }
    public var errorUserInfo: [String: Any] {
        return ["info": String(describing: self)]
    }
}

extension CapacitorBridgeError: LocalizedError {
    public var errorDescription: String? {
        return NSLocalizedString("Unable to export JavaScript bridge code to webview", comment: "Capacitor bridge initialization error")
    }
}
