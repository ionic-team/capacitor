import Foundation

@objc(CAPCookiesPlugin)
public class CAPCookiesPlugin: CAPPlugin {
    var cookieManager: CapacitorCookieManager?

    @objc override public func load() {
        cookieManager = CapacitorCookieManager(bridge?.config)
    }

    @objc func setCookie(_ call: CAPPluginCall) {
        guard let key = call.getString("key") else { return call.reject("Must provide key") }
        guard let value = call.getString("value") else { return call.reject("Must provide value") }

        let url = cookieManager!.getServerUrl(call)
        if url != nil {
            cookieManager!.setCookie(url!, key, cookieManager!.encode(value))
            call.resolve()
        }
    }

    @objc func deleteCookie(_ call: CAPPluginCall) {
        guard let key = call.getString("key") else { return call.reject("Must provide key") }
        let url = cookieManager!.getServerUrl(call)
        if url != nil {
            let jar = HTTPCookieStorage.shared

            let cookie = jar.cookies(for: url!)?.first(where: { (cookie) -> Bool in
                return cookie.name == key
            })

            if cookie != nil {
                jar.deleteCookie(cookie!)
            }

            call.resolve()
        }
    }

    @objc func clearCookies(_ call: CAPPluginCall) {
        let url = cookieManager!.getServerUrl(call)
        if url != nil {
            cookieManager!.clearCookies(url!)
            call.resolve()
        }
    }

    @objc func clearAllCookies(_ call: CAPPluginCall) {
        cookieManager!.clearAllCookies()
        call.resolve()
    }
}
