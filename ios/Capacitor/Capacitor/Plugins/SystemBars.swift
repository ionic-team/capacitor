import Foundation

@objc(CAPSystemBarsPlugin)
public class CAPSystemBarsPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "CAPSystemBarsPlugin"
    public let jsName = "SystemBars"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "setStyle", returnType: CAPPluginReturnNone),
        CAPPluginMethod(name: "setHidden", returnType: CAPPluginReturnNone)
    ]

    enum Style: String {
        case dark = "DARK"
        case light = "LIGHT"
    }

    @objc func setStyle(_ call: CAPPluginCall) {
        var newStyle: UIStatusBarStyle = .default

        if let style = Style(rawValue: call.getString("style") ?? "") {
            switch style {
            case .dark:
                newStyle = .darkContent
            case .light:
                newStyle = .lightContent
            }
        }

        bridge?.statusBarStyle = newStyle
    }

    @objc func setHidden(_ call: CAPPluginCall) {
        let hidden = call.getBool("hidden") ?? false
        bridge?.statusBarVisible = !hidden
    }
}
