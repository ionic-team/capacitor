import Foundation

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
    
    if let string = pluginOptions[configKey] as? String {
      return substituteTemplateValue(string: string)
    }
    
    if let stringArray = pluginOptions[configKey] as? [String] {
      return stringArray.map({ substituteTemplateValue(string: $0) })
    }
    
    return pluginOptions[configKey]
  }
  
  @objc public func getValue(_ key: String) -> Any? {
    let k = getConfigKey(key)
    let o = getConfigObjectDeepest(key: key)
    
    if let stringArray = o?[k] as? [String] {
      return stringArray.map({ substituteTemplateValue(string: $0) })
    }
    
    return o?[k] ?? nil
  }
    
  public func substituteTemplateValue(string: String) -> String? {
    
    let _pattern = "(?<=[^\\\\]|^)((?:\\\\\\\\)*)\\$\\((.+?)(?<=[^\\\\])(\\\\\\\\)*\\)"
    
    let regex = try! NSRegularExpression(pattern: _pattern, options: NSRegularExpression.Options.caseInsensitive)
    
    let range = NSRange(string.startIndex..<string.endIndex, in: string)
    
    var newString = string + ""
    
    regex.enumerateMatches(in: string, options: [], range: range) { (match, flags, stop) in
      guard let match = match else {
        return
      }
        
      guard let entireCaptureRange = Range(match.range(at: 0), in: description) else {
        return
      }
        
      guard let firstCaptureRange = Range(match.range(at: 1), in: description) else {
        return
      }
        
      guard let secondCaptureRange = Range(match.range(at: 2), in: description) else {
        return
      }
        
      var propertyListFormat =  PropertyListSerialization.PropertyListFormat.xml //Format of the Property List.
      var plistData: [String: AnyObject] = [:] //Our data
      let plistPath: String? = Bundle.main.path(forResource: "Info", ofType: "plist")! //the path of the data
      let plistXML = FileManager.default.contents(atPath: plistPath!)!
      do {//convert the data to a dictionary and handle errors.
        plistData = try PropertyListSerialization.propertyList(from: plistXML, options: .mutableContainersAndLeaves, format: &propertyListFormat) as! [String:AnyObject]
      } catch {
        print("Error reading plist: \(error), format: \(propertyListFormat)")
      }
        
      let key = String(string[secondCaptureRange])
        
      guard let newValue = plistData[key] else {
        CAPLog.print("Warning substitution not defined")
        return
      }
        
      newString = newString.replacingOccurrences(of: string[entireCaptureRange], with: "\(string[firstCaptureRange])\(newValue)")
    }
    
    return newString
  }
  
  @objc public func getString(_ key: String) -> String? {
    guard let value = getValue(key) as! String? else {
      return nil
    }
    
    return substituteTemplateValue(string: value)
  }
}
