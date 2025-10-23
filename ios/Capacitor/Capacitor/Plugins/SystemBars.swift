import Foundation

@objc(CAPSystemBarsPlugin)
public class CAPSystemBarsPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "CAPSystemBarsPlugin"
    public let jsName = "SystemBars"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "setStyle", returnType: CAPPluginReturnNone),
        CAPPluginMethod(name: "setAnimation", returnType: CAPPluginReturnNone),
        CAPPluginMethod(name: "show", returnType: CAPPluginReturnNone),
        CAPPluginMethod(name: "hide", returnType: CAPPluginReturnNone)
    ]

    enum Style: String {
        case dark = "DARK"
        case light = "LIGHT"
        case defaultStyle = "DEFAULT"
    }

    @objc override public func load() {
        let hidden = getConfig().getBoolean("hidden", false)

        if let style = getConfig().getString("style") {
            setStyle(style: style)
        }

        if let animation = getConfig().getString("animation") {
            setAnimation(animation: animation)
        }

        setHidden(hidden: hidden)
    }

    @objc func setStyle(_ call: CAPPluginCall) {
        setStyle(style: call.getString("style") ?? Style.defaultStyle.rawValue)

        call.resolve()
    }

    @objc func show(_ call: CAPPluginCall) {
        if let animation = call.getString("animation") {
            setAnimation(animation: animation)
        }

        setHidden(hidden: false)

        call.resolve()
    }

    @objc func hide(_ call: CAPPluginCall) {
        if let animation = call.getString("animation") {
            setAnimation(animation: animation)
        }

        setHidden(hidden: true)

        call.resolve()
    }

    @objc func setAnimation(_ call: CAPPluginCall) {
        let animation = call.getString("animation", "FADE")
        setAnimation(animation: animation)

        call.resolve()
    }

    func setStyle(style: String) {
        var newStyle: UIStatusBarStyle = .default

        if let style = Style(rawValue: style) {
            switch style {
            case .dark:
                newStyle = .lightContent
            case .light:
                newStyle = .darkContent
            case .defaultStyle:
                newStyle = .default
            }
        }

        bridge?.statusBarStyle = newStyle
    }

    func setHidden(hidden: Bool) {
        bridge?.statusBarVisible = !hidden
    }

    func setAnimation(animation: String) {
        if animation == "NONE" {
            bridge?.statusBarAnimation = .none
        } else {
            bridge?.statusBarAnimation = .fade
        }
    }
}
