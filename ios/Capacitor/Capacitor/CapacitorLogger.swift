import Foundation
import OSLog

enum CapacitorLogLevel {
    case debug
    case warn
    case error
    
    init(string: String) {
        switch string {
        case "warning":
            self = .warn
        case "error":
            self = .error
        default:
            self = .debug
        }
    }
}

struct CapacitorLogger {
    let logger: Logger
    
    init(category: String) {
        let bundleName = Bundle.main.bundleIdentifier ?? "error.help"
        logger = Logger(subsystem: bundleName, category: category)
    }
    
    func log(message: String, level: CapacitorLogLevel = .debug) {
        switch level {
        case .debug:
            logger.info("\(message)")
        case .warn:
            logger.warning("\(message)")
        case .error:
            logger.fault("\(message)")
        }
    }
    
    func debug(message: String) {
        self.log(message: message, level: .debug)
    }
    
    func warn(message: String) {
        self.log(message: message, level: .warn)
    }
    
    func error(message: String) {
        self.log(message: message, level: .error)
    }
}

public class CAPLog {
    public static var enableLogging: Bool = true

    @available(*, deprecated, message: "Use CapacitorLogger Instead")
    public static func print(_ items: Any..., separator: String = " ", terminator: String = "\n") {
        let logger = CapacitorLogger(category: "CAPLog.print")
        var stringToLog = ""
        for item in items {
            stringToLog += "\(item)" + separator
        }
        stringToLog += terminator
        
        if enableLogging {
            logger.debug(message: stringToLog)
        }
    }
}
