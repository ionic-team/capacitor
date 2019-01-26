
@objc public class CAPConfig : NSObject {
  private static var instance: CAPConfig?
  
  private var config: [String:Any?]? = [String:Any?]()
  
  public static func getInstance() -> CAPConfig {
    if instance == nil {
      instance = CAPConfig()
    }
    return instance!
  }
  
  public static func loadConfig() {
    CAPConfig.getInstance()._loadConfig()
  }
  
  private func _loadConfig() {
    guard let configUrl = Bundle.main.url(forResource: "capacitor.config", withExtension: "json") else {
      print("Unable to find capacitor.config.json, make sure it exists and run npx cap copy")
      return
    }
    do {
      let contents = try Data(contentsOf: configUrl)
      guard let json = try JSONSerialization.jsonObject(with: contents) as? [String: Any] else {
        return
      }
      self.config = json
    } catch {
      print("Unable to parse capacitor.config.json. Make sure it's valid JSON")
    }
  }
  
  private func getConfigObjectDeepest(key: String) -> [String:Any?]? {
    let parts = key.split(separator: ".")
    
    var o = self.config
    for (_, k) in parts[0..<parts.count-1].enumerated() {
      o = self.config![String(k)] as? [String:Any?]
    }
    return o
  }
  
  private static func getConfigKey(_ key: String) -> String {
    let parts = key.split(separator: ".")
    if parts.last != nil {
      return String(parts.last!)
    }
    return ""
  }
  
  /**
   * Get the value of a configuration option for a specific plugin.
   */
  @objc public static func getPluginConfigValue(_ pluginId: String, _ configKey: String) -> Any? {
    guard let plugins = getInstance().config!["plugins"] as? [String:Any] else {
      return nil
    }
    
    guard let pluginOptions = plugins[pluginId] as? [String:Any] else {
      return nil
    }
    
    return pluginOptions[configKey]
  }
  
  @objc public static func getValue(_ key: String) -> Any? {
    let k = CAPConfig.getConfigKey(key)
    let o = getInstance().getConfigObjectDeepest(key: key)
    return o?[k] ?? nil
  }
  
  @objc public static func getString(_ key: String) -> String? {
    let value = getValue(key)
    if value == nil {
      return nil
    }
    return value as? String
  }
  
}
