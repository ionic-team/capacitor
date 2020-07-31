import Foundation

/**
 *  Storage Plugin
 */
@objc(CAPStoragePlugin)
public class CAPStoragePlugin: CAPPlugin {
    let keyPrefix = "_cap_"

    override public func load() {
    }

    func getDefaults() -> UserDefaults {
        return UserDefaults.standard
    }

    @objc func get(_ call: CAPPluginCall) {
        guard let key = call.getString("key") else {
            call.error("Must provide a key")
            return
        }

        let value = getDefaults().string(forKey: makeKey(key))
        call.resolve([
            "value": value as Any
        ])
    }

    @objc func set(_ call: CAPPluginCall) {
        guard let key = call.getString("key") else {
            call.error("Must provide a key")
            return
        }
        let value = call.getString("value", "")

        getDefaults().set(value, forKey: makeKey(key))

        call.resolve()
    }

    @objc func remove(_ call: CAPPluginCall) {
        guard let key = call.getString("key") else {
            call.error("Must provide a key")
            return
        }

        getDefaults().removeObject(forKey: makeKey(key))

        call.resolve()
    }

    @objc func keys(_ call: CAPPluginCall) {
        let keys = getDefaults().dictionaryRepresentation().keys.filter({ (key) -> Bool in
            return isKey(key)
        }).map({ (key) -> String in
            return getKey(key)
        })

        call.resolve([
            "keys": keys
        ])
    }

    @objc func clear(_ call: CAPPluginCall) {
        getDefaults().dictionaryRepresentation().keys.filter({ (key) -> Bool in
            return isKey(key)
        }).forEach { (key) in
            getDefaults().removeObject(forKey: key)
        }
        call.resolve()
    }

    func makeKey(_ key: String) -> String {
        return keyPrefix + key
    }

    func isKey(_ key: String) -> Bool {
        return key.hasPrefix(keyPrefix)
    }

    func getKey(_ key: String) -> String {
        let prefixLen = keyPrefix.count
        return String(key.dropFirst(prefixLen))
    }
}
