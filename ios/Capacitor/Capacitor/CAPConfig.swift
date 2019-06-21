
@objc public class CAPConfig : NSObject {
  private static var instance: CAPConfig?
  
  private var config: [String:Any?]? = [String:Any?]()
  
  public init(_ configText: String? = nil) {
    super.init()
    if let contents = configText {
      guard let configData = contents.data(using: .utf8) else {
        CAPLog.print("Unable to process config JSON string as UTF8")
        return
      }

      parseAndSetConfig(configData)
    } else {
      loadGlobalConfig()
    }
  }

  private func loadGlobalConfig() {
    guard let configUrl = Bundle.main.url(forResource: "capacitor.config", withExtension: "json") else {
      CAPLog.print("Unable to find capacitor.config.json, make sure it exists and run npx cap copy")
      return
    }
    do {
      let contents = try Data(contentsOf: configUrl)
      parseAndSetConfig(contents)
    } catch {
      CAPLog.print("Unable to parse capacitor.config.json. Make sure it's valid JSON")
    }
  }
  
  private func parseAndSetConfig(_ data: Data) {
    do {
      let json = try JSONSerialization.jsonObject(with: data) as? [String: Any]
      self.config = json
    } catch {
      CAPLog.print("Unable to parse config JSON")
      CAPLog.print(error.localizedDescription)
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
  
  private func getConfigKey(_ key: String) -> String {
    let parts = key.split(separator: ".")
    if parts.last != nil {
      return String(parts.last!)
    }
    return ""
  }
  
  /**
   * Get the value of a configuration option for a specific plugin.
   */
  @objc public func getPluginConfigValue(_ pluginId: String, _ configKey: String) -> Any? {
    guard let plugins = config!["plugins"] as? [String:Any] else {
      return nil
    }
    
    guard let pluginOptions = plugins[pluginId] as? [String:Any] else {
      return nil
    }
    
    return pluginOptions[configKey]
  }
  
  @objc public func getValue(_ key: String) -> Any? {
    let k = getConfigKey(key)
    let o = getConfigObjectDeepest(key: key)
    return o?[k] ?? nil
  }
  
  @objc public func getString(_ key: String) -> String? {
    let value = getValue(key)
    if value == nil {
      return nil
    }
    return value as? String
  }
}
