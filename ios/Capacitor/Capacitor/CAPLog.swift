@objc public class CAPLog : NSObject {

  @objc public static func add(message: String) {
    if (self.useLog() as? Bool != false) {
      print(message)
    }
  }
  
  @objc public static func useLog() -> Any? {
    let isProduction = CAPConfig.getValue("production") as? Bool
    if (isProduction != true) {
      return true
    }
    return false
  }
}
