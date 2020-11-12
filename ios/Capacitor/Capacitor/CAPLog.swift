public class CAPLog {
    public static var enableLogging: Bool = true

    public static func print(_ items: Any..., separator: String = " ", terminator: String = "\n") {
        if enableLogging {
            for (itemIndex, item) in items.enumerated() {
                Swift.print(item, terminator: itemIndex == items.count - 1 ? terminator : separator)
            }
        }
    }
}
