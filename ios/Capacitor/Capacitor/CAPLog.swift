public class CAPLog {

  public static let config = CAPConfig()
  
  public static func print(_ items: Any..., separator: String = " ", terminator: String = "") {
    if !self.hideLogs() {
      for item in items {
        Swift.print(item, separator, terminator)
      }
    }
  }

  public static func hideLogs() -> Bool {
    if let hideLogs = config.getValue("ios.hideLogs") as? Bool {
      return hideLogs
    }
    return false
  }
}
