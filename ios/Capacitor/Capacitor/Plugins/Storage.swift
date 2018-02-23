import Foundation

/**
 *  Storage Plugin
 */
@objc(CAPStoragePlugin)
public class CAPStoragePlugin: CAPPlugin {
  @objc func get(_ call: CAPPluginCall) {
    guard let key = call.getString("key") else {
      call.error("Must provide a key")
      return
    }
    let value: String? = UserDefaults.standard.string(forKey: key)
    call.success([
      "value": value
    ])
  }
  
  @objc func set(_ call: CAPPluginCall) {
    guard let key = call.getString("key") else {
      call.error("Must provide a key")
      return
    }
    let value = call.getString("value", "")
    
    
    UserDefaults.standard.set(value, forKey: key)
    
    call.success()
  }
  
  @objc func remove(_ call: CAPPluginCall) {
    guard let key = call.getString("key") else {
      call.error("Must provide a key")
      return
    }

    UserDefaults.standard.removeObject(forKey: key)
    
    call.success()
  }
  
  @objc func keys(_ call: CAPPluginCall) {
    let keys = Array(UserDefaults.standard.persistentDomain(forName: Bundle.main.bundleIdentifier!)!.keys)
    call.success([
      "keys":  keys
    ])
  }
  
  @objc func clear(_ call: CAPPluginCall) {
    let appDomain = Bundle.main.bundleIdentifier!
    UserDefaults.standard.removePersistentDomain(forName: appDomain)
  }
}


