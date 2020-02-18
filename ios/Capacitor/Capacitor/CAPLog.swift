public class CAPLog {

  public static let config = CAPConfig()
  
  public static func print(_ items: Any..., separator: String = " ", terminator: String = "\n") {
    if !self.hideLogs() {
      for i in 0..<items.count {
        Swift.print(items[i], terminator: i == items.count - 1 ? terminator : separator)
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
