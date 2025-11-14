import Foundation

@objc(CAPSystemBarsPlugin)
public class CAPSystemBarsPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "CAPSystemBarsPlugin"
    public let jsName = "SystemBars"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "setStyle", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setAnimation", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "show", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "hide", returnType: CAPPluginReturnPromise)
    ]

    public private(set) var hideHomeIndicator: Bool = false

    enum Style: String {
        case dark = "DARK"
        case light = "LIGHT"
        case defaultStyle = "DEFAULT"
    }

    @objc override public func load() {
        let hidden = getConfig().getBoolean("hidden", false)

        if let style = getConfig().getString("style", "DEFAULT") {
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
        let bar = call.getString("bar")

        if let animation = call.getString("animation") {
            setAnimation(animation: animation)
        }

        DispatchQueue.main.async {
            self.setHidden(hidden: false, bar: bar)
            call.resolve()
        }
    }

    @objc func hide(_ call: CAPPluginCall) {
        let bar = call.getString("bar")

        if let animation = call.getString("animation") {
            setAnimation(animation: animation)
        }

        DispatchQueue.main.async {
            self.setHidden(hidden: true, bar: bar)
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

        if let style = Style(rawValue: style.uppercased()) {
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

    func setHidden(hidden: Bool, bar: String? = nil) {
        if hidden {
            if bar == nil || bar?.isEmpty ?? true || bar == "StatusBar" {
                bridge?.statusBarVisible = false
            }

            if bar == nil || bar?.isEmpty ?? true || bar == "NavigationBar" {
                hideHomeIndicator = true
                bridge?.viewController?.setNeedsUpdateOfHomeIndicatorAutoHidden()
            }

            return
        }

        if bar == nil || bar?.isEmpty ?? true || bar == "StatusBar" {
            bridge?.statusBarVisible = true
        }

        if bar == nil || bar?.isEmpty ?? true || bar == "NavigationBar" {
            hideHomeIndicator = false
            bridge?.viewController?.setNeedsUpdateOfHomeIndicatorAutoHidden()
        }

    }

    func setAnimation(animation: String) {
        if animation.uppercased() == "NONE" {
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
