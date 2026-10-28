import Foundation

public struct KeyPath {
    var segments: [String]
    var isEmpty: Bool { return segments.isEmpty }
    var path: String {
        return segments.joined(separator: ".")
    }

    // initializers
    init(_ string: String) {
        self.segments = string.components(separatedBy: ".")
    }

    init(segments: [String]) {
        self.segments = segments
    }

    // returns a tuple of the first segment and the remaining key path. result is nil if the key path has no segments.
    func headAndRemainder() -> (head: String, remainder: KeyPath)? {
        guard !isEmpty else {
            return nil
        }
        var paths = segments
        let head = paths.removeFirst()
        return (head, KeyPath(segments: paths))
    }
}

extension KeyPath: ExpressibleByStringLiteral {
    public init(stringLiteral value: String) {
        self.init(value)
    }

    public init(unicodeScalarLiteral value: String) {
        self.init(value)
    }

    public init(extendedGraphemeClusterLiteral value: String) {
        self.init(value)
    }
}

extension JSObject {
    public subscript(keyPath keyPath: KeyPath) -> JSValue? {
        switch keyPath.headAndRemainder() {
        case nil: // path is empty
            return nil
        case let (head, remainder)? where remainder.isEmpty: // reached the end of the path
            return self[head]
        case let (head, remainder)?: // we have at least one level to traverse
            switch self[head] {
            case let childObject as JSObject: // iterate down the next level
                return childObject[keyPath: remainder]
            default: // not an object, can't go any deeper
                return nil
            }
        }
    }
}
