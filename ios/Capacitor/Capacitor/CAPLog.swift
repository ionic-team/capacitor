public class CAPLog {
    public static var enableLogging: Bool = true
    
    private static var oneTimeConfigCheck: () -> () = {
        // `dispatch_once` is not available since Swift 3. but, since static properties are implicitly lazy,
        // this code will only execute once which is sufficient for our needs here. but since we need to do an
        // async dispatch, there is a window of time where the default value will be valid before the config
        // value(s) can be loaded.
        DispatchQueue.main.async {
            let config = CAPConfig()
            if let configFlag = (config.getValue("ios.hideLogs") as? Bool) ?? (config.getValue("hideLogs") as? Bool) {
                enableLogging = !configFlag
            }
        }
        return {}
    }()
    
    public static func print(_ items: Any..., separator: String = " ", terminator: String = "\n") {
        oneTimeConfigCheck()
        if enableLogging {
            for (itemIndex, item) in items.enumerated() {
                Swift.print(item, terminator: itemIndex == items.count - 1 ? terminator : separator)
            }
        }
    }
}
