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

    public var hideHomeIndicator: Bool = false

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
        let inset = call.getString("inset")?.uppercased()

        if let animation = call.getString("animation") {
            setAnimation(animation: animation)
        }

        DispatchQueue.main.async {
            self.setHidden(hidden: false, inset: inset)
            call.resolve()
        }
    }

    @objc func hide(_ call: CAPPluginCall) {
        let inset = call.getString("inset")?.uppercased()

        if let animation = call.getString("animation") {
            setAnimation(animation: animation)
        }

        DispatchQueue.main.async {
            self.setHidden(hidden: true, inset: inset)
            call.resolve()
        }
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

    func setHidden(hidden: Bool, inset: String? = nil) {
        if hidden {
            if inset == nil || inset == "TOP" {
                bridge?.statusBarVisible = false
            }

            if inset == nil || inset == "BOTTOM" {
                hideHomeIndicator = true
                bridge?.viewController?.setNeedsUpdateOfHomeIndicatorAutoHidden()
            }

            return
        }

        if inset == nil || inset == "TOP" {
            bridge?.statusBarVisible = true
        }

        if inset == nil || inset == "BOTTOM" {
            hideHomeIndicator = false
            bridge?.viewController?.setNeedsUpdateOfHomeIndicatorAutoHidden()
        }

    }

    func setAnimation(animation: String) {
        if animation == "NONE" {
            bridge?.statusBarAnimation = .none
        } else {
            bridge?.statusBarAnimation = .fade
        }
    }
}

extension CAPBridgeViewController {
    override public var prefersHomeIndicatorAutoHidden: Bool {
        if let systemBarPlugin = self.bridge?.plugin(withName: "SystemBars") as? CAPSystemBarsPlugin {
            return systemBarPlugin.hideHomeIndicator
        }

        return false
    }
}
