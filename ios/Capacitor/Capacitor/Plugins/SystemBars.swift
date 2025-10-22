import Foundation

@objc(CAPSystemBarsPlugin)
public class CAPSystemBarsPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "CAPSystemBarsPlugin"
    public let jsName = "SystemBars"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "setStyle", returnType: CAPPluginReturnNone),
        CAPPluginMethod(name: "setHidden", returnType: CAPPluginReturnNone),
        CAPPluginMethod(name: "setAnimation", returnType: CAPPluginReturnNone)
    ]

    enum Style: String {
        case dark = "DARK"
        case light = "LIGHT"
        case defaultStyle = "DEFAULT"
    }
    
    @objc override public func load() {
        let style = getConfig().getString("style", Style.defaultStyle.rawValue) ?? Style.defaultStyle.rawValue
        let hidden = getConfig().getBoolean("hidden", false)
        let animation = getConfig().getString("animation", "FADE") ?? "FADE"
        
        setStyle(style: style)
        setHidden(hidden: hidden)
        setAnimation(animation: animation)
    }

    @objc func setStyle(_ call: CAPPluginCall) {
        setStyle(style: call.getString("style") ?? Style.defaultStyle.rawValue)
        
        call.resolve()
    }

    @objc func setHidden(_ call: CAPPluginCall) {
        let hidden = call.getBool("hidden") ?? false
        setHidden(hidden: hidden)
        
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
