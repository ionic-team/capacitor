import Foundation

@objc(CAPCookiesPlugin)
public class CAPCookiesPlugin: CAPPlugin {
    var cookieManager: CapacitorCookieManager?

    @objc override public func load() {
        cookieManager = CapacitorCookieManager(bridge?.config)
    }

    @objc func getCookies(_ call: CAPPluginCall) {
        guard let url = cookieManager!.getServerUrl(call.getString("url")) else { return call.reject("Invalid URL / Server URL")}
        call.resolve(cookieManager!.getCookiesAsMap(url))
    }

    @objc func setCookie(_ call: CAPPluginCall) {
        guard let key = call.getString("key") else { return call.reject("Must provide key") }
        guard let value = call.getString("value") else { return call.reject("Must provide value") }

        guard let url = cookieManager!.getServerUrl(call.getString("url")) else { return call.reject("Invalid domain") }

        let expires = call.getString("expires", "")
        let path = call.getString("path", "")
        cookieManager!.setCookie(url, key, cookieManager!.encode(value), expires, path)
        call.resolve()
    }

    @objc func deleteCookie(_ call: CAPPluginCall) {
        guard let key = call.getString("key") else { return call.reject("Must provide key") }
        guard let url = cookieManager!.getServerUrl(call.getString("url")) else { return call.reject("Invalid URL / Server URL")}
        cookieManager!.deleteCookie(url, key)
        call.resolve()
    }

    @objc func clearCookies(_ call: CAPPluginCall) {
        let url = cookieManager!.getServerUrl(call.getString("url"))
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
