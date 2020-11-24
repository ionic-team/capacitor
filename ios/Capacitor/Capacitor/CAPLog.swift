public class CAPLog {

    public static let config = CAPConfig()
 
    public static func print(_ items: Any..., separator: String = " ", terminator: String = "\n") {
        if !self.hideLogs() {
            for (itemIndex, item) in items.enumerated() {
                Swift.print(loggableString(forItem: item), terminator: itemIndex == items.count - 1 ? terminator : separator)
            }
        }
    }
    
    private static func loggableString(forItem item: Any, maxLenght: Int = 2048) -> String {
        let string = "\(item)"
        return String(string.prefix(maxLenght))
    }

    public static func hideLogs() -> Bool {
        if let hideLogs = (config.getValue("ios.hideLogs") as? Bool) ?? (config.getValue("hideLogs") as? Bool) {
            return hideLogs
        }
        return false
    }
}

